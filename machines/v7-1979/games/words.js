/* PHOSPHOR-9 terminal: machine "v7-1979", words, the anagram helper. Ported to JavaScript for this terminal from V7's
   shell script /usr/games/words and 2.11BSD's games/words/words1.c, which carries no notice; V7 shipped only the
   binary of words1. The word list is V7's usr/dict/words (dict.js). egrep and sed are done here directly. */
(function(P){
'use strict';
P.command({names:['words'],run:function(a,raw,words){
  var arg=words.length>1?words[1]:'';
  var cls;
  /* the program would be a syntax error to V7's egrep, and sed then has nothing to read */
  if(/-$/.test(arg)&&arg.length>1){P.typeLine('egrep: syntax error','err');return}
  try{cls=new RegExp('^[-'+arg.replace(/[\\\]]/g,'\\$&')+']*$')}catch(e){P.typeLine('egrep: syntax error','err');return}
  var limit={},i,c;
  for(i=0;i<arg.length;i++){c=arg.charAt(i);limit[c]=(limit[c]||0)+1}
  function ok(w){
    var seen={},j,x;
    for(j=0;j<w.length;j++){
      x=w.charAt(j);
      if(/[A-Za-z]/.test(x)&&limit[x]&&limit[x]<10&&(seen[x]=(seen[x]||0)+1)>limit[x])return false;
    }
    return true;
  }
  var L=[];
  P.v7dict.split('\n').forEach(function(w){
    if(!w||!cls.test(w)||!ok(w))return;
    var s=w.replace(/-/g,'');
    if(s)L.push(s);
  });
  P.say(L);
}});
})(window.Phosphor);
