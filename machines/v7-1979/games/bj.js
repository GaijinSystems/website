/* PHOSPHOR-9 terminal: machine "v7-1979", bj, black jack. Ported to JavaScript for this terminal from 2.11BSD's
   games/pdp/bj.s, us.s and etc.s, which carry no notice; V7 shipped only the binary, and where they differ this follows
   the binary, checked under a simulator: its rand, and the end of the input totals up as an interrupt does. */
(function(P){
'use strict';
P.command({names:['bj'],run:function(){
  var rnd=P.etcrand(),deck=[],i;
  for(i=0;i<52;i++)deck.push(i);
  var cval=0,aceflg=0,cden='',csuit='',peekf=0,dhole=0,dbjf=0,upval=0,upace=0,value=0,taction=0,action=0,naces=0,ival=0,iace=0,dflag=0,fcard=0,stotal=0,total=0,mod=0,bet=0;
  P.cprog(function*(io){
    var END={},st;
    function dollars(r){
      if(r===0)io.print('\nYou break even');
      else if(r>0)io.print('\nYou win $'+r); /* the original rings the bell after the $ */
      else io.print('\nYou lose $'+(-r));
      io.print('\n');
    }
    function pract(){
      if(action!==0){io.print('Action $'+action);dollars(total)}
    }
    function shuffle(){
      if(mod<15){
        io.print('Shuffle\n');
        pract();
        mod=52;
      }
    }
    function peek(){
      var c=peekf;
      if(c===0){
        if(mod<=1)shuffle();
        var r=rnd(mod);
        mod--;
        c=deck[r];deck[r]=deck[mod];deck[mod]=c;
        c++;
      }
      peekf=0;
      var q=Math.floor((c-1)/4),s=(c-1)%4;
      cden='A23456789TJQK'.charAt(q);csuit='HSDC'.charAt(s);
      aceflg=0;
      if(q===0){aceflg=1;cval=11}
      else{q++;cval=q>10?10:q}
      return c;
    }
    function card(){peek();io.print(cden+csuit)}
    function* quest(){
      var c=yield* io.getc();
      if(c===null){io.onint();throw END}
      var yes=c==='y';
      while(c!=='\n'){
        c=yield* io.getc();
        if(c===null){io.onint();throw END}
      }
      return yes;
    }
    io.onint=function(){io.print('\n');pract();io.print('\n')};
    /* the assembly keeps each hand's bet and value on its stack, on top of two -1s */
    function* hand(){ /* play one hand; gives 'double' when the second hand of a split is to be played too */
      for(;;){ /* 1: */
        value=ival;naces=iace;fcard=1;
        st.push(bet);
        var split=false;
        hit:for(;;){
          card();
          io.print('\n\n');
          value+=cval;naces+=aceflg;
          var sk=false; /* straight to the total: label 3 */
          if(--fcard>=0){
            taction+=bet;
            if(dflag===0&&upace!==0){
              io.print('Insurance? ');
              if(yield* quest()){
                total+=bet;
                taction+=bet>>1;
                if(dbjf===0){total-=bet>>1;total-=bet}
              }
            }
            if(dflag!==0&&ival===11)sk=true;
            else if(value===21&&dflag===0){
              io.print('You have black jack!\n');
              st.pop();
              if(dbjf===0)total+=bet+(bet>>1);
              return;
            }
            else if(dbjf!==0)sk=true;
            else{
              if(cval===ival&&dflag===0){
                io.print('Split pair? ');
                if(yield* quest()){dflag++;st.pop();split=true;break hit}
              }
              if(value>=10&&value<=11){
                io.print('Double down? ');
                if(yield* quest()){
                  st[st.length-1]*=2;
                  taction+=bet;
                  card();
                  io.print('\n');
                  value+=cval;
                  sk=true;
                }
              }
            }
          }
          if(sk){
            if(value>21)value-=10;
            break hit;
          }
          while(value>21){
            if(--naces<0){
              io.print('You bust\n');
              total-=st.pop();
              return;
            }
            value-=10;
          }
          io.print('Hit? ');
          if(!(yield* quest()))break hit;
        }
        if(split)continue;
        if(dbjf===0)io.print('You have '+value+'\n');
        st.push(value);
        return;
      }
    }
    function dealer(){
      if(st[st.length-1]<0)return;
      io.print('Dealer has ');
      peekf=dhole;
      for(;;){
        card();
        upval+=cval;upace+=aceflg;
        if(dbjf!==0){io.print(' = blackjack\n');upval=22;return}
        while(upval>21){
          if(--upace<0){io.print(' = bust\n');upval=0;return}
          upval-=10;
        }
        if(upval>=17)break;
        io.print('+');
      }
      io.print(' = '+upval+'\n');
    }
    function addin(){
      for(;;){
        var r=st.pop();
        if(r<0)break;
        var b=st.pop();
        if(upval===r)continue;
        if(upval<r)total+=b;else total-=b;
      }
      dollars(total-stotal);
    }
    try{
      io.print('Black Jack\n');
      for(;;){
        st=[];
        io.print('new game\n');
        dbjf=0;
        action+=taction;taction=0;
        shuffle();
        bet=2;
        stotal=total;
        card();
        upval=cval;upace=aceflg;
        dhole=peek();
        if(cval+upval===21)dbjf++;
        io.print(' up\n');
        card();
        ival=cval;iace=aceflg;
        io.print('+');
        st.push(-1);st.push(-1);
        dflag=0;
        yield* hand();
        if(dflag===1){dflag++;yield* hand()}
        dealer();
        addin();
      }
    }catch(e){if(e!==END)throw e}
  });
}});
})(window.Phosphor);
