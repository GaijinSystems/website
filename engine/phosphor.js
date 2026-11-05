/* PHOSPHOR-9 terminal: the engine.
   Copyright (C) 2026 Gaijin Systems.

   This program is free software: you can redistribute it and/or modify it under the terms
   of the GNU Affero General Public License as published by the Free Software Foundation,
   either version 3 of the License, or (at your option) any later version. It is distributed
   WITHOUT ANY WARRANTY; see the LICENSE file for details.

   You should not need to edit this file. Your words go in site/, the imaginary computers in
   machines/, and commands in engine/commands/. index.html loads them in this order:

     engine/phosphor.js        this file: defines window.Phosphor
     engine/commands/*.js      Phosphor.command({...}) for each built-in command
     machines/machines.js      Phosphor.machines({...}): the machines that can be plugged in
     site/*.js                 Phosphor.content(`...`) text (wins over the machine)
     Phosphor.start()          loads the chosen machine's files, then boots the terminal
*/
(function(){
'use strict';

var HAS=Object.prototype.hasOwnProperty;
function has(o,k){return HAS.call(o,k)}
var LOGIN_NAME=/^[a-z][a-z0-9_]{0,7}$/i;
function lineOf(l){return Array.isArray(l)?l:[l,'']} /* a line is a string or [text,class,options] */
/* the patterns of ed and vi are basic regular expressions: \( \) group, and ( ) + ? | { are ordinary */
function bre(s){
  var o='',i=0,cls=false;
  for(;i<s.length;i++){
    var c=s.charAt(i);
    if(cls){o+=c==='\\'?'\\\\':c;if(c===']')cls=false;continue}
    if(c==='['){
      cls=true;o+=c;
      if(s.charAt(i+1)==='^'){o+='^';i++}
      if(s.charAt(i+1)===']'){o+='\\]';i++}
      continue;
    }
    if(c==='\\'&&i+1<s.length){
      var n=s.charAt(++i);
      o+=/[(){}]/.test(n)?n:/[1-9]/.test(n)?'\\'+n:'\\'+n;
      continue;
    }
    o+=/[()+?|{}]/.test(c)?'\\'+c:c;
  }
  return o;
}

function unquote(s){return s.replace(/^(['"])((?:(?!\1).)*)\1$/,'$2')} /* one quoted string only: "a" ; "b" keeps its quotes */
function setAlias(L,from,to){ /* a new alias replaces any with the same words */
  var k=from.join(' ');
  L=L.filter(function(x){return x.from.join(' ')!==k});
  L.push({from:from,to:to});
  return L;
}

var PH=window.Phosphor={
  version:'1.0.0',
  upstream:'https://github.com/GaijinSystems/phosphor', /* default for the source command */
  texts:[],defs:[],hooks:[],seen:{},catalog:{},allowed:[],machine:null,early:[],
  content:function(s){var f=me();PH.texts.push({src:String(s),site:!f||/(^|\/)site\//.test(f)})}, /* settings and == sections == */
  command:function(def){me();PH.defs.push(def)},  /* a built-in command, see engine/commands */
  setup:function(fn){me();PH.hooks.push(fn)},     /* machine hook: runs after the file tree exists */
  machines:function(m){me();Object.assign(PH.catalog,m)}, /* machines/machines.js: what can be plugged in */
  start:start
};

/* Every file index.html loads calls one of the three functions above, which notes the file
   as loaded. A file that is missing, or that has a stray ` or ${ in it, never gets that far,
   so start() can name it on the glass. (The browser's own error event cannot be used: for
   a page opened from disk it hides which file failed.) */
function me(){
  var s=document.currentScript,f=s?(s.getAttribute('src')||''):'';
  if(f)PH.seen[f]=true;
  return f;
}
function notLoaded(){
  var L=[],S=document.querySelectorAll('script[src]');
  for(var i=0;i<S.length;i++){
    var f=S[i].getAttribute('src');
    if(/(^|\/)(engine|machines|site)\//.test(f)&&!/(^|\/)engine\/phosphor\.js$/.test(f)&&!PH.seen[f])L.push(f); /* only our own files: a page may carry others */
  }
  return L;
}

/* ---------- which machine: chosen before anything is built, because the machine's files
   have to load first. The site's settings say which are allowed; ?machine=name picks one. ---------- */
function setting(name){ /* one site setting, read early: settings end at a block's first == section == */
  var v=null,re=new RegExp('^\\s*'+name+'\\s*:\\s*(.*?)\\s*$','i');
  PH.texts.forEach(function(t){
    if(!t.site)return;
    var L=t.src.split(/\r?\n/);
    for(var i=0;i<L.length;i++){
      if(/^\s*==.*==\s*$/.test(L[i]))break;
      var m=L[i].match(re);if(m)v=m[1];
    }
  });
  return v;
}
function pickMachine(){
  var all=Object.keys(PH.catalog);
  if(!all.length)return null; /* an index.html that lists its machine's script tags itself */
  var known=function(x){
    if(has(PH.catalog,x))return true;
    PH.early.push('unknown machine "'+x+'": see machines/machines.js');
    return false;
  };
  var want=(setting('machines')||'').split(',').map(function(x){return x.trim().toLowerCase()}).filter(Boolean).filter(known);
  PH.allowed=want.length?want:all;
  var def=(setting('machine')||'').toLowerCase(),asked=(new URLSearchParams(location.search).get('machine')||'').toLowerCase();
  if(def&&PH.allowed.indexOf(def)<0){PH.early.push('machine: "'+def+'" is not one of the machines allowed');def=''}
  PH.machine=PH.allowed.indexOf(asked)>=0?asked:def||PH.allowed[0];
  return PH.machine;
}
function loadMachine(id,done){ /* in order; a file that fails to load is named on the glass later */
  var M=PH.catalog[id],left=0;
  (M.files||[]).forEach(function(f){
    var src=M.dir+'/'+f,el;
    if(/\.css$/.test(f)){ /* before the site's theme, so the site still wins */
      el=document.createElement('link');el.rel='stylesheet';el.href=src;
      document.head.insertBefore(el,document.querySelector('link[href^="site/"]'));
      return;
    }
    el=document.createElement('script');el.src=src;el.async=false;left++;
    el.onload=el.onerror=function(){if(!--left)done()};
    document.body.appendChild(el);
  });
  if(!left)done();
}
function start(){
  if(PH.started)return;PH.started=true;
  var id=pickMachine();
  if(id)loadMachine(id,build);else build();
}

function build(){

/* ---------- content (parsed from every Phosphor.content block, in load order) ---------- */
var SITE=(location.hostname||'').toLowerCase(); /* the real server this page came from ('' when opened as a file) */
var PROFILE=(function(){
  var P={name:'OPERATOR',email:'',speed:1,upper:true,sound:true,protected:[],homes:'/usr',notFound:'%s: not found',
    cord:{turns:7,width:18,thickness:3.2,gap:1.8,straight:7.35,sway:2.5},
    title:'',badge:'PHOSPHOR-9',year:1979,installed:'',user:'guest',hostname:'',source:'',prompt:'$ ',
    offline:'the network is down.',off:[],machine:'',machines:'',
    welcome:null,about:[],mail:[],commands:[],files:[],dirs:[],man:{},aliases:[],sec:{},raw:{},problems:[]};
  var secs=[];
  function yes(v){return !/^(no|false|off|0)$/i.test(v)}
  function list(v){return v.split(',').map(function(x){return x.trim().toLowerCase()}).filter(Boolean)}
  var CL={turns:[1,40],width:[6,80],thickness:[1,8],gap:[0,10],straight:[0,200],sway:[0,10]};
  function setKey(k,v){
    var ck=k.match(/^cord (\w+)$/);
    if(ck&&has(CL,ck[1])){var x=parseFloat(v),L=CL[ck[1]];if(!isNaN(x))P.cord[ck[1]]=Math.min(L[1],Math.max(L[0],x));return}
    if(k==='name'){if(v)P.name=v}
    else if(/^(email|title|badge|installed|offline|machine|machines)$/.test(k))P[k]=v;
    else if(k==='homes'){if(/^\/[\w\/-]*$/.test(v))P.homes=v.replace(/\/+$/,'')} /* where home folders live */
    else if(k==='speed'){var n=parseFloat(v);if(n>0)P.speed=n}
    else if(k==='sound')P.sound=yes(v);
    else if(k==='uppercase')P.upper=yes(v);
    else if(k==='protected')P.protected=P.protected.concat(v.split(',').map(function(x){return x.trim()}).filter(Boolean));
    else if(k==='not found')P.notFound=v;
    else if(k==='case')P.caseless=/^(ignore|insensitive|no)$/i.test(v); /* case: ignore = FILE and file are the same */
    else if(k==='year'){var y=parseInt(v,10);if(y>0)P.year=y}
    else if(k==='user'){if(LOGIN_NAME.test(v))P.user=v.toLowerCase()}
    else if(k==='hostname')P.hostname=v.toLowerCase();
    else if(k==='source'){ /* becomes a link: same rule as links in the text */
      if(!v||/^https?:\/\/\S+$/i.test(v))P.source=v;
      else P.problems.push('source: must start with http:// or https://');
    }
    else if(k==='prompt')P.prompt=v.replace(/^"(.*)"$/,'$1');
    else if(k==='commands')list(v).forEach(function(x){ /* commands: -ping, -ifconfig switches them off */
      if(x.charAt(0)==='-')P.off.push(x.slice(1));
      else P.off=P.off.filter(function(o){return o!==x});
    });
    else P.problems.push('unknown setting "'+k+'"');
  }
  P.problems=P.problems.concat(PH.early);
  /* the machine's text first, whatever order the files arrived in: the site wins */
  PH.texts.filter(function(t){return !t.site}).concat(PH.texts.filter(function(t){return t.site})).forEach(function(text){
    var cur=null; /* settings come first in each block, before its first == section == */
    text.src.replace(/\r/g,'').split('\n').forEach(function(raw){
      if(/^\s*#/.test(raw))return;
      var h=raw.match(/^\s*==\s*(.*?)\s*==\s*$/);
      if(h){cur={head:h[1],lines:[],site:text.site};secs.push(cur);return}
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
  function up(t){return P.upper?String(t).toUpperCase():t}
  P.fold=function(t){return P.caseless?String(t).toLowerCase():String(t)}; /* names, as this machine sees them */
  P.up=up;
  function trimBlank(L){
    L=L.slice();
    while(L.length&&!L[0].trim())L.shift();
    while(L.length&&!L[L.length-1].trim())L.pop();
    return L;
  }
  function lines(L){
    return trimBlank(L).map(function(l){
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
      var re=/(\S)( {2,})(?=\S)/,x=lineOf(l),s=x[0];             /* that run becomes a squeezable gap */
      if(!re.test(s))return l;
      return [s.replace(re,'$1\u0003$2\u0004'),x[1]||'',Object.assign({row:true},x[2])];
    });
    else if(/^alias(es)?$/i.test(hd))sc.lines.forEach(function(l){
      var a=l.match(/^\s*([^=#]+?)\s*=\s*(.+?)\s*$/);
      if(!a)return;
      P.aliases=setAlias(P.aliases,P.fold(a[1]).split(/\s+/),unquote(fill(a[2]))); /* the command keeps its case: echo Hello prints Hello */
    });
    else if((m=hd.match(/^command\s*:\s*([^|]+?)\s*(?:\|\s*(.*))?$/i))){
      var names=list(m[1]);
      if(!names.length)return;
      P.commands=P.commands.filter(function(c){return !c.names.some(function(n){return names.indexOf(n)>=0})});
      P.commands.push({names:names,help:up(fill(m[2]||'')),body:body,site:sc.site});
    }
    else if((m=hd.match(/^file\s*:\s*(\S+)$/i)))P.files.push({name:m[1],body:body});
    else if((m=hd.match(/^dir(?:ectory)?\s*:\s*(\S+)$/i)))P.dirs.push(m[1]);
    else if((m=hd.match(/^man\s*:\s*(\S+)$/i)))P.man[m[1].toLowerCase()]=body;
    else{var key=hd.toLowerCase();P.sec[key]=body;P.raw[key]=trimBlank(sc.lines).map(fill)} /* machine sections: banner, dmesg, ps ... */
  });
  if(!P.welcome)P.welcome=[up('welcome to '+P.name.toLowerCase()+'.'),[up('type help and press return.'),'dim']];
  return P;
})();

function $(s){return document.querySelector(s)}
var term=$('#term'),out=$('#out'),glow=$('#glow'),kb=$('#kb'),svg=$('#cable'),sway=$('#sway');
var cursor=document.createElement('span');cursor.className='cursor';
var calm=matchMedia('(prefers-reduced-motion:reduce)');
/* what screen readers hear: each line once it is finished, not every character of the typing */
var log=document.createElement('div');log.id='log';log.setAttribute('role','log');log.setAttribute('aria-live','polite');
document.body.appendChild(log);
function announce(s){
  if(!s.trim())return;
  var p=document.createElement('div');p.textContent=s;log.appendChild(p);
  trim(log,50);
}
var coarse=matchMedia('(pointer:coarse)').matches;
var chain=Promise.resolve(),buf='',bufNode=null,hist=[],hi=0;
if(PROFILE.title)document.title=PROFILE.title;
var badge=$('.badge');if(badge)badge.textContent=PROFILE.badge;

/* Output runs through one queue, in order. A step's own queue() calls run inside that step, before
   the next step, so a stage of a pipeline finishes all its output before the next stage starts.
   Ctrl-C bumps GEN: steps queued before it are skipped, unless they must always run (prompts). */
var GEN=0,inner=null,wakers=[];
function sleep(ms){return new Promise(function(r){
  var done=function(){clearTimeout(t);wakers.splice(wakers.indexOf(done),1);r()},t=setTimeout(done,ms);
  wakers.push(done);
})}
function queue(fn,always){
  var g=GEN,oops=function(e){console.error(e)},step=function(){
    if(g!==GEN&&!always)return;
    var sc={p:null},saved=inner,ret;
    inner=sc;
    try{ret=fn()}finally{inner=saved}
    return Promise.resolve(ret).then(function(){return sc.p});
  };
  if(inner){inner.p=(inner.p||Promise.resolve()).then(step).catch(oops);return inner.p}
  chain=chain.then(step).catch(oops);return chain;
}
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
  if(calm.matches)return;
  var n=performance.now();
  if(!force&&(n-lastG<90||glow.childElementCount>2))return;
  lastG=n;
  var g=out.cloneNode(true);
  g.removeAttribute('id');g.className='ghost';g.inert=true; /* a copy: its links must not take focus */
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
function trim(box,max){while(box.childElementCount>max)box.firstElementChild.remove()}

/* ---------- typing engine ---------- */
var UP=PROFILE.up;
var SINK=null,STDIN=null,STATUS=0,HOLD=false,held=null,BAUD=0; /* where output goes; what a command reads; $?; ^S; stty */
function plain(s){return String(s).replace(/\u0003([^\u0004]*)(\u0004|$)/g,'$1').replace(/[\u0001-\u0004]/g,'')}
function typeLine(text,cls,cb,opt){
  opt=opt||{};
  return queue(function(){return new Promise(function(res){
    var gen=GEN,burst=1;
    text=typeof text==='function'?text():text; /* a function = text worked out when its turn comes (ping) */
    if(cls==='err')STATUS=1;
    if(SINK&&cls!=='err'){ /* a pipe or a file; errors still go to the glass */
      SINK.push(' '.repeat(opt.indent||0)+(opt.pre||'')+plain(text));
      if(cb)cb();res();return;
    }
    text=UP(text);
    var d=document.createElement('div'),host=d;
    d.className='line'+(cls?' '+cls:'')+(opt.row?' row':'');
    /* indent: left margin for the whole line; hang: extra margin for wrapped continuation lines only */
    if(opt.indent||opt.hang){d.style.paddingLeft=((opt.indent||0)+(opt.hang||0))+'ch';if(opt.hang)d.style.textIndent=(-opt.hang)+'ch'}
    if(opt.href){host=document.createElement('a');host.href=opt.href;
      if(!/^mailto:/i.test(opt.href)){host.target='_blank';host.rel='noopener'}d.appendChild(host)}
    var pre=opt.pre?UP(opt.pre):'',t=document.createTextNode(pre);host.appendChild(t);
    d.appendChild(cursor);out.appendChild(d);trim(out,240);
    var at=host===d?cursor:null; /* new text goes before the cursor; a link has no cursor inside it */
    var sp=opt.speed||1,i=0;
    function step(){
      if(gen!==GEN){res();return}
      if(HOLD){held=step;return}
      if(i>=text.length){
        scrollBottom();
        announce(pre+text.replace(/\u0003[^\u0004]*(\u0004|$)/g,' ').replace(/[\u0001-\u0004]/g,''));
        if(cb)cb();res();return;
      }
      var ch=text.charAt(i++);
      if(ch==='\u0003'){ /* a squeezable gap (mail rows, self-test dots): shrinks to fit narrow glass */
        var j=text.indexOf('\u0004',i);if(j<0)j=text.length;
        var g=document.createElement('span');g.className='gap';
        g.dataset.n=j-i;g.dataset.f=text.charAt(i)||' ';g.dataset.w=text.replace(/[\u0001-\u0004]/g,'').length;
        host.insertBefore(g,at);squeeze(g);
        t=document.createTextNode('');host.insertBefore(t,at);
        i=j+1;step();return;
      }
      if(ch==='\u0001'||ch==='\u0002'){ /* ~~struck~~ text: start or end an <s> run */
        t=document.createTextNode('');
        if(ch==='\u0001'){var s=document.createElement('s');s.appendChild(t);host.insertBefore(s,at)}
        else host.insertBefore(t,at);
        step();return;
      }
      t.data+=ch;scrollBottom();
      if(BAUD){ /* a real line speed: ten bits a character, drawn a few at a time */
        if(--burst>0){step();return}
        burst=Math.max(1,Math.round(BAUD/500));
        if(ch!==' ')click(.194);
        setTimeout(step,burst*10000/BAUD);
        return;
      }
      if(ch!==' ')click(.194);
      setTimeout(step,(ch===' '?.35:1)*(14+Math.random()*38)*sp/PROFILE.speed);
    }
    if(opt.hold)setTimeout(step,opt.hold);else step();
  })});
}
function say(lines){
  lines.forEach(function(l){var x=lineOf(l);typeLine(x[0],x[1],null,x[2])});
}
function cols(){ /* how many characters fit on one line of the glass right now */
  var p=document.createElement('span');p.textContent='0000000000';
  p.style.cssText='position:absolute;visibility:hidden;white-space:pre';
  out.appendChild(p);var cw=p.getBoundingClientRect().width/10;p.remove();
  var cs=getComputedStyle(out),w=out.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight);
  return cw>0?Math.floor(w/cw+.01):999;
}
function squeeze(g,c){ /* shrink a gap (never below 2 characters) until its row fits */
  var over=Math.max(0,+g.dataset.w-(c||cols())),n=Math.max(2,+g.dataset.n-over);
  if(g.textContent.length!==n)g.textContent=(g.dataset.f||' ').repeat(n);
}
window.addEventListener('resize',function(){ /* rows already printed re-fit on rotate/resize */
  var gs=out.querySelectorAll('.gap');if(!gs.length)return;
  var c=cols();for(var i=0;i<gs.length;i++)squeeze(gs[i],c);
});
var MODE='shell'; /* shell | login | password (password input is not echoed) */
function showPrompt(p,mode){
  MODE=mode||'shell';
  if(p)announce(UP(p)); /* login: and Password: ask for something; the shell prompt is just noise */
  var d=document.createElement('div');d.className='line';
  bufNode=document.createTextNode(MODE==='password'?'':UP(buf));
  d.appendChild(document.createTextNode(UP(p==null?PROFILE.prompt:p)));d.appendChild(bufNode);d.appendChild(cursor);
  out.appendChild(d);trim(out,240);term.classList.add('idle');scrollBottom();
}
function prompt(p,mode){queue(function(){showPrompt(p,mode)},true)}
var READ=null,TRAP=false,INT='\u0003'; /* a program is waiting for a line from the keyboard */
function readLine(p,trap){ /* one line from the keyboard, or null at ^D or ^C. Call it from inside a queued step.
                              trap: the program deals with ^C itself, and gets INT */
  return new Promise(function(res){READ=res;TRAP=!!trap;showPrompt(p==null?'':p,'read')});
}
/* The glass as a screen: a program draws whole lines, and every key comes to it. Used by vi. */
var KEYS=null;
function fullscreen(keys,onResize){
  var el=document.createElement('div');el.id='full';
  out.style.display='none';term.classList.remove('idle');term.appendChild(el);
  KEYS=keys;
  var said='',S={
    rows:24,cols:80,
    draw:function(lines,r,c){
      var i,f=document.createDocumentFragment();
      for(i=0;i<lines.length;i++){
        var d=document.createElement('div');d.className='line';
        if(i===r){
          var t=lines[i],cu=document.createElement('span');cu.className='fcur';
          d.appendChild(document.createTextNode(t.slice(0,c)));
          cu.textContent=t.charAt(c)||' ';
          d.appendChild(cu);
          d.appendChild(document.createTextNode(t.slice(c+1)));
        }
        else d.textContent=lines[i];
        f.appendChild(d);
      }
      el.textContent='';el.appendChild(f);
    },
    say:function(m){if(m!==said){said=m;announce(m)}},
    close:function(){
      KEYS=null;window.removeEventListener('resize',size);
      el.remove();out.style.display='';
      term.scrollTop=term.scrollHeight;
    }
  };
  function size(){
    var p=document.createElement('span');p.textContent='0000000000';
    p.style.cssText='position:absolute;visibility:hidden;white-space:pre';
    el.appendChild(p);
    var r=p.getBoundingClientRect(),cs=getComputedStyle(el);p.remove();
    var cw=r.width/10,lh=parseFloat(cs.lineHeight)||r.height||16;
    var w=el.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight);
    var h=term.clientHeight-parseFloat(cs.paddingTop)-parseFloat(cs.paddingBottom);
    S.cols=Math.max(20,cw>0?Math.floor(w/cw+.01):80);
    S.rows=Math.max(5,Math.floor(h/lh+.01));
    if(onResize&&KEYS)onResize();
  }
  var keep=onResize;onResize=null;size();onResize=keep;
  window.addEventListener('resize',size);
  return S;
}
function input(names,done){ /* the lines a command works on: named files, else its pipe or <, else the keyboard */
  if(names.length){
    var L=[];
    names.forEach(function(x){
      var n=find(x);
      if(!n||n.type==='d'||n.prot)typeLine("can't open "+x,'err');
      else L=L.concat(textOf(n));
    });
    done(L);
    return;
  }
  if(STDIN){done(STDIN);return}
  var got=[];
  queue(function(){
    return (function more(){return readLine().then(function(l){if(l===null)return;got.push(l);return more()})})();
  });
  queue(function(){done(got)});
}

/* ---------- shell state ---------- */
var OWNER=PROFILE.owner;
var ST={owner:OWNER,user:PROFILE.user,home:PROFILE.homes+'/'+PROFILE.user,cwd:PROFILE.homes+'/'+PROFILE.user,site:SITE,hostname:PROFILE.host,login:now()};
var DAYS=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],MONS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function p2(x){return String(x).padStart(2,'0')}
function now(){ /* the time of day, moved to the machine's year (February 29 becomes the 28th in a non-leap year) */
  var n=new Date(),y=PROFILE.year,d=n.getDate();
  if(n.getMonth()===1&&d===29&&new Date(y,1,29).getMonth()!==1)d=28;
  return new Date(y,n.getMonth(),d,n.getHours(),n.getMinutes(),n.getSeconds());
}
function tz(){
  try{var q=new Intl.DateTimeFormat('en-US',{timeZoneName:'short'}).formatToParts(new Date());
    for(var i=0;i<q.length;i++)if(q[i].type==='timeZoneName')return q[i].value}catch(e){}
  return '';
}
function monDay(d){return MONS[d.getMonth()]+' '+String(d.getDate()).padStart(2,' ')}
function short(d){return monDay(d)+' '+p2(d.getHours())+':'+p2(d.getMinutes())}
function ctime(d){return DAYS[d.getDay()]+' '+short(d)+':'+p2(d.getSeconds())}
var FD=(function(){var d=new Date(ST.login.getTime()-864e5);d.setHours(21,41,0,0);return d})(); /* home files: last night */
var SD=(function(){ /* system files: the machine's install date (installed: 1979-01-10 16:12) */
  var m=PROFILE.installed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:\s+(\d{1,2}):(\d{2}))?/);
  return m?new Date(+m[1],m[2]-1,+m[3],+(m[4]||0),+(m[5]||0)):new Date(PROFILE.year,0,1);
})();
function lsdate(d){ /* as ls does it: older than six months shows the year instead of the time */
  return ST.login-d>15552e6?monDay(d)+'  '+d.getFullYear():short(d);
}

/* ---------- file system: the machine builds the system folders; site files live in home ---------- */
function mk(type,name,o){
  var n={type:type,name:name,owner:OWNER,date:FD,prot:false,bin:false,body:null,size:0,mode:null,dev:null,
    kids:type==='d'?Object.create(null):null,parent:null};
  return Object.assign(n,o);
}
var ROOT=mk('d','',{owner:'root',date:SD});ROOT.parent=ROOT;
function parts(p){return p.split('/').filter(Boolean)}
function put(abs,type,o){ /* create a node, making any missing parent folders */
  var s=parts(PROFILE.fold(abs)),n=ROOT,i,k;
  if(!s.length)return ROOT;
  for(i=0;i<s.length-1;i++){
    k=n.kids[s[i]];
    if(!k||k.type!=='d'){k=n.kids[s[i]]=mk('d',s[i],{owner:n.owner,date:n.date});k.parent=n}
    n=k;
  }
  var last=s[s.length-1],ex=n.kids[last];
  if(ex&&ex.type==='d'&&type==='d')return Object.assign(ex,o);
  ex=n.kids[last]=mk(type,last,o);ex.parent=n;return ex;
}
function home(p){return p.charAt(0)==='/'?p:p.slice(0,2)==='~/'?ST.home+p.slice(1):ST.home+'/'+p}
function norm(p){ /* absolute path; handles ~, . and .. */
  p=PROFILE.fold(p);
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
function textOf(n){return (body(n)||[]).map(function(l){return plain(lineOf(l)[0])})}
function isScript(n){return n.type==='f'&&/x/.test(n.mode||'')&&n.body}
function dirOf(abs){return abs.slice(0,abs.lastIndexOf('/'))||'/'}
function canWrite(abs){ /* your home folder, or a folder anyone may write in; nothing else, and nothing locked */
  var dir=find(dirOf(abs));
  if(!dir||dir.type!=='d'||dir.prot)return false;
  var at=pathOf(dir);
  return dir.mode==='drwxrwxrwx'||at===ST.home||at.indexOf(ST.home+'/')===0;
}
function writeFile(p,lines,append){ /* false if it cannot be written */
  var abs=norm(p),ex=find(abs,true);
  if(ex&&ex.dev)return !ex.prot; /* /dev/null and friends swallow it */
  if(ex&&(ex.type==='d'||ex.prot||ex.parent.prot)||!canWrite(abs))return false;
  if(!ex)put(abs,'f',{body:lines.slice(),owner:ST.user,date:now()});
  else{ex.body=append?textOf(ex).concat(lines):lines.slice();ex.size=0;ex.date=now()}
  return true;
}
function bsize(L){return L.reduce(function(n,l){return n+lineOf(l)[0].length+1},0)}
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
  var p={names:names.join(', '),what:what,syn:syn,desc:F(desc),bugs:F(bugs)};
  names.forEach(function(n){MAN[n]=p});
  return p;
}
function install(n,fn,noh){ /* later definitions of the same name win */
  CMDS[n]=fn;NOH[n]=noh;delete PATHS[n];
  HELP=HELP.filter(function(h){return h[0]!==n});
}
PH.defs.forEach(function(d){
  if(typeof d.enabled==='function'&&!d.enabled(PROFILE))return; /* e.g. about, only when there is an about section */
  var names=(d.names||[]).filter(function(n){return PROFILE.off.indexOf(n)<0});
  if(!names.length||typeof d.run!=='function')return;
  names.forEach(function(n){install(n,d.run,!!d.noHelpFlag)});
  if(d.path)PATHS[names[0]]=d.path; /* where its program file shows up in the file tree */
  if(d.help&&!d.hidden)HELP.push([names[0],d.help]);
  if(d.man)page(names,d.man.what||'',d.man.syn||names[0],d.man.desc,d.man.bugs);
});
/* Text commands (== command: NAME ==). They cannot take the name of a core command while
   it is running; switch it off first ("commands: -mail") and yours takes its place.
   "commands: -name" also removes the machine's text commands (sudo), but never the site's:
   to remove one of yours, delete it. */
var RESERVED=[];
PH.defs.forEach(function(d){if(d.core&&d.names&&d.names[0])RESERVED.push(d.names[0])});
PROFILE.commands.forEach(function(c){
  var n=c.names.filter(function(x){
    var off=PROFILE.off.indexOf(x)>=0;
    if(RESERVED.indexOf(x)>=0&&!off)return false;
    return c.site||!off;
  });
  if(!n.length)return;
  var fn=function(){say(c.body)};
  n.forEach(function(x){install(x,fn,false);delete MAN[x]}); /* replaces any built-in of that name, its manual page and program file too */
  if(c.help){
    HELP.push([n[0],c.help]);
    page(n,c.help.toLowerCase(),n[0],[c.help.toLowerCase()+'.']); /* a page made from the help text */
  }
});
Object.keys(PROFILE.man).forEach(function(k){ /* == man: NAME == sections */
  if(has(MAN,k))MAN[k].desc=PROFILE.man[k];
  else page([k],'',k,PROFILE.man[k]);
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
      var x=lineOf(l),t=x[0];if(!t){L.push('');return}
      var lead=t.match(/^ */)[0].length;t=t.slice(lead);
      var opt=t.match(/^(\S+ {2,})\S/); /* "-l   long listing ..." wraps under its text */
      L.push([t,x[1]||'',Object.assign({indent:I+lead,hang:opt?opt[1].length:0},x[2])]);
    });
  }
  block('DESCRIPTION',p.desc);block('BUGS',p.bugs);
  return L;
}

/* ---------- build the file tree ---------- */
var LOGOUT=false;
var ENV={PATH:':/bin:/usr/bin',TERM:'p9'};
Object.assign(PH,{ /* what commands and machine hooks may use */
  profile:PROFILE,st:ST,cmds:CMDS,man:MAN,paths:PATHS,help:function(){return HELP.slice()},
  fullscreen:fullscreen,piped:function(){return !!SINK},bre:bre,INT:INT,
  fold:PROFILE.fold,stdin:function(){return STDIN},input:input,readLine:readLine,text:textOf,canWrite:canWrite,writeFile:writeFile,
  status:function(n){STATUS=n},baud:function(b){if(b!==undefined)BAUD=b;return BAUD},env:ENV,runScript:runScript,
  aliases:PROFILE.aliases.slice(),setAlias:setAlias,unquote:unquote,has:has,lineOf:lineOf,
  say:say,typeLine:typeLine,pause:pause,queue:queue,sleep:sleep,click:click,
  sound:function(on){if(on===undefined)return SND.clicks;if(on&&!actx())return false;SND.clicks=!!on;return true},
  find:find,norm:norm,put:put,home:home,pathOf:pathOf,body:body,fsize:fsize,longRow:longRow,
  root:ROOT,fileDate:FD,systemDate:SD,
  ctime:ctime,short:short,now:now,p2:p2,tz:tz,row:row,manPage:manPage,fill:PROFILE.fill,
  clear:function(){queue(function(){afterglow(term.scrollTop,.55,900,true);out.textContent='';log.textContent=''})},
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
  var parts=seg.trim().split(/\s+/),low=parts.map(PROFILE.fold),best=null;
  PH.aliases.forEach(function(x){
    if(x.from.length>low.length)return;
    for(var i=0;i<x.from.length;i++)if(x.from[i]!==low[i])return;
    if(!best||x.from.length>best.from.length)best=x;
  });
  return best?[best.to].concat(parts.slice(best.from.length)).join(' '):seg.trim();
}
function runOne(s,words){
  s=s.trim();
  words=words||s.split(/\s+/);
  if(!s||!words[0])return;
  STATUS=0;
  var parts=words.map(PROFILE.fold),c=parts[0],args=parts.slice(1),word=words[0];
  var f=has(CMDS,c)?CMDS[c]:null,name=c;
  if(!f&&c.indexOf('/')>=0){ /* /bin/ls runs ls; any other path is not a program */
    var n=find(c);
    if(n&&n.bin&&has(CMDS,n.name)){f=CMDS[n.name];name=n.name}
    else if(n&&isScript(n)){runScript(textOf(n));return}
    else if(n){typeLine(word+': cannot execute','err');return}
  }
  if(f&&!NOH[name]&&args.indexOf('-h')>=0&&has(MAN,name)){typeLine('usage: '+MAN[name].syn);return}
  if(f){
    try{f(args,s,words)}catch(e){console.error(e);typeLine(name+': core dumped','err')}
  }
  else typeLine(PROFILE.notFound.replace('%s',word),'err');
}
/* ---------- the shell: words, quotes, $variables, wildcards, pipes, redirection, && and || ---------- */
function envOf(k){
  if(k==='?')return String(STATUS);
  if(k==='$')return '23';
  if(k==='HOME')return ST.home;
  if(k==='USER'||k==='LOGNAME')return ST.user;
  return has(ENV,k)?ENV[k]:'';
}
function glob(w){ /* a word with * ? [ ] becomes the names it matches, sorted; no match leaves it as it is */
  if(!/[*?\[]/.test(w))return [w];
  var abs=w.charAt(0)==='/',found=[abs?'/':''];
  w.split('/').filter(Boolean).forEach(function(seg){
    var next=[];
    if(!/[*?\[]/.test(seg)){
      found.forEach(function(p){next.push(p+seg+'/')});
      found=next;
      return;
    }
    var re;
    try{re=new RegExp('^'+seg.replace(/[.+^${}()|\\]/g,'\\$&').replace(/\*/g,'.*').replace(/\?/g,'.')+'$',PROFILE.caseless?'i':'')}catch(e){found=[];return}
    found.forEach(function(p){
      var d=find(p||'.');
      if(!d||d.type!=='d'||d.prot)return;
      Object.keys(d.kids).sort().forEach(function(k){
        if(re.test(k)&&(k.charAt(0)!=='.'||seg.charAt(0)==='.'))next.push(p+k+'/');
      });
    });
    found=next;
  });
  found=found.map(function(p){return p.replace(/\/$/,'')}).filter(function(p){return p&&find(p)});
  return found.length?found:[w];
}
function parseList(s){ /* a line with no top-level ; into [{op,stages:[{words,raw,in,out,app}]}] */
  var list=[],stages=[],op=null,w=null,quoted=false,redir=null,i=0;
  function fresh(){return {words:[],raw:'',in:null,out:null,app:false}}
  var st=fresh();
  function endWord(){
    if(w===null)return;
    if(redir){if(redir==='<')st.in=w;else{st.out=w;st.app=redir==='>>'}redir=null}
    else st.words=st.words.concat(quoted?[w]:glob(w));
    w=null;quoted=false;
  }
  function endStage(){endWord();if(st.words.length||st.in||st.out)stages.push(st);st=fresh()}
  function endList(nextOp){endStage();if(stages.length)list.push({op:op,stages:stages});stages=[];op=nextOp}
  function vars(t){return t.replace(/\$(\w+|\?|\$)/g,function(m,k){return envOf(k)})}
  while(i<s.length){
    var ch=s.charAt(i),two=s.substr(i,2),close;
    if(/\s/.test(ch)){endWord();if(!redir)st.raw+=ch;i++;continue}
    if(ch==='#'&&w===null)break;
    if(two==='&&'||two==='||'){endList(two);i+=2;continue}
    if(ch==='|'){endStage();i++;continue}
    if(ch==='&'){i++;continue} /* no background here: it just runs */
    if(two==='>&'){endWord();i+=3;continue} /* 2>&1: errors are on the glass either way */
    if(ch==='>'||ch==='<'){
      endWord();
      redir=two==='>>'?'>>':ch;
      i+=redir.length;
      continue;
    }
    if(!redir)st.raw+=ch;
    if(ch==='\\'&&i+1<s.length){
      w=(w||'')+s.charAt(i+1);quoted=true;
      if(!redir)st.raw+=s.charAt(i+1);
      i+=2;continue;
    }
    if((ch==="'"||ch==='"')&&(w===null||/=$/.test(w))&&(close=s.indexOf(ch,i+1))>=0){
      var inside=s.slice(i+1,close);
      w=(w||'')+(ch==='"'?vars(inside):inside);quoted=true;
      if(!redir)st.raw+=s.slice(i+1,close+1);
      i=close+1;continue;
    }
    if(ch==='$'){
      var m=s.slice(i).match(/^\$(\w+|\?|\$)/);
      if(m){
        w=(w||'')+envOf(m[1]);
        if(!redir)st.raw+=m[0].slice(1);
        i+=m[0].length;continue;
      }
    }
    w=(w||'')+ch;i++;
  }
  endList(null);
  return list;
}
function runPipeline(stages){
  var pipe=null;
  stages.forEach(function(st,i){
    var last=i===stages.length-1,sink=null,keepSink,keepIn,ok=true;
    queue(function(){
      keepSink=SINK;keepIn=STDIN;
      if(st.in!==null){
        var n=find(st.in);
        if(!n||n.type==='d'||n.prot){typeLine(st.in+': cannot open','err');pipe=[];ok=false;return}
        pipe=textOf(n);
      }
      if(st.out!==null&&!writeFile(st.out,[],true)){typeLine(st.out+': cannot create','err');pipe=[];ok=false;return}
      if(st.out!==null&&!st.app)writeFile(st.out,[],false);
      if(!last||st.out!==null)sink=[];
      if(sink)SINK=sink;
      if(pipe)STDIN=pipe;
      var as=st.words.length===1&&st.words[0].match(/^([A-Za-z_]\w*)=(.*)$/);
      if(as){ENV[as[1]]=as[2];STATUS=0}
      else runOne(st.raw,st.words);
    });
    queue(function(){
      if(!ok)return;
      if(st.out!==null&&sink)writeFile(st.out,sink,true);
      pipe=st.out!==null?[]:sink;
      SINK=keepSink;STDIN=keepIn;
    },true);
  });
}
function execSeg(seg){
  queue(function(){
    parseList(seg).forEach(function(item){
      queue(function(){
        if(LOGOUT)return;
        if(item.op==='&&'&&STATUS!==0)return;
        if(item.op==='||'&&STATUS===0)return;
        runPipeline(item.stages);
      });
    });
  });
}
function runScript(lines){ /* each line runs in turn, inside the current step */
  lines.forEach(function(l){
    queue(function(){splitCmds(l).forEach(function(seg){if(seg.trim())execSeg(expand(seg))})});
  });
}
function splitCmds(s){ /* on ; outside quotes. A quote only opens at the start of a word or after =, so don't ; won't is two commands */
  var L=[],start=0,ch,j;
  for(var i=0;i<s.length;i++){
    ch=s.charAt(i);
    if(ch===';'){L.push(s.slice(start,i));start=i+1}
    else if((ch==="'"||ch==='"')&&(!i||/[\s=;]/.test(s.charAt(i-1)))&&(j=s.indexOf(ch,i+1))>=0)i=j;
  }
  L.push(s.slice(start));
  return L;
}
function run(raw){
  /* commands separated by ; run in turn; an alias may expand to several (alias cl='clear ; ls') */
  var segs=[];
  splitCmds(raw).forEach(function(seg){segs=segs.concat(splitCmds(expand(seg)))});
  if(segs.some(function(x){return /[|<>*?\[$&\\#"'=]/.test(x)})){ /* needs the shell's parser */
    segs.forEach(function(x){if(x.trim())execSeg(x)});
    queue(function(){if(LOGOUT){LOGOUT=false;return}showPrompt()},true);
    return;
  }
  for(var i=0;i<segs.length&&!LOGOUT;i++)runOne(segs[i]);
  if(LOGOUT){LOGOUT=false;return} /* exit already queued the login: prompt */
  prompt();
}

/* ---------- login (after exit/logout) ---------- */
function login(name){
  var n=name.trim().toLowerCase();
  if(!n){prompt('login: ','login');return}
  var usr=find(PROFILE.homes);
  if(n==='root'||n===OWNER||!LOGIN_NAME.test(n)||(n!==ST.user&&usr&&usr.kids[n])){prompt('Password:','password');return}
  var h=usr&&usr.kids[ST.user]; /* the home folder follows whoever logs in */
  if(h&&n!==ST.user){delete usr.kids[ST.user];h.name=n;usr.kids[n]=h}
  ST.user=n;ST.home=PROFILE.homes+'/'+n;ST.cwd=ST.home;ST.login=now();
  welcome();prompt();
}

/* ---------- input ---------- */
function renderBuf(){if(bufNode){bufNode.data=MODE==='password'?'':UP(buf);scrollBottom()}}
function setBuf(v){
  buf=v.replace(/[\r\n]/g,'').slice(0,255);
  if(kb.value!==buf)kb.value=buf;
  renderBuf();
}
function submit(){
  click(1,700);
  if(!bufNode)return; /* no prompt up yet: output is still typing */
  term.classList.remove('idle');
  var cmd=buf;bufNode=null;setBuf('');
  if(MODE==='read'){var r=READ;READ=null;r(cmd);return}
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
  if(KEYS){var v=kb.value;kb.value='';for(var i=0;i<v.length;i++)KEYS(v.charAt(i));return}
  var grew=kb.value.length>buf.length;setBuf(kb.value);if(grew)click(.667);
});
function navKey(e){ /* Enter, the history arrows and scrollback paging, typed in either place */
  var k=e.key,d=k==='ArrowUp'||k==='PageUp'?-1:1;
  if(k==='Enter')submit();
  else if(k==='ArrowUp'||k==='ArrowDown')histNav(d);
  else if(k==='PageUp'||k==='PageDown')term.scrollTop+=d*.9*term.clientHeight;
  else return false;
  e.preventDefault();
  return true;
}
function interrupt(){ /* ^C: stop whatever is typing and go back to the prompt */
  var there=cursor.parentNode;
  if(there)there.insertBefore(document.createTextNode('^C'),cursor);
  if(READ&&TRAP){var t=READ;READ=null;bufNode=null;setBuf('');term.classList.remove('idle');t(INT);return}
  if(bufNode&&!READ){ /* at a prompt: give up on this line */
    if(MODE!=='shell')return;
    bufNode=null;setBuf('');term.classList.remove('idle');
    prompt();
    return;
  }
  GEN++;HOLD=false;SINK=null;STDIN=null;STATUS=130;
  wakers.slice().forEach(function(w){w()});
  if(held){var h=held;held=null;h()}
  if(READ){var r=READ;READ=null;bufNode=null;setBuf('');term.classList.remove('idle');r(null)}
}
function eof(){ /* ^D: end of input, or logout at an empty prompt */
  if(READ){
    var r=READ,left=buf;READ=null;bufNode=null;setBuf('');term.classList.remove('idle');
    r(left||null);
    return;
  }
  if(bufNode&&MODE==='shell'&&!buf){bufNode=null;term.classList.remove('idle');run('exit')}
}
function ctrlKey(e){
  var k=(e.key||'').toLowerCase();
  if(k==='c'){if(String(window.getSelection&&getSelection()))return false;interrupt()}
  else if(k==='d')eof();
  else if(k==='s')HOLD=true;
  else if(k==='q'){HOLD=false;if(held){var h=held;held=null;h()}}
  else if(k==='u')setBuf('');
  else return false;
  e.preventDefault();
  return true;
}
var NAMED=/^(Escape|Enter|Backspace|Tab|ArrowUp|ArrowDown|ArrowLeft|ArrowRight|PageUp|PageDown)$/;
document.addEventListener('keydown',function(e){
  if(KEYS){ /* a full-screen program has every key */
    if(e.metaKey||e.altKey||e.isComposing)return;
    var name=e.ctrlKey&&e.key.length===1?'C-'+e.key.toLowerCase():e.key;
    if(name.length===1||NAMED.test(name)||/^C-/.test(name)){e.preventDefault();KEYS(name)}
    return;
  }
  if(e.ctrlKey&&!e.metaKey&&!e.altKey&&ctrlKey(e))return;
  if(e.ctrlKey||e.metaKey||e.altKey)return;
  if(e.target===kb){if(!e.isComposing)navKey(e);return}
  if(e.key==='Enter'&&e.target.closest&&e.target.closest('a'))return; /* Enter on a focused link opens it */
  var k=e.key;
  if(navKey(e)){if(k==='PageUp'||k==='PageDown')return} /* paging keeps focus where it is, on a link say */
  else if(k==='Backspace'){e.preventDefault();setBuf(buf.slice(0,-1));click(.556)}
  else if(k&&k.length===1){e.preventDefault();setBuf(buf+k);click(.667)}
  else return;
  if(!coarse)kb.focus({preventScroll:true});
});

/* tap-to-type: focus on click (not pointerdown), refocus once if the OS bounces it */
var lastTap=0,bounced=false;
$('#stage').addEventListener('click',function(e){
  if(e.target.closest('a'))return;
  lastTap=Date.now();bounced=false;
  kb.focus({preventScroll:true});
});
kb.addEventListener('blur',function(){
  if(!bounced&&Date.now()-lastTap<700){bounced=true;setTimeout(function(){kb.focus({preventScroll:true})},0)}
});
kb.addEventListener('focus',function(){setTimeout(function(){window.scrollTo(0,0)},60)});

/* ---------- cable ---------- */
var NS='http://www.w3.org/2000/svg';
function path(d,stroke,w){
  var p=document.createElementNS(NS,'path');
  p.setAttribute('d',d);p.setAttribute('fill','none');p.setAttribute('stroke',stroke);
  p.setAttribute('stroke-width',w);p.setAttribute('stroke-linecap','round');p.setAttribute('stroke-linejoin','round');
  return p;
}
/* cord settings come from site/config.js */
var CORD=PROFILE.cord,rx=CORD.width/2,sw=CORD.thickness,edge=sw+1.4,gap=CORD.gap,tilt=.35,turns=Math.max(1,Math.round(CORD.turns));
var pitch=edge+gap;                        /* drop per turn = cord + rim + gap. gap 0 = turns touching */
var coilLen=2*tilt*rx+(turns+.5)*pitch;
var lastW,lastH,lastNub; /* what the cable was last drawn for */
function drawCable(){
  var nub=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nub'))||11; /* strain-relief bottom */
  /* cable height = nub + straight + coil + straight, so the two straights are always equal */
  var want=Math.round(nub+2*CORD.straight+coilLen); /* phone cable height; desktop fills the gap below the monitor */
  document.documentElement.style.setProperty('--cable',want+'px');
  var r=svg.getBoundingClientRect(),W=r.width,H=r.height;
  if(!W||!H){W=960;H=want} /* never bail: hidden/pre-layout still gets a cable */
  if(W===lastW&&H===lastH&&nub===lastNub)return; /* the drawing depends only on these */
  lastW=W;lastH=H;lastNub=nub;
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
  function pair(dd,rim,rimW,core){sway.appendChild(path(dd,rim,rimW));sway.appendChild(path(dd,core,sw))} /* rim, then the core over it */
  sway.textContent='';
  segs.forEach(function(sg){if(!sg.front)pair(d(sg.p),'#1a1d1b',sw+1,'#0e100f')});
  pair(cord,E,edge,C);
  segs.forEach(function(sg){if(sg.front)pair(d(sg.p),'#2b302c',edge,C)});
  pair(tail,E,edge,C);
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
drawCable();
window.addEventListener('load',redraw);
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
  if(!coarse)kb.focus({preventScroll:true});
  pause(900); /* tube warm-up */
  problems();
  banner();
  typeLine(ST.user,'',null,{pre:'login: ',hold:700,speed:2.2}); /* first visit: auto-login as guest */
  pause(450);
  welcome();
  prompt();
}
function banner(){ /* terminal self-test from the machine's == banner == section; replayed after exit */
  var R=PROFILE.raw.banner||[],B=PROFILE.sec.banner||[];
  R.forEach(function(raw,i){ /* LABEL | VALUE | pause-ms  prints a dotted self-test row */
    var f=raw.split('|').map(function(x){return x.trim()}),ms=0,line;
    if(f.length>=2){line=[row(UP(f[0]),UP(f[1])),''];ms=parseInt(f[2],10)||0}
    else line=lineOf(B[i]);
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
