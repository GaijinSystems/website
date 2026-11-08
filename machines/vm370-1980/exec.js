/* PHOSPHOR-9 terminal: machine "vm370-1980", the EXEC interpreter: the CMS EXEC language of Release 6, with
   its &-statements, eight-character tokens, &1 to &30, loops, &READ and the console stack, and the execution
   summary that &CONTROL sets.
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE.
   After the CMS Command and Macro Reference (GC20-1818), Section 5; the program is new. */
Phosphor.setup(function(P){
'use strict';
var V=P.vm=P.vm||{};
var up=V.up;
/* what an EXEC types goes through V.pend, a line at a time: an attention (^C) drops the queued steps that would type
   them, but not the lines, and when the EXEC carries on they are typed first. So nothing it worked out ahead is lost,
   as on Release 6, where after the attention the program resumes execution (CMS User's Guide, GC20-1819, Virtual Machine
   Interruptions: the program resumes execution) */
V.pend=[];
function next(){var f=V.pend.shift();if(!f)return;V.inPend=true;try{f()}finally{V.inPend=false}}
function emit(f){V.pend.push(f);P.queue(next)}
V.emit=emit;
V.flush=function(){for(var n=V.pend.length;n>0;n--)P.queue(next)}; /* the lines an attention left untyped */
function out(s){emit(function(){P.typeLine(s)})}
function err(s){emit(function(){V.em(s,'err')})}
V.stack=[];V.level=0;
V.execs=[]; /* the EXECs running, the outermost first */
V.globals=[1,1,1,1,1,1,1,1,1,1];

/* a line from the console stack if there is one, else from the terminal. A stack that keeps filling itself (EDIT's
   STACK reading STACK back) lets the terminal breathe every few hundred lines, so an attention (^C) can stop it and HX
   end it */
var fromStack=0;
V.read=function(then,trap,prog){
  if(V.hold(function(){V.read(then,trap,prog)}))return;
  if(V.stack.length){var l=V.stack.shift();if(++fromStack%250===0)P.pause(1);P.queue(function(){then(l)});return}
  fromStack=0;
  V.ask(then,trap,false,prog);
};
/* a CMS program's read: &READ, and FORMAT's and SORT's questions. An attention (^C) while it is up does not end the
   program. CP types its exclamation point (cms.js), the line typed so far is cancelled, and CMS reads again: on the
   unit exception CP gives for it, DMSCIT reissues the read ("user cancelled input line"); so a line half typed is
   neither kept nor typed again. At an empty read the attention is CMS's own (imm): the line typed after it may be an
   Immediate command, HX ending every EXEC (CMS, no ready message), HT and RT stopping and resuming the typing, HO, SO,
   RO, TS, TE and HB with nothing here to do, and any other line goes to the read. A cancelled line leaves the read as
   it was. VM/370 Release 6 source, DMKCNS and DMSCIT; Terminal User's Guide (GC20-1810), Figure 6, Attention Handling
   in VM Mode. The read is the console stack's first line if there is one (DMSCRD), so while a command runs it waits
   its turn in V.pend behind what the command types: an attention before it is up leaves it to come, and the line
   typed after the attention, stacked by DMSCIT, answers it. What the program then types goes through V.pend too */
V.progRead=function(then,imm){
  if(V.busy&&!V.inPend){V.emit(function(){V.progRead(then,imm)});return}
  var k=function(l){
    if(l===P.INT){var t=V.typed;V.typed=false;V.progRead(then,imm||!t);return}
    var w=imm&&l!==null?V.immediate(up(l.trim())):'';
    if(w==='HX'){V.abend();V.pend=[];then(P.INT);return}
    if(w){V.progRead(then,false);return}
    var was=V.cap;V.cap=V.cap||V.busy;
    try{then(l)}finally{V.cap=was}
  };
  V.read(k,true,true);
};

V.execCmd=function(a){return V.exec(a,{})}; /* the EXEC command: EXEC fn args */
V.exec=function(W,ctx){ /* W: [fn, args...] in CMS's tokens; runs the EXEC; its return code comes back through V.rc */
  var name=W[0]==='EXEC'?W[1]:W[0],args=W[0]==='EXEC'?W.slice(2):W.slice(1);
  if(!name){err('DMSEXC001E NO FILENAME SPECIFIED');return 24}
  var r=V.find(name,'EXEC','*');
  if(!r){err('DMSEXT072E ERROR IN EXEC FILE '+name+', LINE 0 - FILE NOT FOUND');return 801}
  if(V.level>=19){V.abend('DMSITS135S MAXIMUM SVC DEPTH 20 HAS BEEN EXCEEDED WITH CALL AT F08BA6');return 0} /* a 20th EXEC: past CMS's SVC depth of 20, which allows 19 EXECs (so on Release 6, and System Messages 135S) */
  if(r.f.prot&&!V.mayRead()){err('DMSEXT072E ERROR IN EXEC FILE '+name+', LINE 0 - ERROR READING FILE');return 806}
  var f=r.f,S={fn:f.fn,lines:f.lines.map(function(l){var t=V.text(l);return f.recfm==='F'?t.slice(0,72):t}),pc:0,vars:{},
    control:'CMS',time:false,msg:true,error:null,loops:[],rc:0,args:[],reading:0,profile:!!ctx.profile,n:0};
  setArgs(S,args);
  V.level++;V.execs.push(S);
  V.rc=0;
  P.queue(function(){run(S)});
  P.queue(function(){done(S)});
  return 0;
};
/* CMS ends abnormally (abend 0F2, past the SVC depth): every EXEC stops, and CMS says only CMS, with no ready message;
   so on Release 6, where the recovery comes with the next command. HX stops them all the same way */
V.abend=function(msg){
  if(msg)err(msg);
  V.execs.forEach(function(S){S.stop=true});
  V.stack=[];V.abended=true;
};
function done(S){V.level=Math.max(0,V.level-1);V.rc=S.rc;var i=V.execs.indexOf(S);if(i>=0)V.execs.splice(i)}
/* attention (^C) while the editor typed for an EXEC stopped the typing and, with it, what the EXECs had still to do; on
   Release 6 the attention only interrupts the typing, and once the edit ends (FILE or QUIT) the EXECs carry on, the
   innermost first, each from the command it was waiting on. True when there were EXECs to carry on */
V.resume=function(){
  var L=V.execs.slice().reverse();
  if(!L.length||!L.every(function(S){return S.waiting}))return false;
  V.rc=0;V.flush();
  L.forEach(function(S){
    P.queue(function(){after(S);run(S)});
    P.queue(function(){done(S)});
  });
  return true;
};
/* after an attention to a running command or EXEC, the line typed not HX: what it had still to type is typed, and every
   EXEC carries on where it was, the innermost first */
V.carryOn=function(){
  if(V.execs.length)V.rc=0; /* a command at the terminal keeps its own */
  V.flush();
  V.execs.slice().reverse().forEach(function(S){
    P.queue(function(){if(S.waiting)after(S);run(S)});
    P.queue(function(){done(S)});
  });
};
function setArgs(S,args){
  S.args=args.slice(0,30).map(function(a){return a==='%'?'':a});
  S.vars['&INDEX']=String(S.args.length); /* as the arguments were given: &5 = X later does not change it (so on Release 6) */
}
/* the interpreter's errors and their return codes, as the Release 6 Command and Macro Reference lists them (801, 802,
   805, 808, 810, 812 and 814 also seen on Release 6 under Hercules) */
var ERR={GOTO:[802,'&SKIP OR &GOTO ERROR'],COND:[808,'INVALID FORM OF CONDITION'],CONV:[812,'CONVERSION ERROR'],WORD:[816,'INVALID CONTROL WORD'],
  DEPTH:[805,'MAX DEPTH OF LOOP NESTING EXCEEDED'],SPECIAL:[810,'MISUSE OF SPECIAL VARIABLE'],
  FUNC:[814,'MISUSE OF BUILT-IN FUNCTION']};
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
function subst(S,tok,keepFirst,test){ /* every symbol in every token, again and again until none is left; null tokens drop out.
                                         test: a condition, where &* and &$ stand for the arguments and stay as they are */
  var o=[];
  for(var i=0;i<tok.length;i++){
    var t=tok[i];
    if(t==='&LITERAL'&&i+1<tok.length){o.push(tok[++i]);continue}
    if(i===0&&keepFirst||test&&(t==='&*'||t==='&$')){o.push(t);continue}
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
var SPACEMAX=1000; /* &SPACE: more blank lines than a page or two of fanfold is only a long wait */

function run(S){
  while(!S.stop&&S.pc<S.lines.length){
    if(++S.n%250===0){P.pause(1);P.queue(function(){run(S)});return} /* every 250 statements, CMS commands and &READs among them: let the terminal breathe, and ^C stop it */
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
  if(L.times!=null?L.done>=L.times:cond(S,subst(S,L.cond,false,true))===true){S.loops.pop();if(S.loops.length)loopEnd(S);return}
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
    S.pc++; /* no &END: the rest of the file, and no complaint */
    if(w==='&BEGTYPE')L.forEach(function(l){l=all?l:l.slice(0,72);emit(function(){P.say([l])})});
    else if(w==='&BEGSTACK'){if(T.indexOf('LIFO')>0)V.stack=L.reverse().concat(V.stack);else V.stack=V.stack.concat(L)}
    else if(w==='&BEGEMSG')L.forEach(function(l){err('DMS'+l)});
    else V.closeSpool('00D',L,S.fn,'EXEC');
    return;
  }
  if(w==='&END')return;
  /* an assignment: &X = value */
  if(/^&/.test(w)&&T[1]==='='&&!/^&(IF|LOOP|TYPE|READ|STACK|CONTROL|GOTO|SKIP|EXIT|ERROR|ARGS)$/.test(w)){
    var lhs='&'+(subst(S,[w.slice(1)],false)[0]||''),R=subst(S,T.slice(2)); /* the leftmost symbol is the name, not its value */
    /* &31 on, and what only EXEC sets, may not be assigned; &0 and a name that comes to nothing may (so on Release 6) */
    if(/^&\d+$/.test(lhs)?+lhs.slice(1)>30:/^&(INDEX|EXEC|TYPEFLAG|READFLAG|LINENUM|DOS|DISK.)$/.test(lhs)){fail(S,'SPECIAL');return}
    var v;
    if(R[0]==='&CONCAT')v=R.slice(1).join('').slice(0,8);
    else if(R[0]==='&LENGTH')v=String((R[1]||'').length);
    else if(R[0]==='&DATATYPE')v=num(R[1]||'x')?'NUM':'CHAR';
    else if(R[0]==='&SUBSTR'){var s=R[1]||'',i=+R[2],j=R[3]!==undefined?+R[3]:undefined;if(!(i>=1)){fail(S,'FUNC');return}v=s.substr(i-1,j)}
    else if(R.length>1&&R.every(function(x,k){return k%2?x==='+'||x==='-':num(x)})){v=+R[0];for(var k=1;k<R.length;k+=2)v=R[k]==='+'?v+(+R[k+1]):v-(+R[k+1]);v=String(v)}
    else if(R.length>1&&R.some(function(x){return x==='+'||x==='-'})){fail(S,'CONV');return}
    else v=(R[0]||'').slice(0,8);
    if(/^&\d+$/.test(lhs)&&lhs!=='&0'){S.args[+lhs.slice(1)-1]=v;return}
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
  S.waiting=true;
  P.queue(function(){V.rc=V.execCommand(C,S)||0});
  P.queue(function(){after(S)});
  return 'wait';
}
function after(S){ /* the command's return code, as the EXEC sees it */
  var rc=V.rc||0;
  S.waiting=false;
  if(V.abended){S.stop=true;return}
  V.rc0=rc;
  if(rc&&S.control!=='OFF')out('+++ R('+V.rcs(rc)+') +++');
  if(rc&&S.error&&!S.inError){S.inError=true;var e=S.error.slice();stmt(S,e.join(' '));S.inError=false}
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
      var n=Math.min(+(subst(S,T.slice(1))[0]||1),SPACEMAX);for(var i=0;i<n;i++)out('');return;
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
      A=subst(S,T.slice(1),false,true);
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
      if(/^-/.test(first)){end=label(S,first);if(end<0){fail(S,'GOTO');return}}
      else if(num(A[0]||'')){end=S.pc+(+A[0])-1}
      else{fail(S,'CONV');return}
      if(S.loops.length>=4){fail(S,'DEPTH');return}
      var L={start:S.pc,end:end,done:0,times:null,cond:null};
      if(A.length===2&&num(A[1]))L.times=+A[1];
      else if(A.length>=4){L.cond=T.slice(2);if(cond(S,subst(S,L.cond,false,true))===true){S.pc=end+1;return}}
      else{fail(S,'COND');return}
      if(L.times===0){S.pc=end+1;return}
      S.loops.push(L);return;
    case '&READ':
      A=T.slice(1);
      var what=A[0]||'1';
      if(what==='ARGS'||what==='VARS'){
        V.progRead(function(l){
          if(l===null||l===P.INT){S.stop=true;return}
          var X=tokens(up(l));
          if(what==='ARGS')setArgs(S,X);
          else A.slice(1).forEach(function(v,i){S.vars[v]=X[i]==='%'?'':(X[i]||'')});
        });
        return 'wait';
      }
      var cnt=+what;
      if(!(cnt>=1)){fail(S,'CONV');return}
      (function more(k){
        if(!k)return;
        V.progRead(function(l){
          if(l===null||l===P.INT){S.stop=true;return}
          stmt(S,up(l));
          more(k-1);
        });
      })(cnt);
      return 'wait';
  }
  fail(S,'WORD');
}
});
