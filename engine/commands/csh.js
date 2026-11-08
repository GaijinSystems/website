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
function value(x){ /* a word as written: 'as is', "with $variables", or bare, where \ keeps the next character */
  x=x.trim();
  if(/^'.*'$/.test(x))return P.unguard(x.slice(1,-1));
  if(/^".*"$/.test(x))return P.vars(P.unquote(x));
  return x.split(/(\\.)/).map(function(p,i){return i%2?P.unguard(p.charAt(1)):P.vars(P.unquote(p))}).join('');
}
function listVars(){ /* set, or @, on its own */
  var V={argv:'()',cwd:P.st.cwd,home:P.st.home,path:'('+(P.env.PATH||'').replace(/:/g,' ')+')',prompt:'% ',shell:'/bin/csh',status:'0',term:P.env.TERM,user:P.st.user};
  Object.keys(P.shvars).forEach(function(k){V[k]=P.shvars[k]});
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
    while((m=/^([A-Za-z_]\w*)\s*(?:=\s*("[^"]*"|'[^']*'|\([^)]*\)|(?:\\.|\S)*))?\s*/.exec(t))&&m[0]){
      delete P.shwords[m[1]];
      if(m[2]&&m[2].charAt(0)==='('){ /* ( 1 2 3 ): its words. A quoted word stays one; the rest split at blanks and match file names */
        var L=[];
        (m[2].slice(1,-1).match(/(?:"[^"]*"|'[^']*'|\\.|[^\s"'\\])+/g)||[]).forEach(function(x){
          if(/["'\\]/.test(x)){L.push(value(x));return}
          value(x).split(/\s+/).filter(Boolean).forEach(function(y){L=L.concat(P.glob(y))}); /* no match: the parser has said so */
        });
        P.shvars[m[1]]=L.join(' ');P.shwords[m[1]]={s:P.shvars[m[1]],w:L};
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
  P.aliases=P.aliases.filter(function(x){return a.indexOf(x.from.join(' '))<0});
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
function operator(e,ops){ /* [left,op,right] for the first of them, or by default the last comparison, == and != before the rest, outside quotes and ( ) */
  var q=null,depth=0,eq=null,rel=null;
  for(var i=0;i<e.length;i++){
    var c=e.charAt(i),two=e.substr(i,2);
    if(q){if(c===q)q=null}
    else if(c==='\\')i++;
    else if(c==='"'||c==="'")q=c;
    else if(c==='(')depth++;
    else if(c===')')depth--;
    else if(depth)continue;
    else if(ops){if(two===ops)return [e.slice(0,i),two,e.slice(i+2)]}
    else if(two==='=='||two==='!='||two==='=~'||two==='!~'){eq=[e.slice(0,i),two,e.slice(i+2)];i++}
    else if(two==='>='||two==='<='){rel=[e.slice(0,i),two,e.slice(i+2)];i++}
    else if(c==='>'||c==='<')rel=[e.slice(0,i),c,e.slice(i+1)];
  }
  return eq||rel;
}
function operand(x){ /* a side of a comparison, as a string; null when there is nothing there or it makes no sense */
  x=x.replace(/\uE010/g,'').trim();
  if(!x)return null;
  if(/^["']/.test(x))return value(x); /* a quoted side is a string, whatever is in it */
  var inner=x.charAt(0)==='('&&closing(x,1)===x.length-1?x.slice(1,-1):null;
  if(inner!==null&&!operator(inner,'||')&&!operator(inner,'&&')&&!operator(inner))return operand(inner);
  if(inner!==null||operator(x)||x.charAt(0)==='!'||/^-[edfrwxz]\s/.test(x)){
    var t=truth(x);
    return t===null?null:t?'1':'0';
  }
  return arith(value(x).trim());
}
function arith(v){ /* 1 + 1, $x%2: whole numbers and + - * / %; a lone operator among other words makes no sense */
  var t=v.replace(/\s+/g,'');
  if(!/^-?\d+([-+*\/%]-?\d+)+$/.test(t))return /\S\s+[-+*\/%](\s|$)|(^|\s)[-+*\/%]\s+\S/.test(v.trim())?null:v; /* a lone / is a word; an operator among words is not */
  var W=[];t.match(/(?:^|[-+*\/%])-?\d+/g).forEach(function(x,i){if(i)W.push(x.charAt(0),x.slice(1));else W.push(x)}); /* 3*-2: the - is the number's */
  return String(cexp(W,0).n);
}
function cexp(W,k){ /* 4.3BSD csh's exp() over words W from k: {n, k after it}. Operators of one level group from the right, as its
                       recursive descent has them: 10 - 3 - 2 is 9. Throws {csh:message} as its errors do */
  function bad(m){throw {csh:'@: '+m}}
  function num(x){ /* egetn */
    if(x&&x.charAt(0)!=='-'&&!/^\d/.test(x))bad('Expression syntax');
    var m=/^(-?)(\d*)$/.exec(x);
    if(!m||m[1]&&!m[2])bad('Badly formed number');
    return (m[1]?-m[2]:+m[2])|0;
  }
  function op(x){return x!==undefined&&/^(\+|-|\*|\/|%|[()!~^"]|\|&|<<|>>|==|=~|!=|!~|<.*|>.*)$/.test(x)} /* isa(ANYOP) */
  function level(lower,ops,fn){ /* p1 = lower(); an operator of this level, then this level again for the right side */
    var f=function(ig){
      var p1=lower(ig);
      if(ops.indexOf(W[k])<0)return p1;
      var o=W[k++];
      return fn(o,p1,f(ig),ig);
    };
    return f;
  }
  function e6(ig){
    var w=W[k];
    if(w===undefined)bad('Expression syntax');
    if(w==='!'||w==='~'){k++;var c=num(e6(ig));return String(w==='!'?+!c:~c)}
    if(w==='('){k++;var r=e0(ig);if(W[k]!==')')bad('Expression syntax');k++;return String(r)}
    if(op(w))return '';
    k++;return w;
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
    var a=num(p1),b=num(e3(ig)),c=w.charAt(0)==='<'?(eq?a<=b:a<b):(eq?a>=b:a>b);
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
  var n=e0(false);
  return {n:n,k:k};
}
function truth(e){ /* true, false, or null when it makes no sense */
  e=e.trim();
  var o=operator(e,'||')||operator(e,'&&'),q;
  if(o){ /* both sides are read, but once the left decides, the right is not worked out: 0 && 1 / 0 is no Divide by 0 */
    var x=truth(o[0]),y,decided;
    if(x===null)return null;
    decided=o[1]==='||'?x:!x;
    try{y=truth(o[2])}catch(e){if(!decided||!e||!/^(Divide|Mod) by 0$/.test(e.csh))throw e}
    if(y===null)return null;
    return decided?x:y;
  }
  if(e.charAt(0)==='('&&closing(e,1)===e.length-1)return truth(e.slice(1,-1));
  o=operator(e);
  if(o){
    var l=operand(o[0]),r=operand(o[2]);
    if(l===null||r===null)return null;
    if(o[1]==='==')return l===r;
    if(o[1]==='!=')return l!==r;
    if(o[1]==='=~'||o[1]==='!~'){var re;try{re=P.globRe(r)}catch(x){return null}return re.test(l)===(o[1]==='=~')}
    if(!/^-?\d+$/.test(l)||!/^-?\d+$/.test(r))return null;
    return o[1]==='>'?+l>+r:o[1]==='<'?+l<+r:o[1]==='>='?+l>=+r:+l<=+r;
  }
  if((q=/^(!?)\s*-([edfrwxz])\s+(\S+)$/.exec(e))){
    var n=P.find(value(q[3])),L=q[2],at=n&&P.pathOf(n);
    var yes=!!n&&(L==='d'?n.type==='d':L==='f'?n.type!=='d':L==='r'?!n.prot:L==='w'?!n.prot&&P.canWrite(n.type==='d'?at+'/x':at):
      L==='x'?n.type==='d'||n.bin||/x/.test(n.mode||''):L==='z'?n.type!=='d'&&P.fsize(n)===0:true);
    return q[1]?!yes:yes;
  }
  if((q=/^!\s*(.+)$/.exec(e))&&!/^-?\d+$/.test(q[1])){var inner=truth(q[1]);return inner===null?null:!inner}
  var w=arith(value(e));
  if(w===null)return null;
  if((q=/^!\s*(-?\d+)$/.exec(w)))return +q[1]===0;
  return /^-?\d+$/.test(w)?+w!==0:null;
}
builtin(['if'],function(){ /* the one-line form: if (expr) command */
  var s=P.source(),m=/^\s*if\s*\(/.exec(s),end=m?closing(s,m[0].length):-1,cmd=end<0?'':s.slice(end+1).trim(),yes;
  if(end<0||/^then\b/.test(cmd)){P.typeLine('if: Expression syntax.','err');return}
  P.status(P.lastStatus()); /* if ($status != 0) asks about the command before */
  try{yes=truth(s.slice(m[0].length,end).trim())}
  catch(e){said(e,'if');return}
  if(yes===null){P.typeLine('if: Expression syntax.','err');return}
  if(yes&&cmd)P.exec(cmd); /* a command like any other: exit here logs you out. $status in it is still the one from before */
  else P.status(0);
});
builtin(['@'],function(){ /* @ name = expr, @ name op= expr, @ name++ (4.3BSD's dolet); @ alone lists the variables as set does */
  function syn(){throw {csh:'@: Syntax error'}}
  function xset(p,v){if(p)W[--v]=p;var r=cexp(W,v);return {s:String(r.n),v:r.k}} /* what is left of the word starts the expression */
  function operate(o,cur,p){
    var V=(cur?[cur]:[]).concat([o,p]),r=cexp(V,0);
    if(r.k<V.length)throw {csh:'@: Expression syntax'};
    return String(r.n);
  }
  try{
    var W=[]; /* < > & | ( ) are words of their own, as csh's lexer makes them; a quoted word stays one word, "1 + 2" and all */
    (P.source().replace(/^\s*@/,'').match(/(?:"[^"]*"|'[^']*'|\\.|[^\s"'\\&|<>()])+|&&|\|\||<<|>>|[&|<>()]/g)||[]).forEach(function(x){
      if(/["']/.test(x.replace(/\\./g,'')))W.push(value(x));
      else W=W.concat(value(x).match(/&&|\|\||<<|>>|[&|<>()]|[^\s&|<>()]+/g)||[]);
    });
    if(!W.length){listVars();return}
    var v=0,p=W[v++];
    do{
      var name=/^\w*/.exec(p)[0];
      if(!/^[A-Za-z_]/.test(name))syn();
      p=p.slice(name.length);
      if(!p&&v<W.length)p=W[v++];
      var o=p.charAt(0),x;
      if(!o)syn();
      p=p.slice(1);
      if(o==='=')x=xset(p,v);
      else{
        var c=p.charAt(0);p=p.slice(1);
        if(c==='+'||c==='-'){if(c!==o||p)syn();x={s:operate(o,P.shvars[name]||'','1'),v:v}}
        else if(o==='<'||o==='>'||c!=='=')syn(); /* <<= and >>= too: 4.3BSD falls into its syntax error */
        else{x=xset(p,v);x.s=operate(o,P.shvars[name]||'',x.s)}
      }
      v=x.v;P.shvars[name]=x.s;
    }while((p=W[v++])!==undefined);
    P.status(0);
  }
  catch(e){said(e)}
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
