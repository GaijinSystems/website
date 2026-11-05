/* PHOSPHOR-9 terminal: machine "bsd-1987", canfield. Ported to JavaScript for this terminal from 4.3BSD's
   games/canfield.c, 5.4 (Berkeley) 1/13/86. Originally written by Steve Levine; converted to use curses and
   debugged by Steve Feldman; card counting by Kirk McKusick and Mikey Olson; user interface cleanups by Eric
   Allman and Kirk McKusick; betting by Kirk McKusick. The window handling below follows 4.3BSD's libcurses,
   under the same notice. It keeps this notice:

 * Copyright (c) 1982 Regents of the University of California.
 * All rights reserved.  The Berkeley software License Agreement
 * specifies the terms and conditions for redistribution.

 @(#) Copyright (c) 1980 Regents of the University of California.
 All rights reserved.

   The scores are kept in this browser, as 'canfield/scores': {name:{hand,inspection,game,runs,information,
   thinktime,wins,worth}}, which cfscores reads; the C writes the same eight numbers to /usr/games/lib/cfscores,
   at your uid.

   Differences: standout does not show on this glass, so red cards are not in inverse; their suit letters say what
   they are. The C leaves ^C to its handler but runs in raw mode, where that never fires: here ^C brings up the
   same "Really wish to quit?". The C does not initialise the two characters of a command, so a short command
   takes what was left on the stack: here that is what the last command left. ^Z redraws and goes on. The C seeds
   with getpid(), and a random number stands in for it. The board is 24 by 80, cut off if the glass is smaller.
 */
(function(P){
'use strict';
var decksize=52,boxcol=42,tboxrow=2,bboxrow=17,movecol=43,moverow=16,msgcol=43,msgrow=15,titlecol=30,titlerow=0,sidecol=1,ottlrow=6,
  foundcol=11,foundrow=3,stockcol=2,stockrow=8,fttlcol=10,fttlrow=1,taloncol=2,talonrow=13,tabrow=8,ctoprow=21,cbotrow=23,cinitcol=14,
  cheightcol=1,cwidthcol=4,handstatrow=21,handstatcol=7,talonstatrow=22,talonstatcol=7,stockstatrow=23,stockstatcol=7,basecol=1,
  Ace=1,Jack=11,Queen=12,King=13,atabcol=11,btabcol=18,ctabcol=25,dtabcol=32,stk=1,tal=2,tab=3,
  INSTRUCTIONBOX=1,BETTINGBOX=2,NOBOX=3,
  costofhand=13,costofinspection=13,costofgame=26,costofrunthroughhand=5,costofinformation=1,secondsperdollar=60,maxtimecharge=3,valuepercardup=5,
  EXIT={};
var basicinstructions=[
  "Here are brief instuctions to the game of Canfield:\n\n",
  "     If you have never played solitaire before, it is recom-\n",
  "mended  that  you  consult  a solitaire instruction book. In\n",
  "Canfield, tableau cards may be built on each other  downward\n",
  "in  alternate colors. An entire pile must be moved as a unit\n",
  "in building. Top cards of the piles are available to be able\n",
  "to be played on foundations, but never into empty spaces.\n\n",
  "     Spaces must be filled from the stock. The top  card  of\n",
  "the  stock  also is available to be played on foundations or\n",
  "built on tableau piles. After the stock  is  exhausted,  ta-\n",
  "bleau spaces may be filled from the talon and the player may\n",
  "keep them open until he wishes to use them.\n\n",
  "     Cards are dealt from the hand to the  talon  by  threes\n",
  "and  this  repeats until there are no more cards in the hand\n",
  "or the player quits. To have cards dealt onto the talon  the\n",
  "player  types  'ht'  for his move. Foundation base cards are\n",
  "also automatically moved to the foundation when they  become\n",
  "available.\n\n",
  "push any key when you are finished: "];
var bettinginstructions=[
  "     The rules for betting are  somewhat  less  strict  than\n",
  "those  used in the official version of the game. The initial\n",
  "deal costs $13. You may quit at this point  or  inspect  the\n",
  "game.  Inspection  costs  $13 and allows you to make as many\n",
  "moves as is possible without moving any cards from your hand\n",
  "to  the  talon.  (the initial deal places three cards on the\n",
  "talon; if all these cards are  used,  three  more  are  made\n",
  "available)  Finally, if the game seems interesting, you must\n",
  "pay the final installment of $26.  At  this  point  you  are\n",
  "credited  at the rate of $5 for each card on the foundation;\n",
  "as the game progresses you are credited  with  $5  for  each\n",
  "card  that is moved to the foundation.  Each run through the\n",
  "hand after the first costs $5.  The  card  counting  feature\n",
  "costs  $1  for  each unknown card that is identified. If the\n",
  "information is toggled on, you are only  charged  for  cards\n",
  "that  became  visible  since it was last turned on. Thus the\n",
  "maximum cost of information is $34.  Playing time is charged\n",
  "at a rate of $1 per minute.\n\n",
  "push any key when you are finished: "];
P.command({names:['canfield'],run:function(){
  P.program(function(S,finish_){
  /* --- 4.3BSD's curses, as this game needs it (curses43.js) --- */
  var K=P.curses43(S),LINES=K.LINES,COLS=K.COLS,NOCHANGE=K.NOCHANGE,stdscr,curscr,blank=K.blank,mkwin=K.mkwin,touchline=K.touchline,touchwin=K.touchwin,wmove=K.wmove,wclrtoeol=K.wclrtoeol,waddch=K.waddch,waddstr=K.waddstr,mvwaddstr=K.mvwaddstr,mvwaddch=K.mvwaddch,werase=K.werase,wclear=K.wclear,makech=K.makech,wrefresh=K.wrefresh,view=K.view;
  function initscr(){K.initscr();stdscr=K.stdscr;curscr=K.curscr}
  /* random(3) as 4.3BSD has it: x**31 + x**3 + 1 */
  var rs=new Int32Array(31),fptr=3,rptr=0;
  function random(){
    rs[fptr]=(rs[fptr]+rs[rptr])|0;
    var i=(rs[fptr]>>1)&0x7fffffff;
    if(++fptr>=31){fptr=0;++rptr}
    else if(++rptr>=31)rptr=0;
    return i;
  }
  function srandom(x){
    rs[0]=x;
    for(var i=1;i<31;i++)rs[i]=(Math.imul(1103515245,rs[i-1])+12345)|0;
    fptr=3;rptr=0;
    for(i=0;i<310;i++)random();
  }
  var ERASE=8,KILL=21,cmd=['\0','\0'];
  var deck=[],cards=[],bottom=[null,null,null,null],found=[null,null,null,null],tableau=[null,null,null,null];
  var G={talon:null,hand:null,stock:null},basecard=null,length=[0,0,0,0];
  var cardsoff=0,base=0,cinhand=0,taloncnt=0,stockcnt=0,timesthru=0;
  var suitmap=['s','c','h','d'],colormap=['b','b','r','r'],pilemap=[atabcol,btabcol,ctabcol,dtabcol];
  var srcpile='\0',destpile='\0',mtforigin=0,tempbase=0,coldcol=0,cnewcol=0,coldrow=0,cnewrow=0,errmsg=false,done=false,mtfdone=false,Cflag=false,status=INSTRUCTIONBOX;
  function Bet(){return {hand:0,inspection:0,game:0,runs:0,information:0,thinktime:0,wins:0,worth:0}}
  var thisb=Bet(),total=Bet(),startedgame=false,infullgame=false,acctstart=0;
  var R_talon={o:G,k:'talon'},R_stock={o:G,k:'stock'},R_hand={o:G,k:'hand'};
  function R_tab(i){return {o:tableau,k:i}}
  function now(){return Math.floor(Date.now()/1000)}
  function move(y,x){wmove(stdscr,y,x)}
  function printw(s){waddstr(stdscr,s)}
  function addch(c){waddch(stdscr,c)}
  function refresh(){wrefresh(stdscr)}
  function clear(){wclear(stdscr)}
  function n3(x){return String(x).padStart(3)}
  function fmt49(a,b){return String(a).padStart(4)+String(b).padStart(9)}
  function bell(){if(P.click)P.click(1,700)}
  function incrhand(p){p.row-=cheightcol;if(p.row<ctoprow){p.row=cbotrow;p.col+=cwidthcol}}
  function decrhand(p){p.row+=cheightcol;if(p.row>cbotrow){p.row=ctoprow;p.col-=cwidthcol}}
  function printtopinstructions(){
    ['*--------------------------*','|         MOVES            |','|s# = stock to tableau     |','|sf = stock to foundation  |',
     '|t# = talon to tableau     |','|tf = talon to foundation  |','|## = tableau to tableau   |','|#f = tableau to foundation|',
     '|ht = hand to talon        |','|c = toggle card counting  |','|b = present betting info  |','|q = quit to end the game  |','|==========================|'
    ].forEach(function(s,i){move(tboxrow+i,boxcol);printw(s)});
  }
  function printtopbettingbox(){
    ['                            ','*--------------------------*','|Costs        Hand   Total |','| Hands                    |','| Inspections              |','| Games                    |',
     '| Runs                     |','| Information              |','| Think time               |','|Total Costs               |','|Winnings                  |','|Net Worth                 |','|==========================|'
    ].forEach(function(s,i){move(tboxrow+i,boxcol);printw(s)});
  }
  function clearabovemovebox(){
    for(var i=0;i<=11;i++){move(tboxrow+i,boxcol);printw('                            ')}
    move(tboxrow+12,boxcol);printw('*--------------------------*');
  }
  function printbottominstructions(){
    move(bboxrow,boxcol);printw('|Replace # with the number |');
    move(bboxrow+1,boxcol);printw('|of the tableau you want.  |');
    move(bboxrow+2,boxcol);printw('*--------------------------*');
  }
  function printbottombettingbox(){
    move(bboxrow,boxcol);printw('|x = toggle information box|');
    move(bboxrow+1,boxcol);printw('|i = list instructions     |');
    move(bboxrow+2,boxcol);printw('*--------------------------*');
  }
  function clearbelowmovebox(){
    move(bboxrow,boxcol);printw('*--------------------------*');
    for(var i=1;i<=2;i++){move(bboxrow+i,boxcol);printw('                            ')}
  }
  function movebox(){
    if(status===BETTINGBOX)printtopbettingbox();
    else if(status===NOBOX)clearabovemovebox();
    else printtopinstructions();
    move(moverow,boxcol);printw('|                          |');
    move(msgrow,boxcol);printw('|                          |');
    if(status===BETTINGBOX)printbottombettingbox();
    else if(status===NOBOX)clearbelowmovebox();
    else printbottominstructions();
    refresh();
  }
  function makeboard(){
    clear();
    refresh();
    move(titlerow,titlecol);printw('=-> CANFIELD <-=');
    move(fttlrow,fttlcol);printw('foundation');
    move(foundrow-1,fttlcol);printw('=---=  =---=  =---=  =---=');
    move(foundrow,fttlcol);printw('|   |  |   |  |   |  |   |');
    move(foundrow+1,fttlcol);printw('=---=  =---=  =---=  =---=');
    move(ottlrow,sidecol);printw('stock     tableau');
    move(stockrow-1,sidecol);printw('=---=');
    move(stockrow,sidecol);printw('|   |');
    move(stockrow+1,sidecol);printw('=---=');
    move(talonrow-2,sidecol);printw('talon');
    move(talonrow-1,sidecol);printw('=---=');
    move(talonrow,sidecol);printw('|   |');
    move(talonrow+1,sidecol);printw('=---=');
    move(tabrow-1,atabcol);printw('-1-    -2-    -3-    -4-');
    movebox();
  }
  function removecard(a,b){move(b,a);printw('   ')}
  function cleanupboard(){
    var cnt,row,ptr;
    if(Cflag){
      clearstat();
      for(ptr=G.stock,row=stockrow;ptr!==null;ptr=ptr.next,row++){move(row,sidecol);printw('     ')}
      move(row,sidecol);printw('     ');
      move(stockrow+1,sidecol);printw('=---=');
      move(talonrow-2,sidecol);printw('talon');
      move(talonrow-1,sidecol);printw('=---=');
      move(talonrow+1,sidecol);printw('=---=');
    }
    move(stockrow,sidecol);printw('|   |');
    move(talonrow,sidecol);printw('|   |');
    move(foundrow,fttlcol);printw('|   |  |   |  |   |  |   |');
    for(cnt=0;cnt<4;cnt++){
      var col=pilemap[cnt];
      for(ptr=tableau[cnt],row=tabrow;ptr!==null;ptr=ptr.next,row++)removecard(col,row);
    }
  }
  function initdeck(){
    var i=0;
    for(var scnt=0;scnt<4;scnt++)for(var r=Ace;r<=King;r++){
      cards[i]={rank:r,suit:suitmap[scnt],color:colormap[scnt],next:null,visible:false,paid:false};
      deck[i]=cards[i];
      i++;
    }
  }
  function shuffle(){
    var i,j,t;
    for(i=0;i<decksize;i++){deck[i].visible=false;deck[i].paid=false}
    for(i=decksize-1;i>=0;i--){
      j=random()%decksize;
      if(i!==j){t=deck[i];deck[i]=deck[j];deck[j]=t}
    }
  }
  function printrank(a,b,cp){
    move(b,a);
    if(cp.rank!==10)addch(' ');
    if(cp.rank>=2&&cp.rank<=10)printw(String(cp.rank));
    else if(cp.rank===Ace)addch('A');
    else if(cp.rank===Jack)addch('J');
    else if(cp.rank===Queen)addch('Q');
    else if(cp.rank===King)addch('K');
  }
  function printcard(a,b,cp){
    if(cp===null)removecard(a,b);
    else if(cp.visible===false){move(b,a);printw(' ? ')}
    else{printrank(a,b,cp);addch(cp.suit)}
  }
  function transit(source,dest){
    var temp=source.o[source.k];
    source.o[source.k]=temp.next;
    temp.next=dest.o[dest.k];
    dest.o[dest.k]=temp;
  }
  function fndbase(cp,column,row){
    var nomore;
    if(cp.o[cp.k]!==null)
      do{
        var c=cp.o[cp.k];
        if(c.rank===basecard.rank){
          base++;
          printcard(pilemap[base],foundrow,c);
          if(c===tableau[0])length[0]=length[0]-1;
          if(c===tableau[1])length[1]=length[1]-1;
          if(c===tableau[2])length[2]=length[2]-1;
          if(c===tableau[3])length[3]=length[3]-1;
          transit(cp,{o:found,k:base});
          if(cp===R_talon)usedtalon();
          if(cp===R_stock)usedstock();
          if(cp.o[cp.k]!==null){printcard(column,row,cp.o[cp.k]);nomore=false}
          else{removecard(column,row);nomore=true}
          cardsoff++;
          if(infullgame){thisb.wins+=valuepercardup;total.wins+=valuepercardup}
        }
        else nomore=true;
      }while(nomore===false);
  }
  function initgame(){
    var i;
    for(i=0;i<18;i++){deck[i].visible=true;deck[i].paid=true}
    stockcnt=13;
    G.stock=deck[12];
    for(i=12;i>=1;i--)deck[i].next=deck[i-1];
    deck[0].next=null;
    found[0]=deck[13];
    deck[13].next=null;
    for(i=1;i<4;i++)found[i]=null;
    basecard=found[0];
    for(i=14;i<18;i++){tableau[i-14]=deck[i];deck[i].next=null}
    for(i=0;i<4;i++){bottom[i]=tableau[i];length[i]=tabrow}
    G.hand=deck[18];
    for(i=18;i<decksize-1;i++)deck[i].next=deck[i+1];
    deck[decksize-1].next=null;
    G.talon=null;
    base=0;cinhand=34;taloncnt=0;timesthru=0;cardsoff=1;
    coldrow=ctoprow;coldcol=cinitcol;cnewrow=ctoprow;cnewcol=cinitcol+cwidthcol;
  }
  function* startgame(){
    shuffle();
    initgame();
    thisb.hand=costofhand;
    total.hand+=costofhand;
    thisb.inspection=0;thisb.game=0;thisb.runs=0;thisb.information=0;thisb.wins=0;thisb.thinktime=0;
    infullgame=false;startedgame=false;
    printcard(foundcol,foundrow,found[0]);
    printcard(stockcol,stockrow,G.stock);
    printcard(atabcol,tabrow,tableau[0]);
    printcard(btabcol,tabrow,tableau[1]);
    printcard(ctabcol,tabrow,tableau[2]);
    printcard(dtabcol,tabrow,tableau[3]);
    printcard(taloncol,talonrow,G.talon);
    move(foundrow-2,basecol);printw('Base');
    move(foundrow-1,basecol);printw('Rank');
    printrank(basecol,foundrow,found[0]);
    for(var j=0;j<=3;j++)fndbase(R_tab(j),pilemap[j],tabrow);
    fndbase(R_stock,stockcol,stockrow);
    showstat();
    yield* movetotalon();
    updatebettinginfo();
  }
  function clearmsg(){
    if(errmsg===true){
      errmsg=false;
      move(msgrow,msgcol);
      for(var i=0;i<25;i++)addch(' ');
      refresh();
    }
  }
  function dumberror(){errmsg=true;move(msgrow,msgcol);printw('Not a proper move       ')}
  function destinerror(){errmsg=true;move(msgrow,msgcol);printw("Error: Can't move there")}
  function notempty(cp){
    if(cp===null){errmsg=true;move(msgrow,msgcol);printw('Error: no cards to move');return false}
    return true;
  }
  function ranklower(c1,c2){
    if(c2.rank===Ace)return c1.rank===King;
    return c1.rank+1===c2.rank;
  }
  function diffcolor(c1,c2){return c1.color!==c2.color}
  function tabok(cp,des){
    if(cp===G.stock&&tableau[des]===null)return true;
    if(tableau[des]===null)
      return G.stock===null&&cp!==bottom[0]&&cp!==bottom[1]&&cp!==bottom[2]&&cp!==bottom[3];
    return ranklower(cp,tableau[des])&&diffcolor(cp,tableau[des]);
  }
  function* movetotalon(){
    var i,fin;
    if(cinhand<=3&&cinhand>0){move(msgrow,msgcol);printw('Hand is now empty        ')}
    if(cinhand>=3)fin=3;
    else if(cinhand>0)fin=cinhand;
    else if(G.talon!==null){
      timesthru++;
      errmsg=true;
      move(msgrow,msgcol);
      if(timesthru!==4){
        printw('Talon is now the new hand');
        thisb.runs+=costofrunthroughhand;
        total.runs+=costofrunthroughhand;
        while(G.talon!==null){transit(R_talon,R_hand);cinhand++}
        fin=cinhand>=3?3:cinhand;
        taloncnt=0;
        coldrow=ctoprow;coldcol=cinitcol;cnewrow=ctoprow;cnewcol=cinitcol+cwidthcol;
        clearstat();
        showstat();
      }
      else{
        fin=0;
        done=true;
        printw('I believe you have lost');
        refresh();
        yield 5000;
      }
    }
    else{
      errmsg=true;
      move(msgrow,msgcol);
      printw('Talon and hand are empty');
      fin=0;
    }
    for(i=0;i<fin;i++){
      transit(R_hand,R_talon);
      var q={row:cnewrow,col:cnewcol};incrhand(q);cnewrow=q.row;cnewcol=q.col;
      q={row:coldrow,col:coldcol};incrhand(q);coldrow=q.row;coldcol=q.col;
      removecard(cnewcol,cnewrow);
      if(i===fin-1)G.talon.visible=true;
      if(Cflag){
        if(G.talon.paid===false&&G.talon.visible===true){
          thisb.information+=costofinformation;
          total.information+=costofinformation;
          G.talon.paid=true;
        }
        printcard(coldcol,coldrow,G.talon);
      }
    }
    if(fin!==0){
      printcard(taloncol,talonrow,G.talon);
      cinhand-=fin;
      taloncnt+=fin;
      if(Cflag){
        move(handstatrow,handstatcol);printw(n3(cinhand));
        move(talonstatrow,talonstatcol);printw(n3(taloncnt));
      }
      fndbase(R_talon,taloncol,talonrow);
    }
  }
  function showstat(){
    var p,ptr;
    if(!Cflag)return;
    move(talonstatrow,talonstatcol-7);printw('Talon: '+n3(taloncnt));
    move(handstatrow,handstatcol-7);printw('Hand:  '+n3(cinhand));
    move(stockstatrow,stockstatcol-7);printw('Stock: '+n3(stockcnt));
    for(p={row:coldrow,col:coldcol},ptr=G.talon;ptr!==null;ptr=ptr.next){
      if(ptr.paid===false&&ptr.visible===true){
        ptr.paid=true;
        thisb.information+=costofinformation;
        total.information+=costofinformation;
      }
      printcard(p.col,p.row,ptr);
      decrhand(p);
    }
    for(p={row:cnewrow,col:cnewcol},ptr=G.hand;ptr!==null;ptr=ptr.next){
      if(ptr.paid===false&&ptr.visible===true){
        ptr.paid=true;
        thisb.information+=costofinformation;
        total.information+=costofinformation;
      }
      incrhand(p);
      printcard(p.col,p.row,ptr);
    }
  }
  function clearstat(){
    move(talonstatrow,talonstatcol-7);printw('          ');
    move(handstatrow,handstatcol-7);printw('          ');
    move(stockstatrow,stockstatcol-7);printw('          ');
    for(var row=ctoprow;row<=cbotrow;row++){move(row,cinitcol);printw(' '.repeat(56))}
  }
  function usedtalon(){
    removecard(coldcol,coldrow);
    var q={row:coldrow,col:coldcol};decrhand(q);coldrow=q.row;coldcol=q.col;
    if(G.talon!==null&&G.talon.visible===false){
      G.talon.visible=true;
      if(Cflag){
        thisb.information+=costofinformation;
        total.information+=costofinformation;
        G.talon.paid=true;
        printcard(coldcol,coldrow,G.talon);
      }
    }
    taloncnt--;
    if(Cflag){move(talonstatrow,talonstatcol);printw(n3(taloncnt))}
  }
  function usedstock(){
    stockcnt--;
    if(Cflag){move(stockstatrow,stockstatcol);printw(n3(stockcnt))}
  }
  function showcards(){
    var ptr,row;
    if(!Cflag||cardsoff===52)return;
    for(ptr=G.talon;ptr!==null;ptr=ptr.next){ptr.visible=true;ptr.paid=true}
    for(ptr=G.hand;ptr!==null;ptr=ptr.next){ptr.visible=true;ptr.paid=true}
    showstat();
    move(stockrow+1,sidecol);printw('     ');
    move(talonrow-2,sidecol);printw('     ');
    move(talonrow-1,sidecol);printw('     ');
    move(talonrow,sidecol);printw('     ');
    move(talonrow+1,sidecol);printw('     ');
    for(ptr=G.stock,row=stockrow;ptr!==null;ptr=ptr.next,row++){
      move(row,stockcol-1);printw('|   |');
      printcard(stockcol,row,ptr);
    }
    if(G.stock===null){move(row,stockcol-1);printw('|   |');row++}
    move(handstatrow,handstatcol-7);printw('          ');
    move(row,stockcol-1);printw('=---=');
  }
  function updatebettinginfo(){
    var t=now(),dollars=Math.trunc((t-acctstart)/secondsperdollar);
    if(dollars>0){
      acctstart+=dollars*secondsperdollar;
      if(dollars>maxtimecharge)dollars=maxtimecharge;
      thisb.thinktime+=dollars;
      total.thinktime+=dollars;
    }
    var thiscosts=thisb.hand+thisb.inspection+thisb.game+thisb.runs+thisb.information+thisb.thinktime;
    var totalcosts=total.hand+total.inspection+total.game+total.runs+total.information+total.thinktime;
    thisb.worth=thisb.wins-thiscosts;
    total.worth=total.wins-totalcosts;
    if(status!==BETTINGBOX)return;
    move(tboxrow+3,boxcol+13);printw(fmt49(thisb.hand,total.hand));
    move(tboxrow+4,boxcol+13);printw(fmt49(thisb.inspection,total.inspection));
    move(tboxrow+5,boxcol+13);printw(fmt49(thisb.game,total.game));
    move(tboxrow+6,boxcol+13);printw(fmt49(thisb.runs,total.runs));
    move(tboxrow+7,boxcol+13);printw(fmt49(thisb.information,total.information));
    move(tboxrow+8,boxcol+13);printw(fmt49(thisb.thinktime,total.thinktime));
    move(tboxrow+9,boxcol+13);printw(fmt49(thiscosts,totalcosts));
    move(tboxrow+10,boxcol+13);printw(fmt49(thisb.wins,total.wins));
    move(tboxrow+11,boxcol+13);printw(fmt49(thisb.worth,total.worth));
  }
  function simpletableau(cp,des){
    if(notempty(cp.o[cp.k])){
      if(tabok(cp.o[cp.k],des)){
        var origin=cp.o[cp.k]===G.stock?stk:tal;
        if(tableau[des]===null)bottom[des]=cp.o[cp.k];
        transit(cp,R_tab(des));
        length[des]++;
        printcard(pilemap[des],length[des],tableau[des]);
        timesthru=0;
        if(origin===stk){usedstock();printcard(stockcol,stockrow,G.stock)}
        else{usedtalon();printcard(taloncol,talonrow,G.talon)}
      }
      else destinerror();
    }
  }
  function tabprint(sour,des){
    var dlength,slength,i,tempcard;
    for(i=tabrow;i<=length[sour];i++)removecard(pilemap[sour],i);
    dlength=length[des]+1;
    slength=length[sour];
    if(slength===tabrow)printcard(pilemap[des],dlength,tableau[sour]);
    else
      while(slength!==tabrow-1){
        tempcard=tableau[sour];
        for(i=1;i<=slength-tabrow;i++)tempcard=tempcard.next;
        printcard(pilemap[des],dlength,tempcard);
        slength--;
        dlength++;
      }
  }
  function tabtotab(sour,des){
    var temp;
    if(notempty(tableau[sour])){
      if(tabok(bottom[sour],des)){
        tabprint(sour,des);
        temp=bottom[sour];
        bottom[sour]=null;
        if(bottom[des]===null)bottom[des]=temp;
        temp.next=tableau[des];
        tableau[des]=tableau[sour];
        tableau[sour]=null;
        length[des]=length[des]+(length[sour]-(tabrow-1));
        length[sour]=tabrow-1;
        timesthru=0;
      }
      else destinerror();
    }
  }
  function rankhigher(cp,l){
    if(found[l].rank===King)return cp.rank===Ace;
    return cp.rank-1===found[l].rank;
  }
  function samesuit(cp,l){return cp.suit===found[l].suit}
  function movetofound(cp,source){
    tempbase=0;
    mtfdone=false;
    if(notempty(cp.o[cp.k])){
      do{
        if(found[tempbase]!==null){
          var c=cp.o[cp.k];
          if(rankhigher(c,tempbase)&&samesuit(c,tempbase)){
            if(c===G.stock)mtforigin=stk;
            else if(c===G.talon)mtforigin=tal;
            else mtforigin=tab;
            transit(cp,{o:found,k:tempbase});
            printcard(pilemap[tempbase],foundrow,found[tempbase]);
            timesthru=0;
            if(mtforigin===stk){usedstock();printcard(stockcol,stockrow,G.stock)}
            else if(mtforigin===tal){usedtalon();printcard(taloncol,talonrow,G.talon)}
            else{removecard(pilemap[source],length[source]);length[source]--}
            cardsoff++;
            if(infullgame){thisb.wins+=valuepercardup;total.wins+=valuepercardup}
            mtfdone=true;
          }
          else tempbase++;
        }
        else tempbase++;
      }while(tempbase!==4&&!mtfdone);
      if(!mtfdone)destinerror();
    }
  }
  function isprint(c){return c>=32&&c<127}
  function* askquit(){
    move(msgrow,msgcol);printw('Really wish to quit?    ');
    do{yield* getcmd(moverow,movecol,'y or n?')}while(srcpile!=='y'&&srcpile!=='n');
    clearmsg();
    if(srcpile==='y')cleanup();
  }
  function* getcmd(row,col,cp){
    var ch,i=0;
    move(row,col);
    printw(cp.padEnd(24));
    col+=1+cp.length;
    move(row,col);
    refresh();
    do{
      ch=yield;
      if(ch===-3){yield* askquit();continue}
      ch&=0o177;
      if(ch>=65&&ch<=90)ch+=32;
      if(ch===12)refresh();
      else if(i>=2&&ch!==ERASE&&ch!==KILL){
        if(ch!==10&&ch!==13&&ch!==32)bell();
      }
      else if(ch===ERASE&&i>0){printw('\b \b');refresh();i--}
      else if(ch===KILL&&i>0){
        while(i>0){printw('\b \b');i--}
        refresh();
      }
      else if(ch===26){
        move(21,0);refresh();
        move(row,col+i);refresh();
      }
      else if(isprint(ch)){
        cmd[i++]=String.fromCharCode(ch);
        addch(String.fromCharCode(ch));
        refresh();
      }
    }while(ch!==10&&ch!==13&&ch!==32);
    srcpile=cmd[0];
    destpile=cmd[1];
  }
  function isdig(c){return c>='1'&&c<='4'}
  function* movecard(){
    var source=0,dest=0,osrcpile,odestpile;
    done=false;
    errmsg=false;
    do{
      if(G.talon===null&&G.hand!==null)yield* movetotalon();
      if(cardsoff===52){refresh();srcpile='q'}
      else yield* getcmd(moverow,movecol,'Move:');
      clearmsg();
      if(isdig(srcpile))source=srcpile.charCodeAt(0)-49;
      if(isdig(destpile))dest=destpile.charCodeAt(0)-49;
      if(!startedgame&&(srcpile==='t'||srcpile==='s'||srcpile==='h'||isdig(srcpile))){
        startedgame=true;
        osrcpile=srcpile;
        odestpile=destpile;
        if(status!==BETTINGBOX)srcpile='y';
        else do{yield* getcmd(moverow,movecol,'Inspect game?')}while(srcpile!=='y'&&srcpile!=='n');
        if(srcpile==='n')srcpile='q';
        else{
          thisb.inspection+=costofinspection;
          total.inspection+=costofinspection;
          srcpile=osrcpile;
          destpile=odestpile;
        }
      }
      switch(srcpile){
      case 't':
        if(destpile==='f'||destpile==='F')movetofound(R_talon,source);
        else if(isdig(destpile))simpletableau(R_talon,dest);
        else dumberror();
        break;
      case 's':
        if(destpile==='f'||destpile==='F')movetofound(R_stock,source);
        else if(isdig(destpile))simpletableau(R_stock,dest);
        else dumberror();
        break;
      case 'h':
        if(destpile!=='t'&&destpile!=='T'){dumberror();break}
        if(infullgame){yield* movetotalon();break}
        if(status===BETTINGBOX){
          do{yield* getcmd(moverow,movecol,'Buy game?')}while(srcpile!=='y'&&srcpile!=='n');
          if(srcpile==='n'){showcards();done=true;break}
        }
        infullgame=true;
        thisb.wins+=valuepercardup*cardsoff;
        total.wins+=valuepercardup*cardsoff;
        thisb.game+=costofgame;
        total.game+=costofgame;
        yield* movetotalon();
        break;
      case 'q':showcards();done=true;break;
      case 'b':printtopbettingbox();printbottombettingbox();status=BETTINGBOX;break;
      case 'x':clearabovemovebox();clearbelowmovebox();status=NOBOX;break;
      case 'i':printtopinstructions();printbottominstructions();status=INSTRUCTIONBOX;break;
      case 'c':
        Cflag=!Cflag;
        if(Cflag)showstat();else clearstat();
        break;
      case '1':case '2':case '3':case '4':
        if(destpile==='f'||destpile==='F')movetofound(R_tab(source),source);
        else if(isdig(destpile))tabtotab(source,dest);
        else dumberror();
        break;
      default:dumberror();
      }
      fndbase(R_stock,stockcol,stockrow);
      fndbase(R_talon,taloncol,talonrow);
      updatebettinginfo();
    }while(!done);
  }
  function* instruct(){
    move(0,0);
    printw('This is the game of solitaire called Canfield.  Do\n');
    printw('you want instructions for the game?');
    do{yield* getcmd(3,0,'y or n?')}while(srcpile!=='y'&&srcpile!=='n');
    if(srcpile==='n')return;
    clear();
    basicinstructions.forEach(printw);
    refresh();
    yield;
    clear();
    move(0,0);
    printw('Do you want instructions for betting?');
    do{yield* getcmd(2,0,'y or n?')}while(srcpile!=='y'&&srcpile!=='n');
    if(srcpile==='n')return;
    clear();
    bettinginstructions.forEach(printw);
    refresh();
    yield;
  }
  function loadscores(){
    var R=P.saved('canfield/scores'),me=P.st.user;
    if(!R||typeof R!=='object'||!P.has(R,me)||typeof R[me]!=='object'||!R[me])return;
    Object.keys(total).forEach(function(k){var v=R[me][k];if(Number.isFinite(v))total[k]=Math.trunc(v)});
  }
  function cleanup(){
    total.thinktime+=1;
    status=NOBOX;
    updatebettinginfo();
    var R=P.saved('canfield/scores');
    if(!R||typeof R!=='object'||Array.isArray(R))R={};
    R[P.st.user]=total;
    P.save('canfield/scores',R);
    throw EXIT;
  }
  function* finish(){
    var row,col;
    if(cardsoff===52){
      yield* getcmd(moverow,movecol,'Hit return to exit');
      clear();
      refresh();
      move(0,0);
      printw('CONGRATULATIONS!\n');
      printw('You won the game. That is a feat to be proud of.\n');
      row=5;col=0;
    }
    else{
      move(msgrow,msgcol);
      printw('You got '+cardsoff+' card');
      if(cardsoff>1)printw('s');
      printw(' off    ');
      move(msgrow,msgcol);
      row=moverow;col=movecol;
    }
    do{yield* getcmd(row,col,'Play again (y or n)?')}while(srcpile!=='y'&&srcpile!=='n');
    errmsg=true;
    clearmsg();
    return srcpile!=='y';
  }
  function* main(){
    initscr();
    srandom(Math.floor(Math.random()*30000)+1);
    acctstart=now();
    initdeck();
    loadscores();
    yield* instruct();
    makeboard();
    for(;;){
      yield* startgame();
      yield* movecard();
      if(yield* finish())break;
      if(cardsoff===52)makeboard();
      else cleanupboard();
    }
    cleanup();
  }
  var game=main(),over=false,asleep=false,started=false;
  function step(v){
    var r;
    try{r=game.next(v)}
    catch(e){
      if(e!==EXIT)throw e;
      over=true;S.close();finish_();
      return;
    }
    if(r.done){over=true;S.close();finish_();return}
    if(typeof r.value==='number'){ /* sleep */
      asleep=true;view(S);
      S.after(r.value,function(){asleep=false;if(!over)step()});
      return;
    }
    view(S);
  }
  var api={
    feed:function(k){
      if(over||asleep)return;
      if(k==='C-c'){step(-3);return}
      var c=k==='Enter'?13:k==='Backspace'?8:k==='Tab'?9:k==='Escape'?27:k.length===1?k.charCodeAt(0):/^C-[a-z]$/.test(k)?k.charCodeAt(2)-96:-1;
      if(c>=0)step(c);
    },
    draw:function(){if(curscr)view(S)}
  };
  step();
  return api;
  },{tty:'canfield',fit:[80,24]});
}});
})(window.Phosphor);
