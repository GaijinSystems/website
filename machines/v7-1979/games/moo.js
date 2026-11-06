/* PHOSPHOR-9 terminal: machine "v7-1979", moo. Ported to JavaScript for this terminal from 2.11BSD's
   games/pdp/moo.s and etc.s, which carry no notice; V7 shipped only the binary, whose rand this follows. */
(function(P){
'use strict';
P.command({names:['moo'],run:function(){
  var rnd=P.etcrand();
  P.cprog(function*(io){
    io.onint=function(){io.print('\n')};
    var act,ibuf,nguess,c,r,i,bulls,cows,END={};
    function* getc(){var c=yield* io.getc();if(c===null){io.print('\n');throw END}return c}
    function* flush(){while((yield* getc())!=='\n');}
    try{
      io.print('MOO\n');
      for(;;){
        io.print('new game\n');
        act=[-1,-1,-1,-1];
        for(i=0;i<4;){r=rnd(10);if(act.indexOf(r)<0)act[i++]=r}
        nguess=0;
        guess:for(;;){
          cows=bulls=0;
          io.print('? ');
          ibuf=[-1,-1,-1,-1,-1];
          var bad=false;
          for(i=0;i<4&&!bad;i++){
            c=yield* getc();
            ibuf[i]=c; /* the raw character, until it proves to be a digit */
            r=c.charCodeAt(0)-48;
            if(r<0||r>=10||ibuf.indexOf(r)>=0&&ibuf.indexOf(r)<4){bad=true;break}
            ibuf[i]=r;
            if(act.indexOf(r)>=0)cows++;
          }
          if(!bad&&(yield* getc())!=='\n')bad=true;
          if(bad){
            io.print('bad guess\n');
            if(ibuf.indexOf('\n')<0)yield* flush();
            continue guess;
          }
          for(i=0;i<4;i++)if(ibuf[i]===act[i]){bulls++;cows--}
          io.print(bulls+' bulls; '+cows+' cows\n');
          if(bulls===4)break;
          nguess++;
        }
        io.print(nguess+' guesses\n\n');
      }
    }catch(e){if(e!==END)throw e}
  });
}});
})(window.Phosphor);
