/* PHOSPHOR-9 terminal: sl, a steam locomotive for those who type sl for ls. After Toyoda Masashi's sl, whose
   behaviour it follows; the program and the drawings are new, made for this terminal.
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE. */
(function(P){
'use strict';
var BIG=[
'      ____                                     ',
'     |____|     _______         _______________ ',
'     _|  |_____|  ___  |       |  _   _   _    |',
'    |          | |___| |=======| |_| |_| |_|   |',
'   /|__________|_______|       |_______________|',
'  /__(W)___(W)___(W)___|         (W)       (W)  '];
var LITTLE=[
'   _   ____    ____  ',
'  | |_|____|__|____| ',
'  |____________||__| ',
'   (W) (W)  (W) (W)  '];
var SMOKE=[['  (@@)   (  )    (@)','(   )  (@@@)'],['   (  )  (@@)   (  )','  (@@@)  (  )']];
var SPOKE='-\\|/';
P.command({names:['sl'],run:function(a,raw,w){
  var f=w.slice(1).filter(function(x){return /^-/.test(x)}).join(''),little=/l/.test(f),fly=/F/.test(f),crash=/a/.test(f),stoppable=/e/.test(f);
  var T=little?LITTLE:BIG,width=T[0].length,smokeAt=little?1:4;
  P.program(function(S,done){
    var x=S.cols,k=0,over=false;
    function stop(){if(over)return;over=true;S.close();done()}
    function draw(){
      var C=S.grid(),h=T.length+2,base=fly?Math.max(0,S.rows-h-Math.floor((S.cols-x)/6)):Math.max(0,Math.floor((S.rows-h)/2)),wheel=SPOKE.charAt(k%4),i,j;
      function put(r,c,s){
        if(r<0||r>=S.rows)return;
        for(var q=0;q<s.length;q++){var cc=c+q;if(cc>=0&&cc<S.cols&&s.charAt(q)!==' ')C[r][cc]=s.charAt(q)}
      }
      var sm=SMOKE[Math.floor(k/4)%2];
      put(base,x+smokeAt+4,sm[1]);put(base+1,x+smokeAt,sm[0]);
      for(i=0;i<T.length;i++)put(base+2+i,x,T[i].replace(/W/g,wheel));
      if(crash&&!little){put(base+1,x+33,k%8<4?'Help!':'  Help!');for(j=0;j<3;j++)put(base+5,x+33+j*4,k%2?'o':'O')}
      S.drawGrid(C,-1,0);
    }
    S.every(40,function(){
      x--;k++;
      if(x<-width-20){stop();return}
      draw();
    });
    draw();
    return {feed:function(key){if(key==='C-c'&&stoppable)stop()},draw:draw};
  },{tty:'sl'});
}});
})(window.Phosphor);
