/* PHOSPHOR-9 terminal: machine "bsd-1987", teachgammon. Ported to JavaScript for this terminal from 4.3BSD's
   games/backgammon: teach.c, tutor.c, ttext1.c, ttext2.c and data.c, and the parts of allow.c, board.c, check.c,
   fancy.c, init.c, odds.c, one.c, save.c, subs.c and table.c that it is linked with; 5.1 (Berkeley) 5/29/85. By
   Alan Char. It keeps this notice:

 * Copyright (c) 1980 Regents of the University of California.
 * All rights reserved.  The Berkeley software License Agreement
 * specifies the terms and conditions for redistribution.

   Differences: it always draws as it does on a terminal with cursor addressing, at 24 by 80, cut off if the glass is
   smaller, and -t is read and ignored. In ttext2.c "list" is declared as a char *, not the array it is, so in the C
   "?" at a --> dumps core: here it shows the list, as the text promises. A game saved with S is written as a line
   of numbers, not as the binary file, and the name given as an argument is only checked for being there. At the end it
   runs backgammon with "n", as the C's execl does.
 */
(function(P){
'use strict';
var T={
"list":["\n\n\tI\tIntroduction to Backgammon", "\tM\tMoves and Points", "\tR\tRemoving Men from the Board", "\tH\tHitting Blots", "\tE\tEnding the Game and Scoring", "\tD\tDoubling", "\tS\tStrategy", "\tP\tThe Program and How to Use It", "\nalso, you can type:", "\t?\tto get this list", "\tQ\tto go start playing", "\tT\tto go straight to the tutorial"],
"hello":["\n\u001a   These rules consist of text describing how to play Backgammon", "followed by a tutorial session where you play a practice game", "against the computer.  When using this program, think carefuly", "before typing, since it reacts as soon as you type something.  In", "addition, the program presents text output, such as these rules,", "in small blocks that will not roll off the top of the screen.", "Frequently, you will see the characters '-->' indicating that the", "program is waiting for you to finish reading, and will continue", "printing when you type a space or newline.  Also, the rules are", "divided into sections, and although you should read them in or-", "der, you can go directly to any of them by typing one of the fol-", "lowing letters:", "(Remember to hit a space or a newline to continue.)", ""],
"intro1":["\nIntroduction:", "\n   Backgammon is a game involving the skill of two players and", "the luck of two dice.  There are two players, red and white, and", "each player gets fifteen men.  The object of the game is to re-", "move all your men from the board before the opponent does.  The", "board consists of twenty-four positions, a 'bar' and a 'home' for", "each player.  It looks like this:", ""],
"intro2":["", "\n   Although not indicated on the board, the players' homes are", "located just to the right of the board.  A player's men are placed", "there when they are removed from the board.  The board you just", "saw was in it's initial position.  All games start with the board", "looking like this.  Notice that red's pieces are represented by the", "letter 'r' and white's pieces are represented by the letter 'w'.", "Also, a position may have zero or more pieces on it, e.g.  posi-", "tion 12 has five red pieces on it, while position 11 does not", "have any pieces of either color.", ""],
"moves":["\nMoves and Points:", "\n   Moves are made along the positions on the board according to", "their numbers.  Red moves in the positive direction (clockwise", "from 1 to 24), and white moves in the negative direction (coun-", "terclockwise from 24 to 1).", "\n   A turn consists of rolling the dice, and moving the number of", "positions indicated on each die.  The two numbers can be used to", "move one man the sum of the two rolls, or two men the number on", "each individual die.  For example, if red rolled 6 3 at the start", "of the game, he might move a man from 1 to 7 to 10, using both", "dice for one man, or he might move two men from position 12, one", "to 15 and one to 18.  (Red did not have to choose two men start-", "ing from the same position.)  In addition, doubles are treated", "specially in backgammon.  When a player rolls doubles, he gets to", "move as if he had four dice instead of two.  For instance, if you", "rolled double 2's, you could move one man eight positions, four", "men two positions each, or any permutation in between.", "", "\n   However, there are certain limitations, called 'points.'  A", "player has a point when he has two or more men on the same posi-", "tion.  This gives him custody of that position, and his opponent", "cannot place his men there, even if passing through on the way to", "another position.  When a player has six points in a row, it is", "called a 'wall,' since any of his opponent's men behind the wall", "cannot pass it and are trapped, at least for the moment.  Notice", "that this could mean that a player could not use part or all of", "his roll.  However, he must use as much of his roll as possible.", ""],
"remove":["\nRemoving Men from the Board:", "\n   The most important part of the game is removing men, since", "that is how you win the game.  Once a man is removed, he stays", "off the board for the duration of the game.  However, a player", "cannot remove men until all his men are on his 'inner table,' or", "the last six positions of the board (19-24 for red, 6-1 for", "white).", "\n   To get off the board, a player must roll the exact number to", "get his man one position past the last position on the board, or", "his 'home.'  Hence, if red wanted to remove a man from position", "23, he would have to roll a 2, anything else would be used for", "another man, or for another purpose.  However, there is one ex-", "ception.  If the player rolling has no men far enough to move the", "roll made, he may move his farthest man off the board.  For exam-", "ple, if red's farthest man back was on position 21, he could re-", "move men from that position if he rolled a 5 or a 6, as well as a", "4.  Since he does not have men on 20 (where he could use a 5) or", "on 19 (where he could use a 6), he can use these rolls for posi-", "tion 21.  A player never has to remove men, but he must make as", "many moves as possible.", ""],
"hits":["\nHitting Blots:", "\n   Although two men on a position form an impenetrable point, a", "lone man is not so secure.  Such a man is called a 'blot' and has", "the potential of getting hit by an opposing man.  When a player's", "blot is hit, he is placed on the bar, and the first thing that", "player must do is move the man off the bar.  Such moves are", "counted as if the bar is one position behind the first position", "on the board.  Thus if red has a man on the bar and rolls 2 3, he", "must move the man on the bar to position 2 or 3 before moving any", "other man.  If white had points on positions 2 and 3, then red", "would forfeit his turn.  Being on the bar is a very bad position,", "for often a player can lose many turns trying to move off the", "bar, as well as being set back the full distance of the board.", ""],
"endgame":["\nEnding the Game and Scoring:", "\n   Winning a game usually wins one point, the normal value of a", "game.  However, if the losing player has not removed any men yet,", "then the winning player wins double the game value, called a", "'gammon.'  If the losing player has a player on the bar or on the", "winner's inner table, then the winner gets triple the game value,", "which is called a 'backgammon.'  (So that's where the name comes", "from!)", ""],
"doubl":["\nDoubling:", "\n   If a player thinks he is in a good position, he may double the", "value of the game.  However, his opponent may not accept the pro-", "posal and forfeit the game before the price gets too high.  A", "player must double before he rolls, and once his double has been", "accepted, he cannot double again, until his opponent has doubled.", "Thus, unless the game swings back and forth in advantage between", "the two players a great deal, the value of the game should be", "low.  At any rate, the value of the game will never go above 64,", "or six doubles.  However, if a player wins a backgammon at 64", "points, he wins 192 points!", ""],
"stragy":["\nStrategy:", "\n   Some general hints when playing:  Try not to leave men open", "unless absolutely necessary.  Also, it is good to make as many", "points as possible.  Often, two men from different positions can", "be brought together to form a new point.  Although walls (six", "points in a row) are difficult to form, many points nestled close-", "ly together produce a formidable barrier.  Also, while it is good", "to move back men forward, doing so lessens the opportunity for you", "to hit men.  Finally, remember that once the two player's have", "passed each other on the board, there is no chance of either team", "being hit, so the game reduces to a race off the board.  Addi-", "tional hints on strategy are presented in the practice game.", ""],
"prog":["\nThe Program and How It Works:", "\n   A general rule of thumb is when you don't know what to do,", "type a question mark, and you should get some help.  When it is", "your turn, only your color will be printed out, with nothing", "after it.  You may double by typing a 'd', but if you type a", "space or newline, you will get your roll.  (Remember, you must", "double before you roll.)  Also, typing a 'r' will reprint the", "board, and a 'q' will quit the game.  The program will type", "'Move:' when it wants your move, and you may indicate each die's", "move with <s>-<f>, where <s> is the starting position and <f> is", "the finishing position, or <s>/<r> where <r> is the roll made.", "<s>-<f1>-<f2> is short for <s>-<f1>,<f1>-<f2> and <s>/<r1><r2> is", "short for <s>/<r1>,<s>/<r2>.  Moves may be separated by a comma", "or a space.", "", "\n   While typing, any input which does not make sense will not be", "echoed, and a bell will sound instead.  Also, backspacing and", "killing lines will echo differently than normal.  You may examine", "the board by typing a 'r' if you have made a partial move, or be-", "fore you type a newline, to see what the board looks like.  You", "must end your move with a newline.  If you cannot double, your", "roll will always be printed, and you will not be given the oppor-", "tunity to double.  Home and bar are represented by the appropri-", "ate number, 0 or 25 as the case may be, or by the letters 'h' or", "'b' as appropriate.  You may also type 'r' or 'q' when the program", "types 'Move:', which has the same effect as above.  Finally, you", "will get to decide if you want to play red or white (or both if you", "want to play a friend) at the beginning of the session, and you", "will not get to change your mind later, since the computer keeps", "score.", ""],
"lastch":["\nTutorial (Practice Game):", "\n   This tutorial, for simplicity's sake, will let you play one", "predetermined game.  All the rolls have been pre-arranged, and", "only one response will let you advance to the next move.", "Although a given roll will may have several legal moves, the tu-", "torial will only accept one (not including the same moves in a", "different order), claiming that that move is 'best.'  Obviously,", "a subjective statement.  At any rate, be patient with it and have", "fun learning about backgammon.  Also, to speed things up a lit-", "tle, doubling will not take place in the tutorial, so you will", "never get that opportunity, and quitting only leaves the tutori-", "al, not the game.  You will still be able to play backgammon", "after quitting.", "\n   This is your last chance to look over the rules before the tu-", "torial starts.", ""],
"text0":["To start the game, I roll a 3, and you roll a 1.  This means", "that I get to start first.  I move 8-5,6-5 since this makes a", "new point and helps to trap your back men on 1.  You should be", "able to do a similar move with your roll."],
"text1":["Now you shall see a move using doubles.  I just rolled double", "5's.  I will move two men from position 13 to position 3.  The", "notation for this is 13-8,13-8,8-3,8-3.  You will also roll dou-", "bles, but you will be able to make a much stronger move."],
"text2":["Excellent!  As you can see, you are beginning to develop a wall", "which is trapping my men on position 24.  Also, moving your back", "men forward not only improves your board position safely, but it", "thwarts my effort to make a wall.", "", "My roll now is 5 6.  Normally, I would use that roll to move from", "position 24 to position 13 (24-18-13), but your new point prevents", "that.  Instead, I am forced to move from 13 to 2, where my man is", "open but cannot be hit."],
"text3":["As you can see, although you left a man open, it is a rela-", "tively safe move to an advantageous position, which might help", "you make a point later.  Only two rolls (4 5 or 5 4) will allow", "me to hit you.  With an unprecedented amount of luck, I happen", "to roll a 4 5 and hit you as just mentioned."],
"text4":["You're pretty lucky yourself, you know.  I follow by rolling 2 3", "and moving 25-22,24-22, forming a new point."],
"text5":["Not a spectacular move, but a safe one.  I follow by rolling 6 1.", "I decide to use this roll to move 22-16,16-17.  It leaves me with", "one man still open, but the blot is farther back on the board, and", "would suffer less of a loss by being hit."],
"text6":["By moving your two men from 17 to 20, you lessen my chance of", "getting my man off the board.  In fact, the odds are 5 to 4", "against me getting off.  I roll with the odds and helplessly", "receive a 3 5."],
"text7":["Note that the blot on 7 cannot be hit unless I get off the bar", "and have a 1 or a 6 left over, and doing so will leave two of", "my men open.  Also, the blot on 16 cannot be hit at all!  With", "a sigh of frustration, I roll double 6's and remain immobile."],
"text8":["See, you did not get hit and, you got to 'cover up' your open men.", "Quite an accomplishment.  Finally, I get off the bar by rolling", "6 2 and moving 25-23,23-17."],
"text9":["My venture off the bar did not last long.  However, I got lucky", "and rolled double 1's, allowing me to move 0-1,1-2,15-14,15-14."],
"text10":["You are improving your position greatly and safely, and are well", "on the way to winning the game.  I roll a 6 2 and squeak past", "your back man.  Now the game becomes a race to the finish."],
"text11":["Now that it is merely a race, you are trying to get as many men", "as possible into the inner table, so you can start removing them.", "I roll a 3 4 and move my two men farthest back to position 11", "(15-11,14-11)."],
"text12":["The race is still on, and you have seem to be doing all right.", "I roll 6 1 and move 14-8,13-12."],
"text13":["Notice that you get to remove men the instant you have all of", "them at your inner table, even if it is the middle of a turn.", "I roll 1 2 and move 13-11,12-11."],
"text14":["Although you could have removed a man, this move illustrates two", "points:  1) You never have to remove men, and 2) You should try", "to spread out your men on your inner table.  Since you have one", "man on each position, you should be able to remove at least two", "men next turn.  I roll 2 5 and move 8-6,11-6."],
"text15":["This time you were able to remove men.  I roll 3 4 and move", "11-7,11-8.  The race continues."],
"text16":["More holes are opening up in your inner table, but you are", "still very much ahead.  If we were doubling, you would have", "doubled long ago.  I roll 2 6 and move 8-6,11-5."],
"text17":["It pays to spread out your men.  I roll 3 5 and move 7-4,8-3."],
"text18":["You can only remove some men, but you spread out more and", "more, in order to be able to remove men more efficiently.", "I roll double 3's, which help, but not that much.  I move", "8-5,3-0,3-0,3-0."],
"text19":["I roll 1 4 and move 5-4,4-0."],
"text20":["You are now nicely spread out to win a game.  I roll 5 6 and", "move 5-0,6-0."],
"text21":["Any minute now.  Just a few short steps from victory.  I roll", "2 4 and move 6-4,4-0."],
"text22":["It looks pretty hopeless for me, but I play on, rolling 1 3 and", "moving 4-3,3-0."],
"text23":["Congratulations!  You just won a game of backgammon against the", "computer!  You will now be able to play a game, but remember,", "when you start playing, that doubling will be enabled, which", "will add another factor to the game...  Good luck!!", ""]
};
var test=[
{"brd":[0,2,0,0,0,0,-5,0,-3,0,0,0,5,-5,0,0,0,3,0,5,0,0,0,0,-2,0],"roll1":3,"roll2":1,"mp":[8,6,0,0],"mg":[5,5,0,0],"new1":4,"new2":2,"com":"text0"},
{"brd":[0,2,0,0,0,-2,-4,0,-2,0,0,0,5,-5,0,0,0,2,0,4,0,2,0,0,-2,0],"roll1":5,"roll2":5,"mp":[13,13,8,8],"mg":[8,8,3,3],"new1":6,"new2":6,"com":"text1"},
{"brd":[0,0,0,-2,0,-2,-4,2,-2,0,0,0,3,-3,0,0,0,2,2,4,0,2,0,0,-2,0],"roll1":6,"roll2":5,"mp":[13,8,0,0],"mg":[8,2,0,0],"new1":1,"new2":2,"com":"text2"},
{"brd":[0,0,-1,-2,0,-2,-4,2,-2,0,0,0,2,-2,0,1,0,2,2,4,0,2,0,0,-2,0],"roll1":4,"roll2":5,"mp":[24,20,0,0],"mg":[20,15,0,0],"new1":2,"new2":5,"com":"text3"},
{"brd":[0,0,0,-2,0,-2,-4,3,-2,0,0,0,2,-2,0,-1,0,2,2,4,0,2,0,0,-1,-1],"roll1":2,"roll2":3,"mp":[25,24,0,0],"mg":[22,22,0,0],"new1":4,"new2":1,"com":"text4"},
{"brd":[0,0,0,-2,0,-2,-4,2,-2,0,0,0,3,-2,0,-1,0,2,2,4,0,2,-2,0,0,0],"roll1":6,"roll2":1,"mp":[22,16,0,0],"mg":[16,15,0,0],"new1":3,"new2":3,"com":"text5"},
{"brd":[0,0,0,-2,0,-2,-4,2,-2,0,0,0,3,-2,0,-2,0,0,2,2,2,2,2,0,0,-1],"roll1":3,"roll2":5,"mp":[0,0,0,0],"mg":[0,0,0,0],"new1":5,"new2":4,"com":"text6"},
{"brd":[0,0,0,-2,0,-2,-4,1,-2,0,0,0,3,-2,0,-2,1,0,2,2,2,2,2,0,0,-1],"roll1":6,"roll2":6,"mp":[0,0,0,0],"mg":[0,0,0,0],"new1":3,"new2":6,"com":"text7"},
{"brd":[0,0,0,-2,0,-2,-4,0,-2,0,0,0,3,-2,0,-2,2,0,2,2,2,2,2,0,0,-1],"roll1":2,"roll2":6,"mp":[25,23,0,0],"mg":[23,17,0,0],"new1":5,"new2":1,"com":"text8"},
{"brd":[0,0,0,-2,0,-2,-4,0,-2,0,0,0,2,-2,0,-2,2,0,3,2,2,2,2,0,0,-1],"roll1":1,"roll2":1,"mp":[25,24,15,15],"mg":[24,23,14,14],"new1":4,"new2":6,"com":"text9"},
{"brd":[0,0,0,-2,0,-2,-4,0,-2,0,0,0,0,-2,-2,0,3,0,4,2,2,2,2,-1,0,0],"roll1":6,"roll2":2,"mp":[23,17,0,0],"mg":[17,15,0,0],"new1":1,"new2":3,"com":"text10"},
{"brd":[0,0,0,-2,0,-2,-4,0,-2,0,0,0,0,-2,-2,-1,2,0,3,4,2,2,2,0,0,0],"roll1":4,"roll2":3,"mp":[15,14,0,0],"mg":[11,11,0,0],"new1":5,"new2":3,"com":"text11"},
{"brd":[0,0,0,-2,0,-2,-4,0,-2,0,0,-2,0,-2,-1,0,0,0,3,5,2,3,2,0,0,0],"roll1":6,"roll2":1,"mp":[14,13,0,0],"mg":[8,12,0,0],"new1":4,"new2":4,"com":"text12"},
{"brd":[0,0,0,-2,0,-2,-4,0,-3,0,0,-2,-1,-1,0,0,0,0,0,5,2,2,5,0,0,0],"roll1":2,"roll2":1,"mp":[13,12,0,0],"mg":[11,11,0,0],"new1":2,"new2":1,"com":"text13"},
{"brd":[0,0,0,-2,0,-2,-4,0,-3,0,0,-4,0,0,0,0,0,0,0,5,2,2,3,1,1,0],"roll1":2,"roll2":5,"mp":[8,11,0,0],"mg":[6,6,0,0],"new1":6,"new2":3,"com":"text14"},
{"brd":[0,0,0,-2,0,-2,-6,0,-2,0,0,-3,0,0,0,0,0,0,0,4,2,2,2,1,1,0],"roll1":4,"roll2":3,"mp":[11,11,0,0],"mg":[7,8,0,0],"new1":2,"new2":5,"com":"text15"},
{"brd":[0,0,0,-2,0,-2,-6,-1,-3,0,0,-1,0,0,0,0,0,0,0,4,1,2,2,0,1,0],"roll1":2,"roll2":6,"mp":[8,11,0,0],"mg":[6,5,0,0],"new1":6,"new2":1,"com":"text16"},
{"brd":[0,0,0,-2,0,-3,-7,-1,-2,0,0,0,0,0,0,0,0,0,0,3,1,2,2,0,0,0],"roll1":5,"roll2":3,"mp":[8,7,0,0],"mg":[3,4,0,0],"new1":5,"new2":2,"com":"text17"},
{"brd":[0,0,0,-3,-1,-3,-7,0,-1,0,0,0,0,0,0,0,0,0,0,3,0,1,2,1,0,0],"roll1":3,"roll2":3,"mp":[8,3,3,3],"mg":[5,0,0,0],"new1":1,"new2":6,"com":"text18"},
{"brd":[0,0,0,0,-1,-4,-7,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,2,1,0,0],"roll1":1,"roll2":4,"mp":[4,5,0,0],"mg":[0,4,0,0],"new1":2,"new2":3,"com":"text19"},
{"brd":[0,0,0,0,-1,-3,-7,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0],"roll1":5,"roll2":6,"mp":[6,5,0,0],"mg":[0,0,0,0],"new1":1,"new2":4,"com":"text20"},
{"brd":[0,0,0,0,-1,-2,-6,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,1,0,0,0],"roll1":2,"roll2":4,"mp":[4,6,0,0],"mg":[0,4,0,0],"new1":6,"new2":2,"com":"text21"},
{"brd":[0,0,0,0,-1,-2,-5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0],"roll1":3,"roll2":1,"mp":[4,3,0,0],"mg":[3,0,0,0],"new1":4,"new2":3,"com":"text22"},
{"brd":[0,0,0,0,0,-2,-5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"roll1":0,"roll2":0,"mp":[0,0,0,0],"mg":[0,0,0,0],"new1":0,"new2":0,"com":"text23"}
];
var maxmoves=23,EXIT={},LI=24,CO=80;
var opts=' QIMRHEDSPT',prompt='-->',color=['White','Red','white','red'];
var better='That is a legal move, but there is a better one.\n',plred='Player is red, computer is white.',plwhite='Player is white, computer is red.',nocomp='(No computer play.)';
var help2=['   Enter moves as <s>-<f> or <s>/<r> where <s> is the starting','position, <f> is the finishing position, and <r> is the roll.','Remember, each die roll must be moved separately.'];
var contin=[''];
/* the state machine of table.c: character, what to do, where to go */
var atmata=[
  ['R',1,0],['?',7,0],['Q',0,-3],['B',8,25],['9',2,25],['8',2,25],['7',2,25],['6',2,25],
  ['5',2,25],['4',2,25],['3',2,25],['2',2,19],['1',2,15],['0',2,25],['.',0,0],['9',2,25],
  ['8',2,25],['7',2,25],['6',2,25],['5',2,25],['4',2,25],['3',2,25],['2',2,25],['1',2,25],
  ['0',2,25],['/',0,32],['-',0,39],['.',0,0],['/',5,32],[' ',6,3],[',',6,3],['\n',0,-1],
  ['6',3,28],['5',3,28],['4',3,28],['3',3,28],['2',3,28],['1',3,28],['.',0,0],['H',9,61],
  ['9',4,61],['8',4,61],['7',4,61],['6',4,61],['5',4,61],['4',4,61],['3',4,61],['2',4,53],
  ['1',4,51],['0',4,61],['.',0,0],['9',4,61],['8',4,61],['7',4,61],['6',4,61],['5',4,61],
  ['4',4,61],['3',4,61],['2',4,61],['1',4,61],['0',4,61],[' ',6,3],[',',6,3],['-',5,39],
  ['\n',0,-1],['.',0,0]];
function zero(n){var a=[];while(n--)a.push(0);return a}
function abs(x){return Math.abs(x)}
P.command({names:['teachgammon'],run:function(a,raw,words){
  var argv=words.slice(1),rflag=false,args='',ai,s;
  function norec(f){P.say(["Can't recover file:  "+f,'']);P.status(0)}
  function recover(f){
    var n=P.find(f);
    if(!n||n.type==='d'||n.prot){norec(f);return false}
    rflag=true;
    return true;
  }
  for(ai=0;ai<argv.length;ai++){
    s=ai;
    while(s<argv.length&&argv[s].charAt(0)==='-'){
      var c1=argv[s].charAt(1);
      if(c1==='n'||c1==='b'||c1==='r'||c1==='w'){if(!rflag)args+=c1}
      else if(c1==='p'){
        var c2=argv[s].charAt(2);
        if(c2==='r'||c2==='w'||c2==='b')args+='p'+c2;
      }
      else if(c1==='t'){if(argv[s].charAt(2)==='')s++}
      else if(c1==='s'){
        s++;
        if(s<argv.length&&!recover(argv[s]))return;
      }
      s++;
    }
    if(s<argv.length&&!recover(argv[s]))return;
  }
  P.program(function(S,finish_){
    /* the terminal */
    LI=S.rows>=21&&S.rows<24?S.rows:24;
    var G=[],tr=0,tc=0;
    function blankline(){return new Array(CO).fill(' ')}
    for(var y0=0;y0<LI;y0++)G.push(blankline());
    function addbuf(c){
      if(G[tr]&&tc>=0&&tc<CO)G[tr][tc]=c;
      tc++;
      if(tc>=CO){tc=0;if(tr<LI-1)tr++}
    }
    function CEput(){if(G[tr])for(var x=tc;x<CO;x++)G[tr][x]=' '}
    function CDput(){CEput();for(var y=tr+1;y<LI;y++)G[y]=blankline()}
    var pan_y=0,pan_x=0;
    function view(){ /* as backgammon's: narrower or shorter than the screen, the view follows the cursor */
      var rows=Math.min(S.rows,LI),cols=Math.min(S.cols,CO),cy=Math.max(0,Math.min(tr,LI-1)),cx=Math.max(0,Math.min(tc,CO-1));
      if(cy<pan_y||cy>=pan_y+rows)pan_y=cy-(rows>>1);
      pan_y=Math.max(0,Math.min(LI-rows,pan_y));
      if(cx<pan_x||cx>=pan_x+cols)pan_x=cx-(cols>>1);
      pan_x=Math.max(0,Math.min(CO-cols,pan_x));
      S.draw(G.slice(pan_y,pan_y+rows).map(function(L){return L.slice(pan_x,pan_x+cols).join('').trimEnd()}),cy-pan_y,cx-pan_x);
    }
    /* fancy.c: it keeps where it means to be apart from where the cursor is */
    var curr=0,curc=0,realr=0,realc=0,begscr=0,linect=zero(LI+1),oldb=zero(26),oldr=0,oldw=0;
    function curmove(r,c){
      if(curr===r&&curc===c)return;
      if(realr===-1){realr=curr;realc=curc}
      curr=r;curc=c;
    }
    function newpos(){
      if(realr===-1)return;
      var r=curr,c=curc;
      curr=realr;curc=realc;
      if(curr===r&&curc===c){realr=realc=-1;return}
      /* it picks the fewest characters, for a vt100. Most ways are relative, and its idea of the column can be wrong
         after a tab (see fancyc), so which way it picks shows on the screen */
      var mode=0,count=('\u001b['+(r+1)+';'+(c+1)+'H').length,n,lND=3,lUP=3,lHO=3,lBC=1,i;
      if((n=r+c*lND+lHO)<count){mode=1;count=n}
      if(r>=curr){
        if((n=(r-curr)+c*lND+1)<count){mode=2;count=n}
        if(c>=curc&&(n=(r-curr)+(c-curc)*lND)<count){mode=3;count=n}
        if(c<curc&&(n=(r-curr)+(curc-c)*lBC)<count){mode=4;count=n}
      }
      if(r<curr){
        if((n=(curr-r)*lUP+c*lND+1)<count){mode=5;count=n}
        if(c>=curc&&(n=(curr-r)*lUP+(c-curc)*lND)<count){mode=6;count=n}
        if(c<curc&&(n=(curr-r)*lUP+(curc-c)*lBC)<count){mode=7;count=n}
      }
      if(curr===r&&c>curc&&linect[r]<curc&&c-curc<count)mode=8;
      switch(mode){
      case 0:case 1:tr=r;tc=c;break;
      case 2:tc=c;tr+=r-curr;break;
      case 3:tr+=r-curr;tc+=c-curc;break;
      case 4:tr+=r-curr;tc-=curc-c;break;
      case 5:tc=c;tr-=curr-r;break;
      case 6:tr-=curr-r;tc+=c-curc;break;
      case 7:tr-=curr-r;tc-=curc-c;break;
      case 8:for(i=0;i<c-curc;i++)addbuf(' ');
      }
      curr=r;curc=c;
      realr=-1;realc=-1;
    }
    function clear(){
      curr=curc=0;
      realr=realc=-1;
      for(var i=0;i<24;i++)linect[i]=-1;
      for(i=0;i<LI;i++)G[i]=blankline();
      tr=tc=0;
    }
    function cline(){
      if(curc>linect[curr])return;
      newpos();
      CEput();
      linect[curr]=curc-1;
    }
    function clend(){
      CDput();
      for(var i=curr;i<LI;i++)linect[i]=-1;
    }
    function newline(){
      cline();
      if(curr===LI-1)curmove(begscr,0);
      else curmove(curr+1,0);
    }
    function fancyc(c){
      var code=c.charCodeAt(0),sp;
      if(c==='\u0007')return;
      if(c==='\t'){
        sp=(curc+8)&~7;
        if(linect[curr]>=curc||sp<4){
          for(;sp>curc;sp--)addbuf(' ');
          curc=sp;
        }
        else curmove(curr,sp);
        return;
      }
      if(c==='\n'){newline();return}
      if(code<32)return;
      if(c>' '||linect[curr]>=curc){
        newpos();
        addbuf(c);
        if(c===' '&&linect[curr]===curc)linect[curr]--;
        else if(linect[curr]<curc)linect[curr]=curc;
        curc++;
      }
      else curmove(curr,curc+1);
    }
    function writec(c){fancyc(c)}
    function writel(l){for(var i=0;i<l.length;i++)fancyc(l.charAt(i))}
    function fixtty(){newpos()}
    function getout(){
      curmove(23,0);
      cline();
      fixtty();
      throw EXIT;
    }
    /* readc: the key, as the C sees it */
    var cflag=0;
    function* readc(){
      cline();
      newpos();
      var c=yield;
      if(c===127||c===-3)getout();
      if(c===27||c===13)return 10;
      if(cflag)return c;
      if(c===12)return 82;
      if(c>=97&&c<=122)return c&0o137;
      return c;
    }
    /* the game */
    var pnum=2,board=zero(26),dice=[0,0],mvlim=0,mvl=0,p=zero(5),g=zero(5),h=zero(4),cturn=0,d0=0,table=[],rscore=0,wscore=0,gvalue=1,dlast=0,bar=0,home=0,off=[0,0],offptr=0,offopp=1,inn=[0,0],inptr=0,inopp=1,ncin=0,cin=[],Colorptr=0,colorptr=2,ERASE=8,KILL=21,bflag=0;
    for(var t0=0;t0<6;t0++)table.push(zero(6));
    function swap(){var t=dice[0];dice[0]=dice[1];dice[1]=t;d0=1-d0}
    function init(){
      var i;
      for(i=0;i<26;)board[i++]=0;
      board[1]=2;
      board[6]=board[13]=-5;
      board[8]=-3;
      board[12]=board[19]=5;
      board[17]=3;
      board[24]=-2;
      off[0]=off[1]=-15;
      inn[0]=inn[1]=5;
      gvalue=1;
      dlast=0;
    }
    function wrint(n){
      var i,j,t;
      for(i=4;i>0;i--){
        t=1;
        for(j=0;j<i;j++)t*=10;
        if(n>t-1)writec(String.fromCharCode(Math.trunc(n/t)%10+48));
      }
      writec(String.fromCharCode(n%10+48));
    }
    function wrscore(){
      writel('Score:  ');writel(color[1]);writec(' ');wrint(rscore);
      writel(', ');writel(color[0]);writec(' ');wrint(wscore);
    }
    function gwrite(){
      var r=curr,c=curc;
      curmove(16,0);
      if(gvalue>1){
        writel('Game value:  ');wrint(gvalue);writel('.  ');
        writel(dlast===-1?color[0]:color[1]);
        writel(' doubled last.');
      }
      else if(pnum===-1)writel(plred);
      else if(pnum===0)writel(nocomp);
      else if(pnum===1)writel(plwhite);
      if(rscore||wscore){writel('  ');wrscore()}
      cline();
      curmove(r,c);
    }
    function proll(){
      if(d0)swap();
      writel(cturn===1?"Red's roll:  ":"White's roll:  ");
      writec(String.fromCharCode(dice[0]+48));
      writec(' ');
      writec(String.fromCharCode(dice[1]+48));
      cline();
    }
    function wrhit(i){writel('Blot hit on ');wrint(i);writec('.');writec('\n')}
    function nexturn(){
      cturn=-cturn;
      var c=cturn/abs(cturn);
      home=bar;
      bar=25-bar;
      offptr+=c;offopp-=c;
      inptr+=c;inopp-=c;
      Colorptr+=c;colorptr+=c;
    }
    function* yorn(special){
      var c,i=1;
      while((c=yield* readc())!==89&&c!==78){
        if(special&&c===special)return 2;
        if(i){writel('  (Y or N)');i=0}
      }
      writel(c===89?'  Yes.\n':'  No.\n');
      return c===89;
    }
    function* quit(){
      curmove(20,0);
      clend();
      writel('Are you sure you want to quit?');
      if(yield* yorn(0)){cturn=0;return 1}
      return 0;
    }
    function* save(n){
      var fname;
      if(n){
        curmove(20,0);
        clend();
        writel('Are you sure you want to leave now?');
        if(!(yield* yorn(0)))return;
      }
      cflag=1;
      for(;;){
        writel('Enter a file name:  ');
        fname=[];
        for(;;){
          var c=yield* readc();
          if(c===10)break;
          if(c===ERASE){
            if(fname.length)curmove(curr,curc-1),fname.pop();
            continue;
          }
          var ch=String.fromCharCode(c);
          fname.push(ch);
          writec(ch);
        }
        fname=fname.join('');
        var there=P.find?P.find(fname):null;
        if(!there)break;
        curmove(18,0);
        clend();
        writel("The file '");writel(fname);writel("' already exists.\nAre you sure you want to use this file?");
        cflag=0;
        if(yield* yorn(0))break;
        cflag=1;
      }
      if(P.writeFile)P.writeFile(fname,[board.concat(off,inn,dice,[cturn,dlast,pnum,rscore,wscore,gvalue,0]).join(' ')]);
      curmove(18,0);
      writel("This game has been saved on the file '");writel(fname);
      writel("'.\nType \"backgammon ");writel(fname);writel('" to recover your game.\n\n');
      clend();
      getout();
    }
    function last(){
      for(var i=home-6*cturn;i!==home;i+=cturn)if(board[i]*cturn>0)return abs(home-i);
      return 0;
    }
    function checkd(d){if(d0!==d)swap();return 0}
    function makmove(i){
      var n,d=d0,max;
      n=abs(g[i]-p[i]);
      max=off[offptr]<0?7:last();
      if(board[p[i]]*cturn<=0)return checkd(d)+2;
      if(g[i]!==home&&board[g[i]]*cturn<-1)return checkd(d)+3;
      if(i||dice[0]===dice[1]){
        if(n===max?dice[1]<n:dice[1]!==n)return checkd(d)+1;
      }
      else{
        if(n===max?dice[0]<n&&dice[1]<n:dice[0]!==n&&dice[1]!==n)return checkd(d)+1;
        if(n===max?dice[0]<n:dice[0]!==n){
          if(d0)return checkd(d)+1;
          swap();
        }
      }
      if(g[i]===home&&off[offptr]<0)return checkd(d)+4;
      h[i]=0;
      board[p[i]]-=cturn;
      if(g[i]!==home){
        if(board[g[i]]===-cturn){
          board[home]-=cturn;
          board[g[i]]=0;
          h[i]=1;
          if(abs(bar-g[i])<7){
            inn[inopp]--;
            if(off[offopp]>=0)off[offopp]-=15;
          }
        }
        board[g[i]]+=cturn;
        if(abs(home-g[i])<7&&abs(home-p[i])>6){
          inn[inptr]++;
          if(inn[inptr]+off[offptr]===0)off[offptr]+=15;
        }
      }
      else{
        off[offptr]++;
        inn[inptr]--;
      }
      return 0;
    }
    function backone(i){
      board[p[i]]+=cturn;
      if(g[i]!==home){
        board[g[i]]-=cturn;
        if(abs(g[i]-home)<7&&abs(p[i]-home)>6){
          inn[inptr]--;
          if(inn[inptr]+off[offptr]<15&&off[offptr]>=0)off[offptr]-=15;
        }
      }
      else{
        off[offptr]--;
        inn[inptr]++;
      }
      if(h[i]){
        board[home]+=cturn;
        board[g[i]]=-cturn;
        if(abs(bar-g[i])<7){
          inn[inopp]++;
          if(inn[inopp]+off[offopp]===0)off[offopp]+=15;
        }
      }
    }
    function movback(i){for(var j=i-1;j>=0;j--)backone(j)}
    function moverr(i){
      curmove(20,0);
      writel('Error:  ');
      for(var j=0;j<=i;j++){
        wrint(p[j]);
        writec('-');
        wrint(g[j]);
        if(j<i)writec(',');
      }
      writel('... ');
      movback(i);
    }
    function movallow(){
      var i,m,iold;
      if(d0)swap();
      m=dice[0]===dice[1]?4:2;
      for(i=0;i<4;i++)p[i]=bar;
      i=iold=0;
      while(i<m){
        if(off[offptr]===15)break;
        h[i]=0;
        if(board[bar]){
          g[i]=i===1||m===4?bar+cturn*dice[1]:bar+cturn*dice[0];
          if(makmove(i)){
            if(d0||m===4)break;
            swap();
            movback(i);
            if(i>iold)iold=i;
            for(i=0;i<4;i++)p[i]=bar;
            i=0;
          }
          else i++;
          continue;
        }
        if((p[i]+=cturn)===home){
          if(i>iold)iold=i;
          if(m===2&&i){
            movback(i);
            p[i--]=bar;
            if(p[i]!==bar)continue;
            else break;
          }
          if(d0||m===4)break;
          swap();
          movback(i);
          for(i=0;i<4;i++)p[i]=bar;
          i=0;
          continue;
        }
        g[i]=i===1||m===4?p[i]+cturn*dice[1]:p[i]+cturn*dice[0];
        if(g[i]*cturn>home){
          if(off[offptr]>=0)g[i]=home;
          else continue;
        }
        if(board[p[i]]*cturn>0&&makmove(i)===0)i++;
      }
      movback(i);
      return iold>i?iold:i;
    }
    /* board.c, on a terminal that can be addressed */
    function bsect(b,rpos,cpos,cnext){
      var j,n=abs(b),bct,k,pc=b>0?'r':'w';
      if(n<6&&cpos<54)curmove(rpos,cpos+1);
      else curmove(rpos,cpos);
      for(j=0;j<5;j++){
        for(k=0;k<15;k+=5)if(n>j+k)fancyc(pc);
        if(j<4){
          if(n<6){
            if(j+1===n)break;
            bct=1;
          }
          else if(n<11){
            if(cpos===54)bct=j+5>=n?1:2;
            if(cpos<54)bct=j+6>=n?1:2;
          }
          else bct=j+10>=n?2:3;
          curmove(curr+cnext,curc-bct);
        }
      }
    }
    function fboard(){
      var i,j,l;
      curmove(0,0);
      for(i=0;i<53;i++)fancyc('_');
      curmove(15,0);
      for(i=0;i<53;i++)fancyc('_');
      l=1;
      for(i=52;i>-1;i-=28){
        curmove(l===1?1:15,i);
        fancyc('|');
        for(j=0;j<14;j++){
          curmove(curr+l,curc-1);
          fancyc('|');
        }
        if(i===24)i+=32;
        l=-l;
      }
      curmove(2,1);
      for(i=13;i<18;i++){
        fancyc('1');
        fancyc(String(i%10));
        curmove(curr,curc+2);
      }
      fancyc('1');fancyc('8');
      curmove(2,29);
      fancyc('1');fancyc('9');
      for(i=20;i<25;i++){
        curmove(curr,curc+2);
        fancyc('2');
        fancyc(String(i%10));
      }
      curmove(14,1);
      fancyc('1');fancyc('2');
      for(i=11;i>6;i--){
        curmove(curr,curc+2);
        fancyc(i>9?'1':' ');
        fancyc(String(i%10));
      }
      curmove(14,30);
      fancyc('6');
      for(i=5;i>0;i--){
        curmove(curr,curc+3);
        fancyc(String(i));
      }
      for(i=12;i>6;i--)if(board[i])bsect(board[i],13,1+4*(12-i),-1);
      if(board[0])bsect(board[0],13,25,-1);
      for(i=6;i>0;i--)if(board[i])bsect(board[i],13,29+4*(6-i),-1);
      l=off[1]<0?off[1]+15:off[1];
      bsect(l,3,54,1);
      curmove(8,25);
      fancyc('B');fancyc('A');fancyc('R');
      for(i=13;i<19;i++)if(board[i])bsect(board[i],3,1+4*(i-13),1);
      if(board[25])bsect(board[25],3,25,1);
      for(i=19;i<25;i++)if(board[i])bsect(board[i],3,29+4*(i-19),1);
      l=off[0]<0?off[0]+15:off[0];
      bsect(-l,13,54,-1);
      for(i=0;i<26;i++)oldb[i]=board[i];
      oldr=off[1]<0?off[1]+15:off[1];
      oldw=-(off[0]<0?off[0]+15:off[0]);
    }
    function wrboard(){
      fixtty();
      clear();
      fboard();
      gwrite();
      curmove(18,0);
      fixtty();
    }
    function fixcol(r,c,l,ch,inc){
      curmove(r,c);
      fancyc(ch);
      for(var i=1;i<l;i++){
        curmove(curr+inc,curc-1);
        fancyc(ch);
      }
    }
    function fixpos(old,nw,r,c,inc){
      var o,n,nv,ov,nc,col;
      if(old*nw>=0){
        ov=abs(old);
        nv=abs(nw);
        col=old+nw>0?'r':'w';
        o=Math.trunc((ov-1)/5);
        n=Math.trunc((nv-1)/5);
        if(o===n){
          if(o===2)nc=c+2;
          if(o===1)nc=c<54?c:c+1;
          if(o===0)nc=c<54?c+1:c;
          if(ov>nv)fixcol(r+inc*(nv-n*5),nc,abs(ov-nv),' ',inc);
          else fixcol(r+inc*(ov-o*5),nc,abs(ov-nv),col,inc);
          return;
        }
        if(c<54){
          if(o+n===1){
            if(n){
              fixcol(r,c,abs(nv-5),col,inc);
              if(ov!==5)fixcol(r+inc*ov,c+1,abs(ov-5),col,inc);
            }
            else{
              fixcol(r,c,abs(ov-5),' ',inc);
              if(nv!==5)fixcol(r+inc*nv,c+1,abs(nv-5),' ',inc);
            }
            return;
          }
          if(n===2){
            if(ov!==10)fixcol(r+inc*(ov-5),c,abs(ov-10),col,inc);
            fixcol(r,c+2,abs(nv-10),col,inc);
          }
          else{
            if(nv!==10)fixcol(r+inc*(nv-5),c,abs(nv-10),' ',inc);
            fixcol(r,c+2,abs(ov-10),' ',inc);
          }
          return;
        }
        if(n>o){
          fixcol(r+inc*(ov%5),c+o,abs(5*n-ov),col,inc);
          if(nv!==5*n)fixcol(r,c+n,abs(5*n-nv),col,inc);
        }
        else{
          fixcol(r+inc*(nv%5),c+n,abs(5*n-nv),' ',inc);
          if(ov!==5*o)fixcol(r,c+o,abs(5*o-ov),' ',inc);
        }
        return;
      }
      nv=abs(nw);
      fixcol(r,c+1,nv,nw>0?'r':'w',inc);
      if(abs(old)<=abs(nw))return;
      fixcol(r+inc*nw,c+1,abs(old+nw),' ',inc);
    }
    function refresh(){
      var i,r=curr,c=curc;
      for(i=12;i>6;i--)if(board[i]!==oldb[i]){fixpos(oldb[i],board[i],13,1+(12-i)*4,-1);oldb[i]=board[i]}
      if(board[0]!==oldb[0]){fixpos(oldb[0],board[0],13,25,-1);oldb[0]=board[0]}
      for(i=6;i>0;i--)if(board[i]!==oldb[i]){fixpos(oldb[i],board[i],13,29+(6-i)*4,-1);oldb[i]=board[i]}
      i=-(off[0]<0?off[0]+15:off[0]);
      if(oldw!==i){fixpos(oldw,i,13,54,-1);oldw=i}
      for(i=13;i<19;i++)if(board[i]!==oldb[i]){fixpos(oldb[i],board[i],3,1+(i-13)*4,1);oldb[i]=board[i]}
      if(board[25]!==oldb[25]){fixpos(oldb[25],board[25],3,25,1);oldb[25]=board[25]}
      for(i=19;i<25;i++)if(board[i]!==oldb[i]){fixpos(oldb[i],board[i],3,29+(i-19)*4,1);oldb[i]=board[i]}
      i=off[1]<0?off[1]+15:off[1];
      if(oldr!==i){fixpos(oldr,i,3,54,1);oldr=i}
      curmove(r,c);
      newpos();
    }
    /* table.c */
    function* dotable(c,i){
      var test_=c===82,a,chs=c===-1?'':String.fromCharCode(c);
      while((a=atmata[i][0])!=='.'){
        if(a===chs||(test_&&a==='\n')){
          switch(atmata[i][1]){
          case 1:
            wrboard();
            curmove(cturn===-1?18:19,0);
            proll();
            writel('\t\t');
            break;
          case 2:
            if(p[mvl]===-1)p[mvl]=c-48;
            else p[mvl]=p[mvl]*10+c-48;
            break;
          case 3:
            if(g[mvl]!==-1){
              if(mvl<mvlim)mvl++;
              p[mvl]=p[mvl-1];
            }
            g[mvl]=p[mvl]+cturn*(c-48);
            if(g[mvl]<0)g[mvl]=0;
            if(g[mvl]>25)g[mvl]=25;
            break;
          case 4:
            if(g[mvl]===-1)g[mvl]=c-48;
            else g[mvl]=g[mvl]*10+c-48;
            break;
          case 5:
            if(mvl<mvlim)mvl++;
            p[mvl]=g[mvl-1];
            break;
          case 6:
            if(mvl<mvlim)mvl++;
            break;
          case 7:
            curmove(20,0);
            yield* text(help2);
            curmove(cturn===-1?18:19,39);
            break;
          case 8:p[mvl]=bar;break;
          case 9:g[mvl]=home;break;
          }
          if(!test_||a!=='\n')return atmata[i][2];
          return -6;
        }
        i++;
      }
      return -5;
    }
    function* rsetbrd(){
      var i,j,n=0;
      mvl=0;
      for(i=0;i<4;i++)p[i]=g[i]=-1;
      for(j=0;j<ncin;j++)n=yield* dotable(cin[j],n);
      return n;
    }
    function movokay(mv){
      var i,m;
      if(d0)swap();
      for(i=0;i<mv;i++){
        if(p[i]===g[i]){
          moverr(i);
          curmove(20,0);
          writel('Attempt to move to same location.\n');
          return 0;
        }
        if(cturn*(g[i]-p[i])<0){
          moverr(i);
          curmove(20,0);
          writel('Backwards move.\n');
          return 0;
        }
        if(abs(board[bar])&&p[i]!==bar){
          moverr(i);
          curmove(20,0);
          writel('Men still on bar.\n');
          return 0;
        }
        if((m=makmove(i))){
          moverr(i);
          if(m===1)writel('Move not rolled.\n');
          else if(m===2)writel('Bad starting position.\n');
          else if(m===3)writel('Destination occupied.\n');
          else if(m===4)writel("Can't remove men yet.\n");
          return 0;
        }
      }
      return 1;
    }
    function* checkmove(ist){
      var j,n,c;
      for(;;){ /* domove */
        if(ist===0){
          curmove(curr,32);
          writel('Move:  ');
        }
        ist=mvl=ncin=0;
        for(j=0;j<5;j++)p[j]=g[j]=-1;
        var again=false;
        for(;;){ /* dochar */
          c=yield* readc();
          if(c===83){
            yield* save(1);
            curmove(cturn===-1?18:19,39);
            ist=-1;
            again=true;
            break;
          }
          if(c===ERASE&&ncin>0){
            curmove(curr,curc-1);
            ncin--;
            n=yield* rsetbrd();
            if(n===0){n=-1;refresh()}
            if((ist=n)>0)continue;
            again=true;
            break;
          }
          if(c===KILL&&ncin>0){
            refresh();
            curmove(curr,39);
            ist=-1;
            again=true;
            break;
          }
          n=yield* dotable(c,ist);
          if(n>=0){
            cin[ncin++]=c;
            if(n>2)if(c!==10)writec(String.fromCharCode(c));
            ist=n;
            if(n)continue;
            again=true;
            break;
          }
          if(n===-1&&mvl>=mvlim)return 0;
          if(n===-1&&mvl<mvlim-1)return -4;
          if(n===-6){
            if(movokay(mvl+1)){
              refresh();
              movback(mvl+1);
            }
            else curmove(cturn===-1?18:19,ncin+39);
            ist=n=yield* rsetbrd();
            continue;
          }
          if(n!==-5)return n;
        }
        if(!again)return;
      }
    }
    function* getmove(){
      var i,c=0;
      for(;;){
        i=yield* checkmove(c);
        switch(i){
        case -1:
          if(movokay(mvlim)){
            curmove(20,0);
            for(i=0;i<mvlim;i++)if(h[i])wrhit(g[i]);
            nexturn();
            if(off[offopp]===15)cturn*=-2;
            if(pnum)bflag=pnum;
            return;
          }
          /* falls through */
        case -4:case 0:
          refresh();
          if(i!==0&&i!==-4)break;
          curmove(20,0);
          writel(color[Colorptr]);
          writel(i===-4?' must make ':' can only make ');
          writec(String.fromCharCode(mvlim+48));
          writel(' move');
          if(mvlim>1)writec('s');
          writec('.');
          writec('\n');
          break;
        case -3:
          if(yield* quit())return;
        }
        curmove(cturn===-1?18:19,39);
        cline();
        c=-1;
      }
    }
    /* ttext2.c: it shows lines until an empty one, which is where it waits */
    function* text(txt){
      var k=0,b,i;
      fixtty();
      while(k<txt.length){
        var l=txt[k++];
        if(l!==''){
          writel(l);
          writec('\n');
        }
        else{
          fixtty();
          writel(prompt);
          for(;;){
            b=yield* readc();
            if(b===63){
              if(begscr){curmove(18,0);clend()}
              else clear();
              yield* text(T.list);
              writel(prompt);
              continue;
            }
            i=0;
            if(b===10)break;
            var bc=String.fromCharCode(b);
            while(i<11){
              if(bc===opts.charAt(i))break;
              i++;
            }
            if(i!==11)break;
          }
          if(begscr){curmove(18,0);clend()}
          else clear();
          if(i)return i;
          fixtty();
          curmove(curr,0);
        }
      }
      fixtty();
      return 0;
    }
    function clrest(){
      var r=curr,c=curc;
      for(var j=r+1;j<24;j++){
        curmove(j,0);
        cline();
      }
      curmove(r,c);
    }
    function brdeq(b1,b2){for(var i=0;i<26;i++)if(b1[i]!==b2[i])return false;return true}
    function leave(){
      clear();
      fixtty();
      throw {leave:true};
    }
    function* tutor(){
      var i=0,j;
      begscr=18;
      cturn=-1;
      home=0;bar=25;
      inptr=0;inopp=1;offptr=0;offopp=1;Colorptr=0;colorptr=2;
      wrboard();
      for(;;){
        if(!brdeq(test[i].brd,board)){
          if(curr===23)curmove(18,0);
          writel(better);
          nexturn();
          movback(mvlim);
          refresh();
          clrest();
          if(curr===19){
            proll();
            writec('\t');
          }
          else curmove(curr>19?curr-2:curr+4,25);
          yield* getmove();
          if(cturn===0)leave();
          continue;
        }
        curmove(18,0);
        yield* text(T[test[i].com]);
        if(i===maxmoves)break;
        dice[0]=test[i].roll1;
        dice[1]=test[i].roll2;
        d0=0;
        mvlim=0;
        for(j=0;j<4;j++){
          if(test[i].mp[j]===test[i].mg[j])break;
          p[j]=test[i].mp[j];
          g[j]=test[i].mg[j];
          mvlim++;
        }
        if(mvlim)for(j=0;j<mvlim;j++)if(makmove(j))writel('AARGH!!!\n');
        refresh();
        nexturn();
        dice[0]=test[i].new1;
        dice[1]=test[i].new2;
        d0=0;
        i++;
        mvlim=movallow();
        if(mvlim){
          clrest();
          proll();
          writec('\t');
          yield* getmove();
          refresh();
          if(cturn===0)leave();
        }
      }
      leave();
    }
    function* main(){
      var i,CH=['','','intro1'];
      clear();
      yield* text(T.hello);
      yield* text(T.list);
      i=yield* text(contin);
      if(i===0)i=2;
      init();
      while(i){
        if(i===1)leave();
        var seq=[[2,'intro1'],[2,'intro2'],[3,'moves'],[4,'remove'],[5,'hits'],[6,'endgame'],[7,'doubl'],[8,'stragy'],[9,'prog'],[10,'lastch']],at=-1,k;
        for(k=0;k<seq.length;k++)if(seq[k][0]===i){at=k;break}
        i=0;
        for(k=at;k<seq.length;k++){
          if(seq[k][1]==='intro2')wrboard();
          if((i=yield* text(T[seq[k][1]])))break;
        }
      }
      yield* tutor();
    }
    var game=main(),over=false;
    function end(left){
      over=true;
      S.close();
      finish_();
      if(!left)return;
      if(P.cmds&&P.cmds.backgammon)P.cmds.backgammon(['n'],'backgammon n',['backgammon','n']);
      else P.typeLine('Help! Backgammon program is missing!!','err');
    }
    function step(v){
      var r;
      try{r=game.next(v)}
      catch(e){
        if(e===EXIT){end(false);return}
        if(e&&e.leave){end(true);return}
        throw e;
      }
      if(r.done){end(false);return}
      view();
    }
    var api={
      feed:function(k){
        if(over)return;
        if(k==='C-c'){step(-3);return}
        var c=k==='Enter'?13:k==='Backspace'?8:k==='Tab'?9:k==='Escape'?27:k.length===1?k.charCodeAt(0):/^C-[a-z]$/.test(k)?k.charCodeAt(2)-96:-1;
        if(c>=0)step(c);
      },
      draw:view
    };
    step();
    return api;
  },{tty:'teachgammon',fit:[CO,LI]});
}});
})(window.Phosphor);
