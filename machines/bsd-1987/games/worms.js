/* PHOSPHOR-9 terminal: machine "bsd-1987", worms. Ported to JavaScript for this terminal from 4.3BSD's
   games/worms.c, 5.3 (Berkeley) 7/15/85, by Eric P. Scott, Caltech High Energy Physics, October 1980.
   It keeps this notice:

 @(#) Copyright (c) 1980 Regents of the University of California.
 All rights reserved.

   Differences: the C writes as fast as the line takes it, and this draws a round every 33 ms, about what 9600
   baud allowed. The terminal it assumes is a vt100: automatic margins, which is why the corner is never
   written, and a reverse scroll, which -field uses to fill the last line. The screen keeps the size it had at the start,
   and may have more than the 24 lines the C has room for.
 */
(function(P){
'use strict';
var flavor=['O','*','#','$','%','0'],xinc=[1,1,1,0,-1,-1,-1,0],yinc=[-1,0,1,1,1,0,-1,-1];
function N(n,o){return {nopts:n,opts:o}}
var Z=N(0,[0,0,0]);
var normal=[N(3,[7,0,1]),N(3,[0,1,2]),N(3,[1,2,3]),N(3,[2,3,4]),N(3,[3,4,5]),N(3,[4,5,6]),N(3,[5,6,7]),N(3,[6,7,0])],
  upper=[N(1,[1,0,0]),N(2,[1,2,0]),Z,Z,Z,N(2,[4,5,0]),N(1,[5,0,0]),N(2,[1,5,0])],
  left=[Z,Z,Z,N(2,[2,3,0]),N(1,[3,0,0]),N(2,[3,7,0]),N(1,[7,0,0]),N(2,[7,0,0])],
  right=[N(1,[7,0,0]),N(2,[3,7,0]),N(1,[3,0,0]),N(2,[3,4,0]),Z,Z,Z,N(2,[6,7,0])],
  lower=[Z,N(2,[0,1,0]),N(1,[1,0,0]),N(2,[1,5,0]),N(1,[5,0,0]),N(2,[5,6,0]),Z,Z],
  upleft=[Z,Z,Z,Z,Z,N(1,[3,0,0]),N(2,[1,3,0]),N(1,[1,0,0])],
  upright=[N(2,[3,5,0]),N(1,[3,0,0]),Z,Z,Z,Z,Z,N(1,[5,0,0])],
  lowleft=[N(3,[7,0,1]),Z,Z,N(1,[1,0,0]),N(2,[1,7,0]),N(1,[7,0,0]),Z,Z],
  lowright=[Z,N(1,[7,0,0]),N(2,[5,7,0]),N(1,[5,0,0]),Z,Z,Z,Z];
function atoi(s){var m=/^[ \t\n]*([-+]?\d+)/.exec(s);return m?parseInt(m[1],10):0}
P.command({names:['worms'],run:function(a,raw,words){
  var length=16,number=3,trail=' ',field=null,me=words[0],i;
  function usage(){P.say(['usage: '+me+' [-field] [-length #] [-number #] [-trail]']);P.status(1)}
  for(i=1;i<words.length;i++){
    var p=words[i].charAt(0)==='-'?words[i].slice(1):words[i];
    switch(p.charAt(0)){
    case 'f':field='WORM';break;
    case 'l':
      if(++i===words.length){usage();return}
      length=atoi(words[i]);
      if(length<2||length>1024){P.say([me+': Invalid length']);P.status(1);return}
      break;
    case 'n':
      if(++i===words.length){usage();return}
      number=atoi(words[i]);
      if(number<1||number>40){P.say([me+': Invalid number of worms']);P.status(1);return}
      break;
    case 't':trail='.';break;
    default:usage();return;
    }
  }
  P.program(function(S,done){
    var CO=S.cols,LI=S.rows,last=CO-1,bottom=LI-1,C=S.grid(),ref=[],worm=[],randx=1,over=false,n,x,y,cx=0,cy=0,fp=0;
    function ranf(){
      randx=(Math.imul(randx,1103515245)+12345)&0x7fffffff;
      return Math.fround(Math.fround(randx)/2147483647);
    }
    function put(c,r,ch){if(C[r])C[r][c]=ch;cx=c+1;cy=r}
    function fieldchar(){var ch=field.charAt(fp);if(++fp===field.length)fp=0;return ch}
    function draw(){
      S.drawGrid(C.slice(0,S.rows).map(function(row){return row.slice(0,S.cols)}),Math.min(cy,S.rows-1),Math.min(cx,S.cols-1));
    }
    for(n=0;n<LI;n++){var R=[];for(x=0;x<CO;x++)R.push(0);ref.push(R)}
    ref[bottom][last]=1;
    for(n=0;n<number;n++){
      var xp=[],yp=[];
      for(x=0;x<length;x++){xp.push(-1);yp.push(-1)}
      worm.push({orientation:0,head:0,xpos:xp,ypos:yp});
    }
    if(field){
      for(y=0;y<bottom;y++)for(x=0;x<CO;x++)C[y][x]=fieldchar();
      /* home, reverse scroll, and one more line: so that the corner gets written */
      C.pop();
      var top=[];
      for(x=0;x<CO;x++)top.push(fieldchar());
      C.unshift(top);
    }
    function round(){
      for(var n=0;n<number;n++){
        var w=worm[n],h=w.head,x,y;
        if((x=w.xpos[h])<0){
          x=w.xpos[h]=0;y=w.ypos[h]=bottom;
          put(x,y,flavor[n%6]);
          ref[y][x]++;
        }
        else y=w.ypos[h];
        if(++h===length)h=0;
        w.head=h;
        if(w.xpos[h]>=0){
          var x1=w.xpos[h],y1=w.ypos[h];
          if(--ref[y1][x1]===0)put(x1,y1,trail);
        }
        var op=(x===0?(y===0?upleft:(y===bottom?lowleft:left)):
          (x===last?(y===0?upright:(y===bottom?lowright:right)):
          (y===0?upper:(y===bottom?lower:normal))))[w.orientation];
        switch(op.nopts){
        case 0:throw new Error('abort');
        case 1:w.orientation=op.opts[0];break;
        default:w.orientation=op.opts[Math.trunc(Math.fround(ranf()*op.nopts))]|0;
        }
        x+=xinc[w.orientation];y+=yinc[w.orientation];
        cx=x;cy=y;
        if(x!==last||y!==bottom)put(x,y,flavor[n%6]);
        ref[w.ypos[h]=y][w.xpos[h]=x]++;
      }
    }
    function tick(){
      if(over)return;
      round();draw();
      setTimeout(tick,33);
    }
    draw();
    setTimeout(tick,0);
    return {
      feed:function(k){if(k==='C-c'){over=true;S.close();done()}},
      draw:draw
    };
  },{tty:'worms'});
}});
})(window.Phosphor);
