/* PHOSPHOR-9 terminal: file commands (ls, cat, cd, pwd).
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE.

   Each Phosphor.command({...}) adds one command:
     names   first name is the real one, the rest are synonyms
     help    one line for the help list (leave out to hide the command)
     path    where its program file appears in the file tree (/bin/ls)
     man     the manual page: what, syn (synopsis), desc and bugs (lists of lines), or function(profile) giving them
     run     function(args, rawLine): args are lowercased words after the name
     enabled optional function(profile): return false to leave the command out
     hidden  true to keep it out of help (xyzzy)
   Everything the engine offers is on window.Phosphor (P below), e.g. P.say, P.find. */
(function(P){
'use strict';

P.command({names:['ls'],core:true,help:'list files',path:'/bin',
  man:function(pr){ /* V7's ls has no -R; 4.3BSD's and System V's (IRIX) have */
    var v7=!pr.perror&&!pr.csh;
    return {what:'list contents of directory',syn:v7?'ls [ -ladsi ] [ name ... ]':'ls [ -ladsiFR ] [ name ... ]',desc:[
    'for each folder named, lists its contents; for each file, repeats its name. with no name, lists the working directory, in alphabetical order. the files named come first, then the folders, each in alphabetical order.',
    '',
    '-l   long listing: mode, links, owner, size in bytes and the time of last change.',
    '-d   for a folder, list the folder itself and not what is in it.',
    '-a   also list names beginning with a dot, which are otherwise hidden. this includes . and .., the folder itself and the one above it.',
    pr.perror?'-s   give the size of each file in kilobytes, before its name, and the total for each folder.':'-s   give the size of each file in 512-byte blocks, before its name, and the total for each folder.',
    '-i   for each file, print the i-number in the first column of the report.'].concat(v7?[]:[
    '-F   mark folders with a trailing / and executable files with a trailing *.',
    '-R   recursively list the folders found, each after a blank line and its name, then the folders in it, before the next.'])}},
  run:function(a){
    /* the ls of V7, 4.3BSD or IRIX (System V's). V7's skips a letter it does not know, -F and -R among them, and takes only its first word
       as options: any after it are names (ls -l -a: "-a not found") */
    var bsd=P.profile.perror,v7=!bsd&&!P.profile.csh,sys5=!bsd&&!v7,first=v7&&a.length&&a[0].charAt(0)==='-'?a[0]:'';
    var fl=v7?first:a.filter(function(x){return x.charAt(0)==='-'}).join(''),long=/l/.test(fl),all=/a/.test(fl),self=/d/.test(fl),typed=!v7&&/F/.test(fl),blocks=/s/.test(fl),inodes=/i/.test(fl),
        rec=!v7&&/R/.test(fl),want=v7?a.slice(first?1:0):a.filter(function(x){return x.charAt(0)!=='-'}),L=[],dirs=[];
    if(!want.length)want=['.'];
    function plain(name,n){ /* -i the inode, -s the size: 4.3BSD's in kilobytes, V7's (nblock()) and System V's (st_blocks) in 512-byte blocks; -F a mark for what it is */
      return (inodes?String(P.ino(name)).padStart(5)+' ':'')+(blocks?String(Math.ceil(P.fsize(n)/(bsd?1024:512))).padStart(4)+' ':'')+name+
        (!typed?'':n.type==='s'?'@':n.type==='d'?'/':n.bin||/^-..x/.test(n.mode||'')?'*':'');
    }
    function shut(n){return n.prot||!P.may(n,'r')} /* a folder it cannot read */
    function across(names){ /* Berkeley's ls on a terminal: columns, reading down */
      return !P.profile.perror||P.piped()||!names.length?names:P.inColumns(names);
    }
    function sub(dir,k){ /* the name of a folder inside dir: 4.3BSD's cat() leaves off a dir of ".", System V's makename() keeps it ("./src") */
      return bsd&&(dir==='.'||dir==='')?k:dir+(/\/$/.test(dir)?'':'/')+k;
    }
    /* the names given are looked at first, each one not found said there and then; then they are sorted (compar(), fcmp()): files
       before folders, each by name, and with -d all of them by name together */
    var F=[];
    want.forEach(function(w){
      var n=P.find(w),l=P.find(w,true,true,true),isLink=l&&l.type==='s'&&!/\/$/.test(w)&&(long||!n||n.type!=='d'); /* a symbolic link: lstat's, unless it names a folder and there is no -l */
      if(!isLink&&!n){L.push([w+' not found','err']);return}
      F.push({w:w,n:isLink?l:n,link:isLink,dir:!isLink&&!self&&n.type==='d'});
    });
    F.sort(function(x,y){return x.dir!==y.dir?(x.dir?1:-1):x.w<y.w?-1:x.w>y.w?1:0});
    var files=[];
    F.forEach(function(f){
      var w=f.w,n=f.n,shown;
      if(f.link||n.type==='d'&&!f.dir)files.push(long?P.longRow(w,n):plain(w,n));
      else if(!f.dir){var abs=P.norm(w),key=abs.split('/').pop(),up=P.find(P.dirOf(abs),true);shown=w.replace(/[^\/]*(\/\.?)*$/,up&&up.kids&&up.kids[key]===n?key:n.name);files.push(long?P.longRow(shown,n):plain(shown,n))}
      else dirs.push([v7?w:w.replace(/^~(?=\/|$)/,P.st.home),n]);
    });
    L=L.concat(long?files:across(files)); /* 4.3BSD's formatf: in columns on a terminal, as a folder's are */
    /* -R: after a folder, the folders in it, each in full before the next (4.3BSD's subdirs list, System V's dfirst chain), never . or ..;
       the folders named are titled only when there are more than one. The shell gave ls ~ as the home folder's name. A folder already
       on the way down (a loop) is not gone into again; a name longer than the system's limit stops it: 4.3BSD's cat() says
       "filename too long" and ls exits, System V's opendir fails as it would for a folder it cannot read */
    var todo=dirs.map(function(d){return {name:d[0],n:d[1],title:want.length>1}}).reverse();
    function gap(){ /* the blank line before a folder: V7's title always has one; 4.3BSD's and System V's only after something listed (not after what went to the error output) */
      if(v7||L.some(function(l){return !Array.isArray(l)||l[1]!=='err'}))L.push('');
    }
    while(todo.length){
      var d=todo.pop(),n=d.n,name=d.name;
      if(shut(n)){ /* 4.3BSD's getdir says so in place of the title; V7's readdir after it; System V's rddir after it, as it
                      cannot open it: "can not access directory" */
        if(bsd){if(d.up)L.push('');else gap();L.push([name+' unreadable','err']);continue}
        if(d.title){gap();L.push(name+':')}
        if(v7){L.push([name+' unreadable','err']);continue}
        L.push(['can not access directory '+name,'err']);continue;
      }
      var ents=Object.keys(n.kids).filter(function(k){return all||k.charAt(0)!=='.'}).sort()
        .map(function(k){return [k,n.kids[k]]});
      if(all)ents=[['.',n],['..',n.parent]].concat(ents);
      if(bsd&&ents.some(function(e){return name.length+e[0].length+2>1024})){L.push(['ls: filename too long','err']);P.status(1);break}
      if(d.title){gap();L.push(name+':')}
      if(long||blocks){ /* with -s too; in V7's and System V's 512-byte blocks, 4.3BSD's in kilobytes (kbytes(dbtob()) of the blocks all together) */
        var t=0;ents.forEach(function(e){t+=Math.ceil(P.fsize(e[1])/(bsd?1024:512))});L.push('total '+t);
      }
      if(long)ents.forEach(function(e){L.push(P.longRow(e[0],e[1]))});
      else L=L.concat(across(ents.map(function(e){return plain(e[0],e[1])})));
      if(!rec)continue;
      for(var i=ents.length-1;i>=0;i--){
        var k=ents[i][0],kid=ents[i][1],up=d,loop=false;
        if(kid.type!=='d'||k==='.'||k==='..')continue;
        for(;up&&!loop;up=up.up)loop=up.n===kid;
        if(loop)continue;
        var p=sub(name,k);
        todo.push({name:p,n:sys5&&p.length>1024?{prot:true}:kid,title:true,up:d});
      }
    }
    P.say(L);
  }});

P.command({names:['cat'],core:true,help:'print a file',path:'/bin',
  man:{what:'catenate and print',syn:'cat file ...',desc:[
    'prints each file in turn. with no file, it reads the standard input.',
    '',
    'locked files cannot be opened, and neither can folders.'],bugs:[
    'cat of a program prints exactly what you deserve.']},
  run:function(a){
    if(!a.length){P.input([],function(L){P.say(L)});return} /* its pipe, or the keyboard until ^D */
    a.forEach(function(x){
      var n=P.unread(P.find(x));
      if(!n||n.prot||n.type==='d')P.oops('',x,n,"cat: can't open "+x);
      else if(n.bin)P.typeLine('^G^A^@^@^D^P^@^@^@^@^@^@^A^@'+n.name+'^@^H^@^@','dim');
      else if(n.body)P.say(P.body(n));
    });
  }});

P.command({names:['cd'],core:true,help:'change directory',
  man:{what:'change working directory',syn:'cd [ dir ]',desc:[
    'makes dir the working directory. with no argument, goes home. understands ~, . and .. in any path.',
    '',
    'a locked folder is a bad directory.']},
  run:function(a){
    var t=a[0]||P.st.home,n=P.find(t);
    if(!n||n.type!=='d'||n.prot||!P.may(n,'x')){P.oops('',t,n&&!P.may(n,'x')?{prot:true}:n,t+': bad directory');P.failed(null);return} /* sh's failed(baddir) and csh's error(): the rest of the line does not run */
    P.st.cwd=P.pathOf(n);
  }});

P.command({names:['pwd'],core:true,path:'/bin',
  man:{what:'print working directory',syn:'pwd',desc:[
    'prints the full name of the working directory.']},
  run:function(a,raw,w){
    if(P.profile.bash){ /* bash's own pwd: -L the working directory as cd left it (the default), -P with no symbolic links in it */
      var phys=false;
      if(!P.bashOpts('pwd',(w||[]).slice(1),'PL','pwd [-LP]',function(c){phys=c==='P'}))return;
      var n=phys&&P.find(P.st.cwd);
      if(n){P.typeLine(P.pathOf(n));return}
    }
    P.typeLine(P.st.cwd);
  }});

})(window.Phosphor);
