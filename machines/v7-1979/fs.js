/* PHOSPHOR-9 terminal: machine "v7-1979", its system folders (/bin, /dev, /etc, /usr ...).
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE.
   Runs once at start, before the site's home files are added. */
Phosphor.setup(function(P){
  'use strict';
  var SD=P.systemDate,ST=P.st,OWNER=ST.owner;
  function sys(p,type,o){var x={owner:'root',date:SD};if(o)for(var k in o)x[k]=o[k];return P.put(p,type,x)}

  sys('/bin','d',{owner:'bin'});
  sys('/etc','d');
  Object.keys(P.paths).sort().forEach(function(b){ /* a program file for each command that has a path */
    var dir=P.paths[b],h=0;for(var i=0;i<b.length;i++)h=(h*31+b.charCodeAt(i))%7919;
    sys(dir+'/'+b,'f',{owner:dir==='/bin'?'bin':'root',bin:true,size:2048+h});
  });
  sys('/dev','d');
  sys('/dev/console','c',{mode:'crw--w--w-',dev:[0,0]});
  sys('/dev/tty0','c',{mode:'crw--w--w-',dev:[1,0]});
  sys('/dev/null','c',{mode:'crw-rw-rw-',dev:[3,2]});
  sys('/dev/mem','c',{mode:'cr--r-----',dev:[3,0],prot:true});
  sys('/dev/kmem','c',{mode:'cr--r-----',dev:[3,1],prot:true});
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
  sys('/tmp','d',{mode:'drwxrwxrwx'});
  sys('/unix','f',{bin:true,size:51862});
  sys('/usr','d');
  if(OWNER!==ST.user)sys('/usr/'+OWNER,'d',{owner:OWNER,date:P.fileDate,prot:true}); /* the owner's own folder: locked */
});
