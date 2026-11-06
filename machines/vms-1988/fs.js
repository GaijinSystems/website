/* PHOSPHOR-9 terminal: machine "vms-1988", disk DUA0:. Files have versions: NAME.TYP;n.
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE. */
Phosphor.setup(function(P){
  'use strict';
  var SD=P.systemDate;
  function d(p){P.put(p,'d',{owner:'system',date:SD})}
  function f(p,body){P.put(p,'f',{owner:'system',date:SD,body:body})}
  function exe(p,size,date){P.put(p,'f',{owner:'system',date:date||SD,bin:true,size:size})}
  ['/sys0','/sys0/sysexe','/sys0/syshlp','/sys0/sysmgr','/field','/system'].forEach(d);
  exe('/sys0/sysexe/sys.exe;1',1048576);
  exe('/sys0/sysexe/dcl.exe;1',175104);
  exe('/sys0/sysexe/edt.exe;1',276480);
  d('/games');
  function monsterDate(){ /* posted 30 Nov 1988: that day, or last week if the machine's calendar hasn't reached it */
    var posted=new Date(1988,10,30,12,0,0),n=P.now();
    return n>=posted?posted:new Date(n.getTime()-7*864e5);
  }
  [['moria',409600],['monster',286720],['conquest',180224],['adventure',132096],['empire',97792],['startrek',52736]].forEach(function(g){
    exe('/games/'+g[0]+'.exe;1',g[1],g[0]==='monster'&&monsterDate());
  });
  f('/sys0/sysmgr/systartup.com;1',['$ ! Site-specific startup','$ SET LOGINS /INTERACTIVE=64','$ MOUNT/SYSTEM DUA1: USERDISK','$ ! FIELD still has its default password. Ask DIGITAL to change it.','$ EXIT']);
  f('/guest/login.com;2',['$ ! Your login file','$ SET PROMPT="$ "','$ SET TERMINAL/INQUIRE','$ ! Games are in [GAMES]. Not during prime shift.','$ ADVENTURE :== $DUA0:[GAMES]ADVENTURE','$ STARTREK :== $DUA0:[GAMES]STARTREK','$ EMPIRE :== $DUA0:[GAMES]EMPIRE','$ MORIA :== $DUA0:[GAMES]MORIA','$ EXIT']);
  f('/guest/login.com;1',['$ ! Your first login file','$ EXIT']);
  if(P.saved('empire/save'))P.put('/guest/empsave.dat;1','f',{owner:'guest',date:SD,bin:true,size:30720,store:'empire/save'}); /* a saved EMPIRE: DELETE it to start again */
});
