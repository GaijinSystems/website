/* PHOSPHOR-9 terminal: machine "vms-1987", disk DUA0:. Files have versions: NAME.TYP;n.
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE. */
Phosphor.setup(function(P){
  'use strict';
  var SD=P.systemDate;
  function d(p){P.put(p,'d',{owner:'system',date:SD})}
  function f(p,body){P.put(p,'f',{owner:'system',date:SD,body:body})}
  ['/sys0','/sys0/sysexe','/sys0/syshlp','/sys0/sysmgr','/field','/system'].forEach(d);
  P.put('/sys0/sysexe/vms.exe;1','f',{owner:'system',date:SD,bin:true,size:1048576});
  P.put('/sys0/sysexe/dcl.exe;1','f',{owner:'system',date:SD,bin:true,size:175104});
  P.put('/sys0/sysexe/edt.exe;1','f',{owner:'system',date:SD,bin:true,size:276480});
  d('/games');
  [['moria',409600],['monster',286720],['conquest',180224],['adventure',132096],['empire',97792],['startrek',52736]].forEach(function(g){
    P.put('/games/'+g[0]+'.exe;1','f',{owner:'system',date:SD,bin:true,size:g[1]});
  });
  f('/sys0/sysmgr/systartup.com;1',['$ ! Site-specific startup','$ SET LOGINS /INTERACTIVE=64','$ MOUNT/SYSTEM DUA1: USERDISK','$ ! FIELD still has its default password. Ask DIGITAL to change it.','$ EXIT']);
  f('/guest/login.com;2',['$ ! Your login file','$ SET PROMPT="$ "','$ SET TERMINAL/INQUIRE','$ ! Games are in [GAMES]. Not during prime shift.','$ EXIT']);
  f('/guest/login.com;1',['$ ! Your first login file','$ EXIT']);
});
