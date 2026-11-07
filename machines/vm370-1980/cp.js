/* PHOSPHOR-9 terminal: machine "vm370-1980", CP, the Control Program: LOGON and LOGOFF, the virtual machine's
   devices, its spool (the reader the letter arrives in), LINK, MSG, QUERY and the rest of the commands a class G
   user has, and a few of the operator's for MAINT.
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE.
   The messages are CP's own, from the Release 6 manuals (GC20-1808, GC20-1820) and checked against VM/370
   Release 6 running under Hercules; the program is new. */
Phosphor.setup(function(P){
'use strict';
var V=P.vm=P.vm||{};
var up=V.up=V.up||function(s){return String(s).toUpperCase()};
var p2=P.p2;
function z(n,w){return String(n).padStart(w,'0')}
/* a message with its code, shown as CP's SET EMSG says: ON code and text, TEXT (as a logon starts) the text alone */
V.em=function(s,cls){
  var m=String(s).match(/^(DM([SK])([A-Z]{3})\d{3}([EIWST]))\s(.*)$/),e=V.set?V.set.emsg:'ON';
  if(m&&m[2]==='S'&&!/^(ACC|INT|EXT)$/.test(m[3])&&!/[.:)]$/.test(s)){s+='.';m[5]+='.'} /* CMS ends its sentences */
  if(m&&/[ST]/.test(m[4]))m=null; /* severe and terminal messages always come with their codes */
  if(m&&V.user){
    if(e==='OFF')return;
    if(e==='TEXT')s=m[5];
    else if(e==='CODE')s=m[1];
  }
  P.typeLine(s,cls||(m&&m[4]!=='I'?'err':''));
};
function out(s){V.em(s,'')}
function err(s){V.em(s,'err')}
var DAYS=['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'];
V.hms=function(d){return p2(d.getHours())+':'+p2(d.getMinutes())+':'+p2(d.getSeconds())};
V.mdy=function(d){return p2(d.getMonth()+1)+'/'+p2(d.getDate())+'/'+p2(d.getFullYear()%100)};
V.zone=function(){ /* the visitor's own zone where it has a three-letter name; CP's was set at system generation */
  var t=P.tz();if(/^[A-Z]{3}$/.test(t))return t;
  var o=-new Date().getTimezoneOffset()/60;
  return {0:'GMT',1:'CET',2:'EET',3:'MSK','-5':'EST','-6':'CST','-7':'MST','-8':'PST',9:'JST'}[o]||'GMT';
};
V.stamp=function(d){return V.hms(d)+' '+V.zone()+' '+DAYS[d.getDay()]+' '+V.mdy(d)};

/* ---------- the CP directory: who may log on, with what, and their minidisks ---------- */
V.setupDirectory=function(){
  var root=up(P.profile.rootPassword||'SYSPROG').replace(/\s+/g,'').slice(0,8),owner=V.owner;
  V.dir={
    OPERATOR:{pw:'OPERATOR',cls:'ABCDEFG',stor:'1M',on:'009'},
    MAINT:{pw:root,cls:'ABCDEFG',stor:'1M'},
    GUEST:{pw:'GUEST',cls:'G',stor:'768K'},
    AUTOLOG1:{pw:'AUTOLOG',cls:'ABCDEG',stor:'256K'},
    CMSBATCH:{pw:'BATCH',cls:'G',stor:'768K',on:'DSC'}
  };
  if(!V.dir[owner])V.dir[owner]={pw:'NOLOG',cls:'G',stor:'1M',on:'0C2'};
};
V.privileged=function(){return /[AB]/.test(V.cls||'')};
V.others=function(){ /* who else is on, as Q NAMES shows them */
  var L=[['OPERATOR','009'],['CMSBATCH','DSC']];
  if(V.dir[V.owner]&&V.dir[V.owner].on==='0C2')L.push([V.owner,'0C2']);
  return L;
};
/* the directory as MAINT keeps it on his 191, passwords and all */
V.directText=function(){
  var D=V.dir,L=['DIRECTORY 0CF 3330 VMSRES'];
  function u(id,lines){var o=D[id];L.push('USER '+id.padEnd(8)+' '+o.pw.padEnd(8)+' '+o.stor.padEnd(5)+' 1M '+o.cls);lines.forEach(function(l){L.push(' '+l)})}
  var std=['CONSOLE 009 3215','SPOOL 00C 2540 READER *','SPOOL 00D 2540 PUNCH A','SPOOL 00E 1403 A'];
  u('OPERATOR',['ACCOUNT 1 SYSTEM','IPL CMS'].concat(std,['LINK MAINT 190 190 RR','MDISK 191 3330 015 002 VMSRES MR READ WRITE MULT']));
  u('MAINT',['ACCOUNT 2 SYSTEM','IPL CMS'].concat(std,['MDISK 190 3330 017 041 VMSRES MR ALL WRITE MULT','MDISK 191 3330 058 005 VMSRES MR ALL WRITE MULT','MDISK 19E 3330 063 010 VMSRES MR ALL WRITE MULT','MDISK 0CF 3330 001 001 VMSRES MR']));
  u('AUTOLOG1',['ACCOUNT 1 SYSTEM','IPL CMS','CONSOLE 009 3215','LINK MAINT 190 190 RR','MDISK 191 3330 090 001 VMPK01 MR READ WRITE']);
  u('CMSBATCH',['ACCOUNT 4 BATCH','IPL CMS'].concat(std,['LINK MAINT 190 190 RR','MDISK 195 3330 088 002 VMPK01 W']));
  u('GUEST',['ACCOUNT 9 GUEST','IPL CMS'].concat(std,['LINK MAINT 190 190 RR','LINK MAINT 19E 19E RR','MDISK 191 3330 073 005 VMSRES MR READ WRITE MULT']));
  if(D[V.owner].on==='0C2')u(V.owner,['ACCOUNT 3 STAFF','IPL CMS'].concat(std,['LINK MAINT 190 190 RR','LINK MAINT 19E 19E RR','MDISK 191 3330 078 010 VMPK01 MR READ WRITE MULT']));
  return L;
};

/* ---------- the virtual machine a logon gives ---------- */
var TERM0={linend:'#',chardel:'@',escape:'"',linedel:'¢'}; /* the terminal's line editing characters, as a logon sets them */
V.newMachine=function(user){
  V.user=user;V.cls=V.dir[user].cls;V.logon=P.now();V.vcpu=0;V.tcpu=0;
  V.devs={'009':{kind:'CONS'},'00C':{kind:'RDR',cls:'*'},'00D':{kind:'PUN',cls:'A',to:null,copy:1},'00E':{kind:'PRT',cls:'A',to:null,copy:1}};
  var own=V.disks[user+' 191'];
  if(own)V.devs['191']={kind:'DASD',disk:own,rw:'R/W'};
  var maint=user==='MAINT';
  V.devs['190']={kind:'DASD',disk:V.disks['MAINT 190'],rw:maint?'R/W':'R/O'};
  if(user!=='OPERATOR')V.devs['19E']={kind:'DASD',disk:V.disks['MAINT 19E'],rw:maint?'R/W':'R/O'};
  V.rdr=[];V.prtFiles=[];V.punFiles=[];
  V.set={msg:true,wng:true,emsg:'TEXT',imsg:true,run:false};
  V.term=Object.assign({},TERM0);
  V.cpMode=false;V.state='cp';V.stor=V.dir[user].stor;
};

/* ---------- spool files ---------- */
V.spoolid=17;
V.spool=function(o){return Object.assign({id:++V.spoolid,cls:'A',type:'PUN',copy:1,hold:'NONE',date:P.now(),name:'',ft:'',dist:V.user},o)};
V.filesLine=function(){
  function n(k,s){return (k?z(k,3):' NO')+' '+s}
  return 'FILES: '+n(V.rdr.length,'RDR')+', '+n(V.prtFiles.length,'PRT')+', '+n(V.punFiles.length,'PUN');
};
V.arrive=function(f,quiet){ /* a file reaches this reader: CP says so, unless it was there before the logon */
  V.rdr.push(f);
  if(!quiet&&V.set.imsg)P.typeLine('RDR FILE '+z(f.id,4)+' SENT FROM '+f.from.padEnd(8)+' '+f.type+' WAS '+z(f.id,4)+' RECS '+z(f.lines.length,4)+' CPY 001 '+f.cls+' NOHOLD');
};
function rows(L,what){
  if(!L.length)return ['NO '+what+' FILES'];
  return ['ORIGINID FILE CLASS RECDS  CPY HOLD DATE  TIME     NAME        TYPE     DIST'].concat(L.map(function(f){
    return f.from.padEnd(8)+' '+z(f.id,4)+' '+f.cls+' '+f.type+' '+z(f.lines.length,6)+'  '+z(f.copy,2)+' '+f.hold.padEnd(4)+' '+p2(f.date.getMonth()+1)+'/'+p2(f.date.getDate())+' '+V.hms(f.date)+' '+(f.name||'').padEnd(12)+(f.ft||'').padEnd(9)+f.dist;
  }));
}
V.letterFile=function(){ /* the letter, punched by the owner a few hours before the logon, waiting in the reader */
  var M=V.letter||[];if(!M.length)return null;
  var sent=new Date(V.logon.getTime()-36e5*3-6e5*7);
  return V.spool({from:V.owner,type:'PUN',name:'LETTER',ft:'MEMO',dist:'GUEST',lines:[V.readCard({fn:'LETTER',ft:'MEMO',fm:'1',date:sent},'A',(V.disks[V.owner+' 191']||{}).label||'GST191')].concat(M),date:sent,letter:true});
};

/* ---------- a word against a table of names and their shortest forms ---------- */
V.lookup=function(T,w){
  w=up(w);
  for(var i=0;i<T.length;i++){var n=T[i][0],m=T[i][1]||n.length;if(w.length>=m&&w.length<=n.length&&n.indexOf(w)===0)return n}
  return null;
};

/* ---------- CP commands ---------- */
var CPC=[ /* name, shortest form, privilege classes (Z: any) */
  ['ATTACH',3,'B'],['BEGIN',1,'G'],['CHANGE',2,'DG'],['CLOSE',1,'G'],['COUPLE',3,'G'],['DEFINE',3,'G'],['DETACH',3,'G'],
  ['DIAL',4,'Z'],['DISCONN',4,'G'],['DISPLAY',1,'G'],['DUMP',4,'G'],['ECHO',4,'G'],['EXTERNAL',3,'G'],['FORCE',5,'A'],
  ['INDICATE',2,'G'],['IPL',3,'G'],['LINK',4,'G'],['LOADVFCB',5,'G'],['LOGOFF',3,'G'],['LOGOUT',4,'G'],['MESSAGE',1,'Z'],
  ['MSG',3,'Z'],['NOTREADY',4,'G'],['ORDER',3,'DG'],['PURGE',3,'DG'],['QUERY',1,'Z'],['READY',3,'G'],['REQUEST',3,'G'],['RESET',3,'G'],
  ['REWIND',3,'G'],['SET',2,'Z'],['SHUTDOWN',8,'A'],['SLEEP',3,'G'],['SPOOL',2,'G'],['STORE',3,'G'],['SYSTEM',3,'G'],['TAG',3,'G'],
  ['TERMINAL',4,'G'],['TRACE',2,'G'],['TRANSFER',3,'DG'],['WARNING',1,'A'],['WNG',3,'A']
];
V.cpName=function(w){return V.lookup(CPC,w)};
function allowed(name){var c=CPC.filter(function(x){return x[0]===name})[0][2];return c==='Z'||c.split('').some(function(k){return (V.cls||'').indexOf(k)>=0})}
V.cp=function(line,from){ /* one CP command: its return code; from CMS, null when CP has no such command */
  var W=line.trim().split(/\s+/).filter(Boolean),w=W[0]||'';
  if(!w){if(from==='cp')P.typeLine('CP');return 0}
  if(up(w)==='CP'&&from==='cp')return V.cp(line.trim().slice(2),from); /* CP mode takes CP's name in front, too */
  var name=V.lookup(CPC,w);
  if(!name||!allowed(name)){
    if(from==='cms')return null;
    if(from==='cmscp')return -1; /* CMS's CP command: CP said no such command */
    err('DMKCFC001E ?CP: '+up(w));return 1;
  }
  var a=W.slice(1).map(up),rc=CP[name](a,W.slice(1),line,from);
  return typeof rc==='number'?rc:0;
};
var CP={};
function bad(mod,n,t){err('DMK'+mod+z(n,3)+'E '+t);return n}
function vaddr(w){return /^[0-9A-F]{1,3}$/.test(w||'')?z(w,3):null}
var DEVS=[['PUNCH',2],['PRINTER',2],['READER',1],['CONSOLE',4],['PCH',3],['PRT',3],['RDR',3]];
function devOf(w){var n=V.lookup(DEVS,w||'');return n==='PUNCH'||n==='PCH'?'00D':n==='PRINTER'||n==='PRT'?'00E':n==='READER'||n==='RDR'?'00C':n==='CONSOLE'?'009':vaddr(w)}

CP.QUERY=function(a){
  var w=a[0]||'';
  if(!w)return bad('CQG',26,'OPERAND MISSING OR INVALID');
  var k=V.lookup([['TIME',1],['USERS',1],['NAMES',1],['READER',1],['RDR',3],['PRINTER',2],['PRT',3],['PUNCH',2],['PCH',3],['FILES',1],['VIRTUAL',1],
    ['TERMINAL',4],['SET',3],['LOGMSG',3],['LINKS',4],['DASD',4],['STORAGE',4],['CONSOLE',4],['PF',2]],w)||(/^PF\d\d?$/.test(w)?'PFNN':null);
  var n=P.now();
  switch(k){
    case 'TIME':out('TIME IS '+V.stamp(n));out(V.usage(n));return 0;
    case 'USERS':out(z(V.others().length+1,3)+' USERS, 000 DIALED');return 0;
    case 'NAMES':
      var L=V.others().map(function(x){return x[0].padEnd(8)+' - '+x[1]}).concat([V.user.padEnd(8)+' - 041']);
      for(var i=0;i<L.length;i+=4)out(L.slice(i,i+4).join(', '));
      return 0;
    case 'FILES':out(V.filesLine());return 0;
    case 'READER':case 'RDR':case 'PRINTER':case 'PRT':case 'PUNCH':case 'PCH':
      var R=/^R/.test(k)?V.rdr:/^PR/.test(k)?V.prtFiles:V.punFiles,what=/^R/.test(k)?'RDR':/^PR/.test(k)?'PRT':'PUN';
      if(a[1]&&a[1]!=='ALL'&&a[1]!=='*')return bad('CQH',26,'OPERAND MISSING OR INVALID');
      if(a[1])P.say(rows(R,what));
      else out(R.length?'FILES: '+z(R.length,3)+' '+what:'NO '+what+' FILES');
      return 0;
    case 'LOGMSG':P.say(V.logmsg());return 0;
    case 'VIRTUAL':
      if(a[1]){var Lv=V.virtual(a[1]);if(!Lv)return a[1].length<=3&&vaddr(a[1])?bad('CQG',40,'DEV '+vaddr(a[1])+' DOES NOT EXIST'):bad('CQG',26,'OPERAND MISSING OR INVALID');P.say(Lv);return 0}
      P.say(V.virtual());return 0;
    case 'STORAGE':out('STORAGE = '+V.storage());return 0;
    case 'CONSOLE':P.say(V.virtual('CONSOLE'));return 0;
    case 'DASD':P.say(V.virtual('DASD'));return 0;
    case 'TERMINAL':
      var T=V.term;
      P.say(['LINEND  '+(T.linend||' ')+' , LINEDEL    , CHARDEL  '+(T.chardel||' ')+' , ESCAPE  '+(T.escape||' ')+' , TABCHAR ON','LINESIZE 130, ATTN ON , APL OFF, TEXT OFF, MODE VM']);return 0;
    case 'SET':
      var S=V.set;
      P.say(['MSG '+(S.msg?'ON ':'OFF')+', WNG '+(S.wng?'ON ':'OFF')+', EMSG '+S.emsg+', ACNT OFF, RUN '+(S.run?'ON':'OFF'),
        'LINEDIT ON , TIMER OFF , ISAM OFF, ECMODE OFF','ASSIST OFF , PAGEX OFF, AUTOPOLL OFF','IMSG '+(S.imsg?'ON ':'OFF')+', AFFINITY NONE']);
      return 0;
    case 'LINKS':
      var lv=vaddr(a[1]);
      if(!lv)return bad('CQG',22,'VADDR MISSING OR INVALID');
      if(!V.devs[lv]||V.devs[lv].kind!=='DASD')return bad('CQG',40,'DEV '+lv+' DOES NOT EXIST');
      var dk=V.devs[lv].disk;
      out(Object.keys(V.devs).sort().filter(function(k){return V.devs[k].disk===dk}).map(function(k){return V.user.padEnd(8)+' '+k+' '+V.devs[k].rw}).join(', '));
      return 0;
    case 'PF':for(var p=1;p<=24;p++)out('PF'+p2(p)+' UNDEFINED');return 0;
    case 'PFNN':out('PF'+p2(+w.slice(2))+' UNDEFINED');return 0;
  }
  if(w.length<=3&&vaddr(w)){var Ld=V.virtual(w);if(!Ld)return bad('CQG',40,'DEV '+vaddr(w)+' DOES NOT EXIST');P.say(Ld);return 0}
  /* anything else is a userid: is that one on? */
  if(w===V.user){out(w.padEnd(8)+' - 041');return 0}
  var o=V.others().filter(function(x){return x[0]===w})[0];
  if(o){out(w.padEnd(8)+' - '+o[1]);return 0}
  return bad('CQG',45,w.slice(0,8)+' NOT LOGGED ON');
};
V.storage=function(){var s=V.stor;return z(/M$/.test(s)?parseInt(s,10)*1024:parseInt(s,10),5)+'K'};
V.usage=function(n){ /* CONNECT= hh:mm:ss VIRTCPU= mmm:ss.hh TOTCPU= mmm:ss.hh */
  var c=Math.max(0,Math.floor((n-V.logon)/1000));
  function cpu(s){var m=Math.floor(s/60),r=s-m*60;return z(m,3)+':'+(r<10?'0':'')+r.toFixed(2)}
  return 'CONNECT= '+p2(Math.floor(c/3600))+':'+p2(Math.floor(c/60)%60)+':'+p2(c%60)+' VIRTCPU= '+cpu(V.vcpu+0.06)+' TOTCPU= '+cpu(V.tcpu+0.1);
};
V.virtual=function(what){ /* Q VIRTUAL, all of it or one kind or one address; null for an address not there */
  var L={},keys=Object.keys(V.devs).sort(),u=V.user.padEnd(8);
  keys.forEach(function(k){
    var d=V.devs[k];
    if(d.kind==='CONS')L[k]=['CONS '+k+' ON LINE 041    TERM '+(d.spool?'START':'STOP'),'     '+k+' CL T  NOCONT NOHOLD COPY 01    READY','     '+k+' FOR '+u+' DIST '+V.user];
    else if(d.kind==='RDR')L[k]=['RDR  '+k+' CL '+d.cls+'  NOCONT NOHOLD   EOF      READY'];
    else if(d.kind==='PUN'||d.kind==='PRT')L[k]=[d.kind+'  '+k+' CL '+d.cls+'  NOCONT NOHOLD COPY '+p2(d.copy)+'    READY','     '+k+' FOR '+(d.to||V.user).padEnd(8)+' DIST '+V.user];
    else if(d.kind==='DASD')L[k]=['DASD '+k+' '+d.disk.type+' '+(d.temp?'VMPK01':d.disk.vol).padEnd(6)+' '+d.rw+' '+z(d.disk.cyl,4)+' CYL'];
  });
  function kind(kd){return [].concat.apply([],keys.filter(function(k){return V.devs[k].kind===kd}).map(function(k){return L[k]}))}
  if(!what)return ['STORAGE = '+V.storage()].concat([].concat.apply([],keys.filter(function(k){return V.devs[k].kind!=='DASD'}).map(function(k){return L[k]})),kind('DASD'));
  var w=V.lookup([['STORAGE',3],['CONSOLE',4],['READER',3],['PUNCH',3],['PRINTER',3],['DASD',4],['UR',2]],what);
  if(w==='STORAGE')return ['STORAGE = '+V.storage()];
  if(w==='CONSOLE')return kind('CONS');
  if(w==='READER')return kind('RDR');
  if(w==='PUNCH')return kind('PUN');
  if(w==='PRINTER')return kind('PRT');
  if(w==='DASD')return kind('DASD');
  if(w==='UR')return kind('RDR').concat(kind('PUN'),kind('PRT'));
  var v=vaddr(what);
  return v&&L[v]?L[v]:null;
};

CP.MSG=CP.MESSAGE=function(a,w,line){
  var to=a[0];
  if(!to)return bad('MSG',20,'USERID MISSING OR INVALID');
  var text=up(line.trim().replace(/^\S+\s+\S+\s?/,''));
  if(to==='*'||to===V.user){V.msgFrom(V.user,text);return 0}
  if(to==='ALL'&&V.privileged())return V.toAll('MSG',text);
  var o=V.others().filter(function(x){return x[0]===to})[0];
  if(!o)return bad('MSG',45,to+' NOT LOGGED ON');
  if(o[1]==='DSC'){err('DMKMSG057W '+to.padEnd(8)+' NOT RECEIVING;  DISCONNECTED');return 57}
  if(to==='OPERATOR')V.operatorReply(text);
  return 0;
};
V.toAll=function(kind,text){ /* MSG ALL and WNG ALL: everyone, this terminal too; the disconnected cannot hear */
  V.msgFrom(V.user,text,kind);
  var dsc=V.others().filter(function(x){return x[1]==='DSC'});
  dsc.forEach(function(x){err('DMK'+(kind==='WNG'?'WRN':'MSG')+'057W '+x[0].padEnd(8)+' NOT RECEIVING;  DISCONNECTED')});
  return dsc.length?57:0;
};
V.msgFrom=function(from,text,kind){
  if(!V.set.msg)return;
  P.typeLine(V.hms(P.now())+' ');
  P.typeLine(' '+(kind||'MSG')+' FROM '+from.padEnd(8)+':  '+text);
};
/* the operator at the console answers, after a while, as operators did */
var REPLIES=['WHO IS THIS?','THIS IS THE CONSOLE. CALL THE HELP DESK IN THE MORNING.','MOUNTING A TAPE. LATER.','THE SYSTEM IS UP. WHAT MORE DO YOU WANT?'],said=0;
V.operatorReply=function(text){
  var r=/PASSWORD|MAINT/.test(text)?'NICE TRY.':REPLIES[Math.min(said++,REPLIES.length-1)],who=V.user;
  P.pause(1400);
  P.queue(function(){if(V.user===who)V.msgFrom('OPERATOR',r)});
};

CP.SET=function(a){
  var k=V.lookup([['MSG',3],['WNG',3],['EMSG',4],['IMSG',4],['RUN',3],['LINEDIT',4],['ECMODE',4],['TIMER',5],['ACNT',4],['ISAM',4],['AUTOPOLL',8],['PAGEX',5],['ASSIST',6]],a[0]||'');
  if(/^PF\d\d?$/.test(a[0]||''))return 0;
  if(a[0]==='LOGMSG'&&/B/.test(V.cls)){ /* the operator's log message: a line at a time, until an empty one */
    if(a[1]){err('DMKCFC041E LOGMSG '+a[1]+' DOES NOT EXIST');return 41}
    var L=[];
    (function more(){P.ask('LOGMSG: ',function(l){
      if(l===null||l===P.INT)return;
      if(l.trim()){L.push(up(l));more();return}
      if(L.length){V.lmLines=L;V.lmTime=P.now()}
    },true)})();
    return 0;
  }
  if(!k)return bad('CFC',3,'INVALID OPTION - '+(a[0]||''));
  var v=a[1]||'';
  if(k==='EMSG'){if(!/^(ON|OFF|CODE|TEXT)$/.test(v))return bad('CFC',26,'OPERAND MISSING OR INVALID');V.set.emsg=v;return 0}
  if(!/^(ON|OFF)$/.test(v))return bad('CFC',26,'OPERAND MISSING OR INVALID');
  var m={MSG:'msg',WNG:'wng',IMSG:'imsg',RUN:'run'}[k];
  if(m)V.set[m]=v==='ON';
  return 0;
};
CP.TERMINAL=function(a,w){
  if(!a.length)return bad('CFT',26,'OPERAND MISSING OR INVALID');
  for(var i=0;i<a.length;i++){
    var k=V.lookup([['LINEND',4],['CHARDEL',4],['LINEDEL',5],['ESCAPE',3],['LINESIZE',5],['ATTN',4],['APL',3],['TEXT',4],['MODE',4],['MASK',4]],a[i]);
    if(!k)return bad('CFT',26,'OPERAND MISSING OR INVALID');
    var v=w[++i];
    if(v===undefined)return bad('CFT',26,'OPERAND MISSING OR INVALID');
    var f={LINEND:'linend',CHARDEL:'chardel',LINEDEL:'linedel',ESCAPE:'escape'}[k];
    if(f){if(up(v)==='OFF')V.term[f]='';else if(up(v)==='ON')V.term[f]=TERM0[f];else if(v.length===1)V.term[f]=v;else return bad('CFT',2,'INVALID OPERAND - '+v)}
  }
  return 0;
};

CP.SPOOL=function(a){
  if(!a.length)return bad('CSP',22,'VADDR MISSING OR INVALID');
  var k=devOf(a[0]),dev=k&&V.devs[k];
  if(!dev)return k?bad('CSP',40,'DEV '+k+' DOES NOT EXIST'):bad('CSP',22,'VADDR MISSING OR INVALID');
  if(a.length<2)return bad('CSP',26,'OPERAND MISSING OR INVALID');
  for(var i=1;i<a.length;i++){
    var o=a[i];
    if(o==='TO'){
      var t=a[++i];
      if(!t)return bad('CSP',20,'USERID MISSING OR INVALID');
      if(t==='*'||t===V.user)dev.to=V.user;
      else if(t==='OFF'||t==='SYSTEM')dev.to=null;
      else if(!V.dir[t])return bad('CSP',53,t.padEnd(8)+' NOT IN CP DIRECTORY');
      else dev.to=t;
    }
    else if(o==='OFF')dev.to=null;
    else if(o==='CLASS'||o==='CL'){var c=a[++i];if(!/^[A-Z0-9*]$/.test(c||''))return bad('CSP',28,'CLASS MISSING OR INVALID');dev.cls=c}
    else if(o==='COPY'){var n=+a[++i];if(!(n>=1&&n<=99))return bad('CSP',30,'COPIES MISSING OR INVALID');dev.copy=n}
    else if(o==='START'||o==='STOP')dev.spool=o==='START';
    else if(/^(CONT|NOCONT|HOLD|NOHOLD|CLOSE|TERM|NOTERM|EOF|NOEOF|PURGE)$/.test(o))continue;
    else return bad('CSP',3,'INVALID OPTION - '+o);
  }
  return 0;
};
/* a punch or printer file closed: to another user's reader, to our own, or to the system's printer */
V.closeSpool=function(k,lines,name,ft){
  var d=V.devs[k];if(!d)return;
  var type=d.kind==='PUN'?'PUN':'PRT',f=V.spool({from:V.user,type:type,cls:d.cls,name:name,ft:ft,lines:lines,dist:V.user});
  if(d.to){P.typeLine(type+' FILE '+z(f.id,4)+'  TO  '+d.to.padEnd(8)+' COPY 01 NOHOLD')}
  if(d.to&&d.to!==V.user)return;
  if(d.to===V.user){V.arrive(f,true);return}
  (type==='PUN'?V.punFiles:V.prtFiles).push(f); /* held for the system's printer or punch, class A, which nobody is draining */
};

function spoolList(w){var n=V.lookup(DEVS,w||'');return n==='READER'||n==='RDR'?V.rdr:n==='PUNCH'||n==='PCH'?V.punFiles:n==='PRINTER'||n==='PRT'?V.prtFiles:null}
function counted(n,what){return (n?z(n,4)+' ':' NO  ')+'FILE'+(n===1?'':'S')+' '+what}
CP.PURGE=function(a){
  var L=spoolList(a[0]);
  if(!L)return bad('CSV',35,'DEVICE TYPE MISSING OR INVALID');
  var ids=a.slice(1),gone=0;
  if(!ids.length||ids[0]==='ALL'){gone=L.length;L.length=0;out(counted(gone,'PURGED'));return 0}
  for(var i=0;i<ids.length;i++){
    if(ids[i]==='CLASS'){var c=ids[++i];for(var j=L.length-1;j>=0;j--)if(L[j].cls===c){L.splice(j,1);gone++}continue}
    if(!/^\d{1,4}$/.test(ids[i])){out(counted(gone,'PURGED'));return bad('CSV',8,'INVALID SPOOLID - '+ids[i])}
    var at=L.map(function(f){return f.id}).indexOf(+ids[i]);
    if(at<0){out(counted(gone,'PURGED'));err('DMKCSV042E SPOOLID '+ids[i]+' DOES NOT EXIST');return 42}
    L.splice(at,1);gone++;
  }
  out(counted(gone,'PURGED'));
  return 0;
};
CP.ORDER=function(a){
  var L=spoolList(a[0]);
  if(!L)return bad('CSV',35,'DEVICE TYPE MISSING OR INVALID');
  var ids=a.slice(1),front=[];
  if(!ids.length)return bad('CSV',27,'SPOOLID MISSING OR INVALID');
  for(var i=0;i<ids.length;i++){
    if(!/^\d{1,4}$/.test(ids[i])){L.unshift.apply(L,front);out(counted(front.length,'ORDERED'));return bad('CSV',8,'INVALID SPOOLID - '+ids[i])}
    var at=L.map(function(f){return f.id}).indexOf(+ids[i]);
    if(at<0){L.unshift.apply(L,front);out(counted(front.length,'ORDERED'));err('DMKCSV042E SPOOLID '+ids[i]+' DOES NOT EXIST');return 42}
    front.push(L.splice(at,1)[0]);
  }
  L.unshift.apply(L,front);
  out(counted(front.length,'ORDERED'));
  return 0;
};
CP.CHANGE=function(a){
  var L=spoolList(a[0]);
  if(!L)return bad('CSU',35,'DEVICE TYPE MISSING OR INVALID');
  var id=a[1];
  if(!id)return bad('CSU',27,'SPOOLID MISSING OR INVALID');
  var F=id==='ALL'?L.slice():L.filter(function(f){return f.id===+id});
  if(id!=='ALL'&&!/^\d{1,4}$/.test(id))return bad('CSU',8,'INVALID SPOOLID - '+id);
  if(!F.length){out(counted(0,'CHANGED'));if(id!=='ALL'){err('DMKCSU042E SPOOLID '+id+' DOES NOT EXIST');return 42}return 0}
  if(a.length<3)return bad('CSU',26,'OPERAND MISSING OR INVALID');
  for(var i=2;i<a.length;i++){
    var o=a[i];
    if(o==='CLASS'||o==='CL'){var v=a[++i];if(!/^[A-Z0-9]$/.test(v||''))return bad('CSU',28,'CLASS MISSING OR INVALID');F.forEach(function(f){f.cls=v})}
    else if(o==='NAME'){var n1=a[++i]||'',n2=a[++i]||'';F.forEach(function(f){f.name=n1.slice(0,8);f.ft=n2.slice(0,8)})}
    else if(o==='HOLD')F.forEach(function(f){f.hold='USER'});
    else if(o==='NOHOLD')F.forEach(function(f){f.hold='NONE'});
    else if(o==='COPY'){var c=+a[++i];if(!(c>=1&&c<=99))return bad('CSU',30,'COPIES MISSING OR INVALID');F.forEach(function(f){f.copy=c})}
    else if(o==='DIST'){var d=a[++i]||'';F.forEach(function(f){f.dist=d.slice(0,8)})}
    else return bad('CSU',3,'INVALID OPTION - '+o);
  }
  out(counted(F.length,'CHANGED'));
  return 0;
};
CP.TRANSFER=function(a){
  var L=spoolList(a[0]);
  if(!L)return bad('CSV',35,'DEVICE TYPE MISSING OR INVALID');
  var id=a[1],to=a[2]==='TO'?a[3]:a[2];
  if(!id)return bad('CSV',27,'SPOOLID MISSING OR INVALID');
  if(!to)return bad('CSV',20,'USERID MISSING OR INVALID');
  if(!V.dir[to])return bad('CSV',53,to.padEnd(8)+' NOT IN CP DIRECTORY');
  var F=id==='ALL'?L.slice():L.filter(function(f){return f.id===+id});
  if(id!=='ALL'&&!/^\d{1,4}$/.test(id))return bad('CSV',8,'INVALID SPOOLID - '+id);
  if(!F.length){out(counted(0,'TRANSFERRED'));if(id!=='ALL'){err('DMKCSV042E SPOOLID '+id+' DOES NOT EXIST');return 42}return 0}
  if(to===V.user){out(counted(F.length,'TRANSFERRED'));return 0}
  F.forEach(function(f){L.splice(L.indexOf(f),1);out('RDR FILE '+z(f.id,4)+' TRANSFERRED  TO  '+to)});
  out(counted(F.length,'TRANSFERRED'));
  return 0;
};
CP.CLOSE=function(a){
  var k=devOf(a[0]);
  if(!a.length||!k)return bad('CSQ',22,'VADDR MISSING OR INVALID');
  if(!V.devs[k])return bad('CSQ',40,'DEV '+k+' DOES NOT EXIST');
  return 0;
};

CP.LINK=function(a,w,line,from){
  var user=a[0],src=a[1],to=a[2],mode=a[3]||'R',pi=4;
  if(user==='TO'){user=a[1];src=a[2];to=a[4];mode=a[5]||'R';pi=6}
  if(!user)return bad('LNK',20,'USERID MISSING OR INVALID');
  if(user==='*')user=V.user;
  if(!V.dir[user])return bad('LNK',53,user+' NOT IN CP DIRECTORY');
  src=vaddr(src);to=vaddr(to);
  if(!src||!to)return bad('LNK',22,'VADDR MISSING OR INVALID');
  if(!/^(R|RR|W|WR|M|MR|MW)$/.test(mode))return bad('LNK',26,'OPERAND MISSING OR INVALID');
  var disk=V.disks[user+' '+src];
  if(!disk){err('DMKLNK107E '+user+' '+src+' NOT LINKED; NOT IN CP DIRECTORY');return 107}
  if(V.devs[to]&&V.devs[to].disk===disk)return 0;
  if(V.devs[to]){err('DMKLNK110E DASD '+to+' NOT LINKED; '+(V.devs[to].kind==='DASD'?'DASD':V.devs[to].kind)+' '+to+' ALREADY DEFINED');return 110}
  var write=/^[WM]/.test(mode),pw=write?(mode.charAt(0)==='M'?disk.mpass:disk.wpass):disk.rpass;
  function done(){
    var rw=write?'R/W':'R/O',by=Object.keys(V.devs).filter(function(k){return V.devs[k].disk===disk&&V.devs[k].rw==='R/W'}).length?V.user:V.dir[disk.owner].on&&disk.owner!=='MAINT'?disk.owner:null;
    if(write&&by){err('DMKLNK101W DASD '+to+' FORCED R/O; R/W BY '+by);rw='R/O'}
    else if(!write&&by)P.typeLine('DASD '+to+' LINKED R/O; R/W BY '+by);
    V.devs[to]={kind:'DASD',disk:disk,rw:rw,link:user+' '+src};
  }
  if(user===V.user||pw==='ALL'){done();return 0}
  if(!pw){err('DMKLNK113E '+user+' '+src+' NOT LINKED; NO '+(write?'WRITE':'READ')+' PASSWORD');return 113}
  if(w[pi]!==undefined){if(up(w[pi])!==pw){err('DMKLNK114E '+user+' '+src+' NOT LINKED; PASSWORD INCORRECT');return 114}done();return 0}
  P.typeLine('ENTER '+(write?(mode.charAt(0)==='M'?'MULT':'WRITE'):'READ')+' PASSWORD:');
  P.typeLine('XXXXXXXX');
  V.ask(function(l){
    if(l===null||l===P.INT)return;
    if(up(l.trim())!==pw){err('DMKLNK114E '+user+' '+src+' NOT LINKED; PASSWORD INCORRECT');V.rc=114;return}
    done();
  },true,true);
  return 0;
};
CP.DETACH=function(a){
  if(!a[0])return bad('VDD',22,'VADDR MISSING OR INVALID');
  var k=vaddr(a[0]);
  if(!k)return bad('VDD',22,'VADDR MISSING OR INVALID');
  var d=V.devs[k];
  if(!d)return bad('VDD',40,'DEV '+k+' DOES NOT EXIST');
  if(V.release)V.release(k);
  delete V.devs[k];
  P.typeLine((d.kind==='DASD'?'DASD':d.kind)+' '+k+' DETACHED');
  return 0;
};
CP.DEFINE=function(a,w,line,from){
  var t=a[0]||'',k=a[1]==='AS'?a[2]:a[1];
  if(!t)return bad('DEF',26,'OPERAND MISSING OR INVALID');
  if(t==='STORAGE'||t==='STOR'){
    var s=a[a.length-1]||'',m=s.match(/^(\d+)([KM])$/);
    if(!m)return bad('DEF',26,'OPERAND MISSING OR INVALID');
    V.stor=m[1]+m[2];
    P.typeLine('STORAGE = '+V.storage());
    if(V.state==='cms')V.reset(); /* a system reset: what was running stops */
    return 0;
  }
  var tm=t.match(/^T(3330|3340|3350|2314)$/);
  if(tm){
    k=vaddr(k);
    if(!k)return bad('DEF',22,'VADDR MISSING OR INVALID');
    if(V.devs[k]){err('DMKDEF092E DEV '+k+' NOT DEFINED; DASD '+k+' ALREADY DEFINED');return 92}
    var cyl=+(a[a.length-1])||0;
    if(!(cyl>=1&&cyl<=10)){err('DMKDEF091E DASD '+k+' NOT DEFINED; TEMP SPACE NOT AVAILABLE');return 91}
    var d=new V.Disk({owner:V.user,vaddr:k,label:'',cyl:cyl,type:tm[1]});d.unformatted=true;
    V.devs[k]={kind:'DASD',disk:d,rw:'R/W',temp:true};
    P.typeLine('DASD '+k+' DEFINED '+z(cyl,4)+' CYL');
    return 0;
  }
  return bad('DEF',26,'OPERAND MISSING OR INVALID');
};
CP.INDICATE=function(a){
  if(a[0]==='USER'){P.say(['PAGES: RES-0183 WS-0091 READS=000090 WRITES=000000 DISK-0000 DRUM-0000','VTIME=000:00 TTIME=000:01 SIO=004473 RDR-000000 PRT-000005 PCH-000000']);return 0}
  P.typeLine('CPU-0'+(20+Math.floor(Math.random()*50))+'%  APU-000%  Q1-0'+Math.floor(Math.random()*4)+'  Q2-00  STORAGE-0'+(60+Math.floor(Math.random()*30))+'%  RATIO-01.'+Math.floor(Math.random()*6));
  return 0;
};
CP.SLEEP=function(a){var n=parseInt(a[0],10)||0;if(n)P.pause(Math.min(30,n)*(/^MIN/.test(a[1]||'')?6e4:1e3));return 0};
CP.ECHO=CP.READY=CP.NOTREADY=CP.REWIND=CP.TAG=CP.RESET=CP.EXTERNAL=CP.REQUEST=CP.TRACE=CP.STORE=CP.DUMP=CP.LOADVFCB=CP.COUPLE=CP.ATTACH=function(){return 0};
CP.DISPLAY=function(a){
  var w=a[0]||'';
  if(w==='PSW'){P.typeLine('PSW = 000E0000 00020CA2');return 0}
  if(/^G/.test(w)){P.typeLine('GPR  0 =  00000000  00000002  00020CA0  00000000');return 0}
  P.typeLine('000000  00080000 00020CA2 00000000 00000000  *................*');return 0;
};
CP.SYSTEM=function(a){
  if(a[0]==='CLEAR'||a[0]==='RESET'){V.reset();return 0}
  return bad('CFC',26,'OPERAND MISSING OR INVALID');
};
CP.BEGIN=function(){
  if(V.state!=='cms'||!V.acc){V.halted();return 0}
  V.cpMode=false;
  if(V.cpReady){V.cpReady=false;V.ready(0)}
  return 0;
};
CP.IPL=function(a){
  var w=a[0]||'';
  if(!w)return bad('CFG',26,'OPERAND MISSING OR INVALID');
  if(w==='CMS'||w==='190'){V.ipl();return 0}
  var k=vaddr(w);
  if(k&&!V.devs[k]){bad('CFG',40,'DEV '+k+' DOES NOT EXIST');V.halted('00020000');return 40}
  if(k){V.halted();return 0}
  err('DMKCFG030E SYSTEM '+w+' DOES NOT EXIST');return 30;
};
CP.DISCONN=function(){V.logoff(true);return 0};
CP.LOGOFF=CP.LOGOUT=function(){V.logoff(false);return 0};
CP.DIAL=function(){err('DMKDIA045E DIAL NOT AVAILABLE');return 45};
CP.WARNING=CP.WNG=function(a,w,line){
  if(!a[0])return bad('WRN',20,'USERID MISSING OR INVALID');
  var text=up(line.trim().replace(/^\S+\s+\S+\s?/,''));
  if(a[0]==='ALL')return V.toAll('WNG',text);
  if(a[0]===V.user){V.msgFrom(V.user,text,'WNG');return 0}
  if(!V.others().some(function(x){return x[0]===a[0]}))return bad('WRN',45,a[0]+' NOT LOGGED ON');
  return 0;
};
CP.FORCE=function(a){
  var u=a[0];
  if(!u)return bad('CPU',20,'USERID MISSING OR INVALID');
  if(u===V.user){V.logoff(false,true);return 0}
  if(!V.others().some(function(x){return x[0]===u}))return bad('CPU',45,u+' NOT LOGGED ON');
  return 0;
};
CP.SHUTDOWN=function(){V.shutdown();return 0};
V.halted=function(psw){ /* the virtual machine stopped, and CP has the terminal */
  P.typeLine('DMKDSP450W CP ENTERED; DISABLED WAIT PSW \'00020000 '+(psw||'00000000')+'\'');
  V.state='cp';V.cpMode=true;V.acc=null;
  P.typeLine('CP');
};

/* ---------- what CP prints at LOGON and LOGOFF ---------- */
V.logmsg=function(head){ /* the log messages: the operator's, then the site's welcome; a * line is shown at logon */
  var t=V.lmTime,L=head?['LOGMSG - '+V.hms(t)+' '+V.zone()+' '+DAYS[t.getDay()]+' '+V.mdy(t)]:[];
  if(V.lmLines)return L.concat(V.lmLines.filter(function(x){return !head||/^\*/.test(x)}));
  L.push('*VISITORS: LOGON GUEST, PASSWORD GUEST');
  L.push('*THE NEW USER DIRECT IS ON MAINT 191. LINK RR TO CHECK YOUR ENTRY.');
  (V.welcome||[]).forEach(function(l){
    var x=P.lineOf(l);
    L.push(['*'+String(x[0]),x[1]||'',Object.assign({},x[2]||{})]);
  });
  return L;
};
V.logonLines=function(n){
  var L=V.logmsg(true);
  if(V.user==='MAINT')L=['DASD 190 LINKED R/W; R/O BY 002 USERS','DASD 19E LINKED R/W; R/O BY 001 USERS'].concat(L);
  if(V.rdr.length||V.prtFiles.length||V.punFiles.length)L.push(V.filesLine());
  L.push('LOGON AT '+V.stamp(n));
  return L;
};
V.logonAs=function(user,at){ /* a logon accepted: the machine, the letter in the guest's reader, and what CP says */
  V.newMachine(user);if(at)V.logon=at;
  if(user==='GUEST'){var f=V.letterFile();if(f&&!V.letterGone)V.arrive(f,true)}
  P.say(V.logonLines(V.logon));
};
V.logoff=function(dsc,forced){
  var n=P.now();
  P.typeLine(V.usage(n));
  P.typeLine((dsc?'DISCONNECT AT ':'LOGOFF AT ')+V.stamp(n));
  V.ending();
  V.state='online';V.user=null;V.cls='';V.cpMode=false;V.stack=[];
  P.pause(700);
  P.queue(function(){P.typeLine('');P.typeLine('VM/370 ONLINE')});
};
V.shutdown=function(){
  V.ending();
  P.powerOff(['DMKCKP960I SYSTEM WARM START DATA SAVED','DMKCKP961W SYSTEM SHUTDOWN COMPLETE']);
};

/* ---------- before anyone logs on, CP takes only LOGON, DIAL and MSG ---------- */
V.online=function(raw){
  var W=V.lineEdit(raw)[0].trim().split(/\s+/).filter(Boolean),w=up(W[0]||'');
  if(!w)return;
  var c=V.lookup([['LOGON',1],['LOGIN',5],['DIAL',4],['MSG',3],['MESSAGE',1]],w);
  if(c==='DIAL'){P.typeLine('DMKDIA045E DIAL NOT AVAILABLE','err');return}
  if(c==='MSG'||c==='MESSAGE'){var to=up(W[1]||'');if(to&&!V.dir[to])P.typeLine('DMKMSG045E '+to+' NOT LOGGED ON','err');return}
  if(!c&&V.cpName(w)){P.typeLine('DMKCFC001E ?CP: '+w,'err');return}
  if(!c){P.typeLine('RESTART');return}
  var user=up(W[1]||'');
  if(!user||!/^[A-Z0-9$#@]{1,8}$/.test(user)){P.typeLine('DMKLOG020E USERID MISSING OR INVALID','err');return}
  function go(pw){
    if(pw===null||pw===P.INT)return;
    pw=up(String(pw).trim());
    var d=V.dir[user];
    if(!d){P.typeLine('DMKLOG053E '+user+' NOT IN CP DIRECTORY','err');return}
    if(pw!==d.pw||d.pw==='NOLOG'){P.pause(900);P.typeLine('DMKLOG050E PASSWORD INCORRECT','err');return}
    if(d.on&&d.on!=='DSC'){P.typeLine('DMKLOG054E ALREADY LOGGED ON LINE '+d.on,'err');return}
    V.logonAs(user);
    V.ipl();
  }
  if(W[2]){go(W[2]);return}
  P.typeLine('ENTER PASSWORD:');
  P.typeLine('XXXXXXXX'); /* the mask a typewriter strikes for the password to be typed over */
  V.ask(go,true,true);
};

/* ---------- a line as CP's line editing reads it ---------- */
V.ask=function(then,trap,hidden){
  P.ask('',function(l){
    if(l===null||l===P.INT){then(l);return}
    then(V.lineEdit(l,true)[0]);
  },trap,hidden);
};
V.lineEdit=function(s,one){ /* logical lines: the line end splits them, the character delete takes one back, the line delete
                              drops what came before it, the escape makes the next character plain */
  var T=V.term||TERM0,L=[],o='';
  for(var i=0;i<s.length;i++){
    var c=s.charAt(i);
    if(T.escape&&c===T.escape&&i+1<s.length){o+=s.charAt(++i);continue}
    if(T.chardel&&c===T.chardel){o=o.slice(0,-1);continue}
    if(T.linedel&&c===T.linedel){o='';continue}
    if(!one&&T.linend&&c===T.linend){L.push(o);o='';continue}
    o+=c;
  }
  L.push(o);
  return L;
};
});
