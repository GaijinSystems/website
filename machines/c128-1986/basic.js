/* PHOSPHOR-9 terminal: machine "c128-1986", BASIC. One interpreter written for this terminal that behaves like
   two: Commodore BASIC 7.0 in C128 mode and BASIC V2 in C64 mode. Lines are crunched into tokens as the real
   ones crunch them and run from the tokens, so the old tricks work: keywords inside names, ? for PRINT, a
   line typed over on the screen. Only the messages and keywords are Commodore's; the code is new.
   Numbers are doubles rounded to a 32-bit mantissa after each sum, near enough to the 5-byte floats.
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE. */
(function(P){
'use strict';
var C=P.c128=P.c128||{};
var V2=['END','FOR','NEXT','DATA','INPUT#','INPUT','DIM','READ','LET','GOTO','RUN','IF','RESTORE','GOSUB','RETURN','REM',
  'STOP','ON','WAIT','LOAD','SAVE','VERIFY','DEF','POKE','PRINT#','PRINT','CONT','LIST','CLR','CMD','SYS','OPEN','CLOSE',
  'GET','NEW','TAB(','TO','FN','SPC(','THEN','NOT','STEP','+','-','*','/','^','AND','OR','>','=','<','SGN','INT','ABS',
  'USR','FRE','POS','SQR','RND','LOG','EXP','COS','SIN','TAN','ATN','PEEK','LEN','STR$','VAL','ASC','CHR$','LEFT$',
  'RIGHT$','MID$','GO'];
var V7=['RGR','RCLR',null,'JOY','RDOT','DEC','HEX$','ERR$','INSTR','ELSE','RESUME','TRAP','TRON','TROFF','SOUND','VOL',
  'AUTO','PUDEF','GRAPHIC','PAINT','CHAR','BOX','CIRCLE','GSHAPE','SSHAPE','DRAW','LOCATE','COLOR','SCNCLR','SCALE',
  'HELP','DO','LOOP','EXIT','DIRECTORY','DSAVE','DLOAD','HEADER','SCRATCH','COLLECT','COPY','RENAME','BACKUP','DELETE',
  'RENUMBER','KEY','MONITOR','USING','UNTIL','WHILE'];
var CE=[null,null,'POT','BUMP','PEN','RSPPOS','RSPRITE','RSPCOLOR','XOR','RWINDOW','POINTER'];
var FE=[null,null,'BANK','FILTER','PLAY','TEMPO','MOVSPR','SPRITE','SPRCOLOR','RREG','ENVELOPE','SLEEP','CATALOG','DOPEN',
  'APPEND','DCLOSE','BSAVE','BLOAD','RECORD','CONCAT','DVERIFY','DCLEAR','SPRSAV','COLLISION','BEGIN','BEND','WINDOW',
  'BOOT','WIDTH','SPRDEF','QUIT','STASH',null,'FETCH',null,'SWAP','OFF','FAST','SLOW'];
var T={}; /* name to token: 0x80.., 0xCE00|n, 0xFE00|n */
V2.forEach(function(k,i){T[k]=0x80+i});V7.forEach(function(k,i){if(k)T[k]=0xCC+i});
CE.forEach(function(k,i){if(k)T[k]=0xCE00+i});FE.forEach(function(k,i){if(k)T[k]=0xFE00+i});
function words(seven){ /* [text, token] longest first */
  var L=[];
  Object.keys(T).forEach(function(k){var t=T[k];if(seven||t<0xCC)L.push([k,t])});
  return L.sort(function(a,b){return b[0].length-a[0].length});
}
var W2=words(false),W7=words(true);
var ERR=[null,'TOO MANY FILES','FILE OPEN','FILE NOT OPEN','FILE NOT FOUND','DEVICE NOT PRESENT','NOT INPUT FILE',
  'NOT OUTPUT FILE','MISSING FILE NAME','ILLEGAL DEVICE NUMBER','NEXT WITHOUT FOR','SYNTAX','RETURN WITHOUT GOSUB',
  'OUT OF DATA','ILLEGAL QUANTITY','OVERFLOW','OUT OF MEMORY',"UNDEF'D STATEMENT",'BAD SUBSCRIPT',"REDIM'D ARRAY",
  'DIVISION BY ZERO','ILLEGAL DIRECT','TYPE MISMATCH','STRING TOO LONG','FILE DATA','FORMULA TOO COMPLEX',"CAN'T CONTINUE",
  "UNDEF'D FUNCTION",'VERIFY','LOAD','BREAK',"CAN'T RESUME",'LOOP NOT FOUND','LOOP WITHOUT DO','DIRECT MODE ONLY',
  'NO GRAPHICS AREA','BAD DISK','BEND NOT FOUND','LINE NUMBER TOO LARGE','UNRESOLVED REFERENCE','UNIMPLEMENTED COMMAND','FILE READ'];
var E={files:1,open:2,notopen:3,notfound:4,device:5,notinput:6,notoutput:7,noname:8,devnum:9,next:10,syntax:11,ret:12,data:13,
  qty:14,over:15,mem:16,undef:17,sub:18,redim:19,div:20,direct:21,type:22,long:23,fdata:24,complex:25,cont:26,fn:27,
  verify:28,load:29,brk:30,resume:31,loopnf:32,loopwo:33,directonly:34,graphics:35,bend:37,toolarge:38,unimpl:40};
function Err(n){this.n=n}
function err(n){throw new Err(n)}
var WAIT={wait:true}; /* a statement that has to wait for the keyboard, the drive or the clock */
var KEYS=['GRAPHIC','DLOAD"','DIRECTORY\r','SCNCLR\r','DSAVE"','RUN\r','LIST\r','MONITOR\r'];
var NOTES={C:0,D:2,E:4,F:5,G:7,A:9,B:11}; /* PLAY: semitones above C */

function fr(x){ /* the five-byte float: a 32-bit mantissa, and nothing bigger than 1.7E+38 */
  if(x===0||!isFinite(x)){if(!isFinite(x))err(E.over);return 0}
  var a=Math.abs(x);
  if(a<2.93873588e-39)return 0;
  var e=Math.floor(Math.log2(a)),s=Math.pow(2,31-e),r=Math.round(a*s)/s;
  if(r>1.70141183e38)err(E.over);
  return x<0?-r:r;
}
function num(x){ /* how PRINT and STR$ write a number, less the leading space */
  if(x===0)return '0';
  var s=Math.abs(x).toExponential(8),m=/^(\d)\.(\d+)e([+-]\d+)$/.exec(s),d=(m[1]+m[2]).replace(/0+$/,''),e=+m[3],o;
  if(e>8||e<-2)o=d.charAt(0)+(d.length>1?'.'+d.slice(1):'')+'E'+(e<0?'-':'+')+String(Math.abs(e)).padStart(2,'0');
  else if(e<0)o='.'+'0'.repeat(-e-1)+d;
  else o=d.length<=e+1?d+'0'.repeat(e+1-d.length):d.slice(0,e+1)+'.'+d.slice(e+1);
  return (x<0?'-':'')+o;
}
function val(s){ /* VAL: as much of a number as the string starts with, spaces ignored */
  var t=s.replace(/ /g,''),m=/^[+-]?(\d+\.?\d*|\.\d+)(E[+-]?\d+)?/.exec(t);
  if(!m){m=/^[+-]?(\d+\.?\d*|\.\d+)/.exec(t);if(!m)return 0}
  var v=parseFloat(m[0].replace(/E([+-]?)$/,''));
  return isFinite(v)?fr(v):err(E.over);
}
function int16(x){x=Math.floor(x);if(x<-32768||x>32767)err(E.qty);return x}
function s2b(s){var a=[];for(var i=0;i<s.length;i++)a.push(s.charCodeAt(i)&255);return a}
function b2s(a,i,j){var s='';for(var k=i;k<j;k++)s+=String.fromCharCode(a[k]);return s}
var NUMBER=/^[+-]?(\d+\.?\d*|\.\d+)(E[+-]?\d+)?$/; /* what INPUT and READ take as a number */
function linked(base,lines){ /* lines {n,b} as a program file at base: load address, then the lines with their links */
  var o=[base&255,base>>8],a=base;
  lines.forEach(function(l){
    var next=a+4+l.b.length+1;
    o.push(next&255,next>>8,l.n&255,l.n>>8);for(var i=0;i<l.b.length;i++)o.push(l.b[i]);o.push(0);a=next;
  });
  o.push(0,0);
  return new Uint8Array(o);
}

/* ---------- crunching a line into tokens, and LIST's way back ---------- */
function crunch(s,seven){
  var W=seven?W7:W2,o=[],i=0,quote=false,data=false,rem=false;
  while(i<s.length){
    var c=s.charCodeAt(i);
    if(rem||quote&&c!==34){o.push(c);i++;continue}
    if(c===34){quote=!quote;o.push(c);i++;continue}
    if(data){if(c===58)data=false;o.push(c);i++;continue}
    if(c>=128||c===32||(c>=48&&c<=59)){o.push(c);i++;continue}
    if(c===63){o.push(0x99);i++;continue}
    var hit=null,len=0;
    for(var w=0;w<W.length&&!hit;w++){
      var k=W[w][0],j=0;
      while(j<k.length&&i+j<s.length){
        var x=s.charCodeAt(i+j),y=k.charCodeAt(j);
        if(x===y){j++;continue}
        if(x===(y|128)&&j>0&&y>=65&&y<=90){hit=W[w];len=j+1;break} /* shifted letter: an abbreviation */
        break;
      }
      if(!hit&&j===k.length){hit=W[w];len=j}
    }
    if(hit){
      var t=hit[1];
      if(t>0xff)o.push(t>>8,t&255);else o.push(t);
      if(t===0x8f)rem=true;
      if(t===0x83)data=true;
      i+=len;continue;
    }
    o.push(c);i++;
  }
  return o;
}
function detok(b,seven){ /* LIST: a line's bytes back to PETSCII text */
  var o='',quote=false;
  for(var i=0;i<b.length;i++){
    var c=b[i];
    if(c===34)quote=!quote;
    if(quote||c<128||c===255){o+=String.fromCharCode(c);continue}
    if(seven&&(c===0xCE||c===0xFE)&&i+1<b.length){var t=(c===0xCE?CE:FE)[b[++i]];o+=t||'';continue}
    var k=c<=0xCB?V2[c-0x80]:seven?V7[c-0xCC]:null;
    o+=k||String.fromCharCode(c);
  }
  return o;
}

/* ---------- the interpreter ---------- */
function Basic(m,seven){
  this.m=m;this.v7=!!seven;this.prog=[];this.state='ready';
  this.cmdLfn=0;this.files={};this.trace=false;this.autoStep=0;this.keys=KEYS.slice();this.tempo=8;this.volume=15;
  this.cont=null;this.errLine=null;this.trap=null;this.erN=0;this.elN=65535;this.seed=0.811635157;this.lastLine=-1;
  this.clr();
}
var B=Basic.prototype;
B.clr=function(){
  this.vars=Object.create(null);this.arrs=Object.create(null);this.fns=Object.create(null);
  this.stack=[];this.dataLi=0;this.dataP=-1;this.dataBuf=null;this.st=0;this.fnDepth=0;
  this.closeAll();
};
B.closeAll=function(){this.files={};this.cmdLfn=0;if(this.m.drive)this.m.drive.closeAll()};
/* ---------- the program ---------- */
B.index=function(n){ /* where line n is, or where it would go: {i,hit} */
  var lo=0,hi=this.prog.length;
  while(lo<hi){var mid=(lo+hi)>>1;if(this.prog[mid].n<n)lo=mid+1;else hi=mid}
  return {i:lo,hit:lo<this.prog.length&&this.prog[lo].n===n};
};
B.store=function(n,bytes){
  var x=this.index(n);
  if(!bytes.length){if(x.hit)this.prog.splice(x.i,1)}
  else if(x.hit)this.prog[x.i].b=bytes;
  else this.prog.splice(x.i,0,{n:n,b:bytes});
  this.clr();this.cont=null;
};
B.prg=function(){return linked(this.v7?0x1c01:0x801,this.prog)}; /* the program as a file */
B.loadPrg=function(u){ /* a program file's lines become the program; what else goes is up to the caller */
  var L=[],i=2;
  while(i+3<u.length){
    if(u[i]===0&&u[i+1]===0)break;
    var n=u[i+2]|(u[i+3]<<8),j=i+4,b=[];
    while(j<u.length&&u[j]!==0)b.push(u[j++]);
    L.push({n:n,b:b});i=j+1;
  }
  this.prog=L;this.cont=null;
};
B.size=function(){var s=2;this.prog.forEach(function(l){s+=l.b.length+5});return s};
/* room on the stack for one more FOR, GOSUB or DO, as VICE measured it: BASIC 7.0 has 512 bytes for them (18 a FOR,
   5 the others) and takes 66 GOSUBs at most, FORMULA TOO COMPLEX past that; the C64 takes 10 FORs or 23 GOSUBs */
var FRAME7={'for':18,gosub:5,'do':5},FRAME2={'for':18,gosub:8};
B.room=function(t){
  var size=this.v7?FRAME7:FRAME2,used=size[t],subs=0;
  this.stack.forEach(function(f){used+=size[f.t];if(f.t==='gosub')subs++});
  if(this.v7&&t==='gosub'&&subs>=66)err(E.complex);
  if(used>(this.v7?512:190))err(E.mem);
};
/* ---------- reading the tokens ---------- */
B.at=function(){ /* the byte under the text pointer, past spaces; 0 at the end of the line */
  while(this.p<this.buf.length&&this.buf[this.p]===32)this.p++;
  return this.p<this.buf.length?this.buf[this.p]:0;
};
B.tok=function(){ /* a token there, two bytes for the extended ones */
  var c=this.at();
  if(this.v7&&(c===0xCE||c===0xFE)&&this.p+1<this.buf.length)return (c<<8)|this.buf[this.p+1];
  return c;
};
B.skipTok=function(t){this.p+=t>0xff?2:1};
B.is=function(t){if(this.tok()===t){this.skipTok(t);return true}return false};
B.need=function(t){if(!this.is(t))err(E.syntax)};
B.end=function(){var c=this.at();return c===0||c===58};
B.need58=function(){if(!this.end())err(E.syntax)};
/* ---------- expressions ---------- */
B.expr=function(){
  var a=this.andx();
  while(this.is(0xB0)){var b=this.andx();a=int16(this.numOf(a))|int16(this.numOf(b))}
  return a;
};
B.andx=function(){
  var a=this.notx();
  while(this.is(0xAF)){var b=this.notx();a=int16(this.numOf(a))&int16(this.numOf(b))}
  return a;
};
B.notx=function(){
  if(this.is(0xA8)){var a=this.rel();return ~int16(this.numOf(a))}
  return this.rel();
};
B.rel=function(){
  var a=this.add();
  for(;;){
    var op=0,c;
    while((c=this.at())>=0xB1&&c<=0xB3){op|=c===0xB1?1:c===0xB2?2:4;this.p++}
    if(!op)return a;
    var b=this.add(),r;
    if((typeof a)!==(typeof b))err(E.type);
    r=(a<b&&op&4)||(a===b&&op&2)||(a>b&&op&1);
    a=r?-1:0;
  }
};
B.add=function(){
  var a=this.mul();
  for(;;){
    if(this.is(0xAA)){var b=this.mul();if(typeof a==='string'){if(typeof b!=='string')err(E.type);a+=b;if(a.length>255)err(E.long)}else a=fr(a+this.numOf(b))}
    else if(this.is(0xAB))a=fr(this.numOf(a)-this.numOf(this.mul()));
    else return a;
  }
};
B.mul=function(){
  var a=this.unary();
  for(;;){
    if(this.is(0xAC))a=fr(this.numOf(a)*this.numOf(this.unary()));
    else if(this.is(0xAD)){var d=this.numOf(this.unary());if(d===0)err(E.div);a=fr(this.numOf(a)/d)}
    else return a;
  }
};
B.unary=function(){
  if(this.is(0xAB))return -this.numOf(this.unary());
  if(this.is(0xAA))return this.numOf(this.unary());
  return this.pow();
};
B.pow=function(){
  var a=this.atom();
  while(this.is(0xAE)){
    var neg=this.is(0xAB),b=this.numOf(this.atom());if(neg)b=-b;
    a=this.numOf(a);
    if(a<0&&b!==Math.floor(b))err(E.qty);
    if(a===0&&b<0)err(E.div);
    a=fr(Math.pow(a,b));
  }
  return a;
};
B.numOf=function(v){if(typeof v!=='number')err(E.type);return v};
B.strOf=function(v){if(typeof v!=='string')err(E.type);return v};
B.num=function(){return this.numOf(this.expr())};
B.str=function(){return this.strOf(this.expr())};
B.int=function(lo,hi){var v=Math.floor(this.num());if(v<lo||v>hi)err(E.qty);return v};
B.byte=function(){return this.int(0,255)};
B.paren=function(){var v=this.expr();this.need(41);return v};
B.atom=function(){
  var c=this.at(),t=this.tok();
  if(c===34){ /* a string, which may run to the end of the line */
    var s=++this.p;while(this.p<this.buf.length&&this.buf[this.p]!==34)this.p++;
    var v=b2s(this.buf,s,this.p);if(this.p<this.buf.length)this.p++;
    return v;
  }
  if((c>=48&&c<=57)||c===46)return this.number();
  if(c===40){this.p++;return this.paren()}
  if(c===255){this.p++;return 3.14159265}
  if(c>=65&&c<=90)return this.variable();
  if(t===0xA5)return this.fn();
  if(t>=0xB4&&t<=0xCA||this.v7&&(t===0xCC||t===0xCD||t===0xCF||t===0xD0||t===0xD1||t===0xD2||t===0xD3||t===0xD4||(t>>8)===0xCE))return this.func(t);
  if(t===0xA8)return this.notx(); /* NOT inside a sum */
  if(t===0xAB){this.p++;return -this.numOf(this.atom())}
  if(t===0xAA){this.p++;return this.numOf(this.atom())}
  err(E.syntax);
};
B.number=function(){
  var s='',c,e=false;
  for(;;){
    c=this.at();
    if(c>=48&&c<=57||c===46&&s.indexOf('.')<0&&!e){s+=String.fromCharCode(c);this.p++;continue}
    if(c===69&&!e){e=true;s+='E';this.p++;c=this.at();if(c===0xAB||c===45){s+='-';this.p++}else if(c===0xAA||c===43)this.p++;continue}
    break;
  }
  var v=parseFloat(s.replace(/E-?$/,'')||'0');
  if(!isFinite(v))err(E.over);
  return fr(v);
};
B.name=function(){ /* a variable's name: two letters count, then $ or % */
  var n=String.fromCharCode(this.buf[this.p++]),c;
  while((c=this.at())>=65&&c<=90||c>=48&&c<=57){if(n.length<2)n+=String.fromCharCode(c);this.p++}
  if(c===36||c===37){n+=String.fromCharCode(c);this.p++}
  return n;
};
B.reserved=function(n){
  if(n==='ST'||n==='TI'||n==='TI$')return true;
  return this.v7&&/^(DS|DS\$|ER|EL)$/.test(n);
};
B.variable=function(){
  var n=this.name();
  if(this.at()===40){this.p++;var ix=this.subs();return this.elem(n,ix,false).get()}
  return this.get(n);
};
B.get=function(n){
  if(n==='ST')return this.st;
  if(n==='TI')return Math.floor(this.m.jiffies())%5184000;
  if(n==='TI$'){var j=Math.floor(this.m.jiffies()/60)%86400;return [j/3600,j/60%60,j%60].map(function(x){return String(Math.floor(x)).padStart(2,'0')}).join('')}
  if(this.v7){
    if(n==='DS')return this.m.drive.status[0];
    if(n==='DS$')return this.m.drive.ds();
    if(n==='ER')return this.erN;
    if(n==='EL')return this.elN;
  }
  if(n in this.vars)return this.vars[n];
  return /\$$/.test(n)?'':0;
};
B.set=function(n,v){
  if(n==='TI$'){
    v=this.strOf(v);if(!/^\d{6}$/.test(v))err(E.qty);
    this.m.setClock((+v.slice(0,2)*3600+ +v.slice(2,4)*60+ +v.slice(4))*60);return;
  }
  if(this.reserved(n))err(E.syntax);
  this.vars[n]=this.conv(n,v);
};
B.conv=function(n,v){
  if(/\$$/.test(n))return this.strOf(v);
  v=this.numOf(v);
  return /%$/.test(n)?int16(v):v;
};
B.subs=function(){var ix=[];do{ix.push(this.int(0,32767))}while(this.is(44));this.need(41);return ix};
B.dim=function(n,sizes){
  var len=1;sizes.forEach(function(s){len*=s+1});
  if(len>8000)err(E.mem);
  var fill=/\$$/.test(n)?'':0,a={sizes:sizes,data:new Array(len).fill(fill)};
  this.arrs[n]=a;return a;
};
B.elem=function(n,ix,dimming){
  var a=this.arrs[n],self=this;
  if(!a){var s=ix.map(function(){return 10});a=this.dim(n,s)}
  if(a.sizes.length!==ix.length)err(E.sub);
  var at=0;
  for(var i=ix.length-1;i>=0;i--){if(ix[i]>a.sizes[i])err(E.sub);at=at*(a.sizes[i]+1)+ix[i]}
  return {name:n,get:function(){return a.data[at]},set:function(v){a.data[at]=self.conv(n,v)}};
};
B.lvalue=function(){ /* a variable to assign to: {set} */
  var c=this.at();
  if(c<65||c>90)err(E.syntax);
  var n=this.name(),self=this;
  if(this.at()===40){this.p++;return this.elem(n,this.subs(),false)}
  return {name:n,set:function(v){self.set(n,v)},get:function(){return self.get(n)}};
};
B.fn=function(){
  this.p++;
  var c=this.at();if(c<65||c>90)err(E.syntax);
  var n=this.name();if(/[$%]$/.test(n))err(E.syntax);
  var f=this.fns[n];
  if(this.at()!==40)err(E.syntax);this.p++;
  var x=this.num();this.need(41);
  if(!f)err(E.fn);
  if(this.fnDepth>=20)err(this.v7?E.complex:E.mem); /* a function that calls itself: what the real ones say */
  var keep={buf:this.buf,p:this.p},had=f.param in this.vars,old=this.vars[f.param];
  this.vars[f.param]=x;this.buf=f.buf;this.p=f.p;this.fnDepth++;
  try{var v=this.num()}finally{this.fnDepth--;if(had)this.vars[f.param]=old;else delete this.vars[f.param];this.buf=keep.buf;this.p=keep.p}
  return v;
};
B.func=function(t){
  this.skipTok(t);
  var self=this;
  function arg(){if(self.at()!==40)err(E.syntax);self.p++;var v=self.expr();self.need(41);return v}
  function args(n){if(self.at()!==40)err(E.syntax);self.p++;var a=[self.expr()];while(self.is(44))a.push(self.expr());self.need(41);return a}
  var x,s,a;
  switch(t){
    case 0xB4:x=this.numOf(arg());return x>0?1:x<0?-1:0;
    case 0xB5:return Math.floor(this.numOf(arg()));
    case 0xB6:return Math.abs(this.numOf(arg()));
    case 0xB7:arg();err(E.qty);break;
    case 0xB8:x=arg();return this.fre(x);
    case 0xB9:arg();return this.m.pos();
    case 0xBA:x=this.numOf(arg());if(x<0)err(E.qty);return fr(Math.sqrt(x));
    case 0xBB:return this.rnd(this.numOf(arg()));
    case 0xBC:x=this.numOf(arg());if(x<=0)err(E.qty);return fr(Math.log(x));
    case 0xBD:x=this.numOf(arg());if(x>88.0296919)err(E.over);return fr(Math.exp(x));
    case 0xBE:return fr(Math.cos(this.numOf(arg())));
    case 0xBF:return fr(Math.sin(this.numOf(arg())));
    case 0xC0:x=this.numOf(arg());if(Math.cos(x)===0)err(E.over);return fr(Math.tan(x));
    case 0xC1:return fr(Math.atan(this.numOf(arg())));
    case 0xC2:x=Math.floor(this.numOf(arg()));if(x<0||x>65535)err(E.qty);return this.m.peek(x);
    case 0xC3:return this.strOf(arg()).length;
    case 0xC4:x=this.numOf(arg());return (x<0?'':' ')+num(x);
    case 0xC5:return val(this.strOf(arg()));
    case 0xC6:s=this.strOf(arg());if(!s.length)err(E.qty);return s.charCodeAt(0);
    case 0xC7:x=Math.floor(this.numOf(arg()));if(x<0||x>255)err(E.qty);return String.fromCharCode(x);
    case 0xC8:case 0xC9:a=args(2);if(a.length!==2)err(E.syntax);s=this.strOf(a[0]);x=Math.floor(this.numOf(a[1]));if(x<0||x>255)err(E.qty);
      return t===0xC8?s.slice(0,x):x===0?'':s.slice(-x);
    case 0xCA:a=args();if(a.length<2||a.length>3)err(E.syntax);s=this.strOf(a[0]);x=Math.floor(this.numOf(a[1]));
      var n=a.length>2?Math.floor(this.numOf(a[2])):255;if(x<1||x>255||n<0||n>255)err(E.qty);return s.substr(x-1,n);
    /* BASIC 7.0 */
    case 0xCC:arg();return 0; /* RGR: text, always */
    case 0xCD:x=Math.floor(this.numOf(arg()));if(x<0||x>6)err(E.qty);return this.m.rclr(x);
    case 0xCF:arg();return 0; /* JOY: nothing plugged in */
    case 0xD0:arg();return 0;
    case 0xD1:s=this.strOf(arg());if(!/^[0-9A-F]{1,4}$/.test(s))err(E.qty);return parseInt(s,16);
    case 0xD2:x=Math.floor(this.numOf(arg()));if(x<0||x>65535)err(E.qty);return x.toString(16).toUpperCase().padStart(4,'0');
    case 0xD3:x=Math.floor(this.numOf(arg()));if(x<1||x>41)err(E.qty);return ERR[x];
    case 0xD4:a=args();if(a.length<2||a.length>3)err(E.syntax);s=this.strOf(a[0]);var f=this.strOf(a[1]);
      x=a.length>2?Math.floor(this.numOf(a[2])):1;if(x<1||x>255)err(E.qty);if(!f.length)return 0;return s.indexOf(f,x-1)+1;
    case 0xCE02:case 0xCE03:case 0xCE04:case 0xCE05:case 0xCE06:case 0xCE07:arg();return 0;
    case 0xCE08:a=args();if(a.length!==2)err(E.syntax);return (Math.floor(this.numOf(a[0]))^Math.floor(this.numOf(a[1])))&65535;
    case 0xCE09:x=Math.floor(this.numOf(arg()));if(x<0||x>2)err(E.qty);return this.m.window(x);
    case 0xCE0A:if(this.at()!==40)err(E.syntax);this.p++;if(this.at()<65||this.at()>90)err(E.syntax);var nm=this.name();this.need(41);return nm in this.vars?4864+Object.keys(this.vars).indexOf(nm)*7:0;
  }
  err(E.syntax);
};
B.fre=function(){
  var used=this.size()+Object.keys(this.vars).length*7;
  if(this.v7)return 58109-used;
  var v=38911-used;return v>32767?v-65536:v; /* the C64's famous negative answer */
};
B.rnd=function(x){
  if(x<0)this.seed=(Math.abs(Math.sin(x*12.9898))*43758.5453)%1;
  else if(x===0)this.seed=((this.m.jiffies()*0.618034+0.1)%1);
  else this.seed=(this.seed*11879546+3.927677739e-8)%1;
  return fr(this.seed);
};
/* ---------- output ---------- */
B.out=function(s){ /* to the screen, or wherever CMD sends it */
  if(this.cmdLfn&&this.files[this.cmdLfn]){this.fileOut(this.cmdLfn,s);return}
  this.say(s);
};
B.say=function(s){for(var i=0;i<s.length;i++)this.m.out(s.charCodeAt(i))}; /* always the screen */
B.fileOut=function(lfn,s){
  var f=this.files[lfn];
  if(!f)err(E.notopen);
  if(f.dev===3){this.say(s);return}
  if(f.dev===0)err(E.notoutput);
  if(f.dev!==8)err(E.device);
  for(var j=0;j<s.length;j++)if(!this.m.drive.put(f.sa,s.charCodeAt(j)&255))err(E.notoutput);
  this.cost+=s.length*0.05;
};
/* ---------- running ---------- */
B.line=function(){return this.li>=0&&this.li<this.prog.length?this.prog[this.li].n:-1};
B.direct=function(text){ /* a line from the screen, typed at READY. */
  var t=text.replace(/^ +/,''),m=/^[0-9][0-9 ]*/.exec(t);
  if(m){
    var n=parseInt(m[0].replace(/ /g,''),10);
    if(n>63999){this.error(E.syntax);return}
    var rest=t.slice(m[0].length);
    this.store(n,crunch(rest,this.v7));
    if(this.autoStep&&rest.trim())this.m.typeAhead(String(n+this.autoStep)+' ');
    this.state='ready';return;
  }
  if(!t.trim()){this.state='ready';return}
  this.buf=crunch(t,this.v7);this.p=0;this.li=-1;this.state='run';this.cost=0;
};
B.ready=function(){
  this.state='ready';this.cmdLfn=0;
  this.say('\rREADY.\r');
  this.m.ready();
};
B.error=function(n){
  if(this.state==='run'&&this.li>=0&&this.trap!==null&&n!==E.directonly){ /* TRAP */
    var to=this.index(this.trap);
    this.erN=n;this.elN=this.line();this.resumeAt={li:this.li,p:this.stmt,buf:this.buf};
    if(!to.hit){n=E.undef}
    else{this.trap0=this.trap;this.trap=null;this.li=to.i;this.buf=this.prog[to.i].b;this.p=0;return}
  }
  this.cmdLfn=0;
  var ln=this.li>=0&&(this.state==='run'||this.state==='input'||this.state==='wait')?this.line():-1;
  this.erN=n;this.elN=ln<0?65535:ln;
  if(n===E.brk){
    this.m.silence();this.voiceEnd=null; /* RUN/STOP: the tones stop, PLAY's queued notes with them */
    this.say((this.v7?'\r\r':'\r')+'BREAK'+(ln>=0?' IN '+ln:''));
    if(ln>=0)this.cont={li:this.li,p:this.stmt,buf:this.buf};
  }else{
    if(ln>=0){this.errLine={n:ln,at:this.stmt};this.cont=null}
    else this.errLine=null;
    this.say('\r?'+ERR[n]+(this.v7?' ':'  ')+'ERROR'+(ln>=0?' IN '+ln:''));
  }
  this.stack=[];
  this.ready();
};
B.stop=function(){ /* RUN/STOP */
  if(this.state==='run'||this.state==='input'||this.state==='wait'){
    if(this.task){this.task=null;this.state='run'}
    this.p=this.stmt;
    if(this.state==='input'){this.m.endInput()}
    this.state='run';this.error(E.brk);
  }
};
B.exec=function(budget){ /* run statements until the budget (ms of the real machine's time) is spent */
  var per=this.m.speed(),spent=0;
  this.cost=0;
  while(spent<budget){
    if(this.state==='wait'&&this.m.stopped()){this.waitFor=null;this.state='run';this.p=this.stmt;this.error(E.brk);return}
    if(this.state==='wait'){
      if(this.waitFor&&!this.waitFor())return;
      this.waitFor=null;this.state='run';
    }
    if(this.task){if(!this.task())return;this.task=null;if(this.state!=='run')return;continue}
    if(this.state!=='run')return;
    try{
      this.statement();
      spent+=per+this.cost;this.cost=0;
    }catch(e){
      if(e===WAIT)return;
      if(e instanceof Err){this.error(e.n);return}
      throw e;
    }
  }
};
B.statement=function(){
  var c=this.at();
  if(c===58){this.p++;return}
  if(c===0){ /* end of the line */
    if(this.li<0){this.ready();return}
    this.li++;
    if(this.li>=this.prog.length){this.cont=null;this.ready();return}
    this.buf=this.prog[this.li].b;this.p=0;
    if(this.trace)this.out('['+this.prog[this.li].n+']');
    if(this.m.stopped())err(E.brk);
    return;
  }
  if(this.m.stopped()){this.stmt=this.p;err(E.brk)}
  this.stmt=this.p;
  var t=this.tok();
  if(t<0x80){this.let();this.need58();return}
  this.skipTok(t);
  var f=this.st7[t]||(t<=0xCB?this.st2[t]:null);
  if(!f||!this.v7&&t>0xCB)err(E.syntax);
  if(f.call(this,t)!==false)this.need58();
};
B.let=function(){var v=this.lvalue();this.need(0xB2);v.set(this.expr())};
/* where things are */
B.goLine=function(n){
  var x=this.index(n);
  if(!x.hit)err(E.undef);
  this.li=x.i;this.buf=this.prog[x.i].b;this.p=0;
};
B.lineNum=function(){ /* a line number after GOTO and the like: digits only */
  var s='',c;
  while((c=this.at())>=48&&c<=57){s+=String.fromCharCode(c);this.p++}
  return s===''?-1:parseInt(s,10);
};
B.toEndOfStatement=function(){
  var q=false;
  while(this.p<this.buf.length){var c=this.buf[this.p];if(c===34)q=!q;else if(c===58&&!q)return;this.p++}
};
B.toEndOfLine=function(){this.p=this.buf.length};
B.here=function(){return {li:this.li,p:this.p,buf:this.buf}};
B.jump=function(at){this.li=at.li;this.p=at.p;this.buf=at.buf};
B.scan=function(open,close,fail){ /* forward to the matching close token (LOOP for DO, BEND for BEGIN), across lines */
  var depth=0,li=this.li,p=this.p,buf=this.buf;
  for(;;){
    var q=false;
    while(p<buf.length){
      var c=buf[p];
      if(c===34){q=!q;p++;continue}
      if(q){p++;continue}
      if(c===0x8f){p=buf.length;break} /* REM: the rest of the line is words */
      var t=(c===0xCE||c===0xFE)&&p+1<buf.length?(c<<8)|buf[p+1]:c;
      p+=t>0xff?2:1;
      if(t===open)depth++;
      else if(t===close){if(!depth){this.li=li;this.p=p;this.buf=buf;return}depth--}
    }
    if(li<0||++li>=this.prog.length)err(fail);
    buf=this.prog[li].b;p=0;
  }
};
B.findElse=function(){ /* the rest of this line after its ELSE, or false */
  var q=false;
  for(var i=this.p;i<this.buf.length;i++){
    var c=this.buf[i];
    if(c===34)q=!q;
    else if(!q&&c===0xD5){this.p=i+1;return true}
  }
  return false;
};
B.afterThen=function(){ /* THEN 100, or the statements that follow */
  var n=this.at();
  if(n>=48&&n<=57){this.goLine(this.lineNum());return false}
  return true;
};
/* ---------- statements: BASIC V2 ---------- */
var st2={};
st2[0x80]=function(){this.cont=this.li>=0?this.here():null;this.ready();return false}; /* END */
st2[0x81]=function(){ /* FOR */
  var c=this.at();if(c<65||c>90)err(E.syntax);
  var n=this.name();if(/[$%]$/.test(n)||this.at()===40)err(E.syntax);
  this.need(0xB2);this.set(n,this.num());this.need(0xA4);
  var lim=this.num(),step=this.is(0xA9)?this.num():1;
  this.need58();
  for(var i=this.stack.length-1;i>=0;i--){var f=this.stack[i];if(f.t==='gosub')break;if(f.t==='for'&&f.v===n){this.stack.splice(i);break}}
  this.room('for');
  this.stack.push({t:'for',v:n,lim:lim,step:step,at:this.here()});
  return false;
};
st2[0x82]=function(){ /* NEXT */
  for(;;){
    var n=null;
    if(!this.end()&&this.at()!==44){if(this.at()<65||this.at()>90)err(E.syntax);n=this.name()}
    var i=this.stack.length-1;
    for(;i>=0;i--){var f=this.stack[i];if(f.t!=='for'){if(f.t==='gosub')i=-1;break}if(!n||f.v===n)break}
    if(i<0||this.stack[i].t!=='for')err(E.next);
    var fr0=this.stack[i];this.stack.length=i+1;
    var v=fr(this.get(fr0.v)+fr0.step);this.vars[fr0.v]=v;
    if(fr0.step>=0?v<=fr0.lim:v>=fr0.lim){this.jump(fr0.at);return false}
    this.stack.pop();
    if(!this.is(44))return;
  }
};
st2[0x83]=function(){this.toEndOfStatement()}; /* DATA */
st2[0x84]=function(){var lfn=this.byte();this.need(44);this.inputFile(lfn)}; /* INPUT# */
st2[0x85]=function(){this.input();return false}; /* INPUT */
st2[0x86]=function(){ /* DIM */
  do{
    var c=this.at();if(c<65||c>90)err(E.syntax);
    var n=this.name();if(this.at()!==40)err(E.syntax);this.p++;
    var s=this.subs();if(this.arrs[n])err(E.redim);this.dim(n,s);
  }while(this.is(44));
};
st2[0x87]=function(){do{var v=this.lvalue();v.set(this.readData(v.name||''))}while(this.is(44))}; /* READ */
st2[0x88]=function(){this.let()};
st2[0x89]=function(){var n=this.lineNum();if(n<0)err(E.syntax);this.goLine(n);return false}; /* GOTO */
st2[0x8A]=function(){ /* RUN */
  if(this.v7&&(this.at()===34||this.at()===40)){this.dload(true);return false}
  var n=this.lineNum();this.clr();this.cont=null;
  if(n>=0)this.goLine(n);
  else{if(!this.prog.length){this.ready();return false}this.li=0;this.buf=this.prog[0].b;this.p=0}
  return false;
};
st2[0x8B]=function(){ /* IF */
  var v=this.expr();
  if(this.is(0x89)){ /* IF x GOTO 100 */
    if(v!==0&&v!==''){var n=this.lineNum();this.goLine(n);return false}
  }else{
    this.need(0xA7);
    if(v!==0&&v!==''){
      if(this.v7&&this.tok()===0xFE18){this.skipTok(0xFE18);return false}
      this.afterThen();return false;
    }
  }
  if(this.v7&&this.tok()===0xFE18){ /* false: past the block, to an ELSE after it if there is one */
    this.skipTok(0xFE18);this.scan(0xFE18,0xFE19,E.bend);
    var keep=this.p;while(this.at()===58)this.p++;
    if(this.tok()===0xD5){this.p++;this.elseBranch();return false}
    this.p=keep;return false;
  }
  if(this.v7&&this.findElse()){this.elseBranch();return false}
  this.toEndOfLine();return false;
};
B.elseBranch=function(){
  if(this.tok()===0xFE18){this.skipTok(0xFE18);return}
  this.afterThen();
};
st2[0x8C]=function(){ /* RESTORE */
  this.dataLi=0;this.dataP=-1;this.dataBuf=null;
  if(this.v7&&!this.end()){var n=this.int(0,63999),x=this.index(n);if(!x.hit)err(E.undef);this.dataLi=x.i}
};
st2[0x8D]=function(){ /* GOSUB */
  var n=this.lineNum();if(n<0)err(E.syntax);
  this.toEndOfStatement();var back=this.here();
  this.room('gosub');
  this.goLine(n);
  this.stack.push({t:'gosub',at:back});
  return false;
};
st2[0x8E]=function(){ /* RETURN */
  for(var i=this.stack.length-1;i>=0;i--)if(this.stack[i].t==='gosub'){var f=this.stack[i];this.stack.length=i;this.jump(f.at);return false}
  err(E.ret);
};
st2[0x8F]=function(){this.toEndOfLine()}; /* REM */
st2[0x90]=function(){ /* STOP */
  if(this.li<0){this.ready();return false}
  this.p=this.stmt;this.toEndOfStatement();this.stmt=this.p;
  this.error(E.brk);return false;
};
st2[0x91]=function(){ /* ON */
  var x=this.int(0,255),t=this.tok();
  if(t!==0x89&&t!==0x8D)err(E.syntax);this.skipTok(t);
  var L=[];do{L.push(this.lineNum())}while(this.is(44));
  if(L.some(function(n){return n<0}))err(E.syntax);
  if(x<1||x>L.length)return;
  if(t===0x89){this.goLine(L[x-1]);return false}
  this.toEndOfStatement();var back=this.here();this.room('gosub');this.goLine(L[x-1]);this.stack.push({t:'gosub',at:back});return false;
};
st2[0x92]=function(){ /* WAIT */
  var a=this.int(0,65535);this.need(44);var mask=this.byte(),x=this.is(44)?this.byte():0,self=this;
  this.need58();
  var ok=function(){return ((self.m.peek(a)^x)&mask)!==0};
  if(!ok()){this.state='wait';this.waitFor=ok;throw WAIT}
};
st2[0x93]=function(){this.load();return false}; /* LOAD */
st2[0x94]=function(){this.save()}; /* SAVE */
st2[0x95]=function(){this.verify(false)}; /* VERIFY */
st2[0x96]=function(){ /* DEF FN */
  if(this.li<0)err(E.direct);
  this.need(0xA5);var c=this.at();if(c<65||c>90)err(E.syntax);
  var n=this.name();if(/[$%]$/.test(n))err(E.syntax);this.need(40);
  if(this.at()<65||this.at()>90)err(E.syntax);
  var p=this.name();if(/[$%]$/.test(p))err(E.syntax);this.need(41);this.need(0xB2);
  this.fns[n]={param:p,buf:this.buf,p:this.p};
  this.toEndOfStatement();
};
st2[0x97]=function(){var a=this.int(0,65535);this.need(44);this.m.poke(a,this.byte())}; /* POKE */
st2[0x98]=function(){var lfn=this.byte();this.printTo(lfn)}; /* PRINT# */
st2[0x99]=function(){this.printTo(0)}; /* PRINT */
st2[0x9A]=function(){ /* CONT */
  if(this.li>=0)return;
  if(!this.cont)err(E.cont);
  this.jump(this.cont);this.cont=null;return false;
};
st2[0x9B]=function(){this.list();return false}; /* LIST */
st2[0x9C]=function(){this.clr()}; /* CLR */
st2[0x9D]=function(){var lfn=this.byte();if(!this.files[lfn])err(E.notopen);this.cmdLfn=lfn;if(this.is(44))this.printTo(lfn,true)}; /* CMD */
st2[0x9E]=function(){ /* SYS */
  var a=this.int(0,65535),R=[]; /* BASIC 7.0: then A, X, Y and the status, each a byte, any left out */
  if(this.v7)while(this.is(44)){if(R.length>3||this.end())err(E.syntax);R.push(this.at()===44?undefined:this.byte())} /* a fifth, or a comma with nothing after: ?SYNTAX ERROR */
  this.need58();
  if(this.m.sys(a,R)===false)return false;
};
st2[0x9F]=function(){this.open()}; /* OPEN */
st2[0xA0]=function(){var lfn=this.byte();this.close(lfn)}; /* CLOSE */
st2[0xA1]=function(){ /* GET, GET#, and on the C128 GETKEY */
  if(this.at()===35){this.p++;var lfn=this.byte();this.need(44);this.getFile(lfn);return}
  var key=this.v7&&this.is(0xF9);
  if(this.li<0)err(E.direct);
  var self=this,L=[];do{L.push(this.lvalue())}while(this.is(44));
  this.need58();
  var give=function(v,k){ /* a key, or nothing: "" for a string, 0 for a number, which only takes digits */
    if(/\$$/.test(v.name))v.set(k<0?'':String.fromCharCode(k));
    else if(k<0||/[:, +\-.E]/.test(String.fromCharCode(k)))v.set(0);
    else if(k>=48&&k<=57)v.set(k-48);
    else err(E.syntax);
  };
  if(key){
    var i=0;
    var poll=function(){
      while(i<L.length){var k=self.m.getKey();if(k<0)return false;give(L[i++],k)}
      return true;
    };
    if(!poll()){this.state='wait';this.waitFor=function(){try{return poll()}catch(e){if(e instanceof Err){self.state='run';self.error(e.n);return false}throw e}};throw WAIT}
    return false;
  }
  L.forEach(function(v){give(v,self.m.getKey())});
  return false;
};
st2[0xA2]=function(){this.prog=[];this.clr();this.cont=null;this.ready();return false}; /* NEW, which in a program ends it too */
st2[0xCB]=function(){ /* GO: GO TO, and on the C128 GO 64 */
  if(this.is(0xA4)){var n=this.lineNum();if(n<0)err(E.syntax);this.goLine(n);return false}
  if(!this.v7)err(E.syntax);
  var x=this.num();if(x!==64)err(E.syntax);this.need58();
  var self=this;
  if(this.li>=0){this.m.go64();throw WAIT}
  this.ask(function(yes){if(yes)self.m.go64();else self.ready()});
  return false;
};
B.ask=function(then){ /* ARE YOU SURE? in direct mode: a Y goes ahead */
  var self=this;
  this.say('ARE YOU SURE?');
  this.state='yesno';
  this.m.readLine(function(l){self.state='run';then(/^ *Y/.test(l))},true);
  throw WAIT;
};
/* ---------- PRINT ---------- */
B.printTo=function(lfn,fromCmd){
  if(lfn&&!this.files[lfn])err(E.notopen);
  var self=this,out=lfn?function(s){self.fileOut(lfn,s)}:function(s){self.out(s)};
  var toScreen=!lfn&&!this.cmdLfn||lfn&&this.files[lfn].dev===3;
  if(lfn&&!fromCmd&&!this.is(44)&&!this.end())err(E.syntax);
  if(this.v7&&this.is(0xFB)){this.printUsing(out);return}
  var last=null;
  for(;;){
    if(this.end()){if(last!==59&&last!==44)out(lfn&&this.files[lfn].sa>=128?'\r\n':'\r');return}
    var t=this.tok();
    if(t===59){this.p++;last=59;continue}
    if(t===44){this.p++;last=44;
      if(toScreen){var n=10-this.m.pos()%10;out('\u001d'.repeat(n))}else out(' ');
      continue}
    if(t===0xA3||t===0xA6){ /* TAB( SPC( */
      this.p++;var n2=this.byte();this.need(41);
      var k=t===0xA6?n2:Math.max(0,n2-(toScreen?this.m.pos():0));
      out((toScreen?'\u001d':' ').repeat(k));last=t;continue;
    }
    var v=this.expr();
    out(typeof v==='number'?(v<0?'':' ')+num(v)+(toScreen?'\u001d':' '):v); /* after a number, a cursor right on the screen */
    this.cost+=0.2;
    last=null;
  }
};
B.printUsing=function(out){ /* PRINT USING "###.##";X: the common formats */
  var f=this.str(),items=[],semi=false,bad=false;
  if(this.is(59)||this.is(44)){ /* the items go with commas; a semicolon ends the statement without a RETURN */
    for(;;){
      items.push(this.expr());
      if(this.is(44))continue;
      if(this.is(59)){if(this.end())semi=true;else bad=true}
      break;
    }
  }
  var o='',fi=0,fields=[],re=/([+-]?\$?[#,]*\.?#*(\^\^\^\^)?[+-]?)|([=>]?#+)/g;
  if(!items.length){out(f+'\r');return}
  items.forEach(function(v){
    var m=/[#=>]/.exec(f.slice(fi));
    if(!m){out(o+'\r');o='';fi=0;m=/[#=>]/.exec(f);if(!m)err(E.syntax)}
    var start=fi+m.index;
    while(start>fi&&/[+\-$]/.test(f.charAt(start-1)))start--;
    o+=f.slice(fi,start);
    var end=start;while(end<f.length&&/[#.,$+\-^=>]/.test(f.charAt(end)))end++;
    var spec=f.slice(start,end);fi=end;
    if(typeof v==='string'){
      var w=spec.length;
      if(spec.charAt(0)==='>')o+=v.slice(0,w).padStart(w);
      else if(spec.charAt(0)==='=')o+=v.slice(0,w).padStart(Math.floor((w+Math.min(w,v.length))/2)).padEnd(w);
      else o+=v.slice(0,w).padEnd(w);
      return;
    }
    var dot=spec.indexOf('.'),dec=dot<0?0:spec.slice(dot+1).replace(/[^#]/g,'').length;
    var s=Math.abs(v).toFixed(dec);if(s.charAt(0)==='0'&&dec)s=s.slice(1);
    if(spec.indexOf(',')>=0){var ip=s.split('.');ip[0]=ip[0].replace(/\B(?=(\d{3})+(?!\d))/g,',');s=ip.join('.')}
    if(spec.indexOf('$')>=0)s='$'+s;
    var sign=v<0?'-':(/^\+|\+$/.test(spec)?'+':'');
    if(/\+$|-$/.test(spec))s=s+(v<0?'-':sign?'+':' ');else s=sign+s;
    o+=s.length>spec.length?'*'.repeat(spec.length):s.padStart(spec.length);
  });
  out(o+f.slice(fi).replace(/[#=>]/g,'')+(semi||bad?'':'\r'));
  if(bad)err(E.syntax);
};
/* ---------- INPUT ---------- */
B.input=function(){
  if(this.li<0)err(E.direct);
  var prompt='';
  if(this.at()===34){prompt=this.str();this.need(59)}
  var L=[];do{L.push(this.lvalue())}while(this.is(44));
  this.need58();
  this.inputVars=L;this.inputAt=0;this.after=this.here();
  this.say(prompt+'? ');this.askInput();
};
B.askInput=function(){
  var self=this;
  this.state='input';
  this.m.readLine(function(text){self.gotInput(text)});
  throw WAIT;
};
B.items=function(text){ /* what was typed, split at commas outside quotes */
  var L=[],cur='',q=false,started=false,i=0;
  text=text.replace(/^ +/,'');
  for(;i<text.length;i++){
    var c=text.charAt(i);
    if(c==='"'&&(!started||q)){q=!q;started=true;continue}
    if(!q&&(c===','||c===':')){L.push(cur);cur='';started=false;if(c===':'){L.colon=true;break}while(text.charAt(i+1)===' ')i++;continue}
    cur+=c;started=true;
  }
  L.push(cur);
  return L;
};
B.gotInput=function(text){
  this.state='run';
  try{
    if(text===''&&this.inputAt===0){this.jump(this.after);return}
    var L=this.items(text),self=this;
    for(var i=0;i<L.length;i++){
      if(this.inputAt>=this.inputVars.length){this.say('?EXTRA IGNORED\r');break}
      var v=this.inputVars[this.inputAt],s=L[i];
      if(/\$$/.test(v.name||'')||(v.name===undefined&&typeof v.get()==='string'))v.set(s);
      else{
        var t=s.replace(/ /g,'');
        if(t!==''&&!NUMBER.test(t)&&!/^[+-]?\.?$/.test(t)){this.say('?REDO FROM START\r');this.inputAt=0;this.say('? ');this.askInput();return}
        v.set(val(t));
      }
      this.inputAt++;
    }
    if(this.inputAt<this.inputVars.length){this.say('?? ');this.askInput();return}
    this.jump(this.after);
  }catch(e){
    if(e===WAIT)return;
    if(e instanceof Err){this.error(e.n);return}
    throw e;
  }
};
/* ---------- READ and DATA ---------- */
B.readData=function(name){
  var keep=this.here();
  if(!this.nextDatum()){this.jump(keep);err(E.data)}
  var s='',c,b=this.dataBuf,p=this.dataP;
  while(p<b.length&&b[p]===32)p++;
  if(b[p]===34){p++;while(p<b.length&&b[p]!==34)s+=String.fromCharCode(b[p++]);if(p<b.length)p++;while(p<b.length&&b[p]===32)p++}
  else{while(p<b.length&&(c=b[p])!==44&&c!==58){s+=String.fromCharCode(c);p++}s=s.replace(/ +$/,'')}
  this.dataP=p;
  if(/\$$/.test(name))return s;
  var t=s.replace(/ /g,'');
  if(t!==''&&!NUMBER.test(t)){this.li=this.dataLi;this.buf=this.prog[this.dataLi].b;err(E.syntax)} /* the error is in the DATA line */
  return val(t);
};
B.nextDatum=function(){ /* the data pointer onto the next item, past commas and into the next DATA */
  var b=this.dataBuf,p=this.dataP;
  if(b&&p>=0){
    while(p<b.length&&b[p]===32)p++;
    if(b[p]===44){this.dataP=p+1;return true}
  }
  /* find the next DATA statement */
  var li=this.dataLi,q=false;
  if(!b){if(!this.prog.length)return false;b=this.prog[li].b;p=0}
  for(;;){
    while(p<b.length){
      var c=b[p];
      if(c===34){q=!q;p++;continue}
      if(!q&&c===0x83){this.dataLi=li;this.dataBuf=b;this.dataP=p+1;return true}
      if(!q&&c===0x8f){p=b.length;break}
      p++;
    }
    if(++li>=this.prog.length)return false;
    b=this.prog[li].b;p=0;q=false;
  }
};
/* ---------- LIST ---------- */
B.range=function(){ /* LIST 10-20, DELETE -50 and so on */
  var a=0,b=65535,n=this.lineNum();
  if(n>=0){a=n;b=n}
  if(this.is(0xAB)){b=65535;var m=this.lineNum();if(m>=0)b=m}
  return [a,b];
};
B.list=function(){
  var r=this.range(),self=this;
  this.need58();
  var x=this.index(r[0]).i;
  if(this.v7)this.out('\r');
  this.task=function(){
    for(var k=0;k<4;k++){
      if(self.m.stopped()){self.task=null;self.state='run';self.li=-1;self.error(E.brk);return true}
      if(x>=self.prog.length||self.prog[x].n>r[1]){if(x<self.prog.length)self.out('\r');self.ready();return true} /* stopped short of the end: one more line */
      var l=self.prog[x++];
      self.out((self.v7?'':'\r')+l.n+' '+detok(l.b,self.v7)+(self.v7?'\r':''));
    }
    return false;
  };
};
/* ---------- files ---------- */
B.fileName=function(){ /* a name: "NAME" or (A$) */
  if(this.at()===40){this.p++;var s=this.str();this.need(41);return s}
  return this.str();
};
B.open=function(){
  var lfn=this.byte(),dev=1,sa=-1,name='';
  if(this.is(44)){dev=this.int(0,30);if(this.is(44)){sa=this.int(0,255);if(this.is(44))name=this.str()}}
  if(lfn===0)err(E.syntax);
  if(this.files[lfn])err(E.open);
  if(Object.keys(this.files).length>=10)err(E.files);
  if(dev===1||dev===2||dev===4||dev===5||dev>8)err(E.device);
  if(dev===8){
    if(sa<0)sa=0;
    var s=this.m.drive.open(sa&15,name);
    if(s&&sa!==15)this.st=0;
  }
  this.files[lfn]={dev:dev,sa:dev===8?sa&15:sa};
};
B.close=function(lfn){
  var f=this.files[lfn];
  if(!f)return;
  if(f.dev===8)this.m.drive.close(f.sa);
  delete this.files[lfn];
  if(this.cmdLfn===lfn)this.cmdLfn=0;
};
B.readByte=function(f){ /* one byte from a file, setting ST */
  if(f.dev===0){var k=this.m.getKey();return k<0?13:k}
  if(f.dev===3)return 13;
  var r=this.m.drive.get(f.sa);
  if(!r){this.st=66;return 13}
  this.st=r.none?66:r.eof?64:0;
  return r.b;
};
B.getFile=function(lfn){
  var f=this.files[lfn];if(!f)err(E.notopen);
  do{
    var v=this.lvalue(),b=this.readByte(f);
    if(/\$$/.test(v.name||''))v.set(b===0?'':String.fromCharCode(b));
    else v.set(b>=48&&b<=57?b-48:0);
  }while(this.is(44));
};
B.inputFile=function(lfn){
  var f=this.files[lfn];if(!f)err(E.notopen);
  do{
    var v=this.lvalue(),s='',b,q=false;
    for(var guard=0;guard<255;guard++){
      b=this.readByte(f);
      if(b===34){q=!q;continue}
      if(!q&&(b===13||b===44))break;
      s+=String.fromCharCode(b);
      if(this.st&64)break;
    }
    if(/\$$/.test(v.name||''))v.set(s);else v.set(val(s));
  }while(this.is(44));
};
/* ---------- disk: LOAD, SAVE and BASIC 7.0's D commands ---------- */
B.deviceArgs=function(){ /* ,8 ,1 after LOAD; D0, U8 after the D commands */
  var dev=1,sa=0;
  if(this.is(44)){dev=this.int(0,30);if(this.is(44))sa=this.byte()}
  return {dev:dev,sa:sa};
};
B.dArgs=function(){
  var dev=8;
  while(this.is(44)){
    var c=this.at();
    if(c===68){this.p++;this.int(0,1)}
    else if(c===85){this.p++;dev=this.int(4,30)}
    else if(c===0xB0){this.p++;this.int(4,30)}
    else err(E.syntax);
  }
  if(dev!==8)err(E.device);
  return dev;
};
B.load=function(){ /* LOAD: the tape unless a device is given, on both machines */
  var name='',dev=1;
  if(!this.end()){name=this.fileName();dev=this.deviceArgs().dev}
  if(!this.end())err(E.syntax);
  if(dev===1){this.tape();return}
  if(dev!==8){if(this.li<0)this.say('\rSEARCHING FOR '+name);err(E.device)}
  if(!name)err(E.noname);
  this.diskLoad(name,name,false,false);
};
B.tape=function(){
  if(this.li<0)this.say('\rPRESS PLAY ON TAPE');
  this.state='wait';this.waitFor=function(){return false};
  throw WAIT;
};
B.diskLoad=function(name,shown,run,quietly){ /* SEARCHING FOR, LOADING, and the program replaces this one */
  var self=this,direct=this.li<0,drive=this.m.drive,t0=this.m.ms();
  if(direct&&!quietly)this.say('\rSEARCHING FOR '+shown);
  this.state='wait';
  var stage=0;
  this.waitFor=function(){
    if(stage===0){if(self.m.ms()-t0<350)return false;stage=1;
      var u=drive.load(name);
      if(!u){self.state='run';self.li=direct?-1:self.li;self.error(E.notfound);return false}
      self.got=u;if(direct&&!quietly)self.say('\rLOADING');t0=self.m.ms();return false}
    if(self.m.ms()-t0<120+C.blocks({data:self.got})*30)return false;
    self.loadPrg(self.got);self.got=null;
    if(run||direct)self.clr();
    if(run){self.state='run';if(!self.prog.length){self.ready();return false}self.li=0;self.buf=self.prog[0].b;self.p=0;if(!quietly)self.say('\r');return false}
    if(direct){self.ready();return false}
    self.li=0;self.buf=self.prog.length?self.prog[0].b:[];self.p=0;self.stack=[];self.state='run'; /* LOAD in a program runs the new one, keeping the variables */
    self.dataLi=0;self.dataP=-1;self.dataBuf=null;
    return true;
  };
  throw WAIT;
};
B.save=function(){
  var name='',d={dev:this.v7?8:1};
  if(!this.end()){name=this.fileName();d=this.deviceArgs()}
  this.need58();
  if(d.dev===1){this.tape();return}
  if(d.dev!==8)err(E.device);
  if(!name)err(E.noname);
  this.diskSave(name,name);
};
B.diskSave=function(name,shown){
  var direct=this.li<0,m=/^@(?:[01]?:)?(.*)$/.exec(name),self=this,t0=this.m.ms();
  if(direct)this.say('\rSAVING '+shown);
  var u=this.prg();
  this.state='wait';
  this.waitFor=function(){
    if(self.m.ms()-t0<300+C.blocks({data:u})*40)return false;
    var p=self.m.drive.parse(m?m[1]:name);
    self.m.drive.write(p.name,'PRG',u,!!m);
    return true;
  };
  throw WAIT;
};
B.verify=function(d7){
  var name=d7?this.fileName():this.end()?'':this.fileName();
  if(d7)this.dArgs();else{var d=this.deviceArgs();if(d.dev===1){this.tape();return}if(d.dev!==8)err(E.device)}
  this.need58();
  var direct=this.li<0;
  if(direct)this.say('\rSEARCHING FOR '+(d7?'0:':'')+name);
  var u=this.m.drive.load(name);
  if(!u)err(E.notfound);
  if(direct)this.say('\rVERIFYING');
  var mine=this.prg(),same=u.length===mine.length;
  for(var i=2;same&&i<u.length;i++)if(u[i]!==mine[i]&&!(i<4))same=false;
  if(!same)err(E.verify);
  if(direct)this.say('\rOK\r');
};
B.dload=function(run){
  var name=this.fileName();this.dArgs();this.need58();
  this.diskLoad(name,'0:'+name,run,false);
};
/* ---------- statements: BASIC 7.0 ---------- */
var st7={};
st7[0xD5]=function(){ /* ELSE, reached from THEN: the rest of the line is not for us */
  if(this.tok()===0xFE18){this.skipTok(0xFE18);this.scan(0xFE18,0xFE19,E.bend);return false}
  this.toEndOfLine();return false;
};
st7[0xD6]=function(){ /* RESUME */
  if(!this.resumeAt||this.trap0===undefined||this.trap0===null)err(E.resume);
  var at=this.resumeAt;this.trap=this.trap0;this.trap0=null;this.resumeAt=null;
  if(this.is(0x82)){this.jump(at);this.toEndOfStatement();return false}
  var n=this.lineNum();
  if(n>=0){this.goLine(n);return false}
  this.jump(at);return false;
};
st7[0xD7]=function(){var n=this.end()?-1:this.int(0,65535);this.trap=n<0?null:n}; /* TRAP */
st7[0xD8]=function(){this.trace=true};st7[0xD9]=function(){this.trace=false};
st7[0xDA]=function(){ /* SOUND voice,freq,dur[,dir,min,sweep,wave,pulse] */
  var v=this.int(1,3);this.need(44);var f=this.int(0,65535);this.need(44);var d=this.int(0,32767),a=[0,0,0,2,2048];
  for(var i=0;i<5&&this.is(44);i++)if(this.at()!==44&&!this.end())a[i]=this.int(0,65535);
  this.need58();
  var self=this,go=function(){ /* a voice still sounding is waited for, as the real one waits */
    var now=self.m.ms(),E0=self.voiceEnd=self.voiceEnd||[0,0,0,0];
    if(now<E0[v])return false;
    E0[v]=now+d*1000/60;self.m.sound(v,f*0.0609594,d/60,a[3],self.volume);return true;
  };
  if(!go()){this.state='wait';this.waitFor=go;throw WAIT}
};
st7[0xDB]=function(){this.volume=this.int(0,15)}; /* VOL */
st7[0xDC]=function(){this.autoStep=this.end()?0:this.int(0,63999)}; /* AUTO */
st7[0xDD]=function(){this.str()}; /* PUDEF */
st7[0xDE]=function(){ /* GRAPHIC */
  if(this.is(0x9C)){this.need58();return}
  var mode=this.int(0,5);
  if(this.is(44)&&!this.end())this.int(0,1);
  if(this.is(44))this.int(0,24);
  if(mode>=1&&mode<=4)err(E.unimpl);
  this.m.graphic(mode);
};
var noArea=function(){this.toEndOfStatement();err(E.graphics)};
[0xDF,0xE1,0xE2,0xE3,0xE4,0xE5,0xE6,0xE9].forEach(function(t){st7[t]=noArea}); /* PAINT BOX CIRCLE GSHAPE SSHAPE DRAW LOCATE SCALE */
st7[0xE0]=function(){ /* CHAR colour,column,row,"text"[,reverse] */
  var src=this.int(0,1);this.need(44);var x=this.int(0,79);this.need(44);var y=this.int(0,24),s='',rv=0;
  if(this.is(44)){var v=this.expr();s=typeof v==='string'?v:num(v);if(this.is(44))rv=this.int(0,1)}
  this.m.char(x,y,s,rv);
};
st7[0xE7]=function(){var s=this.int(0,6);this.need(44);var c=this.int(1,16);this.m.color(s,c-1)}; /* COLOR */
st7[0xE8]=function(){this.out('\u0093')}; /* SCNCLR */
st7[0xEA]=function(){ /* HELP: the line of the last error, from the statement that failed */
  var x=this.errLine&&this.index(this.errLine.n);
  if(!x||!x.hit){this.m.help();return}
  var l=this.prog[x.i],t=detok(l.b.slice(0,this.errLine.at),true),u=detok(l.b.slice(this.errLine.at),true);
  this.say('\r'+l.n+' '+t+'\u0012'+u+'\u0092\r');
};
st7[0xEB]=function(){ /* DO */
  var at=this.here();at.p=this.stmt;
  if(this.is(0xFD)){if(!this.truth()){this.scan(0xEB,0xEC,E.loopnf);this.skipCond();return false}}
  else if(this.is(0xFC)){if(this.truth()){this.scan(0xEB,0xEC,E.loopnf);this.skipCond();return false}}
  this.room('do');
  this.stack.push({t:'do',at:at});
};
B.truth=function(){var v=this.expr();return v!==0&&v!==''};
B.skipCond=function(){if(this.is(0xFD)||this.is(0xFC))this.expr()};
B.doAt=function(){ /* the DO that LOOP and EXIT close, past any FOR inside it */
  var i=this.stack.length-1;
  while(i>=0&&this.stack[i].t==='for')i--;
  if(i<0||this.stack[i].t!=='do')err(E.loopwo);
  return i;
};
st7[0xEC]=function(){ /* LOOP */
  var i=this.doAt(),f=this.stack[i],again=true;
  if(this.is(0xFD))again=this.truth();else if(this.is(0xFC))again=!this.truth();
  this.need58();
  this.stack.length=i;
  if(again){this.jump(f.at)}
  return false;
};
st7[0xED]=function(){ /* EXIT */
  this.stack.length=this.doAt();
  this.scan(0xEB,0xEC,E.loopnf);this.skipCond();
};
st7[0xEE]=function(){this.directory();return false}; /* DIRECTORY */
st7[0xEF]=function(){var n=this.fileName();this.dArgs();this.need58();this.diskSave(n,'0:'+n.replace(/^@/,'@0:'))}; /* DSAVE */
st7[0xF0]=function(){this.dload(false);return false}; /* DLOAD */
st7[0xF1]=function(){ /* HEADER "NAME",Iid */
  var n=this.fileName(),id='',self=this;
  while(this.is(44)){if(this.at()===73){this.p++;id=b2s(this.buf,this.p,this.p+2);this.p+=2}else if(this.at()===68){this.p++;this.int(0,1)}else if(this.at()===85){this.p++;this.int(8,8)}else err(E.syntax)}
  this.need58();
  if(this.li<0){this.ask(function(y){if(y)self.m.drive.header(n,id);self.ready()});return false}
  this.m.drive.header(n,id);
};
st7[0xF2]=function(){ /* SCRATCH */
  var n=this.fileName(),self=this;this.dArgs();this.need58();
  var go=function(){self.m.drive.scratch([n]);if(self.li<0)self.say('\r'+self.m.drive.ds()+'\r')};
  if(this.li<0){this.ask(function(y){if(y)go();self.ready()});return false}
  go();
};
st7[0xF3]=function(){this.dArgs();this.m.drive.set(0)}; /* COLLECT */
st7[0xF4]=function(){var a=this.fileName();this.need(0xA4);var b=this.fileName();this.dArgs();this.m.drive.copy(b,a)}; /* COPY */
st7[0xF5]=function(){var a=this.fileName();this.need(0xA4);var b=this.fileName();this.dArgs();this.m.drive.rename(b,a)}; /* RENAME */
st7[0xF6]=function(){this.toEndOfStatement();err(E.device)}; /* BACKUP: there is one drive */
st7[0xF7]=function(){ /* DELETE */
  var r=this.range();this.need58();
  this.prog=this.prog.filter(function(l){return l.n<r[0]||l.n>r[1]});this.clr();this.cont=null;
};
st7[0xF8]=function(){ /* RENUMBER [new[,inc[,old]]] */
  var start=10,inc=10,old=0;
  if(!this.end()&&this.at()!==44)start=this.int(0,63999);
  if(this.is(44)){if(this.at()!==44)inc=this.int(1,63999);if(this.is(44))old=this.int(0,63999)}
  this.need58();
  if(this.li>=0)err(E.directonly);
  this.renumber(start,inc,old);
};
st7[0xF9]=function(){ /* KEY */
  if(this.end()){
    for(var i=0;i<8;i++){
      var k=this.keys[i],s='KEY '+(i+1)+',"',q=true;
      for(var j=0;j<k.length;j++){var c=k.charCodeAt(j);if(c===13||c===34){s+=(q?'"':'')+'+CHR$('+c+')';q=false}else{s+=(q?'':'+"')+k.charAt(j);q=true}}
      this.out(s+(q?'"':'')+'\r');
    }
    return;
  }
  var n=this.int(1,8);this.need(44);this.keys[n-1]=this.str();
};
st7[0xFA]=function(){this.monitor();return false}; /* MONITOR */
st7[0xFC]=st7[0xFD]=function(){err(E.syntax)};
st7[0xFE02]=function(){this.byte()}; /* BANK */
st7[0xFE03]=function(){this.toEndOfStatement()}; /* FILTER */
st7[0xFE04]=function(){this.play(this.str());return false}; /* PLAY */
st7[0xFE05]=function(){this.tempo=this.int(0,255)}; /* TEMPO */
[0xFE06,0xFE07,0xFE08,0xFE0A,0xFE17,0xFE1A,0xFE1C,0xFE16].forEach(function(t){st7[t]=function(){this.toEndOfStatement()}}); /* sprites, ENVELOPE, COLLISION, WINDOW, WIDTH: taken, and not shown */
st7[0xFE09]=function(){do{this.lvalue().set(0)}while(this.is(44))}; /* RREG */
st7[0xFE0B]=function(){ /* SLEEP */
  var s=this.int(0,65535),t=this.m.ms()+s*1000,self=this;this.need58();
  this.state='wait';this.waitFor=function(){return self.m.ms()>=t};throw WAIT;
};
st7[0xFE0C]=function(){this.directory();return false}; /* CATALOG */
st7[0xFE0D]=function(){ /* DOPEN#lfn,"NAME"[,W] */
  this.need(35);var lfn=this.byte();this.need(44);var n=this.fileName(),w=false;
  while(this.is(44)){var c=this.at();if(c===87){this.p++;w=true}else if(c===68){this.p++;this.int(0,1)}else if(c===85){this.p++;this.int(8,8)}else if(c===76){this.p++;this.byte()}else err(E.syntax)}
  this.dOpen(lfn,n+(w?',S,W':',S,R'));
};
st7[0xFE0E]=function(){this.need(35);var lfn=this.byte();this.need(44);var n=this.fileName();this.dArgs();this.dOpen(lfn,n+',S,A')}; /* APPEND */
B.dOpen=function(lfn,spec){ /* DOPEN and APPEND: the first channel free on the drive */
  if(this.files[lfn])err(E.open);
  if(Object.keys(this.files).length>=10)err(E.files);
  var used={},sa=2;for(var k in this.files)if(this.files[k].dev===8)used[this.files[k].sa]=1;
  while(used[sa])sa++;
  if(sa>14)err(E.files);
  this.m.drive.open(sa,spec);
  this.files[lfn]={dev:8,sa:sa};
};
st7[0xFE0F]=function(){ /* DCLOSE */
  if(this.is(35)){this.close(this.byte());return}
  var self=this;Object.keys(this.files).forEach(function(k){if(self.files[k].dev===8)self.close(+k)});
};
st7[0xFE10]=st7[0xFE11]=function(){this.toEndOfStatement();err(E.unimpl)}; /* BSAVE, BLOAD: no machine code here */
st7[0xFE12]=function(){this.toEndOfStatement()}; /* RECORD */
st7[0xFE13]=function(){this.toEndOfStatement()}; /* CONCAT */
st7[0xFE14]=function(){this.verify(true)}; /* DVERIFY */
st7[0xFE15]=function(){this.m.drive.closeAll();this.m.drive.set(0)}; /* DCLEAR */
st7[0xFE18]=function(){}; /* BEGIN, run into from THEN */
st7[0xFE19]=function(){}; /* BEND */
st7[0xFE1B]=function(){this.toEndOfStatement();this.m.boot();throw WAIT}; /* BOOT */
st7[0xFE1D]=st7[0xFE1E]=st7[0xFE24]=function(){this.toEndOfStatement();err(E.unimpl)}; /* SPRDEF QUIT OFF */
st7[0xFE1F]=st7[0xFE21]=st7[0xFE23]=function(){this.toEndOfStatement()}; /* STASH FETCH SWAP: no expansion unit */
st7[0xFE25]=function(){this.m.fast(true)};st7[0xFE26]=function(){this.m.fast(false)};
B.st2=st2;B.st7=st7;
/* ---------- DIRECTORY, a line at a time ---------- */
B.directory=function(){
  var pat='';
  if(this.at()===34||this.at()===40)pat=this.fileName();
  this.dArgs();this.need58();
  var L=this.m.drive.dirLines(pat.replace(/^[01]?:/,'')),i=0,self=this;
  this.task=function(){
    if(self.m.stopped()){self.task=null;self.error(E.brk);return true}
    if(i>=L.length){if(self.li<0){self.ready()}return true}
    var l=L[i++];
    self.out(l[0]+' '+l[1]+(i===1?'\u0092':'')+'\r');
    return false;
  };
};
/* ---------- PLAY: notes, a voice at a time ---------- */
B.play=function(s){
  var o=4,dur=0.25,t=0,self=this,whole=16/Math.max(1,this.tempo||8)*0.94,vol=this.volume,voice=1,acc=0,dot=false,wave=0;
  for(var i=0;i<s.length;i++){
    var c=s.charAt(i).toUpperCase();
    if(c==='V'){voice=+s.charAt(++i)||1;continue}
    if(c==='O'){o=+s.charAt(++i)||0;continue}
    if(c==='T'){wave=+s.charAt(++i)||0;continue}
    if(c==='U'){var u=/^\d+/.exec(s.slice(i+1));if(u){vol=+u[0];i+=u[0].length}continue}
    if(c==='X'){i++;continue}
    if(c==='M')continue;
    var d={W:1,H:.5,Q:.25,I:.125,S:.0625}[c];
    if(d){dur=d;continue}
    if(c==='.'){dot=true;continue}
    if(c==='#'){acc=1;continue}
    if(c==='$'){acc=-1;continue}
    if(c==='R'){t+=whole*dur*(dot?1.5:1);dot=false;continue}
    if(NOTES.hasOwnProperty(c)){
      var semi=NOTES[c]+acc+12*(o-4),hz=261.63*Math.pow(2,semi/12),len=whole*dur*(dot?1.5:1);
      this.m.sound(voice,hz,len,wave,vol,t);t+=len;acc=0;dot=false;
    }
  }
  var end=this.m.ms()+t*1000;
  this.state='wait';this.waitFor=function(){return self.m.ms()>=end};
  throw WAIT;
};
/* ---------- RENUMBER ---------- */
B.renumber=function(start,inc,old){
  var map={},n=start,self=this;
  this.prog.forEach(function(l){if(l.n>=old){map[l.n]=n;n+=inc}});
  if(n-inc>63999)err(E.toolarge);
  var refs=[0x89,0x8D,0xA7,0x8A,0x8C,0xD5,0xD6,0xD7,0x9B,0xF7]; /* GOTO GOSUB THEN RUN RESTORE ELSE RESUME TRAP LIST DELETE */
  var missing=false;
  this.prog.forEach(function(l){
    var b=l.b,o=[],q=false,i=0;
    while(i<b.length){
      var c=b[i];o.push(c);i++;
      if(c===34){q=!q;continue}
      if(q)continue;
      if(c===0x8f){while(i<b.length)o.push(b[i++]);break}
      var go=refs.indexOf(c)>=0||c===0xA4&&o.length>1&&o[o.length-2]===0xCB;
      if(!go)continue;
      for(;;){
        while(i<b.length&&b[i]===32)o.push(b[i++]);
        var s='';while(i<b.length&&b[i]>=48&&b[i]<=57)s+=String.fromCharCode(b[i++]);
        if(s===''){break}
        var v=parseInt(s,10),w=map.hasOwnProperty(v)?map[v]:v;
        if(!map.hasOwnProperty(v)&&v>=old)missing=true;
        String(w).split('').forEach(function(ch){o.push(ch.charCodeAt(0))});
        while(i<b.length&&b[i]===32)o.push(b[i++]);
        if(b[i]===44){o.push(44);i++;continue}
        if(c===0x9B||c===0xF7){if(b[i]===0xAB){o.push(0xAB);i++;continue}}
        break;
      }
    }
    l.b=o;
  });
  this.prog.forEach(function(l){if(l.n>=old)l.n=map[l.n]});
  this.prog.sort(function(a,b){return a.n-b.n});
  this.clr();this.cont=null;
  if(missing)err(E.undef);
};
/* ---------- the machine language monitor: enough to look and leave ---------- */
var REGS='    PC  SR AC XR YR SP\r; FB000 00 00 00 00 F8\r';
B.monitor=function(){
  this.say('\rMONITOR\r'+REGS);
  this.monLoop();
};
B.monLoop=function(){
  var self=this;
  this.state='monitor';
  this.m.readLine(function(l){
    l=l.replace(/^[ .>]+/,'');
    var m=/^M *([0-9A-F]{1,5})(?: +([0-9A-F]{1,5}))?/.exec(l);
    if(/^X/.test(l)){self.state='run';self.li=-1;self.ready();return}
    if(m){
      var a=parseInt(m[1],16)&0xffff,e=m[2]?parseInt(m[2],16)&0xffff:a+95;
      for(var r=0;r<12&&a<=e;r++){
        var h=[],t='';
        for(var i=0;i<8;i++){var v=self.m.peek((a+i)&0xffff);h.push(v.toString(16).toUpperCase().padStart(2,'0'));t+=v>=32&&v<128?String.fromCharCode(v):'.'}
        self.say('>'+(a).toString(16).toUpperCase().padStart(5,'0')+' '+h.join(' ')+':'+t+'\r');a+=8;
      }
    }
    else if(/^R/.test(l))self.say(REGS);
    else if(l.trim())self.say('?\r');
    self.monLoop();
  });
};
C.Basic=Basic;C.crunch=crunch;C.linked=linked;C.E=E;C.WAIT=WAIT;
})(window.Phosphor);
