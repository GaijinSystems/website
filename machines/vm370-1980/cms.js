/* PHOSPHOR-9 terminal: machine "vm370-1980", CMS, the Conversational Monitor System: the command line with its
   ready message, the disks it has accessed, and its commands for files, the spool and itself. CP commands typed
   to CMS go to CP; #CP sends a line to CP whatever is running.
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE.
   The messages are CMS's own, from the Release 6 manuals (GC20-1808, GC20-1818) and checked against VM/370
   Release 6 running under Hercules; the program is new. */
(function(P){
'use strict';
var V=P.vm=P.vm||{};
function up(s){return String(s).toUpperCase()}
function p2(n){return String(n).padStart(2,'0')}
function z(n,w){return String(n).padStart(w,'0')}
function out(s){V.em(s,'')}
function err(s){if(!(V.nomsg&&/^DMS...002E/.test(s)))V.em(s,'err')}

/* ---------- the session: IPL, the first line, the ready message ---------- */
V.cmsVersion='CMS VERSION 6.0 - 10/19/79 14.12'; /* the id given when the CMS nucleus was built, before installation */
V.ipl=function(){ /* CMS comes up: A and S accessed, the settings as they start, and the profile waits for the first line */
  V.state='cms';V.cpMode=false;V.cpReady=false;V.first=true;V.stack=[];
  V.acc={};V.syn={};V.synStd=true;
  V.opt={blip:false,rdymsg:'LMSG',impex:true,impcp:true,abbrev:true,protect:true};
  if(V.devs['191'])V.access('191','A',null,true);
  V.access('190','S',null,true);
  P.typeLine(V.cmsVersion);
};
V.reset=function(){V.halted()};
V.ending=function(){V.acc=null};
function cost(){var r=Math.random(),v=r<.85?.01:.02,t=v+(r<.7?0:.01);V.vcpu+=v*.4;V.tcpu+=t*.5;return [v,t]} /* most commands take a hundredth of a second, or less */
function rcs(rc){return rc<0?'-'+z(-rc,4):z(rc,5)} /* a return code as R(...) shows it */
V.rcs=rcs;
V.ready=function(rc){
  var c=cost(),n=P.now();
  if(V.opt.rdymsg==='SMSG'){P.typeLine(rc?'R('+rcs(rc)+');':'R;');return}
  P.typeLine((rc?'R('+rcs(rc)+'); ':'R; ')+'T='+c[0].toFixed(2)+'/'+c[1].toFixed(2)+' '+V.hms(n));
};

/* ---------- a typed line ---------- */
V.input=function(raw){
  V.level=0; /* a new line from the terminal: whatever an attention cut short is over */
  if(V.state!=='cms'||V.cpMode){var w0=up(raw.trim().split(/\s+/)[0]||'');if(w0&&V.termWord(w0,raw))return} /* the terminal's words, before CP sees them */
  if(V.state==='online'){V.online(raw);return}
  var t=raw.replace(/^\s+/,'');
  if(V.term.linend&&t.slice(0,3).toUpperCase()===V.term.linend+'CP'&&!/^\S/.test(t.slice(3,4))){ /* #CP: straight to CP, whatever is running */
    var rest=V.lineEdit(t.slice(3),true)[0].trim();
    P.queue(function(){
      if(!rest){V.cpMode=true;P.typeLine('CP');return}
      V.cp(rest,'cp');
    });
    return;
  }
  V.lineEdit(raw).forEach(function(l){P.queue(function(){logical(l)})});
};
function logical(l){
  if(V.state==='online'){V.online(l);return}
  if(V.state!=='cms'||V.cpMode){V.cp(l,'cp');return}
  cmsLine(l);
}
function cmsLine(l){
  V.rc=0;
  if(!l.trim()&&!V.first){P.typeLine('CMS');return} /* a null line: CMS says it is there */
  if(V.first){
    V.first=false;
    var W=V.words(l);
    if(!(/^ACC/.test(W[0]||'')&&W.indexOf('NOPROF')>0)&&V.find('PROFILE','EXEC','*'))P.queue(function(){V.exec(['PROFILE'],{profile:true})});
  }
  var quiet=false;
  if(l.trim())P.queue(function(){V.rc=V.command(l,{typed:true});if(V.rc===-3&&V.unknown)quiet=true;V.unknown=false});
  P.queue(function(){if(V.state==='cms'&&!V.cpMode&&!quiet)V.ready(V.rc)});
}

/* ---------- words: CMS reads a line as eight-character tokens, and ( starts the options ---------- */
V.words=function(l){
  return up(l).replace(/\(/g,' ( ').replace(/\)/g,' ').trim().split(/\s+/).filter(Boolean).map(function(w){return w.slice(0,8)});
};
function split(W){var i=W.indexOf('(');return i<0?{a:W.slice(1),o:[]}:{a:W.slice(1,i),o:W.slice(i+1)}}

/* ---------- commands ---------- */
var C={};
var SYN=[ /* the system synonym table: command, shortest form */
  ['ASSEMBLE','A'],['ACCESS','AC'],['AMSERV','AM'],['BASIC','BAS'],['COBOL','CO'],['COMPARE','COM'],['COPYFILE','COPY'],
  ['DIRMAINT','DIRM'],['DOSLKED','DOSL'],['EDIT','E'],['EXEC','EX'],['FETCH','FET'],['FILEDEF','FI'],['GENMOD','G'],['GLOBAL','GL'],
  ['INCLUDE','IN'],['LISTFILE','L'],['LOADMOD','LOADM'],['MACLIB','MAC'],['MODMAP','MOD'],['MOVEFILE','MOVE'],['OPTION','OP'],
  ['PLIOPT','PLIO'],['PRINT','PR'],['PUNCH','PU'],['QUERY','Q'],['RENAME','R'],['RELEASE','REL'],['READCARD','READ'],['SCRIPT','SC'],
  ['SVCTRACE','SVCT'],['SYNONYM','SYN'],['TYPE','T'],['TXTLIB','TXT'],['UPDATE','U'],['VSBASIC','VSB']];
var T=SYN.map(function(x){return [x[0],x[1].length]});
V.cmsName=function(w){ /* the command a word names: a user synonym, the name itself, or a truncation the table allows */
  if(!w)return null;
  if(V.opt.abbrev&&V.syn[w])return V.syn[w];
  if(C[w])return w;
  if(!V.opt.abbrev||!V.synStd)return null;
  return V.lookup(T,w);
};
V.command=function(l,ctx){ /* one CMS command line; its return code */
  var W=V.words(l),w=W[0]||'';
  if(!w)return 0;
  ctx=ctx||{};
  /* the terminal's own words, answered here as everywhere */
  if(V.termWord(w,l))return 0;
  /* an EXEC of that name, then CMS's own commands and the MODULEs on the disks, then CP */
  if(V.opt.impex&&w!=='EXEC'&&V.find(w,'EXEC','*'))return V.exec(W.concat([]),{line:l});
  var name=V.cmsName(w);
  if(name&&C[name]){var s=split(W);return C[name](s.a,s.o,l,W)||0}
  if(name&&V.find(name,'MODULE','*'))return V.module(name,split(W),l);
  if(V.find(w,'MODULE','*'))return V.module(w,split(W),l);
  if(V.opt.impcp){var rc=V.cp(l,'cms');if(rc!==null)return rc}
  P.typeLine('UNKNOWN '+(V.opt.impcp?'CP/CMS':'CMS')+' COMMAND','err'); /* without its code, whatever EMSG says */
  V.unknown=!!ctx.typed; /* at the terminal, no ready message follows */
  return -3;
};
C.CP=function(a,o,l){
  var rest=l.trim().replace(/^\S+\s*/,'');
  if(!rest){V.cpMode=true;V.cpReady=true;P.typeLine('CP');return 0}
  return V.cp(rest,'cmscp');
};

C.EXEC=function(a,o,l,W){return V.execCmd(W.slice(1))};
C.EDIT=function(a,o){return V.edit(a,o)};
C.HELP=function(a,o,l){return V.help(l)};

/* ---------- disks: ACCESS, RELEASE, and finding a file ---------- */
V.modes=function(){return Object.keys(V.acc).sort()}; /* the search order is the alphabet */
V.access=function(cuu,mode,ext,quiet){
  var d=V.devs[cuu],a=V.acc,was=a[mode];
  if(was&&!quiet)out('DMSACC724I \''+cuu+'\' REPLACES \' '+mode+' ('+was.cuu+') \'');
  var also=Object.keys(a).filter(function(m){return a[m].cuu===cuu&&m!==mode})[0];
  a[mode]={cuu:cuu,disk:d.disk,rw:d.rw==='R/W'&&!ext,ext:ext||null};
  if(quiet)return;
  if(!a[mode].rw)out('DMSACC723I '+mode+' ('+cuu+') R/O');
  if(also)out('DMSACC725I '+cuu+' ALSO = '+also+'-DISK');
};
V.release=function(cuu){Object.keys(V.acc).forEach(function(m){if(V.acc[m].cuu===cuu)delete V.acc[m]})};
V.search=function(fm){ /* the modes to look on: one disk and its extensions, or all of them */
  var M=V.modes();
  if(!fm||fm==='*')return fm==='*'?M:['A'].concat(M.filter(function(m){return V.acc[m].ext==='A'}));
  var L=fm.charAt(0);
  return M.filter(function(m){return m===L||V.acc[m].ext===L});
};
V.find=function(fn,ft,fm){ /* {f,mode} for the first match, or null */
  var M=V.search(fm);
  for(var i=0;i<M.length;i++){
    var A=V.acc[M[i]];if(!A)continue;
    var f=A.disk.get(fn,ft);
    if(f)return {f:f,mode:M[i],disk:A.disk,acc:A};
  }
  return null;
};
function pat(p){return p==='*'?/^/:new RegExp('^'+up(p).replace(/[.+?^${}()|\\\[\]]/g,'\\$&').replace(/\*/g,'.*')+'$')}
V.matches=function(fn,ft,fm){ /* every file fn ft fm names, wildcards and all, in search order */
  var M=V.search(fm||'A'),R=[],F=pat(fn||'*'),G=pat(ft||'*'),n=fm&&fm.length>1?fm.charAt(1):null;
  M.forEach(function(m){
    var A=V.acc[m];
    A.disk.list().sort(function(x,y){return x.order-y.order}).forEach(function(f){
      if(F.test(f.fn)&&G.test(f.ft)&&(!n||f.fm===n))R.push({f:f,mode:m,disk:A.disk,acc:A});
    });
  });
  return R;
};
function part(t){return /\*/.test(t)&&t!=='*'} /* TE* : only LISTFILE takes part of a name */
function badMode(m){return !/^[A-Z][0-6]?$/.test(m)}
function rw(mod,m){ /* a disk that may be written: the message and false if not */
  var A=V.acc[m.charAt(0)];
  if(!A){err('DMS'+mod+'069E DISK \''+m.charAt(0)+'\' NOT ACCESSED');return false}
  if(!A.rw){err('DMS'+mod+'037E DISK \''+m.charAt(0)+'\' IS READ/ONLY');return false}
  return true;
}
function fid(f,m){return f.fn+' '+f.ft+' '+m+f.fm}
V.fid=fid;
V.write=function(mod,mode,f){ /* put a file on an accessed disk: false, said, when it will not fit */
  var A=V.acc[mode];
  if(A.disk.put(f))return true;
  err('DMS'+mod+'105S ERROR \'13\' WRITING FILE \''+f.fn+' '+f.ft+' '+mode+f.fm+'\' ON DISK');
  err((P.profile.diskFull||'DMSBWR107S DISK \'A(191)\' IS FULL').replace(/'A\(191\)'/,'\''+mode+'('+A.cuu+')\'')); /* the disk full: setting */
  return false;
};

C.ACCESS=function(a,o){
  var cuu=a[0]||'191',m=a[0]?(a[1]||''):'A';
  if(!/^[0-9A-F]{1,3}$/.test(cuu)){err('DMSACC017E INVALID DEVICE ADDRESS \''+cuu+'\'');return 24}
  cuu=z(cuu,3);
  var mm=m.match(/^([A-Z])(?:\/([A-Z]))?$/);
  if(!mm){err('DMSACC048E INVALID MODE \' '+m+(m?' ':'')+'\'');return 24}
  var d=V.devs[cuu];
  if(mm[2]){var ra=Object.keys(V.acc).filter(function(k){return V.acc[k].cuu===cuu&&V.acc[k].rw})[0];if(ra&&d&&d.rw==='R/W'){err('DMSACC059E \''+cuu+'\' ALREADY ACCESSED AS READ/WRITE \' '+ra+'\' DISK');return 36}}
  if(!d||d.kind!=='DASD'){
    if(V.acc[mm[1]]){out('DMSACC724I \''+cuu+'\' REPLACES \' '+mm[1]+' ('+V.acc[mm[1]].cuu+') \'');delete V.acc[mm[1]]}
    err('DMSACC113S \''+mm[1]+' ('+cuu+') \' NOT ATTACHED');return 100;
  }
  if(d.disk.unformatted){err('DMSACC112S DISK \''+mm[1]+' ('+cuu+')\' DEVICE ERROR');return 100}
  if(mm[2]&&!V.acc[mm[2]]){err('DMSACC069E DISK \''+mm[2]+'\' NOT ACCESSED');return 36}
  V.access(cuu,mm[1],mm[2]);
  return 0;
};
C.RELEASE=function(a,o){
  var w=a[0];
  if(!w){err('DMSARE028E NO DEVICE SPECIFIED');return 24}
  var m=/^[A-Z]$/.test(w)?w:null,cuu=m?null:/^[0-9A-F]{1,3}$/.test(w)?z(w,3):null;
  if(!m&&!cuu){err('DMSARE017E INVALID DEVICE ADDRESS \''+w+'\'');return 24}
  var hit=Object.keys(V.acc).filter(function(k){return m?k===m:V.acc[k].cuu===cuu});
  if(!hit.length){if(m)err('DMSARE069E DISK \''+w+'\' NOT ACCESSED');return 36}
  hit.forEach(function(k){
    var c=V.acc[k].cuu;
    Object.keys(V.acc).forEach(function(e){if(V.acc[e]&&V.acc[e].ext===k)V.acc[e].ext=null});
    delete V.acc[k];
    if(o[0]==='DET'||o[0]==='DETACH'){V.cp('DETACH '+c,'cmscp')}
  });
  return 0;
};

/* ---------- LISTFILE ---------- */
var LOPT=[['HEADER',1],['NOHEADER',3],['EXEC',1],['APPEND',2],['FNAME',2],['FTYPE',2],['FMODE',2],['FORMAT',2],['ALLOC',2],['DATE',1],['LABEL',1]];
var LHEAD=['FILENAME','FILENAME FILETYPE','FILENAME FILETYPE FM','FILENAME FILETYPE FM  FORMAT','FILENAME FILETYPE FM  FORMAT    RECS BLOCKS',
  'FILENAME FILETYPE FM  FORMAT    RECS BLOCKS     DATE    TIME','FILENAME FILETYPE FM  FORMAT    RECS BLOCKS     DATE    TIME   LABEL'];
C.LISTFILE=function(a,o){
  var fn=a[0]||'*',ft=a[1]||'*',fm=a[2]||'A',opt={},lvl=5;
  if(a.length>3){err('DMSLST070E INVALID PARAMETER \''+a[3]+'\'');return 24}
  if(fm!=='*'&&badMode(fm)){err('DMSLST048E INVALID MODE \''+fm+'\'');return 24}
  if(fm!=='*'&&!V.acc[fm.charAt(0)]){err('DMSLST069E DISK \''+fm.charAt(0)+'\' NOT ACCESSED');return 36}
  for(var i=0;i<o.length;i++){var k=V.lookup(LOPT,o[i]);if(!k){err('DMSLST003E INVALID OPTION \''+o[i]+'\'');return 24}opt[k]=true}
  var pri={FNAME:7,FTYPE:6,FMODE:5,FORMAT:4,ALLOC:3,DATE:2,LABEL:1},given=Object.keys(pri).filter(function(k){return opt[k]});
  if(given.length)lvl=Math.min.apply(null,given.map(function(k){return pri[k]})); /* the most detailed asked for; FMODE when none is */
  var R=V.matches(fn,ft,fm);
  if(!R.length){err('DMSLST002E FILE NOT FOUND');return 28}
  var head=(lvl<=4||opt.HEADER)&&!opt.NOHEADER;
  function row(r){
    var f=r.f,s=f.fn.padEnd(8);
    if(lvl<=6)s+=' '+f.ft.padEnd(8);
    if(lvl<=5)s+=' '+r.mode+f.fm;
    if(lvl<=4)s+='  '+f.recfm+' '+String(f.recfm==='F'||f.bin?f.lrecl:V.lrecl(f.lines)).padStart(5);
    if(lvl<=3)s+=' '+String(f.bin?f.bin*12:f.lines.length).padStart(6)+' '+String(r.disk.blocks(f)).padStart(6);
    if(lvl<=2)s+='  '+V.mdy(f.date)+'   '+String(f.date.getHours()).padStart(2)+':'+p2(f.date.getMinutes());
    if(lvl<=1)s+='  '+r.disk.label;
    return lvl===7?s.trimEnd():s;
  }
  if(opt.EXEC||opt.APPEND){
    if(!rw('LST','A'))return 36;
    var lines=R.map(function(r){return ' &1 &2 '+row(r)}),old=V.acc.A.disk.get('CMS','EXEC');
    if(opt.APPEND&&old)lines=old.lines.concat(lines);
    if(!V.write('LST','A',V.file('CMS','EXEC',lines,{recfm:'F',lrecl:80})))return 100;
    return 0;
  }
  if(head)out(LHEAD[7-lvl]);
  P.say(R.map(row));
  return 0;
};

/* ---------- TYPE ---------- */
C.TYPE=function(a,o){
  if(a.length<2){err('DMSTYP054E INCOMPLETE FILEID SPECIFIED');return 24}
  var fn=a[0],ft=a[1],fm=a[2]||'',from=a[3],to=a[4],hex=false,col=null;
  if(fn==='*'||ft==='*'){err('DMSTYP062E INVALID * IN FILEID');return 20}
  for(var i=0;i<o.length;i++){
    if(o[i]==='HEX')hex=true;
    else if(o[i]==='COL'){var c=(o[++i]||'').match(/^(\d+)(?:-(\d+))?$/);if(!c){err('DMSTYP005E NO \'COL\' SPECIFIED');return 24}col=[+c[1],c[2]?+c[2]:255]}
    else{err('DMSTYP003E INVALID OPTION \''+o[i]+'\'');return 24}
  }
  if(fm&&fm!=='*'&&badMode(fm)){err('DMSTYP048E INVALID MODE \''+fm+'\'');return 24}
  var r=V.find(fn,ft,fm||null);
  if(!r){err('DMSTYP002E FILE \''+fn+' '+ft+' '+(fm||'A')+'\' NOT FOUND');return 28}
  if(r.f.prot&&!V.privileged()){err('DMSTYP104S ERROR \'3\' READING FILE \''+fid(r.f,r.mode)+'\' FROM DISK');return 100}
  var L=V.records(r.f),n1=1,n2=L.length;
  if(from&&from!=='*'){if(!/^\d+$/.test(from)){err('DMSTYP049E INVALID LINE NUMBER \''+from+'\'');return 24}n1=+from}
  if(to&&to!=='*'){if(!/^\d+$/.test(to)){err('DMSTYP049E INVALID LINE NUMBER \''+to+'\'');return 24}n2=Math.min(+to,L.length)}
  if(n1>L.length){err('DMSTYP049E INVALID LINE NUMBER \''+from+'\'');return 24}
  var S=L.slice(n1-1,n2);
  if(col)S=S.map(function(l){var x=P.lineOf(l);return [String(x[0]).slice(col[0]-1,col[1]),x[1]||'',x[2]]});
  if(hex){var k=n1;S.forEach(function(l){var t=V.text(l),h=V.hex(t);out(' RECORD '+String(k++).padStart(5)+' LENGTH='+String(t.length).padStart(6));for(var i=0;i<h.length;i+=10)out(' '+h.slice(i,i+10).join('  '))});return 0}
  if(r.f.ft==='LISTING')S=S.map(function(l){return V.text(l).slice(1)});
  P.say(S.map(function(l){return Array.isArray(l)?[String(l[0]).slice(0,130),l[1]||'',l[2]]:String(l).slice(0,130)}));
  return 0;
};
V.records=function(f){ /* what a file holds, as lines; a module is not text */
  if(f.bin){var L=[],s=f.fn.length*7+f.ft.length;for(var i=0;i<Math.min(f.bin,8);i++){var t='';for(var j=0;j<40;j++){s=(s*1103515245+12345)%2147483648;t+='.?<(+|&!$*);-/,%_>:#@\'="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789   '.charAt(s%74)}L.push(t)}return L}
  return f.lines;
};
V.hex=function(t){
  var E={' ':'40','.':'4B','<':'4C','(':'4D','+':'4E','|':'4F','&':'50','!':'5A','$':'5B','*':'5C',')':'5D',';':'5E','-':'60','/':'61',',':'6B','%':'6C','_':'6D','>':'6E','?':'6F',':':'7A','#':'7B','@':'7C',"'":'7D','=':'7E','"':'7F'};
  function e(c){
    if(E[c])return E[c];
    var u=c.toUpperCase(),k=u.charCodeAt(0),lo=c!==u;
    if(k>=65&&k<=73)return (lo?'8':'C')+(k-64);
    if(k>=74&&k<=82)return (lo?'9':'D')+(k-73);
    if(k>=83&&k<=90)return (lo?'A':'E')+(k-81);
    if(k>=48&&k<=57)return 'F'+(k-48);
    return '6F';
  }
  var w=[];for(var i=0;i<t.length;i+=4)w.push(t.slice(i,i+4).split('').map(e).join('')); /* words of four bytes */
  return w;
};

/* ---------- ERASE, RENAME, COPYFILE, STATE ---------- */
C.ERASE=function(a,o){
  if(a.length<2){err('DMSERS054E INCOMPLETE FILEID SPECIFIED');return 24}
  var fm=a[2]||'A1',list=o.indexOf('TYPE')>=0;
  if(fm!=='*'&&badMode(fm)){err('DMSERS048E INVALID MODE \''+fm+'\'');return 24}
  if(fm!=='*'&&!V.acc[fm.charAt(0)]){err('DMSERS069E DISK \''+fm.charAt(0)+'\' NOT ACCESSED');return 36}
  if(part(a[0])||part(a[1])){err('DMSSTT062E INVALID \'*\' IN FILEID \''+a[0]+' '+a[1]+'\'');return 20}
  var R=V.matches(a[0],a[1],fm==='*'?'*':fm.length>1&&fm.charAt(1)==='1'&&!a[2]?fm.charAt(0):fm);
  R=R.filter(function(r){return fm==='*'||r.mode===fm.charAt(0)});
  if(!R.length){err('DMSERS002E FILE \''+a[0]+' '+a[1]+' '+(a[2]||'A')+'\' NOT FOUND');return 28}
  var ro=R.filter(function(r){return !r.acc.rw})[0];
  if(ro){err('DMSERS037E DISK \''+ro.mode+'\' IS READ/ONLY');return 36}
  R.forEach(function(r){if(list)out(fid(r.f,r.mode));r.disk.remove(r.f.fn,r.f.ft)});
  return 0;
};
C.RENAME=function(a,o){
  if(a.length<6){err('DMSRNM054E INCOMPLETE FILEID SPECIFIED');return 24}
  var s=a.slice(0,3),t=a.slice(3,6).map(function(x,i){return x==='='?s[i]:x});
  if(s.some(function(x){return x==='*'})){err('DMSRNM062E INVALID * IN FILEID');return 20}
  if(badMode(s[2])||badMode(t[2])){err('DMSRNM048E INVALID MODE \''+(badMode(s[2])?s[2]:t[2])+'\'');return 24}
  if(s.join(' ')===t.join(' ')){err('DMSRNM019E IDENTICAL FILEIDS');return 24}
  if(!V.okName(t[0])||!V.okName(t[1])){err('DMSRNM062E INVALID CHAR IN FILEID');return 20}
  if(!V.acc[s[2].charAt(0)]){err('DMSRNM069E DISK \''+s[2].charAt(0)+'\' NOT ACCESSED');return 36}
  var r=V.find(s[0],s[1],s[2].charAt(0));
  r=r&&r.mode===s[2].charAt(0)?r:null;
  if(!r){err('DMSRNM002E FILE \''+s.join(' ')+'\' NOT FOUND');return 28}
  if(t[2].charAt(0)!==s[2].charAt(0)){err('DMSRNM048E INVALID MODE \''+t[2]+'\'');return 24}
  if(!r.acc.rw){err('DMSRNM037E DISK \''+r.mode+'\' IS READ/ONLY');return 36}
  if(r.disk.get(t[0],t[1])&&(t[0]!==r.f.fn||t[1]!==r.f.ft)){err('DMSRNM024E FILE \''+t[0]+' '+t[1]+' '+t[2]+'\' ALREADY EXISTS');return 28}
  r.disk.rename(r.f,t[0],t[1],t[2].charAt(1)||r.f.fm);
  return 0;
};
var COPT=[['REPLACE',3],['APPEND',3],['NEWFILE',3],['TYPE',3],['NOTYPE',3],['NEWDATE',4],['OLDDATE',3],['UPCASE',2],['LOWCASE',3],['RECFM',3],['LRECL',3],['PROMPT',3],['NOPROMPT',5]];
C.COPYFILE=function(a,o){
  if(!a.length){err('DMSCPY042E NO FILEID(S) SPECIFIED');return 24}
  var opt={},i;
  for(i=0;i<o.length;i++){
    var k=V.lookup(COPT,o[i]);
    if(!k){err('DMSCPY003E INVALID OPTION \''+o[i]+'\'');return 24}
    if(k==='RECFM'){var r=o[++i];if(r!=='F'&&r!=='V'){err('DMSCPY029E INVALID PARAMETER \''+(r||'')+'\' IN THE OPTION \'RECFM\' FIELD');return 24}opt.RECFM=r;continue}
    if(k==='LRECL'){var n=+o[++i];if(!(n>=1&&n<=255)){err('DMSCPY029E INVALID PARAMETER \''+(o[i]||'')+'\' IN THE OPTION \'LRECL\' FIELD');return 24}opt.LRECL=n;continue}
    opt[k]=true;
  }
  if(opt.REPLACE&&opt.APPEND){err('DMSCPY066E \'REPLACE\' AND \'APPEND\' ARE CONFLICTING OPTIONS');return 24}
  if(a.length<2){err('DMSCPY054E INCOMPLETE FILEID SPECIFIED');return 24}
  var s=[a[0],a[1],a[2]||'A'],t=a.length>3?[a[3]||'=',a[4]||'=',a[5]||'='].map(function(x,j){return x==='='?s[j]:x}):null;
  if(!t){ /* the same file, changed in place by its options */
    if(!(opt.RECFM||opt.LRECL||opt.UPCASE||opt.LOWCASE))return 0;
    t=s.slice();opt.REPLACE=true;
  }
  if(badMode(s[2])&&s[2]!=='*'){err('DMSCPY048E INVALID MODE \''+s[2]+'\'');return 24}
  if(badMode(t[2])){err('DMSCPY048E INVALID MODE \''+t[2]+'\'');return 24}
  var R=V.matches(s[0],s[1],s[2]);
  if(!R.length){err('DMSCPY002E INPUT FILE \''+s[0]+' '+s[1]+' '+s[2]+'\' NOT FOUND');return 28}
  if(!rw('CPY',t[2]))return 36;
  var many=/\*/.test(s[0]+s[1]),rc=0;
  for(i=0;i<R.length;i++){
    var f=R[i].f;
    if(f.prot&&!V.privileged()){err('DMSCPY104S ERROR \'3\' READING FILE \''+fid(f,R[i].mode)+'\' FROM DISK');return 100}
    var nf=t[0]==='='||t[0]==='*'?f.fn:t[0],nt=t[1]==='='||t[1]==='*'?f.ft:t[1],tm=t[2].charAt(0),tn=t[2].charAt(1)||f.fm;
    if(!V.okName(nf)||!V.okName(nt)){err('DMSCPY062E INVALID CHAR \'*\' IN FILEID');return 20}
    var D=V.acc[tm].disk,ex=D.get(nf,nt),same=ex===f;
    if(ex&&(opt.NEWFILE||!opt.REPLACE&&!opt.APPEND&&!same)){err('DMSCPY024E FILE \''+nf+' '+nt+' '+tm+tn+'\' ALREADY EXISTS -- SPECIFY \'REPLACE\'');return 28}
    var lines=f.lines.map(function(l){var x=V.text(l);return opt.UPCASE?x.toUpperCase():opt.LOWCASE?x.toLowerCase():x});
    if(Array.isArray(f.lines[0])&&!opt.UPCASE&&!opt.LOWCASE)lines=f.lines.slice();
    var recfm=opt.RECFM||(opt.APPEND&&ex?ex.recfm:f.recfm),lrecl=opt.LRECL||(opt.APPEND&&ex?ex.lrecl:f.lrecl);
    if(recfm==='F')lines=lines.map(function(l){return Array.isArray(l)?l:String(l).slice(0,lrecl)});
    if(opt.APPEND&&ex)lines=ex.lines.concat(lines);
    if(opt.TYPE||many&&!opt.NOTYPE&&!/\*/.test(t[0]+t[1]))out('DMSCPY721I COPY \''+fid(f,R[i].mode)+'\' '+(opt.APPEND&&ex?'APPEND':'TO')+' \''+nf+' '+nt+' '+tm+tn+'\' ('+(ex?'OLD':'NEW')+' FILE)');
    var g=V.file(nf,nt,lines,{fm:tn,recfm:recfm,lrecl:recfm==='F'?lrecl:0,date:opt.OLDDATE?f.date:P.now()});
    if(!V.write('CPY',tm,g)){rc=100;break}
  }
  return rc;
};
C.STATE=function(a){
  if(a.length<2){err('DMSSTT054E INCOMPLETE FILEID SPECIFIED');return 24}
  var fm=a[2]||'*';
  if(fm!=='*'&&badMode(fm)){err('DMSSTT048E INVALID MODE \''+fm+'\'');return 24}
  if(fm!=='*'&&!V.acc[fm.charAt(0)]){err('DMSSTT069E DISK \''+fm.charAt(0)+'\' NOT ACCESSED');return 36}
  if(part(a[0])||part(a[1])){err('DMSSTT062E INVALID \'*\' IN FILEID \''+a[0]+' '+a[1]+'\'');return 20}
  var R=V.matches(a[0],a[1],fm);
  if(!R.length){err('DMSSTT002E FILE \''+a.slice(0,3).join(' ')+'\' NOT FOUND');return 28}
  return 0;
};

/* ---------- the spool from CMS: PRINT, PUNCH, READCARD ---------- */
function spoolOut(mod,dev,a,o){
  if(a.length<2){err('DMS'+mod+'054E INCOMPLETE FILEID SPECIFIED');return 24}
  var hdr=dev==='00D'&&o.indexOf('NOHEADER')<0&&o.indexOf('NOH')<0;
  for(var i=0;i<o.length;i++)if(!/^(NOHEADER|NOH|HEADER|CC|NOCC|MEMBER|MEM|UPCASE|COPY)$/.test(o[i])&&!/^\d+$/.test(o[i])){err('DMS'+mod+'003E INVALID OPTION \''+o[i]+'\'');return 24}
  var R=V.matches(a[0],a[1],a[2]||'A');
  if(!R.length){err('DMS'+mod+'002E FILE \''+a[0]+' '+a[1]+' '+(a[2]||'A')+'\' NOT FOUND');return 28}
  if(!V.devs[dev]){err('DMS'+mod+'113S '+(dev==='00D'?'PUNCH':'PRINTER')+' ('+dev+') NOT ATTACHED');return 100}
  R.forEach(function(r){
    var f=r.f;
    if(f.prot&&!V.privileged()){err('DMS'+mod+'104S ERROR \'3\' READING FILE \''+fid(f,r.mode)+'\' FROM DISK');return}
    var L=f.lines.map(V.text);
    if(hdr)L=[V.readCard(f,r.mode,r.disk.label)].concat(L);
    V.closeSpool(dev,L,f.fn,f.ft);
  });
  return 0;
}
V.readCard=function(f,mode,label){ /* the :READ card the punch puts in front of a file */
  return ':READ  '+f.fn.padEnd(8)+' '+f.ft.padEnd(8)+' '+mode+f.fm+' '+label+' '+V.mdy(f.date)+'  '+String(f.date.getHours()).padStart(2)+':'+V.hms(f.date).slice(3,5);
};
C.PRINT=function(a,o){return spoolOut('PRT','00E',a,o)};
C.PUNCH=function(a,o){return spoolOut('PUN','00D',a,o)};
C.READCARD=function(a,o){
  if(!a.length){err('DMSRDC054E INCOMPLETE FILEID SPECIFIED');return 24}
  if(!V.rdr.length){err('DMSRDC205W READER EMPTY OR NOT READY');return 8}
  var f=V.rdr[0],L=f.lines.slice(),hdr=null,fn=a[0],ft=a[1]||'',fm=a[2]||'A1';
  if(fn==='*'){ /* the name comes from the :READ card the punch put in front, which READCARD shows */
    if(L.length&&/^:READ /.test(V.text(L[0]))){
      hdr=V.text(L.shift()).trim().split(/\s+/);
      out(hdr.map(function(x,i){return i===5?x.replace(/^0/,''):x}).join(' ').replace(/\.?$/,'.'));
      fn=hdr[1];ft=hdr[2];fm=hdr[3]||'A1';
    }
    else{out('DMSRDC702I READ CONTROL CARD MISSING. FOLLOWING ASSUMED:');fn='READCARD';ft='CMSUT1';fm='A1';out(':READ '+fn+' '+ft+' '+fm)}
  }
  else if(!ft){err('DMSRDC054E INCOMPLETE FILEID SPECIFIED');return 24}
  if(!rw('RDC',fm))return 36;
  if(!V.okName(fn)||!V.okName(ft)){err('DMSRDC062E INVALID * IN FILEID');return 20}
  if(!V.write('RDC',fm.charAt(0),V.file(fn,ft,L,{fm:fm.charAt(1)||'1',recfm:'F',lrecl:Math.max(80,V.lrecl(L))})))return 100;
  V.rdr.shift();
  if(f.letter)V.letterGone=true;
  return 0;
};

/* ---------- DISK DUMP and DISK LOAD: a file through the punch, as cards ---------- */
C.DISK=function(a,o){
  var w=a[0]||'';
  if(!w){err('DMSDSK047E NO FUNCTION SPECIFIED');return 24}
  if(w==='DUMP'){
    if(a.length<3){err('DMSDSK054E INCOMPLETE FILEID SPECIFIED');return 24}
    var r=V.find(a[1],a[2],a[3]||'A');
    if(!r){err('DMSDSK002E FILE \''+a[1]+' '+a[2]+' '+(a[3]||'A')+'\' NOT FOUND');return 28}
    if(r.f.prot&&!V.privileged()){err('DMSDSK104S ERROR \'3\' READING FILE \''+fid(r.f,r.mode)+'\' FROM DISK');return 100}
    V.closeSpool('00D',[V.readCard(r.f,r.mode,r.disk.label)].concat(r.f.lines.map(V.text)),r.f.fn,r.f.ft);
    return 0;
  }
  if(w==='LOAD'){
    if(!V.rdr.length){err('DMSDSK205W READER EMPTY OR NOT READY');return 8}
    var f=V.rdr[0],L=f.lines.map(V.text),h=L.length&&/^:READ /.test(L[0])?L.shift().slice(5).trim().split(/\s+/):null;
    if(!h){err('DMSDSK078E INVALID CARD IN INPUT DECK');return 32}
    if(!rw('DSK','A'))return 36;
    var fmn=(h[2]||'A1').charAt(1)||'1';
    if(!V.write('DSK','A',V.file(h[0],h[1],L,{fm:fmn})))return 100;
    out(h[0].padEnd(8)+' '+h[1].padEnd(8)+' A'+fmn);
    V.rdr.shift();if(f.letter)V.letterGone=true;
    return 0;
  }
  err('DMSDSK014E INVALID FUNCTION \''+w+'\'');return 24;
};

/* ---------- QUERY and SET ---------- */
var QOPT=[['BLIP',4],['RDYMSG',6],['IMPEX',5],['IMPCP',5],['ABBREV',6],['PROTECT',7],['RELPAGE',7],['REDTYPE',7],['INPUT',5],['OUTPUT',6],
  ['SYNONYM',3],['SEARCH',6],['DISK',4],['FILEDEF',2],['LIBRARY',3],['MACLIB',6],['TXTLIB',6],['DOSLIB',6],['LDRTBLS',7],['DLBL',4],['UPSI',4],['OPTION',6]];
function q(k,v){out(k.padEnd(8)+' = '+v)}
C.QUERY=function(a,o,l){
  var w=a[0]||'';
  if(!w){err('DMSQRY047E NO FUNCTION SPECIFIED');return 24}
  var k=V.lookup(QOPT,w);
  if(!k){
    if(V.opt.impcp){var rc=V.cp(l,'cms');if(rc!==null)return rc}
    err('DMSQRY014E INVALID FUNCTION \''+w+'\'');return 24;
  }
  var on=function(b){return b?'ON':'OFF'};
  switch(k){
    case 'BLIP':q('BLIP',V.opt.blip&&V.opt.blip!=='ON'?V.opt.blip:' ');return 0;
    case 'RDYMSG':q('RDYMSG',V.opt.rdymsg);return 0;
    case 'IMPEX':q('IMPEX',on(V.opt.impex));return 0;
    case 'IMPCP':q('IMPCP',on(V.opt.impcp));return 0;
    case 'ABBREV':q('ABBREV',on(V.opt.abbrev));return 0;
    case 'PROTECT':q('PROTECT',on(V.opt.protect));return 0;
    case 'RELPAGE':q('RELPAGE','ON');return 0;
    case 'REDTYPE':q('REDTYPE','OFF');return 0;
    case 'LDRTBLS':q('LDRTBLS','002');return 0;
    case 'UPSI':q('UPSI','00000000');return 0;
    case 'INPUT':case 'OUTPUT':out('NO USER DEFINED '+k+' TRANSLATE TABLE IN USE');return 0;
    case 'FILEDEF':case 'DLBL':out('DMSQRY324I NO USER DEFINED '+k+'\'S IN EFFECT');return 0;
    case 'LIBRARY':q('MACLIB','NONE');q('TXTLIB','NONE');q('DOSLIB','NONE');return 0;
    case 'MACLIB':case 'TXTLIB':case 'DOSLIB':q(k,'NONE');return 0;
    case 'OPTION':out('DMSQRY099E CMS/DOS ENVIRONMENT NOT ACTIVE');return 40;
    case 'SYNONYM':
      var x=a[1]||'';
      if(!x){err('DMSQRY005E NO \'SYNONYM PARAMETER\' SPECIFIED');return 24}
      if(x==='ALL'||x==='SYSTEM')synSystem();
      synUser(true);
      if(!/^(ALL|SYSTEM|USER)$/.test(x)){err('DMSQRY026E INVALID PARAMETER \''+x+'\' FOR \'SYNONYM\' FUNCTION');return 24}
      return 0;
    case 'SEARCH':
      V.modes().forEach(function(m){var A=V.acc[m];out(A.disk.label.padEnd(6)+'  '+A.cuu+'  '+(m+(A.ext?'/'+A.ext:'')).padEnd(5)+(A.rw?'R/W':'R/O'))});
      return 0;
    case 'DISK':return qdisk(a[1]);
  }
  return 0;
};
function synSystem(){
  out('');out('SYSTEM    SHORTEST');out('COMMAND   FORM');out('--------  --------');
  SYN.forEach(function(x){out(x[0].padEnd(10)+x[1])});
}
function synUser(always){
  var U=Object.keys(V.syn);
  if(!U.length&&!always)return;
  out('');out('SYSTEM   USER     SHORTEST');out('COMMAND  SYNONYM  FORM (IF ANY)');out('-------- -------- --------');
  U.forEach(function(k){out(V.syn[k].padEnd(9)+k)});
  out('');
}
V.roomiest=function(){ /* the read/write disk with the most room left: its mode, or null */
  var best=null;V.modes().forEach(function(m){if(V.acc[m].rw&&(!best||V.acc[m].disk.left()>V.acc[best].disk.left()))best=m});
  return best;
};
function qdisk(which){
  var M=V.modes();
  if(which==='R/W')M=M.filter(function(m){return V.acc[m].rw});
  else if(which==='MAX'){var best=V.roomiest();M=best?[best]:[]}
  else if(which&&which!=='*'){
    if(!/^[A-Z]$/.test(which)){err('DMSQRY048E INVALID MODE \''+which+'\'');return 24}
    if(!V.acc[which]){err('DMSQRY069E DISK \''+which+'\' NOT ACCESSED');return 0}
    M=[which];
  }
  out('LABEL  CUU M  STAT  CYL TYPE BLKSIZE   FILES  BLKS USED-(%) BLKS LEFT  BLK TOTAL');
  M.forEach(function(m){
    var A=V.acc[m],d=A.disk,u=d.used(),n=d.list().length;
    out((d.label||'').padEnd(6)+' '+A.cuu+' '+(m+(A.ext?'/'+A.ext:'')).padEnd(3)+' '+(A.rw?'R/W':'R/O')+String(d.cyl).padStart(5)+' '+d.type+String(d.blksize).padStart(5)+
      String(n).padStart(11)+String(u).padStart(11)+'-'+p2(Math.min(99,Math.floor(u*100/d.total)))+String(d.total-u).padStart(11)+String(d.total).padStart(11));
  });
  return 0;
}
var SOPT=[['BLIP',4],['RDYMSG',6],['IMPEX',5],['IMPCP',5],['ABBREV',6],['PROTECT',7],['RELPAGE',7],['REDTYPE',7],['INPUT',5],['OUTPUT',6],['LDRTBLS',7],['DOS',3],['UPSI',4],['SYSNAME',7]];
C.SET=function(a,o,l){
  var w=a[0]||'';
  if(!w){err('DMSSET047E NO FUNCTION SPECIFIED');return 24}
  var k=V.lookup(SOPT,w),v=a[1]||'';
  if(!k){
    if(V.opt.impcp){var rc=V.cp(l,'cms');if(rc!==null)return rc}
    err('DMSSET014E INVALID FUNCTION \''+w+'\'');return 24;
  }
  if(!v){err('DMSSET050E PARAMETER MISSING AFTER '+k);return 24}
  if(k==='BLIP'){V.opt.blip=v==='OFF'?false:v;return 0}
  if(k==='RDYMSG'){if(v!=='LMSG'&&v!=='SMSG'){err('DMSSET026E INVALID PARAMETER \''+v+'\' FOR \'RDYMSG\' FUNCTION');return 24}V.opt.rdymsg=v;return 0}
  if(/^(IMPEX|IMPCP|ABBREV|PROTECT|RELPAGE|REDTYPE)$/.test(k)){
    if(v!=='ON'&&v!=='OFF'){err('DMSSET026E INVALID PARAMETER \''+v+'\' FOR \''+k+'\' FUNCTION');return 24}
    var m={IMPEX:'impex',IMPCP:'impcp',ABBREV:'abbrev',PROTECT:'protect'}[k];if(m)V.opt[m]=v==='ON';return 0;
  }
  if(k==='DOS'){err('DMSSET099E CMS/DOS ENVIRONMENT NOT ACTIVE');return 40}
  return 0;
};
C.SYNONYM=function(a,o){
  if(o.indexOf('CLEAR')>=0){V.syn={};return 0}
  if(o.indexOf('NOSTD')>=0)V.synStd=false;
  if(o.indexOf('STD')>=0)V.synStd=true;
  if(a.length){
    var fm=a[2]||'A1',r=V.find(a[0],'SYNONYM',a[2]||'*');
    if(!r){err('DMSSYN002E FILE \''+a[0]+' SYNONYM '+(fm.length<2?fm+'1':fm)+'\' NOT FOUND');return 28}
    V.syn={};
    r.f.lines.forEach(function(l){var x=V.text(l).slice(0,72).trim().toUpperCase().split(/\s+/);if(x[0]&&x[1])V.syn[x[1].slice(0,8)]=x[0].slice(0,8)});
    return 0;
  }
  if(o.length)return 0;
  out('SYSTEM  SHORTEST');out('COMMAND   FORM');out('--------  --');
  SYN.forEach(function(x){out(x[0].padEnd(10)+x[1])});
  var U=Object.keys(V.syn);
  if(U.length){out('SYSTEM    USER    SHORTEST');out('COMMAND  SYNONYM  FORM (IF ANY)');out('-------- -------- ----');U.forEach(function(k){out(V.syn[k].padEnd(9)+k)})}
  return 0;
};

/* ---------- FORMAT a disk ---------- */
C.FORMAT=function(a,o){
  var cuu=a[0],m=a[1];
  if(!cuu){err('DMSFOR028E NO DEVICE SPECIFIED');return 24}
  if(!/^[0-9A-F]{1,3}$/.test(cuu)){err('DMSFOR017E INVALID DEVICE ADDRESS \''+cuu+'\'');return 24}
  cuu=z(cuu,3);
  if(!m||!/^[A-Z]$/.test(m)){err('DMSFOR048E INVALID MODE \''+(m||'')+'\'');return 24}
  var d=V.devs[cuu];
  if(!d||d.kind!=='DASD'){err('DMSFOR113S DEVICE \''+cuu+'\' NOT ATTACHED');return 100}
  if(d.rw!=='R/W'){err('DMSFOR037E DISK \''+m+'('+cuu+')\' IS READ/ONLY');return 36}
  if(V.acc[m]&&V.acc[m].cuu!==cuu&&!V.acc[m].rw){err('DMSFOR037E DISK \''+m+'\' IS READ/ONLY');return 36}
  var done=function(){out('DMSFOR732I \''+d.disk.cyl+'\' CYLINDERS FORMATTED ON DISK \''+m+'('+cuu+')\'')};
  if(o[0]==='RECOMP'){done();return 0}
  out('DMSFOR603R FORMAT WILL ERASE ALL FILES ON DISK \''+m+'('+cuu+')\'. DO YOU WISH TO CONTINUE? (YES|NO)');
  V.read(function(l){
    if(l===null||l===P.INT)return;
    if(up(l.trim())!=='YES'){out('DMSFOR705I DISK REMAINS UNCHANGED');return}
    out('DMSFOR605R ENTER DISK LABEL:');
    V.read(function(x){
      if(x===null||x===P.INT)return;
      var label=up(x.trim()).slice(0,6);
      out('DMSFOR733I FORMATTING DISK \''+m+'\'');
      P.pause(1500);
      P.queue(function(){
        d.disk.files={};d.disk.unformatted=false;d.disk.label=label;
        if(d.disk.keep)V.formatGuest();
        done();
        V.access(cuu,m,null,true);
      });
    },true);
  },true);
  return 0;
};

/* ---------- what is on the disks but cannot run here ---------- */
V.module=function(name,s,l){
  var M={ASSEMBLE:'DMSASM001E NO FILENAME SPECIFIED',FORTGI:'DMSFTN001E NO FILENAME SPECIFIED',LOAD:'DMSLIO001E NO FILENAME SPECIFIED',
    UPDATE:'DMSUPD001E NO FILENAME SPECIFIED',COMPARE:'DMSCMP054E INCOMPLETE FILEID SPECIFIED',SORT:'DMSSRT054E INCOMPLETE FILEID SPECIFIED',
    GENMOD:'DMSMOD001E NO FILENAME SPECIFIED',MACLIB:'DMSLBM047E NO FUNCTION SPECIFIED',TXTLIB:'DMSLBT047E NO FUNCTION SPECIFIED'};
  var SRC={ASSEMBLE:['ASM','ASSEMBLE'],UPDATE:['UPD','ASSEMBLE'],FORTGI:['FTN','FORTRAN']};
  if(!s.a.length&&M[name]){err(M[name]);return 24}
  if(name==='SORT')return V.sort(s.a);
  if(name==='COMPARE')return V.compare(s.a);
  if(name==='TAPE'){err('DMSTPE113S TAPE (181) NOT ATTACHED');return 100}
  if(SRC[name]&&!V.find(s.a[0],SRC[name][1],'*')){err('DMS'+SRC[name][0]+'002E FILE \''+s.a[0]+' '+SRC[name][1]+'\' NOT FOUND');return 28}
  /* the rest want more of the machine than a guest's 768K: as they would have said */
  P.pause(400);
  err('DMSFRE159T INSUFFICIENT STORAGE AVAILABLE TO SATISFY DMSFREE REQUEST FROM 020000');
  return 104;
};
C.START=function(){err('DMSLIO055E NO ENTRY POINT DEFINED');return 40};
C.GLOBAL=function(a){if(!a.length){err('DMSGLB047E NO FUNCTION SPECIFIED');return 24}return 0};
C.FILEDEF=function(a){if(!a.length){out('NO USER DEFINED FILEDEF\'S IN EFFECT');return 0}return 0};
C.SVCTRACE=C.DEBUG=function(){return 0};
V.compare=function(a){
  if(a.length<6){err('DMSCMP054E INCOMPLETE FILEID SPECIFIED');return 24}
  var x=V.find(a[0],a[1],a[2]),y=V.find(a[3]==='='?a[0]:a[3],a[4]==='='?a[1]:a[4],a[5]==='='?a[2]:a[5]);
  if(!x){err('DMSCMP002E FILE \''+a[0]+' '+a[1]+' '+a[2]+'\' NOT FOUND');return 28}
  if(!y){err('DMSCMP002E FILE \''+a.slice(3,6).join(' ')+'\' NOT FOUND');return 28}
  var A=x.f.lines.map(V.text),B=y.f.lines.map(V.text),n=Math.max(A.length,B.length),diff=0;
  for(var i=0;i<n;i++){
    if((A[i]||'').trimEnd()!==(B[i]||'').trimEnd()){diff++;if(A[i]!==undefined)out(A[i]);if(B[i]!==undefined)out(B[i]);out('')}
  }
  if(!diff)return 0;
  err('DMSCMP209W FILES DO NOT COMPARE');return 4;
};
V.sort=function(a){
  if(a.length<6){err('DMSSRT054E INCOMPLETE FILEID SPECIFIED');return 24}
  var x=V.find(a[0],a[1],a[2]);
  if(!x){err('DMSSRT002E FILE \''+a[0]+' '+a[1]+' '+a[2]+'\' NOT FOUND');return 28}
  out('DMSSRT604R ENTER SORT FIELDS:');
  V.ask(function(l){
    if(l===null||l===P.INT)return;
    var n=l.trim().split(/\s+/).map(Number);
    if(n.length<2||n.some(isNaN)){err('DMSSRT063E NO SORT LIST ENTERED');V.rc=24;return}
    var s=n[0]-1,e=n[1],L=x.f.lines.map(V.text).slice().sort(function(p,q){var u=p.slice(s,e),v=q.slice(s,e);return u<v?-1:u>v?1:0});
    if(!rw('SRT',a[5]))return;
    V.write('SRT',a[5].charAt(0),V.file(a[3],a[4],L,{recfm:x.f.recfm,lrecl:x.f.lrecl}));
  },true);
  return 0;
};

/* ---------- the terminal's own words ---------- */
var TERM={};
V.termWord=function(w,l){
  var k=w.toLowerCase(),f=TERM[k];
  if(!f)return false;
  if(k==='help'){V.help(l);return true}
  if(k==='mail'){V.mail();return true}
  var rest=l.trim().split(/\s+/).slice(1);
  f(rest.map(function(x){return x.toLowerCase()}),l,[k].concat(rest));
  return true;
};
V.mail=function(){ /* the letter, wherever it is: in the reader still, or read in to the A-disk */
  var M=V.letter||[];
  if(!M.length){out('NO RDR FILES');return}
  var s=new Date(V.logon?V.logon.getTime()-36e5*3-6e5*7:P.now().getTime());
  P.say(['RDR FILE LETTER MEMO FROM '+V.owner+' '+V.mdy(s)+' '+V.hms(s),''].concat(M));
};

/* ---------- start: the directory, the disks, the first logon ---------- */
P.setup(function(){
  V.owner=up(P.profile.owner).replace(/[^A-Z0-9$#@]/g,'').slice(0,8)||'OPERATOR';
  V.letter=P.profile.mail.slice();P.profile.mail=[]; /* the letter comes through the reader, not the terminal's notice */
  V.welcome=P.profile.welcome.slice();
  V.lmTime=new Date(P.now().getTime()-((P.now().getHours()+6)*36e5));V.lmTime.setHours(7,58,12);
  V.setupDirectory();
  V.setupDisks();
  ['help','mail','about','source','sound','fill','effects','connect'].forEach(function(k){
    if(!P.has(P.cmds,k))return;
    TERM[k]=P.cmds[k];
    P.cmds[k]=function(a,raw){V.input(raw)};
  });
  P.fallback=function(word,raw){P.status(0);V.input(raw);return true};
  P.blank=function(){V.input('')}; /* an empty line: CMS answers it, and the first one after IPL runs the profile */
  /* the visitor's first connection: LOGON GUEST, typed for them, then CMS and the profile */
  V.state='online';
  var n=P.now();
  P.profile.welcome=[
    ['','',{}],
    ['logon guest','',{hold:600,speed:2.2}],
    'ENTER PASSWORD:',
    'XXXXXXXX',
    [function(){
      V.logonAs('GUEST',n);
      P.queue(function(){V.ipl()});
      P.typeLine('','',null,{hold:700}); /* the Return that starts CMS on its way */
      P.queue(function(){V.input('')});
      return '';
    },'',{hold:500}]
  ];
});
})(window.Phosphor);
