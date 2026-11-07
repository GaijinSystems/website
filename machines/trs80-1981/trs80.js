/* PHOSPHOR-9 terminal: machine "trs80-1981", a Radio Shack TRS-80 Model III with two disk drives: its 64 by 16
   screen and block graphics, its keyboard, TRSDOS 1.3 and its disk (kept in this browser), BASIC with the cassette
   (kept in this browser too), and PHOSPHOR/CMD, which joins it to this terminal.
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE.
   The screens, prompts and messages were checked against a Model III with TRSDOS 1.3 in xtrs, and its ROM BASIC
   in MAME. The TRSDOS logo at boot is drawn for this terminal, not copied. */
(function(P){
'use strict';
var DISKKEY='trs80/disk',TAPEKEY='trs80/tape';
var vram=new Uint8Array(1024),cp=0,cursorOn=true,dirty=true,blinkOn=true;
var calm=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;
var S=null,el=null,cv=null,closeFn=null,rows=[],cellW=8,cellH=24,mode='off',GL=null,keyCb=null,kq=[],brkFlag=false;
var basic=null,disk=null,tape=null,sleepUntil=0,sleepCb=null,booting=false,bootBreak=false,clockOn=false;
var WELCOME=[],MAILNOTE='',TERMINAL={},hooked=false,date=null;

/* ---------- the screen: 1024 bytes at 3C00H, as the Model III keeps them ---------- */
function scrollUp(){vram.copyWithin(0,64);vram.fill(32,960);if(clockOn)showClock();dirty=true}
function nl(){cp=(cp>>6<<6)+64;if(cp>=1024){scrollUp();cp=960}}
function put(c){ /* the ROM's display driver: one byte */
  c&=255;dirty=true;
  if(c===13||c===10){nl();return}
  if(c===8){if(cp>0){cp--;vram[cp]=32}return}
  if(c===24){if(cp>0)cp--;return}
  if(c===25){if(cp<1023)cp++;return}
  if(c===26){if(cp<960)cp+=64;return}
  if(c===27){if(cp>=64)cp-=64;return}
  if(c===28){cp=0;return}
  if(c===29){cp=cp>>6<<6;return}
  if(c===30){vram.fill(32,cp,(cp>>6<<6)+64);return}
  if(c===31){vram.fill(32,cp);return}
  if(c===14){cursorOn=true;return}
  if(c===15){cursorOn=false;return}
  if(c<32)return;
  if(c>=192){for(var i=0;i<c-192;i++)put(32);return} /* space compression codes */
  vram[cp]=c;cp++;
  if(cp>=1024){scrollUp();cp=960}
}
function say(s){for(var i=0;i<s.length;i++)put(s.charCodeAt(i))}
function line(s){say(s);put(13)}
function cls(){vram.fill(32);cp=0;if(clockOn)showClock();dirty=true}
function col(){return cp&63}
function rowText(r,glyphs){ /* glyphs: [ \ ] ^ as the arrows the glass shows */
  var s='';for(var c=0;c<64;c++){var b=vram[r*64+c];s+=b>=32&&b<128?(glyphs&&GLYPH[b]||String.fromCharCode(b)):' '}return s.replace(/ +$/,'')}
function setPixel(x,y,on){ /* SET and RESET: a cell turns graphic, and one of its six blocks lights or goes out */
  var a=(y/3|0)*64+(x>>1),bit=1<<((y%3)*2+(x&1)),b=vram[a];
  if(b<128||b>191)b=128;
  vram[a]=on?b|bit:b&~bit;dirty=true;
}
function getPixel(x,y){var b=vram[(y/3|0)*64+(x>>1)];return b>=128&&b<=191&&(b&(1<<((y%3)*2+(x&1))))!==0}
function showClock(){
  var d=date?clockNow():null;if(!d)return;
  var t=hms(d);
  for(var i=0;i<8;i++)vram[56+i]=t.charCodeAt(i);dirty=true;
}

/* ---------- drawing the glass: the text in lines, the blocks and the cursor on a canvas over them ---------- */
var GLYPH={91:'↑',92:'↓',93:'←',94:'→'}; /* [ \ ] ^ show as the arrows the Model III draws there */
function layout(){
  if(!el)return;
  el.style.fontSize='';el.style.letterSpacing='';el.style.lineHeight='';
  var cs=getComputedStyle(el),term=document.getElementById('term');
  var w=el.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight);
  var h=term.clientHeight-parseFloat(cs.paddingTop)-parseFloat(cs.paddingBottom);
  var fs=parseFloat(cs.fontSize)*2;
  el.style.fontSize=fs+'px';
  var cw=charWidth();
  fs=Math.max(6,fs*w/(cw*64)*.99);el.style.fontSize=fs+'px';cw=charWidth();
  cellW=w/64;cellH=Math.max(fs*1.05,Math.min(h/16,fs*2.6));
  el.style.letterSpacing=Math.max(0,cellW-cw)+'px';
  el.style.setProperty('--trs-lh',cellH+'px');
  el.style.setProperty('--trs-sy',Math.min(1.7,Math.max(1,cellH/(fs*1.2))).toFixed(3));
  rows=[];while(el.firstChild)el.removeChild(el.firstChild);
  cv=document.createElement('canvas');cv.className='trs-blocks';cv.setAttribute('aria-hidden','true');
  var dpr=window.devicePixelRatio||1;
  cv.width=Math.round(64*cellW*dpr);cv.height=Math.round(16*cellH*dpr);
  cv.style.width=64*cellW+'px';cv.style.height=16*cellH+'px';
  cv.style.left=cs.paddingLeft;cv.style.top=cs.paddingTop;
  el.appendChild(cv);
  dirty=true;
}
function charWidth(){
  var p=document.createElement('span');p.textContent='0000000000';
  p.style.cssText='position:absolute;visibility:hidden;white-space:pre;letter-spacing:0';
  el.appendChild(p);var w=p.getBoundingClientRect().width/10;p.remove();return w;
}
function waiting(){return mode==='getln'||mode==='key'}
function idleNow(){
  var w=waiting(),term=document.getElementById('term');
  if(term&&term.classList.contains('idle')!==w)term.classList.toggle('idle',w);
  return w;
}
function draw(){
  if(!el)return;
  var w=idleNow();
  if(!dirty)return;
  dirty=false;
  for(var r=0;r<16;r++){
    var s=rowText(r,true);
    if(rows[r]&&rows[r].s===s)continue;
    var d=document.createElement('div');d.className='line trs-row';d.textContent=s;
    if(rows[r])el.replaceChild(d,rows[r].d);else el.insertBefore(d,cv);
    rows[r]={d:d,s:s};
  }
  if(!cv)return;
  var g=cv.getContext('2d'),dpr=cv.width/(64*cellW),bw=cellW/2*dpr,bh=cellH/3*dpr;
  g.clearRect(0,0,cv.width,cv.height);
  var colr=getComputedStyle(document.documentElement).getPropertyValue('--phos').trim()||'#3dff7e',lite=document.documentElement.classList.contains('lite');
  g.fillStyle=colr;
  if(!lite&&!calm){g.shadowColor=colr;g.shadowBlur=5*dpr}
  for(var a=0;a<1024;a++){
    var v=vram[a];if(v<129||v>191)continue;
    var x0=(a&63)*cellW*dpr,y0=(a>>6)*cellH*dpr;
    for(var k=0;k<6;k++)if(v&(1<<k))g.fillRect(Math.floor(x0+(k&1)*bw),Math.floor(y0+(k>>1)*bh),Math.ceil(bw),Math.ceil(bh));
  }
  if(w&&cursorOn&&(blinkOn||calm)){ /* the cursor: the bottom row of blocks, blinking */
    g.fillRect(Math.floor((cp&63)*cellW*dpr),Math.floor(((cp>>6)*cellH+cellH*2/3)*dpr),Math.ceil(cellW*dpr),Math.ceil(bh));
  }
}

/* ---------- the keyboard: capitals, as it comes from Radio Shack ---------- */
var KEYMAP={Enter:13,Backspace:8,ArrowLeft:8,ArrowRight:9,ArrowUp:91,ArrowDown:10,Escape:1,Tab:9,Home:31,'C-c':1,'C-x':24,'C-u':24};
function feed(k){
  var c=KEYMAP[k];
  if(c===undefined){
    if(k.length===1)c=k.charCodeAt(0);
    else return;
  }
  if(c>=97&&c<=122)c-=32;
  if(c===94)c=91; /* ^ is the up arrow, BASIC's power sign */
  if(c>127)return;
  P.click(c===13?1:.667,c===13?700:undefined);
  if(c===1&&!waiting())brkFlag=true;
  if(mode==='getln'){glKey(c);idleNow();return}
  if(mode==='key'){var f=keyCb;keyCb=null;mode='busy';f(c);idleNow();return}
  if(booting&&c===1){bootBreak=true;return}
  if(c!==1&&kq.length<32)kq.push(c);
}
function keyNow(){return kq.length?kq.shift():null}
function waitKey(f){var k=keyNow();if(k!==null){f(k);return}keyCb=f;mode='key';dirty=true}

/* ---------- a line from the keyboard: the ROM's, or TRSDOS's with its row of dots ---------- */
function getln(o,cb,brk){ /* o: {dots:n, max:n} */
  o=o||{};
  brkFlag=false;
  GL={buf:'',cb:cb,brk:brk,dots:o.dots||0,max:o.max||240,start:cp};
  if(GL.dots)vram.fill(46,cp,cp+GL.dots);
  mode='getln';dirty=true;
  while(mode==='getln'&&kq.length)glKey(kq.shift());
  if(mode==='getln'&&S)S.say(rowText(cp>>6));
}
function glKey(c){
  var G=GL;dirty=true;
  function end(){if(G.dots)vram.fill(32,cp,(cp>>6<<6)+64);mode='busy';GL=null} /* the dots left over go */
  function rub(){G.buf=G.buf.slice(0,-1);cp--;vram[cp]=G.dots?46:32}
  if(c===13){end();nl();G.cb(G.buf);return}
  if(c===1){if(G.brk){end();G.brk()}return}
  if(c===8){if(G.buf.length)rub();return}
  if(c===24){while(G.buf.length)rub();return}
  if(c===9){do{if(G.buf.length>=G.max)break;G.buf+=' ';put(32)}while(col()%8);return}
  if(c===10&&!G.dots){G.buf+=' ';nl();return}
  if(c<32)return;
  if(G.buf.length>=G.max||G.dots&&G.buf.length>=G.dots)return;
  G.buf+=String.fromCharCode(c);
  put(c);
}

/* ---------- the clock ---------- */
var clockBase=null;
function clockNow(){return new Date(date.getTime()+(performance.now()-clockBase))}
function setClock(d){date=d;clockBase=performance.now()}
function mmddyy(d){return P.p2(d.getMonth()+1)+'/'+P.p2(d.getDate())+'/'+P.p2(d.getFullYear()%100)}
function hms(d){return P.p2(d.getHours())+':'+P.p2(d.getMinutes())+':'+P.p2(d.getSeconds())}

/* ---------- the disk in drive 0, kept in this browser ---------- */
/* 40 tracks of six granules; TRSDOS itself and the directory take what the real system disk's free map shows */
var SYSGRAN=(function(){var u=[];for(var t=0;t<40;t++)for(var g=0;g<6;g++)u.push(t<5||t===5&&g<4||t>=15&&t<=20||t===21&&g<4);return u})();
function loadDisk(){
  var d=P.saved(DISKKEY);
  if(d&&d.v===1&&Array.isArray(d.files)&&d.files.every(okFile)){disk=d;return}
  disk={v:1,files:P.trsDisk().map(function(f){
    var o={n:f.n,date:f.date||'05/81',lrl:256,attr:f.attr||'N*X0'};
    if(f.src){o.t='B';o.src=f.src.slice()}
    else if(f.text!==undefined){o.t='T';o.text=f.text}
    else{o.t='C';o.size=f.size||256;o.run=f.run||'';if(f.data)o.data=true}
    return o;
  })};
}
function okFile(f){return f&&typeof f.n==='string'&&/^[A-Z][A-Z0-9]{0,7}(\/[A-Z0-9]{1,3})?$/.test(f.n)&&
  (f.t==='B'&&Array.isArray(f.src)&&f.src.every(srcLine)||f.t==='T'&&typeof f.text==='string'||f.t==='C'&&Number.isInteger(f.size)&&f.size>=0&&f.size<=130000)}
function srcLine(l){return typeof l==='string'&&/^\d+ /.test(l)}
function saveDisk(){return P.save(DISKKEY,disk)}
function full(){return P.save('trs80/probe',null)} /* after a failed save: true if the browser keeps data but is out of room, false if it keeps none (then this visit's disk and tape still work) */
function bytesOf(f){
  if(f.t==='C')return f.size;
  if(f.t==='T')return f.text.length;
  if(f.ascii)return f.src.reduce(function(a,l){return a+l.length+1},1);
  return progBytes(f).length;
}
function crunch(src){return src.map(function(l){var m=l.match(/^(\d+) ?(.*)$/);return [+m[1],P.trsBasic.parse(m[2])]})} /* a listing's lines, as BASIC keeps them */
function progBytes(f){ /* the bytes a SAVE writes: FF, then each line with its link and number, crunched */
  if(f.ascii){var s=f.src.join('\r')+'\r',a=[];for(var i=0;i<s.length;i++)a.push(s.charCodeAt(i)&255);a.push(26);return a}
  var b=[255],addr=0x6A00;
  crunch(f.src).forEach(function(L){
    var n=L[0],t=L[1];
    addr+=5+t.length;
    b.push(addr&255,addr>>8,n&255,n>>8);t.forEach(function(x){b.push(x)});b.push(0);
  });
  b.push(0,0);return b;
}
function fileBytes(f){
  if(f.t==='B')return progBytes(f);
  if(f.t==='T'){var a=[];for(var i=0;i<f.text.length;i++)a.push(f.text.charCodeAt(i)&255);return a}
  var c=[];for(var j=0;j<f.size;j++)c.push(0);return c;
}
function grans(f){return Math.max(1,Math.ceil(bytesOf(f)/768))}
function freeGrans(){return 166-disk.files.reduce(function(a,f){return a+grans(f)},0)}
function findFile(n){for(var i=0;i<disk.files.length;i++)if(disk.files[i].n===n)return disk.files[i];return null}
function spec(s){ /* a file specification: NAME/EXT.PASSWORD:D; null if it is not one */
  var m=String(s).toUpperCase().trim().match(/^([A-Z][A-Z0-9]{0,7})(\/[A-Z0-9]{1,3})?(\.[A-Z0-9]{1,8})?(:[0-9])?$/);
  if(!m)return null;
  return {n:m[1]+(m[2]||''),drive:m[4]?+m[4].slice(1):0};
}
function writeFile(f){
  var old=findFile(f.n),i=old?disk.files.indexOf(old):-1;
  if(i>=0)disk.files[i]=f;else disk.files.push(f);
  if(freeGrans()<0||(!saveDisk()&&full())){if(i>=0)disk.files[i]=old;else disk.files.pop();return 27} /* the browser's storage full: Disk full too */
  return 0;
}

/* ---------- TRSDOS 1.3 ---------- */
var DOSERR={0:'No Error Found',1:'CRC Error During Disk I/O',2:'Disk Drive Not In System',3:'Lost Data During Disk I/O',
  4:'CRC Error During Disk I/O',5:'Disk Sector Not Found',6:'Disk Drive Hardware Fault',8:'Disk Drive Not Ready',
  9:'Illegal I/O Attempt',10:'Required Command Parameter Not Found',11:'Illegal Command Parameter',12:'Time Out On Disk Drive',
  13:'I/O Attempt To Non System Disk',14:'Write Fault On Disk I/O',15:'Write Protected Disk',16:'Illegal Logical File Number',
  17:'Directory Read Error',18:'Directory Write Error',19:'Invalid File Name',20:'GAT Read Error',21:'GAT Write Error',
  22:'HIT Read Error',23:'HIT Write Error',24:'File Not Found',25:'File Access Denied Due to To Password Protection',
  26:'Directory Space Full',27:'Disk Space Full',28:'Attempt To Read Past EOF',29:'Attempt To Read Outside of File Limits',
  30:'No More Extents Available',31:'Program Not Found',32:'Invalid Drive Number',34:'Attempt To Use Non Program File As a Program',
  35:'Memory Fault During Program Load',37:'File Access Denied Due to To Password Protection',38:'I/O Attempt To Unopen File',
  39:'Invalid Command Parameter',40:'File Already In Directory',41:'Attempt To Open File Already Open',42:'Invalid Record Length'};
var LIB=['APPEND','ATTRIB','AUTO','BACKUP','BUILD','CLEAR','CLOCK','CLS','COPY','CREATE','DATE','DEBUG','DIR','DO','DUAL',
  'DUMP','ERROR','FORMS','FORMAT','FREE','HELP','KILL','LIB','LIST','LOAD','MASTER','PATCH','PAUSE','PROT','PURGE','RELO',
  'RENAME','ROUTE','SETCOM','TAPE','TIME','WP'];
var HELPS=['APPEND','ATTRIB','AUTO','BACKUP','BUILD','CLEAR','CLOCK','CLS','COPY','CREATE','DATE','DEBUG','DIR','DO','DUAL','DUMP',
  'ERROR','FSPEC','FORMS','FORMAT','FREE','HELP','KILL','LIB','LIST','LOAD','MASTER','PATCH','PAUSE','PROT','PURGE','RELO',
  'RENAME','ROUTE','SETCOM','SYNTAX','TAPE','TIME','WP'];
function table(words,first){ /* eight to a line, as LIB and HELP set them out */
  for(var i=0;i<words.length;i+=8){
    var l=words.slice(i,i+8).map(function(w,j){return i===0&&j===0&&first?w.padEnd(first):w.padEnd(8)}).join('');
    line(l.replace(/ +$/,''));
  }
}
function dosError(n){line('* * ERROR '+n+' * *');line('Operation Aborted');dosReady()}
function dosReady(){line('TRSDOS Ready');dosPrompt()}
function dosPrompt(){mode='busy';basic=null;getln({dots:63,max:63},dosLine,function(){dosReady()})}
var NOTHERE=['CMD','DO','ROUTE','TAPE','PATCH','DUMP','LOAD','APPEND','COPY','BUILD','ATTRIB','PROT','FORMAT','BACKUP',
  'DUAL','MASTER','PURGE','SETCOM','FORMS','CREATE','RELO','PAUSE','WP','CLEAR']; /* TRSDOS's, that do nothing here */
var DOSCMD={
  DIR:function(a){
    if(a&&!/^:0$/.test(a))return a.charAt(0)===':'?32:11;
    line('Disk Name: TRSDOS      Drive: 0           07/01/81');
    line('Filename      Attrb    LRL   #Rec   #Grn   #Ext    EOF   Date');
    disk.files.forEach(function(f){
      var b=bytesOf(f),rec=Math.max(1,Math.ceil(b/256)),eof=b%256;
      line(f.n.padEnd(15)+(f.attr||'N*X0').padEnd(5)+String(f.lrl||256).padStart(6)+String(rec).padStart(7)+String(grans(f)).padStart(7)+
        '      1'+String(eof).padStart(7)+'   '+f.date);
    });
    line('***  '+freeGrans()+' Free Granules ***');
  },
  FREE:function(a){
    if(a&&!/^:0$/.test(a))return 11;
    var used=SYSGRAN.slice(),n=0;
    disk.files.forEach(function(f){for(var k=grans(f);k>0;k--){while(n<240&&used[n])n++;if(n<240)used[n]=true}});
    line('                     Free Space Map');
    line('Trk #     TRSDOS   ------------------    Drive: 0');
    for(var t=0;t<40;t+=5){
      var p=[];
      for(var u=t;u<t+5;u++){
        if(u===17){p.push('Direct');continue}
        var s='';for(var g=0;g<6;g++)s+=used[u*6+g]?'X':'.';p.push(s);
      }
      line(P.p2(t)+'-'+P.p2(t+4)+':    '+p.join(' : '));
    }
  },
  LIB:function(){table(LIB)},
  HELP:function(a){
    if(a){var w=a.toUpperCase();if(HELPS.indexOf(w)<0)return 11;line(w+': see the TRSDOS manual, section '+w.charAt(0)+'.');return}
    line('Help is avaliable for the following:');
    table(HELPS,9);
    if(!hooked)return;
    var t=Object.keys(TERMINAL).filter(function(w){return w!=='HELP'}).sort();
    line('The terminal\'s own, not TRSDOS\'s:');
    table(t);
  },
  CLS:function(){cls()},
  TIME:function(a){
    if(!a){line(hms(clockNow()));return}
    var m=a.match(/^(\d\d):(\d\d):(\d\d)$/);
    if(!m||+m[1]>23||+m[2]>59||+m[3]>59)return 11;
    var d=clockNow();d.setHours(+m[1],+m[2],+m[3]);setClock(d);
  },
  DATE:function(a){
    if(!a){line(mmddyy(clockNow()));return}
    var d=parseDate(a);if(!d)return 11;
    var n=clockNow();d.setHours(n.getHours(),n.getMinutes(),n.getSeconds());setClock(d);
  },
  CLOCK:function(a){
    clockOn=!/^\(?OFF\)?$/.test((a||'').toUpperCase());
    if(!clockOn){vram.fill(32,56,64);dirty=true}else showClock();
  },
  KILL:function(a){
    if(!a)return 10;
    var f=spec(a);if(!f)return 19;
    say('Killing '+f.n);
    var x=findFile(f.n);if(!x||f.drive)return 24;
    disk.files.splice(disk.files.indexOf(x),1);saveDisk();put(13);
  },
  RENAME:function(a){
    var m=(a||'').toUpperCase().match(/^(\S+)\s+(?:TO\s+)?(\S+)$/);
    if(!m)return 10;
    var f=spec(m[1]),g=spec(m[2]);if(!f||!g)return 19;
    var x=findFile(f.n);if(!x)return 24;
    if(findFile(g.n))return 40;
    x.n=g.n;saveDisk();
  },
  LIST:function(a,done){
    if(!a)return 10;
    var f=spec(a);if(!f)return 19;
    var x=findFile(f.n);if(!x)return 24;
    dump(x,done);return 'later';
  },
  ERROR:function(a){
    if(!/^\d+$/.test(a||''))return 10;
    var n=+a;line(DOSERR[n]||'* * Undefined Error Code * *');
  },
  BASIC:function(a,done){startBasic(true,a);return 'later'},
  AUTO:function(){return 0},
  DEBUG:function(){return 0}
};
function parseDate(a){
  var m=String(a).match(/^(\d\d)\/(\d\d)\/(\d\d)$/);
  if(!m)return null;
  var mo=+m[1],dd=+m[2],y=1900+(+m[3]);
  if(mo<1||mo>12||dd<1||dd>new Date(y,mo,0).getDate())return null;
  return new Date(y,mo-1,dd);
}
function dump(f,done){ /* LIST: each record as its characters and its two hex digits, sixty bytes to a row */
  var b=fileBytes(f),recs=Math.max(1,Math.ceil(b.length/256)),r=0;
  (function rec(){
    if(brkFlag){brkFlag=false;done();return}
    if(r>=recs){line('EOF');done();return}
    line(('File = '+f.n).padEnd(32)+'LRL = 256       REC = '+String(r+1).padStart(5));
    line('1...5....10...15...20...25...30...35...40...45...50...55...60');
    for(var o=0;o<256;o+=60){
      var seg=[];for(var i=o;i<Math.min(o+60,256);i++)seg.push(b[r*256+i]||0);
      line(seg.map(function(x){return x>=32&&x<127?String.fromCharCode(x):'.'}).join(''));
      line(seg.map(function(x){return (x>>4).toString(16).toUpperCase()}).join(''));
      line(seg.map(function(x){return (x&15).toString(16).toUpperCase()}).join(''));
      line('-'.repeat(60));
    }
    r++;
    sleep(r<recs?250:60,rec);
  })();
}
function dosLine(t){
  var s=t.replace(/^ +/,'').replace(/ +$/,''),u=s.toUpperCase();
  if(!s){dosReady();return}
  var w=(u.match(/^[A-Z0-9\/]+/)||[''])[0],rest=s.slice(w.length).replace(/^ +/,'');
  if(hooked&&TERMINAL[w]&&w!=='HELP'){terminal(w,rest,dosReady);return}
  if(joke(u)){dosReady();return}
  if(NOTHERE.indexOf(w)>=0){
    if(w==='PAUSE'){line(rest);say('Press <ENTER> to continue');mode='busy';getln({},function(){dosReady()},dosReady);return}
    if(!rest&&w!=='CLEAR'){dosError(10);return}
    dosError(w==='FORMAT'||w==='BACKUP'||w==='PURGE'?15:11);return;
  }
  var cmd=DOSCMD[w];
  if(cmd){
    var r=cmd(rest,function(){dosReady()});
    if(r==='later')return;
    if(r){dosError(r);return}
    dosReady();return;
  }
  /* a program: NAME, or NAME/CMD */
  var f=spec(w.indexOf('/')<0?w+'/CMD':w);
  if(!f){dosError(19);return}
  var x=findFile(f.n);
  if(!x){dosError(24);return}
  if(x.t!=='C'||x.data){dosError(34);return}
  runCmd(x,rest);
}
function runCmd(f,args){
  if(f.run==='zork1'||f.run==='zork2'){leave(function(){zork(f.run)},dosReady);return}
  if(f.run==='phosphor'){hooked=true;welcome();dosReady();return}
  dosReady();
}

/* ---------- BASIC: READY and the > prompt ---------- */
var BANNER_ROM=['Radio Shack Model III Basic',"(c) '80 Tandy"];
function startBasic(withDisk,first){
  mode='busy';
  if(!withDisk){basic=P.trsBasic(MACH,false);ready();return}
  say('How Many Files? ');
  getln({max:2},function(t){
    t=t.trim();var n=t===''?3:+t;
    if(!/^\d*$/.test(t)||n>15){startBasic(true,first);return}
    say('Memory Size? ');
    getln({max:5},function(m){
      basic=P.trsBasic(MACH,true);
      var free=38202+(3-n)*290; /* each file's buffer: an estimate, not measured */
      basic.setMemory(free+2);
      line('TRS-80 Model III Disk BASIC Rev 1.3');
      line('(c)(p) 1980 by Tandy Corp.  All Rights Reserved.');
      line('Created 5-Jul-80');
      line(free.toLocaleString('en-US')+' Free Bytes   '+n+' Files');
      if(first&&first.trim()){var r=basic.enter(first.trim());if(r==='run'){mode='run';return}}
      ready();
    },function(){startBasic(true,first)});
  },function(){dosReady()});
}
function ready(){if(col()>0)put(13);if(!basic.auto())line('READY');prompt()} /* AUTO goes straight to its first number */
function prompt(){
  mode='busy';
  var e=basic.editAfter();
  if(e!==null&&basic.has(e)){editLine(e);return}
  var a=basic.auto();
  if(a){
    var lead=String(a.n)+(basic.has(a.n)?'*':' ');
    say(lead);
    getln({max:240-lead.length},function(t){
      if(t.trim())basic.enter(a.n+' '+t); /* an empty line leaves that number alone; BREAK ends AUTO */
      basic.autoNext();if(basic.auto())prompt();else ready();
    },function(){basic.autoOff();ready()});
    return;
  }
  say('>');
  getln({max:240},immediate,function(){put(13);prompt()});
}
function editLine(n){ /* EDIT mode, as Level II drops into after a syntax error in a program: the line number, then
  the subcommands: space steps on, L lists, X goes to the end to add, H deletes the rest to type anew, I inserts,
  A starts again, Q leaves it as it was, ENTER keeps it, BREAK leaves it; in X, H and I, ENTER keeps and shift-up-arrow
  (here ESC) stops inserting */
  var orig=basic.lineText(n).replace(/^\d+ /,''),t=orig,p=0,ins=false;
  say(n+' ');
  function done(keep){
    if(keep&&t!==orig)basic.enter(n+' '+t);
    prompt();
  }
  (function key(){
    waitKey(function(c){
      mode='busy';
      if(ins){
        if(c===13){say(t.slice(p));put(13);done(true);return}
        if(c===1){ins=false;key();return}
        if(c===8){if(p>0){p--;t=t.slice(0,p)+t.slice(p+1);put(8)}key();return}
        if(c>=32&&c<128&&t.length<240){t=t.slice(0,p)+String.fromCharCode(c)+t.slice(p);p++;put(c)}
        key();return;
      }
      if(c===13){say(t.slice(p));put(13);done(true);return}
      if(c===1){put(13);done(false);return}
      var k=String.fromCharCode(c);
      if(k===' '){if(p<t.length){put(t.charCodeAt(p));p++}key();return}
      if(c===8){if(p>0){p--;put(24)}key();return}
      if(k==='L'){say(t.slice(p));put(13);p=0;say(n+' ');key();return}
      if(k==='X'){say(t.slice(p));p=t.length;ins=true;key();return}
      if(k==='H'){t=t.slice(0,p);ins=true;key();return}
      if(k==='I'){ins=true;key();return}
      if(k==='A'){t=orig;p=0;put(13);say(n+' ');key();return}
      if(k==='Q'){put(13);done(false);return}
      key();
    });
  })();
}
function immediate(text){
  var t=text.replace(/^ +/,''),u=t.toUpperCase(),w=(u.match(/^[A-Z]+/)||[''])[0],rest=t.slice(w.length);
  if(hooked&&w&&TERMINAL[w]&&!/^\s*[$%!#]?\s*[=(]/.test(rest)&&!/^\d/.test(t)){terminal(w,rest.trim(),function(){prompt()});return}
  if(joke(u)){prompt();return}
  var r=basic.enter(text);
  if(r==='stored'){prompt();return}
  if(r==='error'){ready();return}
  mode='run';
}
function runBasic(){
  var r=basic.step(400,8); /* about 500 statements a second, near enough the Model III's pace */
  if(r==='more')return;
  if(r==='done'){ready();return}
  var w=basic.want();
  if(w.wait==='line'){
    mode='busy';
    say(w.prompt);
    getln({max:240},function(t){basic.answer(t);mode='run'},function(){basic.brk();ready()});
    return;
  }
  if(w.wait==='edit'){basic.answer();basic.stop();mode='busy';editLine(w.n);return}
  if(w.wait==='tape'){mode='busy';cassette(w,function(err,lines){if(err)basic.fail(err);else{basic.answer();if(lines){basic.stop();basic.load(lines)}}goOn()});return}
  if(w.wait==='system'){basic.answer();basic.stop();system();return}
  if(w.wait==='disk'){mode='busy';diskOp(w,function(e,then,lines){
    if(e){basic.fail(e);goOn();return}
    basic.answer();
    if(lines){basic.stop();if(then==='merge')basic.merge(lines);else basic.load(lines)}
    if(then==='run'){basic.run();mode='run';return}
    if(then==='dos'){basic.stop();dosReady();return}
    goOn();
  });return}
}
function goOn(){if(basic.running())mode='run';else ready()} /* after the tape or the disk: the program runs on, or READY */

/* ---------- the cassette: one tape, kept in this browser, and the relay's click ---------- */
function loadTape(){
  var t=P.saved(TAPEKEY);
  if(t&&t.v===1&&Array.isArray(t.files)&&t.files.every(function(f){return f&&typeof f.n==='string'&&Array.isArray(f.src)&&f.src.every(srcLine)}))tape=t;
  else tape={v:1,files:[]};
}
function relay(){P.click(.5,180)}
function stars(on,lit){vram[62]=on?42:32;vram[63]=on&&lit?42:32;dirty=true}
function cassette(w,done){
  relay();
  if(w.op==='save'){
    var src=basic.listing();
    var was=tape.files;
    tape.files=tape.files.filter(function(f){return f.n!==w.name});
    tape.files.push({n:w.name,src:src});
    if(!P.save(TAPEKEY,tape)&&full()){tape.files=was;relay();done('OM');return} /* the browser's storage full */
    var ms=Math.min(6000,800+src.join('\r').length*8/1.5);
    sleep(ms,function(){relay();done()});
    return;
  }
  var f=null;
  for(var i=0;i<tape.files.length;i++)if(!w.name||tape.files[i].n===w.name){f=tape.files[i];break}
  if(!f){ /* nothing there: the tape runs on until BREAK */
    mode='tape';return;
  }
  var total=Math.min(8000,600+f.src.join('\r').length*8/1.5),t0=performance.now(),blink=0;
  mode='tape';
  (function go(){
    if(mode!=='tape')return;
    var t=performance.now()-t0;
    if(t<400){sleepIn(100,go);return}
    blink^=1;stars(true,blink);
    if(t<total){sleepIn(120,go);return}
    stars(false);relay();
    if(w.op==='verify'){
      if(f.src.join('\n')!==basic.listing().join('\n'))line('BAD');
      mode='busy';done();return;
    }
    mode='busy';
    done(null,crunch(f.src));
  })();
}
var tapeTimer=null;
function sleepIn(ms,f){tapeTimer={at:performance.now()+ms,f:f}}
function system(){ /* SYSTEM: *? for a machine-language tape, / to go where it starts */
  mode='busy';say('*? ');
  getln({max:6},function(t){
    t=t.trim();
    if(!t){system();return}
    if(t.charAt(0)==='/'){
      if(t==='/'||/^\/0*$/.test(t)){powerOn();return} /* nothing was loaded: the jump lands at zero, which is a reset */
      ready();return;
    }
    relay();mode='tape'; /* a SYSTEM tape that this tape doesn't have: it runs on until BREAK */
  },function(){ready()});
}

/* ---------- Disk BASIC's disk ---------- */
function diskOp(w,done){
  var op=w.op,s=spec(w.name),x;
  if(op==='cmd'){
    var c=w.name.toUpperCase();
    if(c==='S'){done(null,'dos');return}
    if(c==='D'){basic.stop();line('');done(null);return}
    if(c==='T'||c==='R'){done(null);return}
    done('FC');return;
  }
  if(!s){done('BN');return}
  if(s.drive){done('DNR');return}
  x=findFile(s.n);
  if(op==='save'){
    var e=writeFile({n:s.n,t:'B',src:basic.listing(),ascii:!!w.flag,date:mmddyy(clockNow()).replace(/\/\d\d\//,'/'),lrl:256,attr:'N*X0'});
    if(e){done('DF');return}
    sleep(500,function(){done(null)});return;
  }
  if(op==='kill'){if(!x){done('FNF');return}disk.files.splice(disk.files.indexOf(x),1);saveDisk();sleep(300,function(){done(null)});return}
  if(!x){done('FNF');return}
  if(x.t!=='B'){done('BFM');return}
  sleep(400,function(){
    done(null,op==='run'||op==='load'&&w.flag?'run':op,crunch(x.src));
  });
}

/* the machine around BASIC */
var MACH={
  out:put,pos:col,tab:function(n){while(col()<n&&col()<63)put(32)},
  at:function(a){cp=a;dirty=true},
  cls:cls,set:setPixel,point:getPixel,
  broken:function(){if(!brkFlag)return false;brkFlag=false;return true},
  inkey:function(){var k=keyNow();return k===null?null:k===1?null:k},
  time:function(){var d=clockNow();return mmddyy(d)+' '+hms(d)},
  peek:function(a){
    if(a>=15360&&a<16384)return vram[a-15360];
    if(a===16416)return (cp+15360)&255;if(a===16417)return (cp+15360)>>8;
    return 0;
  },
  poke:function(a,v){if(a>=15360&&a<16384){vram[a-15360]=v;dirty=true}},
  outp:function(p,v){if(p===236||p===255)relay()},
  disk:function(op,name,flag){return {wait:'disk',op:op,name:name,flag:flag}}
};

/* ---------- the terminal's own words, PHOSPHOR/CMD's doing ---------- */
/* jokes typed at TRSDOS Ready or BASIC's > (never inside a program): Commodore's words, answered by a Model III
   owner of 1981, and Zork's magic word. Each: the line (spaces squeezed), and what is said. Keep lines under 64. */
var JOKES=[
  [/^(XYZZY|PLUGH)$/,['A hollow voice says "Fool."']],
  [/^TRASH-? ?80$/,['Trash-80, eh? Said the owner of a 22-column screen.','Radio Shack has a store in your town. Does Commodore?']],
  [/^(VIC-? ?20|VIC)$/,["A VIC-20? 22 columns. That's not a screen, it's a ransom note."]],
  [/^(PET|CBM|PET ?2001)$/,['A PET? Nice keyboard. For a calculator.']],
  [/^COMMODORE$/,['Commodore? Calculators and wristwatches, last we looked.']],
  [/^SYS ?64738$/,["SYS? This isn't a Commodore. The reset button is the","orange one, and it doesn't need a number."]],
  [/^LOAD ?"\$" ?, ?8$/,['LOAD"$",8? Commodore disk talk. Here it is DIR at TRSDOS',"Ready, and the drive is inside the case, where it belongs."]],
  [/^(GO ?64|GO ?128)$/,['GO where? This one went to 7,000 Radio Shack stores.']]
];
function joke(u){
  var t=u.trim().replace(/ +/g,' '),j=JOKES.filter(function(x){return x[0].test(t)})[0];
  if(!j)return false;
  j[1].forEach(function(s){line(s)});
  return true;
}
function welcome(){
  var L=WELCOME.concat(MAILNOTE?['',MAILNOTE]:[],coarse()?['','(tap the screen for a keyboard.)']:[]);
  L.forEach(function(l){
    var t=String(Array.isArray(l)?l[0]:l).replace(/[\u0001-\u0004]/g,'').replace(/[‘’]/g,"'").replace(/[“”]/g,'"').replace(/[–—]/g,'-');
    wrap(t,63).forEach(function(x){line(x.replace(/[^\x20-\x7e]/g,'?'))});
  });
}
function coarse(){return window.matchMedia&&matchMedia('(pointer:coarse)').matches}
function wrap(t,w){
  var o=[];
  while(t.length>w){var k=t.lastIndexOf(' ',w);if(k<=0)k=w;o.push(t.slice(0,k));t=t.slice(k).replace(/^ /,'')}
  o.push(t);return o;
}
function terminal(w,args,then){
  var a=args.toLowerCase().split(/\s+/).filter(Boolean);
  if(w==='FILL'){P.fillGlass(!P.fillGlass());then();return}
  if(w==='SOUND'){
    if(a[0]==='on'){if(!P.sound(true))line('No sound hardware detected.');else line('Keyclicks on.')}
    else if(a[0]==='off'){P.sound(false);line('Keyclicks off.')}
    else line('Keyclicks '+(P.sound()?'on':'off')+'. SOUND ON or SOUND OFF.');
    then();return;
  }
  if(w==='EFFECTS'){
    if(/^(auto|full|lite)$/.test(a[0]||'')){P.effects(a[0]);line('Effects '+a[0]+'.')}
    else{var e=P.effects();line('Effects '+e.mode+(e.mode==='auto'?': '+(e.lite?'lite':'full'):'')+'. EFFECTS AUTO, FULL or LITE.')}
    then();return;
  }
  if(w==='CONNECT'&&P.allowed.length>1){
    if(!a[0]){
      line('Machines on the line:');
      P.allowed.forEach(function(id){line(((id===P.machine?'* ':'  ')+id.padEnd(8)+' '+(P.catalog[id].name||'')+' ('+P.catalog[id].year+')').slice(0,63))});
      then();return;
    }
    if(P.allowed.indexOf(a[0])<0){line('CONNECT: '+a[0]+': no such machine');then();return}
    if(a[0]===P.machine){line('CONNECT: already on '+a[0]);then();return}
    line('Connecting to '+a[0]+'...');
    sleep(600,function(){var q=new URLSearchParams(location.search);q.set('machine',a[0]);location.search=q.toString()});
    return;
  }
  var name=w.toLowerCase();
  if(!P.has(P.cmds,name)){then();return}
  leave(function(){
    P.cmds[name](a,(name+' '+args).trim(),[name].concat(args.split(/\s+/).filter(Boolean)));
  },then,true);
}
function zork(game){
  var ok=false;
  P.queue(function(){return P.load(['../shared/zmachine.js','../shared/'+game+'-story.js']).then(function(x){ok=x})});
  P.queue(function(){if(ok)P.zmachine.play(game);else P.typeLine(game.toUpperCase()+': cannot execute','err')});
}
function leave(what,then,hint){ /* off the Model III's screen to the terminal's own, and back on a key */
  closeScreen();
  P.queue(what);
  if(hint){
    P.queue(function(){P.typeLine('(press any key to go back to the trs-80.)','dim')});
    P.queue(function(){return P.readKey('',true)});
  }
  P.queue(function(){openScreen(function(){mode='busy';then()})});
}

/* ---------- power on: the disk boots unless BREAK is held, and then it is the cassette's BASIC ---------- */
/* the boot screen's picture: a Model III, drawn for this terminal in the ROM's graphics blocks. Each row is
   64 characters: # a lit cell, : the top two blocks, . the bottom two, space dark. TRSDOS's name goes in the glass. */
var LOGO=[
  '                ##############################',
  '                #                            #',
  '                #                            #',
  '                #                            #',
  '                #                            #',
  '                ##############################',
  '               ::::::::::::::::::::::::::::::::',
  '               #..............................#',
  '                ..                          ..'
];
function drawLogo(){
  LOGO.forEach(function(r,y){
    for(var x=0;x<r.length;x++){var c=r.charAt(x);vram[y*64+x]=c==='#'?191:c===':'?131:c==='.'?176:32}
  });
  var t1='TRSDOS',t2='MODEL III';
  for(var i=0;i<t1.length;i++)vram[2*64+26+i]=t1.charCodeAt(i);
  for(var j=0;j<t2.length;j++)vram[3*64+25+j]=t2.charCodeAt(j);
  for(var k=17;k<46;k+=2)vram[7*64+k]=140;
  cp=9*64;dirty=true;
}
function powerOn(){
  mode='busy';booting=true;bootBreak=false;clockOn=false;hooked=false;
  vram.fill(32);cp=0;kq=[];brkFlag=false;dirty=true;basic=null;
  loadDisk();loadTape();
  sleep(900,function(){
    booting=false;
    if(bootBreak){romBoot();return}
    drawLogo();
    line('TRS-80 Model III TRSDOS version 1.3 Wed  Jul  1, 1981');
    line('48K System, Number of Drives = 2   Serial #: 108101225300031');
    line('(c)(p) 1980 TANDY CORPORATION.  All rights reserved.');
    line('Unauthorized reproduction of this software is prohibited');
    line('and is in violation of United States copyright laws.');
    askDate();
  });
}
function askDate(){ /* TRSDOS asks every time; the owner types the date and time from the wall clock */
  var now=P.now();
  say('Enter Date (MM/DD/YY)? ');
  typeIn(mmddyy(now),function(){
    put(13);
    say('Enter Time (HH:MM:SS)? ');
    var t=P.now();
    typeIn(hms(t),function(){
      put(13);setClock(P.now());
      sleep(300,function(){
        var a=findFile('PHOSPHOR/CMD');
        line('TRSDOS Ready');
        if(a&&a.t==='C'){ /* AUTO PHOSPHOR: TRSDOS types it itself */
          say('PHOSPHOR');put(13);runCmd(a,'');return;
        }
        dosPrompt();
      });
    });
  });
}
function typeIn(s,then){
  var i=0;mode='busy';
  (function more(){
    if(i>=s.length){then();return}
    put(s.charCodeAt(i++));P.click(.5);
    sleep(70+Math.random()*90,more);
  })();
}
function romBoot(){ /* BREAK held at power-on: the cassette's questions, then Level II */
  say('Cass? ');
  getln({max:1},function(){
    say('Memory Size? ');
    getln({max:5},function(){
      setClock(P.now());
      BANNER_ROM.forEach(line);
      hooked=true;
      startBasic(false);
    },romBoot);
  },romBoot);
}

/* ---------- the screen program, and the clock that runs it ---------- */
function sleep(ms,f){sleepUntil=performance.now()+ms;sleepCb=f;mode='sleep'}
var lastSec=-1;
function tick(){
  if(mode==='run')runBasic();
  else if(mode==='tape'){
    if(brkFlag){brkFlag=false;tapeTimer=null;stars(false);relay();mode='busy';if(basic)basic.stop();ready();return}
    if(tapeTimer&&performance.now()>=tapeTimer.at){var g=tapeTimer.f;tapeTimer=null;g()}
  }
  else if(mode==='sleep'&&performance.now()>=sleepUntil){mode='busy';var f=sleepCb;sleepCb=null;f()}
  if(clockOn&&date){var s=Math.floor(performance.now()/1000);if(s!==lastSec){lastSec=s;showClock()}}
  draw();
}
function openScreen(after){
  P.program(function(S0,done){
    S=S0;closeFn=done;el=document.getElementById('full');
    document.documentElement.classList.add('trs80');
    layout();
    S.every(16,tick);
    S.every(400,function(){blinkOn=!blinkOn;if(waiting())dirty=true});
    S.onThrow=function(e){console.error(e);closeScreen();P.queue(function(){P.typeLine('trs-80: '+(e&&e.message||e),'err')})};
    if(after)after();
    draw();
    return {feed:feed,draw:function(){dirty=true;draw()},resize:function(){layout();draw()}};
  });
}
function closeScreen(){
  if(!S)return;
  var f=closeFn;document.documentElement.classList.remove('trs80');
  S.close();S=null;el=null;cv=null;closeFn=null;f();
}

P.setup(function(){
  WELCOME=P.profile.welcome||[];MAILNOTE=P.profile.mail.length?P.profile.mailNotice:'';
  P.profile.welcome=[];P.profile.mailNotice='';
  P.setPrompt(function(){return ''});
  Object.keys(P.cmds).forEach(function(n){TERMINAL[n.toUpperCase()]=1});
  P.fallback=function(){openScreen(function(){if(basic)prompt();else dosPrompt()});return true}; /* typed at the terminal's own prompt: back to the Model III */
  setTimeout(function(){
    P.queue(function(){if(P.profile.problems.length)return P.readKey('',true)});
    P.queue(function(){openScreen(powerOn)});
  },0);
});
})(window.Phosphor);
