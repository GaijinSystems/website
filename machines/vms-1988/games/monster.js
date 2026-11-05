/* PHOSPHOR-9 terminal: machine "vms-1988", MONSTER. Ported to JavaScript for this terminal from Rich Skrenta's mon.pas
   and guts.pas (VMS Pascal, comp.sources.games v05i088, November 1988): mon.pas is translated statement by statement,
   by a tool, with its comments, and guts.pas by hand. VMS Pascal can't be run here, so this was never compared with
   the original running. "Written by Rich Skrenta at Northwestern University, 1988."

This is README.TXT for Monster, a multiplayer adventure game for VMS.
Monster was written by Rich Skrenta at Northwestern University.

You may freely copy, distribute and change Monster as you wish.  Let me
know if you get it up and running, and if you change it, just because I'm
interested.  Send mail to

	skrenta@nuacc.acns.nwu.edu   or
	skrenta@nuacc.bitnet

Monster was written in VMS Pascal under VMS 4.6.  It uses file sharing and
record locking for communication.  Outside of that, it doesn't do anything
tricky.  However, after playing around with a VMS 4.2 system, I have
doubts if it will work on a system that old.  If you've got a reasonably
recent version of VMS and a Pascal compiler, you shouldn't have any problems.

The Monster source is in two files:  a short one, approx 300 lines, called
guts.pas, and a big one, mon.pas, approx 10,000 lines.  The compiled program
contains everything necessary to create and maintain the Monster universe.
There is no separate maintenance program.  Instead, a specific person in
the game has privileges, and is known as the "Monster Manager".  The MM
can do system maintenance while playing, and other players can even observe
his work.

Credit for the work to convert GUTS.PAS to a more portable form goes to
       
         Michael "the spide" Young   MCY1580@RITVAX.BITNET
         Chris "siouxane" Meck       CLM4346@RITVAX.BITNET

Many thanks to them for solving this sticky problem!

Rich Skrenta
November, 1988.

   Differences from the source: it is for one player. Its files are records in this browser's storage, written before
   each prompt, in place of shared RMS files; no one else writes to them, so the locking and collision loops stay and
   never run, and the other players are simply absent. privusers.pas is set for this machine: whoever is logged in is
   the Monster Manager, and root is empty. The first run does what install.txt asks of the first player, "rebuild". While a
   line is being typed nothing prints over it: what checkevents would have printed comes before the next prompt or
   when the line is entered, so the prompt isn't put back either. ^C leaves through the normal way out, and a
   record that can't be read is treated as no world. Out-of-range CASE selectors and array indexes are not trapped.

   privusers.pas as distributed, for the record:

{ These are PRIVILEDGED users.  The Monster Manager has the most power;
  this should be the game administrator.  The Monster Vice Manager can help
  the MM in his adminstrative duties.  Faust is another person who can do
  anything but is generally incognito. }

MM_userid	= 'dolpher';		{ Monster Manager	}
MVM_userid	= 'gary';		{ Monster Vice Manager	}
FAUST_userid	= 'skrenta';		{ Dr. Faustus		}

REBUILD_OK	= TRUE;		{ if this is TRUE, the MM can blow away
				  and reformat the entire universe.  It's
				  a good idea to set this to FALSE and
				  recompile after you've got your world
				  going }


root		= 'USERC:[ISP00475.CRA01453.DSYS]';
				{ this is where the Monster database goes
				  This directory and the datafiles Monster
				  creates in it must be world:rw for
				  people to be able to play.  This sucks,
				  but we don't have setgid to games on VMS }

*/
(function(P){
'use strict';
/* ---------- what VAX Pascal gives the source ---------- */
function $arr(lo,hi,f){var a=new Array(hi+1);for(var i=lo;i<=hi;i++)a[i]=f();return a}
function $zeros(hi){return new Array(hi+1).fill(0)}
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
function $setop(a,b,op){
  var r=new Set();
  if(op==='+'){a.forEach(function(x){r.add(x)});b.forEach(function(x){r.add(x)})}
  else if(op==='-')a.forEach(function(x){if(!b.has(x))r.add(x)});
  else a.forEach(function(x){if(b.has(x))r.add(x)});
  return r;
}
function $seteq(a,b){return a.size===b.size&&$setle(a,b)}
function $setle(a,b){var ok=true;a.forEach(function(x){if(!b.has(x))ok=false});return ok}
function $succ(x){return typeof x==='string'?$chr(x.charCodeAt(0)+1):x+1}
function $pred(x){return typeof x==='string'?$chr(x.charCodeAt(0)-1):x-1}
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
/* output: full lines go to the terminal, a part line waits to become the prompt */
var $o='';
function $write(s){
  $o+=s;
  var i=$o.lastIndexOf('\n');
  if(i>=0){P.say($o.slice(0,i).split('\n'));$o=$o.slice(i+1)}
}
function $writeln(s){$write(s+'\n')}
var $ASK={ask:true},$line=null,$hidden=false;
function* $askline(prompt,hidden){
  /* the part line and the prompt go up together; a line, or P.INT at ^C, or null at ^D */
  var p=$o+prompt;$o='';
  yield {ask:p,hidden:!!hidden};
  return $line;
}
/* run a translated program: its generator asks for lines and pauses through these */
function $drive(G,onend){
  function step(v){
    var r;
    $line=v;
    for(;;){
      try{r=G.next()}
      catch(e){
        if($o){P.say([$o]);$o=''}
        if(e instanceof $Halt){onend();return}
        if(e instanceof $Fault){P.typeLine(e.message,'err');onend();return}
        console.error(e);
        P.typeLine('%SYSTEM-F-ACCVIO, access violation','err');
        onend();
        return;
      }
      if(r.done){if($o){P.say([$o]);$o=''}onend();return}
      if(r.value&&r.value.sleep!==undefined){P.pause(r.value.sleep);P.queue(function(){step(null)});return}
      P.ask(r.value.ask,step,true,r.value.hidden);
      return;
    }
  }
  step(null);
}
function $program(){
/* ---------- guts.pas, and the database files, by hand. Solo: nothing else writes to these. ---------- */
var old_prompt='',line='',seed={v:0},$fresh=false,$dirty={},$files={},$warned=false,$ints=0,$gone=false;
function random(){return $mth_random(seed)}
function rnd100(){return $round($mth_random(seed)*100)} // random int between 0 & 100, maybe
function setup_guts(){seed.v=$clock();old_prompt=''}
function finish_guts(){$flush()}
function get_userid(){return String(P.st.user||'guest').toLowerCase().slice(0,12)}
function trim(s){return s.replace(/[ \t]+$/,'')}
function putchars(s){} /* only used to put the prompt back after an event; here events come between prompts */
function* wait(seconds){yield {sleep:seconds*1000}}
function* doawait(t){yield {sleep:t*1000}}
function* $readln(){
  $flush();
  var l=yield* $askline('');
  if(l===P.INT||l===null){$halt()}
  return l;
}
function* grab_line(prompt,s,echo=true){
  /* firstkey and nextkey call checkevents while they wait. It can't print over the line being typed here, so one
     round goes before the prompt, and those the wait would have made go when the line comes in. */
  var t0,i,n,l;
  if($gone){
    if(++$ints>200){$flush();$halt()}
    s.v='';
    return;
  }
  old_prompt=prompt;
  yield* $y(checkevents());
  $flush();
  t0=Date.now();
  line='';
  l=yield* $askline(prompt,!echo);
  n=Math.min(Math.floor((Date.now()-t0)/200),1000);
  for(i=0;i<n;i++)yield* $y(checkevents(true));
  if(l===P.INT||l===null){
    /* the player has gone: unwind through the prompts to the normal way out, so that no zombie stays in the world */
    if(l===P.INT){done=true;$gone=true}
    l='';
  }
  l=String(l).replace(/[\x00-\x1f]/g,'').slice(0,77);
  line=l;
  s.v=l;
}
/* The files, each record kept by number, and each file a JSON record in this browser's storage */
function $file(mk){return {mk:mk,recs:{},buf:mk(),st:0,pos:1,key:null,text:null}}
function $enc(x){
  if(Array.isArray(x)&&typeof x[1]==='boolean'){var b='';for(var i=1;i<x.length;i++)b+=x[i]?'1':'0';return {b:b}}
  if(Array.isArray(x))return x.map($enc);
  if(x&&typeof x==='object'){var o={};for(var k in x)o[k]=$enc(x[k]);return o}
  return x;
}
function $dec(x,t){
  /* the record as the source's type has it, or an exception: localStorage can hold anything */
  if(Array.isArray(t)){
    if(typeof t[1]==='boolean'){
      if(!x||typeof x.b!=='string'||x.b.length!==t.length-1)throw 0;
      var r=new Array(t.length);
      for(var i=1;i<t.length;i++)r[i]=x.b.charAt(i-1)==='1';
      return r;
    }
    if(!Array.isArray(x)||x.length!==t.length)throw 0;
    var a=new Array(t.length);
    for(var j=0;j<t.length;j++)if(j in t)a[j]=$dec(x[j],t[j]);
    return a;
  }
  if(t!==null&&typeof t==='object'){
    if(x===null||typeof x!=='object'||Array.isArray(x))throw 0;
    var o={};
    for(var k in t)o[k]=$dec(x[k],t[k]);
    return o;
  }
  if(typeof x!==typeof t||(typeof x==='number'&&!Number.isFinite(x)))throw 0;
  return x;
}
function $open(f,name,kw){
  f.key=String(name).toLowerCase();
  f.st=0;
  $files[f.key]=f;
  if(kw&&kw.history==='new'){f.text=[];return}
  var d=P.saved('monster/'+f.key);
  if(d===null||d===undefined){$fresh=true;return}
  try{
    if(typeof d!=='object')throw 0;
    var R={};
    for(var n in d){
      if(!/^[1-9]\d*$/.test(n))throw 0;
      R[n]=$dec(d[n],f.mk());
    }
    f.recs=R;
  }catch(e){f.recs={};$fresh=true}
}
function $flush(){
  for(var k in $dirty){
    var f=$files[k],o={};
    for(var n in f.recs)o[n]=$enc(f.recs[n]);
    if(!P.save('monster/'+k,o)&&!$warned){$warned=true;$writeln('%warning- this browser would not save the Monster world')}
  }
  $dirty={};
}
function $find(f,n){
  if(!f.recs[n]){f.st=1;return}
  f.buf=$clone(f.recs[n]);
  f.pos=n;
  f.st=0;
}
function $locate(f,n){f.pos=n;f.st=0}
function $put(f){f.recs[f.pos]=$clone(f.buf);$dirty[f.key]=true;f.pos++;f.st=0}
function $update(f){f.recs[f.pos]=$clone(f.buf);$dirty[f.key]=true;f.st=0}
function $unlock(f){}
function $status(f){return f.st}
function $rewrite(f){if(f.text)f.text=[]}
function $fwrite(f,s,nl){if(f.text===null)f.text=[];var L=f.text;if(!L.length||L.$nl)L.push('');L[L.length-1]+=s;L.$nl=!!nl}
function $close(f){
  if(f.text&&P.writeFile)P.writeFile(f.key,f.text,false);
  f.text=null;
}
function* prestart(){
  var s;
  if($fresh)yield* $y(rebuild_system()); /* the very first time, the Monster Manager's "rebuild" (install.txt) */
  $write('Welcome to Monster!  Hit return to start: ');
  s=yield* $readln();
  $writeln('');
  $writeln('');
  if(s.length>0)yield* $y(special(lowcase(s)));
}
/* ---------- mon.pas ---------- */
/* This is Monster, a multiuser adventure game system
   	where the players create the universe.
   
   	Written by Rich Skrenta at Northwestern University, 1988.
   
   		skrenta@nuacc.acns.nwu.edu
   		skrenta@nuacc.bitnet */
/* These are PRIVILEDGED users.  The Monster Manager has the most power;
     this should be the game administrator.  The Monster Vice Manager can help
     the MM in his adminstrative duties.  Faust is another person who can do
     anything but is generally incognito. */
var mm_userid=get_userid();
/* Monster Manager */
var mvm_userid="gary";
/* Monster Vice Manager */
var faust_userid="skrenta";
/* Dr. Faustus */
var rebuild_ok=true;
/* if this is TRUE, the MM can blow away
   				  and reformat the entire universe.  It's
   				  a good idea to set this to FALSE and
   				  recompile after you've got your world
   				  going */
var root="";
/* this is where the Monster database goes
   				  This directory and the datafiles Monster
   				  creates in it must be world:rw for
   				  people to be able to play.  This sucks,
   				  but we don't have setgid to games on VMS */
var veryshortlen=12;
/* very short string length for userid's etc */
var shortlen=20;
/* ordinary short string */
var maxobjs=15;
/* max objects allow on floor in a room */
var maxpeople=10;
/* max people allowed in a room */
var maxplayers=300;
/* max log entries to make for players */
var maxcmds=75;
/* top value for cmd keyword slots */
var maxshow=50;
/* top value for set/show keywords */
var maxexit=6;
/* 6 exits from each loc: NSEWUD */
var maxroom=1000;
/* Total maximum ever possible */
var maxdetail=5;
/* max num of detail keys/descriptions per room */
var maxevent=15;
/* event slots per event block */
var maxindex=10000;
/* top value for bitmap allocation */
var maxhold=6;
/* max # of things a player can be holding */
var maxerr=15;
/* # of consecutive record collisions before the
   				  the deadlock error message is printed */
var numevnts=10;
/* # of different event records to be maintained */
var numpunches=12;
/* # of different kinds of punches there are */
var maxparm=20;
/* parms for object USEs */
var maxspells=50;
/* total number of spells available */
var descmax=10;
/* lines per description block */
var default_line=32000;
/* A virtual one liner record number that
   				  really means "use the default one liner
   				  description instead of reading one from
   				  the file" */
/* Mnemonics for directions */
var north=1;
var south=2;
var east=3;
var west=4;
var up=5;
var down=6;
/* Index record mnemonics */
var i_block=1;
/* True if description block is not used */
var i_line=2;
/* True if line slot is not used */
var i_room=3;
/* True if room slot is not in use */
var i_player=4;
/* True if slot is not occupied by a player */
var i_asleep=5;
/* True if player is not playing */
var i_object=6;
/* True if object record is not being used */
var i_int=7;
/* True if int record is not being used */
/* Integer record mnemonics */
var n_location=1;
/* Player's location */
var n_numrooms=2;
/* How many rooms they've made */
var n_allow=3;
/* How many rooms they're allowed to make */
var n_accept=4;
/* Number of open accept exits they have */
var n_experience=5;
/* How "good" they are */
var n_self=6;
/* player's self descriptions */
/* object kind mnemonics */
var o_bland=0;
/* bland object, good for keys */
var o_weapon=1;
var o_armor=2;
var o_thruster=3;
/* use puts player through an exit */
var o_cloak=4;
var o_bag=100;
var o_crystal=101;
var o_wand=102;
var o_hand=103;
/* Command Mnemonics */
var error=0;
var setnam=1;
var help=2;
var quest=3;
var quit=4;
var look=5;
var go=6;
var form=7;
var link=8;
var unlink=9;
var c_whisper=10;
var poof=11;
var desc=12;
var dbg=14;
var say=15;
var c_rooms=17;
var c_system=18;
var c_disown=19;
var c_claim=20;
var c_create=21;
var c_public=22;
var c_accept=23;
var c_refuse=24;
var c_zap=25;
var c_hide=26;
var c_l=27;
var c_north=28;
var c_south=29;
var c_east=30;
var c_west=31;
var c_up=32;
var c_down=33;
var c_n=34;
var c_s=35;
var c_e=36;
var c_w=37;
var c_u=38;
var c_d=39;
var c_custom=40;
var c_who=41;
var c_players=42;
var c_search=43;
var c_unhide=44;
var c_punch=45;
var c_ping=46;
var c_health=47;
var c_get=48;
var c_drop=49;
var c_inv=50;
var c_i=51;
var c_self=52;
var c_whois=53;
var c_duplicate=54;
var c_version=56;
var c_objects=57;
var c_use=58;
var c_wield=59;
var c_brief=60;
var c_wear=61;
var c_relink=62;
var c_unmake=63;
var c_destroy=64;
var c_show=65;
var c_set=66;
var e_detail=100;
/* pseudo command for log_action of desc exit */
var e_custroom=101;
/* customizing this room */
var e_program=102;
/* customizing (programming) an object */
var e_usecrystal=103;
/* using a crystal ball */
/* Show Mnemonics */
var s_exits=1;
var s_object=2;
var s_quest=3;
var s_details=4;
/* Set Mnemonics */
var y_quest=1;
var y_altmsg=2;
var y_group1=3;
var y_group2=4;
/* Event Mnemonics */
var e_exit=1;
/* player left room */
var e_enter=2;
/* player entered room */
var e_begin=3;
/* player joined game here */
var e_quit=4;
/* player here quit game */
var e_say=5;
/* someone said something */
var e_setnam=6;
/* player set his personal name */
var e_poofin=8;
/* someone poofed into this room */
var e_poofout=9;
/* someone poofed out of this room */
var e_detach=10;
/* a link has been destroyed */
var e_editdone=11;
/* someone is finished editing a desc */
var e_newexit=12;
/* someone made an exit here */
var e_bouncedin=13;
/* an object "bounced" into the room */
var e_examine=14;
/* someone is examining something */
var e_custdone=15;
/* someone is done customizing an exit */
var e_found=16;
/* player found something */
var e_search=17;
/* player is searching room */
var e_donedet=18;
/* done adding details to a room */
var e_hidobj=19;
/* someone hid an object here */
var e_unhide=20;
/* voluntarily revealed themself */
var e_foundyou=21;
/* someone found someone else hiding */
var e_punch=22;
/* someone has punched someone else */
var e_madeobj=23;
/* someone made an object here */
var e_get=24;
/* someone picked up an object */
var e_drop=25;
/* someone dropped an object */
var e_dropall=26;
/* quit & dropped stuff on way out */
var e_ihid=27;
/* tell others that I have hidden (!) */
var e_noises=28;
/* strange noises from hidden people */
var e_ping=29;
/* send a ping to a potential zombie */
var e_pong=30;
/* ping answered */
var e_hidepunch=31;
/* someone hidden is attacking */
var e_slipped=32;
/* attack caused obj to drop unwillingly */
var e_roomdone=33;
/* done customizing this room */
var e_objdone=34;
/* done programming an object */
var e_hpoofout=35;
/* someone hiding poofed	out */
var e_failgo=36;
/* a player failed to go through an exit */
var e_hpoofin=37;
/* someone poofed into a room hidden */
var e_trypunch=38;
/* someone failed to punch someone else */
var e_pingone=39;
/* someone was pinged away . . . */
var e_claim=40;
/* someone claimed this room */
var e_disown=41;
/* owner of this room has disowned it */
var e_weaker=42;
/* person is weaker from battle */
var e_objclaim=43;
/* someone claimed an object */
var e_objdisown=44;
/* someone disowned an object */
var e_selfdone=45;
/* done editing self description */
var e_whisper=46;
/* someone whispers to someone else */
var e_wield=47;
/* player wields a weapon */
var e_unwield=48;
/* player puts a weapon away */
var e_donecrystaluse=49;
/* done using the crystal ball */
var e_wear=50;
/* someone has put on something */
var e_unwear=51;
/* someone has taken off something */
var e_destroy=52;
/* someone has destroyed an object */
var e_hidesay=53;
/* anonymous say */
var e_objpublic=54;
/* someone made an object public */
var e_sysdone=55;
/* done with system maint. mode */
var e_unmake=56;
/* remove typedef for object */
var e_lookdetail=57;
/* looking at a detail of this room */
var e_accept=58;
/* made an "accept" exit here */
var e_refuse=59;
/* got rid of an "accept" exit here */
var e_died=60;
/* someone died and evaporated */
var e_lookyou=61;
/* someone is looking at you */
var e_failget=62;
/* someone can't get something */
var e_failuse=63;
/* someone can't use something */
var e_chill=64;
/* someone scrys you */
var e_noise2=65;
/* say while in crystal ball */
var e_lookself=66;
/* someone looks at themself */
var e_invent=67;
/* someone takes inventory */
var e_poofyou=68;
/* MM poofs someone away . . . . */
var e_who=69;
/* someone does a who */
var e_players=70;
/* someone does a players */
var e_viewself=71;
/* someone views a self description */
var e_realnoise=72;
/* make the real noises message print */
var e_altnoise=73;
/* alternate mystery message */
var e_midnight=74;
/* it's midnight now, tell everyone */
var e_action=100;
/* base command action event */
/* Misc. */
var goodhealth=7;
/* This is a list of description block numbers;
   	  If a number is zero, there is no text for that block */
/* exit kinds:
   		0: no way - blocked exit
   		1: open passageway
   		2: object required
   
   		6: exit only exists if player is holding the key */
/* location exit goes to */
/* type of the exit */
/* exit slot of toloc target */
/* one liner description of exit */
/* desc of a closed door */
/* description if can't go thru */
/* desc while going thru exit */
/* what others see when you go into the exit */
/* ofail, */
/* what others see when you come out of the exit */
/* all refer to the liner file */
/* if zero defaults will be printed */
/* **** about to change this **** */
/* object required to pass this exit */
/* alias for the exit dir, a keyword */
/* require alias as a verb to work */
/* require alias only (no direction) to
   					  pass through the exit */
/* do a look when user comes out of exit */
/* index record # 1 is block index */
/* index record # 2 is line index */
/* index record # 3 is room index */
/* index record # 4 is player alloc index */
/* index record # 5 is player awake (in game) index */
/* validation number */
/* max records available */
/* record #s in use */
/* names are record #1 */
/* owners are record # 2 */
/* player pers_names are record # 3 */
/* userids are record # 4 */
/* object names are record # 5 */
/* object creators are record # 6 */
/* date of last play is # 7 */
/* time of last play is # 8 */
/* allocation number for the object */
/* number index to objnam/objown */
/* duplicate of name of object */
/* what kind of object this is */
/* liner desc of object Here */
/* if object at home, then print the */
/* home description */
/* action index -- programs for the future */
/* desc block for close inspection */
/* how much it cost to make (in gold) */
/* number in existence */
/* can they ever get it? */
/* object required to get this object */
/* fail-to-get description */
/* successful picked up description */
/* object require to use this object */
/* place have to be to use this object */
/* fail-to-use description */
/* successful use of object description */
/* a,an,some, etc... "particle" is not
   					  be right, but hey, it's in the code */
/* extra description # 1 */
/* extra description # 2 */
/* slot of sender */
/* what event this is, E_something */
/* opt target of action */
/* expansion parm */
/* string for SAY and other cmds */
/* room that event is targeted for */
/* validation number for record locking */
/* circular buffer pointer */
/* 0=none,1=player,2=npc */
/* index to npc controller (object?) */
/* actual userid of person */
/* chosen name of person */
/* degree to which they're hiding */
/* last thing that this person did */
/* objects being held */
/* object that they're wearing */
/* weapon they're wielding */
/* how healthy they are */
/* self description */
/* number used in this block */
/* validation number for record locking */
/* who owns the room: userid if private
   							     '' if public
   							     '*' if disowned */
/* pretty name for location */
/* code for printing name:
   						0: don't print it
   						1: You're in
   						2: You're at */
/* room descriptions */
/* 0 = only print primary room desc.
   					  1 = only print secondary room desc.
   					  2 = print both
   					  3 = print primary then secondary
   						if has magic object */
/* special object for this room */
/* if more than maxobjs objects here */
/* refs to object file */
/* how much each object
   							  is hidden */
/* see hidden on exitrec
   							  above */
/* where objects go when they're dropped */
/* what it says when they're dropped */
/* what it says in target room when
   					  "bounced" object comes in */
/* where the "trapdoor" goes */
/* how often the trapdoor works */
/* message that randomly prints */
/* another random block */
/* default fail description for exits */
/* what other's see when you fail, default */
var oldcmd="";
/* string for '.' command to do last command */
var inmem=false;
/* Is this rooms roomrec (here....) in memory?
   			   We call gethere many times to make sure
   			   here is current.  However, we only want to
   			   actually do a getroom if the roomrec has been
   			   modified */
var brief=false;
/* brief/verbose descriptions */
var rndcycle=0;
/* integer for rnd_event */
var debug=false;
var ping_answered=false;
/* flag for ping answers */
var hiding=false;
/* is player hiding? */
var midnight_notyet=true;
/* hasn't been midnight yet */
var first_puttoken=true;
/* flag for first place into world */
var logged_act=false;
/* flag to indicate that a log_action
   					  has been called, and the next call
   					  to clear_command needs to clear the
   					  action parms in the here roomrec */
var roomfile=$file(()=>({valid:0,locnum:0,owner:"",nicename:"",nameprint:0,primary:0,secondary:0,which:0,magicobj:0,effects:0,parm:0,exits:$arr(1,maxexit,()=>({toloc:0,kind:0,slot:0,exitdesc:0,closed:0,fail:0,success:0,goin:0,comeout:0,hidden:0,objreq:0,alias:"",reqverb:false,reqalias:false,autolook:false})),pile:0,objs:$zeros(maxobjs),objhide:$zeros(maxobjs),objdrop:0,objdesc:0,objdest:0,people:$arr(1,maxpeople,()=>({kind:0,parm:0,username:"",name_:"",hiding:0,act:0,targ:0,holding:$zeros(maxhold),experience:0,wearing:0,wielding:0,health:0,self:0,ex1:0,ex2:0,ex3:0,ex4:0,ex5:0})),grploc1:0,grploc2:0,grpnam1:"",grpnam2:"",detail:$arr(1,maxdetail,()=>""),detaildesc:$zeros(maxdetail),trapto:0,trapchance:0,rndmsg:0,xmsg2:0,exp2:0,exp3:0,exp4:0,exitfail:0,ofail:0}));
var eventfile=$file(()=>({validat:0,evnt:$arr(1,maxevent,()=>({sender:0,action:0,target:0,parm:0,msg:"",loc:0})),point:0}));
var namfile=$file(()=>({validate:0,loctop:0,idents:$arr(1,maxroom,()=>"")}));
var descfile=$file(()=>({descrinum:0,lines:$arr(1,descmax,()=>""),desclen:0}));
var linefile=$file(()=>({linenum:0,theline:""}));
var indexfile=$file(()=>({indexnum:0,free:$arr(1,maxindex,()=>false),top:0,inuse:0}));
var intfile=$file(()=>({intnum:0,int:$zeros(maxplayers)}));
var objfile=$file(()=>({objnum:0,onum:0,oname:"",kind:0,linedesc:0,home:0,homedesc:0,actindx:0,examine:0,worth:0,numexist:0,sticky:false,getobjreq:0,getfail:0,getsuccess:0,useobjreq:0,uselocreq:0,usefail:0,usesuccess:0,usealias:"",reqalias:false,reqverb:false,particle:0,parms:$zeros(maxparm),d1:0,d2:0,exp3:0,exp4:0,exp5:0,exp6:0}));
var spellfile=$file(()=>({recnum:0,level:$zeros(maxspells)}));
var cmds=$fill([0,"name","help","?","quit","look","go","form","link","unlink","whisper","poof","describe","","debug","say","","rooms","system","disown","claim","make","public","accept","refuse","zap","hide","l","north","south","east","west","up","down","n","s","e","w","u","d","customize","who","players","search","reveal","punch","ping","health","get","drop","inventory","i","self","whois","duplicate","","version","objects","use","wield","brief","wear","relink","unmake","destroy","show","set","","","","","","","","",""],maxcmds,()=>"");
/* setnam = 1 */
/* help = 2 */
/* quest = 3 */
/* quit = 4 */
/* look = 5 */
/* go = 6 */
/* form = 7 */
/* link = 8 */
/* unlink = 9 */
/* c_whisper = 10 */
/* poof = 11 */
/* desc = 12 */
/* dbg = 14 */
/* say = 15 */
/*  */
/* c_rooms = 17 */
/* c_system = 18 */
/* c_disown = 19 */
/* c_claim = 20 */
/* c_create = 21 */
/* c_public = 22 */
/* c_accept = 23 */
/* c_refuse = 24 */
/* c_zap = 25 */
/* c_hide = 26 */
/* c_l = 27 */
/* c_north = 28 */
/* c_south = 29 */
/* c_east = 30 */
/* c_west = 31 */
/* c_up = 32 */
/* c_down = 33 */
/* c_n = 34 */
/* c_s = 35 */
/* c_e = 36 */
/* c_w = 37 */
/* c_u = 38 */
/* c_d = 39 */
/* c_custom = 40 */
/* c_who = 41 */
/* c_players = 42 */
/* c_search = 43 */
/* c_unhide = 44 */
/* c_punch = 45 */
/* c_ping = 46 */
/* c_health = 47 */
/* c_get = 48 */
/* c_drop = 49 */
/* c_inv = 50 */
/* c_i = 51 */
/* c_self = 52 */
/* c_whois = 53 */
/* c_duplicate = 54 */
/* c_version = 56 */
/* c_objects = 57 */
/* c_use = 58 */
/* c_wield = 59 */
/* c_brief = 60 */
/* c_wear = 61 */
/* c_relink = 62 */
/* c_unmake = 63 */
/* c_destroy = 64 */
/* c_show = 65 */
/* c_set = 66 */
var numcmds=0;
/* number of main level commands there are */
var show=$arr(1,maxshow,()=>"");
var numshow=0;
var setkey=$arr(1,maxshow,()=>"");
var numset=0;
var direct=$fill([0,"north","south","east","west","up","down"],maxexit,()=>"");
var spells=$arr(1,maxspells,()=>"");
/* names of spells */
var numspells=0;
/* number of spells there actually are */
var done=false;
/* flag for QUIT */
var userid="";
/* userid of this player */
var location=0;
/* current place number */
var hold_kind=$zeros(maxhold);
/* kinds of the objects i'm
   						   holding */
var myslot=1;
/* here.people[myslot]... is this player */
var myname="";
/* personal name this player chose (setname) */
var myevent=0;
/* which point in event buffer we are at */
var found_exit=$arr(1,maxexit,()=>false);
/* has exit i been found by the player? */
var mylog=0;
/* which log entry this player is */
var mywear=0;
/* what I'm wearing */
var mywield=0;
/* weapon I'm wielding */
var myhealth=0;
/* how well I'm feeling */
var myexperience=0;
/* how experienced I am */
var myself=0;
/* self description block */
var healthcycle=0;
/* used in rnd_event to control how quickly a
   				  player heals */
var here=({valid:0,locnum:0,owner:"",nicename:"",nameprint:0,primary:0,secondary:0,which:0,magicobj:0,effects:0,parm:0,exits:$arr(1,maxexit,()=>({toloc:0,kind:0,slot:0,exitdesc:0,closed:0,fail:0,success:0,goin:0,comeout:0,hidden:0,objreq:0,alias:"",reqverb:false,reqalias:false,autolook:false})),pile:0,objs:$zeros(maxobjs),objhide:$zeros(maxobjs),objdrop:0,objdesc:0,objdest:0,people:$arr(1,maxpeople,()=>({kind:0,parm:0,username:"",name_:"",hiding:0,act:0,targ:0,holding:$zeros(maxhold),experience:0,wearing:0,wielding:0,health:0,self:0,ex1:0,ex2:0,ex3:0,ex4:0,ex5:0})),grploc1:0,grploc2:0,grpnam1:"",grpnam2:"",detail:$arr(1,maxdetail,()=>""),detaildesc:$zeros(maxdetail),trapto:0,trapchance:0,rndmsg:0,xmsg2:0,exp2:0,exp3:0,exp4:0,exitfail:0,ofail:0});
/* current room record */
var event=({validat:0,evnt:$arr(1,maxevent,()=>({sender:0,action:0,target:0,parm:0,msg:"",loc:0})),point:0});
var privd=false;
var objnam=({validate:0,loctop:0,idents:$arr(1,maxroom,()=>"")});
var objown=({validate:0,loctop:0,idents:$arr(1,maxroom,()=>"")});
var nam=({validate:0,loctop:0,idents:$arr(1,maxroom,()=>"")});
var own=({validate:0,loctop:0,idents:$arr(1,maxroom,()=>"")});
var pers=({validate:0,loctop:0,idents:$arr(1,maxroom,()=>"")});
var user=({validate:0,loctop:0,idents:$arr(1,maxroom,()=>"")});
var adate=({validate:0,loctop:0,idents:$arr(1,maxroom,()=>"")});
var atime=({validate:0,loctop:0,idents:$arr(1,maxroom,()=>"")});
/* object names */
/* object owners */
/* record 1 is room names */
/* rec 2 is room owners */
/* 3 is player personal names */
/* 4 is player userid */
/* 5 is date of last play */
/* 6 is time of last play */
var anint=({intnum:0,int:$zeros(maxplayers)});
/* info about game players */
var obj=({objnum:0,onum:0,oname:"",kind:0,linedesc:0,home:0,homedesc:0,actindx:0,examine:0,worth:0,numexist:0,sticky:false,getobjreq:0,getfail:0,getsuccess:0,useobjreq:0,uselocreq:0,usefail:0,usesuccess:0,usealias:"",reqalias:false,reqverb:false,particle:0,parms:$zeros(maxparm),d1:0,d2:0,exp3:0,exp4:0,exp5:0,exp6:0});
var spell=({recnum:0,level:$zeros(maxspells)});
var block=({descrinum:0,lines:$arr(1,descmax,()=>""),desclen:0});
/* a text block of descmax lines */
var indx=({indexnum:0,free:$arr(1,maxindex,()=>false),top:0,inuse:0});
/* an record allocation record */
var oneliner=({linenum:0,theline:""});
/* a line record */
var heredsc=({descrinum:0,lines:$arr(1,descmax,()=>""),desclen:0});
/* system SLEEP call */
/* system random number generator */
/* returns a random # between 0-100 */
/* disables ctrl-Y/ctrl-C */
/* necessary to prevent ZOMBIES in the world */
/* re-enables ctrl-Y/ctrl-C */
/* Input routine.   Gets a line of text from user which checking
     for async events */
function* collision_wait(){
  var wait_time=0;
  wait_time=random();
  if((wait_time<0.001)){
    wait_time=0.001;
  }
  (yield* wait(wait_time));
}
/* increment err; if err is too high, suspect deadlock */
/* this is called by all getX procedures to ease deadlock checking */
function deadcheck(err,s){
  err.v=(err.v+1);
  if((err.v>maxerr)){
    $writeln($ws("%warning- ",0)+$ws(s,0)+$ws(" seems to be deadlocked; notify the Monster Manager",0));
    finish_guts();
    $halt();
    err.v=0;
  }
}
/* first procedure of form getX
     attempts to get given room record
     resolves record access conflicts, checks for deadlocks
     Locks record; use freeroom immediately after getroom if data is
     for read-only */
function* getroom(n=0){
  var err=0;
  if((n===0)){
    n=location;
  }
  roomfile.buf.valid=0;
  err=0;
  if(debug){
    $writeln($ws("%getroom(",0)+$wi(n,1)+$ws(")",0));
  }
  $find(roomfile,n);
  while((roomfile.buf.valid!==n)){
    deadcheck({get v(){return err},set v($x){err=$x}},"getroom");
    (yield* collision_wait());
    $find(roomfile,n);
  }
  $assign(here,roomfile.buf);
  inmem=false;
}
/* since this getroom could be doing anything, we will
   		  assume that it is bozoing the correct here record for
   		  this room.  If this getroom called by gethere, then
   		  gethere will correct inmem immediately.  Otherwise
   		  the next gethere will restore the correct here record. */
function putroom(){
  $locate(roomfile,here.valid);
  $assign(roomfile.buf,here);
  $put(roomfile);
}
/* unlock the record if you're not going to write it */
function freeroom(){
  $unlock(roomfile);
}
function* gethere(n=0){
  if((((n===0))||((n===location)))){
    if(!(inmem)){
      (yield* getroom());
      /* getroom(n) okay here also */
      freeroom();
      inmem=true;
    }else if(debug){
      $writeln($ws("%gethere - here already in memory",0));
    }
  }else{
    (yield* getroom(n));
    freeroom();
  }
}
function* getown(){
  var err=0;
  namfile.buf.validate=0;
  err=0;
  $find(namfile,2);
  while((namfile.buf.validate!==2)){
    deadcheck({get v(){return err},set v($x){err=$x}},"getown");
    (yield* collision_wait());
    $find(namfile,2);
  }
  $assign(own,namfile.buf);
}
function* getnam(){
  var err=0;
  namfile.buf.validate=0;
  err=0;
  $find(namfile,1);
  while((namfile.buf.validate!==1)){
    deadcheck({get v(){return err},set v($x){err=$x}},"getnam");
    (yield* collision_wait());
    $find(namfile,1);
  }
  $assign(nam,namfile.buf);
}
function freenam(){
  $unlock(namfile);
}
function freeown(){
  $unlock(namfile);
}
function putnam(){
  $locate(namfile,1);
  $assign(namfile.buf,nam);
  $put(namfile);
}
function putown(){
  $locate(namfile,2);
  $assign(namfile.buf,own);
  $put(namfile);
}
function* getobj(n){
  var err=0;
  if((n===0)){
    n=location;
  }
  objfile.buf.objnum=0;
  err=0;
  $find(objfile,n);
  while((objfile.buf.objnum!==n)){
    deadcheck({get v(){return err},set v($x){err=$x}},"getobj");
    (yield* collision_wait());
    $find(objfile,n);
  }
  $assign(obj,objfile.buf);
}
function putobj(){
  $locate(objfile,obj.objnum);
  $assign(objfile.buf,obj);
  $put(objfile);
}
/* unlock the record if you're not going to write it */
function freeobj(){
  $unlock(objfile);
}
function* getint(n){
  var err=0;
  intfile.buf.intnum=0;
  err=0;
  $find(intfile,n);
  while((intfile.buf.intnum!==n)){
    deadcheck({get v(){return err},set v($x){err=$x}},"getint");
    (yield* collision_wait());
    $find(intfile,n);
  }
  $assign(anint,intfile.buf);
}
function freeint(){
  $unlock(intfile);
}
function putint(){
  var n=0;
  n=anint.intnum;
  $locate(intfile,n);
  $assign(intfile.buf,anint);
  $put(intfile);
}
function* getspell(n=0){
  var err=0;
  if((n===0)){
    n=mylog;
  }
  spellfile.buf.recnum=0;
  err=0;
  $find(spellfile,n);
  while((spellfile.buf.recnum!==n)){
    deadcheck({get v(){return err},set v($x){err=$x}},"getspell");
    (yield* collision_wait());
    $find(spellfile,n);
  }
  $assign(spell,spellfile.buf);
}
function freespell(){
  $unlock(spellfile);
}
function putspell(){
  var n=0;
  n=spell.recnum;
  $locate(spellfile,n);
  $assign(spellfile.buf,spell);
  $put(spellfile);
}
/* get log rec with everyone's userids in it */
function* getuser(){
  var err=0;
  namfile.buf.validate=0;
  err=0;
  $find(namfile,4);
  while((namfile.buf.validate!==4)){
    deadcheck({get v(){return err},set v($x){err=$x}},"getuser");
    (yield* collision_wait());
    $find(namfile,4);
  }
  $assign(user,namfile.buf);
}
function freeuser(){
  $unlock(namfile);
}
function putuser(){
  $locate(namfile,4);
  $assign(namfile.buf,user);
  $put(namfile);
}
/* get log rec with date of last play in it */
function* getdate(){
  var err=0;
  namfile.buf.validate=0;
  err=0;
  $find(namfile,7);
  while((namfile.buf.validate!==7)){
    deadcheck({get v(){return err},set v($x){err=$x}},"getdate");
    (yield* collision_wait());
    $find(namfile,7);
  }
  $assign(adate,namfile.buf);
}
function freedate(){
  $unlock(namfile);
}
function putdate(){
  $locate(namfile,7);
  $assign(namfile.buf,adate);
  $put(namfile);
}
/* get log rec with time of last play in it */
function* gettime(){
  var err=0;
  namfile.buf.validate=0;
  err=0;
  $find(namfile,8);
  while((namfile.buf.validate!==8)){
    deadcheck({get v(){return err},set v($x){err=$x}},"gettime");
    (yield* collision_wait());
    $find(namfile,8);
  }
  $assign(atime,namfile.buf);
}
function freetime(){
  $unlock(namfile);
}
function puttime(){
  $locate(namfile,8);
  $assign(namfile.buf,atime);
  $put(namfile);
}
function* getobjnam(){
  var err=0;
  namfile.buf.validate=0;
  err=0;
  $find(namfile,5);
  while((namfile.buf.validate!==5)){
    deadcheck({get v(){return err},set v($x){err=$x}},"getobjnam");
    (yield* collision_wait());
    $find(namfile,5);
  }
  $assign(objnam,namfile.buf);
}
function freeobjnam(){
  $unlock(namfile);
}
function putobjnam(){
  $locate(namfile,5);
  $assign(namfile.buf,objnam);
  $put(namfile);
}
function* getobjown(){
  var err=0;
  namfile.buf.validate=0;
  err=0;
  $find(namfile,6);
  while((namfile.buf.validate!==6)){
    deadcheck({get v(){return err},set v($x){err=$x}},"getobjown");
    (yield* collision_wait());
    $find(namfile,6);
  }
  $assign(objown,namfile.buf);
}
function freeobjown(){
  $unlock(namfile);
}
function putobjown(){
  $locate(namfile,6);
  $assign(namfile.buf,objown);
  $put(namfile);
}
/* get log rec with everyone's pers names in it */
function* getpers(){
  var err=0;
  namfile.buf.validate=0;
  err=0;
  $find(namfile,3);
  while((namfile.buf.validate!==3)){
    deadcheck({get v(){return err},set v($x){err=$x}},"getpers");
    (yield* collision_wait());
    $find(namfile,3);
  }
  $assign(pers,namfile.buf);
}
function freepers(){
  $unlock(namfile);
}
function putpers(){
  $locate(namfile,3);
  $assign(namfile.buf,pers);
  $put(namfile);
}
function* getevent(n=0){
  var err=0;
  if((n===0)){
    n=location;
  }
  n=(($mod(n,numevnts))+1);
  eventfile.buf.validat=0;
  err=0;
  $find(eventfile,n);
  while((eventfile.buf.validat!==n)){
    deadcheck({get v(){return err},set v($x){err=$x}},"getevent");
    (yield* collision_wait());
    $find(eventfile,n);
  }
  $assign(event,eventfile.buf);
}
function freeevent(){
  $unlock(eventfile);
}
function putevent(){
  $locate(eventfile,event.validat);
  $assign(eventfile.buf,event);
  $put(eventfile);
}
function* getblock(n){
  var err=0;
  if(debug){
    $writeln($ws("%getblock: ",0)+$wi(n,1));
  }
  descfile.buf.descrinum=0;
  err=0;
  $find(descfile,n);
  while((descfile.buf.descrinum!==n)){
    deadcheck({get v(){return err},set v($x){err=$x}},"getblock");
    (yield* collision_wait());
    $find(descfile,n);
  }
  $assign(block,descfile.buf);
}
function putblock(){
  var n=0;
  n=block.descrinum;
  if(debug){
    $writeln($ws("%putblock: ",0)+$wi(n,1));
  }
  if((n!==0)){
    $locate(descfile,n);
    $assign(descfile.buf,block);
    $put(descfile);
  }
}
/* unlock the record if you're not going to write it */
function freeblock(){
  $unlock(descfile);
}
/* *** new code begins here *** */
function* getline(n){
  var err=0;
  if((n===(-1))){
    oneliner.theline="";
  }else{
    err=0;
    linefile.buf.linenum=0;
    $find(linefile,n);
    while((linefile.buf.linenum!==n)){
      deadcheck({get v(){return err},set v($x){err=$x}},"getline");
      (yield* collision_wait());
      $find(linefile,n);
    }
    $assign(oneliner,linefile.buf);
  }
}
function putline(){
  if((oneliner.linenum>0)){
    $locate(linefile,oneliner.linenum);
    $assign(linefile.buf,oneliner);
    $put(linefile);
  }
}
/* unlock the record if you're not going to write it */
function freeline(){
  $unlock(linefile);
}
/* Index record 1 -- Description blocks that are free
   Index record 2 -- One liners that are free */
function* getindex(n){
  var err=0;
  indexfile.buf.indexnum=0;
  err=0;
  $find(indexfile,n);
  while((indexfile.buf.indexnum!==n)){
    deadcheck({get v(){return err},set v($x){err=$x}},"getindex");
    (yield* collision_wait());
    $find(indexfile,n);
  }
  $assign(indx,indexfile.buf);
}
function putindex(){
  $locate(indexfile,indx.indexnum);
  $assign(indexfile.buf,indx);
  $put(indexfile);
}
/* unlock the record if you're not going to write it */
function freeindex(){
  $unlock(indexfile);
}
/* First procedure of form alloc_X
   Allocates the oneliner resource using the indexrec bitmaps
   
   Return the number of a one liner if one is available
   and remove it from the free list */
function* alloc_line(n){
  var $ret=false;
  var found=false;
  (yield* getindex(i_line));
  if((indx.inuse===indx.top)){
    freeindex();
    n.v=0;
    $ret=false;
    $writeln($ws("There are no available one line descriptions.",0));
  }else{
    n.v=1;
    found=false;
    while(((!found)&&((n.v<=indx.top)))){
      if(indx.free[n.v]){
        found=true;
      }else{
        n.v=(n.v+1);
      }
    }
    if(found){
      indx.free[n.v]=false;
      $ret=true;
      indx.inuse=(indx.inuse+1);
      putindex();
    }else{
      freeindex();
      $writeln($ws("%serious error in alloc_line; notify Monster Manager",0));
      $ret=false;
    }
  }
  return $ret;
}
/* put the line specified by n back on the free list
   zeroes n also, for convenience */
function* delete_line(n){
  if((n.v===default_line)){
    n.v=0;
  }else if((n.v>0)){
    (yield* getindex(i_line));
    indx.inuse=(indx.inuse-1);
    indx.free[n.v]=true;
    putindex();
  }
  n.v=0;
}
function* alloc_int(n){
  var $ret=false;
  var found=false;
  (yield* getindex(i_int));
  if((indx.inuse===indx.top)){
    freeindex();
    n.v=0;
    $ret=false;
    $writeln($ws("There are no available integer records.",0));
  }else{
    n.v=1;
    found=false;
    while(((!found)&&((n.v<=indx.top)))){
      if(indx.free[n.v]){
        found=true;
      }else{
        n.v=(n.v+1);
      }
    }
    if(found){
      indx.free[n.v]=false;
      $ret=true;
      indx.inuse=(indx.inuse+1);
      putindex();
    }else{
      freeindex();
      $writeln($ws("%serious error in alloc_int; notify Monster Manager",0));
      $ret=false;
    }
  }
  return $ret;
}
function* delete_int(n){
  if((n.v>0)){
    (yield* getindex(i_int));
    indx.inuse=(indx.inuse-1);
    indx.free[n.v]=true;
    putindex();
  }
  n.v=0;
}
/* Return the number of a description block if available and
   remove it from the free list */
function* alloc_block(n){
  var $ret=false;
  var found=false;
  if(debug){
    $writeln($ws("%alloc_block entry",0));
  }
  (yield* getindex(i_block));
  if((indx.inuse===indx.top)){
    freeindex();
    n.v=0;
    $ret=false;
    $writeln($ws("There are no available description blocks.",0));
  }else{
    n.v=1;
    found=false;
    while(((!found)&&((n.v<=indx.top)))){
      if(indx.free[n.v]){
        found=true;
      }else{
        n.v=(n.v+1);
      }
    }
    if(found){
      indx.free[n.v]=false;
      $ret=true;
      indx.inuse=(indx.inuse+1);
      putindex();
      if(debug){
        $writeln($ws("%alloc_block successful",0));
      }
    }else{
      freeindex();
      $writeln($ws("%serious error in alloc_block; notify Monster Manager",0));
      $ret=false;
    }
  }
  return $ret;
}
/* puts a description block back on the free list
   zeroes n for convenience */
function* delete_block(n){
  if((n.v===default_line)){
    n.v=0;
  /* no line really exists in the file */
  }else if((n.v>0)){
    (yield* getindex(i_block));
    indx.inuse=(indx.inuse-1);
    indx.free[n.v]=true;
    putindex();
    n.v=0;
  }else if((n.v<0)){
    n.v=((-n.v));
    (yield* delete_line(n));
  }
}
/* Return the number of a room if one is available
   and remove it from the free list */
function* alloc_room(n){
  var $ret=false;
  var found=false;
  (yield* getindex(i_room));
  if((indx.inuse===indx.top)){
    freeindex();
    n.v=0;
    $ret=false;
    $writeln($ws("There are no available free rooms.",0));
  }else{
    n.v=1;
    found=false;
    while(((!found)&&((n.v<=indx.top)))){
      if(indx.free[n.v]){
        found=true;
      }else{
        n.v=(n.v+1);
      }
    }
    if(found){
      indx.free[n.v]=false;
      $ret=true;
      indx.inuse=(indx.inuse+1);
      putindex();
    }else{
      freeindex();
      $writeln($ws("%serious error in alloc_room; notify Monster Manager",0));
      $ret=false;
    }
  }
  return $ret;
}
/* Called by DEL_ROOM()
   put the room specified by n back on the free list
   zeroes n also, for convenience */
function* delete_room(n){
  if((n.v!==0)){
    (yield* getindex(i_room));
    indx.inuse=(indx.inuse-1);
    indx.free[n.v]=true;
    putindex();
    n.v=0;
  }
}
function* alloc_log(n){
  var $ret=false;
  var found=false;
  (yield* getindex(i_player));
  if((indx.inuse===indx.top)){
    freeindex();
    n.v=0;
    $ret=false;
    $writeln($ws("There are too many monster players, you can't find a space.",0));
  }else{
    n.v=1;
    found=false;
    while(((!found)&&((n.v<=indx.top)))){
      if(indx.free[n.v]){
        found=true;
      }else{
        n.v=(n.v+1);
      }
    }
    if(found){
      indx.free[n.v]=false;
      $ret=true;
      indx.inuse=(indx.inuse+1);
      putindex();
    }else{
      freeindex();
      $writeln($ws("%serious error in alloc_log; notify Monster Manager",0));
      $ret=false;
    }
  }
  return $ret;
}
function* delete_log(n){
  if((n.v!==0)){
    (yield* getindex(i_player));
    indx.inuse=(indx.inuse-1);
    indx.free[n.v]=true;
    putindex();
    n.v=0;
  }
}
function lowcase(s){
  var $ret="";
  var sprime="";
  var i=0;
  if((s.length===0)){
    $ret="";
  }else{
    sprime=s;
    for(var $e1=s.length,$ie1=1;$ie1<=$e1;$ie1++){
      i=$ie1;
      if($in($ch(sprime,i),$set([...$rng("A","Z")]))){
        sprime=$setch(sprime,i,$chr(($ord("a")+(($ord($ch(sprime,i))-$ord("A"))))));
      }
    }
    $ret=sprime;
  }
  return $ret;
}
/* lookup a spell with disambiguation in the spell list */
function lookup_spell(n,s){
  var $ret=false;
  var i=0;
  var poss=0;
  var maybe=0;
  var num=0;
  s=lowcase(s);
  i=1;
  maybe=0;
  num=0;
  for(var $e2=numspells,$ie2=1;$ie2<=$e2;$ie2++){
    i=$ie2;
    if((s===spells[i])){
      num=i;
    }else if(($index(spells[i],s)===1)){
      maybe=(maybe+1);
      poss=i;
    }
  }
  if((num!==0)){
    n.v=num;
    $ret=true;
  }else if((maybe===1)){
    n.v=poss;
    $ret=true;
  }else if((maybe>1)){
    $ret=false;
  }else{
    $ret=false;
  }
  return $ret;
}
function* lookup_user(pnum,s){
  var $ret=false;
  var i=0;
  var poss=0;
  var maybe=0;
  var num=0;
  (yield* getuser());
  freeuser();
  (yield* getindex(i_player));
  freeindex();
  s=lowcase(s);
  i=1;
  maybe=0;
  num=0;
  for(var $e3=indx.top,$ie3=1;$ie3<=$e3;$ie3++){
    i=$ie3;
    if(!(indx.free[i])){
      if((s===user.idents[i])){
        num=i;
      }else if(($index(user.idents[i],s)===1)){
        maybe=(maybe+1);
        poss=i;
      }
    }
  }
  if((num!==0)){
    pnum.v=num;
    $ret=true;
  }else if((maybe===1)){
    pnum.v=poss;
    $ret=true;
  }else if((maybe>1)){
    /* writeln('-- Ambiguous direction'); */
    $ret=false;
  }else{
    $ret=false;
  }
  return $ret;
}
/* writeln('-- Unknown direction'); */
function* alloc_obj(n){
  var $ret=false;
  var found=false;
  (yield* getindex(i_object));
  if((indx.inuse===indx.top)){
    freeindex();
    n.v=0;
    $ret=false;
    $writeln($ws("All of the possible objects have been made.",0));
  }else{
    n.v=1;
    found=false;
    while(((!found)&&((n.v<=indx.top)))){
      if(indx.free[n.v]){
        found=true;
      }else{
        n.v=(n.v+1);
      }
    }
    if(found){
      indx.free[n.v]=false;
      $ret=true;
      indx.inuse=(indx.inuse+1);
      putindex();
    }else{
      freeindex();
      $writeln($ws("%serious error in alloc_obj; notify Monster Manager",0));
      $ret=false;
    }
  }
  return $ret;
}
function* delete_obj(n){
  if((n.v!==0)){
    (yield* getindex(i_object));
    indx.inuse=(indx.inuse-1);
    indx.free[n.v]=true;
    putindex();
    n.v=0;
  }
}
function* lookup_obj(pnum,s){
  var $ret=false;
  var i=0;
  var poss=0;
  var maybe=0;
  var num=0;
  var tmp="";
  (yield* getobjnam());
  freeobjnam();
  (yield* getindex(i_object));
  freeindex();
  s=lowcase(s);
  i=1;
  maybe=0;
  num=0;
  for(var $e4=indx.top,$ie4=1;$ie4<=$e4;$ie4++){
    i=$ie4;
    if(!(indx.free[i])){
      if((s===objnam.idents[i])){
        num=i;
      }else if(($index(objnam.idents[i],s)===1)){
        maybe=(maybe+1);
        poss=i;
      }
    }
  }
  if((num!==0)){
    pnum.v=num;
    $ret=true;
  }else if((maybe===1)){
    pnum.v=poss;
    $ret=true;
  }else if((maybe>1)){
    /* writeln('-- Ambiguous direction'); */
    $ret=false;
  }else{
    $ret=false;
  }
  return $ret;
}
/* writeln('-- Unknown direction'); */
/* returns true if object N is in this room */
function obj_here(n){
  var $ret=false;
  var i=0;
  var found=false;
  i=1;
  found=false;
  while((((i<=maxobjs))&&(!found))){
    if((here.objs[i]===n)){
      found=true;
    }else{
      i=(i+1);
    }
  }
  $ret=found;
  return $ret;
}
/* returns true if object N is being held by the player */
function obj_hold(n){
  var $ret=false;
  var i=0;
  var found=false;
  if((n===0)){
    $ret=false;
  }else{
    i=1;
    found=false;
    while((((i<=maxhold))&&(!found))){
      if((here.people[myslot].holding[i]===n)){
        found=true;
      }else{
        i=(i+1);
      }
    }
    $ret=found;
  }
  return $ret;
}
/* return the slot of an object that is HERE */
function find_obj(objnum){
  var $ret=0;
  var i=0;
  i=1;
  $ret=0;
  while((i<=maxobjs)){
    if((here.objs[i]===objnum)){
      $ret=i;
    }
    i=(i+1);
  }
  return $ret;
}
/* similar to lookup_obj, but only returns true if the object is in
     this room or is being held by the player */
function* parse_obj(n,s,override=false){
  var $ret=false;
  var slot=0;
  if((yield* lookup_obj(n,s))){
    if((obj_here(n.v)||obj_hold(n.v))){
      /* took out a great block of code that wouldn't let
         			  parse_obj work if player couldn't see object */
      $ret=true;
    }
  }else{
    $ret=false;
  }
  return $ret;
}
function* lookup_pers(pnum,s){
  var $ret=false;
  var i=0;
  var poss=0;
  var maybe=0;
  var num=0;
  var pname="";
  (yield* getpers());
  freepers();
  (yield* getindex(i_player));
  freeindex();
  s=lowcase(s);
  i=1;
  maybe=0;
  num=0;
  for(var $e5=indx.top,$ie5=1;$ie5<=$e5;$ie5++){
    i=$ie5;
    if(!(indx.free[i])){
      pname=lowcase(pers.idents[i]);
      if((s===pname)){
        num=i;
      }else if(($index(pname,s)===1)){
        maybe=(maybe+1);
        poss=i;
      }
    }
  }
  if((num!==0)){
    pnum.v=num;
    $ret=true;
  }else if((maybe===1)){
    pnum.v=poss;
    $ret=true;
  }else if((maybe>1)){
    /* writeln('-- Ambiguous direction'); */
    $ret=false;
  }else{
    $ret=false;
  }
  return $ret;
}
/* writeln('-- Unknown direction'); */
function* parse_pers(pnum,s){
  var $ret=false;
  var persnum=0;
  var i=0;
  var poss=0;
  var maybe=0;
  var num=0;
  var pname="";
  (yield* gethere());
  s=lowcase(s);
  i=1;
  maybe=0;
  num=0;
  for(var $e6=maxpeople,$ie6=1;$ie6<=$e6;$ie6++){
    i=$ie6;
    /* if here.people[i].username <> '' then begin */
    if((here.people[i].kind>0)){
      pname=lowcase(here.people[i].name_);
      if((s===pname)){
        num=i;
      }else if(($index(pname,s)===1)){
        maybe=(maybe+1);
        poss=i;
      }
    }
  }
  if((num!==0)){
    persnum=num;
    $ret=true;
  }else if((maybe===1)){
    persnum=poss;
    $ret=true;
  }else if((maybe>1)){
    persnum=0;
    $ret=false;
  }else{
    persnum=0;
    $ret=false;
  }
  if((persnum>0)){
    if((here.people[persnum].hiding>0)){
      $ret=false;
    }else{
      $ret=true;
      pnum.v=persnum;
    }
  }
  return $ret;
}
/* Returns TRUE if player is owner of room n
   If no n is given default will be this room (location) */
function* is_owner(n=0,surpress=false){
  var $ret=false;
  (yield* gethere(n));
  if((((here.owner===userid))||(privd))){
    $ret=true;
  }else{
    $ret=false;
    if(!(surpress)){
      $writeln($ws("You are not the owner of this room.",0));
    }
  }
  return $ret;
}
function* room_owner(n){
  var $ret="";
  if((n!==0)){
    (yield* gethere(n));
    $ret=here.owner;
    (yield* gethere());
  }else{
    /* restore old state! */
    $ret="no room";
  }
  return $ret;
}
/* Returns TRUE if player is allowed to alter the exit
   TRUE if either this room or if target room is owned by player */
function* can_alter(dir,room=0){
  var $ret=false;
  (yield* gethere());
  if((((here.owner===userid))||(privd))){
    $ret=true;
  }else{
    if((here.exits[dir].toloc>0)){
      if(((yield* room_owner(here.exits[dir].toloc))===userid)){
        $ret=true;
      }else{
        $ret=false;
      }
    }else{
      $ret=false;
    }
  }
  return $ret;
}
function* can_make(dir,room=0){
  var $ret=false;
  (yield* gethere(room));
  /* 5 is accept door */
  if(((here.exits[dir].toloc!==0))){
    $writeln($ws("There is already an exit there.  Use UNLINK or RELINK.",0));
    $ret=false;
  }else{
    if((((((here.owner===userid))||((here.exits[dir].kind===5)))||(privd))||((here.owner==="*")))){
      /* I'm the owner */
      /* there's an accept */
      /* Monster Manager */
      /* disowned room */
      $ret=true;
    }else{
      $ret=false;
      $writeln($ws("You are not allowed to create an exit there.",0));
    }
  }
  return $ret;
}
/* print a one liner */
function* print_line(n){
  if((n===default_line)){
    $writeln($ws("<default line>",0));
  }else if((n>0)){
    (yield* getline(n));
    freeline();
    $writeln($ws(oneliner.theline,0));
  }
}
function* print_desc(dsc,default_="<no default supplied>"){
  var i=0;
  if((dsc===default_line)){
    $writeln($ws(default_,0));
  }else if((dsc>0)){
    (yield* getblock(dsc));
    freeblock();
    i=1;
    while((i<=block.desclen)){
      $writeln($ws(block.lines[i],0));
      i=(i+1);
    }
  }else if((dsc<0)){
    (yield* print_line(Math.abs(dsc)));
  }
}
function* make_line(n,prompt="",limit=79){
  var s="";
  var ok=false;
  $writeln($ws("Type ** to leave line unchanged, * to make [no line]",0));
  (yield* grab_line(prompt,{get v(){return s},set v($x){s=$x}}));
  if((s==="**")){
    $writeln($ws("No changes.",0));
  }else if((s==="***")){
    n.v=default_line;
  }else if((s==="*")){
    if(debug){
      $writeln($ws("%deleting line ",0)+$wi(n.v,1));
    }
    (yield* delete_line(n));
  }else if((s==="")){
    if(debug){
      $writeln($ws("%deleting line ",0)+$wi(n.v,1));
    }
    (yield* delete_line(n));
  }else if((s.length>limit)){
    $writeln($ws("Please limit your string to ",0)+$wi(limit,1)+$ws(" characters.",0));
  }else{
    if((((n.v===0))||((n.v===default_line)))){
      if(debug){
        $writeln($ws("%makeline: allocating line",0));
      }
      ok=(yield* alloc_line(n));
    }else{
      ok=true;
    }
    if(ok){
      if(debug){
        $writeln($ws("%ok in makeline",0));
      }
      (yield* getline(n.v));
      oneliner.theline=s;
      putline();
      if(debug){
        $writeln($ws("%completed putline in makeline",0));
      }
    }
  }
}
/* translate a direction s [north, south, etc...] into the integer code */
function lookup_dir(dir,s){
  var $ret=false;
  var i=0;
  var poss=0;
  var maybe=0;
  var num=0;
  s=lowcase(s);
  i=1;
  maybe=0;
  num=0;
  for(var $e7=maxexit,$ie7=1;$ie7<=$e7;$ie7++){
    i=$ie7;
    if((s===direct[i])){
      num=i;
    }else if(($index(direct[i],s)===1)){
      maybe=(maybe+1);
      poss=i;
    }
  }
  if((num!==0)){
    dir.v=num;
    $ret=true;
  }else if((maybe===1)){
    dir.v=poss;
    $ret=true;
  }else if((maybe>1)){
    $ret=false;
  }else{
    /* writeln('-- Ambiguous direction'); */
    $ret=false;
  }
  return $ret;
}
/* writeln('-- Unknown direction'); */
function lookup_show(n,s){
  var $ret=false;
  var i=0;
  var poss=0;
  var maybe=0;
  var num=0;
  s=lowcase(s);
  i=1;
  maybe=0;
  num=0;
  for(var $e8=numshow,$ie8=1;$ie8<=$e8;$ie8++){
    i=$ie8;
    if((s===show[i])){
      num=i;
    }else if(($index(show[i],s)===1)){
      maybe=(maybe+1);
      poss=i;
    }
  }
  if((num!==0)){
    n.v=num;
    $ret=true;
  }else if((maybe===1)){
    n.v=poss;
    $ret=true;
  }else if((maybe>1)){
    $ret=false;
  }else{
    /* writeln('-- Ambiguous direction'); */
    $ret=false;
  }
  return $ret;
}
/* writeln('-- Unknown direction'); */
function lookup_set(n,s){
  var $ret=false;
  var i=0;
  var poss=0;
  var maybe=0;
  var num=0;
  s=lowcase(s);
  i=1;
  maybe=0;
  num=0;
  for(var $e9=numset,$ie9=1;$ie9<=$e9;$ie9++){
    i=$ie9;
    if((s===setkey[i])){
      num=i;
    }else if(($index(setkey[i],s)===1)){
      maybe=(maybe+1);
      poss=i;
    }
  }
  if((num!==0)){
    n.v=num;
    $ret=true;
  }else if((maybe===1)){
    n.v=poss;
    $ret=true;
  }else if((maybe>1)){
    $ret=false;
  }else{
    $ret=false;
  }
  return $ret;
}
function* lookup_room(n,s){
  var $ret=false;
  var found=false;
  var top=0;
  var i=0;
  var poss=0;
  var maybe=0;
  var num=0;
  if((s!=="")){
    s=lowcase(s);
    /* case insensitivity */
    (yield* getnam());
    freenam();
    (yield* getindex(i_room));
    freeindex();
    top=indx.top;
    i=1;
    maybe=0;
    num=0;
    for(var $e10=top,$ie10=1;$ie10<=$e10;$ie10++){
      i=$ie10;
      if((s===nam.idents[i])){
        num=i;
      }else if(($index(nam.idents[i],s)===1)){
        maybe=(maybe+1);
        poss=i;
      }
    }
    if((num!==0)){
      $ret=true;
      n.v=num;
    }else if((maybe===1)){
      $ret=true;
      n.v=poss;
    }else if((maybe>1)){
      $ret=false;
    }else{
      $ret=false;
    }
  }else{
    $ret=false;
  }
  return $ret;
}
function* exact_room(n,s){
  var $ret=false;
  var match=false;
  if(debug){
    $writeln($ws("%exact room: s = ",0)+$ws(s,0));
  }
  if((yield* lookup_room(n,s))){
    if((nam.idents[n.v]===lowcase(s))){
      $ret=true;
    }else{
      $ret=false;
    }
  }else{
    $ret=false;
  }
  return $ret;
}
function* exact_pers(n,s){
  var $ret=false;
  var match=false;
  if((yield* lookup_pers(n,s))){
    if((lowcase(pers.idents[n.v])===lowcase(s))){
      $ret=true;
    }else{
      $ret=false;
    }
  }else{
    $ret=false;
  }
  return $ret;
}
function* exact_user(n,s){
  var $ret=false;
  var match=false;
  if((yield* lookup_user(n,s))){
    if((lowcase(user.idents[n.v])===lowcase(s))){
      $ret=true;
    }else{
      $ret=false;
    }
  }else{
    $ret=false;
  }
  return $ret;
}
function* exact_obj(n,s){
  var $ret=false;
  var match=false;
  if((yield* lookup_obj(n,s))){
    if((objnam.idents[n.v]===lowcase(s))){
      $ret=true;
    }else{
      $ret=false;
    }
  }else{
    $ret=false;
  }
  return $ret;
}
/* Return n as the direction number if s is a valid alias for an exit */
function* lookup_alias(n,s){
  var $ret=false;
  var i=0;
  var poss=0;
  var maybe=0;
  var num=0;
  (yield* gethere());
  s=lowcase(s);
  i=1;
  maybe=0;
  num=0;
  for(var $e11=maxexit,$ie11=1;$ie11<=$e11;$ie11++){
    i=$ie11;
    if((s===here.exits[i].alias)){
      num=i;
    }else if(($index(here.exits[i].alias,s)===1)){
      maybe=(maybe+1);
      poss=i;
    }
  }
  if((num!==0)){
    n.v=num;
    $ret=true;
  }else if((maybe===1)){
    n.v=poss;
    $ret=true;
  }else if((maybe>1)){
    $ret=false;
  }else{
    $ret=false;
  }
  return $ret;
}
function exit_default(dir,kind){
  switch(kind){
    case 1:{
      $writeln($ws("There is a passage leading ",0)+$ws(direct[dir],0)+$ws(".",0));
      break;
    }
    case 2:{
      $writeln($ws("There is a locked door leading ",0)+$ws(direct[dir],0)+$ws(".",0));
      break;
    }
    case 5:{
      switch(dir){
        case north:case south:case east:case west:{
          $writeln($ws("A note on the ",0)+$ws(direct[dir],0)+$ws(" wall says \"Your exit here.\"",0));
          break;
        }
        case up:{
          $writeln($ws("A note on the ceiling says \"Your exit here.\"",0));
          break;
        }
        case down:{
          $writeln($ws("A note on the floor says \"Your exit here.\"",0));
          break;
        }
      }
      break;
    }
    default:{
      $writeln($ws("There is an exit: ",0)+$ws(direct[dir],0));
    }
  }
}
/* Prints out the exits here for DO_LOOK() */
function* show_exits(){
  var i=0;
  var one=false;
  var cansee=false;
  one=false;
  for(var $e14=maxexit,$ie14=1;$ie14<=$e14;$ie14++){
    i=$ie14;
    if((((here.exits[i].toloc!==0))||((here.exits[i].kind===5)))){
      /* there is an exit */
      /* there could be an exit */
      if((((here.exits[i].hidden===0))||(found_exit[i]))){
        cansee=true;
      }else{
        cansee=false;
      }
      if((here.exits[i].kind===6)){
        /* door kind only visible with object */
        if(obj_hold(here.exits[i].objreq)){
          cansee=true;
        }else{
          cansee=false;
        }
      }
      if(cansee){
        if((here.exits[i].exitdesc===default_line)){
          exit_default(i,here.exits[i].kind);
          /* give it direction and type */
          one=true;
        }else if((here.exits[i].exitdesc>0)){
          (yield* print_line(here.exits[i].exitdesc));
          one=true;
        }
      }
    }
  }
  if(one){
    $writeln("");
  }
}
function* setevent(){
  (yield* getevent());
  freeevent();
  myevent=event.point;
}
function isnum(s){
  var $ret=false;
  var i=0;
  $ret=true;
  if((s.length<1)){
    $ret=false;
  }else{
    i=1;
    while((i<=s.length)){
      if(!($in($ch(s,i),$set([...$rng("0","9")])))){
        $ret=false;
      }
      i=(i+1);
    }
  }
  return $ret;
}
function number(s){
  var $ret=0;
  var i=0;
  if((((s.length<1))||!($in($ch(s,1),$set([...$rng("0","9")]))))){
    $ret=0;
  }else{
    i=$readv(s);
    $ret=i;
  }
  return $ret;
}
/* slot of sender */
/* what event occurred */
/* target of event */
/* expansion parameter */
/* string for messages */
/* room to log event in */
function* log_event(send=0,act,targ=0,p=0,s="",room=0){
  if((room===0)){
    room=location;
  }
  (yield* getevent(room));
  event.point=(event.point+1);
  if(debug){
    $writeln($ws("%logging event ",0)+$wi(act,1)+$ws(" to point ",0)+$wi(event.point,1));
  }
  if((event.point>maxevent)){
    event.point=1;
  }
  var $w15=event.evnt[event.point];
  $w15.sender=send;
  $w15.action=act;
  $w15.target=targ;
  $w15.parm=p;
  $w15.msg=s;
  $w15.loc=room;
  putevent();
}
function* log_action(theaction,thetarget){
  if(debug){
    $writeln($ws("%log_action(",0)+$wi(theaction,1)+$ws(",",0)+$wi(thetarget,1)+$ws(")",0));
  }
  (yield* getroom());
  here.people[myslot].act=theaction;
  here.people[myslot].targ=thetarget;
  putroom();
  logged_act=true;
  (yield* log_event(myslot,e_action,thetarget,theaction,myname));
}
function desc_action(theaction,thetarget){
  var $ret="";
  var s="";
  switch(theaction){
    case look:{
      /* use command mnemonics */
      s=" looking around the room.";
      break;
    }
    case form:{
      s=" creating a new room.";
      break;
    }
    case desc:{
      s=" editing the description to this room.";
      break;
    }
    case e_detail:{
      s=" adding details to the room.";
      break;
    }
    case c_custom:{
      s=" customizing an exit here.";
      break;
    }
    case e_custroom:{
      s=" customizing this room.";
      break;
    }
    case e_program:{
      s=" customizing an object.";
      break;
    }
    case c_self:{
      s=" editing a self-description.";
      break;
    }
    case e_usecrystal:{
      s=" hunched over a crystal orb, immersed in its glow.";
      break;
    }
    case link:{
      s=" creating an exit here.";
      break;
    }
    case c_system:{
      s=" in system maintenance mode.";
      break;
    }
    default:{
      s=" here.";
    }
  }
  $ret=s;
  return $ret;
}
function protected_(n=0){
  var $ret=false;
  if((n===0)){
    n=myslot;
  }
  if($in(here.people[n].act,$set([e_detail,c_custom,e_custroom,e_program,c_self,c_system]))){
    $ret=true;
  }else{
    $ret=false;
  }
  return $ret;
}
/* user procedure to designate an exit for acceptance of links */
function* do_accept(s){
  var dir=0;
  if(lookup_dir({get v(){return dir},set v($x){dir=$x}},s)){
    if((yield* can_make(dir))){
      (yield* getroom());
      here.exits[dir].kind=5;
      putroom();
      (yield* log_event(myslot,e_accept,0,0));
      $writeln($ws("Someone will be able to make an exit ",0)+$ws(direct[dir],0)+$ws(".",0));
    }
  }else{
    $writeln($ws("To allow others to make an exit, type ACCEPT <direction of exit>.",0));
  }
}
/* User procedure to refuse an exit for links
   Note: may be unlink */
function* do_refuse(s){
  var dir=0;
  var ok=false;
  if(!((yield* is_owner()))){
  /* is_owner prints error message itself */
  }else if(lookup_dir({get v(){return dir},set v($x){dir=$x}},s)){
    (yield* getroom());
    var $w17=here.exits[dir];
    if(((($w17.toloc===0))&&(($w17.kind===5)))){
      $w17.kind=0;
      ok=true;
    }else{
      ok=false;
    }
    putroom();
    if(ok){
      (yield* log_event(myslot,e_refuse,0,0));
      $writeln($ws("Exits ",0)+$ws(direct[dir],0)+$ws(" will be refused.",0));
    }else{
      $writeln($ws("Exits were not being accepted there.",0));
    }
  }else{
    $writeln($ws("To undo an Accept, type REFUSE <direction>.",0));
  }
}
function systime(){
  var $ret="";
  var hourstring="";
  var hours=0;
  var thetime="";
  var dayornite="";
  thetime=$time();
  if(($ch(thetime,1)===" ")){
    hours=($ord($ch(thetime,2))-$ord("0"));
  }else{
    hours=(((($ord($ch(thetime,1))-$ord("0")))*10)+(($ord($ch(thetime,2))-$ord("0"))));
  }
  if((hours<12)){
    dayornite="am";
  }else{
    dayornite="pm";
  }
  if((hours>=13)){
    hours=(hours-12);
  }
  if((hours===0)){
    hours=12;
  }
  hourstring=$wi(hours,2);
  $ret=((((hourstring+":")+$ch(thetime,4))+$ch(thetime,5))+dayornite);
  return $ret;
}
/* substitute a parameter string for the # sign in the source string */
function subs_parm(s,parm){
  var $ret="";
  var right="";
  var left="";
  var i=0;
  /* i is point to break at */
  i=$index(s,"#");
  if((((i>0))&&((((s.length+parm.length))<=80)))){
    if((i>=s.length)){
      right="";
      left=s;
    }else if((i<1)){
      right=s;
      left="";
    }else{
      right=$substr(s,(i+1),(s.length-i));
      left=$substr(s,1,i);
    }
    if((left.length<=1)){
      left="";
    }else{
      left=$substr(left,1,(left.length-1));
    }
    $ret=((left+parm)+right);
  }else{
    $ret=s;
  }
  return $ret;
}
function* time_health(){
  if((healthcycle>0)){
    /* how quickly they heal */
    if((myhealth<7)){
      /* heal a little bit */
      myhealth=(myhealth+1);
      (yield* getroom());
      here.people[myslot].health=myhealth;
      putroom();
      /* show new health rating */
      switch(myhealth){
        case 9:{
          $writeln($ws("You are now in exceptional health.",0));
          break;
        }
        case 8:{
          $writeln($ws("You feel much stronger.  You are in better than average condition.",0));
          break;
        }
        case 7:{
          $writeln($ws("You are now in perfect health.",0));
          break;
        }
        case 6:{
          $writeln($ws("You only feel a little bit dazed now.",0));
          break;
        }
        case 5:{
          $writeln($ws("You only have some minor cuts and abrasions now.  Most of your serious wounds",0));
          $writeln($ws("have healed.",0));
          break;
        }
        case 4:{
          $writeln($ws("You are only suffering from some minor wounds now.",0));
          break;
        }
        case 3:{
          $writeln($ws("Your most serious wounds have healed, but you are still in bad shape.",0));
          break;
        }
        case 2:{
          $writeln($ws("You have healed somewhat, but are still very badly wounded.",0));
          break;
        }
        case 1:{
          $writeln($ws("You are in critical condition, but there may be hope.",0));
          break;
        }
        case 0:{
          $writeln($ws("are still dead.",0));
          break;
        }
        default:{
          $writeln($ws("You don't seem to be in any condition at all.",0));
        }
      }
      putchars((($chr(10)+old_prompt)+line));
    }
    healthcycle=0;
  }else{
    healthcycle=(healthcycle+1);
  }
}
function* time_noises(){
  var n=0;
  if((rnd100()<=2)){
    n=rnd100();
    if($in(n,$set([...$rng(0,40)]))){
      (yield* log_event(0,e_noises,rnd100(),0));
    }else if($in(n,$set([...$rng(41,60)]))){
      (yield* log_event(0,e_altnoise,rnd100(),0));
    }
  }
}
function* time_trapdoor(silent){
  var fall=false;
  if((rnd100()<here.trapchance)){
    /* trapdoor fires! */
    if((here.trapto>0)){
      /* logged action should cover {protected) */
      if((logged_act)){
        /* (protected) or */
        fall=false;
      }else if((here.magicobj===0)){
        fall=true;
      }else if(obj_hold(here.magicobj)){
        fall=false;
      }else{
        fall=true;
      }
    }else{
      fall=false;
    }
    if(fall){
      (yield* do_exit(here.trapto));
      if(!(silent)){
        putchars((($chr(10)+old_prompt)+line));
      }
    }
  }
}
function* time_midnight(){
  if((systime()==="12:00am")){
    (yield* log_event(0,e_midnight,rnd100(),0));
  }
}
/* cause random events to occurr (ha ha ha) */
function* rnd_event(silent=false){
  var n=0;
  if((rndcycle===200)){
    /* inside here 3 times/min */
    (yield* time_noises());
    (yield* time_health());
    (yield* time_trapdoor(silent));
    (yield* time_midnight());
    rndcycle=0;
  }else{
    rndcycle=(rndcycle+1);
  }
}
function* do_die(){
  var some=false;
  $writeln("");
  $writeln($ws("        *** You have died ***",0));
  $writeln("");
  some=(yield* drop_everything());
  myhealth=7;
  (yield* take_token(myslot,location));
  (yield* log_event(0,e_died,0,0,myname));
  if((yield* put_token(2,{get v(){return myslot},set v($x){myslot=$x}}))){
    location=2;
    inmem=false;
    (yield* setevent());
  }else{
    /* log entry to death loc */
    /* perhaps turn off refs to other people */
    $writeln($ws("The Monster universe regrets to inform you that you cannot be ressurected at",0));
    $writeln($ws("the moment.",0));
    $halt();
  }
}
function* poor_health(p){
  var some=false;
  if((myhealth>p)){
    myhealth=(myhealth-1);
    (yield* getroom());
    here.people[myslot].health=myhealth;
    putroom();
    (yield* log_event(myslot,e_weaker,myhealth,0));
    /* show new health rating */
    $write($ws("You ",0));
    switch(here.people[myslot].health){
      case 9:{
        $writeln($ws("are still in exceptional health.",0));
        break;
      }
      case 8:{
        $writeln($ws("feel weaker, but are in better than average condition.",0));
        break;
      }
      case 7:{
        $writeln($ws("are somewhat weaker, but are in perfect health.",0));
        break;
      }
      case 6:{
        $writeln($ws("feel a little bit dazed.",0));
        break;
      }
      case 5:{
        $writeln($ws("have some minor cuts and abrasions.",0));
        break;
      }
      case 4:{
        $writeln($ws("have some wounds, but are still fairly strong.",0));
        break;
      }
      case 3:{
        $writeln($ws("are suffering from some serious wounds.",0));
        break;
      }
      case 2:{
        $writeln($ws("are very badly wounded.",0));
        break;
      }
      case 1:{
        $writeln($ws("have many serious wounds, and are near death.",0));
        break;
      }
      case 0:{
        $writeln($ws("are dead.",0));
        break;
      }
      default:{
        $writeln($ws("don't seem to be in any condition at all.",0));
      }
    }
  }else{
    /* they died */
    (yield* do_die());
  }
}
/* count objects here */
function find_numobjs(){
  var $ret=0;
  var sum=0;
  var i=0;
  sum=0;
  for(var $e20=maxobjs,$ie20=1;$ie20<=$e20;$ie20++){
    i=$ie20;
    if((here.objs[i]!==0)){
      sum=(sum+1);
    }
  }
  $ret=sum;
  return $ret;
}
/* optional parameter is slot of player's objects to count */
function find_numhold(player=0){
  var $ret=0;
  var sum=0;
  var i=0;
  if((player===0)){
    player=myslot;
  }
  sum=0;
  for(var $e21=maxhold,$ie21=1;$ie21<=$e21;$ie21++){
    i=$ie21;
    if((here.people[player].holding[i]!==0)){
      sum=(sum+1);
    }
  }
  $ret=sum;
  return $ret;
}
function* take_hit(p){
  var i=0;
  if((p>0)){
    if((rnd100()<((55+(((p-1))*30))))){
      /* chance that they're hit */
      (yield* poor_health(p));
    }
    if((find_numobjs()<(maxobjs+1))){
      /* maybe they drop something if they're hit */
      for(var $e22=p,$ie22=1;$ie22<=$e22;$ie22++){
        i=$ie22;
        (yield* maybe_drop());
      }
    }
  }
}
function punch_force(sock){
  var $ret=0;
  var p=0;
  if($in(sock,$set([2,3,6,7,8,11,12]))){
    /* no punch or a graze */
    p=0;
  }else if($in(sock,$set([4,9,10]))){
    /* hard punches */
    p=2;
  }else{
    /* 1,5,13,14,15 */
    p=1;
  }
  /* all others are medium punches */
  $ret=p;
  return $ret;
}
function put_punch(sock,s){
  switch(sock){
    case 1:{
      $writeln($ws("You deliver a quick jab to ",0)+$ws(s,0)+$ws("'s jaw.",0));
      break;
    }
    case 2:{
      $writeln($ws("You swing at ",0)+$ws(s,0)+$ws(" and miss.",0));
      break;
    }
    case 3:{
      $writeln($ws("A quick punch, but it only grazes ",0)+$ws(s,0)+$ws(".",0));
      break;
    }
    case 4:{
      $writeln($ws(s,0)+$ws(" doubles over after your jab to the stomach.",0));
      break;
    }
    case 5:{
      $writeln($ws("Your punch lands square on ",0)+$ws(s,0)+$ws("'s face!",0));
      break;
    }
    case 6:{
      $writeln($ws("You swing wild and miss.",0));
      break;
    }
    case 7:{
      $writeln($ws("A good swing, but it misses ",0)+$ws(s,0)+$ws(" by a mile!",0));
      break;
    }
    case 8:{
      $writeln($ws("Your punch is blocked by ",0)+$ws(s,0)+$ws(".",0));
      break;
    }
    case 9:{
      $writeln($ws("Your roundhouse blow sends ",0)+$ws(s,0)+$ws(" reeling.",0));
      break;
    }
    case 10:{
      $writeln($ws("You land a solid uppercut on ",0)+$ws(s,0)+$ws("'s chin.",0));
      break;
    }
    case 11:{
      $writeln($ws(s,0)+$ws(" fends off your blow.",0));
      break;
    }
    case 12:{
      $writeln($ws(s,0)+$ws(" ducks and avoids your punch.",0));
      break;
    }
    case 13:{
      $writeln($ws("You thump ",0)+$ws(s,0)+$ws(" in the ribs.",0));
      break;
    }
    case 14:{
      $writeln($ws("You catch ",0)+$ws(s,0)+$ws("'s face on your elbow.",0));
      break;
    }
    case 15:{
      $writeln($ws("You knock the wind out of ",0)+$ws(s,0)+$ws(" with a punch to the chest.",0));
      break;
    }
  }
}
function get_punch(sock,s){
  switch(sock){
    case 1:{
      $writeln($ws(s,0)+$ws(" delivers a quick jab to your jaw!",0));
      break;
    }
    case 2:{
      $writeln($ws(s,0)+$ws(" swings at you but misses.",0));
      break;
    }
    case 3:{
      $writeln($ws(s,0)+$ws("'s fist grazes you.",0));
      break;
    }
    case 4:{
      $writeln($ws("You double over after ",0)+$ws(s,0)+$ws(" lands a mean jab to your stomach!",0));
      break;
    }
    case 5:{
      $writeln($ws("You see stars as ",0)+$ws(s,0)+$ws(" bashes you in the face.",0));
      break;
    }
    case 6:{
      $writeln($ws("You only feel the breeze as ",0)+$ws(s,0)+$ws(" swings wildly.",0));
      break;
    }
    case 7:{
      $writeln($ws(s,0)+$ws("'s swing misses you by a yard.",0));
      break;
    }
    case 8:{
      $writeln($ws("With lightning reflexes you block ",0)+$ws(s,0)+$ws("'s punch.",0));
      break;
    }
    case 9:{
      $writeln($ws(s,0)+$ws("'s blow sends you reeling.",0));
      break;
    }
    case 10:{
      $writeln($ws("Your head snaps back from ",0)+$ws(s,0)+$ws("'s uppercut!",0));
      break;
    }
    case 11:{
      $writeln($ws("You parry ",0)+$ws(s,0)+$ws("'s attack.",0));
      break;
    }
    case 12:{
      $writeln($ws("You duck in time to avoid ",0)+$ws(s,0)+$ws("'s punch.",0));
      break;
    }
    case 13:{
      $writeln($ws(s,0)+$ws(" thumps you hard in the ribs.",0));
      break;
    }
    case 14:{
      $writeln($ws("Your vision blurs as ",0)+$ws(s,0)+$ws(" elbows you in the head.",0));
      break;
    }
    case 15:{
      $writeln($ws(s,0)+$ws(" knocks the wind out of you with a punch to your chest.",0));
      break;
    }
  }
}
function view_punch(a,b,p){
  switch(p){
    case 1:{
      $writeln($ws(a,0)+$ws(" jabs ",0)+$ws(b,0)+$ws(" in the jaw.",0));
      break;
    }
    case 2:{
      $writeln($ws(a,0)+$ws(" throws a wild punch at the air.",0));
      break;
    }
    case 3:{
      $writeln($ws(a,0)+$ws("'s fist barely grazes ",0)+$ws(b,0)+$ws(".",0));
      break;
    }
    case 4:{
      $writeln($ws(b,0)+$ws(" doubles over in pain with ",0)+$ws(a,0)+$ws("'s punch",0));
      break;
    }
    case 5:{
      $writeln($ws(a,0)+$ws(" bashes ",0)+$ws(b,0)+$ws(" in the face.",0));
      break;
    }
    case 6:{
      $writeln($ws(a,0)+$ws(" takes a wild swing at ",0)+$ws(b,0)+$ws(" and misses.",0));
      break;
    }
    case 7:{
      $writeln($ws(a,0)+$ws(" swings at ",0)+$ws(b,0)+$ws(" and misses by a yard.",0));
      break;
    }
    case 8:{
      $writeln($ws(b,0)+$ws("'s punch is blocked by ",0)+$ws(a,0)+$ws("'s quick reflexes.",0));
      break;
    }
    case 9:{
      $writeln($ws(b,0)+$ws(" is sent reeling from a punch by ",0)+$ws(a,0)+$ws(".",0));
      break;
    }
    case 10:{
      $writeln($ws(a,0)+$ws(" lands an uppercut on ",0)+$ws(b,0)+$ws("'s head.",0));
      break;
    }
    case 11:{
      $writeln($ws(b,0)+$ws(" parrys ",0)+$ws(a,0)+$ws("'s attack.",0));
      break;
    }
    case 12:{
      $writeln($ws(b,0)+$ws(" ducks to avoid ",0)+$ws(a,0)+$ws("'s punch.",0));
      break;
    }
    case 13:{
      $writeln($ws(a,0)+$ws(" thumps ",0)+$ws(b,0)+$ws(" hard in the ribs.",0));
      break;
    }
    case 14:{
      $writeln($ws(a,0)+$ws("'s elbow connects with ",0)+$ws(b,0)+$ws("'s head.",0));
      break;
    }
    case 15:{
      $writeln($ws(a,0)+$ws(" knocks the wind out of ",0)+$ws(b,0)+$ws(".",0));
      break;
    }
  }
}
function desc_health(n,header=""){
  if((header==="")){
    $write($ws(here.people[n].name_,0)+$ws(" ",0));
  }else{
    $write($ws(header,0));
  }
  switch(here.people[n].health){
    case 9:{
      $writeln($ws("is in exceptional health, and looks very strong.",0));
      break;
    }
    case 8:{
      $writeln($ws("is in better than average condition.",0));
      break;
    }
    case 7:{
      $writeln($ws("is in perfect health.",0));
      break;
    }
    case 6:{
      $writeln($ws("looks a little dazed.",0));
      break;
    }
    case 5:{
      $writeln($ws("has some minor cuts and abrasions.",0));
      break;
    }
    case 4:{
      $writeln($ws("has some minor wounds.",0));
      break;
    }
    case 3:{
      $writeln($ws("is suffering from some serious wounds.",0));
      break;
    }
    case 2:{
      $writeln($ws("is very badly wounded.",0));
      break;
    }
    case 1:{
      $writeln($ws("has many serious wounds, and is near death.",0));
      break;
    }
    case 0:{
      $writeln($ws("is dead.",0));
      break;
    }
    default:{
      $writeln($ws("doesn't seem to be in any condition at all.",0));
    }
  }
}
function* obj_part(objnum,doread=true){
  var $ret="";
  var s="";
  if(doread){
    (yield* getobj(objnum));
    freeobj();
  }
  s=obj.oname;
  switch(obj.particle){
    case 0:{
      break;
    }
    case 1:{
      s=("a "+s);
      break;
    }
    case 2:{
      s=("an "+s);
      break;
    }
    case 3:{
      s=("some "+s);
      break;
    }
    case 4:{
      s=("the "+s);
      break;
    }
  }
  $ret=s;
  return $ret;
}
function* print_subs(n,s){
  if((((n>0))&&((n!==default_line)))){
    (yield* getline(n));
    freeline();
    $writeln($ws(subs_parm(oneliner.theline,s),0));
  }else if((n===default_line)){
    $writeln($ws("%<default line> in print_subs",0));
  }
}
/* print out a (up to) 10 line description block, substituting string s for
     up to one occurance of # per line */
function* block_subs(n,s){
  var p=0;
  var i=0;
  if((n<0)){
    (yield* print_subs(Math.abs(n),s));
  }else if((((n>0))&&((n!==default_line)))){
    (yield* getblock(n));
    freeblock();
    i=1;
    while((i<=block.desclen)){
      p=$index(block.lines[i],"#");
      if(((p>0))){
        $writeln($ws(subs_parm(block.lines[i],s),0));
      }else{
        $writeln($ws(block.lines[i],0));
      }
      i=(i+1);
    }
  }
}
function show_noises(n){
  if((n<33)){
    $writeln($ws("There are strange noises coming from behind you.",0));
  }else if((n<66)){
    $writeln($ws("You hear strange rustling noises behind you.",0));
  }else{
    $writeln($ws("There are faint noises coming from behind you.",0));
  }
}
function show_altnoise(n){
  if((n<33)){
    $writeln($ws("A chill wind blows, ruffling your clothes and chilling your bones.",0));
  }else if((n<66)){
    $writeln($ws("Muffled scuffling sounds can be heard behind you.",0));
  }else{
    $writeln($ws("A loud crash can be heard in the distance.",0));
  }
}
function show_midnight(n,printed){
  if(midnight_notyet){
    if((n<50)){
      $writeln($ws("A voice booms out of the air from all around you!",0));
      $writeln($ws("The voice says,  \" It is now midnight. \"",0));
    }else{
      $writeln($ws("You hear a clock chiming in the distance.",0));
      $writeln($ws("It rings twelve times for midnight.",0));
    }
    midnight_notyet=false;
  }else{
    printed.v=false;
  }
}
function* handle_event(printed){
  var n=0;
  var send=0;
  var act=0;
  var targ=0;
  var p=0;
  var s="";
  var sendname="";
  printed.v=true;
  if(debug){
    $writeln($ws("%handling event ",0)+$wi(myevent,-1));
  }
  var $w28=event.evnt[myevent];
  send=$w28.sender;
  act=$w28.action;
  targ=$w28.target;
  p=$w28.parm;
  s=$w28.msg;
  if((send!==0)){
    sendname=here.people[send].name_;
  }else{
    sendname="<Unknown>";
  }
  switch(act){
    case e_exit:{
      if((here.exits[targ].goin===default_line)){
        $writeln($ws(s,0)+$ws(" has gone ",0)+$ws(direct[targ],0)+$ws(".",0));
      }else if((((here.exits[targ].goin!==0))&&((here.exits[targ].goin!==default_line)))){
        (yield* block_subs(here.exits[targ].goin,s));
      }else{
        printed.v=false;
      }
      break;
    }
    case e_enter:{
      if((here.exits[targ].comeout===default_line)){
        $writeln($ws(s,0)+$ws(" has come into the room from: ",0)+$ws(direct[targ],0));
      }else if((((here.exits[targ].comeout!==0))&&((here.exits[targ].comeout!==default_line)))){
        (yield* block_subs(here.exits[targ].comeout,s));
      }else{
        printed.v=false;
      }
      break;
    }
    case e_begin:{
      $writeln($ws(s,0)+$ws(" appears in a brilliant burst of multicolored light.",0));
      break;
    }
    case e_quit:{
      $writeln($ws(s,0)+$ws(" vanishes in a brilliant burst of multicolored light.",0));
      break;
    }
    case e_say:{
      if(((s.length+sendname.length)>73)){
        $writeln($ws(sendname,0)+$ws(" says,",0));
        $writeln($ws("\"",0)+$ws(s,0)+$ws("\"",0));
      }else{
        if((((rnd100()<50))||((s.length>50)))){
          $writeln($ws(sendname,0)+$ws(": \"",0)+$ws(s,0)+$ws("\"",0));
        }else{
          $writeln($ws(sendname,0)+$ws(" says, \"",0)+$ws(s,0)+$ws("\"",0));
        }
      }
      break;
    }
    case e_hidesay:{
      $writeln($ws("An unidentified voice speaks to you:",0));
      $writeln($ws("\"",0)+$ws(s,0)+$ws("\"",0));
      break;
    }
    case e_setnam:{
      $writeln($ws(s,0));
      break;
    }
    case e_poofin:{
      $writeln($ws("In an explosion of orange smoke ",0)+$ws(s,0)+$ws(" poofs into the room.",0));
      break;
    }
    case e_poofout:{
      $writeln($ws(s,0)+$ws(" vanishes from the room in a cloud of orange smoke.",0));
      break;
    }
    case e_detach:{
      $writeln($ws(s,0)+$ws(" has destroyed the exit ",0)+$ws(direct[targ],0)+$ws(".",0));
      break;
    }
    case e_editdone:{
      $writeln($ws(sendname,0)+$ws(" is done editing the room description.",0));
      break;
    }
    case e_newexit:{
      $writeln($ws(s,0)+$ws(" has created an exit here.",0));
      break;
    }
    case e_custdone:{
      $writeln($ws(sendname,0)+$ws(" is done customizing an exit here.",0));
      break;
    }
    case e_search:{
      $writeln($ws(sendname,0)+$ws(" seems to be looking for something.",0));
      break;
    }
    case e_found:{
      $writeln($ws(sendname,0)+$ws(" appears to have found something.",0));
      break;
    }
    case e_donedet:{
      $writeln($ws(sendname,0)+$ws(" is done adding details to the room.",0));
      break;
    }
    case e_roomdone:{
      $writeln($ws(sendname,0)+$ws(" is finished customizing this room.",0));
      break;
    }
    case e_objdone:{
      $writeln($ws(sendname,0)+$ws(" is finished customizing an object.",0));
      break;
    }
    case e_unhide:{
      $writeln($ws(sendname,0)+$ws(" has stepped out of the shadows.",0));
      break;
    }
    case e_foundyou:{
      if((targ===myslot)){
        /* found me! */
        $writeln($ws("You've been discovered by ",0)+$ws(sendname,0)+$ws("!",0));
        hiding=false;
        (yield* getroom());
        here.people[myslot].hiding=0;
        /* they're not hidden anymore */
        putroom();
      }else{
        $writeln($ws(sendname,0)+$ws(" has found ",0)+$ws(here.people[targ].name_,0)+$ws(" hiding in the shadows!",0));
      }
      break;
    }
    case e_punch:{
      if((targ===myslot)){
        /* punched me! */
        get_punch(p,sendname);
        (yield* take_hit(punch_force(p)));
        ping_answered=true;
        /* relic, but not harmful */
        healthcycle=0;
      }else{
        view_punch(sendname,here.people[targ].name_,p);
      }
      break;
    }
    case e_madeobj:{
      $writeln($ws(s,0));
      break;
    }
    case e_get:{
      $writeln($ws(s,0));
      break;
    }
    case e_drop:{
      $writeln($ws(s,0));
      if((here.objdesc!==0)){
        (yield* print_subs(here.objdesc,(yield* obj_part(p))));
      }
      break;
    }
    case e_bouncedin:{
      if((((targ===0))||((targ===default_line)))){
        $writeln($ws((yield* obj_part(p)),0)+$ws(" has bounced into the room.",0));
      }else{
        (yield* print_subs(targ,(yield* obj_part(p))));
      }
      break;
    }
    case e_dropall:{
      $writeln($ws("Some objects drop to the ground.",0));
      break;
    }
    case e_examine:{
      $writeln($ws(s,0));
      break;
    }
    case e_ihid:{
      $writeln($ws(sendname,0)+$ws(" has hidden in the shadows.",0));
      break;
    }
    case e_noises:{
      if((((here.rndmsg===0))||((here.rndmsg===default_line)))){
        show_noises(targ);
      }else{
        (yield* print_line(here.rndmsg));
      }
      break;
    }
    case e_altnoise:{
      if((((here.xmsg2===0))||((here.xmsg2===default_line)))){
        show_altnoise(targ);
      }else{
        (yield* block_subs(here.xmsg2,myname));
      }
      break;
    }
    case e_realnoise:{
      show_noises(targ);
      break;
    }
    case e_hidobj:{
      $writeln($ws(sendname,0)+$ws(" has hidden the ",0)+$ws(s,0)+$ws(".",0));
      break;
    }
    case e_ping:{
      if((targ===myslot)){
        $writeln($ws(sendname,0)+$ws(" is trying to ping you.",0));
        (yield* log_event(myslot,e_pong,send,0));
      }else{
        $writeln($ws(sendname,0)+$ws(" is pinging ",0)+$ws(here.people[targ].name_,0)+$ws(".",0));
      }
      break;
    }
    case e_pong:{
      ping_answered=true;
      break;
    }
    case e_hidepunch:{
      if((targ===myslot)){
        $writeln($ws(sendname,0)+$ws(" pounces on you from the shadows!",0));
        (yield* take_hit(2));
      }else{
        $writeln($ws(sendname,0)+$ws(" jumps out of the shadows and attacks ",0)+$ws(here.people[targ].name_,0)+$ws(".",0));
      }
      break;
    }
    case e_slipped:{
      $writeln($ws("The ",0)+$ws(s,0)+$ws(" has slipped from ",0)+$ws(sendname,0)+$ws("'s hands.",0));
      break;
    }
    case e_hpoofout:{
      if((rnd100()>50)){
        $writeln($ws("Great wisps of orange smoke drift out of the shadows.",0));
      }else{
        printed.v=false;
      }
      break;
    }
    case e_hpoofin:{
      if((rnd100()>50)){
        $writeln($ws("Some wisps of orange smoke drift about in the shadows.",0));
      }else{
        printed.v=false;
      }
      break;
    }
    case e_failgo:{
      if((targ>0)){
        $write($ws(sendname,0)+$ws(" has failed to go ",0));
        $writeln($ws(direct[targ],0)+$ws(".",0));
      }
      break;
    }
    case e_trypunch:{
      if((targ===myslot)){
        $writeln($ws(sendname,0)+$ws(" fails to punch you.",0));
      }else{
        $writeln($ws(sendname,0)+$ws(" fails to punch ",0)+$ws(here.people[targ].name_,0)+$ws(".",0));
      }
      break;
    }
    case e_pingone:{
      if((targ===myslot)){
        /* ohoh---pinged away */
        $writeln($ws("The Monster program regrets to inform you that a destructive ping has",0));
        $writeln($ws("destroyed your existence.  Please accept our apologies.",0));
        $halt();
      }else{
        /* ugggg */
        $writeln($ws(s,0)+$ws(" shimmers and vanishes from sight.",0));
      }
      break;
    }
    case e_claim:{
      $writeln($ws(sendname,0)+$ws(" has claimed this room.",0));
      break;
    }
    case e_disown:{
      $writeln($ws(sendname,0)+$ws(" has disowned this room.",0));
      break;
    }
    case e_weaker:{
      /* inmem := false;
         				gethere; */
      here.people[send].health=targ;
      /* This is a hack for efficiency so we don't read the room record twice;
           we need the current data now for desc_health, but checkevents, our caller,
           is about to re-read it anyway; we make an incremental fix here so desc_health
           is happy, then checkevents will do the real read later */
      desc_health(send);
      break;
    }
    case e_objclaim:{
      $writeln($ws(sendname,0)+$ws(" is now the owner of the ",0)+$ws(s,0)+$ws(".",0));
      break;
    }
    case e_objdisown:{
      $writeln($ws(sendname,0)+$ws(" has disowned the object ",0)+$ws(s,0)+$ws(".",0));
      break;
    }
    case e_selfdone:{
      $writeln($ws(sendname,0)+$ws("'s self-description is finished.",0));
      break;
    }
    case e_whisper:{
      if((targ===myslot)){
        if((s.length<39)){
          $writeln($ws(sendname,0)+$ws(" whispers to you, \"",0)+$ws(s,0)+$ws("\"",0));
        }else{
          $writeln($ws(sendname,0)+$ws(" whispers something to you:",0));
          $write($ws(sendname,0)+$ws(" whispers, ",0));
          if((s.length>50)){
            $writeln("");
          }
          $writeln($ws("\"",0)+$ws(s,0)+$ws("\"",0));
        }
      }else if(((privd)||((rnd100()>85)))){
        $writeln($ws("You overhear ",0)+$ws(sendname,0)+$ws(" whispering to ",0)+$ws(here.people[targ].name_,0)+$ws("!",0));
        $write($ws(sendname,0)+$ws(" whispers, ",0));
        if((s.length>50)){
          $writeln("");
        }
        $writeln($ws("\"",0)+$ws(s,0)+$ws("\"",0));
      }else{
        $writeln($ws(sendname,0)+$ws(" is whispering to ",0)+$ws(here.people[targ].name_,0)+$ws(".",0));
      }
      break;
    }
    case e_wield:{
      $writeln($ws(sendname,0)+$ws(" is now wielding the ",0)+$ws(s,0)+$ws(".",0));
      break;
    }
    case e_unwield:{
      $writeln($ws(sendname,0)+$ws(" is no longer wielding the ",0)+$ws(s,0)+$ws(".",0));
      break;
    }
    case e_wear:{
      $writeln($ws(sendname,0)+$ws(" is now wearing the ",0)+$ws(s,0)+$ws(".",0));
      break;
    }
    case e_unwear:{
      $writeln($ws(sendname,0)+$ws(" has taken off the ",0)+$ws(s,0)+$ws(".",0));
      break;
    }
    case e_donecrystaluse:{
      $writeln($ws(sendname,0)+$ws(" emerges from the glow of the crystal.",0));
      $writeln($ws("The orb becomes dark.",0));
      break;
    }
    case e_destroy:{
      $writeln($ws(s,0));
      break;
    }
    case e_objpublic:{
      $writeln($ws("The object ",0)+$ws(s,0)+$ws(" is now public.",0));
      break;
    }
    case e_sysdone:{
      $writeln($ws(sendname,0)+$ws(" is no longer in system maintenance mode.",0));
      break;
    }
    case e_unmake:{
      $writeln($ws(sendname,0)+$ws(" has unmade ",0)+$ws(s,0)+$ws(".",0));
      break;
    }
    case e_lookdetail:{
      $writeln($ws(sendname,0)+$ws(" is looking at the ",0)+$ws(s,0)+$ws(".",0));
      break;
    }
    case e_accept:{
      $writeln($ws(sendname,0)+$ws(" has accepted an exit here.",0));
      break;
    }
    case e_refuse:{
      $writeln($ws(sendname,0)+$ws(" has refused an Accept here.",0));
      break;
    }
    case e_died:{
      $writeln($ws(s,0)+$ws(" expires and vanishes in a cloud of greasy black smoke.",0));
      break;
    }
    case e_lookyou:{
      if((targ===myslot)){
        $writeln($ws(sendname,0)+$ws(" is looking at you.",0));
      }else{
        $writeln($ws(sendname,0)+$ws(" looks at ",0)+$ws(here.people[targ].name_,0)+$ws(".",0));
      }
      break;
    }
    case e_lookself:{
      $writeln($ws(sendname,0)+$ws(" is making a self-appraisal.",0));
      break;
    }
    case e_failget:{
      $writeln($ws(sendname,0)+$ws(" fails to get ",0)+$ws((yield* obj_part(targ)),0)+$ws(".",0));
      break;
    }
    case e_failuse:{
      $writeln($ws(sendname,0)+$ws(" fails to use ",0)+$ws((yield* obj_part(targ)),0)+$ws(".",0));
      break;
    }
    case e_chill:{
      if((((targ===0))||((targ===default_line)))){
        $writeln($ws("A chill wind blows over you.",0));
      }else{
        (yield* print_desc(targ));
      }
      break;
    }
    case e_noise2:{
      switch(targ){
        case 1:{
          $writeln($ws("Strange, gutteral noises sound from everywhere.",0));
          break;
        }
        case 2:{
          $writeln($ws("A chill wind blows past you, almost whispering as it ruffles your clothes.",0));
          break;
        }
        case 3:{
          $writeln($ws("Muffled voices speak to you from the air!",0));
          break;
        }
        default:{
          $writeln($ws("The air vibrates with a chill shudder.",0));
        }
      }
      break;
    }
    case e_invent:{
      $writeln($ws(sendname,0)+$ws(" is taking inventory.",0));
      break;
    }
    case e_poofyou:{
      if((targ===myslot)){
        $writeln("");
        $writeln($ws(sendname,0)+$ws(" directs a firey burst of bluish energy at you!",0));
        $writeln($ws("Suddenly, you find yourself hurtling downwards through misty orange clouds.",0));
        $writeln($ws("Your descent slows, the smoke clears, and you find yourself in a new place...",0));
        (yield* xpoof(p));
        $writeln("");
      }else{
        $writeln($ws(sendname,0)+$ws(" directs a firey burst of energy at ",0)+$ws(here.people[targ].name_,0)+$ws("!",0));
        $writeln($ws("A thick burst of orange smoke results, and when it clears, you see",0));
        $writeln($ws("that ",0)+$ws(here.people[targ].name_,0)+$ws(" is gone.",0));
      }
      break;
    }
    case e_who:{
      switch(p){
        case 0:{
          $writeln($ws(sendname,0)+$ws(" produces a \"who\" list and reads it.",0));
          break;
        }
        case 1:{
          $writeln($ws(sendname,0)+$ws(" is seeing who's playing Monster.",0));
          break;
        }
        default:{
          $writeln($ws(sendname,0)+$ws(" checks the \"who\" list.",0));
        }
      }
      break;
    }
    case e_players:{
      $writeln($ws(sendname,0)+$ws(" checks the \"players\" list.",0));
      break;
    }
    case e_viewself:{
      $writeln($ws(sendname,0)+$ws(" is reading ",0)+$ws(s,0)+$ws("'s self-description.",0));
      break;
    }
    case e_midnight:{
      show_midnight(targ,printed);
      break;
    }
    case e_action:{
      $writeln($ws(sendname,0)+$ws(" is",0)+$ws(desc_action(p,targ),0));
      break;
    }
    default:{
      $writeln($ws("*** Bad Event ***",0));
    }
  }
}
function* checkevents(silent=false){
  var gotone=false;
  var tmp=false;
  var printed=false;
  (yield* getevent());
  freeevent();
  $assign(event,eventfile.buf);
  gotone=false;
  printed=false;
  while((myevent!==event.point)){
    myevent=(myevent+1);
    if((myevent>maxevent)){
      myevent=1;
    }
    if(debug){
      $writeln($ws("%checking event ",0)+$wi(myevent,-1));
      if((event.evnt[myevent].loc===location)){
        $writeln($ws("  - event here",0));
      }else{
        $writeln($ws("  - event elsewhere",0));
      }
      $writeln($ws("  - event number = ",0)+$wi(event.evnt[myevent].action,1));
    }
    if(((event.evnt[myevent].loc===location))){
      if(((event.evnt[myevent].sender!==myslot))){
        /* if sent by me don't look at it */
        /* will use global record event */
        (yield* handle_event({get v(){return tmp},set v($x){tmp=$x}}));
        if(tmp){
          printed=true;
        }
        inmem=false;
        /* re-read important data that */
        (yield* gethere());
        /* may have been altered */
        gotone=true;
      }
    }
  }
  if((((printed)&&(gotone))&&!(silent))){
    putchars(((($chr(10)+$chr(13))+old_prompt)+line));
  }
  (yield* rnd_event(silent));
}
/* count the number of people in this room; assumes a gethere has been done */
function find_numpeople(){
  var $ret=0;
  var sum=0;
  var i=0;
  sum=0;
  for(var $e32=maxpeople,$ie32=1;$ie32<=$e32;$ie32++){
    i=$ie32;
    if((here.people[i].kind>0)){
      /* if here.people[i].username <> '' then */
      sum=(sum+1);
    }
  }
  $ret=sum;
  return $ret;
}
/* don't give them away, but make noise--maybe
     percent is percentage chance that they WON'T make any noise */
function* noisehide(percent){
  /* assumed gethere; */
  if(((hiding)&&((find_numpeople()>1)))){
    if((rnd100()>percent)){
      (yield* log_event(myslot,e_realnoise,rnd100(),0));
    }
  }
}
/* myslot: don't tell them they made noise */
function* checkhide(){
  var $ret=false;
  if((hiding)){
    $ret=false;
    (yield* noisehide(50));
    $writeln($ws("You can't do that while you're hiding.",0));
  }else{
    $ret=true;
  }
  return $ret;
}
function* clear_command(){
  if(logged_act){
    (yield* getroom());
    here.people[myslot].act=0;
    putroom();
    logged_act=false;
  }
}
/* forward procedure take_token(aslot, roomno: integer); */
/* remove self from a room's people list */
function* take_token(aslot,roomno){
  (yield* getroom(roomno));
  var $w33=here.people[aslot];
  $w33.kind=0;
  $w33.username="";
  $w33.name_="";
  putroom();
}
/* fowrard function put_token(room: integer;var aslot:integer;
   	hidelev:integer := 0):boolean;
   			 put a person in a room's people list
   			 returns myslot */
function* put_token(room,aslot,hidelev=0){
  var $ret=false;
  var i=0;
  var j=0;
  var found=false;
  var savehold=$zeros(maxhold);
  if(first_puttoken){
    for(var $e34=maxhold,$ie34=1;$ie34<=$e34;$ie34++){
      i=$ie34;
      savehold[i]=0;
    }
    first_puttoken=false;
  }else{
    (yield* gethere());
    for(var $e35=maxhold,$ie35=1;$ie35<=$e35;$ie35++){
      i=$ie35;
      savehold[i]=here.people[myslot].holding[i];
    }
  }
  (yield* getroom(room));
  i=1;
  found=false;
  while((((i<=maxpeople))&&(!found))){
    if((here.people[i].name_==="")){
      found=true;
    }else{
      i=(i+1);
    }
  }
  $ret=found;
  if(found){
    here.people[i].kind=1;
    /* I'm a real player */
    here.people[i].name_=myname;
    here.people[i].username=userid;
    here.people[i].hiding=hidelev;
    /* hidelev is zero for most everyone
       			  unless you want to poof in and remain hidden */
    here.people[i].wearing=mywear;
    here.people[i].wielding=mywield;
    here.people[i].health=myhealth;
    here.people[i].self=myself;
    here.people[i].act=0;
    for(var $e36=maxhold,$ie36=1;$ie36<=$e36;$ie36++){
      j=$ie36;
      here.people[i].holding[j]=savehold[j];
    }
    putroom();
    aslot.v=i;
    for(var $e37=maxexit,$ie37=1;$ie37<=$e37;$ie37++){
      j=$ie37;
      /* haven't found any exits in */
      found_exit[j]=false;
    }
    /* the new room */
    /* note the user's new location in the logfile */
    (yield* getint(n_location));
    anint.int[mylog]=room;
    putint();
  }else{
    freeroom();
  }
  return $ret;
}
function* log_exit(direction,room,sender_slot){
  (yield* log_event(sender_slot,e_exit,direction,0,myname,room));
}
function* log_entry(direction,room,sender_slot){
  (yield* log_event(sender_slot,e_enter,direction,0,myname,room));
}
function* log_begin(room=1){
  (yield* log_event(0,e_begin,0,0,myname,room));
}
function* log_quit(room,dropped){
  (yield* log_event(0,e_quit,0,0,myname,room));
  if(dropped){
    (yield* log_event(0,e_dropall,0,0,myname,room));
  }
}
/* return the number of people you can see here */
function n_can_see(){
  var $ret=0;
  var sum=0;
  var i=0;
  var selfslot=0;
  if((here.locnum===location)){
    selfslot=myslot;
  }else{
    selfslot=0;
  }
  sum=0;
  for(var $e38=maxpeople,$ie38=1;$ie38<=$e38;$ie38++){
    i=$ie38;
    if(((((i!==selfslot))&&((here.people[i].name_.length>0)))&&((here.people[i].hiding===0)))){
      sum=(sum+1);
    }
  }
  $ret=sum;
  if(debug){
    $writeln($ws("%n_can_see = ",0)+$wi(sum,1));
  }
  return $ret;
}
function next_can_see(point){
  var $ret="";
  var found=false;
  var selfslot=0;
  if((here.locnum!==location)){
    selfslot=0;
  }else{
    selfslot=myslot;
  }
  found=false;
  while(((!found)&&((point.v<=maxpeople)))){
    if(((((point.v!==selfslot))&&((here.people[point.v].name_.length>0)))&&((here.people[point.v].hiding===0)))){
      found=true;
    }else{
      point.v=(point.v+1);
    }
  }
  if(found){
    $ret=here.people[point.v].name_;
    point.v=(point.v+1);
  }else{
    $ret=myname;
    /* error!  error! */
    $writeln($ws("%searching error in next_can_see; notify the Monster Manager",0));
  }
  return $ret;
}
function niceprint(len,s){
  if(((len.v+s.length)>78)){
    len.v=0;
    $writeln("");
  }else{
    len.v=(len.v+s.length);
  }
  $write($ws(s,0));
}
function people_header(where){
  var point=0;
  var tmp="";
  var i=0;
  var n=0;
  var len=0;
  point=1;
  n=n_can_see();
  switch(n){
    case 0:{
      break;
    }
    case 1:{
      $writeln($ws(next_can_see({get v(){return point},set v($x){point=$x}}),0)+$ws(" is ",0)+$ws(where,0));
      break;
    }
    case 2:{
      $writeln($ws(next_can_see({get v(){return point},set v($x){point=$x}}),0)+$ws(" and ",0)+$ws(next_can_see({get v(){return point},set v($x){point=$x}}),0)+$ws(" are ",0)+$ws(where,0));
      break;
    }
    default:{
      len=0;
      for(var $e39=(n-1),$ie39=1;$ie39<=$e39;$ie39++){
        i=$ie39;
        /* at least 1 to 2 */
        tmp=next_can_see({get v(){return point},set v($x){point=$x}});
        if((i!==(n-1))){
          tmp=(tmp+", ");
        }
        niceprint({get v(){return len},set v($x){len=$x}},tmp);
      }
      niceprint({get v(){return len},set v($x){len=$x}}," and ");
      niceprint({get v(){return len},set v($x){len=$x}},next_can_see({get v(){return point},set v($x){point=$x}}));
      niceprint({get v(){return len},set v($x){len=$x}},(" are "+where));
      $writeln("");
    }
  }
}
function* desc_person(i){
  var pname="";
  pname=here.people[i].name_;
  if((here.people[i].act!==0)){
    $write($ws(pname,0)+$ws(" is",0));
    $writeln($ws(desc_action(here.people[i].act,here.people[i].targ),0));
  }
  /* describes what person last did */
  if((here.people[i].health!==goodhealth)){
    desc_health(i);
  }
  if((here.people[i].wielding>0)){
    $writeln($ws(pname,0)+$ws(" is wielding ",0)+$ws((yield* obj_part(here.people[i].wielding)),0)+$ws(".",0));
  }
}
function* show_people(){
  var i=0;
  people_header("here.");
  for(var $e41=maxpeople,$ie41=1;$ie41<=$e41;$ie41++){
    i=$ie41;
    if(((((here.people[i].name_!==""))&&((i!==myslot)))&&((here.people[i].hiding===0)))){
      (yield* desc_person(i));
    }
  }
}
function* show_group(){
  var gloc1=0;
  var gloc2=0;
  var gnam1="";
  var gnam2="";
  gloc1=here.grploc1;
  gloc2=here.grploc2;
  gnam1=here.grpnam1;
  gnam2=here.grpnam2;
  if((gloc1!==0)){
    (yield* gethere(gloc1));
    people_header(gnam1);
  }
  if((gloc2!==0)){
    (yield* gethere(gloc2));
    people_header(gnam2);
  }
  (yield* gethere());
}
function* desc_obj(n){
  if((n!==0)){
    (yield* getobj(n));
    freeobj();
    if(((obj.linedesc===default_line))){
      $writeln($ws("On the ground here is ",0)+$ws((yield* obj_part(n,false)),0)+$ws(".",0));
    }else{
      /* the FALSE means obj_part shouldn't do its
         				  own getobj, cause we already did one */
      (yield* print_line(obj.linedesc));
    }
  }
}
function* show_objects(){
  var i=0;
  for(var $e42=maxobjs,$ie42=1;$ie42<=$e42;$ie42++){
    i=$ie42;
    if((((here.objs[i]!==0))&&((here.objhide[i]===0)))){
      (yield* desc_obj(here.objs[i]));
    }
  }
}
function lookup_detail(n,s){
  var $ret=false;
  var i=0;
  var poss=0;
  var maybe=0;
  var num=0;
  n.v=0;
  s=lowcase(s);
  i=1;
  maybe=0;
  num=0;
  for(var $e43=maxdetail,$ie43=1;$ie43<=$e43;$ie43++){
    i=$ie43;
    if((s===here.detail[i])){
      num=i;
    }else if(($index(here.detail[i],s)===1)){
      maybe=(maybe+1);
      poss=i;
    }
  }
  if((num!==0)){
    n.v=num;
    $ret=true;
  }else if((maybe===1)){
    n.v=poss;
    $ret=true;
  }else if((maybe>1)){
    $ret=false;
  }else{
    $ret=false;
  }
  return $ret;
}
function* look_detail(s){
  var $ret=false;
  var n=0;
  if(lookup_detail({get v(){return n},set v($x){n=$x}},s)){
    if((here.detaildesc[n]===0)){
      $ret=false;
    }else{
      (yield* print_desc(here.detaildesc[n]));
      (yield* log_event(myslot,e_lookdetail,0,0,here.detail[n]));
      $ret=true;
    }
  }else{
    $ret=false;
  }
  return $ret;
}
function* look_person(s){
  var $ret=false;
  var objnum=0;
  var i=0;
  var n=0;
  var first=false;
  if((yield* parse_pers({get v(){return n},set v($x){n=$x}},s))){
    if((n===myslot)){
      (yield* log_event(myslot,e_lookself,n,0));
      $writeln($ws("You step outside of yourself for a moment to get an objective self-appraisal:",0));
      $writeln("");
    }else{
      (yield* log_event(myslot,e_lookyou,n,0));
    }
    if((here.people[n].self!==0)){
      (yield* print_desc(here.people[n].self));
      $writeln("");
    }
    desc_health(n);
    /* Do an inventory of person S */
    first=true;
    for(var $e44=maxhold,$ie44=1;$ie44<=$e44;$ie44++){
      i=$ie44;
      objnum=here.people[n].holding[i];
      if((objnum!==0)){
        if(first){
          $writeln($ws(here.people[n].name_,0)+$ws(" is holding:",0));
          first=false;
        }
        $writeln($ws("   ",0)+$ws((yield* obj_part(objnum)),0));
      }
    }
    if(first){
      $writeln($ws(here.people[n].name_,0)+$ws(" is empty handed.",0));
    }
    $ret=true;
  }else{
    $ret=false;
  }
  return $ret;
}
function* do_examine(s,three,silent=false){
  var n=0;
  var msg="";
  three.v=false;
  if((yield* parse_obj({get v(){return n},set v($x){n=$x}},s))){
    if((obj_here(n)||obj_hold(n))){
      three.v=true;
      (yield* getobj(n));
      freeobj();
      msg=(((myname+" is examining ")+(yield* obj_part(n)))+".");
      (yield* log_event(myslot,e_examine,0,0,msg));
      if((obj.examine===0)){
        $writeln($ws("You see nothing special about the ",0)+$ws(objnam.idents[n],0)+$ws(".",0));
      }else{
        (yield* print_desc(obj.examine));
      }
    }else if(!(silent)){
      $writeln($ws("That object cannot be seen here.",0));
    }
  }else if(!(silent)){
    $writeln($ws("That object cannot be seen here.",0));
  }
}
function* print_room(){
  switch(here.nameprint){
    case 0:{
      break;
    }
    case 1:{
      /* don't print name */
      $writeln($ws("You're in ",0)+$ws(here.nicename,0));
      break;
    }
    case 2:{
      $writeln($ws("You're at ",0)+$ws(here.nicename,0));
      break;
    }
  }
  if(!(brief)){
    switch(here.which){
      case 0:{
        (yield* print_desc(here.primary));
        break;
      }
      case 1:{
        (yield* print_desc(here.secondary));
        break;
      }
      case 2:{
        (yield* print_desc(here.primary));
        (yield* print_desc(here.secondary));
        break;
      }
      case 3:{
        (yield* print_desc(here.primary));
        if((here.magicobj!==0)){
          if(obj_hold(here.magicobj)){
            (yield* print_desc(here.secondary));
          }
        }
        break;
      }
      case 4:{
        if((here.magicobj!==0)){
          if(obj_hold(here.magicobj)){
            (yield* print_desc(here.secondary));
          }else{
            (yield* print_desc(here.primary));
          }
        }else{
          (yield* print_desc(here.primary));
        }
        break;
      }
    }
    $writeln("");
  }
}
/* if not(brief) */
function* do_look(s=""){
  var n=0;
  var one=false;
  var two=false;
  var three=false;
  (yield* gethere());
  if((s==="")){
    /* do an ordinary top-level room look */
    if(hiding){
      $writeln($ws("You can't get a very good view of the details of the room from where",0));
      $writeln($ws("you are hiding.",0));
      (yield* noisehide(67));
    }else{
      (yield* print_room());
      (yield* show_exits());
    }
    /* end of what you can't see when you're hiding */
    (yield* show_people());
    (yield* show_group());
    (yield* show_objects());
  }else{
    /* look at a detail in the room */
    one=(yield* look_detail(s));
    two=(yield* look_person(s));
    (yield* do_examine(s,{get v(){return three},set v($x){three=$x}},true));
    if(!(((one||two)||three))){
      $writeln($ws("There isn't anything here by that name to look at.",0));
    }
  }
}
function init_exit(dir){
  var $w47=here.exits[dir];
  $w47.exitdesc=default_line;
  $w47.fail=default_line;
  /* default descriptions */
  $w47.success=0;
  /* until they customize */
  $w47.comeout=default_line;
  $w47.goin=default_line;
  $w47.closed=default_line;
  $w47.objreq=0;
  /* not a door (yet) */
  $w47.hidden=0;
  /* not hidden */
  $w47.reqalias=false;
  /* don't require alias (i.e. can use
     					  direction of exit North, east, etc. */
  $w47.reqverb=false;
  $w47.autolook=true;
  $w47.alias="";
}
function* remove_exit(dir){
  var targroom=0;
  var targslot=0;
  var hereacc=false;
  var targacc=false;
  /* Leave residual accepts if player is not the owner of
     		  the room that the exit he is deleting is in */
  (yield* getroom());
  targroom=here.exits[dir].toloc;
  targslot=here.exits[dir].slot;
  here.exits[dir].toloc=0;
  init_exit(dir);
  if((((here.owner===userid))||(privd))){
    hereacc=false;
  }else{
    hereacc=true;
  }
  if(hereacc){
    here.exits[dir].kind=5;
  }else{
    /* put an "accept" in its place */
    here.exits[dir].kind=0;
  }
  putroom();
  (yield* log_event(myslot,e_detach,dir,0,myname,location));
  (yield* getroom(targroom));
  here.exits[targslot].toloc=0;
  if((((here.owner===userid))||(privd))){
    targacc=false;
  }else{
    targacc=true;
  }
  if(targacc){
    here.exits[targslot].kind=5;
  }else{
    /* put an "accept" in its place */
    here.exits[targslot].kind=0;
  }
  putroom();
  if((targroom!==location)){
    (yield* log_event(0,e_detach,targslot,0,myname,targroom));
  }
  $writeln($ws("Exit destroyed.",0));
}
/* User procedure to unlink a room */
function* do_unlink(s){
  var dir=0;
  (yield* gethere());
  if((yield* checkhide())){
    if(lookup_dir({get v(){return dir},set v($x){dir=$x}},s)){
      if((yield* can_alter(dir))){
        if((here.exits[dir].toloc===0)){
          $writeln($ws("There is no exit there to unlink.",0));
        }else{
          (yield* remove_exit(dir));
        }
      }else{
        $writeln($ws("You are not allowed to remove that exit.",0));
      }
    }else{
      $writeln($ws("To remove an exit, type UNLINK <direction of exit>.",0));
    }
  }
}
function desc_allowed(){
  var $ret=false;
  if((((here.owner===userid))||(privd))){
    $ret=true;
  }else{
    $writeln($ws("Sorry, you are not allowed to alter the descriptions in this room.",0));
    $ret=false;
  }
  return $ret;
}
function slead(s){
  var $ret="";
  var i=0;
  var going=false;
  if((s.length===0)){
    $ret="";
  }else{
    i=1;
    going=true;
    while(going){
      if((i>s.length)){
        going=false;
      }else if(((($ch(s,i)===" "))||(($ch(s,i)===$chr(9))))){
        i=(i+1);
      }else{
        going=false;
      }
    }
    if((i>s.length)){
      $ret="";
    }else{
      $ret=$substr(s,i,((s.length+1)-i));
    }
  }
  return $ret;
}
function bite(s){
  var $ret="";
  var i=0;
  if((s.v.length===0)){
    $ret="";
  }else{
    i=$index(s.v," ");
    if((i===0)){
      $ret=s.v;
      s.v="";
    }else{
      $ret=$substr(s.v,1,(i-1));
      s.v=slead($substr(s.v,(i+1),(s.v.length-i)));
    }
  }
  return $ret;
}
function edit_help(){
  $writeln("");
  $writeln($ws("A\tAppend text to end",0));
  $writeln($ws("C\tCheck text for correct length with parameter substitution (#)",0));
  $writeln($ws("D #\tDelete line #",0));
  $writeln($ws("E\tExit & save changes",0));
  $writeln($ws("I #\tInsert lines before line #",0));
  $writeln($ws("P\tPrint out description",0));
  $writeln($ws("Q\tQuit: THROWS AWAY CHANGES",0));
  $writeln($ws("R #\tReplace text of line #",0));
  $writeln($ws("Z\tZap all text",0));
  $writeln($ws("@\tThrow away text & exit with the default description",0));
  $writeln($ws("?\tThis list",0));
  $writeln("");
}
function* edit_replace(n){
  var prompt="";
  var s="";
  if((((n>heredsc.desclen))||((n<1)))){
    $writeln($ws("-- Bad line number",0));
  }else{
    prompt=$wi(n,2)+$ws(": ",0);
    (yield* grab_line(prompt,{get v(){return s},set v($x){s=$x}}));
    if((s!=="**")){
      heredsc.lines[n]=s;
    }
  }
}
function edit_insert(n){
  var i=0;
  if((heredsc.desclen===descmax)){
    $writeln($ws("You have already used all ",0)+$wi(descmax,1)+$ws(" lines of text.",0));
  }else if((((n<1))||((n>heredsc.desclen)))){
    $writeln($ws("Invalid line #; valid lines are between 1 and ",0)+$wi(heredsc.desclen,1));
    $writeln($ws("Use A (add) to add text to the end of your description.",0));
  }else{
    for(var $e48=(n+1),$ie48=(heredsc.desclen+1);$ie48>=$e48;$ie48--){
      i=$ie48;
      heredsc.lines[i]=heredsc.lines[(i-1)];
    }
    heredsc.desclen=(heredsc.desclen+1);
    heredsc.lines[n]="";
  }
}
function* edit_doinsert(n){
  var s="";
  var prompt="";
  if((heredsc.desclen===descmax)){
    $writeln($ws("You have already used all ",0)+$wi(descmax,1)+$ws(" lines of text.",0));
  }else if((((n<1))||((n>heredsc.desclen)))){
    $writeln($ws("Invalid line #; valid lines are between 1 and ",0)+$wi(heredsc.desclen,1));
    $writeln($ws("Use A (add) to add text to the end of your description.",0));
  }else{
    do{
      prompt=$wi(n,1)+$ws(": ",0);
      (yield* grab_line(prompt,{get v(){return s},set v($x){s=$x}}));
      if((s!=="**")){
        edit_insert(n);
        /* put the blank line in */
        heredsc.lines[n]=s;
        /* copy this line onto it */
        n=(n+1);
      }
    }while(!((((heredsc.desclen===descmax))||((s==="**")))));
  }
}
function edit_show(){
  var i=0;
  $writeln("");
  if((heredsc.desclen===0)){
    $writeln($ws("[no text]",0));
  }else{
    i=1;
    while((i<=heredsc.desclen)){
      $writeln($wi(i,2)+$ws(": ",0)+$ws(heredsc.lines[i],0));
      i=(i+1);
    }
  }
}
function* edit_append(){
  var prompt="";
  var s="";
  var stilladding=false;
  if((heredsc.desclen===descmax)){
    $writeln($ws("You have already used all ",0)+$wi(descmax,1)+$ws(" lines of text.",0));
  }else{
    stilladding=true;
    $writeln($ws("Enter text.  Terminate with ** at the beginning of a line.",0));
    $writeln($ws("You have ",0)+$wi(descmax,1)+$ws(" lines maximum.",0));
    $writeln("");
    while((((heredsc.desclen<descmax))&&(stilladding))){
      prompt=$wi((heredsc.desclen+1),2)+$ws(": ",0);
      (yield* grab_line(prompt,{get v(){return s},set v($x){s=$x}}));
      if((s==="**")){
        stilladding=false;
      }else{
        heredsc.desclen=(heredsc.desclen+1);
        heredsc.lines[heredsc.desclen]=s;
      }
    }
  }
}
function edit_delete(n){
  var i=0;
  if((heredsc.desclen===0)){
    $writeln($ws("-- No lines to delete",0));
  }else if((((n>heredsc.desclen))||((n<1)))){
    $writeln($ws("-- Bad line number",0));
  }else if((((n===1))&&((heredsc.desclen===1)))){
    heredsc.desclen=0;
  }else{
    for(var $e49=(heredsc.desclen-1),$ie49=n;$ie49<=$e49;$ie49++){
      i=$ie49;
      heredsc.lines[i]=heredsc.lines[(i+1)];
    }
    heredsc.desclen=(heredsc.desclen-1);
  }
}
function check_subst(){
  var i=0;
  if((heredsc.desclen>0)){
    for(var $e50=heredsc.desclen,$ie50=1;$ie50<=$e50;$ie50++){
      i=$ie50;
      if(((($index(heredsc.lines[i],"#")>0))&&((heredsc.lines[i].length>59)))){
        $writeln($ws("Warning: line ",0)+$wi(i,1)+$ws(" is too long for correct parameter substitution.",0));
      }
    }
  }
}
function* edit_desc(dsc){
  var $ret=false;
  var cmd='\0';
  var s="";
  var done=false;
  var n=0;
  if((dsc.v===default_line)){
    heredsc.desclen=0;
  }else if((dsc.v>0)){
    (yield* getblock(dsc.v));
    freeblock();
    $assign(heredsc,block);
  }else if((dsc.v<0)){
    n=((-dsc.v));
    (yield* getline(n));
    freeline();
    heredsc.lines[1]=oneliner.theline;
    heredsc.desclen=1;
  }else{
    heredsc.desclen=0;
  }
  $ret=true;
  done=false;
  if((heredsc.desclen===0)){
    (yield* edit_append());
  }
  do{
    $writeln("");
    do{
      (yield* grab_line("* ",{get v(){return s},set v($x){s=$x}}));
      s=slead(s);
    }while(!((s.length>0)));
    s=lowcase(s);
    cmd=$ch(s,1);
    if((s.length>1)){
      n=number(slead($substr(s,2,(s.length-1))));
    }else{
      n=0;
    }
    switch(cmd){
      case "h":case "?":{
        edit_help();
        break;
      }
      case "a":{
        (yield* edit_append());
        break;
      }
      case "z":{
        heredsc.desclen=0;
        break;
      }
      case "c":{
        check_subst();
        break;
      }
      case "p":case "l":case "t":{
        edit_show();
        break;
      }
      case "d":{
        edit_delete(n);
        break;
      }
      case "e":{
        check_subst();
        if(debug){
          $writeln($ws("edit_desc: dsc is ",0)+$wi(dsc.v,1));
        }
        /* what I do here may require some explanation:
           
           	dsc is a pointer to some text structure:
           		dsc = 0 :  no text
           		dsc > 0 :  dsc refers to a description block (descmax lines)
           		dsc < 0 :  dsc refers to a description "one liner".  abs(dsc)
           			   is the actual pointer
           
           	If there are no lines of text to be written out (heredsc.desclen = 0)
           	then we deallocate whatever dsc is when edit_desc was invoked, if
           	it was pointing to something;
           
           	if there is one line of text to be written out, allocate a one liner
           	record, assign the string to it, and return dsc as negative;
           
           	if there is mmore than one line of text, allocate a description block,
           	store the lines in it, and return dsc as positive.
           
           	In all cases if there was already a record allocated to dsc then
           	use it and don't reallocate a new record. */
        if((((heredsc.desclen>0))&&((dsc.v===default_line)))){
          /* kill the default */
          /* if we're gonna put real */
          dsc.v=0;
        }
        /* texty in here */
        if((heredsc.desclen===0)){
          /* no lines, delete existing */
          (yield* delete_block(dsc));
        /* desc, if any */
        }else if((heredsc.desclen===1)){
          if(((dsc.v===0))){
            if((yield* alloc_line(dsc))){
            }
            dsc.v=((-dsc.v));
          }else if((dsc.v>0)){
            (yield* delete_block(dsc));
            if((yield* alloc_line(dsc))){
            }
            dsc.v=((-dsc.v));
          }
          if((dsc.v<0)){
            (yield* getline(Math.abs(dsc.v)));
            oneliner.theline=heredsc.lines[1];
            putline();
          }
        }else{
          /* more than 1 lines */
          if((dsc.v===0)){
            if((yield* alloc_block(dsc))){
            }
          }else if((dsc.v<0)){
            (yield* delete_line(dsc));
            if((yield* alloc_block(dsc))){
            }
          }
          if((dsc.v>0)){
            (yield* getblock(dsc.v));
            $assign(block,heredsc);
            block.descrinum=dsc.v;
            /* This is a fudge */
            putblock();
          }
        }
        done=true;
        break;
      }
      case "r":{
        (yield* edit_replace(n));
        break;
      }
      case "@":{
        (yield* delete_block(dsc));
        dsc.v=default_line;
        done=true;
        break;
      }
      case "i":{
        (yield* edit_doinsert(n));
        break;
      }
      case "q":{
        (yield* grab_line("Throw away changes, are you sure? ",{get v(){return s},set v($x){s=$x}}));
        s=lowcase(s);
        if((((s==="y"))||((s==="yes")))){
          done=true;
          $ret=false;
        }
        break;
      }
      default:{
        /* signal caller not to save */
        $writeln($ws("-- Invalid command, type ? for a list.",0));
      }
    }
  }while(!(done));
  return $ret;
}
function* alloc_detail(n,s){
  var $ret=false;
  var found=false;
  n.v=1;
  found=false;
  while((((n.v<=maxdetail))&&(!found))){
    if((here.detaildesc[n.v]===0)){
      found=true;
    }else{
      n.v=(n.v+1);
    }
  }
  $ret=found;
  if(!(found)){
    n.v=0;
  }else{
    (yield* getroom());
    here.detail[n.v]=lowcase(s);
    putroom();
  }
  return $ret;
}
/* User describe procedure.  If no s then describe the room
   
   Known problem: if two people edit the description to the same room one of their
   	description blocks could be lost.
   This is unlikely to happen unless the Monster Manager tries to edit a
   description while the room's owner is also editing it. */
function* do_describe(s){
  var i=0;
  var newdsc=0;
  (yield* gethere());
  if((yield* checkhide())){
    if((s==="")){
      /* describe this room */
      if(desc_allowed()){
        (yield* log_action(desc,0));
        $writeln($ws("[ Editing the primary room description ]",0));
        newdsc=here.primary;
        if((yield* edit_desc({get v(){return newdsc},set v($x){newdsc=$x}}))){
          (yield* getroom());
          here.primary=newdsc;
          putroom();
        }
        (yield* log_event(myslot,e_editdone,0,0));
      }
    }else{
      /* describe a detail of this room */
      if((s.length>veryshortlen)){
        $writeln($ws("Your detail keyword can only be ",0)+$wi(veryshortlen,1)+$ws(" characters.",0));
      }else if(desc_allowed()){
        if(!(lookup_detail({get v(){return i},set v($x){i=$x}},s))){
          if(!((yield* alloc_detail({get v(){return i},set v($x){i=$x}},s)))){
            $writeln($ws("You have used all ",0)+$wi(maxdetail,1)+$ws(" details.",0));
            $writeln($ws("To delete a detail, DESCRIBE <the detail> and delete all the text.",0));
          }
        }
        if((i!==0)){
          (yield* log_action(e_detail,0));
          $writeln($ws("[ Editing detail \"",0)+$ws(here.detail[i],0)+$ws("\" of this room ]",0));
          newdsc=here.detaildesc[i];
          if((yield* edit_desc({get v(){return newdsc},set v($x){newdsc=$x}}))){
            (yield* getroom());
            here.detaildesc[i]=newdsc;
            putroom();
          }
          (yield* log_event(myslot,e_donedet,0,0));
        }
      }
    }
  }
}
/* clear_command; */
function* del_room(n){
  var i=0;
  (yield* getnam());
  nam.idents[n]="";
  /* blank out name */
  putnam();
  (yield* getown());
  own.idents[n]="";
  /* blank out owner */
  putown();
  (yield* getroom(n));
  for(var $e52=maxexit,$ie52=1;$ie52<=$e52;$ie52++){
    i=$ie52;
    var $w53=here.exits[i];
    (yield* delete_line($rf($w53,"exitdesc")));
    (yield* delete_line($rf($w53,"fail")));
    (yield* delete_line($rf($w53,"success")));
    (yield* delete_line($rf($w53,"comeout")));
    (yield* delete_line($rf($w53,"goin")));
  }
  (yield* delete_block($rf(here,"primary")));
  (yield* delete_block($rf(here,"secondary")));
  putroom();
  (yield* delete_room({get v(){return n},set v($x){n=$x}}));
}
/* return room to free list */
/* create a room with name s */
function* createroom(s){
  var roomno=0;
  var dummy=0;
  var i=0;
  var rand_accept=0;
  if((s.length===0)){
    $writeln($ws("Please specify the name of the room you wish to create as a parameter to FORM.",0));
  }else if((s.length>shortlen)){
    $writeln($ws("Please limit your room name to a maximum of ",0)+$wi(shortlen,1)+$ws(" characters.",0));
  }else if((yield* exact_room({get v(){return dummy},set v($x){dummy=$x}},s))){
    $writeln($ws("That room name has already been used.  Please give a unique room name.",0));
  }else if((yield* alloc_room({get v(){return roomno},set v($x){roomno=$x}}))){
    (yield* log_action(form,0));
    (yield* getnam());
    nam.idents[roomno]=lowcase(s);
    /* assign room name */
    putnam();
    /* case insensitivity */
    (yield* getown());
    own.idents[roomno]=userid;
    /* assign room owner */
    putown();
    (yield* getroom(roomno));
    here.primary=0;
    here.secondary=0;
    here.which=0;
    /* print primary desc only by default */
    here.magicobj=0;
    here.owner=userid;
    /* owner and name are stored here too */
    here.nicename=s;
    here.nameprint=1;
    /* You're in ... */
    here.objdrop=0;
    /* objects dropped stay here */
    here.objdesc=0;
    /* nothing printed when they drop */
    here.magicobj=0;
    /* no magic object default */
    here.trapto=0;
    /* no trapdoor */
    here.trapchance=0;
    /* no chance */
    here.rndmsg=default_line;
    /* bland noises message */
    here.pile=0;
    here.grploc1=0;
    here.grploc2=0;
    here.grpnam1="";
    here.grpnam2="";
    here.effects=0;
    here.parm=0;
    here.xmsg2=0;
    here.exp2=0;
    here.exp3=0;
    here.exp4=0;
    here.exitfail=default_line;
    here.ofail=default_line;
    for(var $e54=maxpeople,$ie54=1;$ie54<=$e54;$ie54++){
      i=$ie54;
      here.people[i].kind=0;
    }
    for(var $e55=maxpeople,$ie55=1;$ie55<=$e55;$ie55++){
      i=$ie55;
      here.people[i].name_="";
    }
    for(var $e56=maxobjs,$ie56=1;$ie56<=$e56;$ie56++){
      i=$ie56;
      here.objs[i]=0;
    }
    for(var $e57=maxdetail,$ie57=1;$ie57<=$e57;$ie57++){
      i=$ie57;
      here.detail[i]="";
    }
    for(var $e58=maxdetail,$ie58=1;$ie58<=$e58;$ie58++){
      i=$ie58;
      here.detaildesc[i]=0;
    }
    for(var $e59=maxobjs,$ie59=1;$ie59<=$e59;$ie59++){
      i=$ie59;
      here.objhide[i]=0;
    }
    for(var $e60=maxexit,$ie60=1;$ie60<=$e60;$ie60++){
      i=$ie60;
      var $w61=here.exits[i];
      $w61.toloc=0;
      $w61.kind=0;
      $w61.slot=0;
      $w61.exitdesc=default_line;
      $w61.fail=default_line;
      $w61.success=0;
      /* no success desc by default */
      $w61.goin=default_line;
      $w61.comeout=default_line;
      $w61.closed=default_line;
      $w61.objreq=0;
      $w61.hidden=0;
      $w61.alias="";
      $w61.reqverb=false;
      $w61.reqalias=false;
      $w61.autolook=true;
    }
    /* here.exits := zero; */
    /* random accept for this room */
    rand_accept=(1+($mod(rnd100(),6)));
    here.exits[rand_accept].kind=5;
    putroom();
  }
}
function* show_help(){
  var i=0;
  var s="";
  $writeln("");
  $writeln($ws("Accept/Refuse #  Allow others to Link an exit here at direction # | Undo Accept",0));
  $writeln($ws("Brief            Toggle printing of room descriptions",0));
  $writeln($ws("Customize [#]    Customize this room | Customize exit # | Customize object #",0));
  $writeln($ws("Describe [#]     Describe this room | Describe a feature (#) in detail",0));
  $writeln($ws("Destroy #        Destroy an instance of object # (you must be holding it)",0));
  $writeln($ws("Duplicate #      Make a duplicate of an already-created object.",0));
  $writeln($ws("Form/Zap #       Form a new room with name # | Destroy room named #",0));
  $writeln($ws("Get/Drop #       Get/Drop an object",0));
  $writeln($ws("#,Go #           Go towards # (Some: N/North S/South E/East W/West U/Up D/Down)",0));
  $writeln($ws("Health           Show how healthy you are",0));
  $writeln($ws("Hide/Reveal [#]  Hide/Reveal yoursef | Hide object (#)",0));
  $writeln($ws("I,Inventory      See what you or someone else is carrying",0));
  $writeln($ws("Link/Unlink #    Link/Unlink this room to/from another via exit at direction #",0));
  $writeln($ws("Look,L [#]       Look here | Look at something or someone (#) closely",0));
  $writeln($ws("Make #           Make a new object named #",0));
  $writeln($ws("Name #           Set your game name to #",0));
  $writeln($ws("Players          List people who have played Monster",0));
  $writeln($ws("Punch #          Punch person #",0));
  $writeln($ws("Quit             Leave the game",0));
  $writeln($ws("Relink           Move an exit",0));
  $writeln("");
  (yield* grab_line("-more-",{get v(){return s},set v($x){s=$x}}));
  $writeln("");
  $writeln($ws("Rooms            Show information about rooms you have made",0));
  $writeln($ws("Say, ' (quote)   Say line of text following command to others in the room",0));
  $writeln($ws("Search           Look around the room for anything hidden",0));
  $writeln($ws("Self #           Edit a description of yourself | View #'s self-description",0));
  $writeln($ws("Show #           Show option # (type SHOW ? for a list)",0));
  $writeln($ws("Unmake #         Remove the form definition of object #",0));
  $writeln($ws("Use #            Use object #",0));
  $writeln($ws("Wear #           Wear the object #",0));
  $writeln($ws("Wield #          Wield the weapon #;  you must be holding it first",0));
  $writeln($ws("Whisper #        Whisper something (prompted for) to person #",0));
  $writeln($ws("Who              List of people playing Monster now",0));
  $writeln($ws("Whois #          What is a player's username",0));
  $writeln($ws("?,Help           This list",0));
  $writeln($ws(". (period)       Repeat last command",0));
  $writeln("");
}
function lookup_cmd(s){
  var $ret=0;
  var i=0;
  var poss=0;
  var maybe=0;
  var num=0;
  /* index for loop */
  /* a possible match -- only for partial matches */
  /* number of possible matches we have: > 2 is ambig. */
  /* the definite match */
  s=lowcase(s);
  i=1;
  maybe=0;
  num=0;
  for(var $e62=numcmds,$ie62=1;$ie62<=$e62;$ie62++){
    i=$ie62;
    if((s===cmds[i])){
      num=i;
    }else if(($index(cmds[i],s)===1)){
      maybe=(maybe+1);
      poss=i;
    }
  }
  if((num!==0)){
    $ret=num;
  }else if((maybe===1)){
    $ret=poss;
  }else if((maybe>1)){
    $ret=error;
  }else{
    /* "Ambiguous" */
    $ret=error;
  }
  return $ret;
}
/* "Command not found " */
function* addrooms(n){
  var i=0;
  (yield* getindex(i_room));
  for(var $e63=(indx.top+n),$ie63=(indx.top+1);$ie63<=$e63;$ie63++){
    i=$ie63;
    $locate(roomfile,i);
    roomfile.buf.valid=i;
    roomfile.buf.locnum=i;
    roomfile.buf.primary=0;
    roomfile.buf.secondary=0;
    roomfile.buf.which=0;
    $put(roomfile);
  }
  indx.top=(indx.top+n);
  putindex();
}
function* addints(n){
  var i=0;
  (yield* getindex(i_int));
  for(var $e64=(indx.top+n),$ie64=(indx.top+1);$ie64<=$e64;$ie64++){
    i=$ie64;
    $locate(intfile,i);
    intfile.buf.intnum=i;
    $put(intfile);
  }
  indx.top=(indx.top+n);
  putindex();
}
function* addlines(n){
  var i=0;
  (yield* getindex(i_line));
  for(var $e65=(indx.top+n),$ie65=(indx.top+1);$ie65<=$e65;$ie65++){
    i=$ie65;
    $locate(linefile,i);
    linefile.buf.linenum=i;
    $put(linefile);
  }
  indx.top=(indx.top+n);
  putindex();
}
function* addblocks(n){
  var i=0;
  (yield* getindex(i_block));
  for(var $e66=(indx.top+n),$ie66=(indx.top+1);$ie66<=$e66;$ie66++){
    i=$ie66;
    $locate(descfile,i);
    descfile.buf.descrinum=i;
    $put(descfile);
  }
  indx.top=(indx.top+n);
  putindex();
}
function* addobjects(n){
  var i=0;
  (yield* getindex(i_object));
  for(var $e67=(indx.top+n),$ie67=(indx.top+1);$ie67<=$e67;$ie67++){
    i=$ie67;
    $locate(objfile,i);
    objfile.buf.objnum=i;
    $put(objfile);
  }
  indx.top=(indx.top+n);
  putindex();
}
function* dist_list(){
  var i=0;
  var j=0;
  var f=$file(()=>"");
  var where_they_are=({intnum:0,int:$zeros(maxplayers)});
  $writeln($ws("Writing distribution list . . .",0));
  $open(f,"monsters.dis",{history:"new"});
  $rewrite(f);
  (yield* getindex(i_player));
  /* Rec of valid player log records */
  freeindex();
  /* False if a valid player log */
  (yield* getuser());
  /* Corresponding userids of players */
  freeuser();
  (yield* getpers());
  /* Personal names of players */
  freepers();
  (yield* getdate());
  /* date of last play */
  freedate();
  if(privd){
    (yield* getint(n_location));
    freeint();
    $assign(where_they_are,anint);
    (yield* getnam());
    freenam();
  }
  for(var $e68=maxplayers,$ie68=1;$ie68<=$e68;$ie68++){
    i=$ie68;
    if(!(indx.free[i])){
      $fwrite(f,$ws(user.idents[i],0));
      for(var $e69=15,$ie69=user.idents[i].length;$ie69<=$e69;$ie69++){
        j=$ie69;
        $fwrite(f,$ws(" ",0));
      }
      $fwrite(f,$ws("! ",0)+$ws(pers.idents[i],0));
      for(var $e70=21,$ie70=pers.idents[i].length;$ie70<=$e70;$ie70++){
        j=$ie70;
        $fwrite(f,$ws(" ",0));
      }
      $fwrite(f,$ws(adate.idents[i],0));
      if((adate.idents[i].length<19)){
        for(var $e71=18,$ie71=adate.idents[i].length;$ie71<=$e71;$ie71++){
          j=$ie71;
          $fwrite(f,$ws(" ",0));
        }
      }
      if((anint.int[i]!==0)){
        $fwrite(f,$ws(" * ",0));
      }else{
        $fwrite(f,$ws("   ",0));
      }
      if(privd){
        $fwrite(f,$ws(nam.idents[where_they_are.int[i]],0));
      }
      $fwrite(f,"",true);
    }
  }
  $writeln($ws("Done.",0));
}
function* system_view(){
  var used=0;
  var free=0;
  var total=0;
  $writeln("");
  (yield* getindex(i_block));
  freeindex();
  used=indx.inuse;
  total=indx.top;
  free=(total-used);
  $writeln($ws("               used   free   total",0));
  $writeln($ws("Block file   ",0)+$wi(used,5)+$ws("  ",0)+$wi(free,5)+$ws("   ",0)+$wi(total,5));
  (yield* getindex(i_line));
  freeindex();
  used=indx.inuse;
  total=indx.top;
  free=(total-used);
  $writeln($ws("Line file    ",0)+$wi(used,5)+$ws("  ",0)+$wi(free,5)+$ws("   ",0)+$wi(total,5));
  (yield* getindex(i_room));
  freeindex();
  used=indx.inuse;
  total=indx.top;
  free=(total-used);
  $writeln($ws("Room file    ",0)+$wi(used,5)+$ws("  ",0)+$wi(free,5)+$ws("   ",0)+$wi(total,5));
  (yield* getindex(i_object));
  freeindex();
  used=indx.inuse;
  total=indx.top;
  free=(total-used);
  $writeln($ws("Object file  ",0)+$wi(used,5)+$ws("  ",0)+$wi(free,5)+$ws("   ",0)+$wi(total,5));
  (yield* getindex(i_int));
  freeindex();
  used=indx.inuse;
  total=indx.top;
  free=(total-used);
  $writeln($ws("Integer file ",0)+$wi(used,5)+$ws("  ",0)+$wi(free,5)+$ws("   ",0)+$wi(total,5));
  $writeln("");
}
/* remove a user from the log records (does not handle ownership) */
function* kill_user(s){
  var n=0;
  if((s.length===0)){
    $writeln($ws("No user specified",0));
  }else{
    if((yield* lookup_user({get v(){return n},set v($x){n=$x}},s))){
      (yield* getindex(i_asleep));
      freeindex();
      if(indx.free[n]){
        (yield* delete_log({get v(){return n},set v($x){n=$x}}));
        $writeln($ws("Player deleted.",0));
      }else{
        $writeln($ws("That person is playing now.",0));
      }
    }else{
      $writeln($ws("No such userid found in log information.",0));
    }
  }
}
/* disown everything a player owns */
function* disown_user(s){
  var n=0;
  var i=0;
  var tmp="";
  var theuser="";
  if((s.length>0)){
    if(debug){
      $writeln($ws("calling lookup_user with ",0)+$ws(s,0));
    }
    if(!(yield* lookup_user({get v(){return n},set v($x){n=$x}},s))){
      $writeln($ws("User not in log info, attempting to disown anyway.",0));
    }
    theuser=user.idents[n];
    /* first disown all their rooms */
    (yield* getown());
    freeown();
    for(var $e72=maxroom,$ie72=1;$ie72<=$e72;$ie72++){
      i=$ie72;
      if((own.idents[i]===theuser)){
        (yield* getown());
        own.idents[i]="*";
        putown();
        (yield* getroom(i));
        tmp=here.nicename;
        here.owner="*";
        putroom();
        $writeln($ws("Disowned room ",0)+$ws(tmp,0));
      }
    }
    $writeln("");
    (yield* getobjown());
    freeobjown();
    (yield* getobjnam());
    freeobjnam();
    for(var $e73=maxroom,$ie73=1;$ie73<=$e73;$ie73++){
      i=$ie73;
      if((objown.idents[i]===theuser)){
        (yield* getobjown());
        objown.idents[i]="*";
        putobjown();
        tmp=objnam.idents[i];
        $writeln($ws("Disowned object ",0)+$ws(tmp,0));
      }
    }
  }else{
    $writeln($ws("No user specified.",0));
  }
}
function* move_asleep(){
  var pname="";
  var rname="";
  /* player & room names */
  var newroom=0;
  var n=0;
  /* room number & player slot number */
  (yield* grab_line("Player name? ",{get v(){return pname},set v($x){pname=$x}}));
  (yield* grab_line("Room name?   ",{get v(){return rname},set v($x){rname=$x}}));
  if((yield* lookup_user({get v(){return n},set v($x){n=$x}},pname))){
    if((yield* lookup_room({get v(){return newroom},set v($x){newroom=$x}},rname))){
      (yield* getindex(i_asleep));
      freeindex();
      if(indx.free[n]){
        (yield* getint(n_location));
        anint.int[n]=newroom;
        putint();
        $writeln($ws("Player moved.",0));
      }else{
        $writeln($ws("That player is not asleep.",0));
      }
    }else{
      $writeln($ws("No such room found.",0));
    }
  }else{
    $writeln($ws("User not found.",0));
  }
}
function system_help(){
  $writeln("");
  $writeln($ws("B\tAdd description blocks",0));
  $writeln($ws("D\tDisown <user>",0));
  $writeln($ws("E\tExit (same as quit)",0));
  $writeln($ws("I\tAdd Integer records",0));
  $writeln($ws("K\tKill <user>",0));
  $writeln($ws("L\tAdd one liner records",0));
  $writeln($ws("M\tMove a player who is asleep (not playing now)",0));
  $writeln($ws("O\tAdd object records",0));
  $writeln($ws("P\tWrite a distribution list of players",0));
  $writeln($ws("Q\tQuit (same as exit)",0));
  $writeln($ws("R\tAdd rooms",0));
  $writeln($ws("V\tView current sizes/usage",0));
  $writeln($ws("?\tThis list",0));
  $writeln("");
}
/* *************** FIX_STUFF ******************** */
function fix_stuff(){
}
function* do_system(s){
  var prompt="";
  var done=false;
  var cmd='\0';
  var n=0;
  var p="";
  if(privd){
    (yield* log_action(c_system,0));
    prompt="System> ";
    done=false;
    do{
      do{
        (yield* grab_line(prompt,{get v(){return s},set v($x){s=$x}}));
        s=slead(s);
      }while(!((s.length>0)));
      s=lowcase(s);
      cmd=$ch(s,1);
      n=0;
      p="";
      if((s.length>1)){
        p=slead($substr(s,2,(s.length-1)));
        n=number(p);
      }
      if(debug){
        $writeln($ws("p = ",0)+$ws(p,0));
      }
      switch(cmd){
        case "h":case "?":{
          system_help();
          break;
        }
        case "1":{
          fix_stuff();
          break;
        }
        case "k":{
          (yield* kill_user(p));
          break;
        }
        case "d":{
          /* remove a user */
          (yield* disown_user(p));
          break;
        }
        case "p":{
          /* disown */
          (yield* dist_list());
          break;
        }
        case "m":{
          /* dist list of players */
          (yield* move_asleep());
          break;
        }
        case "r":{
          /* move where user will wakeup */
          /* add rooms */
          if((n>0)){
            (yield* addrooms(n));
          }else{
            $writeln($ws("To add rooms, say R <# to add>",0));
          }
          break;
        }
        case "i":{
          /* add ints */
          if((n>0)){
            (yield* addints(n));
          }else{
            $writeln($ws("To add integers, say I <# to add>",0));
          }
          break;
        }
        case "b":{
          /* add description blocks */
          if((n>0)){
            (yield* addblocks(n));
          }else{
            $writeln($ws("To add description blocks, say B <# to add>",0));
          }
          break;
        }
        case "o":{
          /* add objects */
          if((n>0)){
            (yield* addobjects(n));
          }else{
            $writeln($ws("To add object records, say O <# to add>",0));
          }
          break;
        }
        case "l":{
          /* add one-liners */
          if((n>0)){
            (yield* addlines(n));
          }else{
            $writeln($ws("To add one liner records, say L <# to add>",0));
          }
          break;
        }
        case "v":{
          /* view current stats */
          (yield* system_view());
          break;
        }
        case "q":case "e":{
          done=true;
          break;
        }
        default:{
          /* quit */
          $writeln($ws("-- bad command, type ? for a list.",0));
        }
      }
    }while(!(done));
    (yield* log_event(myslot,e_sysdone,0,0));
  }else{
    $writeln($ws("Only the Monster Manger may enter system maintenance mode.",0));
  }
}
function do_version(s){
  $writeln($ws("Monster, a multiplayer adventure game where the players create the world",0));
  $writeln($ws("and make the rules.",0));
  $writeln("");
  $writeln($ws("Written by Rich Skrenta at Northwestern University, 1988.",0));
}
function* rebuild_system(){
  var i=0;
  var j=0;
  $writeln($ws("Creating index file 1-6",0));
  for(var $e75=7,$ie75=1;$ie75<=$e75;$ie75++){
    i=$ie75;
    /* 1 is blocklist
       			  2 is linelist
       			  3 is roomlist
       			  4 is playeralloc
       			  5 is player awake (playing game)
       			  6 are objects
       			  7 is intfile */
    $locate(indexfile,i);
    for(var $e76=maxindex,$ie76=1;$ie76<=$e76;$ie76++){
      j=$ie76;
      indexfile.buf.free[j]=true;
    }
    indexfile.buf.indexnum=i;
    indexfile.buf.top=0;
    /* none of each to start */
    indexfile.buf.inuse=0;
    $put(indexfile);
  }
  $writeln($ws("Initializing roomfile with 10 rooms",0));
  (yield* addrooms(10));
  $writeln($ws("Initializing block file with 10 description blocks",0));
  (yield* addblocks(10));
  $writeln($ws("Initializing line file with 10 lines",0));
  (yield* addlines(10));
  $writeln($ws("Initializing object file with 10 objects",0));
  (yield* addobjects(10));
  $writeln($ws("Initializing namfile 1-8",0));
  for(var $e77=8,$ie77=1;$ie77<=$e77;$ie77++){
    j=$ie77;
    $locate(namfile,j);
    namfile.buf.validate=j;
    namfile.buf.loctop=0;
    for(var $e78=maxroom,$ie78=1;$ie78<=$e78;$ie78++){
      i=$ie78;
      namfile.buf.idents[i]="";
    }
    $put(namfile);
  }
  $writeln($ws("Initializing eventfile",0));
  for(var $e79=(numevnts+1),$ie79=1;$ie79<=$e79;$ie79++){
    i=$ie79;
    $locate(eventfile,i);
    eventfile.buf.validat=i;
    eventfile.buf.point=1;
    $put(eventfile);
  }
  $writeln($ws("Initializing intfile",0));
  for(var $e80=6,$ie80=1;$ie80<=$e80;$ie80++){
    i=$ie80;
    $locate(intfile,i);
    intfile.buf.intnum=i;
    $put(intfile);
  }
  (yield* getindex(i_int));
  for(var $e81=6,$ie81=1;$ie81<=$e81;$ie81++){
    i=$ie81;
    indx.free[i]=false;
  }
  indx.top=6;
  indx.inuse=6;
  putindex();
  /* Player log records should have all their slots initially,
     	  they don't have to be allocated because they use namrec
     	  and intfile for their storage; they don't have their own
     	  file to allocate */
  (yield* getindex(i_player));
  indx.top=maxplayers;
  putindex();
  (yield* getindex(i_asleep));
  indx.top=maxplayers;
  putindex();
  $writeln($ws("Creating the Great Hall",0));
  (yield* createroom("Great Hall"));
  (yield* getroom(1));
  here.owner="";
  putroom();
  (yield* getown());
  own.idents[1]="";
  putown();
  $writeln($ws("Creating the Void",0));
  (yield* createroom("Void"));
  /* loc 2 */
  $writeln($ws("Creating the Pit of Fire",0));
  (yield* createroom("Pit of Fire"));
  /* loc 3 */
  /* note that these are NOT public locations */
  $writeln($ws("Use the SYSTEM command to view and add capacity to the database",0));
  $writeln("");
}
function* special(s){
  if((((s==="rebuild"))&&(privd))){
    if(rebuild_ok){
      $writeln($ws("Do you really want to destroy the entire universe?",0));
      s=(yield* $readln());
      if((s.length>0)){
        if(($substr(lowcase(s),1,1)==="y")){
          (yield* rebuild_system());
        }
      }
    }else{
      $writeln($ws("REBUILD is disabled; you must recompile.",0));
    }
  }else if((s==="version")){
    /* Don't take this out please... */
    $writeln($ws("Monster, written by Rich Skrenta at Northwestern University, 1988.",0));
  }else if((s==="quit")){
    done=true;
  }
}
/* put an object in this location
     if returns false, there were no more free object slots here:
     in other words, the room is too cluttered, and cannot hold any
     more objects */
function* place_obj(n,silent=false){
  var $ret=false;
  var found=false;
  var i=0;
  if((here.objdrop===0)){
    (yield* getroom());
  }else{
    (yield* getroom(here.objdrop));
  }
  i=1;
  found=false;
  while((((i<=maxobjs))&&(!found))){
    if((here.objs[i]===0)){
      found=true;
    }else{
      i=(i+1);
    }
  }
  $ret=found;
  if(found){
    here.objs[i]=n;
    here.objhide[i]=0;
    putroom();
    (yield* gethere());
    /* if it bounced somewhere else then tell them */
    if((((here.objdrop!==0))&&((here.objdest!==0)))){
      (yield* log_event(0,e_bouncedin,here.objdest,n,"",here.objdrop));
    }
    if(!(silent)){
      if((here.objdesc!==0)){
        (yield* print_subs(here.objdesc,(yield* obj_part(n))));
      }else{
        $writeln($ws("Dropped.",0));
      }
    }
  }else{
    freeroom();
  }
  return $ret;
}
/* remove an object from this room */
function* take_obj(objnum,slot){
  var $ret=false;
  (yield* getroom());
  if((here.objs[slot]===objnum)){
    here.objs[slot]=0;
    here.objhide[slot]=0;
    $ret=true;
  }else{
    $ret=false;
  }
  putroom();
  return $ret;
}
function can_hold(){
  var $ret=false;
  if((find_numhold()<maxhold)){
    $ret=true;
  }else{
    $ret=false;
  }
  return $ret;
}
function can_drop(){
  var $ret=false;
  if((find_numobjs()<maxobjs)){
    $ret=true;
  }else{
    $ret=false;
  }
  return $ret;
}
function find_hold(objnum,slot=0){
  var $ret=0;
  var i=0;
  if((slot===0)){
    slot=myslot;
  }
  i=1;
  $ret=0;
  while((i<=maxhold)){
    if((here.people[slot].holding[i]===objnum)){
      $ret=i;
    }
    i=(i+1);
  }
  return $ret;
}
/* put object number n into the player's inventory; returns false if
     he's holding too many things to carry another */
function* hold_obj(n){
  var $ret=false;
  var found=false;
  var i=0;
  (yield* getroom());
  i=1;
  found=false;
  while((((i<=maxhold))&&(!found))){
    if((here.people[myslot].holding[i]===0)){
      found=true;
    }else{
      i=(i+1);
    }
  }
  $ret=found;
  if(found){
    here.people[myslot].holding[i]=n;
    putroom();
    (yield* getobj(n));
    freeobj();
    hold_kind[i]=obj.kind;
  }else{
    freeroom();
  }
  return $ret;
}
/* remove an object (hold) from the player record, given the slot that
     the object is being held in */
function* drop_obj(slot,pslot=0){
  if((pslot===0)){
    pslot=myslot;
  }
  (yield* getroom());
  here.people[pslot].holding[slot]=0;
  putroom();
  hold_kind[slot]=0;
}
/* maybe drop something I'm holding if I'm hit */
function* maybe_drop(){
  var i=0;
  var objnum=0;
  var s="";
  i=(1+($mod(rnd100(),maxhold)));
  objnum=here.people[myslot].holding[i];
  if(((((objnum!==0))&&((mywield!==objnum)))&&((mywear!==objnum)))){
    /* drop something */
    (yield* drop_obj(i));
    if((yield* place_obj(objnum,true))){
      (yield* getobjnam());
      freeobjnam();
      $writeln($ws("The ",0)+$ws(objnam.idents[objnum],0)+$ws(" has slipped out of your hands.",0));
      s=objnam.idents[objnum];
      (yield* log_event(myslot,e_slipped,0,0,s));
    }else{
      $writeln($ws("%error in maybe_drop; unsuccessful place_obj; notify Monster Manager",0));
    }
  }
}
/* return TRUE if the player is allowed to program the object n
     if checkpub is true then obj_owner will return true if the object in
     question is public */
function* obj_owner(n,checkpub=false){
  var $ret=false;
  (yield* getobjown());
  freeobjown();
  if((((objown.idents[n]===userid))||(privd))){
    $ret=true;
  }else if((((objown.idents[n]===""))&&(checkpub))){
    $ret=true;
  }else{
    $ret=false;
  }
  return $ret;
}
function* do_duplicate(s){
  var objnum=0;
  if((s.length>0)){
    if(!(yield* is_owner(location,true))){
      /* only let them make things if they're on their home turf */
      $writeln($ws("You may only create objects when you are in one of your own rooms.",0));
    }else{
      if((yield* lookup_obj({get v(){return objnum},set v($x){objnum=$x}},s))){
        if((yield* obj_owner(objnum,true))){
          if(!((yield* place_obj(objnum,true)))){
            /* put the new object here */
            $writeln($ws("There isn't enough room here to make that.",0));
          }else{
            (yield* getobj(objnum));
            /* keep track of how many there */
            obj.numexist=(obj.numexist+1);
            /* are in existence */
            putobj();
            (yield* log_event(myslot,e_madeobj,0,0,(myname+" has created an object here.")));
            $writeln($ws("Object created.",0));
          }
        }else{
          $writeln($ws("Power to create that object belongs to someone else.",0));
        }
      }else{
        $writeln($ws("There is no object by that name.",0));
      }
    }
  }else{
    $writeln($ws("To duplicate an object, type DUPLICATE <object name>.",0));
  }
}
/* make an object */
function* do_makeobj(s){
  var objnum=0;
  (yield* gethere());
  if((yield* checkhide())){
    if(!(yield* is_owner(location,true))){
      $writeln($ws("You may only create objects when you are in one of your own rooms.",0));
    }else if((s!=="")){
      if((s.length>shortlen)){
        $writeln($ws("Please limit your object names to ",0)+$wi(shortlen,1)+$ws(" characters.",0));
      }else if((yield* exact_obj({get v(){return objnum},set v($x){objnum=$x}},s))){
        /* object already exits */
        $writeln($ws("That object already exits.  If you would like to make another copy of it,",0));
        $writeln($ws("use the DUPLICATE command.",0));
      }else{
        if(debug){
          $writeln($ws("%beggining to create object",0));
        }
        if((find_numobjs()<maxobjs)){
          if((yield* alloc_obj({get v(){return objnum},set v($x){objnum=$x}}))){
            if(debug){
              $writeln($ws("%alloc_obj successful",0));
            }
            (yield* getobjnam());
            objnam.idents[objnum]=lowcase(s);
            putobjnam();
            if(debug){
              $writeln($ws("%getobjnam completed",0));
            }
            (yield* getobjown());
            objown.idents[objnum]=userid;
            putobjown();
            if(debug){
              $writeln($ws("%getobjown completed",0));
            }
            (yield* getobj(objnum));
            obj.onum=objnum;
            obj.oname=s;
            /* name of object */
            obj.kind=0;
            /* bland object */
            obj.linedesc=default_line;
            obj.actindx=0;
            obj.examine=0;
            obj.numexist=1;
            obj.home=0;
            obj.homedesc=0;
            obj.sticky=false;
            obj.getobjreq=0;
            obj.getfail=0;
            obj.getsuccess=default_line;
            obj.useobjreq=0;
            obj.uselocreq=0;
            obj.usefail=default_line;
            obj.usesuccess=default_line;
            obj.usealias="";
            obj.reqalias=false;
            obj.reqverb=false;
            if($in($ch(s,1),$set(["a","A","e","E","i","I","o","O","u","U"]))){
              obj.particle=2;
            }else{
              /* an */
              obj.particle=1;
            }
            /* a */
            obj.d1=0;
            obj.d2=0;
            obj.exp3=0;
            obj.exp4=0;
            obj.exp5=default_line;
            obj.exp6=default_line;
            putobj();
            if(debug){
              $writeln($ws("putobj completed",0));
            }
          }
          /* else: alloc_obj prints errors by itself */
          if(!((yield* place_obj(objnum,true)))){
            /* put the new object here */
            $writeln($ws("%error in makeobj - could not place object; notify the Monster Manager.",0));
          }else{
            (yield* log_event(myslot,e_madeobj,0,0,(myname+" has created an object here.")));
            $writeln($ws("Object created.",0));
          }
        }else{
          $writeln($ws("This place is too crowded to create any more objects.  Try somewhere else.",0));
        }
      }
    }else{
      $writeln($ws("To create an object, type MAKE <object name>.",0));
    }
  }
}
/* remove the type block for an object; all instances of the object must
     be destroyed first */
function* do_unmake(s){
  var n=0;
  var tmp="";
  if(!((yield* is_owner(location,true)))){
    $writeln($ws("You must be in one of your own rooms to UNMAKE an object.",0));
  }else if((yield* lookup_obj({get v(){return n},set v($x){n=$x}},s))){
    tmp=(yield* obj_part(n));
    /* this will do a getobj(n) for us */
    if((obj.numexist===0)){
      (yield* delete_obj({get v(){return n},set v($x){n=$x}}));
      (yield* log_event(myslot,e_unmake,0,0,tmp));
      $writeln($ws("Object removed.",0));
    }else{
      $writeln($ws("You must DESTROY all instances of the object first.",0));
    }
  }else{
    $writeln($ws("There is no object here by that name.",0));
  }
}
/* destroy a copy of an object */
function* do_destroy(s){
  var slot=0;
  var n=0;
  if((s.length===0)){
    $writeln($ws("To destroy an object you own, type DESTROY <object>.",0));
  }else if(!(yield* is_owner(location,true))){
    $writeln($ws("You must be in one of your own rooms to destroy an object.",0));
  }else if((yield* parse_obj({get v(){return n},set v($x){n=$x}},s))){
    (yield* getobjown());
    freeobjown();
    if(((((objown.idents[n]!==userid))&&((objown.idents[n]!=="")))&&(!privd))){
      $writeln($ws("You must be the owner of an object to destroy it.",0));
    }else if(obj_hold(n)){
      slot=find_hold(n);
      (yield* drop_obj(slot));
      (yield* log_event(myslot,e_destroy,0,0,(((myname+" has destroyed ")+(yield* obj_part(n)))+".")));
      $writeln($ws("Object destroyed.",0));
      (yield* getobj(n));
      obj.numexist=(obj.numexist-1);
      putobj();
    }else if(obj_here(n)){
      slot=find_obj(n);
      if(!(yield* take_obj(n,slot))){
        $writeln($ws("Someone picked it up before you could destroy it.",0));
      }else{
        (yield* log_event(myslot,e_destroy,0,0,(((myname+" has destroyed ")+(yield* obj_part(n,false)))+".")));
        $writeln($ws("Object destroyed.",0));
        (yield* getobj(n));
        obj.numexist=(obj.numexist-1);
        putobj();
      }
    }else{
      $writeln($ws("Such a thing is not here.",0));
    }
  }else{
    $writeln($ws("No such thing can be seen here.",0));
  }
}
function* links_possible(){
  var $ret=false;
  var i=0;
  (yield* gethere());
  $ret=false;
  if((yield* is_owner(location,true))){
    $ret=true;
  }else{
    for(var $e82=maxexit,$ie82=1;$ie82<=$e82;$ie82++){
      i=$ie82;
      if((((here.exits[i].toloc===0))&&((here.exits[i].kind===5)))){
        $ret=true;
      }
    }
  }
  return $ret;
}
/* make a room */
function* do_form(s){
  (yield* gethere());
  if((yield* checkhide())){
    if((yield* links_possible())){
      if((s==="")){
        (yield* grab_line("Room name: ",{get v(){return s},set v($x){s=$x}}));
      }
      s=slead(s);
      (yield* createroom(s));
    }else{
      $writeln($ws("You may not create any new exits here.  Go to a place where you can create",0));
      $writeln($ws("an exit before FORMing a new room.",0));
    }
  }
}
/* loc: integer; forward */
function* xpoof(loc){
  var targslot=0;
  if((yield* put_token(loc,{get v(){return targslot},set v($x){targslot=$x}},here.people[myslot].hiding))){
    if(hiding){
      (yield* log_event(myslot,e_hpoofout,0,0,myname,location));
      (yield* log_event(myslot,e_hpoofin,0,0,myname,loc));
    }else{
      (yield* log_event(myslot,e_poofout,0,0,myname,location));
      (yield* log_event(targslot,e_poofin,0,0,myname,loc));
    }
    (yield* take_token(myslot,location));
    myslot=targslot;
    location=loc;
    (yield* setevent());
    (yield* do_look());
  }else{
    $writeln($ws("There is a crackle of electricity, but the poof fails.",0));
  }
}
function* do_poof(s){
  var n=0;
  var loc=0;
  if(privd){
    (yield* gethere());
    if((yield* lookup_room({get v(){return loc},set v($x){loc=$x}},s))){
      (yield* xpoof(loc));
    }else if((yield* parse_pers({get v(){return n},set v($x){n=$x}},s))){
      (yield* grab_line("What room? ",{get v(){return s},set v($x){s=$x}}));
      if((yield* lookup_room({get v(){return loc},set v($x){loc=$x}},s))){
        (yield* log_event(myslot,e_poofyou,n,loc));
        $writeln("");
        $writeln($ws("You extend your arms, muster some energy, and ",0)+$ws(here.people[n].name_,0)+$ws(" is",0));
        $writeln($ws("engulfed in a cloud of orange smoke.",0));
        $writeln("");
      }else{
        $writeln($ws("There is no room named ",0)+$ws(s,0)+$ws(".",0));
      }
    }else{
      $writeln($ws("There is no room named ",0)+$ws(s,0)+$ws(".",0));
    }
  }else{
    $writeln($ws("Only the Monster Manager may poof.",0));
  }
}
function* link_room(origdir,targdir,targroom){
  /* since exit creation involves the writing of two records,
     	  perhaps there should be a global lock around this code,
     	  such as a get to some obscure index field or something.
     	  I haven't put this in because I don't believe that if this
     	  routine fails it will seriously damage the database.
     
     	  Actually, the lock should be on the test (do_link) but that
     	  would be hard */
  (yield* getroom());
  var $w83=here.exits[origdir];
  $w83.toloc=targroom;
  $w83.kind=1;
  /* type of exit, they can customize later */
  $w83.slot=targdir;
  /* exit it comes out in in target room */
  init_exit(origdir);
  putroom();
  (yield* log_event(myslot,e_newexit,0,0,myname,location));
  if((location!==targroom)){
    (yield* log_event(0,e_newexit,0,0,myname,targroom));
  }
  (yield* getroom(targroom));
  var $w84=here.exits[targdir];
  $w84.toloc=location;
  $w84.kind=1;
  $w84.slot=origdir;
  init_exit(targdir);
  putroom();
  $writeln($ws("Exit created.  Use CUSTOM ",0)+$ws(direct[origdir],0)+$ws(" to customize your exit.",0));
}
/* User procedure to link a room */
function* do_link(s){
  var ok=false;
  var orgexitnam="";
  var targnam="";
  var trgexitnam="";
  var targroom=0;
  var targdir=0;
  var origdir=0;
  /* number of target room */
  /* number of target exit direction */
  /* number of exit direction here */
  var firsttime=false;
  /* gethere;	! done in links_possible */
  if((yield* links_possible())){
    (yield* log_action(link,0));
    if((yield* checkhide())){
      $writeln($ws("Hit return alone at any prompt to terminate exit creation.",0));
      $writeln("");
      if((s==="")){
        firsttime=false;
      }else{
        orgexitnam=bite({get v(){return s},set v($x){s=$x}});
        firsttime=true;
      }
      do{
        if(!(firsttime)){
          (yield* grab_line("Direction of exit? ",{get v(){return orgexitnam},set v($x){orgexitnam=$x}}));
        }else{
          firsttime=false;
        }
        ok=lookup_dir({get v(){return origdir},set v($x){origdir=$x}},orgexitnam);
        if(ok){
          ok=(yield* can_make(origdir));
        }
      }while(!((((orgexitnam===""))||ok)));
      if(ok){
        if((s==="")){
          firsttime=false;
        }else{
          targnam=s;
          firsttime=true;
        }
        do{
          if(!(firsttime)){
            (yield* grab_line("Room to link to? ",{get v(){return targnam},set v($x){targnam=$x}}));
          }else{
            firsttime=false;
          }
          ok=(yield* lookup_room({get v(){return targroom},set v($x){targroom=$x}},targnam));
        }while(!((((targnam===""))||ok)));
      }
      if(ok){
        do{
          $writeln($ws("Exit comes out in target room",0));
          (yield* grab_line("from what direction? ",{get v(){return trgexitnam},set v($x){trgexitnam=$x}}));
          ok=lookup_dir({get v(){return targdir},set v($x){targdir=$x}},trgexitnam);
          if(ok){
            ok=(yield* can_make(targdir,targroom));
          }
        }while(!((((trgexitnam===""))||ok)));
      }
      if(ok){
        /* actually create the exit */
        (yield* link_room(origdir,targdir,targroom));
      }
    }
  }else{
    $writeln($ws("No links are possible here.",0));
  }
}
function* relink_room(origdir,targdir,targroom){
  var tmp=({toloc:0,kind:0,slot:0,exitdesc:0,closed:0,fail:0,success:0,goin:0,comeout:0,hidden:0,objreq:0,alias:"",reqverb:false,reqalias:false,autolook:false});
  var copyslot=0;
  var copyloc=0;
  (yield* gethere());
  $assign(tmp,here.exits[origdir]);
  copyloc=tmp.toloc;
  copyslot=tmp.slot;
  (yield* getroom(targroom));
  $assign(here.exits[targdir],tmp);
  putroom();
  (yield* getroom(copyloc));
  here.exits[copyslot].toloc=targroom;
  here.exits[copyslot].slot=targdir;
  putroom();
  (yield* getroom());
  here.exits[origdir].toloc=0;
  init_exit(origdir);
  putroom();
}
function* do_relink(s){
  var ok=false;
  var orgexitnam="";
  var targnam="";
  var trgexitnam="";
  var targroom=0;
  var targdir=0;
  var origdir=0;
  /* number of target room */
  /* number of target exit direction */
  /* number of exit direction here */
  var firsttime=false;
  (yield* log_action(c_relink,0));
  (yield* gethere());
  if((yield* checkhide())){
    $writeln($ws("Hit return alone at any prompt to terminate exit relinking.",0));
    $writeln("");
    if((s==="")){
      firsttime=false;
    }else{
      orgexitnam=bite({get v(){return s},set v($x){s=$x}});
      firsttime=true;
    }
    do{
      if(!(firsttime)){
        (yield* grab_line("Direction of exit to relink? ",{get v(){return orgexitnam},set v($x){orgexitnam=$x}}));
      }else{
        firsttime=false;
      }
      ok=lookup_dir({get v(){return origdir},set v($x){origdir=$x}},orgexitnam);
      if(ok){
        ok=(yield* can_alter(origdir));
      }
    }while(!((((orgexitnam===""))||ok)));
    if(ok){
      if((s==="")){
        firsttime=false;
      }else{
        targnam=s;
        firsttime=true;
      }
      do{
        if(!(firsttime)){
          (yield* grab_line("Room to relink exit into? ",{get v(){return targnam},set v($x){targnam=$x}}));
        }else{
          firsttime=false;
        }
        ok=(yield* lookup_room({get v(){return targroom},set v($x){targroom=$x}},targnam));
      }while(!((((targnam===""))||ok)));
    }
    if(ok){
      do{
        $writeln($ws("New exit comes out in target room",0));
        (yield* grab_line("from what direction? ",{get v(){return trgexitnam},set v($x){trgexitnam=$x}}));
        ok=lookup_dir({get v(){return targdir},set v($x){targdir=$x}},trgexitnam);
        if(ok){
          ok=(yield* can_make(targdir,targroom));
        }
      }while(!((((trgexitnam===""))||ok)));
    }
    if(ok){
      /* actually create the exit */
      (yield* relink_room(origdir,targdir,targroom));
    }
  }
}
/* print the room default no-go message if there is one;
     otherwise supply the generic "you can't go that way" */
function* default_fail(){
  if((((here.exitfail!==0))&&((here.exitfail!==default_line)))){
    (yield* print_desc(here.exitfail));
  }else{
    $writeln($ws("You can't go that way.",0));
  }
}
function* exit_fail(dir){
  var tmp="";
  if((((dir<1))||((dir>maxexit)))){
    (yield* default_fail());
  }else if(((here.exits[dir].fail===default_line))){
    switch(here.exits[dir].kind){
      case 5:{
        $writeln($ws("There isn't an exit there yet.",0));
        break;
      }
      case 6:{
        $writeln($ws("You don't have the power to go there.",0));
        break;
      }
      default:{
        (yield* default_fail());
      }
    }
  }else if((here.exits[dir].fail!==0)){
    (yield* block_subs(here.exits[dir].fail,myname));
  }
  /* now print the exit failure message for everyone else in the room:
     	if they tried to go through a valid exit,
     	  and the exit has an other-person failure desc, then
     		substitute that one & use;
     
     	if there is a room default other-person failure desc, then
     		print that;
     
     	if they tried to go through a valid exit,
     	  and the exit has no required alias, then
     		print default exit fail
     	else
     		print generic "didn't leave room" message
     
     cases:
     1) valid/alias exit and specific fail message
     2) valid/alias exit and blanket fail message
     3) valid exit (no specific or blanket) "x fails to go [direct]"
     4) alias exit and blanket fail
     5) blanket fail
     6) generic fail */
  if((dir!==0)){
    (yield* log_event(myslot,e_failgo,dir,0));
  }
}
/* (exit_slot: integer)-- declared forward */
function* do_exit(exit_slot){
  var orig_slot=0;
  var targ_slot=0;
  var orig_room=0;
  var enter_slot=0;
  var targ_room=0;
  var doalook=false;
  if((((exit_slot<1))||((exit_slot>6)))){
    (yield* exit_fail(exit_slot));
  }else if((here.exits[exit_slot].toloc>0)){
    (yield* block_subs(here.exits[exit_slot].success,myname));
    orig_slot=myslot;
    orig_room=location;
    targ_room=here.exits[exit_slot].toloc;
    enter_slot=here.exits[exit_slot].slot;
    doalook=here.exits[exit_slot].autolook;
    /* optimization for exit that goes nowhere;
       				  why go nowhere?  For special effects, we
       				  don't want it to take too much time,
       				  the logs are important because they force the
       				  exit descriptions, but actually moving the
       				  player is unnecessary */
    if((orig_room===targ_room)){
      (yield* log_exit(exit_slot,orig_room,orig_slot));
      (yield* log_entry(enter_slot,targ_room,orig_slot));
      /* orig_slot in log_entry 'cause we're not
         				  really going anwhere */
      if(doalook){
        (yield* do_look());
      }
    }else{
      (yield* take_token(orig_slot,orig_room));
      if(!(yield* put_token(targ_room,{get v(){return targ_slot},set v($x){targ_slot=$x}}))){
        /* no room in room! */
        if(!(yield* put_token(orig_room,{get v(){return myslot},set v($x){myslot=$x}}))){
          /* put them back! Quick! */
          $writeln($ws("%Oh no!",0));
          $halt();
        }
      }else{
        (yield* log_exit(exit_slot,orig_room,orig_slot));
        (yield* log_entry(enter_slot,targ_room,targ_slot));
        myslot=targ_slot;
        location=targ_room;
        (yield* setevent());
        if(doalook){
          (yield* do_look());
        }
      }
    }
  }else{
    (yield* exit_fail(exit_slot));
  }
}
function cycle_open(){
  var $ret=false;
  var ch='\0';
  var s="";
  s=systime();
  ch=$ch(s,5);
  if($in(ch,$set(["1","3","5","7","9"]))){
    $ret=true;
  }else{
    $ret=false;
  }
  return $ret;
}
function* which_dir(dir,s){
  var $ret=false;
  var aliasdir=0;
  var exitdir=0;
  var aliasmatch=false;
  var exitmatch=false;
  var aliasexact=false;
  var exitexact=false;
  var exitreq=false;
  s=lowcase(s);
  if((yield* lookup_alias({get v(){return aliasdir},set v($x){aliasdir=$x}},s))){
    aliasmatch=true;
  }else{
    aliasmatch=false;
  }
  if(lookup_dir({get v(){return exitdir},set v($x){exitdir=$x}},s)){
    exitmatch=true;
  }else{
    exitmatch=false;
  }
  if(aliasmatch){
    if((s===here.exits[aliasdir].alias)){
      aliasexact=true;
    }else{
      aliasexact=false;
    }
  }else{
    aliasexact=false;
  }
  if(exitmatch){
    if((((s===direct[exitdir]))||((s===$substr(direct[exitdir],1,1))))){
      exitexact=true;
    }else{
      exitexact=false;
    }
  }else{
    exitexact=false;
  }
  if(exitmatch){
    exitreq=here.exits[exitdir].reqalias;
  }else{
    exitreq=false;
  }
  dir.v=0;
  $ret=true;
  if((aliasexact&&exitexact)){
    dir.v=aliasdir;
  }else if(aliasexact){
    dir.v=aliasdir;
  }else if((exitexact&&!exitreq)){
    dir.v=exitdir;
  }else if(aliasmatch){
    dir.v=aliasdir;
  }else if((exitmatch&&!exitreq)){
    dir.v=exitdir;
  }else if((exitmatch&&exitreq)){
    dir.v=exitdir;
    $ret=false;
  }else{
    $ret=false;
  }
  return $ret;
}
function* exit_case(dir){
  switch(here.exits[dir].kind){
    case 0:{
      (yield* exit_fail(dir));
      break;
    }
    case 1:{
      (yield* do_exit(dir));
      break;
    }
    case 3:{
      /* more checking goes here */
      if(obj_hold(here.exits[dir].objreq)){
        (yield* exit_fail(dir));
      }else{
        (yield* do_exit(dir));
      }
      break;
    }
    case 4:{
      if((rnd100()<34)){
        (yield* do_exit(dir));
      }else{
        (yield* exit_fail(dir));
      }
      break;
    }
    case 2:{
      if(obj_hold(here.exits[dir].objreq)){
        (yield* do_exit(dir));
      }else{
        (yield* exit_fail(dir));
      }
      break;
    }
    case 6:{
      if(obj_hold(here.exits[dir].objreq)){
        (yield* do_exit(dir));
      }else{
        (yield* exit_fail(dir));
      }
      break;
    }
    case 7:{
      if(cycle_open()){
        (yield* do_exit(dir));
      }else{
        (yield* exit_fail(dir));
      }
      break;
    }
  }
}
/* Player wants to go to s
   Handle everthing, this is the top level procedure
   
   Check that he can go to s
   Put him through the exit	( in do_exit )
   Do a look for him		( in do_exit ) */
function* do_go(s,verb=true){
  var dir=0;
  (yield* gethere());
  if((yield* checkhide())){
    if((s.length===0)){
      $writeln($ws("You must give the direction you wish to travel.",0));
    }else{
      if((yield* which_dir({get v(){return dir},set v($x){dir=$x}},s))){
        if((((dir>=1))&&((dir<=maxexit)))){
          if((here.exits[dir].toloc===0)){
            (yield* exit_fail(dir));
          }else{
            (yield* exit_case(dir));
          }
        }else{
          (yield* exit_fail(dir));
        }
      }else{
        (yield* exit_fail(dir));
      }
    }
  }
}
function nice_say(s){
  /* capitalize the first letter of their sentence */
  if($in($ch(s.v,1),$set([...$rng("a","z")]))){
    s.v=$setch(s.v,1,$chr(($ord("A")+(($ord($ch(s.v,1))-$ord("a"))))));
  }
  /* put a period on the end of their sentence if
     			  they don't use any punctuation. */
  if($in($ch(s.v,s.v.length),$set([...$rng("a","z"),...$rng("A","Z")]))){
    s.v=(s.v+".");
  }
}
function* do_say(s){
  if((s.length>0)){
    /* if length(s) + length(myname) > 79 then begin
       			s := substr(s,1,75-length(myname));
       			writeln('Your message was truncated:');
       			writeln('-- ',s);
       		end; */
    nice_say({get v(){return s},set v($x){s=$x}});
    if(hiding){
      (yield* log_event(myslot,e_hidesay,0,0,s));
    }else{
      (yield* log_event(myslot,e_say,0,0,s));
    }
  }else{
    $writeln($ws("To talk to others in the room, type SAY <message>.",0));
  }
}
function* do_setname(s){
  var notice="";
  var ok=false;
  var dummy=0;
  var sprime="";
  (yield* gethere());
  if((s!=="")){
    if((s.length<=shortlen)){
      sprime=lowcase(s);
      if((((sprime==="monster manager"))&&((userid!==mm_userid)))){
        $writeln($ws("Only the Monster Manager can have that personal name.",0));
        ok=false;
      }else if((((sprime==="vice manager"))&&((userid!==mvm_userid)))){
        $writeln($ws("Only the Vice Manager can have that name.",0));
        ok=false;
      }else if((((sprime==="faust"))&&((userid!==faust_userid)))){
        $writeln($ws("You are not Faust!  You may not have that name.",0));
        ok=false;
      }else{
        ok=true;
      }
      if(ok){
        if((yield* exact_pers({get v(){return dummy},set v($x){dummy=$x}},sprime))){
          if((dummy===myslot)){
            ok=true;
          }else{
            $writeln($ws("Someone already has that name.  Your personal name must be unique.",0));
            ok=false;
          }
        }
      }
      if(ok){
        myname=s;
        (yield* getroom());
        notice=here.people[myslot].name_;
        here.people[myslot].name_=s;
        putroom();
        notice=((notice+" is now known as ")+s);
        if(!(hiding)){
          (yield* log_event(0,e_setnam,0,0,notice));
        }
        /* slot 0 means notify this player also */
        (yield* getpers());
        /* note the new personal name in the logfile */
        pers.idents[mylog]=s;
        /* don't lowcase it */
        putpers();
      }
    }else{
      $writeln($ws("Please limit your personal name to ",0)+$wi(shortlen,1)+$ws(" characters.",0));
    }
  }else{
    $writeln($ws("You are known to others as ",0)+$ws(myname,0));
  }
}
function sysdate(){
  var $ret="";
  var thedate="";
  thedate=$date();
  $ret=thedate;
  return $ret;
}
/* 1234567890123456789012345678901234567890
   example display for alignment:
   
          Monster Status
       19-MAR-1988 08:59pm */
function* do_who(){
  var i=0;
  var j=0;
  var ok=false;
  var metaok=false;
  var roomown="";
  (yield* log_event(myslot,e_who,0,($mod(rnd100(),4))));
  /* we need just about everything to print this list:
     		player alloc index, userids, personal names,
     		room names, room owners, and the log record */
  (yield* getindex(i_asleep));
  /* Get index of people who are playing now */
  freeindex();
  (yield* getuser());
  freeuser();
  (yield* getpers());
  freepers();
  (yield* getnam());
  freenam();
  (yield* getown());
  freeown();
  (yield* getint(n_location));
  /* get where they are */
  freeint();
  $writeln($ws("                   Monster Status",0));
  $writeln($ws("                ",0)+$ws(sysdate(),0)+$ws(" ",0)+$ws(systime(),0));
  $writeln("");
  $writeln($ws("Username        Game Name                 Where",0));
  if((privd)){
    /* or has_kind(O_ALLSEEING) */
    metaok=true;
  }else{
    metaok=false;
  }
  for(var $e87=indx.top,$ie87=1;$ie87<=$e87;$ie87++){
    i=$ie87;
    if(!(indx.free[i])){
      $write($ws(user.idents[i],0));
      j=user.idents[i].length;
      while((j<16)){
        $write($ws(" ",0));
        j=(j+1);
      }
      $write($ws(pers.idents[i],0));
      j=pers.idents[i].length;
      while((j<=25)){
        $write($ws(" ",0));
        j=(j+1);
      }
      if(!(metaok)){
        roomown=own.idents[anint.int[i]];
        /* if a person is in a public or disowned room, or
             if they are in the domain of the WHOer, then the player should know
             where they are */
        if(((((roomown===""))||((roomown==="*")))||((roomown===userid)))){
          ok=true;
        }else{
          ok=false;
        }
        /* the player obviously knows where he is */
        if((i===mylog)){
          ok=true;
        }
      }
      if((ok||metaok)){
        $writeln($ws(nam.idents[anint.int[i]],0));
      }else{
        $writeln($ws("n/a",0));
      }
    }
  }
}
function own_trans(s){
  var $ret="";
  if((s==="")){
    $ret="<public>";
  }else if((s==="*")){
    $ret="<disowned>";
  }else{
    $ret=s;
  }
  return $ret;
}
function list_rooms(s){
  var first=false;
  var i=0;
  var j=0;
  var posit=0;
  first=true;
  posit=0;
  for(var $e88=indx.top,$ie88=1;$ie88<=$e88;$ie88++){
    i=$ie88;
    if(((!indx.free[i])&&((own.idents[i]===s)))){
      if((posit===3)){
        posit=1;
        $writeln("");
      }else{
        posit=(posit+1);
      }
      if(first){
        first=false;
        $writeln($ws(own_trans(s),0)+$ws(":",0));
      }
      $write($ws("    ",0)+$ws(nam.idents[i],0));
      for(var $e89=21,$ie89=nam.idents[i].length;$ie89<=$e89;$ie89++){
        j=$ie89;
        $write($ws(" ",0));
      }
    }
  }
  if((posit!==3)){
    $writeln("");
  }
  if(first){
    $writeln($ws("No rooms owned by ",0)+$ws(own_trans(s),0));
  }else{
    $writeln("");
  }
}
function list_all_rooms(){
  var i=0;
  var j=0;
  var tmp=$arr(1,maxroom,()=>false);
  $assign(tmp,void 0);
  list_rooms("");
  /* public rooms first */
  list_rooms("*");
  /* disowned rooms next */
  for(var $e90=indx.top,$ie90=1;$ie90<=$e90;$ie90++){
    i=$ie90;
    if((((!(indx.free[i])&&!(tmp[i]))&&((own.idents[i]!=="")))&&((own.idents[i]!=="*")))){
      list_rooms(own.idents[i]);
      /* player rooms */
      for(var $e91=indx.top,$ie91=1;$ie91<=$e91;$ie91++){
        j=$ie91;
        if((own.idents[j]===own.idents[i])){
          tmp[j]=true;
        }
      }
    }
  }
}
function* do_rooms(s){
  var cmd="";
  var id="";
  var listall=false;
  (yield* getnam());
  freenam();
  (yield* getown());
  freeown();
  (yield* getindex(i_room));
  freeindex();
  listall=false;
  s=lowcase(s);
  cmd=bite({get v(){return s},set v($x){s=$x}});
  if((cmd==="")){
    id=userid;
  }else if((cmd==="public")){
    id="";
  }else if((cmd==="disowned")){
    id="*";
  }else if((cmd==="<public>")){
    id="";
  }else if((cmd==="<disowned>")){
    id="*";
  }else if((cmd==="*")){
    listall=true;
  }else if((cmd.length>veryshortlen)){
    id=$substr(cmd,1,veryshortlen);
  }else{
    id=cmd;
  }
  if(listall){
    if(privd){
      list_all_rooms();
    }else{
      $writeln($ws("You may not obtain a list of all the rooms.",0));
    }
  }else{
    if((((privd||((userid===id)))||((id==="")))||((id==="*")))){
      list_rooms(id);
    }else{
      $writeln($ws("You may not list rooms that belong to another player.",0));
    }
  }
}
function* do_objects(){
  var i=0;
  var total=0;
  var public_=0;
  var disowned=0;
  var private_=0;
  (yield* getobjnam());
  freeobjnam();
  (yield* getobjown());
  freeobjown();
  (yield* getindex(i_object));
  freeindex();
  total=0;
  public_=0;
  disowned=0;
  private_=0;
  $writeln("");
  for(var $e92=indx.top,$ie92=1;$ie92<=$e92;$ie92++){
    i=$ie92;
    if(!(indx.free[i])){
      total=(total+1);
      if((objown.idents[i]==="")){
        $writeln($wi(i,4)+$ws("    ",0)+$ws("<public>",12)+$ws("    ",0)+$ws(objnam.idents[i],0));
        public_=(public_+1);
      }else if((objown.idents[i]==="*")){
        $writeln($wi(i,4)+$ws("    ",0)+$ws("<disowned>",12)+$ws("    ",0)+$ws(objnam.idents[i],0));
        disowned=(disowned+1);
      }else{
        private_=(private_+1);
        if((((objown.idents[i]===userid))||(privd))){
          $writeln($wi(i,4)+$ws("    ",0)+$ws(objown.idents[i],12)+$ws("    ",0)+$ws(objnam.idents[i],0));
        }
      }
    }
  }
  /* >>>>>> */
  $writeln("");
  $writeln($ws("Public:      ",0)+$wi(public_,4));
  $writeln($ws("Disowned:    ",0)+$wi(disowned,4));
  $writeln($ws("Private:     ",0)+$wi(private_,4));
  $writeln($ws("             ----",0));
  $writeln($ws("Total:       ",0)+$wi(total,4));
}
function* do_claim(s){
  var n=0;
  var ok=false;
  var tmp="";
  if((s.length===0)){
    /* claim this room */
    (yield* getroom());
    if((((here.owner==="*"))||(privd))){
      here.owner=userid;
      putroom();
      (yield* getown());
      own.idents[location]=userid;
      putown();
      (yield* log_event(myslot,e_claim,0,0));
      $writeln($ws("You are now the owner of this room.",0));
    }else{
      freeroom();
      if((here.owner==="")){
        $writeln($ws("This is a public room.  You may not claim it.",0));
      }else{
        $writeln($ws("This room has an owner.",0));
      }
    }
  }else if((yield* lookup_obj({get v(){return n},set v($x){n=$x}},s))){
    (yield* getobjown());
    freeobjown();
    if((objown.idents[n]==="")){
      $writeln($ws("That is a public object.  You may DUPLICATE it, but may not CLAIM it.",0));
    }else if((objown.idents[n]!=="*")){
      $writeln($ws("That object has an owner.",0));
    }else{
      (yield* getobj(n));
      freeobj();
      if((obj.numexist===0)){
        ok=true;
      }else{
        if((obj_hold(n)||obj_here(n))){
          ok=true;
        }else{
          ok=false;
        }
      }
      if(ok){
        (yield* getobjown());
        objown.idents[n]=userid;
        putobjown();
        tmp=obj.oname;
        (yield* log_event(myslot,e_objclaim,0,0,tmp));
        $writeln($ws("You are now the owner the ",0)+$ws(tmp,0)+$ws(".",0));
      }else{
        $writeln($ws("You must have one to claim it.",0));
      }
    }
  }else{
    $writeln($ws("There is nothing here by that name to claim.",0));
  }
}
function* do_disown(s){
  var n=0;
  var tmp="";
  if((s.length===0)){
    /* claim this room */
    (yield* getroom());
    if((((here.owner===userid))||(privd))){
      (yield* getroom());
      here.owner="*";
      putroom();
      (yield* getown());
      own.idents[location]="*";
      putown();
      (yield* log_event(myslot,e_disown,0,0));
      $writeln($ws("You have disowned this room.",0));
    }else{
      freeroom();
      $writeln($ws("You are not the owner of this room.",0));
    }
  }else{
    /* disown an object */
    if((yield* lookup_obj({get v(){return n},set v($x){n=$x}},s))){
      (yield* getobj(n));
      freeobj();
      tmp=obj.oname;
      (yield* getobjown());
      if((objown.idents[n]===userid)){
        objown.idents[n]="*";
        putobjown();
        (yield* log_event(myslot,e_objdisown,0,0,tmp));
        $writeln($ws("You are no longer the owner of the ",0)+$ws(tmp,0)+$ws(".",0));
      }else{
        freeobjown();
        $writeln($ws("You are not the owner of any such thing.",0));
      }
    }else{
      $writeln($ws("You are not the owner of any such thing.",0));
    }
  }
}
function* do_public(s){
  var ok=false;
  var tmp="";
  var n=0;
  if(privd){
    if((s.length===0)){
      (yield* getroom());
      here.owner="";
      putroom();
      (yield* getown());
      own.idents[location]="";
      putown();
    }else if((yield* lookup_obj({get v(){return n},set v($x){n=$x}},s))){
      (yield* getobjown());
      freeobjown();
      if((objown.idents[n]==="")){
        $writeln($ws("That is already public.",0));
      }else{
        (yield* getobj(n));
        freeobj();
        if((obj.numexist===0)){
          ok=true;
        }else{
          if((obj_hold(n)||obj_here(n))){
            ok=true;
          }else{
            ok=false;
          }
        }
        if(ok){
          (yield* getobjown());
          objown.idents[n]="";
          putobjown();
          tmp=obj.oname;
          (yield* log_event(myslot,e_objpublic,0,0,tmp));
          $writeln($ws("The ",0)+$ws(tmp,0)+$ws(" is now public.",0));
        }else{
          $writeln($ws("You must have one to claim it.",0));
        }
      }
    }else{
      $writeln($ws("There is nothing here by that name to claim.",0));
    }
  }else{
    $writeln($ws("Only the Monster Manager may make things public.",0));
  }
}
/* sum up the number of real exits in this room */
function find_numexits(){
  var $ret=0;
  var i=0;
  var sum=0;
  sum=0;
  for(var $e93=maxexit,$ie93=1;$ie93<=$e93;$ie93++){
    i=$ie93;
    if((here.exits[i].toloc!==0)){
      sum=(sum+1);
    }
  }
  $ret=sum;
  return $ret;
}
/* clear all people who have played monster and quit in this location
     out of the room so that when they start up again they won't be here,
     because we are destroying this room */
function* clear_people(loc){
  var i=0;
  (yield* getint(n_location));
  for(var $e94=maxplayers,$ie94=1;$ie94<=$e94;$ie94++){
    i=$ie94;
    if((anint.int[i]===loc)){
      anint.int[i]=1;
    }
  }
  putint();
}
function* do_zap(s){
  var loc=0;
  (yield* gethere());
  if((yield* checkhide())){
    if((yield* lookup_room({get v(){return loc},set v($x){loc=$x}},s))){
      (yield* gethere(loc));
      if((((here.owner===userid))||(privd))){
        (yield* clear_people(loc));
        if((find_numpeople()===0)){
          if((find_numexits()===0)){
            if((find_numobjs()===0)){
              (yield* del_room(loc));
              $writeln($ws("Room deleted.",0));
            }else{
              $writeln($ws("You must remove all of the objects from that room first.",0));
            }
          }else{
            $writeln($ws("You must delete all of the exits from that room first.",0));
          }
        }else{
          $writeln($ws("Sorry, you cannot destroy a room if people are still in it.",0));
        }
      }else{
        $writeln($ws("You are not the owner of that room.",0));
      }
    }else{
      $writeln($ws("There is no room named ",0)+$ws(s,0)+$ws(".",0));
    }
  }
}
function* room_nameinuse(num,newname){
  var $ret=false;
  var dummy=0;
  if((yield* exact_obj({get v(){return dummy},set v($x){dummy=$x}},newname))){
    if((dummy===num)){
      $ret=false;
    }else{
      $ret=true;
    }
  }else{
    $ret=false;
  }
  return $ret;
}
function* do_rename(){
  var dummy=0;
  var newname="";
  var s="";
  (yield* gethere());
  $writeln($ws("This room is named ",0)+$ws(here.nicename,0));
  $writeln("");
  (yield* grab_line("New name: ",{get v(){return newname},set v($x){newname=$x}}));
  if((((newname===""))||((newname==="**")))){
    $writeln($ws("No changes.",0));
  }else if((newname.length>shortlen)){
    $writeln($ws("Please limit your room name to ",0)+$wi(shortlen,1)+$ws(" characters.",0));
  }else if((yield* room_nameinuse(location,newname))){
    $writeln($ws(newname,0)+$ws(" is not a unique room name.",0));
  }else{
    (yield* getroom());
    here.nicename=newname;
    putroom();
    (yield* getnam());
    nam.idents[location]=lowcase(newname);
    putnam();
    $writeln($ws("Room name updated.",0));
  }
}
function* obj_nameinuse(objnum,newname){
  var $ret=false;
  var dummy=0;
  if((yield* exact_obj({get v(){return dummy},set v($x){dummy=$x}},newname))){
    if((dummy===objnum)){
      $ret=false;
    }else{
      $ret=true;
    }
  }else{
    $ret=false;
  }
  return $ret;
}
function* do_objrename(objnum){
  var newname="";
  var s="";
  (yield* getobj(objnum));
  freeobj();
  $writeln($ws("This object is named ",0)+$ws(obj.oname,0));
  $writeln("");
  (yield* grab_line("New name: ",{get v(){return newname},set v($x){newname=$x}}));
  if((((newname===""))||((newname==="**")))){
    $writeln($ws("No changes.",0));
  }else if((newname.length>shortlen)){
    $writeln($ws("Please limit your object name to ",0)+$wi(shortlen,1)+$ws(" characters.",0));
  }else if((yield* obj_nameinuse(objnum,newname))){
    $writeln($ws(newname,0)+$ws(" is not a unique object name.",0));
  }else{
    (yield* getobj(objnum));
    obj.oname=newname;
    putobj();
    (yield* getobjnam());
    objnam.idents[objnum]=lowcase(newname);
    putobjnam();
    $writeln($ws("Object name updated.",0));
  }
}
function* view_room(){
  var s="";
  var i=0;
  $writeln("");
  (yield* getnam());
  freenam();
  (yield* getobjnam());
  freeobjnam();
  var $w95=here;
  $writeln($ws("Room:        ",0)+$ws($w95.nicename,0));
  switch($w95.nameprint){
    case 0:{
      $writeln($ws("Room name not printed",0));
      break;
    }
    case 1:{
      $writeln($ws("\"You're in\" precedes room name",0));
      break;
    }
    case 2:{
      $writeln($ws("\"You're at\" precedes room name",0));
      break;
    }
    default:{
      $writeln($ws("Room name printing is damaged.",0));
    }
  }
  $write($ws("Room owner:    ",0));
  if(($w95.owner==="")){
    $writeln($ws("<public>",0));
  }else if(($w95.owner==="*")){
    $writeln($ws("<disowned>",0));
  }else{
    $writeln($ws($w95.owner,0));
  }
  if(($w95.primary===0)){
    $writeln($ws("There is no primary description",0));
  }else{
    $writeln($ws("There is a primary description",0));
  }
  if(($w95.secondary===0)){
    $writeln($ws("There is no secondary description",0));
  }else{
    $writeln($ws("There is a secondary description",0));
  }
  switch($w95.which){
    case 0:{
      $writeln($ws("Only the primary description will print",0));
      break;
    }
    case 1:{
      $writeln($ws("Only the secondary description will print",0));
      break;
    }
    case 2:{
      $writeln($ws("Both the primary and secondary descriptions will print",0));
      break;
    }
    case 3:{
      $writeln($ws("The primary description will print, followed by the seconary description",0));
      $writeln($ws("if the player is holding the magic object",0));
      break;
    }
    case 4:{
      $writeln($ws("If the player is holding the magic object, the secondary description will print",0));
      $writeln($ws("Otherwise, the primary description will print",0));
      break;
    }
    default:{
      $writeln($ws("The way the room description prints is damaged",0));
    }
  }
  $writeln("");
  if(($w95.magicobj===0)){
    $writeln($ws("There is no magic object for this room",0));
  }else{
    $writeln($ws("The magic object for this room is the ",0)+$ws(objnam.idents[$w95.magicobj],0)+$ws(".",0));
  }
  if(($w95.objdrop===0)){
    $writeln($ws("Dropped objects remain here",0));
  }else{
    $writeln($ws("Dropped objects go to ",0)+$ws(nam.idents[$w95.objdrop],0)+$ws(".",0));
    if(($w95.objdesc===0)){
      $writeln($ws("Dropped.",0));
    }else{
      (yield* print_line($w95.objdesc));
    }
    if(($w95.objdest===0)){
      $writeln($ws("Nothing is printed when object \"bounces in\" to target room",0));
    }else{
      (yield* print_line($w95.objdest));
    }
  }
  $writeln("");
  if(($w95.trapto===0)){
    $writeln($ws("There is no trapdoor set",0));
  }else{
    $writeln($ws("The trapdoor sends players ",0)+$ws(direct[$w95.trapto],0)+$ws(" with a chance factor of ",0)+$wi($w95.trapchance,1)+$ws("%",0));
  }
  for(var $e98=maxdetail,$ie98=1;$ie98<=$e98;$ie98++){
    i=$ie98;
    if(($w95.detail[i].length>0)){
      $write($ws("Detail \"",0)+$ws($w95.detail[i],0)+$ws("\" ",0));
      if(($w95.detaildesc[i]>0)){
        $writeln($ws("has a description",0));
      }else{
        $writeln($ws("has no description",0));
      }
    }
  }
  $writeln("");
}
function room_help(){
  $writeln("");
  $writeln($ws("D\tAlter the way the room description prints",0));
  $writeln($ws("N\tChange how the room Name prints",0));
  $writeln($ws("P\tEdit the Primary room description [the default one] (same as desc)",0));
  $writeln($ws("S\tEdit the Secondary room description",0));
  $writeln($ws("X\tDefine a mystery message",0));
  $writeln("");
  $writeln($ws("G\tSet the location that a dropped object really Goes to",0));
  $writeln($ws("O\tEdit the object drop description (for drop effects)",0));
  $writeln($ws("B\tEdit the target room (G) \"bounced in\" description",0));
  $writeln("");
  $writeln($ws("T\tSet the direction that the Trapdoor goes to",0));
  $writeln($ws("C\tSet the Chance of the trapdoor functioning",0));
  $writeln("");
  $writeln($ws("M\tDefine the magic object for this room",0));
  $writeln($ws("R\tRename the room",0));
  $writeln("");
  $writeln($ws("V\tView settings on this room",0));
  $writeln($ws("E\tExit (same as quit)",0));
  $writeln($ws("Q\tQuit (same as exit)",0));
  $writeln($ws("?\tThis list",0));
  $writeln("");
}
function* custom_room(){
  var done=false;
  var prompt="";
  var n=0;
  var s="";
  var newdsc=0;
  var bool=false;
  (yield* log_action(e_custroom,0));
  $writeln("");
  $writeln($ws("Customizing this room",0));
  $writeln($ws("If you would rather be customizing an exit, type CUSTOM <direction of exit>",0));
  $writeln($ws("If you would rather be customizing an object, type CUSTOM <object name>",0));
  $writeln("");
  done=false;
  prompt="Custom> ";
  do{
    do{
      (yield* grab_line(prompt,{get v(){return s},set v($x){s=$x}}));
      s=slead(s);
    }while(!((s.length>0)));
    s=lowcase(s);
    switch($ch(s,1)){
      case "e":case "q":{
        done=true;
        break;
      }
      case "?":case "h":{
        room_help();
        break;
      }
      case "r":{
        (yield* do_rename());
        break;
      }
      case "v":{
        (yield* view_room());
        break;
      }
      case "t":{
        /* dir trapdoor goes */
        (yield* grab_line("What direction does the trapdoor exit through? ",{get v(){return s},set v($x){s=$x}}));
        if((s.length>0)){
          if(lookup_dir({get v(){return n},set v($x){n=$x}},s)){
            (yield* getroom());
            here.trapto=n;
            putroom();
            $writeln($ws("Room updated.",0));
          }else{
            $writeln($ws("No such direction.",0));
          }
        }else{
          $writeln($ws("No changes.",0));
        }
        break;
      }
      case "c":{
        /* chance */
        $writeln($ws("Enter the chance that in any given minute the player will fall through",0));
        $writeln($ws("the trapdoor (0-100) :",0));
        $writeln("");
        (yield* grab_line("? ",{get v(){return s},set v($x){s=$x}}));
        if(isnum(s)){
          n=number(s);
          if($in(n,$set([...$rng(0,100)]))){
            (yield* getroom());
            here.trapchance=n;
            putroom();
          }else{
            $writeln($ws("Out of range.",0));
          }
        }else{
          $writeln($ws("No changes.",0));
        }
        break;
      }
      case "s":{
        newdsc=here.secondary;
        $writeln($ws("[ Editing the secondary room description ]",0));
        if((yield* edit_desc({get v(){return newdsc},set v($x){newdsc=$x}}))){
          (yield* getroom());
          here.secondary=newdsc;
          putroom();
        }
        break;
      }
      case "p":{
        newdsc=here.primary;
        /* same as desc */
        $writeln($ws("[ Editing the primary room description ]",0));
        if((yield* edit_desc({get v(){return newdsc},set v($x){newdsc=$x}}))){
          (yield* getroom());
          here.primary=newdsc;
          putroom();
        }
        break;
      }
      case "o":{
        $writeln($ws("Enter the line that will be printed when someone drops an object here:",0));
        $writeln($ws("If dropped objects do not stay here, you may use a # for the object name.",0));
        $writeln($ws("Right now it says:",0));
        if((here.objdesc===0)){
          $writeln($ws("Dropped. [default]",0));
        }else{
          (yield* print_line(here.objdesc));
        }
        n=here.objdesc;
        (yield* make_line({get v(){return n},set v($x){n=$x}}));
        (yield* getroom());
        here.objdesc=n;
        putroom();
        break;
      }
      case "x":{
        $writeln($ws("Enter a line that will be randomly shown.",0));
        $writeln($ws("Right now it says:",0));
        if((here.objdesc===0)){
          $writeln($ws("[none defined]",0));
        }else{
          (yield* print_line(here.rndmsg));
        }
        n=here.rndmsg;
        (yield* make_line({get v(){return n},set v($x){n=$x}}));
        (yield* getroom());
        here.rndmsg=n;
        putroom();
        break;
      }
      case "b":{
        /* bounced in desc */
        $writeln($ws("Enter the line that will be displayed in the room where an object really",0));
        $writeln($ws("goes when an object dropped here \"bounces\" there:",0));
        $writeln($ws("Place a # where the object name should go.",0));
        $writeln("");
        $writeln($ws("Right now it says:",0));
        if((here.objdest===0)){
          $writeln($ws("Something has bounced into the room.",0));
        }else{
          (yield* print_line(here.objdest));
        }
        n=here.objdest;
        (yield* make_line({get v(){return n},set v($x){n=$x}}));
        (yield* getroom());
        here.objdest=n;
        putroom();
        break;
      }
      case "m":{
        (yield* getobjnam());
        freeobjnam();
        if((here.magicobj===0)){
          $writeln($ws("There is currently no magic object for this room.",0));
        }else{
          $writeln($ws(objnam.idents[here.magicobj],0)+$ws(" is currently the magic object for this room.",0));
        }
        $writeln("");
        (yield* grab_line("New magic object? ",{get v(){return s},set v($x){s=$x}}));
        if((s==="")){
          $writeln($ws("No changes.",0));
        }else if((yield* lookup_obj({get v(){return n},set v($x){n=$x}},s))){
          (yield* getroom());
          here.magicobj=n;
          putroom();
          $writeln($ws("Room updated.",0));
        }else{
          $writeln($ws("No such object found.",0));
        }
        break;
      }
      case "g":{
        (yield* getnam());
        freenam();
        if((here.objdrop===0)){
          $writeln($ws("Objects dropped fall here.",0));
        }else{
          $writeln($ws("Objects dropped fall in ",0)+$ws(nam.idents[here.objdrop],0)+$ws(".",0));
        }
        $writeln("");
        $writeln($ws("Enter * for [this room]:",0));
        (yield* grab_line("Room dropped objects go to? ",{get v(){return s},set v($x){s=$x}}));
        if((s==="")){
          $writeln($ws("No changes.",0));
        }else if((s==="*")){
          (yield* getroom());
          here.objdrop=0;
          putroom();
          $writeln($ws("Room updated.",0));
        }else if((yield* lookup_room({get v(){return n},set v($x){n=$x}},s))){
          (yield* getroom());
          here.objdrop=n;
          putroom();
          $writeln($ws("Room updated.",0));
        }else{
          $writeln($ws("No such room found.",0));
        }
        break;
      }
      case "d":{
        $writeln($ws("Print room descriptions how?",0));
        $writeln("");
        $writeln($ws("0)  Print primary (main) description only [default]",0));
        $writeln($ws("1)  Print only secondary description.",0));
        $writeln($ws("2)  Print both primary and secondary descriptions togther.",0));
        $writeln($ws("3)  Print primary description first; then print secondary description only if",0));
        $writeln($ws("    the player is holding the magic object for this room.",0));
        $writeln($ws("4)  Print secondary if holding the magic obj; print primary otherwise",0));
        $writeln("");
        (yield* grab_line("? ",{get v(){return s},set v($x){s=$x}}));
        if(isnum(s)){
          n=number(s);
          if($in(n,$set([...$rng(0,4)]))){
            (yield* getroom());
            here.which=n;
            putroom();
            $writeln($ws("Room updated.",0));
          }else{
            $writeln($ws("Out of range.",0));
          }
        }else{
          $writeln($ws("No changes.",0));
        }
        break;
      }
      case "n":{
        $writeln($ws("How would you like the room name to print?",0));
        $writeln("");
        $writeln($ws("0) No room name is shown",0));
        $writeln($ws("1) \"You're in ...\"",0));
        $writeln($ws("2) \"You're at ...\"",0));
        $writeln("");
        (yield* grab_line("? ",{get v(){return s},set v($x){s=$x}}));
        if(isnum(s)){
          n=number(s);
          if($in(n,$set([...$rng(0,2)]))){
            (yield* getroom());
            here.nameprint=n;
            putroom();
          }else{
            $writeln($ws("Out of range.",0));
          }
        }else{
          $writeln($ws("No changes.",0));
        }
        break;
      }
      default:{
        $writeln($ws("Bad command, type ? for a list",0));
      }
    }
  }while(!(done));
  (yield* log_event(myslot,e_roomdone,0,0));
}
function* analyze_exit(dir){
  var s="";
  $writeln("");
  (yield* getnam());
  freenam();
  (yield* getobjnam());
  freeobjnam();
  var $w100=here.exits[dir];
  s=$w100.alias;
  if((s==="")){
    s="(no alias)";
  }else{
    s=(("(alias "+s)+")");
  }
  if(here.exits[dir].reqalias){
    s=(s+" (required)");
  }else{
    s=(s+" (not required)");
  }
  if(($w100.toloc!==0)){
    $writeln($ws("The ",0)+$ws(direct[dir],0)+$ws(" exit ",0)+$ws(s,0)+$ws(" goes to ",0)+$ws(nam.idents[$w100.toloc],0));
  }else{
    $writeln($ws("The ",0)+$ws(direct[dir],0)+$ws(" exit goes nowhere.",0));
  }
  if(($w100.hidden!==0)){
    $writeln($ws("Concealed.",0));
  }
  $write($ws("Exit type: ",0));
  switch($w100.kind){
    case 0:{
      $writeln($ws("no exit.",0));
      break;
    }
    case 1:{
      $writeln($ws("Open passage.",0));
      break;
    }
    case 2:{
      $writeln($ws("Door, object required to pass.",0));
      break;
    }
    case 3:{
      $writeln($ws("No passage if holding object.",0));
      break;
    }
    case 4:{
      $writeln($ws("Randomly fails",0));
      break;
    }
    case 5:{
      $writeln($ws("Potential exit.",0));
      break;
    }
    case 6:{
      $writeln($ws("Only exists while holding the required object.",0));
      break;
    }
    case 7:{
      $writeln($ws("Timed exit",0));
      break;
    }
  }
  if(($w100.objreq===0)){
    $writeln($ws("No required object.",0));
  }else{
    $writeln($ws("Required object is: ",0)+$ws(objnam.idents[$w100.objreq],0));
  }
  $writeln("");
  if(($w100.exitdesc===default_line)){
    exit_default(dir,$w100.kind);
  }else{
    (yield* print_line($w100.exitdesc));
  }
  if(($w100.success===0)){
    $writeln($ws("(no success message)",0));
  }else{
    (yield* print_desc($w100.success));
  }
  if(($w100.fail===default_line)){
    if(($w100.kind===5)){
      $writeln($ws("There isn' an exit there yet.",0));
    }else{
      $writeln($ws("You can't go that way.",0));
    }
  }else{
    (yield* print_desc($w100.fail));
  }
  if(($w100.comeout===default_line)){
    $writeln($ws("# has come into the room from: ",0)+$ws(direct[dir],0));
  }else{
    (yield* print_desc($w100.comeout));
  }
  if(($w100.goin===default_line)){
    $writeln($ws("# has gone ",0)+$ws(direct[dir],0));
  }else{
    (yield* print_desc($w100.goin));
  }
  $writeln("");
  if($w100.autolook){
    $writeln($ws("LOOK automatically done after exit used",0));
  }else{
    $writeln($ws("LOOK supressed on exit use",0));
  }
  if($w100.reqverb){
    $writeln($ws("The alias is required to be a verb for exit use",0));
  }else{
    $writeln($ws("The exit can be used with GO or as a verb",0));
  }
  $writeln("");
}
function custom_help(){
  $writeln("");
  $writeln($ws("A\tSet an Alias for the exit",0));
  $writeln($ws("C\tConceal an exit",0));
  $writeln($ws("D\tEdit the exit's main Description",0));
  $writeln($ws("E\tEXIT custom (saves changes)",0));
  $writeln($ws("F\tEdit the exit's failure line",0));
  $writeln($ws("I\tEdit the line that others see when a player goes Into an exit",0));
  $writeln($ws("K\tSet the object that is the Key to this exit",0));
  $writeln($ws("L\tAutomatically look [default] / don't look on exit",0));
  $writeln($ws("O\tEdit the line that people see when a player comes Out of an exit",0));
  $writeln($ws("Q\tQUIT Custom (saves changes)",0));
  $writeln($ws("R\tRequire/don't require alias for exit; ignore direction",0));
  $writeln($ws("S\tEdit the success line",0));
  $writeln($ws("T\tAlter Type of exit (passage, door, etc)",0));
  $writeln($ws("V\tView exit information",0));
  $writeln($ws("X\tRequire/don't require exit name to be a verb",0));
  $writeln($ws("?\tThis list",0));
  $writeln("");
}
function* get_key(dir){
  var s="";
  var n=0;
  (yield* getobjnam());
  freeobjnam();
  if((here.exits[dir].objreq===0)){
    $writeln($ws("Currently there is no key set for this exit.",0));
  }else{
    $writeln($ws(objnam.idents[here.exits[dir].objreq],0)+$ws(" is the current key for this exit.",0));
  }
  $writeln($ws("Enter * for [no key]",0));
  $writeln("");
  (yield* grab_line("What object is the door key? ",{get v(){return s},set v($x){s=$x}}));
  if((s.length>0)){
    if((s==="*")){
      (yield* getroom());
      here.exits[dir].objreq=0;
      putroom();
      $writeln($ws("Exit updated.",0));
    }else if((yield* lookup_obj({get v(){return n},set v($x){n=$x}},s))){
      (yield* getroom());
      here.exits[dir].objreq=n;
      putroom();
      $writeln($ws("Exit updated.",0));
    }else{
      $writeln($ws("There is no object by that name.",0));
    }
  }else{
    $writeln($ws("No changes.",0));
  }
}
function* do_custom(dirnam){
  var prompt="";
  var done=false;
  var s="";
  var dir=0;
  var n=0;
  (yield* gethere());
  if((yield* checkhide())){
    if((dirnam.length===0)){
      if((yield* is_owner(location,true))){
        (yield* custom_room());
      }else{
        $writeln($ws("You are not the owner of this room; you cannot customize it.",0));
        $writeln($ws("However, you may be able to customize some of the exits.  To customize an",0));
        $writeln($ws("exit, type CUSTOM <direction of exit>",0));
      }
    }else if(lookup_dir({get v(){return dir},set v($x){dir=$x}},dirnam)){
      if((yield* can_alter(dir))){
        (yield* log_action(c_custom,0));
        $writeln($ws("Customizing ",0)+$ws(direct[dir],0)+$ws(" exit",0));
        $writeln($ws("If you would rather be customizing this room, type CUSTOM with no arguments",0));
        $writeln($ws("If you would rather be customizing an object, type CUSTOM <object name>",0));
        $writeln("");
        $writeln($ws("Type ** for any line to leave it unchanged.",0));
        $writeln($ws("Type return for any line to select the default.",0));
        $writeln("");
        prompt=$ws("Custom ",0)+$ws(direct[dir],0)+$ws("> ",0);
        done=false;
        do{
          do{
            (yield* grab_line(prompt,{get v(){return s},set v($x){s=$x}}));
            s=slead(s);
          }while(!((s.length>0)));
          s=lowcase(s);
          switch($ch(s,1)){
            case "?":case "h":{
              custom_help();
              break;
            }
            case "q":case "e":{
              done=true;
              break;
            }
            case "k":{
              (yield* get_key(dir));
              break;
            }
            case "c":{
              $writeln($ws("Type the description that a player will see when the exit is found.",0));
              $writeln($ws("Make no text for description to unconceal the exit.",0));
              $writeln("");
              $writeln($ws("[ Editing the \"hidden exit found\" description ]",0));
              n=here.exits[dir].hidden;
              if((yield* edit_desc({get v(){return n},set v($x){n=$x}}))){
                (yield* getroom());
                here.exits[dir].hidden=n;
                putroom();
              }
              break;
            }
            case "r":{
              /* req alias */
              (yield* getroom());
              here.exits[dir].reqalias=!(here.exits[dir].reqalias);
              putroom();
              if(here.exits[dir].reqalias){
                $writeln($ws("The alias for this exit will be required to reference it.",0));
              }else{
                $writeln($ws("The alias will not be required to reference this exit.",0));
              }
              break;
            }
            case "x":{
              /* req verb */
              (yield* getroom());
              here.exits[dir].reqverb=!(here.exits[dir].reqverb);
              putroom();
              if(here.exits[dir].reqverb){
                $writeln($ws("The exit name will be required to be used as a verb to use the exit",0));
              }else{
                $writeln($ws("The exit name may be used with GO or as a verb to use the exit",0));
              }
              break;
            }
            case "l":{
              /* autolook */
              (yield* getroom());
              here.exits[dir].autolook=!(here.exits[dir].autolook);
              putroom();
              if(here.exits[dir].autolook){
                $writeln($ws("A LOOK will be done after the player travels through this exit.",0));
              }else{
                $writeln($ws("The automatic LOOK will not be done when a player uses this exit.",0));
              }
              break;
            }
            case "a":{
              (yield* grab_line("Alternate name for the exit? ",{get v(){return s},set v($x){s=$x}}));
              if((s.length>veryshortlen)){
                $writeln($ws("Your alias must be less than ",0)+$wi(veryshortlen,1)+$ws(" characters.",0));
              }else{
                (yield* getroom());
                here.exits[dir].alias=lowcase(s);
                putroom();
              }
              break;
            }
            case "v":{
              (yield* analyze_exit(dir));
              break;
            }
            case "t":{
              $writeln("");
              $writeln($ws("Select the type of your exit:",0));
              $writeln("");
              $writeln($ws("0) No exit",0));
              $writeln($ws("1) Open passage",0));
              $writeln($ws("2) Door (object required to pass)",0));
              $writeln($ws("3) No passage if holding key",0));
              if(privd){
                $writeln($ws("4) exit randomly fails",0));
              }
              $writeln($ws("6) Exit exists only when holding object",0));
              if(privd){
                $writeln($ws("7) exit opens/closes invisibly every minute",0));
              }
              $writeln("");
              (yield* grab_line("Which type? ",{get v(){return s},set v($x){s=$x}}));
              if(isnum(s)){
                n=number(s);
                if($in(n,$set([...$rng(0,4),...$rng(6,7)]))){
                  (yield* getroom());
                  here.exits[dir].kind=n;
                  putroom();
                  $writeln($ws("Exit type updated.",0));
                  $writeln("");
                  if($in(n,$set([2,6]))){
                    (yield* get_key(dir));
                  }
                }else{
                  $writeln($ws("Bad exit type.",0));
                }
              }else{
                $writeln($ws("Exit type not changed.",0));
              }
              break;
            }
            case "f":{
              $writeln($ws("The failure description will print if the player attempts to go through the",0));
              $writeln($ws("the exit but cannot for any reason.",0));
              $writeln("");
              $writeln($ws("[ Editing the exit failure description ]",0));
              n=here.exits[dir].fail;
              if((yield* edit_desc({get v(){return n},set v($x){n=$x}}))){
                (yield* getroom());
                here.exits[dir].fail=n;
                putroom();
              }
              break;
            }
            case "i":{
              $writeln($ws("Edit the description that other players see when someone goes into",0));
              $writeln($ws("the exit.  Place a # where the player's name should appear.",0));
              $writeln("");
              $writeln($ws("[ Editing the exit \"go in\" description ]",0));
              n=here.exits[dir].goin;
              if((yield* edit_desc({get v(){return n},set v($x){n=$x}}))){
                (yield* getroom());
                here.exits[dir].goin=n;
                putroom();
              }
              break;
            }
            case "o":{
              $writeln($ws("Edit the description that other players see when someone comes out of",0));
              $writeln($ws("the exit.  Place a # where the player's name should appear.",0));
              $writeln("");
              $writeln($ws("[ Editing the exit \"come out of\" description ]",0));
              n=here.exits[dir].comeout;
              if((yield* edit_desc({get v(){return n},set v($x){n=$x}}))){
                (yield* getroom());
                here.exits[dir].comeout=n;
                putroom();
              }
              break;
            }
            case "d":{
              /* main exit desc */
              $writeln($ws("Enter a one line description of the exit.",0));
              $writeln("");
              n=here.exits[dir].exitdesc;
              (yield* make_line({get v(){return n},set v($x){n=$x}}));
              (yield* getroom());
              here.exits[dir].exitdesc=n;
              putroom();
              break;
            }
            case "s":{
              $writeln($ws("The success description will print when the player goes through the exit.",0));
              $writeln("");
              $writeln($ws("[ Editing the exit success description ]",0));
              n=here.exits[dir].success;
              if((yield* edit_desc({get v(){return n},set v($x){n=$x}}))){
                (yield* getroom());
                here.exits[dir].success=n;
                putroom();
              }
              break;
            }
            default:{
              $writeln($ws("-- Bad command, type ? for a list",0));
            }
          }
        }while(!(done));
        (yield* log_event(myslot,e_custdone,0,0));
      }else{
        $writeln($ws("You are not allowed to alter that exit.",0));
      }
    }else if((yield* lookup_obj({get v(){return n},set v($x){n=$x}},dirnam))){
      /* if lookup_obj returns TRUE then dirnam is name of object to custom */
      (yield* do_program(dirnam));
    }else{
      /* customize the object */
      $writeln($ws("To customize this room, type CUSTOM",0));
      $writeln($ws("To customize an exits, type CUSTOM <direction>",0));
      $writeln($ws("To customize an object, type CUSTOM <object name>",0));
    }
  }
}
/* clear_command; */
function* reveal_people(three){
  var retry=0;
  var i=0;
  if(debug){
    $writeln($ws("%revealing people",0));
  }
  three.v=false;
  retry=1;
  do{
    retry=(retry+1);
    i=(($mod(rnd100(),maxpeople))+1);
    if((((here.people[i].hiding>0))&&((i!==myslot)))){
      three.v=true;
      $writeln($ws("You've found ",0)+$ws(here.people[i].name_,0)+$ws(" hiding in the shadows!",0));
      (yield* log_event(myslot,e_foundyou,i,0));
    }
  }while(!((((retry>7))||three.v)));
}
function* reveal_objects(two){
  var tmp="";
  var i=0;
  if(debug){
    $writeln($ws("%revealing objects",0));
  }
  two.v=false;
  for(var $e103=maxobjs,$ie103=1;$ie103<=$e103;$ie103++){
    i=$ie103;
    if((here.objs[i]!==0)){
      /* if there is an object here */
      if(((here.objhide[i]!==0))){
        two.v=true;
        if((here.objhide[i]===default_line)){
          $writeln($ws("You've found ",0)+$ws((yield* obj_part(here.objs[i])),0)+$ws(".",0));
        }else{
          (yield* print_desc(here.objhide[i]));
          (yield* delete_block($rf(here.objhide,i)));
        }
      }
    }
  }
}
function* reveal_exits(one){
  var retry=0;
  var i=0;
  if(debug){
    $writeln($ws("%revealing exits",0));
  }
  one.v=false;
  retry=1;
  do{
    retry=(retry+1);
    i=(($mod(rnd100(),maxexit))+1);
    /* a random exit */
    if((((here.exits[i].hidden!==0))&&(!found_exit[i]))){
      one.v=true;
      found_exit[i]=true;
      /* mark exit as found */
      if((here.exits[i].hidden===default_line)){
        if((here.exits[i].alias==="")){
          $writeln($ws("You've found a hidden exit: ",0)+$ws(direct[i],0)+$ws(".",0));
        }else{
          $writeln($ws("You've found a hidden exit: ",0)+$ws(here.exits[i].alias,0)+$ws(".",0));
        }
      }else{
        (yield* print_desc(here.exits[i].hidden));
      }
    }
  }while(!((((retry>4))||(one.v))));
}
function* do_search(s){
  var chance=0;
  var found=false;
  var dummy=false;
  if((yield* checkhide())){
    chance=rnd100();
    found=false;
    dummy=false;
    if($in(chance,$set([...$rng(1,20)]))){
      (yield* reveal_objects({get v(){return found},set v($x){found=$x}}));
    }else if($in(chance,$set([...$rng(21,40)]))){
      (yield* reveal_exits({get v(){return found},set v($x){found=$x}}));
    }else if($in(chance,$set([...$rng(41,60)]))){
      (yield* reveal_people({get v(){return dummy},set v($x){dummy=$x}}));
    }
    if(found){
      (yield* log_event(myslot,e_found,0,0));
    }else if(!(dummy)){
      (yield* log_event(myslot,e_search,0,0));
      $writeln($ws("You haven't found anything.",0));
    }
  }
}
function* do_unhide(s){
  if((s==="")){
    if(hiding){
      hiding=false;
      (yield* log_event(myslot,e_unhide,0,0));
      (yield* getroom());
      here.people[myslot].hiding=0;
      putroom();
      $writeln($ws("You are no longer hiding.",0));
    }else{
      $writeln($ws("You were not hiding.",0));
    }
  }
}
function* do_hide(s){
  var slot=0;
  var n=0;
  var founddsc=0;
  var tmp="";
  (yield* gethere());
  if((s==="")){
    /* hide yourself */
    /* don't let them hide (or hide better) if people
       			  that they can see are in the room.  Note that the
       			  use of n_can_see instead of find_numpeople will
       			  let them hide if other people are hidden in the
       			  room that they have not seen.  The previously hidden
       			  people will see them hide */
    if((n_can_see()>0)){
      if(hiding){
        $writeln($ws("You can't hide any better with people in the room.",0));
      }else{
        $writeln($ws("You can't hide when people are watching you.",0));
      }
    }else if(((rnd100()>25))){
      if((here.people[myslot].hiding>=4)){
        $writeln($ws("You're pretty well hidden now.  I don't think you could be any less visible.",0));
      }else{
        (yield* getroom());
        here.people[myslot].hiding=(here.people[myslot].hiding+1);
        putroom();
        if(hiding){
          (yield* log_event(myslot,e_noises,rnd100(),0));
          $writeln($ws("You've managed to hide yourself a little better.",0));
        }else{
          (yield* log_event(myslot,e_ihid,0,0));
          $writeln($ws("You've hidden yourself from view.",0));
          hiding=true;
        }
      }
    }else{
      /* unsuccessful */
      if(hiding){
        $writeln($ws("You could not find a better hiding place.",0));
      }else{
        $writeln($ws("You could not find a good hiding place.",0));
      }
    }
  }else{
    /* Hide an object */
    if((yield* parse_obj({get v(){return n},set v($x){n=$x}},s))){
      if(obj_here(n)){
        $writeln($ws("Enter the description the player will see when the object is found:",0));
        $writeln($ws("(if no description is given a default will be supplied)",0));
        $writeln("");
        $writeln($ws("[ Editing the \"object found\" description ]",0));
        founddsc=0;
        if((yield* edit_desc({get v(){return founddsc},set v($x){founddsc=$x}}))){
        }
        if((founddsc===0)){
          founddsc=default_line;
        }
        (yield* getroom());
        slot=find_obj(n);
        here.objhide[slot]=founddsc;
        putroom();
        tmp=(yield* obj_part(n));
        (yield* log_event(myslot,e_hidobj,0,0,tmp));
        $writeln($ws("You have hidden ",0)+$ws(tmp,0)+$ws(".",0));
      }else if(obj_hold(n)){
        $writeln($ws("You'll have to put it down before it can be hidden.",0));
      }else{
        $writeln($ws("I see no such object here.",0));
      }
    }else{
      $writeln($ws("I see no such object here.",0));
    }
  }
}
function* do_punch(s){
  var sock=0;
  var n=0;
  if((s!=="")){
    if((yield* parse_pers({get v(){return n},set v($x){n=$x}},s))){
      if((n===myslot)){
        $writeln($ws("Self-abuse will not be tolerated in the Monster universe.",0));
      }else if(protected_(n)){
        (yield* log_event(myslot,e_trypunch,n,0));
        $writeln($ws("A mystic shield of force prevents you from attacking.",0));
      }else if((here.people[n].username===mm_userid)){
        (yield* log_event(myslot,e_trypunch,n,0));
        $writeln($ws("You can't punch the Monster Manager.",0));
      }else{
        if(hiding){
          hiding=false;
          (yield* getroom());
          here.people[myslot].hiding=0;
          putroom();
          (yield* log_event(myslot,e_hidepunch,n,0));
          $writeln($ws("You pounce unexpectedly on ",0)+$ws(here.people[n].name_,0)+$ws("!",0));
        }else{
          sock=(($mod(rnd100(),numpunches))+1);
          (yield* log_event(myslot,e_punch,n,sock));
          put_punch(sock,here.people[n].name_);
        }
        (yield* wait((1+(random()*3))));
      }
    }else{
      /* Ha ha ha */
      $writeln($ws("That person cannot be seen in this room.",0));
    }
  }else{
    $writeln($ws("To punch somebody, type PUNCH <personal name>.",0));
  }
}
/* support for do_program (custom an object)
     Give the player a list of kinds of object he's allowed to make his object
     and update it */
function* prog_kind(objnum){
  var n=0;
  var s="";
  $writeln($ws("Select the type of your object:",0));
  $writeln("");
  $writeln($ws("0\tOrdinary object (good for door keys)",0));
  $writeln($ws("1\tWeapon",0));
  $writeln($ws("2\tArmor",0));
  $writeln($ws("3\tExit thruster",0));
  if(privd){
    $writeln("");
    $writeln($ws("100\tBag",0));
    $writeln($ws("101\tCrystal Ball",0));
    $writeln($ws("102\tWand of Power",0));
    $writeln($ws("103\tHand of Glory",0));
  }
  $writeln("");
  (yield* grab_line("Which kind? ",{get v(){return s},set v($x){s=$x}}));
  if(isnum(s)){
    n=number(s);
    if((((n>100))&&(privd))){
      $writeln($ws("Out of range.",0));
    }else if($in(n,$set([...$rng(0,3),...$rng(100,103)]))){
      (yield* getobj(objnum));
      obj.kind=n;
      putobj();
      $writeln($ws("Object updated.",0));
    }else{
      $writeln($ws("Out of range.",0));
    }
  }
}
/* support for do_program (custom an object)
     Based on the kind it is allow the
     user to set the various parameters for the effects associated with that
     kind */
function prog_obj(objnum){
}
function show_kind(p){
  switch(p){
    case 0:{
      $writeln($ws("Ordinary object",0));
      break;
    }
    case 1:{
      $writeln($ws("Weapon",0));
      break;
    }
    case 2:{
      $writeln($ws("Armor",0));
      break;
    }
    case 100:{
      $writeln($ws("Bag",0));
      break;
    }
    case 101:{
      $writeln($ws("Crystal Ball",0));
      break;
    }
    case 102:{
      $writeln($ws("Wand of Power",0));
      break;
    }
    case 103:{
      $writeln($ws("Hand of Glory",0));
      break;
    }
    default:{
      $writeln($ws("Bad object type",0));
    }
  }
}
function* obj_view(objnum){
  $writeln("");
  (yield* getobj(objnum));
  freeobj();
  (yield* getobjown());
  freeobjown();
  $writeln($ws("Object name:    ",0)+$ws(obj.oname,0));
  $writeln($ws("Owner:          ",0)+$ws(objown.idents[objnum],0));
  $writeln("");
  show_kind(obj.kind);
  $writeln("");
  if((obj.linedesc===0)){
    $writeln($ws("There is a(n) # here",0));
  }else{
    (yield* print_line(obj.linedesc));
  }
  if((obj.examine===0)){
    $writeln($ws("No inspection description set",0));
  }else{
    (yield* print_desc(obj.examine));
  }
  /* writeln('Worth (in points) of this object: ',obj.worth:1); */
  $writeln($ws("Number in existence: ",0)+$wi(obj.numexist,1));
  $writeln("");
}
function program_help(){
  $writeln("");
  $writeln($ws("A\t\"a\", \"an\", \"some\", etc.",0));
  $writeln($ws("D\tEdit a Description of the object",0));
  $writeln($ws("F\tEdit the GET failure message",0));
  $writeln($ws("G\tSet the object required to pick up this object",0));
  $writeln($ws("1\tSet the get success message",0));
  $writeln($ws("K\tSet the Kind of object this is",0));
  $writeln($ws("L\tEdit the label description (\"There is a ... here.\")",0));
  $writeln($ws("P\tProgram the object based on the kind it is",0));
  $writeln($ws("R\tRename the object",0));
  $writeln($ws("S\tToggle the sticky bit",0));
  $writeln("");
  $writeln($ws("U\tSet the object required for use",0));
  $writeln($ws("2\tSet the place required for use",0));
  $writeln($ws("3\tEdit the use failure description",0));
  $writeln($ws("4\tEdit the use success description",0));
  $writeln($ws("V\tView attributes of this object",0));
  $writeln("");
  $writeln($ws("X\tEdit the extra description",0));
  $writeln($ws("5\tEdit extra desc #2",0));
  $writeln($ws("E\tExit (same as Quit)",0));
  $writeln($ws("Q\tQuit (same as Exit)",0));
  $writeln($ws("?\tThis list",0));
  $writeln("");
}
/* (objnam: string);  declared forward */
function* do_program(objnam){
  var prompt="";
  var done=false;
  var s="";
  var objnum=0;
  var n=0;
  var newdsc=0;
  (yield* gethere());
  if((yield* checkhide())){
    if((objnam.length===0)){
      $writeln($ws("To program an object, type PROGRAM <object name>.",0));
    }else if((yield* lookup_obj({get v(){return objnum},set v($x){objnum=$x}},objnam))){
      if(!(yield* is_owner(location,true))){
        $writeln($ws("You may only work on your objects when you are in one of your own rooms.",0));
      }else if((yield* obj_owner(objnum))){
        (yield* log_action(e_program,0));
        $writeln("");
        $writeln($ws("Customizing object",0));
        $writeln($ws("If you would rather be customizing an EXIT, type CUSTOM <direction of exit>",0));
        $writeln($ws("If you would rather be customizing this room, type CUSTOM",0));
        $writeln("");
        (yield* getobj(objnum));
        freeobj();
        prompt="Custom object> ";
        done=false;
        do{
          do{
            (yield* grab_line(prompt,{get v(){return s},set v($x){s=$x}}));
            s=slead(s);
          }while(!((s.length>0)));
          s=lowcase(s);
          switch($ch(s,1)){
            case "?":case "h":{
              program_help();
              break;
            }
            case "q":case "e":{
              done=true;
              break;
            }
            case "v":{
              (yield* obj_view(objnum));
              break;
            }
            case "r":{
              (yield* do_objrename(objnum));
              break;
            }
            case "g":{
              $writeln($ws("Enter * for no object",0));
              (yield* grab_line("Object required for GET? ",{get v(){return s},set v($x){s=$x}}));
              if((s==="*")){
                (yield* getobj(objnum));
                obj.getobjreq=0;
                putobj();
              }else if((yield* lookup_obj({get v(){return n},set v($x){n=$x}},s))){
                (yield* getobj(objnum));
                obj.getobjreq=n;
                putobj();
                $writeln($ws("Object modified.",0));
              }else{
                $writeln($ws("No such object.",0));
              }
              break;
            }
            case "u":{
              $writeln($ws("Enter * for no object",0));
              (yield* grab_line("Object required for USE? ",{get v(){return s},set v($x){s=$x}}));
              if((s==="*")){
                (yield* getobj(objnum));
                obj.useobjreq=0;
                putobj();
              }else if((yield* lookup_obj({get v(){return n},set v($x){n=$x}},s))){
                (yield* getobj(objnum));
                obj.useobjreq=n;
                putobj();
                $writeln($ws("Object modified.",0));
              }else{
                $writeln($ws("No such object.",0));
              }
              break;
            }
            case "2":{
              $writeln($ws("Enter * for no special place",0));
              (yield* grab_line("Place required for USE? ",{get v(){return s},set v($x){s=$x}}));
              if((s==="*")){
                (yield* getobj(objnum));
                obj.uselocreq=0;
                putobj();
              }else if((yield* lookup_room({get v(){return n},set v($x){n=$x}},s))){
                (yield* getobj(objnum));
                obj.uselocreq=n;
                putobj();
                $writeln($ws("Object modified.",0));
              }else{
                $writeln($ws("No such object.",0));
              }
              break;
            }
            case "s":{
              (yield* getobj(objnum));
              obj.sticky=!(obj.sticky);
              putobj();
              if(obj.sticky){
                $writeln($ws("The object will not be takeable.",0));
              }else{
                $writeln($ws("The object will be takeable.",0));
              }
              break;
            }
            case "a":{
              $writeln("");
              $writeln($ws("Select the article for your object:",0));
              $writeln("");
              $writeln($ws("0)\tNone                ex: \" You have taken Excalibur \"",0));
              $writeln($ws("1)\t\"a\"                 ex: \" You have taken a small box \"",0));
              $writeln($ws("2)\t\"an\"                ex: \" You have taken an empty bottle \"",0));
              $writeln($ws("3)\t\"some\"              ex: \" You have picked up some jelly beans \"",0));
              $writeln($ws("4)     \"the\"               ex: \" You have picked up the Scepter of Power\"",0));
              $writeln("");
              (yield* grab_line("? ",{get v(){return s},set v($x){s=$x}}));
              if(isnum(s)){
                n=number(s);
                if($in(n,$set([...$rng(0,4)]))){
                  (yield* getobj(objnum));
                  obj.particle=n;
                  putobj();
                }else{
                  $writeln($ws("Out of range.",0));
                }
              }else{
                $writeln($ws("No changes.",0));
              }
              break;
            }
            case "k":{
              (yield* prog_kind(objnum));
              break;
            }
            case "p":{
              prog_obj(objnum);
              break;
            }
            case "d":{
              newdsc=obj.examine;
              $writeln($ws("[ Editing the description of the object ]",0));
              if((yield* edit_desc({get v(){return newdsc},set v($x){newdsc=$x}}))){
                (yield* getobj(objnum));
                obj.examine=newdsc;
                putobj();
              }
              break;
            }
            case "x":{
              newdsc=obj.d1;
              $writeln($ws("[ Editing extra description #1 ]",0));
              if((yield* edit_desc({get v(){return newdsc},set v($x){newdsc=$x}}))){
                (yield* getobj(objnum));
                obj.d1=newdsc;
                putobj();
              }
              break;
            }
            case "5":{
              newdsc=obj.d2;
              $writeln($ws("[ Editing extra description #2 ]",0));
              if((yield* edit_desc({get v(){return newdsc},set v($x){newdsc=$x}}))){
                (yield* getobj(objnum));
                obj.d2=newdsc;
                putobj();
              }
              break;
            }
            case "f":{
              newdsc=obj.getfail;
              $writeln($ws("[ Editing the get failure description ]",0));
              if((yield* edit_desc({get v(){return newdsc},set v($x){newdsc=$x}}))){
                (yield* getobj(objnum));
                obj.getfail=newdsc;
                putobj();
              }
              break;
            }
            case "1":{
              newdsc=obj.getsuccess;
              $writeln($ws("[ Editing the get success description ]",0));
              if((yield* edit_desc({get v(){return newdsc},set v($x){newdsc=$x}}))){
                (yield* getobj(objnum));
                obj.getsuccess=newdsc;
                putobj();
              }
              break;
            }
            case "3":{
              newdsc=obj.usefail;
              $writeln($ws("[ Editing the use failure description ]",0));
              if((yield* edit_desc({get v(){return newdsc},set v($x){newdsc=$x}}))){
                (yield* getobj(objnum));
                obj.usefail=newdsc;
                putobj();
              }
              break;
            }
            case "4":{
              newdsc=obj.usesuccess;
              $writeln($ws("[ Editing the use success description ]",0));
              if((yield* edit_desc({get v(){return newdsc},set v($x){newdsc=$x}}))){
                (yield* getobj(objnum));
                obj.usesuccess=newdsc;
                putobj();
              }
              break;
            }
            case "l":{
              $writeln($ws("Enter a one line description of what the object will look like in any room.",0));
              $writeln($ws("Example: \"There is an as unyet described object here.\"",0));
              $writeln("");
              (yield* getobj(objnum));
              freeobj();
              n=obj.linedesc;
              (yield* make_line({get v(){return n},set v($x){n=$x}}));
              (yield* getobj(objnum));
              obj.linedesc=n;
              putobj();
              break;
            }
            default:{
              $writeln($ws("-- Bad command, type ? for a list",0));
            }
          }
        }while(!(done));
        (yield* log_event(myslot,e_objdone,objnum,0));
      }else{
        $writeln($ws("You are not allowed to program that object.",0));
      }
    }else{
      $writeln($ws("There is no object by that name.",0));
    }
  }
}
/* returns TRUE if anything was actually dropped */
/* forward function drop_everything(pslot: integer := 0): boolean; */
function* drop_everything(pslot=0){
  var $ret=false;
  var i=0;
  var slot=0;
  var didone=false;
  var theobj=0;
  var tmp="";
  if((pslot===0)){
    pslot=myslot;
  }
  (yield* gethere());
  didone=false;
  mywield=0;
  mywear=0;
  for(var $e106=maxhold,$ie106=1;$ie106<=$e106;$ie106++){
    i=$ie106;
    if((here.people[pslot].holding[i]!==0)){
      didone=true;
      theobj=here.people[pslot].holding[i];
      slot=find_hold(theobj,pslot);
      if((yield* place_obj(theobj,true))){
        (yield* drop_obj(slot,pslot));
      }else{
        /* no place to put it, it's lost .... */
        (yield* getobj(theobj));
        obj.numexist=(obj.numexist-1);
        putobj();
        tmp=obj.oname;
        $writeln($ws("The ",0)+$ws(tmp,0)+$ws(" was lost.",0));
      }
    }
  }
  $ret=didone;
  return $ret;
}
/* If update is true do_endplay will update the "last play" date & time
     we don't want to do this if this endplay is called from a ping */
function* do_endplay(lognum,ping=false){
  if(!(ping)){
    /* Set the "last date & time of play" */
    (yield* getdate());
    adate.idents[lognum]=((sysdate()+" ")+systime());
    putdate();
  }
  /* Put the player to sleep.  Don't delete his information,
     	  so it can be restored the next time they play. */
  (yield* getindex(i_asleep));
  indx.free[lognum]=true;
  /* Yes, I'm asleep */
  putindex();
}
function* check_person(n,id){
  var $ret=false;
  inmem=false;
  (yield* gethere());
  if((here.people[n].username===id)){
    $ret=true;
  }else{
    $ret=false;
  }
  return $ret;
}
function* nuke_person(n,id){
  var $ret=false;
  var lognum=0;
  var tmp="";
  (yield* getroom());
  if((here.people[n].username===id)){
    /* drop everything they're carrying */
    (yield* drop_everything(n));
    tmp=here.people[n].username;
    /* we'll need this for do_endplay */
    /* Remove the person from the room */
    here.people[n].kind=0;
    here.people[n].username="";
    here.people[n].name_="";
    putroom();
    /* update the log entries for them */
    /* but first we have to find their log number
       			  (mylog for them).  We can do this with a lookup_user
       			  give the userid we got above */
    if((yield* lookup_user({get v(){return lognum},set v($x){lognum=$x}},tmp))){
      (yield* do_endplay(lognum,true));
    }else{
      /* TRUE tells do_endplay not to update the
         				  "time of last play" information 'cause we
         				  don't know how long the "zombie" has been
         				  there. */
      $writeln($ws("%error in nuke_person; can't fing their log number; notify the Monster Manager",0));
    }
    $ret=true;
  }else{
    freeroom();
    $ret=false;
  }
  return $ret;
}
function* ping_player(n,silent=false){
  var $ret=false;
  var retry=0;
  var id="";
  var idname="";
  $ret=false;
  id=here.people[n].username;
  idname=here.people[n].name_;
  retry=0;
  ping_answered=false;
  do{
    retry=(retry+1);
    if(!(silent)){
      $writeln($ws("Sending ping # ",0)+$wi(retry,1)+$ws(" to ",0)+$ws(idname,0)+$ws(" . . .",0));
    }
    (yield* log_event(myslot,e_ping,n,0,myname));
    (yield* wait(1));
    (yield* checkevents(true));
    /* TRUE = don't reprint prompt */
    if(!(ping_answered)){
      if((yield* check_person(n,id))){
        (yield* wait(1));
        (yield* checkevents(true));
      }else{
        ping_answered=true;
      }
    }
    if(!(ping_answered)){
      if((yield* check_person(n,id))){
        (yield* wait(1));
        (yield* checkevents(true));
      }else{
        ping_answered=true;
      }
    }
  }while(!((((retry>=3))||ping_answered)));
  if(!(ping_answered)){
    if(!(silent)){
      $writeln($ws("That person is not responding to your pings . . .",0));
    }
    if((yield* nuke_person(n,id))){
      $ret=true;
      if(!(silent)){
        $writeln($ws(idname,0)+$ws(" shimmers and vanishes from sight.",0));
      }
      (yield* log_event(myslot,e_pingone,n,0,idname));
    }else if(!(silent)){
      $writeln($ws("That person is not a zombie after all.",0));
    }
  }else if(!(silent)){
    $writeln($ws("That person is alive and well.",0));
  }
  return $ret;
}
function* do_ping(s){
  var n=0;
  var dummy=false;
  if((s!=="")){
    if((yield* parse_pers({get v(){return n},set v($x){n=$x}},s))){
      if((n===myslot)){
        $writeln($ws("Don't ping yourself.",0));
      }else{
        dummy=(yield* ping_player(n));
      }
    }else{
      $writeln($ws("You see no person here by that name.",0));
    }
  }else{
    $writeln($ws("To see if someone is really alive, type PING <personal name>.",0));
  }
}
function* list_get(){
  var first=false;
  var i=0;
  first=true;
  for(var $e107=maxobjs,$ie107=1;$ie107<=$e107;$ie107++){
    i=$ie107;
    if((((here.objs[i]!==0))&&((here.objhide[i]===0)))){
      if(first){
        $writeln($ws("Objects that you see here:",0));
        first=false;
      }
      $writeln($ws("   ",0)+$ws((yield* obj_part(here.objs[i])),0));
    }
  }
  if(first){
    $writeln($ws("There is nothing you see here that you can get.",0));
  }
}
/* print the get success message for object number n */
function* p_getsucc(n){
  /* we assume getobj has already been done */
  if((((obj.getsuccess===0))||((obj.getsuccess===default_line)))){
    $writeln($ws("Taken.",0));
  }else{
    (yield* print_desc(obj.getsuccess));
  }
}
function* do_meta_get(n){
  var slot=0;
  if(obj_here(n)){
    if(can_hold()){
      slot=find_obj(n);
      if((yield* take_obj(n,slot))){
        (yield* hold_obj(n));
        (yield* log_event(myslot,e_get,0,0,(((myname+" has picked up ")+(yield* obj_part(n)))+".")));
        /* >>> */
        (yield* p_getsucc(n));
      }else{
        $writeln($ws("Someone got to it before you did.",0));
      }
    }else{
      $writeln($ws("Your hands are full.  You'll have to drop something you're carrying first.",0));
    }
  }else if(obj_hold(n)){
    $writeln($ws("You're already holding that item.",0));
  }else{
    $writeln($ws("That item isn't in an obvious place.",0));
  }
}
function* do_get(s){
  var n=0;
  var ok=false;
  if((s==="")){
    (yield* list_get());
  }else if((yield* parse_obj({get v(){return n},set v($x){n=$x}},s,true))){
    (yield* getobj(n));
    freeobj();
    ok=true;
    if(obj.sticky){
      ok=false;
      (yield* log_event(myslot,e_failget,n,0));
      if((((obj.getfail===0))||((obj.getfail===default_line)))){
        $writeln($ws("You can't take ",0)+$ws((yield* obj_part(n,false)),0)+$ws(".",0));
      }else{
        (yield* print_desc(obj.getfail));
      }
    }else if((obj.getobjreq>0)){
      if(!(obj_hold(obj.getobjreq))){
        ok=false;
        (yield* log_event(myslot,e_failget,n,0));
        if((((obj.getfail===0))||((obj.getfail===default_line)))){
          $writeln($ws("You'll need something first to get the ",0)+$ws((yield* obj_part(n,false)),0)+$ws(".",0));
        }else{
          (yield* print_desc(obj.getfail));
        }
      }
    }
    if(ok){
      (yield* do_meta_get(n));
    }
  /* get the object */
  }else if(lookup_detail({get v(){return n},set v($x){n=$x}},s)){
    $writeln($ws("That detail of this room is here for the enjoyment of all Monster players,",0));
    $writeln($ws("and may not be taken.",0));
  }else{
    $writeln($ws("There is no object here by that name.",0));
  }
}
function* do_drop(s){
  var slot=0;
  var n=0;
  if((s==="")){
    $writeln($ws("To drop an object, type DROP <object name>.",0));
    $writeln($ws("To see what you are carrying, type INV (inventory).",0));
  }else if((yield* parse_obj({get v(){return n},set v($x){n=$x}},s))){
    if(obj_hold(n)){
      (yield* getobj(n));
      freeobj();
      if(obj.sticky){
        $writeln($ws("You can't drop sticky objects.",0));
      }else if(can_drop()){
        slot=find_hold(n);
        if((yield* place_obj(n))){
          (yield* drop_obj(slot));
          (yield* log_event(myslot,e_drop,0,n,(((myname+" has dropped ")+(yield* obj_part(n)))+".")));
          if((mywield===n)){
            mywield=0;
            (yield* getroom());
            here.people[myslot].wielding=0;
            putroom();
          }
          if((mywear===n)){
            mywear=0;
            (yield* getroom());
            here.people[myslot].wearing=0;
            putroom();
          }
        }else{
          $writeln($ws("Someone took the spot where your were going to drop it.",0));
        }
      }else{
        $writeln($ws("It is too cluttered here.  Find somewhere else to drop your things.",0));
      }
    }else{
      $writeln($ws("You're not holding that item.  To see what you're holding, type INV.",0));
    }
  }else{
    $writeln($ws("You're not holding that item.  To see what you're holding, type INVENTORY.",0));
  }
}
function* do_inv(s){
  var first=false;
  var i=0;
  var n=0;
  var objnum=0;
  (yield* gethere());
  if((s==="")){
    (yield* noisehide(50));
    first=true;
    (yield* log_event(myslot,e_invent,0,0));
    for(var $e108=maxhold,$ie108=1;$ie108<=$e108;$ie108++){
      i=$ie108;
      objnum=here.people[myslot].holding[i];
      if((objnum!==0)){
        if(first){
          $writeln($ws("You are holding:",0));
          first=false;
        }
        $writeln($ws("   ",0)+$ws((yield* obj_part(objnum)),0));
      }
    }
    if(first){
      $writeln($ws("You are empty handed.",0));
    }
  }else if((yield* parse_pers({get v(){return n},set v($x){n=$x}},s))){
    first=true;
    (yield* log_event(myslot,e_lookyou,n,0));
    for(var $e109=maxhold,$ie109=1;$ie109<=$e109;$ie109++){
      i=$ie109;
      objnum=here.people[n].holding[i];
      if((objnum!==0)){
        if(first){
          $writeln($ws(here.people[n].name_,0)+$ws(" is holding:",0));
          first=false;
        }
        $writeln($ws("   ",0)+$ws(objnam.idents[objnum],0));
      }
    }
    if(first){
      $writeln($ws(here.people[n].name_,0)+$ws(" is empty handed.",0));
    }
  }else{
    $writeln($ws("To see what someone else is carrying, type INV <personal name>.",0));
  }
}
/* translate a personal name into a real userid on request */
function* do_whois(s){
  var n=0;
  if((yield* lookup_pers({get v(){return n},set v($x){n=$x}},s))){
    (yield* getuser());
    freeuser();
    /* getpers;
       		freepers;	! Already done in lookup_pers ! */
    $writeln($ws(pers.idents[n],0)+$ws(" is ",0)+$ws(user.idents[n],0)+$ws(".",0));
  }else{
    $writeln($ws("There is no one playing with that personal name.",0));
  }
}
function* do_players(s){
  var i=0;
  var j=0;
  var tmpasleep=({indexnum:0,free:$arr(1,maxindex,()=>false),top:0,inuse:0});
  var where_they_are=({intnum:0,int:$zeros(maxplayers)});
  (yield* log_event(myslot,e_players,0,0));
  (yield* getindex(i_asleep));
  /* Rec of bool; False if playing now */
  freeindex();
  $assign(tmpasleep,indx);
  (yield* getindex(i_player));
  /* Rec of valid player log records */
  freeindex();
  /* False if a valid player log */
  (yield* getuser());
  /* Corresponding userids of players */
  freeuser();
  (yield* getpers());
  /* Personal names of players */
  freepers();
  (yield* getdate());
  /* date of last play */
  freedate();
  if(privd){
    (yield* getint(n_location));
    freeint();
    $assign(where_they_are,anint);
    (yield* getnam());
    freenam();
  }
  (yield* getint(n_self));
  freeint();
  $writeln("");
  $writeln($ws("Userid          Personal Name              Last Play",0));
  for(var $e110=maxplayers,$ie110=1;$ie110<=$e110;$ie110++){
    i=$ie110;
    if(!(indx.free[i])){
      $write($ws(user.idents[i],0));
      for(var $e111=15,$ie111=user.idents[i].length;$ie111<=$e111;$ie111++){
        j=$ie111;
        $write($ws(" ",0));
      }
      $write($ws(pers.idents[i],0));
      for(var $e112=21,$ie112=pers.idents[i].length;$ie112<=$e112;$ie112++){
        j=$ie112;
        $write($ws(" ",0));
      }
      if(tmpasleep.free[i]){
        $write($ws(adate.idents[i],0));
        if((adate.idents[i].length<19)){
          for(var $e113=18,$ie113=adate.idents[i].length;$ie113<=$e113;$ie113++){
            j=$ie113;
            $write($ws(" ",0));
          }
        }
      }else{
        $write($ws("   -playing now-   ",0));
      }
      if((((anint.int[i]!==0))&&((anint.int[i]!==default_line)))){
        $write($ws(" * ",0));
      }else{
        $write($ws("   ",0));
      }
      if(privd){
        $write($ws(nam.idents[where_they_are.int[i]],0));
      }
      $writeln("");
    }
  }
  $writeln("");
}
function* do_self(s){
  var n=0;
  if((s.length===0)){
    (yield* log_action(c_self,0));
    $writeln($ws("[ Editing your self description ]",0));
    if((yield* edit_desc({get v(){return myself},set v($x){myself=$x}}))){
      (yield* getroom());
      here.people[myslot].self=myself;
      putroom();
      (yield* getint(n_self));
      anint.int[mylog]=myself;
      putint();
      (yield* log_event(myslot,e_selfdone,0,0));
    }
  }else if((yield* lookup_pers({get v(){return n},set v($x){n=$x}},s))){
    (yield* getint(n_self));
    freeint();
    if((((anint.int[n]===0))||((anint.int[n]===default_line)))){
      $writeln($ws("That person has not made a self-description.",0));
    }else{
      (yield* print_desc(anint.int[n]));
      (yield* log_event(myslot,e_viewself,0,0,pers.idents[n]));
    }
  }else{
    $writeln($ws("There is no person by that name.",0));
  }
}
function do_health(s){
  $write($ws("You ",0));
  switch(myhealth){
    case 9:{
      $writeln($ws("are in exceptional health.",0));
      break;
    }
    case 8:{
      $writeln($ws("are in better than average condition.",0));
      break;
    }
    case 7:{
      $writeln($ws("are in perfect health.",0));
      break;
    }
    case 6:{
      $writeln($ws("feel a little bit dazed.",0));
      break;
    }
    case 5:{
      $writeln($ws("have some minor cuts and abrasions.",0));
      break;
    }
    case 4:{
      $writeln($ws("have some wounds, but are still fairly strong.",0));
      break;
    }
    case 3:{
      $writeln($ws("are suffering from some serious wounds.",0));
      break;
    }
    case 2:{
      $writeln($ws("are very badly wounded.",0));
      break;
    }
    case 1:{
      $writeln($ws("have many serious wounds, and are near death.",0));
      break;
    }
    case 0:{
      $writeln($ws("are dead.",0));
      break;
    }
    default:{
      $writeln($ws("don't seem to be in any condition at all.",0));
    }
  }
}
function* crystal_look(chill_msg){
  var numobj=0;
  var numppl=0;
  var numsee=0;
  var i=0;
  var yes=false;
  $writeln("");
  (yield* print_desc(here.primary));
  (yield* log_event(0,e_chill,chill_msg,0,"",here.locnum));
  numppl=find_numpeople();
  numsee=(n_can_see()+1);
  if((numppl>numsee)){
    $writeln($ws("Someone is hiding here.",0));
  }else if((numppl===0)){
    $writeln($ws("Strange, empty shadows swirl before your eyes.",0));
  }
  if((rnd100()>50)){
    people_header("at this place.");
  }else{
    switch(numppl){
      case 0:{
        $writeln($ws("Vague empty forms drift through your view.",0));
        break;
      }
      case 1:{
        $writeln($ws("You can make out a shadowy figure here.",0));
        break;
      }
      case 2:{
        $writeln($ws("There are two dark figures here.",0));
        break;
      }
      case 3:{
        $writeln($ws("You can see the silhouettes of three people.",0));
        break;
      }
      default:{
        $writeln($ws("Many dark figures can be seen here.",0));
      }
    }
  }
  numobj=find_numobjs();
  if((rnd100()>50)){
    if((rnd100()>50)){
      (yield* show_objects());
    }else if((numobj>0)){
      $writeln($ws("Some objects are here.",0));
    }else{
      $writeln($ws("There are no objects here.",0));
    }
  }else{
    yes=false;
    for(var $e116=maxobjs,$ie116=1;$ie116<=$e116;$ie116++){
      i=$ie116;
      if((here.objhide[i]!==0)){
        yes=true;
      }
    }
    if(yes){
      $writeln($ws("Something is hidden here.",0));
    }
  }
  $writeln("");
}
function* use_crystal(objnum){
  var done=false;
  var s="";
  var n=0;
  var done_msg=0;
  var chill_msg=0;
  var tmp="";
  var i=0;
  if(obj_hold(objnum)){
    (yield* log_action(e_usecrystal,0));
    (yield* getobj(objnum));
    freeobj();
    done_msg=obj.d1;
    chill_msg=obj.d2;
    (yield* grab_line("",{get v(){return s},set v($x){s=$x}}));
    if((yield* lookup_room({get v(){return n},set v($x){n=$x}},s))){
      (yield* gethere(n));
      (yield* crystal_look(chill_msg));
      done=false;
    }else{
      done=true;
    }
    while(!(done)){
      (yield* grab_line("",{get v(){return s},set v($x){s=$x}}));
      if(lookup_dir({get v(){return n},set v($x){n=$x}},s)){
        if((here.exits[n].toloc>0)){
          (yield* gethere(here.exits[n].toloc));
          (yield* crystal_look(chill_msg));
        }
      }else{
        s=lowcase(s);
        tmp=bite({get v(){return s},set v($x){s=$x}});
        if((tmp==="poof")){
          if((yield* lookup_room({get v(){return n},set v($x){n=$x}},s))){
            (yield* gethere(n));
            (yield* crystal_look(chill_msg));
          }else{
            done=true;
          }
        }else if((tmp==="say")){
          i=(($mod(rnd100(),4))+1);
          (yield* log_event(0,e_noise2,i,0,"",n));
        }else{
          done=true;
        }
      }
    }
    (yield* gethere());
    (yield* log_event(myslot,e_donecrystaluse,0,0));
    (yield* print_desc(done_msg));
  }else{
    $writeln($ws("You must be holding it first.",0));
  }
}
function* p_usefail(n){
  /* we assume getobj has already been done */
  if((((obj.usefail===0))||((obj.usefail===default_line)))){
    $writeln($ws("It doesn't work for some reason.",0));
  }else{
    (yield* print_desc(obj.usefail));
  }
}
function* p_usesucc(n){
  /* we assume getobj has already been done */
  if((((obj.usesuccess===0))||((obj.usesuccess===default_line)))){
    $writeln($ws("It seems to work, but nothing appears to happen.",0));
  }else{
    (yield* print_desc(obj.usesuccess));
  }
}
function* do_use(s){
  var n=0;
  if((s.length===0)){
    $writeln($ws("To use an object, type USE <object name>",0));
  }else if((yield* parse_obj({get v(){return n},set v($x){n=$x}},s))){
    (yield* getobj(n));
    freeobj();
    if((((obj.useobjreq>0))&&!(obj_hold(obj.useobjreq)))){
      (yield* log_event(myslot,e_failuse,n,0));
      (yield* p_usefail(n));
    }else if((((obj.uselocreq>0))&&((location!==obj.uselocreq)))){
      (yield* log_event(myslot,e_failuse,n,0));
      (yield* p_usefail(n));
    }else{
      (yield* p_usesucc(n));
      switch(obj.kind){
        case o_bland:{
          break;
        }
        case o_crystal:{
          (yield* use_crystal(n));
          break;
        }
        default:{
        }
      }
    }
  }else{
    $writeln($ws("There is no such object here.",0));
  }
}
function* do_whisper(s){
  var n=0;
  if((s.length===0)){
    $writeln($ws("To whisper to someone, type WHISPER <personal name>.",0));
  }else if((yield* parse_pers({get v(){return n},set v($x){n=$x}},s))){
    if((n===myslot)){
      $writeln($ws("You can't whisper to yourself.",0));
    }else{
      (yield* grab_line(">> ",{get v(){return s},set v($x){s=$x}}));
      if((s.length>0)){
        nice_say({get v(){return s},set v($x){s=$x}});
        (yield* log_event(myslot,e_whisper,n,0,s));
      }else{
        $writeln($ws("Nothing whispered.",0));
      }
    }
  }else{
    $writeln($ws("No such person can be seen here.",0));
  }
}
function* do_wield(s){
  var tmp="";
  var slot=0;
  var n=0;
  if((s.length===0)){
    /* no parms means unwield */
    if((mywield===0)){
      $writeln($ws("You are not wielding anything.",0));
    }else{
      (yield* getobj(mywield));
      freeobj();
      tmp=obj.oname;
      (yield* log_event(myslot,e_unwield,0,0,tmp));
      $writeln($ws("You are no longer wielding the ",0)+$ws(tmp,0)+$ws(".",0));
      mywield=0;
      (yield* getroom());
      here.people[mylog].wielding=0;
      putroom();
    }
  }else if((yield* parse_obj({get v(){return n},set v($x){n=$x}},s))){
    if((mywield!==0)){
      $writeln($ws("You are already wielding ",0)+$ws((yield* obj_part(mywield)),0)+$ws(".",0));
    }else{
      (yield* getobj(n));
      freeobj();
      tmp=obj.oname;
      if((obj.kind===o_weapon)){
        if(obj_hold(n)){
          mywield=n;
          (yield* getroom());
          here.people[myslot].wielding=n;
          putroom();
          (yield* log_event(myslot,e_wield,0,0,tmp));
          $writeln($ws("You are now wielding the ",0)+$ws(tmp,0)+$ws(".",0));
        }else{
          $writeln($ws("You must be holding it first.",0));
        }
      }else{
        $writeln($ws("That is not a weapon.",0));
      }
    }
  }else{
    $writeln($ws("No such weapon can be seen here.",0));
  }
}
function* do_wear(s){
  var tmp="";
  var slot=0;
  var n=0;
  if((s.length===0)){
    /* no parms means unwield */
    if((mywear===0)){
      $writeln($ws("You are not wearing anything.",0));
    }else{
      (yield* getobj(mywear));
      freeobj();
      tmp=obj.oname;
      (yield* log_event(myslot,e_unwear,0,0,tmp));
      $writeln($ws("You are no longer wearing the ",0)+$ws(tmp,0)+$ws(".",0));
      mywear=0;
      (yield* getroom());
      here.people[mylog].wearing=0;
      putroom();
    }
  }else if((yield* parse_obj({get v(){return n},set v($x){n=$x}},s))){
    (yield* getobj(n));
    freeobj();
    tmp=obj.oname;
    if((((obj.kind===o_armor))||((obj.kind===o_cloak)))){
      if(obj_hold(n)){
        mywear=n;
        (yield* getroom());
        here.people[mylog].wearing=n;
        putroom();
        (yield* log_event(myslot,e_wear,0,0,tmp));
        $writeln($ws("You are now wearing the ",0)+$ws(tmp,0)+$ws(".",0));
      }else{
        $writeln($ws("You must be holding it first.",0));
      }
    }else{
      $writeln($ws("That cannot be worn.",0));
    }
  }else{
    $writeln($ws("No such thing can be seen here.",0));
  }
}
function do_brief(){
  brief=!(brief);
  if(brief){
    $writeln($ws("Brief descriptions.",0));
  }else{
    $writeln($ws("Verbose descriptions.",0));
  }
}
function p_door_key(n){
  var $ret="";
  if((n===0)){
    $ret="<none>";
  }else{
    $ret=objnam.idents[n];
  }
  return $ret;
}
function anal_exit(dir){
  if((((here.exits[dir].toloc===0))&&((here.exits[dir].kind!==5)))){
  }else{
    /* no exit here, don't print anything */
    var $w118=here.exits[dir];
    $write($ws(direct[dir],0));
    if(($w118.alias.length>0)){
      $write($ws("(",0)+$ws($w118.alias,0));
      if($w118.reqalias){
        $write($ws(" required): ",0));
      }else{
        $write($ws("): ",0));
      }
    }else{
      $write($ws(": ",0));
    }
    if(((($w118.toloc===0))&&(($w118.kind===5)))){
      $write($ws("accept, no exit yet",0));
    }else if(($w118.toloc>0)){
      $write($ws("to ",0)+$ws(nam.idents[$w118.toloc],0)+$ws(", ",0));
      switch($w118.kind){
        case 0:{
          $write($ws("no exit",0));
          break;
        }
        case 1:{
          $write($ws("open passage",0));
          break;
        }
        case 2:{
          $write($ws("door, key=",0)+$ws(p_door_key($w118.objreq),0));
          break;
        }
        case 3:{
          $write($ws("~door, ~key=",0)+$ws(p_door_key($w118.objreq),0));
          break;
        }
        case 4:{
          $write($ws("exit open randomly",0));
          break;
        }
        case 5:{
          $write($ws("potential exit",0));
          break;
        }
        case 6:{
          $write($ws("xdoor, key=",0)+$ws(p_door_key($w118.objreq),0));
          break;
        }
        case 7:{
          $write($ws("timed exit, now ",0));
          if(cycle_open()){
            $write($ws("open",0));
          }else{
            $write($ws("closed",0));
          }
          break;
        }
      }
      if(($w118.hidden!==0)){
        $write($ws(", hidden",0));
      }
      if($w118.reqverb){
        $write($ws(", reqverb",0));
      }
      if(!($w118.autolook)){
        $write($ws(", autolook off",0));
      }
      if((here.trapto===dir)){
        $write($ws(", trapdoor (",0)+$wi(here.trapchance,1)+$ws("%)",0));
      }
    }
    $writeln("");
  }
}
function* do_s_exits(){
  var i=0;
  var accept=false;
  var one=false;
  /* accept is true if the particular exit is
     				  an "accept" (other players may link there)
     				  one means at least one exit was shown */
  one=false;
  (yield* gethere());
  for(var $e120=maxexit,$ie120=1;$ie120<=$e120;$ie120++){
    i=$ie120;
    if((((here.exits[i].toloc===0))&&((here.exits[i].kind===5)))){
      accept=true;
    }else{
      accept=false;
    }
    if((((yield* can_alter(i)))||(accept))){
      if(!(one)){
        /* first time we do this then */
        (yield* getnam());
        /* read room name list in */
        freenam();
        (yield* getobjnam());
        freeobjnam();
      }
      one=true;
      anal_exit(i);
    }
  }
  if(!(one)){
    $writeln($ws("There are no exits here which you may inspect.",0));
  }
}
function* do_s_object(s){
  var n=0;
  var x=({objnum:0,onum:0,oname:"",kind:0,linedesc:0,home:0,homedesc:0,actindx:0,examine:0,worth:0,numexist:0,sticky:false,getobjreq:0,getfail:0,getsuccess:0,useobjreq:0,uselocreq:0,usefail:0,usesuccess:0,usealias:"",reqalias:false,reqverb:false,particle:0,parms:$zeros(maxparm),d1:0,d2:0,exp3:0,exp4:0,exp5:0,exp6:0});
  if((s.length===0)){
    (yield* grab_line("Object? ",{get v(){return s},set v($x){s=$x}}));
  }
  if((yield* lookup_obj({get v(){return n},set v($x){n=$x}},s))){
    if((yield* obj_owner(n,true))){
      $write($ws((yield* obj_part(n)),0)+$ws(": ",0));
      $write($ws(objown.idents[n],0)+$ws(" is owner",0));
      $assign(x,obj);
      if(x.sticky){
        $write($ws(", sticky",0));
      }
      if((x.getobjreq>0)){
        $write($ws(", ",0)+$ws((yield* obj_part(x.getobjreq)),0)+$ws(" required to get",0));
      }
      if((x.useobjreq>0)){
        $write($ws(", ",0)+$ws((yield* obj_part(x.useobjreq)),0)+$ws(" required to use",0));
      }
      if((x.uselocreq>0)){
        (yield* getnam());
        freenam();
        $write($ws(", used only in ",0)+$ws(nam.idents[x.uselocreq],0));
      }
      if((x.usealias!=="")){
        $write($ws(", use=\"",0)+$ws(x.usealias,0)+$ws("\"",0));
        if(x.reqalias){
          $write($ws(" (required)",0));
        }
      }
      $writeln("");
    }else{
      $writeln($ws("You are not allowed to see the internals of that object.",0));
    }
  }else{
    $writeln($ws("There is no such object.",0));
  }
}
function* do_s_details(){
  var i=0;
  var one=false;
  (yield* gethere());
  one=false;
  for(var $e121=maxdetail,$ie121=1;$ie121<=$e121;$ie121++){
    i=$ie121;
    if((((here.detail[i]!==""))&&((here.detaildesc[i]!==0)))){
      if(!(one)){
        one=true;
        $writeln($ws("Details here that you may inspect:",0));
      }
      $writeln($ws("    ",0)+$ws(here.detail[i],0));
    }
  }
  if(!(one)){
    $writeln($ws("There are no details of this room that you can inspect.",0));
  }
}
function do_s_help(){
  $writeln("");
  $writeln($ws("Exits             Lists exits you can inspect here",0));
  $writeln($ws("Object            Show internals of an object",0));
  $writeln($ws("Details           Show details you can look at in this room",0));
  $writeln("");
}
function* s_show(n,s){
  switch(n){
    case s_exits:{
      (yield* do_s_exits());
      break;
    }
    case s_object:{
      (yield* do_s_object(s));
      break;
    }
    case s_quest:{
      do_s_help();
      break;
    }
    case s_details:{
      (yield* do_s_details());
      break;
    }
  }
}
function* do_y_altmsg(){
  var newdsc=0;
  if((yield* is_owner())){
    (yield* gethere());
    newdsc=here.xmsg2;
    $writeln($ws("[ Editing the alternate mystery message for this room ]",0));
    if((yield* edit_desc({get v(){return newdsc},set v($x){newdsc=$x}}))){
      (yield* getroom());
      here.xmsg2=newdsc;
      putroom();
    }
  }
}
function do_y_help(){
  $writeln("");
  $writeln($ws("Altmsg        Set the alternate mystery message block",0));
  $writeln("");
}
function* do_group1(){
  var grpnam="";
  var loc=0;
  var tmp="";
  if((yield* is_owner())){
    (yield* gethere());
    if((here.grploc1===0)){
      $writeln($ws("No primary group location set",0));
    }else{
      (yield* getnam());
      freenam();
      $writeln($ws("The primary group location is ",0)+$ws(nam.idents[here.grploc1],0)+$ws(".",0));
      $writeln($ws("Descriptor string: [",0)+$ws(here.grpnam1,0)+$ws("]",0));
    }
    $writeln("");
    $writeln($ws("Type * to turn off the primary group location",0));
    (yield* grab_line("Room name of primary group? ",{get v(){return grpnam},set v($x){grpnam=$x}}));
    if((grpnam.length===0)){
      $writeln($ws("No changes.",0));
    }else if((grpnam==="*")){
      (yield* getroom());
      here.grploc1=0;
      putroom();
    }else if((yield* lookup_room({get v(){return loc},set v($x){loc=$x}},grpnam))){
      $writeln($ws("Enter the descriptive string.  It will be placed after player names.",0));
      $writeln($ws("Example:  Monster Manager is [descriptive string, instead of \"here.\"]",0));
      $writeln("");
      (yield* grab_line("Enter string? ",{get v(){return tmp},set v($x){tmp=$x}}));
      if((tmp.length>shortlen)){
        $writeln($ws("Your string was truncated to ",0)+$wi(shortlen,1)+$ws(" characters.",0));
        tmp=$substr(tmp,1,shortlen);
      }
      (yield* getroom());
      here.grploc1=loc;
      here.grpnam1=tmp;
      putroom();
    }else{
      $writeln($ws("No such room.",0));
    }
  }
}
function* do_group2(){
  var grpnam="";
  var loc=0;
  var tmp="";
  if((yield* is_owner())){
    (yield* gethere());
    if((here.grploc2===0)){
      $writeln($ws("No secondary group location set",0));
    }else{
      (yield* getnam());
      freenam();
      $writeln($ws("The secondary group location is ",0)+$ws(nam.idents[here.grploc1],0)+$ws(".",0));
      $writeln($ws("Descriptor string: [",0)+$ws(here.grpnam1,0)+$ws("]",0));
    }
    $writeln("");
    $writeln($ws("Type * to turn off the secondary group location",0));
    (yield* grab_line("Room name of secondary group? ",{get v(){return grpnam},set v($x){grpnam=$x}}));
    if((grpnam.length===0)){
      $writeln($ws("No changes.",0));
    }else if((grpnam==="*")){
      (yield* getroom());
      here.grploc2=0;
      putroom();
    }else if((yield* lookup_room({get v(){return loc},set v($x){loc=$x}},grpnam))){
      $writeln($ws("Enter the descriptive string.  It will be placed after player names.",0));
      $writeln($ws("Example:  Monster Manager is [descriptive string, instead of \"here.\"]",0));
      $writeln("");
      (yield* grab_line("Enter string? ",{get v(){return tmp},set v($x){tmp=$x}}));
      if((tmp.length>shortlen)){
        $writeln($ws("Your string was truncated to ",0)+$wi(shortlen,1)+$ws(" characters.",0));
        tmp=$substr(tmp,1,shortlen);
      }
      (yield* getroom());
      here.grploc2=loc;
      here.grpnam2=tmp;
      putroom();
    }else{
      $writeln($ws("No such room.",0));
    }
  }
}
function* s_set(n,s){
  switch(n){
    case y_quest:{
      do_y_help();
      break;
    }
    case y_altmsg:{
      (yield* do_y_altmsg());
      break;
    }
    case y_group1:{
      (yield* do_group1());
      break;
    }
    case y_group2:{
      (yield* do_group2());
      break;
    }
  }
}
function* do_show(s){
  var n=0;
  var cmd="";
  cmd=bite({get v(){return s},set v($x){s=$x}});
  if((cmd.length===0)){
    (yield* grab_line("Show what attribute? (type ? for a list) ",{get v(){return cmd},set v($x){cmd=$x}}));
  }
  if((cmd.length===0)){
  }else if(lookup_show({get v(){return n},set v($x){n=$x}},cmd)){
    (yield* s_show(n,s));
  }else{
    $writeln($ws("Invalid show option, type SHOW ? for a list.",0));
  }
}
function* do_set(s){
  var n=0;
  var cmd="";
  cmd=bite({get v(){return s},set v($x){s=$x}});
  if((cmd.length===0)){
    (yield* grab_line("Set what attribute? (type ? for a list) ",{get v(){return cmd},set v($x){cmd=$x}}));
  }
  if((cmd.length===0)){
  }else if(lookup_set({get v(){return n},set v($x){n=$x}},cmd)){
    (yield* s_set(n,s));
  }else{
    $writeln($ws("Invalid set option, type SET ? for a list.",0));
  }
}
function* parser(){
  var s="";
  var cmd="";
  var n=0;
  var dummybool=false;
  do{
    (yield* grab_line("> ",{get v(){return s},set v($x){s=$x}}));
    s=slead(s);
  }while(!((s.length>0)));
  if((s===".")){
    s=oldcmd;
  }else{
    oldcmd=s;
  }
  if(((($ch(s,1)==="'"))&&((s.length>1)))){
    (yield* do_say($substr(s,2,(s.length-1))));
  }else{
    cmd=bite({get v(){return s},set v($x){s=$x}});
    switch(lookup_cmd(cmd)){
      case error:{
        /* try exit alias */
        if((((yield* lookup_alias({get v(){return n},set v($x){n=$x}},cmd)))||(lookup_dir({get v(){return n},set v($x){n=$x}},cmd)))){
          (yield* do_go(cmd));
        }else{
          $writeln($ws("Bad command, type ? for a list.",0));
        }
        break;
      }
      case setnam:{
        (yield* do_setname(s));
        break;
      }
      case help:case quest:{
        (yield* show_help());
        break;
      }
      case quit:{
        done=true;
        break;
      }
      case c_l:case look:{
        (yield* do_look(s));
        break;
      }
      case go:{
        (yield* do_go(s,false));
        break;
      }
      case form:{
        /* FALSE = dir not a verb */
        (yield* do_form(s));
        break;
      }
      case link:{
        (yield* do_link(s));
        break;
      }
      case unlink:{
        (yield* do_unlink(s));
        break;
      }
      case poof:{
        (yield* do_poof(s));
        break;
      }
      case desc:{
        (yield* do_describe(s));
        break;
      }
      case say:{
        (yield* do_say(s));
        break;
      }
      case c_rooms:{
        (yield* do_rooms(s));
        break;
      }
      case c_claim:{
        (yield* do_claim(s));
        break;
      }
      case c_disown:{
        (yield* do_disown(s));
        break;
      }
      case c_public:{
        (yield* do_public(s));
        break;
      }
      case c_accept:{
        (yield* do_accept(s));
        break;
      }
      case c_refuse:{
        (yield* do_refuse(s));
        break;
      }
      case c_zap:{
        (yield* do_zap(s));
        break;
      }
      case c_north:case c_n:case c_south:case c_s:case c_east:case c_e:case c_west:case c_w:case c_up:case c_u:case c_down:case c_d:{
        (yield* do_go(cmd));
        break;
      }
      case c_who:{
        (yield* do_who());
        break;
      }
      case c_custom:{
        (yield* do_custom(s));
        break;
      }
      case c_search:{
        (yield* do_search(s));
        break;
      }
      case c_system:{
        (yield* do_system(s));
        break;
      }
      case c_hide:{
        (yield* do_hide(s));
        break;
      }
      case c_unhide:{
        (yield* do_unhide(s));
        break;
      }
      case c_punch:{
        (yield* do_punch(s));
        break;
      }
      case c_ping:{
        (yield* do_ping(s));
        break;
      }
      case c_create:{
        (yield* do_makeobj(s));
        break;
      }
      case c_get:{
        (yield* do_get(s));
        break;
      }
      case c_drop:{
        (yield* do_drop(s));
        break;
      }
      case c_i:case c_inv:{
        (yield* do_inv(s));
        break;
      }
      case c_whois:{
        (yield* do_whois(s));
        break;
      }
      case c_players:{
        (yield* do_players(s));
        break;
      }
      case c_health:{
        do_health(s);
        break;
      }
      case c_duplicate:{
        (yield* do_duplicate(s));
        break;
      }
      case c_version:{
        do_version(s);
        break;
      }
      case c_objects:{
        (yield* do_objects());
        break;
      }
      case c_self:{
        (yield* do_self(s));
        break;
      }
      case c_use:{
        (yield* do_use(s));
        break;
      }
      case c_whisper:{
        (yield* do_whisper(s));
        break;
      }
      case c_wield:{
        (yield* do_wield(s));
        break;
      }
      case c_brief:{
        do_brief();
        break;
      }
      case c_wear:{
        (yield* do_wear(s));
        break;
      }
      case c_destroy:{
        (yield* do_destroy(s));
        break;
      }
      case c_relink:{
        (yield* do_relink(s));
        break;
      }
      case c_unmake:{
        (yield* do_unmake(s));
        break;
      }
      case c_show:{
        (yield* do_show(s));
        break;
      }
      case c_set:{
        (yield* do_set(s));
        break;
      }
      case dbg:{
        debug=!(debug);
        if(debug){
          $writeln($ws("Debugging is on.",0));
        }else{
          $writeln($ws("Debugging is off.",0));
        }
        break;
      }
      default:{
        $writeln($ws("%Parser error, bad return from lookup",0));
      }
    }
    (yield* clear_command());
  }
}
function init(){
  var i=0;
  rndcycle=0;
  location=1;
  /* Great Hall */
  mywield=0;
  /* not initially wearing or weilding any weapon */
  mywear=0;
  myhealth=7;
  /* how healthy they are to start */
  healthcycle=0;
  /* pretty much meaningless at the start */
  userid=lowcase(get_userid());
  if(((userid===mm_userid))){
    myname="Monster Manager";
    privd=true;
  }else if(((userid===mvm_userid))){
    privd=true;
    myname="Vice Manager";
  }else if(((userid===faust_userid))){
    privd=true;
  }else{
    myname=lowcase(userid);
    myname=$setch(myname,1,$chr(($ord("A")+(($ord($ch(myname,1))-$ord("a"))))));
    privd=false;
  }
  numcmds=66;
  show[s_exits]="exits";
  show[s_object]="object";
  show[s_quest]="?";
  show[s_details]="details";
  numshow=4;
  setkey[y_quest]="?";
  setkey[y_altmsg]="altmsg";
  setkey[y_group1]="group1";
  setkey[y_group2]="group2";
  numset=4;
  numspells=0;
  $open(roomfile,(root+"ROOMS.MON"),{access_method:"direct",sharing:"readwrite",history:"unknown"});
  $open(namfile,(root+"NAMS.MON"),{access_method:"direct",sharing:"readwrite",history:"unknown"});
  $open(eventfile,(root+"EVENTS.MON"),{access_method:"direct",sharing:"readwrite",history:"unknown"});
  $open(descfile,(root+"DESC.MON"),{access_method:"direct",sharing:"readwrite",history:"unknown"});
  $open(indexfile,(root+"INDEX.MON"),{access_method:"direct",sharing:"readwrite",history:"unknown"});
  $open(linefile,(root+"LINE.MON"),{access_method:"direct",sharing:"readwrite",history:"unknown"});
  $open(intfile,(root+"INTFILE.MON"),{access_method:"direct",sharing:"readwrite",history:"unknown"});
  $open(objfile,(root+"OBJECTS.MON"),{access_method:"direct",sharing:"readwrite",history:"unknown"});
  $open(spellfile,(root+"SPELLS.MON"),{access_method:"direct",sharing:"readwrite",history:"unknown"});
}
function* welcome_back(mylog){
  var tmp="";
  var sdate="";
  var stime="";
  (yield* getdate());
  freedate();
  $write($ws("Welcome back, ",0)+$ws(myname,0)+$ws(".",0));
  if((myname.length>18)){
    $writeln("");
  }
  $write($ws("  Your last play was on",0));
  if((adate.idents[mylog.v].length<11)){
    $writeln($ws(" ???",0));
  }else{
    sdate=$substr(adate.idents[mylog.v],1,11);
    /* extract the date */
    if((adate.idents[mylog.v].length===19)){
      stime=$substr(adate.idents[mylog.v],13,7);
    }else{
      stime="???";
    }
    if(($ch(sdate,1)===" ")){
      tmp=sdate;
    }else{
      tmp=(" "+sdate);
    }
    if(($ch(stime,1)===" ")){
      tmp=((tmp+" at")+stime);
    }else{
      tmp=((tmp+" at ")+stime);
    }
    $writeln($ws(tmp,0)+$ws(".",0));
  }
  $writeln("");
}
function* loc_ping(){
  var $ret=false;
  var i=0;
  var found=false;
  inmem=false;
  (yield* gethere());
  i=1;
  found=false;
  /* first get the slot that the supposed "zombie" is in */
  while(((!found)&&((i<=maxpeople)))){
    if((here.people[i].name_===myname)){
      found=true;
    }else{
      i=(i+1);
    }
  }
  myslot=0;
  /* setup for ping_player */
  if(found){
    (yield* setevent());
    $ret=(yield* ping_player(i,true));
  }else{
    /* TRUE = silent operation */
    $ret=true;
  }
  return $ret;
}
/* well, if we can't find them, let's assume
   			  that they're not in any room records, so they're
   			  ok . . . Let's hope... */
/* attempt to fix the player using loc_ping if the database incorrectly
     shows someone playing who isn' playing */
function* fix_player(){
  var $ret=false;
  var ok=false;
  $writeln($ws("There may have been some trouble the last time you played.",0));
  $writeln($ws("Trying to fix it . . .",0));
  if((yield* loc_ping())){
    $writeln($ws("All should be fixed now.",0));
    $writeln("");
    $ret=true;
  }else{
    $writeln($ws("Either someone else is playing Monster on your account, or something is",0));
    $writeln($ws("very wrong with the database.",0));
    $writeln("");
    $ret=false;
  }
  return $ret;
}
function* revive_player(mylog){
  var $ret=false;
  var ok=false;
  var i=0;
  var n=0;
  if((yield* exact_user(mylog,userid))){
    /* player has played before */
    (yield* getint(n_location));
    freeint();
    location=anint.int[mylog.v];
    /* Retrieve their old loc */
    (yield* getpers());
    freepers();
    myname=pers.idents[mylog.v];
    /* Retrieve old personal name */
    (yield* getint(n_experience));
    freeint();
    myexperience=anint.int[mylog.v];
    (yield* getint(n_self));
    freeint();
    myself=anint.int[mylog.v];
    (yield* getindex(i_asleep));
    freeindex();
    if(indx.free[mylog.v]){
      /* if player is asleep, all is well */
      ok=true;
    }else{
      /* otherwise, there is one of two possibilities:
         					1) someone on the same account is
         					   playing Monster
         					2) his last play terminated abnormally */
      ok=(yield* fix_player());
    }
    if(ok){
      (yield* welcome_back(mylog));
    }
  }else{
    /* must allocate a log block for the player */
    if((yield* alloc_log(mylog))){
      $writeln($ws("Welcome to Monster, ",0)+$ws(myname,0)+$ws("!",0));
      $writeln($ws("You will start in the Great Hall.",0));
      $writeln("");
      /* Store their userid */
      (yield* getuser());
      user.idents[mylog.v]=lowcase(userid);
      putuser();
      /* Set their initial location */
      (yield* getint(n_location));
      anint.int[mylog.v]=1;
      /* Start out in Great Hall */
      putint();
      location=1;
      (yield* getint(n_experience));
      anint.int[mylog.v]=0;
      putint();
      myexperience=0;
      (yield* getint(n_self));
      anint.int[mylog.v]=0;
      putint();
      myself=0;
      /* initialize the record containing the
         				  level of each spell they have to start;
         				  all start at zero; since the spellfile is
         				  directly parallel with mylog, we can hack
         				  init it here without dealing with SYSTEM */
      $locate(spellfile,mylog.v);
      for(var $e125=maxspells,$ie125=1;$ie125<=$e125;$ie125++){
        i=$ie125;
        spellfile.buf.level[i]=0;
      }
      spellfile.buf.recnum=mylog.v;
      $put(spellfile);
      ok=true;
    }else{
      ok=false;
    }
  }
  if(ok){
    /* Successful, MYLOG is my log slot */
    /* Wake up the player */
    (yield* getindex(i_asleep));
    indx.free[mylog.v]=false;
    /* I'm NOT asleep now */
    putindex();
    /* Set the "last date of play" */
    (yield* getdate());
    adate.idents[mylog.v]=((sysdate()+" ")+systime());
    putdate();
  }else{
    $writeln($ws("There is no place for you in Monster.  Contact the Monster Manager.",0));
  }
  $ret=ok;
  return $ret;
}
function* enter_universe(){
  var $ret=false;
  var orignam="";
  var dummy=0;
  var i=0;
  var ok=false;
  /* take MYNAME given to us by init or revive_player and make
     		  sure it's unique.  If it isn't tack _1, _2, etc onto it 
     		  until it is.  Code must come before alloc_log, or there
     		  will be an invalid pers record in there cause we aren't in yet */
  orignam=myname;
  i=0;
  do{
    /* tack _n onto pers name until a unique one is found */
    ok=true;
    /* *** Should this use exact_pers instead?  Is this a copy of exact_pers code? */
    if((yield* lookup_pers({get v(){return dummy},set v($x){dummy=$x}},myname))){
      if((lowcase(pers.idents[dummy])===lowcase(myname))){
        ok=false;
        i=(i+1);
        myname=$ws(orignam,0)+$ws("_",0)+$wi(i,1);
      }
    }
  }while(!(ok));
  if((yield* revive_player({get v(){return mylog},set v($x){mylog=$x}}))){
    if((yield* put_token(location,{get v(){return myslot},set v($x){myslot=$x}}))){
      (yield* getpers());
      pers.idents[mylog]=myname;
      putpers();
      $ret=true;
      (yield* log_begin(location));
      (yield* setevent());
      (yield* do_look());
    }else{
      $writeln($ws("put_token failed.",0));
      $ret=false;
    }
  }else{
    $writeln($ws("revive_player failed.",0));
    $ret=false;
  }
  return $ret;
}
function* leave_universe(){
  var diddrop=false;
  diddrop=(yield* drop_everything());
  (yield* take_token(myslot,location));
  (yield* log_quit(location,diddrop));
  (yield* do_endplay(mylog));
  $writeln($ws("You vanish in a brilliant burst of multicolored light.",0));
  if(diddrop){
    $writeln($ws("All of your belongings drop to the ground.",0));
  }
}
function* $main(){
  done=false;
  setup_guts();
  init();
  (yield* prestart());
  if(!(done)){
    if((yield* enter_universe())){
      do{
        (yield* parser());
      }while(!(done));
      (yield* leave_universe());
    }else{
      $writeln($ws("You attempt to enter the Monster universe, but a strange force repels you.",0));
    }
  }
  finish_guts();
}
return $main;
}
P.command({names:['monster'],noHelpFlag:true,run:function(a,raw,words){
  $o='';
  $drive($program()(),function(){});
}});
})(window.Phosphor);
