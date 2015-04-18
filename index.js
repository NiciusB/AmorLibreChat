var express = require('express')
var app = express();
var server = app.listen(process.env.PORT || 3000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Chat running at http://%s:%s', host, port)

});
var io = require('socket.io')(server);
var rollbar = require("rollbar");
var mysql = require("mysql");
var pool  = mysql.createPool({
  host            : process.env.MYSQL_HOST || 'host.domain', // El servidor está hosteado en heroku, donde las variables de entorno sí están definidas
  user            : process.env.MYSQL_USER || 'username',
  password        : process.env.MYSQL_PASS || 'password',
  database        : process.env.MYSQL_DATABASE || 'database'
});
pool.query('SELECT 1 FROM bans', function(err, rows, fields) {
if(err!=null) {
console.log('No mysql');
process.exit(1);
}
});
var http = require('http');
var fileType = require('file-type');
rollbar.init("6a4e74d27f0b4984acecc083b9a858f1");

// Server
app.use(express.static('public'));
app.use(rollbar.errorHandler('6a4e74d27f0b4984acecc083b9a858f1'));

require('nodetime').profile({
    accountKey: '7c9cf377bf14a84e1a26b315c2ab68da1037efd1', 
    appName: 'Amor libre chat'
  });

var comandos = require("./comandos.js");
var dced=[];
io.on('connection', function(socket){
  socket.on('msg', function(recieved){ var msg=recieved.msg.replace(/\s+/g,' '); var sala=recieved.sala;
  if(typeof socket.udata != "undefined") {
	if(socket.udata.salas.indexOf(sala)==-1) {
	socket.emit('msg',{message:'No estás en la sala a la que intentas enviar el mensaje'});
	} else {
		if(msg[0]!="/") {
			if(msg!="") {
				var nivel=1;
				if(socket.udata.registrado==true)	nivel=2;
				if(socket.udata.moderador==true)	nivel=3;
				io.to(sala).emit('msg', {user:{nick:socket.udata.nick, nivel: nivel, avatar:socket.udata.avatar}, message: msg, sala: sala});
			}
		} else {
		comandos.analizarComando(rollbar, msg, sala, dced, socket, io, pool, http, fileType);
		}
	}
  }
  });

  socket.on('disconnect', function(){
  if(typeof socket.udata!="undefined") {
  dced.push({id: socket.id, udata: socket.udata, reconnected: false});
    setTimeout(function (dcedid) {
		 	for(key in dced) {
			if (dced[key].id==dcedid && typeof dced[key].udata!="undefined"){
			if(dced[key].reconnected==false) {
				var stillthere=false;
				for(socketkey in io.sockets.connected) {
				if(typeof io.sockets.connected[socketkey].udata!="undefined" && io.sockets.connected[socketkey].udata.nick==dced[key].udata.nick) {stillthere=true; break;}
				}
				if(stillthere==false) {
					for(salakey in dced[key].udata.salas) {
					io.to(dced[key].udata.salas[salakey]).emit('msg', {message:dced[key].udata.nick+ ' se ha desconectado (no responde)',sala:dced[key].udata.salas[salakey]});
					}
				}
			}
			dced.splice(key, 1);
			break;
			}
			}
    }, 60000, socket.id); // time to dc: 1 minute
  }
  });
  
  
  socket.on('uid', function(newid){ // new chat loaded
pool.query('SELECT time FROM bans WHERE ip=INET_ATON('+pool.escape(socket.request.connection.remoteAddress)+')', function(err, rows, fields) {
  if(rows.length>0) {
  if(Math.floor(Date.now() / 1000)-rows[0].time>60*60*24*7) {
		pool.query('DELETE FROM bans WHERE ip=INET_ATON('+pool.escape(socket.request.connection.remoteAddress)+')');
		delete rows[0];
  }
  }
  if(rows.length>0) {
  socket.emit('ban','hack');
  } else {
			socket.emit('newuid',socket.id);
	if(typeof newid == "string" && newid!="") {
			var found_in_dced=false;
			for(key in dced) {
			if (dced[key].id==newid){ socket.udata=dced[key].udata; dced[key].reconnected=true; found_in_dced=true; break; }
			}
			if(found_in_dced==false && typeof io.sockets.connected[newid]!="undefined") {
			socket.udata=io.sockets.connected[newid].udata;
			}
	} 
	if(typeof socket.udata == "undefined") {
			socket.udata={};
			socket.udata.salas=['general'];
			socket.join('general');
			socket.udata.nick='Anon';
			socket.udata.moderador=false;
			for(var e=0;e<10;e++) {socket.udata.nick+=Math.floor(Math.random()*9+1);}
			socket.udata.registrado=false;
			socket.udata.avatar='https://www.gravatar.com/avatar?d=mm';
			io.to('general').emit('msg',{message:socket.udata.nick+' se ha unido a la sala',sala:'general'});
			socket.emit('unirse','general');
			socket.emit('msg',{message:'¡Bienvenido! Usa en icono del lápiz para cambiar tu nombre, y descubre el resto de comandos en el icono de la pregunta'});
	} else {
			for(salakey in socket.udata.salas) {
			socket.join(socket.udata.salas[salakey]);
			socket.emit('unirse',socket.udata.salas[salakey]);
			}
	}
  }
});
  });
  
  socket.emit('sendmeuid');
});