/* PHOSPHOR-9 terminal: machine "v7-1979", maze. New code, written to match what V7's /usr/games/maze does when run under a
   simulator; its source does not survive, and nothing here is translated from its binary. The questions, the drawing, the
   limits, how the sizes are read and the runtime's errors are the original's. The mazes are drawn from this file's own random
   walk, so none is the original's maze; like the original's, each joins every square, and a small one may have no way out,
   about as often as the original's did when sampled: 18 of 30 at 2 by 2, 6 of 20 at 3 by 3, 1 of 15 at 5 by 5. */
(function(P){
'use strict';
function rnd(n){return Math.floor(Math.random()*n)}
function make(rows,cols){
  /* right[r][c]: open to the east; down[r][c]: open to the south */
  var right=[],down=[],seen=[],r,c;
  for(r=0;r<rows;r++){right.push([]);down.push([]);seen.push([]);for(c=0;c<cols;c++){right[r].push(false);down[r].push(false);seen[r].push(false)}}
  var inn=rnd(cols),out=-1,st=[[0,inn]];
  seen[0][inn]=true;
  while(st.length){
    var t=st[st.length-1];r=t[0];c=t[1];
    var N=[];
    if(r>0&&!seen[r-1][c])N.push([r-1,c]);
    if(r<rows-1&&!seen[r+1][c])N.push([r+1,c]);
    if(c>0&&!seen[r][c-1])N.push([r,c-1]);
    if(c<cols-1&&!seen[r][c+1])N.push([r,c+1]);
    if(!N.length){
      if(r===rows-1&&out<0)out=c; /* the first dead end on the last row is the way out */
      st.pop();
      continue;
    }
    var n=N[rnd(N.length)];
    if(n[0]>r)down[r][c]=true;
    else if(n[0]<r)down[n[0]][c]=true;
    else if(n[1]>c)right[r][c]=true;
    else right[r][n[1]]=true;
    seen[n[0]][n[1]]=true;
    st.push(n);
  }
  if(Math.random()<Math.min(.6,2/(rows*cols)))out=-1;
  var L=[],o;
  o=':';for(c=0;c<cols;c++)o+=(c===inn?'  ':'--')+':';
  L.push(o);
  for(r=0;r<rows;r++){
    o='|';
    for(c=0;c<cols;c++)o+='  '+(c<cols-1&&right[r][c]?' ':'|');
    L.push(o);
    o=':';
    for(c=0;c<cols;c++)o+=((r<rows-1?down[r][c]:c===out)?'  ':'--')+':';
    L.push(o);
  }
  return L;
}
/* the sizes on a line: comma or blank between them, an empty field is 0, the first two count; null if there is rubbish */
function sizes(l){
  var i=0,R=[],k;
  for(k=0;k<2;k++){
    var m=/^[-+]?[0-9]*(\.[0-9]*)?/.exec(l.slice(i)),s=m[0];
    i+=s.length;
    var ch=l.charAt(i);
    if(ch!==''&&ch!==','&&ch!==' '&&ch!=='\t')return null;
    R.push(/[0-9]/.test(s)?parseInt(s,10):0);
    if(ch!==''){i++;while(l.charAt(i)===' '&&ch===',')i++}
  }
  return R;
}
P.command({names:['maze'],run:function(){
  P.cprog(function*(io){
    for(;;){
      io.print('\n\n\nsquares long, squares wide =\n');
      var l=yield* io.gets();
      if(l===null){io.print('Runtime error 104\n');return}
      var s=sizes(l);
      if(s===null){io.print('Runtime error 110\n');return}
      if(s[0]<2||s[0]>150||s[1]<2||s[1]>40){io.print('maximum length and width are 150 and 40\n');continue}
      io.print('\n'+make(s[0],s[1]).join('\n')+'\n');
    }
  });
}});
})(window.Phosphor);
