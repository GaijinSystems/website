/* PHOSPHOR-9 terminal: machine "multics-1981", the qedx editor: a buffer of lines, edit mode and input mode
   (\f goes back to edit mode), addresses (numbers, $, ., +n, -n, /regular expressions/), and the requests a i c d p
   = s g v r w q x e. A QUIT leaves it suspended at the new command level, and start goes back into it.
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE.
   The requests and messages are those of the qedx Text Editor Users' Guide (CG40-01) and of qedx under the
   DPS8M simulator; the code is new. */
(function(P){
'use strict';
var M=P.multics,S=M.S,pending=null;
function E(m){this.msg=m}
function regex(src){ /* qedx's expressions: . * ^ $ and \c for a literal character */
  var o='',i=0;
  if(src.charAt(0)==='*')throw new E('Invalid use of * in regular expression.');
  for(;i<src.length;i++){
    var c=src.charAt(i);
    if(c==='\\'&&src.charAt(i+1)==='c'&&i+2<src.length){o+=src.charAt(i+2).replace(/[.*+?^${}()|[\]\\\/]/g,'\\$&');i+=2;continue}
    if(c==='^'&&i===0){o+='^';continue}
    if(c==='$'&&i===src.length-1){o+='$';continue}
    if(c==='.'){o+='.';continue}
    if(c==='*'){o+='*';continue}
    o+=c.replace(/[+?^${}()|[\]\\\/]/g,'\\$&');
  }
  try{return new RegExp(o)}catch(e){throw new E('Syntax error in regular expression.')}
}
function delim(s,i){ /* the text up to the next unescaped copy of the delimiter at s[i] */
  var d=s.charAt(i),j=i+1,t='';
  for(;j<s.length;j++){
    var c=s.charAt(j);
    if(c==='\\'&&s.charAt(j+1)==='c'&&j+2<s.length){t+=s.substr(j,3);j+=2;continue}
    if(c===d)return {t:t,end:j+1};
    t+=c;
  }
  return null;
}
function start(macro){
  var B={lines:[],cur:0,path:null,changed:false},last=null,input=null;
  function need(){if(!B.lines.length)throw new E('Buffer empty.')}
  function addr(s,i){ /* one address at s[i]: {n,i} or null */
    var n=null,m;
    function rel(base){
      for(;;){
        var c=s.charAt(i);
        if(c==='+'||c==='-'){var k=s.slice(i+1).match(/^\d*/)[0];base+=(c==='+'?1:-1)*(k?+k:1);i+=1+k.length;continue}
        if(/\d/.test(c)&&base!==null){m=s.slice(i).match(/^\d+/)[0];base+=+m;i+=m.length;continue}
        return base;
      }
    }
    var c=s.charAt(i);
    if(/\d/.test(c)){m=s.slice(i).match(/^\d+/)[0];n=+m;i+=m.length}
    else if(c==='$'){n=B.lines.length;i++}
    else if(c==='.'){n=B.cur;i++}
    else if(c==='/'){
      var r=delim(s,i);if(!r)throw new E('Syntax error in regular expression.');
      if(r.t==='')r.t=last;if(r.t===null)throw new E('// undefined in regular expression.');
      last=r.t;var re=regex(r.t);need();
      n=null;
      for(var k=1;k<=B.lines.length;k++){var x=(B.cur+k-1)%B.lines.length+1;if(re.test(B.lines[x-1])){n=x;break}}
      if(n===null)throw new E('Search failed.');
      i=r.end;
    }
    else if(c==='+'||c==='-')n=B.cur;
    else return null;
    n=rel(n);
    return {n:n,i:i};
  }
  function check(n){
    need();
    if(n<0)throw new E('Address out of buffer (negative address).');
    if(n>B.lines.length)throw new E('Address out of buffer (too big).');
    if(n===0)throw new E('Address out of buffer.');
    return n;
  }
  function print(a,b){for(var k=a;k<=b;k++)M.out(M.tabs(B.lines[k-1]));B.cur=b}
  function sub(a,b,s,i,quiet){ /* s/old/new/: every match on each line */
    var d=s.charAt(i);if(!d)throw new E('Syntax error in substitute request.');
    var r1=delim(s,i);if(!r1)throw new E('Syntax error in substitute request.');
    var r2=delim(s,r1.end-1);if(!r2)throw new E('Syntax error in substitute request.');
    var pat=r1.t===''?last:r1.t;if(pat===null)throw new E('// undefined in regular expression.');
    last=pat;
    var re=new RegExp(regex(pat).source,'g'),rep=r2.t,hit=false;
    for(var k=a;k<=b;k++){
      var L=B.lines[k-1],n=L.replace(re,function(m){
        hit=true;
        return rep.replace(/\\c(.)|&/g,function(x,lit){return lit!==undefined?lit:m});
      });
      if(n!==L){B.lines[k-1]=n;B.cur=k;B.changed=true}
    }
    if(!hit)throw new E('Substitution failed.');
    var rest=s.slice(r2.end);
    if(/^p/.test(rest)&&!quiet)print(B.cur,B.cur);
    return r2.end;
  }
  function inputMode(at,first){ /* lines go in after line at until \f; first is what came after the request */
    var got=[];
    function add(l){
      var k=l.indexOf('\\f');
      if(k>=0){if(k>0)got.push(l.slice(0,k));finish();return true}
      got.push(l.replace(/\\c(.)/g,'$1'));return false;
    }
    function finish(){
      B.lines.splice.apply(B.lines,[at,0].concat(got));
      if(got.length){B.cur=at+got.length;B.changed=true}
      input=null;
    }
    if(first&&add(first))return;
    input=add;
  }
  function one(s){ /* a line of requests in edit mode */
    var i=0;
    while(i<s.length){
      while(s.charAt(i)===' ')i++;
      if(i>=s.length)return;
      var a1=addr(s,i),a,b,two=false;
      if(a1){i=a1.i;a=b=a1.n;if(s.charAt(i)===','){var a2=addr(s,i+1);if(!a2)throw new E('Address syntax error:');i=a2.i;b=a2.n;two=true}}
      var r=s.charAt(i),def=a1===null;
      if(!def&&b<a)throw new E('Address wrap-around.');
      i++;
      switch(r){
        case '':case '\n':
          check(a);check(b);print(b,b);return;
        case 'p':if(def){need();a=b=B.cur}check(a);check(b);print(a,b);break;
        case '=':M.out(String(def?B.cur:b));break;
        case 'd':if(def){need();a=b=B.cur}check(a);check(b);B.lines.splice(a-1,b-a+1);B.cur=Math.min(a,B.lines.length)||(a>1?a-1:0);if(a>B.lines.length)B.cur=B.lines.length;B.changed=true;break;
        case 'a':if(!def&&b!==0)check(b);inputMode(def?B.cur:b,s.slice(i));return;
        case 'i':var at=def?B.cur:b;if(!def&&at!==0)check(at);inputMode(Math.max(0,at-1),s.slice(i));return;
        case 'c':if(def){need();a=b=B.cur}check(a);check(b);B.lines.splice(a-1,b-a+1);B.cur=a-1;B.changed=true;inputMode(a-1,s.slice(i));return;
        case 's':if(def){need();a=b=B.cur}check(a);check(b);i=sub(a,b,s,i);if(s.charAt(i)==='p')i++;break;
        case 'g':case 'v':{
          if(def){need();a=1;b=B.lines.length}else{check(a);check(b)}
          var req=s.charAt(i);if(!/[pd=]/.test(req))throw new E('Syntax error in global request.'); /* gp/re/: the request, then the expression */
          var r3=delim(s,i+1);if(!r3||!s.charAt(i+1))throw new E('Syntax error in global request.');
          var pat=r3.t===''?last:r3.t;if(pat===null)throw new E('// undefined in regular expression.');last=pat;var re=regex(pat),keep=[];
          for(var k=a;k<=b;k++)if(re.test(B.lines[k-1])===(r==='g'))keep.push(k);
          if(req==='p')keep.forEach(function(k){print(k,k)});
          else if(req==='=')keep.forEach(function(k){M.out(String(k))});
          else if(req==='d'){keep.reverse().forEach(function(k){B.lines.splice(k-1,1)});B.cur=Math.min(B.cur,B.lines.length);if(keep.length)B.changed=true}
          return;
        }
        case 'r':{
          var pr=s.slice(i).trim();if(!pr)throw new E('No pathname given.');
          var rr=M.path(pr);
          if(rr.err)throw new E('qedx: '+rr.err+' '+rr.shown);
          if(!rr.n)throw new E('qedx: Entry not found. '+rr.shown);
          if(rr.n.type==='d')throw new E('qedx: This operation is not allowed for a directory. '+rr.shown);
          if(!M.can(rr.n,'r'))throw new E('qedx: Incorrect access on entry. '+rr.shown);
          var T=rr.n.bin?M.garble(rr.n,8):P.text(rr.n),at2=def?B.lines.length:b;
          B.lines.splice.apply(B.lines,[at2,0].concat(T));B.cur=at2+T.length;
          if(B.path===null)B.path=M.mp(P.pathOf(rr.n));
          M.charge(1+T.length/50);
          return;
        }
        case 'w':{
          var pw=s.slice(i).trim()||B.path;
          if(!pw)throw new E('No pathname given.');
          if(!B.lines.length&&!s.slice(i).trim())throw new E('Buffer empty.');
          var rw=M.path(pw);
          if(rw.err)throw new E('qedx: '+rw.err+' '+rw.shown);
          var L=def?B.lines:(check(a),check(b),B.lines.slice(a-1,b));
          var res=M.write(rw.abs,L);
          if(res!==true)throw new E('qedx: '+res+' '+rw.shown);
          if(B.path===null||s.slice(i).trim())B.path=M.mp(rw.abs);
          if(def)B.changed=false;
          M.charge(1+L.length/50);
          return;
        }
        case 'q':
          if(!def||s.slice(i).trim())throw new E('Syntax error in quit request.');
          throw 'quit';
        case 'x':M.out(String(B.lines.length).padStart(6)+' ->     (0)'+(B.path?' '+B.path:''));break;
        case 'e':M.line(s.slice(i).replace(/^\s/,''));return;
        case 'n':break;
        case 'b':case 'm':throw new E('qedx: The '+r+' request is not available in this qedx.');
        default:throw new E('qedx: '+r+' not recognized as a request.');
      }
    }
  }
  function loop(){
    P.ask('',function(l){
      if(l===null)l='q';
      if(l===P.INT){ /* QUIT: the buffer waits at the new command level */
        S.level++;S.quit=true;pending={resume:function(){loop()}};
        return;
      }
      l=M.edit(String(l));
      if(input){input(l);loop();return}
      try{one(l)}
      catch(e){
        if(e==='quit'){pending=null;return}
        if(e instanceof E){M.err(e.msg)}else throw e;
      }
      loop();
    },true);
  }
  if(macro){ /* qedx path: the requests in path.qedx, then on at the keyboard */
    var r=M.path(/\.qedx$/.test(macro)?macro:macro+'.qedx');
    if(r.err||!r.n){M.err('qedx: Entry not found. '+(r.shown||macro));return}
    try{P.text(r.n).forEach(function(l){if(input)input(l);else one(l)})}
    catch(e){if(e==='quit')return;if(e instanceof E)M.err(e.msg);else throw e}
  }
  loop();
}
Phosphor.setup(function(){ /* taken up with the rest of the machine */
M.cmd(['qedx','qx'],function(a){
  if(pending&&S.level>1){
    M.query('qedx: Pending work in previous invocation will be lost if you proceed;\ndo you wish to proceed?',function(y,l){
      M.quitHere(l);
      if(y){pending=null;start(a[0])}
      else{var p=pending;S.level--;p.resume()}
    });
    return;
  }
  start(a[0]);
});
});
M.resume=function(){ /* start: back into a suspended qedx, if that is what was left */
  if(pending){var p=pending;pending=null;p.resume();return true}
  return false;
};
M.drop=function(){pending=null};
})(window.Phosphor);
