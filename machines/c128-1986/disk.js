/* PHOSPHOR-9 terminal: machine "c128-1986", the 1571 disk drive, unit 8. One double-sided disk: 1328 blocks
   of 254 bytes, files in the order they were written, the drive's status messages and its command channel.
   What the visitor writes is kept in this browser (P.save); the files the disk came with are made afresh at
   each power-on, so a new game in a new release turns up on an old disk.
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE. */
(function(P){
'use strict';
var C=P.c128=P.c128||{};
var BLOCKS=1328,KEY='c128/disk';
var MSG={0:' OK',1:' FILES SCRATCHED',20:'READ ERROR',21:'READ ERROR',26:'WRITE PROTECT ON',30:'SYNTAX ERROR',31:'SYNTAX ERROR',
  32:'SYNTAX ERROR',33:'SYNTAX ERROR',34:'SYNTAX ERROR',39:'SYNTAX ERROR',60:'WRITE FILE OPEN',61:'FILE NOT OPEN',
  62:' FILE NOT FOUND',63:' FILE EXISTS',64:'FILE TYPE MISMATCH',70:'NO CHANNEL',72:'DISK FULL',73:'CBM DOS V3.0 1571'};
function b64(u){return btoa(str(u))}
function unb64(s){var t=atob(s),u=new Uint8Array(t.length);for(var i=0;i<t.length;i++)u[i]=t.charCodeAt(i);return u}
function bytes(s){var u=new Uint8Array(s.length);for(var i=0;i<s.length;i++)u[i]=s.charCodeAt(i)&255;return u}
function str(u){var s='';for(var i=0;i<u.length;i++)s+=String.fromCharCode(u[i]);return s}
function blocks(f){return Math.max(1,Math.ceil(f.data.length/254))}
function Drive(factory,store){
  this.store=store||{load:function(){return null},save:function(){}};
  this.factory=factory||{name:'',id:'',files:[]};
  this.status=[0,0,0];this.channels={};
  this.mount();
}
var D=Drive.prototype;
D.mount=function(){ /* the disk as it was left: the files it came with, less what was scratched, plus what was written */
  var s=this.store.load(KEY),ok=s&&typeof s==='object'&&Array.isArray(s.files)&&Array.isArray(s.gone);
  this.name=ok&&typeof s.name==='string'?s.name.slice(0,16):this.factory.name;
  this.id=ok&&typeof s.id==='string'?s.id.slice(0,2):this.factory.id;
  var gone=ok?s.gone.filter(function(x){return typeof x==='string'}):[],mine=[];
  if(ok)s.files.forEach(function(f){
    if(!Array.isArray(f)||typeof f[0]!=='string'||!/^(PRG|SEQ|USR)$/.test(f[1])||typeof f[2]!=='string')return;
    try{mine.push({name:f[0].slice(0,16),type:f[1],data:unb64(f[2]),order:+f[3]||0})}catch(e){}
  });
  var names={};mine.forEach(function(f){names[f.name]=1});
  this.files=this.factory.files.filter(function(f){return gone.indexOf(f.name)<0&&!names[f.name]}).map(function(f,i){return Object.assign({factory:true,order:-1000+i},f)})
    .concat(mine).sort(function(a,b){return a.order-b.order});
  this.gone=gone;
  this.holes=ok&&Array.isArray(s.holes)?s.holes.filter(function(x){return typeof x==='number'}):[]; /* directory slots scratched files left, filled first */
};
D.keep=function(){ /* everything that differs from the disk as it came */
  this.store.save(KEY,{name:this.name,id:this.id,gone:this.gone,holes:this.holes,
    files:this.files.filter(function(f){return !f.factory}).map(function(f){return [f.name,f.type,b64(f.data),f.order]})});
};
D.free=function(){var u=0;this.files.forEach(function(f){u+=blocks(f)});return Math.max(0,BLOCKS-u)};
D.set=function(code,t,s){this.status=[code,t||0,s||0];return code};
D.ds=function(){var m=MSG[this.status[0]]||'';return String(this.status[0]).padStart(2,'0')+','+m+','+String(this.status[1]).padStart(2,'0')+','+String(this.status[2]).padStart(2,'0')};
function matcher(pat){ /* CBM wildcards: * ends the pattern, ? is any one character */
  return function(name){
    for(var i=0;i<pat.length;i++){
      var c=pat.charAt(i);
      if(c==='*')return true;
      if(i>=name.length)return false;
      if(c!=='?'&&c!==name.charAt(i))return false;
    }
    return name.length===pat.length;
  };
}
D.parse=function(spec){ /* "0:NAME,S,W" into {name,type,mode,at} */
  var m=/^(@)?(?:([01]?):)?([^,]*)(?:,([^,]*))?(?:,([^,]*))?$/.exec(spec)||[null,'',null,spec];
  var t=(m[4]||'').charAt(0),w=(m[5]||'').charAt(0);
  if(!w&&/^[RWAM]$/.test(t)&&!m[5]){w=t;t=''}
  return {at:!!m[1],name:m[3],type:t==='S'?'SEQ':t==='P'?'PRG':t==='U'?'USR':t==='L'?'REL':'',mode:w||'R'};
};
D.find=function(name,type){
  var f=matcher(name);
  for(var i=0;i<this.files.length;i++){var x=this.files[i];if(f(x.name)&&(!type||x.type===type))return x}
  return null;
};
D.named=function(name){ /* the file of exactly this name */
  var x=null;this.files.forEach(function(f){if(f.name===name)x=f});return x;
};
D.load=function(spec){ /* bytes of a program, or null with the status set */
  if(spec.charAt(0)==='$'){this.set(0);return this.dirPrg(spec.slice(1).replace(/^[01]?:/,''))}
  var p=this.parse(spec);
  if(!p.name){this.set(34);return null}
  var f=this.find(p.name,'');
  if(!f){this.set(62);return null}
  if(f.prot){this.set(21,18,4);return null}
  this.set(0);return f.data;
};
D.write=function(name,type,data,replace){ /* a whole file; false with the status set if it cannot be */
  if(!name||/[*?,:=]/.test(name)){this.set(name?33:34);return false}
  name=name.slice(0,16);
  var ex=this.named(name);
  if(ex&&!replace){this.set(63);return false}
  if(ex&&ex.prot){this.set(26);return false}
  if(blocks({data:data})>this.free()+(ex?blocks(ex):0)){this.set(72,36,0);return false}
  if(ex){
    ex.type=type;ex.data=data;
    if(ex.factory){delete ex.factory;this.gone.push(name)}
  }
  else{
    var order=this.holes.length?this.holes.shift():this.files.reduce(function(m,f){return Math.max(m,f.order)},0)+1;
    this.files.push({name:name,type:type,data:data,order:order});
    this.files.sort(function(a,b){return a.order-b.order});
  }
  this.set(0);this.keep();return true;
};
D.scratch=function(pats){
  var n=0,self=this;
  pats.forEach(function(p){
    var f=matcher(self.parse(p).name);
    self.files=self.files.filter(function(x){
      if(!f(x.name)||x.prot)return true;
      n++;if(x.factory&&self.gone.indexOf(x.name)<0)self.gone.push(x.name);
      self.holes.push(x.order);
      return false;
    });
  });
  this.holes.sort(function(a,b){return a-b});
  this.set(1,n);this.keep();return n;
};
D.rename=function(to,from){
  to=to.slice(0,16);
  if(!to||/[*?,:=]/.test(to))return this.set(to?33:34);
  if(this.named(to))return this.set(63);
  var f=this.named(from);
  if(!f)return this.set(62);
  if(f.prot)return this.set(26);
  if(f.factory){delete f.factory;this.gone.push(from)}
  f.name=to;this.set(0);this.keep();return 0;
};
D.copy=function(to,from){
  if(from.charAt(0)==='$')return this.set(62); /* the directory is not a file to copy */
  var f=this.load(from);
  if(!f)return this.status[0];
  var src=this.find(this.parse(from).name,'');
  this.write(to,src.type,f.slice(),false);
  return this.status[0];
};
D.header=function(name,id){
  var self=this;
  this.files.forEach(function(f){if(f.factory&&self.gone.indexOf(f.name)<0)self.gone.push(f.name)});
  this.files=[];this.holes=[];this.name=name.slice(0,16);if(id)this.id=id.slice(0,2);
  this.set(0);this.keep();
};
D.command=function(cmd){ /* the command channel, 15 */
  var m;
  cmd=cmd.replace(/\r$/,'');
  if((m=/^S[01]?:(.*)$/.exec(cmd)))return this.scratch(m[1].split(','));
  if((m=/^R[01]?:([^=]*)=(?:[01]?:)?(.*)$/.exec(cmd)))return this.rename(m[1],m[2]);
  if((m=/^C[01]?:([^=]*)=(?:[01]?:)?(.*)$/.exec(cmd)))return this.copy(m[1],m[2]);
  if((m=/^N[01]?:([^,]*)(?:,(..))?$/.exec(cmd))){this.header(m[1],m[2]);return 0}
  if(/^(I[01]?|V[01]?:?)$/.test(cmd)){this.set(0);return 0}
  if(/^U[J:I9]/.test(cmd)){this.set(73);return 73}
  if(cmd==='')return this.status[0];
  this.set(31);return 31;
};
/* the directory, as LOAD"$",8 gets it: a BASIC program at $0401 whose line numbers are the block counts */
D.dirLines=function(pat){
  var L=[[0,'\u0012"'+this.name.padEnd(16)+'" '+this.id+' 2A']],f=pat?matcher(pat):null;
  this.files.forEach(function(x){
    if(f&&!f(x.name))return;
    var b=blocks(x),q='"'+x.name+'"';
    L.push([b,' '.repeat(b<10?3:b<100?2:b<1000?1:0)+q.padEnd(18)+' '+x.type+(x.prot?'<':' ')]);
  });
  L.push([this.free(),'BLOCKS FREE.'+' '.repeat(13)]);
  return L;
};
D.dirPrg=function(pat){return C.linked(0x401,this.dirLines(pat).map(function(l){return {n:l[0],b:bytes(l[1])}}))};
/* channels 2-14: sequential files, read and written a byte at a time */
D.open=function(sa,spec){
  if(sa===15){if(spec)this.command(spec);this.channels[15]={cmd:true,out:''};return 0}
  if(spec==='$'){var d=this.dirPrg('');this.channels[sa]={data:d,at:0};this.set(0);return 0}
  var p=this.parse(spec),wr=p.mode==='W'||p.mode==='A'||(sa===1&&p.mode!=='R');
  if(sa===0)wr=false;
  if(!p.name){return this.set(34)}
  if(wr){
    var ex=this.find(p.name,'');
    var room=(this.free()+(ex&&(p.at||p.mode==='A')?blocks(ex):0))*254; /* what fits on the disk */
    if(p.mode==='A'){if(!ex)return this.set(62);this.channels[sa]={write:true,name:ex.name,type:ex.type,data:Array.from(ex.data),replace:true,room:room};return this.set(0)}
    if(ex&&!p.at)return this.set(63);
    this.channels[sa]={write:true,name:p.name,type:p.type||(sa===1?'PRG':'SEQ'),data:[],replace:p.at,room:room};
    return this.set(0);
  }
  var f=this.find(p.name,p.type);
  if(!f)return this.set(this.find(p.name,'')?64:62);
  if(f.prot)return this.set(21,18,4);
  this.channels[sa]={data:f.data,at:0};
  return this.set(0);
};
D.get=function(sa){ /* a byte, and whether it was the last: {b,eof}; null if nothing is open there */
  var ch=this.channels[sa];
  if(sa===15){var s=this.ds()+'\r';ch=ch||{};if(ch.at===undefined||ch.at>=s.length)ch.at=0;var b=s.charCodeAt(ch.at++),e=ch.at>=s.length;if(e){ch.at=0;this.set(0)}return {b:b,eof:e}}
  if(!ch||ch.write)return null;
  if(ch.at>=ch.data.length)return {b:13,eof:true,none:true};
  var x=ch.data[ch.at++];
  return {b:x,eof:ch.at>=ch.data.length};
};
D.put=function(sa,b){
  var ch=this.channels[sa];
  if(sa===15){ch=this.channels[15]=this.channels[15]||{cmd:true,out:''};if(b===13){this.command(ch.out);ch.out=''}else ch.out+=String.fromCharCode(b);return true}
  if(!ch||!ch.write)return false;
  if(ch.data.length>=ch.room){ch.full=true;this.set(72);return true} /* the disk is full: the byte is lost */
  ch.data.push(b);return true;
};
D.close=function(sa){
  var ch=this.channels[sa];
  delete this.channels[sa];
  if(sa===15){if(ch&&ch.out)this.command(ch.out);return}
  if(ch&&ch.write&&this.write(ch.name,ch.type,new Uint8Array(ch.data),ch.replace)&&ch.full)this.set(72);
};
D.closeAll=function(){var self=this;Object.keys(this.channels).forEach(function(k){if(+k!==15)self.close(+k)});this.channels={}};
C.Drive=Drive;C.bytes=bytes;C.blocks=blocks;
})(window.Phosphor);
