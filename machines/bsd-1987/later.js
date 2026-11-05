/* PHOSPHOR-9 terminal: machine "bsd-1987", the programs that only load when first run: what each
   one needs, and the manual page that has to be there before it is. The words of each page come
   from the game's own, under the notice in its file. */
(function(P){
'use strict';
function game(files,name,man,o){P.later(files,Object.assign({names:[name],path:'/usr/games',man:man},o))}
game('rogue.js','rogue',{what:'Exploring The Dungeons of Doom',syn:'rogue [ -r ] [ save_file ] [ -s ] [ -d ]',desc:[
    'a computer fantasy game with a new twist. it is crt oriented, and the object of the game is to survive the attacks of various monsters and get a lot of gold, rather than the puzzle solving orientation of most computer fantasy games.',
    'to get started you really only need to know two commands. the command ? will give you a list of the available commands and the command / will identify the things you see on the screen.',
    'to win the game (as opposed to merely playing to beat other people\'s high scores) you must locate the amulet of yendor which is somewhere below the 20th level of the dungeon and get it out.',
    'when the game ends, either by your death, when you quit, or if you (by some miracle) manage to win, rogue will give you a list of the top-ten scorers. the scoring is based entirely upon how much gold you get. there is a 10% penalty for getting yourself killed.',
    'if save_file is specified, rogue will be restored from the specified saved game file. if the -r option is used, the save game file is presumed to be the default. the -s option will print out the list of scores. the -d option will kill you and try to add you to the score file.',
    '',
    'by michael c. toy, kenneth c. r. c. arnold and glenn wichman.'],bugs:[
    'probably infinite (although countably infinite). however, that ice monsters sometimes transfix you permanently is not a bug. it\'s a feature.']});
game(['../shared/glorkz.js','../shared/adventure.js'],'adventure',{what:'an exploration game',syn:'adventure [ savedgame ]',desc:[
    'the object of the game is to locate and explore colossal cave, find the treasures hidden there, and bring them back to the building with you. the program is your eyes and hands. direct it with commands of one or two words. only the first five letters of each word count.',
    '',
    'written in fortran by will crowther and don woods, and translated to c by jim gillogly. ctrl-c quits, after asking. suspend keeps your game in this browser, under a name you choose, and adventure name resumes it, if you wait.']});
game('../shared/arithmetic.js','arithmetic',{what:'provide drill in number facts',syn:'arithmetic [ +-x/ ] [ range ]',desc:[
  'types out simple arithmetic problems, and waits for an answer to be typed in. if the answer is correct, it types back "Right!", and a new problem. if the answer is wrong, it replies "What?", and waits for another answer. every twenty problems, it publishes statistics on correctness and the time required to answer.',
  'to quit the program, type an interrupt (ctrl-c).',
  'the first optional argument determines the kind of problem to be generated; +, -, x, and / respectively cause addition, subtraction, multiplication, and division problems. one or more characters can be given; if more than one is given, the different types of problems will be mixed in random order; default is +-.',
  'range is a decimal number; all addends, subtrahends, differences, multiplicands, divisors, and quotients will be less than or equal to the value of range. default range is 10.']},{hidden:true,noHelpFlag:true});
game('../shared/bcd.js','bcd',{what:'convert to antique media',syn:'bcd [ string ]',desc:['reads the given input and reproduces it in the form of a punched card.']},{hidden:true,noHelpFlag:true});
game('games/rain.js','rain',{what:'animated raindrops display',syn:'rain',desc:['the display is modeled after the vax/vms program of the same name. ctrl-c stops it.']},{hidden:true,noHelpFlag:true});
game('games/cfscores.js','cfscores',{what:'show the canfield scores',syn:'cfscores [ -a ] [ user ]',desc:['shows what you, or the user named, have won and lost at canfield. -a shows everyone who has played.']},{hidden:true,noHelpFlag:true});
game('games/snscore.js','snscore',{what:'show the snake scores',syn:'snscore',desc:['lists everyone\'s best score at snake, best first.']},{hidden:true,noHelpFlag:true});
})(window.Phosphor);
