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
function value(x){ /* a word as written, in pieces: 'as is', "with $variables", or bare, where \ keeps the next character */
  return x.trim().replace(/'([^']*)'|"([^"]*)"|\\(.)|([^'"\\]+|.)/g,function(m,sq,dq,bs,bare){
    return sq!==undefined?P.unguard(sq):dq!==undefined?P.vars(dq):bs!==undefined?P.unguard(bs):P.vars(bare);
  });
}
function listOf(k){var x=P.shwords[k];return x&&x.s===P.shvars[k]?x.w:null} /* the words set z = ( ) kept, while z is still that */
function store(k,L){P.shvars[k]=L.join(' ');P.shwords[k]={s:P.shvars[k],w:L}}
function restore(o,was){Object.keys(o).forEach(function(k){delete o[k]});Object.assign(o,was)}
function listVars(){ /* set, or @, on its own */
  var V=Object.assign(Object.create(null),{argv:'()',cwd:P.st.cwd,home:P.st.home,path:'('+(P.env.PATH||'').replace(/:/g,' ')+')',prompt:'% ',shell:'/bin/csh',status:'0',term:P.env.TERM,user:P.st.user});
  Object.keys(P.shvars).forEach(function(k){var x=listOf(k);V[k]=x&&x.length!==1?'('+x.join(' ')+')':P.shvars[k]}); /* a list of other than one word in ( ) */
  P.say(Object.keys(V).sort().map(function(k){return k+'\t'+V[k]}));
}
function said(e,as){ /* says an error csh reports: Undefined variable, or one of exp()'s with as (if) named in place of @. Anything else is thrown on */
  if(e&&e.undefinedVar)P.typeLine(e.msg||e.undefinedVar+': Undefined variable.','err');
  else if(e&&e.csh)P.typeLine((as?e.csh.replace(/^@/,as):e.csh)+'.','err');
  else throw e;
}
builtin(['set'],function(){
  P.status(P.lastStatus()); /* set s = $status: the one from before */
  var t=P.source().replace(/^\s*set\s*/,''),m;
  if(!t){listVars();return}
  try{
    while((m=/^([A-Za-z_]\w*)\s*(?:=\s*(\([^)]*\)|(?:"[^"]*"|'[^']*'|\\.|[^\s"'\\])*))?\s*/.exec(t))&&m[0]){
      delete P.shwords[m[1]];
      if(m[2]&&m[2].charAt(0)==='('){ /* ( 1 2 3 ): its words. A quoted word stays one; the rest split at blanks and match file names */
        var L=[];
        (m[2].slice(1,-1).match(/(?:"[^"]*"|'[^']*'|\\.|[^\s"'\\])+/g)||[]).forEach(function(x){
          if(/["'\\]/.test(x)){L.push(value(x));return}
          value(x).split(/\s+/).filter(Boolean).forEach(function(y){L=L.concat(P.glob(y))}); /* no match: the parser has said so */
        });
        store(m[1],L);
      }
      else P.shvars[m[1]]=value(m[2]||'');
      t=t.slice(m[0].length);
    }
  }catch(e){said(e);return}
  P.status(0);
  if(t)P.typeLine('set: Syntax error.','err');
});
builtin(['unset'],function(a){if(!a.length){P.typeLine('unset: Too few arguments.','err');return}a.forEach(function(k){delete P.shvars[k];delete P.shwords[k]})});
builtin(['setenv'],function(a){
  if(!a.length){P.say(Object.keys(P.env).map(function(k){return k+'='+P.env[k]}));return}
  P.env[a[0]]=a.slice(1).join(' ');
});
builtin(['unsetenv'],function(a){if(!a.length){P.typeLine('unsetenv: Too few arguments.','err');return}delete P.env[a[0]]});
builtin(['unalias'],function(a){
  if(!a.length){P.typeLine('unalias: Too few arguments.','err');return}
  var R=a.map(function(x){try{return P.globRe(x)}catch(e){return null}}); /* sh.func.c's unset1: each word a pattern (Gmatch), every alias it matches goes */
  P.aliases=P.aliases.filter(function(x){var k=x.from.join(' ');return !a.some(function(p,i){return p===k||R[i]&&R[i].test(k)})});
});
function closing(s,from){ /* the ) that matches, outside quotes */
  var depth=1,q=null;
  for(var i=from;i<s.length;i++){
    var c=s.charAt(i);
    if(q){if(c===q)q=null}
    else if(c==='\\')i++;
    else if(c==='"'||c==="'")q=c;
    else if(c==='(')depth++;
    else if(c===')'&&!--depth)return i;
  }
  return -1;
}
var QW='\uE0FF'; /* starts a word that was quoted, or holds a quote from a variable: csh's QUOTE bit, so that "==" or \) is no operator */
function unq(w){return w&&w.charAt(0)===QW?w.slice(1):w}
function lex(t){ /* the words of an expression, as csh's lexer makes them: < > & | ( ) are words of their own, and a quoted word stays
                   one word, "1 + 2" and all. raw: what each came from, for a { command } to run */
  var W=[],R=[];
  (t.match(/(?:"[^"]*"|'[^']*'|\\.|[^\s"'\\&|<>()])+|&&|\|\||<<|>>|[&|<>()]/g)||[]).forEach(function(x){
    if(/["']/.test(x.replace(/\\./g,''))){W.push(QW+value(x));R.push(x);return}
    var L=value(x).split(/\s+/).filter(Boolean); /* a $variable's value splits at blanks, and & | < > ( ) == in it are still operators */
    L.forEach(function(y){W.push(/\\/.test(x)||/["'`\\]/.test(y)?QW+y:y);R.push(L.length===1?x:y)});
  });
  return {W:W,R:R};
}
function cexp(W,k,brace,ig0){ /* 4.3BSD csh's exp() over words W from k: {n, k after it}. Operators of one level group from the right, as its
                       recursive descent has them: 10 - 3 - 2 is 9. Throws {csh:message} as its errors do.
                       brace(at,end): the status of the { command } in words at to end */
  function bad(m){throw {csh:'@: '+m}}
  function num(x){ /* egetn */
    if(x&&x.charAt(0)!=='-'&&!/^\d/.test(x))bad('Expression syntax');
    var m=/^(-?)(\d*)$/.exec(x);
    if(!m||m[1]&&!m[2])bad('Badly formed number');
    return (m[1]?-m[2]:+m[2])|0;
  }
  function op(x){return x===undefined||/^(\+|-|\*|\/|%|[()!~^"]|\|&|<<|>>|==|=~|!=|!~|<.*|>.*)$/.test(x)} /* isa(ANYOP): no word at all is one too */
  function level(lower,ops,fn){ /* p1 = lower(); an operator of this level, then this level again for the right side */
    var f=function(ig){
      var p1=lower(ig);
      if(ops.indexOf(W[k])<0)return p1;
      var o=W[k++];
      return fn(o,p1,f(ig),ig);
    };
    return f;
  }
  function ftest(t,f){ /* -e -d -f -z -o: is it there, a directory, a file, empty, yours. -r -w -x: may you */
    var n=P.find(P.glob(f)[0]),at=n&&P.pathOf(n);
    if(!n)return false;
    if(t==='r')return !n.prot;
    if(t==='w')return !n.prot&&P.canWrite(n.type==='d'?at+'/x':at);
    if(t==='x')return n.type==='d'||!!n.bin||/x/.test(n.mode||'');
    return t==='d'?n.type==='d':t==='f'?n.type!=='d'&&!n.dev:t==='z'?n.type!=='d'&&P.fsize(n)===0:t==='o'?n.owner===P.st.user:true;
  }
  function e6(ig){
    var w=W[k];
    if(w===undefined)bad('Expression syntax');
    if(w==='!'||w==='~'){k++;var c=num(e6(ig));return String(w==='!'?+!c:~c)}
    if(w==='('){k++;var r=e0(ig);if(W[k]!==')')bad('Expression syntax');k++;return String(r)}
    if(w==='{'){ /* { command }: 1 when it succeeds */
      var at=++k;
      while(W[k++]!=='}')if(W[k-1]===undefined)bad('Missing }');
      if(ig)return '';
      return String(+(brace(at,k-1)===0));
    }
    if(op(w))return '';
    k++;
    if(/^-[erwxfdzo]/.test(w)){
      if(op(W[k]))bad('Missing file name');
      var f=unq(W[k++]);
      return ig?'':String(+ftest(w.charAt(1),f));
    }
    return unq(w);
  }
  var e5=level(e6,['*','/','%'],function(o,a,b,ig){
    if(ig)return '0';
    var y=num(b);
    if(o!=='*'&&!y)throw {csh:o==='/'?'Divide by 0':'Mod by 0'};
    var x=num(a);
    return String(o==='*'?Math.imul(x,y):o==='/'?(x/y)|0:x%y);
  });
  var e4=level(e5,['+','-'],function(o,a,b,ig){return ig?'0':String(o==='+'?(num(a)+num(b))|0:(num(a)-num(b))|0)});
  var e3a=level(e4,['<<','>>'],function(o,a,b){return String(o==='<<'?num(a)<<num(b):num(a)>>num(b))});
  function e3(ig){
    var p1=e3a(ig),w=W[k];
    if(w===undefined||!/^[<>]/.test(w))return p1;
    k++;var eq=W[k]==='=';if(eq)k++;
    var p2=e3(ig);
    if(ig)return '1'; /* only read, as 4.3BSD's exp3 does when it ignores */
    var a=num(p1),b=num(p2),c=w.charAt(0)==='<'?(eq?a<=b:a<b):(eq?a>=b:a>b);
    return String(+c);
  }
  function e2c(ig){
    var p1=e3(ig),o=W[k];
    if(['==','!=','=~','!~'].indexOf(o)<0)return num(p1);
    k++;var p2=e3(ig);
    if(o==='=='||o==='!=')return +((p1===p2)===(o==='=='));
    var re;try{re=P.globRe(p2)}catch(x){return 0}
    return +(re.test(p1)===(o==='=~'));
  }
  var e2b=level(e2c,['&'],function(o,a,b){return a&b}),e2a=level(e2b,['^'],function(o,a,b){return a^b}),e2=level(e2a,['|'],function(o,a,b){return a|b});
  function e1(ig){var p1=e2(ig);if(W[k]!=='&&')return p1;k++;var p2=e1(ig||!p1);return +(p1&&p2)}
  function e0(ig){var p1=e1(ig);if(W[k]!=='||')return p1;k++;var p2=e0(ig||!!p1);return +(p1||p2)}
  var n=e0(!!ig0);
  return {n:n,k:k};
}
var NEED={};
function inner(L,brace){return function(at,end){return brace(at,L.R.slice(at,end).join(' '))}} /* cexp's brace: the words as written */
function braces(work,done,reset){ /* work(brace) works something out; a { command } in it is run first, as its own process, and the
                                     whole worked out again with its status: each runs once, in order, and one skipped by && or || never */
  var ran={},any=false,last=0,st0=P.lastStatus(); /* $status as it was before: csh expands the variables once */
  (function again(){
    var need=null,r;
    try{r=work(function(at,cmd){if(P.has(ran,at))return ran[at];need={at:at,cmd:cmd};throw NEED})}
    catch(e){if(e!==NEED){done(e,null,any,last);return}}
    if(!need){done(null,r,any,last);return}
    any=true;
    P.forked(need.cmd,function(st){ran[need.at]=last=st;P.status(st0);if(reset)reset();again()});
  })();
}
function test(t,as,then){ /* then(true or false) for the expression in t, or nothing once an error has been said */
  braces(function(brace){
    var L=lex(t),r=cexp(L.W,0,inner(L,brace));
    if(r.k<L.W.length)throw {csh:'@: Expression syntax'};
    return r.n;
  },function(e,n,any,last){if(e)said(e,as);else then(!!n,any,last)});
}
P.cshWhile=function(t,then){test(t,'while',then)}; /* while ( expr ): the loop asks before each time round */
P.cshWhileRead=function(t){ /* typed at the prompt, dowhile reads the expression without working it out (exp0 with ignore) before it reads the
                               loop: false once an error there has been said, at the while line */
  try{var L=lex(t),r=cexp(L.W,0,null,true);if(r.k<L.W.length)throw {csh:'@: Expression syntax'};return true}
  catch(e){said(e,'while');return false}
};
builtin(['if'],function(){ /* the one-line form: if (expr) command */
  var s=P.source(),m=/^\s*if\s*\(/.exec(s),end=m?closing(s,m[0].length):-1,cmd=end<0?'':s.slice(end+1).trim();
  if(end<0||/^then\b/.test(cmd)){P.typeLine('if: Expression syntax.','err');return}
  P.status(P.lastStatus()); /* if ($status != 0) asks about the command before */
  test(s.slice(m[0].length-1,end+1),'if',function(yes,any,last){
    if(yes&&cmd)P.exec(cmd); /* a command like any other: exit here logs you out. $status in it is still the one from before */
    else if(!any)P.status(0);else P.status(last); /* a { } that ran leaves its own status */
  });
});
builtin(['@'],function(){ /* @ name = expr, @ name[n] = expr, @ name op= expr, @ name++ (4.3BSD's dolet); @ alone lists the variables as set does */
  function syn(){throw {csh:'@: Syntax error'}}
  var t=P.source().replace(/^\s*@/,''),W;
  if(!/\S/.test(t)){listVars();return}
  P.status(P.lastStatus());
  var keepV=Object.assign({},P.shvars),keepW=Object.assign({},P.shwords);
  braces(function(each){
    var L=lex(t),brace=inner(L,each);
    W=L.W;
    function xset(p,v){if(p)W[--v]=p;var r=cexp(W,v,brace);return {s:String(r.n),v:r.k}} /* what is left of the word starts the expression */
    function operate(o,cur,p){
      var V=(cur?[cur]:[]).concat([o,p]),r=cexp(V,0);
      if(r.k<V.length)throw {csh:'@: Expression syntax'};
      return String(r.n);
    }
    function words(name,i){ /* getvx: the variable's words, when it has an [i] */
      if(!P.has(P.shvars,name))throw {undefinedVar:name};
      var x=listOf(name),w=x?x.slice():P.shvars[name].split(/\s+/).filter(Boolean);
      if(i<1||i>w.length)throw {csh:'@: Subscript out of range'};
      return w;
    }
    var v=0,p=unq(W[v++]);
    do{
      var name=/^\w*/.exec(p)[0],sub=null;
      if(!/^[A-Za-z_]/.test(name))syn();
      p=p.slice(name.length);
      if(p.charAt(0)==='['){ /* getinx */
        var ix=/^\[(\d*)(\]?)/.exec(p);
        if(!ix[2])throw {csh:'@: Subscript error'};
        sub=+ix[1];p=p.slice(ix[0].length);
      }
      if(!p&&v<W.length)p=unq(W[v++]);
      var o=p.charAt(0),x;
      if(!o)syn();
      p=p.slice(1);
      var cur=function(){return sub===null?P.shvars[name]||'':words(name,sub)[sub-1]};
      if(o==='=')x=xset(p,v);
      else{
        var c=p.charAt(0);p=p.slice(1);
        if(c==='+'||c==='-'){if(c!==o||p)syn();x={s:operate(o,cur(),'1'),v:v}}
        else if(o==='<'||o==='>'||c!=='=')syn(); /* <<= and >>= too: 4.3BSD falls into its syntax error */
        else{x=xset(p,v);x.s=operate(o,cur(),x.s)}
      }
      v=x.v;
      if(sub===null){P.shvars[name]=x.s;delete P.shwords[name]}
      else{var w=words(name,sub);w[sub-1]=x.s;store(name,w)} /* asx */
    }while((p=unq(W[v++]))!==undefined);
  },function(e,r,any,last){if(e)said(e);else if(!any)P.status(0);else P.status(last)},function(){restore(P.shvars,keepV);restore(P.shwords,keepW)});
});
builtin(['rehash','nice','sync'],function(){}); /* jobs, fg, bg, kill and wait: shell.js, with the engine's jobs */
builtin(['end'],function(){P.typeLine('end: Not in while/foreach.','err')}); /* doend, with no loop: one the loop read takes its own end */
builtin(['limit'],function(){
  P.say(['cputime         unlimited','filesize        unlimited','datasize        6144 kbytes','stacksize       512 kbytes','coredumpsize    unlimited','memoryuse       6819 kbytes']);
});
function perror(p){return p.csh&&p.perror} /* these came with Berkeley, not with every csh */
function place(x){
  var d=P.has(P.paths,x)&&P.paths[x];
  return d?d+'/'+x:(P.env.PATH||'').split(':').map(function(o){return (o||'.')+'/'+x}).filter(function(f){var n=P.find(f);return n&&n.type!=='d'&&n.bin})[0];
}
P.command({names:['which'],path:'/usr/ucb',noHelpFlag:true,enabled:perror,run:function(a){
  a.forEach(function(x){
    var al=P.aliases.filter(function(y){return y.from.join(' ')===x})[0],f=al?null:place(x);
    P.typeLine(al?x+':\t aliased to '+al.to:f||'no '+x+' in '+(P.env.PATH||'').split(':').map(function(o){return o||'.'}).join(' '));
  });
}});
P.command({names:['whereis'],path:'/usr/ucb',noHelpFlag:true,enabled:perror,run:function(a){
  a.forEach(function(x){var f=place(x);P.typeLine(x+':'+(f?' '+f:'')+(P.has(P.man,x)&&!P.own(x)?' /usr/man/man1/'+x+'.1':''))}); /* the terminal's words are not the machine's */
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
