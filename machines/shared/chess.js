/* PHOSPHOR-9 terminal: the game chess, on V7 and on 4.3BSD, whose chess was an 11-line wrapper that
   ran this same PDP-11 binary in compatibility mode (the two binaries are byte-identical). Ported to
   JavaScript for this terminal from V7's usr/src/games/chess, C and PDP-11 assembly. Built under V7
   with its own makefile, those sources give a file byte-identical to V7's /usr/games/chess, so they
   are what ran. README in that directory: "This program is not the one that won the U. S.
   championship." The V7 source is under this notice:

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

   Differences from the original:
   - /usr/lib/book, the opening book, is not on the V7 tape and is lost, so there is no book here;
     the real binary without its file behaves the same way (it opens it, fails, and goes on).
   - chess.out is a text file of the words the C wrote, not a binary one. A file that is not one
     chess could have written gets "cannot open file".
   - The search gives way to the page between slices, and the time spent away from it is left out of
     the clock the program looks at, so a slow or hidden tab cannot change the moves. That clock
     still decides the original's one timed choice: searching deeper in an end game.
   - The arrays live in one block laid out as in the binary, with the words after the board as they
     are there, so that running off the end of one (a game of 170 moves or so, or a pawn set up on
     its last rank) lands on what it landed on. Past the end of the data the program dies as it did.
*/
(function(P){
'use strict';
var
  CENTER=5,IPVAL=83,EDGE=104,BOARD=112,UPPER=176, /* word offsets from the data segment, 060000 */
  ATTACV=(0o62214-0o60000)>>1,CONTROL=(0o62414-0o60000)>>1,PV=((0o62666-0o60000)>>1)+6,DIR=(0o62720-0o60000)>>1,
  LMBUF=(0o63120-0o60000)>>1,AMBUF=(0o67040-0o60000)>>1,SBUF=(0o73600-0o60000)>>1,SOBUF=0o73744-0o60000,TOP=(0o76000-0o60000)>>1,
  /* what follows the board in the binary: its string constants */
  AFTER='43686573730a002f7573722f6c69622f626f6f6b0025733a2025643a256425640a00ba18ba186c195c1986199619941aac1a6b7172626e7020504e4252514b000a202020612062206320642065206620672068000a20202071207120712071206b206b206b206b0a20202072206e2062202020202062206e2072000a0025642e20002e2e2e200070706e6272716b00726e62000074696d65203d2025642f25640a00466f72636564206d6174650a000052657369676e0a00496c6c6567616c206d6f76650a007361766500746573740072656d6f76650065786974006d616e75616c0072657369676e00666972737400616c6700726573746f726500636c6f636b00776869746500626c61636b0073636f72650073657475700068696e74002025640a007265706561740065683f0a00447261772062792072657065746974696f6e0a0057686974652077696e730a00426c61636b2077696e730a005374616c65206d6174650a0063686573732e6f75740063616e6e6f742063726561746520',
  CENTERS=[2,3,4,4,4,4,3,2,3,6,8,8,8,8,6,3,4,8,12,12,12,12,8,4,4,8,12,14,14,12,8,4,4,8,12,14,14,12,8,4,4,8,12,12,12,12,8,4,3,6,8,8,8,8,6,3,2,3,4,4,4,4,3,2],
  IPVALS=[-3000,-900,-500,-300,-300,-100,0,100,300,300,500,900,3000],
  EDGES=[32,16,8,0,0,1,2,4],
  START=[4,2,3,5,6,3,2,4,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,-1,-1,-1,-1,-1,-1,-1,-1,-4,-2,-3,-5,-6,-3,-2,-4],
  /* from the assembly: squares a move in each direction would fall off */
  ULEFT=0o4040,URIGHT=0o4004,DLEFT=0o440,DRIGHT=0o404,LEFT=0o40,RIGHT=4,UP=0o4000,DOWN=0o400,
  U2R1=0o6004,U1R2=0o4006,D1R2=0o406,D2R1=0o604,D2L1=0o640,D1L2=0o460,U1L2=0o4060,U2L1=0o6040,
  RANK2=0o200,RANK7=0o2000,
  NONE=12345,SLICE=25,TICK=64,READ={},EXIT={},SAVED='chess.out';
function w16(x){return x<<16>>16}
function pad(n,w){return String(n).padStart(w,' ')}
function Fault(msg){this.msg=msg}

P.command({names:['chess'],run:function(){
  var M=new Int16Array(TOP),B8=new Int8Array(M.buffer);
  var lmp=0,amp=0,lp=0,ap=0,sbufp=0,
    moveno=1,depth=2,qdepth=8,mdepth=4,flag=0o33,eppos=64,bkpos=4,wkpos=60,
    clk0=0,clk1=0,testf=0,bookp=0,manflg=0,matflg=0,intrp=0,gval=0,game=0,abmove=0,mantom=0,ply=0,value=0,ivalue=0,mfmt=0,column=0,clockt=0;
  var piped=P.piped(),I=P.stdin()&&P.stdin().slice(),ipos=0,ibuf='',line='',sobuf=0,idle=0,tick=0;
  (function(){
    var i;
    for(i=0;i<64;i++){M[CENTER+i]=CENTERS[i];M[BOARD+i]=START[i]}
    for(i=0;i<13;i++)M[IPVAL+i]=IPVALS[i];
    for(i=0;i<8;i++)M[EDGE+i]=EDGES[i];
    for(i=0;i<AFTER.length;i+=2)B8[UPPER*2+i/2]=parseInt(AFTER.substr(i,2),16);
  })();

  /* ---- output: printf went through stdio, putchar straight to write(2). On a terminal stdio does not
     buffer, so the two stay in order. To a pipe, printf's text waits in a 512-byte buffer until it fills
     or the program exits, and the two come out shuffled, as they did. */
  function emit(s){
    var i,n;
    while((i=s.indexOf('\n'))>=0){P.typeLine(line+s.slice(0,i));line='';s=s.slice(i+1)}
    line+=s;
  }
  function printf(s){
    if(!piped){emit(s);return}
    for(var i=0;i<s.length;i++){
      if(sobuf===512)flush();
      B8[SOBUF+sobuf++]=s.charCodeAt(i);
    }
  }
  function flush(){
    var t='',i;
    for(i=0;i<sobuf;i++)t+=String.fromCharCode(B8[SOBUF+i]&255);
    sobuf=0;
    emit(t);
  }
  function putchar(c){
    if(c==='\n')column=0;else column++;
    emit(c);
  }
  function exit(){throw EXIT}
  function onhup(){exit()}

  /* ---- the clock, whole seconds as time(2) gave, without the time spent giving way to the page */
  function seconds(){return Math.floor((Date.now()-idle)/1000)}
  function clock(){var t=seconds(),d=t-clockt;clockt=t;return w16(d)}
  function ctime(s,t){printf(s+': '+Math.trunc(t/60)+':'+(Math.trunc(t/10)%6)+(t%10)+'\n')}
  function increm(){
    if(mantom)clk1=w16(clk1+clock());else clk0=w16(clk0+clock());
    if(mantom)moveno++;
    mantom=mantom?0:1;
  }
  function decrem(){
    mantom=mantom?0:1;
    if(mantom)moveno--;
  }

  /* ---- wgen.s */
  function wtry(s,mask,off){
    if(M[DIR+s]&mask)return;
    var c=M[BOARD+s+off];
    if(c<0)return;
    M[lp++]=value-M[PV+c];
    M[lp++]=(s<<8)|((s+off)&255);
  }
  function wslide(s,mask,off){
    var q=s,c;
    while(!(M[DIR+q]&mask)){
      q+=off;
      c=M[BOARD+q];
      if(c<0)return;
      if(c>0){
        M[lp++]=value-M[PV+c];
        M[lp++]=(s<<8)|(q&255);
        return;
      }
      M[lp++]=value;
      M[lp++]=(s<<8)|(q&255);
    }
  }
  function wgen(){
    if(lmp>TOP-600)throw new Fault('Memory fault');
    lp=lmp;
    for(var s=63;s>=0;s--){
      var c=M[BOARD+s],d=M[DIR+s];
      if(c>=0)continue;
      switch(c){
      case -1:
        if(!(d&ULEFT)){
          if(M[BOARD+s-9]>0)wtry(s,0,-9);
          if(s-9===eppos)wtry(s,0,-1);
        }
        if(!(d&URIGHT)){
          if(M[BOARD+s-7]>0)wtry(s,0,-7);
          if(s-7===eppos)wtry(s,0,1);
        }
        if(M[BOARD+s-8]!==0)break;
        wtry(s,0,-8);
        if(!(d&RANK2))break;
        if(M[BOARD+s-16]!==0)break;
        wtry(s,0,-16);
        break;
      case -2:
        wtry(s,U2R1,-15);wtry(s,U1R2,-6);wtry(s,D1R2,10);wtry(s,D2R1,17);
        wtry(s,D2L1,15);wtry(s,D1L2,6);wtry(s,U1L2,-10);wtry(s,U2L1,-17);
        break;
      case -3:
        wslide(s,ULEFT,-9);wslide(s,URIGHT,-7);wslide(s,DLEFT,7);wslide(s,DRIGHT,9);
        break;
      case -4:
        wslide(s,UP,-8);wslide(s,DOWN,8);wslide(s,LEFT,-1);wslide(s,RIGHT,1);
        break;
      case -5:
        wslide(s,ULEFT,-9);wslide(s,URIGHT,-7);wslide(s,DLEFT,7);wslide(s,DRIGHT,9);
        wslide(s,UP,-8);wslide(s,LEFT,-1);wslide(s,RIGHT,1);wslide(s,DOWN,8);
        break;
      case -6:
        wtry(s,ULEFT,-9);wtry(s,URIGHT,-7);wtry(s,DLEFT,7);wtry(s,DRIGHT,9);
        wtry(s,UP,-8);wtry(s,LEFT,-1);wtry(s,RIGHT,1);wtry(s,DOWN,8);
        break;
      default:throw new Fault('Memory fault');
      }
    }
    lmp=lp;
  }

  /* ---- bgen.s */
  function btry(s,mask,off){
    if(M[DIR+s]&mask)return;
    var c=M[BOARD+s+off];
    if(c>0)return;
    M[lp++]=M[PV+c]-value;
    M[lp++]=(s<<8)|((s+off)&255);
  }
  function bslide(s,mask,off){
    var q=s,c;
    while(!(M[DIR+q]&mask)){
      q+=off;
      c=M[BOARD+q];
      if(c>0)return;
      if(c<0){
        M[lp++]=M[PV+c]-value;
        M[lp++]=(s<<8)|(q&255);
        return;
      }
      M[lp++]=-value;
      M[lp++]=(s<<8)|(q&255);
    }
  }
  function bgen(){
    if(lmp>TOP-600)throw new Fault('Memory fault');
    lp=lmp;
    for(var s=63;s>=0;s--){
      var c=M[BOARD+s],d=M[DIR+s];
      if(c<=0)continue;
      switch(c){
      case 1:
        if(!(d&DLEFT)){
          if(M[BOARD+s+7]<0)btry(s,0,7);
          if(s+7===eppos)btry(s,0,-1);
        }
        if(!(d&DRIGHT)){
          if(M[BOARD+s+9]<0)btry(s,0,9);
          if(s+9===eppos)btry(s,0,1);
        }
        if(M[BOARD+s+8]!==0)break;
        btry(s,0,8);
        if(!(d&RANK7))break;
        if(M[BOARD+s+16]!==0)break;
        btry(s,0,16);
        break;
      case 2:
        btry(s,U2R1,-15);btry(s,U1R2,-6);btry(s,D1R2,10);btry(s,D2R1,17);
        btry(s,D2L1,15);btry(s,D1L2,6);btry(s,U1L2,-10);btry(s,U2L1,-17);
        break;
      case 3:
        bslide(s,ULEFT,-9);bslide(s,URIGHT,-7);bslide(s,DLEFT,7);bslide(s,DRIGHT,9);
        break;
      case 4:
        bslide(s,UP,-8);bslide(s,DOWN,8);bslide(s,LEFT,-1);bslide(s,RIGHT,1);
        break;
      case 5:
        bslide(s,ULEFT,-9);bslide(s,URIGHT,-7);bslide(s,DLEFT,7);bslide(s,DRIGHT,9);
        bslide(s,UP,-8);bslide(s,LEFT,-1);bslide(s,RIGHT,1);bslide(s,DOWN,8);
        break;
      case 6:
        btry(s,ULEFT,-9);btry(s,URIGHT,-7);btry(s,DLEFT,7);btry(s,DRIGHT,9);
        btry(s,UP,-8);btry(s,LEFT,-1);btry(s,RIGHT,1);btry(s,DOWN,8);
        break;
      default:throw new Fault('Memory fault');
      }
    }
    lmp=lp;
  }

  /* ---- wmove.s. A record is seven words: value, flag, eppos, from, to, what was taken, and the type:
     0 king, 1 plain, 2 and 3 castling, 4 en passant, 5 promotion. */
  function wmove(m){
    var to=m<<24>>24,from=m<<16>>24,cap=M[BOARD+to],c;
    if(amp>TOP-8)throw new Fault('Memory fault');
    M[amp++]=value;M[amp++]=flag;M[amp++]=eppos;M[amp++]=from;M[amp++]=to;M[amp++]=cap;
    if(cap)value=w16(value-M[PV+cap]);
    c=M[BOARD+from];
    M[BOARD+to]=c;
    M[BOARD+from]=0;
    eppos=-1;
    if(c>=0)throw new Fault('Trace/BPT trap');
    switch(c){
    case -1:{
      var d=Math.abs(from-to);
      if(d===1){
        M[BOARD+to]=0;
        M[BOARD+to-8]=-1;
        M[amp++]=4;
        return;
      }
      if(d===16){eppos=from-8;M[amp++]=1;return}
      if(to>=24){M[amp++]=1;return}
      value=w16(value-25);
      if(to>=16){M[amp++]=1;return}
      value=w16(value-50);
      if(to>=8){M[amp++]=1;return}
      value=w16(value-625);
      M[BOARD+to]=-5;
      M[amp++]=5;
      return;
    }
    case -2:case -3:M[amp++]=1;return;
    case -4:
      if(from===63)flag&=~1;
      else if(from===56)flag&=~2;
      M[amp++]=1;
      return;
    case -5:
      if(game===0)value=w16(value+1);
      M[amp++]=1;
      return;
    case -6:
      wkpos=to;
      flag&=~3;
      if(from===60){
        if(to===62){
          value=w16(value-1);
          M[BOARD+61]=-4;M[BOARD+63]=0;
          M[amp++]=2;
          return;
        }
        if(to===58){
          value=w16(value-1);
          M[BOARD+59]=-4;M[BOARD+56]=0;
          M[amp++]=3;
          return;
        }
      }
      if(game===0)value=w16(value+2);
      M[amp++]=0;
      return;
    }
    throw new Fault('Memory fault');
  }
  /* a record overwritten after the history ran off its buffer: where its square, doubled in 16 bits, falls */
  function wild(x){
    var a=(0o60340+(x<<1))&0xffff;
    if(a<0o60000||a>=0o76000)throw new Fault('Memory fault');
    return (a-0o60000)>>1;
  }
  function wremove(){
    var t=M[--amp],cap=M[--amp],to=M[--amp],from=M[--amp],fi=BOARD+from,ti=BOARD+to;
    eppos=M[--amp];flag=M[--amp];value=M[--amp];
    if((from|to)>>>6){fi=wild(from);ti=wild(to)}
    M[fi]=M[ti];
    M[ti]=cap;
    switch(t){
    case 0:wkpos=from;return;
    case 1:return;
    case 2:M[BOARD+63]=-4;M[BOARD+61]=0;wkpos=60;return;
    case 3:M[BOARD+56]=-4;M[BOARD+59]=0;wkpos=60;return;
    case 4:M[fi]=-1;M[ti-8]=0;return;
    case 5:M[fi]=-1;return;
    }
    throw new Fault('Memory fault');
  }

  /* ---- bmove.s */
  function bmove(m){
    var to=m<<24>>24,from=m<<16>>24,cap=M[BOARD+to],c;
    if(amp>TOP-8)throw new Fault('Memory fault');
    M[amp++]=value;M[amp++]=flag;M[amp++]=eppos;M[amp++]=from;M[amp++]=to;M[amp++]=cap;
    if(cap)value=w16(value-M[PV+cap]);
    c=M[BOARD+from];
    M[BOARD+to]=c;
    M[BOARD+from]=0;
    eppos=-1;
    if(c<=0)throw new Fault('Trace/BPT trap');
    switch(c){
    case 1:{
      var d=Math.abs(from-to);
      if(d===1){
        M[BOARD+to]=0;
        M[BOARD+to+8]=1;
        M[amp++]=4;
        return;
      }
      if(d===16){eppos=from+8;M[amp++]=1;return}
      if(to<40){M[amp++]=1;return}
      value=w16(value+25);
      if(to<48){M[amp++]=1;return}
      value=w16(value+50);
      if(to<56){M[amp++]=1;return}
      value=w16(value+625);
      M[BOARD+to]=5;
      M[amp++]=5;
      return;
    }
    case 2:case 3:M[amp++]=1;return;
    case 4:
      if(from===7)flag&=~0o10;
      else if(from===0)flag&=~0o20;
      M[amp++]=1;
      return;
    case 5:
      if(game===0)value=w16(value-1);
      M[amp++]=1;
      return;
    case 6:
      bkpos=to;
      flag&=~0o30;
      if(from===4){
        if(to===6){
          value=w16(value+1);
          M[BOARD+5]=4;M[BOARD+7]=0;
          M[amp++]=2;
          return;
        }
        if(to===2){
          value=w16(value+1);
          M[BOARD+3]=4;M[BOARD+0]=0;
          M[amp++]=3;
          return;
        }
      }
      if(game===0)value=w16(value-2);
      M[amp++]=0;
      return;
    }
    throw new Fault('Memory fault');
  }
  function bremove(){
    var t=M[--amp],cap=M[--amp],to=M[--amp],from=M[--amp],fi=BOARD+from,ti=BOARD+to;
    eppos=M[--amp];flag=M[--amp];value=M[--amp];
    if((from|to)>>>6){fi=wild(from);ti=wild(to)}
    M[fi]=M[ti];
    M[ti]=cap;
    switch(t){
    case 0:bkpos=from;return;
    case 1:return;
    case 2:M[BOARD+7]=4;M[BOARD+5]=0;bkpos=4;return;
    case 3:M[BOARD+0]=4;M[BOARD+3]=0;bkpos=4;return;
    case 4:M[fi]=1;M[ti+8]=0;return;
    case 5:M[fi]=1;return;
    }
    throw new Fault('Memory fault');
  }

  /* ---- att.s: 0 if the side attacks the square, 1 if not. The king counts only on the first step. */
  function ray(s,mask,off,a,q,k){
    var c;
    if(M[DIR+s]&mask)return false;
    s+=off;
    c=M[BOARD+s];
    if(c!==0)return c===a||c===q||c===k;
    for(;;){
      if(M[DIR+s]&mask)return false;
      s+=off;
      c=M[BOARD+s];
      if(c!==0)return c===a||c===q;
    }
  }
  function battack(s){
    var d=M[DIR+s],b=BOARD+s;
    if(!(d&U2R1)&&M[b-15]===2)return 0;
    if(!(d&U1R2)&&M[b-6]===2)return 0;
    if(!(d&D1R2)&&M[b+10]===2)return 0;
    if(!(d&D2R1)&&M[b+17]===2)return 0;
    if(!(d&D2L1)&&M[b+15]===2)return 0;
    if(!(d&D1L2)&&M[b+6]===2)return 0;
    if(!(d&U1L2)&&M[b-10]===2)return 0;
    if(!(d&U2L1)&&M[b-17]===2)return 0;
    if(ray(s,ULEFT,-9,3,5,6)||ray(s,URIGHT,-7,3,5,6)||ray(s,DLEFT,7,3,5,6)||ray(s,DRIGHT,9,3,5,6)||
       ray(s,UP,-8,4,5,6)||ray(s,LEFT,-1,4,5,6)||ray(s,RIGHT,1,4,5,6)||ray(s,DOWN,8,4,5,6))return 0;
    if(!(d&ULEFT)&&M[b-9]===1)return 0;
    if(!(d&URIGHT)&&M[b-7]===1)return 0;
    return 1;
  }
  function wattack(s){
    var d=M[DIR+s],b=BOARD+s;
    if(!(d&U2R1)&&M[b-15]===-2)return 0;
    if(!(d&U1R2)&&M[b-6]===-2)return 0;
    if(!(d&D1R2)&&M[b+10]===-2)return 0;
    if(!(d&D2R1)&&M[b+17]===-2)return 0;
    if(!(d&D2L1)&&M[b+15]===-2)return 0;
    if(!(d&D1L2)&&M[b+6]===-2)return 0;
    if(!(d&U1L2)&&M[b-10]===-2)return 0;
    if(!(d&U2L1)&&M[b-17]===-2)return 0;
    if(ray(s,ULEFT,-9,-3,-5,-6)||ray(s,URIGHT,-7,-3,-5,-6)||ray(s,DLEFT,7,-3,-5,-6)||ray(s,DRIGHT,9,-3,-5,-6)||
       ray(s,UP,-8,-4,-5,-6)||ray(s,LEFT,-1,-4,-5,-6)||ray(s,RIGHT,1,-4,-5,-6)||ray(s,DOWN,8,-4,-5,-6))return 0;
    if(!(d&DLEFT)&&M[b+7]===-1)return 0;
    if(!(d&DRIGHT)&&M[b+9]===-1)return 0;
    return 1;
  }

  /* ---- ctrl.s: who controls a square. The knight list has only seven of the eight jumps, d1r2 is not
     in it, and the king is not counted. */
  function look(q,v){if(M[BOARD+q]===v)M[ap++]=v}
  function patt(s,mask,off){
    if(M[DIR+s]&mask)return;
    look(s+off,2);
    look(s+off,-2);
  }
  function satt(s,mask,off,pawn,a){
    var q=s,c;
    if(M[DIR+s]&mask)return;
    look(s+off,pawn);
    for(;;){
      if(M[DIR+q]&mask)return;
      q+=off;
      c=M[BOARD+q];
      if(c===0)continue;
      if(c===a||c===-a||c===5||c===-5)M[ap++]=c;
      else return;
    }
  }
  function attack(s){
    ap=ATTACV;
    patt(s,U2R1,-15);patt(s,U1R2,-6);patt(s,D2R1,17);patt(s,D2L1,15);patt(s,D1L2,6);patt(s,U1L2,-10);patt(s,U2L1,-17);
    satt(s,ULEFT,-9,1,3);satt(s,URIGHT,-7,1,3);satt(s,DLEFT,7,-1,3);satt(s,DRIGHT,9,-1,3);
    satt(s,UP,-8,NONE,4);satt(s,LEFT,-1,NONE,4);satt(s,RIGHT,1,NONE,4);satt(s,DOWN,8,NONE,4);
    M[ap++]=0;
  }

  /* ---- qsort.s: not stable, so the order of equal scores, and so the move chosen, comes from this */
  function swap2(a,b){
    var x=M[a];M[a]=M[b];M[b]=x;
    x=M[a+1];M[a+1]=M[b+1];M[b+1]=x;
  }
  function qsort(r1,r2){
    var r3,n,from,to;
    for(;;){
      n=r2-r1;
      if(n<=2)return;
      r3=r1+((n&~3)>>1);
      from=r1;to=r2;
      outer:for(;;){
        /* loop: */
        while(r1<r3&&M[r1]<=M[r3])r1+=2;
        /* loop1: */
        for(;;){
          if(r2<=r3){
            if(r1===r3)break outer;
            swap2(r1,r2);
            r3=r1;
            continue;
          }
          r2-=2;
          if(M[r2]>=M[r3])continue;
          swap2(r1,r2);
          if(r1===r3)r3=r2;
          continue outer;
        }
      }
      qsort(r3+2,to);
      r2=r3;r1=from;
    }
  }

  /* ---- init.c */
  function check(){return !wattack(bkpos)||!battack(wkpos)?1:0}
  function stage(){
    var i,a;
    qdepth=depth+8;
    for(i=0;i<13;i++)M[PV-6+i]=M[IPVAL+i];
    value=0;
    for(i=0;i<64;i++)value=w16(value+M[PV+M[BOARD+i]]);
    gval=value>150?1:value<-150?-1:0;
    for(i=-6;i<=6;i++){
      a=M[PV+i];
      a=a<0?a-50:a+50;
      a=a<0?-Math.trunc(-a/100):Math.trunc(a/100);
      if(i)M[PV+i]=a*100-gval;
    }
    a=13800;
    for(i=63;i>=0;i--)a=w16(a-Math.abs(M[PV+M[BOARD+i]]));
    game=a>4000?3:a>2000?2:moveno>5?1:0;
  }
  function posit(f,p,a){
    var m;
    while(amp!==p){
      m=w16((M[amp+3]<<8)|(M[amp+4]&255));
      f(m,a);
      if(mantom){bmove(m);moveno++;mantom=0}
      else{wmove(m);mantom=1}
    }
  }
  var RA=new Int16Array(66);
  function rept1(){
    if(mantom!==RA[64])return;
    for(var i=0;i<64;i++)if(M[BOARD+i]!==RA[i])return;
    RA[65]++;
  }
  function rept(){
    var i,p=amp;
    for(i=0;i<64;i++)RA[i]=M[BOARD+i];
    RA[64]=mantom;
    RA[65]=0;
    while(M[amp-1]!==-1){
      if(M[amp-2])break;
      i=M[BOARD+M[amp-3]];
      if(i===1||i===-1)break;
      if(mantom)wremove();else bremove();
      decrem();
    }
    posit(rept1,p);
    return RA[65];
  }

  /* ---- agen.c */
  function bagen(){
    var p1=lmp,p2,v;
    if((flag&0o10)!==0&&M[BOARD+5]===0&&M[BOARD+6]===0&&M[BOARD+7]===4&&wattack(4)&&wattack(5)&&wattack(6))bcheck(4,6);
    if((flag&0o20)!==0&&M[BOARD+0]===4&&M[BOARD+1]===0&&M[BOARD+2]===0&&M[BOARD+3]===0&&wattack(2)&&wattack(3)&&wattack(4))bcheck(4,2);
    bgen();
    p2=p1;
    while(p2!==lmp){
      v=M[p2++];
      bmove(M[p2]);
      if(wattack(bkpos)){M[p1++]=v;M[p1++]=M[p2]}
      p2++;
      bremove();
    }
    lmp=p1;
  }
  function bcheck(from,to){
    var c=M[BOARD+to];
    if(c>0)return;
    M[lmp++]=M[PV+c]-value;
    M[lmp++]=(from<<8)|to;
  }
  function wagen(){
    var p1=lmp,p2,v;
    if((flag&1)!==0&&M[BOARD+61]===0&&M[BOARD+62]===0&&M[BOARD+63]===-4&&battack(60)&&battack(61)&&battack(62))wcheck(60,62);
    if((flag&2)!==0&&M[BOARD+56]===-4&&M[BOARD+57]===0&&M[BOARD+58]===0&&M[BOARD+59]===0&&battack(58)&&battack(59)&&battack(60))wcheck(60,58);
    wgen();
    p2=p1;
    while(p2!==lmp){
      v=M[p2++];
      wmove(M[p2]);
      if(battack(wkpos)){M[p1++]=v;M[p1++]=M[p2]}
      p2++;
      wremove();
    }
    lmp=p1;
  }
  function wcheck(from,to){
    var c=M[BOARD+to];
    if(c<0)return;
    M[lmp++]=value-M[PV+c];
    M[lmp++]=(from<<8)|to;
  }

  /* ---- stat.c */
  function xheur(ploc){
    var p1=lmp,p2=lmp,to,from,pie=M[BOARD+ploc];
    if(mantom)wgen();else bgen();
    while(p2!==lmp){
      p2++;
      to=M[p2++]&255;
      if(to===ploc){
        from=M[p2-1]>>8;
        if(Math.abs(M[BOARD+from])<Math.abs(pie)){
          lmp=p1;
          return Math.trunc(M[PV+pie]/60);
        }
      }
    }
    lmp=p1;
    return 0;
  }
  function srnd1(p,m,o){if((M[DIR+p]&m)===0)M[CONTROL+p+o]+=10}
  function srnd(p){
    srnd1(p,ULEFT,-9);srnd1(p,URIGHT,-7);srnd1(p,DLEFT,7);srnd1(p,DRIGHT,9);
    srnd1(p,UP,-8);srnd1(p,LEFT,-1);srnd1(p,RIGHT,1);srnd1(p,DOWN,8);srnd1(p,0,0);
  }
  /* ---- wheur.c */
  function wheur1(){
    var p1,p2,p3,i,pto=0,tk=M[amp-2];
    if(tk){i=M[amp-3];pto=M[BOARD+i];M[BOARD+i]=0}
    p1=lmp;
    wgen();
    p2=lmp;
    lmp=p1;
    bgen();
    p3=lmp;
    lmp=p1;
    i=w16(p2-p3)>>1;
    if(M[amp-2])M[BOARD+M[amp-3]]=pto;
    return i;
  }
  function wheur2(){
    var i=0;
    if(game>2)return i;
    i+=9*((M[BOARD+57]!==-2?1:0)+(M[BOARD+62]!==-2?1:0));
    i+=8*((M[BOARD+58]!==-3?1:0)+(M[BOARD+61]!==-3?1:0));
    if(M[BOARD+51]===-1&&M[BOARD+51-8]!==0)i-=10;
    if(M[BOARD+52]===-1&&M[BOARD+52-8]!==0)i-=10;
    return i;
  }
  function wheur3(){
    var i=0;
    if(flag&2&&M[BOARD+48]===-1&&M[BOARD+49]===-1&&M[BOARD+50]===-1)i+=20;
    if(flag&1&&M[BOARD+53]===-1&&M[BOARD+54]===-1&&M[BOARD+55]===-1)i+=20;
    if(i===40)i=22;
    if(wkpos===58)
      if(M[BOARD+50]===-1&&(M[BOARD+48]===-1||M[BOARD+48-8]===-1)&&(M[BOARD+49]===-1||M[BOARD+49-8]===-1))i+=40;
    if(wkpos===62)
      if(M[BOARD+53]===-1&&(M[BOARD+54]===-1||M[BOARD+54-8]===-1)&&(M[BOARD+55]===-1||M[BOARD+55-8]===-1))i+=40;
    return i;
  }
  function wheur4(){
    var p1,p2,ploc,i;
    if(M[amp-1]!==1)return 0;
    ploc=M[amp-3];
    if(M[BOARD+ploc]===-1)return 0;
    if(xheur(ploc))return 0;
    p1=lmp;p2=p1;
    bagen();
    i=0;
    while(p2!==lmp){
      p2++;
      bmove(M[p2++]);
      i=xheur(ploc);
      bremove();
      if(i)break;
    }
    lmp=p1;
    return i;
  }
  function wheur5(){
    var i,j,k,s,n,d,pto=0,tk=M[amp-2];
    if(tk){i=M[amp-3];pto=M[BOARD+i];M[BOARD+i]=0}
    for(i=63;i>=0;i--)M[CONTROL+i]=0;
    if(game<2)for(i=63;i>=0;i--)M[CONTROL+i]+=M[CENTER+i];
    if(mantom){if((flag&3)===0)srnd(wkpos)}
    else{if((flag&0o30)===0)srnd(bkpos)}
    s=0;
    for(i=63;i>=0;i--){
      n=w16(M[CONTROL+i]*100);
      attack(i);
      j=0;
      while((k=M[ATTACV+j++])!==0){
        d=M[PV+k];
        if(d<0)s=w16(s-Math.trunc(n/(-d)));
        else s=w16(s+Math.trunc(n/d));
      }
    }
    if(M[amp-2])M[BOARD+M[amp-3]]=pto;
    return w16(-s);
  }
  function* wheur6(){
    var i=0;
    M[amp++]=-1;
    if(wattack(bkpos))
      if(yield* mate(2,0))i+=15;
    amp--;
    return i;
  }
  function* wstatic(f){
    var i=0,j,h;
    for(h=1;h<=6;h++){
      j=h===1?wheur1():h===2?wheur2():h===3?wheur3():h===4?wheur4():h===5?wheur5():yield* wheur6();
      if(f)printf(pad(j,4)+' ');
      i+=j;
    }
    if(f)printf('='+pad(i,4)+' ');
    return w16(-i);
  }
  /* ---- bheur.c. The last test of bheur3 really does look for white pawns: it is that way in the source. */
  function bheur2(){
    var i=0,mt;
    if(game>2)return i;
    mt=M[amp-1];
    if(mt===2||mt===3)i+=30;
    if(mt===0)i-=20;
    i+=9*((M[BOARD+1]!==2?1:0)+(M[BOARD+6]!==2?1:0));
    i+=8*((M[BOARD+2]!==3?1:0)+(M[BOARD+5]!==3?1:0));
    if(M[BOARD+11]===1&&M[BOARD+11+8]!==0)i-=10;
    if(M[BOARD+12]===1&&M[BOARD+12+8]!==0)i-=10;
    return i;
  }
  function bheur3(){
    var i=0;
    if(flag&0o20&&M[BOARD+8]===1&&M[BOARD+9]===1&&M[BOARD+10]===1)i+=20;
    if(flag&0o10&&M[BOARD+13]===1&&M[BOARD+14]===1&&M[BOARD+15]===1)i+=20;
    if(i===40)i=22;
    if(bkpos===2)
      if(M[BOARD+10]===1&&(M[BOARD+8]===1||M[BOARD+8+8]===1)&&(M[BOARD+9]===1||M[BOARD+9+8]===1))i+=40;
    if(bkpos===6)
      if(M[BOARD+13]===1&&(M[BOARD+14]===1||M[BOARD+14+8]===1)&&(M[BOARD+15]===-1||M[BOARD+15+8]===-1))i+=40;
    return i;
  }
  function bheur4(){
    var p1,p2,ploc,i;
    if(M[amp-1]!==1)return 0;
    ploc=M[amp-3];
    if(M[BOARD+ploc]===1)return 0;
    if(xheur(ploc))return 0;
    p1=lmp;p2=p1;
    wagen();
    i=0;
    while(p2!==lmp){
      p2++;
      wmove(M[p2++]);
      i=xheur(ploc);
      wremove();
      if(i)break;
    }
    lmp=p1;
    return w16(-i);
  }
  function* bheur6(){
    var i=0;
    M[amp++]=-1;
    if(battack(wkpos))
      if(yield* mate(2,0))i+=15;
    amp--;
    return i;
  }
  function* bstatic(f){
    var i=0,j,h;
    for(h=1;h<=6;h++){
      j=h===1?w16(-wheur1()):h===2?bheur2():h===3?bheur3():h===4?bheur4():h===5?w16(-wheur5()):yield* bheur6();
      if(f)printf(pad(j,4)+' ');
      i+=j;
    }
    if(f)printf('='+pad(i,4)+' ');
    return w16(-i);
  }
  function* statl(){
    var p1=lmp,p2=lmp,p3;
    stage();
    if(mantom)bagen();else wagen();
    if(lmp===p1+1)return p1;
    while(p2!==lmp){
      p3=p2++;
      if(mantom){
        bmove(M[p2++]);
        M[p3]=yield* bstatic(0);
        bremove();
      }else{
        wmove(M[p2++]);
        M[p3]=yield* wstatic(0);
        wremove();
      }
    }
    qsort(p1,lmp);
    return p1;
  }

  /* ---- mater.c */
  function* mate(n,f){
    var a,b;
    mantom=mantom?0:1;
    if(f===0){
      b=yield* mater(n);
      mantom=mantom?0:1;
      return b;
    }
    b=0;
    if(matflg){
      a=1;
      while(!(yield* mater(a))){
        if(a>=n){
          matflg=0;
          return 0;  /* mantom is left turned over here, as it is in the C */
        }
        a++;
      }
      b=abmove;
    }else{
      a=n;
      while(yield* mater(a)){
        if(a===mdepth){
          printf('Forced mate\n');
          matflg++;
        }
        b=abmove;
        if(a===0)break;
        a--;
      }
    }
    mantom=mantom?0:1;
    if(b){
      abmove=b;
      return 1;
    }
    return 0;
  }
  function* mater(ns){
    var p1,p2,p3,f;
    if(intrp||--ns<0)return 0;
    if(++tick>=TICK){tick=0;yield 0}
    p1=lmp;p2=p1;p3=p1;
    if(mantom)wgen();else bgen();
    while(p2!==lmp){
      p2++;
      if(mantom)wmove(M[p2]);else bmove(M[p2]);
      if((!mantom&&!battack(wkpos)&&wattack(bkpos))||(mantom&&!wattack(bkpos)&&battack(wkpos))){
        M[p3]=M[p2];
        p3++;
      }
      if(mantom)wremove();else bremove();
      p2++;
    }
    lmp=p3;
    p2=p1;
    while(p2!==lmp){
      if(mantom)wmove(M[p2]);else bmove(M[p2]);
      f=yield* xmater(ns);
      if(mantom)wremove();else bremove();
      if(f){
        abmove=M[p2];
        lmp=p1;
        return 1;
      }
      p2++;
    }
    lmp=p1;
    return 0;
  }
  function* xmater(ns){
    var p1=lmp,p2=lmp,f;
    if(mantom)bagen();else wagen();
    if(p2+2===lmp&&rept()===0)ns++;
    while(p2!==lmp){
      p2++;
      if(mantom)bmove(M[p2]);else wmove(M[p2]);
      f=yield* mater(ns);
      if(mantom)bremove();else wremove();
      if(!f){
        lmp=p1;
        return 0;
      }
      p2++;
    }
    lmp=p1;
    return 1;
  }

  /* ---- wplay.c */
  function* wplay(){
    var v1,v2,p1,p2,ab;
    if(value<ivalue)ivalue=value;
    ab=0;
    v1=3000;
    ply=0;
    p1=yield* statl();
    if(lmp===p1+2){
      abmove=M[p1+1];
      lmp=p1;
      return ivalue;
    }
    p2=p1;
    mantom=mantom?0:1;
    while(p2!==lmp){
      p2++;
      wmove(M[p2]);
      if(testf){
        mantom=mantom?0:1;
        yield* wstatic(1);
        mantom=mantom?0:1;
      }
      if(rept())v2=0;
      else v2=yield* bplay1(v1);
      if(v2<v1&&!(yield* mate(3,0))){
        ab=M[p2];
        v1=v2;
      }
      wremove();
      if(testf){
        mantom=mantom?0:1;
        printf(pad(v2,6)+' ');
        out(M[p2]);
        printf('\n');
        mantom=mantom?0:1;
      }
      p2++;
      yield 0;
    }
    if(ab===0&&lmp!==p1)ab=M[p1+1];
    mantom=mantom?0:1;
    lmp=p1;
    abmove=ab;
    return v1;
  }
  function* wplay1(ab){
    var v1,v2,p1,p2;
    if(ply>=depth)return wquies(ab);
    if(++tick>=TICK){tick=0;yield 0}
    ply++;
    p1=p2=lmp;
    wgen();
    qsort(p1,lmp);
    v1=3000;
    while(p2!==lmp){
      if(intrp)break;
      p2++;
      wmove(M[p2]);
      if(battack(wkpos)){
        v2=yield* bplay1(v1);
        if(v2<v1)v1=v2;
      }
      wremove();
      if(v1<=ab)break;
      p2++;
    }
    ply--;
    lmp=p1;
    if(v1===3000){
      v1--;
      if(!check())v1=0;
    }
    return v1;
  }
  function wquies(ab){
    var p1,p2,p3,v1,v2,x;
    if(ply>=qdepth)return ivalue;
    p1=p2=p3=lmp;
    wgen();
    while(p2!==lmp){
      v1=M[p2++];
      if(v1!==value&&v1<=w16(ivalue+50)){
        x=M[p2];
        M[p3++]=(Math.trunc(M[PV+M[BOARD+(x>>8)]]/100)<<8)|Math.trunc(-M[PV+M[BOARD+(x&255)]]/100);
        M[p3++]=x;
      }
      p2++;
    }
    if(p3===p1){
      lmp=p1;
      return value;
    }
    ply++;
    qsort(p1,p3);
    lmp=p3;
    p2=p1;
    v1=value;
    while(p2!==lmp){
      p2++;
      wmove(M[p2]);
      if(battack(wkpos))v2=bquies(v1);
      else v2=3000;
      if(v2<v1)v1=v2;
      wremove();
      if(v1<=ab)break;
      p2++;
    }
    ply--;
    lmp=p1;
    return v1;
  }

  /* ---- bplay.c */
  function* bplay(){
    var v1,v2,p1,p2,ab;
    if(value>ivalue)ivalue=value;
    ab=0;
    v1=-3000;
    ply=0;
    p1=yield* statl();
    if(lmp===p1+2){
      abmove=M[p1+1];
      lmp=p1;
      return ivalue;
    }
    p2=p1;
    mantom=mantom?0:1;
    while(p2!==lmp){
      p2++;
      bmove(M[p2]);
      if(testf){
        mantom=mantom?0:1;
        yield* bstatic(1);
        mantom=mantom?0:1;
      }
      if(rept())v2=0;
      else v2=yield* wplay1(v1);
      if(v2>v1&&!(yield* mate(3,0))){
        ab=M[p2];
        v1=v2;
      }
      bremove();
      if(testf){
        mantom=mantom?0:1;
        printf(pad(v2,6)+' ');
        out(M[p2]);
        printf('\n');
        mantom=mantom?0:1;
      }
      p2++;
      yield 0;
    }
    if(ab===0&&lmp!==p1)ab=M[p1+1];
    mantom=mantom?0:1;
    lmp=p1;
    abmove=ab;
    return v1;
  }
  function* bplay1(ab){
    var v1,v2,p1,p2;
    if(ply>=depth)return bquies(ab);
    if(++tick>=TICK){tick=0;yield 0}
    ply++;
    p1=p2=lmp;
    bgen();
    qsort(p1,lmp);
    v1=-3000;
    while(p2!==lmp){
      if(intrp)break;
      p2++;
      bmove(M[p2]);
      if(wattack(bkpos)){
        v2=yield* wplay1(v1);
        if(v2>v1)v1=v2;
      }
      bremove();
      if(v1>=ab)break;
      p2++;
    }
    ply--;
    lmp=p1;
    if(v1===-3000){
      v1++;
      if(!check())v1=0;
    }
    return v1;
  }
  function bquies(ab){
    var p1,p2,p3,v1,v2,x;
    if(ply>=qdepth)return ivalue;
    p1=p2=p3=lmp;
    bgen();
    while(p2!==lmp){
      v1=w16(-M[p2++]);
      if(v1!==value&&v1>=w16(ivalue-50)){
        x=M[p2];
        M[p3++]=(Math.trunc(-M[PV+M[BOARD+(x>>8)]]/100)<<8)|Math.trunc(M[PV+M[BOARD+(x&255)]]/100);
        M[p3++]=x;
      }
      p2++;
    }
    if(p3===p1){
      lmp=p1;
      return value;
    }
    ply++;
    qsort(p1,p3);
    lmp=p3;
    p2=p1;
    v1=value;
    while(p2!==lmp){
      p2++;
      bmove(M[p2]);
      if(wattack(bkpos))v2=wquies(v1);
      else v2=-3000;
      if(v2>v1)v1=v2;
      bremove();
      if(v1>=ab)break;
      p2++;
    }
    ply--;
    lmp=p1;
    return v1;
  }

  /* ---- io.c */
  function* getchar(){
    for(;;){
      if(ipos<ibuf.length)return ibuf.charCodeAt(ipos++)&255;
      var l=I?(I.length?I.shift():null):yield READ;
      if(l===P.INT){intrp=0;continue}
      if(l===null){
        if(intrp){intrp=0;continue}
        return 0;
      }
      ibuf=l+'\n';ipos=0;
    }
  }
  function* rline(){
    var p=SBUF*2,c;
    while((c=yield* getchar())!==10){
      if(c<=0)onhup();
      if(p>=TOP*2)throw new Fault('Memory fault');
      B8[p++]=c;
    }
    if(p>=TOP*2)throw new Fault('Memory fault');
    B8[p]=0;
  }
  function pboard(){
    var c=0,i=0,x=8,y,p;
    while(x--){
      putchar(String(!mantom||mfmt?1+x:8-x));
      putchar(' ');
      c++;
      y=8;
      while(y--){
        c++;
        putchar(' ');
        p=M[BOARD+i++];
        if(p)putchar('kqrbnp PNBRQK'.charAt(p+6)||'?');
        else putchar(c&1?'*':'-');
      }
      putchar('\n');
      if(intrp)return;
    }
    if(mfmt)printf('\n   a b c d e f g h');
    else printf('\n   q q q q k k k k\n   r n b     b n r');
    printf('\n');
  }
  function out1(m){
    printf(moveno+'. ');
    if(mantom)printf('... ');
    out(m);
    putchar('\n');
  }
  function algco(p){
    putchar('abcdefgh'.charAt(p%8)||'?');
    putchar(String.fromCharCode(56-Math.trunc(p/8)));
  }
  function stdp(p){
    if(p<0)p=-p;
    putchar('ppnbrqk'.charAt(p)||'?');
  }
  function stdb(b){
    var r=Math.trunc(b/8),f=b%8;
    if(f<4)putchar('q');
    else{putchar('k');f=7-f}
    if(f>=0&&f<3)putchar('rnb'.charAt(f));
    putchar(String.fromCharCode(mantom?r+49:56-r));
  }
  function out(m){
    var from=m>>8,to=m&255,epf=0,pmf=0,ed=false;
    if(mfmt){algco(from);algco(to);return}
    if(mantom)bmove(m);else wmove(m);
    switch(M[amp-1]){
    case 0:case 1:
      stdp(M[BOARD+to]);
      ed=true;
      break;
    case 3:
      putchar('o');putchar('-');
      /* falls through */
    case 2:
      putchar('o');putchar('-');putchar('o');
      break;
    case 4:
      epf=1;putchar('p');ed=true;
      break;
    case 5:
      pmf=1;putchar('p');ed=true;
      break;
    }
    if(ed){
      putchar('/');
      stdb(from);
      if(M[amp-2]){
        putchar('x');
        stdp(M[amp-2]);
        putchar('/');
      }else putchar('-');
      stdb(to);
    }
    if(pmf){putchar('(');putchar('q');putchar(')')}
    if(epf){putchar('e');putchar('p')}
    if(check())putchar('+');
    if(mantom)bremove();else wremove();
  }
  function score1(m){
    if(intrp)return;
    if(!mantom){
      if(moveno<10)putchar(' ');
      else putchar(String.fromCharCode(Math.trunc(moveno/10)+48));
      putchar(String.fromCharCode(moveno%10+48));
      putchar('.');
      putchar(' ');
    }else while(column<20)putchar(' ');
    out(m);
    if(mantom)putchar('\n');
  }
  function score(){
    var p=amp;
    putchar('\n');
    while(M[amp-1]!==-1){
      if(mantom)wremove();else bremove();
      decrem();
    }
    posit(score1,p);
    putchar('\n');
  }

  /* ---- stdin.c */
  function ch(){return B8[sbufp]}
  function comp(p,v){return p<0?1:(p===Math.abs(v)?1:0)}
  function pcomp(p,l,pp,sp,rp,fp){
    var f=l%8,r=Math.trunc(l/8),s;
    if(!mantom)r=7-r;
    if(f>3){f=7-f;s=1}else s=0;
    return comp(pp,p)&&comp(sp,s)&&comp(rp,r)&&comp(fp,f)?1:0;
  }
  function stdbin(v){ /* v: {s,r,f} */
    var c;
    for(;;){
      c=B8[sbufp++];
      if(c===113||c===107){ /* q k */
        v.s=c===113?0:1;
        stdbin(v);
        if(v.f<0)v.f=3;
        return;
      }
      if(c===114){v.f=0;continue}
      if(c===110){v.f=1;continue}
      if(c===98){v.f=2;continue}
      if(c>48&&c<57)v.r=c-49;
      else sbufp--;
      return;
    }
  }
  function stdpin(v){ /* v: {p,s,r,f} */
    var c=B8[sbufp++],pie=false;
    if(c===113){v.s=0;stdpin(v);return}
    if(c===107){v.s=1;stdpin(v);return}
    if(c===112){
      v.p=1;
      if(v.s>=0)v.f=3;
    }
    else if(c===110){v.p=2;pie=true}
    else if(c===98){v.p=3;pie=true}
    else if(c===114){v.p=4;pie=true}
    else sbufp--;
    if(pie&&ch()===112){
      v.f=(v.p-1)%3;
      v.p=1;
      sbufp++;
    }
    if(v.p<0&&v.s>=0){
      v.p=v.s+5;
      v.s=-1;
    }
    if(ch()===47){
      sbufp++;
      stdbin(v);
    }
  }
  function stdin(){
    var a={p:-1,s:-1,r:-1,f:-1},b={p:-1,s:-1,r:-1,f:-1},ckf=0,c,m,p1,p2,to,amb,piece,go=false;
    if(match('o-o-o')||match('ooo')){
      a.p=6;a.f=3;a.s=1;b.f=2;b.s=0;
      go=true;
    }else if(match('o-o')||match('oo')){
      a.p=6;a.f=3;b.f=1;
      go=true;
    }
    if(!go){
      stdpin(a);
      c=B8[sbufp++];
      if(c===42||c===120)stdpin(b);
      else if(c===45)stdbin(b);
      else sbufp--;
    }
    c=B8[sbufp++];
    if(c===43){
      ckf=1;
      c=B8[sbufp++];
    }
    if(c!==0)return 0;
    p1=p2=lmp;
    if(mantom)bagen();else wagen();
    m=-1;
    amb=0;
    while(p1!==lmp){
      p1++;
      piece=M[BOARD+(M[p1]>>8)];
      if(mantom)bmove(M[p1]);else wmove(M[p1]);
      to=M[amp-3];
      if(pcomp(piece,M[amp-4],a.p,a.s,a.r,a.f))
      if(pcomp(M[amp-2],to,b.p,b.s,b.r,b.f))
      if(comp(ckf,check())){
        if(m>=0&&!amb){
          printf('ambiguous\n');
          amb=1;
        }
        m=M[p1];
      }
      p1++;
      if(mantom)bremove();else wremove();
    }
    lmp=p2;
    if(amb)return -1;
    return m;
  }

  /* ---- savres.c */
  function save(){
    var i=amp-AMBUF,j,o=[clk0,clk1,bookp,moveno,game,i,mantom,value,ivalue,depth,flag,eppos,bkpos,wkpos];
    for(j=0;j<64;j++)o.push(M[BOARD+j]);
    for(j=0;j<i;j++)o.push(M[AMBUF+j]);
    if(!P.writeFile(SAVED,[o.join(' ')]))printf('cannot create file\n');
  }
  function restore(){ /* what the C read straight into its memory is checked first, since anything can be in a file */
    var n=P.find(SAVED),o=n&&n.type!=='d'&&!n.prot?P.text(n).join(' ').trim().split(/\s+/).map(Number):null,i,j,ok;
    ok=o&&o.length>=78&&o.every(function(x){return Number.isInteger(x)&&x>=-32768&&x<=32767});
    if(ok){
      i=o[5];
      ok=o[2]===0&&i>=1&&i<=1200&&o.length===78+i&&o[3]>0&&o[9]>=1&&o[9]<=3&&(o[6]===0||o[6]===1)&&o[12]>=0&&o[12]<64&&o[13]>=0&&o[13]<64;
      for(j=0;ok&&j<64;j++)ok=Math.abs(o[14+j])<=6;
      if(ok&&o[78]!==-1)ok=false;
      /* the history must be whole seven-word records with a type in range, or taking one back would run wild */
      if(ok&&(i-1)%7)ok=false;
      for(j=7;ok&&j<i;j+=7)ok=o[78+j]>=0&&o[78+j]<=5&&o[78+j-3]>=0&&o[78+j-3]<64&&o[78+j-2]>=0&&o[78+j-2]<64;
    }
    if(!ok){printf('cannot open file\n');return}
    clk0=o[0];clk1=o[1];bookp=o[2];moveno=o[3];game=o[4];amp=AMBUF+i;mantom=o[6];value=o[7];ivalue=o[8];depth=o[9];flag=o[10];eppos=o[11];bkpos=o[12];wkpos=o[13];
    for(j=0;j<64;j++)M[BOARD+j]=o[14+j];
    for(j=0;j<i;j++)M[AMBUF+j]=o[78+j];
  }

  /* ---- setup.c */
  function* setup(){
    var bd=new Int8Array(64),p=0,ip,i,err=0,nkng=101,c,wkp=0,bkp=0,row;
    for(i=0;i<8;i++){
      ip=p+8;
      row=true;
      while(row){
        c=yield* getchar();
        switch(String.fromCharCode(c)){
        case 'K':nkng-=100;c=6;bkp=p;break;
        case 'k':nkng--;c=-6;wkp=p;break;
        case 'P':c=1;break;
        case 'p':c=-1;break;
        case 'N':c=2;break;
        case 'n':c=-2;break;
        case 'B':c=3;break;
        case 'b':c=-3;break;
        case 'R':c=4;break;
        case 'r':c=-4;break;
        case 'Q':c=5;break;
        case 'q':c=-5;break;
        case '1':case '2':case '3':case '4':case '5':case '6':case '7':case '8':
          p+=c-48;
          continue;
        case ' ':
          p++;
          continue;
        case '\n':
          if(p>ip)err++;
          p=ip;
          row=false;
          continue;
        default:
          err++;
          if(c<=0)onhup();
          continue;
        }
        if(p<ip)bd[p++]=c;
      }
    }
    if(nkng)err++;
    if(err){
      printf('Illegal setup\n');
      return;
    }
    for(i=0;i<64;i++)M[BOARD+i]=bd[i];
    amp=AMBUF+1;
    lmp=LMBUF+1;
    eppos=64;
    bookp=0;
    mantom=0;
    moveno=1;
    wkpos=wkp;
    bkpos=bkp;
    flag=0;
    if(wkpos===60){
      if(M[BOARD+56]===-4)flag|=2;
      if(M[BOARD+63]===-4)flag|=1;
    }
    if(bkpos===4){
      if(M[BOARD+0]===4)flag|=0o20;
      if(M[BOARD+7]===4)flag|=0o10;
    }
    printf('Setup successful\n');
  }

  /* ---- play.c */
  function match(s){
    var p=sbufp,i;
    for(i=0;i<s.length;i++)if(B8[p++]!==s.charCodeAt(i))return 0;
    sbufp=p;
    return 1;
  }
  function cooin(){
    var a=B8[sbufp],b;
    if(a<97||a>104)return 0;
    b=B8[sbufp+1];
    if(b<49||b>56)return 0;
    sbufp+=2;
    return (a-97)+8*(56-b);
  }
  function algin(){
    var from=cooin(),to=cooin();
    if(ch()!==0)return 0;
    return (from<<8)|to;
  }
  function* xplay(){
    var a;
    stage();
    abmove=0;
    a=mantom?yield* bplay():yield* wplay();
    ivalue=a;
    return a;
  }
  function done(){
    var p;
    if(rept()>3){
      printf('Draw by repetition\n');
      onhup();
    }
    p=lmp;
    if(mantom)bagen();else wagen();
    if(p===lmp){
      if(check())printf(mantom?'White wins\n':'Black wins\n');
      else printf('Stale mate\n');
      onhup();
    }
    return p;
  }
  function makmov(m){
    out1(m);
    if(mantom)bmove(m);else wmove(m);
    increm();
  }
  var FIRST=-32769; /* manual's way of saying what play(1) did: it never came back */
  function* manual(){
    var a;
    for(;;){
      intrp=0;
      stage();
      yield* rline();
      sbufp=SBUF*2;
      if(match('save')){save();continue}
      if(match('test')){testf=testf?0:1;continue}
      if(match('remove')){
        if(M[amp-1]!==-1){
          decrem();
          if(mantom)bremove();else wremove();
        }
        if(M[amp-1]!==-1){
          decrem();
          if(mantom)bremove();else wremove();
        }
        continue;
      }
      if(match('exit'))exit();
      if(match('manual')){manflg=manflg?0:1;continue}
      if(match('resign'))onhup();
      if(moveno===1&&mantom===0){
        if(match('first'))return FIRST;
        if(match('alg')){mfmt=1;continue}
        if(match('restore')){restore();continue}
      }
      if(match('clock')){
        if(mantom)clk1=w16(clk1+clock());else clk0=w16(clk0+clock());
        ctime('white',clk0);
        ctime('black',clk1);
        continue;
      }
      if(match('score')){score();continue}
      if(match('setup')){yield* setup();continue}
      if(match('hint')){
        a=yield* xplay();
        out(abmove);
        printf(' '+a+'\n');
        continue;
      }
      if(match('repeat')){
        if(M[amp-1]!==-1){
          a=amp;
          if(mantom)wremove();else bremove();
          decrem();
          posit(out1,a);
        }
        continue;
      }
      if(ch()===0){pboard();continue}
      if((a=algin())!==0){mfmt=1;return a}
      if((a=stdin())!==0){mfmt=0;return a}
      printf('eh?\n');
    }
  }
  function* move(){
    var a,p,p1;
    for(;;){
      lmp=done();
      a=yield* manual();
      if(a===FIRST)return true;
      p=done();
      p1=p;
      while(p1!==lmp){
        p1++;
        if(M[p1++]===a){
          lmp=p;
          makmov(a);
          return false;
        }
      }
      printf('Illegal move\n');
      lmp=p;
    }
  }
  function* play(){
    var t,i;
    clock();
    for(;;){
      intrp=0;
      if(yield* move())clock(); /* first: play(1), which starts here */
      if(manflg)continue;
      i=mantom;
      t=i?clk1:clk0;
      if(!(yield* mate(mdepth,1)))yield* xplay();
      if(intrp){
        decrem();
        if(mantom)bremove();else wremove();
        continue;
      }
      if(!abmove){
        printf('Resign\n');
        onhup();
      }
      makmov(abmove);
      i=i?clk1:clk0;
      t=w16(i-t);
      /* a dividend by a zero move number is left as the sign, as the 11's div did */
      if((moveno?Math.trunc(i/moveno):(i<0?-1:0))>150)continue;
      if(depth===1&&t<60)depth++;
      else if(game===3&&t<60&&depth===2)depth++;
    }
  }
  function* main(){
    var i;
    printf('Chess\n');
    lmp=LMBUF;
    amp=AMBUF;
    M[amp++]=-1;
    M[lmp++]=-1;
    for(i=63;i>=0;i--)M[DIR+i]=(M[EDGE+Math.trunc(i/8)]<<6)|M[EDGE+i%8];
    yield* play();
  }

  /* ---- the driver: runs the generators a slice at a time, and asks the page for lines. Every step is
     queued to run whatever happens, so a ^C does not end the program as it would most. One step is
     not: if a ^C comes while the page has the floor, the engine skips it, and that is the interrupt. */
  var g=main(),resume,awayFrom=null;
  function end(msg){
    if(sobuf&&!msg)flush(); /* a core dump took stdio's buffer with it */
    if(line){P.typeLine(line);line=''}
    if(msg)P.typeLine(msg+(P.profile.csh?' (core dumped)':' - core dumped'),'err');
    else P.status(0);
  }
  function pump(){
    var start=Date.now(),r,budget=typeof document!=='undefined'&&document.hidden?500:SLICE;
    if(awayFrom!==null){idle+=start-awayFrom;awayFrom=null}
    try{
      for(;;){
        r=g.next(resume);
        resume=undefined;
        if(r.done){end();return}
        if(r.value===READ){read();return}
        if(Date.now()-start>=budget)break;
      }
    }catch(e){
      if(e===EXIT){end();return}
      if(e instanceof Fault){end(e.msg);return}
      throw e;
    }
    awayFrom=Date.now();
    var still=false;
    P.queue(function(){return P.sleep(0)},true);
    P.queue(function(){still=true});
    P.queue(function(){if(!still)intrp++;pump()},true);
  }
  function read(){
    var got,prompt=line;
    line='';
    P.queue(function(){return P.readLine(prompt,true).then(function(l){got=l})},true);
    P.queue(function(){resume=got;pump()},true);
  }
  P.queue(pump,true);
}});
})(window.Phosphor);
