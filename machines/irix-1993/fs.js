/* PHOSPHOR-9 terminal: machine "irix-1993", its system folders.
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE. */
Phosphor.setup(function(P){
  'use strict';
  var SD=P.systemDate,ST=P.st,OWNER=ST.owner;
  P.env.PATH='.:/usr/sbin:/usr/bsd:/bin:/usr/bin:/etc:/usr/etc:/usr/demos/bin';
  P.env.TERM='p9';
  function sys(p,type,o){return P.put(p,type,Object.assign({owner:'root',date:SD},o))}
  var WHERE={vi:'/usr/bin',head:'/usr/bsd',printenv:'/usr/bsd',whoami:'/usr/bsd',uptime:'/usr/bsd',clear:'/usr/bsd',
    finger:'/usr/bsd',w:'/usr/bsd',hostname:'/usr/bsd',ifconfig:'/usr/etc',ping:'/usr/etc',dmesg:'/etc'};
  ['/bin','/etc','/usr','/usr/bin','/usr/bsd','/usr/etc','/usr/demos','/usr/demos/bin','/usr/people','/tmp','/dev'].forEach(function(d){sys(d,'d',d==='/tmp'?{mode:'drwxrwxrwx'}:{})});
  Object.keys(WHERE).forEach(function(b){if(P.cmds[b])P.paths[b]=WHERE[b]});
  Object.keys(P.paths).sort().forEach(function(b){
    var dir=P.paths[b],h=0;for(var i=0;i<b.length;i++)h=(h*31+b.charCodeAt(i))%7919;
    sys(dir+'/'+b,'f',{bin:true,size:40960+h*7});
  });
  ['flight','buttonfly','dog','ideas','arena','newave','insect'].forEach(function(b){sys('/usr/demos/bin/'+b,'f',{bin:true,size:262144+b.length*4099})});
  sys('/unix','f',{bin:true,size:3408012});
  sys('/etc/rc.old','f',{body:['# old rc, kept in case the new one fails','/etc/update','# reminder: root is nedry until the auditors have gone','/etc/cron']});
  sys('/dev/null','c',{mode:'crw-rw-rw-',dev:[3,2]});
  sys('/dev/console','c',{mode:'crw--w--w-',dev:[0,0]});
  sys('/etc/motd','f',{body:P.profile.welcome});
  sys('/etc/hosts','f',{body:function(){return ['127.0.0.1    localhost','192.48.153.20 '+ST.hostname]}});
  sys('/etc/passwd','f',{body:function(){
    return ['root::0:0:Super-User:/:/bin/csh','guest::998:998:Guest Account:/usr/people/guest:/bin/csh','4Dgifts:*:999:998:4Dgifts Account:/usr/people/4Dgifts:/bin/csh','demos:*:993:997:Demonstration User:/usr/demos:/bin/csh',
      OWNER+':Zz8qT3mXcE0aU:100:20::/usr/people/'+OWNER+':/bin/csh'];
  }});
  sys('/usr/people/4Dgifts','d',{owner:'4Dgifts'});
  P.put('/usr/people/4Dgifts/README','f',{owner:'4Dgifts',date:SD,body:['Example programs for the IRIS. Look around.']});
  P.put('/usr/people/4Dgifts/examples','d',{owner:'4Dgifts',date:SD});
  P.put('/usr/people/4Dgifts/examples/hello.c','f',{owner:'4Dgifts',date:SD,body:['#include <gl/gl.h>','','main()','{','    prefsize(400, 400);','    winopen("hello");','    color(BLUE);','    clear();','    sleep(5);','}']});
  sys('/usr/people/'+OWNER,'d',{owner:OWNER,date:P.fileDate,prot:true});
});
