/* PHOSPHOR-9 terminal: machine "bsd-1987", quiz. Ported to JavaScript for this terminal from 4.3BSD's
   games/quiz/quiz.c, 4.2 85/01/09, and its quiz.k files, which are here unchanged. That source carries no
   notice, only "quiz.c 4.2 85/01/09"; it is 98% the V7 program, whose source is under the Caldera text below.
   Some of the data files quote poems and the like, which belong to their authors.
   Differences: 4.3's seed is an int it never fills, stack garbage on a VAX; this uses the low half of the clock, V7's
   intent. It keeps line[] as the C does, but a long entry here does not run over into the variables after it.

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
 */
(function(P){
'use strict';
var K=null,INDEX="/usr/games/lib/quiz.k/state:state:cap{ital}:abbr{ev{iation}}:flower\n/usr/games/lib/quiz.k/america:America{n}:cap{ital}\n/usr/games/lib/quiz.k/europe:Europe{an}:cap{ital}\n/usr/games/lib/quiz.k/africa:Africa{n}:cap{ital}\n/usr/games/lib/quiz.k/pres:pres{ident}:term:succ{essor}\n/usr/games/lib/quiz.k/sov:sov{ereign}:cen{t{ury}}:succ{essor}\n/usr/games/lib/quiz.k/seq-easy:easy{-}{seq{uence}}:next:name\n/usr/games/lib/quiz.k/seq-hard:hard{-}{seq{uence}}:next:name\n/usr/games/lib/quiz.k/posneg:pos{itive}:neg{ative}\n/usr/games/lib/quiz.k/bard:Shakespeare{{-}line{s}}|line{s}:next:work:char{acter}\n/usr/games/lib/quiz.k/murders:victim:killer\n/usr/games/lib/quiz.k/collectives:ind{ividuals}:coll{ective}\n/usr/games/lib/quiz.k/trek:star:trek\n/usr/games/lib/quiz.k/babies:baby:adult\n/usr/games/lib/quiz.k/poetry:poem{-}line:next:poem:author\n/usr/games/lib/quiz.k/midearth:M[iddle{-}Earth|E]:cap{ital}\n/usr/games/lib/quiz.k/inca:inca:succ{essor}\n/usr/games/lib/quiz.k/morse:clear|alpha{bet{ic}}:morse\n/usr/games/lib/quiz.k/sexes:male:female\n/usr/games/lib/quiz.k/greek:greek:english\n/usr/games/lib/quiz.k/latin:latin:english\n/usr/games/lib/quiz.k/locomotive:locomotive:name\n/usr/games/lib/quiz.k/ucc:section:ucc\n/usr/games/lib/quiz.k/chinese:year:next\n/usr/games/lib/quiz.k/elements:symbol:number:weight:element\n/usr/games/lib/quiz.k/province:province:cap{ital}\n/usr/games/lib/quiz.k/asia:Asia{n}:cap{ital}\n/usr/games/lib/quiz.k/arith:arith{metic}:ans{wer}\n/usr/games/lib/quiz.k/areas:area{-code}:state{-region}:city\n/usr/games/lib/quiz.k/ed:function:ed-command\n"; /* the quiz.k files are in quizk.js; the index is this system's */
var PATH='/usr/games/lib/quiz.k/',NF=10,NL=300,NC=200,SL=100,NA=10,EXIT={};
function zero(n){var a=[];while(n--)a.push(0);return a}
/* what the glass shows of a line with overstrikes in it, and without the control characters it doesn't show */
function glass(s){
  if(s.indexOf('\b')<0)return s.replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g,'');
  var r=[],c=0;
  for(var i=0;i<s.length;i++){
    var ch=s.charAt(i);
    if(ch==='\b'){if(c>0)c--}
    else if(ch==='\t'){do{if(r[c]===undefined)r[c]=' ';c++}while(c%8)}
    else if(ch>=' '&&ch!=='\u007f')r[c++]=ch;
  }
  for(i=0;i<r.length;i++)if(r[i]===undefined)r[i]=' ';
  return r.join('');
}
P.command({names:['quiz'],run:function(a,raw,words){
  var o='',tflag=0,xx=zero(NL+1),score=zero(NL),rights=0,wrongs=0,guesses=0,input=null,ipos=0,nl=0,na=NA,inc,ptr=0,nc=0;
  var L=[],tmp=['','','','','','','','','',''],select=zero(NF),eu,ev,us,vs;
  function pr(s){
    o+=s;
    var i=o.lastIndexOf('\n');
    if(i>=0){P.say(o.slice(0,i).split('\n').map(glass));o=o.slice(i+1)}
  }
  function fopen(f){
    if(!K)K=Object.assign({index:INDEX},P.quizk);
    if(f.indexOf(PATH)===0&&P.has(K,f.slice(PATH.length)))return K[f.slice(PATH.length)];
    var n=P.find(f);
    if(!n||n.type==='d'||n.prot)return null;
    return P.text(n).join('\n')+'\n';
  }
  function open(f){input=fopen(f);ipos=0;return input!==null}
  function lineStr(){var e=L.indexOf('\0');return (e<0?L:L.slice(0,e)).join('')}
  function readline(){ /* the C leaves a line in line[], with its spaces squeezed; it counts what it read in nc */
    for(;;){
      var t=0,again=false;
      while(ipos<input.length){
        var c=input.charAt(ipos++);
        L[t]=c;
        nc++;
        if(c===' '&&(t===0||L[t-1]===' '))continue;
        if(c==='\n'){
          if(t>0&&L[t-1]==='\\'){t++;continue}
          while(t>0&&L[t-1]===' ')L[--t]='\n';
          L[++t]='\0';
          return 1;
        }
        if(t>=NC){
          pr('Too hard for me\n');
          for(;;){
            if(ipos>=input.length)return 0;
            if(input.charAt(ipos++)==='\n')break;
          }
          again=true;
          break;
        }
        t++;
      }
      if(!again){L[t]='ÿ';return 0}
    }
  }
  function U(i){return i<us.length?us.charCodeAt(i):0}
  function V(){return ev<vs.length?vs.charCodeAt(ev):0}
  function fold(c){return c<65||c>90?c:c|32}
  function eat(s,c){
    if(V()!==c)return 2;
    if(s===0){ev++;return 1}
    if(fold(U(eu))!==fold(c))return 0;
    eu++;ev++;
    return 1;
  }
  function string(s){
    var x;
    for(;;){
      switch(V()){
      case 0:case 124:case 93:case 125:return 1;
      case 92:
        ev++;
        if(V()===0)return 2;
        if(V()===10){ev++;continue}
        /* falls through */
      default:
        if(eat(s,V())===1)continue;
        return 0;
      case 91:
        ev++;
        x=disj(s);
        if(V()!==93||x>1)return 2;
        ev++;
        if(s===0)continue;
        if(x===0)return 0;
        continue;
      case 123:
        ev++;
        x=disj(s);
        if(V()!==125||x>1)return 2;
        ev++;
        continue;
      }
    }
  }
  function disj(s){
    var t=0,x,u=eu;
    for(;;){
      x=string(s);
      if(x>1)return x;
      switch(V()){
      case 0:case 93:case 125:return t|(x&s);
      case 124:ev++;t|=s;s=0;continue;
      }
      if(s)eu=u;
      if(string(0)>1)return 2;
      switch(V()){
      case 0:case 93:return 0;
      case 125:return 1;
      case 124:ev++;continue;
      default:return 2;
      }
    }
  }
  function cmp(u,v){
    us=u;vs=v;eu=0;ev=0;
    var x=disj(1);
    if(x!==1)return x;
    return eat(1,0);
  }
  function pub1(s){
    for(;;ev++){
      switch(V()){
      case 124:s=0;continue;
      case 93:case 125:case 0:return;
      case 91:case 123:ev++;pub1(s);continue;
      case 92:
        ev++;
        if(V()===10)continue;
        /* falls through */
      default:
        if(s)pr(String.fromCharCode(V()));
      }
    }
  }
  function publish(t){vs=t;ev=0;pub1(1)}
  function segment(u,w){
    var s=0,i,f,t;
    for(i=0;i<NF;i++){
      f=s;t='';
      while(s<u.length&&u.charAt(s)!==':'&&u.charAt(s)!=='\n'&&s-f<SL){
        if(u.charAt(s)==='\\'){
          if(u.charAt(s+1)==='\n'){s+=2;continue}
          t+=u.charAt(s++);
        }
        t+=u.charAt(s++);
      }
      while(s<u.length&&u.charAt(s)!==':'&&u.charAt(s)!=='\n')s++;
      w[i]=t;
      if(s>=u.length||u.charAt(s++)==='\n')return i+1;
    }
    pr('Too many facts about one thing\n');
    return i;
  }
  function badinfo(){pr('Bad info '+lineStr()+'\n')}
  function perm(u,m,v,n,p){
    for(var i=0;i<m;i++){
      var j,hit=false;
      for(j=0;j<n;j++){
        var x=cmp(u[i],v[j]);
        if(x>1)badinfo();
        if(x===0)continue;
        p[i]=j;hit=true;
        break;
      }
      if(!hit)return 0;
    }
    return 1;
  }
  function find(u,m){
    while(readline()){
      var n=segment(lineStr(),tmp);
      if(perm(u,m,tmp.slice(1),n-1,select))return 1;
    }
    return 0;
  }
  function readindex(){
    xx[0]=nc=0;
    while(readline()){
      xx[++nl]=nc;
      if(nl>=NL){
        pr("I've forgotten some of it;\n");
        pr('I remember '+nl+' items.\n');
        break;
      }
    }
  }
  function done(){
    pr('\nRights '+rights+', wrongs '+wrongs+', ');
    if(guesses)pr('extra guesses '+guesses+', ');
    if(rights+wrongs===0){ /* the C divides by zero here */
      if(o)P.say([glass(o)]);
      o='';
      P.typeLine('Floating exception (core dumped)','err');
      throw EXIT;
    }
    pr('score '+Math.trunc(100*rights/(rights+wrongs))+'%\n');
    throw EXIT;
  }
  function dunno(){pr("I don't know about that\n");throw EXIT}
  function instruct(info){
    pr('Subjects:\n\n');
    var i,n;
    while(readline()){
      pr('-');
      n=segment(lineStr(),tmp);
      for(i=1;i<n;i++){pr(' ');publish(tmp[i])}
      pr('\n');
    }
    pr('\n');
    open(info);
    readline();
    segment(lineStr(),tmp);
    pr('For example,\n');
    pr('    quiz ');publish(tmp[1]);
    pr(' ');publish(tmp[2]);
    pr('\nasks you a ');publish(tmp[1]);
    pr(' and you answer the ');publish(tmp[2]);
    pr('\n    quiz ');publish(tmp[2]);
    pr(' ');publish(tmp[1]);
    pr('\nworks the other way around\n');
    pr('\nType empty line to get correct answer.\n');
    throw EXIT;
  }
  function next(){
    inc=(inc*3125)&0o77777;
    ptr=(inc>>2)%na;
    var flag=0;
    while(score[ptr]>0)
      if(++ptr>=na){
        ptr=0;
        if(flag)done();
        flag=1;
      }
    return ptr;
  }
  function query(l){ /* returns the response squeezed, as query() leaves it */
    var t=[];
    for(var i=0;i<l.length;i++){
      var c=l.charAt(i);
      if(c===' '&&(t.length===0||t[t.length-1]===' '))continue;
      t.push(c);
    }
    while(t.length&&t[t.length-1]===' ')t.pop();
    return t.join('');
  }
  function* main(){
    var argv=words.slice(1),info=PATH+'index',i,j,x,z,count;
    /* 4.3 reads time() into a two-int array and uses the second one, which on a VAX it never fills:
       V7's intent was the low half of the clock, and that is what this uses */
    inc=(Math.floor(Date.now()/1000)&0o77774)|1;
    while(argv.length&&argv[0].charAt(0)==='-'){
      if(argv[0].charAt(1)==='i'){
        if(argv.length>1)info=argv[1];
        argv=argv.slice(2);
      }
      else if(argv[0].charAt(1)==='t'){tflag=1;argv=argv.slice(1)}
      else break;
    }
    if(!open(info)){pr('No info\n');throw EXIT}
    if(argv.length<=1)instruct(info);
    if(find(argv,argv.length)===0)dunno();
    if(!open(tmp[0]))dunno();
    readindex();
    if(!tflag||na>nl)na=nl;
    for(;;){
      i=next();
      z=xx[i+1]-xx[i];
      for(j=0;j<z;j++)L[j]=xx[i]+j<input.length?input.charAt(xx[i]+j):'\u00ff';
      segment(lineStr(),tmp);
      if(tmp[select[0]]===''||tmp[select[1]]===''){score[i]=1;continue}
      publish(tmp[select[0]]);
      pr('\n');
      for(count=0;;count++){
        var l=yield;
        if(l===P.INT||l===null)done();
        var r=query(l);
        if(r===''){
          publish(tmp[select[1]]);
          pr('\n');
          if(count===0)wrongs++;
          score[i]=tflag?-1:1;
          break;
        }
        x=cmp(r,tmp[select[1]]);
        if(x>1)badinfo();
        if(x===1){
          pr('Right!\n');
          if(count===0)rights++;
          if(++score[i]>=1&&na<nl)na++;
          break;
        }
        pr('What?\n');
        if(count===0)wrongs++;
        score[i]=tflag?-1:1;
      }
      guesses+=count;
    }
  }
  var G=main(),pipe=P.stdin();
  function step(v){
    var r;
    try{r=G.next(v)}
    catch(e){
      if(e!==EXIT)throw e;
      if(o)P.say([glass(o)]);
      return;
    }
    if(r.done)return;
    if(pipe){step(pipe.length?pipe.shift():null);return}
    var p=glass(o);o='';
    P.ask(p,step,true);
  }
  step();
}});
})(window.Phosphor);
