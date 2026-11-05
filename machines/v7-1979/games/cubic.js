/* PHOSPHOR-9 terminal: machine "v7-1979", cubic, tic-tac-toe on a 4x4x4 board. New code, written to match what V7's
   /usr/games/cubic does when run under a simulator; its source does not survive, and nothing here is translated from its
   binary. The questions, the replies and the way it announces a forced win are the original's. How it plays is this file's
   own: a search for a run of forcing moves, then a simple score of the open lines. It doesn't always choose the original's
   moves. The original always starts at 323, as this does. */
(function(P){
'use strict';
var LINES=[],AT=[],i;
(function(){
  function idx(a,b,c){return a*16+b*4+c}
  var a,b,c,d,seen={},dirs=[];
  for(a=-1;a<2;a++)for(b=-1;b<2;b++)for(c=-1;c<2;c++)if(a||b||c)dirs.push([a,b,c]);
  for(i=0;i<64;i++)AT.push([]);
  for(a=0;a<4;a++)for(b=0;b<4;b++)for(c=0;c<4;c++)dirs.forEach(function(D){
    var L=[],x=a,y=b,z=c;
    while(x>=0&&x<4&&y>=0&&y<4&&z>=0&&z<4){L.push(idx(x,y,z));x+=D[0];y+=D[1];z+=D[2]}
    if(L.length!==4)return;
    var k=L.slice().sort(function(p,q){return p-q}).join();
    if(seen[k])return;
    seen[k]=1;
    d=LINES.length;LINES.push(L);
    L.forEach(function(n){AT[n].push(d)});
  });
})();
function name(n){return ''+(1+(n>>4))+(1+((n>>2)&3))+(1+(n&3))}
var ME=1,YOU=2;
/* the cell that would finish a line for who, or -1; with count, how many such cells there are */
function finish(B,who,all){
  var R=[];
  LINES.forEach(function(L){
    var mine=0,free=-1;
    L.forEach(function(n){if(B[n]===who)mine++;else if(B[n]===0)free=n});
    if(mine===3&&free>=0&&R.indexOf(free)<0)R.push(free);
  });
  return all?R:(R.length?R[0]:-1);
}
function force(B,depth,seq){ /* a run of moves each leaving the other side one reply, ending in two threats */
  if(depth<=0)return null;
  if(finish(B,YOU)>=0)return null; /* it would have to answer that first */
  var C=[],n,i;
  for(n=0;n<64;n++){
    if(B[n])continue;
    /* only a move onto a line with two of mine and two free makes a threat */
    if(AT[n].some(function(d){var m=0,y=0;LINES[d].forEach(function(c){if(B[c]===ME)m++;else if(B[c]===YOU)y++});return m===2&&y===0}))C.push(n);
  }
  for(i=0;i<C.length;i++){
    n=C[i];
    B[n]=ME;
    var T=finish(B,ME,true);
    if(T.length>=2&&finish(B,YOU)<0){B[n]=0;return seq.concat([[n]])}
    if(T.length===1){
      var r=T[0];
      B[r]=YOU;
      var got=force(B,depth-1,seq.concat([[n,r]]));
      B[r]=0;
      if(got){B[n]=0;return got}
    }
    B[n]=0;
  }
  return null;
}
function score(B,n){
  var s=0;
  AT[n].forEach(function(d){
    var m=0,y=0;
    LINES[d].forEach(function(c){if(B[c]===ME)m++;else if(B[c]===YOU)y++});
    if(m&&y)return;
    if(y)s+=[0,3,9,0][y];
    else s+=[1,4,12,0][m];
  });
  return s;
}
P.command({names:['cubic'],run:function(){
  P.cprog(function*(io){
    var B=[],n,moved=0;
    for(n=0;n<64;n++)B.push(0);
    function place(n){B[n]=ME;moved++;io.print(name(n)+'\n')}
    function machine(){ /* true when the game is over */
      var w=finish(B,ME);
      if(w<0){
        var S=force(B,8,[]);
        if(S===null){
          var b=finish(B,YOU);
          if(b>=0){place(b);return false}
        }
        else{
          io.print('I have a force win:\n');
          S.forEach(function(p){io.print(p.map(name).join(' ')+'\n')});
          io.print('QED\n');
          return true;
        }
        if(moved===0){place(38);return false} /* 323 */
        var best=-1,top=-1;
        for(n=0;n<64;n++)if(!B[n]){var s=score(B,n);if(s>top){top=s;best=n}}
        if(best<0)return true;
        place(best);
        return false;
      }
      io.print('I have a force win:\n'+name(w)+'\nQED\n');
      return true;
    }
    io.print('Type y to move first: ');
    var l=yield* io.gets();
    if(l===null)return;
    if(l.charAt(0)!=='y'&&machine())return;
    for(;;){
      l=yield* io.gets();
      if(l===null)return;
      var m=/^[1-4][1-4][1-4]$/.exec(l);
      if(!m){io.print('Illegal move\n');continue}
      n=(l.charCodeAt(0)-49)*16+(l.charCodeAt(1)-49)*4+(l.charCodeAt(2)-49);
      if(B[n]){io.print('Illegal move\n');continue}
      B[n]=YOU;
      if(AT[n].some(function(d){return LINES[d].every(function(c){return B[c]===YOU})})){io.print('You win\n');return}
      if(machine())return;
    }
  });
}});
})(window.Phosphor);
