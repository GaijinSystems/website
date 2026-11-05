/* PHOSPHOR-9 terminal: machine "linux-2025", the programs the administrator installed, which only load when
   first run: what each needs, and its manual page.
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE. */
(function(P){
'use strict';
function game(files,names,man,o){
  P.later(files,Object.assign({names:[].concat(names),path:'/usr/games',man:man,hidden:true},o||{}));
}
game(['../shared/zmachine.js','games/frotz.js'],'frotz',{what:'interpreter for Infocom and other Z-Machine games',syn:'frotz [options] file',desc:[
  'plays the story files of Infocom\'s text adventures, and of the games written since for the Z-machine. type your commands in plain words; the game answers, and the line at the top says where you are and how you are doing.',
  'a story file that is not in the working directory is looked for in the directories named in INFOCOM_PATH. on this machine the administrator has put zork1.z3 and zork2.z3 there, so frotz zork1.z3 starts Zork I.','',
  'save and restore keep your game in this browser, under a name you choose. ctrl-c leaves at once.']});
game('games/sl.js','sl',{what:'display animations aimed to correct users who accidentally enter sl instead of ls.',syn:'sl [ -alFe ]',desc:[
  'sends a steam locomotive across the screen. it cannot be stopped; that is the point.','',
  '-a   an accident: there are people at the windows, calling for help.',
  '-l   a little one.',
  '-F   it flies.',
  '-e   ctrl-c is allowed to stop it.']});
game('games/cowsay.js',['cowsay','cowthink'],{what:'configurable speaking/thinking cow (and a bit more)',syn:'cowsay [-e eye_string] [-f cowfile] [-h] [-l] [-n] [-T tongue_string] [-W column] [-bdgpstwy]',desc:[
  'prints a cow saying the words given, or what comes in on its standard input, in a balloon. cowthink has it think them instead.','',
  '-n   leave the message as it is; otherwise it is filled to fit -W columns, 40 by default.',
  '-e   the eyes, two characters. -T the tongue, also two.',
  '-b -d -g -p -s -t -w -y   borg, dead, greedy, paranoid, stoned, tired, wired and youthful.',
  '-f   another cow, from /usr/share/cowsay/cows. -l lists them.']});
game('games/fortune.js','fortune',{what:'print a random, hopefully interesting, adage',syn:'fortune [-acefilosw] [-n length] [-m pattern] [[n%] file/dir/all]',desc:[
  'prints one of the sayings in /usr/share/games/fortunes, chosen at random.','',
  '-s   only short ones; -l only long ones; -n the length that divides them, 160 characters by default.',
  '-c   say which file it came from. -f lists the files.',
  '-m   print every saying that matches the pattern.']});
game('games/cmatrix.js','cmatrix',{what:'simulates the display from "The Matrix"',syn:'cmatrix [-abBflohnsVx] [-u delay] [-C color]',desc:[
  'fills the screen with falling columns of characters, until q or ctrl-c. this glass shows them in the only colour it has, which happens to be the right one.','',
  '-s   screensaver: any key stops it.',
  '-u   delay between updates, 0 to 10. 4 by default.']},{path:'/usr/bin'});
/* nethack: written separately, in games/nethack.js. When it is there:
game('games/nethack.js','nethack',{what:'Exploring The Mazes of Menace',syn:'nethack [ options ]',desc:[...]});  */
})(window.Phosphor);
