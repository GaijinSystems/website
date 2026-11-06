/* PHOSPHOR-9 terminal: machine "apple2-1984", an Applesoft-compatible BASIC: a new interpreter, written for
   this terminal to behave as Applesoft II does (its tokens, its LIST, its numbers and its messages), checked
   against an Apple IIe running DOS 3.3 in an emulator. No Microsoft or Apple code is in it.
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE.

   Numbers are kept as JavaScript numbers rounded to Applesoft's 32-bit mantissa after every operation,
   so that sums like .1 added ten times come out as they did. RND(-n) gives the real machine's first
   number for a seed; the sequence after it is this interpreter's own, from the same multiply and add. */
(function(P){
'use strict';
var KW=['END','FOR','NEXT','DATA','INPUT','DEL','DIM','READ','GR','TEXT','PR#','IN#','CALL','PLOT','HLIN','VLIN',
'HGR2','HGR','HCOLOR=','HPLOT','DRAW','XDRAW','HTAB','HOME','ROT=','SCALE=','SHLOAD','TRACE','NOTRACE','NORMAL',
'INVERSE','FLASH','COLOR=','POP','VTAB','HIMEM:','LOMEM:','ONERR','RESUME','RECALL','STORE','SPEED=','LET','GOTO',
'RUN','IF','RESTORE','&','GOSUB','RETURN','REM','STOP','ON','WAIT','LOAD','SAVE','DEF','POKE','PRINT','CONT','LIST',
'CLEAR','GET','NEW','TAB(','TO','FN','SPC(','THEN','AT','NOT','STEP','+','-','*','/','^','AND','OR','>','=','<',
'SGN','INT','ABS','USR','FRE','SCRN(','PDL','POS','SQR','RND','LOG','EXP','COS','SIN','TAN','ATN','PEEK','LEN',
'STR$','VAL','ASC','CHR$','LEFT$','RIGHT$','MID$'];
var T={};KW.forEach(function(k,i){T[k]=0x80+i});
var ERR={NF:[0,'NEXT WITHOUT FOR'],SN:[16,'SYNTAX'],RG:[22,'RETURN WITHOUT GOSUB'],OD:[42,'OUT OF DATA'],
  FC:[53,'ILLEGAL QUANTITY'],OV:[69,'OVERFLOW'],OM:[77,'OUT OF MEMORY'],US:[90,"UNDEF'D STATEMENT"],BS:[107,'BAD SUBSCRIPT'],
  DD:[120,"REDIM'D ARRAY"],DZ:[133,'DIVISION BY ZERO'],ID:[149,'ILLEGAL DIRECT'],TM:[163,'TYPE MISMATCH'],
  LS:[176,'STRING TOO LONG'],ST:[191,'FORMULA TOO COMPLEX'],CN:[214,"CAN'T CONTINUE"],UF:[224,"UNDEF'D FUNCTION"]};
function E(k){throw {basic:k}}
var MAXF=1.7014118346046923e38;

/* ---------- numbers ---------- */
function fr(x){ /* round to a 32-bit mantissa, as a stored Applesoft number is */
  if(x===0||x!==x)return 0;
  var a=Math.abs(x);
  if(a>=MAXF)E('OV');
  var e=Math.floor(Math.log2(a)),s=Math.pow(2,e-31),m=a/s;
  while(m>=4294967296){e++;s*=2;m=a/s}
  while(m<2147483648){e--;s/=2;m=a/s}
  if(e<-129)return 0;
  m=Math.floor(m+.5);
  var r=m*s;
  if(r>=MAXF)E('OV');
  return x<0?-r:r;
}
function fout(x){ /* Applesoft's way of printing a number: nine digits, no padding */
  if(x===0)return '0';
  var sg=x<0?'-':'';x=Math.abs(x);
  var t=x.toExponential(8).split('e'),d=t[0].replace('.',''),e=+t[1];
  d=d.replace(/0+$/,'');
  if(e>=9||e<-2){
    var ex=Math.abs(e);
    return sg+d.charAt(0)+(d.length>1?'.'+d.slice(1):'')+'E'+(e<0?'-':'+')+(ex<10?'0':'')+ex;
  }
  if(e<0)return sg+'.'+'0'.repeat(-e-1)+d;
  var ip=d.slice(0,e+1),fp=d.slice(e+1);
  while(ip.length<e+1)ip+='0';
  return sg+ip+(fp?'.'+fp:'');
}
/* RND: the 6502 BASIC's own steps on a five-byte float, kept as [exponent, 32-bit mantissa, extension] */
function mbf(x){
  if(x===0)return [0,0,0];
  var a=Math.abs(x),e=Math.floor(Math.log2(a))+1,m=a/Math.pow(2,e);
  while(m>=1){m/=2;e++}
  while(m<.5){m*=2;e--}
  return [e+128,Math.floor(m*4294967296+.5)>>>0,0];
}
function mval(f){return f[0]?(f[1]+f[2]/256)/4294967296*Math.pow(2,f[0]-128):0}
function norm(f){ /* shift the 40-bit mantissa left until its top bit is set */
  var v=f[1]*256+f[2],e=f[0];
  if(!v)return [0,0,0];
  while(v<549755813888){v*=2;e--}
  while(v>=1099511627776){v=Math.floor(v/2);e++}
  return [e,Math.floor(v/256),v%256];
}
function round4(f){ /* stored: rounded on the extension */
  if(!f[0])return [0,0,0];
  var m=f[1],e=f[0];
  if(f[2]>=128){m++;if(m>=4294967296){m=2147483648;e++}}
  return [e,m,0];
}
var C1=[0x98,0xB5447A00,0],C2=[0x68,0xA8B14600,0];
function fmul(a,b){ /* shift and add, the extension byte first, as the ROM does; bits past the extension are lost */
  if(!a[0]||!b[0])return [0,0,0];
  var acc=0,bytes=[a[2],a[1]&255,a[1]>>>8&255,a[1]>>>16&255,a[1]>>>24];
  for(var i=0;i<5;i++)for(var j=0;j<8;j++){
    if(bytes[i]>>j&1)acc+=b[1]*256;
    acc=Math.floor(acc/2);
  }
  return norm([a[0]+b[0]-128,Math.floor(acc/256),acc%256]);
}
function fadd(a,b){ /* both positive here: line them up, shifting the smaller one right through the extension */
  if(!a[0])return b;if(!b[0])return a;
  if(a[0]<b[0]){var t=a;a=b;b=t}
  var d=a[0]-b[0],bv=b[1]*256+b[2],av=a[1]*256+a[2];
  bv=d>=40?0:Math.floor(bv/Math.pow(2,d));
  return norm([a[0],Math.floor((av+bv)/256),(av+bv)%256]);
}
var seed=[0x80,0xCFC75258,0]; /* power-on seed; checked against the first RND(1) after a boot */
var lastR=null;
function rnd(x){
  var f;
  if(x===0&&lastR!==null)return lastR;
  if(x===0)f=seed;
  else if(x<0){f=mbf(x);f[2]=0}
  else f=fadd(fmul(seed,C1),C2);
  var m=f[1],b1=m>>>24,b2=m>>>16&255,b3=m>>>8&255,b4=m&255;
  var r=norm([0x80,(b4*16777216+b3*65536+b2*256+b1)>>>0,f[0]]);
  seed=round4(r);
  return lastR=fr(mval(seed));
}

/* ---------- the tokenizer, as Applesoft's line parser does it ---------- */
function parse(s){ /* s: the typed text after any line number; returns an array of bytes */
  var o=[],i=0,data=false,n=s.length;
  while(i<n){
    var c=s.charAt(i),cc=s.charCodeAt(i);
    if(c==='"'){o.push(34);i++;while(i<n&&s.charAt(i)!=='"'){o.push(s.charCodeAt(i)&255);i++}if(i<n){o.push(34);i++}continue}
    if(data){o.push(cc&255);if(c===':')data=false;i++;continue}
    if(c===' '){i++;continue}
    if(c==='?'){o.push(T.PRINT);i++;continue}
    if(c>='0'&&c<=';'){o.push(cc);i++;continue}
    var hit=-1,end=i;
    for(var k=0;k<KW.length&&hit<0;k++){
      var w=KW[k],j=i,m=0;
      while(m<w.length){
        while(j<n&&s.charAt(j)===' ')j++;
        if(j>=n||s.charAt(j)!==w.charAt(m))break;
        j++;m++;
      }
      if(m<w.length)continue;
      if(k+0x80===T.AT&&(s.charAt(j)==='N'||s.charAt(j)==='O'))continue; /* ATN, and A TO */
      hit=k+0x80;end=j;
    }
    if(hit<0){o.push(cc&255);i++;continue}
    o.push(hit);i=end;
    if(hit===T.DATA)data=true;
    if(hit===T.REM){for(;i<n;i++)o.push(s.charCodeAt(i)&255);}
  }
  return o;
}
function lineBytes(L){return 5+L.t.length}

P.applesoft=function(M){ /* M: the machine around it (screen, keyboard, memory, DOS) */
var prog=[],byNum={},vars={},arrays={},fns={},stack=[],data=null,dataLine=0,dataPos=0;
var cur=null,line=-1,pos=0,running=false,cont=null,trace=false,onerr=null,errLine=0,errCode=0,errAt=null;
var direct=null,want=null,listing=null,speed=255,spent=0;
function reindex(){byNum={};prog.forEach(function(L,i){byNum[L.n]=i})}
function find(n){if(byNum[n]===undefined)E('US');return byNum[n]}
function progSize(){return prog.reduce(function(a,L){return a+lineBytes(L)},2)}
function varSize(){
  var n=Object.keys(vars).length*7,s=0;
  Object.keys(arrays).forEach(function(k){var A=arrays[k];n+=5+2*A.dims.length+A.v.length*(/\$$/.test(k)?3:/%$/.test(k)?2:5)});
  Object.keys(vars).forEach(function(k){if(/\$$/.test(k))s+=vars[k].length});
  return n+s;
}

/* ---------- reading the line ---------- */
function at(){while(cur&&pos<cur.length&&cur[pos]===32)pos++;return cur&&pos<cur.length?cur[pos]:0}
function next(){pos++;return at()}
function eat(t){if(at()!==t)E('SN');next()}
function endStmt(){var c=at();return c===0||c===58}
function isDigit(c){return c>=48&&c<=57}
function isAlpha(c){return c>=65&&c<=90}
function number(){ /* FIN: digits, a point, an exponent; blanks were taken out */
  var s='',c=at();
  while(isDigit(c)||c===46){s+=String.fromCharCode(c);c=next()}
  if(c===69){
    var e='E';c=next();
    if(c===T['-']||c===45){e+='-';c=next()}else if(c===T['+']||c===43)c=next();
    var dg='';while(isDigit(c)){dg+=String.fromCharCode(c);c=next()}
    if(dg)s+=e+dg;
  }
  if(s==='.')return 0;
  return fr(parseFloat(s.charAt(0)==='.'?'0'+s:s));
}
function lineNum(){ /* LINGET: digits only, up to 63999 */
  var c=at(),v=0,any=false;
  while(isDigit(c)){v=v*10+c-48;any=true;if(v>63999)E('SN');c=next()}
  return any?v:0;
}
function name(){ /* PTRGET: two letters count, the rest are skipped; $ or %; ( makes it an array */
  var c=at();
  if(!isAlpha(c))E('SN');
  var n=String.fromCharCode(c);c=next();
  if(isAlpha(c)||isDigit(c)){n+=String.fromCharCode(c);c=next()}
  while(isAlpha(c)||isDigit(c))c=next();
  if(c===36||c===37){n+=String.fromCharCode(c);c=next()}
  return n;
}
function isStr(n){return n.charAt(n.length-1)==='$'}
function isInt(n){return n.charAt(n.length-1)==='%'}
function toInt(v){v=Math.floor(v);if(v<-32767||v>32767)E('FC');return v}
function ref(forDim){ /* a variable or an array element: {get,set,name} */
  var n=name();
  if(at()===40){
    next();
    var ix=[];
    do{ix.push(toInt(num()))}while(at()===44&&next()!==null);
    eat(41);
    var A=arrays[n];
    if(!A){
      var d=ix.map(function(){return 10});
      A=arrays[n]=mkArray(n,d);
    }
    if(A.dims.length!==ix.length)E('BS');
    var off=0;
    for(var i=0;i<ix.length;i++){if(ix[i]<0||ix[i]>A.dims[i])E('BS');off=off*(A.dims[i]+1)+ix[i]}
    return {name:n,get:function(){return A.v[off]},set:function(v){A.v[off]=v}};
  }
  return {name:n,get:function(){return has(vars,n)?vars[n]:isStr(n)?'':0},set:function(v){vars[n]=v}};
}
function has(o,k){return Object.prototype.hasOwnProperty.call(o,k)}
function mkArray(n,d){
  var size=d.reduce(function(a,x){return a*(x+1)},1);
  if(size>20000)E('OM');
  var v=new Array(size).fill(isStr(n)?'':0);
  return {dims:d,v:v};
}
function assign(r,v){
  if(isStr(r.name)){if(typeof v!=='string')E('TM');r.set(v);return}
  if(typeof v==='string')E('TM');
  r.set(isInt(r.name)?toInt(v):v);
}

/* ---------- expressions ---------- */
function num(){var v=expr();if(typeof v==='string')E('TM');return v}
function str(){var v=expr();if(typeof v!=='string')E('TM');return v}
var depth=0;
function expr(){ /* OR, AND, NOT, relations, + -, * /, ^, then the signs and the values */
  if(++depth>36){depth=0;E('ST')}
  try{return orx()}finally{depth--}
}
function orx(){var a=andx();while(at()===T.OR){next();var b=andx();a=(truth(a)||truth(b))?1:0}return a}
function andx(){var a=rel();while(at()===T.AND){next();var b=rel();a=(truth(a)&&truth(b))?1:0}return a}
function truth(v){if(typeof v==='string')E('TM');return v!==0}
function rel(){
  var a=add();
  for(;;){
    var c=at(),op=0;
    while(c===T['>']||c===T['=']||c===T['<']){op|=c===T['>']?1:c===T['=']?2:4;c=next()}
    if(!op)return a;
    var b=add();
    if(typeof a!==typeof b)E('TM');
    var cmp=a<b?4:a>b?1:2;
    a=(op&cmp)?1:0;
  }
}
function add(){
  var a=mul();
  for(;;){
    var c=at();
    if(c===T['+']){next();var b=mul();if(typeof a!==typeof b)E('TM');a=typeof a==='string'?cat(a,b):fr(a+b)}
    else if(c===T['-']){next();var d=mul();if(typeof a==='string'||typeof d==='string')E('TM');a=fr(a-d)}
    else return a;
  }
}
function cat(a,b){if(a.length+b.length>255)E('LS');return a+b}
function mul(){
  var a=pow();
  for(;;){
    var c=at();
    if(c===T['*']){next();a=fr(n2(a)*n2(pow()))}
    else if(c===T['/']){next();var b=n2(pow());n2(a);if(b===0)E('DZ');a=fr(a/b)}
    else return a;
  }
}
function n2(v){if(typeof v==='string')E('TM');return v}
function pow(){
  var a=unary();
  while(at()===T['^']){next();a=power(n2(a),n2(unary()))}
  return a;
}
function power(a,b){
  if(b===0)return 1;
  if(a===0){if(b<0)E('DZ');return 0}
  if(a<0&&b!==Math.floor(b))E('FC');
  return fr(Math.pow(a,b));
}
function unary(){
  var c=at();
  if(c===T['-']){next();return fr(-n2(unary()))}
  if(c===T['+']){next();return unary()}
  if(c===T.NOT){next();return truth(unary())?0:1}
  return prim();
}
function arg1(){eat(40);var v=expr();eat(41);return v}
function prim(){
  var c=at();
  if(isDigit(c)||c===46)return number();
  if(c===34){ /* a string, to the closing quote or the end of the line */
    var s='';pos++;
    while(pos<cur.length&&cur[pos]!==34){s+=String.fromCharCode(cur[pos]);pos++}
    if(pos<cur.length)pos++;
    return s;
  }
  if(c===40){next();var v=expr();eat(41);return v}
  if(isAlpha(c))return ref().get();
  if(c===T.FN){
    next();var n=name();
    var f=fns[n];
    if(!f)E('UF');
    var x=num();
    if(at()!==41&&false)E('SN');
    return callFn(f,x);
  }
  if(c===T.SCRN){next();eat(40);num();eat(44);num();eat(41);return 0}
  if(c>=T.SGN&&c<=T['MID$']){next();return func(c)}
  E('SN');
}
function callFn(f,x){
  var keep=has(vars,f.arg)?vars[f.arg]:undefined,sc=cur,sp=pos;
  vars[f.arg]=x;
  cur=f.toks;pos=f.at;
  try{return n2(expr())}
  finally{cur=sc;pos=sp;if(keep===undefined)delete vars[f.arg];else vars[f.arg]=keep}
}
function func(t){
  var v,s,n,m;
  switch(t){
  case T.SGN:v=n2(arg1());return v>0?1:v<0?-1:0;
  case T.INT:return fr(Math.floor(n2(arg1())));
  case T.ABS:return Math.abs(n2(arg1()));
  case T.USR:n2(arg1());return 0;
  case T.FRE:arg1();n=38400-2049-progSize()-varSize();return n>32767?n-65536:n;
  case T.PDL:v=n2(arg1());if(v<0||v>3)E('FC');return 0;
  case T.POS:arg1();return M.ch();
  case T.SQR:v=n2(arg1());if(v<0)E('FC');return fr(Math.sqrt(v));
  case T.RND:return rnd(n2(arg1()));
  case T.LOG:v=n2(arg1());if(v<=0)E('FC');return fr(Math.log(v));
  case T.EXP:v=n2(arg1());if(v>88.0296919)E('OV');return fr(Math.exp(v));
  case T.COS:return fr(Math.cos(n2(arg1())));
  case T.SIN:return fr(Math.sin(n2(arg1())));
  case T.TAN:v=n2(arg1());if(Math.cos(v)===0)E('OV');return fr(Math.tan(v));
  case T.ATN:return fr(Math.atan(n2(arg1())));
  case T.PEEK:return M.peek(addr(n2(arg1())));
  case T.LEN:return sx(arg1()).length;
  case T['STR$']:return fout(n2(arg1()));
  case T.VAL:return val(sx(arg1()));
  case T.ASC:s=sx(arg1());if(!s.length)E('FC');return s.charCodeAt(0);
  case T['CHR$']:v=byte(n2(arg1()));return String.fromCharCode(v);
  case T['LEFT$']:case T['RIGHT$']:
    eat(40);s=sx(expr());eat(44);n=byte(num());eat(41);
    if(n===0)E('FC');
    return t===T['LEFT$']?s.slice(0,n):s.slice(Math.max(0,s.length-n));
  case T['MID$']:
    eat(40);s=sx(expr());eat(44);n=byte(num());m=255;
    if(at()===44){next();m=byte(num(),true)}
    eat(41);
    if(n===0)E('FC');
    return s.substr(n-1,m);
  }
  E('SN');
}
function sx(v){if(typeof v!=='string')E('TM');return v}
function byte(v,zero){v=Math.floor(v);if(v<0||v>255)E('FC');return v}
function addr(v){v=Math.floor(v);if(v<-65535||v>65535)E('FC');return v<0?v+65536:v}
function val(s){ /* VAL and INPUT: blanks do not count, and the number ends where the digits do */
  var t=s.replace(/ /g,''),m=t.match(/^[+-]?(\d*\.?\d*)(E[+-]?\d*)?/);
  if(!m||!m[1]||m[1]==='.')return 0;
  var x=m[0];if(/E[+-]?$/.test(x))x=x.replace(/E[+-]?$/,'');
  return fr(parseFloat(x.replace(/^([+-]?)\./,'$10.'))||0);
}

/* ---------- output ---------- */
function out(s){for(var i=0;i<s.length;i++)M.out(s.charCodeAt(i));spent+=s.length}
function cr(){M.out(13);spent++}

/* ---------- statements ---------- */
var S={};
S[T.END]=function(){stop(false)};
S[T.STOP]=function(){stop(true)};
function stop(brk){
  if(!running&&!brk)return finish();
  if(running)cont={line:line,pos:pos,cur:cur};
  if(brk){cr();out('BREAK');if(running)out(' IN '+prog[line].n)}
  finish();
}
function finish(){running=false;cur=null;throw {done:true}}
S[T.FOR]=function(){
  var r=ref();if(isStr(r.name)||isInt(r.name)||/\(/.test(r.name))E('SN');
  eat(T['=']);var from=num();assign(r,from);eat(T.TO);var to=num(),step=1;
  if(at()===T.STEP){next();step=num()}
  for(var i=stack.length-1;i>=0;i--){if(stack[i].g)break;if(stack[i].v===r.name){stack.length=i;break}}
  push({v:r.name,to:to,step:step,line:line,pos:pos,cur:cur,size:18});
};
function push(x){
  var used=stack.reduce(function(a,y){return a+y.size},0);
  if(used+x.size>230)E('OM');
  stack.push(x);
}
S[T.NEXT]=function(){
  for(;;){
    var n=null;
    if(isAlpha(at()))n=name();
    var i=stack.length-1;
    for(;i>=0;i--){if(stack[i].g){i=-1;break}if(!n||stack[i].v===n)break}
    if(i<0)E('NF');
    var F=stack[i];stack.length=i+1;
    var v=fr(vars[F.v]+F.step);vars[F.v]=v;
    if(F.step>=0?v<=F.to:v>=F.to){line=F.line;pos=F.pos;cur=F.cur;jumped=true;return}
    stack.length=i;
    if(at()!==44)return;
    next();
  }
};
S[T.REM]=function(){pos=cur.length};
S[T.DATA]=function(){skipStmt()};
function skipStmt(){var q=false;while(pos<cur.length){var c=cur[pos];if(c===34)q=!q;else if(c===58&&!q)return;pos++}}
S[T.LET]=function(){let_()};
function let_(){var r=ref();eat(T['=']);assign(r,expr())}
S[T.GOTO]=function(){go(lineNum())};
function go(n){var i=find(n);if(!running){running=true;stack=[];cont=null}line=i;cur=prog[i].t;pos=0;jumped=true}
S[T.GOSUB]=function(){var n=lineNum();push({g:true,line:line,pos:pos,cur:cur,size:5});go(n)};
S[T.RETURN]=function(){
  for(var i=stack.length-1;i>=0;i--)if(stack[i].g){var G=stack[i];stack.length=i;line=G.line;pos=G.pos;cur=G.cur;skipStmt();jumped=true;return}
  E('RG');
};
S[T.POP]=function(){
  for(var i=stack.length-1;i>=0;i--)if(stack[i].g){stack.length=i;return}
  E('RG');
};
S[T.IF]=function(){
  var v=expr(),t=typeof v==='string'?v.length>0:v!==0;
  if(at()===T.THEN)next();else if(at()!==T.GOTO)E('SN');
  if(!t){pos=cur.length;return}
  if(isDigit(at()))go(lineNum());
  else if(at()===T.GOTO){next();go(lineNum())}
  else return stmt();
};
S[T.ON]=function(){
  var v=byte(num()),t=at();
  if(t!==T.GOTO&&t!==T.GOSUB)E('SN');
  next();
  var k=1,n=-1;
  for(;;){var x=lineNum();if(k===v)n=x;if(at()!==44)break;next();k++}
  if(n<0)return;
  if(t===T.GOSUB)push({g:true,line:line,pos:pos,cur:cur,size:5});
  go(n);
};
S[T.RESTORE]=function(){data=null};
S[T.READ]=function(){
  do{
    var r=ref(),v=readData();
    if(isStr(r.name))assign(r,v);
    else{if(badNum(v)){errLineOverride=dataLineNum;E('SN')}assign(r,val(v))}
  }while(at()===44&&next()!==null);
};
var errLineOverride=null,dataLineNum=0;
function readData(){ /* the next item from the DATA statements, in program order */
  if(!data)data={i:0,p:0,inData:false};
  for(;;){
    if(data.i>=prog.length)E('OD');
    var t=prog[data.i].t;
    if(data.inData){
      var p=data.p;
      while(p<t.length&&t[p]===32)p++;
      var s='';
      if(t[p]===34){p++;while(p<t.length&&t[p]!==34){s+=String.fromCharCode(t[p]);p++}if(p<t.length)p++;while(p<t.length&&t[p]!==44&&t[p]!==58)p++}
      else{while(p<t.length&&t[p]!==44&&t[p]!==58){s+=String.fromCharCode(t[p]);p++}}
      dataLineNum=prog[data.i].n;
      if(t[p]===44){data.p=p+1}else{data.inData=false;data.p=p}
      return s;
    }
    var q=false,p2=data.p;
    for(;p2<t.length;p2++){
      if(t[p2]===34)q=!q;
      else if(!q&&t[p2]===T.DATA){break}
      else if(!q&&t[p2]===T.REM){p2=t.length;break}
    }
    if(p2<t.length){data.inData=true;data.p=p2+1;continue}
    data.i++;data.p=0;
  }
}
S[T.DIM]=function(){
  do{
    var n=name();eat(40);var d=[];
    do{d.push(toInt(num()))}while(at()===44&&next()!==null);
    eat(41);
    if(arrays[n])E('DD');
    d.forEach(function(x){if(x<0)E('FC')});
    arrays[n]=mkArray(n,d);
  }while(at()===44&&next()!==null);
};
S[T.DEF]=function(){
  if(!running)E('ID');
  eat(T.FN);var n=name();eat(40);var a=name();eat(41);eat(T['=']);
  fns[n]={arg:a,toks:cur,at:pos};
  skipStmt();
};
S[T.PRINT]=function(){
  var nl=true;
  for(;;){
    var c=at();
    if(c===0||c===58)break;
    nl=true;
    if(c===59){next();nl=false;continue}
    if(c===44){next();nl=false;var h=M.ch();if(h>=24)cr();else M.tab((h+16)&0xF0);continue}
    if(c===T['TAB(']){next();var n=byte(num());eat(41);nl=false;tabTo(n);continue}
    if(c===T['SPC(']){next();var m=byte(num());eat(41);nl=false;out(' '.repeat(m));continue}
    var v=expr();
    out(typeof v==='string'?v:fout(v));
    nl=true;
    if(at()===59||at()===44)continue;
  }
  if(nl)cr();
};
function tabTo(n){var h=M.ch();if(n-1>h)out(' '.repeat(n-1-h))}
S[T.HOME]=function(){M.home()};
S[T.HTAB]=function(){var n=byte(num());if(n<1)E('FC');M.htab(n)};
S[T.VTAB]=function(){var n=byte(num());if(n<1||n>24)E('FC');M.vtab(n)};
S[T.INVERSE]=function(){M.mode(63)};S[T.NORMAL]=function(){M.mode(255)};S[T.FLASH]=function(){M.mode(127)};
S[T.TEXT]=function(){M.text()};
S[T.GR]=S[T.HGR]=S[T.HGR2]=function(){M.graphics(true)};
S[T['COLOR=']]=S[T['HCOLOR=']]=S[T['ROT=']]=S[T['SCALE=']]=function(){byte(num())};
S[T.PLOT]=function(){byte(num());eat(44);byte(num())};
S[T.HLIN]=S[T.VLIN]=function(){byte(num());eat(44);byte(num());eat(T.AT);byte(num())};
S[T.HPLOT]=function(){
  if(at()!==T.TO){num();eat(44);num()}
  while(at()===T.TO){next();num();eat(44);num()}
};
S[T.DRAW]=S[T.XDRAW]=function(){num();if(at()===T.AT){next();num();eat(44);num()}};
S[T.SHLOAD]=S[T.RECALL]=S[T.STORE]=function(){skipStmt();M.tape()};
S[T.TRACE]=function(){trace=true};S[T.NOTRACE]=function(){trace=false};
S[T['SPEED=']]=function(){speed=byte(num())};
S[T['HIMEM:']]=S[T['LOMEM:']]=function(){num()};
S[T.POKE]=function(){var a=addr(num());eat(44);M.poke(a,byte(num()))};
S[T.CALL]=function(){var a=addr(num());return M.call(a)};
S[T.WAIT]=function(){
  var a=addr(num());eat(44);var m=byte(num()),x=0;
  if(at()===44){next();x=byte(num())}
  return {wait:'mem',a:a,m:m,x:x};
};
S[T['PR#']]=function(){var n=byte(num());if(n>7)E('FC');return M.slot('pr',n)};
S[T['IN#']]=function(){var n=byte(num());if(n>7)E('FC');return M.slot('in',n)};
S[T.ONERR]=function(){eat(T.GOTO);onerr=lineNum();skipStmt()};
S[T.RESUME]=function(){
  if(!errAt)E('SN'); /* nothing to go back to */
  line=errAt.line;cur=errAt.cur;pos=errAt.pos;errAt=null;jumped=true;
};
S[T.CLEAR]=function(){clear()};
function clear(){vars={};arrays={};fns={};stack=[];data=null;onerr=null;cont=null}
S[T.NEW]=function(){prog=[];reindex();clear();finish()};
S[T.CONT]=function(){
  if(running)return;
  if(!cont)E('CN');
  running=true;line=cont.line;cur=cont.cur;pos=cont.pos;cont=null;jumped=true;
};
S[T.RUN]=function(){
  if(isDigit(at())){var n=lineNum();clear();restart(find(n));return}
  if(!endStmt())E('SN');
  clear();restart(0);
};
function restart(i){
  running=true;stack=[];
  if(i>=prog.length){finish()}
  line=i;cur=prog[i].t;pos=0;jumped=true;
}
S[T.LIST]=function(){
  var a=0,b=63999;
  if(isDigit(at())){a=lineNum();b=a}
  if(at()===T['-']||at()===44){next();b=isDigit(at())?lineNum():63999}
  listing={i:0,a:a,b:b};cr();
  skipStmt();
};
S[T.DEL]=function(){
  var a=lineNum();if(at()!==44)E('SN');next();var b=lineNum();
  if(b<a)return;
  prog=prog.filter(function(L){return L.n<a||L.n>b});reindex();
  if(running)finish();
};
S[T.GET]=function(){
  if(!running)E('ID');
  var r=ref();
  return {wait:'key',then:function(k){
    var s=String.fromCharCode(k);
    if(isStr(r.name))assign(r,s);
    else{if(!/[0-9]/.test(s)&&s!==' ')E('SN');assign(r,val(s))}
  }};
};
S[T.INPUT]=function(){
  var prompt='?';
  if(at()===34){prompt=prim();eat(59)}
  if(!running){out(prompt);E('ID')}
  var refs=[],save=pos;
  return inputFrom(prompt,save);
};
function inputFrom(prompt,save){
  return {wait:'line',prompt:prompt,then:function(text){return takeInput(text,save,prompt)}};
}
function takeInput(text,save,prompt){ /* the line typed for an INPUT: as many values as it has, then ?? for the rest */
  pos=save;
  var items=splitInput(text),k=0;
  return fill();
  function fill(){
    for(;;){
      var p0=pos,r=ref();
      if(k>=items.length)return {wait:'line',prompt:'??',then:function(t){items=splitInput(t);k=0;pos=p0;return fill()}};
      var v=items[k++];
      if(!isStr(r.name)){
        if(badNum(v)){out('?REENTER');cr();pos=save;return inputFrom(prompt,save)}
        assign(r,val(v));
      }else assign(r,v);
      if(at()!==44)break;
      next();
    }
    if(k<items.length||items.extra){out('?EXTRA IGNORED');cr()}
    return null;
  }
}
function badNum(v){var x=v.replace(/ /g,'');return x!==''&&!/^[+-]?(\d+\.?\d*|\.\d+)(E[+-]?\d+)?$/.test(x)}
function splitInput(t){ /* items split at commas; quotes keep commas; leading blanks go */
  var o=[],i=0;
  for(;;){
    while(t.charAt(i)===' ')i++;
    var s='';
    if(t.charAt(i)==='"'){i++;while(i<t.length&&t.charAt(i)!=='"')s+=t.charAt(i++);if(i<t.length)i++;while(i<t.length&&t.charAt(i)!==',')i++}
    else while(i<t.length&&t.charAt(i)!==','&&t.charAt(i)!==':')s+=t.charAt(i++);
    o.push(s);
    if(t.charAt(i)===','){i++;continue}
    if(t.charAt(i)===':')o.extra=true;
    break;
  }
  return o;
}
S[T['&']]=function(){var p0=pos,r=M.amper(rest());if(r===false){pos=p0;return}return r};
S[T.LOAD]=function(){return M.tape()};
S[T.SAVE]=function(){return M.tape()};
function rest(){ /* the rest of the statement, as text, for &: tokens spelled out */
  var s='',q=false;
  while(pos<cur.length){
    var c=cur[pos];
    if(c===58&&!q)break;
    if(c===34)q=!q;
    s+=c>=0x80?KW[c-0x80]:String.fromCharCode(c);
    pos++;
  }
  return s;
}

function stmt(){
  var c=at();
  if(c===0)return;
  if(c>=0x80){
    var f=S[c];
    if(!f)E('SN');
    next();
    return f();
  }
  if(isAlpha(c)){let_();return}
  E('SN');
}

/* ---------- LIST ---------- */
function listLine(L){ /* the way LIST prints it: tokens with a blank on each side, wrapped at column 33 */
  out(String(L.n));out(' ');
  var t=L.t;
  for(var i=0;i<t.length;i++){
    if(M.ch()>=33){cr();M.tab(5)}
    var c=t[i];
    if(c>=0x80)out(' '+KW[c-0x80]+' ');
    else M.out(c),spent++;
  }
  cr();
}
function detok(t){return t.map(function(c){return c>=0x80?KW[c-0x80]:String.fromCharCode(c)}).join('')}

/* ---------- the loop ---------- */
var errorHook=null;
function error(k){ /* the message, or ONERR's line */
  var e=ERR[k];
  var where=running?(errLineOverride!==null?errLineOverride:prog[line].n):null;
  errLineOverride=null;
  if(running&&onerr!==null){
    errCode=e[0];errLine=where;errAt={line:line,cur:cur,pos:stmtStart};
    var i=byNum[onerr];
    if(i!==undefined){line=i;cur=prog[i].t;pos=0;return true}
  }
  cr();M.bell();out('?'+e[1]+' ERROR');
  if(where!==null){out(' IN '+where);cont=null}
  running=false;cur=null;
  return false;
}
var stmtStart=0,jumped=false;
function trap(code,where){ /* ONERR GOTO: the error goes to the program's own line */
  if(!running||onerr===null||byNum[onerr]===undefined)return false;
  errCode=code;errLine=where;errAt={line:line,cur:cur,pos:stmtStart};
  var i=byNum[onerr];line=i;cur=prog[i].t;pos=0;
  return true;
}
function caught(x){ /* true: carry on running */
  if(x&&x.done)return false;
  if(x&&x.basic)return error(x.basic);
  if(x&&x.dos!==undefined){
    var where=running?prog[line].n:null;
    if(trap(x.dos,where))return true;
    M.dosMessage(x.dos,running);
    if(running)brk();
    running=false;cur=null;
    return false;
  }
  throw x;
}
function step(budget){ /* run until the budget is spent, input is wanted, or it is over: 'more', 'wait', 'done' */
  spent=0;
  for(;;){
    if(want)return 'wait';
    try{
      if(M.pending()){var dw=M.runDos();if(dw&&dw.wait){want=dw;return 'wait'}continue}
      if(listing){
        while(listing.i<prog.length&&prog[listing.i].n<listing.a)listing.i++;
        if(listing.i>=prog.length||prog[listing.i].n>listing.b){listing=null;continue}
        if(M.broken()){listing=null;brk();return 'done'}
        listLine(prog[listing.i++]);
        if(spent>=budget)return 'more';
        continue;
      }
      if(!cur)return 'done';
      if(spent>=budget||(speed<255&&spent>0))return 'more';
      var c=at();
      if(c===58){next();continue}
      if(c===0){
        if(!running){cur=null;return 'done'}
        line++;
        if(line>=prog.length){running=false;cur=null;cont=null;return 'done'}
        cur=prog[line].t;pos=0;
        continue;
      }
      if(running&&M.broken()){
        stmtStart=pos;
        if(trap(255,prog[line].n))continue;
        brk();return 'done';
      }
      stmtStart=pos;
      if(trace&&running)out('#'+prog[line].n+' ');
      jumped=false;
      var r=stmt();
      if(r&&r.wait){want=r;return 'wait'}
      if(cur&&!jumped&&!endStmt())E('SN');
    }catch(x){
      if(caught(x))continue;
      return 'done';
    }
  }
}
function brk(){
  want=null;listing=null;
  cr();out('BREAK');
  if(running){out(' IN '+prog[line].n);cont={line:line,pos:stmtStart,cur:cur}}
  running=false;cur=null;
}
function answer(v){ /* what an INPUT, GET or WAIT was waiting for */
  var w=want;want=null;jumped=false;
  try{
    var r=w.then?w.then(v):null;
    if(r&&r.wait)want=r;
    else if(cur&&!jumped&&!endStmt())E('SN');
  }catch(x){
    if(!caught(x)){want=null}
  }
}
function enter(text){ /* a line typed at the ] prompt: a program line, or something to do now */
  var i=0;while(text.charAt(i)===' ')i++;
  if(/[0-9]/.test(text.charAt(i))){
    var n=0,j=i;
    while(j<text.length&&/[0-9 ]/.test(text.charAt(j))){if(text.charAt(j)!==' ')n=n*10+(+text.charAt(j));if(n>63999)break;j++}
    if(n>63999){cr();M.bell();out('?SYNTAX ERROR');return 'error'}
    var t=parse(text.slice(j));
    store(n,t);
    return 'stored';
  }
  direct=parse(text.slice(i));
  cur=direct;pos=0;running=false;line=-1;
  return 'run';
}
function store(n,t){
  var at0=byNum[n];
  if(at0!==undefined)prog.splice(at0,1);
  if(t.length){
    var k=0;while(k<prog.length&&prog[k].n<n)k++;
    prog.splice(k,0,{n:n,t:t});
  }
  reindex();
  vars={};arrays={};fns={};stack=[];data=null;cont=null;
}
return {
  step:step,enter:enter,answer:answer,want:function(){return want},
  running:function(){return running},listing:function(){return !!listing},
  speed:function(){return speed},spent:function(){return spent},
  load:function(lines,keep){prog=lines.map(function(L){return {n:L[0],t:L[1].slice()}});reindex();want=null;listing=null;if(!keep)clear();else{stack=[];data=null;cont=null}},
  program:function(){return prog.map(function(L){return [L.n,L.t.slice()]})},
  size:progSize,parse:parse,detok:detok,
  run:function(){want=null;clear();if(!prog.length){running=false;cur=null;return}running=true;stack=[];line=0;cur=prog[0].t;pos=0},
  chain:function(){want=null;running=true;stack=[];line=0;if(!prog.length){running=false;cur=null;return}cur=prog[0].t;pos=0},
  stop:function(){running=false;cur=null;want=null;listing=null},
  fail:function(code){want=null;try{caught({dos:code})}catch(e){running=false;cur=null}},
  newProg:function(){prog=[];reindex();clear()},
  errInfo:function(){return {code:errCode,line:errLine||0,on:onerr!==null}},trap:trap,brk:brk,
  setErr:function(c,l){errCode=c;errLine=l||0},
  clearOnerr:function(){onerr=null},
  error:error,cr:cr,out:out,
  dosHere:function(){return {line:line,cur:cur,pos:pos}}
};
};
P.applesoft.fout=fout;P.applesoft.fr=fr;P.applesoft.parse=parse;P.applesoft.KW=KW;P.applesoft.T=T;P.applesoft.rnd=rnd;
P.setup(function(){});
})(window.Phosphor);
