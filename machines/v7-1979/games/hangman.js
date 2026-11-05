/* PHOSPHOR-9 terminal: machine "v7-1979", hangman. Ported to JavaScript for this terminal from V7's
   usr/src/games/hangman.c; the word list is V7's usr/dict/words (dict.js). The source is under this notice:

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
var MAXERR=7,MINLEN=7;
function dictOf(name){ /* fopen and stat */
  if(name==='/usr/dict/words')return P.v7dict;
  var n=P.find(name);
  if(!n||n.type==='d'||n.prot)return null;
  return P.text(n).join('\n')+'\n';
}
P.command({names:['hangman'],run:function(a,raw,words){
  var dictfile=words.length<2?'/usr/dict/words':words[1].charAt(0)==='-'?'/crp/dict/web2':words[1];
  var D=dictOf(dictfile);
  if(D===null){P.typeLine('no dictionary','err');return}
  /* srand(tvec[1]+tvec[2]): tvec[2] is past the end of the C's array, so the low half of the clock is the part that counts.
     The binary on the V7 tape was linked with the Sixth Edition's rand(), checked under a simulator, so this uses that one */
  var x=Math.floor(Date.now()/1000)&0xffff,at=0;
  function rand(){x=(Math.imul(x,13077)+6925)&0o77777;return x}
  function space(c){return c===' '||c==='\n'||c==='\t'}
  function fscan(){ /* fscanf(dict,"%s\n",buf); null at the end of the file */
    while(at<D.length&&space(D.charAt(at)))at++;
    if(at>=D.length)return null;
    var s=at;
    while(at<D.length&&!space(D.charAt(at)))at++;
    var w=D.slice(s,at);
    while(at<D.length&&space(D.charAt(at)))at++;
    return w;
  }
  function fixed(x,n){return x.toFixed(n)}
  P.cprog(function*(io){
    var errors=0,count=0,alive,lost,word,alph,real;
    function getword(){
      for(;;){
        var w=fscan();
        if(w===null){at=0;continue}
        if(w.charAt(0)>'z'||w.charAt(0)<'a')continue;
        var b='',i=0,j;
        for(j=0;j<w.length;i++,j++){ /* the hyphen goes, and the character after it is taken as it stands */
          if(w.charAt(j)==='-')j++;
          b+=w.charAt(j);
        }
        if(b.length<MINLEN)continue;
        if(!/^[a-z]*$/.test(b))continue;
        if(count!==0)io.print('('+fixed(errors/count,2)+'/'+count+') ');
        real=b;
        word=b.replace(/./g,'.').split('');
        return;
      }
    }
    for(;;){
      alph={};
      at=Math.trunc(rand()/32768*D.length);
      fscan();
      getword();
      alive=MAXERR;lost=false;
      while(alive>0){
        var g='',i;
        for(i=97;i<123;i++)if(alph[i])g+=String.fromCharCode(i);
        io.print('guesses: '+g+' word: '+word.join('')+' errors: '+(MAXERR-alive)+'/'+MAXERR+'\n');
        for(;;){
          io.print('guess: ');
          var l=yield* io.gets();
          if(l===null){io.print('\n');return}
          var c=l.charAt(0);
          if(c===''||c<'a'||c>'z'){io.print('lower case\n');continue}
          if(alph[c.charCodeAt(0)]){io.print('you guessed that\n');continue}
          alph[c.charCodeAt(0)]=1;
          var ok=false;
          for(i=0;i<real.length;i++)if(real.charAt(i)===c){word[i]=c;ok=true}
          if(!ok){alive--;errors++;if(alive<=0)lost=true}
          else if(word.indexOf('.')<0){alive=0;lost=false}
          break;
        }
      }
      count++;
      if(lost){errors+=2;io.print('the answer was '+real+', you blew it\n')}
      else io.print('you win, the word is '+real+'\n');
    }
  });
}});
})(window.Phosphor);
