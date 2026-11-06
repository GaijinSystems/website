/* PHOSPHOR-9 terminal: machine "cpm-1982", drive A:. CP/M has no folders.
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE. */
Phosphor.setup(function(P){
  'use strict';
  [['asm.com',8192],['ddt.com',4992],['dump.com',416],['ed.com',6656],['load.com',1664],['movcpm.com',9856],
   ['pip.com',7424],['stat.com',5248],['submit.com',1280],['sysgen.com',1408],['xsub.com',768]].forEach(function(f){
    P.sys('/'+f[0],'f',{bin:true,size:f[1]});
  });
  [['zork1.com',8704,0],['zork1.dat',86912,0],['zork2.com',8704,3],['zork2.dat',92544,3]].forEach(function(f){
    P.sys('/'+f[0],'f',{bin:true,size:f[1],user:f[2]}); /* user: the CP/M user area it lives in */
  });
});
