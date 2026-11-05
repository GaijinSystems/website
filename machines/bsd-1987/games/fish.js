/* PHOSPHOR-9 terminal: machine "bsd-1987", fish. Ported to JavaScript for this terminal from 4.3BSD's
   games/fish.c, 5.1 (Berkeley) 5/29/85. It keeps this notice:

 * Copyright (c) 1980 Regents of the University of California.
 * All rights reserved.  The Berkeley software License Agreement
 * specifies the terms and conditions for redistribution.

   Differences: the C seeds with getpid(), and there are no process ids here, so a random number stands in
   for one. At the end of a pipe the C spins forever on getchar(); this goes on to the keyboard instead.
 */
(function(P){
'use strict';
var CTYPE=13,CTSIZ=CTYPE+1,DECK=52,NOMORE=0,EXIT={};
var cname=['NOMORE!!!','A','2','3','4','5','6','7','8','9','10','J','Q','K'];
var inst=[
  "`Go Fish' is a childrens' card game.  The Object is to",
  "accumulate `books' of 4 cards with the same face value.  The",
  "players alternate turns; each turn begins with one player",
  "selecting a card from his hand, and asking the other player for",
  "all cards of that face value.  If the other player has one or",
  "more cards of that face value in his hand, he gives them to the",
  "first player, and the first player makes another request.",
  "Eventually, the first player asks for a card which is not in",
  "the second player's hand: he replies `GO FISH!' The first",
  "player then draws a card from the `pool' of undealt cards.  If",
  "this is the card he had last requested, he draws again.  When a",
  "book is made, either through drawing or requesting, the cards",
  "are laid down and no further action takes place with that face",
  "value.  To play the computer, simply make guesses by typing a,",
  "2, 3, 4, 5, 6, 7, 8, 9, 10, j, q, or k when asked.  Hitting",
  "return gives you information about the size of my hand and the",
  "pool, and tells you about my books.  Saying `p' as a first",
  "guess puts you into `pro' level; The default is pretty dumb!",
  "Good Luck!\n"];
function zero(n){var a=[];while(n--)a.push(0);return a}
P.command({names:['fish'],run:function(){
  var o='',randx=Math.floor(Math.random()*30000)+1; /* srand(getpid()) */
  var myhand=zero(CTSIZ),yourhand=zero(CTSIZ),deck=zero(DECK),nextcd=0,proflag=0;
  var tryc=zero(100),ntry=0,haveguessed=zero(CTSIZ),hehas=zero(CTSIZ);
  var pipe=P.stdin(),line=null,at=0;
  function rand(){randx=(Math.imul(randx,1103515245)+12345)&0x7fffffff;return randx}
  function pr(s){
    o+=s;
    var i=o.lastIndexOf('\n');
    if(i>=0){P.say(o.slice(0,i).split('\n'));o=o.slice(i+1)}
  }
  function error(s){pr('error: '+s);throw EXIT}
  function choose(a,n){
    if(n<=0)error('null choice');
    var j=rand()%n,t=a[j];
    a[j]=a[n-1];
    return t;
  }
  function shuffle(){
    var i;
    for(i=0;i<DECK;++i)deck[i]=(i%13)+1;
    for(i=DECK;i>0;--i)deck[i-1]=choose(deck,i);
    nextcd=0;
  }
  function draw(){return nextcd>=DECK?NOMORE:deck[nextcd++]}
  function empty(h){
    for(var i=1;i<=CTYPE;++i)if(h[i]!==0&&h[i]!==4)return 0;
    return i;
  }
  function mark(cd,hand){
    if(cd!==NOMORE){
      ++hand[cd];
      if(hand[cd]>4)error('mark overflow');
    }
    return cd;
  }
  function deal(hand,n){while(n--)if(mark(draw(),hand)===NOMORE)error('deck exhausted')}
  function stats(){
    var i,ct=0,b=0;
    if(proflag)pr('Pro level\n');
    for(i=1;i<=CTYPE;++i){
      if(myhand[i]===4)++b;
      else ct+=myhand[i];
    }
    if(b){
      pr('My books: ');
      for(i=1;i<=CTYPE;++i)if(myhand[i]===4)pr(cname[i]+' ');
      pr('\n');
    }
    pr(ct+' cards in my hand, '+(DECK-nextcd)+' in the pool\n');
    pr('You ask me for: ');
  }
  function phand(h){
    var i,j=0;
    for(i=1;i<=CTYPE;++i){
      if(h[i]===4){++j;continue}
      for(var k=h[i];k>0;k--)pr(cname[i]+' ');
    }
    if(j){
      pr('+ Books of ');
      for(i=1;i<=CTYPE;++i)if(h[i]===4)pr(cname[i]+' ');
    }
    pr('\n');
  }
  function madebook(x){pr('Made a book of '+cname[x]+"'s\n")}
  function score(){
    var my=0,your=0,i;
    pr('The game is over.\nMy books: ');
    for(i=1;i<=CTYPE;++i)if(myhand[i]===4){++my;pr(cname[i]+' ')}
    pr('\nYour books: ');
    for(i=1;i<=CTYPE;++i)if(yourhand[i]===4){++your;pr(cname[i]+' ')}
    pr('\n\nI have '+my+', you have '+your+'\n');
    pr('\n'+(my>your?'I':'You')+' win!!!\n');
    throw EXIT;
  }
  function hedrew(d){++hehas[d]}
  function heguessed(d){++hehas[d]}
  function move(hs,ht,g,v){
    var d,sp='I',tp='I';
    if(v)tp='You';else sp='You';
    if(g===NOMORE){
      d=draw();
      if(d===NOMORE)score();
      else{
        pr('Empty Hand\n');
        if(!v)pr('You draw '+cname[d]+'\n');
        mark(d,hs);
      }
      return 0;
    }
    if(!v)heguessed(g);
    if(hs[g]===0){
      if(v)error('Rotten Guess');
      pr("You don't have any "+cname[g]+"'s\n");
      return 1;
    }
    if(ht[g]){
      pr(tp+' have '+ht[g]+' '+cname[g]+(ht[g]>1?"'s":'')+'\n');
      hs[g]+=ht[g];
      ht[g]=0;
      if(hs[g]===4)madebook(g);
      return 1;
    }
    pr(tp+' say "GO FISH!"\n');
    for(;;){
      d=draw();
      if(d===NOMORE){pr('No more cards\n');return 0}
      mark(d,hs);
      if(!v)pr('You draw '+cname[d]+'\n');
      if(hs[d]===4)madebook(d);
      if(d!==g)return 0;
      pr(sp+' drew the guess, so draw again\n');
      if(!v)hedrew(d);
    }
  }
  function myguess(){
    var i,lg,t,guessed=false;
    if(empty(myhand))return NOMORE;
    ntry=0;
    for(i=1;i<=CTYPE;++i){
      if(myhand[i]===0||myhand[i]===4)continue;
      tryc[ntry++]=i;
    }
    if(proflag){
      for(i=0;i<ntry;++i)if(hehas[tryc[i]]){i=tryc[i];guessed=true;break}
      if(!guessed){
        lg=101;
        for(i=0;i<ntry;++i)if(haveguessed[tryc[i]]<lg)lg=haveguessed[tryc[i]];
        t=0;
        for(i=0;i<ntry;++i)if(haveguessed[tryc[i]]===lg)tryc[t++]=tryc[i];
        ntry=t;
        if(t<=0)error('bad guessing loop');
      }
    }
    if(!guessed)i=choose(tryc,ntry);
    hehas[i]=0;
    for(t=1;t<=CTYPE;++t)if(haveguessed[t])--haveguessed[t];
    haveguessed[i]=100;
    return i;
  }
  /* getchar: '\n' ends each line, and ^D comes through as -1 */
  function* getchar(){
    if(line===null||at>line.length){
      var l;
      if(pipe&&pipe.length)l=pipe.shift();
      else l=yield;
      if(l===P.INT)throw EXIT;
      if(l===null)return -1;
      line=l;at=0;
    }
    return at<line.length?line.charAt(at++):(at++,'\n');
  }
  function* guess(){
    var g,go=0,bad;
    for(;;){
      g=yield* getchar();
      bad=false;
      switch(g){
      case 'p':case 'P':++proflag;continue;
      case '2':case '3':case '4':case '5':case '6':case '7':case '8':case '9':
        if(go)bad=true;else go=+g;
        break;
      case 'a':case 'A':if(go)bad=true;else go=1;break;
      case '1':if(go)bad=true;else go=10;break;
      case '0':if(go!==10)bad=true;break;
      case 'J':case 'j':if(go)bad=true;else go=11;break;
      case 'Q':case 'q':if(go)bad=true;else go=12;break;
      case 'K':case 'k':if(go)bad=true;else go=13;break;
      case '\n':
        if(empty(yourhand))return NOMORE;
        if(go===0){stats();continue}
        return go;
      case ' ':case '\t':continue;
      default:bad=true;
      }
      if(bad){
        while(g!=='\n')g=yield* getchar();
        pr('what?\n');
      }
    }
  }
  function* game(){
    var c,g;
    pr('instructions?\n');
    c=yield* getchar();
    if(c!=='\n'){
      if(c!=='n'){pr('\n');inst.forEach(function(x){pr(x+'\n')})}
      while((yield* getchar())!=='\n');
    }
    shuffle();
    deal(myhand,7);
    deal(yourhand,7);
    for(;;){
      for(;;){
        pr('your hand is: ');
        phand(yourhand);
        pr('you ask me for: ');
        g=yield* guess();
        if(!move(yourhand,myhand,g,0))break;
        pr('Guess again\n');
      }
      for(;;){
        g=myguess();
        if(g!==NOMORE)pr('I ask you for: '+cname[g]+'\n');
        if(!move(myhand,yourhand,g,1))break;
        pr('I get another guess\n');
      }
    }
  }
  var G=game();
  function step(v){
    var r;
    try{r=G.next(v)}
    catch(e){
      if(e!==EXIT)throw e;
      if(o)P.say([o]);
      return;
    }
    if(!r.done){var p=o;o='';P.ask(p,step,true)}
  }
  step();
}});
})(window.Phosphor);
