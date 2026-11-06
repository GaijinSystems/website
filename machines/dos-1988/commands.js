/* PHOSPHOR-9 terminal: machine "dos-1988", the commands of MS-DOS 3.30.
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE. */
(function(P){
'use strict';

var cmd=P.fcb.cmd,split=P.fcb.split,short=P.fcb.name,matcher=P.fcb.matcher;
var FREE=21331968;
function dosPath(abs){return 'C:'+abs.replace(/\//g,'\\').toUpperCase()}
function args(words){return words.slice(1)}
function switches(a){return a.filter(function(x){return x.charAt(0)==='/'}).join('').toLowerCase()}
function names(a){return a.filter(function(x){return x.charAt(0)!=='/'})}
function shown(k,n){return !n.hidden&&k.charAt(0)!=='.'}
function rest(raw){return raw.replace(/^\s*\S+\s?/,'')} /* the line after the command word */
function stampD(d){return String(d.getMonth()+1).padStart(2)+'-'+P.p2(d.getDate())+'-'+P.p2(d.getFullYear()%100)}
function stampT(d){var h=d.getHours();return String(h%12||12).padStart(2)+':'+P.p2(d.getMinutes())+(h<12?'a':'p')}
var DAYS=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
var echoOn=true,promptStr='$P$G';

function currentPrompt(){
  return promptStr.replace(/\$(.)/g,function(m,c){
    c=c.toLowerCase();
    return {p:dosPath(P.st.cwd),g:'>',l:'<',b:'|',q:'=',n:'C',$:'$',t:'12:00:00.00',d:'',v:'Microsoft MS-DOS Version 3.30',_:' ',e:'',h:''}[c]||'';
  });
}
P.setup(function(){
  delete P.env.TERM;
  P.env.PATH='C:\\DOS';P.env.COMSPEC='C:\\COMMAND.COM';
  P.setPrompt(currentPrompt);
});

/* a drive that is not there: the most famous prompt in the world */
function notReady(drive,then){
  var again=function(){
    P.typeLine('');
    P.typeLine('Not ready error reading drive '+drive);
    var c;
    P.queue(function(){return P.readKey('Abort, Retry, Fail?',true).then(function(k){c=k.toLowerCase()})});
    P.queue(function(){
      if(c==='f'){P.typeLine('');P.typeLine('Current drive is no longer valid')}
      else if(c==='a'){if(then)then()}
      else again();
    });
  };
  again();
}
function floppy(s){ /* A: or B: named: the drive is asked, and the command goes no further */
  if(!/^[abAB]:/.test(s||''))return false;
  notReady(s.charAt(0).toUpperCase());
  return true;
}
function resolve(x){ /* what a DIR-style name means: a folder, a file or a pattern in a folder */
  var abs=P.norm(x||'.'),n=/[*?]/.test(abs)?null:P.find(abs,true);
  if(n&&n.type==='d')return {dir:n,pat:'*.*',at:abs};
  var i=abs.lastIndexOf('/'),dirAt=P.dirOf(abs),d=P.find(dirAt,true);
  return {dir:d&&d.type==='d'?d:null,pat:abs.slice(i+1),at:dirAt};
}
function entries(R){
  var m=matcher(R.pat);
  return Object.keys(R.dir.kids).sort().filter(function(k){return shown(k,R.dir.kids[k])&&m(k)});
}
function lookup(x){ /* a file by name, or by the eight and three a longer name is shown as */
  var n=P.find(x,true);if(n)return n;
  var abs=P.norm(x),d=P.find(P.dirOf(abs),true),c=P.fcb.cut(abs.slice(abs.lastIndexOf('/')+1));
  if(!d||d.type!=='d'||/[*?]/.test(c))return null;
  var k=Object.keys(d.kids).filter(function(k){return P.fcb.cut(k)===c})[0];
  return k?d.kids[k]:null;
}
function files(R){return entries(R).filter(function(k){return R.dir.kids[k].type!=='d'})}
function none(){P.typeLine('        0 File(s) copied')}

cmd(['dir'],'list files',function(a,raw,w){
  var sw=switches(args(w)),N=names(args(w));
  if(floppy(N[0]))return;
  var R=resolve(N[0]);
  if(!R.dir){P.typeLine('Path not found');return}
  if(R.pat.indexOf('.')<0)R.pat+='.*'; /* DIR README is DIR README.* */
  var E=entries(R),L=['',' Volume in drive C is FROBOZZ',' Directory of  '+dosPath(R.at),''];
  if(R.at!=='/')E=['.','..'].concat(E);
  if(!E.length){L.push('File not found');P.say(L);return}
  var row=[];
  E.forEach(function(k){
    var n=k==='.'||k==='..'?R.dir:R.dir.kids[k],sz=n.type==='d'?0:P.fsize(n);
    var nm=k==='.'||k==='..'?k.padEnd(12):short(k);
    if(/w/.test(sw)){
      row.push(nm.padEnd(15));
      return;
    }
    L.push(nm+(n.type==='d'?' <DIR>     ':String(sz).padStart(9)+'  ')+stampD(n.date).padStart(8)+'  '+stampT(n.date));
  });
  P.chunk(row,4).forEach(function(r){L.push(r.join(''))});
  L.push(String(E.length).padStart(9)+' File(s)'+String(FREE).padStart(10)+' bytes free');
  P.say(L);
});
cmd(['type'],'print a file',function(a,raw,w){
  var N=names(args(w));
  if(!N.length){P.typeLine('Required parameter missing');return}
  if(/[*?]/.test(N[0])){P.typeLine('Invalid filename or file not found');return}
  var n=lookup(N[0]);
  if(!n||n.type==='d'){P.typeLine('File not found');return}
  if(n.prot){P.typeLine('Access denied');return}
  if(n.bin){P.typeLine('MZ\u00901\u263a\u263b@\u00ff\u00ff\u00b8!L\u00cd!This program cannot be run on the glass.');return}
  P.say(P.text(n));
});
cmd(['cd','chdir'],'change directory',function(a,raw,w){
  var N=names(args(w));
  if(!N.length){P.typeLine(dosPath(P.st.cwd));return}
  var n=P.find(N[0],true);
  if(!n||n.type!=='d'){P.typeLine('Invalid directory');return}
  P.st.cwd=P.pathOf(n);
});
cmd(['md','mkdir'],null,function(a,raw,w){
  var N=names(args(w)),abs=N[0]&&P.norm(N[0]);
  if(!N.length){P.typeLine('Required parameter missing');return}
  if(P.find(abs,true)||!P.canWrite(abs)){P.typeLine('Unable to create directory');return}
  P.put(abs,'d',{owner:P.st.user,date:P.now()});
});
cmd(['rd','rmdir'],null,function(a,raw,w){
  var N=names(args(w)),n=N[0]&&P.find(N[0],true);
  if(!N.length){P.typeLine('Required parameter missing');return}
  if(!n||n.type!=='d'||n===P.root||Object.keys(n.kids).length||P.pathOf(n)===P.st.cwd){
    P.typeLine('Invalid path, not directory,');P.typeLine('or directory not empty');return;
  }
  delete n.parent.kids[n.name];
});
function del(pat){
  var R=resolve(pat);
  if(!R.dir){P.typeLine('Path not found');return}
  var E=files(R);
  if(!E.length){P.typeLine('File not found');return}
  E.forEach(function(k){
    var n=R.dir.kids[k];
    if(n.bin||n.prot)P.typeLine('Access denied - '+k.toUpperCase());
    else delete R.dir.kids[k];
  });
}
cmd(['del','erase'],null,function(a,raw,w){
  var N=names(args(w));
  if(!N.length){P.typeLine('Required parameter missing');return}
  var R=resolve(N[0]);
  if(R.pat==='*.*'){
    P.ask('Are you sure (Y/N)? ',function(line){if(line&&/^y/i.test(line.trim()))del(N[0])});
    return;
  }
  del(N[0]);
});
cmd(['ren','rename'],null,function(a,raw,w){
  var N=names(args(w));
  if(N.length<2){P.typeLine('Required parameter missing');return}
  var n=lookup(N[0]),to=P.fcb.cut(N[1].toLowerCase());
  if(!n||n.type==='d'){P.typeLine('File not found');return}
  if(n.bin||n.prot||n.parent.kids[to]||/^\.|[\\\/:*?]/.test(to)){P.typeLine('Duplicate file name or File not found');return} /* no wildcards, and no name that is all extension, like .. */
  delete n.parent.kids[n.name];
  n.name=to;n.parent.kids[to]=n;
});
cmd(['copy'],null,function(a,raw,w){
  var N=names(args(w));
  if(!N.length){P.typeLine('Required parameter missing');return}
  if(floppy(N[1]))return;
  var from=N[0].toLowerCase(),to=N[1]||split(from.replace(/^.*[\\\/]/,'')).join('.').replace(/\.$/,'');
  if(from===to.toLowerCase()){P.typeLine('File cannot be copied onto itself');none();return}
  function write(L){
    var d=P.find(to,true),at=(d&&d.type==='d'?P.norm(to)+'/'+from.replace(/^.*[\\\/]/,''):to).replace(/[^\\\/]*$/,P.fcb.cut); /* the new name, cut to eight and three */
    if(!P.writeFile(at,L,false)){P.typeLine('Access denied');none();return}
    P.typeLine('        1 File(s) copied');
  }
  if(from==='con'){ /* copy con: typed until ctrl-z */
    var got=[];
    P.queue(function(){
      return (function more(){return P.readLine().then(function(l){if(l===null)return;got.push(l);return more()})})();
    });
    P.queue(function(){write(got)});
    return;
  }
  var n=lookup(from);
  if(!n||n.type==='d'){P.typeLine('File not found - '+N[0].toUpperCase());none();return}
  if(n.prot){P.typeLine('Access denied');return}
  write(P.text(n));
});
cmd(['cls'],'clear the screen',function(){P.clear()});
cmd(['ver'],null,function(){P.say(['','Microsoft MS-DOS Version 3.30',''])});
cmd(['vol'],null,function(){P.say(['',' Volume in drive C is FROBOZZ',''])});
cmd(['date'],null,function(){
  var n=P.now();
  P.typeLine('Current date is '+DAYS[n.getDay()]+' '+P.p2(n.getMonth()+1)+'-'+P.p2(n.getDate())+'-'+n.getFullYear());
  (function ask(){
    P.ask('Enter new date (mm-dd-yy): ',function(line){if(line&&!/^\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}$/.test(line.trim())){P.typeLine('Invalid date');ask()}});
  })();
});
cmd(['time'],null,function(){
  var n=P.now();
  P.typeLine('Current time is '+String(n.getHours()).padStart(2)+':'+P.p2(n.getMinutes())+':'+P.p2(n.getSeconds())+'.00');
  (function ask(){
    P.ask('Enter new time: ',function(line){if(line&&!/^\d{1,2}(:\d{1,2}){0,2}(\.\d+)?$/.test(line.trim())){P.typeLine('Invalid time');ask()}});
  })();
});
cmd(['echo'],null,function(a,raw,w){
  var t=rest(raw);
  if(!t.trim()){P.typeLine('ECHO is '+(echoOn?'on':'off'));return}
  if(/^on$/i.test(t.trim())){echoOn=true;return}
  if(/^off$/i.test(t.trim())){echoOn=false;return}
  P.typeLine(t);
});
cmd(['set'],null,function(a,raw){
  var m=rest(raw).match(/^([^=]+)=(.*)$/);
  if(m){var k=m[1].trim().toUpperCase();if(m[2])P.env[k]=m[2];else delete P.env[k];return}
  P.say(P.envRows());
});
cmd(['path'],null,function(a,raw){
  var t=rest(raw).trim();
  if(t){P.env.PATH=t.toUpperCase();return}
  P.typeLine('PATH='+(P.env.PATH||''));
});
cmd(['prompt'],null,function(a,raw){promptStr=rest(raw).trim()||'$N$G'});
cmd(['pause'],null,function(){
  P.queue(function(){return P.readKey('Strike a key when ready . . . ')});
});
cmd(['rem'],null,function(){});
cmd(['exit'],null,function(){}); /* the first COMMAND.COM has nowhere to go */
cmd(['break','verify'],null,function(a,raw,w){
  var t=(w[1]||'').toLowerCase();
  if(t==='on'||t==='off')return;
  P.typeLine((w[0].toUpperCase())+' is off');
});
cmd(['ctty'],null,function(){P.typeLine('Invalid device')});

/* the programs in C:\DOS */
cmd(['chkdsk'],null,function(a,raw,w){
  if(floppy(names(args(w))[0]))return;
  P.say(['','Volume FROBOZZ','',
    '  21309440 bytes total disk space','     53248 bytes in 3 hidden files','     20480 bytes in 5 directories',
    '    192512 bytes in 24 user files',FREE.toString().padStart(10)+' bytes available on disk','',
    '    655360 bytes total memory','    590656 bytes free','']);
});
cmd(['format'],null,function(a,raw,w){
  var N=names(args(w)),drv=(N[0]||'').charAt(0).toUpperCase();
  if(!N.length){P.typeLine('Required parameter missing');return}
  if(drv==='A'||drv==='B'){
    P.typeLine('Insert new diskette for drive '+drv+':');
    P.queue(function(){return P.readKey('and strike ENTER when ready')});
    P.queue(function(){notReady(drv)});
    return;
  }
  if(drv==='C'){ /* version 3.30 asks nothing, which is the joke; this one has mercy */
    P.typeLine('Formatting...');
    P.pause(1200);
    P.typeLine('Format failure');
    P.typeLine('(your hard disk owes this terminal a favour.)','dim');
    return;
  }
  P.typeLine('Invalid drive specification');
});
cmd(['find'],null,function(a,raw,w){
  var m=raw.match(/"([^"]*)"/),W=raw.replace(/^\s*\S+\s*/,'').replace(/"[^"]*"/,'').trim().split(/\s+/).filter(Boolean);
  if(!m){P.typeLine('FIND: Invalid number of parameters');return}
  var sw=switches(W),F=names(W);
  function run(L,head){
    var hits=[];
    L.forEach(function(l,i){if((l.indexOf(m[1])>=0)!==/v/.test(sw))hits.push((/n/.test(sw)?'['+(i+1)+']':'')+l)});
    if(head)P.say(['',' ---------- '+head.toUpperCase()]);
    if(/c/.test(sw))P.typeLine(String(hits.length));else P.say(hits);
  }
  if(F.length){
    F.forEach(function(x){
      var n=P.find(x,true);
      if(!n||n.type==='d'){P.typeLine('FIND: File not found '+x);return}
      if(n.prot){P.typeLine('Access denied - '+x.toUpperCase());return}
      run(P.text(n),x);
    });
    return;
  }
  P.input([],function(L){run(L)});
});
cmd(['sort'],null,function(a){
  var rev=a.some(function(x){return x==='/r'});
  P.input([],function(L){
    var S=L.slice().sort(function(x,y){x=x.toLowerCase();y=y.toLowerCase();return x<y?-1:x>y?1:0});
    if(rev)S.reverse();
    P.say(S);
  });
});
cmd(['more'],null,function(){P.input([],function(L){P.say(L)})});
cmd(['tree'],null,function(){
  var L=['','DIRECTORY PATH LISTING',''];
  (function walk(n,at){
    Object.keys(n.kids).sort().forEach(function(k){
      var c=n.kids[k];
      if(c.type!=='d'||k.charAt(0)==='.')return;
      L.push('Path: '+dosPath(at+'/'+k));
      var subs=Object.keys(c.kids).filter(function(x){return c.kids[x].type==='d'&&x.charAt(0)!=='.'});
      L.push('Sub-directories: '+(subs.length?subs.map(function(x){return x.toUpperCase()}).join(' '):' None'));
      L.push('');
      walk(c,at+'/'+k);
    });
  })(P.root,'');
  P.say(L);
});
cmd(['label'],null,function(){P.say(['Volume in drive C is FROBOZZ','','Volume label (11 characters, ENTER for none)? '])});
cmd(['attrib'],null,function(a,raw,w){
  var N=names(args(w)),R=resolve(N[0]||'*.*');
  if(!R.dir){P.typeLine('Path not found');return}
  var E=files(R);
  if(!E.length){P.typeLine('File not found');return}
  P.say(E.map(function(k){return '  A  '+dosPath((R.at==='/'?'':R.at)+'/'+k)}));
});
cmd(['edlin'],null,function(a,raw,w){
  var name=names(args(w))[0];
  if(!name){P.typeLine('File name must be specified');return}
  var n=P.find(name,true),B=[],at=1,done=false;
  if(n&&n.type==='d'){P.typeLine('Invalid drive or file name');return}
  if(n&&n.prot){P.typeLine('Access denied');return}
  if(n){B=P.text(n);P.typeLine('End of input file')}else P.typeLine('New file');
  function list(a0,b0){
    var o=[];
    for(var i=a0;i<=b0&&i<=B.length;i++)o.push(String(i).padStart(8)+(i===at?':*':': ')+B[i-1]);
    P.say(o);
  }
  function insert(pos){
    P.ask(String(pos).padStart(8)+':*',function(l){
      if(l===null){at=pos;loop();return}
      B.splice(pos-1,0,l);insert(pos+1);
    });
  }
  function exec(s){
    var m=s.trim().match(/^(\d+|\.|#)?(?:,(\d+|\.|#)?)?\s*([a-zA-Z])?(.*)$/),v=function(x,d){return !x?d:x==='.'?at:x==='#'?B.length+1:Math.max(1,+x)};
    if(!m){P.typeLine('Entry error');return loop()}
    var c=(m[3]||'').toUpperCase(),a1=v(m[1],at),b1=v(m[2],a1);
    if(c==='I')return insert(Math.min(a1,B.length+1));
    if(c==='L'){list(m[1]?a1:Math.max(1,at-11),m[2]?b1:(m[1]?a1:Math.max(1,at-11))+22);return loop()}
    if(c==='D'){B.splice(a1-1,b1-a1+1);at=Math.min(a1,B.length+1);return loop()}
    if(c==='E'){if(!P.writeFile(name,B,false))P.typeLine('Access denied');return}
    if(c==='Q'){
      P.ask('Abort edit (Y/N)? ',function(y){if(!y||!/^y/i.test(y))loop()});
      return;
    }
    if(!c&&m[1]&&a1>=1&&a1<=B.length){
      at=a1;list(a1,a1);
      P.ask(String(a1).padStart(8)+':*',function(e){if(e)B[a1-1]=e;loop()});
      return;
    }
    if(!c&&!m[1]&&!s.trim())return loop();
    P.typeLine('Entry error');
    loop();
  }
  function loop(){
    P.ask('*',function(line){if(line===null)return loop();exec(line)});
  }
  loop();
});

/* not a command: a drive letter, or a program or batch file on disk */
P.fallback=function(word,raw){
  var w=word.toLowerCase();
  if(/^[a-z]:$/.test(w)){
    if(w==='c:')return true;
    if(w==='a:'||w==='b:'){notReady(w.charAt(0).toUpperCase());return true}
    P.typeLine('Invalid drive specification');
    return true;
  }
  var z=/^(?:.*[\\\/])?(zork[12])(?:\.com)?$/.exec(w),zn=z&&P.find(w.replace(/\.com$/,'')+'.com',true); /* in C:\ZORK, or by its path */
  if(zn&&P.pathOf(zn)==='/zork/'+z[1]+'.com'){
    if(P.find('/zork/'+z[1]+'.dat',true))P.zork.play(z[1]);
    else P.typeLine('File not found');
    return true;
  }
  var n=P.find(w.replace(/\.(bat|com|exe)$/,'')+'.bat',true);
  if(n&&n.body){
    P.text(n).forEach(function(l){
      var quiet=l.charAt(0)==='@',t=quiet?l.slice(1):l;
      P.queue(function(){
        if(!quiet&&echoOn)P.typeLine(currentPrompt()+t);
        P.runScript([t]);
      });
    });
    return true;
  }
  return false;
};

})(window.Phosphor);
