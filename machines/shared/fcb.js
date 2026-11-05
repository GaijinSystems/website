/* PHOSPHOR-9 terminal: eight-dot-three file names, for the machines that have them.
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE. */
(function(P){
'use strict';
function split(k){var i=k.lastIndexOf('.');return i>0?[k.slice(0,i),k.slice(i+1)]:[k,'']}
P.fcb={
  cmd:function(names,help,run){var d={names:names,noHelpFlag:true,run:run};if(help)d.help=help;P.command(d)},
  split:split,
  name:function(k){var s=split(k);return s[0].slice(0,8).toUpperCase().padEnd(8)+' '+s[1].slice(0,3).toUpperCase().padEnd(3)},
  matcher:function(pat){ /* *.* and ?, the way COMMAND.COM reads them: name and extension apart */
    var p=split(pat.toLowerCase()),one=function(x,y){
      return new RegExp('^'+x.replace(/[.+^${}()|\\\[\]]/g,'\\$&').replace(/\*.*$/,'.*').replace(/\?/g,'.?')+'$').test(y);
    };
    return function(k){var s=split(k);return one(p[0],s[0])&&one(p[1],s[1])};
  }
};
P.setup(function(){}); /* nothing to do at start: this notes the file as loaded */
})(window.Phosphor);
