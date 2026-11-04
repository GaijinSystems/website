/* PHOSPHOR-9 terminal: the engine.
   Copyright (C) 2026 Gaijin Systems.

   This program is free software: you can redistribute it and/or modify it under the terms
   of the GNU Affero General Public License as published by the Free Software Foundation,
   either version 3 of the License, or (at your option) any later version. It is distributed
   WITHOUT ANY WARRANTY; see the LICENSE file for details.

   You should not need to edit this file. Your words go in site/, the imaginary computer in
   machines/, and commands in engine/commands/. index.html loads them in that order:

     engine/phosphor.js        this file: defines window.Phosphor
     engine/commands/*.js      Phosphor.command({...}) for each built-in command
     machines/<name>/*.js      Phosphor.content(`...`) text + Phosphor.setup(fn) hooks
     site/*.js                 Phosphor.content(`...`) text (wins over the machine)
     Phosphor.start()          builds everything and boots the terminal
*/
(function(){
'use strict';

var HAS=Object.prototype.hasOwnProperty;
function has(o,k){return HAS.call(o,k)}

var PH=window.Phosphor={
  version:'1.0.0',
  upstream:'https://github.com/GaijinSystems/phosphor', /* default for the source command */
  texts:[],fromSite:[],defs:[],hooks:[],seen:{},
  content:function(s){var f=me();PH.texts.push(String(s));PH.fromSite.push(!f||/(^|\/)site\//.test(f))}, /* settings and == sections == */
  command:function(def){me();PH.defs.push(def)},  /* a built-in command, see engine/commands */
  setup:function(fn){me();PH.hooks.push(fn)},     /* machine hook: runs after the file tree exists */
  start:start
};

/* Every file index.html loads calls one of the three functions above, which notes the file
   as loaded. A file that is missing, or that has a stray ` or ${ in it, never gets that far,
   so start() can name it on the glass. (The browser's own error event cannot be used: for
   a page opened from disk it hides which file failed.) */
function me(){
  var s=document.currentScript,f=s?(s.getAttribute('src')||s.getAttribute('data-src')||''):'';
  if(f)PH.seen[f]=true;
  return f;
}
function notLoaded(){
  var L=[],S=document.querySelectorAll('script[src],script[data-src]');
  for(var i=0;i<S.length;i++){
    var f=S[i].getAttribute('src')||S[i].getAttribute('data-src');
    if(!/(^|\/)engine\/phosphor\.js$/.test(f)&&!PH.seen[f])L.push(f);
  }
  return L;
}

function start(){
if(PH.started)return;PH.started=true;

/* ---------- content (parsed from every Phosphor.content block, in load order) ---------- */
var SITE=(location.hostname||'').toLowerCase(); /* the real server this page came from ('' when opened as a file) */
var PROFILE=(function(){
  var P={name:'OPERATOR',email:'',speed:1,upper:true,sound:true,protected:[],
    cord:{turns:7,width:18,thickness:3.2,gap:1.8,straight:7.35,sway:2.5},
    title:'',badge:'PHOSPHOR-9',year:1979,installed:'',user:'guest',hostname:'',source:'',prompt:'$ ',
    offline:'the network is down.',off:[],
    welcome:null,about:[],mail:[],commands:[],files:[],dirs:[],man:{},aliases:[],sec:{},raw:{},problems:[]};
  var secs=[];
  function yes(v){return !/^(no|false|off|0)$/i.test(v)}
  function list(v){return v.split(',').map(function(x){return x.trim().toLowerCase()}).filter(Boolean)}
  var CL={turns:[1,40],width:[6,80],thickness:[1,8],gap:[0,10],straight:[0,200],sway:[0,10]};
  function setKey(k,v){
    var ck=k.match(/^cord (\w+)$/);
    if(ck&&CL[ck[1]]){var x=parseFloat(v),L=CL[ck[1]];if(!isNaN(x))P.cord[ck[1]]=Math.min(L[1],Math.max(L[0],x));return}
    if(k==='name'){if(v)P.name=v}
    else if(k==='email')P.email=v;
    else if(k==='speed'){var n=parseFloat(v);if(n>0)P.speed=n}
    else if(k==='sound')P.sound=yes(v);
    else if(k==='uppercase')P.upper=yes(v);
    else if(k==='protected')P.protected=P.protected.concat(list(v));
    else if(k==='title')P.title=v;
    else if(k==='badge')P.badge=v;
    else if(k==='year'){var y=parseInt(v,10);if(y>0)P.year=y}
    else if(k==='installed')P.installed=v;
    else if(k==='user'){if(/^[a-z][a-z0-9_]{0,7}$/i.test(v))P.user=v.toLowerCase()}
    else if(k==='hostname')P.hostname=v.toLowerCase();
    else if(k==='source'){ /* becomes a link: same rule as links in the text */
      if(!v||/^https?:\/\/\S+$/i.test(v))P.source=v;
      else P.problems.push('source: must start with http:// or https://');
    }
    else if(k==='prompt')P.prompt=v.replace(/^"(.*)"$/,'$1');
    else if(k==='offline')P.offline=v;
    else if(k==='commands')list(v).forEach(function(x){ /* commands: -ping, -ifconfig switches them off */
      if(x.charAt(0)==='-')P.off.push(x.slice(1));
      else P.off=P.off.filter(function(o){return o!==x});
    });
    else P.problems.push('unknown setting "'+k+'"');
  }
  PH.texts.forEach(function(src,ti){
    var cur=null; /* settings come first in each block, before its first == section == */
    src.replace(/\r/g,'').split('\n').forEach(function(raw){
      if(/^\s*#/.test(raw))return;
      var h=raw.match(/^\s*==\s*(.*?)\s*==\s*$/);
      if(h){cur={head:h[1],lines:[],site:PH.fromSite[ti]};secs.push(cur);return}
      if(cur){cur.lines.push(raw.replace(/\s+$/,''));return}
      var m=raw.match(/^\s*([a-z][a-z _-]*?)\s*:\s*(.*?)\s*$/i);if(!m)return;
      setKey(m[1].toLowerCase().replace(/[\s_-]+/g,' '),m[2]);
    });
  });
  /* who the machine is, worked out once the settings are known */
  P.owner=P.name.split(/\s+/)[0].replace(/[^a-z0-9]/gi,'').slice(0,8).toLowerCase()||'operator';
  P.host=P.hostname||(SITE.replace(/^www\./,'').split('.')[0]||P.owner).replace(/[^a-z0-9-]/g,'').slice(0,8)||'phosphor';
  var VARS={site:SITE||P.host,hostname:P.host,owner:P.owner,email:P.email,year:String(P.year)};
  function fill(t){return String(t).replace(/\{(site|hostname|owner|email|year)\}/g,function(m,k){return VARS[k]})}
  P.fill=fill;
  function up(t){return P.upper?t.toUpperCase():t}
  function lines(L){
    L=L.slice();
    while(L.length&&!L[0].trim())L.shift();
    while(L.length&&!L[L.length-1].trim())L.pop();
    return L.map(function(l){
      l=fill(l);
      var href=null,k=l.match(/^(.*?)\s+->\s*((?:https?:\/\/|mailto:)\S+)\s*$/i);
      if(k){l=k[1];href=k[2]}
      var m=l.match(/^(\s*)(!|~(?!~))\s?(.*)$/),t=m?up(m[1]+m[3]):up(l),c=m?(m[2]==='~'?'dim':'err'):'';
      t=t.replace(/~~(.+?)~~/g,'\u0001$1\u0002'); /* ~~text~~ = struck through */
      return href?[t,c,{href:href}]:(c?[t,c]:t);
    });
  }
  P.lines=lines;
  P.name=up(P.name);
  secs.forEach(function(sc){
    var hd=sc.head,body=lines(sc.lines),m;
    if(/^welcome$/i.test(hd))P.welcome=body;
    else if(/^about$/i.test(hd))P.about=body;
    else if(/^mail$/i.test(hd))P.mail=body.map(function(l){ /* project row = has a run of 2+ spaces inside it: */
      var re=/(\S)( {2,})(?=\S)/,s=Array.isArray(l)?l[0]:l;      /* that run becomes a squeezable gap */
      if(!re.test(s))return l;
      return [s.replace(re,'$1\u0003$2\u0004'),Array.isArray(l)?l[1]||'':'',
        Object.assign({row:true},Array.isArray(l)&&l[2]||{})];
    });
    else if(/^alias(es)?$/i.test(hd))sc.lines.forEach(function(l){
      var a=l.match(/^\s*([^=#]+?)\s*=\s*(.+?)\s*$/);
      if(!a)return;
      var from=a[1].toLowerCase().split(/\s+/);
      P.aliases=P.aliases.filter(function(x){return x.from.join(' ')!==from.join(' ')});
      P.aliases.push({from:from,to:a[2]}); /* the command keeps its case: echo Hello prints Hello */
    });
    else if((m=hd.match(/^command\s*:\s*([^|]+?)\s*(?:\|\s*(.*))?$/i))){
      var names=m[1].split(',').map(function(x){return x.trim().toLowerCase()}).filter(Boolean);
      if(!names.length)return;
      P.commands=P.commands.filter(function(c){return !c.names.some(function(n){return names.indexOf(n)>=0})});
      P.commands.push({names:names,help:up(m[2]||''),body:body,site:sc.site});
    }
    else if((m=hd.match(/^file\s*:\s*(\S+)$/i)))P.files.push({name:m[1].toLowerCase(),body:body});
    else if((m=hd.match(/^dir(?:ectory)?\s*:\s*(\S+)$/i)))P.dirs.push(m[1].toLowerCase());
    else if((m=hd.match(/^man\s*:\s*(\S+)$/i)))P.man[m[1].toLowerCase()]=body;
    else{var key=hd.toLowerCase();P.sec[key]=body;P.raw[key]=sc.lines.map(fill)} /* machine sections: banner, dmesg, ps ... */
  });
  if(!P.welcome)P.welcome=[up('welcome to '+P.name.toLowerCase()+'.'),[up('type help and press return.'),'dim']];
  return P;
})();

function $(s){return document.querySelector(s)}
var term=$('#term'),out=$('#out'),glow=$('#glow'),kb=$('#kb'),svg=$('#cable'),sway=$('#sway');
var cursor=document.createElement('span');cursor.className='cursor';
var coarse=window.matchMedia&&matchMedia('(pointer:coarse)').matches;
var chain=Promise.resolve(),ready=false,booted=false,buf='',bufNode=null,hist=[],hi=0;
if(PROFILE.title)document.title=PROFILE.title;
var badge=$('.badge');if(badge)badge.textContent=PROFILE.badge;

function sleep(ms){return new Promise(function(r){setTimeout(r,ms)})}
function queue(fn){chain=chain.then(fn).catch(function(e){console.error(e)});return chain}
function pause(ms){return queue(function(){return sleep(ms)})}

/* ---------- sound (keyclicks; WebAudio only, no files) ---------- */
var SND={ctx:null,noise:null,clicks:PROFILE.sound};
function actx(){
  if(!SND.ctx){
    var C=window.AudioContext||window.webkitAudioContext;if(!C)return null;
    var c=SND.ctx=new C(),n=(c.sampleRate*.03)|0,b=c.createBuffer(1,n,c.sampleRate),d=b.getChannelData(0);
    for(var i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,6);
    SND.noise=b;
  }
  if(SND.ctx.state==='suspended')SND.ctx.resume();
  return SND.ctx;
}
/* browsers refuse audio before a real user gesture, so the boot is silent;
   the first tap/key quietly starts the sound hardware */
var GEST=['pointerdown','touchend','keydown','click'];
function unlockAudio(){
  if(!SND.clicks)return;
  var c=actx();
  if(c&&c.state==='running')GEST.forEach(function(t){document.removeEventListener(t,unlockAudio,true)});
}
GEST.forEach(function(t){document.addEventListener(t,unlockAudio,true)});
function click(vol,freq){
  if(!SND.clicks||!SND.ctx)return;
  var c=SND.ctx,s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();
  s.buffer=SND.noise;f.type='bandpass';f.frequency.value=freq||2200+Math.random()*1800;f.Q.value=1.4;
  g.gain.value=vol;s.connect(f);f.connect(g);g.connect(c.destination);s.start();
}

/* ---------- afterglow ---------- */
var lastG=0;
function afterglow(top,a,ms,force){
  var n=performance.now();
  if(!force&&(n-lastG<90||glow.childElementCount>2))return;
  lastG=n;
  var g=out.cloneNode(true);
  g.removeAttribute('id');g.className='ghost';
  var cs=g.querySelectorAll('.cursor');for(var i=0;i<cs.length;i++)cs[i].remove();
  g.style.transform='translateY('+(-top)+'px)';
  g.style.setProperty('--a',a);g.style.animationDuration=ms+'ms';
  g.addEventListener('animationend',function(){g.remove()});
  glow.appendChild(g);
}
function scrollBottom(){
  var b=term.scrollTop;term.scrollTop=term.scrollHeight;
  if(term.scrollTop-b>1)afterglow(b,.38,460);
}
function trim(){while(out.childElementCount>240)out.firstElementChild.remove()}

/* ---------- typing engine ---------- */
function UP(t){return PROFILE.upper?String(t).toUpperCase():t}
function typeLine(text,cls,cb,opt){
  opt=opt||{};
  return queue(function(){return new Promise(function(res){
    text=UP(typeof text==='function'?text():text); /* a function = text worked out when its turn comes (ping) */
    var d=document.createElement('div'),host=d;
    d.className='line'+(cls?' '+cls:'')+(opt.row?' row':'');
    /* indent: left margin for the whole line; hang: extra margin for wrapped continuation lines only */
    if(opt.indent||opt.hang){d.style.paddingLeft=((opt.indent||0)+(opt.hang||0))+'ch';if(opt.hang)d.style.textIndent=(-opt.hang)+'ch'}
    if(opt.href){host=document.createElement('a');host.href=opt.href;
      if(!/^mailto:/i.test(opt.href)){host.target='_blank';host.rel='noopener'}d.appendChild(host)}
    var t=document.createTextNode(opt.pre?UP(opt.pre):'');host.appendChild(t);
    d.appendChild(cursor);out.appendChild(d);trim();
    var sp=opt.speed||1,i=0;
    function step(){
      if(i>=text.length){scrollBottom();if(cb)cb();res();return}
      var ch=text.charAt(i++);
      if(ch==='\u0003'){ /* a squeezable gap (mail rows, self-test dots): shrinks to fit narrow glass */
        var j=text.indexOf('\u0004',i);if(j<0)j=text.length;
        var g=document.createElement('span');g.className='gap';
        g.dataset.n=j-i;g.dataset.f=text.charAt(i)||' ';g.dataset.w=text.replace(/[\u0001-\u0004]/g,'').length;
        var at2=cursor.parentNode===host?cursor:null;host.insertBefore(g,at2);squeeze(g);
        t=document.createTextNode('');host.insertBefore(t,at2);
        i=j+1;step();return;
      }
      if(ch==='\u0001'||ch==='\u0002'){ /* ~~struck~~ text: start or end an <s> run */
        var at=cursor.parentNode===host?cursor:null;t=document.createTextNode('');
        if(ch==='\u0001'){var s=document.createElement('s');s.appendChild(t);host.insertBefore(s,at)}
        else host.insertBefore(t,at);
        step();return;
      }
      t.data+=ch;scrollBottom();
      if(ch!==' ')click(.194);
      setTimeout(step,(ch===' '?.35:1)*(14+Math.random()*38)*sp/PROFILE.speed);
    }
    if(opt.hold)setTimeout(step,opt.hold);else step();
  })});
}
function say(lines){
  lines.forEach(function(l){Array.isArray(l)?typeLine(l[0],l[1],null,l[2]):typeLine(l)});
}
function cols(){ /* how many characters fit on one line of the glass right now */
  var p=document.createElement('span');p.textContent='0000000000';
  p.style.cssText='position:absolute;visibility:hidden;white-space:pre';
  out.appendChild(p);var cw=p.getBoundingClientRect().width/10;p.remove();
  var cs=getComputedStyle(out),w=out.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight);
  return cw>0?Math.floor(w/cw+.01):999;
}
function squeeze(g,c){ /* shrink a gap (never below 2 characters) until its row fits */
  var over=Math.max(0,+g.dataset.w-(c||cols()));
  g.textContent=(g.dataset.f||' ').repeat(Math.max(2,+g.dataset.n-over));
}
window.addEventListener('resize',function(){ /* rows already printed re-fit on rotate/resize */
  var gs=out.querySelectorAll('.gap');if(!gs.length)return;
  var c=cols();for(var i=0;i<gs.length;i++)squeeze(gs[i],c);
});
var MODE='shell'; /* shell | login | password (password input is not echoed) */
function prompt(p,mode){
  queue(function(){
    MODE=mode||'shell';
    var d=document.createElement('div');d.className='line';
    bufNode=document.createTextNode(MODE==='password'?'':UP(buf));
    d.appendChild(document.createTextNode(UP(p||PROFILE.prompt)));d.appendChild(bufNode);d.appendChild(cursor);
    out.appendChild(d);trim();ready=true;term.classList.add('idle');scrollBottom();
  });
}

/* ---------- shell state ---------- */
var OWNER=PROFILE.owner,HOSTNAME=PROFILE.host;
var ST={owner:OWNER,user:PROFILE.user,home:'/usr/'+PROFILE.user,cwd:'/usr/'+PROFILE.user,site:SITE,hostname:HOSTNAME,login:null};
var DAYS=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],MONS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function p2(x){return String(x).padStart(2,'0')}
function in79(n){ /* now, moved to the machine's year (February 29 becomes the 28th in a non-leap year) */
  var y=PROFILE.year,d=n.getDate();
  if(n.getMonth()===1&&d===29&&new Date(y,1,29).getMonth()!==1)d=28;
  return new Date(y,n.getMonth(),d,n.getHours(),n.getMinutes(),n.getSeconds());
}
function tz(){
  try{var q=new Intl.DateTimeFormat('en-US',{timeZoneName:'short'}).formatToParts(new Date());
    for(var i=0;i<q.length;i++)if(q[i].type==='timeZoneName')return q[i].value}catch(e){}
  return '';
}
function ctime(d){return DAYS[d.getDay()]+' '+MONS[d.getMonth()]+' '+String(d.getDate()).padStart(2,' ')+' '+p2(d.getHours())+':'+p2(d.getMinutes())+':'+p2(d.getSeconds())}
function short(d){return MONS[d.getMonth()]+' '+String(d.getDate()).padStart(2,' ')+' '+p2(d.getHours())+':'+p2(d.getMinutes())}
ST.login=in79(new Date());
var FD=(function(){var d=new Date(ST.login.getTime()-864e5);d.setHours(21,41,0,0);return d})(); /* home files: last night */
var SD=(function(){ /* system files: the machine's install date (installed: 1979-01-10 16:12) */
  var m=PROFILE.installed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:\s+(\d{1,2}):(\d{2}))?/);
  return m?new Date(+m[1],m[2]-1,+m[3],+(m[4]||0),+(m[5]||0)):new Date(PROFILE.year,0,10,16,12,0);
})();
function lsdate(d){ /* as ls does it: older than six months shows the year instead of the time */
  return ST.login-d>15552e6?MONS[d.getMonth()]+' '+String(d.getDate()).padStart(2,' ')+'  '+d.getFullYear():short(d);
}

/* ---------- file system: the machine builds the system folders; site files live in home ---------- */
function mk(type,name,o){
  var n={type:type,name:name,owner:OWNER,date:FD,prot:false,bin:false,body:null,size:0,mode:null,dev:null,
    kids:type==='d'?Object.create(null):null,parent:null};
  if(o)for(var k in o)if(has(o,k))n[k]=o[k];
  return n;
}
var ROOT=mk('d','',{owner:'root',date:SD});ROOT.parent=ROOT;
function parts(p){return p.split('/').filter(Boolean)}
function put(abs,type,o){ /* create a node, making any missing parent folders */
  var s=parts(abs),n=ROOT,i,k;
  if(!s.length)return ROOT;
  for(i=0;i<s.length-1;i++){
    k=n.kids[s[i]];
    if(!k||k.type!=='d'){k=n.kids[s[i]]=mk('d',s[i],{owner:n.owner,date:n.date});k.parent=n}
    n=k;
  }
  var last=s[s.length-1],ex=n.kids[last];
  if(ex&&ex.type==='d'&&type==='d'){if(o)for(k in o)ex[k]=o[k];return ex}
  ex=n.kids[last]=mk(type,last,o);ex.parent=n;return ex;
}
function home(p){return p.charAt(0)==='/'?p:p.slice(0,2)==='~/'?ST.home+p.slice(1):ST.home+'/'+p}
function norm(p){ /* absolute path; handles ~, . and .. */
  if(p==='~'||p.slice(0,2)==='~/')p=ST.home+p.slice(1);
  var s=p.charAt(0)==='/'?[]:parts(ST.cwd);
  parts(p).forEach(function(x){if(x==='..')s.pop();else if(x!=='.')s.push(x)});
  return '/'+s.join('/');
}
function pathOf(n){var s=[];while(n!==ROOT){s.unshift(n.name);n=n.parent}return '/'+s.join('/')}
function find(p,exact){ /* node or null; nobody gets through a locked folder.
                           exact (for building the tree): full names only, locks ignored */
  var s=parts(norm(p)),n=ROOT;
  for(var i=0;i<s.length;i++){
    if(n.type!=='d'||(n.prot&&!exact))return null;
    var k=has(n.kids,s[i])?n.kids[s[i]]:null;
    if(!k&&!exact&&i===s.length-1) /* cat photo01 finds photo01.pic */
      k=n.kids[Object.keys(n.kids).sort().filter(function(x){return x.charAt(0)!=='.'&&x.split('.')[0]===s[i]})[0]];
    if(!k)return null;
    n=k;
  }
  return n;
}
function bsize(L){return L.reduce(function(n,l){return n+(Array.isArray(l)?l[0]:l).length+1},0)}
function body(n){return typeof n.body==='function'?n.body():n.body}
function fsize(n){
  if(n.type==='d')return 16*(Object.keys(n.kids).length+2);
  if(n.dev)return 0;
  return n.size||(n.body?bsize(body(n)):0);
}
function modeOf(n){
  if(n.mode)return n.mode;
  if(n.type==='d')return n.prot?'drwx------':'drwxr-xr-x';
  return n.prot?'-rw-------':n.bin?'-rwxr-xr-x':'-rw-r--r--';
}
function links(n){return n.type!=='d'?1:2+Object.keys(n.kids).filter(function(k){return n.kids[k].type==='d'}).length}
function longRow(name,n){
  var sz=n.dev?String(n.dev[0]).padStart(2)+','+String(n.dev[1]).padStart(3):String(fsize(n)).padStart(6);
  return [modeOf(n)+' '+String(links(n)).padStart(2)+' '+n.owner.padEnd(8)+sz+' '+lsdate(n.date)+' '+name,n.prot?'dim':''];
}
function row(l,v){var d=Math.max(2,20-l.length);return l+' \u0003'+'.'.repeat(d)+'\u0004 '+v} /* dot leader squeezes on narrow glass */

/* ---------- commands: built-ins from engine/commands, text commands from the content ---------- */
var CMDS={},PATHS={},NOH={},HELP=[];
var MAN={};
function page(names,what,syn,desc,bugs){
  var F=function(L){return (L||[]).map(function(l){return Array.isArray(l)?[PROFILE.fill(l[0])].concat(l.slice(1)):PROFILE.fill(l)})};
  var p={names:names,what:what,syn:syn,desc:F(desc),bugs:F(bugs)};
  names.split(/,\s*/).forEach(function(n){MAN[n]=p});
  return p;
}
PH.defs.forEach(function(d){ /* later definitions of the same name win */
  if(typeof d.enabled==='function'&&!d.enabled(PROFILE))return; /* e.g. about, only when there is an about section */
  var names=(d.names||[]).filter(function(n){return PROFILE.off.indexOf(n)<0});
  if(!names.length||typeof d.run!=='function')return;
  names.forEach(function(n){
    CMDS[n]=d.run;NOH[n]=!!d.noHelpFlag;delete PATHS[n];
    HELP=HELP.filter(function(h){return h[0]!==n});
  });
  if(d.path)PATHS[names[0]]=d.path; /* where its program file shows up in the file tree */
  if(d.help&&!d.hidden)HELP.push([names[0],d.help]);
  if(d.man)page(names.join(', '),d.man.what||'',d.man.syn||names[0],d.man.desc,d.man.bugs);
});
/* Text commands (== command: NAME ==). They cannot take the name of a core command while
   it is running; switch it off first ("commands: -mail") and yours takes its place.
   "commands: -name" also removes the machine's text commands (sudo), but never the site's:
   to remove one of yours, delete it. */
var RESERVED=['help','man','clear','ls','cat','sound','cd','pwd','echo','mail','alias','source'];
PROFILE.commands.forEach(function(c){
  var n=c.names.filter(function(x){
    var off=PROFILE.off.indexOf(x)>=0;
    if(RESERVED.indexOf(x)>=0&&!off)return false;
    return c.site||!off;
  });
  if(!n.length)return;
  var fn=function(){say(c.body)};
  n.forEach(function(x){ /* replaces any built-in of that name, its manual page and program file too */
    CMDS[x]=fn;NOH[x]=false;delete MAN[x];delete PATHS[x];
    HELP=HELP.filter(function(h){return h[0]!==x});
  });
  if(c.help){
    HELP.push([n[0],c.help]);
    page(n.join(', '),c.help.toLowerCase(),n[0],[c.help.toLowerCase()+'.']); /* a page made from the help text */
  }
});
Object.keys(PROFILE.man).forEach(function(k){ /* == man: NAME == sections */
  if(has(MAN,k))MAN[k].desc=PROFILE.man[k];
  else page(k,'',k,PROFILE.man[k]);
});
function manPage(n){ /* body text is indented 5 with a real margin, so wrapped lines stay indented */
  var p=MAN[n],I=5;
  function at(t,hang){return [t,'',{indent:I,hang:hang||0}]}
  var L=[n.toUpperCase()+'(1)','','NAME',at(p.names+(p.what?' - '+p.what:''),p.what?p.names.length+3:0),
    '','SYNOPSIS',at(p.syn,p.syn.indexOf(' ')+1)];
  function block(title,lines){
    if(!lines.length)return;
    L.push('',title);
    lines.forEach(function(l){
      var a=Array.isArray(l),t=a?l[0]:l;if(!t){L.push('');return}
      var lead=t.match(/^ */)[0].length;t=t.slice(lead);
      var opt=t.match(/^(\S+ {2,})\S/); /* "-l   long listing ..." wraps under its text */
      L.push([t,a?l[1]||'':'',Object.assign({indent:I+lead,hang:opt?opt[1].length:0},a&&l[2]||{})]);
    });
  }
  block('DESCRIPTION',p.desc);block('BUGS',p.bugs);
  return L;
}

/* ---------- build the file tree ---------- */
var LOGOUT=false;
Object.assign(PH,{ /* what commands and machine hooks may use */
  profile:PROFILE,st:ST,cmds:CMDS,man:MAN,paths:PATHS,help:function(){return HELP.slice()},
  aliases:PROFILE.aliases.slice(),
  say:say,typeLine:typeLine,pause:pause,queue:queue,sleep:sleep,click:click,
  sound:function(on){if(on===undefined)return SND.clicks;if(on&&!actx())return false;SND.clicks=!!on;return true},
  find:find,norm:norm,put:put,home:home,pathOf:pathOf,body:body,fsize:fsize,longRow:longRow,
  root:ROOT,fileDate:FD,systemDate:SD,
  ctime:ctime,short:short,in79:in79,p2:p2,tz:tz,row:row,manPage:manPage,fill:PROFILE.fill,
  clear:function(){queue(function(){afterglow(term.scrollTop,.55,900,true);out.textContent=''})},
  logout:function(){ /* log out: clear the glass, replay the self-test, wait at login: */
    LOGOUT=true;PH.aliases=PROFILE.aliases.slice(); /* session aliases die with the shell */
    PH.clear();pause(500);banner();prompt('login: ','login');
  }
});
PH.hooks.forEach(function(fn){
  try{fn(PH)}catch(e){PROFILE.problems.push('machine setup failed: '+e.message)}
});
put(ST.home,'d',{owner:OWNER});
if(PROFILE.about.length)put(ST.home+'/about','f',{body:PROFILE.about});
PROFILE.dirs.forEach(function(d){put(home(d),'d')});
PROFILE.files.forEach(function(f){put(home(f.name),'f',{body:f.body})});
PROFILE.protected.forEach(function(p){
  var dir=/\/$/.test(p),abs=home(p.replace(/\/+$/,'')),ex=find(abs,true); /* exact: an item inside a locked folder is still found */
  if(ex&&ex!==ROOT)ex.prot=true;
  else put(abs,dir?'d':'f',{prot:true,size:dir?0:/\.pic$/.test(abs)?16384:2048});
});

/* ---------- running commands ---------- */
function expand(seg){ /* longest matching alias wins; extra words pass through */
  var parts=seg.trim().split(/\s+/),low=parts.map(function(x){return x.toLowerCase()}),best=null;
  PH.aliases.forEach(function(x){
    if(x.from.length>low.length)return;
    for(var i=0;i<x.from.length;i++)if(x.from[i]!==low[i])return;
    if(!best||x.from.length>best.from.length)best=x;
  });
  return best?[best.to].concat(parts.slice(best.from.length)).join(' '):seg.trim();
}
function runOne(s){
  s=s.trim();if(!s)return;
  var parts=s.toLowerCase().split(/\s+/),c=parts[0],args=parts.slice(1);
  var f=has(CMDS,c)?CMDS[c]:null,name=c;
  if(!f&&c.indexOf('/')>=0){ /* /bin/ls runs ls; any other path is not a program */
    var n=find(c);
    if(n&&n.bin&&has(CMDS,n.name)){f=CMDS[n.name];name=n.name}
    else if(n){typeLine(s.split(/\s+/)[0]+': cannot execute','err');return}
  }
  if(f&&!NOH[name]&&args.indexOf('-h')>=0&&has(MAN,name)){typeLine('usage: '+MAN[name].syn);return}
  if(f){
    try{f(args,s)}catch(e){console.error(e);typeLine(name+': core dumped','err')}
  }
  else typeLine(s.split(/\s+/)[0]+': not found','err');
}
function run(raw){
  /* commands separated by ; run in turn; an alias may expand to several (alias cl='clear ; ls') */
  var segs=[];
  raw.split(';').forEach(function(seg){if(seg.trim())segs=segs.concat(expand(seg).split(';'))});
  for(var i=0;i<segs.length&&!LOGOUT;i++)runOne(segs[i]);
  if(LOGOUT){LOGOUT=false;return} /* exit already queued the login: prompt */
  prompt();
}

/* ---------- login (after exit/logout) ---------- */
function login(name){
  var n=name.trim().toLowerCase();
  if(!n){prompt('login: ','login');return}
  var usr=find('/usr');
  if(n==='root'||n===OWNER||!/^[a-z][a-z0-9_]{0,7}$/.test(n)||(n!==ST.user&&usr&&usr.kids[n])){prompt('Password:','password');return}
  var h=usr&&usr.kids[ST.user]; /* the home folder follows whoever logs in */
  if(h&&n!==ST.user){delete usr.kids[ST.user];h.name=n;usr.kids[n]=h}
  ST.user=n;ST.home='/usr/'+n;ST.cwd=ST.home;ST.login=in79(new Date());
  welcome();prompt();
}

/* ---------- input ---------- */
function renderBuf(){if(ready&&bufNode){bufNode.data=MODE==='password'?'':UP(buf);scrollBottom()}}
function setBuf(v){
  buf=v.replace(/[\r\n]/g,'').slice(0,64);
  if(kb.value!==buf)kb.value=buf;
  renderBuf();
}
function submit(){
  click(1,700);
  if(!ready)return;
  ready=false;term.classList.remove('idle');
  var cmd=buf;bufNode=null;setBuf('');
  if(MODE==='login'){login(cmd);return}
  if(MODE==='password'){pause(1400);typeLine('Login incorrect');prompt('login: ','login');return}
  if(cmd.trim()){hist.push(cmd);if(hist.length>50)hist.shift()}
  hi=hist.length;
  run(cmd);
}
function histNav(d){
  if(!hist.length)return;
  hi=Math.max(0,Math.min(hist.length,hi+d));
  setBuf(hist[hi]||'');
}
kb.addEventListener('input',function(){
  var grew=kb.value.length>buf.length;setBuf(kb.value);if(grew)click(.667);
});
kb.addEventListener('keydown',function(e){
  if(e.isComposing)return;
  if(e.key==='Enter'){e.preventDefault();submit()}
  else if(e.key==='ArrowUp'){e.preventDefault();histNav(-1)}
  else if(e.key==='ArrowDown'){e.preventDefault();histNav(1)}
});
document.addEventListener('keydown',function(e){
  if(e.target===kb||e.ctrlKey||e.metaKey||e.altKey)return;
  var k=e.key;
  if(k==='Enter'){e.preventDefault();submit()}
  else if(k==='Backspace'){e.preventDefault();setBuf(buf.slice(0,-1));click(.556)}
  else if(k==='ArrowUp'){e.preventDefault();histNav(-1)}
  else if(k==='ArrowDown'){e.preventDefault();histNav(1)}
  else if(k&&k.length===1){e.preventDefault();setBuf(buf+k);click(.667)}
  else return;
  if(!coarse)kb.focus({preventScroll:true});
});

/* tap-to-type: focus on click (not pointerdown), refocus once if the OS bounces it */
var lastTap=0,bounced=false;
$('#stage').addEventListener('click',function(e){
  if(e.target.closest&&e.target.closest('a'))return;
  lastTap=Date.now();bounced=false;
  kb.focus({preventScroll:true});
});
kb.addEventListener('blur',function(){
  if(!bounced&&Date.now()-lastTap<700){bounced=true;setTimeout(function(){kb.focus({preventScroll:true})},0)}
});
kb.addEventListener('focus',function(){setTimeout(function(){window.scrollTo(0,0)},60)});

/* ---------- cable ---------- */
var NS='http://www.w3.org/2000/svg';
function path(d,stroke,w,op){
  var p=document.createElementNS(NS,'path');
  p.setAttribute('d',d);p.setAttribute('fill','none');p.setAttribute('stroke',stroke);
  p.setAttribute('stroke-width',w);p.setAttribute('stroke-linecap','round');p.setAttribute('stroke-linejoin','round');
  if(op!=null)p.setAttribute('opacity',op);
  return p;
}
/* cord settings come from site/config.js */
var CORD=PROFILE.cord,rx=CORD.width/2,sw=CORD.thickness,edge=sw+1.4,gap=CORD.gap,tilt=.35,turns=Math.max(1,Math.round(CORD.turns));
var pitch=edge+gap;                        /* drop per turn = cord + rim + gap. gap 0 = turns touching */
var coilLen=2*tilt*rx+(turns+.5)*pitch;
function drawCable(){
  var nub=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nub'))||11; /* strain-relief bottom */
  /* cable height = nub + straight + coil + straight, so the two straights are always equal */
  var want=Math.round(nub+2*CORD.straight+coilLen); /* phone cable height; desktop fills the gap below the monitor */
  document.documentElement.style.setProperty('--cable',want+'px');
  var r=svg.getBoundingClientRect(),W=r.width,H=r.height;
  if(!W||!H){W=960;H=want} /* never bail: hidden/pre-layout still gets a cable */
  svg.setAttribute('viewBox','0 0 '+W+' '+H);
  var cx=W/2,TAU=Math.PI*2;
  var lead=Math.max(0,(H-nub-coilLen)/2);
  var y0=nub+lead+tilt*rx,steps=40,N=turns*steps+steps/2;
  function f(v){return v.toFixed(2)}
  var pts=[],ay=0;
  for(var i=0;i<=N;i++){
    var t=Math.PI+i/steps*TAU;
    if(i)ay+=pitch/steps;
    pts.push([cx+rx*Math.sin(t),y0+ay+tilt*rx*Math.cos(t),Math.cos(t)>=0]);
  }
  var segs=[],cur=null;
  pts.forEach(function(q){
    if(!cur||cur.front!==q[2]){var prev=cur&&cur.p[cur.p.length-1];cur={front:q[2],p:prev?[prev]:[]};segs.push(cur)}
    cur.p.push(q);
  });
  function d(a){return 'M'+a.map(function(p){return f(p[0])+' '+f(p[1])}).join('L')}
  var e=pts[pts.length-1];
  var cord='M'+f(cx)+' -8L'+f(cx)+' '+f(pts[0][1]);
  /* coil hangs centered in whatever height the cable has, so the straight runs above and below
     stay equal; on desktop that height is the gap from the bezel to the bottom of the window */
  var drop=H+12-e[1];
  var tail='M'+f(e[0])+' '+f(e[1])+'C'+f(e[0])+' '+f(e[1]+drop*.45)+' '+f(cx+6)+' '+f(e[1]+drop*.7)+' '+f(cx+5)+' '+f(H+12);

  var E='#232723',C='#141715';
  while(sway.firstChild)sway.removeChild(sway.firstChild);
  segs.forEach(function(sg){if(!sg.front){sway.appendChild(path(d(sg.p),'#1a1d1b',sw+1));sway.appendChild(path(d(sg.p),'#0e100f',sw))}});
  sway.appendChild(path(cord,E,edge));sway.appendChild(path(cord,C,sw));
  segs.forEach(function(sg){if(sg.front){sway.appendChild(path(d(sg.p),'#2b302c',edge));sway.appendChild(path(d(sg.p),C,sw))}});
  sway.appendChild(path(tail,E,edge));sway.appendChild(path(tail,C,sw));
  /* idle sway at the coil bottom (cord sway setting), pivoting at the strain relief */
  svg.style.setProperty('--sa',(Math.atan(CORD.sway/Math.max(e[1],40))*180/Math.PI).toFixed(3)+'deg');
}
var raf=0;
function redraw(){cancelAnimationFrame(raf);raf=requestAnimationFrame(drawCable)}

/* visible height -> --app-h. On phones the soft keyboard shrinks the visual viewport but not
   100dvh, so without this the bottom of the monitor would sit behind the keyboard. */
var vv=window.visualViewport;
function fitViewport(){
  var h=vv?vv.height*(vv.scale||1):window.innerHeight; /* *scale: pinch-zoom must not shrink the rig */
  if(h>0)document.documentElement.style.setProperty('--app-h',Math.round(h)+'px');
  if(vv&&vv.offsetTop)window.scrollTo(0,0);
  term.scrollTop=term.scrollHeight; /* keep the prompt in view as the glass resizes */
  redraw();
}
fitViewport();
if(vv)vv.addEventListener('resize',fitViewport);
window.addEventListener('resize',fitViewport);
window.addEventListener('orientationchange',function(){setTimeout(fitViewport,250)});
drawCable();redraw();
window.addEventListener('load',redraw);
window.addEventListener('resize',redraw);
if(window.ResizeObserver)new ResizeObserver(redraw).observe(svg);

/* ---------- boot ---------- */
function problems(){ /* content mistakes, shown on the glass so they get fixed */
  var bad=notLoaded(),L=bad.map(function(f){return 'did not load: '+f}).concat(PROFILE.problems);
  if(!PH.texts.length)L.push('no content loaded: check the script tags in index.html');
  if(!L.length)return;
  L.forEach(function(m){console.warn('phosphor: '+m);typeLine('! '+m,'warn',null,{speed:.3})});
  if(bad.length)typeLine('(is the file there? a stray ` or ${ inside one also stops it loading.)','warn',null,{speed:.3});
  typeLine('');
}
function boot(){
  setTimeout(function(){$('#crt').classList.add('lit')},1300);
  if(!coarse){try{kb.focus({preventScroll:true})}catch(e){}}
  pause(900); /* tube warm-up */
  problems();
  banner();
  typeLine(ST.user,'',null,{pre:'login: ',hold:700,speed:2.2}); /* first visit: auto-login as guest */
  pause(450);
  welcome();
  queue(function(){booted=true});
  prompt();
}
function banner(){ /* terminal self-test from the machine's == banner == section; replayed after exit */
  var R=(PROFILE.raw.banner||[]).slice(),B=PROFILE.sec.banner||[];
  while(R.length&&!R[0].trim())R.shift(); /* line up with the parsed lines, which drop outer blanks */
  R=R.slice(0,B.length);
  R.forEach(function(raw,i){ /* LABEL | VALUE | pause-ms  prints a dotted self-test row */
    var f=raw.split('|').map(function(x){return x.trim()}),ms=0,line;
    if(f.length>=2){line=[row(UP(f[0]),UP(f[1])),''];ms=parseInt(f[2],10)||0}
    else line=Array.isArray(B[i])?B[i]:[B[i],''];
    typeLine(line[0],line[1],null,{speed:.5});
    if(ms)pause(ms);
  });
  if(R.length)typeLine('');
}
function welcome(){
  say(PROFILE.welcome);
  if(PROFILE.mail.length)typeLine('you have mail.');
  if(coarse)typeLine('(tap the screen for a keyboard.)','dim');
}
boot();
}
})();
