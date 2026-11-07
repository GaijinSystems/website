/* PHOSPHOR-9 terminal: machine "multics-1981", the Multics command processor: the login dialogue, command lines
   with quotes, [active functions] and (iteration), the ready message, QUIT and command levels, the storage system
   commands, who, help, mail and messages, and exec_com. qedx is in qedx.js.
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE.
   The messages are Multics's, from the MR8.0 manuals (AG92-03A, CH24, CH25) and checked against MR12.8 running
   under the DPS8M simulator; where the two differ, the 1980 manuals win. The info segments are this terminal's. */
(function(P){
'use strict';
var M=P.multics={};
var VERSION='MR8.0';
var S={ran:false,on:false,person:'',project:'',priv:false,level:1,ready:true,cpu:0,pf:0,quit:false,login:null,
  used:0,tries:0,accepting:false,msgs:[],motdSeen:{},home:''};
var GUEST={person:'Guest',project:'Guest'};
function cap(s){s=String(s||'');return s.charAt(0).toUpperCase()+s.slice(1)}
function owner(){return cap(P.profile.owner)}
function repair(){return cap(P.profile.rootName||'repair')}
function out(s){P.typeLine(s)}
function say(L){P.say(L)}
function err(s){P.typeLine(s,'err')}
function bad(cmd,what,path){err(cmd+': '+what+(path?' '+path:''))}
M.out=out;M.err=err;M.bad=bad;M.S=S;

/* ---------- dates: 05/02/80  0907.5 mst Fri ---------- */
var DAYS=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],DAYN=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
  MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
function zone(){var z=String(P.tz()||'');return /^[A-Za-z]{3,4}$/.test(z)?z.toLowerCase():'mst'}
function mdy(d){return P.p2(d.getMonth()+1)+'/'+P.p2(d.getDate())+'/'+P.p2(d.getFullYear()%100)}
function hhmm(d){return P.p2(d.getHours())+P.p2(d.getMinutes())+'.'+Math.floor(d.getSeconds()/6)}
function hm(d){return P.p2(d.getHours())+':'+P.p2(d.getMinutes())}
function dt(d){return mdy(d)+'  '+hhmm(d)+' '+zone()+' '+DAYS[d.getDay()]}
M.dt=dt;M.mdy=mdy;M.zone=zone;

/* ---------- names: >a>b is /a/b; < goes up; added names lead to the same entry ---------- */
function mp(abs){return abs==='/'?'>':abs.replace(/\//g,'>')}
function dirOf(abs){return abs.slice(0,abs.lastIndexOf('/'))||'/'}
function join(dir,name){return (dir==='/'?'':dir)+'/'+name}
function node(abs){return P.find(abs,true)}
M.mp=mp;M.node=node;M.join=join;
M.names=function(n,also){ /* give a node its added names, each a key in its directory */
  if(!n)return;
  n.names=[n.name].concat((also||[]).filter(function(x){return x!==n.name}));
  n.names.slice(1).forEach(function(x){n.parent.kids[x]=n});
};
function namesOf(n){return n.names||[n.name]}
function kidsOf(d){ /* each entry once, primary name first, newest first as a directory shows them */
  var L=[];
  Object.keys(d.kids).forEach(function(k){var n=d.kids[k];if(L.indexOf(n)<0)L.push(n)});
  return L.sort(function(a,b){return (b.date||0)-(a.date||0)||(a.seq||0)-(b.seq||0)});
}
M.kidsOf=kidsOf;
var SEQ=0;
function stamp(n){if(n){n.date=P.now();n.seq=--SEQ}return n}
M.stamp=stamp;
function path(s){ /* {dir:abs of the containing directory, name, abs, shown, n, err} */
  s=String(s);
  var base,rest,shown;
  if(s.charAt(0)==='>'){base='/';rest=s.slice(1);shown=''} /* an absolute path is shown as it was typed */
  else{
    base=P.st.cwd;rest=s;
    while(rest.charAt(0)==='<'){if(base==='/')return {err:'Entry not found.',shown:'>'};base=dirOf(base);rest=rest.slice(1)}
    shown=base==='/'?'':mp(base);
  }
  if(/</.test(rest))return {err:'Syntax error in pathname.',shown:s};
  if(rest==='')return {dir:dirOf(base),name:base==='/'?'':base.slice(base.lastIndexOf('/')+1),abs:base,shown:mp(base),n:node(base),root:base==='/'};
  var C=rest.split('>'),d=node(base);
  if(C.some(function(c){return !c}))return {err:'Null entry name.',shown:s};
  if(C.some(function(c){return c.length>32}))return {err:'Entry name too long.',shown:s};
  for(var i=0;i<C.length-1;i++){
    var k=d&&d.type==='d'&&P.has(d.kids,C[i])?d.kids[C[i]]:null;
    if(k&&k.type!=='d')return {err:'Entry is not a directory.',shown:(s.charAt(0)==='>'?'':shown)+'>'+C.slice(0,i+1).join('>')};
    if(!k)return {err:'Some directory in path specified does not exist.',shown:(s.charAt(0)==='>'?'':shown)+'>'+C.join('>')};
    d=k;
  }
  var dabs=P.pathOf(d),name=C[C.length-1],n=P.has(d.kids,name)?d.kids[name]:null;
  return {dir:dabs,name:name,abs:n?P.pathOf(n):join(dabs,name),shown:(s.charAt(0)==='>'?(C.length>1?'>'+C.slice(0,-1).join('>'):''):shown+(C.length>1?'>'+C.slice(0,-1).join('>'):''))+'>'+name,n:n,dn:d};
}
M.path=path;

/* ---------- access: modes from the ACL, else from where the entry is ---------- */
function uid(){return S.person+'.'+S.project+'.a'}
function aclMatch(pat){
  var p=pat.split('.'),u=uid().split('.');
  while(p.length<3)p.push('*');
  for(var i=0;i<3;i++)if(p[i]!=='*'&&p[i]!==u[i])return false;
  return true;
}
function stars(pat){return (pat.match(/\*/g)||[]).length}
function inHome(abs){return S.home&&(abs===S.home||abs.indexOf(S.home+'/')===0)}
function modes(n){
  if(!n||n.mbx)return '';
  if(S.priv)return n.type==='d'?'sma':n.bin?'re':'rw';
  if(n.prot)return '';
  if(n.acl){
    var hit=n.acl.slice().sort(function(a,b){return stars(a[1])-stars(b[1])}).filter(function(e){return aclMatch(e[1])})[0];
    return hit?(hit[0]==='null'?'':hit[0]):'';
  }
  var abs=P.pathOf(n);
  if(inHome(abs))return n.type==='d'?'sma':n.bin?'re':'rw';
  return n.type==='d'?'s':n.bin?'re':'r';
}
function can(n,m){var x=modes(n);return m.split('').every(function(c){return x.indexOf(c)>=0})}
M.modes=modes;M.can=can;
function mfmt(n){ /* r w, re, rew, sma: the letters in their places */
  var x=modes(n);
  if(n.type==='d')return x;
  return ['r','e','w'].map(function(c){return x.indexOf(c)>=0?c:' '}).join('').replace(/\s+$/,'');
}
function chars(L){return L.reduce(function(a,l){return a+l.length+1},0)} /* a segment's characters, a newline after each line */
function recs(n){
  if(n.type==='d')return 0;
  if(n.recs!=null)return n.recs;
  return Math.ceil(chars(P.text(n))/4096);
}
M.recs=recs;
var QUOTA=1024; /* records a home directory may hold: 4 MB of characters */
function used(){var d=node(S.home),t=0;(function walk(x){kidsOf(x).forEach(function(k){if(k.type==='d')walk(k);else t+=recs(k)})})(d||{kids:{}});return t}
M.write=function(abs,lines){ /* a segment's new text, or false when it cannot be written */
  var n=node(abs),d=node(dirOf(abs));
  if(!d||d.type!=='d')return 'Some directory in path specified does not exist.';
  if(n&&n.type==='d')return 'This operation is not allowed for a directory.';
  if(n&&!can(n,'w'))return 'Incorrect access on entry.';
  if(!n&&!can(d,'a'))return 'Incorrect access to directory containing entry.';
  if(inHome(abs)&&used()-(n?recs(n):0)+Math.ceil(chars(lines)/4096)>QUOTA)return 'Record quota overflow.';
  if(n){n.body=lines.slice();n.recs=null;n.bin=false;stamp(n)}
  else{n=P.put(abs,'f',{owner:S.person,body:lines.slice()});stamp(n);n.acl=[['rw',S.person+'.'+S.project+'.*'],['rw','*.SysDaemon.*']]}
  M.changed();
  return true;
};

/* ---------- the visitor's home in this browser: what was made, changed or deleted there ---------- */
var ORIG=null,KEY='multics/home';
function snap(){ /* path -> what it holds */
  var o={},h=node(GUEST.home);
  if(!h)return o;
  (function walk(d){kidsOf(d).forEach(function(n){
    var a=P.pathOf(n);if(n.mbx)return;
    o[a.slice(GUEST.home.length+1)]=n.type==='d'?{t:'d',nm:namesOf(n).slice(1),acl:n.acl||null}:{t:'f',b:P.text(n),nm:namesOf(n).slice(1),d:+(n.date||0),acl:n.acl||null};
    if(n.type==='d')walk(n);
  })})(h);
  return o;
}
M.changed=function(){
  if(!ORIG||!S.on||S.person!==GUEST.person)return;
  var now=snap(),keep={},gone=[];
  Object.keys(now).forEach(function(k){if(JSON.stringify(now[k])!==JSON.stringify(ORIG[k]))keep[k]=now[k]});
  Object.keys(ORIG).forEach(function(k){if(!P.has(now,k))gone.push(k)});
  P.save(KEY,Object.keys(keep).length||gone.length?{v:1,keep:keep,gone:gone}:null);
};
function restore(){
  var s=P.saved(KEY);
  if(!s||typeof s!=='object'||s.v!==1)return;
  (Array.isArray(s.gone)?s.gone:[]).forEach(function(k){
    var r=typeof k==='string'&&path('>'+mp(GUEST.home).slice(1)+'>'+k.replace(/\//g,'>'));
    if(r&&r.n&&r.dn)namesOf(r.n).forEach(function(x){delete r.dn.kids[x]});
  });
  var keep=s.keep&&typeof s.keep==='object'?s.keep:{};
  Object.keys(keep).sort().forEach(function(k){
    var e=keep[k],abs=GUEST.home+'/'+k;
    if(!e||!/^[\w.$-]+(\/[\w.$-]+)*$/.test(k)||k.split('/').some(function(c){return /^\.+$/.test(c)||c.length>32}))return;
    var n=e.t==='d'?P.put(abs,'d',{owner:GUEST.person}):Array.isArray(e.b)?P.put(abs,'f',{owner:GUEST.person,body:e.b.map(String),date:new Date(+e.d||P.now())}):null;
    if(!n)return;
    if(Array.isArray(e.acl))n.acl=e.acl.filter(function(a){return Array.isArray(a)&&a.length===2}).map(function(a){return [String(a[0]),String(a[1])]});
    if(Array.isArray(e.nm))M.names(n,e.nm.map(String).filter(function(x){return /^[\w.$-]{1,32}$/.test(x)}));
  });
}
function ensureHome(){ /* the site's segments are there by now: note them, then put back what this browser kept */
  if(ORIG)return;
  var h=node(GUEST.home);
  if(!h)h=P.put(GUEST.home,'d',{owner:GUEST.person});
  h.acl=[['sma','Guest.Guest.*'],['sma','*.SysDaemon.*']];
  (function own(d){Object.keys(d.kids).forEach(function(k){var n=d.kids[k];n.owner=GUEST.person;if(n.type==='d')own(n)})})(h); /* the site's files are the guest's */
  if(!P.has(h.kids,'start_up.ec'))P.put(GUEST.home+'/start_up.ec','f',{owner:GUEST.person,body:['&command_line off','&if [equal &1 new_proc] &then &goto new_proc','print_motd',
    '&if [have_mail] &then string "You have mail."','&label new_proc','accept_messages','&quit']});
  ORIG=snap();
  restore();
  P.put(GUEST.home+'/Guest.mbx','f',{owner:GUEST.person,mbx:true,body:[],date:P.systemDate});
}
M.ensureHome=ensureHome;
M.ownerDir=function(){
  var o=owner();
  if(o===GUEST.person||o===repair())return;
  P.put('/user_dir_dir/SysAdmin/'+o,'d',{owner:o,acl:[['sma',o+'.SysAdmin.*'],['sma','*.SysDaemon.*']]});
  P.put('/user_dir_dir/SysAdmin/'+o+'/'+o+'.mbx','f',{owner:o,mbx:true,body:[]});
};

/* ---------- the mailbox: the site's letter, and whatever the guest sends to Guest.Guest ---------- */
var MAIL={gone:false,read:false,extra:[]};
function letter(){return P.profile.mail.map(function(l){return P.lineOf(l)})}
function messages(){
  var L=[],b=letter();
  if(S.person===GUEST.person&&!MAIL.gone&&b.length){
    var when=new Date(S.login.getTime()-(3*60+12)*6e4);
    L.push({from:owner()+'.SysAdmin',date:when,subject:'Welcome',body:b,site:true});
  }
  return L.concat(S.person===GUEST.person?MAIL.extra:[]);
}
function haveMail(){return messages().length>0}
M.messages=messages;M.haveMail=haveMail;
function delMessage(m){if(m.site)MAIL.gone=true;else MAIL.extra.splice(MAIL.extra.indexOf(m),1)}

/* ---------- the ready message: r 09:07 1.486 34, after every command line ---------- */
function charge(w){S.cpu+=(w||1)*(0.008+Math.random()*0.03);S.pf+=Math.floor(Math.random()*4*(w||1))}
M.charge=charge;
function readyLine(){return 'r '+hm(P.now())+' '+S.cpu.toFixed(3)+' '+S.pf+(S.level>1?' level '+S.level:'')}
function ready(){
  EC.depth=0; /* back at command level: no exec_com is running, even one ^C stopped half way */
  if(!S.on||!S.ran&&!S.quit)return '';
  var s=S.quit?'QUIT\n':'';
  S.quit=false;S.ran=false;
  if(S.ready)s+=readyLine()+'\n';
  settle();
  return s;
}
function settle(){S.used+=S.cpu;S.cpu=0;S.pf=0} /* this command line's charges go on the session's */
P.onInterrupt=function(taken){ /* QUIT: the BREAK key. A new command level, which release or start leaves; a program that takes it does that itself */
  if(!S.on)return null;
  if(!taken){S.level++;S.quit=true;S.cpu+=0.02}
  return '';
};

/* ---------- a command line: erase and kill, ; between commands, quotes, [active functions], (iteration) ---------- */
function edit(raw){ /* # erases the character before it, @ the whole line so far, and \ takes the next one as it is */
  var o='';
  for(var i=0;i<raw.length;i++){
    var c=raw.charAt(i);
    if(c==='\\'&&i+1<raw.length&&/[#@\\]/.test(raw.charAt(i+1))){o+=raw.charAt(++i);continue}
    if(c==='#'){o=o.replace(/[ \t]*$/,'').slice(0,-1);continue}
    if(c==='@'){o='';continue}
    o+=c;
  }
  return o;
}
M.edit=edit;
function splitLine(s){ /* at ; outside quotes and brackets */
  var L=[],cur='',q=false,b=0;
  for(var i=0;i<s.length;i++){
    var c=s.charAt(i);
    if(c==='"')q=!q;
    else if(!q&&c==='[')b++;
    else if(!q&&c===']')b=Math.max(0,b-1);
    if(c===';'&&!q&&!b){L.push(cur);cur='';continue}
    cur+=c;
  }
  L.push(cur);
  return L;
}
function CPErr(m){this.msg=m}
function words(s){ /* {w:[...], iter:[indexes of the ( ) words]}; throws CPErr */
  var W=[],cur=null,i=0,iter=[],group=null;
  function push(){if(cur!==null){if(group)group.push(cur);else W.push(cur)}cur=null}
  while(i<s.length){
    var c=s.charAt(i);
    if(c===' '||c==='\t'){push();i++;continue}
    if(c==='"'){
      var j=i+1,t='';
      for(;;){
        if(j>=s.length)throw new CPErr('Quotes do not balance.');
        if(s.charAt(j)==='"'){if(s.charAt(j+1)==='"'){t+='"';j+=2;continue}break}
        t+=s.charAt(j++);
      }
      cur=(cur||'')+t;i=j+1;continue;
    }
    if(c==='['){
      var d=1,k=i+1,qq=false;
      for(;k<s.length&&d;k++){var e=s.charAt(k);if(e==='"')qq=!qq;else if(!qq&&e==='[')d++;else if(!qq&&e===']')d--}
      if(d)throw new CPErr('Brackets do not balance.');
      var v=af(s.slice(i+1,k-1)),vw=words(v).w;
      if(vw.length){cur=(cur||'')+vw[0];for(var x=1;x<vw.length;x++){push();cur=vw[x]}}
      else if(cur===null&&!/\S/.test(s.charAt(k)||' '))cur=null;
      i=k;continue;
    }
    if(c===']')throw new CPErr('Brackets do not balance.');
    if(c==='('&&!group&&cur===null){group=[];i++;continue}
    if(c===')'&&group){push();iter.push(W.length);W.push(group);group=null;i++;continue}
    if(c==='('||c===')')throw new CPErr('Parentheses do not balance.');
    cur=(cur||'')+c;i++;
  }
  if(group)throw new CPErr('Parentheses do not balance.');
  push();
  return {w:W,iter:iter};
}
function af(str){ /* an active function's value */
  var r=words(str),w=r.w.map(function(x){return Array.isArray(x)?x.join(' '):x}),n=w[0];
  if(!n)return '';
  var f=P.has(AF,n)?AF[n]:null;
  if(!f){
    if(P.has(CMD,n))throw new CPErr(n+': This command cannot be invoked as an active function.');
    throw new CPErr('Segment '+n+' not found.');
  }
  return String(f(w.slice(1)));
}
M.af=af;
function quote(s){return '"'+String(s).replace(/"/g,'""')+'"'}

var CMD=Object.create(null),AF=Object.create(null),PRE=Object.create(null),TERM={};
M.CMD=CMD;M.AF=AF;
function cmd(names,run,o){names.forEach(function(n){CMD[n]=Object.assign({name:names[0],run:run},o||{})})}
M.cmd=cmd;
function line(raw,fromEc){ /* one typed line, everything in it, each command in its turn */
  var s=fromEc?raw:edit(raw);
  if(/\S/.test(s))S.ran=true;
  splitLine(s).forEach(function(c){
    P.queue(function(){one(c,fromEc)});
  });
}
M.line=line;
function one(c,fromEc){
  if(!/\S/.test(c))return;
  if(!S.on){preLogin(c);return}
  var r;
  try{r=words(c)}catch(e){if(e instanceof CPErr){err(/^Segment |: /.test(e.msg)?e.msg:'command_processor_: '+e.msg);charge();return}throw e}
  var W=r.w;
  if(!W.length)return;
  if(r.iter.length){ /* (a b c): the command once for each; two sets go side by side, a with c, b with d */
    var len=W[r.iter[0]].length;
    if(r.iter.some(function(k){return W[k].length!==len})){err('command_processor_: Mismatched iteration sets.');charge();return}
    for(var x=0;x<len;x++)(function(x){var X=W.slice();r.iter.forEach(function(k){X[k]=W[k][x]});P.queue(function(){exec(X)})})(x);
    return;
  }
  exec(W);
}
function exec(W){
  var n=W[0],a=W.slice(1);
  charge();
  if(Array.isArray(n)){err('command_processor_: Parentheses do not balance.');return}
  if(P.has(TERM,n)&&!P.has(CMD,n)){TERM[n](a,n+' '+a.join(' '),[n].concat(a));return}
  if(!P.has(CMD,n)){
    var r=path(n); /* a segment of that name in the working directory is found, and is not a program */
    if(!r.err&&r.n&&r.n.type==='f'&&!r.n.bin&&n.indexOf('>')<0){err('command_processor_: Linkage section not found. '+n);return}
    err('Segment '+n.split('>').pop()+' not found.');return;
  }
  var c=CMD[n];
  c.run(a,n);
}
M.exec=exec;

/* ---------- control arguments ---------- */
function ctl(cmd,a,known){ /* split -args from the rest; an unknown one is reported and stops the command */
  var o={rest:[],bad:false},i;
  for(i=0;i<a.length;i++){
    var x=a[i];
    if(x.charAt(0)==='-'&&x.length>1&&!/^-\d/.test(x)){
      var k=null;
      Object.keys(known).forEach(function(key){if(known[key].replace(/=/g,'').split(',').indexOf(x)>=0)k=key});
      if(k===null){bad(cmd,'Specified control argument is not implemented by this command.',x);o.bad=true;return o}
      if(/=$/.test(known[k].split(',')[0])){ /* takes a value */
        if(i+1>=a.length){bad(cmd,'Expected argument missing.','Following '+x+'.');o.bad=true;return o}
        o[k]=a[++i];
      }else o[k]=true;
      continue;
    }
    o.rest.push(x);
  }
  return o;
}
M.ctl=ctl;
function query(q,then){ /* yes or no, and nothing else, typed on the question's line */
  out('');
  (function again(p){
    P.ask(p+'  ',function(l){
      if(l===null||l===P.INT){then(false,l);return}
      var w=String(l).trim();
      if(w==='yes'||w==='y'){then(true);return}
      if(w==='no'||w==='n'){then(false);return}
      again('Please answer yes or no. ');
    },true);
  })(q+'    ');
}
M.query=query;
function quitHere(l){if(l===P.INT){S.level++;S.quit=true}} /* ^C at a question is QUIT too */
M.quitHere=quitHere;

/* ---------- star names: * one component's worth, ** any number, ? one character ---------- */
function starRe(s){
  var r='';
  s.split('.').forEach(function(c,i,A){
    var part=c==='**'?'(?:[^]*)':c.replace(/[.+^${}()|\\\[\]]/g,'\\$&').replace(/\*/g,'[^.]*').replace(/\?/g,'[^.]');
    r+=(i?(A[i-1]==='**'||c==='**'?'\\.?':'\\.'):'')+part;
  });
  return new RegExp('^'+r+'$');
}
function isStar(s){return /[*?]/.test(s)}
function starMatch(dir,pat,filter){ /* the entries of dir with a name that matches, each once */
  var re=starRe(pat);
  return kidsOf(dir).filter(function(n){return namesOf(n).some(function(x){return re.test(x)})&&(!filter||filter(n))});
}
M.starMatch=starMatch;M.isStar=isStar;

/* ---------- list ---------- */
cmd(['list','ls'],function(a,name){
  var o=ctl('list',a,{all:'-all,-a',dr:'-directory,-dr',sg:'-segment,-sg',pn:'-pathname=,-pn=',bf:'-brief,-bf',tt:'-total,-tt',nm:'-name,-nm',
    pr:'-primary,-pri',len:'-length,-ln',dtm:'-date_time_modified,-dtm',rv:'-reverse,-rv',mode:'-mode,-md',nhe:'-no_header,-nhe'});
  if(o.bad)return;
  var dirAbs=P.st.cwd,dirShown=mp(P.st.cwd),pats=o.rest.slice();
  if(o.pn){
    var r0=path(o.pn);
    if(r0.err){bad('list',r0.err,r0.shown);return}
    if(!r0.n&&!r0.root){bad('list','Entry not found.',r0.shown);return}
    if(!r0.root&&r0.n.type!=='d'){bad('list','Entry is not a directory.',r0.shown);return}
    dirAbs=r0.root?'/':r0.abs;dirShown=r0.shown;
  }
  var groups=[]; /* [dir abs, shown, pattern] */
  if(!pats.length)groups.push([dirAbs,dirShown,'**',false]);
  pats.forEach(function(sp){
    if(o.pn||sp.indexOf('>')<0&&sp.charAt(0)!=='<'){groups.push([dirAbs,dirShown,sp,true]);return}
    var r=path(sp);
    if(r.err){bad('list',r.err,r.shown);return}
    groups.push([r.dir,r.shown.slice(0,r.shown.lastIndexOf('>'))||'>',r.name,true]);
  });
  groups.forEach(function(g){
    var d=node(g[0]),pat=g[2],named=g[3];
    if(!d){bad('list','Some directory in path specified does not exist.',g[1]);return}
    if(!can(d,'s')){bad('list','Incorrect access to directory containing entry.',g[1]);return}
    var segT=o.sg||!o.dr&&(o.all||named),dirT=o.dr||o.all||named&&!o.sg;
    if(!o.sg&&!o.dr&&!o.all&&!named){segT=true;dirT=false}
    var all=kidsOf(d);
    if(!all.length){out('Directory empty: '+g[1]);return}
    var L=starMatch(d,pat,function(n){return n.type==='f'?segT:dirT});
    if(o.rv)L.reverse();
    if(!L.length&&named){
      if(!isStar(pat)&&!starMatch(d,pat).length){err('list: "'+pat+'" not found'+(g[1]!==dirShown||o.pn?' in '+g[1]:'.'));return}
      err('list: Use of star convention resulted in no match.  '+pat);return;
    }
    var segs=L.filter(function(n){return n.type==='f'}),dirs=L.filter(function(n){return n.type==='d'}),R=[];
    function names(n,first,ind){var N=o.pr?[namesOf(n)[0]]:namesOf(n);R.push(first+N[0]);N.slice(1).forEach(function(x){R.push(' '.repeat(ind)+x)})}
    if(segT&&(segs.length||!dirT)){
      var tot=segs.reduce(function(a2,n){return a2+recs(n)},0);
      if(!o.nhe&&!o.bf)R.push('','Segments = '+segs.length+', Lengths = '+tot+'.');
      if(!o.tt&&segs.length){R.push('');segs.forEach(function(n){names(n,(n.mbx?'':mfmt(n)).padEnd(4)+String(n.mbx?0:recs(n)).padStart(4)+'  ',10)})}
    }
    if(dirT&&(dirs.length||!segT)){
      if(!o.nhe&&!o.bf)R.push('','Directories = '+dirs.length+'.');
      if(!o.tt&&dirs.length){R.push('');dirs.forEach(function(n){names(n,mfmt(n).padEnd(5),7)})}
    }
    R.push('');
    say(R);
  });
  charge(2);
});

/* ---------- print ---------- */
var TABS=10;
function tabs(s){ /* Multics stops every ten columns */
  var o='';
  for(var i=0;i<s.length;i++){var c=s.charAt(i);if(c==='\t'){o+=' ';while(o.length%TABS)o+=' '}else o+=c}
  return o;
}
M.tabs=tabs;
function garble(n,max){ /* a non-ASCII segment, as print shows one: octal escapes, and \c where a line goes on */
  var h=0,s=namesOf(n)[0],o=[],cur='';
  for(var i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))>>>0;
  for(var k=0;k<(max||24);k++){
    h=(h*1103515245+12345)>>>0;
    var x=(h>>>16)%9,t=x<5?'\\000':x<7?'\\'+((h>>>8)%8)+((h>>>5)%8)+((h>>>2)%8):String.fromCharCode(48+(h>>>9)%43);
    if(cur.length+t.length>79){o.push(cur);cur='\\c'}
    cur+=t;
  }
  o.push(cur);
  return o;
}
M.garble=garble;
cmd(['print','pr'],function(a){
  var o=ctl('print',a,{});
  if(o.bad)return;
  if(!o.rest.length){bad('print','Expected argument missing.','No pathname given.');return}
  var r=path(o.rest[0]);
  if(r.err){bad('print',r.err,r.shown);return}
  if(!r.n){bad('print','Entry not found.',r.shown);return}
  if(r.n.type==='d'){bad('print','This operation is not allowed for a directory.',r.shown);return}
  if(!can(r.n,'r')){bad('print','Incorrect access on entry.',r.shown);return}
  var from=o.rest[1],to=o.rest[2];
  if(from!==undefined&&!/^\d+$/.test(from)||to!==undefined&&!/^\d+$/.test(to)){bad('print','Non-numeric digits in argument.',from&&!/^\d+$/.test(from)?from:to);return}
  var L=r.n.bin?garble(r.n,Math.min(400,30*recs(r.n))):P.text(r.n).map(tabs);
  charge(1+L.length/40);
  if(from===undefined){
    say(['',tabs('\t\t'+r.name+'\t'+dt(r.n.date||P.systemDate)),'','']);
    say(L.length?L.concat(['','']):['']);
    return;
  }
  var b=Math.max(1,+from),e=to===undefined?L.length:+to;
  say(L.slice(b-1,e));
});

/* ---------- the working directory ---------- */
cmd(['print_wdir','pwd'],function(a){out(mp(P.st.cwd))});
cmd(['change_wdir','cwd'],function(a){
  var o=ctl('change_wdir',a,{});
  if(o.bad)return;
  if(!o.rest.length){P.st.cwd=S.home;return}
  var r=path(o.rest[0]);
  if(r.err&&r.err!=='Entry not found.'){bad('change_wdir',r.err,r.shown);return}
  if(!r.n&&!r.root){bad('change_wdir','Some directory in path specified does not exist.',r.shown);return}
  var n=r.root?P.root:r.n;
  if(n.type!=='d'){bad('change_wdir','Entry is not a directory.',r.shown);return}
  P.st.cwd=r.root?'/':r.abs;
});
cmd(['create_dir','cd'],function(a){
  var o=ctl('create_dir',a,{});
  if(o.bad)return;
  if(!o.rest.length){err('create_dir: Usage: create_dir paths');return}
  o.rest.forEach(function(p){
    P.queue(function(){
      var r=path(p);
      if(r.err){bad('create_dir',r.err,r.shown);return}
      var d=node(r.dir);
      if(!can(d,'a')){bad('create_dir','Incorrect access to directory containing entry.',r.shown);return}
      if(r.n){
        if(r.n.type!=='d'||!can(d,'m')){bad('create_dir','Name duplication.',r.shown);return}
        query('create_dir: Name duplication. Do you want to delete the old directory '+r.shown+'?',function(y,l){
          quitHere(l);
          if(!y)return;
          namesOf(r.n).forEach(function(x){delete d.kids[x]});
          stamp(P.put(r.abs,'d',{owner:S.person}));M.changed();
        });
        return;
      }
      stamp(P.put(r.abs,'d',{owner:S.person}));M.changed();
    });
  });
});

/* ---------- delete, delete_dir ---------- */
function targets(cmdName,p,filter,what){ /* the entries a path or star name means; reports and returns null if none */
  var r=path(p);
  if(r.err){bad(cmdName,r.err,r.shown);return null}
  var d=node(r.dir);
  if(isStar(r.name)){
    if(!can(d,'s')){bad(cmdName,'Incorrect access to directory containing entry.',r.shown);return null}
    var L=starMatch(d,r.name,filter);
    if(!L.length){bad(cmdName,'No '+what+' match the star name.',r.shown);return null}
    return L.map(function(n){return {n:n,d:d,shown:r.shown.slice(0,r.shown.lastIndexOf('>'))+'>'+namesOf(n)[0]}});
  }
  if(!r.n){bad(cmdName,'Entry not found.',r.shown);return null}
  return [{n:r.n,d:d,shown:r.shown}];
}
function unlink(t){namesOf(t.n).forEach(function(x){delete t.d.kids[x]})}
cmd(['delete','dl'],function(a){
  var o=ctl('delete',a,{bf:'-brief,-bf',lg:'-long,-lg',qy:'-query,-qy',force:'-force'});
  if(o.bad)return;
  if(!o.rest.length){err('delete: Usage: delete paths {-control_args}');return}
  o.rest.forEach(function(p){
    P.queue(function(){
      var T=targets('delete',p,function(n){return n.type==='f'},'segments');
      if(!T)return;
      T.forEach(function(t){
        if(t.n.type==='d'){bad('delete',t.shown+' is a directory. Use delete_dir.');return}
        if(t.n.mbx){bad('delete',t.shown+' is a mailbox. Use delete_mailbox.');return}
        if(!can(t.d,'m')||t.n.prot){bad('delete','Incorrect access to directory containing entry.',t.shown);return}
        unlink(t);if(o.lg)out('delete: Deleted segment '+t.shown+'.');
      });
      M.changed();
    });
  });
});
cmd(['delete_dir','dd'],function(a){
  var o=ctl('delete_dir',a,{force:'-force'});
  if(o.bad)return;
  if(!o.rest.length){err('delete_dir: Usage: delete_dir paths {-force}');return}
  o.rest.forEach(function(p){
    P.queue(function(){
      var T=targets('delete_dir',p,function(n){return n.type==='d'},'directories');
      if(!T)return;
      T.forEach(function(t){
        P.queue(function(){
          if(t.n.type!=='d'){bad('delete_dir','Entry is not a directory.',t.shown);return}
          if(!can(t.d,'m')||t.n.prot){bad('delete_dir','Incorrect access to directory containing entry.',t.shown);return}
          if(P.inUse(P.pathOf(t.n))&&P.st.cwd.indexOf(P.pathOf(t.n))===0){bad('delete_dir','Attempt to delete working directory.',t.shown);return}
          if(o.force){unlink(t);M.changed();return}
          query('delete_dir: Do you want to delete the '+(kidsOf(t.n).length?'':'empty ')+'directory '+t.shown+' ?',function(y,l){quitHere(l);if(y){unlink(t);M.changed()}});
        });
      });
    });
  });
});

/* ---------- rename, add_name, delete_name, copy, move ---------- */
function equalName(src,pat){ /* = takes the component of the old name in its place, == the whole old name */
  if(pat==='==')return src;
  var S1=src.split('.');
  return pat.split('.').map(function(c,i){return c==='='?(S1[i]||''):c==='=='?S1.slice(i).join('.'):c}).join('.');
}
function nameOk(cmdName,x){
  if(!x||x.length>32){bad(cmdName,x?'Entry name too long.':'Null entry name.',x);return false}
  if(/[<>*?]/.test(x)){bad(cmdName,'Invalid character in entry name.',x);return false}
  return true;
}
cmd(['rename','rn'],function(a){
  if(a.length<2||a.length%2){err('rename: Usage: rename path1 name1 {... pathN nameN}');return}
  for(var i=0;i<a.length;i+=2)(function(p,nn){
    P.queue(function(){
      var r=path(p);
      if(r.err){bad('rename',r.err,r.shown);return}
      if(!r.n){bad('rename','Entry not found.',r.shown);return}
      var d=node(r.dir),to=equalName(r.name,nn);
      if(!nameOk('rename',to))return;
      if(!can(d,'m')||r.n.prot){bad('rename','Incorrect access to directory containing entry.',r.shown);return}
      if(to===r.name)return;
      function go(){
        var N=namesOf(r.n),k=N.indexOf(r.name);
        N[k]=to;delete d.kids[r.name];d.kids[to]=r.n;if(k===0)r.n.name=to;r.n.names=N;M.changed();
      }
      var ex=P.has(d.kids,to)?d.kids[to]:null;
      if(ex===r.n){bad('rename','Name already on entry.',to+' on '+mp(join(r.dir,r.name))+'.');return} /* as MR12.8 says it */
      if(ex){
        var where=r.shown.slice(0,r.shown.lastIndexOf('>'))+'>'+to;
        if(namesOf(ex).length>1||ex.type==='d'){bad('rename','Name duplication.',where);return}
        query('rename: Name duplication. Do you want to delete the old segment '+where+'?',function(y,l){quitHere(l);if(y){namesOf(ex).forEach(function(x){delete d.kids[x]});go()}});
        return;
      }
      go();
    });
  })(a[i],a[i+1]);
});
cmd(['add_name','an'],function(a){
  if(a.length<2){err('add_name: Usage: add_name path names');return}
  var r=path(a[0]);
  if(r.err){bad('add_name',r.err,r.shown);return}
  if(!r.n){bad('add_name','Entry not found.',r.shown);return}
  var d=node(r.dir);
  if(!can(d,'m')||r.n.prot){bad('add_name','Incorrect access to directory containing entry.',r.shown);return}
  a.slice(1).forEach(function(x){
    x=equalName(r.name,x);
    if(!nameOk('add_name',x))return;
    if(P.has(d.kids,x)){if(d.kids[x]!==r.n)bad('add_name','Name duplication.',r.shown.slice(0,r.shown.lastIndexOf('>'))+'>'+x);return}
    d.kids[x]=r.n;r.n.names=namesOf(r.n).concat([x]);
  });
  M.changed();
});
cmd(['delete_name','dn'],function(a){
  if(!a.length){err('delete_name: Usage: delete_name paths');return}
  a.forEach(function(p){
    var r=path(p);
    if(r.err){bad('delete_name',r.err,r.shown);return}
    if(!r.n){bad('delete_name','Entry not found.',r.shown);return}
    var d=node(r.dir),N=namesOf(r.n);
    if(!can(d,'m')||r.n.prot){bad('delete_name','Incorrect access to directory containing entry.',r.shown);return}
    if(N.length<2){bad('delete_name','The operation would leave no names on entry.',r.shown);return}
    delete d.kids[r.name];N.splice(N.indexOf(r.name),1);r.n.names=N;r.n.name=N[0];
  });
  M.changed();
});
function copyOne(cmdName,src,dstSpec,move){
  P.queue(function(){
    var r=path(src);
    if(r.err){bad(cmdName,r.err,r.shown);return}
    if(!r.n){bad(cmdName,'Entry not found.',r.shown);return}
    if(r.n.type==='d'){bad(cmdName,'This operation is not allowed for a directory.',r.shown);return}
    if(r.n.mbx||!can(r.n,'r')){bad(cmdName,'Incorrect access on entry.',r.shown);return}
    if(move&&(!can(node(r.dir),'m')||r.n.prot)){bad(cmdName,'Incorrect access to directory containing entry.',r.shown);return} /* the old one must be deletable too */
    var spec=dstSpec||'==',t=path(spec);
    if(t.err){bad(cmdName,t.err,t.shown);return}
    var to=equalName(r.name,t.name),abs=join(t.dir,to),shown=t.shown.slice(0,t.shown.lastIndexOf('>'))+'>'+to,ex=node(abs);
    if(ex===r.n){bad(cmdName,'The two pathnames refer to the same segment.',shown);return}
    function go(){
      var res=M.write(abs,r.n.bin?[]:P.text(r.n));
      if(res!==true){bad(cmdName,res,shown);return}
      var n=node(abs);if(r.n.bin){n.bin=true;n.recs=r.n.recs}
      if(move){var rd=node(r.dir);namesOf(r.n).forEach(function(x){delete rd.kids[x]});M.changed()}
      charge(2);
    }
    if(ex){
      if(ex.type==='d'){bad(cmdName,'Name duplication.',shown);return}
      query(cmdName+': Name duplication. Do you want to delete the old segment '+shown+'?',function(y,l){quitHere(l);if(y)go()});
      return;
    }
    go();
  });
}
cmd(['copy','cp'],function(a){
  if(!a.length){err('copy: Usage: copy path1 {equal_name1 ... pathN {equal_nameN}}');return}
  for(var i=0;i<a.length;i+=2)copyOne('copy',a[i],a[i+1]);
});
cmd(['move','mv'],function(a){
  if(!a.length){err('move: Usage: move path1 {equal_name1 ... pathN {equal_nameN}}');return}
  for(var i=0;i<a.length;i+=2)copyOne('move',a[i],a[i+1],true);
});
function hidden(r){return !r.root&&!can(node(r.dir),'s')&&!modes(r.n)} /* no s on the directory and no access to the entry: nothing about it shows */
cmd(['status','st'],function(a){
  var r=a[0]?path(a[0]):{n:node(P.st.cwd),dir:dirOf(P.st.cwd)};
  if(r.err){bad('status',r.err,r.shown);return}
  var n=r.n;
  if(a[0]&&hidden(r)){bad('status','Incorrect access to directory containing entry.',r.shown);return}
  if(!n){bad('status','Entry not found.',r.shown);return}
  var L=[''];
  namesOf(n).forEach(function(x,i){L.push(i?'          '+x:'names:    '+x)});
  function f(k,v){L.push((k+':').padEnd(20)+v)}
  f('type',n.type==='d'?'directory':'segment');
  f('date used',dt(P.now()));
  f('date modified',dt(n.date||P.systemDate));
  f('branch modified',dt(n.date||P.systemDate));
  if(n.type==='f'){f('bit count',n.bin?recs(n)*36864:chars(P.text(n))*9);f('records used',n.mbx?0:recs(n))}
  f('mode',modes(n)||'null');
  L.push('');
  say(L);
});

/* ---------- access control lists ---------- */
function aclOf(n){
  if(n.acl)return n.acl;
  var me=(n.owner&&n.owner!==S.person?n.owner+'.*':S.person+'.'+S.project)+'.*';
  return n.type==='d'?[['sma',me],['sma','*.SysDaemon.*']]:[['rw',me],['rw','*.SysDaemon.*']];
}
function aclSort(A){ /* the order Multics keeps: a named person first, then a named project, then the tag */
  function k(e){var p=e[1].split('.');return (p[0]==='*'?4:0)+(p[1]==='*'?2:0)+(p[2]==='*'?1:0)}
  return A.map(function(e,i){return [e,i]}).sort(function(x,y){return k(x[0])-k(y[0])||x[1]-y[1]}).map(function(x){return x[0]});
}
function fullName(s){var p=String(s).split('.');while(p.length<3)p.push('*');return p.slice(0,3).join('.')}
function okMode(m,dir){return m!==''&&(dir?/^(s?m?a?|null|n)$/:/^(r?e?w?|null|n)$/).test(m)}
cmd(['list_acl','la'],function(a){
  var r=a[0]?path(a[0]):{n:node(P.st.cwd),shown:mp(P.st.cwd),abs:P.st.cwd};
  if(r.err){bad('list_acl',r.err,r.shown);return}
  if(!r.n){bad('list_acl','Entry not found.',r.shown);return}
  if(a[0]&&!can(node(r.dir),'s')){bad('list_acl','Incorrect access to directory containing entry.',r.shown);return}
  var who=a.slice(1).map(fullName),L=aclOf(r.n).filter(function(e){return !who.length||who.indexOf(e[1])>=0});
  if(who.length&&!L.length){who.forEach(function(w){bad('list_acl','User name not on access control list for branch.',w)});return}
  var R=[];
  L.forEach(function(e){R.push((e[0]==='null'?'null':e[0]).padEnd(6)+e[1])});
  R.push('');
  say(R);
});
cmd(['set_acl','sa'],function(a){
  if(a.length<2){err('set_acl: Usage: set_acl path mode1 {User_id1 ... modeN User_idN}');return}
  var r=path(a[0]);
  if(r.err){bad('set_acl',r.err,r.shown);return}
  if(!r.n){bad('set_acl','Entry not found.',r.shown);return}
  if(!can(node(r.dir),'m')){bad('set_acl','Incorrect access to directory containing entry.',r.shown);return}
  var A=aclOf(r.n).map(function(e){return e.slice()});
  for(var i=1;i<a.length;i+=2){
    var m=a[i],w=fullName(a[i+1]||S.person+'.'+S.project+'.*');
    if(m==='n')m='null';
    if(!okMode(m,r.n.type==='d')){bad('set_acl','Invalid mode specified for ACL.',a[i]);return}
    var ex=A.filter(function(e){return e[1]===w})[0];
    if(ex)ex[0]=m;else A.push([m,w]);
  }
  r.n.acl=aclSort(A);M.changed();
});
cmd(['delete_acl','da'],function(a){
  var r=path(a[0]||'');
  if(a[0]&&r.err){bad('delete_acl',r.err,r.shown);return}
  var n=a[0]?r.n:node(P.st.cwd);
  if(!n){bad('delete_acl','Entry not found.',r.shown);return}
  if(!can(node(r.dir),'m')){bad('delete_acl','Incorrect access to directory containing entry.',r.shown);return}
  var who=a.length>1?a.slice(1).map(fullName):[S.person+'.'+S.project+'.*'];
  n.acl=aclOf(n).filter(function(e){return who.indexOf(e[1])<0});
  M.changed();
});

/* ---------- who ---------- */
var BOOTED=null;
function others(){
  var L=[['IO','SysDaemon',0],['Backup','SysDaemon',0],['Kowalski','Physics',1],['Ortega','Library',1],['Feldman','Accounting',1],['Nakamura','Chem',1],['Brennan','SysAdmin',1]];
  var o=owner();
  if(o!==GUEST.person&&o!==repair())L.push([o,'SysAdmin',1]);
  return L;
}
function whoAll(){return others().concat(S.on?[[S.person,S.project,1,true]]:[])}
cmd(['who'],function(a){
  var o=ctl('who',a,{lg:'-long,-lg',bf:'-brief,-bf',nm:'-name,-nm',pj:'-project,-pj'});
  if(o.bad)return;
  var U=whoAll(),inter=U.filter(function(u){return u[2]}).length;
  var sel=o.rest.length?U.filter(function(u){return o.rest.some(function(x){var p=x.split('.');return (!p[0]||p[0]==='*'||p[0]===u[0])&&(!p[1]||p[1]==='*'||p[1]===u[1])})}):U;
  if(o.rest.length&&!sel.length){out('who: User not logged in.'+' '+o.rest.join(' '));return}
  var R=[];
  if(o.lg){
    R.push('','Multics '+VERSION+'; '+site(),'Load = '+load()+' out of 125.0 units; users = '+U.length+', '+inter+' interactive, '+(U.length-inter)+' daemons.',
      'Absentee users = 0 background; Max background absentee users = 3','System up since '+dt(BOOTED),'Last shutdown was at '+dt(new Date(BOOTED.getTime()-(41*60+7)*6e4)),'','    Login at      TTY  Load   User ID','');
    sel.forEach(function(u,i){var t=new Date(S.login.getTime()-(i*37+13)*6e4);if(u[3])t=S.login;R.push(mdy(t)+'  '+hm(t)+'  none  '+(u[2]?'1.0':'0.0')+'   '+u[0]+'.'+u[1])});
    R.push('');
  }else{
    if(!o.rest.length&&!o.bf)R.push('','Multics '+VERSION+', load '+load()+'/125.0; '+U.length+' users, '+inter+' interactive, '+(U.length-inter)+' daemons.','Absentee users 0/3');
    sel.forEach(function(u){R.push(u[0]+'.'+u[1])});
    R.push('');
  }
  say(R);
});
function site(){return P.st.site||P.profile.host}
cmd(['print_motd','pmotd'],function(){ /* only what this user has not seen: here, once a visit */
  if(S.motdSeen[S.person])return;
  S.motdSeen[S.person]=true;say(M.motd());
});
M.motd=function(){return P.profile.welcome0||[]};

/* ---------- active functions, also usable as commands that print their value ---------- */
function afn(names,f,asCmd){
  names.forEach(function(n){AF[n]=f});
  if(asCmd!==false)cmd(names,function(a){
    var v;
    try{v=f(a)}catch(e){if(e instanceof CPErr){err(e.msg);return}throw e}
    out(v);
  });
}
function bool(b){return b?'true':'false'}
afn(['working_dir','wd'],function(){return mp(P.st.cwd)});
afn(['home_dir','hd'],function(){return mp(S.home)});
afn(['process_dir','pd'],function(){return '>process_dir_dir>!BbHkWqLzXgM'});
afn(['date'],function(){return mdy(P.now())});
afn(['time'],function(){return hm(P.now())});
afn(['date_time'],function(){return dt(P.now())});
afn(['day_name'],function(){return DAYN[P.now().getDay()]});
afn(['month_name'],function(){return MONTHS[P.now().getMonth()]});
afn(['year'],function(){return String(P.now().getFullYear())});
afn(['user'],function(a){
  var k=a[0]||'name',d=S.login;
  var V={name:S.person,project:S.project,login_date:mdy(d),login_time:hm(d),term_type:'ASCII',term_id:'none',
    process_type:'interactive',anonymous:'false',absentee:'false',brief_bit:'false',preemption_time:hhmm(new Date(d.getTime()+36e5))};
  if(!P.has(V,k))throw new CPErr('user: Invalid keyword. '+k);
  return V[k];
});
afn(['string'],function(a){return a.join(' ')});
afn(['equal'],function(a){if(a.length!==2)throw new CPErr('equal: Usage: [equal string1 string2]');return bool(a[0]===a[1])},false);
afn(['not'],function(a){return bool(a[0]!=='true')},false);
afn(['and'],function(a){return bool(a.every(function(x){return x==='true'}))},false);
afn(['or'],function(a){return bool(a.some(function(x){return x==='true'}))},false);
afn(['have_mail'],function(){return bool(haveMail())},false);
cmd(['have_mail'],function(){out(haveMail()?'You have mail.':'No mail.')});
afn(['exists'],function(a){
  var r=path(a[1]||'');
  if(r.err||!r.n||!r.root&&!can(node(r.dir),'s'))return 'false'; /* MR12.8: without s on the directory, nothing is found there */
  var k=a[0];
  return bool(k==='entry'||k==='branch'||(k==='segment'&&r.n.type==='f')||(k==='directory'&&r.n.type==='d'));
},false);
afn(['path'],function(a){var r=path(a[0]||'');if(r.err)throw new CPErr('path: '+r.err+' '+r.shown);return r.n?mp(P.pathOf(r.n)):r.shown},false);
afn(['directory'],function(a){var r=path(a[0]||'');return r.err?'':mp(r.dir)},false);
afn(['entry'],function(a){var r=path(a[0]||'');return r.err?'':r.name},false);
afn(['plus'],function(a){return String(a.reduce(function(s,x){return s+(+x||0)},0))},false);
afn(['upper_case'],function(a){return a.join(' ').toUpperCase()},false);
afn(['lower_case'],function(a){return a.join(' ').toLowerCase()},false);
afn(['length'],function(a){return String(a.join(' ').length)},false);

cmd(['where','wh'],function(a){ /* which library segment a command is in, by the search rules */
  if(!a.length){err('where: Usage: where names');return}
  a.forEach(function(x){
    var hit=['/system_library_standard','/system_library_1','/system_library_unbundled','/system_library_tools'].map(function(d){var n=node(d);return n&&P.has(n.kids,x)?n.kids[x]:null}).filter(Boolean)[0];
    if(!hit||hit.bin&&!can(hit,'e')){bad('where','Segment not found.',x);return}
    out(mp(P.pathOf(hit)));
  });
});

/* ---------- command levels: QUIT leaves one behind; release and start take it away ---------- */
cmd(['release','rl'],function(a){
  if(S.level<2){err('release: There are no suspended invocations of the command processor.');return}
  S.level=a.indexOf('-all')>=0||a.indexOf('-a')>=0?1:S.level-1;
  M.drop();
});
cmd(['start','sr'],function(){
  if(S.level<2){err('start: There is no suspended computation to be restarted.');return}
  S.level--;
  M.resume();
});
cmd(['program_interrupt','pi'],function(){if(S.level<2){err('program_interrupt: There is no suspended invocation of a subsystem that supports the use of this command.');return}S.level--});
cmd(['ready_off','rdf'],function(){S.ready=false});
cmd(['ready_on','rdn'],function(){S.ready=true});
cmd(['ready','rdy'],function(){out(readyLine());settle()});
cmd(['new_proc'],function(){
  S.level=1;P.st.cwd=S.home;M.drop();
  out('');
  startUp('new_proc');
});

/* ---------- exec_com ---------- */
var EC={depth:0,run:0,steps:0}; /* exec_coms inside one another; run changes when the stack overflows and they all stop */
function ecRun(p,args,first){ /* one exec_com: its lines, &-statements, and the commands in it */
  if(EC.depth>=64){ /* MR12.8 runs out of stack 64 exec_coms down */
    EC.depth=0;EC.run++;S.level++;
    say(['','Error:  storage condition by directory_commands_$get_wdir_|6773','(>system_library_standard>bound_fscom1_)',
      'Not enough room in stack to complete processing.','system handler for error returns to command level']);
    return;
  }
  var r=path(/\.ec$/.test(p)?p:p+'.ec');
  if(r.err){bad('exec_com',r.err,r.shown);return}
  if(!r.n){bad('exec_com','Entry not found.',r.shown);return}
  if(r.n.type==='d'||!can(r.n,'r')){bad('exec_com','Incorrect access on entry.',r.shown);return}
  var L=P.text(r.n),echo=true,lastIf=true,ecname=r.name.replace(/\.ec$/,''),ecdir=mp(r.dir);
  function subst(s){
    return s.replace(/&(\d+|n|ec_name|ec_dir|f\d+|q\d+)/g,function(m,k){
      if(k==='n')return String(args.length);
      if(k==='ec_name')return ecname;
      if(k==='ec_dir')return ecdir;
      if(/^f\d/.test(k))return args.slice(+k.slice(1)-1).join(' ');
      if(/^q\d/.test(k))return quote(args[+k.slice(1)-1]||'');
      return args[+k-1]||'';
    });
  }
  function label(n){for(var i=0;i<L.length;i++){var m=L[i].match(/^&label\s+(\S+)/);if(m&&m[1]===n)return i+1}return -1}
  function cond(s){ /* the value of &if [...] */
    try{return words(s).w.join(' ')==='true'}
    catch(e){if(e instanceof CPErr){err(e.msg);return false}throw e}
  }
  function stmt(t,i){ /* returns the next line to run, or -1 to stop */
    var m;
    if(/^&command_line\s+off/.test(t)){echo=false;return i+1}
    if(/^&command_line\s+on/.test(t)){echo=true;return i+1}
    if(/^&(quit|return)\b/.test(t))return -1;
    if((m=t.match(/^&print\s?(.*)$/))){out(m[1]);return i+1}
    if(/^&label\b/.test(t))return i+1;
    if((m=t.match(/^&goto\s+(\S+)/))){var j=label(m[1]);if(j<0){err('exec_com: Label not found. '+m[1]);return -1}return j}
    if((m=t.match(/^&if\s+(.*?)(?:\s*&then\s*(.*?))?(?:\s*&else\s*(.*))?$/))){
      var c=cond(m[1]),then=m[2],els=m[3];lastIf=c;
      if(then===undefined&&/^&then\b/.test(L[i+1]||'')){then=L[i+1].replace(/^&then\s*/,'');i++;if(/^&else\b/.test(L[i+1]||'')){els=L[i+1].replace(/^&else\s*/,'');i++}}
      var pick=c?then:els;
      if(pick&&/\S/.test(pick)){
        pick=pick.trim();
        if(pick.charAt(0)==='&')return stmt(pick,i);
        command(pick);
      }
      return i+1;
    }
    if((m=t.match(/^&(then|else)\s*(.*)$/))){ /* on a line of its own, after the &if */
      if((m[1]==='then')===lastIf&&m[2]){if(m[2].charAt(0)==='&')return stmt(m[2],i);command(m[2])}
      return i+1;
    }
    if(/^&attach|^&detach|^&input_line|^&ready/.test(t))return i+1;
    if(/^&\s/.test(t)||t==='&')return i+1; /* a comment */
    err('exec_com: Invalid & statement: '+t);return -1;
  }
  function command(t){if(echo)out(t);line(t,true)}
  var run=EC.run;EC.depth++;
  (function next(i){
    if(run!==EC.run)return;
    if(i<0||i>=L.length){EC.depth--;return}
    P.queue(function(){
      var t=subst(L[i]).replace(/^\s+/,'');
      var j;
      if(t.charAt(0)==='&')j=stmt(t,i);
      else{if(t)command(t);j=i+1}
      if(++EC.steps%64===0)P.pause(0); /* now and then let the keyboard in, so ^C can stop an &goto loop */
      P.queue(function(){next(j)});
    });
  })(0);
}
M.ecRun=ecRun;
cmd(['exec_com','ec'],function(a){
  if(!a.length){err('exec_com: Usage: exec_com path {args}');return}
  ecRun(a[0],a.slice(1));
});

/* ---------- messages: send_message, accept_messages, defer_messages ---------- */
function known(id){ /* a Person.Project who is on, or null */
  var p=String(id).split('.');
  return whoAll().filter(function(u){return u[0]===p[0]&&(!p[1]||p[1]===u[1])})[0]||null;
}
cmd(['send_message','sm'],function(a){
  if(!a.length){err('send_message: Usage: send_message Person_id.Project_id {message}');return}
  var to=a[0],u=known(to);
  function deliver(text){
    if(!u){bad('send_message','User not logged in.',to);return false}
    if(!u[2]&&u[1]==='SysDaemon'){bad('send_message','Messages are not being accepted by',u[0]+'.'+u[1]);return false}
    if(u[3]){if(S.accepting)S.msgs.push(text);else MAIL.extra.push({from:uid().slice(0,-2),date:P.now(),subject:'',body:[text],msg:true});}
    return true;
  }
  if(a.length>1){deliver(a.slice(1).join(' '));showMsgs();return}
  if(!u){bad('send_message','User not logged in.',to);return}
  out('Input:');
  (function more(){
    P.ask('',function(l){
      if(l===null||l===P.INT){quitHere(l);return}
      if(l.trim()==='.')return;
      deliver(l);showMsgs();more();
    },true);
  })();
});
function msgDT(d){return dt(d).replace(/\.\d /,' ').replace('  ',' ')} /* a message's time: 11/04/81 1200 mst Wed */
function showMsgs(){
  while(S.msgs.length){var m=S.msgs.shift();P.queue(function(){out('From '+uid().slice(0,-2)+' '+msgDT(P.now())+': '+m)})}
}
cmd(['accept_messages','am'],function(a){
  S.accepting=true;
  if(a.indexOf('-print')>=0||a.indexOf('-pr')>=0)showMsgs();
});
cmd(['defer_messages','dm'],function(){S.accepting=false});
cmd(['print_messages','pm'],function(){
  var L=MAIL.extra.filter(function(m){return m.msg});
  if(!L.length){out('You have no messages.');return}
  L.forEach(function(m){out('From '+m.from+' '+msgDT(m.date)+': '+m.body.join(' '));MAIL.extra.splice(MAIL.extra.indexOf(m),1)});
});

/* ---------- mail: print_mail, read_mail, send_mail, and the old mail command ---------- */
function shortDT(d){return mdy(d)+' '+hm(d)}
function longDate(d){return d.getDate()+' '+MONTHS[d.getMonth()]+' '+d.getFullYear()+' '+P.p2(d.getHours())+P.p2(d.getMinutes())+' '+zone()}
function msgHead(m,i){
  var n=m.body.length;
  return [' #'+(i+1)+' ('+n+' line'+(n===1?'':'s')+') '+shortDT(m.date)+'     Mailed by: '+m.from,' Date: '+longDate(m.date),' From: '+m.from].concat(m.subject?[' Subject: '+m.subject]:[]).concat(['']);
}
function showMsg(m,i){MAIL.read=true;say(msgHead(m,i).concat(m.body))}
function mailCount(L){return 'You have '+(L.length===1?'1 message.':L.length+' messages.')}
function printMail(cmdName){
  var L=messages().slice();
  if(!L.length){out('You have no mail.');return}
  out(mailCount(L));out('');
  (function step(i){
    if(i>=L.length)return;
    showMsg(L[i],i);
    (function ask(){
      P.ask(cmdName+': Delete #'+(i+1)+'?  ',function(l){
        if(l===null||l===P.INT){quitHere(l);return}
        var w=String(l).trim();
        if(w==='yes'||w==='y'){delMessage(L[i]);if(i+1<L.length)out('');step(i+1);return}
        if(w==='no'||w==='n'){if(i+1<L.length)out('');step(i+1);return}
        if(w==='reprint'){showMsg(L[i],i);ask();return}
        if(w==='quit'||w==='q')return;
        if(w==='abort'){MAIL.gone=false;return}
        out('Please answer yes, no, reprint, quit, or abort.');ask();
      },true);
    })();
  })(0);
}
cmd(['print_mail','prm'],function(){printMail('print_mail')});
cmd(['mail','ml'],function(a){
  if(a.length){sendMail(a,'mail');return}
  printMail('mail');
});
var RDM_HELP=['Summary of read_mail requests:','  .                 identify read_mail','  ?                 print this list','  list, ls {SPECS}  summarize messages','  print, pr {SPECS} print messages',
  '  delete, dl {SPECS} delete messages','  retrieve, rt {SPECS} undelete messages','  next, n           print the next message','  previous          print the previous message','  quit, q           leave read_mail','  .. LINE            execute LINE as a command','',
  'SPECS: a message number, first, last, current, all, or N:M.'];
cmd(['read_mail','rdm'],function(a){
  var o=ctl('read_mail',a,{bf:'-brief,-bf',ls:'-list,-ls',pr:'-print,-pr',rq:'-request=,-rq=',quit:'-quit'});
  if(o.bad)return;
  var L=messages().slice(),del=[],cur=L.length?1:0,mbx=mp(S.home)+'>'+S.person+'.mbx';
  if(!L.length){out('You have no mail.');return}
  if(!o.bf)out(mailCount(L));
  function live(){return L.map(function(z,i){return i+1}).filter(function(n){return del.indexOf(n-1)<0})} /* the numbers of the messages not deleted */
  function specs(w){ /* message numbers, or null after saying why */
    if(!w.length)return cur&&del.indexOf(cur-1)<0?[cur]:null;
    var N=[];
    for(var k=0;k<w.length;k++){
      var x=w[k],m;
      if(x==='all'||x==='a')N=N.concat(live());
      else if(x==='first'||x==='f')N.push(live()[0]);
      else if(x==='last'||x==='l')N.push(live().pop());
      else if(x==='current'||x==='c')N.push(cur);
      else if((m=x.match(/^(\d+)(?::(\d+))?$/))){ /* past the last, one number is enough to say so */
        var hi=Math.min(m[2]?+m[2]:+m[1],Math.max(+m[1],L.length+1));
        for(var n=+m[1];n<=hi;n++)N.push(n);
      }
      else{err('read_mail: Invalid message specifier. '+x);return null}
    }
    N=N.filter(function(n){return n});
    var badN=N.filter(function(n){return n<1||n>L.length||del.indexOf(n-1)>=0})[0];
    if(badN!==undefined||!N.length){err('read_mail: Message '+(badN||'')+' '+(badN>L.length||!badN?'does not exist.':'has been deleted.'));return null}
    return N;
  }
  function list(N){
    var R=[' Msg#  Lines    Date     Time      From                   Subject'];
    N.forEach(function(n){var m=L[n-1];R.push(String(n).padStart(4)+'   ('+m.body.length+')'.padEnd(4)+' '+shortDT(m.date)+'     '+m.from.padEnd(23)+(m.subject||'').slice(0,12))});
    say(R);
  }
  function print(N){N.forEach(function(n){cur=n;showMsg(L[n-1],n-1);out(' ----'+n+'----')})}
  function req(l){ /* one request line; true to leave */
    var parts=splitLine(l),leave=false;
    parts.forEach(function(p){
      if(leave)return;
      var w=p.trim().split(/\s+/).filter(Boolean),r0=w[0];
      if(!r0)return;
      if(/^\.\./.test(p.trim())){line(p.trim().slice(2));return}
      if(r0==='.'){out('read_mail 4.3:  Message #'+cur+' of '+L.length+', '+del.length+' deleted   '+mbx);return}
      if(r0==='?'||r0==='help'){say(RDM_HELP);return}
      if(r0==='quit'||r0==='q'){leave=true;return}
      var N;
      if(r0==='list'||r0==='ls'){N=specs(w.slice(1).length?w.slice(1):['all']);if(N)list(N);return}
      if(r0==='print'||r0==='pr'||r0==='p'){N=specs(w.slice(1));if(N)print(N);return}
      if(r0==='next'||r0==='n'){var nx=live().filter(function(n){return n>cur})[0];if(!nx){err('read_mail: No next message.');return}print([nx]);return}
      if(r0==='previous'){var pv=live().filter(function(n){return n<cur}).pop();if(!pv){err('read_mail: No previous message.');return}print([pv]);return}
      if(r0==='delete'||r0==='dl'||r0==='d'){N=specs(w.slice(1));if(N){N.forEach(function(n){if(del.indexOf(n-1)<0)del.push(n-1)});if(!live().length)out('All messages have been deleted.')}return}
      if(r0==='retrieve'||r0==='rt'){N=w.slice(1).length?w.slice(1).map(Number):del.map(function(i){return i+1});N.forEach(function(n){var k=del.indexOf(n-1);if(k>=0)del.splice(k,1)});return}
      if(r0==='execute'||r0==='e'){line(w.slice(1).join(' '));return}
      err('read_mail: Unrecognized request.  Type "?" for a list of requests. '+r0);
    });
    return leave;
  }
  function finish(){del.forEach(function(i){delMessage(L[i])})}
  if(o.ls)req('list');
  if(o.pr)req('print all');
  if(o.rq&&req(o.rq)){finish();return}
  if(o.quit){finish();return}
  (function loop(){
    P.ask('read_mail:  ',function(l){
      if(l===null||l===P.INT){quitHere(l);finish();return}
      P.queue(function(){if(req(l)){finish();return}P.queue(loop)});
    },true);
  })();
});
function sendMail(a,cmdName){
  var o=ctl(cmdName,a,{sj:'-subject=,-sj=',bf:'-brief,-bf'});
  if(o.bad)return;
  if(!o.rest.length){err(cmdName+': Usage: '+cmdName+' {addresses} {-control_args}');return}
  var to=o.rest.map(function(x){return x.indexOf('.')<0?x+'.'+S.project:x});
  var bad1=to.filter(function(x){var p=x.split('.');return !(p[0]===GUEST.person&&p[1]==='Guest'||known(x)||p[0]===repair()&&p[1]==='SysAdmin'||p[0]===owner())})[0];
  if(bad1){var p=bad1.split('.');bad(cmdName,'No mailbox for '+bad1+'.','>udd>'+p[1]+'>'+p[0]+'>'+p[0]+'.mbx');return}
  function body(subject){
    out('Message:');
    var B=[];
    (function more(){
      P.ask('',function(l){
        if(l===null||l===P.INT){quitHere(l);return}
        if(l.trim()==='.'||l.trim()==='\\f'){
          if(l.trim()==='\\f')out(cmdName+': The editor is not available on this terminal; sending as typed.');
          to.forEach(function(x){
            if(x===GUEST.person+'.Guest'&&S.person===GUEST.person)MAIL.extra.push({from:uid().slice(0,-2),date:P.now(),subject:subject,body:B.slice()});
            out('Mail delivered to '+x+'.');
          });
          return;
        }
        B.push(l);more();
      },true);
    })();
  }
  if(o.sj!==undefined){body(o.sj);return}
  P.ask('Subject:  ',function(l){if(l===null||l===P.INT){quitHere(l);return}body(String(l).trim())},true);
}
cmd(['send_mail','sdm'],function(a){sendMail(a,'send_mail')});

/* ---------- help and list_help: the info segments in >doc>info ---------- */
function infoSeg(name){return node('/documentation/info_segments/'+name+'.info')}
function blocks(L){ /* paragraphs, each with its title (the text before the first colon of its first line) */
  var B=[],cur=[];
  L.forEach(function(l){if(!l.trim()){if(cur.length){B.push(cur);cur=[]}}else cur.push(l)});
  if(cur.length)B.push(cur);
  return B;
}
cmd(['help'],function(a){
  var o=ctl('help',a,{all:'-all,-a',bf:'-brief,-bf'});
  if(o.bad)return;
  var topic=o.rest[0]||'help_system';
  if(!o.rest[0])o.all=true; /* help alone: all of it, the terminal's words included */
  var n=infoSeg(topic); /* an added name (pwd.info) leads to the same segment */
  if(!n){bad('help','No info segment found for',topic+'.');return}
  var L=P.text(n),B=blocks(L),shown='>doc>info>'+namesOf(n)[0];
  if(o.bf){say([B[0][0]].concat(B.filter(function(b){return /^(Syntax|Usage)/.test(b[0])}).reduce(function(x,b){return x.concat(b)},[])));return}
  var first=B[0].length+(B[1]?B[1].length+1:0),total=L.length;
  out(shown+'  ('+first+' lines follow; '+total+' in info)');
  out('');
  function block(i){return B[i].concat(i<B.length-1?['']:[])}
  say(block(0));
  if(B[1])say(block(1));
  if(o.all){for(var k=2;k<B.length;k++)say(block(k));return}
  (function step(i){
    if(i>=B.length)return;
    var title=B[i][0].split(':')[0];
    P.ask(title+' ('+B[i].length+' line'+(B[i].length===1?'':'s')+').   More help?  ',function(l){
      if(l===null||l===P.INT){quitHere(l);return}
      var w=String(l).trim();
      if(w==='yes'||w==='y'||w===''){say(block(i));step(i+1);return}
      if(w==='skip'||w==='s'){step(i+1);return}
      if(w==='rest'||w==='r'){for(var k=i;k<B.length;k++)say(block(k));return}
      if(w==='no'||w==='n'||w==='quit'||w==='q')return;
      out('Answer yes, no, skip, rest, or quit.');step(i);
    },true);
  })(2);
});
cmd(['list_help','lh'],function(a){
  var t=a.filter(function(x){return x.charAt(0)!=='-'}),all=a.indexOf('-all')>=0||a.indexOf('-a')>=0;
  if(!t.length&&!all){err('list_help: Usage: list_help topics {-all}');return}
  var d=node('/documentation/info_segments'),base=function(x){return x.replace(/\.info$/,'')};
  var L=kidsOf(d).filter(function(n){return all||namesOf(n).some(function(x){return t.some(function(w){return base(x).indexOf(w)>=0})})}).sort(function(a,b){return namesOf(a)[0]<namesOf(b)[0]?-1:1});
  if(!L.length){out('list_help: No info segments found for '+t.join(' ')+'.');return}
  say(L.map(function(n){var N=namesOf(n).map(base);return N[0]+(N.length>1?' ('+N.slice(1).join(', ')+')':'')}));
});

/* ---------- logout, and the line hanging up ---------- */
cmd(['logout'],function(a){
  var brief=a.indexOf('-brief')>=0||a.indexOf('-bf')>=0,hold=a.indexOf('-hold')>=0||a.indexOf('-hd')>=0,n=P.now();
  var secs=Math.round(S.used+S.cpu),units=(S.used*3+((n-S.login)/36e5)*2+0.4).toFixed(1),cost=(0.05+secs*0.07+(n-S.login)/36e5*1.9).toFixed(2);
  if(!brief)say([S.person+'.'+S.project+' logged out '+dt(n),'CPU usage '+secs+' sec, memory usage '+units+' units, cost $'+cost+'.']);
  M.changed();
  LAST[S.person]=S.login;S.on=false;S.priv=false;S.level=1;M.drop();S.cpu=0;S.used=0;S.ready=true;S.accepting=false;
  P.st.user=GUEST.person.toLowerCase();P.st.cwd=P.st.home=GUEST.home;S.home='';
  if(hold){if(!brief){out('');banner()}else out('');return}
  hangup();
});
function hangup(){out('hangup');P.pause(1600);P.queue(function(){out('');banner()})} /* the line drops, and answers again */
function load(){return (whoAll().length*1.0+4).toFixed(1)}
function banner(){
  var n=P.now();
  say(['Multics '+VERSION+': '+site(),'Load = '+load()+' out of 125.0 units: users = '+whoAll().length+', '+dt(n)]);
}
M.banner=banner;

/* ---------- before login: login, enter, help, hello, and the terminal's own words ---------- */
var LOGIN_HELP=['Examples of correct login:','   login  Person_name projectid','   enterp Special_name projectid','   enter  Special_name projectid',
  'Upper and lower case letters are different.','Check any typing conventions for your terminal.','Visitors log in as Guest, with any password:  login Guest',
  'Contact your administrator for more help.','']; /* the answering service's help, with this site's line for visitors */
M.loginHelp=function(){return LOGIN_HELP.slice(0,-1)};
var AGAIN='Please try again or type "help" for instructions.';
function preLogin(c){
  var W=c.trim().split(/\s+/),w=W[0];
  if(w==='login'||w==='l'){login(W.slice(1));return}
  if(w==='enter'||w==='e'||w==='enterp'||w==='ep'){out('Anonymous users are not accepted at this installation.');out(AGAIN);return}
  if(w==='help'){say(LOGIN_HELP);out(AGAIN);return}
  if(w==='hello'){banner();return}
  if(w==='logout'||w==='hangup'){hangup();return}
  if(P.has(TERM,w)&&w!=='mail'){TERM[w](W.slice(1),c,W);return}
  out('Incorrect login word "'+w+'".');
  out(AGAIN);
}
var MASK='WWWWWWWWWWWW';
function login(a){
  var o={project:null,brief:false,cpw:false},rest=[];
  for(var i=0;i<a.length;i++){
    var x=a[i];
    if(x==='-brief'||x==='-bf')o.brief=true;
    else if(x==='-change_password'||x==='-cpw')o.cpw=true;
    else if(x==='-no_start_up'||x==='-ns')o.ns=true;
    else if((x==='-project'||x==='-pj')&&a[i+1])o.project=a[++i];
    else if(x.charAt(0)==='-'){out('Unrecognized control argument '+x+'.');out(AGAIN);return}
    else rest.push(x);
  }
  if(!rest.length){ /* login alone asks for the rest */
    P.ask('Personid Projectid and optional arguments:  ',function(l){if(l===null||l===P.INT||!String(l).trim())return;login(String(l).trim().split(/\s+/))},true);
    return;
  }
  var who=rest[0].split('.'),person=who[0],project=o.project||who[1]||rest[1]||null;
  out('Password:');
  P.ask(MASK,function(pw){
    if(pw===null||pw===P.INT)return;
    var U=account(person);
    function fail(m){
      S.tries++;P.pause(900);out(m);
      if(S.tries>=6){S.tries=0;hangup();return}
      out(AGAIN);
    }
    if(!U){fail('The user name you supplied is not registered.');return}
    if(U.pw!==null&&pw!==U.pw){BADPW[person]=P.now();fail('Incorrect password supplied.');return}
    if(project&&U.projects.indexOf(project)<0){S.tries=6;fail(['Guest','SysAdmin','SysDaemon','Physics','Library','Accounting','Chem'].indexOf(project)<0?'Specified project does not exist.':'You are not registered on project '+project+'.');return}
    function go(){
      S.tries=0;
      on(person,project||U.projects[0],U);S.ns=!!o.ns;
      if(!o.brief)say(loginLines());
      if(BADPW[person]){out('Your password was given incorrectly at '+dt(BADPW[person])+' from ASCII terminal "none".');out('');delete BADPW[person]}
      startUp('login',o.brief);
    }
    if(!o.cpw){go();return}
    P.ask('New Password:  '+MASK,function(p1){
      if(p1===null||p1===P.INT)return;
      P.ask('New Password Again:  '+MASK,function(p2){
        if(p2===null||p2===P.INT)return;
        if(p1!==p2){fail('Password not changed: the two new passwords differ.');return}
        out(U.pw===null?'Password changed.':'Password not changed: '+person+'\'s password is set by the system administrator.');
        go();
      },true,true);
    },true,true);
  },true,true);
}
function account(person){
  if(person===GUEST.person)return {projects:['Guest'],pw:null,home:GUEST.home};
  if(person===repair()&&P.profile.rootPassword)return {projects:['SysAdmin'],pw:P.profile.rootPassword,priv:true,home:'/user_dir_dir/SysAdmin/'+repair()};
  if(person===owner())return {projects:['SysAdmin'],pw:'\u0000',home:'/user_dir_dir/SysAdmin/'+owner()};
  return null;
}
function on(person,project,U){
  ensureHome();
  S.on=true;S.person=person;S.project=project;S.priv=!!U.priv;S.home=U.home;S.level=1;S.cpu=0.9+Math.random()*0.8;S.pf=20+Math.floor(Math.random()*30);
  S.login=P.now();S.used=0;S.ready=true;S.ran=true;S.ns=false;
  if(!node(S.home))P.put(S.home,'d',{owner:person});
  P.st.user=person.toLowerCase();P.st.home=S.home;P.st.cwd=S.home;
}
var LAST={},BADPW={};
function loginLines(){
  var n=S.login,last=LAST[S.person]||new Date(n.getTime()-(26*60+43+(S.person===GUEST.person?0:3*24*60+71))*6e4-17e3);
  return ['You are protected from preemption until '+hhmm(new Date(n.getTime()+36e5))+'.',
    S.person+'.'+S.project+' logged in '+dt(n)+' from ASCII terminal "none".',
    'Last login '+dt(last)+' from ASCII terminal "none".'];
}
function startUp(why,brief){ /* the start_up.ec in the home directory unless login said -no_start_up, else the message of the day (not after -brief) */
  var su=node(S.home+'/start_up.ec');
  if(su&&su.type==='f'&&!S.ns){P.queue(function(){ecRun(mp(S.home)+'>start_up.ec',[why,'interactive'])});return}
  if(!brief&&why==='login'){P.queue(function(){S.motdSeen[S.person]=true;say(M.motd())})}
}

/* ---------- the terminal's own words ---------- */
Phosphor.setup(function(Q){
  Object.keys(Q.cmds).forEach(function(k){ /* the terminal's words and the site's text commands; Multics's own help and mail win */
    TERM[k]=Q.cmds[k];Q.cmds[k]=function(a,raw){line(raw)}; /* everything comes to the command processor */
  });
  Q.fallback=function(word,raw){Q.status(0);line(raw);return true};
  Q.setPrompt(ready);
  GUEST.home=Q.st.home;
  BOOTED=new Date(Q.now().getTime()-(3*24*60+4*60+17)*6e4);
  Q.profile.welcome0=Q.profile.welcome;
  Q.profile.mailNotice='';
  /* the first visit: the line answers, and the guest logs in */
  Q.profile.welcome=[
    ['Multics '+VERSION+': '+site()],
    [function(){return 'Load = '+load()+' out of 125.0 units: users = '+(whoAll().length+1)+', '+dt(Q.now())}],
    ['login Guest','',{hold:900,speed:2.2}],
    [function(){
      ensureHome();
      on(GUEST.person,GUEST.project,account(GUEST.person));
      Q.queue(function(){Q.typeLine(MASK,'',null,{hold:500});say(loginLines());startUp('login')});
      return 'Password:';
    }]
  ];
});
})(window.Phosphor);
