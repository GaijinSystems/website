/* PHOSPHOR-9 terminal: machine "apple2-1984", an Apple IIe with DOS 3.3: its 40 by 24 screen, keyboard and
   line input (with escape-key cursor moves), the monitor, DOS 3.3 and its disk (kept in this browser), and the
   card that joins it to this terminal.
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE.
   The screen layout, prompts and messages were checked against an Apple IIe and DOS 3.3 running in MAME. */
(function(P){
'use strict';
var CPU=P.a2cpu,h2=CPU.h2,h4=CPU.h4,KEY='apple2/disk';
var mem=new Uint8Array(65536);
var S=null,el=null,closeFn=null,rows=[],dirty=true,blinkOn=true,calm=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;
var basic=null,mode='off',GL=null,keyCb=null,kq=[],brkFlag=false,lastKey=0,job=null,cpu=null,cpuDone=null,sleepUntil=0,sleepCb=null;
var WELCOME=[],MAILNOTE='',graphics=false,booted=false,booting=false;
var CH=0x24,CV=0x25,WL=0x20,WW=0x21,WT=0x22,WB=0x23,INV=0x32;
function freshDos(){return {slot:6,drive:1,cap:null,lastCR:true,pend:null,w:null,r:null,open:{},exec:null,on:true}}
var DOS=freshDos();
var disk=null;

/* ---------- the text screen: the bytes at $400-$7FF, as the IIe keeps them ---------- */
function base(r){return 0x400+0x80*(r%8)+0x28*(r>>3)}
function cellChar(b){ /* the character a screen byte shows, and how: 0 normal, 1 inverse, 2 flashing */
  var c,a;
  if(b>=0x80){c=b&0x7F;a=0}else if(b<0x40){c=b;a=1}else{c=b&0x3F;a=2}
  if(c<0x20)c+=0x40;
  return [String.fromCharCode(c),a];
}
function clearRows(from,to){for(var r=from;r<to;r++)for(var c=mem[WL];c<mem[WL]+mem[WW];c++)mem[base(r)+c]=0xA0;dirty=true}
function home(){clearRows(mem[WT],mem[WB]);mem[CH]=0;mem[CV]=mem[WT]}
function scroll(){
  var L=mem[WL],W=mem[WW];
  for(var r=mem[WT];r<mem[WB]-1;r++)for(var c=L;c<L+W;c++)mem[base(r)+c]=mem[base(r+1)+c];
  for(var c2=L;c2<L+W;c2++)mem[base(mem[WB]-1)+c2]=0xA0;
  dirty=true;
}
function lf(){if(mem[CV]+1>=mem[WB])scroll();else mem[CV]++}
function clreol(){var b=base(mem[CV]);for(var c=mem[WL]+mem[CH];c<mem[WL]+mem[WW];c++)mem[b+c]=0xA0;dirty=true}
function clreop(){clreol();clearRows(mem[CV]+1,mem[WB])}
function screenOut(c){ /* COUT1: the monitor's own output, on the glass */
  c&=0x7F;
  if(c===13){mem[CH]=0;lf();return}
  if(c===10){lf();return}
  if(c===8){if(mem[CH]>0)mem[CH]--;else{mem[CH]=mem[WW]-1;if(mem[CV]>mem[WT])mem[CV]--}return}
  if(c===7){bell();return}
  if(c<0x20)return;
  var b=c|0x80;
  if(mem[INV]!==0xFF&&!(c>=0x60&&mem[INV]===0x7F))b&=mem[INV];
  if(c>=0x60&&mem[INV]===0x3F)b=c; /* lowercase inverse */
  mem[base(mem[CV])+mem[WL]+mem[CH]]=b;dirty=true;
  if(++mem[CH]>=mem[WW]){mem[CH]=0;lf()}
}
function out(c){ /* COUT through DOS: a control-D after a return starts a DOS command; WRITE sends text to a file */
  c&=0x7F;
  if(DOS.cap!==null){
    if(c===13){DOS.pend=DOS.cap;DOS.cap=null;DOS.lastCR=true}
    else if(DOS.cap.length<255)DOS.cap+=String.fromCharCode(c); /* the line buffer's length; past it the real DOS goes astray */
    return;
  }
  if(c===4&&DOS.lastCR&&DOS.on){DOS.cap='';return}
  if(DOS.w){
    var f=DOS.w;
    if((f.d||'').length%256===0&&used()+1>496){DOS.w=null;saveDisk();throw {dos:9}} /* a new sector, and none free */
    f.d=(f.d||'')+(c===13?'\r':String.fromCharCode(c));DOS.lastCR=c===13;f.dirty=true;return;
  }
  screenOut(c);
  DOS.lastCR=c===13;
}
function say(s){for(var i=0;i<s.length;i++)out(s.charCodeAt(i))}
function cr(){out(13)}
function bell(){P.click(.9,1000)}

/* ---------- drawing the glass ---------- */
function layout(){ /* 40 columns across the glass and 24 rows down it: the type as tall as the rows allow, and a little wider */
  if(!el)return;
  el.style.fontSize='';el.style.letterSpacing='';
  var cs=getComputedStyle(el),fs=parseFloat(cs.fontSize),term=document.getElementById('term');
  var w=el.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight);
  var h=term.clientHeight-parseFloat(cs.paddingTop)-parseFloat(cs.paddingBottom);
  fs=Math.max(7,Math.min(fs*1.8,h/(24*1.28)*.995));
  el.style.fontSize=fs+'px';
  var cw=charWidth();
  if(cw*40>w){fs=Math.max(7,fs*w/(cw*40)*.995);el.style.fontSize=fs+'px';cw=charWidth()}
  WIDE=Math.max(1,Math.min(1.4,w/(cw*40)));
  el.style.letterSpacing=Math.max(0,w/(40*WIDE)-cw-.02)+'px';
  rows=[];while(el.firstChild)el.removeChild(el.firstChild);
  dirty=true;
}
var WIDE=1;
function charWidth(){
  var p=document.createElement('span');p.textContent='0000000000';
  p.style.cssText='position:absolute;visibility:hidden;white-space:pre;letter-spacing:0';
  el.appendChild(p);var w=p.getBoundingClientRect().width/10;p.remove();return w;
}
function idleNow(){ /* the engine's sign that input is awaited: booting, the drive spins up and keys wait for the prompt */
  var waiting=mode==='getln'||mode==='key'||mode==='sleep'&&booting,term=document.getElementById('term');
  if(term&&term.classList.contains('idle')!==waiting)term.classList.toggle('idle',waiting);
  if(el)el.dataset.booting=booting?'1':'';
  return waiting;
}
function draw(){
  if(!el)return;
  var waiting=idleNow();
  if(!dirty)return;
  dirty=false;
  var cur=waiting&&(blinkOn||calm);
  for(var r=0;r<24;r++){
    var segs=[],sig='',b=base(r);
    for(var c=0;c<40;c++){
      var x=cellChar(mem[b+c]),inv=x[1]===1||x[1]===2&&blinkOn;
      if(cur&&r===mem[CV]&&c===mem[WL]+mem[CH])inv=!inv;
      if(!segs.length||segs[segs.length-1][1]!==inv)segs.push(['',inv]);
      segs[segs.length-1][0]+=x[0];
    }
    if(!segs[segs.length-1][1])segs[segs.length-1][0]=segs[segs.length-1][0].replace(/ +$/,'');
    sig=segs.map(function(s){return (s[1]?'1':'0')+s[0]}).join('\u0000');
    if(rows[r]&&rows[r].sig===sig)continue;
    var d=document.createElement('div');d.className='line';
    if(WIDE>1){d.style.transform='scaleX('+WIDE+')';d.style.transformOrigin='0 0'}
    segs.forEach(function(s){
      if(!s[1]){d.appendChild(document.createTextNode(s[0]));return}
      var sp=document.createElement('span');sp.className='fcur';sp.textContent=s[0];d.appendChild(sp);
    });
    if(rows[r])el.replaceChild(d,rows[r].d);else el.appendChild(d);
    rows[r]={d:d,sig:sig};
  }
}
function lineText(r){var s='',b=base(r);for(var c=0;c<40;c++)s+=cellChar(mem[b+c])[0];return s.replace(/ +$/,'')}

/* ---------- the keyboard: caps lock down, as the manual asks ---------- */
var KEYMAP={Enter:13,Backspace:8,ArrowLeft:8,ArrowRight:21,ArrowUp:11,ArrowDown:10,Escape:27,Tab:9};
function feed(k){
  var c=KEYMAP[k];
  if(c===undefined){
    if(/^C-[a-z@\[\]\\^_]$/.test(k))c=k.charCodeAt(2)&31;
    else if(k.length===1)c=k.charCodeAt(0);
    else return;
  }
  if(c>=97&&c<=122)c-=32;
  if(c>127)return;
  P.click(c===13?1:.667,c===13?700:undefined);
  lastKey=c;
  if(c===3&&mode!=='getln'&&mode!=='key')brkFlag=true;
  if(mode==='getln'){glKey(c);idleNow();return}
  if(mode==='key'){var f=keyCb;keyCb=null;mode='busy';f(c);idleNow();return}
  if(c!==3&&kq.length<16)kq.push(c);
}
function keyNow(){return kq.length?kq.shift():null}
function waitKey(f){var k=keyNow();if(k!==null){f(k);return}keyCb=f;mode='key';dirty=true}

/* ---------- GETLN: the line input, with the escape key to move about and the right arrow to copy ---------- */
function getln(prompt,cb,brk){
  if(prompt)out(prompt.charCodeAt(0));
  GL={buf:'',cb:cb,esc:false,prompt:prompt,brk:brk};
  mode='getln';dirty=true;
  if(DOS.exec&&DOS.exec.length){var l=DOS.exec.shift();say(l);glKey(13);return}
  while(mode==='getln'&&kq.length)glKey(kq.shift());
  if(mode==='getln'&&S)S.say(lineText(mem[CV]));
}
function glKey(c){
  var G=GL;dirty=true;
  if(G.esc){
    var mv={73:[0,-1],74:[-1,0],75:[1,0],77:[0,1],11:[0,-1],8:[-1,0],21:[1,0],10:[0,1]}[c],one={65:[1,0],66:[-1,0],67:[0,1],68:[0,-1]}[c];
    if(mv||one){var d=mv||one;mem[CH]=Math.max(0,Math.min(mem[WW]-1,mem[CH]+d[0]));mem[CV]=Math.max(mem[WT],Math.min(mem[WB]-1,mem[CV]+d[1]));if(one)G.esc=false;return}
    G.esc=false;
    if(c===64){home();return}
    if(c===69){clreol();return}
    if(c===70){clreop();return}
    return;
  }
  if(c===27){G.esc=true;return}
  if(c===13){
    clreol();screenOut(13);DOS.lastCR=true;
    mode='busy';GL=null;G.cb(G.buf);return;
  }
  if(c===24){screenOut(92);screenOut(13);G.buf='';if(G.prompt)screenOut(G.prompt.charCodeAt(0));return}
  if(c===8){if(G.buf.length){G.buf=G.buf.slice(0,-1);screenOut(8)}return}
  if(c===21){c=cellChar(mem[base(mem[CV])+mem[WL]+mem[CH]])[0].charCodeAt(0)}
  if(c===3&&G.brk){mode='busy';GL=null;G.brk();return}
  if(c<32){if(G.prompt==='*'&&(c===2||c===3||c===5||c===25))G.buf+=String.fromCharCode(c);return}
  if(G.buf.length>=239){bell();return}
  G.buf+=String.fromCharCode(c);
  screenOut(c);
}

/* ---------- the disk in drive 1, kept in this browser ---------- */
var TYPES={A:1,I:1,T:1,B:1};
function loadDisk(){
  var d=P.saved(KEY);
  if(d&&d.v===1&&Array.isArray(d.files)&&d.files.every(function(f){return f===null||f&&typeof f.n==='string'&&TYPES[f.t]})){disk=d;return}
  disk={v:1,vol:254,files:P.a2disk().map(function(f){
    if(f.t==='A')return {n:f.n,t:'A',l:!!f.l,d:basicLines(f.src)};
    return {n:f.n,t:f.t,l:!!f.l,d:f.d};
  })};
}
function basicLines(src){
  return src.split('\n').filter(Boolean).map(function(l){var m=l.match(/^(\d+)\s?(.*)$/);return [+m[1],P.applesoft.parse(m[2])]});
}
function saveDisk(){P.save(KEY,disk)}
function bytesOf(f){
  if(f.t==='A'||f.t==='I')return 2+(f.d||[]).reduce(function(a,L){return a+5+L[1].length},2);
  if(f.t==='B')return 4+((f.d&&f.d.b)||[]).length;
  return ((f.d)||'').length;
}
function sectors(f){return Math.ceil(bytesOf(f)/256)+1}
function used(){return disk.files.reduce(function(a,f){return a+(f?sectors(f):0)},0)}
function findFile(n){for(var i=0;i<disk.files.length;i++)if(disk.files[i]&&disk.files[i].n===n)return disk.files[i];return null}
function addFile(f){
  if(used()+sectors(f)>496)throw {dos:9};
  var i=disk.files.indexOf(null);
  if(i<0){if(disk.files.length>=105)throw {dos:9};disk.files.push(f)}else disk.files[i]=f;
}

/* ---------- DOS 3.3 ---------- */
var DOSMSG={1:'LANGUAGE NOT AVAILABLE',2:'RANGE ERROR',3:'RANGE ERROR',4:'WRITE PROTECTED',5:'END OF DATA',6:'FILE NOT FOUND',
  7:'VOLUME MISMATCH',8:'I/O ERROR',9:'DISK FULL',10:'FILE LOCKED',11:'SYNTAX ERROR',12:'NO BUFFERS AVAILABLE',
  13:'FILE TYPE MISMATCH',14:'PROGRAM TOO LARGE',15:'NOT DIRECT COMMAND'};
var CMDS=['INIT','LOAD','SAVE','RUN','CHAIN','DELETE','LOCK','UNLOCK','CLOSE','READ','EXEC','WRITE','POSITION','OPEN',
  'APPEND','RENAME','CATALOG','MON','NOMON','PR#','IN#','MAXFILES','FP','INT','BSAVE','BLOAD','BRUN','VERIFY'];
var NEEDNAME={INIT:1,LOAD:1,SAVE:1,RUN:1,CHAIN:1,DELETE:1,LOCK:1,UNLOCK:1,READ:1,EXEC:1,WRITE:1,POSITION:1,OPEN:1,APPEND:1,RENAME:1,BSAVE:1,BLOAD:1,BRUN:1,VERIFY:1};
var NOTDIRECT={READ:1,WRITE:1,POSITION:1,OPEN:1,APPEND:1};
function dosMessage(code,inProg){if(inProg)screenOut(13);screenOut(13);bell();say(DOSMSG[code]||'SYNTAX ERROR');screenOut(13);DOS.lastCR=true}
function parseDos(line){ /* {cmd,name,opt,name2} or null when it is not a DOS command */
  var i=0,k,cmd=null,end=0;
  for(k=0;k<CMDS.length&&!cmd;k++){
    var w=CMDS[k],j=0,m=0;
    while(m<w.length){while(line.charAt(j)===' ')j++;if(line.charAt(j)!==w.charAt(m))break;j++;m++}
    if(m===w.length){cmd=w;end=j}
  }
  if(!cmd)return null;
  var rest=line.slice(end),parts=rest.split(','),name=parts[0].replace(/^ +/,'').replace(/ +$/,''),opt={},name2=null;
  for(i=1;i<parts.length;i++){
    var p=parts[i].replace(/ /g,'');
    if(cmd==='RENAME'&&i===1&&name2===null&&!/^[SDVALRB]\$?[0-9A-F]+$/.test(p)){name2=parts[i].replace(/^ +/,'').replace(/ +$/,'');continue}
    var o=p.match(/^([SDVALRB])(\$[0-9A-F]+|\d+)$/);
    if(!o)return {cmd:cmd,bad:true};
    opt[o[1]]=o[2].charAt(0)==='$'?parseInt(o[2].slice(1),16):parseInt(o[2],10);
  }
  return {cmd:cmd,name:name,opt:opt,name2:name2};
}
function dos(line,inProg){ /* a DOS command: null when it is not one; else what happens next */
  var D=parseDos(line);
  if(!D)return null;
  if(D.bad)throw {dos:11};
  var c=D.cmd;
  if((c==='LOAD'||c==='SAVE'||c==='RUN')&&(!D.name||!/^[A-Z]/.test(D.name)))return null; /* the cassette, or RUN 100: BASIC's */
  if(NEEDNAME[c]&&!/^[A-Z]/.test(D.name))throw {dos:11};
  if(c==='MAXFILES'&&!/^\d+$/.test(D.name))throw {dos:11};
  if(D.name&&D.name.length>30)D.name=D.name.slice(0,30);
  if(!inProg&&NOTDIRECT[c])throw {dos:15};
  if(D.opt.S!==undefined){if(D.opt.S<1||D.opt.S>7)throw {dos:2};DOS.slot=D.opt.S}
  if(D.opt.D!==undefined){if(D.opt.D<1||D.opt.D>2)throw {dos:2};DOS.drive=D.opt.D}
  if(D.opt.V!==undefined&&D.opt.V>254)throw {dos:2};
  function drive(){
    if(DOS.slot!==6||DOS.drive!==1)return {job:function(done){sleep(DOS.slot!==6?2500:1800,function(){done({dos:8})})}};
    if(D.opt.V&&D.opt.V!==disk.vol&&c!=='INIT')throw {dos:7};
    return null;
  }
  var f,x;
  switch(c){
  case 'MON':case 'NOMON':case 'MAXFILES':return 'ok';
  case 'FP':basic.newProg();return 'restart';
  case 'INT':throw {dos:1};
  case 'PR#':case 'IN#':
    if(!/^\d+$/.test(D.name))throw {dos:11};
    x=+D.name;if(x>7)throw {dos:2};
    if(x===6)return 'boot';
    return 'ok';
  case 'CATALOG':
    if((x=drive()))return x;
    return {job:catalog};
  }
  if((x=drive()))return x;
  f=findFile(D.name);
  switch(c){
  case 'INIT':
    return {job:function(done){sleep(2500,function(){
      disk={v:1,vol:D.opt.V||254,files:[]};
      try{addFile({n:D.name,t:'A',l:false,d:basic.program()})}catch(e){}
      saveDisk();done();
    })}};
  case 'LOAD':case 'RUN':case 'CHAIN':
    if(!f)throw {dos:6};
    if(f.t!=='A')throw {dos:13};
    return {job:function(done){sleep(350,function(){
      basic.load(f.d||[],c==='CHAIN');
      done(c==='LOAD'?'loaded':c==='CHAIN'?'chain':'run');
    })}};
  case 'SAVE':
    if(f){if(f.l)throw {dos:10};if(f.t!=='A')throw {dos:13};var keep=f.d;f.d=basic.program();if(used()>496){f.d=keep;throw {dos:9}}}
    else addFile({n:D.name,t:'A',l:false,d:basic.program()});
    saveDisk();
    return {job:function(done){sleep(400,function(){done()})}};
  case 'DELETE':
    if(!f)throw {dos:6};if(f.l)throw {dos:10};
    disk.files[disk.files.indexOf(f)]=null;saveDisk();return 'ok';
  case 'LOCK':case 'UNLOCK':
    if(!f)throw {dos:6};f.l=c==='LOCK';saveDisk();return 'ok';
  case 'RENAME':
    if(!f)throw {dos:6};if(!D.name2||!/^[A-Z]/.test(D.name2))throw {dos:11};if(f.l)throw {dos:10};
    f.n=D.name2.slice(0,30);saveDisk();return 'ok';
  case 'VERIFY':if(!f)throw {dos:6};return 'ok';
  case 'BLOAD':case 'BRUN':
    if(!f)throw {dos:6};if(f.t!=='B')throw {dos:13};
    var a=D.opt.A!==undefined?D.opt.A:f.d.a;
    f.d.b.forEach(function(b,i){if(a+i<0xC000)mem[a+i]=b});
    if(c==='BLOAD')return 'ok';
    return {cpu:a};
  case 'BSAVE':
    if(D.opt.A===undefined||D.opt.L===undefined)throw {dos:11};
    var b=Array.prototype.slice.call(mem.subarray(D.opt.A,D.opt.A+D.opt.L));
    if(f){if(f.l)throw {dos:10};if(f.t!=='B')throw {dos:13};var kb=f.d;f.d={a:D.opt.A,b:b};if(used()>496){f.d=kb;throw {dos:9}}}
    else addFile({n:D.name,t:'B',l:false,d:{a:D.opt.A,b:b}});
    saveDisk();return 'ok';
  case 'OPEN':
    if(f&&f.t!=='T')throw {dos:13};
    if(!f){f={n:D.name,t:'T',l:false,d:''};addFile(f);saveDisk()}
    DOS.open[D.name]={f:f,at:0};return 'ok';
  case 'CLOSE':
    if(D.name)delete DOS.open[D.name];else DOS.open={};
    saveDisk();return 'ok';
  case 'APPEND':
    if(!f)throw {dos:6};if(f.t!=='T')throw {dos:13};
    DOS.open[D.name]={f:f,at:(f.d||'').length,append:true};return 'ok';
  case 'WRITE':case 'READ':case 'POSITION':case 'EXEC':
    if(!f)throw {dos:6};if(f.t!=='T')throw {dos:13};
    if(c==='EXEC'){DOS.exec=(f.d||'').split('\r').filter(function(l,i,a){return i<a.length-1||l});return 'ok'}
    var o=DOS.open[D.name];
    if(!o){o=DOS.open[D.name]={f:f,at:0}}
    if(c==='POSITION'){var n=D.opt.R||0,t=f.d||'';while(n-->0){var q=t.indexOf('\r',o.at);if(q<0)throw {dos:5};o.at=q+1}return 'ok'}
    if(c==='WRITE'){if(f.l)throw {dos:10};if(!o.append&&o.at===0&&!o.wrote)f.d='';o.wrote=true;DOS.w=f;return 'ok'}
    DOS.r=o;return 'ok';
  }
  throw {dos:11};
}
function readFileLine(){ /* INPUT while DOS reads a text file */
  var o=DOS.r,t=o.f.d||'';
  if(o.at>=t.length)throw {dos:5};
  var q=t.indexOf('\r',o.at);if(q<0)q=t.length;
  var l=t.slice(o.at,q);o.at=q+1;return l;
}
function catalog(done){ /* a page at a time: any key goes on */
  var L=['DISK VOLUME '+String(disk.vol).padStart(3,'0'),''];
  disk.files.forEach(function(f){if(f)L.push((f.l?'*':' ')+f.t+' '+String(sectors(f)%256).padStart(3,'0')+' '+f.n)});
  L.push('');
  var i=0,n=0;
  (function more(){ /* each line ends the one before: after 21 of them, a key for the next page */
    for(;i<L.length;i++){
      if(n===21&&i<L.length-1){n=0;waitKey(function(){mode='busy';more()});return}
      screenOut(13);say(L[i]);n++;
    }
    screenOut(13);DOS.lastCR=true;
    done();
  })();
}

/* ---------- memory as BASIC and the monitor see it ---------- */
function peek(a){
  a&=0xFFFF;
  if(a===0xC000)return kq.length?kq[0]|0x80:lastKey&0x7F;
  if(a===0xC010){var k=kq.length?kq[0]:lastKey;if(kq.length)kq.shift();return k&0x7F}
  if(a===0xC030){P.click(.3,400);return 0}
  if(a>=0xC000)return 0; /* soft switches, cards and the ROM: the ROM is not copied here */
  if(a===222)return basic.errInfo().code;
  if(a===218)return basic.errInfo().line&255;
  if(a===219)return basic.errInfo().line>>8;
  if(a===216)return basic.errInfo().on?0x80:0;
  if(a===241)return 256-basic.speed()&255;
  return mem[a];
}
function poke(a,v){
  a&=0xFFFF;v&=255;
  if(a===0xC010){if(kq.length)kq.shift();return}
  if(a===0xC030){P.click(.3,400);return}
  if(a>=0xC000)return;
  if(a===216&&!(v&0x80)){basic.clearOnerr();return}
  if(a===WW||a===WL||a===WT||a===WB){mem[a]=v;fixWindow();return}
  mem[a]=v;
  if(a>=0x400&&a<0x800)dirty=true;
}
function fixWindow(){
  if(mem[WW]<1)mem[WW]=1;if(mem[WL]>39)mem[WL]=39;if(mem[WL]+mem[WW]>40)mem[WW]=40-mem[WL];
  if(mem[WT]>23)mem[WT]=23;if(mem[WB]>24)mem[WB]=24;if(mem[WB]<=mem[WT])mem[WB]=mem[WT]+1;
  if(mem[CV]<mem[WT])mem[CV]=mem[WT];if(mem[CV]>=mem[WB])mem[CV]=mem[WB]-1;if(mem[CH]>=mem[WW])mem[CH]=0;
}
function textMode(){mem[WL]=0;mem[WW]=40;mem[WT]=0;mem[WB]=24;mem[INV]=0xFF;graphics=false;fixWindow()}

/* ---------- the 6502, and the ROM routines it may call ---------- */
var EXIT=0xC800;
function runCpu(at,then){
  cpu=CPU.cpu({read:peek,write:poke,trap:trap});
  cpu.s=0xF8;var r=EXIT-1;cpu.push(r>>8);cpu.push(r&255);
  cpu.a=mem[0x45];cpu.x=mem[0x46];cpu.y=mem[0x47];
  cpu.pc=at;cpuDone=then;mode='cpu';
}
function trap(C){ /* true: the routine at C.pc was done here, and returned from */
  var pc=C.pc;
  function ret(){C.rts();return true}
  switch(pc){
  case EXIT:endCpu('exit');return true;
  case 0xFDED:case 0xFDF0:out(C.a);return ret();
  case 0xFD8E:cr();return ret();
  case 0xFD8B:clreol();cr();return ret();
  case 0xFDDA:say(h2(C.a));return ret();
  case 0xFDE3:say((C.a&15).toString(16).toUpperCase());return ret();
  case 0xF941:say(h2(C.a)+h2(C.x));return ret();
  case 0xF948:say('   ');return ret();
  case 0xF94A:say(' '.repeat(C.x));return ret();
  case 0xFC58:home();return ret();
  case 0xFC42:clreop();return ret();
  case 0xFC9C:clreol();return ret();
  case 0xFC66:lf();return ret();
  case 0xFC70:scroll();return ret();
  case 0xFC22:case 0xFC24:return ret();
  case 0xFF3A:case 0xFBDD:bell();return ret();
  case 0xFF2D:say('ERR');bell();return ret();
  case 0xFD0C:case 0xFD1B:case 0xFD35: /* RDKEY: wait for it */
    C.waitKey=true;return true;
  case 0xFD6A:case 0xFD67:case 0xFD6F:
    if(pc===0xFD67)cr();
    C.waitLine=pc===0xFD6F?'':String.fromCharCode(mem[0x33]&0x7F);return true;
  case 0xFF69:case 0xFF65:case 0xFF59:endCpu('monitor');return true;
  case 0xE000:basic.newProg();endCpu('basic');return true;
  case 0xE003:case 0x9DBF:case 0x9D84:endCpu('basic');return true;
  case 0xFE89:case 0xFE93:case 0xFB2F:case 0xFCA8:return ret();
  case 0xFE80:mem[INV]=0x3F;return ret();
  case 0xFE84:mem[INV]=0xFF;return ret();
  }
  if(pc>=0x9600&&pc<0xC000)return false;
  return ret();
}
function endCpu(why){var f=cpuDone;cpu=null;cpuDone=null;mode='busy';if(f)f(why)}
function cpuTick(){
  var C=cpu;
  if(brkFlag){brkFlag=false;endCpu('basic');return}
  for(var i=0;i<20000&&cpu===C;i++){
    if(C.waitKey){var k=keyNow();if(k===null)return;C.waitKey=false;C.a=k|0x80;C.rts();continue}
    if(C.waitLine!==undefined&&C.waitLine!==null){
      var p=C.waitLine;C.waitLine=null;mode='busy';
      getln(p,function(t){
        for(var j=0;j<t.length;j++)mem[0x200+j]=t.charCodeAt(j)|0x80;
        mem[0x200+t.length]=0x8D;C.x=t.length;C.rts();mode='cpu';
      });
      return;
    }
    if(C.step()==='brk'){
      var a=(C.pc+2)&65535;
      mem[0x45]=C.a;mem[0x46]=C.x;mem[0x47]=C.y;mem[0x48]=C.p;mem[0x49]=C.s;
      cr();say(h4(a)+'-    '+regs());
      endCpu('brk');return;
    }
  }
}
function regs(){return 'A='+h2(mem[0x45])+' X='+h2(mem[0x46])+' Y='+h2(mem[0x47])+' P='+h2(mem[0x48])+' S='+h2(mem[0x49])}

/* ---------- the monitor: * ---------- */
var MON={next:0,lastL:0};
function monitor(){cr();getln('*',monLine)}
function monLine(t){ /* the IIe monitor's commands: 300  300.30F  300:A9 C1  .31F  300L  300G  300<800.80FM  3D0G  ^C */
  var i=0,pend=null,from=null,store=null,dest=null,did=false;
  function hex(){var v=0,n=0;while(/[0-9A-F]/.test(t.charAt(i))){v=(v*16+parseInt(t.charAt(i),16))&0xFFFF;i++;n++}return n?v:null}
  function dump(a,to){
    var first=true;
    for(;;){
      if(first||a%8===0){cr();say(h4(a)+'-')}
      say(' '+h2(peek(a)));first=false;
      if(a===to)break;
      a=(a+1)&0xFFFF;if(a===0)break;
    }
    MON.next=(to+1)&0xFFFF;did=true;
  }
  function flush(){if(pend===null)return;if(from!==null)dump(from,pend);else dump(pend,pend);from=null;pend=null}
  for(;;){
    var c=t.charAt(i);
    if(/[0-9A-F]/.test(c)){
      var v=hex();
      if(store!==null){poke(store,v);store=(store+1)&0xFFFF;MON.next=store;did=true;continue}
      if(pend!==null&&from===null)flush();
      pend=v;if(from===null)MON.next=v;continue;
    }
    if(c===' '){i++;if(store===null)flush();continue}
    if(c==='.'){i++;if(pend!==null){from=pend;pend=null}else from=MON.next;continue}
    if(c===':'){i++;store=pend!==null?pend:MON.next;pend=null;continue}
    if(c==='<'){i++;dest=pend;pend=null;continue}
    if(c==='M'||c==='V'){
      i++;
      if(dest!==null&&from!==null&&pend!==null){
        for(var k=0;k<=((pend-from)&0xFFFF);k++){
          var x=peek((from+k)&0xFFFF),y=peek((dest+k)&0xFFFF);
          if(c==='M')poke((dest+k)&0xFFFF,x);
          else if(x!==y){cr();say(h4((from+k)&0xFFFF)+'-'+h2(x)+' ('+h2(y)+')')}
        }
      }
      dest=from=pend=null;did=true;continue;
    }
    if(c==='+'||c==='-'){i++;var w=hex()||0,base0=pend||0;cr();say('='+h2(c==='+'?base0+w:base0-w));pend=null;did=true;continue}
    if(c==='G'){i++;var g=pend!==null?pend:MON.next;runCpu(g,afterMonCpu);return}
    if(c==='L'){
      i++;var la=pend!==null?pend:MON.lastL;pend=null;
      for(var n=0;n<20;n++){var d=CPU.disasm(peek,la);cr();say(d.text);la=(la+d.len)&0xFFFF}
      MON.lastL=la;did=true;continue;
    }
    if(c==='I'){i++;mem[INV]=0x3F;continue}
    if(c==='N'){i++;mem[INV]=0xFF;continue}
    if(c==='\u0003'){basicPrompt();return}
    if(c==='\u0002'){basic.newProg();basicPrompt();return}
    if(c==='\u0005'){i++;cr();say(regs());did=true;continue}
    if(c===''){
      if(pend!==null||from!==null){if(pend===null)pend=from;flush()}
      else if(!did&&store===null){dump(MON.next,MON.next|7)}
      break;
    }
    bell();break;
  }
  monitor();
}
function afterMonCpu(why){
  if(why==='basic')return basicPrompt();
  monitor();
}

/* ---------- BASIC: the ] prompt, and running ---------- */
function basicPrompt(){cr();prompt()}
function prompt(){mode='busy';getln(']',immediate)}
/* the terminal's own jokes, typed at the ] prompt only (in a program, BASIC has them as it always did):
   the line, its spaces ignored, and what is said instead */
var JOKES=[
  [/^(XYZZY|PLUGH)$/,['A hollow voice says "Fool."']], /* as Zork on the disk says it */
  [/^(PR|IN)#7$/,['NOTHING IN SLOT 7. THE CARD IS ON','BACK-ORDER: ALLOW SIX TO EIGHT WEEKS.']] /* a real empty slot hangs the machine */
];
function joke(text){
  var u=text.replace(/ /g,'').toUpperCase(),j=JOKES.filter(function(x){return x[0].test(u)})[0];
  if(!j)return false;
  j[1].forEach(function(s){cr();say(s)});basicPrompt();return true;
}
function immediate(text){
  var w=(text.match(/^[A-Z]+/)||[''])[0],rest=text.slice(w.length);
  if(phosphor()&&w&&TERMINAL[w]&&!/^\s*=/.test(rest)){terminal(w,rest.trim(),function(){prompt()});return}
  if(joke(text))return;
  var r;
  try{r=dos(text,false)}catch(e){if(e&&e.dos!==undefined){dosMessage(e.dos);basicPrompt();return}throw e}
  if(r!==null){afterDos(r,false,function(){prompt()});return}
  var b=basic.enter(text);
  if(b==='stored'||b==='error'){basicPrompt();return}
  mode='run';
}
function afterDos(r,inProg,then){ /* what a DOS command left to do: wait, run, boot */
  if(r==='boot'){boot();return}
  if(r==='restart'){basicPrompt();return}
  if(r&&r.cpu!==undefined){runCpu(r.cpu,function(why){if(why==='monitor'||why==='brk')return monitor();if(why==='basic')return basicPrompt();then()});return}
  if(r&&r.job){
    mode='busy';
    r.job(function(res){
      if(res&&res.dos!==undefined){
        if(inProg){fail(res.dos);return}
        dosMessage(res.dos);basicPrompt();return;
      }
      if(res==='run'||res==='chain'){if(res==='run')basic.run();else basic.chain();mode='run';return}
      if(res==='loaded'&&inProg){basic.stop();basicPrompt();return}
      then();
    });
    return;
  }
  then();
}
var slowUntil=0,lastBrk=-1e9;
function runBasic(){
  var sp=basic.speed();
  if(sp<255&&performance.now()<slowUntil)return;
  var r=basic.step(sp<255?1:60);
  if(sp<255){var k=256-sp;slowUntil=performance.now()+basic.spent()*(26+27*k+5*k*k)/2/1020} /* SPEED=: the monitor's delay after each character */
  if(r==='more')return;
  if(r==='done'){basicPrompt();return}
  var w=basic.want();
  if(w.wait==='line'){
    if(DOS.r){
      var l;
      try{l=readFileLine()}catch(e){fail(e.dos);return}
      basic.answer(l);return;
    }
    mode='busy';
    say(w.prompt);
    getln('',function(t){basic.answer(t);mode='run'},function(){basic.brk();basicPrompt()});
    return;
  }
  if(w.wait==='key'){
    if(DOS.r){var o=DOS.r,t=o.f.d||'';if(o.at>=t.length){fail(5);return}var ch=t.charCodeAt(o.at++);basic.answer(ch);return}
    mode='busy';waitKey(function(k){basic.answer(k);mode='run'});return;
  }
  if(w.wait==='mem'){mode='waitmem';return}
  if(w.wait==='cpu'){mode='busy';runCpu(w.at,function(why){
    if(why==='monitor'||why==='brk'){basic.stop();monitor();return}
    if(why==='basic'){basic.stop();basicPrompt();return}
    basic.answer();mode='run';
  });return}
  if(w.wait==='dos'){mode='busy';afterDos(w.r,true,function(){basic.answer();mode='run'});return}
  if(w.wait==='view'){mode='busy';terminal(w.name,w.args,function(){basic.answer();mode='run'});return}
  if(w.wait==='tape'){mode='tape';return} /* a cassette that never comes: only reset (here ^C) gets out */
  if(w.wait==='boot'){basic.stop();boot();return}
}
function fail(code){basic.fail(code);if(basic.running())mode='run';else basicPrompt()}
function waitMem(){
  var w=basic.want();
  if(brkFlag){brkFlag=false;basic.brk();basicPrompt();return}
  if(((peek(w.a)^w.x)&w.m)!==0){basic.answer();mode='run'}
}
function sleep(ms,f){sleepUntil=performance.now()+ms;sleepCb=f;mode='sleep'}

/* the machine around BASIC */
var MACH={
  out:out,ch:function(){return mem[CH]},tab:function(n){mem[CH]=Math.min(n,mem[WW]-1)},bell:bell,
  broken:function(){ /* a second ^C within a second gets past ONERR, as reset would */
    if(!brkFlag)return false;
    brkFlag=false;if(kq[0]===3)kq.shift();
    var t=performance.now(),hard=t-lastBrk<1000;lastBrk=t;
    return hard?'hard':true;
  },
  home:home,
  htab:function(n){var x=n-1;while(x>=mem[WW]){x-=mem[WW];lf()}mem[CH]=x},
  vtab:function(n){mem[CV]=Math.max(mem[WT],Math.min(n-1,mem[WB]-1))},
  mode:function(v){mem[INV]=v},text:textMode,graphics:function(){graphics=true},
  peek:peek,poke:poke,
  call:function(a){return {wait:'cpu',at:a}},
  slot:function(io,n){if(n===6)return {wait:'boot'};return null},
  tape:function(){return {wait:'tape'}},
  amper:amper,
  pending:function(){return DOS.pend!==null},
  runDos:function(){
    var c=DOS.pend;DOS.pend=null;DOS.w=null;DOS.r=null;
    if(!c.trim())return null;
    var r=dos(c,basic.running());
    if(r===null)throw {dos:11};
    if(r==='ok')return null;
    return {wait:'dos',r:r};
  },
  dosMessage:dosMessage
};

/* ---------- the PHOSPHOR card: & and the terminal's own commands ---------- */
var TERMINAL={};
function phosphor(){return mem[0x3F5]===0x4C&&mem[0x3F6]===0xBF&&mem[0x3F7]===0x03}
function amper(t){
  if(!phosphor()){
    var v=mem[0x3F6]|mem[0x3F7]<<8;
    if(mem[0x3F5]===0x4C&&v<0xC000&&v!==0x3BF)return {wait:'cpu',at:v};
    return false;
  }
  var s=t.trim(),q=s.match(/^"([^"]*)"?$/);
  if(q)s=q[1];
  s=s.replace(/ +/g,' ').trim();
  var w=(s.match(/^[A-Z]+/)||[''])[0],rest=s.slice(w.length).trim();
  if(s==='WELCOME'){welcome();return null}
  if(/^ZORK ?(I|II|1|2)$/.test(s)){return {wait:'view',name:/II|2$/.test(s)?'ZORK2':'ZORK1',args:''}}
  if(TERMINAL[w])return {wait:'view',name:w,args:rest};
  return false;
}
function welcome(){ /* the site's welcome, word-wrapped to the screen */
  var L=WELCOME.concat(MAILNOTE?['',MAILNOTE]:[],P.columns&&coarse()?['','(tap the screen for a keyboard.)']:[]);
  L.forEach(function(l){
    var t=String(Array.isArray(l)?l[0]:l).replace(/[\u0001-\u0004]/g,'');
    wrap(t,39).forEach(function(x){say(x);cr()});
  });
}
function coarse(){return window.matchMedia&&matchMedia('(pointer:coarse)').matches}
function wrap(t,w){
  var o=[];
  while(t.length>w){var k=t.lastIndexOf(' ',w);if(k<=0)k=w;o.push(t.slice(0,k));t=t.slice(k).replace(/^ /,'')}
  o.push(t);return o;
}
function terminal(w,args,then){ /* the terminal's own commands: some answer here, the rest on the terminal's glass */
  var a=args.toLowerCase().split(/\s+/).filter(Boolean);
  if(w==='FILL'){P.fillGlass(!P.fillGlass());then();return}
  if(w==='SOUND'){
    if(a[0]==='on'){if(!P.sound(true))say('NO SOUND HARDWARE DETECTED.');else say('KEYCLICKS ON.')}
    else if(a[0]==='off'){P.sound(false);say('KEYCLICKS OFF.')}
    else say('KEYCLICKS '+(P.sound()?'ON':'OFF')+'. SOUND ON OR SOUND OFF.');
    cr();then();return;
  }
  if(w==='EFFECTS'){
    if(/^(auto|full|lite)$/.test(a[0]||'')){P.effects(a[0]);say('EFFECTS '+a[0].toUpperCase()+'.')}
    else{var e=P.effects();say('EFFECTS '+e.mode.toUpperCase()+(e.mode==='auto'?': '+(e.lite?'LITE':'FULL'):'')+'. EFFECTS AUTO, FULL OR LITE.')}
    cr();then();return;
  }
  if(w==='CONNECT'&&P.allowed.length>1){
    if(!a[0]){
      say('MACHINES ON THE LINE:');cr();
      P.allowed.forEach(function(id){say(((id===P.machine?'* ':'  ')+id.padEnd(8)+' '+(P.catalog[id].name||'')+' ('+P.catalog[id].year+')').toUpperCase().slice(0,79));cr()});
      then();return;
    }
    if(P.allowed.indexOf(a[0])<0){say('CONNECT: '+a[0].toUpperCase()+': NO SUCH MACHINE');cr();then();return}
    if(a[0]===P.machine){say('CONNECT: ALREADY ON '+a[0].toUpperCase());cr();then();return}
    say('CONNECTING TO '+a[0].toUpperCase()+'...');cr();
    sleep(600,function(){var q=new URLSearchParams(location.search);q.set('machine',a[0]);location.search=q.toString()});
    return;
  }
  if(w==='ZORK1'||w==='ZORK2'){leave(function(){zork(w.toLowerCase())},then);return}
  var name=w.toLowerCase();
  if(!P.has(P.cmds,name)){bell();then();return}
  leave(function(){
    P.cmds[name](a,(name+' '+args).trim(),[name].concat(args.split(/\s+/).filter(Boolean)));
  },then,true);
}
function zork(game){
  var ok=false;
  P.queue(function(){return P.load(['../shared/zmachine.js','../shared/'+game+'-story.js']).then(function(x){ok=x})});
  P.queue(function(){if(ok)P.zmachine.play(game);else P.typeLine(game.toUpperCase()+': cannot execute','err')});
}
function leave(what,then,hint){ /* off the Apple's screen to the terminal's own, and back on a key */
  var keep=mode;
  closeScreen();
  P.queue(what);
  if(hint){
    P.queue(function(){P.typeLine('(press any key to go back to the apple.)','dim')});
    P.queue(function(){return P.readKey('',true)});
  }
  P.queue(function(){openScreen(function(){mode=keep==='getln'?'busy':keep;then()})});
}

/* ---------- power on, and PR#6 ---------- */
function resetMemory(){
  mem.fill(0,0,0x400);mem.fill(0,0x800,0xC000);
  for(var r=0;r<24;r++)for(var c=0;c<40;c++)mem[base(r)+c]=0xA0;
  textMode();mem[CH]=0;mem[CV]=23;mem[0x33]=0xDD;
  mem.set([0x4C,0x58,0xFF],0x3F5);         /* & goes nowhere until the card's program says otherwise */
  mem.set([0x4C,0xBF,0x9D,0x4C,0x84,0x9D],0x3D0);
  mem.set([0x4C,0x03,0xE0],0x3F2);
  DOS=freshDos();
  kq=[];brkFlag=false;dirty=true;
}
function boot(){
  mode='busy';
  loadDisk();
  resetMemory();
  var t='Apple ][';for(var i=0;i<t.length;i++)mem[base(0)+15+i]=t.charCodeAt(i)|0x80;
  basic=P.applesoft(MACH);
  dirty=true;
  booting=true;
  sleep(booted?900:1300,function(){
    booted=true;booting=false;
    say('\r\r]');cr();
    var f=findFile('HELLO');
    if(f&&f.t==='A'){basic.load(f.d||[]);basic.run();mode='run';return}
    if(f){dosMessage(13);basicPrompt();return} /* DOS RUNs the greeting: a binary or text HELLO is a FILE TYPE MISMATCH */
    prompt();
  });
}

/* ---------- the screen program, and the clock that runs it ---------- */
function tick(){
  try{
    if(mode==='run')runBasic();
    else if(mode==='cpu')cpuTick();
    else if(mode==='waitmem')waitMem();
    else if(mode==='tape'&&brkFlag){brkFlag=false;basic.stop();basicPrompt()}
    else if(mode==='sleep'&&performance.now()>=sleepUntil){mode='busy';var f=sleepCb;sleepCb=null;f()}
  }catch(e){
    if(e&&e.dos!==undefined){dosMessage(e.dos);if(basic)basic.stop();basicPrompt()}
    else throw e;
  }
  draw();
}
function openScreen(after){
  P.program(function(S0,done){
    S=S0;closeFn=done;el=document.getElementById('full');
    rows=[];layout();
    S.every(16,tick);
    S.every(267,function(){blinkOn=!blinkOn;if(mode==='getln'||mode==='key'||hasFlash())dirty=true});
    S.onThrow=function(e){console.error(e);closeScreen();P.queue(function(){P.typeLine('apple: '+(e&&e.message||e),'err')})};
    if(after)after();
    draw();
    return {feed:feed,draw:function(){dirty=true;draw()},resize:function(){layout();draw()}};
  });
}
function hasFlash(){for(var a=0x400;a<0x800;a++)if(mem[a]>=0x40&&mem[a]<0x80)return true;return false}
function closeScreen(){if(!S)return;var f=closeFn;S.close();S=null;el=null;closeFn=null;f()}

P.setup(function(){
  WELCOME=P.profile.welcome||[];MAILNOTE=P.profile.mail.length?P.profile.mailNotice:'';
  P.profile.welcome=[];P.profile.mailNotice='';
  P.setPrompt(function(){return ''});
  ['help','mail','about','source','fill','sound','effects','connect'].concat(Object.keys(P.cmds)).forEach(function(n){if(P.has(P.cmds,n))TERMINAL[n.toUpperCase()]=1});
  P.fallback=function(word,raw){openScreen(function(){prompt()});return true}; /* typed at the terminal's own prompt: back to the Apple */
  setTimeout(function(){
    P.queue(function(){
      if(P.profile.problems.length)return P.readKey('',true);
    });
    P.queue(function(){openScreen(boot)});
  },0);
});
})(window.Phosphor);
