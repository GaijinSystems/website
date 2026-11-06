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
    '/vmlinuz':'boot/vmlinuz-6.12.111+deb13-amd64','/initrd.img':'boot/initrd.img-6.12.111+deb13-amd64','/usr/games/cowthink':'cowsay'},
  loads:loads
};
var BOOT=null,OLD=null,SEQ=0,STK=[]; /* the shells su started, newest last: what each says as it ends ('exit', or 'logout' after su -), and who and where to go back to */
P.setup(function(){
  BOOT=new Date(P.st.login.getTime()-52e3); /* the machine came up as the terminal did */
  function ps1(){
    var S=P.st;
    if(S.user==='root'&&S.home==='/'){S.home='/root';if(S.cwd==='/')S.cwd='/root'} /* root logged in at the console: root's home */
    var w=S.cwd===S.home?'~':S.cwd.indexOf(S.home+'/')===0?'~'+S.cwd.slice(S.home.length):S.cwd;
    return S.user+'@'+S.hostname+':'+w+(S.user==='root'?'# ':'$ ');
  }
  P.setPrompt(ps1);
  Object.defineProperty(P.profile,'rootPrompt',{get:ps1,configurable:true}); /* root's prompt is the same PS1, ending in # */
  var bye=P.cmds.exit; /* a login shell says so as it goes */
  if(bye)P.cmds.exit=P.cmds.logout=function(a,raw,w){
    if(!P.subshell()&&!P.inScript()){
      var top=STK[STK.length-1];
      if(top&&top.say==='exit'&&w&&w[0]==='logout'){err('bash: logout: not login shell: use `exit\'');P.status(1);return}
      P.typeLine(top?top.say:'logout');
      if(top){STK.pop();if(!top.base){P.st.user=top.user;P.st.home=top.home;P.st.cwd=top.cwd;return}} /* back to the shell that ran su */
    }
    bye(a,raw,w);
  };
  if(P.cmds.sh){var sh=P.cmds.sh;P.cmds.bash=function(a,raw,w){if(!a.length&&!P.stdin())return;sh(a,raw,w)};P.paths.bash='/usr/bin'} /* bash on its own: you are in one already */
  var GNU={cat:['concatenate files and print on the standard output','cat [OPTION]... [FILE]...'],pwd:['print name of current/working directory','pwd [OPTION]...'],
    echo:['display a line of text','echo [SHORT-OPTION]... [STRING]...'],mkdir:['make directories','mkdir [OPTION]... DIRECTORY...'],rm:['remove files or directories','rm [OPTION]... [FILE]...'],
    rmdir:['remove empty directories','rmdir [OPTION]... DIRECTORY...'],cp:['copy files and directories','cp [OPTION]... SOURCE... DIRECTORY'],mv:['move (rename) files','mv [OPTION]... SOURCE... DIRECTORY'],
    touch:['change file timestamps','touch [OPTION]... FILE...'],chmod:['change file mode bits','chmod [OPTION]... MODE[,MODE]... FILE...'],grep:['print lines that match patterns','grep [OPTION...] PATTERNS [FILE...]'],
    wc:['print newline, word, and byte counts for each file','wc [OPTION]... [FILE]...'],sort:['sort lines of text files','sort [OPTION]... [FILE]...'],uniq:['report or omit repeated lines','uniq [OPTION]... [INPUT [OUTPUT]]'],
    head:['output the first part of files','head [OPTION]... [FILE]...'],tail:['output the last part of files','tail [OPTION]... [FILE]...'],tr:['translate or delete characters','tr [OPTION]... STRING1 [STRING2]'],
    tee:['read from standard input and write to standard output and files','tee [OPTION]... [FILE]...'],sleep:['delay for a specified amount of time','sleep NUMBER[SUFFIX]...'],
    file:['determine file type','file [-bcdEhiklLNnprsSvzZ0] [file ...]'],du:['estimate file space usage','du [OPTION]... [FILE]...'],ln:['make links between files','ln [OPTION]... TARGET LINK_NAME'],
    date:['print or set the system date and time','date [OPTION]... [+FORMAT]'],whoami:['print effective user name','whoami [OPTION]...'],clear:['clear the terminal screen','clear [-Ttype] [-V] [-x]'],
    printenv:['print all or part of environment','printenv [OPTION]... [VARIABLE]...'],stty:['change and print terminal line settings','stty [-F DEVICE | --file=DEVICE] [SETTING]...'],
    sh:['command interpreter (shell)','sh [-aCefnuvxIimqVEb] [+aCefnuvxIimqVEb] [-o option_name] [command_file [argument ...]]'],
    vi:["Vi IMproved, a programmer's text editor",'vi [options] [file ..]'],'true':['do nothing, successfully','true [ignored command line arguments]'],
    'false':['do nothing, unsuccessfully','false [ignored command line arguments]'],test:['check file types and compare values','test EXPRESSION'],expr:['evaluate expressions','expr EXPRESSION']};
  Object.keys(GNU).forEach(function(k){if(P.has(P.man,k)){P.man[k].what=GNU[k][0];P.man[k].syn=GNU[k][1]}});
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
var BUILTIN=['alias','bg','cd','command','echo','exit','export','false','fg','help','history','jobs','kill','logout','printf','pwd','read','set','shift','source','test','true','type','umask','unalias','unset','wait'];
cmd('cd','','change the shell working directory','cd [-L|[-P [-e]] [-@]] [dir]',
  'changes the working directory to dir, or to your home directory if there is none. cd - goes back to the one before, and says where that is.',
  function(a){
    if(a.length>1){err('bash: cd: too many arguments');return}
    var t=a[0]||P.st.home,back=t==='-';
    if(back){if(OLD===null){err('bash: cd: OLDPWD not set');return}t=OLD}
    var n=P.find(t);
    if(!n||n.type!=='d'||n.prot){err('bash: cd: '+t+': '+(!n?'No such file or directory':n.type!=='d'?'Not a directory':'Permission denied'));return}
    OLD=P.st.cwd;P.env.OLDPWD=OLD;
    P.st.cwd=P.pathOf(n);
    if(back)P.typeLine(P.st.cwd);
  },{core:true,help:'change directory'});
/* bash's own list is the engine's (for !n and the arrows): -c, -d, -s and -p change a copy and put it back */
cmd('history','','display the command history','history [-c] [-d offset] [n]','lists the commands typed so far, numbered. with n, only the last n. -c clears the list, -d offset deletes one entry. !n runs number n again, and !! the last one.',function(a){
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
    else{err('bash: type: '+x+': not found');bad=true}
  });
  if(bad)P.status(1);
});
cmd('which','/usr/bin','locate a command','which [-a] filename ...','prints the full path of each program that would run for the names given, searching the directories in PATH. aliases and shell builtins are not programs.',function(a){
  var bad=false;
  a.filter(function(x){return x.charAt(0)!=='-'}).forEach(function(x){var f=where(x);if(f)P.typeLine(f);else bad=true});
  if(bad)P.status(1);
});
function envAll(){
  var E={HOME:P.st.home,LOGNAME:P.st.user,USER:P.st.user};
  Object.keys(P.env).forEach(function(k){E[k]=P.env[k]});
  return E;
}
cmd('export','','set export attribute for shell variables','export [-fn] [name[=value] ...] or export -p','marks each name for the environment of the commands run from now on, giving it the value after the = if there is one. with no name, lists what is exported.',function(a,raw,w){
  var args=w.slice(1).filter(function(x){return x!=='-p'});
  if(!args.length){var E=envAll();lines(Object.keys(E).sort().map(function(k){return 'declare -x '+k+'="'+E[k]+'"'}));return}
  args.forEach(function(x){
    var m=x.match(/^([A-Za-z_]\w*)(?:=(.*))?$/);
    if(!m){err("bash: export: `"+x+"': not a valid identifier");return}
    if(m[2]!==undefined)P.env[m[1]]=m[2];
  });
});
cmd('unset','','unset values and attributes of shell variables and functions','unset [-f] [-v] [-n] [name ...]','removes each variable named.',function(a){a.forEach(function(k){delete P.env[k]})});
cmd('env','/usr/bin','run a program in a modified environment','env [OPTION]... [-] [NAME=VALUE]... [COMMAND [ARG]...]','with no command, prints the environment, one NAME=value to a line.',function(){
  var E=envAll();lines(Object.keys(E).sort().map(function(k){return k+'='+E[k]}));
});
cmd('man','/usr/bin','an interface to the system reference manuals','man [OPTION...] [SECTION] PAGE...','prints the manual page for each page named. the section number, if given, is accepted and changes nothing here.',function(a){
  var w=a.filter(function(x){return !/^\d\w*$/.test(x)&&x.charAt(0)!=='-'});
  if(!w.length){P.say(['What manual page do you want?',"For example, try 'man man'."]);P.status(1);return}
  w.forEach(function(x,i){
    if(i)P.typeLine('');
    if(P.has(P.man,x))P.say(P.manPage(x));
    else{err('No manual entry for '+x);P.status(16)}
  });
},{core:true,help:'the manual'});
function homeOf(u){return u==='root'?'/root':'/home/'+u}
function nest(who,login){ /* a shell started by root, as root or anyone: no password, and exit comes back */
  STK.push({say:login?'logout':'exit',user:P.st.user,home:P.st.home,cwd:P.st.cwd});
  P.st.user=who;P.st.home=homeOf(who);if(login)P.st.cwd=P.st.home;
}
function as(who,line){ /* one command line as another user, then back */
  if(who==='root'&&P.st.user!=='root'){P.su();P.st.home='/root';P.exec(line);P.queue(function(){P.unsu()});return}
  var u=P.st.user;P.st.user=who;P.exec(line);P.queue(function(){P.st.user=u});
}
cmd('su','/usr/bin','run a command with substitute user and group ID','su [options] [-] [user [argument...]]',
  'asks for the password of the user named, root if none is, and starts a shell as that user. -c runs one command instead.',function(a){
  var who=null,login=false,run=null,m;
  for(var i=0;i<a.length;i++){
    var x=a[i];
    if(/^(-|-l|--login)$/.test(x))login=true;
    else if(x==='-c'||x==='--command'){run=a[++i];if(run===undefined){err("su: option requires an argument -- 'c'");err("Try 'su --help' for more information.");P.status(1);return}}
    else if((m=x.match(/^(?:--command=|-c)(.+)$/)))run=m[1];
    else if(x.charAt(0)==='-'&&who===null)continue;
    else if(who===null)who=x;
  }
  who=who||'root';
  if(['root',P.st.user,P.st.owner].indexOf(who)<0&&(/^\.\.?$|\//.test(who)||!P.find('/home/'+who,true))){err('su: user '+who+' does not exist or the user entry does not contain all the required fields');P.status(1);return}
  if(P.st.user==='root'){if(run!=null)as(who,run);else nest(who,login);return} /* root is asked nothing */
  function tried(l){
    if(l===null||l===P.INT)return;
    var word=P.profile.rootPassword;
    if(who==='root'&&word&&l===word){
      if(run!=null){as('root',run);return}
      if(piped)return; /* the shell reads the rest of the pipe, finds nothing, and ends */
      STK.push({say:login?'logout':'exit',base:true,from:P.st.user});
      P.su();P.st.home='/root';if(login)P.st.cwd='/root'; /* su keeps the folder; su - goes to root's */
      return;
    }
    P.pause(2200);
    err('su: Authentication failure');P.status(1);
  }
  var piped=P.stdin(); /* a password piped in is read like a typed one */
  if(piped){P.typeLine('Password: ');tried(String([].concat(piped)[0]||''));return}
  P.ask('Password: ',tried,false,true);
});
cmd('sudo','/usr/bin','execute a command as another user','sudo [-u user] command [arg ...]',
  'runs a command as the superuser or another user, after asking for your own password, if the security policy says you may.',function(a,raw){
  if(!a.length){P.say(['usage: sudo -h | -K | -k | -V','usage: sudo -v [-ABkNnS] [-g group] [-h host] [-p prompt] [-u user]','usage: sudo [-ABbEHkNnPS] [-u user] [VAR=value] [-i | -s] [command [arg ...]]']);P.status(1);return}
  if(a[0]==='-V'){P.typeLine('Sudo version 1.9.16p2');return}
  if(a[0]==='-k'||a[0]==='-K')return;
  if(P.st.user==='root'){ /* root may do anything, and is not asked: the rest of the line, quotes and all, as it was typed */
    var line=String(raw||'').replace(/^\s*\S+\s*/,''),u='root',sh=0,m;
    while((m=line.match(/^(?:(?:-u|--user)\s+|--user=|-u)(\S+)\s*|^(-i|--login|-s|--shell)(?=\s|$)\s*|^(--)(?=\s|$)\s*|^-\S+\s*/))){
      line=line.slice(m[0].length);
      if(m[1])u=m[1];else if(m[2])sh=/i|login/.test(m[2])?2:1;else if(m[3])break;
    }
    if(u!=='root'&&!P.find('/home/'+u,true)&&u!==P.st.user){err('sudo: unknown user '+u);err('sudo: error initializing audit plugin sudoers_audit');P.status(1);return}
    if(!line.trim()){if(sh)nest(u,sh===2);else P.say(['usage: sudo -h | -K | -k | -V','usage: sudo -v [-ABkNnS] [-g group] [-h host] [-p prompt] [-u user]','usage: sudo [-ABbEHkNnPS] [-u user] [VAR=value] [-i | -s] [command [arg ...]]']);return}
    as(u,line);
    return;
  }
  P.ask('[sudo] password for '+P.st.user+': ',function(l){
    if(l===null||l===P.INT)return;
    P.pause(1500);
    err(P.st.user+' is not in the sudoers file.');
  },false,true);
});
cmd('tty','/usr/bin','print the file name of the terminal connected to standard input','tty [OPTION]...','prints the name of the terminal you are typing on.',function(){P.typeLine('/dev/ttyS0')});
cmd('id','/usr/bin','print real and effective user and group IDs','id [OPTION]... [USER]','prints who you are to the system: your user and group numbers, and the groups you are in.',function(){
  var u=P.st.user,n=u===P.st.owner?1000:1001;
  P.typeLine(u==='root'?'uid=0(root) gid=0(root) groups=0(root)':'uid='+n+'('+u+') gid='+n+'('+u+') groups='+n+'('+u+'),100(users)');
});
cmd('groups','/usr/bin','print the groups a user is in','groups [OPTION]... [USERNAME]...','prints the groups you are in.',function(){P.typeLine(P.st.user==='root'?'root':P.st.user+' users')});
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
cmd('cat','/usr/bin','concatenate files and print on the standard output','cat [OPTION]... [FILE]...','prints each file in turn, or its standard input. -n numbers the lines.',function(a){
  var o=opts(a),num=o.has('n','number'),k=0,bad=false;
  function put(L){P.say(num?L.map(function(l){return String(++k).padStart(6)+'\t'+l}):L)}
  if(!o.ops.length){P.input([],put);return}
  var kb=false; /* once - has read the keyboard, the rest waits for it */
  o.ops.forEach(function(x){
    function one(){
      var n=P.find(x);
      if(!n||n.prot||n.type==='d'){err('cat: '+x+': '+why(n));bad=true;return}
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
      var n=P.find(x,true),abs=P.norm(x);
      if(!n){if(!force){err("rm: cannot remove '"+x+"': No such file or directory");P.status(1)}return}
      if(n.type==='d'&&!rec){err("rm: cannot remove '"+x+"': Is a directory");P.status(1);return}
      if(n===P.root||n.prot||!P.canWrite(abs)){err("rm: cannot remove '"+x+"': Permission denied");P.status(1);return}
      keep.push(x);
    });
    if(keep.length)rm((rec?['-r']:[]).concat(keep),raw,w);
  };
});
cmd('mkdir','/usr/bin','make directories','mkdir [OPTION]... DIRECTORY...','makes each directory named. -p makes any parents that are missing too, and does not mind if it is there already.',function(a){
  var o=opts(a),par=o.has('p','parents');
  if(!o.ops.length){err('mkdir: missing operand');err("Try 'mkdir --help' for more information.");P.status(1);return}
  o.ops.forEach(function(x){
    var abs=P.norm(x),ex=P.find(abs,true);
    if(ex){if(!par||ex.type!=='d'){err("mkdir: cannot create directory '"+x+"': File exists");P.status(1)}return}
    var up=abs,todo=[];
    while(!P.find(up,true)){todo.unshift(up);up=P.dirOf(up)}
    var top=P.find(up,true);
    if(todo.length>1&&!par||top.type!=='d'){err("mkdir: cannot create directory '"+x+"': "+(top.type!=='d'?'Not a directory':'No such file or directory'));P.status(1);return}
    if(!P.canWrite(todo[0])){err("mkdir: cannot create directory '"+x+"': Permission denied");P.status(1);return}
    todo.forEach(function(d){P.put(d,'d',{owner:P.st.user,date:P.now()})});
  });
});

/* ---------- ls, as GNU's ---------- */
function modeOf(n){
  if(n.mode)return n.mode;
  if(n.type==='d')return n.prot?'drwx------':'drwxr-xr-x';
  return n.prot?'-rw-------':n.bin?'-rwxr-xr-x':'-rw-r--r--';
}
function sizeOf(n){return n.type==='d'?4096:n.dev?0:P.fsize(n)}
function group(n){return n.group||(n.owner==='root'||n.owner==='bin'?'root':n.owner)}
function linkOf(path,n,up){ /* a name that is really somewhere else: the merged /usr, os-release, cowthink */
  if(P.has(D.links,path))return D.links[path];
  return up&&n&&n.parent!==up&&n!==up&&n!==up.parent?P.pathOf(n):null;
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
  '-A          like -a, without . and ..',
  '-d          list directories themselves, not their contents',
  '-F          append a mark to entries: / for a directory, * for a program, @ for a link',
  '-h          with -l, print sizes like 1K 234M 2G',
  '-l          use a long listing format',
  '-r          reverse order while sorting',
  '-S          sort by file size, largest first',
  '-t          sort by time, newest first',
  '-1          list one file per line',
  '--color     accepted; this terminal has one colour, and it is green'],function(a){
  var o=opts(a),all=o.has('a','all'),almost=o.has('A','almost-all'),long=/[lgno]/.test(o.f),hum=o.has('h','human-readable'),self=o.has('d','directory'),
      mark=o.has('F','classify'),one=o.has('1'),rev=o.has('r','reverse'),byT=o.has('t'),byS=o.has('S'),files=[],dirs=[],bad=false;
  var unknown=Object.keys(o.L).filter(function(k){return !/^(all|almost-all|human-readable|directory|classify|reverse|color|colour|group-directories-first)$/.test(k)})[0];
  if(unknown){err("ls: unrecognized option '--"+unknown+"'");err("Try 'ls --help' for more information.");P.status(2);return}
  var badc=o.f.replace(/[aAbBcCdDfFgGhHiIklLmnNopqQrRsStTuUvwxXZ1]/g,'').charAt(0);
  if(badc){err("ls: invalid option -- '"+badc+"'");err("Try 'ls --help' for more information.");P.status(2);return}
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
      return {c:[m,String(nl),e.link?'root':n.owner,e.link?'root':group(n),n.dev?n.dev[0]+', '+n.dev[1]:hum?human(sz):String(sz),lsDate(n.date)],
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
    var n=P.find(w),abs=P.norm(w),up=P.find(P.dirOf(abs),true),link=abs!=='/'&&!/\/$/.test(w)&&(long||self)?linkOf(abs,n,up):null;
    if(!n){err("ls: cannot access '"+w+"': No such file or directory");bad=true;return}
    if(link||self||n.type!=='d')files.push({name:w,n:n,link:link});
    else if(n.prot){err("ls: cannot open directory '"+w+"': Permission denied");bad=true}
    else dirs.push({name:w,n:n});
  });
  var L=[];
  if(files.length){
    sorter(files);
    if(long)L=L.concat(longRows(files));
    else L=L.concat(one?files.map(function(e){return e.name+tag(e)}):columns(files.map(function(e){return e.name+tag(e)})));
  }
  sorter(dirs).forEach(function(d,i){
    var n=d.n,at=P.pathOf(n),E=Object.keys(n.kids).filter(function(k){return all||almost||k.charAt(0)!=='.'}).map(function(k){
      var kid=n.kids[k];return {name:k,n:kid,link:linkOf((at==='/'?'':at)+'/'+k,kid,n)};
    });
    sorter(E);
    if(all)E=[{name:'.',n:n},{name:'..',n:n.parent}].concat(E);
    if(want.length>1){if(L.length||i)L.push('');L.push(d.name+':')}
    if(long){L.push(total(E));L=L.concat(longRows(E))}
    else L=L.concat(one?E.map(function(e){return e.name+tag(e)}):columns(E.map(function(e){return e.name+tag(e)})));
  });
  lines(L);
  if(bad)P.status(2);
},{core:true,help:'list files'});

/* ---------- the system ---------- */
cmd('uname','/usr/bin','print system information','uname [OPTION]...',[
  'prints facts about the machine and the kernel it runs. with no option, the same as -s.','',
  '-a   all of the below, in this order','-s   the kernel name','-n   the network node hostname','-r   the kernel release','-v   the kernel version','-m   the machine hardware name','-o   the operating system'],function(a){
  var o=opts(a),all=o.has('a','all'),V={s:'Linux',n:P.st.hostname,r:D.krel,v:D.kbuild,m:'x86_64',p:'unknown',i:'unknown',o:'GNU/Linux'},R=[];
  var bad=o.f.replace(/[asnrvmpio]/g,'').charAt(0);
  if(bad){err("uname: invalid option -- '"+bad+"'");err("Try 'uname --help' for more information.");P.status(1);return}
  ['s','n','r','v','m','p','i','o'].forEach(function(k){
    if(all?k!=='p'&&k!=='i':o.f.indexOf(k)>=0||k==='s'&&!o.f)R.push(V[k]);
  });
  P.typeLine(R.join(' '));
});
cmd('hostname','/usr/bin','show or set the system\'s host name','hostname [-i|-I|-f|-s] [name]','prints the name of this machine. -I prints its addresses, -i the address its name resolves to. only root may change it.',function(a){
  var o=opts(a);
  if(o.ops.length){err('hostname: you must be root to change the host name');return}
  if(o.has('I','all-ip-addresses'))P.typeLine(D.ip4+' '+D.ip6+' ');
  else if(o.has('i','ip-address'))P.typeLine('127.0.1.1');
  else P.typeLine(P.st.hostname);
});
cmd('hostnamectl','/usr/bin','control the system hostname','hostnamectl [OPTIONS...] COMMAND ...','with no command, describes the machine: its name, what it runs on, and the kernel.',function(a){
  if(a[0]&&a[0]!=='status'){err('Could not set property: Interactive authentication required.');return}
  lines([' Static hostname: '+P.st.hostname,'       Icon name: computer-vm','         Chassis: vm','      Machine ID: 3f9c2e4b7a1d48e6b5c0d9a2e7f1c843','         Boot ID: '+bootId(),
    '    Product UUID: 0d6e5c1a-9b2f-4e7d-8a3c-61f4b2d9e0a5','  Virtualization: kvm','Operating System: Debian GNU/Linux 13 (trixie)','          Kernel: Linux '+D.krel,'    Architecture: x86-64',
    ' Hardware Vendor: QEMU','  Hardware Model: Standard PC _i440FX + PIIX, 1996_','Firmware Version: 1.16.3-debian-1.16.3-2','   Firmware Date: Tue 2014-04-01']);
});
function bootId(){var s=String(BOOT.getTime()*7919),h='';for(var i=0;h.length<32;i++)h+='0123456789abcdef'.charAt((s.charCodeAt(i%s.length)*(i+3))%16);return h}
cmd('uptime','/usr/bin','tell how long the system has been running','uptime [options]','prints the time now, how long the system has been running, how many users are logged on, and the system load averages for the past 1, 5 and 15 minutes. -p prints only how long, in words.',function(a){
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
cmd('free','/usr/bin','display amount of free and used memory in the system','free [options]','prints how much memory there is, how much is in use, and how much is free, in kibibytes, or -m mebibytes, -g gibibytes, -h whatever reads best.',function(a){
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
cmd('df','/usr/bin','report file system space usage','df [OPTION]... [FILE]...','shows, for each mounted file system, its size, how much is used and how much is left, in 1K blocks, or with -h in sizes that read easily.',function(a){
  var o=opts(a),h=o.has('h','human-readable');
  var R=DISKS.map(function(d){
    var avail=d[3]==='/'?d[1]-d[2]-1048576:d[1]-d[2],pct=d[2]?Math.ceil(100*d[2]/(d[2]+avail)):0;
    return [d[0],h?human(d[1]*1024):String(d[1]),h?(d[2]?human(d[2]*1024):'0'):String(d[2]),h?human(avail*1024):String(avail),pct+'%',d[3]];
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
cmd('ip','/usr/bin','show / manipulate routing, network devices, interfaces and tunnels','ip [ OPTIONS ] OBJECT { COMMAND | help }',[
  'shows the network: ip addr its addresses, ip link its interfaces, ip route where packets go. -br makes it brief. changing any of it needs root.'],function(a){
  var br=a.indexOf('-br')>=0||a.indexOf('-brief')>=0,w=a.filter(function(x){return x.charAt(0)!=='-'}),ob=w[0]||'',verb=w[1]||'show',dev=w.indexOf('dev')>=0?w[w.indexOf('dev')+1]:null;
  if(!ob){P.say(['Usage: ip [ OPTIONS ] OBJECT { COMMAND | help }','       ip [ -force ] -batch filename','where  OBJECT := { address | link | route | rule | neigh | ... }','       OPTIONS := { -V[ersion] | -s[tatistics] | -d[etails] | -r[esolve] | -br[ief] | -c[olor] ... }']);P.status(255);return}
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
function comm(c){return c.replace(/^-/,'').split(' ')[0].replace(/^.*\//,'').replace(/^\[(.*)\]$/,'$1')} /* the command's name, as ps and top show it */
function self(c){var n=700+(SEQ++)*3;return [P.st.user,n,662,11076,4224,'ttyS0','R+',hm(P.now()),'0:00',c]}
cmd('ps','/usr/bin','report a snapshot of the current processes.','ps [options]',[
  'lists processes. with no options, those on your terminal. ps aux lists everyone\'s, with the user, cpu, memory and start time of each; ps -ef the same in the System V style.'],function(a,raw,w){
  var f=a.join(' '),bsd=a.length&&a[0].charAt(0)!=='-',x=bsd?a[0]:'',every=/a.*x|x.*a/.test(x)||/(^|\s)-\w*[eA]/.test(f),mine=self('ps '+a.join(' ')),R=procs().concat([mine]);
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
  'asks systemd about the services it runs, and tells it what to do with them. status shows one, or the whole machine; list-units lists them. starting, stopping and enabling need root.'],function(a,raw,w){
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
      if(x&&!unit(x)){err(/able|mask/.test(verb)?'Failed to '+verb+' unit: Unit file '+x+' does not exist.':'Failed to '+verb+' '+x+': Unit '+x+' not found.');P.status(/able|mask/.test(verb)?1:5)}
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
  if(P.st.user!=='root'){err('Failed to '+(v==='poweroff'?'power off':v==='hybrid-sleep'?'put system into hybrid sleep':v)+' system via logind: Interactive authentication required.');P.status(1);return}
  var s=(since()/1000).toFixed(6).padStart(12); /* since() counts from the boot */
  if(v==='hibernate'||v==='hybrid-sleep'){err('Failed to '+(v==='hibernate'?'hibernate':'put system into hybrid sleep')+' system via logind: Not enough suitable swap space for hibernation available on compatible block devices and file systems.');P.status(1);return} /* it has no swap */
  if(v==='suspend'){P.powerOff(['[  OK  ] Reached target sleep.target - Sleep.','         Starting systemd-suspend.service - System Suspend...','['+s+'] PM: suspend entry (deep)']);return} /* a key wakes it, as a reload */
  var T={halt:['systemd-halt.service - System Halt','halt.target - System Halt','System halted'],poweroff:['systemd-poweroff.service - System Power Off','poweroff.target - System Power Off','Power down'],
    reboot:['systemd-reboot.service - System Reboot','reboot.target - System Reboot','Restarting system']}[v];
  P.powerOff(['         Stopping session-1.scope - Session 1 of User '+(STK.length&&STK[0].base?STK[0].from:'root')+'...','[  OK  ] Stopped target multi-user.target - Multi-User System.',
    '         Stopping cron.service - Regular background program processing daemon...','         Stopping ssh.service - OpenBSD Secure Shell server...','[  OK  ] Stopped cron.service - Regular background program processing daemon.',
    '[  OK  ] Stopped ssh.service - OpenBSD Secure Shell server.','[  OK  ] Reached target shutdown.target - System Shutdown.','[  OK  ] Reached target final.target - Final Step.',
    '[  OK  ] Finished '+T[0]+'.','[  OK  ] Reached target '+T[1]+'.','['+s+'] reboot: '+T[2]]);
}
['reboot','poweroff','halt','shutdown'].forEach(function(v){
  cmd(v,'/usr/sbin',(v==='shutdown'?'Halt, power off or reboot the machine':v==='reboot'?'Reboot the machine':v==='halt'?'Halt the machine':'Power off the machine'),v+' [OPTIONS...]','asks systemd to stop the machine. only an administrator may.',function(a){
    if(v!=='shutdown'||P.st.user!=='root'){power(v==='shutdown'?'poweroff':v);return}
    var r='poweroff',when=null,m,now=P.now();
    for(var i=0;i<a.length;i++){
      var x=a[i];
      if(x==='-c')return; /* cancelled, quietly */
      if(x==='-r'||x==='--reboot')r='reboot';else if(x==='-H'||x==='--halt')r='halt';else if(x==='-h'||x==='-P'||x==='--poweroff')r='poweroff';
      else if(x.charAt(0)==='-')continue;
      else if(when===null){ /* the time: now, +minutes, or hh:mm (tomorrow if it has gone); the rest is a message for the others */
        if(x==='now')when=0;
        else if((m=x.match(/^\+?(\d+)$/)))when=+m[1]*6e4;
        else if((m=x.match(/^(\d{1,2}):(\d\d)$/))&&+m[1]<24&&+m[2]<60){var t=new Date(now);t.setHours(+m[1],+m[2],0,0);if(t<=now)t.setDate(t.getDate()+1);when=t-now}
        else{err('Failed to parse time specification: '+x);P.status(1);return}
      }
    }
    if(when===null)when=6e4;
    if(!when){power(r);return}
    P.typeLine((r==='reboot'?'Reboot':'Shutdown')+' scheduled for '+stamp(new Date(now.getTime()+when))+', use \'shutdown -c\' to cancel.'); /* which this terminal does not wait out */
  });
});
cmd('journalctl','/usr/bin','Print log entries from the systemd journal','journalctl [OPTIONS...] [MATCHES...]',[
  'prints the system journal, oldest first. ordinary users see only their own entries; the system\'s are for the groups adm and systemd-journal.'],function(a){
  var o=opts(a),t=new Date(BOOT.getTime()+48e3),h=P.st.hostname,pfx=jstamp(t)+' '+h+' systemd[655]: ';
  if(!o.has('q','quiet'))lines(['Hint: You are currently not seeing messages from other users and the system.',"      Users in groups 'adm', 'systemd-journal' can see all messages.",'      Pass -q to turn off this notice.']);
  if(o.has('u','unit')||o.has('k','dmesg')||o.L.unit){P.typeLine('-- No entries --');return}
  var E=['Queued start job for default target default.target.','Created slice app.slice - User Application Slice.','Reached target paths.target - Paths.','Reached target timers.target - Timers.',
    'Starting dbus.socket - D-Bus User Message Bus Socket...','Listening on dbus.socket - D-Bus User Message Bus Socket.','Reached target sockets.target - Sockets.','Reached target basic.target - Basic System.',
    'Reached target default.target - Main User Target.','Startup finished in 84ms.'];
  if(o.has('n','lines'))E=E.slice(-Math.min(E.length,parseInt(o.ops[0],10)||10));
  lines(E.map(function(e){return pfx+e}));
});

/* packages: apt as anyone but root */
var PKGS=[['apt','3.0.4','commandline package manager'],['base-files','13.8+deb13u7','Debian base system miscellaneous files'],['bash','5.2.37-2+b10','GNU Bourne Again SHell'],
  ['coreutils','9.7-3','GNU core utilities'],['cowsay','3.03+dfsg2-8','configurable talking cow'],['cmatrix','2.0-6','simulates the display from "The Matrix"'],['cron','3.0pl1-197','process scheduling daemon'],
  ['dbus','1.16.2-2','simple interprocess messaging system (system message bus)'],['fortune-mod','1:1.99.1-9','provides fortune cookies on demand'],['frotz','2.55+dfsg-2','interpreter of Z-code story-files'],
  ['grep','3.11-4','GNU grep, egrep and fgrep'],['iproute2','6.15.0-1','networking and traffic control tools'],['less','668-1','pager program similar to more'],
  ['linux-image-'+D.krel,'6.12.111-1','Linux 6.12 for 64-bit PCs (signed)'],['man-db','2.13.1-1','tools for reading manual pages'],['fastfetch','2.40.4+dfsg-1','neofetch-like tool for fetching system information'],
  ['openssh-server','1:10.0p1-7','secure shell (SSH) server, for secure access from remote machines'],['procps','2:4.0.4-9','/proc file system utilities'],['sl','5.02-1+b1','Correct you if you type \'sl\' by mistake'],
  ['sudo','1.9.16p2-3+deb13u2','Provide limited super user privileges to specific users'],['systemd','257.13-1~deb13u1','system and service manager'],['tar','1.35+dfsg-3.1','GNU version of the tar archiving utility'],
  ['unattended-upgrades','2.12','automatic installation of security upgrades'],['util-linux','2.41.5-0+deb13u1','miscellaneous system utilities'],['vim-tiny','2:9.1.1230-2+deb13u1','Vi IMproved - enhanced vi editor - compact version']];
PKGS.sort(function(x,y){return x[0]<y[0]?-1:x[0]>y[0]?1:0}); /* dpkg and apt list by name */
var AVAIL=[['bsdgames','2.17-35','collection of classic textual unix games'],['cowsay-off','3.03+dfsg2-8','configurable talking cow (offensive cows)'],['curl','8.14.1-2+deb13u5','command line tool for transferring data with URL syntax'],
  ['fortunes','1:1.99.1-9','Data files containing fortune cookies'],['git','1:2.47.3-0+deb13u1','fast, scalable, distributed revision control system'],['htop','3.4.1-5','interactive processes viewer'],
  ['nano','8.4-1','small, friendly text editor inspired by Pico'],['nethack-console','3.6.7-1+b2','dungeon crawling game - text-based interface'],['nginx','1.26.3-3+deb13u7','small, powerful, scalable web/proxy server'],
  ['python3','3.13.5-1','interactive high-level object-oriented language (default python3 version)'],['tmux','3.5a-3','terminal multiplexer']];
function pkg(n){return PKGS.concat(AVAIL).filter(function(p){return p[0]===n})[0]}
var NEED_ROOT=/^(install|remove|purge|upgrade|full-upgrade|dist-upgrade|autoremove|autoclean|clean|reinstall|satisfy|build-dep|source|edit-sources|modernize-sources)$/;
function apt(a,get){
  var o=opts(a),verb=o.ops[0]||'',E=get?'E: ':'Error: ';
  if(!verb){
    if(get){P.say(['apt 3.0.4 (amd64)','Usage: apt-get [options] command','       apt-get [options] install|remove pkg1 [pkg2 ...]','','Most used commands:','  update - Retrieve new lists of packages','  upgrade - Perform an upgrade','  install - Install new packages (pkg is libc6 not libc6.deb)','  remove - Remove packages','','See apt-get(8) for more information about the available commands.','                                        This APT has Super Cow Powers.']);return}
    P.say(['apt 3.0.4 (amd64)','Usage: apt [options] command','','Most used commands:','  list - list packages based on package names','  search - search in package descriptions','  show - show package details','  install - install packages','  remove - remove packages','  update - update list of available packages','  upgrade - upgrade the system by installing/upgrading packages','','See apt(8) for more information about the available commands.','                                        This APT has Super Cow Powers.']);
    return;
  }
  if(verb==='update'){
    P.typeLine('Reading package lists...'); /* the lock fails before it gets to Done */
    err(E+'Could not open lock file /var/lib/apt/lists/lock - open (13: Permission denied)');err(E+'Unable to lock directory /var/lib/apt/lists/');P.status(100);return;
  }
  if(NEED_ROOT.test(verb)){
    err(E+'Could not open lock file /var/lib/dpkg/lock-frontend - open (13: Permission denied)');
    err(E+'Unable to acquire the dpkg frontend lock (/var/lib/dpkg/lock-frontend), are you root?');
    P.status(100);return;
  }
  if(!get&&verb==='list'){
    var inst=!!o.L.installed||!!o.L.upgradable,L=o.L.upgradable?[]:inst?PKGS:PKGS.concat(AVAIL).sort(),pat=o.ops[1]?P.globRe(o.ops[1]):null;
    P.typeLine('Listing... Done');
    lines(L.filter(function(p){return !pat||pat.test(p[0])}).map(function(p){return p[0]+'/stable'+(PKGS.indexOf(p)>=0?',now ':' ')+p[1]+' '+(ALL.test(p[0])?'all':'amd64')+(PKGS.indexOf(p)>=0?' [installed]':'')}));
    return;
  }
  if(verb==='search'&&get!==true){
    var q=(o.ops[1]||'').toLowerCase();
    if(!q){err(E+'You must give at least one search pattern');P.status(100);return}
    if(get!==2)lines(['Sorting... Done','Full Text Search... Done']);
    PKGS.concat(AVAIL).sort().filter(function(p){return (p[0]+' '+p[2]).toLowerCase().indexOf(q)>=0}).forEach(function(p){
      if(get===2)P.typeLine(p[0]+' - '+p[2]);
      else{P.typeLine(p[0]+'/stable'+(PKGS.indexOf(p)>=0?',now':'')+' '+p[1]+' '+(ALL.test(p[0])?'all':'amd64')+(PKGS.indexOf(p)>=0?' [installed]':''));P.typeLine('  '+p[2]);P.typeLine('')}
    });
    return;
  }
  if((!get||get===2)&&(verb==='show'||verb==='policy')){
    o.ops.slice(1).forEach(function(n){
      var p=pkg(n),i=p&&PKGS.indexOf(p)>=0;
      if(!p){err(E+'No packages found');P.status(100);return}
      if(verb==='policy'){lines([n+':','  Installed: '+(i?p[1]:'(none)'),'  Candidate: '+p[1],'  Version table:',' '+(i?'***':'   ')+' '+p[1]+' 500','        500 http://deb.debian.org/debian trixie/main amd64 Packages'].concat(i?['        100 /var/lib/dpkg/status']:[]));return}
      lines(['Package: '+p[0],'Version: '+p[1],'Priority: optional','Section: '+(/game|cow|fortune|frotz|^sl$|nethack|matrix/.test(p[0])?'games':'admin'),'Installed-Size: '+(120+p[0].length*37)+' kB',
        'APT-Sources: http://deb.debian.org/debian trixie/main amd64 Packages'].concat(i?['APT-Manual-Installed: yes']:[]).concat(['Description: '+p[2],'']));
    });
    return;
  }
  err(E+'Invalid operation '+verb);P.status(100);
}
cmd('apt','/usr/bin','command-line interface','apt [-h] [-o=config_string] [-c=config_file] [-t=target_release] [-a=architecture] {list | search | show | update | install pkg... | remove pkg... | upgrade | full-upgrade | edit-sources | {-v | --version} | {-h | --help}}',
  ['installs, removes and lists packages. listing and searching are for anyone; changing what is installed takes root.'],function(a){apt(a,false)});
cmd('apt-get','/usr/bin','APT package handling utility -- command-line interface','apt-get [options] {update | upgrade | install pkg... | remove pkg... | ...}',['the older, steadier apt, for scripts. as apt, it needs root to change anything.'],function(a){apt(a,true)});
cmd('apt-cache','/usr/bin','query the APT cache','apt-cache [options] {search regex | show pkg... | policy [pkg...] | ...}',['asks the package lists what there is, without changing anything.'],function(a){apt(a,2)});
cmd('dpkg','/usr/bin','package manager for Debian','dpkg [option...] action',['installs and removes single packages, and with -l lists what is installed.'],function(a,raw,w){
  var o=opts(a);
  if(o.has('l','list')){
    var pat=o.ops[0]?P.globRe(o.ops[0]):null,L=PKGS.filter(function(p){return !pat||pat.test(p[0])});
    if(!L.length){err('dpkg-query: no packages found matching '+o.ops[0]);P.status(1);return}
    var nw=Math.max(14,L.reduce(function(m,p){return Math.max(m,p[0].length)},0)),vw=Math.max(12,L.reduce(function(m,p){return Math.max(m,p[1].length)},0));
    out(['Desired=Unknown/Install/Remove/Purge/Hold','| Status=Not/Inst/Conf-files/Unpacked/halF-conf/Half-inst/trig-aWait/Trig-pend','|/ Err?=(none)/Reinst-required (Status,Err: uppercase=bad)',
      '||/ '+'Name'.padEnd(nw)+' '+'Version'.padEnd(vw)+' Architecture Description','+++-'+'='.repeat(nw)+'-'+'='.repeat(vw)+'-============-'+'='.repeat(32)].concat(L.map(function(p){return 'ii  '+p[0].padEnd(nw)+' '+p[1].padEnd(vw)+' '+(ALL.test(p[0])?'all  ':'amd64')+'        '+p[2]})));
    return;
  }
  if(o.has('i','install')||o.has('r','remove')||o.has('P','purge')){err('dpkg: error: requested operation requires superuser privilege');P.status(2);return}
  if(o.L.version){P.typeLine("Debian 'dpkg' package management program version 1.22.22 (amd64).");return}
  err('dpkg: error: need an action option');err('');err("Type dpkg --help for help about installing and deinstalling packages [*];");err("Use 'apt' or 'aptitude' for user-friendly package management;");err('Type dpkg -Dhelp for a list of dpkg debug flag values;');err('Type dpkg --force-help for a list of forcing options;');err('Type dpkg-deb --help for help about manipulating *.deb files;');err('');err("Options marked [*] produce a lot of output - pipe it through 'less' or 'more' !");P.status(2);
});

var ALL=/^(cowsay|cowsay-off|unattended-upgrades|fortunes|fortunes-min)$/; /* packages that are the same on every architecture */
/* fastfetch: trixie's system summary (neofetch is no longer packaged). The logo is drawn for this terminal */
var SWIRL=['        .-""""""-.','      .\'  .--.   \'.','     /   /    \\    \\','    |   |   ()|    |','    |   |    .\'   /','     \\   \'--\'   .\'','      \'.      .\'','        \'-.  \'','           \'-.','              \'.'];
cmd('fastfetch','/usr/bin','A fast and feature-rich system information tool similar to neofetch','fastfetch [OPTIONS...]',['prints what this machine is, beside the logo of its distribution. -l none or --logo none leaves the logo out.'],function(a){
  var m=Math.floor(since()/6e4),M=D.mem,used=(M.MemTotal+M.Shmem-M.MemFree-M.Buffers-M.Cached-M.SReclaimable)/1048576,tot=M.MemTotal/1048576,id=P.st.user+'@'+P.st.hostname;
  var I=[id,'-'.repeat(id.length),'OS: Debian GNU/Linux 13 (trixie) x86_64','Host: KVM/QEMU Standard PC (i440FX + PIIX, 1996) (pc-i440fx-9.2)','Kernel: Linux '+D.krel,
    'Uptime: '+(m<60?m+' min'+(m!==1?'s':''):Math.floor(m/60)+' hour'+(m>=120?'s':'')+', '+m%60+' min'+(m%60!==1?'s':'')),'Packages: 412 (dpkg)','Shell: bash 5.2.37','Terminal: /dev/ttyS0',
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
