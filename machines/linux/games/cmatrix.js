/* PHOSPHOR-9 terminal: cmatrix, columns of characters falling down the glass, as the program of that name draws
   them. Written for this terminal. Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE. */
(function(P){
'use strict';
function glyph(){return String.fromCharCode(33+Math.floor(Math.random()*94))}
P.command({names:['cmatrix'],run:function(a,raw,w){
  var args=w.slice(1),saver=false,delay=4;
  for(var i=0;i<args.length;i++){
    if(/^-[a-zA-Z]*s/.test(args[i]))saver=true;
    if(args[i]==='-u'){var d=parseInt(args[++i],10);if(!(d>=0&&d<=10)){P.typeLine(' Argument for -u must be between 0 and 10','err');return}delay=d}
  }
  P.program(function(S,done){
    var drops=[],cells=[],over=false,t;
    function reset(){
      drops=[];cells=[];
      for(var r=0;r<S.rows;r++)cells.push(new Array(S.cols).fill(' '));
      for(var c=0;c<S.cols;c+=2)drops.push(fresh(c,true));
    }
    function fresh(c,first){return {c:c,y:first?-Math.floor(Math.random()*S.rows):-1-Math.floor(Math.random()*S.rows/2),len:3+Math.floor(Math.random()*(S.rows*.6)),slow:Math.random()<.4,tick:0}}
    function step(){
      drops.forEach(function(d,n){
        if(d.slow&&(d.tick++)%2)return;
        d.y++;
        if(d.y>=0&&d.y<S.rows)cells[d.y][d.c]=glyph();
        var tail=d.y-d.len;
        if(tail>=0&&tail<S.rows)cells[tail][d.c]=' ';
        if(tail>=S.rows)drops[n]=fresh(d.c,false);
        if(Math.random()<.04&&d.y>0&&d.y-1<S.rows&&d.y-1>tail)cells[d.y-1][d.c]=glyph(); /* a character in the trail changes its mind */
      });
      draw();
    }
    function draw(){S.drawGrid(cells.map(function(r){return r.slice()}),-1,0)}
    function stop(){if(over)return;over=true;S.close();done()}
    reset();
    t=S.every(Math.max(10,delay*10+10),step);
    draw();
    return {feed:function(k){if(saver||k==='q'||k==='Q'||k==='C-c'||k==='Escape')stop()},draw:draw,resize:function(){reset();draw()}};
  },{tty:'cmatrix'});
}});
})(window.Phosphor);
