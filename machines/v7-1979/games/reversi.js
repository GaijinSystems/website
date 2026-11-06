/* PHOSPHOR-9 terminal: machine "v7-1979", reversi. New code, written to match what V7's /usr/games/reversi does when run under
   a simulator, and what its manual says; its source does not survive, and nothing here is translated from its binary. The
   commands, the messages, the rules and the score are the original's. How the machine chooses is this file's own: a plain
   search to the lookahead asked for, and a weighted board. It will not choose the original's moves every time.
   Differences: a lookahead over 6 is held at 6; a time limit forfeits the turn when the late answer arrives, not before;
   the file named on the command line is kept in the browser, not in the terminal's file system.
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE. */
(function(P){
'use strict';
var YOU=1,IT=2,MARK=['-','*','@'],MAXLOOK=6,DIRS=[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
var W=[120,-20,20,5,5,20,-20,120,-20,-40,-5,-5,-5,-5,-40,-20,20,-5,15,3,3,15,-5,20,5,-5,3,3,3,3,-5,5,5,-5,3,3,3,3,-5,5,20,-5,15,3,3,15,-5,20,-20,-40,-5,-5,-5,-5,-40,-20,120,-20,20,5,5,20,-20,120];
function flips(B,r,c,who){ /* the squares a move there would take */
  var F=[],other=3-who;
  if(B[r*8+c])return F;
  DIRS.forEach(function(D){
    var x=r+D[0],y=c+D[1],T=[];
    while(x>=0&&x<8&&y>=0&&y<8&&B[x*8+y]===other){T.push(x*8+y);x+=D[0];y+=D[1]}
    if(T.length&&x>=0&&x<8&&y>=0&&y<8&&B[x*8+y]===who)F=F.concat(T);
  });
  return F;
}
function moves(B,who){
  var M=[],r,c;
  for(r=0;r<8;r++)for(c=0;c<8;c++)if(flips(B,r,c,who).length)M.push(r*8+c);
  return M;
}
function value(B,who){
  var s=0,i;
  for(i=0;i<64;i++){if(B[i]===who)s+=W[i];else if(B[i])s-=W[i]}
  return s;
}
function search(B,who,depth,a,b){
  if(depth<=0)return value(B,who);
  var M=moves(B,who),i;
  if(!M.length){
    if(!moves(B,3-who).length){
      var d=0;for(i=0;i<64;i++){if(B[i]===who)d++;else if(B[i])d--}
      return d*1000;
    }
    return -search(B,3-who,depth-1,-b,-a);
  }
  for(i=0;i<M.length;i++){
    var C=B.slice(),n=M[i];
    C[n]=who;
    flips(B,n>>3,n&7,who).forEach(function(f){C[f]=who});
    var v=-search(C,3-who,depth-1,-b,-a);
    if(v>a)a=v;
    if(a>=b)break;
  }
  return a;
}
function choose(B,who,look){
  var M=moves(B,who),best=-1,top=-1e9,i;
  for(i=0;i<M.length;i++){
    var C=B.slice(),n=M[i];
    C[n]=who;
    flips(B,n>>3,n&7,who).forEach(function(f){C[f]=who});
    var v=-search(C,3-who,look,-1e9,-top);
    if(v>top){top=v;best=n}
  }
  return best;
}
function validBoard(x){
  return Array.isArray(x)&&x.length===64&&x.every(function(v){return v===0||v===1||v===2});
}
P.command({names:['reversi'],run:function(a,raw,words){
  var argv=words.slice(1),restart=false,file=null;
  if(argv[0]==='-r'){restart=true;argv=argv.slice(1)}
  if(argv.length&&argv[0].charAt(0)!=='-')file=P.norm?P.norm(argv[0]):argv[0];
  P.cprog(function*(io){
    var B,turn,placed,look,print,limit,started;
    function fresh(){
      B=[];for(var i=0;i<64;i++)B.push(0);
      turn=1;placed=0;look=4;print=true;limit=0;started=false;
    }
    function count(w){return B.filter(function(v){return v===w}).length}
    function board(){
      var o='  1 2 3 4 5 6 7 8\n',r,c;
      for(r=0;r<8;r++){
        o+=(r+1);
        for(c=0;c<8;c++)o+=' '+MARK[B[r*8+c]];
        o+='\n';
      }
      io.print(o);
    }
    function name(n){return ((n>>3)+1)+'-'+((n&7)+1)}
    var CENTRE=[27,28,35,36];
    function opening(){return placed<4}
    function canMove(who){return opening()?true:moves(B,who).length>0}
    function put(n,who){
      if(opening()){B[n]=who;placed++;return}
      var F=flips(B,n>>3,n&7,who);
      B[n]=who;placed++;
      F.forEach(function(f){B[f]=who});
    }
    function pick(who){
      if(opening()){
        var C=CENTRE.filter(function(n){return !B[n]});
        return C[Math.floor(Math.random()*C.length)];
      }
      var M=moves(B,who);
      return M.length?choose(B,who,Math.max(look-1,0)):-1;
    }
    function checkpoint(){
      if(file)P.save('reversi/'+file,{b:B,turn:turn,placed:placed});
    }
    /* a whole numbered turn. mine is the player's square, or -1 to forfeit it */
    function play(mine){
      var o=turn+'. ';
      if(mine>=0){put(mine,YOU);o+=name(mine)}else o+='Forfeit';
      turn++;
      started=true;
      if(!over()){
        var it=canMove(IT)?pick(IT):-1;
        o+='...';
        if(it>=0){put(it,IT);o+=name(it)}else o+='Forfeit';
      }
      io.print(o+'\n');
      if(print&&!over())board(); /* the last move of a game shows no board, only the score */
      checkpoint();
    }
    function over(){return !opening()&&!canMove(YOU)&&!canMove(IT)}
    function score(){
      var y=count(YOU),m=count(IT),o=y+'-'+m;
      if(y>m)o+=' You won by '+(y-m);
      else if(m>y)o+=' You lost by '+(m-y);
      else o+=' A draw';
      io.print(o+'\n');
    }
    function auto(n){ /* the machine plays both sides */
      while(n!==0&&!over()){
        var mine=canMove(YOU)?pick(YOU):-1;
        play(mine);
        n--;
      }
    }
    function number(s){var m=/^[ \t]*(-?[0-9]+)[ \t]*$/.exec(s);return m?parseInt(m[1],10):null}
    io.onint=function(){io.print('\nMove: ');return true};
    for(;;){ /* a game */
      fresh();
      if(restart){
        var S=file?P.saved('reversi/'+file):null;
        restart=false;
        if(S&&validBoard(S.b)&&(S.turn|0)===S.turn&&(S.placed|0)===S.placed){B=S.b;turn=S.turn;placed=S.placed;started=true}
        else io.print("Can't open "+argv[0]+'\n');
      }
      var quit=false;
      while(!quit){
        if(over()){score();break}
        if(!canMove(YOU)){play(-1);continue}
        io.print('Move: ');
        var asked=Date.now();
        var l=yield* io.gets();
        for(;;){
          if(l===null)return; /* the C spins at the end of its input */
          if(limit&&Date.now()-asked>limit*1000){l=null;break}
          var c=l.replace(/^[ \t]+/,'').charAt(0);
          var rest=l.replace(/^[ \t]+/,'').slice(1);
          /* a letter, and a number if anything: anything else after the letter puzzles it */
          if(c==='!'||(/[a-z]/i.test(c)&&rest.trim()!==''&&number(rest)===null)){
            io.print('Huh? ');
            l=yield* io.gets();
            continue;
          }
          break;
        }
        if(l===null){play(-1);continue}
        var line=l.replace(/^[ \t]+/,''),n;
        c=line.charAt(0);rest=line.slice(1);
        if(line.replace(/[ \t]+$/,'')==='')continue;
        if(c==='p'){board();continue}
        if(c==='s'){io.print(count(YOU)+'-'+count(IT)+'\n');continue}
        if(c==='n'){print=false;continue}
        if(c==='o'){print=true;board();continue}
        if(c==='c')continue;
        if(c==='q'){quit=true;continue}
        if(c==='g'){
          n=rest.trim()===''?-1:number(rest);
          auto(n);
          continue;
        }
        if(c==='f'){
          if(started){io.print('Illegal!\n');continue}
          play(-1);
          continue;
        }
        if(c==='h'){
          n=rest.trim()===''?0:number(rest);
          if(started||n<-4||n>4){io.print('Illegal!\n');continue}
          var who=n>0?YOU:IT,k=Math.abs(n);
          [0,63,7,56].slice(0,k).forEach(function(q){B[q]=who});
          started=true;
          if(print)board();
          continue;
        }
        if(c==='l'){
          n=rest.trim()===''?0:number(rest);
          if(started){io.print('Illegal!\n');continue}
          look=Math.max(Math.min(n,MAXLOOK),0);
          continue;
        }
        if(c==='t'){
          n=rest.trim()===''?0:number(rest);
          if(started||n<0){io.print('Illegal!\n');continue}
          limit=n;
          continue;
        }
        var m=/^([1-8])[ \t]*([1-8])[ \t]*$/.exec(line);
        if(!m){io.print('Illegal!\n');continue}
        var at=(+m[1]-1)*8+(+m[2]-1);
        if(opening()?(CENTRE.indexOf(at)<0||B[at]):!flips(B,at>>3,at&7,YOU).length){io.print('Illegal!\n');continue}
        play(at);
      }
      for(;;){
        io.print('Another game? ');
        l=yield* io.gets();
        if(l===null)return;
        if(l==='n')return;
        if(l==='y')break;
      }
    }
  });
}});
})(window.Phosphor);
