var chathosturl='https://amorlibre.herokuapp.com/';
if(location.host=="localhost:3000") chathosturl='http://localhost:3000/';
var sala='', primeraconexion=true, sentuid=false;;
function runNibaChat(jQ) {
jQ.getScript("//cdn.socket.io/socket.io-1.3.4.js", function(){
jQ.getScript(chathosturl+"autosize.min.js", function(){
jQ.getScript("//cdnjs.cloudflare.com/ajax/libs/jStorage/0.4.12/jstorage.min.js", function(){
jQ.getScript("//cdnjs.cloudflare.com/ajax/libs/emojify.js/0.9.5/emojify.min.js", function(){
if(jQ.jStorage.get("ban")!=true) {
jQ('head').append('<style>.nc.chatbox { max-height: 100%; max-width: 96%; display: none; margin-top: 0px;  margin-right: 0px;  margin-bottom: 0px;  padding: 0px;  border: 0px;  overflow: hidden;  position: fixed;  z-index: 16000002;  width: 193px;  height: 30px;  right: 10px;  bottom: 0px;  background: transparent;}</style>');
jQ('body').append('<div id="ncchatbox" class="nc chatbox"><iframe id="ncchat" frameborder="0"  style="vertical-align: text-bottom; position: relative; width: 100%; height: 100%; margin: 0px; overflow: hidden; background-color: transparent;"></iframe></div>');
jQ('head').append('<style>.nc.ayudabox { max-height: 100%; max-width: 100%; display: none; height:291px;width:600px; position: fixed;   z-index: 16000003;  margin: auto;  bottom: 0;  left: 0;  top: 0;  right: 0;  background: transparent;}</style>');
jQ('body').append('<div class="nc ayudabox"><iframe id="ncayuda" frameborder="0" style="vertical-align: text-bottom; position: relative; width: 100%; height: 100%; margin: 0px; overflow: hidden; background-color: transparent;"></iframe></div>');

       
  jQ(document).ready(function() {  jQ('#ncchat').on('load', function() {
	var socket = io(chathosturl);
	emojify.setConfig({img_dir : '//www.tortue.me/emoji/'});

var nci=jQ('#ncchat').contents().find('body');
nci.html('<link href="'+chathosturl+'chatbox.css" rel="stylesheet" onload="window.parent.document.getElementById(\'ncchatbox\').style.display=\'block\';">'+
		 '<link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css">'+
		 '<link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/emojify.js/0.9.5/emojify.min.css">'+
		 '<link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/emojify.js/0.9.5/emojify-emoticons.min.css">');
nci.append('<div class="minimizado"><span class="texto">Chat</span><i class="fa fa-weixin fa-inverse fa-lg"></i></div>');
nci.append('<div class="maximizado" style="display: none;">'+
		   '<div class="titulo"><span>Chat</span><i class="fa fa-minus fa-inverse fa-lg"></i><i class="fa fa-question-circle fa-inverse fa-lg"></i> '+
		   '<i class="fa fa-pencil fa-inverse fa-lg"></i><i class="fa fa-rocket fa-inverse fa-lg"></i><i class="fa fa-user fa-inverse fa-lg"></i></div>'+
		   '<div class="chat"><div class="salas"></div><div class="historial"></div><div class="textarea"><form action=""><textarea></textarea></form></div></div>'+
		   '</div>');
		   
  window.onbeforeunload=function() {
  jQ.jStorage.set("historial",nci.find('.maximizado .chat .historial').html());
  }
  if(typeof jQ.jStorage.get("historial")!="undefined") {
  nci.find('.maximizado .chat .historial').html(jQ.jStorage.get("historial"));
  nci.find('.maximizado .chat .historial').append(jQ('<div class="alert sala_">').html('<b>Probablemente haya mensajes perdidos desde que te desonectaste</b>'));
  historialClearfix(true);
  }
  
nci.find('.maximizado .chat .historial').append(jQ('<div class="alert sala_">').text('Conectando...'));
jQ(window).resize(function() {
if(jQ(window).height()<450) {
nci.find('.maximizado .chat .historial').css('height',jQ(window).height()-84);
nci.find('.maximizado .chat .textarea textarea').css('max-height','38px');
} else {
nci.find('.maximizado .chat .historial').css('height','364px');
nci.find('.maximizado .chat .textarea textarea').css('max-height','60px');
}
});
jQ(window).resize();

nci.find('.minimizado').click(function() {
nci.find('.minimizado').hide();
nci.find('.maximizado').show();
jQ('.nc.chatbox').css('width',450).css('height',474);
jQ.jStorage.set("chatopen",true);
if(sentuid==false) {
sentuid=true;
socket.emit('uid', jQ.jStorage.get("uid"));
}
});

if(jQ.jStorage.get("chatopen")==true) { nci.find('.minimizado').click(); }

nci.find('.maximizado .titulo').click(function() {
nci.find('.minimizado').show();
nci.find('.maximizado').hide();
jQ('.nc.chatbox').css('width',180).css('height',30);
jQ.jStorage.set("chatopen",false);
});

nci.find('.maximizado .titulo .fa-question-circle').click(function(e) {
e.stopPropagation();
jQ('.nc.ayudabox').show();
});
nci.find('.maximizado .titulo .fa-pencil').click(function(e) {
e.stopPropagation();
alert('Para cambiar tu nick, escribe /nick [Nick] (Sin corchetes)');
nci.find('.maximizado .chat .textarea textarea').val(
    function(i,val){
        return '/nick ' + val;
    }).focus();
});
nci.find('.maximizado .titulo .fa-rocket').click(function(e) {
e.stopPropagation();
alert('Para unirte a una sala, escribe /unirse [Sala] (Sin corchetes)');
nci.find('.maximizado .chat .textarea textarea').val(
    function(i,val){
        return '/unirse ' + val;
    }).focus();
});
nci.find('.maximizado .titulo .fa-user').click(function(e) {
e.stopPropagation();
alert('Para cambiar tu avatar, escribe /avatar [URL] (Sin corchetes)\nDeberás estar registrado, que se puede hacer con /registrarnick [Contraseña] [Contraseña]');
nci.find('.maximizado .chat .textarea textarea').val(
    function(i,val){
        return '/avatar ' + val;
    }).focus();
});

autosize(nci.find('.maximizado .chat .textarea textarea'));
nci.find('.maximizado .chat .textarea textarea').css('resize','none').css('height','38px');
nci.find('.maximizado .chat .textarea textarea').on('input', function(){
nci.find('.maximizado .chat .textarea textarea').css('resize','none');
if(parseInt(nci.find('.maximizado .chat .textarea textarea')[0].style.height)>45)nci.find('.maximizado .chat .textarea textarea').css('overflow','auto');
nci.find('.maximizado').css('height',414+parseInt(nci.find('.maximizado .chat .textarea textarea').css('height')));
nci.find('.nc.chatbox').css('height',414+parseInt(nci.find('.maximizado .chat .textarea textarea').css('height')));
});




var nca=jQ('#ncayuda').contents().find('body');
nca.html('<link href="'+chathosturl+'ayudabox.css" rel="stylesheet">'+
		 '<link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css">');
nca.append('<div class="ayuda">'+
			'<div class="titulo"><span>Ayuda del chat</span><i class="fa fa-close fa-inverse fa-lg"></i></div>'+
			'<div class="texto"><h3>Estos son los comandos disponibles en el chat. Se escriben sin corchetes</h3><br/><ul>'+
			'<li><i>/me [Acción]</i> - Realiza una acción</li>'+
			'<li><i>/nick</i> - Te informa de tu nick actual</li>'+
			'<li><i>/nick [Nick]</i> - Cambia tu nick en el chat</li>'+
			'<li><i>/sala</i> - Te informa de las salas en las que estás</li>'+
			'<li><i>/sala [Sala]</i> - Te informa de todos los usuarios activos en una sala</li>'+
			'<li><i>/unirse [Sala]</i> - Te añade a una sala</li>'+
			'<li><i>/salir [Sala]</i> - Te elimina de una sala</li>'+
			'<li><i>/susurro [Nick] [Texto]</i> - Envía un mensaje que solo leerá la persona que hayas introducido</li>'+
			'<li><i>/elle [Nick] [Texto]</i> - Realiza una acción a una sola persona, que solo veréis vosotres dos</li>'+
			'<li><i>/login [Contraseña]</i> - Usa un nick registrado al que te hayas intentado conectar ya, introduciendo su contraseña</li>'+
			'<li><i>/login [Nick] [Contraseña]</i> - Usa un nick registrado introduciendo el nick su contraseña</li>'+
			'<li><i>/registrarnick [Contraseña] [Contraseña]</i> - Registra tu nick con una contraseña, para que nadie más pueda usarlo</li>'+
			'<li><i>/avatar [URL]</i> - Cambia tu avatar. Solo aceptados jpg, jpeg, y png. (Solo registrados)</li>'+
			'<li><i>/banear [Nick]</i> - Banea a un usuario (Solo moderadores)</b></li>'+
			'<li><i>/kick [Nick]</i> - Kickea a un usuario (Solo moderadores)</b></li>'+
			'<li><i>/op [Nick]</i> - Otorga poderes de moderador a un nick (Solo moderadores)</b></li>'+
			'<li><i>/deop [Nick]</i> - Quita poderes de moderador de un nick (Solo moderadores)</b></li>'+
			'</ul>'+
			'<br/><h3>La lista de emojis está disponible en <a target="_blank" href="http://www.emoji-cheat-sheet.com/">emoji-cheat-sheet.com</a></h3></div>'+
			'</div>');
nca.find('.titulo .fa-close').click(function(e) {
e.stopPropagation();
jQ('.nc.ayudabox').hide();
});

setTimeout(function() {nca.find('.texto').css('overflow','auto');}, 2000);


  nci.find('.maximizado .chat .textarea textarea').keypress(function(e){
  e = e || event;
  if (e.keyCode === 13) {
	e.preventDefault();
    nci.find('.maximizado .chat .textarea form').submit();
    return false;
  }
  });
  nci.find('.maximizado .chat .textarea form').submit(function(event){
    event.preventDefault();
    socket.emit('msg', {msg: nci.find('.maximizado .chat .textarea textarea').val(), sala:sala});
    nci.find('.maximizado .chat .textarea textarea').val('');
	var evt = document.createEvent('Event');
	evt.initEvent('autosize.update', true, false);
	nci.find('.maximizado .chat .textarea textarea')[0].dispatchEvent(evt);
	nci.find('.maximizado').css('height',414+parseInt(nci.find('.maximizado .chat .textarea textarea').css('height')));
  });
  
	var defaultTitle=jQ(document).attr("title"), chatfocused=false, parentfocused=true;
	jQ(window).focus(function() {
		parentfocused = true;
		jQ(document).attr("title",defaultTitle);
	}).blur(function() {
		parentfocused = false;
	});
	jQ(jQ('#ncchat')[0].contentWindow).focus(function() {
		chatfocused = true;
		jQ(document).attr("title",defaultTitle);
	}).blur(function() {
		chatfocused = false;
	});
	
  function historialClearfix(wasatbottom) {
		if (wasatbottom) {
		nci.find('.maximizado .chat .historial').scrollTop(100000000000000);
		}
		while(nci.find('.maximizado .chat .historial>div').length > 1000){
		nci.find('.maximizado .chat .historial>div').eq(0).remove();
		}
  }
  function cambiarSala(newsala) {
  nci.find('.maximizado .chat .salas .fa-close').remove();
  nci.find('.maximizado .chat .salas .sala[id=sala_'+newsala+']').append('<i class="fa fa-close fa-inverse fa-lg"></i>');
  nci.find('.maximizado .chat .salas .fa-close').click(function() {
    socket.emit('msg', {msg: '/salir '+sala, sala:sala});
  });
  nci.find('.maximizado .chat .historial>div:not(.sala_'+newsala+')').not('.maximizado .chat .historial>div.sala_').hide();
  nci.find('.maximizado .chat .historial>div.sala_'+newsala+', .maximizado .chat .historial>div.sala_').show();
  sala=newsala;
  nci.find('.maximizado .chat .historial').scrollTop(100000000000000);
  }
  function scrolledHistorial() {
  return nci.find('.maximizado .chat .historial').prop('scrollHeight')-nci.find('.maximizado .chat .historial').scrollTop() == nci.find('.maximizado .chat .historial').outerHeight();;
  }
  socket.on('msg', function(msg){
  var wasatbottom=scrolledHistorial();
  if(typeof msg.user == "undefined") {
	if(typeof msg.sala == "undefined")msg.sala="";
	var addedstyle=" style='display:none'";
	if(msg.sala==sala || msg.sala=="")addedstyle="";
    nci.find('.maximizado .chat .historial').append(jQ('<div class="alert sala_'+msg.sala+'"'+addedstyle+'>').text(msg.message));
  if(msg.alertatitulo==true && chatfocused==false && parentfocused==false)jQ(document).attr("title","[Nuevos mensajes] - "+defaultTitle);
	emojify.run(nci.find('.maximizado .chat .historial .alert:last')[0]);
  } else {
	var decoration='';
	if(msg.user.nivel==2)decoration='*';
	if(msg.user.nivel==3)decoration='!';
	
	if(typeof msg.sala == "undefined")msg.sala="";
	var addedstyle=" style='display:none'";
	if(msg.sala==sala || msg.sala=="")addedstyle="";
    nci.find('.maximizado .chat .historial').append(
	jQ('<div class="message sala_'+msg.sala+'"'+addedstyle+'><p class="avatar"><img src="'+msg.user.avatar+'"/></p><p class="decoration">'+decoration+'</p></div>').append('<p class="user">').find('p[class=user]').click(function(e) {
e.stopPropagation();
nci.find('.maximizado .chat .textarea textarea').val(
    function(i,val){
        return '/susurro ' + e.target.innerHTML + ' ' + val;
    }).focus();
}).text(msg.user.nick).parent().append('<p class="message">').find('p[class=message]').text(msg.message).parent()
	);
	
  if(chatfocused==false && parentfocused==false)jQ(document).attr("title","[Nuevos mensajes] - "+defaultTitle);
	emojify.run(nci.find('.maximizado .chat .historial .message:last')[0]);
  }
	historialClearfix(wasatbottom);
  });
  socket.on('unirse', function (salaid){if(salaid!='') {
	if(nci.find('.maximizado .chat .salas').find('div[class=sala][id=sala_'+salaid+']').length==0) {
		nci.find('.maximizado .chat .salas').append(jQ('<div class="sala" id="sala_'+salaid+'">').text(salaid).click(function(){
		cambiarSala(jQ(this).attr('id').replace('sala_',''));
		}));
		if(primeraconexion==true) {setTimeout(function() {
			primeraconexion=false;
			cambiarSala(salaid);
			var wasatbottom=scrolledHistorial();
			nci.find('.maximizado .chat .historial').append(jQ('<div class="alert sala_">').text('Conexión correcta'));
			historialClearfix(wasatbottom);
			}, 1000);
		}
	}
  }});
  socket.on('salir', function (salaid){
    nci.find('.maximizado .chat .salas').find('div[class=sala][id=sala_'+salaid+']').remove();
    var primerasala=nci.find('.maximizado .chat .salas').find('div[class=sala]').first().attr('id').replace('sala_','');
	if(sala==salaid)cambiarSala(primerasala);
  });
  var show_dc_msg=true;
  socket.on('ban', function (moderador){
  var wasatbottom=scrolledHistorial();
  show_dc_msg=false;
  jQ.jStorage.set("ban",true);
  nci.find('.maximizado .chat .historial').append(jQ('<div class="alert sala_">').text('Has sido baneado por '+moderador));
  socket.disconnect();
  historialClearfix(wasatbottom);
  });
  socket.on('kick', function (moderador){
  var wasatbottom=scrolledHistorial();
  show_dc_msg=false;
  nci.find('.maximizado .chat .historial').append(jQ('<div class="alert sala_">').text('Has sido kickeado por '+moderador));
  socket.disconnect();
  historialClearfix(wasatbottom);
  });
  socket.on('disconnect', function (uid){
  var wasatbottom=scrolledHistorial();
  if(show_dc_msg==true) {
  nci.find('.maximizado .chat .historial').append(jQ('<div class="alert sala_">').text('Reconectando...'));
  nci.find('.maximizado .chat .salas').find('div[class=sala]').remove();
  primeraconexion=true;
  sentuid=false;
  historialClearfix(wasatbottom);
  }
  });
  socket.on('newuid', function (uid){
  jQ.jStorage.set("uid",uid);
  }); 
  socket.on('sendmeuid', function (){
  if(sentuid==false && nci.find('.maximizado').css('display')!='none') {
  sentuid=true;
  socket.emit('uid', jQ.jStorage.get("uid"));
  }
  });
 }); });
 jQ('#ncchat').load();

}
});});});});
}

if (typeof jQuery == 'undefined') {
	if (typeof $ == 'function') {
		var thisPageUsingOtherJSLibrary = true;
	}
	function getScript(url, success) {
		var script     = document.createElement('script');
		     script.src = url;
		var head = document.getElementsByTagName('head')[0],
		done = false;
		script.onload = script.onreadystatechange = function() {
			if (!done && (!this.readyState || this.readyState == 'loaded' || this.readyState == 'complete')) {
			done = true;
				success();
				script.onload = script.onreadystatechange = null;
				head.removeChild(script);
			};
		};
		head.appendChild(script);
	};
	getScript('//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js', function() {
	
		if (typeof jQuery=='undefined') {
		alert('Algo ha fallado en el chat');
		} else {			
			if (thisPageUsingOtherJSLibrary) {
				$.noConflict();
				runNibaChat(jQuery);
			} else {
				runNibaChat($);
			}
		}
	});
} else { // jQuery was already loaded
runNibaChat(jQuery);
}

// JSON2
"object"!=typeof JSON&&(JSON={}),function(){"use strict";function f(t){return 10>t?"0"+t:t}function quote(t){return escapable.lastIndex=0,escapable.test(t)?'"'+t.replace(escapable,function(t){var e=meta[t];return"string"==typeof e?e:"\\u"+("0000"+t.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+t+'"'}function str(t,e){var r,n,o,f,u,p=gap,a=e[t];switch(a&&"object"==typeof a&&"function"==typeof a.toJSON&&(a=a.toJSON(t)),"function"==typeof rep&&(a=rep.call(e,t,a)),typeof a){case"string":return quote(a);case"number":return isFinite(a)?a+"":"null";case"boolean":case"null":return a+"";case"object":if(!a)return"null";if(gap+=indent,u=[],"[object Array]"===Object.prototype.toString.apply(a)){for(f=a.length,r=0;f>r;r+=1)u[r]=str(r,a)||"null";return o=0===u.length?"[]":gap?"[\n"+gap+u.join(",\n"+gap)+"\n"+p+"]":"["+u.join(",")+"]",gap=p,o}if(rep&&"object"==typeof rep)for(f=rep.length,r=0;f>r;r+=1)"string"==typeof rep[r]&&(n=rep[r],o=str(n,a),o&&u.push(quote(n)+(gap?": ":":")+o));else for(n in a)Object.prototype.hasOwnProperty.call(a,n)&&(o=str(n,a),o&&u.push(quote(n)+(gap?": ":":")+o));return o=0===u.length?"{}":gap?"{\n"+gap+u.join(",\n"+gap)+"\n"+p+"}":"{"+u.join(",")+"}",gap=p,o}}"function"!=typeof Date.prototype.toJSON&&(Date.prototype.toJSON=function(){return isFinite(this.valueOf())?this.getUTCFullYear()+"-"+f(this.getUTCMonth()+1)+"-"+f(this.getUTCDate())+"T"+f(this.getUTCHours())+":"+f(this.getUTCMinutes())+":"+f(this.getUTCSeconds())+"Z":null},String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(){return this.valueOf()});var cx,escapable,gap,indent,meta,rep;"function"!=typeof JSON.stringify&&(escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,meta={"\b":"\\b","	":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},JSON.stringify=function(t,e,r){var n;if(gap="",indent="","number"==typeof r)for(n=0;r>n;n+=1)indent+=" ";else"string"==typeof r&&(indent=r);if(rep=e,e&&"function"!=typeof e&&("object"!=typeof e||"number"!=typeof e.length))throw Error("JSON.stringify");return str("",{"":t})}),"function"!=typeof JSON.parse&&(cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,JSON.parse=function(text,reviver){function walk(t,e){var r,n,o=t[e];if(o&&"object"==typeof o)for(r in o)Object.prototype.hasOwnProperty.call(o,r)&&(n=walk(o,r),void 0!==n?o[r]=n:delete o[r]);return reviver.call(t,e,o)}var j;if(text+="",cx.lastIndex=0,cx.test(text)&&(text=text.replace(cx,function(t){return"\\u"+("0000"+t.charCodeAt(0).toString(16)).slice(-4)})),/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,"")))return j=eval("("+text+")"),"function"==typeof reviver?walk({"":j},""):j;throw new SyntaxError("JSON.parse")})}();