 function changeNick(socket, newnick, currentsala, registrado, moderador, avatar) {
 								socket.emit('msg',{message:'Te has cambiado el nick correctamente!', sala:currentsala});
								for(salakey in socket.udata.salas) {
								socket.broadcast.to(socket.udata.salas[salakey]).emit('msg',{message: socket.udata.nick+' se ha cambiado el nick a '+newnick,sala:socket.udata.salas[salakey]});
								}
								socket.udata.nick=newnick;
								socket.udata.registrado=registrado;
								socket.udata.moderador=moderador;
								socket.udata.avatar=avatar;
 }
 function isNickAvaliable(io, dced, nick) {
 					var estalibre=true;
					var clients = io.sockets.connected;
					for(key in clients) {
							if(typeof clients[key].udata!="undefined" && clients[key].udata.nick.toLowerCase()==nick.toLowerCase()){estalibre=false;break;}
					}
					for(key in dced) {
							if(typeof dced[key].udata!="undefined" && dced[key].udata.nick.toLowerCase()==nick.toLowerCase()){estalibre=false;break;}
					}
					return estalibre;
 }
 module.exports = {
  analizarComando: function (rollbar, msg, currentsala, dced, socket, io, pool, http, fileType) {
try {
    msg = msg.substr(1);
	var command=msg.split(' ')[0];
	msg=msg.substr(command.length+1);
	switch(command) {
	default:
			socket.emit('msg',{message:'Comando no encontrado'});	
	break;
	case 'me':
			var me=msg;
			if(me=="") {
					socket.emit('msg',{message:'Tu nick es '+socket.udata.nick, sala:currentsala});
			} else {
					io.to(currentsala).emit('msg',{message:'* '+socket.udata.nick+' '+me+' *', sala:currentsala});
			}
	break;
	case 'nick':
			var nick=msg;
			if(nick=="") {
					socket.emit('msg',{message: 'Tu nick es '+socket.udata.nick, sala:currentsala});
			} else {
				if(/^(\w){1,15}$/.test(nick)==true){
					if(isNickAvaliable(io, dced, nick)==true) {
							pool.query('SELECT 1 FROM nicks WHERE nick='+pool.escape(nick), function(err, rows, fields) {
								if(rows.length==0) {
								changeNick(socket, nick, currentsala, false, false, 'https://www.gravatar.com/avatar?d=mm');
								} else {
								socket.emit('msg',{message:'Este nick está registrado! Escribe /login [Contraseña] para conectarte', sala:currentsala});	
								socket.udata.waiting_login=nick;
								}
							});
					} else {
							socket.emit('msg',{message:'Ese nick ya está en uso!', sala:currentsala});			
					}
				} else {
						socket.emit('msg',{message:'Solo puedes usar 15 letras, números, o _', sala:currentsala});			
				}
			}
	break;
	case 'sala':
			var sala=msg.toLowerCase();
			if(sala=="") {
					var cirtext='Estás en las salas: ';
					for(salakey in socket.udata.salas) {
						cirtext+=socket.udata.salas[salakey]+', ';
					}
					cirtext=cirtext.slice(0, -2);
					socket.emit('msg',{message:cirtext, sala:currentsala});
			} else {
					var clientsinroom=io.nsps['/'].adapter.rooms[sala];
					if(typeof clientsinroom!="undefined" && Object.keys(clientsinroom).length>0) {
					var cirtext='Usuarios en la sala '+sala+': ';
					var alreadynicks=[];
					for(key in clientsinroom) {
					if(typeof io.sockets.connected[key]!="undefined" && typeof io.sockets.connected[key].udata!="undefined" && alreadynicks.indexOf(io.sockets.connected[key].udata.nick)==-1) {
							cirtext+=io.sockets.connected[key].udata.nick+', ';
							alreadynicks.push(io.sockets.connected[key].udata.nick);
					}
					}
					for(key in dced) {
					if(alreadynicks.indexOf(dced[key].udata.nick)==-1) {
						if(dced[key].udata.salas.indexOf(sala)!=-1){
							cirtext+=dced[key].udata.nick+', ';
							alreadynicks.push(dced[key].udata.nick);
						}
					}
					}
					delete alreadynicks;
					cirtext=cirtext.slice(0, -2);
					} else {
					var cirtext='No hay nadie en la sala '+sala;
					}
					socket.emit('msg',{message:cirtext});
			}
	break;
	case 'unirse':
			var sala=msg.toLowerCase();
			if(sala=="") {
					socket.emit('msg',{message:'Escribe el nombre de la sala a la que te quieras unir', sala:currentsala});
			} else {
			if(/^(\w){1,30}$/.test(sala)==true){
					if(socket.udata.salas.indexOf(sala)!=-1) {
							socket.emit('msg',{message:'Ya estás en esa sala', sala:currentsala});
					} else {
							socket.udata.salas.push(sala);
							socket.join(sala);
							socket.emit('msg',{message:'Te has unido a la sala '+sala});
							socket.emit('unirse',sala);
							socket.broadcast.to(sala).emit('msg',{message:socket.udata.nick+' se ha unido a la sala ',sala:sala});
					}
			} else {
					socket.emit('msg',{message:'Solo puedes usar 30 letras, números, o _', sala:currentsala});			
			}
			}
	break;
	case 'salir':
			var sala=msg.toLowerCase();
			if(sala=="") {
					socket.emit('msg',{message:'Escribe el nombre de la sala de la que quieras salir', sala:currentsala});
			} else {
			if(/^(\w){1,30}$/.test(sala)==true){
				if(socket.udata.salas.length>1) {
					if(socket.udata.salas.indexOf(sala)==-1) {
							socket.emit('msg',{message:'No estás en esa sala', sala:currentsala});
					} else {
							var index=socket.udata.salas.indexOf(sala);
							if (index > -1) {
								socket.udata.salas.splice(index, 1);
							}
							socket.leave(sala);
							socket.emit('msg',{message:'Has salido de la sala '+sala});
							socket.emit('salir',sala);
							socket.broadcast.to(sala).emit('msg',{message:socket.udata.nick+' ha salido de la sala ',sala:sala});
					}
				} else {
						socket.emit('msg',{message:'No puedes abandonar tu última sala'});
				}
			} else {
					socket.emit('msg',{message:'Solo puedes usar 30 letras, números, o _', sala:currentsala});			
			}
			}
	break;
	case 'susurro':
			var nick=msg.split(' ')[0];
			if(nick!=socket.udata.nick) {
			var susurro=msg.substr(nick.length+1);
				var clients = io.sockets.connected;
				var nickencontrado=false;
				for(key in clients) {
						if(typeof io.sockets.connected[key]!="undefined" && typeof clients[key].udata!="undefined" && clients[key].udata.nick.toLowerCase()==nick.toLowerCase()) { nickencontrado=key; break;	}
				}
				if(nickencontrado==false) {
						socket.emit('msg',{message:'No se ha encontrado ese nick',sala:currentsala});		
				} else {
						socket.emit('msg',{message:'(Para '+clients[nickencontrado].udata.nick+'): '+susurro});
						io.to(clients[nickencontrado].id).emit('msg',{message:'(De '+socket.udata.nick+'): '+susurro, alertatitulo:true});
				}
			} else {
					socket.emit('msg',{message:'Te piensas susurrar a ti mismo?',sala:currentsala});	
			}
	break;
	case 'elle':
			var nick=msg.split(' ')[0];
			if(nick!=socket.udata.nick) {
			var susurro=msg.substr(nick.length+1);
				var clients = io.sockets.connected;
				var nickencontrado=false;
				for(key in clients) {
						if(typeof io.sockets.connected[key]!="undefined" && typeof clients[key].udata!="undefined" && clients[key].udata.nick.toLowerCase()==nick.toLowerCase()) { nickencontrado=key; break;	}
				}
				if(nickencontrado==false) {
						socket.emit('msg',{message:'No se ha encontrado ese nick',sala:currentsala});		
				} else {
						socket.emit('msg',{message:'*'+socket.udata.nick+' '+susurro+' a '+clients[nickencontrado].udata.nick+'*'});
						io.to(clients[nickencontrado].id).emit('msg',{message:'*'+socket.udata.nick+' '+susurro+' a '+clients[nickencontrado].udata.nick+'*', alertatitulo:true});
				}
			} else {
					socket.emit('msg',{message:'Te piensas susurrar a ti mismo?',sala:currentsala});	
			}
	break;
	case 'login':
			var primer_parametro=msg.split(' ')[0];
			var segundo_parametro=msg.substr(primer_parametro.length+1);
			if(segundo_parametro!="") {
					if(isNickAvaliable(io, dced, primer_parametro)==true) {
						pool.query('SELECT avatar FROM nicks WHERE pass=sha1('+pool.escape(segundo_parametro)+') AND nick='+pool.escape(primer_parametro), function(err, rows, fields) {
						if(rows.length>=1) {
						var newnick=primer_parametro;
						pool.query('SELECT 1 FROM moderadores WHERE nick='+pool.escape(newnick), function(err, moderadorrows, fields) {
						var moderador=false;
						if(moderadorrows.length>0)moderador=true;
						changeNick(socket, newnick, currentsala, true, moderador, rows[0].avatar);
						});						
						} else {
						socket.emit('msg',{message:'Contraseña incorrecta',sala:currentsala});
						}
						});
					} else {
							socket.emit('msg',{message:'Ese nick ya está en uso!',sala:currentsala});			
					}
			} else {
				if(typeof socket.udata.waiting_login == "undefined") {
						socket.emit('msg',{message:'No tienes un nick pendiente al que conectarte',sala:currentsala});	
				} else {
						if(isNickAvaliable(io, dced, socket.udata.waiting_login)==true) {
							pool.query('SELECT avatar FROM nicks WHERE pass=sha1('+pool.escape(primer_parametro)+') AND nick='+pool.escape(socket.udata.waiting_login), function(err, rows, fields) {
							if(rows.length>=1) {
							var newnick=socket.udata.waiting_login;
							pool.query('SELECT 1 FROM moderadores WHERE nick='+pool.escape(newnick), function(err, moderadorrows, fields) {
							var moderador=false;
							if(moderadorrows.length>0)moderador=true;
							changeNick(socket, newnick, currentsala, true, moderador, rows[0].avatar);
							delete socket.udata.waiting_login;
							});						
							} else {
							socket.emit('msg',{message:'Contraseña incorrecta',sala:currentsala});
							}
							});
						} else {
								socket.emit('msg',{message:'Ese nick ya está en uso!',sala:currentsala});			
						}
				}
			}
	break;
	case 'registrarnick':
			var primera_pass=msg.split(' ')[0];
			var segunda_pass=msg.substr(primera_pass.length+1);
			if(primera_pass!=segunda_pass) {
					socket.emit('msg',{message:'Las contraseñas no coinciden',sala:currentsala});		
			} else {
			if(primera_pass.length<5 || primera_pass.length>50) {
			socket.emit('msg',{message:'La contraseña no puede ser menor de 5 caracteres, ni mayor de 50',sala:currentsala});
			} else {
pool.query('SELECT 1 FROM nicks WHERE nick='+pool.escape(socket.udata.nick), function(err, rows, fields) {
					if(rows.length>=1) {
					socket.emit('msg',{message:'Este nick ya está registrado',sala:currentsala});
					} else {
pool.query('INSERT INTO nicks (nick, pass) VALUES ('+pool.escape(socket.udata.nick)+',sha1('+pool.escape(primera_pass)+'))');
					socket.emit('msg',{message:'Has registrado este nick con la contraseña '+primera_pass});
					socket.udata.registrado=true;
					socket.udata.moderador=false;
					}
});
			}
			}
	break;
	case 'avatar':
			var avatar=msg.replace('https://','http://');;
			if(socket.udata.registrado==false) {
			socket.emit('msg',{message:'Debes estar registrado para cambiar tu avatar',sala:currentsala});
			} else {
			if(/(http:\/\/.*\.(?:jpg|jpeg|png))/i.test(avatar)==true) {
			http.get(avatar, function (res) {
				res.once('data', function (chunk) {
					res.destroy();
					var ftc=fileType(chunk);
								if(typeof ftc!="undefined" && ftc!=null && (ftc.ext=='jpg' || ftc.ext=='jpeg' || ftc.ext=='png')) {
								pool.query('UPDATE nicks SET avatar='+pool.escape(avatar)+' WHERE nick='+pool.escape(socket.udata.nick));
								socket.udata.avatar=avatar;
								socket.emit('msg',{message:'Te has cambiado el avatar'});
								} else {
								socket.emit('msg',{message:'El url no coincide con el tipo de archivo que encontramos!',sala:currentsala});
								}
				});
			});
			} else {
			socket.emit('msg',{message:'El url introducido no es válido. Solo se aceptan los formatos jpg, jpeg, y png',sala:currentsala});
			}
			}
	break;
	case 'banear':
			var nick=msg;
			if(socket.udata.moderador==false) {
			socket.emit('msg',{message:'No eres moderador',sala:currentsala});
			} else {
					var clients = io.sockets.connected;
					var userfound=false;
					for(key in clients) {
							if(typeof clients[key].udata!="undefined" && clients[key].udata.nick.toLowerCase()==nick.toLowerCase()){userfound=clients[key];break;}
					}
			if(typeof userfound.id!="undefined") {
pool.query('INSERT INTO bans (ip, time) VALUES (INET_ATON('+pool.escape(clients[userfound].request.connection.remoteAddress)+'),'+pool.escape(Math.floor(Date.now() / 1000))+')');
			socket.emit('msg',{message:'El usuario '+nick+' ha sido baneado'});
			io.to(userfound).emit('ban',socket.udata.nick);
			userfound.disconnect();
			} else {
			socket.emit('msg',{message:'El usuario '+nick+' no existe',sala:currentsala});
			}
			}
	break;
	case 'kick':
			var nick=msg;
			if(socket.udata.moderador==false) {
			socket.emit('msg',{message:'No eres moderador',sala:currentsala});
			} else {
					var clients = io.sockets.connected;
					var userfound=false;
					for(key in clients) {
							if(typeof clients[key].udata!="undefined" && clients[key].udata.nick.toLowerCase()==nick.toLowerCase()){userfound=clients[key];break;}
					}
			if(typeof userfound.id!="undefined") {
			socket.emit('msg',{message:'El usuario '+nick+' ha sido kickeado'});
			io.to(userfound.id).emit('kick',socket.udata.nick);
			userfound.disconnect();
			} else {
			socket.emit('msg',{message:'El usuario '+nick+' no existe',sala:currentsala});
			}
			}
	break;
	case 'op':
			var nick=msg;
			if(socket.udata.moderador==false) {
			socket.emit('msg',{message:'No eres moderador',sala:currentsala});
			} else {
pool.query('SELECT 1 FROM nicks WHERE nick='+pool.escape(nick), function(err, rows, fields) {
					if(rows.length>=1) {
			pool.query('INSERT INTO moderadores (nick) VALUES ('+pool.escape(nick)+')');
			socket.emit('msg',{message:'El usuario '+nick+' es ahora moderador'});
			
			var clients = io.sockets.connected;
			var userfound=false;
			for(key in clients) {
					if(typeof clients[key].udata!="undefined" && clients[key].udata.nick.toLowerCase()==nick.toLowerCase()){userfound=clients[key];break;}
			}
			if(typeof userfound.id!="undefined") {			userfound.udata.moderador=true;			}
			
					} else {
			socket.emit('msg',{message:'Este nick no está registrado, y no se le puede dar permisos de moderador',sala:currentsala});
					}
});
			}
	break;
	case 'deop':
			var nick=msg;
			if(socket.udata.moderador==false) {
			socket.emit('msg',{message:'No eres moderador',sala:currentsala});
			} else {
pool.query('DELETE FROM moderadores WHERE nick='+pool.escape(nick));
			socket.emit('msg',{message:'El usuario '+nick+' ya no es moderador'});
						
			var clients = io.sockets.connected;
			var userfound=false;
			for(key in clients) {
					if(typeof clients[key].udata!="undefined" && clients[key].udata.nick.toLowerCase()==nick.toLowerCase()){userfound=clients[key];break;}
			}
			if(typeof userfound.id!="undefined") {			userfound.udata.moderador=false;			}
			
		
			}
	break;
	}
} catch (e) {
  rollbar.handleError(e, msg);
}
  }
};