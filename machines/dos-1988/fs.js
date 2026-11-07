/* PHOSPHOR-9 terminal: machine "dos-1988", drive C:.
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE. */
Phosphor.setup(function(P){
  'use strict';
  function sys(p,o){return P.sys(p,'f',o)}
  sys('/io.sys',{bin:true,size:22100,hidden:true});
  sys('/msdos.sys',{bin:true,size:30159,hidden:true});
  sys('/command.com',{bin:true,size:25276});
  sys('/config.sys',{body:['FILES=20','BUFFERS=20','SHELL=C:\\COMMAND.COM C:\\ /P']});
  sys('/autoexec.bat',{body:['@ECHO OFF','CTTY COM1','PROMPT $P$G','PATH C:\\DOS;C:\\COMM']});
  P.sys('/dos','d');
  [['attrib.exe',8234],['chkdsk.com',9819],['diskcopy.com',6264],['edlin.com',7526],['fdisk.com',48216],
   ['find.exe',6434],['format.com',11671],['label.com',2377],['more.com',313],['sort.exe',1946],
   ['sys.com',4766],['tree.com',3276],['xcopy.exe',11247]].forEach(function(f){sys('/dos/'+f[0],{bin:true,size:f[1]})});
  P.sys('/comm','d');
  sys('/comm/term.exe',{bin:true,size:46872});
  P.sys('/zork','d');
  [['zork1.com',8704],['zork1.dat',86838],['zork2.com',8704],['zork2.dat',92524]].forEach(function(f){sys('/zork/'+f[0],{bin:true,size:f[1]})});
  sys('/zork/leaflet.txt',{body:P.zork.leaflet});
  sys('/zork/fcd3.txt',{body:P.zork.fcd3});
  ['nul','con','prn','aux'].forEach(function(d){sys('/'+d,{dev:[0,0],hidden:true})});
});
