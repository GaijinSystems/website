/* PHOSPHOR-9 terminal: the machines that can be plugged in.
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE.
   name and year: what the connect command calls it, and the year on its clock, here and
   nowhere else ({year} in any text). Its "installed:" date must fall before that year starts,
   or on January 1, so the clock is never earlier than the machine; a machine of today takes the visitor's own
   year with new Date().getFullYear(). dir and files: what to
   load, in order (.js and .css). A site chooses with "machine:" and "machines:". random:false leaves a machine
   out of "machine: random" (unless only such machines are allowed); the address, connect and those settings still reach it.
   Listed oldest first; connect lists them by year whatever order a site gives. */
Phosphor.machines({
  v7:{name:'pdp-11/70, version 7 unix',year:1979,dir:'machines/v7-1979',files:['later.js','machine.js','fs.js']},
  vm370:{name:'ibm system/370, vm/370 release 6',year:1980,dir:'machines/vm370-1980',files:['machine.js','disk.js','cp.js','edit.js','exec.js','sys.js','cms.js']},
  trs80:{name:'trs-80 model iii, trsdos 1.3',year:1981,dir:'machines/trs80-1981',files:['trs80.css','machine.js','basic.js','disk.js','trs80.js']},
  multics:{name:'honeywell level 68, multics mr8.0',year:1981,dir:'machines/multics-1981',files:['machine.js','commands.js','qedx.js','fs.js','info.js']},
  cpm:{name:'s-100 z80, cp/m 2.2',year:1982,dir:'machines/cpm-1982',files:['machine.js','../shared/zork.js','../shared/fcb.js','fs.js','commands.js']},
  apple2:{name:'apple iie, dos 3.3',year:1984,dir:'machines/apple2-1984',files:['machine.js','cpu.js','basic.js','disk.js','apple.js']},
  tops20:{name:'decsystem-2060, tops-20 v6.1',year:1986,dir:'machines/tops20-1986',files:['later.js','machine.js','fs.js','commands.js']},
  c128:{name:'commodore 128, basic 7.0',year:1986,random:false,dir:'machines/c128-1986',files:['c128.css','machine.js','font.js','editor.js','basic.js','disk.js','games.js','files.js','screen.js']},
  bsd:{name:'vax-11/780, 4.3bsd',year:1987,dir:'machines/bsd-1987',files:['later.js','commands.js','machine.js','fs.js']},
  dos:{name:'ibm pc/at, ms-dos 3.30',year:1988,dir:'machines/dos-1988',files:['machine.js','../shared/zork.js','../shared/fcb.js','fs.js','commands.js']},
  vms:{name:'vax-11/785, vax/vms v4.6',year:1988,dir:'machines/vms-1988',files:['later.js','machine.js','fs.js','commands.js']},
  bbs:{name:'dial-up bulletin board, 2400 bps',year:1990,random:false,dir:'machines/bbs-1990',files:['machine.js','../shared/modem.js','../shared/bbs.js','dialer.js']},
  irix:{name:'silicon graphics crimson, irix 4.0.5',year:1993,dir:'machines/irix-1993',files:['machine.js','commands.js','fs.js']},
  linux:{name:'kvm virtual server, debian 13',year:new Date().getFullYear(),dir:'machines/linux',files:['later.js','machine.js','commands.js','fs.js']}
});
