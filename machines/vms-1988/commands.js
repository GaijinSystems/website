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
function verb(names,min,run,quals){V[names]={min:min,run:run,quals:quals||[]}} /* quals: VMS's qualifiers for the verb (any other is %DCL-W-IVQUAL; those not done here change nothing), or a function of its parameters that says */
function find(w){
  w=w.toLowerCase();
  var k=Object.keys(V).filter(function(n){return abbr(w,n,V[n].min)});
  return k.length?V[k[0]]:null;
}
function split(words){ /* words, with qualifiers apart: DIR/SIZE *.COM */
  var a=[],q=[];
  words.forEach(function(w){
    var p=w.split('/')[0];
    if(p)a.push(p);
    slashes(w).forEach(function(x){q.push(x.toLowerCase())});
  });
  return {a:a,q:q};
}
function slashes(w){return w.split('/').slice(1).filter(Boolean)} /* the qualifiers in a word, as typed */
function has(q,name){return q.some(function(x){var k=x.split('=')[0];return k&&name.indexOf(k)===0})}

function plural(n,w){return n+' '+w+(n===1?'':'s')}
verb('directory',3,function(a,q){
  /* a list, A.TXT,B.TXT: a spec with no directory takes the one before it (RMS's sticky default), and the files of
     specs in a row in one directory are listed under one heading, with a grand total when there is more than one */
  var specs=a.length?list(a):['*.*;*'],any=false,dirPart='',groups=[],size=has(q,'size'),date=has(q,'date');
  specs.forEach(function(spec){
    var m=spec.match(/^([a-z0-9$]+:)?\[[^\]]*\]/i);
    if(m)dirPart=m[0];else if(dirPart)spec=dirPart+spec.replace(/^[a-z0-9$]+:/i,'');
    var S=parse(spec),dir=folder(S.abs);
    if(!dir){err('%DIRECT-E-OPENIN, error opening '+fullSpec(S)+' as input','-RMS-E-DNF, directory not found');groups.push(null);return}
    var L=matches(S,dir,true);
    L=S.ver===null&&a.length?L:versions(L,S.ver===null?{ver:'*'}:S);
    if(!L.length)return;
    any=true;
    var g=groups[groups.length-1];
    if(g&&g.abs===S.abs)g.L=g.L.concat(L);else groups.push({abs:S.abs,L:L});
  });
  var dirs=0,files=0,blocksAll=0;
  groups.forEach(function(g){
    if(!g)return;
    var out=['','Directory '+dirName(g.abs),''],row=[],used=0;
    g.L.forEach(function(e){
      var blocks=Math.ceil(P.fsize(e.node)/512)||1,name=show(e);
      used+=blocks;
      if(size||date){
        out.push(name.padEnd(20)+(size?String(blocks).padStart(7)+'  ':'')+(date?stamp(e.node.date).padStart(17):''));
        return;
      }
      row.push(name.padEnd(19));
    });
    P.chunk(row,3).forEach(function(r){out.push(r.join(' ').trimEnd())});
    out.push('','Total of '+plural(g.L.length,'file')+(size?', '+plural(used,'block'):'')+'.');
    say(out);
    dirs++;files+=g.L.length;blocksAll+=used;
  });
  if(dirs>1)say(['','Grand total of '+dirs+' directories, '+plural(files,'file')+(size?', '+plural(blocksAll,'block'):'')+'.']);
  if(!any&&groups.indexOf(null)<0)err('%DIRECT-W-NOFILES, no files found');
},['size','date','acl','backup','before','by_owner','created','exclude','expired','modified','since','brief','columns','file_id','full','grand_total','heading','output','owner','printer','protection','security','select','total','trailing','versions','width']); /* each verb's list: the VMS 5.0 DCL Dictionary's */
verb('type',2,function(a,q,raw){
  if(!a.length){need(raw,'_File: ');return}
  list(a).forEach(function(spec){
    var r=pick(spec);
    if(!r.e||r.e.node.type==='d'){err('%TYPE-W-SEARCHFAIL, error searching for '+fullSpec(r.S),FNF);return}
    if(r.e.node.prot){err('%TYPE-E-OPENIN, error opening '+fullSpec(r.S)+' as input',PRV);return}
    if(r.e.node.bin){err('%TYPE-W-READERR, error reading '+fullSpec(r.S),'-RMS-F-RTB, record too large for user\'s buffer');return}
    say(P.text(r.e.node));
  });
},['backup','before','by_owner','confirm','created','exclude','expired','modified','since','output','page']);
verb('copy',2,function(a,q,raw){
  if(a.length<2){need(raw,a.length?'_To: ':'_From: ');return}
  var r=pick(a[0]);
  if(!r.e){err('%COPY-E-SEARCHFAIL, error searching for '+fullSpec(r.S),FNF);return}
  if(r.e.node.prot){err('%COPY-E-OPENIN, error opening '+fullSpec(r.S)+' as input',PRV);return}
  writeNew(from(parse(a[1]),r.e),P.text(r.e.node));
},['backup','before','by_owner','confirm','created','exclude','expired','modified','since','allocation','concatenate','contiguous','extension','log','overlay','protection','read_check','replace','truncate','volume','write_check']);
verb('rename',3,function(a,q,raw){
  if(a.length<2){need(raw,a.length?'_To: ':'_From: ');return}
  var r=pick(a[0]);
  if(!r.e){err('%RENAME-E-SEARCHFAIL, error searching for '+fullSpec(r.S),FNF);return}
  var T=from(parse(a[1]),r.e),dir=folder(T.abs);
  if(!dir||r.e.node.prot||r.e.node.type==='d'||!P.canWrite(P.pathOf(r.e.node))||!P.canWrite(P.pathOf(dir).replace(/\/$/,'')+'/x')){err('%SYSTEM-F-NOPRIV, no privilege for attempted operation');return}
  var v=nextVersion(dir,T),k=T.name+'.'+T.typ+';'+v,n=r.e.node;
  delete r.dir.kids[r.e.key];
  n.name=k;n.parent=dir;dir.kids[k]=n;
  delete n.store; /* no longer the EMPSAVE.DAT that stands for the saved game */
},['backup','before','by_owner','confirm','created','exclude','expired','modified','since','log','new_version']);
verb('delete',3,function(a,q,raw){
  if(has(q,'symbol')){ /* DELETE/SYMBOL [/LOCAL|/GLOBAL] name, or /ALL */
    var T=SYM[has(q,'global')?'global':'local'];
    if(has(q,'all')){Object.keys(T).forEach(function(k){delete T[k]});return}
    if(!a.length){need(raw,'_Symbol: ');return}
    if(!P.has(T,up(a[0]))){symErr(a[0]);return}
    delete T[up(a[0])];return;
  }
  if(has(q,'entry')||has(q,'key'))return; /* no queue entries and no key definitions here */
  if(!a.length){need(raw,'_File: ');return}
  list(a).forEach(function(spec){
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
},['backup','before','by_owner','confirm','created','exclude','expired','modified','since','erase','log','entry','symbol','key','all','global','local']);
verb('purge',2,function(a){ /* keep only the newest of each */
  var S=parse(a[0]||'*.*'),dir=folder(S.abs);
  if(!dir)return;
  var keep={},L=matches(S,dir);
  latest(L).forEach(function(e){keep[e.key]=true});
  L.forEach(function(e){if(!keep[e.key]&&e.node.type!=='d'&&!e.node.prot&&P.canWrite(P.pathOf(e.node))){gone(e.node);delete dir.kids[e.key]}});
},['backup','before','by_owner','confirm','created','exclude','expired','modified','since','erase','keep','log']);
verb('create',2,function(a,q,raw){
  if(!a.length){need(raw,'_File: ');return}
  if(has(q,'directory')){
    var S=parse(a[0]);
    if(!P.canWrite(S.abs)){err('%CREATE-E-DIRNOTCRE, '+dirName(S.abs)+' directory file not created','-SYSTEM-F-NOPRIV, no privilege for attempted operation');return}
    P.put(S.abs,'d',{owner:P.st.user,date:P.now()});
    return;
  }
  P.input([],function(L){writeNew(a[0],L)});
},['directory','log','owner_uic','protection','volume','version_limit']);
P.dirClash=function(abs){err('%CREATE-E-DIRNOTCRE, '+dirName(abs)+' directory file not created','-SYSTEM-W-DUPFILENAME, duplicate file name')}; /* at boot: a directory of the guest's that a file of the site's now has the name of */
verb('edit',2,function(a,q,raw){ /* EDT, in its line mode */
  if(!a.length){need(raw,'_File: ');return}
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
},['edt','tpu','command','journal','output','read_only','recover','create']);
function need(raw,ask){ /* a verb with a parameter left off: DCL asks for it, till it gets it, and runs the line with the answer
                            on it (COPY asks _From:, then _To:); a command procedure cannot be asked */
  if(P.inScript()){err('%DCL-W-INSFPRM, missing command parameters - supply all required parameters');return}
  var line=raw.trim().replace(/^\$\s*/,''),word=line.split(/[\s\/]/)[0];
  (function again(){P.ask(ask,function(l){if(l===null||l===P.INT)return;if(!l.trim()){again();return}P.fallback(word,line+' '+substitute(l.trim()))},true)})(); /* the answer is command input: its 'NAME's are put in (DCL Concepts, 7.3) */
}
function list(a){return a.join(',').split(',').filter(Boolean)} /* TYPE A.TXT,B.TXT: a parameter is a list */
verb('set',3,function(a,q,raw){
  if(!a.length){need(raw,'_What: ');return}
  var w=(a[0]||'').toLowerCase().split('=')[0],val=(a[0]||'').indexOf('=')>0?a[0].slice(a[0].indexOf('=')+1):a[1]; /* SET PROMPT="$ ", SET DEF=[GAMES] */
  if(abbr(w,'default',3)){
    var S=parse(val||'[]'),dir=folder(S.abs);
    if(dir&&dir.prot){err('%DCL-E-INVDEF, cannot set default');return} /* with no such folder, VMS takes your word for it */
    P.st.cwd=S.abs;
    return;
  }
  if(abbr(w,'password',3)){P.typeLine('%SET-E-NOPASSWORD, your account does not allow it');return}
  if(abbr(w,'prompt',3)){setPrompt(raw);return}
  if(abbr(w,'terminal',3)||abbr(w,'verify',2)||abbr(w,'noverify',4))return;
  err('%DCL-W-IVKEYW, unrecognized keyword - check validity and spelling',' \\'+up(a[0]||'')+'\\');
},function(a){var w=(a[0]||'').toLowerCase().split('=')[0];return abbr(w,'terminal',3)?null:abbr(w,'prompt',3)?['carriage_control']:abbr(w,'password',3)?['generate','secondary','system']:[]}); /* SET TERMINAL's own qualifiers are taken, and change nothing here */
/* SET PROMPT[=string]: in quotes as it is, else in capitals with the blanks round it gone; no more than 32 characters; with
   none, $ again (the VMS 5.0 DCL Dictionary, SET PROMPT). For this process only: LOGOUT puts the default back */
var PROMPT0=null; /* the prompts the site set, before the first SET PROMPT */
function promptBack(){if(PROMPT0){P.profile.prompt=PROMPT0[0];P.profile.rootPrompt=PROMPT0[1]}} /* the site's prompts again */
function setPrompt(raw){
  PROMPT0=PROMPT0||[P.profile.prompt,P.profile.rootPrompt];
  var m=raw.replace(/^\s*\$?\s*/,'').match(/^\S*?\s+[^=\s\/]*(?:\s*\/[^=\s\/"]*)*(?:\s*=\s*((?:"[^"]*"|[^\/"])*))?/),v=m&&m[1]?m[1].trim():'';
  if(!v){promptBack();return}
  v=v.replace(/"((?:[^"]|"")*)"|([^"]+)/g,function(x,q,t){return q!==undefined?q.replace(/""/g,'"'):up(t)}).slice(0,32);
  P.profile.prompt=P.profile.rootPrompt=v;
}
function now(){return P.now()}
function timeStr(d){return stamp(d)+':'+P.p2(d.getSeconds())}
function nodeName(){return up(P.st.hostname)}
/* SHOW's keywords: [name, shortest, its qualifiers, what it shows]. One table for both, so a word means the same keyword to each. SYMBOL and
   SYSTEM need three letters: SY is either, and ambiguous (%DCL-W-ABKEYW), as DCL says of any keyword cut shorter than its own shortest */
function showKey(w){
  if(!w)return null;
  var k=SHOWK.filter(function(x){return abbr(w,x[0],x[1])})[0];
  return k||(SHOWK.some(function(x){return x[0].indexOf(w)===0})?'ambiguous':'unknown');
}
var SHOWK=[
  ['time',2,[],function(){P.typeLine('  '+timeStr(now()))}],['daytime',2,[],function(){P.typeLine('  '+timeStr(now()))}],
  ['default',3,[],function(){P.typeLine('  '+dirName(P.st.cwd))}],
  ['users',1,['output'],function(me){
    say(['      VAX/VMS Interactive Users - Total = 2','','      '+timeStr(now()),'','    Username     Process Name      PID     Terminal',
      '    '+'OPERATOR'.padEnd(13)+'_TXA0:'.padEnd(13)+'20200127     TXA0:','    '+me.padEnd(13)+('_TXA2:').padEnd(13)+'20200134     TXA2:']);
  }],
  ['system',3,['batch','full','network','output','process','subprocess'],function(){
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
  }],
  ['process',1,['accounting','all','continuous','identification','memory','output','privileges','quotas','subprocesses'],function(me){
    say(['',timeStr(now())+'   TXA2:          User: '+me,'Pid: 20200134   Proc. name: _TXA2:          UIC: [200,134]','Priority: 4   Default file spec: '+dirName(P.st.cwd)]);
  }],
  ['memory',1,['all','files','full','output','physical_pages','pool','slots'],function(){say(['              System Memory Resources on '+timeStr(now()),'','Physical Memory Usage (pages):     Total        Free      In Use    Modified','  Main Memory (8.00Mb)             16384        9120        6912         352'])}],
  ['devices',3,['allocated','brief','files','full','mounted','output','system','windows'],function(){say(['Device                  Device           Error    Volume         Free  Trans Mnt','Name                    Status           Count     Label        Blocks Count Cnt','DUA0:                   Mounted              0  VAXVMSRL4      41822   112   1'])}],
  ['quota',1,['disk','user'],function(me){P.typeLine('User ['+me+'] has 412 blocks used, 9588 available, of 10000 authorized')}],
  ['symbol',3,['all','global','local','log'],function(me,a,q,raw){showSymbol(a[1],q,raw)}],
  ['terminal',2,['output','permanent'],function(me){say(['Terminal: _TXA2:      Device_Type: VT100        Owner: '+me,'','   Input:    9600      LFfill:  0      Width:  80      Parity: None','   Output:   9600      CRfill:  0      Page:   24'])}]];
verb('show',2,function(a,q,raw){
  var w=(a[0]||'').toLowerCase(),k=showKey(w);
  if(!w){need(raw,'_What: ');return}
  if(typeof k!=='string'){k[3](up(P.st.user),a,q,raw);return}
  if(k==='ambiguous')err('%DCL-W-ABKEYW, ambiguous qualifier or keyword - supply more characters',' \\'+up(a[0])+'\\');
  else err('%DCL-W-IVKEYW, unrecognized keyword - check validity and spelling',' \\'+up(a[0])+'\\');
},function(a){ /* each SHOW keyword's own; an unknown keyword is IVKEYW (or ABKEYW), not IVQUAL */
  var k=showKey((a[0]||'').toLowerCase());
  return k&&typeof k!=='string'?k[2]:null;
});
/* WRITE SYS$OUTPUT expression[,...]: each a string expression (strings, symbols, numbers, + and -, * and /), the values put
   together as one record (the VMS 5.0 DCL Dictionary, WRITE). Its qualifiers come before the expressions, so a / after
   them is division */
var WRITEQ=['symbol','error','update'];
verb('write',2,function(a,q,raw){
  var m=raw.trim().replace(/^\$\s*/,'').match(/^[^\s\/]*((?:\s*\/[^\s\/]*)*)\s+sys\$output((?:\s*\/[^\s\/]*)*)\s+(\S[\s\S]*)$/i);
  if(!m){err('%DCL-W-INSFPRM, missing command parameters - supply all required parameters');return}
  var badQ=(m[1]+m[2]).split('/').map(function(x){return x.trim().split('=')[0].toLowerCase()}).slice(1).filter(function(k){return !k||!WRITEQ.some(function(n){return n.indexOf(k)===0})})[0];
  if(badQ!==undefined){err('%DCL-W-IVQUAL, unrecognized qualifier - check validity, spelling, and placement',' \\'+up(badQ)+'\\');return}
  var o='',items=m[3].match(/(?:"(?:[^"]|"")*"?|[^",])+/g)||[]; /* an unclosed string runs to the end, for evaluate() to refuse */
  for(var i=0;i<items.length;i++){var v=evaluate(items[i]);if(v===undefined)return;o+=v}
  P.typeLine(o);
},function(){return null}); /* WRITEQ, checked above */
verb('exit',3,function(){if(P.inScript())P.loop('exit')}); /* the end of a command procedure; at the prompt, nothing */
verb('logout',2,function(a,q){
  P.say(['  '+up(P.st.user)+'      logged out at '+timeStr(now())]);
  SYM={local:{},global:{}}; /* the process's symbols go with it, and its prompt */
  promptBack();
  P.logout();
},['brief','full','hangup']);
verb('run',2,function(a){
  if(!a[0]){(function again(){P.ask('_File: ',function(l){if(l===null||l===P.INT)return;if(!l.trim()){again();return}l=substitute(l.trim());V.run.run([l],[],l)},true)})();return} /* DCL asks for what it needs, until it gets it; 'NAME's put in, as in need() */
  if(/[*%]/.test(a[0])){err('%DCL-W-ACTIMAGE, error activating image '+up(a[0]),'-RMS-F-WLD, invalid wildcard operation');return}
  var spec=a[0]||'',r=pick(/\./.test(spec.replace(/^.*\]/,''))?spec:spec.replace(/(;\d*)?$/,'.exe$1')); /* MORIA;1 is MORIA.EXE;1 */
  if(spec&&r.S.name&&r.e&&r.S.abs==='/games'){
    var image=r.e.name.replace(/\..*$/,'');
    if(P.has(P.cmds,image)){P.cmds[image]([],image,[image]);return}
    err('%DCL-W-ACTIMAGE, error activating image '+dirName(r.S.abs)+up(r.e.name)+'.EXE;'+r.e.ver,'-SITE-F-PRIMESHIFT, games are disabled during prime shift - see your system manager');
    return;
  }
  err('%DCL-W-ACTIMAGE, error activating image '+fullSpec(r.S),FNF);
},['debug','accounting','ast_limit','authorize','buffer_limit','delay','detached','dump','enqueue_limit','error','extent','file_limit','input','interval','io_buffered','io_direct','job_table_quota','mailbox','maximum_working_set','output','page_file','priority','privileges','process_name','queue_limit','resource_wait','schedule','service_failure','subprocess_limit','swapping','time_limit','uic','working_set']); /* RUN (Image)'s /DEBUG, and RUN (Process)'s, which start no process here */

/* symbols: NAME = expression and NAME := string define a local one, == and :== a global one; SHOW SYMBOL shows them.
   An expression here is integers, "strings" and symbols, with + - * / and parentheses */
var SYM={local:{},global:{}};
function symErr(name){err('%DCL-W-UNDSYM, undefined symbol - check validity and spelling',' \\'+up(name)+'\\')}
function lookupSym(name,which){
  var n=up(name);
  if(which!=='global'&&P.has(SYM.local,n))return {v:SYM.local[n],g:false};
  if(which!=='local'&&P.has(SYM.global,n))return {v:SYM.global[n],g:true};
  return null;
}
function num(v){ /* a string where a number is wanted: its digits, or true (T or Y) or false */
  if(typeof v==='number')return v;
  var t=v.trim();
  return /^[-+]?\d+$/.test(t)?parseInt(t,10)|0:/^[TY]/i.test(t)?1:0;
}
function evaluate(src){ /* the value, or undefined after saying why */
  var T=[],i=0,m,re=/\s*(?:(\d+)|"((?:[^"]|"")*)"|([A-Za-z_$][\w$]*)|([-+*\/()]))/y;
  src=src.replace(/^([^"!]*(?:"[^"]*"[^"!]*)*)!.*$/,'$1'); /* a comment, outside quotes */
  while(!/^\s*$/.test(src.slice(i))){
    re.lastIndex=i;m=re.exec(src);
    if(!m)return bad();
    T.push(m[1]!==undefined?{n:parseInt(m[1],10)|0}:m[2]!==undefined?{s:m[2].replace(/""/g,'"')}:m[3]!==undefined?{id:m[3]}:{op:m[4]});
    i=re.lastIndex;
  }
  function bad(){err('%DCL-W-EXPSYN, invalid expression syntax - check operators and operands');return undefined}
  var k=0,fail=false;
  function primary(){
    var t=T[k++];
    if(!t){fail=true;return 0}
    if(t.n!==undefined)return t.n;
    if(t.s!==undefined)return t.s;
    if(t.id!==undefined){var y=lookupSym(t.id);if(!y){if(!fail)symErr(t.id);fail='said';return 0}return y.v}
    if(t.op==='('){var v=sum();if(!T[k]||T[k++].op!==')')fail=fail||true;return v}
    if(t.op==='-')return -num(primary())|0;
    if(t.op==='+')return num(primary());
    fail=fail||true;return 0;
  }
  function product(){
    var v=primary();
    while(T[k]&&(T[k].op==='*'||T[k].op==='/')){
      var op=T[k++].op,w=num(primary());v=num(v);
      v=op==='*'?Math.imul(v,w):w===0?(v<0?-2147483648:2147483647):(v/w)|0; /* by zero: no message, the largest integer of
        the dividend's sign (WRITE SYS$OUTPUT 1/0 gives 2147483647, -1/0 -2147483648: comp.os.vms, "Symbol Substitution Mystery", 2008) */
    }
    return v;
  }
  function sum(){
    var v=product();
    while(T[k]&&(T[k].op==='+'||T[k].op==='-')){
      var op=T[k++].op,w=product();
      if(typeof v==='string'&&typeof w==='string')v=op==='+'?v+w:v.replace(w,'');
      else v=op==='+'?(num(v)+num(w))|0:(num(v)-num(w))|0;
    }
    return v;
  }
  if(!T.length)return '';
  var v=sum();
  if(fail==='said')return undefined;
  if(fail||k<T.length)return bad();
  return v;
}
function literal(src){ /* NAME := string: capitals and single blanks, but what is in quotes is kept as it is */
  var o='',q=false,gap=false; /* gap: a blank outside quotes, kept only between words */
  src=src.trim();
  for(var i=0;i<src.length;i++){
    var c=src.charAt(i);
    if(c==='"'){if(q&&src.charAt(i+1)==='"'){o+='"';i++;continue}if(gap&&o)o+=' ';gap=false;q=!q;continue}
    if(!q&&c==='!')break;
    if(!q&&/\s/.test(c)){gap=true;continue}
    if(gap&&o)o+=' ';gap=false;
    o+=q?c:c.toUpperCase();
  }
  return o;
}
function assign(raw){ /* true if raw defines a symbol */
  var m=raw.match(/^\$?\s*([A-Za-z_$][\w$]*)\s*(:==|:=|==|=)\s*([\s\S]*)$/);
  if(!m)return false;
  var v=m[2].charAt(0)===':'?literal(m[3]):evaluate(m[3]);
  if(v!==undefined)SYM[/==$/.test(m[2])?'global':'local'][up(m[1])]=v;
  return true;
}
/* 'NAME' in a command line is the symbol's value, before anything else is done with the line; inside quotes it is ''NAME'.
   An undefined symbol is the null string, and an integer its decimal digits. Outside quotes what is put in is looked at again,
   so its own 'NAME's are put in too; inside quotes it is not (OpenVMS User's Manual, 12.12-12.13: forced substitution) */
function substitute(s){
  var o='',q=false,n=0,m;
  for(var i=0;i<s.length;i++){
    var c=s.charAt(i);
    if(c==='"'){q=!q;o+=c;continue}
    if(c==="'"&&(m=(q?/^''([A-Za-z_$][\w$]*)'/:/^'([A-Za-z_$][\w$]*)'/).exec(s.slice(i)))){
      var y=lookupSym(m[1]),v=y?String(y.v):'';
      if(q){o+=v;i+=m[0].length-1;continue}
      if(++n>64){o+=s.slice(i);break} /* a symbol that names itself */
      s=v+s.slice(i+m[0].length);i=-1;continue;
    }
    o+=c;
  }
  return o;
}
var DONE='\uE0F5'; /* at the start of a line its 'NAME's have been put in: when it runs (queued) they are not put in again */
P.symbols=function(line){ /* the engine gives a line here first: MORIA :== RUN MORIA defines a symbol, though MORIA is a command. True: done; a string: the line to run */
  if(line.charAt(0)===DONE){line=line.slice(1);return assign(line.trim())||line}
  if(line.indexOf("'")>=0){
    var s=substitute(line);
    if(s!==line){P.exec(DONE+s);return true}
  }
  return assign(line.trim());
};
function symLine(name,y){
  var v=y.v,n=v>>>0;
  return '  '+up(name)+' '+(y.g?'==':'=')+' '+(typeof v==='number'?v+'   Hex = '+n.toString(16).toUpperCase().padStart(8,'0')+'  Octal = '+n.toString(8).padStart(11,'0'):'"'+v+'"'); /* a quote in it shown as it is: TEST = "this is a "test" string" (VMS 5.0 DCL Dictionary, :=) */
}
function showSymbol(name,q,raw){
  var which=has(q,'global')?'global':has(q,'local')?'local':null;
  if(has(q,'all')){var T=SYM[which||'local'];say(Object.keys(T).sort().map(function(k){return symLine(k,{v:T[k],g:which==='global'})}));return}
  if(!name){need(raw,'_Symbol: ');return}
  var y=lookupSym(name,which);
  if(!y){symErr(name);return}
  P.typeLine(symLine(name,y));
}
function quals(raw){ /* the qualifiers typed, what is in quotes left out */
  var q=[];
  raw.replace(/"(?:[^"]|"")*"/g,' ').trim().split(/\s+/).forEach(function(w){q=q.concat(slashes(w))});
  return q;
}
/* a command: a verb from the table, @file, or a question for the operator */
P.fallback=function(word,raw){
  raw=raw.replace(/^([^"!]*(?:"[^"]*"[^"!]*)*)!.*$/,'$1'); /* a comment, outside quotes: no parameter or qualifier */
  var W=raw.trim().split(/\s+/);
  if(/^\$/.test(W[0])){W[0]=W[0].replace(/^\$+/,'');if(!W[0])W.shift()}
  if(!W.length||/^!/.test(W[0]))return true;
  if(W[0].charAt(0)==='@'){
    var r=pick(W[0].slice(1)+(W[0].indexOf('.')<0?'.com':''));
    if(!r.e||r.e.node.prot){err('%DCL-E-OPENIN, error opening '+fullSpec(r.S)+' as input',r.e?PRV:FNF);return true}
    P.runScript(P.text(r.e.node));
    return true;
  }
  if(assign(raw.trim()))return true;
  var slash=W[0].indexOf('/'),name=slash>0?W[0].slice(0,slash):W[0],v=find(name);
  if(!v){
    err('%DCL-W-IVVERB, unrecognized command verb - check validity and spelling',' \\'+up(name)+'\\');
    return true;
  }
  var rest=W.slice(0);rest[0]=slash>0?W[0].slice(slash):'';
  var parts=split(rest.filter(Boolean)),ok=typeof v.quals==='function'?v.quals(parts.a):v.quals,badQ=ok&&quals(raw.trim().replace(/^\$\s*/,'')).filter(function(x){var k=x.split('=')[0].toLowerCase();return !k||!ok.some(function(n){return n.indexOf(k)===0||k.length>2&&k.slice(0,2)==='no'&&n.indexOf(k.slice(2))===0})})[0];
  if(badQ){err('%DCL-W-IVQUAL, unrecognized qualifier - check validity, spelling, and placement',' \\'+up(badQ.split('=')[0]||badQ)+'\\');return true} /* /=X: no name, which names no qualifier */
  parts.a=parts.a.join(' ').replace(/\s*([,+])\s*/g,'$1').split(' ').filter(Boolean); /* A.TXT, B.TXT is one parameter, a list */
  if(v.max!==undefined&&parts.a.length>v.max){err('%DCL-W-MAXPARM, too many parameters - reenter command with fewer parameters',' \\'+up(parts.a[v.max])+'\\');return true}
  P.status(0);
  v.run(parts.a,parts.q,raw);
  return true;
};
/* how many parameters each verb takes (the VMS 5.0 DCL Dictionary's formats); more is %DCL-W-MAXPARM */
[['directory',1],['type',1],['copy',2],['rename',2],['delete',1],['purge',1],['create',1],['edit',1],['run',1],['exit',1],['logout',0]].forEach(function(x){V[x[0]].max=x[1]});
/* real DCL HELP stands in for the terminal's: a list, and the topic you ask for */
var TOPICS={ /* each: its lines, as HELP prints them */
  DIRECTORY:['Lists files. DIR *.COM, DIR/SIZE, DIR/DATE, DIR *.*;*, DIR A.TXT,B.TXT.','','Format:','','  DIRECTORY [file-spec[,...]]','',
    '/DATE      Includes the creation date of each file.','/SIZE      Includes the size of each file, in blocks used.'],
  TYPE:['Prints a file. TYPE README.TXT, or a list: TYPE A.TXT,B.TXT.','','Format:','','  TYPE file-spec[,...]'],
  COPY:['COPY from to. Makes a new version of to.','','Format:','','  COPY input-file-spec output-file-spec'],
  DELETE:['DELETE FILE.TXT;1. The version number is required.','A wildcard may stand for the name, the type or the version: DELETE *.TMP;*.','','Format:','','  DELETE file-spec;version[,...]'],
  PURGE:['Deletes all but the newest version of each file.','With no file-spec, PURGE purges every file in the default directory.','','Format:','','  PURGE [file-spec]'],
  RENAME:['RENAME old new.','','Format:','','  RENAME input-file-spec output-file-spec'],
  CREATE:['CREATE name, then type it, then ctrl-z. CREATE/DIRECTORY [.NAME].','','Format:','','  CREATE file-spec','  CREATE/DIRECTORY directory-spec','',
    '/DIRECTORY Creates a new directory or subdirectory.'],
  EDIT:['EDT, in its line mode. I to insert, ctrl-z to stop, T WHOLE, EXIT.','QUIT leaves without writing the file. HELP lists these commands.','','Format:','','  EDIT file-spec'],
  SET:['SET DEFAULT [.NAME] or [-] to move about.','','Format:','','  SET option','',
    'DEFAULT    SET DEFAULT directory-spec','PASSWORD   Not allowed for this account.','PROMPT     SET PROMPT[=string]. In quotes for blanks or small letters;',
    '           with no string, the prompt is $ again.','TERMINAL, VERIFY and NOVERIFY are accepted, and change nothing here.'],
  SHOW:['SHOW TIME, USERS, SYSTEM, DEFAULT, PROCESS, MEMORY, DEVICE, QUOTA, TERMINAL.','SHOW DAYTIME is SHOW TIME. SHOW SYMBOL name displays a symbol: NAME = 1+2 and','NAME := text define one, == and :== a global one. SHOW SYMBOL/ALL lists them.',
    '\'NAME\' in a command puts in its value; inside quotes, \'\'NAME\'.','','Format:','','  SHOW option'],
  WRITE:['Writes a line to your terminal.','','Format:','','  WRITE SYS$OUTPUT text'],
  RUN:['Runs a program. RUN [GAMES]STARTREK. DIR [GAMES] lists them.','','Format:','','  RUN file-spec'],
  '@':['Executes a command procedure. The file type is .COM unless you give one.','','Format:','','  @file-spec'],
  LOGOUT:'Ends your session.',MAIL:'Reads your mail.',ABOUT:'Who owns this machine.',
  CONNECT:['Plugs the terminal into another machine.','With no name, lists the machines on the line.','','Format:','','  CONNECT [name]'],
  SOUND:'Keyclicks on or off.',FILL:'A bigger screen, on or off.',EFFECTS:'Tube effects. EFFECTS AUTO, FULL or LITE.',SOURCE:'Where to get this terminal.'};
P.command({names:['help'],noHelpFlag:true,terminal:true,run:function(a,raw,w){
  var t=up(w[1]||'');
  function topic(q){
    var k=Object.keys(TOPICS).filter(function(x){return x.indexOf(q)===0})[0];
    P.say(k?['',k,''].concat([].concat(TOPICS[k]).map(function(l){return l&&'  '+l})):['','  Sorry, no documentation on '+q]);
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
