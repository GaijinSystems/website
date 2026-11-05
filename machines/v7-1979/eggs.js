/* PHOSPHOR-9 terminal: machine "v7-1979", easter eggs.
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE.
   The magic words from Colossal Cave. Hidden: not in help, no manual page. Delete this file
   (and its entry in machines/machines.js) to remove them. */
(function(P){
'use strict';

P.command({names:['xyzzy'],hidden:true,run:function(){P.say([
  '         ___',
  '        (___)',
  '         | |',
  "       .-'-'-.",
  '       |=====|',
  '      /  .-.  \\',
  '     |  ( * )  |',
  "     |   '-'   |",
  '      \\       /',
  '       |=====|',
  "       '-----'",
  '',
  'your lamp is now on.',
  'you are in a maze of twisty little passages, all alike.',
  ['(you are still in '+P.profile.year+'.)','dim']
])}});

P.command({names:['plugh'],hidden:true,run:function(){P.typeLine('a hollow voice says "plugh".')}});

})(window.Phosphor);
