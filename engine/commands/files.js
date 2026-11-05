/* PHOSPHOR-9 terminal: file commands (ls, cat, cd, pwd).
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE.

   Each Phosphor.command({...}) adds one command:
     names   first name is the real one, the rest are synonyms
     help    one line for the help list (leave out to hide the command)
     path    where its program file appears in the file tree (/bin/ls)
     man     the manual page: what, syn (synopsis), desc and bugs (lists of lines)
     run     function(args, rawLine): args are lowercased words after the name
     enabled optional function(profile): return false to leave the command out
     hidden  true to keep it out of help (xyzzy)
   Everything the engine offers is on window.Phosphor (P below), e.g. P.say, P.find. */
(function(P){
'use strict';

P.command({names:['ls'],core:true,help:'list files',path:'/bin',
  man:{what:'list contents of directory',syn:'ls [ -la ] [ name ... ]',desc:[
    'for each folder named, lists its contents; for each file, repeats its name. with no name, lists the working directory, in alphabetical order.',
    '',
    '-l   long listing: mode, links, owner, size in bytes and the time of last change.',
    '-a   also list names beginning with a dot, which are otherwise hidden. this includes . and .., the folder itself and the one above it.']},
  run:function(a){
    var fl=a.filter(function(x){return x.charAt(0)==='-'}).join(''),long=/l/.test(fl),all=/a/.test(fl),
        want=a.filter(function(x){return x.charAt(0)!=='-'}),L=[],dirs=[];
    if(!want.length)want=['.'];
    want.forEach(function(w){
      var n=P.find(w),shown;
      if(!n)L.push([w+' not found','err']);
      else if(n.type!=='d'){shown=w.replace(/[^\/]*(\/\.?)*$/,n.name);L.push(long?P.longRow(shown,n):shown)}
      else if(n.prot)L.push([w+' unreadable','err']);
      else dirs.push([w,n]);
    });
    dirs.forEach(function(d){
      var n=d[1],ents=Object.keys(n.kids).filter(function(k){return all||k.charAt(0)!=='.'}).sort()
        .map(function(k){return [k,n.kids[k]]});
      if(all)ents=[['.',n],['..',n.parent]].concat(ents);
      if(want.length>1){if(L.length)L.push('');L.push(d[0]+':')}
      if(long){var t=0;ents.forEach(function(e){t+=Math.ceil(P.fsize(e[1])/512)});L.push('total '+t)}
      ents.forEach(function(e){L.push(long?P.longRow(e[0],e[1]):e[0])});
    });
    P.say(L);
  }});

P.command({names:['cat'],core:true,help:'print a file',path:'/bin',
  man:{what:'catenate and print',syn:'cat file ...',desc:[
    'prints each file in turn.',
    '',
    'locked files cannot be opened, and neither can folders.'],bugs:[
    'cat of a program prints exactly what you deserve.']},
  run:function(a){
    if(!a.length){P.input([],function(L){P.say(L)});return} /* its pipe, or the keyboard until ^D */
    a.forEach(function(x){
      var n=P.find(x);
      if(!n||n.prot||n.type==='d')P.typeLine("cat: can't open "+x,'err');
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
    if(!n||n.type!=='d'||n.prot){P.typeLine(t+': bad directory','err');return}
    P.st.cwd=P.pathOf(n);
  }});

P.command({names:['pwd'],core:true,path:'/bin',
  man:{what:'print working directory',syn:'pwd',desc:[
    'prints the full name of the working directory.']},
  run:function(){P.typeLine(P.st.cwd)}});

})(window.Phosphor);
