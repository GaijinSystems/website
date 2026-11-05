/* PHOSPHOR-9 terminal: machine "vms-1988", STARTREK. Ported to JavaScript for this terminal from SST2K 2.10, the
   program "sst" of https://gitlab.com/esr/super-star-trek, itself descended from Tom Almy's C and the UT FORTRAN. This
   file is that program translated statement by statement, by a tool, with its comments; the $ helpers give Python's
   behaviour for arithmetic, indexing and formatting, so that its numbers and its text come out the same. A 1988 VMS
   site had the DECUS Fortran, whose source was not found; SST2K has its behaviour, as its documentation describes.

   sst.py -- Super Star Trek 2K

   SST2K is a Python translation of a C translation of a FORTRAN
   original dating back to 1973.  Beautiful Python it is not, but it
   works.  Translation by Eric S. Raymond; original game by David Matuszek
   and Paul Reynolds, with modifications by Don Smith, Tom Almy,
   Stas Sergeev, and Eric S. Raymond.

   SPDX-FileCopyrightText: (C) Eric S. Raymond <esr@thyrsus.com>
   SPDX-License-Identifier: BSD-2-Clause

   			BSD LICENSE

   The SST2K code is Copyright (c) 2006 by Eric Raymond. All rights reserved.

   Redistribution and use in source and binary forms, with or without
   modification, are permitted provided that the following conditions
   are met:

   Redistributions of source code must retain the above copyright
   notice, this list of conditions and the following disclaimer.

   Redistributions in binary form must reproduce the above copyright
   notice, this list of conditions and the following disclaimer in the
   documentation and/or other materials provided with the distribution.

   Neither the name of the SST2K project nor the names of its contributors
   may be used to endorse or promote products derived from this software
   without specific prior written permission.

   THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
   ``AS IS'' AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
   LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
   A PARTICULAR PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL THE REGENTS OR
   CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
   EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
   PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
   PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
   LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
   NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
   SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

   --------------------------------------------------------------------------

   Note: Nothing in this license grants or purports to grant any rights
   with respect to the trademarks, copyrights or other property of the
   originators of Star Trek or their successors in interest.  We
   recognize and support their right under the Berne Convention to
   recover damages for any uses of this program which compromise their
   legitimate interest in protecting their copyrights and trademarks or
   unjustly enrich others.


   Differences from the source: only its teletype interface (-t) is here, since the screen form needs curses; no
   replay, input log or command-line options; saved games are a checked JSON record in this browser's storage instead
   of a checked pickle, and the plaque is a file on this machine; slow text ("prouts") comes at the terminal's own line
   speed; the help file is made from doc/sst-doc.xml directly, so its words are the same but its lines break elsewhere;
   the wayback default is the machine's year, as the source's is the computer's; a course so huge that the source would
   reflect off the galaxy's edge for ever waits for a key and ends the game instead of spinning. Star Trek names belong to their owners.
*/
(function(P){
'use strict';
/* ---------- What Python gives the source for free ---------- */
class ValueError extends Error{}
class IndexError extends Error{}
class KeyError extends Error{}
class ZeroDivisionError extends Error{}
class SystemExit extends Error{}
class KeyboardInterrupt extends Error{}
class TrekError extends Error{}
class JumpOut extends Error{}
function $t(x){
  if(x==null)return false;
  if(Array.isArray(x))return x.length>0;
  if(x instanceof Map)return x.size>0;
  return !!x;
}
function $num(x){return typeof x==='number'||typeof x==='boolean'}
function $add(a,b){
  if($num(a)&&$num(b))return +a + +b;
  if(typeof a==='string'&&typeof b==='string')return a+b;
  if(Array.isArray(a)&&Array.isArray(b))return a.concat(b);
  if(a&&a.__add__)return a.__add__(b);
  throw new TypeError('unsupported operand for +');
}
function $sub(a,b){
  if($num(a)&&$num(b))return a-b;
  if(a&&a.__sub__)return a.__sub__(b);
  throw new TypeError('unsupported operand for -');
}
function $mul(a,b){
  if($num(a)&&$num(b))return a*b;
  if(typeof a==='string'&&$num(b))return b>0?a.repeat(b):'';
  if(typeof b==='string'&&$num(a))return a>0?b.repeat(a):'';
  if(Array.isArray(a)&&$num(b)){var R=[];for(var i=0;i<b;i++)R=R.concat(a);return R}
  if(a&&a.__mul__)return a.__mul__(b);
  if(b&&b.__rmul__)return b.__rmul__(a);
  throw new TypeError('unsupported operand for *');
}
function $div(a,b){
  if($num(a)&&$num(b)){if(+b===0)throw new ZeroDivisionError('division by zero');return a/b}
  if(a&&a.__truediv__)return a.__truediv__(b);
  if(b&&b.__rtruediv__)return b.__rtruediv__(a);
  throw new TypeError('unsupported operand for /');
}
function $fdiv(a,b){
  if($num(a)&&$num(b)){if(+b===0)throw new ZeroDivisionError('division by zero');return Math.floor(a/b)}
  if(a&&a.__floordiv__)return a.__floordiv__(b);
  throw new TypeError('unsupported operand for //');
}
function $mod(a,b){
  if(typeof a==='string')return $fmt(a,b);
  if($num(a)&&$num(b)){
    if(+b===0)throw new ZeroDivisionError('modulo by zero');
    var r=a%b;
    if(r&&(r<0)!==(b<0))r+= +b;
    return r;
  }
  if(a&&a.__mod__)return a.__mod__(b);
  throw new TypeError('unsupported operand for %');
}
function $pow(a,b){
  if(!$num(a)||!$num(b))throw new TypeError('unsupported operand for **');
  return b===2?a*a:Math.pow(a,b);
}
function $log(x){if(x<=0)throw new ValueError('math domain error');return Math.log(x)}
function $eq(a,b){
  if(a===b)return true;
  if(a==null||b==null)return a==b;
  if($num(a)&&$num(b))return +a===+b;
  if(a.__eq__)return a.__eq__(b);
  if(b.__eq__)return b.__eq__(a);
  if(Array.isArray(a)&&Array.isArray(b))return a.length===b.length&&a.every(function(x,i){return $eq(x,b[i])});
  return false;
}
function $ne(a,b){
  if(a!=null&&a.__ne__)return a.__ne__(b);
  return !$eq(a,b);
}
function $in(x,c){
  if(typeof c==='string'){if(typeof x!=='string')throw new TypeError('in <string> needs a string');return c.indexOf(x)>=0}
  if(c instanceof Map)return c.has(x);
  if(c==null)throw new TypeError('not iterable');
  for(var e of c)if($eq(e,x))return true;
  return false;
}
function $iter(x){
  if(x==null)throw new TypeError('not iterable');
  return x instanceof Map?Array.from(x.keys()):x;
}
function $list(x){return Array.from($iter(x))}
function $range(a,b,s){
  if(b===undefined){b=a;a=0}
  var r=[],st=s||1;
  if(st>0)for(var i=a;i<b;i+=st)r.push(i);else for(var j=a;j>b;j+=st)r.push(j);
  return r;
}
function $len(x){
  if(typeof x==='string'||Array.isArray(x))return x.length;
  if(x instanceof Map)return x.size;
  throw new TypeError('object has no len()');
}
function $g(a,k){
  if(a instanceof Map){if(!a.has(k))throw new KeyError(String(k));return a.get(k)}
  if(a==null)throw new TypeError('not subscriptable');
  if(!Number.isInteger(+k)||k===null)throw new TypeError('indices must be integers');
  k=+k;
  var n=a.length;
  if(k<0)k+=n;
  if(k<0||k>=n)throw new IndexError('index out of range');
  return a[k];
}
function $s(a,k,v){
  if(a instanceof Map){a.set(k,v);return}
  if(a==null)throw new TypeError('not subscriptable');
  if(!Number.isInteger(+k)||k===null)throw new TypeError('indices must be integers');
  k=+k;
  var n=a.length;
  if(k<0)k+=n;
  if(k<0||k>=n)throw new IndexError('assignment index out of range');
  a[k]=v;
}
function $slice(a,i,j){return a.slice(i,j)}
function $rev(a){return typeof a==='string'?a.split('').reverse().join(''):a.slice().reverse()}
function $int(x){
  if(x==null)throw new TypeError('int() argument');
  if(typeof x==='string'){
    if(!/^\s*[-+]?\d+(_\d+)*\s*$/.test(x))throw new ValueError('invalid literal for int()');
    return parseInt(x.replace(/_/g,''),10);
  }
  if(typeof x==='boolean')return +x;
  if(!Number.isFinite(x))throw new ValueError('cannot convert float to integer');
  return Math.trunc(x)+0;
}
function $float(s){
  if(typeof s==='number')return s;
  var t=s.trim().toLowerCase();
  var m=/^([-+]?)(?:inf|infinity)$/.exec(t);
  if(m)return m[1]==='-'?-Infinity:Infinity;
  if(/^[-+]?nan$/.test(t))return NaN;
  if(!/^[-+]?(\d+(_\d+)*\.?(\d+(_\d+)*)?|\.\d+(_\d+)*)(e[-+]?\d+(_\d+)*)?$/.test(t))throw new ValueError('could not convert string to float');
  return Number(t.replace(/_/g,''));
}
function $round(x){ /* to the nearest even, as Python 3's does */
  if(x==null)throw new TypeError('round() argument');
  if(!Number.isFinite(+x))throw new ValueError('cannot round');
  x=+x;
  var f=Math.floor(x),d=x-f;
  if(d<0.5)return f+0;
  if(d>0.5)return f+1;
  return (f%2===0?f:f+1)+0;
}
function $abs(x){if(!$num(x))throw new TypeError('bad operand for abs()');return Math.abs(x)}
function $min(){
  var L=arguments.length===1?$list(arguments[0]):Array.from(arguments);
  if(!L.length)throw new ValueError('min() arg is empty');
  var b=L[0];
  for(var i=1;i<L.length;i++)if(L[i]<b)b=L[i];
  return b;
}
function $max(){
  var L=arguments.length===1?$list(arguments[0]):Array.from(arguments);
  if(!L.length)throw new ValueError('max() arg is empty');
  var b=L[0];
  for(var i=1;i<L.length;i++)if(L[i]>b)b=L[i];
  return b;
}
function $minby(L,k){L=$list(L);if(!L.length)throw new ValueError('min() arg is empty');var b=L[0],bk=k(b);for(var i=1;i<L.length;i++){var v=k(L[i]);if(v<bk){b=L[i];bk=v}}return b}
function $maxby(L,k){L=$list(L);if(!L.length)throw new ValueError('max() arg is empty');var b=L[0],bk=k(b);for(var i=1;i<L.length;i++){var v=k(L[i]);if(v>bk){b=L[i];bk=v}}return b}
function $chr(n){return String.fromCharCode(n)}
function $ord(s){if(typeof s!=='string'||s.length!==1)throw new TypeError('ord() expected a character');return s.charCodeAt(0)}
function $any(x){for(var e of x)if($t(e))return true;return false}
function $all(x){for(var e of x)if(!$t(e))return false;return true}
function $enumerate(x){var r=[],i=0;for(var e of $iter(x))r.push([i++,e]);return r}
function filter(f,L){return Array.from(L).filter(f)}
function $items(m){return Array.from(m.entries())}
function $keys(m){return Array.from(m.keys())}
function $values(m){return Array.from(m.values())}
function $get(m,k,d){return m.has(k)?m.get(k):(d===undefined?null:d)}
function $pop(a,i){
  if(!a.length)throw new IndexError('pop from empty list');
  if(i===undefined)return a.pop();
  return a.splice(i,1)[0];
}
function $remove(a,x){var i=$index(a,x);a.splice(i,1)}
function $index(a,x){for(var i=0;i<a.length;i++)if($eq(a[i],x))return i;throw new ValueError('not in list')}
function $sort(a,key,rev){
  var k=key||function(x){return x};
  a.sort(function(x,y){var p=k(x),q=k(y),c=p<q?-1:p>q?1:0;return rev?-c:c});
}
function $startswith(s,p){if(typeof p!=='string'||typeof s!=='string')throw new TypeError('startswith');return s.startsWith(p)}
function $strip(s){return s.trim()}
function $lstrip(s){return s.trimStart()}
function $rstrip(s,ch){
  if(ch===undefined)return s.trimEnd();
  var e=s.length;
  while(e>0&&ch.indexOf(s.charAt(e-1))>=0)e--;
  return s.slice(0,e);
}
function $split(s){var t=s.trim();return t?t.split(/\s+/):[]}
function $copy(o){
  if(Array.isArray(o))return o.slice();
  if(o==null||typeof o!=='object')return o;
  return Object.assign(Object.create(Object.getPrototypeOf(o)),o);
}
function $deepcopy(o,memo){
  memo=memo||new Map();
  if(o==null||typeof o!=='object')return o;
  if(memo.has(o))return memo.get(o);
  var r=Array.isArray(o)?[]:Object.create(Object.getPrototypeOf(o));
  memo.set(o,r);
  if(Array.isArray(o))o.forEach(function(x,i){r[i]=$deepcopy(x,memo)});
  else Object.keys(o).forEach(function(k){r[k]=$deepcopy(o[k],memo)});
  return r;
}
function $str(x){
  if(x===null||x===undefined)return 'None';
  if(x===true)return 'True';
  if(x===false)return 'False';
  if(typeof x==='string')return x;
  if(typeof x==='number'){if(Object.is(x,-0))return '0';return String(x).replace(/e([-+])(\d)$/,'e$10$2')}
  if(Array.isArray(x))return '['+x.map($repr).join(', ')+']';
  if(x.__str__)return x.__str__();
  if(x.__repr__)return x.__repr__();
  return '<object>';
}
function $repr(x){
  if(typeof x==='string')return "'"+x.replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\n/g,'\\n')+"'";
  if(x&&x.__repr__)return x.__repr__();
  return $str(x);
}
/* %f as C prints it: an exact tie goes to the even digit, where toFixed goes up */
function $fixed(x,p){
  if(!Number.isFinite(x))return x!==x?'nan':x<0?'-inf':'inf';
  var neg=x<0||Object.is(x,-0),a=Math.abs(x),s;
  if(a>=1e21)s=BigInt(a).toString()+(p?'.'+'0'.repeat(p):'');
  else{
    s=a.toFixed(p);
    var sc=a*Math.pow(10,p);
    if(sc<9e15&&sc-Math.floor(sc)===0.5){ /* perhaps a tie: only if the scaling was exact, so check the digits */
      var e=a.toFixed(Math.min(p+30,100));
      if(/^50*$/.test(e.slice(e.indexOf('.')+1+p))){
        var down=(Math.floor(sc)/Math.pow(10,p)).toFixed(p),up=(Math.ceil(sc)/Math.pow(10,p)).toFixed(p);
        s=Math.floor(sc)%2===0?down:up;
      }
    }
  }
  return (neg?'-':'')+s;
}
function $fmt(f,args){
  var A=Array.isArray(args)?args:[args],n=0;
  function next(){if(n>=A.length)throw new TypeError('not enough arguments for format string');return A[n++]}
  return f.replace(/%([-+ #0]*)(\*|\d+)?(?:\.(\*|\d+))?([a-zA-Z%])/g,function(all,fl,w,pr,c){
    if(c==='%')return '%';
    if(w==='*')w=next();
    if(pr==='*')pr=next();
    var v=next(),s,left=fl.indexOf('-')>=0,zero=fl.indexOf('0')>=0;
    if(left&&w<0)w=-w;
    if(w<0){left=true;w=-w}
    switch(c){
      case 'd':case 'i':
        if(!$num(v))throw new TypeError('%d format: a number is required');
        s=String(Math.trunc(+v)+0);
        break;
      case 'f':case 'F':
        if(!$num(v))throw new TypeError('%f format: a number is required');
        s=$fixed(+v,pr===undefined?6:+pr);
        break;
      case 's':s=$str(v);if(pr!==undefined)s=s.slice(0,+pr);break;
      case 'r':s=$repr(v);break;
      case 'c':s=typeof v==='string'?v:$chr(v);break;
      default:throw new ValueError('unsupported format');
    }
    if((c==='d'||c==='f'||c==='i')&&!/^-/.test(s)){if(fl.indexOf('+')>=0)s='+'+s;else if(fl.indexOf(' ')>=0)s=' '+s}
    w=w===undefined?0:+w;
    if(s.length<w){
      if(left)s=s+' '.repeat(w-s.length);
      else if(zero&&c!=='s'){var neg=/^[-+ ]/.test(s);s=(neg?s.charAt(0):'')+'0'.repeat(w-s.length)+(neg?s.slice(1):s)}
      else s=' '.repeat(w-s.length)+s;
    }
    return s;
  });
}
function $localtime(){return {tm_year:(P.now?P.now():new Date(Date.now())).getFullYear()}}
function $exit(){throw new SystemExit()}

/* The source's own generator, its comment kept. */
// Rolling our own LCG because Python changed its incompatibly in 3.2.
// Thus, we needed to have our own to be 2/3 polyglot; it will be
// helpful when and if we ever forward-port to another language.
var LCG_A=1093,LCG_C=221587,LCG_M=1048576; // LCG PRNG parameters tested against Knuth vol. 2. by the authors of ADVENT
var rnd={
  random:function(){var old_x=game.lcg_x;game.lcg_x=(LCG_A*game.lcg_x+LCG_C)%LCG_M;return old_x/LCG_M},
  withprob:function(p){return rnd.random()<p},
  integer:function(a,b){
    var v=rnd.random();
    if(b===undefined)v=$int(v*a);else v=a+$int(v*(b-a));
    return $int(v);
  },
  real:function(a,b){
    var v=rnd.random();
    if(b===undefined){if(a!==undefined)v*=a}
    else v=a+v*(b-a);
    return v;
  },
  seed:function(n){game.lcg_x=$mod(n,LCG_M)},
  getrngstate:function(){return game.lcg_x},
  setrngstate:function(n){game.lcg_x=n}
};

/* ---------- io.c, with only the teletype interface ---------- */
var $o='',ASK={ask:true},$line=null;
function $write(s){
  if(typeof s!=='string')throw new TypeError('write() argument must be str');
  $o+=s;
  var i=$o.lastIndexOf('\n');
  if(i>=0){P.say($o.slice(0,i).split('\n'));$o=$o.slice(i+1)}
}
function proutn(proutntline){$write(proutntline)} // Utter a line with no following line feed.
function prouts(proutsline){$write(proutsline)}   // Emit slowly! Here, as fast as the terminal's own line speed.
function* input(){ /* Python's input(): a line, or EOFError */
  yield ASK;
  var l=$line;
  if(l===P.INT)throw new KeyboardInterrupt();
  if(l===null)throw new EOFError();
  return String(l);
}
class EOFError extends Error{}
function* pause_game(){
  var prompt,linein,tokens;
  if(game.skill>SKILL_FAIR)prompt="[CONTINUE?]";
  else prompt="[PRESS ENTER TO CONTINUE]";
  $write("\n");
  proutn(prompt);
  try{linein=yield* input()}
  catch($e){if($e instanceof EOFError)linein="";else throw $e}
  if(linein){
    tokens=$split($lstrip(linein));
    if(tokens.length)scanner.inqueue=tokens.concat(["\n"],scanner.inqueue);
  }
  $write($mul("\n",rows));
  linecount=0;
}
function* cgetline(){ // Get a line of input.
  try{return (yield* input())+"\n"}
  catch($e){
    if($e instanceof EOFError){yield* prout("");$exit()}
    throw $e;
  }
}
/* Saved games: the source uses a checked pickle; here it is a checked JSON record in this browser's storage */
var $SAVEC=null;
function $classes(){
  if(!$SAVEC)$SAVEC={Gamestate:Gamestate,Snapshot:Snapshot,Quadrant:Quadrant,Page:Page,Planet:Planet,Coord:Coord,Event:Event,Enemy:Enemy,course:course};
  return $SAVEC;
}
function $dump(g){
  var ids=new Map(),n=0;
  function w(v,depth){
    if(v===null||v===undefined||typeof v==='boolean'||typeof v==='number'||typeof v==='string')return v===undefined?null:v;
    if(ids.has(v))return {r:ids.get(v)};
    var id=n++;ids.set(v,id);
    if(Array.isArray(v))return {i:id,l:v.map(function(x){return w(x)})};
    var f={},name=v.constructor.name;
    Object.keys(v).forEach(function(k){f[k]=w(v[k])});
    return {i:id,c:name,f:f};
  }
  return w(g);
}
function $schema(){
  /* what saved_game_schema allows: n number, N optional number, s string, S optional string, C a class, lists of them */
  var c=$classes(),T={};
  function tmpl(o){var t={};Object.keys(o).forEach(function(k){
    var v=o[k];
    t[k]=typeof v==='number'||typeof v==='boolean'?'n':typeof v==='string'?'s':v===null||v===undefined?'0':Array.isArray(v)?'l':v.constructor.name;
  });return t}
  ['Gamestate','Snapshot','Quadrant','Page','Planet','Coord','Event'].forEach(function(k){T[k]=tmpl(new c[k]())});
  T.Enemy={type:'0',location:'Coord',power:'0',kdist:'0',kavgd:'0',pending_remove:'n'};
  T.course={distance:'n',bearing:'n',angle:'n',moves:'n',step:'n',origin:'Coord',increment:'Coord',final:'Coord',location:'Coord',nextlocation:'0'};
  var L=function(x){return {list:x}},O=function(x){return x+'?'};
  Object.assign(T.Gamestate,{options:'n',state:'Snapshot',snapsht:'Snapshot',quad:L(L('s')),damage:L('n'),future:L('Event'),passwd:'s',enemies:L('Enemy'),quadrant:'Coord',sector:'Coord',tholian:O('Enemy'),base:O('Coord'),battle:O('Coord'),plnet:O('Coord'),condition:'s',iscraft:O('s'),ship:O('s'),iplnet:O('Planet'),tourn:O('n'),probe:O('course'),lcg_x:'n'});
  Object.assign(T.Snapshot,{planets:L('Planet'),baseq:L('Coord'),kcmdr:L('Coord'),galaxy:L(L('Quadrant')),chart:L(L('Page'))});
  Object.assign(T.Coord,{i:O('n'),j:O('n')});
  Object.assign(T.Quadrant,{planet:O('Planet')});
  Object.assign(T.Planet,{name:O('s'),pclass:O('s')});
  Object.assign(T.Page,{stars:O('n'),klingons:O('n')});
  Object.assign(T.Event,{date:O('n'),quadrant:O('Coord')});
  Object.assign(T.Enemy,{type:'s',power:O('n'),kdist:O('n'),kavgd:O('n')});
  T.course.nextlocation=O('Coord');
  return T;
}
function $matches(v,spec){
  if(typeof spec==='object')return Array.isArray(v)&&v.every(function(x){return $matches(x,spec.list)});
  var opt=/\?$/.test(spec),s=spec.replace('?','');
  if(v===null)return opt||s==='0';
  if(s==='n')return typeof v==='number'||typeof v==='boolean';
  if(s==='s')return typeof v==='string';
  if(s==='l')return Array.isArray(v);
  if(s==='0')return false;
  return v instanceof $classes()[s];
}
function $load(rec){
  var c=$classes(),T=$schema(),memo=new Map(),active=new Set();
  var OPTIONAL={Gamestate:['sandbox','wayback_disabled'],Page:['supernova'],Enemy:['pending_remove']};
  function bad(m){throw new ValueError(m)}
  function r(v,depth){
    if(depth>100)bad('Saved state is too deeply nested');
    if(v===null||typeof v==='boolean'||typeof v==='string')return v;
    if(typeof v==='number'){if(!Number.isFinite(v))bad('Nonfinite saved value');return v}
    if(typeof v!=='object'||Array.isArray(v))bad('Invalid saved value type');
    if(P.has(v,'r')){
      if(active.has(v.r))bad('Cyclic saved state');
      if(!memo.has(v.r))bad('Dangling saved reference');
      return memo.get(v.r);
    }
    var id=v.i,out;
    if(!Number.isInteger(id))bad('Invalid saved id');
    active.add(id);
    if(Array.isArray(v.l)){
      if(v.l.length>2048)bad('Oversized saved list');
      out=v.l.map(function(x){return r(x,depth+1)});
    }else if(typeof v.c==='string'&&P.has(c,v.c)&&v.f&&typeof v.f==='object'&&!Array.isArray(v.f)){
      var ex=T[v.c],opt=OPTIONAL[v.c]||[],f={};
      if(v.c==='Gamestate')delete v.f.statekscmdr; // This misspelling was written by older releases but never read.
      Object.keys(v.f).forEach(function(k){if(!P.has(ex,k))bad('Invalid fields for '+v.c)});
      Object.keys(ex).forEach(function(k){if(!P.has(v.f,k)&&opt.indexOf(k)<0)bad('Invalid fields for '+v.c)});
      Object.keys(v.f).forEach(function(k){f[k]=r(v.f[k],depth+1);if(!$matches(f[k],ex[k]))bad('Invalid field type for '+v.c)});
      out=Object.create(c[v.c].prototype);
      Object.assign(out,f);
      if(v.c==='Enemy'&&!P.has(f,'pending_remove'))out.pending_remove=false;
    }else bad('Invalid saved value type');
    active.delete(id);
    memo.set(id,out);
    return out;
  }
  if(rec===null||typeof rec!=='object')bad('Save does not contain a game');
  var saved=r(rec,0);
  if(!(saved instanceof Gamestate))bad('Save does not contain a game');
  validate_game(saved);
  // Migrate older saves only after their structure has been checked.
  if(!P.has(saved,'sandbox'))saved.sandbox=false;
  if(!P.has(saved,'wayback_disabled'))saved.wayback_disabled=0;
  [saved.state,saved.snapsht].forEach(function(s){
    for(var t of s.traverse())if(!P.has($g($g(s.chart,t[0]),t[1]),'supernova'))s.chart[t[0]][t[1]].supernova=t[2].supernova;
  });
  return saved;
}
function* freeze(boss){ // Save game.
  var key;
  if(boss)scanner.push("emsave.trk");
  key=yield* scanner.nexttok();
  if(key==="IHEOL"){
    proutn("File name: ");
    key=yield* scanner.nexttok();
  }
  if(key!=="IHALPHA"){
    yield* huh();
    return;
  }
  if(scanner.token.indexOf(".")<0)scanner.token+=".trk";
  if(!P.save('startrek/'+scanner.token,$dump(game))){
    yield* prout($fmt("Can't freeze game as file %s",scanner.token));
    return;
  }
  scanner.chew();
}
function* thaw(){ // Retrieve saved game.
  var key,rec,restored;
  key=yield* scanner.nexttok();
  if(key==="IHEOL"){
    proutn("File name: ");
    key=yield* scanner.nexttok();
  }
  if(key!=="IHALPHA"){
    yield* huh();
    return true;
  }
  if(scanner.token.indexOf(".")<0)scanner.token+=".trk";
  rec=P.saved('startrek/'+scanner.token);
  if(rec===null||rec===undefined){
    yield* prout($fmt("Can't thaw game in %s",scanner.token));
    return true;
  }
  try{restored=$load(rec)}
  catch($e){
    if($e instanceof ValueError||$e instanceof TypeError||$e instanceof IndexError||$e instanceof KeyError||$e instanceof RangeError){
      yield* prout($fmt("Can't thaw game in %s: invalid or unsafe saved game",scanner.token));
      scanner.chew();
      return true;
    }
    throw $e;
  }
  game=restored;
  scanner.chew();
  return false;
}
function* helpme(){ // Browse on-line help.
  var key,cmds,cmd,i,linebuf;
  key=yield* scanner.nexttok();
  for(;;){
    if(key==="IHEOL"){
      proutn("Help on what command? ");
      key=yield* scanner.nexttok();
    }
    if(key==="IHEOL")return;
    cmds=commands.map(function(x){return x[0]});
    if(cmds.indexOf(scanner.token.toUpperCase())>=0||scanner.token.toUpperCase()==="ABBREV")break;
    yield* skip(1);
    yield* listCommands();
    key="IHEOL";
    scanner.chew();
    yield* skip(1);
  }
  cmd=scanner.token.toUpperCase();
  for(i=0;;i++){
    if(i>=SSTDOC.length){
      yield* prout("Spock- \"Captain, there is no information on that command.\"");
      return;
    }
    linebuf=SSTDOC[i];
    if(linebuf.slice(0,3)==="%% "&&cmd===linebuf.slice(3).trim())break;
  }
  yield* skip(1);
  yield* prout("Spock- \"Captain, I've found the following information:\"");
  yield* skip(1);
  for(i++;i<SSTDOC.length;i++){
    if(SSTDOC[i].indexOf("******")>=0)break;
    /* the source writes these raw; a pause here would need a terminal it does not ask for */
    $write(SSTDOC[i]+"\n");
  }
}
function* plaque(){ // Emit winner's commemmorative plaque.
  var winner,file,fpw=[],nskip,timestring,d;
  yield* skip(2);
  for(;;){
    proutn("File or device name for your plaque: ");
    file=$rstrip(yield* cgetline(),"\r\n");
    if(file&&P.writeFile&&P.writeFile(file,[],false))break;
    yield* prout("Invalid name.");
  }
  proutn("Enter name to go on plaque (up to 30 characters): ");
  winner=$rstrip(yield* cgetline(),"\r\n");
  // The 38 below must be 64 for 132-column paper
  nskip=38-$fdiv(winner.length,2);
  // This is where the ASCII art picture was emitted.
  // It got garbled somewhere in the chain of transmission to the Almy version.
  // We should restore it if we can find old enough FORTRAN sources.
  fpw.push("\n\n\n");
  fpw.push("                                                       U. S. S. ENTERPRISE\n");
  fpw.push("\n\n\n\n");
  fpw.push("                                  For demonstrating outstanding ability as a starship captain\n");
  fpw.push("\n");
  fpw.push("                                                Starfleet Command bestows to you\n");
  fpw.push("\n");
  fpw.push($fmt("%*s%s\n\n",[nskip,"",winner]));
  fpw.push("                                                           the rank of\n\n");
  fpw.push("                                                       \"Commodore Emeritus\"\n\n");
  fpw.push("                                                          ");
  if(game.skill===SKILL_EXPERT)fpw.push(" Expert level\n\n");
  else if(game.skill===SKILL_EMERITUS)fpw.push("Emeritus level\n\n");
  else fpw.push(" Cheat level\n\n");
  d=P.now?P.now():new Date(Date.now());
  timestring=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()]+' '+['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]+' '+(d.getDate()<10?' ':'')+d.getDate()+' '+('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2)+':'+('0'+d.getSeconds()).slice(-2)+' '+d.getFullYear();
  fpw.push($fmt("                                                 This day of %.6s %.4s, %.8s\n\n",[timestring.slice(4,10),timestring.slice(20,24),timestring.slice(11,19)]));
  fpw.push($fmt("                                                        Your score:  %d\n\n",game.score));
  fpw.push($fmt("                                                    Klingons per stardate:  %.2f\n",game.perdate));
  P.writeFile(file,fpw.join('').replace(/\n$/,'').split('\n'),false);
}
function iostart(){rows=P.piped&&P.piped()?0:24}
function $sum(x){var t=0;for(var e of x)t=$add(t,e);return t}
function $zip(a,b){var r=[],x=$list(a),y=$list(b);for(var i=0;i<x.length&&i<y.length;i++)r.push([x[i],y[i]]);return r}
function $sorted(x){var a=$list(x);$sort(a);return a}
function* spinguard(k){ /* not in the source, which spins here: see the header */
  if(k<1000000)return;
  $line=null;
  yield ASK;
  throw new SystemExit();
}
var SSTDOC=[
"%% SRSCAN",
"Shortest abbreviation:  S",
"Full commands:  SRSCAN",
"                SRSCAN NO",
"                SRSCAN CHART",
"",
"If you are using the screen-oriented interface, this command is",
"suppressed; instead, a short-range scan will always be present on the",
"screen.",
"",
"The short-range scan gives you a considerable amount of information",
"about the quadrant your starship is in. A short-range scan is best",
"described by an example.",
"",
"         1 2 3 4 5 6 7 8 9 10",
"      1  * . . . . R . . . .  Stardate      2516.3",
"      2  . . . E . . . . . .  Condition     RED  ",
"      3  . . . . . * . B . .  Position      5 - 1, 2 - 4",
"      4  . . . S . . . . . .  Life Support  DAMAGED, Reserves=2.30",
"      5  . . . . . . . K . .  Warp Factor   5.0",
"      6  . K .   . . . . * .  Energy        2176.24",
"      7  . . . . . P . . . .  Torpedoes     3",
"      8  . . . . * . . . . .  Shields       UP, 42% 1050.0 units",
"      9  . * . . * . . . C .  Klingons Left 12",
"     10  . . . . . . . . . .  Time Left     3.72",
"",
"If wayback is 2023 or later, the display will use letters for Y",
"coordinates.",
"",
"         1 2 3 4 5 6 7 8 9 10",
"      a  * . . . . R . . . .  Stardate      2516.3",
"      b  . . . E . . . . . .  Condition     RED  ",
"      c  . . . . . * . B . .  Position      e1, b4",
"      d  . . . S . . . . . .  Life Support  DAMAGED, Reserves=2.30",
"      e  . . . . . . . K . .  Warp Factor   5.0",
"      f  . K .   . . . . * .  Energy        2176.24",
"      g  . . . . . P . . . .  Torpedoes     3",
"      h  . . . . * . . . . .  Shields       UP, 42% 1050.0 units",
"      i  . * . . * . . . C .  Klingons Left 12",
"      j  . . . . . . . . . .  Time Left     3.72",
"",
"The left part is a picture of the quadrant. The E at sector 2 - 4 (or",
"b4) represents the Enterprise; the B at sector 3 - 8 (or c8) is a",
"starbase. There are ordinary Klingons (K) at sectors 5 - 8 (e8) and 6 -",
"2 (f2), and a Klingon Commander (C) at 9 - 9 (i9). The (GULP) \"Super-",
"commander\" (S) is occupies sector 4 - 4 (d4), and a Romulan (R) is at 1",
"- 6 (a6). An uninhabited planet (P) is at sector 7 - 6 (g6) (if it were",
"inhabited, it would display as a '@'). There are also a large number of",
"stars (*). The periods (.) are just empty space -- they are printed to",
"help you get your bearings. Sector 6 - 4 contains a black hole ( ).",
"",
"The information on the right is assorted status information. You can get",
"this alone with the STATUS command. The status information will be",
"absent if you type \"N\" after SRSCAN. Otherwise status information will",
"be presented.",
"",
"If you type \"C\" after SRSCAN, you will be given a short-range scan and a",
"Star Chart.",
"",
"Short-range scans are free. That is, they use up no energy and no time.",
"If you are in battle, doing a short-range scan does not give the enemies",
"another chance to hit you. You can safely do a short-range scan anytime",
"you like.",
"",
"If your short-range sensors are damaged, this command will only show the",
"contents of adjacent sectors.",
"********",
"%% STATUS",
"Shortest abbreviation: ST",
"",
"If you are using the screen-oriented interface, this command is",
"suppressed; instead, a full status report will always be present on the",
"screen.",
"",
"This command gives you information about the current state of your",
"starship as follows:",
"",
"STARDATE",
"The current date. A stardate is the same as a day.",
"",
"CONDITION",
"There are four possible conditions:",
"",
"DOCKED",
"docked at starbase.",
"",
"RED",
"in battle.",
"",
"YELLOW",
"low on energy (<1000 units)",
"",
"GREEN",
"none of the above",
"",
"POSITION",
"Quadrant is given first, then sector",
"",
"LIFE SUPPORT",
"If \"ACTIVE\" then life support systems are functioning normally. If on",
"\"RESERVES\" the number is how many stardates your reserve food, air, etc.",
"will last -- you must get repairs made or get to a starbase before your",
"reserves run out.",
"",
"WARP FACTOR",
"What your warp factor is currently set to.",
"",
"ENERGY",
"The amount of energy you have left. If it drops to zero, you die.",
"",
"TORPEDOES",
"How many photon torpedoes you have left.",
"",
"SHIELDS",
"Whether your shields are up or down, how strong they are (what",
"percentage of a hit they can deflect), and shield energy.",
"",
"KLINGONS LEFT",
"How many of the Klingons are still out there.",
"",
"TIME LEFT",
"How long the Federation can hold out against the present number of",
"Klingons; that is, how long until the end if you do nothing in the",
"meantime. If you kill Klingons quickly, this number will go up -- if",
"not, it will go down. If it reaches zero, the federation is conquered",
"and you lose.",
"",
"Status information is free -- it uses no time or energy, and if you are",
"in battle, the Klingons are not given another chance to hit you.",
"",
"Status information can also be obtained by doing a short-range scan. See",
"the SRSCAN command for details.",
"",
"Each item of information can be obtained singly by requesting it. See",
"REQUEST command for details.",
"********",
"%% LRSCAN",
"Shortest abbreviation:  L",
"",
"If you are using the screen-oriented interface, this command is",
"suppressed; instead, a long-range scan will always be present on the",
"screen.",
"",
"A long-range scan gives you general information about where you are and",
"what is around you. Here is an example output.",
"",
"    Long-range scan for Quadrant 5 - 1",
"       -1  107  103",
"       -1  316    5",
"       -1  105 1000",
"",
"This scan says that you are in row 5, column 1 of the 8 by 8 galaxy. The",
"numbers in the scan indicate how many of each kind of thing there is in",
"your quadrant and all adjacent quadrants. The digits are interpreted as",
"follows.",
"",
"For example, in your quadrant (5 - 1) the number is 316, which indicates",
"3 Klingons, 1 starbase, and 6 stars. The long-range scanner does not",
"distinguish between ordinary Klingons and Klingon command ships. If",
"there is a supernova, as in the quadrant below and to your right",
"(quadrant 6 - 2), there is nothing else in the quadrant.",
"",
"Romulans possess a \"cloaking device\" which prevents their detection by",
"long-range scan. Because of this fact, Starfleet Command is never sure",
"how many Romulans are \"out there\". When you kill the last Klingon, the",
"remaining Romulans surrender to the Federation.",
"",
"Planets are also undetectable by long-range scan. The only way to detect",
"a planet is to find it in your current quadrant with the short-range",
"sensors.",
"",
"Since you are in column 1, there are no quadrants to your left. The",
"minus ones indicate the negative energy barrier at the edge of the",
"galaxy, which you are not permitted to cross.",
"",
"Long-range scans are free. They use up no energy or time, and can be",
"done safely regardless of battle conditions.",
"********",
"%% CHART",
"Shortest abbreviation:  C",
"",
"If you are using the screen-oriented interface and your terminal window",
"is more than 40 lines high, this command is unnecessary (though not",
"suppressed); instead, a chart will always be present on the screen.",
"",
"As you proceed in the game, you learn more and more about what things",
"are where in the galaxy. Whenever you first do a scan in a quadrant,",
"telemetry sensors are ejected which will report any changes in the",
"quadrant(s) back to your ship, providing the sub-space radio is working.",
"Spock will enter this information in the chart. If the radio is not",
"working, Spock can only enter new information discovered from scans, and",
"information in other quadrants may be obsolete.",
"",
"The chart looks like an 8 by 8 array of numbers. These numbers are",
"interpreted exactly as they are on a long-range scan. A period (.) in",
"place of a digit means you do not know that information yet. For",
"example, ... means you know nothing about the quadrant, while .1. means",
"you know it contains a base, but an unknown number of Klingons and",
"stars.",
"",
"Looking at the star chart is a free operation. It costs neither time nor",
"energy, and can be done safely whether in or out of battle.",
"********",
"%% DAMAGES",
"Shortest abbreviation:  DA",
"",
"At any time you may ask for a damage report to find out what devices are",
"damaged and how long it will take to repair them. Naturally, repairs",
"proceed faster at a starbase.",
"",
"If you suffer damages while moving, it is possible that a subsequent",
"damage report will not show any damage. This happens if the time spent",
"on the move exceeds the repair time, since in this case the damaged",
"devices were fixed en route.",
"",
"Damage reports are free. They use no energy or time, and can be done",
"safely even in the midst of battle.",
"********",
"%% MOVE",
"Shortest abbreviation:  M",
"Full command:  MOVE MANUAL <displacement>",
"               MOVE AUTOMATIC <destination>",
"",
"This command is the usual way to move from one place to another within",
"the galaxy. You move under warp drive, according to the current warp",
"factor (see \"WARP FACTOR\").",
"",
"There are two command modes for movement: MANUAL and AUTOMATIC. The",
"manual mode requires the following format:",
"",
"\tMOVE MANUAL <deltax> <deltay>",
"",
"<deltax> and <deltay> are the horizontal and vertical displacements for",
"your starship, in quadrants; a displacement of one sector is 0.1",
"quadrants. Specifying <deltax> and <deltay> causes your ship to move in",
"a straight line to the specified destination. If <deltay> is omitted, it",
"is assumed zero. For example, the shortest possible command to move one",
"sector to the right would be",
"",
"\tM M .1",
"",
"The following examples of manual movement refer to the short-range scan",
"shown earlier.",
"",
"  Destination Sector\tManual Movement command",
"\t3 - 1\t\t\tM M -.3 -.1",
"\t2 - 1\t\t\tM M -.3",
"\t1 - 2\t\t\tM M -.2 .1",
"\t1 - 4\t\t\tM M 0 .1",
"  (leaving quadrant)\t\tM M 0 .2",
"",
"The automatic mode is as follows:",
"",
"\tMOVE AUTOMATIC <qrow> <qcol> <srow> <scol>",
"",
"where <qrow> and <qcol> are the row and column numbers of the",
"destination quadrant, and <srow> and <scol> are the row and column",
"numbers of the destination sector in that quadrant. This command also",
"moves your ship in a straight line path to the destination. For moving",
"within a quadrant, <qrow> and <qcol> may be omitted. For example, to",
"move to sector 2 - 9 in the current quadrant, the shortest command would",
"be",
"",
"\tM A 2 9",
"",
"To move to quadrant 3 - 7, sector 5 - 8, type",
"",
"\tM A 3 7 5 8",
"",
"and it will be done. In automatic mode, either two or four numbers must",
"be supplied.",
"",
"As a convenience, the command interpreter accepts \"AM\" as equivalent to",
"\"M A\".",
"",
"If the wayback setting is 2023 or later, there is a way to input",
"coordinates that avoids any need to remember that the Y coordinate comes",
"first. Y values may be given as lowercase letters starting with a = 1.",
"So for example:",
"",
"\ta1 = 1 - 1",
"\tc5 = 3 - 5",
"\tf2 = 6 - 2",
"",
"The previous move command could be expressed as",
"",
"\tm a c7 e8",
"",
"Automatic mode utilizes the ship's \"battle computer.\" If the computer is",
"damaged, manual movement must be used.",
"",
"If warp engines are damaged less than 10 stardates (undocked) of repair",
"time will cover, you can still go warp 4.",
"",
"It uses time and energy to move. How much time and how much energy",
"depends on your current warp factor, the distance you move, and whether",
"your shields are up. The higher the warp factor, the faster you move,",
"but higher warp factors require more energy. You may move with your",
"shields up, but this doubles the energy required.",
"",
"You can move within a quadrant without being attacked if you just",
"entered the quadrant or have been attacked since your last move command.",
"This enables you to move and hit them before they retaliate.",
"********",
"%% WARP",
"Shortest abbreviation:  W",
"Full command:  WARP <number>",
"",
"Your warp factor controls the speed of your starship. The larger the",
"warp factor, the faster you go and the more energy you use.",
"",
"Your minimum warp factor is 1.0 and your maximum warp factor is 10.0",
"(which is 100 times as fast and uses 1000 times as much energy). At",
"speeds above warp 6 there is some danger of causing damage to your warp",
"engines; this damage is larger at higher warp factors and also depends",
"on how far you go at that warp factor.",
"",
"At exactly warp 10 there is some probability of entering a so-called",
"\"time warp\" and being thrown forward or backward in time. The farther",
"you go at warp 10, the greater is the probability of entering the time",
"warp.",
"********",
"%% IMPULSE",
"Shortest abbreviation:  I",
"Full command:  IMPULSE MANUAL <displacement>",
"               IMPULSE AUTOMATIC <destination>",
"",
"The impulse engines give you a way to move when your warp engines are",
"damaged. They move you at a speed of 0.95 sectors per stardate, which is",
"the equivalent of a warp factor of about 0.975, so they are much too",
"slow to use except in emergencies.",
"",
"Movement commands are indicated just as in the \"MOVE\" command.",
"",
"The impulse engines require 20 units of energy to engage, plus 10 units",
"per sector (100 units per quadrant) traveled. It does not cost extra to",
"move with the shields up.",
"********",
"%% SHIELDS",
"Shortest abbreviation:  SH",
"Full commands:  SHIELDS UP",
"                SHIELDS DOWN",
"                SHIELDS TRANSFER <amount of energy to transfer>",
"",
"Your deflector shields are a defensive device to protect you from",
"Klingon attacks (and nearby novas). As the shields protect you, they",
"gradually weaken. A shield strength of 75%, for example, means that the",
"next time a Klingon hits you, your shields will deflect 75% of the hit,",
"and let 25% get through to hurt you.",
"",
"It costs 50 units of energy to raise shields, nothing to lower them. You",
"may move with your shields up; this costs nothing under impulse power,",
"but doubles the energy required for warp drive.",
"",
"Each time you raise or lower your shields, the Klingons have another",
"chance to attack. Since shields do not raise and lower instantaneously,",
"the hits you receive will be intermediate between what they would be if",
"the shields were completely up or completely down.",
"",
"You may not fire phasers through your shields. However you may use the",
"\"high-speed shield control\" to lower shields, fire phasers, and raise",
"the shields again before the Klingons can react. Since rapid lowering",
"and raising of the shields requires more energy than normal speed",
"operation, it costs you 200 units of energy to activate this control. It",
"is automatically activated when you fire phasers while shields are up.",
"You may fire photon torpedoes, but they may be deflected considerably",
"from their intended course as they pass through the shields (depending",
"on shield strength).",
"",
"You may transfer energy between the ship's energy (given as \"Energy\" in",
"the status) and the shields. The word \"TRANSFER\" may be abbreviated \"T\".",
"The amount of energy to transfer is the number of units of energy you",
"wish to take from the ship's energy and put into the shields. If you",
"specify an negative number, energy is drained from the shields to the",
"ship. Transfering energy constitutes a turn. If you transfer energy to",
"the shields while you are under attack, they will be at the new energy",
"level when you are next hit.",
"",
"Enemy torpedoes hitting your ship explode on your shields (if they are",
"up) and have essentially the same effect as phaser hits.",
"********",
"%% PHASERS",
"Shortest abbreviation:  P",
"Full commands:  PHASERS AUTOMATIC <AMOUNT TO FIRE> <NO>",
"                PHASERS <AMOUNT TO FIRE> <NO>",
"                PHASERS MANUAL <NO> <AMOUNT 1> <AMOUNT 2>...<AMOUNT N> ",
"",
"Phasers are energy weapons. As you fire phasers at Klingons, you specify",
"an \"amount to fire\" which is drawn from your energy reserves. The amount",
"of total hit required to kill an enemy is partly random. but also",
"depends on skill level.",
"",
"The average hit required to kill an ordinary Klingon varies from 200",
"units in the Novice game to 250 units in the Emeritus game. Commanders",
"normally require from 600 (Novice) to 700 (Emeritus). The Super-",
"commander requres from 875 (Good) to 1000 (Emeritus). Romulans require",
"an average of 350 (Novice) to 450 (Emeritus).",
"",
"Hits on enemies are cumulative, as long as you don't leave the quadrant.",
"",
"In general, not all that you fire will reach the Klingons. The farther",
"away they are, the less phaser energy will reach them. If a Klingon is",
"adjacent to you, he will receive about 90% of the phaser energy directed",
"at him; a Klingon 5 sectors away will receive about 60% and a Klingon 10",
"sectors away will receive about 35%. There is some randomness involved,",
"so these figures are not exact. Phasers have no effect beyond the",
"boundaries of the quadrant you are in.",
"",
"Phasers may overheat (and be damaged) if you fire too large a burst at",
"once. Firing up to 1500 units is safe. From 1500 on up the probability",
"of overheat increases with the amount fired.",
"",
"If phaser firing is automatic, the computer decides how to divide up",
"your <amount to fire> among the Klingons present. If phaser firing is",
"manual, you specify how much energy to fire at each Klingon present",
"(nearest first), rather than just specifying a total amount. You can",
"abbreviate \"MANUAL\" and \"AUTOMATIC\" to one or more letters; if you",
"mention neither, automatic fire is usually assumed.",
"",
"Battle computer information is available by firing phasers manually, and",
"allowing the computer to prompt you. If you enter zero for the amount to",
"fire at each enemy, you will get a complete report, without cost. The",
"battle computer will tell you how much phaser energy to fire at each",
"enemy for a sure kill. This information appears in parentheses prior to",
"the prompt for each enemy. Since the amount is computed from sensor",
"data, if either the computer or the S.R. sensors are damaged, this",
"information will be unavailable, and phasers must be fired manually.",
"",
"A safety interlock prevents phasers from being fired through the",
"shields. If this were not so, the shields would contain your fire and",
"you would fry yourself. However, you may utilize the \"high-speed shield",
"control\" to drop shields, fire phasers, and raise shields before the",
"enemy can react. Since it takes more energy to work the shields rapidly",
"with a shot, it costs you 200 units of energy each time you activate",
"this control. It is automatically activated when you fire phasers while",
"the shields are up. By specifying the <no> option, shields are not",
"raised after firing.",
"",
"Phasers have no effect on starbases (which are shielded) or on stars.",
"********",
"%% CLOAK",
"  Shortest abbreviation:  CLOAK",
"  Full commands:  CLOAK ON",
"                  CLOAK OFF",
"",
"The cloaking device prevents your ship from being seen by any enemy",
"vessels. When the cloaking device is in use, your subspace radio will",
"not receive transmissions, torpedoes will be less accurate, you cannot",
"dock, and you cannot use your warp engines. Enemy ships will get a",
"chance to attack you when you turn cloaking on.",
"",
"The Treaty of Algeron with the Romulans in Stardate 2311 prohibits the",
"use of cloaking devices. If a Romulan ship observes you cloaking or",
"uncloaking after this point in time you will be in violation, which will",
"hurt your final score.",
"",
"The Faerie Queene does not have a cloaking device.",
"********",
"%% CAPTURE",
"Shortest abbreviation:  CAPTURE",
"Full commands:  CAPTURE",
"",
"Ask a Klingon To surrender.",
"",
"The capture command provides a more humane way to end a battle than just",
"destroying the Klingon battleship with the crew aboard. Assuming the",
"subspace radio and transporter are working, and there is room in the",
"brig, this command will ask the captain of the weakest Klingon ship in",
"the quadrant to surrender. If the captain agrees, some of the crew will",
"transport to your ship and the Klingon ship will be destroyed. This",
"command does take time and you will be attacked by any other enemy ships",
"if the surrender occurs.",
"",
"When you dock, any captured Klingons will be transferred to the base and",
"you will be credited with the lives you save.",
"********",
"%% REPORT",
"Shortest abbreviation: REP",
"",
"This command supplies you with information about the state of the",
"current game. Its purpose is to remind you of things that you have",
"learned during play, but may have forgotten, and cannot otherwise",
"retrieve if you are not playing at a hard-copy terminal.",
"",
"You are told the following things:",
"",
"The length and skill level of the game you are playing",
"",
"The original number of Klingons",
"",
"How many Klingons you have destroyed",
"",
"Whether the Super-Commander has been destroyed",
"",
"How many bases have been destroyed",
"",
"How many bases are left",
"",
"What bases (if any) are under attack; your subspace radio must have been",
"working since the attack to get this information.",
"",
"How many casualties you have suffered",
"",
"How many times you have called for help.",
"",
"This same information is automatically given to you when you start to",
"play a frozen game.",
"********",
"%% COMPUTER",
"Shortest abbreviation: CO",
"",
"This command allows using the ship's computer (if functional) to",
"calculate travel times and energy usage.",
"********",
"%% TORPEDO",
"Shortest abbreviation:  TO",
"Full commands:  TORPEDO <NUMBER> <TARG1> <TARG2> <TARG3>",
"",
"Photon torpedoes are projectile weapons -- you either hit what you aim",
"at, or you don't. There are no \"partial hits\".",
"",
"One photon torpedo will usually kill one ordinary Klingon, but it",
"usually takes about two for a Klingon Commander. Photon torpedoes can",
"also blow up stars and starbases, if you aren't careful.",
"",
"You may fire photon torpedoes singly, or in bursts of two or three. Each",
"torpedo is individually targetable. The computer will prompt you, asking",
"for the target sector for each torpedo. Alternately, you may specify",
"each target in the command line.",
"",
"Photon torpedoes cannot be aimed precisely -- there is always some",
"randomness involved in the direction they go. Photon torpedoes may be",
"fired with your shields up, but as they pass through the shields they",
"are randomly deflected from their intended course even more.",
"",
"Photon torpedoes are proximity-fused. The closer they explode to the",
"enemy, the more damage they do. There is a hit \"window\" about one sector",
"wide. If the torpedo misses the hit window, it does not explode and the",
"enemy is unaffected. Photon torpedoes are only effective within the",
"quadrant. They have no effect on things in adjacent quadrants.",
"",
"If more than one torpedo is fired and only one target sector is",
"specified, all torpedoes are fired at that sector. For example, to fire",
"two torpedoes at sector 3 - 4, you type",
"",
"     PHO 2 3 4           (or)           PHO 2 3 4 3 4",
"",
"To fire torpedoes at, consecutively, sectors 2 - 6, 1 - 10, and 4 - 7,",
"type",
"",
"     PHO 3 2 6 1 10 4 7",
"",
"There is no restriction to fire directly at a sector. For example, you",
"can enter",
"",
"       PHO 1 3 2.5",
"",
"to aim between two sectors. However, sector numbers must be 1 to 10",
"inclusive.",
"",
"If the wayback setting is 2023 or later, you can write \"PHO 3 2 6 1 10 4",
"7\" as",
"",
"     pho 3 b6 a10 d7",
"",
"Fractional Y coordinates are not supported.",
"********",
"%% DOCK",
"Shortest abbreviation:  D",
"",
"You may dock your starship whenever you are in one of the eight sector",
"positions immediately adjacent to a starbase. When you dock, your",
"starship is resupplied with energy, shield energy photon torpedoes, and",
"life support reserves. Repairs also proceed faster at starbase, so if",
"some of your devices are damaged, you may wish to stay at base (by using",
"the \"REST\" command) until they are fixed. If your ship has more than its",
"normal maximum energy (which can happen if you've loaded crystals) the",
"ship's energy is not changed.",
"",
"You may not dock while in standard orbit around a planet.",
"",
"Starbases have their own deflector shields, so you are completely safe",
"from phaser attack while docked. You are also safe from long-range",
"tractor beams.",
"",
"Starbases also have both short and long range sensors, which you can use",
"if yours are broken. There's also a subspace radio to get information",
"about happenings in the galaxy. Mr. Spock will update the star chart if",
"your ask for it while docked and your own radio is dead.",
"********",
"%% REST",
"Shortest abbreviation:  R",
"Full command:  REST <NUMBER-OF-STARDATES>",
"",
"This command simply allows the specified number of stardates to go by.",
"This is useful if you have suffered damages and wish to wait until",
"repairs are made before you go back into battle.",
"",
"It is not generally advisable to rest while you are under attack by",
"Klingons or Romulans.",
"********",
"%% MAYDAY",
"(No abbreviation)",
"",
"[Originally, this command was called \"HELP\", but these days that might",
"be misconstrued as an attempt to browse built-in documentation! In some",
"later versions it was CALL.]",
"",
"When you get into serious trouble, you may call a starbase for help.",
"Starbases have a device called a \"long-range transporter beam\" which",
"they can use to teleport you to base. This works by dematerializing your",
"starship at its current position and re-materializing it adjacent to the",
"nearest starbase. Teleportation is instantaneous, and starbase supplies",
"the required energy -- all you have to do is let them know (via subspace",
"radio) that you need to be rescued.",
"",
"This command should be employed only when absolutely necessary. In the",
"first place, calling for help is an admission on your part that you got",
"yourself into something you cannot get yourself out of, and you are",
"heavily penalized for this in the final scoring. Secondly, the long-",
"range transporter beam is not reliable -- starbase can always manage to",
"dematerialize your starship, but (depending on distance) may or may not",
"be able to re-materialize you again. The long-range transporter beam has",
"no absolute maximum range; if you are in the same quadrant as a",
"starbase, you have a good chance (about 90%) of re-materializing",
"successfully. your chances drop to roughly 50-50 at just over 3",
"quadrants.",
"********",
"%% ABANDON",
"(no abbreviation)",
"",
"You may abandon the Enterprise if necessary. If there is still a",
"starbase in the galaxy, you will be sent there and put in charge of a",
"weaker ship, the Faerie Queene.",
"",
"The Faerie Queene cannot be abandoned.",
"********",
"%% DESTRUCT",
"(no abbreviation)",
"",
"You may self-destruct, thus killing yourself and ending the game. If",
"there are nearby Klingons, you may take a few of them with you (the more",
"energy you have left, the bigger the bang). It is possible to win this",
"way, if you kill off your last adversaries with the blast.",
"",
"In order to self-destruct you must remember the password you typed in at",
"the beginning of the game.",
"********",
"%% QUIT",
"(no abbreviation)",
"",
"Immediately cancel the current game; no conclusion is reached. You will",
"be given an opportunity to start a new game or to leave the Star Trek",
"program.",
"********",
"%% SENSORS",
"Shortest abbreviation:  SE",
"",
"Utilizing the short-range sensors, science officer Spock gives you a",
"readout on any planet in your quadrant. Planets come in three classes:",
"M, N, and O. Only class M planets have earth-like conditions. Spock",
"informs you if the planet has any dilithium crystals. Sensor scans are",
"free.",
"********",
"%% ORBIT",
"Shortest abbreviation:  O",
"",
"To land on a planet you must first be in standard orbit. You achieve",
"this in a manner similar to docking at starbase. Moving to one of the",
"eight sector positions immediately adjacent to the planet, you give the",
"orbit command which puts your ship into standard orbit about the planet.",
"Since this is a maneuver, a small amount of time is used; negligible",
"energy is required. If enemies are present, they will attack.",
"********",
"%% TRANSPORT",
"Shortest abbreviation:  T",
"",
"The transporter is a device which can convert any physical object into",
"energy, beam the energy through space, and reconstruct the physical",
"object at some destination. Transporting is one way to land on a planet.",
"Since the transporter has a limited range, you must be in standard orbit",
"to beam down to a planet. Shields must be down while transporting.",
"",
"The transport command is used to beam a landing party onto a planet to",
"mine \"dilithium crystals\". Each time the command is given the landing",
"party (which you lead) moves from the ship to the planet, or vice-versa.",
"",
"You are advised against needless transporting, since like all devices,",
"the transporter will sometimes malfunction.",
"",
"The transporter consumes negligible time and energy. Its use does not",
"constitute a \"turn\".",
"********",
"%% SHUTTLE",
"Shortest abbreviation:  SHU",
"",
"An alternate way to travel to and from planets. Because of limited",
"range, you must be in standard orbit to use the shuttle craft, named",
"\"Galileo\". Shields must be down.",
"",
"Unlike transporting, use of the shuttle craft does constitute a \"turn\"",
"since time is consumed. The time naturally depends on orbit altitude,",
"and is equal to 3.0e-5 times altitude. Shuttling uses no ship energy.",
"",
"You should use the same travel device going from the planet to the ship",
"as you use to go from the ship to the planet. However it is possible to",
"transport to the planet and have the Galileo crew come and pick your",
"landing party up, or to take the Galileo to the planet and then",
"transport back, leaving the shuttle craft on the planet.",
"********",
"%% MINE",
"Mnemonic:  MINE",
"Shortest abbreviation:  MI",
"",
"Once you and your mining party are on the surface of a planet which has",
"dilithium crystals, this command will dig them for you.",
"",
"Mining requires time and constitutes a \"turn\". No energy is used. Class",
"M planets require 0.1 to 0.3 stardates to mine. Class N planets take",
"twice as long, and class O planets take three times as long.",
"",
"Dilithium crystals contain enormous energy in a form that is readily",
"released in the ship's power system. It is an excellent idea to mine",
"them whenever possible, for use in emergencies. You keep the crystals",
"until the game is over or you abandon ship when not at a starbase.",
"********",
"%% CRYSTALS",
"Mnemonic:  CRYSTALS",
"Shortest abbreviation:  CR",
"",
"This is a very powerful command which should be used with caution. Once",
"you have dilithium crystals aboard ship, this command will instruct",
"engineering officer Scott and Mr. Spock to place a raw dilithium crystal",
"into the power channel of the ship's matter-antimatter converter. When",
"it works, this command will greatly boost the ship's energy.",
"",
"Because the crystals are raw and impure, instabilities can occur in the",
"power channel. Usually Scotty can control these. When he cannot, the",
"results are disastrous. Scotty will use those crystals that appear to be",
"most stable first.",
"",
"Since using raw dilithium crystals for this purpose entails considerable",
"risk, Starfleet Regulations allow its use only during \"condition",
"yellow\". No time or energy is used.",
"********",
"%% PLANETS",
"Mnemonic:  PLANETS",
"Shortest abbreviation:  PL",
"",
"Mr. Spock presents you a list of the available information on planets in",
"the galaxy which are potential dilithium sources. Since planets do not",
"show up on long-range scans, the only way to obtain this information is",
"with the \"SENSORS\" command.",
"********",
"%% FREEZE",
"Mnemonic:  FREEZE",
"(no abbreviation)",
"Full command:  FREEZE <FILE NAME>",
"",
"The purpose of the FREEZE command is to allow a player to save the",
"current state of the game, so that it can be finished later. A plaque",
"may not be generated from a frozen game. A file with the specified <file",
"name> and type '.trk' is created (if necessary) in the current",
"directory, and all pertinent information about the game is written to",
"that file. The game may be continued as usual or be terminated at the",
"user's option.",
"",
"To restart a game created by the \"FREEZE\" command, the user need only",
"type \"FROZEN\" in response to the initial question about the type of game",
"desired, followed by the <file name>.",
"",
"NOTE: A \"tournament\" game is like a frozen game, with the following",
"differences. (1) Tournament games always start from the beginning, while",
"a frozen game can start at any point. (2) Tournament games require only",
"that the player remember the name or number of the tournament, while the",
"information about a frozen game must be kept on a file. Tournament games",
"can be frozen, but then they behave like regular frozen games.",
"",
"A point worth noting is that 'FREEZE' does not save the seed for the",
"random number generator, so that identical actions after restarting the",
"same frozen game can lead to different results. However, identical",
"actions after starting a given tournament game always lead to the same",
"results.",
"********",
"%% REQUEST",
"Mnemonic:  REQUEST",
"Shortest abbreviation:  REQ",
"Full command:  REQUEST <ITEM>",
"",
"If you are using the screen-oriented interface, this command is",
"suppressed; instead, a full status report will always be present on the",
"screen.",
"",
"This command allows you to get any single piece of information from the",
"<STATUS> command. <ITEM> specifies which information as follows:",
"********",
"%% DEATHRAY",
"(No abbreviation)",
"",
"This command should be used only in those desperate cases where you have",
"absolutely no alternative. The death ray uses energy to rearrange",
"matter. Unfortunately, its working principles are not yet thoroughly",
"understood, and the results are highly unpredictable.",
"",
"The only good thing that can result is the destruction of all enemies in",
"your current quadrant. This will happen about 70% of the time. Only",
"enemies are destroyed; starbases, stars, and planets are unaffected.",
"",
"Constituting the remaining 30% are results varying from bad to fatal.",
"",
"The death ray requires no energy or time, but if you survive, enemies",
"will hit you.",
"",
"The Faerie Queene has no death ray.",
"",
"If the death ray is damaged in its use, it must be totally replaced.",
"This can only be done at starbase. Because it is a very complex device,",
"it takes 9.99 stardates at base to replace the death ray. The death ray",
"cannot be repaired in flight.",
"********",
"%% PROBE",
"Shortest abbreviation:  PR",
"Full command:  PROBE <ARMED> MANUAL <displacement>",
"               PROBE <ARMED> AUTOMATIC <destination>",
"",
"The Enterprise carries a limited number of Long Range Probes. These fly",
"to the end of the galaxy and report back a count of the number of",
"important things found in each quadrant through which it went. The probe",
"flies at warp 10, and therefore uses time during its flight. Results are",
"reported immediately via subspace radio and are recorded in the star",
"chart.",
"",
"The probe can also be armed with a NOVAMAX warhead. When launched with",
"the warhead armed, the probe flies the same except as soon as it reaches",
"the target location, it detonates the warhead in the heart of a star,",
"causing a supernova and destroying everything in the quadrant. It then",
"flies no further. There must be a star in the target quadrant for the",
"NOVAMAX to function.",
"",
"The probe can fly around objects in a galaxy, but is destroyed if it",
"enters a quadrant containing a supernova, or if it leaves the galaxy.",
"",
"The target location is specified in the same manner as the MOVE command,",
"however for automatic movement, if only one pair of coordinates are",
"specified they are assumed to be the quadrant and not the sector in the",
"current quadrant!",
"",
"The Faerie Queene has no probes.",
"********",
"%% EMEXIT",
"Shortest abbreviation:  E",
"",
"This command provides a quick way to exit from the game when you observe",
"a Klingon battle cruiser approaching your terminal. Its effect is to",
"freeze the game on the file 'EMSAVE.TRK' in your current directory,",
"erase the screen, and exit.",
"",
"Of course, you do lose the chance to get a plaque when you use this",
"maneuver.",
"********",
"%% HELP",
"Full command:  HELP <command>",
"",
"This command reads the appropriate section from the SST.DOC file,",
"providing the file is in the current directory.",
"********",
"%% CURSES",
"Full command:  CURSES",
"",
"Switch from tty to curses interface. Mainly useful for debugging, when",
"continuing a replayed game.",
"********",
"%% OP",
"Full command:  OPTIONS",
"               OPTIONS SET",
"\t       OPTIONS CLEAR",
"",
"Set or clear feature flags. With no argument, list feature flags. The",
"verbs SET and CLEAR are available to set or clear a list of feature",
"flags following on the line. Mainly useful for development and improving",
"test coverage.",
"********",
"%% ABBREV",
" ABBREV    FULL COMMAND                           DEVICE USED",
" ------    ------------                           -----------",
" ABANDON   ABANDON                                shuttle craft",
" CA        CAPTURE                                subspace radio and transporter",
" C         CHART                                  (none)",
" CO        COMPUTER                               computer",
" CR        CRYSTALS                               (none)",
" DA        DAMAGES                                (none)",
" DEATHRAY  DEATHRAY                               (none)  ",
" DESTRUCT  DESTRUCT                               computer",
" D         DOCK                                   (none)",
" E         EMEXIT                                 (none)",
" FREEZE    FREEZE <FILE NAME>                     (none)",
" I         IMPULSE <MANUAL> <DISPLACEMENT>        impulse engines",
"           IMPULSE AUTOMATIC <DESTINATION>        impulse engines and computer",
" L         LRSCAN                                 long-range sensors",
" MAYDAY    MAYDAY (for help)                      subspace radio",
" MI        MINE                                   (none)",
" M         MOVE <MANUAL> <DISPLACEMENT>           warp engines",
"           MOVE AUTOMATIC <DESTINATION>           warp engines and computer",
" O         ORBIT                                  warp or impulse engines",
" P         PHASERS <TOTAL AMOUNT>                 phasers and computer",
"           PHASERS AUTOMATIC <TOTAL AMOUNT>       phasers, computer, sr sensors",
"           PHASERS MANUAL <AMT1> <AMT2> ...       phasers",
" TOR       TORPEDO <NUMBER> <TARGETS>             torpedo tubes ",
" PL        PLANETS                                (none)",
" PR        PROBE <ARMED> <MANUAL> <DISPLACEMENT>  probe launcher, radio ",
"           PROBE <ARMED> AUTOMATIC <DESTINATION>  launcher, radio, computer",
" REP       REPORT                                 (none)",
" REQ       REQUEST                                (none)",
" R         REST <NUMBER OF STARDATES>             (none)",
" QUIT      QUIT                                   (none)",
" S         SRSCAN <NO or CHART>                   short-range sensors",
" SE        SENSORS                                short-range sensors",
" SH        SHIELDS <UP, DOWN, or TRANSFER>        deflector shields",
" SHU       SHUTTLE                                shuttle craft",
" ST        STATUS                                 (none)",
" T         TRANSPORT                              transporter",
" W         WARP <FACTOR>                          (none)",
" CU        CURSES                                 (none)",
" OP        OPTIONS                                (none)",
" ",
" L. R. Scan:   thousands digit:   supernova",
"               hundreds digit:    Klingons",
"               tens digit:        starbases",
"               ones digit:        stars",
"               period (.):        digit not known (star chart only)",
"",
"Courses are given in manual mode in X - Y displacements; in automatic",
"    mode as destination quadrant and/or sector.  Manual mode is default.",
"Distances are given in quadrants.  A distance of one sector is 0.1 quadrant.",
"Ordinary Klingons have about 400 units of energy, Commanders about",
"    1200.  Romulans normally have about 800 units of energy, and the",
"    (GULP) \"Super-Commander\" has about 1800.",
"Phaser fire diminishes to about 60 percent at 5 sectors.  Up to 1500",
"    units may be fired in a single burst without danger of overheat.",
"Warp 6 is the fastest safe speed.  At higher speeds, engine damage",
"    may occur.  At warp 10 you may enter a time warp.",
"Shields cost 50 units of energy to raise, and double the power",
"    requirements of moving under warp drive.  Engaging the high-speed",
"    shield control requires 200 units of energy.",
"Warp drive requires (distance)*(warp factor cubed) units of energy",
"    to travel at a speed of (warp factor squared)/10 quadrants per stardate.",
"Impulse engines require 20 units to warm up, plus 100 units per",
"     quadrant.  Speed is just under one sector per stardate.",
"********"
];
/* ---------- The translated program ---------- */
var version,GALSIZE,NINHAB,MAXUNINHAB,QUADSIZE,BASEMIN,BASEMAX,MAXKLGAME,MAXKLQUAD,FULLCREW,FOREVER,MAXBURST,MAXCMDR,DOCKFAC,PHASEFAC,ALGERON,DEFAULT,BLACK,BLUE,GREEN,CYAN,RED,MAGENTA,BROWN,LIGHTGRAY,DARKGRAY,LIGHTBLUE,LIGHTGREEN,LIGHTCYAN,LIGHTRED,LIGHTMAGENTA,YELLOW,WHITE,OPTION_ALL,OPTION_TTY,OPTION_CURSES,OPTION_PLANETS,OPTION_BSDTREK,OPTION_THOLIAN,OPTION_SUPERCMDR,OPTION_PROBE,OPTION_MVBADDY,OPTION_RAMMING,OPTION_ALMY,OPTION_AUTOPASS,OPTION_BASE,OPTION_BLKHOLE,OPTION_SHOWME,OPTION_WORLDS,OPTION_AUTOSCAN,OPTION_COLOR,OPTION_CAPTURE,OPTION_CLOAK,OPTION_DOTFILL,OPTION_ALPHAMERIC,OPTION_IOMODES,option_names,DSRSENS,DLRSENS,DPHASER,DPHOTON,DLIFSUP,DWARPEN,DIMPULS,DSHIELD,DRADIO,DSHUTTL,DCOMPTR,DNAVSYS,DTRANSP,DSHCTRL,DDRAY,DDSP,DCLOAK,NDEVICES,SKILL_NONE,SKILL_NOVICE,SKILL_FAIR,SKILL_GOOD,SKILL_EXPERT,SKILL_EMERITUS,FSPY,FSNOVA,FTBEAM,FSNAP,FBATTAK,FCDBAS,FSCMOVE,FSCDBAS,FDSPROB,FDISTR,FENSLV,FREPRO,NEVENTS,FWON,FDEPLETE,FLIFESUP,FNRG,FBATTLE,FNEG3,FNOVA,FSNOVAED,FABANDN,FDILITHIUM,FMATERIALIZE,FPHASER,FLOST,FMINING,FDPLANET,FPNOVA,FSSC,FSTRACTOR,FDRAY,FTRIBBLE,FHOLE,FCREW,FCLOAK,rows,columns,linecount,NSYM,systnames,device,commands;
// !/usr/bin/env python3
// sst.py -- Super Star Trek 2K
// 
// SST2K is a Python translation of a C translation of a FORTRAN
// original dating back to 1973.  Beautiful Python it is not, but it
// works.  Translation by Eric S. Raymond; original game by David Matuszek
// and Paul Reynolds, with modifications by Don Smith, Tom Almy,
// Stas Sergeev, and Eric S. Raymond.
// 
// See the doc/HACKING file in the distribution for designers notes and advice
// on how to modify (and how not to modify!) this code.
// SPDX-FileCopyrightText: (C) Eric S. Raymond <esr@thyrsus.com>
// SPDX-License-Identifier: BSD-2-Clause
// This import only works on Unixes.  The intention is to enable
// Ctrl-P, Ctrl-N, and friends in Cmd.
version="2.10";
// Rolling our own LCG because Python changed its incompatibly in 3.2.
// Thus, we needed to have our own to be 2/3 polyglot; it will be
// helpful when and if we ever forward-port to another language.
// LCG PRNG parameters tested against
// Knuth vol. 2. by the authors of ADVENT
// if logfp:
// logfp.write("#withprob(%.2f) -> %s\n" % (p, v < p))
// if logfp:
// logfp.write("#integer%s -> %s\n" % (args, v))
// from [0, args[0])
// from [args[0], args[1])
// if logfp:
// logfp.write("#real%s -> %f\n" % (args, v))
// if logfp:
// logfp.write("#seed(%d)\n" % n)
GALSIZE=8; // Galaxy size in quadrants
NINHAB=$fdiv((GALSIZE*GALSIZE),2); // Number of inhabited worlds
MAXUNINHAB=10; // Maximum uninhabited worlds
QUADSIZE=10; // Quadrant size in sectors
BASEMIN=2; // Minimum starbases
BASEMAX=$fdiv((GALSIZE*GALSIZE),12); // Maximum starbases
MAXKLGAME=127; // Maximum Klingons per game
MAXKLQUAD=9; // Maximum Klingons per quadrant
FULLCREW=428; // Crew size. BSD Trek was 387, that's wrong
FOREVER=1e+30; // Time for the indefinite future
MAXBURST=3; // Max # of torps you can launch in one turn
MAXCMDR=10; // Maximum number of Klingon commanders
DOCKFAC=0.25; // Repair faster when docked
PHASEFAC=2; // Phaser attenuation factor
ALGERON=2311; // Date of the Treaty of Algeron
DEFAULT=(-1);
BLACK=0;
BLUE=1;
GREEN=2;
CYAN=3;
RED=4;
MAGENTA=5;
BROWN=6;
LIGHTGRAY=7;
DARKGRAY=8;
LIGHTBLUE=9;
LIGHTGREEN=10;
LIGHTCYAN=11;
LIGHTRED=12;
LIGHTMAGENTA=13;
YELLOW=14;
WHITE=15;
// PDCurses reserves pair zero for terminal defaults; use positive pair IDs.
function letterize(n){
  return $chr(($add($ord("a"),n)-1));
}
class Coord{
  constructor(x=null,y=null){
    this.i=x; // Row
    this.j=y; // Column
  }
  valid_quadrant(){
    return ((this.i!=null) && (this.j!=null) && (this.i>=0) && (this.i<GALSIZE) && (this.j>=0) && (this.j<GALSIZE));
  }
  valid_sector(){
    return ((this.i!=null) && (this.j!=null) && (this.i>=0) && (this.i<QUADSIZE) && (this.j>=0) && (this.j<QUADSIZE));
  }
  invalidate(){
    {const $v=null;this.i=$v;this.j=$v;}
  }
  __eq__(other){
    return ((other!=null) && $eq(this.i,other.i) && $eq(this.j,other.j));
  }
  __ne__(other){
    return ((other==null) || $ne(this.i,other.i) || $ne(this.j,other.j));
  }
  __add__(other){
    return new Coord($add(this.i,other.i),$add(this.j,other.j));
  }
  __sub__(other){
    return new Coord($sub(this.i,other.i),$sub(this.j,other.j));
  }
  __mul__(other){
    return new Coord($mul(this.i,other),$mul(this.j,other));
  }
  __rmul__(other){
    return new Coord($mul(this.i,other),$mul(this.j,other));
  }
  __div__(other){
    return new Coord($div(this.i,other),$div(this.j,other));
  }
  __truediv__(other){
    return new Coord($div(this.i,other),$div(this.j,other));
  }
  __floordiv__(other){
    return new Coord($fdiv(this.i,other),$fdiv(this.j,other));
  }
  __mod__(other){
    return new Coord($mod(this.i,other),$mod(this.j,other));
  }
  __rtruediv__(other){
    return new Coord($div(this.i,other),$div(this.j,other));
  }
  __rfloordiv__(other){
    return new Coord($fdiv(this.i,other),$fdiv(this.j,other));
  }
  roundtogrid(){
    return new Coord($int($round(this.i)),$int($round(this.j)));
  }
  distance(other=null){
    if(!$t(other)){
      other=new Coord(0,0);
    }
    return Math.sqrt($add($pow($sub(this.i,other.i),2),$pow($sub(this.j,other.j),2)));
  }
  bearing(){
    return (1.90985*Math.atan2(this.j,this.i));
  }
  sgn(){
    var s;
    s=new Coord();
    if((this.i==0)){
      s.i=0;
    }else if((this.i<0)){
      s.i=(-1);
    }else{
      s.i=1;
    }
    if((this.j==0)){
      s.j=0;
    }else if((this.j<0)){
      s.j=(-1);
    }else{
      s.j=1;
    }
    return s;
  }
  quadrant(){
    // print "Location %s -> %s" % (self, (self / QUADSIZE).roundtogrid())
    return $fdiv(this.roundtogrid(),QUADSIZE);
  }
  sector(){
    return $mod(this.roundtogrid(),QUADSIZE);
  }
  scatter(){
    var s;
    s=new Coord();
    s.i=$add(this.i,rnd.integer((-1),2));
    s.j=$add(this.j,rnd.integer((-1),2));
    return s;
  }
  __str__(){
    if(((this.i==null) || (this.j==null))){
      return "Nowhere";
    }
    if((game.options&OPTION_ALPHAMERIC)){
      return $add(letterize((this.i+1)),$str((this.j+1)));
    }
    return $fmt("%s - %s",[(this.i+1),(this.j+1)]);
  }
}
Coord.prototype.__repr__=Coord.prototype.__str__;
class Thingy{
  // Do not anger the Space Thingy!
  constructor(){
    this.location=new Coord();
  }
  at(q){
    return $eq([q.i,q.j],[this.location.i,this.location.j]);
  }
}
class Planet{
  constructor(){
    this.name=null; // string-valued if inhabited
    this.quadrant=new Coord(); // quadrant located
    this.pclass=null; // could be ""M", "N", "O", or "destroyed"
    this.crystals="absent"; // could be "mined", "present", "absent"
    this.known="unknown"; // could be "unknown", "known", "shuttle_down"
    this.inhabited=false; // is it inhabited?
  }
  __str__(){
    return this.name;
  }
}
class Quadrant{
  constructor(){
    this.stars=0;
    this.planet=null;
    this.starbase=false;
    this.klingons=0;
    this.romulans=0;
    this.supernova=false;
    this.charted=false;
    this.status="secure"; // Could be "secure", "distressed", "enslaved"
  }
  __str__(){
    return $fmt("<Quadrant: %(klingons)d>",this.__dict__);
  }
}
Quadrant.prototype.__repr__=Quadrant.prototype.__str__;
class Page{
  constructor(){
    this.stars=null;
    this.starbase=false;
    this.klingons=null;
    this.supernova=false; // known to the Enterprise
  }
  __repr__(){
    return $fmt("<%s,%s,%s>",[this.klingons,this.starbase,this.stars]);
  }
}
function fill2d(size,fillfun){
  var lst,i,j;
  // Fill an empty list in 2D.
  lst=[];
  for(i of $range(size)){
    lst.push([]);
    for(j of $range(size)){
      $g(lst,i).push(fillfun(i,j));
    }
  }
  return lst;
}
class Snapshot{
  constructor(){
    this.snap=false; // snapshot taken
    this.crew=0; // crew complement
    this.nscrem=0; // remaining super commanders
    this.starkl=0; // destroyed stars
    this.basekl=0; // destroyed bases
    this.nromrem=0; // Romulans remaining
    this.nplankl=0; // destroyed uninhabited planets
    this.nworldkl=0; // destroyed inhabited planets
    this.planets=[]; // Planet information
    this.date=0; // stardate
    this.remres=0; // remaining resources
    this.remtime=0; // remaining time
    this.baseq=[]; // Base quadrant coordinates
    this.kcmdr=[]; // Commander quadrant coordinates
    this.kscmdr=new Coord(); // Supercommander quadrant coordinates
    // the galaxy
    this.galaxy=fill2d(GALSIZE,((i_unused,j_unused)=>new Quadrant()));
    // the starchart
    this.chart=fill2d(GALSIZE,((i_unused,j_unused)=>new Page()));
  }
  *traverse(){
    var i,j;
    for(i of $range(GALSIZE)){
      for(j of $range(GALSIZE)){
        (yield [i,j,$g($g(this.galaxy,i),j)]);
      }
    }
  }
}
class Event{
  constructor(){
    this.date=null; // A real number
    this.quadrant=null; // A coord structure
  }
}
// game options
OPTION_ALL=4294967295;
OPTION_TTY=(1<<0); // old interface
OPTION_CURSES=(1<<1); // new interface
OPTION_PLANETS=(1<<2); // planets and mining (1974)
OPTION_BSDTREK=(1<<3); // BSD Trek features (>= 1976
OPTION_THOLIAN=(1<<4); // Tholians and their webs (UT 1979 version)
OPTION_SUPERCMDR=(1<<5); // Supercommanders (UT 1979 version)
OPTION_PROBE=(1<<6); // deep-space probes (DECUS version, 1980)
OPTION_MVBADDY=(1<<7); // more enemies can move (Almy, 1979?)
OPTION_RAMMING=(1<<8); // enemies may ram Enterprise (Almy, 1979?)
OPTION_ALMY=(1<<9); // Almy's death ray upgrade (1997?)
OPTION_AUTOPASS=(1<<10); // Autogenerate password (Almy, 1997?)
OPTION_BASE=(1<<11); // bases have good shields (Stas, 2005)
OPTION_BLKHOLE=(1<<12); // black hole may timewarp you (Stas, 2005)
OPTION_SHOWME=(1<<13); // bracket Enterprise in chart (ESR, 2005)
OPTION_WORLDS=(1<<14); // logic for inhabited worlds (ESR, 2006)
OPTION_AUTOSCAN=(1<<15); // automatic LRSCAN before CHART (ESR, 2006)
OPTION_COLOR=(1<<16); // enable color display (ESR, 2010)
OPTION_CAPTURE=(1<<17); // Enable BSD-Trek capture (Almy, 2013).
OPTION_CLOAK=(1<<18); // Enable BSD-Trek capture (Almy, 2013).
OPTION_DOTFILL=(1<<19); // fix dotfill glitch in chart (ESR, 2019)
OPTION_ALPHAMERIC=(1<<20); // Alpha Y coordinates (ESR, 2023)
OPTION_IOMODES=(OPTION_CURSES|OPTION_TTY); // cover both interfaces
option_names=new Map([["ALL",[OPTION_ALL,0]],["TTY",[OPTION_TTY,0]],["IOMODES",[OPTION_IOMODES,0]],["PLANETS",[OPTION_PLANETS,1974]],["BSDTREK",[OPTION_PLANETS,1976]],["THOLIAN",[OPTION_THOLIAN,1979]],["SUPERCMDR",[OPTION_SUPERCMDR,1979]],["PROBE",[OPTION_PROBE,1980]],["MVBADDY",[OPTION_MVBADDY,1981]],["RAMMING",[OPTION_RAMMING,1982]],["ALMY",[OPTION_ALMY,1997]],["AUTOPASS",[OPTION_AUTOPASS,1998]],["BASE",[OPTION_BASE,2004]],["BLKHOLE",[OPTION_BLKHOLE,2004]],["SHOWME",[OPTION_SHOWME,2005]],["WORLDS",[OPTION_WORLDS,2006]],["AUTOSCAN",[OPTION_AUTOSCAN,2007]],["COLOR",[OPTION_COLOR,2010]],["CAPTURE",[OPTION_CAPTURE,2013]],["CLOAK",[OPTION_CLOAK,2014]],["DOTFILL",[OPTION_DOTFILL,2019]],["ALPHAMERIC",[OPTION_ALPHAMERIC,2023]]]); // year bumped to make it distinct // year bumped to make it distinct // year bumped to make it distinct // year bumped to make it distinct // year bumped to make it distinct // year bumped to make it distinct // year bumped to make it distinct
// Define devices
DSRSENS=0;
DLRSENS=1;
DPHASER=2;
DPHOTON=3;
DLIFSUP=4;
DWARPEN=5;
DIMPULS=6;
DSHIELD=7;
DRADIO=8;
DSHUTTL=9;
DCOMPTR=10;
DNAVSYS=11;
DTRANSP=12;
DSHCTRL=13;
DDRAY=14;
DDSP=15;
DCLOAK=16;
NDEVICES=17; // Number of devices
SKILL_NONE=0;
SKILL_NOVICE=1;
SKILL_FAIR=2;
SKILL_GOOD=3;
SKILL_EXPERT=4;
SKILL_EMERITUS=5;
function damaged(dev){
  return ($g(game.damage,dev)!=0);
}
function communicating(){
  return (!damaged(DRADIO) || (game.condition==="docked"));
}
// Define future events
FSPY=0; // Spy event happens always (no future[] entry)
// can cause SC to tractor-beam Enterprise
FSNOVA=1; // Supernova
FTBEAM=2; // Commander tractor beams Enterprise
FSNAP=3; // Snapshot for time warp
FBATTAK=4; // Commander attacks base
FCDBAS=5; // Commander destroys base
FSCMOVE=6; // Supercommander moves (might attack base)
FSCDBAS=7; // Supercommander destroys base
FDSPROB=8; // Move deep space probe
FDISTR=9; // Emit distress call from an inhabited world
FENSLV=10; // Inhabited word is enslaved
FREPRO=11; // Klingons build a ship in an enslaved system
NEVENTS=12;
// Abstract out the event handling -- underlying data structures will change
// when we implement stateful events
function findevent(evtype){
  return $g(game.future,evtype);
}
class Enemy{
  constructor(etype=null,loc=null,power=null){
    this.type=etype;
    this.location=new Coord();
    this.kdist=null;
    this.kavgd=null;
    this.pending_remove=false;
    if($t(loc)){
      this.move(loc);
    }
    this.power=power; // enemy energy level
    game.enemies.push(this);
  }
  move(loc){
    var motion;
    motion=$ne(loc,this.location);
    if(((this.location.i!=null) && (this.location.j!=null))){
      if($t(motion)){
        if((this.type==="T")){
          $s($g(game.quad,this.location.i),this.location.j,"#");
        }else{
          $s($g(game.quad,this.location.i),this.location.j,".");
        }
      }
    }
    if($t(loc)){
      this.location=$copy(loc);
      $s($g(game.quad,this.location.i),this.location.j,this.type);
      {const $v=$sub(game.sector,loc).distance();this.kdist=$v;this.kavgd=$v;}
    }else{
      this.location=new Coord();
      {const $v=null;this.kdist=$v;this.kavgd=$v;}
      // Guard prevents failure on Tholian or thingy
      if($in(this,game.enemies)){
        $remove(game.enemies,this);
      }
    }
    return motion;
  }
  __repr__(){
    return $fmt("<%s,%s,%f>",[this.type,this.location,this.power]);
  }
}
class Gamestate{
  constructor(){
    var i;
    this.options=null; // Game options
    this.wayback_disabled=0; // Enabled options suppressed by Wayback
    this.state=new Snapshot(); // A snapshot structure
    this.snapsht=new Snapshot(); // Last snapshot taken for time-travel purposes
    this.quad=null; // contents of our quadrant
    this.damage=$mul([0],NDEVICES); // damage encountered
    this.future=[]; // future events
    i=NEVENTS;
    while((i>0)){
      i=(i-1);
      this.future.push(new Event());
    }
    this.passwd=null; // Self Destruct password
    this.enemies=[];
    this.quadrant=null; // where we are in the large
    this.sector=null; // where we are in the small
    this.tholian=null; // Tholian enemy object
    this.base=null; // position of base in current quadrant
    this.battle=null; // base coordinates being attacked
    this.plnet=null; // location of planet in quadrant
    this.gamewon=false; // Finished!
    this.ididit=false; // action taken -- allows enemy to attack
    this.alive=false; // we are alive (not killed)
    this.justin=false; // just entered quadrant
    this.shldup=false; // shields are up
    this.shldchg=false; // shield is changing (affects efficiency)
    this.iscate=false; // super commander is here
    this.ientesc=false; // attempted escape from supercommander
    this.resting=false; // rest time
    this.icraft=false; // Kirk in Galileo
    this.landed=false; // party on planet (true), on ship (false)
    this.alldone=false; // game is now finished
    this.neutz=false; // Romulan Neutral Zone
    this.isarmed=false; // probe is armed
    this.inorbit=false; // orbiting a planet
    this.imine=false; // mining
    this.icrystl=false; // dilithium crystals aboard
    this.iseenit=false; // seen base attack report
    this.thawed=false; // thawed game
    this.sandbox=false; // sandbox mode (no time limit)
    this.condition=null; // "green", "yellow", "red", "docked", "dead"
    this.iscraft=null; // "onship", "offship", "removed"
    this.skill=SKILL_NONE; // Player skill level
    this.inkling=0; // initial number of klingons
    this.inbase=0; // initial number of bases
    this.incom=0; // initial number of commanders
    this.inscom=0; // initial number of commanders
    this.inrom=0; // initial number of commanders
    this.instar=0; // initial stars
    this.intorps=0; // initial/max torpedoes
    this.torps=0; // number of torpedoes
    this.ship=0; // ship type -- 'E' is Enterprise
    this.abandoned=0; // count of crew abandoned in space
    this.length=0; // length of game
    this.klhere=0; // klingons here
    this.casual=0; // causalties
    this.nhelp=0; // calls for help
    this.nkinks=0; // count of energy-barrier crossings
    this.iplnet=null; // planet # in quadrant
    this.inplan=0; // initial planets
    this.irhere=0; // Romulans in quadrant
    this.isatb=0; // =2 if super commander is attacking base
    this.tourn=null; // tournament number
    this.nprobes=0; // number of probes available
    this.inresor=0; // initial resources
    this.intime=0; // initial time
    this.inenrg=0; // initial/max energy
    this.inshld=0; // initial/max shield
    this.inlsr=0; // initial life support resources
    this.indate=0; // initial date
    this.energy=0; // energy level
    this.shield=0; // shield level
    this.warpfac=0; // warp speed
    this.lsupres=0; // life support reserves
    this.optime=0; // time taken by current operation
    this.damfac=0; // damage factor
    this.lastchart=0; // time star chart was last updated
    this.cryprob=0; // probability that crystal will work
    this.probe=null; // object holding probe course info
    this.height=0; // height of orbit around planet
    this.score=0; // overall score
    this.perdate=0; // rate of kills
    this.idebug=false; // Debugging instrumentation enabled?
    this.cdebug=false; // Debugging instrumentation for curses enabled?
    this.brigcapacity=400; // Enterprise brig capacity
    this.brigfree=400; // How many klingons can we put in the brig?
    this.kcaptured=0; // Total Klingons captured, for scoring.
    this.iscloaked=false; // Cloaking device on?
    this.ncviol=0; // Algreon treaty violations
    this.isviolreported=false; // We have been warned
    this.lcg_x=0; // LCG generator value
  }
  remkl(){
    return $sum((()=>{const $r=[];for(const [_i,_j,q] of $iter($list(this.state.traverse()))){$r.push(q.klingons);}return $r})());
  }
  recompute(){
    // Stas thinks this should be (C expression):
    // game.remkl() + len(game.state.kcmdr) > 0 ?
    // game.state.remres/(game.remkl() + 4*len(game.state.kcmdr)) : 99
    // He says the existing expression is prone to divide-by-zero errors
    // after killing the last klingon when score is shown -- perhaps also
    // if the only remaining klingon is SCOM.
    if($t(this.sandbox)){
      this.state.remtime=9999;
      return;
    }
    this.state.remtime=$div(this.state.remres,$add(this.remkl(),(4*$len(this.state.kcmdr))));
  }
  unwon(){
    // Are there Klingons remaining?
    return this.remkl();
  }
}
FWON=0;
FDEPLETE=1;
FLIFESUP=2;
FNRG=3;
FBATTLE=4;
FNEG3=5;
FNOVA=6;
FSNOVAED=7;
FABANDN=8;
FDILITHIUM=9;
FMATERIALIZE=10;
FPHASER=11;
FLOST=12;
FMINING=13;
FDPLANET=14;
FPNOVA=15;
FSSC=16;
FSTRACTOR=17;
FDRAY=18;
FTRIBBLE=19;
FHOLE=20;
FCREW=21;
FCLOAK=22;
// Code from ai.c begins here
function welcoming(iq){
  // Would this quadrant welcome another Klingon?
  return (iq.valid_quadrant() && !$t($g($g(game.state.galaxy,iq.i),iq.j).supernova) && ($g($g(game.state.galaxy,iq.i),iq.j).klingons<MAXKLQUAD));
}
function tryexit(enemy,look,irun,defer_remove=false){
  var iq,oldloc,olddist;
  // A bad guy attempts to bug out.
  // Zero-based sectors cross a quadrant edge at -1 or QUADSIZE.
  iq=new Coord();
  iq.i=$add(game.quadrant.i,$fdiv(look.i,QUADSIZE));
  iq.j=$add(game.quadrant.j,$fdiv(look.j,QUADSIZE));
  if(!welcoming(iq)){
    return [];
  }
  if((enemy.type==="R")){
    return []; // Romulans cannot escape!
  }
  if(!$t(irun)){
    // avoid intruding on another commander's territory
    if((enemy.type==="C")){
      if($in(iq,game.state.kcmdr)){
        return [];
      }
      // refuse to leave if currently attacking starbase
      if($eq(game.battle,game.quadrant)){
        return [];
      }
    }
    // don't leave if over 1000 units of energy
    if((enemy.power>1000)){
      return [];
    }
  }
  oldloc=$copy(enemy.location);
  // handle local matters related to escape
  if($t(defer_remove)){
    if(((enemy.location.i!=null) && (enemy.location.j!=null))){
      if((enemy.type==="T")){
        $s($g(game.quad,enemy.location.i),enemy.location.j,"#");
      }else{
        $s($g(game.quad,enemy.location.i),enemy.location.j,".");
      }
    }
    enemy.location=new Coord();
    {const $v=null;enemy.kdist=$v;enemy.kavgd=$v;}
    enemy.pending_remove=true;
  }else{
    enemy.move(null);
  }
  game.klhere=(game.klhere-1);
  if((game.condition!=="docked")){
    newcnd();
  }
  // Handle global matters related to escape
  $g($g(game.state.galaxy,game.quadrant.i),game.quadrant.j).klingons=($g($g(game.state.galaxy,game.quadrant.i),game.quadrant.j).klingons-1);
  $g($g(game.state.galaxy,iq.i),iq.j).klingons=($g($g(game.state.galaxy,iq.i),iq.j).klingons+1);
  if((enemy.type==="S")){
    game.iscate=false;
    game.ientesc=false;
    game.isatb=0;
    schedule(FSCMOVE,0.2777);
    unschedule(FSCDBAS);
    game.state.kscmdr=iq;
  }else if(((enemy.type==="C") && $in(game.quadrant,game.state.kcmdr))){
    // Relocate the commander without changing its index or the total count.
    $s(game.state.kcmdr,$index(game.state.kcmdr,game.quadrant),iq);
  }
  // report move out of quadrant.
  olddist=enemy.kdist;
  return [[true,enemy,oldloc,olddist,iq]];
}
// The bad-guy movement algorithm:
// 
// 1. Enterprise has "force" based on condition of phaser and photon torpedoes.
// If both are operating full strength, force is 1000. If both are damaged,
// force is -1000. Having shields down subtracts an additional 1000.
// 
// 2. Enemy has forces equal to the energy of the attacker plus
// 100*(K+R) + 500*(C+S) - 400 for novice through good levels OR
// 346*K + 400*R + 500*(C+S) - 400 for expert and emeritus.
// 
// Attacker Initial energy levels (nominal):
// Klingon   Romulan   Commander   Super-Commander
// Novice    400        700        1200
// Fair      425        750        1250
// Good      450        800        1300        1750
// Expert    475        850        1350        1875
// Emeritus  500        900        1400        2000
// VARIANCE   75        200         200         200
// 
// Enemy vessels only move prior to their attack. In Novice - Good games
// only commanders move. In Expert games, all enemy vessels move if there
// is a commander present. In Emeritus games all enemy vessels move.
// 
// 3. If Enterprise is not docked, an aggressive action is taken if enemy
// forces are 1000 greater than Enterprise.
// 
// Agressive action on average cuts the distance between the ship and
// the enemy to 1/4 the original.
// 
// 4.  At lower energy advantage, movement units are proportional to the
// advantage with a 650 advantage being to hold ground, 800 to move forward
// 1, 950 for two, 150 for back 4, etc. Variance of 100.
// 
// If docked, is reduced by roughly 1.75*game.skill, generally forcing a
// retreat, especially at high skill levels.
// 
// 5.  Motion is limited to skill level, except for SC hi-tailing it out.
function* movebaddy(enemy){
  var goto,look,irun,old_dist,mdist,nsteps,m,ll,oldloc,nbaddys,motion,forces,success,attempts,krawli,krawlj;
  // Tactical movement for the bad guys.
  goto=new Coord();
  look=new Coord();
  irun=false;
  // This should probably be just (game.quadrant in game.state.kcmdr) + (game.state.kscmdr==game.quadrant)
  if((game.skill>=SKILL_EXPERT)){
    nbaddys=$int($div($add($add($add($mul($in(game.quadrant,game.state.kcmdr),2),$mul($eq(game.state.kscmdr,game.quadrant),2)),$mul(game.klhere,1.23)),$mul(game.irhere,1.5)),2));
  }else{
    nbaddys=$add($in(game.quadrant,game.state.kcmdr),$eq(game.state.kscmdr,game.quadrant));
  }
  old_dist=enemy.kdist;
  mdist=$int((old_dist+0.5)); // Nearest integer distance
  // If SC, check with spy to see if should hi-tail it
  if(((enemy.type==="S") && ((enemy.power<=500) || ((game.condition==="docked") && !damaged(DPHOTON))))){
    irun=true;
    motion=(-QUADSIZE);
  }else{
    // decide whether to advance, retreat, or hold position
    forces=$add($add(enemy.power,(100*$len(game.enemies))),$mul(400,(nbaddys-1)));
    if(!$t(game.shldup)){
      forces=(forces+1000); // Good for enemy if shield is down!
    }
    if((!damaged(DPHASER) || !damaged(DPHOTON))){
      if(damaged(DPHASER)){
        forces=(forces+300);
      }else{
        forces=$sub(forces,$mul(0.2,(game.energy-2500)));
      }
      if(damaged(DPHOTON)){
        forces=(forces+300);
      }else{
        forces=$sub(forces,$mul(50,game.torps));
      }
    }else{
      // phasers and photon tubes both out!
      forces=(forces+1000);
    }
    motion=0;
    if(((forces<=1000) && (game.condition!=="docked"))){
      motion=($div($add(forces,rnd.real(200)),150)-5);
    }else{
      if((forces>1000)){
        motion=($mul($pow((1-rnd.real()),2),old_dist)+1);
      }
      if(((game.condition==="docked") && (game.options&OPTION_BASE))){
        // protected by base -- back off !
        motion=$sub(motion,$mul(game.skill,(2-$pow(rnd.real(),2))));
      }
    }
    if($t(game.idebug)){
      proutn($fmt("=== MOTION = %d, FORCES = %1.2f, ",[motion,forces]));
    }
    // don't move if no motion
    if((motion==0)){
      return [];
    }
    // Limit motion according to skill
    if(($abs(motion)>game.skill)){
      if((motion<0)){
        motion=(-game.skill);
      }else{
        motion=game.skill;
      }
    }
  }
  // calculate preferred number of steps
  nsteps=$abs($int(motion));
  if(((motion>0) && (nsteps>mdist))){
    nsteps=mdist; // don't overshoot
  }
  nsteps=$min(nsteps,QUADSIZE); // This shouldn't be necessary
  nsteps=$max(nsteps,1); // This shouldn't be necessary
  if($t(game.idebug)){
    proutn($fmt("NSTEPS = %d:",nsteps));
  }
  // Compute preferred values of delta X and Y
  m=$sub(game.sector,enemy.location);
  if(((2*$abs(m.i))<$abs(m.j))){
    m.i=0;
  }
  if(((2*$abs(m.j))<$abs($sub(game.sector.i,enemy.location.i)))){
    m.j=0;
  }
  m=$mul(motion,m).sgn();
  goto=enemy.location;
  // main move loop
  for(ll of $range(nsteps)){
    if($t(game.idebug)){
      proutn($fmt(" %d",(ll+1)));
    }
    // Check if preferred position available
    look=$add(goto,m);
    if((m.i<0)){
      krawli=1;
    }else{
      krawli=(-1);
    }
    if((m.j<0)){
      krawlj=1;
    }else{
      krawlj=(-1);
    }
    success=false;
    attempts=0; // Settle mysterious hang problem
    while(((attempts<20) && !$t(success))){
      attempts=(attempts+1);
      if(((look.i<0) || (look.i>=QUADSIZE))){
        if((motion<0)){
          return tryexit(enemy,look,irun,true);
        }
        if(($eq(krawli,m.i) || (m.j==0))){
          break;
        }
        look.i=$add(goto.i,krawli);
        krawli=(-krawli);
      }else if(((look.j<0) || (look.j>=QUADSIZE))){
        if((motion<0)){
          return tryexit(enemy,look,irun,true);
        }
        if(($eq(krawlj,m.j) || (m.i==0))){
          break;
        }
        look.j=$add(goto.j,krawlj);
        krawlj=(-krawlj);
      }else if(((game.options&OPTION_RAMMING) && ($g($g(game.quad,look.i),look.j)!=="."))){
        // See if enemy should ram ship
        if(($eq($g($g(game.quad,look.i),look.j),game.ship) && $in(enemy.type,["C","S"]))){
          (yield* collision(true,enemy));
          return [];
        }
        if(($ne(krawli,m.i) && (m.j!=0))){
          look.i=$add(goto.i,krawli);
          krawli=(-krawli);
        }else if(($ne(krawlj,m.j) && (m.i!=0))){
          look.j=$add(goto.j,krawlj);
          krawlj=(-krawlj);
        }else{
          break;
        }
      }else{
        // we have failed
        success=true;
      }
    }
    if($t(success)){
      goto=look;
      if($t(game.idebug)){
        proutn($repr(goto));
      }
    }else{
      break;
    }
  }
  // done early
  if($t(game.idebug)){
    (yield* skip(1));
  }
  // Enemy moved, but is still in sector
  oldloc=$copy(enemy.location);
  return [[false,enemy,oldloc,old_dist,goto]];
}
function* moveklings(){
  var tacmoves,enemy;
  // Sequence Klingon tactical movement.
  if($t(game.idebug)){
    (yield* prout("== MOVCOM"));
  }
  // Figure out which Klingon is the commander (or Supercommander)
  // and do move
  tacmoves=[];
  if($in(game.quadrant,game.state.kcmdr)){
    for(enemy of $iter(game.enemies)){
      if((enemy.type==="C")){
        tacmoves=$add(tacmoves,(yield* movebaddy(enemy)));
      }
    }
  }
  if($eq(game.state.kscmdr,game.quadrant)){
    for(enemy of $iter(game.enemies)){
      if((enemy.type==="S")){
        tacmoves=$add(tacmoves,(yield* movebaddy(enemy)));
        break;
      }
    }
  }
  // If skill level is high, move other Klingons and Romulans too!
  // Move these last so they can base their actions on what the
  // commander(s) do.
  if(((game.skill>=SKILL_EXPERT) && (game.options&OPTION_MVBADDY))){
    for(enemy of $iter(game.enemies)){
      if($in(enemy.type,["K","R"])){
        tacmoves=$add(tacmoves,(yield* movebaddy(enemy)));
      }
    }
  }
  if($t($any((()=>{const $r=[];for(const e of $iter(game.enemies)){$r.push(e.pending_remove);}return $r})()))){
    game.enemies=(()=>{const $r=[];for(const e of $iter(game.enemies)){if(!$t(e.pending_remove)){$r.push(e);}}return $r})();
  }
  return tacmoves;
}
function* movescom(iq,avoid){
  var was_here,i,enemy;
  // Supercommander movement helper.
  // Strategic movement must not enter the Enterprise's quadrant.
  if($eq(iq,game.quadrant)){
    return false;
  }
  // Avoid quadrants with bases if we want to avoid Enterprise
  if((!welcoming(iq) || ($t(avoid) && $in(iq,game.state.baseq)))){
    return false;
  }
  if(($t(game.justin) && !$t(game.iscate))){
    return false;
  }
  // Remember the source before updating the Supercommander's galaxy location.
  was_here=$eq(game.state.kscmdr,game.quadrant);
  $g($g(game.state.galaxy,game.state.kscmdr.i),game.state.kscmdr.j).klingons=($g($g(game.state.galaxy,game.state.kscmdr.i),game.state.kscmdr.j).klingons-1);
  game.state.kscmdr=iq;
  $g($g(game.state.galaxy,game.state.kscmdr.i),game.state.kscmdr.j).klingons=($g($g(game.state.galaxy,game.state.kscmdr.i),game.state.kscmdr.j).klingons+1);
  if($t(was_here)){
    // SC has scooted, remove him from current quadrant
    game.iscate=false;
    game.isatb=0;
    game.ientesc=false;
    unschedule(FSCDBAS);
    for(enemy of $iter(game.enemies)){
      if((enemy.type==="S")){
        enemy.move(null);
        break;
      }
    }
    game.klhere=(game.klhere-1);
    if((game.condition!=="docked")){
      newcnd();
    }
    sortenemies();
  }
  // check for a helpful planet
  for(i of $range(game.inplan)){
    if(($eq($g(game.state.planets,i).quadrant,game.state.kscmdr) && ($g(game.state.planets,i).crystals==="present"))){
      // destroy the planet
      $g(game.state.planets,i).pclass="destroyed";
      $g($g(game.state.galaxy,game.state.kscmdr.i),game.state.kscmdr.j).planet=null;
      if(communicating()){
        (yield* announce());
        (yield* prout("Lt. Uhura-  \"Captain, Starfleet Intelligence reports"));
        (yield* prout($fmt("   a planet in Quadrant %s has been destroyed",game.state.kscmdr)));
        (yield* prout("   by the Super-commander.\""));
      }
      break;
    }
  }
  return true; // looks good!
}
function* supercommander(){
  var iq,sc,ibq,idelta,basetbl,avoid,i,base,ifindit,iwhichb,i2,cmdr;
  // Move the Super Commander.
  iq=new Coord();
  sc=new Coord();
  ibq=new Coord();
  idelta=new Coord();
  basetbl=[];
  if($t(game.idebug)){
    (yield* prout("== SUPERCOMMANDER"));
  }
  // Decide on being active or passive
  avoid=(($div($sub($add($sub(game.incom,$len(game.state.kcmdr)),game.inkling),game.remkl()),$sub((game.state.date+0.01),game.indate))<$mul($mul(0.1,game.skill),(game.skill+1))) || ($sub(game.state.date,game.indate)<3));
  if((!$t(game.iscate) && $t(avoid))){
    // compute move away from Enterprise
    idelta=$sub(game.state.kscmdr,game.quadrant);
    if((idelta.distance()>2)){
      // circulate in space
      idelta.i=$sub(game.state.kscmdr.j,game.quadrant.j);
      idelta.j=$sub(game.quadrant.i,game.state.kscmdr.i);
    }
  }else{
    // compute distances to starbases
    if(!$t(game.state.baseq)){
      // nothing left to do
      unschedule(FSCMOVE);
      return;
    }
    sc=game.state.kscmdr;
    for([i,base] of $iter($enumerate(game.state.baseq))){
      basetbl.push([i,$sub(base,sc).distance()]);
    }
    if(($len(game.state.baseq)>1)){
      $sort(basetbl,((x)=>$g(x,1)),false);
    }
    // look for nearest base without a commander, no Enterprise, and
    // without too many Klingons, and not already under attack.
    {const $v=0;ifindit=$v;iwhichb=$v;}
    for([i2,base] of $iter($enumerate(game.state.baseq))){
      i=$g($g(basetbl,i2),0); // bug in original had it not finding nearest
      if(($eq(base,game.quadrant) || $eq(base,game.battle) || !welcoming(base))){
        continue;
      }
      // if there is a commander, and no other base is appropriate,
      // we will take the one with the commander
      var $else1071=true;
      for(cmdr of $iter(game.state.kcmdr)){
        if(($eq(base,cmdr) && (ifindit!=2))){
          ifindit=2;
          iwhichb=i;
          $else1071=false;
          break;
        }
      }
      if($else1071){
        // no commander -- use this one
        ifindit=1;
        iwhichb=i;
        break;
      }
    }
    if((ifindit==0)){
      return; // Nothing suitable -- wait until next time
    }
    ibq=$g(game.state.baseq,iwhichb);
    // decide how to move toward base
    idelta=$sub(ibq,game.state.kscmdr);
  }
  // Maximum movement is 1 quadrant in either or both axes
  idelta=idelta.sgn();
  // try moving in both x and y directions
  // there was what looked like a bug in the Almy C code here,
  // but it might be this translation is just wrong.
  iq=$add(game.state.kscmdr,idelta);
  if(!$t((yield* movescom(iq,avoid)))){
    // failed -- try some other maneuvers
    if(((idelta.i==0) || (idelta.j==0))){
      // attempt angle move
      if((idelta.i!=0)){
        iq.j=(game.state.kscmdr.j+1);
        if(!$t((yield* movescom(iq,avoid)))){
          iq.j=(game.state.kscmdr.j-1);
          (yield* movescom(iq,avoid));
        }
      }else if((idelta.j!=0)){
        iq.i=(game.state.kscmdr.i+1);
        if(!$t((yield* movescom(iq,avoid)))){
          iq.i=(game.state.kscmdr.i-1);
          (yield* movescom(iq,avoid));
        }
      }
    }else{
      // try moving just in x or y
      iq.j=game.state.kscmdr.j;
      if(!$t((yield* movescom(iq,avoid)))){
        iq.j=$add(game.state.kscmdr.j,idelta.j);
        iq.i=game.state.kscmdr.i;
        (yield* movescom(iq,avoid));
      }
    }
  }
  // check for a base
  if(($len(game.state.baseq)==0)){
    unschedule(FSCMOVE);
  }else{
    for(ibq of $iter(game.state.baseq)){
      if(($eq(ibq,game.state.kscmdr) && $ne(game.state.kscmdr,game.battle))){
        // Attack unless a commander is already attacking this base.
        if($t(avoid)){
          return; // no, don't attack base!
        }
        game.iseenit=false;
        game.isatb=1;
        schedule(FSCDBAS,rnd.real(1,3));
        if($t(is_scheduled(FCDBAS))){
          postpone(FSCDBAS,$sub(scheduled(FCDBAS),game.state.date));
        }
        if(!communicating()){
          return; // no warning
        }
        game.iseenit=true;
        (yield* announce());
        (yield* prout($fmt("Lt. Uhura-  \"Captain, the starbase in Quadrant %s",game.state.kscmdr)));
        (yield* prout("   reports that it is under attack from the Klingon Super-commander."));
        (yield* prout($fmt("   It can survive until stardate %d.\"",$int(scheduled(FSCDBAS)))));
        if(!$t(game.resting)){
          return;
        }
        (yield* prout("Mr. Spock-  \"Captain, shall we cancel the rest period?\""));
        if(!(yield* ja())){
          return;
        }
        game.resting=false;
        game.optime=0; // actually finished
        return;
      }
    }
  }
  // Check for intelligence report
  if((!$t(game.idebug) && (rnd.withprob(0.8) || !communicating() || !$t($g($g(game.state.galaxy,game.state.kscmdr.i),game.state.kscmdr.j).charted)))){
    return;
  }
  (yield* announce());
  (yield* prout("Lt. Uhura-  \"Captain, Starfleet Intelligence reports"));
  (yield* prout($fmt("   the Super-commander is in Quadrant %s.",game.state.kscmdr)));
  return;
}
function* movetholian(){
  var tid,here,delta,i;
  // Move the Tholian.
  if((!$t(game.tholian) || $t(game.justin))){
    return;
  }
  tid=new Coord();
  if(((game.tholian.location.i==0) && (game.tholian.location.j==0))){
    tid.i=0;
    tid.j=(QUADSIZE-1);
  }else if(((game.tholian.location.i==0) && $eq(game.tholian.location.j,(QUADSIZE-1)))){
    tid.i=(QUADSIZE-1);
    tid.j=(QUADSIZE-1);
  }else if(($eq(game.tholian.location.i,(QUADSIZE-1)) && $eq(game.tholian.location.j,(QUADSIZE-1)))){
    tid.i=(QUADSIZE-1);
    tid.j=0;
  }else if(($eq(game.tholian.location.i,(QUADSIZE-1)) && (game.tholian.location.j==0))){
    tid.i=0;
    tid.j=0;
  }else{
    // something is wrong!
    game.tholian.move(null);
    (yield* prout("***Internal error: Tholian in a bad spot."));
    return;
  }
  // do nothing if we are blocked
  if(!$in($g($g(game.quad,tid.i),tid.j),[".","#"])){
    return;
  }
  here=$copy(game.tholian.location);
  delta=$sub(tid,game.tholian.location).sgn();
  // move in x axis
  while($ne(here.i,tid.i)){
    here.i=$add(here.i,delta.i);
    if(($g($g(game.quad,here.i),here.j)===".")){
      game.tholian.move(here);
    }
  }
  // move in y axis
  while($ne(here.j,tid.j)){
    here.j=$add(here.j,delta.j);
    if(($g($g(game.quad,here.i),here.j)===".")){
      game.tholian.move(here);
    }
  }
  // check to see if all holes plugged
  for(i of $range(QUADSIZE)){
    if((($g($g(game.quad,0),i)!=="#") && ($g($g(game.quad,0),i)!=="T"))){
      return;
    }
    if((($g($g(game.quad,(QUADSIZE-1)),i)!=="#") && ($g($g(game.quad,(QUADSIZE-1)),i)!=="T"))){
      return;
    }
    if((($g($g(game.quad,i),0)!=="#") && ($g($g(game.quad,i),0)!=="T"))){
      return;
    }
    if((($g($g(game.quad,i),(QUADSIZE-1))!=="#") && ($g($g(game.quad,i),(QUADSIZE-1))!=="T"))){
      return;
    }
  }
  // All plugged up -- Tholian splits
  $s($g(game.quad,game.tholian.location.i),game.tholian.location.j,"#");
  dropin(" ");
  (yield* prout($add(crmena(true,"T","sector",game.tholian)," completes web.")));
  game.tholian.move(null);
  return;
}
// Code from battle.c begins here
function* cloak(){
  var key,action;
  // Change cloaking-device status.
  if((game.ship==="F")){
    (yield* prout("Ye Faerie Queene hath no cloaking device."));
    return;
  }
  key=(yield* scanner.nexttok());
  if((key==="IHREAL")){
    (yield* huh());
    return;
  }
  action=null;
  if((key==="IHALPHA")){
    if(scanner.sees("on")){
      if($t(game.iscloaked)){
        (yield* prout("The cloaking device has already been switched on."));
        return;
      }
      action="CLON";
    }else if(scanner.sees("off")){
      if(!$t(game.iscloaked)){
        (yield* prout("The cloaking device has already been switched off."));
        return;
      }
      action="CLOFF";
    }else{
      (yield* huh());
      return;
    }
  }else if(!$t(game.iscloaked)){
    proutn("Switch cloaking device on? ");
    if(!(yield* ja())){
      return;
    }
    action="CLON";
  }else{
    proutn("Switch cloaking device off? ");
    if(!(yield* ja())){
      return;
    }
    action="CLOFF";
  }
  if((action==null)){
    return;
  }
  if((action==="CLOFF")){
    if(($t(game.irhere) && (game.state.date>=ALGERON) && !$t(game.isviolreported))){
      (yield* prout("Spock- \"Captain, the Treaty of Algeron is in effect.\n   Are you sure this is wise?\""));
      if(!(yield* ja())){
        return;
      }
    }
    (yield* prout("Engineer Scott- \"Aye, Sir.\""));
    game.iscloaked=false;
    if(($t(game.irhere) && (game.state.date>=ALGERON) && !$t(game.isviolreported))){
      (yield* prout("The Romulan ship discovers you are breaking the Treaty of Algeron!"));
      game.ncviol=(game.ncviol+1);
      game.isviolreported=true;
      // if (neutz and game.state.date >= ALGERON) finish(FCLOAK);
      return;
    }
  }
  if((action==="CLON")){
    if(damaged(DCLOAK)){
      (yield* prout("Engineer Scott- \"The cloaking device is damaged, Sir.\""));
      return;
    }
    if((game.condition==="docked")){
      (yield* prout("You cannot cloak while docked."));
    }
    if(((game.state.date>=ALGERON) && !$t(game.isviolreported))){
      (yield* prout("Spock- \"Captain, using the cloaking device is a violation"));
      (yield* prout("  of the Treaty of Algeron. Considering the alternatives,"));
      proutn("  are you sure this is wise? ");
      if(!(yield* ja())){
        return;
      }
    }
    (yield* prout("Engineer Scott- \"Cloaking device has engaging, Sir...\""));
    (yield* attack(true));
    (yield* prout("Engineer Scott- \"Cloaking device has engaged, Sir.\""));
    game.iscloaked=true;
    if(($t(game.irhere) && (game.state.date>=ALGERON) && !$t(game.isviolreported))){
      (yield* prout("The Romulan ship discovers you are breaking the Treaty of Algeron!"));
      game.ncviol=(game.ncviol+1);
      game.isviolreported=true;
    }
  }
}
function* doshield(shraise){
  var action,key,nrg;
  // Change shield status.
  action="NONE";
  game.ididit=false;
  if($t(shraise)){
    action="SHUP";
  }else{
    key=(yield* scanner.nexttok());
    if((key==="IHALPHA")){
      if(scanner.sees("transfer")){
        action="NRG";
      }else{
        if(damaged(DSHIELD)){
          (yield* prout("Shields damaged and down."));
          return;
        }
        if(scanner.sees("up")){
          action="SHUP";
        }else if(scanner.sees("down")){
          action="SHDN";
        }
      }
    }
    if((action==="NONE")){
      proutn("Do you wish to change shield energy? ");
      if((yield* ja())){
        action="NRG";
      }else if(damaged(DSHIELD)){
        (yield* prout("Shields damaged and down."));
        return;
      }else if($t(game.shldup)){
        proutn("Shields are up. Do you want them down? ");
        if((yield* ja())){
          action="SHDN";
        }else{
          scanner.chew();
          return;
        }
      }else{
        proutn("Shields are down. Do you want them up? ");
        if((yield* ja())){
          action="SHUP";
        }else{
          scanner.chew();
          return;
        }
      }
    }
  }
  if((action==="SHUP")){
    if($t(game.shldup)){
      (yield* prout("Shields already up."));
      return;
    }
    game.shldup=true;
    game.shldchg=true;
    if((game.condition!=="docked")){
      game.energy=(game.energy-50);
    }
    (yield* prout("Shields raised."));
    if((game.energy<=0)){
      (yield* skip(1));
      (yield* prout("Shields raising uses up last of energy."));
      (yield* finish(FNRG));
      return;
    }
    game.ididit=true;
    return;
  }else if((action==="SHDN")){
    if(!$t(game.shldup)){
      (yield* prout("Shields already down."));
      return;
    }
    game.shldup=false;
    game.shldchg=true;
    (yield* prout("Shields lowered."));
    game.ididit=true;
    return;
  }else if((action==="NRG")){
    while(((yield* scanner.nexttok())!=="IHREAL")){
      scanner.chew();
      proutn("Energy to transfer to shields- ");
    }
    nrg=scanner.real;
    scanner.chew();
    if((nrg==0)){
      return;
    }
    if((nrg>game.energy)){
      (yield* prout("Insufficient ship energy."));
      return;
    }
    game.ididit=true;
    if(($add(game.shield,nrg)>=game.inshld)){
      (yield* prout("Shield energy maximized."));
      if(($add(game.shield,nrg)>game.inshld)){
        (yield* prout("Excess energy requested returned to ship energy"));
      }
      game.energy=$sub(game.energy,$sub(game.inshld,game.shield));
      game.shield=game.inshld;
      return;
    }
    if(((nrg<0) && ($sub(game.energy,nrg)>game.inenrg))){
      // Prevent shield drain loophole
      (yield* skip(1));
      (yield* prout("Engineering to bridge--"));
      (yield* prout("  Scott here. Power circuit problem, Captain."));
      (yield* prout("  I can't drain the shields."));
      game.ididit=false;
      return;
    }
    if(($add(game.shield,nrg)<0)){
      (yield* prout("All shield energy transferred to ship."));
      game.energy=$add(game.energy,game.shield);
      game.shield=0;
      return;
    }
    proutn("Scotty- \"");
    if((nrg>0)){
      (yield* prout("Transferring energy to shields.\""));
    }else{
      (yield* prout("Draining energy from shields.\""));
    }
    game.shield=$add(game.shield,nrg);
    game.energy=$sub(game.energy,nrg);
    return;
  }
}
function randdevice(){
  var weights,idx,wsum,i,w;
  // Choose a device to damage, at random.
  weights=[105,105,120,120,25,65,70,135,30,45,15,20,75,20,10,30,10]; // DSRSENS: short range scanners         10.5% // DLRSENS: long range scanners          10.5% // DPHASER: phasers                      12.0% // DPHOTON: photon torpedoes             12.0% // DLIFSUP: life support                  2.5% // DWARPEN: warp drive                    6.5% // DIMPULS: impulse engines               6.5% // DSHIELD: deflector shields            13.5% // DRADIO:  subspace radio                3.0% // DSHUTTL: shuttle                       4.5% // DCOMPTR: computer                      1.5% // NAVCOMP: navigation system             2.0% // DTRANSP: transporter                   7.5% // DSHCTRL: high-speed shield controller  2.0% // DDRAY: death ray                       1.0% // DDSP: deep-space probes                3.0% // DCLOAK: the cloaking device            1.0
  idx=rnd.integer(1000);
  wsum=0;
  for([i,w] of $iter($enumerate(weights))){
    wsum=$add(wsum,w);
    if((idx<wsum)){
      return i;
    }
  }
  return null;
}
function* collision(rammed,enemy){
  var hardness,icas,ncrits,dev,extradm;
  // Collision handling for ramming events.
  prouts("***RED ALERT!  RED ALERT!");
  (yield* skip(1));
  (yield* prout("***COLLISION IMMINENT."));
  (yield* skip(2));
  proutn("***");
  proutn(crmshp());
  hardness=$get(new Map([["R",1.5],["C",2],["S",2.5],["T",0.5],["?",4]]),enemy.type,1);
  if($t(rammed)){
    proutn(" rammed by ");
  }else{
    proutn(" rams ");
  }
  proutn(crmena(false,enemy.type,"sector",enemy.location));
  if($t(rammed)){
    proutn(" (original position)");
  }
  (yield* skip(1));
  (yield* deadkl(enemy.location,enemy.type,game.sector));
  (yield* prout($add($add("***",crmshp())," heavily damaged.")));
  icas=rnd.integer(10,30);
  (yield* prout($fmt("***Sickbay reports %d casualties",icas)));
  game.casual=$add(game.casual,icas);
  game.state.crew=$sub(game.state.crew,icas);
  // In the pre-SST2K versions, all devices got equiprobably damaged,
  // which was silly.  Instead, pick up to half the devices at
  // random according to our weighting table,
  ncrits=rnd.integer($fdiv(NDEVICES,2));
  while((ncrits>0)){
    ncrits=(ncrits-1);
    dev=randdevice();
    if(($g(game.damage,dev)<0)){
      continue;
    }
    extradm=$mul(($mul($mul(10,hardness),rnd.real())+1),game.damfac);
    // Damage for at least time of travel!
    $s(game.damage,dev,$add($g(game.damage,dev),$add(game.optime,extradm)));
  }
  game.shldup=false;
  (yield* prout("***Shields are down."));
  if(game.unwon()){
    (yield* announce());
    (yield* damagereport());
  }else{
    (yield* finish(FWON));
  }
}
function* torpedo(origin,bearing,dispersion,number,nburst){
  var ac,bullseye,track,bumpto,step,w,iquad,hit,displacement,enemy,kp,h1,tenemy;
  // Let a photon torpedo fly
  if((!damaged(DSRSENS) || (game.condition==="docked"))){
  }
  ac=$add(bearing,$mul(0.25,dispersion)); // dispersion is a random variable
  bullseye=$mul((15-bearing),0.5235988);
  track=new course(ac,QUADSIZE,cartesian(origin));
  bumpto=new Coord(0,0);
  // Loop to move a single torpedo
  for(step of $range(1,(QUADSIZE*2))){
    if(!track.nextstep()){
      break;
    }
    w=track.sector();
    if(!w.valid_sector()){
      break;
    }
    iquad=$g($g(game.quad,w.i),w.j);
    (yield* tracktorpedo(w,step,number,nburst,iquad));
    if((iquad===".")){
      continue;
    }
    // hit something
    if((!damaged(DSRSENS) || (game.condition==="docked"))){
      (yield* skip(1)); // start new line after text track
    }
    if($in(iquad,["E","F"])){
      (yield* skip(1));
      (yield* prout($fmt("Torpedo hits %s.",crmshp())));
      hit=$sub((700+rnd.real(100)),$mul($mul(1000,$sub(w,origin).distance()),$abs(Math.sin($sub(bullseye,track.angle)))));
      newcnd(); // we're blown out of dock
      if(($t(game.landed) || (game.condition==="docked"))){
        return hit; // Cheat if on a planet
      }
      // In the C/FORTRAN version, dispersion was 2.5 radians, which
      // is 143 degrees, which is almost exactly 4.8 clockface units
      displacement=new course($add(track.bearing,rnd.real((-2.4),2.4)),$pow(2,0.5));
      displacement.nextstep();
      bumpto=displacement.sector();
      if(!bumpto.valid_sector()){
        return hit;
      }
      if(($g($g(game.quad,bumpto.i),bumpto.j)===" ")){
        (yield* finish(FHOLE));
        return hit;
      }
      if(($g($g(game.quad,bumpto.i),bumpto.j)!==".")){
        // can't move into object
        return hit;
      }
      game.sector=bumpto;
      proutn(crmshp());
      $s($g(game.quad,w.i),w.j,".");
      $s($g(game.quad,bumpto.i),bumpto.j,iquad);
      (yield* prout($fmt(" displaced by blast to Sector %s ",bumpto)));
      for(enemy of $iter(game.enemies)){
        {const $v=$sub(game.sector,enemy.location).distance();enemy.kdist=$v;enemy.kavgd=$v;}
      }
      sortenemies();
      return null;
    }else if($in(iquad,["C","S","R","K"])){
      // Hit a regular enemy
      // find the enemy
      if(($in(iquad,["C","S"]) && rnd.withprob(0.05))){
        (yield* prout($add(crmena(true,iquad,"sector",w)," uses anti-photon device;")));
        (yield* prout("   torpedo neutralized."));
        return null;
      }
      var $else1568=true;
      for(enemy of $iter(game.enemies)){
        if($eq(w,enemy.location)){
          kp=$abs(enemy.power);
          h1=$sub((700+rnd.integer(100)),$mul($mul(1000,$sub(w,origin).distance()),$abs(Math.sin($sub(bullseye,track.angle)))));
          h1=$abs(h1);
          h1=$min(h1,kp);
          if((enemy.power<0)){
            enemy.power=$sub(enemy.power,(-h1));
          }else{
            enemy.power=$sub(enemy.power,h1);
          }
          if((enemy.power==0)){
            (yield* deadkl(w,iquad,w));
            return null;
          }
          proutn(crmena(true,iquad,"sector",w));
          displacement=new course($add(track.bearing,rnd.real((-2.4),2.4)),$pow(2,0.5),w);
          displacement.nextstep();
          bumpto=displacement.sector();
          if(($g($g(game.quad,bumpto.i),bumpto.j)===" ")){
            (yield* prout(" buffeted into black hole."));
            (yield* deadkl(w,iquad,bumpto));
            return null;
          }
          if(!bumpto.valid_sector()){
            (yield* prout(" damaged but not destroyed."));
            return null;
          }
          if(($g($g(game.quad,bumpto.i),bumpto.j)!==".")){
            (yield* prout(" damaged but not destroyed."));
          }else{
            (yield* prout($fmt(" damaged-- displaced by blast to Sector %s ",bumpto)));
            enemy.location=bumpto;
            $s($g(game.quad,w.i),w.j,".");
            $s($g(game.quad,bumpto.i),bumpto.j,iquad);
            for(tenemy of $iter(game.enemies)){
              {const $v=$sub(game.sector,tenemy.location).distance();tenemy.kdist=$v;tenemy.kavgd=$v;}
            }
            sortenemies();
          }
          $else1568=false;
          break;
        }
      }
      if($else1568){
        (yield* prout("Internal error, no enemy where expected!"));
        throw new SystemExit(1);
      }
      return null;
    }else if((iquad==="B")){
      // Hit a base
      (yield* skip(1));
      (yield* prout("***STARBASE DESTROYED.."));
      game.state.baseq=(()=>{const $r=[];for(const x of $iter(game.state.baseq)){if($ne(x,game.quadrant)){$r.push(x);}}return $r})();
      $s($g(game.quad,w.i),w.j,".");
      game.base.invalidate();
      $g($g(game.state.galaxy,game.quadrant.i),game.quadrant.j).starbase=false;
      $g($g(game.state.chart,game.quadrant.i),game.quadrant.j).starbase=false;
      game.state.basekl=(game.state.basekl+1);
      newcnd();
      return null;
    }else if((iquad==="P")){
      // Hit a planet
      (yield* prout($add(crmena(true,iquad,"sector",w)," destroyed.")));
      game.state.nplankl=(game.state.nplankl+1);
      $g($g(game.state.galaxy,game.quadrant.i),game.quadrant.j).planet=null;
      game.iplnet.pclass="destroyed";
      game.iplnet=null;
      game.plnet.invalidate();
      $s($g(game.quad,w.i),w.j,".");
      if($t(game.landed)){
        // captain perishes on planet
        (yield* finish(FDPLANET));
      }
      return null;
    }else if((iquad==="@")){
      // Hit an inhabited world -- very bad!
      (yield* prout($add(crmena(true,iquad,"sector",w)," destroyed.")));
      game.state.nworldkl=(game.state.nworldkl+1);
      $g($g(game.state.galaxy,game.quadrant.i),game.quadrant.j).planet=null;
      game.iplnet.pclass="destroyed";
      game.iplnet=null;
      game.plnet.invalidate();
      $s($g(game.quad,w.i),w.j,".");
      if($t(game.landed)){
        // captain perishes on planet
        (yield* finish(FDPLANET));
      }
      (yield* prout("The torpedo destroyed an inhabited planet."));
      return null;
    }else if((iquad==="*")){
      // Hit a star
      if(rnd.withprob(0.9)){
        (yield* nova(w));
      }else{
        (yield* prout($add(crmena(true,"*","sector",w)," unaffected by photon blast.")));
      }
      return null;
    }else if((iquad==="?")){
      // Hit a thingy
      (yield* skip(1));
      prouts("AAAAIIIIEEEEEEEEAAAAAAAAUUUUUGGGGGHHHHHHHHHHHH!!!");
      (yield* skip(1));
      prouts("    HACK!     HACK!    HACK!        *CHOKE!*  ");
      (yield* skip(1));
      proutn("Mr. Spock-");
      prouts("  \"Fascinating!\"");
      (yield* skip(1));
      (yield* deadkl(w,iquad,w));
      return null;
    }else if((iquad===" ")){
      // Black hole
      (yield* skip(1));
      (yield* prout($add(crmena(true," ","sector",w)," swallows torpedo.")));
      return null;
    }else if((iquad==="#")){
      // hit the web
      (yield* skip(1));
      (yield* prout("***Torpedo absorbed by Tholian web."));
      return null;
    }else if((iquad==="T")){
      // Hit a Tholian
      h1=$sub((700+rnd.integer(100)),$mul($mul(1000,$sub(w,origin).distance()),$abs(Math.sin($sub(bullseye,track.angle)))));
      h1=$abs(h1);
      if((h1>=600)){
        $s($g(game.quad,w.i),w.j,".");
        (yield* deadkl(w,iquad,w));
        game.tholian=null;
        return null;
      }
      (yield* skip(1));
      proutn(crmena(true,"T","sector",w));
      if(rnd.withprob(0.05)){
        (yield* prout(" survives photon blast."));
        return null;
      }
      (yield* prout(" disappears."));
      game.tholian.move(null);
      $s($g(game.quad,w.i),w.j,"#");
      dropin(" ");
      return null;
    }else{
      // Problem!
      (yield* skip(1));
      proutn("Don't know how to handle torpedo collision with ");
      proutn(crmena(true,iquad,"sector",w));
      (yield* skip(1));
      return null;
    }
    break;
  }
  (yield* skip(1));
  (yield* prout("Torpedo missed."));
  return null;
}
function* fry(hit){
  var ncrit,cdam,skipcount,i,j,extradm;
  // Critical-hit resolution.
  if((hit<$mul((275-$mul(25,game.skill)),rnd.real(1,1.5)))){
    return;
  }
  ncrit=$int((1+$div(hit,(500+rnd.real(100)))));
  proutn("***CRITICAL HIT--");
  // Select devices and cause damage
  cdam=[];
  while((ncrit>0)){
    for(;;){
      j=randdevice();
      // Cheat to prevent shuttle damage unless on ship
      if(!(($g(game.damage,j)<0) || ($eq(j,DSHUTTL) && (game.iscraft!=="onship")) || (($eq(j,DCLOAK) && (game.ship!=="E")) || $eq(j,DDRAY)))){
        break;
      }
    }
    cdam.push(j);
    extradm=$div($mul(hit,game.damfac),$mul(ncrit,rnd.real(75,100)));
    $s(game.damage,j,$add($g(game.damage,j),extradm));
    ncrit=(ncrit-1);
  }
  skipcount=0;
  for([i,j] of $iter($enumerate(cdam))){
    proutn($g(device,j));
    if((($mod(skipcount,3)==2) && (i<($len(cdam)-1)))){
      (yield* skip(1));
    }
    skipcount=(skipcount+1);
    if((i<($len(cdam)-1))){
      proutn(" and ");
    }
  }
  (yield* prout(" damaged."));
  if((damaged(DSHIELD) && $t(game.shldup))){
    (yield* prout("***Shields knocked down."));
    game.shldup=false;
  }
  if((damaged(DCLOAK) && $t(game.iscloaked))){
    (yield* prout("***Cloaking device rendered inoperative."));
    game.iscloaked=false;
  }
}
function* attack(torps_ok){
  var attempt,ihurt,hitmax,hittot,chgfac,where,pfac,enemy,percent,bugout,oldloc,olddist,goto,r,usephasers,icas,dustfac,hit,pcourse,dispersion,propor,hitsh,absorb;
  // bad guy attacks us
  // torps_ok == False forces use of phasers in an attack
  if($t(game.iscloaked)){
    return;
  }
  // game could be over at this point, check
  if($t(game.alldone)){
    return;
  }
  attempt=false;
  ihurt=false;
  hitmax=0;
  hittot=0;
  chgfac=1;
  where="neither";
  if($t(game.idebug)){
    (yield* prout("=== ATTACK!"));
  }
  // Tholian gets to move before attacking
  if($t(game.tholian)){
    (yield* movetholian());
  }
  // if you have just entered the RNZ, you'll get a warning
  if($t(game.neutz)){
    game.neutz=false;
    return;
  }
  // commanders get a chance to tac-move towards you
  if((((($in(game.quadrant,game.state.kcmdr) || $eq(game.state.kscmdr,game.quadrant)) && !$t(game.justin)) || $eq(game.skill,SKILL_EMERITUS)) && $t(torps_ok))){
    for([bugout,enemy,oldloc,olddist,goto] of $iter((yield* moveklings()))){
      if($t(bugout)){
        // we know about this if either short or long range
        // sensors are working
        if((damaged(DSRSENS) && damaged(DLRSENS) && (game.condition!=="docked"))){
          (yield* prout($add(crmena(true,enemy.type,"sector",oldloc),$fmt(" escapes to Quadrant %s (and regains strength).",goto))));
        }
      // Enemy still in-sector
      }else if($t(enemy.move(goto))){
        if((!damaged(DSRSENS) || (game.condition==="docked"))){
          proutn($fmt("*** %s from Sector %s",[cramen(enemy.type),oldloc]));
          if((enemy.kdist<olddist)){
            proutn(" advances to ");
          }else{
            proutn(" retreats to ");
          }
          (yield* prout($fmt("Sector %s.",goto)));
        }
      }
    }
    sortenemies();
  }
  // if no enemies remain after movement, we're done
  if((($len(game.enemies)==0) || (($len(game.enemies)==1) && $t(thing.at(game.quadrant))))){
    return;
  }
  // set up partial hits if attack happens during shield status change
  pfac=$div(1,game.inshld);
  if($t(game.shldchg)){
    chgfac=(0.25+rnd.real(0.5));
  }
  (yield* skip(1));
  // message verbosity control
  if((game.skill<=SKILL_FAIR)){
    where="sector";
  }
  for(enemy of $iter(game.enemies)){
    if((enemy.power<0)){
      continue;
    }
    // too weak to attack
    // compute hit strength and diminish shield power
    r=rnd.real();
    // Increase chance of photon torpedos if docked or enemy energy is low
    if((game.condition==="docked")){
      r=$mul(r,0.25);
    }
    if((enemy.power<500)){
      r=$mul(r,0.25);
    }
    if($in(enemy.type,["T","?"])){
      continue;
    }
    // different enemies have different probabilities of throwing a torp
    usephasers=(!$t(torps_ok) || ((enemy.type==="K") && (r>0.0005)) || ((enemy.type==="C") && (r>0.015)) || ((enemy.type==="R") && (r>0.3)) || ((enemy.type==="S") && (r>0.07)) || ((enemy.type==="?") && (r>0.05)));
    if($t(usephasers)){
      if((game.condition==="docked")){
        continue;
      }
      // Don't waste the effort!
      attempt=true; // Attempt to attack
      dustfac=rnd.real(0.8,0.85);
      hit=$mul(enemy.power,$pow(dustfac,enemy.kavgd));
      enemy.power=$mul(enemy.power,0.75);
    }else{
      // Enemy uses photon torpedo
      // We should be able to make the bearing() method work here
      pcourse=(1.90985*Math.atan2($sub(game.sector.j,enemy.location.j),$sub(enemy.location.i,game.sector.i)));
      hit=0;
      proutn("***TORPEDO INCOMING");
      if(!damaged(DSRSENS)){
        proutn($add(" From ",crmena(false,enemy.type,where,enemy.location)));
      }
      attempt=true;
      (yield* prout("  "));
      dispersion=(((rnd.real()+rnd.real())*0.5)-0.5);
      dispersion=$add(dispersion,$mul($mul(0.002,enemy.power),dispersion));
      hit=(yield* torpedo(enemy.location,pcourse,dispersion,1,1));
      if((game.unwon()==0)){
        (yield* finish(FWON)); // Klingons did themselves in!
      }
      if(($t($g($g(game.state.galaxy,game.quadrant.i),game.quadrant.j).supernova) || $t(game.alldone))){
        return; // Supernova or finished
      }
      if((hit==null)){
        continue;
      }
    }
    // incoming phaser or torpedo, shields may dissipate it
    if(($t(game.shldup) || $t(game.shldchg) || (game.condition==="docked"))){
      // shields will take hits
      propor=$mul(pfac,game.shield);
      if((game.condition==="docked")){
        propor=$mul(propor,2.1);
      }
      propor=$max(propor,0.1);
      hitsh=($mul($mul(propor,chgfac),hit)+1);
      absorb=$mul(0.8,hitsh);
      absorb=$min(absorb,game.shield);
      game.shield=$sub(game.shield,absorb);
      hit=$sub(hit,hitsh);
      // taking a hit blasts us out of a starbase dock
      if((game.condition==="docked")){
        (yield* dock(false));
      }
      // but the shields may take care of it
      if(((propor>0.1) && (hit<$mul(0.005,game.energy)))){
        continue;
      }
    }
    // hit from this opponent got through shields, so take damage
    ihurt=true;
    proutn($fmt("%d unit hit",$int(hit)));
    if(((damaged(DSRSENS) && $t(usephasers)) || (game.skill<=SKILL_FAIR))){
      proutn($add(" on the ",crmshp()));
    }
    if((!damaged(DSRSENS) && $t(usephasers))){
      (yield* prout($add(" from ",crmena(false,enemy.type,where,enemy.location))));
    }
    (yield* skip(1));
    // Decide if hit is critical
    hitmax=$max(hitmax,hit);
    hittot=$add(hittot,hit);
    (yield* fry(hit));
    game.energy=$sub(game.energy,hit);
  }
  if((game.energy<=0)){
    // Returning home upon your shield, not with it...
    (yield* finish(FBATTLE));
    return;
  }
  if((!$t(attempt) && (game.condition==="docked"))){
    (yield* prout("***Enemies decide against attacking your ship."));
  }
  percent=($mul($mul(100,pfac),game.shield)+0.5);
  if(!$t(ihurt)){
    // Shields fully protect ship
    proutn("Enemy attack reduces shield strength to ");
  }else{
    // Emit message if starship suffered hit(s)
    (yield* skip(1));
    proutn($fmt("Energy left %2d    shields ",$int(game.energy)));
    if($t(game.shldup)){
      proutn("up ");
    }else if(!damaged(DSHIELD)){
      proutn("down ");
    }else{
      proutn("damaged, ");
    }
  }
  (yield* prout($fmt("%d%%,   torpedoes left %d",[percent,game.torps])));
  // Check if anyone was hurt
  if(((hitmax>=200) || (hittot>=500))){
    icas=rnd.integer($int($mul(hittot,0.015)));
    if((icas>=2)){
      (yield* skip(1));
      (yield* prout($fmt("Mc Coy-  \"Sickbay to bridge.  We suffered %d casualties",icas)));
      (yield* prout("   in that last attack.\""));
      game.casual=$add(game.casual,icas);
      game.state.crew=$sub(game.state.crew,icas);
    }
  }
  // After attack, reset average distance to enemies
  for(enemy of $iter(game.enemies)){
    enemy.kavgd=enemy.kdist;
  }
  sortenemies();
  return;
}
function* deadkl(w,etype,mv){
  var e;
  // Kill a Klingon, Tholian, Romulan, or Thingy.
  // Added mv to allow enemy to "move" before dying
  proutn(crmena(true,etype,"sector",mv));
  // Decide what kind of enemy it is and update appropriately
  if((etype==="R")){
    // Chalk up a Romulan
    $g($g(game.state.galaxy,game.quadrant.i),game.quadrant.j).romulans=($g($g(game.state.galaxy,game.quadrant.i),game.quadrant.j).romulans-1);
    game.irhere=(game.irhere-1);
    game.state.nromrem=(game.state.nromrem-1);
  }else if((etype==="T")){
    // Killed a Tholian
    game.tholian=null;
  }else if((etype==="?")){
    // Remove the Thingy from the galaxy while keeping its location queryable.
    thing.location.invalidate();
  }else{
    // Killed some type of Klingon
    $g($g(game.state.galaxy,game.quadrant.i),game.quadrant.j).klingons=($g($g(game.state.galaxy,game.quadrant.i),game.quadrant.j).klingons-1);
    game.klhere=(game.klhere-1);
    if((etype==="C")){
      if($in(game.quadrant,game.state.kcmdr)){
        $remove(game.state.kcmdr,game.quadrant);
      }
      unschedule(FTBEAM);
      if($t(game.state.kcmdr)){
        schedule(FTBEAM,expran($div($mul(1,game.incom),$len(game.state.kcmdr))));
      }
      if(($t(is_scheduled(FCDBAS)) && $eq(game.battle,game.quadrant))){
        unschedule(FCDBAS);
      }
    }else if((etype==="K")){
    }else if((etype==="S")){
      game.state.nscrem=(game.state.nscrem-1);
      game.state.kscmdr.invalidate();
      game.isatb=0;
      game.iscate=false;
      unschedule(FSCMOVE);
      unschedule(FSCDBAS);
    }
  }
  // For each kind of enemy, finish message to player
  (yield* prout(" destroyed."));
  // Avoid dividing by zero after victory, but still remove the final enemy.
  if((game.unwon()!=0)){
    game.recompute();
  }
  // Remove enemy ship from arrays describing local conditions
  for(e of $iter(game.enemies)){
    if($eq(e.location,w)){
      e.move(null);
      break;
    }
  }
}
function* targetcheck(w){
  var delta;
  // Return None if target is invalid, otherwise return a course angle.
  if(!w.valid_sector()){
    (yield* huh());
    return null;
  }
  delta=new Coord();
  // C code this was translated from is wacky -- why the sign reversal?
  delta.j=$sub(w.j,game.sector.j);
  delta.i=$sub(game.sector.i,w.i);
  if($eq(delta,new Coord(0,0))){
    (yield* skip(1));
    (yield* prout("Spock-  \"Bridge to sickbay.  Dr. McCoy,"));
    (yield* prout("  I recommend an immediate review of"));
    (yield* prout("  the Captain's psychological profile.\""));
    scanner.chew();
    return null;
  }
  return delta.bearing();
}
function* torps(){
  var tcourse,target,i,key,dispersion,n;
  // Launch photon torpedo salvo.
  tcourse=[];
  game.ididit=false;
  if(damaged(DPHOTON)){
    (yield* prout("Photon tubes damaged."));
    scanner.chew();
    return;
  }
  if((game.torps==0)){
    (yield* prout("No torpedoes left."));
    scanner.chew();
    return;
  }
  // First, get torpedo count
  for(;;){
    (yield* scanner.nexttok());
    if((scanner.token==="IHALPHA")){
      (yield* huh());
      return;
    }else if(((scanner.token==="IHEOL") || !$t(scanner.waiting()))){
      (yield* prout($fmt("%d torpedoes left.",game.torps)));
      scanner.chew();
      proutn("Number of torpedoes to fire- ");
      continue;
    }else{
      // Go back around to get a number
      // key == "IHREAL"
      try{
        n=scanner.int();
      }catch($e){
        if($e instanceof TypeError){
          (yield* huh());
          return;
        }else{
          throw $e;
        }
      }
      if((n<=0)){
        scanner.chew();
        return;
      }
      if((n>MAXBURST)){
        scanner.chew();
        (yield* prout($fmt("Maximum of %d torpedoes per burst.",MAXBURST)));
        return;
      }
      if((n>game.torps)){
        scanner.chew(); // User requested more torps than available
        continue;
      }
      // Go back around
      break;
    }
  }
  // All is good, go to next stage
  // Next, get targets
  target=[];
  for(i of $range(n)){
    key=(yield* scanner.nexttok());
    if(((i==0) && (key==="IHEOL"))){
      break;
    }
    // no coordinate waiting, we will try prompting
    if(((i==1) && (key==="IHEOL"))){
      // direct all torpedoes at one target
      while((i<n)){
        target.push($g(target,0));
        tcourse.push($g(tcourse,0));
        i=(i+1);
      }
      break;
    }
    scanner.push(scanner.token);
    target.push((yield* scanner.getcoord()));
    if(($g(target,(-1))==null)){
      return;
    }
    tcourse.push((yield* targetcheck($g(target,(-1)))));
    if(($g(tcourse,(-1))==null)){
      return;
    }
  }
  scanner.chew();
  if(($len(target)==0)){
    // prompt for each one
    for(i of $range(n)){
      proutn($fmt("Target sector for torpedo number %d- ",(i+1)));
      scanner.chew();
      target.push((yield* scanner.getcoord()));
      if(($g(target,(-1))==null)){
        return;
      }
      tcourse.push((yield* targetcheck($g(target,(-1)))));
      if(($g(tcourse,(-1))==null)){
        return;
      }
    }
  }
  game.ididit=true;
  // Loop for moving <n> torpedoes
  for(i of $range(n)){
    if((game.condition!=="docked")){
      game.torps=(game.torps-1);
    }
    dispersion=(((rnd.real()+rnd.real())*0.5)-0.5);
    if(($abs(dispersion)>=0.47)){
      // misfire!
      dispersion=$mul(dispersion,rnd.real(1.2,2.2));
      if((n>0)){
        prouts($fmt("***TORPEDO NUMBER %d MISFIRES",(i+1)));
      }else{
        prouts("***TORPEDO MISFIRES.");
      }
      (yield* skip(1));
      if((i<n)){
        (yield* prout("  Remainder of burst aborted."));
      }
      if(rnd.withprob(0.2)){
        (yield* prout("***Photon tubes damaged by misfire."));
        $s(game.damage,DPHOTON,$mul(game.damfac,rnd.real(1,3)));
      }
      break;
    }
    if($t(game.iscloaked)){
      dispersion=$mul(dispersion,1.2);
    }else if(($t(game.shldup) || (game.condition==="docked"))){
      dispersion=$mul(dispersion,(1+$mul(0.0001,game.shield)));
    }
    (yield* torpedo(game.sector,$g(tcourse,i),dispersion,i,n));
    if(($t(game.alldone) || $t($g($g(game.state.galaxy,game.quadrant.i),game.quadrant.j).supernova))){
      return;
    }
  }
  if((game.unwon()<=0)){
    (yield* finish(FWON));
  }
}
function* overheat(rpow){
  var checkburn;
  // Check for phasers overheating.
  if((rpow>1500)){
    checkburn=$mul((rpow-1500),0.00038);
    if(rnd.withprob(checkburn)){
      (yield* prout("Weapons officer Sulu-  \"Phasers overheated, sir.\""));
      $s(game.damage,DPHASER,$mul($mul(game.damfac,rnd.real(1,2)),(1+checkburn)));
    }
  }
}
function* checkshctrl(rpow){
  var hit,icas;
  // Check shield control.
  (yield* skip(1));
  if(rnd.withprob(0.998)){
    (yield* prout("Shields lowered."));
    return false;
  }
  // Something bad has happened
  prouts("***RED ALERT!  RED ALERT!");
  (yield* skip(2));
  hit=$div($mul(rpow,game.shield),game.inshld);
  game.energy=$sub(game.energy,$add(rpow,$mul(hit,0.8)));
  game.shield=$sub(game.shield,$mul(hit,0.2));
  if((game.energy<=0)){
    prouts("Sulu-  \"Captain! Shield malf***********************\"");
    (yield* skip(1));
    (yield* stars());
    (yield* finish(FPHASER));
    return true;
  }
  prouts("Sulu-  \"Captain! Shield malfunction! Phaser fire contained!\"");
  (yield* skip(2));
  (yield* prout("Lt. Uhura-  \"Sir, all decks reporting damage.\""));
  icas=rnd.integer($int($mul(hit,0.012)));
  (yield* skip(1));
  (yield* fry($mul(0.8,hit)));
  if($t(icas)){
    (yield* skip(1));
    (yield* prout("McCoy to bridge- \"Severe radiation burns, Jim."));
    (yield* prout($fmt("  %d casualties so far.\"",icas)));
    game.casual=$add(game.casual,icas);
    game.state.crew=$sub(game.state.crew,icas);
  }
  (yield* skip(1));
  (yield* prout("Phaser energy dispersed by shields."));
  (yield* prout("Enemy unaffected."));
  (yield* overheat(rpow));
  return true;
}
function* hittem(hits){
  var w,wham,enemy,dustfac,hit,kpini,kp,kpow,ienm;
  // Register a phaser hit on Klingons and Romulans.
  w=new Coord();
  (yield* skip(1));
  // Snapshot targets because deadkl() removes destroyed enemies from the list.
  for([wham,enemy] of $iter($zip(hits,$slice(game.enemies,0)))){
    if((wham==0)){
      continue;
    }
    dustfac=rnd.real(0.9,1);
    hit=$mul(wham,$pow(dustfac,enemy.kdist));
    kpini=enemy.power;
    kp=$abs(kpini);
    kp=$min(kp,$mul(PHASEFAC,hit));
    if((enemy.power<0)){
      enemy.power=$sub(enemy.power,(-kp));
    }else{
      enemy.power=$sub(enemy.power,kp);
    }
    kpow=enemy.power;
    w=enemy.location;
    if((hit>0.005)){
      if(!damaged(DSRSENS)){
      }
      proutn($fmt("%d unit hit on ",$int(hit)));
    }else{
      proutn("Very small hit on ");
    }
    ienm=$g($g(game.quad,w.i),w.j);
    proutn(crmena(false,ienm,"sector",w));
    (yield* skip(1));
    if((kpow==0)){
      (yield* deadkl(w,ienm,w));
      if((game.unwon()==0)){
        (yield* finish(FWON));
      }
      if($t(game.alldone)){
        return;
      }
      continue;
    // decide whether or not to emasculate klingon
    }else if(((kpow>0) && rnd.withprob(0.9) && (kpow<=$mul(rnd.real(0.4,0.8),kpini)))){
      (yield* prout($fmt("***Mr. Spock-  \"Captain, the vessel at Sector %s",w)));
      (yield* prout("   has just lost its firepower.\""));
      enemy.power=(-kpow);
    }
  }
  return;
}
function* phasers(){
  var hits,kz,k,irec,ifast,no,itarg,msgflag,rpow,automode,key,avail,extra,powrem,i,over,temp,aim,ienm;
  // Fire phasers at bad guys.
  hits=[];
  kz=0;
  k=1;
  irec=0; // Cheating inhibitor
  ifast=false;
  no=false;
  itarg=true;
  msgflag=true;
  rpow=0;
  automode="NOTSET";
  key="";
  (yield* skip(1));
  // SR sensors and Computer are needed for automode
  if((damaged(DSRSENS) || damaged(DCOMPTR))){
    itarg=false;
  }
  if((game.condition==="docked")){
    (yield* prout("Phasers can't be fired through base shields."));
    scanner.chew();
    return;
  }
  if(damaged(DPHASER)){
    (yield* prout("Phaser control damaged."));
    scanner.chew();
    return;
  }
  if($t(game.shldup)){
    if(damaged(DSHCTRL)){
      (yield* prout("High speed shield control damaged."));
      scanner.chew();
      return;
    }
    if((game.energy<=200)){
      (yield* prout("Insufficient energy to activate high-speed shield control."));
      scanner.chew();
      return;
    }
    (yield* prout("Weapons Officer Sulu-  \"High-speed shield control enabled, sir.\""));
    ifast=true;
  }
  // Original code so convoluted, I re-did it all
  // (That was Tom Almy talking about the C code, I think -- ESR)
  while((automode==="NOTSET")){
    key=(yield* scanner.nexttok());
    if((key==="IHALPHA")){
      if(scanner.sees("manual")){
        if(($len(game.enemies)==0)){
          (yield* prout("There is no enemy present to select."));
          scanner.chew();
          key="IHEOL";
          automode="AUTOMATIC";
        }else{
          automode="MANUAL";
          key=(yield* scanner.nexttok());
        }
      }else if(scanner.sees("automatic")){
        if((!$t(itarg) && ($len(game.enemies)!=0))){
          automode="FORCEMAN";
        }else{
          if(($len(game.enemies)==0)){
            (yield* prout("Energy will be expended into space."));
          }
          automode="AUTOMATIC";
          key=(yield* scanner.nexttok());
        }
      }else if(scanner.sees("no")){
        no=true;
      }else{
        (yield* huh());
        return;
      }
    }else if((key==="IHREAL")){
      if(($len(game.enemies)==0)){
        (yield* prout("Energy will be expended into space."));
        automode="AUTOMATIC";
      }else if(!$t(itarg)){
        automode="FORCEMAN";
      }else{
        automode="AUTOMATIC";
      }
    // "IHEOL"
    }else if(($len(game.enemies)==0)){
      (yield* prout("Energy will be expended into space."));
      automode="AUTOMATIC";
    }else if(!$t(itarg)){
      automode="FORCEMAN";
    }else{
      proutn("Manual or automatic? ");
      scanner.chew();
    }
  }
  avail=game.energy;
  if($t(ifast)){
    avail=(avail-200);
  }
  if((automode==="AUTOMATIC")){
    if(((key==="IHALPHA") && scanner.sees("no"))){
      no=true;
      key=(yield* scanner.nexttok());
    }
    if(((key!=="IHREAL") && ($len(game.enemies)!=0))){
      (yield* prout($fmt("Phasers locked on target. Energy available: %.2f",avail)));
    }
    irec=0;
    for(;;){
      scanner.chew();
      if(!$t(kz)){
        for(i of $range($len(game.enemies))){
          irec=$add(irec,(($div($abs($g(game.enemies,i).power),(PHASEFAC*$pow(0.9,$g(game.enemies,i).kdist)))*rnd.real(1.01,1.06))+1));
        }
      }
      kz=1;
      proutn($fmt("%d units required. ",irec));
      scanner.chew();
      proutn("Units to fire= ");
      key=(yield* scanner.nexttok());
      if((key!=="IHREAL")){
        return;
      }
      rpow=scanner.real;
      if((rpow>avail)){
        proutn($fmt("Energy available= %.2f",avail));
        (yield* skip(1));
        key="IHEOL";
      }
      if(!(rpow>avail)){
        break;
      }
    }
    if((rpow<=0)){
      // chicken out
      scanner.chew();
      return;
    }
    key=(yield* scanner.nexttok());
    if(((key==="IHALPHA") && scanner.sees("no"))){
      no=true;
    }
    if($t(ifast)){
      game.energy=(game.energy-200); // Go and do it!
      if($t((yield* checkshctrl(rpow)))){
        return;
      }
    }
    scanner.chew();
    game.energy=$sub(game.energy,rpow);
    extra=rpow;
    if($t($len(game.enemies))){
      extra=0;
      powrem=rpow;
      for(i of $range($len(game.enemies))){
        hits.push(0);
        if((powrem<=0)){
          continue;
        }
        $s(hits,i,$div($abs($g(game.enemies,i).power),(PHASEFAC*$pow(0.9,$g(game.enemies,i).kdist))));
        over=$mul(rnd.real(1.01,1.06),$g(hits,i));
        temp=powrem;
        powrem=$sub(powrem,$add($g(hits,i),over));
        if(((powrem<=0) && (temp<$g(hits,i)))){
          $s(hits,i,temp);
        }
        if((powrem<=0)){
          over=0;
        }
        extra=$add(extra,over);
      }
      if((powrem>0)){
        extra=$add(extra,powrem);
      }
      (yield* hittem(hits));
      game.ididit=true;
    }
    if(((extra>0) && !$t(game.alldone))){
      if($t(game.tholian)){
        proutn("*** Tholian web absorbs ");
        if(($len(game.enemies)>0)){
          proutn("excess ");
        }
        (yield* prout("phaser energy."));
      }else{
        (yield* prout($fmt("%d expended on empty space.",$int(extra))));
      }
    }
  }else if((automode==="FORCEMAN")){
    scanner.chew();
    key="IHEOL";
    if(damaged(DCOMPTR)){
      (yield* prout("Battle computer damaged, manual fire only."));
    }else{
      (yield* skip(1));
      prouts("---WORKING---");
      (yield* skip(1));
      (yield* prout("Short-range-sensors-damaged"));
      (yield* prout("Insufficient-data-for-automatic-phaser-fire"));
      (yield* prout("Manual-fire-must-be-used"));
      (yield* skip(1));
    }
  }else if((automode==="MANUAL")){
    rpow=0;
    // Keep a slot for every target, including those we cannot locate.
    hits=$mul([0],$len(game.enemies));
    for(k of $range($len(game.enemies))){
      aim=$g(game.enemies,k).location;
      ienm=$g($g(game.quad,aim.i),aim.j);
      if($t(msgflag)){
        proutn($fmt("Energy available= %.2f",(avail-0.006)));
        (yield* skip(1));
        msgflag=false;
        rpow=0;
      }
      if((damaged(DSRSENS) && !(game.sector.distance(aim)<$pow(2,0.5)) && $in(ienm,["C","S"]))){
        (yield* prout($add(cramen(ienm)," can't be located without short range scan.")));
        scanner.chew();
        key="IHEOL";
        continue;
      }
      if((key==="IHEOL")){
        scanner.chew();
        if(($t(itarg) && (k>kz))){
          irec=(($div($abs($g(game.enemies,k).power),(PHASEFAC*$pow(0.9,$g(game.enemies,k).kdist)))*rnd.real(1.01,1.06))+1);
        }
        kz=k;
        proutn("(");
        if(!damaged(DCOMPTR)){
          proutn($fmt("%d",irec));
        }else{
          proutn("??");
        }
        proutn(")  ");
        proutn($fmt("units to fire at %s-  ",crmena(false,ienm,"sector",aim)));
        key=(yield* scanner.nexttok());
      }
      if(((key==="IHALPHA") && scanner.sees("no"))){
        no=true;
        key=(yield* scanner.nexttok());
        continue;
      }
      if((key==="IHALPHA")){
        (yield* huh());
        return;
      }
      if((key==="IHEOL")){
        if((k==1)){
          msgflag=true;
        }
        continue;
      }
      if((scanner.real<0)){
        // abort out
        scanner.chew();
        return;
      }
      $s(hits,k,scanner.real);
      rpow=$add(rpow,scanner.real);
      // If total requested is too much, inform and start over
      if((rpow>avail)){
        (yield* prout("Available energy exceeded -- try again."));
        scanner.chew();
        return;
      }
      key=(yield* scanner.nexttok()); // scan for next value
    }
    if((rpow==0)){
      // zero energy -- abort
      scanner.chew();
      return;
    }
    if(((key==="IHALPHA") && scanner.sees("no"))){
      no=true;
    }
    game.energy=$sub(game.energy,rpow);
    scanner.chew();
    if($t(ifast)){
      game.energy=(game.energy-200);
      if($t((yield* checkshctrl(rpow)))){
        return;
      }
    }
    (yield* hittem(hits));
    game.ididit=true;
  }
  // Say shield raised or malfunction, if necessary
  if($t(game.alldone)){
    return;
  }
  if($t(ifast)){
    (yield* skip(1));
    if((no==0)){
      if(rnd.withprob(0.01)){
        (yield* prout("Sulu-  \"Sir, the high-speed shield control has malfunctioned . . ."));
        prouts("         CLICK   CLICK   POP  . . .");
        (yield* prout(" No response, sir!"));
        game.shldup=false;
      }else{
        (yield* prout("Shields raised."));
      }
    }else{
      game.shldup=false;
    }
  }
  (yield* overheat(rpow));
}
function* capture(){
  var klingons,weakest,x,i;
  game.ididit=false; // Nothing if we fail
  game.optime=0;
  // Make sure there is room in the brig
  if((game.brigfree==0)){
    (yield* prout("Security reports the brig is already full."));
    return;
  }
  if(damaged(DRADIO)){
    (yield* prout("Uhura- \"We have no subspace radio communication, sir.\""));
    return;
  }
  if(damaged(DTRANSP)){
    (yield* prout("Scotty- \"Transporter damaged, sir.\""));
    return;
  }
  // find out if there are any at all
  if((game.klhere<1)){
    (yield* prout("Uhura- \"Getting no response, sir.\""));
    return;
  }
  // if there is more than one Klingon, find out which one
  // Cruddy, just takes one at random.  Should ask the captain.
  // Nah, just select the weakest one since it is most likely to
  // surrender (Tom Almy mod)
  klingons=(()=>{const $r=[];for(const e of $iter(game.enemies)){if($in(e.type,["K","C","S"])){$r.push(e);}}return $r})();
  if(!$t(klingons)){
    (yield* prout("Uhura- \"Getting no response, sir.\""));
    return;
  }
  // Negative power marks lost firepower; its magnitude is remaining energy.
  weakest=$minby(klingons,((e)=>$abs(e.power)));
  game.optime=0.05; // This action will take some time
  game.ididit=true; // So any others can strike back
  // check out that Klingon
  // The algorithm isn't that great and could use some more
  // intelligent design
  // x = 300 + 25*skill;
  x=$div(game.energy,($abs(weakest.power)*$len(klingons)));
  // prout(_("Stats: energy = %s, kpower = %s, klingons = %s")
  // % (game.energy, weakest.power, len(klingons)))
  x=$mul(x,2.5); // would originally have been equivalent of 1.4,
  // but we want command to work more often, more humanely
  // prout(_("Prob = %.4f" % x))
  // x = 100; // For testing, of course!
  if((rnd.real(100)<x)){
    // guess what, he surrendered!!!
    (yield* prout($fmt("Klingon captain at %s surrenders.",weakest.location)));
    i=rnd.integer(200);
    if((i>0)){
      (yield* prout($fmt("%d Klingons commit suicide rather than be taken captive.",(200-i))));
    }
    if((i>game.brigfree)){
      (yield* prout($fmt("%d Klingons die because there is no room for them in the brig.",$sub(i,game.brigfree))));
      i=game.brigfree;
    }
    game.brigfree=$sub(game.brigfree,i);
    (yield* prout($fmt("%d captives taken",i)));
    (yield* deadkl(weakest.location,weakest.type,game.sector));
    if((game.unwon()<=0)){
      (yield* finish(FWON));
    }
    return;
  }
  // big surprise, he refuses to surrender
  (yield* prout("Fat chance, captain!"));
}
// Code from events.c begins here.
// This isn't a real event queue a la BSD Trek yet -- you can only have one
// event of each type active at any given time.  Mostly these means we can
// only have one FDISTR/FENSLV/FREPRO sequence going at any given time
// BSD Trek, from which we swiped the idea, can have up to 5.
function unschedule(evtype){
  // Remove an event from the schedule.
  $g(game.future,evtype).date=FOREVER;
  return $g(game.future,evtype);
}
function is_scheduled(evtype){
  // Is an event of specified type scheduled.
  return $ne($g(game.future,evtype).date,FOREVER);
}
function scheduled(evtype){
  // When will this event happen?
  return $g(game.future,evtype).date;
}
function schedule(evtype,offset){
  // Schedule an event of specified type.
  $g(game.future,evtype).date=$add(game.state.date,offset);
  return $g(game.future,evtype);
}
function postpone(evtype,offset){
  // Postpone a scheduled event.
  $g(game.future,evtype).date=$add($g(game.future,evtype).date,offset);
}
function* cancelrest(){
  // Rest period is interrupted by event.
  if($t(game.resting)){
    (yield* skip(1));
    proutn("Mr. Spock-  \"Captain, shall we cancel the rest period?\"");
    if((yield* ja())){
      game.resting=false;
      game.optime=0;
      return true;
    }
  }
  return false;
}
function* events(){
  var i,fintim,yank,ictbeam,istract,w,hold,ev,ev2,radio_was_broken,evcode,datemin,l,xtime,repair,ibq,cmdr,pquad,pdest,q,m;
  // Run through the event queue looking for things to do.
  i=0;
  fintim=$add(game.state.date,game.optime);
  yank=0;
  ictbeam=false;
  istract=false;
  w=new Coord();
  hold=new Coord();
  ev=new Event();
  ev2=new Event();
  function* tractorbeam(yank){
    // Tractor-beaming cases merge here.
    (yield* announce());
    game.optime=$mul($div(10,(7.5*7.5)),yank); // 7.5 is yank rate (warp 7.5)
    (yield* skip(1));
    (yield* prout($add($add("***",crmshp())," caught in long range tractor beam--")));
    // If Kirk & Co. screwing around on planet, handle
    (yield* atover(true)); // atover(true) is Grab
    if($t(game.alldone)){
      return;
    }
    if($t(game.icraft)){
      (yield* finish(FSTRACTOR));
      return;
    }
    // Check to see if shuttle is aboard
    if((game.iscraft==="offship")){
      (yield* skip(1));
      if(rnd.withprob(0.5)){
        (yield* prout("Galileo, left on the planet surface, is captured"));
        (yield* prout("by aliens and made into a flying McDonald's."));
        $s(game.damage,DSHUTTL,(-10));
        game.iscraft="removed";
      }else{
        (yield* prout("Galileo, left on the planet surface, is well hidden."));
      }
    }
    // Copy to avoid aliasing commander coords that can be invalidated later.
    if($eq(evcode,FSPY)){
      game.quadrant=$copy(game.state.kscmdr);
    }else{
      game.quadrant=$copy($g(game.state.kcmdr,i));
    }
    game.sector=randplace(QUADSIZE);
    (yield* prout($add(crmshp(),$fmt(" is pulled to Quadrant %s, Sector %s",[game.quadrant,game.sector]))));
    if($t(game.resting)){
      (yield* prout("(Remainder of rest/repair period cancelled.)"));
      game.resting=false;
    }
    if(!$t(game.shldup)){
      if((!damaged(DSHIELD) && (game.shield>0))){
        (yield* doshield(true)); // raise shields
        game.shldchg=false;
      }else{
        (yield* prout("(Shields not currently useable.)"));
      }
    }
    (yield* newqad());
    // Adjust finish time to time of tractor beaming?
    // fintim = game.state.date+game.optime
    (yield* attack(false));
    if(!$t(game.state.kcmdr)){
      unschedule(FTBEAM);
    }else{
      schedule(FTBEAM,$add(game.optime,expran($div($mul(1.5,game.intime),$len(game.state.kcmdr)))));
    }
  }
  function* destroybase(){
    // Code merges here for any commander destroying a starbase.
    // Not perfect, but will have to do
    // Handle case where base is in same quadrant as starship
    if($eq(game.battle,game.quadrant)){
      $g($g(game.state.chart,game.battle.i),game.battle.j).starbase=false;
      $s($g(game.quad,game.base.i),game.base.j,".");
      game.base.invalidate();
      newcnd();
      (yield* skip(1));
      (yield* prout("Spock-  \"Captain, I believe the starbase has been destroyed.\""));
    }else if(($t(game.state.baseq) && communicating())){
      // Get word via subspace radio
      (yield* announce());
      (yield* skip(1));
      (yield* prout("Lt. Uhura-  \"Captain, Starfleet Command reports that"));
      proutn($fmt("   the starbase in Quadrant %s has been destroyed by",game.battle));
      if((game.isatb==2)){
        (yield* prout("the Klingon Super-Commander"));
      }else{
        (yield* prout("a Klingon Commander"));
      }
      $g($g(game.state.chart,game.battle.i),game.battle.j).starbase=false;
    }
    // Remove Starbase from galaxy
    $g($g(game.state.galaxy,game.battle.i),game.battle.j).starbase=false;
    game.state.baseq=(()=>{const $r=[];for(const x of $iter(game.state.baseq)){if($ne(x,game.battle)){$r.push(x);}}return $r})();
    if((game.isatb==2)){
      // reinstate a commander's base attack
      game.battle=hold;
      game.isatb=0;
    }else{
      game.battle.invalidate();
    }
  }
  if($t(game.idebug)){
    (yield* prout($fmt("=== EVENTS from %.2f to %.2f:",[game.state.date,fintim])));
    for(i of $range(1,NEVENTS)){
      if($eq(i,FSNOVA)){
        proutn("=== Supernova       ");
      }else if($eq(i,FTBEAM)){
        proutn("=== T Beam          ");
      }else if($eq(i,FSNAP)){
        proutn("=== Snapshot        ");
      }else if($eq(i,FBATTAK)){
        proutn("=== Base Attack     ");
      }else if($eq(i,FCDBAS)){
        proutn("=== Base Destroy    ");
      }else if($eq(i,FSCMOVE)){
        proutn("=== SC Move         ");
      }else if($eq(i,FSCDBAS)){
        proutn("=== SC Base Destroy ");
      }else if($eq(i,FDSPROB)){
        proutn("=== Probe Move      ");
      }else if($eq(i,FDISTR)){
        proutn("=== Distress Call   ");
      }else if($eq(i,FENSLV)){
        proutn("=== Enslavement     ");
      }else if($eq(i,FREPRO)){
        proutn("=== Klingon Build   ");
      }
      if($t(is_scheduled(i))){
        (yield* prout($fmt("%.2f",scheduled(i))));
      }else{
        (yield* prout("never"));
      }
    }
  }
  radio_was_broken=damaged(DRADIO);
  {const $v=0;hold.i=$v;hold.j=$v;}
  for(;;){
    // Select earliest extraneous event, evcode==0 if no events
    evcode=FSPY;
    if($t(game.alldone)){
      return;
    }
    datemin=fintim;
    for(l of $range(1,NEVENTS)){
      if(($g(game.future,l).date<datemin)){
        evcode=l;
        if($t(game.idebug)){
          (yield* prout($fmt("== Event %d fires",evcode)));
        }
        datemin=$g(game.future,l).date;
      }
    }
    xtime=$sub(datemin,game.state.date);
    if($t(game.iscloaked)){
      game.energy=$sub(game.energy,$mul(xtime,500));
      if((game.energy<=0)){
        (yield* finish(FNRG));
        return;
      }
    }
    game.state.date=datemin;
    // Decrement Federation resources and recompute remaining time
    game.state.remres=$sub(game.state.remres,$mul($add(game.remkl(),(4*$len(game.state.kcmdr))),xtime));
    game.recompute();
    if((game.state.remtime<=0)){
      (yield* finish(FDEPLETE));
      return;
    }
    // Any crew left alive?
    if((game.state.crew<=0)){
      (yield* finish(FCREW));
      return;
    }
    // Is life support adequate?
    if((damaged(DLIFSUP) && (game.condition!=="docked"))){
      if(((game.lsupres<xtime) && ($g(game.damage,DLIFSUP)>game.lsupres))){
        (yield* finish(FLIFESUP));
        return;
      }
      game.lsupres=$sub(game.lsupres,xtime);
      if(($g(game.damage,DLIFSUP)<=xtime)){
        game.lsupres=game.inlsr;
      }
    }
    // Fix devices
    repair=xtime;
    if((game.condition==="docked")){
      repair=$div(repair,DOCKFAC);
    }
    // Don't fix Deathray here
    for(l of $range(NDEVICES)){
      if((($g(game.damage,l)>0) && $ne(l,DDRAY))){
        if(($sub($g(game.damage,l),repair)>0)){
          $s(game.damage,l,$sub($g(game.damage,l),repair));
        }else{
          $s(game.damage,l,0);
        }
      }
    }
    // If radio repaired, update star chart and attack reports
    if(($t(radio_was_broken) && !damaged(DRADIO))){
      (yield* prout("Lt. Uhura- \"Captain, the sub-space radio is working and"));
      (yield* prout("   surveillance reports are coming in."));
      (yield* skip(1));
      if(!$t(game.iseenit)){
        (yield* attackreport(false));
        game.iseenit=true;
      }
      rechart();
      (yield* prout("   The star chart is now up to date.\""));
      (yield* skip(1));
    }
    // Cause extraneous event EVCODE to occur
    game.optime=$sub(game.optime,xtime);
    if($eq(evcode,FSNOVA)){
      (yield* announce());
      (yield* supernova(null));
      schedule(FSNOVA,expran($mul(0.5,game.intime)));
      if($t($g($g(game.state.galaxy,game.quadrant.i),game.quadrant.j).supernova)){
        return;
      }
    }else if($eq(evcode,FSPY)){
      // Check with spy to see if SC should tractor beam
      if(((game.state.nscrem==0) || $t(game.iscloaked) || $t(ictbeam) || $t(istract) || (game.condition==="docked") || (game.isatb==1) || $t(game.iscate))){
        return;
      }
      if(($t(game.ientesc) || ((game.energy<2000) && (game.torps<4) && (game.shield<1250)) || (damaged(DPHASER) && (damaged(DPHOTON) || (game.torps<4))) || (damaged(DSHIELD) && ((game.energy<2500) || damaged(DPHASER)) && ((game.torps<5) || damaged(DPHOTON))))){
        // Tractor-beam her!
        {const $v=true;istract=$v;ictbeam=$v;}
        (yield* tractorbeam($sub(game.state.kscmdr,game.quadrant).distance()));
      }else{
        return;
      }
    }else if($eq(evcode,FTBEAM)){
      // Tractor beam
      if(!$t(game.state.kcmdr)){
        unschedule(FTBEAM);
        continue;
      }
      i=rnd.integer($len(game.state.kcmdr));
      yank=$sub($g(game.state.kcmdr,i),game.quadrant).distance();
      if(($t(istract) || (game.condition==="docked") || $t(game.iscloaked) || (yank==0))){
        // Drats! Have to reschedule
        schedule(FTBEAM,$add(game.optime,expran($div($mul(1.5,game.intime),$len(game.state.kcmdr)))));
        continue;
      }
      ictbeam=true;
      (yield* tractorbeam(yank));
    }else if($eq(evcode,FSNAP)){
      // Snapshot of the universe (for time warp)
      game.snapsht=$deepcopy(game.state);
      game.state.snap=true;
      schedule(FSNAP,expran($mul(0.5,game.intime)));
    }else if($eq(evcode,FBATTAK)){
      // Commander attacks starbase
      if((!$t(game.state.kcmdr) || !$t(game.state.baseq))){
        // no can do
        unschedule(FBATTAK);
        unschedule(FCDBAS);
        continue;
      }
      ibq=null; // Force battle location to persist past loop
      try{
        for(ibq of $iter(game.state.baseq)){
          for(cmdr of $iter(game.state.kcmdr)){
            if(($eq(ibq,cmdr) && $ne(ibq,game.quadrant) && $ne(ibq,game.state.kscmdr))){
              throw new JumpOut();
            }
          }
        }
        // no match found -- try later
        schedule(FBATTAK,expran($mul(0.3,game.intime)));
        unschedule(FCDBAS);
        continue;
      }catch($e){
        if($e instanceof JumpOut){
        }else{
          throw $e;
        }
      }
      // commander + starbase combination found -- launch attack
      game.battle=ibq;
      schedule(FCDBAS,rnd.real(1,4));
      if($t(game.isatb)){
        postpone(FCDBAS,$sub(scheduled(FSCDBAS),game.state.date));
      }
      $g(game.future,FBATTAK).date=$add($g(game.future,FCDBAS).date,expran($mul(0.3,game.intime)));
      game.iseenit=false;
      if(!communicating()){
        continue;
      }
      // No warning :-(
      game.iseenit=true;
      (yield* announce());
      (yield* skip(1));
      (yield* prout($fmt("Lt. Uhura-  \"Captain, the starbase in Quadrant %s",game.battle)));
      (yield* prout("   reports that it is under attack and that it can"));
      (yield* prout($fmt("   hold out only until stardate %d.\"",$int(scheduled(FCDBAS)))));
      if($t((yield* cancelrest()))){
        return;
      }
    }else if($eq(evcode,FSCDBAS)){
      // Supercommander destroys base
      unschedule(FSCDBAS);
      game.isatb=2;
      if(!$t($g($g(game.state.galaxy,game.state.kscmdr.i),game.state.kscmdr.j).starbase)){
        continue;
      }
      // WAS RETURN!
      hold=game.battle;
      game.battle=game.state.kscmdr;
      (yield* destroybase());
    }else if($eq(evcode,FCDBAS)){
      // Commander succeeds in destroying base
      if($eq(evcode,FCDBAS)){
        unschedule(FCDBAS);
        if((!$t(game.state.baseq) || !$t($g($g(game.state.galaxy,game.battle.i),game.battle.j).starbase))){
          game.battle.invalidate();
          continue;
        }
        // find the lucky pair
        var $else2890=true;
        for(cmdr of $iter(game.state.kcmdr)){
          if($eq(cmdr,game.battle)){
            $else2890=false;
            break;
          }
        }
        if($else2890){
          // No action to take after all
          continue;
        }
      }
      (yield* destroybase());
    }else if($eq(evcode,FSCMOVE)){
      // Supercommander moves
      schedule(FSCMOVE,0.2777);
      if((!$t(game.ientesc) && !$t(istract) && (game.isatb!=1) && (!$t(game.iscate) || !$t(game.justin)))){
        (yield* supercommander());
      }
    }else if($eq(evcode,FDSPROB)){
      // Move deep space probe
      schedule(FDSPROB,0.01);
      if(!game.probe.nextstep()){
        if((!game.probe.quadrant().valid_quadrant() || $t($g($g(game.state.galaxy,game.probe.quadrant().i),game.probe.quadrant().j).supernova))){
          // Left galaxy or ran into supernova
          if(communicating()){
            (yield* announce());
            (yield* skip(1));
            proutn("Lt. Uhura-  \"The deep space probe ");
            if(!game.probe.quadrant().valid_quadrant()){
              (yield* prout("has left the galaxy.\""));
            }else{
              (yield* prout("is no longer transmitting.\""));
            }
          }
          unschedule(FDSPROB);
          continue;
        }
        if(communicating()){
          // announce()
          (yield* skip(1));
          (yield* prout($fmt("Lt. Uhura-  \"The deep space probe is now in Quadrant %s.\"",game.probe.quadrant())));
        }
      }
      pquad=game.probe.quadrant();
      pdest=$g($g(game.state.galaxy,pquad.i),pquad.j);
      if(communicating()){
        $g($g(game.state.chart,pquad.i),pquad.j).klingons=pdest.klingons;
        $g($g(game.state.chart,pquad.i),pquad.j).starbase=pdest.starbase;
        $g($g(game.state.chart,pquad.i),pquad.j).stars=pdest.stars;
        $g($g(game.state.chart,pquad.i),pquad.j).supernova=pdest.supernova;
        pdest.charted=true;
      }
      game.probe.moves=(game.probe.moves-1); // One less to travel
      if((game.probe.arrived() && $t(game.isarmed) && $t(pdest.stars))){
        (yield* supernova(game.probe.quadrant())); // fire in the hole!
        unschedule(FDSPROB);
        if($t($g($g(game.state.galaxy,pquad.i),pquad.j).supernova)){
          return;
        }
      }
    }else if($eq(evcode,FDISTR)){
      // inhabited system issues distress call
      unschedule(FDISTR);
      // try a whole bunch of times to find something suitable
      var $else2950=true;
      for(i of $range(100)){
        // need a quadrant which is not the current one,
        // which has some stars which are inhabited and
        // not already under attack, which is not
        // supernova'ed, and which has some Klingons in it
        w=randplace(GALSIZE);
        q=$g($g(game.state.galaxy,w.i),w.j);
        if(!($eq(game.quadrant,w) || (q.planet==null) || !$t(q.planet.inhabited) || $t(q.supernova) || (q.status!=="secure") || (q.klingons<=0))){
          $else2950=false;
          break;
        }
      }
      if($else2950){
        // can't seem to find one; ignore this call
        if($t(game.idebug)){
          (yield* prout("=== Couldn't find location for distress event."));
        }
        continue;
      }
      // got one!!  Schedule its enslavement
      ev=schedule(FENSLV,expran(game.intime));
      ev.quadrant=w;
      q.status="distressed";
      // tell the captain about it if we can
      if(communicating()){
        (yield* prout($fmt("Uhura- Captain, %s in Quadrant %s reports it is under attack",[q.planet,$repr(w)])));
        (yield* prout("by a Klingon invasion fleet."));
        if($t((yield* cancelrest()))){
          return;
        }
      }
    }else if($eq(evcode,FENSLV)){
      // starsystem is enslaved
      ev=unschedule(FENSLV);
      // see if current distress call still active
      q=$g($g(game.state.galaxy,ev.quadrant.i),ev.quadrant.j);
      if((q.klingons<=0)){
        q.status="secure";
        continue;
      }
      q.status="enslaved";
      // play stork and schedule the first baby
      ev2=schedule(FREPRO,expran($mul(2,game.intime)));
      ev2.quadrant=ev.quadrant;
      // report the disaster if we can
      if(communicating()){
        (yield* prout($fmt("Uhura- We've lost contact with starsystem %s",q.planet)));
        (yield* prout($fmt("in Quadrant %s.\n",ev.quadrant)));
      }
    }else if($eq(evcode,FREPRO)){
      // Klingon reproduces
      // If we ever switch to a real event queue, we'll need to
      // explicitly retrieve and restore the x and y.
      ev=schedule(FREPRO,expran($mul(1,game.intime)));
      // see if current distress call still active
      q=$g($g(game.state.galaxy,ev.quadrant.i),ev.quadrant.j);
      if((q.klingons<=0)){
        q.status="secure";
        continue;
      }
      if((game.remkl()>=MAXKLGAME)){
        continue;
      }
      // full right now
      // reproduce one Klingon
      w=ev.quadrant;
      m=new Coord();
      if((game.klhere>=MAXKLQUAD)){
        try{
          // this quadrant not ok, pick an adjacent one
          for(m.i of $range((w.i-1),(w.i+2))){
            for(m.j of $range((w.j-1),(w.j+2))){
              if(!m.valid_quadrant()){
                continue;
              }
              q=$g($g(game.state.galaxy,m.i),m.j);
              // check for this quad ok (not full & no snova)
              if(((q.klingons>=MAXKLQUAD) || $t(q.supernova))){
                continue;
              }
              throw new JumpOut();
            }
          }
          // search for eligible quadrant failed
          continue;
        }catch($e){
          if($e instanceof JumpOut){
            w=m;
          }else{
            throw $e;
          }
        }
      }
      // deliver the child
      q.klingons=(q.klingons+1);
      if($eq(game.quadrant,w)){
        game.klhere=(game.klhere+1);
        newkling(); // also adds it to game.enemies
      }
      // recompute time left
      game.recompute();
      if(communicating()){
        if($eq(game.quadrant,w)){
          (yield* prout("Spock- sensors indicate the Klingons have"));
          (yield* prout($fmt("launched a warship from %s.",q.planet)));
        }else{
          (yield* prout("Uhura- Starfleet reports increased Klingon activity"));
          if((q.planet!=null)){
            proutn($fmt("near %s ",q.planet));
          }
          (yield* prout($fmt("in Quadrant %s.",w)));
        }
      }
    }
  }
}
function* wait(){
  var origTime,delay,key,temp,rtime;
  // Wait on events.
  game.ididit=false;
  for(;;){
    key=(yield* scanner.nexttok());
    if((key!=="IHEOL")){
      break;
    }
    proutn("How long? ");
    scanner.chew();
  }
  if((key!=="IHREAL")){
    (yield* huh());
    return;
  }
  {const $v=scanner.real;origTime=$v;delay=$v;}
  if((delay<=0)){
    return;
  }
  if(((!$t(game.sandbox) && (delay>=game.state.remtime)) || ($len(game.enemies)!=0))){
    proutn("Are you sure? ");
    if(!(yield* ja())){
      return;
    }
  }
  // Alternate resting periods (events) with attacks
  game.resting=true;
  for(;;){
    if((delay<=0)){
      game.resting=false;
    }
    if(!$t(game.resting)){
      if(!$t(game.sandbox)){
        (yield* prout($fmt("%d stardates left.",$int(game.state.remtime))));
      }
      return;
    }
    {const $v=delay;temp=$v;game.optime=$v;}
    if($t($len(game.enemies))){
      rtime=rnd.real(1,2);
      temp=$min(temp,rtime);
      game.optime=temp;
    }
    if((game.optime<delay)){
      (yield* attack(false));
    }
    if($t(game.alldone)){
      return;
    }
    (yield* events());
    game.ididit=true;
    if($t(game.alldone)){
      return;
    }
    delay=$sub(delay,temp);
    // Repair Deathray if long rest at starbase
    if((($sub(origTime,delay)>=9.99) && (game.condition==="docked"))){
      $s(game.damage,DDRAY,0);
    }
    // leave if quadrant supernovas
    if($t($g($g(game.state.galaxy,game.quadrant.i),game.quadrant.j).supernova)){
      break;
    }
  }
  game.resting=false;
  game.optime=0;
}
function* nova(nov){
  var ncourse,newc,neighbor,bump,hits,kount,dist,direc,scourse,offset,start,iquad,diff,target,ll,iquad1;
  // Star goes nova.
  ncourse=[0,10.5,12,1.5,9,0,3,7.5,6,4.5];
  newc=new Coord();
  neighbor=new Coord();
  bump=new Coord(0,0);
  if(rnd.withprob(0.05)){
    // Wow! We've supernova'ed
    (yield* supernova(game.quadrant));
    return;
  }
  // handle initial nova
  $s($g(game.quad,nov.i),nov.j,".");
  if((game.options&OPTION_BSDTREK)){
    if(rnd.withprob(0.25)){
      $s($g(game.quad,nov.i),nov.j," ");
    }
  }
  (yield* prout($add(crmena(false,"*","sector",nov)," novas.")));
  $g($g(game.state.galaxy,game.quadrant.i),game.quadrant.j).stars=($g($g(game.state.galaxy,game.quadrant.i),game.quadrant.j).stars-1);
  game.state.starkl=(game.state.starkl+1);
  // Set up queue to recursively trigger adjacent stars
  hits=[nov];
  kount=0;
  while($t(hits)){
    offset=new Coord();
    start=$pop(hits);
    for(offset.i of $range((-1),(1+1))){
      for(offset.j of $range((-1),(1+1))){
        if(((offset.j==0) && (offset.i==0))){
          continue;
        }
        neighbor=$add(start,offset);
        if(!neighbor.valid_sector()){
          continue;
        }
        iquad=$g($g(game.quad,neighbor.i),neighbor.j);
        // Empty space ends reaction
        if($in(iquad,[".","?"," ","T","#"])){
        }else if((iquad==="*")){
          // Affect another star
          if(rnd.withprob(0.05)){
            // This star supernovas
            (yield* supernova(game.quadrant));
            return;
          }else{
            hits.push(neighbor);
            $g($g(game.state.galaxy,game.quadrant.i),game.quadrant.j).stars=($g($g(game.state.galaxy,game.quadrant.i),game.quadrant.j).stars-1);
            game.state.starkl=(game.state.starkl+1);
            proutn(crmena(true,"*","sector",neighbor));
            (yield* prout(" novas."));
            $s($g(game.quad,neighbor.i),neighbor.j,".");
            kount=(kount+1);
          }
        }else if($in(iquad,["P","@"])){
          // Destroy planet
          $g($g(game.state.galaxy,game.quadrant.i),game.quadrant.j).planet=null;
          if((iquad==="P")){
            game.state.nplankl=(game.state.nplankl+1);
          }else{
            game.state.nworldkl=(game.state.nworldkl+1);
          }
          (yield* prout($add(crmena(true,"B","sector",neighbor)," destroyed.")));
          game.iplnet.pclass="destroyed";
          game.iplnet=null;
          game.plnet.invalidate();
          if($t(game.landed)){
            (yield* finish(FPNOVA));
            return;
          }
          $s($g(game.quad,neighbor.i),neighbor.j,".");
        }else if((iquad==="B")){
          // Destroy base
          $g($g(game.state.galaxy,game.quadrant.i),game.quadrant.j).starbase=false;
          game.state.baseq=(()=>{const $r=[];for(const x of $iter(game.state.baseq)){if($ne(x,game.quadrant)){$r.push(x);}}return $r})();
          game.base.invalidate();
          game.state.basekl=(game.state.basekl+1);
          newcnd();
          (yield* prout($add(crmena(true,"B","sector",neighbor)," destroyed.")));
          $s($g(game.quad,neighbor.i),neighbor.j,".");
        }else if($in(iquad,["E","F"])){
          // Buffet ship
          (yield* prout("***Starship buffeted by nova."));
          if($t(game.shldup)){
            if((game.shield>=2000)){
              game.shield=(game.shield-2000);
            }else{
              diff=(2000-game.shield);
              game.energy=$sub(game.energy,diff);
              game.shield=0;
              game.shldup=false;
              (yield* prout("***Shields knocked out."));
              $s(game.damage,DSHIELD,$add($g(game.damage,DSHIELD),$mul($mul($mul(0.005,game.damfac),rnd.real()),diff)));
            }
          }else{
            game.energy=(game.energy-2000);
          }
          if((game.energy<=0)){
            (yield* finish(FNOVA));
            return;
          }
          // add in course nova contributes to kicking starship
          if($t(hits)){
            bump=$add(bump,$sub(game.sector,$g(hits,(-1))).sgn());
          }
        }else if((iquad==="K")){
          // kill klingon
          (yield* deadkl(neighbor,iquad,neighbor));
        }else if($in(iquad,["C","S","R"])){
          // Damage/destroy big enemies
          target=null;
          for(ll of $range($len(game.enemies))){
            if($eq($g(game.enemies,ll).location,neighbor)){
              target=$g(game.enemies,ll);
              break;
            }
          }
          if((target!=null)){
            target.power=(target.power-800); // If firepower is lost, die
            if((target.power<=0)){
              (yield* deadkl(neighbor,iquad,neighbor));
              continue;
            }
            // neighbor loop
            // Else enemy gets flung by the blast wave
            newc=$sub($add(neighbor,neighbor),start);
            proutn($add(crmena(true,iquad,"sector",neighbor)," damaged"));
            if(!newc.valid_sector()){
              // can't leave quadrant
              (yield* skip(1));
              continue;
            }
            iquad1=$g($g(game.quad,newc.i),newc.j);
            if((iquad1===" ")){
              proutn($add(", blasted into ",crmena(false," ","sector",newc)));
              (yield* skip(1));
              (yield* deadkl(neighbor,iquad,newc));
              continue;
            }
            if((iquad1!==".")){
              // can't move into something else
              (yield* skip(1));
              continue;
            }
            (yield* prout($fmt(", buffeted to Sector %s",newc)));
            $s($g(game.quad,neighbor.i),neighbor.j,".");
            $s($g(game.quad,newc.i),newc.j,iquad);
            target.move(newc);
          }
        }
      }
    }
  }
  // Starship affected by nova -- kick it away.
  dist=$mul(kount,0.1);
  direc=$g(ncourse,($add($mul(3,(bump.i+1)),bump.j)+2));
  if((direc==0)){
    dist=0;
  }
  if((dist==0)){
    return;
  }
  scourse=new course(direc,dist);
  game.optime=scourse.time(4);
  (yield* skip(1));
  (yield* prout("Force of nova displaces starship."));
  (yield* imove(scourse,true));
  game.optime=scourse.time(4);
  return;
}
function* supernova(w){
  var num,npdead,survivors,nrmdead,loop,nq,nstars,ns;
  // Star goes supernova.
  num=0;
  npdead=0;
  if((w!=null)){
    nq=$copy(w);
  }else{
    // Scheduled supernova -- select star at random.
    nstars=0;
    nq=new Coord();
    for(nq.i of $range(GALSIZE)){
      for(nq.j of $range(GALSIZE)){
        nstars=$add(nstars,$g($g(game.state.galaxy,nq.i),nq.j).stars);
      }
    }
    if((nstars==0)){
      return; // nothing to supernova exists
    }
    num=(rnd.integer(nstars)+1);
    for(nq.i of $range(GALSIZE)){
      for(nq.j of $range(GALSIZE)){
        num=$sub(num,$g($g(game.state.galaxy,nq.i),nq.j).stars);
        if((num<=0)){
          break;
        }
      }
      if((num<=0)){
        break;
      }
    }
    if($t(game.idebug)){
      proutn("=== Super nova here?");
      if((yield* ja())){
        nq=game.quadrant;
      }
    }
  }
  if(($ne(nq,game.quadrant) || $t(game.justin))){
    // it isn't here, or we just entered (treat as enroute)
    if(communicating()){
      (yield* skip(1));
      (yield* prout($fmt("Message from Starfleet Command       Stardate %.2f",game.state.date)));
      (yield* prout($fmt("     Supernova in Quadrant %s; caution advised.",nq)));
    }
  }else{
    ns=new Coord();
    // we are in the quadrant!
    num=(rnd.integer($g($g(game.state.galaxy,nq.i),nq.j).stars)+1);
    for(ns.i of $range(QUADSIZE)){
      for(ns.j of $range(QUADSIZE)){
        if(($g($g(game.quad,ns.i),ns.j)==="*")){
          num=(num-1);
          if((num==0)){
            break;
          }
        }
      }
      if((num==0)){
        break;
      }
    }
    (yield* skip(1));
    prouts("***RED ALERT!  RED ALERT!");
    (yield* skip(1));
    (yield* prout($fmt("***Incipient supernova detected at Sector %s",ns)));
    if(($add($pow($sub(ns.i,game.sector.i),2),$pow($sub(ns.j,game.sector.j),2))<=2.1)){
      proutn("Emergency override attempts t");
      prouts("***************");
      (yield* skip(1));
      (yield* stars());
      game.alldone=true;
    }
  }
  // destroy any Klingons in supernovaed quadrant
  $g($g(game.state.galaxy,nq.i),nq.j).klingons=0;
  if($eq(nq,game.state.kscmdr)){
    // did in the Supercommander!
    {const $v=0;game.state.nscrem=$v;game.isatb=$v;}
    game.state.kscmdr.invalidate();
    game.iscate=false;
    unschedule(FSCMOVE);
    unschedule(FSCDBAS);
  }
  // Changing this to a list comprehension here causes regression-test failure.
  survivors=$list(filter(((w)=>$ne(w,nq)),game.state.kcmdr));
  // comkills = len(game.state.kcmdr) - len(survivors)
  game.state.kcmdr=survivors;
  if(!$t(game.state.kcmdr)){
    unschedule(FTBEAM);
  }
  // destroy Romulans and planets in supernovaed quadrant
  nrmdead=$g($g(game.state.galaxy,nq.i),nq.j).romulans;
  $g($g(game.state.galaxy,nq.i),nq.j).romulans=0;
  game.state.nromrem=$sub(game.state.nromrem,nrmdead);
  // Destroy planets
  for(loop of $range(game.inplan)){
    if($eq($g(game.state.planets,loop).quadrant,nq)){
      $g(game.state.planets,loop).pclass="destroyed";
      npdead=(npdead+1);
    }
  }
  // Destroy any base in supernovaed quadrant
  game.state.baseq=(()=>{const $r=[];for(const x of $iter(game.state.baseq)){if($ne(x,nq)){$r.push(x);}}return $r})();
  // If starship caused supernova, tally up destruction
  if((w!=null)){
    game.state.starkl=$add(game.state.starkl,$g($g(game.state.galaxy,nq.i),nq.j).stars);
    game.state.basekl=$add(game.state.basekl,$g($g(game.state.galaxy,nq.i),nq.j).starbase);
    game.state.nplankl=$add(game.state.nplankl,npdead);
  }
  // Destruction is physical; only knowledge of it depends on communications.
  $g($g(game.state.galaxy,nq.i),nq.j).starbase=false;
  $g($g(game.state.galaxy,nq.i),nq.j).planet=null;
  $g($g(game.state.galaxy,nq.i),nq.j).supernova=true;
  if(($eq(game.quadrant,nq) || communicating())){
    $g($g(game.state.chart,nq.i),nq.j).supernova=true;
  }
  // If supernova destroys last Klingons give special message
  if(((game.unwon()==0) && $ne(nq,game.quadrant))){
    (yield* skip(2));
    if((w==null)){
      (yield* prout("Lucky you!"));
    }
    proutn($fmt("A supernova in %s has just destroyed the last Klingons.",nq));
    (yield* finish(FWON));
    return;
  }
  // if some Klingons remain, continue or die in supernova
  if($t(game.alldone)){
    (yield* finish(FSNOVAED));
  }
  return;
}
// Code from finish.c ends here.
function* selfdestruct(){
  // Self-destruct maneuver. Finish with a BANG!
  scanner.chew();
  if(damaged(DCOMPTR)){
    (yield* prout("Computer damaged; cannot execute destruct sequence."));
    return;
  }
  prouts("---WORKING---");
  (yield* skip(1));
  prouts("SELF-DESTRUCT-SEQUENCE-ACTIVATED");
  (yield* skip(1));
  prouts("   10");
  (yield* skip(1));
  prouts("       9");
  (yield* skip(1));
  prouts("          8");
  (yield* skip(1));
  prouts("             7");
  (yield* skip(1));
  prouts("                6");
  (yield* skip(1));
  (yield* skip(1));
  (yield* prout("ENTER-CORRECT-PASSWORD-TO-CONTINUE-"));
  (yield* skip(1));
  (yield* prout("SELF-DESTRUCT-SEQUENCE-OTHERWISE-"));
  (yield* skip(1));
  (yield* prout("SELF-DESTRUCT-SEQUENCE-WILL-BE-ABORTED"));
  (yield* skip(1));
  (yield* scanner.nexttok());
  if($ne(game.passwd,scanner.token)){
    prouts("PASSWORD-REJECTED;");
    (yield* skip(1));
    prouts("CONTINUITY-EFFECTED");
    (yield* skip(2));
    return;
  }
  prouts("PASSWORD-ACCEPTED");
  (yield* skip(1));
  prouts("                   5");
  (yield* skip(1));
  prouts("                      4");
  (yield* skip(1));
  prouts("                         3");
  (yield* skip(1));
  prouts("                            2");
  (yield* skip(1));
  prouts("                              1");
  (yield* skip(1));
  if(rnd.withprob(0.15)){
    prouts("GOODBYE-CRUEL-WORLD");
    (yield* skip(1));
  }
  (yield* kaboom());
}
function* kaboom(){
  var whammo,e;
  (yield* stars());
  if((game.ship==="E")){
    prouts("***");
  }
  prouts($fmt("********* Entropy of %s maximized *********",crmshp()));
  (yield* skip(1));
  (yield* stars());
  (yield* skip(1));
  if(($len(game.enemies)!=0)){
    whammo=$mul(25,game.energy);
    for(e of $iter($rev(game.enemies))){
      if(($mul(e.power,e.kdist)<=whammo)){
        (yield* deadkl(e.location,$g($g(game.quad,e.location.i),e.location.j),e.location));
      }
    }
  }
  (yield* finish(FDILITHIUM));
}
function killrate(){
  var elapsed,starting,remaining;
  // Compute our rate of kils over time.
  elapsed=$sub(game.state.date,game.indate);
  if((elapsed==0)){
    return 0;
  }else{
    starting=$add($add(game.inkling,game.incom),game.inscom);
    remaining=game.unwon();
    return $div($sub(starting,remaining),elapsed);
  }
}
function badpoints(){
  var badpt;
  // Compute demerits.
  badpt=$add($add($add($add($add($add($add($mul(5,game.state.starkl),game.casual),$mul(10,game.state.nplankl)),$mul(300,game.state.nworldkl)),$mul(45,game.nhelp)),$mul(100,game.state.basekl)),$mul(3,game.abandoned)),$mul(100,game.ncviol));
  if((game.ship==="F")){
    badpt=(badpt+100);
  }else if((game.ship==null)){
    badpt=(badpt+200);
  }
  return badpt;
}
function* finish(ifin){
  var igotit,goodies,baddies,badpt;
  // end the game, with appropriate notifications
  igotit=false;
  game.alldone=true;
  (yield* skip(3));
  (yield* prout($fmt("It is stardate %.1f.",game.state.date)));
  (yield* skip(1));
  if($eq(ifin,FWON)){
    if((game.state.nromrem!=0)){
      (yield* prout($fmt("The remaining %d Romulans surrender to Starfleet Command.",game.state.nromrem)));
    }
    (yield* prout("You have smashed the Klingon invasion fleet and saved"));
    (yield* prout("the Federation."));
    if(($t(game.alive) && ($sub(game.brigcapacity,game.brigfree)>0))){
      game.kcaptured=$add(game.kcaptured,$sub(game.brigcapacity,game.brigfree));
      (yield* prout($fmt("The %d captured Klingons are transferred to Star Fleet Command.",$sub(game.brigcapacity,game.brigfree))));
    }
    game.gamewon=true;
    if($t(game.alive)){
      badpt=badpoints();
      if((badpt<100)){
        badpt=0; // Close enough!
      }
      // killsPerDate >= RateMax
      if((($sub(game.state.date,game.indate)<5) || (killrate()>=$add(($mul($mul(0.1,game.skill),(game.skill+1))+0.1),$mul(0.008,badpt))))){
        (yield* skip(1));
        (yield* prout("In fact, you have done so well that Starfleet Command"));
        if($eq(game.skill,SKILL_NOVICE)){
          (yield* prout("promotes you one step in rank from \"Novice\" to \"Fair\"."));
        }else if($eq(game.skill,SKILL_FAIR)){
          (yield* prout("promotes you one step in rank from \"Fair\" to \"Good\"."));
        }else if($eq(game.skill,SKILL_GOOD)){
          (yield* prout("promotes you one step in rank from \"Good\" to \"Expert\"."));
        }else if($eq(game.skill,SKILL_EXPERT)){
          (yield* prout("promotes you to Commodore Emeritus."));
          (yield* skip(1));
          (yield* prout("Now that you think you're really good, try playing"));
          (yield* prout("the \"Emeritus\" game. It will splatter your ego."));
        }else if($eq(game.skill,SKILL_EMERITUS)){
          (yield* skip(1));
          proutn("Computer-  ");
          prouts("ERROR-ERROR-ERROR-ERROR");
          (yield* skip(2));
          prouts("  YOUR-SKILL-HAS-EXCEEDED-THE-CAPACITY-OF-THIS-PROGRAM");
          (yield* skip(1));
          prouts("  THIS-PROGRAM-MUST-SURVIVE");
          (yield* skip(1));
          prouts("  THIS-PROGRAM-MUST-SURVIVE");
          (yield* skip(1));
          prouts("  THIS-PROGRAM-MUST-SURVIVE");
          (yield* skip(1));
          prouts("  THIS-PROGRAM-MUST?- MUST ? - SUR? ? -?  VI");
          (yield* skip(2));
          (yield* prout("Now you can retire and write your own Star Trek game!"));
          (yield* skip(1));
        }
        if((game.skill>=SKILL_EXPERT)){
          if(($t(game.thawed) && !$t(game.idebug))){
            (yield* prout("You cannot get a citation, so..."));
          }else{
            proutn("Do you want your Commodore Emeritus Citation printed? ");
            scanner.chew();
            if((yield* ja())){
              igotit=true;
            }
          }
        }
      }
      // Only grant long life if alive (original didn't!)
      (yield* skip(1));
      (yield* prout("LIVE LONG AND PROSPER."));
    }
    (yield* score());
    if($t(igotit)){
      (yield* plaque());
    }
    return;
  }else if($eq(ifin,FDEPLETE)){
    // Federation Resources Depleted
    (yield* prout("Your time has run out and the Federation has been"));
    (yield* prout("conquered.  Your starship is now Klingon property,"));
    (yield* prout("and you are put on trial as a war criminal.  On the"));
    proutn("basis of your record, you are ");
    if(($mul(game.unwon(),3)>$add($add(game.inkling,game.incom),game.inscom))){
      (yield* prout("acquitted."));
      (yield* skip(1));
      (yield* prout("LIVE LONG AND PROSPER."));
    }else{
      (yield* prout("found guilty and"));
      (yield* prout("sentenced to death by slow torture."));
      game.alive=false;
    }
    (yield* score());
    return;
  }else if($eq(ifin,FLIFESUP)){
    (yield* prout("Your life support reserves have run out, and"));
    (yield* prout("you die of thirst, starvation, and asphyxiation."));
    (yield* prout("Your starship is a derelict in space."));
  }else if($eq(ifin,FNRG)){
    (yield* prout("Your energy supply is exhausted."));
    (yield* skip(1));
    (yield* prout("Your starship is a derelict in space."));
  }else if($eq(ifin,FBATTLE)){
    (yield* prout($fmt("The %s has been destroyed in battle.",crmshp())));
    (yield* skip(1));
    (yield* prout("Dulce et decorum est pro patria mori."));
  }else if($eq(ifin,FNEG3)){
    (yield* prout("You have made three attempts to cross the negative energy"));
    (yield* prout("barrier which surrounds the galaxy."));
    (yield* skip(1));
    (yield* prout("Your navigation is abominable."));
    (yield* score());
  }else if($eq(ifin,FNOVA)){
    (yield* prout("Your starship has been destroyed by a nova."));
    (yield* prout("That was a great shot."));
    (yield* skip(1));
  }else if($eq(ifin,FSNOVAED)){
    (yield* prout($fmt("The %s has been fried by a supernova.",crmshp())));
    (yield* prout("...Not even cinders remain..."));
  }else if($eq(ifin,FABANDN)){
    (yield* prout("You have been captured by the Klingons. If you still"));
    (yield* prout("had a starbase to be returned to, you would have been"));
    (yield* prout("repatriated and given another chance. Since you have"));
    (yield* prout("no starbases, you will be mercilessly tortured to death."));
  }else if($eq(ifin,FDILITHIUM)){
    (yield* prout("Your starship is now an expanding cloud of subatomic particles"));
  }else if($eq(ifin,FMATERIALIZE)){
    (yield* prout("Starbase was unable to re-materialize your starship."));
    (yield* prout("Sic transit gloria mundi."));
  }else if($eq(ifin,FPHASER)){
    (yield* prout($fmt("The %s has been cremated by its own phasers.",crmshp())));
  }else if($eq(ifin,FLOST)){
    (yield* prout("You and your landing party have been"));
    (yield* prout("converted to energy, dissipating through space."));
  }else if($eq(ifin,FMINING)){
    // This does not seem to be reachable from any code path.
    (yield* prout("You are left with your landing party on"));
    (yield* prout("a wild jungle planet inhabited by primitive cannibals."));
    (yield* skip(1));
    (yield* prout("They are very fond of \"Captain Kirk\" soup."));
    (yield* skip(1));
    (yield* prout($fmt("Without your leadership, the %s is destroyed.",crmshp())));
  }else if($eq(ifin,FDPLANET)){
    (yield* prout("You and your mining party perish."));
    (yield* skip(1));
    (yield* prout("That was a great shot."));
    (yield* skip(1));
  }else if($eq(ifin,FSSC)){
    // This does not seem to be reachable from any code path.
    (yield* prout("The Galileo is instantly annihilated by the supernova."));
    (yield* prout("You and your mining party are atomized."));
    (yield* skip(1));
    (yield* prout($fmt("Mr. Spock takes command of the %s and",crmshp())));
    (yield* prout("joins the Romulans, wreaking terror on the Federation."));
  }else if($eq(ifin,FPNOVA)){
    (yield* prout("You and your mining party are atomized."));
    (yield* skip(1));
    (yield* prout($fmt("Mr. Spock takes command of the %s and",crmshp())));
    (yield* prout("joins the Romulans, wreaking terror on the Federation."));
  }else if($eq(ifin,FSTRACTOR)){
    (yield* prout("The shuttle craft Galileo is also caught,"));
    (yield* prout("and breaks up under the strain."));
    (yield* skip(1));
    (yield* prout("Your debris is scattered for millions of miles."));
    (yield* prout($fmt("Without your leadership, the %s is destroyed.",crmshp())));
  }else if($eq(ifin,FDRAY)){
    (yield* prout("The mutants attack and kill Spock."));
    (yield* prout("Your ship is captured by Klingons, and"));
    (yield* prout("your crew is put on display in a Klingon zoo."));
  }else if($eq(ifin,FTRIBBLE)){
    (yield* prout("Tribbles consume all remaining water,"));
    (yield* prout("food, and oxygen on your ship."));
    (yield* skip(1));
    (yield* prout("You die of thirst, starvation, and asphyxiation."));
    (yield* prout("Your starship is a derelict in space."));
  }else if($eq(ifin,FHOLE)){
    (yield* prout("Your ship is drawn to the center of the black hole."));
    (yield* prout("You are crushed into extremely dense matter."));
  }else if($eq(ifin,FCLOAK)){
    game.ncviol=(game.ncviol+1);
    (yield* prout("You have violated the Treaty of Algeron."));
    (yield* prout("The Romulan Empire can never trust you again."));
  }else if($eq(ifin,FCREW)){
    (yield* prout("Your last crew member has died."));
  }
  if(($ne(ifin,FWON) && $ne(ifin,FCLOAK) && $t(game.iscloaked))){
    (yield* prout("Your ship was cloaked so your subspace radio did not receive anything."));
    (yield* prout("You may have missed some warning messages."));
    (yield* skip(1));
  }
  if((game.ship==="F")){
    game.ship=null;
  }else if((game.ship==="E")){
    game.ship="F";
  }
  game.alive=false;
  if((game.unwon()!=0)){
    goodies=$div(game.state.remres,game.inresor);
    baddies=$div($add(game.remkl(),(2*$len(game.state.kcmdr))),$add(game.inkling,$mul(2,game.incom)));
    if(($div(goodies,baddies)>=rnd.real(1,1.5))){
      (yield* prout("As a result of your actions, a treaty with the Klingon"));
      (yield* prout("Empire has been signed. The terms of the treaty are"));
      if(($div(goodies,baddies)>=rnd.real(3))){
        (yield* prout("favorable to the Federation."));
        (yield* skip(1));
        (yield* prout("Congratulations!"));
      }else{
        (yield* prout("highly unfavorable to the Federation."));
      }
    }else{
      (yield* prout("The Federation will be destroyed."));
    }
  }else{
    (yield* prout("Since you took the last Klingon with you, you are a"));
    (yield* prout("martyr and a hero. Someday maybe they'll erect a"));
    (yield* prout("statue in your memory. Rest in peace, and try not"));
    (yield* prout("to think about pigeons."));
    game.gamewon=true;
  }
  (yield* score());
  scanner.chew(); // Clean up leftovers
}
function* score(){
  var timused,ithperd,iwon,dead_ordinaries,klship;
  // Compute player's score.
  timused=$sub(game.state.date,game.indate);
  if((((timused==0) || (game.unwon()!=0)) && (timused<5))){
    timused=5;
  }
  game.perdate=killrate();
  ithperd=($mul(500,game.perdate)+0.5);
  iwon=0;
  if($t(game.gamewon)){
    iwon=$mul(100,game.skill);
  }
  if((game.ship==="E")){
    klship=0;
  }else if((game.ship==="F")){
    klship=1;
  }else{
    klship=2;
  }
  dead_ordinaries=$add($add($sub(game.inkling,game.remkl()),$len(game.state.kcmdr)),game.state.nscrem);
  game.score=$sub($add($sub($add($add($add($add($add($mul(10,dead_ordinaries),$mul(50,$sub(game.incom,$len(game.state.kcmdr)))),ithperd),iwon),$mul(20,$sub(game.inrom,game.state.nromrem))),$mul(200,$sub(game.inscom,game.state.nscrem))),game.state.nromrem),$mul(3,game.kcaptured)),badpoints());
  if(!$t(game.alive)){
    game.score=(game.score-200);
  }
  (yield* skip(2));
  (yield* prout("Your score --"));
  if($t($sub(game.inrom,game.state.nromrem))){
    (yield* prout($fmt("%6d Romulans destroyed                 %5d",[$sub(game.inrom,game.state.nromrem),$mul(20,$sub(game.inrom,game.state.nromrem))])));
  }
  if(($t(game.state.nromrem) && $t(game.gamewon))){
    (yield* prout($fmt("%6d Romulans captured                  %5d",[game.state.nromrem,game.state.nromrem])));
  }
  if($t(dead_ordinaries)){
    (yield* prout($fmt("%6d ordinary Klingons destroyed        %5d",[dead_ordinaries,$mul(10,dead_ordinaries)])));
  }
  if($t($sub(game.incom,$len(game.state.kcmdr)))){
    (yield* prout($fmt("%6d Klingon commanders destroyed       %5d",[$sub(game.incom,$len(game.state.kcmdr)),$mul(50,$sub(game.incom,$len(game.state.kcmdr)))])));
  }
  if($t(game.kcaptured)){
    (yield* prout($fmt("%d Klingons captured                   %5d",[game.kcaptured,$mul(3,game.kcaptured)])));
  }
  if($t($sub(game.inscom,game.state.nscrem))){
    (yield* prout($fmt("%6d Super-Commander destroyed          %5d",[$sub(game.inscom,game.state.nscrem),$mul(200,$sub(game.inscom,game.state.nscrem))])));
  }
  if($t(ithperd)){
    (yield* prout($fmt("%6.2f Klingons per stardate              %5d",[game.perdate,ithperd])));
  }
  if($t(game.state.starkl)){
    (yield* prout($fmt("%6d stars destroyed by your action     %5d",[game.state.starkl,$mul((-5),game.state.starkl)])));
  }
  if($t(game.state.nplankl)){
    (yield* prout($fmt("%6d planets destroyed by your action   %5d",[game.state.nplankl,$mul((-10),game.state.nplankl)])));
  }
  if(((game.options&OPTION_WORLDS) && $t(game.state.nworldkl))){
    (yield* prout($fmt("%6d inhabited planets destroyed by your action   %5d",[game.state.nworldkl,$mul((-300),game.state.nworldkl)])));
  }
  if($t(game.state.basekl)){
    (yield* prout($fmt("%6d bases destroyed by your action     %5d",[game.state.basekl,$mul((-100),game.state.basekl)])));
  }
  if($t(game.nhelp)){
    (yield* prout($fmt("%6d calls for help from starbase       %5d",[game.nhelp,$mul((-45),game.nhelp)])));
  }
  if($t(game.casual)){
    (yield* prout($fmt("%6d casualties incurred                %5d",[game.casual,(-game.casual)])));
  }
  if($t(game.abandoned)){
    (yield* prout($fmt("%6d crew abandoned in space            %5d",[game.abandoned,$mul((-3),game.abandoned)])));
  }
  if($t(klship)){
    (yield* prout($fmt("%6d ship(s) lost or destroyed          %5d",[klship,$mul((-100),klship)])));
  }
  if((game.ncviol>0)){
    if((game.ncviol==1)){
      (yield* prout("1 Treaty of Algeron violation          -100"));
    }else{
      (yield* prout($fmt("%6d Treaty of Algeron violations       %5d\n",[game.ncviol,$mul((-100),game.ncviol)])));
    }
  }
  if(!$t(game.alive)){
    (yield* prout("Penalty for getting yourself killed        -200"));
  }
  if($t(game.gamewon)){
    proutn("Bonus for winning ");
    if($eq(game.skill,SKILL_NOVICE)){
      proutn("Novice game  ");
    }else if($eq(game.skill,SKILL_FAIR)){
      proutn("Fair game    ");
    }else if($eq(game.skill,SKILL_GOOD)){
      proutn("Good game    ");
    }else if($eq(game.skill,SKILL_EXPERT)){
      proutn("Expert game  ");
    }else if($eq(game.skill,SKILL_EMERITUS)){
      proutn("Emeritus game");
    }
    (yield* prout($fmt("           %5d",iwon)));
  }
  (yield* skip(1));
  (yield* prout($fmt("TOTAL SCORE                               %5d",game.score)));
}
// The 38 below must be 64 for 132-column paper
// This is where the ASCII art picture was emitted.
// It got garbled somewhere in the chain of transmission to the Almy version.
// We should restore it if we can find old enough FORTRAN sources.
// Code from io.c begins here
rows=0; // for paging
columns=0;
linecount=0; // for paging
// Short range scan
// Report legends for status window
// The status window itself
// Long range scan
// Main window for scrolling text
// Prompt window at bottom of display
// Galaxy chart
// Allows a minimum of 18 lines of scrolling text
function* announce(){
  (yield* skip(1));
  prouts("[ANNOUNCEMENT ARRIVING...]");
  (yield* skip(1));
}
function* skip(i){
  var _dummy;
  // Skip i lines.  Pause game if this would cause a scrolling event.
  for(_dummy of $range(i)){
    linecount=(linecount+1);
    if(($t(rows) && (linecount>=rows))){
      (yield* pause_game());
    }else{
      $write("\n");
    }
  }
}
function* prout(proutline){
  proutn(proutline);
  (yield* skip(1));
}
// Don't slow down replays
// Some curses implementations get confused when you try this.
function clrscr(){
  // Clear screen -- can be a no-op in tty mode.
  linecount=0;
}
// 
// Things past this point have policy implications.
// 
// Ordinary refesh before each commabd
// sound(500)
// time.sleep(1.0)
// nosound()
function warble(){
  // Sound and visual effects for teleportation.
  // sound(50)
  prouts("     . . . . .     ");
}
// curses.delay_output(1000)
// nosound()
function* tracktorpedo(w,step,i,n,iquad){
  // Torpedo-track animation.
  if((step==1)){
    if((n!=1)){
      (yield* skip(1));
      proutn($fmt("Track for torpedo number %d-  ",(i+1)));
    }else{
      (yield* skip(1));
      proutn("Torpedo track- ");
    }
  }else if($in(step,[4,9])){
    (yield* skip(1));
  }
  proutn($fmt("%s   ",w));
}
// sound(step*10)
// time.sleep(0.1)
// nosound()
// sound(500)
// time.sleep(1.0)
// nosound()
function* makechart(){
  // Display the current galaxy chart.
  (yield* chart());
  if((game.options&OPTION_TTY)){
    (yield* skip(1));
  }
}
NSYM=14;
function* prstat(txt,data){
  proutn(txt);
  proutn($mul(" ",(NSYM-$len(txt))));
  proutn(data);
  (yield* skip(1));
}
// Code from moving.c begins here
function* imove(icourse,noattack=false){
  var w,trbeam,_m,enemy,finald;
  // Movement execution for warp, impulse, supernova, and tractor-beam events.
  w=new Coord();
  function* newquadrant(noattack){
    var kinks,enemy,kink,finald;
    // Leaving quadrant -- allow final enemy attack
    // Don't set up attack if being pushed by nova or cloaked
    if((($len(game.enemies)!=0) && !$t(noattack) && !$t(game.iscloaked))){
      newcnd();
      for(enemy of $iter(game.enemies)){
        finald=$sub(w,enemy.location).distance();
        enemy.kavgd=$mul(0.5,$add(finald,enemy.kdist));
      }
      // Stas Sergeev added the condition
      // that attacks only happen if Klingons
      // are present and your skill is good.
      if(((game.skill>SKILL_GOOD) && (game.klhere>0) && !$t($g($g(game.state.galaxy,game.quadrant.i),game.quadrant.j).supernova))){
        (yield* attack(false));
      }
      if($t(game.alldone)){
        return;
      }
    }
    // check for edge of galaxy
    kinks=0;
    for(;;){
      kink=false;
      if((icourse.final.i<0)){
        icourse.final.i=(-icourse.final.i);
        kink=true;
      }
      if((icourse.final.j<0)){
        icourse.final.j=(-icourse.final.j);
        kink=true;
      }
      if((icourse.final.i>=(GALSIZE*QUADSIZE))){
        icourse.final.i=$sub(((GALSIZE*QUADSIZE)*2),icourse.final.i);
        kink=true;
      }
      if((icourse.final.j>=(GALSIZE*QUADSIZE))){
        icourse.final.j=$sub(((GALSIZE*QUADSIZE)*2),icourse.final.j);
        kink=true;
      }
      if($t(kink)){
        kinks=(kinks+1);
        (yield* spinguard(kinks));
      }else{
        break;
      }
    }
    if($t(kinks)){
      game.nkinks=(game.nkinks+1);
      if((game.nkinks==3)){
        // Three strikes -- you're out!
        (yield* finish(FNEG3));
        return;
      }
      (yield* skip(1));
      (yield* prout("YOU HAVE ATTEMPTED TO CROSS THE NEGATIVE ENERGY BARRIER"));
      (yield* prout("AT THE EDGE OF THE GALAXY.  THE THIRD TIME YOU TRY THIS,"));
      (yield* prout("YOU WILL BE DESTROYED."));
    }
    // Compute final position in new quadrant
    if($t(trbeam)){
      return;
    }
    game.quadrant=icourse.final.quadrant();
    game.sector=icourse.final.sector();
    (yield* skip(1));
    (yield* prout($fmt("Entering Quadrant %s.",game.quadrant)));
    $s($g(game.quad,game.sector.i),game.sector.j,game.ship);
    (yield* newqad());
    if((game.skill>SKILL_NOVICE)){
      (yield* attack(false));
    }
  }
  function* check_collision(h){
    var iquad,stopegy,enemy,n,m,probf;
    iquad=$g($g(game.quad,h.i),h.j);
    if((iquad!==".")){
      // object encountered in flight path
      stopegy=$div($mul(50,icourse.distance),game.optime);
      if($in(iquad,["T","K","C","S","R","?"])){
        for(enemy of $iter(game.enemies)){
          if($eq(enemy.location,h)){
            (yield* collision(false,enemy));
            return true;
          }
        }
        // This should not happen
        (yield* prout("Which way did he go?"));
        return false;
      }else if((iquad===" ")){
        (yield* skip(1));
        prouts("***RED ALERT!  RED ALERT!");
        (yield* skip(1));
        proutn($add("***",crmshp()));
        proutn($fmt(" pulled into black hole at Sector %s",h));
        // Getting pulled into a black hole was certain
        // death in Almy's original.  Stas Sergeev added a
        // possibility that you'll get timewarped instead.
        n=0;
        for(m of $range(NDEVICES)){
          if(($g(game.damage,m)>0)){
            n=(n+1);
          }
        }
        probf=($pow(1.4,($div($add(game.energy,game.shield),5000)-1))*$pow(1.3,($div(1,(n+1))-1)));
        if(((game.options&OPTION_BLKHOLE) && rnd.withprob((1-probf)))){
          (yield* timwrp());
        }else{
          (yield* finish(FHOLE));
        }
        return true;
      }else{
        // something else
        (yield* skip(1));
        proutn(crmshp());
        if((iquad==="#")){
          (yield* prout($fmt(" encounters Tholian web at %s;",h)));
        }else{
          (yield* prout($fmt(" blocked by object at %s;",h)));
        }
        proutn("Emergency stop required ");
        (yield* prout($fmt("%2d units of energy.",$int(stopegy))));
        game.energy=$sub(game.energy,stopegy);
        if((game.energy<=0)){
          (yield* finish(FNRG));
        }
        return true;
      }
    }
    return false;
  }
  trbeam=false;
  if($t(game.inorbit)){
    (yield* prout("Helmsman Sulu- \"Leaving standard orbit.\""));
    game.inorbit=false;
  }
  // If tractor beam is to occur, don't move full distance
  if(($add(game.state.date,game.optime)>=scheduled(FTBEAM))){
    if($t(game.iscloaked)){
      // We can't be tractor beamed if cloaked,
      // so move the event into the future
      if($t(game.state.kcmdr)){
        postpone(FTBEAM,$add(game.optime,expran($div($mul(1.5,game.intime),$len(game.state.kcmdr)))));
      }else{
        unschedule(FTBEAM);
      }
    }else{
      trbeam=true;
      game.condition="red";
      icourse.distance=($div($mul(icourse.distance,$sub(scheduled(FTBEAM),game.state.date)),game.optime)+0.1);
      game.optime=($sub(scheduled(FTBEAM),game.state.date)+1e-05);
    }
  }
  // Move out
  $s($g(game.quad,game.sector.i),game.sector.j,".");
  for(_m of $range(icourse.moves)){
    icourse.nextstep();
    w=icourse.sector();
    if($ne(icourse.origin.quadrant(),icourse.location.quadrant())){
      (yield* newquadrant(noattack));
      break;
    }else if($t((yield* check_collision(w)))){
      (yield* prout("Collision detected"));
      break;
    }else{
      game.sector=w;
    }
  }
  // We're in destination quadrant -- compute new average enemy distances
  $s($g(game.quad,game.sector.i),game.sector.j,game.ship);
  if($t(game.enemies)){
    for(enemy of $iter(game.enemies)){
      finald=$sub(w,enemy.location).distance();
      enemy.kavgd=$mul(0.5,$add(finald,enemy.kdist));
      enemy.kdist=finald;
    }
    sortenemies();
    if(!$t($g($g(game.state.galaxy,game.quadrant.i),game.quadrant.j).supernova)){
      (yield* attack(false));
    }
    for(enemy of $iter(game.enemies)){
      enemy.kavgd=enemy.kdist;
    }
  }
  newcnd();
}
function* dock(verbose){
  // Dock our ship at a starbase.
  scanner.chew();
  if(((game.condition==="docked") && $t(verbose))){
    (yield* prout("Already docked."));
    return;
  }
  if($t(game.inorbit)){
    (yield* prout("You must first leave standard orbit."));
    return;
  }
  if(((game.base==null) || !game.base.valid_sector())){
    (yield* prout("No starbase available for docking in this quadrant."));
    return;
  }
  if((($abs($sub(game.sector.i,game.base.i))>1) || ($abs($sub(game.sector.j,game.base.j))>1))){
    (yield* prout($add(crmshp()," not adjacent to base.")));
    return;
  }
  if($t(game.iscloaked)){
    (yield* prout("You cannot dock while cloaked."));
    return;
  }
  game.condition="docked";
  if($t(verbose)){
    (yield* prout("Docked."));
  }
  game.ididit=true;
  game.energy=$max(game.energy,game.inenrg);
  game.shield=game.inshld;
  game.torps=game.intorps;
  game.lsupres=game.inlsr;
  game.state.crew=FULLCREW;
  if(($sub(game.brigcapacity,game.brigfree)>0)){
    (yield* prout($fmt("%d captured Klingons transferred to base",$sub(game.brigcapacity,game.brigfree))));
    game.kcaptured=$add(game.kcaptured,$sub(game.brigcapacity,game.brigfree));
    game.brigfree=game.brigcapacity;
  }
  if((communicating() && (($t(is_scheduled(FCDBAS)) || (game.isatb==1)) && !$t(game.iseenit)))){
    // get attack report from base
    (yield* prout("Lt. Uhura- \"Captain, an important message from the starbase:\""));
    (yield* attackreport(false));
    game.iseenit=true;
  }
}
function cartesian(loc1=null,loc2=null){
  if((loc1==null)){
    return $add($mul(game.quadrant,QUADSIZE),game.sector);
  }else if((loc2==null)){
    return $add($mul(game.quadrant,QUADSIZE),loc1);
  }else{
    return $add($mul(loc1,QUADSIZE),loc2);
  }
}
function* getcourse(isprobe){
  var key,dquad,navmode,itemp,dsect,iprompt,delta,first,second;
  // Get a course and distance from the user.
  key="";
  dquad=$copy(game.quadrant);
  navmode="unspecified";
  itemp="curt";
  dsect=new Coord();
  iprompt=false;
  if(($t(game.landed) && !$t(isprobe))){
    (yield* prout("Dummy! You can't leave standard orbit until you"));
    proutn("are back aboard the ship.");
    scanner.chew();
    throw new TrekError();
  }
  while((navmode==="unspecified")){
    if(damaged(DNAVSYS)){
      if($t(isprobe)){
        (yield* prout("Computer damaged; manual navigation only"));
      }else{
        (yield* prout("Computer damaged; manual movement only"));
      }
      scanner.chew();
      navmode="manual";
      key="IHEOL";
      break;
    }
    key=(yield* scanner.nexttok());
    if((key==="IHEOL")){
      proutn("Manual or automatic- ");
      iprompt=true;
      scanner.chew();
    }else if((key==="IHALPHA")){
      if(scanner.sees("manual")){
        navmode="manual";
        key=(yield* scanner.nexttok());
        break;
      }else if(scanner.sees("automatic")){
        navmode="automatic";
        key=(yield* scanner.nexttok());
        break;
      }else{
        (yield* huh());
        scanner.chew();
        throw new TrekError();
      }
    }else{
      // numeric
      if($t(isprobe)){
        (yield* prout("(Manual navigation assumed.)"));
      }else{
        (yield* prout("(Manual movement assumed.)"));
      }
      navmode="manual";
      break;
    }
  }
  delta=new Coord();
  if((navmode==="automatic")){
    while((key==="IHEOL")){
      if($t(isprobe)){
        proutn("Target quadrant or quadrant&sector- ");
      }else{
        proutn("Destination sector or quadrant&sector- ");
      }
      scanner.chew();
      iprompt=true;
      key=(yield* scanner.nexttok());
    }
    scanner.push(scanner.token); // Something IHREAL or IHALPHA awaits us
    first=(yield* scanner.getcoord());
    if((first==null)){
      throw new TrekError();
    }
    (yield* scanner.nexttok());
    if((scanner.type==="IHEOL")){
      second=null;
    }else{
      scanner.push(scanner.token);
      second=(yield* scanner.getcoord());
      if((second==null)){
        throw new TrekError();
      }
    }
    scanner.chew();
    if((second!=null)){
      dquad.i=first.i;
      dquad.j=first.j;
      dsect.i=second.i;
      dsect.j=second.j;
    }else{
      // only one pair of numbers was specified
      if($t(isprobe)){
        // only quadrant specified -- go to center of dest quad
        dquad.i=first.i;
        dquad.j=first.j;
        {const $v=($div(QUADSIZE,2)-1);dsect.j=$v;dsect.i=$v;} // preserves 1-origin behavior
      }else{
        // only sector specified
        dsect.i=first.i;
        dsect.j=first.j;
      }
      itemp="normal";
    }
    if((!dquad.valid_quadrant() || !dsect.valid_sector())){
      (yield* huh());
      throw new TrekError();
    }
    (yield* skip(1));
    if(!$t(isprobe)){
      if((itemp>"curt")){
        if($t(iprompt)){
          (yield* prout($fmt("Helmsman Sulu- \"Course locked in for Sector %s.\"",dsect)));
        }
      }else{
        (yield* prout("Ensign Chekov- \"Course laid in, Captain.\""));
      }
    }
    // the actual deltas get computed here
    delta.j=$add($sub(dquad.j,game.quadrant.j),$div($sub(dsect.j,game.sector.j),(QUADSIZE*1)));
    delta.i=$add($sub(game.quadrant.i,dquad.i),$div($sub(game.sector.i,dsect.i),(QUADSIZE*1)));
  }else{
    // manual
    while((key==="IHEOL")){
      proutn("X and Y displacements- ");
      scanner.chew();
      iprompt=true;
      key=(yield* scanner.nexttok());
    }
    itemp="verbose";
    if((key==="IHREAL")){
      delta.j=scanner.real;
    }else{
      (yield* huh());
      throw new TrekError();
    }
    key=(yield* scanner.nexttok());
    if((key==="IHREAL")){
      delta.i=scanner.real;
    }else if((key==="IHEOL")){
      delta.i=0;
      scanner.push("\n");
    }else{
      (yield* huh());
      throw new TrekError();
    }
  }
  // Check for zero movement
  if(((delta.i==0) && (delta.j==0))){
    scanner.chew();
    throw new TrekError();
  }
  if(((itemp==="verbose") && !$t(isprobe))){
    (yield* skip(1));
    (yield* prout("Helmsman Sulu- \"Aye, Sir.\""));
  }
  scanner.chew();
  return new course(delta.bearing(),delta.distance());
}
class course{
  constructor(bearing,distance,origin=null){
    var bigger;
    this.distance=distance;
    this.bearing=bearing;
    if((origin==null)){
      this.origin=cartesian(game.quadrant,game.sector);
    }else{
      this.origin=origin;
    }
    // The bearing() code we inherited from FORTRAN is actually computing
    // clockface directions!
    if((this.bearing<0)){
      this.bearing=(this.bearing+12);
    }
    this.angle=$mul((15-this.bearing),0.5235988);
    this.increment=new Coord((-Math.sin(this.angle)),Math.cos(this.angle));
    bigger=$max($abs(this.increment.i),$abs(this.increment.j));
    this.increment=$div(this.increment,bigger);
    this.moves=$int($round($mul($mul(10,this.distance),bigger)));
    this.reset();
    this.final=$add(this.location,$mul(this.moves,this.increment)).roundtogrid();
    this.location=this.origin;
    this.nextlocation=null;
  }
  reset(){
    this.location=this.origin;
    this.step=0;
  }
  arrived(){
    return $eq(this.location.roundtogrid(),this.final);
  }
  nextstep(){
    var samequad;
    // Next step on course.
    this.step=(this.step+1);
    this.nextlocation=$add(this.location,this.increment);
    samequad=$eq(this.location.quadrant(),this.nextlocation.quadrant());
    this.location=this.nextlocation;
    return samequad;
  }
  quadrant(){
    return this.location.quadrant();
  }
  sector(){
    return this.location.sector();
  }
  power(w){
    return $mul($mul(this.distance,$pow(w,3)),(game.shldup+1));
  }
  time(w){
    return $div($mul(10,this.distance),$pow(w,2));
  }
}
function* impulse(){
  var power,icourse;
  // Move under impulse power.
  game.ididit=false;
  if(damaged(DIMPULS)){
    scanner.chew();
    (yield* skip(1));
    (yield* prout("Engineer Scott- \"The impulse engines are damaged, Sir.\""));
    return;
  }
  if((game.energy>30)){
    try{
      icourse=(yield* getcourse(false));
    }catch($e){
      if($e instanceof TrekError){
        return;
      }else{
        throw $e;
      }
    }
    power=(20+$mul(100,icourse.distance));
  }else{
    power=30;
  }
  if((power>=game.energy)){
    // Insufficient power for trip
    (yield* skip(1));
    (yield* prout("First Officer Spock- \"Captain, the impulse engines"));
    (yield* prout("require 20.0 units to engage, plus 100.0 units per"));
    if((game.energy>30)){
      proutn($fmt("quadrant.  We can go, therefore, a maximum of %d",$int(($mul(0.01,(game.energy-20))-0.05))));
      (yield* prout(" quadrants.\""));
    }else{
      (yield* prout("quadrant.  They are, therefore, useless.\""));
    }
    scanner.chew();
    return;
  }
  // Make sure enough time is left for the trip
  game.optime=$div(icourse.distance,0.095);
  if((!$t(game.sandbox) && (game.optime>=game.state.remtime))){
    (yield* prout("First Officer Spock- \"Captain, our speed under impulse"));
    (yield* prout("power is only 0.95 sectors per stardate. Are you sure"));
    proutn("we dare spend the time?\" ");
    if(!(yield* ja())){
      return;
    }
  }
  // Activate impulse engines and pay the cost
  (yield* imove(icourse,false));
  game.ididit=true;
  if($t(game.alldone)){
    return;
  }
  power=(20+$mul(100,icourse.distance));
  game.energy=$sub(game.energy,power);
  game.optime=$div(icourse.distance,0.095);
  if((game.energy<=0)){
    (yield* finish(FNRG));
  }
  return;
}
function* warp(wcourse,involuntary){
  var blooey,twarp,prob,look,iwarp,w;
  // Move under warp drive.
  blooey=false;
  twarp=false;
  if(!$t(involuntary)){
    game.ididit=false;
    if($t(game.iscloaked)){
      scanner.chew();
      (yield* skip(1));
      (yield* prout("Engineer Scott- \"The warp engines can not be used while cloaked, Sir.\""));
      return;
    }
    if(($g(game.damage,DWARPEN)>10)){
      scanner.chew();
      (yield* skip(1));
      (yield* prout("Engineer Scott- \"The warp engines are damaged, Sir.\""));
      return;
    }
    if((damaged(DWARPEN) && (game.warpfac>4))){
      scanner.chew();
      (yield* skip(1));
      (yield* prout("Engineer Scott- \"Sorry, Captain. Until this damage"));
      (yield* prout("  is repaired, I can only give you warp 4.\""));
      return;
    }
    // Read in course and distance
    if((wcourse==null)){
      try{
        wcourse=(yield* getcourse(false));
      }catch($e){
        if($e instanceof TrekError){
          return;
        }else{
          throw $e;
        }
      }
    }
    // Make sure starship has enough energy for the trip
    // Note: this formula is slightly different from the C version,
    // and lets you skate a bit closer to the edge.
    if((wcourse.power(game.warpfac)>=game.energy)){
      // Insufficient power for trip
      game.ididit=false;
      (yield* skip(1));
      (yield* prout("Engineering to bridge--"));
      if((!$t(game.shldup) || ($mul(0.5,wcourse.power(game.warpfac))>game.energy))){
        iwarp=$pow($div(game.energy,(wcourse.distance+0.05)),0.333333333);
        if((iwarp<=0)){
          (yield* prout("We can't do it, Captain. We don't have enough energy."));
        }else{
          proutn($fmt("We don't have enough energy, but we could do it at warp %d",iwarp));
          if($t(game.shldup)){
            (yield* prout(","));
            (yield* prout("if you'll lower the shields."));
          }else{
            (yield* prout("."));
          }
        }
      }else{
        (yield* prout("We haven't the energy to go that far with the shields up."));
      }
      return;
    }
    // Make sure enough time is left for the trip
    game.optime=wcourse.time(game.warpfac);
    if((!$t(game.sandbox) && (game.optime>=$mul(0.8,game.state.remtime)))){
      (yield* skip(1));
      (yield* prout("First Officer Spock- \"Captain, I compute that such"));
      proutn($fmt("  a trip would require approximately %2.0f",$div($mul(100,game.optime),game.state.remtime)));
      (yield* prout(" percent of our"));
      proutn("  remaining time.  Are you sure this is wise?\" ");
      if(!(yield* ja())){
        game.ididit=false;
        game.optime=0;
        return;
      }
    }
  }
  // Entry WARPX
  if((game.warpfac>6)){
    // Decide if engine damage will occur
    // ESR: Seems wrong. Probability of damage goes *down* with distance?
    prob=$div($mul(wcourse.distance,$pow((6-game.warpfac),2)),66.666666666);
    if((prob>rnd.real())){
      blooey=true;
      wcourse.distance=rnd.real(wcourse.distance);
    }
    // Decide if time warp will occur
    if(($mul($mul(0.5,wcourse.distance),$pow(7,(game.warpfac-10)))>rnd.real())){
      twarp=true;
    }
    if(($t(game.idebug) && (game.warpfac==10) && !$t(twarp))){
      blooey=false;
      proutn("=== Force time warp? ");
      if((yield* ja())){
        twarp=true;
      }
    }
    if(($t(blooey) || $t(twarp))){
      // If time warp or engine damage, check path
      // If it is obstructed, don't do warp or damage
      look=wcourse.moves;
      while((look>0)){
        look=(look-1);
        wcourse.nextstep();
        w=wcourse.sector();
        if(!w.valid_sector()){
          break;
        }
        if(($g($g(game.quad,w.i),w.j)!==".")){
          blooey=false;
          twarp=false;
        }
      }
      wcourse.reset();
    }
  }
  // Activate Warp Engines and pay the cost
  (yield* imove(wcourse,false));
  if($t(game.alldone)){
    return;
  }
  game.energy=$sub(game.energy,wcourse.power(game.warpfac));
  if((game.energy<=0)){
    (yield* finish(FNRG));
  }
  game.optime=wcourse.time(game.warpfac);
  if($t(twarp)){
    (yield* timwrp());
  }
  if($t(blooey)){
    $s(game.damage,DWARPEN,$mul(game.damfac,rnd.real(1,4)));
    (yield* skip(1));
    (yield* prout("Engineering to bridge--"));
    (yield* prout("  Scott here.  The warp engines are damaged."));
    (yield* prout("  We'll have to reduce speed to warp 4."));
  }
  game.ididit=true;
  return;
}
function* setwarp(){
  var oldfac,key;
  // Change the warp factor.
  for(;;){
    key=(yield* scanner.nexttok());
    if((key!=="IHEOL")){
      break;
    }
    scanner.chew();
    proutn("Warp factor- ");
  }
  if((key!=="IHREAL")){
    (yield* huh());
    return;
  }
  if(($g(game.damage,DWARPEN)>10)){
    (yield* prout("Warp engines inoperative."));
    return;
  }
  if((damaged(DWARPEN) && (scanner.real>4))){
    (yield* prout("Engineer Scott- \"I'm doing my best, Captain,"));
    (yield* prout("  but right now we can only go warp 4.\""));
    return;
  }
  if((scanner.real>10)){
    (yield* prout("Helmsman Sulu- \"Our top speed is warp 10, Captain.\""));
    return;
  }
  if((scanner.real<1)){
    (yield* prout("Helmsman Sulu- \"We can't go below warp 1, Captain.\""));
    return;
  }
  oldfac=game.warpfac;
  game.warpfac=scanner.real;
  if(((game.warpfac<=oldfac) || (game.warpfac<=6))){
    (yield* prout($fmt("Helmsman Sulu- \"Warp factor %d, Captain.\"",$int(game.warpfac))));
    return;
  }
  if((game.warpfac<8)){
    (yield* prout("Engineer Scott- \"Aye, but our maximum safe speed is warp 6.\""));
    return;
  }
  if((game.warpfac==10)){
    (yield* prout("Engineer Scott- \"Aye, Captain, we'll try it.\""));
    return;
  }
  (yield* prout("Engineer Scott- \"Aye, Captain, but our engines may not take it.\""));
  return;
}
function* atover(igrab){
  var power,dist,bugout;
  // Cope with being tossed out of quadrant by supernova or yanked by beam.
  scanner.chew();
  // is captain on planet?
  if($t(game.landed)){
    if(damaged(DTRANSP)){
      (yield* finish(FPNOVA));
      return;
    }
    (yield* prout("Scotty rushes to the transporter controls."));
    if($t(game.shldup)){
      (yield* prout("But with the shields up it's hopeless."));
      (yield* finish(FPNOVA));
    }
    prouts("His desperate attempt to rescue you . . .");
    if(rnd.withprob(0.5)){
      (yield* prout("fails."));
      (yield* finish(FPNOVA));
      return;
    }
    (yield* prout("SUCCEEDS!"));
    if($t(game.imine)){
      game.imine=false;
      proutn("The crystals mined were ");
      if(rnd.withprob(0.25)){
        (yield* prout("lost."));
      }else{
        (yield* prout("saved."));
        game.icrystl=true;
      }
    }
  }
  if($t(igrab)){
    return;
  }
  // Check to see if captain in shuttle craft
  if($t(game.icraft)){
    (yield* finish(FSTRACTOR));
  }
  if($t(game.alldone)){
    return;
  }
  // Inform captain of attempt to reach safety
  (yield* skip(1));
  for(;;){
    if($t(game.justin)){
      prouts("***RED ALERT!  RED ALERT!");
      (yield* skip(1));
      proutn($fmt("The %s has stopped in a quadrant containing",crmshp()));
      prouts("   a supernova.");
      (yield* skip(2));
    }
    (yield* prout($add("***Emergency automatic override attempts to hurl ",crmshp())));
    (yield* prout("safely out of quadrant."));
    $g($g(game.state.chart,game.quadrant.i),game.quadrant.j).supernova=true;
    if(!damaged(DRADIO)){
      $g($g(game.state.galaxy,game.quadrant.i),game.quadrant.j).charted=true;
    }
    // Try to use warp engines
    if(damaged(DWARPEN)){
      (yield* skip(1));
      (yield* prout("Warp engines damaged."));
      (yield* finish(FSNOVAED));
      return;
    }
    game.warpfac=rnd.real(6,8);
    (yield* prout($fmt("Warp factor set to %d",$int(game.warpfac))));
    power=$mul(0.75,game.energy);
    dist=$div(power,$mul($mul($mul(game.warpfac,game.warpfac),game.warpfac),(game.shldup+1)));
    dist=$max(dist,rnd.real(Math.sqrt(2)));
    bugout=new course(rnd.real(12),dist); // How dumb!
    game.optime=bugout.time(game.warpfac);
    game.justin=false;
    game.inorbit=false;
    (yield* warp(bugout,true));
    if(!$t(game.justin)){
      // This is bad news, we didn't leave quadrant.
      if($t(game.alldone)){
        return;
      }
      (yield* skip(1));
      (yield* prout("Insufficient energy to leave quadrant."));
      (yield* finish(FSNOVAED));
      return;
    }
    // Repeat if another snova
    if(!$t($g($g(game.state.galaxy,game.quadrant.i),game.quadrant.j).supernova)){
      break;
    }
  }
  if((game.unwon()==0)){
    (yield* finish(FWON)); // Snova killed remaining enemy.
  }
}
function* timwrp(){
  var gotit,l;
  // Let's do the time warp again.
  (yield* prout("***TIME WARP ENTERED."));
  if(($t(game.state.snap) && rnd.withprob(0.5))){
    // Go back in time
    (yield* prout($fmt("You are traveling backwards in time %d stardates.",$int($sub(game.state.date,game.snapsht.date)))));
    game.state=game.snapsht;
    game.state.snap=false;
    if($t($len(game.state.kcmdr))){
      schedule(FTBEAM,expran($div(game.intime,$len(game.state.kcmdr))));
      schedule(FBATTAK,expran($mul(0.3,game.intime)));
    }
    schedule(FSNOVA,expran($mul(0.5,game.intime)));
    // next snapshot will be sooner
    schedule(FSNAP,expran($mul(0.25,game.state.remtime)));
    if($t(game.state.nscrem)){
      schedule(FSCMOVE,0.2777);
    }
    game.isatb=0;
    unschedule(FCDBAS);
    unschedule(FSCDBAS);
    game.battle.invalidate();
    // Make sure Galileo is consistant -- Snapshot may have been taken
    // when on planet, which would give us two Galileos!
    gotit=false;
    for(l of $range(game.inplan)){
      if(($g(game.state.planets,l).known==="shuttle_down")){
        gotit=true;
        if(((game.iscraft==="onship") && (game.ship==="E"))){
          (yield* prout("Chekov-  \"Security reports the Galileo has disappeared, Sir!"));
          game.iscraft="offship";
        }
      }
    }
    // Likewise, if in the original time the Galileo was abandoned, but
    // was on ship earlier, it would have vanished -- let's restore it.
    if(((game.iscraft==="offship") && !$t(gotit) && ($g(game.damage,DSHUTTL)>=0))){
      (yield* prout("Chekov-  \"Security reports the Galileo has reappeared in the dock!\""));
      game.iscraft="onship";
    }
    // There used to be code to do the actual reconstrction here,
    // but the starchart is now part of the snapshotted galaxy state.
    (yield* prout("Spock has reconstructed a correct star chart from memory"));
  }else{
    // Go forward in time
    game.optime=expran($mul(0.5,game.intime));
    (yield* prout($fmt("You are traveling forward in time %d stardates.",$int(game.optime))));
    // cheat to make sure no tractor beams occur during time warp
    postpone(FTBEAM,game.optime);
    $s(game.damage,DRADIO,$add($g(game.damage,DRADIO),game.optime));
  }
  (yield* newqad());
  (yield* events()); // Stas Sergeev added this -- do pending events
}
function* probe(){
  var key;
  // Launch deep-space probe.
  // New code to launch a deep space probe
  if((game.nprobes==0)){
    scanner.chew();
    (yield* skip(1));
    if((game.ship==="E")){
      (yield* prout("Engineer Scott- \"We have no more deep space probes, Sir.\""));
    }else{
      (yield* prout("Ye Faerie Queene has no deep space probes."));
    }
    return;
  }
  if(damaged(DDSP)){
    scanner.chew();
    (yield* skip(1));
    (yield* prout("Engineer Scott- \"The probe launcher is damaged, Sir.\""));
    return;
  }
  if($t(is_scheduled(FDSPROB))){
    scanner.chew();
    (yield* skip(1));
    if((damaged(DRADIO) && (game.condition!=="docked"))){
      (yield* prout("Spock-  \"Records show the previous probe has not yet"));
      (yield* prout("   reached its destination.\""));
    }else{
      (yield* prout("Uhura- \"The previous probe is still reporting data, Sir.\""));
    }
    return;
  }
  key=(yield* scanner.nexttok());
  if((key==="IHEOL")){
    if((game.nprobes==1)){
      (yield* prout("1 probe left."));
    }else{
      (yield* prout($fmt("%d probes left",game.nprobes)));
    }
    proutn("Are you sure you want to fire a probe? ");
    if(!(yield* ja())){
      return;
    }
  }
  game.isarmed=false;
  if(((key==="IHALPHA") && (scanner.token==="armed"))){
    game.isarmed=true;
    key=(yield* scanner.nexttok());
  }else if((key==="IHEOL")){
    proutn("Arm NOVAMAX warhead? ");
    game.isarmed=(yield* ja());
  }else if((key==="IHREAL")){
    // first element of course
    scanner.push(scanner.token);
  }
  try{
    game.probe=(yield* getcourse(true));
  }catch($e){
    if($e instanceof TrekError){
      return;
    }else{
      throw $e;
    }
  }
  game.nprobes=(game.nprobes-1);
  schedule(FDSPROB,0.01); // Time to move one sector
  (yield* prout("Ensign Chekov-  \"The deep space probe is launched, Captain.\""));
  game.ididit=true;
  return;
}
function* mayday(){
  var m,probf,ddist,ibq,w;
  // Yell for help from nearest starbase.
  // There's more than one way to move in this game!
  scanner.chew();
  // Test for conditions which prevent calling for help
  if((game.condition==="docked")){
    (yield* prout("Lt. Uhura-  \"But Captain, we're already docked.\""));
    return;
  }
  if(damaged(DRADIO)){
    (yield* prout("Subspace radio damaged."));
    return;
  }
  if(!$t(game.state.baseq)){
    (yield* prout("Lt. Uhura-  \"Captain, I'm not getting any response from Starbase.\""));
    return;
  }
  if($t(game.landed)){
    (yield* prout($fmt("You must be aboard the %s.",crmshp())));
    return;
  }
  // OK -- call for help from nearest starbase
  game.nhelp=(game.nhelp+1);
  if(((game.base!=null) && game.base.valid_sector() && $t($g($g(game.state.galaxy,game.quadrant.i),game.quadrant.j).starbase))){
    // There's one in this quadrant
    ddist=$sub(game.base,game.sector).distance();
  }else{
    ibq=$minby(game.state.baseq,((base)=>$sub(base,game.quadrant).distance()));
    ddist=$mul(QUADSIZE,$sub(ibq,game.quadrant).distance());
    // Since starbase not in quadrant, set up new quadrant
    game.quadrant=$copy(ibq);
    (yield* newqad());
  }
  // dematerialize starship
  $s($g(game.quad,game.sector.i),game.sector.j,".");
  proutn($fmt("Starbase in Quadrant %s responds--%s dematerializes",[game.quadrant,crmshp()]));
  game.sector.invalidate();
  for(m of $range(1,(5+1))){
    w=game.base.scatter();
    if((w.valid_sector() && ($g($g(game.quad,w.i),w.j)==="."))){
      // found one -- finish up
      game.sector=w;
      break;
    }
  }
  if(!game.sector.valid_sector()){
    (yield* prout("You have been lost in space..."));
    (yield* finish(FMATERIALIZE));
    return;
  }
  // Give starbase three chances to rematerialize starship
  probf=$pow((1-$pow(0.98,ddist)),0.33333333);
  var $else5185=true;
  for(m of $range(1,(3+1))){
    if((m==1)){
      proutn("1st");
    }else if((m==2)){
      proutn("2nd");
    }else if((m==3)){
      proutn("3rd");
    }
    proutn($add(" attempt to re-materialize ",crmshp()));
    $s($g(game.quad,game.sector.i),game.sector.j,$g(["-","o","O"],(m-1)));
    warble();
    if((rnd.real()>probf)){
      $else5185=false;
      break;
    }
    (yield* prout("fails."));
  }
  if($else5185){
    $s($g(game.quad,game.sector.i),game.sector.j,"?");
    game.alive=false;
    (yield* finish(FMATERIALIZE));
    return;
  }
  $s($g(game.quad,game.sector.i),game.sector.j,game.ship);
  (yield* prout("succeeds."));
  (yield* dock(false));
  (yield* skip(1));
  (yield* prout("Lt. Uhura-  \"Captain, we made it!\""));
}
function* abandon(){
  var l,q,nb,_attempt;
  // Abandon ship.
  scanner.chew();
  if((game.condition==="docked")){
    if((game.ship!=="E")){
      (yield* prout("You cannot abandon Ye Faerie Queene."));
      return;
    }
  }else{
    // Must take shuttle craft to exit
    if(($g(game.damage,DSHUTTL)==(-1))){
      (yield* prout("Ye Faerie Queene has no shuttle craft."));
      return;
    }
    if(($g(game.damage,DSHUTTL)<0)){
      (yield* prout("Shuttle craft now serving Big Macs."));
      return;
    }
    if(($g(game.damage,DSHUTTL)>0)){
      (yield* prout("Shuttle craft damaged."));
      return;
    }
    if($t(game.landed)){
      (yield* prout("You must be aboard the ship."));
      return;
    }
    if((game.iscraft!=="onship")){
      (yield* prout("Shuttle craft not currently available."));
      return;
    }
    // Emit abandon ship messages
    (yield* skip(1));
    prouts("***ABANDON SHIP!  ABANDON SHIP!");
    (yield* skip(1));
    prouts("***ALL HANDS ABANDON SHIP!");
    (yield* skip(2));
    (yield* prout("Captain and crew escape in shuttle craft."));
    if(!$t(game.state.baseq)){
      // Oops! no place to go...
      (yield* finish(FABANDN));
      return;
    }
    q=$g($g(game.state.galaxy,game.quadrant.i),game.quadrant.j);
    // Dispose of crew
    if((!(game.options&OPTION_WORLDS) && !damaged(DTRANSP))){
      (yield* prout("Remainder of ship's complement beam down"));
      (yield* prout("to nearest habitable planet."));
    }else if(((q.planet!=null) && !damaged(DTRANSP))){
      (yield* prout($fmt("Remainder of ship's complement beam down to %s.",q.planet)));
    }else{
      (yield* prout($fmt("Entire crew of %d left to die in outer space.",game.state.crew)));
      game.casual=$add(game.casual,game.state.crew);
      game.abandoned=$add(game.abandoned,game.state.crew);
    }
    // If at least one base left, give 'em the Faerie Queene
    (yield* skip(1));
    game.icrystl=false; // crystals are lost
    game.nprobes=0; // No probes
    (yield* prout("You are captured by Klingons and released to"));
    (yield* prout("the Federation in a prisoner-of-war exchange."));
    nb=rnd.integer($len(game.state.baseq));
    // Set up quadrant and position FQ adjacient to base
    if(!$eq(game.quadrant,$g(game.state.baseq,nb))){
      game.quadrant=$g(game.state.baseq,nb);
      {const $v=5;game.sector.i=$v;game.sector.j=$v;}
      (yield* newqad());
    }
    for(;;){
      // position next to base by trial and error
      $s($g(game.quad,game.sector.i),game.sector.j,".");
      var $else5279=true;
      for(_attempt of $range(QUADSIZE)){
        game.sector=game.base.scatter();
        if((game.sector.valid_sector() && ($g($g(game.quad,game.sector.i),game.sector.j)==="."))){
          $else5279=false;
          break;
        }
      }
      if($else5279){
        // No free adjacent sector found; rebuild the quadrant and retry.
        game.sector=new Coord($fdiv(QUADSIZE,2),$fdiv(QUADSIZE,2));
        (yield* newqad());
        continue;
      }
      break;
    }
  }
  // found a spot
  // Get new commission
  {const $v="F";$s($g(game.quad,game.sector.i),game.sector.j,$v);game.ship=$v;}
  game.state.crew=FULLCREW;
  (yield* prout("Starfleet puts you in command of another ship,"));
  (yield* prout("the Faerie Queene, which is antiquated but,"));
  (yield* prout("still useable."));
  if($t(game.icrystl)){
    (yield* prout("The dilithium crystals have been moved."));
  }
  game.imine=false;
  game.iscraft="offship"; // Galileo disappears
  // Resupply ship
  game.condition="docked";
  for(l of $range(NDEVICES)){
    $s(game.damage,l,0);
  }
  $s(game.damage,DSHUTTL,(-1));
  {const $v=3000;game.energy=$v;game.inenrg=$v;}
  {const $v=1250;game.shield=$v;game.inshld=$v;}
  {const $v=6;game.torps=$v;game.intorps=$v;}
  {const $v=3;game.lsupres=$v;game.inlsr=$v;}
  game.shldup=false;
  game.warpfac=5;
  {const $v=300;game.brigfree=$v;game.brigcapacity=$v;}
  return;
}
// Code from planets.c begins here.
function* consumeTime(){
  // Abort a lengthy operation if an event interrupts it.
  game.ididit=true;
  (yield* events());
  if(($t(game.alldone) || $t($g($g(game.state.galaxy,game.quadrant.i),game.quadrant.j).supernova) || $t(game.justin))){
    return true;
  }
  return false;
}
function* survey(){
  var iknow,i;
  // Report on (uninhabited) planets in the galaxy.
  iknow=false;
  (yield* skip(1));
  scanner.chew();
  (yield* prout("Spock-  \"Planet report follows, Captain.\""));
  (yield* skip(1));
  for(i of $range(game.inplan)){
    if(($g(game.state.planets,i).pclass==="destroyed")){
      continue;
    }
    if(((($g(game.state.planets,i).known!=="unknown") && !$t($g(game.state.planets,i).inhabited)) || $t(game.idebug))){
      iknow=true;
      if(($t(game.idebug) && ($g(game.state.planets,i).known==="unknown"))){
        proutn("(Unknown) ");
      }
      proutn($fmt("Quadrant %s",$g(game.state.planets,i).quadrant));
      proutn("   class ");
      proutn($g(game.state.planets,i).pclass);
      proutn("   ");
      if(($g(game.state.planets,i).crystals!=="present")){
        proutn("no ");
      }
      (yield* prout("dilithium crystals present."));
      if(($g(game.state.planets,i).known==="shuttle_down")){
        (yield* prout("    Shuttle Craft Galileo on surface."));
      }
    }
  }
  if(!$t(iknow)){
    (yield* prout("No information available."));
  }
}
function* orbit(){
  // Enter standard orbit.
  (yield* skip(1));
  scanner.chew();
  if($t(game.inorbit)){
    (yield* prout("Already in standard orbit."));
    return;
  }
  if((damaged(DWARPEN) && damaged(DIMPULS))){
    (yield* prout("Both warp and impulse engines damaged."));
    return;
  }
  if(((game.iplnet==null) || (game.plnet==null))){
    (yield* prout("There is no planet in this sector."));
    return;
  }
  if((($abs($sub(game.sector.i,game.plnet.i))>1) || ($abs($sub(game.sector.j,game.plnet.j))>1))){
    (yield* prout($add(crmshp()," not adjacent to planet.")));
    (yield* skip(1));
    return;
  }
  game.optime=rnd.real(0.02,0.05);
  (yield* prout("Helmsman Sulu-  \"Entering standard orbit, Sir.\""));
  newcnd();
  if($t((yield* consumeTime()))){
    return;
  }
  game.height=rnd.real(1400,8600);
  (yield* prout($fmt("Sulu-  \"Entered orbit at altitude %.2f kilometers.\"",game.height)));
  game.inorbit=true;
  game.ididit=true;
}
function* sensor(){
  // Examine planets in this quadrant.
  if(damaged(DSRSENS)){
    if((game.options&OPTION_TTY)){
      (yield* prout("Short range sensors damaged."));
    }
    return;
  }
  if((game.iplnet==null)){
    if((game.options&OPTION_TTY)){
      (yield* prout("Spock- \"No planet in this quadrant, Captain.\""));
    }
    return;
  }
  if((game.iplnet.known==="unknown")){
    (yield* prout($fmt("Spock-  \"Sensor scan for Quadrant %s-",game.quadrant)));
    (yield* skip(1));
    (yield* prout($fmt("         Planet at Sector %s is of class %s.",[game.plnet,game.iplnet.pclass])));
    if((game.iplnet.known==="shuttle_down")){
      (yield* prout("         Sensors show Galileo still on surface."));
    }
    proutn("         Readings indicate");
    if((game.iplnet.crystals!=="present")){
      proutn(" no");
    }
    (yield* prout(" dilithium crystals present.\""));
    if((game.iplnet.known==="unknown")){
      game.iplnet.known="known";
    }
  }else if($t(game.iplnet.inhabited)){
    (yield* prout($fmt("Spock-  \"The inhabited planet %s ",game.iplnet.name)));
    (yield* prout($fmt("        is located at Sector %s, Captain.\"",game.plnet)));
  }
}
function* beam(){
  var nrgneed;
  // Use the transporter.
  nrgneed=0;
  scanner.chew();
  (yield* skip(1));
  if(!$t(game.inorbit)){
    (yield* prout($add(crmshp()," not in standard orbit.")));
    return;
  }
  if((game.iplnet==null)){
    (yield* prout("Spock- \"No planet in this quadrant, Captain.\""));
    return;
  }
  if(damaged(DTRANSP)){
    (yield* prout("Transporter damaged."));
    if((!damaged(DSHUTTL) && ((game.iplnet.known==="shuttle_down") || (game.iscraft==="onship")))){
      (yield* skip(1));
      proutn("Spock-  \"May I suggest the shuttle craft, Sir?\" ");
      if((yield* ja())){
        (yield* shuttle());
      }
    }
    return;
  }
  if($t(game.shldup)){
    (yield* prout("Impossible to transport through shields."));
    return;
  }
  if((game.iplnet.known==="unknown")){
    (yield* prout("Spock-  \"Captain, we have no information on this planet"));
    (yield* prout("  and Starfleet Regulations clearly state that in this situation"));
    (yield* prout("  you may not go down.\""));
    return;
  }
  if((!$t(game.landed) && (game.iplnet.crystals==="absent"))){
    (yield* prout("Spock-  \"Captain, I fail to see the logic in"));
    (yield* prout("  exploring a planet with no dilithium crystals."));
    proutn("  Are you sure this is wise?\" ");
    if(!(yield* ja())){
      scanner.chew();
      return;
    }
  }
  if((game.options&OPTION_ALMY)){
    nrgneed=$add($mul(50,game.skill),$div(game.height,100));
    if((nrgneed>game.energy)){
      (yield* prout("Engineering to bridge--"));
      (yield* prout("  Captain, we don't have enough energy for transportation."));
      return;
    }
    if((!$t(game.landed) && ($mul(nrgneed,2)>game.energy))){
      (yield* prout("Engineering to bridge--"));
      (yield* prout("  Captain, we have enough energy only to transport you down to"));
      (yield* prout("  the planet, but there wouldn't be an energy for the trip back."));
      if((game.iplnet.known==="shuttle_down")){
        (yield* prout("  Although the Galileo shuttle craft may still be on a surface."));
      }
      proutn("  Are you sure this is wise?\" ");
      if(!(yield* ja())){
        scanner.chew();
        return;
      }
    }
  }
  if($t(game.landed)){
    // Coming from planet
    if((game.iplnet.known==="shuttle_down")){
      proutn("Spock-  \"Wouldn't you rather take the Galileo?\" ");
      if((yield* ja())){
        scanner.chew();
        return;
      }
      (yield* prout("Your crew hides the Galileo to prevent capture by aliens."));
    }
    (yield* prout("Landing party assembled, ready to beam up."));
    (yield* skip(1));
    (yield* prout("Kirk whips out communicator..."));
    prouts("BEEP  BEEP  BEEP");
    (yield* skip(2));
    (yield* prout("\"Kirk to enterprise-  Lock on coordinates...energize.\""));
  }else{
    // Going to planet
    (yield* prout("Scotty-  \"Transporter room ready, Sir.\""));
    (yield* skip(1));
    (yield* prout("Kirk and landing party prepare to beam down to planet surface."));
    (yield* skip(1));
    (yield* prout("Kirk-  \"Energize.\""));
  }
  game.ididit=true;
  (yield* skip(1));
  prouts("WWHOOOIIIIIRRRRREEEE.E.E.  .  .  .  .   .    .");
  (yield* skip(2));
  if(!rnd.withprob(0.98)){
    prouts("BOOOIIIOOOIIOOOOIIIOIING . . .");
    (yield* skip(2));
    (yield* prout("Scotty-  \"Oh my God!  I've lost them.\""));
    (yield* finish(FLOST));
    return;
  }
  prouts(".    .   .  .  .  .  .E.E.EEEERRRRRIIIIIOOOHWW");
  game.landed=!$t(game.landed);
  game.energy=$sub(game.energy,nrgneed);
  (yield* skip(2));
  (yield* prout("Transport complete."));
  if(($t(game.landed) && (game.iplnet.known==="shuttle_down"))){
    (yield* prout("The shuttle craft Galileo is here!"));
  }
  if((!$t(game.landed) && $t(game.imine))){
    game.icrystl=true;
    game.cryprob=0.05;
  }
  game.imine=false;
  return;
}
function* mine(){
  // Strip-mine a world for dilithium.
  (yield* skip(1));
  scanner.chew();
  if(!$t(game.landed)){
    (yield* prout("Mining party not on planet."));
    return;
  }
  if((game.iplnet.crystals==="mined")){
    (yield* prout("This planet has already been strip-mined for dilithium."));
    return;
  }else if((game.iplnet.crystals==="absent")){
    (yield* prout("No dilithium crystals on this planet."));
    return;
  }
  if($t(game.imine)){
    (yield* prout("You've already mined enough crystals for this trip."));
    return;
  }
  if(($t(game.icrystl) && (game.cryprob==0.05))){
    (yield* prout($add("With all those fresh crystals aboard the ",crmshp())));
    (yield* prout("there's no reason to mine more at this time."));
    return;
  }
  game.optime=(rnd.real(0.1,0.3)*($ord(game.iplnet.pclass)-$ord("L")));
  if($t((yield* consumeTime()))){
    return;
  }
  (yield* prout("Mining operation complete."));
  game.iplnet.crystals="mined";
  {const $v=true;game.imine=$v;game.ididit=$v;}
}
function* usecrystals(){
  // Use dilithium crystals.
  game.ididit=false;
  (yield* skip(1));
  scanner.chew();
  if(!$t(game.icrystl)){
    (yield* prout("No dilithium crystals available."));
    return;
  }
  if((game.energy>=1000)){
    (yield* prout("Spock-  \"Captain, Starfleet Regulations prohibit such an operation"));
    (yield* prout("  except when Condition Yellow exists."));
    return;
  }
  (yield* prout("Spock- \"Captain, I must warn you that loading"));
  (yield* prout("  raw dilithium crystals into the ship's power"));
  (yield* prout("  system may risk a severe explosion."));
  proutn("  Are you sure this is wise?\" ");
  if(!(yield* ja())){
    scanner.chew();
    return;
  }
  (yield* skip(1));
  (yield* prout("Engineering Officer Scott-  \"(GULP) Aye Sir."));
  (yield* prout("  Mr. Spock and I will try it.\""));
  (yield* skip(1));
  (yield* prout("Spock-  \"Crystals in place, Sir."));
  (yield* prout("  Ready to activate circuit.\""));
  (yield* skip(1));
  prouts("Scotty-  \"Keep your fingers crossed, Sir!\"");
  (yield* skip(1));
  if(rnd.withprob(game.cryprob)){
    prouts("  \"Activating now! - - No good!  It's***");
    (yield* skip(2));
    prouts("***RED ALERT!  RED A*L********************************");
    (yield* skip(1));
    (yield* stars());
    prouts("******************   KA-BOOM!!!!   *******************");
    (yield* skip(1));
    (yield* kaboom());
    return;
  }
  game.energy=$add(game.energy,rnd.real(5000,5500));
  prouts("  \"Activating now! - - ");
  (yield* prout("The instruments"));
  (yield* prout("   are going crazy, but I think it's"));
  (yield* prout("   going to work!!  Congratulations, Sir!\""));
  game.cryprob=$mul(game.cryprob,2);
  game.ididit=true;
}
function* shuttle(){
  // Use shuttlecraft for planetary jaunt.
  scanner.chew();
  (yield* skip(1));
  if(damaged(DSHUTTL)){
    if(($g(game.damage,DSHUTTL)==(-1))){
      if(($t(game.inorbit) && (game.iplnet.known==="shuttle_down"))){
        (yield* prout("Ye Faerie Queene has no shuttle craft bay to dock it at."));
      }else{
        (yield* prout("Ye Faerie Queene had no shuttle craft."));
      }
    }else if(($g(game.damage,DSHUTTL)>0)){
      (yield* prout("The Galileo is damaged."));
    }else{
      // game.damage[DSHUTTL] < 0
      (yield* prout("Shuttle craft is now serving Big Macs."));
    }
    return;
  }
  if(!$t(game.inorbit)){
    (yield* prout($add(crmshp()," not in standard orbit.")));
    return;
  }
  if(((game.iplnet.known!=="shuttle_down") && (game.iscraft!=="onship"))){
    (yield* prout("Shuttle craft not currently available."));
    return;
  }
  if((!$t(game.landed) && (game.iplnet.known==="shuttle_down"))){
    (yield* prout("You will have to beam down to retrieve the shuttle craft."));
    return;
  }
  if(($t(game.shldup) || (game.condition==="docked"))){
    (yield* prout("Shuttle craft cannot pass through shields."));
    return;
  }
  if((game.iplnet.known==="unknown")){
    (yield* prout("Spock-  \"Captain, we have no information on this planet"));
    (yield* prout("  and Starfleet Regulations clearly state that in this situation"));
    (yield* prout("  you may not fly down.\""));
    return;
  }
  game.optime=$mul(3e-05,game.height);
  if((!$t(game.sandbox) && (game.optime>=$mul(0.8,game.state.remtime)))){
    (yield* prout("First Officer Spock-  \"Captain, I compute that such"));
    proutn($fmt("  a maneuver would require approximately %2d%% of our",$int($div($mul(100,game.optime),game.state.remtime))));
    (yield* prout("remaining time."));
    proutn("Are you sure this is wise?\" ");
    if(!(yield* ja())){
      game.optime=0;
      return;
    }
  }
  if($t(game.landed)){
    // Kirk on planet
    if((game.iscraft==="onship")){
      // Galileo on ship!
      if(!damaged(DTRANSP)){
        proutn("Spock-  \"Would you rather use the transporter?\" ");
        if((yield* ja())){
          (yield* beam());
          return;
        }
        proutn("Shuttle crew");
      }else{
        proutn("Rescue party");
      }
      (yield* prout(" boards Galileo and swoops toward planet surface."));
      game.iscraft="offship";
      (yield* skip(1));
      if($t((yield* consumeTime()))){
        return;
      }
      game.iplnet.known="shuttle_down";
      (yield* prout("Trip complete."));
      return;
    }else{
      // Ready to go back to ship
      (yield* prout("You and your mining party board the"));
      (yield* prout("shuttle craft for the trip back to the Enterprise."));
      (yield* skip(1));
      prouts("The short hop begins . . .");
      (yield* skip(1));
      game.iplnet.known="known";
      game.icraft=true;
      (yield* skip(1));
      game.landed=false;
      if($t((yield* consumeTime()))){
        return;
      }
      game.iscraft="onship";
      game.icraft=false;
      if($t(game.imine)){
        game.icrystl=true;
        game.cryprob=0.05;
      }
      game.imine=false;
      (yield* prout("Trip complete."));
      return;
    }
  }else{
    // Kirk on ship and so is Galileo
    (yield* prout("Mining party assembles in the hangar deck,"));
    (yield* prout("ready to board the shuttle craft \"Galileo\"."));
    (yield* skip(1));
    prouts("The hangar doors open; the trip begins.");
    (yield* skip(1));
    game.icraft=true;
    game.iscraft="offship";
    if($t((yield* consumeTime()))){
      return;
    }
    game.iplnet.known="shuttle_down";
    game.landed=true;
    game.icraft=false;
    (yield* prout("Trip complete."));
    return;
  }
}
function* deathray(){
  var dprob,r,i,j;
  // Use the big zapper.
  game.ididit=false;
  (yield* skip(1));
  scanner.chew();
  if((game.ship!=="E")){
    (yield* prout("Ye Faerie Queene has no death ray."));
    return;
  }
  if(($len(game.enemies)==0)){
    (yield* prout("Sulu-  \"But Sir, there are no enemies in this quadrant.\""));
    return;
  }
  if(damaged(DDRAY)){
    (yield* prout("Death Ray is damaged."));
    return;
  }
  (yield* prout("Spock-  \"Captain, the 'Experimental Death Ray'"));
  (yield* prout("  is highly unpredictible.  Considering the alternatives,"));
  proutn("  are you sure this is wise?\" ");
  if(!(yield* ja())){
    return;
  }
  (yield* prout("Spock-  \"Acknowledged.\""));
  (yield* skip(1));
  game.ididit=true;
  prouts("WHOOEE ... WHOOEE ... WHOOEE ... WHOOEE");
  (yield* skip(1));
  (yield* prout("Crew scrambles in emergency preparation."));
  (yield* prout("Spock and Scotty ready the death ray and"));
  (yield* prout("prepare to channel all ship's power to the device."));
  (yield* skip(1));
  (yield* prout("Spock-  \"Preparations complete, sir.\""));
  (yield* prout("Kirk-  \"Engage!\""));
  (yield* skip(1));
  prouts("WHIRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR");
  (yield* skip(1));
  dprob=0.3;
  // Ugh. This test (For Tom Almy's death-ray upgrade) was inverted for a long time.
  // Furthermore, somebody (ESR or Stas?) changed Tom Almy's 0.7 upgraded chance of
  // working to 0.5.
  if((game.options&OPTION_ALMY)){
    dprob=0.5;
  }
  r=rnd.real();
  if((r>dprob)){
    prouts("Sulu- \"Captain!  It's working!\"");
    (yield* skip(2));
    while(($len(game.enemies)>0)){
      (yield* deadkl($g(game.enemies,(-1)).location,$g($g(game.quad,$g(game.enemies,(-1)).location.i),$g(game.enemies,(-1)).location.j),$g(game.enemies,(-1)).location));
    }
    (yield* prout("Ensign Chekov-  \"Congratulations, Captain!\""));
    if((game.unwon()==0)){
      (yield* finish(FWON));
    }
    if((game.options&OPTION_ALMY)){
      (yield* prout("Spock-  \"Captain, I believe the `Experimental Death Ray'"));
      if(rnd.withprob(0.05)){
        (yield* prout("   is still operational.\""));
      }else{
        (yield* prout("   has been rendered nonfunctional.\""));
        $s(game.damage,DDRAY,39.95);
      }
    }
    return;
  }
  r=rnd.real(); // Pick failure method
  if((r<=0.3)){
    prouts("Sulu- \"Captain!  It's working!\"");
    (yield* skip(1));
    prouts("***RED ALERT!  RED ALERT!");
    (yield* skip(1));
    (yield* prout("***MATTER-ANTIMATTER IMPLOSION IMMINENT!"));
    (yield* skip(1));
    prouts("***RED ALERT!  RED A*L********************************");
    (yield* skip(1));
    (yield* stars());
    prouts("******************   KA-BOOM!!!!   *******************");
    (yield* skip(1));
    (yield* kaboom());
    return;
  }
  if((r<=0.55)){
    prouts("Sulu- \"Captain!  Yagabandaghangrapl, brachriigringlanbla!\"");
    (yield* skip(1));
    (yield* prout("Lt. Uhura-  \"Graaeek!  Graaeek!\""));
    (yield* skip(1));
    (yield* prout("Spock-  \"Fascinating!  . . . All humans aboard"));
    (yield* prout("  have apparently been transformed into strange mutations."));
    (yield* prout("  Vulcans do not seem to be affected."));
    (yield* skip(1));
    (yield* prout("Kirk-  \"Raauch!  Raauch!\""));
    (yield* finish(FDRAY));
    return;
  }
  if((r<=0.75)){
    prouts("Sulu- \"Captain!  It's   --WHAT?!?!\"");
    (yield* skip(2));
    proutn("Spock-  \"I believe the word is");
    prouts(" *ASTONISHING*");
    (yield* prout(" Mr. Sulu."));
    for(i of $range(QUADSIZE)){
      for(j of $range(QUADSIZE)){
        if(($g($g(game.quad,i),j)===".")){
          $s($g(game.quad,i),j,"?");
        }
      }
    }
    (yield* prout("  Captain, our quadrant is now infested with"));
    prouts(" - - - - - -  *THINGS*.");
    (yield* skip(1));
    (yield* prout("  I have no logical explanation.\""));
    return;
  }
  prouts("Sulu- \"Captain!  The Death Ray is creating tribbles!\"");
  (yield* skip(1));
  (yield* prout("Scotty-  \"There are so many tribbles down here"));
  (yield* prout("  in Engineering, we can't move for 'em, Captain.\""));
  (yield* finish(FTRIBBLE));
  return;
}
// Code from reports.c begins here
function* attackreport(curt){
  // eport status of bases under attack.
  if(!$t(curt)){
    if($t(is_scheduled(FCDBAS))){
      (yield* prout($fmt("Starbase in Quadrant %s is currently under Commander attack.",game.battle)));
      (yield* prout($fmt("It can hold out until Stardate %d.",$int(scheduled(FCDBAS)))));
    }else if((game.isatb==1)){
      (yield* prout($fmt("Starbase in Quadrant %s is under Super-commander attack.",game.state.kscmdr)));
      (yield* prout($fmt("It can hold out until Stardate %d.",$int(scheduled(FSCDBAS)))));
    }else{
      (yield* prout("No Starbase is currently under attack."));
    }
  }else{
    if($t(is_scheduled(FCDBAS))){
      proutn($fmt("Base in %s attacked by C. Alive until %.1f",[game.battle,scheduled(FCDBAS)]));
    }
    if($t(game.isatb)){
      proutn($fmt("Base in %s attacked by S. Alive until %.1f",[game.state.kscmdr,scheduled(FSCDBAS)]));
    }
  }
}
function* report(){
  var s1,s2,s3,embriggened,i,ai;
  // report on general game status
  scanner.chew();
  s1=((game.thawed && "thawed ") || "");
  s2=($t(game.sandbox)?"sandbox":$g(new Map([[1,"short"],[2,"medium"],[4,"long"]]),game.length));
  s3=$g([null,"novice","fair","good","expert","emeritus"],game.skill);
  (yield* prout($fmt("You %s a %s%s %s game.",[$g(["were playing","are playing"],game.alldone),s1,s2,s3])));
  if(((game.skill>SKILL_GOOD) && $t(game.thawed) && !$t(game.alldone))){
    (yield* prout("No plaque is allowed."));
  }
  if($t(game.tourn)){
    (yield* prout($fmt("This is tournament game %d.",game.tourn)));
  }
  (yield* prout($fmt("Your secret password is \"%s\"",game.passwd)));
  proutn($fmt("%d of %d Klingons have been killed",[$sub($add($add(game.inkling,game.incom),game.inscom),game.unwon()),$add($add(game.inkling,game.incom),game.inscom)]));
  if($t($sub(game.incom,$len(game.state.kcmdr)))){
    (yield* prout($fmt(", including %d Commander%s.",[$sub(game.incom,$len(game.state.kcmdr)),$g(["s",""],($sub(game.incom,$len(game.state.kcmdr))==1))])));
  }else if(($add($sub(game.inkling,game.remkl()),$sub(game.inscom,game.state.nscrem))>0)){
    (yield* prout(", but no Commanders."));
  }else{
    (yield* prout("."));
  }
  if((game.skill>SKILL_FAIR)){
    (yield* prout($fmt("The Super Commander has %sbeen destroyed.",$g(["","not "],game.state.nscrem))));
  }
  if($ne($len(game.state.baseq),game.inbase)){
    proutn("There ");
    if(($sub(game.inbase,$len(game.state.baseq))==1)){
      proutn("has been 1 base");
    }else{
      proutn($fmt("have been %d bases",$sub(game.inbase,$len(game.state.baseq))));
    }
    (yield* prout($fmt(" destroyed, %d remaining.",$len(game.state.baseq))));
  }else{
    (yield* prout($fmt("There are %d bases.",game.inbase)));
  }
  if((communicating() || $t(game.iseenit))){
    // Don't report this if not seen and
    // either the radio is dead or not at base!
    (yield* attackreport(false));
    game.iseenit=true;
  }
  if($t(game.casual)){
    (yield* prout($fmt("%d casualt%s suffered so far.",[game.casual,$g(["y","ies"],(game.casual!=1))])));
  }
  if($ne(game.brigcapacity,game.brigfree)){
    embriggened=$sub(game.brigcapacity,game.brigfree);
    if((embriggened==1)){
      (yield* prout("1 Klingon in brig"));
    }else{
      (yield* prout($fmt("%d Klingons in brig.",embriggened)));
    }
    if((game.kcaptured==0)){
    }else if((game.kcaptured==1)){
      (yield* prout("1 captured Klingon turned in to Starfleet."));
    }else{
      (yield* prout($fmt("%d captured Klingons turned in to Star Fleet.",game.kcaptured)));
    }
  }
  if($t(game.nhelp)){
    (yield* prout($fmt("There were %d call%s for help.",[game.nhelp,$g(["","s"],(game.nhelp!=1))])));
  }
  if((game.ship==="E")){
    proutn("You have ");
    if($t(game.nprobes)){
      proutn($fmt("%d",game.nprobes));
    }else{
      proutn("no");
    }
    proutn(" deep space probe");
    if((game.nprobes!=1)){
      proutn("s");
    }
    (yield* prout("."));
  }
  if((communicating() && $t(is_scheduled(FDSPROB)))){
    if($t(game.isarmed)){
      proutn("An armed deep space probe is in ");
    }else{
      proutn("A deep space probe is in ");
    }
    (yield* prout($fmt("Quadrant %s.",game.probe.quadrant())));
  }
  if($t(game.icrystl)){
    if((game.cryprob<=0.05)){
      (yield* prout("Dilithium crystals aboard ship... not yet used."));
    }else{
      i=0;
      ai=0.05;
      while((game.cryprob>ai)){
        ai=$mul(ai,2);
        i=(i+1);
      }
      (yield* prout($fmt("Dilithium crystals have been used %d time%s.",[i,$g(["s",""],(i==1))])));
    }
  }
  (yield* skip(1));
}
function* lrscan(silent){
  var x,y,cn;
  // Long-range sensor scan.
  if(damaged(DLRSENS)){
    // Now allow base's sensors if docked
    if((game.condition!=="docked")){
      if(!$t(silent)){
        (yield* prout("LONG-RANGE SENSORS DAMAGED."));
      }
      return;
    }
    if(!$t(silent)){
      (yield* prout("Starbase's long-range scan"));
    }
  }else if(!$t(silent)){
    (yield* prout("Long-range scan"));
  }
  for(x of $range((game.quadrant.i-1),(game.quadrant.i+2))){
    if(!$t(silent)){
      proutn(" ");
    }
    for(y of $range((game.quadrant.j-1),(game.quadrant.j+2))){
      if(!new Coord(x,y).valid_quadrant()){
        if(!$t(silent)){
          proutn("  -1");
        }
      }else{
        if(!damaged(DRADIO)){
          $g($g(game.state.galaxy,x),y).charted=true;
        }
        $g($g(game.state.chart,x),y).klingons=$g($g(game.state.galaxy,x),y).klingons;
        $g($g(game.state.chart,x),y).starbase=$g($g(game.state.galaxy,x),y).starbase;
        $g($g(game.state.chart,x),y).stars=$g($g(game.state.galaxy,x),y).stars;
        $g($g(game.state.chart,x),y).supernova=$g($g(game.state.galaxy,x),y).supernova;
        if((!$t(silent) && $t($g($g(game.state.galaxy,x),y).supernova))){
          proutn(" ***");
        }else if(!$t(silent)){
          cn=$fmt(" %3d",$add($add($mul($g($g(game.state.chart,x),y).klingons,100),$mul($g($g(game.state.chart,x),y).starbase,10)),$g($g(game.state.chart,x),y).stars));
          proutn($add($mul((3-$len(cn)),"."),cn));
        }
      }
    }
    if(!$t(silent)){
      (yield* prout(" "));
    }
  }
}
function* damagereport(){
  var jdam,i;
  // Damage report.
  jdam=false;
  scanner.chew();
  for(i of $range(NDEVICES)){
    if(damaged(i)){
      if(!$t(jdam)){
        (yield* prout("DEVICE                             REPAIR TIMES"));
        (yield* prout("                                   IN FLIGHT                DOCKED"));
        jdam=true;
      }
      (yield* prout($fmt("  %-26s\t%8.2f\t\t%8.2f",[$g(device,i),($g(game.damage,i)+0.05),($mul(DOCKFAC,$g(game.damage,i))+0.005)])));
    }
  }
  if(!$t(jdam)){
    (yield* prout("All devices functional."));
  }
}
function rechart(){
  var i,j;
  // Update the chart in the Enterprise's computer from galaxy data.
  game.lastchart=game.state.date;
  for(i of $range(GALSIZE)){
    for(j of $range(GALSIZE)){
      // Starfleet reports supernovae even in unexplored quadrants.
      $g($g(game.state.chart,i),j).supernova=$g($g(game.state.galaxy,i),j).supernova;
      if($t($g($g(game.state.galaxy,i),j).charted)){
        $g($g(game.state.chart,i),j).klingons=$g($g(game.state.galaxy,i),j).klingons;
        $g($g(game.state.chart,i),j).starbase=$g($g(game.state.galaxy,i),j).starbase;
        $g($g(game.state.chart,i),j).stars=$g($g(game.state.galaxy,i),j).stars;
      }
    }
  }
}
function* chart(){
  var i,j,show;
  // Display the star chart.
  scanner.chew();
  if((game.options&OPTION_AUTOSCAN)){
    (yield* lrscan(true));
  }
  if(communicating()){
    rechart();
  }
  if(((game.lastchart<game.state.date) && (game.condition==="docked"))){
    (yield* prout("Spock-  \"I revised the Star Chart from the starbase's records.\""));
    rechart();
  }
  (yield* prout("       STAR CHART FOR THE KNOWN GALAXY"));
  if((game.state.date>game.lastchart)){
    (yield* prout($fmt("(Last surveillance update %d stardates ago).",$int($sub(game.state.date,game.lastchart)))));
  }
  (yield* prout("      1    2    3    4    5    6    7    8"));
  for(i of $range(GALSIZE)){
    if((game.options&OPTION_ALPHAMERIC)){
      proutn($fmt("%c |",letterize((i+1))));
    }else{
      proutn($fmt("%d |",(i+1)));
    }
    for(j of $range(GALSIZE)){
      if(((game.options&OPTION_SHOWME) && $eq(i,game.quadrant.i) && $eq(j,game.quadrant.j))){
        proutn("<");
      }else{
        proutn(" ");
      }
      if($t($g($g(game.state.chart,i),j).supernova)){
        show="***";
      }else if((!$t($g($g(game.state.galaxy,i),j).charted) && $t($g($g(game.state.chart,i),j).starbase))){
        show=".1.";
      }else if($t($g($g(game.state.galaxy,i),j).charted)){
        show=$fmt("%3d",$add($add($mul($g($g(game.state.chart,i),j).klingons,100),$mul($g($g(game.state.chart,i),j).starbase,10)),$g($g(game.state.chart,i),j).stars));
        if((game.options&OPTION_DOTFILL)){
          show=show.split(" ").join(".");
        }
      }else{
        show="...";
      }
      proutn(show);
      if(((game.options&OPTION_SHOWME) && $eq(i,game.quadrant.i) && $eq(j,game.quadrant.j))){
        proutn(">");
      }else{
        proutn(" ");
      }
    }
    proutn("  |");
    if((i<GALSIZE)){
      (yield* skip(1));
    }
  }
}
function sectscan(goodScan,i,j){
  // Light up an individual dot in a sector.
  if(($t(goodScan) || (($abs($sub(i,game.sector.i))<=1) && ($abs($sub(j,game.sector.j))<=1)))){
    if($in($g($g(game.quad,i),j),["E","F"])){
      if($t(game.iscloaked)){
      }
    }
    proutn($fmt("%c ",$g($g(game.quad,i),j)));
  }else{
    proutn("- ");
  }
}
function* status(req=0){
  var extra,data,s,plnet;
  // Emit status report lines
  if((!$t(req) || (req==1))){
    if((req==1)){
      (yield* prstat("Stardate",$fmt("%.1f",game.state.date)));
    }else if($t(game.sandbox)){
      (yield* prstat("Stardate",$fmt("%.1f, Time Left: Unlimited",game.state.date)));
    }else{
      (yield* prstat("Stardate",$fmt("%.1f, Time Left %.2f",[game.state.date,game.state.remtime])));
    }
  }
  if((!$t(req) || (req==2))){
    if((game.condition!=="docked")){
      newcnd();
    }
    (yield* prstat("Condition",$fmt("%s, %i DAMAGES",[game.condition.toUpperCase(),$sum((()=>{const $r=[];for(const x of $iter(game.damage)){$r.push((x>0));}return $r})())])));
    if($t(game.iscloaked)){
      (yield* prout(", CLOAKED"));
    }
  }
  if((!$t(req) || (req==3))){
    (yield* prstat("Position",$fmt("%s , %s",[game.quadrant,game.sector])));
  }
  if((!$t(req) || (req==4))){
    if(damaged(DLIFSUP)){
      if((game.condition==="docked")){
        s="DAMAGED, Base provides";
      }else{
        s=$fmt("DAMAGED, reserves=%4.2f",game.lsupres);
      }
    }else{
      s="ACTIVE";
    }
    (yield* prstat("Life Support",s));
  }
  if((!$t(req) || (req==5))){
    (yield* prstat("Warp Factor",$fmt("%.1f",game.warpfac)));
  }
  if((!$t(req) || (req==6))){
    extra="";
    if(($t(game.icrystl) && (game.options&OPTION_SHOWME))){
      extra=" (have crystals)";
    }
    (yield* prstat("Energy",$fmt("%.2f%s",[game.energy,extra])));
  }
  if((!$t(req) || (req==7))){
    (yield* prstat("Torpedoes",$fmt("%d",game.torps)));
  }
  if((!$t(req) || (req==8))){
    if(damaged(DSHIELD)){
      s="DAMAGED,";
    }else if($t(game.shldup)){
      s="UP,";
    }else{
      s="DOWN,";
    }
    data=$fmt(" %d%% %.1f units",[$int(($div($mul(100,game.shield),game.inshld)+0.5)),game.shield]);
    (yield* prstat("Shields",$add(s,data)));
  }
  if((!$t(req) || (req==9))){
    (yield* prstat("Klingons Left",$fmt("%d",game.unwon())));
  }
  if((!$t(req) || (req==10))){
    if((game.options&OPTION_WORLDS)){
      plnet=$g($g(game.state.galaxy,game.quadrant.i),game.quadrant.j).planet;
      if(($t(plnet) && $t(plnet.inhabited))){
        (yield* prstat("Major system",plnet.name));
      }else{
        (yield* prout("Sector is uninhabited"));
      }
    }
  }else if((!$t(req) || (req==11))){
    (yield* attackreport(!$t(req)));
  }
  // Separate REQUEST fields without adding rows to the screen status panel.
  if((req==12)){
    (yield* prstat("Time Left",($t(game.sandbox)?"Unlimited":$fmt("%.2f",game.state.remtime))));
  }
  if((req==13)){
    (yield* prstat("Bases Left",$fmt("%d",$len(game.state.baseq))));
  }
}
function* request(){
  var requests,item,name,shortest,field;
  // Request specified status data, a historical relic from slow TTYs.
  // Full item name, shortest abbreviation, and status field number.
  requests=[["date","d",1],["condition","c",2],["position","p",3],["lsupport","l",4],["warpfactor","w",5],["energy","e",6],["torpedoes","t",7],["shields","s",8],["klingons","k",9],["time","ti",12],["bases","ba",13]];
  while(((yield* scanner.nexttok())==="IHEOL")){
    proutn("Information desired? ");
  }
  item=scanner.token;
  scanner.chew();
  for([name,shortest,field] of $iter(requests)){
    if(($t(item) && $startswith(name,item) && $startswith(item,shortest))){
      (yield* status(field));
      return;
    }
  }
  (yield* prout("UNRECOGNIZED REQUEST. Legal requests are:"));
  (yield* prout("  date, condition, position, lsupport, warpfactor,"));
  (yield* prout("  energy, torpedoes, shields, klingons, time, bases."));
}
function* srscan(){
  var goodScan,i,j;
  // Short-range scan.
  goodScan=true;
  if(damaged(DSRSENS)){
    // Allow base's sensors if docked
    if((game.condition!=="docked")){
      (yield* prout("   S.R. SENSORS DAMAGED!"));
      goodScan=false;
    }else{
      (yield* prout("  [Using Base's sensors]"));
    }
  }else{
    (yield* prout("     Short-range scan"));
  }
  if(($t(goodScan) && communicating())){
    $g($g(game.state.chart,game.quadrant.i),game.quadrant.j).klingons=$g($g(game.state.galaxy,game.quadrant.i),game.quadrant.j).klingons;
    $g($g(game.state.chart,game.quadrant.i),game.quadrant.j).starbase=$g($g(game.state.galaxy,game.quadrant.i),game.quadrant.j).starbase;
    $g($g(game.state.chart,game.quadrant.i),game.quadrant.j).stars=$g($g(game.state.galaxy,game.quadrant.i),game.quadrant.j).stars;
    $g($g(game.state.chart,game.quadrant.i),game.quadrant.j).supernova=$g($g(game.state.galaxy,game.quadrant.i),game.quadrant.j).supernova;
    $g($g(game.state.galaxy,game.quadrant.i),game.quadrant.j).charted=true;
  }
  (yield* prout("    1 2 3 4 5 6 7 8 9 10"));
  if((game.condition!=="docked")){
    newcnd();
  }
  for(i of $range(QUADSIZE)){
    if((game.options&OPTION_ALPHAMERIC)){
      proutn($fmt("%c   ",letterize((i+1))));
    }else{
      proutn($fmt("%2d  ",(i+1)));
    }
    for(j of $range(QUADSIZE)){
      sectscan(goodScan,i,j);
    }
    (yield* skip(1));
  }
}
function* eta(){
  var w1,w2,prompt,dist,wfl,ttime,tpower,twarp;
  // Use computer to get estimated time of arrival for a warp jump.
  w1=new Coord();
  w2=new Coord();
  prompt=false;
  if(damaged(DCOMPTR)){
    (yield* prout("COMPUTER DAMAGED, USE A POCKET CALCULATOR."));
    (yield* skip(1));
    return;
  }
  if(((yield* scanner.nexttok())!=="IHREAL")){
    prompt=true;
    scanner.chew();
    proutn("Destination quadrant and/or sector? ");
    if(((yield* scanner.nexttok())!=="IHREAL")){
      (yield* huh());
      return;
    }
  }
  w1.j=$int((scanner.real-0.5));
  if(((yield* scanner.nexttok())!=="IHREAL")){
    (yield* huh());
    return;
  }
  w1.i=$int((scanner.real-0.5));
  if(((yield* scanner.nexttok())==="IHREAL")){
    w2.j=$int((scanner.real-0.5));
    if(((yield* scanner.nexttok())!=="IHREAL")){
      (yield* huh());
      return;
    }
    w2.i=$int((scanner.real-0.5));
  }else{
    if((game.quadrant.j>w1.i)){
      w2.i=0;
    }else{
      w2.i=(QUADSIZE-1);
    }
    if((game.quadrant.i>w1.j)){
      w2.j=0;
    }else{
      w2.j=(QUADSIZE-1);
    }
  }
  if((!w1.valid_quadrant() || !w2.valid_sector())){
    (yield* huh());
    return;
  }
  dist=Math.sqrt($add($pow($add($sub(w1.j,game.quadrant.j),$div($sub(w2.j,game.sector.j),(QUADSIZE*1))),2),$pow($add($sub(w1.i,game.quadrant.i),$div($sub(w2.i,game.sector.i),(QUADSIZE*1))),2)));
  wfl=false;
  if($t(prompt)){
    (yield* prout("Answer \"no\" if you don't know the value:"));
  }
  for(;;){
    scanner.chew();
    proutn("Time or arrival date? ");
    if(((yield* scanner.nexttok())==="IHREAL")){
      ttime=scanner.real;
      if((ttime>game.state.date)){
        ttime=$sub(ttime,game.state.date); // Actually a star date
      }
      if((ttime<=1e-10)){
        (yield* prout("We'll never make it, sir."));
        scanner.chew();
        return;
      }
      twarp=$div((Math.floor((Math.sqrt($div($mul(10,dist),ttime))*10))+1),10);
      if((twarp>10)){
        (yield* prout("We'll never make it, sir."));
        scanner.chew();
        return;
      }
      twarp=$max(twarp,1);
      break;
    }
    scanner.chew();
    proutn("Warp factor? ");
    if(((yield* scanner.nexttok())==="IHREAL")){
      wfl=true;
      twarp=scanner.real;
      if(((twarp<1) || (twarp>10))){
        (yield* huh());
        return;
      }
      break;
    }
    (yield* prout("Captain, certainly you can give me one of these."));
  }
  for(;;){
    scanner.chew();
    ttime=$div($mul(10,dist),$pow(twarp,2));
    tpower=$mul($mul($mul($mul(dist,twarp),twarp),twarp),(game.shldup+1));
    if((tpower>=game.energy)){
      (yield* prout("Insufficient energy, sir."));
      if((!$t(game.shldup) || (tpower>$mul(game.energy,2)))){
        if(!$t(wfl)){
          return;
        }
        proutn("New warp factor to try? ");
        if(((yield* scanner.nexttok())==="IHREAL")){
          wfl=true;
          twarp=scanner.real;
          if(((twarp<1) || (twarp>10))){
            (yield* huh());
            return;
          }
          continue;
        }else{
          scanner.chew();
          (yield* skip(1));
          return;
        }
      }
      (yield* prout("But if you lower your shields,"));
      proutn("remaining");
      tpower=$div(tpower,2);
    }else{
      proutn("Remaining");
    }
    (yield* prout($fmt(" energy will be %.2f.",$sub(game.energy,tpower))));
    if($t(wfl)){
      (yield* prout($fmt("And we will arrive at stardate %.2f.",$add(game.state.date,ttime))));
    }else if((twarp==1)){
      (yield* prout("Any warp speed is adequate."));
    }else{
      (yield* prout($fmt("Minimum warp needed is %.2f,",twarp)));
      (yield* prout($fmt("and we will arrive at stardate %.2f.",$add(game.state.date,ttime))));
    }
    if((!$t(game.sandbox) && (game.state.remtime<ttime))){
      (yield* prout("Unfortunately, the Federation will be destroyed by then."));
    }
    if((twarp>6)){
      (yield* prout("You'll be taking risks at that speed, Captain"));
    }
    if((((game.isatb==1) && $eq(game.state.kscmdr,w1) && (scheduled(FSCDBAS)<$add(ttime,game.state.date))) || ((scheduled(FCDBAS)<$add(ttime,game.state.date)) && $eq(game.battle,w1)))){
      (yield* prout("The starbase there will be destroyed by then."));
    }
    proutn("New warp factor to try? ");
    if(((yield* scanner.nexttok())==="IHREAL")){
      wfl=true;
      twarp=scanner.real;
      if(((twarp<1) || (twarp>10))){
        (yield* huh());
        return;
      }
    }else{
      scanner.chew();
      (yield* skip(1));
      return;
    }
  }
}
// This is new in SST2K.
function* goptions(){
  var mode,active,k,v,changemask;
  mode=(yield* scanner.nexttok());
  if((mode==="IHEOL")){
    active=[];
    for([k,v] of $iter($items(option_names))){
      if((($g(v,0)&game.options) && (k!=="ALL"))){
        active.push(k);
      }
    }
    $sort(active,null,false);
    (yield* prout($str($list(active).join(" "))));
  }else if($in(scanner.token,["set","clear"])){
    mode=scanner.token;
    changemask=0;
    for(;;){
      (yield* scanner.nexttok());
      if((scanner.type==="IHEOL")){
        break;
      }
      if($in(scanner.token.toUpperCase(),option_names)){
        changemask=(changemask|$g($g(option_names,scanner.token.toUpperCase()),0));
      }else{
        (yield* prout($add("No such option as ",scanner.token)));
      }
    }
    if((mode==="set")){
      game.options=(game.options|changemask);
    }else if((mode==="clear")){
      game.options=(game.options&(~changemask));
    }
    // Explicit choices supersede the features hidden by Wayback.
    game.wayback_disabled=(game.wayback_disabled&(~changemask));
    (yield* prout("Acknowledged, Captain."));
  }else{
    (yield* huh());
  }
  scanner.chew();
  (yield* skip(1));
}
// Code from setup.c begins here
function* prelim(){
  // Issue a historically correct banner.
  (yield* skip(2));
  (yield* prout("-SUPER- STAR TREK"));
  (yield* skip(1));
}
// From the FORTRAN original
// prout(_("Latest update-21 Sept 78"))
// skip(1)
// Exact types are deliberate here: deserialization must not accept subclasses.
// This misspelling was written by older releases but never read.
function validate_game(saved){
  var snapshot,event,enemy;
  // Check dimensions and coordinates before saved state can be used by the game.
  function matrix(value,size){
    return ($eq($len(value),size) && $all((()=>{const $r=[];for(const row of $iter(value)){$r.push($eq($len(row),size));}return $r})()));
  }
  function coordinate(value,size,optional=false){
    if((value==null)){
      return optional;
    }
    if(((value.i==null) && (value.j==null))){
      return optional;
    }
    return $all((()=>{const $r=[];for(const v of $iter([value.i,value.j])){$r.push((Number.isInteger(v) && ((0<=v) && (v<size))));}return $r})());
  }
  if((!$in(saved.skill,$range(SKILL_NOVICE,(SKILL_EMERITUS+1))) || !$in(saved.length,[1,2,4]) || !$in(saved.ship,["E","F",null]) || !$in(saved.condition,["green","yellow","red","docked","dead"]) || !$t(coordinate(saved.quadrant,GALSIZE)) || !$t(coordinate(saved.sector,QUADSIZE)) || !$t(matrix(saved.quad,QUADSIZE)) || $ne($len(saved.damage),NDEVICES) || $ne($len(saved.future),NEVENTS) || (saved.inshld<=0) || !((1<=saved.warpfac) && (saved.warpfac<=10)))){
    throw new ValueError("Invalid ship state");
  }
  if($t($any((()=>{const $r=[];for(const row of $iter(saved.quad)){for(const symbol of $iter(row)){$r.push((($len(symbol)!=1) || !$in(symbol,". EFKCRST?BP@*#X")));}}return $r})()))){
    throw new ValueError("Invalid sector map");
  }
  if(!$t($all((()=>{const $r=[];for(const c of $iter([saved.base,saved.plnet])){$r.push(coordinate(c,QUADSIZE,true));}return $r})()))){
    throw new ValueError("Invalid local coordinates");
  }
  for(snapshot of $iter([saved.state,saved.snapsht])){
    if((!$t(matrix(snapshot.galaxy,GALSIZE)) || !$t(matrix(snapshot.chart,GALSIZE)))){
      throw new ValueError("Invalid galaxy dimensions");
    }
    if((!$t(coordinate(snapshot.kscmdr,GALSIZE,true)) || !$t($all((()=>{const $r=[];for(const c of $iter($add(snapshot.baseq,snapshot.kcmdr))){$r.push(coordinate(c,GALSIZE));}return $r})())) || !$t($all((()=>{const $r=[];for(const p of $iter(snapshot.planets)){$r.push(coordinate(p.quadrant,GALSIZE));}return $r})())))){
      throw new ValueError("Invalid galaxy coordinates");
    }
    if($t($any((()=>{const $r=[];for(const row of $iter(snapshot.galaxy)){for(const q of $iter(row)){$r.push(((q.klingons<0) || (q.romulans<0) || (q.stars<0)));}}return $r})()))){
      throw new ValueError("Negative quadrant count");
    }
  }
  if(!$t(coordinate(saved.battle,GALSIZE,true))){
    throw new ValueError("Invalid battle coordinates");
  }
  for(event of $iter(saved.future)){
    if(!$t(coordinate(event.quadrant,GALSIZE,true))){
      throw new ValueError("Invalid event coordinates");
    }
  }
  for(enemy of $iter($add(saved.enemies,($t(saved.tholian)?[saved.tholian]:[])))){
    if((!$in(enemy.type,["K","C","S","R","T","?"]) || !$t(coordinate(enemy.location,QUADSIZE,true)))){
      throw new ValueError("Invalid enemy");
    }
  }
}
// Extension-cache hits can bypass find_class(). Saves need no extensions.
// Migrate older saves only after their structure has been checked.
// I used <http://www.memory-alpha.org> to find planets
// with references in ST:TOS.  Earth and the Alpha Centauri
// Colony have been omitted.
// 
// Some planets marked Class G and P here will be displayed as class M
// because of the way planets are generated. This is a known bug.
systnames=["Andoria (Fesoan)","Tellar Prime (Miracht)","Vulcan (T'Khasi)","Medusa","Argelius II (Nelphia)","Ardana","Catulla (Cendo-Prae)","Gideon","Aldebaran III","Alpha Majoris I","Altair IV","Ariannus","Benecia","Beta Niobe I (Sarpeidon)","Alpha Carinae II","Capella IV (Kohath)","Daran V","Deneb II","Eminiar VII","Gamma Canaris IV","Gamma Tranguli VI (Vaalel)","Ingraham B","Janus IV","Makus III","Marcos XII","Omega IV","Regulus V","Deneva","Rigel II","Beta III","Triacus","Exo III"]; // Federation Worlds // several episodes // TOS: "Journey to Babel" // many episodes // TOS: "Is There in Truth No Beauty?" // TOS: "Wolf in the Fold" ("IV" in BSD) // TOS: "The Cloud Minders" // TOS: "The Way to Eden" // TOS: "The Mark of Gideon" // TOS: "The Deadly Years" // TOS: "Wolf in the Fold" // TOS: "Amok Time // TOS: "Let That Be Your Last Battlefield" // TOS: "The Conscience of the King" // TOS: "All Our Yesterdays" // TOS: "The Ultimate Computer" // TOS: "Friday's Child" (Class G) // TOS: "For the World is Hollow and I Have Touched the Sky" // TOS: "Wolf in the Fold" ("IV" in BSD) // TOS: "A Taste of Armageddon" // TOS: "Metamorphosis" // TOS: "The Apple" // TOS: "Operation: Annihilate" // TOS: "The Devil in the Dark" // TOS: "The Galileo Seven" // TOS: "And the Children Shall Lead", // TOS: "The Omega Glory" // TOS: "Amok Time // TOS: "Operation -- Annihilate!" // Worlds from BSD Trek // TOS: "Shore Leave" ("III" in BSD) // TOS: "The Return of the Archons" // TOS: "And the Children Shall Lead", // TOS: "What Are Little Girls Made Of?" (Class P) // # Others // _("Hansen's Planet"),        # TOS: "The Galileo Seven" // _("Taurus IV"),                # TOS: "The Galileo Seven" (class G) // _("Antos IV (Doraphane)"),        # TOS: "Whom Gods Destroy", "Who Mourns for Adonais?" // _("Izar"),                        # TOS: "Whom Gods Destroy" // _("Tiburon"),                # TOS: "The Way to Eden" // _("Merak II"),                # TOS: "The Cloud Minders" // _("Coridan (Desotriana)"),        # TOS: "Journey to Babel" // _("Iotia"),                # TOS: "A Piece of the Action"
device=["S. R. Sensors","L. R. Sensors","Phasers","Photon Tubes","Life Support","Warp Engines","Impulse Engines","Shields","Subspace Radio","Shuttle Craft","Computer","Navigation System","Transporter","Shield Control","Death Ray","D. S. Probe","Cloaking Device"];
function* setup(){
  var w,i,krem,klumper,j,r,klump,new_,state,k,contflag,distq;
  // Prepare to play, set up cosmos.
  w=new Coord();
  // Decide how many of everything
  if($t((yield* choose()))){
    return; // frozen game
  }
  // Prepare the Enterprise
  {const $v=false;game.alldone=$v;game.gamewon=$v;game.shldchg=$v;game.shldup=$v;}
  game.ship="E";
  {const $v=false;game.iscloaked=$v;game.isviolreported=$v;}
  {const $v=400;game.brigfree=$v;game.brigcapacity=$v;}
  game.state.crew=FULLCREW;
  {const $v=5000;game.energy=$v;game.inenrg=$v;}
  {const $v=2500;game.shield=$v;game.inshld=$v;}
  game.inlsr=4;
  game.lsupres=4;
  game.quadrant=randplace(GALSIZE);
  game.sector=randplace(QUADSIZE);
  {const $v=10;game.torps=$v;game.intorps=$v;}
  game.nprobes=rnd.integer(2,5);
  game.warpfac=5;
  for(i of $range(NDEVICES)){
    $s(game.damage,i,0);
  }
  // Set up assorted game parameters
  game.battle=new Coord();
  {const $v=(100*rnd.real(20,51));game.state.date=$v;game.indate=$v;}
  {const $v=0;game.nkinks=$v;game.nhelp=$v;game.casual=$v;game.abandoned=$v;}
  {const $v=0;game.kcaptured=$v;game.ncviol=$v;}
  {const $v=0;game.score=$v;game.perdate=$v;}
  {const $v=false;game.iscate=$v;game.resting=$v;game.imine=$v;game.icrystl=$v;game.icraft=$v;}
  {const $v=0;game.isatb=$v;game.state.nplankl=$v;}
  {const $v=0;game.state.starkl=$v;game.state.basekl=$v;game.state.nworldkl=$v;}
  game.iscraft="onship";
  game.landed=false;
  game.alive=true;
  // the galaxy
  game.state.galaxy=fill2d(GALSIZE,((i_unused,j_unused)=>new Quadrant()));
  // the starchart
  game.state.chart=fill2d(GALSIZE,((i_unused,j_unused)=>new Page()));
  game.state.planets=[]; // Planet information
  game.state.baseq=[]; // Base quadrant coordinates
  game.state.kcmdr=[]; // Commander quadrant coordinates
  game.state.kscmdr=new Coord(); // Supercommander quadrant coordinates
  // Starchart is functional but we've never seen it
  game.lastchart=FOREVER;
  // Put stars in the galaxy
  game.instar=0;
  for(i of $range(GALSIZE)){
    for(j of $range(GALSIZE)){
      // Can't have more stars per quadrant than fit in one decimal digit,
      // if we do the chart representation will break.
      k=rnd.integer(1,$min(10,$div($pow(QUADSIZE,2),10)));
      game.instar=$add(game.instar,k);
      $g($g(game.state.galaxy,i),j).stars=k;
    }
  }
  // Locate star bases in galaxy
  if($t(game.idebug)){
    (yield* prout($fmt("=== Allocating %d bases",game.inbase)));
  }
  for(i of $range(game.inbase)){
    for(;;){
      for(;;){
        w=randplace(GALSIZE);
        if(!$t($g($g(game.state.galaxy,w.i),w.j).starbase)){
          break;
        }
      }
      contflag=false;
      // C version: for (j = i-1; j > 0; j--)
      // so it did them in the opposite order.
      for(j of $range(1,i)){
        // Improved placement algorithm to spread out bases
        distq=$sub(w,$g(game.state.baseq,j)).distance();
        if(((distq<$mul(6,$sub((BASEMAX+1),game.inbase))) && rnd.withprob(0.75))){
          contflag=true;
          if($t(game.idebug)){
            (yield* prout($fmt("=== Abandoning base #%d at %s",[i,w])));
          }
          break;
        }else if((distq<$mul(6,$sub((BASEMAX+1),game.inbase)))){
          if($t(game.idebug)){
            (yield* prout($fmt("=== Saving base #%d, close to #%d",[i,j])));
          }
        }
      }
      if(!$t(contflag)){
        break;
      }
    }
    if($t(game.idebug)){
      (yield* prout($fmt("=== Placing base #%d in quadrant %s",[i,w])));
    }
    game.state.baseq.push(w);
    {const $v=true;$g($g(game.state.galaxy,w.i),w.j).starbase=$v;$g($g(game.state.chart,w.i),w.j).starbase=$v;}
  }
  // Position ordinary Klingon Battle Cruisers
  krem=game.inkling;
  klumper=($mul($mul(0.25,game.skill),(9-game.length))+1);
  klumper=$min(klumper,MAXKLQUAD);
  for(;;){
    r=rnd.real();
    klump=$int($mul((1-$mul(r,r)),klumper));
    klump=$min(klump,krem);
    krem=$sub(krem,klump);
    for(;;){
      w=randplace(GALSIZE);
      if((!$t($g($g(game.state.galaxy,w.i),w.j).supernova) && ($add($g($g(game.state.galaxy,w.i),w.j).klingons,klump)<=MAXKLQUAD))){
        break;
      }
    }
    $g($g(game.state.galaxy,w.i),w.j).klingons=$add($g($g(game.state.galaxy,w.i),w.j).klingons,klump);
    if((krem<=0)){
      break;
    }
  }
  // Position Klingon Commander Ships
  for(i of $range(game.incom)){
    for(;;){
      w=randplace(GALSIZE);
      if((!welcoming(w) || $in(w,game.state.kcmdr))){
        continue;
      }
      if(($t($g($g(game.state.galaxy,w.i),w.j).klingons) || rnd.withprob(0.25))){
        break;
      }
    }
    $g($g(game.state.galaxy,w.i),w.j).klingons=($g($g(game.state.galaxy,w.i),w.j).klingons+1);
    game.state.kcmdr.push(w);
  }
  // Locate planets in galaxy
  for(i of $range(game.inplan)){
    for(;;){
      w=randplace(GALSIZE);
      if(($g($g(game.state.galaxy,w.i),w.j).planet==null)){
        break;
      }
    }
    new_=new Planet();
    new_.quadrant=w;
    new_.crystals="absent";
    if(((game.options&OPTION_WORLDS) && (i<NINHAB))){
      new_.pclass="M"; // All inhabited planets are class M
      new_.crystals="absent";
      new_.known="known";
      new_.name=$g(systnames,i);
      new_.inhabited=true;
    }else{
      new_.pclass=$g(["M","N","O"],rnd.integer(0,3));
      if(rnd.withprob(0.33)){
        new_.crystals="present";
      }
      new_.known="unknown";
      new_.inhabited=false;
    }
    $g($g(game.state.galaxy,w.i),w.j).planet=new_;
    game.state.planets.push(new_);
  }
  // Locate Romulans
  for(i of $range(game.state.nromrem)){
    w=randplace(GALSIZE);
    $g($g(game.state.galaxy,w.i),w.j).romulans=($g($g(game.state.galaxy,w.i),w.j).romulans+1);
  }
  // Place the Super-Commander if needed
  if((game.state.nscrem>0)){
    for(;;){
      w=randplace(GALSIZE);
      if(welcoming(w)){
        break;
      }
    }
    game.state.kscmdr=w;
    $g($g(game.state.galaxy,w.i),w.j).klingons=($g($g(game.state.galaxy,w.i),w.j).klingons+1);
  }
  // Initialize times for extraneous events
  schedule(FSNOVA,expran($mul(0.5,game.intime)));
  if($t(game.state.kcmdr)){
    schedule(FTBEAM,expran($mul(1.5,$div(game.intime,$len(game.state.kcmdr)))));
  }else{
    unschedule(FTBEAM);
  }
  schedule(FSNAP,rnd.real(1,2)); // Force an early snapshot
  schedule(FBATTAK,expran($mul(0.3,game.intime)));
  unschedule(FCDBAS);
  if($t(game.state.nscrem)){
    schedule(FSCMOVE,0.2777);
  }else{
    unschedule(FSCMOVE);
  }
  unschedule(FSCDBAS);
  unschedule(FDSPROB);
  if(((game.options&OPTION_WORLDS) && (game.skill>=SKILL_GOOD))){
    schedule(FDISTR,expran((1+game.intime)));
  }else{
    unschedule(FDISTR);
  }
  unschedule(FENSLV);
  unschedule(FREPRO);
  // Place thing (in tournament game, we don't want one!)
  // New in SST2K: never place the Thing near a starbase.
  // This makes sense and avoids a special case in the old code.
  if((game.tourn==null)){
    // Avoid distrubing the RNG chain.  This code
    // was a late fix and we don't want to mess up
    // all the regression tests.
    state=rnd.getrngstate();
    for(;;){
      thing.location=randplace(GALSIZE);
      // Put it somewhere a starbase is not
      if(!$in(thing.location,game.state.baseq)){
        break;
      }
    }
    rnd.setrngstate(state);
  }
  (yield* skip(2));
  game.state.snap=false;
  if($eq(game.skill,SKILL_NOVICE)){
    (yield* prout($fmt("It is stardate %d. The Federation is being attacked by",$int(game.state.date))));
    (yield* prout("a deadly Klingon invasion force. As captain of the United"));
    (yield* prout("Starship U.S.S. Enterprise, it is your mission to seek out"));
    (yield* prout($fmt("and destroy this invasion force of %d battle cruisers.",$add($add(game.inkling,game.incom),game.inscom))));
    if($t(game.sandbox)){
      (yield* prout("SANDBOX MODE: There is no time limit on your mission."));
    }else{
      (yield* prout($fmt("You have an initial allotment of %d stardates to complete",$int(game.intime))));
      (yield* prout("your mission.  As you proceed you may be given more time."));
    }
    (yield* skip(1));
    (yield* prout($fmt("You will have %d supporting starbases.",game.inbase)));
    proutn("Starbase locations-  ");
  }else{
    (yield* prout($fmt("Stardate %d.",$int(game.state.date))));
    (yield* skip(1));
    (yield* prout($fmt("%d Klingons.",$add($add(game.inkling,game.incom),game.inscom))));
    (yield* prout("An unknown number of Romulans."));
    if($t(game.state.nscrem)){
      (yield* prout("And one (GULP) Super-Commander."));
    }
    if($t(game.sandbox)){
      (yield* prout("Sandbox mode - no time limit."));
    }else{
      (yield* prout($fmt("%d stardates.",$int(game.intime))));
    }
    proutn($fmt("%d starbases in ",game.inbase));
  }
  for(i of $range(game.inbase)){
    proutn($repr($g(game.state.baseq,i)));
    proutn("  ");
  }
  (yield* skip(2));
  proutn($fmt("The Enterprise is currently in Quadrant %s",game.quadrant));
  proutn($fmt(" Sector %s",game.sector));
  (yield* skip(2));
  (yield* prout("Good Luck!"));
  if($t(game.state.nscrem)){
    (yield* prout("  YOU'LL NEED IT."));
  }
  clrscr();
  (yield* newqad());
  if($t($sub($sub($len(game.enemies),$eq(thing.location,game.quadrant)),(game.tholian!=null)))){
    game.shldup=true;
  }
  if($t(game.neutz)){
    (yield* attack(false));
  }
}
function* choose(){
  var gametype,wayback,__,option,year,initial_klingons,eol_is_fancy;
  // Choose your game type.
  game.tourn=null;
  game.length=0;
  game.sandbox=false;
  game.thawed=false;
  game.skill=SKILL_NONE;
  gametype=null;
  wayback=0;
  while(((gametype==null) || (game.length==0) || $eq(game.skill,SKILL_NONE) || (wayback==0))){
    eol_is_fancy=false;
    if((!$t(scanner.inqueue) || (scanner.token==="IHEOL"))){
      // Can start with command line options
      if((gametype==null)){
        proutn("Would you like a regular, tournament, or saved game? ");
      }else if((game.length==0)){
        proutn("Would you like a Short, Medium, Long, or Sandbox game? ");
      }else if($eq(game.skill,SKILL_NONE)){
        proutn("Are you a Novice, Fair, Good, Expert, or Emeritus player? ");
      }else if((wayback==0)){
        proutn("Wayback setting (press enter for current year): ");
        eol_is_fancy=true;
      }
    }
    (yield* scanner.nexttok());
    if($t(game.idebug)){
      (yield* prout($fmt("-- Token: %s=%s",[scanner.type,$repr(scanner.token)])));
    }
    if((scanner.token==="")){
      throw new SystemExit(0);
    }
    // Early end of replay
    if($startswith(scanner.token,"r")){
      gametype="regular";
    }else if($startswith(scanner.token,"t")){
      gametype="tournament";
      proutn("Type in tournament number-");
      game.tourn=0;
      while(((yield* scanner.nexttok())!=="IHREAL")){
        if((scanner.token==="")){
          throw new SystemExit(0);
        }
        // EOF while choosing a tournament
        if((scanner.type!=="IHEOL")){
          (yield* huh());
        }
        proutn("Type in tournament number-");
      }
      game.tourn=$int($round(scanner.real));
      rnd.seed(scanner.real);
    }else if($startswith(scanner.token,"sand")){
      // sandbox (no time limit)
      gametype="regular";
      game.length=4;
      game.sandbox=true;
    }else if(($startswith(scanner.token,"sa") || $startswith(scanner.token,"fr"))){
      // saved or frozen
      gametype="saved";
      if($t((yield* thaw()))){
        continue;
      }
      scanner.chew();
      if((game.passwd==null)){
        continue;
      }
      if(!$t(game.alldone)){
        game.thawed=true; // No plaque if not finished
      }
      (yield* report());
      return true;
    }else if($startswith(scanner.token,"s")){
      // short
      game.length=1;
    }else if($startswith(scanner.token,"m")){
      // medium
      game.length=2;
    }else if($startswith(scanner.token,"l")){
      // long
      game.length=4;
    }else if($startswith(scanner.token,"n")){
      // novice
      game.skill=SKILL_NOVICE;
    }else if($startswith(scanner.token,"f")){
      // fair
      game.skill=SKILL_FAIR;
    }else if($startswith(scanner.token,"g")){
      // good
      game.skill=SKILL_GOOD;
    }else if($startswith(scanner.token,"em")){
      // emeritus
      game.skill=SKILL_EMERITUS;
    }else if($startswith(scanner.token,"e")){
      // expert
      game.skill=SKILL_EXPERT;
    }else if((scanner.type==="IHREAL")){
      wayback=scanner.int();
    }else if(($t(eol_is_fancy) && $startswith(scanner.token,"\n"))){
      wayback=$localtime().tm_year;
    }else if($startswith(scanner.token,"\n")){
      continue;
    }else if($startswith(scanner.token,"idebug")){
      game.idebug=true;
    }else{
      // Unrecognized token
      (yield* prout($fmt("Can't interpret %s",$repr(scanner.token))));
    }
  }
  // Restore only features suppressed by the preceding game's year.
  game.options=(game.options|game.wayback_disabled);
  game.wayback_disabled=0;
  for([__,[option,year]] of $iter($items(option_names))){
    if((wayback<year)){
      game.wayback_disabled=(game.wayback_disabled|(game.options&option));
      game.options=(game.options&(~option));
    }
  }
  (yield* setpassword());
  if((game.passwd==="debug")){
    game.idebug=true;
    (yield* prout("=== Debug mode enabled."));
  }
  if($t(game.idebug)){
    (yield* prout($fmt("--- Setup: type=%s length=%s skill=%s wayback=%s",[gametype,game.length,game.skill,wayback])));
  }
  // Use parameters to generate initial values of things
  game.damfac=$mul(0.5,game.skill);
  game.inbase=rnd.integer(BASEMIN,(BASEMAX+1));
  game.inplan=0;
  if((game.options&OPTION_PLANETS)){
    game.inplan=$add(game.inplan,rnd.integer($div(MAXUNINHAB,2),(MAXUNINHAB+1)));
  }
  if((game.options&OPTION_WORLDS)){
    game.inplan=$add(game.inplan,$int(NINHAB));
  }
  {const $v=rnd.integer($mul(2,game.skill));game.state.nromrem=$v;game.inrom=$v;}
  {const $v=((game.skill>SKILL_FAIR) && ((game.options&OPTION_SUPERCMDR)!=0));game.state.nscrem=$v;game.inscom=$v;}
  game.state.remtime=$mul(7,game.length);
  game.intime=game.state.remtime;
  game.inkling=$int($mul($mul(2,game.intime),($mul($mul($sub((game.skill+1),(2*rnd.real())),game.skill),0.1)+0.15)));
  game.incom=$min(MAXCMDR,$int($add(game.skill,$mul($mul(0.0625,game.inkling),rnd.real()))));
  // Match recompute(): all Klingon ships plus the extra commander cost.
  initial_klingons=$add($add(game.inkling,game.incom),game.inscom);
  game.state.remres=$mul($add(initial_klingons,$mul(4,game.incom)),game.intime);
  game.inresor=game.state.remres;
  if((game.inkling>50)){
    game.inbase=(game.inbase+1);
  }
  // In sandbox mode, override time and resources to be effectively infinite
  // but keep intime at Long game value so events still fire normally
  if($t(game.sandbox)){
    game.state.remtime=9999;
    game.state.remres=9999999;
    game.inresor=game.state.remres;
  }
  return false;
}
function dropin(iquad=null){
  var w;
  // Drop a feature on a random dot in the current quadrant.
  for(;;){
    w=randplace(QUADSIZE);
    if(($g($g(game.quad,w.i),w.j)===".")){
      break;
    }
  }
  if((iquad!=null)){
    $s($g(game.quad,w.i),w.j,iquad);
  }
  return w;
}
function newcnd(){
  // Update our alert status.
  game.condition="green";
  if((game.energy<1000)){
    game.condition="yellow";
  }
  if(($t($g($g(game.state.galaxy,game.quadrant.i),game.quadrant.j).klingons) || $t($g($g(game.state.galaxy,game.quadrant.i),game.quadrant.j).romulans))){
    game.condition="red";
  }
  if(!$t(game.alive)){
    game.condition="dead";
  }
}
function newkling(){
  // Drop new Klingon into current quadrant.
  return new Enemy("K",dropin(),$add(rnd.real(300,450),$mul(25,game.skill)));
}
function sortenemies(){
  // Sort enemies by distance so 'nearest' is meaningful.
  $sort(game.enemies,((x)=>x.kdist),false);
}
function* newqad(){
  var q,_i,cmdr,e,w;
  // Set up a new state of quadrant, for when we enter or re-enter it.
  game.justin=true;
  game.base=null;
  game.iplnet=null;
  game.plnet=null;
  {const $v=false;game.neutz=$v;game.inorbit=$v;game.landed=$v;}
  {const $v=false;game.ientesc=$v;game.iseenit=$v;game.isviolreported=$v;}
  game.tholian=null;
  // Create a blank quadrant
  game.quad=fill2d(QUADSIZE,((i,j)=>"."));
  if($t(game.iscate)){
    // Attempt to escape Super-commander, so tbeam back!
    game.iscate=false;
    game.ientesc=true;
  }
  q=$g($g(game.state.galaxy,game.quadrant.i),game.quadrant.j);
  // cope with supernova
  if($t(q.supernova)){
    $g($g(game.state.chart,game.quadrant.i),game.quadrant.j).supernova=true;
    return;
  }
  game.klhere=q.klingons;
  game.irhere=q.romulans;
  // Position Starship
  $s($g(game.quad,game.sector.i),game.sector.j,game.ship);
  game.enemies=[];
  if($t(q.klingons)){
    // Position ordinary Klingons
    for(_i of $range(game.klhere)){
      newkling();
    }
    // If we need a commander, promote a Klingon
    for(cmdr of $iter(game.state.kcmdr)){
      if($eq(cmdr,game.quadrant)){
        if(((game.klhere>0) && $t(game.enemies))){
          e=$g(game.enemies,(game.klhere-1));
          $s($g(game.quad,e.location.i),e.location.j,"C");
          e.type="C";
          e.power=$add(rnd.real(950,1350),$mul(50,game.skill));
        }
        break;
      }
    }
    // If we need a super-commander, promote a Klingon
    if(((game.state.nscrem>0) && $eq(game.quadrant,game.state.kscmdr))){
      e=$g(game.enemies,0);
      $s($g(game.quad,e.location.i),e.location.j,"S");
      e.type="S";
      e.power=$add(rnd.real(1175,1575),$mul(125,game.skill));
      game.iscate=(game.remkl()>1);
    }
  }
  // Put in Romulans if needed
  for(_i of $range(q.romulans)){
    new Enemy("R",dropin(),$add(rnd.real(400,850),$mul(50,game.skill)));
  }
  // If quadrant needs a starbase, put it in
  if($t(q.starbase)){
    game.base=dropin("B");
  }
  // If quadrant needs a planet, put it in
  if($t(q.planet)){
    game.iplnet=q.planet;
    if(!$t(q.planet.inhabited)){
      game.plnet=dropin("P");
    }else{
      game.plnet=dropin("@");
    }
  }
  // Check for condition
  newcnd();
  // Check for RNZ
  if(((game.irhere>0) && (game.klhere==0))){
    game.neutz=true;
    if(!damaged(DRADIO)){
      (yield* skip(1));
      (yield* prout("LT. Uhura- \"Captain, an urgent message."));
      (yield* prout("  I'll put it on audio.\"  CLICK"));
      (yield* skip(1));
      (yield* prout("INTRUDER! YOU HAVE VIOLATED THE ROMULAN NEUTRAL ZONE."));
      (yield* prout("LEAVE AT ONCE, OR YOU WILL BE DESTROYED!"));
    }
  }
  // Put in THING if needed
  if($eq(thing.location,game.quadrant)){
    new Enemy("?",dropin(),$add(rnd.real(6000,6500),$mul(250,game.skill)));
    if(!damaged(DSRSENS)){
      (yield* skip(1));
      (yield* prout("Mr. Spock- \"Captain, this is most unusual."));
      (yield* prout("    Please examine your short-range scan.\""));
    }
  }
  // Decide if quadrant needs a Tholian; lighten up if skill is low
  if((game.options&OPTION_THOLIAN)){
    if((((game.skill<SKILL_GOOD) && rnd.withprob(0.02)) || ($eq(game.skill,SKILL_GOOD) && rnd.withprob(0.05)) || ((game.skill>SKILL_GOOD) && rnd.withprob(0.08)))){
      w=new Coord();
      for(;;){
        w.i=$mul(rnd.withprob(0.5),(QUADSIZE-1));
        w.j=$mul(rnd.withprob(0.5),(QUADSIZE-1));
        if(($g($g(game.quad,w.i),w.j)===".")){
          break;
        }
      }
      game.tholian=new Enemy("T",w,$add(rnd.integer(100,500),$mul(25,game.skill)));
      // Reserve unoccupied corners
      if(($g($g(game.quad,0),0)===".")){
        $s($g(game.quad,0),0,"X");
      }
      if(($g($g(game.quad,0),(QUADSIZE-1))===".")){
        $s($g(game.quad,0),(QUADSIZE-1),"X");
      }
      if(($g($g(game.quad,(QUADSIZE-1)),0)===".")){
        $s($g(game.quad,(QUADSIZE-1)),0,"X");
      }
      if(($g($g(game.quad,(QUADSIZE-1)),(QUADSIZE-1))===".")){
        $s($g(game.quad,(QUADSIZE-1)),(QUADSIZE-1),"X");
      }
    }
  }
  sortenemies();
  // And finally the stars
  for(_i of $range(q.stars)){
    dropin("*");
  }
  // Put in a few black holes
  for(_i of $range(1,(3+1))){
    if(rnd.withprob(0.5)){
      dropin(" ");
    }
  }
  // Take out X's in corners if Tholian present
  if($t(game.tholian)){
    if(($g($g(game.quad,0),0)==="X")){
      $s($g(game.quad,0),0,".");
    }
    if(($g($g(game.quad,0),(QUADSIZE-1))==="X")){
      $s($g(game.quad,0),(QUADSIZE-1),".");
    }
    if(($g($g(game.quad,(QUADSIZE-1)),0)==="X")){
      $s($g(game.quad,(QUADSIZE-1)),0,".");
    }
    if(($g($g(game.quad,(QUADSIZE-1)),(QUADSIZE-1))==="X")){
      $s($g(game.quad,(QUADSIZE-1)),(QUADSIZE-1),".");
    }
  }
  // This should guarantee that replay games don't lose info about the chart
  if((game.options&OPTION_AUTOSCAN)){
    (yield* lrscan(true));
  }
}
function* setpassword(){
  // Set the self-destruct password.
  if((game.options&OPTION_AUTOPASS)){
    game.passwd="";
    game.passwd=$add(game.passwd,$chr(($ord("a")+rnd.integer(26))));
    game.passwd=$add(game.passwd,$chr(($ord("a")+rnd.integer(26))));
    game.passwd=$add(game.passwd,$chr(($ord("a")+rnd.integer(26))));
  }else{
    for(;;){
      scanner.chew();
      proutn("Please type in a secret password- ");
      (yield* scanner.nexttok());
      game.passwd=scanner.token;
      // game.passwd = getpass.getpass("Please type in a secret password- ")
      if((game.passwd!=null)){
        break;
      }
    }
  }
}
// Code from sst.c begins here
commands=[["SRSCAN",OPTION_TTY],["STATUS",OPTION_TTY],["REQUEST",OPTION_TTY],["LRSCAN",OPTION_TTY],["PHASERS",0],["TORPEDO",0],["PHOTONS",0],["MOVE",0],["SHIELDS",0],["DOCK",0],["DAMAGES",0],["CHART",0],["IMPULSE",0],["REST",0],["WARP",0],["SENSORS",OPTION_PLANETS],["ORBIT",OPTION_PLANETS],["TRANSPORT",OPTION_PLANETS],["MINE",OPTION_PLANETS],["CRYSTALS",OPTION_PLANETS],["SHUTTLE",OPTION_PLANETS],["PLANETS",OPTION_PLANETS],["REPORT",0],["COMPUTER",0],["COMMANDS",0],["EMEXIT",0],["PROBE",OPTION_PROBE],["SAVE",0],["FREEZE",0],["OPTIONS",0],["ABANDON",0],["DESTRUCT",0],["DEATHRAY",0],["CAPTURE",OPTION_CAPTURE],["CLOAK",OPTION_CLOAK],["DEBUG",0],["MAYDAY",0],["SOS",0],["CALL",0],["QUIT",0],["HELP",0],["SCORE",0],["CURSES",0],["AM",0],["",0]]; // Synonym for SAVE // No abbreviations accepted after this point // Synonym for MAYDAY // Synonym for MAYDAY // Hidden
function* listCommands(){
  var emitted,key,opt;
  // Generate a list of legal commands.
  // Coverage-disabled because testing for this is fragile
  // in the presence of changes in the command set.
  (yield* prout("LEGAL COMMANDS ARE:"));
  emitted=0;
  for([key,opt] of $iter(commands)){
    if((key==="AM")){
      continue;
    }
    if((!$t(opt) || (opt&game.options))){
      proutn($fmt("%-12s ",key));
      emitted=(emitted+1);
      if(($mod(emitted,5)==4)){
        (yield* skip(1));
      }
    }
  }
  (yield* skip(1));
}
// This used to continue: "You need to find SST.DOC and put
// it in the current directory."
function* makemoves(){
  var hitme,abandon_passed,cmd,opt;
  // Command-interpretation loop.
  function* checkviol(){
    if(($t(game.irhere) && (game.state.date>=ALGERON) && !$t(game.isviolreported) && $t(game.iscloaked))){
      (yield* prout("The Romulan ship discovers you are breaking the Treaty of Algeron!"));
      game.ncviol=(game.ncviol+1);
      game.isviolreported=true;
    }
  }
  for(;;){
    // command loop
    for(;;){
      // get a command
      hitme=false;
      {const $v=false;game.optime=$v;game.justin=$v;}
      scanner.chew();
      clrscr();
      proutn("COMMAND> ");
      if(((yield* scanner.nexttok())==="IHEOL")){
        continue;
      }else if((scanner.token==="")){
        continue;
      }
      game.ididit=false;
      clrscr();
      clrscr();
      abandon_passed=false;
      cmd=""; // Force cmd to persist after loop
      opt=0; // Force opt to persist after loop
      for([cmd,opt] of $iter(commands)){
        // commands after ABANDON cannot be abbreviated
        if((cmd==="ABANDON")){
          abandon_passed=true;
        }
        if(((cmd==="REQUEST") && ($len(scanner.token)<3))){
          continue;
        }
        // R and RE belong to REST; REQUEST needs REQ.
        if(($eq(cmd,scanner.token.toUpperCase()) || (!$t(abandon_passed) && $startswith(cmd,scanner.token.toUpperCase())))){
          break;
        }
      }
      if((cmd==="")){
        (yield* listCommands());
        continue;
      }else if(($t(opt) && !(opt&game.options))){
        (yield* huh());
      }else{
        break;
      }
    }
    if((cmd==="SRSCAN")){
      (yield* srscan());
    }else if((cmd==="STATUS")){
      // status
      (yield* status());
    }else if((cmd==="REQUEST")){
      // status request
      (yield* request());
    }else if((cmd==="LRSCAN")){
      // long range scan
      (yield* lrscan(false));
    }else if((cmd==="PHASERS")){
      // phasers
      (yield* phasers());
      if($t(game.ididit)){
        (yield* checkviol());
        hitme=true;
      }
    }else if($in(cmd,["TORPEDO","PHOTONS"])){
      // photon torpedos
      (yield* torps());
      if($t(game.ididit)){
        (yield* checkviol());
        hitme=true;
      }
    }else if($in(cmd,["MOVE","AM"])){
      // move under warp
      if((cmd==="AM")){
        scanner.push("AUTO");
      }
      (yield* warp(null,false));
    }else if((cmd==="SHIELDS")){
      // shields
      (yield* doshield(false));
      if($t(game.ididit)){
        hitme=true;
        game.shldchg=false;
      }
    }else if((cmd==="DOCK")){
      // dock at starbase
      (yield* dock(true));
      if($t(game.ididit)){
        (yield* attack(false));
      }
    }else if((cmd==="DAMAGES")){
      // damage reports
      (yield* damagereport());
    }else if((cmd==="CHART")){
      // chart
      (yield* makechart());
    }else if((cmd==="IMPULSE")){
      // impulse
      (yield* impulse());
    }else if((cmd==="REST")){
      // rest
      (yield* wait());
      if($t(game.ididit)){
        hitme=true;
      }
    }else if((cmd==="WARP")){
      // warp
      (yield* setwarp());
    }else if((cmd==="SENSORS")){
      // sensors
      (yield* sensor());
    }else if((cmd==="ORBIT")){
      // orbit
      (yield* orbit());
      if($t(game.ididit)){
        hitme=true;
      }
    }else if((cmd==="TRANSPORT")){
      // transport "beam"
      (yield* beam());
    }else if((cmd==="MINE")){
      // mine
      (yield* mine());
      if($t(game.ididit)){
        hitme=true;
      }
    }else if((cmd==="CRYSTALS")){
      // crystals
      (yield* usecrystals());
      if($t(game.ididit)){
        hitme=true;
      }
    }else if((cmd==="SHUTTLE")){
      // shuttle
      (yield* shuttle());
      if($t(game.ididit)){
        hitme=true;
      }
    }else if((cmd==="PLANETS")){
      // Planet list
      (yield* survey());
    }else if((cmd==="REPORT")){
      // Game Report
      (yield* report());
    }else if((cmd==="COMPUTER")){
      // use COMPUTER!
      (yield* eta());
    }else if((cmd==="COMMANDS")){
      (yield* listCommands());
    }else if((cmd==="EMEXIT")){
      // Emergency exit
      clrscr(); // Hide screen
      (yield* freeze(true)); // forced save
      throw new SystemExit(1);
    // And quick exit
    }else if((cmd==="PROBE")){
      (yield* probe()); // Launch probe
      if($t(game.ididit)){
        hitme=true;
      }
    }else if((cmd==="ABANDON")){
      // Abandon Ship
      (yield* abandon());
    }else if((cmd==="DESTRUCT")){
      // Self Destruct
      (yield* selfdestruct());
    }else if((cmd==="SAVE")){
      // Save Game
      (yield* freeze(false));
      clrscr();
      if((game.skill>SKILL_GOOD)){
        (yield* prout("WARNING--Saved games produce no plaques!"));
      }
    }else if((cmd==="DEATHRAY")){
      // Try a desparation measure
      (yield* deathray());
      if($t(game.ididit)){
        hitme=true;
      }
    }else if((cmd==="CAPTURE")){
      (yield* capture());
    }else if((cmd==="CLOAK")){
      (yield* cloak());
    }else if((cmd==="DEBUGCMD")){
      // What do we want for debug???
      (yield* debugme());
    }else if((cmd==="MAYDAY")){
      // Call for help
      (yield* mayday());
      if($t(game.ididit)){
        hitme=true;
      }
    }else if((cmd==="QUIT")){
      game.alldone=true; // quit the game
    }else if((cmd==="HELP")){
      (yield* helpme()); // get help
    }else if((cmd==="SCORE")){
      (yield* score()); // see current score
    }else if((cmd==="CURSES")){
      game.options=(game.options|(OPTION_CURSES|OPTION_COLOR));
      game.options=(game.options&(~OPTION_TTY));
    }else if((cmd==="OPTIONS")){
      (yield* goptions());
    }
    for(;;){
      if($t(game.alldone)){
        break;
      }
      // Game has ended
      if((game.optime!=0)){
        (yield* events());
        if($t(game.alldone)){
          break;
        }
      }
      // Events did us in
      if($t($g($g(game.state.galaxy,game.quadrant.i),game.quadrant.j).supernova)){
        (yield* atover(false));
        continue;
      }
      if(($t(hitme) && !$t(game.justin))){
        (yield* attack(true));
        if($t(game.alldone)){
          break;
        }
        if($t($g($g(game.state.galaxy,game.quadrant.i),game.quadrant.j).supernova)){
          (yield* atover(false));
          hitme=true;
          continue;
        }
      }
      break;
    }
    if($t(game.alldone)){
      break;
    }
  }
  if($t(game.idebug)){
    (yield* prout("=== Ending"));
  }
}
function cramen(ch){
  var s;
  // Emit the name of an enemy or feature.
  if((ch==="R")){
    s="Romulan";
  }else if((ch==="K")){
    s="Klingon";
  }else if((ch==="C")){
    s="Commander";
  }else if((ch==="S")){
    s="Super-commander";
  }else if((ch==="*")){
    s="Star";
  }else if((ch==="P")){
    s="Planet";
  }else if((ch==="B")){
    s="Starbase";
  }else if((ch===" ")){
    s="Black hole";
  }else if((ch==="T")){
    s="Tholian";
  }else if((ch==="#")){
    s="Tholian web";
  }else if((ch==="?")){
    s="Stranger";
  }else if((ch==="@")){
    s="Inhabited World";
  }else{
    s="Unknown??";
  }
  return s;
}
function crmena(loud,enemy,loctype,w){
  var buf;
  // Emit the name of an enemy and his location.
  buf="";
  if($t(loud)){
    buf=$add(buf,"***");
  }
  buf=$add(buf,$add(cramen(enemy)," at "));
  if((loctype==="quadrant")){
    buf=$add(buf,"Quadrant ");
  }else if((loctype==="sector")){
    buf=$add(buf,"Sector ");
  }
  return $add(buf,$repr(w));
}
function crmshp(){
  // Emit our ship name.
  return $get(new Map([["E","Enterprise"],["F","Faerie Queene"]]),game.ship,"Ship???");
}
function* stars(){
  // Emit a line of stars
  prouts("******************************************************");
  (yield* skip(1));
}
function expran(avrage){
  return $mul((-avrage),$log((1e-07+rnd.real())));
}
function randplace(size){
  var w;
  // Choose a random location.
  w=new Coord();
  w.i=rnd.integer(size);
  w.j=rnd.integer(size);
  return w;
}
class sstscanner{
  constructor(){
    this.type=null;
    this.token=null;
    this.real=0;
    this.inqueue=[];
  }
  *nexttok(){
    var sline;
    // Get a token from the user
    this.real=0;
    this.token="";
    // Fill the token queue if nothing here
    while(!$t(this.inqueue)){
      sline=(yield* cgetline());
      clrscr();
      clrscr();
      if((sline==="")){
        return null;
      }
      if(!$t(sline)){
        continue;
      }else{
        this.inqueue=$add($split($lstrip(sline)),["\n"]);
      }
    }
    // From here on in it's all looking at the queue
    this.token=$pop(this.inqueue,0);
    if((this.token==="\n")){
      this.type="IHEOL";
      return "IHEOL";
    }
    try{
      this.real=$float(this.token);
      if($t(Number.isFinite(this.real))){
        this.type="IHREAL";
        return "IHREAL";
      }
    }catch($e){
      if($e instanceof ValueError){
      }else{
        throw $e;
      }
    }
    // Treat nonnumeric and nonfinite tokens as alpha.
    this.token=this.token.toLowerCase();
    this.type="IHALPHA";
    this.real=null;
    return "IHALPHA";
  }
  append(tok){
    this.inqueue.push(tok);
  }
  push(tok){
    this.inqueue.splice(0,0,tok);
  }
  waiting(){
    return this.inqueue;
  }
  chew(){
    // Demand input for next scan
    this.inqueue=[];
    {const $v=null;this.real=$v;this.token=$v;}
  }
  sees(s){
    // compares s to item and returns true if it matches to the length of s
    return $startswith(s,this.token);
  }
  int(){
    // Round token value to nearest integer
    return $int($round(this.real));
  }
  *getcoord(){
    var s;
    s=new Coord();
    (yield* this.nexttok());
    if((game.options&OPTION_ALPHAMERIC)){
      try{
        if(((this.type==="IHALPHA") && $in($g(this.token,0),"abcdefghij") && $in($g(this.token,1),"0123456789"))){
          s.i=($ord($g(this.token,0))-$ord("a"));
          s.j=($int($slice(this.token,1))-1);
          return s;
        }
      }catch($e){
        if($e instanceof TypeError || $e instanceof IndexError || $e instanceof ValueError){
          (yield* huh());
          return null;
        }else{
          throw $e;
        }
      }
    }
    if((this.type!=="IHREAL")){
      (yield* huh());
      return null;
    }
    s.i=(this.int()-1);
    (yield* this.nexttok());
    if((this.type!=="IHREAL")){
      (yield* huh());
      return null;
    }
    s.j=(this.int()-1);
    return s;
  }
  __repr__(){
    return $fmt("<sstcanner: token=%s, type=%s, queue=%s>",[this.token,this.type,this.inqueue]);
  }
}
function* ja(){
  // Yes-or-no confirmation.
  scanner.chew();
  for(;;){
    (yield* scanner.nexttok());
    if((scanner.token==="y")){
      return true;
    }
    if((scanner.token==="n")){
      return false;
    }
    scanner.chew();
    proutn("Please answer with \"y\" or \"n\": ");
  }
}
function* huh(){
  // Complain about unparseable input.
  scanner.chew();
  (yield* skip(1));
  (yield* prout("Beg your pardon, Captain?"));
}
function* debugme(){
  var i,ev,w,legends,key;
  // Access to the internals for debugging.
  proutn("Reset levels? ");
  if((yield* ja())){
    game.energy=$max(game.energy,game.inenrg);
    game.shield=game.inshld;
    game.torps=game.intorps;
    game.lsupres=game.inlsr;
  }
  proutn("Reset damage? ");
  if((yield* ja())){
    for(i of $range(NDEVICES)){
      if(($g(game.damage,i)>0)){
        $s(game.damage,i,0);
      }
    }
  }
  proutn("Toggle debug flag? ");
  if((yield* ja())){
    game.idebug=!$t(game.idebug);
    if($t(game.idebug)){
      (yield* prout("Debug output ON"));
    }else{
      (yield* prout("Debug output OFF"));
    }
  }
  proutn("Cause selective damage? ");
  if((yield* ja())){
    for(i of $range(NDEVICES)){
      proutn($fmt("Kill %s?",$g(device,i)));
      scanner.chew();
      key=(yield* scanner.nexttok());
      if(((key==="IHALPHA") && scanner.sees("y"))){
        $s(game.damage,i,10);
      }
    }
  }
  proutn("Examine/change events? ");
  if((yield* ja())){
    ev=new Event();
    w=new Coord();
    legends=new Map([[FSNOVA,"Supernova       "],[FTBEAM,"T Beam          "],[FSNAP,"Snapshot        "],[FBATTAK,"Base Attack     "],[FCDBAS,"Base Destroy    "],[FSCMOVE,"SC Move         "],[FSCDBAS,"SC Base Destroy "],[FDSPROB,"Probe Move      "],[FDISTR,"Distress Call   "],[FENSLV,"Enslavement     "],[FREPRO,"Klingon Build   "]]);
    for(i of $range(1,NEVENTS)){
      proutn($g(legends,i));
      if($t(is_scheduled(i))){
        proutn($fmt("%.2f",$sub(scheduled(i),game.state.date)));
        if($in(i,[FENSLV,FREPRO])){
          ev=findevent(i);
          proutn($fmt(" in %s",ev.quadrant));
        }
      }else{
        proutn("never");
      }
      proutn("? ");
      scanner.chew();
      key=(yield* scanner.nexttok());
      if((key==="n")){
        unschedule(i);
        scanner.chew();
      }else if((key==="IHREAL")){
        ev=schedule(i,scanner.real);
        if($in(i,[FENSLV,FREPRO])){
          scanner.chew();
          proutn("In quadrant- ");
          key=(yield* scanner.nexttok());
          // "IHEOL" says to leave coordinates as they are
          if((key!=="IHEOL")){
            if((key!=="IHREAL")){
              (yield* prout($fmt("Event %d canceled, no x coordinate.",i)));
              unschedule(i);
              continue;
            }
            w.i=$int($round(scanner.real));
            key=(yield* scanner.nexttok());
            if((key!=="IHREAL")){
              (yield* prout($fmt("Event %d canceled, no y coordinate.",i)));
              unschedule(i);
              continue;
            }
            w.j=$int($round(scanner.real));
            ev.quadrant=w;
          }
        }
      }
    }
    scanner.chew();
  }
  proutn("Induce supernova here? ");
  if((yield* ja())){
    $g($g(game.state.galaxy,game.quadrant.i),game.quadrant.j).supernova=true;
    (yield* atover(true));
  }
}
/* ---------- The main program, without replay, logging and option parsing ---------- */
var game,thing,scanner;
function* sstmain(args){
  game=null;
  thing=new Thingy();
  game=new Gamestate();
  game.options=OPTION_ALL&~OPTION_IOMODES;
  game.options|=OPTION_TTY;
  rnd.seed($int(Date.now()/1000));
  scanner=new sstscanner();
  args.forEach(function(a){scanner.append(a)});
  iostart();
  linecount=0;
  for(;;){ // Play a game
    clrscr();
    yield* prelim();
    yield* setup();
    if(game.alldone){
      yield* score();
      game.alldone=false;
    }else{
      yield* makemoves();
    }
    yield* skip(1);
    if(game.options&OPTION_TTY)yield* stars();
    yield* skip(1);
    if(game.tourn&&game.alldone){
      proutn("Do you want your score recorded?");
      if(yield* ja()){
        scanner.chew();
        scanner.push("\n");
        yield* freeze(false);
      }
    }
    scanner.chew();
    // This isn't just noise. It keeps the
    // curses interface from popping like a soap
    // buble on a win-lose condition.
    proutn("Do you want to play again? ");
    if(!(yield* ja()))break;
  }
  yield* skip(1);
  yield* prout("May the Great Bird of the Galaxy roost upon your home planet.");
}
P.command({names:['startrek'],noHelpFlag:true,run:function(a,raw,words){
  var G=sstmain((words||[]).slice(1)),pipe=P.stdin(),at=0;
  $o='';
  function end(e){
    if($o){P.say([$o]);$o=''}
    if(e)P.typeLine('%SYSTEM-F-ACCVIO, access violation','err');
  }
  function step(v){
    var r;
    $line=v;
    for(;;){
      try{r=G.next()}
      catch(e){
        if(e instanceof SystemExit){end();return}
        if(e instanceof KeyboardInterrupt){end();P.say(['']);return}
        console.error(e);
        end(e);
        return;
      }
      if(r.done){end();return}
      if(pipe&&at<pipe.length){$line=pipe[at++];continue}
      if(pipe){$line=null;continue}
      var p=$o;$o='';
      P.ask(p,step,true);
      return;
    }
  }
  step(null);
}});
})(window.Phosphor);
