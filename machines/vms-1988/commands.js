/* PHOSPHOR-9 terminal: machine "vms-1988", the DIGITAL Command Language.
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE. */
(function(P){
'use strict';
var DEV='DUA0:';
function up(s){return String(s).toUpperCase()}
function say(L){P.say(L)}
function err(){[].forEach.call(arguments,function(s){P.typeLine(s,'err')});P.status(2)} /* a message, and any that follow it */
var FNF='-RMS-E-FNF, file not found',PRV='-RMS-E-PRV, insufficient privilege or file protection violation';
function abbr(w,name,min){return w.length>=min&&name.indexOf(w)===0} /* w is name, cut no shorter than min */
function dirName(abs){return abs==='/'?DEV+'[000000]':DEV+'['+up(abs.slice(1)).replace(/\//g,'.')+']'}
function stamp(d){return d.getDate()+'-'+['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][d.getMonth()]+'-'+d.getFullYear()+' '+P.p2(d.getHours())+':'+P.p2(d.getMinutes())}
/* a file spec: [DIR.SUB]NAME.TYP;VER, with a relative [.SUB] and DUA0: optional */
function parse(spec){
  var s=String(spec||'').toLowerCase().replace(/^[a-z0-9$]+:/,''),abs=P.st.cwd,m=s.match(/^\[([^\]]*)\]/);
  if(m){
    var d=m[1];
    s=s.slice(m[0].length);
    if(d.charAt(0)==='.')abs=(abs==='/'?'':abs)+'/'+d.slice(1).replace(/\./g,'/');
    else if(d.charAt(0)==='-'){
      while(d.charAt(0)==='-'){abs=P.dirOf(abs);d=d.slice(1)}
      if(d)abs=(abs==='/'?'':abs)+'/'+d.replace(/^\./,'').replace(/\./g,'/');
    }
    else if(d==='000000')abs='/';
    else if(d)abs='/'+d.replace(/\./g,'/');
  }
  var v=s.match(/;(\d*|\*)$/),ver=v?v[1]:null;
  if(v)s=s.slice(0,v.index);
  var dot=s.indexOf('.'),name=dot<0?s:s.slice(0,dot),typ=dot<0?'':s.slice(dot+1);
  return {abs:abs,name:name,typ:typ,ver:ver,dot:dot>=0};
}
function folder(abs){var n=P.find(abs,true);return n&&n.type==='d'?n:null}
function entries(dir){ /* every version of every file: {key,name,typ,ver,node} */
  return Object.keys(dir.kids).filter(function(k){return k.charAt(0)!=='.'&&!dir.kids[k].dev}).map(function(k){
    var n=dir.kids[k],m=k.match(/^(.*?)(?:;(\d+))?$/),b=m[1],dot=b.indexOf('.');
    return {key:k,name:dot<0?b:b.slice(0,dot),typ:n.type==='d'?'dir':dot<0?'':b.slice(dot+1),ver:m[2]?+m[2]:1,node:n};
  }).sort(function(a,b){
    return a.name<b.name?-1:a.name>b.name?1:a.typ<b.typ?-1:a.typ>b.typ?1:b.ver-a.ver;
  });
}
function wild(p){return new RegExp('^'+p.replace(/[.+?^${}()|\\\[\]]/g,'\\$&').replace(/\*/g,'.*').replace(/%/g,'.')+'$')}
function matches(S,dir,anyType){ /* with no type given, DIR means any type; the others mean none */
  var name=wild(S.name||'*'),typ=S.dot&&wild(S.typ);
  return entries(dir).filter(function(e){
    if(!name.test(e.name))return false;
    if(typ)return typ.test(e.typ);
    return anyType||!S.name||/[*%]/.test(S.name)||e.typ==='';
  });
}
function versions(L,S){ /* ;n one version, ;* or ; all of them, no version the newest */
  if(S.ver==='*'||S.ver==='')return L;
  if(S.ver===null)return latest(L);
  return L.filter(function(e){return e.ver===+S.ver});
}
function latest(L){ /* newest of each name */
  var seen={};
  return L.filter(function(e){var k=e.name+'.'+e.typ;if(seen[k])return false;seen[k]=true;return true});
}
function show(e){return up(e.name+'.'+e.typ+';'+e.ver)}
function pick(spec){ /* the one file a spec means */
  var S=parse(spec),dir=folder(S.abs);
  if(!dir)return {S:S};
  return {S:S,dir:dir,e:versions(matches(S,dir),S)[0]};
}
function from(T,e){ /* an output spec: what it leaves out, or gives as *, is the input file's */
  return Object.assign({},T,{name:!T.name||T.name==='*'?e.name:T.name,typ:!T.dot||T.typ==='*'?e.typ:T.typ,dot:true});
}
function gone(n){if(n.store)P.save(n.store,null)} /* a file that stands for a record in storage (EMPSAVE.DAT): the record goes too */
function fullSpec(S){return dirName(S.abs)+up(S.name+'.'+S.typ)+';'+(S.ver||'')}
function nextVersion(dir,S){
  var v=0;
  entries(dir).forEach(function(e){if(e.name===S.name&&e.typ===(S.typ||'')&&e.ver>v)v=e.ver});
  return v+1;
}
function writeNew(spec,lines){ /* a new version, never over the old one */
  var S=typeof spec==='string'?parse(spec):spec,dir=folder(S.abs);
  if(!dir){err('%RMS-F-DNF, directory not found');return false}
  if(!S.name){err('%RMS-F-FNM, error in file name');return false} /* no name: a file DIR could not show */
  var v=S.ver&&S.ver!=='*'?+S.ver:nextVersion(dir,S),path=(S.abs==='/'?'':S.abs)+'/'+S.name+'.'+S.typ+';'+v;
  if(!P.writeFile(path,lines,false)){err('%SYSTEM-F-NOPRIV, no privilege for attempted operation');return false}
  return v;
}

/* the verbs, and how short each may be */
var V={};
function verb(names,min,run){V[names]={min:min,run:run}}
function find(w){
  w=w.toLowerCase();
  var k=Object.keys(V).filter(function(n){return abbr(w,n,V[n].min)});
  return k.length?V[k[0]]:null;
}
function split(words){ /* words, with qualifiers apart: DIR/SIZE *.COM */
  var a=[],q=[];
  words.forEach(function(w){
    var parts=w.split('/');
    if(parts[0])a.push(parts[0]);
    parts.slice(1).forEach(function(x){if(x)q.push(x.toLowerCase())});
  });
  return {a:a,q:q};
}
function has(q,name){return q.some(function(x){return name.indexOf(x.split('=')[0])===0})}

verb('directory',3,function(a,q){
  var specs=a.length?a:['*.*;*'],any=false;
  specs.forEach(function(spec){
    var S=parse(spec),dir=folder(S.abs);
    if(!dir){err('%DIRECT-E-OPENIN, error opening '+fullSpec(S)+' as input','-RMS-E-DNF, directory not found');return}
    var L=matches(S,dir,true);
    L=S.ver===null&&a.length?L:versions(L,S.ver===null?{ver:'*'}:S);
    if(!L.length)return;
    any=true;
    var out=['','Directory '+dirName(S.abs),''],size=has(q,'size'),date=has(q,'date'),row=[],used=0;
    L.forEach(function(e){
      var blocks=Math.ceil(P.fsize(e.node)/512)||1,name=show(e);
      used+=blocks;
      if(size||date){
        out.push(name.padEnd(20)+(size?String(blocks).padStart(7)+'  ':'')+(date?stamp(e.node.date).padStart(17):''));
        return;
      }
      row.push(name.padEnd(19));
    });
    P.chunk(row,3).forEach(function(r){out.push(r.join(' ').trimEnd())});
    out.push('','Total of '+L.length+' file'+(L.length===1?'':'s')+(size?', '+used+' block'+(used===1?'':'s'):'')+'.');
    say(out);
  });
  if(!any&&specs.every(function(s){return folder(parse(s).abs)}))err('%DIRECT-W-NOFILES, no files found');
});
verb('type',2,function(a){
  if(!a.length){P.typeLine('_File: ');return}
  a.forEach(function(spec){
    var r=pick(spec);
    if(!r.e||r.e.node.type==='d'){err('%TYPE-W-SEARCHFAIL, error searching for '+fullSpec(r.S),FNF);return}
    if(r.e.node.prot){err('%TYPE-E-OPENIN, error opening '+fullSpec(r.S)+' as input',PRV);return}
    if(r.e.node.bin){err('%TYPE-W-READERR, error reading '+fullSpec(r.S),'-RMS-F-RTB, record too large for user\'s buffer');return}
    say(P.text(r.e.node));
  });
});
verb('copy',2,function(a){
  if(a.length<2){P.typeLine('_From: ');return}
  var r=pick(a[0]);
  if(!r.e){err('%COPY-E-SEARCHFAIL, error searching for '+fullSpec(r.S),FNF);return}
  if(r.e.node.prot){err('%COPY-E-OPENIN, error opening '+fullSpec(r.S)+' as input',PRV);return}
  writeNew(from(parse(a[1]),r.e),P.text(r.e.node));
});
verb('rename',3,function(a){
  if(a.length<2){P.typeLine('_From: ');return}
  var r=pick(a[0]);
  if(!r.e){err('%RENAME-E-SEARCHFAIL, error searching for '+fullSpec(r.S),FNF);return}
  var T=from(parse(a[1]),r.e),dir=folder(T.abs);
  if(!dir||r.e.node.prot||r.e.node.type==='d'||!P.canWrite(P.pathOf(r.e.node))||!P.canWrite(P.pathOf(dir).replace(/\/$/,'')+'/x')){err('%SYSTEM-F-NOPRIV, no privilege for attempted operation');return}
  var v=nextVersion(dir,T),k=T.name+'.'+T.typ+';'+v,n=r.e.node;
  delete r.dir.kids[r.e.key];
  n.name=k;n.parent=dir;dir.kids[k]=n;
});
verb('delete',3,function(a){
  if(!a.length){P.typeLine('_File: ');return}
  a.forEach(function(spec){
    var S=parse(spec);
    if(S.ver===null){err('%DELETE-E-DELVER, explicit version number or wild card required');return}
    var dir=folder(S.abs),L=dir?versions(matches(S,dir),S):[];
    if(!L.length){err('%DELETE-W-SEARCHFAIL, error searching for '+fullSpec(S),FNF);return}
    L.forEach(function(e){
      if(e.node.prot||e.node.type==='d'&&Object.keys(e.node.kids).length||!P.canWrite(P.pathOf(e.node))){
        err('%DELETE-W-FILNOTDEL, error deleting '+dirName(S.abs)+show(e),PRV);
        return;
      }
      gone(e.node);delete dir.kids[e.key];
    });
  });
});
verb('purge',2,function(a){ /* keep only the newest of each */
  var S=parse(a[0]||'*.*'),dir=folder(S.abs);
  if(!dir)return;
  var keep={},L=matches(S,dir);
  latest(L).forEach(function(e){keep[e.key]=true});
  L.forEach(function(e){if(!keep[e.key]&&e.node.type!=='d'&&!e.node.prot&&P.canWrite(P.pathOf(e.node))){gone(e.node);delete dir.kids[e.key]}});
});
verb('create',2,function(a,q){
  if(!a.length){P.typeLine('_File: ');return}
  if(has(q,'directory')){
    var S=parse(a[0]);
    if(!P.canWrite(S.abs)){err('%CREATE-E-DIRNOTCRE, '+dirName(S.abs)+' directory file not created','-SYSTEM-F-NOPRIV, no privilege for attempted operation');return}
    P.put(S.abs,'d',{owner:P.st.user,date:P.now()});
    return;
  }
  P.input([],function(L){writeNew(a[0],L)});
});
verb('edit',2,function(a){ /* EDT, in its line mode */
  if(!a.length){P.typeLine('_File: ');return}
  var r=pick(a[0]);
  if(r.e&&r.e.node.prot){P.typeLine('Input file could not be opened');err('%RMS-E-PRV, insufficient privilege or file protection violation');return}
  var B=r.e?P.text(r.e.node):[];
  if(!r.e)P.typeLine('Input file does not exist');
  P.typeLine('[EOB]');
  (function loop(){
    P.ask('*',function(line){
      if(line===null)return loop();
      var c=up(line.trim());
      if(c==='EXIT'||c==='EX'){writeNew(a[0],B);return}
      if(c==='QUIT'||c==='QUI')return;
      if(c==='T WHOLE'||c==='TYPE WHOLE'||c==='T W'){P.say(B.length?B:['[EOB]']);return loop()}
      if(c==='I'||c==='INSERT'){
        (function more(){
          P.ask('',function(l){if(l===null){P.typeLine('[EOB]');loop();return}B.push(l);more()});
        })();
        return;
      }
      if(c==='HELP'){P.typeLine('I to insert until ctrl-z. T WHOLE to type it all. EXIT to write. QUIT to leave.');return loop()}
      P.typeLine('Unrecognized command');
      loop();
    });
  })();
});
verb('set',3,function(a,q,raw){
  var w=(a[0]||'').toLowerCase().split('=')[0],val=(a[0]||'').indexOf('=')>0?a[0].slice(a[0].indexOf('=')+1):a[1]; /* SET PROMPT="$ ", SET DEF=[GAMES] */
  if(abbr(w,'default',3)){
    var S=parse(val||'[]'),dir=folder(S.abs);
    if(dir&&dir.prot){err('%DCL-E-INVDEF, cannot set default');return} /* with no such folder, VMS takes your word for it */
    P.st.cwd=S.abs;
    return;
  }
  if(abbr(w,'password',3)){P.typeLine('%SET-E-NOPASSWORD, your account does not allow it');return}
  if(abbr(w,'terminal',3)||abbr(w,'prompt',3)||abbr(w,'verify',0)||abbr(w,'noverify',0))return;
  err('%DCL-W-IVKEYW, unrecognized keyword - check validity and spelling',' \\'+up(a[0]||'')+'\\');
});
function now(){return P.now()}
function timeStr(d){return stamp(d)+':'+P.p2(d.getSeconds())}
function nodeName(){return up(P.st.hostname)}
verb('show',2,function(a){
  var w=(a[0]||'').toLowerCase(),S=P.st,me=up(S.user);
  function is(n,min){return abbr(w,n,min)}
  if(!w){P.typeLine('_What: ');return}
  if(is('time',2)||is('daytime',2)){P.typeLine('  '+timeStr(now()));return}
  if(is('default',3)){P.typeLine('  '+dirName(S.cwd));return}
  if(is('users',1)){
    say(['      VAX/VMS Interactive Users - Total = 2','','      '+timeStr(now()),'','    Username     Process Name      PID     Terminal',
      '    '+'OPERATOR'.padEnd(13)+'_TXA0:'.padEnd(13)+'20200127     TXA0:','    '+me.padEnd(13)+('_TXA2:').padEnd(13)+'20200134     TXA2:']);
    return;
  }
  if(is('system',2)){
    var T=now();
    say(['VAX/VMS V4.6  on node '+nodeName()+'  '+timeStr(T)+'   Uptime  12 04:17:08',
      '  Pid    Process Name    State  Pri      I/O       CPU       Page flts Ph.Mem',
      '20200081 SWAPPER         HIB     16        0   0 00:00:41.22        0      0',
      '20200105 ERRFMT          HIB      8     1873   0 00:00:07.14       82     71',
      '20200106 OPCOM           LEF      8      215   0 00:00:01.89      141    112',
      '20200107 JOB_CONTROL     HIB      9      690   0 00:00:03.67       96     88',
      '20200108 SYMBIONT_0001   HIB      4       42   0 00:00:00.51       65     44',
      '20200127 _TXA0:          LEF      4     3120   0 00:02:12.40     2714    301',
      '20200134 _TXA2:          CUR      4       31   0 00:00:01.02      402    187']);
    return;
  }
  if(is('process',1)){
    say(['',timeStr(now())+'   TXA2:          User: '+me,'Pid: 20200134   Proc. name: _TXA2:          UIC: [200,134]','Priority: 4   Default file spec: '+dirName(S.cwd)]);
    return;
  }
  if(is('memory',1)){say(['              System Memory Resources on '+timeStr(now()),'','Physical Memory Usage (pages):     Total        Free      In Use    Modified','  Main Memory (8.00Mb)             16384        9120        6912         352']);return}
  if(is('device',3)){say(['Device                  Device           Error    Volume         Free  Trans Mnt','Name                    Status           Count     Label        Blocks Count Cnt','DUA0:                   Mounted              0  VAXVMSRL4      41822   112   1']);return}
  if(is('quota',1)){P.typeLine('User ['+me+'] has 412 blocks used, 9588 available, of 10000 authorized');return}
  if(is('symbol',2)){err('%DCL-W-UNDSYM, undefined symbol - check validity and spelling');return}
  if(is('terminal',2)){say(['Terminal: _TXA2:      Device_Type: VT100        Owner: '+me,'','   Input:    9600      LFfill:  0      Width:  80      Parity: None','   Output:   9600      CRfill:  0      Page:   24']);return}
  err('%DCL-W-IVKEYW, unrecognized keyword - check validity and spelling',' \\'+up(a[0])+'\\');
});
verb('write',2,function(a,q,raw){
  var m=raw.match(/sys\$output\s+(.*)$/i);
  if(!m){err('%DCL-W-INSFPRM, missing command parameters - supply all required parameters');return}
  P.typeLine(m[1].replace(/^"(.*)"$/,'$1'));
});
verb('exit',3,function(){if(P.inScript())P.loop('exit')}); /* the end of a command procedure; at the prompt, nothing */
verb('logout',2,function(a,q){
  P.say(['  '+up(P.st.user)+'      logged out at '+timeStr(now())]);
  P.logout();
});
verb('run',2,function(a){
  if(!a[0]){(function again(){P.ask('_File: ',function(l){if(l===null||l===P.INT)return;if(!l.trim()){again();return}V.run.run([l.trim()],[],l.trim())},true)})();return} /* DCL asks for what it needs, until it gets it */
  if(/[*%]/.test(a[0])){err('%DCL-W-ACTIMAGE, error activating image '+up(a[0]),'-RMS-F-WLD, invalid wildcard operation');return}
  var spec=a[0]||'',r=pick(/\./.test(spec.replace(/^.*\]/,''))?spec:spec.replace(/(;\d*)?$/,'.exe$1')); /* MORIA;1 is MORIA.EXE;1 */
  if(spec&&r.S.name&&r.e&&r.S.abs==='/games'){
    var image=r.e.name.replace(/\..*$/,'');
    if(P.has(P.cmds,image)){P.cmds[image]([],image,[image]);return}
    err('%DCL-W-ACTIMAGE, error activating image '+dirName(r.S.abs)+up(r.e.name)+'.EXE;'+r.e.ver,'-SITE-F-PRIMESHIFT, games are disabled during prime shift - see your system manager');
    return;
  }
  err('%DCL-W-ACTIMAGE, error activating image '+fullSpec(r.S),FNF);
});

/* a command: a verb from the table, @file, or a question for the operator */
P.fallback=function(word,raw){
  var W=raw.trim().split(/\s+/);
  if(/^\$/.test(W[0])){W[0]=W[0].replace(/^\$+/,'');if(!W[0])W.shift()}
  if(!W.length||/^!/.test(W[0]))return true;
  if(W[0].charAt(0)==='@'){
    var r=pick(W[0].slice(1)+(W[0].indexOf('.')<0?'.com':''));
    if(!r.e||r.e.node.prot){err('%DCL-E-OPENIN, error opening '+fullSpec(r.S)+' as input',r.e?PRV:FNF);return true}
    P.runScript(P.text(r.e.node));
    return true;
  }
  var slash=W[0].indexOf('/'),name=slash>0?W[0].slice(0,slash):W[0],v=find(name);
  if(!v){
    err('%DCL-W-IVVERB, unrecognized command verb - check validity and spelling',' \\'+up(name)+'\\');
    return true;
  }
  var rest=W.slice(0);rest[0]=slash>0?W[0].slice(slash):'';
  var parts=split(rest.filter(Boolean));
  P.status(0);
  v.run(parts.a,parts.q,raw);
  return true;
};
/* real DCL HELP stands in for the terminal's: a list, and the topic you ask for */
var TOPICS={DIRECTORY:'Lists files. DIR *.COM, DIR/SIZE, DIR/DATE, DIR *.*;*.',TYPE:'Prints a file. TYPE README.TXT.',COPY:'COPY from to. Makes a new version of to.',DELETE:'DELETE FILE.TXT;1. The version number is required.',PURGE:'Deletes all but the newest version of each file.',RENAME:'RENAME old new.',CREATE:'CREATE name, then type it, then ctrl-z. CREATE/DIRECTORY [.NAME].',EDIT:'EDT, in its line mode. I to insert, ctrl-z to stop, T WHOLE, EXIT.',SET:'SET DEFAULT [.NAME] or [-] to move about.',SHOW:'SHOW TIME, USERS, SYSTEM, DEFAULT, PROCESS, MEMORY, DEVICE, QUOTA, TERMINAL.',RUN:'Runs a program. RUN [GAMES]STARTREK. DIR [GAMES] lists them.',LOGOUT:'Ends your session.',MAIL:'Reads your mail.',ABOUT:'Who owns this machine.',CONNECT:'Plugs the terminal into another machine.',SOUND:'Keyclicks on or off.',FILL:'A bigger screen, on or off.',EFFECTS:'Tube effects. EFFECTS AUTO, FULL or LITE.',SOURCE:'Where to get this terminal.'};
P.command({names:['help'],noHelpFlag:true,terminal:true,run:function(a,raw,w){
  var t=up(w[1]||'');
  function topic(q){
    var k=Object.keys(TOPICS).filter(function(x){return x.indexOf(q)===0})[0];
    P.say(k?['',k,'','  '+TOPICS[k]]:['','  Sorry, no documentation on '+q]);
  }
  if(t){topic(t);return}
  var names=Object.keys(TOPICS).filter(function(k){return k!=='CONNECT'||P.allowed.length>1}),L=['','  Information available:',''];
  P.chunk(names.map(function(n){return n.padEnd(12)}),5).forEach(function(r){L.push('  '+r.join(''))});
  L.push('');
  P.say(L);
  (function ask(){
    P.ask('Topic? ',function(l){
      if(!l||!l.trim())return;
      topic(up(l.trim()));
      ask();
    });
  })();
}});
})(window.Phosphor);
