/* PHOSPHOR-9 terminal: the engine.
   Copyright (C) 2026 Gaijin Systems.

   This program is free software: you can redistribute it and/or modify it under the terms
   of the GNU Affero General Public License as published by the Free Software Foundation,
   either version 3 of the License, or (at your option) any later version. It is distributed
   WITHOUT ANY WARRANTY; see the LICENSE file for details.

   You should not need to edit this file. Your words go in site/, the imaginary computers in
   machines/, and commands in engine/commands/. index.html loads them in this order:

     engine/phosphor.js        this file: defines window.Phosphor
     engine/commands/*.js      Phosphor.command({...}) for each built-in command
     machines/machines.js      Phosphor.machines({...}): the machines that can be plugged in
     site/*.js                 Phosphor.content(`...`) text (wins over the machine)
     Phosphor.start()          loads the chosen machine's files, then boots the terminal
*/
(function(){
'use strict';

var HAS=Object.prototype.hasOwnProperty;
function has(o,k){return HAS.call(o,k)}
var LOGIN_NAME=/^[a-z][a-z0-9_]{0,7}$/i;
function lineOf(l){return Array.isArray(l)?l:[l,'']} /* a line is a string or [text,class,options] */
/* the patterns of ed and vi are basic regular expressions: \( \) group, and ( ) + ? | { are ordinary */
function bre(s){
  var o='',i=0,cls=false;
  for(;i<s.length;i++){
    var c=s.charAt(i);
    if(cls){o+=c==='\\'?'\\\\':c;if(c===']')cls=false;continue}
    if(c==='['){
      cls=true;o+=c;
      if(s.charAt(i+1)==='^'){o+='^';i++}
      if(s.charAt(i+1)===']'){o+='\\]';i++}
      continue;
    }
    if(c==='\\'&&i+1<s.length){
      var n=s.charAt(++i);
      o+=/[(){}]/.test(n)?n:'\\'+n;
      continue;
    }
    o+=/[()+?|{}]/.test(c)?'\\'+c:c;
  }
  return o;
}

/* A pattern that cannot freeze the page. grep's, ed's and vi's patterns become RegExps, whose backtracking takes 2^n steps on
   \(a*\)*b against a line of n a's; GNU grep's DFA and glibc's regexec take time in proportion to the line. SafeRe is the
   RegExp with its exec (and so test, replace and match) run by a backtracking matcher that never tries the same instruction at
   the same place twice (RE2's BitState): the same matches, the same leftmost alternative first and the same groups, in steps
   bounded by the pattern's size times the line's. A backreference makes the groups it names part of that place, checked first
   against the pattern with any text in its stead, and then given a budget: past it, exec says no and sets overflow, as
   regexec's REG_ESPACE does. One character repeated (a*, .{0,30000}, \(a\)\{9\}) is a single counted step, whatever its count.
   All the matching one command or key sets off has an allowance of steps as well. A pattern with no repetition or alternation, or with what it does not know (a lookaround of more
   than one character, an octal escape), is the RegExp's own */
var SAFE_BUDGET=5e5,SAFE_STEPS=1e7,SAFE_SET=3e5,SAFE_BURST=3e7,SAFE_GONE=64,SAFE_RUN=0,SAFE_TIME=2000,SAFE_MS=0,SAFE_SPENT=0,SAFE_BAIL={},SAFE_BIG={}; /* steps allowed: BUDGET with a backreference; STEPS without; SET past the table's 1.28e8 places; BURST in all for one command or key (SPENT: so far). TIME: milliseconds of matching in all for one command or key (MS: so far), whatever the steps cost. BIG: a program too large to build */
function reCanon(c){var u=String.fromCharCode(c).toUpperCase();if(u.length!==1)return c;var cu=u.charCodeAt(0);return c>=128&&cu<128?c:cu} /* the spec's Canonicalize, without the u flag */
function reLower(c){var l=String.fromCharCode(c).toLowerCase();return l.length===1?l.charCodeAt(0):c}
function reWord(c){return c>=48&&c<=57||c>=65&&c<=90||c===95||c>=97&&c<=122}
function reSpace(c){return c===9||c===10||c===11||c===12||c===13||c===32||c===0xa0||c===0x1680||c>=0x2000&&c<=0x200a||c===0x2028||c===0x2029||c===0x202f||c===0x205f||c===0x3000||c===0xfeff}
function reParse(src){ /* a RegExp's source (already valid) as a tree, or SAFE_BAIL thrown */
  var i=0,n=src.length,ng=0,gi=0,hard=false,wide=false,refs=[];
  for(var k=0,cl=false;k<n;k++){var ch=src.charAt(k);if(ch==='\\'){k++;continue}if(cl){if(ch===']')cl=false;continue}if(ch==='[')cl=true;else if(ch==='('&&src.charAt(k+1)!=='?')ng++}
  function bail(){throw SAFE_BAIL}
  function alt(){var L=[seq()];while(src.charAt(i)==='|'){i++;L.push(seq())}if(L.length>1)hard=true;return L.length>1?{t:'alt',L:L}:L[0]}
  function seq(){var L=[];while(i<n&&src.charAt(i)!=='|'&&src.charAt(i)!==')')L.push(term());return {t:'seq',L:L}}
  function term(){
    var a=atom(),c=src.charAt(i),q=null,m;
    if(c==='*')q=[0,Infinity];else if(c==='+')q=[1,Infinity];else if(c==='?')q=[0,1];
    else if(c==='{'&&(m=/^\{(\d+)(,(\d*))?\}/.exec(src.slice(i)))){q=[+m[1],m[2]?(m[3]===''?Infinity:+m[3]):+m[1]];i+=m[0].length-1}
    if(!q)return a;
    i++;
    if(a.t==='look')bail();
    var greedy=true;if(src.charAt(i)==='?'){greedy=false;i++}
    hard=true;return {t:'rep',e:a,min:q[0],max:q[1],greedy:greedy};
  }
  function atom(){
    var c=src.charAt(i++);
    if(c==='^')return {t:'bol'};
    if(c==='$')return {t:'eol'};
    if(c==='.')return {t:'any'};
    if(c==='[')return cls();
    if(c==='\\')return esc(false);
    if(c==='('){
      var e,look=null;
      if(src.charAt(i)==='?'){
        if(src.charAt(i+1)===':'){i+=2;e=alt();i++;return {t:'group',n:0,e:e}}
        look=/^\?(=|!|<=|<!)/.exec(src.slice(i));if(!look)bail();i+=look[0].length;
        e=alt();i++;
        var one=e.t==='seq'&&e.L.length===1&&/^(char|set|any)$/.test(e.L[0].t)?e.L[0]:e.t==='seq'&&!e.L.length?null:bail();
        return {t:'look',ahead:look[1].charAt(0)!=='<',neg:/!/.test(look[1]),m:one};
      }
      var g=++gi;e=alt();i++;return {t:'group',n:g,e:e};
    }
    return {t:'char',c:c.charCodeAt(0)};
  }
  function esc(inCls){
    var c=src.charAt(i++),m;
    if(/[dDwWsS]/.test(c)){var f=c.toLowerCase()==='d'?function(x){return x>=48&&x<=57}:c.toLowerCase()==='w'?reWord:reSpace;return {t:'set',f:c===c.toLowerCase()?f:function(x){return !f(x)}}}
    if(c==='b')return inCls?{t:'char',c:8}:{t:'wb',neg:false};
    if(c==='B'&&!inCls)return {t:'wb',neg:true};
    if(c==='0'&&!/\d/.test(src.charAt(i)))return {t:'char',c:0};
    if(/\d/.test(c)){
      if(inCls)bail();
      m=/^\d*/.exec(src.slice(i))[0];var r=+(c+m);if(c==='0'||r>ng)bail();i+=m.length;refs.push(r);hard=true;return {t:'ref',n:r};
    }
    var T={t:9,n:10,v:11,f:12,r:13};if(has(T,c))return {t:'char',c:T[c]};
    if(c==='x'&&(m=/^[0-9a-fA-F]{2}/.exec(src.slice(i)))){i+=2;return {t:'char',c:parseInt(m[0],16)}}
    if(c==='u'&&(m=/^[0-9a-fA-F]{4}/.exec(src.slice(i)))){i+=4;return {t:'char',c:parseInt(m[0],16)}}
    if(c==='c'){if(!/[A-Za-z]/.test(src.charAt(i)))bail();return {t:'char',c:src.charCodeAt(i++)%32}}
    return {t:'char',c:c.charCodeAt(0)};
  }
  function cls(){
    var neg=false,R=[],F=[];
    if(src.charAt(i)==='^'){neg=true;i++}
    function one(){var c=src.charAt(i++);if(c==='\\'){var e=esc(true);return e.t==='char'?{c:e.c}:{f:e.f}}return {c:c.charCodeAt(0)}}
    function add(x){if(x.f)F.push(x.f);else R.push([x.c,x.c])}
    while(i<n&&src.charAt(i)!==']'){
      var a=one();
      if(src.charAt(i)==='-'&&i+1<n&&src.charAt(i+1)!==']'){i++;var b=one();if(a.f||b.f){add(a);add({c:45});add(b)}else R.push([a.c,b.c]);if(R.length+F.length>1000)wide=true;continue}
      add(a);
      if(R.length+F.length>1000)wide=true; /* a class of thousands: each character tried against it would take its time, uncounted */
    }
    i++;
    return {t:'set',f:function(x){for(var k=0;k<R.length;k++)if(x>=R[k][0]&&x<=R[k][1])return true;for(k=0;k<F.length;k++)if(F[k](x))return true;return false},neg:neg};
  }
  var tree=alt();
  if(i<n)bail();
  if(wide&&hard)throw SAFE_BIG; /* with no repetition or alternation it is the RegExp's own, which goes straight through */
  return {tree:tree,ng:ng,hard:hard,refs:refs.filter(function(r,k){return refs.indexOf(r)===k})};
}
function reCompile(T,ic,pre){ /* the tree as a program; pre: each backreference as any text at all */
  var prog=[],act=[],nreg=0;
  var work=0;
  function emit(o){if(prog.length>=20000)throw SAFE_BIG;o.act=act.length?act.slice():null;prog.push(o);return prog.length-1} /* stopped as it grows: (a{1000}){1000} is never built */
  function pred(nd){
    var f=nd.t==='any'?function(x){return x!==10&&x!==13&&x!==0x2028&&x!==0x2029}:nd.t==='char'?(ic?function(x){return reCanon(x)===cc}:function(x){return x===nd.c}):nd.f,cc=ic?reCanon(nd.c):0;
    if(nd.t==='set'&&ic){var g=f;f=function(x){var u=reCanon(x);return g(x)||g(u)||g(reLower(x))||g(reLower(u))}}
    if(nd.neg){var h=f;return function(x){return !h(x)}}
    return f;
  }
  function groups(nd,L){if(nd.t==='group'&&nd.n)L.push(nd.n);if(nd.e)groups(nd.e,L);if(nd.L)nd.L.forEach(function(x){groups(x,L)});return L}
  function comp(nd){
    var k,j,J;
    if(++work>2e5)throw SAFE_BIG; /* (?:){99999999} emits nothing, but would still be gone through that often */
    switch(nd.t){
    case 'char':case 'set':case 'any':emit({op:0,f:pred(nd)});return;
    case 'bol':emit({op:1,f:function(s,p){return p===0}});return;
    case 'eol':emit({op:1,f:function(s,p){return p===s.length}});return;
    case 'wb':emit({op:1,f:function(s,p){var a=p>0&&reWord(s.charCodeAt(p-1)),b=p<s.length&&reWord(s.charCodeAt(p));return (a!==b)!==nd.neg}});return;
    case 'look':
      var lf=nd.m?pred(nd.m):null;
      emit({op:1,f:function(s,p){var q=nd.ahead?p:p-1,y=lf?q>=0&&q<s.length&&lf(s.charCodeAt(q)):true;return y!==nd.neg}});return;
    case 'group':
      if(!nd.n){comp(nd.e);return}
      emit({op:4,k:2*nd.n});comp(nd.e);emit({op:4,k:2*nd.n+1});return;
    case 'seq':nd.L.forEach(comp);return;
    case 'alt':
      J=[];
      for(k=0;k<nd.L.length-1;k++){var s=emit({op:2,x:0,y:0});prog[s].x=s+1;comp(nd.L[k]);J.push(emit({op:3,x:0}));prog[s].y=prog.length}
      comp(nd.L[k]);J.forEach(function(x){prog[x].x=prog.length});return;
    case 'ref':
      if(pre){var l0=emit({op:2,x:0,y:0});emit({op:0,f:function(){return true}});emit({op:3,x:l0});prog[l0].x=l0+1;prog[l0].y=prog.length;return}
      emit({op:6,n:nd.n});return;
    case 'rep':
      var grp=nd.e.t==='group'&&nd.e.e.t==='seq'&&nd.e.e.L.length===1,one=grp?nd.e.e.L[0]:nd.e,cg=grp?nd.e.n:0; /* (a){3}: the group is the last a */
      if(one.t==='char'||one.t==='set'||one.t==='any'){ /* a{30000}, .*: one character, counted: one instruction that takes the run, and one that gives it back a character at a time */
        var pf=pred(one);emit({op:10,f:pf,min:nd.min,max:nd.max,greedy:nd.greedy});emit({op:11,f:pf,min:nd.min,max:nd.max,greedy:nd.greedy,g:cg});return;
      }
      var G=groups(nd.e,[]),clr=function(){if(G.length)emit({op:5,g:G})};
      for(k=0;k<nd.min;k++){clr();comp(nd.e)}
      var opt=function(){var r=nreg++;emit({op:8,r:r});act.push(r);clr();comp(nd.e);emit({op:9,r:r});act.pop()}; /* past its minimum, an iteration that matched nothing fails (RepeatMatcher) */
      if(nd.max===Infinity){var L0=emit({op:2,x:0,y:0});opt();emit({op:3,x:L0});prog[L0].x=nd.greedy?L0+1:prog.length;prog[L0].y=nd.greedy?prog.length:L0+1;return}
      J=[];
      for(k=nd.min;k<nd.max;k++){J.push(emit({op:2,x:0,y:0}));opt()}
      J.forEach(function(x){prog[x].x=nd.greedy?x+1:prog.length;prog[x].y=nd.greedy?prog.length:x+1});return;
    }
  }
  comp(T.tree);emit({op:7});
  prog.nreg=nreg;prog.deep=prog.reduce(function(d,o){return Math.max(d,o.act?o.act.length:0)},0);
  return prog;
}
function reRun(prog,ng,refs,ic,s,from,sticky,budget){ /* the leftmost match from from on: its group bounds, null, or false past the budget */
  var n=s.length,W=n+1,m=prog.length,D=prog.deep+1,big=m*W*D>1.28e8,need=(m*W*D>>3)+1,seen,touched=null,steps=0,t0=Date.now();
  if(SAFE_MS>SAFE_TIME)return false;
  if(refs.length||big)seen=new Set();
  else if(need>1<<20){seen=new Uint8Array(need);steps=need>>8} /* the places been at, a bit each; a large table's making counts as steps */
  else{seen=prog.tab&&prog.tab.length>=need?prog.tab:(prog.tab=new Uint8Array(need));touched=[]} /* a small one is kept, and wiped where it was written: the next match along the same line starts clean at no cost */
  var lim=Math.min(refs.length?budget:big?SAFE_SET:SAFE_STEPS,SAFE_BURST-SAFE_SPENT);
  var caps=[],regs=[],stack=[],runs=prog.rs===s?prog.rr:(prog.rs=s,prog.rr=[]),gone=[],goneN=0,run=++SAFE_RUN,tick=0; /* runs: where each counted character's runs are in this line, kept for the next match along it (grep -o, s///g) */
  try{
  for(var st=from;st<=n;st++){
    for(var k=0;k<2*(ng+1);k++)caps[k]=-1;
    caps[0]=st;stack.length=0;stack.push(0,st,-1);
    if((tick+=ng+1)>4096){tick=0;if(SAFE_MS+Date.now()-t0>SAFE_TIME)return false}
    while(stack.length){
      var z=stack.pop(),pos=stack.pop(),pc=stack.pop();
      if(z>=0){caps[z]=pos;continue} /* a group's bound put back */
      if(z<-1){regs[-2-z]=pos;continue} /* where an iteration began, put back */
      var o=prog[pc];
      if(o.op===11){ /* a counted run, from S, ending at E this time; the next end to try is left behind */
        var E=pos%W,S=(pos-E)/W,A=prog[pc+1].act,U=null,to,v,at;
        if(++steps>lim)return false;
        /* gone: for each end already gone on from (with no iteration starting there, so at the one place), how far the next one not yet
           gone on from is: those between need not be come back to, and are stepped over at once, but for an iteration's start among them */
        if(!refs.length&&!(U=gone[pc])&&(o.n=o.x===run?o.n+1:(o.x=run,1))>SAFE_GONE&&(goneN+=W+2)<=4e6){U=gone[pc]=new Int32Array(W+2);steps+=W>>4} /* kept from the 64th time it comes back in one search: before that there is little to step over */
        if(o.greedy){
          var low=S+o.min;
          if(U){
            to=E;while(to>=0&&U[to])to-=U[to];
            for(v=E;v>to;){at=U[v];U[v]=v-to;v-=at}
            at=-1;if(A)for(k=0;k<A.length;k++){v=regs[A[k]];if(v>to&&v<=E&&v>=low&&v>at)at=v}
            if(at>=0)E=at;
            else{if(to<low)continue;E=to;U[E]=1}
          }
          if(E>low)stack.push(pc,(E-1)+S*W,-1);
        }else{
          var c0=runs[pc-1],top=c0&&S>=c0[0]&&S<=c0[1]?Math.min(c0[1],S+o.max):-1; /* how far the run goes, where that is still known */
          if(U&&top>=0){
            to=E;while(to<=n&&U[to])to+=U[to];
            for(v=E;v<to;){at=U[v];U[v]=to-v;v+=at}
            at=-1;if(A)for(k=0;k<A.length;k++){v=regs[A[k]];if(v>=E&&v<to&&v<=top&&(at<0||v<at))at=v}
            if(at>=0)E=at;
            else{if(to>top)continue;E=to;U[E]=1}
          }
          if(top>=0?E<top:E-S<o.max&&E<n&&o.f(s.charCodeAt(E)))stack.push(pc,(E+1)+S*W,-1);
        }
        if(o.g){stack.push(0,caps[2*o.g],2*o.g,0,caps[2*o.g+1],2*o.g+1);caps[2*o.g]=E>S?E-1:-1;caps[2*o.g+1]=E>S?E:-1}
        pos=E;pc++;
      }
      for(;;){
        o=prog[pc];var e=0; /* e: of the iterations it is inside, how many have matched nothing yet; the loops' starts nest, so that is all they add to the place */
        if(o.act)for(k=0;k<o.act.length;k++)if(regs[o.act[k]]===pos)e++;
        if(refs.length){
          var key=pc+','+pos+','+e;for(k=0;k<refs.length;k++)key+=','+caps[2*refs[k]]+','+caps[2*refs[k]+1];
          if(seen.has(key))break;seen.add(key);
        }else{var kk=(pc*W+pos)*D+e;if(big){if(seen.has(kk))break;seen.add(kk)}else{var bi=kk>>3,bm=1<<(kk&7);if(seen[bi]&bm)break;if(touched&&!seen[bi])touched.push(bi);seen[bi]|=bm}} /* each place once */
        if(++steps>lim)return false;
        if(++tick>4096){tick=0;if(SAFE_MS+Date.now()-t0>SAFE_TIME)return false}
        switch(o.op){
        case 0:if(pos<n&&o.f(s.charCodeAt(pos))){pc++;pos++;continue}break;
        case 1:if(o.f(s,pos)){pc++;continue}break;
        case 2:stack.push(o.y,pos,-1);pc=o.x;continue;
        case 3:pc=o.x;continue;
        case 4:stack.push(0,caps[o.k],o.k);caps[o.k]=pos;pc++;continue;
        case 5:tick+=o.g.length;if(stack.length>2e7)return false;for(k=0;k<o.g.length;k++){ /* thousands of groups cleared each time round: the way back is not kept without end */var g=o.g[k];stack.push(0,caps[2*g],2*g,0,caps[2*g+1],2*g+1);caps[2*g]=caps[2*g+1]=-1}pc++;continue;
        case 6:
          var a=caps[2*o.n],b=caps[2*o.n+1];
          if(a<0||b<0){pc++;continue} /* a group that took part in nothing matches the empty string */
          var len=b-a;if(pos+len>n)break;
          tick+=len;if(tick>4096){tick=0;if(SAFE_MS+Date.now()-t0>SAFE_TIME)return false}
          for(k=0;k<len;k++){var x=s.charCodeAt(a+k),y=s.charCodeAt(pos+k);if(x!==y&&!(ic&&reCanon(x)===reCanon(y)))break}
          if(k<len)break;
          pos+=len;pc++;continue;
        case 7:caps[1]=pos;return caps.slice();
        case 8:stack.push(0,regs[o.r],-2-o.r);regs[o.r]=pos;pc++;continue;
        case 9:if(pos===regs[o.r])break;pc++;continue;
        case 10:
          var c=runs[pc],b; /* the run of its character from here on: found once, and kept */
          if(c&&pos>=c[0]&&pos<=c[1])b=c[1];
          else{
            b=pos;while(b<n&&o.f(s.charCodeAt(b))){b++;if(++steps>lim)return false;if(++tick>4096){tick=0;if(SAFE_MS+Date.now()-t0>SAFE_TIME)return false}if(c&&b===c[0]){b=c[1];break}}
            if(c&&pos<c[0]&&b===c[1])c[0]=pos;else runs[pc]=[pos,b];
          }
          var r=Math.min(b-pos,o.max);
          if(r>=o.min)stack.push(pc+1,(o.greedy?pos+r:pos+o.min)+pos*W,-1);
          break;
        }
        break;
      }
    }
    if(sticky)break;
  }
  return null;
  }finally{
    SAFE_SPENT+=steps;SAFE_MS+=Date.now()-t0;
    if(touched){if(touched.length*16<need)for(k=0;k<touched.length;k++)seen[touched[k]]=0;else seen.fill(0,0,need)}
  }
}
class SafeRe extends RegExp{
  constructor(src,flags){
    super(src,flags);
    var T=null;
    try{if(!/[msuv]/.test(this.flags)){if(this.source.length>2e5){if(/[*+?{|(]/.test(this.source))throw SAFE_BIG;throw SAFE_BAIL} /* megabytes of pattern: not gone through at all */
      T=reParse(this.source);if(!T.hard)T=null;else{T.prog=reCompile(T,this.ignoreCase,false);if(T.refs.length)T.pre=reCompile(T,this.ignoreCase,true)}}}catch(e){if(e===SAFE_BIG||e instanceof RangeError)T={big:true};else if(e!==SAFE_BAIL)throw e;else T=reTame(this.source)?null:{big:true}} /* what it does not know, with a repeat, an alternative or a backreference in it, is not the RegExp's to go round and round on: refused as well */ /* RangeError: nested thousands deep */ /* too big to run safely: it matches nothing, as overflow (regcomp's REG_ESPACE) */
    this.safe=T;this.overflow=false;
    if(!T&&this.source.length>1000){RegExp.prototype.exec.call(this,'');this.lastIndex=0} /* one too large for the RegExp says so now, as a bad pattern, not at its first line */
  }
  exec(s){
    var T=this.safe;
    if(!T)return super.exec(s);
    this.overflow=false;
    if(T.big){this.overflow=true;if(this.global||this.sticky)this.lastIndex=0;return null}
    s=String(s);
    var g=this.global||this.sticky,from=g?Math.max(Math.floor(+this.lastIndex)||0,0):0;
    if(from>s.length){if(g)this.lastIndex=0;return null}
    var pre=T.pre&&reRun(T.pre,T.ng,[],this.ignoreCase,s,from,this.sticky,0),c=pre===false?false:T.pre&&!pre?null:reRun(T.prog,T.ng,T.refs,this.ignoreCase,s,from,this.sticky,SAFE_BUDGET);
    if(c===false){this.overflow=true;c=null}
    if(!c){if(g)this.lastIndex=0;return null}
    if(g)this.lastIndex=c[1];
    var t0=Date.now(),r=[];for(var k=0;k<=T.ng;k++)r.push(c[2*k]>=0&&c[2*k+1]>=0?s.slice(c[2*k],c[2*k+1]):undefined);
    r.index=c[0];r.input=s;r.groups=undefined;
    if(T.ng>64)SAFE_MS+=Date.now()-t0; /* thousands of groups, given back match after match, take their time too */
    return r;
  }
}
function reTame(src){ /* nothing in it to go back over: no repeat, alternative or backreference, classes and escapes apart */
  for(var i=0;i<src.length;i++){
    var c=src.charAt(i),m;
    if(c==='\\'){if(/[1-9k]/.test(src.charAt(i+1)))return false;i++;continue}
    if(c==='['){for(i++;i<src.length&&src.charAt(i)!==']';i++)if(src.charAt(i)==='\\')i++;continue}
    if(c==='('&&src.charAt(i+1)==='?'){if(!(m=/^\(\?(?:<[A-Za-z_$][\w$]*>|<?[=!]|:)/.exec(src.slice(i))))return false;i+=m[0].length-1;continue}
    if(/[*+?{|]/.test(c))return false;
  }
  return true;
}
function safeRe(src,flags){return new SafeRe(src,flags)}

function list(v){return v.split(',').map(function(x){return x.trim().toLowerCase()}).filter(Boolean)} /* a, B ,c -> [a,b,c] */
function paths(v){return v.split(',').map(function(x){return x.trim()}).filter(Boolean)} /* the same, keeping case: file names */
function unquote(s){return s.replace(/^(['"])((?:(?!\1).)*)\1$/,'$2')} /* one quoted string only: "a" ; "b" keeps its quotes */
function setAlias(L,from,to,n){ /* a new alias replaces any with the same words. n: csh's count of the words it was given */
  var k=from.join(' ');
  L=L.filter(function(x){return x.from.join(' ')!==k});
  L.push(n===undefined?{from:from,to:to}:{from:from,to:to,n:n});
  return L;
}

var PH=window.Phosphor={
  version:'1.0.0',
  upstream:'https://github.com/GaijinSystems/phosphor', /* default for the source command */
  texts:[],defs:[],hooks:[],seen:{},catalog:{},allowed:[],machine:null,early:[],
  content:function(s){var f=me();PH.texts.push({src:String(s),site:!f||/(^|\/)site\//.test(f)})}, /* settings and == sections == */
  command:function(def){def.from=me();PH.defs.push(def)},  /* a built-in command, see engine/commands */
  setup:function(fn){me();PH.hooks.push(fn)},     /* machine hook: runs after the file tree exists */
  machines:function(m){me();Object.assign(PH.catalog,m)}, /* machines/machines.js: what can be plugged in */
  later:function(files,def){ /* a program that is listed from the start and only loads when first run; files relative to the machine */
    var d=Object.assign({},def);
    d.run=function(a,raw,w){PH.runLater(files,d,a,raw,w)};
    PH.command(d);
  },
  stubs:function(names,say,o){names.forEach(function(n){PH.command(Object.assign({names:[n],run:function(){say(n)}},o))})}, /* programs that are there and won't run */
  start:start
};

/* Every file index.html loads calls one of the three functions above, which notes the file
   as loaded. A file that is missing, or that has a stray ` or ${ in it, never gets that far,
   so start() can name it on the glass. (The browser's own error event cannot be used: for
   a page opened from disk it hides which file failed.) */
function me(){
  var s=document.currentScript,f=s?(s.getAttribute('src')||''):'';
  if(f)PH.seen[f]=true;
  return f;
}
function notLoaded(){
  var L=[],S=document.querySelectorAll('script[src]');
  for(var i=0;i<S.length;i++){
    var f=S[i].getAttribute('src');
    if(/(^|\/)(engine|machines|site)\//.test(f)&&!/(^|\/)engine\/phosphor\.js$/.test(f)&&!PH.seen[f])L.push(f); /* only our own files: a page may carry others */
  }
  return L;
}

/* ---------- which machine: chosen before anything is built, because the machine's files
   have to load first. The site's settings say which are allowed; ?machine=name picks one. ---------- */
function setting(name){ /* one site setting, read early: settings end at a block's first == section == */
  var v=null,re=new RegExp('^\\s*'+name+'\\s*:\\s*(.*?)\\s*$','i');
  PH.texts.forEach(function(t){
    if(!t.site)return;
    var L=t.src.split(/\r?\n/);
    for(var i=0;i<L.length;i++){
      if(/^\s*==.*==\s*$/.test(L[i]))break;
      var m=L[i].match(re);if(m)v=m[1];
    }
  });
  return v;
}
function pickMachine(){
  var byYear=function(a,b){return PH.catalog[a].year-PH.catalog[b].year}; /* oldest first, the catalog's order among equals */
  var all=Object.keys(PH.catalog).sort(byYear);
  if(!all.length)return null; /* an index.html that lists its machine's script tags itself */
  var known=function(x){
    if(has(PH.catalog,x))return true;
    PH.early.push('unknown machine "'+x+'": see machines/machines.js');
    return false;
  };
  var want=list(setting('machines')||'').filter(known);
  PH.allowed=want.length?want.sort(byYear):all;
  var def=(setting('machine')||'').toLowerCase(),asked=(new URLSearchParams(location.search).get('machine')||'').toLowerCase();
  if(def==='random')def=PH.allowed.indexOf(asked)>=0?'':randomMachine(); /* an address that names one wins, and leaves the pick alone */
  if(def&&PH.allowed.indexOf(def)<0){PH.early.push('machine: "'+def+'" is not one of the machines allowed');def=''}
  PH.machine=PH.allowed.indexOf(asked)>=0?asked:def||PH.allowed[0];
  function randomMachine(){ /* machine: random. One pick per browser tab, so a reload is a reboot of the same machine */
    var k='phosphor-9/machine',m=null,pool=PH.allowed.filter(function(x){return PH.catalog[x].random!==false}); /* random:false sits out the draw */
    if(!pool.length)pool=PH.allowed; /* unless nothing else is allowed */
    try{m=sessionStorage.getItem(k)}catch(e){}
    if(pool.indexOf(m)<0){m=pool[Math.floor(Math.random()*pool.length)];try{sessionStorage.setItem(k,m)}catch(e){}}
    return m;
  }
  return PH.machine;
}
function loadMachine(id,done){ /* in order; a file that fails to load is named on the glass later */
  var M=PH.catalog[id],left=0;
  (M.files||[]).forEach(function(f){
    var src=M.dir+'/'+f,el;
    if(/\.css$/.test(f)){ /* before the site's theme, so the site still wins */
      el=document.createElement('link');el.rel='stylesheet';el.href=src;
      document.head.insertBefore(el,document.querySelector('link[href^="site/"]'));
      return;
    }
    el=document.createElement('script');el.src=src;el.async=false;left++;
    el.onload=el.onerror=function(){if(!--left)done()};
    document.body.appendChild(el);
  });
  if(!left)done();
}
function start(){
  if(PH.started)return;PH.started=true;
  var id=pickMachine();
  if(id)loadMachine(id,build);else build();
}

function build(){
var CAT=PH.machine&&PH.catalog[PH.machine]; /* the machine's catalog entry; none when the page lists its machine's files itself */

/* ---------- content (parsed from every Phosphor.content block, in load order) ---------- */
var SITE=(location.hostname||'').toLowerCase(); /* the real server this page came from ('' when opened as a file) */
var PROFILE=(function(){
  var P={name:'OPERATOR',email:'',speed:1,upper:true,sound:true,protected:[],guestFiles:[],homes:'/usr',loginPrompt:'login: ',rootName:'root',rootPrompt:'# ',loginFailed:'Login incorrect',lsOwner:8,lsSize:8,mailNotice:'you have mail.',notFound:'%s: not found',
    cord:{turns:7,desktop:0,width:18,thickness:3.2,gap:1.8,straight:7.35,sway:2.5},
    title:'',badge:'PHOSPHOR-9',year:CAT&&CAT.year||1979,installed:'',user:'guest',hostname:'',domain:'',source:'',prompt:'$ ',
    offline:'the network is down.',off:[],machine:'',machines:'',effects:'auto',
    welcome:null,about:[],mail:[],commands:[],files:[],dirs:[],man:Object.create(null),aliases:[],sec:Object.create(null),raw:Object.create(null),problems:[]};
  var secs=[];
  function yes(v){return !/^(no|false|off|0)$/i.test(v)}
  var CL={turns:[1,40],desktop:[0,40],width:[6,80],thickness:[1,8],gap:[0,10],straight:[0,200],sway:[0,10]};
  function setKey(k,v){
    var ck=k.match(/^cord (\w+)$/);
    if(ck&&has(CL,ck[1])){var x=parseFloat(v),L=CL[ck[1]];if(!isNaN(x))P.cord[ck[1]]=Math.min(L[1],Math.max(L[0],x));return}
    if(k==='name'){if(v)P.name=v}
    else if(/^(email|title|badge|installed|offline|machine|machines)$/.test(k))P[k]=v;
    else if(k==='homes'){if(/^\/[\w\/-]*$/.test(v))P.homes=v.replace(/\/+$/,'')} /* where home folders live */
    else if(k==='speed'){var n=parseFloat(v);if(n>0)P.speed=n}
    else if(k==='sound')P.sound=yes(v);
    else if(k==='uppercase')P.upper=yes(v);
    else if(k==='persist')P.persist=yes(v);             /* no: the visitor's file changes go at a reload, as a reboot */
    else if(k==='teletype')P.teletype=yes(v);           /* a Teletype Model 33 instead of the glass, where the machine has one (V7) */
    else if(k==='effects'){var fx=v.toLowerCase();if(/^(auto|full|lite)$/.test(fx))P.effects=fx;else P.problems.push('effects: auto, full or lite')}
    else if(k==='protected')P.protected=P.protected.concat(paths(v));
    else if(k==='guest files')P.guestFiles=P.guestFiles.concat(paths(v)); /* the guest's own: the machine's shell startup files, and the site's choice */
    else if(k==='core mode'){if(/^-[-r][-w]-[-r][-w]-[-r][-w]-$/.test(v))P.coreMode=v} /* a core dump's mode, as the kernel made it (Linux: -rw-------) */
    else if(k==='immutable')P.immutable=yes(v);           /* the site owner's files in the home carry Linux's immutable attribute (chattr +i) */
    else if(k==='not found')P.notFound=v;
    else if(k==='ls columns'){var lc=v.split(/\s+/);P.lsOwner=+lc[0]||8;P.lsSize=+lc[1]||8;P.lsTight=lc[2]==='tight'}
    else if(k==='mail notice')P.mailNotice=v;
    else if(k==='disk full')P.diskFull=v;                /* what a write says when the disk fills */
    else if(k==='home')P.home=v.replace(/\/+$/,'')||'/'; /* one fixed home instead of homes/user */
    else if(k==='login prompt')P.loginPrompt=v+' ';
    else if(k==='root login')P.rootName=v.toLowerCase();
    else if(k==='also root'){var ar=v.split('/');P.alsoRoot=ar[0].toLowerCase();P.alsoRootWord=ar[1]||''} /* name/password */
    else if(k==='root prompt')P.rootPrompt=v.replace(/^"(.*)"$/,'$1');
    else if(k==='login failed')P.loginFailed=v;
    else if(k==='closed door')P.closedDoor=yes(v);        /* only the accounts it knows may log in */
    else if(k==='shell'){P.dos=/^(dos|dcl)$/i.test(v);P.dcl=/^dcl$/i.test(v);P.bash=/^bash$/i.test(v)} /* dos, dcl: backslash paths; no quotes, $ or ;. bash: tab, !!, $( ) and --help */
    else if(k==='unix')P.noUnix=!yes(v);                  /* leave out the Unix tools: the machine brings its own */
    else if(k==='root password')P.rootPassword=v;
    else if(k==='backdoor')P.backdoor=v.toLowerCase();    /* a login name that needs no password, and is root */
    else if(k==='perror')P.perror=yes(v);                 /* name: reason, the way Berkeley's programs complain */
    else if(k==='csh')P.csh=yes(v);                       /* !! and history, finger, w */
    else if(k==='signals')P.signals=v.toLowerCase();       /* irix: IRIX's signal numbers, not 4.3BSD's */
    else if(k==='sysv')P.sysv=yes(v);                     /* System V's userland: its sh, and its tools' ways and words */
    else if(k==='login')P.noLogin=!yes(v);                /* no login: it just boots */
    else if(k==='case')P.caseless=/^(ignore|insensitive|no)$/i.test(v); /* case: ignore = FILE and file are the same */
    else if(k==='year'){var y=parseInt(v,10);if(y>0)P.year=y}
    else if(k==='user'){if(LOGIN_NAME.test(v))P.user=v.toLowerCase()}
    else if(k==='hostname')P.hostname=v.toLowerCase();
    else if(k==='domain')P.domain=v.toLowerCase();       /* the machine's domain: its full name is hostname.domain */
    else if(k==='source'){ /* becomes a link: same rule as links in the text */
      if(!v||/^https?:\/\/\S+$/i.test(v))P.source=v;
      else P.problems.push('source: must start with http:// or https://');
    }
    else if(k==='prompt')P.prompt=v.replace(/^"(.*)"$/,'$1');
    else if(k==='commands')list(v).forEach(function(x){ /* commands: -ping, -ifconfig switches them off */
      if(x.charAt(0)==='-')P.off.push(x.slice(1));
      else P.off=P.off.filter(function(o){return o!==x});
    });
    else P.problems.push('unknown setting "'+k+'"');
  }
  P.problems=P.problems.concat(PH.early);
  /* the machine's text first, whatever order the files arrived in: the site wins */
  PH.texts.filter(function(t){return !t.site}).concat(PH.texts.filter(function(t){return t.site})).forEach(function(text){
    var cur=null; /* settings come first in each block, before its first == section == */
    text.src.replace(/\r/g,'').split('\n').forEach(function(raw){
      if(/^\s*#/.test(raw))return;
      var h=raw.match(/^\s*==\s*(.*?)\s*==\s*$/);
      if(h){cur={head:h[1],lines:[],site:text.site};secs.push(cur);return}
      if(cur){cur.lines.push(raw.replace(/\s+$/,''));return}
      var m=raw.match(/^\s*([a-z][a-z _-]*?)\s*:\s*(.*?)\s*$/i);if(!m)return;
      setKey(m[1].toLowerCase().replace(/[\s_-]+/g,' '),m[2]);
    });
  });
  P.teletype=!!(P.teletype&&CAT&&CAT.teletype); /* only a machine that had one offers it: the rest ignore it */
  P.live=P.year===new Date().getFullYear(); /* a machine of today: its clock is the visitor's own (Debian) */
  /* who the machine is, worked out once the settings are known */
  P.owner=P.name.split(/\s+/)[0].replace(/[^a-z0-9]/gi,'').slice(0,8).toLowerCase()||'operator';
  P.host=P.hostname||(SITE.replace(/^www\./,'').split('.')[0]||P.owner).replace(/[^a-z0-9-]/g,'').slice(0,8)||'phosphor';
  var VARS={site:SITE||P.host,hostname:P.host,owner:P.owner,email:P.email,year:String(P.year)};
  function fill(t){return String(t).replace(/\{(site|hostname|owner|email|year)\}/g,function(m,k){return VARS[k]})}
  P.fill=fill;
  function up(t){return P.upper?String(t).toUpperCase():t}
  P.fold=function(t){return P.caseless?String(t).toLowerCase():String(t)}; /* names, as this machine sees them */
  P.up=up;
  function trimBlank(L){
    L=L.slice();
    while(L.length&&!L[0].trim())L.shift();
    while(L.length&&!L[L.length-1].trim())L.pop();
    return L;
  }
  function lines(L){
    return trimBlank(L).map(function(l){
      if(P.live)l=l.replace(/~~([^~]+?)~~ (\S*\{year\}\S*)/g,function(m,real,era){ /* ~~real date~~ {year} date: here the real one alone, unstruck, ending where the pair ended */
        return ' '.repeat(fill(era).length+1)+real;
      });
      l=fill(l);
      var href=null,k=l.match(/^(.*?)\s+->\s*((?:https?:\/\/|mailto:)\S+)\s*$/i);
      if(k){l=k[1];href=k[2]}
      var m=l.match(/^(\s*)(!|~(?!~))\s?(.*)$/),t=m?up(m[1]+m[3]):up(l),c=m?(m[2]==='~'?'dim':'err'):'';
      t=t.replace(/~~(.+?)~~/g,'\u0001$1\u0002'); /* ~~text~~ = struck through */
      return href?[t,c,{href:href}]:(c?[t,c]:t);
    });
  }
  P.lines=lines;
  P.name=up(P.name);
  var ownBoot=null; /* this machine's own == boot: id == */
  secs.forEach(function(sc){
    var hd=sc.head,body=lines(sc.lines),m;
    if(/^welcome$/i.test(hd))P.welcome=body;
    else if(/^about$/i.test(hd))P.about=body;
    else if(/^mail$/i.test(hd))P.mail=body.map(function(l){ /* project row = has a run of 2+ spaces inside it: */
      var re=/(\S)( {2,})(?=\S)/,x=lineOf(l),s=x[0];             /* that run becomes a squeezable gap */
      if(!re.test(s))return l;
      return [s.replace(re,'$1\u0003$2\u0004'),x[1]||'',Object.assign({row:true},x[2])];
    });
    else if(/^alias(es)?$/i.test(hd))sc.lines.forEach(function(l){
      var a=l.match(/^\s*([^=#]+?)\s*=\s*(.+?)\s*$/);
      if(!a)return;
      P.aliases=setAlias(P.aliases,P.fold(a[1]).split(/\s+/),unquote(fill(a[2]))); /* the command keeps its case: echo Hello prints Hello */
    });
    else if((m=hd.match(/^command\s*:\s*([^|]+?)\s*(?:\|\s*(.*))?$/i))){
      var names=list(m[1]);
      if(!names.length)return;
      P.commands=P.commands.filter(function(c){return !c.names.some(function(n){return names.indexOf(n)>=0})});
      P.commands.push({names:names,help:up(fill(m[2]||'')),body:body,site:sc.site});
    }
    else if((m=hd.match(/^file\s*:\s*(\S+)$/i)))P.files.push({name:m[1],body:body});
    else if((m=hd.match(/^dir(?:ectory)?\s*:\s*(\S+)$/i)))P.dirs.push(m[1]);
    else if((m=hd.match(/^man\s*:\s*(\S+)$/i)))P.man[m[1].toLowerCase()]=body;
    else if((m=hd.match(/^boot\s*:\s*(.*)$/i))){ /* == boot: linux, bsd ==: on those machines only, over any plain == boot == */
      var ids=list(m[1].toLowerCase()),cat=Object.keys(PH.catalog);
      if(!ids.length)P.problems.push('boot: which machines? == boot: linux, bsd ==');
      ids.forEach(function(x){if(cat.length&&!has(PH.catalog,x))P.problems.push('boot: unknown machine "'+x+'"')});
      if(PH.machine&&ids.indexOf(PH.machine)>=0)ownBoot={body:body,raw:trimBlank(sc.lines).map(fill)};
    }
    else{var key=hd.toLowerCase();P.sec[key]=body;P.raw[key]=trimBlank(sc.lines).map(fill)} /* machine sections: banner, dmesg, ps ... */
  });
  if(ownBoot){P.sec.boot=ownBoot.body;P.raw.boot=ownBoot.raw}
  if(!P.welcome)P.welcome=[up('welcome to '+P.name.toLowerCase()+'.'),[up('type help and press return.'),'dim']];
  return P;
})();
var CSH=!!PROFILE.csh; /* the shell's grammar is csh's: the machine's shell, but for 4.3BSD's /bin/sh while it runs (bourne()) */
var DASH=false,DLN0=0,DSKIP=0,DAT=0; /* Debian's /bin/sh is dash 0.5.12: while one runs (bourne()), POSIX grammar and dash's messages. DLN0, DSKIP: where the
                                        lines the one at the terminal has read start, and how many of them were syntax errors, which it does not count; DAT: the
                                        line of the command running, in a compound command typed at its prompt */
function bashy(){return PROFILE.bash&&!DASH} /* bash's own grammar, which dash does not have */

function $(s){return document.querySelector(s)}
var term=$('#term'),out=$('#out'),glow=$('#glow'),kb=$('#kb'),svg=$('#cable'),sway=$('#sway');
var cursor=document.createElement('span');cursor.className='cursor';
var calm=matchMedia('(prefers-reduced-motion:reduce)');
/* effects: full, or lite (html.lite in engine/phosphor.css) for a browser that draws the page without a
   graphics chip. auto: lite when WebGL is a software one or missing, or when the warm-up draws slowly. */
var FX={mode:'auto',why:null}; /* why: what auto found ('' = nothing slow; null = not looked yet) */
function fxApply(){document.documentElement.classList.toggle('lite',FX.mode==='lite'||FX.mode==='auto'&&!!FX.why)}
function softGL(){ /* the software renderer's name, 'no WebGL', or '' for a graphics chip */
  try{
    var c=document.createElement('canvas'),g=c.getContext('webgl')||c.getContext('experimental-webgl'),x,r;
    if(!g)return 'no WebGL';
    r=String(g.getParameter(g.RENDERER)||'');
    if(/^webkit webgl$/i.test(r)&&(x=g.getExtension('WEBGL_debug_renderer_info')))r=String(g.getParameter(x.UNMASKED_RENDERER_WEBGL)||r);
    if((x=g.getExtension('WEBGL_lose_context')))x.loseContext();
    r=r.match(/swiftshader|llvmpipe|softpipe|software|basic render/i);
    return r?'software, '+r[0]:'';
  }catch(e){return ''}
}
function fxDetect(){ /* once, for auto: the renderer, then 700 ms of frames, under 25 a second is slow */
  if(FX.mode!=='auto'||FX.why!==null)return;
  FX.why=softGL();
  if(FX.why){fxApply();return}
  var D=[],last=0,end=0,away=false,gone=function(){away=true};
  document.addEventListener('visibilitychange',gone);
  requestAnimationFrame(function f(t){ /* a hidden tab draws nothing: it starts when it shows */
    if(!end)end=t+700;else D.push(t-last);
    last=t;
    if(t<end&&!away){requestAnimationFrame(f);return}
    document.removeEventListener('visibilitychange',gone);
    D=D.slice(2).sort(function(a,b){return a-b});
    var med=D.length?D[D.length>>1]:1e3; /* not even three frames */
    if(!away&&med>40&&!FX.why){FX.why='slow drawing, '+Math.round(1000/med)+' frames a second';fxApply()}
  });
}
/* what screen readers hear: each line once it is finished, not every character of the typing */
var log=document.createElement('div');log.id='log';log.setAttribute('role','log');log.setAttribute('aria-live','polite');
document.body.appendChild(log);
function announce(s){
  if(!s.trim())return;
  var p=document.createElement('div');p.textContent=s;log.appendChild(p);
  trim(log,50);
}
var coarse=matchMedia('(pointer:coarse)').matches;
var chain=Promise.resolve(),buf='',bufNode=null,bufTail=null,hist=[],hi=0,HMAX=50; /* what was typed, for !n and the arrows: the last HMAX lines */
if(PROFILE.title)document.title=PROFILE.title;
var badge=$('.badge');if(badge)badge.textContent=PROFILE.badge;

/* Output runs through one queue, in order. A step's own queue() calls run inside that step, before
   the next step, so a stage of a pipeline finishes all its output before the next stage starts.
   Ctrl-C bumps GEN: steps queued before it are skipped, unless they must always run (prompts). */
var GEN=0,inner=null,wakers=[],ASIDE=null,FGP=null; /* ASIDE: the aside() a step belongs to, or null for the one queue. FGP: the foreground pipeline ^Z can stop (fgProc) */
function owner(){return ASIDE&&ASIDE.job||inner&&inner.proc} /* the job a step is part of, or the foreground pipeline ^Z can stop */
function jobOf(x){return x&&(x.resume?x:x.job)} /* a job, or a foreground pipeline's job */
function wakeList(){var o=owner();return o?o.wakers:wakers} /* a background job's waits are its own: ^C does not end them */
function sleep(ms){var own=owner()||null;if(ms>0&&pipeWait())return Promise.resolve();return new Promise(function(r){ /* a write that met SIGPIPE: the process is gone, and so is its sleep */
  var W=wakeList(),done=function(){
    clearTimeout(t);var i=W.indexOf(done);if(i>=0)W.splice(i,1);
    var j=jobOf(own); /* its job, stopped: the time runs on, and the sleep ends once it goes on (nanosleep's restart) */
    if(j&&j.state==='Stopped'&&!j.dead)stopWait(j).then(function(){r()});else r();
  },t=setTimeout(done,ms);
  W.push(done);
})}
var TTY={}; /* thrown by what wants the terminal (a read, the full screen) in a background job: the job stops there */
function queue(fn,always){
  var g=GEN,side=ASIDE,pr=inner&&inner.proc||null,oops=function(e){console.error(e)},step=function(){
    var job=side&&side.job||pr&&pr.job||null,sd=side||job&&job.side||null; /* pr: the foreground pipeline it is part of, which a ^Z makes a job (fgProc) */
    if(job?job.dead&&always!==2:g!==GEN&&!always||side&&side.stopped&&!always)return; /* a job goes on after ^C, until it is killed; then none of its steps run but a redirection's write */
    if(job&&job.state==='Stopped')return stopWait(job).then(step); /* kill -STOP: its next step waits for fg, bg or kill -CONT */
    var sc={p:null,proc:pr,race:null};
    function once(){ /* a job's step runs with the job's own directory, variables, output and status; once it stops for the terminal, again when it is resumed */
      var saved=inner,was=ASIDE,fg=null,ret;
      inner=sc;ASIDE=sd;
      if(job){fg=procGet();procPut(job.ctx)}
      try{ret=fn()}
      catch(e){if(tooDeep(e)){deepSay();return}if(e!==TTY||!job)throw e;ret=Promise.reject(e)}
      finally{inner=saved;ASIDE=was;if(fg){job.ctx=procGet();procPut(fg)}}
      return job?Promise.resolve(ret).catch(function(e){if(e!==TTY)throw e;return ttyStop(job).then(function(go){if(go)return once()})}):ret;
    }
    return Promise.resolve(once()).then(function(){return sc.race?Promise.race([sc.p,sc.race]):sc.p}); /* race: a ^Z lets the shell go on */
  };
  if(inner){inner.p=(inner.p||Promise.resolve()).then(step).catch(oops);return inner.p}
  if(side){side.p=side.p.then(step).catch(oops);return side.p}
  chain=chain.then(step).catch(oops);return chain;
}
/* A queue of its own beside the one queue, for a machine whose program goes on while the terminal reads (VM/370's
   EXEC after an attention): what it types goes in above the line being typed in, which stays as it is; with no read
   up it types as usual. ^C stops it as it stops everything; stop() stops it, the line it is typing finishes;
   end() is a promise of when it is done; live() says it has not stopped or finished */
function aside(fn,job){ /* job: a background job's own queue (see startJob) */
  var h={p:Promise.resolve(),stopped:false,gen:GEN,over:false,job:job||null,
    stop:function(){h.stopped=true;return h.p},end:function(){return h.p},
    live:function(){return !h.stopped&&!h.over&&h.gen===GEN}};
  var was=ASIDE,saved=inner;ASIDE=h;inner=null;
  try{queue(fn)}finally{ASIDE=was;inner=saved}
  h.p.then(function(){h.over=true});
  return h;
}
function pause(ms){return queue(function(){return sleep(ms)})}
/* a line nested too deep for the browser's stack (thousands of ${ or ( deep): bash itself crashes on one deep enough; here the
   command ends with an error, and the shell goes on */
function tooDeep(e){return e instanceof RangeError&&/call stack/i.test(e.message)}
function deepSay(){typeLine((PROFILE.bash?DASH?'sh: ':'bash: ':'')+'line too deeply nested','err');STATUS=2}

/* ---------- sound (keyclicks; WebAudio only, no files) ---------- */
var SND={ctx:null,noise:null,clicks:PROFILE.sound};
function actx(){
  if(!SND.ctx){
    var C=window.AudioContext||window.webkitAudioContext;if(!C)return null;
    var c=SND.ctx=new C(),n=(c.sampleRate*.03)|0,b=c.createBuffer(1,n,c.sampleRate),d=b.getChannelData(0);
    for(var i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,6);
    SND.noise=b;
  }
  if(SND.ctx.state==='suspended')SND.ctx.resume();
  return SND.ctx;
}
/* browsers refuse audio before a real user gesture, so the boot is silent;
   the first tap/key quietly starts the sound hardware */
var GEST=['pointerdown','touchend','keydown','click'];
function unlockAudio(){
  if(!SND.clicks)return;
  var c=actx();
  if(c&&c.state==='running')GEST.forEach(function(t){document.removeEventListener(t,unlockAudio,true)});
}
GEST.forEach(function(t){document.addEventListener(t,unlockAudio,true)});
function sndOn(){return SND.clicks&&SND.ctx&&(!TELE||!TELE.on||SND.ctx.state==='running')?SND.ctx:null} /* the sound hardware, when sound is on and it has started; the teletype's sounds only while it runs, or they would all come at once when it resumes */
function noise(c,q){ /* the noise through a band-pass filter of width q and a gain, to the speaker: {s,f,g}, not started */
  var n={s:c.createBufferSource(),f:c.createBiquadFilter(),g:c.createGain()};
  n.s.buffer=SND.noise;n.f.type='bandpass';n.f.Q.value=q;
  n.s.connect(n.f);n.f.connect(n.g);n.g.connect(c.destination);
  return n;
}
function click(vol,freq){
  var c=sndOn();if(!c)return;
  var n=noise(c,1.4);
  n.f.frequency.value=freq||2200+Math.random()*1800;n.g.gain.value=vol;n.s.start();
}

/* ---------- the Teletype Model 33 ("teletype: yes", where the machine had one: V7) ----------
   Paper at ten characters a second, capitals only, through V7's tty driver as getty set it for the
   console teletype: LCASE, CRMOD, XTABS and cr1 (stty tty33). The site offers it, the visitor's teletype command turns it on. */
var TELE={ok:!!PROFILE.teletype,on:false,free:0}; /* ok: offered here; on: in use (the visitor's choice, remembered); free: when the printer is done echoing */
function ttGetty(){ /* the modes getty sets at each login: 110 baud; lcase for a name typed in capitals, as the ASR-33 types it; # and @; echo, cooked */
  TELE.lcase=true;TELE.speed=110;TELE.erase='#';TELE.kill='@';TELE.echo=true;TELE.raw=TELE.cbreak=false;
}
ttGetty();
var TH={l:[],i:0}; /* the lines typed on the teletype, as typed (# and @ and all), for its arrows; hist has them as the shell got them */
var TT_CH=100,TT_CR=5000/60,TT_NL=2*TT_CH+TT_CR,TT_COLS=72; /* 110 baud with two stop bits: eleven bits, a tenth of a second a character; cr1: five clock ticks after a carriage return; NL: CR LF, then cr1; 72 columns of paper */
function ttPrint(t){ /* what the driver sends and the type box prints: with LCASE { } | ~ ` go out as \( \) \! \^ \' and small letters as capitals
                        (in raw mode the driver sends them as they are); V7 sends only the low seven bits of a character, and the
                        type box has 64 characters, so any other code from the lower-case columns prints as its capital-column twin */
  t=String(t);var o='',c,k,j;
  for(var i=0;i<t.length;i++){
    c=t.charAt(i);
    if(c==='\u0005'){o+=c+t.charAt(++i);continue} /* a colour code and its digit */
    k=c.charCodeAt(0);
    if(k>127){ /* the bytes of a character past ASCII, each cut to seven bits: what prints of them, a control code prints nothing */
      if(k>=0xd800&&k<0xdc00&&/[\udc00-\udfff]/.test(t.charAt(i+1)))c+=t.charAt(++i);else if(k>=0xd800&&k<0xe000)c='\ufffd'; /* half a pair alone: its bytes are U+FFFD's, as the browser writes it */
      var u=unescape(encodeURIComponent(c));c='';
      for(var n=0;n<u.length;n++){k=u.charCodeAt(n)&127;if(k>=32&&k<127)c+=String.fromCharCode(k)}
      o+=ttPrint(c);continue;
    }
    if(TELE.lcase&&!TELE.raw&&(j='{}|~`'.indexOf(c))>=0){o+='\\'+'()!^\''.charAt(j);continue}
    o+=k>=96&&k<127?String.fromCharCode(k-32):c;
  }
  return o;
}
function ttTab(col){return 8-(col&7)} /* XTABS: the driver sends a tab as this many spaces, to the next eighth column */
function ttPut(o,c,col){ /* o with c put at column col: the carriage stops at the 72nd column, and what comes after it there strikes over the
                            same place, as V7 did no wrapping (a space strikes nothing) */
  return col>=TT_COLS&&o.length&&o.slice(-1)!=='\n'?(c===' '?o:o.slice(0,-1)+c):o+c;
}
function ttFit(s,col){ /* a line as the teletype prints it from column col (ttTab, ttPut) */
  var o='',c;col=col||0;
  for(var i=0;i<s.length;i++){
    c=s.charAt(i);
    if(c==='\n'||c==='\r'){o+=c;col=0;continue}
    for(var n=c==='\t'?ttTab(col):1;n--;col++)o=ttPut(o,c==='\t'?' ':c,col);
  }
  return o;
}
function ttEcho(b,col){ /* the line being typed, as it was echoed from column col: the kill character is followed by a new line,
                           even after a \ (ttyinput echoes it before canon looks at the line); a tab goes out as spaces (XTABS), any other control character (BEL rings) prints nothing */
  if(!TELE.echo)return '';
  var o='',c;
  for(var i=0;i<b.length;i++){c=b.charAt(i);if(c>=' '||c==='\t')o+=c;if(c===TELE.kill&&!TELE.raw&&!TELE.cbreak)o+='\n'}
  return ttFit(ttPrint(o),col);
}
function ttKey(c){ /* a key as the ASR-33 sends it (capitals only, and no ` { | } ~ keys), then as V7 takes it in: LCASE makes capitals small */
  if(c.length!==1||c.charCodeAt(0)>126||/[`{|}~]/.test(c))return '';
  c=c.toUpperCase();
  return TELE.lcase?c.toLowerCase():c;
}
function ttKeys(s){return s.split('').map(ttKey).join('')}
var TT_MAP={'!':'|',"'":'`','(':'{',')':'}','^':'~'};
function ttCanon(s){ /* V7's canon(): the erase character (#) erases a character, the kill character (@) the line, \ before either keeps it;
                        with LCASE, \x is X and \( \) \! \^ \' are { } | ~ `. In raw or cbreak mode the line comes as typed */
  if(TELE.raw||TELE.cbreak)return s;
  var b=[],c,mc;
  for(var i=0;i<s.length;i++){
    c=s.charAt(i);
    if(b[b.length-1]!=='\\'){
      if(c===TELE.erase){b.pop();continue}
      if(c===TELE.kill){b=[];continue}
    }else{
      mc=c===TELE.erase||c===TELE.kill?c:TT_MAP[c]||(/[a-z]/.test(c)?c.toUpperCase():'');
      if(mc&&(mc===c||TELE.lcase)){if(b[b.length-2]!=='\\')c=mc;b.pop()}
    }
    b.push(c);
  }
  return b.join('');
}
/* its sounds, made here (no recordings), only once sound is on and the visitor has touched a key: autoplay rules */
function ttNoise(c,t,freq,q,vol,len,rate){
  var n=noise(c,q);
  n.s.playbackRate.value=rate||1;n.f.frequency.setValueAtTime(freq,t);
  n.g.gain.setValueAtTime(vol,t);n.g.gain.exponentialRampToValueAtTime(.0001,t+len);
  n.s.start(t);n.s.stop(t+len+.02);
  return n.f;
}
function ttThump(c,t,f0,f1,vol,len){
  var o=c.createOscillator(),g=c.createGain();
  o.type='triangle';o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+len);
  g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+len);
  o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+len+.02);
}
function ttStrike(ch,at){ /* the type box lifting and the hammer: a hard clack; a space only steps the carriage */
  var c=sndOn();if(!c)return;
  var t=at||c.currentTime,sp=ch===' ';
  ttNoise(c,t,sp?700:1500+Math.random()*900,sp?1.2:2.2,sp?.12:.45,sp?.03:.045);
  ttThump(c,t,sp?110:170,60,sp?.06:.16,.05);
}
function ttStrikes(s){ /* a prompt, which comes up at once: its characters still sound at ten a second */
  var c=sndOn();if(!c)return;
  for(var i=0;i<s.length;i++)ttStrike(s.charAt(i),c.currentTime+i*TT_CH/1000);
}
function ttReturn(){ /* the carriage sliding back, then landing at the margin */
  var c=sndOn();if(!c)return;
  var t=c.currentTime,f=ttNoise(c,t,1100,1.5,.16,.17,.18);
  f.frequency.exponentialRampToValueAtTime(320,t+.16);
  ttThump(c,t+.16,95,38,.45,.14);
  ttNoise(c,t+.16,500,1,.3,.06);
}
function ttBell(){ /* the bell behind the platen: a struck bell's few partials, dying away */
  var c=sndOn();if(!c)return;
  var t=c.currentTime;
  [[1,.22,1.4],[2.76,.09,.7],[5.4,.05,.35]].forEach(function(p){
    var o=c.createOscillator(),g=c.createGain();
    o.type='sine';o.frequency.value=1250*p[0];
    g.gain.setValueAtTime(p[1],t);g.gain.exponentialRampToValueAtTime(.0001,t+p[2]);
    o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+p[2]+.02);
  });
}

/* ---------- afterglow ---------- */
var lastG=0;
function afterglow(top,a,ms,force){
  if(calm.matches||!force&&document.documentElement.classList.contains('lite'))return; /* lite: only the fade at clear (scrolling ones cost a lot) */
  var n=performance.now();
  if(!force&&(n-lastG<90||glow.childElementCount>2))return;
  lastG=n;
  var g=out.cloneNode(true);
  g.removeAttribute('id');g.className='ghost';g.inert=true; /* a copy: its links must not take focus */
  var cs=g.querySelectorAll('.cursor');for(var i=0;i<cs.length;i++)cs[i].remove();
  g.style.transform='translateY('+(-top)+'px)';
  g.style.setProperty('--a',a);g.style.animationDuration=ms+'ms';
  g.addEventListener('animationend',function(){g.remove()});
  glow.appendChild(g);
}
function scrollBottom(){
  var b=term.scrollTop;term.scrollTop=term.scrollHeight;
  if(term.scrollTop-b>1)afterglow(b,.38,460);
}
function trim(box,max){while(box.childElementCount>max)box.firstElementChild.remove()}

/* ---------- typing engine ---------- */
function UP(t){return TELE.on?ttPrint(t):PROFILE.up(t)}
var SINK=null,STDIN=null,STATUS=0,HOLD=false,held=null,BAUD=0; /* where output goes; what a command reads; $?; ^S; stty */
var ERRSINK=null,GLASS={},PREV=0; /* where error lines go (null or GLASS: the glass); PREV: $? as it was when this command started */
function plain(s){return String(s).replace(/\u0003([^\u0004]*)(\u0004|$)/g,'$1').replace(/\u0005[\s\S]?/g,'').replace(/[\u0001-\u0004]/g,'')}
function typeLine(text,cls,cb,opt){
  opt=opt||{};
  return queue(function(){return new Promise(function(res0){
    var gen=GEN,burst=1,side=ASIDE,job=ASIDE&&ASIDE.job,res=res0,own=inner&&inner.proc; /* side: whose line this is, even when its turn comes later; own: the foreground pipeline's */
    text=typeof text==='function'?text():text; /* a function = text worked out when its turn comes (ping) */
    if(cls==='err')STATUS=1;
    var to=cls!=='err'?SINK:ERRSINK!==GLASS?ERRSINK:null; /* a pipe or a file; errors still go to the glass, unless 2>file or 2>&1 */
    if(to){
      if(to.pipe&&to.pipe.gone){if(!to.broke)pipeBroke(to);if(cb)cb();res();return} /* its reader has gone: this write gets SIGPIPE */
      var l=' '.repeat(opt.indent||0)+(opt.pre||'')+plain(text);
      if(to.open&&to.length)to[to.length-1]+=l;else to.push(l); /* after a line left open (echo -n): this goes on in it */
      to.open=!!opt.open;to.w=(to.w||0)+1; /* w: the writes made to it */
      if(cb)cb();res();return;
    }
    if(glassBusy(job)){GL.wait.push({job:job,go:go});return}go(); /* one line at a time on the glass between a background job and the rest */
    function gone(){return job?job.dead:own&&own.job?own.job.dead:gen!==GEN} /* killed, or ^C */
    function go(){try{go1()}catch(e){res();throw e}} /* whatever goes wrong, the glass is let go: the lines waiting for it still come */
    function go1(){
    var freed=false;GL.n++;if(job)GL.bg++;
    res=function(){if(freed)return;freed=true;GL.n--;if(job)GL.bg--;glassNext();res0()};
    if(gone()){res();return}
    text=UP(text);
    var above=side&&bufNode?bufNode.parentNode:null,more=!above&&OPEN&&OPEN===out.lastElementChild?OPEN:null; /* an aside's line goes in above the one being typed in; more: the line left open, which this goes on in */
    var d=more||document.createElement('div'),host=d;OPEN=null;if(more&&JOIN===more)JOIN=null;
    if(!more)d.className='line'+(cls?' '+cls:'')+(opt.row?' row':'');
    /* indent: left margin for the whole line; hang: extra margin for wrapped continuation lines only */
    if(opt.indent||opt.hang){d.style.paddingLeft=((opt.indent||0)+(opt.hang||0))+'ch';if(opt.hang)d.style.textIndent=(-opt.hang)+'ch'}
    if(opt.href){host=document.createElement('a');host.href=opt.href;
      if(!/^mailto:/i.test(opt.href)){host.target='_blank';host.rel='noopener'}d.appendChild(host)}
    var pre=opt.pre?UP(opt.pre):'',t=document.createTextNode(pre);host.appendChild(t);
    if(more)d.appendChild(cursor);else     if(above&&!above.cut)out.insertBefore(d,above);else if(above)out.appendChild(d);else{d.appendChild(cursor);out.appendChild(d)} /* below a read that goes on in a line cut short: the carriage stayed there */
    trim(out,240);
    var at=host===d&&!above?cursor:null; /* new text goes before the cursor; a link has no cursor inside it, nor a line typed above */
    var sp=opt.speed||1,i=0,crlf=false,col=TELE.on?(more?d.textContent.length-(cursor.parentNode===d?cursor.textContent.length:0):(opt.indent||0)+pre.length):0; /* col: where the teletype's carriage is */
    function here(){return at&&at.parentNode===host?at:null} /* a prompt that came up meanwhile has the cursor now */
    function step(){try{step1()}catch(e){res();throw e}}
    function step1(){
      if(gone()){res();return}
      if(HOLD){held=step;return}
      if(i>=text.length){
        if(TELE.on&&!opt.open&&!crlf){crlf=true;ttReturn();setTimeout(step,TT_NL);return} /* the newline goes out as CR LF, and cr1 waits for the carriage */
        scrollBottom();
        announce(pre+plain(text.replace(/\u0003[^\u0004]*(\u0004|$)/g,' ')));
        if(opt.open&&!above&&d===out.lastElementChild)OPEN=JOIN=d; /* echo -n: what comes next, and the prompt, go on in this line */
        if(cb)cb();res();return;
      }
      var ch=text.charAt(i++);
      if(ch==='\u0003'){ /* a squeezable gap (mail rows, self-test dots): shrinks to fit narrow glass */
        var j=text.indexOf('\u0004',i);if(j<0)j=text.length;
        var g=document.createElement('span');g.className='gap';
        g.dataset.n=j-i;g.dataset.f=text.charAt(i)||' ';g.dataset.w=text.replace(/[\u0001-\u0004]/g,'').length;
        host.insertBefore(g,here());squeeze(g);
        t=document.createTextNode('');host.insertBefore(t,here());
        i=j+1;step();return;
      }
      if(ch==='\u0005'){ /* \u0005 and a hex digit: what follows is in that colour (.k0 to .kf, which a machine's CSS gives); with anything else, plain again */
        var k=text.charAt(i++).toLowerCase();t=document.createTextNode('');
        if(/^[0-9a-f]$/.test(k)){var ks=document.createElement('span');ks.className='k'+k;ks.appendChild(t);host.insertBefore(ks,here())}
        else host.insertBefore(t,here());
        step();return;
      }
      if(ch==='\u0001'||ch==='\u0002'){ /* ~~struck~~ text: start or end an <s> run */
        t=document.createTextNode('');
        if(ch==='\u0001'){var s=document.createElement('s');s.appendChild(t);host.insertBefore(s,here())}
        else host.insertBefore(t,here());
        step();return;
      }
      if(TELE.on&&ch==='\u0007'){ttBell();setTimeout(step,TT_CH);return} /* BEL rings the teletype's bell */
      if(TELE.on&&ch==='\t'){text=text.slice(0,i)+' '.repeat(ttTab(col)-1)+text.slice(i);ch=' '} /* XTABS: the spaces, each a character's time */
      if(TELE.on&&ch!=='\n'){var nd=ttPut(t.data,ch,col);if(nd!==t.data)t.data=nd;col++} /* the right margin: the driver still counts */
      else{if(t.length>=256&&!TELE.on&&t.parentNode===host){t=document.createTextNode('');host.insertBefore(t,here())}t.data+=ch;if(TELE.on)col=0} /* a long line in pieces: each character then costs the same, not more as the line grows */
      if(BAUD&&burst>1){burst--;step();return} /* a real line speed: no need to scroll for what nobody will see */
      if(i<2048||!(i&7))scrollBottom(); /* past 2048 characters, every 8th: each look at the height lays the whole line out again */
      if(TELE.on)ttStrike(ch);else if(ch!==' ')click(.194);
      if(own&&own.job){step();return} /* ^Z came in the middle of it: what was already sent comes out */
      if(TELE.on){setTimeout(step,TT_CH);return} /* ten characters a second, whatever stty says the line runs at */
      if(BAUD){ /* ten bits a character, drawn a few at a time */
        burst=Math.max(1,Math.round(BAUD/500));
        setTimeout(step,burst*10000/BAUD);
        return;
      }
      setTimeout(step,(ch===' '?.35:1)*(14+Math.random()*38)*sp/PROFILE.speed);
    }
    var w=(opt.hold||0)+(TELE.on?Math.max(0,TELE.free-Date.now()):0); /* the teletype first finishes echoing what was typed */
    if(w)setTimeout(step,w);else step();
    }
  })});
}
var GL={n:0,bg:0,wait:[]}; /* lines typing on the glass now, how many of them a background job's, and those waiting their turn */
function glassBusy(job){return job?GL.n:GL.bg} /* a job's line waits for any line, the rest only for a job's */
function glassNext(){while(GL.wait.length&&!glassBusy(GL.wait[0].job))GL.wait.shift().go()}
function say(lines){ /* lines.open: the last one has no newline after it (a file or a pipe that ended without one), so it is left open */
  lines.forEach(function(l,i){var x=lineOf(l);typeLine(x[0],x[1],null,lines.open&&i===lines.length-1?Object.assign({},x[2],{open:true}):x[2])});
}
function charBox(host){ /* the size of ten characters in this element */
  var p=document.createElement('span');p.textContent='0000000000';
  p.style.cssText='position:absolute;visibility:hidden;white-space:pre';
  host.appendChild(p);var r=p.getBoundingClientRect();p.remove();
  return r;
}
function cols(){ /* how many characters fit on one line of the glass right now */
  var cw=charBox(out).width/10;
  var cs=getComputedStyle(out),w=out.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight);
  return cw>0?Math.floor(w/cw+.01):999;
}
function inColumns(names){ /* as many columns as fit on the glass, reading down, two spaces apart */
  var w=names.reduce(function(m,x){return Math.max(m,x.length)},0)+2,c=Math.max(1,Math.floor(cols()/w)),rows=Math.ceil(names.length/c),R=[];
  for(var r=0;r<rows;r++){
    var l='';
    for(var k=r;k<names.length;k+=rows)l+=k+rows<names.length?names[k].padEnd(w):names[k];
    R.push(l);
  }
  return R;
}
function squeeze(g,c){ /* shrink a gap (never below 2 characters) until its row fits */
  var over=Math.max(0,+g.dataset.w-(c||cols())),n=Math.max(2,+g.dataset.n-over);
  if(g.textContent.length!==n)g.textContent=(g.dataset.f||' ').repeat(n);
}
function refit(){ /* rows already printed re-fit on rotate/resize; not while a full-screen program hides them */
  var gs=out.querySelectorAll('.gap');if(!gs.length||out.style.display==='none')return;
  var c=cols();for(var i=0;i<gs.length;i++)squeeze(gs[i],c);
}
window.addEventListener('resize',refit);
var MODE='shell',JOIN=null,OPEN=null; /* shell | login | password (password input is not echoed). JOIN: the line the next prompt goes on in (interrupt); OPEN: a line of output left open (echo -n), which the next output goes on in */
function showPrompt(p,mode){
  MODE=mode||'shell';OPEN=null; /* what comes after the prompt and what is typed starts a line of its own */
  if(p)announce(UP(p)); /* login: and Password: ask for something; the shell prompt is just noise */
  var d=JOIN&&JOIN===out.lastElementChild?JOIN:document.createElement('div');d.className='line';d.cut=d===JOIN&&!!d.attnCut;JOIN=null; /* after the text cut short, when nothing came between; cut: by an attention (ATTN OFF), not an echo -n */
  if(MODE!=='read')HIDE=false;
  bufNode=document.createTextNode(shownBuf());bufTail=document.createTextNode(''); /* bufTail: what is typed after the caret, beyond the cursor */
  d.appendChild(document.createTextNode(UP(p==null?(DASH&&BSH.length?(ST.user==='root'?'# ':'$ '):RP?PROFILE.rootPrompt:shTop()?'$ ':promptFn?promptFn():PROFILE.prompt):p)));d.appendChild(bufNode);d.appendChild(cursor);d.appendChild(bufTail);
  if(TELE.on){ttStrikes(bufNode.previousSibling.data);bufNode.data=shownBuf()} /* typeahead, echoed from where the prompt leaves the carriage */
  else renderBuf(); /* typeahead with the caret moved back: the cursor where it is */
  out.appendChild(d);trim(out,240);term.classList.add('idle');scrollBottom();
}
var promptFn=null; /* a machine whose prompt changes as you go */
function prompt(p,mode){queue(function(){return ttFree(function(){shellPrompt(p,mode)})},true)}
function ttFree(fn){ /* fn once the teletype's carriage is back from a RETURN */
  var w=TELE.on?TELE.free-Date.now():0;
  if(w>0)return new Promise(function(r){setTimeout(r,w)}).then(fn);
  fn();
}
function oops(who,x,n,old){ /* a file that would not open: the old wording, or Berkeley's where the machine asks for it */
  typeLine(!PROFILE.perror?old:(who?who+': ':'')+x+': '+(!n?'No such file or directory':n.prot?'Permission denied':n.type==='d'?'Is a directory':'Not a directory'),'err');
}
function oopsW(who,x,old){ /* the same for a file that could not be made: no such folder, or not allowed there. old: the V7 wording, which 4.3BSD's sh keeps for a redirection */
  var up=String(x).replace(/\/+[^\/]*$/,'')||'/';
  if(immutable(norm(x),who!=='mkdir')){notPermitted(who,x);return}
  if(PROFILE.dos&&!PROFILE.dcl&&!who){typeLine('File creation error','err');return} /* COMMAND.COM's redirection: no room, or a read-only file there */
  typeLine(!PROFILE.perror||!who&&old&&!CSH&&!PROFILE.bash?old:(who?who+': ':PROFILE.bash?bashAt():'')+x+': '+(x.indexOf('/')<0||find(up)?'Permission denied':'No such file or directory'),'err');
}
function tryHelp(me,msg,st,now){ /* a GNU program's usage error: what is wrong, where to look, and the status (queued, unless now; none if st is undefined) */
  typeLine(me+': '+msg,'err');typeLine("Try '"+me+" --help' for more information.",'err');
  if(st!==undefined){if(now)STATUS=st;else queue(function(){STATUS=st})}
  return null;
}
function readKey(p,trap){ /* one keypress, no return needed. Call it from inside a queued step.
                            ^C stops the command, unless trap: then the program gets it as C-c */
  ttyWant('key'); /* a key from /dev/null: none ever comes */
  pipeWait();
  return new Promise(function(res){
    var h=hold(),got=function(k){
      if(k.length!==1&&k!=='Enter'&&k!=='C-c')return;
      KEYS=null;letGo(h);
      if(k==='C-c'&&!trap){leavePrompt();interrupt();res(k);return}
      if(k.length===1)atCursor(TELE.on?ttPrint(k):k);
      leavePrompt();
      res(k);
    };
    h.show=function(){showPrompt(p==null?'':p,'read');KEYS=got};
    h.hide=h.kill=function(){if(KEYS===got){KEYS=null;leavePrompt()}};
    h.show();
  });
}
/* What has the terminal now, a read or a full screen: ^Z puts it aside with its job (hide) and fg gives it back (show); a kill ends it */
var TTYH=null;
function hold(){var h={owner:owner()||FGJOB||FGP};TTYH=h;return h} /* whose it is: the step's job or foreground pipeline, else (in a promise after a step, as input's reads are) the foreground job's */
function letGo(h){if(TTYH===h)TTYH=null} /* done with the terminal */
function owns(job,h){return !!h&&!!h.owner&&jobOf(h.owner)===job}
var HIDE=false,READ=null,TRAP=false,INT='\u0003'; /* a program is waiting for a line from the keyboard */
function readLine(p,trap,hidden){ /* one line from the keyboard, or null at ^D or ^C. Call it from inside a queued step.
                              trap: the program deals with ^C itself, and gets INT */
  if(ttyWant('input')||pipeWait())return Promise.resolve(null); /* a background job's /dev/null; a writer waiting here lets its reader read */
  return new Promise(function(res){
    var h=hold(),got=function(v){letGo(h);res(v)};
    h.show=function(){READ=got;TRAP=!!trap;HIDE=!!hidden;showPrompt(p==null?'':p,'read')};
    h.hide=h.kill=function(){if(READ===got){READ=null;leavePrompt()}};
    h.show();
  });
}
function ask(p,then,trap,hidden){ /* readLine, then carry on with what was typed */
  var l;
  queue(function(){return readLine(p,trap,hidden).then(function(x){l=x})});
  queue(function(){return then(l)});
}
/* The glass as a screen: a program draws whole lines, and every key comes to it. Used by vi. */
var KEYS=null;
function fullscreen(keys,onResize,redraw){ /* redraw: draws it again as it is (the view dragged aside); onResize if not given */
  ttyWant('output');
  var el=document.createElement('div');el.id='full';
  out.style.display='none';term.classList.remove('idle');term.appendChild(el);
  var edge=['l','r'].map(function(x){ /* faint marks at a side where the view cuts content off */
    var d=document.createElement('div');d.className='edge '+x;d.hidden=true;d.setAttribute('aria-hidden','true');
    d.textContent=x==='l'?'\u2039':'\u203a';term.parentNode.appendChild(d);return d;
  });
  /* content wider than the glass: a sideways drag pans the view, and the next key or a resize goes back to following the cursor */
  var U=-1,cw=8,view={at:0,max:0},next=null,drag=null,glide=0;
  var mine=function(k){if(U>=0){follow();again()}keys(k)},h=hold(),shut=false;KEYS=mine;
  h.hide=function(){h.off=true;if(KEYS===mine)KEYS=null;el.remove();edge.forEach(function(d){d.hidden=true});out.style.display='';term.scrollTop=term.scrollHeight;T.forEach(halt)}; /* off the glass, kept as it is: a stopped process, whose timers wait */
  h.show=function(){if(shut)return;h.off=false;T.forEach(arm);term.appendChild(el);out.style.display='none';term.classList.remove('idle');KEYS=mine;size();again()};
  h.kill=function(){S.close()};h.out=true;
  redraw=redraw||onResize;
  var said='',T=[],S={
    rows:24,cols:80,
    pan:function(want,max,cx){ /* the first column shown of content wider than the glass: want (where the program follows the cursor)
      unless the visitor has dragged the view aside. max: the furthest it goes; cx: the cursor's column in the content, -1 if not in it */
      max=Math.max(0,max);
      var at=U<0?want:Math.min(max,Math.round(U));
      next={at:at,max:max,off:U>=0&&cx>=0&&(cx<at||cx>=at+S.cols)};
      return at;
    },
    draw:function(lines,r,c){
      var i;
      view=next||{at:0,max:0};next=null;
      if(view.off)r=-1; /* the cursor is out of the dragged view */
      edge[0].hidden=!(view.at>0);edge[1].hidden=!(view.at<view.max);
      el.style.touchAction=view.max>0?'pan-y pinch-zoom':''; /* a sideways drag is the engine's only when there is a view to pan */
      for(i=0;i<lines.length;i++){
        var was=el.children[i];
        if(was&&i!==r&&sameRow(was,lines[i]))continue;
        var d=document.createElement('div');d.className='line';
        if(i===r){
          var t=lines[i].padEnd(c),cu=document.createElement('span');cu.className='fcur';
          d.appendChild(document.createTextNode(t.slice(0,c)));
          cu.textContent=t.charAt(c)||' ';
          d.appendChild(cu);
          d.appendChild(document.createTextNode(t.slice(c+1)));
        }
        else d.textContent=lines[i];
        if(was)el.replaceChild(d,was);else el.appendChild(d);
      }
      while(el.children.length>lines.length)el.lastChild.remove();
    },
    grid:function(){ /* a blank screen, to write characters into */
      var C=[];
      for(var i=0;i<S.rows;i++)C.push(new Array(S.cols).fill(' '));
      return C;
    },
    drawGrid:function(C,r,c){S.draw(C.map(function(row){return row.join('').trimEnd()}),r,c)},
    say:function(m){if(m!==said){said=m;announce(m)}},
    fit:function(cols,rows,o){ /* smaller type for the whole cols x rows where it stays readable (o.min, 9px); o.clamp shrinks to o.min regardless */
      o=o||{};var min=o.min||9;
      el.style.fontSize='';measure();
      var b=parseFloat(getComputedStyle(el).fontSize),f=Math.min(b*S.cols/cols,b*S.rows/rows)*.995;
      if(f<b&&(o.clamp||f>=min)){el.style.fontSize=Math.max(f,min)+'px';measure()}
    },
    after:function(ms,fn){ /* a program's own timers: a throw in one ends the program as any throw does, and close stops them all. ^Z holds them */
      var t={ms:ms,fn:function(){T.splice(T.indexOf(t),1);guard(fn)}};T.push(t);if(!h.off)arm(t);else t.left=ms;return t;
    },
    every:function(ms,fn){var t={every:1,ms:ms,fn:function(){guard(fn)}};T.push(t);if(!h.off)arm(t);return t},
    cancel:function(t){
      var i=T.indexOf(t);if(i<0)return;
      T.splice(i,1);halt(t);
    },
    onThrow:null,
    close:function(){
      if(shut)return;shut=true;letGo(h);
      while(T.length)S.cancel(T[0]);
      if(KEYS===mine)KEYS=null;follow();window.removeEventListener('resize',size);
      if(window.visualViewport)visualViewport.removeEventListener('resize',size);
      el.remove();edge.forEach(function(d){d.remove()});if(!h.off)out.style.display='';refit();
      term.scrollTop=term.scrollHeight;
    }
  };
  function guard(fn){try{fn()}catch(e){if(S.onThrow)S.onThrow(e);else throw e}}
  function arm(t){if(t.id!=null)return;if(t.every)t.id=setInterval(t.fn,t.ms);else{var ms=t.left!=null?t.left:t.ms;t.due=performance.now()+ms;t.id=setTimeout(t.fn,ms)}}
  function halt(t){if(t.id==null)return;if(t.every)clearInterval(t.id);else{clearTimeout(t.id);t.left=Math.max(0,t.due-performance.now())}t.id=null}
  function sameRow(d,t){ /* against the row itself: a program may have marked it up since */
    var k=d.firstChild;
    return k?d.childNodes.length===1&&k.nodeType===3&&k.data===t:!t;
  }
  function measure(){
    var r=charBox(el),cs=getComputedStyle(el);
    var lh=parseFloat(cs.lineHeight)||r.height||16;
    cw=r.width/10;
    var w=el.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight);
    var h=term.clientHeight-parseFloat(cs.paddingTop)-parseFloat(cs.paddingBottom);
    S.cols=Math.max(20,cw>0?Math.floor(w/cw+.01):80);
    S.rows=Math.max(5,Math.floor(h/lh+.01));
  }
  function size(){follow();measure();if(onResize&&KEYS)onResize()}
  function again(){if(KEYS&&redraw)redraw()}
  function follow(){U=-1;drag=null;cancelAnimationFrame(glide)}
  function to(u){ /* the view dragged to column u */
    U=Math.max(0,Math.min(view.max,u));
    if(Math.round(U)!==view.at)again();
    return U>0&&U<view.max;
  }
  el.addEventListener('touchstart',function(e){
    cancelAnimationFrame(glide);drag=null;
    if(view.max<=0||e.touches.length!==1)return;
    var t=e.touches[0];drag={x:t.clientX,y:t.clientY,on:false,px:t.clientX,t:e.timeStamp,v:0};
  },{passive:true});
  el.addEventListener('touchmove',function(e){
    if(!drag)return;
    var t=e.touches[0],dx=t.clientX-drag.x,dy=t.clientY-drag.y;
    if(!drag.on){ /* sideways, or it is the glass's own vertical scroll */
      if(Math.abs(dy)>=Math.abs(dx)){if(Math.abs(dy)>8)drag=null;return}
      if(Math.abs(dx)<8)return;
      drag.on=true;drag.x=t.clientX;drag.from=view.at;
    }
    if(e.cancelable)e.preventDefault();
    to(drag.from-(t.clientX-drag.x)/cw);
    var dt=e.timeStamp-drag.t;
    if(dt>0)drag.v=.7*(drag.px-t.clientX)/cw/dt+.3*drag.v; /* columns a millisecond */
    drag.px=t.clientX;drag.t=e.timeStamp;
  },{passive:false});
  function drop(e){
    var d=drag;drag=null;
    if(!d||!d.on)return;
    if(e.cancelable)e.preventDefault(); /* a drag is not a tap: no keyboard */
    if(e.timeStamp-d.t>80||calm.matches||document.documentElement.classList.contains('lite'))return; /* held still, or no motion wanted */
    var v=d.v,last=performance.now();
    glide=requestAnimationFrame(function step(now){ /* a little momentum */
      var dt=Math.max(0,Math.min(50,now-last));last=now;
      if(to(U+v*dt)&&Math.abs(v*=Math.pow(.99,dt))>.003)glide=requestAnimationFrame(step);
    });
  }
  el.addEventListener('touchend',drop);el.addEventListener('touchcancel',drop);
  measure();
  window.addEventListener('resize',size);
  if(window.visualViewport)visualViewport.addEventListener('resize',size); /* a phone keyboard opening or changing height */
  return S;
}
function program(make,o){ /* a full-screen program: make(S,done) returns its {feed,draw}, and resize if that differs from draw.
   o.tty: its name, and it refuses a pipe; o.fit: [cols,rows] it is fitted to before make and at each resize (o.min, o.clamp as S.fit) */
  o=o||{};
  if(o.tty&&SINK){typeLine(o.tty+': needs a terminal','err');return}
  var who=CURRENT,crashed=false;
  queue(function(){
    return new Promise(function(res){
      var V,S;
      function crash(e){if(crashed)return;console.error(e);crashed=true;S.close();res()} /* never leave a dead screen up */
      function fit(){if(o.fit)S.fit(o.fit[0],o.fit[1],o)}
      S=fullscreen(function(k){try{V.feed(k)}catch(e){crash(e)}},function(){try{fit();if(V.resize)V.resize();else V.draw()}catch(e){crash(e)}},function(){try{V.draw()}catch(e){crash(e)}});
      S.onThrow=crash;
      fit();
      try{V=make(S,res)}catch(e){crash(e)}
    });
  });
  queue(function(){if(crashed)typeLine(who+': core dumped','err')});
}
function gnuOops(x,n){ /* GNU's wording: head and tail open, then read; sort says which it could not do; the rest name the file */
  var c=CURRENT,why=!n?'No such file or directory':n.prot?'Permission denied':'Is a directory',dir=!!n&&!n.prot;
  typeLine(/^(head|tail)$/.test(c)?c+(dir?": error reading '"+x+"': ":": cannot open '"+x+"' for reading: ")+why:c==='sort'?'sort: '+(dir?'read failed: ':'cannot read: ')+x+': '+why:c+': '+x+': '+why,'err');
}
function unread(n){return n&&n.type==='f'&&!n.prot&&!may(n,'r')?{prot:true,type:'f',name:n.name,parent:n.parent}:n} /* a file whose mode does not let who is logged in read it: as a locked one, to those that open it to read */
function input(names,done){ /* the lines a command works on: named files, else its pipe or <, else the keyboard */
  if(names.length){
    var L=[];
    names.forEach(function(x){
      var n=unread(find(x));
      if(!n||n.type==='d'||n.prot)PROFILE.bash?gnuOops(x,n):oops('',x,n,CURRENT+": can't open "+x);
      else{var T=textOf(n),J=L.open&&T.length?L.slice(0,-1).concat([L[L.length-1]+T[0]],T.slice(1)):L.concat(T);J.open=T.length?T.open:L.open;L=J} /* cat a b: b goes on in a's last line when a has no newline at its end */
    });
    done(L);
    return;
  }
  if(STDIN){var R=STDIN.splice(0);R.open=!!STDIN.open&&R.length>0;STDIN.open=false;done(R);return} /* it reads the rest: a read after it, or the next round of a read loop, finds nothing */
  var got=[];
  queue(function(){
    return (function more(){return readLine().then(function(l){if(l===null)return;got.push(l);return more()})})();
  });
  queue(function(){done(got)});
}

/* ---------- shell state ---------- */
var OWNER=PROFILE.owner;
var HOME0=PROFILE.home||PROFILE.homes+'/'+PROFILE.user;
var ST={owner:OWNER,user:PROFILE.user,home:HOME0,cwd:HOME0,site:SITE,hostname:PROFILE.host,domain:PROFILE.domain,login:now()};
var DAYS=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],MONS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function p2(x){return String(x).padStart(2,'0')}
function now(){ /* the time of day, moved to the machine's year (February 29 becomes the 28th in a non-leap year) */
  var n=new Date(),y=PROFILE.year,d=n.getDate();
  if(n.getMonth()===1&&d===29&&new Date(y,1,29).getMonth()!==1)d=28;
  return new Date(y,n.getMonth(),d,n.getHours(),n.getMinutes(),n.getSeconds());
}
function tz(){
  try{var q=new Intl.DateTimeFormat('en-US',{timeZoneName:'short'}).formatToParts(new Date());
    for(var i=0;i<q.length;i++)if(q[i].type==='timeZoneName')return q[i].value}catch(e){}
  return '';
}
function monDay(d){return MONS[d.getMonth()]+' '+String(d.getDate()).padStart(2,' ')}
function short(d){return monDay(d)+' '+p2(d.getHours())+':'+p2(d.getMinutes())}
function ctime(d){return DAYS[d.getDay()]+' '+short(d)+':'+p2(d.getSeconds())}
var FD=(function(){var d=new Date(ST.login.getTime()-864e5);d.setHours(21,41,0,0);return d})(); /* home files: last night */
var SD=(function(){ /* system files: the machine's install date (installed: 1979-01-01 00:01) */
  var m=PROFILE.installed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:\s+(\d{1,2}):(\d{2}))?/);
  return m?new Date(+m[1],m[2]-1,+m[3],+(m[4]||0),+(m[5]||0)):new Date(PROFILE.year,0,1);
})();
function lsdate(d){ /* as ls does it: older than six months shows the year instead of the time */
  return ST.login-d>15552e6?monDay(d)+'  '+d.getFullYear():short(d);
}

/* ---------- file system: the machine builds the system folders; site files live in home ---------- */
function mk(type,name,o){
  var n={type:type,name:name,owner:OWNER,date:FD,prot:false,bin:false,body:null,size:0,mode:null,dev:null,
    kids:type==='d'?Object.create(null):null,parent:null};
  return Object.assign(n,o);
}
var ROOT=mk('d','',{owner:'root',date:SD});ROOT.parent=ROOT;
function parts(p){return p.split('/').filter(Boolean)}
function put(abs,type,o){ /* create a node, making any missing parent folders */
  var s=parts(PROFILE.fold(abs)),n=ROOT,i,k;
  if(!s.length)return ROOT;
  for(i=0;i<s.length-1;i++){
    k=n.kids[s[i]];
    if(!k||k.type!=='d'){k=n.kids[s[i]]=mk('d',s[i],{owner:n.owner,date:n.date});k.parent=n}
    n=k;
  }
  var last=s[s.length-1],ex=n.kids[last];
  if(ex&&ex.type==='d'&&type==='d')return Object.assign(ex,o);
  ex=n.kids[last]=mk(type,last,o);ex.parent=n;return ex;
}
function home(p){return p.charAt(0)==='/'?p:p.slice(0,2)==='~/'?ST.home+p.slice(1):ST.home+'/'+p}
function norm(p){ /* absolute path; handles ~, . and .. */
  p=PROFILE.fold(p);
  if(PROFILE.dos)p=p.replace(/^[a-z]:/,'').replace(/\\/g,'/');
  if(PROFILE.noUnix&&(p==='~'||p.slice(0,2)==='~/'))p=ST.home+p.slice(1); /* the Unix shells work ~ out themselves, where they had it */
  var s=p.charAt(0)==='/'?[]:parts(ST.cwd);
  parts(p).forEach(function(x){if(x==='..')s.pop();else if(x!=='.')s.push(x)});
  return '/'+s.join('/');
}
function pathOf(n){var s=[];while(n!==ROOT){s.unshift(n.name);n=n.parent}return '/'+s.join('/')}
function find(p,exact,locks,nofollow,hops){ /* node or null; nobody gets through a locked folder, nor one whose mode keeps them from searching it.
                           exact (for building the tree): full names only, locks ignored, unless locks. A symbolic link on the way is
                           followed (namei), from the folder it is in; the last name's too, unless nofollow (lstat). Too many: ELOOP */
  var s=parts(norm(p)),n=ROOT;
  for(var i=0;i<s.length;i++){
    if(n.type!=='d'||((n.prot||!may(n,'x'))&&(!exact||locks)))return null;
    var k=has(n.kids,s[i])?n.kids[s[i]]:null;
    if(!k&&!exact&&i===s.length-1){ /* cat photo01 finds photo01.pic */
      var like=Object.keys(n.kids).sort().filter(function(x){return x.charAt(0)!=='.'&&x.split('.')[0]===s[i]})[0];
      if(like!==undefined)k=n.kids[like];
    }
    if(!k)return null;
    if(k.type==='s'&&(i<s.length-1||!nofollow)){
      if((hops||0)>=(PROFILE.bash?40:8))return null; /* Linux's MAXSYMLINKS 40, 4.3BSD's 8 */
      var to=(k.sym.charAt(0)==='/'?k.sym:'/'+s.slice(0,i).join('/')+'/'+k.sym)+(i<s.length-1?'/'+s.slice(i+1).join('/'):'');
      return find(to,exact,locks,nofollow,(hops||0)+1);
    }
    n=k;
  }
  return n;
}
function modeLets(m,n,bit){ /* does mode m give who is logged in r, w or x: the owner's bits for the owner, everyone else's for the rest (an S or T is no x) */
  var c=m.charAt((n.owner===ST.user?1:7)+'rwx'.indexOf(bit));
  return c!=='-'&&c!=='S'&&c!=='T';
}
function may(n,bit){ /* does the mode let who is logged in r, w or x it (Unix); root may */
  return !OWNED||!n.mode||isRoot()||modeLets(n.mode,n,bit);
}
function shut(p){ /* is the way to p barred, as namei finds it before it looks for the name: a locked folder, or one who is logged in may not search */
  var s=parts(norm(p)),n=ROOT;
  for(var i=0;i<s.length;i++){
    if(n.type!=='d')return false;
    if(n.prot||!may(n,'x'))return true;
    if(i===s.length-1||!has(n.kids,s[i]))return false;
    n=n.kids[s[i]];
    if(n.type==='s'&&!(n=find('/'+s.slice(0,i+1).join('/'),true)))return false;
  }
  return false;
}
function whyNot(p,plain){ /* why stat(p) failed: a locked folder on the way, a file used as a folder, or nothing there. plain: the first or the last only, as the commands that look no further word it */
  if(shut(p))return 'Permission denied';
  if(plain)return 'No such file or directory';
  var s=norm(p).split('/').filter(Boolean);
  for(var i=1;i<s.length;i++){var n=find('/'+s.slice(0,i).join('/'));if(!n)break;if(n.type!=='d')return 'Not a directory'}
  return /\/$/.test(p)&&find(p)?'Not a directory':'No such file or directory';
}
function named(p){return find(p,true,true)} /* what a program opens by its full name: not through a locked folder either */
function textOf(n){var B=body(n)||[],T=B.map(function(l){return plain(lineOf(l)[0])});T.open=!!B.open&&T.length>0;return T} /* open: no newline at its end */
function isScript(n){return n.type==='f'&&/x/.test(n.mode||'')&&n.body}
function dirOf(abs){return abs.slice(0,abs.lastIndexOf('/'))||'/'}
function nameOf(p){return p.replace(/\/+$/,'').split('/').pop()} /* the last name in a path, a / after it or not */
function unlink(abs){delete find(dirOf(abs),true).kids[abs.split('/').pop()]} /* the name abs (a symbolic link's own) goes from its folder */
function symlink(at,to,mode){put(at,'s',{sym:to,owner:ST.user,date:now(),mode:mode,size:to.length})} /* a symbolic link at at to to, its mode as the system makes them */
function sys(p,type,o){return put(p,type,Object.assign({owner:'root',date:SD},o))} /* a file of the system's own */
function hash(s,mod){var h=0;for(var i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))%mod;return h}
function programs(of){ /* a program file for each command that has a path: of(dir,hash) gives its owner and size */
  Object.keys(PATHS).sort().forEach(function(b){
    var dir=PATHS[b];
    sys(dir+'/'+b,'f',of(dir,hash(b,7919)));
  });
}
function chunk(a,n){var o=[];for(var i=0;i<a.length;i+=n)o.push(a.slice(i,i+n));return o} /* into rows of n */
var GLOBRE=new Map(); /* the patterns made so far, by pattern, flags and grammar (brk reads csh's or not); a RegExp without g keeps no state */
function globRe(p,flags){ /* a file name pattern, or case's: * ? and [...] as the shell has them; a backslash is itself */
  var key=(CSH?'c':'s')+(flags||'')+'\u0000'+p,re=GLOBRE.get(key);
  if(re)return re;
  if(GLOBRE.size>=500)GLOBRE.clear();
  re=globRe0(p,flags);GLOBRE.set(key,re);return re;
}
function globRe0(p,flags){
  var o='',b;
  for(var i=0;i<p.length;i++){
    var c=p.charAt(i);
    if(c==='*')o+='.*';
    else if(c==='?')o+='.';
    else if(c==='['&&(b=brk(p,i,false))){o+=b.src;i=b.end}
    else o+=c.replace(/[.+^${}()|\\[\]\/]/g,'\\$&');
  }
  return new RegExp('^'+o+'$',flags);
}
function brk(p,i,bs){ /* the [...] at p[i] as a RegExp: {src, end: where its ] is}, or null when nothing closes it and the [ is itself. bash: a ! or ^
  first takes what is not in it, a ] first (after that) is one of the set, and [:class:]; bs: \x is x. System V's sh: the ! too. V7's sh and 4.3BSD's
  csh (gmatch, Gmatch): no negation, and a ] first ends it. A range that ends before it starts, as z-a, holds nothing */
  var bash=!!PROFILE.bash,j=i+1,neg=false,o='',m;
  function esc(x){return x.replace(/[\\\]\[^-]/g,'\\$&')}
  if(p.charAt(j)==='!'&&(bash||!CSH&&PROFILE.sysv)||bash&&p.charAt(j)==='^'){neg=true;j++}
  for(var first=true;j<p.length;j++,first=false){
    var c=p.charAt(j);
    if(c===']'&&!(first&&bash))return {src:neg?'[^'+o+']':o?'['+o+']':'(?!)',end:j};
    if(bash&&c==='['&&(m=/^\[:(\w+):\]/.exec(p.slice(j)))){o+=POSIXCL[m[1]]||'';j+=m[0].length-1;continue}
    if(bs&&c==='\\'&&j+1<p.length)c=p.charAt(++j);
    if(p.charAt(j+1)==='-'&&j+2<p.length&&p.charAt(j+2)!==']'){
      var hi=p.charAt(j+2);j+=2;
      if(bs&&hi==='\\'&&j+1<p.length)hi=p.charAt(++j);
      if(c<=hi)o+=esc(c)+'-'+esc(hi);
      continue;
    }
    o+=esc(c);
  }
  return null;
}
function isRoot(){return !!RP&&PROFILE.fold(ST.user)===PROFILE.fold(PROFILE.rootName)} /* the super-user now, not someone su'd to from root */
var ATTRS=PROFILE.dos&&!PROFILE.dcl; /* DOS and CP/M: no owners, only a read-only attribute, which anyone may clear */
var OWNED=!PROFILE.noUnix&&!PROFILE.dos; /* the Unix machines: a folder takes what its owner and its mode allow */
var IMM=OWNED&&!!PROFILE.immutable; /* Debian: ro is the immutable attribute (chattr +i), which stops root too */
function mayAlter(n){ /* may who is logged in change, replace or remove this file? root may, but not an immutable one; on DOS and CP/M,
  a file without the read-only attribute; elsewhere, their own, or one anyone may write. The site's files and the system's are someone else's */
  if(!n||n.dev)return true;
  if(IMM&&n.ro)return false;
  if(isRoot())return true;
  if(ATTRS)return !n.ro;
  return n.owner===ST.user||modeOf(n).charAt(8)==='w';
}
function mayWrite(n){ /* may who is logged in open this file to write to it? On Unix, the w bit its mode has for them (the owner's for the owner,
  everyone else's for the rest): an owner's mode 444 stops them too, until they chmod it. Root may, but not an immutable one. Elsewhere, mayAlter */
  if(!OWNED||!n||n.dev)return mayAlter(n);
  if(IMM&&n.ro)return false;
  return isRoot()||modeLets(modeOf(n),n,'w');
}
function unwritable(n){return n.type==='f'&&!n.prot&&!n.dev&&!mayWrite(n)} /* a plain file there that who is logged in may not open to write */
function access(n,bit){ /* access(2), as test -r, -w and -x ask it: what the readers (may), the writers (mayWrite) and exec allow who is logged in.
  Root reads and writes anything but an immutable file, and may run a file with an x bit anywhere in its mode, and search any folder */
  if(!n||n.prot)return false;
  if(bit==='w')return mayWrite(n);
  if(isRoot()||!OWNED)return bit==='r'||n.type==='d'||/x/.test(modeOf(n));
  return modeLets(modeOf(n),n,bit);
}
function isImmutable(n){return IMM&&!!n.ro} /* does this file carry Linux's immutable attribute */
function immutable(abs,write){ /* is it Linux's immutable attribute that stops a change to abs: on the file, or on the folder it is in.
  write: only writing to it, which a folder's attribute stops only for a file not there yet (it guards the folder's names, not their files) */
  if(!IMM)return false;
  var dir=find(dirOf(abs),true),key=abs.slice(abs.lastIndexOf('/')+1);
  var ex=abs!==norm(abs)?find(abs,true):dir&&dir.type==='d'&&has(dir.kids,key)?dir.kids[key]:null; /* the entry in its folder, unless abs has . or .. in it */
  if(write&&ex&&ex!==ROOT)return !!ex.ro;
  return !!(ex&&ex!==ROOT&&ex.ro||dir&&dir.ro);
}
function notPermitted(who,x,to){ /* EPERM, in the words of GNU's tools and bash: what the immutable attribute gets */
  var q="'"+x+"'",t="'"+to+"'",W={mv:'cannot move '+q+' to '+t,cp:'cannot create regular file '+q,touch:'cannot touch '+q,chmod:'changing permissions of '+q,
    rmdir:'failed to remove '+q,mkdir:'cannot create directory '+q,rm:'cannot remove '+q,ln:'failed to create hard link '+q+' => '+t};
  typeLine((who||'bash')+': '+(has(W,who)?W[who]:x)+': Operation not permitted','err');
}
function canWrite(abs){ /* your home folder, or a folder anyone may write in; nothing else, and nothing locked or someone else's */
  var up=dirOf(abs),dir=find(up),ex=find(abs,true,false,true);
  if(ex&&ex!==ROOT&&!mayAlter(ex)&&ex.parent===dir&&ex.name===abs.slice(abs.lastIndexOf('/')+1))return false; /* only its own name: a link the visitor made to it is theirs to remove or rename; writing through it is writeFile's to refuse */
  return mayPut(up,dir);
}
function mayChmod(n,p){return OWNED?isRoot()||n.owner===ST.user&&named(norm(p))===n:canWrite(pathOf(n))} /* chmod(2) on Unix: the file's owner, or root (EPERM else; its folder does not count, but a locked one on the way, p, keeps it from being reached); elsewhere, what canWrite allows */
function mayPut(up,dir){ /* the folder part of canWrite (dir: the folder up names): what writeFile asks, once it has seen to the file itself */
  if(!dir||dir.type!=='d'||dir.prot||IMM&&dir.ro)return false;
  var at=pathOf(dir);
  if(find(up,true)!==dir)return false; /* find's cat photo01 finds photo01.pic is not for making files; a folder reached by a link (Debian's /bin) is */
  if(isRoot()||/^drwxrwxrw[xt]$/.test(dir.mode||'')||ST.home==='/'||at===ST.home)return true;
  return OWNED?dir.owner===ST.user&&modeOf(dir).charAt(2)==='w'&&may(dir,'x'):at.indexOf(ST.home+'/')===0; /* Unix: a folder of yours you may write in, so not the site owner's (dr-xr-xr-x); elsewhere, anything in the home */
}
var DISK=4194304; /* the most a file may hold, in bytes: cat f >> f in a loop fills the disk, not the browser */
function writeFile(p,lines,append,hop){ /* false if it cannot be written */
  var abs=norm(p),ex=find(abs,true),l=!ex&&find(abs,true,false,true);
  if(l&&l.type==='s')return (hop||0)<8&&writeFile(l.sym.charAt(0)==='/'?l.sym:dirOf(abs)+'/'+l.sym,lines,append,(hop||0)+1); /* a link to nothing: open(2) makes what it names */
  if(ex&&ex.dev)return !ex.prot; /* /dev/null and friends swallow it */
  if(ex&&(ex.type==='d'||ex.prot||ex.parent.prot||!mayWrite(ex))||(ex&&OWNED?named(abs)!==ex:!mayPut(dirOf(abs),find(dirOf(abs)))))return false; /* on Unix a file that is there (and reached through no locked folder) takes what the file allows; its folder counts only for making one */
  var old=ex&&append?textOf(ex):[],L=old.open&&lines.length?old.slice(0,-1).concat([old[old.length-1]+plain(lineOf(lines[0])[0])],lines.slice(1)):old.concat(lines); /* after a last line with no newline, what comes goes on in it */
  L.open=lines.length?!!lines.open:old.open;
  if(bsize(L)>DISK){ /* what fits goes in, and the rest is lost, the way a full disk did it */
    for(var i=0,n=0;n+lineOf(L[i])[0].length+1<=DISK;i++)n+=lineOf(L[i])[0].length+1;
    L=L.slice(0,i);L.open=false;
    typeLine(diskFull(),'err');
  }
  if(!ex)ex=put(abs,'f',{body:L,owner:ST.user,date:now()});
  else{ex.body=L;ex.size=0;ex.date=now()}
  WROTE.set(ex,{by:CURRENT,at:++WROTE.n}); /* who wrote it last: the disk-full message names them */
  return true;
}
var WROTE=new WeakMap();WROTE.n=0;
function diskFull(by){ /* by: the program whose write did not fit (else the command now) */
  if(by===undefined)by=CURRENT;
  return PROFILE.diskFull||(PROFILE.dcl?'%SYSTEM-F-EXDISKQUOTA, disk quota exceeded':PROFILE.dos?'Insufficient disk space':
    PROFILE.perror||PROFILE.csh||PROFILE.bash?(by?by+': ':'')+'write error: No space left on device':'no space on dev 6/0'); /* V7's kernel (prdev): root on hp0, block major 6 in conf/c.c */
}
function bsize(L){return L.reduce(function(n,l){return n+lineOf(l)[0].length+1},0)-(L.open&&L.length?1:0)}
function body(n){return typeof n.body==='function'?n.body():n.body}
function fsize(n){
  if(n.type==='d')return 16*(Object.keys(n.kids).length+2);
  if(n.dev)return 0;
  return n.size||(n.body?bsize(body(n)):0);
}
function modeOf(n){
  if(n.mode)return n.mode;
  if(n.type==='d')return n.prot?'drwx------':'drwxr-xr-x';
  return n.prot?'-rw-------':n.bin?'-rwxr-xr-x':'-rw-r--r--';
}
function octMode(n){ /* a file's mode as an octal number, as %o prints st_mode's permission bits: 444, 4755 */
  var m=modeOf(n),v=0;
  for(var i=1;i<10;i++)if(!/[-ST]/.test(m.charAt(i)))v|=1<<(9-i);
  if(/[sS]/.test(m.charAt(3)))v|=2048;if(/[sS]/.test(m.charAt(6)))v|=1024;if(/[tT]/.test(m.charAt(9)))v|=512;
  return v.toString(8);
}
function links(n){return n.type!=='d'?1:2+Object.keys(n.kids).filter(function(k){return n.kids[k].type==='d'}).length}
function longRow(name,n){
  var O=PROFILE.lsOwner,Z=PROFILE.lsSize; /* widths differ by system: 6 and 7 on V7, 8 and 8 at Berkeley */
  var sz=n.dev?(String(n.dev[0]).padStart(3)+','+String(n.dev[1]).padStart(3)).padStart(Z):String(fsize(n)).padStart(Z);
  return [modeOf(n)+(PROFILE.lsTight?'':' ')+String(links(n)).padStart(2)+' '+n.owner.slice(0,O).padEnd(O)+sz+' '+lsdate(n.date)+' '+name+(n.type==='s'?' -> '+n.sym:''),n.prot?'dim':''];
}
function row(l,v){var d=Math.max(2,20-l.length);return l+' \u0003'+'.'.repeat(d)+'\u0004 '+v} /* dot leader squeezes on narrow glass */

/* ---------- commands: built-ins from engine/commands, text commands from the content ---------- */
var CMDS=Object.create(null),PATHS={},NOH={},HELP=[];
var MAN=Object.create(null);
function page(names,what,syn,desc,bugs,sec){
  var F=function(L){return (L||[]).map(function(l){return Array.isArray(l)?[PROFILE.fill(l[0])].concat(l.slice(1)):PROFILE.fill(l)})};
  var p={names:names.join(', '),what:what,syn:syn,desc:F(desc),bugs:F(bugs),sec:sec}; /* sec: the manual section, when the page names one (1 if not) */
  names.forEach(function(n){MAN[n]=p});
  return p;
}
/* the terminal's own words (help, about, fill ...) and the site's text commands: the terminal answers them on every
   machine, so help lists them apart on the machines that have man, and their manual pages say so. A word with a
   program file is the machine's. */
var TERMSAYS='the terminal answers this, not the machine.',OWN=Object.create(null);
function install(n,fn,noh,own){ /* later definitions of the same name win */
  CMDS[n]=fn;NOH[n]=noh;delete PATHS[n];
  if(own)OWN[n]=true;else delete OWN[n];
  HELP=HELP.filter(function(h){return h[0]!==n});
}
PH.defs.forEach(function(d){
  if(typeof d.enabled==='function'&&!d.enabled(PROFILE))return; /* e.g. about, only when there is an about section */
  if(PROFILE.noUnix&&!d.terminal&&/(^|\/)engine\//.test(d.from||''))return; /* terminal: part of the terminal, not the OS */
  var names=(d.names||[]).filter(function(n){return PROFILE.off.indexOf(n)<0});
  if(!names.length||typeof d.run!=='function')return;
  var own=d.terminal&&!d.path;
  names.forEach(function(n){install(n,d.run,!!d.noHelpFlag,own)});
  if(d.path)PATHS[names[0]]=d.path; /* where its program file shows up in the file tree */
  if(d.help&&!d.hidden)HELP.push([names[0],d.help]);
  var man=typeof d.man==='function'?d.man(PROFILE):d.man; /* a page may differ by machine: given the profile */
  if(man)page(names,man.what||'',man.syn||names[0],own?(man.desc||[]).concat(['',TERMSAYS]):man.desc,man.bugs,man.sec);
});
/* Text commands (== command: NAME ==). They cannot take the name of a core command while
   it is running; switch it off first ("commands: -mail") and yours takes its place.
   "commands: -name" also removes the machine's text commands (sudo), but never the site's:
   to remove one of yours, delete it. */
var RESERVED=[];
PH.defs.forEach(function(d){if(d.core&&d.names&&d.names[0])RESERVED.push(d.names[0])});
PROFILE.commands.forEach(function(c){
  var n=c.names.filter(function(x){
    var off=PROFILE.off.indexOf(x)>=0;
    if(RESERVED.indexOf(x)>=0&&!off)return false;
    return c.site||!off;
  });
  if(!n.length)return;
  var fn=function(){say(c.body)};
  n.forEach(function(x){install(x,fn,false,c.site);delete MAN[x]}); /* replaces any built-in of that name, its manual page and program file too */
  if(c.help){
    HELP.push([n[0],c.help]);
    page(n,c.help.toLowerCase(),n[0],[c.help.toLowerCase()+'.'].concat(c.site?['',TERMSAYS]:[])); /* a page made from the help text */
  }
});
Object.keys(PROFILE.man).forEach(function(k){ /* == man: NAME == sections */
  if(has(MAN,k))MAN[k].desc=PROFILE.man[k];
  else page([k],'',k,PROFILE.man[k]);
});
function manPage(n){ /* body text is indented 5 with a real margin, so wrapped lines stay indented */
  var p=MAN[n],I=5;
  function at(t,hang){return [t,'',{indent:I,hang:hang||0}]}
  var L=[n.toUpperCase()+'('+(p.sec||1)+')','','NAME',at(p.names+(p.what?' - '+p.what:''),p.what?p.names.length+3:0),
    '','SYNOPSIS',at(p.syn,p.syn.indexOf(' ')+1)];
  function block(title,lines){
    if(!lines.length)return;
    L.push('',title);
    lines.forEach(function(l){
      var x=lineOf(l),t=x[0];if(!t){L.push('');return}
      var lead=t.match(/^ */)[0].length;t=t.slice(lead);
      var opt=t.match(/^(\S+ {2,})\S/)||t.match(/^(\S+(?: \S+){1,7} {3,})\S/); /* "-l   long listing ..." wraps under its text, and so does "-A, --almost-all   like -a" */
      if(opt&&opt[1].indexOf(' ')<opt[1].search(/ {2}/)&&opt[1].length>40)opt=null; /* not under a long run of words */
      L.push([t,x[1]||'',Object.assign({indent:I+lead,hang:opt?opt[1].length:0},x[2])]);
    });
  }
  block('DESCRIPTION',p.desc);block('BUGS',p.bugs);
  return L;
}

/* ---------- build the file tree ---------- */
var LOGOUT=false;
/* the super-user: nothing is locked, and # is the prompt. Put back at logout, or at exit from su. */
var RP=null,PENDROOT=null;
function setRoot(viaSu){
  if(RP)return;
  RP={user:ST.user,home:ST.home,cwd:ST.cwd,HOME:has(ENV,'HOME')?ENV.HOME:null,gone:ENV[GONE],su:viaSu,bsh:BSH.length,prot:[],al:viaSu?PH.aliases:null,args:ARGS,line:SHLINE}; /* bsh: the Bourne shells already running, which an su's exit leaves; al: the aliases of the shell su was typed in (the new one's go with it) */
  (function walk(n){
    if(n.prot){RP.prot.push(n);n.prot=false}
    if(n.type==='d')Object.keys(n.kids).forEach(function(k){if(n.kids[k]!==n)walk(n.kids[k])});
  })(ROOT);
  ST.user=PROFILE.rootName;ST.home='/';delete ENV.HOME;ENV[GONE]=false; /* su sets HOME to the new user's */
  if(!viaSu)ST.cwd='/';
}
function moved(was,to){ /* a folder moved: anyone standing in it goes with it, including who su left behind */
  [ST,RP].forEach(function(o){
    if(!o)return;
    ['cwd','home'].forEach(function(k){if(o[k]===was||o[k].indexOf(was+'/')===0)o[k]=to+o[k].slice(was.length)});
  });
}
function dropRoot(){
  if(!RP)return;
  ST.user=RP.user;ST.home=RP.home;ST.cwd=RP.cwd;ENV[GONE]=RP.gone;if(RP.HOME!==null)ENV.HOME=RP.HOME;else delete ENV.HOME;if(RP.al)PH.aliases=RP.al;
  if(RP.su){ARGS=RP.args;DLN0+=SHLINE-RP.line} /* su's shell was another process: its $0, and the lines it read are not the shell's below it */
  RP.prot.forEach(function(n){n.prot=true});
  RP=null;
  if(PH.bourne&&PH.bourne.on)grammar(shTop()); /* back to the shell su was typed in */
}
/* ---------- programs that load when first run (Phosphor.later). Script tags, so this works from disk too. ---------- */
var LOADED={},RANH=0,RAND=0; /* hooks and programs already taken up: loads can overlap */
function loadOne(f){ /* a promise of the programs the file defines, or false */
  var src=(CAT?CAT.dir+'/':'')+f;
  if(LOADED[src])return LOADED[src];
  return LOADED[src]=new Promise(function(res){
    var h=PH.hooks.length,d=PH.defs.length,el=document.createElement('script');
    function failed(){delete LOADED[src];el.remove();res(false)}
    el.src=src;el.async=false; /* not async: the files of one program run in the order they were asked for */
    el.onerror=failed;
    el.onload=function(){ /* straight after the file has run, before the next one does */
      if(!PH.seen[src]){failed();return} /* a stray ` or ${ in it, so it never got as far as saying so */
      try{
        var hs=PH.hooks.slice(Math.max(h,RANH)),ds=PH.defs.slice(Math.max(d,RAND));
        RANH=PH.hooks.length;RAND=PH.defs.length;
        var pre=BASE&&hs.length&&new Map();if(pre)tree().forEach(function(n,p){pre.set(p,sig(n))});
        hs.forEach(function(fn){fn(PH)});
        if(pre)tree().forEach(function(n,p){var a=pre.get(p);if(!a||!same(a,n)){BASE.set(p,sig(n));LAST=null}}); /* what a program brings with it is the system's, as if there at boot */
      }catch(e){failed();return}
      res(ds);
    };
    document.body.appendChild(el);
  });
}
function load(files){ /* all at once, run in order; true when every one arrived, and only then are its programs taken up.
   ^C stops the wait, not the loading: it arrives for next time */
  return new Promise(function(r){
    var W=wakeList();
    function done(ok){var i=W.indexOf(wake);if(i>=0)W.splice(i,1);r(ok)}
    function wake(){done(false)}
    W.push(wake);
    Promise.all([].concat(files).map(loadOne)).then(function(got){
      if(got.some(function(ds){return !ds})){done(false);return}
      got.forEach(function(ds){ds.forEach(function(x){ /* only what was listed: its manual page and program file are there already */
        (x.names||[]).forEach(function(n){if(has(CMDS,n)&&PROFILE.off.indexOf(n)<0)CMDS[n]=x.run});
      })});
      done(true);
    });
  });
}
PH.runLater=function(files,def,a,raw,w){
  var name=def.names[0],ok;
  queue(function(){return load(files).then(function(x){ok=x})});
  queue(function(){
    var f=CMDS[name];
    if(!ok||f===def.run){typeLine(def.failed||name+': cannot execute','err');STATUS=1;return}
    CURRENT=name;
    try{f(a,raw,w)}catch(e){console.error(e);typeLine(name+': core dumped','err')}
  });
};
var GONE=Symbol('HOME unset'),ENV={PATH:':/bin:/usr/bin',TERM:'p9',[GONE]:false},CSHV=Object.create(null),CSHW=Object.create(null); /* CSHV: csh's own variables, from set */
Object.assign(PH,{ /* what commands and machine hooks may use */
  profile:PROFILE,st:ST,cmds:CMDS,man:MAN,paths:PATHS,help:function(){return HELP.slice()},own:function(n){return has(OWN,n)},
  hist:function(){return hist.slice()},setHist:function(L){hist=L.slice(-HMAX);hi=hist.length}, /* a shell's history -c, -d or -s */
  setPrompt:function(f){promptFn=f},readKey:readKey,oops:oops,oopsW:oopsW,tryHelp:tryHelp,bashOpts:bashOpts,failed:failed,shvars:CSHV,shwords:CSHW,
  /* what a game keeps between visits, in this browser only; false or null when the browser refuses */
  saved:function(k){try{return JSON.parse(localStorage.getItem('phosphor-9/'+k))}catch(e){return null}},
  save:function(k,v){
    try{
      if(v===null)localStorage.removeItem('phosphor-9/'+k);
      else localStorage.setItem('phosphor-9/'+k,JSON.stringify(v));
      return true;
    }catch(e){return false}
  },
  inUse:function(p){return [ST.cwd].concat(RP?(RP.su?[RP.cwd,RP.home]:[RP.home]):[]).some(function(x){return x===p||x.indexOf(p+'/')===0})},
  su:function(sh,name){setRoot(true);if(RP&&name)ARGS=[name];if(RP&&PH.bourne.on&&sh){RP.sh=sh;grammar(shTop())}}, /* sh: the shell the user's /etc/passwd entry names, 'sh' or 'csh', which su starts; name: its $0 */unsu:function(){if(RP&&RP.su){dropRoot();return true}return false},
  rootHeld:function(){return !!RP}, /* root is held, by su or a root login, whoever the shell says it is now */
  relock:function(on){if(RP)RP.prot.forEach(function(n){n.prot=!!on})}, /* a shell root starts as someone else: root's locks back on, and off again */
  powerOff:function(lines){ /* the end: the picture collapses to a dot, and any key starts it again */
    say(lines||[]);
    queue(function(){
      return new Promise(function(){
        term.classList.remove('idle');
        $('#crt').classList.add('off');
        KEYS=function(){location.reload()};
      });
    });
  },
  effects:function(m){ /* auto, full or lite, remembered in this browser; none: what is in use, and why */
    if(m===undefined)return {mode:FX.mode,lite:document.documentElement.classList.contains('lite'),why:FX.why||''};
    FX.mode=m;PH.save('effects',m===PROFILE.effects?null:m);
    fxApply();fxDetect();
    return m;
  },
  fillGlass:function(on){ /* the glass fills the window; remembered in this browser */
    if(on===undefined)return document.documentElement.classList.contains('fill');
    document.documentElement.classList.toggle('fill',on);
    PH.save('fill',on?true:null);
    window.dispatchEvent(new Event('resize')); /* the glass changed size: everything re-fits */
    return on;
  },
  columns:function(){return cols()},inColumns:inColumns,fullscreen:fullscreen,program:program,ask:ask,sys:sys,hash:hash,ino:function(nm){return hash(nm,9973)+2},programs:programs,chunk:chunk,joinLast:function(){queue(function(){var l=out.lastElementChild;if(l)OPEN=l})}, /* in turn: what is typed next goes on in the glass's last line (after a prompt that ^D, which the tty does not echo, answered) */
  dirOf:dirOf,nameOf:nameOf,unlink:unlink,symlink:symlink,
  ownEnv:function(on){var was=OWNENV;OWNENV=on;return was},envRows:function(){return Object.keys(PH.env).sort().map(function(k){return k+'='+PH.env[k]})},
  piped:function(){return !!SINK},bre:bre,safeRe:safeRe,INT:INT,
  fold:PROFILE.fold,stdin:function(){return STDIN},input:input,readLine:readLine,text:textOf,canWrite:canWrite,mayAlter:mayAlter,mayChmod:mayChmod,mayPut:function(dir){return mayPut(pathOf(dir),dir)},isImmutable:isImmutable,immutable:immutable,notPermitted:notPermitted,writeFile:writeFile,
  status:function(n){STATUS=n},bashAt:function(){return bashAt()},lastStatus:function(){return PREV},globRe:globRe,glob:glob,tilde:tilde,homeVar:homeVar,colonRows:colonRows,passwd:passwd,loop:function(what,n){var own=0;for(var i=LOOPSUB.length-1;i>=0&&LOOPSUB[i]===SUB;i--)own++;var brk=/^(break|continue)$/.test(what);if(brk&&LOOPUP&&SUB===SUBSH&&Math.max(n||1,1)>own){STATUS=0;LOOP='exit';return} /* a ( ) or $( ) in a loop: a break past its own loops ends it, status 0 (dash's loopnest, V7's loopcnt, bash's loop_level in a $( ), which the fork keeps) */if(brk?!own:SUB)return;LOOP=what;LOOPN=n>1?Math.min(n,own)-1:0}, /* n: break n and continue n leave n loops (the innermost n-1 are ended), of those in its own process: echo | while ...; do break 2 leaves only that while */inScript:function(){return SCRIPTS>0},loops:function(){return LOOPD+LOOPUP}, /* how many loops deep the command is, with those of the shell its ( ) or $( ) was forked from */
  args:function(a){if(a)ARGS=a;return ARGS},baud:function(b){if(b!==undefined)BAUD=b;return BAUD},teletype:function(){return TELE.on?TELE:null}, /* the Teletype Model 33's line: lcase, speed */
  teletypeMode:function(on){ /* the teletype command: null where it is not offered; on or off, remembered in this browser */
    if(!TELE.ok)return null;
    if(on!==undefined){TELE.on=!!on;ttGetty();TELE.free=0;PH.save('teletype',on?true:null)}
    return TELE.on;
  },
  env:ENV,runScript:runScript,child:child,keep:keep,exec:execLine,
  bourne:{on:false, /* 4.3BSD's sh (on: the machine has it): run(fn) with its grammar; start() one at the terminal; leave(status): exit or ^D in that one, true if it was */
    run:function(fn){runAs('sh',fn)},bash:function(fn){runAs('bash',fn)},start:function(bash){bourne(true,true,bash)},top:function(){var t=BSH[BSH.length-1];return t&&t.tty?(t.bash?'bash':'sh'):null}, /* top(): the shell at the terminal started last, 'sh', 'bash' (Debian) or null */sh:function(){return !CSH}, /* sh: is it sh's grammar now; bash(fn): fn with bash's (Debian) */
    dash:function(){return DASH},
    shells:function(){return BSH.filter(function(t){return t.tty}).map(function(t){return {bash:t.bash,pid:t.pid,start:t.start}})}, /* the shells started at the terminal, oldest first, for ps: {bash, pid, start} */
    depth:function(){return BSH.length}, /* later(d, env, fn): if a program started since depth d is a shell at the terminal, what its parent goes back to when */
    later:function(d,env,fn){var t=BSH[BSH.length-1];if(BSH.length<=d||!t.tty)return false;if(env)t.was.env=Object.assign({},env);var f0=t.after;t.after=f0?function(){f0();fn()}:fn;return true}, /* it ends: env (if given), then fn() */
    wrapSh:function(){ /* the machine has it, as /bin/sh: sh at the terminal starts one, which exit or ^D ends; sh file and sh -c run theirs with it. The sh it wraps */
      PH.bourne.on=true;var sh=PH.cmds.sh;
      if(sh)PH.cmds.sh=function(a,raw,w){if(!a.length&&!PH.stdin()&&!PH.subshell()&&!PH.inScript()){PH.bourne.start();return}PH.bourne.run(function(){sh(a,raw,w)})};
      return sh;
    },
    leave:function(st){if(!PH.bourne.canLeave())return false;bourne(false);STATUS=st;return true}, /* an su newer than this sh is left first */
    canLeave:function(){return !!(BSH.length&&BSH[BSH.length-1].tty&&!SUB&&!SCRIPTS&&!(RP&&RP.su&&RP.bsh>=BSH.length))}}, /* would leave() end a shell started at the terminal */
  subshell:function(){return SUB>0},subExit:function(a){if(!SUBSH||SUB!==SUBSH)return false;STATUS=a[0]===undefined?PREV:parseInt(a[0],10)||0;LOOP='exit';return true}, /* exit in ( ): that process ends */forked:forked,pidNow:function(){var p=PIDNOW;PIDNOW=null;return p},source:function(){return SOURCE},vars:function(t){return unguard(varsIn(t))},unguard:unguard,moved:moved,
  aliases:PROFILE.aliases.slice(),setAlias:setAlias,jobCmd:jobCmd,jobs:psJobs,stoppedWarn:stoppedWarn,unquote:unquote,has:has,lineOf:lineOf,
  say:say,typeLine:typeLine,pause:pause,queue:queue,aside:aside,asideNow:function(){return !!ASIDE},typed:function(){return kb?kb.value:''},sleep:sleep,click:click,load:load,
  sound:function(on){if(on===undefined)return SND.clicks;if(on&&!actx())return false;SND.clicks=!!on;return true},
  find:find,named:named,may:may,mayWrite:mayWrite,unwritable:unwritable,access:access,octMode:octMode,unread:unread,shut:shut,why:whyNot,modeOf:modeOf,norm:norm,put:put,home:home,pathOf:pathOf,body:body,fsize:fsize,longRow:longRow,
  root:ROOT,fileDate:FD,systemDate:SD,
  ctime:ctime,short:short,now:now,p2:p2,tz:tz,row:row,manPage:manPage,fill:PROFILE.fill,
  clear:function(){queue(function(){afterglow(term.scrollTop,.55,900,true);out.textContent='';log.textContent=''})},
  logout:function(){ /* log out: clear the glass, replay the self-test, wait at login: */
    dropRoot();endJobs();KEPT.length=0; /* the ( ) or pipe stage it came from does not put the old variables back */
    LOGOUT=true;PH.aliases=PROFILE.aliases.slice(); /* session aliases die with the shell, and so do its variables and history */
    Object.keys(ENV).forEach(function(k){delete ENV[k]});Object.assign(ENV,ENV0);
    Object.keys(CSHV).forEach(function(k){delete CSHV[k]});hist=[];hi=0;TH.l=[];TH.i=0;
    if(!TELE.on)PH.clear(); /* paper stays where it is */
    pause(500);banner();prompt(PROFILE.loginPrompt,'login');
  }
});
if(PH.saved('fill'))document.documentElement.classList.add('fill');
TELE.on=TELE.ok&&PH.saved('teletype')===true;
var fxSaved=PH.saved('effects');FX.mode=/^(auto|full|lite)$/.test(fxSaved)?fxSaved:PROFILE.effects;fxApply();
PH.hooks.forEach(function(fn){
  try{fn(PH)}catch(e){PROFILE.problems.push('machine setup failed: '+e.message)}
});
var ENV0=Object.assign({},ENV); /* the environment a login starts with */
put(ST.home,'d',{owner:OWNER});
PROFILE.dirs.forEach(function(d){put(home(d),'d')});
PROFILE.files.forEach(function(f){put(home(f.name),'f',{body:f.body})});
PROFILE.protected.forEach(function(p){
  var dir=/\/$/.test(p),abs=home(p.replace(/\/+$/,'')),ex=find(abs,true); /* exact: an item inside a locked folder is still found */
  if(ex&&ex!==ROOT)ex.prot=true;
  else put(abs,dir?'d':'f',{prot:true,size:dir?0:/\.pic$/.test(abs)?16384:2048});
});
/* Whose the home's files are, on the Unix machines: the guest's home folder is the guest's, and so are the shell startup
   files in it (the machine's guest files:) and whatever the site's guest files: names (a folder, and everything in it). Every other file and folder the
   site gives stays the site owner's, read-only in its mode (-r--r--r--, dr-xr-xr-x; a locked one -r--------), so the guest
   cannot change it, nor add to or take from its folders; on Debian it carries the immutable attribute as well. A locked
   file stays the owner's even in a guest folder. The site's files outside the home are read-only too. */
if(OWNED&&OWNER!==ST.user)(function(){
  var G=PROFILE.guestFiles.map(function(p){return norm(home(p.replace(/\/+$/,'')))}),H=find(ST.home,true),seen=new Set();
  function ro(n,imm){
    n.mode=n.type==='d'?(n.prot?'dr-x------':'dr-xr-xr-x'):n.prot?'-r--------':'-r--r--r--';
    if(imm&&IMM)n.ro=true;
  }
  (function walk(d,at){Object.keys(d.kids).forEach(function(k){
    var n=d.kids[k],p=at+'/'+k;
    if(seen.has(n))return;
    seen.add(n);
    if(n.owner===OWNER&&!n.mode&&!n.dev){
      if(!n.prot&&G.some(function(g){return p===g||p.indexOf(g+'/')===0})){
        n.owner=ST.user;
        if(k==='core'&&n.type==='f'&&PROFILE.coreMode)n.mode=PROFILE.coreMode; /* a core dump, as the kernel wrote it */
      }
      else ro(n,true);
    }
    if(n.type==='d')walk(n,p);
  })})(H,ST.home);
  H.owner=ST.user;
  var own=PROFILE.home?null:find(PROFILE.homes+'/'+OWNER,true); /* the owner's own home, where the machine has one: it, and what the site puts in it, are the owner's alone, to read and to write */
  if(own&&own!==H&&own.type==='d'){
    if(own.owner===OWNER&&!own.mode)own.mode='drwx------';
    (function mine(d){Object.keys(d.kids).forEach(function(k){
      var n=d.kids[k];
      if(seen.has(n))return;
      seen.add(n);
      if(n.owner===OWNER&&!n.mode&&!n.dev&&n.type!=='s')n.mode=n.type==='d'?'drwx------':n.bin?'-rwx------':'-rw-------';
      if(n.type==='d')mine(n);
    })})(own);
  }
  PROFILE.files.map(function(f){return f.name}).concat(PROFILE.dirs,PROFILE.protected).forEach(function(p){
    var abs=norm(p.replace(/\/+$/,''));
    if(abs===ST.home||abs.indexOf(ST.home+'/')===0)return;
    var n=find(abs,true);
    if(n&&n!==ROOT&&n.owner===OWNER&&!n.mode&&!n.dev)ro(n,false);
  });
})();

/* ---------- the visitor's files, kept in this browser (persist:, unless the machine keeps its own) ----------
   What differs from the tree as it booted: what the guest made, changed or removed in their home, and what root changed
   anywhere. A reload is a reboot: /tmp starts empty, as each system's boot left it (V7's and 4.3BSD's /etc/rc, IRIX's
   RMTMPFILES, Debian 13's tmpfs). Each change remembers what the file was at boot; when the site's own version of it
   has changed since, the change is dropped, so the author's update shows. A second name for a file is kept as a link to
   it, and a file moved keeps what its old place gave it (a story file still plays, a device is still one, and a file
   whose text is made as it is read still makes it). Each machine keeps at most BUDGET characters, so the others and the
   games still have room: what does not fit is left out, largest first, and the disk is said to be full once for it. */
if(ATTRS)(function mark(d){Object.keys(d.kids).forEach(function(k){var n=d.kids[k];if(n.type==='d'){if(n!==d)mark(n)}else if(!n.dev)n.ro=true})})(ROOT); /* every file on the disk is read-only (ATTRIB +R) */
var KEEP=PROFILE.persist!==false&&!(CAT&&CAT.saves==='own'),FKEY=(PH.machine||'terminal')+'/files'+(function(){
    var d=location.pathname.replace(/[^\/]*$/,'');return d==='/'?'':':'+d; /* sites sharing one host keep apart by their folder */
  })(),BUDGET=262144,
  BASE=null,LAST=null,OUT=new Set(),ORIG=new Map(),FIELDS=['type','owner','mode','bin','size','ro','hidden','user','del','group','store'];
function scratch(p){return p==='/tmp'||p.indexOf('/tmp/')===0}
function homeAt(){ /* where a login under another name has taken the boot home (login renames it), or null */
  var a=BASE&&!PROFILE.home&&BASE.get(HOME0);if(!a)return null;
  for(var s=[],x=a.n,i=0;x&&x!==ROOT&&i<256;i++){s.unshift(x.name);x=x.parent}
  var p='/'+s.join('/');
  return x===ROOT&&p!==HOME0&&p===(RP?RP.home:ST.home)&&!find(HOME0,true)?p:null;
}
function asBoot(p,H){return H&&(p===H||p.indexOf(H+'/')===0)?HOME0+p.slice(H.length):p} /* kept under the boot home's own name: every reload logs in as the boot user */
function tree(){ /* path -> node, each folder once (a link to one is listed, not walked again) */
  var M=new Map(),seen=new Set([ROOT]),H=homeAt();
  (function walk(d,at){Object.keys(d.kids).forEach(function(k){
    var n=d.kids[k],p=asBoot(at+'/'+k,H);
    if(scratch(p)||n===ROOT)return;
    M.set(p,n);
    if(n.type==='d'&&!seen.has(n)){seen.add(n);walk(n,p)}
  })})(ROOT,'');
  return M;
}
function firsts(M){ /* node -> the path it is kept under: its own place, unless that is gone; any other is a link to it */
  var F=new Map(),H=homeAt();
  M.forEach(function(n,p){if(!F.has(n))F.set(n,p)});
  F.forEach(function(p,n){
    for(var s=[],x=n,i=0;x&&x!==ROOT&&i<256;i++){s.unshift(x.name);x=x.parent}
    var own=asBoot('/'+s.join('/'),H);
    if(x===ROOT&&own!==p&&M.get(own)===n)F.set(n,own);
  });
  return F;
}
function val(x){return x===undefined?null:x}
var ASU=null; /* while the boot home is kept under its own name: the login name whose files in it are kept as the boot user's, and the home */
function inside(n,h){for(var i=0;n&&n!==ROOT&&i<256;i++){if(n===h)return true;n=n.parent}return false}
function field(n,k){return (k==='owner'||k==='group')&&ASU!==null&&n[k]===ASU.user&&inside(n,ASU.home)?PROFILE.user:n[k]} /* only in the home: elsewhere on the disk a name is its own (bin's /bin/ls) */
function sig(n){return {n:n,b:n.body,d:+n.date||0,f:FIELDS.map(function(k){return val(field(n,k))})}}
function same(a,n){return a.n===n&&a.b===n.body&&a.d===(+n.date||0)&&FIELDS.every(function(k,i){return a.f[i]===val(field(n,k))})}
function was(a){ /* what the file was at boot, as a number */
  if(a.h===undefined)a.h=hash(JSON.stringify([a.f,typeof a.b==='function'?'':a.b]),2147483647);
  return a.h;
}
function ser(n,p,at){ /* at: where it is kept; anywhere else it is a link */
  if(at!==p)return {t:'l',to:at};
  var o={t:n.type,d:+n.date||0},q=ORIG.get(n),src=q!==undefined&&BASE.get(q);
  FIELDS.slice(1).forEach(function(k){var v=field(n,k);if(v!=null&&v!==false)o[k]=v});
  if(q!==undefined&&q!==p)o.o=q; /* moved: from where */
  if(n.type==='s')o.sym=n.sym; /* a symbolic link: what it names */
  if(n.type==='f'&&n.body!=null){
    if(typeof n.body==='function'&&src&&src.b===n.body)o.g=1; /* made as it is read: made again after a reload */
    else if(o.o!==undefined&&src&&src.b===n.body)o.s=was(src); /* moved, its text as it came: kept by where it came from and what that was */
    else{var B=body(n)||[];o.b=B.slice();if(B.open)o.open=true}
  }
  return o;
}
function keepFiles(){ /* false when something more than before could not be kept: the disk is full */
  if(!KEEP||!BASE)return true;
  var H=homeAt();ASU=H?{user:RP?RP.user:ST.user,home:find(H,true)}:null;
  var now=tree(),keep={},gone={},any=false;
  if(LAST&&LAST.size===now.size&&Array.from(now).every(function(e){var a=LAST.get(e[0]);return a&&same(a,e[1])}))return true; /* nothing changed since */
  var at=firsts(now);
  now.forEach(function(n,p){var a=BASE.get(p);if(!a||!same(a,n)){keep[p]=ser(n,p,at.get(n));if(a)keep[p].h=was(a);any=true}});
  BASE.forEach(function(a,p){if(!now.has(p)){gone[p]=was(a);any=true}});
  var big=Object.keys(keep).filter(function(p){return keep[p].b||keep[p].sym}).map(function(p){return [p,JSON.stringify(keep[p]).length]})
    .sort(function(x,y){return y[1]-x[1]}),out=[],size=JSON.stringify({v:1,keep:keep,gone:gone}).length,full=false;
  function drop(limit){while(big.length&&size>limit){var x=big.shift();delete keep[x[0]];out.push(x[0]);size-=x[1]+x[0].length+4}}
  drop(BUDGET); /* the largest files first, until the rest fits */
  for(;;){
    var v=any?{v:1,keep:keep,gone:gone}:null;
    if(PH.save(FKEY,v))break;
    if(!big.length){ /* the browser is full: nothing but the removals could be kept, and no older save is left to bring back what has gone since */
      var kept=PH.save(FKEY,any?{v:1,keep:{},gone:gone}:null);
      if(!kept)PH.save(FKEY,null);
      full=true;out=out.concat(Object.keys(keep),kept?[]:Object.keys(gone));break;
    }
    drop(size/2);full=true;
  }
  if(full)LAST=null; /* the browser's own room: tried again at each prompt, in case it has some now */
  else{LAST=new Map();now.forEach(function(n,p){LAST.set(p,sig(n))})}
  out=out.map(function(p){return now.get(p)||p}); /* by the file, wherever it moves */
  var more=out.filter(function(x){return !OUT.has(x)});
  OUT=new Set(out);
  FULLBY=more.reduce(function(w,x){var y=typeof x==='object'&&WROTE.get(x);return y&&(!w||y.at>w.at)?y:w},null); /* the last write of those left out now: the one that did not fit */
  return !more.length;
}
var FULLBY=null;
var UNSET={bin:false,size:0,mode:null}; /* what a field left out of a kept file is set to; any other is removed */
var OK={ /* what each kept field may be; a file with anything else is not put back */
  owner:word,group:word,mode:function(v){return typeof v==='string'&&/^[-dcbl][-r][-w][-xsS][-r][-w][-xsS][-r][-w][-xtT]$/.test(v)},
  bin:yes,ro:yes,hidden:yes,del:yes,size:function(v){return Number.isInteger(v)&&v>=0&&v<1e10},
  user:function(v){return Number.isInteger(v)&&v>=0&&v<16},store:function(v){return typeof v==='string'&&/^[\w-]+(\/[\w-]+)*$/.test(v)}
};
function word(v){return typeof v==='string'&&/^[^\s\x00-\x1f\x7f]{1,32}$/.test(v)}
function yes(v){return v===true}
function okLine(l){ /* a line as the engine makes them: text, or text and a class, and a web link */
  if(typeof l==='string')return true;
  if(!Array.isArray(l)||l.length<1||l.length>3||typeof l[0]!=='string'||(l.length>1&&(typeof l[1]!=='string'||!/^[\w -]*$/.test(l[1]))))return false;
  if(l.length<3)return true;
  var o=l[2];
  return !!o&&typeof o==='object'&&!Array.isArray(o)&&Object.keys(o).join()==='href'&&typeof o.href==='string'&&/^(https?:\/\/|mailto:)\S+$/i.test(o.href);
}
function okEntry(e){
  if(!e||typeof e!=='object'||Array.isArray(e))return false;
  if(e.h!==undefined&&!Number.isInteger(e.h))return false;
  if(e.t==='l')return typeof e.to==='string';
  if(e.t==='s'&&(typeof e.sym!=='string'||!e.sym||e.sym.length>4095||e.o!==undefined))return false;
  if(!/^[fdcs]$/.test(e.t)||typeof e.d!=='number'||!isFinite(e.d)||Math.abs(e.d)>864e13)return false;
  if(e.o!==undefined&&typeof e.o!=='string')return false;
  if(e.s!==undefined&&(!Number.isInteger(e.s)||e.o===undefined||e.b!==undefined||e.g!==undefined||e.open!==undefined))return false;
  if(!FIELDS.slice(1).every(function(k){return !has(e,k)||OK[k](e[k])}))return false;
  if(e.t!=='f')return e.b===undefined&&e.g===undefined&&e.s===undefined;
  if(e.b!==undefined&&(!Array.isArray(e.b)||e.g!==undefined||!e.b.every(okLine)))return false;
  return (e.g===undefined||e.g===1)&&(e.open===undefined||e.open===true);
}
var CLASH=[]; /* the visitor's folders left out because the site has a file of that name now */
function clashSay(p){ /* one of them, as the machine's own mkdir says it could not make it again: a file has the name */
  var x=p.indexOf(ST.home+'/')===0?p.slice(ST.home.length+1):p,f=has(CMDS,'mkdir')?CMDS.mkdir:has(CMDS,'md')?CMDS.md:null;
  if(PH.dirClash){PH.dirClash(p);return} /* a machine that says it otherwise (VMS) */
  if(PROFILE.dos)x=x.replace(/\//g,'\\');
  if(f){CURRENT='mkdir';f([x],'mkdir '+x,['mkdir',x],'mkdir '+x);CURRENT='';return}
  if(!PROFILE.dos)typeLine(PROFILE.perror?'mkdir: '+x+': File exists':'mkdir: cannot make directory '+x,'err'); /* mkdir switched off: its words all the same */
}
var NOT_COPIED=new Set(['name','parent','kids','date','body'].concat(FIELDS)); /* the rest of a moved file comes from where it was */
function restoreFiles(){
  var s=PH.saved(FKEY);
  if(!s||typeof s!=='object'||s.v!==1)return;
  function good(p){return typeof p==='string'&&p.length>1&&p==='/'+parts(p).join('/')&&!scratch(p)&&!parts(p).some(function(x){return x==='.'||x==='..'})}
  function obj(x){return x&&typeof x==='object'&&!Array.isArray(x)?x:{}}
  var gone=obj(s.gone),keep=obj(s.keep),dropped=new Set(),links=[];
  function under(p){for(var q=dirOf(p);q!=='/';q=dirOf(q))if(dropped.has(q))return true;return false}
  function folder(p){var d=find(dirOf(p),true);return d&&d.type==='d'&&!under(p)?d:null} /* what it goes in: a folder that is there, and not one left out */
  Object.keys(gone).sort().reverse().forEach(function(p){
    var a=BASE.get(p),d=good(p)&&p!==HOME0&&a&&was(a)===gone[p]&&find(dirOf(p),true); /* the boot home stays: the reload logs in to it */
    if(d&&d.type==='d')delete d.kids[p.split('/').pop()];
  });
  Object.keys(keep).sort().forEach(function(p){
    var e=keep[p],a=BASE.get(p),ok=good(p)&&okEntry(e),chg=ok&&(e.h!==undefined?!a||was(a)!==e.h:!!a),f=ok&&folder(p),
        x=ok&&e.t==='d'&&f?find(p,true):null; /* chg: the site has changed its file, or made one here, since. x: a folder of theirs, and what is there now */
    if(x&&x!==ROOT&&x.type==='d'&&chg)return; /* a folder the site has made or changed since: the site's stays, and what was kept in it goes back in */
    if(!ok||chg||!f){ /* the site's file changed, or the site has made one here since, or what it was in is not a folder now */
      if(x&&x!==ROOT&&x.type!=='d')CLASH.push(p); /* a folder of theirs where the site has put a file: said at boot */
      dropped.add(p);return;
    }
    if(e.t==='l'){links.push(p);return}
    var src=e.o!==undefined?(good(e.o)?BASE.get(e.o):null):a;
    if(src&&src.n.type!==e.t)src=null;
    if((e.o!==undefined||e.t==='c'||e.g)&&!src||e.t==='c'&&!src.n.dev||e.g&&typeof src.b!=='function'||e.s!==undefined&&(!Array.isArray(src.b)||was(src)!==e.s)){dropped.add(p);return} /* moved unchanged from a file the site has changed since: the move is dropped, and the new version is in its own place */
    var n=find(p,true);
    if(!n||n===ROOT||n.type!==e.t)n=put(p,e.t,{}); /* its folder is there: only this name is made or replaced */
    if(src&&src.n!==n)Object.keys(src.n).forEach(function(k){if(!NOT_COPIED.has(k))n[k]=src.n[k]});
    if(e.o!==undefined)ORIG.set(n,e.o);
    n.date=new Date(e.d);
    FIELDS.slice(1).forEach(function(k){if(has(e,k))n[k]=e[k];else if(has(UNSET,k))n[k]=UNSET[k];else delete n[k]});
    if(typeof n.owner!=='string')n.owner=OWNER;
    if(e.t==='s')n.sym=e.sym;
    if(e.t==='f'){n.body=e.g||e.s!==undefined?src.b:e.b?e.b.slice():null;if(n.body&&e.open)n.body.open=true} /* the very text it came with: still kept by origin */
  });
  links.forEach(function(p){ /* a second name, once what it names is back */
    var to=keep[p].to,t=good(to)?find(to,true):null,d=folder(p),a=BASE.get(p); /* what it names, even where the site's own version now stands */
    if(t&&t!==ROOT&&d&&to!==p&&(t.type!=='d'||a&&a.n.type==='d'&&ORIG.get(a.n)!==p&&(p+'/').indexOf(to+'/')!==0))d.kids[p.split('/').pop()]=t; /* a second name for a folder only where the system had one (Debian's /bin) */
  });
}
if(KEEP){
  BASE=new Map();var T0=tree();T0.forEach(function(n,p){BASE.set(p,sig(n))});
  firsts(T0).forEach(function(p,n){ORIG.set(n,p)});
  restoreFiles();
  window.addEventListener('pagehide',function(){keepFiles()});
}

/* ---------- running commands ---------- */
function expand(seg){ /* each command of a pipeline, or after && or ||: longest matching alias wins; extra words pass through */
  if(PROFILE.dos)return aliasOf(seg);
  var out='',start=0,depth=0,j;
  for(var i=0;i<seg.length;i++){ /* the same quotes, `commands`, comments and csh ( ) as andOr */
    var c=seg.charAt(i),two=seg.substr(i,2);
    if(c==='\\'){i++;continue}
    if((j=skipEnd(seg,i,depth))>=0){i=j;continue}
    if(c==='#'&&(!i||/[\s;|&<>]/.test(seg.charAt(i-1))))break;
    if(c==='(')depth++;else if(c===')')depth=Math.max(0,depth-1);
    else if(!depth&&(c==='|'||two==='&&')){
      var op=two==='&&'||two==='||'?two:c;
      out+=piece(seg.slice(start,i))+op;start=i+op.length;i=start-1;
    }
  }
  return (out+piece(seg.slice(start))).trim();
  function piece(p){var a=aliasOf(p);return a===p.trim()?p:' '+a+' '} /* untouched unless an alias was there */
}
var ABUSY=Object.create(null),AUSED=null; /* the aliases whose text is running: bash does not expand an alias again inside its own expansion */
function unaliased(seg,run){ /* seg's aliases expanded, and run(x) for each command; an alias whose text holds a { }, ( ), `command` or compound is busy while it runs */
  var used=AUSED=[],segs=splitCmds(expand(seg));AUSED=null;
  if(used.length)queue(function(){used.forEach(function(k){ABUSY[k]=(ABUSY[k]||0)+1})});
  segs.forEach(function(x){if(x.trim())run(x)});
  if(used.length)queue(function(){used.forEach(function(k){if(!--ABUSY[k])delete ABUSY[k]})},2);
}
function aliasOf(cmd){
  var parts=cmd.trim().split(/\s+/),low=parts.map(PROFILE.fold),best=null;
  PH.aliases.forEach(function(x){
    if(x.from.length>low.length||ABUSY[x.from.join(' ')])return;
    for(var i=0;i<x.from.length;i++)if(x.from[i]!==low[i])return;
    if(!best||x.from.length>best.from.length)best=x;
  });
  if(best&&AUSED&&/[{(`]|(^|[\s;&|])(for|while|until|if|case)\s/.test(best.to))AUSED.push(best.from.join(' '));
  if(best&&CSH&&HISTSEL.test(best.to))return cshAliasArgs(best.to,parts.slice(best.from.length-1)); /* csh: \!* and the rest take the words; none are added after */
  return best?[best.to].concat(parts.slice(best.from.length)).join(' '):cmd.trim();
}
var HISTSEL=/!(\*|\^|\$|:(\*|\^|\$|-\d+|\d+(-\d*|\*)?))/,HISTSELS=new RegExp(HISTSEL.source,'g');
function cshAliasArgs(to,W){ /* 4.3BSD csh (sh.parse.c's asyn3, sh.lex.c's getsel): an alias's !* !^ !$ !:n !:n-m !:n- !:n* and !:-m are the
                                words of the command it stands for, the alias's own name word 0; a word that is not there is Bad ! arg selector. */
  var bad=false,last=W.length-1;
  var out=to.replace(HISTSELS,function(m,a,b){
    var lo,hi,sel=b!==undefined?b:a,k;
    if(sel==='*'){lo=1;hi=last;if(hi<lo)return ''}
    else if(sel==='^')lo=hi=1;
    else if(sel==='$')lo=hi=last;
    else if((k=/^-(\d+)$/.exec(sel))){lo=0;hi=+k[1]}
    else{k=/^(\d+)(-(\d*)|\*)?$/.exec(sel);lo=+k[1];hi=k[2]===undefined?lo:k[2]==='*'?last:k[3]===''?last-1:+k[3];if(k[2]==='*'&&hi<lo)return ''}
    if(lo>hi+1||hi>last||lo>last){bad=true;return ''}
    return W.slice(lo,hi+1).join(' ');
  });
  if(bad){typeLine('Bad ! arg selector.','err');return ''}
  return out;
}
/* 4.3BSD's /bin/sh is the Bourne shell: its msg.c is V7's word for word (VERSION sys137). On a csh machine that has one (PH.bourne.on, set by
   the machine), sh runs it: V7's grammar, the $ prompt, its messages, and its builtins in place of csh's, until its exit or ^D, or the
   end of its script. BSH: one entry for each such shell running, tty: one reading the terminal */
var BSH=[],BHID=null,BOURNE_OFF=['history','unset','setenv','unsetenv','unalias','if','@','rehash','end','limit','alias','jobs','fg','bg','logout','set'];
var SHSET; /* sh's set (commands/text.js), found once */
var DASH_OFF=['let','declare','typeset','history','logout','shopt'],DHID=null; /* bash's builtins that dash does not have */
function hide(L){var H={};L.forEach(function(k){if(has(CMDS,k)){H[k]=CMDS[k];delete CMDS[k]}});return H} /* the builtins in L that the shell now running does not have: off, kept */
function unhide(H){Object.keys(H).forEach(function(k){CMDS[k]=H[k]})}
function grammar(sh){ /* the shell's grammar and builtins: sh's (true) or the machine's csh; on Debian, dash's (true) or bash's. SV: a System V sh is reading */
  if(!PH.bourne.on){} /* no sh on this machine */
  else if(PROFILE.bash){
    if(DASH!==!!sh){
      DASH=!!sh;
      if(DASH)DHID=hide(DASH_OFF);
      else{unhide(DHID||{});DHID=null}
    }
  }
  else if(sh!==!CSH){
    if(sh){
      BHID=hide(BOURNE_OFF);
      if(!SHSET)SHSET=PH.defs.filter(function(x){return /commands\/text\.js$/.test(x.from||'')&&(x.names||[]).indexOf('set')>=0})[0];
      if(SHSET)CMDS.set=SHSET.run; /* sh's set: the variables */
      svOn(true); /* IRIX: System V's builtins too */
    }
    else{svOn(false);delete CMDS.set;unhide(BHID);BHID=null}
    CSH=!sh&&!!PROFILE.csh;varRe();
  }
  SV=!!PROFILE.sysv&&!CSH&&!PROFILE.bash&&BSH.length>0;
}
function shTop(){ /* is the shell reading now a Bourne shell: one started since an su that started the user's own, else that one's, else any */
  if(RP&&RP.su&&RP.sh&&BSH.length<=RP.bsh)return RP.sh==='sh';
  return BSH.length>0&&!BSH[BSH.length-1].bash;
}
function bourne(on,tty,bash){ /* a Bourne shell starts (tty: at the terminal) or ends. bash: on Debian, a bash at the terminal instead, which ends the same way */
  if(on){BSH.push({tty:!!tty,bash:!!bash,pid:tty&&PH.newPid?PH.newPid():0,start:now(),was:tty?{cwd:ST.cwd,env:Object.assign({},ENV),args:ARGS,ln:[DLN0,DSKIP],al:PH.aliases,back:bash?keep(true):null,jobs:parkJobs()}:null});if(tty){DLN0=SHLINE;DSKIP=0;ARGS=[bash?'bash':'sh']}if(PROFILE.sysv){if(!tty)BSH[BSH.length-1].opt=has(ENV,'OPTIND')?[ENV.OPTIND]:[];ENV.OPTIND='1'}grammar(shTop());return} /* System V's main.c: OPTIND=1 for getopts */ /* was: one at the terminal is a child process: what it changes goes with it */
  if(!BSH.length)return;
  var b=BSH.pop(),w=b.was;
  if(w){if(w.back)w.back();refill(ENV,w.env);if(find(w.cwd,true))ST.cwd=w.cwd;ARGS=w.args;DLN0=w.ln[0];DSKIP=w.ln[1];PH.aliases=w.al}
  else if(b.opt){if(b.opt.length)ENV.OPTIND=b.opt[0];else delete ENV.OPTIND} /* sh -c or sh file from csh: OPTIND was that sh's own */
  grammar(shTop());
  if(w&&w.jobs)unparkJobs(w.jobs); /* with the parent's grammar: whether it has job control */
  if(b.after)b.after();
}
/* IRIX's /bin/sh is System V's Bourne shell (SVR3): V7's grammar, plus functions, unset, type, hash, return, getopts and readonly
   (the SVR4 sources as OpenSolaris and illumos keep them: cmd.c item(), xec.c TFND and FUNCTION, bltin.c, hashserv.c, hash.c, func.c prf()).
   What one shell defines (its functions, readonly names, hash table, getopt's place) is that shell's: on its BSH entry */
var FNDEF=/^\s*([A-Za-z_]\w*)\s*\(\s*\)\s*([\s\S]*)$/,FNDEPTH=0;
var SVBUILTIN=new Set(['.',':','[','break','cd','continue','echo','eval','exec','exit','export','getopts','hash','newgrp','pwd','read','readonly','return','set','shift','test','times','trap','type','ulimit','umask','unset','wait']);
var SV=false; /* a System V sh is reading: grammar() keeps it, after each change of shell */
function svState(){var t=BSH[BSH.length-1];return t.sv||(t.sv={fn:Object.create(null),ro:Object.create(null),hash:new Map(),seq:0,sp:1})}
function svCopy(S){ /* a copy of a shell's own: what one shell changes there leaves the other's alone */
  var c=Object.assign({},S);
  c.fn=Object.assign(Object.create(null),S.fn);c.ro=Object.assign(Object.create(null),S.ro);
  c.hash=new Map();S.hash.forEach(function(v,k){c.hash.set(k,v&&typeof v==='object'?Object.assign({},v):v)});
  return c;
}
function svRO(n){if(!SV||!svState().ro[n])return false;failed(n+': is read only');return true} /* name.c assign(): failed(namid, wtfailed) */
function fnDefine(m){ /* name() command: xec.c TFND. A { list } is read now; any other command is kept as it is */
  var name=m[1],body=m[2].trim(),S=svState(),F={body:body};
  if(svRO(name))return;
  if(body.charAt(0)==='{'){var e=groupEnd(body,0);if(e<0){failed(syntaxError('end'));return}F.inner=body.slice(1,e);F.tree=treeOf(F.inner.split('\n'));if(!F.tree)return}
  S.fn[name]=F;delete ENV[name];
  S.hash.delete(name); /* hash_func: no longer a command */
  STATUS=0;
}
function fnCall(name,words){ /* xec.c FUNCTION: its words are $1 ... ($0 stays), its return ends it, and the old ones come back */
  var F=svState().fn[name],was=ARGS;
  if(FNDEPTH>=100){failed('no stack space');return}
  FNDEPTH++;ARGS=[was[0]].concat(words.slice(1));
  if(F.tree)runBlock(F.tree);else execLine(F.body);
  queue(function(){FNDEPTH--;ARGS=was;if(LOOP==='return')LOOP=null},2);
}
function fnShown(name,F){ /* type: func.c prf() with newlines (nonl 0): words as read, one space apart, the redirections after them */
  function cmd(t){
    var W=rawWords(t),o=[],io='';
    for(var i=0;i<W.length;i++){
      var r=/^(\d?)(>>|>&|<&|<<|>|<)([\s\S]*)$/.exec(W[i]);
      if(!r){o.push(W[i]);continue}
      var to=r[3]||W[++i]||'';io+=' '+(r[1]||(/>/.test(r[2])?'1':'0'))+r[2]+to;
    }
    return o.join(' ')+io;
  }
  function list(B){return [].concat.apply([],B.map(node))}
  function node(n){
    if(n.k==='cmd')return [cmd(n.t)];
    if(n.k==='for')return ['for '+n.v+(n.all?'':' in '+rawWords(n.words).join(' ')),'do'].concat(list(n.body),['done']);
    if(n.k==='while'||n.k==='until'){var c=list(n.cond);c[0]=n.k+' '+c[0];return c.concat(['do'],list(n.body),['done'])}
    if(n.k==='if'){var d=list(n.cond);d[0]='if '+d[0];return d.concat(['then'],list(n.then),n.els?['else'].concat(list(n.els)):[],['fi'])}
    if(n.k==='case')return ['case '+n.word+n.arms.map(function(a){return a.pats.join(' | ')+')'+list(a.body).join('\n')+';;'}).join('')]; /* prf's TSW: no in, no esac */
    return [n.t||''];
  }
  return [name+' is a function',name+'(){'].concat(F.tree?list(F.tree).join('\n').split('\n'):[F.body],['}']);
}
function svBucket(k){for(var s=0,i=0;i<k.length;i++)s+=k.charCodeAt(i);return (Math.imul(s+k.length,0xEFC5589B|0)>>>0)>>>26} /* hash.c: crunch() times 035761254233, the top 6 bits */
function svPath(name){ /* hashserv.c findpath(): the place in PATH it is found at (count), the directories tried (cost), and whether it is a relative one */
  var P=(has(ENV,'PATH')?ENV.PATH:'/bin:/usr/bin').split(':'),dot=Infinity;
  for(var i=0;i<P.length;i++){
    var d=P[i]||'.',rel=d.charAt(0)!=='/';
    if(rel&&dot===Infinity)dot=i+1;
    var n=find((d==='.'?'':d+'/')+name);
    if(n&&n.type==='f'&&may(n,'x'))return {count:i+1,cost:i+1,rel:i+1>=dot,path:(d==='.'?'.':d.replace(/\/$/,''))+'/'+name};
  }
  return null;
}
function svHash(name,flg){ /* pathlook(): a command found in PATH goes in the table; hits counts its runs from there (flg) */
  var S=svState(),h=S.hash.get(name);
  if(name.indexOf('/')>=0||has(S.fn,name)||SVBUILTIN.has(name))return null;
  if(h&&h.path){if(flg)h.hits++;return h}
  var p=svPath(name);
  if(!p)return null;
  if(!h){h={key:name,b:svBucket(name),seq:S.seq++,cost:0};S.hash.set(name,h)}
  h.path=p.path;h.rel=p.rel;h.hits=flg?1:0;h.cost+=p.cost;
  return h;
}
var SVCMDS={
  unset:function(a,raw,w){ /* SYSUNS, name.c unset_name() */
    var S=svState();STATUS=0;
    for(var i=1;i<w.length;i++){
      var n=w[i];
      if(S.ro[n]){failed(n+': is read only');return}
      if(/^(PATH|IFS|PS1|PS2|MAILCHECK)$/.test(n)){failed(n+': cannot unset');return}
      if(has(S.fn,n))delete S.fn[n];else delete ENV[n];
    }
  },
  readonly:function(a,raw,w){ /* SYSRDONLY: each name marked; none: readonly name for each, as namscan() walks them (in order) */
    var S=svState();STATUS=0;
    if(w.length<2){Object.keys(S.ro).sort().forEach(function(n){typeLine('readonly '+n)});return}
    for(var i=1;i<w.length;i++){if(!/^[A-Za-z_]\w*$/.test(w[i])){failed(w[i]+': is not an identifier');return}S.ro[w[i]]=true}
  },
  return:function(a,raw,w){ /* SYSRETURN: badreturn outside a function; its status, or the last command's */
    if(!FNDEPTH){failed('cannot return when not in function');return}
    var x=w[1];
    if(x!==undefined&&!/^\d+$/.test(x)){failed(x+': bad number');return}
    STATUS=x!==undefined?parseInt(x,10):PREV;LOOP='return';
  },
  type:function(a,raw,w){ /* SYSTYPE, hashserv.c what_is_path() */
    var S=svState(),st=0;
    w.slice(1).forEach(function(n){
      if(has(S.fn,n)){fnShown(n,S.fn[n]).forEach(function(l){typeLine(l)});return}
      var h=S.hash.get(n);
      if(h&&h.path){typeLine(n+' is hashed ('+h.path+')');return}
      if(SVBUILTIN.has(n)){typeLine(n+' is a shell builtin');return}
      var p=svPath(n);
      if(p){typeLine(n+' is '+p.path);return}
      typeLine(n+' not found');st=1;
    });
    STATUS=st;
  },
  hash:function(a,raw,w){ /* SYSHASH: -r empties the table; names are looked up (not found: failed); none: hashpr() */
    var S=svState();STATUS=0;
    if(w.length<2){
      typeLine('hits\tcost\tcommand');
      Array.from(S.hash.values()).filter(function(h){return h.path}).sort(function(x,y){return x.b-y.b||x.seq-y.seq}).forEach(function(h){typeLine(h.hits+(h.rel?'*':'')+'\t'+h.cost+'\t'+h.path)});
      return;
    }
    if(w[1].charAt(0)==='-'){if(w[1].charAt(1)==='r'){S.hash.forEach(function(h){h.path=null;h.cost=0})}else failed('bad option(s)');return}
    for(var i=1;i<w.length;i++)if(!svHash(w[i],0)&&!has(S.fn,w[i])&&!SVBUILTIN.has(w[i])){failed(w[i]+': not found');return}
  },
  getopts:function(a,raw,w){ /* SYSGETOPT and libc's getopt(3): OPTIND from the variable, its place in a word of options its own (sp) */
    var S=svState();
    if(w.length<3){typeLine(w[0]+': missing arguments','err');STATUS=1;return}
    var opts=w[1],v=w[2],av=[ARGS[0]||'sh'].concat(w.length>3?w.slice(3):ARGS.slice(1)),oi=parseInt(ENV.OPTIND,10)||0,c,sp=S.sp;
    function done(r){ENV.OPTIND=String(oi);S.sp=sp;return r}
    if(sp===1&&(oi>=av.length||av[oi].charAt(0)!=='-'||av[oi].length===1||av[oi]==='--')){
      if(oi<av.length&&av[oi]==='--')oi++;
      done();ENV[v]='';STATUS=1;return;
    }
    c=av[oi].charAt(sp);
    var k=c===':'?-1:opts.indexOf(c);
    if(k<0){
      typeLine(av[0]+': illegal option -- '+c,'err');
      if(++sp>=av[oi].length){oi++;sp=1}
      done();ENV[v]='?';queue(function(){STATUS=0});return; /* after the error line, which set it to 1 */
    }
    if(opts.charAt(k+1)===':'){
      if(sp+1<av[oi].length)ENV.OPTARG=av[oi++].slice(sp+1);
      else if(++oi>=av.length){typeLine(av[0]+': option requires an argument -- '+c,'err');sp=1;done();ENV[v]='?';queue(function(){STATUS=0});return}
      else ENV.OPTARG=av[oi++];
      sp=1;
    }
    else{if(++sp>=av[oi].length){sp=1;oi++}delete ENV.OPTARG}
    done();ENV[v]=c;STATUS=0;
  }
};
var SVHID=null; /* the commands SVCMDS took the place of while a System V sh runs */
function svOn(on){
  if(!PROFILE.sysv||!!SVHID===on)return;
  if(on){SVHID=hide(Object.keys(SVCMDS));Object.keys(SVCMDS).forEach(function(k){CMDS[k]=SVCMDS[k]})}
  else{Object.keys(SVCMDS).forEach(function(k){delete CMDS[k]});unhide(SVHID);SVHID=null}
}
function fnJoin(L){ /* a script's name() { ... } that goes on for lines: one line for statements(), the lines it took left empty so the numbers stay */
  L=L.slice();
  function open(l){ /* where in l a definition starts whose { list } is not closed (or not begun), or -1 */
    for(var segs=splitCmds(l),k=0,off=0;k<segs.length;k++){
      off=l.indexOf(segs[k],off);
      var m=FNDEF.exec(l.slice(off)),b=m&&m[2].trim();
      if(m&&(!b||b.charAt(0)==='{'&&groupEnd(b,0)===-2))return off;
      off+=segs[k].length;
    }
    return -1;
  }
  for(var i=0;i<L.length;i++){
    var from=open(L[i]);
    if(from<0)continue;
    for(var j=i;j+1<L.length;){
      var b=FNDEF.exec(L[i].slice(from))[2].trim();
      if(b&&groupEnd(b,0)!==-2)break;
      L[i]+='\n'+L[++j];L[j]='';
    }
  }
  return L;
}
function scriptSh(L){ /* the shell a script's #! line names: 'sh', 'csh', or null (none: the one running it) */
  var m=/^#!\s*(\S+)/.exec(L&&L[0]||'');
  return m?(/(^|\/)sh$/.test(m[1])?'sh':/(^|\/)csh$/.test(m[1])?'csh':/(^|\/)bash$/.test(m[1])?'bash':null):null;
}
function noRead(word,T){ /* a script that may be run but not read: what the shell its #! line names (else this one's) says, opening it */
  var bin=(/^#!\s*(\S+)/.exec(T[0]||'')||[])[1],sh=scriptSh(T)||(PROFILE.bash?(DASH?'sh':'bash'):CSH?'csh':'sh');
  if(PROFILE.bash){ /* dash: /bin/sh: 0: cannot open f: ..., exit 2 (an interactive dash runs one with no #! with /bin/sh too); bash's open_shell_script: bash: f: ..., 126 */
    var d=sh==='sh';typeLine(d?(bin||'/bin/sh')+': 0: cannot open '+word+': Permission denied':(bin||'bash')+': '+word+': Permission denied','err');queue(function(){STATUS=d?2:126});return;
  }
  typeLine(word+(sh==='csh'?': Permission denied':': cannot open'),'err');STATUS=1; /* the Bourne shell's chkopen(): failed(f,badopen); csh, which a file with no #! goes to when it cannot read its first byte: Perror(f) */
}
function runAs(sh,fn){ /* fn() with the grammar of sh ('sh' or 'csh'; on Debian 'sh' or 'bash') on a machine with both, back as it was once what it queued is done */
  if(PROFILE.bash&&PH.bourne.on){
    if(sh==='sh'&&!DASH){bourne(true);fn();queue(function(){bourne(false)},true);return}
    if(sh==='bash'&&DASH){grammar(false);fn();queue(function(){grammar(shTop())},true);return} /* a #!/bin/bash script run from dash */
    fn();return;
  }
  if(!PH.bourne.on||!sh||sh==='bash'||(sh==='sh')===!CSH&&!SV){fn();return} /* System V sh from System V sh is a new process, without the functions, readonly names and hash table of the one that started it */
  if(sh==='sh'){bourne(true);fn();queue(function(){bourne(false)},true);return}
  grammar(false);fn();queue(function(){grammar(true)},true); /* a #!/bin/csh script run from sh */
}
var CURRENT='',SOURCE=''; /* SOURCE: the command as typed, $variables and all */
function runOne(s,words,src){
  var typed=s; /* the line as typed, blanks and all, for a machine's own fallback (CMS) */
  s=s.trim();
  SOURCE=src===undefined?s:src;
  words=words||s.split(/\s+/);
  if(!s||!words[0])return;
  if(PROFILE.dcl&&typeof PH.symbols==='function'){ /* VMS's DCL: NAME :== value defines a symbol whatever NAME is, a command's name too: the machine's own parser sees
                                                       the line first, and says it is done (true), or gives the line to run instead. The other machines with shell: dcl have no symbols */
    var y=PH.symbols(s);
    if(y===true)return;
    if(typeof y==='string'){if(!y.trim())return;typed=s=y.trim();SOURCE=src===undefined?s:src;words=s.split(/\s+/)}
  }
  PREV=STATUS;STATUS=0;
  var parts=words.map(PROFILE.fold),c=parts[0],args=parts.slice(1),word=words[0];
  if(CSH&&/:$/.test(word)&&args.length){typeLine(word+': Too many arguments.','err');return}
  if(control()&&/^%/.test(word)){jobCmd('%',args,s,words);return} /* %1: fg */
  if(SV&&c.indexOf('/')<0&&has(svState().fn,c)){fnCall(c,words);return} /* System V: a function is found before a builtin or a program */
  var f=has(CMDS,c)?CMDS[c]:null,name=c;
  if(f&&SV&&c.indexOf('/')<0)svHash(c,1); /* pathlook(): a program found in PATH goes in the hash table */
  if(!f&&c.indexOf('/')>=0){ /* /bin/ls runs ls; any other path is not a program */
    var n=find(c);
    if(n&&n.bin&&has(CMDS,n.name)){f=CMDS[n.name];name=n.name}
    else if(n&&isScript(n)&&!may(n,'r')){noRead(word,textOf(n));return} /* x but not r: the kernel runs it, and the shell that is to read it cannot */
    else if(n&&isScript(n)){var T=textOf(n),back=keep();if(PH.bashLevel&&(scriptSh(T)||(DASH?'sh':'bash'))==='bash')PH.bashLevel();runAs(scriptSh(T),function(){runScript(T,words.slice())});queue(back,true);return} /* 4.3BSD: #!/bin/sh runs the Bourne shell. A process of its own: its variables and directory go with it */
    else if(n){typeLine(word+': cannot execute','err');return}
  }
  if(f&&!NOH[name]&&args.indexOf(PROFILE.bash?'--help':'-h')>=0&&has(MAN,name)){typeLine((PROFILE.bash?'Usage: ':'usage: ')+MAN[name].syn);return} /* GNU's tools take -h for other things */
  if(f){
    CURRENT=name;
    try{f(args,s,words,typed)}catch(e){console.error(e);typeLine(name+': core dumped','err')} /* typed: as for the fallback, for a machine that takes the terminal's own commands as its lines (CMS) */
  }
  else if(!(PH.fallback&&PH.fallback(word,s,args,typed))){typeLine(DASH?bashAt()+word+': not found':PROFILE.bash&&SCRLN&&SCRIPTS?bashAt()+word+': command not found':(shTop()?'%s: not found':PROFILE.notFound).replace('%s',word),'err');if(PROFILE.bash)queue(function(){STATUS=127})} /* bash: 127; V7 sh's failed() and csh's bferr() leave 1 */
}
/* ---------- the shell: words, quotes, $variables, wildcards, pipes, redirection, && and || ---------- */
var ARGS=PROFILE.bash?['-bash']:[]; /* $0 $1 ... of the script that is running. Debian's login starts bash as -bash */
var VAR_AT,VAR_ALL,VARRES={};varRe(); /* csh also has $?name: is it set. VAR_AT: sticky, for varAt; VARRES: csh's and sh's pair, made once each */
function varRe(){
  var r=VARRES[CSH];
  if(!r){var v=CSH?'\\$(\\?\\w+|#\\w+|\\w+\\[[^\\]\\s]*\\]|\\w+|\\{\\w+\\}|\\?|\\$|#|\\*)':'\\$(\\w+|\\{\\w+\\}'+(PROFILE.bash?'|\\{[#!]?\\w+\\[[^\\]}]*\\]\\}|\\{#\\w+\\}|\\{(?:\\w+|[@*]):(?![-=?+])[^}]*\\}':'')+'|@|\\?|\\$|#|\\*|!)';r=VARRES[CSH]=[new RegExp(v,'y'),new RegExp(v,'g')]}
  VAR_AT=r[0];VAR_ALL=r[1];
}
function varsIn(t,dq){ /* dq: inside " ", where "${x[@]}" is a word for each element. Without a ${ (or in csh and V7's sh) VAR_ALL finds each */
  var was=DQ;DQ=!!dq;
  try{
    if(!PROFILE.bash||CSH||t.indexOf('${')<0)return t.replace(VAR_ALL,function(m,k){return envOf(k)});
    var o='',m,i=0,j;
    while((j=t.indexOf('$',i))>=0){if((m=varAt(t,j))){o+=t.slice(i,j)+envOf(m[1]);i=j+m[0].length}else{o+=t.slice(i,j+1);i=j+1}}
    return o+t.slice(i);
  }finally{DQ=was}
}
var PIPEST=[0]; /* bash's PIPESTATUS: the status of each command of the last pipeline */
/* bash's arrays. ARR[name]: {A: associative, v: its elements but [0], which is ENV[name] (so $x is ${x[0]} and x=1 sets it), s: when each
   key was made}. An indexed array's elements come in the order of their numbers, an associative one's in the order of bash's hash
   table (hashlib.c: FNV-1 of the key, 1024 buckets, the newest first in each) */
var ARR=Object.create(null),ASEQ=0,DQ=false,QSEP='\uE013',QNONE='\uE014',AMARK='\uE035';
function isArr(n){return bashy()&&has(ARR,n)}
function bucket(k){for(var h=2166136261,i=0;i<k.length;i++)h=(Math.imul(h,16777619)^k.charCodeAt(i))>>>0;return h&1023}
/* Each array keeps its keys (but 0) in that order, K, kept up to date as keys come and go, so a loop that appends sorts nothing. A child
   process's copy (keep, procGet) shares the arrays: one is copied only when it is changed after that (its g, older than AGEN) */
var AGEN=0;
function idxCmp(x,y){return x.length-y.length||(x<y?-1:x>y?1:0)}
function assocCmp(a){return function(x,y){return bucket(x)-bucket(y)||(a.s[y]||0)-(a.s[x]||0)}} /* an associative array's order */
function keysOf(a){ /* a's keys but 0, sorted, made once */
  if(!a.K){var K=Object.keys(a.v);a.K=a.A?K.sort(assocCmp(a)):K.sort(idxCmp)}
  return a.K;
}
function arrKeys(n){ /* its keys, in bash's order (not to be changed) */
  if(!isArr(n))return has(ENV,n)?['0']:[];
  var a=ARR[n],K=keysOf(a);
  if(!has(ENV,n))return K;
  if(!a.A)return ['0'].concat(K); /* 0 is the smallest */
  return K.concat('0').sort(assocCmp(a));
}
function arrLast(n){var K=isArr(n)?keysOf(ARR[n]):[];return K.length?K[K.length-1]:has(ENV,n)?'0':null} /* an indexed array's highest key */
function arrGet(n,k){return k==='0'?(has(ENV,n)?ENV[n]:undefined):isArr(n)&&has(ARR[n].v,k)?ARR[n].v[k]:undefined}
function arrVals(n){return arrKeys(n).map(function(k){return arrGet(n,k)})}
function newArr(n,assoc){var a={A:!!assoc,v:Object.create(null),s:Object.create(null),g:AGEN};ARR[n]=a;return a}
function arrOwn(n){ /* ARR[n], copied first if a child's copy still shares it */
  var a=ARR[n];
  if(a.g!==AGEN)a=ARR[n]={A:a.A,z:a.z,v:Object.assign(Object.create(null),a.v),s:Object.assign(Object.create(null),a.s),K:a.K&&a.K.slice(),g:AGEN};
  return a;
}
function arrPut(n,k,v){
  var a=ARR[n]?arrOwn(n):newArr(n,false);
  delete a.z; /* declare -a x: an array with no value yet */
  var fresh=arrGet(n,k)===undefined;
  if(fresh)a.s[k]=++ASEQ; /* a new key goes first in its bucket */
  if(k==='0'){ENV[n]=v;return}
  a.v[k]=v;
  if(!fresh||!a.K)return;
  var K=a.K;
  if(!a.A){if(!K.length||idxCmp(K[K.length-1],k)<0)K.push(k);else delete a.K;return} /* appended: it goes last */
  var b=bucket(k),i=0;while(i<K.length&&bucket(K[i])<b)i++;K.splice(i,0,k); /* the newest first in its bucket */
}
function arrDel(n,k){
  if(k==='0'){delete ENV[n];return}
  if(!isArr(n)||!has(ARR[n].v,k))return;
  var a=arrOwn(n);delete a.v[k];
  if(a.K){var i=a.K.indexOf(k);if(i>=0)a.K.splice(i,1)}
}
function arrKey(n,i){ /* the key that name[i] names, or null: an associative array's i as it is, an indexed one's worked out, a negative one from the end */
  if(isArr(n)&&ARR[n].A)return i===''?null:i;
  var v=arith(i);
  if(v<BigInt(0)){var L=arrLast(n);v=(L!==null?BigInt(L)+BigInt(1):BigInt(0))+v;if(v<BigInt(0))return null}
  return String(v);
}
function arrAt(n,i){ /* ${name[i]}: the element, or bash's error and nothing */
  var k=arrKey(n,i);
  if(k===null){typeLine('bash: '+n+': bad array subscript','err');return ''}
  var v=arrGet(n,k);return v===undefined?'':v;
}
function arrClone(){AGEN++;return Object.assign(Object.create(null),ARR)} /* a copy that shares each array until it changes (arrOwn) */
function arrRefill(from){for(var n in ARR)delete ARR[n];Object.assign(ARR,from)}
function setVar(n,v){ENV[n]=v}
function dquote(v){return '"'+v.replace(/(["\\$`])/g,'\\$1')+'"'} /* a value as declare -p shows it */
var BASHVARS={ /* for bash's declare, export, readonly and unset */
  asg:function(x,decl){var m=asgOf(x);if(!m)return null;try{return setAsg(m,decl)}catch(e){if(!e||e.arith===undefined)throw e;arithBad(e);return false}}, /* null: not an assignment */
  kind:function(n){return (isArr(n)?(ARR[n].A?'A':'a'):'')+(INTV[n]?'i':'')||null},
  int:function(n,on){if(on)INTV[n]=true;else delete INTV[n]}, /* declare -i n, declare +i n */
  ints:function(){return Object.keys(INTV)},
  make:function(n,A){ /* declare -a n, declare -A n: false when it is the other kind */
    if(isArr(n))return ARR[n].A===!!A;
    var v=has(ENV,n)?ENV[n]:undefined;newArr(n,A);if(v!==undefined)arrPut(n,'0',v);else ARR[n].z=true;return true;
  },
  value:function(n){ /* what declare shows after name=, or null for one with no value */
    if(!isArr(n))return has(ENV,n)||/^(USER|LOGNAME)$/.test(n)||n==='HOME'&&homeVar()!==null?dquote(envOf(n)):null;
    if(ARR[n].z)return null;
    var L=arrKeys(n).map(function(k){return '['+(ARR[n].A&&/[^\w]/.test(k)?dquote(k):k)+']='+dquote(arrGet(n,k))});
    return '('+L.join(' ')+(ARR[n].A&&L.length?' ':'')+')';
  },
  names:function(){return Object.keys(ARR)},
  unset:function(x){ /* unset name, or unset 'name[i]': false when i is no subscript */
    var m=/^([A-Za-z_]\w*)(?:\[([^\]]*)\])?$/.exec(x);
    if(!m)return false;
    if(m[2]===undefined){if(m[1]==='HOME'&&!OWNENV)ENV[GONE]=true;delete ENV[m[1]];delete ARR[m[1]];delete INTV[m[1]];return true}
    try{var k=arrKey(m[1],m[2])}catch(e){if(!e||e.arith===undefined)throw e;arithBad(e);return true}
    if(k===null)return false;
    if(isArr(m[1])||k==='0')arrDel(m[1],k);
    return true;
  }
};
BASHVARS.at=bashAt; /* how a builtin's error starts: bash: or, in a script, name: line N: */
PH.bashVars=BASHVARS;
function asgOf(x){return (bashy()?/^([A-Za-z_]\w*)(?:\[([^\]]*)\])?(\+?)=([\s\S]*)$/:/^([A-Za-z_]\w*)()()=([\s\S]*)$/).exec(x)} /* an assignment word: [name, subscript, +, value] */
function setAsg(m,decl){ /* do the assignment asgOf found: name=v, and bash's name[i]=v, name+=v, name=( ... ) and name+=( ... ). decl: declare's a or A
                            for a new array. false once it has said why it can't */
  var n=m[1],i=m[2],v=m[4],app=m[3]==='+',k;
  if(!bashy()){if(svRO(n))return false;ENV[n]=v;return true}
  function no(t){typeLine('bash: '+t+': bad array subscript','err');return false}
  if(v.charAt(0)===AMARK){
    if(i!==undefined&&i!==''){typeLine('bash: '+n+'['+i+']: cannot assign list to array member','err');return false}
    var items=JSON.parse(v.slice(1)),assoc=isArr(n)?ARR[n].A:decl==='A';
    if(!app||!isArr(n)){var v0=app&&has(ENV,n)?ENV[n]:undefined;delete ENV[n];newArr(n,assoc);if(v0!==undefined)arrPut(n,'0',v0)}
    var L0=assoc?null:arrLast(n),at=L0===null?0:+L0+1,ok=true;
    for(var j=0;j<items.length;j++){
      var it=items[j];
      if(assoc){
        k=it[0]===null?it[1]:it[0];
        var val=it[0]===null?(items[j+1]?items[++j][1]:''):it[1];
        if(k===''){ok=no("['']='"+val+"'");continue}
        arrPut(n,k,INTV[n]?intOf(val):val);
      }
      else{k=it[0]===null?String(at):arrKey(n,it[0]);if(k===null){ok=no('['+it[0]+']='+it[1]);continue}arrPut(n,k,INTV[n]?intOf(it[1]):it[1]);at=+k+1}
    }
    return ok;
  }
  if(i!==undefined){if(i===''||(k=arrKey(n,i))===null)return no(n+'['+i+']');arrPut(n,k,INTV[n]?intOf(v,app&&arrGet(n,k)):(app&&arrGet(n,k)||'')+v);return true}
  ENV[n]=INTV[n]?intOf(v,app&&has(ENV,n)?ENV[n]:undefined):(app&&has(ENV,n)?ENV[n]:'')+v;return true;
}
var INTV=Object.create(null); /* bash's declare -i: the names whose values are worked out as arithmetic when they are set */
function intOf(v,was){return String(arith(was!==undefined&&was!==false?'('+(was||'0')+')+('+v+')':v))} /* name+=v adds */
function arrItems(t){ /* the elements of x=( ... ): [key or null, value] each. [k]=v is neither split nor globbed; the others are words as on a command line */
  var out=[];
  rawWords(t).forEach(function(r){
    var m=/^\[([^\]]*)\]=([\s\S]*)$/.exec(r);
    if(m)out.push([one(m[1]),one(m[2])]);
    else words(r).forEach(function(v){out.push([null,v])});
  });
  return out;
  function words(r){var L=parseList('x '+r);return L.length?L[0].stages[0].words.slice(1):[]}
  function one(r){return r===''?'':words(r).join(' ')}
}
function rawWords(t){ /* t split at blanks outside quotes, as typed */
  var L=[],w=null,j;
  for(var i=0;i<t.length;i++){
    var c=t.charAt(i);
    if(/\s/.test(c)){if(w!==null)L.push(w);w=null;continue}
    if(c==='\\'){w=(w||'')+t.substr(i,2);i++;continue}
    if((j=quoteEnd(t,i))>=0){w=(w||'')+t.slice(i,j+1);i=j;continue}
    w=(w||'')+c;
  }
  if(w!==null)L.push(w);
  return L;
}
function homeVar(){ /* $HOME, or null when it is unset */
  if(!PROFILE.bash)return ST.home;
  if(has(ENV,'HOME'))return ENV.HOME;
  return OWNENV?(DASH?null:ST.home):ENV[GONE]?null:ST.home; /* ENV[GONE]: the session's shell unset it, and has not set it again (until then it is the home folder). A symbol, so the copies of ENV a ( ) or a shell keeps carry it, and nothing that lists ENV sees it */
}
var OWNENV=false; /* a program env started: HOME, USER and LOGNAME are what its environment has, if anything (bash sets a missing HOME from the
                     password file, variables.c's set_home_var; dash sets none) */
function envOf(k){
  if(PROFILE.bash&&!CSH&&k.charAt(0)==='{'){var px=pexp(k);if(px!==null)return px} /* ${name op word} */
  var el=PROFILE.bash&&/^\{([#!]?)(\w+)\[([^\]]*)\]\}$/.exec(k); /* bash: ${name[i]}, ${name[@]}, ${#name[@]}, ${!name[@]}; PIPESTATUS is one too */
  if(el&&DASH)badSub(k); /* dash has no arrays */
  if(el){
    var n=el[2],x=varsIn(el[3]),all=x.trim()==='@'||x.trim()==='*',ps=n==='PIPESTATUS';
    if(!all&&!(isArr(n)&&ARR[n].A))x=x.trim();
    if(all){
      var V=ps?PIPEST.map(String):arrVals(n);
      if(el[1]==='#')return String(V.length);
      if(el[1]==='!')V=ps?V.map(function(v,i){return String(i)}):arrKeys(n);
      return DQ&&x.trim()==='@'?(V.length?V.join(QSEP):QNONE):V.join(' ');
    }
    var one=ps?(PIPEST[parseInt(x,10)||0]===undefined?'':String(PIPEST[parseInt(x,10)||0])):arrAt(n,x);
    return el[1]==='#'?String(one.length):one;
  }
  if(PROFILE.bash&&/^\{#\w+\}$/.test(k))return String(envOf(k.slice(2,-1)).length); /* ${#name}: how long its value is */
  var sl=PROFILE.bash&&/^\{(\w+|[@*]):([^:}]*)(?::([^}]*))?\}$/.exec(k);
  if(sl){if(DASH)badSub(k);return substr(sl[1],sl[2],sl[3],k)}
  if(bashy()&&k==='PIPESTATUS')return String(PIPEST[0]);
  if(k.charAt(0)==='{')return envOf(k.slice(1,-1)); /* ${name} is $name */
  if(k==='?')return String(STATUS);
  if(k==='!')return LASTBG; /* sh: the last process started with & */
  if(k.length>1&&k.charAt(0)==='?'){
    var keep=SCRIPTS;SCRIPTS=0;
    try{envOf(k.slice(1));return '1'}catch(e){return '0'}finally{SCRIPTS=keep}
  }
  if(k==='#')return String(Math.max(0,ARGS.length-1));
  if(k.charAt(0)==='#')return String((k==='#argv'?ARGS.slice(1).join(' ').split(/\s+/).filter(Boolean):wordsOf(k.slice(1))).length); /* csh: $#name, how many words */
  if(k==='*')return ARGS.slice(1).join(' ');
  if(k==='@'&&!CSH){var A=ARGS.slice(1);return DQ?(A.length?A.join(QSEP):PROFILE.bash?QNONE:''):A.join(' ')} /* sh's $@: "$@" is a word for each, as bash's "${x[@]}"; with none, V7's is still one empty word */
  var sub=/^(\w+)\[([^\]]*)\]$/.exec(k); /* csh: $z[2], the second word; $z[1-2], $z[2-], $z[-2], $z[-] and $z[*] all of them */
  if(sub)return range(wordsOf(sub[1]),varsIn(sub[2]),k).join(' ');
  if(/^\d+$/.test(k))return ARGS[+k]||'';
  if(k==='$')return String(shellPid());
  if(k==='HOME'){var h=homeVar();return h===null?'':h}
  if((k==='USER'||k==='LOGNAME')&&!OWNENV)return ST.user;
  if(has(ENV,k))return ENV[k];
  if(CSH){
    if(k in CSHV)return CSHV[k];
    var V={argv:ARGS.slice(1).join(' '),status:String(STATUS),home:ST.home,user:ST.user,cwd:ST.cwd,path:(ENV.PATH||'').replace(/:/g,' '),term:ENV.TERM,shell:'/bin/csh',prompt:'% '};
    if(has(V,k)&&V[k]!==undefined)return V[k];
    if(!SCRIPTS)throw {undefinedVar:k}; /* sh scripts still get the empty string */
  }
  return '';
}
function braceEnd(s,i,dq){return nestEnd(s,i,'b',dq)} /* bash and dash: the } that closes the ${ at i (one inside it, a $( ), quotes and \ skipped), or -1. dq: inside " ", where a ' is itself */
/* braceEnd, closeDq and parenEnd, read without recursion, so a line nested thousands deep is read to its end as bash reads it:
   k 'b' a ${ }, 'd' a " ", 'p' a ( ). Each frame goes on where it was once the one inside it ends; one that is not closed
   ends a ${ } round it too (-1), and in a " " or ( ) the character it started at is an ordinary one */
function nestEnd(s,i,k,dq){
  var st=[],f={k:k,at:i,dq:dq,j:k==='b'?i+2:k==='d'?i+1:i,d:0},r,c,n,bash=PROFILE.bash&&!CSH;
  function open(k,at,dq){st.push(f);f={k:k,at:at,dq:dq,j:k==='b'?at+2:k==='d'?at+1:at,d:0}}
  for(;;){
    r=null;
    if(f.j>=s.length)r=-1;
    else{
      c=s.charAt(f.j);
      if(c==='\\'){f.j+=2;continue}
      if(f.k==='b'){
        if(c==='}')r=f.j;
        else if(c==='$'&&s.charAt(f.j+1)==='{'){open('b',f.j,f.dq);continue}
        else if(c==='$'&&s.charAt(f.j+1)==='('){open('p',f.j+1);continue}
        else if(c==='"'){open('d',f.j);continue}
        else if(c==='`'||c==="'"&&!f.dq){if((n=c==='`'?tickEnd(s,f.j):s.indexOf(c,f.j+1))<0)r=-1;else{f.j=n+1;continue}}
        else{f.j++;continue}
      }
      else if(f.k==='d'){
        if(c==='"')r=f.j;
        else if(c==='`'&&(n=tickEnd(s,f.j))>=0){f.j=n+1;continue}
        else if(c==='$'&&s.charAt(f.j+1)==='{'&&bash){open('b',f.j,true);continue}
        else{f.j++;continue}
      }
      else{
        if(c==='"'){open('d',f.j);continue}
        if(c==='$'&&s.charAt(f.j+1)==='{'&&bash){open('b',f.j,false);continue}
        if((c==="'"||c==='`')&&(n=c==='`'?tickEnd(s,f.j):s.indexOf(c,f.j+1))>=0){f.j=n+1;continue}
        if(c==='(')f.d++;else if(c===')'&&!--f.d)r=f.j;
        if(r===null){f.j++;continue}
      }
    }
    /* this frame has ended at r */
    if(!st.length)return r;
    var was=f;f=st.pop();
    if(r>=0)f.j=r+1;
    else if(f.k==='b')f.j=s.length+1; /* not closed inside a ${ }: nor is the ${ } */
    else f.j=was.at+1; /* in a " " or ( ): the $ or " it started at is an ordinary character */
  }
}
function varAt(t,i){ /* the $name, ${...} or $special at t[i] (the $), as VAR_AT has it: [all of it, what follows the $], or null */
  i=i||0;
  if(PROFILE.bash&&!CSH&&t.charAt(i+1)==='{'){var e=braceEnd(t,i,DQ);if(e>0)return [t.slice(i,e+1),t.slice(i+1,e+1)]}
  VAR_AT.lastIndex=i;return VAR_AT.exec(t);
}
function badSub(k){throw DASH?{arith:'Bad substitution',st:2,quit:true}:{arith:'${'+k.slice(1,-1)+'}: bad substitution'}}
function pexp(k){ /* bash 5.2's and dash 0.5.12's ${...} with an operator (subst.c's parameter_brace_expand; dash's expand.c, POSIX's subset):
                     - = ? + with or without :, # ## % %%, bash's / // /# /% ^ ^^ , ,, ~ ~~, @U @u @L @Q, ${!name}, ${!prefix*},
                     and ${@...} ${*...} ${name[@]...} on each element. null: a form envOf has already (${name}, ${#name}, ${name[i]}, ${name:o:l}) */
  var t=k.slice(1,-1),m;
  if(!t)badSub(k);
  if(/^#([A-Za-z_]\w*|\d+|[#?$!@*-])?$/.test(t)||/^[#!]?\w+\[[^\]]*\]$/.test(t)&&!DASH)return t==='#@'||t==='#*'?String(Math.max(0,ARGS.length-1)):null;
  if(/^![\w#?@*]/.test(t)&&!DASH){ /* ${!name}: the variable that name's value names; ${!prefix*} and ${!prefix@}: the names that start so. ${!} and ${!:-word} are $! (subst.c: a name, a digit, # ? @ or * after the !) */
    if((m=/^!([A-Za-z_]\w*)([*@])$/.exec(t))){var N=Object.keys(ENV).concat(Object.keys(ARR)).filter(function(n,i,a){return n.indexOf(m[1])===0&&a.indexOf(n)===i}).sort();return DQ&&m[2]==='@'?(N.length?N.join(QSEP):QNONE):N.join(' ')}
    if((m=/^!([A-Za-z_]\w*|\d+)$/.exec(t))){var to=envOf('{'+m[1]+'}');if(to==='')return '';if(!/^([A-Za-z_]\w*(\[[^\]]*\])?|\d+|[#?$!@*-])$/.test(to))throw {arith:to+': invalid variable name'};return envOf('{'+to+'}')}
    badSub(k);
  }
  m=/^([A-Za-z_]\w*|\d+|[#?$!@*-])(\[[^\]]*\])?/.exec(t);
  if(!m||m[2]&&(DASH||!/^[A-Za-z_]/.test(m[1])))badSub(k);
  var n=m[1],sub=m[2]?m[2].slice(1,-1):null,rest=t.slice(m[0].length);
  if(!rest)return null;
  var op=/^(:[-=?+]?|##|#|%%|%|\/[\/#%]?|\^\^|\^|,,|,|~~|~|[-=?+]|@)/.exec(rest);
  if(!op)badSub(k);
  op=op[1];var w=rest.slice(op.length);
  if(DASH&&!/^(:?[-=?+]|##?|%%?)$/.test(op))badSub(k);
  if(op===':'){ /* bash's ${name:offset:length}; ${name[@]:offset:length}, from the element numbered offset */
    if(DASH)badSub(k);
    var cut=-1;for(var q=0,dd=0;q<w.length;q++){var ch=w.charAt(q);if(ch==='$'&&w.charAt(q+1)==='{'&&(cut=braceEnd(w,q,DQ))>0){q=cut;cut=-1;continue}if(ch==='(')dd++;else if(ch===')')dd--;else if(ch===':'&&!dd){cut=q;break}}
    var o1=varsIn(cut<0?w:w.slice(0,cut)),l1=cut<0?undefined:varsIn(w.slice(cut+1));
    if(sub===null)return substr(n,o1,l1,k);
    var sv=varsIn(sub).trim();
    if(sv!=='@'&&sv!=='*')return substr({v:envOf('{'+n+'['+sub+']}')},o1,l1,k);
    if(!o1.trim()&&l1===undefined)badSub(k);
    var K=arrKeys(n),a1=Number(o1.trim()?arith(unguard(o1)):BigInt(0)),last=arrLast(n);
    if(a1<0)a1+=last===null?0:+last+1;
    var sel=a1<0?[]:K.filter(function(x){return +x>=a1});
    if(l1!==undefined){var b1=Number(l1.trim()?arith(unguard(l1)):BigInt(0));if(b1<0)throw {arith:l1.trim()+': substring expression < 0'};sel=sel.slice(0,b1)}
    sel=sel.map(function(x){return arrGet(n,x)});
    return DQ&&sv==='@'?(sel.length?sel.join(QSEP):QNONE):sel.join(' ');
  }
  var at=n==='@'||n==='*'||sub!==null&&/^\s*[@*]\s*$/.test(varsIn(sub)),star=n==='*'||sub!==null&&varsIn(sub).trim()==='*';
  var L=at?(sub!==null?(n==='PIPESTATUS'?PIPEST.map(String):arrVals(n)):ARGS.slice(1)):null;
  var val=at?L.join(' '):envOf(sub!==null?'{'+n+'['+sub+']}':/^\d+$/.test(n)?n:'{'+n+'}');
  var set=at?L.length>0:/^\d+$/.test(n)?n==='0'||+n<ARGS.length:/^[#?$-]$/.test(n)?true:n==='!'?LASTBG!=='':sub!==null?(function(){var x=arrKey(n,varsIn(sub));return x!==null&&arrGet(n,x)!==undefined})():
    has(ENV,n)||n==='HOME'&&homeVar()!==null||(n==='USER'||n==='LOGNAME')&&!OWNENV;
  var colon=op.charAt(0)===':',o=colon?op.slice(1):op;
  if(/^[-=?+]$/.test(o)){
    var empty=!set||colon&&val==='';
    if(o==='+')return empty?'':pword(w);
    if(!empty)return at?(DQ&&!star?(L.length?L.join(QSEP):QNONE):val):val;
    if(o==='-')return pword(w);
    if(o==='?'){
      var said=w===''?(DASH?(colon?'parameter not set or null':'parameter not set'):(colon?'parameter null or not set':'parameter not set')):unguard(pword(w,'msg'));
      throw {arith:n+(sub!==null?'['+sub+']':'')+': '+said,st:DASH?2:1,quit:true};
    }
    var v=unguard(pword(w,'asg')); /* = */
    if(!/^[A-Za-z_]/.test(n)||at)throw DASH?{arith:n+': bad variable name',st:2,quit:true}:{arith:'$'+n+': cannot assign in this way'};
    if(sub!==null){var key=arrKey(n,varsIn(sub));if(key!==null)arrPut(n,key,v)}else ENV[n]=v;
    return v;
  }
  var f;
  if(o==='#'||o==='##'||o==='%'||o==='%%'){
    var re=patRe(pword(w,'pat')),long=o.length===2,front=o.charAt(0)==='#';
    f=function(v){
      var i,len=v.length;
      if(!re.free.test(v))return v; /* nothing in it matches */
      if(front){for(i=long?len:0;long?i>=0:i<=len;i+=long?-1:1)if(re.test(v.slice(0,i)))return v.slice(i)}
      else for(i=long?0:len;long?i<=len:i>=0;i+=long?1:-1)if(re.test(v.slice(i)))return v.slice(0,i);
      return v;
    };
  }
  else if(o.charAt(0)==='/'){
    var sl=-1,d=0;for(var j=0;j<w.length;j++){var c=w.charAt(j),e;if(c==='\\'){j++;continue}if(c==='$'&&w.charAt(j+1)==='{'&&(e=braceEnd(w,j,DQ))>0){j=e;continue}if((c==='"'||c==="'"&&!DQ)&&(e=quoteEnd(w,j))>0){j=e;continue}if(c==='/'){sl=j;break}}
    var pw=sl<0?w:w.slice(0,sl),rw=sl<0?'':w.slice(sl+1),pat=pword(pw,'pat'),rp=pword(rw,'rep'),rx=patRe(pat),all=o==='//';
    f=function(v){
      if(pat===''&&(o==='/'||all)||!rx.free.test(v))return v;
      var out='',i=0,len=v.length,j,hit;
      function rep(x){return unguard(rp).replace(/\uE015/g,x)} /* bash 5.2's patsub_replacement: & is what matched */
      if(o==='/#'){for(j=len;j>=0;j--)if(rx.test(v.slice(0,j)))return rep(v.slice(0,j))+v.slice(j);return v}
      if(o==='/%'){for(j=0;j<=len;j++)if(rx.test(v.slice(j)))return v.slice(0,j)+rep(v.slice(j));return v}
      while(i<=len){
        hit=-1;rx.at.lastIndex=i;var mt=rx.at.exec(v); /* the longest match from i: the one match's own length when the pattern has no * */
        if(mt){if(rx.fixed){if(mt[0].length)hit=i+mt[0].length}else for(j=len;j>i;j--)if(rx.test(v.slice(i,j))){hit=j;break}}
        if(hit<0){if(i<len)out+=v.charAt(i);i++;continue}
        out+=rep(v.slice(i,hit));i=hit;
        if(!all){out+=v.slice(i);break}
      }
      return out;
    };
  }
  else if(o==='@'){
    if(!/^[UuLQ]$/.test(w))badSub(k);
    f=w==='U'?function(v){return v.toUpperCase()}:w==='L'?function(v){return v.toLowerCase()}:w==='u'?function(v){return v.charAt(0).toUpperCase()+v.slice(1)}:function(v){return "'"+v.replace(/'/g,"'\\''")+"'"};
  }
  else{ /* ^ ^^ , ,, ~ ~~: the letters that match the pattern (any, if none), the first only or each */
    var cr=w===''?null:patRe(pword(w,'pat')),one=o.length===1,how=o.charAt(0);
    f=function(v){
      return v.replace(/[\s\S]/g,function(ch,i){
        if(one&&i||cr&&!cr.test(ch))return ch;
        var up=ch.toUpperCase(),lo=ch.toLowerCase();
        return how==='^'?up:how===','?lo:ch===up?lo:up;
      });
    };
  }
  if(!at)return f(val);
  var R=L.map(f);
  return DQ&&!star?(R.length?R.join(QSEP):QNONE):R.join(' ');
}
function pword(w,how){ /* the word after a ${name op}: $names and quotes worked out. how: undefined, a value (what was quoted stays one word);
                          'pat', a pattern, with what was quoted escaped; 'rep', a / replacement, with an unquoted & for what matched;
                          'asg' and 'msg', plain text. Inside " ", a ' is itself but in a pattern */
  var o='',dq=DQ,pat=how==='pat';
  function lit(x){return pat?x.replace(/[*?[\]\\]/g,'\\$&'):how===undefined?guard(x,true):x}
  for(var i=0;i<w.length;i++){
    var c=w.charAt(i),j,m;
    if(c==='\\'&&i+1<w.length){var x=w.charAt(++i);o+=dq&&!/[$`"\\}]/.test(x)?lit('\\'+x):lit(x);continue}
    if(c==="'"&&(!dq||pat)&&(j=w.indexOf("'",i+1))>=0){o+=lit(w.slice(i+1,j));i=j;continue}
    if(c==='"'&&(j=closeDq(w,i))>=0){var keep=DQ;DQ=true;try{o+=lit(unguard(pword(w.slice(i+1,j),'asg')))}finally{DQ=keep}i=j;continue}
    if(c==='$'&&(m=varAt(w,i))){var v=envOf(m[1]);o+=pat?unguard(v):dq?lit(unguard(v)):v;i+=m[0].length-1;continue}
    if(c==='~'&&!i&&!dq&&!pat&&(m=/^~([\w.-]*)(?=\/|$)/.exec(w))){var hd=tilde(m[1]);if(hd!==null){o+=lit(hd);i+=m[0].length-1;continue}}
    if(c==='&'&&how==='rep'){o+='\uE015';continue}
    o+=dq&&!pat?lit(c):c;
  }
  return o;
}
function substr(n,o,l,k){ /* bash's ${name:offset} and ${name:offset:length}, each an arithmetic expression: a negative offset counts from the end,
                             a negative length is where to stop, counted from the end. ${@:offset:length}: the positional parameters, $0 first */
  if(!o.trim()&&l===undefined)throw {arith:'${'+k.slice(1,-1)+'}: bad substitution'};
  o=unguard(o);if(l!==undefined)l=unguard(l); /* what $( ) and ` ` gave them, as plain text */
  var pos=n==='@'||n==='*',L=pos?[ARGS[0]||''].concat(ARGS.slice(1)):typeof n==='object'?n.v:envOf(n),len=L.length; /* n: a name, or {v: a value} */
  var a=Number(o.trim()?arith(o):BigInt(0)),z=len;
  if(a<0)a+=len;
  if(l!==undefined){var b=Number(l.trim()?arith(l):BigInt(0));if(b<0){if(pos||len+b<a&&a<=len)throw {arith:l.trim()+': substring expression < 0'};z=len+b}else z=a+b}
  if(a<0||a>len)return pos&&DQ&&n==='@'?QNONE:'';
  var r=L.slice(a,Math.max(a,Math.min(z,len)));
  return !pos?r:DQ&&n==='@'?(r.length?r.join(QSEP):QNONE):r.join(' ');
}
function range(L,np,k){ /* the words of L that [np] picks, as 4.3BSD's sh.dol.c has it: [0] is none, [5-] past the end none too */
  var lwb=1,upb=L.length,m;
  function oob(){throw {undefinedVar:k,msg:'Subscript out of range.'}}
  function syntax(){throw {undefinedVar:k,msg:'Variable syntax.'}}
  if(!np)syntax();
  if((m=/^\d+/.exec(np))){
    var i=+m[0];np=np.slice(m[0].length);
    if(i>upb&&!/^[-*]/.test(np))oob();
    lwb=i;
    if(!np){upb=lwb;np='*'}
  }
  if(np.charAt(0)==='*')np=np.slice(1);
  else if(np.charAt(0)!=='-')syntax();
  else{
    var j=upb;np=np.slice(1);
    if((m=/^\d+/.exec(np))){j=+m[0];np=np.slice(m[0].length);if(j>upb)oob()}
    upb=j<lwb?lwb-1:j;
  }
  if(!lwb){if(upb)oob();upb=-1}
  if(np)syntax();
  return upb<lwb?[]:L.slice(lwb-1,upb);
}
function wordsOf(k){var v=envOf(k),l=CSHW[k];return l&&l.s===v?l.w:v.split(/\s+/).filter(Boolean)} /* csh: set z = ( "a b" c ) keeps its words */
function glob(w){ /* a word with * ? [ ] becomes the names it matches, sorted; no match leaves it as it is */
  if(!/[*?\[]/.test(w))return [w];
  var abs=w.charAt(0)==='/',found=[abs?'/':''];
  w.split('/').filter(Boolean).forEach(function(seg){
    var next=[];
    if(!/[*?\[]/.test(seg)){
      found.forEach(function(p){next.push(p+seg+'/')});
      found=next;
      return;
    }
    var re;
    try{re=globRe(seg,PROFILE.caseless?'i':'')}catch(e){found=[];return}
    found.forEach(function(p){
      var d=find(p||'.');
      if(!d||d.type!=='d'||d.prot)return;
      Object.keys(d.kids).sort().forEach(function(k){
        if(re.test(k)&&(k.charAt(0)!=='.'||seg.charAt(0)==='.'))next.push(p+k+'/');
      });
    });
    found=next;
  });
  found=found.map(function(p){return p.replace(/\/$/,'')}).filter(function(p){return p&&find(p)});
  return found.length?found:[w];
}
var NOMATCH={};
function colonRows(p){var f=find(p,true);return f&&f.type==='f'?textOf(f).map(function(l){return l.split(':')}):[]} /* a file of colon-separated fields, /etc/passwd or /etc/group, line by line */
function passwd(u,n){return colonRows('/etc/passwd').filter(function(x){return x[0]===u&&x.length>(n||5)})[0]||null} /* u's /etc/passwd entry, the first with more than n (5) fields */
function tilde(u){ /* what ~ or ~user stands for: bash's $HOME (~+ and ~- its PWD and OLDPWD), csh's home, a user's from /etc/passwd. null: bash leaves it as typed; csh says Unknown user */
  if(!u){var h=homeVar();return h!==null?h:DASH?null:ST.home} /* HOME unset: bash takes the password file's, dash leaves ~ as typed */
  if(bashy()&&(u==='+'||u==='-'))return u==='+'?ST.cwd:typeof ENV.OLDPWD==='string'?ENV.OLDPWD:null;
  var r=passwd(u);
  if(r)return r[5];
  if(CSH&&!PROFILE.bash)throw {undefinedVar:u,msg:'Unknown user: '+u+'.'};
  return null;
}
/* what a `command` printed is data: its special characters travel as private-use ones until the words are made */
var META='|&<>$`"\'\\# ;',SEP='\uE010'; /* SEP: where a `command`'s output starts; unguard drops it */
function guard(t,spaces){
  return t.replace(spaces?/[|&<>$`"'\\# ;]/g:/[|&<>$`"'\\#;]/g,function(c){return String.fromCharCode(0xE000+META.indexOf(c))});
}
function unguard(t){return t.replace(/\uE010|\uE014/g,'').replace(/\uE013/g,' ').replace(/[\uE000-\uE00B]/g,function(c){return META.charAt(c.charCodeAt(0)-0xE000)})}
function parseList(s,o){ /* a line with no top-level ; into [{op,stages:[{words,raw,in,out,app}]}]. o.check: only read it, for its syntax: no variables, no wildcards */
  var check=!!(o&&o.check);
  var list=[],stages=[],op=null,w=null,quoted=false,fromVar=false,redir=null,i=0,piped=false,at=0,neg=false,timed=null,pd=0; /* at: where this stage's text starts. neg, timed: bash's ! and time before a pipeline. pd: ( kept in words, not yet closed */
  function fresh(){return {words:[],ends:[],raw:'',src:'',in:null,out:null,app:false,err:null,glass:false,mk:[]}}
  var st=fresh();
  function add(r,c){st.raw+=r;st.src+=c===undefined?r:c} /* raw has the values of variables, src the names */
  function endWord(){
    if(w===null)return;
    if(PROFILE.bash&&!redir&&!quoted&&!fromVar&&!stages.length&&!st.words.length&&st.sub===undefined&&(w==='!'||bashy()&&(w==='time'&&!timed||w==='-p'&&timed==='time'))){ /* ! and time [-p]: reserved words before a pipeline */
      if(w==='!')neg=!neg;else timed=w;
      st.raw=st.src='';w=null;return;
    }
    if(redir){w=unguard(w);if(redir==='<<<')st.here=w;else if(redir==='<'){st.in=w;st.hd=undefined}else if(redir==='n<'){}else if(redir==='n>'||redir==='n>>')st.mk.push({f:w,app:redir==='n>>'});else if(redir==='2>'||redir==='2>>'){st.err=w;st.errApp=redir==='2>>';st.e2o=false;if(st.glass)st.glassOld=true}else{st.out=w;st.app=redir==='>>';st.glass=false}redir=null}
    else if(quoted&&!CSH&&/[\uE013\uE014]/.test(w)){if(w!==QNONE)w.split(QSEP).forEach(function(x){st.words.push(unguard(x))})} /* "${x[@]}": a word for each element, and none for none */
    else if(quoted||PROFILE.dos)st.words.push(unguard(w));
    else w.split(fromVar?/\s+/:/\0/).filter(function(x){return (x||!fromVar)&&!(x.indexOf('\uE010')>=0&&unguard(x)==='')}).forEach(function(x){ /* empty backtick output is no word at all */
      x=unguard(x);
      if(CSH&&/^(@|unalias)$/.test(st.words[0])){st.words.push(x);return} /* @ x = 2 * 3: no wildcards; unalias takes patterns (sh.func.c's unset1) */
      if(check||bashy()&&/^[A-Za-z_]\w*\[[^\]]*\]\+?=/.test(x)&&st.words.every(function(y){return asgOf(y)})){st.words.push(x);return} /* x[1]=v: an assignment, not a pattern */
      var g=glob(x);
      if(CSH&&g.length===1&&g[0]===x&&/[*?\[]/.test(x))throw NOMATCH; /* csh says so; sh passes the word along */
      g.forEach(function(y){st.words.push(y)});
    });
    for(var e=[st.raw.length,st.src.length];st.ends.length<st.words.length;)st.ends.push(e); /* where each word ends in raw and src */
    w=null;quoted=false;fromVar=false;
  }
  function endStage(tok){
    endWord();
    if(redir&&!PROFILE.dos)throw {syntax:tok,redir:true}; /* echo a > : a redirection with no name */
    if(CSH&&!st.words.length&&st.sub===undefined&&(st.in!==null||st.out!==null)){
      if(!/\S/.test(st.src))throw {syntax:tok}; /* > f, or echo a &> f: a redirection with no command (4.3BSD's syn3) */
      st.in=st.out=null; /* $empty > f: no command once the words are made, and csh does nothing at all */
    }
    if(st.sub!==undefined&&st.words.length||st.paren)throw {syntax:st.words[0],paren:true}; /* (a) b, and csh's (a) 2>f: its 2 is a word (4.3BSD's syn3: Badly placed ()'s) */
    if((st.cond!==undefined||st.arith!==undefined)&&st.words.length)throw {syntax:st.words[0]}; /* [[ a ]] b */
    st.text=s.slice(at,i).replace(/^\s*(\|&?|&&|\|\||&)?\s*/,'').trim();at=i; /* as typed, for the job table */
    st.raw0=st.raw;st.raw=unguard(st.raw);if(st.words.length||st.in||st.out||st.err||st.glass||st.sub!==undefined||st.cond!==undefined||st.arith!==undefined||st.here!==undefined||st.hd!==undefined)stages.push(st);st=fresh();
  }
  function blank(){return w===null&&!/\S/.test(st.src)&&st.cond===undefined&&st.arith===undefined&&st.in===null&&st.here===undefined&&st.hd===undefined&&st.out===null&&st.err===null&&!st.glass&&!st.e2o&&!st.closed&&!st.errClosed&&!st.mk.length} /* nothing written for this command */
  function endList(nextOp){endStage(nextOp||'newline');if(stages.length||timed)list.push({op:op,stages:stages,neg:neg,time:timed});stages=[];op=nextOp;piped=false;neg=false;timed=null}
  while(i<s.length){
    var ch=s.charAt(i),two=s.substr(i,2),close;
    if(/\s/.test(ch)){endWord();if(!redir)add(ch);i++;continue}
    if(PROFILE.dos){ /* COMMAND.COM: pipes and redirection, and nothing else is special */
      if(!PROFILE.dcl&&ch==='|'){endStage();i++;continue}
      if(!PROFILE.dcl&&(ch==='>'||ch==='<')){endWord();redir=two==='>>'?'>>':ch;i+=redir.length;continue}
      if(!redir)add(ch);
      w=(w||'')+ch;i++;
      continue;
    }
    if(ch==='#'&&w===null)break;
    if(bashy()&&blank()&&st.sub===undefined&&st.cond===undefined&&st.arith===undefined&&(two==='[['||two==='((')&&(e=dblEnd(s,i))>0){ /* [[ ... ]], (( ... )): read when it runs */
      if(two==='[['){st.cond=s.slice(i+2,e-1);if(check){var cp=condParse(st.cond,s.slice(e+1).match(/^\s*(\|\||&&|;;|[|&;<>()]|[^\s|&;<>()]+)?/)[1]);if(cp.bad)throw {syntax:'[[',cond:cp.bad}}}else st.arith=s.slice(i+2,e-1);
      add(s.slice(i,e+1));i=e+1;continue;
    }
    if(ch==='('&&!PROFILE.noUnix&&blank()&&st.sub===undefined){ /* ( list ): a subshell, run as its own process (runSub); what is inside is read when it runs */
      var e=parenEnd(s,i);
      if(e<0)throw {syntax:'end',paren:'open'};
      st.sub=s.slice(i+1,e);add(s.slice(i,e+1));i=e+1;continue;
    }
    if(ch==='('&&bashy()&&w!==null&&!redir&&(!st.words.length||/^(declare|typeset|local|export|readonly)$/.test(st.words[0]))&&/^[A-Za-z_]\w*(\[[^\]]*\])?\+?=$/.test(w)&&(e=parenEnd(s,i))>0){ /* x=(1 2), declare -a x=(1 2): one word. $x is its first element */
      add(s.slice(i,e+1));w+=AMARK+(check?'':JSON.stringify(arrItems(s.slice(i+1,e))));quoted=true;i=e+1;continue; /* its elements, worked out now, for setAsg */
    }
    if(ch==='('&&!PROFILE.noUnix&&!PROFILE.dos&&w!==null&&!redir&&!/\$$/.test(w))endWord(); /* echo a(b): the ( ends the word, in all three (V7's ctype makes ( a metacharacter). Not $( or bash's x=( */
    if(ch==='('&&!PROFILE.noUnix&&w===null&&!redir&&!/^(\[\[|function)$/.test(st.words[0]||'')){ /* echo (a), (a) (b): a ( where no subshell can start */
      if(CSH){ /* 4.3BSD's syn3: words beside a ( ) are Badly placed ()'s, a second ( ) Badly placed (, and syn0 says Too many ('s first. set, if, while and the like take ( ) as words */
        if(!/^(set|if|while|foreach|switch|exit|@|else)$/.test(st.words[0]||'')){
          if(st.sub!==undefined||st.paren)throw {syntax:'(',paren:'('};
          if((e=parenEnd(s,i))<0)throw {syntax:'end',paren:'open'};
          st.paren=true;add(s.slice(i,e+1));i=e+1;continue;
        }
      }
      else if(DASH&&/=/.test(st.words[0]||''))throw {syntax:'('}; /* dash: a=( is no function's name ( */
      else if(PROFILE.bash&&st.sub===undefined&&st.words.length===1&&/^\s*\S+\s*$/.test(st.src)){ /* bash: name ( is a function's start, so the token after the ( is the one it did not expect */
        var nx=s.slice(i+1).match(/^\s*(\|\||&&|;;|[|&;<>()]|[^\s|&;<>()]+)?/)[1];
        if(nx!==')'){if(DASH)DWANT=')';throw {syntax:nx||'newline'}}
      }
      else throw {syntax:'('}; /* bash and V7: a ( after the words, or after a ( ) */
    }
    if(ch==='{'&&blank()&&st.sub===undefined&&(e=groupEnd(s,i))!==-1){ /* { list; }: the list, in this shell; a redirection after it is for all of it */
      if(e<0)throw {syntax:'end'};
      st.sub=s.slice(i+1,e);st.group=true;add(s.slice(i,e+1));i=e+1;continue;
    }
    if(two==='&&'||two==='||'){endList(two);i+=2;continue}
    if(ch==='|'){
      if(blank())throw {syntax:'|'}; /* | echo: no command before it */
      if((CSH||bashy())&&two==='|&'){st.both=true;i++} /* |&: the errors go down the pipe too */
      endStage('|');piped=true;i++;continue;
    }
    if(bashy()&&two==='&>'){endWord();redir=s.charAt(i+2)==='>'?'>>':'>';st.both=true;st.glass=false;i+=redir.length+1;continue} /* &> f, &>> f: errors and all */
    if(ch==='&'){if(blank())throw {syntax:'&'};endList(null);i++;continue} /* no background here: it just runs, and what follows is a command of its own */
    if(two==='<<'&&s.charAt(i+2)===HDM){endWord();var hn=/^\d+/.exec(s.slice(i+3))[0];st.hd=+hn;st.in=null;i+=3+hn.length;continue} /* a here-document hereJoin took the body of */
    if(ch==='>'||ch==='<'){
      var fd=!CSH&&w!==null&&!quoted&&!fromVar&&/^\d$/.test(w)?w:null; /* sh: 2> names a file descriptor, not an argument. csh has no such thing */
      if(fd!==null){w=null;st.raw=st.raw.slice(0,-1);st.src=st.src.slice(0,-1)}
      endWord();
      if(two==='>&'&&!CSH&&/^[\d-](?=$|[\s|&<>])/.test(s.slice(i+2))){var to=s.charAt(i+2),one=fd===null||fd==='1';
        if(fd==='2'&&to==='1'){st.e2o=true;st.e2oFirst=st.out===null}else if(to==='2'&&one&&!st.e2o){st.glass=true;st.glassOld=false}else if(to==='-'&&one)st.closed=true;else if(to==='-'&&fd==='2')st.errClosed=true;
        i+=3;continue} /* 2>&1, 2>&-: errors are on the glass either way. >&2 sends the output there too */
      if(two==='>&'){redir='>';if(CSH)st.both=true;i+=s.charAt(i+2)==='!'?3:2;continue} /* csh: >& file, errors and all */
      if(PROFILE.bash&&fd===null&&s.substr(i,3)==='<<<'){if(DASH)throw {syntax:'redirection'};redir='<<<';i+=3;continue} /* <<< word: the word and a newline are its input (dash: redirection unexpected) */
      redir=two==='>>'?'>>':ch;
      i+=redir.length;
      if(CSH&&redir==='>>'&&s.charAt(i)==='&'){st.both=true;i++}
      if(fd==='2'&&ch==='>')redir=redir==='>>'?'2>>':'2>'; /* errors go there */
      else if(fd!==null&&fd!=='1'&&ch==='>')redir=redir==='>>'?'n>>':'n>'; /* 0> or 3>: made, and nothing goes in it */
      else if(fd!==null&&fd!=='0'&&ch==='<')redir='n<'; /* 3<: opened, and not read */
      continue;
    }
    if(!redir)add(ch);
    if(ch==='\\'&&i+1<s.length){
      w=(w||'')+s.charAt(i+1);quoted=true;
      if(!redir)add(s.charAt(i+1));
      i+=2;continue;
    }
    if((ch==="'"||ch==='"')&&(close=ch==='"'&&!CSH?closeDq(s,i):s.indexOf(ch,i+1))>=0){ /* a quote anywhere in a word: a"&"b is a&b */
      var inside=s.slice(i+1,close),given=inside;
      if(ch==='"')inside=varsIn(CSH?inside:inside.replace(/\\([$`"\\\n])/g,function(m,x){return x==='\n'?'':guard(x)}),!CSH); /* sh: inside "", a backslash quotes only $ ` " \ and a newline; csh's quotes have no backslash in them */
      w=(w||'')+inside;quoted=true;
      if(!redir)add(inside+ch,given+ch);
      i=close+1;continue;
    }
    var asg=ch==='~'&&w!==null&&PROFILE.bash&&(/^[A-Za-z_]\w*=$/.test(w)&&!quoted&&!fromVar||/^[A-Za-z_]\w*=/.test(w)&&s.charAt(i-1)===':'&&s.charAt(i-2)!=='\\')&&
      (!DASH||/^(export|readonly|local)$/.test(st.words[0])||st.words.every(function(y){return asgOf(y)})); /* in an assignment: after its = or an unquoted :. bash: in any word that looks like one; dash: only one before the command's name, or export's, readonly's or local's */
    if(ch==='~'&&!check&&(PROFILE.bash||CSH)&&(w===null||asg)&&(m=(asg?/^~(\+|-|[\w.][\w.-]*|)(?=$|[\/\s;&|<>():])/:/^~(\+|-|[\w.][\w.-]*|)(?=$|[\/\s;&|<>()])/).exec(s.slice(i)))){ /* ~ and ~user at a word's start (bash and dash: after an assignment's = or : too, where a : also ends the user's name); V7's sh had none */
      var hd=tilde(m[1]);
      if(hd!==null){w=(w||'')+hd;if(!redir){st.raw=st.raw.slice(0,-1)+hd;st.src+=m[0].slice(1)}i+=m[0].length;continue}
    }
    if(ch==='$'&&check&&PROFILE.bash&&s.charAt(i+1)==='{'&&(e=braceEnd(s,i))>0){add(s.slice(i,e+1));w=(w||'')+s.slice(i,e+1);i=e+1;continue} /* ${x: -2}, ${x:(-3)}: one word */
    if(ch==='$'&&!check){
      var m=varAt(s,i);
      if(m){
        var val=envOf(m[1]);
        w=(w||'')+val;fromVar=true;
        if(!redir){st.raw=st.raw.slice(0,-1)+val;st.src+=m[0].slice(1)}
        i+=m[0].length;continue;
      }
    }
    if(ch==='('&&!PROFILE.noUnix)pd++; /* a ( kept in a word: $( ), $(( )), csh's set x = ( ) and if ( 1 && 1 ), [[ ( ) ]] */
    else if(ch===')'&&!PROFILE.noUnix){if(pd)pd--;else throw {syntax:')',paren:'close'}} /* echo :) : a ) that closes nothing (bash, V7's `)' unexpected, csh's Too many )'s) */
    w=(w||'')+ch;i++;
  }
  if(piped&&blank()&&!PROFILE.dos)throw {syntax:'end'}; /* echo x | and nothing after it */
  endList(null);
  return list;
}
function parenEnd(s,i){return nestEnd(s,i,'p')} /* the ) that closes the ( at i, outside quotes */
function groups(){return !CSH&&!PROFILE.dos&&!PROFILE.noUnix} /* sh and bash have { list; } */
function atCmd(s,i){ /* where a command starts: a { or } there is a reserved word. Read back from i: past blanks, then a word of at most 5 */
  var k=i;
  while(k>0&&/\s/.test(s.charAt(k-1)))if(s.charAt(--k)==='\n')return true;
  return /(^|[;&|(){}]|(^|[\s;&|(){}])(do|then|else|elif|if|while|until|!))$/.test(s.slice(Math.max(0,k-6),k));
}
function groupEnd(s,i){ /* the } that closes a { list; } at i: -1 when s[i] starts none, -2 when it is not closed. A } closes it only where
                           a command would start (after ; & or a newline), and a { opens one only there, followed by a blank */
  if(!groups()||s.charAt(i)!=='{'||/\S/.test(s.charAt(i+1))||!atCmd(s,i))return -1;
  for(var d=0,j=i,k;j<s.length;j++){
    var c=s.charAt(j);
    if(c==='\\'){j++;continue}
    if((k=quoteEnd(s,j))>=0){j=k;continue}
    if(c==='#'&&(!j||/[\s;|&<>]/.test(s.charAt(j-1)))){var nl=s.indexOf('\n',j);if(nl<0)break;j=nl-1;continue} /* a comment, to the end of its line */
    if(c==='{'&&(j===s.length-1||/\s/.test(s.charAt(j+1)))&&atCmd(s,j))d++;
    else if(c==='}'&&/^$|[\s;&|<>)]/.test(s.charAt(j+1))&&atCmd(s,j)&&!--d)return j;
  }
  return -2;
}
function lastGood(L,cut){while(cut>0){try{parseTree(L.slice(0,cut));break}catch(e){cut--}}return cut} /* how many of the first cut lines make whole commands */
function walkTree(B,fn){B.forEach(function(n){fn(n);[n.body,n.cond,n.then,n.els].forEach(function(x){if(x)walkTree(x,fn)});(n.arms||[]).forEach(function(a){walkTree(a.body,fn)})})} /* fn on each command of a tree, and of the ones inside it */
function treeOf(lines,end){ /* parseTree, or null once it has said what was wrong. end: what to say when the lines stop short */
  try{return parseTree(lines)}catch(e){synSay(e===MORE?end||syntaxError('end'):e.message);return null}
}
function skipEnd(s,i,depth){ /* where a quote, `command` or (outside ( ), at depth 0) { list; } at i ends: -1 when none starts there, -2 when a { is not closed */
  var j=quoteEnd(s,i);
  var c=s.charAt(i);
  return j>=0?j:!depth&&c==='{'?groupEnd(s,i):bashy()&&(c==='['||c==='(')&&s.charAt(i+1)===c?dblEnd(s,i):-1; /* bash's [[ ]] and (( )): one command */
}
/* bash's [[ ]] and (( )), and brace expansion in bash and csh */
function dblEnd(s,i){ /* bash: where a [[ ... ]] or (( ... )) that starts a command at i ends (its last ] or )), or -1 */
  var c=s.charAt(i);
  if(!bashy()||c!=='['&&c!=='('||s.charAt(i+1)!==c||!atCmd(s,i))return -1;
  var two=s.substr(i,2),e;
  if(two==='(('){e=parenEnd(s,i);return e>0&&s.charAt(e-1)===')'&&parenEnd(s,i+1)===e-1?e:-1}
  if(two!=='[['||(i+2<s.length&&!/\s/.test(s.charAt(i+2))))return -1;
  for(var j=i+2,k;j<s.length;j++){
    var c=s.charAt(j);
    if(c==='\\'){j++;continue}
    if((k=quoteEnd(s,j))>=0){j=k;continue}
    if(s.substr(j,2)===']]'&&/\s/.test(s.charAt(j-1))&&(j+2>=s.length||/[\s;&|)<>]/.test(s.charAt(j+2))))return j+1;
  }
  return -1;
}
function dqWord(t,pat){ /* a word of [[ ]] or (( )): $names worked out, quotes taken off, no splitting or wildcards. pat: as a pattern
                           (glob, or re for =~), where what was quoted stands for itself */
  var o='',j,m,esc=pat==='re'?function(x){return x.replace(/[.*+?^${}()|[\]\\\/]/g,'\\$&')}:pat?function(x){return x.replace(/[*?[\]\\]/g,'\\$&')}:function(x){return x};
  for(var i=0;i<t.length;i++){
    var c=t.charAt(i);
    if(c==='\\'&&i+1<t.length){o+=esc(t.charAt(++i));continue}
    if(c==="'"&&(j=t.indexOf("'",i+1))>=0){o+=esc(t.slice(i+1,j));i=j;continue}
    if(c==='"'&&(j=closeDq(t,i))>=0){o+=esc(unguard(varsIn(t.slice(i+1,j).replace(/\\([$`"\\])/g,function(x,y){return guard(y)}))));i=j;continue}
    if(c==='$'&&(m=varAt(t,i))){o+=unguard(envOf(m[1]));i+=m[0].length-1;continue}
    o+=/[\uE000-\uE014]/.test(c)?esc(unguard(c)):c;
  }
  return o;
}
var POSIXCL={alpha:'a-zA-Z',digit:'0-9',alnum:'a-zA-Z0-9',upper:'A-Z',lower:'a-z',space:' \\t\\n\\r\\f\\v',blank:' \\t',punct:'!-\\/:-@\\[-`{-~',xdigit:'0-9A-Fa-f',word:'\\w',cntrl:'\\x00-\\x1f\\x7f',print:' -~',graph:'!-~'};
var PATRES=new Map(); /* patRe's, by pattern (a few hundred at most) */
function patRe(p){ /* a glob pattern from dqWord(t,true) as a RegExp: * ? [...] ([!...] too, and [:class:]), \x for x */
  var r=PATRES.get(p);if(r)return r;
  if(PATRES.size>200)PATRES.clear();
  var o='';
  for(var i=0;i<p.length;i++){
    var c=p.charAt(i),j;
    if(c==='\\'&&i+1<p.length){o+=p.charAt(++i).replace(/[.*+?^${}()|[\]\\\/]/g,'\\$&');continue}
    if(c==='*'){o+='[\\s\\S]*';continue}
    if(c==='?'){o+='[\\s\\S]';continue}
    if(c==='['&&(j=brk(p,i,true))){o+=j.src;i=j.end;continue}
    o+=c.replace(/[.+^${}()|[\]\\\/]/g,'\\$&'); /* a [ with no ] is itself */
  }
  try{r=new RegExp('^'+o+'$');r.free=new RegExp(o);r.at=new RegExp(o,'y');r.fixed=o.indexOf('[\\s\\S]*')<0}catch(e){r=/(?!)/;r.free=r.at=r;r.fixed=true} /* anything else a RegExp cannot take matches nothing.
    free: a match anywhere; at: one from lastIndex; fixed: no *, so every match is as long */
  PATRES.set(p,r);return r;
}
var CONDBIN=/^(==|=|!=|<|>|=~|-eq|-ne|-lt|-le|-gt|-ge|-nt|-ot|-ef)$/,CONDUN=/^-[abcdefghknoprstuvwxzGLNORS]$/;
function condToks(t){ /* the tokens of [[ ]]: words as typed, and && || ( ) ! < > ; the word after =~ may hold ( ) and | */
  var T=[],i=0,j;
  while(i<t.length){
    var c=t.charAt(i),two=t.substr(i,2);
    if(/\s/.test(c)){i++;continue}
    if(two==='&&'||two==='||'){T.push({op:two});i+=2;continue}
    if(/[()<>]/.test(c)&&!(T.length&&T[T.length-1].w==='=~')){T.push({op:c});i++;continue}
    var w='',re=T.length&&T[T.length-1].w==='=~',d=0;
    for(;i<t.length;i++){
      c=t.charAt(i);
      if(c==='\\'){w+=t.substr(i,2);i++;continue}
      if((j=quoteEnd(t,i))>=0){w+=t.slice(i,j+1);i=j;continue}
      if(re){if(c==='(')d++;else if(c===')'){if(!d)break;d--}else if(/\s/.test(c)&&!d)break;w+=c;continue}
      if(/[\s()<>]/.test(c)||t.substr(i,2)==='&&'||t.substr(i,2)==='||')break;
      w+=c;
    }
    T.push({w:w});
  }
  return T;
}
function condParse(t,after){ /* [[ ]] read into a tree, or {bad:[what bash says]}. after: the token after its ]] */
  var T=condToks(t),k=0;
  function tok(){return T[k]}
  function word(x){return x&&x.w!==undefined}
  function fail(m){throw {condBad:m}}
  function near(){var x=T[k];return x?(x.op||x.w):']]'}
  function nearErr(){fail(['bash: syntax error near `'+near()+"'"])}
  function or(){var l=and();while(tok()&&tok().op==='||'){k++;l={or:[l,and()]}}return l}
  function and(){var l=not();while(tok()&&tok().op==='&&'){k++;l={and:[l,not()]}}return l}
  function not(){if(tok()&&tok().w==='!'&&T[k+1]&&!(T[k+1].op&&/[<>]/.test(T[k+1].op))&&!(T[k+1].w!==undefined&&CONDBIN.test(T[k+1].w))){k++;return {not:not()}}return prim()}
  function prim(){
    var x=tok();
    if(!x)nearErr();
    if(x.op==='('){k++;var e=or();if(!tok()||tok().op!==')')nearErr();k++;return e}
    if(!word(x))nearErr();
    k++;
    var n=tok(),op=n&&(n.op&&/[<>]/.test(n.op)?n.op:n.w!==undefined&&CONDBIN.test(n.w)?n.w:null);
    if(op){k++;var y=tok();if(!word(y))fail(['bash: unexpected argument `'+(y?y.op:']]')+"' to conditional binary operator",'bash: syntax error near `'+(y?y.op:']]')+"'"]);k++;return {bin:op,a:x.w,b:y.w}}
    if(CONDUN.test(x.w)&&word(n)){k++;return {un:x.w,a:n.w}}
    if(word(n))fail(['bash: conditional binary operator expected','bash: syntax error near `'+n.w+"'"]);
    return {one:x.w};
  }
  if(!T.length)return {bad:["bash: syntax error near `"+(after||'newline')+"'"]}; /* [[ ]]: bash takes the ]] for a word, and stops at what follows */
  try{var e=or();if(k<T.length)nearErr();return e}catch(x){if(x&&x.condBad)return {bad:x.condBad};throw x}
}
function condEval(e){ /* true or false; an arithmetic error is thrown on */
  if(e.or)return condEval(e.or[0])||condEval(e.or[1]);
  if(e.and)return condEval(e.and[0])&&condEval(e.and[1]);
  if(e.not)return !condEval(e.not);
  if(e.one!==undefined)return dqWord(e.one)!=='';
  if(e.un){
    var v=dqWord(e.a),u=e.un.charAt(1);
    if(u==='z')return v==='';
    if(u==='n')return v!=='';
    if(u==='v')return has(ENV,v)||isArr(v);
    if(u==='o'||u==='t')return false;
    if(u==='h'||u==='L'){var l=v?find(v,true,false,true):null;return !!l&&l.type==='s'} /* the link itself (lstat), not what it points to */
    var n=v?find(v,true):null;
    if(!n)return false;
    if(u==='d')return n.type==='d';
    if(u==='f')return n.type!=='d'&&!n.dev;
    if(u==='c')return !!n.dev;
    if(u==='s')return n.type==='d'||fsize(n)>0;
    if(u==='r'||u==='w'||u==='x')return access(n,u);
    if(u==='O'||u==='G')return n.owner===undefined||n.owner===ST.user;
    return u==='a'||u==='e';
  }
  var op=e.bin,a=dqWord(e.a);
  if(op==='=='||op==='='||op==='!=')return patRe(dqWord(e.b,true)).test(a)===(op!=='!=');
  if(op==='<')return a<dqWord(e.b);
  if(op==='>')return a>dqWord(e.b);
  if(op==='=~'){
    var re;try{re=new RegExp(dqWord(e.b,'re').replace(/\[:(\w+):\]/g,function(m,k){return POSIXCL[k]||''}))}catch(x){throw {condRe:true}}
    var m=re.exec(a);delete ENV.BASH_REMATCH;newArr('BASH_REMATCH',false);
    if(m)m.forEach(function(x,i){arrPut('BASH_REMATCH',String(i),x===undefined?'':x)});
    return !!m;
  }
  if(/^-(eq|ne|lt|le|gt|ge)$/.test(op)){
    var x=arith(a),y=arith(dqWord(e.b));
    return {'-eq':x===y,'-ne':x!==y,'-lt':x<y,'-le':x<=y,'-gt':x>y,'-ge':x>=y}[op];
  }
  var f=find(a,true),g=find(dqWord(e.b),true);
  if(op==='-ef')return !!f&&f===g;
  var ft=function(n){return n&&n.date?+n.date:0};
  return op==='-nt'?!!f&&(!g||ft(f)>ft(g)):!!g&&(!f||ft(f)<ft(g));
}
function condRun(t){ /* in a step: [[ t ]]: status 0 when true, 1 when false, 2 for a regular expression that does not compile */
  var e=condParse(t);
  if(e.bad){e.bad.forEach(synSay);return}
  try{STATUS=condEval(e)?0:1}
  catch(x){if(x&&x.condRe){STATUS=2;return}if(!x||x.arith===undefined)throw x;typeLine(bashAt()+'[[: '+x.arith,'err');STATUS=1}
}
function arithRun(t,who){ /* in a step: (( t )) or a word of let: status 0 when it is not 0. An error says so with who, and its status is 1 */
  try{return arith(dqWord(t))}
  catch(x){if(!x||x.arith===undefined)throw x;typeLine(bashAt()+who+': '+x.arith,'err');return null}
}
if(PROFILE.bash)CMDS.let=function(a,raw,words){ /* bash's let: each word an expression; 1 when the last is 0, or on an error */
  var W=words.slice(1),v=null;
  if(!W.length){typeLine(bashAt()+'let: expression expected','err');STATUS=1;return}
  for(var i=0;i<W.length;i++){v=arithRun(W[i].replace(/[\\'"$`]/g,'\\$&'),'let');if(v===null){STATUS=1;return}}
  STATUS=v!==BigInt(0)?0:1;
};
function braces(s){ /* brace expansion, word by word, outside quotes and `commands`: bash's {a,b} and {1..5} ({a} and {} stay as they are,
                       and no x={a,b} assignment), 4.3BSD csh's {a,b} (sh.glob.c: its {a} is a, and a { with no } is Missing }) */
  if(s.indexOf('{')<0||PROFILE.dos||PROFILE.noUnix||!bashy()&&!CSH)return s;
  var out='',w=null,j;
  function flush(){if(w===null)return;if(CSH)w=w.replace(/'[^']*'|"[^"]*"|\\[\s\S]|\$(\w+)(?=\{)/g,function(m,n){return n?'${'+n+'}':m}); /* csh works out $x before its braces: $x{a,b} is the value, then a or b; quoted or escaped text is left as typed */
    out+=w.indexOf('{')<0||PROFILE.bash&&/^[A-Za-z_]\w*(\[[^\]]*\])?\+?=/.test(w)||CSH&&/^\{\}?$/.test(w)?w:brace1(w).join(' ');w=null}
  for(var i=0;i<s.length;i++){
    var c=s.charAt(i);
    if(c==='\\'){w=(w||'')+s.substr(i,2);i++;continue}
    if((j=quoteEnd(s,i))>=0){w=(w||'')+s.slice(i,j+1);i=j;continue}
    if(w===null&&(j=dblEnd(s,i))>=0){out+=s.slice(i,j+1);i=j;continue}
    if(c==='#'&&w===null){out+=s.slice(i);return out}
    if(/[\s;&|<>()]/.test(c)){flush();out+=c;continue}
    w=(w||'')+c;
  }
  flush();
  return out;
}
function brace1(w){ /* one word's expansions, in order */
  for(var i=0,j;i<w.length;i++){
    var c=w.charAt(i);
    if(c==='\\'){i++;continue}
    if((j=quoteEnd(w,i))>=0){i=j;continue}
    if(c==='$'&&w.charAt(i+1)==='{'){for(j=i+2;j<w.length&&w.charAt(j)!=='}';j++);i=j;continue} /* ${name} is no brace */
    if(c!=='{')continue;
    var alts=[],start=i+1,d=0,end=-1;
    for(j=i+1;j<w.length;j++){
      var x=w.charAt(j),k;
      if(x==='\\'){j++;continue}
      if((k=quoteEnd(w,j))>=0){j=k;continue}
      if(x==='{')d++;
      else if(x==='}'){if(!d){end=j;break}d--}
      else if(x===','&&!d){alts.push(w.slice(start,j));start=j+1}
    }
    if(end<0){if(CSH)throw {cshBrace:true};continue}
    alts.push(w.slice(start,end));
    if(alts.length<2&&PROFILE.bash){var q=seqOf(alts[0]);if(!q)continue;alts=q}
    var pre=w.slice(0,i),post=w.slice(end+1),R=[];
    alts.forEach(function(a){brace1(pre+a+post).forEach(function(x){R.push(x)})});
    return R;
  }
  return [w];
}
function seqOf(b){ /* bash's {x..y[..step]}: whole numbers (as wide as the wider when either has a leading 0) or single letters */
  var m=/^(-?\d+)\.\.(-?\d+)(?:\.\.(-?\d+))?$/.exec(b),L=[],st;
  if(m){
    var a=+m[1],z=+m[2],wd=/^-?0\d/.test(m[1])||/^-?0\d/.test(m[2])?Math.max(m[1].length,m[2].length):0;
    st=Math.abs(+(m[3]||1))||1;
    for(var v=a;a<=z?v<=z:v>=z;v+=a<=z?st:-st){var t=String(Math.abs(v)).padStart(wd-(v<0?1:0),'0');L.push((v<0?'-':'')+t);if(L.length>100000)break}
    return L;
  }
  m=/^([A-Za-z])\.\.([A-Za-z])(?:\.\.(-?\d+))?$/.exec(b);
  if(!m)return null;
  var x=m[1].charCodeAt(0),y=m[2].charCodeAt(0);st=Math.abs(+(m[3]||1))||1;
  for(var u=x;x<=y?u<=y:u>=y;u+=x<=y?st:-st){var ch=String.fromCharCode(u);L.push(/[\\`'"$]/.test(ch)?'\\'+ch:ch)}
  return L;
}
function runSub(text,lines){ /* in a step: ( list ), with its own directory, variables and aliases; its status is its last command's, or what its exit gave.
                                lines: a { list; } in a pipe, which is its own process too, read as the lines it was typed on */
  if(SUB>=32){noFork();return}
  var tree=treeOf(lines||[text]);if(!tree)return;
  var back=keep(),was=SUBSH,loop=LOOP,shell=SHID,see=JOBSEE,ld=LOOPD,lu=LOOPUP,g=GEN,job=ASIDE&&ASIDE.job;
  LOOPUP=CSH||PROFILE.bash&&!DASH?0:LOOPUP+LOOPD; /* bash's ( ) is no longer in a loop (execute_in_subshell: loop_level = 0); csh's break there moves only its own input */
  SUB++;SUBSH=SUB;SHID=++SHIDS;JOBSEE=null;LOOPD=0;LOOP=null; /* its own process: what it starts with & are not this shell's jobs. Its $? is the shell's, as a fork's is */
  runBlock(tree);
  queue(function(){var st=STATUS;SUB--;SUBSH=was;SHID=shell;JOBSEE=see;if(LOOP==='break'||LOOP==='continue')LOOPN=0;LOOP=loop;LOOPD=ld;LOOPUP=lu;back();if(job||g===GEN)STATUS=st},true);
}
var GROUPD=0; /* how many { list; } deep */
function runGroup(text){ /* in a step: { list; } on its own, run by this shell: what it does to the directory and variables stays */
  if(GROUPD>=32){noFork();return}
  var tree=treeOf(text.split('\n'));
  if(!tree)return;
  GROUPD++;runBlock(tree);queue(function(){GROUPD--},2); /* 2: in a killed job too */
}
function runPipeline(stages){
  var pipe=null,codes=[];
  stages.forEach(function(st,i){
    var last=i===stages.length-1,sink=null,keepSink,keepIn,keepErr,errs=null,epipe=null,ok=true,own=false,prefix=null,back=null,loop=null,doc=null;
    if(st.hd!==undefined)queue(function(){hereText(HD[st.hd],function(L){doc=L},function(){doc=false})}); /* its here-document, worked out now */
    queue(function(){
      keepSink=SINK;keepIn=STDIN;keepErr=ERRSINK;
      if(st.in!==null){
        var n=unread(find(st.in));
        if(DASH&&(!n||n.prot)){typeLine(bashAt()+'cannot open '+st.in+': '+(n?'Permission denied':'No such file'),'err');pipe=[];ok=false;return}
        if(!n||n.type==='d'||n.prot){typeLine(PROFILE.bash?'bash: '+st.in+': '+(!n?'No such file or directory':n.prot?'Permission denied':'Is a directory'):st.in+(CSH?(n&&n.prot?': Permission denied':': No such file or directory'):': cannot open'),'err');pipe=[];ok=false;return}
        pipe=textOf(n);pipe.from=n; /* from: the file, which wc's widths look at */
      }
      if(st.here!==undefined)pipe=st.here.split('\n'); /* <<<: bash gives it a newline at its end */
      if(st.hd!==undefined){if(!doc){pipe=[];ok=false;return}pipe=doc}
      if(DASH){var badf=null; /* dash's words for a file it cannot make */
        [st.err,st.out].concat(st.mk.map(function(x){return x.f})).some(function(f){
          if(f===null||f===undefined)return false;
          var t=find(f);
          if(t&&t.type==='d')badf=[f,'Is a directory'];else if(!writeFile(f,[],true))badf=[f,find(dirOf(norm(f)))?'Permission denied':'Directory nonexistent'];
          return !!badf;
        });
        if(badf){typeLine(bashAt()+'cannot create '+badf[0]+': '+badf[1],'err');pipe=[];ok=false;return}
      }
      if(st.err!==null&&!writeFile(st.err,[],!!st.errApp)){oopsW('',st.err,st.err+': cannot create');pipe=[];ok=false;return}
      if(st.out!==null&&!writeFile(st.out,[],true)){if(CSH&&!PROFILE.perror)typeLine(st.out+': Permission denied','err');else oopsW('',st.out,st.out+': cannot create');pipe=[];ok=false;return}
      if(st.out!==null&&!st.app)writeFile(st.out,[],false);
      for(var k=0;k<st.mk.length;k++)if(!writeFile(st.mk[k].f,[],st.mk[k].app)){oopsW('',st.mk[k].f,st.mk[k].f+': cannot create');pipe=[];ok=false;return}
      if(st.err!==null||st.errClosed)errs=[];
      var toGlass=st.glass&&(!errs||st.glassOld); /* >&2 2>f: the >&2 took the old 2 */
      if(st.glass&&!toGlass)SINK=errs; /* >&2 when 2 is a file */
      else{
        if(st.closed||(!last||st.out!==null)&&!toGlass)sink=[];
        if(toGlass)SINK=ERRSINK!==GLASS?ERRSINK:null; /* wherever errors go now: sh x 2>e, with echo y >&2 in x */
        else if(sink)SINK=sink;
      }
      if(sink&&!last&&st.out===null&&!st.closed){sink.cap=PIPEMAX;sink.pipe=newPipe(pipeReader(stages,i+1));sink.fed=sink.fedc=0} /* what the next stage reads */
      if(st.e2o&&st.e2oFirst&&st.out!==null)ERRSINK=last?keepSink||GLASS:epipe=[]; /* 2>&1 >f: errors where the output was before >f */
      else if(st.e2o||st.both)ERRSINK=SINK||GLASS;else if(errs)ERRSINK=errs;
      if(pipe)STDIN=pipe;
      if(stages.length>1){SUB++;own=true;loop=LOOP;if(!(CSH&&last))back=keep()} /* a stage of a pipeline is its own process: a loop, read, cd or x=1 in it changes only that. csh runs the last one in the shell itself when it is one of its own commands (sh.sem.c forks a builtin only when it is piped out) */
      PIDNOW=null;
      if(JOB&&JOB.pids&&JOB.pids.length===stages.length){PIDNOW=JOB.pids[i];if(last)JOB.pids=null} /* ps & shows itself with the id the notice gave */
      if(st.sub!==undefined){if(!st.group)runSub(st.sub);else if(stages.length>1)runSub(st.sub,st.sub.split('\n'));else runGroup(st.sub);return}
      if(st.cond!==undefined){condRun(st.cond);return}
      if(st.arith!==undefined){var av=arithRun(st.arith,'((');STATUS=av===null||av===BigInt(0)?1:0;return}
      var nm=markNode(st.words[0]);
      if(nm&&nm.len===(st.words[0]||'').length){if(STDIN){var cp=STDIN.slice();cp.open=STDIN.open;STDIN=cp}runStmt(nm.node);return} /* its reads take the lines in turn, the last one perhaps with no newline */
      var k=0;
      while(!PROFILE.dos&&!PROFILE.noUnix&&!CSH&&k<st.words.length&&asgOf(st.words[k]))k++; /* csh has no such words (x=1: Command not found.: its set and @ assign); VMS (its symbols), CMS, TOPS-20, Multics, DOS, CP/M and the BASICs: none, the line is theirs */
      if(k&&k===st.words.length){ /* x=1 y=2 */
        var good=true;
        try{st.words.forEach(function(x){if(!setAsg(asgOf(x)))good=false})}catch(x){if(!x||x.arith===undefined)throw x;arithBad(x);return}
        STATUS=good?(PROFILE.bash&&SUBST!==null?SUBST:0):1;return; /* bash: x=`cmd` has cmd's status */
      }
      if(!k||CSH||PROFILE.dos){runOne(st.raw,st.words,st.src);return}
      var cut=function(t,j){return t.slice(st.ends[k-1][j]).replace(/^\s+/,'')};
      prefix={};var ro=false; /* X=2 cmd: X is 2 for cmd only, and its $X was worked out before that */
      st.words.slice(0,k).forEach(function(x){
        var m=asgOf(x);
        if(ro||(ro=svRO(m[1])))return; /* System V: a readonly X: failed(), and cmd does not run */
        if(bashy()&&(m[2]!==undefined||m[3]||m[4].charAt(0)===AMARK)){try{setAsg(m)}catch(e){if(!e||e.arith===undefined)throw e;arithBad(e)}return} /* x[1]=v cmd, x+=v cmd: kept, as they are not plain */
        if(!has(prefix,m[1]))prefix[m[1]]=has(ENV,m[1])?ENV[m[1]]:undefined;ENV[m[1]]=m[4];
      });
      if(!ro)runOne(unguard(cut(st.raw0,0)),st.words.slice(k),cut(st.src,1));
    });
    queue(function(){
      if(own){SUB--;if(back)back();if(LOOP==='abort')LOOP=loop;else if((LOOP==='break'||LOOP==='continue')&&LOOP!==loop){LOOP=loop;LOOPN=0}} /* a $(( )) gone wrong in a pipeline's command, or a break or continue left over: its process only */
      if(sink&&sink.broke&&LOOP==='exit')LOOP=loop; /* SIGPIPE ended that process only */
      if(prefix)Object.keys(prefix).forEach(function(n){if(prefix[n]===undefined)delete ENV[n];else ENV[n]=prefix[n]});
      codes[i]=STATUS;if(last)PIPEST=codes;
      if(!ok)return;
      if(st.out!==null&&sink&&!st.glass)writeFile(st.out,sink,true);
      if(st.err!==null&&errs)writeFile(st.err,errs,true);
      pipe=epipe||(st.out!==null||st.glass||st.closed?[]:sink);
      SINK=keepSink;STDIN=keepIn;ERRSINK=keepErr;
    },2); /* 2: in a killed job too, so that what it wrote stays in the file */
  });
}
function backtick(s,dq,done){ /* the first `command` outside single quotes. dq: starting inside "; done: what s carries straight on from, which decides a # at its very start */
  var a=-1,j,inDq=dq;
  for(var i=0;i<s.length;i++){
    var c=s.charAt(i);
    if(c==='\\'){i++;continue}
    if(c==='`'){
      if(a<0){a=i;inDq=dq}
      else return {a:a,b:i,cmd:unslash(s.slice(a+1,i)),dq:inDq};
    }
    else if(a>=0)continue;
    else if(c==='#'&&!dq&&(i?/[\s;|&<>]/.test(s.charAt(i-1)):!done))return null; /* the rest is a comment */
    else if(c==='"')dq=!dq;
    else if(c==="'"&&!dq&&(j=s.indexOf("'",i+1))>=0)i=j;
  }
  return null;
}
function unslash(t){return CSH?t:t.replace(/\\([\\`$])/g,'$1')} /* sh and bash: in a `command`, \ quotes only \ ` and $ */
function substitute(s,then,done,dq){ /* run every `command`, left to right, put what it printed in its place, then carry on.
                                     done: the text so far, which is not looked at again; dq: whether that left a " open */
  done=done||'';
  var m=PROFILE.dos?null:backtick(s,!!dq,done);
  if(!m){then(done+s);return}
  var before=done+(PROFILE.bash&&s.indexOf('`'+SUM,m.a)>=0?varsNow(s.slice(0,m.a),!!dq):s.slice(0,m.a)); /* bash expands a word at a time: $y before a $((y++)) after it is the value before */
  /* x=`command`, and csh's set x = `command`, are one word whatever it prints */
  capture(m.cmd,function(sink){substitute(s.slice(m.b+1),then,before+SEP+guard(sink.join(' '),/(^|\s)[A-Za-z_]\w*=$/.test(before)||CSH&&/(^|&&|\|\||\))\s*set\s[^&|]*=\s*$/.test(before.replace(/"[^"]*"|'[^']*'/g,'q'))),m.dq)});
}
function varsNow(t,dq){ /* t with its $names' values in place (guarded), outside single quotes; dq: it starts inside " ". Not "${x[@]}", which makes words */
  var o='',j,m;
  for(var i=0;i<t.length;i++){
    var c=t.charAt(i);
    if(c==='\\'){o+=t.substr(i,2);i++;continue}
    if(c==="'"&&!dq&&(j=t.indexOf("'",i+1))>=0){o+=t.slice(i,j+1);i=j;continue}
    if(c==='"')dq=!dq;
    else if(c==='$'&&(m=varAt(t,i))&&!/^(\*|\{.*\[[@*]\]\})$/.test(m[1])){o+=guard(envOf(m[1]));i+=m[0].length-1;continue}
    o+=c;
  }
  return o;
}
function andOr(s){ /* [{op,text}], split at && and || outside quotes, `commands`, ( ) and comments */
  var L=[],start=0,op=null,depth=0,j;
  for(var i=0;i<s.length;i++){
    var c=s.charAt(i),two=s.substr(i,2);
    if(c==='\\'){i++;continue}
    if((j=skipEnd(s,i,depth))>=0){i=j;continue}
    if(c==='#'&&(!i||/[\s;|&<>]/.test(s.charAt(i-1))))break;
    if(c==='(')depth++;else if(c===')')depth=Math.max(0,depth-1);
    else if(!depth&&(two==='&&'||two==='||')){L.push({op:op,text:s.slice(start,i)});op=two;start=i+2;i++}
  }
  L.push({op:op,text:s.slice(start)});
  return L;
}
function skipped(op){return op==='&&'?STATUS!==0:op==='||'&&STATUS===0} /* a && after a failure, a || after a success */
function isBack(seg){var p=splitCmds(seg);return p.length===2&&!p[1].trim()} /* the & is the split's own, not one in a comment */
var JOB=null,JOBS=0,LASTBG='',PIDNOW=null; /* JOB: the command now running in the background; JOBS: how many this line has started */
function tell(n){ /* the job's notice, once, when it starts: bash [1] and its last process, csh [1] and each of them, V7 sh just the id.
                     bash and sh say it only to someone typing; csh says it in a script too. n: its processes, when they are one pipeline */
  var j=JOB;
  if(!j||j.told||SUB!==j.level)return; /* not for a `command` inside it */
  j.told=true;
  var ids=newPids(n||1);
  j.pids=n?ids:null;LASTBG=j.last=String(ids[ids.length-1]); /* last: its own pid, the $! of the shell that started it once it is through */
  if(!CSH&&(SCRIPTS||j.sub))return;
  typeLine(notice(control()?++JOBS:0,ids));
}
function newPids(n){var ids=[];for(var i=0;i<n;i++)ids.push(PH.newPid());return ids}
function notice(num,ids){return CSH?'['+num+'] '+ids.join(' '):(PROFILE.bash?'['+num+'] ':'')+ids[ids.length-1]} /* a job's notice as it starts */
/* Background jobs. A job started with & at the shell's own level runs in a queue of its own beside the one queue (aside), with a
   copy of the shell's state that its steps swap in and out (procGet, procPut): it goes on while the visitor types, ^C does not
   reach it, and kill, wait, fg and bg do. Its notice comes when it starts; bash and csh say what has become of it before the next
   prompt, V7 sh says nothing (only, as its wait does, which ones a signal ended). A job that wants the terminal stops there, as
   SIGTTIN and SIGTTOU stop one, where there is job control (bash and csh at the prompt); where there is none (V7 sh, or a job
   started in a script) it reads /dev/null, and one that wants the screen just ends. */
var TABLE=[],JOBMAX=16,SHIDS=0,SHID=0,JOBSEE=null,FGJOB=null,CUR={c:null,p:null},V7NOTE=[],WARNED=-9,RUNS=0,DMRU=0; /* DMRU: dash's order of its jobs (jobs.c's curjob list), newest first */ /* SHID: the shell a command runs in (0: the login shell) */
function procGet(){
  return {SINK:SINK,STDIN:STDIN,ERRSINK:ERRSINK,STATUS:STATUS,PREV:PREV,SUB:SUB,SCRIPTS:SCRIPTS,LOOP:LOOP,JOB:JOB,JOBS:JOBS,PIDNOW:PIDNOW,ARGS:ARGS,
    CURRENT:CURRENT,SOURCE:SOURCE,KEPT:KEPT,SHID:SHID,JOBSEE:JOBSEE,SUBSH:SUBSH,LOOPD:LOOPD,LOOPUP:LOOPUP,LOOPSUB:LOOPSUB.slice(),env:Object.assign({},ENV),vars:Object.assign(Object.create(null),CSHV),wds:Object.assign(Object.create(null),CSHW),arr:arrClone(),ints:Object.assign(Object.create(null),INTV),cwd:ST.cwd,al:PH.aliases,bsh:BSH.slice()};
}
function procPut(c){
  SINK=c.SINK;STDIN=c.STDIN;ERRSINK=c.ERRSINK;STATUS=c.STATUS;PREV=c.PREV;SUB=c.SUB;SCRIPTS=c.SCRIPTS;LOOP=c.LOOP;JOB=c.JOB;JOBS=c.JOBS;PIDNOW=c.PIDNOW;ARGS=c.ARGS;
  CURRENT=c.CURRENT;SOURCE=c.SOURCE;KEPT=c.KEPT;SHID=c.SHID;JOBSEE=c.JOBSEE;SUBSH=c.SUBSH;LOOPD=c.LOOPD;LOOPUP=c.LOOPUP;LOOPSUB=c.LOOPSUB.slice();refill(ENV,c.env);refill(CSHV,c.vars);refill(CSHW,c.wds);arrRefill(c.arr);refill(INTV,c.ints);ST.cwd=c.cwd;PH.aliases=c.al;BSH=c.bsh.slice();grammar(shTop()); /* 4.3BSD: sh & runs Bourne's grammar in its own process only */
}
function refill(o,from){for(var k in o)if(!Object.prototype.hasOwnProperty.call(from,k))delete o[k];Object.assign(o,from)}
function oneLine(t){return t.trim().replace(/\s+/g,' ').replace(HDRE,function(m,n){var h=HD[n];return '<<'+h.word+'\n'+h.body.concat(h.word,'').join('\n')})} /* bash's jobs shows a here-document's body too */ /* a command as the job table and the loops' printer show it */
function pipeText(t){ /* the commands of a pipeline, split at its | (not ||), outside quotes and ( ) */
  return pipeRaw(t).map(oneLine);
}
function pipeRaw(t,keep){ /* the same, as typed; keep: each with the | after it */
  var L=[],start=0,depth=0,j;
  for(var i=0;i<t.length;i++){
    var c=t.charAt(i);
    if(c==='\\'){i++;continue}
    if((j=skipEnd(t,i,depth))>=0){i=j;continue}
    if(c==='(')depth++;else if(c===')')depth=Math.max(0,depth-1);
    else if(!depth&&c==='|'&&t.charAt(i+1)!=='|'&&t.charAt(i-1)!=='|'){var e=i+(t.charAt(i+1)==='&'?2:1);L.push(t.slice(start,keep?e:i));start=e}
  }
  L.push(t.slice(start));
  return L;
}
function liveJobs(){return TABLE.filter(function(j){return !j.over})}
function mine(){return TABLE.filter(function(j){return j.owner===SHID||j.owner===JOBSEE}).sort(function(a,b){return a.num-b.num})} /* this shell's jobs, and in bash's $( ) the shell's it was forked from */
function control(){return PROFILE.bash||CSH} /* job control: jobs, fg, bg, %n, and a job that wants the terminal stops */
function newJob(cmds,ids,o){ /* a job's entry in the table */
  var job={num:TABLE.reduce(function(m,j){return j.owner===SHID&&!j.kept?Math.max(m,j.num):m},0)+1,owner:SHID,
    pids:ids,cmds:cmds,state:'Running',code:0,sig:0,wd:ST.cwd,start:now(),wakers:[],resume:[],noted:true,born:RUNS,parent:ASIDE&&ASIDE.job||null,
    control:!!control()&&!SCRIPTS&&!SHID,ps:o&&o.ps||cmds.map(function(c){return /^\(/.test(c)?shellName():c}),pend:[]}; /* ps: a ( list ) is a forked shell */
  job.text=job.cmds.join(' | ');
  job.done=new Promise(function(r){job.fin=r});
  return job;
}
function jobWords(c){ /* a command as the job table shows it: ( list ) spaced out, as bash's and csh's printers do */
  var k=markNode(c);
  if(k)return compText(k.node,'').join('\n')+c.slice(k.len); /* a loop as bash prints it, then | cat */
  return PROFILE.bash?redirWords(jobWords0(c)):jobWords0(c);
}
function redirWords(t){ /* bash's print_redirection: 2>/dev/null as 2> /dev/null, outside quotes; 2>&1 as it is */
  return t.replace(/(\\[\s\S]|'[^']*'|"(?:[^"\\]|\\[\s\S])*")|(^|\s)(\d*(?:>>|>|<<<|<))(?![&>(<])\s*(?=\S)/g,function(m,q,sp,op){return q?q:sp+op+' '});
}
function jobWords0(c){
  var e=c.charAt(0)==='('?parenEnd(c,0):-1,rest=e<0?'':oneLine(c.slice(e+1)); /* ( list ) > f: the redirection after it, as both printers do */
  if(e<0||rest&&!/^\d*[<>]/.test(rest))return c;
  var L=splitCmds(c.slice(1,e)).map(oneLine).filter(Boolean).map(subWords);
  return '( '+L.map(function(x,i){ /* bash: a & b; csh's padd leaves the & out: a; b */
    var bg=/(^|[^\\])(\\\\)*&$/.test(x);if(CSH&&bg)x=x.replace(/\s*&$/,''); /* echo \& is no background */
    return i<L.length-1?x+(bg&&!CSH?' ':'; '):x;
  }).join('')+' )'+(rest?' '+rest:'');
}
function subWords(t){ /* a command of a ( list ): its own ( ) spaced out too, as the printers do all the way down */
  return andOr(t).map(function(p){return (p.op?p.op+' ':'')+pipeRaw(p.text).map(function(x){return jobWords(oneLine(x))}).join(' | ')}).join(' ');
}
function loginShell(){return procTable().filter(function(p){return p.mine&&/(^|[\/-])(ba|c)?sh$/.test(p.cmd)})[0]} /* the login shell's row in ps */
function shellName(){var r=loginShell();return r?r.cmd:PROFILE.bash?'-bash':CSH?'-csh':'-sh'} /* a forked shell: ps shows it as the login shell */
function startJob(text,o){ /* in a step of the shell: text &. o.run: what it runs instead of text, o.shown: what the table shows (a loop) */
  o=o||{};
  if(liveJobs().length>=JOBMAX){noFork();return} /* the fork fails, as it does past the process limit */
  var cmds=o.shown?[o.shown]:pipeText(text).map(jobWords),one=!!o.shown||andOr(text).length<2,ids=newPids(one?cmds.length:1);
  var job=newJob(one?cmds:[oneLine(text)],ids,o.shown?{ps:[shellName()]}:null);
  LASTBG=String(ids[ids.length-1]);
  if(CSH||!SCRIPTS&&!(PROFILE.bash&&SUBSH)&&!DASH)typeLine(notice(job.num,ids)); /* dash says nothing */ /* bash and sh say it only to someone typing; csh in a script too */
  var c=procGet();
  c.SUB=1;c.JOB={sub:false,level:1,told:true,pids:one?ids.slice():null};c.KEPT=[];c.LOOP=null;c.PIDNOW=null;c.SHID=++SHIDS;c.JOBSEE=null;
  var top=c.bsh[c.bsh.length-1];if(top&&top.sv)c.bsh[c.bsh.length-1]=Object.assign({},top,{sv:svCopy(top.sv)}); /* System V sh: a process of its own, its functions, readonly names and hash table too */
  if(!job.control&&!c.STDIN)c.STDIN=[]; /* no job control: it reads /dev/null */
  job.ctx=c;
  TABLE.push(job);
  if(job.owner===0)current(job,'new');
  job.side=aside(o.run||function(){execSeg(text)},job);
  job.side.p.then(function(){ended(job)});
  STATUS=0;
}
/* ^Z. A pipeline typed at the shell's own level runs in the one queue as ever; ^Z makes it a stopped job there and then: its steps
   from then on are the job's (queue looks up pr.job), with the state it had, and the shell goes on with the state it had when the
   pipeline started. bash goes on with the rest of the line (status 148) but leaves any loop; csh's pjwait drops the rest of the line */
function fgProc(item,run){ /* in a step: item {stages} or {text}, run() runs it */
  var lone=item.stages&&item.stages.length===1&&MARKP.test(item.stages[0].words[0]||''); /* a loop only redirected runs in the shell: its own pipelines are the ones ^Z stops */
  if(!control()||ASIDE||SUB||SCRIPTS||lone||inner&&inner.proc){run();return}
  var pr={job:null,wakers:[],item:item,over:false};
  queue(function(){
    FGP=pr;inner.proc=pr;pr.sc=inner;pr.snap=procGet();pr.kept=KEPT.length;
    inner.race=new Promise(function(r){pr.detach=r});
    run();
  });
  queue(function(){if(FGP===pr)FGP=null;pr.over=true;if(pr.job)suspended(pr.job);else if(PROFILE.bash&&!DASH&&forks(pr))jobNotes(function(j){return j.owner===0&&!j.noted&&j.over})},true); /* bash: a process it waited for in the
    foreground has ended, and its waitchld has found the jobs that ended meanwhile too: they are said now (a builtin forks nothing, and waits for nothing) */
}
function forks(pr){var w=procOf(pr).word;return w===''||/^\(/.test(w)||!!PH.builtin&&!PH.builtin(w)&&!/^\w+=/.test(w)} /* a pipeline, a ( ), or a program: not the shell's own command, nor x=1 */
var NOSTOP=/^(read|wait|fg|bg|%.*|source|\.|exit|logout)$/; /* the shell's own commands: the shell sets ^Z aside */
function procOf(pr){ /* at a ^Z: the foreground pipeline's commands as the job table shows them, and the command NOSTOP looks at */
  var it=pr.item,word;
  if(!it.stages)word=firstWord(it.text.trim());
  else if(it.stages.length>1)word='';
  else word=it.stages.length?it.stages[0].words[0]||'':'';
  return {cmds:it.stages?it.stages.map(function(st){return jobWords(oneLine(st.text))}):[oneLine(it.text)],word:word};
}
function procJob(pr){ /* the foreground pipeline pr as a job, now */
  var cmds=procOf(pr).cmds;
  var c=procGet();c.KEPT=KEPT.slice();c.SUB++;c.SHID=++SHIDS;c.JOBSEE=null;c.JOB=null;
  KEPT.length=pr.kept;procPut(pr.snap); /* the shell as it was */
  var job=newJob(cmds,newPids(cmds.length));
  job.control=true;job.wakers=pr.wakers;job.side={job:job,p:Promise.resolve(),stopped:false};
  job.ctx=c;
  TABLE.push(job);pr.job=job;
  Promise.resolve(pr.sc.p).then(function(){ended(job)});
  return job;
}
function tstp(){ /* ^Z: the foreground job stops, and the shell takes the terminal back */
  if(!control())return false;
  if(bufNode&&!READ&&!KEYS)return true; /* at the prompt: nothing */
  var job=FGJOB,pr=FGP,h=TTYH;
  if(!job&&(!pr||pr.over||pr.job))return true;
  if(!job&&NOSTOP.test(procOf(pr).word)){if(PROFILE.bash)zEcho();return true} /* the shell sets it aside; the tty still echoes it */
  if(!job)job=procJob(pr);
  if(job.over)return true;
  atCursor('^Z');
  if(FGJOB===job)FGJOB=null;
  job.fg=false;job.state='Stopped';job.sig=SIG.TSTP;job.noted=true;job.code=128+SIG.TSTP;
  current(job,PROFILE.bash?'fg':'stop');
  if(owns(job,h)){job.tty=h;letGo(h);h.hide()}
  if(job.release)job.release();
  if(pr&&pr.job===job)pr.detach();
  return true;
}
function suspended(job){ /* in a step of the shell, after the ^Z: bash's [1]+ Stopped, csh's Stopped */
  var k=SINK;SINK=null; /* on the glass, whatever the loop it was in writes to */
  if(CSH){GEN++;typeLine(why(job)+wdNote(job,' '));queue(function(){SINK=k;STATUS=1});return} /* pjwait's pprint(AREASON|SHELLDIR), then pintr1's error() */
  jobRows(job,'').forEach(function(r){typeLine(r)});
  queue(function(){SINK=k});
  STATUS=128+SIG.TSTP;
  if(LOOPD)LOOP='stop'; /* out of every loop it is in */
}
function ended(job){ /* it has run to its end, or a signal ended it */
  if(job.over)return;
  job.over=true;
  if(!job.dead){job.state='Done';job.code=job.ctx.STATUS}
  if(job.tty){job.tty.kill();job.tty=null} /* a screen put aside by ^Z goes with it */
  if(owns(job,TTYH)){var h=TTYH;letGo(h);h.kill()} /* and so does the one it has now: the shell has the terminal back */
  if(job.release)job.release();
  job.wakers.slice().forEach(function(w){w()});
  resumeJob(job,false);
  var fg=job===FGJOB;
  if(job.owner===0&&control()&&!fg){job.noted=false;if(CSH)current(job,'end')} /* said before the next prompt */
  else if(job.owner===0&&!control()&&job.sig)V7NOTE.push(job); /* V7 sh: the next wait says which signal ended it */
  if(job.owner!==0){ /* a script's: kept for its wait, as many as fit */
    var old=TABLE.filter(function(j){return j.kept});
    if(old.length>=50)TABLE.splice(TABLE.indexOf(old[0]),1);
    job.kept=true;
  }
  else if(!control()||fg)drop(job);
  job.fin();
}
function drop(job){ /* out of the table: told, waited for, or ended in the foreground */
  var i=TABLE.indexOf(job);if(i<0)return;
  TABLE.splice(i,1);
  if(job.owner===0)current(job,'drop');
}
function resumeJob(job,go){ /* fg, bg, SIGCONT; go false: it was killed */
  if(go&&job.over)return; /* csh's bg %1 on one that has ended: nothing to start */
  if(go&&job.pend.length){killJob(job,Math.min.apply(null,job.pend));return} /* a signal it got while stopped: the lowest comes first */
  if(go&&job.tty&&!job.fg){stopJob(job,SIG[job.tty.out?'TTOU':'TTIN']);return} /* in the background, a screen or a read it was at stops it again */
  if(go)job.state='Running';
  job.resume.splice(0).forEach(function(r){r(go)});
}
function killJob(job,n){job.dead=true;job.sig=n;job.state='Killed';job.code=128+n;ended(job)}
function stopWait(job){return new Promise(function(r){job.resume.push(r)})}
function stopJob(job,sig){ /* SIGSTOP, SIGTSTP, SIGTTIN, SIGTTOU: its next step waits */
  job.state='Stopped';job.sig=sig;job.noted=false;
  if(job.owner===0)current(job,'stop');
}
function ttyStop(job){ /* it wants the terminal: it stops until fg (true), or ends (false) */
  if(job.dead)return Promise.resolve(false);
  if(!job.control){job.dead=true;job.state='Done';ended(job);return Promise.resolve(false)} /* no job control: nothing stops it, and it cannot have the screen */
  stopJob(job,SIG[TTYWHY==='output'?'TTOU':'TTIN']);
  return stopWait(job);
}
var TTYWHY='input';
function ttyWant(why){ /* a read or the full screen: in a background job, false for none and true for /dev/null, or it throws TTY to stop */
  var j=ASIDE&&ASIDE.job;
  if(!j||j.fg)return false;
  if(j.control||why!=='input'){TTYWHY=why;throw TTY}
  return true;
}
function current(job,what){ /* the + and - jobs: bash's set_current_job and reset_current, csh's palloc, pchild and pclrcurr */
  var T=TABLE.filter(function(j){return j.owner===0});
  function inT(j){return j&&T.indexOf(j)>=0}
  if(CSH){
    if(what==='new'){if(!CUR.c)CUR.c=job;else if(!CUR.p)CUR.p=job;return}
    if(what==='stop'){if(CUR.c&&CUR.c!==job)CUR.p=CUR.c;CUR.c=job;return}
    var get=function(){ /* pgetcurr: the newest job that is not this one or the current one, a stopped one first */
      var x=null,L=T.slice().reverse();
      for(var i=0;i<L.length;i++)if(L[i]!==CUR.c&&L[i]!==job&&!L[i].over){if(L[i].state==='Stopped')return L[i];if(!x)x=L[i]}
      return x;
    };
    if(job===CUR.c){if(CUR.p){CUR.c=CUR.p;CUR.p=get()}else{CUR.c=get();CUR.p=get()}}
    else if(job===CUR.p)CUR.p=get();
    return;
  }
  if(DASH){ /* dash's set_curjob: a job started, stopped, or put in the foreground or background goes to the front of its list (one
               running, after those stopped); + and - are the first two */
    if(/^(new|fg|stop|bg)$/.test(what))job.dmru=++DMRU;
    var D=dashJobs();CUR.c=D[0]||null;CUR.p=D[1]||null;return;
  }
  function last(state,below){var x=null;T.forEach(function(j){if(j.state===state&&(!below||j.num<below.num))x=j});return x}
  function set(j){ /* set_current_job */
    if(CUR.c!==j){CUR.p=CUR.c;CUR.c=j}
    if(CUR.p!==CUR.c&&inT(CUR.p)&&CUR.p.state==='Stopped')return;
    var k=CUR.c.state==='Stopped'?last('Stopped',CUR.c):null;
    if(k){CUR.p=k;return}
    k=CUR.c.state==='Running'?last('Running',CUR.c):last('Running',null);
    CUR.p=k||CUR.c;
  }
  if(what==='new'||what==='fg'){set(job);return}
  if(what==='drop'&&job!==CUR.c&&job!==CUR.p)return;
  var k=inT(CUR.c)&&CUR.c.state==='Stopped'?CUR.c:inT(CUR.p)&&CUR.p.state==='Stopped'?CUR.p:last('Stopped',null)||last('Running',null); /* reset_current */
  if(k)set(k);else CUR.c=CUR.p=null;
}
/* the signals: number, name, what a job it ended or stopped says. bash's are Linux's (glibc's strsignal), csh's 4.3BSD's (its mesg[]),
   IRIX's its own numbering (signal.h, the MIPS ABI's) with Berkeley's words, V7's its own sysmsg[], which has nothing for INT and PIPE */
var SIGNALS=PROFILE.signals==='irix'?'1 HUP Hangup|2 INT Interrupt|3 QUIT Quit|4 ILL Illegal instruction|5 TRAP Trace/BPT trap|6 ABRT Abort|7 EMT EMT trap|8 FPE Floating exception|9 KILL Killed|10 BUS Bus error|11 SEGV Segmentation fault|12 SYS Bad system call|13 PIPE Broken pipe|14 ALRM Alarm clock|15 TERM Terminated|16 USR1 User defined signal 1|17 USR2 User defined signal 2|18 CHLD Child exited|19 PWR Power failure|20 WINCH Window size changed|21 URG Urgent I/O condition|22 POLL I/O possible|23 STOP Stopped (signal)|24 TSTP Stopped|25 CONT Continued|26 TTIN Stopped (tty input)|27 TTOU Stopped (tty output)|28 VTALRM Virtual timer expired|29 PROF Profiling timer expired|30 XCPU Cputime limit exceeded|31 XFSZ Filesize limit exceeded'
  :PROFILE.bash?'1 HUP Hangup|2 INT Interrupt|3 QUIT Quit|4 ILL Illegal instruction|5 TRAP Trace/breakpoint trap|6 ABRT Aborted|7 BUS Bus error|8 FPE Floating point exception|9 KILL Killed|10 USR1 User defined signal 1|11 SEGV Segmentation fault|12 USR2 User defined signal 2|13 PIPE Broken pipe|14 ALRM Alarm clock|15 TERM Terminated|16 STKFLT Stack fault|17 CHLD Child exited|18 CONT Continued|19 STOP Stopped (signal)|20 TSTP Stopped|21 TTIN Stopped (tty input)|22 TTOU Stopped (tty output)|23 URG Urgent I/O condition|24 XCPU CPU time limit exceeded|25 XFSZ File size limit exceeded|26 VTALRM Virtual timer expired|27 PROF Profiling timer expired|28 WINCH Window changed|29 IO I/O possible|30 PWR Power failure|31 SYS Bad system call'
  :PROFILE.csh?'1 HUP Hangup|2 INT Interrupt|3 QUIT Quit|4 ILL Illegal instruction|5 TRAP Trace/BPT trap|6 IOT IOT trap|7 EMT EMT trap|8 FPE Floating exception|9 KILL Killed|10 BUS Bus error|11 SEGV Segmentation fault|12 SYS Bad system call|13 PIPE Broken pipe|14 ALRM Alarm clock|15 TERM Terminated|16 URG Urgent I/O condition|17 STOP Stopped (signal)|18 TSTP Stopped|19 CONT Continued|20 CHLD Child exited|21 TTIN Stopped (tty input)|22 TTOU Stopped (tty output)|23 IO I/O possible|24 XCPU Cputime limit exceeded|25 XFSZ Filesize limit exceeded|26 VTALRM Virtual timer expired|27 PROF Profiling timer expired|28 WINCH Window size changed|29 - Signal 29|30 USR1 User defined signal 1|31 USR2 User defined signal 2'
  :'1 HUP Hangup|2 INT |3 QUIT Quit|4 ILL Illegal instruction|5 TRAP Trace/BPT trap|6 IOT IOT trap|7 EMT EMT trap|8 FPE Floating exception|9 KILL Killed|10 BUS Bus error|11 SEGV Memory fault|12 SYS Bad system call|13 PIPE |14 ALRM Alarm call|15 TERM Terminated';
var SIG={};SIGNALS.split('|').forEach(function(x){var m=x.match(/^(\d+) (\S+) ?(.*)$/);SIG[m[1]]={name:m[2],says:m[3]};if(m[2]!=='-')SIG[m[2]]=+m[1]});
if(PROFILE.signals==='irix'){SIG.IOT=6;SIG.CLD=18;SIG.IO=22;SIG[19].none=true} /* the other names signal.h gives them; PWR's default is to ignore it */
if(PROFILE.bash)for(var RT=34;RT<=64;RT++){ /* glibc's real-time signals, SIGRTMIN (34) to SIGRTMAX (64), named as bash's kill -l names them */
  var rn=RT===34?'RTMIN':RT===64?'RTMAX':RT<50?'RTMIN+'+(RT-34):'RTMAX-'+(64-RT);
  SIG[RT]={name:rn,says:'Real-time signal '+(RT-34)};SIG[rn]=RT;
}
function sigDo(n){ /* what it does to a job that has not set it aside: stop, cont, none or end */
  var s=SIG[n]||{},x=s.name;
  return /^(STOP|TSTP|TTIN|TTOU)$/.test(x)?'stop':x==='CONT'?'cont':/^(CHLD|URG|WINCH)$/.test(x)||x==='IO'&&!PROFILE.bash||s.none||!n?'none':'end';
}
function cored(n){return !PROFILE.bash&&/^(QUIT|ILL|TRAP|IOT|ABRT|EMT|FPE|BUS|SEGV|SYS)$/.test((SIG[n]||{}).name)} /* Debian keeps no core (ulimit -c 0); 4.3BSD, IRIX and V7 do */
function signal(job,n,group){ /* send signal n to the job; group: to its process group, as kill %n and the tty do, which takes in the jobs started inside it */
  if(group)TABLE.filter(function(j){for(var p=j.parent;p;p=p.parent)if(p===job)return !j.control;return false}).forEach(function(j){signal(j,n)}); /* without job control of their own, they are in its group */
  var d=sigDo(n),renote=PROFILE.bash&&group&&job.owner===0; /* bash hears of a stopped job's signal, and says so before the prompt */
  if(job.over||d==='none')return;
  if((n===2||n===3)&&!job.control)return; /* started without job control: & set INT and QUIT aside */
  if(d==='cont'){if(job.state==='Stopped')resumeJob(job,true);return}
  if(d==='stop'){
    if(control()&&job.state!=='Stopped')stopJob(job,n);
    else if(renote)job.noted=false; /* stopped again: bash hears of it, and says so before the prompt */
    return;
  }
  if(job.state==='Stopped'&&n!==SIG.KILL&&!((n===SIG.TERM||n===SIG.HUP)&&(group||CSH))){ /* it waits for a SIGCONT: kill %n and csh's kill send one after TERM and HUP */
    if(job.pend.indexOf(n)<0)job.pend.push(n);
    if(renote)job.noted=false; /* bash hears of it again, and says so */
    return;
  }
  if(renote&&job.state==='Stopped')job.restop=true; /* kill_pid clears J_NOTIFIED: before the prompt bash says again that it is stopped, and that it ended before the next */
  killJob(job,n);
}
function polite(d){var h=ST.home;return d===h?'~':d.indexOf(h+'/')===0?'~'+d.slice(h.length):d} /* bash's polite_directory_format, csh's dtildepr */
function why(job){ /* what the job's status says: bash's printable_job_status, csh's pprint reasons. null: csh says nothing for INT */
  var s=job.state;
  if(CSH)return s==='Running'?'Running ':s==='Stopped'?SIG[job.sig].says:s==='Done'?(job.code?'Exit '+String(job.code).padEnd(16):'Done'):job.sig===2?null:SIG[job.sig].says;
  if(DASH)return s==='Running'?s:s==='Done'?(job.code?'Done('+job.code+')':'Done'):SIG[job.sig].says; /* dash's sprint_status: strsignal's words, Done(n) */
  return s==='Running'||s==='Stopped'?s:s==='Done'?(job.code?'Exit '+job.code:'Done'):SIG[job.sig].says;
}
function dashJobs(){return TABLE.filter(function(j){return j.owner===0}).sort(function(a,b){return (b.state==='Stopped')-(a.state==='Stopped')||(b.dmru||0)-(a.dmru||0)})} /* dash's jobs, in its order */
function markOf(job){return job===CUR.c?'+':job===CUR.p?'-':' '}
function cshPre(job){return '['+job.num+']'+(job.num<10?' ':'')+' '+markOf(job)+' '} /* csh's [n] and its mark */
function wdNote(job,sep){return job.wd!==ST.cwd?sep+'(wd: '+polite(job.wd)+')':''} /* where it was started, when that is not here */
function jobRows(job,how){return [].concat.apply([],rowsOf(job,how).map(function(r){return r.split('\n')}))} /* a loop's text has lines of its own */
function rowsOf(job,how){ /* how: '' as jobs and the notices print it, 'l' with the ids, 'p' only the id */
  var mark=markOf(job),w=why(job),R=[],core=job.state==='Killed'&&cored(job.sig)?' (core dumped)':'';
  if(how==='p')return [String(job.pids[0])];
  if(CSH){
    var pre=cshPre(job),dir=how==='l'?wdNote(job,' '):'';
    if(how!=='l')return [pre+(w===null?'':w.padEnd(21))+job.text+core];
    job.cmds.forEach(function(c,i){var end=i===job.cmds.length-1;R.push((i?'       ':pre)+String(job.pids[i]||job.pids[0]).padStart(5)+' '+(w===null?'':(i?'':w).padEnd(21))+c+(end?core+dir:' |'))});
    return R;
  }
  if(DASH){ /* dash's showjob: [n] and its mark, with -l each process's id, then the command from column 33 */
    var hd='['+job.num+'] '+mark+' ',pad=function(t){return t+' '.repeat(Math.max(1,33-t.length))};
    if(how!=='l')return [pad(hd+w)+job.text];
    job.cmds.forEach(function(c,i){var end=i===job.cmds.length-1?'':' |';R.push(i?pad(' '.repeat(hd.length)+(job.pids[i]||job.pids[0]))+c+end:pad(hd+job.pids[0]+' '+w)+c+end)});
    return R;
  }
  var tail=(job.state==='Running'?' &':'')+wdNote(job,'  ');
  if(how!=='l')return ['['+job.num+']'+mark+'  '+w.padEnd(24)+job.text+tail];
  job.cmds.forEach(function(c,i){R.push(i?'     '+String(job.pids[i]).padStart(5)+' '+''.padEnd(22)+'| '+c+(i===job.cmds.length-1?tail:''):'['+job.num+']'+mark+' '+String(job.pids[0]).padStart(5)+' '+w.padEnd(24)+c+(job.cmds.length===1?tail:''))});
  return R;
}
function due(j){return j.owner===0&&!j.noted&&j.born!==RUNS} /* the shell finds out at the prompt after the one its line was typed at, as the child's exit comes after the prompt is out */
function notesDue(){return control()&&TABLE.some(due)}
function jobNotes(which){ /* before a prompt: what has become of the jobs since the last one. bash in job order, csh newest first. which: those (due) */
  var L=TABLE.filter(which||due),dir=ST.cwd,moved=false,gone=[];
  if(CSH)L.reverse();
  L.forEach(function(j){
    if(j.restop&&DASH)j.restop=false; /* dash just says how it ended */
    if(j.restop){var s=j.state;j.restop=false;j.state='Stopped';typeLine('');jobRows(j,'').forEach(function(r){typeLine(r)});j.state=s;return} /* killed while stopped: still Stopped, as far as bash has heard */
    j.noted=true;
    if(PROFILE.bash&&!DASH&&j.state==='Stopped')typeLine(''); /* notify_of_job_status: a newline first */
    jobRows(j,'').forEach(function(r){typeLine(r)});
    if(PROFILE.bash&&j.state!=='Stopped'&&j.wd!==dir)moved=true;
    if(j.state!=='Stopped'){if(CSH)drop(j);else gone.push(j)} /* csh's pnote flushes each as it goes; bash's cleanup_dead_jobs comes after them all, so the marks it prints are the ones from before */
  });
  gone.forEach(drop);
  if(moved)typeLine('(wd now: '+polite(dir)+')');
}
function v7Notes(){ /* V7 sh's await: each child a signal ended, as it is reaped: its id and sysmsg[] (and a bare newline for INT) */
  V7NOTE.splice(0).forEach(function(j){var m=SIG[j.sig].says;typeLine(m?j.pids[j.pids.length-1]+' '+m+(cored(j.sig)?' - core dumped':''):'')});
}
function findJob(w,who){ /* a job spec: %n %+ %% %- %name %?text (bash's fg, bg and jobs take n without the %). {job} or {err} */
  var T=mine(),bare=/^\d+$/.test(w||'');
  function no(m){return {err:CSH?who+': '+m+'.':DASH?bashAt()+who+': '+(/^No current/.test(m)||/current: no such/.test(m)?'No current job':'No such job: '+w):'bash: '+who+': '+m}} /* dash: No such job: %n, No current job */
  if(w===undefined||w==='%'||w==='%%'||w==='%+'){var c=T.indexOf(CUR.c)>=0?CUR.c:null;return c?{job:c}:CSH?no('No current job'):no((w||'current')+': no such job')}
  if(w==='%-'||CSH&&w==='%#'){var p=T.indexOf(CUR.p)>=0?CUR.p:null;return p?{job:p}:CSH?no('No previous job'):no(w+': no such job')}
  var x=w.replace(/^%/,'');
  if(/^\d+$/.test(x)&&(w.charAt(0)==='%'||bare)){var k=T.filter(function(j){return j.num===+x})[0];return k?{job:k}:no(CSH?'No such job':w+': no such job')}
  var q=x.charAt(0)==='?',hits=T.filter(function(j){return q?j.text.indexOf(x.slice(1))>=0:j.text.indexOf(x)===0});
  if(hits.length>1)return no(CSH?'Ambiguous':w+': ambiguous job spec');
  if(!hits.length)return no(CSH?(q?'No job matches pattern':'No such job'):w+': no such job');
  return {job:hits[0]};
}
function typeLines(s){s.split('\n').forEach(function(l){typeLine(l)})} /* a job's text: a loop's has lines of its own */
function fgJob(job){ /* in a step: the job has the terminal until it ends or ^Z stops it; ^C kills it */
  typeLines(job.text+wdNote(job,CSH?' ':'\t'));
  queue(function(){
    if(job.over)return;
    FGJOB=job;job.fg=true;job.noted=true;
    if(PROFILE.bash)current(job,'fg');
    if(job.tty){var h=job.tty;job.tty=null;TTYH=h;h.show()} /* the screen or the read it was at, back as it was */
    resumeJob(job,true);
    return new Promise(function(r){job.release=r;job.done.then(r)});
  });
  queue(function(){
    job.release=null;if(FGJOB===job)FGJOB=null;
    if(!job.over&&job.state==='Stopped'){suspended(job);return} /* ^Z again */
    var m=job.state==='Killed'&&job.sig!==SIG.INT&&job.sig!==SIG.PIPE?why(job):null; /* killed in the foreground: bash and csh say by what (not for INT and PIPE), as for any command */
    if(m)typeLine(m.trim()+(cored(job.sig)?' (core dumped)':''));
    drop(job);STATUS=job.code;
  },true);
}
function bgJob(job){ /* bg: a stopped job goes on in the background (and stops again if it still wants the terminal) */
  if(PROFILE.bash&&!DASH&&job.state==='Running'){typeLine('bash: bg: job '+job.num+' already in background','err');queue(function(){STATUS=0});return}
  if(CSH)current(job,'end');
  if(DASH){typeLines('['+job.num+'] '+job.text);resumeJob(job,true);current(job,'bg');return} /* dash: [n] command */
  var mark=markOf(job);
  typeLines((CSH?cshPre(job):'['+job.num+']'+(mark===' '?' ':mark+' '))+job.text+' &');
  resumeJob(job,true);
}
function waitJobs(L){ /* in a step: until each has ended; ^C stops the waiting, not the jobs */
  return new Promise(function(r){
    var live=L.filter(function(j){return !j.over}),left=live.length,W=wakeList(); /* a job's own wait: the foreground's ^C does not end it */
    function done(){var i=W.indexOf(stop);if(i>=0)W.splice(i,1);r()}
    function stop(){left=-1;done()}
    if(!left){r();return}
    W.push(stop);
    live.forEach(function(j){j.done.then(function(){if(left>0&&!--left)done()})}); /* only the jobs still running count down */
  });
}
function waitAny(L){ /* in a step: until the first of them ends, then that job; null when ^C stops the waiting */
  return new Promise(function(r){
    var W=wakeList(),over=false;
    function done(j){if(over)return;over=true;var i=W.indexOf(stop);if(i>=0)W.splice(i,1);r(j)}
    function stop(){done(null)}
    W.push(stop);
    L.forEach(function(j){j.done.then(function(){done(j)})});
  });
}
function failed(msg,st){if(msg!==null)typeLine(msg,'err');STATUS=st===undefined?1:st;PH.loop('abort')} /* the Bourne shell's failed() (and csh's error()): msg (null: said already), status st (1), and the rest of the line does not run */
function bashOpts(name,W,ok,usage,each){ /* a bash builtin's options (internal_getopt): the words of W that start with -, up to --, come off it; each(c, the rest
  of its word) for each letter, which may return true when it took the rest as its argument, or false to stop (it has said why). false after a letter
  not in ok: the error, name: usage: usage, status 2 */
  while(W.length&&/^-./.test(W[0])){
    var o=W.shift();if(o==='--')break;
    for(var j=1;j<o.length;j++){var c=o.charAt(j),r;
      if(ok.indexOf(c)<0){typeLine('bash: '+name+': -'+c+': invalid option','err');typeLine(name+': usage: '+usage,'err');queue(function(){STATUS=2});return false}
      if(each&&(r=each(c,o.slice(j+1)))!==undefined){if(r===false)return false;break}
    }
  }
  return true;
}
function jobCmd(name,a,raw,words){ /* jobs, fg, bg, kill, wait and %n */
  var W=words.slice(1),bash=PROFILE.bash,csh=CSH;
  function err(m){typeLine(m,'err')}
  function noCtl(){if(SHID===0&&!SCRIPTS)return false;err(csh?SUB?'No job control in subshells.':'No job control in this shell.':'bash: '+name+': no job control');return true}
  if(name==='jobs'){
    var how='',only=null;
    if(csh){if(W.length>1){err('jobs: Too many arguments.');return}if(W.length&&W[0]!=='-l'){err('Usage: jobs [ -l ].');return}how=W.length?'l':'';W=[]}
    else{
      if(!bashOpts('jobs',W,'lpnrsx','jobs [-lnprs] [jobspec ...] or jobs -x command [args]',function(f){
        if(f==='x'){ /* jobs -x command args: each jobspec in them becomes its job's process group, and the command runs */
          if(how||only==='n'){err("bash: jobs: no other options allowed with `-x'");queue(function(){STATUS=1});return false}
          var X=W.slice(),bad=false;
          X=X.map(function(w){if(!/^%/.test(w))return w;var r=findJob(w,'jobs');if(r.err){err(r.err);bad=true;return w}return String(r.job.pids[0])});
          if(bad){queue(function(){STATUS=1});return false}
          if(X.length)runOne(X.join(' '),X);
          return false;
        }
        if(f==='l'||f==='p')how=f;else only=f}))return;
    }
    if(WARNED===RUNS-1)WARNED=RUNS; /* a jobs between: exit goes */
    var L=[];
    if(W.length)W.forEach(function(w){var r=findJob(w,'jobs');if(r.err)err(r.err);else L.push(r.job)});
    else L=(DASH?dashJobs().filter(function(j){return j.owner===SHID}):mine()).filter(function(j){return only==='r'?j.state==='Running':only==='s'?j.state==='Stopped':only==='n'?!j.noted:true});
    L.forEach(function(j){jobRows(j,how).forEach(function(r){typeLine(r)});j.noted=true;if(j.over)drop(j)});
    return;
  }
  if(name==='fg'||name==='bg'||name==='%'){
    if(noCtl())return;
    if(name==='%'){ /* %n is fg, as csh's dofg1 and bash have it */
      var r0=findJob(raw.trim().split(/\s+/)[0],csh?'%job':'fg');
      if(r0.err)err(r0.err);else if(bash&&r0.job.over)err('bash: fg: job has terminated');else fgJob(r0.job);
      return;
    }
    var specs=W.length?W:[undefined];
    if(name==='fg'&&bash)specs=specs.slice(0,1);
    specs.forEach(function(w){
      queue(function(){
        var r=findJob(w,name);
        if(r.err){err(r.err);return}
        if(bash&&r.job.over){err('bash: '+name+': job has terminated');return} /* start_job: its Done comes before the next prompt */
        if(name==='fg')fgJob(r.job);else bgJob(r.job);
      });
    });
    return;
  }
  if(name==='wait'){ /* bash: each id or job in turn, its status the last one's; with none, all of them, and 0. csh and V7: all of them */
    if(csh&&W.length){err('wait: Too many arguments.');return}
    var any=false,pv=null; /* bash 5.2's -n: the first of them to end (any job, with none); -p var: its id goes in var; -f: as without it here */
    if(bash&&!bashOpts('wait',W,'npf','wait [-fn] [-p var] [id ...]',function(wf,rest){
      if(wf==='n')any=true;
      else if(wf==='p'){pv=rest||W.shift();if(pv===undefined){err('bash: wait: -p: option requires an argument');err('wait: usage: wait [-fn] [-p var] [id ...]');queue(function(){STATUS=2});return false}return true}
    }))return;
    if(pv!==null){if(!/^[A-Za-z_]\w*$/.test(pv)){err("bash: wait: `"+pv+"': not a valid identifier");queue(function(){STATUS=1});return}delete ENV[pv];delete ARR[pv]}
    if(any){
      var cand=[];
      W.forEach(function(w){
        var j=/^%/.test(w)?findJob(w,'wait').job:/^\d+$/.test(w)?mine().filter(function(x){return x.pids.indexOf(+w)>=0})[0]:null;
        if(!j||j.over)err('bash: wait: '+w+': no such job');else cand.push(j);
      });
      if(!W.length)cand=mine().filter(function(j){return !j.over&&j.state!=='Stopped'});
      var hit=null,ran1=false;
      queue(function(){ran1=true;if(cand.length)return waitAny(cand).then(function(j){hit=j})});
      queue(function(){
        if(!ran1)return;
        if(!hit){STATUS=cand.length?130:127;return} /* ^C; or none to wait for */
        hit.noted=true;drop(hit);
        if(pv!==null)ENV[pv]=String(hit.pids[hit.pids.length-1]);
        STATUS=hit.code;
      });
      return;
    }
    var all=!W.length||!bash,got=[];
    if(!all)W.forEach(function(w){
      if(/^%/.test(w)){var r=findJob(w,'wait');if(r.err)err(r.err);got.push(r.job||null);return}
      if(!/^\d+$/.test(w)){err("bash: wait: `"+w+"': not a pid or valid job spec");got.push(null);return}
      var k=mine().filter(function(j){return j.pids.indexOf(+w)>=0})[0];
      if(!k)err('bash: wait: pid '+w+' is not a child of this shell');
      got.push(k||null);
    });
    else got=mine().filter(function(j){return j.state!=='Stopped'}); /* stopped jobs are not waited for (bash; csh's dowait loops only while one runs) */
    var J=got.filter(Boolean);
    var v7w=!bash&&!csh,g=GEN,ran=false;
    queue(function(){ran=true;return waitJobs(J)});
    queue(function(){
      if(!ran)return; /* ^C before it began */
      if(!J.every(function(j){return j.over})){if(v7w&&g!==GEN)STATUS=0;else STATUS=130;return} /* ^C. V7's await: wait(2) fails with EINTR and returns -1, the entry its post(-1) added, so rc stays 0 and exitval is 0 (a job started with & is never posted: xec.c), and the wait ends */
      if(!control())v7Notes();
      J.forEach(function(j){j.noted=true;drop(j)});
      if(bash&&all)mine().forEach(function(j){if(j.over){j.noted=true;drop(j)}}); /* mark_dead_jobs_as_notified */
      var last=got[got.length-1];
      if(pv!==null&&!all&&last)ENV[pv]=String(last.pids[last.pids.length-1]);
      STATUS=all?(bash||csh?0:(J.filter(function(j){return j.code})[0]||{code:0}).code):last?last.code:127; /* V7: the first that failed */
    },v7w);
    return;
  }
  /* kill */
  var n=15,v7=!bash&&!csh;
  if(!W.length){err(bash?'kill: usage: kill [-s sigspec | -n signum | -sigspec] pid | jobspec ... or kill -l [sigspec]':csh?'kill: Too few arguments.':'usage: kill [ -signo ] pid ...');if(!csh)queue(function(){STATUS=2});return}
  var o1=W[0];
  if(bash&&o1==='-L')o1='-l'; /* bash: -L is -l */
  if(o1==='-l'&&DASH){ /* dash's: one name to a line, a number where it has none; kill -l n: the first one's name */
    function nm(q){return q===16||q===32||q===33?String(q):SIG[q].name} /* 16, 32 and 33 have none */
    if(W[1]===undefined){for(var q0=1;q0<=64;q0++)typeLine(nm(q0));return}
    var x0=W[1];
    if(!/^\d+$/.test(x0)){err(bashAt()+'kill: Illegal number: '+x0);queue(function(){STATUS=2});return}
    var n0=+x0>128?+x0-128:+x0;
    if(n0<1||n0>64){err(bashAt()+'kill: invalid signal number or exit status: '+x0);queue(function(){STATUS=2});return}
    typeLine(nm(n0));return;
  }
  if(o1==='-l'&&!v7){ /* the signals: bash's display_signal_list (and its real-time ones), csh's names, sixteen to a line */
    if(csh){var N=[];for(var q=1;q<=31;q++)N.push(SIG[q].name==='-'?'':SIG[q].name+' ');typeLine(N.slice(0,16).join(''));typeLine(N.slice(16).join(''));return}
    if(W[1]!==undefined){W.slice(1).forEach(function(x){var v=/^\d+$/.test(x)?SIG[+x>128?+x-128:+x]:SIG[x.toUpperCase().replace(/^SIG/,'')];if(v===undefined)err('bash: kill: '+x+': invalid signal specification');else typeLine(typeof v==='number'?String(v):v.name)});return}
    var row='',col=0;
    for(var q2=1;q2<=64;q2++){
      if(!SIG[q2])continue; /* 32 and 33: glibc keeps them */
      row+=String(q2).padStart(2)+') SIG'+SIG[q2].name;
      if(++col<5)row+='\t';else{typeLine(row);row='';col=0}
    }
    if(col)typeLine(row);
    return;
  }
  if(/^-/.test(o1)&&!(bash&&o1==='--')){
    if(v7){n=parseInt(o1.slice(1),10)||0}
    else{
      var spec=o1.slice(1);
      if(bash&&(o1==='-s'||o1==='-n')){W.shift();spec=W[0];if(spec===undefined){err('bash: kill: '+o1+': option requires an argument');return}}
      var up=bash?spec.toUpperCase().replace(/^SIG/,''):spec;
      n=/^\d+$/.test(spec)?+spec:SIG[up];
      if(typeof n!=='number'||n&&!SIG[n]){err(bash?'bash: kill: '+spec+': invalid signal specification':/^\d/.test(spec)?'kill: Bad signal number.':spec+': Unknown signal; kill -l lists signals.');return}
    }
    W.shift();
  }
  else if(bash&&o1==='--')W.shift();
  var any=false,bad=false;
  for(var k=0;k<W.length;k++){
    var w=W[k];
    if(/^%/.test(w)&&!v7){var r=findJob(w,'kill');if(r.err){err(r.err);if(csh)return;bad=true;continue}
      if(csh&&sigDo(n)==='stop'&&r.job.state!=='Running'){typeLine(w+': Already stopped');bad=true;continue} /* pkill */
      if(r.job.over){err(bash?'bash: kill: ('+r.job.pids[0]+') - No such process':w+': No such process');bad=true;continue} /* ended, and not yet said: killpg finds nobody (ESRCH), bash's kill_error and csh's pkill say so */
      signal(r.job,n,true);any=true;continue}
    if(!/^-?\d+$/.test(w)){if(v7){err('usage: kill [ -signo ] pid ...');queue(function(){STATUS=2});return}err(bash?'bash: kill: '+w+': arguments must be process or job IDs':'kill: Arguments should be jobs or process id\'s.');if(csh)return;bad=true;continue}
    var hit=liveJobs().filter(function(j){return j.pids.indexOf(+w)>=0})[0];
    if(v7&&(n>15||n<0)){err(w+': Invalid argument');bad=true;continue}
    if(!hit){
      var pid=+w,p=pid===0?{pid:0,mine:true,cmd:''}:procTable().filter(function(x){return x.pid===pid})[0];
      if(!p){err(bash?'bash: kill: ('+w+') - No such process':v7&&PROFILE.sysv?'kill: '+w+': no such process':w+': No such process');bad=true;continue} /* IRIX's System V /bin/kill (SysIII and SVR2 kill.c): kill: pid: no such process, and its status is 2; V7's and csh's pid: sys_errlist[] */
      if(!p.mine&&ST.user!==PROFILE.rootName){err(bash?'bash: kill: ('+w+') - Operation not permitted':w+': Not owner');bad=true;continue} /* EPERM: someone else's; root may */
      if(n&&(!pid||pid===shellPid()))shellSignal(n,!pid);
      any=true;continue;
    }
    if(n)signal(hit,n);any=true;
  }
  if(!csh&&!v7&&!any||bad)queue(function(){STATUS=bad&&v7&&PROFILE.sysv?2:1});
}
function procTable(){ /* the processes ps lists besides the jobs: {pid,mine,cmd}; a machine with a ps of its own gives its (PH.procs) */
  if(PH.procs)return PH.procs();
  return (PROFILE.raw.ps||[]).map(function(l){return l.trim().split(/\s+/)}).filter(function(f){return f.length>=5&&/^[xa-]$/i.test(f[0])})
    .map(function(f){return {pid:+f[1],mine:f[0]==='-',cmd:f.slice(4).join(' ')}}); /* - is the visitor's own row */
}
function shellPid(){var r=loginShell();return r?r.pid:23} /* $$: the login shell ps shows */
function shellSignal(n,group){ /* kill $$, or kill 0 (its process group: with no job control, the jobs too). What the shell does not set aside ends it */
  if(group&&!control())liveJobs().forEach(function(j){if(j.owner===0)signal(j,n)});
  var x=(SIG[n]||{}).name,kept=control()?/^(TERM|QUIT|INT|TSTP|TTIN|TTOU)$/:/^(TERM|QUIT|INT|SEGV|ALRM)$/; /* interactive: bash and csh set TERM and QUIT aside and catch INT; V7 sh sets TERM and QUIT aside and catches INT, SEGV and ALRM (fault.c: SEGV grows its memory, ALRM ends it only while it waits at the prompt) */
  if(x==='ALRM'&&!control()&&!PROFILE.bash&&!CSH&&ASIDE&&ASIDE.job&&!SCRIPTS)Promise.resolve().then(function(){ /* V7's fault(): ALRM calls done() while the shell waits at its prompt (flags&waiting). Only a job can send it then; the logout runs in the shell's own queue, after the job's step */
    if(bufNode&&MODE==='shell'&&!LOGOUT){leavePrompt();PH.logout();queue(function(){LOGOUT=false},true)}
  });
  if(kept.test(x||'')||sigDo(n)!=='end'||SCRIPTS||ASIDE||group&&(SUB||SHID))return; /* a script's own shell is another process. $$ in ( ), a pipe or a `command` is still the shell's; their kill 0 is their own group */
  PH.logout();
}
function stoppedWarn(){ /* exit and logout with stopped jobs: once, unless the line before said it (or was jobs) */
  if(!control()||SUB||SCRIPTS||SHID)return false;
  if(!TABLE.some(function(j){return j.owner===0&&j.state==='Stopped'})||WARNED===RUNS-1)return false;
  WARNED=RUNS;typeLine(DASH?'You have stopped jobs.':'There are stopped jobs.','err');
  return true;
}
function psJobs(){ /* each process of each job still going: for ps */
  var R=[];
  liveJobs().forEach(function(j){j.pids.forEach(function(p,i){R.push({pid:p,cmd:j.ps&&j.ps[i]||j.cmds[i]||j.text,stopped:j.state==='Stopped',start:j.start})})});
  return R;
}
/* a shell started at the terminal is a child of the one it was typed in: the jobs it starts are its own, and its parent's are
   not its. As it ends, its stopped jobs are killed (the kernel's SIGHUP to a process group orphaned with a stopped member;
   bash's exit says "There are stopped jobs." first) and the running ones go on with no shell to report them */
var PARKS=0;
function parkJobs(){
  var p={id:-(++PARKS),cur:CUR,warned:WARNED,v7:V7NOTE,bg:LASTBG};
  TABLE.forEach(function(j){if(j.owner===0)j.owner=p.id});
  CUR={c:null,p:null};V7NOTE=[];LASTBG=''; /* a new shell has no $! yet */
  return p;
}
function unparkJobs(p){
  var gone=-(++PARKS);
  TABLE.slice().forEach(function(j){
    if(j.owner!==0)return;
    j.owner=gone;
    if(j.state==='Stopped'&&!j.over){killJob(j,1);drop(j)}
  });
  TABLE.slice().forEach(function(j){
    if(j.owner!==p.id)return;
    j.owner=0;
    if(j.over&&j.kept){j.kept=false;if(control())j.noted=false;else{if(j.sig)V7NOTE.push(j);drop(j)}} /* one that ended meanwhile: the parent hears of it now, as ended() has it */
  });
  CUR=p.cur;WARNED=p.warned;V7NOTE=p.v7;LASTBG=p.bg;
}
function endJobs(){TABLE.slice().forEach(function(j){j.dead=true;j.state='Killed';j.sig=1;ended(j)});TABLE=[];CUR={c:null,p:null};V7NOTE=[];FGJOB=null} /* logout: the session's jobs go with it */
function execSeg(seg){
  SAFE_SPENT=SAFE_MS=0;queue(function(){SAFE_SPENT=SAFE_MS=0}); /* each command has the matcher's whole allowance, when it is read and when its turn comes */
  var fm;if(SV&&(fm=FNDEF.exec(seg))&&fm[2].trim()){queue(function(){fnDefine(fm)});return} /* System V's name() command */
  if(!PROFILE.dos&&/[^&><|\s\\]\s*&\s*$/.test(seg)&&isBack(seg)){ /* echo a &: its own process, which nobody waits for. exit, break or cd in it end or change only that process */
    var back=null,was,text=seg.replace(/&\s*$/,'');
    queue(function(){
      if(control()&&/^\s*%\S*\s*$/.test(text)){jobCmd('bg',[],'bg',['bg',text.trim()]);return} /* %1 &: bg */
      if(!SUB&&!SINK&&(!ERRSINK||ERRSINK===GLASS)){if(!misread(text))startJob(text);return} /* at the shell's own level: a job of its own, in the background */
      back=keep();was=JOB;JOB={sub:SUB>0,level:SUB+1};SUB++;execSeg(text); /* inside a `command`, a pipe or a file: it is run through, as the one reading it waits for its end */
    });
    queue(function(){if(back)bgEnd(back,was)},true); /* the shell that started it has its pid as $!, not one of the jobs it started in turn */
    return;
  }
  if((seg=bracesOr(seg))===null){queue(function(){STATUS=1});return} /* csh: error() */
  var parts=PROFILE.dos||CSH&&/^\s*if\s*\(/.test(seg)?null:andOr(seg),dead=false;
  if(parts&&parts.length>1)queue(function(){tell()}); /* a && b &: one process for the lot */
  if(!parts||parts.length<2){queue(function(){if(LOOP!=='abort'&&LOOP!=='exit'){subPipe(seg,function(text){execText(text)})}});return} /* exit: a shell at the terminal has ended, and the rest of its line with it */
  parts.forEach(function(p){ /* cd /tmp && echo `pwd`: the pwd runs in /tmp */
    queue(function(){
      if(dead||LOGOUT||LOOP||skipped(p.op))return;
      subPipe(p.text,function(text){execText(text,function(){dead=true})});
    });
  });
}
function subPipe(s,then){ /* substitute, but in bash each command of a pipeline on its own: a $(( )) that goes wrong in one ends only that
                              process (it runs as false), and the rest of the pipeline and of the line go on */
  SUBST=null;
  var P=PROFILE.bash&&s.indexOf('`')>=0?pipeRaw(s,true):[];
  if(P.length<2){substitute(s,then);return}
  var out='';
  (function next(k){
    if(k>=P.length){then(out);return}
    var m=/\|&?\s*$/.exec(P[k]),bar=m&&k<P.length-1?m[0]:'',loop=LOOP;
    substitute(bar?P[k].slice(0,-bar.length):P[k],function(t){
      if(LOOP==='abort'&&loop!=='abort'){LOOP=loop;t=' false '}
      out+=t+bar;queue(function(){next(k+1)});
    });
  })(0);
}
function execLine(line){ /* a whole command line: aliases, and any number of commands */
  splitCmds(line).forEach(function(seg){unaliased(seg,execSeg)});
}
function flatSubs(line){ /* the line with each `...`, $(...) and $((...)) as one word x, and what was in each $( ): bash reads that as it reads the line */
  var o='',inner=[],sq=false,dq=false,j;
  for(var i=0;i<line.length;i++){
    var c=line.charAt(i);
    if(c==='\\'&&!sq){o+=line.substr(i,2);i++;continue}
    if(c==="'"&&!dq)sq=!sq;
    else if(c==='"'&&!sq)dq=!dq;
    else if(!sq&&c==='`'&&(j=tickEnd(line,i))>0){o+='x';i=j;continue}
    else if(!sq&&c==='$'&&line.charAt(i+1)==='('&&(j=parenEnd(line,i+1))>0){if(line.charAt(i+2)!=='(')inner.push(line.slice(i+2,j));o+='x';i=j;continue}
    o+=c;
  }
  return {flat:o,inner:inner};
}
function synCheck(lines,last){ /* the first syntax error in lines, read as the shell reads them: a whole line (and a whole compound command) before it runs any of it.
                                  {at: the line, msgs:[...]}, or null. last: only the last line is new; {n,inCase,here}, where the check of
                                  the lines before it got to, which it keeps up to date, so a line before the last is read only once */
  if(PROFILE.dos||PROFILE.noUnix)return null;
  var inCase=last?last.inCase:0,here=(last&&last.here||[]).slice(); /* here: the here-documents whose bodies are still being read */
  for(var n=last?last.n:0;n<lines.length;n++){
    var line=lines[n];
    if(here.length){var h=here[0];if((h.strip?line.replace(/^\t+/,''):line)===h.word)here.shift();if(last)last.q=''} /* a body line: not a command */
    else{
      var pend=last&&last.pend&&last.pend.n===n?last.pend.q:'',from=n,q=pend||openQuote(line); /* pend: this line was read before, and left q open */
      while(q&&n+1<lines.length){line+='\n'+lines[++n];q=openQuote(lines[n],q)} /* the quote goes on in the next line: only that line is read again */
      if(!q&&!CSH)here=hereOps(line).ops; /* the bodies start on the next line */
      if(last)last.q=q; /* the quote the newest line leaves open, for runCompound */
      if(q&&last){last.pend={n:from,q:q};return null} /* the newest line leaves a quote open: the command is not all there yet */
      if(last)last.pend=null;
      var e=lineError(line);
      if(e&&(!last||n===lines.length-1))return {at:n,from:from,msgs:e}; /* from: the line the command starts on */
    }
    if(last&&n<lines.length-1){last.n=n+1;last.inCase=inCase;last.here=here.slice()} /* the last line may yet be joined to the next */
  }
  return null;
  function lineError(line){
    var f=flatSubs(line),bad=null,km;
    if(PROFILE.bash)f.inner.some(function(x){var r=lineError(x),k=r?null:treeBad(x.split('\n'));if(k)r=[k.tok==='end'?"bash: syntax error near unexpected token `)'":syntaxError(k.tok)];if(r)bad=[r[0],'bash: syntax error'];return r}); /* $(if): bash reads a $( ) as it reads the line */
    if(bad)return bad;
    statements([f.flat]).some(function(t){
      var w=firstWord(t);
      if(CSH){if(/^(if|while|foreach|switch|else|end|endif|endsw|breaksw|case|default:?|@)(\(|$)/.test(w))return false}
      else{
        if(w==='case'){inCase++;return false}
        if(w==='esac'||/^esac\b/.test(t)){inCase=Math.max(0,inCase-1);return false}
        if(inCase||/^(fi|done|then|do|else|\{|\})$/.test(w)||/^(fi|done)[|<>&\s]/.test(t))return false;
        if(w==='for'){var fm=t.match(/^for\s+\S+\s+in\s+([\s\S]*)$/);if(!fm)return false;t='x x '+fm[1]}
        else if((km=t.match(/^(if|elif|while|until|!)(?=[\s(]|$)/)))t=t.slice(km[1].length); /* if(1): the keyword, then a ( ) */
        if(bashy())t=t.replace(/(\|&?\s*)for\s*\(\([\s\S]*$/,'$1x'); /* ... | for (( )): read as the loop it is */
      }
      if(!t.trim()||SV&&FNDEF.test(t))return false; /* System V's name() { list }: read when it runs */
      try{parseList(t,{check:true})}catch(x){if(x&&x.syntax)bad=synMsgs(x)}
      return bad;
    });
    return bad;
  }
}
function treeBad(L){ /* a compound command that does not read: {tok: the keyword it did not expect, or end}, or null */
  try{parseTree(L)}catch(e){if(e===MORE)return {tok:'end'};var k=/`(\w+)' unexpected/.exec(e&&e.message||'');if(k)return {tok:k[1]}}
  return null;
}
function subBad(t){ /* bash: what it says when a `command` does not read (it reads it only as it runs it): its lines, or null */
  var L=t.split('\n'),at=SCRLN&&SCRIPTS,base=at?SCRLN.ln:1,pre=(at?SCRLN.name:'bash')+': command substitution: line ',q=openQuote(t),bad,k;
  if(q)return [pre+(base+L.length-1)+": unexpected EOF while looking for matching `"+q+"'"];
  if((bad=synCheck(L))){
    var m=bad.msgs[0].replace(/^bash: /,'');
    return /unexpected end of file/.test(m)?[pre+(base+L.length)+': '+m]:[pre+(base+bad.at)+': '+m,pre+(base+bad.at)+": `"+L[bad.at]+"'"];
  }
  if((k=treeBad(L)))return k.tok==='end'?[pre+(base+L.length)+': syntax error: unexpected end of file']:[pre+base+": syntax error near unexpected token `"+k.tok+"'",pre+base+": `"+t+"'"];
  return null;
}
function timeSay(t0,p){ /* bash's time: what the pipeline took, on the shell's error output. user and sys: the CPU time, none here */
  var st=STATUS,s=(Date.now()-t0)/1000;
  (p?[]:['']).concat(['real','user','sys'].map(function(k,i){var x=i?0:s;return k+(p?' '+x.toFixed(2):'\t'+Math.floor(x/60)+'m'+(x%60).toFixed(3)+'s')})).forEach(function(l){typeLine(l,'err')});
  queue(function(){STATUS=st});
}
function synSay(msg){if(DASH&&/syntax error|unexpected EOF/i.test(msg)){if(!/^\S+: \d+: Syntax/.test(msg))msg=bashAt()+dashSyn(msg);if(!SCRIPTS)DSKIP++}typeLine(msg,'err');if(!CSH&&/syntax error/i.test(msg))queue(function(){STATUS=2})} /* bash and V7 sh: a syntax error's status is 2 (V7's synbad: exitsh(SYNBAD)); csh's error() sets 1; dash: a line with a syntax error is not counted */
function dashSyn(m){ /* a syntax error as dash says it: Syntax error: "fi" unexpected, newline and end of file unquoted */
  m=m.replace(/^bash: /,'');var t=/near unexpected token `([\s\S]*)'$/.exec(m)||/^syntax error: `([\s\S]*)' unexpected$/.exec(m);
  if(/unexpected EOF while looking for matching/.test(m))return 'Syntax error: Unterminated quoted string';
  if(/end of file|unexpected end/.test(m)||t&&/^(end of file|end)$/.test(t[1]))return 'Syntax error: end of file unexpected'+(WANT?' (expecting "'+WANT+'")':'');
  var w=DWANT;DWANT='';
  if(t)return 'Syntax error: '+(/^(newline|redirection)$/.test(t[1])?t[1]:/^(if|then|else|elif|fi|do|done|case|esac|while|until|for|in|[{}!]|[()&|;<>]+)$/.test(t[1])?'"'+t[1]+'"':'word')+' unexpected'+(w?' (expecting "'+w+'")':''); /* an ordinary word is just word */
  return 'Syntax error: '+m.replace(/^syntax error:? ?/i,'');
}
function synMsgs(e){return e.cond||[syntaxError(e.syntax,e.redir,e.paren)]} /* what a syntax error says */
function bracesOr(s){try{return braces(s)}catch(e){if(!e||!e.cshBrace)throw e;typeLine('Missing }.','err');return null}} /* braces, or null once csh has said Missing } */
function misread(seg){ /* (a) b &: the shell reads the whole line before it forks, so a syntax error is said and no job starts */
  if(/`|\$\(/.test(seg))return false; /* what is substituted is read when the job runs */
  try{parseList(seg)}catch(e){if(e&&e.syntax){synMsgs(e).forEach(synSay);return true}}
  return false;
}
function parsed(seg){ /* parseList, or null once it has said what was wrong */
  try{return parseList(seg)}
  catch(e){
    if(e&&e.undefinedVar)typeLine(e.msg||e.undefinedVar+': Undefined variable.','err');
    else if(e===NOMATCH)typeLine('No match.','err');
    else if(e&&e.arith!==undefined)arithBad(e);
    else if(e&&e.syntax)synMsgs(e).forEach(synSay);
    else if(e&&e.cshBrace)typeLine('Missing }.','err');
    else throw e;
    return null;
  }
}
function syntaxError(tok,redir,paren){ /* tok: the word it stopped at, or end */
  if(CSH)return redir?'Missing name for redirect.':paren==='close'?"Too many )'s.":paren==='open'?"Too many ('s.":paren==='('?'Badly placed (.':paren?"Badly placed ()'s.":'Invalid null command.';
  if(DASH)return bashAt()+dashSyn(tok==='end'?'end of file':"near unexpected token `"+tok+"'");
  if(PROFILE.bash)return tok==='end'?'bash: syntax error: unexpected end of file':"bash: syntax error near unexpected token `"+tok+"'";
  return "syntax error: `"+(tok==='end'?'end of file':tok)+"' unexpected";
}
function ifAfter(seg){ /* where && or || is followed by csh's if ( ), outside quotes */
  var q=null;
  for(var i=0;i<seg.length;i++){
    var c=seg.charAt(i),two=seg.substr(i,2);
    if(c==='\\'){i++;continue}
    if(q){if(c===q)q=null}
    else if(c==='#'&&(!i||/[\s;|&<>]/.test(seg.charAt(i-1))))return null;
    else if((c==='"'||c==="'")&&seg.indexOf(c,i+1)>=0)q=c;
    else if((two==='&&'||two==='||')&&/^\s*if\s*\(/.test(seg.slice(i+2)))return {at:i,op:two};
  }
  return null;
}
function bareOp(s){ /* a < > | or & outside quotes and ( ), which csh's lexer takes for a redirection, pipe or & */
  var depth=0,q=null;
  for(var i=0;i<s.length;i++){
    var c=s.charAt(i);
    if(q){if(c===q)q=null}
    else if(c==='\\')i++;
    else if(c==='"'||c==="'")q=c;
    else if(c==='(')depth++;
    else if(c===')')depth=Math.max(0,depth-1);
    else if(/^(<<|>>)=/.test(s.substr(i,3)))i+=2; /* @ x <<= 1: left to @ to say it is a syntax error */
    else if(!depth&&/[<>|&]/.test(c))return true;
  }
  return false;
}
function execText(seg,failed){ /* failed: told when the line could not be read, which ends the rest of it */
  queue(function(){
    if(CSH&&/^\s*if\s*\(/.test(seg)){tell();if(!LOGOUT)runOne(seg.replace(/^\s*if\s*\(/,'if ('));return} /* its ( ) comes before any < or > */
    if(CSH&&/^\s*@\s*[A-Za-z_]/.test(seg)&&!bareOp(seg)){tell();if(!LOGOUT)runOne(seg);return} /* @ x = 2 * 3: no wildcards, and ( 2 > 1 ) is no redirection */
    var k=CSH&&ifAfter(seg);
    if(k){
      if(!parsed(seg.slice(0,k.at))){if(failed)failed();return}
      tell();
      execText(seg.slice(0,k.at));
      queue(function(){
        if(LOGOUT||skipped(k.op))return;
        execText(seg.slice(k.at+2));
      });
      return;
    }
    var L=parsed(seg);
    if(!L){if(failed)failed();return}
    tell(L.length===1?L[0].stages.length:0);
    L.forEach(function(item){
      queue(function(){
        if(LOGOUT||LOOP||skipped(item.op))return;
        fgProc(item,function(){
          var t0=Date.now();runPipeline(item.stages);
          if(item.neg||item.time)queue(function(){if(item.neg)STATUS=STATUS?0:1;if(item.time)timeSay(t0,item.time==='-p')}); /* bash's ! and time: PIPESTATUS keeps the pipeline's own */
        });
      });
    });
  });
}
/* for, while, until, if, case (and csh's foreach): read into a tree, then run with the queue */
var SCRLN=null; /* the script that is running, {name, ln: the line of the command it is on}, for bash's errors: name: line N: */
var WANT='',DWANT='',MORE={},LOOP=null,LOOPN=0,SCRIPTS=0,SUB=0,SUBSH=0,LOOPD=0,LOOPUP=0,LOOPSUB=[]; /* SUB: inside a pipeline stage or `command`, each its own process; SUBSH: the SUB of the ( ) it is in; LOOPD: how many loops deep;
                                                                                         LOOPSUB: the SUB of each loop running: break and continue are for a loop of their own process (echo | while ...) */
function statements(lines){ /* S.ln: the line each starts on */
  var S=[],ln=S.ln=[];
  lines.forEach(function(l,n){
    splitCmds(l).forEach(function(seg){
      var t=seg.trim(),m=t.match(/^(do|then|else)\s+([\s\S]*)$/);
      if(m){S.push(m[1]);S.push(m[2]);ln.push(n,n)}else{S.push(t);ln.push(n)}
    });
  });
  return S;
}
function firstWord(t){t=t||'';return PROFILE.bash&&/^for\(\(/.test(t)?'for':t.split(/[\s|<>&]/)[0]} /* done|cat and fi>f end at their keyword; bash's for((: for */
function parseTree(lines){
  var S=statements(lines),i=0;
  function ins(t){S.splice(i,0,t);S.ln.splice(i,0,S.ln[Math.max(0,i-1)])} /* a statement read out of the one before it */
  function expect(w){if(i>=S.length){WANT=w;throw MORE}if(firstWord(S[i])!==w)throw bad('syntax error');return S[i++]}
  function bad(m){var e=new Error(m);e.ln=S.ln[Math.min(i,S.length-1)];return e} /* ln: the line it is on */
  function amp(n,end){ /* done &, fi | cat, esac > f: the whole of it in the background, in a pipe or redirected (csh's end takes neither) */
    if(CSH)return n;
    var t=end.replace(/^[^\s|<>&]+/,'');
    if(/(^|[^&])&\s*$/.test(t)){n.bg=true;t=t.replace(/&\s*$/,'')}
    if(t.trim())n.tail=t.trim();
    return n;
  }
  function ifNode(){
    var n={k:'if',cond:block(['then'])};
    expect('then');
    n.then=block(['elif','else','fi']);
    var w=firstWord(S[i]);
    if(w==='elif'){S[i]=S[i].replace(/^elif\s*/,'');var x=ifNode();n.els=[x];n.bg=x.bg;n.tail=x.tail;x.bg=false;x.tail=null;return n}
    if(w==='else'){i++;n.els=block(['fi'])}
    return amp(n,expect('fi'));
  }
  function block(stops){
    var out=[],pend=null,ln0;
    for(;;){
      if(pend&&out.length>pend.n){out[pend.n].head=pend.h;pend=null} /* echo q | while read x: what comes before it in the pipe */
      if(i>=S.length){if(stops){WANT=stops[stops.length-1];throw MORE}if(out.length&&out[out.length-1].ln===undefined)out[out.length-1].ln=ln0;return out}
      var t=S[i],w=firstWord(t),m;
      if(!stops&&out.length&&out[out.length-1].ln===undefined)out[out.length-1].ln=ln0; /* the top level: the line each command starts on (an error in a $(( )) ends that line) */
      if(stops&&stops.indexOf(w)>=0)return out;
      if(!stops&&!pend)ln0=S.ln[i];
      if(/^(fi|done|then|do|else|elif|esac)$/.test(w))throw bad("syntax error: `"+w+"' unexpected");
      i++;
      if(!t)continue;
      if(!CSH&&!pend&&t.indexOf('|')>=0){
        var P2=pipeRaw(t,true),h=0;
        for(var q=1;q<P2.length&&!h;q++)if(/^(for|while|until|if|case)$/.test(firstWord(P2[q].trim())))h=q;
        if(h){pend={n:out.length,h:P2.slice(0,h).join('').trim()};ins(P2.slice(h).join('').trim());continue}
      }
      if(w==='for'&&bashy()&&(m=/^for\s*\(\(/.exec(t))&&(m=parenEnd(t,m[0].length-2))>0&&t.charAt(m-1)===')'&&/^\s*($|do\b|\{)/.test(t.slice(m+1))){ /* bash's for (( init; test; step )), then do or { */
        var E=t.slice(t.indexOf('((')+2,m-1).split(';'),rest=t.slice(m+1).trim(),brace=rest.charAt(0)==='{';
        if(E.length!==3)throw new Error('bash: syntax error: arithmetic expression required');
        if(brace){ /* { list; }: read whole as one statement when it closes on this line */
          var ge=groupEnd(rest,0);
          if(ge>0)ins(rest.slice(ge));
          splitCmds(rest.slice(1,ge>0?ge:undefined)).map(function(x){return x.trim()}).filter(Boolean).reverse().forEach(ins);
        }
        else if(rest){var dm=/^do\s*([\s\S]*)$/.exec(rest);if(dm[1])ins(dm[1]);ins('do')} /* for (( )) do ...: on the same line, with no ; */
        if(!brace)expect('do');
        var ab=block([brace?'}':'done']);
        out.push(amp({k:'afor',e:E.map(function(x){return x.trim()}),body:ab},expect(brace?'}':'done')));
      }
      else if(w==='for'){
        m=t.match(/^for\s+(\w+)(?:\s+in\s*([\s\S]*))?$/);
        if(!m)throw new Error(DASH?'syntax error: Bad for loop variable':'syntax error');
        expect('do');
        var body=block(['done']);
        out.push(amp({k:'for',v:m[1],words:m[2]===undefined?'$*':m[2],body:body,all:m[2]===undefined},expect('done')));
      }
      else if(CSH&&/^while\b/.test(t)){ /* csh: while ( expr ) ... end */
        var b4=block(['end']);expect('end');
        out.push({k:'cwhile',cond:t.replace(/^while/,''),body:b4});
      }
      else if(w==='while'||w==='until'){
        ins(t.replace(/^\S+\s*/,''));
        var cond=block(['do']);expect('do');
        var b2=block(['done']);
        out.push(amp({k:w,cond:cond,body:b2},expect('done')));
      }
      else if(w==='if'&&!(CSH&&/^if\s*\(/.test(t))){ins(t.replace(/^\S+\s*/,''));out.push(ifNode())} /* csh's one-line if is a command */
      else if(w==='case'){
        m=t.match(/^case\s+(\S+)\s+in(?:\s+([\s\S]*))?$/);
        if(!m)throw new Error('syntax error');
        if(m[2])ins(m[2]);
        var arms=[];
        for(;;){
          while(i<S.length&&!S[i])i++;
          if(i>=S.length)throw MORE;
          if(firstWord(S[i])==='esac'){var end=S[i++];break}
          var a=S[i].match(/^\(?([^)]*)\)\s*([\s\S]*)$/);
          if(!a)throw new Error('syntax error');
          S[i]=a[2];
          arms.push({pats:a[1].split('|').map(function(x){return x.trim()}),body:block(['','esac'])});
        }
        out.push(amp({k:'case',word:m[1],arms:arms},end));
      }
      else if(w==='foreach'){
        m=t.match(/^foreach\s+(\w+)\s*\(([\s\S]*)\)$/);
        if(!m)throw new Error('foreach: Words not parenthesized.');
        var b3=block(['end']);expect('end');
        out.push({k:'for',v:m[1],words:m[2],body:b3});
      }
      else out.push({k:'cmd',t:t,L:S.ln[i-1]}); /* L: the line it is on */
    }
  }
  return block(null);
}
function runBlock(B){
  B.forEach(function(st){queue(function(){if(!LOOP&&!LOGOUT)runStmt(st)})});
}
function afterLoop(){var was=LOOP;if((was==='break'||was==='continue')&&LOOPN>0){LOOPN--;return 'break'}if(was!=='exit'&&was!=='stop'&&was!=='abort'&&was!=='return')LOOP=null;return was} /* stop: ^Z, which bash's loops all end at; abort: a $(( )) that went wrong ends the whole line */
function over(was){return was==='break'||was==='exit'||was==='stop'||was==='abort'||was==='return'}
var PIPEMAX=65536,PIPEBUF=4096; /* PIPEMAX: the writes a pipe takes from a loop before the loop's process is ended (memory stays bounded).
   PIPEBUF: the bytes a pipe holds before the writer has to wait for its reader (V7's and 4.3BSD's pipe size), so a reader
   is taken to read once that much waits for it: a short loop is done before head has even started, as it usually is on the real systems */
function pipeReader(stages,i){ /* what the command at stages[i] does with the pipe into it: {done, take(text, part)}, or null when it reads all of it.
                                  part: a piece of a line that has no newline yet (echo -n), which a line reader does not count as a line
                                  head -5 or read: they stop reading and exit, and the loop's next write gets SIGPIPE; cat, grep, tr
                                  and tee pass what they read on, and stop once their own pipe's reader has */
  var st=stages[i],w=st&&st.words,gone={done:true,take:function(){}};
  if(!st||st.sub!==undefined||!w.length||markNode(w[0]))return null;
  if(st.in!==null||st.here!==undefined)return gone; /* it reads a file instead */
  function lines(n,bytes){var r={done:n<=0,take:function(l,part){if((n-=(bytes?l.length:0)+(part?0:1))<=0)r.done=true}};return r}
  if(w[0]==='read')return lines(1);
  if(w[0]==='head'){
    if(!has(CMDS,'head'))return gone; /* V7 has none */
    if(!PH.headArgs)return null;
    var o=PH.headArgs(w.slice(1));
    return o.err||o.F.some(function(x){return x.f!=='-'||!PROFILE.bash})?gone:o.c!==null?o.c<0?null:lines(o.c,true):o.n<0||o.z?null:lines(o.n); /* -z: its lines end at a NUL */
  }
  var ops=w.slice(1).filter(function(x){return x.charAt(0)!=='-'||x==='-'}),pass,fl,re;
  if(w[0]==='cat'||w[0]==='tee'||w[0]==='tr')pass=function(){return true};
  else if(w[0]==='grep'&&PH.grepPlan){ /* the lines it prints */
    var g=PH.grepPlan(w.slice(1));
    if(!g)return gone; /* it only complains, and reads nothing */
    if(/[co]/.test(g.fl))return null;
    re=g.re;fl=g.fl;ops=g.files;
    pass=function(l){return g.test(l)!==/v/.test(fl)};
  }
  else return null;
  if(w[0]!=='tee'&&w[0]!=='tr'&&ops.some(function(x){return x!=='-'}))return gone; /* cat f, grep x f: they read their files */
  var down=i<stages.length-1&&st.out===null&&!st.closed&&!st.glass?pipeReader(stages,i+1):null;
  if(!down)return null;
  var p=newPipe(down),buf='',r={done:false,take:function(l,part){ /* its write after its reader went: SIGPIPE */
      if(re){if(part){buf+=l;return}l=buf+l;buf='';if(!pass(l))return} /* grep looks at whole lines */
      if(!pipeWrite(p,l,part))r.done=true},
    flush:function(){pipeTake(p);r.done=p.gone}};
  return r;
}
function newPipe(r){return r&&{r:r,q:[],n:0,gone:false}}
function pipeWrite(p,l,part){ /* false: the reader has gone, and the writer gets SIGPIPE. part: no newline after it yet */
  if(p.gone)return false;
  p.q.push([l,part]);p.n+=l.length+(part?0:1);
  if(p.n>=PIPEBUF)pipeTake(p);
  return true;
}
function pipeTake(p){ /* the reader reads what waits in the pipe; cat, grep, tr or tee pass it straight on down theirs */
  for(var k=0;k<p.q.length&&!p.r.done;k++)p.r.take(p.q[k][0],p.q[k][1]);
  if(p.r.flush&&!p.r.done)p.r.flush();
  p.q=[];p.n=0;p.gone=p.r.done;
}
function pipeBroke(S){S.broke=true;STATUS=128+SIG.PIPE;LOOP='exit';return true} /* the writer's process dies of SIGPIPE (bash: status 141) */
function pipeFull(){ /* a loop writing to a pipe whose reader has gone: the loop's process dies of SIGPIPE */
  var S=SINK,bad;
  if(!S||!S.cap)return false;
  bad=S.w>=S.cap;
  while(S.pipe&&!bad&&S.fed<S.length){ /* each line once; one left open (echo -n) goes in a piece at a time, as it was written */
    var l=S[S.fed],piece=l.slice(S.fedc);
    if(S.fed===S.length-1&&S.open){if(piece)bad=!pipeWrite(S.pipe,piece,true);S.fedc=l.length;break}
    bad=!pipeWrite(S.pipe,piece);S.fed++;S.fedc=0;
  }
  return bad&&pipeBroke(S);
}
function pipeWait(){ /* in a step: the writer waits (sleep, a read from the terminal), so its reader gets to read what is in the pipe now,
                        not only once PIPEBUF has filled it; true when a write the writer made has met a reader that is gone */
  var S=SINK;
  if(!S||!S.pipe||S.broke)return !!(S&&S.broke);
  if(pipeFull())return true;
  pipeTake(S.pipe);
  return false;
}
function passWait(){ /* between rounds of a while loop, so that ^C can reach it; a loop writing into a pipe only now and then */
  var S=SINK;
  if(S&&S.cap&&S.w!==S.at){S.at=S.w;S.runs=(S.runs||0)+1;if(S.runs%256)return}
  return sleep(0);
}
function round(body,again){ /* a while loop's body, then again() unless it ended in break or exit */
  runBlock(body);
  var stop;
  queue(function(){var was=afterLoop();stop=over(was)||pipeFull();if(!stop)return passWait()});
  queue(function(){if(!stop&&!LOOP)again()});
}
var NODES=[],NODEID=new Map(),MARK='\uE031',MARKP=new RegExp('^'+MARK),MARKN=new RegExp('^'+MARK+'(\\d+)'); /* a loop with a pipe or redirection after it: the pipeline's stage MARK n runs NODES[n]; NODEID: each node's n */
function markNode(w){var k=MARKN.exec(w||'');return k&&{node:Object.assign({},NODES[+k[1]],{tail:null,head:null}),len:k[0].length}} /* MARK n: a copy of its loop, to run as a command of the pipeline, and the length of MARK n */
function runStmt(st){
  if(st.bg){bgStmt(st);return}
  if(st.tail||st.head){var id=NODEID.get(st);if(id===undefined){id=NODES.push(st)-1;NODEID.set(st,id)}execText((st.head?st.head+' ':'')+MARK+id+(st.tail?' '+st.tail:''));return} /* done | cat, done < f > g, echo q | while ...: the loop is a command of the pipeline */
  if(/^(for|afor|while|until|cwhile)$/.test(st.k)){ /* a loop: how deep, so that a ^Z can end them all and nothing after */
    LOOPD++;LOOPSUB.push(SUB);loopStmt(st);
    queue(function(){LOOPSUB.pop();if(!--LOOPD&&LOOP==='stop')LOOP=null},true);
    return;
  }
  loopStmt(st);
}
function bgStmt(st){ /* while ...; done &: the shell forks, and the copy runs it. In a `command` or a pipe, it is run through */
  var it=Object.assign({},st,{bg:false});
  if(!SUB&&!SINK&&(!ERRSINK||ERRSINK===GLASS)){startJob('',{run:function(){runStmt(it)},shown:compText(it,'').join('\n')});return}
  var back=keep(),was=JOB;JOB={sub:SUB>0,level:SUB+1};SUB++;tell();runStmt(it);
  queue(function(){bgEnd(back,was)},true);
}
function bgEnd(back,was){var j=JOB;JOB=was;SUB--;PIDNOW=null;var bg=j&&j.last||LASTBG;back();LASTBG=bg;STATUS=0} /* the end of a & run through: its shell's pid stays $!, not one of the jobs it started in turn */
function compText(n,ind){ /* bash's make_command_string for a loop, an if or a case: the lines jobs shows, and a pipe or redirection after it */
  var L=compLines(n,ind);
  if(n.tail)L[L.length-1]+=' '+n.tail.replace(/\s+/g,' ');
  if(n.head)L[0]=ind+n.head.replace(/\s+/g,' ')+' '+L[0].slice(ind.length);
  return L;
}
function compLines(n,ind){
  var I=ind+'    ';
  function list(B){return B.map(function(x){return x.k==='cmd'?oneLine(x.t):compText(x,'').join('\n')}).join('; ')}
  function body(B,ind,last){
    var L=[],run=[];
    function flush(){if(run.length){L.push(ind+run.join('; ')+';');run=[]}}
    B.forEach(function(x){if(x.k==='cmd')run.push(oneLine(x.t));else{flush();var c=compText(x,ind);c[c.length-1]+=';';L=L.concat(c)}});
    flush();
    if(last&&L.length)L[L.length-1]=L[L.length-1].replace(/;$/,'');
    return L;
  }
  if(n.k==='while'||n.k==='until')return [ind+n.k+' '+list(n.cond)+'; do'].concat(body(n.body,I),[ind+'done']);
  if(n.k==='afor')return [ind+'for (('+n.e.join('; ')+'))',ind+'do'].concat(body(n.body,I),[ind+'done']);
  if(n.k==='for')return [ind+'for '+n.v+' in '+(n.all?'"$@"':oneLine(n.words))+';',ind+'do'].concat(body(n.body,I),[ind+'done']);
  if(n.k==='if')return [ind+'if '+list(n.cond)+'; then'].concat(body(n.then,I),n.els?[ind+'else'].concat(body(n.els,I)):[],[ind+'fi']);
  if(n.k==='case'){
    var L=[ind+'case '+n.word+' in '];
    n.arms.forEach(function(a){L=L.concat([I+a.pats.join(' | ')+')'],body(a.body,I+'    ',true),[I+';;'])});
    return L.concat([ind+'esac']);
  }
  return [ind+oneLine(n.t||'')];
}
function loopStmt(st){
  if(st.k==='cmd'){if(st.sl&&SCRLN)SCRLN.ln=st.sl;if(st.dl)DAT=st.dl;unaliased(st.t,execSeg);return} /* an alias may hold a ; */
  if(st.k==='for'){
    var bw=bracesOr(st.words);if(bw===null){STATUS=1;return}
    substitute(bw,function(text){
      var L=parsed('x x '+text); /* for's own words before the list: a ( in it is bash's token ( */
      if(!L)return;
      var W=L[0]?L[0].stages[0].words.slice(2):[];
      (function next(i){
        if(i>=W.length)return;
        queue(function(){ENV[st.v]=W[i];runBlock(st.body)});
        queue(function(){if(!over(afterLoop())&&!pipeFull())next(i+1)});
      })(0);
    });
    return;
  }
  if(st.k==='afor'){ /* bash's arithmetic for: init once, then the body while test is not 0 (an empty one is 1), step after each round */
    function ev(x){return x?arithRun(x,'(('):BigInt(1)}
    if(ev(st.e[0])===null){STATUS=1;return}
    STATUS=0;
    (function again(){
      var c=ev(st.e[1]);
      if(c===null){STATUS=1;return}
      if(c!==BigInt(0))round(st.body,function(){if(ev(st.e[2])===null){STATUS=1;return}again()});
    })();
    return;
  }
  if(st.k==='while'||st.k==='until'){
    (function again(){
      runBlock(st.cond);
      queue(function(){if(!LOOP&&(STATUS===0)===(st.k==='while'))round(st.body,again)});
    })();
    return;
  }
  if(st.k==='cwhile'){ /* the expression is worked out afresh each time round, $variables and all */
    (function again(){
      PH.cshWhile(st.cond,function(yes,any,last){if(yes)round(st.body,function(){if(!LOGOUT)again()});else if(any)STATUS=last});
    })();
    return;
  }
  if(st.k==='if'){
    runBlock(st.cond);
    queue(function(){if(LOOP)return;if(STATUS===0)runBlock(st.then);else if(st.els)runBlock(st.els);else if(PROFILE.bash)STATUS=0});  /* bash: 0 when no branch ran; V7's execute() leaves the condition's */
    return;
  }
  if(st.k==='case'){
    substitute(st.word,function(text){
      var L=parsed('x '+text);
      if(!L)return;
      var v=L[0]&&L[0].stages[0].words[1]||'';
      for(var i=0;i<st.arms.length;i++){
        var hit=st.arms[i].pats.some(function(p){
          try{return globRe(p).test(v)}catch(e){return p===v}
        });
        if(hit){runBlock(st.arms[i].body);return}
      }
    });
  }
}
function runScript(lines,args,dot){ /* a script: a tree of statements, inside the current step. dot: the . command's file, {name}: args are $1 ... (none: they stay) */
  var keep=ARGS,keepSub=SUB,keepShell=SHID,keepAt=SCRLN,keepLS=null,keepLD=0,keepLU=0,keepSee=null,tree,ran=false,shown=lines,name=dot?dot.name:(args&&args[0])||(CSH?'csh':bashy()?'bash':'sh'),warns=[];
  if(!PROFILE.dos&&!PROFILE.noUnix)lines=hereJoin(lines,{ph:true,eof:function(op,n){ /* a here-document the script ends in: bash warns once, as it reads it (before that command runs); csh's heredoc gives up each time it runs */
    if(bashy())warns.push({ln:op.ln,msg:name+': line '+n+': warning: here-document at line '+(op.line+1)+" delimited by end-of-file (wanted `"+op.word+"')"});
    else if(CSH)op.err=op.word+': << terminator not found';
  }}).lines;
  if(bashy())lines=arrJoin(lines); /* x=( on one line, its ) on a later one: one command */
  if(SV)lines=fnJoin(lines); /* System V: name() { on one line, its } on a later one */
  var bad=synCheck(lines);
  if(bad){ /* the lines before it run, up to the last whole command before it; then the script ends there (bash and V7: status 2; csh's error() seeks to the end, status 1) */
    var cut=lastGood(lines,bad.from);
    var at=bad.at+1,said=bad.msgs.map(function(m){
      if(CSH)return m;
      if(DASH)return name+': '+at+': '+dashSyn(m.replace(/^\S+: \d+: /,''));
      if(PROFILE.bash)return name+': line '+at+': '+m.replace(/^bash: /,'');
      return name+': '+m.replace(/^syntax error/,'syntax error at line '+at);
    });
    if(bashy())said.splice(1,0,name+': line '+at+": `"+shown[bad.at]+"'");
    if(cut)runScript(lines.slice(0,cut),args,dot);
    queue(function(){said.forEach(function(m){typeLine(m,'err')});queue(function(){STATUS=CSH?1:2})});
    return;
  }
  if(PROFILE.bash)lines=lines.map(dollarParen); /* $(cmd) in a script too */
  var L1=lines.map(function(l){return /^\s*#/.test(l)?'':l}); /* a comment line stays, empty, so the lines keep their numbers */
  if(DASH){ /* dash reads a command at a time: the ones before a compound command that does not read run, then it says why, at its line */
    var oq='',qs=0;
    L1.forEach(function(l,k){var was=oq;oq=openQuote(l,oq);if(!was&&oq)qs=k});
    try{WANT='';if(oq)throw {ln:qs,q:true};tree=parseTree(L1)}catch(e){
      if(e.q){if(qs)runScript(lines.slice(0,qs),args,dot);queue(function(){typeLine(name+': '+(lines.length+1)+': Syntax error: Unterminated quoted string','err');queue(function(){STATUS=2})});return}
      var ln=e===MORE?lines.length+1:(e.ln||0)+1,cut1=Math.min(ln-1,lines.length),m1=e===MORE?'end of file':e.message,w1=WANT;
      cut1=lastGood(L1,cut1);
      if(cut1)runScript(lines.slice(0,cut1),args,dot);
      queue(function(){WANT=w1;typeLine(name+': '+ln+': '+dashSyn(m1),'err');WANT='';queue(function(){STATUS=2})});
      return;
    }
  }
  if(!PROFILE.dos&&!tree&&!(tree=treeOf(L1,'syntax error: end of file unexpected')))return; /* dash's is read already */
  if(tree)walkTree(tree,function(n){if(n.L!==undefined)n.sl=n.L+1}); /* sl: the line each command is on, for bash's name: line N: */
  queue(function(){return sleep(0)}); /* so that ^C can reach a script that keeps running itself */
  queue(function(){
    if(SCRIPTS>=32){typeLine(PROFILE.dcl?'%SYSTEM-F-EXQUOTA, process quota exceeded':PROFILE.dos?'Insufficient memory':CSH?'No more processes.':'sh: no more processes','err');return}
    ran=true;SCRIPTS++;keepSub=SUB;SUB=0;keepShell=SHID;SHID=++SHIDS;keepSee=JOBSEE;JOBSEE=null;if(!dot){keepLS=LOOPSUB;LOOPSUB=[];keepLD=LOOPD;LOOPD=0;keepLU=LOOPUP;LOOPUP=0} /* a script's exit ends the script, wherever its output is going; its jobs and loops are its own: a break in it does not reach the caller's */
    if(PROFILE.dos){lines.forEach(function(l){queue(function(){if(LOOP)return;var s=dosLine(l);if(s.trim())execSeg(s)})});return} /* DCL's EXIT ends the procedure */
    ARGS=dot?(args?[ARGS[0]||''].concat(args):ARGS):args||['sh'];SCRLN={name:name,ln:1};
    var ln=null;
    tree.forEach(function(st,x){queue(function(){ /* a $(( )) that went wrong ends the rest of its line, and the script goes on with the next */
      if(LOOP==='abort'&&st.ln!==ln)LOOP=null;
      ln=st.ln;SCRLN.ln=st.ln+1;
      var next=x+1<tree.length?tree[x+1].ln:Infinity;
      warns.forEach(function(w){if(!w.said&&w.ln<next){w.said=true;typeLine(w.msg,'err')}});
      if(!LOOP&&!LOGOUT)runStmt(st);
    })});
  });
  queue(function(){
    if(!ran)return; /* ^C got in first, or there were too many */
    var out=dot&&LOOP==='exit'&&!PROFILE.dos; /* an exit in a . file is the shell's own: it ends the script that ran the . too, or at the terminal the shell */
    SCRIPTS--;SUB=keepSub;SHID=keepShell;JOBSEE=keepSee;SCRLN=keepAt;LOOP=out?'exit':dot&&(LOOP==='break'||LOOP==='continue')?LOOP:null; /* a break or continue in a . file goes on to the caller's loop */if(!dot){LOOPSUB=keepLS;LOOPD=keepLD;LOOPUP=keepLU;LOOPN=0}
    if(!PROFILE.dos&&!(dot&&!args))ARGS=keep;
    if(out&&!SCRIPTS&&!SUB&&!(ASIDE&&ASIDE.job)&&has(CMDS,'exit'))queue(function(){var st=String(STATUS);LOOP=null;CMDS.exit([st],'exit '+st,['exit',st]);if(!LOOP)LOOP='exit'}); /* the rest of the line does not run */
  },true);
}
var KEPT=[]; /* child shells not yet undone: a ^C can end their program before it calls back() */
function keep(lasting){ /* a program's child shell starts here: what the shell does to the directory and variables, back() undoes. lasting: a shell at
                           the terminal, which the next prompt does not end */
  var cwd=ST.cwd,args=ARGS.slice(),env=Object.assign({},ENV),vars=Object.assign({},CSHV),wds=Object.assign(Object.create(null),CSHW),arr=arrClone(),al=PH.aliases;
  var ints=Object.assign(Object.create(null),INTV); /* bash's declare -i names */
  var bg=LASTBG; /* $!: the child starts with its parent's, and what it starts with & is its own */
  var top=BSH[BSH.length-1],sv=top&&top.sv?svCopy(top.sv):null; /* System V sh: the shell's functions, readonly names and hash table, which the child's own do not change */
  var done=false;
  if(!lasting)KEPT.push(back);
  return back;
  function back(){
    var i=KEPT.indexOf(back);if(done||i<0&&!lasting)return;done=true;if(i>=0)KEPT.splice(i,1);
    if(find(cwd,true))ST.cwd=cwd;
    ARGS=args; /* bash's set -- and shift in it change only its own */
    Object.keys(ENV).forEach(function(k){if(!has(env,k))delete ENV[k]});Object.assign(ENV,env);
    Object.keys(CSHV).forEach(function(k){if(!has(vars,k))delete CSHV[k]});Object.assign(CSHV,vars);
    Object.keys(CSHW).forEach(function(k){if(!(k in wds))delete CSHW[k]});Object.assign(CSHW,wds);
    arrRefill(arr);
    PH.aliases=al;
    refill(INTV,ints);
    LASTBG=bg;
    if(top){if(sv)top.sv=svCopy(sv);else delete top.sv}
  }
}
function noFork(){typeLine(CSH?'No more processes.':PROFILE.bash?'bash: fork: Resource temporarily unavailable':'fork failed - too many processes','err')} /* past 32 processes deep: a command that calls itself */
function forked(cmd,then){ /* csh's { command }: run as its own process, then(its status) */
  var back=null,st;
  queue(function(){if(SUB>=32){noFork();st=1;return}back=keep();SUB++;STATUS=0;execLine(cmd)});
  queue(function(){if(!back)return;SUB--;st=STATUS;back()},true);
  queue(function(){then(st)});
}
function child(lines){var back=keep(),st=STATUS;runScript(lines);queue(function(){back();STATUS=st},true)} /* one command, as a child process: its status is not the program's */
var COMPOUND_SH=/^(for|while|until|if|case|fi|done|then|do|else|elif|esac)$/,COMPOUND_CSH=/^(foreach|while(\(.*)?)$/;
function compound(line){
  if(PROFILE.dos)return false;
  return statements([line]).some(function(t){return (CSH?COMPOUND_CSH:COMPOUND_SH).test(firstWord(t))});
}
function runCompound(lines,chk){ /* typed at the prompt: keeps asking until it is complete. chk: how far synCheck has read them */
  var tree,hj=PROFILE.dos||PROFILE.noUnix?null:hereJoin(lines); /* a here-document's lines are its body, not commands */
  try{if(hj&&hj.open)throw MORE;tree=parseTree(hj?hj.lines.map(function(l){return PROFILE.bash?dollarParen(l):l}):lines)} /* bash: $( ) on each line */
  catch(e){
    if(e!==MORE){synSay(e.message);return}
    var w0=CSH&&lines.length===1&&statements(lines)[0]||'';
    if(/^while\b/.test(w0)&&PH.cshWhileRead&&!PH.cshWhileRead(w0.replace(/^while/,'')))return; /* csh: an error in the expression, before the loop is read */
    ask(CSH?'? ':'> ',function(l){
      if(l===null)return;
      SHLINE++;
      var n=lines.length-1; /* do echo "g, then h": one line, with the newline in the quote */
      chk=chk||{n:0,inCase:0,here:[]};
      var oq=!CSH&&(chk.q!==undefined?chk.q:openQuote(lines[n])); /* what synCheck saw the line before leave open */
      var bad=!CSH&&synCheck(lines.concat(l),chk);
      if(bad){bad.msgs.forEach(synSay);return} /* sh and bash read the compound command to its end before it runs, and say an error at the line it is in; csh reads a loop's lines when it runs them */
      runCompound(oq?lines.slice(0,n).concat(lines[n]+'\n'+l):lines.concat(l),chk);
    });
    return;
  }
  if(DASH&&!SCRIPTS){var l0=SHLINE-DLN0-DSKIP-(lines.length-1);walkTree(tree,function(n){if(n.L!==undefined)n.dl=l0+n.L})} /* dash: each command's own line */
  runBlock(tree);
}
/* Here-documents: cat <<EOF, and the lines up to EOF are its input. hereJoin reads each body out of the lines that follow its
   command, where it was typed or in the script, and the command then holds <<HDM n instead: HD[n] {body, quoted, word}. The body is
   worked out each time the command runs (hereText). bash: <<-EOF strips the tabs before each line and EOF; a quote anywhere in the
   word leaves the body as it is. V7 sh (its word.c and io.c): no <<- (-EOF is the word), the same quoting. 4.3BSD csh (sh.dol.c's
   heredoc): the line has to be the word as typed, quotes and all, and a quote in it leaves the body as it is */
var HD=[],HDN=new Map(),HDM='\uE033',HDRE=/<<\uE033(\d+)/g;
function hereOps(line,q){ /* the here-document operators in line, {ops:[{at,end,word,quoted,strip}], q: the quote it leaves open}. q: one open before it */
  var ops=[],i=0,j,depth=0,spec=false,cs=0; /* csh: how deep in ( ) it is, whether the command is one whose ( ) are an expression or a list, and where it starts */
  if(q){j=q==='"'&&!CSH?closeDq(line,-1):line.indexOf(q);if(j<0)return {ops:ops,q:q};i=j+1;cs=i}
  for(;i<line.length;i++){
    var c=line.charAt(i);
    if(c==='\\'){i++;continue}
    if(c==='#'&&(!i||/[\s;|&<>]/.test(line.charAt(i-1))))break;
    if(c==='`'||c==="'"||c==='"'){if((j=quoteEnd(line,i))<0)return {ops:ops,q:c};i=j;continue}
    if(c==='$'&&line.substr(i+1,2)==='(('&&(j=parenEnd(line,i+1))>0){i=j;continue}
    if(PROFILE.bash&&line.substr(i,2)==='(('&&(atCmd(line,i)||/(^|[\s;&|(])for\s*$/.test(line.slice(0,i)))&&(j=parenEnd(line,i))>0){i=j;continue} /* (( 1 << 2 )) and for (( )): arithmetic */
    if(CSH){ /* sh.parse.c's syn3: in @, if, while, set and the rest, a < or > inside ( ) is a word; a ( ) list's own << is its here-document */
      if(c==='('){if(!depth)spec=/^\s*(else\s+)*(@|exit|foreach|if|set|switch|while)(\s|$)/.test(line.slice(cs,i)+' ');depth++;continue}
      if(c===')'){if(depth)depth--;continue}
      if(!depth&&/[;|&]/.test(c)){cs=i+1;continue}
      if(depth&&spec)continue;
    }
    if(line.substr(i,3)==='<<<'&&PROFILE.bash){i+=2;continue}
    if(line.substr(i,2)!=='<<'||line.charAt(i+2)===HDM)continue;
    var k=i+2,strip=PROFILE.bash&&line.charAt(k)==='-';
    if(strip)k++;
    while(/[ \t]/.test(line.charAt(k)))k++;
    var w0=k;
    for(;k<line.length;k++){
      var d=line.charAt(k);
      if(/[\s;&|<>()]/.test(d))break;
      if(d==='\\')k++;
      else if((j=quoteEnd(line,k))>=0)k=j;
      else if(d==="'"||d==='"'||d==='`')return {ops:ops,q:d};
    }
    var raw=line.slice(w0,k);
    if(raw)ops.push({at:i,end:k,word:CSH?raw:unquoteWord(raw),quoted:/['"\\`]/.test(raw),strip:strip}); /* none: the parser says what is wrong */
    i=k-1;
  }
  return {ops:ops,q:''};
}
function unquoteWord(w){return w.replace(/\\([\s\S])|'([^']*)'|"((?:[^"\\]|\\[\s\S])*)"/g,function(m,b,s,d){return b!==undefined?b:s!==undefined?s:d.replace(/\\([$`"\\])/g,'$1')})}
function hereJoin(lines,o){ /* lines with each here-document's body taken out: {lines, open: the one still reading its body, or null}.
                               o.ph: '#' where the body lines were (a script's lines keep their numbers); o.eof(op): there are no more lines,
                               and the body ends at the end (op.warn and op.err: what the shell says) */
  o=o||{};
  var out=[],q='',pend=[],done=[];
  for(var i=0;i<lines.length;i++){
    if(pend.length&&!q){
      var op=pend[0],l=op.strip?lines[i].replace(/^\t+/,''):lines[i];
      if(l===op.word){done.push(pend.shift())}else op.body.push(l);
      if(o.ph)out.push('#');
      continue;
    }
    var r=hereOps(lines[i],q);q=r.q;
    out.push(lines[i]);
    r.ops.forEach(function(op){op.ln=out.length-1;op.line=i;op.body=[];pend.push(op)});
  }
  if(pend.length&&!q){if(!o.eof)return {lines:out,open:pend[0]};pend.forEach(function(op){o.eof(op,lines.length);done.push(op)})}
  done.sort(function(a,b){return a.ln-b.ln||b.at-a.at}).forEach(function(op){ /* right to left in each line, so the places stay right */
    var h={body:op.body,quoted:op.quoted,word:op.word,warn:op.warn||null,err:op.err||null},k=JSON.stringify(h),n=HDN.get(k);
    if(n===undefined){n=HD.push(h)-1;HDN.set(k,n)}
    out[op.ln]=out[op.ln].slice(0,op.at)+'<<'+HDM+n+out[op.ln].slice(op.end);
  });
  return {lines:out,open:null,n:done.length};
}
function capture(cmd,then){ /* in a step: run cmd as a `command` does, then(the lines it printed). A `command` (and $( )) is a child process, as a ( ) is:
                               its directory, variables, aliases, functions and exit are its own. A $(( )) (SUM) is worked out in the shell itself */
  var sink=[],keepSink,keepIn,own=false,loop,sum=cmd.charAt(0)===SUM,back=null,was,shell,see,ld,lu;
  queue(function(){
    if(SUB>=32){noFork();return}
    var t=PROFILE.bash?dollarParen(cmd):cmd,bad=PROFILE.bash&&!sum&&subBad(t); /* bash: a $( ) inside a $(( )) */
    if(bad){bad.forEach(function(m){typeLine(m,'err')});queue(function(){STATUS=2});return} /* `echo a\`b`: it prints nothing, and its status is 2 */
    keepSink=SINK;keepIn=STDIN;loop=LOOP;SINK=sink;STDIN=null;
    SUB++;own=true;
    if(!sum){back=keep();was=SUBSH;shell=SHID;see=JOBSEE;ld=LOOPD;lu=LOOPUP;JOBSEE=PROFILE.bash&&!DASH?(JOBSEE!==null?JOBSEE:SHID):null;SUBSH=SUB;SHID=++SHIDS;LOOPUP=CSH?0:LOOPUP+LOOPD;LOOPD=0;LOOP=null} /* exit in it ends only it; a break or continue there leaves the loops it is in, and so ends it (loop()) */
    execLine(t);
  });
  queue(function(){
    if(!own)return;SINK=keepSink;STDIN=keepIn;SUB--;
    if(!sum){SUBSH=was;SHID=shell;JOBSEE=see;LOOPD=ld;LOOPUP=lu;if(LOOP==='break'||LOOP==='continue')LOOPN=0;LOOP=loop;back()} /* a $(( )) that went wrong in it ends only it */
  },true); /* a $(( )) that went wrong ends the line it is in */
  queue(function(){SUBST=STATUS;then(sink)});
}
var SUBST=null; /* the status of the last `command` in the command that is being worked out: bash's x=`false` takes it */
function hereText(h,then,fail){ /* in a step: the lines a here-document gives its command, then(them); fail(): it could not be worked out.
                                   Unquoted: $names, `commands` (and bash's $( ) and $(( ))) worked out in turn, and \ quoting $ ` \ (and a newline) */
  if(h.warn)typeLine(h.warn,'err');
  if(h.err){typeLine(h.err,'err');STATUS=1;fail();return}
  if(h.quoted||!h.body.length){then(h.body.slice());return}
  var t=h.body.join('\n'),P=[],lit='',j,m;
  for(var i=0;i<t.length;i++){
    var c=t.charAt(i);
    if(c==='\\'&&i+1<t.length){var n=t.charAt(i+1);if(n==='\n'&&!CSH){i++;continue}if('$`\\'.indexOf(n)>=0){lit+=n;i++;continue}}
    else if(c==='`'&&(j=tickEnd(t,i))>0){P.push(lit,{cmd:unslash(t.slice(i+1,j))});lit='';i=j;continue}
    else if(PROFILE.bash&&c==='$'&&t.charAt(i+1)==='('){
      if(t.charAt(i+2)==='('&&(j=sumEnd(t,i+1))>0){P.push(lit,{cmd:SUM+' "'+t.slice(i+3,j-1)+'"'});lit='';i=j;continue}
      if((j=parenEnd(t,i+1))>0){P.push(lit,{cmd:t.slice(i+2,j)});lit='';i=j;continue}
    }
    else if(c==='$'&&(m=varAt(t,i))){P.push(lit,{v:m[1]});lit='';i+=m[0].length-1;continue}
    lit+=c;
  }
  P.push(lit);
  var out='';
  (function next(k){ /* each in turn: a $((y++)) changes the $y after it. Text and $names in a loop, a `command` through its capture */
    for(;;k++){
      if(LOOP==='abort'){fail();return}
      if(k>=P.length){then(out.split('\n'));return}
      var p=P[k];
      if(typeof p==='string'){out+=p;continue}
      if(p.v===undefined)break;
      try{out+=envOf(p.v)}
      catch(e){if(e&&e.undefinedVar){typeLine(e.msg||e.undefinedVar+': Undefined variable.','err');STATUS=1;fail();return}if(e&&e.arith!==undefined){arithBad(e);fail();return}throw e}
    }
    capture(p.cmd,function(L){L=L.slice();while(L.length&&L[L.length-1]==='')L.pop();out+=L.join('\n');next(k+1)});
  })(0);
}
function openQuote(s,q){ /* the quote a line leaves open, or '': a quote opens anywhere in a word, as it does in every one of these shells. q: one left open before s */
  var i=0,j;
  if(q){j=q==='"'&&!CSH?closeDq(s,-1):s.indexOf(q);if(j<0||j===undefined)return q;i=j+1}
  for(;i<s.length;i++){
    var c=s.charAt(i);
    if(c==='\\'){i++;continue}
    if(c==='#'&&(!i||/[\s;|&<>]/.test(s.charAt(i-1))))return '';
    if(c==='`'||c==="'"||c==='"'){
      j=c==='"'&&!CSH?closeDq(s,i):c==='`'?tickEnd(s,i):s.indexOf(c,i+1);
      if(j<0)return c;
      i=j;
    }
  }
  return '';
}
function quoteEnd(s,i){var c=s.charAt(i);return c==='"'?closeDq(s,i):c==="'"?s.indexOf(c,i+1):c==='`'?tickEnd(s,i):c==='$'&&s.charAt(i+1)==='{'&&PROFILE.bash&&!CSH?braceEnd(s,i):-1} /* where the quote or `command` at i ends, or -1 */
function tickEnd(s,i){for(var j=i+1;j<s.length;j++){if(s.charAt(j)==='\\')j++;else if(s.charAt(j)==='`')return j}return -1} /* the ` that ends the `command` at i: a \` in it is one inside it */
function closeDq(s,i){return nestEnd(s,i,'d')} /* the " that closes the one at i: a `command` inside it may hold its own, and bash's "${x:-"a b"}" */
function splitCmds(s){ /* on ; outside quotes.
                          And on a lone & outside ( ), after a command: it runs, and nothing waits for it. L.semi: bash's & ; */
  var L=[],start=0,ch,j,depth=0;
  for(var i=0;i<s.length;i++){
    ch=s.charAt(i);
    if((j=skipEnd(s,i,depth))>=0)i=j; /* a quote, and { a; b; }: one command too */
    else if(ch===';'&&(!depth||PROFILE.noUnix)){L.push(s.slice(start,i));start=i+1} /* (a; b): one command, in a Unix shell */
    else if(ch==='('&&!PROFILE.dos)depth++;
    else if(ch===')')depth=Math.max(0,depth-1);
    else if(ch==='&'&&!PROFILE.dos&&!depth&&!/[&>]/.test(s.charAt(i+1))&&!/[&><|]/.test(s.charAt(i-1))&&/\S/.test(s.slice(start,i))&&!/(&&|\|)\s*$/.test(s.slice(start,i))){
      L.push(s.slice(start,i+1));start=i+1; /* the & stays with its command */
      if(PROFILE.bash&&/^\s*;(?!;)/.test(s.slice(i+1)))L.semi=true;
    }
    else if(ch==='\\')i++;
    else if(ch==='#'&&!PROFILE.dos&&(!i||/[\s;|&<>]/.test(s.charAt(i-1))))break; /* a comment: no ; in it counts */
  }
  L.push(s.slice(start));
  return L;
}
var ARRASG=/[A-Za-z_]\w*(\[[^\]]*\])?\+?=\(/y; /* x=( or x+=(, where it is tried */
function arrOpen(s){ /* bash: a x=( or x+=( that the line leaves open, outside quotes and comments: its ) is on a later line */
  if(s.indexOf('=(')<0)return false;
  for(var i=0,j,m;i<s.length;i++){
    var c=s.charAt(i);
    if(c==='\\'){i++;continue}
    if((j=quoteEnd(s,i))>=0){i=j;continue}
    if(c==='#'&&(!i||/[\s;|&<>]/.test(s.charAt(i-1)))){var nl=s.indexOf('\n',i);if(nl<0)return false;i=nl;continue}
    if((!i||/[\s;&|(]/.test(s.charAt(i-1)))&&(ARRASG.lastIndex=i,m=ARRASG.exec(s))){
      if((j=parenEnd(s,i+m[0].length-1))<0)return true;
      i=j;
    }
  }
  return false;
}
function arrJoin(L){ /* a script's lines with each x=( ... ) spread over lines joined into its first line; the lines it took stay, empty, so the rest keep their numbers */
  var out=L.slice();
  for(var i=0;i<out.length;i++)for(var k=i+1;arrOpen(out[i])&&k<out.length;k++){out[i]+='\n'+out[k];out[k]=''}
  return out;
}
function groupOpen(s){ /* a { list; } that the line leaves open, outside quotes, ( ) and comments */
  for(var i=0,j;i<s.length;i++){
    var c=s.charAt(i);
    if(c==='\\'){i++;continue}
    if((j=skipEnd(s,i,0))>=0){i=j;continue}
    if(j===-2)return true;
    if(c==='#'&&(!i||/[\s;|&<>]/.test(s.charAt(i-1))))return false;
  }
  return false;
}
function dosLine(s){ /* cd\  cd..  dir/w: a command name ends at the first of these */
  return s.replace(/^(\s*)([a-z0-9]+)(?=[\\\/.;])/i,function(m,sp,c,o,s){return has(CMDS,c.toLowerCase())&&(s.charAt(o+m.length)!==';'||/^path$/i.test(c))?sp+c+' ':m}); /* a ; straight after a word only for PATH; (no path) */
}
function nextPrompt(pre){
  queue(function(){while(KEPT.length)KEPT[KEPT.length-1]();if(pre)pre();if(LOGOUT){LOGOUT=false;return}return ttFree(shellPrompt)},true);
}
function shellPrompt(p,mode,kept){ /* the shell's prompt, after what has become of its jobs. kept: the files have just been tried */
  if(!kept&&!keepFiles()){typeLine(diskFull(FULLBY?FULLBY.by:undefined),'err');queue(function(){shellPrompt(p,mode,true)},true);return} /* the browser is full: the change lasts until a reload */
  if(p!=null||mode||!notesDue()){showPrompt(p,mode);return}
  jobNotes();queue(function(){showPrompt()},true);
}
function dollarParen(s,deep){ /* bash: $(command) is `command`, outside single quotes, a $( ) inside it a \`command\` in that. $((sum)) is a `command` of its own.
                                   deep: how many $( ) it is inside. Each level doubles the backslashes, so past DEEPMAX one is a fork that fails, as past 32 processes */
  var o='',sq=false,dq=false,bq=false,j,c,in_;deep=deep||0; /* bq: inside a `command`, where the one made for a $(( )) is a \`command\` */
  for(var i=0;i<s.length;i++){
    c=s.charAt(i);
    if(c==='\\'&&!sq){o+=s.substr(i,2);i++;continue}
    if(c==="'"&&!dq)sq=!sq;
    else if(c==='"'&&!sq)dq=!dq;
    else if(c==='`'&&!sq)bq=!bq;
    else if(!sq&&c==='$'&&s.substr(i+1,2)==='(('&&(j=sumEnd(s,i+1))>0){var q=bq?'\\`':'`';o+=q+SUM+' "'+s.slice(i+3,j-1)+'"'+q;i=j;continue}
    else if(!sq&&c==='$'&&s.charAt(i+1)==='['&&(j=brackEnd(s,i+1))>0){var q1=bq?'\\`':'`';o+=q1+SUM+' "'+s.slice(i+2,j)+'"'+q1;i=j;continue} /* $[sum]: the old form of $((sum)) */
    else if(!sq&&c==='$'&&s.charAt(i+1)==='('&&s.charAt(i+2)!=='('&&(j=parenEnd(s,i+1))>=0){in_=(deep<DEEPMAX?dollarParen(bq?s.slice(i+2,j).replace(/\\([\\`$])/g,'$1'):s.slice(i+2,j),deep+1):DEEP).replace(/[\\`]/g,'\\$&');o+=bq?'\\`'+in_.replace(/[\\`]/g,'\\$&')+'\\`':'`'+in_+'`';i=j;continue}
    o+=c;
  }
  return o;
}
function brackEnd(s,k){for(var d=0,j=k;j<s.length;j++){var c=s.charAt(j);if(c==='[')d++;else if(c===']'&&!--d)return j}return -1} /* the ] that closes the [ at k */
var SUM='\uE020',DEEP='\uE021',DEEPMAX=20; /* the names of the commands that work out a $(( )) and stand for a $( ) too deep to fork: nobody can type them */
function sumEnd(s,k){ /* the ) that closes the ( at k, when the one before it closes the ( at k+1: $((...)) */
  for(var d=0,j=k;j<s.length;j++){
    if(s.charAt(j)==='(')d++;
    else if(s.charAt(j)===')'&&!--d)return s.charAt(j-1)===')'&&!s.slice(k+2,j-1).split('').some(function(c){return (d+=c==='('?1:c===')'?-1:0)<0})&&!d?j:-1;
  }
  return -1;
}
if(PROFILE.bash)CMDS[SUM]=function(a,raw,words){ /* bash's $(( )): what arith() makes of it, or its error, which ends the whole command line (bash's jump to top level), status 1 */
  var e=words.slice(1).join(' ');
  try{if(DASH&&/\*\*/.test(e))throw {arith:''};typeLine(String(arith(e)))} /* dash has no ** */
  catch(x){if(!x||x.arith===undefined)throw x;if(DASH)x={arith:'arithmetic expression: '+(/division by 0/.test(x.arith)?'division by zero':/operand expected|^$/.test(x.arith)?'expecting primary':'expecting EOF')+': "'+e+'"'};arithBad(x)}
};
if(PROFILE.bash)CMDS[DEEP]=function(){noFork()};
function bashAt(){if(DASH)return SCRLN&&SCRIPTS?SCRLN.name+': '+SCRLN.ln+': ':'sh: '+(DAT||Math.max(SHLINE-DLN0-DSKIP,0))+': ';return SCRLN&&SCRIPTS?SCRLN.name+': line '+SCRLN.ln+': ':'bash: '} /* dash: name: N:, and at its prompt sh: and the line it has read */ /* how bash starts an error: in a script, its name and line */
function arithBad(x){typeLine(bashAt()+x.arith,'err');STATUS=x.st||1;if(x.st)queue(function(){STATUS=x.st});LOOP=x.quit&&SCRIPTS?'exit':'abort'} /* a $(( )) that went wrong: the rest of the line does not run. quit: a ${x?} or dash's Bad substitution, which ends a script */
var ARITH_PREC={'||':1,'&&':2,'|':3,'^':4,'&':5,'==':6,'!=':6,'<':7,'>':7,'<=':7,'>=':7,'<<':8,'>>':8,'+':9,'-':9,'*':10,'/':10,'%':10}; /* the binary operators' levels, ** (11) apart */
var ARITH_OPS=['<<=','>>=','**','<<','>>','<=','>=','==','!=','&&','||','*=','/=','%=','+=','-=','&=','^=','|=','++','--','=','+','-','*','/','%','<','>','&','^','|','!','~','?',':','(',')',','];
function arith(e,depth){ /* bash 5.2's expr.c: 64-bit whole numbers, its operators and their order, names with or without $ (a name's value is itself
                            worked out), name[i] of an array, assignments, and its error messages with the token where it stopped */
  depth=depth||0;
  var B=BigInt,Z=B(0),ONE=B(1),s=e,p=0,tok=null,val=Z,name=null,sub=null,last=null,lastp=0,noeval=0,lhs=null;
  var show=s.replace(/^\s+/,'');
  function bad(msg,at){throw {arith:show+': '+msg+' (error token is "'+s.slice(at===undefined?lastp:at)+'")'}}
  function wrap(v){return B.asIntN(64,v)}
  function num(t){ /* strlong: 0x1f, 017, base#digits. Its errors show the expression only as far as the number, which is the token */
    var base=10,found=false,v=Z,i=0;
    function bad(msg){throw {arith:s.slice(0,p).replace(/^\s+/,'')+': '+msg+' (error token is "'+t+'")'}}
    if(t.charAt(0)==='0'){i=1;if(t.length===1)return Z;if(/[xX]/.test(t.charAt(1))){base=16;i=2}else base=8;found=true}
    for(;i<t.length;i++){
      var c=t.charAt(i),d;
      if(c==='#'){
        if(found)bad('invalid number');
        if(v<B(2)||v>B(64))bad('invalid arithmetic base');
        base=Number(v);v=Z;found=true;
        if(!/[A-Za-z0-9_@]/.test(t.charAt(i+1)))bad('invalid integer constant');
        continue;
      }
      d=/\d/.test(c)?+c:/[a-z]/.test(c)?c.charCodeAt(0)-87:/[A-Z]/.test(c)?c.charCodeAt(0)-(base<=36?55:29):c==='@'?62:63;
      if(d>=base)bad('value too great for base');
      v=wrap(v*B(base)+B(d));
    }
    return v;
  }
  function next(){ /* readtok: the next token; at the end the error token stays where the last one began */
    last=tok;
    while(p<s.length&&/\s/.test(s.charAt(p)))p++;
    if(p>=s.length){tok='END';return}
    lastp=p;
    var c=s.charAt(p),m;
    if(/\d/.test(c)){m=/^[0-9A-Za-z#@_]+/.exec(s.slice(p));p+=m[0].length;tok='NUM';val=num(m[0]);return}
    if(/[A-Za-z_]/.test(c)){
      m=/^[A-Za-z_]\w*/.exec(s.slice(p));p+=m[0].length;name=m[0];sub=null;
      if(s.charAt(p)==='['){
        var d=0,j=p;for(;j<s.length;j++){if(s.charAt(j)==='[')d++;else if(s.charAt(j)===']'&&!--d)break}
        if(j>=s.length){p=s.length;bad('bad array subscript')}
        sub=s.slice(p+1,j);p=j+1;
      }
      tok='STR';val=noeval?Z:lookup(name,sub);return;
    }
    for(var k=0;k<ARITH_OPS.length;k++){
      var o=ARITH_OPS[k];
      if(s.substr(p,o.length)!==o)continue;
      if(o==='++'||o==='--'){
        if(last==='STR'){p+=2;tok=o==='++'?'POSTINC':'POSTDEC';return}
        if(last!=='NUM'&&/^\s*[A-Za-z_]/.test(s.slice(p+2))){p+=2;tok=o==='++'?'PREINC':'PREDEC';return}
        continue; /* a + or - of its own */
      }
      p+=o.length;tok=o;return;
    }
    bad('syntax error: invalid arithmetic operator');
  }
  function lookup(n,i){var v=arrayVal(n,i);return v===''?Z:arith(v,depth+1)}
  function arrayVal(n,i){ /* a name's value, or name[i]'s */
    if(i===null)return envOf(n);
    var k=arrKey(n,i,true);return k===null?'':arrGet(n,k)||'';
  }
  function put(n,i,v){if(noeval)return v;if(i===null)setVar(n,String(v));else{var k=arrKey(n,i,false);if(k===null)bad('bad array subscript');arrPut(n,k,String(v))}return v}
  function* comma(){var v=yield assign();while(tok===','){next();v=yield assign()}return v}
  function* assign(){
    var v=yield cond();
    if(tok==='='||/^[-+*\/%&^|]=$|^(<<|>>)=$/.test(tok)){
      var op=tok,lv=v;
      if(last!=='STR')bad('attempted assignment to non-variable');
      var n=name,i=sub;
      next();v=yield assign();
      if(op!=='=')v=binop(op.slice(0,-1),lv,v,lastp);
      return put(n,i,v);
    }
    return v;
  }
  function* cond(){
    var c=yield bin(1);
    if(tok!=='?')return c;
    next();
    if(tok==='END'||tok===':')bad('expression expected');
    if(c===Z)noeval++;var v1=yield comma();if(c===Z)noeval--;
    if(tok!==':')bad("`:' expected for conditional expression");
    next();
    if(tok==='END')bad('expression expected');
    if(c!==Z)noeval++;var v2=yield cond();if(c!==Z)noeval--;
    return c!==Z?v1:v2;
  }
  function* bin(min){ /* expr.c's expression levels from || down to * / %, by precedence climbing: an operator binds what follows it up to one of
                         its own level or lower. The right of && and || is worked out only for its side effects, as noeval */
    var v=tok==='NUM'||tok==='STR'?operand1():yield unary();
    if(tok==='**')v=yield power(v);
    for(;;){
      var o=tok,pr=has(ARITH_PREC,o)?ARITH_PREC[o]:0;
      if(pr<min)return v;
      if(pr<=2){var ne=pr===1?v!==Z:v===Z;if(ne)noeval++;next();var r=yield bin(pr+1);if(ne)noeval--;v=(pr===1?v!==Z||r!==Z:v!==Z&&r!==Z)?ONE:Z;continue}
      var at;if(pr===10){at=p;while(at<s.length&&/\s/.test(s.charAt(at)))at++} /* exp2: the error token of a division by 0 is what follows the operator */
      next();v=binop(o,v,yield bin(pr+1),at);
    }
  }
  function binop(o,x,y,at){ /* at: the error token of a division by 0 */
    if((o==='/'||o==='%')&&y===Z){if(noeval)return Z;lastp=at;bad('division by 0')}
    switch(o){
      case '|':return x|y;case '^':return x^y;case '&':return x&y;
      case '==':return x===y?ONE:Z;case '!=':return x!==y?ONE:Z;
      case '<':return x<y?ONE:Z;case '>':return x>y?ONE:Z;case '<=':return x<=y?ONE:Z;case '>=':return x>=y?ONE:Z;
      case '<<':return wrap(x<<(y&B(63)));case '>>':return x>>(y&B(63));
      case '+':return wrap(x+y);case '-':return wrap(x-y);case '*':return wrap(x*y);
      case '/':return y===-ONE?wrap(-x):x/y;case '%':return y===-ONE?Z:x%y;
    }
  }
  function* power(v){ /* exp3, after its left operand: ** groups to the right */
    next();var r=yield bin(11);
    if(r===Z)return ONE;
    if(r<Z)bad('exponent less than 0');
    for(var x=ONE,b=v;r>Z;r>>=ONE){if(r&ONE)x=wrap(x*b);b=wrap(b*b)}
    return x;
  }
  function* unary(){
    if(tok==='!'){next();return (yield unary())===Z?ONE:Z}
    if(tok==='~'){next();return ~(yield unary())}
    if(tok==='-'){next();return wrap(-(yield unary()))}
    if(tok==='+'){next();return yield unary()}
    return tok==='NUM'||tok==='STR'?operand1():yield operand();
  }
  function* operand(){
    var v;
    if(tok==='PREINC'||tok==='PREDEC'){
      var up=tok==='PREINC';next();
      if(tok!=='STR')bad('identifier expected after pre-increment or pre-decrement');
      v=put(name,sub,wrap(val+(up?ONE:-ONE)));tok='NUM';next();return v;
    }
    if(tok==='('){next();v=yield comma();if(tok!==')')bad("missing `)'");next();return v}
    bad('syntax error: operand expected');
  }
  function operand1(){ /* a number, or a name and its ++ or -- after: no nesting, so no generator */
    var v=val;
    if(tok==='NUM'){next();return v}
    var n=name,i=sub;next();
    if(tok==='POSTINC'||tok==='POSTDEC'){put(n,i,wrap(v+(tok==='POSTINC'?ONE:-ONE)));tok='NUM';next()}
    return v;
  }
  if(depth>=1024){lastp=0;bad('expression recursion level exceeded')}
  next();
  if(tok==='END')return Z;
  var v=nest(comma());
  if(tok!=='END')bad('syntax error in expression');
  return v;
}
function nest(g){ /* runs arith's parser, whose functions each yield the one they call: the nesting of (((1))) or - - 1 is on this stack, not JavaScript's,
  so it goes as deep as bash's own does (a C stack of 8 MB) */
  var st=[g],v,e,thrown=false,r;
  for(;;){
    try{r=thrown?st[st.length-1].throw(e):st[st.length-1].next(v)}
    catch(x){st.pop();if(!st.length)throw x;e=x;thrown=true;continue}
    thrown=false;v=undefined;
    if(!r.done)st.push(r.value);
    else{st.pop();v=r.value;if(!st.length)return v}
  }
}
var SHLINE=0; /* the lines the shell has read from the terminal: bash's line number */
function nextLine(then,p){ /* the rest of the command on a > line (p: another prompt): then(it, or null at ^D). ^C: bash just gives a new prompt */
  var g=GEN,l;
  queue(function(){return readLine(p===undefined?'> ':p).then(function(x){l=x;if(x!==null)SHLINE++})});
  queue(function(){if(g!==GEN)nextPrompt();else then(l)},true);
}
function run(raw){
  LOOP=null;DAT=0; /* a break typed at the prompt has no loop to end */
  RUNS++;if(V7NOTE.length)queue(v7Notes);
  JOB=null;JOBS=0; /* the jobs of the line before have finished */
  var typed=raw; /* as typed: synCheck reads its $( ) */
  if(PROFILE.bash)raw=dollarParen(raw);
  SUB=0;SUBSH=0;LOOPD=0;LOOPUP=0;LOOPSUB=[];
  if(!raw.trim()&&PH.blank){queue(function(){PH.blank()});nextPrompt();return} /* a machine that answers an empty line (VM/370's CMS and CP) */
  if(PROFILE.dos){
    if(raw.trim())execSeg(dosLine(raw));
    nextPrompt();
    return;
  }
  var hj=PROFILE.noUnix?null:hereJoin(typed.split('\n'));
  if(hj&&hj.open){ /* a here-document: its lines come next, after the shell's second prompt (4.3BSD csh's heredoc reads them with none) */
    if(CSH&&typed.indexOf('\n')<0){ /* csh reads a here-document as it runs its command (sh.dol.c's heredoc, from sh.sem.c's doio): the commands before it on the line run first */
      var sg=splitCmds(typed),k=0;
      while(k<sg.length&&!hereOps(sg[k]).ops.length)k++;
      if(k>0&&k<sg.length){
        var bad0=synCheck([typed]);
        if(bad0){bad0.msgs.forEach(synSay);nextPrompt();return}
        execLine(sg.slice(0,k).join(';'));
        queue(function(){if(LOGOUT||LOOP)nextPrompt();else run(sg.slice(k).join(';'))});
        return;
      }
    }
    nextLine(function(l){
      if(l!==null){run(typed+'\n'+l);return}
      var op=hj.open,L=typed.split('\n'); /* ^D: */
      if(CSH){typeLine(op.word+': << terminator not found','err');queue(function(){STATUS=1});nextPrompt();return} /* csh: bferr, and none of the line runs */
      if(bashy())typeLine('bash: warning: here-document at line '+(SHLINE-(L.length-1-op.line))+" delimited by end-of-file (wanted `"+op.word+"')",'err');
      run(hereJoin(L,{eof:function(){}}).lines.join('\n')); /* bash and V7: the body ends there, and the line runs */
    },CSH?'':'> ');
    return;
  }
  if(hj&&hj.n){typed=hj.lines.join('\n');raw=PROFILE.bash?dollarParen(typed):typed}
  var oq=openQuote(raw);
  if(!oq&&splitCmds(raw).semi){synSay(syntaxError(';'));nextPrompt();return} /* bash: echo a & ; echo b */
  if(oq&&CSH){typeLine('Unmatched '+oq+'.','err');nextPrompt();return} /* csh reads no further line for it */
  if(oq){ /* sh and bash: the quoted text goes on on the next line */
    nextLine(function(l){
      if(l!==null)run(typed+'\n'+l);
      else if(DASH){synSay('unexpected EOF while looking for matching');nextPrompt()} /* dash says so, and reads on */
      else if(PROFILE.bash){typeLine("bash: unexpected EOF while looking for matching `"+oq+"'",'err');queue(function(){STATUS=2});run('exit')} /* bash 5.2 says only that, and the end of input ends the shell, as ^D does at the prompt */
      else run(typed+'\n'+oq); /* V7: the end of input ends the quoted word, and the line runs */
    });
    return;
  }
  function more(sep){nextLine(function(l){if(l===null){synSay(syntaxError('end'));nextPrompt()}else run(typed+sep+l)})} /* the rest is on the next line */
  if(!CSH&&/(\||&&)\s*$/.test(raw.replace(/\\[\s\S]/g,'x').replace(/'[^']*'|"(?:[^"\\]|\\.)*"|`[^`]*`/g,'q').replace(/(^|\s)#.*$/,''))){more(' ');return} /* echo x | */
  if(groupOpen(raw)){more('\n');return} /* { echo a; and the } still to come */
  if(bashy()&&arrOpen(raw)){more('\n');return} /* arr=( and its ) still to come */
  var bad=synCheck([typed]);
  if(bad){bad.msgs.forEach(synSay);nextPrompt();return} /* echo x; echo (a): the shell reads the whole line first, so none of it runs */
  if(compound(raw)){
    queue(function(){runCompound([raw])});
    nextPrompt(function(){LOOP=null});
    return;
  }
  /* commands separated by ; run in turn; an alias may expand to several (alias cl='clear ; ls') */
  var segs=[],used=AUSED=[];
  splitCmds(raw).forEach(function(seg){segs=segs.concat(splitCmds(expand(seg)))});AUSED=null;
  var busy=function(d){if(used.length)queue(function(){used.forEach(function(k){if(d>0)ABUSY[k]=(ABUSY[k]||0)+1;else if(!--ABUSY[k])delete ABUSY[k]})},d<0?2:false)}; /* as unaliased() */
  if(segs.some(function(x){return /[|<>*?\[$&\\#"'=`]/.test(x)||!PROFILE.noUnix&&/[()]/.test(x)||CSH&&/^\s*if\(/.test(x)||groups()&&/^\s*\{\s/.test(x)||PROFILE.bash&&/^\s*(!|time)(\s|$)/.test(x)||(PROFILE.bash||CSH)&&/[{~]/.test(x)})){ /* needs the shell's parser */
    busy(1);segs.forEach(function(x){if(x.trim())execSeg(x)});busy(-1);
    nextPrompt();
    return;
  }
  segs.forEach(function(x){queue(function(){if(!LOGOUT&&LOOP!=='abort'&&LOOP!=='exit')fgProc({text:x},function(){runOne(x);queue(function(){PIPEST=[STATUS]})})})});
  nextPrompt();
}

/* ---------- login (after exit/logout) ---------- */
function accounts(){ /* the names /etc/passwd and /etc/group have, where the machine has them */
  var A=new Set();
  ['/etc/passwd','/etc/group'].forEach(function(p){colonRows(p).forEach(function(r){if(r[0])A.add(r[0].toLowerCase())})});
  return A;
}
function login(name){
  var n=name.trim().toLowerCase();
  if(!n){prompt(PROFILE.loginPrompt,'login');return}
  var usr=find(PROFILE.homes);
  if(PROFILE.backdoor&&n===PROFILE.backdoor){setRoot(false);ST.login=now();welcome();prompt();return}
  PENDROOT=n===PROFILE.rootName&&PROFILE.rootPassword?{name:n,word:PROFILE.rootPassword}:n===PROFILE.alsoRoot?{name:n,word:PROFILE.alsoRootWord}:null;
  if(PENDROOT||(PROFILE.closedDoor&&n!==ST.user&&n!==PROFILE.user)||n===PROFILE.rootName||n===OWNER||!LOGIN_NAME.test(n)||(n!==ST.user&&usr&&usr.kids[n])||n!==ST.user&&n!==PROFILE.user&&accounts().has(n)){prompt('Password:','password');return} /* the system's own accounts (bin, daemon): their password is one no typing gives (*), so login says Login incorrect */
  var h=!PROFILE.home&&usr&&usr.kids[ST.user]; /* the home folder follows whoever logs in */
  if(h&&n!==ST.user){ /* and what was the last login's in it is the new one's; the site owner's files stay theirs */
    delete usr.kids[ST.user];h.name=n;usr.kids[n]=h;
    var old=ST.user,seen=new Set();
    (function walk(d){if(seen.has(d))return;seen.add(d);if(d.owner===old)d.owner=n;if(d.group===old)d.group=n;if(d.type==='d')Object.keys(d.kids).forEach(function(k){if(d.kids[k].parent===d)walk(d.kids[k])})})(h); /* only what is in it: not what a link in it names */
  }
  ST.user=n;ST.home=PROFILE.home||PROFILE.homes+'/'+n;ST.cwd=ST.home;ST.login=now();
  welcome();prompt();
}

/* ---------- input ---------- */
function shownBuf(){return MODE==='password'||HIDE?'':TELE.on?ttEcho(buf,ttCol(bufNode)):UP(buf)} /* the line being typed, as the screen shows it */
function ttCol(n){ /* the teletype's column where node n starts: what is printed before it on its line */
  var s='';for(n=n&&n.previousSibling;n;n=n.previousSibling)s=n.textContent+s;
  return s.length-s.lastIndexOf('\n')-1;
}
function renderBuf(){ /* the cursor sits where the caret is: arrows back along the line move it, and typing goes in there */
  if(!bufNode)return;
  var t=shownBuf(),at=t.length;
  if(!TELE.on&&t.length===buf.length&&kb.value===buf)at=Math.min(kb.selectionDirection==='backward'?kb.selectionStart:kb.selectionEnd,t.length);
  bufNode.data=t.slice(0,at);bufTail.data=t.slice(at);cursor.classList.toggle('mid',at<t.length);scrollBottom();
}
function zEcho(){ /* ^Z at a read the shell does: the tty echoes it where the typing is and throws away what was typed (n_tty's isig flushes the line); the read goes on */
  if(!bufNode||!bufNode.parentNode){atCursor('^Z');return}
  bufNode.parentNode.insertBefore(document.createTextNode(shownBuf()+'^Z'),bufNode);setBuf('');
}
function setBuf(v){
  buf=v.replace(/[\r\n]/g,'').slice(0,!PROFILE.bash?255:MODE==='shell'&&!DASH?Infinity:4095); /* a line the tty holds: 255 characters on the old systems; Linux's
    N_TTY keeps 4095, and bash's prompt (readline, not the tty's line) takes any length */
  if(kb.value!==buf)kb.value=buf;
  if(TELE.on&&kb.selectionStart!==buf.length)kb.setSelectionRange(buf.length,buf.length); /* paper has no going back along the line: the caret stays at its end */
  renderBuf();
}
function leavePrompt(){if(bufNode){bufNode.data+=bufTail.data;bufTail.data='';cursor.classList.remove('mid')}bufNode=null;setBuf('');term.classList.remove('idle')}
function finishRead(v){var r=READ;READ=null;leavePrompt();r(v)}
function resumeHeld(){if(held){var h=held;held=null;h()}}
function submit(){
  try{enter()}
  catch(e){if(!tooDeep(e))throw e;deepSay();nextPrompt()}
}
function enter(){
  if(TELE.on){if(TELE.echo){ttReturn();TELE.free=Date.now()+TT_NL}}else click(1,700); /* the echo of RETURN: CR LF, and the carriage's time (none with -echo) */
  if(!bufNode)return; /* no prompt up yet: output is still typing */
  var line=TELE.on&&!TELE.echo&&(MODE==='shell'||MODE==='read')?bufNode.parentNode:null; /* -echo: no CR LF either, so what comes next goes on after the prompt */
  var cmd=TELE.on?ttCanon(buf):buf,typed=buf;leavePrompt(); /* the teletype's line as V7's canon() hands it over */
  if(line&&line===out.lastElementChild)OPEN=JOIN=line;
  if(TELE.on&&MODE==='login')ttGetty(); /* getty's modes again: a name in capitals (all an ASR-33 has) sets LCASE */
  if(MODE==='read'){var r=READ;READ=null;r(cmd);return}
  if(MODE==='login'){login(cmd);return}
  if(MODE==='password'&&PENDROOT&&(PROFILE.caseless?cmd.toLowerCase()===PENDROOT.word.toLowerCase():cmd===PENDROOT.word)){ /* case counts where the machine's does */
    var who=PENDROOT.name;
    PENDROOT=null;setRoot(false);ST.user=who;ST.login=now();welcome();prompt();
    return;
  }
  if(MODE==='password'){PENDROOT=null;pause(1400);typeLine(PROFILE.loginFailed);prompt(PROFILE.loginPrompt,'login');return}
  if((CSH||bashy())&&/!/.test(cmd)){ /* !! the last command, !n that one, !word the last that began so */
    var bad=null,had=cmd;
    cmd=cmd.replace(/!(!|\$|-\d+|\d+|[a-zA-Z]\w*)/g,function(m,x,at,s){
      if(PROFILE.bash&&((s.slice(0,at).match(/'/g)||[]).length%2||s.slice(at-2,at)==='${'))return m; /* bash leaves '...' alone, and ${!x[@]} */
      if(s.charAt(at-1)==='\\')return m; /* \! is no history: csh's alias x 'cmd \!$' */
      var last=hist[hist.length-1];
      var v=x==='!'?last:x==='$'?(last===undefined?undefined:last.trim().split(/\s+/).pop()):/^-/.test(x)?hist[hist.length+(+x)]:/^\d/.test(x)?hist[+x-1]:hist.slice().reverse().filter(function(h){return h.indexOf(x)===0})[0];
      if(v===undefined){bad=PROFILE.bash?'bash: '+m+': event not found':x+': Event not found.';return ''}
      return v;
    });
    if(bad){typeLine(bad,'err');prompt();return}
    if(cmd!==had)typeLine(cmd);
  }
  if(cmd.trim()){hist.push(cmd);if(hist.length>HMAX)hist.shift();if(TELE.on){TH.l.push(typed);if(TH.l.length>HMAX)TH.l.shift()}} /* the teletype's arrows give back the line as it was typed on it */
  hi=hist.length;TH.i=TH.l.length;
  SHLINE++;run(cmd);
}
/* TOPS-20's EXEC: the machine's PH.recognize(key,line) answers Escape, Tab and ? at the prompt with the new line,
   or with {echo,list,line}: what stays on this line, the lines printed under it, and the line asked again */
function recognize(k){
  if(!PH.recognize||!bufNode||MODE!=='shell')return false;
  var r=PH.recognize(k,buf);
  if(r==null)return false;
  if(typeof r==='string'){setBuf(r);return true}
  setBuf(r.echo);relist(r.list,r.line);
  return true;
}
/* bash: tab completes a command name first, a file name after; a second tab lists the choices */
var TABBED=null;
function complete(){
  if(!bufNode||MODE!=='shell')return;
  var m=buf.match(/^(.*?)([^\s;|&<>]*)$/),pre=m[1],w=m[2],q=/^['"]/.test(w)?w.charAt(0):'';
  pre+=q;w=w.slice(q.length);
  var dir='',base=w,L=[],k=w.lastIndexOf('/'),d;
  function esc(n){return q?n:n.replace(/([\s'"\\$`;|&<>()])/g,'\\$1')} /* a name bash would have to quote */
  if(!q&&(!pre.trim()||/[;|&]\s*$/.test(pre))&&k<0){ /* a command: what has a program file, what help lists, and the aliases */
    var C={};
    Object.keys(PATHS).concat(HELP.map(function(h){return h[0]})).forEach(function(n){if(has(CMDS,n))C[n]=1});
    PH.aliases.forEach(function(a){C[a.from[0]]=1});
    L=Object.keys(C).filter(function(n){return n.indexOf(w)===0}).sort().map(function(n){return [n,' ']});
  }else{
    if(k>=0){dir=w.slice(0,k+1);base=w.slice(k+1)}
    d=find(dir.replace(/^(~|\$HOME)(?=\/|$)/,ST.home)||'.'); /* ~/ and $HOME/ look in the home folder; what was typed stays */
    if(d&&d.type==='d'&&!d.prot)L=Object.keys(d.kids).filter(function(n){return n.indexOf(PROFILE.fold(base))===0&&(n.charAt(0)!=='.'||base.charAt(0)==='.')}).sort()
      .map(function(n){return [n,d.kids[n].type==='d'?'/':q?q+' ':' ']});
  }
  if(!L.length)return;
  if(L.length===1){TABBED=null;setBuf(pre+dir+esc(L[0][0])+L[0][1]);return}
  var c=L[0][0];
  L.forEach(function(x){while(x[0].indexOf(c)!==0)c=c.slice(0,-1)});
  if(c.length>base.length){TABBED=null;setBuf(pre+dir+esc(c));return}
  if(TABBED!==buf){TABBED=buf;return} /* the first tab only rings the bell */
  relist(inColumns(L.map(function(x){return x[0]+(x[1]==='/'?'/':'')})),buf);
}
function relist(lines,line){ /* print lines under the prompt, then ask again with line typed in */
  leavePrompt();
  say(lines);
  queue(function(){showPrompt();setBuf(line)},true);
}
function histNav(d){
  if(TELE.on){if(TH.l.length){TH.i=Math.max(0,Math.min(TH.l.length,TH.i+d));setBuf(TH.l[TH.i]||'')}return}
  if(!hist.length)return;
  hi=Math.max(0,Math.min(hist.length,hi+d));
  setBuf(hist[hi]||'');
}
/* a full-screen program gets a phone keyboard's typing a key at a time. The keyboard composes each word in the input:
   it stays there until the word is done (emptied sooner, the keyboard types it all again), and the program gets what changed */
var fed='',keyed=null; /* what the program has had of the word; a key whose keydown already gave it */
function feedKb(done){
  var v=kb.value,i=0,j;
  if(done&&v===keyed&&!fed)v=''; /* a keyboard that inserts a key it has sent as a keydown */
  keyed=null;
  while(i<fed.length&&fed.charAt(i)===v.charAt(i))i++;
  for(j=fed.length;KEYS&&j>i;j--)KEYS('Backspace'); /* letters taken back, or a suggestion taken */
  for(;KEYS&&i<v.length;i++){var c=TELE.on?ttKey(v.charAt(i)):v.charAt(i);if(c)KEYS(c)} /* the teletype's keys, as its keyboard has them */
  fed=v;
  if(done||!KEYS){kb.value='';fed=''}
}
function kbInput(composing){
  if(KEYS){feedKb(!composing);return}
  fed='';
  var v=kb.value,grew=v.length>buf.length;
  if(TELE.on){ /* the teletype: no small letters, no backspace (erase is #), and typing only ever goes on at the end of the line */
    if(composing)return; /* a phone's keyboard still making up a word: its text is left alone until it is done */
    var gone=buf.length-v.length;
    v=gone>0&&buf.slice(0,v.length)===v?buf+TELE.erase.repeat(gone):v.slice(0,buf.length)===buf?buf+ttKeys(v.slice(buf.length)):buf;grew=v!==buf;
  }
  if(grew)strike(v.slice(-1));
  setBuf(v);
}
kb.addEventListener('input',function(e){SAFE_SPENT=SAFE_MS=0;kbInput(e.isComposing)});
document.addEventListener('keydown',function(){SAFE_SPENT=SAFE_MS=0},true); /* and so has each key (vi's, ed's lines) */
function strike(k){if(TELE.on)ttStrike(k);else click(k==='Backspace'?.556:.667)} /* the sound of a key typed at the prompt */
kb.addEventListener('compositionend',function(){if(KEYS)feedKb(true);else if(TELE.on)kbInput(false)});
['pointerup','keyup'].forEach(function(t){kb.addEventListener(t,function(){if(TELE.on&&!KEYS&&kb.selectionStart!==kb.value.length)kb.setSelectionRange(kb.value.length,kb.value.length);else if(!KEYS)renderBuf()})}); /* no caret back along the paper */
kb.addEventListener('keydown',function(){if(!KEYS&&!TELE.on)setTimeout(renderBuf,0)}); /* the caret moved by an arrow, Home or End (held down, too) */
function navKey(e){ /* Enter, the history arrows and scrollback paging, typed in either place */
  var k=e.key,d=k==='ArrowUp'||k==='PageUp'?-1:1;
  if(PROFILE.dos&&!PROFILE.dcl&&(k==='ArrowUp'||k==='ArrowDown'))return false; /* no history here, and no doskey yet */
  if(PROFILE.dos&&!PROFILE.dcl&&k==='F3'&&bufNode&&hist.length){e.preventDefault();setBuf(hist[hist.length-1]);return true} /* the only history there is */
  if(k==='Enter')submit();
  else if(k==='Tab'&&bashy()&&!e.shiftKey)complete();
  else if((k==='Escape'||k==='?'||k==='Tab'&&!e.shiftKey)&&recognize(k)){}
  else if(k==='ArrowUp'||k==='ArrowDown')histNav(d);
  else if(k==='PageUp'||k==='PageDown')term.scrollTop+=d*.9*term.clientHeight;
  else return false;
  e.preventDefault();
  return true;
}
function atCursor(s){var at=cursor.parentNode;if(at)at.insertBefore(document.createTextNode(s),cursor)} /* text just before the cursor, where it is */
function interrupt(){ /* ^C: stop whatever is typing and go back to the prompt */
  var q=PH.onInterrupt&&!(bufNode&&!READ&&MODE!=='shell')?PH.onInterrupt(!!(READ&&TRAP)):null; /* a machine's own QUIT (Multics): what it shows instead of ^C; true when a program takes the ^C itself */
  if(q&&typeof q==='object'){if(q.same&&(bufNode||GL.n)&&cursor.parentNode){JOIN=cursor.parentNode;JOIN.attnCut=true}q=q.says} /* {says, same}: what it shows, and no new line: the next read goes on in this one, at a read or in a line cut short as it typed (VM/370's TERMINAL ATTN OFF) */
  if(q!=null||!PH.echoCtl||PH.echoCtl())atCursor(q==null?'^C':q); /* PH.echoCtl: a machine whose tty may have echoctl off (Linux's -echoctl) echoes no ^C then */
  HOLD=false; /* and, as the tty did, undo a ^S: nothing waits for a ^Q that will not come */
  if(TELE.on&&buf){ /* V7's flushtty: what was typed ahead is thrown away; what the paper shows of it stays */
    if(bufNode&&bufNode.parentNode)bufNode.parentNode.insertBefore(document.createTextNode(shownBuf()),bufNode);
    setBuf('');
  }
  if(READ&&TRAP){finishRead(INT);return}
  if(bufNode&&!READ){ /* at a prompt: give up on this line */
    if(MODE!=='shell')return;
    leavePrompt();
    prompt();
    return;
  }
  if(FGJOB)signal(FGJOB,2,true); /* a job brought back with fg is the foreground's */
  GEN++;SINK=null;STDIN=null;STATUS=130;
  wakers.concat(FGP?FGP.wakers:[]).forEach(function(w){w()});
  resumeHeld();
  if(READ)finishRead(null);
}
function eof(){ /* ^D: end of input, or logout at an empty prompt */
  if(READ){finishRead((TELE.on?ttCanon(buf):buf)||null);return}
  if(bufNode&&MODE==='shell'&&!buf&&!PROFILE.dos){leavePrompt();run('exit')}
}
function ctrlKey(e){
  var k=(e.key||'').toLowerCase();
  if(k==='c'){if(String(window.getSelection&&getSelection()))return false;interrupt()}
  else if(k==='d')eof();
  else if(k==='z'&&PROFILE.dos)eof();
  else if(k==='z'&&control())tstp();
  else if(k==='s')HOLD=true;
  else if(k==='q'){HOLD=false;resumeHeld()}
  else if(k==='u')setBuf('');
  else return false;
  e.preventDefault();
  return true;
}
function teleKey(e){ /* the teletype's own keys: ^G rings its bell; RUB OUT (Delete) is V7's interrupt; after a ^S any key starts the output again */
  var k=(e.key||'').toLowerCase();
  if(e.metaKey||e.altKey)return false;
  if(e.ctrlKey&&k==='g'){e.preventDefault();setBuf(buf+'\u0007');ttBell();return true} /* BEL goes into the line, and its echo rings */
  if(!e.ctrlKey&&e.target===kb&&/^(arrowleft|arrowright|home|end)$/.test(k)){e.preventDefault();return true} /* the carriage only goes on along the line */
  if(!e.ctrlKey&&k==='delete'&&!KEYS){e.preventDefault();interrupt();return true}
  if(HOLD&&!(e.ctrlKey&&(k==='s'||k==='q'))&&(k.length===1||k==='enter')){HOLD=false;resumeHeld()}
  return false;
}
var NAMED=/^(Escape|Enter|Backspace|Tab|ArrowUp|ArrowDown|ArrowLeft|ArrowRight|PageUp|PageDown)$/;
document.addEventListener('keydown',function(e){
  keyed=null;
  if(KEYS){ /* a full-screen program has every key */
    if(e.metaKey||e.altKey||e.isComposing)return;
    if(e.ctrlKey&&(e.key||'').toLowerCase()==='z'&&tstp()){e.preventDefault();return} /* but ^Z, where there is job control: the tty's SIGTSTP */
    var name=e.ctrlKey&&e.key.length===1?'C-'+e.key.toLowerCase():e.key;
    if(TELE.on&&name==='Delete'&&!e.ctrlKey)name='C-c'; /* RUB OUT: V7's interrupt character */
    if(TELE.on&&name.length===1&&!(name=ttKey(name))){e.preventDefault();return} /* a key the teletype does not have */
    if(name.length===1||NAMED.test(name)||/^C-/.test(name)){e.preventDefault();if(name.length===1)keyed=name;KEYS(name)}
    return;
  }
  if(TELE.on&&teleKey(e))return;
  if(e.ctrlKey&&!e.metaKey&&!e.altKey&&ctrlKey(e))return;
  if(e.ctrlKey||e.metaKey||e.altKey)return;
  if(e.target===kb){if(!e.isComposing)navKey(e);return}
  if(e.key==='Enter'&&e.target.closest&&e.target.closest('a'))return; /* Enter on a focused link opens it */
  var k=e.key;
  if(k!=='Tab'&&navKey(e)){if(k==='PageUp'||k==='PageDown')return} /* Tab off the input moves focus, as it should */ /* paging keeps focus where it is, on a link say */
  else if(k==='Backspace'||k&&k.length===1){
    e.preventDefault();
    if(TELE.on)k=k==='Backspace'?TELE.erase:ttKey(k); /* no backspace key: V7's erase character */
    if(k){setBuf(k==='Backspace'?buf.slice(0,-1):buf+k);strike(k)}
  }
  else return;
  if(!coarse)kb.focus({preventScroll:true});
});

/* a phone has no escape or control keys, and vi and DOS need them: a small row of them on the glass */
if(coarse){
  var soft=document.createElement('div');soft.id='softkeys';soft.setAttribute('aria-label','Keys a phone does not have');
  [['esc','Escape'],['^C','c'],['^D','d'],['^Z','z'],['tab','Tab']].forEach(function(b){
    var t=document.createElement('button');t.type='button';t.textContent=b[0];
    t.addEventListener('click',function(e){
      e.stopPropagation();
      var named=b[1].length>1;
      if(KEYS){if(!(b[1]==='z'&&tstp()))KEYS(named?b[1]:'C-'+b[1])}
      else if(!named)ctrlKey({key:b[1],preventDefault:function(){}});
      else if(b[1]==='Tab'&&bashy())complete();
      else recognize(b[1]);
      kb.focus({preventScroll:true});
    });
    soft.appendChild(t);
  });
  $('#screen').appendChild(soft);
}

/* tap-to-type: focus on click (not pointerdown), refocus once if the OS bounces it */
var lastTap=0,bounced=false;
$('#stage').addEventListener('click',function(e){
  if(e.target.closest('a'))return;
  lastTap=Date.now();bounced=false;
  kb.focus({preventScroll:true});
});
kb.addEventListener('blur',function(){
  if(!bounced&&Date.now()-lastTap<700){bounced=true;setTimeout(function(){kb.focus({preventScroll:true})},0)}
});
kb.addEventListener('focus',function(){ /* the keyboard slides in over about a third of a second, and the browser may scroll on the way */
  [60,250,500].forEach(function(t){setTimeout(fitViewport,t)});
});

/* ---------- cable ---------- */
var NS='http://www.w3.org/2000/svg';
function path(d,stroke,w){
  var p=document.createElementNS(NS,'path');
  p.setAttribute('d',d);p.setAttribute('fill','none');p.setAttribute('stroke',stroke);
  p.setAttribute('stroke-width',w);p.setAttribute('stroke-linecap','round');p.setAttribute('stroke-linejoin','round');
  return p;
}
/* cord settings come from site/config.js */
var CORD=PROFILE.cord,rx=CORD.width/2,sw=CORD.thickness,edge=sw+1.4,gap=CORD.gap,tilt=.35;
var pitch=edge+gap;                        /* drop per turn = cord + rim + gap. gap 0 = turns touching */
var narrow=matchMedia('(max-width:640px)'); /* a phone: the cable sits under the monitor in a fixed height */
var turns,coilLen;
function coilFor(){ /* "cord desktop" turns on a wide screen, "cord turns" on a phone */
  turns=Math.max(1,Math.round(!narrow.matches&&CORD.desktop?CORD.desktop:CORD.turns));
  coilLen=2*tilt*rx+(turns+.5)*pitch;
}
coilFor();
var lastW,lastH,lastNub; /* what the cable was last drawn for */
function drawCable(){
  var t=turns;coilFor();if(turns!==t)lastW=null; /* crossing the phone width changes the coil */
  var nub=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nub'))||11; /* strain-relief bottom */
  /* cable height = nub + straight + coil + straight, so the two straights are always equal */
  var want=Math.round(nub+2*CORD.straight+coilLen); /* phone cable height; desktop fills the gap below the monitor */
  document.documentElement.style.setProperty('--cable',want+'px');
  var r=svg.getBoundingClientRect(),W=r.width,H=r.height;
  if(!W||!H){W=960;H=want} /* never bail: hidden/pre-layout still gets a cable */
  if(W===lastW&&H===lastH&&nub===lastNub)return; /* the drawing depends only on these */
  lastW=W;lastH=H;lastNub=nub;
  svg.setAttribute('viewBox','0 0 '+W+' '+H);
  var cx=W/2,TAU=Math.PI*2;
  var lead=Math.max(0,(H-nub-coilLen)/2);
  var y0=nub+lead+tilt*rx,steps=40,N=turns*steps+steps/2;
  function f(v){return v.toFixed(2)}
  var pts=[],ay=0;
  for(var i=0;i<=N;i++){
    var t=Math.PI+i/steps*TAU;
    if(i)ay+=pitch/steps;
    pts.push([cx+rx*Math.sin(t),y0+ay+tilt*rx*Math.cos(t),Math.cos(t)>=0]);
  }
  var segs=[],cur=null;
  pts.forEach(function(q){
    if(!cur||cur.front!==q[2]){var prev=cur&&cur.p[cur.p.length-1];cur={front:q[2],p:prev?[prev]:[]};segs.push(cur)}
    cur.p.push(q);
  });
  function d(a){return 'M'+a.map(function(p){return f(p[0])+' '+f(p[1])}).join('L')}
  var e=pts[pts.length-1];
  var cord='M'+f(cx)+' -8L'+f(cx)+' '+f(pts[0][1]);
  /* coil hangs centered in whatever height the cable has, so the straight runs above and below
     stay equal; on desktop that height is the gap from the bezel to the bottom of the window */
  var drop=H+12-e[1];
  var tail='M'+f(e[0])+' '+f(e[1])+'C'+f(e[0])+' '+f(e[1]+drop*.45)+' '+f(cx+6)+' '+f(e[1]+drop*.7)+' '+f(cx+5)+' '+f(H+12);

  var E='#232723',C='#141715';
  function pair(dd,rim,rimW,core){sway.appendChild(path(dd,rim,rimW));sway.appendChild(path(dd,core,sw))} /* rim, then the core over it */
  sway.textContent='';
  segs.forEach(function(sg){if(!sg.front)pair(d(sg.p),'#1a1d1b',sw+1,'#0e100f')});
  pair(cord,E,edge,C);
  segs.forEach(function(sg){if(sg.front)pair(d(sg.p),'#2b302c',edge,C)});
  pair(tail,E,edge,C);
  /* idle sway at the coil bottom (cord sway setting), pivoting at the strain relief */
  svg.style.setProperty('--sa',(Math.atan(CORD.sway/Math.max(e[1],40))*180/Math.PI).toFixed(3)+'deg');
}
var raf=0;
function redraw(){cancelAnimationFrame(raf);raf=requestAnimationFrame(drawCable)}

/* visible height -> --app-h. On phones the soft keyboard shrinks the visual viewport but not
   100dvh, so without this the bottom of the monitor would sit behind the keyboard. */
var vv=window.visualViewport,lastVH=-1;
function fitViewport(){
  var h=Math.round(vv?vv.height*(vv.scale||1):window.innerHeight); /* *scale: pinch-zoom must not shrink the rig */
  if(vv&&vv.offsetTop)window.scrollTo(0,0);
  if(h===lastVH){shortGlass();return}
  lastVH=h;
  var atEnd=term.scrollHeight-term.scrollTop-term.clientHeight<40; /* at the prompt, not reading back */
  if(h>0)document.documentElement.style.setProperty('--app-h',h+'px');
  shortGlass();
  if(atEnd)term.scrollTop=term.scrollHeight; /* keep the prompt in view as the glass resizes; leave a reader where they are */
  redraw();
}
function shortGlass(){ /* a phone whose keyboard leaves too little height for the glass and its cable: html.short puts the cable away */
  var r=document.documentElement,b=$('#bezel');
  r.classList.remove('short');
  if(b&&narrow.matches&&b.getBoundingClientRect().top<0)r.classList.add('short');
}
fitViewport();
if(vv){vv.addEventListener('resize',fitViewport);vv.addEventListener('scroll',function(){if(vv.offsetTop)fitViewport()})}
window.addEventListener('resize',fitViewport);
window.addEventListener('orientationchange',function(){setTimeout(fitViewport,250)});
drawCable();
window.addEventListener('load',redraw);
if(window.ResizeObserver)new ResizeObserver(redraw).observe(svg);

/* ---------- boot ---------- */
function problems(){ /* content mistakes, shown on the glass so they get fixed */
  var bad=notLoaded(),L=bad.map(function(f){return 'did not load: '+f}).concat(PROFILE.problems);
  if(!PH.texts.length)L.push('no content loaded: check the script tags in index.html');
  if(!L.length)return;
  L.forEach(function(m){console.warn('phosphor: '+m);typeLine('! '+m,'warn',null,{speed:.3})});
  if(bad.length)typeLine('(is the file there? a stray ` or ${ inside one also stops it loading.)','warn',null,{speed:.3});
  typeLine('');
}
function boot(){
  setTimeout(function(){$('#crt').classList.add('lit')},1300);
  requestAnimationFrame(function(){setTimeout(fxDetect)}); /* after the first frame, during the warm-up */
  if(!coarse)kb.focus({preventScroll:true});
  pause(900); /* tube warm-up */
  problems();
  banner();
  (PROFILE.raw.boot||[]).forEach(function(raw){ /* the machine coming up: "text @ms" waits after the line */
    var m=raw.match(/^(.*?)\s*@(\d+)$/),t=m?m[1]:raw;
    typeLine(t.replace(/^~\s?/,''),/^~/.test(t)?'dim':'',null,{speed:.12});
    if(m)pause(+m[2]);
  });
  CLASH.forEach(clashSay);queue(function(){STATUS=0}); /* the visitor's folders the site's new files have taken the place of */
  if(!PROFILE.noLogin){
    typeLine(ST.user,'',null,{pre:PROFILE.loginPrompt,hold:700,speed:2.2}); /* first visit: auto-login as guest */
    pause(450);
  }
  welcome();
  prompt();
}
function banner(){ /* terminal self-test from the machine's == banner == section; replayed after exit */
  if(TELE.on)return; /* a teletype has no self-test to type */
  var R=PROFILE.raw.banner||[],B=PROFILE.sec.banner||[];
  R.forEach(function(raw,i){ /* LABEL | VALUE | pause-ms  prints a dotted self-test row */
    var f=raw.split('|').map(function(x){return x.trim()}),ms=0,line;
    if(f.length>=2){line=[row(UP(f[0]),UP(f[1])),''];ms=parseInt(f[2],10)||0}
    else line=lineOf(B[i]);
    typeLine(line[0],line[1],null,{speed:.5});
    if(ms)pause(ms);
  });
  if(R.length)typeLine('');
}
function welcome(){
  say(PROFILE.welcome);
  if(PROFILE.mail.length&&!RP&&PROFILE.mailNotice)typeLine(PROFILE.mailNotice); /* the letter is the guest's, not root's; a machine that says it itself (Multics) empties the notice */
  if(coarse)typeLine('(tap the screen for a keyboard.)','dim');
}
boot();
}
})();
