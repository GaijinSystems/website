/* PHOSPHOR-9 terminal: machine "linux", the commands of a Debian 13 server: bash's prompt and builtins,
   GNU's ls, procps, iproute2, systemd, sudo and apt, as an unprivileged user sees them.
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE. */
(function(P){
'use strict';
var D=P.debian={ /* what the machine is, for this file and fs.js */
  krel:'6.12.111+deb13-amd64',kbuild:'#1 SMP PREEMPT_DYNAMIC Debian 6.12.111-1 (2026-09-28)',debian:'13.7',systemd:'257.13-1~deb13u1',
  ip4:'203.0.113.24',ip6:'2001:db8:4f2::24',gw:'203.0.113.1',mac:'52:54:00:3a:7c:1e',cpu:'AMD EPYC-Rome Processor',ncpu:2,
  mem:{MemTotal:2014976,MemFree:1352196,MemAvailable:1689556,Buffers:31220,Cached:409852,Shmem:1124,SReclaimable:25228},
  links:{'/bin':'usr/bin','/sbin':'usr/sbin','/lib':'usr/lib','/lib64':'usr/lib64','/etc/os-release':'../usr/lib/os-release',
    '/vmlinuz':'boot/vmlinuz-6.12.111+deb13-amd64','/initrd.img':'boot/initrd.img-6.12.111+deb13-amd64','/usr/games/cowthink':'cowsay','/usr/bin/python3':'python3.13'},
  loads:loads
};
var BOOT=null,OLD=null,STK=[],RUN=0; /* the shells su started, newest last: what each says as it ends ('exit', or 'logout' after su -), and who and where to go back to */
P.setup(function(){
  BOOT=new Date(P.st.login.getTime()-52e3); /* the machine came up as the terminal did */
  exported(); /* what the session starts with is exported */
  function ps1(){
    var S=P.st;
    if(S.user==='root'&&S.home==='/'){S.home='/root';if(S.cwd==='/')S.cwd='/root'} /* root logged in at the console: root's home */
    var w=S.cwd===S.home?'~':S.cwd.indexOf(S.home+'/')===0?'~'+S.cwd.slice(S.home.length):S.cwd;
    pkgSync(); /* what root removed, before a reload too */
    return S.user+'@'+S.hostname+':'+w+(S.user==='root'?'# ':'$ ');
  }
  P.setPrompt(ps1);
  P.subPrompt=ps1; /* what a game's shell escape prompts with: bash's PS1, not a C shell's % */
  Object.defineProperty(P.profile,'rootPrompt',{get:ps1,configurable:true}); /* root's prompt is the same PS1, ending in # */
  var bye=P.cmds.exit; /* a login shell says so as it goes */
  if(bye)P.cmds.exit=P.cmds.logout=function(a,raw,w){
    if(RUN&&!P.subshell()&&!P.inScript()){P.status(parseInt(a[0],10)||0);P.loop('exit');return} /* in su -c's line: only that shell ends */
    if(P.bourne.leave(a[0]===undefined?P.lastStatus():parseInt(a[0],10)||0))return; /* dash at the terminal: back to bash, saying nothing */
    if(!P.subshell()&&!P.inScript()){
      var top=STK[STK.length-1];
      if(top&&top.say==='exit'&&w&&w[0]==='logout'){err('bash: logout: not login shell: use `exit\'');P.status(1);return}
      P.typeLine(top?top.say:'logout');
      if(top&&!top.base){STK.pop();P.st.user=top.user;P.st.home=top.home;P.st.cwd=top.cwd;P.aliases=top.al;P.relock(top.user!=='root');return} /* back to the shell that ran su */
      STK.length=0;
    }
    bye(a,raw,w);
  };
  var shown=P.cmds.set; /* bash's set: with no words, the variables; options are taken and change nothing here; the words after them (after --, or
                           the first word that is no option) are the positional parameters, $1 $2 ... $# and $@, silently */
  if(shown)P.cmds.set=function(a,raw,w){
    var W=w.slice(1),i=0,pos=null;
    if(!W.length){shown(a,raw,w);return}
    for(;i<W.length;i++){
      var x=W[i];
      if(x==='--'){pos=W.slice(i+1);break}
      if(x==='-'){if(i+1<W.length)pos=W.slice(i+1);break}
      if(!/^[-+]./.test(x)){pos=W.slice(i);break}
      var bad=x.slice(1).replace(/[abefhkmnptuvxBCEHPTo]/g,'');
      if(bad){err('bash: set: '+x.charAt(0)+bad.charAt(0)+': invalid option');err('set: usage: set [-abefhkmnptuvxBCEHPT] [-o option-name] [--] [-] [arg ...]');P.queue(function(){P.status(2)});return}
      if(/o/.test(x)&&i+1<W.length)i++; /* -o name */
    }
    if(pos)P.args([P.args()[0]||''].concat(pos));
  };
  var src=P.cmds.source; /* bash's source is its . (with no file, the terminal's own: where to get it); dash has none */
  if(src&&P.cmds['.'])P.cmds.source=function(a,raw,w){if(w.length<2)src(a,raw,w);else if(P.bourne.dash()){err(P.bashAt()+w[0]+': not found');P.queue(function(){P.status(127)})}else P.cmds['.'](a,raw,w)};
  P.bourne.on=true; /* /bin/sh is dash: sh at the terminal starts one, which exit or ^D ends; sh file, sh -c and #!/bin/sh scripts run theirs with it */
  if(P.cmds.sh){var sh=P.cmds.sh;
    P.cmds.bash=function(a,raw,w){if(!a.length&&!P.stdin())return;P.bourne.bash(function(){sh(a,raw,w)})}; /* bash on its own: you are in one already */
    P.cmds.sh=function(a,raw,w){if(!a.length&&!P.stdin()&&!P.subshell()&&!P.inScript()){P.bourne.start();return}P.bourne.run(function(){sh(a,raw,w)})};
    P.paths.bash='/usr/bin';
  }
  var GNU={cat:['concatenate files and print on the standard output','cat [OPTION]... [FILE]...'],pwd:['print name of current/working directory','pwd [OPTION]...'],
    echo:['display a line of text','echo [SHORT-OPTION]... [STRING]...'],mkdir:['make directories','mkdir [OPTION]... DIRECTORY...'],rm:['remove files or directories','rm [OPTION]... [FILE]...'],
    rmdir:['remove empty directories','rmdir [OPTION]... DIRECTORY...'],cp:['copy files and directories','cp [OPTION]... SOURCE... DIRECTORY'],mv:['move (rename) files','mv [OPTION]... SOURCE... DIRECTORY'],
    touch:['change file timestamps','touch [OPTION]... FILE...'],chmod:['change file mode bits','chmod [OPTION]... MODE[,MODE]... FILE...'],grep:['print lines that match patterns','grep [OPTION...] PATTERNS [FILE...]'],
    wc:['print newline, word, and byte counts for each file','wc [OPTION]... [FILE]...'],sort:['sort lines of text files','sort [OPTION]... [FILE]...'],uniq:['report or omit repeated lines','uniq [OPTION]... [INPUT [OUTPUT]]'],
    head:['output the first part of files','head [OPTION]... [FILE]...'],tail:['output the last part of files','tail [OPTION]... [FILE]...'],tr:['translate or delete characters','tr [OPTION]... STRING1 [STRING2]'],
    tee:['read from standard input and write to standard output and files','tee [OPTION]... [FILE]...'],sleep:['delay for a specified amount of time','sleep NUMBER[SUFFIX]...'],
    file:['determine file type','file [file ...]'],du:['estimate file space usage','du [OPTION]... [FILE]...'],ln:['make links between files','ln [OPTION]... [-T] TARGET LINK_NAME'],
    date:['print or set the system date and time','date [OPTION]... [+FORMAT]'],whoami:['print effective user name','whoami [OPTION]...'],clear:['clear the terminal screen','clear [-Ttype] [-x]'],
    sh:['command interpreter (shell)','sh [-aCefnuvxIimqVEb] [+aCefnuvxIimqVEb] [-o option_name] [command_file [argument ...]] or sh -c command_string'],
    vi:["Vi IMproved, a programmer's text editor",'vi [file]'],'true':['do nothing, successfully','true [ignored command line arguments]'],
    'false':['do nothing, unsuccessfully','false [ignored command line arguments]'],test:['check file types and compare values','test EXPRESSION'],expr:['evaluate expressions','expr EXPRESSION']};
  Object.keys(GNU).forEach(function(k){if(P.has(P.man,k)){P.man[k].what=GNU[k][0];P.man[k].syn=GNU[k][1]}});
  if(P.cmds.bash)P.man.bash={names:'bash',what:'GNU Bourne-Again SHell',syn:'bash [options] [command_string | file]',bugs:[],desc:[ /* the bash above, which is sh's */
    'runs the commands in a file, one line at a time, with any words after it as $1, $2 and on. with no file, it does nothing: you are in bash already.','',
    '-c   the commands are read from the first argument, command_string.'].map(P.fill)};
  if(P.has(P.man,'sh'))P.man.sh.desc=['dash, the Debian Almquist shell: the commands of a file, or of command_string with -c, read and run with the POSIX grammar, and no more (no [[ ]], arrays, brace expansion or history). each argument is passed to the script: $1, $2 and so on. with no file, at the terminal, it reads commands from there, with its $ prompt, until exit or end of file (^D).',
    '','-c   read commands from the command_string operand instead of from the standard input.'];
});
function cmd(names,where,what,syn,desc,run,o){
  P.command(Object.assign({names:[].concat(names),path:where||undefined,man:{what:what,syn:syn,desc:[].concat(desc)},run:run},o||{}));
}
function err(s){P.typeLine(s,'err')}
function lines(L){P.say(L)}
function out(L){var w=P.piped()?0:Math.max(80,P.columns());P.say(L.map(function(l){return w&&l.length>w?l.slice(0,w):l}))} /* procps cuts its rows to the terminal, which it takes to be 80 wide at least */
function p2(x){return P.p2(x)}
function hm(d){return p2(d.getHours())+':'+p2(d.getMinutes())}
function hms(d){return hm(d)+':'+p2(d.getSeconds())}
function ymd(d){return d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate())}
function stamp(d){var z=P.tz();return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()]+' '+ymd(d)+' '+hms(d)+(z?' '+z:'')}
function jstamp(d){return P.short(d).replace(/^(\w+) +(\d+)/,function(m,a,b){return a+' '+p2(b)})+':'+p2(d.getSeconds())}
function since(){return P.now()-BOOT}
function ago(ms){
  var s=Math.max(0,Math.floor(ms/1000)),m=Math.floor(s/60),h=Math.floor(m/60),d=Math.floor(h/24);
  return d?d+' day'+(d>1?'s':'')+' '+h%24+'h ago':h?h+'h '+m%60+'min ago':m?m+'min '+s%60+'s ago':s+'s ago';
}
function upText(){ /* as procps writes it */
  var m=Math.floor(since()/6e4),d=Math.floor(m/1440),h=Math.floor(m%1440/60);
  return 'up '+(d?d+' day'+(d!==1?'s':'')+', ':'')+(h?String(h).padStart(2)+':'+p2(m%60):m%60+' min');
}
function loads(){ /* the boot settling down */
  var m=since()/6e4;
  return [.02+.55*Math.exp(-m/1.5),.03+.3*Math.exp(-m/6),.01+.12*Math.exp(-m/16)].map(function(x){return x.toFixed(2)});
}
function upLine(){
  var n=P.now();
  return ' '+hms(n)+' '+upText()+',  1 user,  load average: '+loads().join(', ');
}
function opts(a){ /* flags and operands, GNU style: -la, --long=x, and -- */
  var f='',L={},ops=[],end=false;
  a.forEach(function(x){
    if(end||x==='-'||x.charAt(0)!=='-')ops.push(x);
    else if(x==='--')end=true;
    else if(x.slice(0,2)==='--'){var m=x.slice(2).split('=');L[m[0]]=m.length>1?m.slice(1).join('='):true}
    else f+=x.slice(1);
  });
  return {f:f,L:L,ops:ops,has:function(c,long){return f.indexOf(c)>=0||!!(long&&L[long])}};
}
function human(b,suffix){ /* 4.0K, 13K, 1.9G: GNU rounds up */
  if(b<1024)return String(b)+(suffix&&b?'B':'');
  var u='KMGTP',i=0;b/=1024;
  while(b>=1023.95&&i<4){b/=1024;i++}
  var r=b<10?Math.ceil(b*10-1e-9)/10:Math.ceil(b-1e-9);
  if(r>=1024&&i<4){r=1;i++}
  return (r<10?r.toFixed(1):String(r))+u.charAt(i)+(suffix||'');
}

/* ---------- the shell ---------- */
var BUILTIN=['.',':','[','alias','bg','break','cd','command','continue','declare','echo','exit','export','false','fg','help','history','jobs','kill','let','local','logout','printf','pwd','read','readonly','set','shift','source','test','true','type','typeset','umask','unalias','unset','wait'];
cmd('cd','','change the shell working directory','cd [-L|[-P [-e]] [-@]] [dir]',
  ['changes the working directory to dir, or to your home directory if there is none. cd - goes back to the one before, and says where that is.','',
  '-L   force symbolic links to be followed: resolve symbolic links in dir after processing instances of .. (the default)',
  '-P   use the physical directory structure without following symbolic links: resolve symbolic links in dir before processing instances of ..',
  '-e   if the -P option is supplied, and the current working directory cannot be determined successfully, exit with a non-zero status',
  '-@   on systems that support it, present a file with extended attributes as a directory containing the file attributes; Linux is not one of them'],
  function(a,raw,w){
    /* bash's cd.def: -L (the default) keeps the name as given, with . and .. taken off it; -P the folder's own name. -@ is only for systems
       with O_XATTR, so on Linux it is an invalid option, as any other is */
    var W=w.slice(1),phys=false;
    for(;W.length&&/^-./.test(W[0]);W.shift()){
      if(W[0]==='--'){W.shift();break}
      for(var j=1;j<W[0].length;j++){
        var c=W[0].charAt(j);
        if(c==='P')phys=true;else if(c==='L')phys=false;
        else if(c!=='e'){err('bash: cd: -'+c+': invalid option');err('cd: usage: cd [-L|[-P [-e]] [-@]] [dir]');P.queue(function(){P.status(2)});return}
      }
    }
    if(W.length>1){err('bash: cd: too many arguments');return}
    var t=W.length?W[0]:P.st.home,back=t==='-';
    if(back){if(OLD===null){err('bash: cd: OLDPWD not set');return}t=OLD}
    var n=P.find(t);
    if((!n||n.type!=='d'||n.prot||!P.may(n,'x'))&&P.bourne.dash()){err(P.bashAt()+"cd: can't cd to "+t);P.status(2);return} /* dash's */
    if(!n||n.type!=='d'||n.prot||!P.may(n,'x')){err('bash: cd: '+t+': '+(!n&&!P.shut(t)?'No such file or directory':n&&n.type!=='d'?'Not a directory':'Permission denied'));return}
    OLD=P.st.cwd;P.env.OLDPWD=OLD;
    var log=P.norm(t);
    P.st.cwd=phys||P.find(log)!==n?P.pathOf(n):log;
    if(back)P.typeLine(P.st.cwd);
  },{core:true,help:'change directory'});
/* bash's own list is the engine's (for !n and the arrows): -c, -d, -s and -p change a copy and put it back */
cmd('history','','display the command history','history [-c] [-d offset] [n] or history -anrw [filename] or history -ps arg [arg...]',['lists the commands typed so far, numbered. with n, only the last n. -c clears the list, -d offset deletes one entry. !n runs number n again, and !! the last one.','',
  '-c   clear the history list by deleting all of the entries',
  '-d offset   delete the history entry at position offset. negative offsets count back from the end of the history list',
  '-a, -n, -r, -w   append to, read from, or write the history file. it is not kept here, so they change nothing',
  '-p   perform history expansion on each arg and display the result without storing it in the history list',
  '-s   append the args to the history list as a single entry'],function(a){
  var H=P.hist(),USAGE='history: usage: history [-c] [-d offset] [n] or history -anrw [filename] or history -ps arg [arg...]';
  function bad(m,st){err('bash: history: '+m);if(st===2)err(USAGE);P.queue(function(){P.status(st)})} /* after the error lines, which set 1 as they go out */
  var o=a[0]||'';
  if(o==='--'){a=a.slice(1);o=a[0]||''}
  else if(/^-./.test(o)){
    var f=o.charAt(1);
    if('cdanrwps'.indexOf(f)<0){bad(o.slice(0,2)+': invalid option',2);return}
    if(f==='c'){P.setHist([]);return}
    if(f==='d'){
      var arg=o.length>2?o.slice(2):a[1];
      if(arg===undefined){bad('-d: option requires an argument',2);return}
      var d=/^-?[0-9]+$/.test(arg)?parseInt(arg,10):NaN,at=d<0?H.length+d:d-1;
      if(isNaN(d)||d===0||at<0||at>=H.length){bad(arg+': history position out of range',1);return}
      H.splice(at,1);P.setHist(H);return;
    }
    if(f==='s'){if(a.length>1){H.pop();H.push(a.slice(1).join(' '));P.setHist(H)}return} /* in place of the history -s line itself */
    if(f==='p'){if(a.length>1&&!P.subshell()){H.pop();P.setHist(H)}lines(a.slice(1));return} /* nor is the history -p line kept, unless bare or in a pipeline or $(...) */
    return; /* -a -n -r -w: to and from ~/.bash_history, which shows nothing */
  }
  if(a.length>1){bad('too many arguments',1);return}
  var n=parseInt(o,10),from=n>=0?Math.max(0,H.length-n):0;
  if(o&&isNaN(n)){bad(o+': numeric argument required',1);return}
  lines(H.slice(from).map(function(l,i){return String(from+i+1).padStart(5)+'  '+l}));
});
function where(x){
  if(P.has(P.paths,x)&&P.has(P.cmds,x))return P.paths[x]+'/'+x;
  return null;
}
cmd('type','','display information about command type','type [-afptP] name [name ...]','says how each name would be read if it were typed as a command: an alias, a shell builtin, or a file, and which.',function(a,raw,w){
  var bad=false;
  w.slice(1).filter(function(x){return x.charAt(0)!=='-'}).forEach(function(x){
    var al=P.aliases.filter(function(y){return y.from.length===1&&y.from[0]===x})[0],f;
    if(al)P.typeLine(x+' is aliased to `'+al.to+"'");
    else if(BUILTIN.indexOf(x)>=0)P.typeLine(x+' is a shell builtin');
    else if((f=where(x)))P.typeLine(x+' is '+f);
    else{if(P.bourne.dash())P.typeLine(x+': not found');else err('bash: type: '+x+': not found');bad=true}
  });
  if(bad)P.status(P.bourne.dash()?127:1);
});
cmd('which','/usr/bin','locate a command','which [-a] filename ...','prints the full path of each program that would run for the names given, searching the directories in PATH. aliases and shell builtins are not programs.',function(a){
  var bad=false;
  a.filter(function(x){return x.charAt(0)!=='-'}).forEach(function(x){var f=where(x);if(f)P.typeLine(f);else bad=true});
  if(bad)P.status(1);
});
function envAll(){ /* the environment: what is set, less what export -n took out of it */
  var E={HOME:P.st.home,LOGNAME:P.st.user,USER:P.st.user};
  Object.keys(P.env).forEach(function(k){E[k]=P.env[k]});
  Object.keys(E).forEach(function(k){if(exported()[k]===false)delete E[k]});
  return E;
}
cmd('export','','set export attribute for shell variables','export [-fn] [name[=value] ...] or export -p',['marks each name for the environment of the commands run from now on, giving it the value after the = if there is one. with no name, lists what is exported.','',
  '-f   refer to shell functions; this shell has none, so it says so',
  '-n   remove the export property from each name',
  '-p   display a list of all exported variables and functions'],function(a,raw,w){
  var W=w.slice(1),fn=false,un=false;
  for(;W.length&&/^-./.test(W[0]);W.shift()){ /* bash's export.def: -f, -n and -p, then names */
    if(W[0]==='--'){W.shift();break}
    for(var j=1;j<W[0].length;j++){
      var c=W[0].charAt(j);
      if(c==='f')fn=true;else if(c==='n')un=true;
      else if(c!=='p'){err('bash: export: -'+c+': invalid option');err('export: usage: export [-fn] [name[=value] ...] or export -p');P.queue(function(){P.status(2)});return}
    }
  }
  if(!W.length){if(fn)return;var E=envAll();lines(Object.keys(E).sort().map(function(k){return 'declare -x '+k+'="'+E[k]+'"'}));return}
  W.forEach(function(x){
    var m=x.match(/^([A-Za-z_]\w*)(?:\+?=[\s\S]*)?$/);
    if(!m){err("bash: export: `"+x+"': not a valid identifier");return}
    if(fn){err('bash: export: '+m[1]+': not a function');return}
    exported()[m[1]]=!un;P.bashVars.asg(x);
  });
});
var EXP=null; /* the exported names, which declare -p shows with -x: the ones the session started with, and export's */
function exported(){if(!EXP){EXP=Object.create(null);Object.keys(P.env).concat(['HOME','LOGNAME','USER']).forEach(function(k){EXP[k]=true})}return EXP}
function declared(n){ /* declare -p's line for n, or null when it is not set */
  var V=P.bashVars,k=V.kind(n),v=V.value(n);
  if(!k&&v===null)return null;
  var f=(k||'')+(exported()[n]&&!/[aA]/.test(k||'')?'x':''); /* bash's order: a A i, then x */
  return 'declare '+(f?'-'+f:'--')+' '+n+(v===null?'':'='+v);
}
function assigns(name,w,decl,int){ /* declare, typeset and readonly: name=value, name=( ... ), name[i]=value each; -a and -A make arrays, -i (int true) and +i (false)
                                        make it an integer or not, before its value is set. false when one went wrong */
  var ok=true,V=P.bashVars;
  w.forEach(function(x){
    var m=x.match(/^([A-Za-z_]\w*)(\[[^\]]*\])?(\+?=[\s\S]*)?$/);
    if(!m||m[2]&&m[3]===undefined){err('bash: '+name+": `"+x+"': not a valid identifier");ok=false;return}
    if(decl&&!V.make(m[1],decl==='A')){err('bash: '+name+': '+m[1]+': cannot convert '+(decl==='A'?'indexed to associative':'associative to indexed')+' array');ok=false;return}
    if(int!==undefined)V.int(m[1],int);
    if(m[3]!==undefined&&V.asg(x,decl)===false)ok=false;
  });
  return ok;
}
cmd(['declare','typeset'],'','set variable values and attributes','declare [-aAfFgiIlnrtux] [name[=value] ...] or declare -p [name ...]','gives each name the value after its =; -a makes an indexed array, -A an associative one, and name=( ... ) gives an array its elements. -p shows each name as a declare command; with no name, lists the variables. -i makes each name an integer: whatever it is set to is worked out as arithmetic first, and += adds; +i takes that away. the other attributes are not kept here.',function(a,raw,w){
  var o='',off='',args=[];
  w.slice(1).forEach(function(x){if(!args.length&&/^[-+][A-Za-z]+$/.test(x)){if(x.charAt(0)==='-')o+=x.slice(1);else off+=x.slice(1)}else args.push(x)});
  var int=o.indexOf('i')>=0?true:off.indexOf('i')>=0?false:undefined;
  var decl=o.indexOf('A')>=0?'A':o.indexOf('a')>=0?'a':null,E=envAll();
  if(o.indexOf('p')>=0){
    var bad=false;
    (args.length?args:Object.keys(E).concat(P.bashVars.names()).filter(function(k,i,L){return L.indexOf(k)===i}).sort()).forEach(function(n){var t=declared(n);if(t===null){err('bash: '+w[0]+': '+n+': not found');bad=true}else P.typeLine(t)});
    if(bad)P.status(1);
    return;
  }
  if(!args.length&&int){P.bashVars.ints().sort().forEach(function(n){var t=declared(n);if(t!==null)P.typeLine(t)});return} /* declare -i: the integers, as declare -p shows them */
  if(!args.length){
    var arr=P.bashVars.names();
    lines(Object.keys(E).concat(arr).filter(function(k,i,L){return L.indexOf(k)===i}).sort().filter(function(k){return arr.indexOf(k)<0||P.bashVars.value(k)!==null}).map(function(k){return k+'='+(arr.indexOf(k)>=0?P.bashVars.value(k):E[k])}));
    return;
  }
  if(!assigns(w[0],args,decl,int))P.status(1);
});
cmd('readonly','','mark shell variables as unchangeable','readonly [-aAf] [name[=value] ...] or readonly -p','gives each name the value after its =; that it may not be changed is not kept here.',function(a,raw,w){
  if(!assigns('readonly',w.slice(1).filter(function(x){return x.charAt(0)!=='-'}),null))P.status(1);
});
cmd('local','','define local variables','local [option] name[=value] ...','makes a variable local to a shell function; there are none here, so it says so.',function(){if(P.bourne.dash()){err(P.bashAt()+'local: not in a function');P.status(2);return}err('bash: local: can only be used in a function')});
/* bash's printf builtin (printf.def): the format's backslash escapes, %s %b %q %c %d %i %o %u %x %X %e %f %g and %%, with flags, widths and
   precisions (* takes them from the words), the format again for words left over, and -v name to set a variable instead */
var PFESC={a:'\x07',b:'\b',e:'\x1b',E:'\x1b',f:'\f',n:'\n',r:'\r',t:'\t',v:'\v','\\':'\\','"':'"',"'":"'",'?':'?'};
function pfEsc(s,b){ /* the escapes of a format, or of a %b word (b), where \0nnn is octal and \c ends all output: {s, stop} */
  var o='',m;
  for(var i=0;i<s.length;i++){
    var c=s.charAt(i),n=s.charAt(i+1);
    if(c!=='\\'||i+1>=s.length){o+=c;continue}
    if(b&&n==='c')return {s:o,stop:true};
    if((m=(b?/^0([0-7]{0,3})/:/^([0-7]{1,3})/).exec(s.slice(i+1)))){o+=String.fromCharCode(parseInt(m[1]||'0',8)&255);i+=m[0].length;continue}
    if((m=/^x([0-9a-fA-F]{1,2})/.exec(s.slice(i+1)))){o+=String.fromCharCode(parseInt(m[1],16));i+=m[0].length;continue}
    if((m=/^(u[0-9a-fA-F]{1,4}|U[0-9a-fA-F]{1,8})/.exec(s.slice(i+1)))){ /* past U+10FFFF bash still writes UTF-8 bytes up to 0x7FFFFFFF, which the terminal shows as no character; past that, nothing */
      var u=parseInt(m[1].slice(1),16);o+=u<=0x10ffff?String.fromCodePoint(u):u<=0x7fffffff?'\ufffd':'';i+=m[0].length;continue}
    if(P.has(PFESC,n)&&(!b||(n!=='"'&&n!=="'"&&n!=='?'))){o+=PFESC[n];i++;continue}
    o+=c;
  }
  return {s:o,stop:false};
}
var INTMAX=2147483647,PFCAP=1<<24; /* widths and precisions are kept to 16 MB of padding: bash would write up to 2 GB */
function pfBig(x){ /* a decimal word of 1e21 or more as bash's long double holds it (x86's 64-bit mantissa, rounded to even), as a BigInt
  integer, or null for a smaller one: its printf gives every digit of it, where JavaScript's toFixed turns to an exponent */
  var m=/^\s*[-+]?(\d*)\.?(\d*)(?:[eE]([-+]?\d+))?/.exec(x||''),N,E,num,den,k,q,r,one=BigInt(1),two=BigInt(2);
  if(!m||!(m[1]+m[2])||(E=Number(m[3]||0)-m[2].length)>5000)return null;
  N=BigInt(m[1]+m[2]);if(N===BigInt(0)||m[1].replace(/^0+/,'').length+Number(m[3]||0)<22)return null;
  num=E>=0?N*BigInt(10)**BigInt(E):N;den=E>=0?one:BigInt(10)**BigInt(-E);
  k=Math.max(0,(num/den).toString(2).length-64);q=num/(den<<BigInt(k));r=num-q*(den<<BigInt(k));
  if(r*two>den<<BigInt(k)||r*two===den<<BigInt(k)&&q%two===one)q++;
  return q<<BigInt(k);
}
function pfQuote(x){ /* %q: bash's sh_backslash_quote, or $'...' for a word with a control character in it */
  if(x==='')return "''";
  if(/[\x00-\x1f\x7f]/.test(x))return "$'"+x.replace(/[\\']/g,'\\$&').replace(/[\x00-\x1f\x7f]/g,function(c){var k={'\x07':'a','\b':'b','\x1b':'E','\f':'f','\n':'n','\r':'r','\t':'t','\v':'v'}[c];return '\\'+(k||('00'+c.charCodeAt(0).toString(8)).slice(-3))})+"'";
  return x.replace(/[ \t'"\\|&;()<>!{}*\[?\]^$`,]|^[~#]/g,'\\$&');
}
cmd('printf','','formats and prints ARGUMENTS under control of the FORMAT','printf [-v var] format [arguments]',
  'prints its arguments as the format says: %s a string, %d a number, %x hex, %o octal, %c a character, %b a string with backslash escapes, %q quoted for the shell, %% a %; widths and precisions as in C. the format is used again while arguments are left. -v var puts the output in var.',
  function(a,raw,w){
    var W=w.slice(1),to=null,at=P.bashVars.at();
    function usage(){err('printf: usage: printf [-v var] format [arguments]');P.queue(function(){P.status(2)})}
    if(W[0]==='-v'){if(W.length<2){err(at+'printf: -v: option requires an argument');usage();return}to=W[1];W=W.slice(2)}
    if(W[0]==='--')W=W.slice(1);
    if(!W.length){usage();return}
    var F=W[0],A=W.slice(1),k=0,out='',bad=false,stop=false,warned=false,vbad=false;
    function arg(){return k<A.length?A[k++]:undefined}
    function star(){ /* a * width or precision: bash holds it to an int, warning (with the word after it, as bash 5.2 does) */
      var v=Number(num(arg()));
      if(Math.abs(v)>INTMAX){if(k<A.length){err(at+'printf: warning: '+A[k]+': Numerical result out of range');warned=true}v=v<0?-INTMAX:INTMAX} /* only a warning: the status stays 0 */
      return v;
    }
    function num(x,conv){ /* an integer word: 'c is its character's code; 0x and 0 prefixes; a word that is not all number is an error, with the part that was */
      if(x===undefined||x==='')return BigInt(0);
      if(/^['"]/.test(x))return BigInt(x.length>1?x.codePointAt(1):0);
      var m=/^\s*([-+]?)(0[xX][0-9a-fA-F]+|0[0-7]*|[1-9][0-9]*)/.exec(x),v=BigInt(0);
      if(m){var d=m[2];v=/^0[xX]/.test(d)?BigInt(d):/^0./.test(d)?BigInt('0o'+d.slice(1)):BigInt(d);if(m[1]==='-')v=-v}
      if(!m||m[0].length<x.length)badNum(x);
      return v;
    }
    function badNum(x){flush();err(at+'printf: '+x+': invalid number');bad=true}
    function flo(x){
      if(x===undefined||x==='')return 0;
      if(/^['"]/.test(x))return x.length>1?x.codePointAt(1):0;
      var m=/^\s*[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?|^\s*[-+]?(inf|nan)/i.exec(x),v=m?parseFloat(m[0]):0;
      if(!m||m[0].length<x.length)badNum(x);
      return v;
    }
    function flush(){ /* what it has made so far goes out before an error: bash writes as it goes */
      if(to!==null||!out)return;
      var L=out.split('\n'),last=L.pop();if(last)L.push(last);L.open=!!last;lines(L);out='';
    }
    function pad(s,fl,wd){if(wd===null||s.length>=wd)return s;return fl.indexOf('-')>=0?s+' '.repeat(wd-s.length):' '.repeat(wd-s.length)+s}
    function strOut(s,fl,wd,pr){return pad(pr!==null?s.slice(0,pr):s,fl,wd)}
    function intOut(v,c,fl,wd,pr){
      var neg=false,s;
      if(c==='d'||c==='i'){neg=v<BigInt(0);s=(neg?-v:v).toString()}
      else{s=BigInt.asUintN(64,v).toString(c==='o'?8:c==='u'?10:16);if(c==='X')s=s.toUpperCase()}
      if(pr!==null){if(!pr&&v===BigInt(0))s='';s=s.padStart(pr,'0')}
      var pre='';
      if(fl.indexOf('#')>=0){if(c==='o'&&s.charAt(0)!=='0')s='0'+s;else if((c==='x'||c==='X')&&v!==BigInt(0))pre=c==='x'?'0x':'0X'}
      if(c==='d'||c==='i')pre=neg?'-':fl.indexOf('+')>=0?'+':fl.indexOf(' ')>=0?' ':'';
      if(fl.indexOf('0')>=0&&fl.indexOf('-')<0&&pr===null&&wd!==null)return pre+s.padStart(wd-pre.length,'0');
      return pad(pre+s,fl,wd);
    }
    function floOut(v,c,fl,wd,pr,x){
      var p=pr===null?6:pr,lc=c.toLowerCase(),s,B=isFinite(v)&&Math.abs(v)>=1e21?pfBig(x):null,D=B===null?'':B.toString();
      function ex(t){return t.replace(/e([+-])(\d)$/,'e$10$2')}
      function fix(n){return B!==null?D+(n?'.'+'0'.repeat(n):''):n>100?fix(100)+'0'.repeat(n-100):Math.abs(v).toFixed(n)} /* JavaScript stops at 100 digits; the rest are taken as zeros */
      function expo(n){
        if(B===null)return n>100?expo(100).replace('e','0'.repeat(n-100)+'e'):ex(Math.abs(v).toExponential(n));
        var d=BigInt(D.slice(0,n+1)||'0'),rest=D.slice(n+1),X=D.length-1; /* the exact digits, rounded to n after the point, half to even */
        if(rest&&(rest>'5'+'0'.repeat(rest.length-1)||rest==='5'+'0'.repeat(rest.length-1)&&d%BigInt(2)===BigInt(1)))d++;
        var t=d.toString();if(t.length>n+1){t=t.slice(0,n+1);X++}
        return t.charAt(0)+(n?'.'+t.slice(1).padEnd(n,'0'):'')+'e+'+X;
      }
      if(!isFinite(v))s=isNaN(v)?'nan':(v<0?'-':'')+'inf';
      else if(lc==='f')s=fix(p);
      else if(lc==='e')s=expo(p);
      else{
        var P0=p||1,X=v?Math.floor(Math.log10(Math.abs(v))):0;
        if(v&&Number(expo(Math.min(P0-1,100)).split('e')[1])!==X)X++;
        s=P0>X&&X>=-4?fix(Math.max(0,P0-1-X)):expo(P0-1);
        if(fl.indexOf('#')<0)s=s.replace(/(\.\d*?)0+(e|$)/,'$1$2').replace(/\.(e|$)/,'$1'); /* only zeros after the point go */
      }
      if(fl.indexOf('#')>=0&&isFinite(v)&&s.indexOf('.')<0)s=s.replace(/e|$/,'.$&'); /* # keeps the point */
      if(c!==lc)s=s.toUpperCase();
      var pre=v<0||Object.is(v,-0)?'-':fl.indexOf('+')>=0?'+':fl.indexOf(' ')>=0?' ':'';
      if(fl.indexOf('0')>=0&&fl.indexOf('-')<0&&wd!==null&&isFinite(v))return pre+s.padStart(wd-pre.length,'0');
      return pad(pre+s,fl,wd);
    }
    var T=[]; /* the format read once: {s: text}, a conversion {fl, wd, pr, cv} as written, or {bad: one with no format character}, the last */
    for(var i=0;i<F.length;i++){
      var c=F.charAt(i);
      if(c==='\\'){var e=/^\\(0[0-7]{0,3}|[0-7]{1,3}|x[0-9a-fA-F]{1,2}|u[0-9a-fA-F]{1,4}|U[0-9a-fA-F]{1,8}|.)?/.exec(F.slice(i))[0];c=pfEsc(e,false).s;i+=e.length-1}
      else if(c==='%'){
        var m=/^%([-+ #0]*)(\*|\d+)?(?:\.(\*|\d*))?[hjlLtz]*([\s\S])?/.exec(F.slice(i)),cv=m[4]; /* C's length modifiers are passed over */
        if(!cv){T.push({bad:"`"+F.slice(i)+"': missing format character"});break}
        if(!/[sbqcdiouxXeEfFgG%]/.test(cv)){T.push({bad:"`"+cv+"': invalid format character"});break}
        i+=m[0].length-1;
        if(cv!=='%'){T.push({fl:m[1],wd:m[2]===undefined?null:m[2],pr:m[3]===undefined?null:m[3],cv:cv});continue}
      }
      if(T.length&&T[T.length-1].s!==undefined)T[T.length-1].s+=c;else T.push({s:c});
    }
    do{
      var took=false;
      for(var j=0;j<T.length&&!stop;j++){
        var tk=T[j];
        if(tk.s!==undefined){out+=tk.s;continue}
        if(tk.bad!==undefined){flush();err(at+'printf: '+tk.bad);P.queue(function(){P.status(1)});stop=true;bad=null;break}
        var fl=tk.fl,wd=tk.wd,pr=tk.pr;cv=tk.cv;
        if(wd==='*'){took=true;wd=star();if(wd<0){fl+='-';wd=-wd}}else if(wd!==null)wd=+wd;
        if(pr==='*'){took=true;pr=star();if(pr<0)pr=null}else if(pr!==null)pr=+pr||0;
        var x=arg();if(x!==undefined)took=true;
        if(wd>INTMAX||pr>INTMAX)continue; /* C's printf refuses a width or precision past INT_MAX, and bash writes nothing for it */
        if(wd>PFCAP)wd=PFCAP;if(pr>PFCAP&&!/[sbq]/.test(cv))pr=PFCAP;
        var sx=x===undefined?'':x;
        if(cv==='s')out+=strOut(sx,fl,wd,pr);
        else if(cv==='b'){var r=pfEsc(sx,true);out+=strOut(r.s,fl,wd,pr);if(r.stop)stop=true}
        else if(cv==='q')out+=strOut(pfQuote(sx),fl,wd,pr);
        else if(cv==='c')out+=pad(sx.charAt(0),fl,wd);
        else if(/[diouxX]/.test(cv))out+=intOut(num(x),cv,fl,wd,pr);
        else out+=floOut(flo(x),cv,fl,wd,pr,x);
      }
    }while(!stop&&took&&k<A.length);
    if(to!==null){if(!P.bashVars.asg(to+'='+out)){err(at+'printf: `'+to+"': not a valid identifier");vbad=true;P.queue(function(){P.status(2)})}}
    else flush();
    if(bad)P.queue(function(){P.status(1)});
    else if(warned&&!vbad)P.queue(function(){P.status(0)}); /* the warning's red line set it to 1 */
  });
cmd('unset','','unset values and attributes of shell variables and functions','unset [-f] [-v] [-n] [name ...]','removes each variable named, or one element of an array: unset \'x[1]\'.',function(a,raw,w){
  var bad=false;
  w.slice(1).filter(function(x){return !/^-[fvn]+$/.test(x)}).forEach(function(k){if(!P.bashVars.unset(k)){err("bash: unset: `"+k+"': not a valid identifier");bad=true}});
  if(bad)P.status(1);
});
cmd('env','/usr/bin','run a program in a modified environment','env [OPTION]... [-] [NAME=VALUE]... [COMMAND [ARG]...]',['sets each NAME to VALUE in the environment and runs COMMAND. with no command, prints the resulting environment, one NAME=value to a line.','',
  '-i, --ignore-environment   start with an empty environment',
  '-u, --unset=NAME   remove variable from the environment'],function(a,raw,w){
  /* coreutils' env: its options stop at the first word that is none (getopt's +), then NAME=VALUE words, then the program, which it
     execs: a program file, not a builtin of the shell (127 if there is none) */
  var W=w.slice(1),clear=false,un=[],set=[],i=0;
  for(;i<W.length;i++){
    var x=W[i],m;
    if(x==='-'||x==='-i'||x==='--ignore-environment'){clear=true;continue}
    if(x==='--'){i++;break}
    if(x==='-u'||x==='--unset'){if(i+1>=W.length){err(x==='-u'?"env: option requires an argument -- 'u'":"env: option '--unset' requires an argument");err("Try 'env --help' for more information.");P.queue(function(){P.status(125)});return}un.push(W[++i]);continue}
    if((m=/^(?:-u|--unset=)(.+)$/.exec(x))){un.push(m[1]);continue}
    if(/^--./.test(x)){err("env: unrecognized option '"+x+"'");err("Try 'env --help' for more information.");P.queue(function(){P.status(125)});return}
    if(/^-./.test(x)){err("env: invalid option -- '"+x.charAt(1)+"'");err("Try 'env --help' for more information.");P.queue(function(){P.status(125)});return}
    break;
  }
  for(;i<W.length&&/^[^=]+=/.test(W[i]);i++)set.push(W[i]);
  var E=clear?{}:envAll();
  un.forEach(function(k){delete E[k]});
  set.forEach(function(x){var k=x.slice(0,x.indexOf('='));E[k]=x.slice(k.length+1)});
  if(i>=W.length){lines(Object.keys(E).sort().map(function(k){return k+'='+E[k]}));return}
  var c=W[i],at=c.indexOf('/')>=0?P.find(c):null;
  if(c.indexOf('/')>=0?!at||at.type==='d':!P.has(P.paths,c)){err("env: '"+c+"': No such file or directory");P.queue(function(){P.status(127)});return}
  var keep=Object.assign({},P.env),q=function(s){return "'"+s.replace(/'/g,"'\\''")+"'"};
  Object.keys(P.env).forEach(function(k){if(!P.has(E,k))delete P.env[k]});
  Object.keys(E).forEach(function(k){P.env[k]=E[k]});
  var X=exported(),gone=['HOME','LOGNAME','USER'].filter(function(k){return !P.has(E,k)}),was=gone.map(function(k){return X[k]});
  gone.forEach(function(k){X[k]=false}); /* those the session sets itself are left out of the program's environment as export -n leaves them out */
  var own=P.ownEnv(true); /* HOME, USER and LOGNAME too: a shell it runs expands what it got, not the session's own */
  P.exec(W.slice(i).map(q).join(' '));
  P.queue(function(){Object.keys(P.env).forEach(function(k){delete P.env[k]});Object.assign(P.env,keep);gone.forEach(function(k,j){X[k]=was[j]});P.ownEnv(own)},true); /* the program's environment was its own */
});
cmd('printenv','/usr/bin','print all or part of environment','printenv [OPTION]... [VARIABLE]...',['prints the values of the specified environment VARIABLE(s). if no VARIABLE is specified, prints name and value pairs for them all.','',
  '-0, --null   end each output line with NUL, not newline','',
  'exit status: 0 if all variables specified were found, 1 if at least one was not, 2 if a write error occurred.'],function(a,raw,w){
  var g=gopts('printenv',w.slice(1),'0',['null'],'');
  if(!g)return P.queue(function(){P.status(2)});
  var E=envAll(),nul=g.o['0']||g.o['null'],L=g.ops.length?g.ops.filter(function(k){return k.indexOf('=')<0&&P.has(E,k)}).map(function(k){return E[k]}):Object.keys(E).sort().map(function(k){return k+'='+E[k]});
  if(L.length)nul?P.typeLine(L.join('')):lines(L); /* NUL shows as nothing */
  if(L.length<g.ops.length)P.queue(function(){P.status(1)});
});
cmd('man','/usr/bin','an interface to the system reference manuals','man [OPTION...] [SECTION] PAGE...','prints the manual page for each page named. a section number, if given, is checked for the games in /usr/local/games, whose pages are in section 6; for the rest it is accepted and changes nothing here.',function(a){
  var w=[],sec;
  a.forEach(function(x){if(/^\d\w*$/.test(x))sec=sec||x;else if(x.charAt(0)!=='-')w.push(x)});
  if(!w.length){P.say(['What manual page do you want?',"For example, try 'man man'."]);P.status(1);return}
  w.forEach(function(x,i){
    if(i)P.typeLine('');
    var has=P.has(P.man,x),p=has?P.man[x]:null;
    if(p&&p.sec&&sec&&String(p.sec)!==sec.charAt(0))p=null; /* a page with its own section: man 1 rogue looks in section 1 */
    if(p)P.say(P.manPage(x));
    else{err('No manual entry for '+x+(sec&&has?' in section '+sec:''));P.status(16)}
  });
},{core:true,help:'the manual'});
function homeOf(u){return u==='root'?'/root':'/home/'+u}
function known(u){return u==='root'||u===P.st.owner||u===P.st.user||/^[a-z_][a-z0-9_-]*$/.test(u)&&!!P.find('/home/'+u,true)}
function nest(who,login){ /* a shell started by root, as root or anyone: no password, and exit comes back. Anyone else is kept out of root's files */
  STK.push({say:login?'logout':'exit',user:P.st.user,home:P.st.home,cwd:P.st.cwd,al:P.aliases}); /* al: the aliases of the shell su was typed in; the new shell's go with it */
  P.st.user=who;P.st.home=homeOf(who);if(login)P.st.cwd=P.st.home;P.relock(who!=='root');
}
function as(who,line,sudo,login){ /* one command line as another user, then back, ^C or not */
  var w0=line.trim().split(/\s+/)[0]||'';
  if(sudo&&BUILTIN.indexOf(w0)>=0&&!/^(echo|false|kill|printf|pwd|test|true|\[)$/.test(w0)){err('sudo: '+w0+': command not found');P.status(1);return} /* the shell's own commands are no programs sudo can find; these few are both */
  if(/^(exit|logout)$/.test(w0))return; /* su's shell just ends */
  var n=STK.length,u=P.st.user,h=P.st.home,c=P.st.cwd,al=P.aliases,held=P.rootHeld();
  if(held){P.st.user=who;P.relock(who!=='root')}
  else{P.su('bash');P.st.home='/root'}
  if(login)P.st.cwd=homeOf(who); /* su - starts in the user's home */
  RUN++;P.exec(line);
  P.queue(function(){
    RUN--;P.loop(null); /* an exit in the line ended that line only */
    if(STK.length>n)STK.length=n; /* any shell the command started has ended with it */
    if(!held){P.unsu();return}
    if(P.rootHeld()){P.st.user=u;P.st.home=h;P.st.cwd=c;P.aliases=al;P.relock(u!=='root')}
  },true);
}
cmd('su','/usr/bin','run a command with substitute user and group ID','su [options] [-] [user [argument...]]',
  ['asks for the password of the user named, root if none is, and starts a shell as that user. -c runs one command instead.','',
  '-c, --command command   pass command to the shell with the -c option',
  '-g, --group group   specify the primary group. this option is available to the root user only',
  '-G, --supp-group group   specify a supplementary group. this option is available to the root user only',
  '-, -l, --login   start the shell as a login shell, in the user\'s home directory',
  '-s, --shell shell   run the specified shell instead of the default; here it is always bash'],function(a){
  var A=[],who=null,login=false,run=null,grp=false,m,i;
  a.forEach(function(x){ /* -lc id is -l -c id */
    if(!/^-[^-]./.test(x)){A.push(x);return}
    for(var k=1;k<x.length;k++){var ch=x.charAt(k);A.push('-'+ch);if('csgG'.indexOf(ch)>=0){if(k+1<x.length)A.push(x.slice(k+1));break}}
  });
  for(i=0;i<A.length;i++){
    var x=A[i];
    if(/^(-|-l|--login)$/.test(x))login=true;
    else if(/^(-c|--command|-s|--shell|-g|--group|-G|--supp-group)$/.test(x)){
      if(i+1>=A.length){err("su: option requires an argument -- '"+(x.charAt(1)==='-'?x.charAt(2):x.charAt(1))+"'");err("Try 'su --help' for more information.");P.status(1);return}
      if(/^(-c|--command)$/.test(x))run=A[i+1];
      else if(/^-[gG]|^--(group|supp)/.test(x))grp=true;
      i++;
    }
    else if((m=x.match(/^--command=(.*)$/)))run=m[1];
    else if(/^--(group|supp-group)=/.test(x))grp=true;
    else if(x.charAt(0)==='-'&&x.length>1)continue;
    else if(who===null)who=x;
  }
  who=who||'root';
  if(grp&&P.st.user!=='root'){err('su: only root can specify alternative groups');P.status(1);return}
  if(!known(who)){err('su: user '+who+' does not exist or the user entry does not contain all the required fields');P.status(1);return}
  if(P.st.user==='root'){if(run!=null)as(who,run,false,login);else nest(who,login);return} /* root is asked nothing */
  var piped=P.stdin(); /* a password piped in is read like a typed one */
  function tried(l){
    if(l===null||l===P.INT)return;
    var word=P.profile.rootPassword;
    if(who==='root'&&word&&P.fold(l)===P.fold(word)){
      if(piped){P.typeLine('Password: ','err',null,{open:true});P.queue(function(){P.status(0)})} /* to the terminal, not the pipe, and the line stays open */
      if(run!=null){as('root',run,false,login);return}
      if(piped)return; /* the shell reads the rest of the pipe, finds nothing, and ends */
      if(P.rootHeld()){nest('root',login);return} /* under root already: one more shell */
      STK.push({say:login?'logout':'exit',base:true,from:P.st.user});
      P.su('bash');P.st.home='/root';if(login)P.st.cwd='/root'; /* su keeps the folder; su - goes to root's */
      return;
    }
    P.pause(2200);
    err((piped?'Password: ':'')+'su: Authentication failure');P.status(1);
  }
  if(piped){tried(String([].concat(piped)[0]||''));return}
  P.ask('Password: ',tried,false,true);
});
cmd('sudo','/usr/bin','execute a command as another user','sudo -K | -k | -V or sudo [-u user] [-i | -s] [command [arg ...]]',
  ['runs a command as the superuser or another user, after asking for your own password, if the security policy says you may.','',
  '-i, --login   run the target user\'s shell as a login shell, or the command given',
  '-K   remove every cached credential for the user',
  '-k   invalidate the user\'s cached credentials',
  '-s, --shell   run a shell as the target user, or the command given',
  '-u user, --user=user   run the command as a user other than the default target user (usually root)',
  '-V   print the sudo version string'],function(a,raw){
  if(!a.length){P.say(['usage: sudo -h | -K | -k | -V','usage: sudo -v [-ABkNnS] [-g group] [-h host] [-p prompt] [-u user]','usage: sudo [-ABbEHkNnPS] [-u user] [VAR=value] [-i | -s] [command [arg ...]]']);P.status(1);return}
  if(a[0]==='-V'){P.typeLine('Sudo version 1.9.16p2');return}
  if(a[0]==='-k'||a[0]==='-K')return;
  if(P.st.user==='root'){ /* root may do anything, and is not asked: the rest of the line, quotes and all, as it was typed */
    var line=String(raw||'').replace(/^\s*\S+\s*/,''),u='root',sh=0,m;
    while((m=line.match(/^(?:(?:-u|--user)\s+|--user=|-u)(\S+)\s*|^(-i|--login|-s|--shell)(?=\s|$)\s*|^(--)(?=\s|$)\s*|^-\S+\s*/))){
      line=line.slice(m[0].length);
      if(m[1])u=m[1];else if(m[2])sh=/i|login/.test(m[2])?2:1;else if(m[3])break;
    }
    if(!known(u)){err('sudo: unknown user '+u);err('sudo: error initializing audit plugin sudoers_audit');P.status(1);return}
    if(!line.trim()){if(sh)nest(u,sh===2);else P.say(['usage: sudo -h | -K | -k | -V','usage: sudo -v [-ABkNnS] [-g group] [-h host] [-p prompt] [-u user]','usage: sudo [-ABbEHkNnPS] [-u user] [VAR=value] [-i | -s] [command [arg ...]]']);return}
    as(u,line,true);
    return;
  }
  P.ask('[sudo] password for '+P.st.user+': ',function(l){
    if(l===null||l===P.INT)return;
    P.pause(1500);
    err(P.st.user+' is not in the sudoers file.');
  },false,true);
});
cmd('tty','/usr/bin','print the file name of the terminal connected to standard input','tty [OPTION]...','prints the name of the terminal you are typing on.',function(){P.typeLine('/dev/ttyS0')});
/* stty: GNU coreutils 9.7's, on the serial console agetty left it (Debian's serial-getty@: --noreset --keep-baud 115200,..., its
   termio_init and termio_final): 115200 baud, cs8 hupcl cread clocal, icrnl ixon ixoff, opost onlcr, isig icanon echo echoe echok
   echoke (no iexten, no echoctl). A serial line has no window size: rows 0, columns 0. The settings are kept; the speed is the
   line's (below 115200 the output comes at that speed), the rest change only what stty reports */
var TT={speed:115200,rows:0,cols:0,line:0,f:{c:0x400|0x80|0x800|0x30,i:0x100|0x400|0x1000,o:1|4,l:1|2|8|0x10|0x20|0x800},
  cc:{intr:3,quit:28,erase:127,kill:21,eof:4,eol:0,eol2:0,swtch:0,start:17,stop:19,susp:26,rprnt:18,werase:23,lnext:22,discard:15,min:1,time:0}};
/* stty.c's mode_info: [name, field, bits, mask, how]. how: S set by sane, U unset by sane, R may be negated (-name) */
var TMODE=[['parenb','c',0x100,0,'R'],['parodd','c',0x200,0,'R'],['cmspar','c',0x40000000,0,'R'],['cs5','c',0,0x30,''],['cs6','c',0x10,0x30,''],['cs7','c',0x20,0x30,''],['cs8','c',0x30,0x30,''],
  ['hupcl','c',0x400,0,'R'],['hup','c',0x400,0,'RO'],['cstopb','c',0x40,0,'R'],['cread','c',0x80,0,'SR'],['clocal','c',0x800,0,'R'],['crtscts','c',0x80000000,0,'R'],
  ['ignbrk','i',1,0,'UR'],['brkint','i',2,0,'SR'],['ignpar','i',4,0,'R'],['parmrk','i',8,0,'R'],['inpck','i',0x10,0,'R'],['istrip','i',0x20,0,'R'],['inlcr','i',0x40,0,'UR'],['igncr','i',0x80,0,'UR'],
  ['icrnl','i',0x100,0,'SR'],['ixon','i',0x400,0,'R'],['ixoff','i',0x1000,0,'UR'],['tandem','i',0x1000,0,'URO'],['iuclc','i',0x200,0,'UR'],['ixany','i',0x800,0,'UR'],['imaxbel','i',0x2000,0,'SR'],['iutf8','i',0x4000,0,'UR'],
  ['opost','o',1,0,'SR'],['olcuc','o',2,0,'UR'],['ocrnl','o',8,0,'UR'],['onlcr','o',4,0,'SR'],['onocr','o',0x10,0,'UR'],['onlret','o',0x20,0,'UR'],['ofill','o',0x40,0,'UR'],['ofdel','o',0x80,0,'UR'],
  ['nl1','o',0x100,0x100,'U'],['nl0','o',0,0x100,'S'],['cr3','o',0x600,0x600,'U'],['cr2','o',0x400,0x600,'U'],['cr1','o',0x200,0x600,'U'],['cr0','o',0,0x600,'S'],
  ['tab3','o',0x1800,0x1800,'U'],['tab2','o',0x1000,0x1800,'U'],['tab1','o',0x800,0x1800,'U'],['tab0','o',0,0x1800,'S'],['bs1','o',0x2000,0x2000,'U'],['bs0','o',0,0x2000,'S'],
  ['vt1','o',0x4000,0x4000,'U'],['vt0','o',0,0x4000,'S'],['ff1','o',0x8000,0x8000,'U'],['ff0','o',0,0x8000,'S'],
  ['isig','l',1,0,'SR'],['icanon','l',2,0,'SR'],['iexten','l',0x8000,0,'SR'],['echo','l',8,0,'SR'],['echoe','l',0x10,0,'SR'],['crterase','l',0x10,0,'RO'],['echok','l',0x20,0,'SR'],['echonl','l',0x40,0,'UR'],
  ['noflsh','l',0x80,0,'UR'],['xcase','l',4,0,'UR'],['tostop','l',0x100,0,'UR'],['echoprt','l',0x400,0,'UR'],['prterase','l',0x400,0,'URO'],['echoctl','l',0x200,0,'SR'],['ctlecho','l',0x200,0,'SRO'],
  ['echoke','l',0x800,0,'SR'],['crtkill','l',0x800,0,'SRO'],['flusho','l',0x1000,0,'UR'],['extproc','l',0x10000,0,'UR']];
var TCC=['intr','quit','erase','kill','eof','eol','eol2','swtch','start','stop','susp','rprnt','werase','lnext','discard'],
  TCCX=['intr','quit','erase','kill','eof','time','min','swtch','start','stop','susp','eol','rprnt','discard','werase','lnext','eol2']; /* c_cc[] in Linux's order, for -g */
var TSANE={intr:3,quit:28,erase:127,kill:21,eof:4,eol:0,eol2:0,swtch:0,start:17,stop:19,susp:26,rprnt:18,werase:23,lnext:22,discard:15};
var TSPEEDS=[0,50,75,110,134,150,200,300,600,1200,1800,2400,4800,9600,19200,38400,57600,115200,230400,460800,500000,576000,921600,1000000,1152000,1500000,2000000,2500000,3000000,3500000,4000000];
var TBAUD={0:0,50:1,75:2,110:3,134:4,150:5,200:6,300:7,600:8,1200:9,1800:10,2400:11,4800:12,9600:13,19200:14,38400:15,57600:0x1001,115200:0x1002,230400:0x1003,460800:0x1004,500000:0x1005,
  576000:0x1006,921600:0x1007,1000000:0x1008,1152000:0x1009,1500000:0x100a,2000000:0x100b,2500000:0x100c,3000000:0x100d,3500000:0x100e,4000000:0x100f}; /* Bnnn in c_cflag, for -g */
/* the combination settings: what each turns on and off (and the characters it sets); [plus, minus] for those that may be negated */
var TCOMBO={evenp:['parenb -parodd cs7','-parenb cs8'],parity:['parenb -parodd cs7','-parenb cs8'],oddp:['parenb parodd cs7','-parenb cs8'],nl:['-icrnl -onlcr','icrnl -inlcr -igncr onlcr -ocrnl -onlret'],
  ek:['erase=127 kill=21'],sane:[TMODE.filter(function(m){return /[SU]/.test(m[4])&&!/O/.test(m[4])&&(!m[3]||/S/.test(m[4]))}).map(function(m){return (/U/.test(m[4])&&!m[3]?'-':'')+m[0]}).join(' ')+' sane'],
  raw:['-ignbrk -brkint -ignpar -parmrk -inpck -istrip -inlcr -igncr -icrnl -ixon -ixoff -iuclc -ixany -imaxbel -iutf8 -opost -isig -icanon -xcase min=1 time=0','brkint ignpar istrip icrnl ixon opost isig icanon'],
  cbreak:['-icanon','icanon'],pass8:['-parenb -istrip cs8','parenb istrip cs7'],litout:['-parenb -istrip -opost cs8','parenb istrip opost cs7'],decctlq:['-ixany','ixany'],tabs:['tab0','tab3'],
  lcase:['xcase iuclc olcuc','-xcase -iuclc -olcuc'],crt:['echoe echoctl echoke'],dec:['echoe echoctl echoke -ixany intr=3 erase=127 kill=21']};
TCOMBO.cooked=[TCOMBO.raw[1],TCOMBO.raw[0]];TCOMBO.LCASE=TCOMBO.lcase;
function ttyChar(c){return c===0?'<undef>':c===127?'^?':c<32?'^'+String.fromCharCode(c+64):c>127?'M-'+ttyChar(c-128):String.fromCharCode(c)}
function ttyMode(m){var T=TT.f[m[1]];return m[3]?(T&m[3])===m[2]:(T&m[2])===m[2]}
function ttyShow(all){ /* display_all and display_changed, wrapped as wrapf does at 80 columns (a serial line has none of its own) */
  var L=[],col=0,cur='',max=TT.cols||80;
  function wrapf(s){if(col>0){if(max-col<=s.length){L.push(cur);cur='';col=0}else{cur+=' ';col++}}cur+=s;col+=s.length}
  function nl(){if(col){L.push(cur);cur='';col=0}}
  wrapf('speed '+TT.speed+' baud;');
  if(all)wrapf('rows '+TT.rows+'; columns '+TT.cols+';');
  wrapf('line = '+TT.line+';');nl();
  TCC.forEach(function(k){if(all||TT.cc[k]!==TSANE[k])wrapf(k+' = '+ttyChar(TT.cc[k])+';')});
  if(all||!(TT.f.l&2)){wrapf('min = '+TT.cc.min+'; time = '+TT.cc.time+';')}
  nl();
  var prev='';
  TMODE.forEach(function(m){
    if(/O/.test(m[4]))return; /* another name for one already shown */
    if(m[1]!==prev){nl();prev=m[1]}
    var on=ttyMode(m);
    if(all){if(on)wrapf(m[0]);else if(/R/.test(m[4]))wrapf('-'+m[0])}
    else if(on){if(/U/.test(m[4]))wrapf(m[0])}
    else if(/S/.test(m[4])&&/R/.test(m[4]))wrapf('-'+m[0]);
  });
  nl();
  return L;
}
function ttySave(){
  var cc=[],h=function(x){return x.toString(16)};
  for(var i=0;i<32;i++)cc.push(h(TCCX[i]?TT.cc[TCCX[i]]:0));
  return [h(TT.f.i),h(TT.f.o),h((TT.f.c&~0x100f)|TBAUD[TT.speed]),h(TT.f.l)].concat(cc).join(':');
}
cmd('stty','/usr/bin','change and print terminal line settings','stty [-F DEVICE | --file=DEVICE] [SETTING]...',['print or change terminal characteristics. with no setting, it prints the line speed, the line discipline and the settings that differ from what stty sane would make them.','',
  '-a, --all   print all current settings in human-readable form',
  '-g, --save   print all current settings in a stty-readable form',
  '-F, --file=DEVICE   open and use the specified DEVICE instead of stdin',
  'N   set the input and output speeds to N bauds: 0 50 75 110 134 150 200 300 600 1200 1800 2400 4800 9600 19200 38400 57600 115200 and up to 4000000. below 115200 you can watch the output arrive',
  'ispeed N, ospeed N   set the input or output speed to N',
  'rows N, cols N, columns N   tell the kernel that the terminal has N rows or columns',
  'line N   use line discipline N',
  'size   print the number of rows and columns according to the kernel',
  'speed   print the terminal speed',
  'intr, quit, erase, kill, eof, eol, eol2, swtch, start, stop, susp, rprnt, werase, lnext, discard CHAR   set the special character: CHAR is a character, ^c, ^? or ^-, or undef to disable it',
  'min N, time N   with -icanon, read at least N characters, or time out after N tenths of a second',
  '[-]parenb [-]parodd [-]cmspar cs5 cs6 cs7 cs8 [-]hupcl [-]hup [-]cstopb [-]cread [-]clocal [-]crtscts   control settings',
  '[-]ignbrk [-]brkint [-]ignpar [-]parmrk [-]inpck [-]istrip [-]inlcr [-]igncr [-]icrnl [-]ixon [-]ixoff [-]tandem [-]iuclc [-]ixany [-]imaxbel [-]iutf8   input settings',
  '[-]opost [-]olcuc [-]ocrnl [-]onlcr [-]onocr [-]onlret [-]ofill [-]ofdel nl0 nl1 cr0 cr1 cr2 cr3 tab0 tab1 tab2 tab3 bs0 bs1 vt0 vt1 ff0 ff1   output settings',
  '[-]isig [-]icanon [-]iexten [-]echo [-]echoe [-]crterase [-]echok [-]echonl [-]noflsh [-]xcase [-]tostop [-]echoprt [-]prterase [-]echoctl [-]ctlecho [-]echoke [-]crtkill [-]flusho [-]extproc   local settings',
  '[-]evenp [-]parity [-]oddp [-]nl ek sane [-]raw [-]cooked [-]cbreak [-]pass8 [-]litout [-]decctlq [-]tabs [-]lcase [-]LCASE crt dec   combination settings, as stty(1) tells them',
  'the settings are kept and reported; apart from the speed, this terminal goes on as it was.'],function(a,raw,w){
  var W=w.slice(1),S=[],style=null,dev=null,bad=function(t){err('stty: '+t);err("Try 'stty --help' for more information.");P.queue(function(){P.status(1)})};
  for(var i=0;i<W.length;i++){
    var x=W[i],f=/^(?:-F|--file=?)(.*)$/.exec(x);
    if(f){dev=f[1]||(/=$/.test(x)?'':W[++i]);if(dev===undefined){bad("option requires an argument -- 'F'");return}continue}
    if(x==='-a'||x==='--all'){if(style==='g'){err('stty: the options for verbose and stty-readable output styles are');err('mutually exclusive');P.queue(function(){P.status(1)});return}style='a';continue}
    if(x==='-g'||x==='--save'){if(style==='a'){err('stty: the options for verbose and stty-readable output styles are');err('mutually exclusive');P.queue(function(){P.status(1)});return}style='g';continue}
    if(/^-[ag]+$/.test(x)&&x.length>2){W.splice.apply(W,[i,1].concat(x.slice(1).split('').map(function(c){return '-'+c})));i--;continue}
    S.push(x);
  }
  if(dev!==null){ /* this terminal (its own name, or /dev/tty) is the one it sets; another is not the guest's to open */
    var dn=P.find(dev);
    if(!dn||!dn.dev||dn.prot||!/^\/dev\/(tty|ttyS0)$/.test(P.norm(dev))){err('stty: '+dev+': '+(!dn?'No such file or directory':dn.prot||/^\/dev\/(tty|console)/.test(P.norm(dev))?'Permission denied':'Inappropriate ioctl for device'));P.queue(function(){P.status(1)});return}
  }
  else if(P.stdin()){err("stty: 'standard input': Inappropriate ioctl for device");P.queue(function(){P.status(1)});return} /* a pipe is no terminal */
  if(style&&S.length){err('stty: when specifying an output style, modes may not be set');P.queue(function(){P.status(1)});return}
  if(style==='g'){P.typeLine(ttySave());return}
  if(style==='a'||!S.length){P.say(ttyShow(style==='a'));return}
  var was=JSON.stringify(TT),num=function(v){return /^(0x[0-9a-f]+|0[0-7]*|[1-9]\d*)$/i.test(v)?parseInt(v,/^0x/i.test(v)?16:/^0\d/.test(v)?8:10):NaN};
  function set(t,inner){ /* one setting: false if there is no such. inner: a combination's own, which may set a character (name=code) */
    var neg=t.charAt(0)==='-',n=neg?t.slice(1):t,kv=inner&&/^(\w+)=(\d+)$/.exec(t);
    if(kv){TT.cc[kv[1]]=+kv[2];return true}
    var m=TMODE.filter(function(m){return m[0]===n})[0];
    if(m){
      if(neg&&!/R/.test(m[4]))return false;
      var T=TT.f[m[1]];
      TT.f[m[1]]=m[3]?(T&~m[3])|m[2]:neg?T&~m[2]:T|m[2];
      return true;
    }
    var c=TCOMBO[n];
    if(!c||neg&&!c[1])return false;
    (neg?c[1]:c[0]).split(' ').forEach(function(s){if(s==='sane'){Object.assign(TT.cc,TSANE,{min:1,time:0})}else set(s,true)});
    return true;
  }
  for(var j=0;j<S.length;j++){
    var s=S[j];
    if(TCC.indexOf(s)>=0||s==='min'||s==='time'||/^(ispeed|ospeed|rows|cols|columns|line)$/.test(s)){
      var v=S[++j];
      if(v===undefined){TT=JSON.parse(was);bad("missing argument to '"+s+"'");return}
      if(TCC.indexOf(s)>=0){
        var ch=v==='^-'||v==='undef'?0:v==='^?'?127:/^\^.$/.test(v)?v.charCodeAt(1)&31:v.length===1?v.charCodeAt(0):num(v);
        if(isNaN(ch)||ch>255){TT=JSON.parse(was);err("stty: invalid integer argument: '"+v+"'");P.queue(function(){P.status(1)});return}
        TT.cc[s]=ch;
      }
      else{
        var k=num(v);
        if(/speed$/.test(s)){if(TSPEEDS.indexOf(+v)<0||!/^\d+$/.test(v)){TT=JSON.parse(was);bad("invalid "+s+" '"+v+"'");return}TT.speed=+v}
        else if(isNaN(k)){TT=JSON.parse(was);err("stty: invalid integer argument: '"+v+"'");P.queue(function(){P.status(1)});return}
        else if(s==='rows')TT.rows=k;else if(s==='line')TT.line=k;else if(s==='min'||s==='time')TT.cc[s]=k;else TT.cols=k;
      }
      continue;
    }
    if(s==='size'){P.typeLine(TT.rows+' '+TT.cols);continue}
    if(s==='speed'){P.typeLine(String(TT.speed));continue}
    if(/^\d+$/.test(s)&&TSPEEDS.indexOf(+s)>=0){TT.speed=+s;continue}
    if(/^[0-9a-f]+(:[0-9a-f]+){35}$/i.test(s)){ /* what -g printed */
      var g=s.split(':').map(function(x){return parseInt(x,16)}),bd=g[2]&0x100f;
      TT.f={i:g[0],o:g[1],c:g[2]&~0x100f,l:g[3]};
      TCCX.forEach(function(k,i){TT.cc[k]=g[4+i]});
      Object.keys(TBAUD).forEach(function(b){if(TBAUD[b]===bd)TT.speed=+b});
      continue;
    }
    if(!set(s)){TT=JSON.parse(was);bad("invalid argument '"+s+"'");return}
  }
  P.baud(TT.speed&&TT.speed<115200?TT.speed:0);
});
function idOf(u){ /* what id and groups read for the user u: the numbers in /etc/passwd, the groups in /etc/group (the user's own first). null if there is no such user */
  var pw=P.find('/etc/passwd',true),gr=P.find('/etc/group',true),r=null;
  (pw&&pw.type==='f'?P.text(pw):[]).some(function(l){var f=l.split(':');if(f[0]===u&&f.length>3){r={uid:+f[2],gid:+f[3],G:[]};return true}return false});
  if(!r){ /* not listed: as this machine's own users have always been */
    if(u!=='root'&&u!==P.st.user&&u!==P.st.owner)return null;
    var k=u==='root'?0:u===P.st.owner?1000:1001;
    return {uid:k,gid:k,G:u==='root'?[[0,'root']]:[[k,u],[100,'users']]};
  }
  var L=gr&&gr.type==='f'?P.text(gr).map(function(l){return l.split(':')}):[],own=L.filter(function(f){return +f[2]===r.gid})[0];
  r.G.push([r.gid,own?own[0]:String(r.gid)]);
  L.forEach(function(f){if(+f[2]!==r.gid&&(f[3]||'').split(',').indexOf(u)>=0)r.G.push([+f[2],f[0]])});
  return r;
}
cmd('id','/usr/bin','print real and effective user and group IDs','id [OPTION]... [USER]','prints who you are to the system, or who USER is: the user and group numbers, and the groups.',function(a,raw,w){
  var u=w[1]!==undefined?w[1]:P.st.user,r=idOf(u);
  if(w.length>2){err("id: extra operand '"+w[2]+"'");err("Try 'id --help' for more information.");return}
  if(!r){err("id: '"+u+"': no such user");return}
  P.typeLine('uid='+r.uid+'('+u+') gid='+r.G[0][0]+'('+r.G[0][1]+') groups='+r.G.map(function(g){return g[0]+'('+g[1]+')'}).join(','));
});
cmd('groups','/usr/bin','print the groups a user is in','groups [OPTION]... [USERNAME]...','prints the groups you are in, or those of each user named, after the name and a colon.',function(a,raw,w){
  var U=w.slice(1);
  if(!U.length){P.typeLine((idOf(P.st.user)||{G:[]}).G.map(function(g){return g[1]}).join(' '));return}
  U.forEach(function(u){var r=idOf(u);if(!r)err("groups: '"+u+"': no such user");else P.typeLine(u+' : '+r.G.map(function(g){return g[1]}).join(' '))});
});
cmd(['less','more'],'/usr/bin','display the contents of a file in a terminal','less [options] [file ...]','shows each file, a screen at a time on a real terminal. this one has a long memory instead: PageUp goes back.',function(a){
  var f=a.filter(function(x){return x.charAt(0)!=='-'});
  if(!f.length){if(P.stdin()){lines(P.stdin());return}err('Missing filename ("less --help" for help)');return}
  f.forEach(function(x){
    var n=P.find(x);
    if(!n)err(x+': No such file or directory');
    else if(n.type==='d')err(x+' is a directory');
    else if(n.prot)err(x+': Permission denied');
    else if(n.bin)err('"'+x+'" may be a binary file.  See it anyway? ');
    else lines(P.text(n));
  });
});

/* ---------- cat, rm and mkdir, with GNU's messages; the work is the engine's ---------- */
function why(n){return !n?'No such file or directory':n.type==='d'?'Is a directory':'Permission denied'}
cmd('cat','/usr/bin','concatenate files and print on the standard output','cat [OPTION]... [FILE]...',['prints each file in turn, or its standard input. -n numbers the lines. with no file, or when file is -, it reads standard input.','',
  '-n, --number   number all output lines'],function(a){
  var o=opts(a),num=o.has('n','number'),k=0,bad=false,cont=false;
  function put(L){ /* a last line with no newline stays open, and the next file goes on in it without a number of its own */
    var R=num?L.map(function(l,i){return i||!cont?String(++k).padStart(6)+'\t'+l:l}):L;R.open=L.open;if(L.length)cont=!!L.open;P.say(R)}
  if(!o.ops.length){P.input([],put);return}
  var kb=false; /* once - has read the keyboard, the rest waits for it */
  o.ops.forEach(function(x){
    function one(){
      var n=P.find(x);
      if(!n||n.prot||n.type==='d'){err('cat: '+x+': '+(!n&&P.shut(x)?'Permission denied':why(n)));bad=true;return}
      if(n.bin)P.typeLine('\u007fELF^B^A^A^@^@^@^@^@^@^@^@^@^C^@>^@^A^@^@^@','dim');
      else put(P.text(n));
    }
    if(x==='-'){P.input([],put);if(!P.stdin())kb=true;return}
    if(kb)P.queue(one);else one();
  });
  if(kb)P.queue(function(){if(bad)P.status(1)});else if(bad)P.status(1);
},{core:true,help:'print a file'});
P.setup(function(){
  var rm=P.cmds.rm;
  if(rm)P.cmds.rm=function(a,raw,w){ /* what plainly cannot go is refused here, as GNU words it; the rest goes to the engine */
    var o=opts(a),force=o.has('f','force'),rec=/[rR]/.test(o.f)||!!o.L.recursive,keep=[];
    if(!o.ops.length){if(!force){err('rm: missing operand');err("Try 'rm --help' for more information.");P.status(1)}return}
    o.ops.forEach(function(x){
      var n=P.find(x,true,false,true),abs=P.norm(x); /* lstat: a symbolic link goes, not what it names */
      if(!n){if(!force){err("rm: cannot remove '"+x+"': No such file or directory");P.status(1)}return}
      if(n.type==='d'&&!rec){err("rm: cannot remove '"+x+"': Is a directory");P.status(1);return}
      if(n!==P.root&&!n.prot&&P.immutable(abs)){P.notPermitted('rm',x);P.status(1);return}
      if(n===P.root||n.prot||!P.canWrite(abs)){err("rm: cannot remove '"+x+"': Permission denied");P.status(1);return}
      if(rec&&n.type==='d'&&fixed(n)){sweep(n,x,abs,P.find(P.dirOf(abs),true),abs.split('/').pop());return}
      keep.push(x);
    });
    if(keep.length)rm((rec?['-r']:[]).concat(keep),raw,w);
  };
  function fixed(n){ /* anything immutable in the tree (by its own place, not through a link) */
    return n.ro||n.type==='d'&&Object.keys(n.kids).some(function(k){var x=n.kids[k];return x.parent===n&&x.name===k&&fixed(x)});
  }
  function sweep(n,x,abs,up,key,shut){ /* rm -r over a tree that holds immutable things, as GNU's does it: what can go goes, and each
                                       immutable thing, and the folders it keeps, stays, named once (its folders are not tried again).
                                       shut: a locked folder above up, which nobody gets through */
    if(n.ro||up.ro){P.notPermitted('rm',x);P.status(1);return false}
    var all=true;
    if(n.type==='d'&&n.parent===up&&n.name===key)Object.keys(n.kids).sort().forEach(function(k){if(!sweep(n.kids[k],x+'/'+k,abs+'/'+k,n,k,shut||up.prot))all=false});
    if(!all)return false;
    if(n.prot||shut||n.parent===up&&n.name===key&&!P.mayAlter(n)||!P.mayPut(up)||P.inUse(abs)){err("rm: cannot remove '"+x+"': Permission denied");P.status(1);return false}
    delete up.kids[key];return true;
  }
});
cmd('mkdir','/usr/bin','make directories','mkdir [OPTION]... DIRECTORY...',['makes each directory named. -p makes any parents that are missing too, and does not mind if it is there already.','',
  '-p, --parents   no error if existing, make parent directories as needed'],function(a){
  var o=opts(a),par=o.has('p','parents');
  if(!o.ops.length){err('mkdir: missing operand');err("Try 'mkdir --help' for more information.");P.status(1);return}
  o.ops.forEach(function(x){
    var abs=P.norm(x),ex=P.find(abs,true);
    if(ex){if(!par||ex.type!=='d'){err("mkdir: cannot create directory '"+x+"': File exists");P.status(1)}return}
    var up=abs,todo=[];
    while(!P.find(up,true)){todo.unshift(up);up=P.dirOf(up)}
    var top=P.find(up,true);
    if(todo.length>1&&!par||top.type!=='d'){err("mkdir: cannot create directory '"+x+"': "+(top.type!=='d'?'Not a directory':'No such file or directory'));P.status(1);return}
    if(P.immutable(todo[0])){P.notPermitted('mkdir',x);P.status(1);return}
    if(!P.canWrite(todo[0])){err("mkdir: cannot create directory '"+x+"': Permission denied");P.status(1);return}
    todo.forEach(function(d){P.put(d,'d',{owner:P.st.user,date:P.now()})});
  });
});

/* ---------- coreutils 9.7's touch, rmdir, ln and readlink, and the options of cp and mv; the copying and moving is the engine's ---------- */
function gopts(me,W,short,longs,argful){ /* GNU getopt over the words: {o: letters and long names given, v: their arguments, ops}, or null after
                                        saying what is wrong. short: the letters; argful: those taking an argument (and long names in longs with =) */
  var r={o:{},v:{},ops:[]},end=false;
  function no(t){err(me+': '+t);err("Try '"+me+" --help' for more information.");P.queue(function(){P.status(1)});return null}
  for(var i=0;i<W.length;i++){
    var x=W[i],m;
    if(end||x==='-'||x.charAt(0)!=='-'){r.ops.push(x);continue}
    if(x==='--'){end=true;continue}
    if((m=/^--([^=]+)(?:=([\s\S]*))?$/.exec(x))){
      var L=longs.filter(function(l){return l.replace(/=$/,'').indexOf(m[1])===0}),ex=longs.filter(function(l){return l.replace(/=$/,'')===m[1]});
      if(ex.length)L=ex;
      if(L.length!==1)return no((L.length?'option':'unrecognized option')+" '"+x+"'"+(L.length?' is ambiguous':''));
      var k=L[0].replace(/=$/,'');
      if(/=$/.test(L[0])){var v=m[2]!==undefined?m[2]:W[++i];if(v===undefined)return no("option '--"+k+"' requires an argument");r.v[k]=v}
      else if(m[2]!==undefined)return no("option '--"+k+"' doesn't allow an argument");
      r.o[k]=true;continue;
    }
    for(var j=1;j<x.length;j++){
      var c=x.charAt(j);
      if(short.indexOf(c)<0)return no("invalid option -- '"+c+"'");
      r.o[c]=true;
      if(argful.indexOf(c)>=0){var w=j+1<x.length?x.slice(j+1):W[++i];if(w===undefined)return no("option requires an argument -- '"+c+"'");r.v[c]=w;break}
    }
  }
  return r;
}
function gwhy(x){var abs=P.norm(x);return P.shut(x)?'Permission denied':!P.find(P.dirOf(abs))?'No such file or directory':'Permission denied'} /* why a name could not be made */
function base(x){return x.replace(/\/+$/,'').split('/').pop()||x}
function into(dest,src){var d=P.find(dest);return d&&d.type==='d'?dest.replace(/\/+$/,'')+'/'+base(src):dest} /* a folder: the name inside it */
function when(s){ /* touch -d: the dates GNU's parse_datetime takes that a visitor is likely to type; NaN if not one */
  var now=P.now(),d=new Date(now),m;
  if((m=/^@(-?\d+)$/.exec(s)))return +m[1]*1000;
  if(/^(now|today)$/i.test(s))return +now;
  if(/^yesterday$/i.test(s)){d.setDate(d.getDate()-1);return +d}
  if(/^tomorrow$/i.test(s)){d.setDate(d.getDate()+1);return +d}
  if((m=/^(\d+) (sec|second|min|minute|hour|day|week|month|year)s?( ago)?$/i.exec(s))){
    var n=+m[1]*(m[3]?-1:1),u=m[2].toLowerCase();
    if(u==='month')d.setMonth(d.getMonth()+n);else if(u==='year')d.setFullYear(d.getFullYear()+n);
    else d=new Date(+d+n*{sec:1e3,second:1e3,min:6e4,minute:6e4,hour:36e5,day:864e5,week:6048e5}[u]);
    return +d;
  }
  if((m=/^(\d{4})-(\d\d)-(\d\d)(?:[ T](\d\d?):(\d\d)(?::(\d\d))?)?$/.exec(s)))return +new Date(+m[1],+m[2]-1,+m[3],+(m[4]||0),+(m[5]||0),+(m[6]||0));
  return NaN;
}
function stamp(s){ /* touch -t [[CC]YY]MMDDhhmm[.ss] */
  var m=/^(\d{2}|\d{4})?(\d\d)(\d\d)(\d\d)(\d\d)(?:\.(\d\d))?$/.exec(s);
  if(!m)return NaN;
  var y=m[1]===undefined?P.now().getFullYear():m[1].length===4?+m[1]:+m[1]<69?2000+ +m[1]:1900+ +m[1],d=new Date(y,+m[2]-1,+m[3],+m[4],+m[5],+(m[6]||0));
  return d.getMonth()===+m[2]-1&&d.getDate()===+m[3]?+d:NaN;
}
cmd('touch','/usr/bin','change file timestamps','touch [OPTION]... FILE...',['updates the access and modification times of each FILE to the current time. a FILE that does not exist is created empty, unless -c is supplied.','',
  '-a   change only the access time',
  '-c, --no-create   do not create any files',
  '-d, --date=STRING   parse STRING and use it instead of current time: 2025-08-21 10:14, yesterday, 3 days ago, @seconds',
  '-m   change only the modification time',
  '-r, --reference=FILE   use this file\'s times instead of current time',
  '-t [[CC]YY]MMDDhhmm[.ss]   use specified time instead of current time'],function(a,raw,w){
  var g=gopts('touch',w.slice(1),'acdfhmrt',['no-create','date=','reference=','time=','no-dereference'],'drt');
  if(!g)return;
  var t=null;
  if(g.v.d!==undefined||g.v.date!==undefined){var s=g.v.date!==undefined?g.v.date:g.v.d;t=when(s);if(isNaN(t)){err("touch: invalid date format '"+s+"'");return}}
  if(g.v.t!==undefined){t=stamp(g.v.t);if(isNaN(t)){err("touch: invalid date format '"+g.v.t+"'");return}}
  var rf=g.v.reference!==undefined?g.v.reference:g.v.r;
  if(rf!==undefined){var rn=P.find(rf);if(!rn){err("touch: failed to get attributes of '"+rf+"': "+(P.shut(rf)?'Permission denied':'No such file or directory'));return}t=+rn.date}
  if(!g.ops.length){err('touch: missing file operand');err("Try 'touch --help' for more information.");return}
  g.ops.forEach(function(x){
    var n=P.find(x,true);
    if(!n&&(g.o.c||g.o['no-create']))return;
    if(n&&n.type==='d'){if(n.prot||!P.mayAlter(n)){err("touch: cannot touch '"+x+"': Permission denied");return}n.date=t===null?P.now():new Date(t);return} /* a folder's times */
    if(!P.writeFile(x,[],true)){if(P.immutable(P.norm(x),true))P.notPermitted('touch',x);else err("touch: cannot touch '"+x+"': "+(n?'Permission denied':gwhy(x)));return}
    if(t!==null)P.find(x,true).date=new Date(t);
  });
});
cmd('rmdir','/usr/bin','remove empty directories','rmdir [OPTION]... DIRECTORY...',['removes each directory named, if it is empty.','',
  '--ignore-fail-on-non-empty   ignore each failure to remove a non-empty directory',
  '-p, --parents   remove DIRECTORY and its ancestors; e.g., \'rmdir -p a/b\' is similar to \'rmdir a/b a\'',
  '-v, --verbose   output a diagnostic for every directory processed'],function(a,raw,w){
  var g=gopts('rmdir',w.slice(1),'pv',['ignore-fail-on-non-empty','parents','verbose'],'');
  if(!g)return;
  var par=g.o.p||g.o.parents,verb=g.o.v||g.o.verbose,ign=g.o['ignore-fail-on-non-empty'];
  if(!g.ops.length){err('rmdir: missing operand');err("Try 'rmdir --help' for more information.");return}
  function one(x){ /* rmdir(2) on the name x: true if it went */
    var n=P.find(x,true,false,true),abs=P.norm(x),why=null;
    if(verb)P.typeLine("rmdir: removing directory, '"+x+"'");
    if(!n)why=P.shut(x)?'Permission denied':'No such file or directory';
    else if(n.type!=='d')why='Not a directory';
    else if(/(^|\/)\.$/.test(x))why='Invalid argument';
    else if(P.st.cwd===abs||P.st.cwd.indexOf(abs+'/')===0||P.inUse(P.pathOf(n)))why='Device or resource busy';
    else if(!n.prot&&P.immutable(abs)){P.notPermitted('rmdir',x);return false}
    else if(!n.prot&&Object.keys(n.kids).length){if(ign)return false;why='Directory not empty'}
    else if(n.prot||n===P.root||!P.canWrite(abs))why='Permission denied';
    if(why){err("rmdir: failed to remove '"+x+"': "+why);return false}
    delete P.find(P.dirOf(abs),true).kids[abs.split('/').pop()];
    return true;
  }
  g.ops.forEach(function(x){
    if(!one(x)||!par)return;
    for(var p=x.replace(/\/+$/,'');/\/[^\/]/.test(p);){p=p.replace(/\/+[^\/]*$/,'');if(!p||!one(p))break} /* then each folder above it in the name */
  });
});
P.setup(function(){ /* cp and mv: GNU's -i -f -n -v, cp's -r, and more than one source into a folder; the rest is the engine's */
  ['cp','mv'].forEach(function(v){
    var run=P.cmds[v];
    if(!run)return;
    if(P.man[v])P.man[v].desc=(v==='cp'?['copies SOURCE to DEST, or each SOURCE into DIRECTORY. a directory is copied only with -r, and everything in it with it.']:
      ['renames SOURCE to DEST, or moves each SOURCE into DIRECTORY.']).concat(['',
      '-f, --force   do not prompt before overwriting',
      '-i, --interactive   prompt before overwrite',
      '-n, --no-clobber   do not overwrite an existing file'],v==='cp'?['-p   preserve the mode and the time of last change (and for root the owner too)','-R, -r, --recursive   copy directories recursively']:[],[
      '-v, --verbose   explain what is being done','',
      'if you specify more than one of -i, -f, -n, only the final one takes effect'+(v==='cp'?'; -n wins over -i.':'.')]);
    P.cmds[v]=function(a,raw,w){
      var g=gopts(v,w.slice(1),v==='cp'?'finvprR':'finv',['interactive','force','no-clobber','verbose','recursive'],'');
      if(!g)return;
      var mode=null;
      w.slice(1).forEach(function(x){if(/^-[^-]/.test(x))x.slice(1).split('').forEach(function(c){if(/[fin]/.test(c))mode=c});else if(/^--(interactive|force|no-clobber)$/.test(x))mode={interactive:'i',force:'f','no-clobber':'n'}[x.slice(2)]}); /* the last of them counts */
      if(v==='cp'&&(g.o.n||g.o['no-clobber']))mode='n'; /* cp: -n over -i */
      if(mode==='n')err(v+': warning: behavior of -n is non-portable and may change in future; use --update=none instead');
      var O=g.ops;
      if(!O.length){err(v+': missing file operand');err("Try '"+v+" --help' for more information.");return}
      if(O.length<2){err(v+": missing destination file operand after '"+O[0]+"'");err("Try '"+v+" --help' for more information.");return}
      var dest=O[O.length-1],dn=P.find(dest);
      if(O.length>2&&(!dn||dn.type!=='d')){err(v+": target '"+dest+"': "+(dn?'Not a directory':'No such file or directory'));return}
      var verb=g.o.v||g.o.verbose;
      (function next(i){
        if(i>=O.length-1)return;
        var src=O[i],to=into(dest,src),there=P.find(to,true,false,true),sn=P.find(src,true,false,true),was=there&&there.date;
        function go(){
          var A=[src,dest],dir=v==='cp'&&sn&&sn.type==='d';
          A.rec=!!(g.o.r||g.o.R||g.o.recursive);A.verb=!!verb;A.keep=!!g.o.p; /* cp -r: the engine's copies the folder, and with -v says each thing it copies */
          run(A,raw,[v,src,dest]);
          var t=P.find(to,true,false,true);
          if(verb&&!dir&&t&&(v==='cp'?sn&&t!==sn&&(!there||t.date!==was):t===sn&&!P.find(src,true,false,true)))P.typeLine((v==='mv'?'renamed ':'')+"'"+src+"' -> '"+to+"'"); /* once it is done */
          next(i+1);
        }
        if(there&&sn&&there!==sn&&mode==='n'){next(i+1);return} /* skipped, quietly */
        if(there&&sn&&there!==sn&&mode==='i'){P.ask(v+": overwrite '"+to+"'? ",function(l){if(l===P.INT)return;if(l&&/^y/i.test(l))go();else next(i+1)});return}
        go();
      })(0);
    };
  });
});
cmd('ln','/usr/bin','make links between files','ln [OPTION]... [-T] TARGET LINK_NAME',['makes LINK_NAME a hard link to TARGET, or with -s a symbolic link. with one TARGET and no LINK_NAME, the link is made in the current directory; with more than one, in the last argument, a directory.','',
  '-f, --force   remove existing destination files',
  '-n, --no-dereference   treat LINK_NAME as a normal file if it is a symbolic link to a directory',
  '-s, --symbolic   make symbolic links instead of hard links',
  '-T, --no-target-directory   treat LINK_NAME as a normal file always',
  '-v, --verbose   print name of each linked file',
  'hard links to a file of someone else\'s that you may not read and write are refused, as Linux\'s fs.protected_hardlinks has it.'],function(a,raw,w){
  var g=gopts('ln',w.slice(1),'fnsTv',['force','no-dereference','symbolic','no-target-directory','verbose'],'');
  if(!g)return;
  var O=g.ops,sym=g.o.s||g.o.symbolic,force=g.o.f||g.o.force,flat=g.o.T||g.o['no-target-directory'],nod=g.o.n||g.o['no-dereference'];
  if(!O.length){err('ln: missing file operand');err("Try 'ln --help' for more information.");return}
  if(O.length===1)O=O.concat(['.']);
  var dest=O[O.length-1],dn=nod?P.find(dest,true,true,true):P.find(dest);
  if(flat&&O.length>2){err("ln: extra operand '"+O[2]+"'");err("Try 'ln --help' for more information.");return}
  if(O.length>2&&(!dn||dn.type!=='d')){err("ln: target '"+dest+"': "+(dn?'Not a directory':'No such file or directory'));return}
  O.slice(0,-1).forEach(function(src){
    var name=!flat&&dn&&dn.type==='d'?(dest==='.'&&O.length===2&&g.ops.length===1?base(src):dest.replace(/\/+$/,'')+'/'+base(src)):dest,abs=P.norm(name),
        ex=P.find(abs,true,false,true),kind=sym?'symbolic link':'hard link';
    if(!sym){ /* the file first: it must be there, and not a folder */
      var n=P.find(src);
      if(!n){err("ln: failed to access '"+src+"': "+(P.shut(src)?'Permission denied':'No such file or directory'));return}
      if(n.type==='d'){err('ln: '+src+': hard link not allowed for directory');return}
    }
    if(ex&&!force){err("ln: failed to create "+kind+" '"+name+"': File exists");return}
    if(!sym&&ex===n){err("ln: '"+src+"' and '"+name+"' are the same file");return}
    if(!sym&&P.st.user!=='root'&&n.owner!==P.st.user&&!(n.type==='f'&&!n.dev&&!/s/.test(P.modeOf(n).charAt(3))&&P.modeOf(n).slice(7,9)==='rw')){P.notPermitted('ln',name,src);return} /* may_linkat: protected_hardlinks */
    if(!sym&&P.isImmutable(n)||P.immutable(abs)){if(sym)err("ln: failed to create symbolic link '"+name+"': Operation not permitted");else P.notPermitted('ln',name,src);return}
    if(ex&&!P.canWrite(abs)||!ex&&!P.canWrite(abs)){err('ln: failed to create '+kind+" '"+name+"'"+(sym?'':" => '"+src+"'")+': '+gwhy(name));return}
    if(ex)delete P.find(P.dirOf(abs),true).kids[abs.split('/').pop()];
    if(sym)P.put(abs,'s',{sym:src,owner:P.st.user,date:P.now(),mode:'lrwxrwxrwx',size:src.length});
    else P.find(P.dirOf(abs),true).kids[abs.split('/').pop()]=n;
    if(g.o.v||g.o.verbose)P.typeLine("'"+name+"' "+(sym?'->':'=>')+" '"+src+"'");
  });
});
cmd('readlink','/usr/bin','print resolved symbolic links or canonical file names','readlink [OPTION]... FILE...',['prints the value of each symbolic link FILE. with nothing to print (FILE is no link), it fails quietly.','',
  '-f, --canonicalize   canonicalize by following every symlink in every component of the given name recursively; all but the last component must exist',
  '-e, --canonicalize-existing   canonicalize by following every symlink in every component of the given name recursively, all components must exist',
  '-n, --no-newline   do not output the trailing delimiter'],function(a,raw,w){
  var g=gopts('readlink',w.slice(1),'efmnqsvz',['canonicalize','canonicalize-existing','canonicalize-missing','no-newline','quiet','silent','verbose','zero'],'');
  if(!g)return;
  if(!g.ops.length){err('readlink: missing operand');err("Try 'readlink --help' for more information.");return}
  var canon=g.o.f||g.o.canonicalize||g.o.e||g.o['canonicalize-existing'],L=[],bad=false;
  g.ops.forEach(function(x){
    var abs=P.norm(x);
    if(canon){
      var n=P.find(abs,true,true),up=!n&&!(g.o.e||g.o['canonicalize-existing'])&&P.find(P.dirOf(abs),true,true);
      if(n)L.push(P.pathOf(n));else if(up&&up.type==='d')L.push((P.pathOf(up)+'/').replace(/\/+$/,'/')+abs.split('/').pop());else bad=true;
      return;
    }
    var l=P.find(abs,true,true,true),up2=P.find(P.dirOf(abs),true),t=l&&abs!=='/'?linkOf(abs,l,up2):null;
    if(t!==null&&(l.type==='s'||P.has(D.links,abs)))L.push(t);else bad=true;
  });
  if(g.o.n||g.o['no-newline']){var R=L.slice();R.open=true;P.say(R)}else P.say(L);
  if(bad)P.status(1);
});
/* ---------- lsattr and chattr, e2fsprogs 1.47.2's: the ext4 flags, of which this machine keeps one, i (immutable: the
   engine's ro), which the site owner's files in the guest's home carry. Only root may set or clear it. ---------- */
var E2V='1.47.2 (1-Jan-2025)';
function ext4(n){return (n.type==='f'||n.type==='d')&&!n.dev&&!/^\/(proc|sys|dev|run|tmp)(\/|$)/.test(P.pathOf(n))} /* tmpfs and the kernel's: no flags (ENOTTY, said as EOPNOTSUPP) */
function attrs(n,long,noe){return long?(n.ro?'Immutable, Extents':'Extents'):'----'+(n.ro?'i':'-')+'---------'+(noe?'-':'e')+'-------'} /* print_flags: i and e of its 22 */
function lstatOf(x){ /* what lstat finds at x: the node, whether the name is a link to it, and its path */
  var abs=P.norm(x),n=P.find(abs,true,false,true);
  if(!n)return null;
  if(n===P.root)return {n:n,link:false,abs:abs};
  var up=P.find(P.dirOf(abs),true);
  return {n:n,link:!!linkOf(abs,n,up),abs:abs};
}
function kidOf(e,k){var n=e.n.kids[k],abs=join(e.abs,k);return {n:n,link:!!linkOf(abs,n,e.n),abs:abs}} /* lstatOf of the name k in the folder e, without going back to / */
function join(dir,k){return (/\/$/.test(dir)?dir:dir+'/')+k} /* a name in a folder: dir/k, and /k in / */
function e2out(){ /* what goes out, in its order with the complaints */
  var B=[];
  return {say:function(l){B.push(l)},err:function(s){if(B.length)P.say(B.splice(0));err(s)},end:function(){if(B.length)P.say(B.splice(0))}};
}
cmd('lsattr','/usr/bin','list file attributes on a Linux second extended file system','lsattr [ -RVadlpv ] [ files...  ]',
  'lists the attributes of each file, or of what is in each directory named (and with no name, of the working directory). -a includes names starting with a dot, -d lists a directory itself, -R goes down into directories, -l spells the attributes out. i is the immutable attribute: nobody, root included, may change, rename or remove the file, or add to or take from the directory, until root clears it with chattr -i.',function(a){
  var o=opts(a),bad=o.f.replace(/[RVadlpv]/g,'').charAt(0)||(Object.keys(o.L).length?'-':''),st=0,O=e2out();
  if(bad){err("lsattr: invalid option -- '"+bad+"'");err('Usage: lsattr [-RVadlpv] [files...]');P.status(1);return}
  var R=o.has('R'),all=o.has('a'),dirs=o.has('d'),long=o.has('l'),gen=o.has('v'),proj=o.has('p');
  if(o.has('V'))err('lsattr '+E2V);
  function list(name,e){ /* list_attributes: fgetflags opens the file, so a locked one is refused */
    var n=e.n;
    if(e.link||!ext4(n)){O.err('lsattr: Operation not supported While reading flags on '+name);return false}
    if(n.prot){O.err('lsattr: Permission denied While reading flags on '+name);return false}
    O.say((proj?'    0 ':'')+(gen?String(P.ino(P.pathOf(n))*2654435761%4294967296>>>0).padEnd(10)+' ':'')+(long?name.padEnd(28)+' '+attrs(n,true):attrs(n)+' '+name));
    return true;
  }
  function walk(name,d){ /* iterate_on_dir: an unreadable directory fails quietly */
    if(d.prot)return false;
    var pre=join(name,''),at=join(P.pathOf(d),'');
    ['.','..'].concat(Object.keys(d.kids).sort()).filter(function(k){return all||k.charAt(0)!=='.'}).forEach(function(k){
      var dot=k==='.'||k==='..',n=k==='.'?d:k==='..'?d.parent:d.kids[k],path=pre+k,e={n:n,link:!dot&&!!linkOf(at+k,n,d)};
      list(path,e);
      if(R&&n.type==='d'&&!e.link&&!dot){O.say('');O.say(path+':');walk(path,n);O.say('')}
    });
    return true;
  }
  (o.ops.length?o.ops:['.']).forEach(function(x){
    var e=lstatOf(x);
    if(!e){O.err('lsattr: No such file or directory while trying to stat '+x);st=1;return}
    if(e.n.type==='d'&&!e.link&&!dirs){if(!walk(x,e.n))st=1}
    else if(!list(x,e))st=1;
  });
  O.end();P.status(st);
},{noHelpFlag:true});
cmd('chattr','/usr/bin','change file attributes on a Linux file system','chattr [ -RVf ] [ -v version ] [ -p project ] [ mode ] files...',
  'changes the attributes of each file: +i sets the immutable attribute, -i clears it, =i makes it the only one. -R goes down into directories, -V says what it set, -f keeps quiet about what fails. only root may set or clear i; the immutable attribute stops root too, until it is cleared.',function(a){
  var W=a.slice(),i=0,R=false,V=false,f=false,rf='',af='',sf='',ver=false,prj=false,st=0,O=e2out();
  function usage(){err('Usage: chattr [-RVf] [-+=aAcCdDeijPsStTuFx] [-p project] [-v version] files...');P.status(1)}
  var FL='ASDacmdeijPsutTCxF';
  for(;i<W.length;i++){
    var x=W[i],c=x.charAt(0),k;
    if(x==='--'){i++;break}
    if(c!=='-'&&c!=='+'&&c!=='=')break;
    for(k=1;k<x.length;k++){
      var ch=x.charAt(k);
      if(c==='-'&&/[RVf]/.test(ch)){if(ch==='R')R=true;else if(ch==='V')V=true;else f=true;continue}
      if(c==='-'&&(ch==='p'||ch==='v')){
        if(++i>=W.length){usage();return}
        if(!/^(0x[0-9a-f]+|0[0-7]*|[1-9]\d*)$/i.test(W[i])){err('chattr: bad '+(ch==='p'?'project':'version')+' - '+W[i]);err('');usage();return}
        if(ch==='p')prj=true;else ver=true;
        continue;
      }
      if(FL.indexOf(ch)<0){usage();return}
      if(c==='-')rf+=ch;else if(c==='+')af+=ch;else sf+=ch;
    }
  }
  if(i>=W.length){usage();return}
  if(sf&&(af||rf)){err('= is incompatible with - and +');P.status(1);return}
  if(rf.split('').some(function(ch){return af.indexOf(ch)>=0})){err("Can't both set and unset same flag.");P.status(1);return}
  if(!(af||rf||sf||ver||prj)){err("Must use '-v', =, - or +");P.status(1);return}
  if(V)err('chattr '+E2V);
  var root=P.st.user==='root';
  function change(name,e){ /* e: what lstat found at name, when chattr -R already has it */
    e=e||lstatOf(name);var n=e&&e.n;
    if(!e){if(!f)O.err('chattr: No such file or directory while trying to stat '+name);return false}
    if(e.link||!ext4(n)){if(!f)O.err('chattr: Operation not supported while reading flags on '+name);return false}
    if(n.prot){if(!f)O.err('chattr: Permission denied while reading flags on '+name);return false}
    var was=!!n.ro,now=sf?sf.indexOf('i')>=0:(was&&rf.indexOf('i')<0)||af.indexOf('i')>=0;
    if(sf||af||rf){
      var noe=sf?sf.indexOf('e')<0:rf.indexOf('e')>=0,why=!root&&(n.owner!==P.st.user||now!==was)?'Operation not permitted': /* FS_IOC_SETFLAGS: the owner's, and i takes CAP_LINUX_IMMUTABLE */
        noe?'Operation not supported':''; /* ext4 will not turn an extent-mapped file back */
      if(V)O.say('Flags of '+name+' set as '+attrs({ro:now},false,noe));
      if(why&&sf)O.err(name+': '+why); /* = says it with perror, and goes on as if it had worked */
      else if(why){if(!f)O.err('chattr: '+why+' while setting flags on '+name);return false}
      else if(now)n.ro=true;
      else delete n.ro;
    }
    if((ver||prj)&&!root&&n.owner!==P.st.user){if(!f)O.err('chattr: Operation not permitted while setting '+(ver?'version':'project')+' on '+name);return false}
    var ok=true;
    if(R&&n.type==='d'&&!e.link)Object.keys(n.kids).sort().forEach(function(k){if(!change(name+'/'+k,kidOf(e,k)))ok=false});
    return ok;
  }
  W.slice(i).forEach(function(x){if(!change(x))st=1});
  O.end();P.queue(function(){P.status(st)}); /* after its complaints: a failed = is said, and still exits 0 */
},{noHelpFlag:true});

/* ---------- ls, as GNU's ---------- */
function modeOf(n){
  if(n.mode)return n.mode;
  if(n.type==='d')return n.prot?'drwx------':'drwxr-xr-x';
  return n.prot?'-rw-------':n.bin?'-rwxr-xr-x':'-rw-r--r--';
}
function sizeOf(n){return n.type==='d'?4096:n.dev?0:P.fsize(n)}
function group(n){return n.group||(n.owner==='root'||n.owner==='bin'?'root':n.owner)}
function linkOf(path,n,up){ /* a name that is really somewhere else: the merged /usr, os-release, cowthink; and a symbolic link the visitor made */
  if(n&&n.type==='s')return n.sym;
  if(P.has(D.links,path))return D.links[path];
  return null; /* any other second name is a hard link: the file itself */
}
function lsDate(d){
  var now=P.now(),old=now-d>15552e6||d-now>36e5;
  return P.short(d).slice(0,6)+' '+(old?' '+d.getFullYear():hm(d));
}
function columns(names){
  if(P.piped()||!names.length)return names;
  var W=P.columns(),best=[names];
  for(var c=Math.min(names.length,Math.floor(W/3)||1);c>1;c--){
    var rows=Math.ceil(names.length/c),wd=[],tot=0;
    for(var k=0;k<c;k++){
      var col=names.slice(k*rows,(k+1)*rows);if(!col.length)continue;
      wd[k]=col.reduce(function(m,x){return Math.max(m,x.length)},0)+2;tot+=wd[k];
    }
    if(tot-2<=W){
      best=[];
      for(var r=0;r<rows;r++){
        var l='';
        for(k=0;k<c;k++){var i=k*rows+r;if(i<names.length)l+=(k*rows+r+rows<names.length&&k<c-1?names[i].padEnd(wd[k]):names[i])}
        best.push(l.replace(/\s+$/,''));
      }
      return best;
    }
  }
  return names;
}
cmd('ls','/usr/bin','list directory contents','ls [OPTION]... [FILE]...',[
  'lists information about the files named, or the current directory, sorted by name.','',
  '-a, --all   do not ignore entries starting with .',
  '-A, --almost-all   like -a, without . and ..',
  '-d, --directory   list directories themselves, not their contents',
  '-F, --classify   append a mark to entries: / for a directory, * for a program, @ for a link',
  '-g, -n, -o   like -l; here they list the owner and group as -l does',
  '-h, --human-readable   with -l, print sizes like 1K 234M 2G',
  '-l          use a long listing format',
  '-r, --reverse   reverse order while sorting',
  '-R, --recursive   list subdirectories recursively',
  '-S          sort by file size, largest first',
  '-t          sort by time, newest first',
  '-1          list one file per line',
  '--color[=WHEN], --colour[=WHEN]   accepted; this terminal has one colour, and it is green',
  '--group-directories-first   accepted, and changes nothing here',
  '-b -B -c -C -D -f -G -H -i -I -k -L -m -N -p -q -Q -s -T -u -U -v -w -x -X -Z   accepted, and change nothing here'],function(a){
  var o=opts(a),all=o.has('a','all'),almost=o.has('A','almost-all'),long=/[lgno]/.test(o.f),hum=o.has('h','human-readable'),self=o.has('d','directory'),
      mark=o.has('F','classify'),one=o.has('1'),rev=o.has('r','reverse'),byT=o.has('t'),byS=o.has('S'),rec=o.has('R','recursive'),files=[],dirs=[],bad=0;
  var unknown=Object.keys(o.L).filter(function(k){return !/^(all|almost-all|human-readable|directory|classify|reverse|recursive|color|colour|group-directories-first)$/.test(k)})[0];
  /* its status goes after its complaints, each of which makes it 1 as it is written */
  if(unknown){err("ls: unrecognized option '--"+unknown+"'");err("Try 'ls --help' for more information.");P.queue(function(){P.status(2)});return}
  var badc=o.f.replace(/[aAbBcCdDfFgGhHiIklLmnNopqQrRsStTuUvwxXZ1]/g,'').charAt(0);
  if(badc){err("ls: invalid option -- '"+badc+"'");err("Try 'ls --help' for more information.");P.queue(function(){P.status(2)});return}
  var want=o.ops.length?o.ops:['.'];
  function sorter(L){
    L.sort(function(x,y){
      if(byS&&sizeOf(x.n)!==sizeOf(y.n))return sizeOf(y.n)-sizeOf(x.n);
      if(byT&&x.n.date-y.n.date)return y.n.date-x.n.date;
      return x.name<y.name?-1:x.name>y.name?1:0;
    });
    return rev?L.reverse():L;
  }
  function tag(e){return !mark?'':e.link?'@':e.n.type==='d'?'/':e.n.bin||/^-..x/.test(modeOf(e.n))?'*':''}
  function longRows(L){
    var R=L.map(function(e){
      var n=e.n,m=e.link?'lrwxrwxrwx':modeOf(n),sz=e.link?e.link.length:sizeOf(n);
      var nl=e.link?1:n.type!=='d'?1:2+Object.keys(n.kids).filter(function(k){return n.kids[k].type==='d'&&n.kids[k].parent===n}).length;
      var lo=e.link&&n.type!=='s'; /* the system's own links are root's; one the visitor made, theirs */
      return {c:[m,String(nl),lo?'root':n.owner,lo?'root':group(n),n.dev?n.dev[0]+', '+n.dev[1]:hum?human(sz):String(sz),lsDate(n.date)],
        name:e.name+(e.link?' -> '+e.link:tag(e)),dim:n.prot&&!e.link};
    });
    var W=[0,0,0,0,0];
    R.forEach(function(r){for(var i=1;i<5;i++)W[i]=Math.max(W[i],r.c[i].length)});
    return R.map(function(r){
      var t=r.c[0]+' '+r.c[1].padStart(W[1])+' '+r.c[2].padEnd(W[2])+' '+r.c[3].padEnd(W[3])+' '+r.c[4].padStart(W[4])+' '+r.c[5]+' '+r.name;
      return r.dim?[t,'dim']:t;
    });
  }
  function total(L){return 'total '+L.reduce(function(t,e){var s=e.link?0:sizeOf(e.n);return t+(e.n.dev?0:Math.ceil(s/4096)*4)},0)}
  want.forEach(function(w){
    var n=P.find(w),abs=P.norm(w),up=P.find(P.dirOf(abs),true),l=P.find(abs,true,true,true),sym=l&&l.type==='s'&&!/\/$/.test(w)?l:null,
        link=abs!=='/'&&!/\/$/.test(w)&&(long||self||sym&&(!n||n.type!=='d'))?linkOf(abs,sym||n,up):null; /* lstat's, with -l or -d, or when it does not name a folder */
    if(sym&&link){files.push({name:w,n:sym,link:link});return}
    if(!n){err("ls: cannot access '"+w+"': "+(P.shut(w)?'Permission denied':'No such file or directory'));bad=2;return}
    if(link||self||n.type!=='d')files.push({name:w,n:n,link:link});
    else if(n.prot||!P.may(n,'r')){err("ls: cannot open directory '"+w+"': Permission denied");bad=2}
    else dirs.push({name:w.replace(/^~(?=\/|$)/,P.st.home),n:n}); /* bash gave ls ~ as the home folder's name */
  });
  var O=e2out(),first=true;
  function say(L){L.forEach(O.say)}
  if(files.length){
    sorter(files);
    if(long)say(longRows(files));
    else say(one?files.map(function(e){return e.name+tag(e)}):columns(files.map(function(e){return e.name+tag(e)})));
    if(dirs.length)O.say('');
  }
  /* coreutils' print_dir, a folder at a time. -R (extract_dirs_from_files): then the folders in it, each in full before the next,
     named dir/name ("./src" in "."), never . or .. or a link; every folder is titled, "." too. A folder already on the way down is
     not listed again (its dev and inode in active_dir_set), and opendir fails on a name longer than PATH_MAX */
  var todo=sorter(dirs).reverse(),titled=want.length>1||rec;
  while(todo.length){
    var d=todo.pop(),n=d.n,at=P.pathOf(n);
    if(n.prot||!P.may(n,'r')||d.name.length>=4096){O.err("ls: cannot open directory '"+d.name+"': "+(d.name.length<4096?'Permission denied':'File name too long'));bad=bad||1;continue}
    for(var up=d.up,loop=false;up&&!loop;up=up.up)loop=up.n===n;
    if(loop){O.err('ls: '+d.name+': not listing already-listed directory');bad=2;continue}
    var E=Object.keys(n.kids).filter(function(k){return all||almost||k.charAt(0)!=='.'}).map(function(k){
      var kid=n.kids[k];return {name:k,n:kid,link:linkOf(join(at,k),kid,n)};
    });
    sorter(E);
    if(all)E=[{name:'.',n:n},{name:'..',n:n.parent}].concat(E);
    if(titled){if(!first)O.say('');O.say(d.name+':')}
    first=false;
    if(long){O.say(total(E));say(longRows(E))}
    else say(one?E.map(function(e){return e.name+tag(e)}):columns(E.map(function(e){return e.name+tag(e)})));
    if(rec)for(var i=E.length-1;i>=0;i--){
      var e=E[i];
      if(e.n.type==='d'&&!e.link&&e.name!=='.'&&e.name!=='..')todo.push({name:join(d.name,e.name),n:e.n,up:d});
    }
  }
  O.end();
  if(bad)P.queue(function(){P.status(bad)});
},{core:true,help:'list files'});

/* ---------- the system ---------- */
cmd('uname','/usr/bin','print system information','uname [OPTION]...',[
  'prints facts about the machine and the kernel it runs. with no option, the same as -s.','',
  '-a, --all   all of the below, in this order, except -p and -i, which are unknown','-s   the kernel name','-n   the network node hostname','-r   the kernel release','-v   the kernel version','-m   the machine hardware name',
  '-p   the processor type (non-portable)','-i   the hardware platform (non-portable)','-o   the operating system'],function(a){
  var o=opts(a),all=o.has('a','all'),V={s:'Linux',n:P.st.hostname,r:D.krel,v:D.kbuild,m:'x86_64',p:'unknown',i:'unknown',o:'GNU/Linux'},R=[];
  var bad=o.f.replace(/[asnrvmpio]/g,'').charAt(0);
  if(bad){err("uname: invalid option -- '"+bad+"'");err("Try 'uname --help' for more information.");P.status(1);return}
  ['s','n','r','v','m','p','i','o'].forEach(function(k){
    if(all?k!=='p'&&k!=='i':o.f.indexOf(k)>=0||k==='s'&&!o.f)R.push(V[k]);
  });
  P.typeLine(R.join(' '));
});
cmd('hostname','/usr/bin','show or set the system\'s host name','hostname [-A|-d|-f|-i|-I|-s] [name]',['prints the name of this machine. -f prints its full name, -d its domain, -I its addresses, -i the address its name resolves to. only root may change it.','',
  '-A, --all-fqdns   display all FQDNs of the machine',
  '-d, --domain   display the name of the DNS domain',
  '-f, --fqdn   display the FQDN (Fully Qualified Domain Name)',
  '-i, --ip-address   display the network address(es) of the host name',
  '-I, --all-ip-addresses   display all network addresses of the host',
  '-s, --short   display the short host name'],function(a){
  var o=opts(a);
  if(o.ops.length){err('hostname: you must be root to change the host name');return}
  if(o.has('I','all-ip-addresses'))P.typeLine(D.ip4+' '+D.ip6+' ');
  else if(o.has('i','ip-address'))P.typeLine('127.0.1.1');
  else if(o.has('f','fqdn')||o.has('A','all-fqdns'))P.typeLine(P.st.hostname+(P.st.domain?'.'+P.st.domain:'')); /* as /etc/hosts names it */
  else if(o.has('d','domain'))P.typeLine(P.st.domain);
  else P.typeLine(P.st.hostname);
});
cmd('hostnamectl','/usr/bin','control the system hostname','hostnamectl [OPTIONS...] COMMAND ...',['with no command, describes the machine: its name, what it runs on, and the kernel.','',
  'status   show system hostname and related information. if no command is specified, this is the implied default. any other command would change something, and is refused'],function(a){
  if(a[0]&&a[0]!=='status'){err('Could not set property: Interactive authentication required.');return}
  lines([' Static hostname: '+P.st.hostname,'       Icon name: computer-vm','         Chassis: vm','      Machine ID: 3f9c2e4b7a1d48e6b5c0d9a2e7f1c843','         Boot ID: '+bootId(),
    '    Product UUID: 0d6e5c1a-9b2f-4e7d-8a3c-61f4b2d9e0a5','  Virtualization: kvm','Operating System: Debian GNU/Linux 13 (trixie)','          Kernel: Linux '+D.krel,'    Architecture: x86-64',
    ' Hardware Vendor: QEMU','  Hardware Model: Standard PC _i440FX + PIIX, 1996_','Firmware Version: 1.16.3-debian-1.16.3-2','   Firmware Date: Tue 2014-04-01']);
});
function bootId(){var s=String(BOOT.getTime()*7919),h='';for(var i=0;h.length<32;i++)h+='0123456789abcdef'.charAt((s.charCodeAt(i%s.length)*(i+3))%16);return h}
cmd('uptime','/usr/bin','tell how long the system has been running','uptime [options]',['prints the time now, how long the system has been running, how many users are logged on, and the system load averages for the past 1, 5 and 15 minutes. -p prints only how long, in words.','',
  '-p, --pretty   show uptime in pretty format','-s, --since   system up since, in yyyy-mm-dd HH:MM:SS format'],function(a){
  var o=opts(a);
  if(o.has('p','pretty')){
    var m=Math.floor(since()/6e4),d=Math.floor(m/1440),h=Math.floor(m%1440/60),W=[];
    if(d)W.push(d+' day'+(d>1?'s':''));if(d||h)W.push(h+' hour'+(h!==1?'s':''));W.push(m%60+' minute'+(m%60!==1?'s':'')); /* procps 4 always says the minutes */
    P.typeLine('up '+W.join(', '));return;
  }
  if(o.has('s','since')){P.typeLine(ymd(BOOT)+' '+hms(BOOT));return}
  P.typeLine(upLine());
});
cmd('who','/usr/bin','show who is logged on','who [OPTION]... [ FILE | ARG1 ARG2 ]','prints who is logged on: name, terminal, and when they logged in. who am i prints only you.',function(){
  P.typeLine(P.st.user.padEnd(8)+' ttyS0        '+ymd(P.st.login)+' '+hm(P.st.login));
});
cmd('w','/usr/bin','show who is logged on and what they are doing','w [options] [user]','prints the uptime line, then who is logged on and what each of them is running.',function(){
  out([upLine(),'USER     TTY      FROM             LOGIN@   IDLE   JCPU   PCPU  WHAT',P.st.user.padEnd(8)+' ttyS0    -                '+hm(P.st.login)+'    0.00s  0.04s  0.00s w']);
});
cmd('dmesg','/usr/bin','print or control the kernel ring buffer','dmesg [options]','prints the kernel\'s messages since it started. on this system the kernel keeps them from ordinary users.',function(){
  err('dmesg: read kernel buffer failed: Operation not permitted');
});
cmd('nproc','/usr/bin','print the number of processing units available','nproc [OPTION]...','prints how many processors there are to run on.',function(){P.typeLine(String(D.ncpu))});
cmd('lsblk','/usr/bin','list block devices','lsblk [options] [device...]','lists the disks and their partitions, as a tree, with where each is mounted.',function(){
  lines(['NAME    MAJ:MIN RM  SIZE RO TYPE MOUNTPOINTS','vda     254:0    0   20G  0 disk ','├─vda1  254:1    0 19.9G  0 part /','├─vda14 254:14   0    3M  0 part ','└─vda15 254:15   0  124M  0 part /boot/efi']);
});

/* memory and disks: one set of numbers, also behind /proc/meminfo */
function memRows(){
  var M=D.mem,cache=M.Buffers+M.Cached+M.SReclaimable;
  return [['Mem:',M.MemTotal,M.MemTotal-M.MemFree-cache,M.MemFree,M.Shmem,cache,M.MemAvailable],['Swap:',0,0,0]];
}
cmd('free','/usr/bin','display amount of free and used memory in the system','free [options]',['prints how much memory there is, how much is in use, and how much is free, in kibibytes, or -m mebibytes, -g gibibytes, -h whatever reads best.','',
  '-k, --kibi   display the amount of memory in kibibytes. this is the default',
  '-m, --mebi   display the amount of memory in mebibytes',
  '-g, --gibi   display the amount of memory in gibibytes',
  '-h, --human   show all output fields automatically scaled to shortest three digit unit and display the units of print out'],function(a){
  var o=opts(a),k=o.has('h','human')?'h':o.has('g','gibi')?'g':o.has('m','mebi')?'m':'k';
  function v(x){return k==='h'?(x?humanI(x*1024):'0B'):String(k==='g'?Math.floor(x/1048576):k==='m'?Math.floor(x/1024):x)}
  lines(['               total        used        free      shared  buff/cache   available'].concat(memRows().map(function(r){
    return r[0].padEnd(8)+r.slice(1).map(function(x){return v(x).padStart(12)}).join('');
  })));
});
function humanI(b){ /* procps: 1.9Gi, 318Mi */
  var u=['B','Ki','Mi','Gi','Ti'],i=0;
  while(b>=1024&&i<4){b/=1024;i++}
  return (i&&b<10?(Math.round(b*10)/10).toFixed(1):String(Math.round(b)))+u[i];
}
var DISKS=[['udev',977320,0,'/dev'],['tmpfs',201496,612,'/run'],['/dev/vda1',20437588,1678344,'/'],['tmpfs',1007488,0,'/dev/shm'],['tmpfs',5120,0,'/run/lock'],
  ['tmpfs',1024,0,'/run/credentials/systemd-journald.service'],['tmpfs',1007488,8,'/tmp'],['/dev/vda15',126678,11872,'/boot/efi'],['tmpfs',201496,4,'/run/user/1001'],
  ['tmpfs',1024,0,'/run/credentials/serial-getty@ttyS0.service']];
cmd('df','/usr/bin','report file system space usage','df [OPTION]... [FILE]...',['shows, for each mounted file system, its size, how much is used and how much is left, in 1K blocks, or with -h in sizes that read easily.','',
  '-h, --human-readable   print sizes in powers of 1024 (e.g., 1023M)',
  'FILE   show only the file system each FILE is on'],function(a){
  var o=opts(a),h=o.has('h','human-readable'),D=DISKS,bad=false;
  if(o.ops.length){ /* the file system each is on: the mount point nearest above it, the kernel's own (proc, sysfs, devpts) included */
    var K=DISKS.concat([['proc',0,0,'/proc'],['sysfs',0,0,'/sys'],['devpts',0,0,'/dev/pts']]);
    D=[];
    o.ops.forEach(function(x){
      var n=P.find(x);
      if(!n){err('df: '+x+': '+(P.shut(x)?'Permission denied':'No such file or directory'));bad=true;return}
      var p=P.pathOf(n);
      D.push(K.filter(function(d){return p===d[3]||p.indexOf(d[3]==='/'?'/':d[3]+'/')===0}).sort(function(x,y){return y[3].length-x[3].length})[0]);
    });
    if(!D.length){err('df: no file systems processed');return}
  }
  var R=D.map(function(d){
    var avail=d[3]==='/'?d[1]-d[2]-1048576:d[1]-d[2],pct=!d[1]?'-':(d[2]?Math.ceil(100*d[2]/(d[2]+avail)):0)+'%';
    return [d[0],h&&d[1]?human(d[1]*1024):String(d[1]),h?(d[2]?human(d[2]*1024):'0'):String(d[2]),h&&d[1]?human(avail*1024):String(avail),pct,d[3]];
  });
  var hd=['Filesystem',h?'Size':'1K-blocks','Used',h?'Avail':'Available','Use%','Mounted on'],W=[0,0,0,0,0];
  [hd].concat(R).forEach(function(r){for(var i=0;i<5;i++)W[i]=Math.max(W[i],r[i].length)});
  W=W.map(function(x,i){return Math.max(x,[14,5,5,5,4][i])}); /* df's narrowest columns */
  lines([hd].concat(R).map(function(r,j){
    return r[0].padEnd(W[0])+' '+r[1].padStart(W[1])+' '+r[2].padStart(W[2])+' '+r[3].padStart(W[3])+' '+(j?r[4].padStart(W[4]):r[4])+' '+r[5];
  }));
});

/* the network: iproute2 */
function ipAddr(brief,only){
  if(brief)return ['lo               UNKNOWN        127.0.0.1/8 ::1/128 ','ens3             UP             '+D.ip4+'/24 '+D.ip6+'/64 fe80::5054:ff:fe3a:7c1e/64 '].filter(function(l,i){return !only||only===(i?'ens3':'lo')});
  var L=[['1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000','    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00',
    '    inet 127.0.0.1/8 scope host lo','       valid_lft forever preferred_lft forever','    inet6 ::1/128 scope host noprefixroute ','       valid_lft forever preferred_lft forever'],
   ['2: ens3: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000','    link/ether '+D.mac+' brd ff:ff:ff:ff:ff:ff','    altname enp0s3',
    '    inet '+D.ip4+'/24 brd 203.0.113.255 scope global ens3','       valid_lft forever preferred_lft forever','    inet6 '+D.ip6+'/64 scope global ','       valid_lft forever preferred_lft forever',
    '    inet6 fe80::5054:ff:fe3a:7c1e/64 scope link proto kernel_ll ','       valid_lft forever preferred_lft forever']];
  return L.filter(function(x,i){return !only||only===(i?'ens3':'lo')}).reduce(function(a,b){return a.concat(b)},[]);
}
var IPHELP={"top":["Usage: ip [ OPTIONS ] OBJECT { COMMAND | help }","       ip [ -force ] -batch filename","where  OBJECT := { address | addrlabel | fou | help | ila | ioam | l2tp | link |","                   macsec | maddress | monitor | mptcp | mroute | mrule |","                   neighbor | neighbour | netconf | netns | nexthop | ntable |","                   ntbl | route | rule | sr | stats | tap | tcpmetrics |","                   token | tunnel | tuntap | vrf | xfrm }","       OPTIONS := { -V[ersion] | -s[tatistics] | -d[etails] | -r[esolve] |","                    -h[uman-readable] | -iec | -j[son] | -p[retty] |","                    -f[amily] { inet | inet6 | mpls | bridge | link } |","                    -4 | -6 | -M | -B | -0 |","                    -l[oops] { maximum-addr-flush-attempts } | -echo | -br[ief] |","                    -o[neline] | -t[imestamp] | -ts[hort] | -b[atch] [filename] |","                    -rc[vbuf] [size] | -n[etns] name | -N[umeric] | -a[ll] |","                    -c[olor]}"],"address":["Usage: ip address {add|change|replace} IFADDR dev IFNAME [ LIFETIME ]","                                                      [ CONFFLAG-LIST ]","       ip address del IFADDR dev IFNAME [mngtmpaddr]","       ip address {save|flush} [ dev IFNAME ] [ scope SCOPE-ID ] [ to PREFIX ]","                            [ FLAG-LIST ] [ label LABEL ] [ { up | down } ]","       ip address [ show [ dev IFNAME ] [ scope SCOPE-ID ] [ master DEVICE ]","                         [ nomaster ]","                         [ type TYPE ] [ to PREFIX ] [ FLAG-LIST ]","                         [ label LABEL ] [ { up | down } ] [ vrf NAME ]","                         [ proto ADDRPROTO ] ]","       ip address {showdump|restore}","IFADDR := PREFIX | ADDR peer PREFIX","          [ broadcast ADDR ] [ anycast ADDR ]","          [ label IFNAME ] [ scope SCOPE-ID ] [ metric METRIC ]","          [ proto ADDRPROTO ]","SCOPE-ID := [ host | link | global | NUMBER ]","FLAG-LIST := [ FLAG-LIST ] FLAG","FLAG  := [ permanent | dynamic | secondary | primary |","           [-]tentative | [-]deprecated | [-]dadfailed | temporary |","           CONFFLAG-LIST ]","CONFFLAG-LIST := [ CONFFLAG-LIST ] CONFFLAG","CONFFLAG  := [ home | nodad | mngtmpaddr | noprefixroute | autojoin ]","LIFETIME := [ valid_lft LFT ] [ preferred_lft LFT ]","LFT := forever | SECONDS","ADDRPROTO := [ NAME | NUMBER ]","TYPE := { amt | bareudp | bond | bond_slave | bridge | bridge_slave |","          dsa | dummy | erspan | geneve | gre | gretap | gtp | hsr |","          ifb | ip6erspan | ip6gre | ip6gretap | ip6tnl |","          ipip | ipoib | ipvlan | ipvtap |","          macsec | macvlan | macvtap | netdevsim |","          netkit | nlmon | pfcp | rmnet | sit | team | team_slave |","          vcan | veth | vlan | vrf | vti | vxcan | vxlan | wwan |","          xfrm | virt_wifi }"],"link":["Usage: ip link add [link DEV | parentdev NAME] [ name ] NAME","\t\t    [ txqueuelen PACKETS ]","\t\t    [ address LLADDR ]","\t\t    [ broadcast LLADDR ]","\t\t    [ mtu MTU ] [index IDX ]","\t\t    [ numtxqueues QUEUE_COUNT ]","\t\t    [ numrxqueues QUEUE_COUNT ]","\t\t    [ netns { PID | NETNSNAME | NETNSFILE } ]","\t\t    type TYPE [ ARGS ]","","\tip link delete { DEVICE | dev DEVICE | group DEVGROUP } type TYPE [ ARGS ]","","\tip link { set | change } { DEVICE | dev DEVICE | group DEVGROUP }","\t\t\t[ { up | down } ]","\t\t\t[ type TYPE ARGS ]","\t\t[ arp { on | off } ]","\t\t[ dynamic { on | off } ]","\t\t[ multicast { on | off } ]","\t\t[ allmulticast { on | off } ]","\t\t[ promisc { on | off } ]","\t\t[ trailers { on | off } ]","\t\t[ carrier { on | off } ]","\t\t[ txqueuelen PACKETS ]","\t\t[ name NEWNAME ]","\t\t[ address LLADDR ]","\t\t[ broadcast LLADDR ]","\t\t[ mtu MTU ]","\t\t[ netns { PID | NETNSNAME | NETNSFILE } ]","\t\t[ link-netns NAME | link-netnsid ID ]","\t\t[ alias NAME ]","\t\t[ vf NUM [ mac LLADDR ]","\t\t\t [ vlan VLANID [ qos VLAN-QOS ] [ proto VLAN-PROTO ] ]","\t\t\t [ rate TXRATE ]","\t\t\t [ max_tx_rate TXRATE ]","\t\t\t [ min_tx_rate TXRATE ]","\t\t\t [ spoofchk { on | off} ]","\t\t\t [ query_rss { on | off} ]","\t\t\t [ state { auto | enable | disable} ]","\t\t\t [ trust { on | off} ]","\t\t\t [ node_guid EUI64 ]","\t\t\t [ port_guid EUI64 ] ]","\t\t[ { xdp | xdpgeneric | xdpdrv | xdpoffload } { off |","\t\t\t  object FILE [ { section | program } NAME ] [ verbose ] |","\t\t\t  pinned FILE } ]","\t\t[ master DEVICE ][ vrf NAME ]","\t\t[ nomaster ]","\t\t[ addrgenmode { eui64 | none | stable_secret | random } ]","\t\t[ protodown { on | off } ]","\t\t[ protodown_reason PREASON { on | off } ]","\t\t[ gso_max_size BYTES ] [ gso_ipv4_max_size BYTES ] [ gso_max_segs PACKETS ]","\t\t[ gro_max_size BYTES ] [ gro_ipv4_max_size BYTES ]","","\tip link show [ DEVICE | group GROUP ] [ { up | down } ] [master DEV] [vrf NAME]","\t\t[type TYPE] [nomaster] [ novf ]","","\tip link xstats type TYPE [ ARGS ]","","\tip link afstats [ dev DEVICE ]","\tip link property add dev DEVICE [ altname NAME .. ]","\tip link property del dev DEVICE [ altname NAME .. ]","","\tip link help [ TYPE ]","","TYPE := { amt | bareudp | bond | bond_slave | bridge | bridge_slave |","          dsa | dummy | erspan | geneve | gre | gretap | gtp | hsr |","          ifb | ip6erspan | ip6gre | ip6gretap | ip6tnl |","          ipip | ipoib | ipvlan | ipvtap |","          macsec | macvlan | macvtap | netdevsim |","          netkit | nlmon | pfcp | rmnet | sit | team | team_slave |","          vcan | veth | vlan | vrf | vti | vxcan | vxlan | wwan |","          xfrm | virt_wifi }"],"route":["Usage: ip route { list | flush } SELECTOR","       ip route save SELECTOR","       ip route restore","       ip route showdump","       ip route get [ ROUTE_GET_FLAGS ] [ to ] ADDRESS","                            [ from ADDRESS iif STRING ]","                            [ oif STRING ] [ tos TOS ]","                            [ mark NUMBER ] [ vrf NAME ]","                            [ uid NUMBER ] [ ipproto PROTOCOL ]","                            [ sport NUMBER ] [ dport NUMBER ]","                            [ as ADDRESS ] [ flowlabel FLOWLABEL ]","       ip route { add | del | change | append | replace } ROUTE","SELECTOR := [ root PREFIX ] [ match PREFIX ] [ exact PREFIX ]","            [ table TABLE_ID ] [ vrf NAME ] [ proto RTPROTO ]","            [ type TYPE ] [ scope SCOPE ]","ROUTE := NODE_SPEC [ INFO_SPEC ]","NODE_SPEC := [ TYPE ] PREFIX [ tos TOS ]","             [ table TABLE_ID ] [ proto RTPROTO ]","             [ scope SCOPE ] [ metric METRIC ]","             [ ttl-propagate { enabled | disabled } ]","INFO_SPEC := { NH | nhid ID } OPTIONS FLAGS [ nexthop NH ]...","NH := [ encap ENCAPTYPE ENCAPHDR ] [ via [ FAMILY ] ADDRESS ]","      [ dev STRING ] [ weight NUMBER ] NHFLAGS","FAMILY := [ inet | inet6 | mpls | bridge | link ]","OPTIONS := FLAGS [ mtu NUMBER ] [ advmss NUMBER ] [ as [ to ] ADDRESS ]","           [ rtt TIME ] [ rttvar TIME ] [ reordering NUMBER ]","           [ window NUMBER ] [ cwnd NUMBER ] [ initcwnd NUMBER ]","           [ ssthresh NUMBER ] [ realms REALM ] [ src ADDRESS ]","           [ rto_min TIME ] [ hoplimit NUMBER ] [ initrwnd NUMBER ]","           [ features FEATURES ] [ quickack BOOL ] [ congctl NAME ]","           [ pref PREF ] [ expires TIME ] [ fastopen_no_cookie BOOL ]","TYPE := { unicast | local | broadcast | multicast | throw |","          unreachable | prohibit | blackhole | nat }","TABLE_ID := [ local | main | default | all | NUMBER ]","SCOPE := [ host | link | global | NUMBER ]","NHFLAGS := [ onlink | pervasive ]","RTPROTO := [ kernel | boot | static | NUMBER ]","PREF := [ low | medium | high ]","TIME := NUMBER[s|ms]","BOOL := [1|0]","FEATURES := ecn","ENCAPTYPE := [ mpls | ip | ip6 | seg6 | seg6local | rpl | ioam6 | xfrm ]","ENCAPHDR := [ MPLSLABEL | SEG6HDR | SEG6LOCAL | IOAM6HDR | XFRMINFO ]","SEG6HDR := [ mode SEGMODE ] segs ADDR1,ADDRi,ADDRn [hmac HMACKEYID] [cleanup]","SEGMODE := [ encap | encap.red | inline | l2encap | l2encap.red ]","SEG6LOCAL := action ACTION [ OPTIONS ] [ count ]","ACTION := { End | End.X | End.T | End.DX2 | End.DX6 | End.DX4 |","            End.DT6 | End.DT4 | End.DT46 | End.B6 | End.B6.Encaps |","            End.BM | End.S | End.AS | End.AM | End.BPF }","OPTIONS := OPTION [ OPTIONS ]","OPTION := { flavors FLAVORS | srh SEG6HDR | nh4 ADDR | nh6 ADDR | iif DEV | oif DEV |","            table TABLEID | vrftable TABLEID | endpoint PROGNAME }","FLAVORS := { FLAVOR[,FLAVOR] }","FLAVOR := { psp | usp | usd | next-csid }","IOAM6HDR := trace prealloc type IOAM6_TRACE_TYPE ns IOAM6_NAMESPACE size IOAM6_TRACE_SIZE","XFRMINFO := if_id IF_ID [ link_dev LINK ]","ROUTE_GET_FLAGS := ROUTE_GET_FLAG [ ROUTE_GET_FLAGS ]","ROUTE_GET_FLAG := [ connected | fibmatch | notify ]"],"neighbour":["Usage: ip neigh { add | del | change | replace }","                { ADDR [ lladdr LLADDR ] [ nud STATE ] proxy ADDR }","                [ dev DEV ] [ router ] [ use ] [ managed ] [ extern_learn ]","                [ protocol PROTO ]","","\tip neigh { show | flush } [ proxy ] [ to PREFIX ] [ dev DEV ] [ nud STATE ]","\t\t\t\t  [ vrf NAME ] [ nomaster ]","\tip neigh get { ADDR | proxy ADDR } dev DEV","","STATE := { delay | failed | incomplete | noarp | none |","           permanent | probe | reachable | stale }"]}; /* iproute2 6.15's usage(): ip help, and each object's help */
cmd('ip','/usr/bin','show / manipulate routing, network devices, interfaces and tunnels','ip [ OPTIONS ] OBJECT { COMMAND | help }',[
  'shows the network: ip addr its addresses, ip link its interfaces, ip route where packets go. -br makes it brief. changing any of it needs root.','',
  '-br, -brief   print only basic information in a tabular format for better readability',
  'address, link, neighbour, route   the objects it knows; each may be shortened, as ip a, ip l, ip n and ip r',
  'show [dev name]   the command, and the default. with ip address, dev name shows only that interface, lo or ens3. add, del, set, change, replace, flush and append are refused',
  'help   print the usage of ip, given as the object, or of the object it follows'],function(a){
  var br=a.indexOf('-br')>=0||a.indexOf('-brief')>=0,w=a.filter(function(x){return x.charAt(0)!=='-'}),ob=w[0]||'',verb=w[1]||'show',dev=w.indexOf('dev')>=0?w[w.indexOf('dev')+1]:null;
  var obj=!ob||ob==='help'?'top':'address'.indexOf(ob)===0||ob==='addr'?'address':'link'.indexOf(ob)===0?'link':'route'.indexOf(ob)===0?'route':'neighbour'.indexOf(ob)===0||'neighbor'.indexOf(ob)===0?'neighbour':null;
  if(obj==='top'||obj&&verb==='help'){IPHELP[obj].forEach(function(l){err(l)});P.queue(function(){P.status(255)});return} /* usage(): on stderr, and exit(-1) */
  if(dev&&dev!=='lo'&&dev!=='ens3'){err('Device "'+dev+'" does not exist.');P.status(1);return}
  if(/^(add|del|delete|set|change|replace|flush|append)$/.test(verb)){err('RTNETLINK answers: Operation not permitted');P.status(2);return}
  if('address'.indexOf(ob)===0||ob==='addr'){lines(ipAddr(br,dev));return}
  if('link'.indexOf(ob)===0){
    lines((br?['lo               UNKNOWN        00:00:00:00:00:00 <LOOPBACK,UP,LOWER_UP> ','ens3             UP             '+D.mac+' <BROADCAST,MULTICAST,UP,LOWER_UP> ']:
      ['1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN mode DEFAULT group default qlen 1000','    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00',
       '2: ens3: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP mode DEFAULT group default qlen 1000','    link/ether '+D.mac+' brd ff:ff:ff:ff:ff:ff','    altname enp0s3']));
    return;
  }
  if('neighbour'.indexOf(ob)===0||'neighbor'.indexOf(ob)===0){lines([D.gw+' dev ens3 lladdr 52:54:00:0d:3c:01 REACHABLE ']);return} /* the gateway: the only other host it has spoken to */
  if('route'.indexOf(ob)===0){lines(['default via '+D.gw+' dev ens3 proto static ','203.0.113.0/24 dev ens3 proto kernel scope link src '+D.ip4+' ']);return}
  err('Object "'+ob+'" is unknown, try "ip help".');P.status(1);
});

/* processes: procps */
function procs(){ /* user, pid, ppid, vsz, rss, tty, stat, start, time, command */
  var b=hm(BOOT),l=hm(P.st.login),R=[
    ['root',1,0,24412,13216,'?','Ss',b,'0:01','/sbin/init'],['root',2,0,0,0,'?','S',b,'0:00','[kthreadd]'],['root',3,2,0,0,'?','S',b,'0:00','[pool_workqueue_release]'],
    ['root',4,2,0,0,'?','I<',b,'0:00','[kworker/R-rcu_gp]'],['root',14,2,0,0,'?','I',b,'0:00','[rcu_preempt]'],['root',15,2,0,0,'?','S',b,'0:00','[migration/0]'],
    ['root',16,2,0,0,'?','S',b,'0:00','[ksoftirqd/0]'],['root',97,2,0,0,'?','I',b,'0:00','[kworker/1:2-events]'],['root',181,2,0,0,'?','S',b,'0:00','[jbd2/vda1-8]'],
    ['root',236,1,49536,15104,'?','Ss',b,'0:00','/usr/lib/systemd/systemd-journald'],['root',268,1,27740,7296,'?','Ss',b,'0:00','/usr/lib/systemd/systemd-udevd'],
    ['systemd+',412,1,19064,8960,'?','Ss',b,'0:00','/usr/lib/systemd/systemd-networkd'],['systemd+',418,1,90200,7040,'?','Ssl',b,'0:00','/usr/lib/systemd/systemd-timesyncd'],
    ['message+',497,1,8740,4992,'?','Ss',b,'0:00','/usr/bin/dbus-daemon --system --address=systemd: --nofork --nopidfile --systemd-activation --syslog-only'],
    ['root',498,1,6696,2816,'?','Ss',b,'0:00','/usr/sbin/cron -f'],['root',503,1,18292,8576,'?','Ss',b,'0:00','/usr/lib/systemd/systemd-logind'],
    ['root',541,1,11788,7552,'?','Ss',b,'0:00','sshd: /usr/sbin/sshd -D [listener] 0 of 10-100 startups'],['root',552,1,5872,1920,'tty1','Ss+',b,'0:00','/sbin/agetty -o -- \\u --noreset --noclear - linux'],
    ['root',553,1,7004,3712,'ttyS0','Ss',b,'0:00','/bin/login -p --'],[P.st.user,655,1,19648,10752,'?','Ss',l,'0:00','/usr/lib/systemd/systemd --user'],
    [P.st.user,656,655,21308,3428,'?','S',l,'0:00','(sd-pam)'],[P.st.user,662,553,8084,4864,'ttyS0','S',l,'0:00','-bash']];
  return R;
}
P.procs=function(){return procs().map(function(r){return {pid:r[1],mine:r[0]===P.st.user,cmd:r[9]}})}; /* for kill and $$ */
function comm(c){return c.replace(/^-/,'').split(' ')[0].replace(/^.*\//,'').replace(/^\[(.*)\]$/,'$1')} /* the command's name, as ps and top show it */
function self(c){return [P.st.user,P.pidNow()||P.newPid(),662,11076,4224,'ttyS0','R+',hm(P.now()),'0:00',c]}
function bgRows(me){return P.jobs().filter(function(j){return j.pid!==me}).map(function(j){return [P.st.user,j.pid,662,5476,1792,'ttyS0',j.stopped?'T':'S',hm(j.start),'0:00',j.cmd]})} /* what was started with &: sleeping, or stopped */
cmd('ps','/usr/bin','report a snapshot of the current processes.','ps [options]',[
  'lists processes. with no options, those on your terminal. ps aux lists everyone\'s, with the user, cpu, memory and start time of each; ps -ef the same in the System V style.','',
  'a   with x, lift the BSD-style "only yourself" restriction too: every process',
  'u   display user-oriented format',
  'x   lift the BSD-style "must have a tty" restriction: all your own processes',
  '-A, -e   select all processes',
  '-f   do full-format listing'],function(a,raw,w){
  var f=a.join(' '),bsd=a.length&&a[0].charAt(0)!=='-',x=bsd?a[0]:'',every=/a.*x|x.*a/.test(x)||/(^|\s)-\w*[eA]/.test(f),mine=self('ps '+a.join(' ')),R=procs().concat(bgRows(mine[1]),[mine]);
  var T=P.st.user;
  if(!every)R=R.filter(function(r){return r[5]==='ttyS0'&&r[0]===T||bsd&&/x/.test(x)&&r[0]===T});
  if(bsd&&/u/.test(x)){
    out(['USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND'].concat(R.map(function(r){
      return r[0].padEnd(8)+String(r[1]).padStart(8)+' '+(r[1]===1?'0.4':'0.0').padStart(4)+' '+(r[4]*100/D.mem.MemTotal).toFixed(1).padStart(4)+' '+String(r[3]).padStart(6)+' '+String(r[4]).padStart(5)+' '+r[5].padEnd(8)+' '+r[6].padEnd(4)+' '+r[7].padStart(5)+' '+r[8].padStart(6)+' '+(r[0]===T&&r[9]==='-bash'?'-bash':r[9]);
    })));
    return;
  }
  if(/(^|\s)-\w*f/.test(f)){
    out(['UID          PID    PPID  C STIME TTY          TIME CMD'].concat(R.map(function(r){
      return r[0].padEnd(8)+String(r[1]).padStart(8)+String(r[2]).padStart(8)+'  0 '+r[7]+' '+r[5].padEnd(8)+' 00:00:0'+(r[8]==='0:01'?'1':'0')+' '+r[9];
    })));
    return;
  }
  if(bsd){
    out(['    PID TTY      STAT   TIME COMMAND'].concat(R.map(function(r){return String(r[1]).padStart(7)+' '+r[5].padEnd(8)+' '+r[6].padEnd(6)+r[8].padStart(5)+' '+r[9]})));
    return;
  }
  out(['    PID TTY          TIME CMD'].concat(R.map(function(r){
    return String(r[1]).padStart(7)+' '+r[5].padEnd(8)+' 00:00:00 '+comm(r[9]);
  })));
});
cmd('top','/usr/bin','display Linux processes','top [options]',[
  'shows the machine at work: the uptime and load, the tasks, the processors and memory, and the busiest processes, redrawn every three seconds. q leaves. -b prints it once, as text, for a pipe or a file.'],function(a){
  var batch=a.some(function(x){return /^-[^-]*b/.test(x)});
  if(P.piped()&&!batch){err('top: failed tty get');return}
  var me=self('top'),cpu=[0,0];
  if(batch){P.say(screen(999,999));return}
  function screen(rows,cols){ /* top's screen, rows by cols */
      var M=D.mem,mb=function(x){return (x/1024).toFixed(1).padStart(9)},cache=M.Buffers+M.Cached+M.SReclaimable,R=procs().concat([me]),us=(.3+cpu[0]%3*.1).toFixed(1);
      var L=['top - '+upLine().slice(1),'Tasks:  '+R.length+' total,   1 running,  '+(R.length-1)+' sleeping,   0 stopped,   0 zombie',
        '%Cpu(s):  '+us+' us,  0.2 sy,  0.0 ni, '+(99.5-us).toFixed(1)+' id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st',
        'MiB Mem : '+mb(M.MemTotal)+' total, '+mb(M.MemFree)+' free, '+mb(M.MemTotal-M.MemFree-cache)+' used, '+mb(cache)+' buff/cache',
        'MiB Swap:       0.0 total,       0.0 free,       0.0 used. '+mb(M.MemAvailable)+' avail Mem','',
        '    PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND'];
      R.slice().sort(function(x,y){return (y===me)-(x===me)||x[1]-y[1]}).forEach(function(r){
        var c=r===me?'0.3':r[1]===1&&cpu[0]%4===0?'0.3':'0.0',k=comm(r[9]);
        L.push(String(r[1]).padStart(7)+' '+r[0].padEnd(9)+(r[6].indexOf('<')>=0?'  0 -20':' 20   0')+String(r[3]).padStart(8)+String(r[4]).padStart(7)+String(Math.floor(r[4]*.6)).padStart(7)+' '+r[6].charAt(0)+'  '+c.padStart(4)+'  '+(r[4]*100/M.MemTotal).toFixed(1).padStart(4)+'   0:00.'+p2(r===me?cpu[1]:r[1]===1?84:2)+' '+k);
      });
      return L.slice(0,rows).map(function(l){return l.slice(0,cols)});
  }
  P.program(function(S,done){
    function draw(){S.draw(screen(S.rows,S.cols),5,0)}
    S.every(3000,function(){cpu[0]++;cpu[1]=Math.min(99,cpu[1]+1);draw()});
    draw();
    return {feed:function(k){
      if(k==='q'||k==='Q'||k==='C-c'){S.close();done();return}
      if(k===' '||k==='Enter'){draw()}
    },draw:draw};
  });
});

/* systemd */
var UNITS=[ /* name, description, pid, command, memory, docs */
  ['cron.service','Regular background program processing daemon',498,'/usr/sbin/cron -f','412K','man:cron(8)'],
  ['dbus.service','D-Bus System Message Bus',497,'/usr/bin/dbus-daemon --system --address=systemd: --nofork --nopidfile --systemd-activation --syslog-only','1.6M','man:dbus-daemon(1)'],
  ['getty@tty1.service','Getty on tty1',552,'/sbin/agetty -o "-- \\\\u" --noreset --noclear - linux','220K','man:agetty(8) man:systemd-getty-generator(8)'],
  ['serial-getty@ttyS0.service','Serial Getty on ttyS0',553,'/bin/login -p --','2.4M','man:agetty(8) man:systemd-getty-generator(8)'],
  ['ssh.service','OpenBSD Secure Shell server',541,'"sshd: /usr/sbin/sshd -D [listener] 0 of 10-100 startups"','2.2M','man:sshd(8) man:sshd_config(5)'],
  ['systemd-journald.service','Journal Service',236,'/usr/lib/systemd/systemd-journald','9.8M','man:systemd-journald.service(8) man:journald.conf(5)'],
  ['systemd-logind.service','User Login Management',503,'/usr/lib/systemd/systemd-logind','1.9M','man:sd-login(3) man:systemd-logind.service(8) man:logind.conf(5)'],
  ['systemd-networkd.service','Network Configuration',412,'/usr/lib/systemd/systemd-networkd','2.6M','man:systemd-networkd.service(8) man:org.freedesktop.network1(5)'],
  ['systemd-timesyncd.service','Network Time Synchronization',418,'/usr/lib/systemd/systemd-timesyncd','1.3M','man:systemd-timesyncd.service(8)'],
  ['systemd-udevd.service','Rule-based Manager for Device Events and Files',268,'/usr/lib/systemd/systemd-udevd','2.1M','man:systemd-udevd.service(8) man:udev(7)'],
  ['unattended-upgrades.service','Unattended Upgrades Shutdown',0,'','','man:unattended-upgrade(8)']];
function unit(x){
  var n=/\.\w+$/.test(x)?x:x+'.service';
  if(n==='sshd.service')n='ssh.service';
  return UNITS.filter(function(u){return u[0]===n})[0];
}
cmd(['systemctl'],'/usr/bin','Control the systemd system and service manager','systemctl [OPTIONS...] COMMAND [UNIT...]',[
  'asks systemd about the services it runs, and tells it what to do with them. status shows one, or the whole machine; list-units lists them. starting, stopping and enabling need root.','',
  'list-units, list   list units that systemd currently has in memory. the default command',
  'status [UNIT...]   show runtime status information about the whole system or about one or more units',
  'show UNIT...   here the same as status',
  'is-active UNIT...   check whether the units are active (i.e. running)',
  'start, stop, restart, try-restart, reload, reload-or-restart, kill, enable, disable, mask, unmask, edit UNIT...   need root. root\'s are obeyed and change nothing here',
  'daemon-reload   reload the systemd manager configuration; needs root',
  'reboot, poweroff, halt, suspend   shut down and reboot, power off or halt the system, or suspend it; they need root',
  'hibernate, hybrid-sleep   hibernate the system; they fail, as there is no swap space'],function(a,raw,w){
  var o=opts(a),verb=o.ops[0]||'list-units',names=o.ops.slice(1);
  if(verb==='status'&&!names.length){
    var st=stamp(BOOT);
    lines(['● '+P.st.hostname,'    State: running','    Units: 241 loaded (incl. loaded aliases)','     Jobs: 0 queued','   Failed: 0 units','    Since: '+st+'; '+ago(since()),'  systemd: '+D.systemd,'   CGroup: /',
      '           ├─init.scope','           │ └─1 /sbin/init','           ├─system.slice'].concat(
      UNITS.filter(function(u){return u[2]}).map(function(u,i,A){var last=i===A.length-1;return ['           │ '+(last?'└':'├')+'─'+u[0],'           │ '+(last?' ':'│')+' └─'+u[2]+' '+u[3].replace(/"/g,'')]}).reduce(function(x,y){return x.concat(y)},[]),
      ['           └─user.slice','             └─user-1001.slice','               ├─session-1.scope','               │ └─662 -bash','               └─user@1001.service','                 └─init.scope','                   ├─655 /usr/lib/systemd/systemd --user','                   └─656 "(sd-pam)"']));
    return;
  }
  if(verb==='status'||verb==='is-active'||verb==='show'){
    names.forEach(function(x,i){
      var u=unit(x);
      if(!u){if(verb==='is-active')P.typeLine('inactive');else err('Unit '+(/\.\w+$/.test(x)?x:x+'.service')+' could not be found.');P.status(verb==='is-active'?3:4);return}
      if(verb==='is-active'){P.typeLine(u[2]?'active':'inactive');return}
      if(i)P.typeLine('');
      var on=!!u[2],t=stamp(BOOT);
      lines([(on?'● ':'○ ')+u[0]+' - '+u[1],'     Loaded: loaded (/usr/lib/systemd/system/'+u[0].replace(/@\w+/,'@')+'; enabled; preset: enabled)',
        '     Active: '+(on?'active (running) since '+t+'; '+ago(since()):'inactive (dead)')].concat(on?['       Docs: '+u[5],'   Main PID: '+u[2]+' ('+u[3].replace(/^"?(sshd).*|^(\S+).*/,function(m,s,c){return s||c.replace(/^.*\//,'').slice(0,15)})+')','      Tasks: 1 (limit: 2315)','     Memory: '+u[4],'        CPU: '+(20+u[2]%70)+'ms','     CGroup: /system.slice/'+u[0],'             └─'+u[2]+' '+u[3]]:['       Docs: '+u[5]]));
    });
    return;
  }
  if(/^(list-units|list)$/.test(verb)){
    var R=UNITS.filter(function(u){return u[2]}),wd=R.reduce(function(m,u){return Math.max(m,u[0].length)},0)+1;
    lines(['  '+'UNIT'.padEnd(wd)+' LOAD   ACTIVE SUB     DESCRIPTION'].concat(R.map(function(u){return '  '+u[0].padEnd(wd)+' loaded active running '+u[1]}),
      ['','Legend: LOAD   → Reflects whether the unit definition was properly loaded.','        ACTIVE → The high-level unit activation state, i.e. generalization of SUB.','        SUB    → The low-level unit activation state, values depend on unit type.','',
       R.length+' loaded units listed. Pass --all to see loaded but inactive units, too.',"To show all installed unit files use 'systemctl list-unit-files'."]));
    return;
  }
  if(/^(start|stop|restart|reload|enable|disable|mask|unmask|kill|try-restart|reload-or-restart|daemon-reload|edit)$/.test(verb)){
    var x=names[0]?(/\.\w+$/.test(names[0])?names[0]:names[0]+'.service'):'';
    if(P.st.user==='root'){ /* root is obeyed, quietly; this terminal keeps its services as they were */
      if(verb!=='daemon-reload'&&!x){err('Too few arguments.');P.status(1);return}
      if(x&&!unit(x)){err(/able|mask/.test(verb)?'Failed to '+verb+' unit: Unit file '+x+' does not exist.':'Failed to '+verb+' '+x+': Unit '+x+' not found.');if(!/able|mask/.test(verb))P.queue(function(){P.status(5)})} /* after the line, which sets 1 */
      return;
    }
    if(verb==='daemon-reload'){err('Failed to reload daemon: Interactive authentication required.');P.status(1);return}
    if(!x){err('Too few arguments.');P.status(1);return}
    err(/able|mask/.test(verb)?'Failed to '+verb+' unit: Interactive authentication required.':'Failed to '+verb+' '+x+': Interactive authentication required.');
    if(!/able|mask/.test(verb))err("See system logs and 'systemctl status "+x+"' for details.");
    P.status(1);
    return;
  }
  if(/^(reboot|poweroff|halt|suspend|hibernate|hybrid-sleep)$/.test(verb)){power(verb);return}
  err('Unknown command verb \''+verb+'\'.');P.status(1);
});
function power(v){
  var call='Call to '+{poweroff:'PowerOff',reboot:'Reboot',halt:'Halt',suspend:'Suspend',hibernate:'Hibernate','hybrid-sleep':'HybridSleep'}[v]+' failed: '; /* logind's D-Bus method */
  if(v==='hibernate'||v==='hybrid-sleep'){err(call+'Not enough suitable swap space for hibernation available on compatible block devices and file systems.');P.status(1);return} /* it has no swap, and logind looks before it asks who you are */
  if(P.st.user!=='root'){err(call+'Interactive authentication required.');P.status(1);return}
  var s=(since()/1000).toFixed(6).padStart(12); /* since() counts from the boot */
  if(v==='suspend'){P.powerOff(['[  OK  ] Reached target sleep.target - Sleep.','         Starting systemd-suspend.service - System Suspend...','['+s+'] PM: suspend entry (deep)']);return} /* a key wakes it, as a reload */
  var T={halt:['systemd-halt.service - System Halt','halt.target - System Halt','System halted'],poweroff:['systemd-poweroff.service - System Power Off','poweroff.target - System Power Off','Power down'],
    reboot:['systemd-reboot.service - System Reboot','reboot.target - System Reboot','Restarting system']}[v];
  P.powerOff(['         Stopping session-1.scope - Session 1 of User '+(STK.length&&STK[0].base?STK[0].from:'root')+'...','[  OK  ] Stopped target multi-user.target - Multi-User System.',
    '         Stopping cron.service - Regular background program processing daemon...','         Stopping ssh.service - OpenBSD Secure Shell server...','[  OK  ] Stopped cron.service - Regular background program processing daemon.',
    '[  OK  ] Stopped ssh.service - OpenBSD Secure Shell server.','[  OK  ] Reached target shutdown.target - System Shutdown.','[  OK  ] Reached target final.target - Final Step.',
    '[  OK  ] Finished '+T[0]+'.','[  OK  ] Reached target '+T[1]+'.','['+s+'] reboot: '+T[2]]);
}
['reboot','poweroff','halt','shutdown'].forEach(function(v){
  cmd(v,'/usr/sbin',(v==='shutdown'?'Halt, power off or reboot the machine':v==='reboot'?'Reboot the machine':v==='halt'?'Halt the machine':'Power off the machine'),v+' [OPTIONS...]'+(v==='shutdown'?' [TIME] [WALL...]':''),['asks systemd to stop the machine. only an administrator may.'].concat(v!=='shutdown'?[]:['',
    'the first argument may be a time string: "hh:mm" in the 24h clock, "+m" (or m) minutes from now, or "now". with none, "+1" is implied. what follows it is a wall message for the other users.','',
    '-H, --halt   halt the machine',
    '-P, --poweroff   power the machine off (the default)',
    '-r, --reboot   reboot the machine',
    '-h   the same as --poweroff',
    '-c   cancel a pending shutdown']),function(a){
    var r=v==='shutdown'?'poweroff':v,when=null,m,now=P.now();
    if(v==='shutdown')a.forEach(function(x){if(x==='-r'||x==='--reboot')r='reboot';else if(x==='-H'||x==='--halt')r='halt';else if(x==='-h'||x==='-P'||x==='--poweroff')r='poweroff'}); /* the last one given */
    if(v!=='shutdown'||P.st.user!=='root'){power(r);return}
    for(var i=0;i<a.length;i++){
      var x=a[i];
      if(x==='-c')return; /* cancelled, quietly */
      if(x.charAt(0)==='-')continue;
      else if(when===null){ /* the time: now, +minutes, or hh:mm (tomorrow if it has gone); the rest is a message for the others */
        if(x==='now')when=0;
        else if((m=x.match(/^\+?(\d+)$/)))when=+m[1]*6e4;
        else if((m=x.match(/^(\d{1,2}):(\d\d)$/))&&+m[1]<24&&+m[2]<60){var t=new Date(now);t.setHours(+m[1],+m[2],0,0);if(t<=now)t.setDate(t.getDate()+1);when=t-now}
        else{err('Failed to parse time specification: '+x);P.status(1);return}
      }
    }
    if(when===null)when=6e4;
    if(isNaN(new Date(now.getTime()+when).getTime())){err('Failed to parse time specification: '+a.filter(function(x){return x.charAt(0)!=='-'})[0]);P.status(1);return} /* past the end of time */
    if(!when){power(r);return}
    P.typeLine((r==='reboot'?'Reboot':'Shutdown')+' scheduled for '+stamp(new Date(now.getTime()+when))+', use \'shutdown -c\' to cancel.'); /* which this terminal does not wait out */
  });
});
cmd('journalctl','/usr/bin','Print log entries from the systemd journal','journalctl [OPTIONS...] [MATCHES...]',[
  'prints the system journal, oldest first. ordinary users see only their own entries; the system\'s are for the groups adm and systemd-journal.','',
  '-k, --dmesg   show only kernel messages',
  '-n, --lines   show the most recent journal events and limit the number of events shown, 10 by default: -n 5',
  '-q, --quiet   suppresses all informational messages',
  '-u, --unit=UNIT   show messages for the specified systemd unit'],function(a){
  var o=opts(a),t=new Date(BOOT.getTime()+48e3),h=P.st.hostname,pfx=jstamp(t)+' '+h+' systemd[655]: ';
  if(!o.has('q','quiet'))lines(['Hint: You are currently not seeing messages from other users and the system.',"      Users in groups 'adm', 'systemd-journal' can see all messages.",'      Pass -q to turn off this notice.']);
  if(o.has('u','unit')||o.has('k','dmesg')||o.L.unit){P.typeLine('-- No entries --');return}
  var E=['Queued start job for default target default.target.','Created slice app.slice - User Application Slice.','Reached target paths.target - Paths.','Reached target timers.target - Timers.',
    'Starting dbus.socket - D-Bus User Message Bus Socket...','Listening on dbus.socket - D-Bus User Message Bus Socket.','Reached target sockets.target - Sockets.','Reached target basic.target - Basic System.',
    'Reached target default.target - Main User Target.','Startup finished in 84ms.'];
  if(o.has('n','lines')){ /* -n N, -nN or --lines=N: the last N; all, or none given: 10 */
    var N=typeof o.L.lines==='string'?o.L.lines:/n(\d+)/.test(o.f)?/n(\d+)/.exec(o.f)[1]:/^\d+$/.test(o.ops[0]||'')?o.ops[0]:'10';
    if(N!=='all'&&!/^\+?\d+$/.test(N)){err('Failed to parse lines \''+N+'\'');P.queue(function(){P.status(1)});return}
    E=N==='all'?E:E.slice(E.length-Math.min(E.length,parseInt(N,10)));
  }
  lines(E.map(function(e){return pfx+e}));
});

/* packages: apt as anyone but root. Each is [name, version, description, installed size in kB if known, 'auto' if installed as a dependency] */
var PKGS=[['apt','3.0.4','commandline package manager',4481],['base-files','13.8+deb13u7','Debian base system miscellaneous files',500],['bash','5.2.37-2+b10','GNU Bourne Again SHell',7196],
  ['coreutils','9.7-3','GNU core utilities',18457],['cowsay','3.03+dfsg2-8','configurable talking cow',92],['cmatrix','2.0-6','simulates the display from "The Matrix"',75],['cron','3.0pl1-197','process scheduling daemon',249],
  ['dbus','1.16.2-2','simple interprocess messaging system (system message bus)',154],['fortune-mod','1:1.99.1-9','provides fortune cookies on demand',113],['fortunes-min','1:1.99.1-9','Data files containing selected fortune cookies',137,'auto'],['frotz','2.55+dfsg-2','interpreter of Z-code story-files',316],
  ['libao-common','1.2.2+20180113-1.2','Cross Platform Audio Output Library (Common files)',23,'auto'],['libao4','1.2.2+20180113-1.2','Cross Platform Audio Output Library',150,'auto'],['libflac14','1.5.0+ds-2','Free Lossless Audio Codec - runtime C library',479,'auto'],['libmodplug1','1:0.8.9.0-3+b2','shared libraries for mod music based on ModPlug',373,'auto'],['libmp3lame0','3.100-6+b3','MP3 encoding library',548,'auto'],['libmpg123-0t64','1.32.10-1','MPEG layer 1/2/3 audio decoder (shared library)',397,'auto'],['libogg0','1.3.5-3+b2','Ogg bitstream library',62,'auto'],['libopus0','1.5.2-2','Opus codec runtime library',3494,'auto'],['libsamplerate0','0.2.2-4+b2','Audio sample rate conversion library',1494,'auto'],['libsndfile1','1.2.2-2','Library for reading/writing audio files',595,'auto'],['libvorbis0a','1.3.7-3','decoder library for Vorbis General Audio Compression Codec',208,'auto'],['libvorbisenc2','1.3.7-3','encoder library for Vorbis General Audio Compression Codec',698,'auto'],
  ['grep','3.11-4','GNU grep, egrep and fgrep',1266],['iproute2','6.15.0-1','networking and traffic control tools',3774],['less','668-1','pager program similar to more',376],['librecode3','3.7.15-1','Shared library on which recode is based',1359,'auto'],
  ['linux-image-'+D.krel,'6.12.111-1','Linux 6.12 for 64-bit PCs (signed)'],['man-db','2.13.1-1','tools for reading manual pages',3153],['nethack-common','3.6.7-1+b2','dungeon crawl game - common files',2323,'auto'],['nethack-console','3.6.7-1+b2','dungeon crawl game - text-based interface',2821],['fastfetch','2.40.4+dfsg-1','neofetch-like tool for fetching system information',1805],
  ['openssh-server','1:10.0p1-7','secure shell (SSH) server, for secure access from remote machines',3429],['procps','2:4.0.4-9','/proc file system utilities',2395],['sl','5.02-1+b1','Correct you if you type \'sl\' by mistake',60],
  ['sudo','1.9.16p2-3+deb13u2','Provide limited super user privileges to specific users',6705],['systemd','257.13-1~deb13u1','system and service manager',9944],['tar','1.35+dfsg-3.1','GNU version of the tar archiving utility',3085],
  ['unattended-upgrades','2.12','automatic installation of security upgrades',317],['util-linux','2.41.5-0+deb13u1','miscellaneous system utilities',4986],['vim-tiny','2:9.1.1230-2+deb13u1','Vi IMproved - enhanced vi editor - compact version',1831],
  ['python3','3.13.5-1','interactive high-level object-oriented language (default python3 version)',83,'auto'],['python3-minimal','3.13.5-1','minimal subset of the Python language (default python3 version)',112,'auto'],
  ['python3.13','3.13.5-2+deb13u5','Interactive high-level object-oriented language (version 3.13)',830,'auto'],['python3.13-minimal','3.13.5-2+deb13u5','Minimal subset of the Python language (version 3.13)',6768,'auto'],
  ['libpython3.13-minimal','3.13.5-2+deb13u5','Minimal subset of the Python language (version 3.13)',5452,'auto'],['libpython3.13-stdlib','3.13.5-2+deb13u5','Interactive high-level object-oriented language (standard library, version 3.13)',8898,'auto'],
  ['libpython3-stdlib','3.13.5-1','interactive high-level object-oriented language (default python3 version)',28,'auto'],['python3-apt','3.0.0','Python 3 interface to libapt-pkg',698,'auto'],
  ['python-apt-common','3.0.0','Python interface to libapt-pkg (locales)',532,'auto'],['python3-dbus','1.4.0-1','simple interprocess messaging system (Python 3 interface)',415,'auto'],
  ['python3-distro-info','1.13','information about distributions\' releases (Python 3 module)',42,'auto'],['distro-info-data','0.66+deb13u2','information about the distributions\' releases (data files)',19,'auto'],
  ['lsb-release','12.1-1','Linux Standard Base version reporting utility (minimal implementation)',17,'auto'],['ucf','3.0052','Update Configuration File(s): preserve user changes to config files',148,'auto']];
PKGS.sort(function(x,y){return x[0]<y[0]?-1:x[0]>y[0]?1:0}); /* dpkg and apt list by name */
var AVAIL=[['bsdgames','2.17-35','collection of classic textual unix games'],['cowsay-off','3.03+dfsg2-8','configurable talking cow (offensive cows)'],['curl','8.14.1-2+deb13u5','command line tool for transferring data with URL syntax'],
  ['fortunes','1:1.99.1-9','Data files containing fortune cookies'],['git','1:2.47.3-0+deb13u1','fast, scalable, distributed revision control system'],['htop','3.4.1-5','interactive processes viewer'],
  ['nano','8.4-1','small, friendly text editor inspired by Pico'],['nginx','1.26.3-3+deb13u7','small, powerful, scalable web/proxy server'],['tmux','3.5a-3','terminal multiplexer']];
function entry(p){var i=installed(p);return p[0]+'/stable'+(i?',now ':' ')+p[1]+' '+(ALL.test(p[0])?'all':'amd64')+(residual(p)?' [residual-config]':!i?'':p[4]?' [installed,automatic]':' [installed]')} /* a package's line in apt list and apt search */
function pkg(n){return PKGS.concat(AVAIL).filter(function(p){return p[0]===n})[0]}
/* root's apt on this offline box (apt 3.0.4 as it ran on trixie with networking off, these packages installed): what an install of each
   package not installed would bring, and the files it would fetch. f: [what Ign: and Err: name, the file's URL, where apt's error for it comes in its list] */
var AVX={"bsdgames":{"a":["Installing:","  bsdgames","","Installing dependencies:","  libfl2  wamerican","","Suggested packages:","  mailutils"],"n":3,"dl":"1242 kB","sp":"3864 kB","deps":["libfl2","wamerican"],"sg":"mailutils","f":[["http://deb.debian.org/debian trixie/main amd64 wamerican all 2020.12.07-4","http://deb.debian.org/debian/pool/main/s/scowl/wamerican_2020.12.07-4_all.deb",0],["http://deb.debian.org/debian trixie/main amd64 libfl2 amd64 2.6.4-8.2+b4","http://deb.debian.org/debian/pool/main/f/flex/libfl2_2.6.4-8.2%2bb4_amd64.deb",1],["http://deb.debian.org/debian trixie/main amd64 bsdgames amd64 2.17-35","http://deb.debian.org/debian/pool/main/b/bsdgames/bsdgames_2.17-35_amd64.deb",2]]},"cowsay-off":{"a":["Installing:","  cowsay-off"],"n":1,"dl":"8392 B","sp":"23.6 kB","deps":[],"sg":"","f":[["http://deb.debian.org/debian trixie/main amd64 cowsay-off all 3.03+dfsg2-8","http://deb.debian.org/debian/pool/main/c/cowsay/cowsay-off_3.03%2bdfsg2-8_all.deb",0]]},"curl":{"a":["Installing:","  curl","","Installing dependencies:","  bash-completion  libldap2       librtmp1             libssh2-1t64","  libbrotli1       libnghttp2-14  libsasl2-2           publicsuffix","  libcurl4t64      libnghttp3-9   libsasl2-modules","  libldap-common   libpsl5t64     libsasl2-modules-db","","Suggested packages:","  libsasl2-modules-gssapi-mit        libsasl2-modules-otp","  | libsasl2-modules-gssapi-heimdal  libsasl2-modules-sql","  libsasl2-modules-ldap"],"n":15,"dl":"2459 kB","sp":"7366 kB","deps":["bash-completion","libbrotli1","libcurl4t64","libldap-common","libldap2","libnghttp2-14","libnghttp3-9","libpsl5t64","librtmp1","libsasl2-2","libsasl2-modules","libsasl2-modules-db","libssh2-1t64","publicsuffix"],"sg":"libsasl2-modules-gssapi-mit | libsasl2-modules-gssapi-heimdal libsasl2-modules-ldap libsasl2-modules-otp libsasl2-modules-sql","f":[["http://deb.debian.org/debian trixie/main amd64 bash-completion all 1:2.16.0-7","http://deb.debian.org/debian/pool/main/b/bash-completion/bash-completion_2.16.0-7_all.deb",0],["http://security.debian.org/debian-security trixie-security/main amd64 libbrotli1 amd64 1.1.0-2+deb13u1","http://security.debian.org/debian-security/pool/updates/main/b/brotli/libbrotli1_1.1.0-2%2bdeb13u1_amd64.deb",1],["http://deb.debian.org/debian trixie/main amd64 libsasl2-modules-db amd64 2.1.28+dfsg1-9","http://deb.debian.org/debian/pool/main/c/cyrus-sasl2/libsasl2-modules-db_2.1.28%2bdfsg1-9_amd64.deb",2],["http://deb.debian.org/debian trixie/main amd64 libsasl2-2 amd64 2.1.28+dfsg1-9","http://deb.debian.org/debian/pool/main/c/cyrus-sasl2/libsasl2-2_2.1.28%2bdfsg1-9_amd64.deb",3],["http://security.debian.org/debian-security trixie-security/main amd64 libcurl4t64 amd64 8.14.1-2+deb13u7","http://security.debian.org/debian-security/pool/updates/main/c/curl/libcurl4t64_8.14.1-2%2bdeb13u7_amd64.deb",10],["http://security.debian.org/debian-security trixie-security/main amd64 curl amd64 8.14.1-2+deb13u5","http://security.debian.org/debian-security/pool/updates/main/c/curl/curl_8.14.1-2%2bdeb13u5_amd64.deb",11],["http://deb.debian.org/debian trixie/main amd64 libldap2 amd64 2.6.10+dfsg-1","http://deb.debian.org/debian/pool/main/o/openldap/libldap2_2.6.10%2bdfsg-1_amd64.deb",4],["http://deb.debian.org/debian trixie/main amd64 libnghttp2-14 amd64 1.64.0-1.1+deb13u1","http://security.debian.org/debian-security/pool/updates/main/n/nghttp2/libnghttp2-14_1.64.0-1.1%2bdeb13u1_amd64.deb",5],["http://deb.debian.org/debian trixie/main amd64 libnghttp3-9 amd64 1.8.0-1","http://deb.debian.org/debian/pool/main/n/nghttp3/libnghttp3-9_1.8.0-1_amd64.deb",6],["http://deb.debian.org/debian trixie/main amd64 libpsl5t64 amd64 0.21.2-1.1+b1","http://deb.debian.org/debian/pool/main/libp/libpsl/libpsl5t64_0.21.2-1.1%2bb1_amd64.deb",7],["http://deb.debian.org/debian trixie/main amd64 librtmp1 amd64 2.4+20151223.gitfa8646d.1-2+b5","http://deb.debian.org/debian/pool/main/r/rtmpdump/librtmp1_2.4%2b20151223.gitfa8646d.1-2%2bb5_amd64.deb",8],["http://deb.debian.org/debian trixie/main amd64 libssh2-1t64 amd64 1.11.1-1+deb13u2","http://deb.debian.org/debian/pool/main/libs/libssh2/libssh2-1t64_1.11.1-1%2bdeb13u2_amd64.deb",9],["http://deb.debian.org/debian trixie/main amd64 libldap-common all 2.6.10+dfsg-1","http://deb.debian.org/debian/pool/main/o/openldap/libldap-common_2.6.10%2bdfsg-1_all.deb",12],["http://deb.debian.org/debian trixie/main amd64 libsasl2-modules amd64 2.1.28+dfsg1-9","http://deb.debian.org/debian/pool/main/c/cyrus-sasl2/libsasl2-modules_2.1.28%2bdfsg1-9_amd64.deb",13],["http://deb.debian.org/debian trixie/main amd64 publicsuffix all 20250328.1952-0.1","http://deb.debian.org/debian/pool/main/p/publicsuffix/publicsuffix_20250328.1952-0.1_all.deb",14]]},"fortunes":{"a":["Installing:","  fortunes"],"n":1,"dl":"849 kB","sp":"2655 kB","deps":[],"sg":"","f":[["http://deb.debian.org/debian trixie/main amd64 fortunes all 1:1.99.1-9","http://deb.debian.org/debian/pool/main/f/fortune-mod/fortunes_1.99.1-9_all.deb",0]]},"git":{"a":["Installing:","  git","","Installing dependencies:","  git-man             libnghttp2-14             libsasl2-2","  libbrotli1          libnghttp3-9              libsasl2-modules","  libcurl3t64-gnutls  libngtcp2-16              libsasl2-modules-db","  liberror-perl       libngtcp2-crypto-gnutls8  libssh2-1t64","  libldap-common      libpsl5t64                patch","  libldap2            librtmp1                  publicsuffix","","Suggested packages:","  gettext-base  git-cvs                            libsasl2-modules-otp","  git-doc       git-mediawiki                      libsasl2-modules-sql","  git-email     git-svn                            ed","  git-gui       libsasl2-modules-gssapi-mit        diffutils-doc","  gitk          | libsasl2-modules-gssapi-heimdal","  gitweb        libsasl2-modules-ldap"],"n":19,"dl":"13.3 MB","sp":"58.2 MB","deps":["git-man","libbrotli1","libcurl3t64-gnutls","liberror-perl","libldap-common","libldap2","libnghttp2-14","libnghttp3-9","libngtcp2-16","libngtcp2-crypto-gnutls8","libpsl5t64","librtmp1","libsasl2-2","libsasl2-modules","libsasl2-modules-db","libssh2-1t64","patch","publicsuffix"],"sg":"gettext-base git-doc git-email git-gui gitk gitweb git-cvs git-mediawiki git-svn libsasl2-modules-gssapi-mit | libsasl2-modules-gssapi-heimdal libsasl2-modules-ldap libsasl2-modules-otp libsasl2-modules-sql ed diffutils-doc","f":[["http://security.debian.org/debian-security trixie-security/main amd64 libbrotli1 amd64 1.1.0-2+deb13u1","http://security.debian.org/debian-security/pool/updates/main/b/brotli/libbrotli1_1.1.0-2%2bdeb13u1_amd64.deb",0],["http://deb.debian.org/debian trixie/main amd64 libsasl2-modules-db amd64 2.1.28+dfsg1-9","http://deb.debian.org/debian/pool/main/c/cyrus-sasl2/libsasl2-modules-db_2.1.28%2bdfsg1-9_amd64.deb",1],["http://security.debian.org/debian-security trixie-security/main amd64 libcurl3t64-gnutls amd64 8.14.1-2+deb13u7","http://security.debian.org/debian-security/pool/updates/main/c/curl/libcurl3t64-gnutls_8.14.1-2%2bdeb13u7_amd64.deb",11],["http://deb.debian.org/debian trixie/main amd64 libsasl2-2 amd64 2.1.28+dfsg1-9","http://deb.debian.org/debian/pool/main/c/cyrus-sasl2/libsasl2-2_2.1.28%2bdfsg1-9_amd64.deb",2],["http://deb.debian.org/debian trixie/main amd64 libldap2 amd64 2.6.10+dfsg-1","http://deb.debian.org/debian/pool/main/o/openldap/libldap2_2.6.10%2bdfsg-1_amd64.deb",3],["http://deb.debian.org/debian trixie/main amd64 libnghttp2-14 amd64 1.64.0-1.1+deb13u1","http://security.debian.org/debian-security/pool/updates/main/n/nghttp2/libnghttp2-14_1.64.0-1.1%2bdeb13u1_amd64.deb",4],["http://deb.debian.org/debian trixie/main amd64 libnghttp3-9 amd64 1.8.0-1","http://deb.debian.org/debian/pool/main/n/nghttp3/libnghttp3-9_1.8.0-1_amd64.deb",5],["http://deb.debian.org/debian trixie/main amd64 libngtcp2-16 amd64 1.11.0-1+deb13u1","http://security.debian.org/debian-security/pool/updates/main/n/ngtcp2/libngtcp2-16_1.11.0-1%2bdeb13u1_amd64.deb",6],["http://deb.debian.org/debian trixie/main amd64 libngtcp2-crypto-gnutls8 amd64 1.11.0-1+deb13u1","http://security.debian.org/debian-security/pool/updates/main/n/ngtcp2/libngtcp2-crypto-gnutls8_1.11.0-1%2bdeb13u1_amd64.deb",7],["http://deb.debian.org/debian trixie/main amd64 libpsl5t64 amd64 0.21.2-1.1+b1","http://deb.debian.org/debian/pool/main/libp/libpsl/libpsl5t64_0.21.2-1.1%2bb1_amd64.deb",8],["http://deb.debian.org/debian trixie/main amd64 librtmp1 amd64 2.4+20151223.gitfa8646d.1-2+b5","http://deb.debian.org/debian/pool/main/r/rtmpdump/librtmp1_2.4%2b20151223.gitfa8646d.1-2%2bb5_amd64.deb",9],["http://deb.debian.org/debian trixie/main amd64 libssh2-1t64 amd64 1.11.1-1+deb13u2","http://deb.debian.org/debian/pool/main/libs/libssh2/libssh2-1t64_1.11.1-1%2bdeb13u2_amd64.deb",10],["http://deb.debian.org/debian trixie/main amd64 liberror-perl all 0.17030-1","http://deb.debian.org/debian/pool/main/libe/liberror-perl/liberror-perl_0.17030-1_all.deb",12],["http://deb.debian.org/debian trixie/main amd64 git-man all 1:2.47.3-0+deb13u1","http://deb.debian.org/debian/pool/main/g/git/git-man_2.47.3-0%2bdeb13u1_all.deb",13],["http://deb.debian.org/debian trixie/main amd64 git amd64 1:2.47.3-0+deb13u1","http://deb.debian.org/debian/pool/main/g/git/git_2.47.3-0%2bdeb13u1_amd64.deb",14],["http://deb.debian.org/debian trixie/main amd64 libldap-common all 2.6.10+dfsg-1","http://deb.debian.org/debian/pool/main/o/openldap/libldap-common_2.6.10%2bdfsg-1_all.deb",15],["http://deb.debian.org/debian trixie/main amd64 libsasl2-modules amd64 2.1.28+dfsg1-9","http://deb.debian.org/debian/pool/main/c/cyrus-sasl2/libsasl2-modules_2.1.28%2bdfsg1-9_amd64.deb",16],["http://deb.debian.org/debian trixie/main amd64 patch amd64 2.8-2","http://deb.debian.org/debian/pool/main/p/patch/patch_2.8-2_amd64.deb",17],["http://deb.debian.org/debian trixie/main amd64 publicsuffix all 20250328.1952-0.1","http://deb.debian.org/debian/pool/main/p/publicsuffix/publicsuffix_20250328.1952-0.1_all.deb",18]]},"htop":{"a":["Installing:","  htop","","Suggested packages:","  lm-sensors  lsof  strace"],"n":1,"dl":"171 kB","sp":"434 kB","deps":[],"sg":"lm-sensors lsof strace","f":[["http://deb.debian.org/debian trixie/main amd64 htop amd64 3.4.1-5","http://deb.debian.org/debian/pool/main/h/htop/htop_3.4.1-5_amd64.deb",0]]},"nano":{"a":["Installing:","  nano","","Suggested packages:","  hunspell"],"n":1,"dl":"645 kB","sp":"2907 kB","deps":[],"sg":"hunspell","f":[["http://deb.debian.org/debian trixie/main amd64 nano amd64 8.4-1","http://deb.debian.org/debian/pool/main/n/nano/nano_8.4-1_amd64.deb",0]]},"nginx":{"a":["Installing:","  nginx","","Installing dependencies:","  nginx-common","","Suggested packages:","  fcgiwrap  nginx-doc  ssl-cert"],"n":2,"dl":"725 kB","sp":"1906 kB","deps":["nginx-common"],"sg":"fcgiwrap nginx-doc ssl-cert","f":[["http://security.debian.org/debian-security trixie-security/main amd64 nginx-common all 1.26.3-3+deb13u10","http://security.debian.org/debian-security/pool/updates/main/n/nginx/nginx-common_1.26.3-3%2bdeb13u10_all.deb",0],["http://security.debian.org/debian-security trixie-security/main amd64 nginx amd64 1.26.3-3+deb13u7","http://security.debian.org/debian-security/pool/updates/main/n/nginx/nginx_1.26.3-3%2bdeb13u7_amd64.deb",1]]},"tmux":{"a":["Installing:","  tmux","","Installing dependencies:","  libevent-core-2.1-7t64  libjemalloc2"],"n":3,"dl":"897 kB","sp":"2448 kB","deps":["libevent-core-2.1-7t64","libjemalloc2"],"sg":"","f":[["http://security.debian.org/debian-security trixie-security/main amd64 libevent-core-2.1-7t64 amd64 2.1.13-stable-1~deb13u1","http://security.debian.org/debian-security/pool/updates/main/libe/libevent/libevent-core-2.1-7t64_2.1.13-stable-1%7edeb13u1_amd64.deb",0],["http://deb.debian.org/debian trixie/main amd64 libjemalloc2 amd64 5.3.0-3","http://deb.debian.org/debian/pool/main/j/jemalloc/libjemalloc2_5.3.0-3_amd64.deb",1],["http://deb.debian.org/debian trixie/main amd64 tmux amd64 3.5a-3","http://deb.debian.org/debian/pool/main/t/tmux/tmux_3.5a-3_amd64.deb",2]]}};
var ESSENTIAL=/^(base-files|bash|coreutils|grep|tar|util-linux)$/; /* Essential: yes, of those here */
/* What is installed is kept in the file tree, as dpkg keeps it: /var/lib/dpkg/info/NAME.list while the package is there, and
   NAME.postrm while what it leaves behind after a remove is (dpkg -l's rc), so what root removes stays removed after a reload,
   as root's other changes to the files do. PD, from trixie's apt and dpkg (apt-get -s, dpkg -L, apt-cache show, and a real
   remove and purge of each): [flags: m it has manual pages, s shared libraries, a Multi-Arch: same, r it leaves its configuration;
   its files; what goes with it (what depends on it); what it leaves unneeded (installed as a dependency); its pool folder; its .deb's size] */
var PD={"apt":["msr",366,[],[],"pool/updates/main/a/apt/",1453228],"base-files":["r",100,[],[],"pool/main/b/base-files/",88296],"bash":["mr",166,[],[],"pool/main/b/bash/",1500792],"cmatrix":["m",25,[],[],"pool/main/c/cmatrix/",33880],"coreutils":["ms",463,[],[],"pool/main/c/coreutils/",3023556],"cowsay":["m",68,[],[],"pool/main/c/cowsay/",21372],"cron":["mr",48,[],[],"pool/main/c/cron/",87416],"dbus":["r",33,[],[],"pool/main/d/dbus/",71632],"distro-info-data":["",11,["unattended-upgrades","python3-distro-info","python3-apt"],["libpython3-stdlib","libpython3.13-minimal","libpython3.13-stdlib","lsb-release","python-apt-common","python3","python3-dbus","python3-minimal","python3.13","python3.13-minimal"],"pool/main/d/distro-info-data/",6792],"fastfetch":["m",59,[],[],"pool/main/f/fastfetch/",542872],"fortune-mod":["m",26,[],[],"pool/main/f/fortune-mod/",38704],"fortunes-min":["",23,[],[],"pool/main/f/fortune-mod/",56456],"frotz":["m",27,[],["libao-common","libao4","libflac14","libmodplug1","libmp3lame0","libmpg123-0t64","libogg0","libopus0","libsamplerate0","libsndfile1","libvorbis0a","libvorbisenc2"],"pool/main/f/frotz/",114412],"grep":["m",163,[],[],"pool/main/g/grep/",431488],"iproute2":["mr",208,[],[],"pool/main/i/iproute2/",1089184],"less":["m",27,[],[],"pool/main/l/less/",161148],"libao-common":["mr",15,["frotz","libao4"],["libflac14","libmodplug1","libmp3lame0","libmpg123-0t64","libogg0","libopus0","libsamplerate0","libsndfile1","libvorbis0a","libvorbisenc2"],"pool/main/liba/libao/",7912],"libao4":["sa",19,["frotz"],["libao-common","libflac14","libmodplug1","libmp3lame0","libmpg123-0t64","libogg0","libopus0","libsamplerate0","libsndfile1","libvorbis0a","libvorbisenc2"],"pool/main/liba/libao/",33688],"libflac14":["sa",12,["frotz","libsndfile1"],["libao-common","libao4","libmodplug1","libmp3lame0","libmpg123-0t64","libogg0","libopus0","libsamplerate0","libvorbis0a","libvorbisenc2"],"pool/main/f/flac/",209588],"libmodplug1":["sa",16,["frotz"],["libao-common","libao4","libflac14","libmp3lame0","libmpg123-0t64","libogg0","libopus0","libsamplerate0","libsndfile1","libvorbis0a","libvorbisenc2"],"pool/main/libm/libmodplug/",162276],"libmp3lame0":["sa",13,["frotz","libsndfile1"],["libao-common","libao4","libflac14","libmodplug1","libmpg123-0t64","libogg0","libopus0","libsamplerate0","libvorbis0a","libvorbisenc2"],"pool/main/l/lame/",362660],"libmpg123-0t64":["sa",15,["frotz","libsndfile1"],["libao-common","libao4","libflac14","libmodplug1","libmp3lame0","libogg0","libopus0","libsamplerate0","libvorbis0a","libvorbisenc2"],"pool/main/m/mpg123/",149184],"libogg0":["sa",13,["frotz","libsndfile1","libflac14","libvorbisenc2","libvorbis0a"],["libao-common","libao4","libmodplug1","libmp3lame0","libmpg123-0t64","libopus0","libsamplerate0"],"pool/main/libo/libogg/",23812],"libopus0":["sa",11,["frotz","libsndfile1"],["libao-common","libao4","libflac14","libmodplug1","libmp3lame0","libmpg123-0t64","libogg0","libsamplerate0","libvorbis0a","libvorbisenc2"],"pool/main/o/opus/",2851932],"libpython3-stdlib":["a",8,["unattended-upgrades","python3-apt","python3-dbus","python3-distro-info","python3"],["distro-info-data","libpython3.13-minimal","libpython3.13-stdlib","lsb-release","python-apt-common","python3-minimal","python3.13","python3.13-minimal"],"pool/main/p/python3-defaults/",10180],"libpython3.13-minimal":["sar",322,["unattended-upgrades","python3-apt","python3-dbus","python3-distro-info","python3","libpython3-stdlib","python3.13","libpython3.13-stdlib","python3-minimal","python3.13-minimal"],["distro-info-data","lsb-release","python-apt-common"],"pool/main/p/python3.13/",863168],"libpython3.13-stdlib":["sa",411,["unattended-upgrades","python3-apt","python3-dbus","python3-distro-info","python3","libpython3-stdlib","python3.13"],["distro-info-data","libpython3.13-minimal","lsb-release","python-apt-common","python3-minimal","python3.13-minimal"],"pool/main/p/python3.13/",1958624],"librecode3":["sa",12,["fortune-mod"],[],"pool/main/r/recode/",234660],"libsamplerate0":["sa",13,["frotz"],["libao-common","libao4","libflac14","libmodplug1","libmp3lame0","libmpg123-0t64","libogg0","libopus0","libsndfile1","libvorbis0a","libvorbisenc2"],"pool/main/libs/libsamplerate/",950084],"libsndfile1":["sa",12,["frotz"],["libao-common","libao4","libflac14","libmodplug1","libmp3lame0","libmpg123-0t64","libogg0","libopus0","libsamplerate0","libvorbis0a","libvorbisenc2"],"pool/main/libs/libsndfile/",199172],"libvorbis0a":["sa",15,["frotz","libsndfile1","libvorbisenc2"],["libao-common","libao4","libflac14","libmodplug1","libmp3lame0","libmpg123-0t64","libogg0","libopus0","libsamplerate0"],"pool/main/libv/libvorbis/",89960],"libvorbisenc2":["sa",12,["frotz","libsndfile1"],["libao-common","libao4","libflac14","libmodplug1","libmp3lame0","libmpg123-0t64","libogg0","libopus0","libsamplerate0","libvorbis0a"],"pool/main/libv/libvorbis/",75432],"lsb-release":["m",12,["unattended-upgrades"],["distro-info-data","libpython3-stdlib","libpython3.13-minimal","libpython3.13-stdlib","python-apt-common","python3","python3-apt","python3-dbus","python3-distro-info","python3-minimal","python3.13","python3.13-minimal"],"pool/main/l/lsb-release-minimal/",5912],"man-db":["msr",537,[],[],"pool/main/m/man-db/",1469060],"nethack-common":["mr",58,["nethack-console"],[],"pool/main/n/nethack/",617724],"nethack-console":["mr",23,[],["nethack-common"],"pool/main/n/nethack/",1240800],"openssh-server":["msr",74,[],[],"pool/main/o/openssh/",602372],"procps":["mr",249,["openssh-server","unattended-upgrades","ucf"],["distro-info-data","libpython3-stdlib","libpython3.13-minimal","libpython3.13-stdlib","lsb-release","python-apt-common","python3","python3-apt","python3-dbus","python3-distro-info","python3-minimal","python3.13","python3.13-minimal"],"pool/main/p/procps/",882088],"python-apt-common":["",173,["unattended-upgrades","python3-apt"],["distro-info-data","libpython3-stdlib","libpython3.13-minimal","libpython3.13-stdlib","lsb-release","python3","python3-dbus","python3-distro-info","python3-minimal","python3.13","python3.13-minimal"],"pool/main/p/python-apt/",68248],"python3":["mr",35,["unattended-upgrades","python3-apt","python3-dbus","python3-distro-info"],["distro-info-data","libpython3-stdlib","libpython3.13-minimal","libpython3.13-stdlib","lsb-release","python-apt-common","python3-minimal","python3.13","python3.13-minimal"],"pool/main/p/python3-defaults/",28244],"python3-apt":["s",41,["unattended-upgrades"],["distro-info-data","libpython3-stdlib","libpython3.13-minimal","libpython3.13-stdlib","lsb-release","python-apt-common","python3","python3-dbus","python3-distro-info","python3-minimal","python3.13","python3.13-minimal"],"pool/main/p/python-apt/",164280],"python3-dbus":["s",41,["unattended-upgrades"],["distro-info-data","libpython3-stdlib","libpython3.13-minimal","libpython3.13-stdlib","lsb-release","python-apt-common","python3","python3-apt","python3-distro-info","python3-minimal","python3.13","python3.13-minimal"],"pool/main/d/dbus-python/",98424],"python3-distro-info":["",17,["unattended-upgrades"],["distro-info-data","libpython3-stdlib","libpython3.13-minimal","libpython3.13-stdlib","lsb-release","python-apt-common","python3","python3-apt","python3-dbus","python3-minimal","python3.13","python3.13-minimal"],"pool/main/d/distro-info/",7736],"python3-minimal":["m",28,["unattended-upgrades","python3-apt","python3-dbus","python3-distro-info","python3"],["distro-info-data","libpython3-stdlib","libpython3.13-minimal","libpython3.13-stdlib","lsb-release","python-apt-common","python3.13","python3.13-minimal"],"pool/main/p/python3-defaults/",27248],"python3.13":["m",34,["unattended-upgrades","python3-apt","python3-dbus","python3-distro-info","python3"],["distro-info-data","libpython3-stdlib","libpython3.13-minimal","libpython3.13-stdlib","lsb-release","python-apt-common","python3-minimal","python3.13-minimal"],"pool/main/p/python3.13/",757492],"python3.13-minimal":["mr",21,["unattended-upgrades","python3-apt","python3-dbus","python3-distro-info","python3","python3-minimal","python3.13"],["distro-info-data","libpython3-stdlib","libpython3.13-minimal","libpython3.13-stdlib","lsb-release","python-apt-common"],"pool/main/p/python3.13/",2224552],"sl":["m",33,[],[],"pool/main/s/sl/",13172],"sudo":["msr",249,[],[],"pool/main/s/sudo/",2086456],"systemd":["msr",1051,[],[],"pool/main/s/systemd/",3093632],"tar":["m",148,[],[],"pool/main/t/tar/",814968],"ucf":["mr",33,["openssh-server","unattended-upgrades"],["distro-info-data","libpython3-stdlib","libpython3.13-minimal","libpython3.13-stdlib","lsb-release","python-apt-common","python3","python3-apt","python3-dbus","python3-distro-info","python3-minimal","python3.13","python3.13-minimal"],"pool/main/u/ucf/",43296],"unattended-upgrades":["mr",100,[],["distro-info-data","libpython3-stdlib","libpython3.13-minimal","libpython3.13-stdlib","lsb-release","python-apt-common","python3","python3-apt","python3-dbus","python3-distro-info","python3-minimal","python3.13","python3.13-minimal"],"pool/main/u/unattended-upgrades/",66912],"util-linux":["mr",295,[],[],"pool/main/u/util-linux/",1242392],"vim-tiny":["r",26,[],[],"pool/updates/main/v/vim/",776152]};
var DEPS={"systemd":["openssh-server depends on systemd | systemd-standalone-sysusers | systemd-sysusers; however:", "  Package systemd is to be removed.", "  Package systemd-standalone-sysusers is not installed.", "  Package systemd-sysusers is not installed.", "  Package systemd which provides systemd-sysusers is to be removed.", "cron-daemon-common depends on systemd | systemd-standalone-sysusers | systemd-sysusers; however:", "  Package systemd is to be removed.", "  Package systemd-standalone-sysusers is not installed.", "  Package systemd-sysusers is not installed.", "  Package systemd which provides systemd-sysusers is to be removed.", "openssh-server depends on systemd | systemd-standalone-sysusers | systemd-sysusers; however:", "  Package systemd is to be removed.", "  Package systemd-standalone-sysusers is not installed.", "  Package systemd-sysusers is not installed.", "  Package systemd which provides systemd-sysusers is to be removed.", "cron-daemon-common depends on systemd | systemd-standalone-sysusers | systemd-sysusers; however:", "  Package systemd is to be removed.", "  Package systemd-standalone-sysusers is not installed.", "  Package systemd-sysusers is not installed.", "  Package systemd which provides systemd-sysusers is to be removed."],"python3":["unattended-upgrades depends on python3.","python3-distro-info depends on python3:any.","python3-dbus depends on python3 (<< 3.14).","python3-dbus depends on python3 (>= 3.13~).","python3-dbus depends on python3:any.","python3-dbus depends on python3 (<< 3.14).","python3-dbus depends on python3 (>= 3.13~).","python3-dbus depends on python3:any.","python3-dbus depends on python3 (<< 3.14).","python3-dbus depends on python3 (>= 3.13~).","python3-dbus depends on python3:any.","python3-apt depends on python3 (<< 3.14).","python3-apt depends on python3 (>= 3.13~).","python3-apt depends on python3:any.","python3-apt depends on python3 (<< 3.14).","python3-apt depends on python3 (>= 3.13~).","python3-apt depends on python3:any.","python3-apt depends on python3 (<< 3.14).","python3-apt depends on python3 (>= 3.13~).","python3-apt depends on python3:any."],"python3-minimal":["python3 depends on python3-minimal (= 3.13.5-1)."],"python3.13":["python3 depends on python3.13 (>= 3.13.5-1~)."],"python3.13-minimal":["python3.13 depends on python3.13-minimal (= 3.13.5-2+deb13u5).","python3-minimal depends on python3.13-minimal (>= 3.13.5-1~)."],"libpython3.13-minimal":["python3.13-minimal depends on libpython3.13-minimal (= 3.13.5-2+deb13u5).","libpython3.13-stdlib:amd64 depends on libpython3.13-minimal (= 3.13.5-2+deb13u5)."],"libpython3.13-stdlib":["python3.13 depends on libpython3.13-stdlib (= 3.13.5-2+deb13u5).","libpython3-stdlib:amd64 depends on libpython3.13-stdlib (>= 3.13.5-1~)."],"libpython3-stdlib":["python3 depends on libpython3-stdlib (= 3.13.5-1)."],"python3-apt":["unattended-upgrades depends on python3-apt (>= 1.9.6~)."],"python-apt-common":["python3-apt depends on python-apt-common."],"python3-dbus":["unattended-upgrades depends on python3-dbus."],"python3-distro-info":["unattended-upgrades depends on python3-distro-info."],"distro-info-data":["python3-distro-info depends on distro-info-data (>= 0.46).","python3-apt depends on distro-info-data."],"lsb-release":["unattended-upgrades depends on lsb-release."],"ucf":["unattended-upgrades depends on ucf.","openssh-server depends on ucf."],"procps":["ucf depends on procps.","openssh-server depends on procps."],"libao4":["frotz depends on libao4 (>= 1.1.0)."],"libao-common":["libao4:amd64 depends on libao-common."],"libogg0":["libvorbis0a:amd64 depends on libogg0 (>= 1.1.0).","libsndfile1:amd64 depends on libogg0 (>= 1.3.0).","libflac14:amd64 depends on libogg0 (>= 1.1.0)."],"nethack-common":["nethack-console depends on nethack-common (= 3.6.7-1+b2)."],"librecode3":["fortune-mod depends on librecode3 (>= 3.7)."],"libflac14":["libsndfile1:amd64 depends on libflac14 (>= 1.5.0)."],"libmp3lame0":["libsndfile1:amd64 depends on libmp3lame0 (>= 3.100)."],"libmpg123-0t64":["libsndfile1:amd64 depends on libmpg123-0t64 (>= 1.28.0)."],"libopus0":["libsndfile1:amd64 depends on libopus0 (>= 1.1)."],"libsamplerate0":["frotz depends on libsamplerate0 (>= 0.1.7)."],"libsndfile1":["frotz depends on libsndfile1 (>= 1.0.20)."],"libvorbis0a":["libvorbisenc2:amd64 depends on libvorbis0a (= 1.3.7-3).","libsndfile1:amd64 depends on libvorbis0a (>= 1.2.3)."],"libvorbisenc2":["libsndfile1:amd64 depends on libvorbisenc2 (>= 1.1.2)."],"libmodplug1":["frotz depends on libmodplug1 (>= 1:0.8.8.5)."]}; /* what dpkg -r says depends on each */
var INFO='/var/lib/dpkg/info/',DB0=34852; /* the files dpkg knows of, with everything here installed */
/* the program files each package brings that this terminal has, and the commands they are; vi, view, ex and nethack are alternatives */
var BINS={'cowsay':['/usr/games/cowsay','/usr/games/cowthink'],'cmatrix':['/usr/bin/cmatrix'],'cron':['/usr/bin/crontab','/usr/sbin/cron'],'fortune-mod':['/usr/games/fortune'],
  'frotz':['/usr/games/frotz'],'iproute2':['/usr/bin/ip','/usr/bin/ss'],'less':['/usr/bin/less'],'man-db':['/usr/bin/man','/usr/bin/apropos','/usr/bin/whatis'],'nethack-console':['/usr/games/nethack'],
  'fastfetch':['/usr/bin/fastfetch'],'openssh-server':['/usr/sbin/sshd'],'procps':['/usr/bin/free','/usr/bin/pgrep','/usr/bin/pkill','/usr/bin/ps','/usr/bin/top','/usr/bin/uptime','/usr/bin/w','/usr/bin/watch'],
  'sl':['/usr/games/sl'],'sudo':['/usr/bin/sudo','/usr/bin/sudoedit','/usr/sbin/visudo'],'unattended-upgrades':['/usr/bin/unattended-upgrade'],'vim-tiny':['/usr/bin/vi','/usr/bin/view','/usr/bin/ex','/usr/bin/vim.tiny'],
  'python3-minimal':['/usr/bin/python3'],'python3.13-minimal':['/usr/bin/python3.13'],'lsb-release':['/usr/bin/lsb_release'],'apt':['/usr/bin/apt','/usr/bin/apt-get','/usr/bin/apt-cache']};
function installed(p){var e=typeof p==='string'?pkg(p):p;return !!e&&PKGS.indexOf(e)>=0&&!!P.find(INFO+e[0]+'.list',true)}
function residual(p){var e=typeof p==='string'?pkg(p):p;return !!e&&PKGS.indexOf(e)>=0&&!installed(e)&&!!P.find(INFO+e[0]+'.postrm',true)}
var RECORDED=false;
P.setup(function(){ /* dpkg's own record of each package installed */
  RECORDED=true;
  PKGS.forEach(function(p){
    P.sys(INFO+p[0]+'.list','f',{body:['/.'].concat(BINS[p[0]]||[],['/usr/share/doc/'+p[0]])});
    if(/r/.test((PD[p[0]]||[''])[0]))P.sys(INFO+p[0]+'.postrm','f',{mode:'-rwxr-xr-x',body:['#!/bin/sh','set -e','# Automatically added by dh_installdeb','dpkg-maintscript-helper rm_conffile -- "$@"','# End automatically added section']});
  });
});
var DROPPED={};
function pkgSync(){ /* the commands of what has been removed are gone, this time and after a reload */
  if(!RECORDED)return; /* a prompt before the records are made */
  PKGS.forEach(function(p){
    if(DROPPED[p[0]]||installed(p))return;
    DROPPED[p[0]]=true;
    (BINS[p[0]]||[]).forEach(function(f){
      var b=f.split('/').pop();
      if(P.find(f,true))delete P.find(P.dirOf(f),true).kids[b];
      if(P.has(P.paths,b)&&P.paths[b]+'/'+b===f){delete P.cmds[b];delete P.paths[b];delete P.man[b]}
    });
  });
}
function dbCount(){return PKGS.reduce(function(n,p){return n-(installed(p)?0:(PD[p[0]]||[0,0])[1])},DB0)}
function verCmp(a,b){ /* dpkg's version order: epoch, then upstream and revision, ~ before everything */
  function split(v){var m=/^(?:(\d+):)?(.*?)(?:-([^-]*))?$/.exec(v);return [+(m[1]||0),m[2],m[3]||'']}
  function ord(c){return c==='~'?-1:!c?0:/[a-z]/i.test(c)?c.charCodeAt(0):c.charCodeAt(0)+256}
  function part(x,y){
    var i=0,j=0;
    while(i<x.length||j<y.length){
      var d=0;
      while(i<x.length&&!/\d/.test(x[i])||j<y.length&&!/\d/.test(y[j])){
        var ac=i<x.length&&!/\d/.test(x[i])?x[i]:'',bc=j<y.length&&!/\d/.test(y[j])?y[j]:'';
        if(ord(ac)!==ord(bc))return ord(ac)-ord(bc);
        i++;j++;
      }
      var na='',nb='';
      while(i<x.length&&/\d/.test(x[i]))na+=x[i++];
      while(j<y.length&&/\d/.test(y[j]))nb+=y[j++];
      d=(+na||0)-(+nb||0);
      if(d)return d;
    }
    return 0;
  }
  var A=split(a),B=split(b);
  return A[0]-B[0]||part(A[1],B[1])||part(A[2],B[2]);
}
function fetchOf(n){ /* where apt would fetch a package's .deb from: [what Ign: and Err: name, its URL] */
  var p=pkg(n),d=PD[n],arch=ALL.test(n)?'all':'amd64',sec=/^pool\/updates\//.test(d[4]),v=p[1].replace(/^\d+:/,'');
  return [(sec?'http://security.debian.org/debian-security trixie-security':'http://deb.debian.org/debian trixie')+'/main amd64 '+n+' '+arch+' '+p[1],
    (sec?'http://security.debian.org/debian-security/':'http://deb.debian.org/debian/')+d[4]+n+'_'+v.replace(/\+/g,'%2b').replace(/~/g,'%7e')+'_'+arch+'.deb'];
}
function aptCols(L){ /* apt's lists: in columns, read down, as many as fit in 80, two spaces in and between */
  for(var c=L.length;c>1;c--){
    var r=Math.ceil(L.length/c),W=[];
    for(var k=0;k<c;k++)W.push(L.slice(k*r,k*r+r).reduce(function(m,x){return Math.max(m,x.length)},0));
    if(W.filter(Boolean).length<c)continue;
    if(2+W.reduce(function(s,w){return s+w},0)+2*(c-1)<80)break;
  }
  var rows=Math.ceil(L.length/Math.max(c,1)),R=[];
  for(var i=0;i<rows;i++){var l='  ';for(var k2=0;k2<Math.max(c,1);k2++){var x=L[k2*rows+i];if(x===undefined)continue;l+=k2*rows+i+rows<L.length&&k2<c-1?x.padEnd(W[k2]+2):x}R.push(l.replace(/\s+$/,''))}
  return R;
}
function orphans(){ /* what was installed as a dependency of something removed since, and is needed by nothing left */
  var O=[];
  PKGS.forEach(function(p){if(!installed(p)&&PD[p[0]])PD[p[0]][3].forEach(function(x){if(installed(x)&&pkg(x)[4]&&O.indexOf(x)<0)O.push(x)})});
  return O.sort();
}
function removal(verb,names,o,get,E,reading){ /* apt remove, purge and autoremove as root: what goes, the question, then dpkg's removal */
  var purge=verb==='purge'||!!o.L.purge,auto=verb==='autoremove',L=reading.slice(),gone=[];
  if(!auto)names.forEach(function(n){if(!installed(n)&&!(purge&&residual(n)))L.push("Package '"+n+"' is not installed, so not removed")});
  var want=auto?orphans():names.filter(function(n){return installed(n)||purge&&residual(n)});
  want.forEach(function(n){if(gone.indexOf(n)<0)gone.push(n);if(installed(n))PD[n][2].forEach(function(x){if(installed(x)&&gone.indexOf(x)<0)gone.splice(gone.indexOf(n),0,x)})});
  /* dpkg takes what depends on a package before the package */
  var left=auto?[]:orphans().concat(gone.reduce(function(a,n){return a.concat(PD[n][3])},[])).filter(function(x,i,A){return A.indexOf(x)===i&&installed(x)&&pkg(x)[4]&&gone.indexOf(x)<0}).sort();
  if(left.length){
    var one=left.length===1;
    L.push(one?'The following package was automatically installed and is no longer required:':'The following packages were automatically installed and are no longer required:');
    L=L.concat(get===true?wrap(left):aptCols(left),["Use 'apt autoremove' to remove "+(one?'it':'them')+'.']);
    if(get!==true)L.push('');
  }
  var none=get===true?['0 upgraded, 0 newly installed, 0 to remove and 0 not upgraded.']:['Summary:','  Upgrading: 0, Installing: 0, Removing: 0, Not Upgrading: 0'];
  if(!gone.length){lines(L.concat(none));return}
  var shown=gone.slice().sort().map(function(n){return n+(purge?'*':'')}),ess=gone.filter(function(n){return ESSENTIAL.test(n)||n==='apt'}).sort();
  var sd=gone.indexOf('systemd')>=0&&installed('systemd'); /* without systemd, what openssh-server and cron need of it comes from systemd-standalone-sysusers, which has to be fetched */
  var freed=aptSize(gone.reduce(function(s,n){return s+(installed(n)?(pkg(n)[3]||0)*1024:0)},sd?-340*1024:0));
  if(get===true){
    if(sd)L=L.concat(['The following additional packages will be installed:','  systemd-standalone-sysusers','Suggested packages:','  libcryptsetup12 libidn2-0 libtss2-rc0t64']);
    L=L.concat(['The following packages will be REMOVED:'],wrap(shown),sd?['The following NEW packages will be installed:','  systemd-standalone-sysusers']:[]);
  }
  else L=L.concat(sd?['Installing dependencies:','  systemd-standalone-sysusers','','Suggested packages:','  libcryptsetup12  libidn2-0  libtss2-rc0t64','']:[],['REMOVING:'],aptCols(shown),['']);
  if(ess.length)L=L.concat(['WARNING: The following essential packages will be removed.','This should NOT be done unless you know exactly what you are doing!'],get===true?wrap(ess):aptCols(ess),get===true?[]:['']);
  if(get===true)L=L.concat(['0 upgraded, '+(sd?1:0)+' newly installed, '+gone.length+' to remove and 0 not upgraded.'],sd?['Need to get 171 kB of archives.']:[],['After this operation, '+freed+' disk space will be freed.']);
  else L=L.concat(['Summary:','  Upgrading: 0, Installing: '+(sd?1:0)+', Removing: '+gone.length+', Not Upgrading: 0'],sd?['  Download size: 171 kB']:[],['  Freed space: '+freed,'']);
  lines(L);
  if(ess.length){err(E+'Removing essential system-critical packages is not permitted. This might break the system.');P.queue(function(){P.status(100)});return}
  var go=sd?function(){offline([['http://deb.debian.org/debian trixie/main amd64 systemd-standalone-sysusers amd64 '+D.systemd,'http://deb.debian.org/debian/pool/main/s/systemd/systemd-standalone-sysusers_'+D.systemd.replace(/~/g,'%7e')+'_amd64.deb',0]],'Failed to fetch',E);
    err(E+'Unable to fetch some archives, maybe run apt-get update or try with --fix-missing?');P.queue(function(){P.status(100)})}:function(){dpkgRemove(gone,purge)};
  if(o.has('y','yes')||o.L['assume-yes']){go();return}
  P.ask(get===true?'Do you want to continue? [Y/n] ':'Continue? [Y/n] ',function(l){if(l===P.INT)return;if(l===null||l===''||/^y/i.test(l)){go();return}P.typeLine('Abort.');P.status(1)});
}
function dpkgRemove(gone,purge){ /* dpkg --remove (and --purge) of each in turn, then the triggers of what is left */
  var L=[],rm=gone.filter(function(n){return installed(n)}),man=false,so=false;
  if(rm.length){
    L.push('(Reading database ... '+dbCount()+' files and directories currently installed.)');
    rm.forEach(function(n){
      var d=PD[n],p=pkg(n);
      L.push('Removing '+n+(/a/.test(d[0])?':amd64':'')+' ('+p[1]+') ...');
      man=man||/m/.test(d[0]);so=so||/a/.test(d[0])||n==='apt'; /* ldconfig's trigger: a library */
      P.find(INFO+n+'.list',true)&&delete P.find(INFO,true).kids[n+'.list'];
    });
    pkgSync();
    if(man&&installed('man-db'))L.push('Processing triggers for man-db ('+pkg('man-db')[1]+') ...');
    if(so)L.push('Processing triggers for libc-bin (2.41-12+deb13u4) ...');
  }
  var pg=purge?gone.filter(function(n){return P.find(INFO+n+'.postrm',true)}):[];
  if(pg.length){
    L.push('(Reading database ... '+dbCount()+' files and directories currently installed.)');
    pg.forEach(function(n){L.push('Purging configuration files for '+n+(/a/.test(PD[n][0])?':amd64':'')+' ('+pkg(n)[1]+') ...');delete P.find(INFO,true).kids[n+'.postrm']});
  }
  lines(L);
}
function aptSize(b){ /* apt's SizeToStr: 1000s, one decimal under 100 */
  var x='kMGTP',i=-1;
  while(true){if(i>=0&&b<100)return b.toFixed(1)+' '+x.charAt(i)+'B';if(b<10000)return Math.round(b)+' '+(i<0?'':x.charAt(i))+'B';b/=1000;i++}
}
function offline(F,W,E,mid){ /* the fetch of each [name, URL]: Acquire::Retries tries each three times; then why, and apt's summary of what failed */
  var host=function(u){return u.replace(/^https?:\/\/([^\/]+).*$/,'$1')},why=function(u){return "Temporary failure resolving '"+host(u)+"'"},L=[];
  [1,-1,1].forEach(function(dir){F.forEach(function(f,i){var k=dir>0?i:F.length-1-i;L.push('Ign:'+(k+1)+' '+F[k][0])})});
  F.slice().reverse().forEach(function(f,i){L.push('Err:'+(F.length-i)+' '+f[0]);L.push('  '+why(f[1]))});
  lines(L.concat(mid||[]));
  F.slice().sort(function(x,y){return (x[2]||0)-(y[2]||0)}).forEach(function(f){err(E+W+' '+f[1]+'  '+why(f[1]))});
}
function wrap(words){ /* apt-get's lists: two spaces in, broken before 80 columns */
  var L=[],l='';words.forEach(function(w){if(l&&l.length+1+w.length>=80){L.push(l);l=''}l=(l?l+' ':'  ')+w});if(l)L.push(l);return L;
}
function rootApt(verb,o,get,E){ /* true if done: root on a box with no network (apt 3.0.4 and dpkg 1.22 on trixie, run so) */
  var names=o.ops.slice(1),reading=get===true?['Reading package lists... Done','Building dependency tree... Done','Reading state information... Done']:[];
  var none=get===true?'0 upgraded, 0 newly installed, 0 to remove and 0 not upgraded.':null,sum0=['Summary:','  Upgrading: 0, Installing: 0, Removing: 0, Not Upgrading: 0'];
  if(verb==='update'){ /* the lists stay as they were: a warning, and status 0 */
    var W=get===true?'W: ':'Warning: ';
    offline([['http://deb.debian.org/debian trixie InRelease','http://deb.debian.org/debian/dists/trixie/InRelease'],['http://deb.debian.org/debian trixie-updates InRelease','http://deb.debian.org/debian/dists/trixie-updates/InRelease'],
      ['http://security.debian.org/debian-security trixie-security InRelease','http://security.debian.org/debian-security/dists/trixie-security/InRelease']],'Failed to fetch',W,[get===true?'Reading package lists... Done':'All packages are up to date.']);
    err(W+'Some index files failed to download. They have been ignored, or old ones used instead.');
    P.queue(function(){P.status(0)});return true;
  }
  if(/^(upgrade|full-upgrade|dist-upgrade)$/.test(verb)||verb==='autoremove'&&!orphans().length){lines(get===true?reading.concat(/upgrade/.test(verb)?['Calculating upgrade... Done']:[],[none]):sum0);return true}
  if(verb==='source'||verb==='build-dep'){ /* no deb-src lines in debian.sources */
    if(!names.length){err(E+'Must specify at least one package to '+(verb==='source'?'fetch source for':'check builddeps for'));P.queue(function(){P.status(100)});return true}
    P.typeLine('Reading package lists... Done');err(E+"You must put some 'deb-src' URIs in your sources.list");P.queue(function(){P.status(100)});return true;
  }
  if(verb==='satisfy'){
    if(!names.length){err(E+'Must specify at least one package to check builddeps for');P.queue(function(){P.status(100)});return true}
    if(get===true)lines(reading);
    var need=[],why=null;
    o.ops.slice(1).join(', ').split(',').map(function(c){return c.trim()}).filter(Boolean).forEach(function(c){
      var alts=c.split('|').map(function(x){var m=/^\s*([a-z0-9][a-z0-9+.-]*)(?::any)?\s*(?:\(\s*(<<|<=|=|>=|>>|<|>)\s*([^)\s]+)\s*\))?\s*$/.exec(x);return m?{n:m[1],op:m[2],v:m[3]}:null});
      function ok(a,p){if(!a.op)return true;var d=verCmp(p[1],a.v);return {'<<':d<0,'<':d<=0,'<=':d<=0,'=':d===0,'>=':d>=0,'>':d>=0,'>>':d>0}[a.op]}
      if(alts.some(function(a){return a&&installed(a.n)&&ok(a,pkg(a.n))}))return;
      var can=alts.filter(function(a){return a&&pkg(a.n)&&!installed(a.n)&&ok(a,pkg(a.n))})[0];
      if(can){if(need.indexOf(can.n)<0)need.push(can.n);return}
      if(why)return;
      var a=alts[0]||{n:c},p=pkg(a.n),op=a.op==='<<'?'<':a.op==='>>'?'>':a.op;
      why=a.n+(a.op?' ('+op+' '+a.v+')':'')+' but '+(!p?'it is not installable':installed(p)?p[1]+' is to be installed':'it is not going to be installed');
    });
    if(why){
      lines(['Some packages could not be installed. This may mean that you have','requested an impossible situation or if you are using the unstable','distribution that some required packages have not yet been created','or been moved out of Incoming.','The following information may help to resolve the situation:','']);
      lines([get===true?'The following packages have unmet dependencies:':'Unsatisfied dependencies:',' satisfy:command-line : Depends: '+why]);
      err(E+'Unable to correct problems, you have held broken packages.');P.queue(function(){P.status(100)});return true;
    }
    if(!need.length){lines(get===true?[none]:sum0);return true}
    o.ops=['install'].concat(need);names=need;verb='install';reading=[];o.satisfy=true;
  }
  if(verb==='modernize-sources'&&get!==true){P.typeLine('All sources are modern.');return true} /* debian.sources is deb822 already, and there is no sources.list */
  if(verb==='edit-sources'&&get!==true){ /* sensible-editor on sources.list (or a file in sources.list.d): an empty new one is removed again */
    var sl=names.length?'/etc/apt/sources.list.d/'+names[0]:'/etc/apt/sources.list',ex=P.find(sl,true),before=ex?P.text(ex).join('\n'):null;
    if(!ex)P.sys(sl,'f',{body:[],date:P.now()});
    P.exec('vi '+sl);
    P.queue(function(){
      var n=P.find(sl,true);
      if(!n)return;
      var t=P.text(n).join('\n');
      if(before===null&&!t)delete P.find(P.dirOf(sl),true).kids[sl.split('/').pop()];
      else if(before!==null&&t!==before)P.typeLine("Your '"+sl+"' file changed, please run 'apt-get update'.");
    });
    return true;
  }
  if(verb==='reinstall'&&names.every(function(n){return installed(n)})){ /* the same version again: it has to be fetched */
    if(get===true)lines(reading);
    if(!names.length){lines(get===true?[none]:sum0);return true}
    var R=names.filter(function(n,i){return names.indexOf(n)===i}),G=R.map(function(n,i){var x=fetchOf(n);return [x[0],x[1],i]}),dls=aptSize(R.reduce(function(s,n){return s+PD[n][5]},0));
    var rt=DISKS.filter(function(d){return d[3]==='/'})[0],av=aptSize((rt[1]-rt[2]-1048576)*1024);
    lines(get===true?['0 upgraded, 0 newly installed, '+R.length+' reinstalled, 0 to remove and 0 not upgraded.','Need to get '+dls+' of archives.','After this operation, 0 B of additional disk space will be used.']:
      ['Summary:','  Upgrading: 0, Installing: 0, Reinstalling: '+R.length+', Removing: 0, Not Upgrading: 0','  Download size: '+dls,'  Space needed: 0 B / '+av+' available','']);
    offline(G,'Failed to fetch',E);err(E+'Unable to fetch some archives, maybe run apt-get update or try with --fix-missing?');P.queue(function(){P.status(100)});
    return true;
  }
  if(verb==='reinstall')verb='install'; /* what is not installed is installed */
  if(verb==='remove'||verb==='purge'||verb==='autoremove'){
    var unk=names.filter(function(n){return !pkg(n)})[0];
    if(get===true||verb==='autoremove')lines(reading);
    if(unk!==undefined){err(E+'Unable to locate package '+unk);P.queue(function(){P.status(100)});return true}
    removal(verb,names,o,get,E,[]);
    return true;
  }
  if(/^(clean|autoclean)$/.test(verb))return true;
  if(verb==='install'){
    var bad=names.filter(function(n){return !pkg(n)})[0];
    if(get===true)lines(reading);
    if(bad!==undefined){err(E+'Unable to locate package '+bad);P.queue(function(){P.status(100)});return true}
    var L=[],want=[];
    names.forEach(function(n){var p=pkg(n);if(installed(p)){L.push(n+' is already the newest version ('+p[1]+').');if(p[4]&&!o.satisfy)L.push(n+' set to manually installed.')}else if(want.indexOf(n)<0)want.push(n)});
    var X=want.map(function(n){ /* one removed here is fetched again, by itself */
      if(AVX[n])return AVX[n];
      var p=pkg(n),x=fetchOf(n);
      return {a:['Installing:','  '+n],n:1,dl:aptSize(PD[n][5]),sp:aptSize((p[3]||0)*1024),deps:[],sg:'',f:[[x[0],x[1],0]]};
    }).filter(Boolean);
    if(!X.length){lines(L.concat(none?[none]:sum0));return true}
    var deps=[],F=[],sg=[],seen={},n=0;
    X.forEach(function(x){x.deps.forEach(function(d){if(deps.indexOf(d)<0&&want.indexOf(d)<0)deps.push(d)});x.f.forEach(function(f){if(!seen[f[1]]){seen[f[1]]=1;F.push(f)}});if(x.sg)sg.push(x.sg)});
    deps.sort();n=want.length+deps.length;
    var one=X.length===1?X[0]:null,dl=one?one.dl:'',sp=one?one.sp:''; /* sizes are known for one package at a time */
    var root=DISKS.filter(function(d){return d[3]==='/'})[0],avail=aptSize((root[1]-root[2]-1048576)*1024);
    if(get===true){
      if(deps.length&&!o.satisfy)L=L.concat(['The following additional packages will be installed:'],wrap(deps));
      if(sg.length&&!o.satisfy)L=L.concat(['Suggested packages:'],wrap(sg.join(' ').replace(/ \| /g,'\u0001').split(' ').map(function(w){return w.replace(/\u0001/g,' | ')})));
      L=L.concat(['The following NEW packages will be installed:'],wrap(want.concat(deps).sort()),['0 upgraded, '+n+' newly installed, 0 to remove and 0 not upgraded.']);
      if(one)L.push('Need to get '+dl+' of archives.','After this operation, '+sp+' of additional disk space will be used.');
    }
    else{
      L=L.concat(one?one.a:['Installing:'].concat(wrap(want)),['','Summary:','  Upgrading: 0, Installing: '+n+', Removing: 0, Not Upgrading: 0']);
      if(one)L.push('  Download size: '+dl,'  Space needed: '+sp+' / '+avail+' available');
      L.push('');
    }
    lines(L);
    var go=function(){offline(F,'Failed to fetch',E);err(E+'Unable to fetch some archives, maybe run apt-get update or try with --fix-missing?');P.queue(function(){P.status(100)})};
    if(n===want.length||o.has('y','yes')||o.L['assume-yes']){go();return true} /* nothing more than was asked for: no question */
    P.ask(get===true?'Do you want to continue? [Y/n] ':'Continue? [Y/n] ',function(l){if(l===P.INT)return;if(l===null||l===''||/^y/i.test(l)){go();return}P.typeLine('Abort.');P.status(1)});
    return true;
  }
  return false;
}
var NEED_ROOT=/^(install|remove|purge|upgrade|full-upgrade|dist-upgrade|autoremove|autoclean|clean|reinstall|satisfy|build-dep)$/;
function apt(a,get){
  var o=opts(a),verb=o.ops[0]||'',E=get?'E: ':'Error: ',CONF=['Configuration options and syntax is detailed in apt.conf(5).','Information about how to configure sources can be found in sources.list(5).','Package and version choices can be expressed via apt_preferences(5).','Security details are available in apt-secure(8).'];
  if(o.has('v','version')){ /* ShowCommonHelp: the version, and for apt and apt-cache nothing more; apt-get adds the modules it was built with */
    P.typeLine('apt 3.0.4 (amd64)');
    if(get===true)P.say(['Supported modules:','*Ver: Standard .deb','*Pkg:  Debian dpkg interface (Priority 30)',' Pkg:  Debian APT solver interface (Priority -1000)',' Pkg:  Debian APT planner interface (Priority -1000)',
      " S.L: 'deb' Debian binary tree"," S.L: 'deb-src' Debian source tree",' Idx: Debian Source Index',' Idx: Debian Package Index',' Idx: Debian Translation Index',' Idx: Debian dpkg status file',
      ' Idx: Debian deb file',' Idx: Debian dsc file',' Idx: Debian control file',' Idx: EDSP scenario file',' Idx: EIPP scenario file']);
    return;
  }

  if(get===2&&!verb){ /* apt-cache's ShowHelp, and its commands that have a help line; then exit 1 */
    P.say(['apt 3.0.4 (amd64)','Usage: apt-cache [options] command','       apt-cache [options] show pkg1 [pkg2 ...]','','apt-cache queries and displays available information about installed','and installable packages. It works exclusively on the data acquired',
      "into the local cache via the 'update' command of e.g. apt-get. The",'displayed information may therefore be outdated if the last update was','too long ago, but in exchange apt-cache works independently of the','availability of the configured sources (e.g. offline).','',
      'Most used commands:','  showsrc - Show source records','  search - Search the package list for a regex pattern','  depends - Show raw dependency information for a package','  rdepends - Show reverse dependency information for a package',
      '  show - Show a readable record for the package','  pkgnames - List the names of all packages in the system','  policy - Show policy settings','','See apt-cache(8) for more information about the available commands.'].concat(CONF));
    P.status(1);return;
  }
  if(!verb){
    if(get){P.say(['apt 3.0.4 (amd64)','Usage: apt-get [options] command','       apt-get [options] install|remove pkg1 [pkg2 ...]','','Most used commands:','  update - Retrieve new lists of packages','  upgrade - Perform an upgrade','  install - Install new packages (pkg is libc6 not libc6.deb)','  remove - Remove packages','','See apt-get(8) for more information about the available commands.'].concat(CONF,['                                        This APT has Super Cow Powers.']));P.status(1);return}
    P.say(['apt 3.0.4 (amd64)','Usage: apt [options] command','','Most used commands:','  list - list packages based on package names','  search - search in package descriptions','  show - show package details','  install - install packages','  remove - remove packages','  update - update list of available packages','  upgrade - upgrade the system by installing/upgrading packages','','See apt(8) for more information about the available commands.'].concat(CONF,['                                        This APT has Super Cow Powers.']));
    P.status(1);return;
  }
  pkgSync();
  if(get===true&&/^(edit|modernize)-sources$/.test(verb)){err(E+'Invalid operation '+verb);P.queue(function(){P.status(100)});return} /* apt's alone */
  if(P.st.user==='root'&&get!==2&&rootApt(verb,o,get,E))return;
  if(get!==2&&(verb==='source'||verb==='modernize-sources')&&rootApt(verb,o,get,E))return; /* neither needs root */
  if(!get&&verb==='edit-sources'){err(E+'Could not open file /etc/apt/sources.list - open (13: Permission denied)');P.queue(function(){P.status(100)});return}
  if(verb==='update'){
    P.typeLine('Reading package lists...'); /* the lock fails before it gets to Done */
    err(E+'Could not open lock file /var/lib/apt/lists/lock - open (13: Permission denied)');err(E+'Unable to lock directory /var/lib/apt/lists/');P.queue(function(){P.status(100)});return;
  }
  if(NEED_ROOT.test(verb)){
    err(E+'Could not open lock file /var/lib/dpkg/lock-frontend - open (13: Permission denied)');
    err(E+'Unable to acquire the dpkg frontend lock (/var/lib/dpkg/lock-frontend), are you root?');
    P.queue(function(){P.status(100)});return;
  }
  if(!get&&verb==='list'){
    var inst=!!o.L.installed||!!o.L.upgradable,L=o.L.upgradable?[]:inst?PKGS.filter(installed):PKGS.concat(AVAIL).sort(),pat=o.ops[1]?P.globRe(o.ops[1]):null;
    P.typeLine('Listing... Done');
    lines(L.filter(function(p){return !pat||pat.test(p[0])}).map(entry));
    return;
  }
  if(verb==='search'&&get!==true){
    var q=(o.ops[1]||'').toLowerCase();
    if(!q){err(E+'You must give at least one search pattern');P.queue(function(){P.status(100)});return}
    if(get!==2)lines(['Sorting... Done','Full Text Search... Done']);
    PKGS.concat(AVAIL).sort().filter(function(p){return (p[0]+' '+p[2]).toLowerCase().indexOf(q)>=0}).forEach(function(p){
      if(get===2)P.typeLine(p[0]+' - '+p[2]);
      else{P.typeLine(entry(p));P.typeLine('  '+p[2]);P.typeLine('')}
    });
    return;
  }
  if((!get||get===2)&&(verb==='show'||verb==='policy')){
    o.ops.slice(1).forEach(function(n){
      var p=pkg(n),i=p&&installed(p);
      if(!p){err(E+'No packages found');P.queue(function(){P.status(100)});return}
      if(verb==='policy'){lines([n+':','  Installed: '+(i?p[1]:'(none)'),'  Candidate: '+p[1],'  Version table:',' '+(i?'***':'   ')+' '+p[1]+' 500','        500 http://deb.debian.org/debian trixie/main amd64 Packages'].concat(i?['        100 /var/lib/dpkg/status']:[]));return}
      lines(['Package: '+p[0],'Version: '+p[1],'Priority: optional','Section: '+(/game|cow|fortune|frotz|^sl$|nethack|matrix/.test(p[0])?'games':/^lib/.test(p[0])?'libs':'admin'),'Installed-Size: '+(p[3]||120+p[0].length*37).toLocaleString('en-US')+' kB',
        'APT-Sources: http://deb.debian.org/debian trixie/main amd64 Packages'].concat(i?['APT-Manual-Installed: '+(p[4]?'no':'yes')]:[]).concat(['Description: '+p[2],'']));
    });
    return;
  }
  err(E+'Invalid operation '+verb);P.queue(function(){P.status(100)});
}
cmd('apt','/usr/bin','command-line interface','apt [-h] [-o=config_string] [-c=config_file] [-t=target_release] [-a=architecture] {list | search | show | update | install pkg... | remove pkg... | upgrade | full-upgrade | edit-sources | {-v | --version} | {-h | --help}}',
  ['installs, removes and lists packages. listing and searching are for anyone; changing what is installed takes root.','',
  'list [--installed | --upgradable] [pattern]   list the packages whose names match the glob pattern: all of them, the ones installed, or the upgradable ones',
  'search word   search for the word in the names and descriptions of the packages',
  'show pkg...   show information about the given packages',
  'policy [pkg...]   show the installed and candidate versions of the packages, and where they come from',
  'update, upgrade, full-upgrade, dist-upgrade, install, reinstall, remove, purge, autoremove, satisfy, autoclean, clean, build-dep   change the system or its package lists, and need root. this machine has no network: update keeps the lists it has, and install and reinstall cannot fetch a package',
  'remove pkg..., purge pkg...   remove the packages, and what depends on them; purge their configuration files too. autoremove then removes what was installed only for them. what root removes stays removed',
  'source pkg..., build-dep pkg...   need deb-src lines in the sources, which this machine does not have',
  'satisfy dependency...   install what the dependency strings ask for, such as "cowsay (>= 3)"',
  'edit-sources [file]   edit /etc/apt/sources.list (or the file in /etc/apt/sources.list.d) in the editor, as root',
  'modernize-sources   rewrite .list sources in the deb822 .sources format; here they are already',
  '-v, --version   print the version'],function(a){apt(a,false)});
cmd('apt-get','/usr/bin','APT package handling utility -- command-line interface','apt-get [options] {update | upgrade | dist-upgrade | full-upgrade | install pkg... | reinstall pkg... | remove pkg... | purge pkg... | source pkg... | build-dep pkg... | satisfy dependencies... | clean | autoclean | autoremove | ...}',['the older, steadier apt, for scripts. as apt, it needs root to change anything; source needs none, but this machine has no deb-src lines for it. edit-sources and modernize-sources are apt\'s alone.','',
  '-v, --version   show the program version, and the modules it supports'],function(a){apt(a,true)});
cmd('apt-cache','/usr/bin','query the APT cache','apt-cache [options] {search regex | show pkg... | policy [pkg...] | ...}',['asks the package lists what there is, without changing anything.'],function(a){apt(a,2)});
function dpkgUsage(why){ /* dpkg's badusage(): the error, then where to find help; status 2 */
  [ 'dpkg: error: '+why,'',"Type dpkg --help for help about installing and deinstalling packages [*];","Use 'apt' or 'aptitude' for user-friendly package management;",'Type dpkg -Dhelp for a list of dpkg debug flag values;',
    'Type dpkg --force-help for a list of forcing options;','Type dpkg-deb --help for help about manipulating *.deb files;','',"Options marked [*] produce a lot of output - pipe it through 'less' or 'more' !"].forEach(err);
  P.queue(function(){P.status(2)});
}
function rootDpkg(o){ /* dpkg 1.22 as root: -i of a file that is no package, -r and -P of what is not installed or is essential. True if done */
  var inst=o.has('i','install'),act=inst?'--install':o.has('r','remove')?'--remove':o.has('P','purge')?'--purge':null,failed=[];
  if(!act)return false;
  if(!o.ops.length){dpkgUsage(inst?'--install needs at least one package archive file argument':act+' (without --pending) needs at least one package name argument');return true}
  if(inst){
    for(var i=0;i<o.ops.length;i++){var n=P.find(o.ops[i]);if(!n||n.type==='d'){err(!n?"dpkg: error: cannot access archive '"+o.ops[i]+"': "+(P.shut(o.ops[i])?'Permission denied':'No such file or directory'):"dpkg: error: archive '"+o.ops[i]+"' is not a regular file");P.queue(function(){P.status(2)});return true}}
    o.ops.forEach(function(x){err("dpkg-deb: error: '"+x+"' is not a Debian format archive");err('dpkg: error processing archive '+x+' (--install):');err(' dpkg-deb --control subprocess returned error exit status 2');failed.push(x)}); /* nothing here is a .deb */
  }
  else{
    var L=[],first=true,purge=act==='--purge',man=false,so=false;
    o.ops.forEach(function(x){ /* each in turn: what others still depend on stays */
      var p=pkg(x),d=PD[x],ma=d&&/a/.test(d[0])?':amd64':'';
      if(!p||!installed(p)&&!residual(p)){lines(L);L=[];err('dpkg: warning: ignoring request to remove '+x+" which isn't installed");return}
      if(!installed(p)&&!purge){lines(L);L=[];err('dpkg: warning: ignoring request to remove '+x+', only the config');err(' files of which are on the system; use --purge to remove them too');return}
      if(ESSENTIAL.test(x)){lines(L);L=[];err('dpkg: error processing package '+x+' ('+act+'):');err(' this is an essential package; it should not be removed');failed.push(x);return}
      var by=x==='systemd'?installed('openssh-server')||installed('cron')?DEPS.systemd:[]:(DEPS[x]||[]).filter(function(l){return installed(l.split(/[: ]/)[0])});
      if(by.length){lines(L);L=[];err('dpkg: dependency problems prevent removal of '+x+ma+':');by.forEach(function(l){err(' '+l)});err('');err('dpkg: error processing package '+x+ma+' ('+act+'):');err(' dependency problems - not removing');failed.push(x+ma);return}
      if(first){L.push('(Reading database ... '+dbCount()+' files and directories currently installed.)');first=false}
      if(installed(p)){L.push('Removing '+x+ma+' ('+p[1]+') ...');delete P.find(INFO,true).kids[x+'.list'];pkgSync();man=man||/m/.test(d[0]);so=so||!!ma||x==='apt'}
      if(purge&&P.find(INFO+x+'.postrm',true)){L.push('Purging configuration files for '+x+ma+' ('+p[1]+') ...');delete P.find(INFO,true).kids[x+'.postrm']}
    });
    if(man&&installed('man-db'))L.push('Processing triggers for man-db ('+pkg('man-db')[1]+') ...');
    if(so)L.push('Processing triggers for libc-bin (2.41-12+deb13u4) ...');
    lines(L);
  }
  if(failed.length){err('Errors were encountered while processing:');failed.forEach(function(x){err(' '+x)});P.queue(function(){P.status(1)})}
  else P.queue(function(){P.status(0)}); /* a warning only */
  return true;
}
cmd('dpkg','/usr/bin','package manager for Debian','dpkg [option...] action',['installs and removes single packages, and with -l lists what is installed.','',
  '-i, --install package-file...   install the package',
  '-l, --list [package-name-pattern...]   list packages matching given pattern',
  '-P, --purge package...   purge an installed or already removed package',
  '-r, --remove package...   remove an installed package',
  '--version   display dpkg version information'],function(a,raw,w){
  var o=opts(a);
  if(o.has('l','list')){
    pkgSync();
    var pats=o.ops.map(function(x){return P.globRe(x)}),L=PKGS.filter(function(p){return (!pats.length||pats.some(function(r){return r.test(p[0])}))&&(installed(p)||residual(p))});
    var miss=o.ops.filter(function(x,i){return !L.some(function(p){return pats[i].test(p[0])})});
    if(miss.length)P.queue(function(){P.status(1)});
    if(!L.length){miss.forEach(function(x){err('dpkg-query: no packages found matching '+x)});return}
    var nw=Math.max(14,L.reduce(function(m,p){return Math.max(m,p[0].length)},0)),vw=Math.max(12,L.reduce(function(m,p){return Math.max(m,p[1].length)},0));
    out(['Desired=Unknown/Install/Remove/Purge/Hold','| Status=Not/Inst/Conf-files/Unpacked/halF-conf/Half-inst/trig-aWait/Trig-pend','|/ Err?=(none)/Reinst-required (Status,Err: uppercase=bad)',
      '||/ '+'Name'.padEnd(nw)+' '+'Version'.padEnd(vw)+' Architecture Description','+++-'+'='.repeat(nw)+'-'+'='.repeat(vw)+'-============-'+'='.repeat(32)].concat(L.map(function(p){return (installed(p)?'ii  ':'rc  ')+p[0].padEnd(nw)+' '+p[1].padEnd(vw)+' '+(ALL.test(p[0])?'all  ':'amd64')+'        '+p[2]})));
    miss.forEach(function(x){err('dpkg-query: no packages found matching '+x)}); /* after the table */
    return;
  }
  if(P.st.user==='root'&&rootDpkg(o))return;
  if(o.has('i','install')||o.has('r','remove')||o.has('P','purge')){err('dpkg: error: requested operation requires superuser privilege');P.queue(function(){P.status(2)});return}
  if(o.L.version){P.typeLine("Debian 'dpkg' package management program version 1.22.22 (amd64).");return}
  dpkgUsage('need an action option');
});

var ALL=/^(cowsay|cowsay-off|unattended-upgrades|fortunes|fortunes-min|libao-common|python-apt-common|python3-distro-info|distro-info-data|lsb-release|ucf)$/; /* packages that are the same on every architecture */
/* python3: Debian's 3.13, which unattended-upgrades runs on. This terminal runs no Python program, so it tells its version and,
   asked to run anything, says it cannot */
cmd(['python3.13','python3'],'/usr/bin','an interactive high-level object-oriented language (python3 version)','python3 [ -c command | script | - ] [ arguments ]',[
  'python is an interpreted, interactive, object-oriented programming language. this machine has it because unattended-upgrades is written in it; this terminal runs no python program.','',
  '-V, --version   prints the python version number of the executable and exits. given twice, prints more information about the build.'],function(a,raw,w){
  var W=w.slice(1);
  if(W[0]==='-VV'||W[0]==='-V'&&W[1]==='-V'){P.typeLine('Python 3.13.5 (main, Aug 10 2026, 12:06:59) [GCC 14.2.0]');return}
  if(W[0]==='-V'||W[0]==='--version'){P.typeLine('Python 3.13.5');return}
  err(w[0]+': this terminal runs no Python programs (try '+w[0]+' --version)');
  P.queue(function(){P.status(1)});
});
P.setup(function(){P.paths.python3='/usr/bin'}); /* a second name for python3.13 (fs.js makes it the same file) */
/* fastfetch: trixie's system summary (neofetch is no longer packaged). The logo is drawn for this terminal */
var SWIRL=['        .-""""""-.','      .\'  .--.   \'.','     /   /    \\    \\','    |   |   ()|    |','    |   |    .\'   /','     \\   \'--\'   .\'','      \'.      .\'','        \'-.  \'','           \'-.','              \'.'];
cmd('fastfetch','/usr/bin','A fast and feature-rich system information tool similar to neofetch','fastfetch [OPTIONS...]',['prints what this machine is, beside the logo of its distribution. -l none or --logo none leaves the logo out.'],function(a){
  var m=Math.floor(since()/6e4),M=D.mem,used=(M.MemTotal+M.Shmem-M.MemFree-M.Buffers-M.Cached-M.SReclaimable)/1048576,tot=M.MemTotal/1048576,id=P.st.user+'@'+P.st.hostname;
  var I=[id,'-'.repeat(id.length),'OS: Debian GNU/Linux 13 (trixie) x86_64','Host: KVM/QEMU Standard PC (i440FX + PIIX, 1996) (pc-i440fx-9.2)','Kernel: Linux '+D.krel,
    'Uptime: '+(m<60?m+' min'+(m!==1?'s':''):Math.floor(m/60)+' hour'+(m>=120?'s':'')+', '+m%60+' min'+(m%60!==1?'s':'')),'Packages: '+(412-PKGS.filter(function(p){return !installed(p)}).length)+' (dpkg)','Shell: bash 5.2.37','Terminal: /dev/ttyS0',
    'CPU: AMD EPYC-Rome ('+D.ncpu+') @ 2.79 GHz','GPU: Device 1234:1111','Memory: '+used.toFixed(2)+' GiB / '+tot.toFixed(2)+' GiB ('+Math.round(used/tot*100)+'%)','Locale: C.UTF-8'];
  var nologo=a.some(function(x,i){return (x==='-l'||x==='--logo')&&a[i+1]==='none'});
  var wide=I.reduce(function(x,l){return Math.max(x,l.length)},0)+24;
  if(nologo){lines(I);return}
  if(!P.piped()&&P.columns()<wide){lines(SWIRL.concat([''],I));return} /* too narrow for the two side by side */
  var R=[];
  for(var i=0;i<Math.max(SWIRL.length,I.length);i++)R.push(((SWIRL[i]||'').padEnd(24)+(I[i]||'')).replace(/\s+$/,''));
  lines(R);
});
})(window.Phosphor);
