/* PHOSPHOR-9 terminal: machine "v7-1979", ttt, the tic-tac-toe that learns. Ported to JavaScript for this terminal from
   2.11BSD's games/pdp/ttt.s and etc.s, which carry no notice; V7 shipped only the binary, and where they differ this
   follows the binary, checked under a simulator: /usr/games/ttt.k is the file wherever it runs, and the end of the
   input saves what was learned as an interrupt does. The knowledge below is V7's ttt.k; what is learned here is kept
   in the browser. */
(function(P){
'use strict';
var SHIPPED=[18657,11826,16200,18639,15714,15498,15480,15474,18518,17181,14040,14022,11106,14016,11340,16497,16255,11670,18666,17093,11124,12069,18696,12315,18239,17753,16512,12339,18694,12321,11098,8964,17021,18483,18633,16443,16040,11184,18247,18475,17199,16506,17055,16283,18484,18631,16470,15554,17929,17911,15309,15472,17905,18468,18423,18399,18234,18397,17748,17586,17532,17508,11913,16452,17175,17173,17835,16449,16221,16219,15517,17208,17591,16044,17537,18257,17771,15606,17609,18497,18678,16227,18538,17010,17015,17214,16941,17820,15320,16867,13934,16139,13851,13862,17766,17742,17740,17506,16233,17761,17937,16263,16257,18417,16056,15408,16215,15513,11835,17029,16776,16789,18382,16179,17896,17827,17773,15693,18824,16092,12348,15364,17755,12150,12313,18473,16446,16341,18752,16107,16270,11232,16099,17890,18642,16209,18640,16203,17102];
var MAPS=[[0,1,2,3,4,5,6,7,8],[6,3,0,7,4,1,8,5,2],[8,7,6,5,4,3,2,1,0],[2,5,8,1,4,7,0,3,6],[2,1,0,5,4,3,8,7,6],[8,5,2,7,4,1,6,3,0],[6,7,8,3,4,5,0,1,2],[0,3,6,1,4,7,2,5,8]];
var WINS=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
function open(){ /* the words of ttt.k */
  var f=P.saved('ttt/knowledge');
  return Array.isArray(f)?f.filter(function(x){return (x|0)===x&&x>=0&&x<19683}).slice(0,19683):SHIPPED; /* positions are under 3^9; more than that is a tampered file */
}
P.command({names:['ttt'],run:function(){
  var board,sing=[],bad=[];
  function check(want){
    for(var i=0;i<8;i++){
      var t=0;
      for(var k=0;k<3;k++)t+=board[WINS[i][k]]||10;
      if(t===want)return true;
    }
    return false;
  }
  function getsit(){
    var top=0;
    MAPS.forEach(function(M){
      var x=0;
      M.forEach(function(c){x=x*3+board[c]});
      if(x>top)top=x;
    });
    return top;
  }
  P.cprog(function*(io){
    var END={};
    function* getc(){var c=yield* io.getc();if(c===null){if(io.onint)io.onint();else io.print('\n');throw END}return c}
    function* flush(){while((yield* getc())!=='\n');}
    function addno(){ /* interrupt: merge what was learned with the file, and write it */
      var w=bad.concat(open()),r1=0,r2=0,r0,r3;
      w.push(0);
      while((r0=w[r2++])!==0){
        if(r0<0)continue;
        for(r3=0;w[r3]!==0;r3++)if(w[r3]===r0)w[r3]=-1;
        w[r1++]=r0;
      }
      var out=w.slice(0,r1);
      io.print('\n'+out.length+" 'bits' returned\n\n");
      P.save('ttt/knowledge',out);
    }
    function* quest(){
      var c=yield* getc(),y=c==='y';
      if(c!=='\n')yield* flush();
      return y;
    }
    try{
      io.print('Tic-Tac-Toe\nAccumulated knowledge? ');
      if(yield* quest()){
        var k=open(),z=k.indexOf(0);
        bad=(z<0?k:k.slice(0,z)).slice(0,500);
      }
      io.print(bad.length+" 'bits' of knowledge\n");
      io.onint=addno;
      game:for(;;){
        io.print('new game\n');
        sing=[];
        board=[0,0,0,0,0,0,0,0,0];
        for(;;){
          var i,c,o='';
          for(i=0;i<9;i++){
            o+=board[i]===0?String(i+1):board[i]===1?'O':'X';
            if(i%3===2)o+='\n';
          }
          io.print(o+'\n? ');
          c=yield* getc();
          if(c!=='\n'){
            var r=c.charCodeAt(0)-49;
            if(r<0||r>8||board[r]!==0){
              io.print('Illegal move\n');
              yield* flush();
              continue;
            }
            c=yield* getc();
            if(c!=='\n'){
              io.print('Illegal move\n');
              yield* flush();
              continue;
            }
            board[r]=2;
          }
          if(check(6)){
            io.print('You win\n');
            bad=bad.concat(sing);
            continue game;
          }
          if(board.indexOf(0)<0){io.print('Draw\n');continue game}
          var ntrial=0,trial=0,move=0,won=false;
          for(i=0;i<9;i++){
            if(board[i]!==0)continue;
            board[i]=1;
            if(check(3)){won=true;break}
            var v=getsit();
            board[i]=0;
            if(bad.indexOf(v)>=0)continue;
            if(v===trial)continue;
            if(v>trial){trial=v;move=i}
            ntrial++;
          }
          if(won){io.print('I win\n');continue game}
          if(ntrial===0){
            io.print('I concede\n');
            bad=bad.concat(sing);
            continue game;
          }
          if(ntrial!==1)sing=[];
          sing.push(trial);
          board[move]=1;
        }
      }
    }catch(e){if(e!==END)throw e}
  });
}});
})(window.Phosphor);
