/* PHOSPHOR-9 terminal: machine "bsd-1987", two things worth finding: wargames and tunefs.
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE. Their words are from the
   4.3BSD sources, copyright the Regents of the University of California. */
(function(P){
'use strict';
var GAMES=['adventure','backgammon','boggle','canfield','chess','cribbage','fish','fortune','hangman','mille','monop','rogue','snake','trek','wump','zork'];
/* the rest of /usr/games: all there, and the load is always too high */
P.stubs(['aardvark','arithmetic','backgammon','battlestar','bcd','boggle','btlgammon','canfield','cfscores','chess','ching','cribbage','doctor','fish','fortune','hunt','mille','monop','quiz','rain','sail','snscore','teachgammon','trek','worms','zork'],function(n){
  P.typeLine(n+': load average too high. try again after hours.');
},{hidden:true,noHelpFlag:true});
P.command({names:['wargames'],path:'/usr/games',noHelpFlag:true,run:function(){
  P.ask('Would you like to play a game? ',function(l){
    var x=(l||'').trim();
    if(GAMES.indexOf(x)<0){P.typeLine('Funny, the only way to win is not to play at all');return}
    if(P.cmds[x])P.cmds[x]([],x,[x]);
    else P.typeLine('/usr/games/'+x+': not found','err');
  });
}});
P.command({names:['tunefs'],path:'/etc',
  man:{what:'tune up an existing file system',syn:'tunefs tuneup-options special',desc:[
    'changes the dynamic parameters of a file system, which affect how it lays out blocks.'],bugs:[
    'this program should work on mounted and active file systems. because the super-block is not kept in the buffer cache, the changes will only take effect if the program is run on dismounted file systems. to change the root file system, the system must be rebooted after the file system is tuned.',
    '',
    "you can tune a file system, but you can't tune a fish."]},
  run:function(a){
    if(!a.length){P.typeLine('Usage: tunefs tuneup-options special-device','err');return}
    P.typeLine('tunefs: '+a[a.length-1]+': cannot open','err');
  }});
})(window.Phosphor);
