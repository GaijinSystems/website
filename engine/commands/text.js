/* PHOSPHOR-9 terminal: files and text tools (touch, mkdir, rmdir, cp, mv, chmod, grep, wc, sort,
   uniq, head, tail, tr, tee, cal, sleep, true, false, tty, stty, file, sh, printenv, set, du).
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE.
   They print with P.say and read with P.input, so the shell can pipe and redirect them. */
(function(P){
'use strict';

function cmd(name,what,syn,desc,run,noH){ /* desc: a line, a list of lines, or function(profile) giving [syn, lines] where the page differs by machine */
  var man=typeof desc==='function'?function(pr){var o=desc(pr);return {what:what,syn:o[0]||syn,desc:o[1]}}:{what:what,syn:syn,desc:[].concat(desc)};
  P.command({names:[name],path:'/bin',noHelpFlag:!!noH,man:man,run:run});
}
function nameOf(p){return P.nameOf(p)}
function operands(a){return a.filter(function(x){return x.charAt(0)!=='-'})}
function flags(a){return a.filter(function(x){return x.charAt(0)==='-'}).join('')}

cmd('touch','make a file, or update its time','touch file ...','makes each file that does not exist, and marks the rest as changed now.',function(a){
  a.forEach(function(x){
    var n=P.find(x,true),sysv=P.profile.sysv;
    if(n&&n.type==='f'&&!n.prot&&!n.dev&&(!P.mayWrite(n)||!sysv&&!P.access(n,'r')&&(P.profile.perror||P.fsize(n)>0))){ /* one there it may not open: 4.3BSD's touch asks
      access(2) for read and write; V7's opens it to read and write (an empty one it only creats). System V's sets its times with utime(2), which its owner may */
      if(sysv&&(n.owner===P.st.user||P.st.user===P.profile.rootName)){n.date=P.now();return}
      P.typeLine(sysv?'touch: cannot change times on '+x:P.profile.perror?'touch: '+x+': cannot touch':'Cannot touch '+x,'err');return;
    }
    if(!P.writeFile(x,[],true))P.oopsW('touch',x,'touch: cannot touch '+x);
  });
});
cmd('mkdir','make a folder','mkdir dir ...','makes each folder named.',function(a){
  var F=operands(a);
  if(!F.length){P.typeLine(P.profile.perror?'usage: mkdir directory ...':'mkdir: arg count','err');return}
  F.forEach(function(x){
    var abs=P.norm(x),there=P.find(abs,true);
    if(there&&P.profile.perror){P.typeLine('mkdir: '+x+': File exists','err');return}
    if(there||!P.canWrite(abs)){P.oopsW('mkdir',x,'mkdir: cannot make directory '+x);return}
    P.put(abs,'d',{owner:P.st.user,date:P.now()});
  });
});
cmd('rmdir','remove an empty folder','rmdir dir ...','removes each folder named, if it is empty.',function(a){
  if(!a.length){P.typeLine(P.profile.perror?'usage: rmdir directory ...':'rmdir: arg count','err');return}
  a.forEach(function(x){
    var n=P.find(x,true),at=n&&P.pathOf(n);
    if(!n){P.oops('rmdir',x,n,'rmdir: '+x+' non-existent');return}
    if(n.type!=='d'){P.typeLine('rmdir: '+x+' not a directory','err');return}
    if(P.st.cwd===at||P.st.cwd.indexOf(at+'/')===0){P.typeLine('rmdir: cannot remove current directory','err');return}
    if(P.inUse(at)){P.typeLine('rmdir: '+x+' not removed','err');return} /* where su left you */
    if(!n.prot&&P.immutable(at)){P.notPermitted('rmdir',x);return} /* before the kernel looks inside */
    if(Object.keys(n.kids).length){P.typeLine(P.profile.perror?'rmdir: '+x+': Directory not empty':'rmdir: '+x+' not empty','err');return}
    if(n.prot||n===P.root||!P.canWrite(at)){P.typeLine('rmdir: '+x+' not removed','err');return}
    delete n.parent.kids[n.name];
  });
});
function named(to,a){return to===P.norm(a[1])?a[1]:a[1].replace(/\/+$/,'')+'/'+nameOf(a[0])} /* the target as GNU names it: into a folder, folder/name */
function target(to,from){ /* copying or moving into a folder keeps the name */
  var d=P.find(to,true);
  return d&&d.type==='d'?P.norm(to)+'/'+nameOf(from):P.norm(to);
}
/* GNU's cp and mv (coreutils 9.7, as Debian's are): their own words for each way it fails. The name a failure is told by is the one
   given (into a folder: folder/name). Debian's cp and mv in front of these take the options and loop over the sources; a.rec is cp's -r,
   a.verb its -v for what a folder holds, a.keep its -p, a.force its -f */
function why(p){return P.why(p)}
function gnuSrc(who,x,nofollow){ /* the file named x, or null after saying why not: a name ending in / must be a folder */
  var n=P.find(x,true,false,nofollow);
  if(n&&/\/$/.test(x)&&n.type!=='d'&&!(n.type==='s'&&(P.find(x)||{}).type==='d'))n=null;
  if(!n){P.typeLine(who+": cannot stat '"+x+"': "+why(x),'err');return null}
  return n;
}
function sticky(abs,n){ /* the sticky bit's EPERM: someone else's file in a folder anyone may write in, such as /tmp */
  var d=P.find(P.dirOf(abs),true);
  return !!(n&&d&&/t$/.test(P.modeOf(d))&&!P.mayAlter(n));
}
function unseen(to,tn){ /* the target cannot even be looked for: a locked folder, or a file, on the way to it */
  var w=P.find(to,true,false,true)?null:why(to);
  return w==='Permission denied'||w==='Not a directory'&&!/\/$/.test(tn)?w:null;
}
function gnuCp(a){
  var src=a[0],n=gnuSrc('cp',src),o={verb:!!a.verb,keep:!!a.keep,force:!!a.force};
  if(!n)return;
  var to=target(a[1],src),tn=named(to,a),there=P.find(to,true);
  if(n.type==='d'&&!a.rec){P.typeLine("cp: -r not specified; omitting directory '"+src+"'",'err');return}
  var u=unseen(to,tn);
  if(u){P.typeLine("cp: cannot stat '"+tn+"': "+u,'err');return}
  if(n.type==='d'){copyDir(src,n,to,tn,o);return}
  if(!there&&/\/$/.test(tn)){P.typeLine("cp: cannot create regular file '"+tn+"': Not a directory",'err');return}
  if(there===n){P.typeLine("cp: '"+src+"' and '"+tn+"' are the same file",'err');return}
  if(there&&there.type==='d'){P.typeLine("cp: cannot overwrite directory '"+tn+"' with non-directory",'err');return}
  copyFile(src,n,to,tn,o);
}
function copyFile(src,n,to,tn,o){ /* o: verb (cp -v) and keep (cp -p) */
  if(n.prot||!P.may(n,'r')){P.typeLine("cp: cannot open '"+src+"' for reading: Permission denied",'err');return false}
  if(P.immutable(to,true)){P.notPermitted('cp',tn);return false} /* Debian's immutable attribute */
  var ex=P.find(to,true,false,true);
  if(o.force&&ex&&P.unwritable(ex)&&P.canWrite(to))P.unlink(to); /* cp -f: one it cannot open is removed, and made again */
  if(!P.writeFile(to,P.text(n),false)){
    var up=P.find(P.dirOf(to));
    P.typeLine("cp: cannot create regular file '"+tn+"': "+(/\/$/.test(tn)?'Not a directory':!up?why(P.dirOf(to)):'Permission denied'),'err');return false;
  }
  var t=P.find(to);
  if(o.keep&&t&&!t.dev){t.date=n.date;if(n.mode)t.mode=n.mode;if(P.st.user==='root')t.owner=n.owner}
  return true;
}
function copyDir(src,n,to,tn,o){ /* cp -r: the folder, then what is in it, in the order the folder lists them; a link is copied as a link */
  var from=P.pathOf(n),there=P.find(to,true);
  if(there&&there.type!=='d'){P.typeLine("cp: cannot overwrite non-directory '"+tn+"' with directory '"+src+"'",'err');return}
  if(to===from||to.indexOf(from+'/')===0){P.typeLine("cp: cannot copy a directory, '"+src+"', into itself, '"+tn+"'",'err');return}
  if(!there){
    var up=P.find(P.dirOf(to));
    if(!up||up.type!=='d'||!P.mayPut(up)||P.immutable(to)){
      if(up&&P.immutable(to))P.notPermitted('mkdir',tn);
      else P.typeLine("cp: cannot create directory '"+tn+"': "+(up?'Permission denied':why(P.dirOf(to))),'err');
      return;
    }
    P.put(to,'d',{owner:P.st.user,date:P.now()});
  }
  if(o.verb)P.typeLine("'"+src+"' -> '"+tn+"'");
  if(n.prot||!P.may(n,'r')||!P.may(n,'x')){P.typeLine("cp: cannot access '"+src+"': Permission denied",'err');return}
  Object.keys(n.kids).forEach(function(k){
    var c=n.kids[k],s=src.replace(/\/+$/,'')+'/'+k,t=tn.replace(/\/+$/,'')+'/'+k,ta=to+'/'+k;
    if(c.type==='d')copyDir(s,c,ta,t,o);
    else if(c.type==='s'){var ex=P.find(ta,true,false,true);if(ex){P.typeLine("cp: cannot create symbolic link '"+t+"': File exists",'err');return}P.symlink(ta,c.sym,'lrwxrwxrwx');if(o.verb)P.typeLine("'"+s+"' -> '"+t+"'")}
    else if(copyFile(s,c,ta,t,o)&&o.verb)P.typeLine("'"+s+"' -> '"+t+"'");
  });
}
function gnuMv(a){
  var src=a[0],n=gnuSrc('mv',src,true);
  if(!n)return;
  var from=P.norm(src),to=target(a[1],src),tn=named(to,a),there=P.find(to,true,false,true),was=P.pathOf(n),say=function(e){P.typeLine("mv: cannot move '"+src+"' to '"+tn+"': "+e,'err')};
  if(/(^|\/)\.\.?\/*$/.test(src)){say('Device or resource busy');return}
  var u=unseen(to,tn),other=there&&there!==n; /* other: something else is there */
  if(u){P.typeLine("mv: cannot stat '"+tn+"': "+u,'err');return}
  if(!there&&/\/$/.test(tn)&&n.type!=='d'){say('Not a directory');return}
  if(there===n&&from===P.pathOf(there)){P.typeLine("mv: '"+src+"' and '"+tn+"' are the same file",'err');return}
  if(n.type==='d'&&(to+'/').indexOf(was+'/')===0){P.typeLine("mv: cannot move '"+src+"' to a subdirectory of itself, '"+tn+"'",'err');return}
  if(other&&there.type==='d'&&n.type!=='d'){P.typeLine("mv: cannot overwrite directory '"+tn+"' with non-directory",'err');return}
  if(other&&there.type!=='d'&&n.type==='d'){P.typeLine("mv: cannot overwrite non-directory '"+tn+"' with directory '"+src+"'",'err');return}
  if(there&&there.dev){P.typeLine("mv: inter-device move failed: '"+src+"' to '"+tn+"'; unable to remove target: Permission denied",'err');return} /* /dev is a file system of its own */
  if(!n.prot&&(P.immutable(from)||P.immutable(to)&&there!==n)){P.notPermitted('mv',src,tn);return}
  var up=P.find(P.dirOf(to));
  if(!up||up.type!=='d'){say(why(P.dirOf(to)));return}
  if(sticky(from,n)||other&&sticky(to,there)){say('Operation not permitted');return}
  if(n.prot||n===P.root||!P.canWrite(from)||!P.canWrite(to)){say('Permission denied');return}
  if(other&&there.type==='d'&&Object.keys(there.kids).length){P.typeLine("mv: cannot overwrite '"+tn+"': Directory not empty",'err');return}
  var parent=up,name=to.split('/').pop();
  P.unlink(from); /* by the name given: a link has its own */
  parent.kids[name]=n;
  if(from===was){n.name=name;n.parent=parent;P.moved(was,to)}
}
cmd('cp','copy a file','cp file1 file2','copies file1 to file2, or into file2 if it is a folder.',function(a){
  if(P.profile.bash){gnuCp(a);return}
  if(a.length<2){P.typeLine(P.profile.perror?'Usage: cp [-ip] f1 f2; or: cp [-irp] f1 ... fn d2':'Usage: cp: f1 f2; or cp f1 ... fn d2');return}
  var n=P.unread(P.find(a[0])); /* a file its mode does not let you read: as a locked one */
  if(!n||n.type==='d'||n.prot){P.oops('cp',a[0],n,'cp: cannot open '+a[0]);return}
  var to=target(a[1],a[0]);
  if(P.immutable(to,true)){P.notPermitted('cp',named(to,a));return} /* Debian's immutable attribute */
  if(!P.writeFile(to,P.text(n),false))P.oopsW('cp',a[1],'cp: cannot create '+a[1]);
});
cmd('mv','move or rename a file','mv file1 file2','renames file1 to file2, or moves it into file2 if that is a folder.',function(a){
  if(P.profile.bash){gnuMv(a);return}
  if(a.length<2){P.typeLine(P.profile.perror?"usage: mv [-if] f1 f2 or mv [-if] f1 ... fn d1 (`fn' is a file or directory)":'usage: mv f1 f2; or mv d1 d2; or mv f1 ... fn d1');return}
  var n=P.find(a[0],true,false,true),from=P.norm(a[0]),to=target(a[1],a[0]),there=P.find(to,true,false,true); /* a symbolic link moves as itself */
  if(n&&!n.prot&&there&&there!==n&&P.unwritable(there)&&P.stdin()===null){ /* a file there it may not write, and the keyboard
    to ask: V7's mv: f: 444 mode, 4.3BSD's override protection 444 for f?, System V's (SVR4's mv.c) mv: f: 444 mode? Only a y goes on */
    var tn=named(to,a),o=P.octMode(there);
    P.ask(P.profile.perror?'override protection '+o+' for '+tn+'? ':'mv: '+tn+': '+o+' mode'+(P.profile.sysv?'? ':' '),function(l){if(l!==P.INT&&l&&l.charAt(0)==='y')mvOn(a,n,from,to,there)});
    return;
  }
  mvOn(a,n,from,to,there);
});
function mvOn(a,n,from,to,there){ /* V7's mv, once any question has been answered */
  if(n&&!n.prot&&(P.immutable(from)||P.immutable(to)&&there!==n)){P.notPermitted('mv',a[0],named(to,a));return}
  if(n&&!n.prot&&there&&there!==n&&there.type!=='d'&&(there.prot||!P.mayAlter(there))&&P.canWrite(from)){P.typeLine('mv: cannot unlink '+a[1],'err');return} /* a locked file, or someone else's, in the way */
  if(!n||n.prot||n===P.root||!P.canWrite(from)||!P.canWrite(to)){P.typeLine(P.profile.perror&&!n?'mv: '+a[0]+': Cannot access: No such file or directory':'mv: cannot access '+a[0],'err');return}
  if(there&&there!==n&&there.type==='d'){P.typeLine('mv: '+a[1]+' is a directory','err');return}
  if(there&&there!==n&&(there.prot||there.dev)){P.typeLine('mv: cannot unlink '+a[1],'err');return}
  var was=P.pathOf(n);
  if((to+'/').indexOf(was+'/')===0&&to!==was){P.typeLine('mv: directory rename only','err');return}
  var parent=P.find(P.dirOf(to)),name=to.split('/').pop();
  P.unlink(from); /* by the name given: a link has its own */
  parent.kids[name]=n;
  if(from===was){n.name=name;n.parent=parent;P.moved(was,to)} /* moving a link leaves the file where it is */
}
cmd('chmod','change who may do what to a file','chmod mode file ...',['mode is an octal number such as 755, or +x and -x. a file with x set runs as a shell script: ./file.','',
  'a symbolic mode has the form [who] op permission. who is a combination of u (user\'s permissions), g (group), o (others) and a (all, the same as ugo). with no who, it is a, but leaving alone what the umask (022) takes away. op is + to add the permission, - to take it away, or = to set exactly that. permission is any combination of r (read), w (write) and x (execute), X (execute, for a folder or a file someone may already execute), s (set the user or group id) and t (sticky): go-w, u=rwx, a+r. several, separated by commas, are done in turn: u+x,g-w.'],function(a){
  /* V7's, 4.3BSD's and System V's newmode(): an octal mode, or [ugoa][+-=][rwxXst] clauses after commas; 4.3BSD's -R and -f, and GNU's.
     What it says when it cannot: V7 and System V "can't access" (stat) and "can't change" (chmod); 4.3BSD's Perror ("Not owner" for EPERM);
     GNU's "cannot access" and "changing permissions of". A folder on the way that may not be searched is EACCES before the file is looked for */
  var gnu=P.profile.bash,bsd=P.profile.perror&&!gnu,W=a.slice(),rec=false,quiet=false;
  while(W.length>1&&/^-[Rf]+$/.test(W[0])){rec=rec||/R/.test(W[0]);quiet=quiet||/f/.test(W[0]);W.shift()}
  if(W.length<2){
    if(gnu)P.tryHelp('chmod',W.length?"missing operand after '"+W[0]+"'":'missing operand');
    else P.typeLine(bsd?'Usage: chmod [-Rf] [ugoa][+-=][rwxXstugo] file ...':'Usage: chmod [ugoa][+-=][rwxstugo] file ...');
    return;
  }
  var spec=W[0];
  if(newMode(spec,'-rw-r--r--')===null){
    if(gnu)P.tryHelp('chmod',"invalid mode: '"+spec+"'");
    else P.typeLine('chmod: invalid mode','err');
    return;
  }
  function say(t){if(!quiet)P.typeLine(t,'err');else P.status(1)}
  function noPerm(x){say(gnu?"chmod: changing permissions of '"+x+"': Operation not permitted":bsd?'chmod: '+x+': Not owner':"chmod: can't change "+x)}
  function one(x,n){
    if(P.isImmutable(n)){if(!quiet)P.notPermitted('chmod',x);return}
    if(!P.mayChmod(n,x)){noPerm(x);return}
    n.mode=newMode(spec,P.modeOf(n));
    if(rec&&n.type==='d'&&!n.prot)Object.keys(n.kids).sort().forEach(function(k){var c=n.kids[k];if(c.parent===n&&c.type!=='s')one(x.replace(/\/+$/,'')+'/'+k,c)});
  }
  W.slice(1).forEach(function(x){
    var n=P.shut(x)?null:P.find(x,true),why=n?'':P.why(x,true);
    if(!n){say(gnu?"chmod: cannot access '"+x+"': "+why:bsd?'chmod: '+x+': '+why:"chmod: can't access "+x);return}
    if(n.prot&&!P.mayChmod(n,x)){noPerm(x);return}
    one(x,n);
  });
});
function newMode(spec,m){ /* the mode string m after spec, or null when spec is no mode */
  var t=m.charAt(0),b=m.slice(1).split('').map(function(c,i){return /[rwxst]/.test(c)&&!(i%3===2&&/[ST]/.test(c))}),sp=[/[sS]/.test(m.charAt(3)),/[sS]/.test(m.charAt(6)),/[tT]/.test(m.charAt(9))];
  if(/^[0-7]{1,4}$/.test(spec)){
    var v=parseInt(spec,8);
    b=b.map(function(x,i){return !!(v&(256>>i))});
    if(spec.length===4)sp=[!!(v&2048),!!(v&1024),!!(v&512)];
  }
  else{
    var C=spec.split(',');
    for(var j=0;j<C.length;j++){
      var c=/^([ugoa]*)((?:[-+=][rwxXst]*)+)$/.exec(C[j]);
      if(!c)return null;
      var who=(c[1]||'a').replace(/a/g,'ugo'),um=!c[1],ops=c[2].match(/[-+=][rwxXst]*/g);
      ops.forEach(function(o){
        var op=o.charAt(0),p=o.slice(1),anyx=b[2]||b[5]||b[8];
        'ugo'.split('').forEach(function(u,ui){
          if(who.indexOf(u)<0)return;
          ['r','w','x'].forEach(function(bit,bi){
            var at=ui*3+bi,on=p.indexOf(bit)>=0||bit==='x'&&p.indexOf('X')>=0&&(t==='d'||anyx);
            if(um&&ui>0&&bit==='w')return; /* the umask, 022 */
            if(op==='+'&&on)b[at]=true;else if(op==='-'&&on)b[at]=false;else if(op==='=')b[at]=on;
          });
          var k=ui<2?(p.indexOf('s')>=0):(p.indexOf('t')>=0&&ui===2);
          if(ui<2||p.indexOf('t')>=0||op==='='){if(op==='+'&&k)sp[ui]=true;else if(op==='-'&&k)sp[ui]=false;else if(op==='='&&ui<2)sp[ui]=k}
        });
      });
    }
  }
  return t+b.map(function(on,i){
    var c=on?'rwx'.charAt(i%3):'-';
    if(i===2&&sp[0])c=on?'s':'S';else if(i===5&&sp[1])c=on?'s':'S';else if(i===8&&sp[2])c=on?'t':'T';
    return c;
  }).join('');
}

var POSIXCL={alpha:'A-Za-z',digit:'0-9',alnum:'0-9A-Za-z',upper:'A-Z',lower:'a-z',space:' \\t\\n\\r\\f\\v',blank:' \\t',punct:'!-\\/:-@\\[-`{-~',print:' -~',graph:'!-~',cntrl:'\\x00-\\x1f\\x7f',xdigit:'0-9A-Fa-f'};
function grepOpts(w,quiet){ /* grep's words as it reads them: its option letters, its patterns (GNU's -e and -f; else the first word of rest) and its files. null: it has said what is wrong (quiet: said nothing) */
  var fl=flags(w),rest=w.filter(function(x){return x.charAt(0)!=='-'||x==='-'&&P.profile.bash}),pats=null; /* GNU's - : its input */
  if(P.profile.bash){ /* GNU's getopt: options anywhere before --; -e PATTERNS and -f FILE, as often as you like, and then every other word is a file */
    fl='';rest=[];
    var no=function(t){if(quiet)return;P.typeLine('grep: '+t,'err');P.typeLine('Usage: grep [OPTION]... PATTERNS [FILE]...','err');P.typeLine("Try 'grep --help' for more information.",'err');P.queue(function(){P.status(2)})};
    var add=function(c,v){
      if(c==='e'){pats=(pats||[]).concat(v.split('\n'));return true}
      var n=P.find(v);
      if(!n||n.type==='d'||n.prot||!P.may(n,'r')){if(!quiet){P.typeLine('grep: '+v+': '+(!n?P.why(v,true):n.type==='d'?'Is a directory':'Permission denied'),'err');P.queue(function(){P.status(2)})}return false}
      pats=(pats||[]).concat(P.text(n)); /* -f: a pattern a line; an empty file, none, which nothing matches */
      return true;
    };
    for(var i=0;i<w.length;i++){
      var x=w[i],m=/^--(regexp|file)(?:=([\s\S]*))?$/.exec(x);
      if(x==='--'){rest=rest.concat(w.slice(i+1));break}
      if(m){var v=m[2]!==undefined?m[2]:w[++i];if(v===undefined){no("option '--"+m[1]+"' requires an argument");return null}if(!add(m[1]==='file'?'f':'e',v))return null;continue}
      if(/^-[^-]/.test(x)){
        for(var j=1;j<x.length;j++){
          var c=x.charAt(j);
          if(c!=='e'&&c!=='f'){fl+=c;continue}
          var val=j+1<x.length?x.slice(j+1):w[++i];
          if(val===undefined){no("option requires an argument -- '"+c+"'");return null}
          if(!add(c,val))return null;
          break;
        }
        continue;
      }
      rest.push(x);
    }
    if(pats)rest.unshift(null); /* the files are all the words */
  }
  return {fl:fl,rest:rest,pats:pats};
}
function grepRe(o,lit){ /* the pattern those words give (pieces: its patterns' sources, one by one), or what is wrong with it thrown */
  var gnu=P.profile.bash,fl=o.fl,pats=o.pats,one=function(p){return gnu&&/F/.test(fl)?p.replace(/[\\^$.*+?()[\]{}|\/]/g,'\\$&'):greSrc(p,gnu,gnu||P.profile.sysv,lit)}; /* GNU's -F: the pattern as it is */
  var off=0; /* each -e's groups: \1 in the second pattern is its own first group, after the first pattern's */
  var pieces=pats?pats.map(function(p){var r=reShift(one(p),off);off+=r.n;return r.s}):[one(o.rest[0])];
  var re=P.safeRe(pats?(pieces.length?pieces.map(function(x){return '(?:'+x+')'}).join('|'):'(?!)'):pieces[0],/i/.test(fl)?'i':''); /* several: any of them */
  re.pieces=pieces;
  return re;
}
var BREF=/\(\?:\\[1-9]\d*\)/; /* a backreference, as greSrc and reShift write it */
function grepSet(o){ /* GNU's two matchers, where they differ. re: which lines (its DFA's reading); also: with a backreference, glibc's regex must agree; out: what -o prints is glibc's */
  var re=grepRe(o,false),lre=null;
  if(P.profile.bash&&!/F/.test(o.fl)){try{lre=grepRe(o,true)}catch(e){lre=null}if(lre&&lre.source===re.source)lre=null}
  return {re:re,also:lre&&BREF.test(re.source)?lre:null,out:lre||re};
}
function splitTop(s){ /* a RegExp source's alternatives, at its top level */
  var out=[],d=0,cur='';
  for(var i=0;i<s.length;i++){
    var c=s.charAt(i);
    if(c==='\\'){cur+=c+s.charAt(++i);continue}
    if(c==='['){var j=i+1;for(;j<s.length&&s.charAt(j)!==']';j++)if(s.charAt(j)==='\\')j++;cur+=s.slice(i,j+1);i=j;continue}
    if(c==='(')d++;else if(c===')')d--;
    else if(c==='|'&&!d){out.push(cur);cur='';continue}
    cur+=c;
  }
  out.push(cur);
  return out;
}
function grepAlts(re){ /* -o prints the longest of the alternatives that match where the match starts (POSIX's leftmost-longest), not the first of them: each alternative, to look for from there. With a
                          backreference the groups keep their numbers, so the others stay in place, failing at once; too many, and it is the first as before */
  var A=[];re.pieces.forEach(function(x){A=A.concat(splitTop(x))});
  if(A.length<2)return null;
  var f=re.flags.replace(/[gy]/g,'')+'g';
  if(!BREF.test(re.source))return A.length>200?null:A.map(function(a){return P.safeRe(a,f)});
  return A.length>16?null:A.map(function(a,k){return P.safeRe(A.map(function(b,i){return i===k?b:'(?!)'+b}).join('|'),f)});
}
P.grepPlan=function(w){ /* for the shell, which works out what a grep in a pipe lets through: its letters, files and which lines, as grep itself reads them; null where grep would only complain */
  var o=grepOpts(w,true);
  if(!o||!o.rest.length)return null;
  try{var g=grepSet(o);return {re:g.re,test:function(l){return g.re.test(l)&&(!g.also||g.also.test(l))},fl:o.fl,files:o.rest.slice(1)}}catch(e){return null}
};
function reShift(src,off){ /* a RegExp source's backreferences moved on by off groups, and how many groups it has */
  var o='',n=0,cl=false;
  for(var i=0;i<src.length;i++){
    var c=src.charAt(i);
    if(c==='\\'){var m=!cl&&/^[1-9]\d*/.exec(src.slice(i+1));if(m){o+='\\'+(+m[0]+off);i+=m[0].length}else{o+=src.substr(i,2);i++}continue}
    if(cl){if(c===']')cl=false}else if(c==='[')cl=true;else if(c==='('&&src.charAt(i+1)!=='?')n++;
    o+=c;
  }
  return {s:o,n:n};
}
function greSrc(p,gnu,iv,lit){ /* grep's pattern, a basic regular expression, as a RegExp's source; a bad one is thrown. V7's and 4.3BSD's: . * [ ] \( \) \1,
  ^ only first and $ only last (else themselves), * first is itself, and \c for any other c is c. System V's (iv) adds \{m,n\}; GNU's \| \+ \? \< \>
  \b \w \s and [:class:] too. + ? | ( ) { } are themselves: M-^? is the four characters cat -v shows */
  function esc(c){return c.replace(/[\\^$.*+?()[\]{}|\/-]/g,'\\$&')}
  var o='',depth=0,start=true,ng=0,open=[],done=0,atom=-1,reps=false,gs=[],hat=false,asr=null,pend=null,ini=[0],acc=[0]; /* done: the groups closed so far, a bit each for 1 to 9 (all a backreference can name). ini, acc: glibc's completed groups at the start of each open alternation, and those its earlier alternatives closed: an alternative starts from the first, and the others' come back when it ends */
  /* A: something that can be repeated; Q: a repeat, of all that the one before it repeated (a*\? is (a*)?, not JS's lazy a*?; a\?\+ is (a?)+);
     Z: what takes no characters, or begins or divides: nothing there to repeat */
  function A(t){atom=o.length;o+=t;reps=false}
  function Q(t){if(reps&&atom>=0)o=o.slice(0,atom)+'(?:'+o.slice(atom)+')';o+=t;reps=true}
  function R(t,min){ /* a repeat as GNU's takes it: of the \< \> \b \B just before it, which it leaves out if that may be no times and keeps if not; of the atom before it; or, with nothing there, itself */
    if(pend&&lit)return false; /* lit: as glibc's regex has it, which GNU's grep uses for -o and with a backreference: the repeat there is its own characters */
    if(pend){if(!min&&!pend.gone){o=o.slice(0,pend.at);pend.gone=true}asr=pend;return true}
    if(atom<0)return false;
    Q(t);return true;
  }
  function Z(t){o+=t;atom=-1;reps=false}
  for(var i=0;i<p.length;i++){
    var c=p.charAt(i),was=start,wasHat=hat,m;start=false;hat=false;pend=asr;asr=null;
    if(c==='^'&&was&&!wasHat){Z('^');start=true;hat=true;continue} /* a second ^ is itself */
    if(c==='$'&&(i===p.length-1||gnu&&/^\\[)|]/.test(p.substr(i+1,2)))){Z('$');continue}
    if(c==='*'){if(was||!(gnu?R('*',0):(Q('*'),true)))A('\\*');continue}
    if(c==='.'){A('.');continue}
    if(c==='['){
      var j=i+1,neg=false,b='',prev=null; /* prev: the item before, for GNU's range check: a character's code, or 'cl' for a [:class:] */
      if(p.charAt(j)==='^'){neg=true;j++}
      if(p.charAt(j)===']'){b+='\\]';j++;prev=93}
      for(;j<p.length&&p.charAt(j)!==']';j++){
        var ch=p.charAt(j);
        if(gnu&&ch==='['&&(m=/^\[:(\w+):\]/.exec(p.slice(j)))){if(!P.has(POSIXCL,m[1]))throw 'class';b+=POSIXCL[m[1]];j+=m[0].length-1;prev='cl';continue}
        if(gnu&&ch==='-'&&prev!==null&&j+1<p.length&&p.charAt(j+1)!==']'){ /* a range: glibc's regcomp says REG_ERANGE for a class at either end, or an end before its start */
          var nx=p.charAt(j+1);
          if(prev==='cl'||nx==='['&&/^\[:\w+:\]/.test(p.slice(j+1))||nx.charCodeAt(0)<prev)throw 'Invalid range end';
          b+='-'+(nx==='\\'||nx==='['||nx==='^'?'\\'+nx:nx);j++;prev=null;continue;
        }
        prev=ch.charCodeAt(0);
        b+=ch==='\\'||ch==='['||ch==='^'?'\\'+ch:ch;
      }
      if(j>=p.length)throw 'unmatched [';
      A('['+(neg?'^':'')+b+']');i=j;continue;
    }
    if(c!=='\\'){A(esc(c));continue}
    if(++i>=p.length)throw 'trailing backslash';
    var n=p.charAt(i);
    if(n==='('){gs.push(o.length);Z('(');depth++;start=true;open.push(++ng);ini.push(done);acc.push(0);continue}
    if(n===')'){if(!depth)throw 'unmatched )';o+=')';atom=gs.pop();reps=false;depth--;ini.pop();done|=acc.pop();var gn=open.pop();if(gn<10)done|=1<<gn;continue}
    if(n==='{'&&iv){
      if(!(m=(gnu?/^(\d*)(,?)(\d*)\\\}/:/^(\d+)(,?)(\d*)\\\}/).exec(p.slice(i+1)))||!m[1]&&!m[2])throw 'unmatched {';
      i+=m[0].length;
      if(!gnu)Q('{'+m[1]+m[2]+m[3]+'}');
      else if(was||!R('{'+(m[1]||'0')+m[2]+m[3]+'}',+m[1]))('{'+m[1]+m[2]+m[3]+'}').split('').forEach(function(x){A(esc(x))}); /* GNU's \{,2\} is 0 to 2; with nothing to repeat, the characters themselves */
      continue;
    }
    if(/[1-9]/.test(n)){if(gnu&&!(done>>+n&1))throw 'Invalid back reference';A('(?:\\'+n+')');continue} /* GNU's regcomp: only a group already closed (REG_ESUBREG); (?:) keeps a digit after it its own */
    if(gnu&&n==='|'){Z('|');start=true;acc[acc.length-1]|=done;done=ini[ini.length-1];continue}
    if(gnu&&(n==='+'||n==='?')){if(was||!R(n,n==='+'?1:0))A('\\'+n);continue} /* with nothing before it to repeat (at the start, after \( \| \< \> or \b), it is the character itself, as in GNU's */
    if(gnu&&/[<>bB]/.test(n)){ /* first in its expression, what follows has nothing to repeat; after something, a repeat next is its own */
      if(was){start=true;hat=true}else asr={at:o.length,gone:false}; /* and a ^ next is itself */
      Z(n==='<'?'\\b(?=\\w)':n==='>'?'\\b(?<=\\w)':'\\'+n);continue;
    }
    if(gnu&&/[wWsS]/.test(n)){A('\\'+n);continue}
    A(esc(n));
  }
  if(depth)throw 'unmatched (';
  return o;
}
cmd('grep','search for a pattern','grep [ -cinv ] pattern [ file ... ]',function(pr){ /* -s on all; -h at Berkeley and GNU; -q -o -F and - for GNU's */
  var gnu=pr.bash,bsd=pr.perror&&!gnu,sys5=pr.sysv;
  if(gnu)return [null,['prints the lines that match, with the file\'s name before each when there is more than one file. with no file, or when file is -, reads standard input.','',
    '-c   suppress normal output; instead print a count of matching lines for each input file.',
    '-e PATTERNS, --regexp=PATTERNS   use PATTERNS as the patterns. this option can be used multiple times; a line that matches any of them is selected. then every word that is not an option is a file.',
    '-f FILE, --file=FILE   obtain patterns from FILE, one per line. the empty file contains zero patterns, and therefore matches nothing.',
    '-F   interpret the patterns as fixed strings, not regular expressions.',
    '-h   suppress the prefixing of file names on output.',
    '-i   ignore case distinctions in patterns and input data.',
    '-n   prefix each line of output with the 1-based line number within its input file.',
    '-o   print only the matched (non-empty) parts of a matching line, with each such part on a separate output line.',
    '-q   quiet; do not write anything to standard output. exit immediately with zero status if any match is found, even if an error was detected.',
    '-s   suppress error messages about nonexistent or unreadable files.',
    '-v   invert the sense of matching, to select non-matching lines.']];
  return [bsd?'grep [ -cinvsh ] pattern [ file ... ]':'grep [ -cinvs ] pattern [ file ... ]',['prints the lines that match. -v the lines that do not, -c only how many, -n with line numbers, -i ignoring case.','',
    sys5?'-s   error messages about files that do not exist or cannot be read are suppressed.':'-s   silent mode: nothing is printed (except error messages), only the status.'].concat(bsd?[
    '-h   do not print filename headers with output lines.']:[])];
},function(a,raw,words){
  var o=grepOpts(words.slice(1),false),re;
  if(!o)return;
  var fl=o.fl,rest=o.rest,pats=o.pats;
  var gnu=P.profile.bash,only=gnu&&/o/.test(fl); /* -o: just what matched */
  if(!rest.length){ /* no pattern: GNU's two lines and status 2 */
    if(gnu){P.typeLine('Usage: grep [OPTION]... PATTERNS [FILE]...','err');P.typeLine("Try 'grep --help' for more information.",'err');P.queue(function(){P.status(2)})}
    else P.typeLine('usage: '+P.man.grep.syn);
    return;
  }
  var set;
  try{set=grepSet(o);re=set.re}catch(e){if(gnu&&(e==='Invalid range end'||e==='Invalid back reference')){P.typeLine('grep: '+e,'err');P.queue(function(){P.status(2)});return} /* GNU's, from regerror */P.typeLine('grep: bad pattern '+(pats?pats.join(' '):rest[0]),'err');return}
  /* the files in turn, each line with its file's name when there are more than one (and no -h). A file it cannot open: V7's grep
     says so and stops there (status 2); 4.3BSD's, System V's (IRIX) and GNU's go on, and end with status 2 all the same. -s: V7's
     and 4.3BSD's print nothing, for the status alone; System V's and GNU's leave out the messages about files. GNU's -q prints
     nothing and stops at the first match, which makes the status 0 whatever went wrong */
  var v7=!gnu&&!P.profile.csh,sys5=!gnu&&P.profile.sysv,S=/s/.test(fl);
  var quiet=gnu?/q/.test(fl):S&&!sys5,hush=S&&(gnu||sys5),F=rest.slice(1),many=F.length>1&&!((gnu||P.profile.perror)&&/h/.test(fl)),total=0,bad=false;
  var all=only?P.safeRe(set.out.source,re.flags+'g'):null,alts=only&&gnu?grepAlts(set.out):null,also=set.also,v=/v/.test(fl),num=/n/.test(fl),cnt=/c/.test(fl); /* all: each line's exec runs to its null, which leaves lastIndex at 0 for the next */
  function scan(L,name){
    var hits=[],n=0,pre=name!==undefined&&many?name+':':'';
    for(var i=0;i<L.length;i++){
      var l=L[i];
      var hit=re.test(l)&&(!also||also.test(l));
      if((re.overflow||also&&also.overflow)&&gnu){dead=true;break}
      if(hit===v)continue;
      n++;
      if(quiet&&gnu)break;
      var at=pre+(num?(i+1)+':':'');
      if(!only){hits.push(at+l);continue}
      if(v)continue; /* -v -o: the lines that do not match have no matching part to print */
      var ovf=false;
      if(alts){ /* each alternative's next match from where the last one printed ended, looked for again only once that is passed: the leftmost start, and the longest there */
        for(var pos=0,nx=alts.map(function(){return -1}),ln=[];pos<=l.length&&!ovf;){
          var st=Infinity,len=0;
          for(var k=0;k<alts.length;k++){
            if(nx[k]<pos){alts[k].lastIndex=pos;var x=alts[k].exec(l);if(alts[k].overflow)ovf=true;nx[k]=x?x.index:Infinity;ln[k]=x?x[0].length:0;alts[k].lastIndex=0}
            if(nx[k]<st){st=nx[k];len=ln[k]}else if(nx[k]===st&&ln[k]>len)len=ln[k];
          }
          if(st===Infinity)break;
          if(!len){pos=st+1;continue} /* an empty one is not printed */
          hits.push(at+l.substr(st,len));pos=st+len;
        }
      }
      else for(var m;(m=all.exec(l));){if(!m[0]){all.lastIndex++;continue}hits.push(at+m[0])} /* each match on its own line; an empty one is not printed. exec's null leaves lastIndex at 0 */
      if((all.overflow||ovf)&&gnu){dead=true;break}
    }
    total+=n;
    if(!quiet&&!(dead&&cnt)){if(cnt)P.typeLine(pre+n);else P.say(hits)}
    if(dead){P.typeLine('grep: memory exhausted','err');stop=true} /* the matcher's budget spent (regexec's REG_ESPACE): GNU's xalloc_die, after what it has printed */
    return n;
  }
  var stop=false,dead=false;
  if(!F.length){P.input([],function(L){var n=scan(L);if(dead)P.queue(function(){P.status(2)});else P.status(n?0:1)});return}
  F.forEach(function(x){P.queue(function(){ /* in turn: GNU's - may wait for the keyboard */
    if(stop)return;
    if(gnu&&x==='-'){P.input([],function(L){if(scan(L,'(standard input)')&&quiet)stop=true});return}
    var fx=P.fold(x),nd=P.unread(P.find(fx));
    if(!nd||nd.type==='d'||nd.prot){if(!hush)P.input([fx],function(){});bad=true;if(v7)stop=true;return}
    if(scan(P.text(nd),x)&&quiet&&gnu)stop=true;
  })});
  P.queue(function(){P.status(dead||bad&&!(gnu&&quiet&&total)?2:total?0:1)}); /* after its messages, which would make it 1 */
});
cmd('wc','count lines, words and characters','wc [ -lwc ] [ name ... ]',function(pr){
  if(pr.bash)return [null,['prints how many lines, words and characters, for each file and, for more than one, in total. with no file, reads standard input.','',
    '-c   print the byte counts',
    '-l   print the newline counts',
    '-w   print the word counts']];
  return [null,['prints how many lines, words and characters, for each name and, for more than one, in total. with no name, reads the standard input.','',
    'the options l, w and c may be used in any combination to specify that a subset of lines, words and characters are to be reported. they are given together, after one -: wc -lw.']];
},function(a){
  function counts(L){ /* newlines, words and bytes: a last line with no newline is no line */
    var words=0,chars=0,x=L.open?1:0;
    L.forEach(function(l){var t=l.trim();if(t)words+=t.split(/\s+/).length;chars+=l.length+1});
    return {l:L.length-x,w:words,c:chars-x};
  }
  if(!P.profile.bash){ /* wc.c of V7, 4.3BSD and System V: a row for each file it could open, in the order of the option's letters, and a
                          total after more than one name. The options: V7 and System V take only the first word, 4.3BSD each in turn,
                          the last winning. Columns: V7 "%7ld", "%7ld " and "%7ld" for l, w and c; 4.3BSD " %7ld"; System V (IRIX) "%7ld" */
    var bsd=P.profile.perror,v7=!bsd&&!P.profile.csh,wd='lwc',A=a.slice(),T={l:0,w:0,c:0};
    while(A.length&&A[0].charAt(0)==='-'){
      if(bsd&&!/^[lwc]/.test(A[0].slice(1))){P.typeLine('Usage: wc [-lwc] [files]','err');P.status(1);return}
      wd=A.shift().slice(1);if(!bsd)break;
    }
    var dirCounts=function(d){ /* V7's fopen and getc read a directory as they read any file (4.3BSD's read() and IRIX 4's EFS do too): the bytes of
                                   its raw entries, ., .. and the rest, counted as wc.c counts bytes. V7: 16 to an entry (a 2-byte inode, ls -i's,
                                   and a 14-byte name). 4.3BSD (sys/dir.h): struct direct, a 4-byte d_ino, 2-byte d_reclen and d_namlen (the VAX's
                                   byte order), the name and a NUL padded to 4 bytes (DIRSIZ), in DIRBLKSIZ (512) blocks that no entry crosses: the
                                   last entry of a block takes the rest of it, so the size is whole blocks. IRIX 4's EFS has its own block layout,
                                   which no source here settles: it is given 4.3BSD's */
      var c={l:0,w:0,c:0},tok=false,N=['.','..'].concat(Object.keys(d.kids)),R=[],used=0;
      function put(x){c.c++;if(x>32&&x<127){if(!tok)c.w++;tok=true;return}if(x===10)c.l++;else if(x!==32&&x!==9)return;tok=false}
      if(v7){N.forEach(function(nm){
        var ino=P.ino(nm),b=[ino&255,ino>>8&255];
        for(var i=0;i<14;i++)b.push(i<nm.length?nm.charCodeAt(i)&255:0);
        b.forEach(put);
      });return c}
      N.forEach(function(nm){
        var nl=Math.min(nm.length,255),sz=8+((nl+1+3)&~3);
        if(used+sz>512){R[R.length-1].len+=512-used;used=0}
        R.push({nm:nm.slice(0,nl),len:sz});used+=sz;
      });
      R[R.length-1].len+=512-used;
      R.forEach(function(r){
        var ino=P.ino(r.nm),b=[ino&255,ino>>8&255,ino>>16&255,ino>>>24,r.len&255,r.len>>8,r.nm.length,0];
        for(var i=0;i<r.nm.length;i++)b.push(r.nm.charCodeAt(i)&255);
        b.forEach(put);c.c+=r.len-b.length; /* the NULs that pad it: bytes, and nothing else to wc */
      });
      return c;
    };
    var col=function(k,n){return bsd?' '+String(n).padStart(7):String(n).padStart(7)+(v7&&k==='w'?' ':'')};
    var put=function(c,name){var o='';for(var i=0;i<wd.length;i++){var k=wd.charAt(i);if(c[k]!==undefined)o+=col(k,c[k])}P.typeLine(o+(name!==undefined?' '+name:''))};
    if(!A.length){P.input([],function(L){put(counts(L))});return}
    A.forEach(function(x){P.queue(function(){
      var n=P.unread(P.find(x)),c;
      if(!n||n.prot){P.input([x],function(){});return} /* it says it cannot open it, and goes on with the next */
      c=n.type==='d'?dirCounts(n):counts(P.text(n));
      put(c,x);T.l+=c.l;T.w+=c.w;T.c+=c.c;
    })});
    if(A.length>1)P.queue(function(){put(T,'total')});
    return;
  }
  /* GNU wc: a row for each file, and a total for more than one. The width (compute_number_width) is 1 for one count of one file,
     else that of the regular files' total size, and at least 7 when one is not a regular file (a directory, a pipe, the terminal) */
  var fl=flags(a),F=operands(a),want=[!fl||/l/.test(fl),!fl||/w/.test(fl),!fl||/c/.test(fl)];
  function picked(L){var c=counts(L);return [c.l,c.w,c.c].filter(function(n,i){return want[i]})} /* the counts asked for, in that order */
  var one=want.filter(Boolean).length===1,S=P.stdin(),width=1,total=[0,0,0].slice(0,want.filter(Boolean).length),bad=false;
  if(!(one&&F.length<2)){
    var size=0,min=1;
    if(!F.length){if(S&&S.from&&S.from.type!=='d')size=P.fsize(S.from);else min=7}
    F.forEach(function(x){var n=P.find(x);if(!n)return;if(n.type==='d'||n.dev)min=7;else size+=P.fsize(n)});
    width=Math.max(min,String(size).length);
  }
  function row(c,name){P.typeLine(c.map(function(n,i){return (i?' ':'')+String(n).padStart(width)}).join('')+(name!==undefined?' '+name:''))}
  function add(c){c.forEach(function(n,i){total[i]+=n})}
  if(!F.length){P.input([],function(L){row(picked(L))});return}
  F.forEach(function(x){P.queue(function(){
    var n=P.unread(P.find(x));
    if(!n||n.prot){P.typeLine('wc: '+x+': '+(!n?'No such file or directory':'Permission denied'),'err');bad=true;return}
    if(n.type==='d'){row(total.map(function(){return 0}),x);P.typeLine('wc: '+x+': Is a directory','err');bad=true;return} /* it counts what it read, nothing, then says why it stopped */
    var c=picked(P.text(n));add(c);row(c,x);
  })});
  P.queue(function(){if(F.length>1)row(total,'total');P.status(bad?1:0)});
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
/* head's arguments: {n: lines, c: bytes or null, F: [{f, n}], err: lines to print, q, v}. A negative n or c: all but that many at the end */
P.headArgs=function(w){
  var o={n:10,c:null,F:[],err:null,q:false,v:false,z:false},i;
  if(!P.profile.bash){ /* 4.3BSD's head.c (IRIX's is in /usr/bsd): -count before a file sets it for the files after it; else "Badly formed number" */
    for(i=0;i<w.length;i++){
      if(w[i].charAt(0)!=='-'){o.F.push({f:w[i],n:o.n});continue}
      if(!/^\d*$/.test(w[i].slice(1))){o.err=['Badly formed number'];break}
      o.n=+w[i].slice(1)||0;
    }
    return o;
  }
  /* GNU head: -n N, -c N (N may be -N, or have a suffix such as k), --lines, --bytes, -q, -v, -z; -N, with or without letters after it (-2, -2c, -1k, -3v), only as the first argument */
  function num(s,what){ /* xdectoumax with "bkKmMGTPEZYRQ0": b is 512; k, K, m, M, G ... Q powers of 1024, or of 1000 with B (or D) after them; KiB as K */
    var m=/^(-?)[ \t\n\v\f\r]*\+?(\d+)(?:(b)|([kKmMGTPEZYRQ])(B|D|iB)?)?$/.exec(s);
    if(!m)throw ['head: invalid number of '+what+": '"+s+"'"];
    var k=m[3]?512:m[4]?Math.pow(/^[BD]$/.test(m[5]||'')?1000:1024,'kmgtpezyrq'.indexOf(m[4].toLowerCase())+1):1;
    return (m[1]?-1:1)*Math.min(Number.MAX_VALUE,m[2]*k); /* past the largest number: as much as there is */
  }
  function bad(t){throw [t,"Try 'head --help' for more information."]}
  var F=[];
  try{
    i=0;
    if(/^-\d/.test(w[0]||'')){ /* parse_obsolete_option: the digits, then letters */
      var d=/^-(\d+)(.*)$/.exec(w[0]),lines=true,mul='';
      for(var q=0;q<d[2].length;q++){
        var l=d[2].charAt(q);
        if(l==='c'){lines=false;mul=''}else if(/[bkm]/.test(l)){lines=false;mul=l}else if(l==='l')lines=true;
        else if(l==='q'){o.q=true;o.v=false}else if(l==='v'){o.v=true;o.q=false}else if(l==='z')o.z=true;else bad('head: invalid trailing option -- '+l);
      }
      if(lines)o.n=num(d[1]+mul,'lines');else o.c=num(d[1]+mul,'bytes');
      i=1;
    }
    for(;i<w.length;i++){
      var x=w[i],m;
      if(x==='--'){F=F.concat(w.slice(i+1));break}
      if(x==='-'||x.charAt(0)!=='-'){F.push(x);continue}
      if((m=/^--([^=]*)(=([\s\S]*))?$/.exec(x))){
        var L=['lines','bytes','quiet','silent','verbose','zero-terminated'].filter(function(n){return n.indexOf(m[1])===0});
        if(L.length!==1)bad((L.length?'head: option \''+x+'\' is ambiguous':'head: unrecognized option \''+x+'\''));
        if(/^(lines|bytes)$/.test(L[0])){
          var v=m[2]?m[3]:w[++i];
          if(v===undefined)bad("head: option '--"+L[0]+"' requires an argument");
          if(L[0]==='lines'){o.n=num(v,'lines');o.c=null}else o.c=num(v,'bytes');
        }
        else if(m[2])bad("head: option '--"+L[0]+"' doesn't allow an argument");
        else if(L[0]==='verbose')o.v=true;else if(L[0]==='zero-terminated')o.z=true;else o.q=true;
        continue;
      }
      for(var j=1;j<x.length;j++){
        var ch=x.charAt(j);
        if(ch==='n'||ch==='c'){
          var a=j+1<x.length?x.slice(j+1):w[++i];
          if(a===undefined)bad("head: option requires an argument -- '"+ch+"'");
          if(ch==='n'){o.n=num(a,'lines');o.c=null}else o.c=num(a,'bytes');
          break;
        }
        if(/\d/.test(ch))bad('head: invalid trailing option -- '+ch);
        if(ch==='q'){o.q=true;o.v=false}else if(ch==='v'){o.v=true;o.q=false}else if(ch==='z')o.z=true;else bad("head: invalid option -- '"+ch+"'");
      }
    }
  }catch(e){if(!Array.isArray(e))throw e;o.err=e;return o}
  o.F=F.map(function(f){return {f:f,n:o.n}});
  return o;
};
function headOf(L,n,c,z){ /* the first n lines, or c bytes; z: lines end at a NUL (-z). A line it cuts short, or that had no newline, is left open */
  var R;
  if(c===null&&!z){R=n<0?L.slice(0,Math.max(0,L.length+n)):L.slice(0,n);R.open=!!L.open&&n>=L.length;return R}
  var t=L.map(function(l){return l+'\n'}).join('');
  if(L.open)t=t.slice(0,-1);
  if(c!==null)t=c<0?t.slice(0,Math.max(0,t.length+c)):t.slice(0,c);
  else{var Z=t.match(/[^\0]*\0|[^\0]+$/g)||[];t=(n<0?Z.slice(0,Math.max(0,Z.length+n)):Z.slice(0,n)).join('')}
  R=t?t.replace(/\n$/,'').split('\n'):[];
  R.open=!!t&&!/\n$/.test(t);
  return R;
}
cmd('head','print the first lines','head [ -n ] [ file ... ]',function(pr){
  if(!pr.bash)return [null,['prints the first n lines, normally 10. a -n before a file holds for the files after it.']];
  return [null,['print the first 10 lines of each file to standard output. with more than one file, precede each with a header giving the file name. with no file, or when file is -, read standard input.','',
    '-c, --bytes=[-]NUM   print the first NUM bytes of each file; with the leading \'-\', print all but the last NUM bytes of each file',
    '-n, --lines=[-]NUM   print the first NUM lines instead of the first 10; with the leading \'-\', print all but the last NUM lines of each file',
    '-q, --quiet, --silent   never print headers giving file names',
    '-v, --verbose   always print headers giving file names',
    '-z, --zero-terminated   line delimiter is NUL, not newline',
    '-NUM   as the first argument, the same as -n NUM.',
    '',
    'NUM may have a multiplier suffix: b 512, kB 1000, K 1024, MB 1000*1000, M 1024*1024, GB 1000*1000*1000, G 1024*1024*1024, and so on for T, P, E, Z, Y, R, Q. binary prefixes can be used, too: KiB=K, MiB=M, and so on.']];
},function(a){
  var o=P.headArgs(a),many=o.F.length>1&&!o.q||o.v,first=true;
  if(o.err&&P.profile.bash){o.err.forEach(function(l){P.typeLine(l,'err')});P.status(1);return} /* GNU's: before it reads anything */
  if(!o.F.length&&!o.err){if(o.v)P.say(['==> standard input <==']);P.input([],function(L){P.say(headOf(L,o.n,o.c,o.z))})}
  o.F.forEach(function(x){P.queue(function(){ /* one after the other: standard input from the keyboard is read in its turn */
    var std=x.f==='-'&&P.profile.bash,n=!std&&P.unread(P.find(x.f));
    if(!std&&(!n||n.type==='d'||n.prot)){P.input([x.f],function(){});return} /* it says so */
    if(many)P.say((first?[]:['']).concat(['==> '+(std?'standard input':x.f)+' <==']));first=false; /* write_header: before it reads */
    P.input(std?[]:[x.f],function(L){P.say(headOf(L,x.n,o.c,o.z))});
  })});
  if(o.err){o.err.forEach(function(l){P.typeLine(l,'err')});P.status(1)}
});
cmd('tail','print the last lines','tail [ -n ] [ file ... ]',function(pr){
  return [null,pr.bash?['print the last 10 lines of the files, taken as one, to standard output. with no file, read standard input.','',
    '-NUM   print the last NUM lines instead of the last 10.']:['prints the last n lines, normally 10.']];
},function(a){
  var n=count(a,10);P.input(operands(a),function(L){var R=n?L.slice(-n):[];R.open=!!L.open&&R.length>0;P.say(R)});
});
cmd('tr','change characters','tr [ -cds ] [ string1 [ string2 ] ]',function(pr){
  var D=['copies its input, changing each character of string1 into the matching one of string2. ranges like a-z work.'];
  if(pr.bash)return [null,D.concat(['','-c, -C, --complement   use the complement of string1','-d, --delete   delete characters in string1, do not translate','-s, --squeeze-repeats   replace each sequence of a repeated character that is listed in the last specified string with a single occurrence of that character',
    'the strings may hold \\n, \\t and \\\\, and the classes [:alpha:], [:digit:], [:lower:], [:upper:], [:alnum:], [:space:] and [:punct:].'])];
  return [null,D.concat(['','-c   complements the characters in string1: all the characters not in it.','-d   deletes the characters in string1 instead.','-s   squeezes each run of a character in string2 (or in string1, given alone) into one.'])];
},function(a,raw,words){
  /* V7's tr, 4.3BSD's and System V's: -c -d -s, which GNU's (Debian) has too, as --complement, --delete and --squeeze-repeats */
  var gnu=P.profile.bash,W=words.slice(1),o='';
  while(W.length&&(/^-[cdsC]+$/.test(W[0])||/^--(complement|delete|squeeze-repeats)$/.test(W[0]))){var x=W.shift();o+=x.charAt(1)==='-'?{complement:'c',delete:'d','squeeze-repeats':'s'}[x.slice(2)]:x.slice(1)}
  if(W[0]==='--')W.shift();
  var c=/[cC]/.test(o),d=/d/.test(o),sq=/s/.test(o);
  if(gnu){
    var bad=!W.length?'tr: missing operand':d&&!sq&&W.length>1?"tr: extra operand '"+W[1]+"'":d===sq&&W.length<2?"tr: missing operand after '"+W[0]+"'":W.length>2?"tr: extra operand '"+W[2]+"'":'';
    if(bad){P.typeLine(bad,'err');if(/extra/.test(bad)&&d&&!sq)P.typeLine('Only one string may be given when deleting without squeezing repeats.','err');else if(/after/.test(bad))P.typeLine(d?'Two strings must be given when both deleting and squeezing repeats.':'Two strings must be given when translating.','err');P.typeLine("Try 'tr --help' for more information.",'err');return}
  }
  else if(W.length<(o?1:2)&&!P.profile.perror){P.typeLine('usage: '+P.man.tr.syn);return}
  var CL={alpha:'A-Za-z',digit:'0-9',lower:'a-z',upper:'A-Z',alnum:'0-9A-Za-z',space:' \t',punct:'!-/:-@[-`{-~'};
  function span(s){
    if(gnu)s=s.replace(/\[:(\w+):\]/g,function(m,k){return CL[k]||m}).replace(/\\(.)/g,function(m,x){return x==='n'?'\n':x==='t'?'\t':x});
    return s.replace(/(.)-(.)/g,function(m,x,y){var o='';for(var k=x.charCodeAt(0);k<=y.charCodeAt(0);k++)o+=String.fromCharCode(k);return o});
  }
  var from=span(W[0]||''),to=span(W[1]||''),tr=!d&&W.length>1,sqs=sq?(d||W.length<2?(d?to:from):to):'',sqc=sq&&!d&&W.length<2&&c;
  var at=new Map(),sqset=new Set(sqs.split('')); /* each character of string1 and where it first is; the ones -s squeezes */
  from.split('').forEach(function(ch,i){if(!at.has(ch))at.set(ch,i)});
  function in1(ch){return at.has(ch)!==c}
  P.input([],function(L){ /* the input as one stream: a newline is a character like the rest (tr -cd 0-9 takes it away) */
    var l=L.join('\n')+(L.length&&!L.open?'\n':''),out='',last=null;
    for(var i=0;i<l.length;i++){
      var ch=l.charAt(i);
      if(d&&in1(ch))continue;
      if(tr&&in1(ch))ch=c?to.charAt(to.length-1):to.charAt(Math.min(at.get(ch),to.length-1));
      if(sq&&ch===last&&(sqc?!at.has(ch):sqset.has(ch)))continue;
      out+=ch;last=ch;
    }
    var R=out?out.split('\n'):[];
    if(R.length&&R[R.length-1]==='')R.pop();else R.open=R.length>0;
    P.say(R);
  });
});
cmd('tee','copy input to a file as well','tee [ -a ] file ...','prints what it reads and writes it to each file. -a adds to the end.',function(a){
  var app=/a/.test(flags(a)),F=operands(a);
  P.input([],function(L){
    F.forEach(function(x){ /* GNU's names the error; System V's (SVR4's tee.c) says cannot access for EACCES; V7's and 4.3BSD's cannot open */
      if(P.writeFile(x,L,app))return;
      if(P.profile.bash)P.oopsW('tee',x,'tee: cannot open '+x);
      else P.typeLine((P.profile.sysv&&P.find(P.dirOf(P.norm(x)),true)?'tee: cannot access ':'tee: cannot open ')+x,'err');
    });
    P.say(L);
  });
});

cmd('cal','print a calendar','cal [ month ] year',function(pr){ /* System V's (IRIX) cal with no argument: this month */
  return pr.year<1990?[null,['prints a month, or a whole year, of the real calendar. cal 9 1752 is worth a look.']]:
    ['cal [ [ month ] year ]',['prints a month, or a whole year, of the real calendar. with no argument, prints the current month. cal 9 1752 is worth a look.']];
},function(a){
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
  if(a.some(function(x){return !/^\d+$/.test(x)})){P.typeLine('Bad argument');return}
  var yr=+a[a.length-1],mo=a.length>1?+a[0]:0;
  if(!a.length){
    if(P.profile.year<1990){P.typeLine('usage: cal [month] year');return} /* a plain cal arrived with System V */
    var now=P.now();yr=now.getFullYear();mo=now.getMonth()+1;
  }
  if(!yr||yr<1||yr>9999||(mo&&(mo<1||mo>12))){P.typeLine('Bad argument');return}
  if(mo){P.say(month(yr,mo,true));return}
  var O=[String(yr).padStart(12)];
  for(var q=1;q<=12;q++){O.push('');O=O.concat(month(yr,q,false))}
  P.say(O);
});
cmd('sleep','wait a while','sleep seconds',function(pr){
  return [null,pr.bash?['waits for the sum of the times given. each is a number, which may have a fraction, and a suffix: s for seconds (the default), m minutes, h hours, d days. ctrl-c stops it early.']:['waits. ctrl-c stops it early.']];
},function(a){
  if(P.profile.bash){ /* GNU's: NUMBER[SUFFIX]..., summed */
    if(!a.length){P.tryHelp('sleep','missing operand');return}
    var t=0,bad=null;
    a.forEach(function(x){var m=/^\+?(\d+\.?\d*|\.\d+)([smhd]?)$/.exec(x);if(!m){if(bad===null)bad=x;return}t+=+m[1]*{'':1,s:1,m:60,h:3600,d:86400}[m[2]]});
    if(bad!==null){P.tryHelp('sleep',"invalid time interval '"+bad+"'");return}
    P.queue(function(){return P.sleep(Math.min(600,t)*1000)});
    return;
  }
  if(!a.length){P.typeLine('arg count','err');return}
  if(!/^\d+$/.test(a[0])){P.typeLine('bad character','err');return}
  var s=Math.min(600,+a[0]);
  P.queue(function(){return P.sleep(s*1000)});
});
cmd('make','maintain program groups','make [ name ... ]','brings each name up to date, following the rules in the makefile. there is no makefile.',function(a,raw,words){
  var W=words.slice(1).filter(function(x){return x.charAt(0)!=='-'});
  if(!W.length){P.typeLine('Make: No arguments or description file.  Stop.','err');return}
  W.forEach(function(x){
    if(P.find(x,true))P.typeLine("`"+x+"' is up to date.");
    else P.typeLine("Make:  Don't know how to make "+x+".  Stop.",'err');
  });
});
cmd('true','succeed','true','does nothing, successfully.',function(){P.status(0)});
cmd('false','fail','false','does nothing, unsuccessfully.',function(){P.status(1)});
cmd('tty','print the name of this terminal','tty','prints the name of this terminal.',function(){P.typeLine(P.profile.csh?'/dev/tty02':'/dev/tty0')});
cmd('stty','set the speed of the line','stty [ speed ]',function(pr){
  var D=['with a speed in baud, such as 300, 1200 or 9600, runs the line at that speed: ten bits a character, and you can read along. stty 0 goes back to normal. with no speed, reports it.'];
  if(!pr.teletype)return [null,D];
  return ['stty [ option ... ]',D.concat(['', /* V7's stty(1), for the modes the Teletype Model 33's line acts on */
    'on the teletype (see teletype), it reports the current settings of the options, and takes these as well, one after another:',
    '0   hang up phone line immediately: you are logged out.',
    'raw   raw mode input (no erase, kill, interrupt, quit, eot; parity bit passed back).',
    '-raw   negate raw mode.',
    'cooked   same as -raw.',
    'cbreak   make each character available to read as received; no erase and kill.',
    '-cbreak   make characters available to read only when newline is received.',
    'echo   echo back every character typed.',
    '-echo   do not echo characters.',
    'lcase   map upper case to lower case.',
    '-lcase   do not map case.',
    'ek   reset erase and kill characters back to normal # and @.',
    'erase c   set erase character to c. c can be of the form ^X which is interpreted as a control X.',
    'kill c   set kill character to c. ^X works here also.',
    'the rest of version 7\'s options (even, odd, nl, tabs, cr0 to cr3, tty33 and the like) are taken and change nothing.'])];
},function(a){ /* Debian's is GNU's, in its own commands */
  var T=P.teletype&&P.teletype();
  if(T){ /* V7 on a Teletype Model 33: the modes getty set for it (ANYP ECHO CRMOD XTABS LCASE CR1), told as V7's stty told them;
            lcase, echo, raw, cbreak, erase, kill and ek change the line; speed 0 hangs it up, which logs out */
    var shown=function(c){return c<' '?'^'+String.fromCharCode(64+c.charCodeAt(0)):c}; /* a control character as stty shows it: ^H */
    if(!a.length){P.say(['speed '+T.speed+' baud',"erase = '"+shown(T.erase)+"'; kill = '"+shown(T.kill)+"'",'even odd '+(T.raw?'raw ':'')+'-nl '+(T.echo?'echo ':'')+(T.lcase?'lcase ':'')+'-tabs '+(T.cbreak?'cbreak ':'')+'cr1']);return}
    var V7=/^(0|50|75|110|134|134\.5|150|200|300|600|1200|1800|2400|4800|9600|exta|extb|even|-even|odd|-odd|raw|-raw|cooked|nl|-nl|echo|-echo|tabs|-tabs|cbreak|-cbreak|cr[0-3]|tab[0-2]|nl[0-3]|ff[01]|bs[01]|33|tty33|37|tty37|05|vt05|tn|tn300|ti|ti700|tek|ek|gspeed|hup)$/,hup=false;
    for(var i=0;i<a.length;i++){
      var m=a[i];
      if(/^(lcase|LCASE)$/.test(m))T.lcase=true;
      else if(/^-(lcase|LCASE)$/.test(m))T.lcase=false;
      else if(/^(erase|kill)$/.test(m)){var c=a[++i];if(c)T[m]=c.charAt(0)==='^'&&c.length>1?String.fromCharCode(c.charCodeAt(1)&31):c.charAt(0)} /* stty erase ^h: a control character */
      else if(!V7.test(m))P.typeLine('unknown mode: '+m,'err');
      else if(m==='ek'){T.erase='#';T.kill='@'}
      else if(m==='echo'||m==='-echo')T.echo=m==='echo';
      else if(m==='raw'||m==='-raw'||m==='cooked')T.raw=m==='raw';
      else if(m==='cbreak'||m==='-cbreak')T.cbreak=m==='cbreak';
      else if(m==='0')hup=true; /* no speed: the line drops, and with it the login */
      else if(/^[\d.]+$/.test(m))T.speed=Math.floor(+m); /* the line's speed; the teletype still prints ten characters a second */
    }
    if(hup)P.logout();
    return;
  }
  if(!a.length){
    if(P.profile.perror){P.typeLine('new tty, speed '+(P.baud()||9600)+' baud; -tabs ff1 crt');return}
    P.typeLine('speed '+(P.baud()||9600)+' baud');
    if(P.profile.year<1980)P.say(["erase = '#'; kill = '@'",'even -nl echo -tabs cr2']);
    return;
  }
  if(['0','50','75','110','134','150','200','300','600','1200','1800','2400','4800','9600'].indexOf(a[0])<0){P.typeLine('unknown mode: '+a[0],'err');return}
  P.baud(+a[0]);
});
cmd('file','guess what a file is','file file ...','says what sort of thing each file seems to be.',function(a){
  a.forEach(function(x){
    var n=P.unread(P.find(x)),k=!n?'cannot stat':n.type==='d'?'directory':n.dev?'character special ('+n.dev[0]+'/'+n.dev[1]+')':n.prot?'cannot open':n.bin?(P.profile.perror?'demand paged pure executable':'pure executable'):/\.c$/.test(n.name)?'c program text':'ascii text';
    P.typeLine(x+':\t'+k);
  });
});
cmd('sh','run a shell script','sh file',function(pr){
  return ['sh [ -c string ] [ file [ arg ... ] ]',['runs the commands in a file, one line at a time. each arg is passed to the script: $1, $2 and so on, with the file\'s name as $0.'].concat(
    pr.csh&&pr.perror?['with no file, at the terminal, starts a bourne shell, with its $ prompt, until exit or end of file (^D).']:[],[
    '',
    '-c string   runs the commands in string instead.'])];
},function(a,raw){var back=P.keep();shRun(a,raw);P.queue(back,true)}); /* a process of its own: what it does to its variables and directory goes with it */
function shRun(a,raw){
  if(!a.length&&P.stdin()){P.runScript(P.stdin().splice(0));return} /* echo ls | sh: the commands come in on its standard input */
  if(!a.length){P.typeLine('usage: '+P.man.sh.syn);return}
  var c=a[0]==='-c'&&/^\s*\S+\s+(?:-c|'-c')\s+(.*)$/.exec(raw||''); /* sh -c 'a command'; '-c' as env passes it on */
  if(c){P.runScript([P.unquote(c[1])]);return}
  var n=P.unread(P.find(a[0]));
  function fail(m,st){P.typeLine(m,'err');P.queue(function(){P.status(st)})}
  if(P.profile.bash&&(!n||n.type==='d')&&!(n&&n.prot)){ /* none: dash's sh: 0: cannot open f: No such file, exit 2; bash's bash: f: No such file or directory, 127.
                                                     A folder: dash reads nothing from it, and exits 0; bash: f: f: Is a directory, 126 */
    if(dash()){if(!n)fail('sh: 0: cannot open '+a[0]+': No such file',2);else P.status(0)}
    else if(!n)fail('bash: '+a[0]+': No such file or directory',127);
    else fail(a[0]+': '+a[0]+': Is a directory',126);
    return;
  }
  if(n&&n.prot&&P.profile.bash){ /* dash: sh: 0: cannot open f: ..., and exit 2; bash: bash: f: ..., and 126 */
    if(dash())fail('sh: 0: cannot open '+a[0]+': Permission denied',2);
    else fail('bash: '+a[0]+': Permission denied',126);
    return;
  }
  if(!n||n.type==='d'||n.prot){P.typeLine(a[0]+': cannot open','err');return}
  P.runScript(P.text(n),a.slice());
}
/* the shell's own: read, shift, break, continue and : */
function builtin(names,run){P.command({names:names,noHelpFlag:true,run:run})}
builtin([':'],function(){P.status(0)});
function cshNow(){return P.profile.csh&&!P.bourne.sh()}
function dash(){return !!P.bourne.dash()} /* Debian's /bin/sh running */
function oldSh(){return !P.profile.bash&&(P.profile.perror||!P.profile.csh)} /* V7's sh, and 4.3BSD's, which is V7's; IRIX's is System V's */
function shErr(x){P.failed(x)} /* the Bourne shell's failed(): the rest of the line does not run */
function stoi(x){var m=/^\d+/.exec(x);if(!m){shErr(x+': bad number');return null}return +m[0]} /* V7's stoi: its leading digits */
function bashN(name,a,fatal){ /* bash's get_numeric_arg: null after an error (fatal: the line ends, as break's does) */
  var x=a[0];
  function no(m){if(fatal)P.failed(P.bashAt()+name+': '+m);else{P.typeLine(P.bashAt()+name+': '+m,'err');P.status(1)}return null}
  if(a.length>1)return no('too many arguments');
  if(!/^\s*[-+]?\d+\s*$/.test(x))return no(x+': numeric argument required');
  return parseInt(x,10);
}
function loopN(what,a){ /* break [n], continue [n]: bash's, and the Bourne shell's; csh's take no n, and V7's continue ignores one (xec.c) */
  if(P.profile.bash&&!dash()&&!P.loops()){P.typeLine(P.bashAt()+what+": only meaningful in a `for', `while', or `until' loop",'err');P.queue(function(){P.status(0)});return} /* bash's check_loop_level, before it reads n: no loop here, as at the prompt or in a ( ) (loop_level = 0) */
  if(cshNow()||a[0]===undefined||(what==='continue'&&oldSh())){P.loop(what);return}
  if(!P.profile.bash&&!P.loops())return; /* the Bourne shell reads n only inside a loop (xec.c: execbrk=loopcnt, and stoi only then) */
  var n=P.profile.bash?bashN(what,a,true):stoi(a[0]);
  if(n===null)return;
  if(P.profile.bash&&n<1){P.typeLine(P.bashAt()+what+': '+a[0]+': loop count out of range','err');P.status(1);P.loop('break',1e9);return} /* bash: out of every loop */
  P.loop(what,Math.max(n,1)); /* sh: break 0 is break 1 */
}
builtin(['break'],function(a){loopN('break',a)});
builtin(['continue'],function(a){loopN('continue',a)});
builtin(['.'],function(a,raw,words){ /* . file: its commands, read and run by this shell. bash's (and its source): . file [arguments], looked for
                                          along PATH and then here; V7's: no arguments, along PATH, and failed() when it is not there */
  if(cshNow()){P.typeLine(P.profile.notFound.replace('%s',words[0]),'err');return}
  var bash=P.profile.bash,me=words[0],f=words[1];
  function no(m,st){P.typeLine(m,'err');P.status(st||1)}
  if(f===undefined){if(bash){no(P.bashAt()+me+': filename argument required');P.typeLine(me+': usage: '+me+' filename [arguments]','err');P.queue(function(){P.status(2)})}return}
  var at=f.indexOf('/')>=0?[f]:(P.env.PATH||'').split(':').map(function(d){return (d||'.')+'/'+f}).concat(bash?[f]:[]),n=null,i;
  for(i=0;i<at.length;i++){var x=P.unread(P.find(at[i]));if(x&&(x.type!=='d'||f.indexOf('/')>=0)){n=x;break}}
  if(!n){if(bash)no(P.bashAt()+f+': No such file or directory');else shErr(f+': not found');return}
  if(n.type==='d'){if(bash)no(P.bashAt()+me+': '+f+': is a directory');else shErr(f+': not found');return}
  if(n.prot){if(dash())no(P.bashAt()+me+': cannot open '+f+': Permission denied',2);else if(bash)no(P.bashAt()+f+': Permission denied');else shErr(f+': not found');return} /* dash: sh: 1: .: cannot open f: Permission denied */
  P.runScript(P.text(n),bash&&words.length>2?words.slice(2):undefined,{name:f});
});
builtin(['shift'],function(a){
  if(cshNow()){ /* csh's doshift: shift [variable], argv when none */
    var k=a[0]||'argv';
    if(k==='argv'){var A=P.args();if(A.length<2){shErr('shift: No more words.');return}A.splice(1,1);P.status(0);return}
    if(!P.has(P.shvars,k)){shErr(k+': Undefined variable.');return}
    var w=P.shwords[k],L=(w&&w.s===P.shvars[k]?w.w:P.shvars[k].split(/\s+/).filter(Boolean)).slice();
    if(!L.length){shErr('shift: No more words.');return}
    L.shift();P.shvars[k]=L.join(' ');P.shwords[k]={s:P.shvars[k],w:L};P.status(0);return;
  }
  var A=P.args(),have=Math.max(A.length-1,0);
  if(P.profile.bash){ /* bash: shift [n]; more than $# fails and says nothing */
    var n=a.length?bashN('shift',a,false):1;
    if(n===null)return;
    if(n<0){P.typeLine(P.bashAt()+'shift: '+a[0]+': shift count out of range','err');P.status(1);return}
    if(n>have){if(dash()){P.failed(P.bashAt()+"shift: can't shift that many",2);return}P.status(1);return} /* dash: an error that ends the line */
    A.splice(1,n);P.status(0);return;
  }
  var m=oldSh()||!a.length?1:stoi(a[0]); /* V7's shift takes no n; System V's takes one */
  if(m===null)return;
  if(m>have){shErr('cannot shift');return}
  A.splice(1,m);P.status(0);
});
builtin(['read'],function(a,raw,words){
  var N=words.slice(1),S=P.stdin(),bash=P.profile.bash,o={},ID=/^[A-Za-z_]\w*$/;
  if(bash){ /* bash's options: -r keeps backslashes, -p its prompt (at the terminal), -s does not echo; the rest are taken and set aside */
    var USE='read: usage: read [-ers] [-a array] [-d delim] [-i text] [-n nchars] [-N nchars] [-p prompt] [-t timeout] [-u fd] [name ...]';
    while(N.length&&/^-./.test(N[0])){
      var x=N.shift();
      if(x==='--')break;
      for(var j=1;j<x.length;j++){
        var ch=x.charAt(j);
        if('adinNptu'.indexOf(ch)>=0){
          var v=j+1<x.length?x.slice(j+1):N.shift();
          if(v===undefined){P.typeLine('bash: read: -'+ch+': option requires an argument','err');P.typeLine(USE,'err');P.queue(function(){P.status(2)});return}
          o[ch]=v;break;
        }
        if('ers'.indexOf(ch)<0){P.typeLine('bash: read: -'+ch+': invalid option','err');P.typeLine(USE,'err');P.queue(function(){P.status(2)});return}
        o[ch]=true;
      }
    }
  }
  if(dash()&&!N.length){P.typeLine(P.bashAt()+'read: arg count','err');P.status(2);return} /* dash's read needs a name */
  function notId(k){if(bash){P.typeLine('bash: read: `'+k+"': not a valid identifier",'err');P.status(1)}else P.failed(k+': is not an identifier')}
  if(N.length&&!ID.test(N[0])){notId(N[0]);return} /* the first name is looked at before it reads (V7's readvar, bash's read) */
  var esc=!(bash&&o.r),C=[],eof=false,more=false,cut=false; /* C: the line's characters, {c, q}: q when a backslash quoted it; more: a line that goes on */
  function next(then){ /* cut: the input ended in the middle of this line, with no newline: it is read, and read still says end of input (bash, V7's readvar) */
    if(S){var l=S.length?S.shift():null;if(l!==null&&!S.length&&S.open){S.open=false;cut=true}then(l)}else P.ask(o.p===undefined||more?null:o.p,then,false,!!o.s)} /* a pipe or <: its next line; else the keyboard (the prompt only once) */
  next(got);
  function got(line){
    if(line===null)eof=true;
    else{
      for(var k=0;k<line.length;k++){
        var ch=line.charAt(k);
        if(ch!=='\\'||!esc){C.push({c:ch});continue}
        if(k===line.length-1){more=true;next(got);return} /* a backslash at the end: the line goes on in the next one (nextc's \ newline) */
        C.push({c:line.charAt(++k),q:true});
      }
      if(cut)eof=true;
    }
    if(eof&&!C.length){N.forEach(function(k){if(ID.test(k))P.env[k]=''});if(bash&&!N.length)P.env.REPLY='';P.status(1);return} /* end of input: each name is set to nothing (V7's readvar, bash's read) */
    var all=C.map(function(x){return x.c}).join('');
    if(bash&&!N.length){P.env.REPLY=all;P.status(eof?1:0);return} /* no name: the line as it is, in REPLY */
    for(var i=0;i<N.length;i++)if(!ID.test(N[i])){notId(N[i]);return}
    var V=N.map(function(){return ''}),j=0,n=0;
    if(bash){ /* bash's read.def and get_word_from_string: a word ends at an IFS character, with the IFS white space around it, and runs
                 of that white space are one break; the last name takes the rest, less the IFS white space at its end, unless that rest
                 is one word and its break. Leading IFS white space goes; a character a backslash quoted is never a break */
      var ifs=typeof P.env.IFS==='string'?P.env.IFS:' \t\n',sep=function(x){return !!x&&!x.q&&ifs.indexOf(x.c)>=0},ws=function(x){return sep(x)&&/[ \t\n]/.test(x.c)};
      var word=function(){ /* the next word from j, and j past its break */
        while(ws(C[j]))j++;
        var w='';while(j<C.length&&!sep(C[j]))w+=C[j++].c;
        var white=ws(C[j]);if(j<C.length)j++;
        while(ws(C[j]))j++;
        if(white&&sep(C[j])&&!ws(C[j])){j++;while(ws(C[j]))j++} /* white space, then one other IFS character: one break */
        return w;
      };
      while(ws(C[j]))j++;
      for(;n<N.length-1;n++)V[n]=j<C.length?word():'';
      if(j<C.length){
        var at=j,w1=word();
        if(j<C.length){var e=C.length;while(e>at&&ws(C[e-1]))e--;for(V[n]='';at<e;at++)V[n]+=C[at].c}
        else V[n]=w1;
      }
    }
    else{ /* V7's readvar: while names are left, every IFS character ends a word, leading ones too; the last name takes the rest as it is */
      var ifs=typeof P.env.IFS==='string'?P.env.IFS:' \t\n';
      for(;j<C.length;j++){
        if(n<N.length-1&&!C[j].q&&ifs.indexOf(C[j].c)>=0)n++;
        else V[n]+=C[j].c;
      }
    }
    N.forEach(function(k,i){P.env[k]=V[i]});
    P.status(eof?1:0);
  }
});
function testExpr(w,name){ /* name: the command's, for bash's error; a number bash cannot read is thrown as {bad} */
  function num(x){
    if(!P.profile.bash){var v=parseInt(x,10);return isNaN(v)?0:v} /* V7's test.c: atoi, so a word that is not a number is 0 */
    if(dash()&&(x===undefined||!/^\s*[-+]?\d+\s*$/.test(x)))throw {bad:P.bashAt()+name+': Illegal number: '+(x===undefined?'':x)};
    if(x===undefined||!/^\s*[-+]?\d+\s*$/.test(x))throw {bad:P.bashAt()+name+': '+(x===undefined?'':x)+': integer expression expected'};
    return parseInt(x,10);
  }
  function one(i){
    var t=w[i];
    if(t==='!'){var r=one(i+1);return {v:!r.v,i:r.i}}
    if(P.profile.bash&&/^-[hL]$/.test(t)&&w[i+1]!==undefined){var l=P.find(w[i+1],true,false,true);return {v:!!l&&l.type==='s',i:i+2}} /* bash: a symbolic link (lstat); V7's and 4.3BSD's test had no -h */
    if(/^-[frwdszn]$/.test(t)||t==='-x'&&(P.profile.bash||P.profile.sysv)){ /* -x: not in V7's test, nor 4.3BSD's */
      var x=w[i+1],n=x===undefined?null:P.named(x);
      if(t==='-z')return {v:!x,i:i+2};
      if(t==='-n')return {v:!!x,i:i+2};
      if(t==='-d')return {v:!!n&&n.type==='d',i:i+2};
      if(t==='-f')return {v:!!n&&n.type!=='d',i:i+2};
      if(t==='-s')return {v:!!n&&P.fsize(n)>0,i:i+2};
      return {v:P.access(n,t.charAt(1)),i:i+2}; /* -r -w -x: access(2), what its mode lets who is logged in do */
    }
    var op=w[i+1],y=w[i+2];
    if(op==='=='&&P.profile.bash){if(dash())throw {bad:P.bashAt()+name+': '+t+': unexpected operator'};op='='} /* bash's ==; dash's test has none */
    if(op==='='||op==='!=')return {v:(t===y)===(op==='='),i:i+3};
    if(/^-(eq|ne|lt|le|gt|ge)$/.test(op||'')){
      var a=num(t),b=num(y);
      return {v:{'-eq':a===b,'-ne':a!==b,'-lt':a<b,'-le':a<=b,'-gt':a>b,'-ge':a>=b}[op],i:i+3};
    }
    return {v:!!t,i:i+1};
  }
  if(!w.length)return false;
  var r=one(0);
  while(r.i<w.length){
    var c=w[r.i],q=one(r.i+1);
    r={v:c==='-o'?r.v||q.v:r.v&&q.v,i:q.i};
  }
  return r.v;
}
cmd('test','check a condition','test expr',['succeeds or fails, and says nothing. -f file, -d folder, -r readable, -w writable, -s not empty, -z or -n a string, = and != strings, -eq -ne -lt -le -gt -ge numbers, ! not, -a and, -o or. a string on its own is true if it is not empty.','','[ expr ], with the ] as its own last word, is the same as test expr.'],function(a,raw,words){runTest(words.slice(1),'test')},true);
function runTest(w,name){try{P.status(testExpr(w,name)?0:1)}catch(e){if(!e||!e.bad)throw e;P.typeLine(e.bad,'err');P.queue(function(){P.status(2)})}}
builtin(['['],function(a,raw,words){
  var w=words.slice(1);
  if(w[w.length-1]!==']'){P.typeLine('[: missing ]','err');return}
  runTest(w.slice(0,-1),'[');
});
cmd('expr','evaluate an expression','expr arg ...','prints the value. + - * / % and comparisons, spaces between everything.',function(a,raw,words){
  var w=words.slice(1),v=w[0];
  if(P.profile.perror&&!w.length){P.typeLine('syntax error','err');return}
  for(var i=1;i<w.length;i+=2){
    var o=w[i],x=w[i+1],n=parseInt(v,10),m=parseInt(x,10);
    if(x===undefined||(/^[-+*\/%]$/.test(o)&&(isNaN(n)||isNaN(m)))){P.typeLine('expr: syntax error','err');return}
    var ops={'+':n+m,'-':n-m,'*':n*m,'/':m?Math.trunc(n/m):0,'%':m?n%m:0, /* the old machines just said 0 */
'=':v===x?1:0,'!=':v!==x?1:0,'<':n<m?1:0,'>':n>m?1:0,'<=':n<=m?1:0,'>=':n>=m?1:0};
    v=P.has(ops,o)?ops[o]:undefined;
    if(v===undefined){P.typeLine('expr: syntax error','err');return}
  }
  P.typeLine(String(v));
  P.status(String(v)==='0'||v===''?1:0);
});
function showEnv(){
  P.say(['HOME='+P.st.home,'LOGNAME='+P.st.user].concat(P.envRows()));
}
cmd('printenv','print the environment','printenv [ name ]','prints the environment, or the one variable named.',function(a){
  if(!a[0]){showEnv();return}
  if(P.has(P.env,a[0]))P.typeLine(P.env[a[0]]);
});
cmd('set','print the shell variables','set',function(pr){ /* the page of csh's set (csh.js) and bash's (machines/linux) too */
  if(pr.csh)return ['set [ name [ = word ] ] ...',['prints the variables the shell knows about.','',
    'set name   sets name to the null string.',
    'set name = word   sets name to the single word.',
    'set name = ( wordlist )   sets name to the list of words in wordlist; file names in it are expanded.',
    'several may be given on one line.'].concat(pr.perror?['','in a bourne shell (sh), set only prints its variables.']:[])];
  if(pr.bash)return ['set [-abefhkmnptuvxBCEHPT] [-o option-name] [--] [-] [arg ...]',['with no arguments, prints the variables the shell knows about.','',
    'the options, and -o with an option name, are taken and change nothing here.',
    '--   assign any remaining arguments to the positional parameters.',
    '-    the same, when arguments follow it.',
    'arg ...   the first word that is not an option, and those after it, become the positional parameters $1, $2 ... ($# and $@).']];
  return [null,['prints the variables the shell knows about.']];
},function(a){ /* the Bourne shell's: set [ -flags [ arg ... ] ] (V7's xec.c SYSSET and args.c options): the flags are taken and change nothing here; the args become $1 ... */
  if(!a.length){var h=P.homeVar();P.say((h===null||P.has(P.env,'HOME')?[]:['HOME='+h]).concat(['IFS=','LOGNAME='+P.st.user,'PS1=$ ','PS2=> ']).concat(P.envRows()));return} /* HOME: not when it is unset (Debian), nor twice when it is a variable */
  var r=a.slice();
  if(r[0].charAt(0)==='-'){
    var f=r.shift();
    if(!(f==='--'&&!oldSh())&&/[^xnvtsierku]/.test(f.slice(1))){shErr(f+': bad option(s)');return} /* -- ends the flags on System V's sh */
  }
  if(r.length)P.args([P.args()[0]].concat(r));
  P.status(0);
});
cmd('ln','make a link','ln target [ newname ]',function(pr){
  var v7=!pr.perror&&!pr.csh,D=['gives a file a second name. they are the same file.'];
  return v7?[null,D]:['ln [ -s ] target [ newname ]',D.concat(['','-s   makes a symbolic link instead: a name that holds the path of target, which is followed wherever the name is used. target need not exist, and a relative one is taken from the folder the link is in.'])];
},function(a){
  var v7=!P.profile.perror&&!P.profile.csh,bsd=P.profile.perror;
  if(!v7&&a[0]==='-s'&&a.length>1){ /* 4.3BSD's ln -s (symlink(2)), and System V's on IRIX: the new name holds the path as given */
    var tail=a[1].split('/').pop(),name=a[2]||tail,at=P.norm(name),d=P.find(at);
    if(d&&d.type==='d'){name=name.replace(/\/+$/,'')+'/'+tail;at=P.norm(name)} /* into a folder: its last name */
    var ex=P.find(at,true,false,true);
    if(a[1].length>1023){P.typeLine(bsd?name+': File name too long':'ln: cannot create '+name,'err');return} /* symlink(2): a path of MAXPATHLEN (1024) or more is ENAMETOOLONG */
    if(ex||!P.canWrite(at)){if(!bsd)P.typeLine('ln: cannot create '+name,'err');else if(ex)P.typeLine(name+': File exists','err');else P.oopsW('',name);return} /* 4.3BSD: perror(to) */
    P.symlink(at,a[1],'lrwxr-xr-x'); /* 0777 less the umask */
    return;
  }
  if(!a.length){P.say(P.profile.perror?['Usage: ln [ -s ] f1','or: ln [ -s ] f1 f2','ln [ -s ] f1 ... fn d2']:['Usage: ln target [ newname ]']);return}
  var n=P.named(a[0]),to=P.norm(a[1]||a[0].split('/').pop());
  if(!n&&!v7&&!bsd){P.typeLine('ln: cannot access '+a[0],'err');return} /* System V's cp/mv/ln (SysIII and SVR2 mv.c, and Solaris's): stat() of the source failed */
  if(!n||n.type==='d'||n.prot){P.typeLine('ln: can\'t link '+a[0],'err');return}
  var ex=P.find(to,true);
  if(!ex&&(P.isImmutable(n)||P.immutable(to))){P.notPermitted('ln',a[1]||a[0].split('/').pop(),a[0]);return} /* no hard link to an immutable file, nor in an immutable folder */
  if(ex||!P.canWrite(to)){P.typeLine('ln: cannot create '+(a[1]||a[0]),'err');return}
  var dir=P.find(P.dirOf(to),true);
  dir.kids[to.split('/').pop()]=n;
});
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
