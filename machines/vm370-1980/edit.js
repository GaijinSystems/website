/* PHOSPHOR-9 terminal: machine "vm370-1980", EDIT, the CMS editor of Release 6, on a typewriter terminal: a
   current line, edit mode and input mode, and the subcommands that move, find, change, insert, delete and
   write. Every subcommand reads from the console stack first, so an EXEC can drive it.
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE.
   After the CMS Command and Macro Reference (GC20-1818), Section 3; the program is new. */
Phosphor.setup(function(P){
'use strict';
var V=P.vm=P.vm||{};
var up=V.up;
function out(s){P.typeLine(s)}
function err(s){V.em(s,'err')}
var V_TYPES=/^(EXEC|LISTING|FREEFORT|VSBDATA|SCRIPT|MEMO)$/;
var MIXED=/^(MEMO|SCRIPT)$/;
var XYMAX=9999; /* X n and Y n: as many repeats as anyone would sit through */
var SUB=[ /* subcommands and their shortest forms */
  ['ALTER',2],['AUTOSAVE',4],['BACKWARD',2],['BOTTOM',1],['CASE',4],['CHANGE',1],['CMS',3],['DELETE',3],['DOWN',2],['DSTRING',2],
  ['FILE',4],['FIND',1],['FMODE',2],['FNAME',2],['FORWARD',2],['GETFILE',1],['IMAGE',2],['INPUT',1],['LINEMODE',2],['LOCATE',1],
  ['LONG',4],['NEXT',1],['OVERLAY',1],['PRESERVE',3],['PROMPT',6],['QUIT',4],['RECFM',3],['RENUM',3],['REPEAT',3],['REPLACE',1],
  ['RESTORE',3],['REUSE',5],['SAVE',4],['SERIAL',3],['SHORT',5],['STACK',5],['TABSET',4],['TOP',3],['TRUNC',2],['TYPE',1],['UP',1],
  ['VERIFY',1],['X',1],['Y',1],['ZONE',1]
];

V.edit=function(a,o){
  if(a.length<2){err('DMSEDI054E INCOMPLETE FILEID SPECIFIED');return 24}
  var fn=a[0],ft=a[1],fm=a[2]||'',lrecl=0;
  if(a.length>3){err('DMSEDI003E INVALID OPTION \''+a[3]+'\'');return 24}
  if(fn==='*'||ft==='*'){err('DMSEDI062E INVALID * IN FILEID');return 20}
  for(var i=0;i<o.length;i++){
    if(o[i]==='LRECL'){var n=+o[++i];if(!(n>=1&&n<=160)){err('DMSEDI029E INVALID PARAMETER \''+(o[i]||'')+'\' IN THE OPTION \'LRECL\' FIELD');return 24}lrecl=n}
    else if(o[i]==='NODISP')continue;
    else{err('DMSEDI003E INVALID OPTION \''+o[i]+'\'');return 24}
  }
  if(!V.okName(fn)||!V.okName(ft)){err('DMSEDI062E INVALID CHAR IN FILEID');return 20}
  var r=V.find(fn,ft,fm||null),E;
  if(r&&r.f.prot&&!V.mayRead()){err('DMSEDI104S ERROR \'3\' READING FILE \''+V.fid(r.f,r.mode)+'\' FROM DISK');return 100}
  var mode=fm?fm.charAt(0):'A';
  if(r){var parent=r.acc.ext||r.mode;mode=fm?fm.charAt(0):parent}
  if(!V.acc[mode]){err('DMSEDI069E DISK \''+mode+'\' NOT ACCESSED');return 36}
  E={fn:fn,ft:ft,mode:mode,fmn:r?r.f.fm:(fm.charAt(1)||'1'),lines:r?r.f.lines.map(function(l){return Array.isArray(l)?l.slice():String(l)}):[],
    recfm:r?r.f.recfm:V_TYPES.test(ft)?'V':'F',lrecl:lrecl||(r?Math.max(r.f.lrecl,80):/^LISTING$/.test(ft)?121:/^(SCRIPT|VSBDATA)$/.test(ft)?132:80),
    cur:-1,verify:true,vcol:null,zone:[1,null],trunc:null,caseU:!MIXED.test(ft),long:true,last:null,changed:false,auto:0,since:0,isNew:!r,X:null,Y:null,saved:null};
  if(!E.lrecl)E.lrecl=80;
  E.zone[1]=E.lrecl;E.trunc=E.lrecl;
  if(/^(ASSEMBLE|MACRO|UPDATE)$/.test(ft))E.zone=[1,71];
  if(/^(COBOL|DIRECT|FORTRAN)$/.test(ft))E.zone=[1,72];
  if(E.isNew)out('NEW FILE:');
  out('EDIT:');
  loop(E);
  return 0;
};
var lineText=V.text;
function cur(E){return E.cur>=0&&E.cur<E.lines.length?lineText(E.lines[E.cur]):null}
function show(E){
  if(E.cur>=E.lines.length){out('EOF:');return} /* even with verify off, as the CMS User's Guide says */
  if(!E.verify)return;
  if(E.cur<0){out('TOF:');return}
  var t=lineText(E.lines[E.cur]);
  out(E.vcol?t.slice(0,E.vcol):t.replace(/\s+$/,''));
}
function fix(E,t){ /* a line as the file will hold it: the case, the truncation */
  if(E.caseU)t=up(t);
  if(t.length>E.trunc){out('TRUNCATED');t=t.slice(0,E.trunc);out(t)}
  return t;
}
/* attention (^C) at the editor's read: the edit carries on, as on Release 6, where only QUIT or FILE ends it.
   ^C while it types stops the typing, and the next line typed is still the editor's: V.edRead keeps its read for that */
function attn(l,again){if(l===P.INT){again();return true}return false}
function read(then){var r=function(l){if(V.edRead===r)V.edRead=null;then(l)};V.edRead=r;V.read(r,true)}
function loop(E){
  read(function(l){
    if(l===null||attn(l,function(){loop(E)}))return;
    var r=sub(E,l);
    if(r==='input'){input(E);return}
    if(r==='end')return;
    loop(E);
  });
}
function input(E){
  if(E.verify)out('INPUT:');
  (function more(){
    read(function(l){
      if(l===null||attn(l,more))return;
      if(l===''){if(E.verify)out('EDIT:');loop(E);return}
      ins(E,fix(E,l));
      more();
    });
  })();
}
function ins(E,t){if(E.cur>=E.lines.length)E.cur=E.lines.length-1;E.lines.splice(E.cur+1,0,t);E.cur++;changed(E)}
function changed(E){
  E.changed=true;
  if(E.auto&&++E.since>=E.auto){E.since=0;save(E,true)}
}
function inZone(E,t){return t.slice(E.zone[0]-1,E.zone[1])}
function delim(s){ /* /a/b/ into its parts, the delimiter being the first character */
  var d=s.charAt(0),p=s.slice(1).split(d);
  return {d:d,p:p};
}
function find(E,test,from){
  for(var i=from;i<E.lines.length;i++)if(test(lineText(E.lines[i])))return i;
  return -1;
}
function sub(E,raw){
  var l=raw.replace(/^\s+/,''),w=(l.match(/^[^\s\/]*/)||[''])[0],rest=l.slice(w.length).replace(/^ /,'');
  if(/^\d+$/.test(w)){ /* nnnnn: the line of that number in a line-numbered file */
    var n=+w;E.cur=Math.min(n,E.lines.length)-1;show(E);E.last=raw;return;
  }
  if(l==='?'){out(E.last||'');return}
  if(l.charAt(0)==='='){if(E.xy){bad(E,raw);return}var k=l.length-l.replace(/^=+/,'').length,again=l.replace(/^=+\s*/,'');
    if(again)sub(E,again);for(var j=0;j<k;j++){var x=sub(E,E.last||'');if(x)return x}return}
  if(l.charAt(0)==='/'){w='LOCATE';rest=l}
  var name=w?V.lookup(SUB,up(w)):null;
  if(!name){if(!l){show(E);return}bad(E,raw);return}
  if(name!=='REUSE')E.last=raw;
  var A=up(rest).trim().split(/\s+/).filter(Boolean),n1=A[0]==='*'?Infinity:A.length?parseInt(A[0],10):1;
  switch(name){
    case 'TOP':E.cur=-1;show(E);return;
    case 'BOTTOM':E.cur=E.lines.length-1;show(E);return;
    case 'NEXT':case 'DOWN':case 'FORWARD':
      if(isNaN(n1)){bad(E,raw);return}
      E.cur=Math.min(E.lines.length,E.cur+n1);show(E);return;
    case 'UP':case 'BACKWARD':
      if(isNaN(n1)){bad(E,raw);return}
      E.cur=Math.max(-1,E.cur-n1);show(E);return;
    case 'TYPE':
      if(isNaN(n1)){bad(E,raw);return}
      var m=A.length?n1:1,col=A[1]==='*'?null:A[1]?+A[1]:E.vcol;
      if(E.cur<0){out('TOF:');if(m>1){E.cur=0;m--}else return}
      if(E.cur>=E.lines.length){out('EOF:');return}
      for(var i=0;i<m&&E.cur<E.lines.length;i++){var t=lineText(E.lines[E.cur]);out(col?t.slice(0,col):t.replace(/\s+$/,''));if(i<m-1){if(E.cur>=E.lines.length-1)break;E.cur++}}
      if(m===Infinity){E.cur=E.lines.length;out('EOF:')}
      return;
    case 'LOCATE':{
      var s=delim(l.charAt(0)==='/'?l:rest.trim()),str=E.caseU?up(s.p[0]||''):(s.p[0]||'');
      if(!rest.trim()&&l.charAt(0)!=='/'){E.cur=Math.min(E.lines.length,E.cur+1);show(E);return}
      if(str.length>E.zone[1]-E.zone[0]+1){out('ZONE ERROR');return}
      var at=find(E,function(t){return inZone(E,t).indexOf(str)>=0},E.cur>=E.lines.length?0:E.cur+1);
      if(at<0){out('NOT FOUND');E.cur=E.lines.length;show(E);return}
      E.cur=at;show(E);return;}
    case 'FIND':{
      var f=raw.replace(/^\s*\S+ ?/,'');f=E.caseU?up(f):f;
      if(!f.trim()){E.cur=Math.min(E.lines.length,E.cur+1);show(E);return}
      var at2=find(E,function(t){for(var i=0;i<f.length;i++){var c=f.charAt(i);if(c!==' '&&c!==t.charAt(i))return false}return true},E.cur>=E.lines.length-1?0:E.cur+1);
      if(at2<0){E.cur=E.lines.length;out('NOT FOUND');out('EOF:');return}
      E.cur=at2;show(E);return;}
    case 'CHANGE':{
      var spec=rest.trim();
      if(!spec){bad(E,raw);return}
      var q=delim(spec),from=E.caseU?up(q.p[0]||''):(q.p[0]||''),to=E.caseU?up(q.p[1]||''):(q.p[1]||''),tail=(q.p.slice(2).join(q.d)||'').trim().toUpperCase().split(/\s+/).filter(Boolean);
      var cnt=tail[0]==='*'?Infinity:tail[0]?parseInt(tail[0],10):1,glob=tail[1]==='*'||tail[1]==='G';
      if(isNaN(cnt)){bad(E,raw);return}
      if(E.cur>=E.lines.length){out('NOT FOUND');out('EOF:');return}
      if(E.cur<0){E.cur=0;cnt--;if(!cnt||!E.lines.length){out('NOT FOUND');return}} /* the null line at the top counts as one */
      var hit=0;
      for(var c=0;c<cnt&&E.cur<E.lines.length;c++){
        var t3=lineText(E.lines[E.cur]),z0=E.zone[0]-1,z1=E.zone[1],head=t3.slice(0,z0),body=t3.slice(z0,z1),rest3=t3.slice(z1);
        if(from===''){body=to+body;hit++}
        else if(body.indexOf(from)>=0){body=glob?body.split(from).join(to):body.replace(from,to);hit++}
        else{if(c<cnt-1&&E.cur<E.lines.length-1){E.cur++;continue}break}
        var nt=(head+body+rest3).slice(0,E.trunc);
        E.lines[E.cur]=nt;
        if(E.verify)out(nt.replace(/\s+$/,''));
        if(c<cnt-1){if(E.cur<E.lines.length-1)E.cur++;else break}
      }
      if(!hit)out('NOT FOUND');else changed(E);
      if(cnt===Infinity){E.cur=E.lines.length;if(E.verify)out('EOF:')}
      return;}
    case 'ALTER':{
      var ch=A[0],c2=A[1];
      if(!ch||!c2){bad(E,raw);return}
      function hx(x){return x.length===2&&/^[0-9A-F]{2}$/.test(x)?String.fromCharCode(parseInt(x,16)>=64?32:63):x}
      ch=hx(ch);c2=hx(c2);
      if(E.cur<0||E.cur>=E.lines.length){out('NOT FOUND');return}
      var t4=lineText(E.lines[E.cur]);
      if(t4.indexOf(ch)<0){out('NOT FOUND');return}
      E.lines[E.cur]=A[2]==='G'||A[3]==='G'?t4.split(ch).join(c2):t4.replace(ch,c2);changed(E);show(E);return;}
    case 'INPUT':
      if(rest.length){ins(E,fix(E,rest.length>1&&!rest.trim()?'':rest));return}
      return 'input';
    case 'REPLACE':
      if(E.cur>=0&&E.cur<E.lines.length){E.lines.splice(E.cur,1);E.cur--;changed(E)}
      if(rest.length){ins(E,fix(E,rest));return}
      return 'input';
    case 'OVERLAY':{
      if(E.cur<0||E.cur>=E.lines.length){out('EOF:');return}
      var o=lineText(E.lines[E.cur]).split(''),ov=E.caseU?up(rest):rest;
      for(var i2=0;i2<ov.length;i2++){var cc=ov.charAt(i2);if(cc===' ')continue;if(cc==='_')cc=' ';while(o.length<=i2)o.push(' ');o[i2]=cc}
      E.lines[E.cur]=o.join('').slice(0,E.trunc);changed(E);show(E);return;}
    case 'DELETE':
      if(isNaN(n1)){bad(E,raw);return}
      if(E.cur<0)E.cur=0;
      if(E.cur>=E.lines.length){out('EOF:');return}
      var gone=Math.min(n1,E.lines.length-E.cur);
      E.lines.splice(E.cur,gone);changed(E);
      if(E.cur>=E.lines.length)out('EOF:');
      return;
    case 'DSTRING':{
      var ds=delim(rest.trim()),dstr=E.caseU?up(ds.p[0]||''):(ds.p[0]||''),end=find(E,function(t){return t.indexOf(dstr)>=0},E.cur+1);
      if(end<0){out('STRING NOT FOUND, NO DELETIONS MADE');return}
      if(E.cur<0)E.cur=0;
      E.lines.splice(E.cur,end-E.cur);changed(E);show(E);return;}
    case 'VERIFY':
      if(!A.length){out(String(1).padStart(4)+String(E.vcol||E.lrecl).padStart(4));return}
      if(A[0]==='ON'){E.verify=true;if(A[1])E.vcol=A[1]==='*'?null:+A[1];return}
      if(A[0]==='OFF'){E.verify=false;return}
      bad(E,raw);return;
    case 'ZONE':
      if(!A.length){out(String(E.zone[0]).padStart(4)+String(E.zone[1]).padStart(4));return}
      var z0n=A[0]==='*'?1:+A[0],z1n=A[1]===undefined||A[1]==='*'?E.lrecl:+A[1];
      if(!(z0n>=1&&z1n>=z0n&&z1n<=E.lrecl)){bad(E,raw);return}
      E.zone=[z0n,z1n];show(E);return;
    case 'TRUNC':
      if(!A.length){out(String(E.trunc).padStart(5));return}
      var tr=A[0]==='*'?E.lrecl:+A[0];
      if(!(tr>=1&&tr<=E.lrecl)){bad(E,raw);return}
      E.trunc=tr;return;
    case 'CASE':
      if(!A.length){out('CASE '+(E.caseU?'U':'M'));return}
      if(A[0]==='U'||A[0]==='M'){E.caseU=A[0]==='U';show(E);return}
      bad(E,raw);return;
    case 'RECFM':
      if(!A.length){out('RECFM '+E.recfm);return}
      if(A[0]==='F'||A[0]==='V'){E.recfm=A[0];return}
      bad(E,raw);return;
    case 'FNAME':
      if(!A.length){out('FNAME '+E.fn);return}
      if(!V.okName(A[0])){bad(E,raw);return}E.fn=A[0];return;
    case 'FMODE':
      if(!A.length){out('FMODE '+E.mode+E.fmn);return}
      if(!/^[A-Z][0-6]?$/.test(A[0])){bad(E,raw);return}E.mode=A[0].charAt(0);E.fmn=A[0].charAt(1)||E.fmn;return;
    case 'SERIAL':if(!A.length){bad(E,raw);return}return;
    case 'TABSET':if(!A.length)out('  1  6 11 16 21 26 31 36 41 46 51 61 71 81 91 101 111 121 131');return;
    case 'RENUM':if(!/^(VSBASIC|FREEFORT)$/.test(E.ft)){out('WRONG FILE FORMAT FOR RENUM');return}return;
    case 'IMAGE':case 'LINEMODE':case 'PROMPT':case 'REPEAT':return;
    case 'AUTOSAVE':
      if(!A.length){out('AUTOSAVE '+(E.auto||'OFF'));return}
      if(A[0]==='OFF'){E.auto=0;return}
      if(!(+A[0]>=1)){bad(E,raw);return}E.auto=+A[0];return;
    case 'SHORT':E.long=false;return;
    case 'LONG':E.long=true;return;
    case 'PRESERVE':E.saved={verify:E.verify,zone:E.zone.slice(),trunc:E.trunc,caseU:E.caseU,recfm:E.recfm};return;
    case 'RESTORE':if(E.saved)Object.assign(E,E.saved,{zone:E.saved.zone.slice()});return;
    case 'X':case 'Y':
      if(rest.trim()&&!/^\d+$/.test(rest.trim())){E[name]=rest.trim();return}
      if(!E[name]||E.xy){bad(E,raw);return} /* X or Y, or =, inside an X or Y's own repeats: DMSEDI's XYCNT says no */
      var times=Math.min(+rest.trim()||1,XYMAX),rr;
      E.xy=true;
      try{for(var k2=0;k2<times&&!rr;k2++){rr=sub(E,E[name]);if(E.cur<0||E.cur>=E.lines.length)break}} /* the top or the end of the file stops the repeats */
      finally{E.xy=false}
      return rr;
    case 'STACK': /* n lines from the current one, the last of them current after; 0 a null line; or a subcommand */
      if(rest.trim()&&!/^\d+$/.test(rest.trim())){V.stack.push(rest);return}
      var sn=rest.trim()?+rest.trim():1;
      if(!sn){V.stack.push('');return}
      if(sn>25){out('TOO MANY LINES TO STACK');return}
      if(E.cur<0){if(!--sn)return;E.cur=0} /* the top of the file counts as one */
      var sw=Math.min(E.trunc,130); /* as wide as TRUNC, and 130 at most */
      for(var s2=0;s2<sn&&E.cur<E.lines.length;s2++){V.stack.push(lineText(E.lines[E.cur]).slice(0,sw).padEnd(sw));if(s2<sn-1)E.cur++}
      if(E.cur>=E.lines.length)show(E);
      return;
    case 'GETFILE':{
      var g=V.find(A[0]||'',A[1]||E.ft,A[2]||'*');
      if(!g){out('FILE NOT FOUND');return}
      if(g.f.prot&&!V.mayRead()){err('DMSEDI104S ERROR \'3\' READING FILE \''+V.fid(g.f,g.mode)+'\' FROM DISK');return}
      var first=+A[3]||1,num=A[4]==='*'||!A[4]?Infinity:+A[4],G=g.f.lines.map(lineText).slice(first-1,num===Infinity?undefined:first-1+num);
      G.forEach(function(t){E.lines.splice(++E.cur,0,t)});changed(E);
      if(E.cur>=E.lines.length-1&&G.length)out('EOF REACHED');
      if(G.length)show(E);
      return;}
    case 'SAVE':
      if(A.length&&!rename(E,A))return;
      if(save(E,false)&&E.verify)out('EDIT:');return;
    case 'FILE':
      if(A.length&&!rename(E,A))return;
      if(!save(E,false))return;
      return 'end';
    case 'QUIT':
      return 'end';
    case 'CMS':
      out('CMS SUBSET');
      subset(E);
      return 'end';
    case 'REUSE':
      if(E.xy){bad(E,raw);return}
      return sub(E,E.last||'');
  }
  bad(E,raw);
}
function bad(E,raw){if(E.long)err('?EDIT: '+up(raw));else err('\u00ac')} /* SHORT: just the not sign */
function rename(E,A){
  if(!V.okName(A[0])||A[1]&&!V.okName(A[1])||A[2]&&!/^[A-Z][0-6]?$/.test(A[2])){err('?EDIT: INVALID FILEID');return false}
  E.fn=A[0];if(A[1])E.ft=A[1];if(A[2]){E.mode=A[2].charAt(0);E.fmn=A[2].charAt(1)||E.fmn}
  return true;
}
function save(E,auto){
  var A=V.acc[E.mode];
  if(!A||!A.rw){out('SET NEW FILEMODE AND RETRY');return false}
  if(!E.lines.length){
    A.disk.remove(E.fn,E.ft);
    if(auto)out('SAVED');
    return true;
  }
  var L=E.lines.map(function(l){return Array.isArray(l)?l:(E.recfm==='F'?String(l).slice(0,E.lrecl):String(l).replace(/\s+$/,''))});
  var f=V.file(E.fn,E.ft,L,{fm:E.fmn,recfm:E.recfm,lrecl:E.recfm==='F'?E.lrecl:0,date:P.now()});
  if(!V.write('EDI',E.mode,f))return false;
  E.changed=false;
  if(auto)out('SAVED');
  return true;
}
/* CMS SUBSET: a few CMS commands from inside the editor, then RETURN goes back to it */
function subset(E){
  read(function(l){
    if(l===null||attn(l,function(){subset(E)}))return;
    var w=up(l.trim()).split(/\s+/)[0]||'';
    if(w==='RETURN'){out('EDIT:');loop(E);return}
    if(w){
      var ok=/^(LISTFILE|L|TYPE|T|ERASE|ER|RENAME|REN|COPYFILE|COPY|STATE|QUERY|Q|SET|ACCESS|ACC|RELEASE|REL|CP|PRINT|PR|PUNCH|PU|SENTRIES)$/.test(w);
      if(!ok)err('DMSINT015E INVALID SUBSET COMMAND');
      else{var rc=V.command(l,{});V.ready(rc)}
    }
    subset(E);
  });
}
});
