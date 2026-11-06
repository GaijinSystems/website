/* PHOSPHOR-9 terminal: machine "tops20-1986", the TOPS-20 EXEC: its commands, recognition with
   escape and guide words, and ? for what can come next.
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE.
   The command names, guide words and messages are the EXEC's, checked against TOPS-20 running
   under KLH10 and against the 6.1 EXEC's own source; the help texts are this terminal's. */
(function(P){
'use strict';
var MON=' DEC20, TOPS-20 Monitor 6.1(7030)',EXEC=' TOPS-20 Command processor 6.1(430)';
var JOB=23,TTY=12,DIRNO=412;
var S={on:true,last:null,read:false}; /* logged in; the last login; the letter read */
function up(s){return String(s).toUpperCase()}
function say(L){P.say(L)}
function err(s){P.typeLine(s,'err');P.status(1)}
var MON3=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function dt(d){return d.getDate()+'-'+MON3[d.getMonth()]+'-'+String(d.getFullYear()).slice(2)+' '+P.p2(d.getHours())+':'+P.p2(d.getMinutes())+':'+P.p2(d.getSeconds())}
function hms(ms){var s=Math.floor(ms/1000);return Math.floor(s/3600)+':'+P.p2(Math.floor(s/60)%60)+':'+P.p2(s%60)}
function me(){return up(P.st.user)}

/* ---------- names: PS:<DIR.SUB>NAME.TYP.GEN, logical names, and the folders behind them ---------- */
var LOGICAL={sys:['/subsys','/games'],games:['/games'],hlp:['/help'],system:['/system'],doc:['/documentation'],mail:['/mail']};
function dirName(abs){return 'PS:<'+(abs==='/'?'ROOT-DIRECTORY':up(abs.slice(1)).replace(/\//g,'.'))+'>'}
function folder(abs){var n=P.find(abs,true);return n&&n.type==='d'?n:null}
function parse(spec,dflt){ /* {dirs:[abs...], name, ext, gen, dev}; ext and gen are null when not given */
  var s=String(spec||'').toLowerCase(),dirs=null,dev='',m=s.match(/^([a-z0-9$-]+):/);
  if(m){dev=m[1];s=s.slice(m[0].length);if(P.has(LOGICAL,dev))dirs=LOGICAL[dev].slice()}
  m=s.match(/^[<\[]([^>\]]*)[>\]]/);
  if(m){s=s.slice(m[0].length);dirs=[m[1]==='root-directory'||!m[1]?'/':'/'+m[1].replace(/\./g,'/')]}
  if(!dirs)dirs=[P.st.cwd];
  var p=s.split('.'),name=p[0]||'',ext=p.length>1?p[1]:null,gen=p.length>2?p[2]:null;
  if(dflt&&!name)name=dflt.name;
  if(dflt&&ext===null&&dflt.ext!=null)ext=dflt.ext;
  if(dflt&&gen===null&&dflt.gen!=null)gen=dflt.gen;
  return {dirs:dirs,name:name,ext:ext,gen:gen,dev:dev};
}
function entries(dir,all){ /* every generation: {key,name,ext,gen,node}, newest first; deleted ones only with all */
  return Object.keys(dir.kids).filter(function(k){var n=dir.kids[k];return k.charAt(0)!=='.'&&!n.dev&&(all||!n.del)}).map(function(k){
    var n=dir.kids[k],m=k.match(/^(.*\..*)\.(\d+)$/),b=m?m[1]:k,dot=b.indexOf('.');
    if(n.type==='d')return {key:k,name:k,ext:'directory',gen:1,node:n};
    return {key:k,name:dot<0?b:b.slice(0,dot),ext:dot<0?'':b.slice(dot+1),gen:m?+m[2]:1,node:n};
  }).sort(function(a,b){return a.name<b.name?-1:a.name>b.name?1:a.ext<b.ext?-1:a.ext>b.ext?1:b.gen-a.gen});
}
function wild(p){return new RegExp('^'+p.replace(/[.+?^${}()|\\\[\]]/g,'\\$&').replace(/\*/g,'.*').replace(/%/g,'.')+'$')}
function matches(S,dir,all){ /* name and type as given (a missing type is any, for a wildcard, else none) */
  var name=wild(S.name||'*'),ext=S.ext!==null&&wild(S.ext);
  return entries(dir,all).filter(function(e){
    if(!name.test(e.name))return false;
    if(ext)return ext.test(e.ext);
    return /[*%]/.test(S.name)||!S.name||e.ext==='';
  });
}
function newest(L){var seen={};return L.filter(function(e){var k=e.name+'.'+e.ext;if(seen[k])return false;seen[k]=true;return true})}
function gens(L,S){ /* .n that one, .* all, none the newest */
  if(S.gen==='*')return L;
  if(S.gen!==null&&S.gen!==''&&S.gen!=='0')return L.filter(function(e){return e.gen===+S.gen});
  return newest(L);
}
function show(e){return up(e.name+'.'+e.ext+'.'+e.gen)}
function said(S){return up((S.dev?S.dev+':':'')+S.name+(S.ext!==null?'.'+S.ext:'')+(S.gen!==null?'.'+S.gen:''))}
function find1(spec,dflt,all){ /* the one file a spec means, searching a list in order */
  var S=parse(spec,dflt);
  for(var i=0;i<S.dirs.length;i++){
    var dir=folder(S.dirs[i]);if(!dir)continue;
    var L=gens(matches(S,dir,all),S);
    if(L.length)return {S:S,dir:dir,e:L[0],abs:S.dirs[i]};
  }
  return {S:S};
}
function pages(n){return Math.max(1,Math.ceil(P.fsize(n)/2560))}
function nextGen(dir,name,ext){
  var g=0;entries(dir,true).forEach(function(e){if(e.name===name&&e.ext===ext&&e.gen>g)g=e.gen});
  return g+1;
}
function mine(abs){return abs===P.st.home||abs.indexOf(P.st.home+'/')===0}
function writeNew(spec,lines){ /* a new generation, never over the old one: the name it got, or null */
  var S=parse(spec),abs=S.dirs[0],dir=folder(abs);
  if(!dir){err('?No such directory - "'+said(S)+'"');return null}
  if(!S.name){err('?Null filename is not allowed');return null}
  var ext=S.ext||'',g=nextGen(dir,S.name,ext),key=S.name+'.'+ext+'.'+g;
  if(!mine(abs)||!P.writeFile((abs==='/'?'':abs)+'/'+key,lines,false)){err('?Write or append access required - "'+up(key)+'"');return null}
  return {name:S.name,ext:ext,gen:g};
}

/* ---------- the commands: name, guide words, what follows, and whether it works before LOGIN ---------- */
var C=[],BYNAME={};
function cmd(name,guide,arg,run,o){var c=Object.assign({name:name,guide:guide,arg:arg,run:run},o||{});C.push(c);BYNAME[name]=c;return c}
/* the rest of the EXEC's commands: there, recognised, and of no use to a guest */
['ACCESS:(TO DIRECTORY):dir','ADVISE:(USER):user','APPEND:(SOURCE FILE):file','ARCHIVE:(FILES):file','ASSIGN:(DEVICE):text','ATTACH:(USER):user:out','BACKSPACE:(DEVICE):text',
 'BREAK:(LINKS):text:out','BUILD:(DIRECTORY NAME):dir','CANCEL:(REQUEST TYPE):text','CLOSE:(JFN):text','COMPILE:(FROM):file','CONTINUE:(FORK):text','CREATE:(FILE):file','CREF:(FILE):file',
 'CSAVE:(ON):file','DDT::','DEASSIGN:(DEVICE):text','DEBUG:(FROM):file','DECLARE:(PCL OBJECT):text','DEFINE:(LOGICAL NAME):text','DEPOSIT:(INTO):text','DETACH::','DISABLE:(CAPABILITIES):',
 'DISCARD:(TAPE):text','DISMOUNT:(TAPE OR STRUCTURE):text','DO:(FILE):file','EDIT:(FILE):file','ENABLE:(CAPABILITIES):','END-ACCESS:(TO DIRECTORY):dir','EOF::text','EXAMINE:(ADDRESS):text',
 'EXECUTE:(FROM):file','FDIRECTORY:(OF FILES):file','FORK:(IS):text','FREEZE:(FORK):text','GET:(PROGRAM):file','KEEP:(FORK):text','KMIC::','LOAD:(FROM):file','MERGE:(PROGRAM FROM):file',
 'MODIFY:(REQUEST TYPE):text','MOUNT:(TYPE):text','ORIGINAL::text','PERUSE:(FILE):file','PLOT:(FILES):file','POP:(COMMAND LEVEL):','PRESERVE:(ENVIRONMENT):text','PRINT:(FILES):file',
 'PUNCH:(FILES):file','PUSH:(COMMAND LEVEL):','QDIRECTORY:(OF FILES):file','RDIRECTORY:(OF FILES):file','RECEIVE::text','REENTER:(PROGRAM):','REFUSE::text','REMARK::text','RESET:(FORK):text',
 'RETRIEVE:(FILES):file','REWIND:(DEVICE):text','SAVE:(ON):file','SEND:(TO):text','SET::text:out','SKIP:(DEVICE):text','START:(PROGRAM):text','SUBMIT:(BATCH JOB):file','TAKE:(COMMANDS FROM):file',
 'TALK:(TO):text','TDIRECTORY:(OF FILES):file','TERMINAL:(MODE IS):text:out','TRANSLATE:(DIRECTORY):text','UNATTACH:(JOB):text:out','UNDECLARE:(PCL OBJECT):text','UNKEEP:(FORK):text',
 'UNLOAD:(DEVICE):text','WDIRECTORY:(OF FILES):file'].forEach(function(x){
  var p=x.split(':');cmd(p[0],p[1],p[2]||'',null,{out:p[3]==='out'});
});
var ABBREV={c:'CONTINUE',d:'DEPOSIT',e:'EXAMINE',ex:'EXECUTE',g:'GET',log:'LOGIN',back:'BACKSPACE',dis:'DISABLE',pr:'PRINT',und:'UNDELETE'};
function table(){ /* the commands there are now: fewer before LOGIN */
  return C.filter(function(c){return S.on?!c.login:c.out||c.login}).sort(function(a,b){return a.name<b.name?-1:1});
}
function lookup(word){ /* {c} or {amb} or {} */
  var w=up(word),T=table(),hit=T.filter(function(c){return c.name===w})[0];
  if(hit)return {c:hit};
  var ab=ABBREV[w.toLowerCase()];
  if(ab&&BYNAME[ab]&&T.indexOf(BYNAME[ab])>=0)return {c:BYNAME[ab]};
  var L=T.filter(function(c){return !c.hide&&c.name.indexOf(w)===0});
  if(!L.length)L=T.filter(function(c){return c.name.indexOf(w)===0});
  return L.length===1?{c:L[0]}:L.length?{amb:true}:{};
}

/* ---------- running a program: the name at the prompt, R, RUN, or a device and name ---------- */
var GAMEMAP={adventure:'adventure',dungeon:'dungeon'}; /* the <GAMES> that run, and the command behind each */
var PROG={};
function runFile(r,a){ /* r from find1: start what is behind it, with the rest of the line */
  var nm=r.e.name;
  if(r.abs==='/games'&&P.has(GAMEMAP,nm)&&P.has(P.cmds,GAMEMAP[nm])){P.cmds[GAMEMAP[nm]]([],GAMEMAP[nm],[GAMEMAP[nm]]);return}
  if(r.abs==='/subsys'&&P.has(PROG,nm)){PROG[nm](a||[]);return}
  if(r.abs==='/games'){err('?Games may not be played during prime time');return}
  if(r.e.ext!=='exe'||!r.e.node.bin){err('?File is not in SAVE or EXE format');return}
  err('?Execute access required - "'+dirName(r.abs)+show(r.e)+'"');
}
function program(spec,where){ /* the name alone looks in SYS:, a name with a device or directory where it says */
  var S=parse(spec),plain=!S.dev&&!/[<\[]/.test(spec);
  return find1(plain&&where?where+':'+spec:spec,{ext:'exe'});
}

/* ---------- recognition: what each field may be, and what escape fills in ---------- */
function filesIn(text,kind){ /* names a partial filespec could become */
  var m=text.match(/^(.*?[:>\]])?([^:>\]]*)$/),pre=m[1]||'',part=up(m[2].toLowerCase()),S=parse(pre+'x'),out=[];
  if(kind==='dir'){
    var K=P.root.kids,tops=Object.keys(K).filter(function(k){return K[k].type==='d'&&k.charAt(0)!=='.'}).sort();
    return {pre:'',list:tops.map(function(k){return '<'+up(k)+'>'}).filter(function(n){return n.indexOf(up(text))===0})};
  }
  S.dirs.forEach(function(abs){
    var dir=folder(abs);if(!dir||dir.prot)return;
    newest(entries(dir)).forEach(function(e){
      var full=show(e);
      if(full.indexOf(part)===0&&out.indexOf(full)<0)out.push(full);
    });
  });
  return {pre:pre,list:out};
}
function cols(names){ /* a list in columns as wide as the glass allows */
  var w=names.reduce(function(a,x){return Math.max(a,x.length)},0)+3,n=Math.max(1,Math.floor((P.columns()-1)/w)),L=[];
  P.chunk(names,n).forEach(function(r){L.push(' '+r.map(function(x,i){return i<r.length-1?x.padEnd(w):x}).join(''))});
  return L;
}
var HELPWORD={file:'FILE NAME',dir:'Directory name',user:'user name',text:'text',prog:'program name'};
P.recognize=function(key,line){
  var m=line.match(/^(\s*)(\S*)$/);
  if(m){ /* still on the command name */
    var w=up(m[2]),T=table().filter(function(c){return !c.hide});
    if(key==='?'){
      var L=T.filter(function(c){return c.name.indexOf(w)===0}).map(function(c){return c.name});
      if(!L.length)return {echo:line+'?  system program name',list:[],line:line};
      return {echo:line+'? Command, one of the following:',list:cols(L).concat(w||!S.on?[]:['  or system program name']),line:line};
    }
    if(!w)return line;
    var r=lookup(w);
    if(!r.c)return line;
    return m[1]+r.c.name+' '+(r.c.guide?r.c.guide+' ':'');
  }
  var c=lookup(line.trim().split(/\s+/)[0]).c;
  if(!c)return line;
  var rest=line.replace(/^\s*\S+/,'').replace(/\([^)]*\)/g,' '),words=rest.trim()?rest.trim().split(/\s+/):[],
      ends=/\s$/.test(line),cur=ends?'':words.pop()||'',field=words.length,kind=c.args?c.args[Math.min(field,c.args.length-1)]:c.arg;
  if(c.kw&&field===0){ /* a keyword: INFORMATION, HELP and the like */
    var K=c.kw().filter(function(k){return k.indexOf(up(cur))===0});
    if(key==='?')return {echo:line+'? '+(c.kwHelp||'one of the following:'),list:(c.kwHead||[]).concat(cols(K),c.kwTail||[]),line:line};
    if(K.length!==1&&!(K.indexOf(up(cur))>=0))return line;
    var k=K.length===1?K[0]:up(cur);
    return line.slice(0,line.length-cur.length)+k+' ';
  }
  if(key==='?')return {echo:line+'? '+(c.help||(kind?HELPWORD[kind]||'':'confirm with carriage return')),list:[],line:line};
  if(kind==='file'||kind==='dir'){
    if(!cur&&field===0&&c.dflt)return line+c.dflt+' ';
    var F=filesIn(cur,kind);
    if(F.list.length!==1)return line;
    var next=c.then&&field===0?c.then+' ':'';
    return line.slice(0,line.length-cur.length)+F.pre.toUpperCase()+F.list[0]+' '+next;
  }
  if(kind==='user'){
    var U=['GUEST','OPERATOR',up(P.profile.owner)].filter(function(u,i,a){return u.indexOf(up(cur))===0&&a.indexOf(u)===i});
    return U.length===1?line.slice(0,line.length-cur.length)+U[0]+' ':line;
  }
  return line;
};

/* ---------- the commands that do something ---------- */
cmd('DIRECTORY','(OF FILES)','file',function(a){dir(a)},{dflt:'*.*.*'});
cmd('VDIRECTORY','(OF FILES)','file',function(a){dir(a,true)},{dflt:'*.*.*'});
function dir(a,verbose){
  var specs=a.length?a.join(' ').split(','):['*.*.*'],shown=0,files=0,total=0;
  specs.forEach(function(spec){
    spec=spec.trim()||'*.*.*';
    var S=parse(spec,{name:'*',ext:'*',gen:'*'});
    var any=false;
    S.dirs.forEach(function(abs){
      var d=folder(abs);
      if(!d){err('%No such directory name - '+dirName(abs).slice(3));any=true;return}
      if(d.prot){err('?Directory access privileges required - "'+dirName(abs)+'"');any=true;return}
      var L=gens(matches(S,d),S);
      if(!L.length)return;
      any=true;shown++;
      var out=['','   '+dirName(abs)],last=null,used=0;
      L.forEach(function(e){
        var pg=pages(e.node),same=last&&last.name===e.name&&last.ext===e.ext;
        used+=pg;files++;
        if(same&&!verbose){out[out.length-1]+=','+e.gen;return}
        var head=last&&last.name===e.name?'   .'+up(e.ext)+'.'+e.gen:' '+show(e);
        if(verbose)head=head.padEnd(24)+String(pg).padStart(4)+'  '+dt(e.node.date||P.systemDate).replace(/:\d\d$/,'');
        out.push(head);last=e;
      });
      total+=used;
      out.push('',' Total of '+used+' page'+(used===1?'':'s')+' in '+L.length+' file'+(L.length===1?'':'s'));
      say(out);
    });
    if(!any)err('%File not found - '+up(spec));
  });
  if(shown>1)say(['',' Grand total of '+total+' pages in '+files+' files']);
}
cmd('TYPE','(FILE)','file',function(a){
  if(!a.length){err('?Missing file name');return}
  a.join(' ').split(',').forEach(function(spec){
    spec=spec.trim();
    var r=find1(spec,{ext:''});
    if(!r.e&&parse(spec).ext===null){var any=find1(spec+'.*');if(any.e)r=any} /* TYPE README finds README.TXT */
    if(!r.e){var T=parse(spec);err('?'+(T.ext===null?'No such filename':'File not found')+' - "'+said(T)+'"');return}
    if(r.e.node.type==='d'){err('?File is a directory - "'+show(r.e)+'"');return}
    if(r.e.node.prot){err('?Read access required - "'+dirName(r.abs)+show(r.e)+'"');return}
    if(r.e.node.bin){P.typeLine(garble(r.e.name));return}
    say(P.text(r.e.node));
  });
},{help:'FILE NAME'});
function garble(s){ /* what a 36-bit binary looks like printed seven bits at a time */
  var h=0,o='';
  for(var i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))>>>0;
  for(var j=0;j<34;j++){h=(h*1103515245+12345)>>>0;o+=String.fromCharCode(33+(h>>>16)%90)}
  return o;
}
cmd('DELETE','(FILES)','file',function(a){
  if(!a.length){err('?Missing file name');return}
  a.join(' ').split(',').forEach(function(spec){
    var S=parse(spec.trim()),hit=false;
    S.dirs.forEach(function(abs){
      var d=folder(abs);if(!d)return;
      gens(matches(S,d),S).forEach(function(e){
        hit=true;
        if(e.node.prot||!mine(abs)||e.node.type==='d'){err(' '+show(e)+' ?Delete access required');return}
        e.node.del=true;P.typeLine(' '+show(e)+' [OK]');
      });
    });
    if(!hit)err('%File not found - '+said(S));
  });
});
cmd('UNDELETE','(FILES)','file',function(a){
  if(!a.length){err('?Missing file name');return}
  a.join(' ').split(',').forEach(function(spec){
    var S=parse(spec.trim()),hit=false;
    S.dirs.forEach(function(abs){
      var d=folder(abs);if(!d)return;
      var L=matches(S,d,true).filter(function(e){return e.node.del});
      (S.gen===null?L:gens(L,S)).forEach(function(e){hit=true;delete e.node.del;P.typeLine(' '+show(e)+' [OK]')});
    });
    if(!hit)err('?File not found - "'+said(S)+'"');
  });
});
cmd('EXPUNGE','(DIRECTORY)','dir',function(a){
  var abs=a[0]?parse(a[0]).dirs[0]:P.st.cwd,d=folder(abs),freed=0;
  if(!d){err('?No such directory name');return}
  if(!mine(abs)){err('?WHEEL or OPERATOR capability required');return}
  entries(d,true).forEach(function(e){if(e.node.del){freed+=pages(e.node);delete d.kids[e.key]}});
  P.typeLine(' '+dirName(abs)+' ['+(freed?freed+' page'+(freed===1?'':'s'):'No pages')+' freed]');
});
cmd('COPY','(FROM)','file',function(a){
  if(a.length<2){err('?Missing file name');return}
  var src=a[0],dst=a[1];
  if(/^tty:$/i.test(src)){
    var t=parse(dst);
    if(!t.name){err('?Null filename is not allowed');return}
    P.say([' TTY: => '+up(t.name+'.'+(t.ext||'')+'.'+(nextGenOf(t))),'']);
    P.input([],function(L){writeNew(dst,L)});
    return;
  }
  var r=find1(src,{ext:''});
  if(!r.e){err('?File not found - "'+said(r.S)+'"');return}
  if(r.e.node.prot||r.e.node.type==='d'){err('?Read access required - "'+dirName(r.abs)+show(r.e)+'"');return}
  var T=parse(dst),dd={name:T.name==='*'||!T.name?r.e.name:T.name,ext:T.ext===null||T.ext==='*'?r.e.ext:T.ext};
  var to=(dst.match(/^(.*?[:>\]])?/)[1]||'')+dd.name+'.'+dd.ext,got=writeNew(to,P.text(r.e.node));
  if(got)P.typeLine(' '+show(r.e)+' => '+show(got)+' [OK]');
},{args:['file','file'],then:'(TO)'});
function nextGenOf(t){var d=folder(t.dirs[0]);return d?nextGen(d,t.name,t.ext||''):1}
cmd('RENAME','(EXISTING FILE)','file',function(a){
  if(a.length<2){err('?Missing file name');return}
  var r=find1(a[0],{ext:''});
  if(!r.e){err('?File not found - "'+said(r.S)+'"');return}
  var T=parse(a[1]),d=folder(T.dirs[0]);
  if(!d||r.e.node.prot||!mine(r.abs)||!mine(T.dirs[0])){err('?Rename access required - "'+show(r.e)+'"');return}
  var ext=T.ext===null?r.e.ext:T.ext,g=nextGen(d,T.name,ext),k=T.name+'.'+ext+'.'+g,n=r.e.node;
  delete r.dir.kids[r.e.key];n.name=k;n.parent=d;d.kids[k]=n;
  P.typeLine(' '+show(r.e)+' => '+up(k)+' [OK]');
},{args:['file','file'],then:'(TO BE)'});
cmd('CONNECT','(TO DIRECTORY)','dir',function(a,raw,w){
  if(!a.length||P.allowed.indexOf(a[0].toLowerCase())>=0){terminal('connect',a);return} /* the terminal's own: another machine */
  var S=parse(a[0]),abs=S.dirs[0],d=folder(abs);
  if(!/[<\[]/.test(a[0])||!d){err('?Does not match directory or user name, or structure not mounted');return}
  if(mine(abs)){P.st.cwd=abs;return}
  P.ask('Password: ',function(l){if(l!==null&&l!==P.INT)err('?Invalid password')},true,true);
},{help:'Directory name'});
function terminal(name,a){var f=TERM[name];if(f)f(a,name+' '+a.join(' '),[name].concat(a))}
cmd('DAYTIME','','',function(){
  var d=P.now();
  P.typeLine(' '+['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][d.getDay()]+', '+
    ['January','February','March','April','May','June','July','August','September','October','November','December'][d.getMonth()]+' '+d.getDate()+', '+d.getFullYear()+' '+P.p2(d.getHours())+':'+P.p2(d.getMinutes())+':'+P.p2(d.getSeconds()));
},{out:true});
cmd('BLANK','','',function(){P.clear()});
var USERS=[[2,'DET','SYSJB1','OPERATOR'],[3,13,'OPR','OPERATOR'],[4,14,'PTYCON','OPERATOR'],[7,21,'EMACS','KRAMER'],[11,33,'MM','HOLLIS'],[14,40,'TV','WEBER'],[17,25,'EXEC','LINDQUIST'],[19,44,'KERMIT','OSTROW']];
function jobs(){ /* the others, and the site's owner reading mail */
  var J=USERS.slice(),own=up(P.profile.owner);
  if(own!=='OPERATOR'&&own!==me())J.push([21,37,'MM',own]);
  return J;
}
function row(j,star){return String(j[0]).padStart(4)+(star?'*':' ')+String(j[1]).padStart(5)+'  '+j[2].padEnd(8)+j[3]}
var BOOTED=Date.now();
cmd('SYSTAT','','text',function(){
  var n=P.now(),J=jobs(),all=J.length+1;
  var L=[' '+['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][n.getDay()]+' '+dt(n)+'  Up '+hms(Date.now()-BOOTED+(3*24+4)*36e5+17*6e4),
    ' 3+'+(all-3)+' Jobs   Load av   1.42   1.17   1.05','',' Job  Line Program  User              Origin'];
  L.push(row([JOB,TTY,'SYSTAT',S.on?me():'Not logged in'],true));
  if(!S.on)L.push('');
  J.forEach(function(j){L.push(row(j))});
  say(L);
},{out:true,kw:function(){return ['.','ALL','DIRECTORY','HEADER','LINE','NO','ORIGIN','PROGRAM','STATE','SYSTEM','TIME','WHAT','WHERE','WHO']},kwTail:['  or user name','  or Decimal job number','  or confirm with carriage return']});
cmd('INFORMATION','(ABOUT)','text',function(a){info(a)},{out:true,kw:function(){return Object.keys(INFO).sort().filter(function(k){return S.on||INFO[k].out})}});
var INFO={};
function topic(name,run,o){INFO[name]=Object.assign({run:run},o||{})}
['ADDRESS-BREAK','ALERTS','ARCHIVE-STATUS','COMMAND-LEVEL','DEFAULTS','ERROR-NUMBER','FILE-STATUS','FORK-STATUS','MEMORY-USAGE','MONITOR-STATISTICS','PCL-OBJECTS','PROGRAM-STATUS','PSI-STATUS','SPOOLED-OUTPUT-ACTION','STRUCTURE','SUBSYSTEM-STATISTICS','SUPERIORS','TAPE-PARAMETERS','VARIABLE','VOLUMES','ARPANET','DECNET']
  .forEach(function(k){topic(k,function(){P.typeLine(' No information on '+k)})});
['BATCH-REQUESTS','MOUNT-REQUESTS','OUTPUT-REQUESTS','RETRIEVAL-REQUESTS'].forEach(function(k){topic(k,function(){P.typeLine('[The queues are empty]')})});
topic('AVAILABLE',function(){P.typeLine(' Terminals available to users: TTY12-TTY47')},{out:true});
topic('VERSION',function(){say([MON,EXEC])},{out:true});
topic('SYSTEM-STATUS',function(){say([' Operator is in attendance',' Remote logins allowed',' Local logins allowed',' Pseudo-terminal logins allowed',' Console terminal login allowed',' Accounting is being done',' Account validation is disabled',' Working set preloading is enabled',' Class scheduling is disabled'])},{out:true});
topic('JOB-STATUS',function(){say([' Job '+JOB+', TTY'+TTY,' User '+me()+', Account '+me(),' Connected to '+dirName(P.st.cwd)])});
topic('DISK-USAGE',function(){
  var d=folder(P.st.cwd),used=d?entries(d,true).reduce(function(s,e){return s+pages(e.node)},0):0;
  say([' '+dirName(P.st.cwd),' '+used+' Pages assigned',' 250 Working pages, 250 Permanent pages allowed',' 41822 Pages free on PS:, 113506 pages used.']);
});
topic('DIRECTORY',function(){say([' Name '+dirName(P.st.cwd),' Working disk storage page limit 250',' Permanent disk storage page limit 250',' Number of directory '+DIRNO,' Last login '+dt(S.last)])});
topic('MAIL',function(){P.typeLine(newMail()?' You have new mail':' No new mail exists')},{});
topic('TERMINAL-MODE',function(){say([' TERMINAL VT100',' TERMINAL SPEED 9600',' TERMINAL LENGTH 24',' TERMINAL WIDTH 80',' TERMINAL LOWERCASE',' TERMINAL NO RAISE',' TERMINAL INDICATE',' TERMINAL FULLDUPLEX'])});
topic('LOGICAL-NAMES',function(){say([' GAMES: => PS:<GAMES>',' HLP: => PS:<HELP>',' SYS: => SYS:,GAMES:'])});
function info(a){
  var w=up(a[0]||'');
  if(!w){err('?Null switch or keyword given');return}
  var K=Object.keys(INFO).filter(function(k){return (S.on||INFO[k].out)&&k.indexOf(w)===0});
  if(K.length!==1&&K.indexOf(w)<0){err('?'+(K.length?'Ambiguous':'Does not match switch or keyword')+' - "'+w+'"');return}
  INFO[K.length===1?K[0]:w].run(a.slice(1));
}
function newMail(){return P.profile.mail.length>0&&!S.read}
cmd('LOGOUT','','',function(){
  var n=P.now();
  if(!S.on){say(['Killed Job '+JOB+', TTY'+TTY+', at '+dt(n)]);return}
  say(['Killed Job '+JOB+', User '+me()+', Account '+me()+', TTY'+TTY+', at '+dt(n),' Used 0:00:'+P.p2(Math.min(59,1+Math.floor((n-P.st.login)/60000)))+' in '+hms(n-P.st.login),'',MON,'']);
  S.on=false;S.last=P.st.login;P.st.cwd=P.st.home;
},{out:true});
cmd('LOGIN','','user',function(a){
  var u=(a[0]||'').toLowerCase();
  if(!u){err('?Missing user name');return}
  if(['guest','operator',P.profile.owner].indexOf(u)<0){err('?No such user name - "'+up(u)+'"');return}
  function go(word){
    if(word===null||word===P.INT)return;
    if(u!=='guest'){P.pause(1400);err('?Invalid password');return}
    var n=P.now();S.on=true;P.st.login=n;P.st.cwd=P.st.home;
    say(jobLine(n).concat(WELCOME));
    if(newMail())P.typeLine(P.profile.mailNotice);
  }
  if(a.length>1){go(a[1]);return}
  P.ask('Password: ',go,true,true);
},{login:true,out:true,help:'User name'});
function jobLine(n){return [' Job '+JOB+' on TTY'+TTY+' '+dt(n)+', Last Login '+dt(S.last)]}
function run(a,where,missing){ /* R and RUN: the program the first word names, given the rest */
  if(!a[0]){err('?Missing '+missing);return}
  var r=program(a[0],where);
  if(!r.e){err('?File not found - "'+said(r.S)+'"');return}
  runFile(r,a.slice(1));
}
cmd('R','(PROGRAM)','prog',function(a){run(a,'sys','program name')});
cmd('RUN','(PROGRAM)','file',function(a){run(a,null,'file name')});
cmd('HELP','','text',function(a){helpOn(a[0])},{kw:function(){return helpTopics()},kwHelp:'RETURN for general help',kwHead:['  or one of the following:']});

/* ---------- HELP: the files in HLP:, each a line or two ---------- */
var HLP={
  HELP:['HELP topic prints HLP:topic.HLP. HELP ? lists the topics.','At the @ prompt, ? shows what can come next and ESCAPE finishes a word.'],
  ADVENTURE:['Colossal Cave, by Will Crowther and Don Woods. Type ADVENTURE.','Commands are one or two words. Only the first five letters count.'],
  DUNGEON:['Dungeon, the FORTRAN translation of MIT\'s Zork. Type DUNGEON.','Treasures go in the trophy case. SAVE and RESTORE keep a game in this browser.'],
  MM:['MM reads your mail. HEADERS, READ, NEXT, DELETE, EXIT.'],
  FINGER:['FINGER lists who is on. FINGER name says more about one of them.'],
  ABOUT:['ABOUT: who owns this machine.'],
  SOURCE:['SOURCE: where to get this terminal.'],
  CONNECT:['CONNECT <DIR> moves you to a directory you own.','CONNECT on its own lists the other machines on the line; CONNECT name plugs into one.'],
  SOUND:['SOUND ON or SOUND OFF: the keyclicks.'],
  FILL:['FILL: the monitor fills the window. FILL again puts it back.'],
  EFFECTS:['EFFECTS AUTO, FULL or LITE: how hard the tube works.']
};
function helpTopics(){return Object.keys(HLP).filter(function(k){return !(k==='CONNECT'&&P.allowed.length<2)&&!(k==='ABOUT'&&!P.profile.about.length)}).sort()}
function helpOn(t){
  t=up(t||'');
  if(!t){say(['',' This is TOPS-20. Type a command and press RETURN.',' ESCAPE finishes a word, and ? shows what can come next.',' DIRECTORY, TYPE, SYSTAT, FINGER, MM and LOGOUT are a start.',' The games are in GAMES:. HELP ? lists the other topics.',''] );return}
  var K=helpTopics().filter(function(k){return k.indexOf(t)===0});
  if(!K.length){err('?No help available for '+t);return}
  say(HLP[K[0]].map(function(l){return ' '+l}));
}

/* ---------- system programs: MM and FINGER ---------- */
PROG.finger=function(a){
  a=a||[];
  var J=jobs().filter(function(j){return j[1]!=='DET'&&j[3]!=='OPERATOR'}).concat(S.on?[[JOB,TTY,'FINGER',me()]]:[]);
  if(a[0]){
    var u=up(a[0]),hit=J.filter(function(j){return j[3]===u});
    if(!hit.length&&['GUEST','OPERATOR'].indexOf(u)<0){err('?No such user name - "'+u+'"');return}
    var L=hit.map(function(j){return u.padEnd(9)+(u==='GUEST'?'Guest account':'').padEnd(22)+String(j[0]).padStart(3)+' '+j[2].padEnd(8)+String(j[1]).padStart(4)});
    if(!L.length)L.push(u.padEnd(9)+'not logged in, last logout '+dt(new Date(P.now().getTime()-26*36e5)));
    say(L.concat(['',u===me()&&newMail()?'New mail received '+dt(new Date(P.st.login.getTime()-36e5*3)):'No new mail','']));
    return;
  }
  say([' User      Job Subsys    TTY'].concat(J.map(function(j){return ' '+j[3].padEnd(9)+String(j[0]).padStart(4)+' '+j[2].padEnd(8)+String(j[1]).padStart(5)})));
};
PROG.mail=PROG.rdmail=PROG.mm=function(){
  var M=P.profile.mail,gone=false,n=M.length?1:0,sent=new Date(P.st.login.getTime()-36e5*3),from=up(P.profile.owner);
  function head(){return (gone?' D':S.read?'  ':' N')+'  1) '+sent.getDate()+'-'+MON3[sent.getMonth()]+' '+from.padEnd(16)+'Welcome ('+M.join('\n').length+' chars)'}
  if(!n){P.typeLine(' No messages in '+dirName(P.st.home)+'MAIL.TXT.1')}
  else P.typeLine(head());
  function read(){
    if(!n||gone){P.typeLine(' No current message');return}
    S.read=true;
    say([' Message 1 -- '+M.join('\n').length+' chars','Date: '+dt(sent).replace(/:\d\d$/,''),'From: '+from,'To: '+me(),'Subject: Welcome','']);
    say(M);
  }
  (function loop(){
    P.ask('MM>',function(l){
      if(l===null||l===P.INT)return;
      var w=up(l.trim()).split(/\s+/)[0]||'';
      if(!w)return loop();
      if('EXIT'.indexOf(w)===0||'QUIT'.indexOf(w)===0)return;
      if(/\?$/.test(w)){say([' one of the following:',' DELETE   EXIT     HEADERS  HELP     NEXT     QUIT     READ     TYPE']);return loop()}
      if('HEADERS'.indexOf(w)===0&&w.length>1){if(n)P.typeLine(head());return loop()}
      if('READ'.indexOf(w)===0||'TYPE'.indexOf(w)===0||'NEXT'.indexOf(w)===0){read();return loop()}
      if('DELETE'.indexOf(w)===0){if(n)gone=true;return loop()}
      if('HELP'.indexOf(w)===0){P.typeLine(' HEADERS lists the messages, READ shows one, DELETE marks it, EXIT leaves.');return loop()}
      err('?Unrecognized command - "'+w+'"');loop();
    },true);
  })();
};

/* ---------- the terminal's own switches, which work here as everywhere ---------- */
var TERM={},WELCOME=[];
Phosphor.setup(function(Q){
  ['connect','fill','sound','effects','about','source'].forEach(function(k){if(P.has(P.cmds,k))TERM[k]=P.cmds[k]});
  ['FILL','SOUND','EFFECTS','SOURCE','ABOUT'].forEach(function(k){if(TERM[k.toLowerCase()])cmd(k,'','text',function(a){terminal(k.toLowerCase(),a)},{out:true,hide:true})});
  if(TERM.connect)P.cmds.connect=function(a,raw,w){go(BYNAME.CONNECT,a,raw)}; /* CONNECT <DIR> and connect bsd */
  S.last=new Date(Q.now().getTime()-(26*60+43)*6e4-17e3);WELCOME=Q.profile.welcome;Q.profile.welcome=jobLine(Q.now()).concat(WELCOME);
  Object.keys(HLP).forEach(function(k){Q.put('/help/'+k.toLowerCase()+'.hlp.1','f',{owner:'operator',date:Q.systemDate,body:HLP[k]})});
});
P.command({names:['help'],noHelpFlag:true,terminal:true,run:function(a,raw){go(BYNAME.HELP,a,raw)}});
P.command({names:['mail'],noHelpFlag:true,terminal:true,run:function(a,raw){parseLine(raw)}});

/* ---------- a line: the command, its guide words dropped, its fields; or a program in SYS: ---------- */
function go(c,a,raw){
  if(c.run){c.run(a,raw);return}
  if(/^(SET|TERMINAL|RECEIVE|REFUSE|REMARK|ENABLE|DISABLE|KMIC|BREAK|UNKEEP|RESET)$/.test(c.name))return; /* taken, and nothing to show for it */
  if(c.arg==='file'&&!a.length){err('?Missing file name');return}
  err('?'+(S.on?'GUEST':'This')+' account may not use the '+c.name+' command');
}
function parseLine(raw){
  var line=raw.replace(/\([^)]*\)/g,' ').trim(),q=/\?$/.test(line);
  if(q){ /* a ? typed where the key could not be caught: the list, after the fact */
    var r=P.recognize('?',line.slice(0,-1));
    if(r&&typeof r==='object'){P.typeLine(r.echo.slice(r.echo.indexOf('?')));say(r.list)}
    return;
  }
  var W=line.split(/\s+/),w0=W[0],a=W.slice(1);
  if(!w0||/^[!;]/.test(w0))return;
  var hit=lookup(w0.split('/')[0]);
  if(hit.c){go(hit.c,a,raw);return}
  if(hit.amb){err('?Ambiguous - "'+up(w0)+'"');return}
  if(S.on&&/^[a-z0-9<>\[\]:.$-]+$/i.test(w0)){
    var p=program(w0,'sys');
    if(p.e){runFile(p,a);return}
    if(/:/.test(w0)&&!P.has(LOGICAL,w0.split(':')[0].toLowerCase())){err('?Unrecognized command - No such device - "'+up(w0)+'"');return}
  }
  err('?Unrecognized command - Does not match switch or keyword - "'+up(w0)+'"');
}
P.fallback=function(word,raw){P.status(0);parseLine(raw);return true};
})(window.Phosphor);
