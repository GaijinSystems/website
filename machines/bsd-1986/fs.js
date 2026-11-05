/* PHOSPHOR-9 terminal: machine "bsd-1986", its system folders.
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE. */
Phosphor.setup(function(P){
  'use strict';
  var SD=P.systemDate,ST=P.st,OWNER=ST.owner;
  function sys(p,type,o){return P.put(p,type,Object.assign({owner:'root',date:SD},o))}
  var UCB=['vi','head','printenv','grep'];
  sys('/bin','d',{owner:'bin'});
  sys('/etc','d');
  sys('/usr','d');
  sys('/usr/ucb','d',{owner:'bin'});
  UCB.forEach(function(b){if(P.paths[b])P.paths[b]='/usr/ucb'});
  Object.keys(P.paths).sort().forEach(function(b){
    var dir=P.paths[b],h=0;for(var i=0;i<b.length;i++)h=(h*31+b.charCodeAt(i))%7919;
    sys(dir+'/'+b,'f',{owner:dir==='/etc'?'root':'bin',bin:true,size:8192+h*3});
  });
  sys('/dev','d');
  sys('/dev/console','c',{mode:'crw--w--w-',dev:[0,0]});
  sys('/dev/tty','c',{mode:'crw-rw-rw-',dev:[2,0]});
  sys('/dev/null','c',{mode:'crw-rw-rw-',dev:[3,2]});
  sys('/dev/kmem','c',{mode:'cr--r-----',dev:[3,1],prot:true});
  sys('/etc/hosts','f',{body:function(){
    var L=['127.0.0.1    localhost '+ST.hostname];
    if(ST.site)L.push('             '+ST.site+'   (somewhere out there)');
    return L;
  }});
  sys('/etc/motd','f',{body:P.profile.welcome});
  sys('/etc/passwd','f',{body:function(){
    var L=['root:VwL97VCAx1Qhs:0:10:The Super User:/:/bin/csh','daemon:*:1:31:The Devil:/:','bin:*:3:7:Binaries:/bin:'];
    if(OWNER!==ST.user)L.push(OWNER+':Zz8qT3mXcE0aU:8:20::/usr/'+OWNER+':/bin/csh');
    L.push(ST.user+'::9:20::/usr/'+ST.user+':/bin/csh');
    return L;
  }});
  sys('/tmp','d',{mode:'drwxrwxrwx'});
  sys('/vmunix','f',{bin:true,size:501862});
  if(OWNER!==ST.user)sys('/usr/'+OWNER,'d',{owner:OWNER,date:P.fileDate,prot:true});
});
