/* PHOSPHOR-9 terminal: machine "tops20-1986", the programs in <GAMES> that do run. Each starts by its name
   at the @ prompt (SYS: takes in GAMES:), by R, or by RUN GAMES:name.
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE. */
(function(P){
'use strict';
function image(files,name){P.later(files,{names:[name],hidden:true,noHelpFlag:true,failed:'?Program could not be loaded - "PS:<GAMES>'+name.toUpperCase()+'.EXE.1"'})}
image(['../shared/glorkz.js','../shared/adventure.js'],'adventure');
image('../bsd-1987/games/zork.js','dungeon');
})(window.Phosphor);
