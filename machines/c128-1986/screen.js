/* PHOSPHOR-9 terminal: machine "c128-1986", the computer itself. It takes the whole glass from power-on: the
   VIC-II's 40 columns (and the VDC's 80, ESC X), the keyboard, a little of the memory map, the SID's tones,
   and the two BASICs. GO 64 is a C64 until the reset button (RESET at READY., or a reload).
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE. */
Phosphor.setup(function(P){
'use strict';
var C=P.c128,Screen=C.Screen;
/* the VIC-II's sixteen colours (measured values published by Philip Timmermann, "Pepto") and the VDC's,
   by the colour numbers BASIC 7.0 gives them */
var VIC=['000000','ffffff','68372b','70a4b2','6f3d86','588d43','352879','b8c76f','6f4f25','433900','9a6759','444444','6c6c6c','9ad284','6c5eb5','959595'];
var VDC=['000000','ffffff','aa0000','55ffff','ff55ff','00aa00','0000aa','ffff55','aa00aa','aa5500','ff5555','00aaaa','555555','55ff55','5555ff','aaaaaa'];
function rgb(h){return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4),16)]}
var PAL={vic:VIC.map(rgb),vdc:VDC.map(rgb)};
var BANNER7=['',' COMMODORE BASIC V7.0 122365 BYTES FREE','   (C)1985 COMMODORE ELECTRONICS, LTD.','         (C)1977 MICROSOFT CORP.','           ALL RIGHTS RESERVED'];
var BANNER2=['','    **** COMMODORE 64 BASIC V2 ****','',' 64K RAM SYSTEM  38911 BASIC BYTES FREE'];
var CTRLKEY={'1':144,'2':5,'3':28,'4':159,'5':156,'6':30,'7':31,'8':158,'9':18,'0':146};
var CBMKEY={'1':129,'2':149,'3':150,'4':151,'5':152,'6':153,'7':154,'8':155};
var calm=matchMedia('(prefers-reduced-motion:reduce)');

P.program(function(S){
  var html=document.documentElement,term=document.getElementById('term');
  html.classList.add('c128');
  /* ---------- the picture ---------- */
  var box=document.createElement('div');box.id='c128';box.setAttribute('aria-hidden','true');
  var paper=document.createElement('div');paper.className='paper';
  var cv=document.createElement('canvas');paper.appendChild(cv);box.appendChild(paper);term.appendChild(box);
  var g=cv.getContext('2d'),img=null;
  var M={ /* the machine's state */
    mode:128,vic:null,vdc:null,scr:null,basic:null,keys:[],stop:false,stopAt:-1e9,clock:0,t0:performance.now(),
    border:13,bg:11,vdcBg:0,fast:false,blink:true,blinkAt:0,editing:null,ram:new Uint8Array(65536),sid:new Uint8Array(32),
    auto:''
  };
  var drive=new C.Drive(C.disk(P),{load:P.saved,save:P.save});
  function vicScreen(colour){var s=new Screen(40,25,M.mode===128?4:2,colour);s.lazy=M.mode===128;hooks(s);return s}
  function hooks(s){
    if(M.mode===128){s.onEsc=function(k){if(k==='X')swap(s===M.vic?M.vdc:M.vic)};s.onBell=bell}
  }
  /* ---------- power ---------- */
  function power(mode){
    M.mode=mode;M.keys=[];M.stop=false;M.fast=false;M.editing=null;M.auto='';M.ram.fill(0);M.sid.fill(0);silence();
    M.t0=performance.now();M.clock=0;
    if(mode===128){
      M.border=13;M.bg=11;M.vdcBg=0;
      M.vic=vicScreen(13);M.vdc=new Screen(80,25,2,3);M.vdc.lazy=true;hooks(M.vdc);M.scr=M.vic;
      M.basic=new C.Basic(machine,true);
    }else{
      M.border=14;M.bg=6;
      M.vic=vicScreen(14);M.vdc=null;M.scr=M.vic;
      M.basic=new C.Basic(machine,false);
    }
    html.classList.toggle('c64',mode===64);
    var probs=P.profile.problems||[];
    if(probs.length){M.scr.colour=10;probs.forEach(function(p){say(String(p).toUpperCase().replace(/[^\x20-\x5f]/g,'?')+'\r')});M.scr.colour=mode===128?13:14}
    (mode===128?BANNER7:BANNER2).forEach(function(l){say(l+'\r')});
    if(mode===128&&drive.find('WELCOME','PRG'))boot();
    else M.basic.ready();
    layout();
  }
  function boot(){ /* the C128 looks at the disk in drive 8 and runs what it is told to */
    say('\rBOOTING WELCOME...\r');
    M.basic.li=-1;M.basic.state='run';
    try{M.basic.diskLoad('WELCOME','',true,true)}catch(e){if(e!==C.WAIT)throw e}
  }
  function say(s){for(var i=0;i<s.length;i++)M.scr.put(s.charCodeAt(i))}
  function swap(to){ /* ESC X: the other screen becomes the one BASIC writes on */
    if(!to||to===M.scr)return;
    if(M.editing){M.editing.r=to.r;M.editing.c=to.c;M.editing.sc=to.scrolled;M.editing.scr=to}
    M.scr=to;M.scr.touch();layout();
  }
  /* the 1985 ROM's hidden credits, SYS 32800,123,45,6 in C128 mode: clear, lower case, as it prints them (Herdware is the ROM's own pun) */
  var CREDITS='\x93\x0e\x12   Brought to you by...   \r\rSoftware:\r Fred Bowen\r Terry Ryan\r Von Ertwine\r\rHerdware:\r Bil Herd\r Dave Haynie\r Frank Palaia\r\r\x12Link arms,don\'t make them.\r';
  /* the terminal's own jokes, not Commodore's: other machines' commands typed at READY., which BASIC would only call a
     ?SYNTAX ERROR, answered by a Commodore owner of 1985. Each: the whole line, the mode (64, 128 or both), and what it
     says. Keep each line under 40 characters. Not a BASIC keyword in that mode, and never inside a program. SYSTEM is
     BASIC's SYS TEM, a jump to the address in TEM: the joke only while TEM is 0, where a real one would crash. A
     two-space ERROR is the C64's way; the C128 says it with one. */
  var RIVALS=[
    [/^C(LOAD|SAVE) *("[^"]*"?)?$/,0,['?TRASH-80  ERROR','THIS ONE LOADS ITS TAPES WITH LOAD.']],
    [/^SYSTEM$/,0,["*?  (THAT'S WHAT A TRASH-80 WOULD SAY.)",'THIS ONE HAS COLOR, SOUND AND SPRITES.']],
    [/^(TRASH-? *80|TRS-? *80)$/,0,['TRASH-80? NEVER HEARD OF IT.','FOR THE MASSES, NOT THE CLASSES.']],
    [/^CLS$/,0,['CLS? SHIFT AND CLR/HOME. WE HAVE A KEY','FOR THAT.']],
    [/^CALL *- *151$/,64,["CALL -151? THIS ISN'T AN APPLE. FOR THE",'PRICE OF ONE, YOU COULD BUY FIVE OF US.']],
    [/^CALL *- *151$/,128,['CALL -151? NO NEED: TYPE MONITOR.','THE C128 HAS ONE BUILT IN, FOR FREE.']],
    [/^CATALOG$/,64,["CATALOG? THIS ISN'T AN APPLE.",'LOAD"$",8 AND LIST, LIKE A GROWN-UP.']],
    [/^PR# *[0-7]$/,0,["PR#? THERE ARE NO SLOTS IN HERE. IT'S",'ALL ON THE BOARD, AND IT COST LESS.']],
    [/^HGR2?$/,0,['HGR? WE HAVE SPRITES, SIXTEEN COLORS','AND A SID CHIP. IT EVEN SINGS.']],
    [/^DOS$/,0,["DOS? THIS ISN'T AN ATARI. THE 1541",'DRIVE IS A COMPUTER ALL BY ITSELF.']],
    [/^ATARI$/,0,["ATARI? JACK BOUGHT THE PLACE IN '84."]]
  ];
  function rival(t){
    var w=t.trim(),hit=RIVALS.filter(function(r){return (!r[1]||r[1]===M.mode)&&r[0].test(w)})[0];
    if(!hit||w==='SYSTEM'&&M.basic.get('TE'))return false;
    say('\r'+hit[2].join('\r').replace(/  ERROR/g,M.mode===128?' ERROR':'  ERROR'));ok();return true;
  }
  /* ---------- what BASIC sees ---------- */
  var machine={
    drive:drive,
    out:function(b){var s=M.scr,r=s.r;s.put(b);if(b===13){var t=s.text(r).trim();if(t)S.say(t)}}, /* a finished line is read out */
    pos:function(){var s=M.scr;return (s.r-s.start(s.r))*s.cols+s.c},
    readLine:function(cb,yesno){M.editing={cb:cb,scr:M.scr,r:M.scr.r,c:M.scr.c,sc:M.scr.scrolled,yesno:!!yesno};M.blinkAt=0;M.blink=true;flushKeys()},
    endInput:function(){M.editing=null},
    ready:function(){
      M.editing={cb:function(text){
        var t=text.replace(/^ +/,'').toUpperCase();
        if(wedge(t))return;
        M.basic.direct(text);
        if(M.basic.state==='ready')machine.ready(); /* a program line, or nothing: no READY., just the next line */
      },scr:M.scr,r:M.scr.r,c:0,direct:true};
      M.blinkAt=0;M.blink=true;
      if(M.auto){var a=M.auto;M.auto='';typeIn(a)}
      flushKeys();
    },
    typeAhead:function(s){M.auto=s},
    getKey:function(){return M.keys.length?M.keys.shift():-1},
    stopped:function(){var s=M.stop;M.stop=false;return s},
    jiffies:function(){return M.clock+(performance.now()-M.t0)*0.06},
    setClock:function(j){M.clock=j;M.t0=performance.now()},
    ms:function(){return performance.now()},
    speed:function(){return M.mode===64?0.9:M.fast?0.55:1.1},
    peek:peek,poke:poke,
    sys:function(a,R){
      if(M.mode===64&&(a===64738||a===64760)){S.after(0,function(){power(64)});M.basic.state='off';return false}
      if(M.mode===128&&(a===65341||a===57344||a===16384)){S.after(0,function(){power(128)});M.basic.state='off';return false}
      if(M.mode!==128)return;
      (R||[]).forEach(function(v,i){if(v!==undefined)M.ram[[6,7,8,5][i]]=v}); /* SYS takes A, X and Y from 6, 7 and 8 */
      if(a===32800&&M.ram[6]===123&&M.ram[7]===45&&M.ram[8]===6){ /* the ROM's own credits, which its builders hid behind this key */
        for(var i=0;i<CREDITS.length;i++){var c=CREDITS.charCodeAt(i);machine.out(c>=97&&c<=122?c-32:c>=65&&c<=90?c+128:c)}
        M.ram[6]=0;M.ram[7]=200; /* where the routine leaves A and X, and SYS keeps them */
      }
    },
    go64:function(){M.editing=null;M.basic.state='off';S.after(50,function(){power(64)})},
    boot:function(){if(drive.find('WELCOME','PRG'))boot();else M.basic.error(C.E.notfound)},
    rclr:function(s){return [M.bg,M.vic.colour,1,2,M.border,M.scr.colour,M.vdcBg][s]+1},
    window:function(n){return [24,M.scr.cols-1,M.scr.cols][n]},
    graphic:function(mode){if(mode===5)swap(M.vdc);else if(mode===0)swap(M.vic)},
    color:function(src,c){
      if(src===0)M.bg=c;else if(src===4)M.border=c;else if(src===6)M.vdcBg=c;
      else if(src===5)M.scr.colour=c;else if(src===1)M.vic.colour=c;
      M.scr.touch();layout();
    },
    char:function(x,y,s,rv){
      var sc=M.scr;if(x>=sc.cols)return;
      var keep=[sc.r,sc.c,sc.rvs,sc.quote];sc.r=y;sc.c=x;sc.rvs=!!rv;sc.quote=false;
      for(var i=0;i<s.length&&sc.c<sc.cols;i++){var k=C.toScreen(s.charCodeAt(i));if(k>=0){sc.poke(sc.rvs?k|128:k);sc.c++}}
      sc.r=keep[0];sc.c=keep[1];sc.rvs=keep[2];sc.quote=keep[3];
    },
    fast:function(on){M.fast=on;layout()},
    sound:tone,silence:function(){silence()},
    help:function(){help()}
  };
  function flushKeys(){ /* keys typed while BASIC was busy are typed now, as the real keyboard buffer does */
    var k=M.keys;M.keys=[];
    k.forEach(function(x){typeKey(x)});
  }
  function typeIn(s){for(var i=0;i<s.length;i++)typeKey(s.charCodeAt(i))}
  /* ---------- the terminal's own words, at READY. ---------- */
  function wedge(t){
    var m;
    if(t==='FILL'){P.fillGlass(!P.fillGlass());ok();return true}
    if((m=/^SOUND (ON|OFF)$/.exec(t))){
      if(m[1]==='ON'&&!P.sound(true)){say('\r?NO SOUND HARDWARE\r');ok();return true}
      if(m[1]==='OFF'){silence();P.sound(false)}
      say('\rKEYCLICKS '+m[1]+'.\r');ok();return true;
    }
    if((m=/^EFFECTS(?: (AUTO|FULL|LITE))?$/.exec(t))){
      if(m[1]){P.effects(m[1].toLowerCase());say('\rEFFECTS '+m[1]+'.\r')}
      else{var e=P.effects();say('\rEFFECTS '+e.mode.toUpperCase()+(e.mode==='auto'?': '+(e.lite?'LITE ('+e.why.toUpperCase()+')':'FULL'):'')+'\rEFFECTS AUTO, FULL OR LITE\r')}
      ok();return true;
    }
    if((m=/^CONNECT(?: +([A-Z0-9]+))?$/.exec(t))&&P.allowed.length>1){
      var id=(m[1]||'').toLowerCase();
      if(!id){
        say('\rMACHINES ON THE LINE:\r');
        P.allowed.forEach(function(x){say((x===P.machine?'* ':'  ')+x.toUpperCase().padEnd(7)+(P.catalog[x].year||'')+'\r')});
        ok();return true;
      }
      if(P.allowed.indexOf(id)<0){say('\rCONNECT: '+m[1]+': NO SUCH MACHINE\r');ok();return true}
      if(id===P.machine){say('\rCONNECT: ALREADY ON '+m[1]+'\r');ok();return true}
      say('\rCONNECTING TO '+m[1]+'...\r');M.editing=null;
      S.after(600,function(){var q=new URLSearchParams(location.search);q.set('machine',id);location.search=q.toString()});
      return true;
    }
    if(t==='SOURCE'){
      var url=(P.profile.source||P.upstream).toUpperCase();
      say('\rTHIS TERMINAL IS FREE SOFTWARE (GNU AGPL V3 OR LATER). THE SOURCE IS AT:\r');
      for(var i=0;i<url.length;i+=M.scr.cols-1)say(url.slice(i,i+M.scr.cols-1)+'\r');
      ok();return true;
    }
    if(t==='RESET'){M.editing=null;M.basic.state='off';S.after(200,function(){power(128)});return true}
    if(t==='HELP'&&M.mode===64){help();ok();return true}
    return rival(t);
  }
  function ok(){M.basic.state='ready';M.basic.say('\rREADY.\r');machine.ready()}
  function help(){
    var L=[
      '',
      'DIRECTORY        WHAT IS ON THE DISK',
      'DLOAD"NAME"      LOAD A PROGRAM',
      'LIST, NEW        SEE IT, THROW IT AWAY',
      'DSAVE"NAME"      KEEP IT IN THE BROWSER',
      'GO 64            BE A COMMODORE 64',
      'ESC THEN X       40 OR 80 COLUMNS',
      'CTRL-C (TWICE)   RUN/STOP (+RESTORE)',
      '',
      'FILL             BIGGER SCREEN',
      'SOUND ON|OFF     KEYCLICKS',
      'EFFECTS          TUBE EFFECTS',
      'CONNECT          OTHER MACHINES',
      'SOURCE           WHERE THIS COMES FROM',
      'RESET            THE RESET BUTTON'
    ];
    if(M.mode===64)L=L.map(function(l){return l.replace(/^DIRECTORY {8}/,'LOAD"$",8        ').replace(/^DLOAD"NAME" {6}/,'LOAD"NAME",8     ').replace(/^DSAVE"NAME" {6}/,'SAVE"NAME",8     ')}).filter(function(l){return !/^(GO 64|ESC)/.test(l)});
    if(P.allowed.length<2)L=L.filter(function(l){return !/^CONNECT/.test(l)});
    M.scr.put(13);L.slice(1).forEach(function(l){say(l+'\r')});
  }
  /* ---------- memory: a few places that mean something ---------- */
  function cell(a,base){var i=a-base;return i>=0&&i<1000?i:-1}
  function peek(a){
    var s=M.vic,i;
    if((i=cell(a,1024))>=0)return s.ch[i];
    if((i=cell(a,55296))>=0)return s.co[i]|240;
    if(a===53280)return M.border|240;
    if(a===53281)return M.bg|240;
    if(a===53272)return s.lower?23:21;
    if(a>=54272&&a<54301)return a===54299?Math.floor(Math.random()*256):0; /* the SID: only voice 3's noise reads back */
    if(a===160||a===161||a===162){var j=Math.floor(machine.jiffies());return [(j>>16)&255,(j>>8)&255,j&255][a-160]}
    if(M.mode===64){
      if(a===646)return M.scr.colour;
      if(a===198)return M.keys.length;
      if(a>=631&&a<641)return M.keys[a-631]||0;
      if(a===197||a===203)return 64;
      if(a===211)return M.scr.c;
      if(a===214)return M.scr.r;
      if(a===43)return 1;if(a===44)return 8;
    }else{
      if(a===241)return M.scr.colour;
      if(a===208)return M.keys.length;
      if(a>=842&&a<852)return M.keys[a-842]||0;
      if(a===212||a===213)return 88;
      if(a===235)return M.scr.r;
      if(a===236)return M.scr.c;
      if(a===215)return M.scr===M.vdc?128:0;
      if(a===45)return 1;if(a===46)return 28;
    }
    return M.ram[a];
  }
  function poke(a,v){
    var s=M.vic,i;
    M.ram[a]=v;
    if((i=cell(a,1024))>=0){s.ch[i]=v;s.touch();return}
    if((i=cell(a,55296))>=0){s.co[i]=v&15;s.touch();return}
    if(a===53280){M.border=v&15;layout();return}
    if(a===53281){M.bg=v&15;s.touch();layout();return}
    if(a===53272){s.lower=(v&2)!==0;s.touch();return}
    if(a>=54272&&a<54297){M.sid[a-54272]=v;sid(a-54272);return}
    if(M.mode===64){
      if(a===646){M.scr.colour=v&15;return}
      if(a===198){M.keys.length=Math.min(M.keys.length,v);return}
      if(a>=631&&a<641){M.keys[a-631]=v;return}
    }else{
      if(a===241){M.scr.colour=v&15;return}
      if(a===208){M.keys.length=Math.min(M.keys.length,v);return}
      if(a>=842&&a<852){M.keys[a-842]=v;return}
    }
  }
  /* ---------- sound: SOUND, PLAY, and the SID registers as the type-ins poke them ---------- */
  var AC=null,voices=[null,null,null],noise=null,tones=[]; /* tones: SOUND's and PLAY's, sounding or still to come */
  function audio(){
    if(!P.sound())return null;
    try{if(!AC)AC=new (window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume()}catch(e){return null}
    return AC;
  }
  function noiseBuf(a){
    if(noise)return noise;
    var n=a.sampleRate,b=a.createBuffer(1,n,n),d=b.getChannelData(0);
    for(var i=0;i<n;i++)d[i]=Math.random()*2-1;
    return noise=b;
  }
  function osc(a,hz,wave){
    var o;
    if(wave===3){o=a.createBufferSource();o.buffer=noiseBuf(a);o.loop=true;o.playbackRate.value=Math.max(.05,hz/2000)}
    else{o=a.createOscillator();o.type=['triangle','sawtooth','square','square'][wave]||'triangle';o.frequency.value=Math.max(1,Math.min(20000,hz))}
    return o;
  }
  function tone(v,hz,secs,wave,vol,delay){
    var a=audio();if(!a||!secs||!hz)return;
    var t=a.currentTime+(delay||0),o=osc(a,hz,wave||0),gn=a.createGain(),lv=.05*(vol===undefined?15:vol)/15;
    gn.gain.setValueAtTime(0,t);gn.gain.linearRampToValueAtTime(lv,t+.005);
    gn.gain.setValueAtTime(lv,t+Math.max(.006,secs-.02));gn.gain.linearRampToValueAtTime(0,t+secs);
    o.connect(gn);gn.connect(a.destination);o.start(t);o.stop(t+secs+.05);
    tones=tones.filter(function(x){return x.end>a.currentTime});tones.push({o:o,end:t+secs+.05});
  }
  function bell(){tone(1,1600,.12,2,15)}
  function sid(r){
    var vce=Math.floor(r/7),k=r%7;
    if(r>=21){var vol=M.sid[24]&15;voices.forEach(function(x){if(x)x.g.gain.value=.05*vol/15});return}
    var base=vce*7,hz=(M.sid[base]|M.sid[base+1]<<8)*0.0609594,ctl=M.sid[base+4],gate=ctl&1,w=ctl&128?3:ctl&64?2:ctl&32?1:0;
    var cur=voices[vce];
    if(cur&&(k===0||k===1)){if(cur.o.frequency)cur.o.frequency.value=Math.max(1,hz);else cur.o.playbackRate.value=Math.max(.05,hz/2000)}
    if(k!==4)return;
    if(gate&&(ctl&240)&&(!cur||cur.w!==w)){
      if(cur){try{cur.o.stop()}catch(e){}voices[vce]=null}
      var a=audio();if(!a)return;
      var o=osc(a,hz,w),gn=a.createGain();gn.gain.value=.05*(M.sid[24]&15)/15;
      o.connect(gn);gn.connect(a.destination);o.start();voices[vce]={o:o,g:gn,w:w};
    }else if(!gate&&cur){var c=cur;voices[vce]=null;try{c.g.gain.setTargetAtTime(0,AC.currentTime,.05);c.o.stop(AC.currentTime+.3)}catch(e){}}
  }
  function silence(){
    voices.forEach(function(x,i){if(x){try{x.o.stop()}catch(e){}voices[i]=null}});
    tones.forEach(function(x){try{x.o.stop()}catch(e){}});tones=[];
  }
  /* ---------- the keyboard ---------- */
  function petscii(ch){ /* a typed character as the C64 keyboard would give it */
    var c=ch.charCodeAt(0),lower=M.scr.lower;
    if(c>=97&&c<=122)return c-32;
    if(c>=65&&c<=90)return lower?c+128:c; /* capitals: shifted letters in the lower case set; letters otherwise, so caps lock is harmless */
    if(c>=32&&c<=64||c===91||c===93)return c;
    if(ch==='£'||ch==='\\')return 92;
    if(ch==='^')return 94;
    if(ch==='_')return 95;
    if(ch==='π')return 255;
    return -1;
  }
  function typeKey(p){ /* a PETSCII key into the editor, or the buffer if BASIC is busy */
    var ed=M.editing;
    if(!ed){if(M.keys.length<10)M.keys.push(p);return}
    var s=ed.scr;M.blinkAt=0;M.blink=true;
    if(p===13){
      var from=0,er=ed.r-(s.scrolled-ed.sc); /* where the prompt ended, less what has scrolled away since */
      if(!ed.direct&&er>=0&&s.start(s.r)===s.start(er))from=(er-s.start(er))*s.cols+ed.c;
      var text=s.line(from);
      M.editing=null;
      if(!ed.yesno)s.newline();
      else{s.quote=false;s.ins=0;s.rvs=false}
      ed.cb(text);
      return;
    }
    if(p===141){s.newline();return}
    s.key(p);
  }
  function key(k){ /* a key from the engine: characters, names, C-x */
    var p=-1;
    if(P.sound())P.click(.5);
    if(k==='C-c'){ /* RUN/STOP; twice within a second, RUN/STOP and RESTORE: TRAP lets go */
      var st=M.basic.state,now=performance.now();
      if(now-M.stopAt<1000){M.basic.trap=M.basic.trap0=null;now=-1e9}
      M.stopAt=now;
      if(st==='input')M.basic.stop();else M.stop=st==='run'||st==='wait';return;
    }
    if(/^C-[0-9]$/.test(k)){p=CTRLKEY[k.charAt(2)];}
    else if(k==='Enter')p=13;
    else if(k==='Backspace')p=20;
    else if(k==='ArrowUp')p=145;else if(k==='ArrowDown')p=17;else if(k==='ArrowLeft')p=157;else if(k==='ArrowRight')p=29;
    else if(k==='Escape'){if(M.mode===128)p=27}
    else if(k==='Tab'){if(M.mode===128)p=9}
    else if(k.length===1)p=petscii(k);
    if(p<0)return;
    typeKey(p);
  }
  function fkey(n){ /* F1 to F8: in C128 mode, what KEY gave them */
    if(M.mode===128){typeIn(M.basic.keys[n-1]);return}
    typeKey([133,137,134,138,135,139,136,140][n-1]);
  }
  function extra(e){ /* the keys the engine keeps to itself: Home, Insert, F1-F8, the Commodore key, shift-return */
    if(!document.getElementById('c128'))return;
    var k=e.key,done=true;
    if(k==='Home')typeKey(e.shiftKey?147:19);
    else if(k==='Insert')typeKey(148);
    else if(/^F[1-8]$/.test(k))fkey(+k.slice(1));
    else if(k==='Enter'&&e.shiftKey)typeKey(141);
    else if(e.altKey&&CBMKEY[k]&&!e.ctrlKey)typeKey(CBMKEY[k]);
    else if(e.altKey&&e.shiftKey&&(k==='Shift'||k==='Alt')){if(!M.scr.locked){M.scr.lower=!M.scr.lower;M.scr.touch()}} /* Commodore and shift: the other character set */
    else if(e.altKey&&/^Digit[1-8]$/.test(e.code)&&!e.ctrlKey)typeKey(CBMKEY[e.code.slice(5)]);
    else done=false;
    if(done){e.preventDefault();e.stopPropagation()}
  }
  document.addEventListener('keydown',extra,true);
  /* ---------- drawing ---------- */
  function layout(){
    var s=M.scr,v=s===M.vdc,W=term.clientWidth,H=term.clientHeight,narrow=W<600;
    var pw=s.cols*8,ph=s.rows*8*(v?2:1);
    var k=Math.min(W*(narrow?.97:.86)/pw,H*(narrow?.97:.86)/ph);
    if(k>=2)k=Math.floor(k*2)/2;
    if(v&&k*8<6)k=.75; /* 80 columns on a phone: readable, and the glass follows the cursor */
    paper.style.width=pw*k+'px';paper.style.height=ph*k+'px';
    if(cv.width!==s.cols*8){cv.width=s.cols*8;cv.height=s.rows*8;img=g.createImageData(cv.width,cv.height)}
    var pal=v?PAL.vdc:PAL.vic,bc=pal[v?M.vdcBg:M.border],tc=pal[s.colour];
    box.style.background='rgb('+bc.join(',')+')';
    html.style.setProperty('--phos-rgb',tc.join(','));
    html.style.setProperty('--c128-glow','rgba('+tc.join(',')+',.55)');
    html.classList.toggle('vdc',v);
    paper.style.visibility=!v&&M.fast?'hidden':'';
    s.touch();
    pan();
  }
  function pan(){
    var s=M.scr,W=term.clientWidth,pw=parseFloat(paper.style.width)||0;
    if(pw<=W){paper.style.transform='';return}
    var cx=(s.c+.5)/s.cols*pw,x=Math.min(0,Math.max(W-pw,W/2-cx));
    paper.style.transform='translateX('+(x+(pw-W)/2)+'px)';
  }
  var lastText='';
  function draw(){
    var s=M.scr,v=s===M.vdc,pal=v?PAL.vdc:PAL.vic,bg=pal[v?M.vdcBg:M.bg],set=C.font.sets[s.lower?1:0],G=C.font.glyphs,d=img.data,W=cv.width;
    var curOn=M.editing&&M.editing.scr===s&&(M.blink||calm.matches),ci=s.at(s.r,s.c);
    for(var r=0;r<s.rows;r++)for(var c=0;c<s.cols;c++){
      var i=r*s.cols+c,code=s.ch[i],rows=G[set[code&127]]||G[' '],fg=pal[s.co[i]&15],inv=(code&128)!==0;
      if(curOn&&i===ci)inv=!inv;
      for(var y=0;y<8;y++){
        var bits=rows[y],o=((r*8+y)*W+c*8)*4;
        for(var x=0;x<8;x++){
          var on=((bits<<x)&128)!==0;if(inv)on=!on;
          var col=on?fg:bg;d[o]=col[0];d[o+1]=col[1];d[o+2]=col[2];d[o+3]=255;o+=4;
        }
      }
    }
    g.putImageData(img,0,0);
    var L=[];for(var rr=0;rr<s.rows;rr++)L.push(s.text(rr));
    var t=L.join('\n');
    if(t!==lastText){lastText=t;S.draw(L,-1,0)}
    pan();
  }
  /* ---------- the clock: BASIC runs in slices, at about the real machine's speed ---------- */
  var last=performance.now();
  S.every(16,function(){
    var now=performance.now(),dt=Math.min(100,now-last);last=now;
    try{M.basic.exec(dt)}catch(e){console.error(e);M.basic.state='run';M.basic.error(C.E.syntax)}
    if(now-M.blinkAt>333){M.blinkAt=now;M.blink=!M.blink;if(M.editing)M.scr.touch()}
    if(M.scr.dirty){M.scr.dirty=false;draw()}
  });
  power(128);
  return {
    feed:key,
    draw:function(){M.scr.touch()},
    resize:function(){layout()},
    M:M /* for the engine's own use only; the page cannot reach it */
  };
});
});
