/* PHOSPHOR-9 terminal: vi, the visual editor, drawn on the glass through P.fullscreen.
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE.
   Motions: h j k l w b e W B E 0 ^ $ | f F t T ; , % { } H M L G n N / ? ' ` + - and counts.
   Changes: i I a A o O r R x X s S J ~ d c y < > D C Y p P u U . with named registers.
   Keys: ctrl-f b d u e y g l. Colon commands: w q wq x e r f set s d g, and a line number. */
(function(P){
'use strict';

function Vi(name,S){
  var L=[''],r=0,c=0,top=0,mode='cmd',msg='',file=name||'',dirty=false,done;
  var MAXCOUNT=100000; /* a count no one means: enough to do its work, not enough to hang the tab */
  var count=0,op=null,opCount=0,pending=null,reg='"',regs={},exLine='',exKind=':',marks={};
  var undo=null,snapped=false,uline=null,lastF=null,search=null,last=null,cur=[],changed=false,noRec=false,replaying=false;
  var nu=false,typed=[],insCount=1,insKeys=true,lastSub=null;

  function line(){return L[r]}
  function scroll(by,reset){
    var m=L.length-1,f=function(x){return by>0?Math.min(m,x+by):Math.max(0,x+by)};
    r=f(r);top=f(top);
    if(reset)c=first(r);
  }
  function clamp(){
    r=Math.max(0,Math.min(L.length-1,r));
    var max=mode==='cmd'?Math.max(0,L[r].length-1):L[r].length;
    c=Math.max(0,Math.min(max,c));
  }
  function bell(m){if(m)msg=m;P.click(1,420)}
  function snap(){
    changed=true;dirty=true;
    if(!snapped){undo={L:L.slice(),r:r,c:c};snapped=true}
    if(!uline||uline.r!==r)uline={r:r,t:L[r]};
  }
  function info(){return '"'+(file||'No file')+'"'+(dirty?' [Modified]':'')+' line '+(r+1)+' of '+L.length+' --'+Math.floor(100*(r+1)/L.length)+'%--'}
  function fileInfo(f){return '"'+f+'" '+L.length+' line'+(L.length===1?'':'s')+', '+L.reduce(function(a,t){return a+t.length+1},0)+' characters'}
  function load(f){
    var n=P.find(f,true);
    if(n&&n.type==='d'){msg='"'+f+'" Is a directory';return}
    if(n&&n.prot){msg='"'+f+'" Permission denied';return}
    if(!n){L=[''];r=c=top=0;dirty=false;file=f;msg='"'+f+'" [New file]';return}
    L=P.text(n);if(!L.length)L=[''];
    r=c=top=0;dirty=false;file=f;msg=fileInfo(f);
    undo=null;uline=null;marks={};
  }
  function write(f){
    var to=f||file;
    if(!to){msg='No current filename';return false}
    if(!P.writeFile(to,L,false)){msg='"'+to+'" Permission denied';return false}
    if(!file)file=to;
    if(to===file)dirty=false;
    msg=fileInfo(to);
    return true;
  }
  function quit(){S.close();done()}

  /* ---------- drawing: long lines wrap, tabs go to every eighth column ---------- */
  function expand(t){
    var o='';
    for(var i=0;i<t.length;i++){
      var ch=t.charAt(i);
      if(ch==='\t')o+=' '.repeat(8-o.length%8);else o+=ch;
    }
    return o;
  }
  function dispCol(t,col){return expand(t.slice(0,col)).length}
  function gut(i){return nu?String(i+1).padStart(6)+'  ':''}
  function heightOf(i){return Math.max(1,Math.ceil((gut(i).length+expand(L[i]).length)/S.cols))}
  function render(){
    var R=S.rows-1;
    clamp();
    if(r<top)top=r;
    var used=0,i;
    for(i=top;i<=r;i++)used+=heightOf(i);
    while(used>R&&top<r){used-=heightOf(top);top++}
    var out=[],cr=0,cc=0;
    for(i=top;i<L.length&&out.length<R;i++){
      var txt=gut(i)+expand(L[i]);
      if(i===r){
        var at=gut(i).length+dispCol(L[i],c);
        if(mode==='cmd'&&L[i].charAt(c)==='\t')at=gut(i).length+dispCol(L[i],c+1)-1;
        cr=out.length+Math.floor(at/S.cols);cc=at%S.cols;
      }
      var k=0;
      do{out.push(txt.slice(k,k+S.cols));k+=S.cols}while(k<txt.length);
    }
    out=out.slice(0,R);
    while(out.length<R)out.push('~');
    var bottom=mode==='ex'?exKind+exLine:msg;
    out.push(bottom.slice(0,S.cols));
    if(mode==='ex'){cr=R;cc=Math.min(S.cols-1,bottom.length)}
    S.draw(out,cr,cc);
    if(msg&&mode!=='ex')S.say(msg);
  }

  /* ---------- motions: each gives where the cursor lands, and how an operator should treat it ---------- */
  function cls(ch,big){if(!ch||/\s/.test(ch))return 0;if(big)return 1;return /\w/.test(ch)?1:2}
  function wordFwd(n,big){
    var y=r,x=c;
    while(n-->0){
      var k=cls(L[y].charAt(x),big);
      if(k)while(x<L[y].length&&cls(L[y].charAt(x),big)===k)x++;
      for(;;){
        if(x>=L[y].length){if(y>=L.length-1){x=Math.max(0,L[y].length-(n>0?1:0));return {r:y,c:x}}y++;x=0;if(!L[y].length)break;continue}
        if(cls(L[y].charAt(x),big))break;
        x++;
      }
    }
    return {r:y,c:x};
  }
  function wordBack(n,big){
    var y=r,x=c;
    while(n-->0){
      x--;
      for(;;){
        if(x<0){if(y===0)return {r:0,c:0};y--;x=L[y].length-1;if(!L[y].length)break;continue}
        if(cls(L[y].charAt(x),big))break;
        x--;
      }
      if(x>=0){var k=cls(L[y].charAt(x),big);while(x>0&&cls(L[y].charAt(x-1),big)===k)x--}else x=0;
    }
    return {r:y,c:x};
  }
  function wordEnd(n,big){
    var y=r,x=c;
    while(n-->0){
      x++;
      for(;;){
        if(x>=L[y].length){if(y>=L.length-1)return {r:y,c:Math.max(0,L[y].length-1),inc:true};y++;x=0;continue}
        if(cls(L[y].charAt(x),big))break;
        x++;
      }
      var k=cls(L[y].charAt(x),big);
      while(x<L[y].length-1&&cls(L[y].charAt(x+1),big)===k)x++;
    }
    return {r:y,c:x,inc:true};
  }
  function first(y){var m=L[y].search(/\S/);return m<0?Math.max(0,L[y].length-1):m}
  function findCh(k,ch,n){
    var x=c,dir=k==='f'||k==='t'?1:-1,t=L[r];
    while(n-->0){
      x=dir>0?t.indexOf(ch,x+1):x>0?t.lastIndexOf(ch,x-1):-1;
      if(x<0)return null;
    }
    if(k==='t')x--;
    if(k==='T')x++;
    return {r:r,c:x,inc:dir>0};
  }
  function para(dir,n){
    var y=r;
    while(n-->0&&y>=0&&y<L.length){
      y+=dir;
      while(y>0&&y<L.length-1&&L[y].trim())y+=dir;
    }
    y=Math.max(0,Math.min(L.length-1,y));
    return {r:y,c:0};
  }
  function match(){
    var pairs={'(':')','[':']','{':'}',')':'(',']':'[','}':'{'},y=r,x=c,t=L[y];
    while(x<t.length&&!pairs[t.charAt(x)])x++;
    if(x>=t.length)return null;
    var o=t.charAt(x),m=pairs[o],dir='([{'.indexOf(o)>=0?1:-1,depth=0;
    for(;;){
      var ch=L[y].charAt(x);
      if(ch===o)depth++;
      else if(ch===m&&--depth===0)return {r:y,c:x,inc:true};
      x+=dir;
      if(x<0||x>=L[y].length){
        y+=dir;
        if(y<0||y>=L.length)return null;
        x=dir>0?0:L[y].length-1;
      }
    }
  }
  function find(re,dir,y,x){
    var n=L.length;
    for(var k=0;k<=n;k++){
      var at=((y+dir*k)%n+n)%n,t=L[at],hit=-1;
      if(dir>0){
        var g=new RegExp(re.source,'g'+(re.ignoreCase?'i':''));
        g.lastIndex=k===0?x+1:0;
        var m=g.exec(t);
        if(m)hit=m.index;
      }
      else{
        var g2=new RegExp(re.source,'g'+(re.ignoreCase?'i':'')),m2,lim=k===0?x:t.length+1,b=-1;
        while((m2=g2.exec(t))&&m2.index<lim){b=m2.index;if(!m2[0].length)g2.lastIndex++}
        hit=b;
      }
      if(hit>=0)return {r:at,c:hit};
    }
    return null;
  }
  function again(flip){
    if(!search){bell('No previous regular expression');return null}
    var dir=flip?-search.dir:search.dir,t=find(search.re,dir,r,c);
    if(!t)bell('Pattern not found');
    return t;
  }
  function pageH(){return Math.max(1,S.rows-2)}
  function simple(k,n,given){
    switch(k){
      case 'h':case 'ArrowLeft':case 'Backspace':case 'C-h':return {r:r,c:Math.max(0,c-n)};
      case 'l':case ' ':case 'ArrowRight':return {r:r,c:Math.min(L[r].length-(op?0:1),c+n)};
      case 'j':case 'ArrowDown':case 'C-n':case 'C-j':return r+n<L.length?{r:r+n,c:c,lw:true}:null;
      case 'k':case 'ArrowUp':case 'C-p':return r-n>=0?{r:r-n,c:c,lw:true}:null;
      case '+':case 'Enter':case 'C-m':return r+n<L.length?{r:r+n,c:first(r+n),lw:true}:null;
      case '-':return r-n>=0?{r:r-n,c:first(r-n),lw:true}:null;
      case '0':return {r:r,c:0};
      case '^':return {r:r,c:first(r)};
      case '$':{var y=Math.min(L.length-1,r+n-1);return {r:y,c:Math.max(0,L[y].length-1),inc:true}}
      case '|':return {r:r,c:Math.min(Math.max(0,L[r].length-1),n-1)};
      case 'w':return wordFwd(n,false);
      case 'W':return wordFwd(n,true);
      case 'b':return wordBack(n,false);
      case 'B':return wordBack(n,true);
      case 'e':return wordEnd(n,false);
      case 'E':return wordEnd(n,true);
      case 'G':{var g=given?Math.min(n,L.length)-1:L.length-1;return {r:g,c:first(g),lw:true}}
      case 'H':{var h=Math.min(L.length-1,top+n-1);return {r:h,c:first(h),lw:true}}
      case 'M':{var m=Math.min(L.length-1,top+Math.floor((S.rows-1)/2));return {r:m,c:first(m),lw:true}}
      case 'L':{var o=Math.min(L.length-1,top+S.rows-2);return {r:o,c:first(o),lw:true}}
      case '{':return para(-1,n);
      case '}':return para(1,n);
      case '%':return match();
      case 'n':return again(false);
      case 'N':return again(true);
      case ';':
      case ',':{
        if(!lastF){bell();return null}
        var fk=k===';'?lastF.k:{f:'F',F:'f',t:'T',T:'t'}[lastF.k];
        return findCh(fk,lastF.ch,n);
      }
    }
    return undefined;
  }

  /* ---------- operators ---------- */
  function setReg(text,lw){
    regs['"']={t:text,lw:lw};
    if(reg!=='"')regs[reg]={t:text,lw:lw};
    reg='"';
  }
  function cut(a,b,del,lw){ /* a and b are {r,c}, b exclusive unless linewise */
    var text;
    if(lw){
      text=L.slice(a.r,b.r+1);
      if(del){
        L.splice(a.r,b.r-a.r+1);
        if(!L.length)L=[''];
        r=Math.min(a.r,L.length-1);c=first(r);
      }
      else{r=a.r}
      setReg(text,true);
      return;
    }
    if(a.r===b.r)text=[L[a.r].slice(a.c,b.c)];
    else text=[L[a.r].slice(a.c)].concat(L.slice(a.r+1,b.r),[L[b.r].slice(0,b.c)]);
    if(del){
      L.splice(a.r,b.r-a.r+1,L[a.r].slice(0,a.c)+L[b.r].slice(b.c));
    }
    r=a.r;c=a.c;
    setReg(text,false);
  }
  function apply(o,t){
    var a={r:r,c:c},b={r:t.r,c:t.c},lw=!!t.lw;
    if(b.r<a.r||(b.r===a.r&&b.c<a.c)){var s=a;a=b;b=s}
    if(!lw&&t.inc)b={r:b.r,c:b.c+1};
    if(!lw&&t.word&&b.r>a.r&&b.c===0){b={r:b.r-1,c:L[b.r-1].length}} /* dw stops at the end of the line */
    if(o==='y'){var keep={r:r,c:c};cut(a,b,false,lw);if(lw)r=keep.r;c=lw?keep.c:a.c;return}
    if(o==='<'||o==='>'){
      if(!lw)b={r:b.r,c:0};
      snap();
      for(var y=a.r;y<=b.r;y++){
        if(!L[y])continue;
        L[y]=o==='>'?'\t'+L[y]:L[y].replace(/^(\t| {1,8})/,'');
      }
      r=a.r;c=first(r);
      return;
    }
    snap();
    if(o==='c'){
      if(lw){
        var txt=L.slice(a.r,b.r+1);
        L.splice(a.r,b.r-a.r+1,'');
        setReg(txt,true);
        r=a.r;c=0;
      }
      else cut(a,b,true,false);
      enterInsert(1);
      return;
    }
    cut(a,b,true,lw);
  }
  function enterInsert(n,kind){mode=kind||'ins';insCount=n||1;typed=[];insKeys=true;msg=''}

  /* ---------- typing text in ---------- */
  function insertKey(k){
    if(k==='Escape'||k==='C-['){
      mode='cmd';
      if(insCount>1&&insKeys&&typed.length){
        var more=typed.join('').repeat(insCount-1),t=line();
        L[r]=t.slice(0,c)+more+t.slice(c);c+=more.length;
      }
      c=Math.max(0,c-1);
      return;
    }
    if(k==='Enter'||k==='C-m'||k==='C-j'){
      var t2=line();
      L.splice(r,1,t2.slice(0,c),t2.slice(c));
      r++;c=0;insKeys=false;
      return;
    }
    if(k==='Backspace'||k==='C-h'){
      if(c>0){L[r]=line().slice(0,c-1)+line().slice(c);c--;typed.pop()}
      else bell();
      return;
    }
    if(k==='C-u'){L[r]=line().slice(c);c=0;typed=[];return}
    if(k==='C-w'){
      var t3=line().slice(0,c),m=t3.search(/\S+\s*$/);
      if(m<0)m=0;
      L[r]=line().slice(0,m)+line().slice(c);c=m;typed=[];
      return;
    }
    var ch=k==='Tab'?'\t':k;
    if(ch.length!==1)return;
    var s=line();
    if(mode==='rep')L[r]=s.slice(0,c)+ch+s.slice(c+1);
    else L[r]=s.slice(0,c)+ch+s.slice(c);
    c++;typed.push(ch);
  }

  /* ---------- colon commands ---------- */
  function addr(s,st){
    var m;
    if(s.charAt(st.i)==='.'){st.i++;return r+1}
    if(s.charAt(st.i)==='$'){st.i++;return L.length}
    if((m=s.slice(st.i).match(/^\d+/))){st.i+=m[0].length;return +m[0]}
    if(s.charAt(st.i)==="'"){var k=s.charAt(st.i+1);st.i+=2;return marks[k]?marks[k].r+1:null}
    return null;
  }
  function subst(a,b,rest){
    var d=rest.charAt(0),src,rep,fl='',p;
    if(!d||/\s/.test(d)){
      if(!lastSub){msg='No previous substitute';return}
      src=lastSub.src;rep=lastSub.rep;fl=rest.trim();
    }
    else{
      p=rest.split(d);
      src=p[1]||'';rep=p[2]||'';fl=p[3]||'';
      lastSub={src:src,rep:rep};
    }
    var re;
    try{re=new RegExp(P.bre(src),/g/.test(fl)?'g':'')}catch(e){msg='Bad regular expression';return}
    var hit=-1;
    snap();
    for(var y=a;y<=b;y++){
      var ok=false,nt=L[y].replace(re,function(all){
        ok=true;
        var args=arguments;
        return rep.replace(/\\(.)|&/g,function(m,e){return m==='&'?all:/[1-9]/.test(e)?(+e>args.length-3||args[+e]===undefined?'':args[+e]):e});
      });
      if(ok){L[y]=nt;hit=y}
    }
    if(hit<0){msg='Substitute pattern match failed';return}
    r=hit;c=first(r);
  }
  function ex(s){
    var st={i:0},a=null,b=null;
    s=s.trim();
    if(s.charAt(0)==='%'){a=1;b=L.length;st.i=1}
    else{
      a=addr(s,st);b=a;
      if(s.charAt(st.i)===','){st.i++;b=addr(s,st);if(a===null)a=r+1;if(b===null)b=r+1}
    }
    var rest=s.slice(st.i).trim(),m=rest.match(/^([a-zA-Z]+|!|=|&)?(!?)\s*([\s\S]*)$/),cmd=m[1]||'',bang=m[2],arg=m[3];
    if(!cmd&&a!==null){r=Math.max(0,Math.min(L.length-1,b-1));c=first(r);return}
    var from=(a===null?r+1:a)-1,to=(b===null?r+1:b)-1;
    if(from<0||to>=L.length||from>to){if(cmd||a!==null){msg='Not that many lines in buffer';return}}
    switch(cmd){
      case '':return;
      case 'w':case 'wr':case 'write':
        if(arg.charAt(0)==='q'&&!arg.trim().slice(1)){write();quit();return}
        write(arg.trim());return;
      case 'wq':case 'x':case 'xit':
        if(cmd==='x'&&!dirty){quit();return}
        if(write(arg.trim()))quit();
        return;
      case 'q':case 'quit':
        if(dirty&&!bang){msg='No write since last change (:quit! overrides)';return}
        quit();return;
      case 'e':case 'edit':
        if(dirty&&!bang){msg='No write since last change (:edit! overrides)';return}
        load(arg.trim()||file);return;
      case 'r':case 'read':{
        var n=P.find(arg.trim()||file,true);
        if(!n||n.type==='d'||n.prot){msg='"'+arg.trim()+'" No such file or directory';return}
        snap();
        var T=P.text(n);
        Array.prototype.splice.apply(L,[to+1,0].concat(T));
        r=to+1;c=0;
        msg='"'+arg.trim()+'" '+T.length+' lines';
        return;
      }
      case 'f':case 'file':
        if(arg.trim())file=arg.trim();
        msg=info();return;
      case 'set':case 'se':
        arg.split(/\s+/).forEach(function(o){
          if(/^(nu|number)$/.test(o))nu=true;
          else if(/^(nonu|nonumber)$/.test(o))nu=false;
        });
        return;
      case 's':case '&':
        subst(from,to,cmd==='&'?'':arg);return;
      case 'd':case 'de':case 'delete':
        snap();
        cut({r:from,c:0},{r:to,c:0},true,true);
        return;
      case 'g':case 'v':{
        var dl=arg.charAt(0),q=arg.split(dl),re2;
        try{re2=new RegExp(P.bre(q[1]||''))}catch(e){msg='Bad regular expression';return}
        var what=q.slice(2).join(dl).trim()||'p',f=a===null?0:from,e=a===null?L.length-1:to;
        if(what==='d'){
          snap();
          var keep=[];
          L.forEach(function(t,i){if(i<f||i>e||re2.test(t)!==(cmd==='g'))keep.push(t)});
          L=keep.length?keep:[''];
          r=Math.min(r,L.length-1);
          return;
        }
        if(what.charAt(0)==='s'){
          for(var y=f;y<=e;y++)if(re2.test(L[y])===(cmd==='g'))subst(y,y,what.slice(1));
          return;
        }
        msg='Only d and s after :g here';
        return;
      }
      case '=':msg=String(b===null?L.length:b);return;
      case '!':msg='No shell escape here: quit first';return;
      case 'vi':case 'visual':return;
      default:msg=cmd+': Not an editor command';
    }
  }
  function exKey(k){
    if(k==='Escape'||k==='C-['){mode='cmd';exLine='';return}
    if(k==='Backspace'||k==='C-h'){
      if(!exLine){mode='cmd';return}
      exLine=exLine.slice(0,-1);return;
    }
    if(k==='C-u'){exLine='';return}
    if(k==='Enter'||k==='C-m'||k==='C-j'){
      var s=exLine,kind=exKind;
      mode='cmd';exLine='';msg='';
      if(kind===':'){ex(s);return}
      var dir=kind==='/'?1:-1;
      if(s){
        try{search={re:new RegExp(P.bre(s)),dir:dir}}catch(e){bell('Bad regular expression');return}
      }
      else if(search)search.dir=dir;
      var t=again(false);
      if(!t){op=null;count=0;return}
      if(op){var o=op;op=null;apply(o,t);count=0;return}
      r=t.r;c=t.c;
      count=0;
      return;
    }
    if(k.length===1)exLine+=k;
  }

  /* ---------- the command keys ---------- */
  function move(t){if(!t){bell();return}r=t.r;c=t.c}
  function motionDone(t,wordish){
    count=0;
    if(!t){bell();op=null;return}
    if(op){
      var o=op;op=null;
      if(wordish)t.word=true;
      apply(o,t);
      return;
    }
    move(t);
  }
  function put(after,n){
    var e=regs[reg]||regs['"'];
    reg='"';
    if(!e){bell('Nothing in register');return}
    snap();
    while(n-->0&&L.length<MAXCOUNT){
      if(e.lw){
        var at=after?r+1:r;
        Array.prototype.splice.apply(L,[at,0].concat(e.t));
        r=at;c=first(r);
        after=true;
      }
      else if(e.t.length===1){
        var x=after&&L[r].length?c+1:c,s=L[r];
        L[r]=s.slice(0,x)+e.t[0]+s.slice(x);
        c=x+e.t[0].length-1;
        after=true;
      }
      else{
        var y=after&&L[r].length?c+1:c,s2=L[r],T=e.t.slice();
        T[0]=s2.slice(0,y)+T[0];
        var end=T.length-1,tail=T[end].length;
        T[end]=T[end]+s2.slice(y);
        Array.prototype.splice.apply(L,[r,1].concat(T));
        r+=end;c=tail;
      }
    }
  }
  function cmdKey(k){
    if(pending){var f=pending;pending=null;f(k);return}
    if(k==='Escape'||k==='C-['){if(!op&&!count)bell();op=null;count=0;return}
    if(/^[1-9]$/.test(k)||(k==='0'&&count)){count=Math.min(count*10+ +k,MAXCOUNT);return}
    var n=Math.min((count||1)*(op?opCount||1:1),MAXCOUNT),given=count>0||(op&&opCount>1);
    if(k==='"'){pending=function(x){reg=x};return}
    if(op&&k===op){ /* dd, cc, yy, << and >> */
      var last2=r+n-1;
      if(last2>=L.length){bell();op=null;count=0;return}
      var oo=op;op=null;count=0;
      apply(oo,{r:last2,c:0,lw:true});
      return;
    }
    if('fFtT'.indexOf(k)>=0){
      pending=function(ch){lastF={k:k,ch:ch};motionDone(findCh(k,ch,n))};
      return;
    }
    if(k==="'"||k==='`'){
      pending=function(ch){
        var m=marks[ch];
        if(!m||m.r>=L.length){bell('Mark not set');op=null;count=0;return}
        motionDone(k==="'"?{r:m.r,c:first(m.r),lw:true}:{r:m.r,c:m.c});
      };
      return;
    }
    if(k==='/'||k==='?'){mode='ex';exKind=k;exLine='';noRec=true;return}
    if(op==='c'&&(k==='w'||k==='W')&&cls(L[r].charAt(c),k==='W')){ /* cw changes to the end of the word */
      var ce=wordEnd(1,k==='W');
      if(cls(L[r].charAt(c+1),k==='W')!==cls(L[r].charAt(c),k==='W'))ce={r:r,c:c,inc:true};
      if(n>1)ce=wordEnd(n,k==='W');
      motionDone(ce);
      return;
    }
    var t=simple(k,n,given);
    if(t!==undefined){motionDone(t,k==='w'||k==='W');return}
    if(op){bell();op=null;count=0;return}
    count=0;
    switch(k){
      case 'i':snap();enterInsert(n);return;
      case 'I':snap();c=first(r);enterInsert(n);return;
      case 'a':snap();c=L[r].length?c+1:0;enterInsert(n);return;
      case 'A':snap();c=L[r].length;enterInsert(n);return;
      case 'o':snap();L.splice(r+1,0,'');r++;c=0;enterInsert(1);return;
      case 'O':snap();L.splice(r,0,'');c=0;enterInsert(1);return;
      case 'R':snap();enterInsert(1,'rep');return;
      case 'r':pending=function(ch){
        if(ch.length!==1||c+n>L[r].length){bell();return}
        snap();
        L[r]=L[r].slice(0,c)+ch.repeat(n)+L[r].slice(c+n);c+=n-1;
      };return;
      case 'x':
        if(!L[r].length){bell();return}
        snap();cut({r:r,c:c},{r:r,c:Math.min(L[r].length,c+n)},true,false);return;
      case 'X':
        if(!c){bell();return}
        snap();cut({r:r,c:Math.max(0,c-n)},{r:r,c:c},true,false);return;
      case 's':snap();if(L[r].length)cut({r:r,c:c},{r:r,c:Math.min(L[r].length,c+n)},true,false);enterInsert(1);return;
      case 'S':snap();setReg([L[r]],true);L[r]='';c=0;enterInsert(1);return;
      case 'D':snap();cut({r:r,c:c},{r:r,c:L[r].length},true,false);return;
      case 'C':snap();cut({r:r,c:c},{r:r,c:L[r].length},true,false);enterInsert(1);return;
      case 'Y':{var ky=c;cut({r:r,c:0},{r:Math.min(L.length-1,r+n-1),c:0},false,true);c=ky;return}
      case 'J':
        if(r+n>=L.length+(n>1?1:0)&&r+1>=L.length){bell();return}
        snap();
        for(var j=0;j<Math.max(1,n-1)&&r+1<L.length;j++){
          var sp=L[r].length;
          L[r]=L[r].replace(/\s+$/,'')+(L[r+1].trim()&&L[r].trim()?' ':'')+L[r+1].replace(/^\s+/,'');
          L.splice(r+1,1);
          c=Math.min(sp,L[r].length);
        }
        return;
      case '~':
        if(!L[r].length){bell();return}
        snap();
        var a=L[r].slice(c,c+n).replace(/./g,function(ch){return ch===ch.toLowerCase()?ch.toUpperCase():ch.toLowerCase()});
        L[r]=L[r].slice(0,c)+a+L[r].slice(c+a.length);c=Math.min(L[r].length-1,c+a.length);
        return;
      case 'p':put(true,n);return;
      case 'P':put(false,n);return;
      case 'u':
        if(!undo){bell('Nothing to undo');return}
        var was={L:L.slice(),r:r,c:c};
        L=undo.L;r=undo.r;c=undo.c;undo=was;dirty=true;
        return;
      case 'U':
        if(!uline||uline.r>=L.length){bell();return} /* its line has gone */
        var ut=L[uline.r];
        L[uline.r]=uline.t;uline.t=ut;r=uline.r;c=first(r);dirty=true;
        return;
      case '.':
        if(!last){bell();return}
        var keys=last.slice();
        replaying=true;
        keys.forEach(dispatch);
        replaying=false;
        changed=true;
        return;
      case 'm':pending=function(ch){marks[ch]={r:r,c:c}};return;
      case 'Z':pending=function(ch){
        if(ch!=='Z'){bell();return}
        if(!dirty||write())quit();
      };return;
      case ':':mode='ex';exKind=':';exLine='';noRec=true;return;
      case 'd':case 'c':case 'y':case '<':case '>':op=k;opCount=n;return;
      case 'C-f':case 'PageDown':scroll(pageH()*n,true);return;
      case 'C-b':case 'PageUp':scroll(-pageH()*n,true);return;
      case 'C-d':scroll(Math.floor(pageH()/2));return;
      case 'C-u':scroll(-Math.floor(pageH()/2));return;
      case 'C-e':if(top<L.length-1){top++;if(r<top)r=top}return;
      case 'C-y':if(top>0){top--}return;
      case 'C-g':msg=info();return;
      case 'C-l':return;
      case 'C-c':bell('Interrupt');return;
      default:bell();
    }
  }
  function dispatch(k){
    if(mode==='ins'||mode==='rep')insertKey(k);
    else if(mode==='ex')exKey(k);
    else cmdKey(k);
  }
  function feed(k){
    if(k==='C-c'&&mode==='ex'){mode='cmd';exLine='';render();return}
    if(mode==='cmd'&&k!=='.'&&!pending&&!op&&!count)msg='';
    var dot=k==='.'&&mode==='cmd'&&!pending;
    if(!dot&&!replaying)cur.push(k);
    dispatch(k);
    if(mode==='cmd'&&!pending&&!op&&!count){
      if(changed&&!noRec&&!dot&&cur.length)last=cur;
      cur=[];changed=false;snapped=false;noRec=false;
    }
    clamp();
    render();
  }
  return {feed:feed,draw:render,start:function(d){done=d;if(file)load(file);render()}};
}

P.command({names:['vi'],path:'/bin',
  man:{what:'the visual editor',syn:'vi [ file ]',desc:[
    'edits a file on the full screen. you are in command mode: i or a to type text and escape to stop. h j k l move, or the arrow keys. x deletes, dd deletes a line, u undoes, and . repeats.',
    '',
    ':w writes. :q quits. :q! quits regardless. ZZ writes and quits.'],bugs:[
    'there is a way out. everyone finds it eventually.']},
  run:function(a){
    if(P.piped()){P.typeLine('ex: Visual needs addressable cursor or upline capability','err');return}
    P.program(function(S,res){
      var V=Vi(a[0],S);
      V.start(res);
      return V;
    });
  }});

})(window.Phosphor);
