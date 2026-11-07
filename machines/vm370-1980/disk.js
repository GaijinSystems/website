/* PHOSPHOR-9 terminal: machine "vm370-1980", the minidisks. A CMS disk is a flat list of files named
   filename filetype, each a list of records, fixed (F) or variable (V) in length, on 800-byte blocks
   (Release 6's CMS format; the extended format came with VM/SP). The guest's 191 is kept in this browser:
   what the visitor writes, renames or erases is still there next time, and the files made from the site come
   back afresh at each logon unless the visitor has replaced or erased them. Every other disk starts again with
   the page.
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE. */
Phosphor.setup(function(P){
'use strict';
var V=P.vm=P.vm||{};
var KEY='vm370/guest191';
function up(s){return String(s).toUpperCase()}
V.up=up;

/* ---------- a disk ---------- */
function Disk(o){
  this.owner=o.owner;this.vaddr=o.vaddr;this.label=o.label;this.cyl=o.cyl||5;this.type=o.type||'3330';
  this.blksize=800;this.total=o.total||this.cyl*247; /* 800-byte blocks, thirteen to a 3330 track */this.files={};this.order=0;
  this.vol=o.vol||'VMSRES';this.rpass=o.rpass||'';this.wpass=o.wpass||'';this.mpass=o.mpass||'';this.keep=!!o.keep;
}
V.Disk=Disk;
var D=Disk.prototype;
D.key=function(fn,ft){return up(fn)+' '+up(ft)};
D.get=function(fn,ft){var k=this.key(fn,ft);return Object.prototype.hasOwnProperty.call(this.files,k)?this.files[k]:null};
D.list=function(){var F=this.files;return Object.keys(F).map(function(k){return F[k]})};
D.blocks=function(f){ /* data blocks, and a pointer block once a file has more than one */
  if(f.bin)return f.bin;
  var b=0;
  if(f.recfm==='F')b=f.lines.length*f.lrecl;
  else f.lines.forEach(function(l){b+=V.text(l).length+2});
  var n=Math.max(1,Math.ceil(b/this.blksize));
  return n>1?n+Math.ceil(n/256):n;
};
D.used=function(){var s=5,self=this;this.list().forEach(function(f){s+=self.blocks(f)});return Math.min(s,this.total)}; /* five for the label and the directory */
D.left=function(){return Math.max(0,this.total-this.used())};
D.put=function(f){ /* a file, new or replacing one of the same name: false if it would not fit */
  var old=this.get(f.fn,f.ft),need=this.blocks(f)-(old?this.blocks(old):0);
  if(need>this.left())return false;
  f.fn=up(f.fn);f.ft=up(f.ft);f.fm=f.fm||'1';
  if(!f.date)f.date=P.now();
  if(old){f.order=old.order;if(this.keep)forget(old)} /* a file the disk came with, replaced: the visitor's copy is the one now */
  else{var used={};this.list().forEach(function(x){used[x.order]=1});for(var n=1;used[n];n++);f.order=n} /* an erased file's slot is the next one used */
  this.files[this.key(f.fn,f.ft)]=f;
  if(this.keep)V.keepGuest();
  return true;
};
function forget(f){if(f.factory&&V.gone.indexOf(f.factory)<0)V.gone.push(f.factory)} /* a file the disk came with, gone: it does not come back */
D.remove=function(fn,ft){
  var f=this.get(fn,ft);if(!f)return;
  delete this.files[this.key(fn,ft)];
  if(this.keep){forget(f);V.keepGuest()}
};
D.rename=function(f,fn,ft,fm){
  delete this.files[this.key(f.fn,f.ft)];
  if(this.keep)forget(f);
  f.factory=null;f.fn=up(fn);f.ft=up(ft);if(fm)f.fm=fm;
  this.files[this.key(fn,ft)]=f;
  if(this.keep)V.keepGuest();
};

/* a record's text: a line may carry a colour or a link, from the site's own words */
V.text=function(l){return String(Array.isArray(l)?l[0]:l)};
V.lrecl=function(lines){var m=1;lines.forEach(function(l){m=Math.max(m,V.text(l).length)});return m};
V.file=function(fn,ft,lines,o){ /* a new file: V 80 unless told otherwise; F files are padded to their length */
  var f=Object.assign({fn:up(fn),ft:up(ft),fm:'1',recfm:'V',lrecl:0,lines:lines||[],date:null},o||{});
  if(f.recfm==='F'&&!f.lrecl)f.lrecl=80;
  if(f.recfm==='V'&&!f.bin)f.lrecl=Math.max(f.lrecl||0,V.lrecl(f.lines));
  return f;
};

/* ---------- names ---------- */
V.okName=function(s){return /^[A-Z0-9$#@+\-:_]{1,8}$/.test(up(s))};
function fold(s){return up(s).replace(/[^A-Z0-9$#@+\-:_]/g,'')}

/* ---------- the guest's own disk, kept in this browser ---------- */
V.gone=[];
V.formatGuest=function(){V.gone=['*'];V.keepGuest()}; /* the visitor formatted it: nothing the disk came with comes back */
V.keepGuest=function(){
  var d=V.guest191;if(!d)return;
  var mine=d.list().filter(function(f){return !f.factory}).map(function(f){
    var r=[f.fn,f.ft,f.fm,f.recfm,f.lrecl,f.lines.map(V.text),f.date?f.date.getTime():0];
    return f.prot?r.concat(1,f.bin||0):r; /* a locked site file the visitor renamed: still locked after a reload */
  });
  P.save(KEY,{gone:V.gone,files:mine});
};
function restore(d){ /* onto the guest's new, empty disk, with keep off */
  var s=P.saved(KEY);
  if(!s||typeof s!=='object'||!Array.isArray(s.files))return;
  V.gone=Array.isArray(s.gone)?s.gone.filter(function(x){return typeof x==='string'}):[];
  s.files.forEach(function(r){
    if(!Array.isArray(r)||!V.okName(r[0]||'')||!V.okName(r[1]||'')||!Array.isArray(r[5]))return;
    var lines=r[5].filter(function(x){return typeof x==='string'}).map(function(x){return x.slice(0,255)});
    var f=V.file(r[0],r[1],lines,{fm:/^[0-6]$/.test(r[2])?r[2]:'1',recfm:r[3]==='F'?'F':'V',lrecl:Math.min(255,Math.max(1,+r[4]||80)),date:new Date(+r[6]||P.now().getTime())});
    if(r[7]===1){f.prot=true;if(r[8]>0)f.bin=Math.min(+r[8],999)}
    d.put(f);
  });
};

/* ---------- the site's words as files on the guest's A-disk ---------- */
var TYPES={txt:'TEXT',c:'C',h:'H',md:'MEMO',doc:'DOCUMENT',bak:'BACKUP',sh:'EXEC',s:'ASSEMBLE',asm:'ASSEMBLE',f:'FORTRAN',for:'FORTRAN',pl1:'PLI',cob:'COBOL',bas:'BASIC'};
V.siteName=function(path){ /* notes/todo becomes TODO NOTES, src/hello.c HELLO C, attic ATTIC MEMO */
  var p=String(path).replace(/^\/+/,'').split('/'),base=p.pop(),dir=p.pop()||'',dot=base.lastIndexOf('.');
  var fn=fold(dot>0?base.slice(0,dot):base).slice(0,8),ext=dot>0?base.slice(dot+1).toLowerCase():'';
  var ft=ext?(TYPES[ext]||fold(ext).slice(0,8)):dir?fold(dir).slice(0,8):'MEMO';
  return fn&&ft?[fn,ft]:null;
};
V.factory=function(d,fn,ft,lines,o){ /* a file the disk comes with: unless the visitor erased or replaced it */
  var k=up(fn)+' '+up(ft);
  if(d.keep&&(V.gone.indexOf(k)>=0||V.gone.indexOf('*')>=0))return null;
  if(d.get(fn,ft))return null; /* the visitor's own copy, kept from an earlier visit, wins */
  var f=V.file(fn,ft,lines,Object.assign({factory:k,date:P.systemDate},o||{}));
  var was=d.keep;d.keep=false;d.put(f);d.keep=was;
  return f;
};

V.setupDisks=function(){
  var pr=P.profile,owner=V.owner;
  V.disks={};
  function disk(o){var d=new Disk(o);V.disks[o.owner+' '+o.vaddr]=d;return d}
  var s=disk({owner:'MAINT',vaddr:'190',label:'CMS190',cyl:41,rpass:'ALL',wpass:'WRITE',mpass:'MULT'});
  V.sysDisk(s);
  var y=disk({owner:'MAINT',vaddr:'19E',label:'MNT19E',cyl:10,rpass:'ALL',wpass:'WRITE',mpass:'MULT'});
  V.yDisk(y);
  var m=disk({owner:'MAINT',vaddr:'191',label:'MNT191',cyl:5,rpass:'ALL',wpass:'WRITE',mpass:'MULT'});
  V.maintDisk(m);
  disk({owner:'OPERATOR',vaddr:'191',label:'OPR191',cyl:2,rpass:'READ',wpass:'WRITE',mpass:'MULT'});
  if(owner!=='OPERATOR'&&owner!=='MAINT'&&owner!=='GUEST')disk({owner:owner,vaddr:'191',label:owner.slice(0,3)+'191',cyl:10,vol:'VMPK01',rpass:'READ',wpass:'WRITE',mpass:'MULT'});
  var g=V.guest191=disk({owner:'GUEST',vaddr:'191',label:'GST191',cyl:5,rpass:'READ',wpass:'WRITE',mpass:'MULT',keep:true});
  g.keep=false;
  restore(g);
  g.keep=true;
  var seen={'PROFILE EXEC':1};
  V.factory(g,'PROFILE','EXEC',['&CONTROL OFF','ACCESS 19E Y/S'],{recfm:'F',lrecl:80});
  function site(path,lines){ /* a site file as one on the disk, once for each name it comes to */
    if(/(^|\/)\./.test(path)||path.charAt(0)==='/')return null; /* dot files are the Unix machines'; absolute paths are theirs too */
    var n=V.siteName(path);if(!n)return null;
    var k=n[0]+' '+n[1];if(seen[k])return null;seen[k]=1;
    return V.factory(g,n[0],n[1],lines);
  }
  (pr.files||[]).forEach(function(f){
    var h=site(f.name,(f.body||[]).slice());
    if(h&&V.isProt(f.name))h.prot=true;
  });
  (pr.protected||[]).forEach(function(p){
    var h=site(p.replace(/\/+$/,''),[]);
    if(h){h.prot=true;h.bin=3}
  });
};
V.isProt=function(path){
  var p=String(path).replace(/^\/+/,'');
  return (P.profile.protected||[]).some(function(x){x=x.replace(/^\/+/,'');return x===p||/\/$/.test(x)&&p.indexOf(x)===0});
};
});
