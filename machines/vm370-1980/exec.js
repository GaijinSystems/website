/* PHOSPHOR-9 terminal: machine "vm370-1980", the EXEC interpreter: the CMS EXEC language of Release 6, with
   its &-statements, eight-character tokens, &1 to &30, loops, &READ and the console stack, and the execution
   summary that &CONTROL sets.
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE.
   After the CMS Command and Macro Reference (GC20-1818), Section 5; the program is new. */
Phosphor.setup(function(P){
'use strict';
var V=P.vm=P.vm||{};
var up=V.up;
function out(s){P.typeLine(s)}
function err(s){V.em(s,'err')}
V.stack=[];V.level=0;
V.globals=[1,1,1,1,1,1,1,1,1,1];

/* a line from the console stack if there is one, else from the terminal */
V.read=function(then,trap){
  if(V.stack.length){var l=V.stack.shift();P.queue(function(){then(l)});return}
  V.ask(then,trap);
};

V.execCmd=function(a){return V.exec(a,{})}; /* the EXEC command: EXEC fn args */
V.exec=function(W,ctx){ /* W: [fn, args...] in CMS's tokens; runs the EXEC; its return code comes back through V.rc */
  var name=W[0]==='EXEC'?W[1]:W[0],args=W[0]==='EXEC'?W.slice(2):W.slice(1);
  if(!name){err('DMSEXC001E NO FILENAME SPECIFIED');return 24}
  var r=V.find(name,'EXEC','*');
  if(!r){err('DMSEXT072E ERROR IN EXEC FILE '+name+', LINE 0 - FILE NOT FOUND');return 801}
  if(V.level>=19){err('DMSEXT072E ERROR IN EXEC FILE '+name+', LINE 0 - TOO MANY NESTED EXECS');return 813}
  var f=r.f,S={fn:f.fn,lines:f.lines.map(function(l){var t=V.text(l);return f.recfm==='F'?t.slice(0,72):t}),pc:0,vars:{},
    control:'CMS',time:false,msg:true,error:null,loops:[],rc:0,args:[],reading:0,profile:!!ctx.profile};
  setArgs(S,args);
  V.level++;
  V.rc=0;
  P.queue(function(){run(S)});
  P.queue(function(){V.level=Math.max(0,V.level-1);V.rc=S.rc});
  return 0;
};
function setArgs(S,args){
  S.args=args.slice(0,30).map(function(a){return a==='%'?'':a});
  S.vars['&INDEX']=String(S.args.length);
}
/* the interpreter's errors, with the return codes it gave them (801 to 812 checked against Release 6) */
var ERR={GOTO:[802,'&SKIP OR &GOTO ERROR'],COND:[808,'INVALID FORM OF CONDITION'],CONV:[812,'CONVERSION ERROR'],END:[803,'MISSING &END'],
  WORD:[804,'INVALID CONTROL WORD'],LOOP:[805,'INVALID &LOOP'],DEPTH:[806,'TOO MANY NESTED LOOPS'],ASSIGN:[807,'INVALID ASSIGNMENT'],
  READ:[809,'INVALID &READ'],FUNC:[810,'INVALID FUNCTION'],ARGS:[811,'TOO MANY ARGUMENTS']};
function fail(S,k){
  var e=ERR[k];
  err('DMSEXT072E ERROR IN EXEC FILE '+S.fn+', LINE '+S.pc+' - '+e[1]);
  S.rc=e[0];S.stop=true;
}
function special(S,k){
  if(/^&\d+$/.test(k)){var n=+k.slice(1);return n===0?S.fn:(S.args[n-1]||'')}
  switch(k){
    case '&INDEX':return String(S.args.length);
    case '&RETCODE':return String(V.rc0||0);
    case '&EXEC':return S.fn;
    case '&GLOBAL':return String(V.level);
    case '&LINENUM':return String(S.pc);
    case '&READFLAG':return V.stack.length?'STACK':'CONSOLE';
    case '&TYPEFLAG':return 'RT';
    case '&DOS':return 'OFF';
    case '&DISK*':var m=V.modes().filter(function(x){return V.acc[x].rw})[0];return m||'NONE';
    case '&DISK?':return V.roomiest()||'NONE';
  }
  var g=k.match(/^&GLOBAL(\d)$/);if(g)return String(V.globals[+g[1]]);
  var d=k.match(/^&DISK([A-Z])$/);if(d)return V.acc[d[1]]?'CMS':'NA';
  return null;
}
function value(S,k){
  if(Object.prototype.hasOwnProperty.call(S.vars,k))return S.vars[k];
  var s=special(S,k);
  return s===null?'':s;
}
function tokens(t){ /* EXEC scans a line into eight-character tokens, with parentheses as tokens of their own */
  return t.replace(/\(/g,' ( ').replace(/\)/g,' ) ').trim().split(/\s+/).filter(Boolean).map(function(w){return w.slice(0,8)});
}
function subst(S,tok,keepFirst){ /* every symbol in every token, again and again until none is left; null tokens drop out */
  var o=[];
  for(var i=0;i<tok.length;i++){
    var t=tok[i];
    if(t==='&LITERAL'&&i+1<tok.length){o.push(tok[++i]);continue}
    if(i===0&&keepFirst){o.push(t);continue}
    for(var n=0;n<20&&/&/.test(t);n++){
      var r=t.replace(/&[A-Z0-9$#@*?]*/g,function(m){return m==='&'?m:value(S,m)});
      if(r===t)break;t=r;
    }
    t=t.slice(0,8);
    if(t!=='')o.push(t);
  }
  return o;
}
function num(s){return /^[+-]?\d+$/.test(s)}
function compare(a,op,b){
  var n=num(a)&&num(b),x=n?+a:a,y=n?+b:b;
  switch(op){
    case '=':case 'EQ':return x===y;
    case '¬=':case '^=':case 'NE':case '\\=':return x!==y;
    case '<':case 'LT':return x<y;
    case '<=':case 'LE':return x<=y;
    case '>':case 'GT':return x>y;
    case '>=':case 'GE':return x>=y;
  }
  return null;
}
function cond(S,T){ /* tok op tok, with &$ and &* over the arguments; null when it cannot be read */
  var a=T[0],op=T[1],b=T[2];
  if(op===undefined)return null;
  function ex(x){return x==='&*'||x==='&$'}
  if(ex(a)||ex(b)){
    var L=S.args.filter(function(x){return x!==''});if(!L.length)return 'null';
    var other=ex(a)?b:a,any=(ex(a)?a:b)==='&$';
    var R=L.map(function(x){return ex(a)?compare(x,op,other):compare(other,op,x)});
    return any?R.some(Boolean):R.every(Boolean);
  }
  return compare(a,op,b);
}
function label(S,l){ /* the line of a -label: after this one, round to the top, and up to here */
  var n=S.lines.length;
  for(var k=0;k<n;k++){
    var i=(S.pc+k)%n,t=tokens(S.lines[i].trim())[0]||'';
    if(t===l.slice(0,8))return i;
  }
  return -1;
}
function show(S,T){if(S.control==='ALL')out(T.join(' '))}

function run(S){
  while(!S.stop&&S.pc<S.lines.length){
    var raw=S.lines[S.pc];S.pc++;
    var r=stmt(S,raw);
    loopEnd(S);
    if(r==='wait'){P.queue(function(){run(S)});return}
  }
}
function loopEnd(S){ /* the end of a loop's body: back to its top, or out */
  var L=S.loops[S.loops.length-1];
  if(!L||S.stop)return;
  if(S.pc<=L.end)return;
  L.done++;
  if(L.times!=null?L.done>=L.times:cond(S,subst(S,L.cond))===true){S.loops.pop();if(S.loops.length)loopEnd(S);return}
  S.pc=L.start;
}
function stmt(S,raw){
  var line=raw.replace(/\s+$/,'');
  if(!line.trim())return;
  var T=tokens(line);
  if(T[0].charAt(0)==='-'){T=T.slice(1);if(!T.length)return} /* a label */
  if(T[0].charAt(0)==='*')return; /* a comment, as many wrote them */
  var w=T[0];
  if(w==='&BEGTYPE'||w==='&BEGSTACK'||w==='&BEGEMSG'||w==='&BEGPUNCH'){
    var all=T.indexOf('ALL')>0,L=[];
    while(S.pc<S.lines.length&&!/^&END\b/i.test(S.lines[S.pc])){L.push(S.lines[S.pc]);S.pc++}
    if(S.pc>=S.lines.length){fail(S,'END');return}
    S.pc++;
    if(w==='&BEGTYPE')P.say(L.map(function(l){return all?l:l.slice(0,72)}));
    else if(w==='&BEGSTACK'){if(T.indexOf('LIFO')>0)V.stack=L.reverse().concat(V.stack);else V.stack=V.stack.concat(L)}
    else if(w==='&BEGEMSG')L.forEach(function(l){err('DMS'+l)});
    else V.closeSpool('00D',L,S.fn,'EXEC');
    return;
  }
  if(w==='&END')return;
  /* an assignment: &X = value */
  if(/^&/.test(w)&&T[1]==='='&&!/^&(IF|LOOP|TYPE|READ|STACK|CONTROL|GOTO|SKIP|EXIT|ERROR|ARGS)$/.test(w)){
    var lhs='&'+(subst(S,[w.slice(1)],false)[0]||''),R=subst(S,T.slice(2)); /* the leftmost symbol is the name, not its value */
    if(lhs.length<2&&!/^&/.test(w)){fail(S,'ASSIGN');return}
    if(/^&\d+$/.test(w)){var n=+w.slice(1);if(n<1||n>30){fail(S,'ASSIGN');return}}
    var v;
    if(R[0]==='&CONCAT')v=R.slice(1).join('').slice(0,8);
    else if(R[0]==='&LENGTH')v=String((R[1]||'').length);
    else if(R[0]==='&DATATYPE')v=num(R[1]||'x')?'NUM':'CHAR';
    else if(R[0]==='&SUBSTR'){var s=R[1]||'',i=+R[2],j=R[3]!==undefined?+R[3]:undefined;if(!(i>=1)){fail(S,'FUNC');return}v=s.substr(i-1,j)}
    else if(R.length>1&&R.every(function(x,k){return k%2?x==='+'||x==='-':num(x)})){v=+R[0];for(var k=1;k<R.length;k+=2)v=R[k]==='+'?v+(+R[k+1]):v-(+R[k+1]);v=String(v)}
    else if(R.length>1&&R.some(function(x){return x==='+'||x==='-'})){fail(S,'CONV');return}
    else v=(R[0]||'').slice(0,8);
    if(/^&\d+$/.test(lhs)){S.args[+lhs.slice(1)-1]=v;return}
    var g=lhs.match(/^&GLOBAL(\d)$/);
    if(g){if(!num(v)){fail(S,'CONV');return}V.globals[+g[1]]=+v;return}
    if(lhs==='&RETCODE'){V.rc0=+v||0;return}
    S.vars[lhs]=v;
    show(S,[lhs,'='].concat(R));
    return;
  }
  if(w.charAt(0)==='&')return control(S,w,T,raw);
  /* anything else is a CMS command */
  var C=subst(S,T);
  if(!C.length)return;
  return command(S,C);
}
function command(S,C){
  var line=C.join(' ');
  if(S.control==='CMS'||S.control==='ALL')out((S.time?V.hms(P.now())+' ':'')+line);
  var rc;
  P.queue(function(){V.rc=V.execCommand(C,S)||0});
  P.queue(function(){
    rc=V.rc||0;
    V.rc0=rc;
    if(rc&&S.control!=='OFF')out('+++ R('+V.rcs(rc)+') +++');
    if(rc&&S.error&&!S.inError){S.inError=true;var e=S.error.slice();stmt(S,e.join(' '));S.inError=false}
  });
  return 'wait';
}
V.execCommand=function(C,S){ /* a command from an EXEC: no implied CP; an unknown name is -3, quietly */
  var w=C[0];
  if(w==='CP')return V.command(C.join(' '),{exec:S});
  if(V.termWord(w,C.join(' ')))return 0;
  if(w==='EXEC'||V.find(w,'EXEC','*'))return V.exec(C,{});
  var n=V.cmsName(w);
  if(!n&&!V.find(w,'MODULE','*'))return -3;
  V.nomsg=!S.msg&&/^(ERASE|LISTFILE|RENAME|STATE)$/.test(n||'');
  var rc=V.command(C.join(' '),{exec:S});
  V.nomsg=false;
  return rc;
};
function control(S,w,T,raw){
  var A;
  switch(w){
    case '&CONTROL':
      if(T.length===1){S.control='CMS';S.time=false;S.msg=true;return}
      T.slice(1).forEach(function(x){
        if(/^(OFF|ERROR|CMS|ALL)$/.test(x))S.control=x;
        else if(x==='TIME')S.time=true;else if(x==='NOTIME')S.time=false;
        else if(x==='MSG')S.msg=true;else if(x==='NOMSG')S.msg=false;
      });
      return;
    case '&TYPE':
      A=subst(S,T.slice(1));show(S,['&TYPE'].concat(A));out(A.join(' '));return;
    case '&SPACE':
      var n=+(subst(S,T.slice(1))[0]||1);for(var i=0;i<n;i++)out('');return;
    case '&EMSG':
      A=subst(S,T.slice(1));err('DMS'+A.join(' '));return;
    case '&STACK':
      A=subst(S,T.slice(1));
      if(A[0]==='LIFO'){V.stack.unshift(A.slice(1).join(' '));return}
      if(A[0]==='FIFO')A=A.slice(1);
      if(A[0]==='HT'||A[0]==='RT')return;
      V.stack.push(A.join(' '));return;
    case '&PUNCH':
      A=subst(S,T.slice(1));V.closeSpool('00D',[A.map(function(x){return x.padEnd(8)}).join(' ').padEnd(80)],S.fn,'EXEC');return;
    case '&ARGS':
      setArgs(S,subst(S,T.slice(1)));return;
    case '&EXIT':
      A=subst(S,T.slice(1));
      if(A[0]&&!num(A[0])){fail(S,'CONV');return}
      S.rc=+(A[0]||0);S.stop=true;return;
    case '&ERROR':
      S.error=T.slice(1);if(S.error[0]==='&CONTINUE')S.error=null;return;
    case '&CONTINUE':return;
    case '&HEX':case '&TIME':return;
    case '&GOTO':
      A=subst(S,T.slice(1));
      var to=A[0];
      if(!to){fail(S,'GOTO');return}
      S.loops=[];
      if(to==='TOP'){S.pc=0;return}
      if(num(to)){var k=+to;if(k<1||k>S.lines.length){fail(S,'GOTO');return}S.pc=k-1;return}
      var at=label(S,to);
      if(at<0){fail(S,'GOTO');return}
      S.pc=at;return;
    case '&SKIP':
      A=subst(S,T.slice(1));
      var sk=A.length?+A[0]:1;
      if(isNaN(sk)){fail(S,'GOTO');return}
      S.pc+=sk;
      if(S.pc<0){fail(S,'GOTO');return}
      return;
    case '&IF':
      A=subst(S,T.slice(1));
      if(A.length<4){fail(S,'COND');return}
      var c=cond(S,A);
      if(c===null){fail(S,'COND');return}
      if(c==='null'||!c)return;
      /* the statement that follows the test, taken from the line as written so its own symbols are its own */
      var rest=tokens(raw.trim()).slice(raw.trim().charAt(0)==='-'?5:4);
      return stmt(S,rest.join(' '));
    case '&LOOP':
      A=subst(S,T.slice(1));
      var first=T[1]||'',end;
      if(/^-/.test(first)){end=label(S,first);if(end<0){fail(S,'LOOP');return}}
      else if(num(A[0]||'')){end=S.pc+(+A[0])-1}
      else{fail(S,'LOOP');return}
      if(S.loops.length>=4){fail(S,'DEPTH');return}
      var L={start:S.pc,end:end,done:0,times:null,cond:null};
      if(A.length===2&&num(A[1]))L.times=+A[1];
      else if(A.length>=4){L.cond=T.slice(2);if(cond(S,subst(S,L.cond))===true){S.pc=end+1;return}}
      else{fail(S,'LOOP');return}
      if(L.times===0){S.pc=end+1;return}
      S.loops.push(L);return;
    case '&READ':
      A=T.slice(1);
      var what=A[0]||'1';
      if(what==='ARGS'||what==='VARS'){
        V.read(function(l){
          if(l===null||l===P.INT){S.stop=true;return}
          var X=tokens(up(l));
          if(what==='ARGS')setArgs(S,X);
          else A.slice(1).forEach(function(v,i){S.vars[v]=X[i]==='%'?'':(X[i]||'')});
        },true);
        return 'wait';
      }
      var cnt=+what;
      if(!(cnt>=1)){fail(S,'READ');return}
      (function more(k){
        if(!k)return;
        V.read(function(l){
          if(l===null||l===P.INT){S.stop=true;return}
          stmt(S,up(l));
          more(k-1);
        },true);
      })(cnt);
      return 'wait';
  }
  fail(S,'WORD');
}
});
