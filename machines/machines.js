/* PHOSPHOR-9 terminal: the machines that can be plugged in.
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE.
   name and year: what the connect command calls it, and the year on its clock, here and
   nowhere else ({year} in any text). Its "installed:" date must fall before that year starts,
   or on January 1, so the clock is never earlier than the machine. dir and files: what to
   load, in order (.js and .css). A site chooses with "machine:" and "machines:". */
Phosphor.machines({
  v7:{name:'pdp-11/70, version 7 unix',year:1979,dir:'machines/v7-1979',files:['machine.js','fs.js','eggs.js']},
  bsd:{name:'vax-11/780, 4.3bsd',year:1987,dir:'machines/bsd-1987',files:['machine.js','fs.js']}
});
