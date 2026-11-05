/* PHOSPHOR-9 terminal: files and text tools (touch, mkdir, rmdir, cp, mv, chmod, grep, wc, sort,
   uniq, head, tail, tr, tee, cal, sleep, true, false, tty, stty, file, sh, printenv, set, du).
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE.
   They print with P.say and read with P.input, so the shell can pipe and redirect them. */
(function(P){
'use strict';

function cmd(name,what,syn,desc,run,noH){
  P.command({names:[name],path:'/bin',noHelpFlag:!!noH,man:{what:what,syn:syn,desc:[desc]},run:run});
}
function nameOf(p){return p.replace(/\/+$/,'').split('/').pop()}
function operands(a){return a.filter(function(x){return x.charAt(0)!=='-'})}
function flags(a){return a.filter(function(x){return x.charAt(0)==='-'}).join('')}

cmd('touch','make a file, or update its time','touch file ...','makes each file that does not exist, and marks the rest as changed now.',function(a){
  a.forEach(function(x){if(!P.writeFile(x,[],true))P.typeLine('touch: cannot touch '+x,'err')});
});
cmd('mkdir','make a folder','mkdir dir ...','makes each folder named.',function(a){
  if(!a.length){P.typeLine('usage: '+P.man.mkdir.syn);return}
  a.forEach(function(x){
    var abs=P.norm(x);
    if(P.find(abs,true)||!P.canWrite(abs)){P.typeLine('mkdir: cannot make '+x,'err');return}
    P.put(abs,'d',{owner:P.st.user,date:P.now()});
  });
});
cmd('rmdir','remove an empty folder','rmdir dir ...','removes each folder named, if it is empty.',function(a){
  if(!a.length){P.typeLine('usage: '+P.man.rmdir.syn);return}
  a.forEach(function(x){
    var n=P.find(x,true),at=n&&P.pathOf(n);
    if(!n||n.type!=='d'){P.typeLine('rmdir: '+x+' not a directory','err');return}
    if(Object.keys(n.kids).length){P.typeLine('rmdir: '+x+' not empty','err');return}
    if(n.prot||n===P.root||!P.canWrite(at)||P.st.cwd===at||P.st.cwd.indexOf(at+'/')===0){P.typeLine('rmdir: '+x+' not removed','err');return}
    delete n.parent.kids[n.name];
  });
});
function target(to,from){ /* copying or moving into a folder keeps the name */
  var d=P.find(to,true);
  return d&&d.type==='d'?P.norm(to)+'/'+nameOf(from):P.norm(to);
}
cmd('cp','copy a file','cp file1 file2','copies file1 to file2, or into file2 if it is a folder.',function(a){
  if(a.length<2){P.typeLine('usage: '+P.man.cp.syn);return}
  var n=P.find(a[0]);
  if(!n||n.type==='d'||n.prot){P.typeLine('cp: cannot open '+a[0],'err');return}
  if(!P.writeFile(target(a[1],a[0]),P.text(n),false))P.typeLine('cp: cannot create '+a[1],'err');
});
cmd('mv','move or rename a file','mv file1 file2','renames file1 to file2, or moves it into file2 if that is a folder.',function(a){
  if(a.length<2){P.typeLine('usage: '+P.man.mv.syn);return}
  var n=P.find(a[0],true),to=target(a[1],a[0]);
  if(!n||n.prot||n===P.root||!P.canWrite(P.pathOf(n))||!P.canWrite(to)){P.typeLine('mv: cannot move '+a[0],'err');return}
  if(P.find(to,true)&&P.find(to,true)!==n&&P.find(to,true).type==='d'){P.typeLine('mv: '+a[1]+' is a folder','err');return}
  if((to+'/').indexOf(P.pathOf(n)+'/')===0&&to!==P.pathOf(n)){P.typeLine('mv: cannot move a folder into itself','err');return}
  var parent=P.find(to.slice(0,to.lastIndexOf('/'))||'/'),name=to.split('/').pop();
  delete n.parent.kids[n.name];
  n.name=name;n.parent=parent;parent.kids[name]=n;
});
cmd('chmod','change who may do what to a file','chmod mode file ...','mode is an octal number such as 755, or +x and -x. a file with x set runs as a shell script: ./file.',function(a){
  if(a.length<2){P.typeLine('usage: '+P.man.chmod.syn);return}
  a.slice(1).forEach(function(x){
    var n=P.find(x,true);
    if(!n||!P.canWrite(P.pathOf(n))||n.prot){P.typeLine('chmod: cannot change '+x,'err');return}
    var t=n.type==='d'?'d':'-',m=n.mode||(t==='d'?'drwxr-xr-x':'-rw-r--r--');
    if(/^[0-7]{3}$/.test(a[0])){
      m=t+a[0].split('').map(function(c){c=+c;return (c&4?'r':'-')+(c&2?'w':'-')+(c&1?'x':'-')}).join('');
    }
    else if(a[0]==='+x')m=m.charAt(0)+m.slice(1).replace(/(r.)-/g,'$1x');
    else if(a[0]==='-x')m=m.replace(/x/g,'-');
    else{P.typeLine('chmod: bad mode '+a[0],'err');return}
    n.mode=m;
  });
});

cmd('grep','search for a pattern','grep [ -cinv ] pattern [ file ... ]','prints the lines that match. -v the lines that do not, -c only how many, -n with line numbers, -i ignoring case.',function(a,raw,words){
  var w=words.slice(1),fl=flags(w.filter(function(x){return x.charAt(0)==='-'})),rest=operands(w),re;
  if(!rest.length){P.typeLine('usage: '+P.man.grep.syn);return}
  try{re=new RegExp(rest[0],/i/.test(fl)?'i':'')}catch(e){P.typeLine('grep: bad pattern '+rest[0],'err');return}
  P.input(rest.slice(1).map(P.fold),function(L){
    var hits=[];
    L.forEach(function(l,i){if(re.test(l)!==/v/.test(fl))hits.push((/n/.test(fl)?(i+1)+':':'')+l)});
    if(/c/.test(fl))P.typeLine(String(hits.length));else P.say(hits);
    P.status(hits.length?0:1);
  });
});
cmd('wc','count lines, words and characters','wc [ -lwc ] [ file ]','prints how many lines, words and characters.',function(a){
  var fl=flags(a);
  P.input(operands(a),function(L){
    var words=0,chars=0;
    L.forEach(function(l){var t=l.trim();if(t)words+=t.split(/\s+/).length;chars+=l.length+1});
    var c=[];
    if(!fl||/l/.test(fl))c.push(L.length);
    if(!fl||/w/.test(fl))c.push(words);
    if(!fl||/c/.test(fl))c.push(chars);
    var o=operands(a)[0];
    P.typeLine(c.map(function(n){return String(n).padStart(7)}).join(' ')+(o?' '+o:''));
  });
});
cmd('sort','sort lines','sort [ -nru ] [ file ... ]','sorts the lines. -r backwards, -n by number, -u dropping repeats.',function(a){
  var fl=flags(a);
  P.input(operands(a),function(L){
    var S=L.slice().sort(/n/.test(fl)?function(x,y){return (parseFloat(x)||0)-(parseFloat(y)||0)}:function(x,y){return x<y?-1:x>y?1:0});
    if(/r/.test(fl))S.reverse();
    if(/u/.test(fl))S=S.filter(function(l,i){return !i||l!==S[i-1]});
    P.say(S);
  });
});
cmd('uniq','drop repeated lines','uniq [ -c ] [ file ]','prints one of each run of identical lines. -c counts them.',function(a){
  var c=/c/.test(flags(a));
  P.input(operands(a),function(L){
    var R=[];
    L.forEach(function(l){var t=R[R.length-1];if(t&&t[1]===l)t[0]++;else R.push([1,l])});
    P.say(R.map(function(r){return c?String(r[0]).padStart(4)+' '+r[1]:r[1]}));
  });
});
function count(a,dflt){var m=flags(a).match(/\d+/);return m?+m[0]:dflt}
cmd('head','print the first lines','head [ -n ] [ file ... ]','prints the first n lines, normally 10.',function(a){
  var n=count(a,10);P.input(operands(a),function(L){P.say(L.slice(0,n))});
});
cmd('tail','print the last lines','tail [ -n ] [ file ... ]','prints the last n lines, normally 10.',function(a){
  var n=count(a,10);P.input(operands(a),function(L){P.say(n?L.slice(-n):[])});
});
cmd('tr','change characters','tr string1 string2','changes each character of string1 into the matching one of string2. ranges like a-z work.',function(a,raw,words){
  function span(s){return s.replace(/(.)-(.)/g,function(m,x,y){var o='';for(var c=x.charCodeAt(0);c<=y.charCodeAt(0);c++)o+=String.fromCharCode(c);return o})}
  if(words.length<3){P.typeLine('usage: '+P.man.tr.syn);return}
  var from=span(words[1]),to=span(words[2]);
  P.input([],function(L){P.say(L.map(function(l){return l.split('').map(function(c){var i=from.indexOf(c);return i<0?c:to.charAt(Math.min(i,to.length-1))}).join('')}))});
});
cmd('tee','copy input to a file as well','tee [ -a ] file ...','prints what it reads and writes it to each file. -a adds to the end.',function(a){
  var app=/a/.test(flags(a)),F=operands(a);
  P.input([],function(L){
    F.forEach(function(x){if(!P.writeFile(x,L,app))P.typeLine('tee: cannot create '+x,'err')});
    P.say(L);
  });
});

cmd('cal','print a calendar','cal [ month ] year','prints a month, or a whole year, of the real calendar. cal 9 1752 is worth a look.',function(a){
  var MN=['January','February','March','April','May','June','July','August','September','October','November','December'];
  /* day of the week of the first of a month, the way cal itself counts: Julian to September 1752, then Gregorian */
  function dow(y,m){
    var yy=m<3?y-1:y,mm=m<3?m+12:m,k=yy%100,j=Math.floor(yy/100),h;
    if(y<1752||(y===1752&&m<=9))h=(1+Math.floor(13*(mm+1)/5)+k+Math.floor(k/4)+5-j)%7;
    else h=(1+Math.floor(13*(mm+1)/5)+k+Math.floor(k/4)+Math.floor(j/4)+5*j)%7;
    return (h+6)%7;
  }
  function days(y,m){
    if(m===2)return (y<=1752?y%4===0:(y%4===0&&y%100!==0)||y%400===0)?29:28;
    return [31,0,31,30,31,30,31,31,30,31,30,31][m-1];
  }
  function month(y,m,head){
    var t=MN[m-1]+(head?' '+y:''),L=[' '.repeat(Math.max(0,Math.floor((20-t.length)/2)))+t, ' S  M Tu  W Th  F  S'],d=[],n=days(y,m),i;
    for(i=0;i<dow(y,m);i++)d.push('  ');
    for(i=1;i<=n;i++){if(y===1752&&m===9&&i>2&&i<14)continue;d.push(String(i).padStart(2))}
    while(d.length)L.push(d.splice(0,7).join(' '));
    return L;
  }
  var yr=+a[a.length-1],mo=a.length>1?+a[0]:0;
  if(!a.length){var now=P.now();yr=now.getFullYear();mo=now.getMonth()+1}
  if(!yr||yr<1||yr>9999||(mo&&(mo<1||mo>12))){P.typeLine('usage: '+P.man.cal.syn);return}
  if(mo){P.say(month(yr,mo,true));return}
  var O=[String(yr).padStart(12)];
  for(var q=1;q<=12;q++){O.push('');O=O.concat(month(yr,q,false))}
  P.say(O);
});
cmd('sleep','wait a while','sleep seconds','waits. ctrl-c stops it early.',function(a){
  var s=Math.min(600,parseFloat(a[0])||0);
  P.queue(function(){return P.sleep(s*1000)});
});
cmd('true','succeed','true','does nothing, successfully.',function(){P.status(0)});
cmd('false','fail','false','does nothing, unsuccessfully.',function(){P.status(1)});
cmd('tty','print the name of this terminal','tty','prints the name of this terminal.',function(){P.typeLine('/dev/tty0')});
cmd('stty','set the speed of the line','stty [ speed ]','with a speed in baud, such as 300, 1200 or 9600, runs the line at that speed: ten bits a character, and you can read along. stty 0 goes back to normal. with no speed, reports it.',function(a){
  if(!a.length){var b=P.baud();P.typeLine(b?'speed '+b+' baud':'speed 9600 baud, more or less');return}
  var n=parseInt(a[0],10);
  if(isNaN(n)||n<0||n>115200){P.typeLine('stty: bad speed '+a[0],'err');return}
  P.baud(n);
});
cmd('file','guess what a file is','file file ...','says what sort of thing each file seems to be.',function(a){
  a.forEach(function(x){
    var n=P.find(x),k=!n?"can't stat":n.type==='d'?'directory':n.dev?'character special':n.prot?'cannot open':n.bin?'pdp-11 executable':/\.c$/.test(n.name)?'c program text':'ascii text';
    P.typeLine(x+': '+k);
  });
});
cmd('sh','run a shell script','sh file','runs the commands in a file, one line at a time.',function(a){
  if(!a.length){P.typeLine('usage: '+P.man.sh.syn);return}
  var n=P.find(a[0]);
  if(!n||n.type==='d'||n.prot){P.typeLine(a[0]+': cannot open','err');return}
  P.runScript(P.text(n));
});
function showEnv(){
  P.say(['HOME='+P.st.home,'LOGNAME='+P.st.user].concat(Object.keys(P.env).sort().map(function(k){return k+'='+P.env[k]})));
}
cmd('printenv','print the environment','printenv','prints the environment.',showEnv);
cmd('set','print the shell variables','set','prints the variables the shell knows about.',showEnv);
cmd('du','how much disk a folder uses','du [ -s ] [ name ... ]','prints the size of each folder under name, in 512-byte blocks.',function(a){
  var S=/s/.test(flags(a)),F=operands(a),L=[];
  function walk(n,at,top){
    var t=Math.ceil(P.fsize(n)/512);
    if(n.type==='d'&&!n.prot)Object.keys(n.kids).sort().forEach(function(k){if(k!=='.'&&k!=='..')t+=walk(n.kids[k],at+'/'+k,false)});
    if((n.type==='d'&&!S)||top)L.push(t+'\t'+at);
    return t;
  }
  (F.length?F:['.']).forEach(function(x){
    var n=P.find(x);
    if(!n){P.typeLine(x+' not found','err');return}
    walk(n,x,true);
  });
  P.say(L);
});

})(window.Phosphor);
