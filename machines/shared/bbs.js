/* PHOSPHOR-9 terminal: a dial-up bulletin board, reached through modem.js: from the bbs machine, or with TERM on
   MS-DOS and CP/M. Everything on it comes from the site: the letter, the about section and the home folder's files
   are its messages, files and bulletins, so another site's board fills itself. What a caller adds (a handle, posts,
   lines on the wall, comments, door games) is kept in this browser only, under phosphor-9/bbs/.
   The board's name, number and sysop can be set from site/ with a == board == section:
     name: Afterglow BBS      sysop: {owner}      number: 555-0142      password: (the sysop's)
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE. */
(function(P){
'use strict';

/* ---------- the board's settings ---------- */
var PASSWORD='ringback'; /* the sysop's, unless the board's settings or the bbs machine's root password say otherwise */
function conf(){
  var C={name:'Afterglow BBS',sysop:P.profile.owner,number:'555-0142',password:'',node:'1',
    host:P.machine==='bbs'?P.profile.host:(P.st.site||'').replace(/^www\./,'').split('.')[0]||P.profile.owner}; /* the site's name, not the calling machine's */
  ((P.profile.raw&&P.profile.raw.board)||[]).forEach(function(l){
    var m=String(l).match(/^\s*(name|sysop|number|password|node)\s*:\s*(.*?)\s*$/i);
    if(m&&m[2])C[m[1].toLowerCase()]=m[2];
  });
  C.password=C.password||(P.machine==='bbs'&&P.profile.rootPassword)||PASSWORD;
  C.sysop=C.sysop.replace(/[^\w .-]/g,'').slice(0,20)||'sysop';
  return C;
}
/* the other boards in the area: what their numbers do when dialled */
var OTHERS=[['The Static Line','555-0118','2400','busy','always busy. keep trying.'],
  ['Copper Pair','555-0177','1200','none','nights only, when it answers'],
  ['Midnight Relay','555-0163','2400','busy','two nodes, both busy']];
function numbers(){var o={},c=conf();OTHERS.forEach(function(b){o[b[1]]=b[3]});o[c.number]='board';return o}

/* ---------- what the browser keeps ---------- */
function list(k,max){var v=P.saved('bbs/'+k);return Array.isArray(v)?v.filter(function(x){return x&&typeof x==='object'}).slice(-max):[]}
function keep(k,v,max){P.save('bbs/'+k,v.slice(-max))}
function users(){var v=P.saved('bbs/users');return v&&typeof v==='object'&&!Array.isArray(v)?v:{}}
function clean(s,n){return String(s==null?'':s).replace(/[\u0000-\u001f\u007f]/g,'').slice(0,n||160)}

/* ---------- the session ---------- */
var S=null; /* this call: {M,C,user,handle,sysop,ansi,on,base,gone,done} */
function year(){return P.profile.year}
function off(){return !S||S.gone}
function canAnsi(){return year()>=1986} /* colour boards came with the PC clones; a 1982 board talks plain ASCII */
function col(t){return String(t).replace(/\|([0-9a-f])/gi,function(m,c){return S&&S.ansi?'\u0005'+c:''})}
function put(t,cls,opt){P.typeLine(col(t),cls,null,opt)}
function blank(){P.typeLine('')}
function tint(c,t){return (S&&S.ansi?'\u0005'+c:'')+t} /* a caller's own words, in a colour, never read for codes */
function siteLines(L){return (L||[]).map(function(l){var x=P.lineOf(l);return [x[0],x[1]||'',x[2]]})}
function plainOf(t){return String(t).replace(/\u0005[\s\S]?/g,'').replace(/\u0003([^\u0004]*)(\u0004|$)/g,'$1').replace(/[\u0001-\u0004]/g,'')}
function cols(){return Math.max(20,P.columns()||80)}
function rows(){
  var t=document.getElementById('term'),o=document.getElementById('out');
  if(!t||!o)return 24;
  var cs=getComputedStyle(o),lh=parseFloat(cs.lineHeight)||parseFloat(cs.fontSize)*1.28||16;
  return Math.max(6,Math.floor((t.clientHeight-parseFloat(cs.paddingTop)-parseFloat(cs.paddingBottom))/lh));
}
function left(){return Math.max(0,60-Math.floor((Date.now()-S.on)/6e4))}
function stamp(ms,time){
  var d=new Date(ms),s=P.p2(d.getMonth()+1)+'-'+P.p2(d.getDate())+'-'+P.p2(year()%100);
  return time===false?s:s+'  '+P.p2(d.getHours())+':'+P.p2(d.getMinutes());
}

/* a line from the caller. ^C is an empty line; +++ is the modem's, and the call goes on (ATO) or ends (ATH) */
function ask(p,then,hidden){
  var l;
  P.queue(function(){if(off())return;return P.readLine(p.replace(/\|[0-9a-f]/gi,''),true,hidden).then(function(x){l=x})},true);
  P.queue(function(){
    if(off())return;
    if(l===P.INT||l===null)l='';
    l=clean(l,240);
    if(l.trim()==='+++'){
      S.M.escape(function(){ask(p,then,hidden)},function(){end()});
      return;
    }
    return then(l);
  },true);
}
function yes(p,def,then){ask(p,function(l){l=l.trim();then(l?/^y/i.test(l):def)})}
/* lines, a screenful at a time, with More between */
function paged(L,then){
  var i=0,R=rows()-2,C=cols();
  (function chunk(){
    var n=0;
    while(i<L.length&&n<R){
      var x=L[i++];
      P.typeLine(x[0],x[1],null,x[2]);
      n+=Math.max(1,Math.ceil(plainOf(x[0]).length/C));
    }
    if(i>=L.length){then();return}
    var k;
    P.queue(function(){if(off())return;return P.readKey('More (Y/n)? ',true).then(function(x){k=x})},true);
    P.queue(function(){
      if(off())return;
      blank();
      if(/^[nq]$/i.test(k)||k==='C-c'){then();return}
      chunk();
    },true);
  })();
}
function mine(t){return [col(t),'',undefined]}

/* ---------- the site's words, as the board's messages, bulletins and files ---------- */
function letterRows(){
  return P.profile.mail.filter(function(l){return P.lineOf(l)[2]&&P.lineOf(l)[2].row}).map(function(l){
    var x=P.lineOf(l),m=x[0].match(/^([^\u0003]*)\u0003[^\u0004]*\u0004?(.*)$/)||[x[0],x[0],''];
    return {name:m[1].trim(),status:m[2].trim(),href:x[2].href};
  });
}
function siteFiles(){ /* the home folder's files a caller could read: nothing hidden, nothing locked, nothing outside it */
  var prot=P.profile.protected.map(function(p){return P.fold(p.replace(/\/+$/,''))});
  return P.profile.files.filter(function(f){
    var n=P.fold(f.name);
    if(n.charAt(0)==='/'||n.split('/').some(function(s){return s.charAt(0)==='.'}))return false;
    return !prot.some(function(p){return n===p||n.indexOf(p+'/')===0});
  });
}
function firstText(L){for(var i=0;i<L.length;i++){var t=plainOf(P.lineOf(L[i])[0]).trim();if(t)return t}return ''}
function bases(){
  var C=S.C,sys=C.sysop,mailAt=P.st.login.getTime()-36e5*3,B=[];
  var gen={id:'general',name:'General',posts:[]};
  if(P.profile.mail.length)gen.posts.push({f:sys,t:'All',s:clean(firstText(P.profile.mail),30)||'Welcome',d:mailAt,L:siteLines(P.profile.mail)});
  if(P.profile.about.length)gen.posts.push({f:sys,t:'All',s:'About this board',d:mailAt+6e4,L:siteLines(P.profile.about)});
  siteFiles().forEach(function(f){if(P.fold(f.name)==='now')gen.posts.push({f:sys,t:'All',s:'What I am doing now',d:mailAt+12e4,L:siteLines(f.body)})});
  gen.posts.push({f:'Night Owl',t:sys,s:'Re: '+(gen.posts[0]?gen.posts[0].s:'Welcome').replace(/^Re: /,''),d:mailAt+3*36e5,
    L:[['Thanks for putting the board up. Second line yet?','']]});
  gen.posts.push({f:'Lone Coder',t:'All',s:'2400 for sale',d:mailAt+20*6e4,
    L:[['Upgraded, so my old 2400 external is going. Works fine, and the lights are half the fun. Leave me a note here.','']]});
  B.push(gen);
  var R=letterRows();
  if(R.length)B.push({id:'projects',name:'Projects',ro:true,posts:R.map(function(r,i){
    return {f:sys,t:'All',s:clean(plainOf(r.name),30),d:mailAt+i*1000,
      L:[['Status: '+r.status,'']].concat(r.href?[[r.href,'',{href:r.href}]]:[])};
  })});
  var F=siteFiles().filter(function(f){return P.fold(f.name)!=='now'});
  if(F.length)B.push({id:'notes',name:sys+"'s notes",ro:true,posts:F.map(function(f,i){
    return {f:sys,t:'All',s:clean(f.name,30),d:P.fileDate.getTime()+i*6e4,L:siteLines(f.body)};
  })});
  list('posts',60).forEach(function(p){
    var b=B.filter(function(x){return x.id===p.b})[0]||gen;
    if(typeof p.s!=='string'||!Array.isArray(p.L))return;
    b.posts.push({f:clean(p.f,20),t:clean(p.t,20)||'All',s:clean(p.s,30),d:+p.d||Date.now(),L:p.L.map(function(x){return [clean(x),'']}),mine:true});
  });
  B.forEach(function(b){b.posts.sort(function(x,y){return x.d-y.d})});
  return B;
}
/* the files, with names cut to eight and three, and sizes as a download would have them (CR LF line ends) */
function cut(name){
  var b=name.split('/').pop().toUpperCase().replace(/[^A-Z0-9._-]/g,''),i=b.lastIndexOf('.');
  var n=(i>0?b.slice(0,i):b).replace(/\./g,'').slice(0,8)||'FILE',e=i>0?b.slice(i+1).slice(0,3):'';
  return n+(e?'.'+e:'');
}
function textSize(L){return L.reduce(function(n,l){return n+plainOf(P.lineOf(l)[0]).length+2},0)}
function areas(){
  var C=S.C,y1=P.p2((year()-1)%100),seen={},A=[];
  var own=siteFiles().map(function(f){
    var n=cut(f.name),k=2;
    while(seen[n]){var c=n.split('.');n=c[0].slice(0,7)+k+(c[1]?'.'+c[1]:'');k++}
    seen[n]=1;
    return {n:n,size:textSize(f.body),d:P.fileDate.getTime(),what:f.name+', from '+C.sysop,text:siteLines(f.body)};
  });
  var day=function(k){return P.now().getTime()-k*864e5};
  A.push({name:C.sysop+"'s files",files:own});
  A.push({name:'Utilities',files:[
    {n:'DISKCAT.ZIP',size:41388,d:day(40),what:'Disk cataloguer: every file on every floppy, sorted'},
    {n:'QUIKCALC.ZIP',size:88102,d:day(95),what:'Spreadsheet in 64K. Prints sideways'},
    {n:'FASTDIR.ZIP',size:9516,d:day(12),what:'DIR, but faster, and in colour'},
    {n:'TYPEFAST.ARC',size:30210,d:day(200),what:'Typing tutor with a racing car'},
    {n:'BBSLIST.TXT',size:0,d:day(3),what:'Boards in the area, updated monthly',text:bbsList()},
    {n:'NODE1.LOG',size:0,d:day(1),what:'Caller log, node 1',text:[
      [y1+'-10-21 23:01  Night Owl            logged off, 34 min',''],
      [y1+'-10-21 23:02  Unknown handle "'+C.password.toUpperCase()+'", hung up',''],
      [y1+'-10-21 23:03  '+(C.sysop+' (sysop)').padEnd(20)+' local logon',''],
      [y1+'-10-22 07:40  Lone Coder           logged off, 12 min','']]}
  ]});
  A.push({name:'Games',files:[
    {n:'STARHAUL.ZIP',size:61232,d:day(30),what:'The Star Haul door, to run on your own board'},
    {n:'MAZEGEN.ZIP',size:18550,d:day(64),what:'Mazes to print and solve'},
    {n:'CHKRS.ZIP',size:24080,d:day(150),what:'Checkers that cheats only a little'},
    {n:'LUNAR.ZIP',size:7712,d:day(330),what:'Land on the Moon, again'}
  ]});
  A.forEach(function(a){a.files.forEach(function(f){if(f.text&&!f.size)f.size=textSize(f.text)})});
  return A;
}
function bbsList(){
  var C=S.C;
  return [['Boards in the area, at the last count','',undefined],['',''],
    [(C.name.slice(0,18).padEnd(19)+C.number.padEnd(10)+'2400  this one'),''],
  ].concat(OTHERS.map(function(b){return [b[0].padEnd(19)+b[1].padEnd(10)+b[2].padEnd(6)+b[4],'']}));
}
function site(){return P.bbs.welcome||P.profile.welcome} /* the site's welcome: the bbs machine keeps it from the terminal's boot */
function rules(){
  return [['1. Be civil. This board lives in somebody\'s spare room.',''],
    ['2. An hour a call. Leave the line free for the next caller.',''],
    ['3. Nothing pirated in the file area, ever.',''],
    ['4. A handle is all we need. Keep your real name to yourself.',''],
    ['5. The sysop reads everything. Eventually.','']];
}
function bulletins(){
  var B=[];
  if(site().length)B.push(['Welcome',siteLines(site())]);
  B.push(['Board rules',rules()]);
  if(P.profile.about.length)B.push(['About '+S.C.sysop,siteLines(P.profile.about)]);
  P.profile.commands.filter(function(c){return c.site&&c.help}).forEach(function(c){B.push([plainOf(c.help).slice(0,30),siteLines(c.body)])});
  B.push(['Other boards',bbsList()]);
  return B;
}

/* ---------- logging on ---------- */
function box(L){ /* the board's sign, as wide as the glass allows */
  var w=Math.min(cols()-1,Math.max.apply(null,L.map(function(x){return x.length}))+4);
  var a=S.ansi;
  put(a?'|3\u2554'+'\u2550'.repeat(w-2)+'\u2557':'+'+'-'.repeat(w-2)+'+');
  L.forEach(function(t,i){
    t=t.slice(0,w-4);
    put((a?'|3\u2551 ':'| ')+(i?'|7':'|e')+t+' '.repeat(w-4-t.length)+(a?'|3 \u2551':' |'));
  });
  put(a?'|3\u255a'+'\u2550'.repeat(w-2)+'\u255d':'+'+'-'.repeat(w-2)+'+');
}
function sign(){
  var C=S.C;
  blank();
  box([C.name.toUpperCase().split('').join(' ').length<=cols()-6?C.name.toUpperCase().split('').join(' '):C.name,
    'node '+C.node+' . '+C.host+' . '+S.M.speed+' bps','sysop: '+C.sysop]);
  if(S.ansi)put('|4\u2591\u2592\u2593|c\u2588\u2588|e\u2593\u2592\u2591 |7the glow stays on after you hang up');
  blank();
}
function logon(){
  S.ansi=false; /* until the caller says: a board could not know what was on the other end */
  sign();
  P.say(site());
  blank();
  put('Enter your handle, or NEW if this is your first call.');
  tries(0);
}
function tries(n){
  if(n>=3){put('Too many tries. Goodbye.');hang();return}
  ask('Handle: ',function(l){
    var h=l.trim().replace(/\s+/g,' '),k=h.toLowerCase(),U=users(),C=S.C;
    if(!h){tries(n+1);return}
    if(k==='new'){newUser(0);return}
    if(k===C.sysop.toLowerCase()||k==='sysop'){
      ask('Password: ',function(w){
        if(w!=null&&w!==P.INT&&w.toUpperCase()===C.password.toUpperCase()){S.sysop=true;S.handle=C.sysop;S.user={h:C.sysop,calls:0,first:Date.now(),ansi:canAnsi()};S.ansi=canAnsi();welcome(false);return}
        put('Wrong password.');tries(n+1);
      },true);
      return;
    }
    var u=U[k];
    if(!u||typeof u!=='object'){put('No caller by that name. Type NEW to join.');tries(n+1);return}
    S.handle=clean(u.h,20)||h;S.user=u;S.ansi=canAnsi()&&!!u.ansi;welcome(false);
  });
}
function newUser(n){
  if(n>=3){put('Maybe next time. Goodbye.');hang();return}
  blank();
  put('Choose a handle: 2 to 20 letters, digits or spaces. It is all the board will know of you.');
  ask('Handle: ',function(l){
    var h=l.trim().replace(/\s+/g,' '),k=h.toLowerCase(),U=users();
    if(!/^[a-z0-9][a-z0-9 ._-]{1,19}$/i.test(h)||/^(new|all|sysop)$/.test(k)||k===S.C.sysop.toLowerCase()){put('That handle will not do.');newUser(n+1);return}
    if(U[k]){put('Somebody has that one. Log on with it, or pick another.');newUser(n+1);return}
    yes(h+', is that right (Y/n)? ',true,function(ok){
      if(!ok){newUser(n+1);return}
      function made(ansi){
        S.handle=h;S.user={h:h,calls:0,first:Date.now(),ansi:ansi,read:{},posts:0};S.ansi=ansi;
        blank();
        put('Your record is kept on this terminal, and nowhere else.','dim');
        welcome(true);
      }
      if(!canAnsi()){made(false);return}
      yes('Do you want ANSI colour (Y/n)? ',true,made);
    });
  });
}
function welcome(isNew){
  var u=S.user,U=users(),last=u.last;
  u.calls=(+u.calls||0)+1;u.last=Date.now();
  if(!S.sysop){U[S.handle.toLowerCase()]=u;var K=Object.keys(U);if(K.length>20)delete U[K[0]];P.save('bbs/users',U)}
  var callers=list('callers',10);callers.push({h:S.handle,d:Date.now()});keep('callers',callers,10);
  blank();
  put('|aWelcome'+(isNew?'':' back')+', |f'+S.handle+'|a!');
  if(last&&!isNew)put('|7You were last on '+stamp(+last)+'. This is your call number '+u.calls+'.');
  put('|7You are caller number '+(3172+callers.length+Object.keys(U).length*7).toLocaleString('en-US')+' to '+S.C.name+'.');
  put('|7You have |e'+left()+'|7 minutes for this call.');
  if(S.sysop)put('|cSysop logged on. The * menu is yours.');
  var nb=bases().reduce(function(n,b){return n+Math.max(0,b.posts.length-readOf(b))},0);
  if(nb)put('|7There '+(nb===1?'is |e1|7 message':'are |e'+nb+'|7 messages')+' you have not read. |bN|7 reads them.');
  blank();
  yes('Read the bulletins now (y/N)? ',false,function(y){if(y)bulletinMenu(true);else menu()});
}
function save(){
  if(S.sysop||!S.user)return;
  var U=users();U[S.handle.toLowerCase()]=S.user;P.save('bbs/users',U);
}
function readOf(b){var r=S.user&&S.user.read;return r&&typeof r==='object'?Math.min(+r[b.id]||0,b.posts.length):0}
function setRead(b,n){S.user.read=S.user.read&&typeof S.user.read==='object'?S.user.read:{};if(n>readOf(b)){S.user.read[b.id]=n;save()}}

/* ---------- the main menu ---------- */
var MAIN=[['B','Bulletins'],['M','Message bases'],['N','New messages'],['P','Post a message'],['F','File area'],['D','Doors'],
  ['W','Graffiti wall'],['U','User list'],['L','Last callers'],['C','Page the sysop'],['T','Time and stats'],['A','ANSI on or off'],
  ['G','Goodbye'],['?','This menu']];
function showMenu(title,items){
  blank();
  put('|b-- |f'+title+' |b--');
  var cell=function(x){return '|b[|e'+x[0]+'|b] |7'+x[1]},w=Math.max.apply(null,items.map(function(x){return x[1].length}))+5;
  if(cols()>=2*w+2){for(var i=0;i<items.length;i+=2)put(cell(items[i])+(items[i+1]?' '.repeat(w-items[i][1].length-4)+cell(items[i+1]):''))}
  else items.forEach(function(x){put(cell(x))});
}
function menu(){
  var I=MAIN.slice();
  if(S.sysop)I.splice(I.length-1,0,['*','Sysop menu']);
  showMenu('Main menu',I);
  prompt();
}
function prompt(){
  if(off())return;
  if(left()<=0){blank();put('|cYour hour is up. Call again tomorrow.');bye();return}
  ask('['+left()+' left] Main command (? for menu): ',command);
}
function terminalWord(l){ /* the terminal's own words, and the site's: the terminal answers them, as it does everywhere */
  var w=l.trim().split(/\s+/),c=w[0].toLowerCase();
  if(c.length<2||c==='help'||!P.has(P.cmds,c)||!P.own(c))return false;
  P.cmds[c](w.slice(1).map(function(x){return x.toLowerCase()}),l.trim(),w);
  return true;
}
function help(){
  showMenu('Main menu',MAIN);
  var T=P.help().filter(function(h){return P.own(h[0])&&h[0]!=='help'});
  if(T.length){
    blank();
    put("|bthe terminal's, not the board's:");
    T.forEach(function(h){put('|7  '+h[0].padEnd(10)+' '+h[1],'',{hang:13})});
  }
  put('|7+++ on a line by itself talks to the modem: ATH hangs up, ATO goes back.','dim');
}
function command(l){
  var c=l.trim().toLowerCase();
  if(!c){prompt();return}
  if(terminalWord(l)){P.queue(prompt,true);return}
  var k=c.charAt(0);
  if(c==='help'||k==='?'){help();prompt();return}
  if(/^(bye|logoff|quit|exit|off)$/.test(c))k='g';
  var F={b:function(){bulletinMenu(false)},m:baseMenu,n:newScan,p:function(){post(null,null,prompt)},f:fileMenu,d:doorMenu,
    w:wall,u:userList,l:lastCallers,c:page,t:stats,a:ansiToggle,g:goodbye,'*':sysopMenu};
  if(k==='*'&&!S.sysop){put('|cNo such command. ? lists them.');prompt();return}
  if(F[k])F[k]();else{put('|cNo such command. ? lists them.');prompt()}
}

/* ---------- bulletins ---------- */
function bulletinMenu(first){
  var B=bulletins();
  blank();
  put('|b-- |fBulletins |b--');
  B.forEach(function(b,i){put('|e'+String(i+1).padStart(2)+'|7  '+b[0])});
  ask('Bulletin number (Enter to quit): ',function(l){
    var n=parseInt(l,10);
    if(!l.trim()||!(n>=1&&n<=B.length)){if(l.trim()&&!/^q/i.test(l.trim()))put('|cNo such bulletin.');if(first)menu();else prompt();return}
    blank();
    paged([mine('|f'+B[n-1][0]),['','']].concat(B[n-1][1]),function(){bulletinMenu(first)});
  });
}

/* ---------- message bases ---------- */
function baseMenu(){
  var B=bases();
  blank();
  put('|b-- |fMessage bases |b--');
  B.forEach(function(b,i){var nw=b.posts.length-readOf(b);put('|e'+String(i+1).padStart(2)+'|7  '+b.name.padEnd(20)+' '+b.posts.length+' msgs'+(nw>0?'|a, '+nw+' new':'')+(b.ro?'|8 (read only)':''))});
  ask('Base number (Enter to quit): ',function(l){
    var n=parseInt(l,10);
    if(!(n>=1&&n<=B.length)){prompt();return}
    var b=B[n-1],at=readOf(b);
    if(at>=b.posts.length)at=0;
    reader(b,at,function(){baseMenu()});
  });
}
function header(b,i){
  var m=b.posts[i];
  blank();
  put('|bMsg |f'+(i+1)+'|b of |f'+b.posts.length+'|b  ['+b.name+']');
  P.typeLine(col('|bFrom: ')+tint('f',m.f+(m.f===S.C.sysop?' (Sysop)':'')));
  P.typeLine(col('|b  To: ')+tint('7',m.t));
  P.typeLine(col('|bSubj: ')+tint('e',m.s));
  put('|bDate: |7'+stamp(m.d));
  blank();
}
function reader(b,i,then){
  if(i>=b.posts.length){put('|7End of messages in '+b.name+'.');then();return}
  var m=b.posts[i];
  header(b,i);
  setRead(b,i+1);
  paged(m.L.map(function(x){return [x[0],x[1]||'',x[2]]}),function(){
    ask('Msg '+(i+1)+': N)ext P)rev R)eply A)gain Q)uit: ',function(l){
      var c=l.trim().toLowerCase().charAt(0);
      if(!c||c==='n'){reader(b,i+1,then);return}
      if(c==='p'){reader(b,Math.max(0,i-1),then);return}
      if(c==='a'){reader(b,i,then);return}
      if(c==='r'){post(b.ro?null:b,{t:m.f,s:/^re: /i.test(m.s)?m.s:('Re: '+m.s).slice(0,30)},function(){reader(b,i+1,then)});return}
      then();
    });
  });
}
function newScan(){
  var B=bases().filter(function(b){return readOf(b)<b.posts.length});
  if(!B.length){put('|7No new messages.');prompt();return}
  (function next(k){
    if(k>=B.length){put('|7That is everything new.');prompt();return}
    reader(B[k],readOf(B[k]),function(){next(k+1)});
  })(0);
}
/* the line editor: up to 30 lines, /S saves, /A throws it away, /L lists what is there */
function edit(then){
  var L=[];
  put('|7Up to 30 lines. |e/S|7 on a line by itself saves, |e/A|7 throws it away, |e/L|7 lists.');
  (function line(){
    ask(String(L.length+1).padStart(2)+': ',function(l){
      var c=l.trim().toLowerCase();
      if(c==='/s'){then(L.length?L:null);return}
      if(c==='/a'){then(null);return}
      if(c==='/l'){L.forEach(function(x,i){P.typeLine(String(i+1).padStart(2)+': '+x)});line();return}
      L.push(clean(l,160));
      if(L.length>=30){put('|7That is 30 lines.');then(L);return}
      line();
    });
  })();
}
function post(b,re,then){
  var B=bases();
  b=b||B[0];
  if(b.ro){b=B[0]}
  blank();
  put('|7Posting in |f'+b.name+'|7.');
  ask('To (Enter for All): ',function(to){
    to=clean(to.trim()||(re&&re.t)||'All',20);
    var go=function(s){
      s=clean(s.trim(),30);
      if(!s){put('|7No subject, no message.');then();return}
      edit(function(L){
        if(!L){put('|7Message thrown away.');then();return}
        var A=list('posts',60);
        A.push({b:b.id,f:S.handle,t:to,s:s,d:Date.now(),L:L});
        keep('posts',A,60);
        S.user.posts=(+S.user.posts||0)+1;save();
        var n=bases().filter(function(x){return x.id===b.id})[0];
        put('|aSaved as message '+(n?n.posts.length:A.length)+' in '+b.name+'.');
        if(n&&readOf(n)===n.posts.length-1)setRead(n,n.posts.length);
        then();
      });
    };
    if(re&&re.s){
      ask('Subject ['+re.s+']: ',function(s){go(s.trim()||re.s)});
    }else ask('Subject: ',go);
  });
}

/* ---------- files ---------- */
function size(n){return n.toLocaleString('en-US')}
function fileMenu(){
  var A=areas();
  blank();
  put('|b-- |fFile areas |b--');
  A.forEach(function(a,i){put('|e'+String(i+1).padStart(2)+'|7  '+a.name.padEnd(20)+' '+a.files.length+' files')});
  ask('Area number, D to download, U to upload (Enter quits): ',function(l){
    var c=l.trim().toLowerCase(),n=parseInt(c,10);
    if(c==='d'||/^d\s/.test(c)){download(A,l.trim().slice(1).trim(),fileMenu);return}
    if(c==='u'){upload(fileMenu);return}
    if(!(n>=1&&n<=A.length)){prompt();return}
    var a=A[n-1],wide=cols()>=60;
    blank();
    var L=[mine('|f'+a.name),mine(wide?'|bName           Size   Date     Description':'|bName           Size   Date')];
    a.files.forEach(function(f){
      L.push(mine('|e'+f.n.padEnd(13)+'|a'+size(f.size).padStart(7)+' |7'+stamp(f.d,false)+(wide?' |f'+f.what:'')));
      if(!wide)L.push(mine('|f  '+f.what));
    });
    paged(L,fileMenu);
  });
}
function download(A,name,then){
  var go=function(nm){
    nm=nm.trim().toUpperCase();
    if(!nm){then();return}
    var f=null;A.forEach(function(a){a.files.forEach(function(x){if(x.n===nm||x.n.split('.')[0]===nm)f=f||x})});
    if(!f){put('|cNo file by that name.');then();return}
    protocol(f,then);
  };
  if(name)go(name);else ask('File name: ',go);
}
function protocol(f,then){
  var secs=Math.ceil(f.size*10/S.M.speed),blocks=Math.ceil(f.size/128);
  put('|7'+f.n+': '+size(f.size)+' bytes, about '+(secs>=60?Math.floor(secs/60)+' min ':'')+(secs%60)+' sec at '+S.M.speed+' bps.');
  ask(f.text?'Protocol: A)scii X)modem Y)modem Z)modem Q)uit: ':'Protocol: X)modem Y)modem Z)modem Q)uit: ',function(l){
    var c=l.trim().toLowerCase().charAt(0);
    if(c==='a'&&f.text){blank();paged(f.text.concat([['','']]),function(){put('|7End of '+f.n+'.');then()});return}
    if(c==='a'){put('|c'+f.n+' is not text. It needs a protocol.');then();return}
    if(c==='x'||c==='y'){
      put('|7'+(c==='x'?'XMODEM':'YMODEM batch')+' send: '+f.n+', '+blocks+' blocks.');
      put('|7Start your receive now. Two ^X to cancel.');
      [1,2,3].forEach(function(t){P.pause(1600);put('|8Waiting for receiver... retry '+t)});
      P.pause(800);
      put('|cTransfer aborted. Your end never answered.');
      P.typeLine('(a terminal has no disk to catch a file with.)','dim');
      then();return;
    }
    if(c==='z'){
      put('|7ZMODEM send: '+f.n+'.');
      [1,2,3].forEach(function(){P.typeLine('**B00000000000000');P.pause(1400)});
      put('|cTransfer aborted. Your end never answered.');
      P.typeLine('(a terminal has no disk to catch a file with.)','dim');
      then();return;
    }
    then();
  });
}
function upload(then){
  ask('Upload by X)modem Y)modem Z)modem Q)uit: ',function(l){
    var c=l.trim().toLowerCase().charAt(0);
    if(!/[xyz]/.test(c)){then();return}
    put('|7Ready to receive. Start your send now.');
    if(c==='z')P.typeLine('**B0100000023be50');
    else [1,2,3,4].forEach(function(){P.pause(1000);P.typeLine(c==='x'?'C':'C')});
    P.pause(800);
    put('|cNothing arrived. Upload aborted.');
    P.typeLine('(a terminal has nothing on it to send.)','dim');
    then();
  });
}

/* ---------- doors: the games, in a file of their own, loaded when a door first opens ---------- */
var DOORS=[['starhaul','Star Haul','trade between the stations, ten jumps a day'],['deepmine','Deep Mine','how deep dare you dig?']];
function doorMenu(){
  blank();
  put('|b-- |fDoors |b--');
  DOORS.forEach(function(d,i){put('|e'+String(i+1).padStart(2)+'|7  |f'+d[1].padEnd(10)+' |7'+d[2])});
  ask('Door number (Enter to quit): ',function(l){
    var n=parseInt(l,10);
    if(!(n>=1&&n<=DOORS.length)){prompt();return}
    var d=DOORS[n-1],ok=false;
    put('|7Opening '+d[1]+'... writing DOOR.SYS');
    P.queue(function(){return P.load(['../shared/bbs-doors.js']).then(function(x){ok=x})},true);
    P.queue(function(){
      if(off())return;
      if(!ok||!P.bbsDoors||!P.bbsDoors[d[0]]){put('|cThe door is stuck. Try again later.');doorMenu();return}
      P.bbsDoors[d[0]](door(),function(){blank();put('|7Back at '+S.C.name+'.');doorMenu()});
    },true);
  });
}
function door(){ /* what a door gets from the board: the caller, the clock, and the line */
  return {handle:S.handle,ansi:function(){return S.ansi},left:left,put:put,blank:blank,ask:ask,yes:yes,col:col,tint:tint,
    year:year,saved:function(k){return P.saved('bbs/'+k)},save:function(k,v){return P.save('bbs/'+k,v)},clean:clean};
}

/* ---------- the rest of the main menu ---------- */
var WALL=[['Night Owl','first! well, first tonight.'],['Static','anybody got a 2400 for under 200 bucks?'],
  ['Copper Pair','mom picked up the extension mid-download. again.'],['Lone Coder','the sysop owes me a door that works']];
function wall(){
  var W=WALL.map(function(x,i){return {h:x[0],t:x[1],d:Date.now()-(9-i)*864e5}}).concat(list('wall',20));
  blank();
  put('|b-- |fThe graffiti wall |b--');
  W.slice(-10).forEach(function(x){var h=clean(x.h,20);P.typeLine(tint('e',h.padEnd(12))+' '+tint('7',clean(x.t,60)),'',null,{hang:Math.max(12,h.length)+1})});
  yes('Add a line (y/N)? ',false,function(y){
    if(!y){prompt();return}
    ask('Your line: ',function(l){
      l=clean(l.trim(),60);
      if(l){var A=list('wall',20);A.push({h:S.handle,t:l,d:Date.now()});keep('wall',A,20);put('|aOn the wall.')}
      prompt();
    });
  });
}
var REGULARS=[['Night Owl',212],['Lone Coder',97],['Static',64],['Copper Pair',41],['Ohm Sweet Ohm',18],['Mx. Parity',6]];
function userList(){
  var U=users(),L=[mine('|bHandle               Calls  Last on')];
  L.push(mine('|e'+S.C.sysop.padEnd(20)+'|7'+'1'.padStart(6)+'  '+stamp(P.now().getTime(),false)+' |8(sysop)'));
  REGULARS.forEach(function(r,i){L.push(mine('|e'+r[0].padEnd(20)+'|7'+String(r[1]).padStart(6)+'  '+stamp(P.now().getTime()-i*864e5,false)))});
  Object.keys(U).forEach(function(k){var u=U[k];if(u&&typeof u==='object')L.push([tint('e',clean(u.h,20).padEnd(20))+tint('7',String(+u.calls||0).padStart(6)+'  '+stamp(+u.last||Date.now(),false)),'']) });
  blank();
  paged(L,prompt);
}
function lastCallers(){
  var now=P.now(),t=function(h,m){var d=new Date(now);d.setHours(h,m,0,0);return d.getTime()};
  var seen=[['Lone Coder',t(7,40)],['Static',t(12,5)],['Night Owl',t(Math.max(0,now.getHours()-1),18)]].filter(function(x){return x[1]<now.getTime()});
  var L=seen.map(function(x){return {h:x[0],d:x[1]}}).concat(list('callers',10)).sort(function(a,b){return a.d-b.d}).slice(-8);
  blank();
  put('|b-- |fLast callers |b--');
  L.forEach(function(x){P.typeLine(tint('7',stamp(+x.d))+'  '+tint('e',clean(x.h,20)))});
  prompt();
}
function page(){
  if(S.sysop){put('|7You are the sysop. Nobody else is here to answer.');prompt();return}
  blank();
  put('|7Paging '+S.C.sysop+'...');
  P.queue(function(){P.baud(0)},true); /* the bell rings at the other end, slowly */
  P.typeLine('. . . . . . .','dim',null,{speed:9});
  P.queue(function(){if(!off())P.baud(S.M.speed)},true);
  P.pause(400);
  put('|c'+S.C.sysop+' is not available.');
  var h=P.now().getHours();
  if(h<19||h>=22)put('|7Chat hours are 7 to 10 in the evening, most evenings.');
  yes('Leave a comment instead (y/N)? ',false,function(y){
    if(!y){prompt();return}
    edit(function(L){
      if(L){var A=list('comments',20);A.push({f:S.handle,d:Date.now(),L:L});keep('comments',A,20);put('|aThe sysop will see it.')}
      else put('|7Comment thrown away.');
      prompt();
    });
  });
}
function stats(){
  var u=S.user,on=Math.floor((Date.now()-S.on)/6e4);
  blank();
  put('|bHandle:          |f'+S.handle);
  put('|bCalls:           |7'+(+u.calls||1));
  if(u.first)put('|bFirst call:      |7'+stamp(+u.first,false));
  put('|bOn this call:    |7'+on+' min');
  put('|bTime left:       |e'+left()+' min');
  put('|bMessages posted: |7'+(+u.posts||0));
  put('|bTerminal:        |7'+(S.ansi?'ANSI colour':'ASCII')+', '+S.M.speed+' bps');
  put('|bToday is:        |7'+P.ctime(P.now()).slice(0,10)+' '+year());
  prompt();
}
function ansiToggle(){
  if(!canAnsi()){put('|7This board sends plain ASCII.');prompt();return}
  S.ansi=!S.ansi;
  if(S.user){S.user.ansi=S.ansi;save()}
  put('|aANSI colour is '+(S.ansi?'on':'off')+'.');
  prompt();
}
function goodbye(){
  yes('Log off now (Y/n)? ',true,function(y){
    if(!y){prompt();return}
    bye();
  });
}
function bye(){
  blank();
  put('|aThanks for calling '+S.C.name+', '+S.handle+'. Call again!');
  hang();
}
function sysopMenu(){
  showMenu('Sysop menu',[['1','Read comments'],['2','Wipe this board\'s data'],['3','Drop to DOS'],['Q','Back']]);
  ask('Sysop command: ',function(l){
    var c=l.trim().toLowerCase();
    if(c==='1'){
      var A=list('comments',20);
      if(!A.length){put('|7No comments.');sysopMenu();return}
      var L=[];
      A.forEach(function(x){L.push([tint('b','From ')+tint('f',clean(x.f,20))+tint('7','  '+stamp(+x.d||Date.now())),'']);(Array.isArray(x.L)?x.L:[]).forEach(function(t){L.push([clean(t),''])});L.push(['',''])});
      paged(L,sysopMenu);
      return;
    }
    if(c==='2'){yes('Wipe callers, posts, wall and comments (y/N)? ',false,function(y){
      if(y){['users','posts','wall','comments','callers','haul','mine'].forEach(function(k){P.save('bbs/'+k,null)});put('|aWiped.')}
      sysopMenu();
    });return}
    if(c==='3'){put('|7Remote DOS is switched off on this node. You set it that way.');sysopMenu();return}
    prompt();
  });
}

/* ---------- the call ---------- */
function hang(){ /* the board drops the line */
  P.pause(900);
  P.queue(function(){end(true)},true);
}
function end(carrier){
  if(off())return;
  S.gone=true;
  save();
  P.baud(S.baud);
  var M=S.M,done=S.done;
  S=null;
  if(carrier)M.hangup();else M.hangup(true);
  done();
}
P.bbs={
  numbers:numbers,
  directory:function(){var c=conf();return [[c.name,c.number,'2400']].concat(OTHERS.map(function(b){return b.slice(0,3)}))}, /* for a terminal program's dialing list */
  /* a call that has gone through: M is the modem (modem.js), done() is told when the line drops */
  call:function(M,done){
    S={M:M,C:conf(),user:null,handle:'',sysop:false,ansi:false,on:Date.now(),gone:false,done:done,baud:P.baud()};
    P.baud(M.speed);
    logon();
  },
  conf:conf
};
(function(){ /* the colours, next to the machine's own styles: the site's theme still wins */
  var M=P.catalog[P.machine],el=document.createElement('link');
  el.rel='stylesheet';el.href=(M?M.dir+'/':'')+'../shared/bbs.css';
  document.head.insertBefore(el,document.querySelector('link[href^="site/"]'));
})();
P.setup(function(){}); /* notes the file as loaded */
})(window.Phosphor);
