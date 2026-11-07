/* PHOSPHOR-9 terminal: machine "trs80-1981", the Model III's BASIC: Level II in the ROM, and Disk BASIC on top of
   it once TRSDOS has loaded it. A new interpreter, written for this terminal on the pattern of the Apple IIe's
   Applesoft one (machines/apple2-1984/basic.js), to behave as the Model III's does: its keywords, its LIST, its
   three kinds of number and its messages, checked against a Model III in the xtrs and MAME emulators. No Microsoft
   or Tandy code is in it.
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE.

   Single precision is a 24-bit mantissa, which is what Math.fround keeps; double precision is a JavaScript number
   wrapped in Dbl, so its last digit can differ from the real 56-bit one. Integers are numbers kept whole.
   Spaces are kept as typed, so LIST shows a line as it was entered, as Level II does. */
(function(P){
'use strict';
var KW=['END','FOR','RESET','SET','CLS','CMD','RANDOM','NEXT','DATA','INPUT','DIM','READ','LET','GOTO','RUN','IF',
'RESTORE','GOSUB','RETURN','REM','STOP','ELSE','TRON','TROFF','DEFSTR','DEFINT','DEFSNG','DEFDBL','LINE','EDIT',
'ERROR','RESUME','OUT','ON','OPEN','FIELD','GET','PUT','CLOSE','LOAD','MERGE','NAME','KILL','LSET','RSET','SAVE',
'SYSTEM','LPRINT','DEF','POKE','PRINT','CONT','LIST','LLIST','DELETE','AUTO','CLEAR','CLOAD','CSAVE','NEW','TAB(',
'TO','FN','USING','VARPTR','USR','ERL','ERR','STRING$','INSTR','POINT','TIME$','MEM','INKEY$','THEN','NOT','STEP',
'+','-','*','/','[','AND','OR','>','=','<','SGN','INT','ABS','FRE','INP','POS','SQR','RND','LOG','EXP','COS','SIN',
'TAN','ATN','PEEK','CVI','CVS','CVD','EOF','LOC','LOF','MKI$','MKS$','MKD$','CINT','CSNG','CDBL','FIX','LEN','STR$',
'VAL','ASC','CHR$','LEFT$','RIGHT$','MID$',"'"];
var T={};KW.forEach(function(k,i){T[k]=0x80+i});
var BYLEN=KW.map(function(k,i){return [k,0x80+i]}).sort(function(a,b){return b[0].length-a[0].length});
/* the error numbers ERROR and ERR use, the Level II ROM's two letters, and Disk BASIC's words */
var ERR={NF:[1,'NEXT without FOR'],SN:[2,'Syntax Error'],RG:[3,'RETURN without GOSUB'],OD:[4,'Out of DATA'],
  FC:[5,'Illegal function call'],OV:[6,'Overflow'],OM:[7,'Out of memory'],UL:[8,'Undefined line number'],
  BS:[9,'Subscript out of range'],DD:[10,'Redimensioned array'],'/0':[11,'Division by zero'],ID:[12,'Illegal direct'],
  TM:[13,'Type mismatch'],OS:[14,'Out of string space'],LS:[15,'String too long'],ST:[16,'String formula too complex'],
  CN:[17,"Can't Continue"],NR:[18,'No RESUME'],RW:[19,'RESUME without error'],UE:[20,'Unprintable error'],
  MO:[21,'Missing operand'],FD:[22,'BAD File Data'],L3:[23,'Disk Basic Feature'],
  FNF:[54,'File not found'],BN:[65,'Bad file name'],DF:[62,'Disk full'],BFM:[55,'Bad file mode'],DNR:[58,'Disk I/O error']};
var BYNUM={};Object.keys(ERR).forEach(function(k){BYNUM[ERR[k][0]]=k});
function E(k){throw {basic:k}}
var MAXF=1.701411733e38;
var DISKONLY={}; /* Level II without the disk: these are ?L3 */
['CMD','OPEN','FIELD','GET','PUT','CLOSE','LOAD','MERGE','NAME','KILL','LSET','RSET','SAVE','DEF','LINE','INSTR',
 'CVI','CVS','CVD','EOF','LOC','LOF','MKI$','MKS$','MKD$'].forEach(function(k){DISKONLY[T[k]]=1});

/* ---------- numbers ---------- */
function Dbl(v){this.v=v}
function isD(x){return x instanceof Dbl}
function v(x){return isD(x)?x.v:x}
function fr(x){ /* to single precision */
  if(x===0||x!==x)return 0;
  if(Math.abs(x)>=MAXF)E('OV');
  var r=Math.fround(x);
  if(Math.abs(r)<2.938735877e-39)return 0;
  return r;
}
function dr(x){if(!isFinite(x)||Math.abs(x)>=MAXF)E('OV');return new Dbl(x)}
function num2(a,b,f){ /* an operation on two numbers, in the wider of their precisions */
  if(isD(a)||isD(b))return dr(f(v(a),v(b)));
  return fr(f(a,b));
}
function digits(x,n){ /* x to n significant digits: [digit string without trailing zeros, decimal exponent].
  Sixteen are rounded from seventeen, which comes nearer the Model III's 56 bits than binary64 alone does */
  var t=x.toExponential(n===16?16:n-1).split('e'),d=t[0].replace('.',''),e=+t[1];
  if(n===16){
    var up=+d.charAt(16)>=5;d=d.slice(0,16);
    if(up){var a=d.split('').map(Number),i=15;while(i>=0){if(a[i]<9){a[i]++;break}a[i]=0;i--}if(i<0){a.unshift(1);a.pop();e++}d=a.join('')}
  }
  d=d.replace(/0+$/,'');
  return [d||'0',e];
}
function fmt(x,dbl){ /* PRINT's way: six digits single, sixteen double; E or D outside .01 to the digits' reach */
  if(x===0)return '0';
  var sg=x<0?'-':'',n=dbl?16:6,q=digits(Math.abs(x),n),d=q[0],e=q[1];
  if(e>=n||e<-2){
    var ex=Math.abs(e);
    return sg+d.charAt(0)+(d.length>1?'.'+d.slice(1):'')+(dbl?'D':'E')+(e<0?'-':'+')+(ex<10?'0':'')+ex;
  }
  if(e<0)return sg+'.'+'0'.repeat(-e-1)+d;
  var ip=d.slice(0,e+1),fp=d.slice(e+1);
  while(ip.length<e+1)ip+='0';
  return sg+ip+(fp?'.'+fp:'');
}
function numStr(x){var n=v(x),t=fmt(n,isD(x));return n<0?t:' '+t}
var seed=0x3B9ACA07; /* RND: this interpreter's own generator; RANDOM reseeds it from the clock */
function rnd01(){seed=(seed*1103515245+12345)%2147483648;return seed/2147483648}

/* ---------- the line cruncher: keywords to tokens, spaces kept ---------- */
function parse(s){
  var o=[],i=0,n=s.length,data=false;
  while(i<n){
    var c=s.charAt(i),cc=s.charCodeAt(i);
    if(c==='"'){o.push(34);i++;while(i<n&&s.charAt(i)!=='"'){o.push(s.charCodeAt(i)&255);i++}if(i<n){o.push(34);i++}continue}
    if(data){o.push(cc&255);if(c===':')data=false;i++;continue}
    if(c==='?'){o.push(T.PRINT);i++;continue}
    if(c>='a'&&c<='z'){c=c.toUpperCase();cc-=32}
    if(!/[A-Z+\-*\/\[><='(]/.test(c)){o.push(cc&255);i++;continue}
    var hit=0,len=0,up=s.slice(i,i+8).toUpperCase();
    for(var k=0;k<BYLEN.length;k++){if(up.indexOf(BYLEN[k][0])===0){hit=BYLEN[k][1];len=BYLEN[k][0].length;break}}
    if(!hit){o.push(cc&255);i++;continue}
    if(hit===T["'"]){o.push(58,T.REM,hit);i++;for(;i<n;i++)o.push(s.charCodeAt(i)&255);break}
    o.push(hit);i+=len;
    if(hit===T.DATA)data=true;
    if(hit===T.REM){for(;i<n;i++)o.push(s.charCodeAt(i)&255)}
    if(hit===T.ELSE&&o.length>1&&o[o.length-2]!==58){o.splice(o.length-1,0,58)} /* ELSE is kept as :ELSE */
  }
  return o;
}
function listText(t){ /* a crunched line spelled out, as LIST shows it */
  var s='';
  for(var i=0;i<t.length;i++){
    var c=t[i];
    if(c===58&&(t[i+1]===T.ELSE||t[i+1]===T.REM&&t[i+2]===T["'"]))continue;
    if(c===T.REM&&t[i+1]===T["'"])continue;
    s+=c>=0x80?KW[c-0x80]:String.fromCharCode(c);
  }
  return s;
}

P.trsBasic=function(M,disk){ /* M: the machine around it; disk: Disk BASIC (true) or Level II alone */
var prog=[],byNum={},vars={},arrays={},fns={},stack=[],data=null,deftype={};
var cur=null,line=-1,pos=0,running=false,cont=null,trace=false,onerr=null,errLine=0,errCode=0,errAt=null,inErr=false;
var want=null,listing=null,spent=0,strSpace=50,memTop=disk?38202:48312;
function reindex(){byNum={};prog.forEach(function(L,i){byNum[L.n]=i})}
function find(n){if(byNum[n]===undefined)E('UL');return byNum[n]}
function progSize(){return prog.reduce(function(a,L){return a+5+L.t.length},2)}
function varSize(){
  var n=Object.keys(vars).length*8;
  Object.keys(arrays).forEach(function(k){var A=arrays[k];n+=6+2*A.dims.length+A.v.length*sizeOf(k)});
  return n;
}
function sizeOf(n){var t=typeOf(n);return t==='%'?2:t==='$'?3:t==='#'?8:4}
function fre(){return memTop-strSpace-progSize()-varSize()}
function strUsed(){
  var s=0;
  Object.keys(vars).forEach(function(k){if(isStr(k))s+=vars[k].length});
  Object.keys(arrays).forEach(function(k){if(isStr(k))arrays[k].v.forEach(function(x){s+=x.length})});
  return s;
}

/* ---------- reading the line ---------- */
function at(){while(cur&&pos<cur.length&&(cur[pos]===32||cur[pos]===10))pos++;return cur&&pos<cur.length?cur[pos]:0}
function next(){pos++;return at()}
function eat(t){if(at()!==t)E('SN');next()}
function endStmt(){var c=at();return c===0||c===58}
function isDigit(c){return c>=48&&c<=57}
function isAlpha(c){return c>=65&&c<=90}
function number(){ /* a constant: its digits and its mark say single, double or integer */
  var s='',c=at(),dbl=false,nd=0,exp=false;
  if(c===38){ /* &H hex is not Level II's; fall through as syntax */ E('SN')}
  while(isDigit(c)||c===46){s+=String.fromCharCode(c);if(isDigit(c)&&(nd||c!==48))nd++;pos++;c=cur[pos]||0}
  if(c===69||c===68){
    var save=pos,e='e';pos++;c=cur[pos]||0;
    if(c===T['-']||c===45){e+='-';pos++;c=cur[pos]||0}else if(c===T['+']||c===43){pos++;c=cur[pos]||0}
    var dg='';while(isDigit(c)){dg+=String.fromCharCode(c);pos++;c=cur[pos]||0}
    if(cur[save]===68)dbl=true;
    s+=e+(dg||'0');exp=true;
  }
  if(c===35){dbl=true;pos++}else if(c===33){dbl=false;nd=0;pos++}else if(c===37){pos++;var iv=parseFloat(s.charAt(0)==='.'?'0'+s:s)||0;if(iv>32767)E('OV');return Math.floor(iv)}
  if(nd>7)dbl=true;
  var x=s==='.'?0:parseFloat(s.charAt(0)==='.'?'0'+s:s)||0;
  at();
  return dbl?dr(x):fr(x);
}
function lineNum(){
  var c=at(),v0=0,any=false;
  while(isDigit(c)){v0=v0*10+c-48;any=true;if(v0>65529)E('SN');c=next()}
  return any?v0:-1;
}
function name(){ /* two letters count, the rest are skipped; the mark, or what DEF made of the first letter */
  var c=at();
  if(!isAlpha(c))E('SN');
  var n=String.fromCharCode(c),f=n;pos++;c=sp();
  if(isAlpha(c)||isDigit(c)){n+=String.fromCharCode(c);pos++;c=sp()}
  while(isAlpha(c)||isDigit(c)){pos++;c=sp()}
  if(c===36||c===37||c===33||c===35){n+=String.fromCharCode(c);pos++}
  else n+=deftype[f]||'!';
  at();
  return n;
}
function sp(){while(cur[pos]===32)pos++;return cur[pos]||0} /* blanks inside a name don't count */
function typeOf(n){return n.charAt(n.length-1)}
function isStr(n){return typeOf(n)==='$'}
function zero(n){var t=typeOf(n);return t==='$'?'':t==='#'?new Dbl(0):0}
function cint(x){x=Math.floor(v(x));if(x<-32768||x>32767)E('OV');return x}
function conv(n,val){ /* a value made fit for a variable of this type */
  var t=typeOf(n);
  if(t==='$'){if(typeof val!=='string')E('TM');return val}
  if(typeof val==='string')E('TM');
  if(t==='%')return cint(val);
  if(t==='#')return isD(val)?val:new Dbl(val);
  return fr(v(val));
}
function ref(){
  var n=name();
  if(at()===40){
    next();
    var ix=[];
    do{ix.push(cint(num()))}while(at()===44&&next()!==null);
    eat(41);
    var A=arrays[n];
    if(!A)A=arrays[n]=mkArray(n,ix.map(function(){return 10}));
    if(A.dims.length!==ix.length)E('BS');
    var off=0;
    for(var i=0;i<ix.length;i++){if(ix[i]<0||ix[i]>A.dims[i])E('BS');off=off*(A.dims[i]+1)+ix[i]}
    return {name:n,get:function(){return A.v[off]},set:function(x){A.v[off]=x}};
  }
  return {name:n,get:function(){return has(vars,n)?vars[n]:zero(n)},set:function(x){vars[n]=x}};
}
function has(o,k){return Object.prototype.hasOwnProperty.call(o,k)}
function mkArray(n,d){
  var size=d.reduce(function(a,x){return a*(x+1)},1);
  if(fre()-(6+2*d.length+size*sizeOf(n))<0)E('OM');
  var z=zero(n),a=new Array(size);for(var i=0;i<size;i++)a[i]=z;
  return {dims:d,v:a};
}
function assign(r,val,lit){
  var x=conv(r.name,val);
  if(isStr(r.name)&&!lit){var old=r.get()||'';if(strUsed()-old.length+x.length>strSpace)E('OS')}
  r.set(x);
}

/* ---------- expressions ---------- */
function num(){var x=expr();if(typeof x==='string')E('TM');return x}
function str(){var x=expr();if(typeof x!=='string')E('TM');return x}
var depth=0,lastLit=false;
function expr(){depth++;try{if(depth>30)E('ST');return orx()}finally{depth--}}
function orx(){var a=andx();while(at()===T.OR){next();var b=andx();a=cint(n2(a))|cint(n2(b))}return a}
function andx(){var a=notx();while(at()===T.AND){next();var b=notx();a=cint(n2(a))&cint(n2(b))}return a}
function notx(){if(at()===T.NOT){next();return ~cint(n2(notx()))}return rel()}
function rel(){
  var a=add();
  for(;;){
    var c=at(),op=0;
    while(c===T['>']||c===T['=']||c===T['<']){op|=c===T['>']?1:c===T['=']?2:4;c=next()}
    if(!op)return a;
    var b=add();
    if((typeof a==='string')!==(typeof b==='string'))E('TM');
    var x=typeof a==='string'?a:v(a),y=typeof b==='string'?b:v(b);
    var cmp=x<y?4:x>y?1:2;
    a=(op&cmp)?-1:0;lastLit=false;
  }
}
function add(){
  var a=mul();
  for(;;){
    var c=at();
    if(c===T['+']){next();var b=mul();if((typeof a==='string')!==(typeof b==='string'))E('TM');
      if(typeof a==='string'){if(a.length+b.length>255)E('LS');a=a+b;lastLit=false}else a=num2(a,b,function(x,y){return x+y})}
    else if(c===T['-']){next();var d=mul();a=num2(n2(a),n2(d),function(x,y){return x-y})}
    else return a;
  }
}
function mul(){
  var a=pow();
  for(;;){
    var c=at();
    if(c===T['*']){next();a=num2(n2(a),n2(pow()),function(x,y){return x*y})}
    else if(c===T['/']){next();var b=n2(pow());n2(a);if(v(b)===0)E('/0');a=num2(a,b,function(x,y){return x/y})}
    else return a;
  }
}
function n2(x){if(typeof x==='string')E('TM');return x}
function pow(){
  var a=unary();
  while(at()===T['[']){next();var b=n2(unary());a=n2(a);
    if(v(b)===0){a=1;continue}
    if(v(a)===0){if(v(b)<0)E('/0');a=0;continue}
    if(v(a)<0&&v(b)!==Math.floor(v(b)))E('FC');
    a=num2(a,b,Math.pow);
  }
  return a;
}
function unary(){
  var c=at();
  if(c===T['-']){next();var x=n2(pow1());return isD(x)?new Dbl(-x.v):-x}
  if(c===T['+']){next();return pow1()}
  return prim();
}
function pow1(){ /* a sign binds looser than ^ */
  var a=unary();
  while(at()===T['[']){next();var b=n2(unary());a=num2(n2(a),b,Math.pow)}
  return a;
}
function arg1(){eat(40);var x=expr();eat(41);return x}
function prim(){
  var c=at();
  lastLit=false;
  if(c===0||c===58||c===T.ELSE)E('MO');
  if(isDigit(c)||c===46)return number();
  if(c===34){
    var s='';pos++;
    while(pos<cur.length&&cur[pos]!==34){s+=String.fromCharCode(cur[pos]);pos++}
    if(pos<cur.length)pos++;
    lastLit=true;
    return s;
  }
  if(c===40){next();var x=expr();eat(41);return x}
  if(isAlpha(c))return ref().get();
  if(c===T.FN){
    if(!disk)E('L3');
    next();var n=name(),f=fns[n];
    if(!f)E('UE');
    var args=[];
    if(at()===40){next();do{args.push(expr())}while(at()===44&&next()!==null);eat(41)}
    return callFn(f,args);
  }
  if(c===T.ERL){next();return errLine}
  if(c===T.ERR){next();return (errCode-1)*2}
  if(c===T.MEM){next();return fre()}
  if(c===T['INKEY$']){next();var k=M.inkey();return k===null?'':String.fromCharCode(k)}
  if(c===T['TIME$']){next();return M.time()}
  if(c===T.POINT){next();eat(40);var px=cint(num());eat(44);var py=cint(num());eat(41);
    if(px<0||px>127||py<0||py>47)E('FC');return M.point(px,py)?-1:0}
  if(c===T['STRING$']){next();eat(40);var sn=byte(num());eat(44);var w=expr();eat(41);
    var ch=typeof w==='string'?(w.length?w.charAt(0):E('FC')):String.fromCharCode(byte(w));return ch.repeat(sn)}
  if(c===T.INSTR){next();if(!disk)E('L3');eat(40);var st=1,a1=expr();
    if(typeof a1!=='string'){st=byte(a1);if(st<1)E('FC');eat(44);a1=str()}
    eat(44);var b1=str();eat(41);if(!b1.length)return st<=a1.length?st:0;var ix=a1.indexOf(b1,st-1);return ix+1}
  if(c===T.VARPTR){next();eat(40);ref();eat(41);return 0x6000}
  if(c===T.USR){next();arg1();return 0}
  if(c>=T.SGN&&c<=T['MID$']){if(!disk&&DISKONLY[c])E('L3');next();return func(c)}
  E('SN');
}
function callFn(f,args){
  if(args.length!==f.args.length)E('SN');
  var keep=f.args.map(function(a){return has(vars,a)?vars[a]:undefined}),sc=cur,sp=pos;
  f.args.forEach(function(a,i){vars[a]=conv(a,args[i])});
  cur=f.toks;pos=f.at;
  try{return conv(f.name,expr())}
  finally{cur=sc;pos=sp;f.args.forEach(function(a,i){if(keep[i]===undefined)delete vars[a];else vars[a]=keep[i]})}
}
function func(t){
  var x,s,n,m;
  switch(t){
  case T.SGN:x=v(n2(arg1()));return x>0?1:x<0?-1:0;
  case T.INT:x=n2(arg1());return isD(x)?new Dbl(Math.floor(x.v)):fr(Math.floor(x));
  case T.FIX:x=n2(arg1());return isD(x)?new Dbl(Math.trunc(x.v)):fr(Math.trunc(x));
  case T.ABS:x=n2(arg1());return isD(x)?new Dbl(Math.abs(x.v)):Math.abs(x);
  case T.CINT:return cint(n2(arg1()));
  case T.CSNG:return fr(v(n2(arg1())));
  case T.CDBL:return new Dbl(v(n2(arg1())));
  case T.FRE:x=arg1();return typeof x==='string'?strSpace-strUsed():fre();
  case T.INP:byte(n2(arg1()));return 255;
  case T.POS:arg1();return M.pos();
  case T.SQR:x=v(n2(arg1()));if(x<0)E('FC');return fr(Math.sqrt(x));
  case T.RND:
    x=Math.floor(v(n2(arg1())));
    if(x<0||x>32767)E('FC');
    if(x===0)return fr(rnd01());
    return Math.floor(rnd01()*x)+1;
  case T.LOG:x=v(n2(arg1()));if(x<=0)E('FC');return fr(Math.log(x));
  case T.EXP:x=v(n2(arg1()));if(x>87.3365)E('OV');return fr(Math.exp(x));
  case T.COS:return fr(Math.cos(v(n2(arg1()))));
  case T.SIN:return fr(Math.sin(v(n2(arg1()))));
  case T.TAN:x=v(n2(arg1()));if(Math.cos(x)===0)E('/0');return fr(Math.tan(x));
  case T.ATN:return fr(Math.atan(v(n2(arg1()))));
  case T.PEEK:return M.peek(addr(n2(arg1())));
  case T.LEN:return sx(arg1()).length;
  case T['STR$']:return numStr(n2(arg1()));
  case T.VAL:return val(sx(arg1()));
  case T.ASC:s=sx(arg1());if(!s.length)E('FC');return s.charCodeAt(0);
  case T['CHR$']:return String.fromCharCode(byte(n2(arg1())));
  case T['LEFT$']:case T['RIGHT$']:
    eat(40);s=sx(expr());eat(44);n=byte(num());eat(41);
    return t===T['LEFT$']?s.slice(0,n):n?s.slice(Math.max(0,s.length-n)):'';
  case T['MID$']:
    eat(40);s=sx(expr());eat(44);n=byte(num());m=255;
    if(at()===44){next();m=byte(num())}
    eat(41);
    if(n===0)E('FC');
    return s.substr(n-1,m);
  case T.EOF:case T.LOC:case T.LOF:arg1();E('FC');break;
  case T.CVI:case T.CVS:case T.CVD:sx(arg1());return 0;
  case T['MKI$']:n2(arg1());return '\0\0';
  case T['MKS$']:n2(arg1());return '\0\0\0\0';
  case T['MKD$']:n2(arg1());return '\0\0\0\0\0\0\0\0';
  }
  E('SN');
}
function sx(x){if(typeof x!=='string')E('TM');return x}
function byte(x){x=Math.floor(v(x));if(x<0||x>255)E('FC');return x}
function addr(x){x=Math.floor(v(x));if(x<-32768||x>65535)E('FC');return x<0?x+65536:x}
function val(s){
  var t=s.replace(/ /g,'').toUpperCase(),m=t.match(/^[+-]?(\d*\.?\d*)([ED][+-]?\d*)?/);
  if(!m||!m[1]||m[1]==='.')return 0;
  var x=m[0].replace('D','E');if(/E[+-]?$/.test(x))x=x.replace(/E[+-]?$/,'');
  var d=/D/.test(m[0])||m[1].replace(/[^0-9]/g,'').replace(/^0+/,'').length>7;
  var f=parseFloat(x.replace(/^([+-]?)\./,'$10.'))||0;
  return d?dr(f):fr(f);
}

/* ---------- output ---------- */
function out(s){for(var i=0;i<s.length;i++)M.out(s.charCodeAt(i));spent+=s.length}
function cr(){M.out(13);spent++}

/* ---------- statements ---------- */
var S={};
S[T.END]=function(){if(running)cont={line:line,pos:pos,cur:cur};finish()};
S[T.STOP]=function(){
  if(running)cont={line:line,pos:pos,cur:cur};
  if(M.pos()>0)cr();out('Break');if(running)out(' in '+prog[line].n);cr();
  finish();
};
function finish(){running=false;cur=null;throw {done:true}}
S[T.FOR]=function(){
  var r=ref();if(isStr(r.name)||/\(/.test(r.name))E('TM');
  eat(T['=']);assign(r,num());eat(T.TO);var to=num(),step=1;
  if(at()===T.STEP){next();step=num()}
  for(var i=stack.length-1;i>=0;i--){if(stack[i].g)break;if(stack[i].v===r.name){stack.length=i;break}}
  push({v:r.name,to:v(to),step:v(step),line:line,pos:pos,cur:cur,size:17});
};
function push(x){
  var used=stack.reduce(function(a,y){return a+y.size},0);
  if(used+x.size>fre())E('OM');
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
    var x=conv(F.v,num2(has(vars,F.v)?vars[F.v]:0,F.step,function(a,b){return a+b}));vars[F.v]=x;
    if(F.step>=0?v(x)<=F.to:v(x)>=F.to){line=F.line;pos=F.pos;cur=F.cur;jumped=true;return}
    stack.length=i;
    if(at()!==44)return;
    next();
  }
};
S[T.REM]=function(){pos=cur.length};
S[T.DATA]=function(){skipStmt()};
function skipStmt(){var q=false;while(pos<cur.length){var c=cur[pos];if(c===34)q=!q;else if(c===58&&!q)return;pos++}}
S[T.LET]=function(){let_()};
function let_(){var r=ref();eat(T['=']);lastLit=false;var x=expr();assign(r,x,lastLit)}
S[T.GOTO]=function(){var n=lineNum();if(n<0)E('SN');go(n)};
function go(n){var i=find(n);if(!running){running=true;stack=[];cont=null}line=i;cur=prog[i].t;pos=0;jumped=true}
S[T.GOSUB]=function(){var n=lineNum();if(n<0)E('SN');gosub(n)};
function gosub(n){find(n);push({g:true,line:line,pos:pos,cur:cur,size:6});go(n)}
S[T.RETURN]=function(){
  for(var i=stack.length-1;i>=0;i--)if(stack[i].g){var G=stack[i];stack.length=i;line=G.line;pos=G.pos;cur=G.cur;
    if(line<0&&cur){running=false}
    skipStmt();jumped=true;return}
  E('RG');
};
S[T.IF]=function(){
  var x=expr(),t=typeof x==='string'?E('TM'):v(x)!==0;
  if(at()===44)next();
  if(at()===T.THEN)next(); /* THEN may be left out, as Level II allows */
  if(!t){ /* on to an ELSE at this level, or the end of the line */
    var q=false,lvl=0;
    while(pos<cur.length){
      var c=cur[pos];
      if(c===34)q=!q;
      else if(!q&&c===T.IF)lvl++;
      else if(!q&&c===T.ELSE){if(lvl===0){pos++;if(isDigit(at()))go(lineNum());else stmtOrJump();return}lvl--}
      pos++;
    }
    return;
  }
  if(isDigit(at()))go(lineNum());
  else if(at()===T.GOTO){next();go(lineNum())}
  else return stmt();
};
function stmtOrJump(){var r=stmt();if(r&&r.wait)throw {wait:r};}
S[T.ELSE]=function(){pos=cur.length}; /* reached after THEN's part ran: the rest of the line is the other branch */
S[T.ON]=function(){
  if(at()===T.ERROR){next();eat(T.GOTO);var n=lineNum();onerr=n>0?n:null;if(n===0&&inErr){inErr=false;throw {basic:BYNUM[errCode]||'UE',raw:true}}return}
  var k0=Math.floor(v(num()));if(k0<0||k0>255)E('FC');
  var t=at();
  if(t!==T.GOTO&&t!==T.GOSUB)E('SN');
  next();
  var k=1,n2_=-1;
  for(;;){var x=lineNum();if(k===k0)n2_=x;if(at()!==44)break;next();k++}
  if(n2_<0)return;
  if(t===T.GOSUB)gosub(n2_);else go(n2_);
};
S[T.RESTORE]=function(){data=null};
S[T.READ]=function(){
  do{
    var r=ref(),x=readData();
    if(isStr(r.name))assign(r,x,true);
    else{if(badNum(x)){errLineOverride=dataLineNum;E('SN')}assign(r,val(x))}
  }while(at()===44&&next()!==null);
};
var errLineOverride=null,dataLineNum=0;
function readData(){
  if(!data)data={i:0,p:0,inData:false};
  for(;;){
    if(data.i>=prog.length)E('OD');
    var t=prog[data.i].t;
    if(data.inData){
      var p=data.p;
      while(p<t.length&&t[p]===32)p++;
      var s='';
      if(t[p]===34){p++;while(p<t.length&&t[p]!==34){s+=String.fromCharCode(t[p]);p++}if(p<t.length)p++;while(p<t.length&&t[p]!==44&&t[p]!==58)p++}
      else{while(p<t.length&&t[p]!==44&&t[p]!==58){s+=String.fromCharCode(t[p]);p++}s=s.replace(/ +$/,'')}
      dataLineNum=prog[data.i].n;
      if(t[p]===44){data.p=p+1}else{data.inData=false;data.p=p}
      return s;
    }
    var q=false,p2=data.p;
    for(;p2<t.length;p2++){
      if(t[p2]===34)q=!q;
      else if(!q&&t[p2]===T.DATA)break;
      else if(!q&&t[p2]===T.REM){p2=t.length;break}
    }
    if(p2<t.length){data.inData=true;data.p=p2+1;continue}
    data.i++;data.p=0;
  }
}
S[T.DIM]=function(){
  do{
    var n=name();eat(40);var d=[];
    do{d.push(cint(num()))}while(at()===44&&next()!==null);
    eat(41);
    if(arrays[n])E('DD');
    d.forEach(function(x){if(x<0)E('FC')});
    arrays[n]=mkArray(n,d);
  }while(at()===44&&next()!==null);
};
function defType(t){
  return function(){
    do{
      var a=at();if(!isAlpha(a))E('SN');next();var b=a;
      if(at()===T['-']){next();b=at();if(!isAlpha(b))E('SN');next()}
      for(var c=a;c<=b;c++)deftype[String.fromCharCode(c)]=t;
    }while(at()===44&&next()!==null);
  };
}
S[T.DEFSTR]=defType('$');S[T.DEFINT]=defType('%');S[T.DEFSNG]=defType('!');S[T.DEFDBL]=defType('#');
S[T.DEF]=function(){
  if(at()===T.USR){skipStmt();return}
  if(!running)E('ID');
  eat(T.FN);var n=name(),args=[];
  if(at()===40){next();do{args.push(name())}while(at()===44&&next()!==null);eat(41)}
  eat(T['=']);
  fns[n]={name:n,args:args,toks:cur,at:pos};
  skipStmt();
};
S[T.PRINT]=function(){
  var nl=true,c=at();
  if(c===35){E('FD')} /* PRINT# to a file or the tape: not here */
  if(c===64){ /* PRINT @ */
    next();var a=cint(num());if(a<0||a>1023)E('FC');M.at(a);
    if(at()===44)next();
  }
  if(at()===T.USING){next();return printUsing()}
  for(;;){
    c=at();
    if(c===0||c===58||c===T.ELSE)break;
    nl=true;
    if(c===59){next();nl=false;continue}
    if(c===44){next();nl=false;var h=M.pos();if(h>=48)cr();else M.tab((h+16)&0x30);continue}
    if(c===T['TAB(']){next();var n=byte(num());eat(41);nl=false;var hp=M.pos();if(n>hp)out(' '.repeat(n-hp));continue}
    var x=expr();
    if(typeof x==='string')out(x);
    else{var s=numStr(x)+' ';if(M.pos()+s.length>64&&M.pos()>0)cr();out(s)}
    nl=true;
    if(at()===59||at()===44)continue;
  }
  if(nl)cr();
};
function printUsing(){ /* PRINT USING: # . , + - $$ ** ^^^^ for numbers; ! and %  % for strings */
  var f=str();if(at()!==59&&at()!==44)E('SN');next();
  if(!f.length)E('FC');
  var items=[],nl=true;
  for(;;){if(endStmt()||at()===T.ELSE)break;items.push(expr());nl=true;if(at()===59||at()===44){next();nl=false;continue}break}
  var k=0,o='',any=false;
  while(k<items.length){
    var i=0,used=false;
    while(i<f.length){
      var ch=f.charAt(i);
      if(ch==='!'||ch==='%'){
        if(k>=items.length)break;
        var w=1;if(ch==='%'){var j=f.indexOf('%',i+1);if(j<0){o+=ch;i++;continue}w=j-i+1;i=j+1}else i++;
        var s=items[k++];if(typeof s!=='string')E('TM');o+=(s+' '.repeat(w)).slice(0,w);used=true;continue;
      }
      var m=f.slice(i).match(/^(\+)?(\*\*\$|\$\$|\*\*)?([#,]*)(\.#*)?(\^\^\^\^|\[\[\[\[)?(-)?/);
      if(m&&(m[3]||m[2]||m[4]&&m[4].length>1)&&(m[0].replace(/[+\-^]/g,'').length>0)){
        if(k>=items.length)break;
        var x=items[k++];if(typeof x==='string')E('TM');
        o+=usingNum(v(x),m,isD(x));i+=m[0].length;used=true;continue;
      }
      o+=ch;i++;
    }
    any=true;
    if(!used)break;
  }
  out(o);
  if(nl)cr();
}
function usingNum(x,m,dbl){
  var plus=!!m[1],lead=m[2]||'',ints=(m[3]||''),dec=m[4]?m[4].length-1:0,expo=!!m[5],minus=!!m[6];
  var comma=ints.indexOf(',')>=0,width=ints.length+(lead==='**$'?3:lead?2:0)+(m[4]?m[4].length:0)+(plus?1:0);
  var neg=x<0,a=Math.abs(x),s;
  if(!dbl&&a)a=+a.toPrecision(6); /* a single shows its six digits, as PRINT does */
  if(expo){var e=a===0?0:Math.floor(Math.log10(a))-(ints.length-1);var mm=a/Math.pow(10,e);s=mm.toFixed(dec);if(dec===0&&m[4])s+='.';var ex=Math.abs(e);s+='E'+(e<0?'-':'+')+(ex<10?'0':'')+ex}
  else{
    s=a.toFixed(dec);
    if(comma){var p=s.split('.');p[0]=p[0].replace(/\B(?=(\d{3})+(?!\d))/g,',');s=p.join('.')}
    if(s.charAt(0)==='0'&&s.charAt(1)==='.'&&!ints.length)s=s.slice(1);
  }
  if(lead.indexOf('$')>=0)s='$'+s;
  if(neg&&!minus&&!plus)s='-'+s;
  else if(plus)s=(neg?'-':'+')+s;
  var fill=lead.charAt(0)==='*'?'*':' ',w=width;
  var r=s.length>w?'%'+s:(fill.repeat(w-s.length)+s);
  if(minus)r+=neg?'-':' ';
  return r;
}
S[T.CLS]=function(){M.cls()};
S[T.SET]=function(){var xy=point();M.set(xy[0],xy[1],true)};
S[T.RESET]=function(){var xy=point();M.set(xy[0],xy[1],false)};
function point(){eat(40);var x=cint(num());eat(44);var y=cint(num());eat(41);if(x<0||x>127||y<0||y>47)E('FC');return [x,y]}
S[T.RANDOM]=function(){seed=(Date.now()&0x7FFFFFFF)%2147483648};
S[T.TRON]=function(){trace=true};S[T.TROFF]=function(){trace=false};
S[T.POKE]=function(){var a=addr(num());eat(44);M.poke(a,byte(num()))};
S[T.OUT]=function(){var p=byte(num());eat(44);M.outp(p,byte(num()))};
S[T.ERROR]=function(){var n=byte(num());if(n===0)E('FC');throw {basic:n<=23?BYNUM[n]:'UE',code:n<=23?n:20}};
S[T.RESUME]=function(){
  if(!errAt)E('RW');
  var c=at();
  if(c===T.NEXT){next();line=errAt.line;cur=errAt.cur;pos=errAt.pos;skipStmt();}
  else if(isDigit(c)&&!(c===48&&!isDigit(cur[pos+1]))){var n=lineNum();errAt=null;inErr=false;go(n);return}
  else{if(c===48)next();line=errAt.line;cur=errAt.cur;pos=errAt.pos}
  errAt=null;inErr=false;jumped=true;
};
S[T.CLEAR]=function(){
  if(!endStmt()){var n=Math.floor(v(num()));if(n<0||n>fre()+strSpace-50)E(n<0?'FC':'OM');clear();strSpace=n;return}
  clear();
};
function clear(){vars={};arrays={};fns={};stack=[];data=null;onerr=null;cont=null;deftype={};errAt=null;inErr=false}
S[T.NEW]=function(){prog=[];reindex();clear();finish()};
S[T.CONT]=function(){
  if(running)return;
  if(!cont)E('CN');
  running=true;line=cont.line;cur=cont.cur;pos=cont.pos;cont=null;jumped=true;
};
S[T.RUN]=function(){
  var c=at();
  if(c===34){if(!disk)E('L3');var f=str();var keep=at()===44;skipStmt();return M.disk('run',f,keep)}
  if(isDigit(c)){var n=lineNum();clear();restart(find(n));return}
  if(!endStmt())E('SN');
  clear();restart(0);
};
function restart(i){
  running=true;stack=[];
  if(i>=prog.length)finish();
  line=i;cur=prog[i].t;pos=0;jumped=true;
}
S[T.LIST]=S[T.LLIST]=function(){
  var a=0,b=65529;
  if(at()===46){next();a=b=lastLine}
  else if(isDigit(at())){a=lineNum();b=a}
  if(at()===T['-']){next();b=isDigit(at())?lineNum():65529}
  listing={i:0,a:a,b:b};
  skipStmt();
};
var lastLine=0;
S[T.DELETE]=function(){
  var a=0,b;
  if(isDigit(at()))a=lineNum();
  b=a;
  if(at()===T['-']){next();b=isDigit(at())?lineNum():a}
  else if(a===0)E('FC');
  if(a&&byNum[a]===undefined&&a===b)E('FC');
  prog=prog.filter(function(L){return L.n<a||L.n>b});reindex();clear();
  if(running)finish();
};
S[T.AUTO]=function(){
  var a=10,s=10;
  if(isDigit(at()))a=lineNum();
  if(at()===44){next();s=lineNum();if(s<=0)E('FC')}
  auto={n:a,step:s};skipStmt();
  if(running)finish();
};
var auto=null;
S[T.EDIT]=function(){ /* the line editor is not here: the line comes back to be typed again */
  var n=at()===46?lastLine:lineNum();find(n);lastLine=n;
  return {wait:'edit',n:n};
};
S[T.GET]=function(){E('FD')};
S[T.INPUT]=function(){
  if(at()===35)E('FD');
  var prompt='? ';
  if(at()===34){prompt=prim()+(at()===59?'? ':'');if(at()!==59&&at()!==44)E('SN');next()}
  if(!running)E('ID');
  return inputFrom(prompt,pos);
};
S[T.LINE]=function(){
  eat(T.INPUT);if(at()===35)E('FD');
  var prompt='';
  if(at()===34){prompt=prim();if(at()!==59&&at()!==44)E('SN');next()}
  if(!running)E('ID');
  var r=ref();if(!isStr(r.name))E('TM');
  return {wait:'line',prompt:prompt,then:function(t){assign(r,t)}};
};
function inputFrom(prompt,save){
  return {wait:'line',prompt:prompt,then:function(text){return takeInput(text,save,prompt)}};
}
function takeInput(text,save,prompt){
  pos=save;
  var items=splitInput(text),k=0;
  return fill();
  function fill(){
    for(;;){
      var p0=pos,r=ref();
      if(k>=items.length)return {wait:'line',prompt:'?? ',then:function(t){items=splitInput(t);k=0;pos=p0;return fill()}};
      var x=items[k++];
      if(!isStr(r.name)){
        if(badNum(x)){out('?REDO');cr();pos=save;return inputFrom(prompt,save)}
        assign(r,val(x));
      }else assign(r,x);
      if(at()!==44)break;
      next();
    }
    if(k<items.length){out('?Extra ignored');cr()}
    return null;
  }
}
function badNum(x){var y=x.replace(/ /g,'').toUpperCase();return y!==''&&!/^[+-]?(\d+\.?\d*|\.\d+)([ED][+-]?\d+)?[#!%]?$/.test(y)}
function splitInput(t){
  var o=[],i=0;
  for(;;){
    while(t.charAt(i)===' ')i++;
    var s='';
    if(t.charAt(i)==='"'){i++;while(i<t.length&&t.charAt(i)!=='"')s+=t.charAt(i++);if(i<t.length)i++;while(i<t.length&&t.charAt(i)!==',')i++}
    else{while(i<t.length&&t.charAt(i)!==',')s+=t.charAt(i++);s=s.replace(/ +$/,'')}
    o.push(s);
    if(t.charAt(i)===','){i++;continue}
    break;
  }
  return o;
}
/* the tape */
S[T.CSAVE]=function(){
  if(at()===35){E('FD')}
  var n=str();skipStmt();
  if(!n.length)E('FC');
  return {wait:'tape',op:'save',name:n.charAt(0)};
};
S[T.CLOAD]=function(){
  var verify=false,n='';
  if(at()===T.PRINT){verify=true;next()} /* CLOAD? : the ? was crunched as PRINT */
  if(at()===35)E('FD');
  if(at()===34)n=str().charAt(0);
  skipStmt();
  return {wait:'tape',op:verify?'verify':'load',name:n};
};
S[T.SYSTEM]=function(){if(running)E('ID');return {wait:'system'}};
/* the disk */
S[T.CMD]=function(){var s=str();skipStmt();return M.disk('cmd',s)};
S[T.SAVE]=function(){var f=str(),a=false;if(at()===44){next();if(at()!==65)E('SN');next();a=true}skipStmt();return M.disk('save',f,a)};
S[T.LOAD]=function(){var f=str(),r=false;if(at()===44){next();if(at()!==82)E('SN');next();r=true}skipStmt();return M.disk('load',f,r)};
S[T.MERGE]=function(){var f=str();skipStmt();return M.disk('merge',f)};
S[T.KILL]=function(){var f=str();skipStmt();return M.disk('kill',f)};
S[T.NAME]=S[T.OPEN]=S[T.FIELD]=S[T.PUT]=S[T.CLOSE]=S[T.LSET]=S[T.RSET]=function(){skipStmt();E('FD')};
S[T.LPRINT]=function(){skipStmt()}; /* no printer on the line: the words go nowhere */

function stmt(){
  var c=at();
  if(c===0)return;
  if(c>=0x80){
    if(!disk&&DISKONLY[c])E('L3');
    if(c===T['MID$']){if(!disk)E('L3');return midAssign()}
    var f=S[c];
    if(!f)E('SN');
    next();
    return f();
  }
  if(isAlpha(c)){let_();return}
  E('SN');
}
function midAssign(){ /* MID$(A$,n[,m])=x$ */
  next();eat(40);var r=ref();if(!isStr(r.name))E('TM');eat(44);var n=byte(num());if(n===0)E('FC');var m=255;
  if(at()===44){next();m=byte(num())}
  eat(41);eat(T['=']);var s=str(),t=r.get();
  if(n>t.length)E('FC');
  var k=Math.min(m,s.length,t.length-n+1);
  r.set(t.slice(0,n-1)+s.slice(0,k)+t.slice(n-1+k));
}

/* ---------- the loop ---------- */
function message(k){ /* how the error is put: ?SN Error in ROM BASIC, Syntax Error once the disk's is in */
  return disk?ERR[k][1]:'?'+k+' Error';
}
function error(x){
  var k=x.basic,e=ERR[k]||ERR.UE;
  var where=running?(errLineOverride!==null?errLineOverride:prog[line].n):null;
  errLineOverride=null;
  var code=x.code||e[0];
  if(running&&onerr!==null&&!inErr&&!x.raw){
    errCode=code;errLine=where;errAt={line:line,cur:cur,pos:stmtStart};inErr=true;
    var i=byNum[onerr];
    if(i!==undefined){line=i;cur=prog[i].t;pos=0;return true}
  }
  want=null;listing=null;
  if(M.pos()>0)cr();
  out(BYNUM[code]?message(BYNUM[code]):message('UE'));
  if(where!==null){out(' in '+where);cont=null;lastLine=where}
  cr();
  running=false;cur=null;
  if(k==='SN'&&where!==null)return {edit:where};
  return false;
}
var stmtStart=0,jumped=false;
function caught(x){
  if(x&&x.done)return false;
  if(x&&x.wait){want=x.wait;return 'wait'}
  if(x&&x.basic)return error(x);
  throw x;
}
var editAfter=null;
function step(budget,most){ /* 'more', 'wait', 'done'; most: statements before the page gets its turn */
  spent=0;
  var stmts=0;
  for(;;){
    if(want)return 'wait';
    try{
      if(listing){
        while(listing.i<prog.length&&prog[listing.i].n<listing.a)listing.i++;
        if(listing.i>=prog.length||prog[listing.i].n>listing.b){listing=null;continue}
        if(M.broken()){listing=null;return 'done'}
        var L=prog[listing.i++];lastLine=L.n;
        out(L.n+' '+listText(L.t));cr();
        if(spent>=budget)return 'more';
        continue;
      }
      if(!cur)return 'done';
      if(spent>=budget||stmts>=(most||2000))return 'more';
      var c=at();
      if(c===58){next();continue}
      if(c===0){
        if(!running){cur=null;return 'done'}
        line++;
        if(line>=prog.length){running=false;cur=null;cont=null;return 'done'}
        cur=prog[line].t;pos=0;
        if(trace)out('<'+prog[line].n+'>');
        continue;
      }
      if(running&&M.broken()){stmtStart=pos;brk();return 'done'}
      stmtStart=pos;
      jumped=false;stmts++;
      var r=stmt();
      if(r&&r.wait){want=r;return 'wait'}
      if(cur&&!jumped&&!endStmt()&&at()!==T.ELSE)E('SN');
    }catch(x){
      var k=caught(x);
      if(k==='wait')return 'wait';
      if(k===true)continue;
      if(k&&k.edit!==undefined)editAfter=k.edit;
      return 'done';
    }
  }
}
function brk(){
  want=null;listing=null;
  if(M.pos()>0)cr();
  out('Break');
  if(running){out(' in '+prog[line].n);cont={line:line,pos:stmtStart,cur:cur}}
  cr();
  running=false;cur=null;
}
function answer(x){
  var w=want;want=null;jumped=false;
  if(!w)return;
  try{
    var r=w.then?w.then(x):null;
    if(r&&r.wait)want=r;
    else if(cur&&!jumped&&!endStmt()&&at()!==T.ELSE)E('SN');
  }catch(e){
    var k=caught(e);
    if(k!=='wait'&&k!==true){want=null;if(k&&k.edit!==undefined)editAfter=k.edit}
  }
}
function enter(text){ /* a line typed at the > prompt */
  var i=0;while(text.charAt(i)===' ')i++;
  if(/[0-9]/.test(text.charAt(i))){
    var n=0,j=i;
    while(j<text.length&&/[0-9]/.test(text.charAt(j))){n=n*10+(+text.charAt(j));if(n>65529)break;j++}
    if(n>65529){out(message('SN'));cr();return 'error'}
    if(text.charAt(j)===' ')j++;
    store(n,parse(text.slice(j)),text.slice(j).replace(/ +$/,'')==='');
    lastLine=n;
    return 'stored';
  }
  cur=parse(text.slice(i));pos=0;running=false;line=-1;
  return 'run';
}
function store(n,t,del){
  var at0=byNum[n];
  if(del&&at0===undefined){out(message('UL'));cr();return}
  if(at0!==undefined)prog.splice(at0,1);
  if(!del){
    if(fre()-5-t.length<0)E('OM');
    var k=0;while(k<prog.length&&prog[k].n<n)k++;
    prog.splice(k,0,{n:n,t:t});
  }
  reindex();
  vars={};arrays={};fns={};stack=[];data=null;cont=null;
}
function chain(){want=null;running=true;stack=[];line=0;if(!prog.length){running=false;cur=null;return}cur=prog[0].t;pos=0}
return {
  step:step,enter:function(t){try{return enter(t)}catch(x){if(x&&x.basic){error(x);return 'error'}throw x}},
  answer:answer,want:function(){return want},
  running:function(){return running},
  load:function(lines){prog=lines.map(function(L){return {n:L[0],t:L[1].slice()}});reindex();want=null;listing=null;clear()},
  merge:function(lines){lines.forEach(function(L){var i=byNum[L[0]];if(i!==undefined)prog.splice(i,1);var k=0;while(k<prog.length&&prog[k].n<L[0])k++;prog.splice(k,0,{n:L[0],t:L[1].slice()});reindex()});clear()},
  listing:function(){return prog.map(function(L){return L.n+' '+listText(L.t)})},
  run:function(){clear();chain()},
  stop:function(){running=false;cur=null;want=null;listing=null},
  fail:function(k){want=null;try{var r=caught({basic:k});if(r&&r.edit!==undefined)editAfter=r.edit}catch(e){running=false;cur=null}},
  brk:brk,
  auto:function(){return auto},
  autoNext:function(){if(auto)auto.n+=auto.step},autoOff:function(){auto=null},
  has:function(n){return byNum[n]!==undefined},
  editAfter:function(){var e=editAfter;editAfter=null;return e},
  lineText:function(n){var i=byNum[n];return i===undefined?null:n+' '+listText(prog[i].t)},
  setMemory:function(top){memTop=top}
};
};
P.trsBasic.parse=parse;
P.setup(function(){}); /* marks this file as loaded */
})(window.Phosphor);
