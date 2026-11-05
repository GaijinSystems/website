/* PHOSPHOR-9 terminal: machine "v7-1979", its system folders (/bin, /dev, /etc, /usr ...).
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE.
   Runs once at start, before the site's home files are added. */
Phosphor.setup(function(P){
  'use strict';
  var SD=P.systemDate,ST=P.st,OWNER=ST.owner;
  function sys(p,type,o){return P.put(p,type,Object.assign({owner:'root',date:SD},o))}

  sys('/bin','d',{owner:'bin'});
  sys('/etc','d');
  Object.keys(P.paths).sort().forEach(function(b){ /* a program file for each command that has a path */
    var dir=P.paths[b],h=0;for(var i=0;i<b.length;i++)h=(h*31+b.charCodeAt(i))%7919;
    sys(dir+'/'+b,'f',{owner:dir==='/bin'?'bin':'root',bin:true,size:2048+h});
  });
  sys('/dev','d');
  sys('/dev/console','c',{mode:'crw--w--w-',dev:[0,0]});
  sys('/dev/tty0','c',{mode:'crw--w--w-',dev:[1,0]});
  sys('/dev/null','c',{mode:'crw-rw-rw-',dev:[8,2]});
  sys('/dev/mem','c',{mode:'cr--r-----',dev:[8,0],prot:true});
  sys('/dev/kmem','c',{mode:'cr--r-----',dev:[8,1],prot:true});
  sys('/etc/hosts','f',{body:function(){
    var L=['127.0.0.1    localhost '+ST.hostname];
    if(ST.site)L.push('             '+ST.site+'   (somewhere out there)');
    return L;
  }});
  sys('/etc/motd','f',{body:P.profile.welcome});
  sys('/etc/passwd','f',{body:function(){
    var L=['root:VwL97VCAx1Qhs:0:1:the super-user:/:','daemon:x:1:1::/:','bin:x:3:3::/bin:'];
    if(OWNER!==ST.user)L.push(OWNER+':Zz8qT3mXcE0aU:8:2::/usr/'+OWNER+':');
    L.push(ST.user+'::9:2::/usr/'+ST.user+':');
    return L;
  }});
  sys('/etc/rc.old','f',{body:[': old rc, kept in case the new one fails','/etc/update',': reminder: root is p1green until the auditors have gone','/etc/cron']});
  sys('/usr/src/v6/ken/slp.c','f',{body:[
    '/* the old system, kept for reference. from swtch() in the sixth edition. */',
    '	/*',
    '	 * If the new process paused because it was',
    '	 * swapped out, set the stack level to the last call',
    '	 * to savu(u_ssav).  This means that the return',
    '	 * which is executed immediately after the call to aretu',
    '	 * actually returns from the last routine which did',
    '	 * the savu.',
    '	 *',
    '	 * You are not expected to understand this.',
    '	 */']});
  P.env.PATH=':/bin:/usr/bin:/usr/games';
  var GAMES={arithmetic:5802,backgammon:14148,banner:2840,bcd:2582,bj:1562,checkers:26614,chess:19036,ching:145,cubic:2450,fortune:4536,hangman:7500,maze:9350,moo:624,ppt:2900,quiz:6306,reversi:9320,ttt:2192,words:69,words1:1202,wump:5184};
  sys('/usr/games','d',{owner:'bin'});
  Object.keys(GAMES).forEach(function(g){sys('/usr/games/'+g,'f',{owner:'bin',bin:true,size:GAMES[g]})});
  ['ching.d','quiz.k','lib'].forEach(function(d){sys('/usr/games/'+d,'d',{owner:'bin',prot:true})});
  sys('/usr/games/ttt.k','f',{owner:'bin',mode:'-rw-------',prot:true,size:278});
  sys('/tmp','d',{mode:'drwxrwxrwx'});
  sys('/unix','f',{bin:true,size:51862});
  sys('/usr','d');
  if(OWNER!==ST.user)sys('/usr/'+OWNER,'d',{owner:OWNER,date:P.fileDate,prot:true}); /* the owner's own folder: locked */
});
