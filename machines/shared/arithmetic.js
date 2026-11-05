/* PHOSPHOR-9 terminal: the game arithmetic, on V7 and 4.3BSD. Ported to JavaScript for this
   terminal from V7's usr/src/games/arithmetic.c and 4.3BSD's revision of it, which differs only in
   its random numbers. The 4.3BSD file carries no notice. The V7 source is under this notice:

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
var MAX=100;
P.command({names:['arithmetic'],run:function(a,raw,words){
  var v7=P.machine==='v7',argv=words.slice(1),types=[],left=[],right=[],rights=0,wrongs=0,range=11,dif=0,stvec,etvec,i,j,l=0,k=0,ans;
  function getnum(s){var m=/^[0-9]*/.exec(s);return m[0]?parseInt(m[0],10):0}
  function now(){return Math.floor(Date.now()/1000)}
  argv.forEach(function(x){
    if(/^[-+x\/]/.test(x)){while(dif<x.length){types[dif]=x.charAt(dif);dif++}}
    else range=getnum(x)+1;
  });
  if(range>MAX){P.say(['Range is too large.']);return}
  if(dif===0){types=['+','-'];dif=2}
  for(i=0;i<range;i++)left[i]=right[i]=i;
  stvec=now();
  /* the two machines' random numbers, down to the 16-bit ints */
  var seed=v7?stvec&0xffff:(stvec&0o77774)|1;
  function rand(){
    if(v7){seed=(Math.imul(seed,1103515245)+12345)|0;return (seed>>16)&0o77777}
    seed=(seed*3125)&0o77777;return seed>>2;
  }
  function hmul(x,y){return (x*y)>>16}
  function random(n){return v7?rand()%n:hmul(rand(),8*n)}
  function skrand(n){
    var t;
    if(v7){t=random(n)+random(n);if(t>n-1)t=2*n-1-t;return t}
    t=rand()+rand();if(t>0o17777)t=0o40000-t;return hmul(t,8*n);
  }
  function score(){
    etvec=now();
    P.say(['','','Rights '+rights+'; Wrongs '+wrongs+'; Score '+Math.trunc(rights*100/(rights+wrongs))+'%']);
    if(rights===0)return;
    P.say(['Total time '+(etvec-stvec)+' seconds; '+((etvec-stvec)/rights).toFixed(1)+' seconds per problem','','']);
    P.queue(function(){return P.sleep(3000)});
    P.queue(function(){stvec+=now()-etvec});
  }
  function quit(){
    if(rights+wrongs===0){P.say(['']);return}
    score();
  }
  /* a pipe runs dry where the keyboard waits; the C spins at the end of its input, this stops */
  var pipe=P.stdin()?P.stdin().slice():null;
  function read(prompt,then){
    if(pipe){
      if(prompt)P.say([prompt]);
      if(!pipe.length){quit();return}
      P.queue(function(){then(pipe.shift())});
      return;
    }
    P.ask(prompt,function(line){if(line===null||line===P.INT)quit();else then(line)},true);
  }
  function problem(){
    i=skrand(range);j=skrand(range);
    if(dif>1)l=random(dif);
    var t,q;
    switch(types[l]){
      case '-':t=left[i]+right[j];ans=left[i];q=t+' - '+right[j];break;
      case 'x':ans=left[i]*right[j];q=left[i]+' x '+right[j];break;
      case '/':
        if(!right.slice(0,range).some(function(x){return x!==0})){ /* the C spins here for ever, until interrupted */
          read('',function wait(){read('',wait)});
          return;
        }
        while(right[j]===0)j=random(range);
        t=left[i]*right[j]+random(right[j]);ans=left[i];q=t+' / '+right[j];break;
      default:ans=left[i]+right[j];q=left[i]+' + '+right[j];
    }
    read(q+' =   ',answer);
  }
  function answer(line){
    line=line.replace(/^ +/,'').replace(/ +$/,'');
    if(line===''){read('',answer);return}
    if(getnum(line)===ans){
      P.say(['Right!']);rights++;
      if(++k%20===0)score();
      P.queue(problem);
      return;
    }
    P.say(['What?']);wrongs++;
    if(range<MAX){left[range]=left[i];right[range++]=right[j]}
    read('',answer);
  }
  P.queue(problem);
}});
})(window.Phosphor);
