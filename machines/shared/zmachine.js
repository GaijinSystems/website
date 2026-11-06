/* PHOSPHOR-9 terminal: a Z-machine, version 3, to the Z-Machine Standard 1.1, and the screen it plays on.
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE. The stories it runs have their own notice,
   in zork1-story.js and zork2-story.js.

   Differences from a real one, on purpose: output stream 2 (SCRIPT) has no printer, so the game's words about it
   are all that happens. A saved game is kept in this browser under a name, not in a Quetzal file. split_window
   and set_window do nothing, as these stories never call them. A store above dynamic memory is dropped: Zork II release 63
   makes one, from a PICK-ONE on a table with no counter (the FANTASIES of its wizard), then prints whatever that finds.
   Frotz stops there with a fatal error. RANDOM is the generator Frotz uses, so a transcript
   can be compared with one from dfrotz given the same seed. */
(function(P){
'use strict';
var SLICE=200000,MAXFRAMES=1024,MAXSTACK=32768,LOG=600;
var A=['abcdefghijklmnopqrstuvwxyz','ABCDEFGHIJKLMNOPQRSTUVWXYZ',' \n0123456789.,!?_#\'"/\\-:()'];

function bad(what){return new Error(what)}
function s16(v){return v<<16>>16}

/* run(n) carries on for up to n instructions and says why it stopped: 'more', 'read', 'save', 'restore' or 'quit'.
   After 'read', answer(line). After 'save' or 'restore', state() or load(state), then settled(ok).
   io.print(text) and io.status(room,a,b,isTime) are all it needs from outside. */
function create(story,io,seed){
  var size=story.length,mem,stack,frames,loc,pc,halted,streams,screenOn,sumCache=null;
  var version=story[0],rnd=seed|0,interval=0,counter=0,textBuf=0,parseBuf=0;
  if(version!==3)throw bad('not a version 3 story');
  mem=new Uint8Array(Math.max(65536,size));
  var ALWAYS=rw0(0x0e),GLOBALS=rw0(0x0c),OBJECTS=rw0(0x0a),DICT=rw0(0x08),ABBREV=rw0(0x18);
  if(ALWAYS>size||GLOBALS+480>ALWAYS||OBJECTS>ALWAYS||DICT>=size||ABBREV>=size)throw bad('damaged story');
  function rw0(a){return story[a]<<8|story[a+1]}

  function reset(){
    var keep=mem[0x11]&3,was=!!stack;
    mem.fill(0);mem.set(story);
    mem[1]=mem[1]&~0x50|0x20;               /* status line, fixed pitch; split screen claimed as Frotz does, because Zork II's
                                               parser, when confused, reads the word at address 0, so this byte shows in its replies */
    if(was)mem[0x11]=mem[0x11]&~3|keep;     /* transcripting and fixed pitch outlive a restart */
    mem[0x32]=1;mem[0x33]=1;                /* the Standard it follows */
    stack=[];frames=[{pc:0,st:-1,base:0,loc:[]}];loc=frames[0].loc;
    pc=rw(6);halted=false;streams=[];screenOn=true;
    interval=0;counter=0;rnd=seed|0;
  }
  function rw(a){return mem[a]<<8|mem[a+1]}
  function wb(a,v){if(a<ALWAYS)mem[a]=v}
  function ww(a,v){wb(a,v>>8&255);wb(a+1,v&255)}

  /* ---------- text ---------- */
  function zscii(c){return c===13?'\n':c===10||c>=32&&c<127?String.fromCharCode(c):c===0?'':'?'}
  function decode(a,inner,to){ /* the string at a; to, if given, gets the address after it. Never fails: see the note on stores */
    var s='',shift=0,st=0,hi=0,w,i,c;
    do{
      if(a+1>=size)break;
      w=rw(a);a+=2;
      for(i=10;i>=0;i-=5){
        c=w>>i&31;
        if(st===1){st=0;if(!inner)s+=decode(rw(ABBREV+2*(32*(hi-1)+c))*2,true);continue}
        if(st===2){hi=c;st=3;continue}
        if(st===3){st=0;s+=zscii(hi<<5|c);continue}
        if(c===0){s+=' ';shift=0}
        else if(c<4){hi=c;st=1;shift=0}
        else if(c<6)shift=c-3;
        else{
          if(shift===2&&c===6)st=2;
          else s+=A[shift].charAt(c-6);
          shift=0;
        }
      }
    }while(!(w&0x8000));
    if(to)to.a=a;
    return s;
  }
  function print(s){
    if(streams.length){ /* stream 3 takes everything, and goes to no other stream */
      var t=streams[streams.length-1];
      for(var i=0;i<s.length;i++){wb((t.at+2+t.n)&0xffff,s.charCodeAt(i)===10?13:s.charCodeAt(i));t.n++}
      return;
    }
    if(screenOn&&s)io.print(s);
  }
  function encode(w){ /* a word as a dictionary key: six z-characters in two 16-bit words */
    var z=[],i,c,k;
    for(i=0;i<w.length&&z.length<6;i++){
      c=w.charAt(i);
      if((k=A[0].indexOf(c))>=0)z.push(k+6);
      else if((k=A[2].indexOf(c))>=0&&c!==' '&&c!=='\n')z.push(5,k+6);
      else{k=c.charCodeAt(0);z.push(5,6,k>>5&31,k&31)}
    }
    while(z.length<6)z.push(5);
    return [z[0]<<10|z[1]<<5|z[2],z[3]<<10|z[4]<<5|z[5]|0x8000];
  }
  function lookup(w){
    var n=mem[DICT],len=mem[DICT+n+1],count=s16(rw(DICT+n+2)),base=DICT+n+4,key=encode(w),lo=0,hi=count-1,mid,a,d;
    if(count<0){count=-count;for(mid=0;mid<count;mid++){a=base+mid*len;if(rw(a)===key[0]&&rw(a+2)===key[1])return a}return 0}
    while(lo<=hi){
      mid=(lo+hi)>>1;a=base+mid*len;
      d=rw(a)-key[0]||rw(a+2)-key[1];
      if(d===0)return a;
      if(d<0)lo=mid+1;else hi=mid-1;
    }
    return 0;
  }
  function tokenise(buf,parse){
    var n=mem[DICT],seps='',i,j,text='',max=mem[parse],words=0,w;
    for(i=0;i<n;i++)seps+=String.fromCharCode(mem[DICT+1+i]);
    for(i=buf+1;mem[i]!==0&&i<size;i++)text+=String.fromCharCode(mem[i]);
    for(i=0;i<text.length&&words<max;){
      if(text.charAt(i)===' '){i++;continue}
      j=i+1;
      if(seps.indexOf(text.charAt(i))<0)while(j<text.length&&text.charAt(j)!==' '&&seps.indexOf(text.charAt(j))<0)j++;
      w=text.slice(i,j);
      ww(parse+2+words*4,lookup(w));
      wb(parse+4+words*4,w.length);
      wb(parse+5+words*4,i+1);
      words++;i=j;
    }
    wb(parse+1,words);
  }

  /* ---------- objects ---------- */
  function obj(o){return OBJECTS+62+(o-1)*9}
  function remove(o){
    var a=obj(o),p=mem[a+4],sib=mem[a+5],x;
    if(!p)return;
    x=obj(p);
    if(mem[x+6]===o)wb(x+6,sib);
    else{
      x=mem[x+6];
      for(var n=0;x&&mem[obj(x)+5]!==o;n++){if(n>255)throw bad('object tree loop');x=mem[obj(x)+5]} /* 255 objects at most: more is a loop */
      if(x)wb(obj(x)+5,sib);
    }
    wb(a+4,0);wb(a+5,0);
  }
  function firstProp(o){var a=rw(obj(o)+7);return a+1+2*mem[a]}
  function propAddr(o,p){ /* the size byte of property p, or 0 */
    var a=firstProp(o),b;
    while((b=mem[a])){
      if((b&31)===p)return a;
      if((b&31)<p)return 0;
      a+=2+(b>>5);
    }
    return 0;
  }
  function objName(o){var a=rw(obj(o)+7);return mem[a]?decode(a+1):''}
  function roomName(){var o=getv(16);return o?objName(o):''}
  function showStatus(){io.status(roomName(),s16(getv(17)),s16(getv(18)),!!(mem[1]&2))}

  /* ---------- variables and control ---------- */
  function top(){if(stack.length<=frames[frames.length-1].base)throw bad('stack underflow');return stack.length-1}
  function pop(){top();return stack.pop()}
  function push(v){if(stack.length>=MAXSTACK)throw bad('stack overflow');stack.push(v&0xffff)}
  function getv(v){
    if(v===0)return pop();
    if(v<16){if(v>loc.length)throw bad('no local '+v);return loc[v-1]}
    return rw(GLOBALS+2*(v-16));
  }
  function setv(v,x){
    x&=0xffff;
    if(v===0)push(x);
    else if(v<16){if(v>loc.length)throw bad('no local '+v);loc[v-1]=x}
    else ww(GLOBALS+2*(v-16),x);
  }
  function peek(v){return v===0?stack[top()]:getv(v)}             /* by reference, the stack stays put */
  function poke(v,x){if(v===0)stack[top()]=x&0xffff;else setv(v,x)}
  function store(x){setv(mem[pc++],x)}
  function ret(x){
    if(frames.length<2)throw bad('return from the main routine');
    var f=frames.pop();
    stack.length=f.base;pc=f.pc;loc=frames[frames.length-1].loc;
    setv(f.st,x);
  }
  function branch(c){
    var b=mem[pc++],off=b&63;
    if(!(b&0x40)){off=off<<8|mem[pc++];if(off&0x2000)off-=0x4000}
    if(!!(b&0x80)===!!c){
      if(off===0)ret(0);else if(off===1)ret(1);else pc+=off-2;
    }
  }
  function call(pa,args,n){
    var st=mem[pc++],a=pa*2,L,i,l=[];
    if(pa===0){setv(st,0);return}
    if(a>=size||(L=mem[a])>15)throw bad('bad routine '+a);
    if(frames.length>=MAXFRAMES)throw bad('call stack overflow');
    a++;
    for(i=0;i<L;i++,a+=2)l.push(i<n?args[i]:rw(a));
    frames.push({pc:pc,st:st,base:stack.length,loc:l});
    loc=l;pc=a;
  }
  function random(r){
    r=s16(r);
    if(r<=0){
      if(r===0){rnd=Math.floor(Math.random()*0x7fffffff);interval=0}
      else if(r>-1000){counter=0;interval=-r}
      else{rnd=-r;interval=0}
      return 0;
    }
    var x;
    if(interval){x=counter++;if(counter===interval)counter=0}
    else{rnd=(Math.imul(rnd,0x015a4e35)+1)|0;x=rnd>>>16&0x7fff}
    return x%r+1;
  }
  function verify(){
    if(sumCache===null){
      var len=Math.min(rw0(0x1a)*2||size,size),sum=0;
      for(var i=0x40;i<len;i++)sum+=story[i];
      sumCache=sum&0xffff;
    }
    return sumCache===rw0(0x1c);
  }

  /* ---------- the instruction loop ---------- */
  var args=[0,0,0,0];
  function run(limit){
    var op,form,n,x,y,a,b,t,i;
    if(halted)return 'quit';
    for(;limit>0;limit--){
      op=mem[pc++];
      if(op<0x80){
        args[0]=op&0x40?getv(mem[pc++]):mem[pc++];
        args[1]=op&0x20?getv(mem[pc++]):mem[pc++];
        n=2;form=2;x=op&31;
      }
      else if(op<0xb0){
        t=op>>4&3;n=1;form=1;x=op&15;
        if(t===0){args[0]=mem[pc]<<8|mem[pc+1];pc+=2}
        else if(t===1)args[0]=mem[pc++];
        else args[0]=getv(mem[pc++]);
      }
      else if(op<0xc0){form=0;x=op&15;n=0}
      else{
        t=mem[pc++];n=0;
        for(i=6;i>=0;i-=2){
          y=t>>i&3;
          if(y===3)break;
          if(y===0){args[n++]=mem[pc]<<8|mem[pc+1];pc+=2}
          else if(y===1)args[n++]=mem[pc++];
          else args[n++]=getv(mem[pc++]);
        }
        form=op<0xe0?2:3;x=op&31;
      }
      a=args[0];b=args[1];
      if(form===2)switch(x){
        case 1:
          y=false;
          for(i=1;i<n;i++)if(a===args[i])y=true;
          branch(y);break;
        case 2:branch(s16(a)<s16(b));break;
        case 3:branch(s16(a)>s16(b));break;
        case 4:y=s16(peek(a)-1);poke(a,y);branch(y<s16(b));break;
        case 5:y=s16(peek(a)+1);poke(a,y);branch(y>s16(b));break;
        case 6:branch(a?mem[obj(a)+4]===b:b===0);break;
        case 7:branch((a&b)===b);break;
        case 8:store(a|b);break;
        case 9:store(a&b);break;
        case 10:branch(a&&b<32&&mem[obj(a)+(b>>3)]&0x80>>(b&7));break;
        case 11:if(a&&b<32)wb(obj(a)+(b>>3),mem[obj(a)+(b>>3)]|0x80>>(b&7));break;
        case 12:if(a&&b<32)wb(obj(a)+(b>>3),mem[obj(a)+(b>>3)]&~(0x80>>(b&7)));break;
        case 13:poke(a,b);break;
        case 14:
          if(a&&b){remove(a);wb(obj(a)+4,b);wb(obj(a)+5,mem[obj(b)+6]);wb(obj(b)+6,a)}
          break;
        case 15:store(rw((a+2*b)&0xffff));break;
        case 16:store(mem[(a+b)&0xffff]);break;
        case 17:
          y=a?propAddr(a,b):0;
          if(!y)store(rw(OBJECTS+2*(b-1)));
          else if(mem[y]>>5)store(rw(y+1));
          else store(mem[y+1]);
          break;
        case 18:y=a?propAddr(a,b):0;store(y?y+1:0);break;
        case 19:
          if(!a){store(0);break}
          if(b===0)y=firstProp(a);
          else{y=propAddr(a,b);if(!y)throw bad('no property '+b+' on object '+a);y+=2+(mem[y]>>5)}
          store(mem[y]&31);
          break;
        case 20:store(a+b);break;
        case 21:store(a-b);break;
        case 22:store(Math.imul(s16(a),s16(b)));break;
        case 23:if(!s16(b))throw bad('division by zero');store(Math.trunc(s16(a)/s16(b)));break;
        case 24:if(!s16(b))throw bad('division by zero');store(s16(a)%s16(b));break;
        default:throw bad('illegal instruction '+op+' at '+(pc-1));
      }
      else if(form===1)switch(x){
        case 0:branch(a===0);break;
        case 1:y=a?mem[obj(a)+5]:0;store(y);branch(y);break;
        case 2:y=a?mem[obj(a)+6]:0;store(y);branch(y);break;
        case 3:store(a?mem[obj(a)+4]:0);break;
        case 4:store(a?(mem[a-1]>>5)+1:0);break;
        case 5:poke(a,peek(a)+1);break;
        case 6:poke(a,peek(a)-1);break;
        case 7:print(decode(a));break;
        case 9:if(a)remove(a);break;
        case 10:if(a)print(objName(a));break;
        case 11:ret(a);break;
        case 12:pc+=s16(a)-2;break;
        case 13:print(decode(a*2));break;
        case 14:store(peek(a));break;
        case 15:store(~a);break;
        default:throw bad('illegal instruction '+op+' at '+(pc-1));
      }
      else if(form===0)switch(x){
        case 0:ret(1);break;
        case 1:ret(0);break;
        case 2:case 3:
          t={a:0};y=decode(pc,false,t);pc=t.a;print(y);
          if(x===3){print('\n');ret(1)}
          break;
        case 4:break;
        case 5:return 'save';
        case 6:return 'restore';
        case 7:reset();break;
        case 8:ret(pop());break;
        case 9:pop();break;
        case 10:halted=true;return 'quit';
        case 11:print('\n');break;
        case 12:showStatus();break;
        case 13:branch(verify());break;
        case 15:branch(true);break;
        default:throw bad('illegal instruction '+op+' at '+(pc-1));
      }
      else switch(x){
        case 0:call(a,[args[1],args[2],args[3]],n-1);break;
        case 1:wb((a+2*b)&0xffff,args[2]>>8&255);wb((a+2*b+1)&0xffff,args[2]&255);break;
        case 2:wb((a+b)&0xffff,args[2]&255);break;
        case 3:
          y=a?propAddr(a,b):0;
          if(!y)throw bad('no property '+b+' on object '+a);
          if(mem[y]>>5)ww(y+1,args[2]);else wb(y+1,args[2]&255);
          break;
        case 4:textBuf=a;parseBuf=b;showStatus();return 'read';
        case 5:print(zscii(a));break;
        case 6:print(String(s16(a)));break;
        case 7:store(random(a));break;
        case 8:push(a);break;
        case 9:y=pop();poke(a,y);break;
        case 10:case 11:case 20:case 21:break;
        case 19:
          y=s16(a);
          if(y===1)screenOn=true;
          else if(y===-1)screenOn=false;
          else if(y===2)mem[0x11]|=1;
          else if(y===-2)mem[0x11]&=~1;
          else if(y===3){if(streams.length>=16)throw bad('too many streams');streams.push({at:b,n:0})}
          else if(y===-3&&streams.length){t=streams.pop();ww(t.at,t.n)}
          break;
        default:throw bad('illegal instruction '+op+' at '+(pc-1));
      }
    }
    return 'more';
  }

  /* ---------- reading a line, and saved games ---------- */
  function answer(line){
    var clean=String(line).toLowerCase().replace(/[^ -~]/g,''),max=maxInput(),i;
    clean=clean.slice(0,max);
    for(i=0;i<clean.length;i++)wb(textBuf+1+i,clean.charCodeAt(i));
    wb(textBuf+1+clean.length,0);
    if(parseBuf)tokenise(textBuf,parseBuf);
  }
  function ident(){return [story[2]<<8|story[3],String.fromCharCode.apply(null,story.subarray(0x12,0x18)),rw0(0x1c)].join('/')}
  function state(){ /* pc is at the branch of the save: restoring takes that branch, as the Standard says */
    var z=[],i=0,x;
    while(i<ALWAYS){
      x=mem[i]^story[i];
      if(x){z.push(x);i++;continue}
      for(x=0;x<255&&i+x+1<ALWAYS&&mem[i+x+1]===story[i+x+1];x++);
      z.push(0,x);i+=x+1;
    }
    return {v:1,id:ident(),pc:pc,mem:chunks(z),stack:stack.slice(),
      frames:frames.map(function(f){return [f.pc,f.st,f.base,f.loc.slice()]})};
  }
  function chunks(z){var s='',i;for(i=0;i<z.length;i+=4096)s+=String.fromCharCode.apply(null,z.slice(i,i+4096));return btoa(s)}
  function word(v){return Number.isInteger(v)&&v>=0&&v<=0xffff}
  function load(o){ /* localStorage can hold anything: nothing changes here unless all of it checks out */
    var raw,out,i,j,k,c,F=[],L;
    if(!o||typeof o!=='object'||o.v!==1||o.id!==ident()||typeof o.mem!=='string')return false;
    if(!Number.isInteger(o.pc)||o.pc<0x40||o.pc>=size)return false;
    if(!Array.isArray(o.stack)||o.stack.length>MAXSTACK||!o.stack.every(word))return false;
    if(!Array.isArray(o.frames)||o.frames.length<1||o.frames.length>MAXFRAMES)return false;
    for(i=0,k=0;i<o.frames.length;i++){
      c=o.frames[i];
      if(!Array.isArray(c)||c.length!==4||!Number.isInteger(c[0])||c[0]<0||c[0]>=size)return false;
      if(!Number.isInteger(c[1])||c[1]<(i?0:-1)||c[1]>255||!Number.isInteger(c[2])||c[2]<k||c[2]>o.stack.length)return false;
      if(!i&&(c[2]!==0||c[1]!==-1))return false;
      if(!Array.isArray(c[3])||c[3].length>15||!c[3].every(word))return false;
      k=c[2];
      F.push({pc:c[0],st:c[1],base:c[2],loc:c[3].slice()});
    }
    try{raw=atob(o.mem)}catch(e){return false}
    out=new Uint8Array(ALWAYS);
    for(i=0,j=0;i<raw.length;i++){
      c=raw.charCodeAt(i);
      if(c){if(j>=ALWAYS)return false;out[j]=c^story[j];j++;continue}
      if(++i>=raw.length)return false;
      for(k=raw.charCodeAt(i)+1;k>0;k--,j++){if(j>=ALWAYS)return false;out[j]=story[j]}
    }
    if(j!==ALWAYS)return false;
    for(i=0;i<0x40;i++)if(i!==0x10&&i!==0x11&&out[i]!==mem[i])return false; /* the addresses of everything else */
    L=mem[0x11]&3;
    mem.set(out);
    mem[0x11]=mem[0x11]&~3|L;
    stack=o.stack.slice();frames=F;loc=F[F.length-1].loc;pc=o.pc;streams=[];screenOn=true;
    return true;
  }
  function settled(ok){branch(ok)}
  function maxInput(){return Math.max(0,mem[textBuf]-1)}
  reset();
  return {run:run,answer:answer,state:state,load:load,settled:settled,maxInput:maxInput};
}

/* ---------- what is common to both ways of playing ---------- */
function bytes(b64){
  var s=atob(b64),u=new Uint8Array(s.length);
  for(var i=0;i<s.length;i++)u[i]=s.charCodeAt(i);
  return u;
}
function drive(vm,game,host){ /* host: line(cb, longest), later(fn), print(text), end(), crash(error) */
  function named(prompt,then){
    host.print(prompt+' (default is '+game.toUpperCase()+'): ');
    host.line(function(l){
      if(l===null){host.end();return}
      var n=l.trim().toLowerCase()||game;
      then(/^[a-z0-9_-]{1,8}$/.test(n)?game+'/save/'+n:null);
    },8);
  }
  function go(){
    var st;
    try{st=vm.run(SLICE)}catch(e){host.crash(e);return}
    if(st==='more')host.later(go);
    else if(st==='read')host.line(function(l){
      if(l===null){host.end();return}
      try{vm.answer(l)}catch(e){host.crash(e);return}
      go();
    },vm.maxInput());
    else if(st==='save')named('Save game name',function(k){
      vm.settled(!!k&&P.save(k,vm.state())===true);
      go();
    });
    else if(st==='restore')named('Restore game name',function(k){
      vm.settled(!!k&&vm.load(P.saved(k)));
      go();
    });
    else host.end();
  }
  go();
}
function wrap(s,w,keep){ /* [start,end] of each row of s in w columns, breaking at a space; keep: leave room for a cursor */
  var R=[],at=0,cut;
  while(s.length-at>w||(keep&&s.length-at===w)){
    cut=s.lastIndexOf(' ',at+w);
    if(cut<=at){cut=at+w;R.push([at,cut]);at=cut}
    else{R.push([at,cut]);at=cut+1}
  }
  R.push([at,s.length]);
  return R;
}

/* ---------- on the screen: the status line on top, and text below, a page at a time ---------- */
function screen(game,story,seed){
  var said=null; /* ^C or a crash: said after the screen is gone, below the command, not after the next prompt */
  P.program(function(S,done){
    var log=[''],input='',reading=null,longest=0,seen={l:0,o:0},more=null,over=false,left='',right=[0,0,false],past=[],back=0,news=0,ending=false;
    var vm=create(story,{print:add,status:function(room,a,b,t){left=room;right=[a,b,t]}},seed);
    function add(s){
      var L=s.split('\n');
      log[log.length-1]+=L[0];
      for(var i=1;i<L.length;i++)log.push(L[i]);
      news+=s.length;
      if(log.length>LOG){log.splice(0,200);seen.l=Math.max(0,seen.l-200)}
    }
    function statusRow(){
      var w=S.cols,r,g,t=right[2],a=right[0],b=right[1];
      r=t?'Time: '+a+':'+String(b).padStart(2,'0'):w>=48?'Score: '+a+'  Moves: '+b:a+'/'+b;
      g=Math.max(0,w-r.length-3);
      return (' '+left.slice(0,g)).padEnd(w-r.length-1)+r+' ';
    }
    function rows(from){
      var out=[],i,j,s,R;
      for(i=from;i<log.length;i++){
        s=log[i];
        if(i===log.length-1)s+=input;
        R=wrap(s,S.cols,i===log.length-1);
        for(j=0;j<R.length;j++)out.push({l:i,o:R[j][0],e:R[j][1],t:s.slice(R[j][0],R[j][1])});
      }
      return out;
    }
    function draw(){
      var h=S.rows-1,all=rows(Math.max(0,seen.l-h)),k=0,L,i,r=-1,c=0,last;
      while(k<all.length-1&&!(all[k].l>seen.l||all[k].l===seen.l&&(all[k+1].l!==seen.l||all[k+1].o>seen.o)))k++;
      more=null;
      if(all.length-k>h){
        L=all.slice(k,k+h-1).map(function(x){return x.t});
        L.push('[MORE]');
        more=all[k+h-1];
        r=h;c=6;
      }
      else{
        L=all.slice(Math.max(0,all.length-h)).map(function(x){return x.t});
        last=all[all.length-1];
        seen={l:last.l,o:last.e};
        if(reading){r=L.length;c=last.t.length}
      }
      L.unshift(statusRow());
      for(i=L.length;i<S.rows;i++)L.push('');
      S.draw(L,r,c);
      if(typeof document!=='undefined'){var el=document.getElementById('full'),d=el&&el.children[0];if(d)d.classList.add('fcur')}
      if(news&&!more){S.say(log.slice(-3).join(' '));news=0}
    }
    function finish(words,err){
      if(over)return;
      over=true;
      S.close();
      if(words)said=[words,err?'err':''];
      done();
    }
    var host={
      print:add,
      later:function(fn){setTimeout(function(){if(!over)fn()},0)},
      line:function(cb,n){reading=cb;longest=n;input='';back=0;draw()},
      end:function(){draw();if(more)ending=true;else finish()},
      crash:function(e){finish(game+': '+e.message,true)}
    };
    function submit(){
      var cb=reading,l=input;
      reading=null;
      log[log.length-1]+=l;input='';log.push('');
      if(l&&past[past.length-1]!==l)past.push(l);
      if(past.length>50)past.shift();
      seen={l:log.length-1,o:0};
      cb(l);
    }
    function recall(d){
      var n=Math.min(past.length,Math.max(0,back+d));
      back=n;
      input=n?past[past.length-n].slice(0,longest):'';
    }
    function feed(k){
      if(over)return;
      if(k==='C-c'){finish('^C');return}
      if(more){
        seen={l:more.l,o:more.o};
        draw();
        if(!more&&ending)finish();
        return;
      }
      if(!reading)return;
      if(k==='Enter'||k==='\n'||k==='\r'){submit();return}
      if(k==='Backspace'||k==='C-h')input=input.slice(0,-1);
      else if(k==='C-u')input='';
      else if(k==='ArrowUp')recall(1);
      else if(k==='ArrowDown')recall(-1);
      else if(k.length===1&&k>=' '&&k<='~'&&input.length<longest)input+=k;
      else return;
      draw();
    }
    drive(vm,game,host);
    return {feed:feed,draw:draw};
  });
  P.queue(function(){if(said)P.typeLine(said[0],said[1])});
}

/* ---------- in a pipe: plain lines, no status line, and the end of the input is the end of the game ---------- */
function plain(game,story,seed){
  var input=P.stdin(),at=0,piped=P.piped(),w=piped?80:Math.max(20,P.columns()),open='';
  function put(s){
    var L=(open+s).split('\n');
    open=L.pop();
    L.forEach(line);
  }
  function line(s){wrap(s,w).forEach(function(r){P.typeLine(s.slice(r[0],r[1]))})}
  var vm=create(story,{print:put,status:function(){}},seed);
  var host={
    print:put,
    later:function(fn){P.queue(fn)},
    line:function(cb){
      var p=open;
      open='';
      if(input){
        P.queue(function(){
          if(at>=input.length){if(p)line(p);cb(null);return}
          var l=input[at++];
          line(p+l);
          cb(l);
        });
        return;
      }
      P.ask(p,function(l){
        if(l===null||l===P.INT){cb(null);return}
        line(p+l);
        cb(l);
      },true);
    },
    end:function(){if(open)line(open);open=''},
    crash:function(e){P.typeLine(game+': '+e.message,'err')}
  };
  P.queue(function(){drive(vm,game,host)});
}

function play(game){
  var b64=P.zstory&&P.zstory[game],story,seed=Math.floor(Math.random()*0x7fffffff);
  if(typeof b64!=='string'){P.typeLine(game+': cannot execute','err');return}
  try{story=bytes(b64)}catch(e){P.typeLine(game+': cannot execute','err');return}
  if(P.stdin()||P.piped())plain(game,story,seed);
  else screen(game,story,seed);
}
P.zmachine={create:create,play:play};
/* zork.js starts it from the machine's disk; declaring the names here is how a loaded file says it arrived */
P.command({names:['zork1','zork2'],run:function(a,raw,w){play(P.fold?P.fold(w[0]):w[0])}});
})(window.Phosphor);
