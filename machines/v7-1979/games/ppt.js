/* PHOSPHOR-9 terminal: machine "v7-1979", ppt, the paper tape. Ported to JavaScript for this terminal
   from 2.11BSD's ppt.c, which carries no notice. V7 shipped only the binary. */
(function(P){
'use strict';
function row(b){
  var o='|',i;
  for(i=7;i>=0;i--){
    if(i===2)o+='.';
    o+=b&(1<<i)?'o':' ';
  }
  return o+'|';
}
function punch(s){ /* one line of tape, with its newline */
  var L=[],i;
  for(i=0;i<s.length;i++)L.push(row(s.charCodeAt(i)&255));
  L.push(row(10));
  return L;
}
var EDGE='___________';
P.command({names:['ppt'],run:function(){
  P.say([EDGE]);
  var I=P.stdin();
  if(I){
    I.forEach(function(l){P.say(punch(l))});
    P.say([EDGE]);
    return;
  }
  (function more(){
    P.ask('',function(l){
      if(l===P.INT)return;
      if(l===null){P.say([EDGE]);return}
      P.say(punch(l));more();
    },true);
  })();
}});
})(window.Phosphor);
