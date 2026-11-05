/* PHOSPHOR-9 terminal: what csh and Berkeley brought (history, finger, w), on machines with "csh: yes".
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE. */
(function(P){
'use strict';
function on(p){return p.csh}
P.command({names:['history'],noHelpFlag:true,enabled:on,run:function(){
  P.say(P.hist().map(function(l,i){return String(i+1).padStart(6)+'  '+l}));
}});
P.command({names:['finger'],path:'/usr/ucb',enabled:on,
  man:{what:'user information lookup program',syn:'finger [ name ... ]',desc:['prints who is logged in, or what is known about the name given.']},
  run:function(a){
    var S=P.st;
    if(!a.length){
      P.say(['Login       Name              TTY Idle    When            Office'].concat([
        [S.owner,'the operator','co','1:02',P.short(P.fileDate)],[S.user,'visitor','02','',P.short(S.login)]
      ].map(function(r){return r[0].padEnd(12)+r[1].padEnd(18)+r[2].padEnd(4)+r[3].padEnd(8)+r[4]})));
      return;
    }
    a.forEach(function(x){
      var known=x===S.owner||x===S.user||x==='root';
      if(!known){P.typeLine('finger: '+x+': no such user.');return}
      P.say(['Login name: '+x.padEnd(24)+'In real life: '+(x==='root'?'Charlie Root':x===S.user?'visitor':'the operator'),
        'Directory: '+(x==='root'?'/':P.profile.homes+'/'+x).padEnd(25)+'Shell: /bin/csh',x===S.user?'On since '+P.short(S.login)+' on tty02':'Last login '+P.short(P.fileDate),'No Plan.']);
    });
  }});
P.command({names:['w'],path:'/usr/ucb',enabled:on,
  man:{what:'who is on and what they are doing',syn:'w',desc:['prints the time, how long the machine has been up, who is on, and what they are doing.']},
  run:function(){
    var S=P.st;
    var up=Math.floor((P.now()-P.systemDate)/6e4);
    P.say(['  '+P.short(P.now()).slice(7)+'  up '+Math.floor(up/1440)+' days, '+Math.floor(up%1440/60)+':'+P.p2(up%60)+',  2 users,  load average: 0.08, 0.03, 0.01',
      'User     tty       login@  idle   JCPU   PCPU  what',
      S.owner.padEnd(9)+'console  '+P.short(P.fileDate).slice(7)+'   1:02     12      3  -csh',
      S.user.padEnd(9)+'tty02    '+P.short(S.login).slice(7)+'             1      1  w']);
  }});
/* the shell's own variables, and the rest of what it does for itself */
function builtin(names,run){P.command({names:names,noHelpFlag:true,enabled:on,run:run})}
builtin(['set'],function(a,raw){
  var t=raw.replace(/^\s*set\s*/,''),m;
  if(!t){
    var V={argv:'()',cwd:P.st.cwd,home:P.st.home,path:'('+(P.env.PATH||'').replace(/:/g,' ')+')',prompt:'% ',shell:'/bin/csh',status:'0',term:P.env.TERM,user:P.st.user};
    Object.keys(P.shvars).forEach(function(k){V[k]=P.shvars[k]});
    P.say(Object.keys(V).sort().map(function(k){return k+'\t'+V[k]}));
    return;
  }
  while((m=/^([A-Za-z_]\w*)\s*(?:=\s*("[^"]*"|'[^']*'|\([^)]*\)|\S*))?\s*/.exec(t))&&m[0]){P.shvars[m[1]]=P.unquote(m[2]||'');t=t.slice(m[0].length)}
  if(t)P.typeLine('set: Syntax error.','err');
});
builtin(['unset'],function(a){if(!a.length){P.typeLine('unset: Too few arguments.','err');return}a.forEach(function(k){delete P.shvars[k]})});
builtin(['setenv'],function(a){
  if(!a.length){P.say(Object.keys(P.env).map(function(k){return k+'='+P.env[k]}));return}
  P.env[a[0]]=a.slice(1).join(' ');
});
builtin(['unsetenv'],function(a){if(!a.length){P.typeLine('unsetenv: Too few arguments.','err');return}delete P.env[a[0]]});
builtin(['unalias'],function(a){
  if(!a.length){P.typeLine('unalias: Too few arguments.','err');return}
  P.aliases=P.aliases.filter(function(x){return a.indexOf(x.from.join(' '))<0});
});
builtin(['if'],function(a,raw){ /* the one-line form: if (expr) command */
  var m=/^\s*if\s*\((.*?)\)\s*(.*)$/.exec(raw);
  if(!m||/^then\b/.test(m[2])){P.typeLine('if: Expression syntax.','err');return}
  var e=m[1].trim(),q,yes;
  if((q=/^(.*?)\s*(==|!=)\s*(.*)$/.exec(e)))yes=(P.unquote(q[1])===P.unquote(q[3]))===(q[2]==='==');
  else if((q=/^(!?)\s*-([edfrwx])\s+(\S+)$/.exec(e))){
    var n=P.find(q[3]);
    yes=!!n&&(q[2]!=='d'||n.type==='d')&&(q[2]!=='f'||n.type!=='d');
    if(q[1])yes=!yes;
  }
  else if((q=/^!\s*(-?\d+)$/.exec(e)))yes=+q[1]===0;
  else if(/^-?\d+$/.test(e))yes=+e!==0;
  else{P.typeLine('if: Expression syntax.','err');return}
  if(yes&&m[2])P.exec(m[2]); /* a command like any other: exit here logs you out */
});
builtin(['rehash','jobs','nice','sync'],function(){});
builtin(['fg','bg'],function(a,raw){P.typeLine(raw.trim().split(/\s+/)[0]+': No current job.','err')});
builtin(['kill'],function(a){
  var w=a.filter(function(x){return x.charAt(0)!=='-'});
  if(!w.length){P.typeLine('kill: Too few arguments.','err');return}
  w.forEach(function(x){P.typeLine(/^%/.test(x)?'kill: '+x+': No such job.':/^\d+$/.test(x)?'kill: '+x+': No such process':'kill: Arguments should be jobs or process id\'s.','err')});
});
builtin(['limit'],function(){
  P.say(['cputime         unlimited','filesize        unlimited','datasize        6144 kbytes','stacksize       512 kbytes','coredumpsize    unlimited','memoryuse       6819 kbytes']);
});
function perror(p){return p.csh&&p.perror} /* these came with Berkeley, not with every csh */
function place(x){
  var d=P.has(P.paths,x)&&P.paths[x];
  return d?d+'/'+x:(P.env.PATH||'').split(':').map(function(o){return (o||'.')+'/'+x}).filter(function(f){return (function(n){return n&&n.type!=='d'&&n.bin})(P.find(f))})[0];
}
P.command({names:['which'],path:'/usr/ucb',noHelpFlag:true,enabled:perror,run:function(a){
  a.forEach(function(x){
    var al=P.aliases.filter(function(y){return y.from.join(' ')===x})[0],f=al?null:place(x);
    P.typeLine(al?x+':\t aliased to '+al.to:f||'no '+x+' in '+(P.env.PATH||'').split(':').map(function(o){return o||'.'}).join(' '));
  });
}});
P.command({names:['whereis'],path:'/usr/ucb',noHelpFlag:true,enabled:perror,run:function(a){
  a.forEach(function(x){var f=place(x);P.typeLine(x+':'+(f?' '+f:'')+(P.has(P.man,x)?' /usr/man/man1/'+x+'.1':''))});
}});
P.command({names:['apropos'],path:'/usr/ucb',noHelpFlag:true,enabled:perror,run:function(a){
  if(!a.length){P.typeLine('apropos what?');return}
  a.forEach(function(x){
    var hits=Object.keys(P.man).sort().filter(function(k){return k.indexOf(x)>=0||(P.man[k].what||'').indexOf(x)>=0});
    if(!hits.length){P.typeLine(x+': nothing appropriate');return}
    P.say(hits.map(function(k){return k+' (1)'.padEnd(10)+' - '+P.man[k].what}));
  });
}});
P.command({names:['last'],path:'/usr/ucb',noHelpFlag:true,enabled:perror,run:function(){
  var S=P.st;
  function when(d){return P.ctime(d).slice(0,16)}
  P.say([S.user.padEnd(10)+'tty02'.padEnd(26)+when(S.login)+'   still logged in',S.owner.slice(0,8).padEnd(10)+'console'.padEnd(26)+when(P.fileDate)+'   still logged in','','wtmp begins '+when(P.systemDate)]);
}});
})(window.Phosphor);
