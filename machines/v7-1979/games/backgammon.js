/* PHOSPHOR-9 terminal: machine "v7-1979", backgammon. Ported to JavaScript for this terminal from V7's
   usr/src/games/backgammon.c. The source is under this notice:

Copyright(C) Caldera International Inc. 2001-2002. All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the
following conditions are met:

Redistributions of source code and documentation must retain the above copyright notice, this list of conditions and the
following disclaimer. Redistributions in binary form must reproduce the above copyright notice, this list of conditions
and the following disclaimer in the documentation and/or other materials provided with the distribution.

All advertising materials mentioning features or use of this software must display the following acknowledgement:

This product includes software developed or owned by Caldera International, Inc.

Neither the name of Caldera International, Inc. nor the names of other contributors may be used to endorse or promote
products derived from this software without specific prior written permission.

USE OF THE SOFTWARE PROVIDED FOR UNDER THIS LICENSE BY CALDERA INTERNATIONAL, INC.
AND CONTRIBUTORS ``AS IS'' AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL CALDERA INTERNATIONAL, INC. BE LIABLE FOR
ANY DIRECT, INDIRECT INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF
USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.

   One difference: the board's top and bottom rules are overstruck with a carriage return, which on paper underlines
   the row of numbers. Here the underscores fill the blanks and the numbers stay, as they would read on paper; a real
   glass terminal would lose the numbers altogether.
*/
(function(P){
'use strict';
var NIL=-1,MAXGMOV=10,MAXIMOVES=1000;
var PROB=[0,11,12,13,14,15,16,6,5,4,3,2,1];
var INSTR=["To play backgammon, type the numbers of the points","from which pieces are to be moved. Thus, if the","roll is '3,5', typing '2 6' will move a piece","from point 2 three spaces to point 5,","and a piece from point 6 forward to","point 11.  If the moves must be made in the","opposite order, the first character typed must","be a minus ('-'). Thus, typing","'-2 6' moves the piece on point 2","by 5, and the piece on point 6 by 3.","If you want to move a single piece several times,","the sequence of points from which it is to be","moved must be typed. Thus '14 17' will move","a piece from point 14 to point 17 and thence to","to point 22.","If a double is rolled, you should type four numbers.","Red pieces that have been removed from the board by","being hit by white are on point 0 and","must be brought in before any other move can be made.","White pieces that are hit are removed to point 25.","You will not be allowed to make an illegal move, or","to make too many moves. However, if you make too","few moves, the program does not care. In particular","you may skip your turn by typing a 'new-line'","all by itself.",""];
function pad(n,w){return String(n).padStart(w)}
function sscan(s,go){ /* V7's sscanf(s,"%d%d%d%d%d",...), into go. A format that fails still uses up its argument */
  var i=0,nmatch=0,k;
  for(k=0;k<5;k++){
    while(s.charAt(i)===' '||s.charAt(i)==='\t')i++;
    var neg=false,any=false,v=0;
    if(s.charAt(i)==='-'){neg=true;any=true;i++}
    else if(s.charAt(i)==='+')i++;
    while(/[0-9]/.test(s.charAt(i))&&i<s.length){v=v*10+(s.charCodeAt(i)-48);any=true;i++}
    if(any){go[k]=(neg?-v:v)<<16>>16;nmatch++}
    if(i>=s.length)return nmatch?nmatch:-1;
  }
  return nmatch;
}
P.command({names:['backgammon'],run:function(){
  var level='e',die1=0,die2=0,i=0,j=0,l=0,m=0,count=0,imoves=0;
  var red=[0,2,0,0,0,0,0,0,0,0,0,0,5,0,0,0,0,3,0,5,0,0,0,0,0,0,0,0,0,0,0],white=red.slice();
  var goodmoves=[],probmoves=[],moves=[];
  /* srand() takes a word from a fixed address, and adds one to it there. Under V7 it always comes to 2, found by running
     the real binary and the source built on V7, so every game has the same dice */
  var rrno=2;
  function rand(){rrno=Math.imul(rrno,0o106273)&0xffff;rrno=(rrno+0o20202)&0xffff;return rrno&0o77777}
  function roll(){die1=(rand()>>8)%6+1;die2=(rand()>>8)%6+1}
  function piececount(p,a,b){var s=0;while(a<=b)s+=p[a++];return s}
  function moverecord(mover){
    if(imoves<MAXIMOVES){
      var e=moves[imoves]||(moves[imoves]={pos:[0,0,0,0],mov:[0,0,0,0]}),t;
      for(t=0;t<=3;t++)e.pos[t]=NIL;
      if(count>=4){e.pos[3]=m;e.mov[3]=die1}
      if(count>=3){e.pos[2]=l;e.mov[2]=die1}
      if(count>=2){e.pos[1]=j;e.mov[1]=die2}
      if(count>=1){e.pos[0]=i;e.mov[0]=die1;imoves++}
    }
    switch(count){
    case 3:mover[l]++;mover[l+die1]--;break;
    case 2:mover[j]++;mover[j+die2]--;break;
    case 1:mover[i]++;mover[i+die1]--;
    }
  }
  function movegen(mover,movee){
    var k;
    for(i=0;i<=24;i++){
      count=0;
      if(mover[i]===0)continue;
      if((k=25-i-die1)>0&&movee[k]>=2){if(mover[0]>0)break;else continue}
      if(k<=0){
        if(piececount(mover,0,18)!==0)break;
        if((i+die1)!==25&&piececount(mover,19,24-die1)!==0)break;
      }
      mover[i]--;mover[i+die1]++;
      count=1;
      for(j=0;j<=24;j++){
        if(mover[j]===0)continue;
        if((k=25-j-die2)>0&&movee[k]>=2){if(mover[0]>0)break;else continue}
        if(k<=0){
          if(piececount(mover,0,18)!==0)break;
          if((j+die2)!==25&&piececount(mover,19,24-die2)!==0)break;
        }
        mover[j]--;mover[j+die2]++;
        count=2;
        if(die1!==die2){
          moverecord(mover);
          if(mover[0]>0)break;else continue;
        }
        for(l=0;l<=24;l++){
          if(mover[l]===0)continue;
          if((k=25-l-die1)>0&&movee[k]>=2){if(mover[0]>0)break;else continue}
          if(k<=0){
            if(piececount(mover,0,18)!==0)break;
            if((l+die2)!==25&&piececount(mover,19,24-die1)!==0)break;
          }
          mover[l]--;mover[l+die1]++;
          count=3;
          for(m=0;m<=24;m++){
            if(mover[m]===0)continue;
            if((k=25-m-die1)>=0&&movee[k]>=2){if(mover[0]>0)break;else continue}
            if(k<=0){
              if(piececount(mover,0,18)!==0)break;
              if((m+die2)!==25&&piececount(mover,19,24-die1)!==0)break;
            }
            count=4;
            moverecord(mover);
            if(mover[0]>0)break;
          }
          if(count===3)moverecord(mover);
          else{mover[l]++;mover[l+die1]--}
          if(mover[0]>0)break;
        }
        if(count===2)moverecord(mover);
        else{mover[j]++;mover[j+die1]--}
        if(mover[0]>0)break;
      }
      if(count===1)moverecord(mover);
      else{mover[i]++;mover[i+die1]--}
      if(mover[0]>0)break;
    }
  }
  function getprob(player,playee,start,finish){
    var k,n,sum=0;
    for(;start<=finish;start++){
      if(player[start]===1){
        for(k=1;k<=12;k++){
          if((n=25-start-k)<0)break;
          if(playee[n]!==0)sum+=PROB[k];
        }
      }
    }
    return sum;
  }
  var evprob=0;
  function evaluate(player,playee,k){
    var newtry=player.slice(0,25),newother=playee.slice(0,25),p,n,sum=0,first,ii,lastwhite,lastred,e=moves[k];
    while(newtry.length<31)newtry.push(0);
    evprob=0;
    for(n=0;n<4;n++){
      if(e.pos[n]===NIL)break;
      newtry[e.pos[n]]--;
      newtry[ii=e.pos[n]+e.mov[n]]++;
      if(ii<25&&newother[25-ii]===1){
        newother[25-ii]=0;
        newother[0]++;
        if(ii<=15&&level==='e')sum++;
      }
    }
    for(lastred=0;newother[lastred]===0;lastred++);
    for(lastwhite=0;newtry[lastwhite]===0;lastwhite++);
    lastwhite=25-lastwhite;
    if(lastwhite<=6&&lastwhite<lastred)sum=1000;
    if(lastwhite<lastred&&level==='e'&&lastwhite>6){
      for(sum=1000;lastwhite>6;lastwhite--)sum-=lastwhite*newtry[25-lastwhite];
    }
    for(first=0;first<25;first++)if(newother[first]!==0)break;
    for(p=1;p<25;p++)if(newtry[p]>1)sum++;
    if(first>5){
      for(p=25,n=6;p<31;n--)sum+=newtry[p++]*n;
    }
    if(level!=='b'){
      for(p=7;p<25-first;p++)if(newtry[p]===1)sum--;
      for(p=0;p<3;p++)sum-=newtry[p];
    }
    for(n=1;n<=4;n++)evprob+=n*getprob(newtry,newother,6*n-5,6*n);
    return sum;
  }
  function strategy(player,playee){
    var k,n=0,nn,bestval=-32000,moveval,prob;
    goodmoves[0]=NIL;
    for(k=0;k<imoves;k++){
      moveval=evaluate(player,playee,k);
      if(moveval<bestval)continue;
      if(moveval>bestval){bestval=moveval;n=0}
      if(n<MAXGMOV){goodmoves[n]=k;probmoves[n++]=evprob}
    }
    if(level==='e'&&n>1){
      nn=n;n=0;prob=32000;
      for(k=0;k<nn;k++){
        if((moveval=probmoves[k])>prob)continue;
        if(moveval<prob){prob=moveval;n=0}
        goodmoves[n]=goodmoves[k];
        probmoves[n++]=probmoves[k];
      }
    }
    return goodmoves[(rand()>>4)%n];
  }
  P.cprog(function*(io){
    /* a line of the board with its rule overstruck: see the header */
    function rule(s){return s.padEnd(54,' ').replace(/ /g,'_')}
    function numline(up,down,start,fin){
      var k,n,o='';
      for(k=start;k<=fin;k++){
        if((n=up[k])!==0||(n=down[25-k])!==0)o+=pad(n,4);
        else o+='    ';
      }
      return o;
    }
    function colorline(up,c1,down,c2,start,fin){
      var k,c,o='';
      for(k=start;k<=fin;k++){
        c=' ';
        if(up[k]!==0)c=c1;
        if(down[25-k]!==0)c=c2;
        o+='   '+c;
      }
      return o;
    }
    function prtbrd(){
      var k,o='';
      io.print("White's Home\n");
      for(k=1;k<=6;k++)o+=pad(k,4);
      o+='    ';
      for(k=7;k<=12;k++)o+=pad(k,4);
      io.print(rule(o)+'\n');
      io.print(numline(red,white,1,6)+'    '+numline(red,white,7,12)+'\n');
      io.print(colorline(red,'R',white,'W',1,6)+'    '+colorline(red,'R',white,'W',7,12)+'\n');
      io.print(white[0]!==0?pad(white[0],28)+'W\n':'\n');
      io.print(red[0]!==0?pad(red[0],28)+'R\n':'\n');
      io.print(colorline(white,'W',red,'R',1,6)+'    '+colorline(white,'W',red,'R',7,12)+'\n');
      io.print(rule(numline(white,red,1,6)+'    '+numline(white,red,7,12))+'\n');
      o='';
      for(k=24;k>=19;k--)o+=pad(k,4);
      o+='    ';
      for(k=18;k>=13;k--)o+=pad(k,4);
      io.print(o+"\nRed's Home\n\n\n\n\n");
    }
    function play(player,playee,pos){
      var k,n,die,ipos,bad=false;
      for(k=0;k<player[0];k++){
        if(pos[k]===NIL)break;
        if(pos[k]!==0){io.print('piece on position 0 must be moved first\n');return -1}
      }
      for(k=0;(ipos=pos[k])!==NIL;k++){
        die=k?die2:die1;
        n=25-ipos-die;
        if(player[ipos]===0){bad=true;break}
        if(n>0&&playee[n]>=2){bad=true;break}
        if(n<=0){
          if(piececount(player,0,18)!==0){bad=true;break}
          if((ipos+die)!==25&&piececount(player,19,24-die)!==0){bad=true;break}
        }
        player[ipos]--;
        player[ipos+die]++;
      }
      if(bad){
        io.print('Move '+ipos+' is not legal.\n');
        while(k--){
          die=k?die2:die1;
          player[pos[k]]++;
          player[pos[k]+die]--;
        }
        return -1;
      }
      for(k=0;pos[k]!==NIL;k++){
        die=k?die2:die1;
        n=25-pos[k]-die;
        if(n>0&&playee[n]===1){playee[n]=0;playee[0]++}
      }
      return 0;
    }
    function nextmove(player,playee){
      var k,n,e;
      imoves=0;
      movegen(player,playee);
      if(die1!==die2){
        k=die1;die1=die2;die2=k;
        movegen(player,playee);
      }
      if(imoves===0){
        io.print('roll was '+die1+','+die2+'; no white move possible\n');
        return NIL;
      }
      k=strategy(player,playee);
      e=moves[k];
      for(n=0;n<4;n++){
        if(e.pos[n]===NIL)break;
        io.print('    '+(25-e.pos[n])+', '+e.mov[n]);
      }
      io.print('\n');
      for(n=0;n<4;n++){
        if(e.pos[n]===NIL)break;
        player[e.pos[n]]--;
        player[e.pos[n]+e.mov[n]]++;
        var t=25-e.pos[n]-e.mov[n];
        if(t>0&&playee[t]===1){playee[0]++;playee[t]--}
      }
      return 0;
    }
    var END={};
    function* getstr(){ /* at the end of its input the C runs off the top of the stack and dumps core */
      var s=yield* io.gets();
      if(s===null)throw END;
      return s;
    }
    try{
      var go=[0,0,0,0,0,NIL],s,n,t,k;
      io.print("Do you want instructions? Type 'y' for yes,\nanything else means no.?? ");
      s=yield* getstr();
      if(s.charAt(0)==='y')io.print(INSTR.join('\n')+'\n');
      io.print("Choose the level of your oppponent.\nType 'b' for beginner, or 'i' for intermediate.\nAnything else gets you an expert.?? ");
      s=yield* getstr();
      if(s.charAt(0)==='b')level='b';
      else if(s.charAt(0)==='i')level='i';
      io.print("You will play red. Do you wan't to move first?\nType 'y' for yes, anything else means no.?? ");
      s=yield* getstr();
      var whitefirst=s.charAt(0)!=='y';
      for(;;){
        var whitemoved=false;
        if(whitefirst){
          roll();
          io.print('white rolls '+die1+','+die2+'\n');
          io.print("white's move is:");
          if(nextmove(white,red)!==NIL){
            whitemoved=true;
            if(piececount(white,0,24)===0){
              io.print("White wins\nAren't you ashamed. You've been beaten by a computer.\n");
              return;
            }
          }
        }
        whitefirst=true;
        prtbrd();
        roll();
        for(;;){
          io.print('your roll is '+die1+',  '+die2+'\n');
          io.print('your move, please?? ');
          s=yield* getstr();
          if(s===''){io.print("red's move skipped\n");break}
          n=sscan(s,go);
          if((die1!==die2&&n>2)||n>4){io.print("you've made too many moves\n");continue}
          if(n>=0)go[n]=NIL; /* with n at -1 the C's go[-1] is nothing to the game, and last time's moves are played again */
          if(s.charAt(0)==='-'){
            go[0]=-go[0];
            t=die1;die1=die2;die2=t;
          }
          var ill=false;
          for(k=0;k<n;k++){
            if(0<=go[k]&&go[k]<=24)continue;
            io.print('move '+go[k]+' is illegal\n');
            ill=true;break;
          }
          if(ill)continue;
          if(play(red,white,go))continue;
          if(piececount(red,0,24)===0){
            io.print('Red wins.\nCongratulations! You have just defeated a dumb machine.\n');
            return;
          }
          break;
        }
      }
    }catch(e){if(e!==END)throw e}
  });
}});
})(window.Phosphor);
