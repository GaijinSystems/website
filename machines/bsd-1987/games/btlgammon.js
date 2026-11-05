/* PHOSPHOR-9 terminal: machine "bsd-1987", btlgammon. Ported to JavaScript for this terminal from 4.3BSD's games/btlgammon.c,
   which is the old Bell Labs backgammon under a new name (its own id says backgammon.c 4.1 82/10/24). The source file carries no
   copyright notice and no grant, so none is kept here; 7th Edition's backgammon.c, which it comes from, is under the Caldera licence.

   Differences from the C:
   - ! runs the command on this terminal; ! alone gives a % prompt until exit.
   - The rules file it looks for, /usr/games/lib/backrules, was not in the 4.3BSD distribution, so y to Instructions? says it cannot
     open it, as it did.
   - An uninitialised go[] is taken as all -1: a move of only blanks before any other is then no move.
   - ^D or the end of a pipe keeps the last line, as gets() leaves it; where that made the C spin for good, this goes on to the keyboard.
 */
(function(P){
'use strict';
var WHITE=0,BROWN=1,NIL=-1,MAXGMOV=10,MAXIMOVES=1000,EXIT={};
var PROBABILITY=[0,11,12,13,14,15,16,6,5,4,3,2,1];
var UNDERSC='______________________________________________________';
function pad(v,n){v=String(v);while(v.length<n)v=' '+v;return v}
function sscanf(s,max){ /* %d as often as it will go: the numbers read, or null at end of input with none */
  var i=0,R=[],m,re=/^[ \t\n\v\f\r]*([-+]?[0-9]+)/;
  while(R.length<max&&(m=re.exec(s.slice(i)))){
    R.push(parseInt(m[1],10)|0);
    i+=m[0].length;
  }
  if(!R.length&&/^[ \t\n\v\f\r]*$/.test(s))return null;
  return R;
}
function glass(l){ /* what a screen shows of a line with a carriage return in it */
  if(l.indexOf('\r')<0)return l;
  var c=[],x=0,i;
  for(i=0;i<l.length;i++){
    if(l.charAt(i)==='\r')x=0;
    else c[x++]=l.charAt(i);
  }
  return c.join('');
}
P.command({names:['btlgammon'],run:function(){
  var o='',pipe=P.stdin(),pat=0;
  var level='',die1=0,die2=0,i=0,j=0,l=0,m=0,pflg=1,nobroll=0,count=0,imoves=0,goodmoves=[],probmoves=[];
  var brown=[0,2,0,0,0,0,0,0,0,0,0,0,5,0,0,0,0,3,0,5,0,0,0,0,0,0,0,0,0,0,0];
  var white=brown.slice();
  var moves=[];
  var randx=Math.floor(Date.now()/1000); /* srand(time(0)) */
  function rand(){randx=(Math.imul(randx,1103515245)+12345)&0x7fffffff;return randx}
  function pr(s){o+=s}
  var s='';
  function* gets(){
    var v;
    if(pipe&&pat<pipe.length)v=pipe[pat++];
    else v=yield;
    if(v!==null&&v!==undefined)s=v;
    return s;
  }
  function* shell(cmd){
    if(!P.runScript)return;
    if(cmd!==''){P.runScript([cmd]);return}
    if(P.piped())return;
    for(;;){
      pr('% ');
      var v=yield;
      if(v===null||v===undefined||/^\s*(exit|logout)\s*$/.test(v))return;
      if(v.trim())P.runScript([v]);
    }
  }
  function* main(){
    var go=[NIL,NIL,NIL,NIL,NIL,NIL],k,n,t,skipwhite=false;
    pr('Instructions? ');
    yield* gets();
    if(s.charAt(0)==='y')pr('back: cannot open /usr/games/lib/backrules\n');
    pr('\n');
    pr('Opponent\'s level: b - beginner,\n');
    pr('i - intermediate, e - expert? ');
    level='e';
    yield* gets();
    if(s.charAt(0)==='b')level='b';
    else if(s.charAt(0)==='i')level='i';
    pr('\n');
    pr('You will play brown.\n\n');
    pr('Would you like to roll your own dice? ');
    yield* gets();
    pr('\n');
    if(s.charAt(0)==='y')nobroll=1;
    pr('Would you like to go first? ');
    yield* gets();
    pr('\n');
    if(s.charAt(0)==='y')skipwhite=true;
    for(;;){
      if(!skipwhite){
        roll(WHITE);
        pr('white rolls '+die1+', '+die2+'\n');
        pr("white's move is:");
        if(nextmove(white,brown)!==NIL){
          if(piececount(white,0,24)===0){
            pr('White wins');
            if(piececount(brown,0,6)!==0)pr(' with a Backgammon!\n');
            else if(piececount(brown,0,24)===24)pr(' with a Gammon.\n');
            else pr('.\n');
            throw EXIT;
          }
        }
      }
      skipwhite=false;
      if(pflg)prtbrd();
      yield* rollb();
      retry:for(;;){
        pr('\nYour roll is '+die1+'  '+die2+'\n');
        pr('Move? ');
        yield* gets();
        switch(s.charAt(0)){
          case '':
            pr("Brown's move skipped.\n");
            break retry;
          case 'b':
            pr('Brown:   '+(piececount(brown,0,24)-15)+'\n');
            pr('White:   '+(piececount(white,0,24)-15)+'\n');
            continue retry;
          case 'p':
            prtbrd();
            continue retry;
          case 's':
            pflg=0;
            continue retry;
          case 'r':
            pflg=1;
            continue retry;
          case 'm':
            pmoves();
            continue retry;
          case 'q':
            throw EXIT;
          case '!':
            yield* shell(s.slice(1));
            continue retry;
          case '?':
            pr('<newline>\tskip this move\n');
            pr('b\t\tnumber beared off\n');
            pr('p\t\tprint board\n');
            pr('q\t\tquit\n');
            pr('r\t\tresume auto print of board\n');
            pr('s\t\tstop auto print of board\n');
            pr('!\t\tescape to Shell\n');
            continue retry;
        }
        var got=sscanf(s,5);
        n=got===null?-1:got.length;
        for(k=0;k<n;k++)go[k]=got[k];
        if((die1!==die2&&n>2)||n>4){
          pr('Too many moves.\n');
          continue retry;
        }
        if(n>=0)go[n]=NIL;
        if(s.charAt(0)==='-'){
          go[0]=-go[0];
          t=die1;
          die1=die2;
          die2=t;
        }
        for(k=0;k<n;k++){
          if(0<=go[k]&&go[k]<=24)continue;
          pr('Move '+go[k]+' illegal.\n');
          continue retry;
        }
        if(play(brown,white,go))continue retry;
        if(piececount(brown,0,24)===0){
          pr('Brown wins');
          if(piececount(white,0,6)!==0)pr(' with a Backgammon.\n');
          else if(piececount(white,0,24)===24)pr(' with a gammon.\n');
          else pr('.\n');
          throw EXIT;
        }
        break;
      }
    }
  }
  function play(player,playee,pos){
    var k,n,die,ipos;
    for(k=0;k<player[0];k++){
      if(pos[k]===NIL)break;
      if(pos[k]!==0){
        pr('Stone on bar must be moved first.\n');
        return NIL;
      }
    }
    for(k=0;(ipos=pos[k])!==NIL;k++){
      die=k?die2:die1;
      n=25-ipos-die;
      var bad=false;
      if((player[ipos]|0)===0)bad=true;
      else if(n>0&&playee[n]>=2)bad=true;
      else if(n<=0){
        if(piececount(player,0,18)!==0)bad=true;
        else if(ipos+die!==25&&piececount(player,19,24-die)!==0)bad=true;
      }
      if(bad){
        pr('Move '+ipos+' illegal.\n');
        while(k--){
          die=k?die2:die1;
          player[pos[k]]++;
          player[pos[k]+die]--;
        }
        return NIL;
      }
      player[ipos]--;
      player[ipos+die]++;
    }
    for(k=0;pos[k]!==NIL;k++){
      die=k?die2:die1;
      n=25-pos[k]-die;
      if(n>0&&playee[n]===1){
        playee[n]=0;
        playee[0]++;
      }
    }
    return 0;
  }
  function nextmove(player,playee){
    var k;
    imoves=0;
    movegen(player,playee);
    if(die1!==die2){
      k=die1;
      die1=die2;
      die2=k;
      movegen(player,playee);
    }
    if(imoves===0){
      pr('no move possible.\n');
      return NIL;
    }
    k=strategy(player,playee);
    prtmov(k);
    update(player,playee,k);
    return 0;
  }
  function prtmov(k){
    var n;
    if(k===NIL)pr('No move possible\n');
    else for(n=0;n<4;n++){
      if(moves[k].pos[n]===NIL)break;
      pr('    '+(25-moves[k].pos[n])+', '+moves[k].mov[n]);
    }
    pr('\n');
  }
  function update(player,playee,k){
    var n,t;
    for(n=0;n<4;n++){
      if(moves[k].pos[n]===NIL)break;
      player[moves[k].pos[n]]--;
      player[moves[k].pos[n]+moves[k].mov[n]]++;
      t=25-moves[k].pos[n]-moves[k].mov[n];
      if(t>0&&playee[t]===1){
        playee[0]++;
        playee[t]--;
      }
    }
  }
  function piececount(player,startrow,endrow){
    var sum=0;
    while(startrow<=endrow)sum+=player[startrow++];
    return sum;
  }
  function pmoves(){
    var i1,i2;
    pr('Possible moves are:\n');
    for(i1=0;i1<imoves;i1++){
      pr('\n'+i1);
      for(i2=0;i2<4;i2++){
        if(moves[i1].pos[i2]===NIL)break;
        pr(moves[i1].pos[i2]+', '+moves[i1].mov[i2]);
      }
    }
    pr('\n');
  }
  function roll(){
    die1=((rand()>>8)%6)+1;
    die2=((rand()>>8)%6)+1;
  }
  function* rollb(){
    if(nobroll){
      pr('Roll? ');
      var keep=s;
      s='';
      yield* gets();
      var got=sscanf(s,2)||[];
      s=keep;
      if(got.length>0)die1=got[0];
      if(got.length>1)die2=got[1];
      if(got.length!==2||die1<1||die1>6||die2<1||die2>6)pr("Illegal - I'll do it!\n");
      else return;
    }
    roll();
  }
  function movegen(mover,movee){
    var k;
    for(i=0;i<=24;i++){
      count=0;
      if(mover[i]===0)continue;
      if((k=25-i-die1)>0&&movee[k]>=2){
        if(mover[0]>0)break;
        else continue;
      }
      if(k<=0){
        if(piececount(mover,0,18)!==0)break;
        if(i+die1!==25&&piececount(mover,19,i-1)!==0)break;
      }
      mover[i]--;
      mover[i+die1]++;
      count=1;
      for(j=0;j<=24;j++){
        if(mover[j]===0)continue;
        if((k=25-j-die2)>0&&movee[k]>=2){
          if(mover[0]>0)break;
          else continue;
        }
        if(k<=0){
          if(piececount(mover,0,18)!==0)break;
          if(j+die2!==25&&piececount(mover,19,j-1)!==0)break;
        }
        mover[j]--;
        mover[j+die2]++;
        count=2;
        if(die1!==die2){
          moverecord(mover);
          if(mover[0]>0)break;
          else continue;
        }
        for(l=0;l<=24;l++){
          if(mover[l]===0)continue;
          if((k=25-l-die1)>0&&movee[k]>=2){
            if(mover[0]>0)break;
            else continue;
          }
          if(k<=0){
            if(piececount(mover,0,18)!==0)break;
            if(l+die2!==25&&piececount(mover,19,l-1)!==0)break;
          }
          mover[l]--;
          mover[l+die1]++;
          count=3;
          for(m=0;m<=24;m++){
            if(mover[m]===0)continue;
            if((k=25-m-die1)>=0&&movee[k]>=2){
              if(mover[0]>0)break;
              else continue;
            }
            if(k<=0){
              if(piececount(mover,0,18)!==0)break;
              if(m+die2!==25&&piececount(mover,19,m-1)!==0)break;
            }
            count=4;
            moverecord(mover);
            if(mover[0]>0)break;
          }
          if(count===3)moverecord(mover);
          else{
            mover[l]++;
            mover[l+die1]--;
          }
          if(mover[0]>0)break;
        }
        if(count===2)moverecord(mover);
        else{
          mover[j]++;
          mover[j+die1]--;
        }
        if(mover[0]>0)break;
      }
      if(count===1)moverecord(mover);
      else{
        mover[i]++;
        mover[i+die1]--;
      }
      if(mover[0]>0)break;
    }
  }
  function moverecord(mover){
    var t;
    if(imoves<MAXIMOVES){
      moves[imoves]=moves[imoves]||{pos:[0,0,0,0],mov:[0,0,0,0]};
      var M=moves[imoves];
      for(t=0;t<=3;t++)M.pos[t]=NIL;
      switch(count){
        case 4:M.pos[3]=m;M.mov[3]=die1;
        /* falls through */
        case 3:M.pos[2]=l;M.mov[2]=die1;
        /* falls through */
        case 2:M.pos[1]=j;M.mov[1]=die2;
        /* falls through */
        case 1:M.pos[0]=i;M.mov[0]=die1;imoves++;
      }
    }
    switch(count){
      case 4:break;
      case 3:mover[l]++;mover[l+die1]--;break;
      case 2:mover[j]++;mover[j+die2]--;break;
      case 1:mover[i]++;mover[i+die1]--;
    }
  }
  function strategy(player,playee){
    var k,n=0,nn,bestval,moveval,prob,r;
    if(imoves===0)return NIL;
    goodmoves[0]=NIL;
    bestval=-32000;
    for(k=0;k<imoves;k++){
      r=evalm(player,playee,k);
      moveval=r[0];prob=r[1];
      if(moveval<bestval)continue;
      if(moveval>bestval){
        bestval=moveval;
        n=0;
      }
      if(n<MAXGMOV){
        goodmoves[n]=k;
        probmoves[n++]=prob;
      }
    }
    if(level==='e'&&n>1){
      nn=n;
      n=0;
      prob=32000;
      for(k=0;k<nn;k++){
        if((moveval=probmoves[k])>prob)continue;
        if(moveval<prob){
          prob=moveval;
          n=0;
        }
        goodmoves[n]=goodmoves[k];
        probmoves[n++]=probmoves[k];
      }
    }
    return goodmoves[(rand()>>4)%n];
  }
  function evalm(player,playee,k){
    var newtry=[],newother=[],p,q,n,sum=0,first,ii,lastwhite,lastbrown,prob=0;
    for(p=0;p<25;p++){
      newtry[p]=player[p];
      newother[p]=playee[p];
    }
    for(p=25;p<31;p++){newtry[p]=0;newother[p]=0}
    for(n=0;n<4;n++){
      if(moves[k].pos[n]===NIL)break;
      newtry[moves[k].pos[n]]--;
      newtry[ii=moves[k].pos[n]+moves[k].mov[n]]++;
      if(ii<25&&newother[25-ii]===1){
        newother[25-ii]=0;
        newother[0]++;
        if(ii<=15&&level==='e')sum++;
      }
    }
    for(lastbrown=0;newother[lastbrown]===0;lastbrown++);
    for(lastwhite=0;newtry[lastwhite]===0;lastwhite++);
    lastwhite=25-lastwhite;
    if(lastwhite<=6&&lastwhite<lastbrown)sum=1000;
    if(lastwhite<lastbrown&&level==='e'&&lastwhite>6){
      for(sum=1000;lastwhite>6;lastwhite--)sum=sum-lastwhite*newtry[25-lastwhite];
    }
    for(first=0;first<25;first++)if(newother[first]!==0)break;
    for(p=1;p<25;p++)if(newtry[p]>1)sum++;
    if(first>5){
      for(p=25,n=6;p<31;n--)sum+=newtry[p++]*n;
    }
    if(level!=='b'){
      q=25-first;
      for(p=7;p<q;p++)if(newtry[p]===1)sum--;
      for(p=0;p<3;p++)sum-=newtry[p];
    }
    for(n=1;n<=4;n++)prob+=n*getprob(newtry,newother,6*n-5,6*n);
    return [sum,prob];
  }
  function getprob(player,playee,start,finish){
    var k,n,sum=0;
    for(;start<=finish;start++){
      if(player[start]===1){
        for(k=1;k<=12;k++){
          if((n=25-start-k)<0)break;
          if(playee[n]!==0)sum+=PROBABILITY[k];
        }
      }
    }
    return sum;
  }
  function prtbrd(){
    var k;
    pr("White's Home\n"+UNDERSC+'\r');
    for(k=1;k<=6;k++)pr(pad(k,4));
    pr('    ');
    for(k=7;k<=12;k++)pr(pad(k,4));
    pr('\n');
    numline(brown,white,1,6);
    pr('    ');
    numline(brown,white,7,12);
    pr('\n');
    colorline(brown,'B',white,'W',1,6);
    pr('    ');
    colorline(brown,'B',white,'W',7,12);
    pr('\n');
    if(white[0]!==0)pr(pad(white[0],28)+'W\n');
    else pr('\n');
    if(brown[0]!==0)pr(pad(brown[0],28)+'B\n');
    else pr('\n');
    colorline(white,'W',brown,'B',1,6);
    pr('    ');
    colorline(white,'W',brown,'B',7,12);
    pr('\n'+UNDERSC+'\r');
    numline(white,brown,1,6);
    pr('    ');
    numline(white,brown,7,12);
    pr('\n');
    for(k=24;k>=19;k--)pr(pad(k,4));
    pr('    ');
    for(k=18;k>=13;k--)pr(pad(k,4));
    pr("\nBrown's Home\n\n\n\n\n");
  }
  function numline(upcol,downcol,start,fin){
    var k,n;
    for(k=start;k<=fin;k++){
      if((n=upcol[k])!==0||(n=downcol[25-k])!==0)pr(pad(n,4));
      else pr('    ');
    }
  }
  function colorline(upcol,c1,downcol,c2,start,fin){
    var k,c;
    for(k=start;k<=fin;k++){
      c=' ';
      if(upcol[k]!==0)c=c1;
      if(downcol[25-k]!==0)c=c2;
      pr('   '+c);
    }
  }
  /* the driver: a tab goes to the next stop of 8, as the terminal would */
  function shown(l){
    l=glass(l);
    if(l.indexOf('\t')<0)return l;
    var r='',q,c;
    for(q=0;q<l.length;q++){
      c=l.charAt(q);
      if(c==='\t'){do r+=' ';while(r.length%8)}
      else r+=c;
    }
    return r;
  }
  function flush(){
    var L=o.split('\n'),tail=L.pop();
    o='';
    if(L.length)P.say(L.map(shown));
    return shown(tail);
  }
  var gen=main();
  function step(v){
    var r;
    try{r=gen.next(v)}
    catch(e){
      var t=flush();
      if(t)P.say([t]);
      if(e===EXIT)return;
      throw e;
    }
    if(r.done){var u=flush();if(u)P.say([u]);return}
    P.ask(flush(),step);
  }
  P.queue(function(){step()});
}});
})(window.Phosphor);
