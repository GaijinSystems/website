/* PHOSPHOR-9 terminal: machine "v7-1979", the programs in /usr/games, which are all there and none of which will run.
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE. */
(function(P){
'use strict';
['arithmetic','backgammon','banner','bcd','bj','checkers','chess','ching','cubic','fortune','hangman','maze','moo','ppt','quiz','reversi','ttt','words','wump'].forEach(function(n){
  P.command({names:[n],hidden:true,noHelpFlag:true,run:function(){P.typeLine(n+': games are off while payroll runs. see the operator.')}});
});
})(window.Phosphor);
