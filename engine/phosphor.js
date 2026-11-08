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
      o+=/[(){}]/.test(n)?n:'\\'+n;
      continue;
    }
    o+=/[()+?|{}]/.test(c)?'\\'+c:c;
  }
  return o;
}

function list(v){return v.split(',').map(function(x){return x.trim().toLowerCase()}).filter(Boolean)} /* a, B ,c -> [a,b,c] */
function unquote(s){return s.replace(/^(['"])((?:(?!\1).)*)\1$/,'$2')} /* one quoted string only: "a" ; "b" keeps its quotes */
function setAlias(L,from,to,n){ /* a new alias replaces any with the same words. n: csh's count of the words it was given */
  var k=from.join(' ');
  L=L.filter(function(x){return x.from.join(' ')!==k});
  L.push(n===undefined?{from:from,to:to}:{from:from,to:to,n:n});
  return L;
}

var PH=window.Phosphor={
  version:'1.0.0',
  upstream:'https://github.com/GaijinSystems/phosphor', /* default for the source command */
  texts:[],defs:[],hooks:[],seen:{},catalog:{},allowed:[],machine:null,early:[],
  content:function(s){var f=me();PH.texts.push({src:String(s),site:!f||/(^|\/)site\//.test(f)})}, /* settings and == sections == */
  command:function(def){def.from=me();PH.defs.push(def)},  /* a built-in command, see engine/commands */
  setup:function(fn){me();PH.hooks.push(fn)},     /* machine hook: runs after the file tree exists */
  machines:function(m){me();Object.assign(PH.catalog,m)}, /* machines/machines.js: what can be plugged in */
  later:function(files,def){ /* a program that is listed from the start and only loads when first run; files relative to the machine */
    var d=Object.assign({},def);
    d.run=function(a,raw,w){PH.runLater(files,d,a,raw,w)};
    PH.command(d);
  },
  stubs:function(names,say,o){names.forEach(function(n){PH.command(Object.assign({names:[n],run:function(){say(n)}},o))})}, /* programs that are there and won't run */
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
  var byYear=function(a,b){return PH.catalog[a].year-PH.catalog[b].year}; /* oldest first, the catalog's order among equals */
  var all=Object.keys(PH.catalog).sort(byYear);
  if(!all.length)return null; /* an index.html that lists its machine's script tags itself */
  var known=function(x){
    if(has(PH.catalog,x))return true;
    PH.early.push('unknown machine "'+x+'": see machines/machines.js');
    return false;
  };
  var want=list(setting('machines')||'').filter(known);
  PH.allowed=want.length?want.sort(byYear):all;
  var def=(setting('machine')||'').toLowerCase(),asked=(new URLSearchParams(location.search).get('machine')||'').toLowerCase();
  if(def==='random')def=PH.allowed.indexOf(asked)>=0?'':randomMachine(); /* an address that names one wins, and leaves the pick alone */
  if(def&&PH.allowed.indexOf(def)<0){PH.early.push('machine: "'+def+'" is not one of the machines allowed');def=''}
  PH.machine=PH.allowed.indexOf(asked)>=0?asked:def||PH.allowed[0];
  function randomMachine(){ /* machine: random. One pick per browser tab, so a reload is a reboot of the same machine */
    var k='phosphor-9/machine',m=null,pool=PH.allowed.filter(function(x){return PH.catalog[x].random!==false}); /* random:false sits out the draw */
    if(!pool.length)pool=PH.allowed; /* unless nothing else is allowed */
    try{m=sessionStorage.getItem(k)}catch(e){}
    if(pool.indexOf(m)<0){m=pool[Math.floor(Math.random()*pool.length)];try{sessionStorage.setItem(k,m)}catch(e){}}
    return m;
  }
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
  var P={name:'OPERATOR',email:'',speed:1,upper:true,sound:true,protected:[],homes:'/usr',loginPrompt:'login: ',rootName:'root',rootPrompt:'# ',loginFailed:'Login incorrect',lsOwner:8,lsSize:8,mailNotice:'you have mail.',notFound:'%s: not found',
    cord:{turns:7,desktop:0,width:18,thickness:3.2,gap:1.8,straight:7.35,sway:2.5},
    title:'',badge:'PHOSPHOR-9',year:PH.machine&&PH.catalog[PH.machine].year||1979,installed:'',user:'guest',hostname:'',source:'',prompt:'$ ',
    offline:'the network is down.',off:[],machine:'',machines:'',effects:'auto',
    welcome:null,about:[],mail:[],commands:[],files:[],dirs:[],man:Object.create(null),aliases:[],sec:Object.create(null),raw:Object.create(null),problems:[]};
  var secs=[];
  function yes(v){return !/^(no|false|off|0)$/i.test(v)}
  var CL={turns:[1,40],desktop:[0,40],width:[6,80],thickness:[1,8],gap:[0,10],straight:[0,200],sway:[0,10]};
  function setKey(k,v){
    var ck=k.match(/^cord (\w+)$/);
    if(ck&&has(CL,ck[1])){var x=parseFloat(v),L=CL[ck[1]];if(!isNaN(x))P.cord[ck[1]]=Math.min(L[1],Math.max(L[0],x));return}
    if(k==='name'){if(v)P.name=v}
    else if(/^(email|title|badge|installed|offline|machine|machines)$/.test(k))P[k]=v;
    else if(k==='homes'){if(/^\/[\w\/-]*$/.test(v))P.homes=v.replace(/\/+$/,'')} /* where home folders live */
    else if(k==='speed'){var n=parseFloat(v);if(n>0)P.speed=n}
    else if(k==='sound')P.sound=yes(v);
    else if(k==='uppercase')P.upper=yes(v);
    else if(k==='persist')P.persist=yes(v);             /* no: the visitor's file changes go at a reload, as a reboot */
    else if(k==='teletype')P.teletype=yes(v);           /* a Teletype Model 33 instead of the glass, where the machine has one (V7) */
    else if(k==='effects'){var fx=v.toLowerCase();if(/^(auto|full|lite)$/.test(fx))P.effects=fx;else P.problems.push('effects: auto, full or lite')}
    else if(k==='protected')P.protected=P.protected.concat(v.split(',').map(function(x){return x.trim()}).filter(Boolean));
    else if(k==='not found')P.notFound=v;
    else if(k==='ls columns'){var lc=v.split(/\s+/);P.lsOwner=+lc[0]||8;P.lsSize=+lc[1]||8;P.lsTight=lc[2]==='tight'}
    else if(k==='mail notice')P.mailNotice=v;
    else if(k==='disk full')P.diskFull=v;                /* what a write says when the disk fills */
    else if(k==='home')P.home=v.replace(/\/+$/,'')||'/'; /* one fixed home instead of homes/user */
    else if(k==='login prompt')P.loginPrompt=v+' ';
    else if(k==='root login')P.rootName=v.toLowerCase();
    else if(k==='also root'){var ar=v.split('/');P.alsoRoot=ar[0].toLowerCase();P.alsoRootWord=ar[1]||''} /* name/password */
    else if(k==='root prompt')P.rootPrompt=v.replace(/^"(.*)"$/,'$1');
    else if(k==='login failed')P.loginFailed=v;
    else if(k==='closed door')P.closedDoor=yes(v);        /* only the accounts it knows may log in */
    else if(k==='shell'){P.dos=/^(dos|dcl)$/i.test(v);P.dcl=/^dcl$/i.test(v);P.bash=/^bash$/i.test(v)} /* dos, dcl: backslash paths; no quotes, $ or ;. bash: tab, !!, $( ) and --help */
    else if(k==='unix')P.noUnix=!yes(v);                  /* leave out the Unix tools: the machine brings its own */
    else if(k==='root password')P.rootPassword=v;
    else if(k==='backdoor')P.backdoor=v.toLowerCase();    /* a login name that needs no password, and is root */
    else if(k==='perror')P.perror=yes(v);                 /* name: reason, the way Berkeley's programs complain */
    else if(k==='csh')P.csh=yes(v);                       /* !! and history, finger, w */
    else if(k==='signals')P.signals=v.toLowerCase();       /* irix: IRIX's signal numbers, not 4.3BSD's */
    else if(k==='login')P.noLogin=!yes(v);                /* no login: it just boots */
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
  P.teletype=!!(P.teletype&&PH.machine&&PH.catalog[PH.machine]&&PH.catalog[PH.machine].teletype); /* only a machine that had one offers it: the rest ignore it */
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
  var ownBoot=null; /* this machine's own == boot: id == */
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
    else if((m=hd.match(/^boot\s*:\s*(.*)$/i))){ /* == boot: linux, bsd ==: on those machines only, over any plain == boot == */
      var ids=list(m[1].toLowerCase()),cat=Object.keys(PH.catalog);
      if(!ids.length)P.problems.push('boot: which machines? == boot: linux, bsd ==');
      ids.forEach(function(x){if(cat.length&&!has(PH.catalog,x))P.problems.push('boot: unknown machine "'+x+'"')});
      if(PH.machine&&ids.indexOf(PH.machine)>=0)ownBoot={body:body,raw:trimBlank(sc.lines).map(fill)};
    }
    else{var key=hd.toLowerCase();P.sec[key]=body;P.raw[key]=trimBlank(sc.lines).map(fill)} /* machine sections: banner, dmesg, ps ... */
  });
  if(ownBoot){P.sec.boot=ownBoot.body;P.raw.boot=ownBoot.raw}
  if(!P.welcome)P.welcome=[up('welcome to '+P.name.toLowerCase()+'.'),[up('type help and press return.'),'dim']];
  return P;
})();

function $(s){return document.querySelector(s)}
var term=$('#term'),out=$('#out'),glow=$('#glow'),kb=$('#kb'),svg=$('#cable'),sway=$('#sway');
var cursor=document.createElement('span');cursor.className='cursor';
var calm=matchMedia('(prefers-reduced-motion:reduce)');
/* effects: full, or lite (html.lite in engine/phosphor.css) for a browser that draws the page without a
   graphics chip. auto: lite when WebGL is a software one or missing, or when the warm-up draws slowly. */
var FX={mode:'auto',why:null}; /* why: what auto found ('' = nothing slow; null = not looked yet) */
function fxApply(){document.documentElement.classList.toggle('lite',FX.mode==='lite'||FX.mode==='auto'&&!!FX.why)}
function softGL(){ /* the software renderer's name, 'no WebGL', or '' for a graphics chip */
  try{
    var c=document.createElement('canvas'),g=c.getContext('webgl')||c.getContext('experimental-webgl'),x,r;
    if(!g)return 'no WebGL';
    r=String(g.getParameter(g.RENDERER)||'');
    if(/^webkit webgl$/i.test(r)&&(x=g.getExtension('WEBGL_debug_renderer_info')))r=String(g.getParameter(x.UNMASKED_RENDERER_WEBGL)||r);
    if((x=g.getExtension('WEBGL_lose_context')))x.loseContext();
    r=r.match(/swiftshader|llvmpipe|softpipe|software|basic render/i);
    return r?'software, '+r[0]:'';
  }catch(e){return ''}
}
function fxDetect(){ /* once, for auto: the renderer, then 700 ms of frames, under 25 a second is slow */
  if(FX.mode!=='auto'||FX.why!==null)return;
  FX.why=softGL();
  if(FX.why){fxApply();return}
  var D=[],last=0,end=0,away=false,gone=function(){away=true};
  document.addEventListener('visibilitychange',gone);
  requestAnimationFrame(function f(t){ /* a hidden tab draws nothing: it starts when it shows */
    if(!end)end=t+700;else D.push(t-last);
    last=t;
    if(t<end&&!away){requestAnimationFrame(f);return}
    document.removeEventListener('visibilitychange',gone);
    D=D.slice(2).sort(function(a,b){return a-b});
    var med=D.length?D[D.length>>1]:1e3; /* not even three frames */
    if(!away&&med>40&&!FX.why){FX.why='slow drawing, '+Math.round(1000/med)+' frames a second';fxApply()}
  });
}
/* what screen readers hear: each line once it is finished, not every character of the typing */
var log=document.createElement('div');log.id='log';log.setAttribute('role','log');log.setAttribute('aria-live','polite');
document.body.appendChild(log);
function announce(s){
  if(!s.trim())return;
  var p=document.createElement('div');p.textContent=s;log.appendChild(p);
  trim(log,50);
}
var coarse=matchMedia('(pointer:coarse)').matches;
var chain=Promise.resolve(),buf='',bufNode=null,hist=[],hi=0,HMAX=50; /* what was typed, for !n and the arrows: the last HMAX lines */
if(PROFILE.title)document.title=PROFILE.title;
var badge=$('.badge');if(badge)badge.textContent=PROFILE.badge;

/* Output runs through one queue, in order. A step's own queue() calls run inside that step, before
   the next step, so a stage of a pipeline finishes all its output before the next stage starts.
   Ctrl-C bumps GEN: steps queued before it are skipped, unless they must always run (prompts). */
var GEN=0,inner=null,wakers=[],ASIDE=null,FGP=null; /* ASIDE: the aside() a step belongs to, or null for the one queue. FGP: the foreground pipeline ^Z can stop (fgProc) */
function owner(){return ASIDE&&ASIDE.job||inner&&inner.proc} /* the job a step is part of, or the foreground pipeline ^Z can stop */
function jobOf(x){return x&&(x.resume?x:x.job)} /* a job, or a foreground pipeline's job */
function wakeList(){var o=owner();return o?o.wakers:wakers} /* a background job's waits are its own: ^C does not end them */
function sleep(ms){var own=owner()||null;if(ms>0&&pipeWait())return Promise.resolve();return new Promise(function(r){ /* a write that met SIGPIPE: the process is gone, and so is its sleep */
  var W=wakeList(),done=function(){
    clearTimeout(t);var i=W.indexOf(done);if(i>=0)W.splice(i,1);
    var j=jobOf(own); /* its job, stopped: the time runs on, and the sleep ends once it goes on (nanosleep's restart) */
    if(j&&j.state==='Stopped'&&!j.dead)stopWait(j).then(function(){r()});else r();
  },t=setTimeout(done,ms);
  W.push(done);
})}
var TTY={}; /* thrown by what wants the terminal (a read, the full screen) in a background job: the job stops there */
function queue(fn,always){
  var g=GEN,side=ASIDE,pr=inner&&inner.proc||null,oops=function(e){console.error(e)},step=function(){
    var job=side&&side.job||pr&&pr.job||null,sd=side||job&&job.side||null; /* pr: the foreground pipeline it is part of, which a ^Z makes a job (fgProc) */
    if(job?job.dead&&always!==2:g!==GEN&&!always||side&&side.stopped&&!always)return; /* a job goes on after ^C, until it is killed; then none of its steps run but a redirection's write */
    if(job&&job.state==='Stopped')return stopWait(job).then(step); /* kill -STOP: its next step waits for fg, bg or kill -CONT */
    var sc={p:null,proc:pr,race:null};
    function once(){ /* a job's step runs with the job's own directory, variables, output and status; once it stops for the terminal, again when it is resumed */
      var saved=inner,was=ASIDE,fg=null,ret;
      inner=sc;ASIDE=sd;
      if(job){fg=procGet();procPut(job.ctx)}
      try{ret=fn()}
      catch(e){if(e!==TTY||!job)throw e;ret=Promise.reject(e)}
      finally{inner=saved;ASIDE=was;if(fg){job.ctx=procGet();procPut(fg)}}
      return job?Promise.resolve(ret).catch(function(e){if(e!==TTY)throw e;return ttyStop(job).then(function(go){if(go)return once()})}):ret;
    }
    return Promise.resolve(once()).then(function(){return sc.race?Promise.race([sc.p,sc.race]):sc.p}); /* race: a ^Z lets the shell go on */
  };
  if(inner){inner.p=(inner.p||Promise.resolve()).then(step).catch(oops);return inner.p}
  if(side){side.p=side.p.then(step).catch(oops);return side.p}
  chain=chain.then(step).catch(oops);return chain;
}
/* A queue of its own beside the one queue, for a machine whose program goes on while the terminal reads (VM/370's
   EXEC after an attention): what it types goes in above the line being typed in, which stays as it is; with no read
   up it types as usual. ^C stops it as it stops everything; stop() stops it, the line it is typing finishes;
   end() is a promise of when it is done; live() says it has not stopped or finished */
function aside(fn,job){ /* job: a background job's own queue (see startJob) */
  var h={p:Promise.resolve(),stopped:false,gen:GEN,over:false,job:job||null,
    stop:function(){h.stopped=true;return h.p},end:function(){return h.p},
    live:function(){return !h.stopped&&!h.over&&h.gen===GEN}};
  var was=ASIDE,saved=inner;ASIDE=h;inner=null;
  try{queue(fn)}finally{ASIDE=was;inner=saved}
  h.p.then(function(){h.over=true});
  return h;
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

/* ---------- the Teletype Model 33 ("teletype: yes", where the machine had one: V7) ----------
   Paper at ten characters a second, capitals only, through V7's tty driver as getty set it for the
   console teletype: LCASE, CRMOD, XTABS and cr1 (stty tty33). The site offers it, the visitor's teletype command turns it on. */
var TELE={ok:!!PROFILE.teletype,on:false,lcase:true,speed:110,free:0}; /* ok: offered here; on: in use (the visitor's choice, remembered) */ /* lcase: getty sets it for a name typed in capitals, as the ASR-33 types it; free: when the printer is done echoing */
var TT_CH=100,TT_CR=5000/60; /* 110 baud with two stop bits: eleven bits, a tenth of a second a character; cr1: five clock ticks after a carriage return */
function ttPrint(t){ /* what the driver sends and the type box prints: with LCASE { } | ~ ` go out as \( \) \! \^ \' and small letters as capitals;
                        the type box has 64 characters, so any other code from the lower-case columns prints as its capital-column twin */
  t=String(t);var o='',c,k,j;
  for(var i=0;i<t.length;i++){
    c=t.charAt(i);
    if(c==='\u0005'){o+=c+t.charAt(++i);continue} /* a colour code and its digit */
    if(TELE.lcase&&(j='{}|~`'.indexOf(c))>=0){o+='\\'+'()!^\''.charAt(j);continue}
    k=c.charCodeAt(0);o+=k>=96&&k<127?String.fromCharCode(k-32):c;
  }
  return o;
}
function ttEcho(b){ /* the line being typed, as it was echoed: an @ that kills it is followed by a new line */
  var o='';
  for(var i=0;i<b.length;i++){o+=b.charAt(i);if(b.charAt(i)==='@'&&b.charAt(i-1)!=='\\')o+='\n'}
  return ttPrint(o);
}
function ttKey(c){ /* a key as the ASR-33 sends it (capitals only, and no ` { | } ~ keys), then as V7 takes it in: LCASE makes capitals small */
  if(c.length!==1||c.charCodeAt(0)>126||/[`{|}~]/.test(c))return '';
  c=c.toUpperCase();
  return TELE.lcase?c.toLowerCase():c;
}
function ttKeys(s){return s.split('').map(ttKey).join('')}
var TT_MAP={'!':'|',"'":'`','(':'{',')':'}','^':'~','#':'#','@':'@'};
function ttCanon(s){ /* V7's canon(): # erases a character, @ the line, \ before either keeps it; with LCASE, \x is X and \( \) \! \^ \' are { } | ~ ` */
  var b=[],c,mc;
  for(var i=0;i<s.length;i++){
    c=s.charAt(i);
    if(b[b.length-1]!=='\\'){
      if(c==='#'){b.pop();continue}
      if(c==='@'){b=[];continue}
    }else{
      mc=TT_MAP[c]||(/[a-z]/.test(c)?c.toUpperCase():'');
      if(mc&&(mc===c||TELE.lcase)){if(b[b.length-2]!=='\\')c=mc;b.pop()}
    }
    b.push(c);
  }
  return b.join('');
}
/* its sounds, made here (no recordings), only once sound is on and the visitor has touched a key: autoplay rules */
function ttNoise(c,t,freq,q,vol,len,rate){
  var s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();
  s.buffer=SND.noise;s.playbackRate.value=rate||1;f.type='bandpass';f.frequency.setValueAtTime(freq,t);f.Q.value=q;
  g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+len);
  s.connect(f);f.connect(g);g.connect(c.destination);s.start(t);s.stop(t+len+.02);
  return f;
}
function ttThump(c,t,f0,f1,vol,len){
  var o=c.createOscillator(),g=c.createGain();
  o.type='triangle';o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+len);
  g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+len);
  o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+len+.02);
}
function ttStrike(ch,at){ /* the type box lifting and the hammer: a hard clack; a space only steps the carriage */
  var c=SND.ctx;if(!SND.clicks||!c)return;
  var t=at||c.currentTime,sp=ch===' ';
  ttNoise(c,t,sp?700:1500+Math.random()*900,sp?1.2:2.2,sp?.12:.45,sp?.03:.045);
  ttThump(c,t,sp?110:170,60,sp?.06:.16,.05);
}
function ttStrikes(s){ /* a prompt, which comes up at once: its characters still sound at ten a second */
  var c=SND.ctx;if(!SND.clicks||!c)return;
  for(var i=0;i<s.length;i++)ttStrike(s.charAt(i),c.currentTime+i*TT_CH/1000);
}
function ttReturn(){ /* the carriage sliding back, then landing at the margin */
  var c=SND.ctx;if(!SND.clicks||!c)return;
  var t=c.currentTime,f=ttNoise(c,t,1100,1.5,.16,.17,.18);
  f.frequency.exponentialRampToValueAtTime(320,t+.16);
  ttThump(c,t+.16,95,38,.45,.14);
  ttNoise(c,t+.16,500,1,.3,.06);
}
function ttBell(){ /* the bell behind the platen: a struck bell's few partials, dying away */
  var c=SND.ctx;if(!SND.clicks||!c)return;
  var t=c.currentTime;
  [[1,.22,1.4],[2.76,.09,.7],[5.4,.05,.35]].forEach(function(p){
    var o=c.createOscillator(),g=c.createGain();
    o.type='sine';o.frequency.value=1250*p[0];
    g.gain.setValueAtTime(p[1],t);g.gain.exponentialRampToValueAtTime(.0001,t+p[2]);
    o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+p[2]+.02);
  });
}

/* ---------- afterglow ---------- */
var lastG=0;
function afterglow(top,a,ms,force){
  if(calm.matches||!force&&document.documentElement.classList.contains('lite'))return; /* lite: only the fade at clear (scrolling ones cost a lot) */
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
function UP(t){return TELE.on?ttPrint(t):PROFILE.up(t)}
var SINK=null,STDIN=null,STATUS=0,HOLD=false,held=null,BAUD=0; /* where output goes; what a command reads; $?; ^S; stty */
var ERRSINK=null,GLASS={},PREV=0; /* where error lines go (null or GLASS: the glass); PREV: $? as it was when this command started */
function plain(s){return String(s).replace(/\u0003([^\u0004]*)(\u0004|$)/g,'$1').replace(/\u0005[\s\S]?/g,'').replace(/[\u0001-\u0004]/g,'')}
function typeLine(text,cls,cb,opt){
  opt=opt||{};
  return queue(function(){return new Promise(function(res0){
    var gen=GEN,burst=1,side=ASIDE,job=ASIDE&&ASIDE.job,res=res0,own=inner&&inner.proc; /* side: whose line this is, even when its turn comes later; own: the foreground pipeline's */
    text=typeof text==='function'?text():text; /* a function = text worked out when its turn comes (ping) */
    if(cls==='err')STATUS=1;
    var to=cls!=='err'?SINK:ERRSINK!==GLASS?ERRSINK:null; /* a pipe or a file; errors still go to the glass, unless 2>file or 2>&1 */
    if(to){
      if(to.pipe&&to.pipe.gone){if(!to.broke)pipeBroke(to);if(cb)cb();res();return} /* its reader has gone: this write gets SIGPIPE */
      var l=' '.repeat(opt.indent||0)+(opt.pre||'')+plain(text);
      if(to.open&&to.length)to[to.length-1]+=l;else to.push(l); /* after a line left open (echo -n): this goes on in it */
      to.open=!!opt.open;to.w=(to.w||0)+1; /* w: the writes made to it */
      if(cb)cb();res();return;
    }
    if(glassBusy(job)){GL.wait.push({job:job,go:go});return}go(); /* one line at a time on the glass between a background job and the rest */
    function gone(){return job?job.dead:own&&own.job?own.job.dead:gen!==GEN} /* killed, or ^C */
    function go(){
    GL.n++;if(job)GL.bg++;
    res=function(){GL.n--;if(job)GL.bg--;glassNext();res0()};
    if(gone()){res();return}
    text=UP(text);
    var above=side&&bufNode?bufNode.parentNode:null,more=!above&&OPEN&&OPEN===out.lastElementChild?OPEN:null; /* an aside's line goes in above the one being typed in; more: the line left open, which this goes on in */
    var d=more||document.createElement('div'),host=d;OPEN=null;if(more&&JOIN===more)JOIN=null;
    if(!more)d.className='line'+(cls?' '+cls:'')+(opt.row?' row':'');
    /* indent: left margin for the whole line; hang: extra margin for wrapped continuation lines only */
    if(opt.indent||opt.hang){d.style.paddingLeft=((opt.indent||0)+(opt.hang||0))+'ch';if(opt.hang)d.style.textIndent=(-opt.hang)+'ch'}
    if(opt.href){host=document.createElement('a');host.href=opt.href;
      if(!/^mailto:/i.test(opt.href)){host.target='_blank';host.rel='noopener'}d.appendChild(host)}
    var pre=opt.pre?UP(opt.pre):'',t=document.createTextNode(pre);host.appendChild(t);
    if(more)d.appendChild(cursor);else     if(above&&!above.cut)out.insertBefore(d,above);else if(above)out.appendChild(d);else{d.appendChild(cursor);out.appendChild(d)} /* below a read that goes on in a line cut short: the carriage stayed there */
    trim(out,240);
    var at=host===d&&!above?cursor:null; /* new text goes before the cursor; a link has no cursor inside it, nor a line typed above */
    var sp=opt.speed||1,i=0,crlf=false;
    function here(){return at&&at.parentNode===host?at:null} /* a prompt that came up meanwhile has the cursor now */
    function step(){
      if(gone()){res();return}
      if(HOLD){held=step;return}
      if(i>=text.length){
        if(TELE.on&&!opt.open&&!crlf){crlf=true;ttReturn();setTimeout(step,2*TT_CH+TT_CR);return} /* the newline goes out as CR LF, and cr1 waits for the carriage */
        scrollBottom();
        announce(pre+plain(text.replace(/\u0003[^\u0004]*(\u0004|$)/g,' ')));
        if(opt.open&&!above&&d===out.lastElementChild)OPEN=JOIN=d; /* echo -n: what comes next, and the prompt, go on in this line */
        if(cb)cb();res();return;
      }
      var ch=text.charAt(i++);
      if(ch==='\u0003'){ /* a squeezable gap (mail rows, self-test dots): shrinks to fit narrow glass */
        var j=text.indexOf('\u0004',i);if(j<0)j=text.length;
        var g=document.createElement('span');g.className='gap';
        g.dataset.n=j-i;g.dataset.f=text.charAt(i)||' ';g.dataset.w=text.replace(/[\u0001-\u0004]/g,'').length;
        host.insertBefore(g,here());squeeze(g);
        t=document.createTextNode('');host.insertBefore(t,here());
        i=j+1;step();return;
      }
      if(ch==='\u0005'){ /* \u0005 and a hex digit: what follows is in that colour (.k0 to .kf, which a machine's CSS gives); with anything else, plain again */
        var k=text.charAt(i++).toLowerCase();t=document.createTextNode('');
        if(/^[0-9a-f]$/.test(k)){var ks=document.createElement('span');ks.className='k'+k;ks.appendChild(t);host.insertBefore(ks,here())}
        else host.insertBefore(t,here());
        step();return;
      }
      if(ch==='\u0001'||ch==='\u0002'){ /* ~~struck~~ text: start or end an <s> run */
        t=document.createTextNode('');
        if(ch==='\u0001'){var s=document.createElement('s');s.appendChild(t);host.insertBefore(s,here())}
        else host.insertBefore(t,here());
        step();return;
      }
      if(TELE.on&&ch==='\u0007'){ttBell();setTimeout(step,TT_CH);return} /* BEL rings the teletype's bell */
      t.data+=ch;
      if(BAUD&&burst>1){burst--;step();return} /* a real line speed: no need to scroll for what nobody will see */
      scrollBottom();
      if(TELE.on)ttStrike(ch);else if(ch!==' ')click(.194);
      if(own&&own.job){step();return}
      if(TELE.on){setTimeout(step,TT_CH);return} /* ten characters a second, whatever stty says the line runs at */ /* ^Z came in the middle of it: what was already sent comes out */
      if(BAUD){ /* ten bits a character, drawn a few at a time */
        burst=Math.max(1,Math.round(BAUD/500));
        setTimeout(step,burst*10000/BAUD);
        return;
      }
      setTimeout(step,(ch===' '?.35:1)*(14+Math.random()*38)*sp/PROFILE.speed);
    }
    var w=(opt.hold||0)+(TELE.on?Math.max(0,TELE.free-Date.now()):0); /* the teletype first finishes echoing what was typed */
    if(w)setTimeout(step,w);else step();
    }
  })});
}
var GL={n:0,bg:0,wait:[]}; /* lines typing on the glass now, how many of them a background job's, and those waiting their turn */
function glassBusy(job){return job?GL.n:GL.bg} /* a job's line waits for any line, the rest only for a job's */
function glassNext(){while(GL.wait.length&&!glassBusy(GL.wait[0].job))GL.wait.shift().go()}
function say(lines){ /* lines.open: the last one has no newline after it (a file or a pipe that ended without one), so it is left open */
  lines.forEach(function(l,i){var x=lineOf(l);typeLine(x[0],x[1],null,lines.open&&i===lines.length-1?Object.assign({},x[2],{open:true}):x[2])});
}
function charBox(host){ /* the size of ten characters in this element */
  var p=document.createElement('span');p.textContent='0000000000';
  p.style.cssText='position:absolute;visibility:hidden;white-space:pre';
  host.appendChild(p);var r=p.getBoundingClientRect();p.remove();
  return r;
}
function cols(){ /* how many characters fit on one line of the glass right now */
  var cw=charBox(out).width/10;
  var cs=getComputedStyle(out),w=out.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight);
  return cw>0?Math.floor(w/cw+.01):999;
}
function inColumns(names){ /* as many columns as fit on the glass, reading down, two spaces apart */
  var w=names.reduce(function(m,x){return Math.max(m,x.length)},0)+2,c=Math.max(1,Math.floor(cols()/w)),rows=Math.ceil(names.length/c),R=[];
  for(var r=0;r<rows;r++){
    var l='';
    for(var k=r;k<names.length;k+=rows)l+=k+rows<names.length?names[k].padEnd(w):names[k];
    R.push(l);
  }
  return R;
}
function squeeze(g,c){ /* shrink a gap (never below 2 characters) until its row fits */
  var over=Math.max(0,+g.dataset.w-(c||cols())),n=Math.max(2,+g.dataset.n-over);
  if(g.textContent.length!==n)g.textContent=(g.dataset.f||' ').repeat(n);
}
function refit(){ /* rows already printed re-fit on rotate/resize; not while a full-screen program hides them */
  var gs=out.querySelectorAll('.gap');if(!gs.length||out.style.display==='none')return;
  var c=cols();for(var i=0;i<gs.length;i++)squeeze(gs[i],c);
}
window.addEventListener('resize',refit);
var MODE='shell',JOIN=null,OPEN=null; /* shell | login | password (password input is not echoed). JOIN: the line the next prompt goes on in (interrupt); OPEN: a line of output left open (echo -n), which the next output goes on in */
function showPrompt(p,mode){
  MODE=mode||'shell';OPEN=null; /* what comes after the prompt and what is typed starts a line of its own */
  if(p)announce(UP(p)); /* login: and Password: ask for something; the shell prompt is just noise */
  var d=JOIN&&JOIN===out.lastElementChild?JOIN:document.createElement('div');d.className='line';d.cut=d===JOIN&&!!d.attnCut;JOIN=null; /* after the text cut short, when nothing came between; cut: by an attention (ATTN OFF), not an echo -n */
  if(MODE!=='read')HIDE=false;
  bufNode=document.createTextNode(MODE==='password'||HIDE?'':TELE.on?ttEcho(buf):UP(buf));
  d.appendChild(document.createTextNode(UP(p==null?(RP?PROFILE.rootPrompt:promptFn?promptFn():PROFILE.prompt):p)));d.appendChild(bufNode);d.appendChild(cursor);
  if(TELE.on)ttStrikes(bufNode.previousSibling.data);
  out.appendChild(d);trim(out,240);term.classList.add('idle');scrollBottom();
}
var promptFn=null; /* a machine whose prompt changes as you go */
function prompt(p,mode){queue(function(){shellPrompt(p,mode)},true)}
function oops(who,x,n,old){ /* a file that would not open: the old wording, or Berkeley's where the machine asks for it */
  typeLine(!PROFILE.perror?old:(who?who+': ':'')+x+': '+(!n?'No such file or directory':n.prot?'Permission denied':n.type==='d'?'Is a directory':'Not a directory'),'err');
}
function oopsW(who,x,old){ /* the same for a file that could not be made: no such folder, or not allowed there */
  var up=String(x).replace(/\/+[^\/]*$/,'')||'/';
  if(PROFILE.dos&&!PROFILE.dcl&&!who){typeLine('File creation error','err');return} /* COMMAND.COM's redirection: no room, or a read-only file there */
  typeLine(!PROFILE.perror?old:(who?who+': ':'')+x+': '+(x.indexOf('/')<0||find(up)?'Permission denied':'No such file or directory'),'err');
}
function readKey(p,trap){ /* one keypress, no return needed. Call it from inside a queued step.
                            ^C stops the command, unless trap: then the program gets it as C-c */
  ttyWant('key'); /* a key from /dev/null: none ever comes */
  pipeWait();
  return new Promise(function(res){
    var h=hold(),got=function(k){
      if(k.length!==1&&k!=='Enter'&&k!=='C-c')return;
      KEYS=null;letGo(h);
      if(k==='C-c'&&!trap){leavePrompt();interrupt();res(k);return}
      if(k.length===1)atCursor(TELE.on?ttPrint(k):k);
      leavePrompt();
      res(k);
    };
    h.show=function(){showPrompt(p==null?'':p,'read');KEYS=got};
    h.hide=h.kill=function(){if(KEYS===got){KEYS=null;leavePrompt()}};
    h.show();
  });
}
/* What has the terminal now, a read or a full screen: ^Z puts it aside with its job (hide) and fg gives it back (show); a kill ends it */
var TTYH=null;
function hold(){var h={owner:owner()||FGJOB||FGP};TTYH=h;return h} /* whose it is: the step's job or foreground pipeline, else (in a promise after a step, as input's reads are) the foreground job's */
function letGo(h){if(TTYH===h)TTYH=null} /* done with the terminal */
function owns(job,h){return !!h&&!!h.owner&&jobOf(h.owner)===job}
var HIDE=false,READ=null,TRAP=false,INT='\u0003'; /* a program is waiting for a line from the keyboard */
function readLine(p,trap,hidden){ /* one line from the keyboard, or null at ^D or ^C. Call it from inside a queued step.
                              trap: the program deals with ^C itself, and gets INT */
  if(ttyWant('input')||pipeWait())return Promise.resolve(null); /* a background job's /dev/null; a writer waiting here lets its reader read */
  return new Promise(function(res){
    var h=hold(),got=function(v){letGo(h);res(v)};
    h.show=function(){READ=got;TRAP=!!trap;HIDE=!!hidden;showPrompt(p==null?'':p,'read')};
    h.hide=h.kill=function(){if(READ===got){READ=null;leavePrompt()}};
    h.show();
  });
}
function ask(p,then,trap,hidden){ /* readLine, then carry on with what was typed */
  var l;
  queue(function(){return readLine(p,trap,hidden).then(function(x){l=x})});
  queue(function(){return then(l)});
}
/* The glass as a screen: a program draws whole lines, and every key comes to it. Used by vi. */
var KEYS=null;
function fullscreen(keys,onResize,redraw){ /* redraw: draws it again as it is (the view dragged aside); onResize if not given */
  ttyWant('output');
  var el=document.createElement('div');el.id='full';
  out.style.display='none';term.classList.remove('idle');term.appendChild(el);
  var edge=['l','r'].map(function(x){ /* faint marks at a side where the view cuts content off */
    var d=document.createElement('div');d.className='edge '+x;d.hidden=true;d.setAttribute('aria-hidden','true');
    d.textContent=x==='l'?'\u2039':'\u203a';term.parentNode.appendChild(d);return d;
  });
  /* content wider than the glass: a sideways drag pans the view, and the next key or a resize goes back to following the cursor */
  var U=-1,cw=8,view={at:0,max:0},next=null,drag=null,glide=0;
  var mine=function(k){if(U>=0){follow();again()}keys(k)},h=hold(),shut=false;KEYS=mine;
  h.hide=function(){h.off=true;if(KEYS===mine)KEYS=null;el.remove();edge.forEach(function(d){d.hidden=true});out.style.display='';term.scrollTop=term.scrollHeight}; /* off the glass, kept as it is */
  h.show=function(){h.off=false;term.appendChild(el);out.style.display='none';term.classList.remove('idle');KEYS=mine;size();again()};
  h.kill=function(){S.close()};h.out=true;
  redraw=redraw||onResize;
  var said='',T=[],S={
    rows:24,cols:80,
    pan:function(want,max,cx){ /* the first column shown of content wider than the glass: want (where the program follows the cursor)
      unless the visitor has dragged the view aside. max: the furthest it goes; cx: the cursor's column in the content, -1 if not in it */
      max=Math.max(0,max);
      var at=U<0?want:Math.min(max,Math.round(U));
      next={at:at,max:max,off:U>=0&&cx>=0&&(cx<at||cx>=at+S.cols)};
      return at;
    },
    draw:function(lines,r,c){
      var i;
      view=next||{at:0,max:0};next=null;
      if(view.off)r=-1; /* the cursor is out of the dragged view */
      edge[0].hidden=!(view.at>0);edge[1].hidden=!(view.at<view.max);
      el.style.touchAction=view.max>0?'pan-y pinch-zoom':''; /* a sideways drag is the engine's only when there is a view to pan */
      for(i=0;i<lines.length;i++){
        var was=el.children[i];
        if(was&&i!==r&&sameRow(was,lines[i]))continue;
        var d=document.createElement('div');d.className='line';
        if(i===r){
          var t=lines[i].padEnd(c),cu=document.createElement('span');cu.className='fcur';
          d.appendChild(document.createTextNode(t.slice(0,c)));
          cu.textContent=t.charAt(c)||' ';
          d.appendChild(cu);
          d.appendChild(document.createTextNode(t.slice(c+1)));
        }
        else d.textContent=lines[i];
        if(was)el.replaceChild(d,was);else el.appendChild(d);
      }
      while(el.children.length>lines.length)el.lastChild.remove();
    },
    grid:function(){ /* a blank screen, to write characters into */
      var C=[];
      for(var i=0;i<S.rows;i++)C.push(new Array(S.cols).fill(' '));
      return C;
    },
    drawGrid:function(C,r,c){S.draw(C.map(function(row){return row.join('').trimEnd()}),r,c)},
    say:function(m){if(m!==said){said=m;announce(m)}},
    fit:function(cols,rows,o){ /* smaller type for the whole cols x rows where it stays readable (o.min, 9px); o.clamp shrinks to o.min regardless */
      o=o||{};var min=o.min||9;
      el.style.fontSize='';measure();
      var b=parseFloat(getComputedStyle(el).fontSize),f=Math.min(b*S.cols/cols,b*S.rows/rows)*.995;
      if(f<b&&(o.clamp||f>=min)){el.style.fontSize=Math.max(f,min)+'px';measure()}
    },
    after:function(ms,fn){ /* a program's own timers: a throw in one ends the program as any throw does, and close stops them all */
      var t={};t.id=setTimeout(function(){T.splice(T.indexOf(t),1);guard(fn)},ms);T.push(t);return t;
    },
    every:function(ms,fn){var t={every:1};t.id=setInterval(function(){guard(fn)},ms);T.push(t);return t},
    cancel:function(t){
      var i=T.indexOf(t);if(i<0)return;
      T.splice(i,1);if(t.every)clearInterval(t.id);else clearTimeout(t.id);
    },
    onThrow:null,
    close:function(){
      if(shut)return;shut=true;letGo(h);
      while(T.length)S.cancel(T[0]);
      if(KEYS===mine)KEYS=null;follow();window.removeEventListener('resize',size);
      if(window.visualViewport)visualViewport.removeEventListener('resize',size);
      el.remove();edge.forEach(function(d){d.remove()});if(!h.off)out.style.display='';refit();
      term.scrollTop=term.scrollHeight;
    }
  };
  function guard(fn){try{fn()}catch(e){if(S.onThrow)S.onThrow(e);else throw e}}
  function sameRow(d,t){ /* against the row itself: a program may have marked it up since */
    var k=d.firstChild;
    return k?d.childNodes.length===1&&k.nodeType===3&&k.data===t:!t;
  }
  function measure(){
    var r=charBox(el),cs=getComputedStyle(el);
    var lh=parseFloat(cs.lineHeight)||r.height||16;
    cw=r.width/10;
    var w=el.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight);
    var h=term.clientHeight-parseFloat(cs.paddingTop)-parseFloat(cs.paddingBottom);
    S.cols=Math.max(20,cw>0?Math.floor(w/cw+.01):80);
    S.rows=Math.max(5,Math.floor(h/lh+.01));
  }
  function size(){follow();measure();if(onResize&&KEYS)onResize()}
  function again(){if(KEYS&&redraw)redraw()}
  function follow(){U=-1;drag=null;cancelAnimationFrame(glide)}
  function to(u){ /* the view dragged to column u */
    U=Math.max(0,Math.min(view.max,u));
    if(Math.round(U)!==view.at)again();
    return U>0&&U<view.max;
  }
  el.addEventListener('touchstart',function(e){
    cancelAnimationFrame(glide);drag=null;
    if(view.max<=0||e.touches.length!==1)return;
    var t=e.touches[0];drag={x:t.clientX,y:t.clientY,on:false,px:t.clientX,t:e.timeStamp,v:0};
  },{passive:true});
  el.addEventListener('touchmove',function(e){
    if(!drag)return;
    var t=e.touches[0],dx=t.clientX-drag.x,dy=t.clientY-drag.y;
    if(!drag.on){ /* sideways, or it is the glass's own vertical scroll */
      if(Math.abs(dy)>=Math.abs(dx)){if(Math.abs(dy)>8)drag=null;return}
      if(Math.abs(dx)<8)return;
      drag.on=true;drag.x=t.clientX;drag.from=view.at;
    }
    if(e.cancelable)e.preventDefault();
    to(drag.from-(t.clientX-drag.x)/cw);
    var dt=e.timeStamp-drag.t;
    if(dt>0)drag.v=.7*(drag.px-t.clientX)/cw/dt+.3*drag.v; /* columns a millisecond */
    drag.px=t.clientX;drag.t=e.timeStamp;
  },{passive:false});
  function drop(e){
    var d=drag;drag=null;
    if(!d||!d.on)return;
    if(e.cancelable)e.preventDefault(); /* a drag is not a tap: no keyboard */
    if(e.timeStamp-d.t>80||calm.matches||document.documentElement.classList.contains('lite'))return; /* held still, or no motion wanted */
    var v=d.v,last=performance.now();
    glide=requestAnimationFrame(function step(now){ /* a little momentum */
      var dt=Math.max(0,Math.min(50,now-last));last=now;
      if(to(U+v*dt)&&Math.abs(v*=Math.pow(.99,dt))>.003)glide=requestAnimationFrame(step);
    });
  }
  el.addEventListener('touchend',drop);el.addEventListener('touchcancel',drop);
  measure();
  window.addEventListener('resize',size);
  if(window.visualViewport)visualViewport.addEventListener('resize',size); /* a phone keyboard opening or changing height */
  return S;
}
function program(make,o){ /* a full-screen program: make(S,done) returns its {feed,draw}, and resize if that differs from draw.
   o.tty: its name, and it refuses a pipe; o.fit: [cols,rows] it is fitted to before make and at each resize (o.min, o.clamp as S.fit) */
  o=o||{};
  if(o.tty&&SINK){typeLine(o.tty+': needs a terminal','err');return}
  var who=CURRENT,crashed=false;
  queue(function(){
    return new Promise(function(res){
      var V,S;
      function crash(e){if(crashed)return;console.error(e);crashed=true;S.close();res()} /* never leave a dead screen up */
      function fit(){if(o.fit)S.fit(o.fit[0],o.fit[1],o)}
      S=fullscreen(function(k){try{V.feed(k)}catch(e){crash(e)}},function(){try{fit();if(V.resize)V.resize();else V.draw()}catch(e){crash(e)}},function(){try{V.draw()}catch(e){crash(e)}});
      S.onThrow=crash;
      fit();
      try{V=make(S,res)}catch(e){crash(e)}
    });
  });
  queue(function(){if(crashed)typeLine(who+': core dumped','err')});
}
function gnuOops(x,n){ /* GNU's wording: head and tail open, then read; sort says which it could not do; the rest name the file */
  var c=CURRENT,why=!n?'No such file or directory':n.prot?'Permission denied':'Is a directory',dir=!!n&&!n.prot;
  typeLine(/^(head|tail)$/.test(c)?c+(dir?": error reading '"+x+"': ":": cannot open '"+x+"' for reading: ")+why:c==='sort'?'sort: '+(dir?'read failed: ':'cannot read: ')+x+': '+why:c+': '+x+': '+why,'err');
}
function input(names,done){ /* the lines a command works on: named files, else its pipe or <, else the keyboard */
  if(names.length){
    var L=[];
    names.forEach(function(x){
      var n=find(x);
      if(!n||n.type==='d'||n.prot)PROFILE.bash?gnuOops(x,n):oops('',x,n,CURRENT+": can't open "+x);
      else{var T=textOf(n),J=L.open&&T.length?L.slice(0,-1).concat([L[L.length-1]+T[0]],T.slice(1)):L.concat(T);J.open=T.length?T.open:L.open;L=J} /* cat a b: b goes on in a's last line when a has no newline at its end */
    });
    done(L);
    return;
  }
  if(STDIN){var R=STDIN.splice(0);R.open=!!STDIN.open&&R.length>0;STDIN.open=false;done(R);return} /* it reads the rest: a read after it, or the next round of a read loop, finds nothing */
  var got=[];
  queue(function(){
    return (function more(){return readLine().then(function(l){if(l===null)return;got.push(l);return more()})})();
  });
  queue(function(){done(got)});
}

/* ---------- shell state ---------- */
var OWNER=PROFILE.owner;
var HOME0=PROFILE.home||PROFILE.homes+'/'+PROFILE.user;
var ST={owner:OWNER,user:PROFILE.user,home:HOME0,cwd:HOME0,site:SITE,hostname:PROFILE.host,login:now()};
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
var SD=(function(){ /* system files: the machine's install date (installed: 1979-01-01 00:01) */
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
  if(PROFILE.dos)p=p.replace(/^[a-z]:/,'').replace(/\\/g,'/');
  if(p==='~'||p.slice(0,2)==='~/')p=ST.home+p.slice(1);
  var s=p.charAt(0)==='/'?[]:parts(ST.cwd);
  parts(p).forEach(function(x){if(x==='..')s.pop();else if(x!=='.')s.push(x)});
  return '/'+s.join('/');
}
function pathOf(n){var s=[];while(n!==ROOT){s.unshift(n.name);n=n.parent}return '/'+s.join('/')}
function find(p,exact,locks){ /* node or null; nobody gets through a locked folder.
                           exact (for building the tree): full names only, locks ignored, unless locks */
  var s=parts(norm(p)),n=ROOT;
  for(var i=0;i<s.length;i++){
    if(n.type!=='d'||(n.prot&&(!exact||locks)))return null;
    var k=has(n.kids,s[i])?n.kids[s[i]]:null;
    if(!k&&!exact&&i===s.length-1){ /* cat photo01 finds photo01.pic */
      var like=Object.keys(n.kids).sort().filter(function(x){return x.charAt(0)!=='.'&&x.split('.')[0]===s[i]})[0];
      if(like!==undefined)k=n.kids[like];
    }
    if(!k)return null;
    n=k;
  }
  return n;
}
function named(p){return find(p,true,true)} /* what a program opens by its full name: not through a locked folder either */
function textOf(n){var B=body(n)||[],T=B.map(function(l){return plain(lineOf(l)[0])});T.open=!!B.open&&T.length>0;return T} /* open: no newline at its end */
function isScript(n){return n.type==='f'&&/x/.test(n.mode||'')&&n.body}
function dirOf(abs){return abs.slice(0,abs.lastIndexOf('/'))||'/'}
function sys(p,type,o){return put(p,type,Object.assign({owner:'root',date:SD},o))} /* a file of the system's own */
function hash(s,mod){var h=0;for(var i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))%mod;return h}
function programs(of){ /* a program file for each command that has a path: of(dir,hash) gives its owner and size */
  Object.keys(PATHS).sort().forEach(function(b){
    var dir=PATHS[b];
    sys(dir+'/'+b,'f',of(dir,hash(b,7919)));
  });
}
function chunk(a,n){var o=[];for(var i=0;i<a.length;i+=n)o.push(a.slice(i,i+n));return o} /* into rows of n */
function globRe(p,flags){return new RegExp('^'+p.replace(/[.+^${}()|\\]/g,'\\$&').replace(/\*/g,'.*').replace(/\?/g,'.')+'$',flags)}
function isRoot(){return !!RP&&PROFILE.fold(ST.user)===PROFILE.fold(PROFILE.rootName)} /* the super-user now, not someone su'd to from root */
var ATTRS=PROFILE.dos&&!PROFILE.dcl; /* DOS and CP/M: no owners, only a read-only attribute, which anyone may clear */
function mayAlter(n){ /* may who is logged in change, replace or remove this file? root may; on DOS and CP/M, a file without
  the read-only attribute; elsewhere, their own, or one anyone may write. The site's files and the system's are someone else's */
  if(!n||n.dev||isRoot())return true;
  if(ATTRS)return !n.ro;
  return n.owner===ST.user||modeOf(n).charAt(8)==='w';
}
function canWrite(abs){ /* your home folder, or a folder anyone may write in; nothing else, and nothing locked or someone else's */
  var up=dirOf(abs),dir=find(up),ex=find(abs,true);
  if(ex&&ex!==ROOT&&!mayAlter(ex)&&ex.parent===dir)return false; /* a link the visitor made to it is theirs to remove or rename; writing through it is writeFile's to refuse */
  if(isRoot())return !!dir&&dir.type==='d'&&!dir.prot&&pathOf(dir)===up;
  if(!dir||dir.type!=='d'||dir.prot)return false;
  var at=pathOf(dir);
  if(at!==up)return false; /* find's cat photo01 finds photo01.pic is not for making files */
  return /^drwxrwxrw[xt]$/.test(dir.mode||'')||ST.home==='/'||at===ST.home||at.indexOf(ST.home+'/')===0;
}
var DISK=4194304; /* the most a file may hold, in bytes: cat f >> f in a loop fills the disk, not the browser */
function writeFile(p,lines,append){ /* false if it cannot be written */
  var abs=norm(p),ex=find(abs,true);
  if(ex&&ex.dev)return !ex.prot; /* /dev/null and friends swallow it */
  if(ex&&(ex.type==='d'||ex.prot||ex.parent.prot||!mayAlter(ex))||!canWrite(abs))return false;
  var old=ex&&append?textOf(ex):[],L=old.open&&lines.length?old.slice(0,-1).concat([old[old.length-1]+plain(lineOf(lines[0])[0])],lines.slice(1)):old.concat(lines); /* after a last line with no newline, what comes goes on in it */
  L.open=lines.length?!!lines.open:old.open;
  if(bsize(L)>DISK){ /* what fits goes in, and the rest is lost, the way a full disk did it */
    for(var i=0,n=0;n+lineOf(L[i])[0].length+1<=DISK;i++)n+=lineOf(L[i])[0].length+1;
    L=L.slice(0,i);L.open=false;
    typeLine(diskFull(),'err');
  }
  if(!ex)put(abs,'f',{body:L,owner:ST.user,date:now()});
  else{ex.body=L;ex.size=0;ex.date=now()}
  return true;
}
function diskFull(){
  return PROFILE.diskFull||(PROFILE.dcl?'%SYSTEM-F-EXDISKQUOTA, disk quota exceeded':PROFILE.dos?'Insufficient disk space':
    PROFILE.perror||PROFILE.csh||PROFILE.bash?(CURRENT?CURRENT+': ':'')+'write error: No space left on device':'no space on dev 6/0'); /* V7's kernel (prdev): root on hp0, block major 6 in conf/c.c */
}
function bsize(L){return L.reduce(function(n,l){return n+lineOf(l)[0].length+1},0)-(L.open&&L.length?1:0)}
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
  var O=PROFILE.lsOwner,Z=PROFILE.lsSize; /* widths differ by system: 6 and 7 on V7, 8 and 8 at Berkeley */
  var sz=n.dev?(String(n.dev[0]).padStart(3)+','+String(n.dev[1]).padStart(3)).padStart(Z):String(fsize(n)).padStart(Z);
  return [modeOf(n)+(PROFILE.lsTight?'':' ')+String(links(n)).padStart(2)+' '+n.owner.slice(0,O).padEnd(O)+sz+' '+lsdate(n.date)+' '+name,n.prot?'dim':''];
}
function row(l,v){var d=Math.max(2,20-l.length);return l+' \u0003'+'.'.repeat(d)+'\u0004 '+v} /* dot leader squeezes on narrow glass */

/* ---------- commands: built-ins from engine/commands, text commands from the content ---------- */
var CMDS=Object.create(null),PATHS={},NOH={},HELP=[];
var MAN=Object.create(null);
function page(names,what,syn,desc,bugs){
  var F=function(L){return (L||[]).map(function(l){return Array.isArray(l)?[PROFILE.fill(l[0])].concat(l.slice(1)):PROFILE.fill(l)})};
  var p={names:names.join(', '),what:what,syn:syn,desc:F(desc),bugs:F(bugs)};
  names.forEach(function(n){MAN[n]=p});
  return p;
}
/* the terminal's own words (help, about, fill ...) and the site's text commands: the terminal answers them on every
   machine, so help lists them apart on the machines that have man, and their manual pages say so. A word with a
   program file is the machine's. */
var TERMSAYS='the terminal answers this, not the machine.',OWN=Object.create(null);
function install(n,fn,noh,own){ /* later definitions of the same name win */
  CMDS[n]=fn;NOH[n]=noh;delete PATHS[n];
  if(own)OWN[n]=true;else delete OWN[n];
  HELP=HELP.filter(function(h){return h[0]!==n});
}
PH.defs.forEach(function(d){
  if(typeof d.enabled==='function'&&!d.enabled(PROFILE))return; /* e.g. about, only when there is an about section */
  if(PROFILE.noUnix&&!d.terminal&&/(^|\/)engine\//.test(d.from||''))return; /* terminal: part of the terminal, not the OS */
  var names=(d.names||[]).filter(function(n){return PROFILE.off.indexOf(n)<0});
  if(!names.length||typeof d.run!=='function')return;
  var own=d.terminal&&!d.path;
  names.forEach(function(n){install(n,d.run,!!d.noHelpFlag,own)});
  if(d.path)PATHS[names[0]]=d.path; /* where its program file shows up in the file tree */
  if(d.help&&!d.hidden)HELP.push([names[0],d.help]);
  if(d.man)page(names,d.man.what||'',d.man.syn||names[0],own?(d.man.desc||[]).concat(['',TERMSAYS]):d.man.desc,d.man.bugs);
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
  n.forEach(function(x){install(x,fn,false,c.site);delete MAN[x]}); /* replaces any built-in of that name, its manual page and program file too */
  if(c.help){
    HELP.push([n[0],c.help]);
    page(n,c.help.toLowerCase(),n[0],[c.help.toLowerCase()+'.'].concat(c.site?['',TERMSAYS]:[])); /* a page made from the help text */
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
/* the super-user: nothing is locked, and # is the prompt. Put back at logout, or at exit from su. */
var RP=null,PENDROOT=null;
function setRoot(viaSu){
  if(RP)return;
  RP={user:ST.user,home:ST.home,cwd:ST.cwd,su:viaSu,prot:[]};
  (function walk(n){
    if(n.prot){RP.prot.push(n);n.prot=false}
    if(n.type==='d')Object.keys(n.kids).forEach(function(k){if(n.kids[k]!==n)walk(n.kids[k])});
  })(ROOT);
  ST.user=PROFILE.rootName;ST.home='/';
  if(!viaSu)ST.cwd='/';
}
function moved(was,to){ /* a folder moved: anyone standing in it goes with it, including who su left behind */
  [ST,RP].forEach(function(o){
    if(!o)return;
    ['cwd','home'].forEach(function(k){if(o[k]===was||o[k].indexOf(was+'/')===0)o[k]=to+o[k].slice(was.length)});
  });
}
function dropRoot(){
  if(!RP)return;
  ST.user=RP.user;ST.home=RP.home;ST.cwd=RP.cwd;
  RP.prot.forEach(function(n){n.prot=true});
  RP=null;
}
/* ---------- programs that load when first run (Phosphor.later). Script tags, so this works from disk too. ---------- */
var LOADED={},RANH=0,RAND=0; /* hooks and programs already taken up: loads can overlap */
function loadOne(f){ /* a promise of the programs the file defines, or false */
  var M=PH.machine&&PH.catalog[PH.machine],src=(M?M.dir+'/':'')+f;
  if(LOADED[src])return LOADED[src];
  return LOADED[src]=new Promise(function(res){
    var h=PH.hooks.length,d=PH.defs.length,el=document.createElement('script');
    function failed(){delete LOADED[src];el.remove();res(false)}
    el.src=src;el.async=false; /* not async: the files of one program run in the order they were asked for */
    el.onerror=failed;
    el.onload=function(){ /* straight after the file has run, before the next one does */
      if(!PH.seen[src]){failed();return} /* a stray ` or ${ in it, so it never got as far as saying so */
      try{
        var hs=PH.hooks.slice(Math.max(h,RANH)),ds=PH.defs.slice(Math.max(d,RAND));
        RANH=PH.hooks.length;RAND=PH.defs.length;
        var pre=BASE&&new Map();if(pre)tree().forEach(function(n,p){pre.set(p,sig(n))});
        hs.forEach(function(fn){fn(PH)});
        if(pre)tree().forEach(function(n,p){var a=pre.get(p);if(!a||!same(a,n))BASE.set(p,sig(n))}); /* what a program brings with it is the system's, as if there at boot */
      }catch(e){failed();return}
      res(ds);
    };
    document.body.appendChild(el);
  });
}
function load(files){ /* all at once, run in order; true when every one arrived, and only then are its programs taken up.
   ^C stops the wait, not the loading: it arrives for next time */
  return new Promise(function(r){
    var W=wakeList();
    function done(ok){var i=W.indexOf(wake);if(i>=0)W.splice(i,1);r(ok)}
    function wake(){done(false)}
    W.push(wake);
    Promise.all([].concat(files).map(loadOne)).then(function(got){
      if(got.some(function(ds){return !ds})){done(false);return}
      got.forEach(function(ds){ds.forEach(function(x){ /* only what was listed: its manual page and program file are there already */
        (x.names||[]).forEach(function(n){if(has(CMDS,n)&&PROFILE.off.indexOf(n)<0)CMDS[n]=x.run});
      })});
      done(true);
    });
  });
}
PH.runLater=function(files,def,a,raw,w){
  var name=def.names[0],ok;
  queue(function(){return load(files).then(function(x){ok=x})});
  queue(function(){
    var f=CMDS[name];
    if(!ok||f===def.run){typeLine(def.failed||name+': cannot execute','err');STATUS=1;return}
    CURRENT=name;
    try{f(a,raw,w)}catch(e){console.error(e);typeLine(name+': core dumped','err')}
  });
};
var ENV={PATH:':/bin:/usr/bin',TERM:'p9'},CSHV=Object.create(null),CSHW=Object.create(null); /* CSHV: csh's own variables, from set */
Object.assign(PH,{ /* what commands and machine hooks may use */
  profile:PROFILE,st:ST,cmds:CMDS,man:MAN,paths:PATHS,help:function(){return HELP.slice()},own:function(n){return has(OWN,n)},
  hist:function(){return hist.slice()},setHist:function(L){hist=L.slice(-HMAX);hi=hist.length}, /* a shell's history -c, -d or -s */
  setPrompt:function(f){promptFn=f},readKey:readKey,oops:oops,oopsW:oopsW,shvars:CSHV,shwords:CSHW,
  /* what a game keeps between visits, in this browser only; false or null when the browser refuses */
  saved:function(k){try{return JSON.parse(localStorage.getItem('phosphor-9/'+k))}catch(e){return null}},
  save:function(k,v){
    try{
      if(v===null)localStorage.removeItem('phosphor-9/'+k);
      else localStorage.setItem('phosphor-9/'+k,JSON.stringify(v));
      return true;
    }catch(e){return false}
  },
  inUse:function(p){return [ST.cwd].concat(RP?(RP.su?[RP.cwd,RP.home]:[RP.home]):[]).some(function(x){return x===p||x.indexOf(p+'/')===0})},
  su:function(){setRoot(true)},unsu:function(){if(RP&&RP.su){dropRoot();return true}return false},
  rootHeld:function(){return !!RP}, /* root is held, by su or a root login, whoever the shell says it is now */
  relock:function(on){if(RP)RP.prot.forEach(function(n){n.prot=!!on})}, /* a shell root starts as someone else: root's locks back on, and off again */
  powerOff:function(lines){ /* the end: the picture collapses to a dot, and any key starts it again */
    say(lines||[]);
    queue(function(){
      return new Promise(function(){
        term.classList.remove('idle');
        $('#crt').classList.add('off');
        KEYS=function(){location.reload()};
      });
    });
  },
  effects:function(m){ /* auto, full or lite, remembered in this browser; none: what is in use, and why */
    if(m===undefined)return {mode:FX.mode,lite:document.documentElement.classList.contains('lite'),why:FX.why||''};
    FX.mode=m;PH.save('effects',m===PROFILE.effects?null:m);
    fxApply();fxDetect();
    return m;
  },
  fillGlass:function(on){ /* the glass fills the window; remembered in this browser */
    if(on===undefined)return document.documentElement.classList.contains('fill');
    document.documentElement.classList.toggle('fill',on);
    PH.save('fill',on?true:null);
    window.dispatchEvent(new Event('resize')); /* the glass changed size: everything re-fits */
    return on;
  },
  columns:function(){return cols()},inColumns:inColumns,fullscreen:fullscreen,program:program,ask:ask,sys:sys,hash:hash,programs:programs,chunk:chunk,dirOf:dirOf,
  envRows:function(){return Object.keys(PH.env).sort().map(function(k){return k+'='+PH.env[k]})},
  piped:function(){return !!SINK},bre:bre,INT:INT,
  fold:PROFILE.fold,stdin:function(){return STDIN},input:input,readLine:readLine,text:textOf,canWrite:canWrite,mayAlter:mayAlter,writeFile:writeFile,
  status:function(n){STATUS=n},lastStatus:function(){return PREV},globRe:globRe,glob:glob,loop:function(what){if(!SUB)LOOP=what},inScript:function(){return SCRIPTS>0},
  args:function(a){if(a)ARGS=a;return ARGS},baud:function(b){if(b!==undefined)BAUD=b;return BAUD},teletype:function(){return TELE.on?TELE:null}, /* the Teletype Model 33's line: lcase, speed */
  teletypeMode:function(on){ /* the teletype command: null where it is not offered; on or off, remembered in this browser */
    if(!TELE.ok)return null;
    if(on!==undefined){TELE.on=!!on;TELE.lcase=true;TELE.free=0;PH.save('teletype',on?true:null)}
    return TELE.on;
  },env:ENV,runScript:runScript,child:child,keep:keep,exec:execLine,
  subshell:function(){return SUB>0},subExit:function(a){if(!SUBSH||SUB!==SUBSH)return false;STATUS=a[0]===undefined?PREV:parseInt(a[0],10)||0;LOOP='exit';return true}, /* exit in ( ): that process ends */forked:forked,pidNow:function(){var p=PIDNOW;PIDNOW=null;return p},source:function(){return SOURCE},vars:function(t){return unguard(varsIn(t))},unguard:unguard,moved:moved,
  aliases:PROFILE.aliases.slice(),setAlias:setAlias,jobCmd:jobCmd,jobs:psJobs,stoppedWarn:stoppedWarn,unquote:unquote,has:has,lineOf:lineOf,
  say:say,typeLine:typeLine,pause:pause,queue:queue,aside:aside,asideNow:function(){return !!ASIDE},typed:function(){return kb?kb.value:''},sleep:sleep,click:click,load:load,
  sound:function(on){if(on===undefined)return SND.clicks;if(on&&!actx())return false;SND.clicks=!!on;return true},
  find:find,named:named,norm:norm,put:put,home:home,pathOf:pathOf,body:body,fsize:fsize,longRow:longRow,
  root:ROOT,fileDate:FD,systemDate:SD,
  ctime:ctime,short:short,now:now,p2:p2,tz:tz,row:row,manPage:manPage,fill:PROFILE.fill,
  clear:function(){queue(function(){afterglow(term.scrollTop,.55,900,true);out.textContent='';log.textContent=''})},
  logout:function(){ /* log out: clear the glass, replay the self-test, wait at login: */
    dropRoot();endJobs();KEPT.length=0; /* the ( ) or pipe stage it came from does not put the old variables back */
    LOGOUT=true;PH.aliases=PROFILE.aliases.slice(); /* session aliases die with the shell, and so do its variables and history */
    Object.keys(ENV).forEach(function(k){delete ENV[k]});Object.assign(ENV,ENV0);
    Object.keys(CSHV).forEach(function(k){delete CSHV[k]});hist=[];hi=0;
    if(!TELE.on)PH.clear(); /* paper stays where it is */
    pause(500);banner();prompt(PROFILE.loginPrompt,'login');
  }
});
if(PH.saved('fill'))document.documentElement.classList.add('fill');
TELE.on=TELE.ok&&PH.saved('teletype')===true;
var fxSaved=PH.saved('effects');FX.mode=/^(auto|full|lite)$/.test(fxSaved)?fxSaved:PROFILE.effects;fxApply();
PH.hooks.forEach(function(fn){
  try{fn(PH)}catch(e){PROFILE.problems.push('machine setup failed: '+e.message)}
});
var ENV0=Object.assign({},ENV); /* the environment a login starts with */
put(ST.home,'d',{owner:OWNER});
PROFILE.dirs.forEach(function(d){put(home(d),'d')});
PROFILE.files.forEach(function(f){put(home(f.name),'f',{body:f.body})});
PROFILE.protected.forEach(function(p){
  var dir=/\/$/.test(p),abs=home(p.replace(/\/+$/,'')),ex=find(abs,true); /* exact: an item inside a locked folder is still found */
  if(ex&&ex!==ROOT)ex.prot=true;
  else put(abs,dir?'d':'f',{prot:true,size:dir?0:/\.pic$/.test(abs)?16384:2048});
});

/* ---------- the visitor's files, kept in this browser (persist:, unless the machine keeps its own) ----------
   What differs from the tree as it booted: what the guest made, changed or removed in their home, and what root changed
   anywhere. A reload is a reboot: /tmp starts empty, as each system's boot left it (V7's and 4.3BSD's /etc/rc, IRIX's
   RMTMPFILES, Debian 13's tmpfs). Each change remembers what the file was at boot; when the site's own version of it
   has changed since, the change is dropped, so the author's update shows. */
if(ATTRS)(function mark(d){Object.keys(d.kids).forEach(function(k){var n=d.kids[k];if(n.type==='d'){if(n!==d)mark(n)}else if(!n.dev)n.ro=true})})(ROOT); /* every file on the disk is read-only (ATTRIB +R) */
var CAT=PH.machine&&PH.catalog[PH.machine],KEEP=PROFILE.persist!==false&&!(CAT&&CAT.saves==='own'),FKEY=(PH.machine||'terminal')+'/files',
  BASE=null,KEPT_AS=null,FAILED_AS=null,FIELDS=['type','owner','mode','bin','size','ro','hidden','user','del','group','store'];
function scratch(p){return p==='/tmp'||p.indexOf('/tmp/')===0}
function tree(){ /* path -> node, each folder once (a link to one is listed, not walked again) */
  var M=new Map(),seen=new Set([ROOT]);
  (function walk(d,at){Object.keys(d.kids).forEach(function(k){
    var n=d.kids[k],p=at+'/'+k;
    if(scratch(p)||n===ROOT)return;
    M.set(p,n);
    if(n.type==='d'&&!seen.has(n)){seen.add(n);walk(n,p)}
  })})(ROOT,'');
  return M;
}
function val(x){return x===undefined?null:x}
function sig(n){return {n:n,b:n.body,d:+n.date||0,f:FIELDS.map(function(k){return val(n[k])})}}
function same(a,n){return a.n===n&&a.b===n.body&&a.d===(+n.date||0)&&FIELDS.every(function(k,i){return a.f[i]===val(n[k])})}
function was(a){ /* what the file was at boot, as a number */
  if(a.h===undefined)a.h=hash(JSON.stringify([a.f,typeof a.b==='function'?'':a.b]),2147483647);
  return a.h;
}
function ser(n){
  var o={t:n.type,d:+n.date||0};
  FIELDS.slice(1).forEach(function(k){if(n[k]!=null&&n[k]!==false)o[k]=n[k]});
  if(n.type==='f'&&n.body!=null){var B=body(n)||[];o.b=B.slice();if(B.open)o.open=true}
  return o;
}
function keepFiles(){ /* false the first time a change cannot be kept: the browser is full */
  if(!KEEP||!BASE)return true;
  var now=tree(),keep={},gone={},any=false;
  now.forEach(function(n,p){var a=BASE.get(p);if(!a||!same(a,n)){keep[p]=ser(n);if(a)keep[p].h=was(a);any=true}});
  BASE.forEach(function(a,p){if(!now.has(p)){gone[p]=was(a);any=true}});
  var v=any?{v:1,keep:keep,gone:gone}:null,j=JSON.stringify(v);
  if(j===KEPT_AS)return true;
  if(PH.save(FKEY,v)){KEPT_AS=j;FAILED_AS=null;return true}
  var said=j===FAILED_AS;FAILED_AS=j;return said; /* tried again at each prompt, and said once */
}
function restoreFiles(){
  var s=PH.saved(FKEY);
  if(!s||typeof s!=='object'||s.v!==1)return;
  function good(p){return typeof p==='string'&&p.charAt(0)==='/'&&p.length>1&&!scratch(p)&&!parts(p).some(function(x){return x==='.'||x==='..'})}
  var gone=s.gone&&typeof s.gone==='object'?s.gone:{},keep=s.keep&&typeof s.keep==='object'?s.keep:{};
  Object.keys(gone).sort().reverse().forEach(function(p){
    var a=BASE.get(p),d=good(p)&&a&&was(a)===gone[p]&&find(dirOf(p),true);
    if(d&&d.type==='d')delete d.kids[p.split('/').pop()];
  });
  Object.keys(keep).sort().forEach(function(p){
    var e=keep[p],a=BASE.get(p);
    if(!good(p)||!e||typeof e!=='object'||(e.t!=='f'&&e.t!=='d'))return;
    if(e.h!==undefined?!a||was(a)!==e.h:!!a)return; /* the site's file changed, or the site has made one here since */
    var n=find(p,true);
    if(!n||n===ROOT||n.type!==e.t)n=put(p,e.t,{});
    n.date=new Date(+e.d||0);
    FIELDS.slice(1).forEach(function(k){if(has(e,k))n[k]=e[k];else if(k==='bin')n.bin=false;else if(k==='size')n.size=0;else if(k==='mode')n.mode=null;else delete n[k]});
    if(typeof n.owner!=='string')n.owner=OWNER;
    if(e.t==='f'){n.body=Array.isArray(e.b)?e.b.map(function(l){return Array.isArray(l)?l:String(l)}):null;if(n.body&&e.open)n.body.open=true}
  });
}
if(KEEP){
  BASE=new Map();tree().forEach(function(n,p){BASE.set(p,sig(n))});
  restoreFiles();
  window.addEventListener('pagehide',function(){keepFiles()});
}

/* ---------- running commands ---------- */
function expand(seg){ /* each command of a pipeline, or after && or ||: longest matching alias wins; extra words pass through */
  if(PROFILE.dos)return aliasOf(seg);
  var out='',start=0,depth=0,j;
  for(var i=0;i<seg.length;i++){ /* the same quotes, `commands`, comments and csh ( ) as andOr */
    var c=seg.charAt(i),two=seg.substr(i,2);
    if(c==='\\'){i++;continue}
    if((j=quoteEnd(seg,i))>=0){i=j;continue}
    if(c==='#'&&(!i||/[\s;|&<>]/.test(seg.charAt(i-1))))break;
    if(c==='{'&&!depth&&(j=groupEnd(seg,i))>=0){i=j;continue}
    if(c==='(')depth++;else if(c===')')depth=Math.max(0,depth-1);
    else if(!depth&&(c==='|'||two==='&&')){
      var op=two==='&&'||two==='||'?two:c;
      out+=piece(seg.slice(start,i))+op;start=i+op.length;i=start-1;
    }
  }
  return (out+piece(seg.slice(start))).trim();
  function piece(p){var a=aliasOf(p);return a===p.trim()?p:' '+a+' '} /* untouched unless an alias was there */
}
function aliasOf(cmd){
  var parts=cmd.trim().split(/\s+/),low=parts.map(PROFILE.fold),best=null;
  PH.aliases.forEach(function(x){
    if(x.from.length>low.length)return;
    for(var i=0;i<x.from.length;i++)if(x.from[i]!==low[i])return;
    if(!best||x.from.length>best.from.length)best=x;
  });
  return best?[best.to].concat(parts.slice(best.from.length)).join(' '):cmd.trim();
}
var CURRENT='',SOURCE=''; /* SOURCE: the command as typed, $variables and all */
function runOne(s,words,src){
  var typed=s; /* the line as typed, blanks and all, for a machine's own fallback (CMS) */
  s=s.trim();
  SOURCE=src===undefined?s:src;
  words=words||s.split(/\s+/);
  if(!s||!words[0])return;
  if(PROFILE.dcl&&PH.symbols&&/^\$?\s*[a-z_][\w$]*\s*:?==?/i.test(s))return; /* VMS's DCL: a symbol, NAME :== value, is taken without a word. The other
                                                                             machines with shell: dcl have no symbols, and get the line as it is (their fallback) */
  PREV=STATUS;STATUS=0;
  var parts=words.map(PROFILE.fold),c=parts[0],args=parts.slice(1),word=words[0];
  if(PROFILE.csh&&/:$/.test(word)&&args.length){typeLine(word+': Too many arguments.','err');return}
  if(control()&&/^%/.test(word)){jobCmd('%',args,s,words);return} /* %1: fg */
  var f=has(CMDS,c)?CMDS[c]:null,name=c;
  if(!f&&c.indexOf('/')>=0){ /* /bin/ls runs ls; any other path is not a program */
    var n=find(c);
    if(n&&n.bin&&has(CMDS,n.name)){f=CMDS[n.name];name=n.name}
    else if(n&&isScript(n)){runScript(textOf(n),words.slice());return}
    else if(n){typeLine(word+': cannot execute','err');return}
  }
  if(f&&!NOH[name]&&args.indexOf(PROFILE.bash?'--help':'-h')>=0&&has(MAN,name)){typeLine((PROFILE.bash?'Usage: ':'usage: ')+MAN[name].syn);return} /* GNU's tools take -h for other things */
  if(f){
    CURRENT=name;
    try{f(args,s,words,typed)}catch(e){console.error(e);typeLine(name+': core dumped','err')} /* typed: as for the fallback, for a machine that takes the terminal's own commands as its lines (CMS) */
  }
  else if(!(PH.fallback&&PH.fallback(word,s,args,typed)))typeLine(PROFILE.notFound.replace('%s',word),'err');
}
/* ---------- the shell: words, quotes, $variables, wildcards, pipes, redirection, && and || ---------- */
var ARGS=[]; /* $0 $1 ... of the script that is running */
var VAR=PROFILE.csh?'\\$(\\?\\w+|#\\w+|\\w+\\[[^\\]\\s]*\\]|\\w+|\\{\\w+\\}|\\?|\\$|#|\\*)':'\\$(\\w+|\\{\\w+\\}'+(PROFILE.bash?'|\\{\\w+\\[[^\\]}]*\\]\\}':'')+'|\\?|\\$|#|\\*|!)',VAR_AT=new RegExp('^'+VAR),VAR_ALL=new RegExp(VAR,'g'); /* csh also has $?name: is it set */
function varsIn(t){return t.replace(VAR_ALL,function(m,k){return envOf(k)})}
var PIPEST=[0]; /* bash's PIPESTATUS: the status of each command of the last pipeline */
function envOf(k){
  var el=PROFILE.bash&&/^\{(\w+)\[([^\]]*)\]\}$/.exec(k); /* bash: ${name[i]}, ${name[@]}: PIPESTATUS is an array; any other name is one of one */
  if(el){var A=el[1]==='PIPESTATUS'?PIPEST.map(String):[envOf(el[1])],x=varsIn(el[2]).trim();return x==='@'||x==='*'?A.join(' '):A[parseInt(x,10)||0]||''}
  if(PROFILE.bash&&k==='PIPESTATUS')return String(PIPEST[0]);
  if(k.charAt(0)==='{')return envOf(k.slice(1,-1)); /* ${name} is $name */
  if(k==='?')return String(STATUS);
  if(k==='!')return LASTBG; /* sh: the last process started with & */
  if(k.length>1&&k.charAt(0)==='?'){
    var keep=SCRIPTS;SCRIPTS=0;
    try{envOf(k.slice(1));return '1'}catch(e){return '0'}finally{SCRIPTS=keep}
  }
  if(k==='#')return String(Math.max(0,ARGS.length-1));
  if(k.charAt(0)==='#')return String((k==='#argv'?ARGS.slice(1).join(' ').split(/\s+/).filter(Boolean):wordsOf(k.slice(1))).length); /* csh: $#name, how many words */
  if(k==='*')return ARGS.slice(1).join(' ');
  var sub=/^(\w+)\[([^\]]*)\]$/.exec(k); /* csh: $z[2], the second word; $z[1-2], $z[2-], $z[-2], $z[-] and $z[*] all of them */
  if(sub)return range(wordsOf(sub[1]),varsIn(sub[2]),k).join(' ');
  if(/^\d+$/.test(k))return ARGS[+k]||'';
  if(k==='$')return String(shellPid());
  if(k==='HOME')return ST.home;
  if(k==='USER'||k==='LOGNAME')return ST.user;
  if(has(ENV,k))return ENV[k];
  if(PROFILE.csh){
    if(k in CSHV)return CSHV[k];
    var V={argv:ARGS.slice(1).join(' '),status:String(STATUS),home:ST.home,user:ST.user,cwd:ST.cwd,path:(ENV.PATH||'').replace(/:/g,' '),term:ENV.TERM,shell:'/bin/csh',prompt:'% '};
    if(has(V,k)&&V[k]!==undefined)return V[k];
    if(!SCRIPTS)throw {undefinedVar:k}; /* sh scripts still get the empty string */
  }
  return '';
}
function range(L,np,k){ /* the words of L that [np] picks, as 4.3BSD's sh.dol.c has it: [0] is none, [5-] past the end none too */
  var lwb=1,upb=L.length,m;
  function oob(){throw {undefinedVar:k,msg:'Subscript out of range.'}}
  function syntax(){throw {undefinedVar:k,msg:'Variable syntax.'}}
  if(!np)syntax();
  if((m=/^\d+/.exec(np))){
    var i=+m[0];np=np.slice(m[0].length);
    if(i>upb&&!/^[-*]/.test(np))oob();
    lwb=i;
    if(!np){upb=lwb;np='*'}
  }
  if(np.charAt(0)==='*')np=np.slice(1);
  else if(np.charAt(0)!=='-')syntax();
  else{
    var j=upb;np=np.slice(1);
    if((m=/^\d+/.exec(np))){j=+m[0];np=np.slice(m[0].length);if(j>upb)oob()}
    upb=j<lwb?lwb-1:j;
  }
  if(!lwb){if(upb)oob();upb=-1}
  if(np)syntax();
  return upb<lwb?[]:L.slice(lwb-1,upb);
}
function wordsOf(k){var v=envOf(k),l=CSHW[k];return l&&l.s===v?l.w:v.split(/\s+/).filter(Boolean)} /* csh: set z = ( "a b" c ) keeps its words */
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
    try{re=globRe(seg,PROFILE.caseless?'i':'')}catch(e){found=[];return}
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
var NOMATCH={};
/* what a `command` printed is data: its special characters travel as private-use ones until the words are made */
var META='|&<>$`"\'\\# ;',SEP='\uE010'; /* SEP: where a `command`'s output starts; unguard drops it */
function guard(t,spaces){
  return t.replace(spaces?/[|&<>$`"'\\# ;]/g:/[|&<>$`"'\\#;]/g,function(c){return String.fromCharCode(0xE000+META.indexOf(c))});
}
function unguard(t){return t.replace(/\uE010/g,'').replace(/[\uE000-\uE00B]/g,function(c){return META.charAt(c.charCodeAt(0)-0xE000)})}
var SYNCHK=false; /* parseList only reads: no variables, no wildcards */
function parseList(s){ /* a line with no top-level ; into [{op,stages:[{words,raw,in,out,app}]}] */
  var list=[],stages=[],op=null,w=null,quoted=false,fromVar=false,redir=null,i=0,piped=false,at=0; /* at: where this stage's text starts */
  function fresh(){return {words:[],ends:[],raw:'',src:'',in:null,out:null,app:false,err:null,glass:false,mk:[]}}
  var st=fresh();
  function add(r,c){st.raw+=r;st.src+=c===undefined?r:c} /* raw has the values of variables, src the names */
  function endWord(){
    if(w===null)return;
    if(redir){w=unguard(w);if(redir==='<<<')st.here=w;else if(redir==='<')st.in=w;else if(redir==='n<'){}else if(redir==='n>'||redir==='n>>')st.mk.push({f:w,app:redir==='n>>'});else if(redir==='2>'||redir==='2>>'){st.err=w;st.errApp=redir==='2>>';st.e2o=false;if(st.glass)st.glassOld=true}else{st.out=w;st.app=redir==='>>';st.glass=false}redir=null}
    else if(quoted||PROFILE.dos)st.words.push(unguard(w));
    else w.split(fromVar?/\s+/:/\0/).filter(function(x){return (x||!fromVar)&&!(x.indexOf('\uE010')>=0&&unguard(x)==='')}).forEach(function(x){ /* empty backtick output is no word at all */
      x=unguard(x);
      if(PROFILE.csh&&st.words[0]==='@'){st.words.push(x);return} /* @ x = 2 * 3: no wildcards */
      if(SYNCHK){st.words.push(x);return}
      var g=glob(x);
      if(PROFILE.csh&&g.length===1&&g[0]===x&&/[*?\[]/.test(x))throw NOMATCH; /* csh says so; sh passes the word along */
      st.words=st.words.concat(g);
    });
    for(var e=[st.raw.length,st.src.length];st.ends.length<st.words.length;)st.ends.push(e); /* where each word ends in raw and src */
    w=null;quoted=false;fromVar=false;
  }
  function endStage(tok){
    endWord();
    if(redir&&!PROFILE.dos)throw {syntax:tok,redir:true}; /* echo a > : a redirection with no name */
    if(PROFILE.csh&&!st.words.length&&st.sub===undefined&&(st.in!==null||st.out!==null)){
      if(!/\S/.test(st.src))throw {syntax:tok}; /* > f, or echo a &> f: a redirection with no command (4.3BSD's syn3) */
      st.in=st.out=null; /* $empty > f: no command once the words are made, and csh does nothing at all */
    }
    if(st.sub!==undefined&&st.words.length||st.paren)throw {syntax:st.words[0],paren:true}; /* (a) b, and csh's (a) 2>f: its 2 is a word (4.3BSD's syn3: Badly placed ()'s) */
    st.text=s.slice(at,i).replace(/^\s*(\|&?|&&|\|\||&)?\s*/,'').trim();at=i; /* as typed, for the job table */
    st.raw0=st.raw;st.raw=unguard(st.raw);if(st.words.length||st.in||st.out||st.err||st.glass||st.sub!==undefined||st.here!==undefined)stages.push(st);st=fresh();
  }
  function blank(){return w===null&&!/\S/.test(st.src)&&st.in===null&&st.here===undefined&&st.out===null&&st.err===null&&!st.glass&&!st.e2o&&!st.closed&&!st.errClosed&&!st.mk.length} /* nothing written for this command */
  function endList(nextOp){endStage(nextOp||'newline');if(stages.length)list.push({op:op,stages:stages});stages=[];op=nextOp;piped=false}
  while(i<s.length){
    var ch=s.charAt(i),two=s.substr(i,2),close;
    if(/\s/.test(ch)){endWord();if(!redir)add(ch);i++;continue}
    if(PROFILE.dos){ /* COMMAND.COM: pipes and redirection, and nothing else is special */
      if(!PROFILE.dcl&&ch==='|'){endStage();i++;continue}
      if(!PROFILE.dcl&&(ch==='>'||ch==='<')){endWord();redir=two==='>>'?'>>':ch;i+=redir.length;continue}
      if(!redir)add(ch);
      w=(w||'')+ch;i++;
      continue;
    }
    if(ch==='#'&&w===null)break;
    if(ch==='('&&!PROFILE.noUnix&&blank()&&st.sub===undefined){ /* ( list ): a subshell, run as its own process (runSub); what is inside is read when it runs */
      var e=parenEnd(s,i);
      if(e<0)throw {syntax:'end',paren:'open'};
      st.sub=s.slice(i+1,e);add(s.slice(i,e+1));i=e+1;continue;
    }
    if(ch==='('&&!PROFILE.noUnix&&!PROFILE.dos&&w!==null&&!redir&&!/\$$/.test(w)&&!(PROFILE.bash&&!st.words.length&&/^[A-Za-z_]\w*(\[[^\]]*\])?\+?=$/.test(w)))endWord(); /* echo a(b): the ( ends the word, in all three (V7's ctype makes ( a metacharacter). Not $( or bash's x=( */
    if(ch==='('&&!PROFILE.noUnix&&w===null&&!redir&&!/^(\[\[|function)$/.test(st.words[0]||'')){ /* echo (a), (a) (b): a ( where no subshell can start */
      if(PROFILE.csh){ /* 4.3BSD's syn3: words beside a ( ) are Badly placed ()'s, a second ( ) Badly placed (, and syn0 says Too many ('s first. set, if, while and the like take ( ) as words */
        if(!/^(set|if|while|foreach|switch|exit|@|else)$/.test(st.words[0]||'')){
          if(st.sub!==undefined||st.paren)throw {syntax:'(',paren:'('};
          if((e=parenEnd(s,i))<0)throw {syntax:'end',paren:'open'};
          st.paren=true;add(s.slice(i,e+1));i=e+1;continue;
        }
      }
      else if(PROFILE.bash&&st.sub===undefined&&st.words.length===1&&/^\s*\S+\s*$/.test(st.src)){ /* bash: name ( is a function's start, so the token after the ( is the one it did not expect */
        var nx=s.slice(i+1).match(/^\s*(\|\||&&|;;|[|&;<>()]|[^\s|&;<>()]+)?/)[1];
        if(nx!==')')throw {syntax:nx||'newline'};
      }
      else throw {syntax:'('}; /* bash and V7: a ( after the words, or after a ( ) */
    }
    if(ch==='{'&&blank()&&st.sub===undefined&&(e=groupEnd(s,i))!==-1){ /* { list; }: the list, in this shell; a redirection after it is for all of it */
      if(e<0)throw {syntax:'end'};
      st.sub=s.slice(i+1,e);st.group=true;add(s.slice(i,e+1));i=e+1;continue;
    }
    if(two==='&&'||two==='||'){endList(two);i+=2;continue}
    if(ch==='|'){
      if(blank())throw {syntax:'|'}; /* | echo: no command before it */
      if((PROFILE.csh||PROFILE.bash)&&two==='|&'){st.both=true;i++} /* |&: the errors go down the pipe too */
      endStage('|');piped=true;i++;continue;
    }
    if(PROFILE.bash&&two==='&>'){endWord();redir=s.charAt(i+2)==='>'?'>>':'>';st.both=true;st.glass=false;i+=redir.length+1;continue} /* &> f, &>> f: errors and all */
    if(ch==='&'){if(blank())throw {syntax:'&'};endList(null);i++;continue} /* no background here: it just runs, and what follows is a command of its own */
    if(ch==='>'||ch==='<'){
      var fd=!PROFILE.csh&&w!==null&&!quoted&&!fromVar&&/^\d$/.test(w)?w:null; /* sh: 2> names a file descriptor, not an argument. csh has no such thing */
      if(fd!==null){w=null;st.raw=st.raw.slice(0,-1);st.src=st.src.slice(0,-1)}
      endWord();
      if(two==='>&'&&!PROFILE.csh&&/^[\d-](?=$|[\s|&<>])/.test(s.slice(i+2))){var to=s.charAt(i+2),one=fd===null||fd==='1';
        if(fd==='2'&&to==='1'){st.e2o=true;st.e2oFirst=st.out===null}else if(to==='2'&&one&&!st.e2o){st.glass=true;st.glassOld=false}else if(to==='-'&&one)st.closed=true;else if(to==='-'&&fd==='2')st.errClosed=true;
        i+=3;continue} /* 2>&1, 2>&-: errors are on the glass either way. >&2 sends the output there too */
      if(two==='>&'){redir='>';if(PROFILE.csh)st.both=true;i+=s.charAt(i+2)==='!'?3:2;continue} /* csh: >& file, errors and all */
      if(PROFILE.bash&&fd===null&&s.substr(i,3)==='<<<'){redir='<<<';i+=3;continue} /* <<< word: the word and a newline are its input */
      redir=two==='>>'?'>>':ch;
      i+=redir.length;
      if(PROFILE.csh&&redir==='>>'&&s.charAt(i)==='&'){st.both=true;i++}
      if(fd==='2'&&ch==='>')redir=redir==='>>'?'2>>':'2>'; /* errors go there */
      else if(fd!==null&&fd!=='1'&&ch==='>')redir=redir==='>>'?'n>>':'n>'; /* 0> or 3>: made, and nothing goes in it */
      else if(fd!==null&&fd!=='0'&&ch==='<')redir='n<'; /* 3<: opened, and not read */
      continue;
    }
    if(!redir)add(ch);
    if(ch==='\\'&&i+1<s.length){
      w=(w||'')+s.charAt(i+1);quoted=true;
      if(!redir)add(s.charAt(i+1));
      i+=2;continue;
    }
    if((ch==="'"||ch==='"')&&(close=ch==='"'&&!PROFILE.csh?closeDq(s,i):s.indexOf(ch,i+1))>=0){ /* a quote anywhere in a word: a"&"b is a&b */
      var inside=s.slice(i+1,close),given=inside;
      if(ch==='"')inside=varsIn(PROFILE.csh?inside:inside.replace(/\\([$`"\\\n])/g,function(m,x){return x==='\n'?'':guard(x)})); /* sh: inside "", a backslash quotes only $ ` " \ and a newline; csh's quotes have no backslash in them */
      w=(w||'')+inside;quoted=true;
      if(!redir)add(inside+ch,given+ch);
      i=close+1;continue;
    }
    if(ch==='$'&&!SYNCHK){
      var m=s.slice(i).match(VAR_AT);
      if(m){
        var val=envOf(m[1]);
        w=(w||'')+val;fromVar=true;
        if(!redir){st.raw=st.raw.slice(0,-1)+val;st.src+=m[0].slice(1)}
        i+=m[0].length;continue;
      }
    }
    w=(w||'')+ch;i++;
  }
  if(piped&&blank()&&!PROFILE.dos)throw {syntax:'end'}; /* echo x | and nothing after it */
  endList(null);
  return list;
}
function parenEnd(s,i){ /* the ) that closes the ( at i, outside quotes */
  for(var d=0,j=i,k;j<s.length;j++){
    var c=s.charAt(j);
    if(c==='\\'){j++;continue}
    if((k=quoteEnd(s,j))>=0){j=k;continue}
    if(c==='(')d++;else if(c===')'&&!--d)return j;
  }
  return -1;
}
function groups(){return !PROFILE.csh&&!PROFILE.dos&&!PROFILE.noUnix} /* sh and bash have { list; } */
function atCmd(s,i){return /(^|[;&|(){}\n]|(^|[\s;&|(){}])(do|then|else|elif|if|while|until|!))\s*$/.test(s.slice(0,i))} /* where a command starts: a { or } there is a reserved word */
function groupEnd(s,i){ /* the } that closes a { list; } at i: -1 when s[i] starts none, -2 when it is not closed. A } closes it only where
                           a command would start (after ; & or a newline), and a { opens one only there, followed by a blank */
  if(!groups()||s.charAt(i)!=='{'||!/^(\s|$)/.test(s.slice(i+1))||!atCmd(s,i))return -1;
  for(var d=0,j=i,k;j<s.length;j++){
    var c=s.charAt(j);
    if(c==='\\'){j++;continue}
    if((k=quoteEnd(s,j))>=0){j=k;continue}
    if(c==='#'&&(!j||/[\s;|&<>]/.test(s.charAt(j-1)))){var nl=s.indexOf('\n',j);if(nl<0)break;j=nl-1;continue} /* a comment, to the end of its line */
    if(c==='{'&&(j===s.length-1||/\s/.test(s.charAt(j+1)))&&atCmd(s,j))d++;
    else if(c==='}'&&/^($|[\s;&|<>)])/.test(s.slice(j+1))&&atCmd(s,j)&&!--d)return j;
  }
  return -2;
}
function runSub(text,lines){ /* in a step: ( list ), with its own directory, variables and aliases; its status is its last command's, or what its exit gave.
                                lines: a { list; } in a pipe, which is its own process too, read as the lines it was typed on */
  if(SUB>=32){noFork();return}
  var tree;
  try{tree=parseTree(lines||[text])}catch(e){synSay(e===MORE?syntaxError('end'):e.message);return}
  var back=keep(),was=SUBSH,loop=LOOP,shell=SHID,ld=LOOPD,g=GEN,job=ASIDE&&ASIDE.job;
  SUB++;SUBSH=SUB;SHID=++SHIDS;LOOPD=0;LOOP=null; /* its own process: what it starts with & are not this shell's jobs. Its $? is the shell's, as a fork's is */
  runBlock(tree);
  queue(function(){var st=STATUS;SUB--;SUBSH=was;SHID=shell;LOOP=loop;LOOPD=ld;back();if(job||g===GEN)STATUS=st},true);
}
function runGroup(text){ /* in a step: { list; } on its own, run by this shell: what it does to the directory and variables stays */
  var tree;
  try{tree=parseTree(text.split('\n'))}catch(e){synSay(e===MORE?syntaxError('end'):e.message);return}
  runBlock(tree);
}
function runPipeline(stages){
  var pipe=null,codes=[];
  stages.forEach(function(st,i){
    var last=i===stages.length-1,sink=null,keepSink,keepIn,keepErr,errs=null,epipe=null,ok=true,own=false,prefix=null,back=null,loop=null;
    queue(function(){
      keepSink=SINK;keepIn=STDIN;keepErr=ERRSINK;
      if(st.in!==null){
        var n=find(st.in);
        if(!n||n.type==='d'||n.prot){typeLine(PROFILE.bash?'bash: '+st.in+': '+(!n?'No such file or directory':n.prot?'Permission denied':'Is a directory'):st.in+(PROFILE.csh?': No such file or directory':': cannot open'),'err');pipe=[];ok=false;return}
        pipe=textOf(n);pipe.from=n; /* from: the file, which wc's widths look at */
      }
      if(st.here!==undefined)pipe=st.here.split('\n'); /* <<<: bash gives it a newline at its end */
      if(st.err!==null&&!writeFile(st.err,[],!!st.errApp)){oopsW('',st.err,st.err+': cannot create');pipe=[];ok=false;return}
      if(st.out!==null&&!writeFile(st.out,[],true)){if(PROFILE.csh&&!PROFILE.perror)typeLine(st.out+': Permission denied','err');else oopsW('',st.out,st.out+': cannot create');pipe=[];ok=false;return}
      if(st.out!==null&&!st.app)writeFile(st.out,[],false);
      for(var k=0;k<st.mk.length;k++)if(!writeFile(st.mk[k].f,[],st.mk[k].app)){oopsW('',st.mk[k].f,st.mk[k].f+': cannot create');pipe=[];ok=false;return}
      if(st.err!==null||st.errClosed)errs=[];
      var toGlass=st.glass&&(!errs||st.glassOld); /* >&2 2>f: the >&2 took the old 2 */
      if(st.glass&&!toGlass)SINK=errs; /* >&2 when 2 is a file */
      else{
        if(st.closed||(!last||st.out!==null)&&!toGlass)sink=[];
        if(toGlass)SINK=ERRSINK!==GLASS?ERRSINK:null; /* wherever errors go now: sh x 2>e, with echo y >&2 in x */
        else if(sink)SINK=sink;
      }
      if(sink&&!last&&st.out===null&&!st.closed){sink.cap=PIPEMAX;sink.pipe=newPipe(pipeReader(stages,i+1));sink.fed=sink.fedc=0} /* what the next stage reads */
      if(st.e2o&&st.e2oFirst&&st.out!==null)ERRSINK=last?keepSink||GLASS:epipe=[]; /* 2>&1 >f: errors where the output was before >f */
      else if(st.e2o||st.both)ERRSINK=SINK||GLASS;else if(errs)ERRSINK=errs;
      if(pipe)STDIN=pipe;
      if(stages.length>1){SUB++;own=true;loop=LOOP;if(!(PROFILE.csh&&last))back=keep()} /* a stage of a pipeline is its own process: a loop, read, cd or x=1 in it changes only that. csh runs the last one in the shell itself when it is one of its own commands (sh.sem.c forks a builtin only when it is piped out) */
      PIDNOW=null;
      if(JOB&&JOB.pids&&JOB.pids.length===stages.length){PIDNOW=JOB.pids[i];if(last)JOB.pids=null} /* ps & shows itself with the id the notice gave */
      if(st.sub!==undefined){if(!st.group)runSub(st.sub);else if(stages.length>1)runSub(st.sub,st.sub.split('\n'));else runGroup(st.sub);return}
      var nm=markNode(st.words[0]);
      if(nm&&nm.len===(st.words[0]||'').length){if(STDIN){var cp=STDIN.slice();cp.open=STDIN.open;STDIN=cp}runStmt(nm.node);return} /* its reads take the lines in turn, the last one perhaps with no newline */
      var A=/^([A-Za-z_]\w*)=([\s\S]*)$/,k=0;
      while((!k||!PROFILE.csh&&!PROFILE.dos)&&k<st.words.length&&A.test(st.words[k]))k++; /* csh and DOS: only a lone x=1 */
      if(k&&k===st.words.length){st.words.forEach(function(x){var m=x.match(A);ENV[m[1]]=m[2]});STATUS=0;return} /* x=1 y=2 */
      if(!k||PROFILE.csh||PROFILE.dos){runOne(st.raw,st.words,st.src);return}
      var cut=function(t,j){return t.slice(st.ends[k-1][j]).replace(/^\s+/,'')};
      prefix={}; /* X=2 cmd: X is 2 for cmd only, and its $X was worked out before that */
      st.words.slice(0,k).forEach(function(x){var m=x.match(A);if(!has(prefix,m[1]))prefix[m[1]]=has(ENV,m[1])?ENV[m[1]]:undefined;ENV[m[1]]=m[2]});
      runOne(unguard(cut(st.raw0,0)),st.words.slice(k),cut(st.src,1));
    });
    queue(function(){
      if(own){SUB--;if(back)back()}
      if(sink&&sink.broke&&LOOP==='exit')LOOP=loop; /* SIGPIPE ended that process only */
      if(prefix)Object.keys(prefix).forEach(function(n){if(prefix[n]===undefined)delete ENV[n];else ENV[n]=prefix[n]});
      codes[i]=STATUS;if(last)PIPEST=codes;
      if(!ok)return;
      if(st.out!==null&&sink&&!st.glass)writeFile(st.out,sink,true);
      if(st.err!==null&&errs)writeFile(st.err,errs,true);
      pipe=epipe||(st.out!==null||st.glass||st.closed?[]:sink);
      SINK=keepSink;STDIN=keepIn;ERRSINK=keepErr;
    },2); /* 2: in a killed job too, so that what it wrote stays in the file */
  });
}
function backtick(s,dq,done){ /* the first `command` outside single quotes. dq: starting inside "; done: what s carries straight on from, which decides a # at its very start */
  var a=-1,j,inDq=dq;
  for(var i=0;i<s.length;i++){
    var c=s.charAt(i);
    if(c==='\\'){i++;continue}
    if(c==='`'){
      if(a<0){a=i;inDq=dq}
      else return {a:a,b:i,cmd:s.slice(a+1,i),dq:inDq};
    }
    else if(a>=0)continue;
    else if(c==='#'&&!dq&&(i?/[\s;|&<>]/.test(s.charAt(i-1)):!done))return null; /* the rest is a comment */
    else if(c==='"')dq=!dq;
    else if(c==="'"&&!dq&&(j=s.indexOf("'",i+1))>=0)i=j;
  }
  return null;
}
function substitute(s,then,done,dq){ /* run every `command`, left to right, put what it printed in its place, then carry on.
                                     done: the text so far, which is not looked at again; dq: whether that left a " open */
  done=done||'';
  var m=PROFILE.dos?null:backtick(s,!!dq,done);
  if(!m){then(done+s);return}
  var sink=[],keepSink,keepIn,own=false,before=done+s.slice(0,m.a);
  queue(function(){if(SUB>=32){noFork();return}keepSink=SINK;keepIn=STDIN;SINK=sink;STDIN=null;SUB++;own=true;execLine(m.cmd)});
  queue(function(){if(!own)return;SINK=keepSink;STDIN=keepIn;SUB--},true);
  /* x=`command`, and csh's set x = `command`, are one word whatever it prints */
  queue(function(){substitute(s.slice(m.b+1),then,before+SEP+guard(sink.join(' '),/(^|\s)[A-Za-z_]\w*=$/.test(before)||PROFILE.csh&&/(^|&&|\|\||\))\s*set\s[^&|]*=\s*$/.test(before.replace(/"[^"]*"|'[^']*'/g,'q'))),m.dq)});
}
function andOr(s){ /* [{op,text}], split at && and || outside quotes, `commands`, ( ) and comments */
  var L=[],start=0,op=null,depth=0,j;
  for(var i=0;i<s.length;i++){
    var c=s.charAt(i),two=s.substr(i,2);
    if(c==='\\'){i++;continue}
    if((j=quoteEnd(s,i))>=0){i=j;continue}
    if(c==='#'&&(!i||/[\s;|&<>]/.test(s.charAt(i-1))))break;
    if(c==='{'&&!depth&&(j=groupEnd(s,i))>=0){i=j;continue}
    if(c==='(')depth++;else if(c===')')depth=Math.max(0,depth-1);
    else if(!depth&&(two==='&&'||two==='||')){L.push({op:op,text:s.slice(start,i)});op=two;start=i+2;i++}
  }
  L.push({op:op,text:s.slice(start)});
  return L;
}
function skipped(op){return op==='&&'?STATUS!==0:op==='||'&&STATUS===0} /* a && after a failure, a || after a success */
function isBack(seg){var p=splitCmds(seg);return p.length===2&&!p[1].trim()} /* the & is the split's own, not one in a comment */
var JOB=null,JOBS=0,LASTBG='',PIDNOW=null; /* JOB: the command now running in the background; JOBS: how many this line has started */
function tell(n){ /* the job's notice, once, when it starts: bash [1] and its last process, csh [1] and each of them, V7 sh just the id.
                     bash and sh say it only to someone typing; csh says it in a script too. n: its processes, when they are one pipeline */
  var j=JOB;
  if(!j||j.told||SUB!==j.level)return; /* not for a `command` inside it */
  j.told=true;
  var ids=newPids(n||1);
  j.pids=n?ids:null;LASTBG=String(ids[ids.length-1]);
  if(!PROFILE.csh&&(SCRIPTS||j.sub))return;
  typeLine(notice(control()?++JOBS:0,ids));
}
function newPids(n){var ids=[];for(var i=0;i<n;i++)ids.push(PH.newPid());return ids}
function notice(num,ids){return PROFILE.csh?'['+num+'] '+ids.join(' '):(PROFILE.bash?'['+num+'] ':'')+ids[ids.length-1]} /* a job's notice as it starts */
/* Background jobs. A job started with & at the shell's own level runs in a queue of its own beside the one queue (aside), with a
   copy of the shell's state that its steps swap in and out (procGet, procPut): it goes on while the visitor types, ^C does not
   reach it, and kill, wait, fg and bg do. Its notice comes when it starts; bash and csh say what has become of it before the next
   prompt, V7 sh says nothing (only, as its wait does, which ones a signal ended). A job that wants the terminal stops there, as
   SIGTTIN and SIGTTOU stop one, where there is job control (bash and csh at the prompt); where there is none (V7 sh, or a job
   started in a script) it reads /dev/null, and one that wants the screen just ends. */
var TABLE=[],JOBMAX=16,SHIDS=0,SHID=0,FGJOB=null,CUR={c:null,p:null},V7NOTE=[],WARNED=-9,RUNS=0; /* SHID: the shell a command runs in (0: the login shell) */
function procGet(){
  return {SINK:SINK,STDIN:STDIN,ERRSINK:ERRSINK,STATUS:STATUS,PREV:PREV,SUB:SUB,SCRIPTS:SCRIPTS,LOOP:LOOP,JOB:JOB,JOBS:JOBS,PIDNOW:PIDNOW,ARGS:ARGS,
    CURRENT:CURRENT,SOURCE:SOURCE,KEPT:KEPT,SHID:SHID,SUBSH:SUBSH,LOOPD:LOOPD,env:Object.assign({},ENV),vars:Object.assign(Object.create(null),CSHV),wds:Object.assign(Object.create(null),CSHW),cwd:ST.cwd,al:PH.aliases};
}
function procPut(c){
  SINK=c.SINK;STDIN=c.STDIN;ERRSINK=c.ERRSINK;STATUS=c.STATUS;PREV=c.PREV;SUB=c.SUB;SCRIPTS=c.SCRIPTS;LOOP=c.LOOP;JOB=c.JOB;JOBS=c.JOBS;PIDNOW=c.PIDNOW;ARGS=c.ARGS;
  CURRENT=c.CURRENT;SOURCE=c.SOURCE;KEPT=c.KEPT;SHID=c.SHID;SUBSH=c.SUBSH;LOOPD=c.LOOPD;refill(ENV,c.env);refill(CSHV,c.vars);refill(CSHW,c.wds);ST.cwd=c.cwd;PH.aliases=c.al;
}
function refill(o,from){for(var k in o)if(!Object.prototype.hasOwnProperty.call(from,k))delete o[k];Object.assign(o,from)}
function oneLine(t){return t.trim().replace(/\s+/g,' ')} /* a command as the job table and the loops' printer show it */
function pipeText(t){ /* the commands of a pipeline, split at its | (not ||), outside quotes and ( ) */
  return pipeRaw(t).map(oneLine);
}
function pipeRaw(t,keep){ /* the same, as typed; keep: each with the | after it */
  var L=[],start=0,depth=0,j;
  for(var i=0;i<t.length;i++){
    var c=t.charAt(i);
    if(c==='\\'){i++;continue}
    if((j=quoteEnd(t,i))>=0){i=j;continue}
    if(c==='{'&&!depth&&(j=groupEnd(t,i))>=0){i=j;continue}
    if(c==='(')depth++;else if(c===')')depth=Math.max(0,depth-1);
    else if(!depth&&c==='|'&&t.charAt(i+1)!=='|'&&t.charAt(i-1)!=='|'){var e=i+(t.charAt(i+1)==='&'?2:1);L.push(t.slice(start,keep?e:i));start=e}
  }
  L.push(t.slice(start));
  return L;
}
function liveJobs(){return TABLE.filter(function(j){return !j.over})}
function mine(){return TABLE.filter(function(j){return j.owner===SHID}).sort(function(a,b){return a.num-b.num})} /* this shell's jobs */
function control(){return PROFILE.bash||PROFILE.csh} /* job control: jobs, fg, bg, %n, and a job that wants the terminal stops */
function newJob(cmds,ids,o){ /* a job's entry in the table */
  var job={num:TABLE.reduce(function(m,j){return j.owner===SHID&&!j.kept?Math.max(m,j.num):m},0)+1,owner:SHID,
    pids:ids,cmds:cmds,state:'Running',code:0,sig:0,wd:ST.cwd,start:now(),wakers:[],resume:[],noted:true,born:RUNS,parent:ASIDE&&ASIDE.job||null,
    control:!!control()&&!SCRIPTS&&!SHID,ps:o&&o.ps||cmds.map(function(c){return /^\(/.test(c)?shellName():c}),pend:[]}; /* ps: a ( list ) is a forked shell */
  job.text=job.cmds.join(' | ');
  job.done=new Promise(function(r){job.fin=r});
  return job;
}
function jobWords(c){ /* a command as the job table shows it: ( list ) spaced out, as bash's and csh's printers do */
  var k=markNode(c);
  if(k)return compText(k.node,'').join('\n')+c.slice(k.len); /* a loop as bash prints it, then | cat */
  return PROFILE.bash?redirWords(jobWords0(c)):jobWords0(c);
}
function redirWords(t){ /* bash's print_redirection: 2>/dev/null as 2> /dev/null, outside quotes; 2>&1 as it is */
  return t.replace(/(\\[\s\S]|'[^']*'|"(?:[^"\\]|\\[\s\S])*")|(^|\s)(\d*(?:>>|>|<<<|<))(?![&>(<])\s*(?=\S)/g,function(m,q,sp,op){return q?q:sp+op+' '});
}
function jobWords0(c){
  var e=c.charAt(0)==='('?parenEnd(c,0):-1,rest=e<0?'':oneLine(c.slice(e+1)); /* ( list ) > f: the redirection after it, as both printers do */
  if(e<0||rest&&!/^\d*[<>]/.test(rest))return c;
  var L=splitCmds(c.slice(1,e)).map(oneLine).filter(Boolean).map(subWords);
  return '( '+L.map(function(x,i){ /* bash: a & b; csh's padd leaves the & out: a; b */
    var bg=/(^|[^\\])(\\\\)*&$/.test(x);if(PROFILE.csh&&bg)x=x.replace(/\s*&$/,''); /* echo \& is no background */
    return i<L.length-1?x+(bg&&!PROFILE.csh?' ':'; '):x;
  }).join('')+' )'+(rest?' '+rest:'');
}
function subWords(t){ /* a command of a ( list ): its own ( ) spaced out too, as the printers do all the way down */
  return andOr(t).map(function(p){return (p.op?p.op+' ':'')+pipeRaw(p.text).map(function(x){return jobWords(oneLine(x))}).join(' | ')}).join(' ');
}
function loginShell(){return procTable().filter(function(p){return p.mine&&/(^|[\/-])(ba|c)?sh$/.test(p.cmd)})[0]} /* the login shell's row in ps */
function shellName(){var r=loginShell();return r?r.cmd:PROFILE.bash?'-bash':PROFILE.csh?'-csh':'-sh'} /* a forked shell: ps shows it as the login shell */
function startJob(text,o){ /* in a step of the shell: text &. o.run: what it runs instead of text, o.shown: what the table shows (a loop) */
  o=o||{};
  if(liveJobs().length>=JOBMAX){noFork();return} /* the fork fails, as it does past the process limit */
  var cmds=o.shown?[o.shown]:pipeText(text).map(jobWords),one=!!o.shown||andOr(text).length<2,ids=newPids(one?cmds.length:1);
  var job=newJob(one?cmds:[oneLine(text)],ids,o.shown?{ps:[shellName()]}:null);
  LASTBG=String(ids[ids.length-1]);
  if(PROFILE.csh||!SCRIPTS&&!(PROFILE.bash&&SUBSH))typeLine(notice(job.num,ids)); /* bash and sh say it only to someone typing; csh in a script too */
  var c=procGet();
  c.SUB=1;c.JOB={sub:false,level:1,told:true,pids:one?ids.slice():null};c.KEPT=[];c.LOOP=null;c.PIDNOW=null;c.SHID=++SHIDS;
  if(!job.control&&!c.STDIN)c.STDIN=[]; /* no job control: it reads /dev/null */
  job.ctx=c;
  TABLE.push(job);
  if(job.owner===0)current(job,'new');
  job.side=aside(o.run||function(){execSeg(text)},job);
  job.side.p.then(function(){ended(job)});
  STATUS=0;
}
/* ^Z. A pipeline typed at the shell's own level runs in the one queue as ever; ^Z makes it a stopped job there and then: its steps
   from then on are the job's (queue looks up pr.job), with the state it had, and the shell goes on with the state it had when the
   pipeline started. bash goes on with the rest of the line (status 148) but leaves any loop; csh's pjwait drops the rest of the line */
function fgProc(item,run){ /* in a step: item {stages} or {text}, run() runs it */
  var lone=item.stages&&item.stages.length===1&&MARKP.test(item.stages[0].words[0]||''); /* a loop only redirected runs in the shell: its own pipelines are the ones ^Z stops */
  if(!control()||ASIDE||SUB||SCRIPTS||lone||inner&&inner.proc){run();return}
  var pr={job:null,wakers:[],item:item,over:false};
  queue(function(){
    FGP=pr;inner.proc=pr;pr.sc=inner;pr.snap=procGet();pr.kept=KEPT.length;
    inner.race=new Promise(function(r){pr.detach=r});
    run();
  });
  queue(function(){if(FGP===pr)FGP=null;pr.over=true;if(pr.job)suspended(pr.job)},true);
}
var NOSTOP=/^(read|wait|fg|bg|%.*|source|\.|exit|logout)$/; /* the shell's own commands: the shell sets ^Z aside */
function procOf(pr){ /* at a ^Z: the foreground pipeline's commands as the job table shows them, and the command NOSTOP looks at */
  var it=pr.item,word;
  if(!it.stages)word=firstWord(it.text.trim());
  else if(it.stages.length>1)word='';
  else word=it.stages[0].words[0]||'';
  return {cmds:it.stages?it.stages.map(function(st){return jobWords(oneLine(st.text))}):[oneLine(it.text)],word:word};
}
function procJob(pr){ /* the foreground pipeline pr as a job, now */
  var cmds=procOf(pr).cmds;
  var c=procGet();c.KEPT=KEPT.slice();c.SUB++;c.SHID=++SHIDS;c.JOB=null;
  KEPT.length=pr.kept;procPut(pr.snap); /* the shell as it was */
  var job=newJob(cmds,newPids(cmds.length));
  job.control=true;job.wakers=pr.wakers;job.side={job:job,p:Promise.resolve(),stopped:false};
  job.ctx=c;
  TABLE.push(job);pr.job=job;
  Promise.resolve(pr.sc.p).then(function(){ended(job)});
  return job;
}
function tstp(){ /* ^Z: the foreground job stops, and the shell takes the terminal back */
  if(!control())return false;
  if(bufNode&&!READ&&!KEYS)return true; /* at the prompt: nothing */
  var job=FGJOB,pr=FGP,h=TTYH;
  if(!job&&(!pr||pr.over||pr.job))return true;
  if(!job&&NOSTOP.test(procOf(pr).word)){if(PROFILE.bash)zEcho();return true} /* the shell sets it aside; the tty still echoes it */
  if(!job)job=procJob(pr);
  if(job.over)return true;
  atCursor('^Z');
  if(FGJOB===job)FGJOB=null;
  job.fg=false;job.state='Stopped';job.sig=SIG.TSTP;job.noted=true;job.code=128+SIG.TSTP;
  current(job,PROFILE.bash?'fg':'stop');
  if(owns(job,h)){job.tty=h;letGo(h);h.hide()}
  if(job.release)job.release();
  if(pr&&pr.job===job)pr.detach();
  return true;
}
function suspended(job){ /* in a step of the shell, after the ^Z: bash's [1]+ Stopped, csh's Stopped */
  var k=SINK;SINK=null; /* on the glass, whatever the loop it was in writes to */
  if(PROFILE.csh){GEN++;typeLine(why(job)+wdNote(job,' '));queue(function(){SINK=k;STATUS=1});return} /* pjwait's pprint(AREASON|SHELLDIR), then pintr1's error() */
  jobRows(job,'').forEach(function(r){typeLine(r)});
  queue(function(){SINK=k});
  STATUS=128+SIG.TSTP;
  if(LOOPD)LOOP='stop'; /* out of every loop it is in */
}
function ended(job){ /* it has run to its end, or a signal ended it */
  if(job.over)return;
  job.over=true;
  if(!job.dead){job.state='Done';job.code=job.ctx.STATUS}
  if(job.tty){job.tty.kill();job.tty=null} /* a screen put aside by ^Z goes with it */
  if(owns(job,TTYH)){var h=TTYH;letGo(h);h.kill()} /* and so does the one it has now: the shell has the terminal back */
  if(job.release)job.release();
  job.wakers.slice().forEach(function(w){w()});
  resumeJob(job,false);
  var fg=job===FGJOB;
  if(job.owner===0&&control()&&!fg){job.noted=false;if(PROFILE.csh)current(job,'end')} /* said before the next prompt */
  else if(job.owner===0&&!control()&&job.sig)V7NOTE.push(job); /* V7 sh: the next wait says which signal ended it */
  if(job.owner!==0){ /* a script's: kept for its wait, as many as fit */
    var old=TABLE.filter(function(j){return j.kept});
    if(old.length>=50)TABLE.splice(TABLE.indexOf(old[0]),1);
    job.kept=true;
  }
  else if(!control()||fg)drop(job);
  job.fin();
}
function drop(job){ /* out of the table: told, waited for, or ended in the foreground */
  var i=TABLE.indexOf(job);if(i<0)return;
  TABLE.splice(i,1);
  if(job.owner===0)current(job,'drop');
}
function resumeJob(job,go){ /* fg, bg, SIGCONT; go false: it was killed */
  if(go&&job.over)return; /* csh's bg %1 on one that has ended: nothing to start */
  if(go&&job.pend.length){killJob(job,Math.min.apply(null,job.pend));return} /* a signal it got while stopped: the lowest comes first */
  if(go&&job.tty&&!job.fg){stopJob(job,SIG[job.tty.out?'TTOU':'TTIN']);return} /* in the background, a screen or a read it was at stops it again */
  if(go)job.state='Running';
  job.resume.splice(0).forEach(function(r){r(go)});
}
function killJob(job,n){job.dead=true;job.sig=n;job.state='Killed';job.code=128+n;ended(job)}
function stopWait(job){return new Promise(function(r){job.resume.push(r)})}
function stopJob(job,sig){ /* SIGSTOP, SIGTSTP, SIGTTIN, SIGTTOU: its next step waits */
  job.state='Stopped';job.sig=sig;job.noted=false;
  if(job.owner===0)current(job,'stop');
}
function ttyStop(job){ /* it wants the terminal: it stops until fg (true), or ends (false) */
  if(job.dead)return Promise.resolve(false);
  if(!job.control){job.dead=true;job.state='Done';ended(job);return Promise.resolve(false)} /* no job control: nothing stops it, and it cannot have the screen */
  stopJob(job,SIG[TTYWHY==='output'?'TTOU':'TTIN']);
  return stopWait(job);
}
var TTYWHY='input';
function ttyWant(why){ /* a read or the full screen: in a background job, false for none and true for /dev/null, or it throws TTY to stop */
  var j=ASIDE&&ASIDE.job;
  if(!j||j.fg)return false;
  if(j.control||why!=='input'){TTYWHY=why;throw TTY}
  return true;
}
function current(job,what){ /* the + and - jobs: bash's set_current_job and reset_current, csh's palloc, pchild and pclrcurr */
  var T=TABLE.filter(function(j){return j.owner===0});
  function inT(j){return j&&T.indexOf(j)>=0}
  if(PROFILE.csh){
    if(what==='new'){if(!CUR.c)CUR.c=job;else if(!CUR.p)CUR.p=job;return}
    if(what==='stop'){if(CUR.c&&CUR.c!==job)CUR.p=CUR.c;CUR.c=job;return}
    var get=function(){ /* pgetcurr: the newest job that is not this one or the current one, a stopped one first */
      var x=null,L=T.slice().reverse();
      for(var i=0;i<L.length;i++)if(L[i]!==CUR.c&&L[i]!==job&&!L[i].over){if(L[i].state==='Stopped')return L[i];if(!x)x=L[i]}
      return x;
    };
    if(job===CUR.c){if(CUR.p){CUR.c=CUR.p;CUR.p=get()}else{CUR.c=get();CUR.p=get()}}
    else if(job===CUR.p)CUR.p=get();
    return;
  }
  function last(state,below){var x=null;T.forEach(function(j){if(j.state===state&&(!below||j.num<below.num))x=j});return x}
  function set(j){ /* set_current_job */
    if(CUR.c!==j){CUR.p=CUR.c;CUR.c=j}
    if(CUR.p!==CUR.c&&inT(CUR.p)&&CUR.p.state==='Stopped')return;
    var k=CUR.c.state==='Stopped'?last('Stopped',CUR.c):null;
    if(k){CUR.p=k;return}
    k=CUR.c.state==='Running'?last('Running',CUR.c):last('Running',null);
    CUR.p=k||CUR.c;
  }
  if(what==='new'||what==='fg'){set(job);return}
  if(what==='drop'&&job!==CUR.c&&job!==CUR.p)return;
  var k=inT(CUR.c)&&CUR.c.state==='Stopped'?CUR.c:inT(CUR.p)&&CUR.p.state==='Stopped'?CUR.p:last('Stopped',null)||last('Running',null); /* reset_current */
  if(k)set(k);else CUR.c=CUR.p=null;
}
/* the signals: number, name, what a job it ended or stopped says. bash's are Linux's (glibc's strsignal), csh's 4.3BSD's (its mesg[]),
   IRIX's its own numbering (signal.h, the MIPS ABI's) with Berkeley's words, V7's its own sysmsg[], which has nothing for INT and PIPE */
var SIGNALS=PROFILE.signals==='irix'?'1 HUP Hangup|2 INT Interrupt|3 QUIT Quit|4 ILL Illegal instruction|5 TRAP Trace/BPT trap|6 ABRT Abort|7 EMT EMT trap|8 FPE Floating exception|9 KILL Killed|10 BUS Bus error|11 SEGV Segmentation fault|12 SYS Bad system call|13 PIPE Broken pipe|14 ALRM Alarm clock|15 TERM Terminated|16 USR1 User defined signal 1|17 USR2 User defined signal 2|18 CHLD Child exited|19 PWR Power failure|20 WINCH Window size changed|21 URG Urgent I/O condition|22 POLL I/O possible|23 STOP Stopped (signal)|24 TSTP Stopped|25 CONT Continued|26 TTIN Stopped (tty input)|27 TTOU Stopped (tty output)|28 VTALRM Virtual timer expired|29 PROF Profiling timer expired|30 XCPU Cputime limit exceeded|31 XFSZ Filesize limit exceeded'
  :PROFILE.bash?'1 HUP Hangup|2 INT Interrupt|3 QUIT Quit|4 ILL Illegal instruction|5 TRAP Trace/breakpoint trap|6 ABRT Aborted|7 BUS Bus error|8 FPE Floating point exception|9 KILL Killed|10 USR1 User defined signal 1|11 SEGV Segmentation fault|12 USR2 User defined signal 2|13 PIPE Broken pipe|14 ALRM Alarm clock|15 TERM Terminated|16 STKFLT Stack fault|17 CHLD Child exited|18 CONT Continued|19 STOP Stopped (signal)|20 TSTP Stopped|21 TTIN Stopped (tty input)|22 TTOU Stopped (tty output)|23 URG Urgent I/O condition|24 XCPU CPU time limit exceeded|25 XFSZ File size limit exceeded|26 VTALRM Virtual timer expired|27 PROF Profiling timer expired|28 WINCH Window changed|29 IO I/O possible|30 PWR Power failure|31 SYS Bad system call'
  :PROFILE.csh?'1 HUP Hangup|2 INT Interrupt|3 QUIT Quit|4 ILL Illegal instruction|5 TRAP Trace/BPT trap|6 IOT IOT trap|7 EMT EMT trap|8 FPE Floating exception|9 KILL Killed|10 BUS Bus error|11 SEGV Segmentation fault|12 SYS Bad system call|13 PIPE Broken pipe|14 ALRM Alarm clock|15 TERM Terminated|16 URG Urgent I/O condition|17 STOP Stopped (signal)|18 TSTP Stopped|19 CONT Continued|20 CHLD Child exited|21 TTIN Stopped (tty input)|22 TTOU Stopped (tty output)|23 IO I/O possible|24 XCPU Cputime limit exceeded|25 XFSZ Filesize limit exceeded|26 VTALRM Virtual timer expired|27 PROF Profiling timer expired|28 WINCH Window size changed|29 - Signal 29|30 USR1 User defined signal 1|31 USR2 User defined signal 2'
  :'1 HUP Hangup|2 INT |3 QUIT Quit|4 ILL Illegal instruction|5 TRAP Trace/BPT trap|6 IOT IOT trap|7 EMT EMT trap|8 FPE Floating exception|9 KILL Killed|10 BUS Bus error|11 SEGV Memory fault|12 SYS Bad system call|13 PIPE |14 ALRM Alarm call|15 TERM Terminated';
var SIG={};SIGNALS.split('|').forEach(function(x){var m=x.match(/^(\d+) (\S+) ?(.*)$/);SIG[m[1]]={name:m[2],says:m[3]};if(m[2]!=='-')SIG[m[2]]=+m[1]});
if(PROFILE.signals==='irix'){SIG.IOT=6;SIG.CLD=18;SIG.IO=22;SIG[19].none=true} /* the other names signal.h gives them; PWR's default is to ignore it */
if(PROFILE.bash)for(var RT=34;RT<=64;RT++){ /* glibc's real-time signals, SIGRTMIN (34) to SIGRTMAX (64), named as bash's kill -l names them */
  var rn=RT===34?'RTMIN':RT===64?'RTMAX':RT<50?'RTMIN+'+(RT-34):'RTMAX-'+(64-RT);
  SIG[RT]={name:rn,says:'Real-time signal '+(RT-34)};SIG[rn]=RT;
}
function sigDo(n){ /* what it does to a job that has not set it aside: stop, cont, none or end */
  var s=SIG[n]||{},x=s.name;
  return /^(STOP|TSTP|TTIN|TTOU)$/.test(x)?'stop':x==='CONT'?'cont':/^(CHLD|URG|WINCH)$/.test(x)||x==='IO'&&!PROFILE.bash||s.none||!n?'none':'end';
}
function cored(n){return !PROFILE.bash&&/^(QUIT|ILL|TRAP|IOT|ABRT|EMT|FPE|BUS|SEGV|SYS)$/.test((SIG[n]||{}).name)} /* Debian keeps no core (ulimit -c 0); 4.3BSD, IRIX and V7 do */
function signal(job,n,group){ /* send signal n to the job; group: to its process group, as kill %n and the tty do, which takes in the jobs started inside it */
  if(group)TABLE.filter(function(j){for(var p=j.parent;p;p=p.parent)if(p===job)return !j.control;return false}).forEach(function(j){signal(j,n)}); /* without job control of their own, they are in its group */
  var d=sigDo(n),renote=PROFILE.bash&&group&&job.owner===0; /* bash hears of a stopped job's signal, and says so before the prompt */
  if(job.over||d==='none')return;
  if((n===2||n===3)&&!job.control)return; /* started without job control: & set INT and QUIT aside */
  if(d==='cont'){if(job.state==='Stopped')resumeJob(job,true);return}
  if(d==='stop'){
    if(control()&&job.state!=='Stopped')stopJob(job,n);
    else if(renote)job.noted=false; /* stopped again: bash hears of it, and says so before the prompt */
    return;
  }
  if(job.state==='Stopped'&&n!==SIG.KILL&&!((n===SIG.TERM||n===SIG.HUP)&&(group||PROFILE.csh))){ /* it waits for a SIGCONT: kill %n and csh's kill send one after TERM and HUP */
    if(job.pend.indexOf(n)<0)job.pend.push(n);
    if(renote)job.noted=false; /* bash hears of it again, and says so */
    return;
  }
  if(renote&&job.state==='Stopped')job.restop=true; /* kill_pid clears J_NOTIFIED: before the prompt bash says again that it is stopped, and that it ended before the next */
  killJob(job,n);
}
function polite(d){var h=ST.home;return d===h?'~':d.indexOf(h+'/')===0?'~'+d.slice(h.length):d} /* bash's polite_directory_format, csh's dtildepr */
function why(job){ /* what the job's status says: bash's printable_job_status, csh's pprint reasons. null: csh says nothing for INT */
  var s=job.state;
  if(PROFILE.csh)return s==='Running'?'Running ':s==='Stopped'?SIG[job.sig].says:s==='Done'?(job.code?'Exit '+String(job.code).padEnd(16):'Done'):job.sig===2?null:SIG[job.sig].says;
  return s==='Running'||s==='Stopped'?s:s==='Done'?(job.code?'Exit '+job.code:'Done'):SIG[job.sig].says;
}
function markOf(job){return job===CUR.c?'+':job===CUR.p?'-':' '}
function cshPre(job){return '['+job.num+']'+(job.num<10?' ':'')+' '+markOf(job)+' '} /* csh's [n] and its mark */
function wdNote(job,sep){return job.wd!==ST.cwd?sep+'(wd: '+polite(job.wd)+')':''} /* where it was started, when that is not here */
function jobRows(job,how){return [].concat.apply([],rowsOf(job,how).map(function(r){return r.split('\n')}))} /* a loop's text has lines of its own */
function rowsOf(job,how){ /* how: '' as jobs and the notices print it, 'l' with the ids, 'p' only the id */
  var mark=markOf(job),w=why(job),R=[],core=job.state==='Killed'&&cored(job.sig)?' (core dumped)':'';
  if(how==='p')return [String(job.pids[0])];
  if(PROFILE.csh){
    var pre=cshPre(job),dir=how==='l'?wdNote(job,' '):'';
    if(how!=='l')return [pre+(w===null?'':w.padEnd(21))+job.text+core];
    job.cmds.forEach(function(c,i){var end=i===job.cmds.length-1;R.push((i?'       ':pre)+String(job.pids[i]||job.pids[0]).padStart(5)+' '+(w===null?'':(i?'':w).padEnd(21))+c+(end?core+dir:' |'))});
    return R;
  }
  var tail=(job.state==='Running'?' &':'')+wdNote(job,'  ');
  if(how!=='l')return ['['+job.num+']'+mark+'  '+w.padEnd(24)+job.text+tail];
  job.cmds.forEach(function(c,i){R.push(i?'     '+String(job.pids[i]).padStart(5)+' '+''.padEnd(22)+'| '+c+(i===job.cmds.length-1?tail:''):'['+job.num+']'+mark+' '+String(job.pids[0]).padStart(5)+' '+w.padEnd(24)+c+(job.cmds.length===1?tail:''))});
  return R;
}
function due(j){return j.owner===0&&!j.noted&&j.born!==RUNS} /* the shell finds out at the prompt after the one its line was typed at, as the child's exit comes after the prompt is out */
function notesDue(){return control()&&TABLE.some(due)}
function jobNotes(){ /* before a prompt: what has become of the jobs since the last one. bash in job order, csh newest first */
  var L=TABLE.filter(due),dir=ST.cwd,moved=false,gone=[];
  if(PROFILE.csh)L.reverse();
  L.forEach(function(j){
    if(j.restop){var s=j.state;j.restop=false;j.state='Stopped';typeLine('');jobRows(j,'').forEach(function(r){typeLine(r)});j.state=s;return} /* killed while stopped: still Stopped, as far as bash has heard */
    j.noted=true;
    if(PROFILE.bash&&j.state==='Stopped')typeLine(''); /* notify_of_job_status: a newline first */
    jobRows(j,'').forEach(function(r){typeLine(r)});
    if(PROFILE.bash&&j.state!=='Stopped'&&j.wd!==dir)moved=true;
    if(j.state!=='Stopped'){if(PROFILE.csh)drop(j);else gone.push(j)} /* csh's pnote flushes each as it goes; bash's cleanup_dead_jobs comes after them all, so the marks it prints are the ones from before */
  });
  gone.forEach(drop);
  if(moved)typeLine('(wd now: '+polite(dir)+')');
}
function v7Notes(){ /* V7 sh's await: each child a signal ended, as it is reaped: its id and sysmsg[] (and a bare newline for INT) */
  V7NOTE.splice(0).forEach(function(j){var m=SIG[j.sig].says;typeLine(m?j.pids[j.pids.length-1]+' '+m+(cored(j.sig)?' - core dumped':''):'')});
}
function findJob(w,who){ /* a job spec: %n %+ %% %- %name %?text (bash's fg, bg and jobs take n without the %). {job} or {err} */
  var T=mine(),bare=/^\d+$/.test(w||'');
  function no(m){return {err:PROFILE.csh?who+': '+m+'.':'bash: '+who+': '+m}}
  if(w===undefined||w==='%'||w==='%%'||w==='%+'){var c=T.indexOf(CUR.c)>=0?CUR.c:null;return c?{job:c}:PROFILE.csh?no('No current job'):no((w||'current')+': no such job')}
  if(w==='%-'||PROFILE.csh&&w==='%#'){var p=T.indexOf(CUR.p)>=0?CUR.p:null;return p?{job:p}:PROFILE.csh?no('No previous job'):no(w+': no such job')}
  var x=w.replace(/^%/,'');
  if(/^\d+$/.test(x)&&(w.charAt(0)==='%'||bare)){var k=T.filter(function(j){return j.num===+x})[0];return k?{job:k}:no(PROFILE.csh?'No such job':w+': no such job')}
  var q=x.charAt(0)==='?',hits=T.filter(function(j){return q?j.text.indexOf(x.slice(1))>=0:j.text.indexOf(x)===0});
  if(hits.length>1)return no(PROFILE.csh?'Ambiguous':w+': ambiguous job spec');
  if(!hits.length)return no(PROFILE.csh?(q?'No job matches pattern':'No such job'):w+': no such job');
  return {job:hits[0]};
}
function typeLines(s){s.split('\n').forEach(function(l){typeLine(l)})} /* a job's text: a loop's has lines of its own */
function fgJob(job){ /* in a step: the job has the terminal until it ends or ^Z stops it; ^C kills it */
  typeLines(job.text+wdNote(job,PROFILE.csh?' ':'\t'));
  queue(function(){
    if(job.over)return;
    FGJOB=job;job.fg=true;job.noted=true;
    if(PROFILE.bash)current(job,'fg');
    if(job.tty){var h=job.tty;job.tty=null;TTYH=h;h.show()} /* the screen or the read it was at, back as it was */
    resumeJob(job,true);
    return new Promise(function(r){job.release=r;job.done.then(r)});
  });
  queue(function(){
    job.release=null;if(FGJOB===job)FGJOB=null;
    if(!job.over&&job.state==='Stopped'){suspended(job);return} /* ^Z again */
    var m=job.state==='Killed'&&job.sig!==SIG.INT&&job.sig!==SIG.PIPE?why(job):null; /* killed in the foreground: bash and csh say by what (not for INT and PIPE), as for any command */
    if(m)typeLine(m.trim()+(cored(job.sig)?' (core dumped)':''));
    drop(job);STATUS=job.code;
  },true);
}
function bgJob(job){ /* bg: a stopped job goes on in the background (and stops again if it still wants the terminal) */
  if(PROFILE.bash&&job.state==='Running'){typeLine('bash: bg: job '+job.num+' already in background','err');queue(function(){STATUS=0});return}
  if(PROFILE.csh)current(job,'end');
  var mark=markOf(job);
  typeLines((PROFILE.csh?cshPre(job):'['+job.num+']'+(mark===' '?' ':mark+' '))+job.text+' &');
  resumeJob(job,true);
}
function waitJobs(L){ /* in a step: until each has ended; ^C stops the waiting, not the jobs */
  return new Promise(function(r){
    var live=L.filter(function(j){return !j.over}),left=live.length,W=wakeList(); /* a job's own wait: the foreground's ^C does not end it */
    function done(){var i=W.indexOf(stop);if(i>=0)W.splice(i,1);r()}
    function stop(){left=-1;done()}
    if(!left){r();return}
    W.push(stop);
    live.forEach(function(j){j.done.then(function(){if(left>0&&!--left)done()})}); /* only the jobs still running count down */
  });
}
function jobCmd(name,a,raw,words){ /* jobs, fg, bg, kill, wait and %n */
  var W=words.slice(1),bash=PROFILE.bash,csh=PROFILE.csh;
  function err(m){typeLine(m,'err')}
  function noCtl(){if(SHID===0&&!SCRIPTS)return false;err(csh?SUB?'No job control in subshells.':'No job control in this shell.':'bash: '+name+': no job control');return true}
  if(name==='jobs'){
    var how='',only=null;
    if(csh){if(W.length>1){err('jobs: Too many arguments.');return}if(W.length&&W[0]!=='-l'){err('Usage: jobs [ -l ].');return}how=W.length?'l':'';W=[]}
    else{
      while(W.length&&/^-./.test(W[0])&&W[0]!=='--'){var o=W.shift();for(var i=1;i<o.length;i++){var f=o.charAt(i);
        if('lpnrs'.indexOf(f)<0){err('bash: jobs: -'+f+': invalid option');err('jobs: usage: jobs [-lnprs] [jobspec ...] or jobs -x command [args]');queue(function(){STATUS=2});return}
        if(f==='l'||f==='p')how=f;else only=f}}
      if(W[0]==='--')W.shift();
    }
    if(WARNED===RUNS-1)WARNED=RUNS; /* a jobs between: exit goes */
    var L=[];
    if(W.length)W.forEach(function(w){var r=findJob(w,'jobs');if(r.err)err(r.err);else L.push(r.job)});
    else L=mine().filter(function(j){return only==='r'?j.state==='Running':only==='s'?j.state==='Stopped':only==='n'?!j.noted:true});
    L.forEach(function(j){jobRows(j,how).forEach(function(r){typeLine(r)});j.noted=true;if(j.over)drop(j)});
    return;
  }
  if(name==='fg'||name==='bg'||name==='%'){
    if(noCtl())return;
    if(name==='%'){ /* %n is fg, as csh's dofg1 and bash have it */
      var r0=findJob(raw.trim().split(/\s+/)[0],csh?'%job':'fg');
      if(r0.err)err(r0.err);else if(bash&&r0.job.over)err('bash: fg: job has terminated');else fgJob(r0.job);
      return;
    }
    var specs=W.length?W:[undefined];
    if(name==='fg'&&bash)specs=specs.slice(0,1);
    specs.forEach(function(w){
      queue(function(){
        var r=findJob(w,name);
        if(r.err){err(r.err);return}
        if(bash&&r.job.over){err('bash: '+name+': job has terminated');return} /* start_job: its Done comes before the next prompt */
        if(name==='fg')fgJob(r.job);else bgJob(r.job);
      });
    });
    return;
  }
  if(name==='wait'){ /* bash: each id or job in turn, its status the last one's; with none, all of them, and 0. csh and V7: all of them */
    if(csh&&W.length){err('wait: Too many arguments.');return}
    var all=!W.length||!bash,got=[];
    if(!all)W.forEach(function(w){
      if(/^%/.test(w)){var r=findJob(w,'wait');if(r.err)err(r.err);got.push(r.job||null);return}
      if(!/^\d+$/.test(w)){err("bash: wait: `"+w+"': not a pid or valid job spec");got.push(null);return}
      var k=mine().filter(function(j){return j.pids.indexOf(+w)>=0})[0];
      if(!k)err('bash: wait: pid '+w+' is not a child of this shell');
      got.push(k||null);
    });
    else got=mine().filter(function(j){return j.state!=='Stopped'}); /* stopped jobs are not waited for (bash; csh's dowait loops only while one runs) */
    var J=got.filter(Boolean);
    var v7w=!bash&&!csh,g=GEN,ran=false;
    queue(function(){ran=true;return waitJobs(J)});
    queue(function(){
      if(!ran)return; /* ^C before it began */
      if(!J.every(function(j){return j.over})){if(v7w&&g!==GEN)STATUS=0;else STATUS=130;return} /* ^C. V7's await: wait(2) fails with EINTR and returns -1, the entry its post(-1) added, so rc stays 0 and exitval is 0 */
      if(!control())v7Notes();
      J.forEach(function(j){j.noted=true;drop(j)});
      if(bash&&all)mine().forEach(function(j){if(j.over){j.noted=true;drop(j)}}); /* mark_dead_jobs_as_notified */
      var last=got[got.length-1];
      STATUS=all?(bash||csh?0:(J.filter(function(j){return j.code})[0]||{code:0}).code):last?last.code:127; /* V7: the first that failed */
    },v7w);
    return;
  }
  /* kill */
  var n=15,v7=!bash&&!csh;
  if(!W.length){err(bash?'kill: usage: kill [-s sigspec | -n signum | -sigspec] pid | jobspec ... or kill -l [sigspec]':csh?'kill: Too few arguments.':'usage: kill [ -signo ] pid ...');if(!csh)queue(function(){STATUS=2});return}
  var o1=W[0];
  if(o1==='-l'&&!v7){ /* the signals: bash's display_signal_list (and its real-time ones), csh's names, sixteen to a line */
    if(csh){var N=[];for(var q=1;q<=31;q++)N.push(SIG[q].name==='-'?'':SIG[q].name+' ');typeLine(N.slice(0,16).join(''));typeLine(N.slice(16).join(''));return}
    if(W[1]!==undefined){W.slice(1).forEach(function(x){var v=/^\d+$/.test(x)?SIG[+x>128?+x-128:+x]:SIG[x.toUpperCase().replace(/^SIG/,'')];if(v===undefined)err('bash: kill: '+x+': invalid signal specification');else typeLine(typeof v==='number'?String(v):v.name)});return}
    var row='',col=0;
    for(var q2=1;q2<=64;q2++){
      if(!SIG[q2])continue; /* 32 and 33: glibc keeps them */
      row+=String(q2).padStart(2)+') SIG'+SIG[q2].name;
      if(++col<5)row+='\t';else{typeLine(row);row='';col=0}
    }
    if(col)typeLine(row);
    return;
  }
  if(/^-/.test(o1)&&!(bash&&o1==='--')){
    if(v7){n=parseInt(o1.slice(1),10)||0}
    else{
      var spec=o1.slice(1);
      if(bash&&(o1==='-s'||o1==='-n')){W.shift();spec=W[0];if(spec===undefined){err('bash: kill: '+o1+': option requires an argument');return}}
      var up=bash?spec.toUpperCase().replace(/^SIG/,''):spec;
      n=/^\d+$/.test(spec)?+spec:SIG[up];
      if(typeof n!=='number'||n&&!SIG[n]){err(bash?'bash: kill: '+spec+': invalid signal specification':/^\d/.test(spec)?'kill: Bad signal number.':spec+': Unknown signal; kill -l lists signals.');return}
    }
    W.shift();
  }
  else if(bash&&o1==='--')W.shift();
  var any=false,bad=false;
  for(var k=0;k<W.length;k++){
    var w=W[k];
    if(/^%/.test(w)&&!v7){var r=findJob(w,'kill');if(r.err){err(r.err);if(csh)return;bad=true;continue}
      if(csh&&sigDo(n)==='stop'&&r.job.state!=='Running'){typeLine(w+': Already stopped');bad=true;continue} /* pkill */
      signal(r.job,n,true);any=true;continue}
    if(!/^-?\d+$/.test(w)){if(v7){err('usage: kill [ -signo ] pid ...');queue(function(){STATUS=2});return}err(bash?'bash: kill: '+w+': arguments must be process or job IDs':'kill: Arguments should be jobs or process id\'s.');if(csh)return;bad=true;continue}
    var hit=liveJobs().filter(function(j){return j.pids.indexOf(+w)>=0})[0];
    if(v7&&(n>15||n<0)){err(w+': Invalid argument');bad=true;continue}
    if(!hit){
      var pid=+w,p=pid===0?{pid:0,mine:true,cmd:''}:procTable().filter(function(x){return x.pid===pid})[0];
      if(!p){err(bash?'bash: kill: ('+w+') - No such process':w+': No such process');bad=true;continue}
      if(!p.mine&&ST.user!==PROFILE.rootName){err(bash?'bash: kill: ('+w+') - Operation not permitted':w+': Not owner');bad=true;continue} /* EPERM: someone else's; root may */
      if(n&&(!pid||pid===shellPid()))shellSignal(n,!pid);
      any=true;continue;
    }
    if(n)signal(hit,n);any=true;
  }
  if(!csh&&!v7&&!any||bad)queue(function(){STATUS=1});
}
function procTable(){ /* the processes ps lists besides the jobs: {pid,mine,cmd}; a machine with a ps of its own gives its (PH.procs) */
  if(PH.procs)return PH.procs();
  return (PROFILE.raw.ps||[]).map(function(l){return l.trim().split(/\s+/)}).filter(function(f){return f.length>=5&&/^[xa-]$/i.test(f[0])})
    .map(function(f){return {pid:+f[1],mine:f[0]==='-',cmd:f.slice(4).join(' ')}}); /* - is the visitor's own row */
}
function shellPid(){var r=loginShell();return r?r.pid:23} /* $$: the login shell ps shows */
function shellSignal(n,group){ /* kill $$, or kill 0 (its process group: with no job control, the jobs too). What the shell does not set aside ends it */
  if(group&&!control())liveJobs().forEach(function(j){if(j.owner===0)signal(j,n)});
  var x=(SIG[n]||{}).name,kept=control()?/^(TERM|QUIT|INT|TSTP|TTIN|TTOU)$/:/^(TERM|QUIT|INT|SEGV|ALRM)$/; /* interactive: bash and csh set TERM and QUIT aside and catch INT; V7 sh sets TERM and QUIT aside and catches INT, SEGV and ALRM (fault.c: SEGV grows its memory, ALRM ends it only while it waits at the prompt) */
  if(x==='ALRM'&&!control()&&!PROFILE.bash&&!PROFILE.csh&&ASIDE&&ASIDE.job&&!SCRIPTS)Promise.resolve().then(function(){ /* V7's fault(): ALRM calls done() while the shell waits at its prompt (flags&waiting). Only a job can send it then; the logout runs in the shell's own queue, after the job's step */
    if(bufNode&&MODE==='shell'&&!LOGOUT){leavePrompt();PH.logout();queue(function(){LOGOUT=false},true)}
  });
  if(kept.test(x||'')||sigDo(n)!=='end'||SCRIPTS||ASIDE||group&&(SUB||SHID))return; /* a script's own shell is another process. $$ in ( ), a pipe or a `command` is still the shell's; their kill 0 is their own group */
  PH.logout();
}
function stoppedWarn(){ /* exit and logout with stopped jobs: once, unless the line before said it (or was jobs) */
  if(!control()||SUB||SCRIPTS||SHID)return false;
  if(!TABLE.some(function(j){return j.owner===0&&j.state==='Stopped'})||WARNED===RUNS-1)return false;
  WARNED=RUNS;typeLine('There are stopped jobs.','err');
  return true;
}
function psJobs(){ /* each process of each job still going: for ps */
  var R=[];
  liveJobs().forEach(function(j){j.pids.forEach(function(p,i){R.push({pid:p,cmd:j.ps&&j.ps[i]||j.cmds[i]||j.text,stopped:j.state==='Stopped',start:j.start})})});
  return R;
}
function endJobs(){TABLE.slice().forEach(function(j){j.dead=true;j.state='Killed';j.sig=1;ended(j)});TABLE=[];CUR={c:null,p:null};V7NOTE=[];FGJOB=null} /* logout: the session's jobs go with it */
function execSeg(seg){
  if(!PROFILE.dos&&/[^&><|\s\\]\s*&\s*$/.test(seg)&&isBack(seg)){ /* echo a &: its own process, which nobody waits for. exit, break or cd in it end or change only that process */
    var back=null,was,text=seg.replace(/&\s*$/,'');
    queue(function(){
      if(control()&&/^\s*%\S*\s*$/.test(text)){jobCmd('bg',[],'bg',['bg',text.trim()]);return} /* %1 &: bg */
      if(!SUB&&!SINK&&(!ERRSINK||ERRSINK===GLASS)){if(!misread(text))startJob(text);return} /* at the shell's own level: a job of its own, in the background */
      back=keep();was=JOB;JOB={sub:SUB>0,level:SUB+1};SUB++;execSeg(text); /* inside a `command`, a pipe or a file: it is run through, as the one reading it waits for its end */
    });
    queue(function(){if(!back)return;JOB=was;SUB--;PIDNOW=null;back();STATUS=0},true);
    return;
  }
  var parts=PROFILE.dos||PROFILE.csh&&/^\s*if\s*\(/.test(seg)?null:andOr(seg),dead=false;
  if(parts&&parts.length>1)queue(function(){tell()}); /* a && b &: one process for the lot */
  if(!parts||parts.length<2){queue(function(){substitute(seg,function(text){execText(text)})});return}
  parts.forEach(function(p){ /* cd /tmp && echo `pwd`: the pwd runs in /tmp */
    queue(function(){
      if(dead||LOGOUT||LOOP||skipped(p.op))return;
      substitute(p.text,function(text){execText(text,function(){dead=true})});
    });
  });
}
function execLine(line){ /* a whole command line: aliases, and any number of commands */
  splitCmds(line).forEach(function(seg){splitCmds(expand(seg)).forEach(function(x){if(x.trim())execSeg(x)})});
}
function flatSubs(line){ /* the line with each `...`, $(...) and $((...)) as one word x, and what was in each $( ): bash reads that as it reads the line */
  var o='',inner=[],sq=false,dq=false,j;
  for(var i=0;i<line.length;i++){
    var c=line.charAt(i);
    if(c==='\\'&&!sq){o+=line.substr(i,2);i++;continue}
    if(c==="'"&&!dq)sq=!sq;
    else if(c==='"'&&!sq)dq=!dq;
    else if(!sq&&c==='`'&&(j=line.indexOf('`',i+1))>0){o+='x';i=j;continue}
    else if(!sq&&c==='$'&&line.charAt(i+1)==='('&&(j=parenEnd(line,i+1))>0){if(line.charAt(i+2)!=='(')inner.push(line.slice(i+2,j));o+='x';i=j;continue}
    o+=c;
  }
  return {flat:o,inner:inner};
}
function synCheck(lines,last){ /* the first syntax error in lines, read as the shell reads them: a whole line (and a whole compound command) before it runs any of it.
                                  {at: the line, msgs:[...]}, or null. last: only the last line is new */
  if(PROFILE.dos||PROFILE.noUnix)return null;
  var inCase=0,here=null;
  for(var n=0;n<lines.length;n++){
    var line=lines[n];
    if(here!==null){if(line.replace(/^\t+/,'')===here)here=null;continue}
    var m=!PROFILE.csh&&line.replace(/'[^']*'|"[^"]*"/g,'q').match(/<<-?\s*\\?['"]?(\w+)/);
    if(m&&!/<<</.test(line))here=m[1];
    while(openQuote(line)&&n+1<lines.length)line+='\n'+lines[++n];
    var e=lineError(line);
    if(e&&(last===undefined||n===lines.length-1))return {at:n,msgs:e};
  }
  return null;
  function lineError(line){
    var f=flatSubs(line),bad=null,km;
    if(PROFILE.bash)f.inner.some(function(x){var r=lineError(x);if(r)bad=[r[0],'bash: syntax error'];return r});
    if(bad)return bad;
    statements([f.flat]).some(function(t){
      var w=firstWord(t);
      if(PROFILE.csh){if(/^(if|while|foreach|switch|else|end|endif|endsw|breaksw|case|default:?|@)(\(|$)/.test(w))return false}
      else{
        if(w==='case'){inCase++;return false}
        if(w==='esac'||/^esac\b/.test(t)){inCase=Math.max(0,inCase-1);return false}
        if(inCase||/^(fi|done|then|do|else|\{|\})$/.test(w)||/^(fi|done)[|<>&\s]/.test(t))return false;
        if(w==='for'){var fm=t.match(/^for\s+\S+\s+in\s+([\s\S]*)$/);if(!fm)return false;t='x x '+fm[1]}
        else if((km=t.match(/^(if|elif|while|until|!)(?=[\s(]|$)/)))t=t.slice(km[1].length); /* if(1): the keyword, then a ( ) */
      }
      if(!t.trim())return false;
      SYNCHK=true;
      try{parseList(t)}catch(x){if(x&&x.syntax)bad=[syntaxError(x.syntax,x.redir,x.paren)]}
      finally{SYNCHK=false}
      return bad;
    });
    return bad;
  }
}
function synSay(msg){typeLine(msg,'err');if(!PROFILE.csh&&/syntax error/.test(msg))queue(function(){STATUS=2})} /* bash and V7 sh: a syntax error's status is 2 (V7's synbad: exitsh(SYNBAD)); csh's error() sets 1 */
function misread(seg){ /* (a) b &: the shell reads the whole line before it forks, so a syntax error is said and no job starts */
  if(/`|\$\(/.test(seg))return false; /* what is substituted is read when the job runs */
  try{parseList(seg)}catch(e){if(e&&e.syntax){synSay(syntaxError(e.syntax,e.redir,e.paren));return true}}
  return false;
}
function parsed(seg){ /* parseList, or null once it has said what was wrong */
  try{return parseList(seg)}
  catch(e){
    if(e&&e.undefinedVar)typeLine(e.msg||e.undefinedVar+': Undefined variable.','err');
    else if(e===NOMATCH)typeLine('No match.','err');
    else if(e&&e.syntax)synSay(syntaxError(e.syntax,e.redir,e.paren));
    else throw e;
    return null;
  }
}
function syntaxError(tok,redir,paren){ /* tok: the word it stopped at, or end */
  if(PROFILE.csh)return redir?'Missing name for redirect.':paren==='open'?"Too many ('s.":paren==='('?'Badly placed (.':paren?"Badly placed ()'s.":'Invalid null command.';
  if(PROFILE.bash)return tok==='end'?'bash: syntax error: unexpected end of file':"bash: syntax error near unexpected token `"+tok+"'";
  return "syntax error: `"+(tok==='end'?'end of file':tok)+"' unexpected";
}
function ifAfter(seg){ /* where && or || is followed by csh's if ( ), outside quotes */
  var q=null;
  for(var i=0;i<seg.length;i++){
    var c=seg.charAt(i),two=seg.substr(i,2);
    if(c==='\\'){i++;continue}
    if(q){if(c===q)q=null}
    else if(c==='#'&&(!i||/[\s;|&<>]/.test(seg.charAt(i-1))))return null;
    else if((c==='"'||c==="'")&&seg.indexOf(c,i+1)>=0)q=c;
    else if((two==='&&'||two==='||')&&/^\s*if\s*\(/.test(seg.slice(i+2)))return {at:i,op:two};
  }
  return null;
}
function bareOp(s){ /* a < > | or & outside quotes and ( ), which csh's lexer takes for a redirection, pipe or & */
  var depth=0,q=null;
  for(var i=0;i<s.length;i++){
    var c=s.charAt(i);
    if(q){if(c===q)q=null}
    else if(c==='\\')i++;
    else if(c==='"'||c==="'")q=c;
    else if(c==='(')depth++;
    else if(c===')')depth=Math.max(0,depth-1);
    else if(/^(<<|>>)=/.test(s.substr(i,3)))i+=2; /* @ x <<= 1: left to @ to say it is a syntax error */
    else if(!depth&&/[<>|&]/.test(c))return true;
  }
  return false;
}
function execText(seg,failed){ /* failed: told when the line could not be read, which ends the rest of it */
  queue(function(){
    if(PROFILE.csh&&/^\s*if\s*\(/.test(seg)){tell();if(!LOGOUT)runOne(seg.replace(/^\s*if\s*\(/,'if ('));return} /* its ( ) comes before any < or > */
    if(PROFILE.csh&&/^\s*@\s*[A-Za-z_]/.test(seg)&&!bareOp(seg)){tell();if(!LOGOUT)runOne(seg);return} /* @ x = 2 * 3: no wildcards, and ( 2 > 1 ) is no redirection */
    var k=PROFILE.csh&&ifAfter(seg);
    if(k){
      if(!parsed(seg.slice(0,k.at))){if(failed)failed();return}
      tell();
      execText(seg.slice(0,k.at));
      queue(function(){
        if(LOGOUT||skipped(k.op))return;
        execText(seg.slice(k.at+2));
      });
      return;
    }
    var L=parsed(seg);
    if(!L){if(failed)failed();return}
    tell(L.length===1?L[0].stages.length:0);
    L.forEach(function(item){
      queue(function(){
        if(LOGOUT||LOOP||skipped(item.op))return;
        fgProc(item,function(){runPipeline(item.stages)});
      });
    });
  });
}
/* for, while, until, if, case (and csh's foreach): read into a tree, then run with the queue */
var MORE={},LOOP=null,SCRIPTS=0,SUB=0,SUBSH=0,LOOPD=0; /* SUB: inside a pipeline stage or `command`, each its own process; SUBSH: the SUB of the ( ) it is in; LOOPD: how many loops deep */
function statements(lines){
  var S=[];
  lines.forEach(function(l){
    splitCmds(l).forEach(function(seg){
      var t=seg.trim(),m=t.match(/^(do|then|else)\s+([\s\S]*)$/);
      if(m){S.push(m[1]);S.push(m[2])}else S.push(t);
    });
  });
  return S;
}
function firstWord(t){return (t||'').split(/[\s|<>&]/)[0]} /* done|cat and fi>f end at their keyword */
function parseTree(lines){
  var S=statements(lines),i=0;
  function expect(w){if(i>=S.length)throw MORE;if(firstWord(S[i])!==w)throw new Error('syntax error');return S[i++]}
  function amp(n,end){ /* done &, fi | cat, esac > f: the whole of it in the background, in a pipe or redirected (csh's end takes neither) */
    if(PROFILE.csh)return n;
    var t=end.replace(/^[^\s|<>&]+/,'');
    if(/(^|[^&])&\s*$/.test(t)){n.bg=true;t=t.replace(/&\s*$/,'')}
    if(t.trim())n.tail=t.trim();
    return n;
  }
  function ifNode(){
    var n={k:'if',cond:block(['then'])};
    expect('then');
    n.then=block(['elif','else','fi']);
    var w=firstWord(S[i]);
    if(w==='elif'){S[i]=S[i].replace(/^elif\s*/,'');var x=ifNode();n.els=[x];n.bg=x.bg;n.tail=x.tail;x.bg=false;x.tail=null;return n}
    if(w==='else'){i++;n.els=block(['fi'])}
    return amp(n,expect('fi'));
  }
  function block(stops){
    var out=[],pend=null;
    for(;;){
      if(pend&&out.length>pend.n){out[pend.n].head=pend.h;pend=null} /* echo q | while read x: what comes before it in the pipe */
      if(i>=S.length){if(stops)throw MORE;return out}
      var t=S[i],w=firstWord(t),m;
      if(stops&&stops.indexOf(w)>=0)return out;
      if(/^(fi|done|then|do|else|elif|esac)$/.test(w))throw new Error("syntax error: `"+w+"' unexpected");
      i++;
      if(!t)continue;
      if(!PROFILE.csh&&!pend&&t.indexOf('|')>=0){
        var P2=pipeRaw(t,true),h=0;
        for(var q=1;q<P2.length&&!h;q++)if(/^(for|while|until|if|case)$/.test(firstWord(P2[q].trim())))h=q;
        if(h){pend={n:out.length,h:P2.slice(0,h).join('').trim()};S.splice(i,0,P2.slice(h).join('').trim());continue}
      }
      if(w==='for'){
        m=t.match(/^for\s+(\w+)(?:\s+in\s*([\s\S]*))?$/);
        if(!m)throw new Error('syntax error');
        expect('do');
        var body=block(['done']);
        out.push(amp({k:'for',v:m[1],words:m[2]===undefined?'$*':m[2],body:body,all:m[2]===undefined},expect('done')));
      }
      else if(PROFILE.csh&&/^while\b/.test(t)){ /* csh: while ( expr ) ... end */
        var b4=block(['end']);expect('end');
        out.push({k:'cwhile',cond:t.replace(/^while/,''),body:b4});
      }
      else if(w==='while'||w==='until'){
        S.splice(i,0,t.replace(/^\S+\s*/,''));
        var cond=block(['do']);expect('do');
        var b2=block(['done']);
        out.push(amp({k:w,cond:cond,body:b2},expect('done')));
      }
      else if(w==='if'&&!(PROFILE.csh&&/^if\s*\(/.test(t))){S.splice(i,0,t.replace(/^\S+\s*/,''));out.push(ifNode())} /* csh's one-line if is a command */
      else if(w==='case'){
        m=t.match(/^case\s+(\S+)\s+in(?:\s+([\s\S]*))?$/);
        if(!m)throw new Error('syntax error');
        if(m[2])S.splice(i,0,m[2]);
        var arms=[];
        for(;;){
          while(i<S.length&&!S[i])i++;
          if(i>=S.length)throw MORE;
          if(firstWord(S[i])==='esac'){var end=S[i++];break}
          var a=S[i].match(/^\(?([^)]*)\)\s*([\s\S]*)$/);
          if(!a)throw new Error('syntax error');
          S[i]=a[2];
          arms.push({pats:a[1].split('|').map(function(x){return x.trim()}),body:block(['','esac'])});
        }
        out.push(amp({k:'case',word:m[1],arms:arms},end));
      }
      else if(w==='foreach'){
        m=t.match(/^foreach\s+(\w+)\s*\(([\s\S]*)\)$/);
        if(!m)throw new Error('foreach: Words not parenthesized.');
        var b3=block(['end']);expect('end');
        out.push({k:'for',v:m[1],words:m[2],body:b3});
      }
      else out.push({k:'cmd',t:t});
    }
  }
  return block(null);
}
function runBlock(B){
  B.forEach(function(st){queue(function(){if(!LOOP&&!LOGOUT)runStmt(st)})});
}
function afterLoop(){var was=LOOP;if(was!=='exit'&&was!=='stop')LOOP=null;return was} /* stop: ^Z, which bash's loops all end at */
function over(was){return was==='break'||was==='exit'||was==='stop'}
var PIPEMAX=65536,PIPEBUF=4096; /* PIPEMAX: the writes a pipe takes from a loop before the loop's process is ended (memory stays bounded).
   PIPEBUF: the bytes a pipe holds before the writer has to wait for its reader (V7's and 4.3BSD's pipe size), so a reader
   is taken to read once that much waits for it: a short loop is done before head has even started, as it usually is on the real systems */
function pipeReader(stages,i){ /* what the command at stages[i] does with the pipe into it: {done, take(text, part)}, or null when it reads all of it.
                                  part: a piece of a line that has no newline yet (echo -n), which a line reader does not count as a line
                                  head -5 or read: they stop reading and exit, and the loop's next write gets SIGPIPE; cat, grep, tr
                                  and tee pass what they read on, and stop once their own pipe's reader has */
  var st=stages[i],w=st&&st.words,gone={done:true,take:function(){}};
  if(!st||st.sub!==undefined||!w.length||markNode(w[0]))return null;
  if(st.in!==null||st.here!==undefined)return gone; /* it reads a file instead */
  function lines(n,bytes){var r={done:n<=0,take:function(l,part){if((n-=(bytes?l.length:0)+(part?0:1))<=0)r.done=true}};return r}
  if(w[0]==='read')return lines(1);
  if(w[0]==='head'){
    if(!has(CMDS,'head'))return gone; /* V7 has none */
    if(!PH.headArgs)return null;
    var o=PH.headArgs(w.slice(1));
    return o.err||o.F.some(function(x){return x.f!=='-'||!PROFILE.bash})?gone:o.c!==null?o.c<0?null:lines(o.c,true):o.n<0||o.z?null:lines(o.n); /* -z: its lines end at a NUL */
  }
  var ops=w.slice(1).filter(function(x){return x.charAt(0)!=='-'||x==='-'}),pass,fl,re;
  if(w[0]==='cat'||w[0]==='tee'||w[0]==='tr')pass=function(){return true};
  else if(w[0]==='grep'&&ops.length&&!/[co]/.test(fl=w.slice(1).filter(function(x){return /^-./.test(x)}).join(''))){ /* the lines it prints */
    try{re=new RegExp(PROFILE.bash&&/F/.test(fl)?ops[0].replace(/[\\^$.*+?()[\]{}|\/]/g,'\\$&'):ops[0],/i/.test(fl)?'i':'')}catch(e){return gone}
    pass=function(l){return re.test(l)!==/v/.test(fl)};ops=ops.slice(1);
  }
  else return null;
  if(w[0]!=='tee'&&w[0]!=='tr'&&ops.some(function(x){return x!=='-'}))return gone; /* cat f, grep x f: they read their files */
  var down=i<stages.length-1&&st.out===null&&!st.closed&&!st.glass?pipeReader(stages,i+1):null;
  if(!down)return null;
  var p=newPipe(down),buf='',r={done:false,take:function(l,part){ /* its write after its reader went: SIGPIPE */
      if(re){if(part){buf+=l;return}l=buf+l;buf='';if(!pass(l))return} /* grep looks at whole lines */
      if(!pipeWrite(p,l,part))r.done=true},
    flush:function(){pipeTake(p);r.done=p.gone}};
  return r;
}
function newPipe(r){return r&&{r:r,q:[],n:0,gone:false}}
function pipeWrite(p,l,part){ /* false: the reader has gone, and the writer gets SIGPIPE. part: no newline after it yet */
  if(p.gone)return false;
  p.q.push([l,part]);p.n+=l.length+(part?0:1);
  if(p.n>=PIPEBUF)pipeTake(p);
  return true;
}
function pipeTake(p){ /* the reader reads what waits in the pipe; cat, grep, tr or tee pass it straight on down theirs */
  for(var k=0;k<p.q.length&&!p.r.done;k++)p.r.take(p.q[k][0],p.q[k][1]);
  if(p.r.flush&&!p.r.done)p.r.flush();
  p.q=[];p.n=0;p.gone=p.r.done;
}
function pipeBroke(S){S.broke=true;STATUS=128+SIG.PIPE;LOOP='exit';return true} /* the writer's process dies of SIGPIPE (bash: status 141) */
function pipeFull(){ /* a loop writing to a pipe whose reader has gone: the loop's process dies of SIGPIPE */
  var S=SINK,bad;
  if(!S||!S.cap)return false;
  bad=S.w>=S.cap;
  while(S.pipe&&!bad&&S.fed<S.length){ /* each line once; one left open (echo -n) goes in a piece at a time, as it was written */
    var l=S[S.fed],piece=l.slice(S.fedc);
    if(S.fed===S.length-1&&S.open){if(piece)bad=!pipeWrite(S.pipe,piece,true);S.fedc=l.length;break}
    bad=!pipeWrite(S.pipe,piece);S.fed++;S.fedc=0;
  }
  return bad&&pipeBroke(S);
}
function pipeWait(){ /* in a step: the writer waits (sleep, a read from the terminal), so its reader gets to read what is in the pipe now,
                        not only once PIPEBUF has filled it; true when a write the writer made has met a reader that is gone */
  var S=SINK;
  if(!S||!S.pipe||S.broke)return !!(S&&S.broke);
  if(pipeFull())return true;
  pipeTake(S.pipe);
  return false;
}
function passWait(){ /* between rounds of a while loop, so that ^C can reach it; a loop writing into a pipe only now and then */
  var S=SINK;
  if(S&&S.cap&&S.w!==S.at){S.at=S.w;S.runs=(S.runs||0)+1;if(S.runs%256)return}
  return sleep(0);
}
function round(body,again){ /* a while loop's body, then again() unless it ended in break or exit */
  runBlock(body);
  var stop;
  queue(function(){var was=afterLoop();stop=over(was)||pipeFull();if(!stop)return passWait()});
  queue(function(){if(!stop&&!LOOP)again()});
}
var NODES=[],NODEID=new Map(),MARK='\uE031',MARKP=new RegExp('^'+MARK),MARKN=new RegExp('^'+MARK+'(\\d+)'); /* a loop with a pipe or redirection after it: the pipeline's stage MARK n runs NODES[n]; NODEID: each node's n */
function markNode(w){var k=MARKN.exec(w||'');return k&&{node:Object.assign({},NODES[+k[1]],{tail:null,head:null}),len:k[0].length}} /* MARK n: a copy of its loop, to run as a command of the pipeline, and the length of MARK n */
function runStmt(st){
  if(st.bg){bgStmt(st);return}
  if(st.tail||st.head){var id=NODEID.get(st);if(id===undefined){id=NODES.push(st)-1;NODEID.set(st,id)}execText((st.head?st.head+' ':'')+MARK+id+(st.tail?' '+st.tail:''));return} /* done | cat, done < f > g, echo q | while ...: the loop is a command of the pipeline */
  if(/^(for|while|until|cwhile)$/.test(st.k)){ /* a loop: how deep, so that a ^Z can end them all and nothing after */
    LOOPD++;loopStmt(st);
    queue(function(){if(!--LOOPD&&LOOP==='stop')LOOP=null},true);
    return;
  }
  loopStmt(st);
}
function bgStmt(st){ /* while ...; done &: the shell forks, and the copy runs it. In a `command` or a pipe, it is run through */
  var it=Object.assign({},st,{bg:false});
  if(!SUB&&!SINK&&(!ERRSINK||ERRSINK===GLASS)){startJob('',{run:function(){runStmt(it)},shown:compText(it,'').join('\n')});return}
  var back=keep(),was=JOB;JOB={sub:SUB>0,level:SUB+1};SUB++;tell();runStmt(it);
  queue(function(){JOB=was;SUB--;PIDNOW=null;back();STATUS=0},true);
}
function compText(n,ind){ /* bash's make_command_string for a loop, an if or a case: the lines jobs shows, and a pipe or redirection after it */
  var L=compLines(n,ind);
  if(n.tail)L[L.length-1]+=' '+n.tail.replace(/\s+/g,' ');
  if(n.head)L[0]=ind+n.head.replace(/\s+/g,' ')+' '+L[0].slice(ind.length);
  return L;
}
function compLines(n,ind){
  var I=ind+'    ';
  function list(B){return B.map(function(x){return x.k==='cmd'?oneLine(x.t):compText(x,'').join('\n')}).join('; ')}
  function body(B,ind,last){
    var L=[],run=[];
    function flush(){if(run.length){L.push(ind+run.join('; ')+';');run=[]}}
    B.forEach(function(x){if(x.k==='cmd')run.push(oneLine(x.t));else{flush();var c=compText(x,ind);c[c.length-1]+=';';L=L.concat(c)}});
    flush();
    if(last&&L.length)L[L.length-1]=L[L.length-1].replace(/;$/,'');
    return L;
  }
  if(n.k==='while'||n.k==='until')return [ind+n.k+' '+list(n.cond)+'; do'].concat(body(n.body,I),[ind+'done']);
  if(n.k==='for')return [ind+'for '+n.v+' in '+(n.all?'"$@"':oneLine(n.words))+';',ind+'do'].concat(body(n.body,I),[ind+'done']);
  if(n.k==='if')return [ind+'if '+list(n.cond)+'; then'].concat(body(n.then,I),n.els?[ind+'else'].concat(body(n.els,I)):[],[ind+'fi']);
  if(n.k==='case'){
    var L=[ind+'case '+n.word+' in '];
    n.arms.forEach(function(a){L=L.concat([I+a.pats.join(' | ')+')'],body(a.body,I+'    ',true),[I+';;'])});
    return L.concat([ind+'esac']);
  }
  return [ind+oneLine(n.t||'')];
}
function loopStmt(st){
  if(st.k==='cmd'){splitCmds(expand(st.t)).forEach(function(x){if(x.trim())execSeg(x)});return} /* an alias may hold a ; */
  if(st.k==='for'){
    substitute(st.words,function(text){
      var L=parsed('x x '+text); /* for's own words before the list: a ( in it is bash's token ( */
      if(!L)return;
      var W=L[0]?L[0].stages[0].words.slice(2):[];
      (function next(i){
        if(i>=W.length)return;
        queue(function(){ENV[st.v]=W[i];runBlock(st.body)});
        queue(function(){if(!over(afterLoop())&&!pipeFull())next(i+1)});
      })(0);
    });
    return;
  }
  if(st.k==='while'||st.k==='until'){
    (function again(){
      runBlock(st.cond);
      queue(function(){if(!LOOP&&(STATUS===0)===(st.k==='while'))round(st.body,again)});
    })();
    return;
  }
  if(st.k==='cwhile'){ /* the expression is worked out afresh each time round, $variables and all */
    (function again(){
      PH.cshWhile(st.cond,function(yes,any,last){if(yes)round(st.body,function(){if(!LOGOUT)again()});else if(any)STATUS=last});
    })();
    return;
  }
  if(st.k==='if'){
    runBlock(st.cond);
    queue(function(){if(LOOP)return;if(STATUS===0)runBlock(st.then);else if(st.els)runBlock(st.els);});
    return;
  }
  if(st.k==='case'){
    substitute(st.word,function(text){
      var L=parsed('x '+text);
      if(!L)return;
      var v=L[0]&&L[0].stages[0].words[1]||'';
      for(var i=0;i<st.arms.length;i++){
        var hit=st.arms[i].pats.some(function(p){
          try{return globRe(p).test(v)}catch(e){return p===v}
        });
        if(hit){runBlock(st.arms[i].body);return}
      }
    });
  }
}
function runScript(lines,args){ /* a script: a tree of statements, inside the current step */
  var keep=ARGS,keepSub=SUB,keepShell=SHID,tree,ran=false;
  var bad=synCheck(lines),name=(args&&args[0])||(PROFILE.csh?'csh':PROFILE.bash?'bash':'sh');
  if(bad){ /* the lines before it run, up to the last whole command before it; then the script ends there (bash and V7: status 2; csh's error() seeks to the end, status 1) */
    var cut=bad.at;while(cut>0){try{parseTree(lines.slice(0,cut));break}catch(e){cut--}}
    var at=bad.at+1,said=bad.msgs.map(function(m){
      if(PROFILE.csh)return m;
      if(PROFILE.bash)return name+': line '+at+': '+m.replace(/^bash: /,'');
      return name+': '+m.replace(/^syntax error/,'syntax error at line '+at);
    });
    if(PROFILE.bash)said.splice(1,0,name+': line '+at+": `"+lines[bad.at]+"'");
    if(cut)runScript(lines.slice(0,cut),args);
    queue(function(){said.forEach(function(m){typeLine(m,'err')});queue(function(){STATUS=PROFILE.csh?1:2})});
    return;
  }
  if(PROFILE.bash)lines=lines.map(dollarParen); /* $(cmd) in a script too */
  if(!PROFILE.dos){
    try{tree=parseTree(lines.filter(function(l){return !/^\s*#/.test(l)}))}
    catch(e){synSay(e===MORE?'syntax error: end of file unexpected':e.message);return}
  }
  queue(function(){return sleep(0)}); /* so that ^C can reach a script that keeps running itself */
  queue(function(){
    if(SCRIPTS>=32){typeLine(PROFILE.dcl?'%SYSTEM-F-EXQUOTA, process quota exceeded':PROFILE.dos?'Insufficient memory':PROFILE.csh?'No more processes.':'sh: no more processes','err');return}
    ran=true;SCRIPTS++;keepSub=SUB;SUB=0;keepShell=SHID;SHID=++SHIDS; /* a script's exit ends the script, wherever its output is going; its jobs are its own */
    if(PROFILE.dos){lines.forEach(function(l){queue(function(){if(LOOP)return;var s=dosLine(l);if(s.trim())execSeg(s)})});return} /* DCL's EXIT ends the procedure */
    ARGS=args||['sh'];
    runBlock(tree);
  });
  queue(function(){
    if(!ran)return; /* ^C got in first, or there were too many */
    SCRIPTS--;SUB=keepSub;SHID=keepShell;LOOP=null;
    if(!PROFILE.dos)ARGS=keep;
  },true);
}
var KEPT=[]; /* child shells not yet undone: a ^C can end their program before it calls back() */
function keep(){ /* a program's child shell starts here: what the shell does to the directory and variables, back() undoes */
  var cwd=ST.cwd,env=Object.assign({},ENV),vars=Object.assign({},CSHV),wds=Object.assign(Object.create(null),CSHW),al=PH.aliases;
  KEPT.push(back);
  return back;
  function back(){
    var i=KEPT.indexOf(back);if(i<0)return;KEPT.splice(i,1);
    if(find(cwd,true))ST.cwd=cwd;
    Object.keys(ENV).forEach(function(k){if(!has(env,k))delete ENV[k]});Object.assign(ENV,env);
    Object.keys(CSHV).forEach(function(k){if(!has(vars,k))delete CSHV[k]});Object.assign(CSHV,vars);
    Object.keys(CSHW).forEach(function(k){if(!(k in wds))delete CSHW[k]});Object.assign(CSHW,wds);
    PH.aliases=al;
  }
}
function noFork(){typeLine(PROFILE.csh?'No more processes.':PROFILE.bash?'bash: fork: Resource temporarily unavailable':'fork failed - too many processes','err')} /* past 32 processes deep: a command that calls itself */
function forked(cmd,then){ /* csh's { command }: run as its own process, then(its status) */
  var back=null,st;
  queue(function(){if(SUB>=32){noFork();st=1;return}back=keep();SUB++;STATUS=0;execLine(cmd)});
  queue(function(){if(!back)return;SUB--;st=STATUS;back()},true);
  queue(function(){then(st)});
}
function child(lines){var back=keep(),st=STATUS;runScript(lines);queue(function(){back();STATUS=st},true)} /* one command, as a child process: its status is not the program's */
var COMPOUND_SH=/^(for|while|until|if|case|fi|done|then|do|else|elif|esac)$/,COMPOUND_CSH=/^(foreach|while(\(.*)?)$/;
function compound(line){
  if(PROFILE.dos)return false;
  return statements([line]).some(function(t){return (PROFILE.csh?COMPOUND_CSH:COMPOUND_SH).test(firstWord(t))});
}
function runCompound(lines){ /* typed at the prompt: keeps asking until it is complete */
  var tree;
  try{tree=parseTree(lines)}
  catch(e){
    if(e!==MORE){synSay(e.message);return}
    var w0=PROFILE.csh&&lines.length===1&&statements(lines)[0]||'';
    if(/^while\b/.test(w0)&&PH.cshWhileRead&&!PH.cshWhileRead(w0.replace(/^while/,'')))return; /* csh: an error in the expression, before the loop is read */
    ask(PROFILE.csh?'? ':'> ',function(l){
      if(l===null)return;
      var n=lines.length-1; /* do echo "g, then h": one line, with the newline in the quote */
      var bad=!PROFILE.csh&&synCheck(lines.concat(l),true);
      if(bad){bad.msgs.forEach(synSay);return} /* sh and bash read the compound command to its end before it runs, and say an error at the line it is in; csh reads a loop's lines when it runs them */
      runCompound(!PROFILE.csh&&openQuote(lines[n])?lines.slice(0,n).concat(lines[n]+'\n'+l):lines.concat(l));
    });
    return;
  }
  runBlock(tree);
}
function openQuote(s){ /* the quote a line leaves open, or '': a quote opens anywhere in a word, as it does in every one of these shells */
  for(var i=0,j;i<s.length;i++){
    var c=s.charAt(i);
    if(c==='\\'){i++;continue}
    if(c==='#'&&(!i||/[\s;|&<>]/.test(s.charAt(i-1))))return '';
    if(c==='`'||c==="'"||c==='"'){
      j=c==='"'&&!PROFILE.csh?closeDq(s,i):s.indexOf(c,i+1);
      if(j<0)return c;
      i=j;
    }
  }
  return '';
}
function quoteEnd(s,i){var c=s.charAt(i);return c==='"'?closeDq(s,i):c==="'"||c==='`'?s.indexOf(c,i+1):-1} /* where the quote or `command` at i ends, or -1 */
function closeDq(s,i){ /* the " that closes the one at i: a `command` inside it may hold its own */
  for(var j=i+1,k;j<s.length;j++){
    if(s.charAt(j)==='\\'){j++;continue}
    if(s.charAt(j)==='"')return j;
    if(s.charAt(j)==='`'&&(k=s.indexOf('`',j+1))>=0)j=k;
  }
  return -1;
}
function splitCmds(s){ /* on ; outside quotes.
                          And on a lone & outside ( ), after a command: it runs, and nothing waits for it. L.semi: bash's & ; */
  var L=[],start=0,ch,j,depth=0;
  for(var i=0;i<s.length;i++){
    ch=s.charAt(i);
    if(ch===';'&&(!depth||PROFILE.noUnix)){L.push(s.slice(start,i));start=i+1} /* (a; b): one command, in a Unix shell */
    else if(ch==='{'&&!depth&&(j=groupEnd(s,i))>=0)i=j; /* { a; b; }: one command too */
    else if(ch==='('&&!PROFILE.dos)depth++;
    else if(ch===')')depth=Math.max(0,depth-1);
    else if(ch==='&'&&!PROFILE.dos&&!depth&&!/[&>]/.test(s.charAt(i+1))&&!/[&><|]/.test(s.charAt(i-1))&&/\S/.test(s.slice(start,i))&&!/(&&|\|)\s*$/.test(s.slice(start,i))){
      L.push(s.slice(start,i+1));start=i+1; /* the & stays with its command */
      if(PROFILE.bash&&/^\s*;(?!;)/.test(s.slice(i+1)))L.semi=true;
    }
    else if(ch==='\\')i++;
    else if(ch==='#'&&!PROFILE.dos&&(!i||/[\s;|&<>]/.test(s.charAt(i-1))))break; /* a comment: no ; in it counts */
    else if((j=quoteEnd(s,i))>=0)i=j;
  }
  L.push(s.slice(start));
  return L;
}
function groupOpen(s){ /* a { list; } that the line leaves open, outside quotes, ( ) and comments */
  for(var i=0,j;i<s.length;i++){
    var c=s.charAt(i);
    if(c==='\\'){i++;continue}
    if((j=quoteEnd(s,i))>=0){i=j;continue}
    if(c==='#'&&(!i||/[\s;|&<>]/.test(s.charAt(i-1))))return false;
    if(c==='{'&&(j=groupEnd(s,i))!==-1){if(j<0)return true;i=j}
  }
  return false;
}
function dosLine(s){ /* cd\  cd..  dir/w: a command name ends at the first of these */
  return s.replace(/^(\s*)([a-z0-9]+)(?=[\\\/.;])/i,function(m,sp,c,o,s){return has(CMDS,c.toLowerCase())&&(s.charAt(o+m.length)!==';'||/^path$/i.test(c))?sp+c+' ':m}); /* a ; straight after a word only for PATH; (no path) */
}
function nextPrompt(pre){
  queue(function(){while(KEPT.length)KEPT[KEPT.length-1]();if(pre)pre();if(LOGOUT){LOGOUT=false;return}shellPrompt()},true);
}
function shellPrompt(p,mode){ /* the shell's prompt, after what has become of its jobs */
  if(!keepFiles()){typeLine(diskFull(),'err');queue(function(){shellPrompt(p,mode)},true);return} /* the browser is full: the change lasts until a reload */
  if(p!=null||mode||!notesDue()){showPrompt(p,mode);return}
  jobNotes();queue(function(){showPrompt()},true);
}
function dollarParen(s){ /* bash: $(command) is `command`, outside single quotes. Not nested. $((sum)) is a `command` of its own */
  var o='',sq=false,dq=false,j,c,in_;
  for(var i=0;i<s.length;i++){
    c=s.charAt(i);
    if(c==='\\'&&!sq){o+=s.substr(i,2);i++;continue}
    if(c==="'"&&!dq)sq=!sq;
    else if(c==='"'&&!sq)dq=!dq;
    else if(!sq&&c==='$'&&s.substr(i+1,2)==='(('&&(j=sumEnd(s,i+1))>0){o+='`'+SUM+' "'+s.slice(i+3,j-1)+'"`';i=j;continue}
    else if(!sq&&c==='$'&&s.charAt(i+1)==='('&&s.charAt(i+2)!=='('&&(j=s.indexOf(')',i+2))>=0&&!/[(`]/.test(in_=s.slice(i+2,j))){o+='`'+in_+'`';i=j;continue}
    o+=c;
  }
  return o;
}
var SUM='\uE020'; /* the name of the command that works out a $(( )): nobody can type it */
function sumEnd(s,k){ /* the ) that closes the ( at k, when the one before it closes the ( at k+1: $((...)) */
  for(var d=0,j=k;j<s.length;j++){
    if(s.charAt(j)==='(')d++;
    else if(s.charAt(j)===')'&&!--d)return s.charAt(j-1)===')'&&!s.slice(k+2,j-1).split('').some(function(c){return (d+=c==='('?1:c===')'?-1:0)<0})&&!d?j:-1;
  }
  return -1;
}
if(PROFILE.bash)CMDS[SUM]=function(a,raw,words){ /* bash's arithmetic: whole numbers, + - * / % ( ), and names stand for their values */
  var e=words.slice(1).join(' '),t=e.match(/\d+|[A-Za-z_]\w*|\S/g)||[],i=0;
  function bad(why){throw new Error('bash: '+e.trim()+': '+why)}
  function atom(){
    var x=t[i++];
    if(x==='-')return -atom();
    if(x==='+')return atom();
    if(x==='('){var v=sum();if(t[i++]!==')')bad('missing `)\'');return v}
    if(/^\d/.test(x||''))return parseInt(x,10);
    if(/^[A-Za-z_]/.test(x||''))return parseInt(envOf(x),10)||0;
    return bad('syntax error: operand expected');
  }
  function prod(){
    for(var v=atom();/^[*\/%]$/.test(t[i]||'');){
      var o=t[i++],r=atom();
      if(o!=='*'&&!r)bad('division by 0');
      v=o==='*'?v*r:o==='/'?Math.trunc(v/r):v%r;
    }
    return v;
  }
  function sum(){for(var v=prod();t[i]==='+'||t[i]==='-';)v=t[i++]==='+'?v+prod():v-prod();return v}
  try{var v=t.length?sum():0;if(i<t.length)bad('syntax error in expression');typeLine(String(v))}
  catch(x){typeLine(x.message,'err')}
};
function nextLine(then){ /* the rest of the command on a > line: then(it, or null at ^D). ^C: bash just gives a new prompt */
  var g=GEN,l;
  queue(function(){return readLine('> ').then(function(x){l=x})});
  queue(function(){if(g!==GEN)nextPrompt();else then(l)},true);
}
function run(raw){
  LOOP=null; /* a break typed at the prompt has no loop to end */
  RUNS++;if(V7NOTE.length)queue(v7Notes);
  JOB=null;JOBS=0; /* the jobs of the line before have finished */
  var typed=raw; /* as typed: synCheck reads its $( ) */
  if(PROFILE.bash)raw=dollarParen(raw);
  SUB=0;SUBSH=0;LOOPD=0;
  if(!raw.trim()&&PH.blank){queue(function(){PH.blank()});nextPrompt();return} /* a machine that answers an empty line (VM/370's CMS and CP) */
  if(PROFILE.dos){
    if(raw.trim())execSeg(dosLine(raw));
    nextPrompt();
    return;
  }
  var oq=openQuote(raw);
  if(!oq&&splitCmds(raw).semi){synSay(syntaxError(';'));nextPrompt();return} /* bash: echo a & ; echo b */
  if(oq&&PROFILE.csh){typeLine('Unmatched '+oq+'.','err');nextPrompt();return} /* csh reads no further line for it */
  if(oq){ /* sh and bash: the quoted text goes on on the next line */
    nextLine(function(l){
      if(l!==null)run(typed+'\n'+l);
      else if(PROFILE.bash){typeLine("bash: unexpected EOF while looking for matching `"+oq+"'",'err');queue(function(){STATUS=2});run('exit')} /* bash 5.2 says only that, and the end of input ends the shell, as ^D does at the prompt */
      else run(typed+'\n'+oq); /* V7: the end of input ends the quoted word, and the line runs */
    });
    return;
  }
  if(!PROFILE.csh&&/(\||&&)\s*$/.test(raw.replace(/\\[\s\S]/g,'x').replace(/'[^']*'|"(?:[^"\\]|\\.)*"|`[^`]*`/g,'q').replace(/(^|\s)#.*$/,''))){ /* echo x | : the rest is on the next line */
    nextLine(function(l){if(l===null){synSay(syntaxError('end'));nextPrompt()}else run(typed+' '+l)});
    return;
  }
  if(groupOpen(raw)){nextLine(function(l){if(l===null){synSay(syntaxError('end'));nextPrompt()}else run(typed+'\n'+l)});return} /* { echo a; and the } still to come */
  var bad=synCheck([typed]);
  if(bad){bad.msgs.forEach(synSay);nextPrompt();return} /* echo x; echo (a): the shell reads the whole line first, so none of it runs */
  if(compound(raw)){
    queue(function(){runCompound([raw])});
    nextPrompt(function(){LOOP=null});
    return;
  }
  /* commands separated by ; run in turn; an alias may expand to several (alias cl='clear ; ls') */
  var segs=[];
  splitCmds(raw).forEach(function(seg){segs=segs.concat(splitCmds(expand(seg)))});
  if(segs.some(function(x){return /[|<>*?\[$&\\#"'=`]/.test(x)||!PROFILE.noUnix&&/[()]/.test(x)||PROFILE.csh&&/^\s*if\(/.test(x)||groups()&&/^\s*\{\s/.test(x)})){ /* needs the shell's parser */
    segs.forEach(function(x){if(x.trim())execSeg(x)});
    nextPrompt();
    return;
  }
  segs.forEach(function(x){queue(function(){if(!LOGOUT)fgProc({text:x},function(){runOne(x);queue(function(){PIPEST=[STATUS]})})})});
  nextPrompt();
}

/* ---------- login (after exit/logout) ---------- */
function login(name){
  var n=name.trim().toLowerCase();
  if(!n){prompt(PROFILE.loginPrompt,'login');return}
  var usr=find(PROFILE.homes);
  if(PROFILE.backdoor&&n===PROFILE.backdoor){setRoot(false);ST.login=now();welcome();prompt();return}
  PENDROOT=n===PROFILE.rootName&&PROFILE.rootPassword?{name:n,word:PROFILE.rootPassword}:n===PROFILE.alsoRoot?{name:n,word:PROFILE.alsoRootWord}:null;
  if(PENDROOT||(PROFILE.closedDoor&&n!==ST.user&&n!==PROFILE.user)||n===PROFILE.rootName||n===OWNER||!LOGIN_NAME.test(n)||(n!==ST.user&&usr&&usr.kids[n])){prompt('Password:','password');return}
  var h=!PROFILE.home&&usr&&usr.kids[ST.user]; /* the home folder follows whoever logs in */
  if(h&&n!==ST.user){delete usr.kids[ST.user];h.name=n;usr.kids[n]=h}
  ST.user=n;ST.home=PROFILE.home||PROFILE.homes+'/'+n;ST.cwd=ST.home;ST.login=now();
  welcome();prompt();
}

/* ---------- input ---------- */
function renderBuf(){if(bufNode){bufNode.data=MODE==='password'||HIDE?'':TELE.on?ttEcho(buf):UP(buf);scrollBottom()}}
function zEcho(){ /* ^Z at a read the shell does: the tty echoes it where the typing is and throws away what was typed (n_tty's isig flushes the line); the read goes on */
  if(!bufNode||!bufNode.parentNode){atCursor('^Z');return}
  bufNode.parentNode.insertBefore(document.createTextNode((MODE==='password'||HIDE?'':TELE.on?ttEcho(buf):UP(buf))+'^Z'),bufNode);setBuf('');
}
function setBuf(v){
  buf=v.replace(/[\r\n]/g,'').slice(0,255);
  if(kb.value!==buf)kb.value=buf;
  renderBuf();
}
function leavePrompt(){bufNode=null;setBuf('');term.classList.remove('idle')}
function finishRead(v){var r=READ;READ=null;leavePrompt();r(v)}
function resumeHeld(){if(held){var h=held;held=null;h()}}
function submit(){
  if(TELE.on){ttReturn();TELE.free=Date.now()+2*TT_CH+TT_CR}else click(1,700); /* the echo of RETURN: CR LF, and the carriage's time */
  if(!bufNode)return; /* no prompt up yet: output is still typing */
  var cmd=TELE.on?ttCanon(buf):buf,typed=buf;leavePrompt(); /* the teletype's line as V7's canon() hands it over */
  if(TELE.on&&MODE==='login')TELE.lcase=true; /* getty: a name in capitals (all an ASR-33 has) sets LCASE */
  if(MODE==='read'){var r=READ;READ=null;r(cmd);return}
  if(MODE==='login'){login(cmd);return}
  if(MODE==='password'&&PENDROOT&&(PROFILE.caseless?cmd.toLowerCase()===PENDROOT.word.toLowerCase():cmd===PENDROOT.word)){ /* case counts where the machine's does */
    var who=PENDROOT.name;
    PENDROOT=null;setRoot(false);ST.user=who;ST.login=now();welcome();prompt();
    return;
  }
  if(MODE==='password'){PENDROOT=null;pause(1400);typeLine(PROFILE.loginFailed);prompt(PROFILE.loginPrompt,'login');return}
  if((PROFILE.csh||PROFILE.bash)&&/!/.test(cmd)){ /* !! the last command, !n that one, !word the last that began so */
    var bad=null,had=cmd;
    cmd=cmd.replace(/!(!|\$|-\d+|\d+|[a-zA-Z]\w*)/g,function(m,x,at,s){
      if(PROFILE.bash&&(s.slice(0,at).match(/'/g)||[]).length%2)return m; /* bash leaves '...' alone */
      var last=hist[hist.length-1];
      var v=x==='!'?last:x==='$'?(last===undefined?undefined:last.trim().split(/\s+/).pop()):/^-/.test(x)?hist[hist.length+(+x)]:/^\d/.test(x)?hist[+x-1]:hist.slice().reverse().filter(function(h){return h.indexOf(x)===0})[0];
      if(v===undefined){bad=PROFILE.bash?'bash: '+m+': event not found':x+': Event not found.';return ''}
      return v;
    });
    if(bad){typeLine(bad,'err');prompt();return}
    if(cmd!==had)typeLine(cmd);
  }
  if(cmd.trim()){hist.push(TELE.on?typed:cmd);if(hist.length>HMAX)hist.shift()}
  hi=hist.length;
  run(cmd);
}
/* TOPS-20's EXEC: the machine's PH.recognize(key,line) answers Escape, Tab and ? at the prompt with the new line,
   or with {echo,list,line}: what stays on this line, the lines printed under it, and the line asked again */
function recognize(k){
  if(!PH.recognize||!bufNode||MODE!=='shell')return false;
  var r=PH.recognize(k,buf);
  if(r==null)return false;
  if(typeof r==='string'){setBuf(r);return true}
  setBuf(r.echo);relist(r.list,r.line);
  return true;
}
/* bash: tab completes a command name first, a file name after; a second tab lists the choices */
var TABBED=null;
function complete(){
  if(!bufNode||MODE!=='shell')return;
  var m=buf.match(/^(.*?)([^\s;|&<>]*)$/),pre=m[1],w=m[2],q=/^['"]/.test(w)?w.charAt(0):'';
  pre+=q;w=w.slice(q.length);
  var dir='',base=w,L=[],k=w.lastIndexOf('/'),d;
  function esc(n){return q?n:n.replace(/([\s'"\\$`;|&<>()])/g,'\\$1')} /* a name bash would have to quote */
  if(!q&&(!pre.trim()||/[;|&]\s*$/.test(pre))&&k<0){ /* a command: what has a program file, what help lists, and the aliases */
    var C={};
    Object.keys(PATHS).concat(HELP.map(function(h){return h[0]})).forEach(function(n){if(has(CMDS,n))C[n]=1});
    PH.aliases.forEach(function(a){C[a.from[0]]=1});
    L=Object.keys(C).filter(function(n){return n.indexOf(w)===0}).sort().map(function(n){return [n,' ']});
  }else{
    if(k>=0){dir=w.slice(0,k+1);base=w.slice(k+1)}
    d=find(dir.replace(/^(~|\$HOME)(?=\/|$)/,ST.home)||'.'); /* ~/ and $HOME/ look in the home folder; what was typed stays */
    if(d&&d.type==='d'&&!d.prot)L=Object.keys(d.kids).filter(function(n){return n.indexOf(PROFILE.fold(base))===0&&(n.charAt(0)!=='.'||base.charAt(0)==='.')}).sort()
      .map(function(n){return [n,d.kids[n].type==='d'?'/':q?q+' ':' ']});
  }
  if(!L.length)return;
  if(L.length===1){TABBED=null;setBuf(pre+dir+esc(L[0][0])+L[0][1]);return}
  var c=L[0][0];
  L.forEach(function(x){while(x[0].indexOf(c)!==0)c=c.slice(0,-1)});
  if(c.length>base.length){TABBED=null;setBuf(pre+dir+esc(c));return}
  if(TABBED!==buf){TABBED=buf;return} /* the first tab only rings the bell */
  relist(inColumns(L.map(function(x){return x[0]+(x[1]==='/'?'/':'')})),buf);
}
function relist(lines,line){ /* print lines under the prompt, then ask again with line typed in */
  leavePrompt();
  say(lines);
  queue(function(){showPrompt();setBuf(line)},true);
}
function histNav(d){
  if(!hist.length)return;
  hi=Math.max(0,Math.min(hist.length,hi+d));
  setBuf(hist[hi]||'');
}
/* a full-screen program gets a phone keyboard's typing a key at a time. The keyboard composes each word in the input:
   it stays there until the word is done (emptied sooner, the keyboard types it all again), and the program gets what changed */
var fed='',keyed=null; /* what the program has had of the word; a key whose keydown already gave it */
function feedKb(done){
  var v=kb.value,i=0,j;
  if(done&&v===keyed&&!fed)v=''; /* a keyboard that inserts a key it has sent as a keydown */
  keyed=null;
  while(i<fed.length&&fed.charAt(i)===v.charAt(i))i++;
  for(j=fed.length;KEYS&&j>i;j--)KEYS('Backspace'); /* letters taken back, or a suggestion taken */
  for(;KEYS&&i<v.length;i++)KEYS(v.charAt(i));
  fed=v;
  if(done||!KEYS){kb.value='';fed=''}
}
kb.addEventListener('input',function(e){
  if(KEYS){feedKb(!e.isComposing);return}
  fed='';
  if(TELE.on){ /* the teletype: no small letters, no backspace (erase is #) */
    var v=kb.value,gone=buf.length-v.length;
    if(gone>0&&buf.slice(0,v.length)===v)v=buf+'#'.repeat(gone);else v=ttKeys(v);
    if(v!==buf)ttStrike(v.slice(-1));
    setBuf(v);return;
  }
  var grew=kb.value.length>buf.length;setBuf(kb.value);if(grew)click(.667);
});
kb.addEventListener('compositionend',function(){if(KEYS)feedKb(true)});
function navKey(e){ /* Enter, the history arrows and scrollback paging, typed in either place */
  var k=e.key,d=k==='ArrowUp'||k==='PageUp'?-1:1;
  if(PROFILE.dos&&!PROFILE.dcl&&(k==='ArrowUp'||k==='ArrowDown'))return false; /* no history here, and no doskey yet */
  if(PROFILE.dos&&!PROFILE.dcl&&k==='F3'&&bufNode&&hist.length){e.preventDefault();setBuf(hist[hist.length-1]);return true} /* the only history there is */
  if(k==='Enter')submit();
  else if(k==='Tab'&&PROFILE.bash&&!e.shiftKey)complete();
  else if((k==='Escape'||k==='?'||k==='Tab'&&!e.shiftKey)&&recognize(k)){}
  else if(k==='ArrowUp'||k==='ArrowDown')histNav(d);
  else if(k==='PageUp'||k==='PageDown')term.scrollTop+=d*.9*term.clientHeight;
  else return false;
  e.preventDefault();
  return true;
}
function atCursor(s){var at=cursor.parentNode;if(at)at.insertBefore(document.createTextNode(s),cursor)} /* text just before the cursor, where it is */
function interrupt(){ /* ^C: stop whatever is typing and go back to the prompt */
  var q=PH.onInterrupt&&!(bufNode&&!READ&&MODE!=='shell')?PH.onInterrupt(!!(READ&&TRAP)):null; /* a machine's own QUIT (Multics): what it shows instead of ^C; true when a program takes the ^C itself */
  if(q&&typeof q==='object'){if(q.same&&(bufNode||GL.n)&&cursor.parentNode){JOIN=cursor.parentNode;JOIN.attnCut=true}q=q.says} /* {says, same}: what it shows, and no new line: the next read goes on in this one, at a read or in a line cut short as it typed (VM/370's TERMINAL ATTN OFF) */
  atCursor(q==null?'^C':q);
  HOLD=false; /* and, as the tty did, undo a ^S: nothing waits for a ^Q that will not come */
  if(READ&&TRAP){finishRead(INT);return}
  if(bufNode&&!READ){ /* at a prompt: give up on this line */
    if(MODE!=='shell')return;
    leavePrompt();
    prompt();
    return;
  }
  if(FGJOB)signal(FGJOB,2,true); /* a job brought back with fg is the foreground's */
  GEN++;SINK=null;STDIN=null;STATUS=130;
  wakers.concat(FGP?FGP.wakers:[]).forEach(function(w){w()});
  resumeHeld();
  if(READ)finishRead(null);
}
function eof(){ /* ^D: end of input, or logout at an empty prompt */
  if(READ){finishRead((TELE.on?ttCanon(buf):buf)||null);return}
  if(bufNode&&MODE==='shell'&&!buf&&!PROFILE.dos){leavePrompt();run('exit')}
}
function ctrlKey(e){
  var k=(e.key||'').toLowerCase();
  if(k==='c'){if(String(window.getSelection&&getSelection()))return false;interrupt()}
  else if(k==='d')eof();
  else if(k==='z'&&PROFILE.dos)eof();
  else if(k==='z'&&control())tstp();
  else if(k==='s')HOLD=true;
  else if(k==='q'){HOLD=false;resumeHeld()}
  else if(k==='u')setBuf('');
  else return false;
  e.preventDefault();
  return true;
}
function teleKey(e){ /* the teletype's own keys: ^G rings its bell; RUB OUT (Delete) is V7's interrupt; after a ^S any key starts the output again */
  var k=(e.key||'').toLowerCase();
  if(e.metaKey||e.altKey)return false;
  if(e.ctrlKey&&k==='g'){e.preventDefault();ttBell();return true}
  if(!e.ctrlKey&&k==='delete'&&!KEYS){e.preventDefault();interrupt();return true}
  if(HOLD&&!(e.ctrlKey&&(k==='s'||k==='q'))&&(k.length===1||k==='enter')){HOLD=false;resumeHeld()}
  return false;
}
var NAMED=/^(Escape|Enter|Backspace|Tab|ArrowUp|ArrowDown|ArrowLeft|ArrowRight|PageUp|PageDown)$/;
document.addEventListener('keydown',function(e){
  keyed=null;
  if(KEYS){ /* a full-screen program has every key */
    if(e.metaKey||e.altKey||e.isComposing)return;
    if(e.ctrlKey&&(e.key||'').toLowerCase()==='z'&&tstp()){e.preventDefault();return} /* but ^Z, where there is job control: the tty's SIGTSTP */
    var name=e.ctrlKey&&e.key.length===1?'C-'+e.key.toLowerCase():e.key;
    if(TELE.on&&name.length===1&&!(name=ttKey(name))){e.preventDefault();return} /* a key the teletype does not have */
    if(name.length===1||NAMED.test(name)||/^C-/.test(name)){e.preventDefault();if(name.length===1)keyed=name;KEYS(name)}
    return;
  }
  if(TELE.on&&teleKey(e))return;
  if(e.ctrlKey&&!e.metaKey&&!e.altKey&&ctrlKey(e))return;
  if(e.ctrlKey||e.metaKey||e.altKey)return;
  if(e.target===kb){if(!e.isComposing)navKey(e);return}
  if(e.key==='Enter'&&e.target.closest&&e.target.closest('a'))return; /* Enter on a focused link opens it */
  var k=e.key;
  if(k!=='Tab'&&navKey(e)){if(k==='PageUp'||k==='PageDown')return} /* Tab off the input moves focus, as it should */ /* paging keeps focus where it is, on a link say */
  else if(k==='Backspace'&&TELE.on){e.preventDefault();setBuf(buf+'#');ttStrike('#')} /* no backspace key: V7's erase character */
  else if(k&&k.length===1&&TELE.on){e.preventDefault();k=ttKey(k);if(k){setBuf(buf+k);ttStrike(k)}}
  else if(k==='Backspace'){e.preventDefault();setBuf(buf.slice(0,-1));click(.556)}
  else if(k&&k.length===1){e.preventDefault();setBuf(buf+k);click(.667)}
  else return;
  if(!coarse)kb.focus({preventScroll:true});
});

/* a phone has no escape or control keys, and vi and DOS need them: a small row of them on the glass */
if(coarse){
  var soft=document.createElement('div');soft.id='softkeys';soft.setAttribute('aria-label','Keys a phone does not have');
  [['esc','Escape'],['^C','c'],['^D','d'],['^Z','z'],['tab','Tab']].forEach(function(b){
    var t=document.createElement('button');t.type='button';t.textContent=b[0];
    t.addEventListener('click',function(e){
      e.stopPropagation();
      var named=b[1].length>1;
      if(KEYS){if(!(b[1]==='z'&&tstp()))KEYS(named?b[1]:'C-'+b[1])}
      else if(!named)ctrlKey({key:b[1],preventDefault:function(){}});
      else if(b[1]==='Tab'&&PROFILE.bash)complete();
      else recognize(b[1]);
      kb.focus({preventScroll:true});
    });
    soft.appendChild(t);
  });
  $('#screen').appendChild(soft);
}

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
kb.addEventListener('focus',function(){ /* the keyboard slides in over about a third of a second, and the browser may scroll on the way */
  [60,250,500].forEach(function(t){setTimeout(fitViewport,t)});
});

/* ---------- cable ---------- */
var NS='http://www.w3.org/2000/svg';
function path(d,stroke,w){
  var p=document.createElementNS(NS,'path');
  p.setAttribute('d',d);p.setAttribute('fill','none');p.setAttribute('stroke',stroke);
  p.setAttribute('stroke-width',w);p.setAttribute('stroke-linecap','round');p.setAttribute('stroke-linejoin','round');
  return p;
}
/* cord settings come from site/config.js */
var CORD=PROFILE.cord,rx=CORD.width/2,sw=CORD.thickness,edge=sw+1.4,gap=CORD.gap,tilt=.35;
var pitch=edge+gap;                        /* drop per turn = cord + rim + gap. gap 0 = turns touching */
var narrow=matchMedia('(max-width:640px)'); /* a phone: the cable sits under the monitor in a fixed height */
var turns,coilLen;
function coilFor(){ /* "cord desktop" turns on a wide screen, "cord turns" on a phone */
  turns=Math.max(1,Math.round(!narrow.matches&&CORD.desktop?CORD.desktop:CORD.turns));
  coilLen=2*tilt*rx+(turns+.5)*pitch;
}
coilFor();
var lastW,lastH,lastNub; /* what the cable was last drawn for */
function drawCable(){
  var t=turns;coilFor();if(turns!==t)lastW=null; /* crossing the phone width changes the coil */
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
var vv=window.visualViewport,lastVH=-1;
function fitViewport(){
  var h=Math.round(vv?vv.height*(vv.scale||1):window.innerHeight); /* *scale: pinch-zoom must not shrink the rig */
  if(vv&&vv.offsetTop)window.scrollTo(0,0);
  if(h===lastVH){shortGlass();return}
  lastVH=h;
  var atEnd=term.scrollHeight-term.scrollTop-term.clientHeight<40; /* at the prompt, not reading back */
  if(h>0)document.documentElement.style.setProperty('--app-h',h+'px');
  shortGlass();
  if(atEnd)term.scrollTop=term.scrollHeight; /* keep the prompt in view as the glass resizes; leave a reader where they are */
  redraw();
}
function shortGlass(){ /* a phone whose keyboard leaves too little height for the glass and its cable: html.short puts the cable away */
  var r=document.documentElement,b=$('#bezel');
  r.classList.remove('short');
  if(b&&narrow.matches&&b.getBoundingClientRect().top<0)r.classList.add('short');
}
fitViewport();
if(vv){vv.addEventListener('resize',fitViewport);vv.addEventListener('scroll',function(){if(vv.offsetTop)fitViewport()})}
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
  requestAnimationFrame(function(){setTimeout(fxDetect)}); /* after the first frame, during the warm-up */
  if(!coarse)kb.focus({preventScroll:true});
  pause(900); /* tube warm-up */
  problems();
  banner();
  (PROFILE.raw.boot||[]).forEach(function(raw){ /* the machine coming up: "text @ms" waits after the line */
    var m=raw.match(/^(.*?)\s*@(\d+)$/),t=m?m[1]:raw;
    typeLine(t.replace(/^~\s?/,''),/^~/.test(t)?'dim':'',null,{speed:.12});
    if(m)pause(+m[2]);
  });
  if(!PROFILE.noLogin){
    typeLine(ST.user,'',null,{pre:PROFILE.loginPrompt,hold:700,speed:2.2}); /* first visit: auto-login as guest */
    pause(450);
  }
  welcome();
  prompt();
}
function banner(){ /* terminal self-test from the machine's == banner == section; replayed after exit */
  if(TELE.on)return; /* a teletype has no self-test to type */
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
  if(PROFILE.mail.length&&!RP&&PROFILE.mailNotice)typeLine(PROFILE.mailNotice); /* the letter is the guest's, not root's; a machine that says it itself (Multics) empties the notice */
  if(coarse)typeLine('(tap the screen for a keyboard.)','dim');
}
boot();
}
})();
