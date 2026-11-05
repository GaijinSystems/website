/* PHOSPHOR-9 terminal: the machines that can be plugged in.
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE.
   name: what the connect command calls it. dir and files: what to load, in order (.js and
   .css). A site chooses among these with "machine:" and "machines:" in site/config.js. */
Phosphor.machines({
  v7:{name:'pdp-11/70, version 7 unix (1979)',dir:'machines/v7-1979',files:['machine.js','fs.js','eggs.js']},
  bsd:{name:'vax-11/780, 4.3bsd (1986)',dir:'machines/bsd-1986',files:['machine.js','fs.js']}
});
