/* PHOSPHOR-9 terminal: machine "bsd-1987", snscore. Ported to JavaScript for this terminal from 4.3BSD's
   games/snake/snscore.c. The scores are the ones snake keeps in this browser. It keeps this notice:

 * Copyright (c) 1980 Regents of the University of California.
 * All rights reserved.  The Berkeley software License Agreement
 * specifies the terms and conditions for redistribution.
 */
(function(P){
'use strict';
P.command({names:['snscore'],run:function(){
  var R=P.saved('snake/scores'),best=R&&typeof R.best==='object'&&R.best||{},j=1,out=['Snake players scores to date'];
  var L=Object.keys(best).filter(function(u){return typeof best[u]==='number'&&best[u]>0}).map(function(u){return {n:u,s:best[u]}});
  L.sort(function(a,b){return b.s-a.s});
  L.forEach(function(p,i){
    out.push(j+':\t$'+p.s+'\t'+p.n);
    if(p.s>(L[i+1]?L[i+1].s:0))j=i+2;
  });
  P.say(out);
}});
})(window.Phosphor);
