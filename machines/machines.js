/* PHOSPHOR-9 terminal: the machines that can be plugged in.
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE.
   name and year: what the connect command calls it, and the year on its clock, here and
   nowhere else ({year} in any text). Its "installed:" date must fall before that year starts,
   or on January 1, so the clock is never earlier than the machine; a machine of today takes the visitor's own
   year with new Date().getFullYear(). dir and files: what to
   load, in order (.js and .css). A site chooses with "machine:" and "machines:".
   Listed oldest first; connect lists them by year whatever order a site gives. */
Phosphor.machines({
  v7:{name:'pdp-11/70, version 7 unix',year:1979,dir:'machines/v7-1979',files:['later.js','machine.js','fs.js']},
  cpm:{name:'s-100 z80, cp/m 2.2',year:1982,dir:'machines/cpm-1982',files:['machine.js','../shared/zork.js','../shared/fcb.js','fs.js','commands.js']},
  bsd:{name:'vax-11/780, 4.3bsd',year:1987,dir:'machines/bsd-1987',files:['later.js','commands.js','machine.js','fs.js']},
  dos:{name:'ibm pc/at, ms-dos 3.30',year:1988,dir:'machines/dos-1988',files:['machine.js','../shared/zork.js','../shared/fcb.js','fs.js','commands.js']},
  vms:{name:'vax-11/785, vax/vms v4.5',year:1988,dir:'machines/vms-1988',files:['later.js','machine.js','fs.js','commands.js']},
  irix:{name:'silicon graphics crimson, irix 4.0.5',year:1993,dir:'machines/irix-1993',files:['machine.js','commands.js','fs.js']},
  linux:{name:'kvm virtual server, debian 13',year:new Date().getFullYear(),dir:'machines/linux-2025',files:['later.js','machine.js','commands.js','fs.js']}
});
