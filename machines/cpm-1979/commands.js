/* PHOSPHOR-9 terminal: machine "cpm-1979", the commands of CP/M 2.2: DIR ERA REN TYPE USER SAVE
   from the console processor, and STAT PIP ED DUMP from disk. It has one answer to anything it
   does not know: the word again, and a question mark.
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE. */
(function(P){
'use strict';
function cmd(names,help,run){var d={names:names,noHelpFlag:true,run:run};if(help)d.help=help;P.command(d)}
var user=0,SIZE=241;
function files(){return Object.keys(P.root.kids).sort().filter(function(k){var n=P.root.kids[k];return n.type!=='d'&&k.charAt(0)!=='.'})}
function split(k){var i=k.lastIndexOf('.');return i>0?[k.slice(0,i),k.slice(i+1)]:[k,'']}
function fcb(k){var s=split(k);return s[0].slice(0,8).toUpperCase().padEnd(8)+' '+s[1].slice(0,3).toUpperCase().padEnd(3)}
function matcher(pat){
  var p=split(pat.toLowerCase().replace(/^a:/,'')),one=function(x,y){return new RegExp('^'+x.replace(/[.+^${}()|\\\[\]]/g,'\\$&').replace(/\*.*$/,'.*').replace(/\?/g,'.?')+'$').test(y)};
  return function(k){var s=split(k);return one(p[0],s[0])&&one(p[1],s[1])};
}
function bdos(d){ /* the classic: a drive that is not there, and only ctrl-c gets you out */
  P.typeLine('BDOS ERR ON '+d+': SELECT');
  P.queue(function(){return P.readKey('')});
}
function drive(x){var m=/^([b-p]):/i.exec(x||'');return m&&m[1].toUpperCase()}
function arg(w,i){return (w[i]||'').toLowerCase()}
function used(){return files().reduce(function(a,k){return a+Math.ceil((P.fsize(P.root.kids[k])||1)/1024)},0)}
P.setup(function(){P.setPrompt(function(){return (user?user:'')+'A>'});P.env={}});

cmd(['dir'],'list files',function(a,raw,w){
  if(drive(w[1])){bdos(drive(w[1]));return}
  var m=matcher(arg(w,1)||'*.*'),F=files().filter(m);
  if(!F.length){P.typeLine('NO FILE');return}
  var L=[],row=[];
  F.forEach(function(k){row.push(fcb(k));if(row.length===4){L.push('A: '+row.join(' : '));row=[]}});
  if(row.length)L.push('A: '+row.join(' : '));
  P.say(L);
});
cmd(['type'],'print a file',function(a,raw,w){
  if(!w[1]){P.typeLine('TYPE?');return}
  if(drive(w[1])){bdos(drive(w[1]));return}
  var n=P.root.kids[arg(w,1).replace(/^a:/,'')];
  if(!n||n.type==='d'||n.prot){P.typeLine('NO FILE');return}
  if(n.bin){P.typeLine('\u00c3\u0000\u0001\u00cd\u0005\u0000\u00c9');return}
  P.say(P.text(n));
});
function eraseAll(m){files().filter(m).forEach(function(k){var n=P.root.kids[k];if(!n.prot)delete P.root.kids[k]})}
cmd(['era'],null,function(a,raw,w){
  if(!w[1]){P.typeLine('ERA?');return}
  var pat=arg(w,1),m=matcher(pat);
  if(pat==='*.*'){
    var l;
    P.queue(function(){return P.readLine('ALL (Y/N)?').then(function(x){l=x})});
    P.queue(function(){if(l&&/^y/i.test(l.trim()))eraseAll(m)});
    return;
  }
  if(!files().filter(m).length){P.typeLine('NO FILE');return}
  eraseAll(m);
});
cmd(['ren'],null,function(a,raw,w){ /* backwards, as it should be: REN NEW=OLD */
  var q=raw.replace(/^\s*\S+\s*/,'').toLowerCase().match(/^(\S+)=(\S+)$/);
  if(!q){P.typeLine((raw.trim()+'?').toUpperCase());return}
  var n=P.root.kids[q[2]];
  if(!n){P.typeLine('NO FILE');return}
  if(P.root.kids[q[1]]){P.typeLine('FILE EXISTS');return}
  delete P.root.kids[q[2]];n.name=q[1];P.root.kids[q[1]]=n;
});
cmd(['user'],null,function(a,raw,w){
  var n=parseInt(w[1],10);
  if(isNaN(n)||n<0||n>15){P.typeLine((raw.trim()+'?').toUpperCase());return}
  user=n;
});
cmd(['save'],null,function(a,raw,w){
  if(!w[2]){P.typeLine((raw.trim()+'?').toUpperCase());return}
  P.writeFile(arg(w,2),[],false);
});
cmd(['stat'],null,function(a,raw,w){
  if(drive(w[1])){bdos(drive(w[1]));return}
  if(w[1]){
    var m=matcher(arg(w,1)),F=files().filter(m);
    if(!F.length){P.typeLine('FILE NOT FOUND');return}
    P.say([' RECS  BYTES  EXT ACC'].concat(F.map(function(k){var sz=P.fsize(P.root.kids[k]);return String(Math.ceil(sz/128)).padStart(5)+String(Math.ceil(sz/1024)).padStart(6)+'K   1 R/W A:'+fcb(k).replace(/ +/,'.').replace(/\.$/,'')}),['BYTES REMAINING ON A: '+Math.max(0,SIZE-used())+'K']));
    return;
  }
  P.typeLine('A: R/W, SPACE: '+Math.max(0,SIZE-used())+'K');
});
cmd(['pip'],null,function(a,raw){ /* the one that moves everything: PIP DEST=SOURCE */
  var q=raw.replace(/^\s*\S+\s*/,'').toLowerCase().match(/^(\S+)=(\S+)$/);
  if(!q){P.typeLine('ERROR: NEEDS DEST=SOURCE');return}
  if(drive(q[1])||drive(q[2])){bdos(drive(q[1])||drive(q[2]));return}
  if(q[2]==='con:'){P.input([],function(L){P.writeFile(q[1],L,false)});return}
  var n=P.root.kids[q[2].replace(/^a:/,'')];
  if(!n||n.type==='d'||n.prot){P.typeLine('NO FILE: =A:'+q[2].toUpperCase());return}
  if(q[1]==='con:'){P.say(P.text(n));return}
  P.writeFile(q[1].replace(/^a:/,''),P.text(n),false);
});
cmd(['dump'],null,function(a,raw,w){
  if(!w[1]){P.typeLine('NO INPUT FILE PRESENT ON DISK');return}
  var n=P.root.kids[arg(w,1)];
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
  var n=P.root.kids[name],B=n?P.text(n):[],line,at=0;
  if(!n)P.typeLine('NEW FILE');
  (function loop(){
    P.queue(function(){return P.readLine('     : *').then(function(l){line=l})});
    P.queue(function(){
      if(line===null)return loop();
      var c=line.trim().toUpperCase();
      if(c==='E'){P.writeFile(name,B,false);return}
      if(c==='Q'){
        var y;
        P.queue(function(){return P.readLine('Q-(Y/N)?').then(function(l){y=l})});
        P.queue(function(){if(!y||!/^y/i.test(y))loop()});
        return;
      }
      if(c==='I'){
        (function more(){
          var l;
          P.queue(function(){return P.readLine('').then(function(x){l=x})});
          P.queue(function(){if(l===null){loop();return}B.splice(at,0,l);at++;more()});
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
['asm','ddt','load','movcpm','submit','sysgen','xsub'].forEach(function(n){
  cmd([n],null,function(){P.typeLine(n.toUpperCase()+' VERS 2.2');P.typeLine('(this one wants a real 8080 to run on.)','dim')});
});
P.fallback=function(word){
  var w=word.toLowerCase();
  if(w==='a:')return true;
  if(/^[b-p]:$/.test(w)){bdos(w.charAt(0).toUpperCase());return true}
  P.typeLine(word.toUpperCase()+'?');
  return true;
};
})(window.Phosphor);
