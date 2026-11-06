/* PHOSPHOR-9 terminal: machine "v7-1979", checkers. New code, written to match what V7's /usr/games/checkers does when run
   under a simulator, and what its manual says; its source does not survive, and nothing here is translated from its binary.
   The commands, the messages, the notation and the board are the original's, and it plays by the same rules. How it chooses
   is this file's own: a search six plies deep and a count of the pieces. It will not choose the original's moves every time.
   Not done: phone, draw and scale, which drove devices that this terminal doesn't have, and do nothing here; set-up, whose
   input format is not known, says "what?" as the original does to anything it doesn't follow, until an interrupt; the timer,
   after which the original moves for you if you take too long; input and output, kept in the browser.
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE. */
(function(P){
'use strict';
var HELP=[['help','this list'],['reverse','reverse position'],['move','make move for person'],['phone','get input from phone'],['restart','reset board to saved position'],['reset','reset board to set-up position'],['set-up','input position from teletype'],['save','put position into initialization table'],['backup','backup through list of moves'],['list','list moves since initialization'],['print','print board'],['draw','draw board on vt0'],['scale','change draw scale'],['input','input position from a file'],['output','output position to a file'],['search','print search depth'],['time','change timer'],['branch','change branching'],['resign','give up'],['/','comment']];
var E=0,b=1,w=2,B=3,W=4,MARK=['-','b','w','B','W'],DEPTH=6;
var N=[null];
(function(){ /* the squares next door: for each of 1-32, by direction, the neighbour, or 0 */
  var i,xy=[null],at={};
  for(i=1;i<=32;i++){
    var r=(i-1)>>2,c=((i-1)&3)*2+(r&1?0:1);
    xy.push([r,c]);at[r+','+c]=i;
  }
  for(i=1;i<=32;i++){
    N.push([[-1,-1],[-1,1],[1,-1],[1,1]].map(function(d){return at[(xy[i][0]+d[0])+','+(xy[i][1]+d[1])]||0}));
  }
})();
function start(){var S=[0],i;for(i=1;i<=32;i++)S.push(i<=12?b:i>=21?w:E);return S}
function sideOf(p){return p===b||p===B?1:p===w||p===W?2:0}
function dirs(p){return p===b?[2,3]:p===w?[0,1]:[0,1,2,3]}
function crowned(p,s){return (p===b&&s>=29)||(p===w&&s<=4)}
/* every legal move for a side: {path:[squares touched],taken:[squares jumped]} */
function jumps(S,from,p,path,taken,out){
  var found=false;
  dirs(p).forEach(function(d){
    var m=N[from][d],t=m?N[m][d]:0;
    if(!t||S[t]!==E||!m||sideOf(S[m])===0||sideOf(S[m])===sideOf(p)||taken.indexOf(m)>=0)return;
    found=true;
    if(crowned(p,t)){out.push({path:path.concat(t),taken:taken.concat(m)});return}
    var C=S.slice();C[from]=E;C[t]=p;
    jumps(C,t,p,path.concat(t),taken.concat(m),out);
  });
  if(!found&&taken.length)out.push({path:path,taken:taken});
}
function legal(S,side){
  var J=[],M=[],i;
  for(i=1;i<=32;i++){
    if(sideOf(S[i])!==side)continue;
    jumps(S,i,S[i],[i],[],J);
  }
  if(J.length)return J;
  for(i=1;i<=32;i++){
    if(sideOf(S[i])!==side)continue;
    dirs(S[i]).forEach(function(d){
      var t=N[i][d];
      if(t&&S[t]===E)M.push({path:[i,t],taken:[]});
    });
  }
  return M;
}
function apply(S,m){
  var C=S.slice(),f=m.path[0],l=m.path[m.path.length-1],p=C[f];
  C[f]=E;
  m.taken.forEach(function(t){C[t]=E});
  C[l]=crowned(p,l)?(p===b?B:W):p;
  return C;
}
function score(S,side){
  var i,s=0;
  for(i=1;i<=32;i++){
    var p=S[i];
    if(!p)continue;
    var v=p>=B?150:100;
    if(p===b)v+=(i-1)>>2;
    if(p===w)v+=7-((i-1)>>2);
    s+=sideOf(p)===side?v:-v;
  }
  return s;
}
function search(S,side,depth,a,c){
  var M=legal(S,side),i;
  if(!M.length)return -100000-depth;
  if(depth<=0&&!M[0].taken.length)return score(S,side);
  if(depth<-8)return score(S,side);
  for(i=0;i<M.length;i++){
    var v=-search(apply(S,M[i]),3-side,depth-1,-c,-a);
    if(v>a)a=v;
    if(a>=c)break;
  }
  return a;
}
function choose(S,side){
  var M=legal(S,side),best=null,top=-1e9,i;
  for(i=0;i<M.length;i++){
    var v=-search(apply(S,M[i]),3-side,DEPTH-1,-1e9,-top);
    if(v>top){top=v;best=M[i]}
  }
  return best;
}
function note(m){
  var o=String(m.path[0]);
  m.taken.forEach(function(t){o+='-('+t+')'});
  return o+'-'+m.path[m.path.length-1];
}
P.command({names:['checkers'],run:function(){
  P.cprog(function*(io){
    var S,saved,ply,log,history,searching,lastSearch;
    function reset(){S=start();saved=S.slice();ply=0;log=[];history=[];lastSearch=false}
    searching=false;
    reset();
    function ask(){io.print('\nYour move:\n')}
    function board(){
      var o='\n',r,c;
      for(r=0;r<8;r++){
        var L=r&1?' ':'   ';
        var a=[];
        for(c=0;c<4;c++)a.push(MARK[S[r*4+c+1]]);
        o+=L+a.join('   ')+'\n';
      }
      io.print(o+'\n\n');
    }
    var machine=2; /* the machine's side */
    function record(side,m){
      var t=side===1?((ply+2)>>1)+'. '+note(m):((ply+1)>>1)+'. ... '+note(m);
      log.push(t);
      io.print(t+'\n');
      history.push(S);
      S=apply(S,m);
      ply++;
    }
    /* a side to move with nothing to do has lost */
    function over(side){
      if(legal(S,side).length)return false;
      io.print(side===machine?'I have lost!!!\n':'you have lost\n');
      return true;
    }
    function reply(){ /* the machine's answer; true if the game goes on */
      if(over(machine))return false;
      if(searching)io.print('search: '+DEPTH+'\n');
      record(machine,choose(S,machine));
      return !over(3-machine);
    }
    function find(squares,side){
      return legal(S,side).filter(function(m){
        return m.path.join()===squares.join()||(m.path[0]===squares[0]&&m.path[m.path.length-1]===squares[squares.length-1]&&squares.length===2);
      });
    }
    var END={};
    function* another(){
      io.print('another game?  \n');
      var l=yield* io.gets();
      if(l===null)throw END;
      reset();machine=2;
      ask();
    }
    try{
      ask();
      for(;;){
        var l=yield* io.gets();
        if(l===null)return;
        var t=l.trim(),you=3-machine;
        if(t===''){ask();continue}
        if(/^[0-9]+([ \t]+[0-9]+)*$/.test(t)||/^[0-9]+(-[0-9]+)+$/.test(t)){
          var dash=t.indexOf('-')>=0,sq=t.split(/[- \t]+/).map(Number);
          var F=find(sq,you);
          if(dash){io.print((F.length?'Ambiguous':'Illegal')+'\neh?\n');continue}
          if(F.length!==1){io.print(F.length?'Ambiguous\n':'Illegal\n');if(F.length)io.print('eh?\n');else ask();continue}
          record(you,F[0]);
          if(reply())io.print('eh?\n');else yield* another();
          continue;
        }
        var cmd=t.split(/[ \t]/)[0];
        if(cmd.charAt(0)==='/')continue;
        switch(cmd){
        case 'help':
          io.print('\n'+HELP.map(function(h){return h[0]+'\t\t'+h[1]}).join('\n')+'\n\n');
          break;
        case 'print':board();ask();break;
        case 'list':io.print('\n'+log.concat('').join('\n'));ask();break;
        case 'time': /* it reads a new setting, and a line that isn't one is a bad move */
          io.print('timer: 0:20\n');
          var v=yield* io.gets();
          if(v===null)return;
          if(v.trim()!==''){io.print('Illegal\n');ask()}
          break;
        case 'search':
          if(lastSearch||searching)io.print('search: '+DEPTH+'\n');
          searching=!searching;lastSearch=true;
          break;
        case 'branch':
          io.print('branch: 12000\n');
          if((yield* io.gets())===null)return;
          ask();
          break;
        case 'backup':
          if(history.length){
            S=history[Math.max(history.length-2,0)];
            history.length=Math.max(history.length-2,0);
            log.length=history.length;
            ply=Math.max(ply-2,0);
          }
          break;
        case 'reset':case 'restart':
          S=saved.slice();history=[];log=[];ply=0;
          break;
        case 'save':saved=S.slice();break;
        case 'phone':case 'draw':case 'scale':
          if((yield* io.gets())===null)return;
          break;
        case 'input':{
          var f=P.saved('checkers/'+(t.split(/[ \t]+/)[1]||''));
          if(Array.isArray(f)&&f.length===33&&f.every(function(x){return x===0||x===1||x===2||x===3||x===4})){S=f;history=[];log=[];ply=0}
          else io.print('no such file\n');
          ask();
          break;
        }
        case 'output':P.save('checkers/'+(t.split(/[ \t]+/)[1]||''),S);ask();break;
        case 'set-up':
          for(;;){
            io.print('what?\n');
            if((yield* io.gets())===null)return;
          }
        case 'resign':yield* another();break;
        case 'reverse':
          io.print(((ply+2)>>1)+'. reverse!\n');
          log.push(((ply+2)>>1)+'. reverse!');
          machine=you;
          if(legal(S,machine).length&&(ply&1?1:0)===(machine===1?0:1)){
            record(machine,choose(S,machine));
            if(!over(3-machine))io.print('eh?\n');else yield* another();
          }
          else ask();
          break;
        case 'move':
          if(over(you)){yield* another();break}
          if(searching)io.print('search: '+DEPTH+'\n');
          record(you,choose(S,you));
          if(reply())io.print('eh?\n');else yield* another();
          break;
        default:io.print('eh?\n');
        }
      }
    }catch(e){if(e!==END)throw e}
  });
}});
})(window.Phosphor);
