/* PHOSPHOR-9 terminal: machine "cpm-1982", the commands of CP/M 2.2: DIR ERA REN TYPE USER SAVE
   from the console processor, and STAT PIP ED DUMP from disk. It has one answer to anything it
   does not know: the word again, and a question mark.
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE. */
(function(P){
'use strict';
var cmd=P.fcb.cmd,fcb=P.fcb.name;
var user=0,SIZE=486; /* a double-sided eight-inch disk */
function files(){return Object.keys(P.root.kids).sort().filter(function(k){var n=P.root.kids[k];return n.type!=='d'&&k.charAt(0)!=='.'&&(n.user||0)===user})}
function get(k){ /* a long name means its first eight and three, and so does a file kept under a longer name */
  var K=P.root.kids,c=P.fcb.cut(k),n=K[k]||K[c];
  if(!n){var j=Object.keys(K).filter(function(x){return P.fcb.cut(x)===c&&(K[x].user||0)===user})[0];n=j&&K[j]}
  return n&&(n.user||0)===user?n:undefined;
}
function write(k,L,full){ /* full: what to say when the name is another user area's (one name, one file here) */
  k=P.fcb.cut(k); /* a new file's name is cut to eight and three, as the FCB holds it */
  var o=P.root.kids[k];
  if(o&&!o.prot&&(o.user||0)!==user){P.typeLine(full||'NO DIRECTORY SPACE');return}
  if(!P.writeFile(k,L,false)){P.typeLine('BDOS ERR ON A: FILE R/O');return}
  var n=P.root.kids[k];
  if(n)n.user=user;
}
function matcher(pat){return P.fcb.matcher(pat.toLowerCase().replace(/^a:/,''))}
function bdos(d,why){ /* the classic: a drive that is not there, and a key, ctrl-c or any other, gets you out */
  P.typeLine('BDOS ERR ON '+d+': '+(why||'SELECT'));
  P.queue(function(){return P.readKey('')});
}
function elsewhere(x){ /* a name on a drive that is not there: the error, and true */
  var m=/^([b-p]):/i.exec(x||'');
  if(m)bdos(m[1].toUpperCase());
  return !!m;
}
function arg(w,i){return (w[i]||'').toLowerCase()}
function free(){ /* K left on the disk */
  var used=Object.keys(P.root.kids).filter(function(k){return P.root.kids[k].type!=='d'}).reduce(function(a,k){return a+Math.ceil((P.fsize(P.root.kids[k])||1)/1024)},0);
  return Math.max(0,SIZE-used);
}
function assign(raw){return raw.replace(/^\s*\S+\s*/,'').toLowerCase().match(/^(\S+)=(\S+)$/)} /* REN and PIP: NEW=OLD */
P.setup(function(){P.setPrompt(function(){return (user?user:'')+'A>'});P.env={}});

cmd(['dir'],'list files',function(a,raw,w){
  if(elsewhere(w[1]))return;
  var m=matcher(arg(w,1)||'*.*'),F=files().filter(m);
  if(!F.length){P.typeLine('NO FILE');return}
  P.say(P.chunk(F.map(function(k){return fcb(k)}),4).map(function(r){return 'A: '+r.join(' : ')}));
});
cmd(['type'],'print a file',function(a,raw,w){
  if(!w[1]){P.typeLine('TYPE?');return}
  if(elsewhere(w[1]))return;
  var n=get(arg(w,1).replace(/^a:/,''));
  if(!n||n.type==='d'||n.prot){P.typeLine('NO FILE');return}
  if(n.bin){P.typeLine('\u00c3\u0000\u00cd\u0005\u0000\u00c9');return}
  P.say(P.text(n));
});
function eraseAll(m){files().filter(m).forEach(function(k){var n=P.root.kids[k];if(!n.prot)delete P.root.kids[k]})}
cmd(['era'],null,function(a,raw,w){
  if(!w[1]){P.typeLine('ERA?');return}
  var pat=arg(w,1),m=matcher(pat);
  if(pat==='*.*'){
    P.ask('ALL (Y/N)?',function(l){if(l&&/^y/i.test(l.trim()))eraseAll(m)});
    return;
  }
  if(!files().filter(m).length){P.typeLine('NO FILE');return}
  eraseAll(m);
});
cmd(['ren'],null,function(a,raw,w){ /* backwards, as it should be: REN NEW=OLD */
  var q=assign(raw);
  if(!q||/[*?]/.test(q[1]+q[2])){P.typeLine((raw.trim()+'?').toUpperCase());return} /* no wildcards in either name */
  if(elsewhere(q[1])||elsewhere(q[2]))return;
  q=q.map(function(x){return x.replace(/^a:/i,'')});
  var n=get(q[2]),to=P.fcb.cut(q[1]);
  if(!n){P.typeLine('NO FILE');return}
  if(n.prot){P.typeLine('BDOS ERR ON A: FILE R/O');return}
  if(P.root.kids[to]){P.typeLine('FILE EXISTS');return} /* in any user area: one name, one file here */
  delete P.root.kids[n.name];n.name=to;P.root.kids[to]=n;
});
cmd(['user'],null,function(a,raw,w){
  var n=parseInt(w[1],10);
  if(isNaN(n)||n<0||n>15){P.typeLine((raw.trim()+'?').toUpperCase());return}
  user=n;
});
cmd(['save'],null,function(a,raw,w){
  if(!w[2]){P.typeLine((raw.trim()+'?').toUpperCase());return}
  write(arg(w,2),[],'NO SPACE');
});
cmd(['stat'],null,function(a,raw,w){
  if(elsewhere(w[1]))return;
  if(w[1]){
    var m=matcher(arg(w,1)),F=files().filter(m);
    if(!F.length){P.typeLine('File Not Found');return}
    P.say([' Recs  Bytes  Ext Acc'].concat(F.map(function(k){var sz=P.fsize(P.root.kids[k]);return String(Math.ceil(sz/128)).padStart(5)+String(Math.ceil(sz/1024)).padStart(6)+'k   1 R/W A:'+fcb(k).replace(/ +/,'.').replace(/\.$/,'')}),['Bytes Remaining On A: '+free()+'k']));
    return;
  }
  P.typeLine('A: R/W, Space: '+free()+'k');
});
cmd(['pip'],null,function(a,raw){ /* the one that moves everything: PIP DEST=SOURCE */
  var q=assign(raw);
  if(!q){P.typeLine('ERROR: NEEDS DEST=SOURCE');return}
  if(elsewhere(q[1])||elsewhere(q[2]))return;
  if(q[2]==='con:'){P.input([],function(L){write(q[1],L)});return}
  var n=get(q[2].replace(/^a:/,''));
  if(!n||n.type==='d'||n.prot){P.typeLine('NO FILE: =A:'+q[2].toUpperCase());return}
  if(q[1]==='con:'){P.say(P.text(n));return}
  write(q[1].replace(/^a:/,''),P.text(n));
});
cmd(['dump'],null,function(a,raw,w){
  if(!w[1]){P.typeLine('NO INPUT FILE PRESENT ON DISK');return}
  var n=get(arg(w,1));
  if(!n||n.type==='d'||n.prot){P.typeLine('NO INPUT FILE PRESENT ON DISK');return}
  var t=n.bin?'':P.text(n).join('\r\n')+'\r\n\u001a',L=[];
  for(var i=0;i<Math.min(t.length,2048);i+=16){
    var h=[];
    for(var j=0;j<16;j++)h.push((j+i<t.length?t.charCodeAt(j+i)&255:26).toString(16).toUpperCase().padStart(2,'0'));
    L.push(i.toString(16).toUpperCase().padStart(4,'0')+' '+h.join(' '));
  }
  P.say(L);
});
cmd(['ed'],null,function(a,raw,w){ /* a small ED: I to type (ctrl-z ends), #T to print, #A, #D, nL, E, Q */
  var name=arg(w,1);
  if(!name){P.typeLine('FILE NAME ERROR');return}
  var n=get(name),at=0;
  if(n&&n.prot){P.typeLine('NO FILE');return}
  var B=n?P.text(n):[];
  if(!n)P.typeLine('NEW FILE');
  (function loop(){
    P.ask('     : *',function(line){
      if(line===null)return loop();
      var c=line.trim().toUpperCase();
      if(c==='E'){write(name,B);return}
      if(c==='Q'){
        P.ask('Q-(Y/N)?',function(y){if(!y||!/^y/i.test(y))loop()});
        return;
      }
      if(c==='I'){
        (function more(){
          P.ask('',function(l){if(l===null){loop();return}B.splice(at,0,l);at++;more()});
        })();
        return;
      }
      if(c==='#T'||c==='T'){P.say(B);loop();return}
      if(c==='#A'||c==='A'){at=B.length;loop();return}
      if(c==='B'){at=0;loop();return}
      if(c==='#D'){B=[];at=0;loop();return}
      P.typeLine('BREAK "#" AT '+c.charAt(0));
      loop();
    });
  })();
});
P.stubs(['asm','ddt','load','movcpm','submit','sysgen','xsub'],function(n){
  P.typeLine(n.toUpperCase()+' VERS 2.2');P.typeLine('(this one wants a real processor to run on.)','dim');
},{noHelpFlag:true});
P.fallback=function(word){
  var w=word.toLowerCase();
  if(w==='a:')return true;
  if(/^[b-p]:$/.test(w)){bdos(w.charAt(0).toUpperCase());return true}
  var z=/^(?:a:)?(zork[12])$/.exec(w);
  if(z&&get(z[1]+'.com')){
    if(get(z[1]+'.dat'))P.zork.play(z[1]);
    else P.typeLine('NO FILE');
    return true;
  }
  P.typeLine(word.toUpperCase()+'?');
  return true;
};
})(window.Phosphor);
