/* PHOSPHOR-9 terminal: machine "tops20-1986", structure PS:. Files have generations: NAME.TYP.n,
   and <DIR.SUB> is the folder /dir/sub. The names in <GAMES> are the ones a real DEC-20 site of the
   time kept there (SRI-NIC's, as its tapes show); those with no program behind them refuse in prime time.
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE. */
Phosphor.setup(function(P){
  'use strict';
  var SD=P.systemDate;
  function d(p,o){P.put(p,'d',Object.assign({owner:'operator',date:SD},o||{}))}
  function f(p,body,o){P.put(p,'f',Object.assign({owner:'operator',date:SD,body:body},o||{}))}
  function exe(p,pages,o){P.put(p,'f',Object.assign({owner:'operator',date:SD,bin:true,size:pages*2560},o||{}))}
  ['/subsys','/games','/system','/help','/operator','/mail','/documentation'].forEach(function(p){d(p)});
  P.find('/operator',true).prot=true;
  exe('/system/monitr.exe.1',412,{prot:true});
  exe('/system/exec.exe.1',152);
  f('/system/6-1-config.cmd.1',['TERMINAL 12 SPEED 9600','ENABLE LOGINS'],{prot:true});
  f('/system/monnam.txt.1',['DEC20, TOPS-20 Monitor 6.1(7030)']);
  f('/system/login.cmd.1',['DEFINE GAMES: PS:<GAMES>','DEFINE HLP: PS:<HELP>']);
  [['mm',236],['finger',18],['kermit',61],['emacs',164],['edit',39],['macro',88],['link',97],['fortra',212],['pascal',143],['dumper',31],['filcom',12],['sysdpy',22],['mail',41],['rdmail',27]].forEach(function(x){exe('/subsys/'+x[0]+'.exe.1',x[1])});
  [['adventure',112],['old-adventure',74],['dungeon',96],['bkg',23],['brkout',14],['chess',38],['crime',61],['lugi',29],['moles',11],['startrek',44],['tech2',87],['sign',6]].forEach(function(x){exe('/games/'+x[0]+'.exe.1',x[1])});
  P.put('/games/dtext.dat.1','f',{owner:'operator',date:SD,bin:true,size:41*2560});
  P.put('/games/dindx.dat.1','f',{owner:'operator',date:SD,bin:true,size:3*2560});
  f('/guest/login.cmd.1',['DEFINE SYS: SYS:,GAMES:','TERMINAL VT100','INFORMATION MAIL']);
  f('/mail/mail.txt.1',[],{prot:true});
});
