/* PHOSPHOR-9 terminal: machine "vms-1988", the images in [GAMES] that do run. RUN starts them, and
   LOGIN.COM gives ADVENTURE a foreign command, so a suspended game can be named. */
(function(P){
'use strict';
function image(files,name){P.later(files,{names:[name],hidden:true,noHelpFlag:true,failed:'%DCL-W-ACTIMAGE, error activating image DUA0:[GAMES]'+name.toUpperCase()+'.EXE;1'})}
image(['../shared/glorkz.js','../shared/adventure.js'],'adventure');
image('games/startrek.js','startrek');
image('games/empire.js','empire');
image('games/monster.js','monster');
image('games/moria.js','moria');
})(window.Phosphor);
