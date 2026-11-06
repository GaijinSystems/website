/* PHOSPHOR-9 terminal: machine "v7-1979", what a ported C program needs in order to stay in the shape of the C:
   a program is a generator function, and it reads with yield*. Nothing here is from the originals.
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE. */
Phosphor.setup(function(P){
'use strict';
/* V7's rand(3): 1103515245 in a 32-bit long, the top half taken */
P.v7rand=function(seed){
  var x=seed&0xffff;
  return function(){x=(Math.imul(x,1103515245)+12345)|0;return (x>>16)&0o77777};
};
/* the Sixth Edition's rand(), which the V7 binaries of hangman and wump were linked with */
P.v6rand=function(seed){
  var x=seed;
  return function(){x=(Math.imul(x,13077)+6925)&0o77777;return x};
};
/* rnd(n), 0 to n-1, as in the V7 binaries of bj and moo, seeded from the clock at its first call;
   2.11BSD's etc.s has a later one */
P.etcrand=function(){
  var randx=0;
  return function(n){
    if(!randx)randx=Math.floor(Date.now()/1000)&0xffff;
    randx=(Math.imul(randx,13077)+6925)&0xffff;
    return ((randx&0o77777)*2*n)>>>16;
  };
};
/* run the program; body(io) is a generator. io.print writes (a line is sent when its newline comes); yield* io.getc()
   gives one character, or null at the end of the input; yield* io.gets() a line without its newline, or null.
   io.drain() throws away whatever input is waiting.
   io.onint: what the interrupt does: return true to read on, false or nothing to stop. No handler stops the program. */
P.cprog=function(body){
  var out='',line='',pos=0,pipe=P.stdin(),np=0,gen,io={
    onint:null,
    print:function(s){
      out+=s;
      var i=out.lastIndexOf('\n');
      if(i>=0){P.say(out.slice(0,i).split('\n'));out=out.slice(i+1)}
    },
    getc:function*(){
      while(pos>=line.length){
        var l=pipe?(np<pipe.length?pipe[np++]:null):yield;
        if(l===null)return null;
        line=l+'\n';pos=0;
      }
      return line.charAt(pos++);
    },
    drain:function(){line='';pos=0;if(pipe)np=pipe.length}, /* 4.3BSD wump's drain(): what is waiting to be read is thrown away */
    gets:function*(){
      var s='',c;
      while((c=yield* io.getc())!==null&&c!=='\n')s+=c;
      return c===null&&s===''?null:s;
    }
  };
  function finish(){if(out){P.say([out]);out=''}}
  function step(v){
    var r=gen.next(v);
    if(r.done)finish();else wait();
  }
  function wait(){ /* the part line goes up as the prompt; an interrupt the program survives leaves it waiting for the same line */
    var p=out;out='';
    P.ask(p,function(l){
      if(l===P.INT){if(io.onint&&io.onint())wait();else{finish();P.status(130)}return} /* killed by the signal: the shell's 0200+2 */
      step(l);
    },true);
  }
  gen=body(io);
  P.queue(function(){step()});
};
});
