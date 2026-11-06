/* PHOSPHOR-9 terminal: ed, the standard editor. It says "?" when you are wrong, as it should.
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE.
   Written from its manual page: addresses, a i c d p n l = s g v m t j k u w r e f q Q h H. */
(function(P){
'use strict';

function old(){return P.profile.year<1990} /* n, h and H came later */
function Ed(name){
  var buf=[],dot=0,file=name||'',dirty=false,warned=false,undo=null,lastRe=null,lastErr='',verbose=false,marks={},lastRep=null,done=false;
  function bytes(T){return T.reduce(function(n,t){return n+t.length+1},0)} /* the size ed reports: the text and its newlines */
  function wrap(L){return L.map(function(t){return {t:t}})}
  function fail(why){var e=new Error(why);e.ed=true;throw e}
  function snapshot(){return {buf:buf.slice(),texts:buf.map(function(x){return x.t}),dot:dot}}
  function save(){undo=snapshot()}
  function compile(src,flags){
    if(src===''){if(!lastRe)fail('no previous pattern');return new RegExp(lastRe.source,flags||'')}
    try{lastRe=new RegExp(P.bre(src),flags||'')}catch(e){fail('bad pattern')}
    return lastRe;
  }
  function delim(s,i,d){ /* the text up to an unescaped d, and where it ended */
    var o='';
    for(;i<s.length;i++){
      var c=s.charAt(i);
      if(c==='\\'&&i+1<s.length){
        if(s.charAt(i+1)===d)o+=d;else o+=c+s.charAt(i+1);
        i++;continue;
      }
      if(c===d)return {text:o,end:i+1,closed:true};
      o+=c;
    }
    return {text:o,end:i,closed:false};
  }
  function search(re,from,step){
    var n=buf.length;
    for(var k=1;k<=n;k++){
      var at=((from-1+step*k)%n+n)%n;
      if(re.test(buf[at].t))return at+1;
    }
    fail('no match');
  }
  function address(s,st){ /* one address at s[st.i], or null */
    var seen=false,v=0,c,m;
    for(;;){
      c=s.charAt(st.i);
      if(c==='.'){v=dot;seen=true;st.i++}
      else if(c==='$'){v=buf.length;seen=true;st.i++}
      else if(/[0-9]/.test(c)&&!seen){m=s.slice(st.i).match(/^\d+/);v=+m[0];seen=true;st.i+=m[0].length}
      else if(c==='/'||c==='?'){
        var d=delim(s,st.i+1,c);
        if(!buf.length)fail('no match');
        v=search(compile(d.text),seen?v:dot,c==='/'?1:-1);seen=true;st.i=d.end;
      }
      else if(c==="'"){
        var k=s.charAt(st.i+1);
        if(!marks[k]||buf.indexOf(marks[k])<0)fail('no such mark');
        v=buf.indexOf(marks[k])+1;seen=true;st.i+=2;
      }
      else if(c==='+'||c==='-'){
        var base=seen?v:dot,sign=c==='+'?1:-1;st.i++;
        m=s.slice(st.i).match(/^\d+/);
        var cnt=m?+m[0]:1;if(m)st.i+=m[0].length;
        v=base+sign*cnt;seen=true;
      }
      else if(c===' '){st.i++}
      else break;
    }
    return seen?v:null;
  }
  function parseRange(s,st){
    var a=address(s,st),b=a,given=a===null?0:1;
    while(s.charAt(st.i)===','||s.charAt(st.i)===';'){
      var sep=s.charAt(st.i++);
      if(a===null&&given===0){a=sep===','?1:dot;b=buf.length;given=2}
      else a=b;
      if(sep===';')dot=a;
      var n=address(s,st);
      if(n!==null){b=n;given=2}
      else if(given===1){b=a;given=2}
    }
    return {a:a,b:b,given:given};
  }
  function need(r,da,db){ /* fill in defaults, then check the range is real */
    if(!r.given){r.a=da;r.b=db}
    if(r.a<1||r.b>buf.length||r.a>r.b)fail('bad address');
  }
  function show(a,b,num,list){
    var out=[];
    for(var i=a;i<=b;i++){
      var t=buf[i-1].t;
      if(list)t=t.replace(/\\/g,'\\\\').replace(/\t/g,'\\t')+'$';
      out.push((num?i+'\t':'')+t);
    }
    P.say(out);
    dot=b;
  }
  function readIn(then){ /* lines up to a lone dot */
    var got=[];
    (function more(){
      P.ask('',function(line){
        if(line===P.INT){then(got);P.typeLine('?');return}
        if(line===null||line==='.'){then(got);return}
        got.push(line);
        more();
      },true);
    })();
  }
  function insert(at,L){
    var items=wrap(L);
    Array.prototype.splice.apply(buf,[at,0].concat(items));
    if(L.length){dot=at+L.length;dirty=true}
    else dot=Math.min(at,buf.length);
  }
  function loadFile(f){
    var n=P.named(f);
    if(!n||n.type==='d'||n.prot)fail('cannot open input file');
    return P.text(n);
  }
  function substitute(r,rest,inGlobal){
    var c=rest.charAt(0),src,rep,fl='';
    if(!c||/[\s]/.test(c)){
      if(!lastRep)fail('no previous substitution');
      src=lastRep.src;rep=lastRep.rep;fl=rest.trim();
    } else {
      var d1=delim(rest,1,c);
      if(!d1.closed&&!d1.text)fail('bad substitution');
      var d2=delim(rest,d1.end,c);
      src=d1.text;rep=d2.text;fl=rest.slice(d2.end);
      lastRep={src:src,rep:rep};
    }
    var g=/g/.test(fl),re=compile(src,g?'g':''),hit=0;
    if(!inGlobal)save();
    for(var k=r.a;k<=r.b;k++){
      var line=buf[k-1],changed=false,nt=line.t.replace(re,function(all){
        changed=true;
        var args=arguments;
        return rep.replace(/\\(.)|&/g,function(m,e){
          if(m==='&')return all;
          if(/[1-9]/.test(e))return +e>args.length-3||args[+e]===undefined?'':args[+e];
          return e==='n'?'\n':e;
        });
      });
      if(changed){line.t=nt;hit=k;dirty=true}
    }
    if(!hit){if(!inGlobal)fail('no match');return}
    dot=hit;
    if(/p/.test(fl))show(dot,dot,false,false);
    if(/n/.test(fl))show(dot,dot,true,false);
    if(/l/.test(fl))show(dot,dot,false,true);
  }
  function exec(s,inGlobal){
    var st={i:0},r=parseRange(s,st);
    var c=s.charAt(st.i),rest=s.slice(st.i+1),arg=rest.trim(),L,n,dst;
    if(r.given&&(r.a<0||r.b<0||r.b>buf.length))fail('bad address');
    switch(c){
      case '':
        if(!r.given){r.a=r.b=dot+1}
        if(r.b<1||r.b>buf.length)fail('bad address');
        show(r.b,r.b,false,false);
        return;
      case 'a':
        if(!r.given)r.b=dot;
        save();readIn(function(g){insert(r.b,g)});
        return;
      case 'i':
        if(!r.given)r.b=dot;
        save();readIn(function(g){insert(Math.max(0,r.b-1),g)});
        return;
      case 'c':
        need(r,dot,dot);save();
        readIn(function(g){buf.splice(r.a-1,r.b-r.a+1);dirty=true;insert(r.a-1,g)});
        return;
      case 'd':
        need(r,dot,dot);
        if(!inGlobal)save();
        buf.splice(r.a-1,r.b-r.a+1);dirty=true;
        dot=Math.min(r.a,buf.length);
        return;
      case 'p':case 'P':need(r,dot,dot);show(r.a,r.b,false,false);return;
      case 'n':if(old())fail('unknown command');need(r,dot,dot);show(r.a,r.b,true,false);return;
      case 'l':need(r,dot,dot);show(r.a,r.b,false,true);return;
      case '=':P.typeLine(String(r.given?r.b:buf.length));return;
      case 's':
        need(r,dot,dot);substitute(r,rest,inGlobal);return;
      case 'g':case 'v':
        if(inGlobal)fail('cannot nest global');
        need(r,1,buf.length);
        var dg=delim(rest,1,rest.charAt(0));
        var reg=compile(dg.text),todo=[];
        for(n=r.a;n<=r.b;n++)if(reg.test(buf[n-1].t)===(c==='g'))todo.push(buf[n-1]);
        var cmd=rest.slice(dg.end)||'p';
        save();
        todo.forEach(function(item){
          var at=buf.indexOf(item);
          if(at<0)return;
          dot=at+1;
          exec(cmd,true);
        });
        return;
      case 'm':case 't':
        need(r,dot,dot);
        var dstState={i:st.i+1};
        dst=address(s,dstState);
        if(dst===null)dst=dot;
        if(dst<0||dst>buf.length)fail('bad address');
        save();
        var block=buf.slice(r.a-1,r.b);
        if(c==='m'){
          if(dst>=r.a&&dst<r.b)fail('bad destination');
          buf.splice(r.a-1,r.b-r.a+1);
          if(dst>=r.b)dst-=block.length;
          Array.prototype.splice.apply(buf,[dst,0].concat(block));
        } else {
          block=wrap(block.map(function(x){return x.t}));
          Array.prototype.splice.apply(buf,[dst,0].concat(block));
        }
        dot=dst+block.length;dirty=true;
        return;
      case 'j':
        need(r,dot,dot+1);
        save();
        buf[r.a-1].t=buf.slice(r.a-1,r.b).map(function(x){return x.t}).join('');
        buf.splice(r.a,r.b-r.a);
        dot=r.a;dirty=true;
        return;
      case 'k':
        need(r,dot,dot);
        marks[rest.charAt(0)]=buf[r.b-1];
        return;
      case 'u':
        if(!undo)fail('nothing to undo');
        var was=snapshot();
        buf=undo.buf;undo.texts.forEach(function(t,i){buf[i].t=t});
        dot=undo.dot;undo=was;
        return;
      case 'w':case 'W':
        var to=arg||file;
        if(!to)fail('no current filename');
        if(r.given)need(r,1,buf.length); /* 0,$w or 3,1w: no such lines */
        L=(r.given?buf.slice(r.a-1,r.b):buf).map(function(x){return x.t});
        if(!P.writeFile(to,L,c==='W'))fail('cannot open output file');
        if(!file)file=to;
        if(!r.given)dirty=false;
        P.typeLine(String(bytes(L)));
        return;
      case 'r':
        var from=arg||file;
        if(!from)fail('no current filename');
        L=loadFile(from);
        save();
        insert(r.given?r.b:buf.length,L);
        P.typeLine(String(bytes(L)));
        return;
      case 'e':case 'E':
        if(c==='e'&&dirty&&!warned){warned=true;fail('warning: file modified')}
        var en=arg||file;
        if(!en)fail('no current filename');
        L=loadFile(en);
        buf=wrap(L);dot=buf.length;file=en;dirty=false;marks={};undo=null;
        P.typeLine(String(bytes(L)));
        return;
      case 'f':
        if(arg)file=arg;
        if(!file)fail('no current filename');
        P.typeLine(file);
        return;
      case 'q':
        if(dirty&&!warned){warned=true;fail('warning: file modified')}
        done=true;return;
      case 'Q':done=true;return;
      case 'h':if(old())fail('unknown command');if(lastErr)P.typeLine(lastErr);return;
      case 'H':if(old())fail('unknown command');verbose=!verbose;if(verbose&&lastErr)P.typeLine(lastErr);return;
      default:fail('unknown command');
    }
  }
  function step(line){
    var keep=warned;
    try{exec(line,false)}
    catch(e){
      if(!e.ed)throw e;
      lastErr=e.message;
      P.typeLine('?');
      if(verbose)P.typeLine(lastErr);
      return;
    }
    if(keep&&line.trim()!=='q'&&line.trim()!=='e')warned=false;
  }
  function loop(){
    P.ask('',function(line){
      if(line===P.INT){P.typeLine('?');lastErr='interrupt';loop();return}
      if(line===null){
        if(dirty&&!warned){warned=true;P.typeLine('?');lastErr='warning: file modified';loop();return}
        return;
      }
      step(line);
      if(!done)P.queue(function(){if(!done)loop()});
    },true);
  }
  if(file){
    var n0=P.named(file);
    if(n0&&n0.type!=='d'&&!n0.prot){var T=P.text(n0);buf=wrap(T);dot=buf.length;P.typeLine(String(bytes(T)))}
    else{P.typeLine('?'+file);if(n0)lastErr='cannot open input file'}
  }
  loop();
}

P.command({names:['ed'],path:'/bin',
  man:{what:'text editor',syn:'ed [ file ]',desc:[
    'edits a file. a line is addressed by its number, . for the current line, $ for the last, /pattern/ for the next match, or +n and -n from any of those, and two addresses separated by a comma make a range.',
    '',
    'a i c   add, insert or change text, up to a line holding only a dot.',
    'd p l   delete, print, print showing the invisible.',
    's/old/new/g   substitute; & is the match, and \\( \\) make \\1.',
    'g/pattern/command   do a command on every matching line; v on every other.',
    'm t j k   move, copy, join, mark.   u   undo.   =   line number.',
    'w r e f   write, read, edit, filename.   q   quit.   Q   quit regardless.',
    'on later systems only: n prints with numbers, h explains the last ? and H always explains.'],bugs:[
    'there is no prompt. there is no help. when you are wrong it says ?, and it is your job to know why.']},
  run:function(a){Ed(a[0])}});

})(window.Phosphor);
