/* PHOSPHOR-9 terminal: machine "vms-1988", MORIA 4.8. Ported to JavaScript for this terminal from Robert Alan Koeneke's
   VAX Pascal source of Moria 4.8 (github.com/dungeons-of-moria/vms-moria): moria.pas and its include files are translated
   statement by statement, by a tool, with their comments; the MACRO routines (randint, rand_rep, bit_pos, distance,
   insert_str, maxmin, minmax, put_buffer and put_qio) and the VMS services the Pascal calls are written by hand from the
   .MAR sources and the VMS documentation. VAX Pascal can't be run here, so this was never compared with the original
   running. The notice from moria.pas, kept as it is:

{ Moria Version 4.8	COPYRIGHT (c) Robert Alan Koeneke		}
{                       Public Domain                                   }
{                                                                       }
{       I lovingly dedicate this game to hackers and adventurers        }
{       everywhere...                                                   }
{                                                                       }
{                                                                       }
{       Designer and Programmer : Robert Alan Koeneke                   }
{                                 University of Oklahoma                }
{                                                                       }
{       Assitant Programmers    : Jimmey Wayne Todd                     }
{                                 University of Oklahoma                }
{                                                                       }
{                                 Gary D. McAdoo                        }
{                                 University of Oklahoma                }
{                                                                       }
{       Moria may be copied and modified freely as long as the above    }
{       credits are retained.  No one who-so-ever may sell or market    }
{       this software in any form without the expressed written consent }
{       of the author Robert Alan Koeneke.                              }
{                                                                       }

   and from aaareadme.1st:

1.0  DISCLAIMER
               __________

               Moria is intended for Public Domain, and may not be sold  or
          marketed  IN  ANY  FORM without the permision and written consent
          from the author Robert Alan Koeneke.  I retain all copyrights  to
          this  program,  in  either the original or modified forms, and no
          violation,  deletion,  or  change  of  the  copyright  notice  is
          allowed.   Futhermore,  I will have no liability or responsibilty
          to any user with respect to loss or  damage  caused  directly  or
          indirectly by this program.

   Differences from the source: the files are records in this browser's storage (moria/files) in place of RMS files in
   the image's directory, and the first run's installation (HOURS.DAT, MORIA.DAT, the MASTER file and the scores, which
   the source makes and then stops) is done before anyone plays. The terminal is a VT100. The $ shell escape comes back
   at once. HELP is this port's own reading of MORIAHLP.HLB (see the end of the file). The pauses the source makes
   before each read, which its readme says to remove for VMS 4.0 and later, are removed. Out-of-range CASE selectors and
   array indexes are not trapped (the source was built with checking off). Reals are single precision, as VAX F_floating.
*/
(function(P){
'use strict';
/* ---------- what VAX Pascal gives the source ---------- */
function $fill(items,hi,f){for(var i=items.length;i<=hi;i++)items[i]=f();return items}
function $heap(o){if(o&&typeof o==='object')Object.defineProperty(o,'$heap',{value:true,enumerable:false});return o}
function $clone(x){
  if(x===null||typeof x!=='object'||x.$heap)return x;
  if(Array.isArray(x)){
    if(typeof x[1]!=='object'||x[1]===null)return x.slice();
    var a=new Array(x.length);
    for(var i=0;i<x.length;i++)if(i in x)a[i]=$clone(x[i]);
    return a;
  }
  var o={};
  for(var k in x)o[k]=$clone(x[k]);
  return o;
}
function $assign(d,s){
  if(d===s)return;
  if(Array.isArray(s)){
    if(typeof s[1]!=='object'||s[1]===null){for(var i=0;i<s.length;i++)d[i]=s[i];return}
    for(var j=0;j<s.length;j++)if(j in s){if(typeof s[j]==='object'&&s[j]!==null&&!s[j].$heap&&d[j])$assign(d[j],s[j]);else d[j]=$clone(s[j])}
    return;
  }
  for(var k in s){
    var v=s[k];
    if(typeof v==='object'&&v!==null&&!v.$heap&&d[k])$assign(d[k],v);
    else d[k]=$clone(v);
  }
}
function $eqv(a,b){return JSON.stringify(a)===JSON.stringify(b)}
function $rf(o,k){return {get v(){return o[k]},set v(x){o[k]=x}}}
function $ch(s,i){return s.charAt(i-1)}
function $setch(s,i,c){if(i>s.length)s=s+' '.repeat(i-s.length);return s.slice(0,i-1)+c+s.slice(i)}
function $substr(s,i,n){if(n===undefined)return s.slice(i-1);return s.substr(i-1,n)}
function $index(s,t){return s.indexOf(t)+1}
function $pad(s,c,n){while(s.length<n)s+=c;return s}
function $fix(s,n){return s.length<n?s+' '.repeat(n-s.length):s.slice(0,n)}
function $streq(a,b){return a.trimEnd()===b.trimEnd()}
function $ord(c){return typeof c==='string'?c.charCodeAt(0):+c}
function $chr(n){return String.fromCharCode(n)}
function $odd(n){return Math.abs(n)%2===1}
function $idiv(a,b){if(b===0)throw new $Fault('%PAS-F-DIVBYZERO');return Math.trunc(a/b)}
function $rdiv(a,b){if(b===0)throw new $Fault('%PAS-F-DIVBYZERO');return a/b}
function $mod(a,b){if(b===0)throw new $Fault('%PAS-F-DIVBYZERO');var r=a%b;return r<0?r+Math.abs(b):r}
function $round(x){return x<0?-Math.round(-x):Math.round(x)}
function $wi(v,w){var s=String(Math.trunc(+v)+0);if(w<0)w=10;return s.length<w?' '.repeat(w-s.length)+s:s}
function $ws(v,w){var s=String(v);return s.length<w?' '.repeat(w-s.length)+s:s}
function $wb(v,w){var s=v?'TRUE':'FALSE';if(!w)w=6;return s.length<w?' '.repeat(w-s.length)+s:s}
function $wr(v,w,d){var s=d===null?(+v).toExponential(8).replace(/e([-+])(\d)$/,'E$10$2').replace('e','E'):(+v).toFixed(d);return s.length<w?' '.repeat(w-s.length)+s:s}
function $readv(s){var m=/^\s*[-+]?\d+/.exec(s);if(!m)throw new $Fault('%PAS-F-INVSYNINT');return parseInt(m[0],10)}
function $set(a){return new Set(a)}
function $rng(a,b){var r=[],x=$ord(a),y=$ord(b),st=typeof a==='string';for(var i=x;i<=y;i++)r.push(st?$chr(i):i);return r}
function $in(x,s){return s.has(x)}
function $Fault(m){this.message=m}
function $Halt(){}
function $halt(){throw new $Halt()}
function* $y(v){if(v&&typeof v.next==='function')return yield* v;return v}
/* MTH$RANDOM, as VMS documents it: seed = 69069*seed+1 modulo 2^32, the top 24 bits make the fraction */
function $mth_random(seed){
  var s=(Math.imul(seed.v,69069)+1)|0;
  seed.v=s;
  return (s>>>8)/16777216;
}
function $date(){
  var d=P.now?P.now():new Date(Date.now()),n=d.getDate();
  return (n<10?' ':'')+n+'-'+['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][d.getMonth()]+'-'+d.getFullYear();
}
function $time(){
  var d=P.now?P.now():new Date(Date.now());
  function p2(x){return (x<10?'0':'')+x}
  return p2(d.getHours())+':'+p2(d.getMinutes())+':'+p2(d.getSeconds())+'.'+p2(Math.floor(d.getMilliseconds()/10));
}
function $clock(){return Date.now()%2147483647}
function $program(){
function $cap(s,n){return s.length>n?s.slice(0,n):s} /* a VARYING [n] keeps n characters */
/* ---------- the MACRO routines in source/macro, line for line ---------- */
/* EMUL then EDIV by 2^31-1: the 64-bit product's quotient, truncated */
function $ediv(a,b,d){
  var p=a*b;
  if(Math.abs(p)<9007199254740992){
    var q=Math.trunc(p/d),r=p-q*d;
    if(p>=0){while(r<0){q--;r+=d}while(r>=d){q++;r-=d}}
    else{while(r>0){q++;r-=d}while(r<=-d){q--;r+=d}}
    return q;
  }
  return Number(BigInt(a)*BigInt(b)/BigInt(d));
}
/* RANDINT.MAR: mull2 #16807,seed; bicl2 #^X80000000,seed; 1 + (seed-1)*maxval / (2^31-1) */
function randint(maxval){
  seed=(Math.imul(seed|0,16807)&0x7fffffff)>>>0;
  return ($ediv(seed-1,maxval|0,2147483647)+1)|0;
}
/* RANDREP.MAR: the sum of num rolls of 1..die */
function rand_rep(num,die){
  if(num<=0)return 0;
  var r=0;
  for(var i=num;i>0;i--){
    seed=(Math.imul(seed|0,16807)&0x7fffffff)>>>0;
    r=(r+$ediv(seed-1,die|0,2147483647))|0;
  }
  return (r+num)|0;
}
/* BITPOS.MAR: the lowest set bit's number (1-32), cleared; 0 when none */
function bit_pos(x){
  var v=x.v>>>0;
  if(!v)return 0;
  var n=31-Math.clz32(v&-v);
  x.v=(v&~(1<<n))>>>0;
  return n+1;
}
/* DISTANCE.MAR: (2*max(dy,dx) + min(dy,dx)) / 2 */
function distance(y1,x1,y2,x2){
  var dy=Math.abs(y2-y1),dx=Math.abs(x2-x1);
  return (dy>=dx?2*dy+dx:2*dx+dy)>>1;
}
/* INSERT.MAR: the first match of mtc_str replaced by insert_str, in place */
function insert_str(o,m,r){
  var i=o.v.indexOf(m);
  if(i>=0)o.v=o.v.slice(0,i)+r+o.v.slice(i+m.length);
}
function maxmin(x,y,z){var r=(x<y?x:y)-1;return z>r?z:r}  /* MAXMIN.MAR */
function minmax(x,y,z){var r=(x>y?x:y)+1;return r>z?z:r}  /* MINMAX.MAR */

/* ---------- PUTQIO.MAR and the terminal: a VT100 screen of 24 rows of 80 ---------- */
var $R=24,$C=80,$scr=null,$cy=0,$cx=0,$keys=[],$lastdraw=0,$show=function(){};
function $blank(){var s=[];for(var i=0;i<$R;i++)s.push(new Array($C).fill(' '));return s}
$scr=$blank();
function $puts(s){ /* characters at the cursor, as the terminal takes them: ESC [ K and ESC [ J, backspace, wrap */
  for(var i=0;i<s.length;i++){
    var c=s.charAt(i);
    if(c==='\x1b'&&s.charAt(i+1)==='['){
      var m=/^\x1b\[(\d*)([A-Za-z])/.exec(s.slice(i));
      if(m){
        if(m[2]==='K')for(var x=$cx;x<$C;x++)$scr[$cy][x]=' ';
        else if(m[2]==='J'){for(x=$cx;x<$C;x++)$scr[$cy][x]=' ';for(var y=$cy+1;y<$R;y++)$scr[y].fill(' ')}
        i+=m[0].length-1;continue;
      }
    }
    if(c==='\b'){if($cx>0)$cx--;continue}
    if(c==='\r'){$cx=0;continue}
    if(c==='\n'){$nl();continue}
    if(c==='\x07'||c<' ')continue;
    if($cx>=$C){$cx=0;$nl()}
    $scr[$cy][$cx++]=c;
  }
}
function $nl(){if($cy<$R-1)$cy++;else{$scr.shift();$scr.push(new Array($C).fill(' '))}}
/* PUT_BUFFER: the cursor to (row,col), then the string; nothing reaches the glass until PUT_QIO */
function put_buffer(s,row,col){
  $cy=Math.max(0,Math.min($R-1,row-1));$cx=Math.max(0,Math.min($C-1,col-1));
  $puts(s);
}
function put_qio(){$show()}
/* text written with WRITE: from the cursor, scrolling at the bottom */
function $write(s){
  var L=String(s).split('\n');
  for(var i=0;i<L.length;i++){if(i){$cx=0;$nl()}$puts(L[i])}
}
function $writeln(s){$write(s+'\n')}
/* the terminal definition: a VT100 */
function termdef(){cursor_erl='\x1b[K';cursor_erp='\x1b[J'}

/* ---------- the keyboard: QIO reads, a character at a time, no echo ---------- */
function* inkey(c){
  put_qio();
  c.v=yield* $key();
  msg_flag=false;
}
function* $key(){
  if($keys.length)return $keys.shift();
  return yield {key:true};
}
/* a read with a time limit (0: what is waiting, if anything) */
function* inkey_delay(c,delay){
  put_qio();
  c.v=null_;
  if(!$keys.length){
    var now=Date.now();
    if(delay>0)yield {sleep:delay*1000,key:true};
    else if(now-$lastdraw>40){$lastdraw=now;yield {sleep:0}}
  }
  if($keys.length)c.v=$keys.shift();
}
function flush(){$keys.length=0}
function* sleep(n){put_qio();yield {sleep:n*1000}}
function convert_time(t,b){}
function setup_io_pause(){}
function priv_switch(n){}
function no_controly(){}
function controly(){}
function init_channel(){}
function exit(){put_qio();throw new $Halt()}

/* ---------- the process: its command line, user name, clock ---------- */
function $now(){return P.now?P.now():new Date(Date.now())}
var $argv='';
function get_foreign(m){m.v=$argv}
function get_username(){return $fix(String(P.st.user||'GUEST').toUpperCase(),12)}
/* SYS$GETTIM: 100ns since 17-Nov-1858, as two longwords */
function get_time(q){
  var t=BigInt(($now()).getTime())*10000n+35067168000000000n;
  q.l0=Number(t&0xffffffffn);q.l1=Number(t>>32n);
}
/* LIB$DAY: days since 17-Nov-1858 */
/* day: only the play hours ask, and they follow the visitor's own week, not the machine's 1988 */
function day(d){var n=new Date();d.v=Math.floor((Date.UTC(n.getFullYear(),n.getMonth(),n.getDate())-Date.UTC(1858,10,17))/864e5);return 1}
/* OTS$CVT_TZ_L */
function convert_hex_to_bin(s,v){
  var t=String(s).trim();
  if(!/^[0-9A-Fa-f]+$/.test(t)||t.length>8)return 0;
  v.v=parseInt(t,16)|0;return 1;
}
/* LIB$SPAWN: no subprocess here; the game is back at once, as if EOJ were typed */
function* shell_out(){$writeln('$ EOJ');put_qio()}

/* ---------- files: records in this browser's storage, under moria/files ---------- */
var $fs=null;
function $fsload(){
  if($fs)return $fs;
  var v=P.saved('moria/files'),ok=Object.create(null); /* no names from Object.prototype, whatever the storage holds */
  if(v&&typeof v==='object'&&!Array.isArray(v))
    Object.keys(v).forEach(function(k){
      var f=v[k];
      if(f&&typeof f==='object'&&(f.t==='text'||f.t==='keyed')&&Array.isArray(f.r)&&f.r.every(function(x){return typeof x==='string'&&x.length<=1024}))
        ok[k]={t:f.t,r:f.r.slice()};
    });
  return $fs=ok;
}
function $fssave(){return P.save('moria/files',$fs)}
/* a VMS file specification, as the file system would find it: no device or directory, no version, .DAT by default */
function $fname(n){
  var s=String(n||'').trim().toUpperCase().replace(/^.*[:\]>]/,'').replace(/;.*$/,'');
  if(s.indexOf('.')<0)s+='.DAT';
  return s;
}
function $file(mk){return {mk:mk,name:null,f:null,buf:mk(),st:0,pos:0,cur:-1,del:false,w:false}}
function $open(f,name,kw){
  $fsload();
  var n=$fname(name!==null&&name!==undefined?name:kw.file_name),h=String(kw.history||'new').toLowerCase(),keyed=String(kw.organization||'').toLowerCase()==='indexed';
  f.name=n;f.pos=0;f.cur=-1;f.del=String(kw.disposition||'').toLowerCase()==='delete';f.w=false;
  if(h==='old'||h==='readonly'){
    if(!$fs[n]){f.st=3;f.f=null;return}
    f.f=$fs[n];
  }
  else if(h==='unknown')f.f=$fs[n]||($fs[n]={t:keyed?'keyed':'text',r:[]});
  else{f.f=$fs[n]={t:keyed?'keyed':'text',r:[]};$fssave()}
  f.st=0;
}
function $reset(f){f.pos=0;f.st=f.f?0:3}
function $rewrite(f){if(!f.f){f.st=3;return}f.f.r=[];f.w=true;f.pos=0;f.st=0}
function $eof(f){return !f.f||f.pos>=f.f.r.length}
function $freadln(f,kind){
  if($eof(f)){f.st=-1;throw new $Fault('%PAS-F-ERRDURREA, error during READ')}
  var l=f.f.r[f.pos++];f.st=0;
  if(kind==='int')return $readv(l);
  return l;
}
function $fwrite(f,s,nl){
  if(!f.f){f.st=3;return}
  var L=f.f.r;
  if(!L.length||L.$nl!==false)L.push('');
  L[L.length-1]+=s;L.$nl=!!nl;
  f.w=true;f.st=0;
}
function $close(f){
  var w=f.f&&f.w&&!f.del;
  if(f.f){
    if(f.del)delete $fs[f.name];
    if(!$fssave()&&w){f.f=null;throw new $Fault('%PAS-F-ERRDURWRI, error during WRITE\n-RMS-F-FUL, device full (insufficient space for allocation)')} /* the browser's storage is full: said, not lost in silence */
  }
  f.f=null;f.st=0;
}
function $status(f){return f.st}
/* the MASTER file: one record per saved character, keyed on its 70-character id */
function $put(f){
  if(!f.f){f.st=3;return}
  var k=$fix(String(f.buf.file_id),70);
  if(f.f.r.indexOf(k)>=0){f.st=4;return}
  f.f.r.push(k);f.st=0;$fssave();
}
function $findk(f,n,key,how){
  if(!f.f){f.st=3;return}
  f.cur=f.f.r.indexOf($fix(String(key),70));f.st=f.cur<0?4:0;
}
function $delete(f){
  if(!f.f||f.cur<0){if(f.f)f.st=4;return}
  f.f.r.splice(f.cur,1);f.cur=-1;f.st=0;$fssave();
}
/* READV, as VAX Pascal reads: integers and reals skip blanks; a char is one; a fixed string takes its length; a
   varying one the rest */
var $rv=null;
function $readvs(s,kinds,soft){
  var t=String(s),p=0,out=[];
  try{
    kinds.forEach(function(k){
      if(k==='int'||k==='real'){
        while(p<t.length&&t.charAt(p)===' ')p++;
        var m=(k==='int'?/^[-+]?\d+/:/^[-+]?(\d+\.?\d*([eE][-+]?\d+)?|\.\d+)/).exec(t.slice(p));
        if(!m)throw new $Fault(k==='int'?'%PAS-F-INVSYNINT, invalid syntax for integer':'%PAS-F-INVSYNREA, invalid syntax for real');
        p+=m[0].length;
        out.push(k==='int'?(parseInt(m[0],10)|0):Math.fround(parseFloat(m[0])));
        if(p<t.length&&t.charAt(p)!==' ')throw new $Fault('%PAS-F-INVSYNINT, invalid syntax for integer');
      }
      else if(k==='bool'){
        while(p<t.length&&t.charAt(p)===' ')p++;
        var b=/^[A-Za-z$_][A-Za-z0-9$_]*/.exec(t.slice(p));
        if(!b||!/^(TRUE|FALSE)$/i.test(b[0]))throw new $Fault('%PAS-F-INVSYNBOO, invalid syntax for Boolean');
        p+=b[0].length;out.push(/^TRUE$/i.test(b[0]));
      }
      else if(k==='char'){out.push(p<t.length?t.charAt(p):' ');p++}
      else if(/^f\d+$/.test(k)){var n=+k.slice(1);out.push($fix(t.slice(p,p+n),n));p+=n}
      else{out.push(t.slice(p));p=t.length}
    });
  }
  catch(e){
    if(soft&&e instanceof $Fault)return out.concat(kinds.slice(out.length).map(function(){return 0}));
    throw e;
  }
  return out;
}

/* ---------- where the files are: the image's directory ---------- */
function* get_paths(){
  moria_hou='HOURS.DAT';moria_mor='MORIA.DAT';moria_mas='MORIACHR.DAT';moria_top='MORIATOP.DAT';moria_hlp='MORIAHLP.HLB';
  /* The first run on a system makes HOURS.DAT, MORIA.DAT, the MASTER and the scores, and stops: the system manager's run.
     That has been done here before anyone plays, quietly, by intro itself. */
  $fsload();
  var I=['HOURS.DAT','MORIA.DAT','MORIACHR.DAT','MORIATOP.DAT'];
  if(I.some(function(n){return !$fs[n]})){
    I.forEach(function(n){delete $fs[n]}); /* all four, so that intro makes them and asks for nothing */
    var keep=$scr,ky=$cy,kx=$cx,fin={v:''},was=$show;
    $scr=$blank();$show=function(){};
    try{var g=intro(fin);for(var r=g.next();!r.done;r=g.next())if(r.value&&r.value.key)break}
    catch(e){if(!(e instanceof $Halt))throw e}
    finally{$scr=keep;$cy=ky;$cx=kx;$show=was}
  }
}

/* ---------- the help library: VMS HELP, MORIAHLP.HLB ---------- */
function* moria_help(level){
  prt('[Entering Moria Help Library, Use ^Z to resume game]',1,1);
  put_qio();
  yield* $help(String(level||'').trim());
}
/* arrays: the source runs with checking off, and reads a little past its bounds (mass_genocide's m_list[0] with no
   monsters); here those slots exist and read as zero memory would */
function $arr(lo,hi,f){var a=new Array(hi+2);for(var i=0;i<=hi+1;i++)a[i]=f();return a}
function $zeros(hi){return new Array(hi+2).fill(0)}
/* ---------- HELP: MORIAHLP.HLB could not be read back out of the copy that survives (its records are broken by
   stray bytes), so HELP finds no library, as on a system where it was never installed ---------- */
function* $help(topic){
  $writeln('');
  $writeln('%HELP-E-OPENIN, error opening '+moria_hlp+' as input');
  $writeln('-RMS-E-FNF, file not found');
  put_qio();
  var c={v:''};
  yield* inkey(c);
}
/* the driver's handles on the run */
var $main0=$main;
$main={main:function(){return $main0()},argv:function(a){$argv=a},screen:function(){return {scr:$scr,cy:$cy,cx:$cx}},keys:function(){return $keys},onshow:function(f){$show=f}};
/* ---------- moria.pas and its include files ---------- */
var $S1=$set([25,30,32,80,77,15,13]),$S2=$set([30,31,33,34,35,36]),$S3=$set([10,11,12,20,21,22,23]),$S4=$set([21,70,71,75,76,91]),$S5=$set([70,71,75,76]),$S6=$set([40,45,55,65,70,71,75,76,90]),$S7=$set([1,2,4,5,6,7]),$S8=$set([10,11,12]),$S9=$set([10,11,12,15]),$S10=$set([4,5]),$S11=$set([101,102,109,110]),$S12=$set([102,103,104,105,107,108,109,110]),$S13=$set(["a","e","i","o","u","A","E","I","O","U"]),$S14=$set([3,13,25,26,27,32]),$S15=$set([1,2,4]),$S16=$set([1,2,4,5]),$S17=$set([1,6,9]),$S18=$set([11,12]),$S19=$set([20,21,22,23,30,31,32,33,34,35,36]),$S20=$set([20,21,22,23]),$S21=$set([10,11,12,13]),$S22=$set([70,71,75,76,80]),$S23=$set([40,45]),$S24=$set([55,60,65]),$S25=$set([0,8,9]),$S26=$set([4,5,6]),$S27=$set([1,2]),$S28=$set([4]),$S29=$set([1,2,3,4,6,7,8,9]),$S30=$set([101,109]),$S31=$set([23,33,34,35,65]),$S32=$set([12,20,21,22,30,31,32,36,55,70,71]),$S33=$set([75,76]),$S34=$set([1,2,11,12,20,21,22,30,31,32,36]),$S35=$set([90,91]),$S36=$set([10,11,12,20,21,22,23,77]),$S37=$set([5,6]),$S38=$set([13]),$S39=$set([77]),$S40=$set([107,108]),$S41=$set([101,102,104,105,109]),$S42=$set([101,102]),$S43=$set([45,60,65]),$S44=$set([]),$S45=$set([12,20,21,22,30,31,32,33,34,35,36,55,70,71,80,104,105]),$S46=$set([12,20,21,22,30,31,32,36,55,70,71,75,76,80,104,105]),$S47=$set([2,101,102,105,109]),$S48=$set([80]),$S49=$set([70,71]),$S50=$set([4,25]),$S51=$set([65]),$S52=$set([55]),$S53=$set([90]),$S54=$set([91]);
/* Moria Version 4.8	COPYRIGHT (c) Robert Alan Koeneke */
/* Public Domain */
/*  */
/* I lovingly dedicate this game to hackers and adventurers */
/* everywhere... */
/*  */
/*  */
/* Designer and Programmer : Robert Alan Koeneke */
/* University of Oklahoma */
/*  */
/* Assitant Programmers    : Jimmey Wayne Todd */
/* University of Oklahoma */
/*  */
/* Gary D. McAdoo */
/* University of Oklahoma */
/*  */
/* Moria may be copied and modified freely as long as the above */
/* credits are retained.  No one who-so-ever may sell or market */
/* this software in any form without the expressed written consent */
/* of the author Robert Alan Koeneke. */
/*  */
/* Globals						-RAK- */
/* Note to the Wizard: */
/* Tweaking these constants can *GREATLY* change the game. */
/* Two years of constant tuning have generated these */
/* values.  Minor adjustments are encouraged, but you must */
/* be very careful not to unbalance the game.  Moria was */
/* meant to be challenging, not a give away.  Many */
/* adjustments can cause the game to act strangely, or even */
/* cause errors. */
/* Current version number of Moria */
var cur_version=Math.fround(4.8);
/* QIOW constants, see $IODEF in STARLET.MLB */
var io_S__writevblk=48;
/* 48D, 0030H */
var io_S__ttyreadall=58;
/* 58D, 003AH */
var io_S_m_noecho=64;
/* 64D, 0040H */
var io_S_m_nowait=128;
/* 128D, 0080H */
var io_S_m_purge=2048;
/* 2048D, 0800H */
var io_S_mor_output=io_S__writevblk;
var io_S_mor_input=(io_S__ttyreadall+io_S_m_noecho);
var io_S_mor_delay=(io_S_mor_input+io_S_m_nowait);
var io_S_mor_ipurge=(io_S_mor_delay+io_S_m_purge);
/* IO bug exists at high baud rates (baud >= 9600).  This bug */
/* is believed to be in the device driver.  It can be avoided by */
/* hibernating the process a small amount of time before perform- */
/* ing a QIOW read operation.                            -RAK- */
/* This constant no longer used after VMS 4.0 */
var io_S_mor_iopause=5;
/* x/100 seconds of sleep before inkey */
/* Encryption constants */
/* Note: These numbers were pulled from the air, and can be */
/* changed.  If changed, characters produced from other */
/* versions will fail to restore. */
var encrypt_seed1=1175191;
var encrypt_seed2=997551771;
/* Dungeon size parameters */
var max_height=66;
/* Multiple of 11; >= 22 */
var max_width=198;
/* Multiple of 33; >= 66 */
var screen_height=22;
var screen_width=66;
/* Output dungeon section sizes */
var outpage_height=44;
/* 44 lines of dungeon per section */
var outpage_width=99;
/* 100 columns of dungeon per section */
/* Dungeon generation values */
/* Note: The entire design of dungeon can be changed by only */
/* slight adjustments here. */
var dun_tun_rnd=36;
/* Random direction (4 is min) */
var dun_tun_chg=70;
/* Chance of changing direction (99 max) */
var dun_tun_fnd=12;
/* Distance for auto find to kick in */
var dun_tun_con=15;
/* Chance of extra tunneling */
var dun_roo_mea=32;
/* Mean of # of rooms, standard dev=2 */
var dun_tun_pen=25;
/* % chance of room doors */
var dun_tun_jct=15;
/* % chance of doors at tunnel junctons */
var dun_str_den=5;
/* Density of streamers */
var dun_str_rng=2;
/* Width of streamers */
var dun_str_mag=3;
/* Number of magma streamers */
var dun_str_mc=95;
/* 1/x chance of treasure per magma */
var dun_str_qua=2;
/* Number of quartz streamers */
var dun_str_qc=55;
/* 1/x chance of treasure per quartz */
var dun_unusual=300;
/* Level/x chance of unusual room */
/* Store constants */
var max_owners=18;
/* Number of owners to choose from */
var max_stores=6;
/* Number of different stores */
var store_inven_max=24;
/* Max number of discrete objs in inven */
var store_S_choices=26;
/* Number of items to choice stock from */
var store_S_max_inven=20;
/* Max diff objs in stock before auto sell */
var store_S_min_inven=14;
/* Min diff objs in stock before auto buy */
var store_S_turn_around=3;
/* Amount of buying and selling normally */
var inven_init_max=105;
/* Size of store init array */
var cost_adj=Math.fround(1.00);
/* Adjust prices for buying and selling */
/* Treasure constants */
var inven_max=35;
/* Size of inventory array(Do not change) */
var max_obj_level=50;
/* Maximum level of magic in dungeon */
var obj_great=20;
/* 1/n Chance of item being a Great Item */
var max_objects=344;
/* Number of objects for universe */
var max_gold=18;
/* Number of different types of gold */
var max_talloc=225;
/* Max objects per level */
var treas_room_alloc=7;
/* Amount of objects for rooms */
var treas_any_alloc=2;
/* Amount of objects for corridors */
var treas_gold_alloc=2;
/* Amount of gold (and gems) */
/* Magic Treasure Generation constants */
/* Note: Number of special objects, and degree of enchantments */
/* can be adjusted here. */
var obj_std_adj=Math.fround(1.25);
/* Adjust STD per level */
var obj_std_min=7;
/* Minimum STD */
var obj_town_level=7;
/* Town object generation level */
var obj_base_magic=15;
/* Base amount of magic */
var obj_base_max=70;
/* Max amount of magic */
var obj_div_special=6;
/* magic_chance/# = special magic */
var obj_div_cursed=Math.fround(1.3);
/* magic_chance/# = cursed items */
/* Constants describing limits of certain objects */
var obj_S_lamp_max=15000;
/* Maximum amount that lamp can be filled */
var obj_S_bolt_range=18;
/* Maximum range of bolts and balls */
var obj_S_rune_prot=3000;
/* Rune of protection resistance */
/* Creature contants */
var max_creatures=279;
/* Number of creatures defined for univ */
var max_malloc=(100+1);
/* Max that can be allocated */
var max_malloc_chance=160;
/* 1/x chance of new monster each round */
var max_mons_level=40;
/* Maximum level of creatures */
var max_sight=20;
/* Maximum dis a creature can be seen */
var max_spell_dis=20;
/* Maximum dis creat. spell can be cast */
var max_mon_mult=75;
/* Maximum reproductions on a level */
var mon_mult_adj=7;
/* High value slows multiplication */
var mon_nasty=50;
/* Dun_level/x chance of high level creat */
var min_malloc_level=14;
/* Minimum number of monsters/level */
var min_malloc_td=4;
/* Number of people on town level (day) */
var min_malloc_tn=8;
/* Number of people on town level (night) */
var win_mon_tot=2;
/* Total number of "win" creatures */
var win_mon_appear=50;
/* Level where winning creatures begin */
var mon_S_summon_adj=2;
/* Adjust level of summoned creatures */
var mon_S_drain_life=2;
/* Percent of player exp drained per hit */
/* Trap constants */
var max_trapa=18;
/* Number of defined traps */
var max_trapb=19;
/* Includes secret doors */
/* Descriptive constants */
var max_colors=67;
/* Used with potions */
var max_mush=29;
/* Used with mushrooms */
var max_woods=41;
/* Used with staffs */
var max_metals=31;
/* Used with wands */
var max_rocks=52;
/* Used with rings */
var max_amulets=39;
/* Used with amulets */
var max_syllables=153;
/* Used with scrolls */
/* Player constants */
var max_player_level=40;
/* Maximum possible character level */
var max_races=8;
/* Number of defined races */
var max_class=6;
/* Number of defined classes */
var use_device=3;
/* x> Harder devices x< Easier devices */
var max_background=128;
/* Number of types of histories for univ */
var player_food_full=10000;
/* Getting full */
var player_food_max=15000;
/* Maximum food value, beyond is wasted */
var player_food_faint=300;
/* Character begins fainting */
var player_food_weak=1000;
/* Warn player that he is getting very low */
var player_food_alert=2000;
/* Warn player that he is getting low */
var player_S_regen_faint=Math.fround(0.0005);
/* Regen factor when fainting */
var player_S_regen_weak=Math.fround(0.0015);
/* Regen factor when weak */
var player_S_regen_normal=Math.fround(0.0030);
/* Regen factor when full */
var player_S_regen_hpbase=Math.fround(0.0220);
/* Min amount hp regen */
var player_S_regen_mnbase=Math.fround(0.0080);
/* Min amount mana regen */
var player_weight_cap=130;
/* "#"*(1/10 pounds) per strength point */
var player_exit_pause=6;
/* Pause time before player can re-roll */
/* Base to hit constants */
var bth_lev_adj=3;
/* Adjust BTH per level */
var bth_plus_adj=3;
/* Adjust BTH per plus-to-hit */
var bth_hit=12;
/* Automatic hit; 1/bth_hit */
/* Misc */
var null_=$chr(0);
/* For char saver */
/* Descrip of creature */
/* Bit field */
/* Creature spells */
/* Bit field */
/* Inactive counter */
/* Exp value for kill */
/* Area affect radius */
/* AC */
/* Movement speed */
/* Character rep. */
/* Creatures hit die */
/* Type attack and damage */
/* Level of creature */
/* Hit points */
/* Inactive counter */
/* Cur dis from player */
/* Pointer into creature */
/* Pointer to next block */
/* Movement speed */
/* Note: FY and FX constrain dungeon size to 255 */
/* Y Pointer into map */
/* X Pointer into map */
/* Rounds stunned */
/* On if shown */
/* On if confused */
/* Object name */
/* Catagory number */
/* Character representation */
/* Special flags */
/* Misc. use variable */
/* Cost of item */
/* Sub-catagory number */
/* Weight */
/* Number of items */
/* Pluses to hit */
/* Pluses to damage */
/* Normal AC */
/* Pluses to AC */
/* Damage when hits */
/* Level item found */
/* Name of character */
/* Race of character */
/* Sex of character */
/* Character's title */
/* Character's class */
/* Max experience */
/* Cur experienc */
/* Gold */
/* Characters age */
/* Height */
/* Weight */
/* Level */
/* Max level explored */
/* Chance in search */
/* Frenq of search */
/* Base to hit */
/* BTH with bows */
/* Mana points */
/* Max hit pts */
/* Pluses to hit */
/* Pluses to dam */
/* Total AC */
/* Magical AC */
/* Display +ToHit */
/* Display +ToDam */
/* Display +ToAC */
/* Display +ToTAC */
/* % to Disarm */
/* Saving throw */
/* Social Class */
/* # of class */
/* # of race */
/* Char hit die */
/* Stealth factor */
/* Experience factor */
/* Cur mana pts */
/* Cur hit pts */
/* History record */
/* Max strength */
/* Current strength */
/* Max dexterity */
/* Current dexterity */
/* Max constitution */
/* Current constitution */
/* Max intelligence */
/* Current intelligence */
/* Max wisdom */
/* Current wisdom */
/* Max charisma */
/* Current charisma */
/* Status of player */
/* Rest counter */
/* Blindness counter */
/* Paralysis counter */
/* Confusion counter */
/* Food counter */
/* Food per round */
/* Protection fr. evil */
/* Cur speed adjust */
/* Temp speed change */
/* Temp speed change */
/* Fear */
/* Poisoned */
/* Halucinate */
/* Protect VS evil */
/* Increases AC */
/* Heroism */
/* Super Heroism */
/* Blessed */
/* Timed heat resist */
/* Timed cold resist */
/* Timed see invisible */
/* Timed teleport level */
/* See warm creatures */
/* Timed infra vision */
/* Can see invisible */
/* Random teleportation */
/* Never paralyzed */
/* Lower food needs */
/* Agravate monsters */
/* Resistance to fire */
/* Resistance to cold */
/* Resistance to acid */
/* Regenerate hit pts */
/* Resistance to light */
/* No damage falling */
/* Keep strength */
/* Keep intelligence */
/* Keep wisdom */
/* Keep constitution */
/* Keep dexterity */
/* Keep charisma */
/* Glowing hands... */
/* Type of race */
/* adjustments */
/* Base age of character */
/* Maximum age of character */
/* base height for males */
/* mod height for males */
/* base weight for males */
/* mod weight for males */
/* base height females */
/* mod height for females */
/* base weight for female */
/* mod weight for females */
/* Base experience factor */
/* base chance to disarm */
/* base chance for search */
/* Stealth of character */
/* frequency of auto search */
/* adj base chance to hit */
/* adj base to hit with bows */
/* Race base for saving throw */
/* Base hit points for race */
/* See infra-red */
/* Bit field for class types */
/* type of class */
/* Class experience factor */
/* Adjust hit points */
/* mod disarming traps */
/* modifier to searching */
/* modifier to stealth */
/* modifier to freq-of-search */
/* modifier to base to hit */
/* modifier to base to hit - bows */
/* Class modifier to save */
/* Class modifier for strength */
/* Class modifier for intelligence */
/* Class modifier for wisdom */
/* Class modifier for dexterity */
/* Class modifier for constitution */
/* Class modifier for charisma */
/* class use priest spells */
/* class use mage spells */
/* History information */
/* Die roll needed for history */
/* Table number */
/* Pointer to next table */
/* Bonus to the Social Class */
var player_max_exp=0;
/* Max exp possible */
var seed=0;
/* Contains seed # */
var randes_seed=0;
/* For encoding colors */
var town_seed=0;
/* Seed for town genera */
var channel=0;
/* I/O channel # */
var io_S_bin_pause=({l0:0,l1:0});
/* I/O pause time */
var cur_height=0;
var cur_width=0;
/* Cur dungeon size */
var dun_level=0;
/* Cur dungeon level */
var missle_ctr=0;
/* Counter for missles */
var msg_line=0;
/* Contains message txt */
var msg_flag=false;
/* Set with first msg */
var old_msg="";
/* Last message */
var generate=false;
/* Generate next level */
var death=false;
/* True if died */
var died_from="";
/* What killed him */
var find_flag=false;
/* Used in MORIA */
var reset_flag=false;
/* Used in MORIA */
var cave_flag=false;
/* Used in GET_PANEL */
var light_flag=false;
/* Used in MOVE_LIGHT */
var redraw=false;
/* For redraw screen */
var stat_column=0;
/* Column for stats */
var print_stat=0;
/* Flag for stats */
var turn=0;
/* Cur trun of game */
var wizard1=false;
/* Wizard flag */
var wizard2=false;
/* Wizard flag */
var used_line=$arr(2,23,()=>false);
var password1="";
var password2="";
var wdata=$arr(1,2,()=>$zeros(12));
var days=$arr(1,7,()=>"");
var closing_flag=0;
/* Used for closing */
/* Bit testing array */
var bit_array=$zeros(32);
/* External file names; are all located in directory with image */
var moria_hou="";
var moria_mor="";
var moria_mas="";
var moria_top="";
var moria_hlp="";
/* Following are calculated from max dungeon sizes */
var max_panel_rows=0;
var max_panel_cols=0;
var quart_height=0;
var quart_width=0;
var panel_row=0;
var panel_col=0;
var panel_row_min=0;
var panel_row_max=0;
var panel_col_min=0;
var panel_col_max=0;
var panel_col_prt=0;
var panel_row_prt=0;
/* Following are all floor definitions */
var cave=$arr(1,max_height,()=>$arr(1,max_width,()=>({cptr:0,tptr:0,fval:0,fopen:false,fm:false,pl:false,tl:false})));
var blank_floor=({cptr:0,tptr:0,fval:0,fopen:false,fm:false,pl:false,tl:false});
var dopen_floor=({ftval:0,ftopen:false});
var lopen_floor=({ftval:0,ftopen:false});
var corr_floor1=({ftval:0,ftopen:false});
var corr_floor2=({ftval:0,ftopen:false});
var corr_floor3=({ftval:0,ftopen:false});
var corr_floor4=({ftval:0,ftopen:false});
var rock_wall1=({ftval:0,ftopen:false});
var rock_wall2=({ftval:0,ftopen:false});
var rock_wall3=({ftval:0,ftopen:false});
var boundry_wall=({ftval:0,ftopen:false});
/* Following are set definitions */
var floor_set=$set([]);
var wall_set=$set([]);
var pwall_set=$set([]);
var corr_set=$set([]);
var trap_set=$set([]);
var light_set=$set([]);
/* Following are player variables */
var py=({misc:({name_:"",race:"",sex:"",title:"",tclass:"",max_exp:0,exp:0,au:0,age:0,ht:0,wt:0,lev:0,max_lev:0,srh:0,fos:0,bth:0,bthb:0,mana:0,mhp:0,ptohit:0,ptodam:0,pac:0,ptoac:0,dis_th:0,dis_td:0,dis_ac:0,dis_tac:0,disarm:0,save:0,sc:0,pclass:0,prace:0,hitdie:0,stl:0,expfact:0,cmana:0,chp:0,history:$arr(1,5,()=>"")}),stat:({str:0,cstr:0,dex:0,cdex:0,con:0,ccon:0,int:0,cint:0,wis:0,cwis:0,chr:0,cchr:0}),flags:({status:0,rest:0,blind:0,paralysis:0,confused:0,food:0,food_digested:0,protection:0,speed:0,fast:0,slow:0,afraid:0,poisoned:0,image:0,protevil:0,invuln:0,hero:0,shero:0,blessed:0,resist_heat:0,resist_cold:0,detect_inv:0,word_recall:0,see_infra:0,tim_infra:0,see_inv:false,teleport:false,free_act:false,slow_digest:false,aggravate:false,fire_resist:false,cold_resist:false,acid_resist:false,regenerate:false,lght_resist:false,ffall:false,sustain_str:false,sustain_int:false,sustain_wis:false,sustain_con:false,sustain_dex:false,sustain_chr:false,confuse_monster:false})});
var player_title=$arr(1,max_class,()=>$arr(1,max_player_level,()=>""));
var player_exp=$zeros(max_player_level);
var acc_exp=0;
/* Accumulator for fractional exp */
var bare_hands="";
var char_row=0;
var char_col=0;
var com_val=0;
var pclass=0;
var sex_type="";
var race=$arr(1,max_races,()=>({trace:"",str_adj:0,int_adj:0,wis_adj:0,dex_adj:0,con_adj:0,chr_adj:0,b_age:0,m_age:0,m_b_ht:0,m_m_ht:0,m_b_wt:0,m_m_wt:0,f_b_ht:0,f_m_ht:0,f_b_wt:0,f_m_wt:0,b_exp:0,b_dis:0,srh:0,stl:0,fos:0,bth:0,bthb:0,bsav:0,bhitdie:0,infra:0,tclass:0}));
var background=$arr(1,max_background,()=>({info:"",roll:0,chart:0,next:0,bonus:0}));
var rgold_adj=$arr(1,max_races,()=>$zeros(max_races));
var class_=$arr(1,max_class,()=>({title:"",m_exp:0,adj_hd:0,mdis:0,msrh:0,mstl:0,mfos:0,mbth:0,mbthb:0,msav:0,madj_str:0,madj_int:0,madj_wis:0,madj_dex:0,madj_con:0,madj_chr:0,pspell:false,mspell:false}));
var magic_spell=$arr(1,max_class,()=>$arr(1,31,()=>({sname:"",slevel:0,smana:0,sexp:0,sfail:0,learned:false})));
var mush=({name_:"",tval:0,tchar:'\0',flags:0,p1:0,cost:0,subval:0,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:"",level:0});
var player_init=$arr(1,max_class,()=>$zeros(5));
var total_winner=false;
/* Following are store definitions */
var owners=$arr(1,max_owners,()=>({owner_name:"",max_cost:0,max_inflate:0,min_inflate:0,haggle_per:0,owner_race:0,insult_max:0}));
var store=$arr(1,max_stores,()=>({store_open:0,owner:0,insult_cur:0,store_ctr:0,store_inven:$arr(1,store_inven_max,()=>({scost:0,sitem:({name_:"",tval:0,tchar:'\0',flags:0,p1:0,cost:0,subval:0,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:"",level:0})}))}));
var store_door=$arr(1,max_stores,()=>({name_:"",tval:0,tchar:'\0',flags:0,p1:0,cost:0,subval:0,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:"",level:0}));
var store_choice=$arr(1,max_stores,()=>$zeros(store_S_choices));
var store_buy=$arr(1,max_stores,()=>$set([]));
/* Following are treasure arrays	and variables */
var object_list=$arr(1,max_objects,()=>({name_:"",tval:0,tchar:'\0',flags:0,p1:0,cost:0,subval:0,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:"",level:0}));
var object_ident=$arr(1,max_objects,()=>false);
var t_level=$zeros(max_obj_level);
var gold_list=$arr(1,max_gold,()=>({name_:"",tval:0,tchar:'\0',flags:0,p1:0,cost:0,subval:0,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:"",level:0}));
var t_list=$arr(1,max_talloc,()=>({name_:"",tval:0,tchar:'\0',flags:0,p1:0,cost:0,subval:0,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:"",level:0}));
var inventory=$arr(1,inven_max,()=>({name_:"",tval:0,tchar:'\0',flags:0,p1:0,cost:0,subval:0,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:"",level:0}));
var inventory_init=$arr(1,inven_init_max,()=>({name_:"",tval:0,tchar:'\0',flags:0,p1:0,cost:0,subval:0,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:"",level:0}));
var blank_treasure=({name_:"",tval:0,tchar:'\0',flags:0,p1:0,cost:0,subval:0,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:"",level:0});
var inven_ctr=0;
/* Total different obj's */
var inven_weight=0;
/* Cur carried weight */
var equip_ctr=0;
/* Cur equipment ctr */
var tcptr=0;
/* Cur treasure heap ptr */
/* Following are feature objects defined for dungeon */
var trap_lista=$arr(1,max_trapa,()=>({name_:"",tval:0,tchar:'\0',flags:0,p1:0,cost:0,subval:0,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:"",level:0}));
var trap_listb=$arr(1,max_trapb,()=>({name_:"",tval:0,tchar:'\0',flags:0,p1:0,cost:0,subval:0,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:"",level:0}));
var scare_monster=({name_:"",tval:0,tchar:'\0',flags:0,p1:0,cost:0,subval:0,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:"",level:0});
/* Special trap */
var rubble=({name_:"",tval:0,tchar:'\0',flags:0,p1:0,cost:0,subval:0,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:"",level:0});
var door_list=$arr(1,3,()=>({name_:"",tval:0,tchar:'\0',flags:0,p1:0,cost:0,subval:0,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:"",level:0}));
var up_stair=({name_:"",tval:0,tchar:'\0',flags:0,p1:0,cost:0,subval:0,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:"",level:0});
var down_stair=({name_:"",tval:0,tchar:'\0',flags:0,p1:0,cost:0,subval:0,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:"",level:0});
/* Following are creature arrays and variables */
var c_list=$arr(1,max_creatures,()=>({name_:"",cmove:0,spells:0,cdefense:0,sleep:0,mexp:0,aaf:0,ac:0,speed:0,cchar:'\0',hd:"",damage:"",level:0}));
var m_list=$arr(1,max_malloc,()=>({hp:0,csleep:0,cdis:0,mptr:0,nptr:0,cspeed:0,fy:0,fx:0,stuned:0,ml:false,confused:false}));
var m_level=$zeros(max_mons_level);
var blank_monster=({hp:0,csleep:0,cdis:0,mptr:0,nptr:0,cspeed:0,fy:0,fx:0,stuned:0,ml:false,confused:false});
/* Blank monster values */
var muptr=0;
/* Cur used monster ptr */
var mfptr=0;
/* Cur free monster ptr */
var mon_tot_mult=0;
/* # of repro's of creature */
/* Following are arrays for descriptive pieces */
var colors=$arr(1,max_colors,()=>"");
var mushrooms=$arr(1,max_mush,()=>"");
var woods=$arr(1,max_woods,()=>"");
var metals=$arr(1,max_metals,()=>"");
var rocks=$arr(1,max_rocks,()=>"");
var amulets=$arr(1,max_amulets,()=>"");
var syllables=$arr(1,max_syllables,()=>"");
var vowel_set=$set([]);
/* Following are variables for the Save Character Routines */
var finam="";
var key_rec=({file_id:"",seed:0});
/* Cursor variables, used for cursor positioning */
var cursor_r=$arr(1,24,()=>"");
var curlen_r=0;
var cursor_c=$arr(1,80,()=>"");
var curlen_c=0;
var cursor_l=0;
var row_first=false;
var cursor_erl="";
var cursor_erp="";
wizard1=false;
wizard2=false;
wdata=[0,[11065,87,36,139,197,12,22,228,250,54,148,136,163],[122565,181,170,214,182,212,8,195,173,86,76,252,124]];
used_line=[0,0,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false];
death=false;
total_winner=false;
stat_column=1;
turn=0;
pclass=0;
print_stat=0;
bit_array=[0,1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304,8388608,16777216,33554432,67108864,134217728,268435456,536870912,1073741824,2147483648];
days=[0,"SUN:XXXXXXXXXXXXXXXXXXXXXXXX|","MON:XXXXXXXX.........XXXXXXX|","TUE:XXXXXXXX.........XXXXXXX|","WED:XXXXXXXX.........XXXXXXX|","THU:XXXXXXXX.........XXXXXXX|","FRI:XXXXXXXX.........XXXXXXX|","SAT:XXXXXXXXXXXXXXXXXXXXXXXX|"];
closing_flag=0;
blank_floor={cptr:0,tptr:0,fval:0,fopen:false,fm:false,pl:false,tl:false};
dopen_floor={ftval:1,ftopen:true};
lopen_floor={ftval:2,ftopen:true};
corr_floor1={ftval:4,ftopen:true};
corr_floor2={ftval:5,ftopen:true};
corr_floor3={ftval:6,ftopen:true};
corr_floor4={ftval:7,ftopen:false};
rock_wall1={ftval:10,ftopen:false};
rock_wall2={ftval:11,ftopen:false};
rock_wall3={ftval:12,ftopen:false};
boundry_wall={ftval:15,ftopen:false};
py={misc:{name_:" ",race:" ",sex:" ",title:" ",tclass:" ",max_exp:0,exp:0,au:0,age:0,ht:0,wt:0,lev:0,max_lev:0,srh:0,fos:0,bth:0,bthb:0,mana:0,mhp:0,ptohit:0,ptodam:0,pac:0,ptoac:0,dis_th:0,dis_td:0,dis_ac:0,dis_tac:0,disarm:0,save:0,sc:0,pclass:0,prace:0,hitdie:0,stl:0,expfact:0,cmana:0,chp:0,history:[0,"","","","",""]},stat:{str:0,cstr:0,dex:0,cdex:0,con:0,ccon:0,int:0,cint:0,wis:0,cwis:0,chr:0,cchr:0},flags:{status:0,rest:0,blind:0,paralysis:0,confused:0,food:7500,food_digested:2,protection:0,speed:0,fast:0,slow:0,afraid:0,poisoned:0,image:0,protevil:0,invuln:0,hero:0,shero:0,blessed:0,resist_heat:0,resist_cold:0,detect_inv:0,word_recall:0,see_infra:0,tim_infra:0,see_inv:false,teleport:false,free_act:false,slow_digest:false,aggravate:false,fire_resist:false,cold_resist:false,acid_resist:false,regenerate:false,lght_resist:false,ffall:false,sustain_str:false,sustain_int:false,sustain_wis:false,sustain_con:false,sustain_dex:false,sustain_chr:false,confuse_monster:false}};
bare_hands="1d1";
acc_exp=Math.fround(0.0);
magic_spell=[0,[0,{sname:"",slevel:99,smana:99,sexp:0,sfail:0,learned:false},{sname:"",slevel:99,smana:99,sexp:0,sfail:0,learned:false},{sname:"",slevel:99,smana:99,sexp:0,sfail:0,learned:false},{sname:"",slevel:99,smana:99,sexp:0,sfail:0,learned:false},{sname:"",slevel:99,smana:99,sexp:0,sfail:0,learned:false},{sname:"",slevel:99,smana:99,sexp:0,sfail:0,learned:false},{sname:"",slevel:99,smana:99,sexp:0,sfail:0,learned:false},{sname:"",slevel:99,smana:99,sexp:0,sfail:0,learned:false},{sname:"",slevel:99,smana:99,sexp:0,sfail:0,learned:false},{sname:"",slevel:99,smana:99,sexp:0,sfail:0,learned:false},{sname:"",slevel:99,smana:99,sexp:0,sfail:0,learned:false},{sname:"",slevel:99,smana:99,sexp:0,sfail:0,learned:false},{sname:"",slevel:99,smana:99,sexp:0,sfail:0,learned:false},{sname:"",slevel:99,smana:99,sexp:0,sfail:0,learned:false},{sname:"",slevel:99,smana:99,sexp:0,sfail:0,learned:false},{sname:"",slevel:99,smana:99,sexp:0,sfail:0,learned:false},{sname:"",slevel:99,smana:99,sexp:0,sfail:0,learned:false},{sname:"",slevel:99,smana:99,sexp:0,sfail:0,learned:false},{sname:"",slevel:99,smana:99,sexp:0,sfail:0,learned:false},{sname:"",slevel:99,smana:99,sexp:0,sfail:0,learned:false},{sname:"",slevel:99,smana:99,sexp:0,sfail:0,learned:false},{sname:"",slevel:99,smana:99,sexp:0,sfail:0,learned:false},{sname:"",slevel:99,smana:99,sexp:0,sfail:0,learned:false},{sname:"",slevel:99,smana:99,sexp:0,sfail:0,learned:false},{sname:"",slevel:99,smana:99,sexp:0,sfail:0,learned:false},{sname:"",slevel:99,smana:99,sexp:0,sfail:0,learned:false},{sname:"",slevel:99,smana:99,sexp:0,sfail:0,learned:false},{sname:"",slevel:99,smana:99,sexp:0,sfail:0,learned:false},{sname:"",slevel:99,smana:99,sexp:0,sfail:0,learned:false},{sname:"",slevel:99,smana:99,sexp:0,sfail:0,learned:false},{sname:"",slevel:99,smana:99,sexp:0,sfail:0,learned:false}],[0,{sname:"Magic Missile",slevel:1,smana:1,sexp:5,sfail:22,learned:false},{sname:"Detect Monsters",slevel:1,smana:1,sexp:5,sfail:23,learned:false},{sname:"Phase Door",slevel:1,smana:2,sexp:4,sfail:24,learned:false},{sname:"Light Area",slevel:1,smana:2,sexp:4,sfail:26,learned:false},{sname:"Cure Light Wounds",slevel:3,smana:3,sexp:8,sfail:25,learned:false},{sname:"Find Hidden Traps/Doors",slevel:3,smana:3,sexp:6,sfail:55,learned:false},{sname:"Stinking Cloud",slevel:3,smana:4,sexp:8,sfail:27,learned:false},{sname:"Confusion",slevel:3,smana:4,sexp:6,sfail:30,learned:false},{sname:"Lightning Bolt",slevel:5,smana:4,sexp:25,sfail:30,learned:false},{sname:"Trap/Door Destruction",slevel:5,smana:5,sexp:30,sfail:30,learned:false},{sname:"Sleep I",slevel:5,smana:5,sexp:20,sfail:30,learned:false},{sname:"Cure Poison",slevel:5,smana:5,sexp:25,sfail:35,learned:false},{sname:"Teleport Self",slevel:7,smana:6,sexp:35,sfail:35,learned:false},{sname:"Remove Curse",slevel:7,smana:6,sexp:40,sfail:50,learned:false},{sname:"Frost Bolt",slevel:7,smana:6,sexp:50,sfail:40,learned:false},{sname:"Turn Stone to Mud",slevel:9,smana:7,sexp:75,sfail:44,learned:false},{sname:"Create Food",slevel:9,smana:7,sexp:75,sfail:45,learned:false},{sname:"Recharge Item I",slevel:9,smana:7,sexp:90,sfail:75,learned:false},{sname:"Sleep II",slevel:9,smana:7,sexp:75,sfail:45,learned:false},{sname:"Polymorph Other",slevel:11,smana:7,sexp:100,sfail:45,learned:false},{sname:"Identify",slevel:11,smana:7,sexp:75,sfail:99,learned:false},{sname:"Sleep III",slevel:13,smana:7,sexp:90,sfail:50,learned:false},{sname:"Fire Bolt",slevel:15,smana:9,sexp:100,sfail:50,learned:false},{sname:"Slow Monster",slevel:17,smana:9,sexp:125,sfail:50,learned:false},{sname:"Frost Ball",slevel:19,smana:12,sexp:150,sfail:55,learned:false},{sname:"Recharge Item II",slevel:21,smana:12,sexp:175,sfail:90,learned:false},{sname:"Teleport Other",slevel:23,smana:12,sexp:200,sfail:60,learned:false},{sname:"Haste Self",slevel:25,smana:12,sexp:250,sfail:65,learned:false},{sname:"Fire Ball",slevel:29,smana:18,sexp:350,sfail:65,learned:false},{sname:"Word of Destruction",slevel:33,smana:21,sexp:500,sfail:80,learned:false},{sname:"Genocide",slevel:37,smana:25,sexp:800,sfail:95,learned:false}],[0,{sname:"Detect Evil",slevel:1,smana:1,sexp:3,sfail:10,learned:false},{sname:"Cure Light Wounds",slevel:1,smana:2,sexp:4,sfail:15,learned:false},{sname:"Bless",slevel:1,smana:2,sexp:3,sfail:20,learned:false},{sname:"Remove Fear",slevel:1,smana:2,sexp:3,sfail:25,learned:false},{sname:"Call Light",slevel:3,smana:2,sexp:6,sfail:25,learned:false},{sname:"Find Traps",slevel:3,smana:3,sexp:8,sfail:27,learned:false},{sname:"Detect Doors/Stairs",slevel:3,smana:3,sexp:8,sfail:27,learned:false},{sname:"Slow Poison",slevel:3,smana:3,sexp:10,sfail:28,learned:false},{sname:"Blind Creature",slevel:5,smana:4,sexp:16,sfail:29,learned:false},{sname:"Portal",slevel:5,smana:4,sexp:20,sfail:30,learned:false},{sname:"Cure Medium Wounds",slevel:5,smana:4,sexp:20,sfail:32,learned:false},{sname:"Chant",slevel:5,smana:5,sexp:20,sfail:34,learned:false},{sname:"Sanctuary",slevel:7,smana:5,sexp:30,sfail:36,learned:false},{sname:"Create Food",slevel:7,smana:5,sexp:30,sfail:38,learned:false},{sname:"Remove Curse",slevel:7,smana:6,sexp:35,sfail:38,learned:false},{sname:"Resist Heat and Cold",slevel:7,smana:7,sexp:35,sfail:38,learned:false},{sname:"Neutralize Poison",slevel:9,smana:6,sexp:40,sfail:38,learned:false},{sname:"Orb of Draining",slevel:9,smana:7,sexp:40,sfail:38,learned:false},{sname:"Cure Serious Wounds",slevel:9,smana:7,sexp:40,sfail:40,learned:false},{sname:"Sense Invisible",slevel:11,smana:8,sexp:40,sfail:42,learned:false},{sname:"Protection from Evil",slevel:11,smana:8,sexp:50,sfail:42,learned:false},{sname:"Earthquake",slevel:11,smana:9,sexp:60,sfail:55,learned:false},{sname:"Sense Surroundings",slevel:13,smana:10,sexp:60,sfail:45,learned:false},{sname:"Cure Critical Wounds",slevel:13,smana:11,sexp:65,sfail:45,learned:false},{sname:"Turn Undead",slevel:15,smana:12,sexp:80,sfail:50,learned:false},{sname:"Prayer",slevel:15,smana:14,sexp:90,sfail:50,learned:false},{sname:"Dispell Undead",slevel:17,smana:14,sexp:125,sfail:55,learned:false},{sname:"Heal",slevel:21,smana:16,sexp:150,sfail:60,learned:false},{sname:"Dispell Evil",slevel:25,smana:20,sexp:300,sfail:70,learned:false},{sname:"Glyph of Warding",slevel:33,smana:24,sexp:500,sfail:90,learned:false},{sname:"Holy Word",slevel:39,smana:32,sexp:800,sfail:99,learned:false}],[0,{sname:"Magic Missile",slevel:99,smana:99,sexp:0,sfail:0,learned:false},{sname:"Detect Monsters",slevel:5,smana:1,sexp:2,sfail:50,learned:false},{sname:"Phase Door",slevel:7,smana:2,sexp:4,sfail:55,learned:false},{sname:"Light Area",slevel:9,smana:3,sexp:6,sfail:60,learned:false},{sname:"Cure Light Wounds",slevel:11,smana:4,sexp:8,sfail:65,learned:false},{sname:"Find Hidden Traps/Doors",slevel:13,smana:5,sexp:10,sfail:70,learned:false},{sname:"Stinking Cloud",slevel:99,smana:99,sexp:0,sfail:0,learned:false},{sname:"Confusion",slevel:15,smana:6,sexp:12,sfail:75,learned:false},{sname:"Lightning Bolt",slevel:99,smana:99,sexp:0,sfail:0,learned:false},{sname:"Trap/Door Destruction",slevel:17,smana:7,sexp:15,sfail:80,learned:false},{sname:"Sleep I",slevel:19,smana:8,sexp:20,sfail:85,learned:false},{sname:"Cure Poison",slevel:21,smana:9,sexp:25,sfail:90,learned:false},{sname:"Teleport Self",slevel:99,smana:99,sexp:0,sfail:0,learned:false},{sname:"Remove Curse",slevel:23,smana:10,sexp:30,sfail:95,learned:false},{sname:"Frost Bolt",slevel:99,smana:99,sexp:0,sfail:0,learned:false},{sname:"Turn Stone to Mud",slevel:99,smana:99,sexp:0,sfail:0,learned:false},{sname:"Create Food",slevel:25,smana:12,sexp:35,sfail:95,learned:false},{sname:"Recharge Item I",slevel:27,smana:15,sexp:45,sfail:99,learned:false},{sname:"Sleep II",slevel:99,smana:99,sexp:0,sfail:0,learned:false},{sname:"Polymorph Other",slevel:99,smana:99,sexp:0,sfail:0,learned:false},{sname:"Identify",slevel:29,smana:18,sexp:75,sfail:99,learned:false},{sname:"Sleep III",slevel:99,smana:99,sexp:0,sfail:0,learned:false},{sname:"Fire Bolt",slevel:99,smana:99,sexp:0,sfail:0,learned:false},{sname:"Slow Monster",slevel:99,smana:99,sexp:0,sfail:0,learned:false},{sname:"Frost Ball",slevel:99,smana:99,sexp:0,sfail:0,learned:false},{sname:"Recharge Item II",slevel:99,smana:99,sexp:0,sfail:0,learned:false},{sname:"Teleport Other",slevel:99,smana:99,sexp:0,sfail:0,learned:false},{sname:"Haste Self",slevel:99,smana:99,sexp:0,sfail:0,learned:false},{sname:"Fire Ball",slevel:99,smana:99,sexp:0,sfail:0,learned:false},{sname:"Word of Destruction",slevel:99,smana:99,sexp:0,sfail:0,learned:false},{sname:"Genocide",slevel:99,smana:99,sexp:0,sfail:0,learned:false}],[0,{sname:"Magic Missile",slevel:3,smana:1,sexp:6,sfail:30,learned:false},{sname:"Detect Monsters",slevel:3,smana:2,sexp:6,sfail:35,learned:false},{sname:"Phase Door",slevel:3,smana:2,sexp:8,sfail:35,learned:false},{sname:"Light Area",slevel:5,smana:3,sexp:8,sfail:35,learned:false},{sname:"Cure Light Wounds",slevel:5,smana:3,sexp:8,sfail:40,learned:false},{sname:"Find Hidden Traps/Doors",slevel:5,smana:4,sexp:10,sfail:45,learned:false},{sname:"Stinking Cloud",slevel:7,smana:6,sexp:24,sfail:40,learned:false},{sname:"Confusion",slevel:7,smana:6,sexp:20,sfail:40,learned:false},{sname:"Lightning Bolt",slevel:9,smana:7,sexp:30,sfail:40,learned:false},{sname:"Trap/Door Destruction",slevel:9,smana:8,sexp:30,sfail:45,learned:false},{sname:"Sleep I",slevel:11,smana:8,sexp:40,sfail:40,learned:false},{sname:"Cure Poison",slevel:11,smana:9,sexp:40,sfail:45,learned:false},{sname:"Teleport Self",slevel:13,smana:10,sexp:50,sfail:45,learned:false},{sname:"Remove Curse",slevel:13,smana:11,sexp:50,sfail:55,learned:false},{sname:"Frost Bolt",slevel:15,smana:12,sexp:60,sfail:50,learned:false},{sname:"Turn Stone to Mud",slevel:15,smana:13,sexp:60,sfail:50,learned:false},{sname:"Create Food",slevel:17,smana:17,sexp:60,sfail:55,learned:false},{sname:"Recharge Item I",slevel:17,smana:17,sexp:70,sfail:90,learned:false},{sname:"Sleep II",slevel:21,smana:17,sexp:70,sfail:55,learned:false},{sname:"Polymorph Other",slevel:21,smana:19,sexp:70,sfail:60,learned:false},{sname:"Identify",slevel:23,smana:25,sexp:80,sfail:95,learned:false},{sname:"Sleep III",slevel:23,smana:20,sexp:80,sfail:60,learned:false},{sname:"Fire Bolt",slevel:25,smana:20,sexp:80,sfail:60,learned:false},{sname:"Slow Monster",slevel:25,smana:21,sexp:80,sfail:65,learned:false},{sname:"Frost Ball",slevel:27,smana:21,sexp:90,sfail:65,learned:false},{sname:"Recharge Item II",slevel:29,smana:23,sexp:90,sfail:95,learned:false},{sname:"Teleport Other",slevel:31,smana:25,sexp:100,sfail:70,learned:false},{sname:"Haste Self",slevel:33,smana:25,sexp:150,sfail:75,learned:false},{sname:"Fire Ball",slevel:35,smana:25,sexp:200,sfail:80,learned:false},{sname:"Word of Destruction",slevel:37,smana:30,sexp:500,sfail:95,learned:false},{sname:"",slevel:99,smana:99,sexp:0,sfail:0,learned:false}],[0,{sname:"Detect Evil",slevel:1,smana:1,sexp:4,sfail:30,learned:false},{sname:"Cure Light Wounds",slevel:2,smana:2,sexp:8,sfail:35,learned:false},{sname:"Bless",slevel:3,smana:3,sexp:12,sfail:35,learned:false},{sname:"Remove Fear",slevel:5,smana:3,sexp:20,sfail:35,learned:false},{sname:"Call Light",slevel:5,smana:4,sexp:20,sfail:35,learned:false},{sname:"Find Traps",slevel:7,smana:5,sexp:25,sfail:40,learned:false},{sname:"Detect Doors/Stairs",slevel:7,smana:5,sexp:25,sfail:40,learned:false},{sname:"Slow Poison",slevel:9,smana:7,sexp:30,sfail:40,learned:false},{sname:"Blind Creature",slevel:9,smana:7,sexp:30,sfail:40,learned:false},{sname:"Portal",slevel:9,smana:8,sexp:30,sfail:40,learned:false},{sname:"Cure Medium Wounds",slevel:11,smana:9,sexp:40,sfail:40,learned:false},{sname:"Chant",slevel:11,smana:10,sexp:40,sfail:45,learned:false},{sname:"Sanctuary",slevel:11,smana:10,sexp:40,sfail:45,learned:false},{sname:"Create Food",slevel:13,smana:10,sexp:50,sfail:45,learned:false},{sname:"Remove Curse",slevel:13,smana:11,sexp:50,sfail:45,learned:false},{sname:"Resist Heat and Cold",slevel:15,smana:13,sexp:60,sfail:45,learned:false},{sname:"Neutralize Poison",slevel:15,smana:15,sexp:60,sfail:50,learned:false},{sname:"Orb of Draining",slevel:17,smana:15,sexp:70,sfail:50,learned:false},{sname:"Cure Serious Wounds",slevel:17,smana:15,sexp:70,sfail:50,learned:false},{sname:"Sense Invisible",slevel:19,smana:15,sexp:75,sfail:50,learned:false},{sname:"Protection from Evil",slevel:19,smana:15,sexp:75,sfail:50,learned:false},{sname:"Earthquake",slevel:21,smana:17,sexp:80,sfail:50,learned:false},{sname:"Sense Surroundings",slevel:23,smana:17,sexp:80,sfail:50,learned:false},{sname:"Cure Critical Wounds",slevel:25,smana:20,sexp:80,sfail:50,learned:false},{sname:"Turn Undead",slevel:27,smana:21,sexp:90,sfail:50,learned:false},{sname:"Prayer",slevel:29,smana:22,sexp:95,sfail:50,learned:false},{sname:"Dispell Undead",slevel:31,smana:24,sexp:100,sfail:60,learned:false},{sname:"Heal",slevel:33,smana:28,sexp:125,sfail:60,learned:false},{sname:"Dispell Evil",slevel:35,smana:32,sexp:150,sfail:70,learned:false},{sname:"Glyph of Warding",slevel:37,smana:36,sexp:200,sfail:90,learned:false},{sname:"Holy Word",slevel:39,smana:38,sexp:500,sfail:95,learned:false}]];
mush={name_:"& pint~ of fine grade mush",tval:80,tchar:",",flags:0,p1:1500,cost:0,subval:308,weight:1,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:1};
char_row=0;
char_col=0;
sex_type="FemaleMale  ";
race=[0,{trace:"Human",str_adj:0,int_adj:0,wis_adj:0,dex_adj:0,con_adj:0,chr_adj:0,b_age:14,m_age:6,m_b_ht:72,m_m_ht:6,m_b_wt:180,m_m_wt:25,f_b_ht:66,f_m_ht:4,f_b_wt:120,f_m_wt:20,b_exp:Math.fround(1.00),b_dis:0,srh:0,stl:0,fos:0,bth:0,bthb:0,bsav:0,bhitdie:10,infra:0,tclass:63},{trace:"Half-Elf",str_adj:(-1),int_adj:1,wis_adj:0,dex_adj:1,con_adj:(-1),chr_adj:1,b_age:24,m_age:16,m_b_ht:66,m_m_ht:6,m_b_wt:130,m_m_wt:15,f_b_ht:62,f_m_ht:6,f_b_wt:100,f_m_wt:10,b_exp:Math.fround(1.10),b_dis:2,srh:6,stl:1,fos:(-1),bth:0,bthb:5,bsav:3,bhitdie:9,infra:0,tclass:63},{trace:"Elf",str_adj:(-1),int_adj:2,wis_adj:1,dex_adj:1,con_adj:(-2),chr_adj:1,b_age:75,m_age:75,m_b_ht:60,m_m_ht:4,m_b_wt:100,m_m_wt:6,f_b_ht:54,f_m_ht:4,f_b_wt:80,f_m_wt:6,b_exp:Math.fround(1.20),b_dis:5,srh:8,stl:1,fos:(-2),bth:(-5),bthb:15,bsav:6,bhitdie:8,infra:0,tclass:31},{trace:"Halfling",str_adj:(-2),int_adj:2,wis_adj:1,dex_adj:3,con_adj:1,chr_adj:1,b_age:21,m_age:12,m_b_ht:36,m_m_ht:3,m_b_wt:60,m_m_wt:3,f_b_ht:33,f_m_ht:3,f_b_wt:50,f_m_wt:3,b_exp:Math.fround(1.10),b_dis:15,srh:12,stl:4,fos:(-5),bth:(-10),bthb:20,bsav:18,bhitdie:6,infra:4,tclass:11},{trace:"Gnome",str_adj:(-1),int_adj:2,wis_adj:0,dex_adj:2,con_adj:1,chr_adj:(-2),b_age:50,m_age:40,m_b_ht:42,m_m_ht:3,m_b_wt:90,m_m_wt:6,f_b_ht:39,f_m_ht:3,f_b_wt:75,f_m_wt:3,b_exp:Math.fround(1.25),b_dis:10,srh:6,stl:3,fos:(-3),bth:(-8),bthb:12,bsav:12,bhitdie:7,infra:3,tclass:15},{trace:"Dwarf",str_adj:2,int_adj:(-3),wis_adj:1,dex_adj:(-2),con_adj:2,chr_adj:(-3),b_age:35,m_age:15,m_b_ht:48,m_m_ht:3,m_b_wt:150,m_m_wt:10,f_b_ht:46,f_m_ht:3,f_b_wt:120,f_m_wt:10,b_exp:Math.fround(1.20),b_dis:2,srh:7,stl:0,fos:0,bth:15,bthb:0,bsav:9,bhitdie:9,infra:5,tclass:5},{trace:"Half-Orc",str_adj:2,int_adj:(-1),wis_adj:0,dex_adj:0,con_adj:1,chr_adj:(-4),b_age:11,m_age:4,m_b_ht:66,m_m_ht:1,m_b_wt:150,m_m_wt:5,f_b_ht:62,f_m_ht:1,f_b_wt:120,f_m_wt:5,b_exp:Math.fround(1.10),b_dis:(-3),srh:0,stl:(-1),fos:3,bth:12,bthb:(-5),bsav:(-3),bhitdie:10,infra:3,tclass:13},{trace:"Half-Troll",str_adj:4,int_adj:(-4),wis_adj:(-2),dex_adj:(-4),con_adj:3,chr_adj:(-6),b_age:20,m_age:10,m_b_ht:96,m_m_ht:10,m_b_wt:300,m_m_wt:50,f_b_ht:84,f_m_ht:8,f_b_wt:260,f_m_wt:40,b_exp:Math.fround(1.20),b_dis:(-5),srh:(-1),stl:(-2),fos:5,bth:20,bthb:(-10),bsav:(-8),bhitdie:12,infra:3,tclass:5}];
rgold_adj=[0,[0,Math.fround(0.00),Math.fround(0.05),Math.fround(0.05),Math.fround(0.10),Math.fround(0.13),Math.fround(0.15),Math.fround(0.20),Math.fround(0.25)],[0,Math.fround(0.10),Math.fround(0.00),Math.fround(0.00),Math.fround(0.05),Math.fround(0.10),Math.fround(0.20),Math.fround(0.25),Math.fround(0.30)],[0,Math.fround(0.10),Math.fround(0.05),Math.fround(0.00),Math.fround(0.05),Math.fround(0.10),Math.fround(0.20),Math.fround(0.25),Math.fround(0.30)],[0,Math.fround(0.15),Math.fround(0.10),Math.fround(0.05),(-Math.fround(0.05)),Math.fround(0.05),Math.fround(0.10),Math.fround(0.15),Math.fround(0.30)],[0,Math.fround(0.15),Math.fround(0.15),Math.fround(0.10),Math.fround(0.05),(-Math.fround(0.05)),Math.fround(0.10),Math.fround(0.15),Math.fround(0.30)],[0,Math.fround(0.15),Math.fround(0.20),Math.fround(0.20),Math.fround(0.10),Math.fround(0.10),(-Math.fround(0.05)),Math.fround(0.25),Math.fround(0.35)],[0,Math.fround(0.15),Math.fround(0.20),Math.fround(0.25),Math.fround(0.15),Math.fround(0.15),Math.fround(0.30),Math.fround(0.10),Math.fround(0.15)],[0,Math.fround(0.10),Math.fround(0.15),Math.fround(0.15),Math.fround(0.10),Math.fround(0.10),Math.fround(0.30),Math.fround(0.10),Math.fround(0.10)]];
class_=[0,{title:"Warrior",m_exp:Math.fround(0.00),adj_hd:9,mdis:25,msrh:14,mstl:1,mfos:38,mbth:68,mbthb:55,msav:30,madj_str:5,madj_int:(-2),madj_wis:(-2),madj_dex:2,madj_con:2,madj_chr:(-1),pspell:false,mspell:false},{title:"Mage",m_exp:Math.fround(0.30),adj_hd:0,mdis:30,msrh:16,mstl:2,mfos:36,mbth:34,mbthb:20,msav:20,madj_str:(-5),madj_int:3,madj_wis:0,madj_dex:0,madj_con:(-2),madj_chr:0,pspell:false,mspell:true},{title:"Priest",m_exp:Math.fround(0.10),adj_hd:3,mdis:25,msrh:16,mstl:2,mfos:32,mbth:48,mbthb:35,msav:20,madj_str:0,madj_int:(-3),madj_wis:3,madj_dex:(-1),madj_con:1,madj_chr:2,pspell:true,mspell:false},{title:"Rogue",m_exp:Math.fround(0.00),adj_hd:6,mdis:45,msrh:32,mstl:4,mfos:16,mbth:60,mbthb:66,msav:30,madj_str:3,madj_int:1,madj_wis:(-2),madj_dex:3,madj_con:2,madj_chr:(-1),pspell:false,mspell:true},{title:"Ranger",m_exp:Math.fround(0.40),adj_hd:4,mdis:30,msrh:24,mstl:3,mfos:24,mbth:56,mbthb:72,msav:25,madj_str:2,madj_int:2,madj_wis:0,madj_dex:1,madj_con:1,madj_chr:1,pspell:false,mspell:true},{title:"Paladin",m_exp:Math.fround(0.35),adj_hd:6,mdis:20,msrh:12,mstl:1,mfos:38,mbth:70,mbthb:40,msav:25,madj_str:3,madj_int:(-3),madj_wis:1,madj_dex:0,madj_con:2,madj_chr:2,pspell:true,mspell:false}];
player_title=[0,[0,"Novice","Veteran(1st)","Veteran(2nd)","Veteran(3rd)","Warrior(1st)","Warrior(2nd)","Warrior(3rd)","Swordsman-1","Swordsman-2","Swordsman-3","Hero","Swashbuckler","Myrmidon","Champion-1","Champion-2","Champion-3","Superhero","Knight","Superior Knt","Gallant Knt","Knt Errent","Keeper","Protector","Defender","Warder","Guardian Knt","Chevalier","Justiciar","Lord (1st)","Lord (2nd)","Lord (3rd)","Lord (4th)","Lord (5th)","Lord (6th)","Lord (7th)","Lord (8th)","Lord (9th)","Lord Gallant","Lord Keeper","Lord Noble"],[0,"Novice","Apprentice","Trickster-1","Trickster-2","Trickster-3","Cabalist-1","Cabalist-2","Cabalist-3","Visionist","Phantasmist","Shadowist","Spellbinder","Illusionist","Evoker (1st)","Evoker (2nd)","Evoker (3rd)","Evoker (4th)","Conjurer","Theurgist","Thaumaturer","Magician","Enchanter","Warlock","Sorcerer","Necromancer","Mage (1st)","Mage (2nd)","Mage (3rd)","Mage (4th)","Mage (5th)","Wizard (1st)","Wizard (2nd)","Wizard (3rd)","Wizard (4th)","Wizard (5th)","Wizard (6th)","Wizard (7th)","Wizard (8th)","Wizard (9th)","Wizard Lord"],[0,"Believer","Acolyte(1st)","Acolyte(2nd)","Acolyte(3rd)","Adept (1st)","Adept (2nd)","Adept (3rd)","Priest (1st)","Priest (2nd)","Priest (3rd)","Priest (4th)","Priest (5th)","Priest (6th)","Priest (7th)","Priest (8th)","Priest (9th)","Curate (1st)","Curate (2nd)","Curate (3rd)","Curate (4th)","Curate (5th)","Curate (6th)","Curate (7th)","Curate (8th)","Curate (9th)","Canon (1st)","Canon (2nd)","Canon (3rd)","Canon (4th)","Canon (5th)","Low Lama","Lama-1","Lama-2","Lama-3","High Lama","Great Lama","Patriarch","High Priest","Great Priest","Noble Priest"],[0,"Apprentice","Footpad","Cutpurse","Robber","Burglar","Filcher","Sharper","Magsman","Common Rogue","Rogue (1st)","Rogue (2nd)","Rogue (3rd)","Rogue (4th)","Rogue (5th)","Rogue (6th)","Rogue (7th)","Rogue (8th)","Rogue (9th)","Master Rogue","Expert Rogue","Senior Rogue","Chief Rogue","Prime Rogue","Low Thief","Thief (1st)","Thief (2nd)","Thief (3rd)","Thief (4th)","Thief (5th)","Thief (6th)","Thief (7th)","Thief (8th)","Thief (9th)","High Thief","Master Thief","Executioner","Low Assassin","Assassin","HighAssassin","Guildsmaster"],[0,"Runner (1st)","Runner (2nd)","Runner (3rd)","Strider (1st)","Strider (2nd)","Strider (3rd)","Scout (1st)","Scout (2nd)","Scout (3rd)","Scout (4th)","Scout (5th)","Courser (1st)","Courser (2nd)","Courser (3rd)","Courser (4th)","Courser (5th)","Tracker (1st)","Tracker (2nd)","Tracker (3rd)","Tracker (4th)","Tracker (5th)","Tracker (6th)","Tracker (7th)","Tracker (8th)","Tracker (9th)","Guide (1st)","Guide (2nd)","Guide (3rd)","Guide (4th)","Guide (5th)","Guide (6th)","Guide (7th)","Guide (8th)","Guide (9th)","Pathfinder-1","Pathfinder-2","Pathfinder-3","Ranger","High Ranger","Ranger Lord"],[0,"Gallant","Keeper (1st)","Keeper (2nd)","Keeper (3rd)","Keeper (4th)","Keeper (5th)","Keeper (6th)","Keeper (7th)","Keeper (8th)","Keeper (9th)","Protector-1","Protector-2","Protector-3","Protector-4","Protector-5","Protector-6","Protector-7","Protector-8","Defender-1","Defender-2","Defender-3","Defender-4","Defender-5","Defender-6","Defender-7","Defender-8","Warder (1st)","Warder (2nd)","Warder (3rd)","Warder (4th)","Warder (5th)","Warder (6th)","Warder (7th)","Warder (8th)","Warder (9th)","Gauardian","Chevalier","Justiciar","Paladin","High Lord"]];
player_exp=[0,10,25,45,70,100,140,200,280,380,500,650,850,1100,1400,1800,2300,2900,3600,4400,5400,6800,8400,10200,12500,17500,25000,35000,50000,75000,100000,150000,200000,300000,400000,500000,750000,1500000,2500000,5000000,9999999];
background=[0,{info:"You are the illegitimate and unacknowledged child ",roll:10,chart:1,next:2,bonus:(-25)},{info:"You are the illegitimate but acknowledged child ",roll:20,chart:1,next:2,bonus:(-15)},{info:"You are one of several children ",roll:95,chart:1,next:2,bonus:(-5)},{info:"You are the 1st child ",roll:100,chart:1,next:2,bonus:0},{info:"of a Serf.  ",roll:40,chart:2,next:3,bonus:15},{info:"of a Yeoman.  ",roll:65,chart:2,next:3,bonus:30},{info:"of a Townsman.  ",roll:80,chart:2,next:3,bonus:40},{info:"of a Guildsman.  ",roll:90,chart:2,next:3,bonus:55},{info:"of a Landed Knight.  ",roll:96,chart:2,next:3,bonus:70},{info:"of a Titled Noble.  ",roll:99,chart:2,next:3,bonus:80},{info:"of a Royal Blood Line.  ",roll:100,chart:2,next:3,bonus:90},{info:"You are the black sheep of the family.  ",roll:20,chart:3,next:50,bonus:(-30)},{info:"You are a credit to the family.  ",roll:80,chart:3,next:50,bonus:5},{info:"You are a well liked child.  ",roll:100,chart:3,next:50,bonus:10},{info:"Your mother was a Green-Elf.  ",roll:40,chart:4,next:1,bonus:0},{info:"Your father was a Green-Elf.  ",roll:75,chart:4,next:1,bonus:5},{info:"Your mother was a Grey-Elf.  ",roll:90,chart:4,next:1,bonus:5},{info:"Your father was a Grey-Elf.  ",roll:95,chart:4,next:1,bonus:10},{info:"Your mother was a High-Elf.  ",roll:98,chart:4,next:1,bonus:15},{info:"Your father was a High-Elf.  ",roll:100,chart:4,next:1,bonus:20},{info:"You are one of several children ",roll:60,chart:7,next:8,bonus:0},{info:"You are the only child ",roll:100,chart:7,next:8,bonus:5},{info:"of a Green-Elf ",roll:75,chart:8,next:9,bonus:0},{info:"of a Grey-Elf ",roll:95,chart:8,next:9,bonus:5},{info:"of a High-Elf ",roll:100,chart:8,next:9,bonus:10},{info:"Ranger.  ",roll:40,chart:9,next:54,bonus:30},{info:"Archer.  ",roll:70,chart:9,next:54,bonus:40},{info:"Warrior.  ",roll:87,chart:9,next:54,bonus:60},{info:"Mage.  ",roll:95,chart:9,next:54,bonus:75},{info:"Prince.  ",roll:99,chart:9,next:54,bonus:90},{info:"King.  ",roll:100,chart:9,next:54,bonus:95},{info:"You are one of several children of a Halfling ",roll:85,chart:10,next:11,bonus:(-5)},{info:"You are the only child of a Halfling ",roll:100,chart:10,next:11,bonus:5},{info:"Bum.  ",roll:20,chart:11,next:3,bonus:5},{info:"Tavern Owner.  ",roll:30,chart:11,next:3,bonus:30},{info:"Miller.  ",roll:40,chart:11,next:3,bonus:40},{info:"Home Owner.  ",roll:50,chart:11,next:3,bonus:50},{info:"Burglar.  ",roll:80,chart:11,next:3,bonus:60},{info:"Warrior.  ",roll:95,chart:11,next:3,bonus:65},{info:"Mage.  ",roll:100,chart:11,next:3,bonus:75},{info:"Clan Elder.  ",roll:100,chart:11,next:3,bonus:90},{info:"You are one of several children of a Gnome ",roll:85,chart:13,next:14,bonus:(-5)},{info:"You are the only child of a Gnome ",roll:100,chart:13,next:14,bonus:5},{info:"Beggar.  ",roll:20,chart:14,next:3,bonus:5},{info:"Bragart.  ",roll:50,chart:14,next:3,bonus:20},{info:"Prankster.  ",roll:75,chart:14,next:3,bonus:35},{info:"Warrior.  ",roll:95,chart:14,next:3,bonus:50},{info:"Mage.  ",roll:100,chart:14,next:3,bonus:75},{info:"You are one of two children of a Dwarven ",roll:25,chart:16,next:17,bonus:(-10)},{info:"You are the only child of a Dwarven ",roll:100,chart:16,next:17,bonus:0},{info:"Thief.  ",roll:10,chart:17,next:18,bonus:10},{info:"Prison Guard.  ",roll:25,chart:17,next:18,bonus:25},{info:"Miner.  ",roll:75,chart:17,next:18,bonus:40},{info:"Warrior.  ",roll:90,chart:17,next:18,bonus:60},{info:"Priest.  ",roll:99,chart:17,next:18,bonus:80},{info:"King.  ",roll:100,chart:17,next:18,bonus:100},{info:"You are the black sheep of the family.  ",roll:15,chart:18,next:57,bonus:(-40)},{info:"You are a credit to the family.  ",roll:85,chart:18,next:57,bonus:0},{info:"You are a well liked child.  ",roll:100,chart:18,next:57,bonus:5},{info:"Your mother was an Orc, but it is unacknowledged.  ",roll:25,chart:19,next:20,bonus:(-25)},{info:"Your father was an Orc, but it is unacknowledged.  ",roll:100,chart:19,next:20,bonus:(-25)},{info:"You are the adopted child ",roll:100,chart:20,next:2,bonus:0},{info:"Your mother was a Cave-Troll ",roll:30,chart:22,next:23,bonus:(-30)},{info:"Your father was a Cave-Troll ",roll:60,chart:22,next:23,bonus:(-25)},{info:"Your mother was a Hill-Troll ",roll:75,chart:22,next:23,bonus:(-20)},{info:"Your father was a Hill-Troll ",roll:90,chart:22,next:23,bonus:(-15)},{info:"Your mother was a Water-Troll ",roll:95,chart:22,next:23,bonus:(-10)},{info:"Your father was a Water-Troll ",roll:100,chart:22,next:23,bonus:(-5)},{info:"Cook.  ",roll:5,chart:23,next:62,bonus:10},{info:"Warrior.  ",roll:95,chart:23,next:62,bonus:5},{info:"Shaman.  ",roll:99,chart:23,next:62,bonus:15},{info:"Clan Chief.  ",roll:100,chart:23,next:62,bonus:30},{info:"You have dark brown eyes, ",roll:20,chart:50,next:51,bonus:0},{info:"You have brown eyes, ",roll:60,chart:50,next:51,bonus:0},{info:"You have hazel eyes, ",roll:70,chart:50,next:51,bonus:0},{info:"You have green eyes, ",roll:80,chart:50,next:51,bonus:0},{info:"You have blue eyes, ",roll:90,chart:50,next:51,bonus:0},{info:"You have blue-gray eyes, ",roll:100,chart:50,next:51,bonus:0},{info:"straight ",roll:70,chart:51,next:52,bonus:0},{info:"wavey ",roll:90,chart:51,next:52,bonus:0},{info:"curly ",roll:100,chart:51,next:52,bonus:0},{info:"black hair, ",roll:30,chart:52,next:53,bonus:0},{info:"brown hair, ",roll:70,chart:52,next:53,bonus:0},{info:"auburn hair, ",roll:80,chart:52,next:53,bonus:0},{info:"red hair, ",roll:90,chart:52,next:53,bonus:0},{info:"blonde hair, ",roll:100,chart:52,next:53,bonus:0},{info:"and a very dark complexion.",roll:10,chart:53,next:(-1),bonus:0},{info:"and a dark complexion.",roll:30,chart:53,next:(-1),bonus:0},{info:"and an average complexion.",roll:80,chart:53,next:(-1),bonus:0},{info:"and a fair complexion.",roll:90,chart:53,next:(-1),bonus:0},{info:"and a very fair complexion.",roll:100,chart:53,next:(-1),bonus:0},{info:"You have light grey eyes, ",roll:85,chart:54,next:55,bonus:0},{info:"You have light blue eyes, ",roll:95,chart:54,next:55,bonus:0},{info:"You have light green eyes, ",roll:100,chart:54,next:55,bonus:0},{info:"straight ",roll:75,chart:55,next:56,bonus:0},{info:"wavey ",roll:100,chart:55,next:56,bonus:0},{info:"black hair, and a fair complexion.",roll:75,chart:56,next:(-1),bonus:0},{info:"brown hair, and a fair complexion.",roll:85,chart:56,next:(-1),bonus:0},{info:"blonde hair, and a fair complexion.",roll:95,chart:56,next:(-1),bonus:0},{info:"silver hair, and a fair complexion.",roll:100,chart:56,next:(-1),bonus:0},{info:"You have dark brown eyes, ",roll:99,chart:57,next:58,bonus:0},{info:"You have glowing red eyes, ",roll:100,chart:57,next:58,bonus:10},{info:"straight ",roll:90,chart:58,next:59,bonus:0},{info:"wavey ",roll:100,chart:58,next:59,bonus:0},{info:"black hair, ",roll:75,chart:59,next:60,bonus:0},{info:"brown hair, ",roll:100,chart:59,next:60,bonus:0},{info:"a one foot beard, ",roll:25,chart:60,next:61,bonus:0},{info:"a two foot beard, ",roll:60,chart:60,next:61,bonus:1},{info:"a three foot beard, ",roll:90,chart:60,next:61,bonus:3},{info:"a four foot beard, ",roll:100,chart:60,next:61,bonus:5},{info:"and a dark complexion.",roll:100,chart:61,next:(-1),bonus:0},{info:"You have slime green eyes, ",roll:60,chart:62,next:63,bonus:0},{info:"You have puke yellow eyes, ",roll:85,chart:62,next:63,bonus:0},{info:"You have blue-bloodshot eyes, ",roll:99,chart:62,next:63,bonus:0},{info:"You have glowing red eyes, ",roll:100,chart:62,next:63,bonus:5},{info:"dirty ",roll:33,chart:63,next:64,bonus:0},{info:"mangy ",roll:66,chart:63,next:64,bonus:0},{info:"oily ",roll:100,chart:63,next:64,bonus:0},{info:"sea-weed green hair, ",roll:33,chart:64,next:65,bonus:0},{info:"bright red hair, ",roll:66,chart:64,next:65,bonus:0},{info:"dark purple hair, ",roll:100,chart:64,next:65,bonus:0},{info:"and green ",roll:25,chart:65,next:66,bonus:0},{info:"and blue ",roll:50,chart:65,next:66,bonus:0},{info:"and white ",roll:75,chart:65,next:66,bonus:0},{info:"and black ",roll:100,chart:65,next:66,bonus:0},{info:"ulcerous skin.",roll:33,chart:66,next:(-1),bonus:0},{info:"scabby skin.",roll:66,chart:66,next:(-1),bonus:0},{info:"leprous skin.",roll:100,chart:66,next:(-1),bonus:0}];
inven_ctr=0;
inven_weight=0;
missle_ctr=0;
equip_ctr=0;
blank_treasure={name_:" ",tval:0,tchar:" ",flags:0,p1:0,cost:0,subval:0,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:" ",level:0};
gold_list=[0,{name_:"copper",tval:100,tchar:"$",flags:0,p1:0,cost:3,subval:1,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:" ",level:1},{name_:"copper",tval:100,tchar:"$",flags:0,p1:0,cost:4,subval:2,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:" ",level:1},{name_:"copper",tval:100,tchar:"$",flags:0,p1:0,cost:5,subval:3,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:" ",level:1},{name_:"silver",tval:100,tchar:"$",flags:0,p1:0,cost:6,subval:4,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:" ",level:1},{name_:"silver",tval:100,tchar:"$",flags:0,p1:0,cost:7,subval:5,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:" ",level:1},{name_:"silver",tval:100,tchar:"$",flags:0,p1:0,cost:8,subval:6,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:" ",level:1},{name_:"garnets",tval:100,tchar:"*",flags:0,p1:0,cost:9,subval:7,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:" ",level:1},{name_:"garnets",tval:100,tchar:"*",flags:0,p1:0,cost:10,subval:8,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:" ",level:1},{name_:"gold",tval:100,tchar:"$",flags:0,p1:0,cost:12,subval:9,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:" ",level:1},{name_:"gold",tval:100,tchar:"$",flags:0,p1:0,cost:14,subval:0,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:" ",level:1},{name_:"gold",tval:100,tchar:"$",flags:0,p1:0,cost:16,subval:1,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:" ",level:1},{name_:"opals",tval:100,tchar:"*",flags:0,p1:0,cost:18,subval:2,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:" ",level:1},{name_:"saphires",tval:100,tchar:"*",flags:0,p1:0,cost:20,subval:3,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:" ",level:1},{name_:"gold",tval:100,tchar:"$",flags:0,p1:0,cost:24,subval:4,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:" ",level:1},{name_:"rubies",tval:100,tchar:"*",flags:0,p1:0,cost:28,subval:5,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:" ",level:1},{name_:"diamonds",tval:100,tchar:"*",flags:0,p1:0,cost:32,subval:6,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:" ",level:1},{name_:"emeralds",tval:100,tchar:"*",flags:0,p1:0,cost:40,subval:7,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:" ",level:1},{name_:"mithril",tval:100,tchar:"$",flags:0,p1:0,cost:80,subval:8,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:" ",level:1}];
object_list=[0,{name_:"& %M Mushroom~| of Poison",tval:80,tchar:",",flags:1,p1:500,cost:0,subval:257,weight:1,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:7},{name_:"& %M Mushroom~| of Blindness",tval:80,tchar:",",flags:2,p1:500,cost:0,subval:258,weight:1,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:9},{name_:"& %M Mushroom~| of Paranoia",tval:80,tchar:",",flags:4,p1:500,cost:0,subval:259,weight:1,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:9},{name_:"& %M Mushroom~| of Confusion",tval:80,tchar:",",flags:8,p1:500,cost:0,subval:260,weight:1,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:7},{name_:"& %M Mushroom~| of Halucination",tval:80,tchar:",",flags:16,p1:500,cost:0,subval:261,weight:1,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:13},{name_:"& %M Mushroom~| of Cure Poison",tval:80,tchar:",",flags:32,p1:500,cost:60,subval:262,weight:1,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:8},{name_:"& %M Mushroom~| of Cure Blindness",tval:80,tchar:",",flags:64,p1:500,cost:50,subval:263,weight:1,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:10},{name_:"& %M Mushroom~| of Cure Paranoia",tval:80,tchar:",",flags:128,p1:500,cost:25,subval:264,weight:1,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:12},{name_:"& %M Mushroom~| of Cure Confusion",tval:80,tchar:",",flags:256,p1:500,cost:50,subval:265,weight:1,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:6},{name_:"& %M Mushroom~| of Weakness",tval:80,tchar:",",flags:67109376,p1:500,cost:0,subval:266,weight:1,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:7},{name_:"& %M Mushroom~| of Unhealth",tval:80,tchar:",",flags:67109888,p1:500,cost:50,subval:267,weight:1,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"10d10",level:15},{name_:"& %M Mushroom~| of Restore Constitution",tval:80,tchar:",",flags:65536,p1:500,cost:350,subval:268,weight:1,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:20},{name_:"& %M Mushroom~| of First-Aid",tval:80,tchar:",",flags:2097152,p1:500,cost:5,subval:269,weight:1,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:6},{name_:"& %M Mushroom~| of Minor Cures",tval:80,tchar:",",flags:4194304,p1:500,cost:20,subval:270,weight:1,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:7},{name_:"& %M Mushroom~| of Light Cures",tval:80,tchar:",",flags:8388608,p1:500,cost:30,subval:271,weight:1,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:10},{name_:"& %M Mushroom~| of Restoring",tval:80,tchar:",",flags:2064448,p1:500,cost:1000,subval:272,weight:1,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:30},{name_:"& Hairy %M Mold~| of Poison",tval:80,tchar:",",flags:1,p1:1200,cost:0,subval:273,weight:1,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:15},{name_:"& Hairy %M Mold~| of Halucinations",tval:80,tchar:",",flags:16,p1:1200,cost:0,subval:274,weight:1,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:18},{name_:"& Hairy %M Mold~| of Cure Poison",tval:80,tchar:",",flags:32,p1:1200,cost:75,subval:275,weight:1,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:19},{name_:"& Hairy %M Mold~| of Unhealth",tval:80,tchar:",",flags:1024,p1:1200,cost:25,subval:276,weight:1,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"6d8",level:28},{name_:"& Hairy %M Mold~| of Cure Serious Wounds",tval:80,tchar:",",flags:33554432,p1:1200,cost:75,subval:277,weight:2,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:16},{name_:"& Ration~ of Food",tval:80,tchar:",",flags:0,p1:5000,cost:3,subval:307,weight:10,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:0},{name_:"& Ration~ of Food",tval:80,tchar:",",flags:0,p1:5000,cost:3,subval:307,weight:10,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:5},{name_:"& Ration~ of Food",tval:80,tchar:",",flags:0,p1:5000,cost:3,subval:307,weight:10,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:10},{name_:"& Slime Mold~",tval:80,tchar:",",flags:0,p1:3000,cost:2,subval:308,weight:5,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:1},{name_:"& Piece~ of Elvish Waybread",tval:80,tchar:",",flags:33554464,p1:7500,cost:10,subval:313,weight:3,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:6},{name_:"& Piece~ of Elvish Waybread",tval:80,tchar:",",flags:33554464,p1:7500,cost:10,subval:313,weight:3,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:12},{name_:"& Piece~ of Elvish Waybread",tval:80,tchar:",",flags:33554464,p1:7500,cost:10,subval:313,weight:3,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:20},{name_:"& Dagger (Main Gauche)^ (%P2,%P3)",tval:23,tchar:"|",flags:0,p1:0,cost:25,subval:1,weight:30,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d5",level:2},{name_:"& Dagger (Misercorde)^ (%P2,%P3)",tval:23,tchar:"|",flags:0,p1:0,cost:10,subval:2,weight:15,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d4",level:0},{name_:"& Dagger (Stiletto)^ (%P2,%P3)",tval:23,tchar:"|",flags:0,p1:0,cost:10,subval:3,weight:12,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d4",level:0},{name_:"& Dagger (Bodkin)^ (%P2,%P3)",tval:23,tchar:"|",flags:0,p1:0,cost:10,subval:4,weight:20,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d4",level:1},{name_:"& Broken dagger^ (%P2,%P3)",tval:23,tchar:"|",flags:0,p1:0,cost:0,subval:5,weight:15,number:1,tohit:(-2),todam:(-2),ac:0,toac:0,damage:"1d1",level:0},{name_:"& Backsword^ (%P2,%P3)",tval:23,tchar:"|",flags:0,p1:0,cost:60,subval:6,weight:95,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d9",level:7},{name_:"& Bastard Sword^ (%P2,%P3)",tval:23,tchar:"|",flags:0,p1:0,cost:350,subval:7,weight:140,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"3d4",level:14},{name_:"& Thrusting Sword (Bilbo)^ (%P2,%P3)",tval:23,tchar:"|",flags:0,p1:0,cost:60,subval:8,weight:80,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d6",level:4},{name_:"& Thrusting Sword (Baselard)^ (%P2,%P3)",tval:23,tchar:"|",flags:0,p1:0,cost:80,subval:9,weight:100,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d7",level:5},{name_:"& Broadsword^ (%P2,%P3)",tval:23,tchar:"|",flags:0,p1:0,cost:255,subval:10,weight:150,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"2d5",level:9},{name_:"& Two Handed Sword (Claymore)^ (%P2,%P3)",tval:23,tchar:"|",flags:0,p1:0,cost:775,subval:11,weight:200,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"3d6",level:30},{name_:"& Cutlass^ (%P2,%P3)",tval:23,tchar:"|",flags:0,p1:0,cost:85,subval:12,weight:110,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d7",level:7},{name_:"& Two Handed Sword (Espadon)^ (%P2,%P3)",tval:23,tchar:"|",flags:0,p1:0,cost:655,subval:13,weight:180,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"3d6",level:35},{name_:"& Executioner's Sword^ (%P2,%P3)",tval:23,tchar:"|",flags:0,p1:0,cost:850,subval:14,weight:260,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"4d5",level:40},{name_:"& Two Handed Sword (Flamberge)^ (%P2,%P3)",tval:23,tchar:"|",flags:0,p1:0,cost:1000,subval:15,weight:240,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"4d5",level:45},{name_:"& Foil^ (%P2,%P3)",tval:23,tchar:"|",flags:0,p1:0,cost:35,subval:16,weight:30,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d5",level:2},{name_:"& Katana^ (%P2,%P3)",tval:23,tchar:"|",flags:0,p1:0,cost:400,subval:17,weight:120,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"3d4",level:18},{name_:"& Longsword^ (%P2,%P3)",tval:23,tchar:"|",flags:0,p1:0,cost:300,subval:18,weight:130,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d10",level:12},{name_:"& Two Handed Sword (No-Dachi)^ (%P2,%P3)",tval:23,tchar:"|",flags:0,p1:0,cost:675,subval:19,weight:200,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"4d4",level:45},{name_:"& Rapier^ (%P2,%P3)",tval:23,tchar:"|",flags:0,p1:0,cost:42,subval:20,weight:40,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d6",level:4},{name_:"& Sabre^ (%P2,%P3)",tval:23,tchar:"|",flags:0,p1:0,cost:50,subval:21,weight:50,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d7",level:5},{name_:"& Small Sword^ (%P2,%P3)",tval:23,tchar:"|",flags:0,p1:0,cost:48,subval:22,weight:75,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d6",level:5},{name_:"& Two Handed Sword (Zweihander)^ (%P2,%P3)",tval:23,tchar:"|",flags:0,p1:0,cost:1000,subval:23,weight:280,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"4d6",level:50},{name_:"& Broken sword^ (%P2,%P3)",tval:23,tchar:"|",flags:0,p1:0,cost:0,subval:24,weight:75,number:1,tohit:(-2),todam:(-2),ac:0,toac:0,damage:"1d1",level:0},{name_:"& Battle Axe (Balestarius)^ (%P2,%P3)",tval:21,tchar:"\\",flags:0,p1:0,cost:500,subval:1,weight:180,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"2d8",level:30},{name_:"& Ball and Chain^ (%P2,%P3)",tval:21,tchar:"\\",flags:0,p1:0,cost:200,subval:2,weight:150,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"2d4",level:20},{name_:"& Battle Axe (European)^ (%P2,%P3)",tval:21,tchar:"\\",flags:0,p1:0,cost:334,subval:3,weight:170,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"3d4",level:13},{name_:"& Broad Axe^ (%P2,%P3)",tval:21,tchar:"\\",flags:0,p1:0,cost:304,subval:4,weight:160,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"2d6",level:17},{name_:"& Cat-O-Nine Tails^ (%P2,%P3)",tval:21,tchar:"\\",flags:0,p1:0,cost:14,subval:5,weight:40,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d4",level:3},{name_:"& Wooden Club^ (%P2,%P3)",tval:21,tchar:"\\",flags:0,p1:0,cost:1,subval:6,weight:100,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d3",level:0},{name_:"& Flail^ (%P2,%P3)",tval:21,tchar:"\\",flags:0,p1:0,cost:353,subval:7,weight:150,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"2d6",level:12},{name_:"& Two Handed Great Flail^ (%P2,%P3)",tval:21,tchar:"\\",flags:0,p1:0,cost:590,subval:8,weight:280,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"3d6",level:45},{name_:"& Morningstar^ (%P2,%P3)",tval:21,tchar:"\\",flags:0,p1:0,cost:396,subval:9,weight:150,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"2d6",level:10},{name_:"& Mace^ (%P2,%P3)",tval:21,tchar:"\\",flags:0,p1:0,cost:130,subval:10,weight:120,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"2d4",level:6},{name_:"& War Hammer^ (%P2,%P3)",tval:21,tchar:"\\",flags:0,p1:0,cost:225,subval:11,weight:120,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"3d3",level:5},{name_:"& Mace (Lead filled)^ (%P2,%P3)",tval:21,tchar:"\\",flags:0,p1:0,cost:502,subval:12,weight:180,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"3d4",level:15},{name_:"& Awl-Pike^ (%P2,%P3)",tval:22,tchar:"/",flags:0,p1:0,cost:340,subval:1,weight:160,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d8",level:8},{name_:"& Beaked Axe^ (%P2,%P3)",tval:22,tchar:"/",flags:0,p1:0,cost:408,subval:2,weight:180,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"2d6",level:15},{name_:"& Fauchard^ (%P2,%P3)",tval:22,tchar:"/",flags:0,p1:0,cost:376,subval:3,weight:170,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d10",level:17},{name_:"& Glaive^ (%P2,%P3)",tval:22,tchar:"/",flags:0,p1:0,cost:363,subval:4,weight:190,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"2d6",level:20},{name_:"& Halberd^ (%P2,%P3)",tval:22,tchar:"/",flags:0,p1:0,cost:430,subval:5,weight:190,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"3d4",level:22},{name_:"& Lucerne Hammer^ (%P2,%P3)",tval:22,tchar:"/",flags:0,p1:0,cost:376,subval:6,weight:120,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"2d5",level:11},{name_:"& Pike^ (%P2,%P3)",tval:22,tchar:"/",flags:0,p1:0,cost:358,subval:7,weight:160,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"2d5",level:15},{name_:"& Spear^ (%P2,%P3)",tval:22,tchar:"/",flags:0,p1:0,cost:36,subval:8,weight:50,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d6",level:5},{name_:"& Lance^ (%P2,%P3)",tval:22,tchar:"/",flags:0,p1:0,cost:230,subval:9,weight:300,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"2d8",level:10},{name_:"& Javelin^ (%P2,%P3)",tval:22,tchar:"/",flags:0,p1:0,cost:18,subval:10,weight:30,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d4",level:4},{name_:"& Short Bow^ (%P2)",tval:20,tchar:"}",flags:0,p1:2,cost:50,subval:1,weight:30,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:3},{name_:"& Long Bow^ (%P2)",tval:20,tchar:"}",flags:0,p1:3,cost:120,subval:2,weight:40,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:10},{name_:"& Composite Bow^ (%P2)",tval:20,tchar:"}",flags:0,p1:4,cost:240,subval:3,weight:40,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:40},{name_:"& Light Crossbow^ (%P2)",tval:20,tchar:"}",flags:0,p1:5,cost:140,subval:10,weight:110,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:15},{name_:"& Heavy Crossbow^ (%P2)",tval:20,tchar:"}",flags:0,p1:6,cost:300,subval:11,weight:200,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:30},{name_:"& Sling^ (%P2)",tval:20,tchar:"}",flags:0,p1:1,cost:5,subval:20,weight:5,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:1},{name_:"& Arrow~^ (%P2,%P3)",tval:12,tchar:"{",flags:0,p1:0,cost:1,subval:1,weight:2,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d4",level:2},{name_:"& Bolt~^ (%P2,%P3)",tval:11,tchar:"{",flags:0,p1:0,cost:2,subval:1,weight:3,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d5",level:2},{name_:"& Rounded Pebble~^ (%P2,%P3)",tval:10,tchar:"{",flags:0,p1:0,cost:1,subval:1,weight:4,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d2",level:0},{name_:"& Iron Shot~^ (%P2,%P3)",tval:10,tchar:"{",flags:0,p1:0,cost:2,subval:1,weight:5,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d3",level:3},{name_:"& Iron Spike~",tval:13,tchar:"~",flags:0,p1:0,cost:1,subval:1,weight:10,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:1},{name_:"& Brass Lantern~ with %P5 turns of light",tval:15,tchar:"~",flags:0,p1:7500,cost:35,subval:1,weight:50,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:1},{name_:"& Wooden Torch~ with %P5 turns of light",tval:15,tchar:"~",flags:0,p1:4000,cost:2,subval:13,weight:30,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:1},{name_:"& Orcish Pick^ (%P1) (%P2,%P3)",tval:25,tchar:"\\",flags:536870912,p1:2,cost:500,subval:2,weight:180,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d3",level:20},{name_:"& Dwarven Pick^ (%P1) (%P2,%P3)",tval:25,tchar:"\\",flags:536870912,p1:3,cost:1200,subval:3,weight:200,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d4",level:50},{name_:"& Gnomish Shovel^ (%P1) (%P2,%P3)",tval:25,tchar:"\\",flags:536870912,p1:1,cost:100,subval:5,weight:50,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d2",level:20},{name_:"& Dwarven Shovel^ (%P1) (%P2,%P3)",tval:25,tchar:"\\",flags:536870912,p1:2,cost:250,subval:6,weight:120,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d3",level:40},{name_:"& Pair of Soft Leather Shoes^ [%P6,%P4]",tval:30,tchar:"]",flags:0,p1:0,cost:4,subval:1,weight:5,number:1,tohit:0,todam:0,ac:1,toac:0,damage:"0d0",level:1},{name_:"& Pair of Soft Leather Boots^ [%P6,%P4]",tval:30,tchar:"]",flags:0,p1:0,cost:7,subval:2,weight:20,number:1,tohit:0,todam:0,ac:2,toac:0,damage:"1d1",level:4},{name_:"& Pair of Hard Leather Boots^ [%P6,%P4]",tval:30,tchar:"]",flags:0,p1:0,cost:12,subval:3,weight:40,number:1,tohit:0,todam:0,ac:3,toac:0,damage:"1d1",level:6},{name_:"& Soft Leather Cap^ [%P6,%P4]",tval:33,tchar:"]",flags:0,p1:0,cost:4,subval:1,weight:10,number:1,tohit:0,todam:0,ac:1,toac:0,damage:"0d0",level:2},{name_:"& Hard Leather Cap^ [%P6,%P4]",tval:33,tchar:"]",flags:0,p1:0,cost:12,subval:2,weight:15,number:1,tohit:0,todam:0,ac:2,toac:0,damage:"0d0",level:4},{name_:"& Metal Cap^ [%P6,%P4]",tval:33,tchar:"]",flags:0,p1:0,cost:30,subval:3,weight:20,number:1,tohit:0,todam:0,ac:3,toac:0,damage:"1d1",level:7},{name_:"& Iron Helm^ [%P6,%P4]",tval:33,tchar:"]",flags:0,p1:0,cost:75,subval:4,weight:75,number:1,tohit:0,todam:0,ac:5,toac:0,damage:"1d3",level:20},{name_:"& Steel Helm^ [%P6,%P4]",tval:33,tchar:"]",flags:0,p1:0,cost:200,subval:5,weight:60,number:1,tohit:0,todam:0,ac:6,toac:0,damage:"1d3",level:40},{name_:"& Silver Crown^ (%P1)",tval:33,tchar:"]",flags:0,p1:0,cost:250,subval:6,weight:20,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:44},{name_:"& Golden Crown^ (%P1)",tval:33,tchar:"]",flags:0,p1:0,cost:500,subval:7,weight:30,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:47},{name_:"& Jewel Encrusted Crown^ (%P1)",tval:33,tchar:"]",flags:0,p1:0,cost:1000,subval:8,weight:40,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:50},{name_:"& Robe^ [%P6,%P4]",tval:36,tchar:"(",flags:0,p1:0,cost:4,subval:1,weight:20,number:1,tohit:0,todam:0,ac:2,toac:0,damage:"0d0",level:1},{name_:"Soft Leather Armor^ [%P6,%P4]",tval:36,tchar:"(",flags:0,p1:0,cost:18,subval:2,weight:80,number:1,tohit:0,todam:0,ac:4,toac:0,damage:"0d0",level:2},{name_:"Soft Studded Leather^ [%P6,%P4]",tval:36,tchar:"(",flags:0,p1:0,cost:35,subval:3,weight:90,number:1,tohit:0,todam:0,ac:5,toac:0,damage:"1d1",level:3},{name_:"Hard Leather Armor^ [%P6,%P4]",tval:36,tchar:"(",flags:0,p1:0,cost:55,subval:4,weight:100,number:1,tohit:(-1),todam:0,ac:6,toac:0,damage:"1d1",level:5},{name_:"Hard Studded Leather^ [%P6,%P4]",tval:36,tchar:"(",flags:0,p1:0,cost:100,subval:5,weight:110,number:1,tohit:(-1),todam:0,ac:7,toac:0,damage:"1d2",level:7},{name_:"Woven Cord Armor^ [%P6,%P4]",tval:36,tchar:"(",flags:0,p1:0,cost:45,subval:6,weight:150,number:1,tohit:(-1),todam:0,ac:6,toac:0,damage:"0d0",level:7},{name_:"Soft Leather Ring Mail^ [%P6,%P4]",tval:36,tchar:"(",flags:0,p1:0,cost:160,subval:7,weight:130,number:1,tohit:(-1),todam:0,ac:6,toac:0,damage:"1d2",level:10},{name_:"Hard Leather Ring Mail^ [%P6,%P4]",tval:36,tchar:"(",flags:0,p1:0,cost:230,subval:8,weight:150,number:1,tohit:(-2),todam:0,ac:8,toac:0,damage:"1d3",level:12},{name_:"Leather Scale Mail^ [%P6,%P4]",tval:36,tchar:"(",flags:0,p1:0,cost:330,subval:9,weight:140,number:1,tohit:(-1),todam:0,ac:11,toac:0,damage:"1d1",level:14},{name_:"Metal Scale Mail^ [%P6,%P4]",tval:35,tchar:"[",flags:0,p1:0,cost:430,subval:1,weight:250,number:1,tohit:(-2),todam:0,ac:13,toac:0,damage:"1d4",level:24},{name_:"Chain Mail^ [%P6,%P4]",tval:35,tchar:"[",flags:0,p1:0,cost:530,subval:2,weight:220,number:1,tohit:(-2),todam:0,ac:14,toac:0,damage:"1d4",level:26},{name_:"Rusty Chain Mail^ [%P6,%P4]",tval:35,tchar:"[",flags:0,p1:0,cost:0,subval:3,weight:200,number:1,tohit:(-5),todam:0,ac:14,toac:(-8),damage:"1d4",level:26},{name_:"Double Chain Mail^ [%P6,%P4]",tval:35,tchar:"[",flags:0,p1:0,cost:630,subval:4,weight:260,number:1,tohit:(-2),todam:0,ac:15,toac:0,damage:"1d4",level:28},{name_:"Augmented Chain Mail^ [%P6,%P4]",tval:35,tchar:"[",flags:0,p1:0,cost:675,subval:5,weight:270,number:1,tohit:(-2),todam:0,ac:16,toac:0,damage:"1d4",level:30},{name_:"Bar Chain Mail^ [%P6,%P4]",tval:35,tchar:"[",flags:0,p1:0,cost:720,subval:6,weight:280,number:1,tohit:(-2),todam:0,ac:18,toac:0,damage:"1d4",level:34},{name_:"Metal Brigandine Armor^ [%P6,%P4]",tval:35,tchar:"[",flags:0,p1:0,cost:775,subval:7,weight:290,number:1,tohit:(-3),todam:0,ac:19,toac:0,damage:"1d4",level:36},{name_:"Laminated Armor^ [%P6,%P4]",tval:35,tchar:"[",flags:0,p1:0,cost:825,subval:8,weight:300,number:1,tohit:(-3),todam:0,ac:20,toac:0,damage:"1d4",level:38},{name_:"Partial Plate Armor^ [%P6,%P4]",tval:35,tchar:"[",flags:0,p1:0,cost:900,subval:9,weight:260,number:1,tohit:(-3),todam:0,ac:22,toac:0,damage:"1d6",level:42},{name_:"Metal Lamellar Armor^ [%P6,%P4]",tval:35,tchar:"[",flags:0,p1:0,cost:950,subval:10,weight:340,number:1,tohit:(-3),todam:0,ac:23,toac:0,damage:"1d6",level:44},{name_:"Full Plate Armor^ [%P6,%P4]",tval:35,tchar:"[",flags:0,p1:0,cost:1050,subval:11,weight:380,number:1,tohit:(-3),todam:0,ac:25,toac:0,damage:"2d4",level:48},{name_:"Ribbed Plate Armor^ [%P6,%P4]",tval:35,tchar:"[",flags:0,p1:0,cost:1200,subval:12,weight:380,number:1,tohit:(-3),todam:0,ac:28,toac:0,damage:"2d4",level:50},{name_:"& Cloak^ [%P6,%P4]",tval:32,tchar:"(",flags:0,p1:0,cost:3,subval:1,weight:10,number:1,tohit:0,todam:0,ac:1,toac:0,damage:"0d0",level:1},{name_:"& Set of Leather Gloves^ [%P6,%P4]",tval:31,tchar:"]",flags:0,p1:0,cost:3,subval:1,weight:5,number:1,tohit:0,todam:0,ac:1,toac:0,damage:"0d0",level:1},{name_:"& Set of Gauntlets^ [%P6,%P4]",tval:31,tchar:"]",flags:0,p1:0,cost:35,subval:2,weight:25,number:1,tohit:0,todam:0,ac:2,toac:0,damage:"1d1",level:12},{name_:"& Small Leather Shield^ [%P6,%P4]",tval:34,tchar:")",flags:0,p1:0,cost:30,subval:1,weight:50,number:1,tohit:0,todam:0,ac:2,toac:0,damage:"1d1",level:3},{name_:"& Medium Leather Shield^ [%P6,%P4]",tval:34,tchar:")",flags:0,p1:0,cost:60,subval:2,weight:75,number:1,tohit:0,todam:0,ac:3,toac:0,damage:"1d2",level:8},{name_:"& Large Leather Shield^ [%P6,%P4]",tval:34,tchar:")",flags:0,p1:0,cost:120,subval:3,weight:100,number:1,tohit:0,todam:0,ac:4,toac:0,damage:"1d2",level:15},{name_:"& Small Metal Shield^ [%P6,%P4]",tval:34,tchar:")",flags:0,p1:0,cost:50,subval:4,weight:65,number:1,tohit:0,todam:0,ac:3,toac:0,damage:"1d2",level:10},{name_:"& Medium Metal Shield^ [%P6,%P4]",tval:34,tchar:")",flags:0,p1:0,cost:125,subval:5,weight:90,number:1,tohit:0,todam:0,ac:4,toac:0,damage:"1d3",level:20},{name_:"& Large Metal Shield^ [%P6,%P4]",tval:34,tchar:")",flags:0,p1:0,cost:200,subval:6,weight:120,number:1,tohit:0,todam:0,ac:5,toac:0,damage:"1d3",level:30},{name_:"& %R Ring| of Gain Strength^ (%P1)",tval:45,tchar:"=",flags:1,p1:0,cost:400,subval:1,weight:2,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:30},{name_:"& %R Ring| of Gain Dexterity^ (%P1)",tval:45,tchar:"=",flags:2,p1:0,cost:400,subval:2,weight:2,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:30},{name_:"& %R Ring| of Gain Constitution^ (%P1)",tval:45,tchar:"=",flags:4,p1:0,cost:400,subval:3,weight:2,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:30},{name_:"& %R Ring| of Gain Intelligence^ (%P1)",tval:45,tchar:"=",flags:8,p1:0,cost:350,subval:4,weight:2,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:30},{name_:"& %R Ring| of Speed^ (%P1)",tval:45,tchar:"=",flags:4096,p1:0,cost:3000,subval:7,weight:2,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:50},{name_:"& %R Ring| of Searching^ (%P1)",tval:45,tchar:"=",flags:64,p1:0,cost:250,subval:8,weight:2,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:7},{name_:"& %R Ring| of Teleportation^",tval:45,tchar:"=",flags:2147484672,p1:0,cost:0,subval:9,weight:2,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:7},{name_:"& %R Ring| of Slow Digestion^",tval:45,tchar:"=",flags:128,p1:0,cost:250,subval:10,weight:2,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:7},{name_:"& %R Ring| of Resist Fire^",tval:45,tchar:"=",flags:524288,p1:0,cost:250,subval:11,weight:2,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:14},{name_:"& %R Ring| of Resist Cold^",tval:45,tchar:"=",flags:2097152,p1:0,cost:250,subval:12,weight:2,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:14},{name_:"& %R Ring| of Feather Falling^",tval:45,tchar:"=",flags:67108864,p1:0,cost:200,subval:13,weight:2,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:7},{name_:"& %R Ring| of Adornment^",tval:45,tchar:"=",flags:0,p1:0,cost:20,subval:14,weight:2,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:7},{name_:"& %R Ring| of Adornment^",tval:45,tchar:"=",flags:0,p1:0,cost:30,subval:15,weight:2,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:7},{name_:"& %R Ring| of Weakness^",tval:45,tchar:"=",flags:1,p1:(-5),cost:0,subval:16,weight:2,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:7},{name_:"& %R Ring| of Lordly Protection (FIRE)^",tval:45,tchar:"=",flags:524288,p1:0,cost:1200,subval:17,weight:2,number:1,tohit:0,todam:0,ac:0,toac:5,damage:"0d0",level:50},{name_:"& %R Ring| of Lordly Protection (ACID)^",tval:45,tchar:"=",flags:1048576,p1:0,cost:1200,subval:18,weight:2,number:1,tohit:0,todam:0,ac:0,toac:5,damage:"0d0",level:50},{name_:"& %R Ring| of Lordly Protection (COLD)^",tval:45,tchar:"=",flags:2097152,p1:0,cost:1200,subval:19,weight:2,number:1,tohit:0,todam:0,ac:0,toac:5,damage:"0d0",level:50},{name_:"& %R Ring| of WOE^",tval:45,tchar:"=",flags:2147485248,p1:(-5),cost:0,subval:20,weight:2,number:1,tohit:0,todam:0,ac:0,toac:(-3),damage:"0d0",level:50},{name_:"& %R Ring| of Stupidity^",tval:45,tchar:"=",flags:2147483656,p1:(-5),cost:0,subval:21,weight:2,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:20},{name_:"& %R Ring| of Increase Damage^ (%P3)",tval:45,tchar:"=",flags:0,p1:0,cost:100,subval:22,weight:2,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:20},{name_:"& %R Ring| of Increase To-Hit^ (%P2)",tval:45,tchar:"=",flags:0,p1:0,cost:100,subval:23,weight:2,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:20},{name_:"& %R Ring| of Protection^ [%P4]",tval:45,tchar:"=",flags:0,p1:0,cost:100,subval:24,weight:2,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:7},{name_:"& %R Ring| of Aggravate Monster^",tval:45,tchar:"=",flags:2147484160,p1:0,cost:0,subval:25,weight:2,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:7},{name_:"& %R Ring| of See Invisible^",tval:45,tchar:"=",flags:16777216,p1:0,cost:340,subval:26,weight:2,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:40},{name_:"& %R Ring| of Sustain Strength^",tval:45,tchar:"=",flags:4194304,p1:1,cost:750,subval:27,weight:2,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:44},{name_:"& %R Ring| of Sustain Intelligence^",tval:45,tchar:"=",flags:4194304,p1:2,cost:600,subval:28,weight:2,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:44},{name_:"& %R Ring| of Sustain Wisdom^",tval:45,tchar:"=",flags:4194304,p1:3,cost:600,subval:29,weight:2,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:44},{name_:"& %R Ring| of Sustain Constitution^",tval:45,tchar:"=",flags:4194304,p1:4,cost:750,subval:30,weight:2,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:44},{name_:"& %R Ring| of Sustain Dexterity^",tval:45,tchar:"=",flags:4194304,p1:5,cost:750,subval:31,weight:2,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:44},{name_:"& %R Ring| of Sustain Charisma^",tval:45,tchar:"=",flags:4194304,p1:6,cost:500,subval:32,weight:2,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:7},{name_:"& %R Ring| of Slaying^",tval:45,tchar:"=",flags:0,p1:6,cost:1000,subval:33,weight:2,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:50},{name_:"& %A Amulet| of Adornment^",tval:40,tchar:"\"",flags:0,p1:0,cost:20,subval:11,weight:3,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:16},{name_:"& %A Amulet| of Adornment^",tval:40,tchar:"\"",flags:0,p1:0,cost:30,subval:12,weight:3,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:16},{name_:"& %A Amulet| of Wisdom^ (%P1)",tval:40,tchar:"\"",flags:16,p1:0,cost:300,subval:5,weight:3,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:20},{name_:"& %A Amulet| of Charisma^ (%P1)",tval:40,tchar:"\"",flags:32,p1:0,cost:250,subval:6,weight:3,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:20},{name_:"& %A Amulet| of Searching^ (%P1)",tval:40,tchar:"\"",flags:64,p1:0,cost:250,subval:7,weight:3,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:14},{name_:"& %A Amulet| of Teleportation^",tval:40,tchar:"\"",flags:2147484672,p1:0,cost:0,subval:8,weight:3,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:14},{name_:"& %A Amulet| of Slow Digestion^",tval:40,tchar:"\"",flags:128,p1:0,cost:200,subval:9,weight:3,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:14},{name_:"& %A Amulet| of Resist Acid^",tval:40,tchar:"\"",flags:1048576,p1:0,cost:300,subval:10,weight:3,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:24},{name_:"& %A Amulet| of the Magi^",tval:40,tchar:"\"",flags:25165888,p1:0,cost:5000,subval:13,weight:3,number:1,tohit:0,todam:0,ac:0,toac:3,damage:"0d0",level:50},{name_:"& %A Amulet| of DOOM^",tval:40,tchar:"\"",flags:2147483775,p1:(-5),cost:0,subval:14,weight:3,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:50},{name_:"& Scroll~ %T| of Enchant Weapon To-Hit",tval:70,tchar:"?",flags:1,p1:0,cost:125,subval:257,weight:5,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:12},{name_:"& Scroll~ %T| of Enchant Weapon To-Dam",tval:70,tchar:"?",flags:2,p1:0,cost:125,subval:258,weight:5,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:12},{name_:"& Scroll~ %T| of Enchant Armor",tval:70,tchar:"?",flags:4,p1:0,cost:125,subval:259,weight:5,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:12},{name_:"& Scroll~ %T| of Identify",tval:70,tchar:"?",flags:8,p1:0,cost:50,subval:260,weight:5,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:1},{name_:"& Scroll~ %T| of Identify",tval:70,tchar:"?",flags:8,p1:0,cost:50,subval:260,weight:5,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:5},{name_:"& Scroll~ %T| of Identify",tval:70,tchar:"?",flags:8,p1:0,cost:50,subval:260,weight:5,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:10},{name_:"& Scroll~ %T| of Remove Curse",tval:70,tchar:"?",flags:16,p1:0,cost:100,subval:261,weight:5,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:7},{name_:"& Scroll~ %T| of Light",tval:70,tchar:"?",flags:32,p1:0,cost:15,subval:262,weight:5,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:0},{name_:"& Scroll~ %T| of Light",tval:70,tchar:"?",flags:32,p1:0,cost:15,subval:262,weight:5,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:3},{name_:"& Scroll~ %T| of Light",tval:70,tchar:"?",flags:32,p1:0,cost:15,subval:262,weight:5,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:7},{name_:"& Scroll~ %T| of Summon Monster",tval:70,tchar:"?",flags:64,p1:0,cost:0,subval:263,weight:5,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:1},{name_:"& Scroll~ %T| of Phase Door",tval:70,tchar:"?",flags:128,p1:0,cost:15,subval:264,weight:5,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:1},{name_:"& Scroll~ %T| of Teleport",tval:70,tchar:"?",flags:256,p1:0,cost:40,subval:265,weight:5,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:10},{name_:"& Scroll~ %T| of Teleport Level",tval:70,tchar:"?",flags:512,p1:0,cost:50,subval:266,weight:5,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:20},{name_:"& Scroll~ %T| of Monster Confusion",tval:70,tchar:"?",flags:1024,p1:0,cost:30,subval:267,weight:5,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:5},{name_:"& Scroll~ %T| of Magic Mapping",tval:70,tchar:"?",flags:2048,p1:0,cost:40,subval:268,weight:5,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:5},{name_:"& Scroll~ %T| of Sleep Monster",tval:70,tchar:"?",flags:4096,p1:0,cost:35,subval:269,weight:5,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:5},{name_:"& Scroll~ %T| of Rune of Protection",tval:70,tchar:"?",flags:8192,p1:0,cost:500,subval:270,weight:5,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:50},{name_:"& Scroll~ %T| of Treasure Detection",tval:70,tchar:"?",flags:16384,p1:0,cost:15,subval:271,weight:5,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:0},{name_:"& Scroll~ %T| of Object Detection",tval:70,tchar:"?",flags:32768,p1:0,cost:15,subval:272,weight:5,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:0},{name_:"& Scroll~ %T| of Trap Detection",tval:70,tchar:"?",flags:65536,p1:0,cost:35,subval:273,weight:5,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:5},{name_:"& Scroll~ %T| of Trap Detection",tval:70,tchar:"?",flags:65536,p1:0,cost:35,subval:273,weight:5,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:8},{name_:"& Scroll~ %T| of Trap Detection",tval:70,tchar:"?",flags:65536,p1:0,cost:35,subval:273,weight:5,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:12},{name_:"& Scroll~ %T| of Door/Stair Location",tval:70,tchar:"?",flags:131072,p1:0,cost:35,subval:274,weight:5,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:5},{name_:"& Scroll~ %T| of Door/Stair Location",tval:70,tchar:"?",flags:131072,p1:0,cost:35,subval:274,weight:5,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:10},{name_:"& Scroll~ %T| of Door/Stair Location",tval:70,tchar:"?",flags:131072,p1:0,cost:35,subval:274,weight:5,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:15},{name_:"& Scroll~ %T| of Mass Genocide",tval:70,tchar:"?",flags:262144,p1:0,cost:1000,subval:275,weight:5,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:50},{name_:"& Scroll~ %T| of Detect Invisible",tval:70,tchar:"?",flags:524288,p1:0,cost:15,subval:276,weight:5,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:1},{name_:"& Scroll~ %T| of Aggravate Monster",tval:70,tchar:"?",flags:1048576,p1:0,cost:0,subval:277,weight:5,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:5},{name_:"& Scroll~ %T| of Trap Creation",tval:70,tchar:"?",flags:2097152,p1:0,cost:0,subval:278,weight:5,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:12},{name_:"& Scroll~ %T| of Trap/Door Destruction",tval:70,tchar:"?",flags:4194304,p1:0,cost:50,subval:279,weight:5,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:12},{name_:"& Scroll~ %T| of Door Creation",tval:70,tchar:"?",flags:8388608,p1:0,cost:100,subval:280,weight:5,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:12},{name_:"& Scroll~ %T| of Recharging",tval:70,tchar:"?",flags:16777216,p1:0,cost:200,subval:281,weight:5,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:40},{name_:"& Scroll~ %T| of Genocide",tval:70,tchar:"?",flags:33554432,p1:0,cost:750,subval:282,weight:5,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:35},{name_:"& Scroll~ %T| of Darkness",tval:70,tchar:"?",flags:67108864,p1:0,cost:0,subval:283,weight:5,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:1},{name_:"& Scroll~ %T| of Protection from Evil",tval:70,tchar:"?",flags:134217728,p1:0,cost:50,subval:284,weight:5,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:30},{name_:"& Scroll~ %T| of Create Food",tval:70,tchar:"?",flags:268435456,p1:0,cost:10,subval:285,weight:5,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:5},{name_:"& Scroll~ %T| of Dispell Undead",tval:70,tchar:"?",flags:536870912,p1:0,cost:200,subval:286,weight:5,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:40},{name_:"& Scroll~ %T| of *Enchant Weapon*",tval:71,tchar:"?",flags:1,p1:0,cost:500,subval:257,weight:5,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:50},{name_:"& Scroll~ %T| of Curse Weapon",tval:71,tchar:"?",flags:2,p1:0,cost:0,subval:258,weight:5,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:50},{name_:"& Scroll~ %T| of *Enchant Armor*",tval:71,tchar:"?",flags:4,p1:0,cost:500,subval:259,weight:5,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:50},{name_:"& Scroll~ %T| of Curse Armor",tval:71,tchar:"?",flags:8,p1:0,cost:0,subval:260,weight:5,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:50},{name_:"& Scroll~ %T| of Summon Undead",tval:71,tchar:"?",flags:16,p1:0,cost:0,subval:261,weight:5,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:15},{name_:"& Scroll~ %T| of Blessing",tval:71,tchar:"?",flags:32,p1:0,cost:15,subval:262,weight:5,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:1},{name_:"& Scroll~ %T| of Holy Chant",tval:71,tchar:"?",flags:64,p1:0,cost:40,subval:263,weight:5,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:12},{name_:"& Scroll~ %T| of Holy Prayer",tval:71,tchar:"?",flags:128,p1:0,cost:80,subval:264,weight:5,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:24},{name_:"& Scroll~ %T| of Word-of-Recall",tval:71,tchar:"?",flags:256,p1:0,cost:150,subval:265,weight:5,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:5},{name_:"& Scroll~ %T| of *Destruction*",tval:71,tchar:"?",flags:512,p1:0,cost:250,subval:266,weight:5,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:40},{name_:"& %C Potion~| of Gain Strength",tval:75,tchar:"!",flags:1,p1:0,cost:200,subval:257,weight:4,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:25},{name_:"& %C Potion~| of Poison",tval:75,tchar:"!",flags:2,p1:0,cost:0,subval:258,weight:4,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:3},{name_:"& %C Potion~| of Restore Strength",tval:75,tchar:"!",flags:4,p1:0,cost:300,subval:259,weight:4,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:40},{name_:"& %C Potion~| of Gain Intelligence",tval:75,tchar:"!",flags:8,p1:0,cost:300,subval:260,weight:4,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:25},{name_:"& %C Potion~| of Lose Intelligence",tval:75,tchar:"!",flags:16,p1:0,cost:0,subval:261,weight:4,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:25},{name_:"& %C Potion~| of Restore Intelligence",tval:75,tchar:"!",flags:32,p1:0,cost:300,subval:262,weight:4,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:40},{name_:"& %C Potion~| of Gain Wisdom",tval:75,tchar:"!",flags:64,p1:0,cost:300,subval:263,weight:4,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:25},{name_:"& %C Potion~| of Lose Wisdom",tval:75,tchar:"!",flags:128,p1:0,cost:0,subval:264,weight:4,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:25},{name_:"& %C Potion~| of Restore Wisdom",tval:75,tchar:"!",flags:256,p1:0,cost:300,subval:265,weight:4,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:40},{name_:"& %C Potion~| of Charisma",tval:75,tchar:"!",flags:512,p1:0,cost:300,subval:266,weight:4,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:25},{name_:"& %C Potion~| of Ugliness",tval:75,tchar:"!",flags:1024,p1:0,cost:0,subval:267,weight:4,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:25},{name_:"& %C Potion~| of Restore Charisma",tval:75,tchar:"!",flags:2048,p1:0,cost:300,subval:268,weight:4,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:40},{name_:"& %C Potion~| of Cure Light Wounds",tval:75,tchar:"!",flags:268439552,p1:50,cost:15,subval:269,weight:4,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:0},{name_:"& %C Potion~| of Cure Light Wounds",tval:75,tchar:"!",flags:268439552,p1:50,cost:15,subval:269,weight:4,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:1},{name_:"& %C Potion~| of Cure Light Wounds",tval:75,tchar:"!",flags:268439552,p1:50,cost:15,subval:269,weight:4,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:2},{name_:"& %C Potion~| of Cure Serious Wounds",tval:75,tchar:"!",flags:805314560,p1:100,cost:40,subval:270,weight:4,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:3},{name_:"& %C Potion~| of Cure Critical Wounds",tval:75,tchar:"!",flags:1879064576,p1:100,cost:100,subval:271,weight:4,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:5},{name_:"& %C Potion~| of Healing",tval:75,tchar:"!",flags:1879080960,p1:200,cost:200,subval:272,weight:4,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:12},{name_:"& %C Potion~| of Gain Constitution",tval:75,tchar:"!",flags:65536,p1:0,cost:300,subval:273,weight:4,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:25},{name_:"& %C Potion~| of Gain Experience",tval:75,tchar:"!",flags:131072,p1:0,cost:2500,subval:274,weight:4,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:50},{name_:"& %C Potion~| of Sleep",tval:75,tchar:"!",flags:268697600,p1:100,cost:0,subval:275,weight:4,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:0},{name_:"& %C Potion~| of Blindness",tval:75,tchar:"!",flags:524288,p1:0,cost:0,subval:276,weight:4,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:0},{name_:"& %C Potion~| of Confusion",tval:75,tchar:"!",flags:1048576,p1:50,cost:0,subval:277,weight:4,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:0},{name_:"& %C Potion~| of Poison",tval:75,tchar:"!",flags:2097152,p1:0,cost:0,subval:278,weight:4,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:3},{name_:"& %C Potion~| of Haste Self",tval:75,tchar:"!",flags:4194304,p1:0,cost:75,subval:279,weight:4,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:1},{name_:"& %C Potion~| of Slowness",tval:75,tchar:"!",flags:8388608,p1:50,cost:0,subval:280,weight:4,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:1},{name_:"& Icky Green Potion~| of Slime Mold Juice",tval:75,tchar:"!",flags:805306368,p1:400,cost:2,subval:281,weight:4,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:0},{name_:"& Light Brown Potion~| of Apple Juice",tval:75,tchar:"!",flags:0,p1:250,cost:1,subval:282,weight:4,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:0},{name_:"& Clear Potion~| of Water",tval:75,tchar:"!",flags:0,p1:200,cost:0,subval:283,weight:4,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:0},{name_:"& %C Potion~| of Gain Dexterity",tval:75,tchar:"!",flags:33554432,p1:0,cost:300,subval:284,weight:4,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:25},{name_:"& %C Potion~| of Restore Dexterity",tval:75,tchar:"!",flags:67108864,p1:0,cost:300,subval:285,weight:4,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:40},{name_:"& %C Potion~| of Restore Constitution",tval:75,tchar:"!",flags:1744830464,p1:0,cost:300,subval:286,weight:4,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:40},{name_:"& %C Potion~| of Learning",tval:76,tchar:"!",flags:1,p1:0,cost:200,subval:287,weight:4,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:45},{name_:"& %C Potion~| of Lose Memories",tval:76,tchar:"!",flags:2,p1:0,cost:0,subval:288,weight:4,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:10},{name_:"& %C Potion~| of Salt Water",tval:76,tchar:"!",flags:4,p1:0,cost:0,subval:289,weight:4,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:0},{name_:"& %C Potion~| of Invulnerability",tval:76,tchar:"!",flags:8,p1:0,cost:250,subval:290,weight:4,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:40},{name_:"& %C Potion~| of Heroism",tval:76,tchar:"!",flags:16,p1:0,cost:35,subval:291,weight:4,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:1},{name_:"& %C Potion~| of Super Heroism",tval:76,tchar:"!",flags:32,p1:0,cost:100,subval:292,weight:4,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:3},{name_:"& %C Potion~| of Boldliness",tval:76,tchar:"!",flags:64,p1:0,cost:10,subval:293,weight:4,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:1},{name_:"& %C Potion~| of Restore Life Levels",tval:76,tchar:"!",flags:128,p1:0,cost:400,subval:294,weight:4,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:40},{name_:"& %C Potion~| of Resist Heat",tval:76,tchar:"!",flags:256,p1:0,cost:30,subval:295,weight:4,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:1},{name_:"& %C Potion~| of Resist Cold",tval:76,tchar:"!",flags:512,p1:0,cost:30,subval:296,weight:4,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:1},{name_:"& %C Potion~| of Detect Invisible",tval:76,tchar:"!",flags:1024,p1:0,cost:50,subval:297,weight:4,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:3},{name_:"& %C Potion~| of Slow Poison",tval:76,tchar:"!",flags:2048,p1:0,cost:25,subval:298,weight:4,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:1},{name_:"& %C Potion~| of Neutralize Poison",tval:76,tchar:"!",flags:4096,p1:0,cost:75,subval:299,weight:4,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:5},{name_:"& %C Potion~| of Restore Mana",tval:76,tchar:"!",flags:8192,p1:0,cost:35,subval:300,weight:4,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:25},{name_:"& %C Potion~| Infra-Vision",tval:76,tchar:"!",flags:16384,p1:0,cost:20,subval:301,weight:4,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:3},{name_:"& Flask~ of oil",tval:77,tchar:"!",flags:262144,p1:7500,cost:3,subval:257,weight:10,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"2d6",level:1},{name_:"& %M Wand| of Light^ (%P1 charges)",tval:65,tchar:"-",flags:1,p1:0,cost:200,subval:1,weight:10,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:2},{name_:"& %M Wand| of Lightning Bolts^ (%P1 charges)",tval:65,tchar:"-",flags:2,p1:0,cost:600,subval:2,weight:10,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:15},{name_:"& %M Wand| of Frost Bolts^ (%P1 charges)",tval:65,tchar:"-",flags:4,p1:0,cost:800,subval:3,weight:10,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:20},{name_:"& %M Wand| of Fire Bolts^ (%P1 charges)",tval:65,tchar:"-",flags:8,p1:0,cost:1000,subval:4,weight:10,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:30},{name_:"& %M Wand| of Stone-to-Mud^ (%P1 charges)",tval:65,tchar:"-",flags:16,p1:0,cost:300,subval:5,weight:10,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:12},{name_:"& %M Wand| of Polymorph^ (%P1 charges)",tval:65,tchar:"-",flags:32,p1:0,cost:400,subval:6,weight:10,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:20},{name_:"& %M Wand| of Heal Monster^ (%P1 charges)",tval:65,tchar:"-",flags:64,p1:0,cost:0,subval:7,weight:10,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:2},{name_:"& %M Wand| of Haste Monster^ (%P1 charges)",tval:65,tchar:"-",flags:128,p1:0,cost:0,subval:8,weight:10,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:2},{name_:"& %M Wand| of Slow Monster^ (%P1 charges)",tval:65,tchar:"-",flags:256,p1:0,cost:500,subval:9,weight:10,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:2},{name_:"& %M Wand| of Confuse Monster^ (%P1 charges)",tval:65,tchar:"-",flags:512,p1:0,cost:400,subval:10,weight:10,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:2},{name_:"& %M Wand| of Sleep Monster^ (%P1 charges)",tval:65,tchar:"-",flags:1024,p1:0,cost:500,subval:11,weight:10,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:7},{name_:"& %M Wand| of Drain Life^ (%P1 charges)",tval:65,tchar:"-",flags:2048,p1:0,cost:1200,subval:12,weight:10,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:50},{name_:"& %M Wand| of Trap/Door destruction^ (%P1 charges)",tval:65,tchar:"-",flags:4096,p1:0,cost:100,subval:13,weight:10,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:12},{name_:"& %M Wand| of Magic Missile^ (%P1 charges)",tval:65,tchar:"-",flags:8192,p1:0,cost:200,subval:14,weight:10,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:2},{name_:"& %M Wand| of Wall Building^ (%P1 charges)",tval:65,tchar:"-",flags:16384,p1:0,cost:400,subval:15,weight:10,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:25},{name_:"& %M Wand| of Clone Monster^ (%P1 charges)",tval:65,tchar:"-",flags:32768,p1:0,cost:0,subval:16,weight:10,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:2},{name_:"& %M Wand| of Teleport Away^ (%P1 charges)",tval:65,tchar:"-",flags:65536,p1:0,cost:350,subval:17,weight:10,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:20},{name_:"& %M Wand| of Disarming^ (%P1 charges)",tval:65,tchar:"-",flags:131072,p1:0,cost:700,subval:18,weight:10,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:20},{name_:"& %M Wand| of Lightning Balls^ (%P1 charges)",tval:65,tchar:"-",flags:262144,p1:0,cost:1200,subval:19,weight:10,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:35},{name_:"& %M Wand| of Cold Balls^ (%P1 charges)",tval:65,tchar:"-",flags:524288,p1:0,cost:1500,subval:20,weight:10,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:40},{name_:"& %M Wand| of Fire Balls^ (%P1 charges)",tval:65,tchar:"-",flags:1048576,p1:0,cost:1800,subval:21,weight:10,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:50},{name_:"& %M Wand| of Stinking Cloud^ (%P1 charges)",tval:65,tchar:"-",flags:2097152,p1:0,cost:400,subval:22,weight:10,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:5},{name_:"& %M Wand| of Acid Balls^ (%P1 charges)",tval:65,tchar:"-",flags:4194304,p1:0,cost:1650,subval:23,weight:10,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:48},{name_:"& %M Wand| of Wonder^ (%P1 charges)",tval:65,tchar:"-",flags:8388608,p1:0,cost:250,subval:24,weight:10,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:2},{name_:"& %W Staff| of Light^ (%P1 charges)",tval:55,tchar:"_",flags:1,p1:0,cost:250,subval:1,weight:50,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d2",level:5},{name_:"& %W Staff| of Door/Stair Location^ (%P1 charges)",tval:55,tchar:"_",flags:2,p1:0,cost:350,subval:2,weight:50,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d2",level:10},{name_:"& %W Staff| of Trap Location^ (%P1 charges)",tval:55,tchar:"_",flags:4,p1:0,cost:350,subval:3,weight:50,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d2",level:10},{name_:"& %W Staff| of Treasure Location^ (%P1 charges)",tval:55,tchar:"_",flags:8,p1:0,cost:200,subval:4,weight:50,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d2",level:5},{name_:"& %W Staff| of Object Location^ (%P1 charges)",tval:55,tchar:"_",flags:16,p1:0,cost:200,subval:5,weight:50,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d2",level:5},{name_:"& %W Staff| of Teleportation^ (%P1 charges)",tval:55,tchar:"_",flags:32,p1:0,cost:400,subval:6,weight:50,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d2",level:20},{name_:"& %W Staff| of Earthquakes^ (%P1 charges)",tval:55,tchar:"_",flags:64,p1:0,cost:350,subval:7,weight:50,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d2",level:40},{name_:"& %W Staff| of Summoning^ (%P1 charges)",tval:55,tchar:"_",flags:128,p1:0,cost:0,subval:8,weight:50,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d2",level:10},{name_:"& %W Staff| of Summoning^ (%P1 charges)",tval:55,tchar:"_",flags:128,p1:0,cost:0,subval:8,weight:50,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d2",level:50},{name_:"& %W Staff| of *Destruction*^ (%P1 charges)",tval:55,tchar:"_",flags:512,p1:0,cost:2500,subval:10,weight:50,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d2",level:50},{name_:"& %W Staff| of Starlite^ (%P1 charges)",tval:55,tchar:"_",flags:1024,p1:0,cost:800,subval:11,weight:50,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d2",level:20},{name_:"& %W Staff| of Haste Monsters^ (%P1 charges)",tval:55,tchar:"_",flags:2048,p1:0,cost:0,subval:12,weight:50,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d2",level:10},{name_:"& %W Staff| of Slow Monsters^ (%P1 charges)",tval:55,tchar:"_",flags:4096,p1:0,cost:800,subval:13,weight:50,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d2",level:10},{name_:"& %W Staff| of Sleep Monsters^ (%P1 charges)",tval:55,tchar:"_",flags:8192,p1:0,cost:700,subval:14,weight:50,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d2",level:10},{name_:"& %W Staff| of Cure Light Wounds^ (%P1 charges)",tval:55,tchar:"_",flags:16384,p1:0,cost:350,subval:15,weight:50,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d2",level:5},{name_:"& %W Staff| of Detect Invisible^ (%P1 charges)",tval:55,tchar:"_",flags:32768,p1:0,cost:200,subval:16,weight:50,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d2",level:5},{name_:"& %W Staff| of Speed^ (%P1 charges)",tval:55,tchar:"_",flags:65536,p1:0,cost:800,subval:17,weight:50,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d2",level:40},{name_:"& %W Staff| of Slowness^ (%P1 charges)",tval:55,tchar:"_",flags:131072,p1:0,cost:0,subval:18,weight:50,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d2",level:40},{name_:"& %W Staff| of Mass Polymorph^ (%P1 charges)",tval:55,tchar:"_",flags:262144,p1:0,cost:750,subval:19,weight:50,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d2",level:46},{name_:"& %W Staff| of Remove Curse^ (%P1 charges)",tval:55,tchar:"_",flags:524288,p1:0,cost:500,subval:20,weight:50,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d2",level:47},{name_:"& %W Staff| of Detect Evil^ (%P1 charges)",tval:55,tchar:"_",flags:1048576,p1:0,cost:350,subval:21,weight:50,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d2",level:20},{name_:"& %W Staff| of Curing^ (%P1 charges)",tval:55,tchar:"_",flags:2097152,p1:0,cost:1000,subval:22,weight:50,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d2",level:25},{name_:"& %W Staff| of Dispell Evil^ (%P1 charges)",tval:55,tchar:"_",flags:4194304,p1:0,cost:1200,subval:23,weight:50,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d2",level:49},{name_:"& %W Staff| of Darkness^ (%P1 charges)",tval:55,tchar:"_",flags:16777216,p1:0,cost:0,subval:25,weight:50,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d2",level:50},{name_:"& %W Staff| of Darkness^ (%P1 charges)",tval:55,tchar:"_",flags:16777216,p1:0,cost:0,subval:25,weight:50,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d2",level:5},{name_:"& Book of Magic Spells [Beginners-Magik]",tval:90,tchar:"?",flags:127,p1:0,cost:25,subval:257,weight:30,number:1,tohit:(-100),todam:0,ac:0,toac:0,damage:"1d1",level:40},{name_:"& Book of Magic Spells [Magik I]",tval:90,tchar:"?",flags:65408,p1:0,cost:100,subval:258,weight:30,number:1,tohit:(-100),todam:0,ac:0,toac:0,damage:"1d1",level:40},{name_:"& Book of Magic Spells [Magik II]",tval:90,tchar:"?",flags:16711680,p1:0,cost:400,subval:259,weight:30,number:1,tohit:(-100),todam:0,ac:0,toac:0,damage:"1d1",level:40},{name_:"& Book of Magic Spells [The Mages Guide to Power]",tval:90,tchar:"?",flags:2130706432,p1:0,cost:800,subval:261,weight:30,number:1,tohit:(-100),todam:0,ac:0,toac:0,damage:"1d1",level:40},{name_:"& Holy Book of Prayers [Beginners Handbook]",tval:91,tchar:"?",flags:255,p1:0,cost:25,subval:258,weight:30,number:1,tohit:(-100),todam:0,ac:0,toac:0,damage:"1d1",level:40},{name_:"& Holy Book of Prayers [Words of Wisdom]",tval:91,tchar:"?",flags:65280,p1:0,cost:100,subval:259,weight:30,number:1,tohit:(-100),todam:0,ac:0,toac:0,damage:"1d1",level:40},{name_:"& Holy Book of Prayers [Chants and Blessings]",tval:91,tchar:"?",flags:33488896,p1:0,cost:300,subval:260,weight:30,number:1,tohit:(-100),todam:0,ac:0,toac:0,damage:"1d1",level:40},{name_:"& Holy Book of Prayers [Exorcism and Dispelling]",tval:91,tchar:"?",flags:2113929216,p1:0,cost:900,subval:261,weight:30,number:1,tohit:(-100),todam:0,ac:0,toac:0,damage:"1d1",level:40},{name_:"& Small wooden chest",tval:2,tchar:"&",flags:251658240,p1:0,cost:20,subval:1,weight:250,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"2d3",level:7},{name_:"& Large wooden chest",tval:2,tchar:"&",flags:352321536,p1:0,cost:60,subval:4,weight:500,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"2d5",level:15},{name_:"& Small iron chest",tval:2,tchar:"&",flags:251658240,p1:0,cost:100,subval:7,weight:300,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"2d4",level:25},{name_:"& Large iron chest",tval:2,tchar:"&",flags:520093696,p1:0,cost:150,subval:10,weight:1000,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"2d6",level:35},{name_:"& Small steel chest",tval:2,tchar:"&",flags:251658240,p1:0,cost:200,subval:13,weight:500,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"2d4",level:45},{name_:"& Large steel chest",tval:2,tchar:"&",flags:587202560,p1:0,cost:250,subval:16,weight:1000,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"2d6",level:50},{name_:"& Rat Skeleton",tval:1,tchar:"s",flags:0,p1:0,cost:0,subval:1,weight:10,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:1},{name_:"& Giant Centipede Skeleton",tval:1,tchar:"s",flags:0,p1:0,cost:0,subval:2,weight:25,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:1},{name_:"Some filthy rags^ [%P6,%P4]",tval:36,tchar:"~",flags:0,p1:0,cost:0,subval:99,weight:20,number:1,tohit:0,todam:0,ac:1,toac:0,damage:"0d0",level:0},{name_:"& empty bottle",tval:1,tchar:"!",flags:0,p1:0,cost:0,subval:4,weight:2,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:0},{name_:"Some shards of pottery",tval:1,tchar:"~",flags:0,p1:0,cost:0,subval:5,weight:5,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:0},{name_:"& Human Skeleton",tval:1,tchar:"s",flags:0,p1:0,cost:0,subval:7,weight:50,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:1},{name_:"& Dwarf Skeleton",tval:1,tchar:"s",flags:0,p1:0,cost:0,subval:8,weight:60,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:1},{name_:"& Elf Skeleton",tval:1,tchar:"s",flags:0,p1:0,cost:0,subval:9,weight:40,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:1},{name_:"& Gnome Skeleton",tval:1,tchar:"s",flags:0,p1:0,cost:0,subval:10,weight:25,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:1},{name_:"& broken set of teeth",tval:1,tchar:"s",flags:0,p1:0,cost:0,subval:11,weight:3,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:0},{name_:"& large broken bone",tval:1,tchar:"s",flags:0,p1:0,cost:0,subval:12,weight:2,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:0},{name_:"& broken stick",tval:1,tchar:"~",flags:0,p1:0,cost:0,subval:13,weight:3,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:0}];
inventory_init=[0,{name_:"& Ration~ of Food",tval:80,tchar:",",flags:0,p1:5000,cost:3,subval:307,weight:10,number:5,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:0},{name_:"& Hard Biscuit~",tval:80,tchar:",",flags:0,p1:500,cost:1,subval:309,weight:2,number:5,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:0},{name_:"& Strip~ of Beef Jerky",tval:80,tchar:",",flags:0,p1:1750,cost:2,subval:310,weight:2,number:5,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:0},{name_:"& Pint of Fine Ale",tval:80,tchar:",",flags:0,p1:500,cost:1,subval:311,weight:10,number:3,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:0},{name_:"& Pint of Fine Wine",tval:80,tchar:",",flags:0,p1:400,cost:2,subval:312,weight:10,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:0},{name_:"& Dagger (Misercorde) (%P2,%P3)",tval:23,tchar:"|",flags:0,p1:0,cost:10,subval:2,weight:15,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d4",level:0},{name_:"& Dagger (Stiletto) (%P2,%P3)",tval:23,tchar:"|",flags:0,p1:0,cost:10,subval:3,weight:12,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d4",level:0},{name_:"& Bastard Sword (%P2,%P3)",tval:23,tchar:"|",flags:0,p1:0,cost:350,subval:7,weight:140,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"3d4",level:0},{name_:"& Broadsword (%P2,%P3)",tval:23,tchar:"|",flags:0,p1:0,cost:255,subval:10,weight:150,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"2d5",level:0},{name_:"& Longsword (%P2,%P3)",tval:23,tchar:"|",flags:0,p1:0,cost:300,subval:18,weight:130,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d10",level:0},{name_:"& Small Sword (%P2,%P3)",tval:23,tchar:"|",flags:0,p1:0,cost:48,subval:22,weight:75,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d6",level:0},{name_:"& Broad Axe (%P2,%P3)",tval:21,tchar:"\\",flags:0,p1:0,cost:304,subval:4,weight:160,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"2d5",level:0},{name_:"& Morningstar (%P2,%P3)",tval:21,tchar:"\\",flags:0,p1:0,cost:396,subval:9,weight:150,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"2d6",level:0},{name_:"& Mace (%P2,%P3)",tval:21,tchar:"\\",flags:0,p1:0,cost:130,subval:10,weight:120,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"2d4",level:0},{name_:"& War Hammer (%P2,%P3)",tval:21,tchar:"\\",flags:0,p1:0,cost:225,subval:11,weight:120,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"3d3",level:0},{name_:"& Halberd (%P2,%P3)",tval:22,tchar:"/",flags:0,p1:0,cost:430,subval:5,weight:190,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"3d4",level:0},{name_:"& Pike (%P2,%P3)",tval:22,tchar:"/",flags:0,p1:0,cost:358,subval:7,weight:160,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"2d5",level:0},{name_:"& Spear (%P2,%P3)",tval:22,tchar:"/",flags:0,p1:0,cost:36,subval:8,weight:50,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d6",level:0},{name_:"& Short Bow (%P2)",tval:20,tchar:"}",flags:0,p1:2,cost:50,subval:1,weight:30,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:0},{name_:"& Long Bow (%P2)",tval:20,tchar:"}",flags:0,p1:3,cost:120,subval:2,weight:40,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:0},{name_:"& Light Crossbow (%P2)",tval:20,tchar:"}",flags:0,p1:5,cost:160,subval:10,weight:110,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:0},{name_:"& Sling (%P2)",tval:20,tchar:"}",flags:0,p1:1,cost:5,subval:20,weight:5,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:0},{name_:"& Arrow~ (%P2,%P3)",tval:12,tchar:"{",flags:0,p1:0,cost:1,subval:1,weight:2,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d4",level:0},{name_:"& Bolt~ (%P2,%P3)",tval:11,tchar:"{",flags:0,p1:0,cost:2,subval:1,weight:3,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d5",level:0},{name_:"& Iron Shot~ (%P2,%P3)",tval:10,tchar:"{",flags:0,p1:0,cost:2,subval:1,weight:5,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d3",level:0},{name_:"& Pick (%P1) (%P2,%P3)",tval:25,tchar:"\\",flags:536870912,p1:1,cost:50,subval:1,weight:150,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d3",level:0},{name_:"& Shovel (%P1) (%P2,%P3)",tval:25,tchar:"\\",flags:536870912,p1:0,cost:15,subval:2,weight:60,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d2",level:0},{name_:"& Pair of Soft Leather Boots [%P6,%P4]",tval:30,tchar:"]",flags:0,p1:0,cost:7,subval:2,weight:30,number:1,tohit:0,todam:0,ac:2,toac:0,damage:"1d1",level:0},{name_:"& Pair of Hard Leather Boots [%P6,%P4]",tval:30,tchar:"]",flags:0,p1:0,cost:12,subval:3,weight:40,number:1,tohit:0,todam:0,ac:3,toac:0,damage:"1d1",level:0},{name_:"& Hard Leather Cap [%P6,%P4]",tval:33,tchar:"]",flags:0,p1:0,cost:12,subval:2,weight:15,number:1,tohit:0,todam:0,ac:2,toac:0,damage:"0d0",level:0},{name_:"& Metal Cap [%P6,%P4]",tval:33,tchar:"]",flags:0,p1:0,cost:30,subval:3,weight:20,number:1,tohit:0,todam:0,ac:3,toac:0,damage:"1d1",level:0},{name_:"& Iron Helm [%P6,%P4]",tval:33,tchar:"]",flags:0,p1:0,cost:75,subval:4,weight:75,number:1,tohit:0,todam:0,ac:5,toac:0,damage:"1d3",level:0},{name_:"Soft Leather Armor [%P6,%P4]",tval:36,tchar:"(",flags:0,p1:0,cost:18,subval:2,weight:80,number:1,tohit:0,todam:0,ac:4,toac:0,damage:"0d0",level:0},{name_:"Soft Studded Leather [%P6,%P4]",tval:36,tchar:"(",flags:0,p1:0,cost:35,subval:3,weight:90,number:1,tohit:0,todam:0,ac:5,toac:0,damage:"1d1",level:0},{name_:"Hard Leather Armor [%P6,%P4]",tval:36,tchar:"(",flags:0,p1:0,cost:55,subval:4,weight:100,number:1,tohit:(-1),todam:0,ac:6,toac:0,damage:"1d1",level:0},{name_:"Hard Studded Leather [%P6,%P4]",tval:36,tchar:"(",flags:0,p1:0,cost:100,subval:5,weight:110,number:1,tohit:(-1),todam:0,ac:7,toac:0,damage:"1d2",level:0},{name_:"Leather Scale Mail [%P6,%P4]",tval:36,tchar:"(",flags:0,p1:0,cost:330,subval:9,weight:140,number:1,tohit:(-1),todam:0,ac:11,toac:0,damage:"1d1",level:0},{name_:"Metal Scale Mail [%P6,%P4]",tval:35,tchar:"[",flags:0,p1:0,cost:430,subval:1,weight:250,number:1,tohit:(-2),todam:0,ac:13,toac:0,damage:"1d4",level:0},{name_:"Chain Mail [%P6,%P4]",tval:35,tchar:"[",flags:0,p1:0,cost:530,subval:2,weight:220,number:1,tohit:(-2),todam:0,ac:14,toac:0,damage:"1d4",level:0},{name_:"Partial Plate Armor [%P6,%P4]",tval:35,tchar:"[",flags:0,p1:0,cost:900,subval:9,weight:260,number:1,tohit:(-3),todam:0,ac:22,toac:0,damage:"1d6",level:0},{name_:"Full Plate Armor [%P6,%P4]",tval:35,tchar:"[",flags:0,p1:0,cost:1050,subval:11,weight:380,number:1,tohit:(-3),todam:0,ac:25,toac:0,damage:"2d4",level:0},{name_:"& Cloak [%P6,%P4]",tval:32,tchar:"(",flags:0,p1:0,cost:3,subval:1,weight:10,number:1,tohit:0,todam:0,ac:1,toac:0,damage:"0d0",level:0},{name_:"& Set of Leather Gloves [%P6,%P4]",tval:31,tchar:"]",flags:0,p1:0,cost:3,subval:1,weight:5,number:1,tohit:0,todam:0,ac:1,toac:0,damage:"0d0",level:0},{name_:"& Set of Gauntlets [%P6,%P4]",tval:31,tchar:"]",flags:0,p1:0,cost:35,subval:2,weight:25,number:1,tohit:0,todam:0,ac:2,toac:0,damage:"1d1",level:0},{name_:"& Small Leather Shield [%P6,%P4]",tval:34,tchar:")",flags:0,p1:0,cost:30,subval:1,weight:50,number:1,tohit:0,todam:0,ac:2,toac:0,damage:"1d1",level:0},{name_:"& Medium Leather Shield [%P6,%P4]",tval:34,tchar:")",flags:0,p1:0,cost:60,subval:2,weight:75,number:1,tohit:0,todam:0,ac:3,toac:0,damage:"1d2",level:0},{name_:"& Small Metal Shield [%P6,%P4]",tval:34,tchar:")",flags:0,p1:0,cost:50,subval:4,weight:65,number:1,tohit:0,todam:0,ac:3,toac:0,damage:"1d3",level:0},{name_:"& Ring of Resist Fire",tval:45,tchar:"=",flags:524288,p1:0,cost:250,subval:11,weight:2,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:0},{name_:"& Ring of Resist Cold",tval:45,tchar:"=",flags:2097152,p1:0,cost:250,subval:12,weight:2,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:0},{name_:"& Ring of Feather Falling",tval:45,tchar:"=",flags:67108864,p1:0,cost:250,subval:13,weight:2,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:0},{name_:"& Ring of Protection [%P4]",tval:45,tchar:"=",flags:0,p1:0,cost:100,subval:24,weight:2,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:0},{name_:"& Amulet of Charisma (%P1)",tval:40,tchar:"\"",flags:32,p1:0,cost:250,subval:6,weight:3,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:0},{name_:"& Amulet of Slow Digestion",tval:40,tchar:"\"",flags:128,p1:0,cost:200,subval:9,weight:3,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:0},{name_:"& Amulet of Resist Acid",tval:40,tchar:"\"",flags:1048576,p1:0,cost:300,subval:10,weight:3,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:0},{name_:"& Scroll~ of Enchant Weapon To-Hit",tval:70,tchar:"?",flags:1,p1:0,cost:125,subval:300,weight:5,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:0},{name_:"& Scroll~ of Enchant Weapon To-Dam",tval:70,tchar:"?",flags:2,p1:0,cost:125,subval:301,weight:5,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:0},{name_:"& Scroll~ of Enchant Armor",tval:70,tchar:"?",flags:4,p1:0,cost:125,subval:302,weight:5,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:0},{name_:"& Scroll~ of Identify",tval:70,tchar:"?",flags:8,p1:0,cost:50,subval:303,weight:5,number:2,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:0},{name_:"& Scroll~ of Remove Curse",tval:70,tchar:"?",flags:16,p1:0,cost:100,subval:304,weight:5,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:0},{name_:"& Scroll~ of Light",tval:70,tchar:"?",flags:32,p1:0,cost:15,subval:305,weight:5,number:3,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:0},{name_:"& Scroll~ of Phase Door",tval:70,tchar:"?",flags:128,p1:0,cost:15,subval:306,weight:5,number:2,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:0},{name_:"& Scroll~ of Magic Mapping",tval:70,tchar:"?",flags:2048,p1:0,cost:40,subval:307,weight:5,number:2,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:0},{name_:"& Scroll~ of Treasure Detection",tval:70,tchar:"?",flags:16384,p1:0,cost:15,subval:308,weight:5,number:2,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:0},{name_:"& Scroll~ of Object Detection",tval:70,tchar:"?",flags:32768,p1:0,cost:15,subval:309,weight:5,number:2,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:0},{name_:"& Scroll~ of Detect Invisible",tval:70,tchar:"?",flags:524288,p1:0,cost:15,subval:310,weight:5,number:2,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:0},{name_:"& Scroll~ of Recharging",tval:70,tchar:"?",flags:16777216,p1:0,cost:200,subval:311,weight:5,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:0},{name_:"& Book of Magic Spells [Beginners-Magik]",tval:90,tchar:"?",flags:127,p1:0,cost:25,subval:257,weight:30,number:1,tohit:(-100),todam:0,ac:0,toac:0,damage:"1d1",level:0},{name_:"& Book of Magic Spells [Magik I]",tval:90,tchar:"?",flags:65408,p1:0,cost:100,subval:258,weight:30,number:1,tohit:(-100),todam:0,ac:0,toac:0,damage:"1d1",level:0},{name_:"& Book of Magic Spells [Magik II]",tval:90,tchar:"?",flags:16711680,p1:0,cost:400,subval:259,weight:30,number:1,tohit:(-100),todam:0,ac:0,toac:0,damage:"1d1",level:0},{name_:"& Book of Magic Spells [The Mages Guide to Power]",tval:90,tchar:"?",flags:2130706432,p1:0,cost:800,subval:261,weight:30,number:1,tohit:(-100),todam:0,ac:0,toac:0,damage:"1d1",level:0},{name_:"& Holy Book of Prayers [Beginners Handbook]",tval:91,tchar:"?",flags:255,p1:0,cost:25,subval:258,weight:30,number:1,tohit:(-100),todam:0,ac:0,toac:0,damage:"1d1",level:0},{name_:"& Holy Book of Prayers [Words of Wisdom]",tval:91,tchar:"?",flags:65280,p1:0,cost:100,subval:259,weight:30,number:1,tohit:(-100),todam:0,ac:0,toac:0,damage:"1d1",level:0},{name_:"& Holy Book of Prayers [Chants and Blessings]",tval:91,tchar:"?",flags:33488896,p1:0,cost:300,subval:260,weight:30,number:1,tohit:(-100),todam:0,ac:0,toac:0,damage:"1d1",level:0},{name_:"& Holy Book of Prayers [Exorcism and Dispelling]",tval:91,tchar:"?",flags:2113929216,p1:0,cost:900,subval:261,weight:30,number:1,tohit:(-100),todam:0,ac:0,toac:0,damage:"1d1",level:0},{name_:"& Potion~ of Restore Strength",tval:75,tchar:"!",flags:4,p1:0,cost:300,subval:310,weight:4,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:0},{name_:"& Potion~ of Restore Intelligence",tval:75,tchar:"!",flags:32,p1:0,cost:300,subval:311,weight:4,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:0},{name_:"& Potion~ of Restore Wisdom",tval:75,tchar:"!",flags:256,p1:0,cost:300,subval:312,weight:4,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:0},{name_:"& Potion~ of Restore Charisma",tval:75,tchar:"!",flags:2048,p1:0,cost:300,subval:313,weight:4,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:0},{name_:"& Potion~ of Cure Light Wounds",tval:75,tchar:"!",flags:268439552,p1:50,cost:15,subval:314,weight:4,number:2,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:0},{name_:"& Potion~ of Cure Serious Wounds",tval:75,tchar:"!",flags:805314560,p1:100,cost:40,subval:315,weight:4,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:0},{name_:"& Potion~ of Cure Critical Wounds",tval:75,tchar:"!",flags:1879064576,p1:100,cost:100,subval:316,weight:4,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:0},{name_:"& Potion~ of Restore Dexterity",tval:75,tchar:"!",flags:67108864,p1:0,cost:300,subval:317,weight:4,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:0},{name_:"& Potion~ of Restore Constitution",tval:75,tchar:"!",flags:1744830464,p1:0,cost:300,subval:318,weight:4,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:0},{name_:"& Potion~ of Heroism",tval:76,tchar:"!",flags:16,p1:0,cost:35,subval:319,weight:4,number:2,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:0},{name_:"& Potion~ of Boldliness",tval:76,tchar:"!",flags:64,p1:0,cost:10,subval:320,weight:4,number:2,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:0},{name_:"& Wand of Light (%P1 charges)",tval:65,tchar:"-",flags:1,p1:0,cost:200,subval:1,weight:10,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:2},{name_:"& Wand of Lightning Bolts (%P1 charges)",tval:65,tchar:"-",flags:2,p1:0,cost:600,subval:2,weight:10,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:6},{name_:"& Wand of Magic Missile (%P1 charges)",tval:65,tchar:"-",flags:8192,p1:0,cost:200,subval:14,weight:10,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:2},{name_:"& Wand of Disarming (%P1 charges)",tval:65,tchar:"-",flags:131072,p1:0,cost:700,subval:18,weight:10,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:12},{name_:"& Wand of Lightning Balls (%P1 charges)",tval:65,tchar:"-",flags:262144,p1:0,cost:1200,subval:19,weight:10,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:20},{name_:"& Wand of Wonder (%P1 charges)",tval:65,tchar:"-",flags:8388608,p1:0,cost:250,subval:24,weight:10,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:10},{name_:"& Staff of Light (%P1 charges)",tval:55,tchar:"_",flags:1,p1:0,cost:250,subval:1,weight:50,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d2",level:3},{name_:"& Staff of Door/Stair Location (%P1 charges)",tval:55,tchar:"_",flags:2,p1:0,cost:350,subval:2,weight:50,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d2",level:7},{name_:"& Staff of Trap Location (%P1 charges)",tval:55,tchar:"_",flags:4,p1:0,cost:350,subval:3,weight:50,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d2",level:7},{name_:"& Staff of Detect Invisible (%P1 charges)",tval:55,tchar:"_",flags:32768,p1:0,cost:200,subval:16,weight:50,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d2",level:3},{name_:"& Potion~ of Restore Life Levels",tval:76,tchar:"!",flags:128,p1:0,cost:400,subval:321,weight:4,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:0},{name_:"& Scroll~ of Blessing",tval:71,tchar:"?",flags:32,p1:0,cost:15,subval:312,weight:5,number:2,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:0},{name_:"& Scroll~ of Word-of-Recall",tval:71,tchar:"?",flags:256,p1:0,cost:150,subval:313,weight:5,number:3,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:0},{name_:"& Potion~ of Slow Poison",tval:76,tchar:"!",flags:2048,p1:0,cost:25,subval:322,weight:4,number:2,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:0},{name_:"& Potion~ of Neutralize Poison",tval:76,tchar:"!",flags:4096,p1:0,cost:75,subval:323,weight:4,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:0},{name_:"& Wand of Stinking Cloud (%P1 charges)",tval:65,tchar:"-",flags:2097152,p1:0,cost:400,subval:22,weight:10,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:5},{name_:"& Iron Spike~",tval:13,tchar:"~",flags:0,p1:0,cost:1,subval:1,weight:10,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:1},{name_:"& Brass Lantern~ with %P5 turns of light",tval:15,tchar:"~",flags:0,p1:7500,cost:35,subval:2,weight:50,number:1,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:1},{name_:"& Wooden Torch~ with %P5 turns of light",tval:15,tchar:"~",flags:0,p1:4000,cost:2,subval:270,weight:30,number:5,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:1},{name_:"& Flask~ of oil",tval:77,tchar:"!",flags:262144,p1:7500,cost:3,subval:257,weight:10,number:5,tohit:0,todam:0,ac:0,toac:0,damage:"2d6",level:1}];
store_choice=[0,[0,105,104,103,102,102,104,42,105,104,27,26,5,4,3,3,2,2,2,1,1,1,1,1,1,1,1],[0,30,31,32,33,34,35,36,37,38,39,40,41,43,44,45,46,47,30,33,34,43,44,28,29,30,31],[0,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,6,7,23,25,23,25],[0,71,72,73,74,59,59,77,79,80,81,84,85,13,14,15,96,97,98,100,79,79,80,80,81,72,98],[0,55,56,57,58,58,60,61,62,63,64,65,66,75,76,78,82,83,60,61,62,63,64,98,99,98,98],[0,67,49,50,51,52,53,54,48,68,69,69,70,86,87,88,89,90,91,92,93,94,95,86,101,68,88]];
store_buy=[0,$S1,$S2,$S3,$S4,$S5,$S6];
owners=[0,{owner_name:"Erick the Honest       (Human)      General Store",max_cost:250,max_inflate:Math.fround(0.75),min_inflate:Math.fround(0.08),haggle_per:Math.fround(0.04),owner_race:1,insult_max:12},{owner_name:"Mauglin the Grumpy     (Dwarf)      Armory",max_cost:32000,max_inflate:Math.fround(1.00),min_inflate:Math.fround(0.12),haggle_per:Math.fround(0.04),owner_race:6,insult_max:5},{owner_name:"Arndal Beast-Slayer    (Half-Elf)   Weaponsmith",max_cost:10000,max_inflate:Math.fround(0.85),min_inflate:Math.fround(0.10),haggle_per:Math.fround(0.05),owner_race:2,insult_max:8},{owner_name:"Hardblow the Humble    (Human)      Temple",max_cost:3500,max_inflate:Math.fround(0.75),min_inflate:Math.fround(0.09),haggle_per:Math.fround(0.06),owner_race:1,insult_max:15},{owner_name:"Ga-nat the Greedy      (Gnome)      Alchemist",max_cost:12000,max_inflate:Math.fround(1.20),min_inflate:Math.fround(0.15),haggle_per:Math.fround(0.04),owner_race:5,insult_max:9},{owner_name:"Valeria Starshine      (Elf)        Magic Shop",max_cost:32000,max_inflate:Math.fround(0.75),min_inflate:Math.fround(0.10),haggle_per:Math.fround(0.05),owner_race:3,insult_max:11},{owner_name:"Andy the Friendly      (Halfling)   General Store",max_cost:200,max_inflate:Math.fround(0.70),min_inflate:Math.fround(0.08),haggle_per:Math.fround(0.05),owner_race:4,insult_max:15},{owner_name:"Darg-Low the Grim      (Human)      Armory",max_cost:10000,max_inflate:Math.fround(0.90),min_inflate:Math.fround(0.11),haggle_per:Math.fround(0.04),owner_race:1,insult_max:9},{owner_name:"Oglign Dragon-Slayer   (Dwarf)      Weaponsmith",max_cost:32000,max_inflate:Math.fround(0.95),min_inflate:Math.fround(0.12),haggle_per:Math.fround(0.04),owner_race:6,insult_max:8},{owner_name:"Gunnar the Paladin     (Human)      Temple",max_cost:5000,max_inflate:Math.fround(0.85),min_inflate:Math.fround(0.10),haggle_per:Math.fround(0.05),owner_race:1,insult_max:23},{owner_name:"Mauser the Chemist     (Half-Elf)   Alchemist",max_cost:10000,max_inflate:Math.fround(0.90),min_inflate:Math.fround(0.11),haggle_per:Math.fround(0.05),owner_race:2,insult_max:8},{owner_name:"Gopher the Great!      (Gnome)      Magic Shop",max_cost:20000,max_inflate:Math.fround(1.15),min_inflate:Math.fround(0.13),haggle_per:Math.fround(0.06),owner_race:5,insult_max:10},{owner_name:"Lyar-el the Comely     (Elf)        General Store",max_cost:300,max_inflate:Math.fround(0.65),min_inflate:Math.fround(0.07),haggle_per:Math.fround(0.06),owner_race:3,insult_max:18},{owner_name:"Mauglim the Horrible   (Half-Orc)   Armory",max_cost:3000,max_inflate:Math.fround(1.00),min_inflate:Math.fround(0.13),haggle_per:Math.fround(0.05),owner_race:7,insult_max:9},{owner_name:"Ithyl-Mak the Beastly  (Half-Troll) Weaponsmith",max_cost:3000,max_inflate:Math.fround(1.10),min_inflate:Math.fround(0.15),haggle_per:Math.fround(0.06),owner_race:8,insult_max:8},{owner_name:"Delihla the Pure       (Half-Elf)   Temple",max_cost:25000,max_inflate:Math.fround(0.80),min_inflate:Math.fround(0.07),haggle_per:Math.fround(0.06),owner_race:2,insult_max:20},{owner_name:"Wizzle the Chaotic     (Halfling)   Alchemist",max_cost:10000,max_inflate:Math.fround(0.90),min_inflate:Math.fround(0.10),haggle_per:Math.fround(0.06),owner_race:4,insult_max:8},{owner_name:"Inglorian the Mage     (Human?)     Magic Shop",max_cost:32000,max_inflate:Math.fround(1.00),min_inflate:Math.fround(0.10),haggle_per:Math.fround(0.07),owner_race:1,insult_max:10}];
player_init=[0,[0,1,104,42,7,33],[0,1,104,42,7,67],[0,1,104,42,7,71],[0,1,104,7,33,67],[0,1,104,42,7,67],[0,1,104,42,7,71]];
object_ident=[0,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false];
trap_lista=[0,{name_:"an open pit",tval:102,tchar:" ",flags:0,p1:0,cost:0,subval:1,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:"2d6",level:(-50)},{name_:"an arrow trap",tval:101,tchar:".",flags:0,p1:0,cost:0,subval:2,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:"1d8",level:0},{name_:"a covered pit",tval:101,tchar:".",flags:0,p1:0,cost:0,subval:3,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:"2d6",level:0},{name_:"a trap door",tval:101,tchar:".",flags:0,p1:0,cost:0,subval:4,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:"2d8",level:0},{name_:"a gas trap",tval:101,tchar:".",flags:0,p1:0,cost:0,subval:5,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:"1d4",level:0},{name_:"a loose rock",tval:101,tchar:".",flags:0,p1:0,cost:0,subval:6,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:0},{name_:"a dart trap",tval:101,tchar:".",flags:0,p1:0,cost:0,subval:7,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:"1d4",level:0},{name_:"a strange rune",tval:101,tchar:".",flags:0,p1:0,cost:0,subval:8,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:0},{name_:"some loose rock",tval:101,tchar:".",flags:0,p1:0,cost:0,subval:9,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:"2d6",level:0},{name_:"a gas trap",tval:101,tchar:".",flags:0,p1:0,cost:0,subval:10,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:"1d4",level:0},{name_:"a strange rune",tval:101,tchar:".",flags:0,p1:0,cost:0,subval:11,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:0},{name_:"a blackened spot",tval:101,tchar:".",flags:0,p1:0,cost:0,subval:12,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:"4d6",level:0},{name_:"some corroded rock",tval:101,tchar:".",flags:0,p1:0,cost:0,subval:13,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:"4d6",level:0},{name_:"a gas trap",tval:101,tchar:".",flags:0,p1:0,cost:0,subval:14,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:"2d6",level:0},{name_:"a gas trap",tval:101,tchar:".",flags:0,p1:5,cost:0,subval:15,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:"1d4",level:10},{name_:"a gas trap",tval:101,tchar:".",flags:0,p1:5,cost:0,subval:16,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:"1d8",level:5},{name_:"a dart trap",tval:101,tchar:".",flags:0,p1:5,cost:0,subval:17,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:"1d8",level:10},{name_:"a dart trap",tval:101,tchar:".",flags:0,p1:5,cost:0,subval:18,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:"1d8",level:10}];
trap_listb=[0,{name_:"an open pit",tval:102,tchar:" ",flags:0,p1:1,cost:0,subval:1,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:"2d6",level:(-50)},{name_:"an arrow trap",tval:102,tchar:"^",flags:0,p1:3,cost:0,subval:2,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:"1d8",level:(-10)},{name_:"a covered pit",tval:102,tchar:"^",flags:0,p1:2,cost:0,subval:3,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:"2d6",level:(-40)},{name_:"a trap door",tval:102,tchar:"^",flags:0,p1:5,cost:0,subval:4,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:"2d8",level:(-25)},{name_:"a gas trap",tval:102,tchar:"^",flags:0,p1:3,cost:0,subval:5,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:"1d4",level:5},{name_:"a loose rock",tval:102,tchar:";",flags:0,p1:0,cost:0,subval:6,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:(-90)},{name_:"a dart trap",tval:102,tchar:"^",flags:0,p1:5,cost:0,subval:7,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:"1d4",level:10},{name_:"a strange rune",tval:102,tchar:"^",flags:0,p1:5,cost:0,subval:8,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:(-10)},{name_:"some loose rock",tval:102,tchar:"^",flags:0,p1:5,cost:0,subval:9,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:"2d6",level:(-10)},{name_:"a gas trap",tval:102,tchar:"^",flags:0,p1:10,cost:0,subval:10,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:"1d4",level:5},{name_:"a strange rune",tval:102,tchar:"^",flags:0,p1:5,cost:0,subval:11,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:(-10)},{name_:"a blackened spot",tval:102,tchar:"^",flags:0,p1:10,cost:0,subval:12,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:"4d6",level:10},{name_:"some corroded rock",tval:102,tchar:"^",flags:0,p1:10,cost:0,subval:13,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:"4d6",level:10},{name_:"a gas trap",tval:102,tchar:"^",flags:0,p1:5,cost:0,subval:14,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:"2d6",level:5},{name_:"a gas trap",tval:102,tchar:"^",flags:0,p1:5,cost:0,subval:15,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:"1d4",level:10},{name_:"a gas trap",tval:102,tchar:"^",flags:0,p1:5,cost:0,subval:16,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:"1d8",level:5},{name_:"a dart trap",tval:102,tchar:"^",flags:0,p1:5,cost:0,subval:17,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:"1d8",level:10},{name_:"a dart trap",tval:102,tchar:"^",flags:0,p1:5,cost:0,subval:18,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:"1d8",level:10},{name_:"a closed door",tval:105,tchar:"+",flags:0,p1:0,cost:0,subval:19,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:0}];
store_door=[0,{name_:"The entrance to the General Store.",tval:110,tchar:"1",flags:0,p1:0,cost:0,subval:101,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:0},{name_:"The entrance to the Armory.",tval:110,tchar:"2",flags:0,p1:0,cost:0,subval:102,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:0},{name_:"The entrance to the Weapon Smiths.",tval:110,tchar:"3",flags:0,p1:0,cost:0,subval:103,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:0},{name_:"The entrance to the Temple.",tval:110,tchar:"4",flags:0,p1:0,cost:0,subval:104,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:0},{name_:"The entrance to the Alchemy Shop.",tval:110,tchar:"5",flags:0,p1:0,cost:0,subval:105,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:0},{name_:"The entrance to the Magic Shop.",tval:110,tchar:"6",flags:0,p1:0,cost:0,subval:106,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:0}];
scare_monster={name_:"a strange rune",tval:102,tchar:"^",flags:0,p1:0,cost:0,subval:99,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:(-90)};
rubble={name_:"some rubble",tval:103,tchar:":",flags:0,p1:0,cost:0,subval:1,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:"0d0",level:0};
door_list=[0,{name_:"an open door",tval:104,tchar:"'",flags:0,p1:0,cost:0,subval:1,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:0},{name_:"a closed door",tval:105,tchar:"+",flags:0,p1:0,cost:0,subval:19,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:0},{name_:"a secret door",tval:109,tchar:"#",flags:0,p1:0,cost:0,subval:19,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:0}];
up_stair={name_:"an up staircase ",tval:107,tchar:"<",flags:0,p1:0,cost:0,subval:1,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:0};
down_stair={name_:"a down staircase",tval:108,tchar:">",flags:0,p1:0,cost:0,subval:1,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:"1d1",level:0};
floor_set=$S7;
wall_set=$S8;
pwall_set=$S9;
corr_set=$S10;
trap_set=$S11;
light_set=$S12;
colors=[0,"Amber","Azure","Blue","Blue Speckled","Blue Spotted","Black","Black Speckled","Black Spotted","Brown","Brown Speckled","Brown Spotted","Bubbling","Chartreuse","Clear","Cloudy","Copper","Copper Spotted","Crimson","Cyan","Dark Blue","Dark Green","Dark Red","Ecru","Gold","Gold Spotted","Green","Green Speckled","Green Spotted","Grey","Grey Spotted","Hazy","Indigo","Light Blue","Light Green","Magenta","Metallic Blue","Metallic Red","Metallic Green","Metallic Purple","Misty","Orange","Orange Speckled","Orange Spotted","Pink","Pink Speckled","Plaid","Puce","Purple","Purple Speckled","Purple Spotted","Red","Red Speckled","Red Spotted","Silver","Silver Speckled","Silver Spotted","Smokey","Tan","Tangerine","Topaz","Turquoise","Violet","Vermilion","White","White Speckled","White Spotted","Yellow"];
mushrooms=[0,"Blue","Black","Brown","Copper","Crimson","Dark blue","Dark green","Dark red","Gold","Green","Grey","Light Blue","Light Green","Orange","Pink","Plaid","Purple","Red","Tan","Turquoise","Violet","White","Yellow","Wrinkled","Wooden","Slimey","Speckled","Spotted","Furry"];
woods=[0,"Applewood","Ashen","Aspen","Avocado wood","Balsa","Banyan","Birch","Cedar","Cherrywood","Cinnibar","Cottonwood","Cypress","Dogwood","Driftwood","Ebony","Elm wood","Eucalyptus","Grapevine","Hawthorn","Hemlock","Hickory","Iron wood","Juniper","Locust","Mahogany","Magnolia","Manzanita","Maple","Mulberry","Oak","Pecan","Persimmon","Pine","Redwood","Rosewood","Spruce","Sumac","Sycamore","Teak","Walnut","Zebra wood"];
metals=[0,"Aluminium","Bone","Brass","Bronze","Cast Iron","Chromium","Copper","Gold","Iron","Lead","Magnesium","Molybdenum","Nickel","Pewter","Rusty","Silver","Steel","Tin","Titanium","Tungsten","Zirconium","Zinc","Aluminium Plated","Brass Plated","Copper Plated","Gold Plated","Nickel Plated","Silver Plated","Steel Plated","Tin Plated","Zinc Plated"];
rocks=[0,"Amber","Agate","Alexandrite","Amethyst","Antlerite","Aquamarine","Argentite","Azurite","Beryl","Bloodstone","Calcite","Carnelian","Coral","Corundum","Cryolite","Diamond","Diorite","Emerald","Flint","Fluorite","Gabbro","Garnet","Granite","Gypsum","Hematite","Jade","Jasper","Kryptonite","Lapus lazuli","Limestone","Malachite","Manganite","Marble","Moonstone","Neptunite","Obsidian","Onyx","Opal","Pearl","Pyrite","Quartz","Quartzite","Rhodonite","Rhyolite","Ruby","Saphire","Sphalerite","Staurolite","Tiger eye","Topaz","Turquoise","Zircon"];
amulets=[0,"Birch","Cedar","Dogwood","Driftwood","Elm wood","Hemlock","Hickory","Mahogany","Maple","Oak","Pine","Redwood","Rosewood","Walnut","Aluminium","Bone","Brass","Bronze","Copper","Iron","Lead","Nickel","Agate","Amethyst","Diamond","Emerald","Flint","Garnet","Jade","Obsidian","Onyx","Opal","Pearl","Quartz","Ruby","Saphire","Tiger eye","Topaz","Turquoise"];
syllables=[0,"a","ab","ag","aks","ala","an","ankh","app","arg","arze","ash","aus","ban","bar","bat","bek","bie","bin","bit","bjor","blu","bot","bu","byt","comp","con","cos","cre","dalf","dan","den","doe","dok","eep","el","eng","er","ere","erk","esh","evs","fa","fid","for","fri","fu","gan","gar","glen","gop","gre","ha","he","hyd","i","ing","ion","ip","ish","it","ite","iv","jo","kho","kli","klis","la","lech","man","mar","me","mi","mic","mik","mon","mung","mur","nej","nelg","nep","ner","nes","nis","nih","nin","o","od","ood","org","orn","ox","oxy","pay","pet","ple","plu","po","pot","prok","re","rea","rhov","ri","ro","rog","rok","rol","sa","san","sat","see","sef","seh","shu","ski","sna","sne","snik","sno","so","sol","sri","sta","sun","ta","tab","tem","ther","ti","tox","trol","tue","turs","u","ulk","um","un","uni","ur","val","viv","vly","vom","wah","wed","werg","wex","whon","wun","x","yerg","yp","zun"];
vowel_set=$S13;
c_list=[0,{name_:"Filthy Street Urchin",cmove:1179658,spells:0,cdefense:8244,sleep:400,mexp:0,aaf:4,ac:1,speed:1,cchar:"p",hd:"1d4",damage:"1 14 0d0|12 5 0d0",level:0},{name_:"Blubbering Idiot",cmove:1179658,spells:0,cdefense:8240,sleep:0,mexp:0,aaf:6,ac:1,speed:1,cchar:"p",hd:"1d2",damage:"1 18 0d0",level:0},{name_:"Pitiful Looking Beggar",cmove:1179658,spells:0,cdefense:8240,sleep:400,mexp:0,aaf:10,ac:1,speed:1,cchar:"p",hd:"1d4",damage:"1 14 0d0",level:0},{name_:"Mangy Looking Leper",cmove:1179658,spells:0,cdefense:8240,sleep:500,mexp:0,aaf:10,ac:1,speed:1,cchar:"p",hd:"1d1",damage:"1 14 0d0",level:0},{name_:"Squint Eyed Rogue",cmove:118620162,spells:0,cdefense:8244,sleep:999,mexp:0,aaf:10,ac:8,speed:1,cchar:"p",hd:"2d8",damage:"1 1 1d6|13 5 0d0",level:0},{name_:"Singing, Happy Drunk",cmove:101843000,spells:0,cdefense:8240,sleep:0,mexp:0,aaf:10,ac:1,speed:1,cchar:"p",hd:"2d3",damage:"1 14 0d0",level:0},{name_:"Mean Looking Mercenary",cmove:185729034,spells:0,cdefense:8244,sleep:25000,mexp:0,aaf:10,ac:20,speed:1,cchar:"p",hd:"5d8",damage:"1 1 1d10",level:0},{name_:"Battle Scarred Veteran",cmove:185729034,spells:0,cdefense:8240,sleep:25000,mexp:0,aaf:10,ac:30,speed:1,cchar:"p",hd:"7d8",damage:"1 1 2d6",level:0},{name_:"Grey Mushroom patch",cmove:1,spells:0,cdefense:4256,sleep:0,mexp:1,aaf:2,ac:1,speed:1,cchar:",",hd:"1d2",damage:"3 13 1d4",level:1},{name_:"Giant Yellow Centipede",cmove:2,spells:0,cdefense:2,sleep:300,mexp:2,aaf:8,ac:12,speed:1,cchar:"c",hd:"2d6",damage:"1 2 1d3|1 4 1d3",level:1},{name_:"Giant White Centipede",cmove:10,spells:0,cdefense:2,sleep:400,mexp:2,aaf:7,ac:10,speed:1,cchar:"c",hd:"3d5",damage:"1 2 1d2|1 4 1d2",level:1},{name_:"White Icky-Thing",cmove:18,spells:0,cdefense:34,sleep:100,mexp:2,aaf:12,ac:7,speed:1,cchar:"i",hd:"3d5",damage:"1 5 1d2",level:1},{name_:"Clear Icky-Thing",cmove:65538,spells:0,cdefense:34,sleep:100,mexp:1,aaf:12,ac:6,speed:1,cchar:"i",hd:"2d5",damage:"1 5 1d2",level:1},{name_:"Giant White Mouse",cmove:2097162,spells:0,cdefense:8304,sleep:200,mexp:1,aaf:8,ac:4,speed:1,cchar:"r",hd:"1d3",damage:"1 2 1d2",level:1},{name_:"Large Brown Snake",cmove:10,spells:0,cdefense:176,sleep:999,mexp:3,aaf:4,ac:35,speed:0,cchar:"R",hd:"4d6",damage:"1 2 1d3|1 16 1d4",level:1},{name_:"Large White Snake",cmove:18,spells:0,cdefense:176,sleep:999,mexp:2,aaf:4,ac:30,speed:1,cchar:"R",hd:"3d6",damage:"1 2 1d1",level:1},{name_:"Kobold",cmove:117571586,spells:0,cdefense:8242,sleep:100,mexp:5,aaf:20,ac:16,speed:1,cchar:"k",hd:"3d7",damage:"1 1 1d6",level:1},{name_:"White Worm mass",cmove:2097186,spells:0,cdefense:432,sleep:1,mexp:2,aaf:6,ac:1,speed:0,cchar:"w",hd:"4d4",damage:"14 12 1d2",level:1},{name_:"Floating Eye",cmove:1,spells:65549,cdefense:8450,sleep:100,mexp:1,aaf:2,ac:6,speed:1,cchar:"e",hd:"3d6",damage:"11 7 0d0",level:1},{name_:"Shrieker Mushroom patch",cmove:1,spells:0,cdefense:4256,sleep:0,mexp:1,aaf:2,ac:1,speed:1,cchar:",",hd:"1d1",damage:"20 10 0d0",level:2},{name_:"Blubbering Icky-Thing",cmove:186122258,spells:0,cdefense:34,sleep:100,mexp:8,aaf:10,ac:4,speed:1,cchar:"i",hd:"5d8",damage:"14 12 1d4|22 12 0d0",level:2},{name_:"Metallic Green Centipedes",cmove:18,spells:0,cdefense:0,sleep:100,mexp:3,aaf:5,ac:4,speed:2,cchar:"c",hd:"4d4",damage:"1 12 1d1",level:2},{name_:"Novice Warrior",cmove:117571586,spells:0,cdefense:8240,sleep:50,mexp:6,aaf:20,ac:16,speed:1,cchar:"p",hd:"9d4",damage:"1 1 1d7",level:2},{name_:"Novice Rogue",cmove:117571586,spells:0,cdefense:8240,sleep:50,mexp:6,aaf:20,ac:12,speed:1,cchar:"p",hd:"8d4",damage:"1 1 1d6|12 5 0d0",level:2},{name_:"Novice Priest",cmove:117571586,spells:4236,cdefense:8240,sleep:100,mexp:7,aaf:20,ac:10,speed:1,cchar:"p",hd:"7d4",damage:"1 1 1d5",level:2},{name_:"Novice Mage",cmove:117571586,spells:2204,cdefense:8240,sleep:50,mexp:7,aaf:20,ac:6,speed:1,cchar:"p",hd:"6d4",damage:"1 1 1d4",level:2},{name_:"Yellow Mushroom patch",cmove:1,spells:0,cdefense:4256,sleep:0,mexp:2,aaf:2,ac:1,speed:1,cchar:",",hd:"1d1",damage:"4 13 1d6",level:2},{name_:"White Jelly",cmove:184549377,spells:0,cdefense:416,sleep:999,mexp:10,aaf:2,ac:1,speed:2,cchar:"J",hd:"8d8",damage:"14 5 1d2",level:2},{name_:"Giant Green Frog",cmove:10,spells:0,cdefense:130,sleep:300,mexp:6,aaf:14,ac:8,speed:1,cchar:"f",hd:"2d8",damage:"1 2 1d3",level:2},{name_:"Giant Black Ant",cmove:10,spells:0,cdefense:2,sleep:400,mexp:8,aaf:14,ac:20,speed:1,cchar:"a",hd:"3d6",damage:"1 2 1d4",level:2},{name_:"White Harpy",cmove:18,spells:0,cdefense:8246,sleep:100,mexp:5,aaf:16,ac:17,speed:1,cchar:"h",hd:"2d5",damage:"1 3 1d1|1 3 1d1|1 2 1d2",level:2},{name_:"Blue Yeek",cmove:117571586,spells:0,cdefense:8240,sleep:100,mexp:4,aaf:18,ac:14,speed:1,cchar:"y",hd:"2d6",damage:"1 1 1d5",level:2},{name_:"Green Worm mass",cmove:2097186,spells:0,cdefense:432,sleep:100,mexp:3,aaf:7,ac:3,speed:0,cchar:"w",hd:"6d4",damage:"9 12 1d3",level:2},{name_:"Large Black Snake",cmove:10,spells:0,cdefense:176,sleep:750,mexp:9,aaf:5,ac:38,speed:0,cchar:"R",hd:"4d8",damage:"1 2 1d4|1 16 1d6",level:2},{name_:"Poltergeist",cmove:253034554,spells:31,cdefense:4108,sleep:750,mexp:6,aaf:8,ac:15,speed:3,cchar:"G",hd:"2d5",damage:"4 1 1d1",level:3},{name_:"Metallic Blue Centipedes",cmove:18,spells:0,cdefense:0,sleep:150,mexp:7,aaf:6,ac:6,speed:2,cchar:"c",hd:"4d5",damage:"1 12 1d2",level:3},{name_:"Giant White Lice",cmove:2097186,spells:0,cdefense:496,sleep:100,mexp:1,aaf:6,ac:5,speed:2,cchar:"l",hd:"1d1",damage:"1 2 1d1",level:3},{name_:"Black Naga",cmove:118489098,spells:0,cdefense:8422,sleep:1200,mexp:20,aaf:16,ac:40,speed:1,cchar:"n",hd:"6d8",damage:"1 16 1d8",level:3},{name_:"Spotted Mushroom patch",cmove:1,spells:0,cdefense:4256,sleep:0,mexp:3,aaf:2,ac:1,speed:1,cchar:",",hd:"1d1",damage:"14 13 2d4",level:3},{name_:"Yellow Jelly",cmove:184549377,spells:65551,cdefense:416,sleep:999,mexp:12,aaf:2,ac:1,speed:2,cchar:"J",hd:"10d8",damage:"14 5 1d3",level:3},{name_:"Scruffy looking Hobbit",cmove:84017154,spells:0,cdefense:8240,sleep:100,mexp:4,aaf:16,ac:8,speed:1,cchar:"p",hd:"3d5",damage:"1 1 1d4|12 5 0d0",level:3},{name_:"Huge Brown Bat",cmove:34,spells:0,cdefense:8544,sleep:400,mexp:4,aaf:8,ac:12,speed:3,cchar:"b",hd:"2d6",damage:"1 2 1d2",level:3},{name_:"Giant White Ant",cmove:2,spells:0,cdefense:2,sleep:800,mexp:7,aaf:8,ac:16,speed:1,cchar:"a",hd:"3d6",damage:"1 2 1d4",level:3},{name_:"Yellow Mold",cmove:184549377,spells:0,cdefense:4256,sleep:999,mexp:9,aaf:2,ac:10,speed:1,cchar:"m",hd:"8d8",damage:"1 1 1d4",level:3},{name_:"Metallic Red Centipedes",cmove:10,spells:0,cdefense:0,sleep:200,mexp:12,aaf:8,ac:9,speed:2,cchar:"c",hd:"4d8",damage:"1 12 1d2",level:3},{name_:"Yellow Worm mass",cmove:2097186,spells:0,cdefense:432,sleep:100,mexp:4,aaf:7,ac:4,speed:0,cchar:"w",hd:"4d8",damage:"15 12 1d3",level:3},{name_:"Large Grey Snake",cmove:10,spells:0,cdefense:176,sleep:700,mexp:10,aaf:5,ac:40,speed:0,cchar:"R",hd:"6d8",damage:"1 2 1d4|1 16 1d6",level:3},{name_:"Radiation Eye",cmove:1,spells:65547,cdefense:8450,sleep:100,mexp:6,aaf:2,ac:6,speed:1,cchar:"e",hd:"3d6",damage:"2 7 1d6",level:3},{name_:"Drooling Harpy",cmove:18,spells:0,cdefense:8246,sleep:100,mexp:7,aaf:16,ac:22,speed:1,cchar:"h",hd:"2d8",damage:"1 3 1d1|1 3 1d1|1 2 1d2|1 18 0d0",level:3},{name_:"Silver Mouse",cmove:2097162,spells:0,cdefense:8306,sleep:100,mexp:1,aaf:8,ac:5,speed:1,cchar:"r",hd:"1d1",damage:"23 1 1d1",level:4},{name_:"Black Mushroom patch",cmove:1,spells:0,cdefense:4256,sleep:0,mexp:8,aaf:2,ac:1,speed:1,cchar:",",hd:"8d8",damage:"1 13 1d3",level:4},{name_:"Blue Jelly",cmove:184549377,spells:0,cdefense:416,sleep:999,mexp:14,aaf:2,ac:1,speed:1,cchar:"J",hd:"12d8",damage:"7 5 1d6",level:4},{name_:"Creeping Copper Coins",cmove:2,spells:0,cdefense:2,sleep:100,mexp:9,aaf:3,ac:24,speed:0,cchar:"$",hd:"7d8",damage:"1 2 1d4|14 8 2d4",level:4},{name_:"Giant White Rat",cmove:2097162,spells:0,cdefense:8304,sleep:300,mexp:1,aaf:8,ac:7,speed:1,cchar:"r",hd:"2d2",damage:"14 2 1d3",level:4},{name_:"Giant Black Centipede",cmove:34,spells:0,cdefense:2,sleep:300,mexp:11,aaf:8,ac:20,speed:1,cchar:"c",hd:"5d8",damage:"1 2 1d2|1 4 1d2",level:4},{name_:"Giant Blue Centipede",cmove:2,spells:0,cdefense:2,sleep:500,mexp:10,aaf:8,ac:20,speed:1,cchar:"c",hd:"4d8",damage:"1 2 1d3|1 4 1d4",level:4},{name_:"Blue Worm mass",cmove:2097186,spells:0,cdefense:432,sleep:100,mexp:5,aaf:7,ac:12,speed:0,cchar:"w",hd:"5d8",damage:"7 12 1d4",level:4},{name_:"Large Grey Snake",cmove:10,spells:0,cdefense:176,sleep:500,mexp:14,aaf:6,ac:41,speed:0,cchar:"R",hd:"6d8",damage:"1 2 1d5|1 16 1d8",level:4},{name_:"Jackal",cmove:18,spells:0,cdefense:8240,sleep:300,mexp:8,aaf:12,ac:16,speed:1,cchar:"j",hd:"3d8",damage:"1 2 1d6",level:4},{name_:"Green Naga",cmove:118489098,spells:0,cdefense:8294,sleep:1200,mexp:30,aaf:20,ac:40,speed:1,cchar:"n",hd:"9d8",damage:"1 16 1d8|6 9 2d6",level:5},{name_:"Green Glutton Ghost",cmove:253034546,spells:63,cdefense:4108,sleep:100,mexp:15,aaf:10,ac:20,speed:3,cchar:"G",hd:"3d6",damage:"22 15 1d1",level:5},{name_:"White Mushroom patch",cmove:1,spells:0,cdefense:4256,sleep:0,mexp:5,aaf:2,ac:1,speed:1,cchar:",",hd:"1d1",damage:"11 13 2d4",level:5},{name_:"Green Jelly",cmove:184549377,spells:0,cdefense:416,sleep:999,mexp:18,aaf:2,ac:1,speed:2,cchar:"J",hd:"22d8",damage:"9 5 1d2",level:5},{name_:"Skeleton Kobold",cmove:131074,spells:0,cdefense:12,sleep:400,mexp:12,aaf:20,ac:26,speed:1,cchar:"s",hd:"5d8",damage:"1 1 1d6",level:5},{name_:"Silver Jelly",cmove:184549377,spells:0,cdefense:176,sleep:1,mexp:15,aaf:2,ac:25,speed:1,cchar:"J",hd:"20d8",damage:"23 5 1d3",level:5},{name_:"Giant Black Frog",cmove:10,spells:0,cdefense:162,sleep:400,mexp:12,aaf:12,ac:18,speed:1,cchar:"f",hd:"4d8",damage:"1 2 1d6",level:5},{name_:"Grey Icky-Thing",cmove:18,spells:0,cdefense:34,sleep:150,mexp:10,aaf:14,ac:12,speed:1,cchar:"i",hd:"4d8",damage:"1 5 1d5",level:5},{name_:"Disenchanter Eye",cmove:9,spells:65545,cdefense:8450,sleep:100,mexp:20,aaf:4,ac:10,speed:0,cchar:"e",hd:"7d8",damage:"21 7 0d0",level:5},{name_:"Black Yeek",cmove:117571586,spells:0,cdefense:8240,sleep:100,mexp:8,aaf:18,ac:16,speed:1,cchar:"y",hd:"2d8",damage:"1 1 1d5",level:5},{name_:"Red Worm mass",cmove:2097186,spells:0,cdefense:8624,sleep:100,mexp:6,aaf:7,ac:12,speed:0,cchar:"w",hd:"5d8",damage:"5 12 1d6",level:5},{name_:"Giant House Fly",cmove:34,spells:0,cdefense:98,sleep:200,mexp:10,aaf:12,ac:16,speed:3,cchar:"F",hd:"3d8",damage:"1 2 1d2",level:5},{name_:"Copperhead Snake",cmove:18,spells:0,cdefense:176,sleep:1,mexp:15,aaf:6,ac:20,speed:1,cchar:"R",hd:"4d6",damage:"14 2 2d4",level:5},{name_:"Rot Jelly",cmove:184549377,spells:0,cdefense:176,sleep:1,mexp:15,aaf:2,ac:30,speed:1,cchar:"J",hd:"20d8",damage:"22 5 2d3",level:5},{name_:"Purple Mushroom patch",cmove:1,spells:0,cdefense:4256,sleep:0,mexp:12,aaf:2,ac:1,speed:2,cchar:",",hd:"1d1",damage:"16 13 1d2",level:6},{name_:"Brown Mold",cmove:184549377,spells:0,cdefense:4256,sleep:999,mexp:20,aaf:2,ac:12,speed:1,cchar:"m",hd:"15d8",damage:"3 1 1d4",level:6},{name_:"Giant Brown Bat",cmove:26,spells:0,cdefense:8544,sleep:300,mexp:10,aaf:10,ac:15,speed:3,cchar:"b",hd:"3d8",damage:"1 2 1d3",level:6},{name_:"Creeping Silver Coins",cmove:2,spells:0,cdefense:2,sleep:100,mexp:18,aaf:4,ac:30,speed:0,cchar:"$",hd:"12d8",damage:"1 2 1d6|14 8 2d6",level:6},{name_:"Orc",cmove:184680450,spells:0,cdefense:8246,sleep:300,mexp:16,aaf:20,ac:32,speed:1,cchar:"o",hd:"9d8",damage:"1 1 1d8",level:6},{name_:"Grey Harpy",cmove:18,spells:0,cdefense:8246,sleep:100,mexp:14,aaf:16,ac:20,speed:2,cchar:"h",hd:"3d8",damage:"1 3 1d2|1 3 1d2|1 2 1d2",level:6},{name_:"Blue Icky-Thing",cmove:18,spells:0,cdefense:34,sleep:200,mexp:12,aaf:18,ac:14,speed:1,cchar:"i",hd:"4d8",damage:"7 5 2d3",level:6},{name_:"Rattlesnake",cmove:18,spells:0,cdefense:176,sleep:1,mexp:20,aaf:6,ac:24,speed:1,cchar:"R",hd:"6d7",damage:"14 2 2d5",level:6},{name_:"Bloodshot Eye",cmove:1,spells:65543,cdefense:8450,sleep:100,mexp:15,aaf:2,ac:6,speed:1,cchar:"e",hd:"4d8",damage:"10 7 2d6",level:7},{name_:"Red Naga",cmove:118489098,spells:0,cdefense:8422,sleep:1200,mexp:40,aaf:20,ac:40,speed:1,cchar:"n",hd:"11d8",damage:"1 16 1d10|2 2 1d4",level:7},{name_:"Red Jelly",cmove:184549377,spells:0,cdefense:416,sleep:999,mexp:26,aaf:2,ac:1,speed:1,cchar:"J",hd:"26d8",damage:"2 5 1d5",level:7},{name_:"Giant Red Frog",cmove:10,spells:0,cdefense:162,sleep:500,mexp:16,aaf:12,ac:16,speed:1,cchar:"f",hd:"5d8",damage:"2 2 2d4",level:7},{name_:"Green Icky-Thing",cmove:18,spells:0,cdefense:34,sleep:200,mexp:18,aaf:14,ac:12,speed:1,cchar:"i",hd:"5d8",damage:"9 5 2d5",level:7},{name_:"Zombie Kobold",cmove:131074,spells:0,cdefense:46,sleep:300,mexp:14,aaf:20,ac:14,speed:1,cchar:"z",hd:"6d8",damage:"1 1 1d2|1 1 1d2",level:7},{name_:"Lost Soul",cmove:1376282,spells:65583,cdefense:4108,sleep:100,mexp:18,aaf:4,ac:10,speed:1,cchar:"G",hd:"2d8",damage:"1 1 2d2|18 5 0d0",level:7},{name_:"Greedy little Gnome",cmove:184680450,spells:0,cdefense:8240,sleep:100,mexp:13,aaf:18,ac:14,speed:1,cchar:"p",hd:"3d8",damage:"1 1 1d7|13 5 0d0",level:7},{name_:"Giant Green Fly",cmove:34,spells:0,cdefense:98,sleep:500,mexp:15,aaf:12,ac:14,speed:2,cchar:"F",hd:"3d8",damage:"1 2 1d4",level:7},{name_:"Brown Yeek",cmove:117571586,spells:0,cdefense:8240,sleep:100,mexp:11,aaf:18,ac:18,speed:1,cchar:"y",hd:"3d8",damage:"1 1 1d6",level:8},{name_:"Green Mold",cmove:184549377,spells:0,cdefense:4256,sleep:750,mexp:28,aaf:2,ac:14,speed:1,cchar:"m",hd:"21d8",damage:"4 1 1d4",level:8},{name_:"Skeleton Orc",cmove:131074,spells:0,cdefense:4108,sleep:400,mexp:26,aaf:20,ac:36,speed:1,cchar:"s",hd:"10d8",damage:"1 1 2d5",level:8},{name_:"Seedy looking Human",cmove:318898178,spells:0,cdefense:8244,sleep:200,mexp:22,aaf:20,ac:26,speed:1,cchar:"p",hd:"8d8",damage:"1 1 3d4",level:8},{name_:"Red Icky-Thing",cmove:18,spells:0,cdefense:34,sleep:200,mexp:22,aaf:14,ac:18,speed:2,cchar:"i",hd:"4d8",damage:"1 5 1d3|6 8 1d5",level:8},{name_:"Bandit",cmove:318898178,spells:0,cdefense:8240,sleep:999,mexp:26,aaf:20,ac:24,speed:1,cchar:"p",hd:"8d8",damage:"1 1 2d4|12 5 0d0",level:8},{name_:"Yeti",cmove:131074,spells:0,cdefense:8228,sleep:100,mexp:30,aaf:20,ac:24,speed:1,cchar:"Y",hd:"11d8",damage:"1 3 1d3|1 3 1d3|1 2 1d4",level:9},{name_:"Bloodshot Icky-Thing",cmove:10,spells:65547,cdefense:8226,sleep:800,mexp:24,aaf:14,ac:18,speed:1,cchar:"i",hd:"7d8",damage:"1 5 1d4|9 8 2d4",level:9},{name_:"Giant Grey Rat",cmove:2097162,spells:0,cdefense:8304,sleep:200,mexp:2,aaf:10,ac:12,speed:1,cchar:"r",hd:"2d3",damage:"14 2 1d4",level:9},{name_:"Black Harpy",cmove:10,spells:0,cdefense:8246,sleep:100,mexp:19,aaf:16,ac:22,speed:2,cchar:"h",hd:"3d8",damage:"1 3 1d2|1 3 1d2|1 2 1d3",level:9},{name_:"Giant Black Bat",cmove:18,spells:0,cdefense:8288,sleep:250,mexp:16,aaf:12,ac:18,speed:3,cchar:"b",hd:"2d8",damage:"1 2 1d6",level:9},{name_:"Clear Yeek",cmove:117637122,spells:0,cdefense:48,sleep:100,mexp:14,aaf:18,ac:24,speed:1,cchar:"y",hd:"3d6",damage:"1 1 1d5",level:9},{name_:"Orc Shaman",cmove:184680450,spells:32901,cdefense:8246,sleep:200,mexp:30,aaf:20,ac:15,speed:1,cchar:"o",hd:"7d8",damage:"1 1 1d6",level:9},{name_:"Giant Red Ant",cmove:2,spells:0,cdefense:2,sleep:600,mexp:22,aaf:12,ac:34,speed:1,cchar:"a",hd:"4d8",damage:"1 2 1d4|2 4 1d4",level:9},{name_:"King Cobra",cmove:18,spells:0,cdefense:176,sleep:1,mexp:28,aaf:8,ac:30,speed:1,cchar:"R",hd:"8d8",damage:"10 9 1d2|14 2 3d4",level:9},{name_:"Clear Mushroom patch",cmove:2162689,spells:0,cdefense:160,sleep:0,mexp:1,aaf:4,ac:1,speed:2,cchar:",",hd:"1d1",damage:"1 13 1d1",level:10},{name_:"Giant White Tick",cmove:10,spells:0,cdefense:34,sleep:200,mexp:27,aaf:12,ac:40,speed:0,cchar:"t",hd:"15d8",damage:"14 2 2d6",level:10},{name_:"Hairy Mold",cmove:184549377,spells:0,cdefense:4256,sleep:700,mexp:32,aaf:2,ac:15,speed:1,cchar:"m",hd:"15d8",damage:"14 1 1d3",level:10},{name_:"Disenchanter Mold",cmove:184549377,spells:65547,cdefense:4256,sleep:100,mexp:40,aaf:2,ac:20,speed:1,cchar:"m",hd:"16d8",damage:"21 5 1d6",level:10},{name_:"Giant Red Centipede",cmove:2,spells:0,cdefense:130,sleep:500,mexp:24,aaf:12,ac:26,speed:2,cchar:"c",hd:"3d8",damage:"1 2 1d2|14 4 1d2",level:10},{name_:"Creeping Gold Coins",cmove:2,spells:0,cdefense:2,sleep:100,mexp:32,aaf:5,ac:36,speed:0,cchar:"$",hd:"18d8",damage:"1 2 2d5|14 8 3d5",level:10},{name_:"Giant Fruit Fly",cmove:2097186,spells:0,cdefense:98,sleep:500,mexp:4,aaf:8,ac:14,speed:2,cchar:"F",hd:"2d2",damage:"1 2 1d2",level:10},{name_:"Brigand",cmove:318898178,spells:0,cdefense:8240,sleep:100,mexp:35,aaf:20,ac:32,speed:1,cchar:"p",hd:"9d8",damage:"1 1 2d4|13 5 0d0",level:10},{name_:"Orc Zombie",cmove:131074,spells:0,cdefense:4142,sleep:250,mexp:30,aaf:20,ac:24,speed:1,cchar:"z",hd:"11d8",damage:"1 1 1d4|1 1 1d4",level:11},{name_:"Orc Warrior",cmove:251789314,spells:0,cdefense:8246,sleep:250,mexp:34,aaf:20,ac:36,speed:1,cchar:"o",hd:"11d8",damage:"1 1 2d6",level:11},{name_:"Vorpal Bunny",cmove:2097162,spells:0,cdefense:8304,sleep:300,mexp:2,aaf:8,ac:10,speed:2,cchar:"r",hd:"2d3",damage:"1 2 1d5",level:11},{name_:"Nasty little Gnome",cmove:184680450,spells:8373,cdefense:8240,sleep:10,mexp:32,aaf:18,ac:10,speed:1,cchar:"p",hd:"4d8",damage:"1 1 1d5",level:11},{name_:"Hobgoblin",cmove:251789314,spells:0,cdefense:8246,sleep:300,mexp:38,aaf:20,ac:38,speed:1,cchar:"H",hd:"12d8",damage:"1 1 1d10",level:11},{name_:"Black Mamba",cmove:18,spells:0,cdefense:176,sleep:1,mexp:40,aaf:20,ac:32,speed:2,cchar:"R",hd:"10d8",damage:"14 2 4d4",level:12},{name_:"Grape Jelly",cmove:184549377,spells:65547,cdefense:416,sleep:999,mexp:60,aaf:2,ac:1,speed:1,cchar:"J",hd:"52d8",damage:"19 5 5d8",level:12},{name_:"Master Yeek",cmove:117571586,spells:32792,cdefense:8240,sleep:100,mexp:28,aaf:18,ac:24,speed:1,cchar:"y",hd:"5d8",damage:"1 1 1d8",level:12},{name_:"Priest",cmove:318898178,spells:645,cdefense:8240,sleep:400,mexp:36,aaf:20,ac:22,speed:1,cchar:"p",hd:"7d8",damage:"1 1 2d3",level:12},{name_:"Giant Clear Ant",cmove:65538,spells:0,cdefense:258,sleep:600,mexp:24,aaf:12,ac:18,speed:1,cchar:"a",hd:"3d7",damage:"1 2 1d4",level:12},{name_:"Air Spirit",cmove:196642,spells:0,cdefense:16,sleep:200,mexp:40,aaf:12,ac:20,speed:3,cchar:"E",hd:"5d8",damage:"1 1 1d3",level:12},{name_:"Skeleton Human",cmove:131074,spells:0,cdefense:4108,sleep:300,mexp:38,aaf:20,ac:30,speed:1,cchar:"s",hd:"12d8",damage:"1 1 1d8",level:12},{name_:"Human Zombie",cmove:131074,spells:0,cdefense:4142,sleep:200,mexp:34,aaf:20,ac:24,speed:1,cchar:"z",hd:"11d8",damage:"1 1 1d4|1 1 1d4",level:12},{name_:"Moaning Spirit",cmove:253034506,spells:65582,cdefense:4108,sleep:300,mexp:44,aaf:6,ac:20,speed:1,cchar:"G",hd:"4d8",damage:"4 10 0d0|15 5 1d8",level:12},{name_:"Swordsman",cmove:318898178,spells:0,cdefense:8240,sleep:999,mexp:40,aaf:20,ac:34,speed:1,cchar:"p",hd:"11d8",damage:"1 1 3d5",level:12},{name_:"Killer Brown Beetle",cmove:10,spells:0,cdefense:2,sleep:300,mexp:38,aaf:10,ac:40,speed:1,cchar:"K",hd:"13d8",damage:"1 2 3d4",level:13},{name_:"Ogre",cmove:117571586,spells:0,cdefense:8246,sleep:300,mexp:42,aaf:20,ac:32,speed:1,cchar:"o",hd:"13d8",damage:"1 1 2d8",level:13},{name_:"Giant Red Speckled Frog",cmove:10,spells:0,cdefense:162,sleep:300,mexp:32,aaf:12,ac:20,speed:1,cchar:"f",hd:"6d8",damage:"1 2 3d4",level:13},{name_:"Magic User",cmove:318898178,spells:9235,cdefense:8240,sleep:100,mexp:35,aaf:20,ac:10,speed:1,cchar:"p",hd:"7d8",damage:"1 1 2d2",level:13},{name_:"Black Orc",cmove:184680450,spells:0,cdefense:8246,sleep:200,mexp:40,aaf:20,ac:36,speed:1,cchar:"o",hd:"12d8",damage:"1 1 3d4",level:13},{name_:"Giant Long-Eared Bat",cmove:26,spells:0,cdefense:8544,sleep:200,mexp:20,aaf:12,ac:20,speed:3,cchar:"b",hd:"5d8",damage:"1 2 1d4|1 3 1d2|1 3 1d2",level:13},{name_:"Giant Gnat",cmove:2097186,spells:0,cdefense:98,sleep:100,mexp:1,aaf:8,ac:4,speed:3,cchar:"F",hd:"1d2",damage:"1 2 1d1",level:13},{name_:"Killer Green Beetle",cmove:18,spells:0,cdefense:2,sleep:300,mexp:46,aaf:12,ac:45,speed:1,cchar:"K",hd:"16d8",damage:"1 2 4d4",level:14},{name_:"Giant Flea",cmove:2097186,spells:0,cdefense:98,sleep:100,mexp:1,aaf:8,ac:25,speed:2,cchar:"F",hd:"2d2",damage:"1 2 1d2",level:14},{name_:"Giant White Dragon Fly",cmove:18,spells:4194314,cdefense:96,sleep:500,mexp:54,aaf:20,ac:20,speed:1,cchar:"F",hd:"5d8",damage:"7 2 1d6",level:14},{name_:"Hill Giant",cmove:117571586,spells:0,cdefense:8244,sleep:500,mexp:52,aaf:20,ac:36,speed:1,cchar:"P",hd:"16d8",damage:"1 1 3d6",level:14},{name_:"Skeleton Hobgoblin",cmove:131074,spells:0,cdefense:4108,sleep:300,mexp:46,aaf:20,ac:34,speed:1,cchar:"s",hd:"13d8",damage:"1 1 2d5",level:14},{name_:"Flesh Golem",cmove:131074,spells:0,cdefense:4528,sleep:100,mexp:48,aaf:12,ac:10,speed:1,cchar:"g",hd:"12d8",damage:"1 1 1d6|1 1 1d6",level:14},{name_:"White Dragon Bat",cmove:18,spells:4194308,cdefense:8528,sleep:500,mexp:40,aaf:12,ac:20,speed:3,cchar:"b",hd:"2d6",damage:"7 2 1d3",level:14},{name_:"Giant Black Lice",cmove:2097170,spells:0,cdefense:498,sleep:100,mexp:1,aaf:6,ac:7,speed:2,cchar:"l",hd:"1d1",damage:"1 2 1d2",level:14},{name_:"Guardian Naga",cmove:386924554,spells:0,cdefense:8422,sleep:1200,mexp:60,aaf:20,ac:50,speed:1,cchar:"n",hd:"24d8",damage:"1 16 2d8|1 2 1d8",level:15},{name_:"Giant Grey Bat",cmove:18,spells:0,cdefense:8544,sleep:150,mexp:22,aaf:12,ac:22,speed:3,cchar:"b",hd:"4d8",damage:"1 2 1d6|1 3 1d2|1 3 1d2",level:15},{name_:"Giant Clear Centipede",cmove:65538,spells:0,cdefense:2,sleep:300,mexp:30,aaf:10,ac:30,speed:1,cchar:"c",hd:"5d8",damage:"1 2 2d4|1 4 2d4",level:15},{name_:"Giant Yellow Tick",cmove:10,spells:0,cdefense:34,sleep:200,mexp:48,aaf:12,ac:48,speed:0,cchar:"t",hd:"20d8",damage:"14 2 3d9",level:15},{name_:"Giant Ebony Ant",cmove:2097154,spells:0,cdefense:2,sleep:600,mexp:3,aaf:12,ac:24,speed:1,cchar:"a",hd:"3d4",damage:"1 2 2d3",level:15},{name_:"Frost Giant",cmove:117571586,spells:0,cdefense:36,sleep:500,mexp:54,aaf:20,ac:38,speed:1,cchar:"P",hd:"17d8",damage:"7 1 3d6",level:15},{name_:"Clay Golem",cmove:131074,spells:0,cdefense:4608,sleep:100,mexp:50,aaf:12,ac:20,speed:1,cchar:"g",hd:"14d8",damage:"1 1 1d8|1 1 1d8",level:15},{name_:"Huge White Bat",cmove:2097170,spells:0,cdefense:8544,sleep:400,mexp:3,aaf:7,ac:12,speed:2,cchar:"b",hd:"3d8",damage:"1 2 1d6",level:15},{name_:"Giant Tan Bat",cmove:18,spells:0,cdefense:8544,sleep:400,mexp:18,aaf:12,ac:18,speed:2,cchar:"b",hd:"3d8",damage:"4 2 1d2|1 3 1d1|1 3 1d1",level:15},{name_:"Violet Mold",cmove:184549377,spells:65545,cdefense:4256,sleep:700,mexp:50,aaf:2,ac:15,speed:1,cchar:"m",hd:"17d8",damage:"11 1 1d2",level:15},{name_:"Umber Hulk",cmove:131074,spells:0,cdefense:8486,sleep:100,mexp:75,aaf:20,ac:20,speed:1,cchar:"U",hd:"20d8",damage:"3 7 0d0|1 1 1d6|1 1 1d6|1 2 2d6",level:16},{name_:"Gelatinous Cube",cmove:790102026,spells:0,cdefense:162,sleep:1,mexp:36,aaf:12,ac:18,speed:0,cchar:"C",hd:"45d8",damage:"6 5 1d10",level:16},{name_:"Giant Black Rat",cmove:2097162,spells:0,cdefense:8304,sleep:200,mexp:3,aaf:8,ac:16,speed:1,cchar:"r",hd:"3d4",damage:"14 2 1d5",level:16},{name_:"Giant Green Dragon Fly",cmove:18,spells:1048586,cdefense:112,sleep:500,mexp:58,aaf:20,ac:20,speed:1,cchar:"F",hd:"5d8",damage:"14 2 1d6",level:16},{name_:"Fire Giant",cmove:117571586,spells:0,cdefense:8212,sleep:500,mexp:62,aaf:20,ac:40,speed:1,cchar:"P",hd:"20d8",damage:"5 1 3d7",level:16},{name_:"Green Dragon Bat",cmove:18,spells:1048580,cdefense:8528,sleep:500,mexp:44,aaf:12,ac:22,speed:3,cchar:"b",hd:"2d7",damage:"14 2 1d3",level:16},{name_:"Quasit",cmove:285409290,spells:4346,cdefense:4,sleep:200,mexp:48,aaf:20,ac:30,speed:1,cchar:"q",hd:"5d8",damage:"15 2 1d6|1 3 1d3|1 3 1d3",level:16},{name_:"Troll",cmove:117571586,spells:0,cdefense:8230,sleep:400,mexp:64,aaf:20,ac:40,speed:1,cchar:"T",hd:"17d8",damage:"1 1 1d4|1 1 1d4|1 2 1d6",level:17},{name_:"Water Spirit",cmove:10,spells:0,cdefense:32,sleep:400,mexp:58,aaf:12,ac:28,speed:2,cchar:"E",hd:"8d8",damage:"1 1 2d4",level:17},{name_:"Giant Brown Scorpion",cmove:10,spells:0,cdefense:2,sleep:200,mexp:62,aaf:14,ac:44,speed:1,cchar:"S",hd:"11d8",damage:"1 2 2d4|2 4 1d7",level:17},{name_:"Earth Spirit",cmove:10,spells:0,cdefense:512,sleep:500,mexp:64,aaf:10,ac:40,speed:1,cchar:"E",hd:"13d8",damage:"1 1 1d8|1 1 1d8",level:17},{name_:"Fire Spirit",cmove:2,spells:0,cdefense:8208,sleep:200,mexp:66,aaf:20,ac:30,speed:2,cchar:"E",hd:"10d8",damage:"5 1 2d6",level:18},{name_:"Urik-Hai Orc",cmove:184680450,spells:0,cdefense:8246,sleep:200,mexp:68,aaf:20,ac:42,speed:1,cchar:"o",hd:"14d8",damage:"1 1 3d5",level:18},{name_:"Stone Giant",cmove:117571586,spells:0,cdefense:8708,sleep:500,mexp:80,aaf:20,ac:40,speed:1,cchar:"P",hd:"22d8",damage:"1 1 3d8",level:18},{name_:"Stone Golem",cmove:131074,spells:0,cdefense:4608,sleep:100,mexp:100,aaf:12,ac:75,speed:0,cchar:"g",hd:"28d8",damage:"1 1 1d10|1 1 1d10",level:19},{name_:"Grey Ooze",cmove:119144482,spells:0,cdefense:162,sleep:1,mexp:40,aaf:15,ac:10,speed:1,cchar:"O",hd:"6d8",damage:"7 5 2d6",level:19},{name_:"Disenchanter Ooze",cmove:119144482,spells:0,cdefense:162,sleep:1,mexp:50,aaf:15,ac:15,speed:1,cchar:"O",hd:"6d8",damage:"21 5 0d0",level:19},{name_:"Giant Spotted Rat",cmove:2097162,spells:0,cdefense:8304,sleep:200,mexp:3,aaf:8,ac:20,speed:1,cchar:"r",hd:"4d3",damage:"14 2 1d5",level:19},{name_:"Mummified Kobold",cmove:184680450,spells:0,cdefense:4140,sleep:750,mexp:46,aaf:20,ac:24,speed:1,cchar:"M",hd:"13d8",damage:"1 1 1d6|1 1 1d6",level:19},{name_:"Killer Black Beetle",cmove:10,spells:0,cdefense:2,sleep:300,mexp:75,aaf:14,ac:46,speed:1,cchar:"K",hd:"18d8",damage:"1 2 4d5",level:19},{name_:"Red Mold",cmove:184549377,spells:0,cdefense:12448,sleep:700,mexp:64,aaf:2,ac:16,speed:1,cchar:"m",hd:"17d8",damage:"5 5 4d4",level:19},{name_:"Quythulg",cmove:65536,spells:8208,cdefense:20480,sleep:0,mexp:200,aaf:10,ac:1,speed:1,cchar:"Q",hd:"4d8",damage:"0 0 0d0",level:20},{name_:"Giant Red Bat",cmove:10,spells:0,cdefense:8288,sleep:200,mexp:40,aaf:12,ac:24,speed:2,cchar:"b",hd:"5d8",damage:"1 2 1d7|1 3 1d3|1 3 1d3",level:20},{name_:"Giant Black Dragon Fly",cmove:18,spells:2097161,cdefense:114,sleep:500,mexp:58,aaf:20,ac:22,speed:1,cchar:"F",hd:"4d8",damage:"10 2 1d6",level:20},{name_:"Cloud Giant",cmove:117571586,spells:0,cdefense:8500,sleep:500,mexp:125,aaf:20,ac:44,speed:1,cchar:"P",hd:"24d8",damage:"8 1 3d8",level:20},{name_:"Black Dragon Bat",cmove:18,spells:2097156,cdefense:8528,sleep:500,mexp:50,aaf:12,ac:24,speed:3,cchar:"b",hd:"2d8",damage:"6 2 1d3",level:21},{name_:"Blue Dragon Bat",cmove:18,spells:524292,cdefense:8528,sleep:500,mexp:54,aaf:12,ac:26,speed:3,cchar:"b",hd:"3d6",damage:"8 2 1d3",level:21},{name_:"Mummified Orc",cmove:184680450,spells:0,cdefense:4140,sleep:750,mexp:56,aaf:20,ac:28,speed:1,cchar:"M",hd:"14d8",damage:"1 1 2d4|1 1 2d4",level:21},{name_:"Killer Boring Beetle",cmove:2,spells:0,cdefense:2,sleep:300,mexp:70,aaf:12,ac:48,speed:1,cchar:"K",hd:"18d8",damage:"1 2 4d5",level:21},{name_:"Killer Stag Beetle",cmove:10,spells:0,cdefense:2,sleep:300,mexp:80,aaf:12,ac:50,speed:1,cchar:"K",hd:"20d8",damage:"1 2 3d4|1 1 1d12",level:22},{name_:"Black Mold",cmove:184549505,spells:0,cdefense:4256,sleep:500,mexp:68,aaf:2,ac:18,speed:1,cchar:"m",hd:"15d8",damage:"1 1 4d3",level:22},{name_:"Iron Golem",cmove:131074,spells:0,cdefense:4224,sleep:100,mexp:160,aaf:12,ac:99,speed:(-1),cchar:"g",hd:"80d8",damage:"1 1 1d12|1 1 1d12",level:22},{name_:"Giant Yellow Scorpion",cmove:10,spells:0,cdefense:2,sleep:200,mexp:60,aaf:12,ac:38,speed:1,cchar:"S",hd:"12d8",damage:"1 2 1d8|14 4 2d5",level:22},{name_:"Green Ooze",cmove:2097153,spells:0,cdefense:178,sleep:1,mexp:6,aaf:15,ac:5,speed:0,cchar:"O",hd:"4d8",damage:"6 5 2d3",level:22},{name_:"Black Ooze",cmove:3801106,spells:65547,cdefense:402,sleep:1,mexp:7,aaf:10,ac:6,speed:(-1),cchar:"O",hd:"6d8",damage:"9 5 2d6",level:23},{name_:"Warrior",cmove:319946754,spells:0,cdefense:8240,sleep:400,mexp:60,aaf:20,ac:40,speed:1,cchar:"p",hd:"15d8",damage:"1 1 3d5",level:23},{name_:"Red Dragon Bat",cmove:18,spells:8388612,cdefense:8528,sleep:500,mexp:60,aaf:12,ac:28,speed:3,cchar:"b",hd:"3d8",damage:"5 2 1d3",level:23},{name_:"Killer Blue Beetle",cmove:10,spells:0,cdefense:2,sleep:300,mexp:85,aaf:15,ac:50,speed:1,cchar:"K",hd:"20d8",damage:"1 2 4d5",level:23},{name_:"Giant Silver Ant",cmove:10,spells:0,cdefense:2,sleep:600,mexp:45,aaf:15,ac:38,speed:1,cchar:"a",hd:"6d8",damage:"6 2 4d4",level:23},{name_:"Crimson Mold",cmove:184549377,spells:0,cdefense:4256,sleep:500,mexp:65,aaf:2,ac:18,speed:1,cchar:"m",hd:"16d8",damage:"1 1 1d3|4 5 0d0",level:23},{name_:"Forest Wight",cmove:251658250,spells:4111,cdefense:4398,sleep:300,mexp:140,aaf:20,ac:30,speed:1,cchar:"W",hd:"12d8",damage:"1 1 1d6|1 1 1d6|19 5 12d8",level:24},{name_:"Berzerker",cmove:117571586,spells:0,cdefense:8240,sleep:100,mexp:65,aaf:20,ac:20,speed:1,cchar:"p",hd:"15d8",damage:"1 1 1d8|1 1 1d8",level:24},{name_:"Mummified Human",cmove:184680450,spells:0,cdefense:4140,sleep:600,mexp:70,aaf:20,ac:34,speed:1,cchar:"M",hd:"17d8",damage:"1 1 2d4|1 1 2d4",level:24},{name_:"Banshee",cmove:253034522,spells:65583,cdefense:4108,sleep:100,mexp:60,aaf:20,ac:24,speed:2,cchar:"G",hd:"6d8",damage:"4 10 0d0|19 5 14d8",level:24},{name_:"Giant Troll",cmove:251789314,spells:0,cdefense:8230,sleep:500,mexp:85,aaf:20,ac:40,speed:1,cchar:"T",hd:"19d8",damage:"1 1 1d6|1 1 1d6|1 2 3d4",level:25},{name_:"Giant Brown Tick",cmove:18,spells:0,cdefense:34,sleep:200,mexp:70,aaf:12,ac:50,speed:0,cchar:"t",hd:"18d8",damage:"14 2 1d10|10 4 1d1",level:25},{name_:"Killer Red Beetle",cmove:18,spells:0,cdefense:2,sleep:300,mexp:85,aaf:15,ac:50,speed:1,cchar:"K",hd:"20d8",damage:"2 2 4d4",level:25},{name_:"Wooden Mold",cmove:1,spells:0,cdefense:4256,sleep:999,mexp:100,aaf:2,ac:50,speed:1,cchar:"m",hd:"25d8",damage:"14 8 2d6",level:25},{name_:"Giant Blue Dragon Fly",cmove:18,spells:524297,cdefense:48,sleep:500,mexp:75,aaf:20,ac:24,speed:1,cchar:"F",hd:"6d8",damage:"1 2 1d6",level:25},{name_:"Giant Grey Ant Lion",cmove:524298,spells:0,cdefense:50,sleep:400,mexp:90,aaf:10,ac:40,speed:1,cchar:"A",hd:"19d8",damage:"1 2 2d12",level:26},{name_:"Disenchanter Bat",cmove:18,spells:0,cdefense:8288,sleep:1,mexp:75,aaf:14,ac:24,speed:3,cchar:"b",hd:"4d8",damage:"21 1 0d0",level:26},{name_:"Giant Fire Tick",cmove:10,spells:0,cdefense:8210,sleep:200,mexp:90,aaf:14,ac:54,speed:1,cchar:"t",hd:"16d8",damage:"5 9 3d7",level:26},{name_:"White Wraith",cmove:251789322,spells:0,cdefense:4398,sleep:100,mexp:165,aaf:20,ac:40,speed:1,cchar:"W",hd:"15d8",damage:"1 1 1d6|1 1 1d6|19 5 15d8",level:26},{name_:"Giant Black Scorpion",cmove:2,spells:0,cdefense:2,sleep:200,mexp:85,aaf:12,ac:50,speed:1,cchar:"S",hd:"13d8",damage:"1 2 1d10|14 4 2d5",level:26},{name_:"Clear Ooze",cmove:720906,spells:0,cdefense:178,sleep:1,mexp:12,aaf:10,ac:14,speed:1,cchar:"O",hd:"4d8",damage:"3 5 1d8",level:26},{name_:"Killer Fire Beetle",cmove:18,spells:0,cdefense:8210,sleep:300,mexp:95,aaf:14,ac:45,speed:1,cchar:"K",hd:"13d8",damage:"1 2 3d4|5 9 4d5",level:27},{name_:"Vampire",cmove:385875970,spells:4617,cdefense:4398,sleep:100,mexp:175,aaf:20,ac:45,speed:1,cchar:"V",hd:"20d8",damage:"1 1 1d6|1 1 1d6|19 5 18d8",level:27},{name_:"Giant Red Dragon Fly",cmove:18,spells:8388616,cdefense:8272,sleep:500,mexp:75,aaf:20,ac:24,speed:1,cchar:"F",hd:"7d8",damage:"4 2 1d6",level:27},{name_:"Shimmering Mold",cmove:184549505,spells:0,cdefense:4256,sleep:100,mexp:180,aaf:2,ac:24,speed:1,cchar:"m",hd:"32d8",damage:"8 5 5d4",level:27},{name_:"Black Knight",cmove:386007042,spells:271,cdefense:8240,sleep:100,mexp:140,aaf:20,ac:60,speed:1,cchar:"p",hd:"25d8",damage:"1 1 5d5",level:28},{name_:"Mage",cmove:318898178,spells:11379,cdefense:8240,sleep:100,mexp:150,aaf:20,ac:30,speed:1,cchar:"p",hd:"10d8",damage:"1 1 2d5",level:28},{name_:"Ice Troll",cmove:251789314,spells:0,cdefense:38,sleep:500,mexp:160,aaf:20,ac:46,speed:1,cchar:"T",hd:"22d8",damage:"1 1 1d5|1 1 1d5|7 2 3d6",level:28},{name_:"Giant Purple Worm",cmove:10,spells:0,cdefense:8240,sleep:300,mexp:400,aaf:14,ac:65,speed:1,cchar:"w",hd:"65d8",damage:"1 1 1d8|6 2 2d8|14 4 1d8",level:29},{name_:"Young Blue Dragon",cmove:520093706,spells:528395,cdefense:8197,sleep:700,mexp:300,aaf:20,ac:50,speed:1,cchar:"d",hd:"33d8",damage:"1 3 1d4|1 3 1d4|1 2 1d6",level:29},{name_:"Young White Dragon",cmove:520093706,spells:4198411,cdefense:8197,sleep:700,mexp:275,aaf:20,ac:50,speed:1,cchar:"d",hd:"32d8",damage:"1 3 1d4|1 3 1d4|1 2 1d6",level:29},{name_:"Young Green Dragon",cmove:520093706,spells:1052683,cdefense:8197,sleep:700,mexp:290,aaf:20,ac:50,speed:1,cchar:"d",hd:"32d8",damage:"1 3 1d4|1 3 1d4|1 2 1d6",level:29},{name_:"Giant Fire Bat",cmove:18,spells:0,cdefense:8272,sleep:100,mexp:85,aaf:14,ac:30,speed:2,cchar:"b",hd:"5d8",damage:"5 2 3d6|1 3 1d4|1 3 1d4",level:29},{name_:"Giant Glowing Rat",cmove:2097162,spells:0,cdefense:8304,sleep:200,mexp:4,aaf:8,ac:24,speed:1,cchar:"r",hd:"3d3",damage:"8 2 2d6",level:29},{name_:"Skeleton Troll",cmove:131074,spells:0,cdefense:20492,sleep:400,mexp:225,aaf:20,ac:55,speed:1,cchar:"s",hd:"14d8",damage:"1 1 1d6|1 1 1d6|1 2 3d4",level:30},{name_:"Giant Lightning Bat",cmove:10,spells:0,cdefense:8258,sleep:100,mexp:80,aaf:15,ac:34,speed:2,cchar:"b",hd:"8d8",damage:"8 2 3d8|1 3 1d5|1 3 1d5",level:30},{name_:"Giant Static Ant",cmove:10,spells:0,cdefense:2,sleep:600,mexp:80,aaf:10,ac:40,speed:1,cchar:"a",hd:"8d8",damage:"8 2 5d5",level:30},{name_:"Grave Wight",cmove:251789322,spells:6410,cdefense:20782,sleep:300,mexp:325,aaf:20,ac:35,speed:1,cchar:"W",hd:"12d8",damage:"1 1 1d7|1 1 1d7|19 5 20d8",level:30},{name_:"Killer Slicer Beetle",cmove:10,spells:0,cdefense:18,sleep:300,mexp:200,aaf:14,ac:55,speed:1,cchar:"K",hd:"22d8",damage:"1 2 5d8",level:30},{name_:"Giant White Ant Lion",cmove:524298,spells:0,cdefense:34,sleep:400,mexp:175,aaf:12,ac:45,speed:1,cchar:"A",hd:"20d8",damage:"7 2 3d10",level:30},{name_:"Ghost",cmove:387252234,spells:65583,cdefense:20492,sleep:100,mexp:350,aaf:20,ac:30,speed:2,cchar:"G",hd:"13d8",damage:"4 7 0d0|19 5 22d8|17 3 1d10",level:31},{name_:"Giant Black Ant Lion",cmove:524298,spells:0,cdefense:50,sleep:400,mexp:170,aaf:14,ac:45,speed:1,cchar:"A",hd:"23d8",damage:"1 2 2d12|6 9 3d6",level:31},{name_:"Death Watch Beetle",cmove:10,spells:0,cdefense:18,sleep:300,mexp:190,aaf:16,ac:60,speed:1,cchar:"K",hd:"25d8",damage:"1 2 5d4|1 10 5d6",level:31},{name_:"Ogre Magi",cmove:117571586,spells:41814,cdefense:16444,sleep:300,mexp:250,aaf:20,ac:42,speed:1,cchar:"o",hd:"14d8",damage:"1 1 3d6",level:31},{name_:"Crystal Ooze",cmove:121176073,spells:0,cdefense:146,sleep:600,mexp:8,aaf:5,ac:30,speed:(-1),cchar:"O",hd:"12d8",damage:"7 5 4d4",level:31},{name_:"Two-Headed Troll",cmove:251789314,spells:0,cdefense:24614,sleep:500,mexp:275,aaf:20,ac:48,speed:1,cchar:"T",hd:"14d8",damage:"1 1 1d8|1 1 1d8|1 2 1d6|1 2 1d6",level:32},{name_:"Invisible Stalker",cmove:196642,spells:0,cdefense:0,sleep:200,mexp:200,aaf:20,ac:46,speed:3,cchar:"E",hd:"19d8",damage:"1 1 1d6",level:32},{name_:"Giant Hunter Ant",cmove:2,spells:0,cdefense:2,sleep:10,mexp:150,aaf:16,ac:40,speed:1,cchar:"a",hd:"12d8",damage:"1 2 4d8",level:32},{name_:"Ninja",cmove:251789314,spells:0,cdefense:24624,sleep:100,mexp:300,aaf:20,ac:65,speed:1,cchar:"p",hd:"15d8",damage:"14 1 3d4|2 1 3d4",level:32},{name_:"Barrow Wight",cmove:251789322,spells:4872,cdefense:20782,sleep:100,mexp:375,aaf:20,ac:40,speed:1,cchar:"W",hd:"13d8",damage:"1 1 1d8|1 1 1d8|19 5 26d8",level:33},{name_:"Skeleton 2-Headed Troll",cmove:131074,spells:0,cdefense:20492,sleep:200,mexp:325,aaf:20,ac:48,speed:1,cchar:"s",hd:"20d8",damage:"1 1 1d9|1 1 1d9|1 2 1d5|1 2 1d5",level:33},{name_:"Water Elemental",cmove:10,spells:0,cdefense:32,sleep:500,mexp:325,aaf:12,ac:36,speed:1,cchar:"E",hd:"25d8",damage:"1 1 1d10|1 1 1d10",level:33},{name_:"Fire Elemental",cmove:655378,spells:0,cdefense:8208,sleep:700,mexp:350,aaf:16,ac:40,speed:0,cchar:"E",hd:"25d8",damage:"5 1 4d6",level:33},{name_:"Lich",cmove:520224770,spells:106357,cdefense:20492,sleep:600,mexp:750,aaf:20,ac:50,speed:1,cchar:"L",hd:"25d8",damage:"15 5 2d8|19 5 30d8|24 5 0d0",level:34},{name_:"Master Vampire",cmove:385875970,spells:4871,cdefense:20782,sleep:100,mexp:700,aaf:20,ac:55,speed:1,cchar:"V",hd:"23d8",damage:"1 1 1d6|1 1 1d6|19 5 32d8",level:34},{name_:"Spirit Troll",cmove:262146,spells:0,cdefense:16430,sleep:100,mexp:425,aaf:20,ac:56,speed:1,cchar:"T",hd:"15d8",damage:"1 3 1d5|1 3 1d5|1 2 1d6",level:34},{name_:"Giant Red Scorpion",cmove:10,spells:0,cdefense:2,sleep:400,mexp:275,aaf:12,ac:50,speed:2,cchar:"S",hd:"18d8",damage:"1 2 1d6|14 4 1d4",level:34},{name_:"Earth Elemental",cmove:1703938,spells:0,cdefense:512,sleep:900,mexp:375,aaf:10,ac:60,speed:0,cchar:"E",hd:"30d8",damage:"1 1 4d6|1 1 4d6",level:34},{name_:"Young Black Dragon",cmove:520093706,spells:2101259,cdefense:24581,sleep:500,mexp:600,aaf:20,ac:55,speed:1,cchar:"d",hd:"32d8",damage:"1 3 1d5|1 3 1d5|1 2 1d6",level:35},{name_:"Young Red Dragon",cmove:520093706,spells:8392714,cdefense:24597,sleep:500,mexp:650,aaf:20,ac:60,speed:1,cchar:"d",hd:"36d8",damage:"1 3 1d8|1 3 1d8|1 2 2d8",level:35},{name_:"Necromancer",cmove:318898178,spells:22370,cdefense:24624,sleep:100,mexp:600,aaf:20,ac:40,speed:1,cchar:"p",hd:"17d8",damage:"1 1 2d6",level:35},{name_:"Mummified Troll",cmove:251789314,spells:0,cdefense:20524,sleep:500,mexp:400,aaf:20,ac:38,speed:1,cchar:"M",hd:"18d8",damage:"1 1 2d6|1 1 2d6",level:35},{name_:"Giant Red Ant Lion",cmove:524297,spells:0,cdefense:50,sleep:400,mexp:350,aaf:14,ac:48,speed:1,cchar:"A",hd:"23d8",damage:"5 2 3d12",level:35},{name_:"Mature White Dragon",cmove:788529162,spells:4198410,cdefense:16389,sleep:700,mexp:1000,aaf:20,ac:65,speed:1,cchar:"d",hd:"48d8",damage:"1 3 1d8|1 3 1d8|1 2 2d8",level:35},{name_:"Xorn",cmove:1441794,spells:0,cdefense:16896,sleep:100,mexp:650,aaf:20,ac:80,speed:1,cchar:"X",hd:"20d8",damage:"1 1 1d6|1 1 1d6|1 1 1d6",level:36},{name_:"Giant Mottled Ant Lion",cmove:524298,spells:0,cdefense:50,sleep:400,mexp:350,aaf:14,ac:50,speed:2,cchar:"A",hd:"24d8 ",damage:"1 2 2d10",level:36},{name_:"Grey Wraith",cmove:251789322,spells:70408,cdefense:20782,sleep:100,mexp:700,aaf:20,ac:50,speed:1,cchar:"W",hd:"23d8",damage:"1 1 1d10|1 1 1d10|19 5 34d8",level:36},{name_:"Young Multi-Hued Dragon",cmove:2130706442,spells:16257029,cdefense:24581,sleep:500,mexp:1250,aaf:20,ac:55,speed:1,cchar:"d",hd:"40d8",damage:"1 3 1d9|1 3 1d9|1 2 2d10",level:36},{name_:"Mature Blue Dragon",cmove:788529162,spells:528393,cdefense:24581,sleep:400,mexp:1200,aaf:20,ac:75,speed:1,cchar:"d",hd:"48d8",damage:"1 3 1d8|1 3 1d8|1 2 2d10",level:36},{name_:"Mature Green Dragon",cmove:520093706,spells:1052682,cdefense:24581,sleep:700,mexp:1100,aaf:20,ac:70,speed:1,cchar:"d",hd:"48d8",damage:"1 3 1d4|1 3 1d4|1 2 1d6",level:36},{name_:"Iridescent Beetle",cmove:10,spells:0,cdefense:18,sleep:300,mexp:850,aaf:16,ac:60,speed:1,cchar:"K",hd:"32d8",damage:"1 2 4d6|1 1 1d12|11 7 0d0",level:37},{name_:"King Vampire",cmove:385875970,spells:4871,cdefense:20782,sleep:100,mexp:1000,aaf:20,ac:65,speed:1,cchar:"V",hd:"38d8",damage:"1 1 1d6|1 1 1d6|19 5 38d8",level:37},{name_:"King Lich",cmove:520224770,spells:106355,cdefense:20492,sleep:500,mexp:1400,aaf:20,ac:65,speed:1,cchar:"L",hd:"52d8",damage:"15 5 2d10|19 5 36d8|24 5 0d0",level:37},{name_:"Mature Red Dragon",cmove:788529162,spells:8394760,cdefense:24597,sleep:300,mexp:1400,aaf:20,ac:80,speed:1,cchar:"d",hd:"60d8",damage:"1 3 1d10|1 3 1d10|1 2 2d12",level:37},{name_:"Mature Black Dragon",cmove:788529162,spells:2101257,cdefense:24581,sleep:700,mexp:1350,aaf:20,ac:55,speed:1,cchar:"d",hd:"58d8",damage:"1 3 1d8|1 3 1d8|1 2 2d10",level:37},{name_:"Mature Multi-Hued Dragon",cmove:2130706442,spells:16259589,cdefense:24581,sleep:500,mexp:1650,aaf:20,ac:65,speed:1,cchar:"d",hd:"80d8",damage:"1 3 1d10|1 3 1d10|1 2 2d12",level:38},{name_:"Ancient White Dragon",cmove:1325400066,spells:4200968,cdefense:16389,sleep:800,mexp:1500,aaf:20,ac:80,speed:2,cchar:"D",hd:"88d8",damage:"1 3 1d8|1 3 1d8|1 2 2d8",level:38},{name_:"Emperor Wight",cmove:453115914,spells:4870,cdefense:20782,sleep:100,mexp:1600,aaf:20,ac:40,speed:2,cchar:"W",hd:"48d8",damage:"1 1 1d12|1 1 1d12|19 5 42d8",level:38},{name_:"Black Wraith",cmove:520224778,spells:4871,cdefense:20782,sleep:100,mexp:1700,aaf:20,ac:55,speed:1,cchar:"W",hd:"50d8",damage:"1 1 1d12|1 1 1d12|19 5 44d8",level:38},{name_:"Nether Wraith",cmove:520552458,spells:21270,cdefense:20782,sleep:100,mexp:2100,aaf:20,ac:55,speed:1,cchar:"W",hd:"58d8",damage:"1 1 1d12|1 1 1d12|19 5 52d8",level:39},{name_:"Sorcerer",cmove:318898178,spells:65395,cdefense:24624,sleep:100,mexp:2150,aaf:20,ac:50,speed:2,cchar:"p",hd:"30d8",damage:"1 1 2d8",level:39},{name_:"Ancient Blue Dragon",cmove:1325400066,spells:530952,cdefense:24581,sleep:800,mexp:2500,aaf:20,ac:90,speed:2,cchar:"D",hd:"87d8",damage:"1 3 1d9|1 3 1d9|1 2 2d12",level:39},{name_:"Ancient Green Dragon",cmove:1325400066,spells:1055241,cdefense:24581,sleep:700,mexp:2400,aaf:20,ac:85,speed:2,cchar:"D",hd:"90d8",damage:"1 3 1d8|1 3 1d8|1 2 2d10",level:39},{name_:"Ancient Black Dragon",cmove:1325400066,spells:2103815,cdefense:24581,sleep:700,mexp:2500,aaf:20,ac:90,speed:2,cchar:"D",hd:"90d8",damage:"1 3 1d9|1 3 1d9|1 2 2d10",level:39},{name_:"Disenchanter Worms",cmove:2097186,spells:0,cdefense:432,sleep:100,mexp:30,aaf:5,ac:5,speed:0,cchar:"w",hd:"10d8",damage:"21 12 1d4",level:40},{name_:"Rotting Quylthulg",cmove:65536,spells:16400,cdefense:20480,sleep:0,mexp:1000,aaf:20,ac:1,speed:2,cchar:"Q",hd:"12d8",damage:"0 0 0d0",level:40},{name_:"Ancient Red Dragon",cmove:2130706434,spells:8396294,cdefense:24597,sleep:500,mexp:2750,aaf:20,ac:100,speed:2,cchar:"D",hd:"105d8",damage:"1 3 1d10|1 3 1d10|1 2 2d14",level:40},{name_:"Death Quasit",cmove:285409290,spells:4346,cdefense:4,sleep:0,mexp:1000,aaf:20,ac:80,speed:3,cchar:"q",hd:"55d8",damage:"15 2 3d6|1 3 3d3|1 3 3d3",level:40},{name_:"Emperor Lich",cmove:788660226,spells:106354,cdefense:20492,sleep:500,mexp:10000,aaf:20,ac:75,speed:2,cchar:"L",hd:"190d8",damage:"15 5 2d12|19 5 46d8|24 5 0d0",level:40},{name_:"Ancient Multi-Hued Dragon",cmove:2130706434,spells:16293381,cdefense:24581,sleep:500,mexp:12000,aaf:20,ac:100,speed:2,cchar:"D",hd:"260d8",damage:"1 3 1d12|1 3 1d12|1 2 3d12",level:40},{name_:"Evil Iggy",cmove:2131951618,spells:120595,cdefense:20484,sleep:0,mexp:18000,aaf:20,ac:80,speed:2,cchar:"p",hd:"300d8",damage:"2 1 4d6|13 19 0d0",level:50},{name_:"Balrog",cmove:4280221698,spells:8505155,cdefense:20484,sleep:0,mexp:55000,aaf:20,ac:125,speed:3,cchar:"B",hd:"375d8",damage:"5 1 10d12|1 17 8d12|24 5 0d0",level:100}];
blank_monster={hp:0,csleep:0,cdis:0,mptr:0,nptr:0,cspeed:0,fy:0,fx:0,stuned:0,ml:false,confused:false};
/* God and Wizard passwords: God is for debugging purposes only. */
/* For the testing of bits				-RAK- */
/* Bit number 1 */
/* Bit number 2 */
/* Bit number 3 */
/* Bit number 4 */
/* Bit number 5 */
/* Bit number 6 */
/* Bit number 7 */
/* Bit number 8 */
/* Bit number 9 */
/* Bit number 10 */
/* Bit number 11 */
/* Bit number 12 */
/* Bit number 13 */
/* Bit number 14 */
/* Bit number 15 */
/* Bit number 16 */
/* Bit number 17 */
/* Bit number 18 */
/* Bit number 19 */
/* Bit number 20 */
/* Bit number 21 */
/* Bit number 22 */
/* Bit number 23 */
/* Bit number 24 */
/* Bit number 25 */
/* Bit number 26 */
/* Bit number 27 */
/* Bit number 28 */
/* Bit number 29 */
/* Bit number 30 */
/* Bit number 31 */
/* Bit number 32 */
/* Operating hours for Moria				-RAK- */
/* X = Open; . = Closed */
/* Values for floor types */
/* Dark open floor */
/* Light open floor */
/* Corridor open floor */
/* Room junction marker */
/* Door type floor */
/* Secret door type floor */
/* Floor values 8 and 9 are used in generate */
/* Granite rock wall */
/* Magma rock wall */
/* Quartz rock wall */
/* Indestructable wall */
/* Player record is special */
/* Each character class has a list of spells they can use.  In */
/* cases the entire array is blank */
/* Warrior */
/* Mage */
/* Priest */
/* Rogue */
/* Ranger */
/* Paladin */
/* For Create Food spell use... */
/* Initialize player generation variables */
/* Race	STR,INT,WIS,DEX,CON,CHR,
   		Ages, heights, and weights,
   		Racial Bases for: dis,srh,stl,fos,bth,bthb,bsav,hitdie,
   		infra, choice-classes */
/* Buying and selling adjustments for character race VS store */
/* owner race */
/* Hum,  HfE,  Elf,  Hal,  Gno,  Dwa,  HfO,  HfT */
/* Human */
/* Half-Elf */
/* Elf */
/* Halfling */
/* Gnome */
/* Dwarf */
/* Half-Orc */
/* Half-Troll */
/* Classes... */
/* Class titles for different levels */
/* Warrior */
/* Mage */
/* Priests */
/* Rogues */
/* Rangers */
/* Paladins */
/* Base experience levels, may be adjusted up for race and/or class */
/* Background information */
/* Treasure related values */
/* Gold list (All types of gold and gems are defined here) */
/* Object description:  Objects are defined here.  Each object has
   	the following attributes:
   		Descriptor : Name of item and formats.
   			%C is replaced with a random color.
   			%W is replaced with a random wood.
   			%M is replaced with a random metal.
   			%R is replaced with a random rock.
   			%P1 is replaced with the number in P1 (see below).
   			%P2 is replaced with plus-to-hit.
   			%P3 is replaced with plus-to-damage.
   			%P4 is replaced with plus-to-AC.
   			%P5 is replaced with number in P1, no sign.
   			& is replaced with 'a', 'an', or a number.
   			~ is replaced with null or 's'.
   		Character  : Character that represents the item.
   		Type value : Value representing the type of object.
   			1   ~   Miscellaneous Object.
   			2   &   chest.
   			10  (Left Curly Brace)  sling ammo.
   			11  (Left Curly Brace)  bolt.
   			12  (Left Curly Brace)  arrow.
   			13  ~   spike.
   			15  ~   Lamp or Torch.
   			20  (Right curly brace)  bow, crossbow, or sling.
   			21  /   hafted weapon.
   			22  \   pole arm.
   			23  |   sword or dagger.
   			30  ]   boots.
   			31  ]   gloves and gauntlets.
   			32  (   Cloak
   			33  ]   helm.
   			34  )   shield.
   			35  [   hard armor.
   			36  (   soft armor.
   			40  "   amulet.
   			45  =   ring.
   			55  _   staff.
   			60  -   rod.
   			65  -   wand.
   			70  ?   scroll.
   			71  ?   scroll.    continued
   			75  !   potion.
   			76  !   potion.    continued
   			77  !   flask of oil.
   			80  ,   food.
   			90  ?   Magic Book.
   			91  ?   Prayer Book.
   			100 $   valuable metal.
   			100 *   valuable gems.
   			101 .   Unseen trap.
   			102 ^   Seen trap.
   			103 :   Rubble.
   			104 '   Open door.
   			105 +   Closed door.
   			107 <   Up staircase.
   			108 >   Down staircase.
   			109 #   Secret door.
   			110 1,2,3,4,5,6   Entrance to store.
   
   		Sub value  : separate value for each item of a type.
   		Damage     : amount of damage item can cause.
   		Weight     : relative weight of an item.
   		Number     : number of items appearing in group.
   			If items can be added together then
   				subval > 255
   			If items are considered one unit when added
   			together then
   				subval > 511
   		To hit     : magical pluses to hit.
   		To damage  : magical pluses to damage.
   		AC         : objects relative armor class.
   			1 is worse than 5 is worse than 10 ect...
   		To AC      : Magical bonuses to AC.
   		P1         : Catch all for magical abilities such as
   			     pluses to strength, minuses to searching...
   		Flags      : Abilities of object.  Each abilitiy is a
   			     bit.  Bits 1-31 are used. (Signed integer)
   
   		Flags used for anything that can be worn or wielded:
   				Bit #   Hex #           Ability
   				1       00000001        Strength
   				2       00000002        Dexterity
   				3       00000004        Constitution
   				4       00000008        Intelligence
   				5       00000010        Wisdom
   				6       00000020        Charisma
   				7       00000040        Searching
   				8       00000080        Slow digestion
   				9       00000100        Stealth
   				10      00000200        Aggravation
   				11      00000400        Teleportation
   				12      00000800        Regeneration
   				13      00001000        Speed
   				14      00002000        Slay Dragon
   				15      00004000        Slay Monster
   				16      00008000        Slay Evil
   				17      00010000        Slay Undead
   				18      00020000        Cold Brand
   				19      00040000        Flame Brand
   				20      00080000        Resist Fire
   				21      00100000        Resist Acid
   				22      00200000        Resist Cold
   				23      00400000        Sustain Stat (P1)
   				24      00800000        Free Action
   				25      01000000        See Invisible
   				26      02000000        Resist Lightning
   				27      04000000        Feather Fall
   				28      08000000        Blindness
   				29      10000000        Timidness
   				30      20000000        Tunneling
   				31      40000000        Infra vision
   				32      80000000        Cursed
   		Level      : Minimum level on which item can be found.
   		Cost       : Relative cost of item.
   
   		Special Abilities can be added to item by MAGIC_INIT,
   		found in MISC.INC.
   
   	Scrolls, Potions, and Food:
   		Flags is used to define a function which reading/quaffing
   		will cause.  Most scrolls and potions have only one bit
   		set.  Potions will generally have some food value, found
   		in P1.
   
   	Wands and Staffs:
   		Flags defines a function, P1 contains number of charges
   		for item.  P1 is set in MAGIC_INIT (MISC.INC)
   
   	Chests:
   		Traps are added randomly by MAGIC.INIT in MISC.INC. */
/* Object list (All objects must be defined here) */
/* Items which are sold in the stores are different from dungeon */
/* items so that identify works properly.  Note that the players */
/* recieve their initial items from this list, so position is */
/* very important... */
/* 1 */
/* 2 */
/* 3 */
/* 4 */
/* 5 */
/* 6 */
/* 7 */
/* 8 */
/* 9 */
/* 10 */
/* 11 */
/* 12 */
/* 13 */
/* 14 */
/* 15 */
/* 16 */
/* 17 */
/* 18 */
/* 19 */
/* 20 */
/* 21 */
/* 22 */
/* 23 */
/* 24 */
/* 25 */
/* 26 */
/* 27 */
/* 28 */
/* 29 */
/* 30 */
/* 31 */
/* 32 */
/* 33 */
/* 34 */
/* 35 */
/* 36 */
/* 37 */
/* 38 */
/* 39 */
/* 40 */
/* 41 */
/* 42 */
/* 43 */
/* 44 */
/* 45 */
/* 46 */
/* 47 */
/* 48 */
/* 49 */
/* 50 */
/* 51 */
/* 52 */
/* 53 */
/* 54 */
/* 55 */
/* 56 */
/* 57 */
/* 58 */
/* 59 */
/* 60 */
/* 61 */
/* 62 */
/* 63 */
/* 64 */
/* 65 */
/* 66 */
/* 67 */
/* 68 */
/* 69 */
/* 70 */
/* 71 */
/* 72 */
/* 73 */
/* 74 */
/* 75 */
/* 76 */
/* 77 */
/* 78 */
/* 79 */
/* 80 */
/* 81 */
/* 82 */
/* 83 */
/* 84 */
/* 85 */
/* 86 */
/* 87 */
/* 88 */
/* 89 */
/* 90 */
/* 91 */
/* 92 */
/* 93 */
/* 94 */
/* 95 */
/* 96 */
/* 97 */
/* 98 */
/* 99 */
/* 100 */
/* 101 */
/* 102 */
/* 103 */
/* 104 */
/* 105 */
/* General Store */
/* Armory */
/* Weaponsmith */
/* Temple */
/* Alchemy shop */
/* Magic-User store */
/* Each store will buy only certain items, based on TVAL */
/* Store owners have different characteristics for pricing and haggling */
/* Note: Store owners should be added in groups, one for each store */
/* Each type of character starts out with a few provisions... */
/* Note the the entries refer to array elements of INVENTORY_INIT array */
/* Warrior */
/* Mage */
/* Priest */
/* Rogue */
/* Ranger */
/* Paladin */
/* Identified objects flags */
/* Traps are just Nasty treasures... */
/* Traps: Level represents the difficulty of disarming; */
/* and P1 represents the experienced gained when disarmed */
/* Special case, see DOOR_LIST below (subvals must agree) */
/* Stores are just special traps */
/* Secret door must have same subval as closed door in */
/* TRAP_LISTB.  See CHANGE_TRAP */
/* Sets for easy testing */
/* Descriptive phrases */
/* Used in DESC.INC for replacing the & in descriptions */
/* Creatures must be defined here */
/* See TYPES.INC under creature_type for a complete list
   		of all variables for creatures.  Some of the less obvious
   		are explained below.
   
   	Hit points:	'#1d#2' where #2 is the range of each roll and
   			#1 is the number of added up rolls to make.
   			Example: a creature with 5 eight-sided hit die
   			is given '5d8'.
   
   		Attack types:
   		1       Normal attack
   		2       Poison Strength
   		3       Confusion attack
   		4       Fear attack
   		5       Fire attack
   		6       Acid attack
   		7       Cold attack
   		8       Lightning attack
   		9       Corrosion attack
   		10      Blindness attack
   		11      Paralysis attack
   		12      Steal Money
   		13      Steal Object
   		14      Poison
   		15      Lose dexterity
   		16      Lose constitution
   		17      Lose intelligence
   		18      Lose wisdom
   		19      Lose experience
   		20      Aggravation
   		21      Disenchants
   		22      Eats food
   		23      Eats light
   		24      Eats charges
   		99      Blank
   
   		Attack descriptions:
   		1       hits you.
   		2       bites you.
   		3       claws you.
   		4       stings you.
   		5       touches you.
   		6       kicks you.
   		7       gazes at you.
   		8       breathes on you.
   		9       spits on you.
   		10      makes a horrible wail.
   		11      embraces you.
   		12      crawls on you.
   		13      releases a cloud of spores.
   		14      begs you for money.
   		15      You've been slimed.
   		16      crushes you.
   		17      tramples you.
   		18      drools on you.
   		19      insults you.
   		99      is repelled.
   
   	Example:  For a creature which bites for 1d6, then stings for
   		  2d4 and loss of dex you would use:
   			'1 2 1d6|15 4 2d4'
   
   		CMOVE flags:
   Movement.       00000001        Move only to attack
   	.       00000002        Move, attack normal
   	.       00000008        20% random movement
   	.       00000010        40% random movement
   	.       00000020        75% random movement
   Special +       00010000        Invisible movement
   	+       00020000        Move through door
   	+       00040000        Move through wall
   	+       00080000        Move through creatures
   	+       00100000        Picks up objects
   	+       00200000        Multiply monster
   Carries =       01000000        Carries objects.
   	=       02000000        Carries gold.
   	=       04000000        Has 60% of time.
   	=       08000000        Has 90% of time.
   	=       10000000        1d2 objects/gold.
   	=       20000000        2d2 objects/gold.
   	=       40000000        4d2 objects/gold.
   Special ~       80000000        Win-the-Game creature.
   
   		SPELL Flags:
   Frequency       000001    1     These add up to x.  Then
   (1 in x).       000002    2     if RANDINT(X) = 1 the
   	.       000004    4     creature casts a spell.
   	.       000008    8
   Spells  =       000010  Teleport short (blink)
   	=       000020  Teleport long
   	=       000040  Teleport player to monster
   	=       000080  Cause light wound
   	=       000100  Cause serious wound
   	=       000200  Hold person (Paralysis)
   	=       000400  Cause blindness
   	=       000800  Cause confusion
   	=       001000  Cause fear
   	=       002000  Summon monster
   	=       004000  Summon undead
   	=       008000  Slow Person
   	=       010000  Drain Mana
   	=       020000  Not Used
   	=       040000  Not Used
   Breaths +       080000  Breath Lightning
   	+       100000  Breath Gas
   	+       200000  Breath Acid
   	+       400000  Breath Frost
   	+       800000  Breath Fire
   
   		CDEFENSE flags:
   		0001    Hurt by Slay Dragon.
   		0002    Hurt by Slay Monster.
   		0004    Hurt by Slay Evil.
   		0008    Hurt by Slay Undead.
   		0010    Hurt by Frost.
   		0020    Hurt by Fire.
   		0040    Hurt by Poison.
   		0080    Hurt by Acid.
   		0100    Hurt by Light-Wand.
   		0200    Hurt by Stone-to-Mud.
   		0400    Not used.
   		0800    Not used.
   		1000    Cannot be charmed or slept.
   		2000    Can be seen with infra-vision.
   		4000    Max Hit points.
   		8000    Not used.
   
   
   	Sleep (sleep)	:	A measure in turns of how fast creature
   				will notice player (on the average).
   	Area of affect (aaf) :  Max range that creature is able to "notice"
   				the player. */
/* Now things are going to get tough... */
/* Some of the creatures have Max hit points, denoted in */
/* their CDEFENSE flags as the '4000' bit set */
/* Winning creatures should follow here. */
/* Winning creatures are denoted by the 32 bit in CMOVE */
/* Iggy is not a win creature, just a royal pain in the ass... */
/* Here is the only actual win creature... */
/* Libraries of routines 				-RAK- */
/* Convert an integer into a system bin time		-RAK- */
/* NOTE: Int_time is number of 1/100 seconds */
/* Max value = 5999 */
/* Set timer for hibernation				-RAK- */
/* Hibernate 						-RAK- */
/* Sleep for given time					-RAK- */
/* NOTE: Int_time is in seconds */
/* Setup system time format for io_pause.  		-RAK- */
/* NOTE: IO$MOR_IOPAUSE is a constant */
/* IO$BIN_PAUSE is a variable used to store results */
/* NOTE: Remove or comment out for VMS 4.0 or greater */
/* Turns SYSPRV off if 0; on if 1;			-RAK- */
/* This is needed if image is installed with SYSPRV because */
/* user could write on system areas.  By turning the priv off */
/* system areas are secure */
/* Quad word needed for priv mask */
/* Turn off SYSPRV					-RAK- */
/* SYSPRV */
/* Spawn a shell						-RAK- */
/* Turn off Control-Y					-RAK- */
/* No Control-Y */
/* Turn on Control-Y					-RAK- */
/* Control-Y */
/* Dump IO to buffer					-RAK- */
/* NOTE: Source is PUTQIO.MAR */
/* Dump the IO buffer to terminal			-RAK- */
/* NOTE: Source is PUTQIO.MAR */
/* Immediate exit from program */
/* Turn control-Y back on */
/* Dump any remaining buffer */
/* exit from game */
/* Initializes I/O channel for use with INKEY */
/* QIOW definition					-RAK- */
/* Gets single character from keyboard and returns */
/* Dump IO buffer */
/* Allow device driver to catch up */
/* NOTE: Remove or comment out for VMS 4.0 or greater */
/* Now read */
/* Gets single character from keyboard and returns */
/* Dump the IO buffer */
/* Allow device driver to catch up */
/* NOTE: Remove or comment out for VMS 4.0 or greater */
/* Now read */
/* Blank out return character */
/* Flush the buffer					-RAK- */
/* Allow device driver to catch up */
/* NOTE: Remove or comment out for VMS 4.0 or greater */
/* Now flush */
/* Flush buffer before input				-RAK- */
function* inkey_flush(x){
  put_qio();
  /* Dup the IO buffer */
  if((!(wizard1))){
    flush();
  }
  (yield* inkey(x));
}
/* Retrieves foreign string input with game command	-JWT- */
/* Clears given line of text				-RAK- */
function erase_line(row,col){
  put_buffer(cursor_erl,row,col);
}
/* Clears screen at given row, column */
function clear(row,col){
  var i1=0;
  for(var $e1=23,$ie1=2;$ie1<=$e1;$ie1++){
    i1=$ie1;
    used_line[i1]=false;
  }
  put_buffer(cursor_erp,row,col);
  put_qio();
}
/* Dump the Clear Sequence */
/* Outputs a line to a given interpolated y,x position	-RAK- */
function print(str_buff,row,col){
  row=(row-panel_row_prt);
  /* Real co-ords convert to screen positions */
  col=(col-panel_col_prt);
  used_line[row]=true;
  put_buffer(str_buff,row,col);
}
/* Outputs a line to a given y,x position		-RAK- */
function prt(str_buff,row,col){
  put_buffer((cursor_erl+str_buff),row,col);
}
/* Outputs message to top line of screen */
function* msg_print(str_buff){
  var old_len=0;
  var in_char='\0';
  if((msg_flag)){
    old_len=(old_msg.length+1);
    put_buffer(" -more-",msg_line,old_len);
    do{
      (yield* inkey({get v(){return in_char},set v($x){in_char=$x}}));
    }while(!(($in($ord(in_char),$S14))));
  }
  put_buffer((cursor_erl+str_buff),msg_line,msg_line);
  old_msg=$cap(str_buff,80);
  msg_flag=true;
}
/* Prompts (optional) and returns ord value of input char */
/* Function returns false if <ESCAPE>,CNTL/(Y,C,Z) is input */
function* get_com(prompt,command){
  var $ret=false;
  var com_val=0;
  if(((prompt.length>1))){
    prt(prompt,1,1);
  }
  (yield* inkey(command));
  com_val=$ord(command.v);
  switch(com_val){
    case 3:case 25:case 26:case 27:{
      $ret=false;
      break;
    }
    default:{
      $ret=true;
    }
  }
  erase_line(msg_line,msg_line);
  msg_flag=false;
  return $ret;
}
/* Gets a string terminated by <RETURN> */
/* Function returns false if <ESCAPE>,CNTL/(Y,C,Z) is input */
function* get_string(in_str,row,column,slen){
  var $ret=false;
  var start_col=0;
  var end_col=0;
  var i1=0;
  var x='\0';
  var tmp="";
  var flag=false;
  var abort=false;
  abort=false;
  flag=false;
  in_str.v="";
  put_buffer($pad(in_str.v," ",slen),row,column);
  put_buffer("",row,column);
  start_col=column;
  end_col=((column+slen)-1);
  do{
    (yield* inkey({get v(){return x},set v($x){x=$x}}));
    switch($ord(x)){
      case 3:case 25:case 26:case 27:{
        abort=true;
        break;
      }
      case 13:{
        flag=true;
        break;
      }
      case 127:{
        if(((column>start_col))){
          column=(column-1);
          put_buffer((" "+$chr(8)),row,column);
          in_str.v=$substr(in_str.v,1,(in_str.v.length-1));
        }
        break;
      }
      default:{
        tmp=$cap(x,80);
        put_buffer(tmp,row,column);
        in_str.v=(in_str.v+tmp);
        column=(column+1);
        if(((column>end_col))){
          flag=true;
        }
      }
    }
  }while(!(((flag||abort))));
  if((abort)){
    $ret=false;
  }else{
    /* Remove trailing blanks */
    i1=in_str.v.length;
    if(((i1>1))){
      while((((($ch(in_str.v,i1)===" "))&&((i1>1))))){
        i1=(i1-1);
      }
      in_str.v=$substr(in_str.v,1,i1);
    }
    $ret=true;
  }
  return $ret;
}
/* Return integer value of hex string			-RAK- */
function* get_hex_value(row,col,slen){
  var $ret=0;
  var bin_val=0;
  var tmp_str="";
  var pack_str="";
  $ret=0;
  if(((yield* get_string({get v(){return tmp_str},set v($x){tmp_str=$x}},row,col,slen)))){
    if(((tmp_str.length<=8))){
      pack_str=$fix($pad(tmp_str," ",9),9);
      if(($odd(convert_hex_to_bin(pack_str,{get v(){return bin_val},set v($x){bin_val=$x}})))){
        $ret=bin_val;
      }
    }
  }
  return $ret;
}
/* Pauses for user response before returning		-RAK- */
function* pause(prt_line){
  var dummy='\0';
  prt("[Press any key to continue]",prt_line,24);
  (yield* inkey({get v(){return dummy},set v($x){dummy=$x}}));
  erase_line(24,1);
}
/* Pauses for user response before returning		-RAK- */
/* NOTE: Delay is for players trying to roll up "perfect" */
/* characters.  Make them wait a bit... */
function* pause_exit(prt_line,delay){
  var dummy='\0';
  prt("[Press any key to continue, or <Control>-Z to exit]",prt_line,11);
  (yield* inkey({get v(){return dummy},set v($x){dummy=$x}}));
  switch($ord(dummy)){
    case 3:case 25:case 26:{
      erase_line(prt_line,1);
      if(((delay>0))){
        (yield* sleep(delay));
      }
      exit();
      break;
    }
    default:{
    }
  }
  erase_line(prt_line,1);
}
/* Returns the image path for Moria			-RAK- */
/* Path is returned in a VARYING[80] of char */
/* Call JPI and return the image path as a packed 128	-RAK- */
/* GETJPI definition */
/* Image length */
/* Image path */
/* Use date and time to produce random seed		-RAK- */
function get_seed(){
  var $ret=0;
  var time=({l0:0,l1:0});
  var seed_val=0;
  get_time(time);
  /* Current time */
  seed_val=((time.l0|time.l1)>>>0);
  /* Random number */
  $ret=((seed_val|1)>>>0);
  return $ret;
}
/* Odd number */
/* Returns the day number; 1=Sunday...7=Saturday 	-RAK- */
function day_num(){
  var $ret=0;
  var i1=0;
  day({get v(){return i1},set v($x){i1=$x}});
  $ret=(($mod(((i1+3)),7))+1);
  return $ret;
}
/* Returns the hour number; 0=midnight...23=11 PM	-RAK- */
function hour_num(){
  var $ret=0;
  var hour=0;
  var time_str="";
  time_str=$time();
  (($rv=$readvs($substr(time_str,1,2),["int"],false)),hour=$rv[0]);
  $ret=hour;
  return $ret;
}
/* Check the day-time strings to see if open		-RAK- */
function check_time(){
  var $ret=false;
  switch($ch(days[day_num()],((hour_num()+5)))){
    case ".":{
      $ret=false;
      break;
    }
    case "X":{
      /* Closed */
      $ret=true;
      break;
    }
    default:{
      /* Normal hours */
      $ret=false;
    }
  }
  return $ret;
}
/* Other, assumed closed */
/* Generates a random integer x where 1<=X<=MAXVAL	-RAK- */
/* Generates a random integer number of NORMAL distribution -RAK- */
function randnor(mean,stand){
  var $ret=0;
  $ret=(Math.trunc(Math.fround(Math.fround(Math.fround(Math.sqrt((-Math.fround(Math.fround(2.0)*Math.fround(Math.log(Math.fround($rdiv(randint(9999999),Math.fround(10000000.0)))))))))*Math.fround(Math.cos(Math.fround(Math.fround(6.283)*(Math.fround($rdiv(randint(9999999),Math.fround(10000000.0))))))))*stand))+mean);
  return $ret;
}
/* Returns position of first set bit			-RAK- */
/* Checks a co-ordinate for in bounds status		-RAK- */
function in_bounds(y,x){
  var $ret=false;
  if(((((((y>1))&&((y<cur_height)))&&((x>1)))&&((x<cur_width))))){
    $ret=true;
  }else{
    $ret=false;
  }
  return $ret;
}
/* Distance between two points				-RAK- */
/* Checks points north, south, east, and west for a type -RAK- */
function next_to4(y,x,group_set){
  var $ret=0;
  var i1=0;
  i1=0;
  if(((y>1))){
    if(($in(cave[(y-1)][x].fval,group_set))){
      i1=(i1+1);
    }
  }
  if(((y<cur_height))){
    if(($in(cave[(y+1)][x].fval,group_set))){
      i1=(i1+1);
    }
  }
  if(((x>1))){
    if(($in(cave[y][(x-1)].fval,group_set))){
      i1=(i1+1);
    }
  }
  if(((x<cur_width))){
    if(($in(cave[y][(x+1)].fval,group_set))){
      i1=(i1+1);
    }
  }
  $ret=i1;
  return $ret;
}
/* Checks all adjacent spots for elements		-RAK- */
function next_to8(y,x,group_set){
  var $ret=0;
  var i1=0;
  var i2=0;
  var i3=0;
  i1=0;
  for(var $e7=((y+1)),$ie7=((y-1));$ie7<=$e7;$ie7++){
    i2=$ie7;
    for(var $e8=((x+1)),$ie8=((x-1));$ie8<=$e8;$ie8++){
      i3=$ie8;
      if((in_bounds(i2,i3))){
        if(($in(cave[i2][i3].fval,group_set))){
          i1=(i1+1);
        }
      }
    }
  }
  $ret=i1;
  return $ret;
}
/* Link all free space in treasure list together */
function tlink(){
  var i1=0;
  for(var $e9=max_talloc,$ie9=1;$ie9<=$e9;$ie9++){
    i1=$ie9;
    $assign(t_list[i1],blank_treasure);
    t_list[i1].p1=(i1-1);
  }
  tcptr=max_talloc;
}
/* Link all free space in monster list together */
function mlink(){
  var i1=0;
  for(var $e10=max_malloc,$ie10=1;$ie10<=$e10;$ie10++){
    i1=$ie10;
    $assign(m_list[i1],blank_monster);
    m_list[i1].nptr=(i1-1);
  }
  m_list[2].nptr=0;
  muptr=0;
  mfptr=max_malloc;
}
/* Initializes M_LEVEL array for use with PLACE_MONSTER	-RAK- */
function init_m_level(){
  var i1=0;
  var i2=0;
  var i3=0;
  i1=1;
  i2=0;
  i3=(max_creatures-win_mon_tot);
  do{
    m_level[i2]=0;
    while(((((i1<=i3))&&((c_list[i1].level===i2))))){
      m_level[i2]=(m_level[i2]+1);
      i1=(i1+1);
    }
    i2=(i2+1);
  }while(!(((i2>max_mons_level))));
  for(var $e11=max_mons_level,$ie11=2;$ie11<=$e11;$ie11++){
    i1=$ie11;
    m_level[i1]=(m_level[i1]+m_level[(i1-1)]);
  }
}
/* Initializes T_LEVEL array for use with PLACE_OBJECT	-RAK- */
function init_t_level(){
  var i1=0;
  var i2=0;
  i1=1;
  i2=0;
  do{
    while(((((i1<=max_objects))&&((object_list[i1].level===i2))))){
      t_level[i2]=(t_level[i2]+1);
      i1=(i1+1);
    }
    i2=(i2+1);
  }while(!(((((i2>max_obj_level))||((i1>max_objects))))));
  for(var $e12=max_obj_level,$ie12=1;$ie12<=$e12;$ie12++){
    i1=$ie12;
    t_level[i1]=(t_level[i1]+t_level[(i1-1)]);
  }
}
/* Adjust prices of objects				-RAK- */
function price_adjust(){
  var i1=0;
  for(var $e13=max_objects,$ie13=1;$ie13<=$e13;$ie13++){
    i1=$ie13;
    var $w14=object_list[i1];
    $w14.cost=Math.trunc(Math.fround(Math.fround($w14.cost*cost_adj)+Math.fround(0.99)));
  }
  for(var $e15=inven_init_max,$ie15=1;$ie15<=$e15;$ie15++){
    i1=$ie15;
    var $w16=inventory_init[i1];
    $w16.cost=Math.trunc(Math.fround(Math.fround($w16.cost*cost_adj)+Math.fround(0.99)));
  }
}
/* Converts input string into a dice roll		-RAK- */
/* Normal input string will look like '2d6', '3d8'... ect. */
function damroll(dice){
  var $ret=0;
  var i1=0;
  var num=0;
  var sides=0;
  for(var $e17=dice.length,$ie17=1;$ie17<=$e17;$ie17++){
    i1=$ie17;
    if((($ch(dice,i1)==="d"))){
      dice=$setch(dice,i1," ");
    }
  }
  num=0;
  sides=0;
  (($rv=$readvs(dice,["int", "int"],true)),num=$rv[0],sides=$rv[1]);
  $ret=rand_rep(num,sides);
  return $ret;
}
/* Returns true if no obstructions between two given points -RAK- */
function los(y1,x1,y2,x2){
  var $ret=false;
  var ty=0;
  var tx=0;
  var stepy=0;
  var stepx=0;
  var p1=0;
  var p2=0;
  var slp=0;
  var tmp=0;
  var flag=false;
  ty=((y1-y2));
  tx=((x1-x2));
  flag=true;
  if(((((ty!==0))||((tx!==0))))){
    if(((ty<0))){
      stepy=(-1);
    }else{
      stepy=1;
    }
    if(((tx<0))){
      stepx=(-1);
    }else{
      stepx=1;
    }
    if(((ty===0))){
      do{
        x2=(x2+stepx);
        flag=cave[y2][x2].fopen;
      }while(!(((((x1===x2))||(!(flag))))));
    }else if(((tx===0))){
      do{
        y2=(y2+stepy);
        flag=cave[y2][x2].fopen;
      }while(!(((((y1===y2))||(!(flag))))));
    }else if(((Math.abs(ty)>Math.abs(tx)))){
      slp=Math.fround(Math.fround(Math.abs(Math.fround($rdiv(tx,ty)))*stepx));
      tmp=Math.fround(x2);
      do{
        y2=(y2+stepy);
        tmp=Math.fround(Math.fround(tmp+slp));
        p1=$round(Math.fround(tmp-Math.fround(0.1)));
        p2=$round(Math.fround(tmp+Math.fround(0.1)));
        if((!(((cave[y2][p1].fopen)||(cave[y2][p2].fopen))))){
          flag=false;
        }
      }while(!(((((y1===y2))||(!(flag))))));
    }else{
      slp=Math.fround(Math.fround(Math.abs(Math.fround($rdiv(ty,tx)))*stepy));
      tmp=Math.fround(y2);
      do{
        x2=(x2+stepx);
        tmp=Math.fround(Math.fround(tmp+slp));
        p1=$round(Math.fround(tmp-Math.fround(0.1)));
        p2=$round(Math.fround(tmp+Math.fround(0.1)));
        if((!(((cave[p1][x2].fopen)||(cave[p2][x2].fopen))))){
          flag=false;
        }
      }while(!(((((x1===x2))||(!(flag))))));
    }
  }
  $ret=flag;
  return $ret;
}
/* Returns symbol for given row, column			-RAK- */
function loc_symbol(y,x,sym){
  var $w18=cave[y][x];
  if((((($w18.cptr===1))&&(!(find_flag))))){
    sym.v="@";
  }else if(((py.flags.blind>0))){
    sym.v=" ";
  }else{
    if((($w18.cptr>1))){
      var $w19=m_list[$w18.cptr];
      if(((($w19.ml)&&((((((c_list[$w19.mptr].cmove&65536)>>>0)===0))||(py.flags.see_inv)))))){
        sym.v=c_list[$w19.mptr].cchar;
      }else if((($w18.tptr>0))){
        sym.v=t_list[$w18.tptr].tchar;
      }else if((($w18.fval<10))){
        sym.v=".";
      }else{
        sym.v="#";
      }
    }else if((($w18.tptr>0))){
      sym.v=t_list[$w18.tptr].tchar;
    }else if((($w18.fval<10))){
      sym.v=".";
    }else{
      sym.v="#";
    }
  }
}
/* Tests a spot for light or field mark status		-RAK- */
function test_light(y,x){
  var $ret=false;
  var $w20=cave[y][x];
  if((((($w20.pl)||($w20.fm))||($w20.tl)))){
    $ret=true;
  }else{
    $ret=false;
  }
  return $ret;
}
/* Prints the map of the dungeon 			-RAK- */
function prt_map(){
  var i1=0;
  var i2=0;
  var i3=0;
  var i4=0;
  var i5=0;
  var ypos=0;
  var xpos=0;
  var isp=0;
  var floor_str="";
  var tmp_char='\0';
  var flag=false;
  redraw=false;
  /* Screen has been redrawn */
  i3=1;
  /* Used for erasing dirty lines */
  i4=14;
  /* Erasure starts in this column */
  for(var $e21=panel_row_max,$ie21=panel_row_min;$ie21<=$e21;$ie21++){
    i1=$ie21;
    /* Top to bottom */
    i3=(i3+1);
    /* Increment dirty line ctr */
    if((used_line[i3])){
      /* If line is dirty... */
      erase_line(i3,i4);
      /* erase it. */
      used_line[i3]=false;
    }
    /* Now it's a clean line */
    floor_str=$cap("",80);
    /* Floor_str is string to be printed */
    ypos=i1;
    /* Save row */
    flag=false;
    /* False until floor_str <> '' */
    isp=0;
    /* Number of blanks encountered */
    for(var $e22=panel_col_max,$ie22=panel_col_min;$ie22<=$e22;$ie22++){
      i2=$ie22;
      /* Left to right */
      var $w23=cave[i1][i2];
      /* Get character for location */
      if((test_light(i1,i2))){
        loc_symbol(i1,i2,{get v(){return tmp_char},set v($x){tmp_char=$x}});
      }else if((((($w23.cptr===1))&&(!(find_flag))))){
        tmp_char="@";
      }else if((($w23.cptr>1))){
        if((m_list[$w23.cptr].ml)){
          loc_symbol(i1,i2,{get v(){return tmp_char},set v($x){tmp_char=$x}});
        }else{
          tmp_char=" ";
        }
      }else{
        tmp_char=" ";
      }
      if(((tmp_char===" "))){
        /* If blank... */
        if((flag)){
          /* If floor_str <> '' then */
          isp=(isp+1);
          /* Increment blank ctr */
          if(((isp>3))){
            /* Too many blanks, print */
            /* floor_str and reset */
            print(floor_str,ypos,xpos);
            flag=false;
            isp=0;
          }
        }
      }else{
        if((flag)){
          /* Floor_str <> '' */
          if(((isp>0))){
            /* Add on the blanks */
            for(var $e24=isp,$ie24=1;$ie24<=$e24;$ie24++){
              i5=$ie24;
              floor_str=$cap((floor_str+" "),80);
            }
            isp=0;
          }
          /* Add on the character */
          floor_str=$cap((floor_str+tmp_char),80);
        }else{
          /* Floor_str = '' */
          xpos=i2;
          /* Save column for printing */
          flag=true;
          /* Set flag to true */
          floor_str=$cap(tmp_char,80);
        }
      }
    }
    /* Floor_str <> '' */
    if((flag)){
      /* Print remainder, if any */
      print(floor_str,ypos,xpos);
    }
  }
}
/* Compact monsters					-RAK- */
function compact_monsters(){
  var i1=0;
  var i2=0;
  var i3=0;
  var ctr=0;
  var cur_dis=0;
  var delete_1=false;
  var delete_any=false;
  cur_dis=66;
  delete_any=false;
  do{
    i1=muptr;
    i2=0;
    do{
      delete_1=false;
      i3=m_list[i1].nptr;
      var $w25=m_list[i1];
      if(((cur_dis>$w25.cdis))){
        if(((randint(3)===1))){
          if(((i2===0))){
            muptr=i3;
          }else{
            m_list[i2].nptr=i3;
          }
          cave[$w25.fy][$w25.fx].cptr=0;
          $assign(m_list[i1],blank_monster);
          m_list[i1].nptr=mfptr;
          mfptr=i1;
          ctr=(ctr+1);
          delete_1=true;
          delete_any=true;
        }
      }
      if((!(delete_1))){
        i2=i1;
      }
      i1=i3;
    }while(!(((i1===0))));
    if((!(delete_any))){
      cur_dis=(cur_dis-6);
    }
  }while(!((delete_any)));
  if(((cur_dis<66))){
    prt_map();
  }
}
/* Returns a pointer to next free space			-RAK- */
function popm(x){
  if(((mfptr<1))){
    compact_monsters();
  }
  x.v=mfptr;
  mfptr=m_list[x.v].nptr;
}
/* Pushs a record back onto free space list		-RAK- */
function pushm(x){
  $assign(m_list[x],blank_monster);
  m_list[x].nptr=mfptr;
  mfptr=x;
}
/* Gives Max hit points					-RAK- */
function max_hp(hp_str){
  var $ret=0;
  var i1=0;
  var num=0;
  var die=0;
  for(var $e26=hp_str.length,$ie26=1;$ie26<=$e26;$ie26++){
    i1=$ie26;
    if((($ch(hp_str,i1)==="d"))){
      hp_str=$setch(hp_str,i1," ");
    }
  }
  (($rv=$readvs(hp_str,["int", "int"],false)),num=$rv[0],die=$rv[1]);
  $ret=(num*die);
  return $ret;
}
/* Places a monster at given location			-RAK- */
function place_monster(y,x,z,slp){
  var i1=0;
  var cur_pos=0;
  popm({get v(){return cur_pos},set v($x){cur_pos=$x}});
  var $w27=m_list[cur_pos];
  $w27.fy=y;
  $w27.fx=x;
  $w27.mptr=z;
  $w27.nptr=muptr;
  muptr=cur_pos;
  if(((((c_list[z].cdefense&16384)>>>0)!==0))){
    $w27.hp=max_hp(c_list[z].hd);
  }else{
    $w27.hp=damroll(c_list[z].hd);
  }
  $w27.cspeed=(c_list[z].speed+py.flags.speed);
  $w27.stuned=((0)<<26>>26);
  $w27.cdis=distance(char_row,char_col,y,x);
  cave[y][x].cptr=cur_pos;
  if((slp)){
    $w27.csleep=(Math.trunc(Math.fround($rdiv(c_list[z].sleep,Math.fround(5.0))))+randint(c_list[z].sleep));
  }else{
    $w27.csleep=0;
  }
}
/* Places a monster at given location			-RAK- */
function place_win_monster(){
  var cur_pos=0;
  var y=0;
  var x=0;
  if((!(total_winner))){
    popm({get v(){return cur_pos},set v($x){cur_pos=$x}});
    var $w28=m_list[cur_pos];
    do{
      y=(randint((cur_height-2))+1);
      x=(randint((cur_width-2))+1);
    }while(!(((((($in(cave[y][x].fval,$S15))&&((cave[y][x].cptr===0)))&&((cave[y][x].tptr===0)))&&((distance(y,x,char_row,char_col)>max_sight))))));
    $w28.fy=y;
    $w28.fx=x;
    $w28.mptr=((randint(win_mon_tot)+m_level[max_mons_level])+m_level[0]);
    $w28.nptr=muptr;
    muptr=cur_pos;
    if(((((c_list[$w28.mptr].cdefense&16384)>>>0)!==0))){
      $w28.hp=max_hp(c_list[$w28.mptr].hd);
    }else{
      $w28.hp=damroll(c_list[$w28.mptr].hd);
    }
    $w28.cspeed=(c_list[$w28.mptr].speed+py.flags.speed);
    $w28.stuned=((0)<<26>>26);
    $w28.cdis=distance(char_row,char_col,y,x);
    cave[y][x].cptr=cur_pos;
    $w28.csleep=0;
  }
}
/* Allocates a random monster				-RAK- */
function alloc_monster(alloc_set,num,dis,slp){
  var y=0;
  var x=0;
  var a=0;
  var b=0;
  var i1=0;
  var i2=0;
  var i3=0;
  for(var $e29=num,$ie29=1;$ie29<=$e29;$ie29++){
    i1=$ie29;
    do{
      y=(randint((cur_height-2))+1);
      x=(randint((cur_width-2))+1);
    }while(!(((((($in(cave[y][x].fval,alloc_set))&&((cave[y][x].cptr===0)))&&(cave[y][x].fopen))&&((distance(y,x,char_row,char_col)>dis))))));
    if(((dun_level===0))){
      i2=randint(m_level[0]);
    }else if(((dun_level>max_mons_level))){
      i2=(randint(m_level[max_mons_level])+m_level[0]);
    }else if(((randint(mon_nasty)===1))){
      i2=((dun_level+Math.abs(randnor(0,4)))+1);
      if(((i2>max_mons_level))){
        i2=max_mons_level;
      }
      i3=(m_level[i2]-m_level[(i2-1)]);
      i2=(randint(i3)+m_level[(i2-1)]);
    }else{
      i2=(randint(m_level[dun_level])+m_level[0]);
    }
    place_monster(y,x,i2,slp);
  }
}
/* Places creature adjacent to given location		-RAK- */
function summon_monster(y,x,slp){
  var $ret=false;
  var i1=0;
  var i2=0;
  var i3=0;
  var i4=0;
  var i5=0;
  i1=0;
  i5=(dun_level+mon_S_summon_adj);
  $ret=false;
  if(((i5>max_mons_level))){
    i4=max_mons_level;
  }else{
    i4=i5;
  }
  if(((dun_level===0))){
    i4=randint(m_level[0]);
  }else{
    i4=(randint(m_level[i4])+m_level[0]);
  }
  do{
    i2=((y.v-2)+randint(3));
    i3=((x.v-2)+randint(3));
    if((in_bounds(i2,i3))){
      var $w30=cave[i2][i3];
      if(($in($w30.fval,$S16))){
        if((($w30.cptr===0))){
          if(($w30.fopen)){
            place_monster(i2,i3,i4,slp);
            $ret=true;
            i1=9;
            y.v=i2;
            x.v=i3;
          }
        }
      }
    }
    i1=(i1+1);
  }while(!(((i1>9))));
  return $ret;
}
/* Places undead adjacent to given location		-RAK- */
function summon_undead(y,x){
  var $ret=false;
  var i1=0;
  var i2=0;
  var i3=0;
  var i4=0;
  var i5=0;
  var ctr=0;
  i1=0;
  $ret=false;
  i4=(m_level[max_mons_level]+m_level[0]);
  do{
    i5=randint(i4);
    ctr=0;
    do{
      if(((((c_list[i5].cdefense&8)>>>0)!==0))){
        ctr=20;
        i4=0;
      }else{
        i5=(i5+1);
        if(((i5>i4))){
          ctr=20;
        }else{
          ctr=(ctr+1);
        }
      }
    }while(!(((ctr>19))));
  }while(!(((i4===0))));
  do{
    i2=((y.v-2)+randint(3));
    i3=((x.v-2)+randint(3));
    if((in_bounds(i2,i3))){
      var $w31=cave[i2][i3];
      if(($in($w31.fval,$S16))){
        if((((($w31.cptr===0))&&($w31.fopen)))){
          place_monster(i2,i3,i5,false);
          $ret=true;
          i1=9;
          y.v=i2;
          x.v=i3;
        }
      }
    }
    i1=(i1+1);
  }while(!(((i1>9))));
  return $ret;
}
/* If too many objects on floor level, delete some of them-RAK- */
function compact_objects(){
  var i1=0;
  var i2=0;
  var ctr=0;
  var cur_dis=0;
  var flag=false;
  ctr=0;
  cur_dis=66;
  do{
    for(var $e32=cur_height,$ie32=1;$ie32<=$e32;$ie32++){
      i1=$ie32;
      for(var $e33=cur_width,$ie33=1;$ie33<=$e33;$ie33++){
        i2=$ie33;
        var $w34=cave[i1][i2];
        if((($w34.tptr>0))){
          if(((distance(i1,i2,char_row,char_col)>cur_dis))){
            flag=false;
            var $w35=t_list[$w34.tptr];
            switch($w35.tval){
              case 102:{
                if(($in($w35.subval,$S17))){
                  flag=true;
                }else if(((randint(4)===1))){
                  flag=true;
                }
                break;
              }
              case 103:{
                flag=true;
                break;
              }
              case 104:case 105:{
                if(((randint(4)===1))){
                  flag=true;
                }
                break;
              }
              case 107:case 108:{
                break;
              }
              default:{
                if(((randint(8)===1))){
                  flag=true;
                }
              }
            }
            if((flag)){
              $w34.fopen=true;
              $assign(t_list[$w34.tptr],blank_treasure);
              t_list[$w34.tptr].p1=tcptr;
              tcptr=$w34.tptr;
              $w34.tptr=0;
              ctr=(ctr+1);
            }
          }
        }
      }
    }
    if(((ctr===0))){
      cur_dis=(cur_dis-6);
    }
  }while(!(((ctr>0))));
  if(((cur_dis<66))){
    prt_map();
  }
}
/* Gives pointer to next free space			-RAK- */
function popt(x){
  var i1=0;
  if(((tcptr<1))){
    compact_objects();
  }
  x.v=tcptr;
  tcptr=t_list[x.v].p1;
}
/* Pushs a record back onto free space list		-RAK- */
function pusht(x){
  $assign(t_list[x],blank_treasure);
  t_list[x].p1=tcptr;
  tcptr=x;
}
/* Order the treasure list by level			-RAK- */
function sort_objects(){
  var i1=0;
  var i2=0;
  var i3=0;
  var gap=0;
  var tmp=({name_:"",tval:0,tchar:'\0',flags:0,p1:0,cost:0,subval:0,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:"",level:0});
  gap=$idiv(max_objects,2);
  while(((gap>0))){
    for(var $e37=max_objects,$ie37=(gap+1);$ie37<=$e37;$ie37++){
      i1=$ie37;
      i2=(i1-gap);
      while(((i2>0))){
        i3=(i2+gap);
        if(((object_list[i2].level>object_list[i3].level))){
          $assign(tmp,object_list[i2]);
          $assign(object_list[i2],object_list[i3]);
          $assign(object_list[i3],tmp);
        }else{
          i2=0;
        }
        i2=(i2-gap);
      }
    }
    gap=$idiv(gap,2);
  }
}
/* Chance of treasure having magic abilities		-RAK- */
/* Chance increases with each dungeon level */
function magic_treasure(x,level){
  var chance=0;
  var special=0;
  var cursed=0;
  var i1=0;
  /* Boolean : is object enchanted 	  -RAK- */
  function magik(chance){
    var $ret=false;
    if(((randint(100)<=chance))){
      $ret=true;
    }else{
      $ret=false;
    }
    return $ret;
  }
  /* Enchant a bonus based on degree desired -RAK- */
  function m_bonus(base,max_std,level){
    var $ret=0;
    var x=0;
    var stand_dev=0;
    stand_dev=(Math.trunc(Math.fround(obj_std_adj*level))+obj_std_min);
    if(((stand_dev>max_std))){
      stand_dev=max_std;
    }
    x=(Math.trunc(Math.fround($rdiv(Math.abs(randnor(0,stand_dev)),Math.fround(10.0))))+base);
    if(((x<base))){
      $ret=base;
    }else{
      $ret=x;
    }
    return $ret;
  }
  chance=(obj_base_magic+level);
  if(((chance>obj_base_max))){
    chance=obj_base_max;
  }
  special=Math.trunc(Math.fround($rdiv(chance,obj_div_special)));
  cursed=Math.trunc(Math.fround($rdiv(chance,obj_div_cursed)));
  var $w38=t_list[x];
  /* Depending on treasure type, it can have certain magical properties */
  switch($w38.tval){
    case 34:case 35:case 36:{
      /* Armor and shields */
      if((magik(chance))){
        $w38.toac=m_bonus(1,30,$w38.level);
        if((magik(special))){
          switch(randint(9)){
            case 1:{
              $w38.flags=(($w38.flags|37224448)>>>0);
              $w38.name_=$cap(($w38.name_+" (R)"),68);
              $w38.toac=($w38.toac+5);
              $w38.cost=($w38.cost+2500);
              break;
            }
            case 2:{
              /* Resist Acid */
              $w38.flags=(($w38.flags|1048576)>>>0);
              $w38.name_=$cap(($w38.name_+" (RA)"),68);
              $w38.cost=($w38.cost+1000);
              break;
            }
            case 3:case 4:{
              /* Resist Fire */
              $w38.flags=(($w38.flags|524288)>>>0);
              $w38.name_=$cap(($w38.name_+" (RF)"),68);
              $w38.cost=($w38.cost+600);
              break;
            }
            case 5:case 6:{
              /* Resist Cold */
              $w38.flags=(($w38.flags|2097152)>>>0);
              $w38.name_=$cap(($w38.name_+" (RC)"),68);
              $w38.cost=($w38.cost+600);
              break;
            }
            case 7:case 8:case 9:{
              /* Resist Lightning */
              $w38.flags=(($w38.flags|33554432)>>>0);
              $w38.name_=$cap(($w38.name_+" (RL)"),68);
              $w38.cost=($w38.cost+500);
              break;
            }
          }
        }
      }else if((magik(cursed))){
        $w38.toac=(-m_bonus(1,40,$w38.level));
        $w38.cost=0;
        $w38.flags=((2147483648|$w38.flags)>>>0);
      }
      break;
    }
    case 21:case 22:case 23:{
      /* Weapons */
      if((magik(chance))){
        $w38.tohit=m_bonus(0,40,$w38.level);
        $w38.todam=m_bonus(0,40,$w38.level);
        if((magik(special))){
          switch(randint(16)){
            case 1:{
              /* Holy Avenger */
              $w38.flags=(($w38.flags|21069825)>>>0);
              $w38.tohit=($w38.tohit+5);
              $w38.todam=($w38.todam+5);
              $w38.toac=randint(4);
              $w38.p1=(randint(4)-1);
              $w38.name_=$cap(($w38.name_+" (HA)"),68);
              $w38.cost=($w38.cost+($w38.p1*500));
              $w38.cost=($w38.cost+10000);
              break;
            }
            case 2:{
              /* Defender */
              $w38.flags=(($w38.flags|129501440)>>>0);
              $w38.tohit=($w38.tohit+3);
              $w38.todam=($w38.todam+3);
              $w38.toac=(5+randint(5));
              $w38.name_=$cap(($w38.name_+" [%P4] (DF)"),68);
              $w38.p1=randint(3);
              $w38.cost=($w38.cost+($w38.p1*500));
              $w38.cost=($w38.cost+7500);
              break;
            }
            case 3:case 4:{
              /* Slay Monster */
              $w38.flags=(($w38.flags|16793600)>>>0);
              $w38.tohit=($w38.tohit+3);
              $w38.todam=($w38.todam+3);
              $w38.name_=$cap(($w38.name_+" (SM)"),68);
              $w38.cost=($w38.cost+5000);
              break;
            }
            case 5:case 6:{
              /* Slay Dragon */
              $w38.flags=(($w38.flags|8192)>>>0);
              $w38.tohit=($w38.tohit+3);
              $w38.todam=($w38.todam+3);
              $w38.name_=$cap(($w38.name_+" (SD)"),68);
              $w38.cost=($w38.cost+4000);
              break;
            }
            case 7:case 8:{
              /* Slay Evil */
              $w38.flags=(($w38.flags|32768)>>>0);
              $w38.tohit=($w38.tohit+3);
              $w38.todam=($w38.todam+3);
              $w38.name_=$cap(($w38.name_+" (SE)"),68);
              $w38.cost=($w38.cost+4000);
              break;
            }
            case 9:case 10:{
              /* Slay Undead */
              $w38.flags=(($w38.flags|65536)>>>0);
              $w38.tohit=($w38.tohit+2);
              $w38.todam=($w38.todam+2);
              $w38.name_=$cap(($w38.name_+" (SU)"),68);
              $w38.cost=($w38.cost+3000);
              break;
            }
            case 11:case 12:case 13:{
              /* Flame Tongue */
              $w38.flags=(($w38.flags|262144)>>>0);
              $w38.tohit=($w38.tohit+1);
              $w38.todam=($w38.todam+3);
              $w38.name_=$cap(($w38.name_+" (FT)"),68);
              $w38.cost=($w38.cost+2000);
              break;
            }
            case 14:case 15:case 16:{
              /* Frost Brand */
              $w38.flags=(($w38.flags|131072)>>>0);
              $w38.tohit=($w38.tohit+1);
              $w38.todam=($w38.todam+1);
              $w38.name_=$cap(($w38.name_+" (FB)"),68);
              $w38.cost=($w38.cost+1200);
              break;
            }
          }
        }
      }else if((magik(cursed))){
        $w38.tohit=(-m_bonus(1,55,$w38.level));
        $w38.todam=(-m_bonus(1,55,$w38.level));
        $w38.flags=((2147483648|$w38.flags)>>>0);
        $w38.cost=0;
      }
      break;
    }
    case 20:{
      /* Bows, crossbows, and slings */
      if((magik(chance))){
        $w38.tohit=m_bonus(1,30,$w38.level);
      }else if((magik(cursed))){
        $w38.tohit=(-m_bonus(1,50,$w38.level));
        $w38.flags=((2147483648|$w38.flags)>>>0);
        $w38.cost=0;
      }
      break;
    }
    case 25:{
      /* Digging tools */
      if((magik(chance))){
        switch(randint(3)){
          case 1:case 2:{
            $w38.p1=m_bonus(2,25,$w38.level);
            $w38.cost=($w38.cost+($w38.p1*100));
            break;
          }
          case 3:{
            $w38.p1=(-m_bonus(1,30,$w38.level));
            $w38.cost=0;
            $w38.flags=((2147483648|$w38.flags)>>>0);
            break;
          }
        }
      }
      break;
    }
    case 31:{
      /* Gloves and Gauntlets */
      if((magik(chance))){
        $w38.toac=m_bonus(1,20,$w38.level);
        if((magik(special))){
          switch(randint(2)){
            case 1:{
              $w38.flags=((8388608|$w38.flags)>>>0);
              $w38.name_=$cap(($w38.name_+" of Free Action"),68);
              $w38.cost=($w38.cost+1000);
              break;
            }
            case 2:{
              $w38.tohit=(1+randint(3));
              $w38.todam=(1+randint(3));
              $w38.name_=$cap(($w38.name_+" of Slaying"),68);
              $w38.cost=($w38.cost+((($w38.tohit+$w38.todam))*250));
              break;
            }
          }
        }
      }else if((magik(cursed))){
        if((magik(special))){
          switch(randint(2)){
            case 1:{
              $w38.flags=((2147483650|$w38.flags)>>>0);
              $w38.name_=$cap(($w38.name_+" of Clumsiness"),68);
              $w38.p1=1;
              break;
            }
            case 2:{
              $w38.flags=((2147483649|$w38.flags)>>>0);
              $w38.name_=$cap(($w38.name_+" of Weakness"),68);
              $w38.p1=1;
              break;
            }
          }
        }
        $w38.toac=(-m_bonus(1,40,$w38.level));
        $w38.p1=(-m_bonus(1,10,$w38.level));
        $w38.flags=((2147483648|$w38.flags)>>>0);
        $w38.cost=0;
      }
      break;
    }
    case 30:{
      /* Boots */
      if((magik(chance))){
        $w38.toac=m_bonus(1,20,$w38.level);
        if((magik(special))){
          switch(randint(12)){
            case 1:{
              $w38.flags=((4096|$w38.flags)>>>0);
              $w38.name_=$cap(($w38.name_+" of Speed"),68);
              $w38.p1=1;
              $w38.cost=($w38.cost+5000);
              break;
            }
            case 2:case 3:case 4:case 5:{
              $w38.flags=((256|$w38.flags)>>>0);
              $w38.name_=$cap(($w38.name_+" of Stealth"),68);
              $w38.cost=($w38.cost+500);
              break;
            }
            default:{
              $w38.flags=((67108864|$w38.flags)>>>0);
              $w38.name_=$cap(($w38.name_+" of Slow descent"),68);
              $w38.cost=($w38.cost+250);
            }
          }
        }
      }else if((magik(cursed))){
        switch(randint(3)){
          case 1:{
            $w38.flags=((2147487744|$w38.flags)>>>0);
            $w38.name_=$cap(($w38.name_+" of Slowness"),68);
            $w38.p1=(-1);
            break;
          }
          case 2:{
            $w38.flags=((2147484160|$w38.flags)>>>0);
            $w38.name_=$cap(($w38.name_+" of Noise"),68);
            break;
          }
          case 3:{
            $w38.flags=((2147483648|$w38.flags)>>>0);
            $w38.name_=$cap(($w38.name_+" of Great Mass"),68);
            $w38.weight=($w38.weight*5);
            break;
          }
        }
        $w38.cost=0;
        $w38.ac=(-m_bonus(2,45,$w38.level));
      }
      break;
    }
    case 33:{
      /* Helms */
      if((magik(chance))){
        $w38.toac=m_bonus(1,20,$w38.level);
        if((magik(special))){
          switch($w38.subval){
            case 1:case 2:case 3:case 4:case 5:{
              switch(randint(3)){
                case 1:{
                  $w38.p1=randint(2);
                  $w38.flags=((8|$w38.flags)>>>0);
                  $w38.name_=$cap(($w38.name_+" of Intelligence"),68);
                  $w38.cost=($w38.cost+($w38.p1*500));
                  break;
                }
                case 2:{
                  $w38.p1=randint(2);
                  $w38.flags=((16|$w38.flags)>>>0);
                  $w38.name_=$cap(($w38.name_+" of Wisdom"),68);
                  $w38.cost=($w38.cost+($w38.p1*500));
                  break;
                }
                case 3:{
                  $w38.p1=(1+randint(4));
                  $w38.flags=((1073741824|$w38.flags)>>>0);
                  $w38.name_=$cap(($w38.name_+" of Infra-Vision"),68);
                  $w38.cost=($w38.cost+($w38.p1*250));
                  break;
                }
              }
              break;
            }
            case 6:case 7:case 8:{
              switch(randint(6)){
                case 1:{
                  $w38.p1=randint(3);
                  $w38.flags=((8388615|$w38.flags)>>>0);
                  $w38.name_=$cap(($w38.name_+" of Might"),68);
                  $w38.cost=(($w38.cost+1000)+($w38.p1*500));
                  break;
                }
                case 2:{
                  $w38.p1=randint(3);
                  $w38.flags=((48|$w38.flags)>>>0);
                  $w38.name_=$cap(($w38.name_+" of Lordliness"),68);
                  $w38.cost=(($w38.cost+1000)+($w38.p1*500));
                  break;
                }
                case 3:{
                  $w38.p1=randint(3);
                  $w38.flags=((20447240|$w38.flags)>>>0);
                  $w38.name_=$cap(($w38.name_+" of the Magi"),68);
                  $w38.cost=(($w38.cost+3000)+($w38.p1*500));
                  break;
                }
                case 4:{
                  $w38.p1=randint(3);
                  $w38.flags=((32|$w38.flags)>>>0);
                  $w38.name_=$cap(($w38.name_+" of Beauty"),68);
                  $w38.cost=($w38.cost+750);
                  break;
                }
                case 5:{
                  $w38.p1=(1+randint(4));
                  $w38.flags=((16777280|$w38.flags)>>>0);
                  $w38.name_=$cap(($w38.name_+" of Seeing"),68);
                  $w38.cost=(($w38.cost+1000)+($w38.p1*100));
                  break;
                }
                case 6:{
                  $w38.flags=((2048|$w38.flags)>>>0);
                  $w38.name_=$cap(($w38.name_+" of Regeneration"),68);
                  $w38.cost=($w38.cost+1500);
                  break;
                }
              }
              break;
            }
          }
        }
      }else if((magik(cursed))){
        $w38.toac=(-m_bonus(1,45,$w38.level));
        $w38.flags=((2147483648|$w38.flags)>>>0);
        $w38.cost=0;
        if((magik(special))){
          switch(randint(7)){
            case 1:{
              $w38.p1=(-1);
              $w38.flags=((8|$w38.flags)>>>0);
              $w38.name_=$cap(($w38.name_+" of Stupidity"),68);
              break;
            }
            case 2:{
              $w38.p1=(-1);
              $w38.flags=((16|$w38.flags)>>>0);
              $w38.name_=$cap(($w38.name_+" of Dullness"),68);
              break;
            }
            case 3:{
              $w38.flags=((134217728|$w38.flags)>>>0);
              $w38.name_=$cap(($w38.name_+" of Blindness"),68);
              break;
            }
            case 4:{
              $w38.flags=((268435456|$w38.flags)>>>0);
              $w38.name_=$cap(($w38.name_+" of Timidness"),68);
              break;
            }
            case 5:{
              $w38.p1=(-1);
              $w38.flags=((1|$w38.flags)>>>0);
              $w38.name_=$cap(($w38.name_+" of Weakness"),68);
              break;
            }
            case 6:{
              $w38.flags=((1024|$w38.flags)>>>0);
              $w38.name_=$cap(($w38.name_+" of Teleportation"),68);
              break;
            }
            case 7:{
              $w38.p1=(-1);
              $w38.flags=((32|$w38.flags)>>>0);
              $w38.name_=$cap(($w38.name_+" of Ugliness"),68);
              break;
            }
          }
        }
        $w38.p1=($w38.p1*randint(5));
      }
      break;
    }
    case 45:{
      /* Rings */
      switch($w38.subval){
        case 1:case 2:case 3:case 4:case 5:case 6:{
          if((magik(cursed))){
            $w38.p1=(-m_bonus(1,20,$w38.level));
            $w38.flags=((2147483648|$w38.flags)>>>0);
            $w38.cost=(-$w38.cost);
          }else{
            $w38.p1=m_bonus(1,10,$w38.level);
            $w38.cost=($w38.cost+($w38.p1*100));
          }
          break;
        }
        case 7:{
          if((magik(cursed))){
            $w38.p1=(-randint(3));
            $w38.flags=((2147483648|$w38.flags)>>>0);
            $w38.cost=(-$w38.cost);
          }else{
            $w38.p1=1;
          }
          break;
        }
        case 8:{
          $w38.p1=(5*m_bonus(1,20,$w38.level));
          $w38.cost=($w38.cost+($w38.p1*100));
          break;
        }
        case 22:{
          /* Increase damage */
          $w38.todam=m_bonus(1,20,$w38.level);
          $w38.cost=($w38.cost+($w38.todam*100));
          if((magik(cursed))){
            $w38.todam=(-$w38.todam);
            $w38.flags=((2147483648|$w38.flags)>>>0);
            $w38.cost=(-$w38.cost);
          }
          break;
        }
        case 23:{
          /* Increase To-Hit */
          $w38.tohit=m_bonus(1,20,$w38.level);
          $w38.cost=($w38.cost+($w38.todam*100));
          if((magik(cursed))){
            $w38.tohit=(-$w38.tohit);
            $w38.flags=((2147483648|$w38.flags)>>>0);
            $w38.cost=(-$w38.cost);
          }
          break;
        }
        case 24:{
          /* Protection */
          $w38.toac=m_bonus(1,20,$w38.level);
          $w38.cost=($w38.cost+($w38.todam*100));
          if((magik(cursed))){
            $w38.toac=(-$w38.toac);
            $w38.flags=((2147483648|$w38.flags)>>>0);
            $w38.cost=(-$w38.cost);
          }
          break;
        }
        case 33:{
          /* Slaying */
          $w38.todam=m_bonus(1,25,$w38.level);
          $w38.tohit=m_bonus(1,25,$w38.level);
          $w38.cost=($w38.cost+((($w38.tohit+$w38.todam))*100));
          if((magik(cursed))){
            $w38.tohit=(-$w38.tohit);
            $w38.todam=(-$w38.todam);
            $w38.flags=((2147483648|$w38.flags)>>>0);
            $w38.cost=(-$w38.cost);
          }
          break;
        }
        default:{
        }
      }
      break;
    }
    case 40:{
      /* Amulets */
      switch($w38.subval){
        case 1:case 2:case 3:case 4:case 5:case 6:{
          if((magik(cursed))){
            $w38.p1=(-m_bonus(1,20,$w38.level));
            $w38.flags=((2147483648|$w38.flags)>>>0);
            $w38.cost=(-$w38.cost);
          }else{
            $w38.p1=m_bonus(1,10,$w38.level);
            $w38.cost=($w38.cost+($w38.p1*100));
          }
          break;
        }
        case 7:{
          $w38.p1=(5*m_bonus(1,25,$w38.level));
          if((magik(cursed))){
            $w38.p1=(-$w38.p1);
            $w38.cost=(-$w38.cost);
            $w38.flags=((2147483648|$w38.flags)>>>0);
          }else{
            $w38.cost=($w38.cost+(100*$w38.p1));
          }
          break;
        }
        default:{
        }
      }
      break;
    }
    case 15:{
      /* Subval should be even for store, odd for dungeon */
      /* Dungeon found ones will be partially charged */
      /* Lamps and torches */
      if(((($mod($w38.subval,2))===1))){
        $w38.p1=randint($w38.p1);
      }
      break;
    }
    case 65:{
      /* Wands */
      switch($w38.subval){
        case 1:{
          $w38.p1=(randint(10)+6);
          break;
        }
        case 2:{
          $w38.p1=(randint(8)+6);
          break;
        }
        case 3:{
          $w38.p1=(randint(5)+6);
          break;
        }
        case 4:{
          $w38.p1=(randint(8)+6);
          break;
        }
        case 5:{
          $w38.p1=(randint(4)+3);
          break;
        }
        case 6:{
          $w38.p1=(randint(8)+6);
          break;
        }
        case 7:{
          $w38.p1=(randint(20)+12);
          break;
        }
        case 8:{
          $w38.p1=(randint(20)+12);
          break;
        }
        case 9:{
          $w38.p1=(randint(10)+6);
          break;
        }
        case 10:{
          $w38.p1=(randint(12)+6);
          break;
        }
        case 11:{
          $w38.p1=(randint(10)+12);
          break;
        }
        case 12:{
          $w38.p1=(randint(3)+3);
          break;
        }
        case 13:{
          $w38.p1=(randint(8)+6);
          break;
        }
        case 14:{
          $w38.p1=(randint(10)+6);
          break;
        }
        case 15:{
          $w38.p1=(randint(5)+3);
          break;
        }
        case 16:{
          $w38.p1=(randint(5)+3);
          break;
        }
        case 17:{
          $w38.p1=(randint(5)+6);
          break;
        }
        case 18:{
          $w38.p1=(randint(5)+4);
          break;
        }
        case 19:{
          $w38.p1=(randint(8)+4);
          break;
        }
        case 20:{
          $w38.p1=(randint(6)+2);
          break;
        }
        case 21:{
          $w38.p1=(randint(4)+2);
          break;
        }
        case 22:{
          $w38.p1=(randint(8)+6);
          break;
        }
        case 23:{
          $w38.p1=(randint(5)+2);
          break;
        }
        case 24:{
          $w38.p1=(randint(12)+12);
          break;
        }
        default:{
        }
      }
      break;
    }
    case 55:{
      /* Staffs */
      switch($w38.subval){
        case 1:{
          $w38.p1=(randint(20)+12);
          break;
        }
        case 2:{
          $w38.p1=(randint(8)+6);
          break;
        }
        case 3:{
          $w38.p1=(randint(5)+6);
          break;
        }
        case 4:{
          $w38.p1=(randint(20)+12);
          break;
        }
        case 5:{
          $w38.p1=(randint(15)+6);
          break;
        }
        case 6:{
          $w38.p1=(randint(4)+5);
          break;
        }
        case 7:{
          $w38.p1=(randint(5)+3);
          break;
        }
        case 8:{
          $w38.p1=(randint(3)+1);
          break;
        }
        case 9:{
          $w38.p1=(randint(3)+1);
          break;
        }
        case 10:{
          $w38.p1=(randint(3)+1);
          break;
        }
        case 11:{
          $w38.p1=(randint(5)+6);
          break;
        }
        case 12:{
          $w38.p1=(randint(10)+12);
          break;
        }
        case 13:{
          $w38.p1=(randint(5)+6);
          break;
        }
        case 14:{
          $w38.p1=(randint(5)+6);
          break;
        }
        case 15:{
          $w38.p1=(randint(5)+6);
          break;
        }
        case 16:{
          $w38.p1=(randint(10)+12);
          break;
        }
        case 17:{
          $w38.p1=(randint(3)+4);
          break;
        }
        case 18:{
          $w38.p1=(randint(5)+6);
          break;
        }
        case 19:{
          $w38.p1=(randint(5)+6);
          break;
        }
        case 20:{
          $w38.p1=(randint(3)+4);
          break;
        }
        case 21:{
          $w38.p1=(randint(10)+12);
          break;
        }
        case 22:{
          $w38.p1=(randint(3)+4);
          break;
        }
        case 23:{
          $w38.p1=(randint(3)+4);
          break;
        }
        case 24:{
          $w38.p1=(randint(3)+1);
          break;
        }
        case 25:{
          $w38.p1=(randint(10)+6);
          break;
        }
        default:{
        }
      }
      break;
    }
    case 32:{
      /* Cloaks */
      if((magik(chance))){
        if((magik(special))){
          switch(randint(2)){
            case 1:{
              $w38.name_=$cap(($w38.name_+" of Protection"),68);
              $w38.toac=m_bonus(2,40,$w38.level);
              $w38.cost=(($w38.cost+250)+($w38.toac*100));
              break;
            }
            case 2:{
              $w38.toac=m_bonus(1,20,$w38.level);
              $w38.p1=randint(3);
              $w38.flags=((256|$w38.flags)>>>0);
              $w38.name_=$cap(($w38.name_+" of Stealth (%P1)"),68);
              $w38.cost=(($w38.cost+($w38.p1*500))+($w38.toac*100));
              break;
            }
          }
        }else{
          $w38.toac=m_bonus(1,20,$w38.level);
          $w38.cost=(($w38.cost+$w38.toac)+100);
        }
      }else if((magik(cursed))){
        switch(randint(3)){
          case 1:{
            $w38.flags=((2147484160|$w38.flags)>>>0);
            $w38.name_=$cap(($w38.name_+" of Irritation"),68);
            $w38.ac=0;
            $w38.toac=(-m_bonus(1,10,$w38.level));
            $w38.tohit=(-m_bonus(1,10,$w38.level));
            $w38.todam=(-m_bonus(1,10,$w38.level));
            $w38.cost=0;
            break;
          }
          case 2:{
            $w38.flags=((2147483648|$w38.flags)>>>0);
            $w38.name_=$cap(($w38.name_+" of Vulnerability"),68);
            $w38.ac=0;
            $w38.toac=(-m_bonus(10,100,($w38.level+50)));
            $w38.cost=0;
            break;
          }
          case 3:{
            $w38.flags=((2147483648|$w38.flags)>>>0);
            $w38.name_=$cap(($w38.name_+" of Enveloping"),68);
            $w38.toac=(-m_bonus(1,10,$w38.level));
            $w38.tohit=(-m_bonus(2,40,($w38.level+10)));
            $w38.todam=(-m_bonus(2,40,($w38.level+10)));
            $w38.cost=0;
            break;
          }
        }
      }
      break;
    }
    case 2:{
      /* Chests */
      switch(((randint($w38.level)+4))){
        case 1:{
          $w38.name_=$cap(($w38.name_+"^ (Empty)"),68);
          break;
        }
        case 2:{
          $w38.flags=((1|$w38.flags)>>>0);
          $w38.name_=$cap(($w38.name_+"^ (Locked)"),68);
          break;
        }
        case 3:case 4:{
          $w38.flags=((17|$w38.flags)>>>0);
          $w38.name_=$cap(($w38.name_+"^ (Poison Needle)"),68);
          break;
        }
        case 5:case 6:{
          $w38.flags=((33|$w38.flags)>>>0);
          $w38.name_=$cap(($w38.name_+"^ (Poison Needle)"),68);
          break;
        }
        case 7:case 8:case 9:{
          $w38.flags=((65|$w38.flags)>>>0);
          $w38.name_=$cap(($w38.name_+"^ (Gas Trap)"),68);
          break;
        }
        case 10:case 11:{
          $w38.flags=((129|$w38.flags)>>>0);
          $w38.name_=$cap(($w38.name_+"^ (Explosion Device)"),68);
          break;
        }
        case 12:case 13:case 14:{
          $w38.flags=((257|$w38.flags)>>>0);
          $w38.name_=$cap(($w38.name_+"^ (Summoning Runes)"),68);
          break;
        }
        case 15:case 16:case 17:{
          $w38.flags=((113|$w38.flags)>>>0);
          $w38.name_=$cap(($w38.name_+"^ (Multiple Traps)"),68);
          break;
        }
        default:{
          $w38.flags=((385|$w38.flags)>>>0);
          $w38.name_=$cap(($w38.name_+"^ (Multiple Traps)"),68);
        }
      }
      break;
    }
    case 10:case 11:case 12:case 13:{
      /* Arrows, bolts, ammo, and spikes */
      if(($in($w38.tval,$S18))){
        if((magik(chance))){
          $w38.tohit=m_bonus(1,35,$w38.level);
          $w38.todam=m_bonus(1,35,$w38.level);
          if((magik(special))){
            switch($w38.tval){
              case 11:case 12:{
                /* CASE 1 */
                switch(randint(10)){
                  case 1:case 2:case 3:{
                    /* CASE 2 */
                    $w38.name_=$cap(($w38.name_+" of Slaying"),68);
                    $w38.tohit=($w38.tohit+5);
                    $w38.todam=($w38.todam+5);
                    $w38.cost=($w38.cost+20);
                    break;
                  }
                  case 4:case 5:{
                    $w38.flags=(($w38.flags|262144)>>>0);
                    $w38.tohit=($w38.tohit+2);
                    $w38.todam=($w38.todam+4);
                    $w38.name_=$cap(($w38.name_+" of Fire"),68);
                    $w38.cost=($w38.cost+25);
                    break;
                  }
                  case 6:case 7:{
                    $w38.flags=(($w38.flags|32768)>>>0);
                    $w38.tohit=($w38.tohit+3);
                    $w38.todam=($w38.todam+3);
                    $w38.name_=$cap(($w38.name_+" of Slay Evil"),68);
                    $w38.cost=($w38.cost+25);
                    break;
                  }
                  case 8:case 9:{
                    $w38.flags=(($w38.flags|16793600)>>>0);
                    $w38.tohit=($w38.tohit+2);
                    $w38.todam=($w38.todam+2);
                    $w38.name_=$cap(($w38.name_+" of Slay Monster"),68);
                    $w38.cost=($w38.cost+30);
                    break;
                  }
                  case 10:{
                    $w38.flags=(($w38.flags|8192)>>>0);
                    $w38.tohit=($w38.tohit+10);
                    $w38.todam=($w38.todam+10);
                    $w38.name_=$cap(($w38.name_+" of Dragon Slaying"),68);
                    $w38.cost=($w38.cost+35);
                    break;
                  }
                }
                break;
              }
              default:{
              }
            }
          }
        /* CASE 2 */
        /* CASE 1 */
        }else if((magik(cursed))){
          $w38.tohit=(-m_bonus(5,55,$w38.level));
          $w38.todam=(-m_bonus(5,55,$w38.level));
          $w38.flags=((2147483648|$w38.flags)>>>0);
          $w38.cost=0;
        }
      }
      $w38.number=0;
      for(var $e59=7,$ie59=1;$ie59<=$e59;$ie59++){
        i1=$ie59;
        $w38.number=($w38.number+randint(6));
      }
      missle_ctr=(missle_ctr+1);
      if(((missle_ctr>65534))){
        missle_ctr=1;
      }
      $w38.subval=(missle_ctr+512);
      break;
    }
    default:{
    }
  }
}
/* Places a particular trap at location y,x		-RAK- */
function place_trap(y,x,typ,subval){
  var cur_pos=0;
  var cur_trap=({name_:"",tval:0,tchar:'\0',flags:0,p1:0,cost:0,subval:0,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:"",level:0});
  if(((typ===1))){
    $assign(cur_trap,trap_lista[subval]);
  }else{
    $assign(cur_trap,trap_listb[subval]);
  }
  popt({get v(){return cur_pos},set v($x){cur_pos=$x}});
  cave[y][x].tptr=cur_pos;
  $assign(t_list[cur_pos],cur_trap);
}
/* Places rubble at location y,x 			-RAK- */
function place_rubble(y,x){
  var cur_pos=0;
  popt({get v(){return cur_pos},set v($x){cur_pos=$x}});
  var $w61=cave[y][x];
  $w61.tptr=cur_pos;
  $w61.fopen=false;
  $assign(t_list[cur_pos],rubble);
}
function place_open_door(y,x){
  var cur_pos=0;
  popt({get v(){return cur_pos},set v($x){cur_pos=$x}});
  var $w62=cave[y][x];
  $w62.tptr=cur_pos;
  $assign(t_list[cur_pos],door_list[1]);
  $w62.fval=((corr_floor3.ftval)&15);
  $w62.fopen=true;
}
function place_broken_door(y,x){
  var cur_pos=0;
  popt({get v(){return cur_pos},set v($x){cur_pos=$x}});
  var $w63=cave[y][x];
  $w63.tptr=cur_pos;
  $assign(t_list[cur_pos],door_list[1]);
  $w63.fval=((corr_floor3.ftval)&15);
  $w63.fopen=true;
  t_list[cur_pos].p1=1;
}
function place_closed_door(y,x){
  var cur_pos=0;
  popt({get v(){return cur_pos},set v($x){cur_pos=$x}});
  var $w64=cave[y][x];
  $w64.tptr=cur_pos;
  $assign(t_list[cur_pos],door_list[2]);
  $w64.fval=((corr_floor3.ftval)&15);
  $w64.fopen=false;
}
function place_locked_door(y,x){
  var cur_pos=0;
  popt({get v(){return cur_pos},set v($x){cur_pos=$x}});
  var $w65=cave[y][x];
  $w65.tptr=cur_pos;
  $assign(t_list[cur_pos],door_list[2]);
  $w65.fval=((corr_floor3.ftval)&15);
  $w65.fopen=false;
  t_list[cur_pos].p1=(randint(10)+10);
}
function place_stuck_door(y,x){
  var cur_pos=0;
  popt({get v(){return cur_pos},set v($x){cur_pos=$x}});
  var $w66=cave[y][x];
  $w66.tptr=cur_pos;
  $assign(t_list[cur_pos],door_list[2]);
  $w66.fval=((corr_floor3.ftval)&15);
  $w66.fopen=false;
  t_list[cur_pos].p1=((-randint(10))-10);
}
function place_secret_door(y,x){
  var cur_pos=0;
  popt({get v(){return cur_pos},set v($x){cur_pos=$x}});
  var $w67=cave[y][x];
  $w67.tptr=cur_pos;
  $assign(t_list[cur_pos],door_list[3]);
  $w67.fval=((corr_floor4.ftval)&15);
  $w67.fopen=false;
}
function place_door(y,x){
  var cur_pos=0;
  switch(randint(3)){
    case 1:{
      switch(randint(4)){
        case 1:{
          place_broken_door(y,x);
          break;
        }
        default:{
          place_open_door(y,x);
        }
      }
      break;
    }
    case 2:{
      switch(randint(12)){
        case 1:case 2:{
          place_locked_door(y,x);
          break;
        }
        case 3:{
          place_stuck_door(y,x);
          break;
        }
        default:{
          place_closed_door(y,x);
        }
      }
      break;
    }
    case 3:{
      place_secret_door(y,x);
      break;
    }
  }
}
/* Place an up staircase at given y,x			-RAK- */
function place_up_stairs(y,x){
  var cur_pos=0;
  var $w71=cave[y][x];
  if((($w71.tptr!==0))){
    pusht($w71.tptr);
    $w71.tptr=0;
    $w71.fopen=true;
  }
  popt({get v(){return cur_pos},set v($x){cur_pos=$x}});
  cave[y][x].tptr=cur_pos;
  $assign(t_list[cur_pos],up_stair);
}
/* Place a down staircase at given y,x			-RAK- */
function place_down_stairs(y,x){
  var cur_pos=0;
  var $w72=cave[y][x];
  if((($w72.tptr!==0))){
    pusht($w72.tptr);
    $w72.tptr=0;
    $w72.fopen=true;
  }
  popt({get v(){return cur_pos},set v($x){cur_pos=$x}});
  cave[y][x].tptr=cur_pos;
  $assign(t_list[cur_pos],down_stair);
}
/* Places a staircase 1=up, 2=down			-RAK- */
function place_stairs(typ,num,walls){
  var i1=0;
  var i2=0;
  var y1=0;
  var x1=0;
  var y2=0;
  var x2=0;
  var flag=false;
  for(var $e73=num,$ie73=1;$ie73<=$e73;$ie73++){
    i1=$ie73;
    flag=false;
    do{
      i2=0;
      do{
        y1=randint((cur_height-12));
        x1=randint((cur_width-12));
        y2=(y1+12);
        x2=(x1+12);
        do{
          do{
            var $w74=cave[y1][x1];
            if(($in($w74.fval,$S15))){
              if((($w74.tptr===0))){
                if(((next_to4(y1,x1,wall_set)>=walls))){
                  flag=true;
                  switch(typ){
                    case 1:{
                      place_up_stairs(y1,x1);
                      break;
                    }
                    case 2:{
                      place_down_stairs(y1,x1);
                      break;
                    }
                  }
                }
              }
            }
            x1=(x1+1);
          }while(!(((((x1===x2))||(flag)))));
          x1=(x2-12);
          y1=(y1+1);
        }while(!(((((y1===y2))||(flag)))));
        i2=(i2+1);
      }while(!((((flag)||((i2>30))))));
      walls=(walls-1);
    }while(!((flag)));
  }
}
/* Places a treasure (Gold or Gems) at given row, column -RAK- */
function place_gold(y,x){
  var cur_pos=0;
  var i1=0;
  popt({get v(){return cur_pos},set v($x){cur_pos=$x}});
  i1=Math.trunc(Math.fround($rdiv(((randint((dun_level+2))+2)),Math.fround(2.0))));
  if(((randint(obj_great)===1))){
    i1=(i1+randint(dun_level));
  }
  if(((i1>max_gold))){
    i1=max_gold;
  }
  cave[y][x].tptr=cur_pos;
  $assign(t_list[cur_pos],gold_list[i1]);
  var $w76=t_list[cur_pos];
  $w76.cost=(randint((8*$w76.cost))+$w76.cost);
}
/* Returns the array number of a random object		-RAK- */
function get_obj_num(level){
  var $ret=0;
  var i1=0;
  if(((level>max_obj_level))){
    level=max_obj_level;
  }
  if(((randint(obj_great)===1))){
    level=max_obj_level;
  }
  if(((level===0))){
    i1=randint(t_level[0]);
  }else{
    i1=randint(t_level[level]);
  }
  $ret=i1;
  return $ret;
}
/* Places an object at given row, column co-ordinate	-RAK- */
function place_object(y,x){
  var cur_pos=0;
  var mag1=0;
  var mag2=0;
  popt({get v(){return cur_pos},set v($x){cur_pos=$x}});
  cave[y][x].tptr=cur_pos;
  $assign(t_list[cur_pos],object_list[get_obj_num(dun_level)]);
  magic_treasure(cur_pos,dun_level);
}
/* Allocates an object for tunnels and rooms		-RAK- */
function alloc_object(alloc_set,typ,num){
  var i1=0;
  var i2=0;
  var i3=0;
  for(var $e77=num,$ie77=1;$ie77<=$e77;$ie77++){
    i3=$ie77;
    do{
      i1=randint(cur_height);
      i2=randint(cur_width);
    }while(!(((($in(cave[i1][i2].fval,alloc_set))&&((cave[i1][i2].tptr===0))))));
    switch(typ){
      case 1:{
        place_trap(i1,i2,1,randint(max_trapa));
        break;
      }
      case 2:{
        place_trap(i1,i2,2,randint(max_trapb));
        break;
      }
      case 3:{
        place_rubble(i1,i2);
        break;
      }
      case 4:{
        place_gold(i1,i2);
        break;
      }
      case 5:{
        place_object(i1,i2);
        break;
      }
    }
  }
}
/* Creates objects nearby the coordinates given		-RAK- */
function random_object(y,x,num){
  var i1=0;
  var i2=0;
  var i3=0;
  do{
    i1=0;
    do{
      i2=((y-3)+randint(5));
      i3=((x-4)+randint(7));
      var $w79=cave[i2][i3];
      if(($in($w79.fval,floor_set))){
        if((($w79.tptr===0))){
          if(((randint(100)<75))){
            place_object(i2,i3);
          }else{
            place_gold(i2,i3);
          }
          i1=9;
        }
      }
      i1=(i1+1);
    }while(!(((i1>10))));
    num=(num-1);
  }while(!(((num===0))));
}
/* Converts stat num into string 			-RAK- */
function cnv_stat(stat,out_val){
  var tmp_str="";
  var part1=0;
  var part2=0;
  if(((stat>18))){
    part1=18;
    part2=(stat-18);
    tmp_str=$cap($wi(part1,2)+$ws("/",0)+$wi(part2,1),80);
  }else{
    tmp_str=$cap($wi(stat,2),80);
  }
  if(((tmp_str.length<6))){
    tmp_str=$cap($pad(tmp_str," ",6),80);
  }
  out_val.v=$fix(tmp_str,6);
}
/* Print character stat in given row, column		-RAK- */
function prt_stat(stat_name,stat,row,column){
  var out_val1="";
  var out_val2="";
  cnv_stat(stat,{get v(){return out_val1},set v($x){out_val1=$x}});
  out_val2=$cap((stat_name+out_val1),80);
  put_buffer(out_val2,row,column);
}
/* Print character info in given row, column		-RAK- */
function prt_field(info,row,column){
  var out_val1="";
  var out_val2="";
  put_buffer($pad(info," ",14),row,column);
}
/* Print number with header at given row, column 	-RAK- */
function prt_num(header,num,row,column){
  var out_val="";
  out_val=$cap($ws(header,0)+$wi(num,1)+$ws(" ",0),80);
  put_buffer(out_val,row,column);
}
/* Adjustment for wisdom 				-JWT- */
function wis_adj(){
  var $ret=0;
  if(((py.stat.cwis>117))){
    $ret=7;
  }else if(((py.stat.cwis>107))){
    $ret=6;
  }else if(((py.stat.cwis>87))){
    $ret=5;
  }else if(((py.stat.cwis>67))){
    $ret=4;
  }else if(((py.stat.cwis>17))){
    $ret=3;
  }else if(((py.stat.cwis>14))){
    $ret=2;
  }else if(((py.stat.cwis>7))){
    $ret=1;
  }else{
    $ret=0;
  }
  return $ret;
}
/* adjustment for intellegence				-JWT- */
function int_adj(){
  var $ret=0;
  if(((py.stat.cint>117))){
    $ret=7;
  }else if(((py.stat.cint>107))){
    $ret=6;
  }else if(((py.stat.cint>87))){
    $ret=5;
  }else if(((py.stat.cint>67))){
    $ret=4;
  }else if(((py.stat.cint>17))){
    $ret=3;
  }else if(((py.stat.cint>14))){
    $ret=2;
  }else if(((py.stat.cint>7))){
    $ret=1;
  }else{
    $ret=0;
  }
  return $ret;
}
/* Adjustment for charisma				-RAK- */
/* Percent decrease or increase in price of goods */
function chr_adj(){
  var $ret=0;
  if(((py.stat.cchr>117))){
    $ret=(-Math.fround(0.10));
  }else if(((py.stat.cchr>107))){
    $ret=(-Math.fround(0.08));
  }else if(((py.stat.cchr>87))){
    $ret=(-Math.fround(0.06));
  }else if(((py.stat.cchr>67))){
    $ret=(-Math.fround(0.04));
  }else if(((py.stat.cchr>18))){
    $ret=(-Math.fround(0.02));
  }else{
    switch(py.stat.cchr){
      case 18:{
        $ret=Math.fround(0.00);
        break;
      }
      case 17:{
        $ret=Math.fround(0.01);
        break;
      }
      case 16:{
        $ret=Math.fround(0.02);
        break;
      }
      case 15:{
        $ret=Math.fround(0.03);
        break;
      }
      case 14:{
        $ret=Math.fround(0.04);
        break;
      }
      case 13:{
        $ret=Math.fround(0.06);
        break;
      }
      case 12:{
        $ret=Math.fround(0.08);
        break;
      }
      case 11:{
        $ret=Math.fround(0.10);
        break;
      }
      case 10:{
        $ret=Math.fround(0.12);
        break;
      }
      case 9:{
        $ret=Math.fround(0.14);
        break;
      }
      case 8:{
        $ret=Math.fround(0.16);
        break;
      }
      case 7:{
        $ret=Math.fround(0.18);
        break;
      }
      case 6:{
        $ret=Math.fround(0.20);
        break;
      }
      case 5:{
        $ret=Math.fround(0.22);
        break;
      }
      case 4:{
        $ret=Math.fround(0.24);
        break;
      }
      case 3:{
        $ret=Math.fround(0.25);
        break;
      }
      default:{
        $ret=Math.fround(0.00);
      }
    }
  }
  return $ret;
}
/* Error trap */
/* Returns a character's adjustment to hit points        -JWT- */
function con_adj(){
  var $ret=0;
  var $w81=py.stat;
  if((($w81.ccon===3))){
    $ret=(-4);
  }else if((($w81.ccon===4))){
    $ret=(-3);
  }else if((($w81.ccon===5))){
    $ret=(-2);
  }else if((($w81.ccon===6))){
    $ret=(-1);
  }else if((($w81.ccon<17))){
    $ret=0;
  }else if((($w81.ccon===17))){
    $ret=1;
  }else if((($w81.ccon<94))){
    $ret=2;
  }else if((($w81.ccon<117))){
    $ret=3;
  }else{
    $ret=4;
  }
  return $ret;
}
/* Calculates hit points for each level that is gained.	-RAK- */
function get_hitdie(){
  var $ret=0;
  var i1=0;
  $ret=(randint(py.misc.hitdie)+con_adj());
  return $ret;
}
/* Prints title of character				-RAK- */
function prt_title(){
  prt_field(py.misc.title,5,stat_column);
}
/* Prints strength					-RAK- */
function prt_strength(){
  prt_stat("",py.stat.cstr,7,(stat_column+6));
}
/* Prints intelligence					-RAK- */
function prt_intelligence(){
  prt_stat("",py.stat.cint,8,(stat_column+6));
}
/* Prints wisdom 					-RAK- */
function prt_wisdom(){
  prt_stat("",py.stat.cwis,9,(stat_column+6));
}
/* Prints dexterity					-RAK- */
function prt_dexterity(){
  prt_stat("",py.stat.cdex,10,(stat_column+6));
}
/* Prints constitution					-RAK- */
function prt_constitution(){
  prt_stat("",py.stat.ccon,11,(stat_column+6));
}
/* Prints charisma					-RAK- */
function prt_charisma(){
  prt_stat("",py.stat.cchr,12,(stat_column+6));
}
/* Prints level						-RAK- */
function prt_level(){
  prt_num("",py.misc.lev,14,(stat_column+6));
}
/* Prints players current mana points (a real number...) -RAK- */
function prt_cmana(){
  prt_num("",Math.trunc(py.misc.cmana),16,(stat_column+6));
}
/* Prints Max hit points 				-RAK- */
function prt_mhp(){
  prt_num("",py.misc.mhp,17,(stat_column+6));
}
/* Prints players current hit points (a real number...)	-RAK- */
function prt_chp(){
  prt_num("",Math.trunc(py.misc.chp),18,(stat_column+6));
}
/* prints current AC					-RAK- */
function prt_pac(){
  prt_num("",py.misc.dis_ac,20,(stat_column+6));
}
/* Prints current gold					-RAK- */
function prt_gold(){
  prt_num("",py.misc.au,21,(stat_column+6));
}
/* Prints depth in stat area				-RAK- */
function prt_depth(){
  var depths="";
  var depth=0;
  depth=(dun_level*50);
  if(((depth===0))){
    depths=$cap("Town level",80);
  }else{
    depths=$cap($ws("Depth: ",0)+$wi(depth,1)+$ws(" (feet)",0),80);
  }
  prt(depths,24,61);
}
/* Prints status of hunger				-RAK- */
function prt_hunger(){
  if(((((2&py.flags.status)>>>0)!==0))){
    put_buffer("Weak    ",24,1);
  }else if(((((1&py.flags.status)>>>0)!==0))){
    put_buffer("Hungry  ",24,1);
  }else{
    put_buffer("        ",24,1);
  }
}
/* Prints Blind status					-RAK- */
function prt_blind(){
  if(((((4&py.flags.status)>>>0)!==0))){
    put_buffer("Blind  ",24,9);
  }else{
    put_buffer("       ",24,9);
  }
}
/* Prints Confusion status				-RAK- */
function prt_confused(){
  if(((((8&py.flags.status)>>>0)!==0))){
    put_buffer("Confused  ",24,16);
  }else{
    put_buffer("          ",24,16);
  }
}
/* Prints Fear status					-RAK- */
function prt_afraid(){
  if(((((16&py.flags.status)>>>0)!==0))){
    put_buffer("Afraid  ",24,26);
  }else{
    put_buffer("        ",24,26);
  }
}
/* Prints Poisoned status				-RAK- */
function prt_poisoned(){
  if(((((32&py.flags.status)>>>0)!==0))){
    put_buffer("Poisoned  ",24,34);
  }else{
    put_buffer("          ",24,34);
  }
}
/* Prints Searching status				-RAK- */
function prt_search(){
  if(((((256&py.flags.status)>>>0)!==0))){
    put_buffer("Searching  ",24,44);
  }else{
    put_buffer("           ",24,44);
  }
}
/* Prints Resting status 				-RAK- */
function prt_rest(){
  if(((((512&py.flags.status)>>>0)!==0))){
    put_buffer("Resting    ",24,44);
  }else{
    put_buffer("           ",24,44);
  }
}
/* Prints winner status on display			-RAK- */
function prt_winner(){
  put_buffer("*Winner*",23,1);
}
/* Increases a stat by one randomized level		-RAK- */
function in_statp(stat){
  var $ret=0;
  if(((stat<18))){
    stat=(stat+1);
  }else if(((stat<88))){
    stat=(stat+randint(25));
  }else if(((stat<108))){
    stat=(stat+randint(10));
  }else{
    stat=(stat+1);
  }
  if(((stat>118))){
    stat=118;
  }
  $ret=stat;
  return $ret;
}
/* Decreases a stat by one randomized level		-RAK- */
function de_statp(stat){
  var $ret=0;
  if(((stat<19))){
    stat=(stat-1);
  }else if(((stat<109))){
    stat=((stat-randint(10))-5);
    if(((stat<18))){
      stat=18;
    }
  }else{
    stat=(stat-randint(3));
  }
  if(((stat<3))){
    stat=3;
  }
  $ret=stat;
  return $ret;
}
/* Increases a stat by one true level			-RAK- */
function in_statt(stat){
  var $ret=0;
  if(((stat<18))){
    stat=(stat+1);
  }else{
    stat=(stat+10);
    if(((stat>118))){
      stat=118;
    }
  }
  $ret=stat;
  return $ret;
}
/* Decreases a stat by true level			-RAK- */
function de_statt(stat){
  var $ret=0;
  if(((stat>27))){
    stat=(stat-10);
  }else if(((stat>18))){
    stat=18;
  }else{
    stat=(stat-1);
    if(((stat<3))){
      stat=3;
    }
  }
  $ret=stat;
  return $ret;
}
/* Returns a character's adjustment to hit.              -JWT- */
function tohit_adj(){
  var $ret=0;
  var total=0;
  var $w82=py.stat;
  if((($w82.cdex<4))){
    total=(-3);
  }else if((($w82.cdex<6))){
    total=(-2);
  }else if((($w82.cdex<8))){
    total=(-1);
  }else if((($w82.cdex<16))){
    total=0;
  }else if((($w82.cdex<17))){
    total=1;
  }else if((($w82.cdex<18))){
    total=2;
  }else if((($w82.cdex<69))){
    total=3;
  }else if((($w82.cdex<118))){
    total=4;
  }else{
    total=5;
  }
  if((($w82.cstr<4))){
    total=(total-3);
  }else if((($w82.cstr<5))){
    total=(total-2);
  }else if((($w82.cstr<7))){
    total=(total-1);
  }else if((($w82.cstr<18))){
    total=(total+0);
  }else if((($w82.cstr<94))){
    total=(total+1);
  }else if((($w82.cstr<109))){
    total=(total+2);
  }else if((($w82.cstr<117))){
    total=(total+3);
  }else{
    total=(total+4);
  }
  $ret=total;
  return $ret;
}
/* Returns a character's adjustment to armor class       -JWT- */
function toac_adj(){
  var $ret=0;
  var $w83=py.stat;
  if((($w83.cdex<4))){
    $ret=(-4);
  }else if((($w83.cdex===4))){
    $ret=(-3);
  }else if((($w83.cdex===5))){
    $ret=(-2);
  }else if((($w83.cdex===6))){
    $ret=(-1);
  }else if((($w83.cdex<15))){
    $ret=0;
  }else if((($w83.cdex<18))){
    $ret=1;
  }else if((($w83.cdex<59))){
    $ret=2;
  }else if((($w83.cdex<94))){
    $ret=3;
  }else if((($w83.cdex<117))){
    $ret=4;
  }else{
    $ret=5;
  }
  return $ret;
}
/* Returns a character's adjustment to disarm            -RAK- */
function todis_adj(){
  var $ret=0;
  var $w84=py.stat;
  if((($w84.cdex===3))){
    $ret=(-8);
  }else if((($w84.cdex===4))){
    $ret=(-6);
  }else if((($w84.cdex===5))){
    $ret=(-4);
  }else if((($w84.cdex===6))){
    $ret=(-2);
  }else if((($w84.cdex===7))){
    $ret=(-1);
  }else if((($w84.cdex<13))){
    $ret=0;
  }else if((($w84.cdex<16))){
    $ret=1;
  }else if((($w84.cdex<18))){
    $ret=2;
  }else if((($w84.cdex<59))){
    $ret=4;
  }else if((($w84.cdex<94))){
    $ret=5;
  }else if((($w84.cdex<117))){
    $ret=6;
  }else{
    $ret=8;
  }
  return $ret;
}
/* Returns a character's adjustment to damage            -JWT- */
function todam_adj(){
  var $ret=0;
  var $w85=py.stat;
  if((($w85.cstr<4))){
    $ret=(-2);
  }else if((($w85.cstr<5))){
    $ret=(-1);
  }else if((($w85.cstr<16))){
    $ret=0;
  }else if((($w85.cstr<17))){
    $ret=1;
  }else if((($w85.cstr<18))){
    $ret=2;
  }else if((($w85.cstr<94))){
    $ret=3;
  }else if((($w85.cstr<109))){
    $ret=4;
  }else if((($w85.cstr<117))){
    $ret=5;
  }else{
    $ret=6;
  }
  return $ret;
}
/* Pre-declaration of PRT_EXPERIENCE			-RAK- */
/* Prints character-screen info				-RAK- */
function prt_stat_block(){
  prt_field(py.misc.race,3,stat_column);
  prt_field(py.misc.tclass,4,stat_column);
  prt_field(py.misc.title,5,stat_column);
  prt_stat("STR : ",py.stat.cstr,7,stat_column);
  prt_stat("INT : ",py.stat.cint,8,stat_column);
  prt_stat("WIS : ",py.stat.cwis,9,stat_column);
  prt_stat("DEX : ",py.stat.cdex,10,stat_column);
  prt_stat("CON : ",py.stat.ccon,11,stat_column);
  prt_stat("CHR : ",py.stat.cchr,12,stat_column);
  prt_num("LEV : ",py.misc.lev,14,stat_column);
  prt_num("EXP : ",py.misc.exp,15,stat_column);
  prt_num("MANA: ",Math.trunc(py.misc.cmana),16,stat_column);
  prt_num("MHP : ",py.misc.mhp,17,stat_column);
  prt_num("CHP : ",Math.trunc(py.misc.chp),18,stat_column);
  prt_num("AC  : ",py.misc.dis_ac,20,stat_column);
  prt_num("GOLD: ",py.misc.au,21,stat_column);
  if((total_winner)){
    prt_winner();
  }
  if(((((3&py.flags.status)>>>0)!==0))){
    prt_hunger();
  }
  if(((((4&py.flags.status)>>>0)!==0))){
    prt_blind();
  }
  if(((((8&py.flags.status)>>>0)!==0))){
    prt_confused();
  }
  if(((((16&py.flags.status)>>>0)!==0))){
    prt_afraid();
  }
  if(((((32&py.flags.status)>>>0)!==0))){
    prt_poisoned();
  }
  if(((((256&py.flags.status)>>>0)!==0))){
    prt_search();
  }
  if(((((512&py.flags.status)>>>0)!==0))){
    prt_rest();
  }
}
/* Draws entire screen					-RAK- */
function draw_cave(){
  clear(1,1);
  prt_stat_block();
  prt_map();
  prt_depth();
}
/* Prints the following information on the screen.	-JWT- */
function put_character(){
  clear(1,1);
  var $w86=py.misc;
  prt(("Name      : "+$w86.name_),3,3);
  prt(("Race      : "+$w86.race),4,3);
  prt(("Sex       : "+$w86.sex),5,3);
  prt(("Class     : "+$w86.tclass),6,3);
}
/* Prints the following information on the screen.	-JWT- */
function put_stats(){
  var $w87=py;
  prt_stat("STR : ",$w87.stat.cstr,3,65);
  prt_stat("INT : ",$w87.stat.cint,4,65);
  prt_stat("WIS : ",$w87.stat.cwis,5,65);
  prt_stat("DEX : ",$w87.stat.cdex,6,65);
  prt_stat("CON : ",$w87.stat.ccon,7,65);
  prt_stat("CHR : ",$w87.stat.cchr,8,65);
  prt_num("+ To Hit   : ",$w87.misc.dis_th,10,4);
  prt_num("+ To Damage: ",$w87.misc.dis_td,11,4);
  prt_num("+ To AC    : ",$w87.misc.dis_tac,12,4);
  prt_num("  Total AC : ",$w87.misc.dis_ac,13,4);
}
/* Returns a rating of x depending on y			-JWT- */
function likert(x,y){
  var $ret="";
  switch(Math.trunc(Math.fround($rdiv(x,y)))){
    case (-3):case (-2):case (-1):{
      $ret="Very Bad";
      break;
    }
    case 0:case 1:{
      $ret="Bad";
      break;
    }
    case 2:{
      $ret="Poor";
      break;
    }
    case 3:case 4:{
      $ret="Fair";
      break;
    }
    case 5:{
      $ret="Good";
      break;
    }
    case 6:{
      $ret="Very Good";
      break;
    }
    case 7:case 8:{
      $ret="Superb";
      break;
    }
    default:{
      $ret="Excellent";
    }
  }
  return $ret;
}
/* Prints age, height, weight, and SC			-JWT- */
function put_misc1(){
  var $w89=py;
  prt_num("Age          : ",$w89.misc.age,3,40);
  prt_num("Height       : ",$w89.misc.ht,4,40);
  prt_num("Weight       : ",$w89.misc.wt,5,40);
  prt_num("Social Class : ",$w89.misc.sc,6,40);
}
/* Prints the following information on the screen.	-JWT- */
function put_misc2(){
  var $w90=py.misc;
  prt_num("Level      : ",$w90.lev,10,31);
  prt_num("Experience : ",$w90.exp,11,31);
  prt_num("Gold       : ",$w90.au,12,31);
  prt_num("Max Hit Points : ",$w90.mhp,10,54);
  prt_num("Cur Hit Points : ",Math.trunc($w90.chp),11,54);
  prt_num("Max Mana       : ",$w90.mana,12,54);
  prt_num("Cur Mana       : ",Math.trunc($w90.cmana),13,54);
}
/* Prints ratings on certain abilities			-RAK- */
function put_misc3(){
  var xbth=0;
  var xbthb=0;
  var xfos=0;
  var xsrh=0;
  var xstl=0;
  var xdis=0;
  var xsave=0;
  var xdev=0;
  var xinfra="";
  clear(14,1);
  var $w91=py.misc;
  xbth=(($w91.bth+($w91.lev*bth_lev_adj))+($w91.ptohit*bth_plus_adj));
  xbthb=(($w91.bthb+($w91.lev*bth_lev_adj))+($w91.ptohit*bth_plus_adj));
  xfos=(27-$w91.fos);
  if(((xfos<0))){
    xfos=0;
  }
  xsrh=($w91.srh+int_adj());
  xstl=$w91.stl;
  xdis=((($w91.disarm+$w91.lev)+(2*todis_adj()))+int_adj());
  xsave=(($w91.save+$w91.lev)+wis_adj());
  xdev=(($w91.save+$w91.lev)+int_adj());
  xinfra=$cap($wi((py.flags.see_infra*10),1)+$ws(" feet",0),80);
  prt("(Miscellaneous Abilities)",16,24);
  put_buffer(("Fighting    : "+likert(xbth,12)),17,2);
  put_buffer(("Bows/Throw  : "+likert(xbthb,12)),18,2);
  put_buffer(("Saving Throw: "+likert(xsave,6)),19,2);
  put_buffer(("Stealth     : "+likert(xstl,1)),17,27);
  put_buffer(("Disarming   : "+likert(xdis,8)),18,27);
  put_buffer(("Magic Device: "+likert(xdev,7)),19,27);
  put_buffer(("Perception  : "+likert(xfos,3)),17,52);
  put_buffer(("Searching   : "+likert(xsrh,6)),18,52);
  put_buffer(("Infra-Vision: "+xinfra),19,52);
}
/* Used to display the character on the screen.		-RAK- */
function display_char(){
  var dummy='\0';
  put_character();
  put_misc1();
  put_stats();
  put_misc2();
  put_misc3();
}
/* Gets a name for the character 			-JWT- */
function* get_name(){
  prt("Enter your player's name  [press <RETURN> when finished]",22,3);
  (yield* get_string($rf(py.misc,"name_"),3,15,24));
  clear(21,1);
}
/* Chances the name of the character			-JWT- */
function* change_name(){
  var c='\0';
  var flag=false;
  flag=false;
  display_char();
  do{
    prt("<c>hange character name.     <ESCAPE> to continue.",22,3);
    (yield* inkey({get v(){return c},set v($x){c=$x}}));
    switch($ord(c)){
      case 99:{
        (yield* get_name());
        break;
      }
      case 0:case 3:case 25:case 26:case 27:{
        flag=true;
        break;
      }
      default:{
      }
    }
  }while(!((flag)));
}
/* Builds passwords					-RAK- */
function bpswd(){
  var i1=0;
  seed=wdata[1][0];
  for(var $e93=12,$ie93=1;$ie93<=$e93;$ie93++){
    i1=$ie93;
    password1=$setch(password1,i1,$chr(((wdata[1][i1]^randint(255))>>>0)));
  }
  seed=wdata[2][0];
  for(var $e94=12,$ie94=1;$ie94<=$e94;$ie94++){
    i1=$ie94;
    password2=$setch(password2,i1,$chr(((wdata[2][i1]^randint(255))>>>0)));
  }
  seed=get_seed();
}
/* Destroy an item in the inventory			-RAK- */
function inven_destroy(item_val){
  var i2=0;
  $assign(inventory[inven_max],inventory[item_val]);
  var $w95=inventory[item_val];
  if((((($w95.number>1))&&(($w95.subval<512))))){
    $w95.number=($w95.number-1);
    inven_weight=(inven_weight-$w95.weight);
    inventory[inven_max].number=1;
  }else{
    inven_weight=(inven_weight-($w95.weight*$w95.number));
    for(var $e96=(inven_ctr-1),$ie96=item_val;$ie96<=$e96;$ie96++){
      i2=$ie96;
      $assign(inventory[i2],inventory[(i2+1)]);
    }
    $assign(inventory[inven_ctr],blank_treasure);
    inven_ctr=(inven_ctr-1);
  }
}
/* Drops an item from inventory to given location	-RAK- */
function inven_drop(item_val,y,x){
  var i1=0;
  var $w97=cave[y][x];
  if((($w97.tptr>0))){
    pusht($w97.tptr);
  }
  inven_destroy(item_val);
  popt({get v(){return i1},set v($x){i1=$x}});
  $assign(t_list[i1],inventory[inven_max]);
  $w97.tptr=i1;
}
/* Destroys a type of item on a given percent chance	-RAK- */
function inven_damage(typ,perc){
  var $ret=0;
  var i1=0;
  var i2=0;
  i2=0;
  for(var $e98=inven_ctr,$ie98=1;$ie98<=$e98;$ie98++){
    i1=$ie98;
    var $w99=inventory[i1];
    if(($in($w99.tval,typ))){
      if(((randint(100)<perc))){
        inven_destroy(i1);
        i2=(i2+1);
      }
    }
  }
  $ret=i2;
  return $ret;
}
/* Computes current weight limit 			-RAK- */
function weight_limit(){
  var $ret=0;
  var weight_cap=0;
  weight_cap=((py.stat.cstr*player_weight_cap)+py.misc.wt);
  if(((weight_cap>3000))){
    weight_cap=3000;
  }
  $ret=weight_cap;
  return $ret;
}
/* Check inventory for too much weight			-RAK- */
function inven_check_weight(){
  var $ret=false;
  var item_wgt=0;
  var max_weight=0;
  $ret=false;
  max_weight=weight_limit();
  var $w100=inventory[inven_max];
  item_wgt=($w100.number*$w100.weight);
  /* Now, check to see if player can carry object */
  if(((((inven_weight+item_wgt))<=max_weight))){
    $ret=true;
  }
  return $ret;
}
/* Can carry weight */
/* Check to see if he will be carrying too many objects	-RAK- */
function inven_check_num(){
  var $ret=false;
  var item_num=0;
  var i1=0;
  var flag=false;
  $ret=false;
  if(((inven_ctr<22))){
    $ret=true;
  }else if(((inventory[inven_max].subval>255))){
    for(var $e101=inven_ctr,$ie101=1;$ie101<=$e101;$ie101++){
      i1=$ie101;
      var $w102=inventory[i1];
      if((($w102.tval===inventory[inven_max].tval))){
        if((($w102.subval===inventory[inven_max].subval))){
          $ret=true;
        }
      }
    }
  }
  return $ret;
}
/* Add the item in INVEN_MAX to players inventory.  Return the */
/* item position for a description if needed...          -RAK- */
function inven_carry(item_val){
  var item_num=0;
  var wgt=0;
  var typ=0;
  var subt=0;
  var flag=false;
  /* Insert INVEN_MAX at given location */
  function insert(pos,wgt){
    var i1=0;
    for(var $e103=pos,$ie103=inven_ctr;$ie103>=$e103;$ie103--){
      i1=$ie103;
      $assign(inventory[(i1+1)],inventory[i1]);
    }
    $assign(inventory[pos],inventory[inven_max]);
    inven_ctr=(inven_ctr+1);
    inven_weight=(inven_weight+wgt);
  }
  /* INVEN_CARRY routine */
  /* Now, check to see if player can carry object */
  item_val.v=0;
  flag=false;
  var $w104=inventory[inven_max];
  item_num=$w104.number;
  typ=$w104.tval;
  subt=$w104.subval;
  wgt=($w104.number*$w104.weight);
  do{
    item_val.v=(item_val.v+1);
    var $w105=inventory[item_val.v];
    if(((typ===$w105.tval))){
      if(((subt===$w105.subval))){
        /* Adds to other item */
        if(((subt>255))){
          $w105.number=($w105.number+item_num);
          inven_weight=(inven_weight+wgt);
          flag=true;
        }
      }
    }else if(((typ>$w105.tval))){
      /* Insert into list */
      insert(item_val.v,wgt);
      flag=true;
    }
  }while(!(((((item_val.v>=inven_ctr))||(flag)))));
  if((!(flag))){
    /* Becomes last item in list */
    insert((inven_ctr+1),wgt);
    item_val.v=inven_ctr;
  }
}
/* Returns spell chance of failure for spell		-RAK- */
function spell_chance(spell){
  var $w106=magic_spell[py.misc.pclass][spell.splnum];
  var $w107=spell;
  $w107.splchn=($w106.sfail-(3*((py.misc.lev-$w106.slevel))));
  if((class_[py.misc.pclass].mspell)){
    $w107.splchn=($w107.splchn-(3*((int_adj()-1))));
  }else{
    $w107.splchn=($w107.splchn-(3*((wis_adj()-1))));
  }
  if((($w106.smana>py.misc.cmana))){
    $w107.splchn=($w107.splchn+(5*Math.trunc(Math.fround($w106.smana-py.misc.cmana))));
  }
  if((($w107.splchn>95))){
    $w107.splchn=95;
  }else if((($w107.splchn<5))){
    $w107.splchn=5;
  }
}
/* Print list of spells					-RAK- */
function print_new_spells(spell,num,redraw){
  var i1=0;
  var out_val="";
  redraw.v=true;
  clear(1,1);
  prt("   Name                          Level  Mana  %Failure",2,1);
  for(var $e108=num,$ie108=1;$ie108<=$e108;$ie108++){
    i1=$ie108;
    var $w109=magic_spell[py.misc.pclass][spell[i1].splnum];
    spell_chance(spell[i1]);
    out_val=$cap($ws($chr((96+i1)),0)+$ws(") ",0)+$ws($pad($w109.sname," ",30),0)+$wi($w109.slevel,3)+$ws("    ",0)+$wi($w109.smana,3)+$ws("      ",0)+$wi(spell[i1].splchn,2),80);
    prt(out_val,(2+i1),1);
  }
}
/* Returns spell pointer 				-RAK- */
function* get_spell(spell,num,sn,sc,prompt,redraw){
  var $ret=false;
  var i1=0;
  var flag=false;
  var choice='\0';
  var out_val1="";
  var out_val2="";
  sn.v=0;
  flag=true;
  out_val1=$cap($ws("(Spells a-",0)+$ws($chr((num+96)),0)+$ws(", *=List, <ESCAPE>=exit) ",0)+$ws(prompt,0),80);
  while(((((((sn.v<1))||((sn.v>num))))&&(flag)))){
    prt(out_val1,1,1);
    (yield* inkey({get v(){return choice},set v($x){choice=$x}}));
    sn.v=$ord(choice);
    switch(sn.v){
      case 0:case 3:case 25:case 26:case 27:{
        flag=false;
        reset_flag=true;
        break;
      }
      case 42:{
        print_new_spells($clone(spell),num,redraw);
        break;
      }
      default:{
        sn.v=(sn.v-96);
      }
    }
  }
  msg_flag=false;
  if((flag)){
    spell_chance(spell[sn.v]);
    sc.v=spell[sn.v].splchn;
    sn.v=spell[sn.v].splnum;
  }
  $ret=flag;
  return $ret;
}
/* Learn some magic spells (Mage)			-RAK- */
function* learn_spell(redraw){
  var $ret=false;
  var i2=0;
  var i1=0;
  var i3=0;
  var sn=0;
  var sc=0;
  var new_spells=0;
  var spell_flag=0;
  var spell=$arr(1,22,()=>({splnum:0,splchn:0}));
  $ret=false;
  switch(int_adj()){
    case 0:{
      new_spells=0;
      break;
    }
    case 1:{
      new_spells=1;
      break;
    }
    case 2:{
      new_spells=1;
      break;
    }
    case 3:{
      new_spells=1;
      break;
    }
    case 4:{
      new_spells=randint(2);
      break;
    }
    case 5:{
      new_spells=randint(2);
      break;
    }
    case 6:{
      new_spells=randint(3);
      break;
    }
    case 7:{
      new_spells=(randint(2)+1);
      break;
    }
    default:{
      new_spells=0;
    }
  }
  i1=0;
  spell_flag=0;
  do{
    i1=(i1+1);
    if(((inventory[i1].tval===90))){
      spell_flag=((spell_flag|inventory[i1].flags)>>>0);
    }
  }while(!(((i1>=inven_ctr))));
  while(((((new_spells>0))&&((spell_flag>0))))){
    i1=0;
    i2=spell_flag;
    do{
      i3=bit_pos({get v(){return i2},set v($x){i2=$x}});
      var $w112=magic_spell[py.misc.pclass][i3];
      if((($w112.slevel<=py.misc.lev))){
        if((!($w112.learned))){
          i1=(i1+1);
          spell[i1].splnum=i3;
        }
      }
    }while(!(((i2===0))));
    if(((i1>0))){
      print_new_spells($clone(spell),i1,redraw);
      if(((yield* get_spell($clone(spell),i1,{get v(){return sn},set v($x){sn=$x}},{get v(){return sc},set v($x){sc=$x}},"Learn which spell?",redraw)))){
        magic_spell[py.misc.pclass][sn].learned=true;
        $ret=true;
        if(((py.misc.mana===0))){
          py.misc.mana=1;
          py.misc.cmana=Math.fround(1);
        }
      }else{
        new_spells=0;
      }
    }else{
      new_spells=0;
    }
    new_spells=(new_spells-1);
  }
  return $ret;
}
/* Learn some prayers (Priest)				-RAK- */
function* learn_prayer(){
  var $ret=false;
  var i1=0;
  var i2=0;
  var i3=0;
  var i4=0;
  var new_spell=0;
  var test_array=$zeros(32);
  var spell_flag=0;
  i1=0;
  spell_flag=0;
  do{
    i1=(i1+1);
    if(((inventory[i1].tval===91))){
      spell_flag=((spell_flag|inventory[i1].flags)>>>0);
    }
  }while(!(((i1>=inven_ctr))));
  i1=0;
  while(((spell_flag>0))){
    i2=bit_pos({get v(){return spell_flag},set v($x){spell_flag=$x}});
    var $w113=magic_spell[py.misc.pclass][i2];
    if((($w113.slevel<=py.misc.lev))){
      if((!($w113.learned))){
        i1=(i1+1);
        test_array[i1]=i2;
      }
    }
  }
  switch(wis_adj()){
    case 0:{
      i2=0;
      break;
    }
    case 1:{
      i2=1;
      break;
    }
    case 2:{
      i2=1;
      break;
    }
    case 3:{
      i2=1;
      break;
    }
    case 4:{
      i2=randint(2);
      break;
    }
    case 5:{
      i2=randint(2);
      break;
    }
    case 6:{
      i2=randint(3);
      break;
    }
    case 7:{
      i2=(randint(2)+1);
      break;
    }
  }
  new_spell=0;
  while(((((i1>0))&&((i2>0))))){
    i3=randint(i1);
    magic_spell[py.misc.pclass][test_array[i3]].learned=true;
    new_spell=(new_spell+1);
    for(var $e115=(i1-1),$ie115=i3;$ie115<=$e115;$ie115++){
      i4=$ie115;
      test_array[i4]=test_array[(i4+1)];
    }
    i1=(i1-1);
    /* One less spell to learn */
    i2=(i2-1);
  }
  /* Learned one */
  if(((new_spell>0))){
    if(((new_spell>1))){
      (yield* msg_print("You learned new prayers!"));
    }else{
      (yield* msg_print("You learned a new prayer!"));
    }
    if(((py.misc.exp===0))){
      (yield* msg_print(" "));
    }
    if(((py.misc.mana===0))){
      py.misc.mana=1;
      py.misc.cmana=Math.fround(1);
    }
    $ret=true;
  }else{
    $ret=false;
  }
  return $ret;
}
/* Gain some mana if you knows at least one spell	-RAK- */
function gain_mana(amount){
  var i1=0;
  var new_mana=0;
  var knows_spell=false;
  knows_spell=false;
  for(var $e116=31,$ie116=1;$ie116<=$e116;$ie116++){
    i1=$ie116;
    if((magic_spell[py.misc.pclass][i1].learned)){
      knows_spell=true;
    }
  }
  if((knows_spell)){
    if(($odd(py.misc.lev))){
      switch(amount){
        case 0:{
          new_mana=0;
          break;
        }
        case 1:{
          new_mana=1;
          break;
        }
        case 2:{
          new_mana=1;
          break;
        }
        case 3:{
          new_mana=1;
          break;
        }
        case 4:{
          new_mana=2;
          break;
        }
        case 5:{
          new_mana=2;
          break;
        }
        case 6:{
          new_mana=3;
          break;
        }
        case 7:{
          new_mana=4;
          break;
        }
        default:{
          new_mana=0;
        }
      }
    }else{
      switch(amount){
        case 0:{
          new_mana=0;
          break;
        }
        case 1:{
          new_mana=1;
          break;
        }
        case 2:{
          new_mana=1;
          break;
        }
        case 3:{
          new_mana=2;
          break;
        }
        case 4:{
          new_mana=2;
          break;
        }
        case 5:{
          new_mana=3;
          break;
        }
        case 6:{
          new_mana=3;
          break;
        }
        case 7:{
          new_mana=4;
          break;
        }
        default:{
          new_mana=0;
        }
      }
    }
    py.misc.mana=(py.misc.mana+new_mana);
    py.misc.cmana=Math.fround(Math.fround(py.misc.cmana+new_mana));
  }
}
/* Increases hit points and level			-RAK- */
function* gain_level(){
  var nhp=0;
  var dif_exp=0;
  var need_exp=0;
  var redraw=false;
  var out_val="";
  var $w119=py.misc;
  nhp=get_hitdie();
  $w119.mhp=($w119.mhp+nhp);
  $w119.chp=Math.fround(Math.fround($w119.chp+nhp));
  $w119.lev=($w119.lev+1);
  need_exp=Math.trunc(Math.fround(player_exp[$w119.lev]*$w119.expfact));
  if(((py.misc.exp>need_exp))){
    dif_exp=(py.misc.exp-need_exp);
    py.misc.exp=(need_exp+($idiv(dif_exp,2)));
  }
  $w119.title=$cap(player_title[$w119.pclass][$w119.lev],80);
  out_val=$cap($ws("Welcome to level ",0)+$wi($w119.lev,1)+$ws(".",0),80);
  (yield* msg_print(out_val));
  (yield* msg_print(" "));
  msg_flag=false;
  prt_mhp();
  prt_chp();
  prt_level();
  prt_title();
  var $w120=class_[$w119.pclass];
  if(($w120.mspell)){
    redraw=false;
    (yield* learn_spell({get v(){return redraw},set v($x){redraw=$x}}));
    if((redraw)){
      draw_cave();
    }
    gain_mana(int_adj());
    prt_cmana();
  }else if(($w120.pspell)){
    (yield* learn_prayer());
    gain_mana(wis_adj());
    prt_cmana();
  }
}
/* Prints experience					-RAK- */
function* prt_experience(){
  var tmp_exp=0;
  var $w121=py.misc;
  if((($w121.exp>player_max_exp))){
    $w121.exp=player_max_exp;
  }
  if((($w121.lev<max_player_level))){
    while(((Math.trunc(Math.fround(player_exp[$w121.lev]*$w121.expfact))<=$w121.exp))){
      (yield* gain_level());
    }
    if((($w121.exp>$w121.max_exp))){
      $w121.max_exp=$w121.exp;
    }
  }
  prt_num("",py.misc.exp,15,(stat_column+6));
}
/* Inserts a string into a string */
/* Inserts a number into a string */
function insert_num(object_str,mtc_str,number,show_sign){
  var pos=0;
  var olen=0;
  var mlen=0;
  var str1="";
  var str2="";
  pos=$index(object_str.v,mtc_str);
  if(((pos>0))){
    olen=object_str.v.length;
    mlen=mtc_str.length;
    object_str.v=(object_str.v+" ");
    str1=$cap($substr(object_str.v,1,(pos-1)),80);
    str2=$cap($substr(object_str.v,(pos+mlen),(olen-(((pos+mlen)-1)))),80);
    if(((((number>=0))&&(show_sign)))){
      object_str.v=$ws(str1,0)+$ws("+",0)+$wi(number,1)+$ws(str2,0);
    }else{
      object_str.v=$ws(str1,0)+$wi(number,1)+$ws(str2,0);
    }
  }
}
/* Checks to see if user is a wizard			-RAK- */
function* check_pswd(){
  var $ret=false;
  var i1=0;
  var x='\0';
  var tpw="";
  $ret=false;
  i1=0;
  tpw=$fix("            ",12);
  prt("Password : ",1,1);
  do{
    (yield* inkey({get v(){return x},set v($x){x=$x}}));
    switch($ord(x)){
      case 13:{
        break;
      }
      default:{
        i1=(i1+1);
        tpw=$setch(tpw,i1,x);
      }
    }
  }while(!(((((i1===12))||(($ord(x)===13))))));
  if(($streq(tpw,password1))){
    wizard1=true;
    $ret=true;
  }else if(($streq(tpw,password2))){
    wizard1=true;
    wizard2=true;
    $ret=true;
  }
  msg_flag=false;
  erase_line(msg_line,msg_line);
  return $ret;
}
/* Weapon weight VS strength and dexterity		-RAK- */
function attack_blows(weight,wtohit){
  var $ret=0;
  var adj_weight=0;
  var blows=0;
  blows=1;
  wtohit.v=0;
  var $w123=py.stat;
  if((((($w123.cstr*15))<weight))){
    wtohit.v=(-weight);
  }else{
    if((($w123.cdex<10))){
      blows=1;
    }else if((($w123.cdex<19))){
      blows=2;
    }else if((($w123.cdex<68))){
      blows=3;
    }else if((($w123.cdex<108))){
      blows=4;
    }else if((($w123.cdex<118))){
      blows=4;
    }else{
      blows=5;
    }
    adj_weight=Math.trunc(Math.fround($rdiv((($w123.cstr*10)),weight)));
    if(((adj_weight<2))){
      blows=1;
    }else if(((adj_weight<3))){
      blows=Math.trunc(Math.fround($rdiv(blows,Math.fround(3.0))));
    }else if(((adj_weight<4))){
      blows=Math.trunc(Math.fround($rdiv(blows,Math.fround(2.5))));
    }else if(((adj_weight<5))){
      blows=Math.trunc(Math.fround($rdiv(blows,Math.fround(2.25))));
    }else if(((adj_weight<7))){
      blows=Math.trunc(Math.fround($rdiv(blows,Math.fround(2.00))));
    }else if(((adj_weight<9))){
      blows=Math.trunc(Math.fround($rdiv(blows,Math.fround(1.75))));
    }else{
      blows=Math.trunc(Math.fround($rdiv(blows,Math.fround(1.50))));
    }
  }
  $ret=blows;
  return $ret;
}
/* Critical hits, Nasty way to die...			-RAK- */
function* critical_blow(weight,plus,dam){
  var $ret=0;
  $ret=dam;
  /* Weight of weapon, pluses to hit, and character level all */
  /* contirbute to the chance of a critical */
  if(((randint(5000)<=(((weight+(5*plus))+(3*py.misc.lev)))))){
    weight=(weight+randint(650));
    if(((weight<400))){
      $ret=((2*dam)+5);
      (yield* msg_print("It was a good hit! (x2 damage)"));
    }else if(((weight<700))){
      $ret=((3*dam)+10);
      (yield* msg_print("It was an excellent hit! (x3 damage)"));
    }else if(((weight<900))){
      $ret=((4*dam)+15);
      (yield* msg_print("It was a superb hit! (x4 damage)"));
    }else{
      $ret=((5*dam)+20);
      (yield* msg_print("It was a *GREAT* hit! (x5 damage)"));
    }
  }
  return $ret;
}
/* Given direction 'dir', returns new row, column location -RAK- */
function move(dir,y,x){
  var $ret=false;
  var new_row=0;
  var new_col=0;
  switch(dir){
    case 1:{
      new_row=(y.v+1);
      new_col=(x.v-1);
      break;
    }
    case 2:{
      new_row=(y.v+1);
      new_col=x.v;
      break;
    }
    case 3:{
      new_row=(y.v+1);
      new_col=(x.v+1);
      break;
    }
    case 4:{
      new_row=y.v;
      new_col=(x.v-1);
      break;
    }
    case 5:{
      new_row=y.v;
      new_col=x.v;
      break;
    }
    case 6:{
      new_row=y.v;
      new_col=(x.v+1);
      break;
    }
    case 7:{
      new_row=(y.v-1);
      new_col=(x.v-1);
      break;
    }
    case 8:{
      new_row=(y.v-1);
      new_col=x.v;
      break;
    }
    case 9:{
      new_row=(y.v-1);
      new_col=(x.v+1);
      break;
    }
  }
  $ret=false;
  if(((((new_row>=1))&&((new_row<=cur_height))))){
    if(((((new_col>=1))&&((new_col<=cur_width))))){
      y.v=new_row;
      x.v=new_col;
      $ret=true;
    }
  }
  return $ret;
}
/* Saving throws for player character... 		-RAK- */
function player_saves(adjust){
  var $ret=false;
  if(((randint(100)<=((py.misc.save+adjust))))){
    $ret=true;
  }else{
    $ret=false;
  }
  return $ret;
}
/* Init players with some belongings			-RAK- */
function char_inven_init(){
  var i1=0;
  var i2=0;
  var dummy=0;
  for(var $e125=5,$ie125=1;$ie125<=$e125;$ie125++){
    i1=$ie125;
    i2=player_init[py.misc.pclass][i1];
    $assign(inventory[inven_max],inventory_init[i2]);
    inven_carry({get v(){return dummy},set v($x){dummy=$x}});
  }
}
/* Handles the gravestone and top-twenty routines	-RAK- */
function* upon_death(){
  /* function returns the players USERNAME			-JWT- */
  /* calls GETJPI routine to return the USERNAME		-JWT- */
  /* Centers a string within a 31 character string		-JWT- */
  function fill_str(p1){
    var $ret="";
    var s1="";
    var i1=0;
    s1=$cap("",80);
    i1=Math.trunc(Math.fround($rdiv(p1.length,2)));
    $ret=$substr(($pad(s1," ",(15-i1))+$pad(p1," ",31)),1,31);
    return $ret;
  }
  /* Prints a line to the screen efficiently		-RAK- */
  function dprint(str,row){
    var i1=0;
    var i2=0;
    var nblanks=0;
    var xpos=0;
    var prt_str="";
    prt_str=$cap("",80);
    nblanks=0;
    xpos=0;
    for(var $e127=str.length,$ie127=1;$ie127<=$e127;$ie127++){
      i1=$ie127;
      if((($ch(str,i1)===" "))){
        if(((xpos>0))){
          nblanks=(nblanks+1);
          if(((nblanks>5))){
            nblanks=0;
            put_buffer(prt_str,row,xpos);
            prt_str=$cap("",80);
            xpos=0;
          }
        }
      }else{
        if(((xpos===0))){
          xpos=i1;
        }
        if(((nblanks>0))){
          for(var $e128=nblanks,$ie128=1;$ie128<=$e128;$ie128++){
            i2=$ie128;
            prt_str=$cap((prt_str+" "),80);
          }
          nblanks=0;
        }
        prt_str=$cap((prt_str+$ch(str,i1)),80);
      }
    }
    if(((xpos>0))){
      put_buffer(prt_str,row,xpos);
    }
  }
  /* Prints the gravestone of the character		-RAK- */
  function* print_tomb(){
    var str1="";
    var str2="";
    var str3="";
    var str4="";
    var str5="";
    var str6="";
    var str7="";
    var str8="";
    var dstr=$arr(0,19,()=>"");
    var fnam="";
    var command='\0';
    var f1=$file(()=>"");
    var i1=0;
    var flag=false;
    day=$date();
    str1=$cap(fill_str(py.misc.name_),80);
    str2=$cap(fill_str(py.misc.title),80);
    str3=$cap(fill_str(py.misc.tclass),80);
    str4=$cap($ws("Level : ",0)+$wi(py.misc.lev,1),80);
    str4=$cap(fill_str(str4),80);
    str5=$cap($wi(py.misc.exp,1)+$ws(" Exp",0),80);
    str5=$cap(fill_str(str5),80);
    str6=$cap($wi(py.misc.au,1)+$ws(" Au",0),80);
    str6=$cap(fill_str(str6),80);
    str7=$cap($ws("Died on Level : ",0)+$wi(dun_level,1),80);
    str7=$cap(fill_str(str7),80);
    str8=$cap(fill_str(died_from),80);
    dstr[0]=$cap(" ",80);
    dstr[1]=$cap("               _______________________",80);
    dstr[2]=$cap("              /                       \\         ___",80);
    dstr[3]=$cap("             /                         \\ ___   /   \\      ___",80);
    dstr[4]=$cap("            /            RIP            \\   \\  :   :     /   \\",80);
    dstr[5]=$cap("           /                             \\  : _;,,,;_    :   :",80);
    dstr[6]=$cap((("          /"+str1)+"\\,;_          _;,,,;_"),80);
    dstr[7]=$cap("         |               the               |   ___",80);
    dstr[8]=$cap((("         | "+str2)+" |  /   \\"),80);
    dstr[9]=$cap("         |                                 |  :   :",80);
    dstr[10]=$cap((("         | "+str3)+" | _;,,,;_   ____"),80);
    dstr[11]=$cap((("         | "+str4)+" |          /    \\"),80);
    dstr[12]=$cap((("         | "+str5)+" |          :    :"),80);
    dstr[13]=$cap((("         | "+str6)+" |          :    :"),80);
    dstr[14]=$cap((("         | "+str7)+" |         _;,,,,;_"),80);
    dstr[15]=$cap("         |            killed by            |",80);
    dstr[16]=$cap((("         | "+str8)+" |"),80);
    dstr[17]=$cap((("         |           "+day)+"           |"),80);
    dstr[18]=$cap("        *|   *     *     *    *   *     *  | *",80);
    dstr[19]=$cap("________)/\\\\_)_/___(\\/___(//_\\)/_\\//__\\\\(/_|_)_______",80);
    clear(1,1);
    for(var $e129=19,$ie129=0;$ie129<=$e129;$ie129++){
      i1=$ie129;
      dprint(dstr[i1],(i1+1));
    }
    flush();
    if(((yield* get_com("Print to file? (Y/N)",{get v(){return command},set v($x){command=$x}})))){
      switch(command){
        case "y":case "Y":{
          prt("Enter Filename:",1,1);
          flag=false;
          do{
            if(((yield* get_string({get v(){return fnam},set v($x){fnam=$x}},1,17,60)))){
              if(((fnam.length===0))){
                fnam=$cap("MORIACHR.DIE",80);
              }
              $open(f1,null,{file_name:fnam,error:"continue"});
              if((($status(f1)!==0))){
                prt(("Error creating> "+fnam),2,1);
              }else{
                flag=true;
                $rewrite(f1);
                for(var $e130=19,$ie130=0;$ie130<=$e130;$ie130++){
                  i1=$ie130;
                  $fwrite(f1,$ws(dstr[i1],0),true);
                }
              }
              $close(f1);
            }else{
              flag=true;
            }
          }while(!((flag)));
          break;
        }
        default:{
        }
      }
    }
  }
  /* Calculates the total number of points earned		-JWT- */
  function total_points(){
    var $ret=0;
    var $w132=py.misc;
    $ret=($w132.max_exp+((100*py.misc.max_lev)));
    return $ret;
  }
  /* Enters a players name on the top twenty list		-JWT- */
  function* top_twenty(){
    var list=$arr(1,20,()=>"");
    var blank="";
    var i1=0;
    var i2=0;
    var i3=0;
    var i4=0;
    var n1=0;
    var trys=0;
    var o1="";
    var o2="";
    var f1=$file(()=>"");
    var flag=false;
    var file_flag=false;
    if((wizard1)){
      exit();
    }
    clear(1,1);
    for(var $e133=20,$ie133=1;$ie133<=$e133;$ie133++){
      i1=$ie133;
      list[i1]=$cap("",80);
    }
    n1=1;
    priv_switch(1);
    trys=0;
    file_flag=false;
    do{
      $open(f1,null,{file_name:moria_top,organization:"sequential",history:"old",sharing:"none",error:"continue"});
      if((($status(f1)===2))){
        trys=(trys+1);
        if(((trys>5))){
          file_flag=true;
        }else{
          (yield* sleep(2));
        }
      }else{
        file_flag=true;
      }
    }while(!((file_flag)));
    if((((($status(f1)!==0))&&(($status(f1)!==2))))){
      $open(f1,null,{file_name:moria_top,organization:"sequential",history:"new",sharing:"none",error:"continue"});
    }
    if((($status(f1)!==0))){
      $writeln($ws("Error in opening ",0)+$ws(moria_top,0));
      $writeln($ws("Please contact local Moria Wizard.",0));
      exit();
    }
    $reset(f1);
    while((((!$eof(f1))&&((n1<=20))))){
      list[n1]=$freadln(f1,"str");
      n1=(n1+1);
    }
    n1=(n1-1);
    i1=1;
    i3=total_points();
    flag=false;
    while(((((i1<=n1))&&(!flag)))){
      (($rv=$readvs(list[i1],["f13", "int"],false)),blank=$rv[0],i4=$rv[1]);
      if(((i4<i3))){
        flag=true;
      }else{
        i1=(i1+1);
      }
    }
    if(((((flag)||((n1===0)))||((n1<20))))){
      for(var $e134=i1,$ie134=19;$ie134>=$e134;$ie134--){
        i2=$ie134;
        list[(i2+1)]=$cap(list[i2],80);
      }
      o1=$cap(get_username(),80);
      switch(py.misc.lev){
        case 1:{
          o2=$cap($wi(py.misc.lev,1)+$ws("st level ",0),80);
          break;
        }
        case 2:{
          o2=$cap($wi(py.misc.lev,1)+$ws("nd level ",0),80);
          break;
        }
        case 3:{
          o2=$cap($wi(py.misc.lev,1)+$ws("rd level ",0),80);
          break;
        }
        default:{
          o2=$cap($wi(py.misc.lev,1)+$ws("th level ",0),80);
        }
      }
      list[i1]=$cap($ws($pad(o1," ",13),0)+$wi(i3,7)+$ws("  ",0)+$ws(py.misc.name_,0)+$ws(", a ",0)+$ws(o2,0)+$ws(py.misc.race,0)+$ws(" ",0)+$ws(py.misc.tclass,0)+$ws(".",0),80);
      if(((n1<20))){
        n1=(n1+1);
      }
      flag=false;
    }
    $rewrite(f1);
    for(var $e136=n1,$ie136=1;$ie136<=$e136;$ie136++){
      i1=$ie136;
      $fwrite(f1,$ws(list[i1],0),true);
    }
    $close(f1);
    priv_switch(0);
    put_buffer("Username       Points  Character that died.",1,1);
    for(var $e137=n1,$ie137=1;$ie137<=$e137;$ie137++){
      i1=$ie137;
      put_buffer(list[i1],(i1+1),1);
    }
    put_buffer("",(i1+2),1);
    put_qio();
  }
  /* Change the player into a King!			-RAK- */
  function* kingly(){
    /* Change the character attributes... */
    dun_level=0;
    died_from=$cap("Ripe Old Age",80);
    var $w138=py.misc;
    $w138.lev=($w138.lev+max_player_level);
    if((($ch($w138.sex,1)==="M"))){
      $w138.title=$cap("Magnificent",80);
      $w138.tclass=$cap("*King*",80);
    }else{
      $w138.title=$cap("Beautiful",80);
      $w138.tclass=$cap("*Queen*",80);
    }
    $w138.au=($w138.au+250000);
    $w138.max_exp=($w138.max_exp+5000000);
    $w138.exp=$w138.max_exp;
    /* Let the player know that he did good... */
    clear(1,1);
    dprint("                                  #",2);
    dprint("                                #####",3);
    dprint("                                  #",4);
    dprint("                            ,,,  $$$  ,,,",5);
    dprint("                        ,,=$   \"$$$$$\"   $=,,",6);
    dprint("                      ,$$        $$$        $$,",7);
    dprint("                      *>         <*>         <*",8);
    dprint("                      $$         $$$         $$",9);
    dprint("                      \"$$        $$$        $$\"",10);
    dprint("                       \"$$       $$$       $$\"",11);
    dprint("                        *#########*#########*",12);
    dprint("                        *#########*#########*",13);
    dprint("                          Veni, Vidi, Vici!",16);
    dprint("                     I came, I saw, I conquered!",17);
    dprint("                      All Hail the Mighty King!",18);
    flush();
    (yield* pause(24));
  }
  /* What happens upon dying...				-RAK- */
  if((total_winner)){
    (yield* kingly());
  }
  (yield* print_tomb());
  (yield* top_twenty());
  exit();
}
function* ident_char(){
  var command='\0';
  if(((yield* get_com("Enter character to be identified :",{get v(){return command},set v($x){command=$x}})))){
    switch(command){
      case " ":{
        prt("  - An open pit.",1,1);
        break;
      }
      case "!":{
        prt("! - A potion.",1,1);
        break;
      }
      case "\"":{
        prt("\" - An amulet, periapt, or necklace.",1,1);
        break;
      }
      case "#":{
        prt("# - A stone wall.",1,1);
        break;
      }
      case "$":{
        prt("$ - Treasure.",1,1);
        break;
      }
      case "&":{
        /* '%' : prt('% - Not used.',1,1); */
        prt("& - Treasure chest.",1,1);
        break;
      }
      case "'":{
        prt("' - An open door.",1,1);
        break;
      }
      case "(":{
        prt("( - Soft armor.",1,1);
        break;
      }
      case ")":{
        prt(") - A shield.",1,1);
        break;
      }
      case "*":{
        prt("* - Gems.",1,1);
        break;
      }
      case "+":{
        prt("+ - A closed door.",1,1);
        break;
      }
      case ",":{
        prt(", - Food or mushroom patch.",1,1);
        break;
      }
      case "-":{
        prt("- - A wand",1,1);
        break;
      }
      case ".":{
        prt(". - Floor.",1,1);
        break;
      }
      case "/":{
        prt("/ - A pole weapon.",1,1);
        break;
      }
      case "1":{
        /* '0' : prt('0 - Not used.',1,1); */
        prt("1 - Entrance to General Store.",1,1);
        break;
      }
      case "2":{
        prt("2 - Entrance to Armory.",1,1);
        break;
      }
      case "3":{
        prt("3 - Entrance to Weaponsmith.",1,1);
        break;
      }
      case "4":{
        prt("4 - Entrance to Temple.",1,1);
        break;
      }
      case "5":{
        prt("5 - Entrance to Alchemy shop.",1,1);
        break;
      }
      case "6":{
        prt("6 - Entrance to Magic-Users store.",1,1);
        break;
      }
      case ":":{
        /* '7' : prt('7 - Not used.',1,1); */
        /* '8' : prt('8 - Not used.',1,1); */
        /* '9' : prt('9 - Not used.',1,1); */
        prt(": - Rubble.",1,1);
        break;
      }
      case ";":{
        prt("; - A loose rock.",1,1);
        break;
      }
      case "<":{
        prt("< - An up staircase.",1,1);
        break;
      }
      case "=":{
        prt("= - A ring.",1,1);
        break;
      }
      case ">":{
        prt("> - A down staircase.",1,1);
        break;
      }
      case "?":{
        prt("? - A scroll.",1,1);
        break;
      }
      case "@":{
        prt(py.misc.name_,1,1);
        break;
      }
      case "A":{
        prt("A - Giant Ant Lion.",1,1);
        break;
      }
      case "B":{
        prt("B - The Balrog.",1,1);
        break;
      }
      case "C":{
        prt("C - Gelentanious Cube.",1,1);
        break;
      }
      case "D":{
        prt("D - An Ancient Dragon (Beware).",1,1);
        break;
      }
      case "E":{
        prt("E - Elemental.",1,1);
        break;
      }
      case "F":{
        prt("F - Giant Fly.",1,1);
        break;
      }
      case "G":{
        prt("G - Ghost.",1,1);
        break;
      }
      case "H":{
        prt("H - Hobgoblin.",1,1);
        break;
      }
      case "I":{
        prt("I - Invisible Stalker.",1,1);
        break;
      }
      case "J":{
        prt("J - Jelly.",1,1);
        break;
      }
      case "K":{
        prt("K - Killer Beetle.",1,1);
        break;
      }
      case "L":{
        prt("L - Lich.",1,1);
        break;
      }
      case "M":{
        prt("M - Mummy.",1,1);
        break;
      }
      case "O":{
        /* 'N' : prt('N - Not used.',1,1); */
        prt("O - Ooze.",1,1);
        break;
      }
      case "P":{
        prt("P - Giant humanoid.",1,1);
        break;
      }
      case "Q":{
        prt("Q - Quylthulg (Pulsing Flesh Mound).",1,1);
        break;
      }
      case "R":{
        prt("R - Reptile.",1,1);
        break;
      }
      case "S":{
        prt("S - Giant Scorpion.",1,1);
        break;
      }
      case "T":{
        prt("T - Troll.",1,1);
        break;
      }
      case "U":{
        prt("U - Umber Hulk.",1,1);
        break;
      }
      case "V":{
        prt("V - Vampire.",1,1);
        break;
      }
      case "W":{
        prt("W - Wight or Wraith.",1,1);
        break;
      }
      case "X":{
        prt("X - Xorn.",1,1);
        break;
      }
      case "Y":{
        prt("Y - Yeti.",1,1);
        break;
      }
      case "[":{
        /* 'Z' : prt('Z - Not used.',1,1); */
        prt("[ - Hard armor.",1,1);
        break;
      }
      case "\\":{
        prt("\\ - A hafted weapon.",1,1);
        break;
      }
      case "]":{
        prt("] - Misc. armor.",1,1);
        break;
      }
      case "^":{
        prt("^ - A trap.",1,1);
        break;
      }
      case "_":{
        prt("_ - A staff.",1,1);
        break;
      }
      case "a":{
        /* '`' : prt('` - Not used.',1,1); */
        prt("a - Giant Ant.",1,1);
        break;
      }
      case "b":{
        prt("b - Giant Bat.",1,1);
        break;
      }
      case "c":{
        prt("c - Giant Centipede.",1,1);
        break;
      }
      case "d":{
        prt("d - Dragon.",1,1);
        break;
      }
      case "e":{
        prt("e - Floating Eye.",1,1);
        break;
      }
      case "f":{
        prt("f - Giant Frog",1,1);
        break;
      }
      case "g":{
        prt("g - Golem.",1,1);
        break;
      }
      case "h":{
        prt("h - Harpy.",1,1);
        break;
      }
      case "i":{
        prt("i - Icky Thing.",1,1);
        break;
      }
      case "j":{
        prt("j - Jackal.",1,1);
        break;
      }
      case "k":{
        prt("k - Kobold.",1,1);
        break;
      }
      case "l":{
        prt("l - Giant Lice.",1,1);
        break;
      }
      case "m":{
        prt("m - Mold.",1,1);
        break;
      }
      case "n":{
        prt("n - Naga.",1,1);
        break;
      }
      case "o":{
        prt("o - Orc or Ogre.",1,1);
        break;
      }
      case "p":{
        prt("p - Person (Humanoid).",1,1);
        break;
      }
      case "q":{
        prt("q - Quasit.",1,1);
        break;
      }
      case "r":{
        prt("r - Rodent.",1,1);
        break;
      }
      case "s":{
        prt("s - Skeleton.",1,1);
        break;
      }
      case "t":{
        prt("t - Gaint tick.",1,1);
        break;
      }
      case "w":{
        /* 'u' : prt('u - Not used.',1,1); */
        /* 'v' : prt('v - Not used.',1,1); */
        prt("w - Worm(s).",1,1);
        break;
      }
      case "y":{
        /* 'x' : prt('x - Not used.',1,1); */
        prt("y - Yeek.",1,1);
        break;
      }
      case "z":{
        prt("z - Zombie.",1,1);
        break;
      }
      case "{":{
        prt("{ - Arrow, bolt, or bullet.",1,1);
        break;
      }
      case "|":{
        prt("| - A sword or dagger.",1,1);
        break;
      }
      case "}":{
        prt("} - Bow, crossbow, or sling.",1,1);
        break;
      }
      case "~":{
        prt("~ - Miscellaneous item.",1,1);
        break;
      }
      default:{
        prt("Not Used.",1,1);
      }
    }
  }
}
/* Help for available commands */
function* help(){
  clear(1,1);
  prt("B <Dir> Bash (object/creature)|  q        Quaff a potion.",1,1);
  prt("C       Display character.    |  r        Read a scroll.",2,1);
  prt("D <Dir> Disarm a trap/chest.  |  s        Search for hidden doors.",3,1);
  prt("E       Eat some food.        |  t        Take off an item.",4,1);
  prt("F       Fill lamp with oil.   |  u        Use a staff.",5,1);
  prt("L       Current location.     |  v        Version and credits.",6,1);
  prt("P       Print map.            |  w        Wear/Wield an item.",7,1);
  prt("R       Rest for a period.    |  x        Exchange weapon.",8,1);
  prt("S       Search Mode.          |  /        Identify a character.",9,1);
  prt("T <Dir> Tunnel.               |  ?        Display this panel.",10,1);
  prt("a       Aim and fire a wand.  |",11,1);
  prt("b       Browse a book.        |  ^M       Repeat the last message.",12,1);
  prt("c <Dir> Close a door.         |  ^R       Redraw the screen.",13,1);
  prt("d       Drop an item.         |  ^Y       Quit the game.",14,1);
  prt("e       Equipment list.       |  ^Z       Save character and quit.",15,1);
  prt("f       Fire/Throw an item.   |   $       Shell out of game.",16,1);
  prt("h       Help on key commands. |",17,1);
  prt("i       Inventory list.       |  < Go up an up-staircase.",18,1);
  prt("j <Dir> Jam a door with spike.|  > Go down a down-staircase.",19,1);
  prt("l <Dir> Look given direction. |  . <Dir>  Move in direction.",20,1);
  prt("m       Cast a magic spell.   |  Movement: 7  8  9",21,1);
  prt("o <Dir> Open a door/chest.    |            4     6    5 = Rest",22,1);
  prt("p       Read a prayer.        |            1  2  3",23,1);
  (yield* pause(24));
  draw_cave();
}
/* Help for available wizard commands */
function* wizard_help(){
  clear(1,1);
  if((wizard2)){
    prt("^A - Remove Curse and Cure all maladies.",1,1);
    prt("^B - Print random objects sample.",2,1);
    prt("^D - Down/Up n levels.",3,1);
    prt("^E - Change character.",4,1);
    prt("^F - Delete monsters.",5,1);
    prt("^G - Allocate treasures.",6,1);
    prt("^H - Wizard Help.",7,1);
    prt("^I - Identify.",8,1);
    prt("^J - Gain experience.",9,1);
    prt("^K - Summon monster.",10,1);
    prt("^L - Wizard light.",11,1);
    prt("^N - Print monster dictionary.",12,1);
    prt("^P - Wizard password on/off.",13,1);
    prt("^T - Teleport player.",14,1);
    prt("^V - Restore lost character.",15,1);
    prt("^W - Create any object *CAN CAUSE FATAL ERROR*",16,1);
  }else{
    prt("^A - Remove Curse and Cure all maladies.",1,1);
    prt("^B - Print random objects sample.",2,1);
    prt("^D - Down/Up n levels.",3,1);
    prt("^H - Wizard Help.",4,1);
    prt("^I - Identify.",5,1);
    prt("^L - Wizard light.",6,1);
    prt("^N - Print monster dictionary.",7,1);
    prt("^P - Wizard password on/off.",8,1);
    prt("^T - Teleport player.",9,1);
    prt("^V - Restore lost character.",10,1);
  }
  (yield* pause(24));
  draw_cave();
}
/* Spawn a process to use HELP utility on the MORIA help library -RAK- */
/* Spawn a shell and execute DCL command 		-RAK- */
/* Object descriptor routines */
/* Randomize colors, woods, and metals */
function randes(){
  var i1=0;
  var i2=0;
  var tmp="";
  for(var $e140=max_colors,$ie140=1;$ie140<=$e140;$ie140++){
    i1=$ie140;
    i2=randint(max_colors);
    tmp=$cap(colors[i1],80);
    colors[i1]=$cap(colors[i2],16);
    colors[i2]=$cap(tmp,16);
  }
  for(var $e141=max_woods,$ie141=1;$ie141<=$e141;$ie141++){
    i1=$ie141;
    i2=randint(max_woods);
    tmp=$cap(woods[i1],80);
    woods[i1]=$cap(woods[i2],16);
    woods[i2]=$cap(tmp,16);
  }
  for(var $e142=max_metals,$ie142=1;$ie142<=$e142;$ie142++){
    i1=$ie142;
    i2=randint(max_metals);
    tmp=$cap(metals[i1],80);
    metals[i1]=$cap(metals[i2],16);
    metals[i2]=$cap(tmp,16);
  }
  for(var $e143=max_rocks,$ie143=1;$ie143<=$e143;$ie143++){
    i1=$ie143;
    i2=randint(max_rocks);
    tmp=$cap(rocks[i1],80);
    rocks[i1]=$cap(rocks[i2],16);
    rocks[i2]=$cap(tmp,16);
  }
  for(var $e144=max_amulets,$ie144=1;$ie144<=$e144;$ie144++){
    i1=$ie144;
    i2=randint(max_amulets);
    tmp=$cap(amulets[i1],80);
    amulets[i1]=$cap(amulets[i2],16);
    amulets[i2]=$cap(tmp,16);
  }
  for(var $e145=max_mush,$ie145=1;$ie145<=$e145;$ie145++){
    i1=$ie145;
    i2=randint(max_mush);
    tmp=$cap(mushrooms[i1],80);
    mushrooms[i1]=$cap(mushrooms[i2],16);
    mushrooms[i2]=$cap(tmp,16);
  }
}
/* Return random title */
function rantitle(title){
  var i1=0;
  var i2=0;
  var i3=0;
  i3=(randint(2)+1);
  title.v="Titled \"";
  for(var $e146=i3,$ie146=1;$ie146<=$e146;$ie146++){
    i1=$ie146;
    for(var $e147=randint(2),$ie147=1;$ie147<=$e147;$ie147++){
      i2=$ie147;
      title.v=(title.v+syllables[randint(max_syllables)]);
    }
    if(((i1!==i3))){
      title.v=(title.v+" ");
    }
  }
  title.v=(title.v+"\"");
}
/* Initialize all Potions, wands, staves, scrolls, ect... */
function magic_init(random_seed){
  var i1=0;
  var tmpv=0;
  var tmps="";
  seed=random_seed;
  randes();
  for(var $e148=max_objects,$ie148=1;$ie148<=$e148;$ie148++){
    i1=$ie148;
    tmpv=((((255&object_list[i1].subval)>>>0))|0);
    switch(object_list[i1].tval){
      case 75:case 76:{
        if(((tmpv<=max_colors))){
          insert_str($rf(object_list[i1],"name_"),"%C",colors[tmpv]);
        }
        break;
      }
      case 70:case 71:{
        rantitle({get v(){return tmps},set v($x){tmps=$x}});
        insert_str($rf(object_list[i1],"name_"),"%T",tmps);
        break;
      }
      case 45:{
        if(((tmpv<=max_colors))){
          insert_str($rf(object_list[i1],"name_"),"%R",rocks[tmpv]);
        }
        break;
      }
      case 40:{
        if(((tmpv<=max_rocks))){
          insert_str($rf(object_list[i1],"name_"),"%A",amulets[tmpv]);
        }
        break;
      }
      case 65:{
        if(((tmpv<=max_amulets))){
          insert_str($rf(object_list[i1],"name_"),"%M",metals[tmpv]);
        }
        break;
      }
      case 55:{
        if(((tmpv<=max_woods))){
          insert_str($rf(object_list[i1],"name_"),"%W",woods[tmpv]);
        }
        break;
      }
      case 80:{
        if(((tmpv<=max_mush))){
          insert_str($rf(object_list[i1],"name_"),"%M",mushrooms[tmpv]);
        }
        break;
      }
      case 60:{
        break;
      }
      default:{
      }
    }
  }
}
/* if (tmpv <= max_rods) then
   		       insert_str(object_list[i1].name,'%D',rods[tmpv]) */
/* Remove 'Secret' symbol for identity of object */
function known1(object_str){
  var pos=0;
  var olen=0;
  var str1="";
  var str2="";
  pos=$index(object_str.v,"|");
  if(((pos>0))){
    olen=object_str.v.length;
    str1=$cap($substr(object_str.v,1,(pos-1)),80);
    str2=$cap($substr(object_str.v,(pos+1),(olen-pos)),80);
    object_str.v=$ws(str1,0)+$ws(str2,0);
  }
}
/* Remove 'Secret' symbol for identity of pluses */
function known2(object_str){
  var pos=0;
  var olen=0;
  var str1="";
  var str2="";
  pos=$index(object_str.v,"^");
  if(((pos>0))){
    olen=object_str.v.length;
    str1=$cap($substr(object_str.v,1,(pos-1)),80);
    str2=$cap($substr(object_str.v,(pos+1),(olen-pos)),80);
    object_str.v=$ws(str1,0)+$ws(str2,0);
  }
}
/* Return string without quoted portion */
function unquote(object_str){
  var pos0=0;
  var pos1=0;
  var pos2=0;
  var olen=0;
  var str1="";
  var str2="";
  pos0=$index(object_str.v,"\"");
  if(((pos0>0))){
    pos1=$index(object_str.v,"~");
    pos2=$index(object_str.v,"|");
    olen=object_str.v.length;
    str1=$cap($substr(object_str.v,1,pos1),80);
    str2=$cap($substr(object_str.v,(pos2+1),(olen-pos2)),80);
    object_str.v=$ws(str1,0)+$ws(str2,0);
  }
}
/* Somethings been identified */
function identify(item){
  var i1=0;
  var x1=0;
  var x2=0;
  x1=item.tval;
  x2=item.subval;
  if((($index(item.name_,"|")>0))){
    for(var $e150=max_talloc,$ie150=1;$ie150<=$e150;$ie150++){
      i1=$ie150;
      var $w151=t_list[i1];
      if((((($w151.tval===x1))&&(($w151.subval===x2))))){
        unquote($rf($w151,"name_"));
        known1($rf($w151,"name_"));
      }
    }
    for(var $e152=inven_max,$ie152=1;$ie152<=$e152;$ie152++){
      i1=$ie152;
      var $w153=inventory[i1];
      if((((($w153.tval===x1))&&(($w153.subval===x2))))){
        unquote($rf($w153,"name_"));
        known1($rf($w153,"name_"));
      }
    }
    i1=0;
    do{
      i1=(i1+1);
      var $w154=object_list[i1];
      if((((($w154.tval===x1))&&(($w154.subval===x2))))){
        if((($index($w154.name_,"%T")>0))){
          insert_str($rf($w154,"name_")," %T|","");
          object_ident[i1]=true;
        }else{
          unquote($rf($w154,"name_"));
          known1($rf($w154,"name_"));
          object_ident[i1]=true;
        }
      }
    }while(!(((i1===max_objects))));
  }
}
/* Returns a description of item for inventory */
function objdes(out_val,ptr,pref){
  var pos=0;
  var tmp_val="";
  var $w155=inventory[ptr];
  tmp_val=$cap($w155.name_,80);
  pos=$index(tmp_val,"|");
  if(((pos>0))){
    tmp_val=$cap($substr(tmp_val,1,(pos-1)),80);
  }
  pos=$index(tmp_val,"^");
  if(((pos>0))){
    tmp_val=$cap($substr(tmp_val,1,(pos-1)),80);
  }
  if((!(pref))){
    pos=$index(tmp_val," (");
    if(((pos>0))){
      tmp_val=$cap($substr(tmp_val,1,(pos-1)),80);
    }
  }
  insert_num({get v(){return tmp_val},set v($x){tmp_val=$x}},"%P1",$w155.p1,true);
  insert_num({get v(){return tmp_val},set v($x){tmp_val=$x}},"%P2",$w155.tohit,true);
  insert_num({get v(){return tmp_val},set v($x){tmp_val=$x}},"%P3",$w155.todam,true);
  insert_num({get v(){return tmp_val},set v($x){tmp_val=$x}},"%P4",$w155.toac,true);
  insert_num({get v(){return tmp_val},set v($x){tmp_val=$x}},"%P5",$w155.p1,false);
  insert_num({get v(){return tmp_val},set v($x){tmp_val=$x}},"%P6",$w155.ac,false);
  if((($w155.number!==1))){
    insert_str({get v(){return tmp_val},set v($x){tmp_val=$x}},"ch~","ches");
    insert_str({get v(){return tmp_val},set v($x){tmp_val=$x}},"~","s");
  }else{
    insert_str({get v(){return tmp_val},set v($x){tmp_val=$x}},"~","");
  }
  if((pref)){
    if((($index(tmp_val,"&")>0))){
      insert_str({get v(){return tmp_val},set v($x){tmp_val=$x}},"&","");
      if((($w155.number>1))){
        out_val.v=$wi($w155.number,1)+$ws(tmp_val,0);
      }else if((($w155.number<1))){
        out_val.v=$ws("no more",0)+$ws(tmp_val,0);
      }else if(($in($ch(tmp_val,2),vowel_set))){
        out_val.v=$ws("an",0)+$ws(tmp_val,0);
      }else{
        out_val.v=$ws("a",0)+$ws(tmp_val,0);
      }
    }else{
      out_val.v=tmp_val;
    }
    out_val.v=(out_val.v+".");
  }else{
    insert_str({get v(){return tmp_val},set v($x){tmp_val=$x}},"& ","");
    out_val.v=tmp_val;
  }
}
/* Attempt to open the intro file			-RAK- */
function* intro(finam){
  var xpos=0;
  var i1=0;
  var dummy='\0';
  var day_test="";
  var in_line="";
  var file1=$file(()=>"");
  var file2=$file(()=>({file_id:"",seed:0}));
  var exit_flag=false;
  exit_flag=false;
  clear(1,1);
  /* Attempt to read hours.dat.  If it does not exist, */
  /* then create a standard one. */
  priv_switch(1);
  $open(file1,null,{file_name:moria_hou,history:"readonly",sharing:"readonly",error:"continue"});
  if((($status(file1)===0))){
    $reset(file1);
    do{
      in_line=$freadln(file1,"str");
      if(((in_line.length>3))){
        day_test=$cap($substr(in_line,1,4),80);
        if(((day_test==="SUN:"))){
          days[1]=$cap(in_line,80);
        }else if(((day_test==="MON:"))){
          days[2]=$cap(in_line,80);
        }else if(((day_test==="TUE:"))){
          days[3]=$cap(in_line,80);
        }else if(((day_test==="WED:"))){
          days[4]=$cap(in_line,80);
        }else if(((day_test==="THU:"))){
          days[5]=$cap(in_line,80);
        }else if(((day_test==="FRI:"))){
          days[6]=$cap(in_line,80);
        }else if(((day_test==="SAT:"))){
          days[7]=$cap(in_line,80);
        }
      }
    }while(!(($eof(file1))));
    $close(file1);
    priv_switch(0);
  }else{
    /* Create a standard hours file */
    priv_switch(0);
    $open(file1,null,{file_name:moria_hou,organization:"sequential",history:"new",sharing:"readwrite",error:"continue"});
    if((($status(file1)===0))){
      $rewrite(file1);
      $fwrite(file1,$ws("    Moria operating hours are:",0),true);
      $fwrite(file1,$ws("    |    AM     |    PM     |",0),true);
      $fwrite(file1,$ws("    1         111         111",0),true);
      $fwrite(file1,$ws("    2123456789012123456789012",0),true);
      for(var $e156=7,$ie156=1;$ie156<=$e156;$ie156++){
        i1=$ie156;
        $fwrite(file1,$ws(days[i1],0),true);
      }
      $fwrite(file1,$ws("       (X=Open; .=Closed)",0),true);
      $close(file1);
      $writeln($ws("Created ",0)+$ws(moria_hou,0));
      exit_flag=true;
    }else{
      $writeln($ws("Error in creating ",0)+$ws(moria_hou,0));
      exit();
    }
  }
  /* Check the hours, if closed then require password */
  if((!(exit_flag))){
    xpos=$index(finam.v,"/WIZARD");
    if(((xpos>0))){
      if(((yield* check_pswd()))){
        insert_str(finam,"/WIZARD","");
      }
    }
    if((!(wizard1))){
      no_controly();
    }
    if((!(check_time()))){
      if((!(wizard1))){
        priv_switch(1);
        $open(file1,null,{file_name:moria_hou,history:"readonly",sharing:"readonly",error:"continue"});
        if((($status(file1)===0))){
          $reset(file1);
          do{
            in_line=$freadln(file1,"str");
            $writeln($ws(in_line,0));
          }while(!(($eof(file1))));
          $close(file1);
        }
        priv_switch(0);
        exit();
      }
    }
  }
  /* Print the introduction message, news, ect... */
  priv_switch(1);
  $open(file1,null,{file_name:moria_mor,organization:"sequential",history:"readonly",sharing:"readwrite",error:"continue"});
  if((($status(file1)===0))){
    if((!(exit_flag))){
      $reset(file1);
      do{
        in_line=$freadln(file1,"str");
        $writeln($ws(in_line,0));
      }while(!(($eof(file1))));
      (yield* pause_exit(24,0));
      $close(file1);
    }else{
      $close(file1);
    }
    priv_switch(0);
  }else{
    /* Create one... */
    priv_switch(0);
    $open(file1,null,{file_name:moria_mor,organization:"sequential",history:"new",sharing:"readwrite",error:"continue"});
    if((($status(file1)===0))){
      $rewrite(file1);
      $fwrite(file1,$ws("                         *********************",0),true);
      $fwrite(file1,$ws("                         **    Moria ",0)+$wr(cur_version,4,2)+$ws("   **",0),true);
      $fwrite(file1,$ws("                         *********************",0),true);
      $fwrite(file1,$ws("                   COPYRIGHT (c) Robert Alan Koeneke",0),true);
      $fwrite(file1,$ws(" ",0),true);
      $fwrite(file1,$ws("Programers : Robert Alan Koeneke / University of Oklahoma",0),true);
      $fwrite(file1,$ws("             Jimmey Wayne Todd   / University of Oklahoma",0),true);
      $fwrite(file1,$ws(" ",0),true);
      $fwrite(file1,$ws("Dungeon Master: This file may contain updates and news.",0),true);
      $close(file1);
      $writeln($ws("Created ",0)+$ws(moria_mor,0));
      exit_flag=true;
    }else{
      $writeln($ws("Error in creating ",0)+$ws(moria_mor,0));
      exit();
    }
  }
  /* Check for MASTER.DAT */
  priv_switch(1);
  $open(file2,null,{file_name:moria_mas,access_method:"keyed",organization:"indexed",history:"readonly",sharing:"readwrite",error:"continue"});
  if((($status(file2)!==0))){
    priv_switch(0);
    $open(file2,null,{file_name:moria_mas,access_method:"keyed",organization:"indexed",history:"new",sharing:"readwrite",error:"continue"});
    if((($status(file2)===0))){
      $writeln($ws("Created ",0)+$ws(moria_mas,0));
      $close(file2);
      exit_flag=true;
    }else{
      $writeln($ws("Error in creating ",0)+$ws(moria_mas,0));
      exit();
    }
  }else{
    $close(file2);
    priv_switch(0);
  }
  /* Check for TOPTWENTY.DAT */
  priv_switch(1);
  $open(file1,null,{file_name:moria_top,organization:"sequential",history:"readonly",sharing:"readwrite",error:"continue"});
  if((((($status(file1)!==0))&&(($status(file1)!==2))))){
    priv_switch(0);
    $open(file1,null,{file_name:moria_top,organization:"sequential",history:"new",sharing:"readwrite",error:"continue"});
    if((($status(file1)===0))){
      $writeln($ws("Created ",0)+$ws(moria_top,0));
      $close(file1);
      exit_flag=true;
    }else{
      $writeln($ws("Error in creating ",0)+$ws(moria_top,0));
      exit();
    }
  }else{
    $close(file1);
    priv_switch(0);
  }
  if((exit_flag)){
    $writeln($ws("Notice: System MORIA wizard should set the protection",0));
    $writeln($ws("        on  files  just created.  See INSTALL.HLP for",0));
    $writeln($ws("        help on setting protection on the files.",0));
    $writeln($ws("Notice: File HOURS.DAT may be edited to set operating",0));
    $writeln($ws("        hours for MORIA.",0));
    $writeln($ws("Notice: File MORIA.DAT may be edited to contain  news",0));
    $writeln($ws("        items, etc...",0));
    exit();
  }
}
/* Prints dungeon map to external file			-RAK- */
function* print_map(){
  var i1=0;
  var i2=0;
  var i3=0;
  var i4=0;
  var i5=0;
  var i6=0;
  var i7=0;
  var i8=0;
  var dun_line="";
  var filename1="";
  var tmp='\0';
  var file1=$file(()=>"");
  prt("File name: ",1,1);
  if(((yield* get_string({get v(){return filename1},set v($x){filename1=$x}},1,12,64)))){
    if(((filename1.length===0))){
      filename1=$cap("MORIAMAP.DAT",80);
    }
    $open(file1,filename1,{error:"continue"});
    if((($status(file1)===0))){
      prt("Writing Moria Dungeon Map...",1,1);
      put_qio();
      $rewrite(file1);
      i1=1;
      i7=0;
      do{
        i2=1;
        i3=((i1+outpage_height)-1);
        if(((i3>cur_height))){
          i3=cur_height;
        }
        i7=(i7+1);
        i8=0;
        do{
          i4=((i2+outpage_width)-1);
          if(((i4>cur_width))){
            i4=cur_width;
          }
          i8=(i8+1);
          $fwrite(file1,$ws($chr(12),0),true);
          $fwrite(file1,$ws("Section[",0)+$wi(i7,1)+$ws(",",0)+$wi(i8,1)+$ws("];     ",0));
          $fwrite(file1,$ws("Depth : ",0)+$wi(((dun_level*50)),1)+$ws(" (feet)",0),true);
          $fwrite(file1,$ws(" ",0),true);
          $fwrite(file1,$ws("   ",0));
          for(var $e157=i4,$ie157=i2;$ie157<=$e157;$ie157++){
            i5=$ie157;
            i6=Math.trunc(Math.fround($rdiv(i5,100)));
            $fwrite(file1,$wi(i6,1));
          }
          $fwrite(file1,"",true);
          $fwrite(file1,$ws("   ",0));
          for(var $e158=i4,$ie158=i2;$ie158<=$e158;$ie158++){
            i5=$ie158;
            i6=(Math.trunc(Math.fround($rdiv(i5,10)))-(Math.trunc(Math.fround($rdiv(i5,100)))*10));
            $fwrite(file1,$wi(i6,1));
          }
          $fwrite(file1,"",true);
          $fwrite(file1,$ws("   ",0));
          for(var $e159=i4,$ie159=i2;$ie159<=$e159;$ie159++){
            i5=$ie159;
            i6=(i5-(Math.trunc(Math.fround($rdiv(i5,10)))*10));
            $fwrite(file1,$wi(i6,1));
          }
          $fwrite(file1,"",true);
          for(var $e160=i3,$ie160=i1;$ie160<=$e160;$ie160++){
            i5=$ie160;
            dun_line=$cap($wi(i5,3),133);
            for(var $e161=i4,$ie161=i2;$ie161<=$e161;$ie161++){
              i6=$ie161;
              if((test_light(i5,i6))){
                loc_symbol(i5,i6,{get v(){return tmp},set v($x){tmp=$x}});
              }else{
                tmp=" ";
              }
              dun_line=$cap((dun_line+tmp),133);
            }
            $fwrite(file1,$ws(dun_line,0),true);
          }
          i2=(i2+outpage_width);
        }while(!(((i2>=cur_width))));
        i1=(i1+outpage_height);
      }while(!(((i1>=cur_height))));
      $close(file1);
      prt("Completed.",1,1);
    }
  }
}
/* Prints a list of random objects to a file.  Note that -RAK- */
/* the objects produced is a sampling of objects which */
/* be expected to appear on that level. */
function* print_objects(){
  var nobj=0;
  var i1=0;
  var i2=0;
  var level=0;
  var filename1="";
  var tmp_str="";
  var file1=$file(()=>"");
  prt("Produce objects on what level?: ",1,1);
  (yield* get_string({get v(){return tmp_str},set v($x){tmp_str=$x}},1,33,10));
  level=0;
  (($rv=$readvs(tmp_str,["int"],true)),level=$rv[0]);
  prt("Produce how many objects?: ",1,1);
  (yield* get_string({get v(){return tmp_str},set v($x){tmp_str=$x}},1,28,10));
  nobj=0;
  (($rv=$readvs(tmp_str,["int"],true)),nobj=$rv[0]);
  if((((((nobj>0))&&((level>(-1))))&&((level<1201))))){
    if(((nobj>9999))){
      nobj=9999;
    }
    prt("File name: ",1,1);
    if(((yield* get_string({get v(){return filename1},set v($x){filename1=$x}},1,12,64)))){
      if(((filename1.length===0))){
        filename1=$cap("MORIAOBJ.DAT",80);
      }
      $open(file1,filename1,{error:"continue"});
      if((($status(file1)===0))){
        tmp_str=$cap($wi(nobj,1),80);
        prt((tmp_str+" random objects being produced..."),1,1);
        put_qio();
        $rewrite(file1);
        $fwrite(file1,$ws("*** Random Object Sampling:",0),true);
        $fwrite(file1,$ws("*** ",0)+$wi(nobj,1)+$ws(" objects",0),true);
        $fwrite(file1,$ws("*** For Level ",0)+$wi(level,1),true);
        $fwrite(file1,$ws("",0),true);
        $fwrite(file1,$ws("",0),true);
        popt({get v(){return i2},set v($x){i2=$x}});
        for(var $e162=nobj,$ie162=1;$ie162<=$e162;$ie162++){
          i1=$ie162;
          $assign(t_list[i2],object_list[get_obj_num(level)]);
          magic_treasure(i2,level);
          $assign(inventory[inven_max],t_list[i2]);
          var $w163=inventory[inven_max];
          unquote($rf($w163,"name_"));
          known1($rf($w163,"name_"));
          known2($rf($w163,"name_"));
          objdes({get v(){return tmp_str},set v($x){tmp_str=$x}},inven_max,true);
          $fwrite(file1,$ws(tmp_str,0),true);
        }
        pusht(i2);
        $close(file1);
        prt("Completed.",1,1);
      }else{
        prt("File could not be opened.",1,1);
      }
    }
  }
}
/* Prints a listing of monsters				-RAK- */
function* print_monsters(){
  var i1=0;
  var i2=0;
  var xpos=0;
  var atype=0;
  var adesc=0;
  var file1=$file(()=>"");
  var out_val="";
  var filename1="";
  var attstr="";
  var attx="";
  var damstr="";
  prt("File name: ",1,1);
  if(((yield* get_string({get v(){return filename1},set v($x){filename1=$x}},1,12,64)))){
    if(((filename1.length===0))){
      filename1=$cap("MORIAMON.DAT",80);
    }
    $open(file1,filename1,{error:"continue"});
    if((($status(file1)===0))){
      prt("Writing Monster Dictionary...",1,1);
      put_qio();
      $rewrite(file1);
      for(var $e164=max_creatures,$ie164=1;$ie164<=$e164;$ie164++){
        i1=$ie164;
        var $w165=c_list[i1];
        /* Begin writing to file */
        $fwrite(file1,$ws("--------------------------------------------",0),true);
        out_val=$cap(($w165.name_+"                              "),80);
        $fwrite(file1,$wi(i1,3)+$ws("  ",0)+$ws(out_val,30)+$ws("     (",0)+$ws($w165.cchar,1)+$ws(")",0),true);
        $fwrite(file1,$ws("     Speed =",0)+$wi($w165.speed,2)+$ws("  Level     =",0)+$wi($w165.level,2)+$ws("  Exp =",0)+$wi($w165.mexp,5),true);
        $fwrite(file1,$ws("     AC    =",0)+$wi($w165.ac,2)+$ws("  Eye-sight =",0)+$wi($w165.aaf,2)+$ws("  HD  =",0)+$ws($w165.hd,5),true);
        if(((((2147483648&$w165.cmove)>>>0)!==0))){
          $fwrite(file1,$ws("     Creature is a ***Win Creature***",0),true);
        }
        if(((((524288&$w165.cmove)>>>0)!==0))){
          $fwrite(file1,$ws("     Creature Eats/kills other creatures.",0),true);
        }
        if(((((1&$w165.cdefense)>>>0)!==0))){
          $fwrite(file1,$ws("     Creature is a dragon.",0),true);
        }
        if(((((2&$w165.cdefense)>>>0)!==0))){
          $fwrite(file1,$ws("     Creature is a monster.",0),true);
        }
        if(((((4&$w165.cdefense)>>>0)!==0))){
          $fwrite(file1,$ws("     Creature is evil.",0),true);
        }
        if(((((8&$w165.cdefense)>>>0)!==0))){
          $fwrite(file1,$ws("     Creature is undead.",0),true);
        }
        if(((((16&$w165.cdefense)>>>0)!==0))){
          $fwrite(file1,$ws("     Creature harmed by cold.",0),true);
        }
        if(((((32&$w165.cdefense)>>>0)!==0))){
          $fwrite(file1,$ws("     Creature harmed by fire.",0),true);
        }
        if(((((64&$w165.cdefense)>>>0)!==0))){
          $fwrite(file1,$ws("     Creature harmed by poison.",0),true);
        }
        if(((((128&$w165.cdefense)>>>0)!==0))){
          $fwrite(file1,$ws("     Creature harmed by acid.",0),true);
        }
        if(((((256&$w165.cdefense)>>>0)!==0))){
          $fwrite(file1,$ws("     Creature harmed by blue light.",0),true);
        }
        if(((((512&$w165.cdefense)>>>0)!==0))){
          $fwrite(file1,$ws("     Creature harmed by Stone-to-Mud.",0),true);
        }
        if(((((4096&$w165.cdefense)>>>0)!==0))){
          $fwrite(file1,$ws("     Creature cannot be charmed or slept.",0),true);
        }
        if(((((8192&$w165.cdefense)>>>0)!==0))){
          $fwrite(file1,$ws("     Creature seen with Infra-Vision.",0),true);
        }
        if(((((16384&$w165.cdefense)>>>0)!==0))){
          $fwrite(file1,$ws("     Creature has MAX hit points.",0),true);
        }
        if(((((65536&$w165.cmove)>>>0)!==0))){
          $fwrite(file1,$ws("     Creature is invisible.",0),true);
        }
        if(((((1048576&$w165.cmove)>>>0)!==0))){
          $fwrite(file1,$ws("     Creature picks up objects.",0),true);
        }
        if(((((2097152&$w165.cmove)>>>0)!==0))){
          $fwrite(file1,$ws("     Creature multiplies.",0),true);
        }
        if(((((16777216&$w165.cmove)>>>0)!==0))){
          $fwrite(file1,$ws("     Carries object(s).",0),true);
        }
        if(((((33554432&$w165.cmove)>>>0)!==0))){
          $fwrite(file1,$ws("     Carries gold, gems, ect.",0),true);
        }
        if(((((67108864&$w165.cmove)>>>0)!==0))){
          $fwrite(file1,$ws("       Has object/gold 60% of time.",0),true);
        }
        if(((((134217728&$w165.cmove)>>>0)!==0))){
          $fwrite(file1,$ws("       Has object/gold 90% of time.",0),true);
        }
        if(((((268435456&$w165.cmove)>>>0)!==0))){
          $fwrite(file1,$ws("       Has 1d2 object(s)/gold.",0),true);
        }
        if(((((536870912&$w165.cmove)>>>0)!==0))){
          $fwrite(file1,$ws("       Has 2d2 object(s)/gold.",0),true);
        }
        if(((((1073741824&$w165.cmove)>>>0)!==0))){
          $fwrite(file1,$ws("       Has 4d2 object(s)/gold.",0),true);
        }
        /* Creature casts spells / Breaths Dragon breath... */
        if((($w165.spells>0))){
          $fwrite(file1,$ws("   --Spells/Dragon Breath =",0),true);
          $fwrite(file1,$ws("       Casts spells 1 out of ",0)+$wi(((15&$w165.spells)>>>0),1)+$ws(" turns.",0),true);
          if(((((16&$w165.spells)>>>0)!==0))){
            $fwrite(file1,$ws("       Can teleport short.",0),true);
          }
          if(((((32&$w165.spells)>>>0)!==0))){
            $fwrite(file1,$ws("       Can teleport long.",0),true);
          }
          if(((((64&$w165.spells)>>>0)!==0))){
            $fwrite(file1,$ws("       Teleport player to itself.",0),true);
          }
          if(((((128&$w165.spells)>>>0)!==0))){
            $fwrite(file1,$ws("       Cause light wounds.",0),true);
          }
          if(((((256&$w165.spells)>>>0)!==0))){
            $fwrite(file1,$ws("       Cause serious wounds.",0),true);
          }
          if(((((512&$w165.spells)>>>0)!==0))){
            $fwrite(file1,$ws("       Hold person.",0),true);
          }
          if(((((1024&$w165.spells)>>>0)!==0))){
            $fwrite(file1,$ws("       Cause blindness.",0),true);
          }
          if(((((2048&$w165.spells)>>>0)!==0))){
            $fwrite(file1,$ws("       Cause confusion.",0),true);
          }
          if(((((4096&$w165.spells)>>>0)!==0))){
            $fwrite(file1,$ws("       Cause fear.",0),true);
          }
          if(((((8192&$w165.spells)>>>0)!==0))){
            $fwrite(file1,$ws("       Summon a monster.",0),true);
          }
          if(((((16384&$w165.spells)>>>0)!==0))){
            $fwrite(file1,$ws("       Summon an undead.",0),true);
          }
          if(((((32768&$w165.spells)>>>0)!==0))){
            $fwrite(file1,$ws("       Slow person.",0),true);
          }
          if(((((65536&$w165.spells)>>>0)!==0))){
            $fwrite(file1,$ws("       Drains mana for healing.",0),true);
          }
          if(((((131072&$w165.spells)>>>0)!==0))){
            $fwrite(file1,$ws("       **Unknown spell value**",0),true);
          }
          if(((((262144&$w165.spells)>>>0)!==0))){
            $fwrite(file1,$ws("       **Unknown spell value**",0),true);
          }
          if(((((524288&$w165.spells)>>>0)!==0))){
            $fwrite(file1,$ws("       Breaths Lightning Dragon Breath.",0),true);
          }
          if(((((1048576&$w165.spells)>>>0)!==0))){
            $fwrite(file1,$ws("       Breaths Gas Dragon Breath.",0),true);
          }
          if(((((2097152&$w165.spells)>>>0)!==0))){
            $fwrite(file1,$ws("       Breaths Acid Dragon Breath.",0),true);
          }
          if(((((4194304&$w165.spells)>>>0)!==0))){
            $fwrite(file1,$ws("       Breaths Frost Dragon Breath.",0),true);
          }
          if(((((8388608&$w165.spells)>>>0)!==0))){
            $fwrite(file1,$ws("       Breaths Fire Dragon Breath.",0),true);
          }
        }
        /* Movement for creature */
        $fwrite(file1,$ws("   --Movement =",0),true);
        if(((((1&$w165.cmove)>>>0)!==0))){
          $fwrite(file1,$ws("       Move only to attack.",0),true);
        }
        if(((((2&$w165.cmove)>>>0)!==0))){
          $fwrite(file1,$ws("       Move and attack normally.",0),true);
        }
        if(((((8&$w165.cmove)>>>0)!==0))){
          $fwrite(file1,$ws("       20% random movement.",0),true);
        }
        if(((((16&$w165.cmove)>>>0)!==0))){
          $fwrite(file1,$ws("       40% random movement.",0),true);
        }
        if(((((32&$w165.cmove)>>>0)!==0))){
          $fwrite(file1,$ws("       75% random movement.",0),true);
        }
        if(((((131072&$w165.cmove)>>>0)!==0))){
          $fwrite(file1,$ws("       Can open doors.",0),true);
        }
        if(((((262144&$w165.cmove)>>>0)!==0))){
          $fwrite(file1,$ws("       Can phase through walls.",0),true);
        }
        $fwrite(file1,$ws("   --Creature attacks =",0),true);
        attstr=$cap($w165.damage,80);
        while(((attstr.length>0))){
          xpos=$index(attstr,"|");
          if(((xpos>0))){
            attx=$cap($substr(attstr,1,(xpos-1)),80);
            attstr=$cap($substr(attstr,(xpos+1),(attstr.length-xpos)),80);
          }else{
            attx=$cap(attstr,80);
            attstr=$cap("",80);
          }
          (($rv=$readvs(attx,["int", "int", "str"],false)),atype=$rv[0],adesc=$rv[1],damstr=$cap($rv[2],5));
          out_val=$cap("",80);
          switch(adesc){
            case 1:{
              out_val=$cap("       Hits for ",80);
              break;
            }
            case 2:{
              out_val=$cap("       Bites for ",80);
              break;
            }
            case 3:{
              out_val=$cap("       Claws for ",80);
              break;
            }
            case 4:{
              out_val=$cap("       Stings for ",80);
              break;
            }
            case 5:{
              out_val=$cap("       Touches for ",80);
              break;
            }
            case 6:{
              out_val=$cap("       Kicks for ",80);
              break;
            }
            case 7:{
              out_val=$cap("       Gazes for ",80);
              break;
            }
            case 8:{
              out_val=$cap("       Breathes for ",80);
              break;
            }
            case 9:{
              out_val=$cap("       Spits for ",80);
              break;
            }
            case 10:{
              out_val=$cap("       Wails for ",80);
              break;
            }
            case 11:{
              out_val=$cap("       Embraces for ",80);
              break;
            }
            case 12:{
              out_val=$cap("       Crawls on you for ",80);
              break;
            }
            case 13:{
              out_val=$cap("       Shoots spores for ",80);
              break;
            }
            case 14:{
              out_val=$cap("       Begs for money for ",80);
              break;
            }
            case 15:{
              out_val=$cap("       Slimes you for ",80);
              break;
            }
            case 16:{
              out_val=$cap("       Crushes you for ",80);
              break;
            }
            case 17:{
              out_val=$cap("       Tramples you for ",80);
              break;
            }
            case 99:{
              out_val=$cap("       Is repelled...",80);
              break;
            }
            default:{
              out_val=$cap("     **Unknown value** ",80);
            }
          }
          switch(atype){
            case 1:{
              out_val=$cap((out_val+"normal damage."),80);
              break;
            }
            case 2:{
              /* Normal attack */
              out_val=$cap((out_val+"lowering strength."),80);
              break;
            }
            case 3:{
              /* Poison Strength */
              out_val=$cap((out_val+"confusion."),80);
              break;
            }
            case 4:{
              /* Confusion attack */
              out_val=$cap((out_val+"fear."),80);
              break;
            }
            case 5:{
              /* Fear attack */
              out_val=$cap((out_val+"fire damage."),80);
              break;
            }
            case 6:{
              /* Fire attack */
              out_val=$cap((out_val+"acid damage."),80);
              break;
            }
            case 7:{
              /* Acid attack */
              out_val=$cap((out_val+"cold damage."),80);
              break;
            }
            case 8:{
              /* Cold attack */
              out_val=$cap((out_val+"lightning damage."),80);
              break;
            }
            case 9:{
              /* Lightning attack */
              out_val=$cap((out_val+"corrosion damage."),80);
              break;
            }
            case 10:{
              /* Corrosion attack */
              out_val=$cap((out_val+"blindness."),80);
              break;
            }
            case 11:{
              /* Blindness attack */
              out_val=$cap((out_val+"paralyzation."),80);
              break;
            }
            case 12:{
              /* Paralysis attack */
              out_val=$cap((out_val+"stealing money."),80);
              break;
            }
            case 13:{
              /* Steal Money */
              out_val=$cap((out_val+"stealing object."),80);
              break;
            }
            case 14:{
              /* Steal Object */
              out_val=$cap((out_val+"poison damage."),80);
              break;
            }
            case 15:{
              /* Poison */
              out_val=$cap((out_val+"lose dexterity."),80);
              break;
            }
            case 16:{
              /* Lose Dex */
              out_val=$cap((out_val+"lose constitution."),80);
              break;
            }
            case 17:{
              /* Lose Con */
              out_val=$cap((out_val+"lose intelligence."),80);
              break;
            }
            case 18:{
              /* Lose Int */
              out_val=$cap((out_val+"lose wisdom."),80);
              break;
            }
            case 19:{
              /* Lose Wis */
              out_val=$cap((out_val+"lose experience."),80);
              break;
            }
            case 20:{
              /* Lose Exp */
              out_val=$cap((out_val+"aggravates monsters."),80);
              break;
            }
            case 21:{
              /* Aggravation */
              out_val=$cap((out_val+"disenchants objects."),80);
              break;
            }
            case 22:{
              /* Disenchant */
              out_val=$cap((out_val+"eating food."),80);
              break;
            }
            case 23:{
              /* Eats food */
              out_val=$cap((out_val+"eating light source."),80);
              break;
            }
            case 24:{
              /* Eats light */
              out_val=$cap((out_val+"absorbing charges."),80);
              break;
            }
            case 99:{
              /* Eats charges */
              out_val=$cap((out_val+"blank message."),80);
              break;
            }
            default:{
              /* Special */
              out_val=$cap((out_val+"**Unknown value**"),80);
            }
          }
          out_val=$cap((((out_val+" (")+damstr)+")"),80);
          $fwrite(file1,$ws(out_val,0),true);
        }
        for(var $e168=2,$ie168=1;$ie168<=$e168;$ie168++){
          i2=$ie168;
          $fwrite(file1,$ws(" ",0),true);
        }
      }
      /* End writing to file */
      $close(file1);
      prt("Completed.",1,1);
    }
  }
}
/* Print the character to a file or device		-RAK- */
function* file_character(){
  var i1=0;
  var i2=0;
  var xbth=0;
  var xbthb=0;
  var xfos=0;
  var xsrh=0;
  var xstl=0;
  var xdis=0;
  var xsave=0;
  var xdev=0;
  var xinfra="";
  var file1=$file(()=>"");
  var out_val="";
  var filename1="";
  var prt1="";
  var prt2="";
  var new_page="";
  var out_str="";
  var out_int="";
  var out_wis="";
  var out_dex="";
  var out_con="";
  var out_chr="";
  prt("File name: ",1,1);
  if(((yield* get_string({get v(){return filename1},set v($x){filename1=$x}},1,12,64)))){
    if(((filename1.length===0))){
      filename1=$cap("MORIACHR.DAT",80);
    }
    $open(file1,filename1,{error:"continue"});
    if((($status(file1)===0))){
      prt("Writing character sheet...",1,1);
      put_qio();
      $rewrite(file1);
      new_page=$cap($chr(12),80);
      $fwrite(file1,$ws(new_page,0),true);
      cnv_stat(py.stat.cstr,{get v(){return out_str},set v($x){out_str=$x}});
      cnv_stat(py.stat.cint,{get v(){return out_int},set v($x){out_int=$x}});
      cnv_stat(py.stat.cwis,{get v(){return out_wis},set v($x){out_wis=$x}});
      cnv_stat(py.stat.cdex,{get v(){return out_dex},set v($x){out_dex=$x}});
      cnv_stat(py.stat.ccon,{get v(){return out_con},set v($x){out_con=$x}});
      cnv_stat(py.stat.cchr,{get v(){return out_chr},set v($x){out_chr=$x}});
      $fwrite(file1,$ws(" ",0),true);
      $fwrite(file1,$ws(" ",0),true);
      $fwrite(file1,$ws(" ",0),true);
      $fwrite(file1,$ws("  Name  :",0)+$ws($pad(py.misc.name_," ",25),0));
      $fwrite(file1,$ws("  Age         :",0)+$wi(py.misc.age,4));
      $fwrite(file1,$ws("     Strength     :",0)+$ws(out_str,6),true);
      $fwrite(file1,$ws("  Race  :",0)+$ws($pad(py.misc.race," ",25),0));
      $fwrite(file1,$ws("  Height      :",0)+$wi(py.misc.ht,4));
      $fwrite(file1,$ws("     Intelligence :",0)+$ws(out_int,6),true);
      $fwrite(file1,$ws("  Sex   :",0)+$ws($pad(py.misc.sex," ",25),0));
      $fwrite(file1,$ws("  Weight      :",0)+$wi(py.misc.wt,4));
      $fwrite(file1,$ws("     Wisdom       :",0)+$ws(out_wis,6),true);
      $fwrite(file1,$ws("  Class :",0)+$ws($pad(py.misc.tclass," ",25),0));
      $fwrite(file1,$ws("  Social Class:",0)+$wi(py.misc.sc,4));
      $fwrite(file1,$ws("     Dexterity    :",0)+$ws(out_dex,6),true);
      $fwrite(file1,$ws("  Title :",0)+$ws($pad(py.misc.title," ",25),0));
      $fwrite(file1,$ws("               ",0)+$ws("    ",0));
      $fwrite(file1,$ws("     Constitution :",0)+$ws(out_con,6),true);
      $fwrite(file1,$ws("         ",0)+$ws(" ",30));
      $fwrite(file1,$ws("              ",0));
      $fwrite(file1,$ws("     Charisma     :",0)+$ws(out_chr,6),true);
      $fwrite(file1,$ws(" ",0),true);
      $fwrite(file1,$ws(" ",0),true);
      $fwrite(file1,$ws(" ",0),true);
      $fwrite(file1,$ws(" ",0),true);
      $fwrite(file1,$ws("  + To Hit    :",0)+$wi(py.misc.dis_th,6));
      $fwrite(file1,$ws("     Level      :",0)+$wi(py.misc.lev,6));
      $fwrite(file1,$ws("     Max Hit Points :",0)+$wi(py.misc.mhp,6),true);
      $fwrite(file1,$ws("  + To Damage :",0)+$wi(py.misc.dis_td,6));
      $fwrite(file1,$ws("     Experience :",0)+$wi(py.misc.exp,6));
      $fwrite(file1,$ws("     Cur Hit Points :",0)+$wi(Math.trunc(py.misc.chp),6),true);
      $fwrite(file1,$ws("  + To AC     :",0)+$wi(py.misc.dis_tac,6));
      $fwrite(file1,$ws("     Gold       :",0)+$wi(py.misc.au,6));
      $fwrite(file1,$ws("     Max Mana       :",0)+$wi(py.misc.mana,6),true);
      $fwrite(file1,$ws("    Total AC  :",0)+$wi(py.misc.dis_ac,6));
      $fwrite(file1,$ws("                       ",0));
      $fwrite(file1,$ws("     Cur Mana       :",0)+$wi(py.misc.mana,6),true);
      $fwrite(file1,$ws(" ",0),true);
      $fwrite(file1,$ws(" ",0),true);
      var $w169=py.misc;
      xbth=(($w169.bth+($w169.lev*bth_lev_adj))+($w169.ptohit*bth_plus_adj));
      xbthb=(($w169.bthb+($w169.lev*bth_lev_adj))+($w169.ptohit*bth_plus_adj));
      xfos=(27-$w169.fos);
      if(((xfos<0))){
        xfos=0;
      }
      xsrh=($w169.srh+int_adj());
      xstl=$w169.stl;
      xdis=((($w169.disarm+$w169.lev)+(2*todis_adj()))+int_adj());
      xsave=(($w169.save+$w169.lev)+wis_adj());
      xdev=(($w169.save+$w169.lev)+int_adj());
      xinfra=$cap($wi((py.flags.see_infra*10),1)+$ws(" feet",0),80);
      $fwrite(file1,$ws("(Miscellaneous Abilities)",40),true);
      $fwrite(file1,$ws(" ",0),true);
      $fwrite(file1,$ws("  Fighting    : ",0)+$ws($pad(likert(xbth,12)," ",10),0));
      $fwrite(file1,$ws("  Stealth     : ",0)+$ws($pad(likert(xstl,1)," ",10),0));
      $fwrite(file1,$ws("  Perception  : ",0)+$ws($pad(likert(xfos,3)," ",10),0),true);
      $fwrite(file1,$ws("  Throw/Bows  : ",0)+$ws($pad(likert(xbthb,12)," ",10),0));
      $fwrite(file1,$ws("  Disarming   : ",0)+$ws($pad(likert(xdis,8)," ",10),0));
      $fwrite(file1,$ws("  Searching   : ",0)+$ws($pad(likert(xsrh,6)," ",10),0),true);
      $fwrite(file1,$ws("  Saving Throw: ",0)+$ws($pad(likert(xsave,6)," ",10),0));
      $fwrite(file1,$ws("  Magic Device: ",0)+$ws($pad(likert(xdev,7)," ",10),0));
      $fwrite(file1,$ws("  Infra-Vision: ",0)+$ws($pad(xinfra," ",10),0),true);
      /* Write out the character's history */
      $fwrite(file1,$ws(" ",0),true);
      $fwrite(file1,$ws(" ",0),true);
      $fwrite(file1,$ws("Character Background",45),true);
      for(var $e170=5,$ie170=1;$ie170<=$e170;$ie170++){
        i1=$ie170;
        $fwrite(file1,$ws($pad(py.misc.history[i1]," ",71),76),true);
      }
      /* Write out the equipment list... */
      i2=0;
      $fwrite(file1,$ws(" ",0),true);
      $fwrite(file1,$ws(" ",0),true);
      $fwrite(file1,$ws("  [Character's Equipment List]",0),true);
      $fwrite(file1,$ws(" ",0),true);
      if(((equip_ctr===0))){
        $fwrite(file1,$ws("  Character has no equipment in use.",0),true);
      }else{
        for(var $e171=(inven_max-1),$ie171=23;$ie171<=$e171;$ie171++){
          i1=$ie171;
          var $w172=inventory[i1];
          if((($w172.tval>0))){
            switch(i1){
              case 23:{
                prt1=$cap(") You are wielding   : ",80);
                break;
              }
              case 24:{
                prt1=$cap(") Worn on head       : ",80);
                break;
              }
              case 25:{
                prt1=$cap(") Worn around neck   : ",80);
                break;
              }
              case 26:{
                prt1=$cap(") Worn on body       : ",80);
                break;
              }
              case 27:{
                prt1=$cap(") Worn on shield arm : ",80);
                break;
              }
              case 28:{
                prt1=$cap(") Worn on hands      : ",80);
                break;
              }
              case 29:{
                prt1=$cap(") Right ring finger  : ",80);
                break;
              }
              case 30:{
                prt1=$cap(") Left  ring finger  : ",80);
                break;
              }
              case 31:{
                prt1=$cap(") Worn on feet       : ",80);
                break;
              }
              case 32:{
                prt1=$cap(") Worn about body    : ",80);
                break;
              }
              case 33:{
                prt1=$cap(") Light source is    : ",80);
                break;
              }
              case 34:{
                prt1=$cap(") Secondary weapon   : ",80);
                break;
              }
              default:{
                prt1=$cap(") *Unknown value*    : ",80);
              }
            }
            i2=(i2+1);
            objdes({get v(){return prt2},set v($x){prt2=$x}},i1,true);
            out_val=$cap($ws("  ",0)+$ws($chr((i2+96)),0)+$ws(prt1,0)+$ws(prt2,0),80);
            $fwrite(file1,$ws(out_val,0),true);
          }
        }
      }
      /* Write out the character's inventory... */
      $fwrite(file1,$ws(new_page,0),true);
      $fwrite(file1,$ws(" ",0),true);
      $fwrite(file1,$ws(" ",0),true);
      $fwrite(file1,$ws(" ",0),true);
      $fwrite(file1,$ws("  [General Inventory List]",0),true);
      $fwrite(file1,$ws(" ",0),true);
      if(((inven_ctr===0))){
        $fwrite(file1,$ws("  Character has no objects in inventory.",0),true);
      }else{
        for(var $e174=inven_ctr,$ie174=1;$ie174<=$e174;$ie174++){
          i1=$ie174;
          objdes({get v(){return prt1},set v($x){prt1=$x}},i1,true);
          out_val=$cap($ws($chr((i1+96)),0)+$ws(") ",0)+$ws(prt1,0),80);
          $fwrite(file1,$ws(out_val,0),true);
        }
      }
      $fwrite(file1,$ws(new_page,0),true);
      $close(file1);
      prt("Completed.",1,1);
    }
  }
}
/* Returns the value for any given object		-RAK- */
function item_value(item){
  var $ret=0;
  function search_list(x1,x2){
    var $ret=0;
    var i1=0;
    var i2=0;
    i1=0;
    i2=0;
    do{
      i1=(i1+1);
      var $w175=object_list[i1];
      if((((($w175.tval===x1))&&(($w175.subval===x2))))){
        i2=$w175.cost;
      }
    }while(!(((((i1===max_objects))||((i2>0))))));
    $ret=i2;
    return $ret;
  }
  var $w176=item;
  $ret=$w176.cost;
  if(($in($w176.tval,$S19))){
    /* Weapons and armor */
    if((($index($w176.name_,"^")>0))){
      $ret=(search_list($w176.tval,$w176.subval)*$w176.number);
    }else if(($in($w176.tval,$S20))){
      if((($w176.tohit<0))){
        $ret=0;
      }else if((($w176.todam<0))){
        $ret=0;
      }else if((($w176.toac<0))){
        $ret=0;
      }else{
        $ret=((($w176.cost+(((($w176.tohit+$w176.todam)+$w176.toac))*100)))*$w176.number);
      }
    }else{
      if((($w176.toac<0))){
        $ret=0;
      }else{
        $ret=((($w176.cost+($w176.toac*100)))*$w176.number);
      }
    }
  }else if(($in($w176.tval,$S21))){
    /* Ammo */
    if((($index($w176.name_,"^")>0))){
      $ret=(search_list($w176.tval,1)*$w176.number);
    }else{
      if((($w176.tohit<0))){
        $ret=0;
      }else if((($w176.todam<0))){
        $ret=0;
      }else if((($w176.toac<0))){
        $ret=0;
      }else{
        $ret=((($w176.cost+(((($w176.tohit+$w176.todam)+$w176.toac))*10)))*$w176.number);
      }
    }
  }else if(($in($w176.tval,$S22))){
    /* Potions, Scrolls, and Food */
    if((($index($w176.name_,"|")>0))){
      switch($w176.tval){
        case 70:case 71:{
          $ret=20;
          break;
        }
        case 75:case 76:{
          $ret=20;
          break;
        }
        case 80:{
          $ret=1;
          break;
        }
        default:{
        }
      }
    }
  }else if(($in($w176.tval,$S23))){
    /* Rings and amulets */
    if((($index($w176.name_,"|")>0))){
      switch($w176.tval){
        case 40:{
          $ret=45;
          break;
        }
        case 45:{
          $ret=45;
          break;
        }
        default:{
        }
      }
    }else if((($index($w176.name_,"^")>0))){
      $ret=Math.abs($w176.cost);
    }
  }else if(($in($w176.tval,$S24))){
    /* Wands rods, and staffs */
    if((($index($w176.name_,"|")>0))){
      switch($w176.tval){
        case 55:{
          $ret=70;
          break;
        }
        case 60:{
          $ret=60;
          break;
        }
        case 65:{
          $ret=50;
          break;
        }
        default:{
        }
      }
    }else if((($index($w176.name_,"^")===0))){
      $ret=($w176.cost+(Math.trunc(Math.fround($rdiv($w176.cost,Math.fround(20.0))))*$w176.p1));
    }
  }
  return $ret;
}
/* Asking price for an item				-RAK- */
function sell_price(snum,max_sell,min_sell,item){
  var $ret=0;
  var i1=0;
  var $w180=store[snum];
  i1=item_value($clone(item));
  if(((item.cost>0))){
    i1=(i1+Math.trunc(Math.fround(i1*rgold_adj[owners[$w180.owner].owner_race][py.misc.prace])));
    if(((i1<1))){
      i1=1;
    }
    max_sell.v=Math.trunc(Math.fround(i1*(Math.fround(1+owners[$w180.owner].max_inflate))));
    min_sell.v=Math.trunc(Math.fround(i1*(Math.fround(1+owners[$w180.owner].min_inflate))));
    if(((min_sell.v>max_sell.v))){
      min_sell.v=max_sell.v;
    }
    $ret=i1;
  }else{
    max_sell.v=0;
    min_sell.v=0;
    $ret=0;
  }
  return $ret;
}
/* Check to see if he will be carrying too many objects	-RAK- */
function store_check_num(store_num){
  var $ret=false;
  var item_num=0;
  var i1=0;
  var flag=false;
  $ret=false;
  var $w181=store[store_num];
  if((($w181.store_ctr<store_inven_max))){
    $ret=true;
  }else if(((((inventory[inven_max].subval>255))&&((inventory[inven_max].subval<512))))){
    for(var $e182=$w181.store_ctr,$ie182=1;$ie182<=$e182;$ie182++){
      i1=$ie182;
      var $w183=$w181.store_inven[i1].sitem;
      if((($w183.tval===inventory[inven_max].tval))){
        if((($w183.subval===inventory[inven_max].subval))){
          $ret=true;
        }
      }
    }
  }
  return $ret;
}
/* Add the item in INVEN_MAX to stores inventory.	-RAK- */
function store_carry(store_num,ipos){
  var item_num=0;
  var item_val=0;
  var typ=0;
  var subt=0;
  var icost=0;
  var dummy=0;
  var flag=false;
  /* Insert INVEN_MAX at given location */
  function insert(store_num,pos,icost){
    var i1=0;
    var $w184=store[store_num];
    for(var $e185=pos,$ie185=$w184.store_ctr;$ie185>=$e185;$ie185--){
      i1=$ie185;
      $assign($w184.store_inven[(i1+1)],$w184.store_inven[i1]);
    }
    $assign($w184.store_inven[pos].sitem,inventory[inven_max]);
    $w184.store_inven[pos].scost=(-icost);
    $w184.store_ctr=($w184.store_ctr+1);
  }
  /* Store_carry routine */
  ipos.v=0;
  identify($clone(inventory[inven_max]));
  known2($rf(inventory[inven_max],"name_"));
  sell_price(store_num,{get v(){return icost},set v($x){icost=$x}},{get v(){return dummy},set v($x){dummy=$x}},$clone(inventory[inven_max]));
  if(((icost>0))){
    var $w186=inventory[inven_max];
    var $w187=store[store_num];
    item_val=0;
    item_num=$w186.number;
    flag=false;
    typ=$w186.tval;
    subt=$w186.subval;
    do{
      item_val=(item_val+1);
      var $w188=$w187.store_inven[item_val].sitem;
      if(((typ===$w188.tval))){
        if(((subt===$w188.subval))){
          /* Adds to other item */
          if(((subt>255))){
            if((($w188.number<24))){
              $w188.number=($w188.number+item_num);
            }
            flag=true;
          }
        }
      }else if(((typ>$w188.tval))){
        /* Insert into list */
        insert(store_num,item_val,icost);
        flag=true;
        ipos.v=item_val;
      }
    }while(!(((((item_val>=$w187.store_ctr))||(flag)))));
    if((!(flag))){
      /* Becomes last item in list */
      insert(store_num,($w187.store_ctr+1),icost);
      ipos.v=$w187.store_ctr;
    }
  }
}
/* Destroy an item in the stores inventory.  Note that if */
/* 'one_of' is false, an entire slot is destroyed	-RAK- */
function store_destroy(store_num,item_val,one_of){
  var i2=0;
  var $w189=store[store_num];
  $assign(inventory[inven_max],$w189.store_inven[item_val].sitem);
  var $w190=$w189.store_inven[item_val].sitem;
  if(((((($w190.number>1))&&(($w190.subval<512)))&&(one_of)))){
    $w190.number=($w190.number-1);
    inventory[inven_max].number=1;
  }else{
    for(var $e191=($w189.store_ctr-1),$ie191=item_val;$ie191<=$e191;$ie191++){
      i2=$ie191;
      $assign($w189.store_inven[i2],$w189.store_inven[(i2+1)]);
    }
    $assign($w189.store_inven[$w189.store_ctr].sitem,blank_treasure);
    $w189.store_inven[$w189.store_ctr].scost=0;
    $w189.store_ctr=($w189.store_ctr-1);
  }
}
/* Initializes the stores with owners			-RAK- */
function store_init(){
  var i1=0;
  var i2=0;
  var i3=0;
  i1=$idiv(max_owners,max_stores);
  for(var $e192=max_stores,$ie192=1;$ie192<=$e192;$ie192++){
    i2=$ie192;
    var $w193=store[i2];
    $w193.owner=((max_stores*((randint(i1)-1)))+i2);
    $w193.insult_cur=0;
    $w193.store_open=0;
    $w193.store_ctr=0;
    for(var $e194=store_inven_max,$ie194=1;$ie194<=$e194;$ie194++){
      i3=$ie194;
      $assign($w193.store_inven[i3].sitem,blank_treasure);
      $w193.store_inven[i3].scost=0;
    }
  }
}
/* Creates an item and inserts it into store's inven	-RAK- */
function store_create(store_num){
  var i1=0;
  var tries=0;
  var cur_pos=0;
  var dummy=0;
  tries=0;
  popt({get v(){return cur_pos},set v($x){cur_pos=$x}});
  var $w195=store[store_num];
  do{
    i1=store_choice[store_num][randint(store_S_choices)];
    $assign(t_list[cur_pos],inventory_init[i1]);
    magic_treasure(cur_pos,obj_town_level);
    $assign(inventory[inven_max],t_list[cur_pos]);
    if((store_check_num(store_num))){
      var $w196=t_list[cur_pos];
      if((($w196.cost>0))){
        /* Item must be good */
        if((($w196.cost<owners[$w195.owner].max_cost))){
          store_carry(store_num,{get v(){return dummy},set v($x){dummy=$x}});
          tries=10;
        }
      }
    }
    tries=(tries+1);
  }while(!(((tries>3))));
  pusht(cur_pos);
}
/* Initialize and up-keep the store's inventory.		-RAK- */
function store_maint(){
  var i1=0;
  var i2=0;
  var dummy=0;
  for(var $e197=max_stores,$ie197=1;$ie197<=$e197;$ie197++){
    i1=$ie197;
    var $w198=store[i1];
    $w198.insult_cur=0;
    if((($w198.store_ctr>store_S_max_inven))){
      for(var $e199=((($w198.store_ctr-store_S_max_inven)+2)),$ie199=1;$ie199<=$e199;$ie199++){
        i2=$ie199;
        store_destroy(i1,randint($w198.store_ctr),false);
      }
    }else if((($w198.store_ctr<store_S_min_inven))){
      for(var $e200=(((store_S_min_inven-$w198.store_ctr)+2)),$ie200=1;$ie200<=$e200;$ie200++){
        i2=$ie200;
        store_create(i1);
      }
    }else{
      for(var $e201=((1+randint(store_S_turn_around))),$ie201=1;$ie201<=$e201;$ie201++){
        i2=$ie201;
        store_destroy(i1,randint($w198.store_ctr),true);
      }
      for(var $e202=((1+randint(store_S_turn_around))),$ie202=1;$ie202<=$e202;$ie202++){
        i2=$ie202;
        store_create(i1);
      }
    }
  }
}
/* This save package was brought to by			-JWT-
   	  and                                                   -RAK- */
/* Data Corruption means character is dead, or save file was -RAK-
   	  screwed with.  Keep them guessing as to what is actually wrong. */
function data_exception(){
  clear(1,1);
  prt("Data Corruption Error.",1,1);
  prt("",2,1);
  exit();
}
/* Uses XOR function to encode data			-RAK- */
function coder(line){
  var i1=0;
  var i2=0;
  var i3=0;
  var i4=0;
  for(var $e203=line.v.length,$ie203=1;$ie203<=$e203;$ie203++){
    i1=$ie203;
    i2=(($ord($ch(line.v,i1)))>>>0);
    i3=(((randint(256)-1))>>>0);
    i4=((i2^i3)>>>0);
    line.v=$setch(line.v,i1,$chr(i4));
  }
}
/* Encrypts a line of text, complete with a data-check sum-RAK- */
/* (original by JWT) */
function encrypt(line){
  var i1=0;
  var i2=0;
  var temp="";
  i2=0;
  for(var $e204=line.v.length,$ie204=1;$ie204<=$e204;$ie204++){
    i1=$ie204;
    i2=((i2+$ord($ch(line.v,i1)))+i1);
  }
  temp=$cap(line.v,1024);
  line.v=$cap($wi(i2,1)+$ws(" ",0)+$ws(temp,0),1024);
  coder(line);
}
/* Decrypts a line of text, complete with a data-check sum-RAK- */
/* (original by JWT) */
function decrypt(line){
  var i1=0;
  var i2=0;
  var i3=0;
  var temp="";
  var tmp='\0';
  i2=0;
  coder(line);
  temp=$cap(line.v,1024);
  (($rv=$readvs(temp,["int", "char", "str"],false)),i3=$rv[0],tmp=$rv[1],line.v=$cap($rv[2],1024));
  for(var $e205=line.v.length,$ie205=1;$ie205<=$e205;$ie205++){
    i1=$ie205;
    i2=((i2+$ord($ch(line.v,i1)))+i1);
  }
  if(((i2!==i3))){
    data_exception();
  }
}
/* Actual save procedure 			-RAK- & -JWT- */
function* save_char(){
  var $ret=false;
  var tot_monsters=0;
  var tot_treasure=0;
  var i1=0;
  var i2=0;
  var trys=0;
  var xfloor=0;
  var save_seed=0;
  var fnam="";
  var temp="";
  var out_rec="";
  var title1="";
  var title2="";
  var f1=$file(()=>"");
  var f2=$file(()=>({file_id:"",seed:0}));
  var flag=false;
  var file_flag=false;
  prt("Enter Filename:",1,1);
  flag=false;
  /* Open the user's save file                             -JWT- */
  if(((yield* get_string({get v(){return fnam},set v($x){fnam=$x}},1,17,60)))){
    if(((fnam.length===0))){
      fnam=$cap("MORIACHR.SAV",80);
    }
    $open(f1,null,{file_name:fnam,record_length:1024,error:"continue"});
    if((($status(f1)!==0))){
      (yield* msg_print(("Error creating> "+fnam)));
    }else{
      flag=true;
    }
  }
  /* Make an attempt to open the MASTER file               -JWT- */
  if((flag)){
    $rewrite(f1);
    priv_switch(1);
    $open(f2,null,{file_name:moria_mas,error:"continue",access_method:"keyed",organization:"indexed",history:"old",sharing:"readwrite"});
    if((($status(f2)!==0))){
      priv_switch(0);
      $open(f2,null,{file_name:moria_mas,error:"continue",access_method:"keyed",organization:"indexed",history:"new",sharing:"readwrite"});
    }
    if((($status(f2)!==0))){
      (yield* msg_print("Error saving character, contact MORIA Wizard."));
      $close(f1);
      flag=false;
    }
  }
  /* Make an attempt to create a unique ID and write to MASTER -RAK- */
  if((flag)){
    trys=0;
    file_flag=false;
    do{
      for(var $e206=70,$ie206=1;$ie206<=$e206;$ie206++){
        i1=$ie206;
        temp=$setch(temp,i1,$chr((31+randint(95))));
      }
      title1=$cap(temp,1024);
      seed=encrypt_seed1;
      coder({get v(){return title1},set v($x){title1=$x}});
      for(var $e207=70,$ie207=1;$ie207<=$e207;$ie207++){
        i1=$ie207;
        key_rec.file_id=$setch(key_rec.file_id,i1,$ch(title1,i1));
      }
      $assign(f2.buf,key_rec);
      $put(f2);
      if((($status(f2)!==0))){
        trys=(trys+1);
        if(((trys>5))){
          file_flag=true;
          flag=false;
          (yield* msg_print("Error in writing to MASTER."));
        }
      }else{
        file_flag=true;
      }
    }while(!((file_flag)));
    $close(f2);
    priv_switch(0);
  }
  /* If ID was written to MASTER, continue saving          -RAK- */
  if((flag)){
    save_seed=get_seed();
    title2=$cap($wi(save_seed,12)+$ws(" ",0)+$ws(temp,0),1024);
    seed=encrypt_seed2;
    encrypt({get v(){return title2},set v($x){title2=$x}});
    $fwrite(f1,$ws(title2,0),true);
    seed=save_seed;
    /* Message to player on what is happening */
    clear(1,1);
    prt("Saving character...",1,1);
    put_qio();
    /* Version number of Moria */
    out_rec=$cap($wr(cur_version,0,null),1024);
    encrypt({get v(){return out_rec},set v($x){out_rec=$x}});
    $fwrite(f1,$ws(out_rec,0),true);
    /* Write out the player record. */
    var $w208=py.misc;
    out_rec=$cap($ws($w208.name_,0),1024);
    encrypt({get v(){return out_rec},set v($x){out_rec=$x}});
    $fwrite(f1,$ws(out_rec,0),true);
    out_rec=$cap($ws($w208.race,0),1024);
    encrypt({get v(){return out_rec},set v($x){out_rec=$x}});
    $fwrite(f1,$ws(out_rec,0),true);
    out_rec=$cap($ws($w208.sex,0),1024);
    encrypt({get v(){return out_rec},set v($x){out_rec=$x}});
    $fwrite(f1,$ws(out_rec,0),true);
    out_rec=$cap($ws($w208.tclass,0),1024);
    encrypt({get v(){return out_rec},set v($x){out_rec=$x}});
    $fwrite(f1,$ws(out_rec,0),true);
    out_rec=$cap($ws($w208.title,0),1024);
    encrypt({get v(){return out_rec},set v($x){out_rec=$x}});
    $fwrite(f1,$ws(out_rec,0),true);
    for(var $e209=5,$ie209=1;$ie209<=$e209;$ie209++){
      i1=$ie209;
      out_rec=$cap($w208.history[i1],1024);
      encrypt({get v(){return out_rec},set v($x){out_rec=$x}});
      $fwrite(f1,$ws(out_rec,0),true);
    }
    out_rec=$cap($wi(char_row,1)+$ws(" ",0)+$wi(char_col,1)+$ws(" ",0)+$wi($w208.pclass,1)+$ws(" ",0)+$wi($w208.prace,1)+$ws(" ",0)+$wi($w208.age,1)+$ws(" ",0)+$wi($w208.ht,1)+$ws(" ",0)+$wi($w208.wt,1)+$ws(" ",0)+$wi($w208.sc,1)+$ws(" ",0)+$wi($w208.max_exp,1)+$ws(" ",0)+$wi($w208.exp,1)+$ws(" ",0)+$wi($w208.lev,1)+$ws(" ",0)+$wi($w208.max_lev,1)+$ws(" ",0)+$wr($w208.expfact,2,1),1024);
    encrypt({get v(){return out_rec},set v($x){out_rec=$x}});
    $fwrite(f1,$ws(out_rec,0),true);
    out_rec=$cap($wi($w208.srh,1)+$ws(" ",0)+$wi($w208.fos,1)+$ws(" ",0)+$wi($w208.stl,1)+$ws(" ",0)+$wi($w208.bth,1)+$ws(" ",0)+$wi($w208.bthb,1)+$ws(" ",0)+$wi($w208.mana,1)+$ws(" ",0)+$wr($w208.cmana,1,null)+$ws(" ",0)+$wi($w208.mhp,1)+$ws(" ",0)+$wr($w208.chp,1,1)+$ws(" ",0)+$wi($w208.au,1)+$ws(" ",0)+$wi($w208.ptohit,1)+$ws(" ",0)+$wi($w208.ptodam,1)+$ws(" ",0)+$wi($w208.pac,1)+$ws(" ",0)+$wi($w208.ptoac,1)+$ws(" ",0)+$wi($w208.dis_th,1)+$ws(" ",0)+$wi($w208.dis_td,1)+$ws(" ",0)+$wi($w208.dis_ac,1)+$ws(" ",0)+$wi($w208.dis_tac,1)+$ws(" ",0)+$wi($w208.disarm,1)+$ws(" ",0)+$wi($w208.save,1)+$ws(" ",0)+$wi($w208.hitdie,1),1024);
    encrypt({get v(){return out_rec},set v($x){out_rec=$x}});
    $fwrite(f1,$ws(out_rec,0),true);
    out_rec=$cap($wi(inven_ctr,1)+$ws(" ",0)+$wi(inven_weight,1)+$ws(" ",0)+$wi(equip_ctr,1)+$ws(" ",0)+$wi(dun_level,1)+$ws(" ",0)+$wi(missle_ctr,1)+$ws(" ",0)+$wi(mon_tot_mult,1)+$ws(" ",0)+$wi(((15&turn)>>>0),1)+$ws(" ",0)+$wi(randes_seed,12),1024);
    encrypt({get v(){return out_rec},set v($x){out_rec=$x}});
    $fwrite(f1,$ws(out_rec,0),true);
    /* Write out the inventory records. */
    for(var $e210=inven_ctr,$ie210=1;$ie210<=$e210;$ie210++){
      i1=$ie210;
      out_rec=$cap($ws(inventory[i1].tchar,0)+$ws(inventory[i1].name_,0),1024);
      encrypt({get v(){return out_rec},set v($x){out_rec=$x}});
      $fwrite(f1,$ws(out_rec,0),true);
      out_rec=$cap($ws(inventory[i1].damage,0),1024);
      encrypt({get v(){return out_rec},set v($x){out_rec=$x}});
      $fwrite(f1,$ws(out_rec,0),true);
      var $w211=inventory[i1];
      out_rec=$cap($wi($w211.tval,1)+$ws(" ",0)+$wi($w211.subval,1)+$ws(" ",0)+$wi($w211.weight,1)+$ws(" ",0)+$wi($w211.number,1)+$ws(" ",0)+$wi($w211.tohit,1)+$ws(" ",0)+$wi($w211.todam,1)+$ws(" ",0)+$wi($w211.ac,1)+$ws(" ",0)+$wi($w211.toac,1)+$ws(" ",0)+$wi($w211.p1,1)+$ws(" ",0)+$wi($w211.flags,1)+$ws(" ",0)+$wi($w211.level,1)+$ws(" ",0)+$wi($w211.cost,1),1024);
      encrypt({get v(){return out_rec},set v($x){out_rec=$x}});
      $fwrite(f1,$ws(out_rec,0),true);
    }
    /* Write out the equipment records. */
    for(var $e212=(inven_max-1),$ie212=23;$ie212<=$e212;$ie212++){
      i1=$ie212;
      out_rec=$cap($ws(inventory[i1].tchar,0)+$ws(inventory[i1].name_,0),1024);
      encrypt({get v(){return out_rec},set v($x){out_rec=$x}});
      $fwrite(f1,$ws(out_rec,0),true);
      out_rec=$cap($ws(inventory[i1].damage,0),1024);
      encrypt({get v(){return out_rec},set v($x){out_rec=$x}});
      $fwrite(f1,$ws(out_rec,0),true);
      var $w213=inventory[i1];
      out_rec=$cap($wi($w213.tval,1)+$ws(" ",0)+$wi($w213.subval,1)+$ws(" ",0)+$wi($w213.weight,1)+$ws(" ",0)+$wi($w213.number,1)+$ws(" ",0)+$wi($w213.tohit,1)+$ws(" ",0)+$wi($w213.todam,1)+$ws(" ",0)+$wi($w213.ac,1)+$ws(" ",0)+$wi($w213.toac,1)+$ws(" ",0)+$wi($w213.p1,1)+$ws(" ",0)+$wi($w213.flags,1)+$ws(" ",0)+$wi($w213.level,1)+$ws(" ",0)+$wi($w213.cost,1),1024);
      encrypt({get v(){return out_rec},set v($x){out_rec=$x}});
      $fwrite(f1,$ws(out_rec,0),true);
    }
    var $w214=py.stat;
    out_rec=$cap($wi($w214.str,1)+$ws(" ",0)+$wi($w214.cstr,1)+$ws(" ",0)+$wi($w214.dex,1)+$ws(" ",0)+$wi($w214.cdex,1)+$ws(" ",0)+$wi($w214.con,1)+$ws(" ",0)+$wi($w214.ccon,1)+$ws(" ",0)+$wi($w214.int,1)+$ws(" ",0)+$wi($w214.cint,1)+$ws(" ",0)+$wi($w214.wis,1)+$ws(" ",0)+$wi($w214.cwis,1)+$ws(" ",0)+$wi($w214.chr,1)+$ws(" ",0)+$wi($w214.cchr,1),1024);
    encrypt({get v(){return out_rec},set v($x){out_rec=$x}});
    $fwrite(f1,$ws(out_rec,0),true);
    var $w215=py.flags;
    out_rec=$cap($wi($w215.status,1)+$ws(" ",0)+$wi($w215.blind,1)+$ws(" ",0)+$wi($w215.confused,1)+$ws(" ",0)+$wi($w215.food,1)+$ws(" ",0)+$wi($w215.food_digested,1)+$ws(" ",0)+$wi($w215.protection,1)+$ws(" ",0)+$wi($w215.speed,1)+$ws(" ",0)+$wi($w215.afraid,1)+$ws(" ",0)+$wi($w215.poisoned,1)+$ws(" ",0)+$wb($w215.see_inv,1),1024);
    encrypt({get v(){return out_rec},set v($x){out_rec=$x}});
    $fwrite(f1,$ws(out_rec,0),true);
    out_rec=$cap($wi($w215.fast,1)+$ws(" ",0)+$wi($w215.slow,1)+$ws(" ",0)+$wi($w215.protevil,1)+$ws(" ",0)+$wb($w215.teleport,1)+$ws(" ",0)+$wb($w215.free_act,1)+$ws(" ",0)+$wb($w215.slow_digest,1),1024);
    encrypt({get v(){return out_rec},set v($x){out_rec=$x}});
    $fwrite(f1,$ws(out_rec,0),true);
    out_rec=$cap($wb($w215.aggravate,1)+$ws(" ",0)+$wb($w215.sustain_str,1)+$ws(" ",0)+$wb($w215.sustain_int,1)+$ws(" ",0)+$wb($w215.sustain_wis,1)+$ws(" ",0)+$wb($w215.sustain_con,1)+$ws(" ",0)+$wb($w215.sustain_dex,1)+$ws(" ",0)+$wb($w215.sustain_chr,1),1024);
    encrypt({get v(){return out_rec},set v($x){out_rec=$x}});
    $fwrite(f1,$ws(out_rec,0),true);
    out_rec=$cap($wb($w215.fire_resist,1)+$ws(" ",0)+$wb($w215.cold_resist,1)+$ws(" ",0)+$wb($w215.acid_resist,1)+$ws(" ",0)+$wb($w215.regenerate,1)+$ws(" ",0)+$wb($w215.lght_resist,1)+$ws(" ",0)+$wb($w215.ffall,1)+$ws(" ",0)+$wb($w215.confuse_monster,1),1024);
    encrypt({get v(){return out_rec},set v($x){out_rec=$x}});
    $fwrite(f1,$ws(out_rec,0),true);
    out_rec=$cap($wi($w215.image,1)+$ws(" ",0)+$wi($w215.invuln,1)+$ws(" ",0)+$wi($w215.hero,1)+$ws(" ",0)+$wi($w215.shero,1)+$ws(" ",0)+$wi($w215.blessed,1)+$ws(" ",0)+$wi($w215.resist_heat,1)+$ws(" ",0)+$wi($w215.resist_cold,1)+$ws(" ",0)+$wi($w215.detect_inv,1)+$ws(" ",0)+$wi($w215.word_recall,1)+$ws(" ",0)+$wi($w215.see_infra,1)+$ws(" ",0)+$wi($w215.tim_infra,1),1024);
    encrypt({get v(){return out_rec},set v($x){out_rec=$x}});
    $fwrite(f1,$ws(out_rec,0),true);
    for(var $e216=31,$ie216=1;$ie216<=$e216;$ie216++){
      i1=$ie216;
      var $w217=magic_spell[py.misc.pclass][i1];
      out_rec=$cap($wb($w217.learned,5)+$ws(" ",0)+$wi($w217.sexp,5),1024);
      encrypt({get v(){return out_rec},set v($x){out_rec=$x}});
      $fwrite(f1,$ws(out_rec,0),true);
    }
    /* Write the important dungeon info and floor	-RAK- */
    out_rec=$cap($wi(cur_height,1)+$ws(" ",0)+$wi(cur_width,1)+$ws(" ",0)+$wi(max_panel_rows,1)+$ws(" ",0)+$wi(max_panel_cols,1),1024);
    encrypt({get v(){return out_rec},set v($x){out_rec=$x}});
    $fwrite(f1,$ws(out_rec,0),true);
    /* Save the floor */
    tot_treasure=0;
    for(var $e218=cur_height,$ie218=1;$ie218<=$e218;$ie218++){
      i1=$ie218;
      out_rec=$cap($pad(" "," ",cur_width),1024);
      for(var $e219=cur_width,$ie219=1;$ie219<=$e219;$ie219++){
        i2=$ie219;
        var $w220=cave[i1][i2];
        xfloor=$w220.fval;
        if(($w220.fopen)){
          xfloor=((xfloor|16)>>>0);
        }
        if(($w220.pl)){
          xfloor=((xfloor|32)>>>0);
        }
        if(($w220.fm)){
          xfloor=((xfloor|64)>>>0);
        }
        out_rec=$setch(out_rec,i2,$chr(xfloor));
        if((($w220.tptr>0))){
          tot_treasure=(tot_treasure+1);
        }
      }
      encrypt({get v(){return out_rec},set v($x){out_rec=$x}});
      $fwrite(f1,$ws(out_rec,0),true);
    }
    /* Save the Treasure List */
    out_rec=$cap($wi(tot_treasure,1),1024);
    encrypt({get v(){return out_rec},set v($x){out_rec=$x}});
    $fwrite(f1,$ws(out_rec,0),true);
    for(var $e221=cur_height,$ie221=1;$ie221<=$e221;$ie221++){
      i1=$ie221;
      for(var $e222=cur_width,$ie222=1;$ie222<=$e222;$ie222++){
        i2=$ie222;
        if(((cave[i1][i2].tptr>0))){
          var $w223=t_list[cave[i1][i2].tptr];
          out_rec=$cap($wi(i1,1)+$ws(" ",0)+$wi(i2,1),1024);
          encrypt({get v(){return out_rec},set v($x){out_rec=$x}});
          $fwrite(f1,$ws(out_rec,0),true);
          out_rec=$cap($ws($w223.tchar,0)+$ws($w223.name_,0),1024);
          encrypt({get v(){return out_rec},set v($x){out_rec=$x}});
          $fwrite(f1,$ws(out_rec,0),true);
          out_rec=$cap($ws($w223.damage,0),1024);
          encrypt({get v(){return out_rec},set v($x){out_rec=$x}});
          $fwrite(f1,$ws(out_rec,0),true);
          out_rec=$cap($wi($w223.tval,1)+$ws(" ",0)+$wi($w223.subval,1)+$ws(" ",0)+$wi($w223.weight,1)+$ws(" ",0)+$wi($w223.number,1)+$ws(" ",0)+$wi($w223.tohit,1)+$ws(" ",0)+$wi($w223.todam,1)+$ws(" ",0)+$wi($w223.ac,1)+$ws(" ",0)+$wi($w223.toac,1)+$ws(" ",0)+$wi($w223.p1,1)+$ws(" ",0)+$wi($w223.flags,1)+$ws(" ",0)+$wi($w223.level,1)+$ws(" ",0)+$wi($w223.cost,1),1024);
          encrypt({get v(){return out_rec},set v($x){out_rec=$x}});
          $fwrite(f1,$ws(out_rec,0),true);
        }
      }
    }
    /* Save identified list */
    out_rec=$cap("",1024);
    for(var $e224=max_objects,$ie224=1;$ie224<=$e224;$ie224++){
      i1=$ie224;
      if((object_ident[i1])){
        out_rec=$cap((out_rec+"T"),1024);
      }else{
        out_rec=$cap((out_rec+"F"),1024);
      }
    }
    encrypt({get v(){return out_rec},set v($x){out_rec=$x}});
    $fwrite(f1,$ws(out_rec,0),true);
    /* Save the Monster List */
    i1=muptr;
    tot_monsters=0;
    if(((i1>0))){
      do{
        tot_monsters=(tot_monsters+1);
        var $w225=m_list[i1];
        i1=$w225.nptr;
      }while(!(((i1===0))));
    }
    out_rec=$cap($wi(tot_monsters,1),1024);
    encrypt({get v(){return out_rec},set v($x){out_rec=$x}});
    $fwrite(f1,$ws(out_rec,0),true);
    i1=muptr;
    if(((i1>0))){
      do{
        var $w226=m_list[i1];
        out_rec=$cap($wi($w226.fy,1)+$ws(" ",0)+$wi($w226.fx,1)+$ws(" ",0)+$wi($w226.mptr,1)+$ws(" ",0)+$wi($w226.hp,1)+$ws(" ",0)+$wi($w226.cspeed,1)+$ws(" ",0)+$wi($w226.csleep,1)+$ws(" ",0)+$wi($w226.cdis,1)+$ws(" ",0)+$wb($w226.ml,1)+$ws(" ",0)+$wb($w226.confused,1),1024);
        encrypt({get v(){return out_rec},set v($x){out_rec=$x}});
        $fwrite(f1,$ws(out_rec,0),true);
        i1=$w226.nptr;
      }while(!(((i1===0))));
    }
    /* Save the town level stores */
    out_rec=$cap($wi(town_seed,12),1024);
    encrypt({get v(){return out_rec},set v($x){out_rec=$x}});
    $fwrite(f1,$ws(out_rec,0),true);
    for(var $e227=max_stores,$ie227=1;$ie227<=$e227;$ie227++){
      i1=$ie227;
      var $w228=store[i1];
      /* Save items... */
      out_rec=$cap($wi($w228.store_ctr,1),1024);
      encrypt({get v(){return out_rec},set v($x){out_rec=$x}});
      $fwrite(f1,$ws(out_rec,0),true);
      for(var $e229=$w228.store_ctr,$ie229=1;$ie229<=$e229;$ie229++){
        i2=$ie229;
        var $w230=$w228.store_inven[i2].sitem;
        out_rec=$cap($wi($w228.store_inven[i2].scost,-1),1024);
        encrypt({get v(){return out_rec},set v($x){out_rec=$x}});
        $fwrite(f1,$ws(out_rec,0),true);
        out_rec=$cap($ws($w230.tchar,0)+$ws($w230.name_,0),1024);
        encrypt({get v(){return out_rec},set v($x){out_rec=$x}});
        $fwrite(f1,$ws(out_rec,0),true);
        out_rec=$cap($ws($w230.damage,0),1024);
        encrypt({get v(){return out_rec},set v($x){out_rec=$x}});
        $fwrite(f1,$ws(out_rec,0),true);
        out_rec=$cap($wi($w230.tval,1)+$ws(" ",0)+$wi($w230.subval,1)+$ws(" ",0)+$wi($w230.weight,1)+$ws(" ",0)+$wi($w230.number,1)+$ws(" ",0)+$wi($w230.tohit,1)+$ws(" ",0)+$wi($w230.todam,1)+$ws(" ",0)+$wi($w230.ac,1)+$ws(" ",0)+$wi($w230.toac,1)+$ws(" ",0)+$wi($w230.p1,1)+$ws(" ",0)+$wi($w230.flags,1)+$ws(" ",0)+$wi($w230.level,1)+$ws(" ",0)+$wi($w230.cost,1),1024);
        encrypt({get v(){return out_rec},set v($x){out_rec=$x}});
        $fwrite(f1,$ws(out_rec,0),true);
      }
      if((($w228.store_open>turn))){
        $w228.store_open=(($w228.store_open-turn)+15);
      }else{
        $w228.store_open=0;
      }
      out_rec=$cap($wi($w228.owner,1)+$ws(" ",0)+$wi($w228.insult_cur,1)+$ws(" ",0)+$wi($w228.store_open,1),1024);
      encrypt({get v(){return out_rec},set v($x){out_rec=$x}});
      $fwrite(f1,$ws(out_rec,0),true);
    }
    $close(f1);
  }
  if((flag)){
    out_rec=$cap($ws("Character saved. [Moria Version ",0)+$wr(cur_version,5,2)+$ws("]",0),1024);
    prt(out_rec,1,1);
    exit();
  }
  $ret=flag;
  seed=get_seed();
  return $ret;
}
/* Restore a saved game				-RAK- & -JWT- */
function* get_char(fnam){
  var $ret=false;
  var tot_treasures=0;
  var tot_monsters=0;
  var i1=0;
  var i2=0;
  var i3=0;
  var i4=0;
  var dummy=0;
  var xfloor=0;
  var save_seed=0;
  var save_version=0;
  var in_rec="";
  var temp="";
  var temp_id="";
  var f1=$file(()=>"");
  var f2=$file(()=>({file_id:"",seed:0}));
  var dun_flag=false;
  dun_flag=false;
  clear(1,1);
  $open(f1,null,{file_name:fnam,record_length:1024,error:"continue",history:"old"});
  if((($status(f1)!==0))){
    prt(("Error Opening> "+fnam),1,1);
    prt("",2,1);
    exit();
  }
  $reset(f1);
  in_rec=$freadln(f1,"str");
  seed=encrypt_seed2;
  decrypt({get v(){return in_rec},set v($x){in_rec=$x}});
  temp=$cap($substr(in_rec,1,12),1024);
  (($rv=$readvs(temp,["int"],false)),save_seed=$rv[0]);
  temp=$cap($substr(in_rec,14,70),1024);
  seed=encrypt_seed1;
  coder({get v(){return temp},set v($x){temp=$x}});
  temp_id=$fix(temp,70);
  priv_switch(1);
  $open(f2,null,{file_name:moria_mas,access_method:"keyed",organization:"indexed",history:"old",sharing:"readwrite",error:"continue"});
  if((($status(f2)!==0))){
    prt("ERROR opening file MASTER.",1,1);
    exit();
  }
  $findk(f2,0,temp_id,"eql");
  $delete(f2);
  if((($status(f2)!==0))){
    data_exception();
  }
  $close(f2);
  priv_switch(0);
  seed=save_seed;
  prt("Restoring Character...",1,1);
  put_qio();
  in_rec=$freadln(f1,"str");
  decrypt({get v(){return in_rec},set v($x){in_rec=$x}});
  (($rv=$readvs(in_rec,["real"],false)),save_version=Math.fround($rv[0]));
  if(((save_version!==cur_version))){
    prt("Save file is incompatable with this version.",2,1);
    in_rec=$cap($ws("  [Save file version ",0)+$wr(save_version,5,2)+$ws("]",0),1024);
    prt(in_rec,3,1);
    in_rec=$cap($ws("  [Moria version     ",0)+$wr(cur_version,5,2)+$ws("]",0),1024);
    prt(in_rec,4,1);
    if(((save_version>Math.fround(4.0)))){
      prt("Updating character for newer version...",5,1);
      dun_flag=true;
    }else{
      exit();
    }
    (yield* pause(24));
  }
  in_rec=$freadln(f1,"str");
  decrypt({get v(){return in_rec},set v($x){in_rec=$x}});
  var $w231=py.misc;
  (($rv=$readvs(in_rec,["str"],false)),$w231.name_=$cap($rv[0],80));
  in_rec=$freadln(f1,"str");
  decrypt({get v(){return in_rec},set v($x){in_rec=$x}});
  var $w232=py.misc;
  (($rv=$readvs(in_rec,["str"],false)),$w232.race=$cap($rv[0],80));
  in_rec=$freadln(f1,"str");
  decrypt({get v(){return in_rec},set v($x){in_rec=$x}});
  var $w233=py.misc;
  (($rv=$readvs(in_rec,["str"],false)),$w233.sex=$cap($rv[0],80));
  in_rec=$freadln(f1,"str");
  decrypt({get v(){return in_rec},set v($x){in_rec=$x}});
  var $w234=py.misc;
  (($rv=$readvs(in_rec,["str"],false)),$w234.tclass=$cap($rv[0],80));
  in_rec=$freadln(f1,"str");
  decrypt({get v(){return in_rec},set v($x){in_rec=$x}});
  var $w235=py.misc;
  (($rv=$readvs(in_rec,["str"],false)),$w235.title=$cap($rv[0],80));
  for(var $e236=5,$ie236=1;$ie236<=$e236;$ie236++){
    i1=$ie236;
    in_rec=$freadln(f1,"str");
    decrypt({get v(){return in_rec},set v($x){in_rec=$x}});
    py.misc.history[i1]=$cap(in_rec,80);
  }
  in_rec=$freadln(f1,"str");
  decrypt({get v(){return in_rec},set v($x){in_rec=$x}});
  var $w237=py.misc;
  (($rv=$readvs(in_rec,["int", "int", "int", "int", "int", "int", "int", "int", "int", "int", "int", "int", "real"],false)),char_row=$rv[0],char_col=$rv[1],$w237.pclass=$rv[2],$w237.prace=$rv[3],$w237.age=$rv[4],$w237.ht=$rv[5],$w237.wt=$rv[6],$w237.sc=$rv[7],$w237.max_exp=$rv[8],$w237.exp=$rv[9],$w237.lev=$rv[10],$w237.max_lev=$rv[11],$w237.expfact=Math.fround($rv[12]));
  in_rec=$freadln(f1,"str");
  decrypt({get v(){return in_rec},set v($x){in_rec=$x}});
  var $w238=py.misc;
  (($rv=$readvs(in_rec,["int", "int", "int", "int", "int", "int", "real", "int", "real", "int", "int", "int", "int", "int", "int", "int", "int", "int", "int", "int", "int"],false)),$w238.srh=$rv[0],$w238.fos=$rv[1],$w238.stl=$rv[2],$w238.bth=$rv[3],$w238.bthb=$rv[4],$w238.mana=$rv[5],$w238.cmana=Math.fround($rv[6]),$w238.mhp=$rv[7],$w238.chp=Math.fround($rv[8]),$w238.au=$rv[9],$w238.ptohit=$rv[10],$w238.ptodam=$rv[11],$w238.pac=$rv[12],$w238.ptoac=$rv[13],$w238.dis_th=$rv[14],$w238.dis_td=$rv[15],$w238.dis_ac=$rv[16],$w238.dis_tac=$rv[17],$w238.disarm=$rv[18],$w238.save=$rv[19],$w238.hitdie=$rv[20]);
  in_rec=$freadln(f1,"str");
  decrypt({get v(){return in_rec},set v($x){in_rec=$x}});
  (($rv=$readvs(in_rec,["int", "int", "int", "int", "int", "int", "int", "int"],false)),inven_ctr=$rv[0],inven_weight=$rv[1],equip_ctr=$rv[2],dun_level=$rv[3],missle_ctr=$rv[4],mon_tot_mult=$rv[5],turn=$rv[6],randes_seed=$rv[7]);
  /* Read in the inventory records. */
  for(var $e239=inven_ctr,$ie239=1;$ie239<=$e239;$ie239++){
    i1=$ie239;
    in_rec=$freadln(f1,"str");
    decrypt({get v(){return in_rec},set v($x){in_rec=$x}});
    (($rv=$readvs(in_rec,["char", "str"],false)),inventory[i1].tchar=$rv[0],inventory[i1].name_=$cap($rv[1],68));
    in_rec=$freadln(f1,"str");
    decrypt({get v(){return in_rec},set v($x){in_rec=$x}});
    (($rv=$readvs(in_rec,["str"],false)),inventory[i1].damage=$cap($rv[0],5));
    in_rec=$freadln(f1,"str");
    decrypt({get v(){return in_rec},set v($x){in_rec=$x}});
    var $w240=inventory[i1];
    (($rv=$readvs(in_rec,["int", "int", "int", "int", "int", "int", "int", "int", "int", "int", "int", "int"],false)),$w240.tval=$rv[0],$w240.subval=$rv[1],$w240.weight=$rv[2],$w240.number=$rv[3],$w240.tohit=$rv[4],$w240.todam=$rv[5],$w240.ac=$rv[6],$w240.toac=$rv[7],$w240.p1=$rv[8],$w240.flags=$rv[9],$w240.level=$rv[10],$w240.cost=$rv[11]);
  }
  /* Read in the equipment records. */
  for(var $e241=(inven_max-1),$ie241=23;$ie241<=$e241;$ie241++){
    i1=$ie241;
    in_rec=$freadln(f1,"str");
    decrypt({get v(){return in_rec},set v($x){in_rec=$x}});
    (($rv=$readvs(in_rec,["char", "str"],false)),inventory[i1].tchar=$rv[0],inventory[i1].name_=$cap($rv[1],68));
    in_rec=$freadln(f1,"str");
    decrypt({get v(){return in_rec},set v($x){in_rec=$x}});
    (($rv=$readvs(in_rec,["str"],false)),inventory[i1].damage=$cap($rv[0],5));
    in_rec=$freadln(f1,"str");
    decrypt({get v(){return in_rec},set v($x){in_rec=$x}});
    var $w242=inventory[i1];
    (($rv=$readvs(in_rec,["int", "int", "int", "int", "int", "int", "int", "int", "int", "int", "int", "int"],false)),$w242.tval=$rv[0],$w242.subval=$rv[1],$w242.weight=$rv[2],$w242.number=$rv[3],$w242.tohit=$rv[4],$w242.todam=$rv[5],$w242.ac=$rv[6],$w242.toac=$rv[7],$w242.p1=$rv[8],$w242.flags=$rv[9],$w242.level=$rv[10],$w242.cost=$rv[11]);
  }
  in_rec=$freadln(f1,"str");
  decrypt({get v(){return in_rec},set v($x){in_rec=$x}});
  var $w243=py.stat;
  (($rv=$readvs(in_rec,["int", "int", "int", "int", "int", "int", "int", "int", "int", "int", "int", "int"],false)),$w243.str=$rv[0],$w243.cstr=$rv[1],$w243.dex=$rv[2],$w243.cdex=$rv[3],$w243.con=$rv[4],$w243.ccon=$rv[5],$w243.int=$rv[6],$w243.cint=$rv[7],$w243.wis=$rv[8],$w243.cwis=$rv[9],$w243.chr=$rv[10],$w243.cchr=$rv[11]);
  var $w244=py.flags;
  in_rec=$freadln(f1,"str");
  decrypt({get v(){return in_rec},set v($x){in_rec=$x}});
  (($rv=$readvs(in_rec,["int", "int", "int", "int", "int", "int", "int", "int", "int", "bool"],false)),$w244.status=$rv[0],$w244.blind=$rv[1],$w244.confused=$rv[2],$w244.food=$rv[3],$w244.food_digested=$rv[4],$w244.protection=$rv[5],$w244.speed=$rv[6],$w244.afraid=$rv[7],$w244.poisoned=$rv[8],$w244.see_inv=$rv[9]);
  in_rec=$freadln(f1,"str");
  decrypt({get v(){return in_rec},set v($x){in_rec=$x}});
  (($rv=$readvs(in_rec,["int", "int", "int", "bool", "bool", "bool"],false)),$w244.fast=$rv[0],$w244.slow=$rv[1],$w244.protevil=$rv[2],$w244.teleport=$rv[3],$w244.free_act=$rv[4],$w244.slow_digest=$rv[5]);
  in_rec=$freadln(f1,"str");
  decrypt({get v(){return in_rec},set v($x){in_rec=$x}});
  (($rv=$readvs(in_rec,["bool", "bool", "bool", "bool", "bool", "bool", "bool"],false)),$w244.aggravate=$rv[0],$w244.sustain_str=$rv[1],$w244.sustain_int=$rv[2],$w244.sustain_wis=$rv[3],$w244.sustain_con=$rv[4],$w244.sustain_dex=$rv[5],$w244.sustain_chr=$rv[6]);
  in_rec=$freadln(f1,"str");
  decrypt({get v(){return in_rec},set v($x){in_rec=$x}});
  (($rv=$readvs(in_rec,["bool", "bool", "bool", "bool", "bool", "bool", "bool"],false)),$w244.fire_resist=$rv[0],$w244.cold_resist=$rv[1],$w244.acid_resist=$rv[2],$w244.regenerate=$rv[3],$w244.lght_resist=$rv[4],$w244.ffall=$rv[5],$w244.confuse_monster=$rv[6]);
  in_rec=$freadln(f1,"str");
  decrypt({get v(){return in_rec},set v($x){in_rec=$x}});
  (($rv=$readvs(in_rec,["int", "int", "int", "int", "int", "int", "int", "int", "int", "int", "int"],false)),$w244.image=$rv[0],$w244.invuln=$rv[1],$w244.hero=$rv[2],$w244.shero=$rv[3],$w244.blessed=$rv[4],$w244.resist_heat=$rv[5],$w244.resist_cold=$rv[6],$w244.detect_inv=$rv[7],$w244.word_recall=$rv[8],$w244.see_infra=$rv[9],$w244.tim_infra=$rv[10]);
  /* Older version characters do not store experience... */
  if((dun_flag)){
    for(var $e245=31,$ie245=1;$ie245<=$e245;$ie245++){
      i1=$ie245;
      in_rec=$freadln(f1,"str");
      decrypt({get v(){return in_rec},set v($x){in_rec=$x}});
      (($rv=$readvs(in_rec,["bool"],false)),magic_spell[py.misc.pclass][i1].learned=$rv[0]);
    }
  }else{
    for(var $e246=31,$ie246=1;$ie246<=$e246;$ie246++){
      i1=$ie246;
      var $w247=magic_spell[py.misc.pclass][i1];
      in_rec=$freadln(f1,"str");
      decrypt({get v(){return in_rec},set v($x){in_rec=$x}});
      (($rv=$readvs(in_rec,["bool", "int"],false)),$w247.learned=$rv[0],$w247.sexp=$rv[1]);
    }
  }
  /* If same version, restore dungeon level... */
  if((!(dun_flag))){
    /* Read the important dungeon info and floor */
    in_rec=$freadln(f1,"str");
    decrypt({get v(){return in_rec},set v($x){in_rec=$x}});
    (($rv=$readvs(in_rec,["int", "int", "int", "int"],false)),cur_height=$rv[0],cur_width=$rv[1],max_panel_rows=$rv[2],max_panel_cols=$rv[3]);
    /* Restore the floor */
    for(var $e248=cur_height,$ie248=1;$ie248<=$e248;$ie248++){
      i1=$ie248;
      in_rec=$freadln(f1,"str");
      decrypt({get v(){return in_rec},set v($x){in_rec=$x}});
      for(var $e249=cur_width,$ie249=1;$ie249<=$e249;$ie249++){
        i2=$ie249;
        xfloor=$ord($ch(in_rec,i2));
        var $w250=cave[i1][i2];
        $w250.fval=((((((15&xfloor)>>>0))|0))&15);
        if(((((16&xfloor)>>>0)!==0))){
          $w250.fopen=true;
        }
        if(((((32&xfloor)>>>0)!==0))){
          $w250.pl=true;
        }
        if(((((64&xfloor)>>>0)!==0))){
          $w250.fm=true;
        }
        $w250.tl=false;
        $w250.tptr=0;
        $w250.cptr=0;
      }
    }
    /* Restore the Treasure List */
    tlink();
    in_rec=$freadln(f1,"str");
    decrypt({get v(){return in_rec},set v($x){in_rec=$x}});
    (($rv=$readvs(in_rec,["int"],false)),tot_treasures=$rv[0]);
    for(var $e251=tot_treasures,$ie251=1;$ie251<=$e251;$ie251++){
      i1=$ie251;
      popt({get v(){return i2},set v($x){i2=$x}});
      var $w252=t_list[i2];
      in_rec=$freadln(f1,"str");
      decrypt({get v(){return in_rec},set v($x){in_rec=$x}});
      (($rv=$readvs(in_rec,["int", "int"],false)),i3=$rv[0],i4=$rv[1]);
      cave[i3][i4].tptr=i2;
      in_rec=$freadln(f1,"str");
      decrypt({get v(){return in_rec},set v($x){in_rec=$x}});
      (($rv=$readvs(in_rec,["char", "str"],false)),$w252.tchar=$rv[0],$w252.name_=$cap($rv[1],68));
      in_rec=$freadln(f1,"str");
      decrypt({get v(){return in_rec},set v($x){in_rec=$x}});
      (($rv=$readvs(in_rec,["str"],false)),$w252.damage=$cap($rv[0],5));
      in_rec=$freadln(f1,"str");
      decrypt({get v(){return in_rec},set v($x){in_rec=$x}});
      (($rv=$readvs(in_rec,["int", "int", "int", "int", "int", "int", "int", "int", "int", "int", "int", "int"],false)),$w252.tval=$rv[0],$w252.subval=$rv[1],$w252.weight=$rv[2],$w252.number=$rv[3],$w252.tohit=$rv[4],$w252.todam=$rv[5],$w252.ac=$rv[6],$w252.toac=$rv[7],$w252.p1=$rv[8],$w252.flags=$rv[9],$w252.level=$rv[10],$w252.cost=$rv[11]);
    }
    /* Re-identify objects */
    in_rec=$freadln(f1,"str");
    decrypt({get v(){return in_rec},set v($x){in_rec=$x}});
    for(var $e253=max_objects,$ie253=1;$ie253<=$e253;$ie253++){
      i1=$ie253;
      if((($ch(in_rec,i1)==="T"))){
        identify($clone(object_list[i1]));
      }else{
        object_ident[i1]=false;
      }
    }
    /* Restore the Monster List */
    mlink();
    in_rec=$freadln(f1,"str");
    decrypt({get v(){return in_rec},set v($x){in_rec=$x}});
    (($rv=$readvs(in_rec,["int"],false)),tot_monsters=$rv[0]);
    i3=0;
    for(var $e254=tot_monsters,$ie254=1;$ie254<=$e254;$ie254++){
      i1=$ie254;
      in_rec=$freadln(f1,"str");
      decrypt({get v(){return in_rec},set v($x){in_rec=$x}});
      popm({get v(){return i2},set v($x){i2=$x}});
      var $w255=m_list[i2];
      (($rv=$readvs(in_rec,["int", "int", "int", "int", "int", "int", "int", "bool", "bool"],false)),$w255.fy=$rv[0],$w255.fx=$rv[1],$w255.mptr=$rv[2],$w255.hp=$rv[3],$w255.cspeed=$rv[4],$w255.csleep=$rv[5],$w255.cdis=$rv[6],$w255.ml=$rv[7],$w255.confused=$rv[8]);
      cave[$w255.fy][$w255.fx].cptr=i2;
      if(((muptr===0))){
        muptr=i2;
      }else{
        m_list[i3].nptr=i2;
      }
      $w255.nptr=0;
      i3=i2;
    }
    /* Restore the town level stores */
    in_rec=$freadln(f1,"str");
    decrypt({get v(){return in_rec},set v($x){in_rec=$x}});
    (($rv=$readvs(in_rec,["int"],false)),town_seed=$rv[0]);
    for(var $e256=max_stores,$ie256=1;$ie256<=$e256;$ie256++){
      i1=$ie256;
      var $w257=store[i1];
      in_rec=$freadln(f1,"str");
      decrypt({get v(){return in_rec},set v($x){in_rec=$x}});
      (($rv=$readvs(in_rec,["int"],false)),i2=$rv[0]);
      $w257.store_ctr=i2;
      /* If not current version then re-outfit the stores */
      if((dun_flag)){
        i2=0;
        $w257.store_ctr=0;
      }
      for(var $e258=i2,$ie258=1;$ie258<=$e258;$ie258++){
        i3=$ie258;
        var $w259=$w257.store_inven[i3].sitem;
        in_rec=$freadln(f1,"str");
        decrypt({get v(){return in_rec},set v($x){in_rec=$x}});
        (($rv=$readvs(in_rec,["int"],false)),$w257.store_inven[i3].scost=$rv[0]);
        in_rec=$freadln(f1,"str");
        decrypt({get v(){return in_rec},set v($x){in_rec=$x}});
        (($rv=$readvs(in_rec,["char", "str"],false)),$w259.tchar=$rv[0],$w259.name_=$cap($rv[1],68));
        in_rec=$freadln(f1,"str");
        decrypt({get v(){return in_rec},set v($x){in_rec=$x}});
        (($rv=$readvs(in_rec,["str"],false)),$w259.damage=$cap($rv[0],5));
        in_rec=$freadln(f1,"str");
        decrypt({get v(){return in_rec},set v($x){in_rec=$x}});
        (($rv=$readvs(in_rec,["int", "int", "int", "int", "int", "int", "int", "int", "int", "int", "int", "int"],false)),$w259.tval=$rv[0],$w259.subval=$rv[1],$w259.weight=$rv[2],$w259.number=$rv[3],$w259.tohit=$rv[4],$w259.todam=$rv[5],$w259.ac=$rv[6],$w259.toac=$rv[7],$w259.p1=$rv[8],$w259.flags=$rv[9],$w259.level=$rv[10],$w259.cost=$rv[11]);
      }
      in_rec=$freadln(f1,"str");
      decrypt({get v(){return in_rec},set v($x){in_rec=$x}});
      (($rv=$readvs(in_rec,["int", "int", "int"],false)),$w257.owner=$rv[0],$w257.insult_cur=$rv[1],$w257.store_open=$rv[2]);
    }
    store_maint();
  }
  $close(f1);
  $open(f1,null,{file_name:fnam,record_length:1024,history:"old",disposition:"delete",error:"continue"});
  $close(f1);
  seed=get_seed();
  $ret=dun_flag;
  return $ret;
}
/* Wizard command for restoring character		-RAK- */
function* restore_char(){
  var i1=0;
  var fnam="";
  var in_rec="";
  var temp="";
  var temp_id="";
  var f1=$file(()=>"");
  var f2=$file(()=>({file_id:"",seed:0}));
  var flag=false;
  prt("Name of file to be restored: ",1,1);
  if(((yield* get_string({get v(){return fnam},set v($x){fnam=$x}},1,30,48)))){
    priv_switch(1);
    $open(f1,null,{file_name:fnam,record_length:1024,history:"old",error:"continue"});
    if((($status(f1)!==0))){
      (yield* msg_print(("Error Opening> "+fnam)));
    }else{
      flag=true;
      $open(f2,null,{file_name:moria_mas,access_method:"keyed",organization:"indexed",history:"old",sharing:"readwrite",error:"continue"});
      if((($status(f2)!==0))){
        $open(f2,null,{file_name:moria_mas,access_method:"keyed",organization:"indexed",history:"new",sharing:"readwrite",error:"continue"});
        if((($status(f2)!==0))){
          (yield* msg_print("MASTER could not be opened."));
          flag=false;
        }
      }
      if((flag)){
        $reset(f1);
        in_rec=$freadln(f1,"str");
        seed=encrypt_seed2;
        decrypt({get v(){return in_rec},set v($x){in_rec=$x}});
        temp=$cap($substr(in_rec,14,70),1024);
        seed=encrypt_seed1;
        coder({get v(){return temp},set v($x){temp=$x}});
        for(var $e260=70,$ie260=1;$ie260<=$e260;$ie260++){
          i1=$ie260;
          key_rec.file_id=$setch(key_rec.file_id,i1,$ch(temp,i1));
        }
        $findk(f2,0,temp_id,"eql");
        $delete(f2);
        $assign(f2.buf,key_rec);
        $put(f2);
        if((($status(f2)===0))){
          (yield* msg_print("Character restored..."));
        }else{
          (yield* msg_print("Could not write ID in MASTER."));
        }
      }
      $close(f1);
      $close(f2);
    }
    seed=get_seed();
    priv_switch(0);
  }
}
/* Generates character's stats				-JWT- */
function* create_character(){
  function get_stat(){
    var $ret=0;
    var i=0;
    var j=0;
    i=(((randint(4)+randint(4))+randint(4))+5);
    $ret=i;
    return $ret;
  }
  /* Changes stats by given amount				-JWT- */
  function change_stat(cur_stat,amount){
    var $ret=0;
    var i=0;
    if(((amount<0))){
      for(var $e261=amount,$ie261=(-1);$ie261>=$e261;$ie261--){
        i=$ie261;
        cur_stat=de_statp(cur_stat);
      }
    }else{
      for(var $e262=amount,$ie262=1;$ie262<=$e262;$ie262++){
        i=$ie262;
        cur_stat=in_statp(cur_stat);
      }
    }
    $ret=cur_stat;
    return $ret;
  }
  /* Allows player to select a race			-JWT- */
  function* choose_race(){
    var $ret=false;
    var i2=0;
    var i3=0;
    var i4=0;
    var i5=0;
    var s='\0';
    var exit_flag=false;
    i2=1;
    i3=1;
    i4=3;
    i5=22;
    clear(21,1);
    prt("Choose a race (? for Help):",21,3);
    do{
      put_buffer((($chr((i3+96))+") ")+race[i2].trace),i5,i4);
      i3=(i3+1);
      i4=(i4+15);
      if(((i4>70))){
        i4=3;
        i5=(i5+1);
      }
      i2=(i2+1);
    }while(!(((i2>max_races))));
    py.misc.race=$cap("",80);
    put_buffer("",21,30);
    exit_flag=false;
    do{
      (yield* inkey_flush({get v(){return s},set v($x){s=$x}}));
      i2=$index("abcdefghijklmnopqrstuvwxyz",s);
      if(((((i2<=max_races))&&((i2>=1))))){
        var $w263=py;
        var $w264=race[i2];
        $w263.misc.prace=i2;
        $w263.misc.race=$cap($w264.trace,80);
        $w263.stat.str=get_stat();
        $w263.stat.int=get_stat();
        $w263.stat.wis=get_stat();
        $w263.stat.dex=get_stat();
        $w263.stat.con=get_stat();
        $w263.stat.chr=get_stat();
        $w263.stat.str=change_stat($w263.stat.str,$w264.str_adj);
        $w263.stat.int=change_stat($w263.stat.int,$w264.int_adj);
        $w263.stat.wis=change_stat($w263.stat.wis,$w264.wis_adj);
        $w263.stat.dex=change_stat($w263.stat.dex,$w264.dex_adj);
        $w263.stat.con=change_stat($w263.stat.con,$w264.con_adj);
        $w263.stat.chr=change_stat($w263.stat.chr,$w264.chr_adj);
        $w263.stat.cstr=$w263.stat.str;
        $w263.stat.cint=$w263.stat.int;
        $w263.stat.cwis=$w263.stat.wis;
        $w263.stat.cdex=$w263.stat.dex;
        $w263.stat.ccon=$w263.stat.con;
        $w263.stat.cchr=$w263.stat.chr;
        $w263.misc.srh=$w264.srh;
        $w263.misc.bth=$w264.bth;
        $w263.misc.bthb=$w264.bthb;
        $w263.misc.fos=$w264.fos;
        $w263.misc.stl=$w264.stl;
        $w263.misc.save=$w264.bsav;
        $w263.misc.hitdie=$w264.bhitdie;
        $w263.misc.lev=1;
        $w263.misc.ptodam=todam_adj();
        $w263.misc.ptohit=tohit_adj();
        $w263.misc.ptoac=0;
        $w263.misc.pac=toac_adj();
        $w263.misc.expfact=Math.fround($w264.b_exp);
        $w263.flags.see_infra=$w264.infra;
        exit_flag=true;
        $ret=true;
        put_buffer(py.misc.race,4,15);
      }else if(((s==="?"))){
        (yield* moria_help("Character Races"));
        exit_flag=true;
        $ret=false;
      }
    }while(!((exit_flag)));
    return $ret;
  }
  /* Will print the history of a character			-JWT- */
  function print_history(){
    var i1=0;
    put_buffer("Character Background",14,28);
    for(var $e265=5,$ie265=1;$ie265<=$e265;$ie265++){
      i1=$ie265;
      put_buffer(py.misc.history[i1],(i1+14),5);
    }
  }
  /* Get the racial history, determines social class	-RAK- */
  /* Assumtions:	Each race has init history beginning at */
  /* (race-1)*3+1 */
  /* All history parts are in accending order */
  function get_history(){
    var hist_ptr=0;
    var cur_ptr=0;
    var test_roll=0;
    var start_pos=0;
    var end_pos=0;
    var cur_len=0;
    var line_ctr=0;
    var new_start=0;
    var social_class=0;
    var history_block="";
    var flag=false;
    /* Get a block of history text */
    hist_ptr=((((py.misc.prace-1))*3)+1);
    history_block=$cap("",400);
    social_class=randint(4);
    cur_ptr=0;
    do{
      flag=false;
      do{
        cur_ptr=(cur_ptr+1);
        if(((background[cur_ptr].chart===hist_ptr))){
          test_roll=randint(100);
          while(((test_roll>background[cur_ptr].roll))){
            cur_ptr=(cur_ptr+1);
          }
          var $w266=background[cur_ptr];
          history_block=$cap((history_block+$w266.info),400);
          social_class=(social_class+$w266.bonus);
          if(((hist_ptr>$w266.next))){
            cur_ptr=0;
          }
          hist_ptr=$w266.next;
          flag=true;
        }
      }while(!((flag)));
    }while(!(((hist_ptr<1))));
    /* Process block of history text for pretty output */
    start_pos=1;
    end_pos=history_block.length;
    line_ctr=1;
    flag=false;
    while((($ch(history_block,end_pos)===" "))){
      end_pos=(end_pos-1);
    }
    do{
      while((($ch(history_block,start_pos)===" "))){
        start_pos=(start_pos+1);
      }
      cur_len=((end_pos-start_pos)+1);
      if(((cur_len>70))){
        cur_len=70;
        while((($ch(history_block,((start_pos+cur_len)-1))!==" "))){
          cur_len=(cur_len-1);
        }
        new_start=(start_pos+cur_len);
        while((($ch(history_block,((start_pos+cur_len)-1))===" "))){
          cur_len=(cur_len-1);
        }
      }else{
        flag=true;
      }
      py.misc.history[line_ctr]=$cap($substr(history_block,start_pos,cur_len),80);
      line_ctr=(line_ctr+1);
      start_pos=new_start;
    }while(!((flag)));
    /* Compute social class for player */
    if(((social_class>100))){
      social_class=100;
    }else if(((social_class<1))){
      social_class=1;
    }
    py.misc.sc=social_class;
  }
  /* Gets the character's sex				-JWT- */
  function* get_sex(){
    var $ret=false;
    var s='\0';
    var exit_flag=false;
    py.misc.sex=$cap("",80);
    clear(21,1);
    prt("Choose a sex (? for Help):",21,3);
    prt("m) Male       f) Female",22,3);
    prt("",21,29);
    do{
      (yield* inkey_flush({get v(){return s},set v($x){s=$x}}));
      switch(s){
        case "f":{
          py.misc.sex=$cap("Female",80);
          prt(py.misc.sex,5,15);
          exit_flag=true;
          $ret=true;
          break;
        }
        case "m":{
          py.misc.sex=$cap("Male",80);
          prt(py.misc.sex,5,15);
          exit_flag=true;
          $ret=true;
          break;
        }
        case "?":{
          (yield* moria_help("Character Sex"));
          exit_flag=true;
          $ret=false;
          break;
        }
        default:{
        }
      }
    }while(!((exit_flag)));
    return $ret;
  }
  /* Computes character's age, height, and weight		-JWT- */
  function get_ahw(){
    var i1=0;
    i1=py.misc.prace;
    py.misc.age=(race[i1].b_age+randint(race[i1].m_age));
    switch(Math.trunc(Math.fround($rdiv((($index(sex_type,py.misc.sex)+5)),6)))){
      case 1:{
        py.misc.ht=randnor(race[i1].f_b_ht,race[i1].f_m_ht);
        py.misc.wt=randnor(race[i1].f_b_wt,race[i1].f_m_wt);
        break;
      }
      case 2:{
        py.misc.ht=randnor(race[i1].m_b_ht,race[i1].m_m_ht);
        py.misc.wt=randnor(race[i1].m_b_wt,race[i1].m_m_wt);
        break;
      }
    }
    py.misc.disarm=(race[i1].b_dis+todis_adj());
  }
  /* Gets a character class				-JWT- */
  function* get_class(){
    var $ret=false;
    var i1=0;
    var i2=0;
    var i3=0;
    var i4=0;
    var i5=0;
    var cl=$zeros(max_class);
    var s='\0';
    var exit_flag=false;
    for(var $e269=max_class,$ie269=1;$ie269<=$e269;$ie269++){
      i2=$ie269;
      cl[i2]=0;
    }
    i1=py.misc.prace;
    i2=1;
    i3=0;
    i4=3;
    i5=22;
    clear(21,1);
    prt("Choose a class (? for Help):",21,3);
    do{
      if(((((race[i1].tclass&bit_array[i2])>>>0)!==0))){
        i3=(i3+1);
        put_buffer((($chr((i3+96))+") ")+class_[i2].title),i5,i4);
        cl[i3]=i2;
        i4=(i4+15);
        if(((i4>70))){
          i4=3;
          i5=(i5+1);
        }
      }
      i2=(i2+1);
    }while(!(((i2>max_class))));
    py.misc.pclass=0;
    put_buffer("",21,31);
    exit_flag=false;
    do{
      (yield* inkey_flush({get v(){return s},set v($x){s=$x}}));
      i2=$index("abcdefghijklmnopqrstuvwxyz",s);
      if(((((i2<=i3))&&((i2>=1))))){
        py.misc.tclass=$cap(class_[cl[i2]].title,80);
        py.misc.pclass=cl[i2];
        exit_flag=true;
        $ret=true;
        clear(21,1);
        put_buffer(py.misc.tclass,6,15);
        var $w270=py.misc;
        $w270.hitdie=($w270.hitdie+class_[$w270.pclass].adj_hd);
        $w270.mhp=(con_adj()+$w270.hitdie);
        $w270.chp=Math.fround($w270.mhp);
        $w270.bth=($w270.bth+class_[$w270.pclass].mbth);
        $w270.bthb=($w270.bthb+class_[$w270.pclass].mbthb);
        /* RAK */
        $w270.srh=($w270.srh+class_[$w270.pclass].msrh);
        $w270.disarm=($w270.disarm+class_[$w270.pclass].mdis);
        $w270.fos=($w270.fos+class_[$w270.pclass].mfos);
        $w270.stl=($w270.stl+class_[$w270.pclass].mstl);
        $w270.save=($w270.save+class_[$w270.pclass].msav);
        $w270.title=$cap(player_title[$w270.pclass][1],80);
        $w270.expfact=Math.fround(Math.fround($w270.expfact+class_[$w270.pclass].m_exp));
        /* Adjust the stats for the class adjustment		-RAK- */
        var $w271=py;
        $w271.stat.str=change_stat($w271.stat.str,class_[$w271.misc.pclass].madj_str);
        $w271.stat.int=change_stat($w271.stat.int,class_[$w271.misc.pclass].madj_int);
        $w271.stat.wis=change_stat($w271.stat.wis,class_[$w271.misc.pclass].madj_wis);
        $w271.stat.dex=change_stat($w271.stat.dex,class_[$w271.misc.pclass].madj_dex);
        $w271.stat.con=change_stat($w271.stat.con,class_[$w271.misc.pclass].madj_con);
        $w271.stat.chr=change_stat($w271.stat.chr,class_[$w271.misc.pclass].madj_chr);
        $w271.stat.cstr=$w271.stat.str;
        $w271.stat.cint=$w271.stat.int;
        $w271.stat.cwis=$w271.stat.wis;
        $w271.stat.cdex=$w271.stat.dex;
        $w271.stat.ccon=$w271.stat.con;
        $w271.stat.cchr=$w271.stat.chr;
        $w271.misc.ptodam=todam_adj();
        /* Real values */
        $w271.misc.ptohit=tohit_adj();
        $w271.misc.ptoac=toac_adj();
        $w271.misc.pac=0;
        $w271.misc.dis_td=$w271.misc.ptodam;
        /* Displayed values */
        $w271.misc.dis_th=$w271.misc.ptohit;
        $w271.misc.dis_tac=$w271.misc.ptoac;
        $w271.misc.dis_ac=$w271.misc.pac;
      }else if(((s==="?"))){
        (yield* moria_help("Character Classes"));
        exit_flag=true;
        $ret=false;
      }
    }while(!((exit_flag)));
    return $ret;
  }
  function get_money(){
    var tmp=0;
    var $w272=py.stat;
    tmp=((((($w272.cstr+$w272.cint)+$w272.cwis)+$w272.cdex)+$w272.ccon)+$w272.cchr);
    var $w273=py.misc;
    $w273.au=((($w273.sc*6)+randint(25))+325);
    /* Social Class adj */
    $w273.au=($w273.au-tmp);
    /* Stat adj */
    $w273.au=($w273.au+py.stat.cchr);
    /* Charisma adj */
    if((($w273.au<80))){
      $w273.au=80;
    }
  }
  /* Minimum */
  /* ---------- M A I N  for Character Creation Routine ---------- */
  /* -JWT- */
  var $w274=py;
  /* This delay may be reduced, but is recomended to keep players */
  /* from continuously rolling up characters, which can be VERY */
  /* expensive CPU wise. */
  do{
    put_character();
  }while(!(((yield* choose_race()))));
  while((!((yield* get_sex())))){
    put_character();
  }
  get_history();
  get_ahw();
  print_history();
  put_misc1();
  put_stats();
  while((!((yield* get_class())))){
    put_character();
    print_history();
    put_misc1();
    put_stats();
  }
  get_money();
  put_stats();
  put_misc2();
  put_misc3();
  (yield* get_name());
  (yield* pause_exit(24,player_exit_pause));
}
/* Generates a random dungeon level			-RAK- */
function generate_cave(){
  var doorstk=$arr(1,100,()=>({y:0,x:0}));
  var doorptr=0;
  /* Always picks a correct direction */
  function correct_dir(rdir,cdir,y1,x1,y2,x2){
    var test_dir=0;
    if(((y1<y2))){
      rdir.v=1;
    }else if(((y1===y2))){
      rdir.v=0;
    }else{
      rdir.v=(-1);
    }
    if(((x1<x2))){
      cdir.v=1;
    }else if(((x1===x2))){
      cdir.v=0;
    }else{
      cdir.v=(-1);
    }
    if(((((rdir.v!==0))&&((cdir.v!==0))))){
      switch(randint(2)){
        case 1:{
          rdir.v=0;
          break;
        }
        case 2:{
          cdir.v=0;
          break;
        }
      }
    }
  }
  /* Chance of wandering direction */
  function rand_dir(rdir,cdir,y1,x1,y2,x2,chance){
    switch(randint(chance)){
      case 1:{
        rdir.v=(-1);
        cdir.v=0;
        break;
      }
      case 2:{
        rdir.v=1;
        cdir.v=0;
        break;
      }
      case 3:{
        rdir.v=0;
        cdir.v=(-1);
        break;
      }
      case 4:{
        rdir.v=0;
        cdir.v=1;
        break;
      }
      default:{
        correct_dir(rdir,cdir,y1,x1,y2,x2);
      }
    }
  }
  /* Blanks out entire cave				-RAK- */
  function blank_cave(){
    var i1=0;
    var i2=0;
    for(var $e277=max_height,$ie277=1;$ie277<=$e277;$ie277++){
      i1=$ie277;
      for(var $e278=max_width,$ie278=1;$ie278<=$e278;$ie278++){
        i2=$ie278;
        $assign(cave[i1][i2],blank_floor);
      }
    }
  }
  /* Fills in empty spots with desired rock		-RAK- */
  /* Note: 9 is a temporary value. */
  function fill_cave(fill){
    var i1=0;
    var i2=0;
    for(var $e279=(cur_height-1),$ie279=2;$ie279<=$e279;$ie279++){
      i1=$ie279;
      for(var $e280=(cur_width-1),$ie280=2;$ie280<=$e280;$ie280++){
        i2=$ie280;
        var $w281=cave[i1][i2];
        if(($in($w281.fval,$S25))){
          $w281.fval=((fill.ftval)&15);
          $w281.fopen=fill.ftopen;
        }
      }
    }
  }
  /* Places indestructable rock around edges of dungeon	-RAK- */
  function place_boundry(){
    var i1=0;
    for(var $e282=cur_height,$ie282=1;$ie282<=$e282;$ie282++){
      i1=$ie282;
      cave[i1][1].fval=((boundry_wall.ftval)&15);
      cave[i1][1].fopen=boundry_wall.ftopen;
      cave[i1][cur_width].fval=((boundry_wall.ftval)&15);
      cave[i1][cur_width].fopen=boundry_wall.ftopen;
    }
    for(var $e283=cur_width,$ie283=1;$ie283<=$e283;$ie283++){
      i1=$ie283;
      cave[1][i1].fval=((boundry_wall.ftval)&15);
      cave[1][i1].fopen=boundry_wall.ftopen;
      cave[cur_height][i1].fval=((boundry_wall.ftval)&15);
      cave[cur_height][i1].fopen=boundry_wall.ftopen;
    }
  }
  /* Places "streamers" of rock through dungeon		-RAK- */
  function place_streamer(rock,treas_chance){
    var i1=0;
    var y=0;
    var x=0;
    var dir=0;
    var ty=0;
    var tx=0;
    var t1=0;
    var t2=0;
    var flag=false;
    /* Choose starting point and direction */
    y=((Math.trunc(Math.fround($rdiv(cur_height,Math.fround(2.0))))+11)-randint(23));
    x=((Math.trunc(Math.fround($rdiv(cur_width,Math.fround(2.0))))+16)-randint(33));
    dir=randint(8);
    /* Number 1-4, 6-9 */
    if(((dir>4))){
      dir=(dir+1);
    }
    /* Place streamer into dungeon */
    flag=false;
    /* Set to true when y,x are out-of-bounds */
    t1=((2*dun_str_rng)+1);
    /* Constants */
    t2=(dun_str_rng+1);
    do{
      for(var $e284=dun_str_den,$ie284=1;$ie284<=$e284;$ie284++){
        i1=$ie284;
        ty=((y+randint(t1))-t2);
        tx=((x+randint(t1))-t2);
        if((in_bounds(ty,tx))){
          var $w285=cave[ty][tx];
          if((($w285.fval===rock_wall1.ftval))){
            $w285.fval=((rock.ftval)&15);
            $w285.fopen=rock.ftopen;
            if(((randint(treas_chance)===1))){
              place_gold(ty,tx);
            }
          }
        }
      }
      if((!(move(dir,{get v(){return y},set v($x){y=$x}},{get v(){return x},set v($x){x=$x}})))){
        flag=true;
      }
    }while(!((flag)));
  }
  /* Place a trap with a given displacement of point	-RAK- */
  function vault_trap(y,x,yd,xd,num){
    var count=0;
    var y1=0;
    var x1=0;
    var i1=0;
    var flag=false;
    for(var $e286=num,$ie286=1;$ie286<=$e286;$ie286++){
      i1=$ie286;
      flag=false;
      count=0;
      do{
        y1=(((y-yd)-1)+randint(((2*yd)+1)));
        x1=(((x-xd)-1)+randint(((2*xd)+1)));
        var $w287=cave[y1][x1];
        if(($in($w287.fval,floor_set))){
          if((($w287.tptr===0))){
            place_trap(y1,x1,1,randint(max_trapa));
            flag=true;
          }
        }
        count=(count+1);
      }while(!((((flag)||((count>5))))));
    }
  }
  /* Place a trap with a given displacement of point	-RAK- */
  function vault_monster(y,x,num){
    var i1=0;
    var y1=0;
    var x1=0;
    for(var $e288=num,$ie288=1;$ie288<=$e288;$ie288++){
      i1=$ie288;
      y1=y;
      x1=x;
      summon_monster({get v(){return y1},set v($x){y1=$x}},{get v(){return x1},set v($x){x1=$x}},true);
    }
  }
  /* Builds a room at a row,column coordinate		-RAK- */
  function build_room(yval,xval){
    var y_height=0;
    var y_depth=0;
    var x_left=0;
    var x_right=0;
    var i1=0;
    var i2=0;
    var cur_floor=({ftval:0,ftopen:false});
    if(((dun_level<=randint(25)))){
      $assign(cur_floor,lopen_floor);
    }else{
      /* Floor with light */
      $assign(cur_floor,dopen_floor);
    }
    /* Dark floor */
    y_height=(yval-randint(4));
    y_depth=(yval+randint(3));
    x_left=(xval-randint(11));
    x_right=(xval+randint(11));
    for(var $e289=y_depth,$ie289=y_height;$ie289<=$e289;$ie289++){
      i1=$ie289;
      for(var $e290=x_right,$ie290=x_left;$ie290<=$e290;$ie290++){
        i2=$ie290;
        cave[i1][i2].fval=((cur_floor.ftval)&15);
        cave[i1][i2].fopen=cur_floor.ftopen;
      }
    }
    for(var $e291=((y_depth+1)),$ie291=((y_height-1));$ie291<=$e291;$ie291++){
      i1=$ie291;
      cave[i1][(x_left-1)].fval=((rock_wall1.ftval)&15);
      cave[i1][(x_left-1)].fopen=rock_wall1.ftopen;
      cave[i1][(x_right+1)].fval=((rock_wall1.ftval)&15);
      cave[i1][(x_right+1)].fopen=rock_wall1.ftopen;
    }
    for(var $e292=x_right,$ie292=x_left;$ie292<=$e292;$ie292++){
      i1=$ie292;
      cave[(y_height-1)][i1].fval=((rock_wall1.ftval)&15);
      cave[(y_height-1)][i1].fopen=rock_wall1.ftopen;
      cave[(y_depth+1)][i1].fval=((rock_wall1.ftval)&15);
      cave[(y_depth+1)][i1].fopen=rock_wall1.ftopen;
    }
  }
  /* Builds a room at a row,column coordinate		-RAK- */
  /* Type 1 unusual rooms are several overlapping rectangular ones */
  function build_type1(yval,xval){
    var y_height=0;
    var y_depth=0;
    var x_left=0;
    var x_right=0;
    var i0=0;
    var i1=0;
    var i2=0;
    var cur_floor=({ftval:0,ftopen:false});
    if(((dun_level<=randint(25)))){
      $assign(cur_floor,lopen_floor);
    }else{
      /* Floor with light */
      $assign(cur_floor,dopen_floor);
    }
    /* Dark floor */
    for(var $e293=((1+randint(2))),$ie293=1;$ie293<=$e293;$ie293++){
      i0=$ie293;
      y_height=(yval-randint(4));
      y_depth=(yval+randint(3));
      x_left=(xval-randint(11));
      x_right=(xval+randint(11));
      for(var $e294=y_depth,$ie294=y_height;$ie294<=$e294;$ie294++){
        i1=$ie294;
        for(var $e295=x_right,$ie295=x_left;$ie295<=$e295;$ie295++){
          i2=$ie295;
          cave[i1][i2].fval=((cur_floor.ftval)&15);
          cave[i1][i2].fopen=cur_floor.ftopen;
        }
      }
      for(var $e296=((y_depth+1)),$ie296=((y_height-1));$ie296<=$e296;$ie296++){
        i1=$ie296;
        var $w297=cave[i1][(x_left-1)];
        if((($w297.fval!==cur_floor.ftval))){
          $w297.fval=((rock_wall1.ftval)&15);
          $w297.fopen=rock_wall1.ftopen;
        }
        var $w298=cave[i1][(x_right+1)];
        if((($w298.fval!==cur_floor.ftval))){
          $w298.fval=((rock_wall1.ftval)&15);
          $w298.fopen=rock_wall1.ftopen;
        }
      }
      for(var $e299=x_right,$ie299=x_left;$ie299<=$e299;$ie299++){
        i1=$ie299;
        var $w300=cave[(y_height-1)][i1];
        if((($w300.fval!==cur_floor.ftval))){
          $w300.fval=((rock_wall1.ftval)&15);
          $w300.fopen=rock_wall1.ftopen;
        }
        var $w301=cave[(y_depth+1)][i1];
        if((($w301.fval!==cur_floor.ftval))){
          $w301.fval=((rock_wall1.ftval)&15);
          $w301.fopen=rock_wall1.ftopen;
        }
      }
    }
  }
  /* Builds an unusual room at a row,column coordinate	-RAK- */
  /* Type 2 unusual rooms all have an inner room: */
  /* 1 - Just an inner room with one door */
  /* 2 - An inner room within an inner room */
  /* 3 - An inner room with pillar(s) */
  /* 4 - Inner room has a maze */
  /* 5 - A set of four inner rooms */
  function build_type2(yval,xval){
    var y_height=0;
    var y_depth=0;
    var x_left=0;
    var x_right=0;
    var i1=0;
    var i2=0;
    var cur_floor=({ftval:0,ftopen:false});
    if(((dun_level<=randint(30)))){
      $assign(cur_floor,lopen_floor);
    }else{
      /* Floor with light */
      $assign(cur_floor,dopen_floor);
    }
    /* Dark floor */
    y_height=(yval-4);
    y_depth=(yval+4);
    x_left=(xval-11);
    x_right=(xval+11);
    for(var $e302=y_depth,$ie302=y_height;$ie302<=$e302;$ie302++){
      i1=$ie302;
      for(var $e303=x_right,$ie303=x_left;$ie303<=$e303;$ie303++){
        i2=$ie303;
        cave[i1][i2].fval=((cur_floor.ftval)&15);
        cave[i1][i2].fopen=cur_floor.ftopen;
      }
    }
    for(var $e304=((y_depth+1)),$ie304=((y_height-1));$ie304<=$e304;$ie304++){
      i1=$ie304;
      cave[i1][(x_left-1)].fval=((rock_wall1.ftval)&15);
      cave[i1][(x_left-1)].fopen=rock_wall1.ftopen;
      cave[i1][(x_right+1)].fval=((rock_wall1.ftval)&15);
      cave[i1][(x_right+1)].fopen=rock_wall1.ftopen;
    }
    for(var $e305=x_right,$ie305=x_left;$ie305<=$e305;$ie305++){
      i1=$ie305;
      cave[(y_height-1)][i1].fval=((rock_wall1.ftval)&15);
      cave[(y_height-1)][i1].fopen=rock_wall1.ftopen;
      cave[(y_depth+1)][i1].fval=((rock_wall1.ftval)&15);
      cave[(y_depth+1)][i1].fopen=rock_wall1.ftopen;
    }
    /* The inner room */
    y_height=(y_height+2);
    y_depth=(y_depth-2);
    x_left=(x_left+2);
    x_right=(x_right-2);
    for(var $e306=((y_depth+1)),$ie306=((y_height-1));$ie306<=$e306;$ie306++){
      i1=$ie306;
      cave[i1][(x_left-1)].fval=((8)&15);
      cave[i1][(x_right+1)].fval=((8)&15);
    }
    for(var $e307=x_right,$ie307=x_left;$ie307<=$e307;$ie307++){
      i1=$ie307;
      cave[(y_height-1)][i1].fval=((8)&15);
      cave[(y_depth+1)][i1].fval=((8)&15);
    }
    /* Inner room varitions */
    switch(randint(5)){
      case 1:{
        /* Just an inner room... */
        switch(randint(4)){
          case 1:{
            /* Place a door */
            place_secret_door((y_height-1),xval);
            break;
          }
          case 2:{
            place_secret_door((y_depth+1),xval);
            break;
          }
          case 3:{
            place_secret_door(yval,(x_left-1));
            break;
          }
          case 4:{
            place_secret_door(yval,(x_right+1));
            break;
          }
        }
        vault_monster(yval,xval,1);
        break;
      }
      case 2:{
        /* Treasure Vault */
        switch(randint(4)){
          case 1:{
            /* Place a door */
            place_secret_door((y_height-1),xval);
            break;
          }
          case 2:{
            place_secret_door((y_depth+1),xval);
            break;
          }
          case 3:{
            place_secret_door(yval,(x_left-1));
            break;
          }
          case 4:{
            place_secret_door(yval,(x_right+1));
            break;
          }
        }
        for(var $e310=(yval+1),$ie310=(yval-1);$ie310<=$e310;$ie310++){
          i1=$ie310;
          cave[i1][(xval-1)].fval=((8)&15);
          cave[i1][(xval+1)].fval=((8)&15);
        }
        cave[(yval-1)][xval].fval=((8)&15);
        cave[(yval+1)][xval].fval=((8)&15);
        switch(randint(4)){
          case 1:{
            /* Place a door */
            place_locked_door((yval-1),xval);
            break;
          }
          case 2:{
            place_locked_door((yval+1),xval);
            break;
          }
          case 3:{
            place_locked_door(yval,(xval-1));
            break;
          }
          case 4:{
            place_locked_door(yval,(xval+1));
            break;
          }
        }
        /* Place an object in the treasure vault */
        switch(randint(10)){
          case 1:{
            place_up_stairs(yval,xval);
            break;
          }
          case 2:{
            place_down_stairs(yval,xval);
            break;
          }
          default:{
            place_object(yval,xval);
          }
        }
        /* Guard the treasure well */
        vault_monster(yval,xval,(2+randint(3)));
        /* If the monsters don't get 'em... */
        vault_trap(yval,xval,4,10,(2+randint(3)));
        break;
      }
      case 3:{
        /* Inner pillar(s)... */
        switch(randint(4)){
          case 1:{
            /* Place a door */
            place_secret_door((y_height-1),xval);
            break;
          }
          case 2:{
            place_secret_door((y_depth+1),xval);
            break;
          }
          case 3:{
            place_secret_door(yval,(x_left-1));
            break;
          }
          case 4:{
            place_secret_door(yval,(x_right+1));
            break;
          }
        }
        for(var $e314=(yval+1),$ie314=(yval-1);$ie314<=$e314;$ie314++){
          i1=$ie314;
          for(var $e315=(xval+1),$ie315=(xval-1);$ie315<=$e315;$ie315++){
            i2=$ie315;
            cave[i1][i2].fval=((8)&15);
          }
        }
        if(((randint(2)===1))){
          switch(randint(2)){
            case 1:{
              for(var $e316=(yval+1),$ie316=(yval-1);$ie316<=$e316;$ie316++){
                i1=$ie316;
                for(var $e317=(xval-4),$ie317=(xval-6);$ie317<=$e317;$ie317++){
                  i2=$ie317;
                  cave[i1][i2].fval=((8)&15);
                }
              }
              for(var $e318=(yval+1),$ie318=(yval-1);$ie318<=$e318;$ie318++){
                i1=$ie318;
                for(var $e319=(xval+6),$ie319=(xval+4);$ie319<=$e319;$ie319++){
                  i2=$ie319;
                  cave[i1][i2].fval=((8)&15);
                }
              }
              break;
            }
            case 2:{
              for(var $e320=(yval+1),$ie320=(yval-1);$ie320<=$e320;$ie320++){
                i1=$ie320;
                for(var $e321=(xval-5),$ie321=(xval-7);$ie321<=$e321;$ie321++){
                  i2=$ie321;
                  cave[i1][i2].fval=((8)&15);
                }
              }
              for(var $e322=(yval+1),$ie322=(yval-1);$ie322<=$e322;$ie322++){
                i1=$ie322;
                for(var $e323=(xval+7),$ie323=(xval+5);$ie323<=$e323;$ie323++){
                  i2=$ie323;
                  cave[i1][i2].fval=((8)&15);
                }
              }
              break;
            }
          }
          if(((randint(3)===1))){
            /* Inner rooms */
            for(var $e325=(xval+5),$ie325=(xval-5);$ie325<=$e325;$ie325++){
              i1=$ie325;
              cave[(yval-1)][i1].fval=((8)&15);
              cave[(yval+1)][i1].fval=((8)&15);
            }
            switch(randint(2)){
              case 1:{
                place_secret_door((yval+1),(xval-3));
                break;
              }
              case 2:{
                place_secret_door((yval-1),(xval-3));
                break;
              }
            }
            switch(randint(2)){
              case 1:{
                place_secret_door((yval+1),(xval+3));
                break;
              }
              case 2:{
                place_secret_door((yval-1),(xval+3));
                break;
              }
            }
            if(((randint(3)===1))){
              place_object(yval,(xval-2));
            }
            if(((randint(3)===1))){
              place_object(yval,(xval+2));
            }
            vault_monster(yval,(xval-2),randint(2));
            vault_monster(yval,(xval+2),randint(2));
          }
        }
        break;
      }
      case 4:{
        /* Maze inside... */
        switch(randint(4)){
          case 1:{
            /* Place a door */
            place_secret_door((y_height-1),xval);
            break;
          }
          case 2:{
            place_secret_door((y_depth+1),xval);
            break;
          }
          case 3:{
            place_secret_door(yval,(x_left-1));
            break;
          }
          case 4:{
            place_secret_door(yval,(x_right+1));
            break;
          }
        }
        for(var $e329=y_depth,$ie329=y_height;$ie329<=$e329;$ie329++){
          i1=$ie329;
          for(var $e330=x_right,$ie330=x_left;$ie330<=$e330;$ie330++){
            i2=$ie330;
            if(($odd((i2+i1)))){
              cave[i1][i2].fval=((8)&15);
            }
          }
        }
        /* Monsters just love mazes... */
        vault_monster(yval,(xval-5),randint(3));
        vault_monster(yval,(xval+5),randint(3));
        /* Traps make them entertaining... */
        vault_trap(yval,(xval-3),2,8,randint(3));
        vault_trap(yval,(xval+3),2,8,randint(3));
        /* Mazes should have some treasure too.. */
        for(var $e331=3,$ie331=1;$ie331<=$e331;$ie331++){
          i1=$ie331;
          random_object(yval,xval,1);
        }
        break;
      }
      case 5:{
        /* Four small rooms... */
        for(var $e332=y_depth,$ie332=y_height;$ie332<=$e332;$ie332++){
          i1=$ie332;
          cave[i1][xval].fval=((8)&15);
        }
        for(var $e333=x_right,$ie333=x_left;$ie333<=$e333;$ie333++){
          i1=$ie333;
          cave[yval][i1].fval=((8)&15);
        }
        switch(randint(2)){
          case 1:{
            i1=randint(10);
            place_secret_door((y_height-1),(xval-i1));
            place_secret_door((y_height-1),(xval+i1));
            place_secret_door((y_depth+1),(xval-i1));
            place_secret_door((y_depth+1),(xval+i1));
            break;
          }
          case 2:{
            i1=randint(3);
            place_secret_door((yval+i1),(x_left-1));
            place_secret_door((yval-i1),(x_left-1));
            place_secret_door((yval+i1),(x_right+1));
            place_secret_door((yval-i1),(x_right+1));
            break;
          }
        }
        /* Treasure in each one... */
        random_object(yval,xval,(2+randint(2)));
        /* Gotta have some monsters... */
        vault_monster((yval+2),(xval-4),randint(2));
        vault_monster((yval+2),(xval+4),randint(2));
        vault_monster((yval-2),(xval-4),randint(2));
        vault_monster((yval-2),(xval+4),randint(2));
        break;
      }
    }
  }
  /* Builds a room at a row,column coordinate		-RAK- */
  /* Type 3 unusual rooms are cross shaped */
  function build_type3(yval,xval){
    var y_height=0;
    var y_depth=0;
    var x_left=0;
    var x_right=0;
    var i0=0;
    var i1=0;
    var i2=0;
    var cur_floor=({ftval:0,ftopen:false});
    if(((dun_level<=randint(25)))){
      $assign(cur_floor,lopen_floor);
    }else{
      /* Floor with light */
      $assign(cur_floor,dopen_floor);
    }
    /* Dark floor */
    i0=(2+randint(2));
    y_height=(yval-i0);
    y_depth=(yval+i0);
    x_left=(xval-1);
    x_right=(xval+1);
    for(var $e336=y_depth,$ie336=y_height;$ie336<=$e336;$ie336++){
      i1=$ie336;
      for(var $e337=x_right,$ie337=x_left;$ie337<=$e337;$ie337++){
        i2=$ie337;
        cave[i1][i2].fval=((cur_floor.ftval)&15);
        cave[i1][i2].fopen=cur_floor.ftopen;
      }
    }
    for(var $e338=((y_depth+1)),$ie338=((y_height-1));$ie338<=$e338;$ie338++){
      i1=$ie338;
      var $w339=cave[i1][(x_left-1)];
      $w339.fval=((rock_wall1.ftval)&15);
      $w339.fopen=rock_wall1.ftopen;
      var $w340=cave[i1][(x_right+1)];
      $w340.fval=((rock_wall1.ftval)&15);
      $w340.fopen=rock_wall1.ftopen;
    }
    for(var $e341=x_right,$ie341=x_left;$ie341<=$e341;$ie341++){
      i1=$ie341;
      var $w342=cave[(y_height-1)][i1];
      $w342.fval=((rock_wall1.ftval)&15);
      $w342.fopen=rock_wall1.ftopen;
      var $w343=cave[(y_depth+1)][i1];
      $w343.fval=((rock_wall1.ftval)&15);
      $w343.fopen=rock_wall1.ftopen;
    }
    i0=(2+randint(9));
    y_height=(yval-1);
    y_depth=(yval+1);
    x_left=(xval-i0);
    x_right=(xval+i0);
    for(var $e344=y_depth,$ie344=y_height;$ie344<=$e344;$ie344++){
      i1=$ie344;
      for(var $e345=x_right,$ie345=x_left;$ie345<=$e345;$ie345++){
        i2=$ie345;
        cave[i1][i2].fval=((cur_floor.ftval)&15);
        cave[i1][i2].fopen=cur_floor.ftopen;
      }
    }
    for(var $e346=((y_depth+1)),$ie346=((y_height-1));$ie346<=$e346;$ie346++){
      i1=$ie346;
      var $w347=cave[i1][(x_left-1)];
      if((($w347.fval!==cur_floor.ftval))){
        $w347.fval=((rock_wall1.ftval)&15);
        $w347.fopen=rock_wall1.ftopen;
      }
      var $w348=cave[i1][(x_right+1)];
      if((($w348.fval!==cur_floor.ftval))){
        $w348.fval=((rock_wall1.ftval)&15);
        $w348.fopen=rock_wall1.ftopen;
      }
    }
    for(var $e349=x_right,$ie349=x_left;$ie349<=$e349;$ie349++){
      i1=$ie349;
      var $w350=cave[(y_height-1)][i1];
      if((($w350.fval!==cur_floor.ftval))){
        $w350.fval=((rock_wall1.ftval)&15);
        $w350.fopen=rock_wall1.ftopen;
      }
      var $w351=cave[(y_depth+1)][i1];
      if((($w351.fval!==cur_floor.ftval))){
        $w351.fval=((rock_wall1.ftval)&15);
        $w351.fopen=rock_wall1.ftopen;
      }
    }
    /* Special features... */
    switch(randint(4)){
      case 1:{
        /* Large middle pillar */
        for(var $e352=(yval+1),$ie352=(yval-1);$ie352<=$e352;$ie352++){
          i1=$ie352;
          for(var $e353=(xval+1),$ie353=(xval-1);$ie353<=$e353;$ie353++){
            i2=$ie353;
            cave[i1][i2].fval=((8)&15);
          }
        }
        break;
      }
      case 2:{
        /* Inner treasure vault */
        for(var $e354=(yval+1),$ie354=(yval-1);$ie354<=$e354;$ie354++){
          i1=$ie354;
          cave[i1][(xval-1)].fval=((8)&15);
          cave[i1][(xval+1)].fval=((8)&15);
        }
        cave[(yval-1)][xval].fval=((8)&15);
        cave[(yval+1)][xval].fval=((8)&15);
        switch(randint(4)){
          case 1:{
            /* Place a door */
            place_secret_door((yval-1),xval);
            break;
          }
          case 2:{
            place_secret_door((yval+1),xval);
            break;
          }
          case 3:{
            place_secret_door(yval,(xval-1));
            break;
          }
          case 4:{
            place_secret_door(yval,(xval+1));
            break;
          }
        }
        /* Place a treasure in the vault */
        place_object(yval,xval);
        /* Let's gaurd the treasure well... */
        vault_monster(yval,xval,(2+randint(2)));
        /* Traps naturally */
        vault_trap(yval,xval,4,4,(1+randint(3)));
        break;
      }
      case 3:{
        if(((randint(3)===1))){
          cave[(yval-1)][(xval-2)].fval=((8)&15);
          cave[(yval+1)][(xval-2)].fval=((8)&15);
          cave[(yval-1)][(xval+2)].fval=((8)&15);
          cave[(yval-1)][(xval+2)].fval=((8)&15);
          cave[(yval-2)][(xval-1)].fval=((8)&15);
          cave[(yval-2)][(xval+1)].fval=((8)&15);
          cave[(yval+2)][(xval-1)].fval=((8)&15);
          cave[(yval+2)][(xval+1)].fval=((8)&15);
          if(((randint(3)===1))){
            place_secret_door(yval,(xval-2));
            place_secret_door(yval,(xval+2));
            place_secret_door((yval-2),xval);
            place_secret_door((yval+2),xval);
          }
        }else if(((randint(3)===1))){
          cave[yval][xval].fval=((8)&15);
          cave[(yval-1)][xval].fval=((8)&15);
          cave[(yval+1)][xval].fval=((8)&15);
          cave[yval][(xval-1)].fval=((8)&15);
          cave[yval][(xval+1)].fval=((8)&15);
        }else if(((randint(3)===1))){
          cave[yval][xval].fval=((8)&15);
        }
        break;
      }
      case 4:{
        break;
      }
    }
  }
  /* Constructs a tunnel between two points */
  function tunnel(row1,col1,row2,col2){
    var tmp_row=0;
    var tmp_col=0;
    var row_dir=0;
    var col_dir=0;
    var i1=0;
    var i2=0;
    var tmp=0;
    var tunstk=$arr(1,1000,()=>({y:0,x:0}));
    var wallstk=$arr(1,1000,()=>({y:0,x:0}));
    var tunptr=0;
    var wallptr=0;
    var stop_flag=false;
    var door_flag=false;
    /* Main procedure for Tunnel */
    /* Note: 9 is a temporary value */
    stop_flag=false;
    door_flag=false;
    tunptr=0;
    wallptr=0;
    correct_dir({get v(){return row_dir},set v($x){row_dir=$x}},{get v(){return col_dir},set v($x){col_dir=$x}},row1,col1,row2,col2);
    do{
      if(((randint(100)>dun_tun_chg))){
        rand_dir({get v(){return row_dir},set v($x){row_dir=$x}},{get v(){return col_dir},set v($x){col_dir=$x}},row1,col1,row2,col2,dun_tun_rnd);
      }
      tmp_row=(row1+row_dir);
      tmp_col=(col1+col_dir);
      while((!(in_bounds(tmp_row,tmp_col)))){
        rand_dir({get v(){return row_dir},set v($x){row_dir=$x}},{get v(){return col_dir},set v($x){col_dir=$x}},row1,col1,row2,col2,dun_tun_rnd);
        tmp_row=(row1+row_dir);
        tmp_col=(col1+col_dir);
      }
      var $w357=cave[tmp_row][tmp_col];
      if((($w357.fval===rock_wall1.ftval))){
        row1=tmp_row;
        col1=tmp_col;
        if(((wallptr<1000))){
          wallptr=(wallptr+1);
        }
        wallstk[wallptr].y=row1;
        wallstk[wallptr].x=col1;
        for(var $e358=(row1+1),$ie358=(row1-1);$ie358<=$e358;$ie358++){
          i1=$ie358;
          for(var $e359=(col1+1),$ie359=(col1-1);$ie359<=$e359;$ie359++){
            i2=$ie359;
            if((in_bounds(i1,i2))){
              var $w360=cave[i1][i2];
              if(($in($w360.fval,wall_set))){
                $w360.fval=((9)&15);
              }
            }
          }
        }
      }else if((($w357.fval===corr_floor1.ftval))){
        row1=tmp_row;
        col1=tmp_col;
        if((!(door_flag))){
          if(((doorptr<=100))){
            doorptr=(doorptr+1);
            doorstk[doorptr].y=row1;
            doorstk[doorptr].x=col1;
          }
          door_flag=true;
        }
        if(((randint(100)>dun_tun_con))){
          stop_flag=true;
        }
      }else if((($w357.fval===0))){
        row1=tmp_row;
        col1=tmp_col;
        if(((tunptr<1000))){
          tunptr=(tunptr+1);
        }
        tunstk[tunptr].y=row1;
        tunstk[tunptr].x=col1;
        door_flag=false;
      }else if((($w357.fval!==9))){
        row1=tmp_row;
        col1=tmp_col;
      }
    }while(!(((((((row1===row2))&&((col1===col2))))||(stop_flag)))));
    for(var $e361=tunptr,$ie361=1;$ie361<=$e361;$ie361++){
      i1=$ie361;
      cave[tunstk[i1].y][tunstk[i1].x].fval=((corr_floor1.ftval)&15);
      cave[tunstk[i1].y][tunstk[i1].x].fopen=corr_floor1.ftopen;
    }
    for(var $e362=wallptr,$ie362=1;$ie362<=$e362;$ie362++){
      i1=$ie362;
      var $w363=cave[wallstk[i1].y][wallstk[i1].x];
      if((($w363.fval===9))){
        if(((randint(100)<dun_tun_pen))){
          place_door(wallstk[i1].y,wallstk[i1].x);
        }else{
          $w363.fval=((corr_floor2.ftval)&15);
          $w363.fopen=corr_floor2.ftopen;
        }
      }
    }
  }
  /* Places door at y,x position if at least 2 walls found */
  function try_door(y,x){
    function next_to(y,x){
      var $ret=false;
      if(((next_to8(y,x,$S26)>2))){
        if(((($in(cave[(y-1)][x].fval,wall_set))&&($in(cave[(y+1)][x].fval,wall_set))))){
          $ret=true;
        }else if(((($in(cave[y][(x-1)].fval,wall_set))&&($in(cave[y][(x+1)].fval,wall_set))))){
          $ret=true;
        }else{
          $ret=false;
        }
      }else{
        $ret=false;
      }
      return $ret;
    }
    if(((randint(100)>dun_tun_jct))){
      if(((cave[y][x].fval===corr_floor1.ftval))){
        if((next_to(y,x))){
          place_door(y,x);
        }
      }
    }
  }
  /* Cave logic flow for generation of new dungeon */
  function cave_gen(){
    var room_map=$arr(1,20,()=>$arr(1,20,()=>false));
    var i1=0;
    var i2=0;
    var i3=0;
    var i4=0;
    var y1=0;
    var x1=0;
    var y2=0;
    var x2=0;
    var pick1=0;
    var pick2=0;
    var row_rooms=0;
    var col_rooms=0;
    var alloc_level=0;
    var yloc=$zeros(400);
    var xloc=$zeros(400);
    seed=get_seed();
    row_rooms=(2*Math.trunc(Math.fround($rdiv(cur_height,screen_height))));
    col_rooms=(2*Math.trunc(Math.fround($rdiv(cur_width,screen_width))));
    for(var $e364=row_rooms,$ie364=1;$ie364<=$e364;$ie364++){
      i1=$ie364;
      for(var $e365=col_rooms,$ie365=1;$ie365<=$e365;$ie365++){
        i2=$ie365;
        room_map[i1][i2]=false;
      }
    }
    for(var $e366=randnor(dun_roo_mea,2),$ie366=1;$ie366<=$e366;$ie366++){
      i1=$ie366;
      room_map[randint(row_rooms)][randint(col_rooms)]=true;
    }
    i3=0;
    for(var $e367=row_rooms,$ie367=1;$ie367<=$e367;$ie367++){
      i1=$ie367;
      for(var $e368=col_rooms,$ie368=1;$ie368<=$e368;$ie368++){
        i2=$ie368;
        if(((room_map[i1][i2]===true))){
          i3=(i3+1);
          yloc[i3]=(((((i1-1))*(((quart_height*2)+1)))+quart_height)+1);
          xloc[i3]=(((((i2-1))*(((quart_width*2)+1)))+quart_width)+1);
          if(((dun_level>randint(dun_unusual)))){
            switch(randint(3)){
              case 1:{
                build_type1(yloc[i3],xloc[i3]);
                break;
              }
              case 2:{
                build_type2(yloc[i3],xloc[i3]);
                break;
              }
              case 3:{
                build_type3(yloc[i3],xloc[i3]);
                break;
              }
            }
          }else{
            build_room(yloc[i3],xloc[i3]);
          }
        }
      }
    }
    for(var $e370=i3,$ie370=1;$ie370<=$e370;$ie370++){
      i4=$ie370;
      pick1=randint(i3);
      pick2=randint(i3);
      y1=yloc[pick1];
      x1=xloc[pick1];
      yloc[pick1]=yloc[pick2];
      xloc[pick1]=xloc[pick2];
      yloc[pick2]=y1;
      xloc[pick2]=x1;
    }
    doorptr=0;
    for(var $e371=(i3-1),$ie371=1;$ie371<=$e371;$ie371++){
      i4=$ie371;
      y1=yloc[i4];
      x1=xloc[i4];
      y2=yloc[(i4+1)];
      x2=xloc[(i4+1)];
      tunnel(y2,x2,y1,x1);
    }
    fill_cave($clone(rock_wall1));
    for(var $e372=dun_str_mag,$ie372=1;$ie372<=$e372;$ie372++){
      i1=$ie372;
      place_streamer($clone(rock_wall2),dun_str_mc);
    }
    for(var $e373=dun_str_qua,$ie373=1;$ie373<=$e373;$ie373++){
      i1=$ie373;
      place_streamer($clone(rock_wall3),dun_str_qc);
    }
    place_boundry();
    /* Place intersection doors */
    for(var $e374=doorptr,$ie374=1;$ie374<=$e374;$ie374++){
      i1=$ie374;
      try_door(doorstk[i1].y,(doorstk[i1].x-1));
      try_door(doorstk[i1].y,(doorstk[i1].x+1));
      try_door((doorstk[i1].y-1),doorstk[i1].x);
      try_door((doorstk[i1].y+1),doorstk[i1].x);
    }
    alloc_level=Math.trunc(Math.fround($rdiv(dun_level,3)));
    if(((alloc_level<2))){
      alloc_level=2;
    }else if(((alloc_level>10))){
      alloc_level=10;
    }
    place_stairs(2,(randint(2)+2),3);
    place_stairs(1,randint(2),3);
    alloc_monster($S27,(((randint(8)+min_malloc_level)+alloc_level)),0,true);
    alloc_object($S28,3,randint(alloc_level));
    alloc_object($S27,5,randnor(treas_room_alloc,3));
    alloc_object($S15,5,randnor(treas_any_alloc,3));
    alloc_object($S15,4,randnor(treas_gold_alloc,3));
    alloc_object($S15,1,randint(alloc_level));
    if(((dun_level>=win_mon_appear))){
      place_win_monster();
    }
  }
  /* Builds a store at a row,column coordinate */
  function build_store(store_num,y,x){
    var yval=0;
    var y_height=0;
    var y_depth=0;
    var xval=0;
    var x_left=0;
    var x_right=0;
    var i1=0;
    var i2=0;
    var cur_pos=0;
    yval=((((y-1))*10)+6);
    xval=((((x-1))*16)+17);
    y_height=(yval-randint(3));
    y_depth=(yval+randint(4));
    x_left=(xval-randint(6));
    x_right=(xval+randint(6));
    for(var $e375=y_depth,$ie375=y_height;$ie375<=$e375;$ie375++){
      i1=$ie375;
      for(var $e376=x_right,$ie376=x_left;$ie376<=$e376;$ie376++){
        i2=$ie376;
        cave[i1][i2].fval=((boundry_wall.ftval)&15);
        cave[i1][i2].fopen=boundry_wall.ftopen;
      }
    }
    switch(randint(4)){
      case 1:{
        i1=((randint((y_depth-y_height))+y_height)-1);
        i2=x_left;
        break;
      }
      case 2:{
        i1=((randint((y_depth-y_height))+y_height)-1);
        i2=x_right;
        break;
      }
      case 3:{
        i1=y_depth;
        i2=((randint((x_right-x_left))+x_left)-1);
        break;
      }
      case 4:{
        i1=y_height;
        i2=((randint((x_right-x_left))+x_left)-1);
        break;
      }
    }
    var $w378=cave[i1][i2];
    $w378.fval=((corr_floor3.ftval)&15);
    $w378.fopen=corr_floor3.ftopen;
    popt({get v(){return cur_pos},set v($x){cur_pos=$x}});
    $w378.tptr=cur_pos;
    $assign(t_list[cur_pos],store_door[store_num]);
  }
  /* Town logic flow for generation of new town */
  function town_gen(){
    var y=0;
    var x=0;
    var i1=0;
    var i2=0;
    var i3=0;
    var i4=0;
    var i5=0;
    var rooms=$zeros(6);
    seed=town_seed;
    for(var $e379=6,$ie379=1;$ie379<=$e379;$ie379++){
      i1=$ie379;
      rooms[i1]=i1;
    }
    i4=6;
    for(var $e380=2,$ie380=1;$ie380<=$e380;$ie380++){
      i1=$ie380;
      for(var $e381=3,$ie381=1;$ie381<=$e381;$ie381++){
        i2=$ie381;
        i3=randint(i4);
        build_store(rooms[i3],i1,i2);
        for(var $e382=(i4-1),$ie382=i3;$ie382<=$e382;$ie382++){
          i5=$ie382;
          rooms[i5]=rooms[(i5+1)];
        }
        i4=(i4-1);
      }
    }
    fill_cave($clone(dopen_floor));
    place_boundry();
    if(($odd($mod(turn,5000)))){
      /* Night */
      for(var $e383=cur_height,$ie383=1;$ie383<=$e383;$ie383++){
        i1=$ie383;
        for(var $e384=cur_width,$ie384=1;$ie384<=$e384;$ie384++){
          i2=$ie384;
          if(((cave[i1][i2].fval!==dopen_floor.ftval))){
            cave[i1][i2].pl=true;
          }
        }
      }
      place_stairs(2,1,0);
      seed=get_seed();
      alloc_monster($S27,min_malloc_tn,3,true);
      store_maint();
    }else{
      /* Day */
      for(var $e385=cur_height,$ie385=1;$ie385<=$e385;$ie385++){
        i1=$ie385;
        for(var $e386=cur_width,$ie386=1;$ie386<=$e386;$ie386++){
          i2=$ie386;
          cave[i1][i2].pl=true;
        }
      }
      place_stairs(2,1,0);
      seed=get_seed();
      alloc_monster($S27,min_malloc_td,3,true);
      store_maint();
    }
  }
  panel_row_min=0;
  panel_row_max=0;
  panel_col_min=0;
  panel_col_max=0;
  char_row=(-1);
  char_col=(-1);
  tlink();
  mlink();
  blank_cave();
  if(((dun_level===0))){
    cur_height=screen_height;
    cur_width=screen_width;
    max_panel_rows=((Math.trunc(Math.fround($rdiv(cur_height,screen_height)))*2)-2);
    max_panel_cols=((Math.trunc(Math.fround($rdiv(cur_width,screen_width)))*2)-2);
    panel_row=max_panel_rows;
    panel_col=max_panel_cols;
    town_gen();
  }else{
    cur_height=max_height;
    cur_width=max_width;
    max_panel_rows=((Math.trunc(Math.fround($rdiv(cur_height,screen_height)))*2)-2);
    max_panel_cols=((Math.trunc(Math.fround($rdiv(cur_width,screen_width)))*2)-2);
    panel_row=max_panel_rows;
    panel_col=max_panel_cols;
    cave_gen();
  }
}
/* Moria game module					-RAK- */
/* The code in this section has gone through many revisions, and */
/* some of it could stand some more hard work...  -RAK- */
function* dungeon(){
  var dir_val=0;
  /* For movement */
  var y=0;
  var x=0;
  var moves=0;
  /* For movement */
  var i1=0;
  var i2=0;
  var tmp1=0;
  /* Temporaries */
  var old_chp=0;
  var old_cmana=0;
  /* Detect change */
  var regen_amount=0;
  /* Regenerate hp and mana */
  var command='\0';
  /* Last command */
  var out_val="";
  /* For messages */
  var tmp_str="";
  /* Temporary */
  var moria_flag=false;
  /* Next level when true */
  var reset_flag=false;
  /* Do not move creatures */
  var search_flag=false;
  /* Player is searching */
  var teleport_flag=false;
  /* Handle telport traps */
  var player_light=false;
  /* Player carrying light */
  var save_msg_flag=false;
  /* Msg flag after INKEY */
  /* Pre-declaration of MOVE_CHAR				-RAK- */
  /* Pre-declaration of CREATURES				-RAK- */
  /* Changes stats up or down for magic items		-RAK- */
  function change_stat(stat,amount,factor){
    var i1=0;
    var i2=0;
    var i3=0;
    i2=(amount*factor);
    i3=Math.abs(amount);
    for(var $e387=i3,$ie387=1;$ie387<=$e387;$ie387++){
      i1=$ie387;
      if(((i2<0))){
        stat.v=de_statt(stat.v);
      }else{
        stat.v=in_statt(stat.v);
      }
    }
  }
  /* Changes speed of monsters relative to player		-RAK- */
  /* Note: When the player is sped up or slowed down, I simply */
  /* change the speed of all the monsters.  This greatly */
  /* simplified the logic... */
  function change_speed(num){
    var i1=0;
    py.flags.speed=(py.flags.speed+num);
    i1=muptr;
    while(((i1!==0))){
      m_list[i1].cspeed=(m_list[i1].cspeed+num);
      i1=m_list[i1].nptr;
    }
  }
  /* Player bonuses					-RAK- */
  /* When an item is worn or taken off, this re-adjusts the player */
  /* bonuses.  Factor=1 : wear; Factor=-1 : removed */
  function py_bonuses(tobj,factor){
    var item_flags=0;
    var i1=0;
    var old_dis_ac=0;
    var $w388=py.flags;
    if(($w388.slow_digest)){
      $w388.food_digested=($w388.food_digested+1);
    }
    if(($w388.regenerate)){
      $w388.food_digested=($w388.food_digested-3);
    }
    $w388.see_inv=false;
    $w388.teleport=false;
    $w388.free_act=false;
    $w388.slow_digest=false;
    $w388.aggravate=false;
    $w388.sustain_str=false;
    $w388.sustain_int=false;
    $w388.sustain_wis=false;
    $w388.sustain_con=false;
    $w388.sustain_dex=false;
    $w388.sustain_chr=false;
    $w388.fire_resist=false;
    $w388.acid_resist=false;
    $w388.cold_resist=false;
    $w388.regenerate=false;
    $w388.lght_resist=false;
    $w388.ffall=false;
    if(((((1&tobj.flags)>>>0)!==0))){
      change_stat($rf(py.stat,"cstr"),tobj.p1,factor);
      change_stat($rf(py.stat,"str"),tobj.p1,factor);
      print_stat=((1|print_stat)>>>0);
    }
    if(((((2&tobj.flags)>>>0)!==0))){
      change_stat($rf(py.stat,"cdex"),tobj.p1,factor);
      change_stat($rf(py.stat,"dex"),tobj.p1,factor);
      print_stat=((2|print_stat)>>>0);
    }
    if(((((4&tobj.flags)>>>0)!==0))){
      change_stat($rf(py.stat,"ccon"),tobj.p1,factor);
      change_stat($rf(py.stat,"con"),tobj.p1,factor);
      print_stat=((4|print_stat)>>>0);
    }
    if(((((8&tobj.flags)>>>0)!==0))){
      change_stat($rf(py.stat,"cint"),tobj.p1,factor);
      change_stat($rf(py.stat,"int"),tobj.p1,factor);
      print_stat=((8|print_stat)>>>0);
    }
    if(((((16&tobj.flags)>>>0)!==0))){
      change_stat($rf(py.stat,"cwis"),tobj.p1,factor);
      change_stat($rf(py.stat,"wis"),tobj.p1,factor);
      print_stat=((16|print_stat)>>>0);
    }
    if(((((32&tobj.flags)>>>0)!==0))){
      change_stat($rf(py.stat,"cchr"),tobj.p1,factor);
      change_stat($rf(py.stat,"chr"),tobj.p1,factor);
      print_stat=((32|print_stat)>>>0);
    }
    if(((((64&tobj.flags)>>>0)!==0))){
      py.misc.srh=(py.misc.srh+((tobj.p1*factor)));
      py.misc.fos=(py.misc.fos-((tobj.p1*factor)));
    }
    if(((((256&tobj.flags)>>>0)!==0))){
      py.misc.stl=(py.misc.stl+(2*factor));
    }
    if(((((4096&tobj.flags)>>>0)!==0))){
      i1=(tobj.p1*factor);
      change_speed((-i1));
    }
    if(((((134217728&tobj.flags)>>>0)!==0))){
      if(((factor>0))){
        py.flags.blind=(py.flags.blind+1000);
      }
    }
    if(((((268435456&tobj.flags)>>>0)!==0))){
      if(((factor>0))){
        py.flags.afraid=(py.flags.afraid+50);
      }
    }
    if(((((1073741824&tobj.flags)>>>0)!==0))){
      py.flags.see_infra=(py.flags.see_infra+((tobj.p1*factor)));
    }
    var $w389=py.misc;
    old_dis_ac=$w389.dis_ac;
    $w389.ptohit=tohit_adj();
    /* Real To Hit */
    $w389.ptodam=todam_adj();
    /* Real To Dam */
    $w389.ptoac=toac_adj();
    /* Real To AC */
    $w389.pac=0;
    /* Real AC */
    $w389.dis_th=$w389.ptohit;
    /* Display To Hit */
    $w389.dis_td=$w389.ptodam;
    /* Display To Dam */
    $w389.dis_ac=0;
    /* Display To AC */
    $w389.dis_tac=$w389.ptoac;
    /* Display AC */
    for(var $e390=(inven_max-2),$ie390=23;$ie390<=$e390;$ie390++){
      i1=$ie390;
      var $w391=inventory[i1];
      if((($w391.tval>0))){
        if(((((2147483648&$w391.flags)>>>0)===0))){
          $w389.pac=($w389.pac+$w391.ac);
          $w389.dis_ac=($w389.dis_ac+$w391.ac);
        }
        $w389.ptohit=($w389.ptohit+$w391.tohit);
        $w389.ptodam=($w389.ptodam+$w391.todam);
        $w389.ptoac=($w389.ptoac+$w391.toac);
        if((($index($w391.name_,"^")===0))){
          $w389.dis_th=($w389.dis_th+$w391.tohit);
          $w389.dis_td=($w389.dis_td+$w391.todam);
          $w389.dis_tac=($w389.dis_tac+$w391.toac);
        }
      }
    }
    $w389.dis_ac=($w389.dis_ac+$w389.dis_tac);
    /* Add in temporary spell increases */
    var $w392=py.flags;
    if((($w392.invuln>0))){
      $w389.pac=($w389.pac+100);
      $w389.dis_ac=($w389.dis_ac+100);
    }
    if((($w392.blessed>0))){
      $w389.pac=($w389.pac+2);
      $w389.dis_ac=($w389.dis_ac+2);
    }
    if((($w392.detect_inv>0))){
      $w392.see_inv=true;
    }
    if(((old_dis_ac!==$w389.dis_ac))){
      print_stat=((64|print_stat)>>>0);
    }
    item_flags=0;
    for(var $e393=(inven_max-2),$ie393=23;$ie393<=$e393;$ie393++){
      i1=$ie393;
      var $w394=inventory[i1];
      item_flags=((item_flags|$w394.flags)>>>0);
    }
    if(((((128&item_flags)>>>0)!==0))){
      py.flags.slow_digest=true;
    }
    if(((((512&item_flags)>>>0)!==0))){
      py.flags.aggravate=true;
    }
    if(((((1024&item_flags)>>>0)!==0))){
      py.flags.teleport=true;
    }
    if(((((2048&item_flags)>>>0)!==0))){
      py.flags.regenerate=true;
    }
    if(((((524288&item_flags)>>>0)!==0))){
      py.flags.fire_resist=true;
    }
    if(((((1048576&item_flags)>>>0)!==0))){
      py.flags.acid_resist=true;
    }
    if(((((2097152&item_flags)>>>0)!==0))){
      py.flags.cold_resist=true;
    }
    if(((((8388608&item_flags)>>>0)!==0))){
      py.flags.free_act=true;
    }
    if(((((16777216&item_flags)>>>0)!==0))){
      py.flags.see_inv=true;
    }
    if(((((33554432&item_flags)>>>0)!==0))){
      py.flags.lght_resist=true;
    }
    if(((((67108864&item_flags)>>>0)!==0))){
      py.flags.ffall=true;
    }
    for(var $e395=(inven_max-2),$ie395=23;$ie395<=$e395;$ie395++){
      i1=$ie395;
      var $w396=inventory[i1];
      if(((((4194304&$w396.flags)>>>0)!==0))){
        switch($w396.p1){
          case 1:{
            py.flags.sustain_str=true;
            break;
          }
          case 2:{
            py.flags.sustain_int=true;
            break;
          }
          case 3:{
            py.flags.sustain_wis=true;
            break;
          }
          case 4:{
            py.flags.sustain_con=true;
            break;
          }
          case 5:{
            py.flags.sustain_dex=true;
            break;
          }
          case 6:{
            py.flags.sustain_chr=true;
            break;
          }
          default:{
          }
        }
      }
    }
    var $w398=py.flags;
    if(($w398.slow_digest)){
      $w398.food_digested=($w398.food_digested-1);
    }
    if(($w398.regenerate)){
      $w398.food_digested=($w398.food_digested+3);
    }
  }
  /* Returns a '*' for cursed items, a ')' for normal ones -RAK- */
  /* NOTE: '*' returned only if item has been identified... */
  function cur_char1(item_val){
    var $ret='\0';
    var $w399=inventory[item_val];
    if(((((2147483648&$w399.flags)>>>0)===0))){
      $ret=")";
    /* Not cursed... */
    }else if((($index($w399.name_,"^")>0))){
      $ret=")";
    }else{
      /* Cursed, but not identified */
      $ret="*";
    }
    return $ret;
  }
  /* Cursed and identified... */
  /* Returns a '*' for cursed items, a ')' for normal ones -RAK- */
  function cur_char2(item_val){
    var $ret='\0';
    var $w400=inventory[item_val];
    if(((((2147483648&$w400.flags)>>>0)===0))){
      $ret=")";
    }else{
      /* Not cursed... */
      $ret="*";
    }
    return $ret;
  }
  /* Cursed... */
  /* Comprehensive function block to handle all inventory	-RAK- */
  /* and equipment routines.  Five kinds of calls can take place. */
  /* Note that '?' is a special call for other routines to display */
  /* only a portion of the inventory, and take no other action. */
  function* inven_command(command,r1,r2){
    var $ret=false;
    var com_val=0;
    var scr_state=0;
    var exit_flag=false;
    var test_flag=false;
    /* Displays inventory items from r1 to r2	-RAK- */
    function show_inven(r1,r2){
      var i1=0;
      var tmp_val="";
      var out_val="";
      if(((r1>0))){
        /* R1 = 0 dummy call */
        for(var $e401=r2,$ie401=r1;$ie401<=$e401;$ie401++){
          i1=$ie401;
          /* Print the items */
          objdes({get v(){return tmp_val},set v($x){tmp_val=$x}},i1,true);
          out_val=$cap($ws($chr((i1+96)),0)+$ws(cur_char1(i1),0)+$ws(" ",0)+$ws(tmp_val,0),80);
          prt(out_val,(i1+1),1);
        }
        if(((r2<22))){
          prt("",(r2+2),1);
        }
        /* Clear line after */
        scr_state=1;
      }
    }
    /* Set state to 1 */
    /* Displays equipment items from r1 to end	-RAK- */
    function show_equip(r1){
      var i1=0;
      var i2=0;
      var prt1="";
      var prt2="";
      var out_val="";
      if(((r1>equip_ctr))){
        /* Last item gone */
        prt("",(equip_ctr+3),1);
      }else if(((r1>0))){
        /* R1 = 0 dummy call */
        i2=0;
        for(var $e402=(inven_max-1),$ie402=23;$ie402<=$e402;$ie402++){
          i1=$ie402;
          /* Range of equipment */
          var $w403=inventory[i1];
          if((($w403.tval>0))){
            i2=(i2+1);
            if(((i2>=r1))){
              /* Display only given range */
              switch(i1){
                case 23:{
                  /* Get position */
                  prt1=$cap(" You are wielding   : ",80);
                  break;
                }
                case 24:{
                  prt1=$cap(" Worn on head       : ",80);
                  break;
                }
                case 25:{
                  prt1=$cap(" Worn around neck   : ",80);
                  break;
                }
                case 26:{
                  prt1=$cap(" Worn on body       : ",80);
                  break;
                }
                case 27:{
                  prt1=$cap(" Worn on arm        : ",80);
                  break;
                }
                case 28:{
                  prt1=$cap(" Worn on hands      : ",80);
                  break;
                }
                case 29:{
                  prt1=$cap(" Worn on right hand : ",80);
                  break;
                }
                case 30:{
                  prt1=$cap(" Worn on left hand  : ",80);
                  break;
                }
                case 31:{
                  prt1=$cap(" Worn on feet       : ",80);
                  break;
                }
                case 32:{
                  prt1=$cap(" Worn about body    : ",80);
                  break;
                }
                case 33:{
                  prt1=$cap(" Light source       : ",80);
                  break;
                }
                case 34:{
                  prt1=$cap(" Secondary weapon   : ",80);
                  break;
                }
                default:{
                  prt1=$cap(" Unknown value      : ",80);
                }
              }
              objdes({get v(){return prt2},set v($x){prt2=$x}},i1,true);
              out_val=$cap($ws($chr((i2+96)),0)+$ws(cur_char2(i1),0)+$ws(prt1,0)+$ws(prt2,0),80);
              prt(out_val,(i2+2),1);
            }
          }
        }
        prt("",(i2+3),1);
        /* Clear last line */
        scr_state=2;
      }
    }
    /* Set state of screen */
    /* Remove item from equipment list		-RAK- */
    function* remove(item_val){
      var $ret=0;
      var i1=0;
      var i2=0;
      var typ=0;
      var out_val="";
      var prt1="";
      var prt2="";
      var flag=false;
      i1=0;
      flag=false;
      typ=inventory[item_val].tval;
      do{
        i1=(i1+1);
        var $w405=inventory[i1];
        if(((typ>$w405.tval))){
          for(var $e406=i1,$ie406=inven_ctr;$ie406>=$e406;$ie406--){
            i2=$ie406;
            $assign(inventory[(i2+1)],inventory[i2]);
          }
          $assign(inventory[i1],inventory[item_val]);
          inven_ctr=(inven_ctr+1);
          equip_ctr=(equip_ctr-1);
          flag=true;
        }
      }while(!((flag)));
      switch(typ){
        case 10:case 11:case 12:case 20:case 21:case 22:case 23:case 25:{
          prt1=$cap("Was wielding ",80);
          break;
        }
        case 15:{
          prt1=$cap("Light source was ",80);
          break;
        }
        default:{
          prt1=$cap("Was wearing ",80);
        }
      }
      objdes({get v(){return prt2},set v($x){prt2=$x}},i1,true);
      out_val=$cap(((((prt1+prt2)+" (")+$chr((i1+96)))+")"),80);
      (yield* msg_print(out_val));
      $assign(inventory[item_val],blank_treasure);
      if(((item_val!==(inven_max-1)))){
        /* For secondary weapon */
        py_bonuses($clone(inventory[i1]),(-1));
      }
      $ret=i1;
      return $ret;
    }
    /* Unwear routine, remove a piece of equipment	-RAK- */
    function* unwear(){
      var i1=0;
      var i2=0;
      var com_val=0;
      var exit_flag=false;
      var test_flag=false;
      var command='\0';
      var out_val="";
      if(((scr_state===1))){
        clear(1,1);
        show_equip(1);
      }
      exit_flag=false;
      do{
        out_val=$cap($ws("(a-",0)+$ws($chr((equip_ctr+96)),0)+$ws(", * for equipment list,",0)+$ws(" ^Z to exit) ",0)+$ws("Take off which one ?",0),80);
        test_flag=false;
        (yield* msg_print(out_val));
        do{
          (yield* inkey({get v(){return command},set v($x){command=$x}}));
          com_val=$ord(command);
          switch(com_val){
            case 0:case 3:case 25:case 26:case 27:{
              test_flag=true;
              exit_flag=true;
              break;
            }
            case 42:{
              clear(2,1);
              show_equip(1);
              break;
            }
            default:{
              com_val=(com_val-96);
              if(((((com_val>=1))&&((com_val<=equip_ctr))))){
                test_flag=true;
              }
            }
          }
        }while(!((test_flag)));
        if((!(exit_flag))){
          reset_flag=false;
          /* Player turn */
          i1=0;
          i2=22;
          do{
            i2=(i2+1);
            if(((inventory[i2].tval>0))){
              i1=(i1+1);
            }
          }while(!(((i1===com_val))));
          if(((((2147483648&inventory[i2].flags)>>>0)!==0))){
            (yield* msg_print("Hmmm, it seems to be cursed..."));
            com_val=0;
          }else{
            (yield* remove(i2));
          }
        }
        if(((scr_state===0))){
          exit_flag=true;
        }else if(((equip_ctr===0))){
          exit_flag=true;
        }else if(((inven_ctr>21))){
          exit_flag=true;
        }else if((!(exit_flag))){
          show_equip(com_val);
        }
      }while(!((exit_flag)));
      if(((scr_state!==0))){
        if(((equip_ctr===0))){
          clear(1,1);
        }else{
          prt("You are currently using -",1,1);
        }
      }
    }
    /* Wear routine, wear or wield an item		-RAK- */
    function* wear(){
      var com_val=0;
      var i1=0;
      var i2=0;
      var i3=0;
      var tmp=0;
      var out_val="";
      var prt1="";
      var prt2="";
      var unwear_obj=({name_:"",tval:0,tchar:'\0',flags:0,p1:0,cost:0,subval:0,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:"",level:0});
      var exit_flag=false;
      var test_flag=false;
      if(((scr_state===2))){
        clear(1,1);
        show_inven(1,inven_ctr);
      }
      exit_flag=false;
      do{
        out_val=$cap($ws("(a-",0)+$ws($chr((inven_ctr+96)),0)+$ws(", * for equipment list,",0)+$ws(" ^Z to exit) ",0)+$ws("Wear/Wield which one ?",0),80);
        test_flag=false;
        (yield* msg_print(out_val));
        do{
          (yield* inkey({get v(){return command},set v($x){command=$x}}));
          com_val=$ord(command);
          switch(com_val){
            case 0:case 3:case 25:case 26:case 27:{
              test_flag=true;
              exit_flag=true;
              break;
            }
            case 42:{
              clear(2,1);
              show_inven(1,inven_ctr);
              break;
            }
            default:{
              com_val=(com_val-96);
              if(((((com_val>=1))&&((com_val<=inven_ctr))))){
                test_flag=true;
              }
            }
          }
        }while(!((test_flag)));
        if((!(exit_flag))){
          /* Main logic for wearing */
          reset_flag=false;
          /* Player turn */
          test_flag=true;
          switch(inventory[com_val].tval){
            case 10:{
              /* Slot for equipment */
              i1=23;
              break;
            }
            case 11:{
              i1=23;
              break;
            }
            case 12:{
              i1=23;
              break;
            }
            case 15:{
              i1=33;
              break;
            }
            case 20:{
              i1=23;
              break;
            }
            case 21:{
              i1=23;
              break;
            }
            case 22:{
              i1=23;
              break;
            }
            case 23:{
              i1=23;
              break;
            }
            case 25:{
              i1=23;
              break;
            }
            case 30:{
              i1=31;
              break;
            }
            case 31:{
              i1=28;
              break;
            }
            case 32:{
              i1=32;
              break;
            }
            case 33:{
              i1=24;
              break;
            }
            case 34:{
              i1=27;
              break;
            }
            case 35:{
              i1=26;
              break;
            }
            case 36:{
              i1=26;
              break;
            }
            case 40:{
              i1=25;
              break;
            }
            case 45:{
              if(((inventory[29].tval===0))){
                /* Rings */
                i1=29;
              }else{
                i1=30;
              }
              break;
            }
            default:{
              (yield* msg_print("I don't see how you can use that."));
              test_flag=false;
              com_val=0;
            }
          }
          if((test_flag)){
            if(((inventory[i1].tval>0))){
              if(((((2147483648&inventory[i1].flags)>>>0)!==0))){
                objdes({get v(){return out_val},set v($x){out_val=$x}},i1,false);
                out_val=$cap((("The "+out_val)+" you are "),80);
                switch(i1){
                  case 23:{
                    out_val=$cap((out_val+"wielding "),80);
                    break;
                  }
                  default:{
                    out_val=$cap((out_val+"wearing "),80);
                  }
                }
                (yield* msg_print((out_val+"appears to be cursed.")));
                test_flag=false;
                com_val=0;
              }else if(((inven_ctr>21))){
                if(((inventory[com_val].number>1))){
                  if(((inventory[com_val].subval<512))){
                    (yield* msg_print("You will have to drop something first."));
                    test_flag=false;
                    com_val=0;
                  }
                }
              }
            }
          }
          if((test_flag)){
            $assign(unwear_obj,inventory[i1]);
            $assign(inventory[i1],inventory[com_val]);
            var $w412=inventory[i1];
            /* Fix for torches */
            if((((($w412.subval>255))&&(($w412.subval<512))))){
              $w412.number=1;
              $w412.subval=($w412.subval-255);
            }
            /* Fix for weight */
            inven_weight=(inven_weight+($w412.weight*$w412.number));
            inven_destroy(com_val);
            /* Subtracts weight */
            equip_ctr=(equip_ctr+1);
            py_bonuses($clone(inventory[i1]),1);
            if(((unwear_obj.tval>0))){
              $assign(inventory[inven_max],unwear_obj);
              tmp=(yield* remove(inven_max));
              if(((tmp<com_val))){
                com_val=tmp;
              }
            }
            switch(i1){
              case 23:{
                prt1=$cap("You are wielding ",80);
                break;
              }
              case 33:{
                prt1=$cap("Your light source is ",80);
                break;
              }
              default:{
                prt1=$cap("You are wearing ",80);
              }
            }
            objdes({get v(){return prt2},set v($x){prt2=$x}},i1,true);
            i2=0;
            i3=22;
            do{
              /* Get the right letter of equipment */
              i3=(i3+1);
              if(((inventory[i3].tval>0))){
                i2=(i2+1);
              }
            }while(!(((i3===i1))));
            out_val=$cap(((((prt1+prt2)+" (")+$chr((i2+96)))+cur_char2(i1)),80);
            (yield* msg_print(out_val));
          }
        }
        if(((scr_state===0))){
          exit_flag=true;
        }else if(((inven_ctr===0))){
          exit_flag=true;
        }else if((!(exit_flag))){
          show_inven(com_val,inven_ctr);
        }
      }while(!((exit_flag)));
      if(((scr_state!==0))){
        prt("You are currently carrying -",1,1);
      }
    }
    /* Switch primary and secondary weapons		-RAK- */
    function* switch_weapon(){
      var prt1="";
      var prt2="";
      var tmp_obj=({name_:"",tval:0,tchar:'\0',flags:0,p1:0,cost:0,subval:0,weight:0,number:0,tohit:0,todam:0,ac:0,toac:0,damage:"",level:0});
      if(((((2147483648&inventory[23].flags)>>>0)!==0))){
        objdes({get v(){return prt1},set v($x){prt1=$x}},23,false);
        (yield* msg_print((("The "+prt1)+" you are wielding appears to be cursed.")));
      }else{
        /* Switch weapons */
        reset_flag=false;
        $assign(tmp_obj,inventory[34]);
        $assign(inventory[34],inventory[23]);
        $assign(inventory[23],tmp_obj);
        py_bonuses($clone(inventory[34]),(-1));
        /* Subtract bonuses */
        py_bonuses($clone(inventory[23]),1);
        /* Add bonuses */
        if(((inventory[23].tval>0))){
          prt1=$cap("Primary weapon   : ",80);
          objdes({get v(){return prt2},set v($x){prt2=$x}},23,true);
          (yield* msg_print((prt1+prt2)));
        }
        if(((inventory[34].tval>0))){
          prt1=$cap("Secondary weapon : ",80);
          objdes({get v(){return prt2},set v($x){prt2=$x}},34,true);
          (yield* msg_print((prt1+prt2)));
        }
      }
      if(((scr_state!==0))){
        (yield* msg_print(""));
        clear(1,1);
        prt("You are currently using -",1,1);
        show_equip(1);
      }
    }
    /* Main logic for INVEN_COMMAND			-RAK- */
    $ret=false;
    exit_flag=false;
    scr_state=0;
    do{
      switch(command){
        case "i":{
          /* Inventory */
          if(((inven_ctr===0))){
            (yield* msg_print("You are not carrying anything."));
          }else if(((scr_state!==1))){
            /* Sets scr_state to 1 */
            clear(1,1);
            prt("You are currently carrying -",1,1);
            show_inven(1,inven_ctr);
          }
          break;
        }
        case "e":{
          /* Equipment */
          if(((equip_ctr===0))){
            (yield* msg_print("You are not using any equipment."));
          }else if(((scr_state!==2))){
            /* Sets scr_state to 2 */
            clear(1,1);
            prt("You are currently using -",1,1);
            show_equip(1);
          }
          break;
        }
        case "t":{
          /* Take off */
          if(((equip_ctr===0))){
            (yield* msg_print("You are not using any equipment."));
          }else if(((inven_ctr>21))){
            (yield* msg_print("You will have to drop something first."));
          }else{
            (yield* unwear());
          }
          break;
        }
        case "w":{
          /* May set scr_state to 2 */
          /* Wear/wield */
          if(((inven_ctr===0))){
            (yield* msg_print("You are not carrying anything."));
          }else{
            (yield* wear());
          }
          break;
        }
        case "x":{
          /* May set scr_state to 1 */
          if(((inventory[23].tval!==0))){
            (yield* switch_weapon());
          }else if(((inventory[34].tval!==0))){
            (yield* switch_weapon());
          }else{
            (yield* msg_print("But you are wielding no weapons."));
          }
          break;
        }
        case "?":{
          /* Special function for other routines */
          /* Displays part inven, returns */
          show_inven(r1,r2);
          scr_state=0;
          break;
        }
        default:{
        }
      }
      /* Clear screen state */
      /* Nonsense command */
      if(((scr_state>0))){
        prt("<e>quip, <i>inven, <t>ake-off, <w>ear/wield, e<x>change, or ^Z to exit.",24,2);
        test_flag=false;
        do{
          (yield* inkey({get v(){return command},set v($x){command=$x}}));
          com_val=$ord(command);
          switch(com_val){
            case 0:case 3:case 25:case 26:case 27:case 32:{
              /* Exit from module */
              exit_flag=true;
              test_flag=true;
              break;
            }
            default:{
              switch(command){
                case "e":{
                  /* Module commands */
                  test_flag=true;
                  break;
                }
                case "i":{
                  test_flag=true;
                  break;
                }
                case "t":{
                  test_flag=true;
                  break;
                }
                case "w":{
                  test_flag=true;
                  break;
                }
                case "x":{
                  test_flag=true;
                  break;
                }
                case "?":{
                  break;
                }
                default:{
                }
              }
            }
          }
        }while(!((test_flag)));
        /* Trap special feature */
        /* Nonsense command */
        prt("",24,1);
      }else{
        exit_flag=true;
      }
    }while(!((exit_flag)));
    if(((scr_state>0))){
      /* If true, must redraw screen */
      $ret=true;
    }
    return $ret;
  }
  /* Get the ID of an item and return the CTR value of it	-RAK- */
  function* get_item(com_val,pmt,redraw,i1,i2){
    var $ret=false;
    var command='\0';
    var out_val="";
    var test_flag=false;
    $ret=false;
    com_val.v=0;
    if(((inven_ctr>0))){
      out_val=$cap($ws("(Items ",0)+$ws($chr((i1+96)),0)+$ws("-",0)+$ws($chr((i2+96)),0)+$ws(", * for inventory list, ^Z to exit) ",0)+$ws(pmt,0),80);
      test_flag=false;
      prt(out_val,1,1);
      do{
        (yield* inkey({get v(){return command},set v($x){command=$x}}));
        com_val.v=$ord(command);
        switch(com_val.v){
          case 0:case 3:case 25:case 26:case 27:{
            test_flag=true;
            reset_flag=true;
            break;
          }
          case 42:{
            clear(2,1);
            (yield* inven_command("?",i1,i2));
            redraw.v=true;
            break;
          }
          default:{
            com_val.v=(com_val.v-96);
            if(((((com_val.v>=i1))&&((com_val.v<=i2))))){
              test_flag=true;
              $ret=true;
            }
          }
        }
      }while(!((test_flag)));
      erase_line(msg_line,msg_line);
    }else{
      (yield* msg_print("You are not carrying anything."));
    }
    return $ret;
  }
  /* I may have written the town level code, but I'm not exactly */
  /* proud of it.  Adding the stores required some real slucky */
  /* hooks which I have not had time to re-think.          -RAK- */
  /* Comments vary...					-RAK- */
  /* Comment one : Finished haggling */
  function* prt_comment1(){
    msg_flag=false;
    switch(randint(14)){
      case 1:{
        (yield* msg_print("Done!"));
        break;
      }
      case 2:{
        (yield* msg_print("Accepted!"));
        break;
      }
      case 3:{
        (yield* msg_print("Fine..."));
        break;
      }
      case 4:{
        (yield* msg_print("Agreed!"));
        break;
      }
      case 5:{
        (yield* msg_print("Ok..."));
        break;
      }
      case 6:{
        (yield* msg_print("Taken!"));
        break;
      }
      case 7:{
        (yield* msg_print("You drive a hard bargin, but taken..."));
        break;
      }
      case 8:{
        (yield* msg_print("You'll force me bankrupt, but it's a deal..."));
        break;
      }
      case 9:{
        (yield* msg_print("Sigh...  I'll take it..."));
        break;
      }
      case 10:{
        (yield* msg_print("My poor sick children may starve, but done!"));
        break;
      }
      case 11:{
        (yield* msg_print("Finally!  I accept..."));
        break;
      }
      case 12:{
        (yield* msg_print("Robbed again..."));
        break;
      }
      case 13:{
        (yield* msg_print("A pleasure to do business with you!"));
        break;
      }
      case 14:{
        (yield* msg_print("My spouse shall skin me, but accepted."));
        break;
      }
    }
  }
  /* %A1 is offer, %A2 is asking... */
  function* prt_comment2(offer,asking,final){
    var comment="";
    if(((final>0))){
      switch(randint(3)){
        case 1:{
          comment=$cap("%A2 is my final offer; take it or leave it...",80);
          break;
        }
        case 2:{
          comment=$cap("I'll give you no more than %A2.",80);
          break;
        }
        case 3:{
          comment=$cap("My patience grows thin...  %A2 is final.",80);
          break;
        }
      }
    }else{
      switch(randint(16)){
        case 1:{
          comment=$cap("%A1 for such a fine item?  HA!  No less than %A2.",80);
          break;
        }
        case 2:{
          comment=$cap("%A1 is an insult!  Try %A2 gold pieces...",80);
          break;
        }
        case 3:{
          comment=$cap("%A1???  Thou would rob my poor starving children?",80);
          break;
        }
        case 4:{
          comment=$cap("Why I'll take no less than %A2 gold pieces.",80);
          break;
        }
        case 5:{
          comment=$cap("Ha!  No less than %A2 gold pieces.",80);
          break;
        }
        case 6:{
          comment=$cap("Thou blackheart!  No less than %A2 gold pieces.",80);
          break;
        }
        case 7:{
          comment=$cap("%A1 is far too little, how about %A2?",80);
          break;
        }
        case 8:{
          comment=$cap("I paid more than %A1 for it myself, try %A2.",80);
          break;
        }
        case 9:{
          comment=$cap("%A1?  Are you mad???  How about %A2 gold pieces?",80);
          break;
        }
        case 10:{
          comment=$cap("As scrap this would bring %A1.  Try %A2 in gold.",80);
          break;
        }
        case 11:{
          comment=$cap("May fleas of a 1000 orcs molest you.  I want %A2.",80);
          break;
        }
        case 12:{
          comment=$cap("My mother you can get for %A1, this costs %A2.",80);
          break;
        }
        case 13:{
          comment=$cap("May your chickens grow lips.  I want %A2 in gold!",80);
          break;
        }
        case 14:{
          comment=$cap("Sell this for such a pittance.  Give me %A2 gold.",80);
          break;
        }
        case 15:{
          comment=$cap("May the Balrog find you tasty!  %A2 gold pieces?",80);
          break;
        }
        case 16:{
          comment=$cap("Your mother was a Troll!  %A2 or I'll tell...",80);
          break;
        }
      }
    }
    insert_num({get v(){return comment},set v($x){comment=$x}},"%A1",offer,false);
    insert_num({get v(){return comment},set v($x){comment=$x}},"%A2",asking,false);
    (yield* msg_print(comment));
  }
  function* prt_comment3(offer,asking,final){
    var comment="";
    if(((final>0))){
      switch(randint(3)){
        case 1:{
          comment=$cap("I'll pay no more than %A1; take it or leave it.",80);
          break;
        }
        case 2:{
          comment=$cap("You'll get no more than %A1 from me...",80);
          break;
        }
        case 3:{
          comment=$cap("%A1 and that's final.",80);
          break;
        }
      }
    }else{
      switch(randint(15)){
        case 1:{
          comment=$cap("%A2 for that piece of junk?  No more than %A1",80);
          break;
        }
        case 2:{
          comment=$cap("For %A2 I could own ten of those.  Try %A1.",80);
          break;
        }
        case 3:{
          comment=$cap("%A2?  NEVER!  %A1 is more like it...",80);
          break;
        }
        case 4:{
          comment=$cap("Let's be resonable... How about %A1 gold pieces?",80);
          break;
        }
        case 5:{
          comment=$cap("%A1 gold for that junk, no more...",80);
          break;
        }
        case 6:{
          comment=$cap("%A1 gold pieces and be thankful for it!",80);
          break;
        }
        case 7:{
          comment=$cap("%A1 gold pieces and not a copper more...",80);
          break;
        }
        case 8:{
          comment=$cap("%A2 gold?  HA!  %A1 is more like it...",80);
          break;
        }
        case 9:{
          comment=$cap("Try about %A1 gold...",80);
          break;
        }
        case 10:{
          comment=$cap("I wouldn't pay %A2 for your children, try %A1.",80);
          break;
        }
        case 11:{
          comment=$cap("*CHOKE* For that!?  Let's say %A1.",80);
          break;
        }
        case 12:{
          comment=$cap("How about %A1.",80);
          break;
        }
        case 13:{
          comment=$cap("That looks war surplus!  Say %A1 gold.",80);
          break;
        }
        case 14:{
          comment=$cap("I'll buy it as scrap for %A1.",80);
          break;
        }
        case 15:{
          comment=$cap("%A2 is too much, let us say %A1 gold.",80);
          break;
        }
      }
    }
    insert_num({get v(){return comment},set v($x){comment=$x}},"%A1",offer,false);
    insert_num({get v(){return comment},set v($x){comment=$x}},"%A2",asking,false);
    (yield* msg_print(comment));
  }
  /* Kick 'da bum out...					-RAK- */
  function* prt_comment4(){
    msg_flag=false;
    switch(randint(5)){
      case 1:{
        (yield* msg_print("ENOUGH!  Thou hath abused me once too often!"));
        (yield* msg_print("Out of my place!"));
        (yield* msg_print(" "));
        break;
      }
      case 2:{
        (yield* msg_print("THAT DOES IT!  You shall waste my time no more!"));
        (yield* msg_print("out... Out... OUT!!!"));
        (yield* msg_print(" "));
        break;
      }
      case 3:{
        (yield* msg_print("This is getting no where...  I'm going home!"));
        (yield* msg_print("Come back tomorrow..."));
        (yield* msg_print(" "));
        break;
      }
      case 4:{
        (yield* msg_print("BAH!  No more shall you insult me!"));
        (yield* msg_print("Leave my place...  Begone!"));
        (yield* msg_print(" "));
        break;
      }
      case 5:{
        (yield* msg_print("Begone!  I have had enough abuse for one day."));
        (yield* msg_print("Come back when thou art richer..."));
        (yield* msg_print(" "));
        break;
      }
    }
    msg_flag=false;
  }
  function* prt_comment5(){
    switch(randint(10)){
      case 1:{
        (yield* msg_print("You will have to do better than that!"));
        break;
      }
      case 2:{
        (yield* msg_print("That's an insult!"));
        break;
      }
      case 3:{
        (yield* msg_print("Do you wish to do business or not?"));
        break;
      }
      case 4:{
        (yield* msg_print("Hah!  Try again..."));
        break;
      }
      case 5:{
        (yield* msg_print("Ridiculus!"));
        break;
      }
      case 6:{
        (yield* msg_print("You've got to be kidding!"));
        break;
      }
      case 7:{
        (yield* msg_print("You better be kidding!!"));
        break;
      }
      case 8:{
        (yield* msg_print("You try my patience."));
        break;
      }
      case 9:{
        (yield* msg_print("I don't hear you."));
        break;
      }
      case 10:{
        (yield* msg_print("Hmmm, nice weather we're having..."));
        break;
      }
    }
  }
  function* prt_comment6(){
    switch(randint(5)){
      case 1:{
        (yield* msg_print("I must of heard you wrong..."));
        break;
      }
      case 2:{
        (yield* msg_print("What was that?"));
        break;
      }
      case 3:{
        (yield* msg_print("I'm sorry, say that again..."));
        break;
      }
      case 4:{
        (yield* msg_print("What did you say?"));
        break;
      }
      case 5:{
        (yield* msg_print("Sorry, what was that again?"));
        break;
      }
    }
  }
  /* Displays the set of commands				-RAK- */
  function display_commands(){
    prt("You may:",21,1);
    prt(" p) Purchase an item.           b) Browse store's inventory.",22,1);
    prt(" s) Sell an item.               i) Inventory and Equipment Lists.",23,1);
    prt("^Z) Exit from Building.        ^R) Redraw the screen.",24,1);
  }
  /* Displays the set of commands				-RAK- */
  function haggle_commands(typ){
    if(((typ===(-1)))){
      prt("Specify an asking-price in gold pieces.",22,1);
    }else{
      prt("Specify an offer in gold pieces.",22,1);
    }
    prt("^Z) Quit Haggeling.",23,1);
    prt("",24,1);
  }
  /* Displays a store's inventory				-RAK- */
  function display_inventory(store_num,start){
    var i1=0;
    var i2=0;
    var stop=0;
    var out_val1="";
    var out_val2="";
    var $w426=store[store_num];
    i1=($mod(((start-1)),12));
    stop=(((($idiv(((start-1)),12))+1))*12);
    if(((stop>$w426.store_ctr))){
      stop=$w426.store_ctr;
    }
    while(((start<=stop))){
      $assign(inventory[inven_max],$w426.store_inven[start].sitem);
      var $w427=inventory[inven_max];
      if((((($w427.subval>255))&&(($w427.subval<512))))){
        $w427.number=1;
      }
      objdes({get v(){return out_val1},set v($x){out_val1=$x}},inven_max,true);
      out_val2=$cap($ws($chr((97+i1)),0)+$ws(") ",0)+$ws(out_val1,0),80);
      prt(out_val2,(i1+6),1);
      if((($w426.store_inven[start].scost<0))){
        i2=Math.abs($w426.store_inven[start].scost);
        i2=(i2+Math.trunc(Math.fround(i2*chr_adj())));
        out_val2=$cap($wi(i2,6),80);
      }else{
        out_val2=$cap($wi($w426.store_inven[start].scost,6)+$ws(" [Fixed]",0),80);
      }
      prt(out_val2,(i1+6),60);
      i1=(i1+1);
      start=(start+1);
    }
    if(((i1<12))){
      for(var $e428=(((12-i1)+1)),$ie428=1;$ie428<=$e428;$ie428++){
        i2=$ie428;
        prt("",((i2+i1)+5),1);
      }
    }
  }
  /* Re-displays only a single cost			-RAK- */
  function display_cost(store_num,pos){
    var i1=0;
    var out_val="";
    var $w429=store[store_num];
    i1=($mod(((pos-1)),12));
    if((($w429.store_inven[pos].scost<0))){
      i2=Math.abs($w429.store_inven[pos].scost);
      i2=(i2+Math.trunc(Math.fround(i2*chr_adj())));
      out_val=$cap($wi(i2,6),80);
    }else{
      out_val=$cap($wi($w429.store_inven[pos].scost,6)+$ws(" [Fixed]",0),80);
    }
    prt(out_val,(i1+6),60);
  }
  /* Displays players gold					-RAK- */
  function store_prt_gold(){
    var out_val="";
    out_val=$cap($ws("Gold Remaining : ",0)+$wi(py.misc.au,1),80);
    prt(out_val,19,18);
  }
  /* Displays store					-RAK- */
  function display_store(store_num,cur_top){
    var $w430=store[store_num];
    clear(1,1);
    prt(owners[$w430.owner].owner_name,4,10);
    prt("   Item",5,1);
    prt("Asking Price",5,61);
    store_prt_gold();
    display_commands();
    display_inventory(store_num,cur_top);
  }
  /* Get the ID of a store item and return it's value	-RAK- */
  function* get_store_item(com_val,pmt,i1,i2){
    var $ret=false;
    var command='\0';
    var out_val="";
    var flag=false;
    com_val.v=0;
    flag=true;
    out_val=$cap($ws("(Items ",0)+$ws($chr((i1+96)),0)+$ws("-",0)+$ws($chr((i2+96)),0)+$ws(", ^Z to exit) ",0)+$ws(pmt,0),80);
    while(((((((com_val.v<i1))||((com_val.v>i2))))&&(flag)))){
      prt(out_val,1,1);
      (yield* inkey({get v(){return command},set v($x){command=$x}}));
      com_val.v=$ord(command);
      switch(com_val.v){
        case 3:case 25:case 26:case 27:{
          flag=false;
          break;
        }
        default:{
          com_val.v=(com_val.v-96);
        }
      }
    }
    msg_flag=false;
    erase_line(msg_line,msg_line);
    $ret=flag;
    return $ret;
  }
  /* Increase the insult counter and get pissed if too many -RAK- */
  function* increase_insults(store_num){
    var $ret=false;
    $ret=false;
    var $w432=store[store_num];
    $w432.insult_cur=($w432.insult_cur+1);
    if((($w432.insult_cur>owners[$w432.owner].insult_max))){
      (yield* prt_comment4());
      $w432.insult_cur=0;
      $w432.store_open=((turn+2500)+randint(2500));
      $ret=true;
    }
    return $ret;
  }
  /* Decrease insults					-RAK- */
  function decrease_insults(store_num){
    var $w433=store[store_num];
    $w433.insult_cur=($w433.insult_cur-2);
    if((($w433.insult_cur<0))){
      $w433.insult_cur=0;
    }
  }
  /* Have insulted while haggling				-RAK- */
  function* haggle_insults(store_num){
    var $ret=false;
    $ret=false;
    if(((yield* increase_insults(store_num)))){
      $ret=true;
    }else{
      (yield* prt_comment5());
    }
    return $ret;
  }
  function* recieve_offer(store_num,comment,new_offer,last_offer,factor){
    var $ret=0;
    var flag=false;
    function* get_haggle(comment,num){
      var $ret=false;
      var i1=0;
      var clen=0;
      var out_val="";
      var flag=false;
      flag=true;
      i1=0;
      clen=(comment.length+1);
      do{
        (yield* msg_print(comment));
        msg_flag=false;
        if((!((yield* get_string({get v(){return out_val},set v($x){out_val=$x}},1,clen,40))))){
          flag=false;
          erase_line(msg_line,msg_line);
        }
        (($rv=$readvs(out_val,["int"],true)),i1=$rv[0]);
      }while(!(((((i1!==0))||!(flag)))));
      if((flag)){
        num.v=i1;
      }
      $ret=flag;
      return $ret;
    }
    $ret=0;
    flag=false;
    do{
      if(((yield* get_haggle(comment,new_offer)))){
        if((((new_offer.v*factor)>=(last_offer*factor)))){
          flag=true;
        }else if(((yield* haggle_insults(store_num)))){
          $ret=2;
          flag=true;
        }
      }else{
        $ret=1;
        flag=true;
      }
    }while(!((flag)));
    return $ret;
  }
  /* Haggling routine					-RAK- */
  function* purchase_haggle(store_num,price,item){
    var $ret=0;
    var max_sell=0;
    var min_sell=0;
    var max_buy=0;
    var cost=0;
    var cur_ask=0;
    var final_ask=0;
    var min_offer=0;
    var last_offer=0;
    var new_offer=0;
    var final_flag=0;
    var x3=0;
    var x1=0;
    var x2=0;
    var min_per=0;
    var max_per=0;
    var flag=false;
    var loop_flag=false;
    var out_val="";
    var comment="";
    flag=false;
    $ret=0;
    price.v=0;
    final_flag=0;
    msg_flag=false;
    var $w434=store[store_num];
    var $w435=owners[$w434.owner];
    cost=sell_price(store_num,{get v(){return max_sell},set v($x){max_sell=$x}},{get v(){return min_sell},set v($x){min_sell=$x}},$clone(item));
    max_sell=(max_sell+Math.trunc(Math.fround(max_sell*chr_adj())));
    if(((max_sell<0))){
      max_sell=1;
    }
    min_sell=(min_sell+Math.trunc(Math.fround(min_sell*chr_adj())));
    if(((min_sell<0))){
      min_sell=1;
    }
    max_buy=Math.trunc(Math.fround(cost*(Math.fround(1-$w435.max_inflate))));
    min_per=Math.fround($w435.haggle_per);
    max_per=Math.fround(Math.fround(min_per*Math.fround(3.0)));
    haggle_commands(1);
    cur_ask=max_sell;
    final_ask=min_sell;
    min_offer=max_buy;
    last_offer=min_offer;
    comment=$cap("Asking : ",80);
    do{
      do{
        loop_flag=true;
        out_val=$cap($ws(comment,0)+$wi(cur_ask,1),80);
        put_buffer(out_val,2,1);
        switch((yield* recieve_offer(store_num,"What do you offer? ",{get v(){return new_offer},set v($x){new_offer=$x}},last_offer,1))){
          case 1:{
            $ret=1;
            flag=true;
            break;
          }
          case 2:{
            $ret=2;
            flag=true;
            break;
          }
          default:{
            if(((new_offer>cur_ask))){
              (yield* prt_comment6());
              loop_flag=false;
            }else if(((new_offer===cur_ask))){
              flag=true;
              price.v=new_offer;
            }
          }
        }
      }while(!((((flag)||(loop_flag)))));
      if((!(flag))){
        x1=Math.fround(Math.fround($rdiv(((new_offer-last_offer)),((cur_ask-last_offer)))));
        if(((x1<min_per))){
          flag=(yield* haggle_insults(store_num));
          if((flag)){
            $ret=2;
          }
        }else{
          if(((x1>max_per))){
            x1=Math.fround(Math.fround(x1*Math.fround(0.75)));
            if(((x1<max_per))){
              x1=Math.fround(max_per);
            }
          }
          x2=Math.fround((Math.fround(x1+Math.fround($rdiv(((randint(5)-3)),Math.fround(100.0))))));
          x3=(Math.trunc(Math.fround(((cur_ask-new_offer))*x2))+1);
          cur_ask=(cur_ask-x3);
          if(((cur_ask<final_ask))){
            cur_ask=final_ask;
            comment=$cap("Final Offer : ",80);
            final_flag=(final_flag+1);
            if(((final_flag>3))){
              if(((yield* increase_insults(store_num)))){
                $ret=2;
              }else{
                $ret=1;
              }
              flag=true;
            }
          }else if(((new_offer>=cur_ask))){
            flag=true;
            price.v=new_offer;
          }
          if((!(flag))){
            last_offer=new_offer;
            prt("",2,1);
            out_val=$cap($ws("Your last offer : ",0)+$wi(last_offer,1),80);
            put_buffer(out_val,2,40);
            (yield* prt_comment2(last_offer,cur_ask,final_flag));
          }
        }
      }
    }while(!((flag)));
    prt("",2,1);
    display_commands();
    return $ret;
  }
  /* Haggling routine					-RAK- */
  function* sell_haggle(store_num,price,item){
    var $ret=0;
    var max_sell=0;
    var max_buy=0;
    var min_buy=0;
    var cost=0;
    var cur_ask=0;
    var final_ask=0;
    var min_offer=0;
    var last_offer=0;
    var new_offer=0;
    var final_flag=0;
    var x3=0;
    var max_gold=0;
    var x1=0;
    var x2=0;
    var min_per=0;
    var max_per=0;
    var flag=false;
    var loop_flag=false;
    var comment="";
    var out_val="";
    flag=false;
    $ret=0;
    price.v=0;
    final_flag=0;
    msg_flag=false;
    var $w437=store[store_num];
    cost=item_value($clone(item));
    if(((cost<1))){
      $ret=3;
      flag=true;
    }else{
      var $w438=owners[$w437.owner];
      cost=((cost-Math.trunc(Math.fround(cost*chr_adj())))-Math.trunc(Math.fround(cost*rgold_adj[$w438.owner_race][py.misc.prace])));
      if(((cost<1))){
        cost=1;
      }
      max_sell=Math.trunc(Math.fround(cost*(Math.fround(1+$w438.max_inflate))));
      max_buy=Math.trunc(Math.fround(cost*(Math.fround(1-$w438.max_inflate))));
      min_buy=Math.trunc(Math.fround(cost*(Math.fround(1-$w438.min_inflate))));
      if(((min_buy<max_buy))){
        min_buy=max_buy;
      }
      min_per=Math.fround($w438.haggle_per);
      max_per=Math.fround(Math.fround(min_per*Math.fround(3.0)));
      max_gold=$w438.max_cost;
    }
    if((!(flag))){
      haggle_commands((-1));
      if(((max_buy>max_gold))){
        final_flag=1;
        comment=$cap("Final offer : ",80);
        cur_ask=max_gold;
        final_ask=max_gold;
        (yield* msg_print("I am sorry, but I have not the money to afford such a fine item."));
        (yield* msg_print(" "));
      }else{
        cur_ask=max_buy;
        final_ask=min_buy;
        if(((final_ask>max_gold))){
          final_ask=max_gold;
        }
        comment=$cap("Offer : ",80);
      }
      min_offer=max_sell;
      last_offer=min_offer;
      if(((cur_ask<1))){
        cur_ask=1;
      }
      do{
        do{
          loop_flag=true;
          out_val=$cap($ws(comment,0)+$wi(cur_ask,1),80);
          put_buffer(out_val,2,1);
          switch((yield* recieve_offer(store_num,"What price do you ask? ",{get v(){return new_offer},set v($x){new_offer=$x}},last_offer,(-1)))){
            case 1:{
              $ret=1;
              flag=true;
              break;
            }
            case 2:{
              $ret=2;
              flag=true;
              break;
            }
            default:{
              if(((new_offer<cur_ask))){
                (yield* prt_comment6());
                loop_flag=false;
              }else if(((new_offer===cur_ask))){
                flag=true;
                price.v=new_offer;
              }
            }
          }
        }while(!((((flag)||(loop_flag)))));
        if((!(flag))){
          msg_flag=false;
          x1=Math.fround(Math.fround($rdiv(((last_offer-new_offer)),((last_offer-cur_ask)))));
          if(((x1<min_per))){
            flag=(yield* haggle_insults(store_num));
            if((flag)){
              $ret=2;
            }
          }else{
            if(((x1>max_per))){
              x1=Math.fround(Math.fround(x1*Math.fround(0.75)));
              if(((x1<max_per))){
                x1=Math.fround(max_per);
              }
            }
            x2=Math.fround((Math.fround(x1+Math.fround($rdiv(((randint(5)-3)),Math.fround(100.0))))));
            x3=(Math.trunc(Math.fround(((new_offer-cur_ask))*x2))+1);
            cur_ask=(cur_ask+x3);
            if(((cur_ask>final_ask))){
              cur_ask=final_ask;
              comment=$cap("Final Offer : ",80);
              final_flag=(final_flag+1);
              if(((final_flag>3))){
                if(((yield* increase_insults(store_num)))){
                  $ret=2;
                }else{
                  $ret=1;
                }
                flag=true;
              }
            }else if(((new_offer<=cur_ask))){
              flag=true;
              price.v=new_offer;
            }
            if((!(flag))){
              last_offer=new_offer;
              prt("",2,1);
              out_val=$cap($ws("Your last bid   : ",0)+$wi(last_offer,1),80);
              put_buffer(out_val,2,40);
              (yield* prt_comment3(cur_ask,last_offer,final_flag));
            }
          }
        }
      }while(!((flag)));
      prt("",2,1);
      display_commands();
    }
    return $ret;
  }
  /* Buy an item from a store				-RAK- */
  function* store_purchase(store_num,cur_top){
    var $ret=false;
    var i1=0;
    var item_val=0;
    var price=0;
    var item_new=0;
    var choice=0;
    var save_number=0;
    var out_val="";
    $ret=false;
    var $w440=store[store_num];
    /* i1 = number of objects shown on screen */
    if(((cur_top.v===13))){
      i1=($w440.store_ctr-12);
    }else if((($w440.store_ctr>12))){
      i1=12;
    }else{
      i1=$w440.store_ctr;
    }
    if((($w440.store_ctr<1))){
      (yield* msg_print("I am currently out of stock."));
    /* Get the item number to be bought */
    }else if(((yield* get_store_item({get v(){return item_val},set v($x){item_val=$x}},"Which item are you interested in? ",1,i1)))){
      item_val=((item_val+cur_top.v)-1);
      /* true item_val */
      $assign(inventory[inven_max],$w440.store_inven[item_val].sitem);
      var $w441=inventory[inven_max];
      if((((($w441.subval>255))&&(($w441.subval<512))))){
        save_number=$w441.number;
        $w441.number=1;
      }else{
        save_number=1;
      }
      if((inven_check_weight())){
        if((inven_check_num())){
          if((($w440.store_inven[item_val].scost>0))){
            price=$w440.store_inven[item_val].scost;
            choice=0;
          }else{
            choice=(yield* purchase_haggle(store_num,{get v(){return price},set v($x){price=$x}},$clone(inventory[inven_max])));
          }
          switch(choice){
            case 0:{
              if(((py.misc.au>=price))){
                (yield* prt_comment1());
                decrease_insults(store_num);
                py.misc.au=(py.misc.au-price);
                store_destroy(store_num,item_val,true);
                inven_carry({get v(){return item_new},set v($x){item_new=$x}});
                objdes({get v(){return out_val},set v($x){out_val=$x}},item_new,true);
                out_val=$cap((((("You have "+out_val)+" (")+$chr((item_new+96)))+")"),80);
                (yield* msg_print(out_val));
                if(((cur_top.v>$w440.store_ctr))){
                  cur_top.v=1;
                  display_inventory(store_num,cur_top.v);
                }else{
                  var $w442=$w440.store_inven[item_val];
                  if(((save_number>1))){
                    if((($w442.scost<0))){
                      $w442.scost=price;
                      display_cost(store_num,item_val);
                    }
                  }else{
                    display_inventory(store_num,item_val);
                  }
                }
                store_prt_gold();
              }else{
                if(((yield* increase_insults(store_num)))){
                  $ret=true;
                }else{
                  (yield* prt_comment1());
                  (yield* msg_print("Liar!  You have not the gold!"));
                }
              }
              break;
            }
            case 2:{
              $ret=true;
              break;
            }
            default:{
            }
          }
          prt("",2,1);
        }else{
          prt("You cannot carry that many different items.",1,1);
        }
      }else{
        prt("You can not carry that much weight.",1,1);
      }
    }
    return $ret;
  }
  /* Sell an item to the store				-RAK- */
  function* store_sell(store_num,cur_top){
    var $ret=false;
    var item_val=0;
    var i1=0;
    var item_pos=0;
    var price=0;
    var redraw=false;
    var out_val="";
    $ret=false;
    var $w444=store[store_num];
    redraw=false;
    if(((yield* get_item({get v(){return item_val},set v($x){item_val=$x}},"Which one? ",{get v(){return redraw},set v($x){redraw=$x}},1,inven_ctr)))){
      if((redraw)){
        display_store(store_num,cur_top);
      }
      $assign(inventory[inven_max],inventory[item_val]);
      var $w445=inventory[inven_max];
      if((((($w445.subval>255))&&(($w445.subval<512))))){
        $w445.number=1;
      }
      objdes({get v(){return out_val},set v($x){out_val=$x}},inven_max,true);
      out_val=$cap((((("Selling "+out_val)+" (")+$chr((item_val+96)))+")"),80);
      (yield* msg_print(out_val));
      (yield* msg_print(" "));
      if(($in(inventory[inven_max].tval,store_buy[store_num]))){
        if((store_check_num(store_num))){
          switch((yield* sell_haggle(store_num,{get v(){return price},set v($x){price=$x}},$clone(inventory[inven_max])))){
            case 0:{
              (yield* prt_comment1());
              py.misc.au=(py.misc.au+price);
              inven_destroy(item_val);
              store_carry(store_num,{get v(){return item_pos},set v($x){item_pos=$x}});
              if(((item_pos>0))){
                if(((item_pos<13))){
                  if(((cur_top<13))){
                    display_inventory(store_num,item_pos);
                  }else{
                    display_inventory(store_num,cur_top);
                  }
                }else if(((cur_top>12))){
                  display_inventory(store_num,item_pos);
                }
              }
              store_prt_gold();
              break;
            }
            case 2:{
              $ret=true;
              break;
            }
            case 3:{
              (yield* msg_print("How dare you!"));
              (yield* msg_print("I will not buy that!"));
              $ret=(yield* increase_insults(store_num));
              break;
            }
            default:{
            }
          }
        }else{
          prt("I have not the room in my store to keep it...",1,1);
        }
      }else{
        prt("I do not buy such items.",1,1);
      }
    }else if((redraw)){
      display_store(store_num,cur_top);
    }
    return $ret;
  }
  /* Entering a store					-RAK- */
  function* enter_store(store_num){
    var com_val=0;
    var cur_top=0;
    var command='\0';
    var exit_flag=false;
    var $w447=store[store_num];
    if((($w447.store_open<turn))){
      exit_flag=false;
      cur_top=1;
      display_store(store_num,cur_top);
      do{
        if(((yield* get_com("",{get v(){return command},set v($x){command=$x}})))){
          msg_flag=false;
          com_val=$ord(command);
          switch(com_val){
            case 18:{
              display_store(store_num,cur_top);
              break;
            }
            case 98:{
              if(((cur_top===1))){
                if((($w447.store_ctr>12))){
                  cur_top=13;
                  display_inventory(store_num,cur_top);
                }else{
                  prt("Entire inventory is shown.",1,1);
                }
              }else{
                cur_top=1;
                display_inventory(store_num,cur_top);
              }
              break;
            }
            case 101:{
              /* Equipment List */
              if(((yield* inven_command("e",0,0)))){
                display_store(store_num,cur_top);
              }
              break;
            }
            case 105:{
              /* Inventory */
              if(((yield* inven_command("i",0,0)))){
                display_store(store_num,cur_top);
              }
              break;
            }
            case 116:{
              /* Take off */
              if(((yield* inven_command("t",0,0)))){
                display_store(store_num,cur_top);
              }
              break;
            }
            case 119:{
              /* Wear */
              if(((yield* inven_command("w",0,0)))){
                display_store(store_num,cur_top);
              }
              break;
            }
            case 120:{
              /* Switch weapon */
              if(((yield* inven_command("x",0,0)))){
                display_store(store_num,cur_top);
              }
              break;
            }
            case 112:{
              exit_flag=(yield* store_purchase(store_num,{get v(){return cur_top},set v($x){cur_top=$x}}));
              break;
            }
            case 115:{
              exit_flag=(yield* store_sell(store_num,cur_top));
              break;
            }
            default:{
              prt("Invalid Command.",1,1);
            }
          }
        }else{
          exit_flag=true;
        }
      }while(!((exit_flag)));
      draw_cave();
    }else{
      (yield* msg_print("The doors are locked."));
    }
  }
  /* Calculates current boundries				-RAK- */
  function panel_bounds(){
    panel_row_min=((Math.trunc(Math.fround(panel_row*(Math.fround($rdiv(screen_height,2)))))+1));
    panel_row_max=((panel_row_min+screen_height)-1);
    panel_row_prt=(panel_row_min-2);
    panel_col_min=((Math.trunc(Math.fround(panel_col*(Math.fround($rdiv(screen_width,2)))))+1));
    panel_col_max=((panel_col_min+screen_width)-1);
    panel_col_prt=(panel_col_min-15);
  }
  /* Given an row (y) and col (x), this routine detects  -RAK- */
  /* when a move off the screen has occurred and figures new borders */
  function get_panel(y,x){
    var $ret=false;
    var prow=0;
    var pcol=0;
    prow=panel_row;
    pcol=panel_col;
    if(((((y<(panel_row_min+2)))||((y>(panel_row_max-2)))))){
      prow=Math.trunc(Math.fround($rdiv(((y-2)),(Math.fround($rdiv(screen_height,2))))));
      if(((prow>max_panel_rows))){
        prow=max_panel_rows;
      }
    }
    if(((((x<(panel_col_min+3)))||((x>(panel_col_max-3)))))){
      pcol=Math.trunc(Math.fround($rdiv(((x-3)),(Math.fround($rdiv(screen_width,2))))));
      if(((pcol>max_panel_cols))){
        pcol=max_panel_cols;
      }
    }
    if((((((prow!==panel_row))||((pcol!==panel_col)))||!(cave_flag)))){
      panel_row=prow;
      panel_col=pcol;
      panel_bounds();
      $ret=true;
      cave_flag=true;
    }else{
      $ret=false;
    }
    return $ret;
  }
  /* Tests a given point to see if it is within the screen -RAK- */
  /* boundries. */
  function panel_contains(y,x){
    var $ret=false;
    if(((((y>=panel_row_min))&&((y<=panel_row_max))))){
      if(((((x>=panel_col_min))&&((x<=panel_col_max))))){
        $ret=true;
      }else{
        $ret=false;
      }
    }else{
      $ret=false;
    }
    return $ret;
  }
  /* Returns true if player has no light			-RAK- */
  function no_light(){
    var $ret=false;
    $ret=false;
    var $w449=cave[char_row][char_col];
    if((!($w449.tl))){
      if((!($w449.pl))){
        $ret=true;
      }
    }
    return $ret;
  }
  /* Prompts for a direction				-RAK- */
  function* get_dir(prompt,dir,com_val,y,x){
    var $ret=false;
    var temp_prompt="";
    var flag=false;
    var command='\0';
    flag=false;
    temp_prompt=$cap(("(1 2 3 4 6 7 8 9) "+prompt),80);
    prompt=$cap("",80);
    do{
      if(((yield* get_com(prompt,{get v(){return command},set v($x){command=$x}})))){
        com_val.v=$ord(command);
        dir.v=(com_val.v-48);
        /* Note that '5' is not a valid direction */
        if(($in(dir.v,$S29))){
          move(dir.v,y,x);
          flag=true;
          $ret=true;
        }else{
          prompt=$cap(temp_prompt,80);
        }
      }else{
        reset_flag=true;
        $ret=false;
        flag=true;
      }
    }while(!((flag)));
    return $ret;
  }
  /* Moves creature record from one space to another	-RAK- */
  function move_rec(y1,x1,y2,x2){
    if(((((y1!==y2))||((x1!==x2))))){
      cave[y2][x2].cptr=cave[y1][x1].cptr;
      cave[y1][x1].cptr=0;
    }
  }
  /* Room is lit, make it appear				-RAK- */
  function light_room(y,x){
    var tmp1=0;
    var tmp2=0;
    var start_row=0;
    var start_col=0;
    var end_row=0;
    var end_col=0;
    var i1=0;
    var i2=0;
    var ypos=0;
    var xpos=0;
    var floor_str="";
    var tmp_char='\0';
    function find_light(y1,x1,y2,x2){
      var i1=0;
      var i2=0;
      var i3=0;
      var i4=0;
      for(var $e450=y2,$ie450=y1;$ie450<=$e450;$ie450++){
        i1=$ie450;
        for(var $e451=x2,$ie451=x1;$ie451<=$e451;$ie451++){
          i2=$ie451;
          if(($in(cave[i1][i2].fval,$S27))){
            for(var $e452=(i1+1),$ie452=(i1-1);$ie452<=$e452;$ie452++){
              i3=$ie452;
              for(var $e453=(i2+1),$ie453=(i2-1);$ie453<=$e453;$ie453++){
                i4=$ie453;
                cave[i3][i4].pl=true;
              }
            }
            cave[i1][i2].fval=((2)&15);
          }
        }
      }
    }
    tmp1=Math.trunc(Math.fround($rdiv(screen_height,2)));
    tmp2=Math.trunc(Math.fround($rdiv(screen_width,2)));
    start_row=((Math.trunc(Math.fround($rdiv(y,tmp1)))*tmp1)+1);
    start_col=((Math.trunc(Math.fround($rdiv(x,tmp2)))*tmp2)+1);
    end_row=((start_row+tmp1)-1);
    end_col=((start_col+tmp2)-1);
    find_light(start_row,start_col,end_row,end_col);
    for(var $e454=end_row,$ie454=start_row;$ie454<=$e454;$ie454++){
      i1=$ie454;
      floor_str=$cap("",80);
      ypos=i1;
      for(var $e455=end_col,$ie455=start_col;$ie455<=$e455;$ie455++){
        i2=$ie455;
        var $w456=cave[i1][i2];
        if(((($w456.pl)||($w456.fm)))){
          if(((floor_str.length===0))){
            xpos=i2;
          }
          loc_symbol(i1,i2,{get v(){return tmp_char},set v($x){tmp_char=$x}});
          floor_str=$cap((floor_str+tmp_char),80);
        }else if(((floor_str.length>0))){
          print(floor_str,ypos,xpos);
          floor_str=$cap("",80);
        }
      }
      if(((floor_str.length>0))){
        print(floor_str,ypos,xpos);
      }
    }
  }
  /* Lights up given location				-RAK- */
  function lite_spot(y,x){
    var spot_char="";
    var temp='\0';
    if((panel_contains(y,x))){
      loc_symbol(y,x,{get v(){return temp},set v($x){temp=$x}});
      spot_char=$cap(temp,80);
      print(spot_char,y,x);
    }
  }
  /* Blanks out given location				-RAK- */
  function unlite_spot(y,x){
    if((panel_contains(y,x))){
      print(" ",y,x);
    }
  }
  /* Package for moving the character's light about the screen */
  /* Three cases : Normal, Finding, and Blind              -RAK- */
  /* Maximum of a minimum				-RAK- */
  /* Macro routine included in MORIALIB.MLB        -RAK- */
  function move_light(y1,x1,y2,x2){
    /* Minimum of a maximum				-RAK- */
    /* Macro routine included in MORIALIB.MLB        -RAK- */
    /* Given two sets of points, draw the block */
    function draw_block(y1,x1,y2,x2){
      var i1=0;
      var i2=0;
      var xpos=0;
      var topp=0;
      var bott=0;
      var left=0;
      var righ=0;
      var new_topp=0;
      var new_bott=0;
      var new_left=0;
      var new_righ=0;
      var floor_str="";
      var save_str="";
      var tmp_char='\0';
      var flag=false;
      /* From uppermost to bottom most lines player was on... */
      /* Points are guaranteed to be on the screen (I hope...) */
      topp=maxmin(y1,y2,panel_row_min);
      bott=minmax(y1,y2,panel_row_max);
      left=maxmin(x1,x2,panel_col_min);
      righ=minmax(x1,x2,panel_col_max);
      new_topp=(y2-1);
      /* Margins for new things to appear */
      new_bott=(y2+1);
      new_left=(x2-1);
      new_righ=(x2+1);
      for(var $e457=bott,$ie457=topp;$ie457<=$e457;$ie457++){
        i1=$ie457;
        floor_str=$cap("",80);
        /* Null out print string */
        xpos=0;
        save_str=$cap("",80);
        for(var $e458=righ,$ie458=left;$ie458<=$e458;$ie458++){
          i2=$ie458;
          /* Leftmost to rightmost do */
          var $w459=cave[i1][i2];
          if(((($w459.pl)||($w459.fm)))){
            if(((((((i1===y1))&&((i2===x1))))||((((i1===y2))&&((i2===x2))))))){
              flag=true;
            }else{
              flag=false;
            }
          }else{
            flag=true;
            if(((((((i1>=new_topp))&&((i1<=new_bott))))&&((((i2>=new_left))&&((i2<=new_righ))))))){
              if(($w459.tl)){
                if(($in($w459.fval,pwall_set))){
                  $w459.pl=true;
                }else if((($w459.tptr>0))){
                  if(($in(t_list[$w459.tptr].tval,light_set))){
                    if((!($w459.fm))){
                      $w459.fm=true;
                    }
                  }
                }
              }
            }
          }
          if((((($w459.pl)||($w459.tl))||($w459.fm)))){
            loc_symbol(i1,i2,{get v(){return tmp_char},set v($x){tmp_char=$x}});
          }else{
            tmp_char=" ";
          }
          if(((py.flags.image>0))){
            if(((randint(12)===1))){
              tmp_char=$chr((randint(95)+31));
            }
          }
          if((flag)){
            if(((xpos===0))){
              xpos=i2;
            }
            if(((save_str.length>0))){
              floor_str=$cap((floor_str+save_str),80);
              save_str=$cap("",80);
            }
            floor_str=$cap((floor_str+tmp_char),80);
          }else if(((xpos>0))){
            save_str=$cap((save_str+tmp_char),80);
          }
        }
        if(((xpos>0))){
          i2=i1;
          /* Var for PRINT cannot be loop index */
          print(floor_str,i2,xpos);
        }
      }
    }
    /* Normal movement */
    function sub1_move_light(y1,x1,y2,x2){
      var i1=0;
      var i2=0;
      light_flag=true;
      for(var $e460=(y1+1),$ie460=(y1-1);$ie460<=$e460;$ie460++){
        i1=$ie460;
        /* Turn off lamp light */
        for(var $e461=(x1+1),$ie461=(x1-1);$ie461<=$e461;$ie461++){
          i2=$ie461;
          cave[i1][i2].tl=false;
        }
      }
      for(var $e462=(y2+1),$ie462=(y2-1);$ie462<=$e462;$ie462++){
        i1=$ie462;
        for(var $e463=(x2+1),$ie463=(x2-1);$ie463<=$e463;$ie463++){
          i2=$ie463;
          cave[i1][i2].tl=true;
        }
      }
      draw_block(y1,x1,y2,x2);
    }
    /* Redraw area */
    /* When FIND_FLAG, light only permanent features */
    function sub2_move_light(y1,x1,y2,x2){
      var i1=0;
      var i2=0;
      var xpos=0;
      var floor_str="";
      var save_str="";
      var tmp_char='\0';
      var flag=false;
      if((light_flag)){
        for(var $e464=(y1+1),$ie464=(y1-1);$ie464<=$e464;$ie464++){
          i1=$ie464;
          for(var $e465=(x1+1),$ie465=(x1-1);$ie465<=$e465;$ie465++){
            i2=$ie465;
            cave[i1][i2].tl=false;
          }
        }
        draw_block(y1,x1,y1,x1);
        light_flag=false;
      }
      for(var $e466=(y2+1),$ie466=(y2-1);$ie466<=$e466;$ie466++){
        i1=$ie466;
        floor_str=$cap("",80);
        save_str=$cap("",80);
        xpos=0;
        for(var $e467=(x2+1),$ie467=(x2-1);$ie467<=$e467;$ie467++){
          i2=$ie467;
          var $w468=cave[i1][i2];
          flag=false;
          if((!((($w468.fm)||($w468.pl))))){
            tmp_char=" ";
            if((player_light)){
              if(($in($w468.fval,pwall_set))){
                $w468.pl=true;
                /* Turn on perm light */
                loc_symbol(i1,i2,{get v(){return tmp_char},set v($x){tmp_char=$x}});
                flag=true;
              }else if((($w468.tptr>0))){
                if(($in(t_list[$w468.tptr].tval,light_set))){
                  $w468.fm=true;
                  /* Turn on field marker */
                  loc_symbol(i1,i2,{get v(){return tmp_char},set v($x){tmp_char=$x}});
                  flag=true;
                }
              }
            }
          }else{
            loc_symbol(i1,i2,{get v(){return tmp_char},set v($x){tmp_char=$x}});
          }
          if((flag)){
            if(((xpos===0))){
              xpos=i2;
            }
            if(((save_str.length>0))){
              floor_str=$cap((floor_str+save_str),80);
              save_str=$cap("",80);
            }
            floor_str=$cap((floor_str+tmp_char),80);
          }else if(((xpos>0))){
            save_str=$cap((save_str+tmp_char),80);
          }
        }
        if(((xpos>0))){
          i2=i1;
          print(floor_str,i2,xpos);
        }
      }
    }
    /* When blinded, move only the player symbol... */
    function sub3_move_light(y1,yx1,y2,x2){
      var i1=0;
      var i2=0;
      if((light_flag)){
        for(var $e469=(y1+1),$ie469=(y1-1);$ie469<=$e469;$ie469++){
          i1=$ie469;
          for(var $e470=(x1+1),$ie470=(x1-1);$ie470<=$e470;$ie470++){
            i2=$ie470;
            cave[i1][i2].tl=false;
          }
        }
        light_flag=false;
      }
      print(" ",y1,x1);
      print("@",y2,x2);
    }
    /* With no light, movement becomes involved... */
    function sub4_move_light(y1,x1,y2,x2){
      var i1=0;
      var i2=0;
      light_flag=true;
      if((cave[y1][x1].tl)){
        for(var $e471=(y1+1),$ie471=(y1-1);$ie471<=$e471;$ie471++){
          i1=$ie471;
          for(var $e472=(x1+1),$ie472=(x1-1);$ie472<=$e472;$ie472++){
            i2=$ie472;
            cave[i1][i2].tl=false;
            if((test_light(i1,i2))){
              lite_spot(i1,i2);
            }else{
              unlite_spot(i1,i2);
            }
          }
        }
      }else if((test_light(y1,x1))){
        lite_spot(y1,x1);
      }else{
        unlite_spot(y1,x1);
      }
      print("@",y2,x2);
    }
    /* Begin move_light procedure */
    if(((py.flags.blind>0))){
      sub3_move_light(y1,x1,y2,x2);
    }else if((find_flag)){
      sub2_move_light(y1,x1,y2,x2);
    }else if((!(player_light))){
      sub4_move_light(y1,x1,y2,x2);
    }else{
      sub1_move_light(y1,x1,y2,x2);
    }
  }
  /* Returns random co-ordinates				-RAK- */
  function new_spot(y,x){
    do{
      y.v=randint(cur_height);
      x.v=randint(cur_width);
    }while(!(((((cave[y.v][x.v].fopen)&&((cave[y.v][x.v].cptr===0)))&&((cave[y.v][x.v].tptr===0))))));
  }
  /* Search Mode enhancement				-RAK- */
  function search_on(){
    search_flag=true;
    change_speed(1);
    py.flags.status=((py.flags.status|256)>>>0);
    prt_search();
    var $w473=py.flags;
    $w473.food_digested=($w473.food_digested+1);
  }
  function* search_off(){
    search_flag=false;
    find_flag=false;
    (yield* move_char(5));
    change_speed((-1));
    py.flags.status=((py.flags.status&4294967039)>>>0);
    prt_search();
    var $w474=py.flags;
    $w474.food_digested=($w474.food_digested-1);
  }
  /* Resting allows a player to safely restore his hp	-RAK- */
  function* rest(){
    var rest_num=0;
    var rest_str="";
    prt("Rest for how long? ",1,1);
    (yield* get_string({get v(){return rest_str},set v($x){rest_str=$x}},1,20,10));
    rest_num=0;
    (($rv=$readvs(rest_str,["int"],true)),rest_num=$rv[0]);
    if(((rest_num>0))){
      if((search_flag)){
        (yield* search_off());
      }
      py.flags.rest=rest_num;
      py.flags.status=((py.flags.status|512)>>>0);
      prt_rest();
      var $w475=py.flags;
      $w475.food_digested=($w475.food_digested-1);
      (yield* msg_print("Press any key to wake up..."));
      put_qio();
    }else{
      erase_line(msg_line,msg_line);
    }
  }
  function rest_off(){
    py.flags.rest=0;
    py.flags.status=((py.flags.status&4294966783)>>>0);
    erase_line(1,1);
    prt_rest();
    var $w476=py.flags;
    $w476.food_digested=($w476.food_digested+1);
  }
  /* Attacker's level and pluses, defender's AC		-RAK- */
  function* test_hit(bth,level,pth,ac){
    var $ret=false;
    var i1=0;
    if((search_flag)){
      (yield* search_off());
    }
    if(((py.flags.rest>0))){
      rest_off();
    }
    i1=((bth+(level*bth_lev_adj))+(pth*bth_plus_adj));
    if(((randint(i1)>ac))){
      /* Normal hit */
      $ret=true;
    }else if(((randint(20)===1))){
      /* Always hit 1/20 */
      $ret=true;
    }else{
      /* Missed */
      $ret=false;
    }
    return $ret;
  }
  /* Decreases players hit points and sets death flag if neccessary */
  /* -RAK- */
  function* take_hit(damage,hit_from){
    if(((py.flags.invuln>0))){
      damage=0;
    }
    py.misc.chp=Math.fround(Math.fround(py.misc.chp-damage));
    if((search_flag)){
      (yield* search_off());
    }
    if(((py.flags.rest>0))){
      rest_off();
    }
    flush();
    if(((py.misc.chp<=(-1)))){
      if((!(death))){
        /* Hee, hee... Ain't I mean? */
        death=true;
        died_from=$cap(hit_from,80);
        total_winner=false;
      }
      moria_flag=true;
    }else{
      prt_chp();
    }
  }
  /* Given speed, returns number of moves this turn.	-RAK- */
  /* NOTE: Player must always move at least once per iteration, */
  /* a slowed player is handled by moving monsters faster */
  function movement_rate(speed){
    var $ret=0;
    if(((speed>0))){
      if(((py.flags.rest>0))){
        $ret=1;
      }else{
        $ret=speed;
      }
    }else{
      if(((($mod(turn,((Math.abs(speed)+2))))===0))){
        $ret=1;
      }else{
        $ret=0;
      }
    }
    return $ret;
  }
  /* Regenerate hit points 				-RAK- */
  function regenhp(percent){
    var $w477=py.misc;
    $w477.chp=Math.fround(Math.fround(Math.fround($w477.chp+Math.fround($w477.mhp*percent))+player_S_regen_hpbase));
  }
  /* Regenerate mana points				-RAK- */
  function regenmana(percent){
    var $w478=py.misc;
    $w478.cmana=Math.fround(Math.fround(Math.fround($w478.cmana+Math.fround($w478.mana*percent))+player_S_regen_mnbase));
  }
  /* Change a trap from invisible to visible		-RAK- */
  /* Note: Secret doors are handled here */
  function change_trap(y,x){
    var i3=0;
    var $w479=cave[y][x];
    if(($in(t_list[$w479.tptr].tval,$S30))){
      i3=$w479.tptr;
      place_trap(y,x,2,t_list[i3].subval);
      pusht(i3);
      lite_spot(y,x);
    }
  }
  /* Searches for hidden things... 			-RAK- */
  function* search(y,x,chance){
    var i1=0;
    var i2=0;
    var $w480=py.flags;
    if(((($w480.confused+$w480.blind)>0))){
      chance=Math.trunc(Math.fround($rdiv(chance,Math.fround(10.0))));
    }else if((no_light())){
      chance=Math.trunc(Math.fround($rdiv(chance,Math.fround(5.0))));
    }
    for(var $e481=((y+1)),$ie481=((y-1));$ie481<=$e481;$ie481++){
      i1=$ie481;
      for(var $e482=((x+1)),$ie482=((x-1));$ie482<=$e482;$ie482++){
        i2=$ie482;
        if((in_bounds(i1,i2))){
          if(((((i1!==y))||((i2!==x))))){
            if(((randint(100)<chance))){
              var $w483=cave[i1][i2];
              /* Search for hidden objects */
              if((($w483.tptr>0))){
                var $w484=t_list[$w483.tptr];
                /* Trap on floor? */
                if((($w484.tval===101))){
                  (yield* msg_print((("You have found "+$w484.name_)+".")));
                  change_trap(i1,i2);
                  find_flag=false;
                /* Secret door? */
                }else if((($w484.tval===109))){
                  (yield* msg_print("You have found a secret door."));
                  $w483.fval=((corr_floor2.ftval)&15);
                  change_trap(i1,i2);
                  find_flag=false;
                /* Chest is trapped? */
                }else if((($w484.tval===2))){
                  if((($w484.flags>1))){
                    if((($index($w484.name_,"^")>0))){
                      known2($rf($w484,"name_"));
                      (yield* msg_print("You have discovered a trap on the chest!"));
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  /* Turns off Find_flag if something interesting appears	-RAK- */
  /* BUG: Does not handle corridor/room corners, but I didn't want */
  /* to add a lot of checking for such a minor detail */
  function area_affect(dir,y,x){
    var z=$zeros(3);
    var i1=0;
    var row=0;
    var col=0;
    if(((cave[y][x].fval===4))){
      i1=0;
      if(((next_to4(y,x,$S26)>2))){
        find_flag=false;
      }
    }
    if((((find_flag)&&((py.flags.blind<1))))){
      switch(dir){
        case 1:{
          z[1]=4;
          z[2]=1;
          z[3]=3;
          break;
        }
        case 2:{
          z[1]=4;
          z[2]=2;
          z[3]=6;
          break;
        }
        case 3:{
          z[1]=2;
          z[2]=3;
          z[3]=6;
          break;
        }
        case 4:{
          z[1]=8;
          z[2]=4;
          z[3]=2;
          break;
        }
        case 6:{
          z[1]=2;
          z[2]=6;
          z[3]=8;
          break;
        }
        case 7:{
          z[1]=8;
          z[2]=7;
          z[3]=4;
          break;
        }
        case 8:{
          z[1]=4;
          z[2]=8;
          z[3]=6;
          break;
        }
        case 9:{
          z[1]=8;
          z[2]=9;
          z[3]=6;
          break;
        }
      }
      for(var $e486=3,$ie486=1;$ie486<=$e486;$ie486++){
        i1=$ie486;
        row=y;
        col=x;
        if((move(z[i1],{get v(){return row},set v($x){row=$x}},{get v(){return col},set v($x){col=$x}}))){
          var $w487=cave[row][col];
          /* Empty doorways */
          if((($w487.fval===5))){
            find_flag=false;
          }
          /* Objects player can see */
          /* Including doors */
          if((find_flag)){
            if((player_light)){
              if((($w487.tptr>0))){
                if((!($in(t_list[$w487.tptr].tval,$S30)))){
                  find_flag=false;
                }
              }
            }else if((((($w487.tl)||($w487.pl))||($w487.fm)))){
              if((($w487.tptr>0))){
                if((!($in(t_list[$w487.tptr].tval,$S30)))){
                  find_flag=false;
                }
              }
            }
          }
          /* Creatures */
          if((find_flag)){
            if((((($w487.tl)||($w487.pl))||(player_light)))){
              if((($w487.cptr>1))){
                var $w488=m_list[$w487.cptr];
                if(($w488.ml)){
                  find_flag=false;
                }
              }
            }
          }
        }
      }
    }
  }
  /* Picks new direction when in find mode 		-RAK- */
  function pick_dir(dir){
    var $ret=false;
    var z=$zeros(2);
    var i1=0;
    var y=0;
    var x=0;
    if((((find_flag)&&((next_to4(char_row,char_col,corr_set)===2))))){
      switch(dir){
        case 1:{
          z[1]=2;
          z[2]=4;
          break;
        }
        case 2:{
          z[1]=4;
          z[2]=6;
          break;
        }
        case 3:{
          z[1]=2;
          z[2]=6;
          break;
        }
        case 4:{
          z[1]=2;
          z[2]=8;
          break;
        }
        case 6:{
          z[1]=2;
          z[2]=8;
          break;
        }
        case 7:{
          z[1]=4;
          z[2]=8;
          break;
        }
        case 8:{
          z[1]=4;
          z[2]=6;
          break;
        }
        case 9:{
          z[1]=6;
          z[2]=8;
          break;
        }
      }
      $ret=false;
      for(var $e490=2,$ie490=1;$ie490<=$e490;$ie490++){
        i1=$ie490;
        y=char_row;
        x=char_col;
        if((move(z[i1],{get v(){return y},set v($x){y=$x}},{get v(){return x},set v($x){x=$x}}))){
          if((cave[y][x].fopen)){
            $ret=true;
            com_val=(z[i1]+48);
          }
        }
      }
    }else{
      $ret=false;
    }
    return $ret;
  }
  /* AC gets worse 					-RAK- */
  /* Note: This routine affects magical AC bonuse so that stores */
  /* can detect the damage. */
  function* minus_ac(typ_dam){
    var $ret=false;
    var i1=0;
    var i2=0;
    var tmp=$zeros(5);
    i1=0;
    if(((inventory[26].tval>0))){
      i1=(i1+1);
      tmp[i1]=26;
    }
    if(((inventory[27].tval>0))){
      i1=(i1+1);
      tmp[i1]=27;
    }
    if(((inventory[32].tval>0))){
      i1=(i1+1);
      tmp[i1]=32;
    }
    if(((inventory[28].tval>0))){
      i1=(i1+1);
      tmp[i1]=28;
    }
    if(((inventory[24].tval>0))){
      i1=(i1+1);
      tmp[i1]=24;
    }
    $ret=false;
    if(((i1>0))){
      i2=tmp[randint(i1)];
      var $w491=inventory[i2];
      if((((($w491.flags&typ_dam)>>>0)!==0))){
        objdes({get v(){return out_val},set v($x){out_val=$x}},i2,false);
        (yield* msg_print((("Your "+out_val)+" resists damage!")));
        $ret=true;
      }else if((((($w491.ac+$w491.toac))>0))){
        objdes({get v(){return out_val},set v($x){out_val=$x}},i2,false);
        (yield* msg_print((("Your "+out_val)+" is damaged!")));
        $w491.toac=($w491.toac-1);
        py_bonuses($clone(blank_treasure),0);
        $ret=true;
      }
    }
    return $ret;
  }
  /* Corrode the unsuspecting person's armor               -RAK- */
  function* corrode_gas(kb_str){
    if((!((yield* minus_ac(1048576))))){
      (yield* take_hit(randint(8),kb_str));
    }
    print_stat=((64|print_stat)>>>0);
    if(((inven_damage($S31,5)>0))){
      (yield* msg_print("There is an acrid smell coming from your pack."));
    }
  }
  /* Poison gas the idiot...				-RAK- */
  function* poison_gas(dam,kb_str){
    (yield* take_hit(dam,kb_str));
    print_stat=((64|print_stat)>>>0);
    py.flags.poisoned=((py.flags.poisoned+12)+randint(dam));
  }
  /* Burn the fool up...					-RAK- */
  function* fire_dam(dam,kb_str){
    if((py.flags.fire_resist)){
      dam=$idiv(dam,3);
    }
    if(((py.flags.resist_heat>0))){
      dam=$idiv(dam,3);
    }
    (yield* take_hit(dam,kb_str));
    print_stat=((128|print_stat)>>>0);
    if(((inven_damage($S32,3)>0))){
      (yield* msg_print("There is smoke coming from your pack!"));
    }
  }
  /* Freeze him to death...				-RAK- */
  function* cold_dam(dam,kb_str){
    if((py.flags.cold_resist)){
      dam=$idiv(dam,3);
    }
    if(((py.flags.resist_cold>0))){
      dam=$idiv(dam,3);
    }
    (yield* take_hit(dam,kb_str));
    print_stat=((128|print_stat)>>>0);
    if(((inven_damage($S33,5)>0))){
      (yield* msg_print("Something shatters inside your pack!"));
    }
  }
  /* Lightning bolt the sucker away...			-RAK- */
  function* light_dam(dam,kb_str){
    if((py.flags.lght_resist)){
      (yield* take_hit(($idiv(dam,3)),kb_str));
    }else{
      (yield* take_hit(dam,kb_str));
    }
    print_stat=((128|print_stat)>>>0);
  }
  /* Throw acid on the hapless victim			-RAK- */
  function* acid_dam(dam,kb_str){
    var flag=0;
    flag=0;
    if(((yield* minus_ac(1048576)))){
      flag=1;
    }
    if((py.flags.acid_resist)){
      flag=(flag+2);
    }
    switch(flag){
      case 0:{
        (yield* take_hit(dam,kb_str));
        break;
      }
      case 1:{
        (yield* take_hit(($idiv(dam,2)),kb_str));
        break;
      }
      case 2:{
        (yield* take_hit(($idiv(dam,3)),kb_str));
        break;
      }
      case 3:{
        (yield* take_hit(($idiv(dam,4)),kb_str));
        break;
      }
    }
    print_stat=((192|print_stat)>>>0);
    if(((inven_damage($S34,3)>0))){
      (yield* msg_print("There is an acrid smell coming from your pack!"));
    }
  }
  /* Teleport the player to a new location 		-RAK- */
  function* teleport(dis){
    var y=0;
    var x=0;
    do{
      y=randint(cur_height);
      x=randint(cur_width);
      while(((distance(y,x,char_row,char_col)>dis))){
        y=(y+Math.trunc(Math.fround($rdiv(((char_row-y)),2))));
        x=(x+Math.trunc(Math.fround($rdiv(((char_col-x)),2))));
      }
    }while(!((((cave[y][x].fopen)&&((cave[y][x].cptr<2))))));
    move_rec(char_row,char_col,y,x);
    for(var $e493=(char_row+1),$ie493=(char_row-1);$ie493<=$e493;$ie493++){
      i1=$ie493;
      for(var $e494=(char_col+1),$ie494=(char_col-1);$ie494<=$e494;$ie494++){
        i2=$ie494;
        var $w495=cave[i1][i2];
        $w495.tl=false;
        if((!(test_light(i1,i2)))){
          unlite_spot(i1,i2);
        }
      }
    }
    if((test_light(char_row,char_col))){
      lite_spot(char_row,char_col);
    }
    char_row=y;
    char_col=x;
    (yield* move_char(5));
    (yield* creatures(false));
    teleport_flag=false;
  }
  /* Player hit a trap...	(Chuckle)			-RAK- */
  function* hit_trap(y,x){
    var i1=0;
    var i2=0;
    var ty=0;
    var tx=0;
    var dam=0;
    change_trap(y.v,x.v);
    lite_spot(char_row,char_col);
    find_flag=false;
    var $w496=cave[y.v][x.v];
    var $w497=py.misc;
    dam=damroll(t_list[$w496.tptr].damage);
    switch(t_list[$w496.tptr].subval){
      case 1:{
        /* Open pit */
        (yield* msg_print("You fell into a pit!"));
        if((py.flags.ffall)){
          (yield* msg_print("You gently float down."));
        }else{
          (yield* take_hit(dam,"an open pit."));
        }
        break;
      }
      case 2:{
        /* Arrow trap */
        if(((yield* test_hit(125,0,0,($w497.pac+$w497.ptoac))))){
          (yield* take_hit(dam,"an arrow trap."));
          (yield* msg_print("An arrow hits you."));
        }else{
          (yield* msg_print("An arrow barely misses you."));
        }
        break;
      }
      case 3:{
        /* Covered pit */
        (yield* msg_print("You fell into a covered pit."));
        if((py.flags.ffall)){
          (yield* msg_print("You gently float down."));
        }else{
          (yield* take_hit(dam,"a covered pit."));
        }
        place_trap(y.v,x.v,2,1);
        break;
      }
      case 4:{
        /* Trap door */
        (yield* msg_print("You fell through a trap door!"));
        (yield* msg_print(" "));
        moria_flag=true;
        dun_level=(dun_level+1);
        if((py.flags.ffall)){
          (yield* msg_print("You gently float down."));
        }else{
          (yield* take_hit(dam,"a trap door."));
        }
        break;
      }
      case 5:{
        if(((py.flags.paralysis===0))){
          /* Sleep gas */
          (yield* msg_print("A strange white mist surrounds you!"));
          if((py.flags.free_act)){
            (yield* msg_print("You are unaffected."));
          }else{
            (yield* msg_print("You fall asleep."));
            py.flags.paralysis=((py.flags.paralysis+randint(10))+4);
          }
        }
        break;
      }
      case 6:{
        /* Hid Obj */
        $w496.fm=false;
        pusht($w496.tptr);
        place_object(y.v,x.v);
        (yield* msg_print("Hmmm, there was something under this rock."));
        break;
      }
      case 7:{
        /* STR Dart */
        if(((yield* test_hit(125,0,0,($w497.pac+$w497.ptoac))))){
          if((!py.flags.sustain_str)){
            py.stat.cstr=de_statp(py.stat.cstr);
            (yield* take_hit(dam,"a dart trap."));
            print_stat=((1|print_stat)>>>0);
            (yield* msg_print("A small dart weakens you!"));
          }else{
            (yield* msg_print("A small dart hits you."));
          }
        }else{
          (yield* msg_print("A small dart barely misses you."));
        }
        break;
      }
      case 8:{
        /* Teleport */
        teleport_flag=true;
        (yield* msg_print("You hit a teleport trap!"));
        break;
      }
      case 9:{
        /* Rockfall */
        (yield* take_hit(dam,"falling rock."));
        pusht($w496.tptr);
        place_rubble(y.v,x.v);
        (yield* msg_print("You are hit by falling rock"));
        break;
      }
      case 10:{
        /* Corrode gas */
        (yield* corrode_gas("corrosion gas."));
        (yield* msg_print("A strange red gas surrounds you."));
        break;
      }
      case 11:{
        /* Summon mon */
        $w496.fm=false;
        /* Rune disappears... */
        pusht($w496.tptr);
        $w496.tptr=0;
        for(var $e498=((2+randint(3))),$ie498=1;$ie498<=$e498;$ie498++){
          i1=$ie498;
          ty=char_row;
          tx=char_col;
          summon_monster({get v(){return ty},set v($x){ty=$x}},{get v(){return tx},set v($x){tx=$x}},false);
        }
        break;
      }
      case 12:{
        /* Fire trap */
        (yield* fire_dam(dam,"a fire trap."));
        (yield* msg_print("You are enveloped in flames!"));
        break;
      }
      case 13:{
        /* Acid trap */
        (yield* acid_dam(dam,"an acid trap."));
        (yield* msg_print("You are splashed with acid!"));
        break;
      }
      case 14:{
        /* Poison gas */
        (yield* poison_gas(dam,"a poison gas trap."));
        (yield* msg_print("A pungent green gas surrounds you!"));
        break;
      }
      case 15:{
        /* Blind Gas */
        (yield* msg_print("A black gas surrounds you!"));
        var $w499=py.flags;
        $w499.blind=(($w499.blind+randint(50))+50);
        break;
      }
      case 16:{
        var $w500=py.flags;
        /* Confuse Gas */
        (yield* msg_print("A gas of scintillating colors surrounds you!"));
        $w500.confused=(($w500.confused+randint(15))+15);
        break;
      }
      case 17:{
        /* Slow Dart */
        if(((yield* test_hit(125,0,0,($w497.pac+$w497.ptoac))))){
          (yield* take_hit(dam,"a dart trap."));
          (yield* msg_print("A small dart hits you!"));
          var $w501=py.flags;
          $w501.slow=(($w501.slow+randint(20))+10);
        }else{
          (yield* msg_print("A small dart barely misses you."));
        }
        break;
      }
      case 18:{
        /* CON Dart */
        if(((yield* test_hit(125,0,0,($w497.pac+$w497.ptoac))))){
          if((!py.flags.sustain_con)){
            py.stat.ccon=de_statp(py.stat.ccon);
            (yield* take_hit(dam,"a dart trap."));
            print_stat=((4|print_stat)>>>0);
            (yield* msg_print("A small dart weakens you!"));
          }else{
            (yield* msg_print("A small dart hits you."));
          }
        }else{
          (yield* msg_print("A small dart barely misses you."));
        }
        break;
      }
      case 19:{
        break;
      }
      case 99:{
        break;
      }
      case 101:{
        /* Secret Door */
        /* Scare Mon */
        /* Town level traps are special, the stores... */
        (yield* enter_store(1));
        break;
      }
      case 102:{
        /* General */
        (yield* enter_store(2));
        break;
      }
      case 103:{
        /* Armory */
        (yield* enter_store(3));
        break;
      }
      case 104:{
        /* Weaponsmith */
        (yield* enter_store(4));
        break;
      }
      case 105:{
        /* Temple */
        (yield* enter_store(5));
        break;
      }
      case 106:{
        /* Alchemy */
        (yield* enter_store(6));
        break;
      }
      default:{
        /* Magic-User */
        (yield* msg_print("Unknown trap value"));
      }
    }
  }
  /* Return spell number and failure chance		-RAK- */
  function* cast_spell(prompt,item_val,sn,sc,redraw){
    var $ret=false;
    var i2=0;
    var i1=0;
    var i3=0;
    var spell=$arr(1,22,()=>({splnum:0,splchn:0}));
    i1=0;
    i2=inventory[item_val].flags;
    do{
      i3=bit_pos({get v(){return i2},set v($x){i2=$x}});
      if(((i3>0))){
        var $w503=magic_spell[py.misc.pclass][i3];
        if((($w503.slevel<=py.misc.lev))){
          if(($w503.learned)){
            i1=(i1+1);
            spell[i1].splnum=i3;
          }
        }
      }
    }while(!(((i2===0))));
    if(((i1>0))){
      $ret=(yield* get_spell($clone(spell),i1,sn,sc,prompt,redraw));
    }
    if((redraw.v)){
      draw_cave();
    }
    return $ret;
  }
  /* Finds range of item in inventory list 		-RAK- */
  function find_range(item_val,i2,i3){
    var $ret=false;
    var i1=0;
    var flag=false;
    i1=0;
    i2.v=0;
    i3.v=0;
    flag=false;
    while(((i1<inven_ctr))){
      i1=(i1+1);
      if(((($in(inventory[i1].tval,item_val))&&(!(flag))))){
        flag=true;
        i2.v=i1;
      }
      if(((((!($in(inventory[i1].tval,item_val)))&&(flag))&&((i3.v===0))))){
        i3.v=(i1-1);
      }
    }
    if((((flag)&&((i3.v===0))))){
      i3.v=inven_ctr;
    }
    $ret=flag;
    return $ret;
  }
  /* Examine a Book					-RAK- */
  function* examine_book(){
    var i2=0;
    var i1=0;
    var i3=0;
    var item_val=0;
    var redraw=false;
    var flag=false;
    var dummy='\0';
    var out_val="";
    redraw=false;
    if((!(find_range($S35,{get v(){return i1},set v($x){i1=$x}},{get v(){return i3},set v($x){i3=$x}})))){
      (yield* msg_print("You are not carrying any books."));
    }else if(((yield* get_item({get v(){return item_val},set v($x){item_val=$x}},"Which Book?",{get v(){return redraw},set v($x){redraw=$x}},i1,i3)))){
      flag=true;
      var $w504=inventory[item_val];
      if((class_[py.misc.pclass].mspell)){
        if((($w504.tval!==90))){
          (yield* msg_print("You do not understand the language."));
          flag=false;
        }
      }else if((class_[py.misc.pclass].pspell)){
        if((($w504.tval!==91))){
          (yield* msg_print("You do not understand the language."));
          flag=false;
        }
      }else{
        (yield* msg_print("You do not understand the language."));
        flag=false;
      }
      if((flag)){
        redraw=true;
        i1=0;
        i2=inventory[item_val].flags;
        clear(1,1);
        out_val=$cap($ws("   Name                         Level  Mana   Known",0),80);
        prt(out_val,1,1);
        do{
          i3=bit_pos({get v(){return i2},set v($x){i2=$x}});
          if(((i3>0))){
            var $w505=magic_spell[py.misc.pclass][i3];
            i1=(i1+1);
            if((($w505.slevel<99))){
              out_val=$cap($ws($chr((96+i1)),0)+$ws(") ",0)+$ws($pad($w505.sname," ",30),0)+$wi($w505.slevel,2)+$ws("     ",0)+$wi($w505.smana,2)+$ws("   ",0)+$wb($w505.learned,0),80);
              prt(out_val,(i1+1),1);
            }else{
              prt("",(i1+1),1);
            }
          }
        }while(!(((i2===0))));
        prt("[Press any key to continue]",24,20);
        (yield* inkey({get v(){return dummy},set v($x){dummy=$x}}));
      }
    }
    if((redraw)){
      draw_cave();
    }
  }
  /* Player is on an object.  Many things can happen BASED -RAK- */
  /* on the TVAL of the object.  Traps are set off, money and most */
  /* objects are picked up.  Some objects, such as open doors, just */
  /* sit there... */
  function* carry(y,x){
    var item_val=0;
    var out_val="";
    find_flag=false;
    var $w506=cave[y][x];
    $assign(inventory[inven_max],t_list[$w506.tptr]);
    /* There's GOLD in them thar hills! */
    if(((t_list[$w506.tptr].tval===100))){
      pusht($w506.tptr);
      $w506.tptr=0;
      var $w507=inventory[inven_max];
      py.misc.au=(py.misc.au+$w507.cost);
      out_val=$cap($ws("You have found ",0)+$wi($w507.cost,1)+$ws(" gold pieces worth of ",0)+$ws($w507.name_,0)+$ws(".",0),80);
      prt_gold();
      (yield* msg_print(out_val));
    /* OPPS! */
    }else if(($in(t_list[$w506.tptr].tval,trap_set))){
      (yield* hit_trap({get v(){return y},set v($x){y=$x}},{get v(){return x},set v($x){x=$x}}));
    /* Attempt to pick up an object. */
    }else if(((t_list[$w506.tptr].tval<100))){
      if((inven_check_weight())){
        /* Weight limit check */
        if((inven_check_num())){
          /* Too many objects? */
          /* Okay, pick it up */
          pusht($w506.tptr);
          $w506.tptr=0;
          inven_carry({get v(){return item_val},set v($x){item_val=$x}});
          objdes({get v(){return out_val},set v($x){out_val=$x}},item_val,true);
          out_val=$cap((((("You have "+out_val)+" (")+$chr((item_val+96)))+cur_char1(item_val)),80);
          (yield* msg_print(out_val));
        }else{
          (yield* msg_print("You can't carry that many items."));
        }
      }else{
        (yield* msg_print("You can't carry that much weight."));
      }
    }
  }
  /* Drop an object being carried				-RAK- */
  /* Note: Only one object per floor spot... */
  function* drop(){
    var com_val=0;
    var i1=0;
    var i2=0;
    var redraw=false;
    var out_val="";
    if(((inven_ctr>0))){
      if(((yield* get_item({get v(){return com_val},set v($x){com_val=$x}},"Which one? ",{get v(){return redraw},set v($x){redraw=$x}},1,inven_ctr)))){
        if((redraw)){
          draw_cave();
        }
        var $w508=cave[char_row][char_col];
        if((($w508.tptr>0))){
          (yield* msg_print("There is something there already."));
        }else{
          inven_drop(com_val,char_row,char_col);
          objdes({get v(){return out_val},set v($x){out_val=$x}},inven_max,true);
          out_val=$cap(("Dropped "+out_val),80);
          (yield* msg_print(out_val));
        }
      }else if((redraw)){
        draw_cave();
      }
    }else{
      (yield* msg_print("You are not carrying anything."));
    }
  }
  /* Deletes a monster entry from the level		-RAK- */
  function delete_monster(i2){
    var i1=0;
    var i3=0;
    i1=muptr;
    i3=m_list[i2].nptr;
    if(((i1===i2))){
      muptr=i3;
    }else{
      while(((m_list[i1].nptr!==i2))){
        i1=m_list[i1].nptr;
      }
      m_list[i1].nptr=i3;
    }
    var $w509=m_list[i2];
    cave[$w509.fy][$w509.fx].cptr=0;
    if(($w509.ml)){
      var $w510=cave[$w509.fy][$w509.fx];
      if(((($w510.pl)||($w510.tl)))){
        lite_spot($w509.fy,$w509.fx);
      }else{
        unlite_spot($w509.fy,$w509.fx);
      }
    }
    pushm(i2);
    mon_tot_mult=(mon_tot_mult-1);
  }
  /* Makes sure new creature gets lit up			-RAK- */
  function check_mon_lite(y,x){
    var $w511=cave[y][x];
    if((($w511.cptr>1))){
      if((!(m_list[$w511.cptr].ml))){
        if(((($w511.tl)||($w511.pl)))){
          if((los(char_row,char_col,y,x))){
            m_list[$w511.cptr].ml=true;
            lite_spot(y,x);
          }
        }
      }
    }
  }
  /* Places creature adjacent to given location		-RAK- */
  /* Rats and Flys are fun! */
  function multiply_monster(y,x,z,slp){
    var i1=0;
    var i2=0;
    var i3=0;
    i1=0;
    do{
      i2=((y-2)+randint(3));
      i3=((x-2)+randint(3));
      if((in_bounds(i2,i3))){
        var $w512=cave[i2][i3];
        if(($in($w512.fval,floor_set))){
          if((((($w512.tptr===0))&&(($w512.cptr!==1))))){
            if((($w512.cptr>1))){
              /* Creature there already? */
              /* Some critters are canabalistic! */
              if(((((c_list[z].cmove&524288)>>>0)!==0))){
                delete_monster($w512.cptr);
                place_monster(i2,i3,z,slp);
                check_mon_lite(i2,i3);
                mon_tot_mult=(mon_tot_mult+1);
              }
            }else{
              /* All clear, place a monster */
              place_monster(i2,i3,z,slp);
              check_mon_lite(i2,i3);
              mon_tot_mult=(mon_tot_mult+1);
            }
            i1=18;
          }
        }
      }
      i1=(i1+1);
    }while(!(((i1>18))));
  }
  /* Creates objects nearby the coordinates given		-RAK- */
  /* BUG: Because of the range, objects can actually be placed into */
  /* areas closed off to the player, this is rarely noticable, */
  /* and never a problem to the game. */
  function summon_object(y,x,num,typ){
    var i1=0;
    var i2=0;
    var i3=0;
    do{
      i1=0;
      do{
        i2=((y-3)+randint(5));
        i3=((x-3)+randint(5));
        if((in_bounds(i2,i3))){
          var $w513=cave[i2][i3];
          if(($in($w513.fval,floor_set))){
            if((($w513.tptr===0))){
              switch(typ){
                case 1:{
                  /* Select type of object */
                  place_object(i2,i3);
                  break;
                }
                case 2:{
                  place_gold(i2,i3);
                  break;
                }
                case 3:{
                  if(((randint(100)<50))){
                    place_object(i2,i3);
                  }else{
                    place_gold(i2,i3);
                  }
                  break;
                }
                default:{
                }
              }
              if((test_light(i2,i3))){
                lite_spot(i2,i3);
              }
              i1=10;
            }
          }
        }
        i1=(i1+1);
      }while(!(((i1>10))));
      num=(num-1);
    }while(!(((num===0))));
  }
  /* Deletes object from given location			-RAK- */
  function delete_object(y,x){
    var $ret=false;
    $ret=false;
    var $w515=cave[y][x];
    if(((t_list[$w515.tptr].tval===109))){
      $w515.fval=((corr_floor3.ftval)&15);
    }
    $w515.fopen=true;
    pusht($w515.tptr);
    $w515.tptr=0;
    $w515.fm=false;
    if((test_light(y,x))){
      lite_spot(y,x);
      $ret=true;
    }else{
      unlite_spot(y,x);
    }
    return $ret;
  }
  /* Allocates objects upon a creatures death		-RAK- */
  /* Oh well, another creature bites the dust...  Reward the victor */
  /* based on flags set in the main creature record */
  function* monster_death(y,x,flags){
    var i1=0;
    if(((((flags&16777216)>>>0)!==0))){
      i1=1;
    }else{
      i1=0;
    }
    if(((((flags&33554432)>>>0)!==0))){
      i1=(i1+2);
    }
    if(((((flags&67108864)>>>0)!==0))){
      if(((randint(100)<60))){
        summon_object(y,x,1,i1);
      }
    }
    if(((((flags&134217728)>>>0)!==0))){
      if(((randint(100)<90))){
        summon_object(y,x,1,i1);
      }
    }
    if(((((flags&268435456)>>>0)!==0))){
      summon_object(y,x,randint(2),i1);
    }
    if(((((flags&536870912)>>>0)!==0))){
      summon_object(y,x,damroll("2d2"),i1);
    }
    if(((((flags&1073741824)>>>0)!==0))){
      summon_object(y,x,damroll("4d3"),i1);
    }
    if(((((flags&2147483648)>>>0)!==0))){
      total_winner=true;
      prt_winner();
      (yield* msg_print("*** CONGRATULATIONS *** You have won the game..."));
      (yield* msg_print("Use <CONTROL>-Y when you are ready to quit."));
    }
  }
  /* Decreases monsters hit points and deletes monster in needed. */
  /* (Picking on my babies...)                             -RAK- */
  function* mon_take_hit(monptr,dam){
    var $ret=0;
    var acc_tmp=0;
    var $w516=m_list[monptr];
    $w516.hp=($w516.hp-dam);
    $w516.csleep=0;
    if((($w516.hp<0))){
      (yield* monster_death($w516.fy,$w516.fx,c_list[$w516.mptr].cmove));
      var $w517=c_list[$w516.mptr];
      var $w518=py.misc;
      acc_tmp=Math.fround(Math.fround($w517.mexp*(Math.fround($rdiv((Math.fround($w517.level+Math.fround(0.1))),$w518.lev)))));
      i1=Math.trunc(acc_tmp);
      acc_exp=Math.fround(Math.fround(acc_exp+(Math.fround(acc_tmp-i1))));
      if(((acc_exp>1))){
        i1=(i1+1);
        acc_exp=Math.fround(Math.fround(acc_exp-Math.fround(1.0)));
      }
      $w518.exp=($w518.exp+i1);
      if(((i1>0))){
        (yield* prt_experience());
      }
      $ret=$w516.mptr;
      delete_monster(monptr);
    }else{
      $ret=0;
    }
    return $ret;
  }
  /* Special damage due to magical abilities of object	-RAK- */
  function tot_dam(item,tdam,monster){
    var $ret=0;
    var $w519=item;
    if(($in($w519.tval,$S36))){
      var $w520=monster;
      /* Slay Dragon */
      if((((((($w520.cdefense&1)>>>0)!==0))&&(((($w519.flags&8192)>>>0)!==0))))){
        tdam=(tdam*4);
      /* Slay Undead */
      }else if((((((($w520.cdefense&8)>>>0)!==0))&&(((($w519.flags&65536)>>>0)!==0))))){
        tdam=(tdam*3);
      /* Slay Monster */
      }else if((((((($w520.cdefense&2)>>>0)!==0))&&(((($w519.flags&16384)>>>0)!==0))))){
        tdam=(tdam*2);
      /* Slay Evil */
      }else if((((((($w520.cdefense&4)>>>0)!==0))&&(((($w519.flags&32768)>>>0)!==0))))){
        tdam=(tdam*2);
      /* Frost */
      }else if((((((($w520.cdefense&16)>>>0)!==0))&&(((($w519.flags&131072)>>>0)!==0))))){
        tdam=Math.trunc(Math.fround(tdam*Math.fround(1.5)));
      /* Fire */
      }else if((((((($w520.cdefense&32)>>>0)!==0))&&(((($w519.flags&262144)>>>0)!==0))))){
        tdam=Math.trunc(Math.fround(tdam*Math.fround(1.5)));
      }
    }
    $ret=tdam;
    return $ret;
  }
  /* Player attacks a (poor, defenseless) creature 	-RAK- */
  function* py_attack(y,x){
    var $ret=false;
    var i1=0;
    var i2=0;
    var i3=0;
    var blows=0;
    var tot_tohit=0;
    var m_name="";
    var out_val="";
    $ret=false;
    i1=cave[y][x].cptr;
    i2=m_list[i1].mptr;
    m_list[i1].csleep=0;
    /* Does the player know what he's fighting? */
    if(((((((65536&c_list[i2].cmove)>>>0)!==0))&&(!(py.flags.see_inv))))){
      m_name=$cap("it",80);
    }else if(((py.flags.blind>0))){
      m_name=$cap("it",80);
    }else if((!(m_list[i1].ml))){
      m_name=$cap("it",80);
    }else{
      m_name=$cap(("the "+c_list[i2].name_),80);
    }
    if(((inventory[23].tval>0))){
      /* Proper weapon */
      blows=attack_blows(inventory[23].weight,{get v(){return tot_tohit},set v($x){tot_tohit=$x}});
    }else{
      /* Bare hands? */
      blows=2;
      tot_tohit=(-3);
    }
    if(($in(inventory[23].tval,$S8))){
      /* Fix for arrows */
      blows=1;
    }
    tot_tohit=(tot_tohit+py.misc.ptohit);
    /* Loop for number of blows, trying to hit the critter... */
    var $w521=py.misc;
    do{
      if(((yield* test_hit($w521.bth,$w521.lev,tot_tohit,c_list[i2].ac)))){
        out_val=$cap($ws("You hit ",0)+$ws(m_name,0)+$ws(".",0),80);
        (yield* msg_print(out_val));
        var $w522=inventory[23];
        if((($w522.tval>0))){
          /* Weapon? */
          i3=damroll($w522.damage);
          i3=tot_dam($clone(inventory[23]),i3,$clone(c_list[i2]));
          i3=(yield* critical_blow($w522.weight,tot_tohit,i3));
        }else{
          /* Bare hands!? */
          i3=damroll(bare_hands);
          i3=(yield* critical_blow(1,0,i3));
        }
        i3=(i3+$w521.ptodam);
        if(((i3<0))){
          i3=0;
        }
        /* See if we done it in... */
        var $w523=m_list[i1];
        if((((yield* mon_take_hit(i1,i3))>0))){
          out_val=$cap($ws("You have slain ",0)+$ws(m_name,0)+$ws(".",0),80);
          (yield* msg_print(out_val));
          blows=0;
          $ret=false;
        }else{
          $ret=true;
        }
        /* If creature hit, but alive... */
        var $w524=inventory[23];
        if(($in($w524.tval,$S8))){
          /* Use missles up */
          $w524.number=($w524.number-1);
          if((($w524.number<=0))){
            inven_weight=(inven_weight-$w524.weight);
            equip_ctr=(equip_ctr-1);
            $assign(inventory[inven_max],inventory[23]);
            $assign(inventory[23],blank_treasure);
            py_bonuses($clone(inventory[inven_max]),(-1));
          }
        }
      }else{
        out_val=$cap($ws("You miss ",0)+$ws(m_name,0)+$ws(".",0),80);
        (yield* msg_print(out_val));
      }
      blows=(blows-1);
    }while(!(((blows<1))));
    return $ret;
  }
  /* Moves player from one space to another...		-RAK- */
  /* Note: This rountine has been pre-declared; see that for argument */
  function* move_char(dir){
    var test_row=0;
    var test_col=0;
    var panrow=0;
    var pancol=0;
    var i1=0;
    var i2=0;
    test_row=char_row;
    test_col=char_col;
    if(((py.flags.confused>0))){
      /* Confused? */
      if(((randint(4)>1))){
        /* 75% random movement */
        if(((dir!==5))){
          /* Never random if sitting */
          dir=randint(9);
          find_flag=false;
        }
      }
    }
    if((move(dir,{get v(){return test_row},set v($x){test_row=$x}},{get v(){return test_col},set v($x){test_col=$x}}))){
      /* Legal move? */
      var $w525=cave[test_row][test_col];
      if((($w525.cptr<2))){
        /* No creature? */
        if(($w525.fopen)){
          /* Open floor spot */
          /* Move character record (-1) */
          move_rec(char_row,char_col,test_row,test_col);
          /* Check for new panel */
          if((get_panel(test_row,test_col))){
            prt_map();
          }
          /* Check to see if he should stop */
          if((find_flag)){
            area_affect(dir,test_row,test_col);
          }
          /* Check to see if he notices something */
          if(((py.flags.blind<1))){
            if(((((randint(py.misc.fos)===1))||(search_flag)))){
              (yield* search(test_row,test_col,py.misc.srh));
            }
          }
          /* An object is beneath him... */
          if((($w525.tptr>0))){
            (yield* carry(test_row,test_col));
          }
          /* Move the light source */
          move_light(char_row,char_col,test_row,test_col);
          /* A room of light should be lit... */
          if((($w525.fval===lopen_floor.ftval))){
            if(((py.flags.blind<1))){
              if((!($w525.pl))){
                light_room(test_row,test_col);
              }
            }
          /* In doorway of light-room? */
          }else if(($in($w525.fval,$S37))){
            if(((py.flags.blind<1))){
              for(var $e526=((test_row+1)),$ie526=((test_row-1));$ie526<=$e526;$ie526++){
                i1=$ie526;
                for(var $e527=((test_col+1)),$ie527=((test_col-1));$ie527<=$e527;$ie527++){
                  i2=$ie527;
                  if((in_bounds(i1,i2))){
                    var $w528=cave[i1][i2];
                    if((($w528.fval===lopen_floor.ftval))){
                      if((!($w528.pl))){
                        light_room(i1,i2);
                      }
                    }
                  }
                }
              }
            }
          }
          /* Make final assignments of char co-ords */
          char_row=test_row;
          char_col=test_col;
        /* Can't move onto floor space */
        /* Try a new direction if in find mode */
        }else if((!(pick_dir(dir)))){
          if((find_flag)){
            find_flag=false;
            (yield* move_char(5));
          }else if((($w525.tptr>0))){
            reset_flag=true;
            if(((t_list[$w525.tptr].tval===103))){
              (yield* msg_print("There is rubble blocking your way."));
            }else if(((t_list[$w525.tptr].tval===105))){
              (yield* msg_print("There is a closed door blocking your way."));
            }
          }else{
            reset_flag=true;
          }
        }
      }else{
        /* Attacking a creature! */
        if((find_flag)){
          find_flag=false;
          move_light(char_row,char_col,char_row,char_col);
        }
        if(((py.flags.afraid<1))){
          /* Coward? */
          (yield* py_attack(test_row,test_col));
        }else{
          /* Coward! */
          (yield* msg_print("You are too afraid!"));
        }
      }
    }
  }
  /* Chests have traps too...				-RAK- */
  /* Note: Chest traps are based on the FLAGS value */
  function* chest_trap(y,x){
    var i1=0;
    var i2=0;
    var i3=0;
    var $w529=t_list[cave[y][x].tptr];
    if(((((16&$w529.flags)>>>0)!==0))){
      (yield* msg_print("A small needle has pricked you!"));
      if((!py.flags.sustain_str)){
        py.stat.cstr=de_statp(py.stat.cstr);
        (yield* take_hit(damroll("1d4"),"a poison needle."));
        print_stat=((1|print_stat)>>>0);
        (yield* msg_print("You feel weakened!"));
      }else{
        (yield* msg_print("You are unaffected."));
      }
    }
    if(((((32&$w529.flags)>>>0)!==0))){
      (yield* msg_print("A small needle has pricked you!"));
      (yield* take_hit(damroll("1d6"),"a poison needle."));
      py.flags.poisoned=((py.flags.poisoned+10)+randint(20));
    }
    if(((((64&$w529.flags)>>>0)!==0))){
      (yield* msg_print("A puff of yellow gas surrounds you!"));
      if((py.flags.free_act)){
        (yield* msg_print("You are unaffected."));
      }else{
        (yield* msg_print("You choke and pass out."));
        py.flags.paralysis=(10+randint(20));
      }
    }
    if(((((128&$w529.flags)>>>0)!==0))){
      (yield* msg_print("There is a sudden explosion!"));
      delete_object(y,x);
      (yield* take_hit(damroll("5d8"),"an exploding chest."));
    }
    if(((((256&$w529.flags)>>>0)!==0))){
      for(var $e530=3,$ie530=1;$ie530<=$e530;$ie530++){
        i1=$ie530;
        i2=y;
        i3=x;
        summon_monster({get v(){return i2},set v($x){i2=$x}},{get v(){return i3},set v($x){i3=$x}},false);
      }
    }
  }
  /* Opens a closed door or closed chest...		-RAK- */
  function* openobject(){
    var y=0;
    var x=0;
    var tmp=0;
    var flag=false;
    y=char_row;
    x=char_col;
    if(((yield* get_dir("Which direction?",{get v(){return tmp},set v($x){tmp=$x}},{get v(){return tmp},set v($x){tmp=$x}},{get v(){return y},set v($x){y=$x}},{get v(){return x},set v($x){x=$x}})))){
      var $w531=cave[y][x];
      if((($w531.tptr>0))){
        /* Closed door */
        if(((t_list[$w531.tptr].tval===105))){
          var $w532=t_list[$w531.tptr];
          if((($w532.p1>0))){
            /* It's locked... */
            var $w533=py.misc;
            tmp=((($w533.disarm+$w533.lev)+(2*todis_adj()))+int_adj());
            if(((py.flags.confused>0))){
              (yield* msg_print("You are too confused to pick the lock."));
            }else if(((((tmp-$w532.p1))>randint(100)))){
              (yield* msg_print("You have picked the lock."));
              py.misc.exp=(py.misc.exp+1);
              (yield* prt_experience());
              $w532.p1=0;
            }else{
              (yield* msg_print("You failed to pick the lock."));
            }
          }else if((($w532.p1<0))){
            /* It's stuck */
            (yield* msg_print("It appears to be stuck."));
          }
          if((($w532.p1===0))){
            $assign(t_list[$w531.tptr],door_list[1]);
            $w531.fopen=true;
            lite_spot(y,x);
          }
        /* Open a closed chest... */
        }else if(((t_list[$w531.tptr].tval===2))){
          var $w534=py.misc;
          tmp=((($w534.disarm+$w534.lev)+(2*todis_adj()))+int_adj());
          var $w535=t_list[$w531.tptr];
          flag=false;
          if(((((1&$w535.flags)>>>0)!==0))){
            if(((py.flags.confused>0))){
              (yield* msg_print("You are too confused to pick the lock."));
            }else if(((((tmp-((2*$w535.level))))>randint(100)))){
              (yield* msg_print("You have picked the lock."));
              flag=true;
              py.misc.exp=(py.misc.exp+$w535.level);
              (yield* prt_experience());
            }else{
              (yield* msg_print("You failed to pick the lock."));
            }
          }else{
            flag=true;
          }
          if((flag)){
            $w535.flags=((4294967294&$w535.flags)>>>0);
            tmp=$index($w535.name_," (");
            if(((tmp>0))){
              $w535.name_=$cap($substr($w535.name_,1,(tmp-1)),68);
            }
            $w535.name_=$cap(($w535.name_+" (Empty)"),68);
            known2($rf($w535,"name_"));
            $w535.cost=0;
          }
          flag=false;
          /* Was chest still trapped?  (Snicker) */
          if(((((1&$w535.flags)>>>0)===0))){
            (yield* chest_trap(y,x));
            if((($w531.tptr>0))){
              flag=true;
            }
          }
          /* Chest treasure is allocted as if a creature */
          /* had been killed... */
          if((flag)){
            (yield* monster_death(y,x,t_list[$w531.tptr].flags));
            t_list[$w531.tptr].flags=0;
          }
        }else{
          (yield* msg_print("I do not see anything you can open there."));
        }
      }else{
        (yield* msg_print("I do not see anything you can open there."));
      }
    }
  }
  /* Closes an open door...				-RAK- */
  function* closeobject(){
    var y=0;
    var x=0;
    var tmp=0;
    y=char_row;
    x=char_col;
    if(((yield* get_dir("Which direction?",{get v(){return tmp},set v($x){tmp=$x}},{get v(){return tmp},set v($x){tmp=$x}},{get v(){return y},set v($x){y=$x}},{get v(){return x},set v($x){x=$x}})))){
      var $w536=cave[y][x];
      if((($w536.tptr>0))){
        if(((t_list[$w536.tptr].tval===104))){
          if((($w536.cptr===0))){
            if(((t_list[$w536.tptr].p1===0))){
              $assign(t_list[$w536.tptr],door_list[2]);
              $w536.fopen=false;
              lite_spot(y,x);
            }else{
              (yield* msg_print("The door appears to be broken."));
            }
          }else{
            (yield* msg_print((("The "+c_list[m_list[$w536.cptr].mptr].name_)+" is in your way!")));
          }
        }else{
          (yield* msg_print("I do not see anything you can close there."));
        }
      }else{
        (yield* msg_print("I do not see anything you can close there."));
      }
    }
  }
  /* Go up one level					-RAK- */
  function* go_up(){
    var $w537=cave[char_row][char_col];
    if((($w537.tptr>0))){
      if(((t_list[$w537.tptr].tval===107))){
        dun_level=(dun_level-1);
        moria_flag=true;
        (yield* msg_print("You enter a maze of up staircases."));
        (yield* msg_print("You pass through a one-way door."));
      }else{
        (yield* msg_print("I see no up staircase here."));
      }
    }else{
      (yield* msg_print("I see no up staircase here."));
    }
  }
  /* Go down one level					-RAK- */
  function* go_down(){
    var $w538=cave[char_row][char_col];
    if((($w538.tptr>0))){
      if(((t_list[$w538.tptr].tval===108))){
        dun_level=(dun_level+1);
        moria_flag=true;
        (yield* msg_print("You enter a maze of down staircases."));
        (yield* msg_print("You pass through a one-way door."));
      }else{
        (yield* msg_print("I see no down staircase here."));
      }
    }else{
      (yield* msg_print("I see no down staircase here."));
    }
  }
  /* Tunneling through real wall: 10,11,12 		-RAK- */
  /* Used by TUNNEL and WALL_TO_MUD */
  function* twall(y,x,t1,t2){
    var $ret=false;
    $ret=false;
    var $w539=cave[y][x];
    if(((t1>t2))){
      if(((next_to4(y,x,$S27)>0))){
        $w539.fval=((corr_floor2.ftval)&15);
        $w539.fopen=corr_floor2.ftopen;
      }else{
        $w539.fval=((corr_floor1.ftval)&15);
        $w539.fopen=corr_floor1.ftopen;
      }
      if((test_light(y,x))){
        if((panel_contains(y,x))){
          if((($w539.tptr>0))){
            (yield* msg_print("You have found something!"));
          }
          lite_spot(y,x);
        }
      }
      $w539.fm=false;
      $w539.pl=false;
      $ret=true;
    }
    return $ret;
  }
  /* Tunnels through rubble and walls			-RAK- */
  /* Must take into account: secret doors, special tools */
  function* tunnel(){
    var y=0;
    var x=0;
    var i1=0;
    var i2=0;
    var tabil=0;
    y=char_row;
    x=char_col;
    if(((yield* get_dir("Which direction?",{get v(){return i1},set v($x){i1=$x}},{get v(){return i1},set v($x){i1=$x}},{get v(){return y},set v($x){y=$x}},{get v(){return x},set v($x){x=$x}})))){
      var $w540=cave[y][x];
      /* Compute the digging ability of player; based on */
      /* strength, and type of tool used */
      tabil=py.stat.cstr;
      if(((inventory[23].tval>0))){
        var $w541=inventory[23];
        if(((((536870912&$w541.flags)>>>0)!==0))){
          tabil=((tabil+25)+($w541.p1*50));
        }
      }
      /* Regular walls; Granite, magma intrusion, quartz vein */
      /* Don't forget the boundry walls, made of titanium (255) */
      switch($w540.fval){
        case 10:{
          i1=(randint(1200)+80);
          if(((yield* twall(y,x,tabil,i1)))){
            (yield* msg_print("You have finished the tunnel."));
          }else{
            (yield* msg_print("You tunnel into the granite wall."));
          }
          break;
        }
        case 11:{
          i1=(randint(600)+10);
          if(((yield* twall(y,x,tabil,i1)))){
            (yield* msg_print("You have finished the tunnel."));
          }else{
            (yield* msg_print("You tunnel into the magma intrusion."));
          }
          break;
        }
        case 12:{
          i1=(randint(400)+10);
          if(((yield* twall(y,x,tabil,i1)))){
            (yield* msg_print("You have finished the tunnel."));
          }else{
            (yield* msg_print("You tunnel into the quartz vein."));
          }
          break;
        }
        case 15:{
          (yield* msg_print("This seems to be permanent rock."));
          break;
        }
        default:{
          /* Is there an object in the way?  (Rubble and secret doors) */
          if((($w540.tptr>0))){
            /* Rubble... */
            if(((t_list[$w540.tptr].tval===103))){
              if(((tabil>randint(180)))){
                pusht($w540.tptr);
                $w540.tptr=0;
                $w540.fm=false;
                $w540.fopen=true;
                (yield* msg_print("You have removed the rubble."));
                if(((randint(10)===1))){
                  place_object(y,x);
                  if((test_light(y,x))){
                    (yield* msg_print("You have found something!"));
                  }
                }
                lite_spot(y,x);
              }else{
                (yield* msg_print("You dig in the rubble..."));
              }
            /* Secret doors... */
            }else if(((t_list[$w540.tptr].tval===109))){
              (yield* msg_print("You tunnel into the granite wall."));
              (yield* search(char_row,char_col,py.misc.srh));
            }else{
              (yield* msg_print("You can't tunnel through that."));
            }
          }else{
            (yield* msg_print("Tunnel through what?  Empty air???"));
          }
        }
      }
    }
  }
  /* Disarms a trap					-RAK- */
  function* disarm_trap(){
    var y=0;
    var x=0;
    var i1=0;
    var tdir=0;
    var tot=0;
    var t1=0;
    var t2=0;
    var t3=0;
    var t4=0;
    var t5=0;
    y=char_row;
    x=char_col;
    if(((yield* get_dir("Which direction?",{get v(){return tdir},set v($x){tdir=$x}},{get v(){return i1},set v($x){i1=$x}},{get v(){return y},set v($x){y=$x}},{get v(){return x},set v($x){x=$x}})))){
      var $w543=cave[y][x];
      if((($w543.tptr>0))){
        t1=py.misc.disarm;
        /* Ability to disarm */
        t2=py.misc.lev;
        /* Level adjustment */
        t3=(2*todis_adj());
        /* Dexterity adjustment */
        t4=int_adj();
        /* Intelligence adjustment */
        tot=(((t1+t2)+t3)+t4);
        if(((py.flags.blind>0))){
          tot=Math.trunc(Math.fround($rdiv(tot,Math.fround(5.0))));
        }else if((no_light())){
          tot=Math.trunc(Math.fround($rdiv(tot,Math.fround(2.0))));
        }
        if(((py.flags.confused>0))){
          tot=Math.trunc(Math.fround($rdiv(tot,Math.fround(3.0))));
        }
        i1=t_list[$w543.tptr].tval;
        t5=t_list[$w543.tptr].level;
        if(((i1===102))){
          /* Floor trap */
          var $w544=t_list[$w543.tptr];
          if(((((tot-t5))>randint(100)))){
            (yield* msg_print("You have disarmed the trap."));
            py.misc.exp=(py.misc.exp+$w544.p1);
            $w543.fm=false;
            pusht($w543.tptr);
            $w543.tptr=0;
            (yield* move_char(tdir));
            lite_spot(y,x);
            (yield* prt_experience());
          }else if(((randint(tot)>5))){
            (yield* msg_print("You failed to disarm the trap."));
          }else{
            (yield* msg_print("You set the trap off!"));
            (yield* move_char(tdir));
          }
        }else if(((i1===2))){
          /* Chest trap */
          var $w545=t_list[$w543.tptr];
          if((($index($w545.name_,"^")>0))){
            (yield* msg_print("I don't see a trap..."));
          }else if(((((496&$w545.flags)>>>0)!==0))){
            if(((((tot-t5))>randint(100)))){
              $w545.flags=((4294966799&$w545.flags)>>>0);
              i1=$index($w545.name_," (");
              if(((i1>0))){
                $w545.name_=$cap($substr($w545.name_,1,(i1-1)),68);
              }
              if(((((1&$w545.flags)>>>0)!==0))){
                $w545.name_=$cap(($w545.name_+" (Locked)"),68);
              }else{
                $w545.name_=$cap(($w545.name_+" (Disarmed)"),68);
              }
              (yield* msg_print("You have disarmed the chest."));
              known2($rf($w545,"name_"));
              py.misc.exp=(py.misc.exp+t5);
              (yield* prt_experience());
            }else if(((randint(tot)>5))){
              (yield* msg_print("You failed to disarm the chest."));
            }else{
              (yield* msg_print("You set a trap off!"));
              known2($rf($w545,"name_"));
              (yield* chest_trap(y,x));
            }
          }else{
            (yield* msg_print("The chest was not trapped."));
          }
        }else{
          (yield* msg_print("I do not see anything to disarm there."));
        }
      }else{
        (yield* msg_print("I do not see anything to disarm there."));
      }
    }
  }
  /* Look at an object, trap, or monster			-RAK- */
  /* Note: Looking is a free move, see where invoked... */
  function* look(){
    var i1=0;
    var i2=0;
    var y=0;
    var x=0;
    var dir=0;
    var dummy=0;
    var flag=false;
    var fchar='\0';
    flag=false;
    y=char_row;
    x=char_col;
    if(((yield* get_dir("Look which direction?",{get v(){return dir},set v($x){dir=$x}},{get v(){return dummy},set v($x){dummy=$x}},{get v(){return y},set v($x){y=$x}},{get v(){return x},set v($x){x=$x}})))){
      if(((py.flags.blind<1))){
        y=char_row;
        x=char_col;
        i1=0;
        do{
          move(dir,{get v(){return y},set v($x){y=$x}},{get v(){return x},set v($x){x=$x}});
          var $w546=cave[y][x];
          if((($w546.cptr>1))){
            if((m_list[$w546.cptr].ml)){
              i2=m_list[$w546.cptr].mptr;
              fchar=$ch(c_list[i2].name_,1);
              if(($in(fchar,vowel_set))){
                out_val=$cap($ws("You see an ",0)+$ws(c_list[i2].name_,0)+$ws(".",0),80);
              }else{
                out_val=$cap($ws("You see a ",0)+$ws(c_list[i2].name_,0)+$ws(".",0),80);
              }
              (yield* msg_print(out_val));
              flag=true;
            }
          }
          if((((($w546.tl)||($w546.pl))||($w546.fm)))){
            if((($w546.tptr>0))){
              if(((t_list[$w546.tptr].tval===109))){
                (yield* msg_print("You see a granite wall."));
              }else if(((t_list[$w546.tptr].tval!==101))){
                $assign(inventory[inven_max],t_list[$w546.tptr]);
                objdes({get v(){return out_val},set v($x){out_val=$x}},inven_max,true);
                (yield* msg_print(("You see "+out_val)));
                flag=true;
              }
            }
            if((!($w546.fopen))){
              flag=true;
              switch($w546.fval){
                case 10:{
                  (yield* msg_print("You see a granite wall."));
                  break;
                }
                case 11:{
                  (yield* msg_print("You see some dark rock."));
                  break;
                }
                case 12:{
                  (yield* msg_print("You see a quartz vein."));
                  break;
                }
                case 15:{
                  (yield* msg_print("You see a granite wall."));
                  break;
                }
                default:{
                }
              }
            }
          }
          i1=(i1+1);
        }while(!((((!cave[y][x].fopen)||((i1>max_sight))))));
        if((!flag)){
          (yield* msg_print("You see nothing of interest in that direction."));
        }
      }else{
        (yield* msg_print("You can't see a damn thing!"));
      }
    }
  }
  /* Add to the players food time				-RAK- */
  function* add_food(num){
    var $w548=py.flags;
    if((($w548.food<0))){
      $w548.food=0;
    }
    $w548.food=($w548.food+num);
    if((($w548.food>player_food_full))){
      (yield* msg_print("You are full."));
    }
    if((($w548.food>player_food_max))){
      (yield* msg_print("You're getting fat from eating so much."));
      $w548.food=player_food_max;
    }
  }
  /* Describe number of remaining charges...		-RAK- */
  function* desc_charges(item_val){
    var rem_num=0;
    var out_val="";
    if((($index(inventory[item_val].name_,"^")===0))){
      rem_num=inventory[item_val].p1;
      out_val=$cap($ws("You have ",0)+$wi(rem_num,1)+$ws(" charges remaining.",0),80);
      (yield* msg_print(out_val));
    }
  }
  /* Describe amount of item remaining...			-RAK- */
  function* desc_remain(item_val){
    var out_val="";
    $assign(inventory[inven_max],inventory[item_val]);
    var $w549=inventory[inven_max];
    $w549.number=($w549.number-1);
    objdes({get v(){return out_val},set v($x){out_val=$x}},inven_max,true);
    out_val=$cap((("You have "+$substr(out_val,1,((out_val.length-1))))+"."),80);
    (yield* msg_print(out_val));
  }
  /* Throw an object across the dungeon... 		-RAK- */
  /* Note: Flasks of oil do fire damage */
  /* Note: Extra damage and chance of hitting when missles are used */
  /* with correct weapon.  I.E.  wield bow and throw arrow. */
  function* throw_object(){
    var item_val=0;
    var tbth=0;
    var tpth=0;
    var tdam=0;
    var tdis=0;
    var y_dumy=0;
    var x_dumy=0;
    var dumy=0;
    var y=0;
    var x=0;
    var oldy=0;
    var oldx=0;
    var dir=0;
    var cur_dis=0;
    var redraw=false;
    var flag=false;
    var out_val="";
    function inven_throw(item_val){
      $assign(inventory[inven_max],inventory[item_val]);
      inventory[inven_max].number=1;
      var $w550=inventory[item_val];
      if((((($w550.number>1))&&(($w550.subval>511))))){
        $w550.number=($w550.number-1);
        inven_weight=(inven_weight-$w550.weight);
      }else{
        inven_destroy(item_val);
      }
    }
    function facts(tbth,tpth,tdam,tdis){
      var tmp_weight=0;
      var $w551=inventory[inven_max];
      if((($w551.weight<1))){
        tmp_weight=1;
      }else{
        tmp_weight=$w551.weight;
      }
      /* Throwing objects */
      tdam.v=(damroll($w551.damage)+$w551.todam);
      tbth.v=Math.trunc(Math.fround(py.misc.bthb*Math.fround(0.75)));
      tpth.v=(py.misc.ptohit+$w551.tohit);
      tdis.v=Math.trunc(Math.fround($rdiv(((((py.stat.cstr+20))*10)),tmp_weight)));
      if(((tdis.v>10))){
        tdis.v=10;
      }
      /* Using Bows, slings, or crossbows */
      if(((inventory[23].tval===20))){
        switch(inventory[23].p1){
          case 1:{
            if((($w551.tval===10))){
              /* Sling and Bullet */
              tbth.v=py.misc.bthb;
              tpth.v=(tpth.v+inventory[23].tohit);
              tdam.v=(tdam.v+2);
              tdis.v=20;
            }
            break;
          }
          case 2:{
            if((($w551.tval===12))){
              /* Short Bow and Arrow */
              tbth.v=py.misc.bthb;
              tpth.v=(tpth.v+inventory[23].tohit);
              tdam.v=(tdam.v+2);
              tdis.v=25;
            }
            break;
          }
          case 3:{
            if((($w551.tval===12))){
              /* Long Bow and Arrow */
              tbth.v=py.misc.bthb;
              tpth.v=(tpth.v+inventory[23].tohit);
              tdam.v=(tdam.v+3);
              tdis.v=30;
            }
            break;
          }
          case 4:{
            if((($w551.tval===12))){
              /* Composite Bow and Arrow */
              tbth.v=py.misc.bthb;
              tpth.v=(tpth.v+inventory[23].tohit);
              tdam.v=(tdam.v+4);
              tdis.v=35;
            }
            break;
          }
          case 5:{
            if((($w551.tval===11))){
              /* Light Crossbow and Bolt */
              tbth.v=py.misc.bthb;
              tpth.v=(tpth.v+inventory[23].tohit);
              tdam.v=(tdam.v+2);
              tdis.v=25;
            }
            break;
          }
          case 6:{
            if((($w551.tval===11))){
              /* Heavy Crossbow and Bolt */
              tbth.v=py.misc.bthb;
              tpth.v=(tpth.v+inventory[23].tohit);
              tdam.v=(tdam.v+4);
              tdis.v=35;
            }
            break;
          }
        }
      }
    }
    function* drop_throw(y,x){
      var i1=0;
      var i2=0;
      var i3=0;
      var cur_pos=0;
      var flag=false;
      var out_val="";
      flag=false;
      i1=y;
      i2=x;
      i3=0;
      if(((randint(10)>1))){
        do{
          if((in_bounds(i1,i2))){
            var $w553=cave[i1][i2];
            if(($w553.fopen)){
              if((($w553.tptr===0))){
                flag=true;
              }
            }
          }
          if((!(flag))){
            i1=((y+randint(3))-2);
            i2=((x+randint(3))-2);
            i3=(i3+1);
          }
        }while(!((((flag)||((i3>9))))));
      }
      if((flag)){
        popt({get v(){return cur_pos},set v($x){cur_pos=$x}});
        cave[i1][i2].tptr=cur_pos;
        $assign(t_list[cur_pos],inventory[inven_max]);
        if((test_light(i1,i2))){
          lite_spot(i1,i2);
        }
      }else{
        objdes({get v(){return out_val},set v($x){out_val=$x}},inven_max,false);
        (yield* msg_print((("The "+out_val)+" dissapears.")));
      }
    }
    redraw=false;
    if(((inven_ctr===0))){
      (yield* msg_print("But you are not carrying anything."));
    }else if(((yield* get_item({get v(){return item_val},set v($x){item_val=$x}},"Fire/Throw which one?",{get v(){return redraw},set v($x){redraw=$x}},1,inven_ctr)))){
      if((redraw)){
        draw_cave();
      }
      y_dumy=char_row;
      x_dumy=char_col;
      if(((yield* get_dir("Which direction?",{get v(){return dir},set v($x){dir=$x}},{get v(){return dumy},set v($x){dumy=$x}},{get v(){return y_dumy},set v($x){y_dumy=$x}},{get v(){return x_dumy},set v($x){x_dumy=$x}})))){
        (yield* desc_remain(item_val));
        if(((py.flags.confused>0))){
          (yield* msg_print("You are confused..."));
          do{
            dir=randint(9);
          }while(!(((dir!==5))));
        }
        inven_throw(item_val);
        facts({get v(){return tbth},set v($x){tbth=$x}},{get v(){return tpth},set v($x){tpth=$x}},{get v(){return tdam},set v($x){tdam=$x}},{get v(){return tdis},set v($x){tdis=$x}});
        var $w554=inventory[inven_max];
        flag=false;
        y=char_row;
        x=char_col;
        oldy=char_row;
        oldx=char_col;
        cur_dis=0;
        do{
          move(dir,{get v(){return y},set v($x){y=$x}},{get v(){return x},set v($x){x=$x}});
          cur_dis=(cur_dis+1);
          if((test_light(oldy,oldx))){
            lite_spot(oldy,oldx);
          }
          if(((cur_dis>tdis))){
            flag=true;
          }
          var $w555=cave[y][x];
          if(((($w555.fopen)&&(!(flag))))){
            if((($w555.cptr>1))){
              flag=true;
              var $w556=m_list[$w555.cptr];
              tbth=(tbth-cur_dis);
              if(((yield* test_hit(tbth,py.misc.lev,tpth,c_list[$w556.mptr].ac)))){
                i1=$w556.mptr;
                objdes({get v(){return out_val},set v($x){out_val=$x}},inven_max,false);
                (yield* msg_print((((("The "+out_val)+" hits the ")+c_list[i1].name_)+".")));
                tdam=tot_dam($clone(inventory[inven_max]),tdam,$clone(c_list[i1]));
                var $w557=inventory[inven_max];
                tdam=(yield* critical_blow($w557.weight,tpth,tdam));
                i1=(yield* mon_take_hit($w555.cptr,tdam));
                if(((i1>0))){
                  (yield* msg_print((("You have killed the "+c_list[i1].name_)+".")));
                }
              }else{
                (yield* drop_throw(oldy,oldx));
              }
            }else{
              if((panel_contains(y,x))){
                if((test_light(y,x))){
                  print($w554.tchar,y,x);
                }
              }
            }
          }else{
            flag=true;
            (yield* drop_throw(oldy,oldx));
          }
          oldy=y;
          oldx=x;
        }while(!((flag)));
      }
    }else if((redraw)){
      draw_cave();
    }
  }
  /* Bash open a door or chest				-RAK- */
  /* Note: Affected by strength and weight of character */
  function* bash(){
    var y=0;
    var x=0;
    var tmp=0;
    var old_ptodam=0;
    var old_ptohit=0;
    var old_bth=0;
    y=char_row;
    x=char_col;
    if(((yield* get_dir("Which direction?",{get v(){return tmp},set v($x){tmp=$x}},{get v(){return tmp},set v($x){tmp=$x}},{get v(){return y},set v($x){y=$x}},{get v(){return x},set v($x){x=$x}})))){
      var $w558=cave[y][x];
      if((($w558.cptr>1))){
        if(((py.flags.afraid>0))){
          (yield* msg_print("You are afraid!"));
        }else{
          /* Save old values of attacking */
          $assign(inventory[inven_max],inventory[23]);
          old_ptohit=py.misc.ptohit;
          old_ptodam=py.misc.ptodam;
          old_bth=py.misc.bth;
          /* Use these values */
          $assign(inventory[23],blank_treasure);
          var $w559=inventory[23];
          $w559.damage=$cap(inventory[27].damage,5);
          $w559.weight=py.stat.cstr;
          $w559.tval=1;
          var $w560=py;
          $w560.misc.bth=Math.trunc(Math.fround($rdiv((($w560.stat.cstr+$w560.misc.wt)),Math.fround(6.0))));
          $w560.misc.ptohit=0;
          $w560.misc.ptodam=(Math.trunc(Math.fround($rdiv($w560.misc.wt,Math.fround(75.0))))+1);
          if(((yield* py_attack(y,x)))){
            var $w561=m_list[$w558.cptr];
            $w561.stuned=(((randint(2)+1))<<26>>26);
            if((($w561.stuned>24))){
              $w561.stuned=((24)<<26>>26);
            }
            (yield* msg_print((("The "+c_list[$w561.mptr].name_)+" appears stunned!")));
          }
          /* Restore old values */
          $assign(inventory[23],inventory[inven_max]);
          py.misc.ptohit=old_ptohit;
          py.misc.ptodam=old_ptodam;
          py.misc.bth=old_bth;
          if(((randint(140)>py.stat.cdex))){
            (yield* msg_print("You are off-balance."));
            py.flags.paralysis=randint(3);
          }
        }
      }else if((($w558.tptr>0))){
        var $w562=t_list[$w558.tptr];
        if((($w562.tval===105))){
          (yield* msg_print("You smash into the door!"));
          var $w563=py;
          if(((yield* test_hit(($w563.misc.wt+$w563.stat.cstr),0,0,(Math.abs($w562.p1)+150))))){
            (yield* msg_print("The door crashes open!"));
            $assign(t_list[$w558.tptr],door_list[1]);
            $w562.p1=1;
            $w558.fopen=true;
            lite_spot(y,x);
          }else{
            (yield* msg_print("The door holds firm."));
            py.flags.paralysis=2;
          }
        }else if((($w562.tval===2))){
          if(((randint(10)===1))){
            (yield* msg_print("You have destroyed the chest..."));
            (yield* msg_print("and it's contents!"));
            $w562.name_=$cap("& ruined chest",68);
            $w562.flags=0;
          }else if(((((1&$w562.flags)>>>0)!==0))){
            if(((randint(10)===1))){
              (yield* msg_print("The lock breaks open!"));
              $w562.flags=((4294967294&$w562.flags)>>>0);
            }
          }
        }else{
          (yield* msg_print("I do not see anything you can bash there."));
        }
      }else{
        (yield* msg_print("I do not see anything you can bash there."));
      }
    }
  }
  /* Jam a closed door					-RAK- */
  function* jamdoor(){
    var y=0;
    var x=0;
    var tmp=0;
    y=char_row;
    x=char_col;
    if(((yield* get_dir("Which direction?",{get v(){return tmp},set v($x){tmp=$x}},{get v(){return tmp},set v($x){tmp=$x}},{get v(){return y},set v($x){y=$x}},{get v(){return x},set v($x){x=$x}})))){
      var $w564=cave[y][x];
      if((($w564.tptr>0))){
        var $w565=t_list[$w564.tptr];
        if((($w565.tval===105))){
          if((($w564.cptr===0))){
            if((find_range($S38,{get v(){return i1},set v($x){i1=$x}},{get v(){return i2},set v($x){i2=$x}}))){
              (yield* msg_print("You jam the door with a spike."));
              var $w566=inventory[i1];
              if((($w566.number>1))){
                $w566.number=($w566.number-1);
              }else{
                inven_destroy(i1);
              }
              $w565.p1=((-Math.abs($w565.p1))-20);
            }else{
              (yield* msg_print("But you have no spikes..."));
            }
          }else{
            (yield* msg_print((("The "+c_list[m_list[$w564.cptr].mptr].name_)+" is in your way!")));
          }
        }else if((($w565.tval===104))){
          (yield* msg_print("The door must be closed first."));
        }else{
          (yield* msg_print("That isn't a door!"));
        }
      }else{
        (yield* msg_print("That isn't a door!"));
      }
    }
  }
  /* Refill the players lamp				-RAK- */
  function* refill_lamp(){
    var i1=0;
    var i2=0;
    var i3=0;
    var out_val="";
    i3=inventory[33].subval;
    if(((((i3>0))&&((i3<10))))){
      if((find_range($S39,{get v(){return i1},set v($x){i1=$x}},{get v(){return i2},set v($x){i2=$x}}))){
        (yield* msg_print("Your lamp is full."));
        var $w567=inventory[33];
        $w567.p1=($w567.p1+inventory[i1].p1);
        if((($w567.p1>obj_S_lamp_max))){
          $w567.p1=obj_S_lamp_max;
        }
        (yield* desc_remain(i1));
        inven_destroy(i1);
      }else{
        (yield* msg_print("You have no oil."));
      }
    }else{
      (yield* msg_print("But you are not using a lamp."));
    }
  }
  /* General spells and misc routines */
  /* Following are spell procedure/functions			-RAK- */
  /* These routines are commonly used in the scroll, potion, wands, and */
  /* staves routines, and are occassionly called from other areas. */
  /* Now included are creature spells also...                      -RAK */
  /* Sleep creatures adjacent to player			-RAK- */
  function* sleep_monsters1(y,x){
    var $ret=false;
    var i1=0;
    var i2=0;
    $ret=false;
    for(var $e568=(y+1),$ie568=(y-1);$ie568<=$e568;$ie568++){
      i1=$ie568;
      for(var $e569=(x+1),$ie569=(x-1);$ie569<=$e569;$ie569++){
        i2=$ie569;
        var $w570=cave[i1][i2];
        if((($w570.cptr>1))){
          var $w571=m_list[$w570.cptr];
          var $w572=c_list[$w571.mptr];
          $ret=true;
          if(((((randint(max_mons_level)<$w572.level))||((((4096&$w572.cdefense)>>>0)!==0))))){
            (yield* msg_print((("The "+$w572.name_)+" is unaffected.")));
          }else{
            (yield* msg_print((("The "+$w572.name_)+" falls asleep.")));
            $w571.csleep=500;
          }
        }
      }
    }
    return $ret;
  }
  /* Detect any monsters on the current panel		-RAK- */
  function detect_treasure(){
    var $ret=false;
    var i1=0;
    var i2=0;
    $ret=false;
    for(var $e573=panel_row_max,$ie573=panel_row_min;$ie573<=$e573;$ie573++){
      i1=$ie573;
      for(var $e574=panel_col_max,$ie574=panel_col_min;$ie574<=$e574;$ie574++){
        i2=$ie574;
        var $w575=cave[i1][i2];
        if((($w575.tptr>0))){
          if(((t_list[$w575.tptr].tval===100))){
            if((!(test_light(i1,i2)))){
              lite_spot(i1,i2);
              $w575.tl=true;
              $ret=true;
            }
          }
        }
      }
    }
    return $ret;
  }
  /* Detect all objects on the current panel		-RAK- */
  function detect_object(){
    var $ret=false;
    var i1=0;
    var i2=0;
    $ret=false;
    for(var $e576=panel_row_max,$ie576=panel_row_min;$ie576<=$e576;$ie576++){
      i1=$ie576;
      for(var $e577=panel_col_max,$ie577=panel_col_min;$ie577<=$e577;$ie577++){
        i2=$ie577;
        var $w578=cave[i1][i2];
        if((($w578.tptr>0))){
          if(((t_list[$w578.tptr].tval<100))){
            if((!(test_light(i1,i2)))){
              lite_spot(i1,i2);
              $w578.tl=true;
              $ret=true;
            }
          }
        }
      }
    }
    return $ret;
  }
  /* Locates and displays traps on current panel		-RAK- */
  function detect_trap(){
    var $ret=false;
    var i1=0;
    var i2=0;
    $ret=false;
    for(var $e579=panel_row_max,$ie579=panel_row_min;$ie579<=$e579;$ie579++){
      i1=$ie579;
      for(var $e580=panel_col_max,$ie580=panel_col_min;$ie580<=$e580;$ie580++){
        i2=$ie580;
        var $w581=cave[i1][i2];
        if((($w581.tptr>0))){
          if(((t_list[$w581.tptr].tval===101))){
            change_trap(i1,i2);
            $w581.fm=true;
            $ret=true;
          }else if(((t_list[$w581.tptr].tval===2))){
            var $w582=t_list[$w581.tptr];
            known2($rf($w582,"name_"));
          }
        }
      }
    }
    return $ret;
  }
  /* Locates and displays all secret doors on current panel -RAK- */
  function detect_sdoor(){
    var $ret=false;
    var i1=0;
    var i2=0;
    $ret=false;
    for(var $e583=panel_row_max,$ie583=panel_row_min;$ie583<=$e583;$ie583++){
      i1=$ie583;
      for(var $e584=panel_col_max,$ie584=panel_col_min;$ie584<=$e584;$ie584++){
        i2=$ie584;
        var $w585=cave[i1][i2];
        if((($w585.tptr>0))){
          /* Secret doors */
          if(((t_list[$w585.tptr].tval===109))){
            $w585.fval=((corr_floor3.ftval)&15);
            change_trap(i1,i2);
            $w585.fm=true;
            $ret=true;
          /* Staircases */
          }else if(($in(t_list[$w585.tptr].tval,$S40))){
            if((!($w585.fm))){
              $w585.fm=true;
              lite_spot(i1,i2);
              $ret=true;
            }
          }
        }
      }
    }
    return $ret;
  }
  /* Locates and displays all invisible creatures on current panel -RAK- */
  function* detect_invisible(){
    var $ret=false;
    var i1=0;
    var dummy='\0';
    var flag=false;
    flag=false;
    i1=muptr;
    do{
      var $w586=m_list[i1];
      if((panel_contains($w586.fy,$w586.fx))){
        if(((((65536&c_list[$w586.mptr].cmove)>>>0)!==0))){
          $w586.ml=true;
          print(c_list[$w586.mptr].cchar,$w586.fy,$w586.fx);
          flag=true;
        }
      }
      i1=m_list[i1].nptr;
    }while(!(((i1===0))));
    if((flag)){
      (yield* msg_print("You sense the presence of invisible creatures!"));
      (yield* msg_print(" "));
      msg_flag=false;
    }
    $ret=flag;
    return $ret;
  }
  /* Light an area: 1.  If corridor then light immediate area -RAK- */
  /* 2.  If room then light entire room. */
  function* light_area(y,x){
    var $ret=false;
    var i1=0;
    var i2=0;
    (yield* msg_print("You are surrounded by a white light."));
    $ret=true;
    if(((($in(cave[y][x].fval,$S27))&&((dun_level>0))))){
      light_room(y,x);
    }else{
      for(var $e587=(y+1),$ie587=(y-1);$ie587<=$e587;$ie587++){
        i1=$ie587;
        for(var $e588=(x+1),$ie588=(x-1);$ie588<=$e588;$ie588++){
          i2=$ie588;
          if((in_bounds(i1,i2))){
            if((!(test_light(i1,i2)))){
              lite_spot(i1,i2);
            }
            cave[i1][i2].pl=true;
          }
        }
      }
    }
    return $ret;
  }
  /* Darken an area, opposite of light area		-RAK- */
  function* unlight_area(y,x){
    var $ret=false;
    var i1=0;
    var i2=0;
    var i3=0;
    var tmp1=0;
    var tmp2=0;
    var start_row=0;
    var start_col=0;
    var end_row=0;
    var end_col=0;
    var flag=false;
    flag=false;
    if(((($in(cave[y][x].fval,$S27))&&((dun_level>0))))){
      tmp1=Math.trunc(Math.fround($rdiv(screen_height,2)));
      tmp2=Math.trunc(Math.fround($rdiv(screen_width,2)));
      start_row=((Math.trunc(Math.fround($rdiv(y,tmp1)))*tmp1)+1);
      start_col=((Math.trunc(Math.fround($rdiv(x,tmp2)))*tmp2)+1);
      end_row=((start_row+tmp1)-1);
      end_col=((start_col+tmp2)-1);
      for(var $e589=end_row,$ie589=start_row;$ie589<=$e589;$ie589++){
        i1=$ie589;
        out_val=$cap("",80);
        i3=0;
        for(var $e590=end_col,$ie590=start_col;$ie590<=$e590;$ie590++){
          i2=$ie590;
          var $w591=cave[i1][i2];
          if(($in($w591.fval,$S27))){
            $w591.pl=false;
            $w591.fval=((1)&15);
            if((!(test_light(i1,i2)))){
              if(((i3===0))){
                i3=i2;
              }
              out_val=$cap((out_val+" "),80);
            }else if(((i3>0))){
              flag=true;
              print(out_val,i1,i3);
              out_val=$cap("",80);
              i3=0;
            }
          }else if(((i3>0))){
            flag=true;
            print(out_val,i1,i3);
            out_val=$cap("",80);
            i3=0;
          }
        }
        if(((i3>0))){
          flag=true;
          print(out_val,i1,i3);
        }
      }
    }else{
      for(var $e592=(y+1),$ie592=(y-1);$ie592<=$e592;$ie592++){
        i1=$ie592;
        for(var $e593=(x+1),$ie593=(x-1);$ie593<=$e593;$ie593++){
          i2=$ie593;
          if((in_bounds(i1,i2))){
            var $w594=cave[i1][i2];
            if(($in($w594.fval,$S26))){
              if(($w594.pl)){
                $w594.pl=false;
                flag=true;
              }
            }
          }
        }
      }
    }
    if((flag)){
      (yield* msg_print("Darkness surrounds you..."));
      $ret=true;
    }else{
      $ret=false;
    }
    return $ret;
  }
  /* Map the current area plus some			-RAK- */
  function map_area(){
    var $ret=false;
    var i1=0;
    var i2=0;
    var i3=0;
    var i4=0;
    var i5=0;
    var i6=0;
    var i7=0;
    var i8=0;
    $ret=true;
    i1=(panel_row_min-randint(10));
    i2=(panel_row_max+randint(10));
    i3=(panel_col_min-randint(20));
    i4=(panel_col_max+randint(20));
    for(var $e595=i2,$ie595=i1;$ie595<=$e595;$ie595++){
      i5=$ie595;
      for(var $e596=i4,$ie596=i3;$ie596<=$e596;$ie596++){
        i6=$ie596;
        if((in_bounds(i5,i6))){
          if(($in(cave[i5][i6].fval,floor_set))){
            for(var $e597=(i5+1),$ie597=(i5-1);$ie597<=$e597;$ie597++){
              i7=$ie597;
              for(var $e598=(i6+1),$ie598=(i6-1);$ie598<=$e598;$ie598++){
                i8=$ie598;
                var $w599=cave[i7][i8];
                if(($in($w599.fval,pwall_set))){
                  $w599.pl=true;
                }else if((($w599.tptr>0))){
                  if(($in(t_list[$w599.tptr].tval,light_set))){
                    $w599.fm=true;
                  }
                }
              }
            }
          }
        }
      }
    }
    prt_map();
    return $ret;
  }
  /* Identify an object					-RAK- */
  function* ident_spell(){
    var $ret=false;
    var item_val=0;
    var out_val="";
    var redraw=false;
    $ret=false;
    redraw=false;
    if(((yield* get_item({get v(){return item_val},set v($x){item_val=$x}},"Item you wish identified?",{get v(){return redraw},set v($x){redraw=$x}},1,inven_ctr)))){
      var $w600=inventory[item_val];
      $ret=true;
      identify($clone(inventory[item_val]));
      known2($rf($w600,"name_"));
      objdes({get v(){return out_val},set v($x){out_val=$x}},item_val,true);
      (yield* msg_print(((($chr((item_val+96))+cur_char2(item_val))+" ")+out_val)));
    }
    if((redraw)){
      (yield* msg_print(" "));
      draw_cave();
    }
    return $ret;
  }
  /* Get all the monsters on the level pissed off...	-RAK- */
  function aggravate_monster(dis_affect){
    var $ret=false;
    var i1=0;
    $ret=true;
    i1=muptr;
    do{
      var $w601=m_list[i1];
      $w601.csleep=0;
      if((($w601.cdis<=dis_affect))){
        if((($w601.cspeed<2))){
          $w601.cspeed=($w601.cspeed+1);
        }
      }
      i1=m_list[i1].nptr;
    }while(!(((i1===0))));
    return $ret;
  }
  /* Surround the fool with traps (chuckle)		-RAK- */
  function trap_creation(){
    var $ret=false;
    var i1=0;
    var i2=0;
    $ret=true;
    for(var $e602=(char_row+1),$ie602=(char_row-1);$ie602<=$e602;$ie602++){
      i1=$ie602;
      for(var $e603=(char_col+1),$ie603=(char_col-1);$ie603<=$e603;$ie603++){
        i2=$ie603;
        var $w604=cave[i1][i2];
        if(($in($w604.fval,floor_set))){
          if((($w604.tptr>0))){
            delete_object(i1,i2);
          }
          place_trap(i1,i2,1,randint(max_trapa));
        }
      }
    }
    return $ret;
  }
  /* Surround the player with doors...			-RAK- */
  function door_creation(){
    var $ret=false;
    var i1=0;
    var i2=0;
    var i3=0;
    $ret=true;
    for(var $e605=(char_row+1),$ie605=(char_row-1);$ie605<=$e605;$ie605++){
      i1=$ie605;
      for(var $e606=(char_col+1),$ie606=(char_col-1);$ie606<=$e606;$ie606++){
        i2=$ie606;
        if(((((i1!==char_row))||((i2!==char_col))))){
          var $w607=cave[i1][i2];
          if(($in($w607.fval,floor_set))){
            popt({get v(){return i3},set v($x){i3=$x}});
            if((($w607.tptr>0))){
              delete_object(i1,i2);
            }
            $w607.fopen=false;
            $w607.tptr=i3;
            $assign(t_list[i3],door_list[2]);
            if((test_light(i1,i2))){
              lite_spot(i1,i2);
            }
          }
        }
      }
    }
    return $ret;
  }
  /* Destroys any adjacent door(s)/trap(s) 		-RAK- */
  function td_destroy(){
    var $ret=false;
    var i1=0;
    var i2=0;
    $ret=false;
    for(var $e608=(char_row+1),$ie608=(char_row-1);$ie608<=$e608;$ie608++){
      i1=$ie608;
      for(var $e609=(char_col+1),$ie609=(char_col-1);$ie609<=$e609;$ie609++){
        i2=$ie609;
        var $w610=cave[i1][i2];
        if((($w610.tptr>0))){
          if(($in(t_list[$w610.tptr].tval,$S41))){
            if((delete_object(i1,i2))){
              $ret=true;
            }
          }
        }
      }
    }
    return $ret;
  }
  /* Display all creatures on the current panel		-RAK- */
  function* detect_monsters(){
    var $ret=false;
    var i1=0;
    var i2=0;
    var flag=false;
    flag=false;
    i1=muptr;
    do{
      var $w611=m_list[i1];
      if((panel_contains($w611.fy,$w611.fx))){
        if(((((65536&c_list[$w611.mptr].cmove)>>>0)===0))){
          $w611.ml=true;
          print(c_list[$w611.mptr].cchar,$w611.fy,$w611.fx);
          flag=true;
        }
      }
      i1=m_list[i1].nptr;
    }while(!(((i1===0))));
    if((flag)){
      (yield* msg_print("You sense the presense of monsters!"));
      (yield* msg_print(" "));
      msg_flag=false;
      $ret=true;
    }
    $ret=flag;
    return $ret;
  }
  /* Leave a line of light in given dir, blue light can sometimes */
  /* hurt creatures...                                     -RAK- */
  function* light_line(dir,y,x){
    var $ret=false;
    $ret=true;
    while((cave[y][x].fopen)){
      var $w612=cave[y][x];
      if((panel_contains(y,x))){
        if((!((($w612.tl)||($w612.pl))))){
          if((($w612.fval===2))){
            light_room(y,x);
          }else{
            lite_spot(y,x);
          }
        }
        if((($w612.cptr>1))){
          var $w613=m_list[$w612.cptr];
          var $w614=c_list[$w613.mptr];
          if(((((256&$w614.cdefense)>>>0)!==0))){
            (yield* msg_print((("The "+$w614.name_)+" wails out in pain!")));
            i1=(yield* mon_take_hit($w612.cptr,damroll("2d8")));
            if(((i1>0))){
              (yield* msg_print((("The "+$w614.name_)+" dies in a fit of agony.")));
            }
          }
        }
      }
      $w612.pl=true;
      move(dir,{get v(){return y},set v($x){y=$x}},{get v(){return x},set v($x){x=$x}});
    }
    return $ret;
  }
  /* Light line in all directions				-RAK- */
  function* starlite(y,x){
    var $ret=false;
    var i1=0;
    (yield* msg_print("The end of the staff bursts into a blue shimmering light."));
    $ret=true;
    for(var $e615=9,$ie615=1;$ie615<=$e615;$ie615++){
      i1=$ie615;
      if(((i1!==5))){
        (yield* light_line(i1,y,x));
      }
    }
    return $ret;
  }
  /* Disarms all traps/chests in a given direction 	-RAK- */
  function* disarm_all(dir,y,x){
    var $ret=false;
    var i1=0;
    var oldy=0;
    var oldx=0;
    $ret=false;
    do{
      var $w616=cave[y][x];
      if((($w616.tptr>0))){
        var $w617=t_list[$w616.tptr];
        if(($in($w617.tval,$S42))){
          if((delete_object(y,x))){
            $ret=true;
          }
        }else if((($w617.tval===105))){
          $w617.p1=0;
        }else if((($w617.tval===109))){
          $w616.fval=((corr_floor3.ftval)&15);
          change_trap(y,x);
          $w616.fm=true;
          $ret=true;
        }else if((($w617.tval===2))){
          if((($w617.flags>0))){
            (yield* msg_print("Click!"));
            $w617.flags=0;
            $ret=true;
            i1=$index($w617.name_," (");
            if(((i1>0))){
              $w617.name_=$cap($substr($w617.name_,1,(i1-1)),68);
            }
            $w617.name_=$cap(($w617.name_+" (Unlocked)"),68);
            known2($rf($w617,"name_"));
          }
        }
      }
      oldy=y;
      oldx=x;
      move(dir,{get v(){return y},set v($x){y=$x}},{get v(){return x},set v($x){x=$x}});
    }while(!((!(cave[oldy][oldx].fopen))));
    return $ret;
  }
  /* Return flags for given type area affect		-RAK- */
  function get_flags(typ,weapon_type,harm_type,destroy){
    switch(typ){
      case 1:{
        /* Lightning */
        weapon_type.v=524288;
        harm_type.v=256;
        destroy.v=$S43;
        break;
      }
      case 2:{
        /* Poison Gas */
        weapon_type.v=1048576;
        harm_type.v=64;
        destroy.v=$S44;
        break;
      }
      case 3:{
        /* Acid */
        weapon_type.v=2097152;
        harm_type.v=128;
        destroy.v=$S45;
        break;
      }
      case 4:{
        /* Frost */
        weapon_type.v=4194304;
        harm_type.v=16;
        destroy.v=$S33;
        break;
      }
      case 5:{
        /* Fire */
        weapon_type.v=8388608;
        harm_type.v=32;
        destroy.v=$S46;
        break;
      }
      case 6:{
        /* Holy Orb */
        weapon_type.v=0;
        harm_type.v=4;
        destroy.v=$S44;
        break;
      }
      default:{
        weapon_type.v=0;
        harm_type.v=0;
        destroy.v=$S44;
      }
    }
  }
  /* Shoot a bolt in a given direction			-RAK- */
  function* fire_bolt(typ,dir,y,x,dam,bolt_typ){
    var $ret=false;
    var i1=0;
    var oldy=0;
    var oldx=0;
    var dist=0;
    var weapon_type=0;
    var harm_type=0;
    var flag=false;
    var dummy=$set([]);
    $ret=true;
    flag=false;
    get_flags(typ,{get v(){return weapon_type},set v($x){weapon_type=$x}},{get v(){return harm_type},set v($x){harm_type=$x}},{get v(){return dummy},set v($x){dummy=$x}});
    oldy=y;
    oldx=x;
    dist=0;
    do{
      move(dir,{get v(){return y},set v($x){y=$x}},{get v(){return x},set v($x){x=$x}});
      if((test_light(oldy,oldx))){
        lite_spot(oldy,oldx);
      }else{
        unlite_spot(oldy,oldx);
      }
      dist=(dist+1);
      if(((dist>obj_S_bolt_range))){
        flag=true;
      }else{
        var $w619=cave[y][x];
        if(($w619.fopen)){
          if((($w619.cptr>1))){
            flag=true;
            var $w620=m_list[$w619.cptr];
            var $w621=c_list[$w620.mptr];
            (yield* msg_print((((("The "+bolt_typ)+" strikes the ")+c_list[$w620.mptr].name_)+".")));
            if(((((harm_type&$w621.cdefense)>>>0)!==0))){
              dam=(dam*2);
            }else if(((((weapon_type&$w621.spells)>>>0)!==0))){
              dam=Math.trunc(Math.fround($rdiv(dam,Math.fround(4.0))));
            }
            i1=(yield* mon_take_hit($w619.cptr,dam));
            if(((i1>0))){
              (yield* msg_print((("The "+c_list[i1].name_)+" dies in a fit of agony.")));
            }else{
              if((panel_contains(y,x))){
                print(c_list[$w620.mptr].cchar,y,x);
                m_list[$w619.cptr].ml=true;
              }
            }
          }else if((panel_contains(y,x))){
            print("*",y,x);
          }
        }else{
          flag=true;
        }
        oldy=y;
        oldx=x;
      }
    }while(!((flag)));
    return $ret;
  }
  /* Shoot a ball in a given direction.  Note that balls have an */
  /* area affect....                                       -RAK- */
  function* fire_ball(typ,dir,y,x,dam_hp,descrip){
    var $ret=false;
    var i1=0;
    var i2=0;
    var i3=0;
    var dam=0;
    var max_dis=0;
    var thit=0;
    var tkill=0;
    var oldy=0;
    var oldx=0;
    var dist=0;
    var weapon_type=0;
    var harm_type=0;
    var flag=false;
    var destroy=$set([]);
    $ret=true;
    thit=0;
    tkill=0;
    max_dis=2;
    get_flags(typ,{get v(){return weapon_type},set v($x){weapon_type=$x}},{get v(){return harm_type},set v($x){harm_type=$x}},{get v(){return destroy},set v($x){destroy=$x}});
    flag=false;
    oldy=y;
    oldx=x;
    dist=0;
    do{
      move(dir,{get v(){return y},set v($x){y=$x}},{get v(){return x},set v($x){x=$x}});
      dist=(dist+1);
      if((test_light(oldy,oldx))){
        lite_spot(oldy,oldx);
      }else{
        unlite_spot(oldy,oldx);
      }
      if(((dist>obj_S_bolt_range))){
        flag=true;
      }else{
        var $w622=cave[y][x];
        if((((!($w622.fopen))||(($w622.cptr>1))))){
          flag=true;
          if((!($w622.fopen))){
            y=oldy;
            x=oldx;
          }
          /* The ball hits and explodes... */
          /* The explosion... */
          for(var $e623=(y+max_dis),$ie623=(y-max_dis);$ie623<=$e623;$ie623++){
            i1=$ie623;
            for(var $e624=(x+max_dis),$ie624=(x-max_dis);$ie624<=$e624;$ie624++){
              i2=$ie624;
              if((in_bounds(i1,i2))){
                if(((distance(y,x,i1,i2)<=max_dis))){
                  if((los(y,x,i1,i2))){
                    /* FIXED BUG V4.5 */
                    var $w625=cave[i1][i2];
                    if((($w625.tptr>0))){
                      if(($in(t_list[$w625.tptr].tval,destroy))){
                        delete_object(i1,i2);
                      }
                    }
                    if(($w625.fopen)){
                      if((panel_contains(i1,i2))){
                        print("*",i1,i2);
                      }
                      if((($w625.cptr>1))){
                        var $w626=m_list[$w625.cptr];
                        var $w627=c_list[$w626.mptr];
                        thit=(thit+1);
                        dam=dam_hp;
                        if(((((harm_type&$w627.cdefense)>>>0)!==0))){
                          dam=(dam*2);
                        }else if(((((weapon_type&$w627.spells)>>>0)!==0))){
                          dam=$idiv(dam,4);
                        }
                        dam=Math.trunc(Math.fround($rdiv(dam,((distance(i1,i2,y,x)+1)))));
                        i3=(yield* mon_take_hit($w625.cptr,dam));
                        if(((i3>0))){
                          tkill=(tkill+1);
                        }else{
                          if((panel_contains(i1,i2))){
                            print($w627.cchar,i1,i2);
                            $w626.ml=true;
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          for(var $e628=((y+2)),$ie628=((y-2));$ie628<=$e628;$ie628++){
            i1=$ie628;
            for(var $e629=((x+2)),$ie629=((x-2));$ie629<=$e629;$ie629++){
              i2=$ie629;
              if((in_bounds(i1,i2))){
                if((panel_contains(i1,i2))){
                  if(((distance(y,x,i1,i2)<=max_dis))){
                    var $w630=cave[i1][i2];
                    if((test_light(i1,i2))){
                      lite_spot(i1,i2);
                    }else if((($w630.cptr===1))){
                      lite_spot(i1,i2);
                    }else if((($w630.cptr>1))){
                      if((m_list[$w630.cptr].ml)){
                        lite_spot(i1,i2);
                      }else{
                        unlite_spot(i1,i2);
                      }
                    }else{
                      unlite_spot(i1,i2);
                    }
                  }
                }
              }
            }
          }
          /* End  explosion... */
          if(((thit===1))){
            (yield* msg_print((("The "+descrip)+" envelopes a creature!")));
          }else if(((thit>1))){
            (yield* msg_print((("The "+descrip)+" envelopes several creatures!")));
          }
          if(((tkill===1))){
            (yield* msg_print("There is a scream of agony!"));
          }else if(((tkill>1))){
            (yield* msg_print("There are several screams of agony!"));
          }
        /* End ball hitting... */
        }else if((panel_contains(y,x))){
          print("*",y,x);
        }
        oldy=y;
        oldx=x;
      }
    }while(!((flag)));
    return $ret;
  }
  /* Breath weapon works like a fire_ball, but affects the player. */
  /* Note the area affect....                              -RAK- */
  function* breath(typ,y,x,dam_hp,ddesc){
    var $ret=false;
    var i1=0;
    var i2=0;
    var i3=0;
    var dam=0;
    var max_dis=0;
    var weapon_type=0;
    var harm_type=0;
    var flag=false;
    var destroy=$set([]);
    $ret=true;
    max_dis=2;
    get_flags(typ,{get v(){return weapon_type},set v($x){weapon_type=$x}},{get v(){return harm_type},set v($x){harm_type=$x}},{get v(){return destroy},set v($x){destroy=$x}});
    for(var $e631=(y+2),$ie631=(y-2);$ie631<=$e631;$ie631++){
      i1=$ie631;
      for(var $e632=(x+2),$ie632=(x-2);$ie632<=$e632;$ie632++){
        i2=$ie632;
        if((in_bounds(i1,i2))){
          if(((distance(y,x,i1,i2)<=max_dis))){
            var $w633=cave[i1][i2];
            if((($w633.tptr>0))){
              if(($in(t_list[$w633.tptr].tval,destroy))){
                delete_object(i1,i2);
              }
            }
            if(($w633.fopen)){
              if((panel_contains(i1,i2))){
                print("*",i1,i2);
              }
              if((($w633.cptr>1))){
                var $w634=m_list[$w633.cptr];
                var $w635=c_list[$w634.mptr];
                dam=dam_hp;
                if(((((harm_type&$w635.cdefense)>>>0)!==0))){
                  dam=(dam*2);
                }else if(((((weapon_type&$w635.spells)>>>0)!==0))){
                  dam=Math.trunc(Math.fround($rdiv(dam,Math.fround(4.0))));
                }
                dam=Math.trunc(Math.fround($rdiv(dam,((distance(i1,i2,y,x)+1)))));
                $w634.hp=($w634.hp-dam);
                $w634.csleep=0;
                if((($w634.hp<0))){
                  (yield* monster_death($w634.fy,$w634.fx,$w635.cmove));
                  delete_monster($w633.cptr);
                }
              }else if((($w633.cptr===1))){
                dam=Math.trunc(Math.fround($rdiv(dam_hp,((distance(i1,i2,y,x)+1)))));
                switch(typ){
                  case 1:{
                    (yield* light_dam(dam,ddesc));
                    break;
                  }
                  case 2:{
                    (yield* poison_gas(dam,ddesc));
                    break;
                  }
                  case 3:{
                    (yield* acid_dam(dam,ddesc));
                    break;
                  }
                  case 4:{
                    (yield* cold_dam(dam,ddesc));
                    break;
                  }
                  case 5:{
                    (yield* fire_dam(dam,ddesc));
                    break;
                  }
                }
              }
            }
          }
        }
      }
    }
    for(var $e637=((y+2)),$ie637=((y-2));$ie637<=$e637;$ie637++){
      i1=$ie637;
      for(var $e638=((x+2)),$ie638=((x-2));$ie638<=$e638;$ie638++){
        i2=$ie638;
        if((in_bounds(i1,i2))){
          if((panel_contains(i1,i2))){
            if(((distance(y,x,i1,i2)<=max_dis))){
              var $w639=cave[i1][i2];
              if((test_light(i1,i2))){
                lite_spot(i1,i2);
              }else if((($w639.cptr===1))){
                lite_spot(i1,i2);
              }else if((($w639.cptr>1))){
                if((m_list[$w639.cptr].ml)){
                  lite_spot(i1,i2);
                }else{
                  unlite_spot(i1,i2);
                }
              }else{
                unlite_spot(i1,i2);
              }
            }
          }
        }
      }
    }
    return $ret;
  }
  /* Recharge a wand, staff, or rod.  Sometimes the item breaks. -RAK- */
  function* recharge(num){
    var $ret=false;
    var item_val=0;
    var redraw=false;
    $ret=false;
    redraw=false;
    if(((yield* get_item({get v(){return item_val},set v($x){item_val=$x}},"Recharge which item?",{get v(){return redraw},set v($x){redraw=$x}},1,inven_ctr)))){
      var $w640=inventory[item_val];
      if(($in($w640.tval,$S24))){
        if(((randint(8)===1))){
          $ret=true;
          (yield* msg_print("There is a bright flash of light..."));
          inven_destroy(item_val);
        }else{
          $ret=true;
          num=Math.trunc(Math.fround($rdiv(num,(($w640.level+2)))));
          $w640.p1=(($w640.p1+2)+randint(num));
          if((($index($w640.name_,"^")===0))){
            insert_str($rf($w640,"name_")," (%P1","^ (%P1");
          }
        }
      }
    }
    if((redraw)){
      (yield* msg_print(" "));
      draw_cave();
    }
    return $ret;
  }
  /* Increase or decrease a creatures hit points		-RAK- */
  function* hp_monster(dir,y,x,dam){
    var $ret=false;
    var i1=0;
    var flag=false;
    $ret=false;
    flag=false;
    do{
      move(dir,{get v(){return y},set v($x){y=$x}},{get v(){return x},set v($x){x=$x}});
      var $w641=cave[y][x];
      if(($w641.fopen)){
        if((($w641.cptr>1))){
          flag=true;
          var $w642=m_list[$w641.cptr];
          var $w643=c_list[$w642.mptr];
          $ret=true;
          i1=(yield* mon_take_hit($w641.cptr,dam));
          if(((i1>0))){
            (yield* msg_print((("The "+c_list[i1].name_)+" dies in a fit of agony.")));
          }else{
            (yield* msg_print((("The "+$w643.name_)+" screams in agony.")));
          }
        }
      }else{
        flag=true;
      }
    }while(!((flag)));
    return $ret;
  }
  /* Drains life; note it must be living...		-RAK- */
  function* drain_life(dir,y,x){
    var $ret=false;
    var i1=0;
    var flag=false;
    $ret=false;
    flag=false;
    do{
      move(dir,{get v(){return y},set v($x){y=$x}},{get v(){return x},set v($x){x=$x}});
      var $w644=cave[y][x];
      if(($w644.fopen)){
        if((($w644.cptr>1))){
          flag=true;
          var $w645=m_list[$w644.cptr];
          var $w646=c_list[$w645.mptr];
          if((((($w646.cdefense&8)>>>0)===0))){
            $ret=true;
            i1=(yield* mon_take_hit($w644.cptr,50));
            if(((i1>0))){
              (yield* msg_print((("The "+c_list[i1].name_)+" dies in a fit of agony.")));
            }else{
              (yield* msg_print((("The "+$w646.name_)+" screams in agony.")));
            }
          }
        }
      }else{
        flag=true;
      }
    }while(!((flag)));
    return $ret;
  }
  /* Increase or decrease a creatures speed		-RAK- */
  /* NOTE: cannot slow a winning creature (BALROG) */
  function* speed_monster(dir,y,x,spd){
    var $ret=false;
    var flag=false;
    $ret=false;
    flag=false;
    do{
      move(dir,{get v(){return y},set v($x){y=$x}},{get v(){return x},set v($x){x=$x}});
      var $w647=cave[y][x];
      if(($w647.fopen)){
        if((($w647.cptr>1))){
          flag=true;
          var $w648=m_list[$w647.cptr];
          var $w649=c_list[$w648.mptr];
          if(((spd>0))){
            $w648.cspeed=($w648.cspeed+spd);
            $w648.csleep=0;
          }else if(((randint(max_mons_level)>$w649.level))){
            $w648.cspeed=($w648.cspeed+spd);
            $w648.csleep=0;
          }else{
            (yield* msg_print((("The "+$w649.name_)+" is unaffected.")));
          }
          $ret=true;
        }
      }else{
        flag=true;
      }
    }while(!((flag)));
    return $ret;
  }
  /* Confuse a creature					-RAK- */
  function* confuse_monster(dir,y,x){
    var $ret=false;
    var flag=false;
    $ret=false;
    flag=false;
    do{
      move(dir,{get v(){return y},set v($x){y=$x}},{get v(){return x},set v($x){x=$x}});
      var $w650=cave[y][x];
      if(($w650.fopen)){
        if((($w650.cptr>1))){
          var $w651=m_list[$w650.cptr];
          var $w652=c_list[$w651.mptr];
          $ret=true;
          flag=true;
          if(((((randint(max_mons_level)<$w652.level))||((((4096&$w652.cdefense)>>>0)!==0))))){
            (yield* msg_print((("The "+$w652.name_)+" is unaffected.")));
          }else{
            $w651.confused=true;
            $w651.csleep=0;
            (yield* msg_print((("The "+$w652.name_)+" appears confused.")));
          }
        }
      }else{
        flag=true;
      }
    }while(!((flag)));
    return $ret;
  }
  /* Sleep a creature...					-RAK- */
  function* sleep_monster(dir,y,x){
    var $ret=false;
    var flag=false;
    $ret=false;
    flag=false;
    do{
      move(dir,{get v(){return y},set v($x){y=$x}},{get v(){return x},set v($x){x=$x}});
      var $w653=cave[y][x];
      if(($w653.fopen)){
        if((($w653.cptr>1))){
          var $w654=m_list[$w653.cptr];
          var $w655=c_list[$w654.mptr];
          $ret=true;
          flag=true;
          if(((((randint(max_mons_level)<$w655.level))||((((4096&$w655.cdefense)>>>0)!==0))))){
            (yield* msg_print((("The "+$w655.name_)+" is unaffected.")));
          }else{
            $w654.csleep=500;
            (yield* msg_print((("The "+$w655.name_)+" falls asleep.")));
          }
        }
      }else{
        flag=true;
      }
    }while(!((flag)));
    return $ret;
  }
  /* Turn stone to mud, delete wall....			-RAK- */
  function* wall_to_mud(dir,y,x){
    var $ret=false;
    var i1=0;
    var out_val="";
    var flag=false;
    $ret=false;
    flag=false;
    do{
      move(dir,{get v(){return y},set v($x){y=$x}},{get v(){return x},set v($x){x=$x}});
      var $w656=cave[y][x];
      if((in_bounds(y,x))){
        if(($in($w656.fval,wall_set))){
          flag=true;
          (yield* twall(y,x,1,0));
          if((test_light(y,x))){
            (yield* msg_print("The wall turns into mud."));
            $ret=true;
          }
        }else if((((($w656.tptr>0))&&(!($w656.fopen))))){
          flag=true;
          if((panel_contains(y,x))){
            if((test_light(y,x))){
              $assign(inventory[inven_max],t_list[$w656.tptr]);
              objdes({get v(){return out_val},set v($x){out_val=$x}},inven_max,false);
              (yield* msg_print((("The "+out_val)+" turns into mud.")));
              $ret=true;
            }
          }
          delete_object(y,x);
        }
        if((($w656.cptr>1))){
          var $w657=m_list[$w656.cptr];
          var $w658=c_list[$w657.mptr];
          if(((((512&$w658.cdefense)>>>0)!==0))){
            i1=(yield* mon_take_hit($w656.cptr,100));
            flag=true;
            if(($w657.ml)){
              if(((i1>0))){
                (yield* msg_print((("The "+$w658.name_)+" dies in a fit of agony.")));
              }else{
                (yield* msg_print((("The "+$w658.name_)+" wails out in pain!")));
              }
            }
          }
        }
      }else{
        flag=true;
      }
    }while(!((flag)));
    return $ret;
  }
  /* Destroy all traps and doors in a given direction	-RAK- */
  function* td_destroy2(dir,y,x){
    var $ret=false;
    $ret=false;
    do{
      move(dir,{get v(){return y},set v($x){y=$x}},{get v(){return x},set v($x){x=$x}});
      var $w659=cave[y][x];
      if((($w659.tptr>0))){
        var $w660=t_list[$w659.tptr];
        if(($in($w660.tval,$S47))){
          if((delete_object(y,x))){
            (yield* msg_print("There is a bright flash of light!"));
            $w659.fopen=true;
            $ret=true;
          }
        }
      }
    }while(!((!(cave[y][x].fopen))));
    return $ret;
  }
  /* Polymorph a monster					-RAK- */
  /* NOTE: cannot polymorph a winning creature (BALROG) */
  function* poly_monster(dir,y,x){
    var $ret=false;
    var dist=0;
    var flag=false;
    $ret=false;
    flag=false;
    dist=0;
    do{
      move(dir,{get v(){return y},set v($x){y=$x}},{get v(){return x},set v($x){x=$x}});
      dist=(dist+1);
      if(((dist<obj_S_bolt_range))){
        var $w661=cave[y][x];
        if(($w661.fopen)){
          if((($w661.cptr>1))){
            var $w662=c_list[m_list[$w661.cptr].mptr];
            if(((randint(max_mons_level)>$w662.level))){
              flag=true;
              delete_monster($w661.cptr);
              place_monster(y,x,(randint(m_level[max_mons_level])+m_level[0]),false);
              if((panel_contains(y,x))){
                if((test_light(y,x))){
                  $ret=true;
                }
              }
            }else{
              (yield* msg_print((("The "+$w662.name_)+" is unaffected.")));
            }
          }
        }else{
          flag=true;
        }
      }else{
        flag=true;
      }
    }while(!((flag)));
    return $ret;
  }
  /* Create a wall...					-RAK- */
  function* build_wall(dir,y,x){
    var $ret=false;
    var i1=0;
    $ret=false;
    i1=0;
    move(dir,{get v(){return y},set v($x){y=$x}},{get v(){return x},set v($x){x=$x}});
    while((((cave[y][x].fopen)&&((i1<10))))){
      var $w663=cave[y][x];
      if((($w663.tptr>0))){
        delete_object(y,x);
      }
      if((($w663.cptr>1))){
        (yield* mon_take_hit($w663.cptr,damroll("2d8")));
      }
      $w663.fval=((rock_wall2.ftval)&15);
      $w663.fopen=rock_wall2.ftopen;
      $w663.fm=false;
      if((test_light(y,x))){
        lite_spot(y,x);
      }
      i1=(i1+1);
      $ret=true;
      move(dir,{get v(){return y},set v($x){y=$x}},{get v(){return x},set v($x){x=$x}});
    }
    return $ret;
  }
  /* Replicate a creature					-RAK- */
  function clone_monster(dir,y,x){
    var $ret=false;
    var flag=false;
    flag=false;
    $ret=false;
    do{
      move(dir,{get v(){return y},set v($x){y=$x}},{get v(){return x},set v($x){x=$x}});
      var $w664=cave[y][x];
      if((($w664.cptr>1))){
        multiply_monster(y,x,m_list[$w664.cptr].mptr,false);
        if((panel_contains(y,x))){
          if((m_list[$w664.cptr].ml)){
            $ret=true;
          }
        }
        flag=true;
      }
    }while(!((((!(cave[y][x].fopen))||(flag)))));
    return $ret;
  }
  /* Move the creature record to a new location		-RAK- */
  function teleport_away(monptr,dis){
    var $ret=false;
    var yn=0;
    var xn=0;
    var ctr=0;
    var $w665=m_list[monptr];
    ctr=0;
    do{
      do{
        yn=($w665.fy+((randint(((2*dis)+1))-((dis+1)))));
        xn=($w665.fx+((randint(((2*dis)+1))-((dis+1)))));
      }while(!((in_bounds(yn,xn))));
      ctr=(ctr+1);
      if(((ctr>9))){
        ctr=0;
        dis=(dis+5);
      }
    }while(!((((cave[yn][xn].fopen)&&((cave[yn][xn].cptr===0))))));
    move_rec($w665.fy,$w665.fx,yn,xn);
    if((test_light($w665.fy,$w665.fx))){
      lite_spot($w665.fy,$w665.fx);
    }
    $w665.fy=yn;
    $w665.fx=xn;
    $w665.ml=false;
    $ret=true;
    return $ret;
  }
  /* Teleport player to spell casting creature		-RAK- */
  function* teleport_to(ny,nx){
    var $ret=false;
    var dis=0;
    var ctr=0;
    var y=0;
    var x=0;
    var i1=0;
    var i2=0;
    $ret=true;
    dis=1;
    ctr=0;
    do{
      y=(ny+((randint(((2*dis)+1))-((dis+1)))));
      x=(nx+((randint(((2*dis)+1))-((dis+1)))));
      ctr=(ctr+1);
      if(((ctr>9))){
        ctr=0;
        dis=(dis+1);
      }
    }while(!((((cave[y][x].fopen)&&((cave[y][x].cptr<2))))));
    move_rec(char_row,char_col,y,x);
    for(var $e666=(char_row+1),$ie666=(char_row-1);$ie666<=$e666;$ie666++){
      i1=$ie666;
      for(var $e667=(char_col+1),$ie667=(char_col-1);$ie667<=$e667;$ie667++){
        i2=$ie667;
        var $w668=cave[i1][i2];
        $w668.tl=false;
        if((!(test_light(i1,i2)))){
          unlite_spot(i1,i2);
        }
      }
    }
    if((test_light(char_row,char_col))){
      lite_spot(char_row,char_col);
    }
    char_row=y;
    char_col=x;
    (yield* move_char(5));
    (yield* creatures(false));
    return $ret;
  }
  /* Teleport all creatures in a given direction away	-RAK- */
  function teleport_monster(dir,y,x){
    var $ret=false;
    var yn=0;
    var xn=0;
    var flag=false;
    flag=false;
    $ret=false;
    do{
      move(dir,{get v(){return y},set v($x){y=$x}},{get v(){return x},set v($x){x=$x}});
      var $w669=cave[y][x];
      if((($w669.cptr>1))){
        teleport_away($w669.cptr,max_sight);
        $ret=true;
      }
    }while(!((((!(cave[y][x].fopen))||(flag)))));
    return $ret;
  }
  /* Delete all creatures within MAX_SIGHT distance	-RAK- */
  /* NOTE : Winning creatures cannot be genocided */
  function mass_genocide(){
    var $ret=false;
    var i1=0;
    var i2=0;
    $ret=false;
    i1=muptr;
    do{
      var $w670=m_list[i1];
      var $w671=c_list[$w670.mptr];
      i2=$w670.nptr;
      if((($w670.cdis<=max_sight))){
        if((((($w671.cdefense&2147483648)>>>0)===0))){
          delete_monster(i1);
          $ret=true;
        }
      }
      i1=i2;
    }while(!(((i1===0))));
    return $ret;
  }
  /* Delete all creatures of a given type from level.	-RAK- */
  /* This does not keep creatures of type from appearing later. */
  /* NOTE : Winning creatures that are genocided will be considered */
  /* as teleporting to another level.  Genocide will NOT win */
  /* the game... */
  function* genocide(){
    var $ret=false;
    var i1=0;
    var i2=0;
    var typ='\0';
    $ret=true;
    i1=muptr;
    if(((yield* get_com("Which type of creature do wish exterminated?",{get v(){return typ},set v($x){typ=$x}})))){
      do{
        var $w672=m_list[i1];
        var $w673=c_list[$w672.mptr];
        i2=$w672.nptr;
        if(((typ===c_list[$w672.mptr].cchar))){
          if((((($w673.cdefense&2147483648)>>>0)===0))){
            delete_monster(i1);
          }else{
            (yield* msg_print((("The "+$w673.name_)+" is unaffected.")));
          }
        }
        i1=i2;
      }while(!(((i1===0))));
    }
    return $ret;
  }
  /* Change speed of any creature player can see....	-RAK- */
  /* NOTE: cannot slow a winning creature (BALROG) */
  function* speed_monsters(spd){
    var $ret=false;
    var i1=0;
    var i2=0;
    i1=muptr;
    $ret=false;
    do{
      var $w674=m_list[i1];
      i2=$w674.nptr;
      if(($w674.ml)){
        var $w675=c_list[$w674.mptr];
        if(((spd>0))){
          $w674.cspeed=($w674.cspeed+spd);
          $w674.csleep=0;
          $ret=true;
        }else if(((randint(max_mons_level)>$w675.level))){
          $w674.cspeed=($w674.cspeed+spd);
          $w674.csleep=0;
          $ret=true;
        }else{
          (yield* msg_print((("The "+$w675.name_)+" is unaffected.")));
        }
      }
      i1=i2;
    }while(!(((i1===0))));
    return $ret;
  }
  /* Sleep any creature that player can see		-RAK- */
  function* sleep_monsters2(){
    var $ret=false;
    var i1=0;
    var i2=0;
    i1=muptr;
    $ret=false;
    do{
      var $w676=m_list[i1];
      var $w677=c_list[$w676.mptr];
      i2=$w676.nptr;
      $ret=true;
      if(($w676.ml)){
        if(((((randint(max_mons_level)<$w677.level))||((((4096&$w677.cdefense)>>>0)!==0))))){
          (yield* msg_print((("The "+$w677.name_)+" is unaffected.")));
        }else{
          $w676.csleep=500;
        }
      }
      i1=i2;
    }while(!(((i1===0))));
    return $ret;
  }
  /* Polymorph any creature that player can see... 	-RAK- */
  /* NOTE: cannot polymorph a winning creature (BALROG) */
  function mass_poly(){
    var $ret=false;
    var i1=0;
    var i2=0;
    var y=0;
    var x=0;
    i1=muptr;
    $ret=false;
    do{
      var $w678=m_list[i1];
      i2=$w678.nptr;
      if((($w678.cdis<max_sight))){
        var $w679=c_list[$w678.mptr];
        if((((($w679.cdefense&2147483648)>>>0)===0))){
          y=$w678.fy;
          x=$w678.fx;
          delete_monster(i1);
          place_monster(y,x,(randint(m_level[max_mons_level])+m_level[0]),false);
          $ret=true;
        }
      }
      i1=i2;
    }while(!(((i1===0))));
    return $ret;
  }
  /* Display evil creatures on current panel		-RAK- */
  function* detect_evil(){
    var $ret=false;
    var i1=0;
    var dummy='\0';
    var flag=false;
    flag=false;
    i1=muptr;
    do{
      var $w680=m_list[i1];
      if((panel_contains($w680.fy,$w680.fx))){
        if(((((4&c_list[$w680.mptr].cdefense)>>>0)!==0))){
          $w680.ml=true;
          print(c_list[$w680.mptr].cchar,$w680.fy,$w680.fx);
          flag=true;
        }
      }
      i1=m_list[i1].nptr;
    }while(!(((i1===0))));
    if((flag)){
      (yield* msg_print("You sense the presence of evil!"));
      (yield* msg_print(" "));
      msg_flag=false;
    }
    $ret=flag;
    return $ret;
  }
  /* Change players hit points in some manner		-RAK- */
  function* hp_player(num,kind){
    var $ret=false;
    $ret=false;
    var $w681=py.misc;
    if(((num<0))){
      (yield* take_hit(num,kind));
      if((($w681.chp<0))){
        (yield* msg_print("You feel your life slipping away!"));
      }
      $ret=true;
    }else if((($w681.chp<$w681.mhp))){
      $w681.chp=Math.fround(Math.fround($w681.chp+num));
      if((($w681.chp>$w681.mhp))){
        $w681.chp=Math.fround($w681.mhp);
      }
      prt_chp();
      switch(Math.trunc(Math.fround($rdiv(num,5)))){
        case 0:{
          (yield* msg_print("You feel a little better."));
          break;
        }
        case 1:case 2:{
          (yield* msg_print("You feel better."));
          break;
        }
        case 3:case 4:case 5:case 6:{
          (yield* msg_print("You feel much better."));
          break;
        }
        default:{
          (yield* msg_print("You feel very good."));
        }
      }
      $ret=true;
    }
    return $ret;
  }
  /* Cure players confusion				-RAK- */
  function cure_confusion(){
    var $ret=false;
    $ret=false;
    var $w683=py.flags;
    if((($w683.confused>1))){
      $w683.confused=1;
      $ret=true;
    }
    return $ret;
  }
  /* Cure players blindness				-RAK- */
  function cure_blindness(){
    var $ret=false;
    $ret=false;
    var $w684=py.flags;
    if((($w684.blind>1))){
      $w684.blind=1;
      $ret=true;
    }
    return $ret;
  }
  /* Cure poisoning					-RAK- */
  function cure_poison(){
    var $ret=false;
    $ret=false;
    var $w685=py.flags;
    if((($w685.poisoned>1))){
      $w685.poisoned=1;
      $ret=true;
    }
    return $ret;
  }
  /* Cure the players fear 				-RAK- */
  function remove_fear(){
    var $ret=false;
    $ret=false;
    var $w686=py.flags;
    if((($w686.afraid>1))){
      $w686.afraid=1;
      $ret=true;
    }
    return $ret;
  }
  /* This is a fun one.  In a given block, pick some walls and */
  /* turn them into open spots.  Pick some open spots and turn */
  /* them into walls.  An "Earthquake" effect...           -RAK- */
  function* earthquake(){
    var $ret=false;
    var i1=0;
    var i2=0;
    $ret=true;
    for(var $e687=(char_row+8),$ie687=(char_row-8);$ie687<=$e687;$ie687++){
      i1=$ie687;
      for(var $e688=(char_col+8),$ie688=(char_col-8);$ie688<=$e688;$ie688++){
        i2=$ie688;
        if(((((i1!==char_row))||((i2!==char_col))))){
          if((in_bounds(i1,i2))){
            if(((randint(8)===1))){
              var $w689=cave[i1][i2];
              if((($w689.tptr>0))){
                delete_object(i1,i2);
              }
              if((($w689.cptr>1))){
                (yield* mon_take_hit($w689.cptr,damroll("2d8")));
              }
              if(($in($w689.fval,wall_set))){
                if(((next_to4(i1,i2,$S27)>0))){
                  $w689.fval=((corr_floor2.ftval)&15);
                  $w689.fopen=corr_floor2.ftopen;
                }else{
                  $w689.fval=((corr_floor1.ftval)&15);
                  $w689.fopen=corr_floor1.ftopen;
                }
                if((test_light(i1,i2))){
                  unlite_spot(i1,i2);
                }
                $w689.pl=false;
                $w689.fm=false;
                if(($w689.tl)){
                  lite_spot(i1,i2);
                }
              }else if(($in($w689.fval,floor_set))){
                switch(randint(10)){
                  case 1:case 2:case 3:case 4:case 5:{
                    $w689.fval=((rock_wall3.ftval)&15);
                    $w689.fopen=rock_wall3.ftopen;
                    break;
                  }
                  case 6:case 7:case 8:{
                    $w689.fval=((rock_wall2.ftval)&15);
                    $w689.fopen=rock_wall2.ftopen;
                    break;
                  }
                  case 9:case 10:{
                    $w689.fval=((rock_wall1.ftval)&15);
                    $w689.fopen=rock_wall1.ftopen;
                    break;
                  }
                }
                $w689.fm=false;
              }
              if((test_light(i1,i2))){
                lite_spot(i1,i2);
              }
            }
          }
        }
      }
    }
    return $ret;
  }
  /* Evil creatures don't like this...                     -RAK- */
  function protect_evil(){
    var $ret=false;
    $ret=true;
    var $w691=py.flags;
    $w691.protevil=(($w691.protevil+randint(25))+(3*py.misc.lev));
    return $ret;
  }
  /* Create some high quality mush for the player. 	-RAK- */
  function create_food(){
    var $ret=false;
    $ret=true;
    var $w692=cave[char_row][char_col];
    if((($w692.tptr>0))){
      delete_object(char_row,char_col);
    }
    place_object(char_row,char_col);
    $assign(t_list[$w692.tptr],mush);
    return $ret;
  }
  /* Attempts to destroy a type of creature.  Success depends on */
  /* the creatures level VS. the player's level            -RAK- */
  function* dispell_creature(cflag,damage){
    var $ret=false;
    var i1=0;
    var m_next=0;
    i1=muptr;
    $ret=false;
    do{
      m_next=m_list[i1].nptr;
      var $w693=m_list[i1];
      if(($w693.ml)){
        if(((((cflag&c_list[$w693.mptr].cdefense)>>>0)!==0))){
          $w693.hp=($w693.hp-randint(damage));
          $w693.csleep=0;
          if((($w693.hp<0))){
            (yield* msg_print((("The "+c_list[$w693.mptr].name_)+" dissolves!")));
            (yield* monster_death($w693.fy,$w693.fx,c_list[$w693.mptr].cmove));
            var $w694=c_list[$w693.mptr];
            var $w695=py.misc;
            $w695.exp=($w695.exp+$round(Math.fround($w694.mexp*(Math.fround($rdiv($w694.level,$w695.lev))))));
            delete_monster(i1);
          }else{
            (yield* msg_print((("The "+c_list[$w693.mptr].name_)+" shudders.")));
          }
          $ret=true;
        }
      }
      i1=m_next;
    }while(!(((i1===0))));
    return $ret;
  }
  /* Attempt to turn (confuse) undead creatures... 	-RAK- */
  function* turn_undead(){
    var $ret=false;
    var i1=0;
    i1=muptr;
    $ret=false;
    do{
      var $w696=m_list[i1];
      if((panel_contains($w696.fy,$w696.fx))){
        if(($w696.ml)){
          if(((((8&c_list[$w696.mptr].cdefense)>>>0)!==0))){
            if(((((((py.misc.lev+1))>c_list[$w696.mptr].level))||((randint(5)===1))))){
              (yield* msg_print((("The "+c_list[$w696.mptr].name_)+" runs frantically!")));
              $w696.confused=true;
            }else{
              (yield* msg_print((("The "+c_list[$w696.mptr].name_)+" is unaffected.")));
            }
            $ret=true;
          }
        }
      }
      i1=m_list[i1].nptr;
    }while(!(((i1===0))));
    return $ret;
  }
  /* Leave a glyph of warding... Creatures will not pass over! -RAK- */
  function warding_glyph(){
    var $ret=false;
    var i1=0;
    $ret=true;
    var $w697=cave[char_row][char_col];
    if((($w697.tptr===0))){
      popt({get v(){return i1},set v($x){i1=$x}});
      $w697.tptr=i1;
      $assign(t_list[i1],scare_monster);
    }
    return $ret;
  }
  /* Lose a strength point.				-RAK- */
  function* lose_str(){
    var $ret=false;
    $ret=true;
    if((!(py.flags.sustain_str))){
      var $w698=py.stat;
      $w698.cstr=de_statp($w698.cstr);
      (yield* msg_print("You feel very sick."));
      prt_strength();
    }else{
      (yield* msg_print("You feel sick for a moment, then it passes."));
    }
    return $ret;
  }
  /* Lose an intelligence point.				-RAK- */
  function* lose_int(){
    var $ret=false;
    $ret=true;
    if((!(py.flags.sustain_int))){
      var $w699=py.stat;
      $w699.cint=de_statp($w699.cint);
      (yield* msg_print("You become very dizzy."));
      prt_intelligence();
    }else{
      (yield* msg_print("You become dizzy for a moment, then it passes."));
    }
    return $ret;
  }
  /* Lose a wisdom point.					-RAK- */
  function* lose_wis(){
    var $ret=false;
    $ret=true;
    if((!(py.flags.sustain_wis))){
      var $w700=py.stat;
      $w700.cwis=de_statp($w700.cwis);
      (yield* msg_print("You feel very naive."));
      prt_wisdom();
    }else{
      (yield* msg_print("You feel naive for a moment, then it passes."));
    }
    return $ret;
  }
  /* Lose a dexterity point.				-RAK- */
  function* lose_dex(){
    var $ret=false;
    $ret=true;
    if((!(py.flags.sustain_dex))){
      var $w701=py.stat;
      $w701.cdex=de_statp($w701.cdex);
      (yield* msg_print("You feel very sore."));
      prt_dexterity();
    }else{
      (yield* msg_print("You feel sore for a moment, then it passes."));
    }
    return $ret;
  }
  /* Lose a constitution point.				-RAK- */
  function* lose_con(){
    var $ret=false;
    $ret=true;
    if((!(py.flags.sustain_con))){
      var $w702=py.stat;
      $w702.ccon=de_statp($w702.ccon);
      (yield* msg_print("You feel very sick."));
      prt_constitution();
    }else{
      (yield* msg_print("You feel sick for a moment, then it passes."));
    }
    return $ret;
  }
  /* Lose a charisma point.				-RAK- */
  function* lose_chr(){
    var $ret=false;
    $ret=true;
    if((!(py.flags.sustain_chr))){
      var $w703=py.stat;
      $w703.cchr=de_statp($w703.cchr);
      (yield* msg_print("Your skin starts to itch."));
      prt_charisma();
    }else{
      (yield* msg_print("Your skin starts to itch, but feels better now."));
    }
    return $ret;
  }
  /* Lose experience					-RAK- */
  function* lose_exp(amount){
    var i1=0;
    var i2=0;
    var av_hp=0;
    var lose_hp=0;
    var av_mn=0;
    var lose_mn=0;
    var flag=false;
    var $w704=py.misc;
    if(((amount>$w704.exp))){
      $w704.exp=0;
    }else{
      $w704.exp=($w704.exp-amount);
    }
    i1=1;
    while(((Math.trunc(Math.fround(player_exp[i1]*$w704.expfact))<=$w704.exp))){
      i1=(i1+1);
    }
    i2=($w704.lev-i1);
    while(((i2>0))){
      av_hp=Math.trunc(Math.fround($rdiv($w704.mhp,$w704.lev)));
      av_mn=Math.trunc(Math.fround($rdiv($w704.mana,$w704.lev)));
      $w704.lev=($w704.lev-1);
      i2=(i2-1);
      lose_hp=randint(((av_hp*2)-1));
      lose_mn=randint(((av_mn*2)-1));
      $w704.mhp=($w704.mhp-lose_hp);
      $w704.mana=($w704.mana-lose_mn);
      if((($w704.mhp<1))){
        $w704.mhp=1;
      }
      if((($w704.mana<0))){
        $w704.mana=0;
      }
      var $w705=class_[$w704.pclass];
      if(((($w705.mspell)||($w705.pspell)))){
        i1=32;
        flag=false;
        do{
          i1=(i1-1);
          if((magic_spell[$w704.pclass][i1].learned)){
            flag=true;
          }
        }while(!((((flag)||((i1<2))))));
        if((flag)){
          magic_spell[$w704.pclass][i1].learned=false;
          if(($w705.mspell)){
            (yield* msg_print("You have forgotten a magic spell!"));
          }else{
            (yield* msg_print("You have forgotten a prayer!"));
          }
        }
      }
    }
    if((($w704.chp>$w704.mhp))){
      $w704.chp=Math.fround($w704.mhp);
    }
    if((($w704.cmana>$w704.mana))){
      $w704.cmana=Math.fround($w704.mana);
    }
    $w704.title=$cap(player_title[$w704.pclass][$w704.lev],80);
    (yield* prt_experience());
    prt_mhp();
    prt_chp();
    prt_cmana();
    prt_level();
    prt_title();
  }
  /* Slow Poison						-RAK- */
  function* slow_poison(){
    var $ret=false;
    $ret=false;
    var $w706=py.flags;
    if((($w706.poisoned>0))){
      $w706.poisoned=Math.trunc(Math.fround($rdiv($w706.poisoned,Math.fround(2.0))));
      if((($w706.poisoned<1))){
        $w706.poisoned=1;
      }
      $ret=true;
      (yield* msg_print("The effects of the poison has been reduced."));
    }
    return $ret;
  }
  /* Bless 						-RAK- */
  function bless(amount){
    var $ret=false;
    $ret=true;
    var $w707=py.flags;
    $w707.blessed=($w707.blessed+amount);
    return $ret;
  }
  /* Detect Invisible for period of time			-RAK- */
  function detect_inv2(amount){
    var $ret=false;
    $ret=true;
    var $w708=py.flags;
    $w708.detect_inv=($w708.detect_inv+amount);
    return $ret;
  }
  /* The spell of destruction...				-RAK- */
  /* NOTE : Winning creatures that are deleted will be considered */
  /* as teleporting to another level.  This will NOT win the */
  /* game... */
  function* destroy_area(y,x){
    var $ret=false;
    var i1=0;
    var i2=0;
    var i3=0;
    function replace_spot(y,x,typ){
      var $w709=cave[y][x];
      switch(typ){
        case 1:case 2:case 3:{
          $w709.fval=((corr_floor1.ftval)&15);
          $w709.fopen=corr_floor1.ftopen;
          break;
        }
        case 4:case 7:case 10:{
          $w709.fval=((rock_wall1.ftval)&15);
          $w709.fopen=rock_wall1.ftopen;
          break;
        }
        case 5:case 8:case 11:{
          $w709.fval=((rock_wall2.ftval)&15);
          $w709.fopen=rock_wall2.ftopen;
          break;
        }
        case 6:case 9:case 12:{
          $w709.fval=((rock_wall3.ftval)&15);
          $w709.fopen=rock_wall3.ftopen;
          break;
        }
      }
      $w709.pl=false;
      $w709.fm=false;
      if((($w709.tptr>0))){
        delete_object(y,x);
      }
      if((($w709.cptr>1))){
        delete_monster($w709.cptr);
      }
    }
    $ret=true;
    if(((dun_level>0))){
      for(var $e711=((y+15)),$ie711=((y-15));$ie711<=$e711;$ie711++){
        i1=$ie711;
        for(var $e712=((x+15)),$ie712=((x-15));$ie712<=$e712;$ie712++){
          i2=$ie712;
          if((in_bounds(i1,i2))){
            if(((cave[i1][i2].fval!==15))){
              i3=distance(i1,i2,y,x);
              if(((i3<13))){
                replace_spot(i1,i2,randint(6));
              }else if(((i3<16))){
                replace_spot(i1,i2,randint(9));
              }
            }
          }
        }
      }
    }
    (yield* msg_print("There is a searing blast of light!"));
    py.flags.blind=((py.flags.blind+10)+randint(10));
    return $ret;
  }
  /* Enchants a plus onto an item...			-RAK- */
  function enchant(pluses){
    var $ret=false;
    var chance=0;
    chance=0;
    $ret=false;
    if(((pluses.v>0))){
      switch(pluses.v){
        case 1:{
          chance=40;
          break;
        }
        case 2:{
          chance=100;
          break;
        }
        case 3:{
          chance=200;
          break;
        }
        case 4:{
          chance=400;
          break;
        }
        case 5:{
          chance=600;
          break;
        }
        case 6:{
          chance=700;
          break;
        }
        case 7:{
          chance=800;
          break;
        }
        case 8:{
          chance=900;
          break;
        }
        case 9:{
          chance=950;
          break;
        }
        default:{
          chance=995;
        }
      }
    }
    if(((randint(1000)>chance))){
      pluses.v=(pluses.v+1);
      $ret=true;
    }
    return $ret;
  }
  /* Removes curses from items in inventory		-RAK- */
  function remove_curse(){
    var $ret=false;
    var i1=0;
    $ret=false;
    for(var $e714=32,$ie714=23;$ie714<=$e714;$ie714++){
      i1=$ie714;
      var $w715=inventory[i1];
      if(((((2147483648&$w715.flags)>>>0)!==0))){
        $w715.flags=((2147483647&$w715.flags)>>>0);
        py_bonuses($clone(blank_treasure),0);
        $ret=true;
      }
    }
    return $ret;
  }
  /* Restores any drained experience			-RAK- */
  function* restore_level(){
    var $ret=false;
    $ret=false;
    var $w716=py.misc;
    if((($w716.max_exp>$w716.exp))){
      $ret=true;
      (yield* msg_print("You feel your life energies returning..."));
      while((($w716.exp<$w716.max_exp))){
        $w716.exp=$w716.max_exp;
        (yield* prt_experience());
      }
    }
    return $ret;
  }
  /* Wizard and debug routines */
  /* Print Moria credits					-RAK- */
  function* game_version(){
    var tmp_str="";
    clear(1,1);
    tmp_str=$cap($ws("               Moria Version ",0)+$wr(cur_version,3,2),80);
    put_buffer(tmp_str,1,1);
    put_buffer("Version 0.1  : 03/25/83",2,1);
    put_buffer("Version 1.0  : 05/01/84",3,1);
    put_buffer("Version 2.0  : 07/10/84",4,1);
    put_buffer("Version 3.0  : 11/20/84",5,1);
    put_buffer("Version 4.0  : 01/20/85",6,1);
    put_buffer("Modules :",8,1);
    put_buffer("     V1.0  Dungeon Generator      - RAK",9,1);
    put_buffer("           Character Generator    - RAK & JWT",10,1);
    put_buffer("           Moria Module           - RAK",11,1);
    put_buffer("           Miscellaneous          - RAK & JWT",12,1);
    put_buffer("     V2.0  Town Level & Misc      - RAK",13,1);
    put_buffer("     V3.0  Internal Help & Misc   - RAK",14,1);
    put_buffer("     V4.0  Source Release Version - RAK",15,1);
    put_buffer("Robert Alan Koeneke               Jimmey Wayne Todd Jr.",17,1);
    put_buffer("Student/University of Oklahoma    Student/University of Oklahoma",18,1);
    put_buffer("119 Crystal Bend                  1912 Tiffany Dr.",19,1);
    put_buffer("Norman, OK 73069                  Norman, OK  73071",20,1);
    put_buffer("(405)-321-2925                    (405) 360-6792",21,1);
    (yield* pause(24));
    draw_cave();
  }
  /* Light up the dungeon					-RAK- */
  function wizard_light(){
    var i1=0;
    var i2=0;
    var i3=0;
    var i4=0;
    var flag=false;
    if((cave[char_row][char_col].pl)){
      flag=false;
    }else{
      flag=true;
    }
    for(var $e717=cur_height,$ie717=1;$ie717<=$e717;$ie717++){
      i1=$ie717;
      for(var $e718=cur_width,$ie718=1;$ie718<=$e718;$ie718++){
        i2=$ie718;
        if(($in(cave[i1][i2].fval,floor_set))){
          for(var $e719=(i1+1),$ie719=(i1-1);$ie719<=$e719;$ie719++){
            i3=$ie719;
            for(var $e720=(i2+1),$ie720=(i2-1);$ie720<=$e720;$ie720++){
              i4=$ie720;
              var $w721=cave[i3][i4];
              $w721.pl=flag;
              if((!(flag))){
                $w721.fm=false;
              }
            }
          }
        }
      }
    }
    prt_map();
  }
  /* Wizard routine for gaining on stats			-RAK- */
  function* change_character(){
    var tmp_val=0;
    var tmp_str="";
    var $w722=py.stat;
    prt("(3 - 118) Strength     = ",1,1);
    (yield* get_string({get v(){return tmp_str},set v($x){tmp_str=$x}},1,26,10));
    tmp_val=(-999);
    (($rv=$readvs(tmp_str,["int"],true)),tmp_val=$rv[0]);
    if(((((tmp_val>2))&&((tmp_val<119))))){
      $w722.str=tmp_val;
      $w722.cstr=tmp_val;
      prt_strength();
    }
    prt("(3 - 118) Intelligence = ",1,1);
    (yield* get_string({get v(){return tmp_str},set v($x){tmp_str=$x}},1,26,10));
    tmp_val=(-999);
    (($rv=$readvs(tmp_str,["int"],true)),tmp_val=$rv[0]);
    if(((((tmp_val>2))&&((tmp_val<119))))){
      $w722.int=tmp_val;
      $w722.cint=tmp_val;
      prt_intelligence();
    }
    prt("(3 - 118) Wisdom       = ",1,1);
    (yield* get_string({get v(){return tmp_str},set v($x){tmp_str=$x}},1,26,10));
    tmp_val=(-999);
    (($rv=$readvs(tmp_str,["int"],true)),tmp_val=$rv[0]);
    if(((((tmp_val>2))&&((tmp_val<119))))){
      $w722.wis=tmp_val;
      $w722.cwis=tmp_val;
      prt_wisdom();
    }
    prt("(3 - 118) Dexterity    = ",1,1);
    (yield* get_string({get v(){return tmp_str},set v($x){tmp_str=$x}},1,26,10));
    tmp_val=(-999);
    (($rv=$readvs(tmp_str,["int"],true)),tmp_val=$rv[0]);
    if(((((tmp_val>2))&&((tmp_val<119))))){
      $w722.dex=tmp_val;
      $w722.cdex=tmp_val;
      prt_dexterity();
    }
    prt("(3 - 118) Constitution = ",1,1);
    (yield* get_string({get v(){return tmp_str},set v($x){tmp_str=$x}},1,26,10));
    tmp_val=(-999);
    (($rv=$readvs(tmp_str,["int"],true)),tmp_val=$rv[0]);
    if(((((tmp_val>2))&&((tmp_val<119))))){
      $w722.con=tmp_val;
      $w722.ccon=tmp_val;
      prt_constitution();
    }
    prt("(3 - 118) Charisma     = ",1,1);
    (yield* get_string({get v(){return tmp_str},set v($x){tmp_str=$x}},1,26,10));
    tmp_val=(-999);
    (($rv=$readvs(tmp_str,["int"],true)),tmp_val=$rv[0]);
    if(((((tmp_val>2))&&((tmp_val<119))))){
      $w722.chr=tmp_val;
      $w722.cchr=tmp_val;
      prt_charisma();
    }
    var $w723=py.misc;
    prt("(1 - 32767) Hit points = ",1,1);
    (yield* get_string({get v(){return tmp_str},set v($x){tmp_str=$x}},1,26,10));
    tmp_val=(-1);
    (($rv=$readvs(tmp_str,["int"],true)),tmp_val=$rv[0]);
    if(((((tmp_val>0))&&((tmp_val<32768))))){
      $w723.mhp=tmp_val;
      $w723.chp=Math.fround(tmp_val);
      prt_mhp();
      prt_chp();
    }
    prt("(0 - 32767) Mana       = ",1,1);
    (yield* get_string({get v(){return tmp_str},set v($x){tmp_str=$x}},1,26,10));
    tmp_val=(-999);
    (($rv=$readvs(tmp_str,["int"],true)),tmp_val=$rv[0]);
    if(((((tmp_val>(-1)))&&((tmp_val<32768))))){
      $w723.mana=tmp_val;
      $w723.cmana=Math.fround(tmp_val);
      prt_cmana();
    }
    tmp_str=$cap($ws("Current=",0)+$wi($w723.srh,1)+$ws("  (0-200) Searching = ",0),80);
    tmp_val=tmp_str.length;
    prt(tmp_str,1,1);
    (yield* get_string({get v(){return tmp_str},set v($x){tmp_str=$x}},1,(tmp_val+1),10));
    tmp_val=(-999);
    (($rv=$readvs(tmp_str,["int"],true)),tmp_val=$rv[0]);
    if(((((tmp_val>(-1)))&&((tmp_val<201))))){
      $w723.srh=tmp_val;
    }
    tmp_str=$cap($ws("Current=",0)+$wi($w723.stl,1)+$ws("  (0-10) Stealth = ",0),80);
    tmp_val=tmp_str.length;
    prt(tmp_str,1,1);
    (yield* get_string({get v(){return tmp_str},set v($x){tmp_str=$x}},1,(tmp_val+1),10));
    tmp_val=(-999);
    (($rv=$readvs(tmp_str,["int"],true)),tmp_val=$rv[0]);
    if(((((tmp_val>(-1)))&&((tmp_val<11))))){
      $w723.stl=tmp_val;
    }
    tmp_str=$cap($ws("Current=",0)+$wi($w723.disarm,1)+$ws("  (0-200) Disarming = ",0),80);
    tmp_val=tmp_str.length;
    prt(tmp_str,1,1);
    (yield* get_string({get v(){return tmp_str},set v($x){tmp_str=$x}},1,(tmp_val+1),10));
    tmp_val=(-999);
    (($rv=$readvs(tmp_str,["int"],true)),tmp_val=$rv[0]);
    if(((((tmp_val>(-1)))&&((tmp_val<201))))){
      $w723.disarm=tmp_val;
    }
    tmp_str=$cap($ws("Current=",0)+$wi($w723.save,1)+$ws("  (0-100) Save = ",0),80);
    tmp_val=tmp_str.length;
    prt(tmp_str,1,1);
    (yield* get_string({get v(){return tmp_str},set v($x){tmp_str=$x}},1,(tmp_val+1),10));
    tmp_val=(-999);
    (($rv=$readvs(tmp_str,["int"],true)),tmp_val=$rv[0]);
    if(((((tmp_val>(-1)))&&((tmp_val<201))))){
      $w723.save=tmp_val;
    }
    tmp_str=$cap($ws("Current=",0)+$wi($w723.bth,1)+$ws("  (0-200) Base to hit = ",0),80);
    tmp_val=tmp_str.length;
    prt(tmp_str,1,1);
    (yield* get_string({get v(){return tmp_str},set v($x){tmp_str=$x}},1,(tmp_val+1),10));
    tmp_val=(-999);
    (($rv=$readvs(tmp_str,["int"],true)),tmp_val=$rv[0]);
    if(((((tmp_val>(-1)))&&((tmp_val<201))))){
      $w723.bth=tmp_val;
    }
    tmp_str=$cap($ws("Current=",0)+$wi($w723.bthb,1)+$ws("  (0-200) Bows/Throwing = ",0),80);
    tmp_val=tmp_str.length;
    prt(tmp_str,1,1);
    (yield* get_string({get v(){return tmp_str},set v($x){tmp_str=$x}},1,(tmp_val+1),10));
    tmp_val=(-999);
    (($rv=$readvs(tmp_str,["int"],true)),tmp_val=$rv[0]);
    if(((((tmp_val>(-1)))&&((tmp_val<201))))){
      $w723.bthb=tmp_val;
    }
    tmp_str=$cap($ws("Current=",0)+$wi($w723.au,1)+$ws("  Gold = ",0),80);
    tmp_val=tmp_str.length;
    prt(tmp_str,1,1);
    (yield* get_string({get v(){return tmp_str},set v($x){tmp_str=$x}},1,(tmp_val+1),10));
    tmp_val=(-999);
    (($rv=$readvs(tmp_str,["int"],true)),tmp_val=$rv[0]);
    if(((tmp_val>(-1)))){
      $w723.au=tmp_val;
      prt_gold();
    }
    erase_line(msg_line,msg_line);
    py_bonuses($clone(blank_treasure),0);
  }
  /* Wizard routine for creating objects			-RAK- */
  function* wizard_create(){
    var tmp_val=0;
    var tmp_str="";
    var flag=false;
    (yield* msg_print("Warning: This routine can cause fatal error."));
    (yield* msg_print(" "));
    msg_flag=false;
    var $w724=inventory[inven_max];
    prt("Name   : ",1,1);
    if(((yield* get_string({get v(){return tmp_str},set v($x){tmp_str=$x}},1,10,40)))){
      $w724.name_=$cap(tmp_str,68);
    }else{
      $w724.name_=$cap("& Wizard Object!",68);
    }
    do{
      prt("Tval   : ",1,1);
      (yield* get_string({get v(){return tmp_str},set v($x){tmp_str=$x}},1,10,10));
      tmp_val=0;
      (($rv=$readvs(tmp_str,["int"],true)),tmp_val=$rv[0]);
      flag=true;
      switch(tmp_val){
        case 1:case 13:case 15:{
          $w724.tchar="~";
          break;
        }
        case 2:{
          $w724.tchar="&";
          break;
        }
        case 10:{
          $w724.tchar="{";
          break;
        }
        case 11:{
          $w724.tchar="{";
          break;
        }
        case 12:{
          $w724.tchar="{";
          break;
        }
        case 20:{
          $w724.tchar="}";
          break;
        }
        case 21:{
          $w724.tchar="/";
          break;
        }
        case 22:{
          $w724.tchar="\\";
          break;
        }
        case 23:{
          $w724.tchar="|";
          break;
        }
        case 25:{
          $w724.tchar="\\";
          break;
        }
        case 30:{
          $w724.tchar="]";
          break;
        }
        case 31:{
          $w724.tchar="]";
          break;
        }
        case 32:{
          $w724.tchar="(";
          break;
        }
        case 33:{
          $w724.tchar="]";
          break;
        }
        case 34:{
          $w724.tchar=")";
          break;
        }
        case 35:{
          $w724.tchar="[";
          break;
        }
        case 36:{
          $w724.tchar="(";
          break;
        }
        case 40:{
          $w724.tchar="\"";
          break;
        }
        case 45:{
          $w724.tchar="=";
          break;
        }
        case 55:{
          $w724.tchar="_";
          break;
        }
        case 60:{
          $w724.tchar="-";
          break;
        }
        case 65:{
          $w724.tchar="-";
          break;
        }
        case 70:case 71:{
          $w724.tchar="?";
          break;
        }
        case 75:case 76:case 77:{
          $w724.tchar="!";
          break;
        }
        case 80:{
          $w724.tchar=",";
          break;
        }
        case 90:{
          $w724.tchar="?";
          break;
        }
        case 91:{
          $w724.tchar="?";
          break;
        }
        default:{
          flag=false;
        }
      }
    }while(!((flag)));
    $w724.tval=tmp_val;
    prt("Subval : ",1,1);
    (yield* get_string({get v(){return tmp_str},set v($x){tmp_str=$x}},1,10,10));
    tmp_val=1;
    (($rv=$readvs(tmp_str,["int"],true)),tmp_val=$rv[0]);
    $w724.subval=tmp_val;
    prt("Weight : ",1,1);
    (yield* get_string({get v(){return tmp_str},set v($x){tmp_str=$x}},1,10,10));
    tmp_val=1;
    (($rv=$readvs(tmp_str,["int"],true)),tmp_val=$rv[0]);
    $w724.weight=tmp_val;
    prt("Number : ",1,1);
    (yield* get_string({get v(){return tmp_str},set v($x){tmp_str=$x}},1,10,10));
    tmp_val=1;
    (($rv=$readvs(tmp_str,["int"],true)),tmp_val=$rv[0]);
    $w724.number=tmp_val;
    prt("Damage : ",1,1);
    (yield* get_string({get v(){return tmp_str},set v($x){tmp_str=$x}},1,10,5));
    $w724.damage=$cap(tmp_str,5);
    prt("+To hit: ",1,1);
    (yield* get_string({get v(){return tmp_str},set v($x){tmp_str=$x}},1,10,10));
    tmp_val=0;
    (($rv=$readvs(tmp_str,["int"],true)),tmp_val=$rv[0]);
    $w724.tohit=tmp_val;
    prt("+To dam: ",1,1);
    (yield* get_string({get v(){return tmp_str},set v($x){tmp_str=$x}},1,10,10));
    tmp_val=0;
    (($rv=$readvs(tmp_str,["int"],true)),tmp_val=$rv[0]);
    $w724.todam=tmp_val;
    prt("AC     : ",1,1);
    (yield* get_string({get v(){return tmp_str},set v($x){tmp_str=$x}},1,10,10));
    tmp_val=0;
    (($rv=$readvs(tmp_str,["int"],true)),tmp_val=$rv[0]);
    $w724.ac=tmp_val;
    prt("+To AC : ",1,1);
    (yield* get_string({get v(){return tmp_str},set v($x){tmp_str=$x}},1,10,10));
    tmp_val=0;
    (($rv=$readvs(tmp_str,["int"],true)),tmp_val=$rv[0]);
    $w724.toac=tmp_val;
    prt("P1     : ",1,1);
    (yield* get_string({get v(){return tmp_str},set v($x){tmp_str=$x}},1,10,10));
    tmp_val=0;
    (($rv=$readvs(tmp_str,["int"],true)),tmp_val=$rv[0]);
    $w724.p1=tmp_val;
    prt("Flags (In HEX): ",1,1);
    $w724.flags=(yield* get_hex_value(1,17,8));
    prt("Cost : ",1,1);
    (yield* get_string({get v(){return tmp_str},set v($x){tmp_str=$x}},1,10,10));
    tmp_val=0;
    (($rv=$readvs(tmp_str,["int"],true)),tmp_val=$rv[0]);
    $w724.cost=tmp_val;
    if(((yield* get_com("Allocate? (Y/N)",{get v(){return command},set v($x){command=$x}})))){
      switch(command){
        case "y":case "Y":{
          popt({get v(){return tmp_val},set v($x){tmp_val=$x}});
          $assign(t_list[tmp_val],inventory[inven_max]);
          var $w726=cave[char_row][char_col];
          if((($w726.tptr>0))){
            delete_object(char_row,char_col);
          }
          $w726.tptr=tmp_val;
          (yield* msg_print("Allocated..."));
          break;
        }
        default:{
          (yield* msg_print("Aborted..."));
        }
      }
    }
    $assign(inventory[inven_max],blank_treasure);
  }
  /* Creature movement and attacks */
  /* Creatures movement and attacking are done from here	-RAK- */
  function* creatures(attack){
    var i1=0;
    var i2=0;
    var i3=0;
    var moldy=0;
    var moldx=0;
    /* Updates screen when monsters move about		-RAK- */
    function* update_mon(monptr){
      var flag=false;
      var $w728=m_list[monptr];
      var $w729=cave[$w728.fy][$w728.fx];
      flag=false;
      if((($w728.cdis<=max_sight))){
        if(((py.flags.blind<1))){
          if((panel_contains($w728.fy,$w728.fx))){
            /* Wizard sight... */
            if((wizard2)){
              flag=true;
            /* Normal sight... */
            }else if((los(char_row,char_col,$w728.fy,$w728.fx))){
              var $w730=c_list[$w728.mptr];
              if(((($w729.pl)||($w729.tl)))){
                if((py.flags.see_inv)){
                  flag=true;
                }else if(((((65536&$w730.cmove)>>>0)===0))){
                  flag=true;
                }
              /* Infra vision... */
              }else if(((py.flags.see_infra>0))){
                if((($w728.cdis<=py.flags.see_infra))){
                  if(((((8192&$w730.cdefense)>>>0)!==0))){
                    flag=true;
                  }
                }
              }
            }
          }
        }
      }
      /* Light it up... */
      if((flag)){
        if((!($w728.ml))){
          print(c_list[$w728.mptr].cchar,$w728.fy,$w728.fx);
          $w728.ml=true;
          if((search_flag)){
            (yield* search_off());
          }
          if(((py.flags.rest>0))){
            rest_off();
          }
          flush();
          if((find_flag)){
            find_flag=false;
            (yield* move_char(5));
          }
        }
      /* Turn it off... */
      }else if(($w728.ml)){
        $w728.ml=false;
        if(((($w729.tl)||($w729.pl)))){
          lite_spot($w728.fy,$w728.fx);
        }else{
          unlite_spot($w728.fy,$w728.fx);
        }
      }
    }
    /* Move the criiters about the dungeon			-RAK- */
    function* mon_move(monptr){
      var $ret=false;
      var i1=0;
      var i2=0;
      var i3=0;
      var mm=$zeros(5);
      var out_val="";
      var move_test=false;
      /* Choose correct directions for monster movement	-RAK- */
      function get_moves(monptr,mm){
        var y=0;
        var ay=0;
        var x=0;
        var ax=0;
        var move_val=0;
        y=(m_list[monptr].fy-char_row);
        x=(m_list[monptr].fx-char_col);
        ay=Math.abs(y);
        ax=Math.abs(x);
        if(((y<0))){
          move_val=8;
        }else{
          move_val=0;
        }
        if(((x>0))){
          move_val=(move_val+4);
        }
        if(((ay>(Math.fround(ax*Math.fround(1.7321)))))){
          move_val=(move_val+2);
        }else if(((ax>(Math.fround(ay*Math.fround(1.7321)))))){
          move_val=(move_val+1);
        }
        switch(move_val){
          case 0:{
            mm[1]=9;
            if(((ay>ax))){
              mm[2]=8;
              mm[3]=6;
              mm[4]=7;
              mm[5]=3;
            }else{
              mm[2]=6;
              mm[3]=8;
              mm[4]=3;
              mm[5]=7;
            }
            break;
          }
          case 1:case 9:{
            mm[1]=6;
            if(((y<0))){
              mm[2]=3;
              mm[3]=9;
              mm[4]=2;
              mm[5]=8;
            }else{
              mm[2]=9;
              mm[3]=3;
              mm[4]=8;
              mm[5]=2;
            }
            break;
          }
          case 2:case 6:{
            mm[1]=8;
            if(((x<0))){
              mm[2]=9;
              mm[3]=7;
              mm[4]=6;
              mm[5]=4;
            }else{
              mm[2]=7;
              mm[3]=9;
              mm[4]=4;
              mm[5]=6;
            }
            break;
          }
          case 4:{
            mm[1]=7;
            if(((ay>ax))){
              mm[2]=8;
              mm[3]=4;
              mm[4]=9;
              mm[5]=1;
            }else{
              mm[2]=4;
              mm[3]=8;
              mm[4]=1;
              mm[5]=9;
            }
            break;
          }
          case 5:case 13:{
            mm[1]=4;
            if(((y<0))){
              mm[2]=1;
              mm[3]=7;
              mm[4]=8;
              mm[5]=2;
            }else{
              mm[2]=7;
              mm[3]=1;
              mm[4]=2;
              mm[5]=8;
            }
            break;
          }
          case 8:{
            mm[1]=3;
            if(((ay>ax))){
              mm[2]=2;
              mm[3]=6;
              mm[4]=1;
              mm[5]=9;
            }else{
              mm[2]=6;
              mm[3]=2;
              mm[4]=9;
              mm[5]=1;
            }
            break;
          }
          case 10:case 14:{
            mm[1]=2;
            if(((x<0))){
              mm[2]=1;
              mm[3]=3;
              mm[4]=4;
              mm[5]=6;
            }else{
              mm[2]=3;
              mm[3]=1;
              mm[4]=6;
              mm[5]=4;
            }
            break;
          }
          case 12:{
            mm[1]=1;
            if(((ay>ax))){
              mm[2]=2;
              mm[3]=4;
              mm[4]=3;
              mm[5]=7;
            }else{
              mm[2]=4;
              mm[3]=2;
              mm[4]=7;
              mm[5]=3;
            }
            break;
          }
        }
      }
      /* Make an attack on the player (chuckle...)		-RAK- */
      function* make_attack(monptr){
        var xpos=0;
        var atype=0;
        var adesc=0;
        var dam=0;
        var i1=0;
        var i2=0;
        var i3=0;
        var i4=0;
        var attstr="";
        var attx="";
        var cdesc="";
        var mdesc="";
        var ddesc="";
        var damstr="";
        var flag=false;
        var $w732=m_list[monptr];
        var $w733=c_list[$w732.mptr];
        attstr=$cap($w733.damage,80);
        if(((((((65536&$w733.cmove)>>>0)!==0))&&(!(py.flags.see_inv))))){
          cdesc=$cap("It ",80);
        }else if(((py.flags.blind>0))){
          cdesc=$cap("It ",80);
        }else if((!($w732.ml))){
          cdesc=$cap("It ",80);
        }else{
          cdesc=$cap((("The "+$w733.name_)+" "),80);
        }
        /* For 'DIED_FROM' string */
        if(((((2147483648&$w733.cmove)>>>0)!==0))){
          ddesc=$cap(("The "+$w733.name_),80);
        }else{
          ddesc=$cap(("& "+$w733.name_),80);
        }
        inventory[inven_max].name_=$cap(ddesc,68);
        inventory[inven_max].number=1;
        objdes({get v(){return ddesc},set v($x){ddesc=$x}},inven_max,true);
        /* End DIED_FROM */
        while(((attstr.length>0))){
          xpos=$index(attstr,"|");
          if(((xpos>0))){
            attx=$cap($substr(attstr,1,(xpos-1)),80);
            attstr=$cap($substr(attstr,(xpos+1),(attstr.length-xpos)),80);
          }else{
            attx=$cap(attstr,80);
            attstr=$cap("",80);
          }
          (($rv=$readvs(attx,["int", "int", "str"],false)),atype=$rv[0],adesc=$rv[1],damstr=$cap($rv[2],5));
          flag=false;
          if(((py.flags.protevil>0))){
            if((((($w733.cdefense&4)>>>0)!==0))){
              if(((((py.misc.lev+1))>$w733.level))){
                atype=99;
                adesc=99;
              }
            }
          }
          var $w734=py.misc;
          switch(atype){
            case 1:{
              if(((yield* test_hit(60,$w733.level,0,($w734.pac+$w734.ptoac))))){
                /* Normal attack */
                flag=true;
              }
              break;
            }
            case 2:{
              if(((yield* test_hit((-3),$w733.level,0,($w734.pac+$w734.ptoac))))){
                /* Poison Strength */
                flag=true;
              }
              break;
            }
            case 3:{
              if(((yield* test_hit(10,$w733.level,0,($w734.pac+$w734.ptoac))))){
                /* Confusion attack */
                flag=true;
              }
              break;
            }
            case 4:{
              if(((yield* test_hit(10,$w733.level,0,($w734.pac+$w734.ptoac))))){
                /* Fear attack */
                flag=true;
              }
              break;
            }
            case 5:{
              if(((yield* test_hit(10,$w733.level,0,($w734.pac+$w734.ptoac))))){
                /* Fire attack */
                flag=true;
              }
              break;
            }
            case 6:{
              if(((yield* test_hit(0,$w733.level,0,($w734.pac+$w734.ptoac))))){
                /* Acid attack */
                flag=true;
              }
              break;
            }
            case 7:{
              if(((yield* test_hit(10,$w733.level,0,($w734.pac+$w734.ptoac))))){
                /* Cold attack */
                flag=true;
              }
              break;
            }
            case 8:{
              if(((yield* test_hit(10,$w733.level,0,($w734.pac+$w734.ptoac))))){
                /* Lightning attack */
                flag=true;
              }
              break;
            }
            case 9:{
              if(((yield* test_hit(0,$w733.level,0,($w734.pac+$w734.ptoac))))){
                /* Corrosion attack */
                flag=true;
              }
              break;
            }
            case 10:{
              if(((yield* test_hit(2,$w733.level,0,($w734.pac+$w734.ptoac))))){
                /* Blindness attack */
                flag=true;
              }
              break;
            }
            case 11:{
              if(((yield* test_hit(2,$w733.level,0,($w734.pac+$w734.ptoac))))){
                /* Paralysis attack */
                flag=true;
              }
              break;
            }
            case 12:{
              if(((yield* test_hit(5,$w733.level,0,py.misc.lev)))){
                /* Steal Money */
                if(((py.misc.au>0))){
                  flag=true;
                }
              }
              break;
            }
            case 13:{
              if(((yield* test_hit(2,$w733.level,0,py.misc.lev)))){
                /* Steal Object */
                if(((inven_ctr>0))){
                  flag=true;
                }
              }
              break;
            }
            case 14:{
              if(((yield* test_hit(5,$w733.level,0,($w734.pac+$w734.ptoac))))){
                /* Poison */
                flag=true;
              }
              break;
            }
            case 15:{
              if(((yield* test_hit(0,$w733.level,0,($w734.pac+$w734.ptoac))))){
                /* Lose dexterity */
                flag=true;
              }
              break;
            }
            case 16:{
              if(((yield* test_hit(0,$w733.level,0,($w734.pac+$w734.ptoac))))){
                /* Lose constitution */
                flag=true;
              }
              break;
            }
            case 17:{
              if(((yield* test_hit(2,$w733.level,0,($w734.pac+$w734.ptoac))))){
                /* Lose intelligence */
                flag=true;
              }
              break;
            }
            case 18:{
              if(((yield* test_hit(0,$w733.level,0,($w734.pac+$w734.ptoac))))){
                /* Lose wisdom */
                flag=true;
              }
              break;
            }
            case 19:{
              if(((yield* test_hit(5,$w733.level,0,($w734.pac+$w734.ptoac))))){
                /* Lose experience */
                flag=true;
              }
              break;
            }
            case 20:{
              flag=true;
              break;
            }
            case 21:{
              /* Aggravate monsters */
              if(((yield* test_hit(20,$w733.level,0,($w734.pac+$w734.ptoac))))){
                /* Disenchant */
                flag=true;
              }
              break;
            }
            case 22:{
              if(((yield* test_hit(5,$w733.level,0,($w734.pac+$w734.ptoac))))){
                /* Eat food */
                flag=true;
              }
              break;
            }
            case 23:{
              if(((yield* test_hit(5,$w733.level,0,($w734.pac+$w734.ptoac))))){
                /* Eat light */
                flag=true;
              }
              break;
            }
            case 24:{
              if(((yield* test_hit(15,$w733.level,0,($w734.pac+$w734.ptoac))))){
                /* Eat charges */
                flag=true;
              }
              break;
            }
            case 99:{
              flag=true;
              break;
            }
            default:{
            }
          }
          if((flag)){
            switch(adesc){
              case 1:{
                (yield* msg_print((cdesc+"hits you.")));
                break;
              }
              case 2:{
                (yield* msg_print((cdesc+"bites you.")));
                break;
              }
              case 3:{
                (yield* msg_print((cdesc+"claws you.")));
                break;
              }
              case 4:{
                (yield* msg_print((cdesc+"stings you.")));
                break;
              }
              case 5:{
                (yield* msg_print((cdesc+"touches you.")));
                break;
              }
              case 6:{
                (yield* msg_print((cdesc+"kicks you.")));
                break;
              }
              case 7:{
                (yield* msg_print((cdesc+"gazes at you.")));
                break;
              }
              case 8:{
                (yield* msg_print((cdesc+"breathes on you.")));
                break;
              }
              case 9:{
                (yield* msg_print((cdesc+"spits on you.")));
                break;
              }
              case 10:{
                (yield* msg_print((cdesc+"makes a horrible wail.")));
                break;
              }
              case 11:{
                (yield* msg_print((cdesc+"embraces you.")));
                break;
              }
              case 12:{
                (yield* msg_print((cdesc+"crawls on you.")));
                break;
              }
              case 13:{
                (yield* msg_print((cdesc+"releases a cloud of spores.")));
                break;
              }
              case 14:{
                (yield* msg_print((cdesc+"begs you for money.")));
                break;
              }
              case 15:{
                (yield* msg_print("You've been slimed!"));
                break;
              }
              case 16:{
                (yield* msg_print((cdesc+"crushes you.")));
                break;
              }
              case 17:{
                (yield* msg_print((cdesc+"tramples you.")));
                break;
              }
              case 18:{
                (yield* msg_print((cdesc+"drools on you.")));
                break;
              }
              case 19:{
                switch(randint(9)){
                  case 1:{
                    (yield* msg_print((cdesc+"insults you!")));
                    break;
                  }
                  case 2:{
                    (yield* msg_print((cdesc+"insults your mother!")));
                    break;
                  }
                  case 3:{
                    (yield* msg_print((cdesc+"gives you the finger!")));
                    break;
                  }
                  case 4:{
                    (yield* msg_print((cdesc+"humiliates you!")));
                    break;
                  }
                  case 5:{
                    (yield* msg_print((cdesc+"wets on your leg!")));
                    break;
                  }
                  case 6:{
                    (yield* msg_print((cdesc+"defiles you!")));
                    break;
                  }
                  case 7:{
                    (yield* msg_print((cdesc+"dances around you!")));
                    break;
                  }
                  case 8:{
                    (yield* msg_print((cdesc+"makes obscene gestures!")));
                    break;
                  }
                  case 9:{
                    (yield* msg_print((cdesc+"moons you!!!")));
                    break;
                  }
                }
                break;
              }
              case 99:{
                (yield* msg_print((cdesc+"is repelled.")));
                break;
              }
              default:{
              }
            }
            switch(atype){
              case 1:{
                /* Normal attack */
                dam=damroll(damstr);
                var $w738=py.misc;
                dam=(dam-$round(Math.fround((Math.fround($rdiv((($w738.pac+$w738.ptoac)),Math.fround(200.0))))*dam)));
                (yield* take_hit(dam,ddesc));
                prt_chp();
                break;
              }
              case 2:{
                /* Poison Strength */
                (yield* take_hit(damroll(damstr),ddesc));
                if((py.flags.sustain_str)){
                  (yield* msg_print("You feel weaker for a moment, then it passes."));
                }else if(((randint(2)===1))){
                  (yield* msg_print("You feel weaker."));
                  py.stat.cstr=de_statp(py.stat.cstr);
                  prt_strength();
                }
                prt_chp();
                break;
              }
              case 3:{
                var $w739=py.flags;
                /* Confusion attack */
                (yield* take_hit(damroll(damstr),ddesc));
                if(((randint(2)===1))){
                  if((($w739.confused<1))){
                    (yield* msg_print("You feel confused."));
                    $w739.confused=($w739.confused+randint($w733.level));
                  }
                  $w739.confused=($w739.confused+3);
                }
                prt_chp();
                break;
              }
              case 4:{
                var $w740=py.flags;
                /* Fear attack */
                (yield* take_hit(damroll(damstr),ddesc));
                if((player_saves(wis_adj()))){
                  (yield* msg_print("You resist the effects!"));
                }else if((($w740.afraid<1))){
                  (yield* msg_print("You are suddenly afraid!"));
                  $w740.afraid=(($w740.afraid+3)+randint($w733.level));
                }else{
                  $w740.afraid=($w740.afraid+3);
                }
                prt_chp();
                break;
              }
              case 5:{
                /* Fire attack */
                (yield* msg_print("You are enveloped in flames!"));
                (yield* fire_dam(damroll(damstr),ddesc));
                break;
              }
              case 6:{
                /* Acid attack */
                (yield* msg_print("You are covered in acid!"));
                (yield* acid_dam(damroll(damstr),ddesc));
                break;
              }
              case 7:{
                /* Cold attack */
                (yield* msg_print("You are covered with frost!"));
                (yield* cold_dam(damroll(damstr),ddesc));
                break;
              }
              case 8:{
                /* Lightning attack */
                (yield* msg_print("Lightning strikes you!"));
                (yield* light_dam(damroll(damstr),ddesc));
                break;
              }
              case 9:{
                /* Corrosion attack */
                (yield* msg_print("A stinging red gas swirls about you."));
                (yield* corrode_gas(ddesc));
                (yield* take_hit(damroll(damstr),ddesc));
                prt_chp();
                break;
              }
              case 10:{
                var $w741=py.flags;
                /* Blindness attack */
                (yield* take_hit(damroll(damstr),ddesc));
                if((($w741.blind<1))){
                  $w741.blind=(($w741.blind+10)+randint($w733.level));
                  (yield* msg_print("Your eyes begin to sting."));
                  (yield* msg_print(" "));
                }
                $w741.blind=($w741.blind+5);
                prt_chp();
                break;
              }
              case 11:{
                var $w742=py.flags;
                /* Paralysis attack */
                (yield* take_hit(damroll(damstr),ddesc));
                if((player_saves(con_adj()))){
                  (yield* msg_print("You resist the effects!"));
                }else if((($w742.paralysis<1))){
                  if(($w742.free_act)){
                    (yield* msg_print("You are unaffected."));
                  }else{
                    $w742.paralysis=(randint($w733.level)+3);
                    (yield* msg_print("You are paralyzed."));
                  }
                }
                prt_chp();
                break;
              }
              case 12:{
                var $w743=py.misc;
                /* Steal Money */
                if(((((randint(124)<py.stat.cdex))&&((py.flags.paralysis<1))))){
                  (yield* msg_print("You quickly protect your money pouch!"));
                }else{
                  i1=(Math.trunc(Math.fround($rdiv($w743.au,10)))+randint(25));
                  if(((i1>$w743.au))){
                    $w743.au=0;
                  }else{
                    $w743.au=($w743.au-i1);
                  }
                  (yield* msg_print("Your purse feels lighter."));
                  prt_gold();
                }
                if(((randint(2)===1))){
                  (yield* msg_print("There is a puff of smoke!"));
                  teleport_away(monptr,max_sight);
                }
                break;
              }
              case 13:{
                var $w744=py.stat;
                /* Steal Object */
                if(((((randint(124)<py.stat.cdex))&&((py.flags.paralysis<1))))){
                  (yield* msg_print("You grab hold of your backpack!"));
                }else{
                  i1=randint(inven_ctr);
                  inven_destroy(i1);
                  (yield* msg_print("Your backpack feels lighter."));
                }
                if(((randint(2)===1))){
                  (yield* msg_print("There is a puff of smoke!"));
                  teleport_away(monptr,max_sight);
                }
                break;
              }
              case 14:{
                var $w745=py.flags;
                /* Poison */
                (yield* take_hit(damroll(damstr),ddesc));
                prt_chp();
                (yield* msg_print("You feel very sick."));
                $w745.poisoned=(($w745.poisoned+randint($w733.level))+5);
                break;
              }
              case 15:{
                var $w746=py.flags;
                /* Lose dexterity */
                (yield* take_hit(damroll(damstr),ddesc));
                if(($w746.sustain_dex)){
                  (yield* msg_print("You feel clumsy for a moment, then it passes."));
                }else{
                  (yield* msg_print("You feel more clumsy."));
                  py.stat.cdex=de_statp(py.stat.cdex);
                  prt_dexterity();
                }
                prt_chp();
                break;
              }
              case 16:{
                var $w747=py.flags;
                /* Lose constitution */
                (yield* take_hit(damroll(damstr),ddesc));
                if(($w747.sustain_con)){
                  (yield* msg_print("Your body resists the effects of the disease."));
                }else{
                  (yield* msg_print("Your health is damaged!"));
                  py.stat.ccon=de_statp(py.stat.ccon);
                  prt_constitution();
                }
                prt_chp();
                break;
              }
              case 17:{
                var $w748=py.flags;
                /* Lose intelligence */
                (yield* take_hit(damroll(damstr),ddesc));
                if(($w748.sustain_int)){
                  (yield* msg_print("You feel your memories fading..."));
                  (yield* msg_print("Your memories are suddenly restored!"));
                }else{
                  (yield* msg_print("You feel your memories fading..."));
                  py.stat.cint=de_statp(py.stat.cint);
                  prt_intelligence();
                }
                prt_chp();
                break;
              }
              case 18:{
                var $w749=py.flags;
                /* Lose wisdom */
                (yield* take_hit(damroll(damstr),ddesc));
                if(($w749.sustain_wis)){
                  (yield* msg_print("Your wisdom is sustained."));
                }else{
                  (yield* msg_print("Your wisdom is drained."));
                  py.stat.cwis=de_statp(py.stat.cwis);
                  prt_wisdom();
                }
                prt_chp();
                break;
              }
              case 19:{
                /* Lose experience */
                (yield* msg_print("You feel your life draining away!"));
                i1=(damroll(damstr)+(($idiv(py.misc.exp,100))*mon_S_drain_life));
                (yield* lose_exp(i1));
                break;
              }
              case 20:{
                aggravate_monster(5);
                break;
              }
              case 21:{
                /* Aggravate monster */
                /* Disenchant */
                flag=false;
                switch(randint(6)){
                  case 1:{
                    i1=23;
                    break;
                  }
                  case 2:{
                    i1=26;
                    break;
                  }
                  case 3:{
                    i1=27;
                    break;
                  }
                  case 4:{
                    i1=32;
                    break;
                  }
                  case 5:{
                    i1=28;
                    break;
                  }
                  case 6:{
                    i1=24;
                    break;
                  }
                }
                var $w751=inventory[i1];
                if((($w751.tohit>0))){
                  $w751.tohit=($w751.tohit-randint(2));
                  flag=true;
                }
                if((($w751.todam>0))){
                  $w751.todam=($w751.todam-randint(2));
                  flag=true;
                }
                if((($w751.toac>0))){
                  $w751.toac=($w751.toac-randint(2));
                  flag=true;
                }
                if((flag)){
                  (yield* msg_print("There is a static feeling in the air..."));
                  py_bonuses($clone(blank_treasure),1);
                }
                break;
              }
              case 22:{
                /* Eat food */
                if((find_range($S48,{get v(){return i1},set v($x){i1=$x}},{get v(){return i2},set v($x){i2=$x}}))){
                  inven_destroy(i1);
                }
                break;
              }
              case 23:{
                /* Eat light */
                var $w752=inventory[33];
                if((($w752.p1>0))){
                  $w752.p1=(($w752.p1-250)-randint(250));
                  if((($w752.p1<1))){
                    $w752.p1=1;
                  }
                  (yield* msg_print("Your light dims..."));
                }
                break;
              }
              case 24:{
                if(((inven_ctr>0))){
                  /* Eat charges */
                  i1=randint(inven_ctr);
                  i4=$w733.level;
                  var $w753=inventory[i1];
                  if(($in($w753.tval,$S24))){
                    if((($w753.p1>0))){
                      $w732.hp=($w732.hp+(i4*$w753.p1));
                      $w753.p1=0;
                      (yield* msg_print("Energy drains from your pack!"));
                    }
                  }
                }
                break;
              }
              case 99:{
                break;
              }
              default:{
              }
            }
          }else{
            switch(adesc){
              case 1:case 2:case 3:case 6:{
                (yield* msg_print((cdesc+"misses you.")));
                break;
              }
              default:{
              }
            }
          }
        }
      }
      /* Make the move if possible, five choices		-RAK- */
      function* make_move(monptr,mm){
        var $ret=false;
        var i1=0;
        var i2=0;
        var newy=0;
        var newx=0;
        var movebits=0;
        var flag=false;
        var tflag=false;
        i1=1;
        flag=false;
        $ret=false;
        movebits=c_list[m_list[monptr].mptr].cmove;
        do{
          /* Get new positon */
          newy=m_list[monptr].fy;
          newx=m_list[monptr].fx;
          move(mm[i1],{get v(){return newy},set v($x){newy=$x}},{get v(){return newx},set v($x){newx=$x}});
          var $w756=cave[newy][newx];
          if((($w756.fval!==15))){
            tflag=false;
            /* Floor is open? */
            if(($w756.fopen)){
              tflag=true;
            /* Creature moves through walls? */
            }else if(((((movebits&262144)>>>0)!==0))){
              tflag=true;
            /* Creature can open doors? */
            }else if((($w756.tptr>0))){
              var $w757=t_list[$w756.tptr];
              var $w758=m_list[monptr];
              if(((((movebits&131072)>>>0)!==0))){
                /* Creature can open doors... */
                switch($w757.tval){
                  case 105:{
                    /* Closed doors... */
                    if((($w757.p1===0))){
                      /* Closed doors */
                      tflag=true;
                      if(($w756.fm)){
                        if((los(char_row,char_col,newy,newx))){
                          $assign(t_list[$w756.tptr],door_list[1]);
                          $w756.fopen=true;
                          lite_spot(newy,newx);
                          tflag=false;
                        }
                      }
                    }else if((($w757.p1>0))){
                      /* Locked doors */
                      if(((randint((100-$w757.level))<5))){
                        $w757.p1=0;
                      }
                    }else if((($w757.p1<0))){
                      /* Stuck doors */
                      if(((randint($w758.hp)>((10+Math.abs($w757.p1)))))){
                        $w757.p1=0;
                      }
                    }
                    break;
                  }
                  case 109:{
                    /* Secret doors... */
                    tflag=true;
                    if(($w756.fm)){
                      if((los(char_row,char_col,newy,newx))){
                        $assign(t_list[$w756.tptr],door_list[1]);
                        $w756.fopen=true;
                        lite_spot(newy,newx);
                        tflag=false;
                      }
                    }
                    break;
                  }
                  default:{
                  }
                }
              }else{
                /* Creature can not open doors, must bash them */
                switch($w757.tval){
                  case 105:{
                    /* Closed doors... */
                    i2=(Math.abs($w757.p1)+20);
                    if(((randint($w758.hp)>i2))){
                      tflag=true;
                      if(($w756.fm)){
                        if((los(char_row,char_col,newy,newx))){
                          $assign(t_list[$w756.tptr],door_list[1]);
                          t_list[$w756.tptr].p1=(randint(2)-1);
                          $w756.fopen=true;
                          lite_spot(newy,newx);
                          tflag=false;
                        }
                      }
                    }
                    break;
                  }
                  case 109:{
                    break;
                  }
                  default:{
                  }
                }
              }
            }
            /* Secret doors... */
            /* Glyph of warding present? */
            if((tflag)){
              /* Scare Monster trap */
              if((($w756.tptr>0))){
                if(((t_list[$w756.tptr].tval===102))){
                  if(((t_list[$w756.tptr].subval===99))){
                    if(((randint(obj_S_rune_prot)<c_list[m_list[monptr].mptr].level))){
                      if(((((newy===char_row))&&((newx===char_col))))){
                        (yield* msg_print("The rune of protection is broken!"));
                      }
                      delete_object(newy,newx);
                    }else{
                      tflag=false;
                    }
                  }
                }
              }
            }
            /* Creature has attempted to move on player? */
            if((tflag)){
              if((($w756.cptr===1))){
                if((!(m_list[monptr].ml))){
                  (yield* update_mon(monptr));
                }
                if((find_flag)){
                  find_flag=false;
                  (yield* move_char(5));
                }
                (yield* make_attack(monptr));
                /* Player has read a Confuse Monster? */
                /* Monster gets a saving throw... */
                if((py.flags.confuse_monster)){
                  var $w761=m_list[monptr];
                  var $w762=c_list[$w761.mptr];
                  (yield* msg_print("Your hands stop glowing."));
                  py.flags.confuse_monster=false;
                  if(((((randint(max_mons_level)<$w762.level))||((((4096&$w762.cdefense)>>>0)!==0))))){
                    (yield* msg_print((("The "+$w762.name_)+" is unaffected.")));
                  }else{
                    (yield* msg_print((("The "+$w762.name_)+" appears confused.")));
                    $w761.confused=true;
                  }
                }
                tflag=false;
                flag=true;
              /* Creature is attempting to move on other creature? */
              }else if((((($w756.cptr>1))&&((((newy!==m_list[monptr].fy))||((newx!==m_list[monptr].fx))))))){
                /* Creature eats other creatures? */
                if(((((movebits&524288)>>>0)!==0))){
                  delete_monster($w756.cptr);
                }else{
                  tflag=false;
                }
              }
            }
            /* Creature has been allowed move... */
            if((tflag)){
              var $w763=m_list[monptr];
              /* Pick up or eat an object */
              if(((((movebits&1048576)>>>0)!==0))){
                var $w764=cave[newy][newx];
                if((($w764.tptr>0))){
                  if(((t_list[$w764.tptr].tval<100))){
                    delete_object(newy,newx);
                  }
                }
              }
              /* Move creature record */
              move_rec($w763.fy,$w763.fx,newy,newx);
              $w763.fy=newy;
              $w763.fx=newx;
              flag=true;
              $ret=true;
            }
          }
          i1=(i1+1);
        }while(!((((flag)||((i1>5))))));
        return $ret;
      }
      /* Up to 5 attempts at moving, then give up... */
      /* Creatures can cast spells too.  (Dragon Breath)	-RAK- */
      /* cast_spell := true if creature changes position */
      /* took_turn  := true if creature casts a spell */
      function* cast_spell(monptr,took_turn){
        var $ret=false;
        var i1=0;
        var i2=0;
        var i3=0;
        var y=0;
        var x=0;
        var chance=0;
        var thrown_spell=0;
        var r1=0;
        var spell_choice=$zeros(31);
        var cdesc="";
        var ddesc="";
        var outval="";
        var flag=false;
        var $w765=m_list[monptr];
        var $w766=c_list[$w765.mptr];
        chance=(((($w766.spells&15)>>>0))|0);
        /* 1 in x chance of casting spell */
        if(((randint(chance)!==1))){
          $ret=false;
          took_turn.v=false;
        /* Must be within certain range */
        }else if((($w765.cdis>max_spell_dis))){
          $ret=false;
          took_turn.v=false;
        /* Must have unobstructed Line-Of-Sight */
        }else if((!(los(char_row,char_col,$w765.fy,$w765.fx)))){
          $ret=false;
          took_turn.v=false;
        }else{
          /* Creature is going to cast a spell */
          took_turn.v=true;
          $ret=false;
          /* Describe the attack */
          flag=true;
          if((!($w765.ml))){
            flag=false;
          }else if(((((((65536&c_list[$w765.mptr].cmove)>>>0)!==0))&&(!(py.flags.see_inv))))){
            flag=false;
          }else if(((py.flags.blind>0))){
            flag=false;
          }
          if((flag)){
            cdesc=$cap((("The "+$w766.name_)+" "),80);
          }else{
            cdesc=$cap("It ",80);
          }
          /* For 'DIED_FROM' string */
          if(((((2147483648&$w766.cmove)>>>0)!==0))){
            ddesc=$cap(("The "+$w766.name_),80);
          }else{
            ddesc=$cap(("& "+$w766.name_),80);
          }
          inventory[inven_max].name_=$cap(ddesc,68);
          inventory[inven_max].number=1;
          objdes({get v(){return ddesc},set v($x){ddesc=$x}},inven_max,true);
          /* End DIED_FROM */
          /* Extract all possible spells into spell_choice */
          i1=(($w766.spells&4294967280)>>>0);
          i3=0;
          while(((i1!==0))){
            i2=bit_pos({get v(){return i1},set v($x){i1=$x}});
            i3=(i3+1);
            spell_choice[i3]=i2;
          }
          /* Choose a spell to cast */
          thrown_spell=spell_choice[randint(i3)];
          /* Cast the spell... */
          switch(thrown_spell){
            case 5:{
              teleport_away(monptr,5);
              break;
            }
            case 6:{
              /* Teleport Short */
              teleport_away(monptr,max_sight);
              break;
            }
            case 7:{
              /* Teleport Long */
              /* Teleport To */
              cdesc=$cap((cdesc+"casts a spell."),80);
              (yield* msg_print(cdesc));
              (yield* msg_print(" "));
              (yield* teleport_to($w765.fy,$w765.fx));
              break;
            }
            case 8:{
              /* Light Wound */
              cdesc=$cap((cdesc+"casts a spell."),80);
              (yield* msg_print(cdesc));
              if((player_saves((wis_adj()+py.misc.lev)))){
                (yield* msg_print("You resist the affects of the spell."));
              }else{
                (yield* take_hit(damroll("3d8"),ddesc));
              }
              break;
            }
            case 9:{
              /* Serious Wound */
              cdesc=$cap((cdesc+"casts a spell."),80);
              (yield* msg_print(cdesc));
              if((player_saves((wis_adj()+py.misc.lev)))){
                (yield* msg_print("You resist the affects of the spell."));
              }else{
                (yield* take_hit(damroll("8d8"),ddesc));
              }
              break;
            }
            case 10:{
              /* Hold Person */
              cdesc=$cap((cdesc+"casts a spell."),80);
              (yield* msg_print(cdesc));
              if((py.flags.free_act)){
                (yield* msg_print("You are unaffected..."));
              }else if((player_saves((wis_adj()+py.misc.lev)))){
                (yield* msg_print("You resist the affects of the spell."));
              }else if(((py.flags.paralysis>0))){
                py.flags.paralysis=(py.flags.paralysis+2);
              }else{
                py.flags.paralysis=(randint(5)+4);
              }
              break;
            }
            case 11:{
              /* Cause Blindnes */
              cdesc=$cap((cdesc+"casts a spell."),80);
              (yield* msg_print(cdesc));
              if((player_saves((wis_adj()+py.misc.lev)))){
                (yield* msg_print("You resist the affects of the spell."));
              }else if(((py.flags.blind>0))){
                py.flags.blind=(py.flags.blind+6);
              }else{
                py.flags.blind=((py.flags.blind+12)+randint(3));
                (yield* msg_print(" "));
              }
              break;
            }
            case 12:{
              /* Cause Confuse */
              cdesc=$cap((cdesc+"casts a spell."),80);
              (yield* msg_print(cdesc));
              if((player_saves((wis_adj()+py.misc.lev)))){
                (yield* msg_print("You resist the affects of the spell."));
              }else if(((py.flags.confused>0))){
                py.flags.confused=(py.flags.confused+2);
              }else{
                py.flags.confused=(randint(5)+3);
              }
              break;
            }
            case 13:{
              /* Cause Fear */
              cdesc=$cap((cdesc+"casts a spell."),80);
              (yield* msg_print(cdesc));
              if((player_saves((wis_adj()+py.misc.lev)))){
                (yield* msg_print("You resist the affects of the spell."));
              }else if(((py.flags.afraid>0))){
                py.flags.afraid=(py.flags.afraid+2);
              }else{
                py.flags.afraid=(randint(5)+3);
              }
              break;
            }
            case 14:{
              /* Summon Monster */
              cdesc=$cap((cdesc+"magically summons a monster!"),80);
              (yield* msg_print(cdesc));
              y=char_row;
              x=char_col;
              summon_monster({get v(){return y},set v($x){y=$x}},{get v(){return x},set v($x){x=$x}},false);
              check_mon_lite(y,x);
              break;
            }
            case 15:{
              /* Summon Undead */
              cdesc=$cap((cdesc+"magically summons an undead!"),80);
              (yield* msg_print(cdesc));
              y=char_row;
              x=char_col;
              summon_undead({get v(){return y},set v($x){y=$x}},{get v(){return x},set v($x){x=$x}});
              check_mon_lite(y,x);
              break;
            }
            case 16:{
              /* Slow Person */
              cdesc=$cap((cdesc+"casts a spell."),80);
              (yield* msg_print(cdesc));
              if((py.flags.free_act)){
                (yield* msg_print("You are unaffected..."));
              }else if((player_saves((wis_adj()+py.misc.lev)))){
                (yield* msg_print("You resist the affects of the spell."));
              }else if(((py.flags.slow>0))){
                py.flags.slow=(py.flags.slow+2);
              }else{
                py.flags.slow=(randint(5)+3);
              }
              break;
            }
            case 17:{
              if(((Math.trunc(py.misc.cmana)>0))){
                /* Drain Mana */
                outval=$cap((cdesc+"draws psychic energy from you!"),80);
                (yield* msg_print(outval));
                outval=$cap((cdesc+"appears healthier..."),80);
                (yield* msg_print(outval));
                r1=Math.fround((($idiv(randint($w766.level),2))+1));
                if(((r1>py.misc.cmana))){
                  r1=Math.fround(py.misc.cmana);
                }
                py.misc.cmana=Math.fround(Math.fround(py.misc.cmana-r1));
                $w765.hp=($w765.hp+(6*Math.trunc(r1)));
              }
              break;
            }
            case 20:{
              /* Breath Light */
              cdesc=$cap((cdesc+"breathes lightning."),80);
              (yield* msg_print(cdesc));
              (yield* breath(1,char_row,char_col,Math.trunc(Math.fround($rdiv($w765.hp,Math.fround(4.0)))),ddesc));
              break;
            }
            case 21:{
              /* Breath Gas */
              cdesc=$cap((cdesc+"breathes gas."),80);
              (yield* msg_print(cdesc));
              (yield* breath(2,char_row,char_col,Math.trunc(Math.fround($rdiv($w765.hp,Math.fround(3.0)))),ddesc));
              break;
            }
            case 22:{
              /* Breath Acid */
              cdesc=$cap((cdesc+"breathes acid."),80);
              (yield* msg_print(cdesc));
              (yield* breath(3,char_row,char_col,Math.trunc(Math.fround($rdiv($w765.hp,Math.fround(3.0)))),ddesc));
              break;
            }
            case 23:{
              /* Breath Frost */
              cdesc=$cap((cdesc+"breathes frost."),80);
              (yield* msg_print(cdesc));
              (yield* breath(4,char_row,char_col,Math.trunc(Math.fround($rdiv($w765.hp,Math.fround(3.0)))),ddesc));
              break;
            }
            case 24:{
              /* Breath Fire */
              cdesc=$cap((cdesc+"breathes fire."),80);
              (yield* msg_print(cdesc));
              (yield* breath(5,char_row,char_col,Math.trunc(Math.fround($rdiv($w765.hp,Math.fround(3.0)))),ddesc));
              break;
            }
            default:{
              (yield* msg_print("Creature cast unknown spell."));
              cdesc=$cap("",80);
            }
          }
        }
        return $ret;
      }
      /* End of spells */
      /* Main procedure for monster movement (MON_MOVE)	-RAK- */
      $ret=false;
      var $w768=c_list[m_list[monptr].mptr];
      /* Does the critter multiply? */
      if((((($w768.cmove&2097152)>>>0)!==0))){
        if(((max_mon_mult>=mon_tot_mult))){
          if(((($mod(py.flags.rest,mon_mult_adj))===0))){
            var $w769=m_list[monptr];
            i3=0;
            for(var $e770=($w769.fy+1),$ie770=($w769.fy-1);$ie770<=$e770;$ie770++){
              i1=$ie770;
              for(var $e771=($w769.fx+1),$ie771=($w769.fx-1);$ie771<=$e771;$ie771++){
                i2=$ie771;
                if((in_bounds(i1,i2))){
                  if(((cave[i1][i2].cptr>1))){
                    i3=(i3+1);
                  }
                }
              }
            }
            if(((i3<4))){
              if(((randint((i3*mon_mult_adj))===1))){
                multiply_monster($w769.fy,$w769.fx,$w769.mptr,false);
              }
            }
          }
        }
      }
      /* Creature is confused?  Chance it becomes un-confused */
      move_test=false;
      if((m_list[monptr].confused)){
        mm[1]=randint(9);
        mm[2]=randint(9);
        mm[3]=randint(9);
        mm[4]=randint(9);
        mm[5]=randint(9);
        $ret=(yield* make_move(monptr,$clone(mm)));
        if(((randint(8)===1))){
          m_list[monptr].confused=false;
        }
        move_test=true;
      /* Creature may cast a spell */
      }else if((($w768.spells>0))){
        $ret=(yield* cast_spell(monptr,{get v(){return move_test},set v($x){move_test=$x}}));
      }
      if((!(move_test))){
        /* 75% random movement */
        if(((((randint(100)<75))&&(((($w768.cmove&32)>>>0)!==0))))){
          mm[1]=randint(9);
          mm[2]=randint(9);
          mm[3]=randint(9);
          mm[4]=randint(9);
          mm[5]=randint(9);
          $ret=(yield* make_move(monptr,$clone(mm)));
        /* 40% random movement */
        }else if(((((randint(100)<40))&&(((($w768.cmove&16)>>>0)!==0))))){
          mm[1]=randint(9);
          mm[2]=randint(9);
          mm[3]=randint(9);
          mm[4]=randint(9);
          mm[5]=randint(9);
          $ret=(yield* make_move(monptr,$clone(mm)));
        /* 20% random movement */
        }else if(((((randint(100)<20))&&(((($w768.cmove&8)>>>0)!==0))))){
          mm[1]=randint(9);
          mm[2]=randint(9);
          mm[3]=randint(9);
          mm[4]=randint(9);
          mm[5]=randint(9);
          $ret=(yield* make_move(monptr,$clone(mm)));
        /* Normal movement */
        }else if((((($w768.cmove&2)>>>0)!==0))){
          if(((randint(200)===1))){
            mm[1]=randint(9);
            mm[2]=randint(9);
            mm[3]=randint(9);
            mm[4]=randint(9);
            mm[5]=randint(9);
          }else{
            get_moves(monptr,mm);
          }
          $ret=(yield* make_move(monptr,$clone(mm)));
        /* Attack, but don't move */
        }else if((((($w768.cmove&1)>>>0)!==0))){
          if(((m_list[monptr].cdis<2))){
            get_moves(monptr,mm);
            $ret=(yield* make_move(monptr,$clone(mm)));
          }
        }
      }
      return $ret;
    }
    /* Main procedure for creatures				-RAK- */
    if(((muptr>0))){
      /* Process the monsters */
      i1=muptr;
      do{
        var $w772=m_list[i1];
        $w772.cdis=distance(char_row,char_col,$w772.fy,$w772.fx);
        if((attack)){
          /* Attack is argument passed to CREATURE */
          i3=movement_rate($w772.cspeed);
          if(((i3>0))){
            for(var $e773=movement_rate($w772.cspeed),$ie773=1;$ie773<=$e773;$ie773++){
              i2=$ie773;
              if((((($w772.cdis<=c_list[$w772.mptr].aaf))||($w772.ml)))){
                if((($w772.csleep>0))){
                  if((py.flags.aggravate)){
                    $w772.csleep=0;
                  }else if(((py.flags.rest<1))){
                    if(((randint(10)>py.misc.stl))){
                      $w772.csleep=($w772.csleep-Math.trunc(Math.fround($rdiv(Math.fround(75.0),$w772.cdis))));
                    }
                  }
                }
                if((($w772.stuned>0))){
                  $w772.stuned=((($w772.stuned-1))<<26>>26);
                }
                if((((($w772.csleep<=0))&&(($w772.stuned<=0))))){
                  moldy=$w772.fy;
                  moldx=$w772.fx;
                  if(((yield* mon_move(i1)))){
                    if(($w772.ml)){
                      $w772.ml=false;
                      if((test_light(moldy,moldx))){
                        lite_spot(moldy,moldx);
                      }else{
                        unlite_spot(moldy,moldx);
                      }
                    }
                  }
                }
              }
              (yield* update_mon(i1));
            }
          }else{
            (yield* update_mon(i1));
          }
        }else{
          (yield* update_mon(i1));
        }
        i1=m_list[i1].nptr;
      }while(!(((((i1===0))||(moria_flag)))));
    }
  }
  /* End processing monsters */
  /* Using objects */
  /* Scrolls for the reading				-RAK- */
  function* read(){
    var i1=0;
    var i2=0;
    var i3=0;
    var i4=0;
    var item_val=0;
    var thit=0;
    var tdam=0;
    var y=0;
    var x=0;
    var tmp=$zeros(5);
    var out_val="";
    var redraw=false;
    var ident=false;
    var first=false;
    var flag=false;
    first=true;
    reset_flag=true;
    if(((inven_ctr>0))){
      if((find_range($S49,{get v(){return i2},set v($x){i2=$x}},{get v(){return i3},set v($x){i3=$x}}))){
        if(((py.flags.blind>0))){
          (yield* msg_print("You can't see to read the scroll."));
        }else if((no_light())){
          (yield* msg_print("You have no light to read by."));
        }else if(((py.flags.confused>0))){
          (yield* msg_print("The text seems to swim about the page!"));
          (yield* msg_print("You are too confused to read..."));
        }else{
          redraw=false;
          if(((yield* get_item({get v(){return item_val},set v($x){item_val=$x}},"Read which scroll?",{get v(){return redraw},set v($x){redraw=$x}},i2,i3)))){
            var $w774=inventory[item_val];
            if((redraw)){
              draw_cave();
            }
            reset_flag=false;
            i1=$w774.flags;
            ident=false;
            while(((i1>0))){
              i2=bit_pos({get v(){return i1},set v($x){i1=$x}});
              if((($w774.tval===71))){
                i2=(i2+31);
              }
              if((first)){
                if((!($in(i2,$S50)))){
                  (yield* msg_print("As you read the scroll it vanishes."));
                  first=false;
                }
              }
              /* Scrolls... */
              switch((i2)){
                case 1:{
                  var $w775=inventory[23];
                  if((($w775.tval>0))){
                    objdes({get v(){return out_val},set v($x){out_val=$x}},23,false);
                    (yield* msg_print((("Your "+out_val)+" glows faintly!")));
                    if((enchant($rf($w775,"tohit")))){
                      $w775.flags=((2147483647&$w775.flags)>>>0);
                      py_bonuses($clone(blank_treasure),0);
                    }else{
                      (yield* msg_print("The enchantment fails..."));
                    }
                  }
                  ident=true;
                  break;
                }
                case 2:{
                  var $w776=inventory[23];
                  if((($w776.tval>0))){
                    objdes({get v(){return out_val},set v($x){out_val=$x}},23,false);
                    (yield* msg_print((("Your "+out_val)+" glows faintly!")));
                    if((enchant($rf($w776,"todam")))){
                      $w776.flags=((2147483647&$w776.flags)>>>0);
                      py_bonuses($clone(blank_treasure),0);
                    }else{
                      (yield* msg_print("The enchantment fails..."));
                    }
                  }
                  ident=true;
                  break;
                }
                case 3:{
                  i3=0;
                  i4=0;
                  if(((inventory[26].tval>0))){
                    i3=(i3+1);
                    tmp[i3]=26;
                  }
                  if(((inventory[27].tval>0))){
                    i3=(i3+1);
                    tmp[i3]=27;
                  }
                  if(((inventory[32].tval>0))){
                    i3=(i3+1);
                    tmp[i3]=32;
                  }
                  if(((inventory[28].tval>0))){
                    i3=(i3+1);
                    tmp[i3]=28;
                  }
                  if(((inventory[24].tval>0))){
                    i3=(i3+1);
                    tmp[i3]=24;
                  }
                  if(((i3>0))){
                    i4=tmp[randint(i3)];
                  }
                  if(((((2147483648&inventory[26].flags)>>>0)!==0))){
                    i4=26;
                  }else if(((((2147483648&inventory[27].flags)>>>0)!==0))){
                    i4=27;
                  }else if(((((2147483648&inventory[32].flags)>>>0)!==0))){
                    i4=32;
                  }else if(((((2147483648&inventory[24].flags)>>>0)!==0))){
                    i4=24;
                  }else if(((((2147483648&inventory[28].flags)>>>0)!==0))){
                    i4=28;
                  }
                  if(((i4>0))){
                    var $w777=inventory[i4];
                    objdes({get v(){return out_val},set v($x){out_val=$x}},i4,false);
                    (yield* msg_print((("Your "+out_val)+" glows faintly!")));
                    if((enchant($rf($w777,"toac")))){
                      $w777.flags=((2147483647&$w777.flags)>>>0);
                      py_bonuses($clone(blank_treasure),0);
                    }else{
                      (yield* msg_print("The enchantment fails..."));
                    }
                  }
                  ident=true;
                  break;
                }
                case 4:{
                  identify($clone(inventory[item_val]));
                  (yield* msg_print("This is an identify scroll"));
                  (yield* msg_print(" "));
                  if(((yield* ident_spell()))){
                    first=false;
                  }
                  break;
                }
                case 5:{
                  if((remove_curse())){
                    (yield* msg_print("You feel as if someone is watching over you."));
                    ident=true;
                  }
                  break;
                }
                case 6:{
                  ident=(yield* light_area(char_row,char_col));
                  break;
                }
                case 7:{
                  for(var $e778=randint(3),$ie778=1;$ie778<=$e778;$ie778++){
                    i3=$ie778;
                    y=char_row;
                    x=char_col;
                    summon_monster({get v(){return y},set v($x){y=$x}},{get v(){return x},set v($x){x=$x}},false);
                  }
                  ident=true;
                  break;
                }
                case 8:{
                  (yield* teleport(10));
                  ident=true;
                  break;
                }
                case 9:{
                  (yield* teleport(100));
                  ident=true;
                  break;
                }
                case 10:{
                  dun_level=((dun_level-3)+(2*randint(2)));
                  if(((dun_level<1))){
                    dun_level=1;
                  }
                  moria_flag=true;
                  ident=true;
                  break;
                }
                case 11:{
                  (yield* msg_print("Your hands begin to glow."));
                  py.flags.confuse_monster=true;
                  ident=true;
                  break;
                }
                case 12:{
                  ident=map_area();
                  break;
                }
                case 13:{
                  ident=(yield* sleep_monsters1(char_row,char_col));
                  break;
                }
                case 14:{
                  ident=warding_glyph();
                  break;
                }
                case 15:{
                  ident=detect_treasure();
                  break;
                }
                case 16:{
                  ident=detect_object();
                  break;
                }
                case 17:{
                  ident=detect_trap();
                  break;
                }
                case 18:{
                  ident=detect_sdoor();
                  break;
                }
                case 19:{
                  (yield* msg_print("This is a mass genocide scroll."));
                  (yield* msg_print(" "));
                  ident=mass_genocide();
                  break;
                }
                case 20:{
                  ident=(yield* detect_invisible());
                  break;
                }
                case 21:{
                  ident=aggravate_monster(20);
                  (yield* msg_print("There is a high pitched humming noise"));
                  break;
                }
                case 22:{
                  ident=trap_creation();
                  break;
                }
                case 23:{
                  ident=td_destroy();
                  break;
                }
                case 24:{
                  ident=door_creation();
                  break;
                }
                case 25:{
                  identify($clone(inventory[item_val]));
                  (yield* msg_print("This is a Recharge-Item scroll."));
                  (yield* msg_print(" "));
                  if(((yield* recharge(60)))){
                    first=false;
                  }
                  break;
                }
                case 26:{
                  (yield* msg_print("This is a genocide scroll."));
                  (yield* msg_print(" "));
                  ident=(yield* genocide());
                  break;
                }
                case 27:{
                  ident=(yield* unlight_area(char_row,char_col));
                  break;
                }
                case 28:{
                  ident=protect_evil();
                  break;
                }
                case 29:{
                  ident=create_food();
                  break;
                }
                case 30:{
                  ident=(yield* dispell_creature(8,60));
                  break;
                }
                case 31:{
                  (yield* msg_print("That scroll appeared to be blank."));
                  ident=true;
                  break;
                }
                case 32:{
                  var $w779=inventory[23];
                  if((($w779.tval>0))){
                    objdes({get v(){return out_val},set v($x){out_val=$x}},23,false);
                    (yield* msg_print((("Your "+out_val)+" glows brightly!")));
                    flag=false;
                    for(var $e780=randint(2),$ie780=1;$ie780<=$e780;$ie780++){
                      i3=$ie780;
                      if((enchant($rf($w779,"tohit")))){
                        flag=true;
                      }
                    }
                    for(var $e781=randint(2),$ie781=1;$ie781<=$e781;$ie781++){
                      i3=$ie781;
                      if((enchant($rf($w779,"todam")))){
                        flag=true;
                      }
                    }
                    if((flag)){
                      $w779.flags=((2147483647&$w779.flags)>>>0);
                      py_bonuses($clone(blank_treasure),0);
                    }else{
                      (yield* msg_print("The enchantment fails..."));
                    }
                  }
                  ident=true;
                  break;
                }
                case 33:{
                  var $w782=inventory[23];
                  if((($w782.tval>0))){
                    $assign(inventory[inven_max],inventory[23]);
                    objdes({get v(){return out_val},set v($x){out_val=$x}},23,false);
                    (yield* msg_print((("Your "+out_val)+" glows black, then fades.")));
                    $w782.tohit=((-randint(5))-randint(5));
                    $w782.todam=((-randint(5))-randint(5));
                    $w782.flags=2147483648;
                    py_bonuses($clone(inventory[inven_max]),(-1));
                    ident=true;
                  }
                  break;
                }
                case 34:{
                  if(((((2147483648&inventory[26].flags)>>>0)!==0))){
                    i3=26;
                  }else if(((((2147483648&inventory[27].flags)>>>0)!==0))){
                    i3=27;
                  }else if(((((2147483648&inventory[32].flags)>>>0)!==0))){
                    i3=32;
                  }else if(((((2147483648&inventory[24].flags)>>>0)!==0))){
                    i3=24;
                  }else if(((((2147483648&inventory[28].flags)>>>0)!==0))){
                    i3=28;
                  }else if(((inventory[26].tval>0))){
                    i3=26;
                  }else if(((inventory[27].tval>0))){
                    i3=27;
                  }else if(((inventory[24].tval>0))){
                    i3=24;
                  }else if(((inventory[28].tval>0))){
                    i3=28;
                  }else{
                    i3=0;
                  }
                  if(((i3>0))){
                    var $w783=inventory[i3];
                    objdes({get v(){return out_val},set v($x){out_val=$x}},i3,false);
                    (yield* msg_print((("Your "+out_val)+" glows brightly!")));
                    flag=false;
                    for(var $e784=(randint(2)+1),$ie784=1;$ie784<=$e784;$ie784++){
                      i3=$ie784;
                      if((enchant($rf($w783,"toac")))){
                        flag=true;
                      }
                    }
                    if((flag)){
                      $w783.flags=((2147483647&$w783.flags)>>>0);
                      py_bonuses($clone(blank_treasure),0);
                    }else{
                      (yield* msg_print("The enchantment fails..."));
                    }
                  }
                  ident=true;
                  break;
                }
                case 35:{
                  if(((((inventory[26].tval>0))&&((randint(4)===1))))){
                    i3=26;
                  }else if(((((inventory[27].tval>0))&&((randint(3)===1))))){
                    i3=27;
                  }else if(((((inventory[32].tval>0))&&((randint(3)===1))))){
                    i3=32;
                  }else if(((((inventory[24].tval>0))&&((randint(3)===1))))){
                    i3=24;
                  }else if(((((inventory[28].tval>0))&&((randint(3)===1))))){
                    i3=28;
                  }else if(((inventory[26].tval>0))){
                    i3=26;
                  }else if(((inventory[27].tval>0))){
                    i3=27;
                  }else if(((inventory[32].tval>0))){
                    i3=32;
                  }else if(((inventory[24].tval>0))){
                    i3=24;
                  }else if(((inventory[28].tval>0))){
                    i3=28;
                  }else{
                    i3=0;
                  }
                  if(((i3>0))){
                    var $w785=inventory[i3];
                    $assign(inventory[inven_max],inventory[i3]);
                    objdes({get v(){return out_val},set v($x){out_val=$x}},i3,false);
                    (yield* msg_print((("Your "+out_val)+" glows black, then fades.")));
                    $w785.flags=2147483648;
                    $w785.toac=((-randint(5))-randint(5));
                    py_bonuses($clone(inventory[inven_max]),(-1));
                    ident=true;
                  }
                  break;
                }
                case 36:{
                  for(var $e786=randint(3),$ie786=1;$ie786<=$e786;$ie786++){
                    i3=$ie786;
                    y=char_row;
                    x=char_col;
                    summon_undead({get v(){return y},set v($x){y=$x}},{get v(){return x},set v($x){x=$x}});
                  }
                  ident=true;
                  break;
                }
                case 37:{
                  ident=bless((randint(12)+6));
                  break;
                }
                case 38:{
                  ident=bless((randint(24)+12));
                  break;
                }
                case 39:{
                  ident=bless((randint(48)+24));
                  break;
                }
                case 40:{
                  ident=true;
                  py.flags.word_recall=(25+randint(30));
                  (yield* msg_print("The air about you becomes charged..."));
                  break;
                }
                case 41:{
                  ident=(yield* destroy_area(char_row,char_col));
                  break;
                }
                case 42:{
                  break;
                }
                case 43:{
                  break;
                }
                case 44:{
                  break;
                }
                case 45:{
                  break;
                }
                case 46:{
                  break;
                }
                case 47:{
                  break;
                }
                case 48:{
                  break;
                }
                case 49:{
                  break;
                }
                case 50:{
                  break;
                }
                case 51:{
                  break;
                }
                case 52:{
                  break;
                }
                case 53:{
                  break;
                }
                case 54:{
                  break;
                }
                case 55:{
                  break;
                }
                case 56:{
                  break;
                }
                case 57:{
                  break;
                }
                case 58:{
                  break;
                }
                case 59:{
                  break;
                }
                case 60:{
                  break;
                }
                case 61:{
                  break;
                }
                case 62:{
                  break;
                }
                default:{
                }
              }
            }
            /* End of Scrolls... */
            if((!(reset_flag))){
              if((ident)){
                identify($clone(inventory[item_val]));
              }
              if((!(first))){
                (yield* desc_remain(item_val));
                inven_destroy(item_val);
                if((($w774.flags!==0))){
                  var $w788=py.misc;
                  $w788.exp=($w788.exp+$round(Math.fround($rdiv($w774.level,$w788.lev))));
                  (yield* prt_experience());
                }
              }
            }
          }else if((redraw)){
            draw_cave();
          }
        }
      }else{
        (yield* msg_print("You are not carrying any scrolls."));
      }
    }else{
      (yield* msg_print("But you are not carrying anything."));
    }
  }
  /* Potions for the quaffing				-RAK- */
  function* quaff(){
    var i1=0;
    var i2=0;
    var i3=0;
    var i4=0;
    var i5=0;
    var item_val=0;
    var out_val="";
    var redraw=false;
    var ident=false;
    reset_flag=true;
    if(((inven_ctr>0))){
      if((find_range($S33,{get v(){return i2},set v($x){i2=$x}},{get v(){return i3},set v($x){i3=$x}}))){
        redraw=false;
        if(((yield* get_item({get v(){return item_val},set v($x){item_val=$x}},"Quaff which potion?",{get v(){return redraw},set v($x){redraw=$x}},i2,i3)))){
          var $w789=inventory[item_val];
          if((redraw)){
            draw_cave();
          }
          reset_flag=false;
          i1=$w789.flags;
          ident=false;
          while(((i1>0))){
            i2=bit_pos({get v(){return i1},set v($x){i1=$x}});
            if((($w789.tval===76))){
              i2=(i2+31);
            }
            /* Potions */
            switch((i2)){
              case 1:{
                var $w790=py.stat;
                $w790.cstr=in_statp($w790.cstr);
                if((($w790.cstr>$w790.str))){
                  $w790.str=$w790.cstr;
                }
                (yield* msg_print("Wow!  What bulging muscles!"));
                prt_strength();
                ident=true;
                break;
              }
              case 2:{
                ident=(yield* lose_str());
                break;
              }
              case 3:{
                var $w791=py.stat;
                $w791.cstr=$w791.str;
                (yield* msg_print("You feel warm all over."));
                prt_strength();
                ident=true;
                break;
              }
              case 4:{
                var $w792=py.stat;
                $w792.cint=in_statp($w792.cint);
                if((($w792.cint>py.stat.int))){
                  py.stat.int=$w792.cint;
                }
                (yield* msg_print("Aren't you brilliant!"));
                prt_intelligence();
                ident=true;
                break;
              }
              case 5:{
                (yield* msg_print("This potion tastes very dull."));
                ident=(yield* lose_int());
                break;
              }
              case 6:{
                var $w793=py.stat;
                $w793.cint=py.stat.int;
                (yield* msg_print("You have have a warm feeling."));
                prt_intelligence();
                ident=true;
                break;
              }
              case 7:{
                var $w794=py.stat;
                $w794.cwis=in_statp($w794.cwis);
                if((($w794.cwis>$w794.wis))){
                  $w794.wis=$w794.cwis;
                }
                (yield* msg_print("You suddenly have a profound thought!"));
                prt_wisdom();
                ident=true;
                break;
              }
              case 8:{
                ident=(yield* lose_wis());
                break;
              }
              case 9:{
                var $w795=py.stat;
                if((($w795.cwis<$w795.wis))){
                  $w795.cwis=$w795.wis;
                  (yield* msg_print("You feel your wisdom returning."));
                  prt_wisdom();
                  ident=true;
                }
                break;
              }
              case 10:{
                var $w796=py.stat;
                $w796.cchr=in_statp($w796.cchr);
                if((($w796.cchr>$w796.chr))){
                  $w796.chr=$w796.cchr;
                }
                (yield* msg_print("Gee, ain't you cute!"));
                prt_charisma();
                ident=true;
                break;
              }
              case 11:{
                ident=(yield* lose_chr());
                break;
              }
              case 12:{
                var $w797=py.stat;
                if((($w797.cchr<$w797.chr))){
                  $w797.cchr=$w797.chr;
                  (yield* msg_print("You feel your looks returning."));
                  prt_charisma();
                  ident=true;
                }
                break;
              }
              case 13:{
                ident=(yield* hp_player(damroll("2d7"),"a potion."));
                break;
              }
              case 14:{
                ident=(yield* hp_player(damroll("4d7"),"a potion."));
                break;
              }
              case 15:{
                ident=(yield* hp_player(damroll("6d7"),"a potion."));
                break;
              }
              case 16:{
                ident=(yield* hp_player(1000,"a potion."));
                break;
              }
              case 17:{
                var $w798=py.misc;
                py.stat.ccon=in_statp(py.stat.ccon);
                if(((py.stat.ccon>py.stat.con))){
                  py.stat.con=py.stat.ccon;
                }
                $w798.mhp=($w798.mhp+1);
                $w798.chp=Math.fround(Math.fround($w798.chp+$w798.mhp));
                (yield* msg_print("You feel tingly for a moment."));
                prt_mhp();
                prt_chp();
                prt_constitution();
                ident=true;
                break;
              }
              case 18:{
                var $w799=py.misc;
                i5=(($idiv($w799.exp,2))+10);
                if(((i5>100000))){
                  i5=100000;
                }
                $w799.exp=($w799.exp+i5);
                (yield* msg_print("You feel more experienced."));
                (yield* prt_experience());
                ident=true;
                break;
              }
              case 19:{
                var $w800=py.flags;
                if((!(py.flags.free_act))){
                  (yield* msg_print("You fall asleep."));
                  py.flags.paralysis=((py.flags.paralysis+randint(4))+4);
                  ident=true;
                }
                break;
              }
              case 20:{
                var $w801=py.flags;
                (yield* msg_print("You are covered by a veil of darkness."));
                $w801.blind=(($w801.blind+randint(100))+100);
                ident=true;
                break;
              }
              case 21:{
                var $w802=py.flags;
                (yield* msg_print("Hey!  This is good stuff!  * Hick! *"));
                $w802.confused=(($w802.confused+randint(20))+12);
                ident=true;
                break;
              }
              case 22:{
                var $w803=py.flags;
                (yield* msg_print("You feel very sick."));
                $w803.poisoned=(($w803.poisoned+randint(15))+10);
                ident=true;
                break;
              }
              case 23:{
                py.flags.fast=((py.flags.fast+randint(25))+15);
                ident=true;
                break;
              }
              case 24:{
                py.flags.slow=((py.flags.slow+randint(25))+15);
                ident=true;
                break;
              }
              case 25:{
                ident=(yield* detect_monsters());
                break;
              }
              case 26:{
                var $w804=py.stat;
                $w804.cdex=in_statp($w804.cdex);
                if((($w804.cdex>$w804.dex))){
                  $w804.dex=$w804.cdex;
                }
                (yield* msg_print("You feel more limber!"));
                prt_dexterity();
                ident=true;
                break;
              }
              case 27:{
                var $w805=py.stat;
                if((($w805.cdex<$w805.dex))){
                  $w805.cdex=$w805.dex;
                  (yield* msg_print("You feel less clumsy."));
                  prt_dexterity();
                  ident=true;
                }
                break;
              }
              case 28:{
                var $w806=py.stat;
                if((($w806.ccon<$w806.con))){
                  $w806.ccon=$w806.con;
                  (yield* msg_print("You feel your health returning!"));
                  prt_constitution();
                  ident=true;
                }
                break;
              }
              case 29:{
                cure_blindness();
                break;
              }
              case 30:{
                cure_confusion();
                break;
              }
              case 31:{
                cure_poison();
                break;
              }
              case 32:{
                var $w807=py.misc;
                var $w808=class_[$w807.pclass];
                if(($w808.mspell)){
                  ident=(yield* learn_spell({get v(){return redraw},set v($x){redraw=$x}}));
                  if((redraw)){
                    draw_cave();
                  }
                }else if(($w808.pspell)){
                  ident=(yield* learn_prayer());
                }
                break;
              }
              case 33:{
                (yield* msg_print("You feel your memories fade..."));
                (yield* msg_print(""));
                i4=Math.trunc(Math.fround($rdiv(py.misc.exp,Math.fround(5.0))));
                (yield* lose_exp((randint(i4)+i4)));
                ident=true;
                break;
              }
              case 34:{
                var $w809=py.flags;
                $w809.poisoned=0;
                if((($w809.food>150))){
                  $w809.food=150;
                }
                $w809.paralysis=4;
                (yield* msg_print("The potion makes you vomit!"));
                ident=true;
                break;
              }
              case 35:{
                py.flags.invuln=((py.flags.invuln+randint(10))+10);
                ident=true;
                break;
              }
              case 36:{
                py.flags.hero=((py.flags.hero+randint(25))+25);
                ident=true;
                break;
              }
              case 37:{
                py.flags.shero=((py.flags.shero+randint(25))+25);
                ident=true;
                break;
              }
              case 38:{
                ident=remove_fear();
                break;
              }
              case 39:{
                ident=(yield* restore_level());
                break;
              }
              case 40:{
                var $w810=py.flags;
                $w810.resist_heat=(($w810.resist_heat+randint(10))+10);
                break;
              }
              case 41:{
                var $w811=py.flags;
                $w811.resist_cold=(($w811.resist_cold+randint(10))+10);
                break;
              }
              case 42:{
                detect_inv2((randint(12)+12));
                break;
              }
              case 43:{
                ident=(yield* slow_poison());
                break;
              }
              case 44:{
                ident=cure_poison();
                break;
              }
              case 45:{
                var $w812=py.misc;
                if((($w812.cmana<$w812.mana))){
                  $w812.cmana=Math.fround($w812.mana);
                  ident=true;
                  (yield* msg_print("Your feel your head clear..."));
                }
                break;
              }
              case 46:{
                var $w813=py.flags;
                $w813.tim_infra=(($w813.tim_infra+100)+randint(100));
                ident=true;
                (yield* msg_print("Your eyes begin to tingle."));
                break;
              }
              case 47:{
                break;
              }
              case 48:{
                break;
              }
              case 49:{
                break;
              }
              case 50:{
                break;
              }
              case 51:{
                break;
              }
              case 52:{
                break;
              }
              case 53:{
                break;
              }
              case 54:{
                break;
              }
              case 55:{
                break;
              }
              case 56:{
                break;
              }
              case 57:{
                break;
              }
              case 58:{
                break;
              }
              case 59:{
                break;
              }
              case 60:{
                break;
              }
              case 61:{
                break;
              }
              case 62:{
                break;
              }
              default:{
              }
            }
          }
          /* End of Potions... */
          if((ident)){
            identify($clone(inventory[item_val]));
          }
          if((($w789.flags!==0))){
            var $w815=py.misc;
            $w815.exp=($w815.exp+$round(Math.fround($rdiv($w789.level,$w815.lev))));
            (yield* prt_experience());
          }
          (yield* add_food($w789.p1));
          (yield* desc_remain(item_val));
          inven_destroy(item_val);
        }else if((redraw)){
          draw_cave();
        }
      }else{
        (yield* msg_print("You are not carrying any potions."));
      }
    }else{
      (yield* msg_print("But you are not carrying anything."));
    }
  }
  /* Eat some food...					-RAK- */
  function* eat(){
    var i1=0;
    var i2=0;
    var i3=0;
    var item_val=0;
    var out_val="";
    var redraw=false;
    var ident=false;
    reset_flag=true;
    if(((inven_ctr>0))){
      if((find_range($S48,{get v(){return i2},set v($x){i2=$x}},{get v(){return i3},set v($x){i3=$x}}))){
        redraw=false;
        if(((yield* get_item({get v(){return item_val},set v($x){item_val=$x}},"Eat what?",{get v(){return redraw},set v($x){redraw=$x}},i2,i3)))){
          var $w816=inventory[item_val];
          if((redraw)){
            draw_cave();
          }
          reset_flag=false;
          i1=$w816.flags;
          ident=false;
          while(((i1>0))){
            i2=bit_pos({get v(){return i1},set v($x){i1=$x}});
            /* Foods */
            switch((i2)){
              case 1:{
                var $w817=py.flags;
                $w817.poisoned=(($w817.poisoned+randint(10))+$w816.level);
                ident=true;
                break;
              }
              case 2:{
                var $w818=py.flags;
                $w818.blind=((($w818.blind+randint(250))+(10*$w816.level))+100);
                draw_cave();
                (yield* msg_print("A veil of darkness surrounds you."));
                ident=true;
                break;
              }
              case 3:{
                var $w819=py.flags;
                $w819.afraid=(($w819.afraid+randint(10))+$w816.level);
                (yield* msg_print("You feel terrified!"));
                ident=true;
                break;
              }
              case 4:{
                var $w820=py.flags;
                $w820.confused=(($w820.confused+randint(10))+$w816.level);
                (yield* msg_print("You feel drugged."));
                break;
              }
              case 5:{
                var $w821=py.flags;
                $w821.image=((($w821.image+randint(200))+(25*$w816.level))+200);
                break;
              }
              case 6:{
                ident=cure_poison();
                break;
              }
              case 7:{
                ident=cure_blindness();
                break;
              }
              case 8:{
                var $w822=py.flags;
                if((($w822.afraid>1))){
                  $w822.afraid=1;
                  ident=true;
                }
                break;
              }
              case 9:{
                ident=cure_confusion();
                break;
              }
              case 10:{
                ident=(yield* lose_str());
                break;
              }
              case 11:{
                ident=(yield* lose_con());
                break;
              }
              case 12:{
                ident=(yield* lose_int());
                break;
              }
              case 13:{
                ident=(yield* lose_wis());
                break;
              }
              case 14:{
                ident=(yield* lose_dex());
                break;
              }
              case 15:{
                ident=(yield* lose_chr());
                break;
              }
              case 16:{
                var $w823=py.stat;
                if((($w823.str>$w823.cstr))){
                  $w823.cstr=$w823.str;
                  (yield* msg_print("You feel your strength returning."));
                  prt_strength();
                  ident=true;
                }
                break;
              }
              case 17:{
                var $w824=py.stat;
                if((($w824.con>$w824.ccon))){
                  $w824.ccon=$w824.con;
                  (yield* msg_print("You feel your health returning."));
                  prt_constitution();
                  ident=true;
                }
                break;
              }
              case 18:{
                var $w825=py.stat;
                if(((py.stat.int>$w825.cint))){
                  $w825.cint=py.stat.int;
                  (yield* msg_print("Your head spins a moment."));
                  prt_intelligence();
                  ident=true;
                }
                break;
              }
              case 19:{
                var $w826=py.stat;
                if((($w826.wis>$w826.cwis))){
                  $w826.cwis=$w826.wis;
                  (yield* msg_print("You feel your wisdom returning."));
                  prt_wisdom();
                  ident=true;
                }
                break;
              }
              case 20:{
                var $w827=py.stat;
                if((($w827.dex>$w827.cdex))){
                  $w827.cdex=$w827.dex;
                  (yield* msg_print("You more dexteritous."));
                  prt_dexterity();
                  ident=true;
                }
                break;
              }
              case 21:{
                var $w828=py.stat;
                if((($w828.chr>$w828.cchr))){
                  $w828.cchr=$w828.chr;
                  (yield* msg_print("Your skins starts itching."));
                  prt_charisma();
                  ident=true;
                }
                break;
              }
              case 22:{
                ident=(yield* hp_player(randint(3),"poisoness food."));
                break;
              }
              case 23:{
                ident=(yield* hp_player(randint(6),"poisoness food."));
                break;
              }
              case 24:{
                ident=(yield* hp_player(randint(12),"poisoness food."));
                break;
              }
              case 25:{
                ident=(yield* hp_player(damroll("3d6"),"poisoness food."));
                break;
              }
              case 26:{
                ident=(yield* hp_player(damroll("3d12"),"poisoness food."));
                break;
              }
              case 27:{
                ident=(yield* hp_player((-randint(4)),"poisoness food."));
                break;
              }
              case 28:{
                ident=(yield* hp_player((-randint(8)),"poisoness food."));
                break;
              }
              case 29:{
                ident=(yield* hp_player((-damroll("2d8")),"poisoness food."));
                break;
              }
              case 30:{
                ident=(yield* hp_player((-damroll("3d8")),"poisoness food."));
                break;
              }
              case 31:{
                var $w829=py.misc;
                $w829.mhp=($w829.mhp-1);
                if((($w829.mhp<$w829.chp))){
                  $w829.chp=Math.fround($w829.mhp);
                }
                (yield* take_hit(1,"poisoness food."));
                prt_mhp();
                prt_chp();
                ident=true;
                break;
              }
              default:{
              }
            }
          }
          /* End of food actions... */
          if((ident)){
            identify($clone(inventory[item_val]));
          }
          if((($w816.flags!==0))){
            var $w831=py.misc;
            $w831.exp=($w831.exp+$round(Math.fround($rdiv($w816.level,$w831.lev))));
            (yield* prt_experience());
          }
          (yield* add_food($w816.p1));
          py.flags.status=((4294967292&py.flags.status)>>>0);
          prt_hunger();
          (yield* desc_remain(item_val));
          inven_destroy(item_val);
        }else if((redraw)){
          draw_cave();
        }
      }else{
        (yield* msg_print("You are not carrying any food."));
      }
    }else{
      (yield* msg_print("But you are not carrying anything."));
    }
  }
  /* Wands for the aiming... */
  function* aim(){
    var i1=0;
    var i2=0;
    var i3=0;
    var i4=0;
    var chance=0;
    var dir=0;
    var item_val=0;
    var dumy=0;
    var y_dumy=0;
    var x_dumy=0;
    var out_val="";
    var redraw=false;
    var ident=false;
    redraw=false;
    reset_flag=true;
    if(((inven_ctr>0))){
      if((find_range($S51,{get v(){return i2},set v($x){i2=$x}},{get v(){return i3},set v($x){i3=$x}}))){
        if(((yield* get_item({get v(){return item_val},set v($x){item_val=$x}},"Aim which wand?",{get v(){return redraw},set v($x){redraw=$x}},i2,i3)))){
          var $w832=inventory[item_val];
          if((redraw)){
            draw_cave();
          }
          reset_flag=false;
          redraw=false;
          y_dumy=char_row;
          x_dumy=char_col;
          if(((yield* get_dir("Which direction?",{get v(){return dir},set v($x){dir=$x}},{get v(){return dumy},set v($x){dumy=$x}},{get v(){return y_dumy},set v($x){y_dumy=$x}},{get v(){return x_dumy},set v($x){x_dumy=$x}})))){
            if(((py.flags.confused>0))){
              (yield* msg_print("You are confused..."));
              do{
                dir=randint(9);
              }while(!(((dir!==5))));
            }
            i1=$w832.flags;
            ident=false;
            var $w833=py.misc;
            chance=((($w833.save+$w833.lev)+int_adj())-$w832.level);
            if(((py.flags.confused>0))){
              chance=Math.trunc(Math.fround($rdiv(chance,Math.fround(2.0))));
            }
            if(((chance<0))){
              chance=0;
            }
            if(((randint(chance)<use_device))){
              (yield* msg_print("You failed to use the wand properly."));
            }else if((($w832.p1>0))){
              $w832.p1=($w832.p1-1);
              while(((i1>0))){
                i2=bit_pos({get v(){return i1},set v($x){i1=$x}});
                i3=char_row;
                i4=char_col;
                /* Wands */
                switch((i2)){
                  case 1:{
                    (yield* msg_print("A line of blue shimmering light appears."));
                    (yield* light_line(dir,char_row,char_col));
                    ident=true;
                    break;
                  }
                  case 2:{
                    (yield* fire_bolt(1,dir,i3,i4,damroll("3d8"),"Lightning Bolt"));
                    ident=true;
                    break;
                  }
                  case 3:{
                    (yield* fire_bolt(4,dir,i3,i4,damroll("4d8"),"Frost Bolt"));
                    ident=true;
                    break;
                  }
                  case 4:{
                    (yield* fire_bolt(5,dir,i3,i4,damroll("6d8"),"Fire Bolt"));
                    ident=true;
                    break;
                  }
                  case 5:{
                    ident=(yield* wall_to_mud(dir,i3,i4));
                    break;
                  }
                  case 6:{
                    ident=(yield* poly_monster(dir,i3,i4));
                    break;
                  }
                  case 7:{
                    ident=(yield* hp_monster(dir,i3,i4,(-damroll("4d6"))));
                    break;
                  }
                  case 8:{
                    ident=(yield* speed_monster(dir,i3,i4,1));
                    break;
                  }
                  case 9:{
                    ident=(yield* speed_monster(dir,i3,i4,(-1)));
                    break;
                  }
                  case 10:{
                    ident=(yield* confuse_monster(dir,i3,i4));
                    break;
                  }
                  case 11:{
                    ident=(yield* sleep_monster(dir,i3,i4));
                    break;
                  }
                  case 12:{
                    ident=(yield* drain_life(dir,i3,i4));
                    break;
                  }
                  case 13:{
                    ident=(yield* td_destroy2(dir,i3,i4));
                    break;
                  }
                  case 14:{
                    (yield* fire_bolt(0,dir,i3,i4,damroll("2d6"),"Magic Missile"));
                    ident=true;
                    break;
                  }
                  case 15:{
                    ident=(yield* build_wall(dir,i3,i4));
                    break;
                  }
                  case 16:{
                    ident=clone_monster(dir,i3,i4);
                    break;
                  }
                  case 17:{
                    ident=teleport_monster(dir,i3,i4);
                    break;
                  }
                  case 18:{
                    ident=(yield* disarm_all(dir,i3,i4));
                    break;
                  }
                  case 19:{
                    (yield* fire_ball(1,dir,i3,i4,24,"Lightning Ball"));
                    ident=true;
                    break;
                  }
                  case 20:{
                    (yield* fire_ball(4,dir,i3,i4,32,"Cold Ball"));
                    ident=true;
                    break;
                  }
                  case 21:{
                    (yield* fire_ball(5,dir,i3,i4,48,"Fire Ball"));
                    ident=true;
                    break;
                  }
                  case 22:{
                    (yield* fire_ball(2,dir,i3,i4,8,"Stinking Cloud"));
                    ident=true;
                    break;
                  }
                  case 23:{
                    (yield* fire_ball(3,dir,i3,i4,40,"Acid Ball"));
                    ident=true;
                    break;
                  }
                  case 24:{
                    i1=Math.pow(2,((randint(24)-1)));
                    break;
                  }
                  default:{
                  }
                }
              }
              /* End of Wands... */
              if((ident)){
                identify($clone(inventory[item_val]));
              }
              if((($w832.flags!==0))){
                var $w835=py.misc;
                $w835.exp=($w835.exp+$round(Math.fround($rdiv($w832.level,$w835.lev))));
                (yield* prt_experience());
              }
              (yield* desc_charges(item_val));
            }
          }
        }
      }else{
        (yield* msg_print("You are not carrying any wands."));
      }
    }else{
      (yield* msg_print("But you are not carrying anything."));
    }
    if((redraw)){
      draw_cave();
    }
  }
  /* Use a staff...					-RAK- */
  function* use(){
    var i1=0;
    var i2=0;
    var i3=0;
    var item_val=0;
    var chance=0;
    var out_val="";
    var redraw=false;
    var ident=false;
    reset_flag=true;
    if(((inven_ctr>0))){
      if((find_range($S52,{get v(){return i2},set v($x){i2=$x}},{get v(){return i3},set v($x){i3=$x}}))){
        redraw=false;
        if(((yield* get_item({get v(){return item_val},set v($x){item_val=$x}},"Use which staff?",{get v(){return redraw},set v($x){redraw=$x}},i2,i3)))){
          var $w836=inventory[item_val];
          if((redraw)){
            draw_cave();
          }
          reset_flag=false;
          var $w837=py.misc;
          chance=(((($w837.save+$w837.lev)+int_adj())-$w836.level)-5);
          if(((py.flags.confused>0))){
            chance=Math.trunc(Math.fround($rdiv(chance,Math.fround(2.0))));
          }
          if(((chance<0))){
            chance=0;
          }
          if(((randint(chance)<use_device))){
            (yield* msg_print("You failed to use the staff properly."));
          }else if((($w836.p1>0))){
            i1=$w836.flags;
            ident=false;
            $w836.p1=($w836.p1-1);
            while(((i1>0))){
              i2=bit_pos({get v(){return i1},set v($x){i1=$x}});
              /* Staffs... */
              switch((i2)){
                case 1:{
                  ident=(yield* light_area(char_row,char_col));
                  break;
                }
                case 2:{
                  ident=detect_sdoor();
                  break;
                }
                case 3:{
                  ident=detect_trap();
                  break;
                }
                case 4:{
                  ident=detect_treasure();
                  break;
                }
                case 5:{
                  ident=detect_object();
                  break;
                }
                case 6:{
                  (yield* teleport(100));
                  ident=true;
                  break;
                }
                case 7:{
                  ident=(yield* earthquake());
                  break;
                }
                case 8:{
                  for(var $e838=randint(4),$ie838=1;$ie838<=$e838;$ie838++){
                    i3=$ie838;
                    y=char_row;
                    x=char_col;
                    summon_monster({get v(){return y},set v($x){y=$x}},{get v(){return x},set v($x){x=$x}},false);
                  }
                  ident=true;
                  break;
                }
                case 9:{
                  ident=(yield* genocide());
                  break;
                }
                case 10:{
                  ident=(yield* destroy_area(char_row,char_col));
                  break;
                }
                case 11:{
                  ident=(yield* starlite(char_row,char_col));
                  break;
                }
                case 12:{
                  ident=(yield* speed_monsters(1));
                  break;
                }
                case 13:{
                  ident=(yield* speed_monsters((-1)));
                  break;
                }
                case 14:{
                  ident=(yield* sleep_monsters2());
                  break;
                }
                case 15:{
                  ident=(yield* hp_player(randint(8),"a staff."));
                  break;
                }
                case 16:{
                  ident=(yield* detect_invisible());
                  break;
                }
                case 17:{
                  py.flags.fast=((py.flags.fast+randint(30))+15);
                  ident=true;
                  break;
                }
                case 18:{
                  py.flags.slow=((py.flags.slow+randint(30))+15);
                  ident=true;
                  break;
                }
                case 19:{
                  ident=mass_poly();
                  break;
                }
                case 20:{
                  if((remove_curse())){
                    (yield* msg_print("The staff glows blue for a moment..."));
                    ident=true;
                  }
                  break;
                }
                case 21:{
                  ident=(yield* detect_evil());
                  break;
                }
                case 22:{
                  if(((((cure_blindness())||(cure_poison()))||(cure_confusion())))){
                    ident=true;
                  }
                  break;
                }
                case 23:{
                  ident=(yield* dispell_creature(4,60));
                  break;
                }
                case 24:{
                  ident=mass_genocide();
                  break;
                }
                case 25:{
                  ident=(yield* unlight_area(char_row,char_col));
                  break;
                }
                default:{
                }
              }
            }
            /* End of staff actions... */
            if((ident)){
              identify($clone(inventory[item_val]));
            }
            if((($w836.flags!==0))){
              var $w840=py.misc;
              $w840.exp=($w840.exp+$round(Math.fround($rdiv($w836.level,$w840.lev))));
              (yield* prt_experience());
            }
            (yield* desc_charges(item_val));
          }
        }else if((redraw)){
          draw_cave();
        }
      }else{
        (yield* msg_print("You are not carrying any staffs."));
      }
    }else{
      (yield* msg_print("But you are not carrying anything."));
    }
  }
  /* Spell casting */
  /* Throw a magic spell					-RAK- */
  function* cast(){
    var i1=0;
    var i2=0;
    var item_val=0;
    var dir=0;
    var choice=0;
    var chance=0;
    var dumy=0;
    var y_dumy=0;
    var x_dumy=0;
    var redraw=false;
    reset_flag=true;
    if(((py.flags.blind>0))){
      (yield* msg_print("You can't see to read your spell book!"));
    }else if((no_light())){
      (yield* msg_print("You have no light to read by."));
    }else if(((py.flags.confused>0))){
      (yield* msg_print("You are too confused..."));
    }else if((class_[py.misc.pclass].mspell)){
      if(((inven_ctr>0))){
        if((find_range($S53,{get v(){return i1},set v($x){i1=$x}},{get v(){return i2},set v($x){i2=$x}}))){
          redraw=false;
          if(((yield* get_item({get v(){return item_val},set v($x){item_val=$x}},"Use which spell-book?",{get v(){return redraw},set v($x){redraw=$x}},i1,i2)))){
            if(((yield* cast_spell("Cast which spell?",item_val,{get v(){return choice},set v($x){choice=$x}},{get v(){return chance},set v($x){chance=$x}},{get v(){return redraw},set v($x){redraw=$x}})))){
              var $w841=magic_spell[py.misc.pclass][choice];
              reset_flag=false;
              if(((randint(100)<chance))){
                (yield* msg_print("You failed to get the spell off!"));
              }else{
                y_dumy=char_row;
                x_dumy=char_col;
                /* Spells... */
                switch(choice){
                  case 1:{
                    if(((yield* get_dir("Which direction?",{get v(){return dir},set v($x){dir=$x}},{get v(){return dumy},set v($x){dumy=$x}},{get v(){return y_dumy},set v($x){y_dumy=$x}},{get v(){return x_dumy},set v($x){x_dumy=$x}})))){
                      (yield* fire_bolt(0,dir,char_row,char_col,(damroll("2d6")+1),"Magic Missile"));
                    }
                    break;
                  }
                  case 2:{
                    (yield* detect_monsters());
                    break;
                  }
                  case 3:{
                    (yield* teleport(10));
                    break;
                  }
                  case 4:{
                    (yield* light_area(char_row,char_col));
                    break;
                  }
                  case 5:{
                    (yield* hp_player(damroll("4d4"),"a magic spell."));
                    break;
                  }
                  case 6:{
                    detect_sdoor();
                    detect_trap();
                    break;
                  }
                  case 7:{
                    if(((yield* get_dir("Which direction?",{get v(){return dir},set v($x){dir=$x}},{get v(){return dumy},set v($x){dumy=$x}},{get v(){return y_dumy},set v($x){y_dumy=$x}},{get v(){return x_dumy},set v($x){x_dumy=$x}})))){
                      (yield* fire_ball(2,dir,char_row,char_col,9,"Stinking Cloud"));
                    }
                    break;
                  }
                  case 8:{
                    if(((yield* get_dir("Which direction?",{get v(){return dir},set v($x){dir=$x}},{get v(){return dumy},set v($x){dumy=$x}},{get v(){return y_dumy},set v($x){y_dumy=$x}},{get v(){return x_dumy},set v($x){x_dumy=$x}})))){
                      (yield* confuse_monster(dir,char_row,char_col));
                    }
                    break;
                  }
                  case 9:{
                    if(((yield* get_dir("Which direction?",{get v(){return dir},set v($x){dir=$x}},{get v(){return dumy},set v($x){dumy=$x}},{get v(){return y_dumy},set v($x){y_dumy=$x}},{get v(){return x_dumy},set v($x){x_dumy=$x}})))){
                      (yield* fire_bolt(1,dir,char_row,char_col,(damroll("3d8")+1),"Lightning Bolt"));
                    }
                    break;
                  }
                  case 10:{
                    td_destroy();
                    break;
                  }
                  case 11:{
                    if(((yield* get_dir("Which direction?",{get v(){return dir},set v($x){dir=$x}},{get v(){return dumy},set v($x){dumy=$x}},{get v(){return y_dumy},set v($x){y_dumy=$x}},{get v(){return x_dumy},set v($x){x_dumy=$x}})))){
                      (yield* sleep_monster(dir,char_row,char_col));
                    }
                    break;
                  }
                  case 12:{
                    cure_poison();
                    break;
                  }
                  case 13:{
                    (yield* teleport((py.misc.lev*5)));
                    break;
                  }
                  case 14:{
                    for(var $e842=(inven_max-1),$ie842=23;$ie842<=$e842;$ie842++){
                      i1=$ie842;
                      var $w843=inventory[i1];
                      $w843.flags=(($w843.flags&2147483647)>>>0);
                    }
                    break;
                  }
                  case 15:{
                    if(((yield* get_dir("Which direction?",{get v(){return dir},set v($x){dir=$x}},{get v(){return dumy},set v($x){dumy=$x}},{get v(){return y_dumy},set v($x){y_dumy=$x}},{get v(){return x_dumy},set v($x){x_dumy=$x}})))){
                      (yield* fire_bolt(4,dir,char_row,char_col,(damroll("4d8")+1),"Frost Bolt"));
                    }
                    break;
                  }
                  case 16:{
                    if(((yield* get_dir("Which direction?",{get v(){return dir},set v($x){dir=$x}},{get v(){return dumy},set v($x){dumy=$x}},{get v(){return y_dumy},set v($x){y_dumy=$x}},{get v(){return x_dumy},set v($x){x_dumy=$x}})))){
                      (yield* wall_to_mud(dir,char_row,char_col));
                    }
                    break;
                  }
                  case 17:{
                    create_food();
                    break;
                  }
                  case 18:{
                    (yield* recharge(20));
                    break;
                  }
                  case 19:{
                    (yield* sleep_monsters1(char_row,char_col));
                    break;
                  }
                  case 20:{
                    if(((yield* get_dir("Which direction?",{get v(){return dir},set v($x){dir=$x}},{get v(){return dumy},set v($x){dumy=$x}},{get v(){return y_dumy},set v($x){y_dumy=$x}},{get v(){return x_dumy},set v($x){x_dumy=$x}})))){
                      (yield* poly_monster(dir,char_row,char_col));
                    }
                    break;
                  }
                  case 21:{
                    (yield* ident_spell());
                    break;
                  }
                  case 22:{
                    (yield* sleep_monsters2());
                    break;
                  }
                  case 23:{
                    if(((yield* get_dir("Which direction?",{get v(){return dir},set v($x){dir=$x}},{get v(){return dumy},set v($x){dumy=$x}},{get v(){return y_dumy},set v($x){y_dumy=$x}},{get v(){return x_dumy},set v($x){x_dumy=$x}})))){
                      (yield* fire_bolt(5,dir,char_row,char_col,(damroll("6d8")+1),"Fire Bolt"));
                    }
                    break;
                  }
                  case 24:{
                    if(((yield* get_dir("Which direction?",{get v(){return dir},set v($x){dir=$x}},{get v(){return dumy},set v($x){dumy=$x}},{get v(){return y_dumy},set v($x){y_dumy=$x}},{get v(){return x_dumy},set v($x){x_dumy=$x}})))){
                      (yield* speed_monster(dir,char_row,char_col,(-1)));
                    }
                    break;
                  }
                  case 25:{
                    if(((yield* get_dir("Which direction?",{get v(){return dir},set v($x){dir=$x}},{get v(){return dumy},set v($x){dumy=$x}},{get v(){return y_dumy},set v($x){y_dumy=$x}},{get v(){return x_dumy},set v($x){x_dumy=$x}})))){
                      (yield* fire_ball(4,dir,char_row,char_col,33,"Frost Ball"));
                    }
                    break;
                  }
                  case 26:{
                    (yield* recharge(50));
                    break;
                  }
                  case 27:{
                    if(((yield* get_dir("Which direction?",{get v(){return dir},set v($x){dir=$x}},{get v(){return dumy},set v($x){dumy=$x}},{get v(){return y_dumy},set v($x){y_dumy=$x}},{get v(){return x_dumy},set v($x){x_dumy=$x}})))){
                      teleport_monster(dir,char_row,char_col);
                    }
                    break;
                  }
                  case 28:{
                    var $w844=py.flags;
                    $w844.fast=(($w844.fast+randint(20))+py.misc.lev);
                    break;
                  }
                  case 29:{
                    if(((yield* get_dir("Which direction?",{get v(){return dir},set v($x){dir=$x}},{get v(){return dumy},set v($x){dumy=$x}},{get v(){return y_dumy},set v($x){y_dumy=$x}},{get v(){return x_dumy},set v($x){x_dumy=$x}})))){
                      (yield* fire_ball(5,dir,char_row,char_col,49,"Fire Ball"));
                    }
                    break;
                  }
                  case 30:{
                    (yield* destroy_area(char_row,char_col));
                    break;
                  }
                  case 31:{
                    (yield* genocide());
                    break;
                  }
                  default:{
                  }
                }
                /* End of spells... */
                if((!(reset_flag))){
                  var $w846=py.misc;
                  $w846.exp=($w846.exp+$w841.sexp);
                  (yield* prt_experience());
                  $w841.sexp=0;
                }
              }
              var $w847=py.misc;
              if((!(reset_flag))){
                if((($w841.smana>$w847.cmana))){
                  (yield* msg_print("You faint from the effort!"));
                  py.flags.paralysis=randint((5*Math.trunc(Math.fround($w841.smana-$w847.cmana))));
                  $w847.cmana=Math.fround(0);
                  if(((randint(3)===1))){
                    (yield* msg_print("You have damaged your health!"));
                    py.stat.ccon=de_statp(py.stat.ccon);
                    prt_constitution();
                  }
                }else{
                  $w847.cmana=Math.fround(Math.fround($w847.cmana-$w841.smana));
                }
                prt_cmana();
              }
            }
          }else if((redraw)){
            draw_cave();
          }
        }else{
          (yield* msg_print("But you are not carrying any spell-books!"));
        }
      }else{
        (yield* msg_print("But you are not carrying any spell-books!"));
      }
    }else{
      (yield* msg_print("You can't cast spells!"));
    }
  }
  /* Pray like HELL...					-RAK- */
  function* pray(){
    var i1=0;
    var i2=0;
    var item_val=0;
    var dir=0;
    var choice=0;
    var chance=0;
    var dumy=0;
    var y_dumy=0;
    var x_dumy=0;
    var redraw=false;
    reset_flag=true;
    if(((py.flags.blind>0))){
      (yield* msg_print("You can't see to read your prayer!"));
    }else if((no_light())){
      (yield* msg_print("You have no light to read by."));
    }else if(((py.flags.confused>0))){
      (yield* msg_print("You are too confused..."));
    }else if((class_[py.misc.pclass].pspell)){
      if(((inven_ctr>0))){
        if((find_range($S54,{get v(){return i1},set v($x){i1=$x}},{get v(){return i2},set v($x){i2=$x}}))){
          redraw=false;
          if(((yield* get_item({get v(){return item_val},set v($x){item_val=$x}},"Use which Holy Book?",{get v(){return redraw},set v($x){redraw=$x}},i1,i2)))){
            if(((yield* cast_spell("Recite which prayer?",item_val,{get v(){return choice},set v($x){choice=$x}},{get v(){return chance},set v($x){chance=$x}},{get v(){return redraw},set v($x){redraw=$x}})))){
              var $w848=magic_spell[py.misc.pclass][choice];
              reset_flag=false;
              if(((randint(100)<chance))){
                (yield* msg_print("You lost your concentration!"));
              }else{
                y_dumy=char_row;
                x_dumy=char_col;
                /* Prayers... */
                switch(choice){
                  case 1:{
                    (yield* detect_evil());
                    break;
                  }
                  case 2:{
                    (yield* hp_player(damroll("3d3"),"a prayer."));
                    break;
                  }
                  case 3:{
                    bless((randint(12)+12));
                    break;
                  }
                  case 4:{
                    remove_fear();
                    break;
                  }
                  case 5:{
                    (yield* light_area(char_row,char_col));
                    break;
                  }
                  case 6:{
                    detect_trap();
                    break;
                  }
                  case 7:{
                    detect_sdoor();
                    break;
                  }
                  case 8:{
                    (yield* slow_poison());
                    break;
                  }
                  case 9:{
                    if(((yield* get_dir("Which direction?",{get v(){return dir},set v($x){dir=$x}},{get v(){return dumy},set v($x){dumy=$x}},{get v(){return y_dumy},set v($x){y_dumy=$x}},{get v(){return x_dumy},set v($x){x_dumy=$x}})))){
                      (yield* confuse_monster(dir,char_row,char_col));
                    }
                    break;
                  }
                  case 10:{
                    (yield* teleport((py.misc.lev*3)));
                    break;
                  }
                  case 11:{
                    (yield* hp_player(damroll("4d4"),"a prayer."));
                    break;
                  }
                  case 12:{
                    bless((randint(24)+24));
                    break;
                  }
                  case 13:{
                    (yield* sleep_monsters1(char_row,char_col));
                    break;
                  }
                  case 14:{
                    create_food();
                    break;
                  }
                  case 15:{
                    for(var $e849=(inven_max-1),$ie849=1;$ie849<=$e849;$ie849++){
                      i1=$ie849;
                      var $w850=inventory[i1];
                      $w850.flags=(($w850.flags&2147483647)>>>0);
                    }
                    break;
                  }
                  case 16:{
                    var $w851=py.flags;
                    $w851.resist_heat=(($w851.resist_heat+randint(10))+10);
                    $w851.resist_cold=(($w851.resist_cold+randint(10))+10);
                    break;
                  }
                  case 17:{
                    cure_poison();
                    break;
                  }
                  case 18:{
                    if(((yield* get_dir("Which direction?",{get v(){return dir},set v($x){dir=$x}},{get v(){return dumy},set v($x){dumy=$x}},{get v(){return y_dumy},set v($x){y_dumy=$x}},{get v(){return x_dumy},set v($x){x_dumy=$x}})))){
                      (yield* fire_ball(6,dir,char_row,char_col,(damroll("3d6")+py.misc.lev),"Black Sphere"));
                    }
                    break;
                  }
                  case 19:{
                    (yield* hp_player(damroll("8d4"),"a prayer."));
                    break;
                  }
                  case 20:{
                    detect_inv2((randint(24)+24));
                    break;
                  }
                  case 21:{
                    protect_evil();
                    break;
                  }
                  case 22:{
                    (yield* earthquake());
                    break;
                  }
                  case 23:{
                    map_area();
                    break;
                  }
                  case 24:{
                    (yield* hp_player(damroll("16d4"),"a prayer."));
                    break;
                  }
                  case 25:{
                    (yield* turn_undead());
                    break;
                  }
                  case 26:{
                    bless((randint(48)+48));
                    break;
                  }
                  case 27:{
                    (yield* dispell_creature(8,(3*py.misc.lev)));
                    break;
                  }
                  case 28:{
                    (yield* hp_player(200,"a prayer."));
                    break;
                  }
                  case 29:{
                    (yield* dispell_creature(4,(3*py.misc.lev)));
                    break;
                  }
                  case 30:{
                    warding_glyph();
                    break;
                  }
                  case 31:{
                    (yield* dispell_creature(4,(4*py.misc.lev)));
                    cure_confusion();
                    remove_fear();
                    cure_poison();
                    cure_blindness();
                    (yield* hp_player(1000,"a prayer."));
                    break;
                  }
                  default:{
                  }
                }
                /* End of prayers... */
                if((!(reset_flag))){
                  var $w853=py.misc;
                  $w853.exp=($w853.exp+$w848.sexp);
                  (yield* prt_experience());
                  $w848.sexp=0;
                }
              }
              var $w854=py.misc;
              if((!(reset_flag))){
                if((($w848.smana>$w854.cmana))){
                  (yield* msg_print("You faint from fatigue!"));
                  py.flags.paralysis=randint((5*Math.trunc(Math.fround($w848.smana-$w854.cmana))));
                  $w854.cmana=Math.fround(0);
                  if(((randint(3)===1))){
                    (yield* msg_print("You have damaged your health!"));
                    py.stat.ccon=de_statp(py.stat.ccon);
                    prt_constitution();
                  }
                }else{
                  $w854.cmana=Math.fround(Math.fround($w854.cmana-$w848.smana));
                }
                prt_cmana();
              }
            }
          }else if((redraw)){
            draw_cave();
          }
        }else{
          (yield* msg_print("But you are not carrying any Holy Books!"));
        }
      }else{
        (yield* msg_print("But you are not carrying any Holy Books!"));
      }
    }else{
      (yield* msg_print("Pray hard enough and your prayers may be answered."));
    }
  }
  /* Main procedure for dungeon... 			-RAK- */
  /* Note: There is a lot of prelinimary magic going on here at first */
  /* Check light status for setup */
  var $w855=inventory[33];
  if((($w855.p1>0))){
    player_light=true;
  }else{
    player_light=false;
  }
  /* Check for a maximum level */
  var $w856=py.misc;
  if(((dun_level>$w856.max_lev))){
    $w856.max_lev=dun_level;
  }
  /* Set up the character co-ords */
  if(((((char_row===(-1)))||((char_col===(-1)))))){
    new_spot({get v(){return char_row},set v($x){char_row=$x}},{get v(){return char_col},set v($x){char_col=$x}});
  }
  /* Reset flags and initialize variables */
  moria_flag=false;
  cave_flag=false;
  find_flag=false;
  search_flag=false;
  teleport_flag=false;
  mon_tot_mult=0;
  cave[char_row][char_col].cptr=1;
  old_chp=Math.trunc(py.misc.chp);
  old_cmana=Math.trunc(py.misc.cmana);
  /* Light up the area around character */
  (yield* move_char(5));
  /* Light, but do not move critters */
  (yield* creatures(false));
  /* Print the depth */
  prt_depth();
  /* Loop until dead, or new level */
  do{
    /* Increment turn counter */
    turn=(turn+1);
    /* Check for game hours */
    if((!(wizard1))){
      if(((($mod(turn,250))===1))){
        if((!(check_time()))){
          if(((closing_flag>4))){
            if((search_flag)){
              (yield* search_off());
            }
            if(((py.flags.rest>0))){
              rest_off();
            }
            find_flag=false;
            (yield* msg_print("The gates to Moria are now closed."));
            (yield* msg_print(""));
            do{
              (yield* save_char());
            }while(!((false)));
          }else{
            if((search_flag)){
              (yield* search_off());
            }
            if(((py.flags.rest>0))){
              rest_off();
            }
            find_flag=false;
            (yield* move_char(5));
            closing_flag=(closing_flag+1);
            (yield* msg_print("The gates to Moria are closing..."));
            (yield* msg_print("Please finish up or save your game."));
            (yield* msg_print(""));
          }
        }
      }
    }
    /* Check for creature generation */
    if(((randint(max_malloc_chance)===1))){
      alloc_monster(floor_set,1,max_sight,false);
    }
    /* Screen may need updating, used mostly for stats */
    if(((print_stat>0))){
      if(((((1&print_stat)>>>0)!==0))){
        prt_strength();
      }
      if(((((2&print_stat)>>>0)!==0))){
        prt_dexterity();
      }
      if(((((4&print_stat)>>>0)!==0))){
        prt_constitution();
      }
      if(((((8&print_stat)>>>0)!==0))){
        prt_intelligence();
      }
      if(((((16&print_stat)>>>0)!==0))){
        prt_wisdom();
      }
      if(((((32&print_stat)>>>0)!==0))){
        prt_charisma();
      }
      if(((((64&print_stat)>>>0)!==0))){
        prt_pac();
      }
      if(((((256&print_stat)>>>0)!==0))){
        prt_mhp();
      }
      if(((((512&print_stat)>>>0)!==0))){
        prt_title();
      }
      if(((((1024&print_stat)>>>0)!==0))){
        prt_level();
      }
    }
    /* Check light status */
    var $w857=inventory[33];
    if((player_light)){
      if((($w857.p1>0))){
        $w857.p1=($w857.p1-1);
        if((($w857.p1===0))){
          (yield* msg_print("Your light has gone out!"));
          player_light=false;
          find_flag=false;
          move_light(char_row,char_col,char_row,char_col);
        }else if((($w857.p1<40))){
          if(((randint(5)===1))){
            if((find_flag)){
              find_flag=false;
              move_light(char_row,char_col,char_row,char_col);
            }
            (yield* msg_print("Your light is growing faint."));
          }
        }
      }else{
        player_light=false;
        find_flag=false;
        move_light(char_row,char_col,char_row,char_col);
      }
    }else if((($w857.p1>0))){
      $w857.p1=($w857.p1-1);
      player_light=true;
      move_light(char_row,char_col,char_row,char_col);
    }
    /* Update counters and messages */
    var $w858=py.flags;
    /* Check food status */
    regen_amount=Math.fround(player_S_regen_normal);
    if((($w858.food<player_food_alert))){
      if((($w858.food<player_food_weak))){
        if((($w858.food<0))){
          regen_amount=Math.fround(0);
        }else if((($w858.food<player_food_faint))){
          regen_amount=Math.fround(player_S_regen_faint);
        }else if((($w858.food<player_food_weak))){
          regen_amount=Math.fround(player_S_regen_weak);
        }
        if(((((2&$w858.status)>>>0)===0))){
          $w858.status=((3|$w858.status)>>>0);
          (yield* msg_print("You are getting weak from hunger."));
          if((find_flag)){
            find_flag=false;
            (yield* move_char(5));
          }
          prt_hunger();
        }
        if((($w858.food<player_food_faint))){
          if(((randint(8)===1))){
            $w858.paralysis=($w858.paralysis+randint(5));
            (yield* msg_print("You faint from the lack of food."));
            if((find_flag)){
              find_flag=false;
              (yield* move_char(5));
            }
          }
        }
      }else{
        if(((((1&$w858.status)>>>0)===0))){
          $w858.status=((1|$w858.status)>>>0);
          (yield* msg_print("You are getting hungry."));
          if((find_flag)){
            find_flag=false;
            (yield* move_char(5));
          }
          prt_hunger();
        }
      }
    }
    /* Food consumtion */
    /* Note: Speeded up characters really burn up the food! */
    if((($w858.speed<0))){
      $w858.food=(($w858.food-(($w858.speed*$w858.speed)))-$w858.food_digested);
    }else{
      $w858.food=($w858.food-$w858.food_digested);
    }
    /* Regenerate */
    var $w859=py.misc;
    if(($w858.regenerate)){
      regen_amount=Math.fround(Math.fround(regen_amount*Math.fround(1.5)));
    }
    if((($w858.rest>0))){
      regen_amount=Math.fround(Math.fround(regen_amount*2));
    }
    if(((py.flags.poisoned<1))){
      if((($w859.chp<$w859.mhp))){
        regenhp(regen_amount);
      }
    }
    if((($w859.cmana<$w859.mana))){
      regenmana(regen_amount);
    }
    /* Blindness */
    if((($w858.blind>0))){
      if(((((4&$w858.status)>>>0)===0))){
        $w858.status=((4|$w858.status)>>>0);
        prt_map();
        prt_blind();
        if((search_flag)){
          (yield* search_off());
        }
      }
      $w858.blind=($w858.blind-1);
      if((($w858.blind===0))){
        $w858.status=((4294967291&$w858.status)>>>0);
        prt_blind();
        prt_map();
        (yield* msg_print("The veil of darkness lifts."));
        if((find_flag)){
          find_flag=false;
          (yield* move_char(5));
        }
      }
    }
    /* Confusion */
    if((($w858.confused>0))){
      if(((((8&$w858.status)>>>0)===0))){
        $w858.status=((8|$w858.status)>>>0);
        prt_confused();
      }
      $w858.confused=($w858.confused-1);
      if((($w858.confused===0))){
        $w858.status=((4294967287&$w858.status)>>>0);
        prt_confused();
        (yield* msg_print("You feel less confused now."));
        if((find_flag)){
          find_flag=false;
          (yield* move_char(5));
        }
      }
    }
    /* Afraid */
    if((($w858.afraid>0))){
      if(((((16&$w858.status)>>>0)===0))){
        if((((($w858.shero+$w858.hero))>0))){
          $w858.afraid=0;
        }else{
          $w858.status=((16|$w858.status)>>>0);
          prt_afraid();
        }
      }else if((((($w858.shero+$w858.hero))>0))){
        $w858.afraid=1;
      }
      $w858.afraid=($w858.afraid-1);
      if((($w858.afraid===0))){
        $w858.status=((4294967279&$w858.status)>>>0);
        prt_afraid();
        (yield* msg_print("You feel bolder now."));
        if((find_flag)){
          find_flag=false;
          (yield* move_char(5));
        }
      }
    }
    /* Poisoned */
    if((($w858.poisoned>0))){
      if(((((32&$w858.status)>>>0)===0))){
        $w858.status=((32|$w858.status)>>>0);
        prt_poisoned();
      }
      $w858.poisoned=($w858.poisoned-1);
      if((($w858.poisoned===0))){
        $w858.status=((4294967263&$w858.status)>>>0);
        prt_poisoned();
        (yield* msg_print("You feel better."));
        if((find_flag)){
          find_flag=false;
          (yield* move_char(5));
        }
      }else{
        switch(con_adj()){
          case (-4):{
            (yield* take_hit(4,"poison."));
            break;
          }
          case (-3):case (-2):{
            (yield* take_hit(3,"poison."));
            break;
          }
          case (-1):{
            (yield* take_hit(2,"poison."));
            break;
          }
          case 0:{
            (yield* take_hit(1,"poison."));
            break;
          }
          case 1:case 2:case 3:{
            if(((($mod(turn,2))===0))){
              (yield* take_hit(1,"poison."));
            }
            break;
          }
          case 4:case 5:{
            if(((($mod(turn,3))===0))){
              (yield* take_hit(1,"poison."));
            }
            break;
          }
          case 6:{
            if(((($mod(turn,4))===0))){
              (yield* take_hit(1,"poison."));
            }
            break;
          }
        }
      }
    }
    /* Fast */
    if((($w858.fast>0))){
      if(((((64&$w858.status)>>>0)===0))){
        $w858.status=((64|$w858.status)>>>0);
        (yield* msg_print("You feel yourself moving faster."));
        change_speed((-1));
        if((find_flag)){
          find_flag=false;
          (yield* move_char(5));
        }
      }
      $w858.fast=($w858.fast-1);
      if((($w858.fast===0))){
        $w858.status=((4294967231&$w858.status)>>>0);
        (yield* msg_print("You feel yourself slow down."));
        change_speed(1);
        if((find_flag)){
          find_flag=false;
          (yield* move_char(5));
        }
      }
    }
    /* Slow */
    if((($w858.slow>0))){
      if(((((128&$w858.status)>>>0)===0))){
        $w858.status=((128|$w858.status)>>>0);
        (yield* msg_print("You feel yourself moving slower."));
        change_speed(1);
        if((find_flag)){
          find_flag=false;
          (yield* move_char(5));
        }
      }
      $w858.slow=($w858.slow-1);
      if((($w858.slow===0))){
        $w858.status=((4294967167&$w858.status)>>>0);
        (yield* msg_print("You feel yourself speed up."));
        change_speed((-1));
        if((find_flag)){
          find_flag=false;
          (yield* move_char(5));
        }
      }
    }
    /* Resting is over? */
    if((($w858.rest>0))){
      /* Hibernate every 20 iterations so that process does */
      /* not eat up system... */
      /* NOTE: Remove comments for VMS version 4.0 or greater */
      /* INKEY_DELAY takes care of hibernation for */
      /* VMS 3.7 or less */
      /* if ((rest mod 20) = 1) then sleep(1); */
      $w858.rest=($w858.rest-1);
      /* Test for any key being hit to abort rest.  Also, */
      /* this will do a PUT_QIO which updates the screen... */
      /* One more side benifit; since inkey_delay hibernates */
      /* small amount before executing, this makes resting */
      /* less CPU intensive... */
      (yield* inkey_delay({get v(){return command},set v($x){command=$x}},0));
      if((($w858.rest===0))){
        /* Resting over */
        rest_off();
      }else if(((command!==null_))){
        /* Resting aborted */
        rest_off();
      }
    }
    /* Halucinating?  (Random characters appear!) */
    if((($w858.image>0))){
      $w858.image=($w858.image-1);
      if((($w858.image===0))){
        draw_cave();
      }
    }
    /* Paralysis */
    if((($w858.paralysis>0))){
      $w858.paralysis=($w858.paralysis-1);
      if((($w858.rest>0))){
        rest_off();
      }
      if((search_flag)){
        (yield* search_off());
      }
    }
    /* Protection from evil counter */
    if((($w858.protevil>0))){
      $w858.protevil=($w858.protevil-1);
    }
    /* Inulnerability */
    if((($w858.invuln>0))){
      if(((((4096&$w858.status)>>>0)===0))){
        $w858.status=((4096|$w858.status)>>>0);
        if((find_flag)){
          find_flag=false;
          (yield* move_char(5));
        }
        (yield* msg_print("Your skin turns into steel!"));
        py.misc.pac=(py.misc.pac+100);
        py.misc.dis_ac=(py.misc.dis_ac+100);
        prt_pac();
      }
      $w858.invuln=($w858.invuln-1);
      if((($w858.invuln===0))){
        $w858.status=((4294963199&$w858.status)>>>0);
        if((find_flag)){
          find_flag=false;
          (yield* move_char(5));
        }
        (yield* msg_print("Your skin returns to normal..."));
        py.misc.pac=(py.misc.pac-100);
        py.misc.dis_ac=(py.misc.dis_ac-100);
        prt_pac();
      }
    }
    /* Heroism */
    if((($w858.hero>0))){
      if(((((8192&$w858.status)>>>0)===0))){
        $w858.status=((8192|$w858.status)>>>0);
        if((find_flag)){
          find_flag=false;
          (yield* move_char(5));
        }
        var $w861=py.misc;
        $w861.mhp=($w861.mhp+10);
        $w861.chp=Math.fround(Math.fround($w861.chp+10));
        $w861.bth=($w861.bth+12);
        $w861.bthb=($w861.bthb+12);
        (yield* msg_print("You feel like a HERO!"));
        prt_mhp();
      }
      $w858.hero=($w858.hero-1);
      if((($w858.hero===0))){
        $w858.status=((4294959103&$w858.status)>>>0);
        if((find_flag)){
          find_flag=false;
          (yield* move_char(5));
        }
        var $w862=py.misc;
        $w862.mhp=($w862.mhp-10);
        if((($w862.chp>$w862.mhp))){
          $w862.chp=Math.fround($w862.mhp);
        }
        $w862.bth=($w862.bth-12);
        $w862.bthb=($w862.bthb-12);
        (yield* msg_print("The heroism wears off."));
        prt_mhp();
      }
    }
    /* Super Heroism */
    if((($w858.shero>0))){
      if(((((16384&$w858.status)>>>0)===0))){
        $w858.status=((16384|$w858.status)>>>0);
        if((find_flag)){
          find_flag=false;
          (yield* move_char(5));
        }
        var $w863=py.misc;
        $w863.mhp=($w863.mhp+20);
        $w863.chp=Math.fround(Math.fround($w863.chp+20));
        $w863.bth=($w863.bth+24);
        $w863.bthb=($w863.bthb+24);
        (yield* msg_print("You feel like a SUPER HERO!"));
        prt_mhp();
      }
      $w858.shero=($w858.shero-1);
      if((($w858.shero===0))){
        $w858.status=((4294950911&$w858.status)>>>0);
        if((find_flag)){
          find_flag=false;
          (yield* move_char(5));
        }
        var $w864=py.misc;
        $w864.mhp=($w864.mhp-20);
        if((($w864.chp>$w864.mhp))){
          $w864.chp=Math.fround($w864.mhp);
        }
        $w864.bth=($w864.bth-24);
        $w864.bthb=($w864.bthb-24);
        (yield* msg_print("The super heroism wears off."));
        prt_mhp();
      }
    }
    /* Blessed */
    if((($w858.blessed>0))){
      if(((((32768&$w858.status)>>>0)===0))){
        $w858.status=((32768|$w858.status)>>>0);
        if((find_flag)){
          find_flag=false;
          (yield* move_char(5));
        }
        var $w865=py.misc;
        $w865.bth=($w865.bth+5);
        $w865.bthb=($w865.bthb+5);
        $w865.pac=($w865.pac+2);
        $w865.dis_ac=($w865.dis_ac+2);
        (yield* msg_print("You feel righteous!"));
        prt_mhp();
        prt_pac();
      }
      $w858.blessed=($w858.blessed-1);
      if((($w858.blessed===0))){
        $w858.status=((4294934527&$w858.status)>>>0);
        if((find_flag)){
          find_flag=false;
          (yield* move_char(5));
        }
        var $w866=py.misc;
        $w866.bth=($w866.bth-5);
        $w866.bthb=($w866.bthb-5);
        $w866.pac=($w866.pac-2);
        $w866.dis_ac=($w866.dis_ac-2);
        (yield* msg_print("The prayer has expired."));
        prt_mhp();
        prt_pac();
      }
    }
    /* Resist Heat */
    if((($w858.resist_heat>0))){
      $w858.resist_heat=($w858.resist_heat-1);
    }
    /* Resist Cold */
    if((($w858.resist_cold>0))){
      $w858.resist_cold=($w858.resist_cold-1);
    }
    /* Detect Invisible */
    if((($w858.detect_inv>0))){
      if(((((65536&$w858.status)>>>0)===0))){
        $w858.status=((65536|$w858.status)>>>0);
        $w858.see_inv=true;
      }
      $w858.detect_inv=($w858.detect_inv-1);
      if((($w858.detect_inv===0))){
        $w858.status=((4294901759&$w858.status)>>>0);
        $w858.see_inv=false;
        py_bonuses($clone(blank_treasure),0);
      }
    }
    /* Timed infra-vision */
    if((($w858.tim_infra>0))){
      if(((((131072&$w858.status)>>>0)===0))){
        $w858.status=((131072|$w858.status)>>>0);
        $w858.see_infra=($w858.see_infra+1);
      }
      $w858.tim_infra=($w858.tim_infra-1);
      if((($w858.tim_infra===0))){
        $w858.status=((4294836223&$w858.status)>>>0);
        $w858.see_infra=($w858.see_infra-1);
      }
    }
    /* Word-of-Recall  Note: Word-of-Recall is a delayed action */
    if((($w858.word_recall>0))){
      if((($w858.word_recall===1))){
        if(((dun_level>0))){
          (yield* msg_print("You feel yourself yanked upwards!"));
          dun_level=0;
        }else if(((py.misc.max_lev>0))){
          (yield* msg_print("You feel yourself yanked downwards!"));
          dun_level=py.misc.max_lev;
        }
        moria_flag=true;
        $w858.paralysis=($w858.paralysis+1);
        $w858.word_recall=0;
      }else{
        $w858.word_recall=($w858.word_recall-1);
      }
    }
    /* Check hit points for adjusting... */
    var $w867=py.misc;
    if((!(find_flag))){
      if(((py.flags.rest<1))){
        if(((old_chp!==Math.trunc($w867.chp)))){
          if((($w867.chp>$w867.mhp))){
            $w867.chp=Math.fround($w867.mhp);
          }
          prt_chp();
          old_chp=Math.trunc($w867.chp);
        }
        if(((old_cmana!==Math.trunc($w867.cmana)))){
          if((($w867.cmana>$w867.mana))){
            $w867.cmana=Math.fround($w867.mana);
          }
          prt_cmana();
          old_cmana=Math.trunc($w867.cmana);
        }
      }
    }
    if((((((py.flags.paralysis<1))&&((py.flags.rest<1)))&&(!(death))))){
      /* Accept a command? */
      /* Accept a command and execute it */
      do{
        print_stat=0;
        reset_flag=false;
        /* Random teleportation */
        if((py.flags.teleport)){
          if(((randint(100)===1))){
            find_flag=false;
            (yield* teleport(40));
          }
        }
        if((!(find_flag))){
          print("",char_row,char_col);
          save_msg_flag=msg_flag;
          (yield* inkey({get v(){return command},set v($x){command=$x}}));
          if((save_msg_flag)){
            erase_line(msg_line,msg_line);
          }
          com_val=$ord(command);
        }
        /* Commands are executed in following case statement */
        switch(com_val){
          case 0:case 3:case 25:{
            /* ^Y = exit */
            flush();
            if(((yield* get_com("Enter 'Q' to quit",{get v(){return command},set v($x){command=$x}})))){
              switch(command){
                case "q":case "Q":{
                  if((total_winner)){
                    moria_flag=true;
                    death=true;
                  }else{
                    clear(1,1);
                    exit();
                  }
                  break;
                }
                default:{
                }
              }
            }
            reset_flag=true;
            break;
          }
          case 13:{
            /* ^M = repeat */
            (yield* msg_print(old_msg));
            reset_flag=true;
            break;
          }
          case 16:{
            if((wizard1)){
              /* ^P = password */
              (yield* msg_print("Wizard mode off."));
              wizard1=false;
              wizard2=false;
              reset_flag=true;
              no_controly();
            }else{
              if(((yield* check_pswd()))){
                (yield* msg_print("Wizard mode on."));
                controly();
              }
              reset_flag=true;
            }
            break;
          }
          case 18:{
            /* ^R = redraw */
            draw_cave();
            reset_flag=true;
            break;
          }
          case 26:{
            /* ^Z = save */
            if((total_winner)){
              (yield* msg_print("You are a Total Winner, your character must be retired..."));
              (yield* msg_print("Use <Control>-Y to when you are ready to quit."));
            }else{
              if((search_flag)){
                (yield* search_off());
              }
              (yield* save_char());
            }
            break;
          }
          case 36:{
            /* $  = Shell */
            clear(1,1);
            $writeln($ws("[Entering DCL shell, type \"EOJ\" to resume your game]",0));
            $writeln("");
            controly();
            (yield* shell_out());
            no_controly();
            clear(1,1);
            draw_cave();
            reset_flag=true;
            break;
          }
          case 46:{
            /* . = find */
            y=char_row;
            x=char_col;
            if(((yield* get_dir("Which direction?",{get v(){return dir_val},set v($x){dir_val=$x}},{get v(){return com_val},set v($x){com_val=$x}},{get v(){return y},set v($x){y=$x}},{get v(){return x},set v($x){x=$x}})))){
              find_flag=true;
              (yield* move_char(dir_val));
            }
            break;
          }
          case 47:{
            /* / = identify */
            (yield* ident_char());
            reset_flag=true;
            break;
          }
          case 49:{
            (yield* move_char((com_val-48)));
            break;
          }
          case 50:{
            /* Move dir 1 */
            (yield* move_char((com_val-48)));
            break;
          }
          case 51:{
            /* Move dir 2 */
            (yield* move_char((com_val-48)));
            break;
          }
          case 52:{
            /* Move dir 3 */
            (yield* move_char((com_val-48)));
            break;
          }
          case 53:{
            /* Move dir 4 */
            /* Rest one turn */
            (yield* move_char((com_val-48)));
            (yield* sleep(0));
            /* Sleep 1/10 a second */
            flush();
            break;
          }
          case 54:{
            (yield* move_char((com_val-48)));
            break;
          }
          case 55:{
            /* Move dir 6 */
            (yield* move_char((com_val-48)));
            break;
          }
          case 56:{
            /* Move dir 7 */
            (yield* move_char((com_val-48)));
            break;
          }
          case 57:{
            /* Move dir 8 */
            (yield* move_char((com_val-48)));
            break;
          }
          case 60:{
            /* Move dir 9 */
            (yield* go_up());
            break;
          }
          case 62:{
            /* < = go up */
            (yield* go_down());
            break;
          }
          case 63:{
            /* > = go down */
            /* ? = help */
            (yield* help());
            reset_flag=true;
            break;
          }
          case 66:{
            /* Free move */
            /* 65 :    begin   { Debug feature for weight
               			  tmp1 := 0;
               			  for i1 := 1 to inven_max-1 do
               			    with inventory[i1] do
               			      tmp1 := tmp1 + weight*number;
               			  writev(out_val,inven_weight:1,' | ',tmp1:1);
               			  msg_print(out_val);
               			end; */
            (yield* bash());
            break;
          }
          case 67:{
            /* B = bash */
            /* C = character */
            if(((yield* get_com("Print to file? (Y/N)",{get v(){return command},set v($x){command=$x}})))){
              switch(command){
                case "y":case "Y":{
                  (yield* file_character());
                  break;
                }
                case "n":case "N":{
                  (yield* change_name());
                  draw_cave();
                  break;
                }
                default:{
                }
              }
            }
            reset_flag=true;
            break;
          }
          case 68:{
            /* Free move */
            (yield* disarm_trap());
            break;
          }
          case 69:{
            /* D = disarm */
            (yield* eat());
            break;
          }
          case 70:{
            /* E = eat */
            (yield* refill_lamp());
            break;
          }
          case 76:{
            /* F = refill */
            /* L = location */
            reset_flag=true;
            /* Free move */
            if(((((py.flags.blind>0))||(no_light())))){
              (yield* msg_print("You can't see your map."));
            }else{
              out_val=$cap($ws("Section [",0)+$wi(((Math.trunc(Math.fround($rdiv(((char_row-1)),outpage_height)))+1)),1)+$ws(",",0)+$wi(((Math.trunc(Math.fround($rdiv(((char_col-1)),outpage_width)))+1)),1)+$ws("]; Location = [",0)+$wi(char_row,1)+$ws(",",0)+$wi(char_col,1)+$ws("]",0),80);
              (yield* msg_print(out_val));
            }
            break;
          }
          case 80:{
            /* P = print map */
            reset_flag=true;
            /* Free move */
            if(((((py.flags.blind>0))||(no_light())))){
              (yield* msg_print("You can't see to draw a map."));
            }else{
              (yield* print_map());
            }
            break;
          }
          case 82:{
            (yield* rest());
            break;
          }
          case 83:{
            /* R = rest */
            if((search_flag)){
              /* S = srh mode */
              (yield* search_off());
              reset_flag=true;
            /* Free move */
            }else if(((py.flags.blind>0))){
              (yield* msg_print("You are incapable of searching while blind."));
            }else{
              search_on();
              reset_flag=true;
            }
            break;
          }
          case 84:{
            /* Free move */
            (yield* tunnel());
            break;
          }
          case 97:{
            /* T = tunnel */
            (yield* aim());
            break;
          }
          case 98:{
            /* a = aim */
            (yield* examine_book());
            break;
          }
          case 99:{
            /* b = browse */
            (yield* closeobject());
            break;
          }
          case 100:{
            /* c = close */
            (yield* drop());
            break;
          }
          case 101:{
            /* d = drop */
            /* e = equipment */
            reset_flag=true;
            /* Free move */
            if(((yield* inven_command("e",0,0)))){
              draw_cave();
            }
            break;
          }
          case 102:{
            (yield* throw_object());
            break;
          }
          case 104:{
            /* f = throw */
            /* h = moria hlp */
            (yield* moria_help(""));
            draw_cave();
            reset_flag=true;
            break;
          }
          case 105:{
            /* Free move */
            /* i = inventory */
            reset_flag=true;
            /* Free move */
            if(((yield* inven_command("i",0,0)))){
              draw_cave();
            }
            break;
          }
          case 106:{
            (yield* jamdoor());
            break;
          }
          case 108:{
            /* j = jam */
            /* l = look */
            (yield* look());
            reset_flag=true;
            break;
          }
          case 109:{
            /* Free move */
            (yield* cast());
            break;
          }
          case 111:{
            /* m = magick */
            (yield* openobject());
            break;
          }
          case 112:{
            /* o = open */
            (yield* pray());
            break;
          }
          case 113:{
            /* p = pray */
            (yield* quaff());
            break;
          }
          case 114:{
            /* q = quaff */
            (yield* read());
            break;
          }
          case 115:{
            /* r = read */
            if(((py.flags.blind>0))){
              /* s = search */
              (yield* msg_print("You are incapable of searching while blind."));
            }else{
              (yield* search(char_row,char_col,py.misc.srh));
            }
            break;
          }
          case 116:{
            /* t = unwear */
            reset_flag=true;
            if(((yield* inven_command("t",0,0)))){
              draw_cave();
            }
            break;
          }
          case 117:{
            (yield* use());
            break;
          }
          case 118:{
            /* u = use staff */
            (yield* game_version());
            break;
          }
          case 119:{
            /* v = version */
            /* w = wear */
            reset_flag=true;
            if(((yield* inven_command("w",0,0)))){
              draw_cave();
            }
            break;
          }
          case 120:{
            /* x = exchange */
            reset_flag=true;
            if(((yield* inven_command("x",0,0)))){
              draw_cave();
            }
            break;
          }
          default:{
            if((wizard1)){
              reset_flag=true;
              /* Wizard commands are free moves */
              switch(com_val){
                case 1:{
                  /* ^A = Cure all */
                  remove_curse();
                  cure_blindness();
                  cure_confusion();
                  cure_poison();
                  remove_fear();
                  var $w870=py.stat;
                  $w870.cstr=$w870.str;
                  $w870.cint=$w870.int;
                  $w870.cwis=$w870.wis;
                  $w870.cdex=$w870.dex;
                  $w870.ccon=$w870.con;
                  $w870.cchr=$w870.chr;
                  var $w871=py.flags;
                  if((($w871.slow>1))){
                    $w871.slow=1;
                  }
                  if((($w871.image>1))){
                    $w871.image=1;
                  }
                  break;
                }
                case 2:{
                  (yield* print_objects());
                  break;
                }
                case 4:{
                  /* ^B = objects */
                  /* ^D = up/down */
                  prt("Go to which level (0 -1200) ? ",1,1);
                  (yield* get_string({get v(){return tmp_str},set v($x){tmp_str=$x}},1,31,10));
                  i1=(-1);
                  (($rv=$readvs(tmp_str,["int"],true)),i1=$rv[0]);
                  if(((i1>(-1)))){
                    dun_level=i1;
                    if(((dun_level>1200))){
                      dun_level=1200;
                    }
                    moria_flag=true;
                  }else{
                    erase_line(msg_line,msg_line);
                  }
                  break;
                }
                case 8:{
                  (yield* wizard_help());
                  break;
                }
                case 9:{
                  /* ^H = wizhelp */
                  (yield* ident_spell());
                  break;
                }
                case 14:{
                  /* ^I = identify */
                  (yield* print_monsters());
                  break;
                }
                case 12:{
                  /* ^N = mon map */
                  wizard_light();
                  break;
                }
                case 20:{
                  /* ^L = wizlight */
                  (yield* teleport(100));
                  break;
                }
                case 22:{
                  /* ^T = teleport */
                  (yield* restore_char());
                  break;
                }
                default:{
                  /* ^V = restore */
                  if((wizard2)){
                    switch(com_val){
                      case 5:{
                        (yield* change_character());
                        break;
                      }
                      case 6:{
                        /* ^E = wizchar */
                        mass_genocide();
                        break;
                      }
                      case 7:{
                        /* ^F = genocide */
                        alloc_object(floor_set,5,10);
                        break;
                      }
                      case 10:{
                        /* ^G = treasure */
                        /* ^J = gain exp */
                        py.misc.exp=(2*py.misc.exp);
                        (yield* prt_experience());
                        break;
                      }
                      case 11:{
                        /* ^K = summon */
                        y=char_row;
                        x=char_col;
                        summon_monster({get v(){return y},set v($x){y=$x}},{get v(){return x},set v($x){x=$x}},true);
                        (yield* creatures(false));
                        break;
                      }
                      case 23:{
                        (yield* wizard_create());
                        break;
                      }
                      default:{
                        /* ^W = create */
                        prt("Type '?' for help...",1,1);
                      }
                    }
                  }else{
                    prt("Type '?' for help...",1,1);
                  }
                }
              }
            }else{
              prt("Type '?' for help...",1,1);
              reset_flag=true;
            }
          }
        }
      }while(!(((!(reset_flag)||(moria_flag)))));
    }
    /* End of commands */
    /* Teleport? */
    if((teleport_flag)){
      (yield* teleport(100));
    }
    /* Move the creatures */
    if((!moria_flag)){
      (yield* creatures(true));
    }
  }while(!((moria_flag)));
  /* Exit when moria_flag is set */
  if((search_flag)){
    (yield* search_off());
  }
}
function* $main(){
  /* Fixed "SLOW" bug; 06-11-86 RAK */
  /* TERMDEF is external so that new terminals can be defined-RAK- */
  /* wihtout recompiling the entire source. */
  /* Initialize, restore, and get the ball rolling...	-RAK- */
  /* SYSPRV stays off except when needed... */
  priv_switch(0);
  /* Check the terminal type and see if it is supported */
  termdef();
  /* Get the directory location of the image */
  (yield* get_paths());
  /* Setup pause time for IO */
  setup_io_pause();
  /* Some neccesary initializations */
  msg_line=1;
  quart_height=Math.trunc(Math.fround($rdiv(screen_height,4)));
  quart_width=Math.trunc(Math.fround($rdiv(screen_width,4)));
  dun_level=0;
  /* Init an IO channel for QIO */
  init_channel();
  /* Grab a random seed from the clock */
  seed=get_seed();
  /* Sort the objects by level */
  sort_objects();
  /* Init monster and treasure levels for allocate */
  init_m_level();
  init_t_level();
  /* Init the store inventories */
  store_init();
  if(((cost_adj!==Math.fround(1.00)))){
    price_adjust();
  }
  /* Build the secret wizard and god passwords */
  bpswd();
  /* Check operating hours */
  /* If not wizard then No_Control_Y */
  get_foreign({get v(){return finam},set v($x){finam=$x}});
  /* Check or create hours.dat, print message */
  (yield* intro({get v(){return finam},set v($x){finam=$x}}));
  /* Generate a character, or retrieve old one... */
  if(((finam.length>0))){
    /* Retrieve character */
    generate=(yield* get_char(finam));
    (yield* change_name());
    magic_init(randes_seed);
  }else{
    /* Create character */
    (yield* create_character());
    char_inven_init();
    if((class_[py.misc.pclass].mspell)){
      /* Magic realm */
      (yield* learn_spell({get v(){return msg_flag},set v($x){msg_flag=$x}}));
      gain_mana(int_adj());
    }else if((class_[py.misc.pclass].pspell)){
      /* Clerical realm */
      (yield* learn_prayer());
      gain_mana(wis_adj());
    }
    py.misc.cmana=Math.fround(py.misc.mana);
    randes_seed=seed;
    /* Description seed */
    town_seed=seed;
    /* Town generation seed */
    magic_init(randes_seed);
    generate=true;
  }
  /* Begin the game */
  var $w875=py.misc;
  /* This determines the maximum player level */
  player_max_exp=Math.trunc(Math.fround(player_exp[(max_player_level-1)]*$w875.expfact));
  clear(1,1);
  prt_stat_block();
  /* Loop till dead, or exit */
  do{
    if((generate)){
      generate_cave();
    }
    /* New level */
    (yield* dungeon());
    /* Dungeon logic */
    generate=true;
  }while(!((death)));
  (yield* upon_death());
}
return $main;
}
/* ---------- on the glass: the 80x24 screen, smaller type where that stays readable (the program's fit), else the part around the cursor ---------- */
P.command({names:['moria'],noHelpFlag:true,run:function(a,raw,words){
  var last=null,fault=null;
  P.program(function(S,done){
    var M=$program(),G,over=false,timer=null,waiting=false,ox=0,oy=0;
    M.argv((words||[]).slice(1).join(' '));
    function show(){
      if(over)return;
      var s=M.screen(),r=Math.min(S.rows,24),c=Math.min(S.cols,80);
      /* keep the cursor in view on a small glass */
      if(s.cy<oy)oy=s.cy<r?0:s.cy;else if(s.cy>=oy+r)oy=s.cy-r+1;
      if(s.cx<ox)ox=s.cx<c-4?0:s.cx-4;else if(s.cx>=ox+c)ox=Math.min(80-c,s.cx-c+5);
      oy=Math.max(0,Math.min(oy,24-r));ox=Math.max(0,Math.min(ox,80-c));
      var x=S.pan(ox,80-c,s.cx);
      S.drawGrid(s.scr.slice(oy,oy+r).map(function(R){return R.slice(x,x+c)}),s.cy-oy,s.cx-x);
    }
    function quit(){
      if(over)return;
      over=true;
      if(timer)S.cancel(timer);
      var s=M.screen(),L=s.scr.slice(0,s.cy+1).map(function(R){return R.join('').replace(/\s+$/,'')});
      while(L.length&&L[L.length-1]==='')L.pop();
      last=L;
      S.close();
      done();
    }
    function pump(v){
      if(over)return;
      var r;
      for(;;){
        try{r=G.next(v);v=undefined}
        catch(e){
          if(e instanceof $Halt){quit();return}
          if(e instanceof $Fault){fault=e.message;quit();return}
          quit();
          throw e;
        }
        if(r.done){quit();return}
        show();
        if(r.value&&r.value.sleep!==undefined){
          var k=r.value.key;
          timer=S.after(r.value.sleep,function(){timer=null;waiting=false;pump()});
          waiting=k?'sleep':false;
          return;
        }
        if(M.keys().length){v=M.keys().shift();continue}
        waiting=true;
        return;
      }
    }
    M.onshow(show);
    S.after(0,function(){G=M.main();pump()}); /* after the program is set up */
    return {
      feed:function(k){
        var m=/^C-([a-z])$/.exec(k),c=k==='Enter'?'\r':k==='Backspace'?'\x7f':k==='Escape'?'\x1b':k==='Tab'?'\t':k.length===1?k:m?String.fromCharCode(m[1].charCodeAt(0)-96):null;
        if(c===null)return;
        if(waiting===true){waiting=false;pump(c)}
        else if(waiting==='sleep'){M.keys().push(c);S.cancel(timer);timer=null;waiting=false;pump()}
        else M.keys().push(c);
      },
      draw:show
    };
  },{tty:'moria',fit:[80,24]});
  P.queue(function(){
    if(last&&last.length)P.say(last);
    if(fault)fault.split('\n').forEach(function(l){P.typeLine(l,'err')});
  });
}});
})(window.Phosphor);
