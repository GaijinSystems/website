/* PHOSPHOR-9 terminal: machine "linux", the programs the administrator installed, which only load when
   first run: what each needs, and its manual page.
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE. */
(function(P){
'use strict';
function game(files,names,man,o){
  P.later(files,Object.assign({names:[].concat(names),path:'/usr/games',man:man,hidden:true},o||{}));
}
game(['../shared/zmachine.js','games/frotz.js'],'frotz',{what:'interpreter for Infocom and other Z-Machine games',syn:'frotz [options] file [blorb_file]',desc:[
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
game('games/fortune.js','fortune',{what:'print a random, hopefully interesting, adage',syn:'fortune [-acefilosuw] [-n length] [-m pattern] [[n%] file/dir/all]',desc:[
  'prints one of the sayings in /usr/share/games/fortunes, chosen at random.','',
  '-s   only short ones; -l only long ones; -n the length that divides them, 160 characters by default.',
  '-c   say which file it came from. -f lists the files.',
  '-m   print every saying that matches the pattern.']});
game('games/cmatrix.js','cmatrix',{what:'simulates the display from "The Matrix"',syn:'cmatrix [-abBflohnsmVx] [-u update] [-C color]',desc:[
  'fills the screen with falling columns of characters, until q or ctrl-c. this glass shows them in the only colour it has, which happens to be the right one.','',
  '-s   screensaver: any key stops it.',
  '-u   delay between updates, 0 to 10. 4 by default.']},{path:'/usr/bin'});
game('games/nethack.js','nethack',{what:'Exploring The Mazes of Menace',syn:'nethack [ -d directory ] [ -n ] [ -p profession ] [ -r race ] [ -[DX] ] [ -u playername ] [ -dec ] [ -ibm ] [ --showpaths ] [ --version[:paste] ]',desc:[
  'nethack is a display oriented dungeons & dragons(tm) - like game. the standard tty display and command structure resemble rogue.',
  'to get started you really only need to know two commands. the command ? will give you a list of the available commands (as well as other information) and the command / will identify the things you see on the screen.',
  'to win the game (as opposed to merely playing to beat other people\'s high scores) you must locate the amulet of yendor which is somewhere below the 20th level of the dungeon and get it out. few people achieve this; most never do.',
  'when the game ends, whether by your dying, quitting, or escaping from the caves, nethack will give you (a fragment of) the list of top scorers. nethack -s [ -v ] [ -p profession ] [ -r race ] [ playernames ] shows the list without playing.',
  'the environment variable NETHACKOPTIONS can be used to initialize many run-time options. the ? command provides a description of these options and syntax. options may also be put in a configuration file, .nethackrc in your home directory.',
  '-u playername supplies the answer to the question "who are you?". -p and -r choose the profession and race. -D asks for debug mode, which only root may have here. -dec and -ibm are the decgraphics and ibmgraphics options.','',
  'on this machine saved games, bones files and the list of top scorers are kept in this browser. closing the page hangs up the terminal, and nethack saves the game as it does when a line drops. ctrl-c asks whether you really want to quit. the arrow keys move as h j k l do.']},{noHelpFlag:true});
})(window.Phosphor);
