/* PHOSPHOR-9 terminal: machine "bsd-1987", rain. Ported to JavaScript for this terminal from 4.3BSD's
   games/rain.c, rain 11/3/1980 EPS/CITHEP. It keeps this notice:

 * Copyright (c) 1980 Regents of the University of California.
 * All rights reserved.  The Berkeley software License Agreement
 * specifies the terms and conditions for redistribution.
 */
(function(P){
'use strict';
P.command({names:['rain'],run:function(){
  if(P.piped()){P.typeLine('rain: needs a terminal','err');return}
  P.program(function(S,done){
    var randx=1,C,cols,lines,x,y,j=0,xpos=[0,0,0,0,0],ypos=[0,0,0,0,0],cx=0,cy=0,over=false;
    function ranf(){ /* it never seeds, so it is the same storm every time, as it was */
      randx=(Math.imul(randx,1103515245)+12345)&0x7fffffff;
      return Math.fround(Math.fround(randx)/2147483647);
    }
    function size(){C=S.grid();cols=S.cols-4;lines=S.rows-4}
    function at(c,r){cx=c;cy=r}
    function put(t){
      for(var i=0;i<t.length;i++){
        if(C[cy]&&cx>=0&&cx<S.cols)C[cy][cx]=t.charAt(i);
        cx++;
      }
    }
    function under(){cy++;cx-=2} /* down, and back over the two it just wrote */
    function prev(){if(j===0)j=4;else--j}
    function frame(){
      x=Math.trunc(cols*ranf())+2;
      y=Math.trunc(lines*ranf())+2;
      at(x,y);put('.');
      at(xpos[j],ypos[j]);put('o');
      prev();
      at(xpos[j],ypos[j]);put('O');
      prev();
      at(xpos[j],ypos[j]-1);put('-');
      cy++;cx-=2;put('|.|');
      under();put('-');
      prev();
      at(xpos[j],ypos[j]-2);put('-');
      under();put('/ \\');
      at(xpos[j]-2,ypos[j]);put('| O |');
      at(xpos[j]-1,ypos[j]+1);put('\\ /');
      under();put('-');
      prev();
      at(xpos[j],ypos[j]-2);put(' ');
      under();put(' ');cx++;put(' ');
      at(xpos[j]-2,ypos[j]);put(' ');cx++;put(' ');cx++;put(' ');
      at(xpos[j]-1,ypos[j]+1);put(' ');cx++;put(' ');
      under();put(' ');
      xpos[j]=x;ypos[j]=y;
    }
    function draw(){S.drawGrid(C,Math.min(cy,S.rows-1),Math.max(0,Math.min(cx,S.cols-1)))}
    function tick(){
      if(over)return;
      frame();draw();
      setTimeout(tick,100);
    }
    size();
    for(var i=5;--i>=0;){
      xpos[i]=Math.trunc(cols*ranf())+2;
      ypos[i]=Math.trunc(lines*ranf())+2;
    }
    setTimeout(tick,0);
    return {
      feed:function(k){if(k==='C-c'){over=true;S.close();done()}},
      draw:draw,
      resize:function(){size();draw()}
    };
  });
}});
})(window.Phosphor);
