/* PHOSPHOR-9 terminal: bcd, the punched card, on V7 and 4.3BSD. Ported to JavaScript for this terminal
   from Sixth Edition's bcd.c, which 4.3BSD still shipped. V7's binary is taken to be the same program.
   The source is under this notice:

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
var chtab=[0,0o3004,0o2404,0o2040,0o2042,0o2104,0o1,0o3002,0o2201,0o2202,0o2102,0o5,0o2044,0o2,0o2041,0o14,0o4,0o10,0o20,0o40,0o100,0o200,0o400,0o1000,0o2000,0o4000,0o2200,0o2402,0o2401,0o2204,0o2400,0o3000,0o2100,0o11,0o21,0o41,0o101,0o201,0o401,0o1001,0o2001,0o4001,0o12,0o22,0o42,0o102,0o202,0o402,0o1002,0o2002,0o2002,0o24,0o44,0o104,0o204,0o404,0o1004,0o2004,0o4004,0o2020,0o3001,0o2101,0o6,0o2024];
function card(sp){
  var o='\n\n\n\n ________________________________________________\n/',i,j,l=sp.length;
  o+=sp.replace(/[a-z]/g,function(x){return x.toUpperCase()});
  for(i=49-l;--i>0;)o+=' ';
  o+='|\n';
  for(j=1;j<=12;j++){
    o+='|';
    for(i=0;i<48;i++){
      var c=i>=l?0:sp.charCodeAt(i)-0o40;
      if(c>=0o141-0o40)c-=0o40;
      if(c<0||c>137)c=0;
      o+=((chtab[c]||0)>>(j-1))&1?']':(j>3?String.fromCharCode(0x30+j-3):' '); /* the C overstrikes [ with ]; on glass the ] is what stays */
    }
    o+='|\n';
  }
  o+='|________________________________________________|\n\n\n\n\n';
  return o.slice(0,-1).split('\n');
}
P.command({names:['bcd'],run:function(a,raw,words){
  if(words.length>1){P.say(card(words[1]));return}
  var I=P.stdin(),prompt=P.machine==='v7'?'$ ':'% '; /* V7's binary asks with a $ */
  if(I){var L=card(I[0]||'');L[0]=prompt;P.say(L);return}
  P.ask(prompt,function(l){P.say(card(l||''))});
}});
})(window.Phosphor);
