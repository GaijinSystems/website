/* PHOSPHOR-9 terminal: machine "bsd-1987", monop. Ported to JavaScript for this terminal from 4.3BSD's games/monop:
   monop.c, monop.def, monop.h, deck.h, cards.c, cards.inp, execute.c, getinp.c, houses.c, jail.c, misc.c, morg.c, print.c, prop.c,
   rent.c, roll.c (the vax branch), spec.c, strcmp.c, trade.c, brd.dat, mon.dat, prop.dat, by Ken Arnold. The source files carry
   no copyright notice; they came under the Berkeley software License Agreement. The board and cards follow Monopoly, a trademark.

   Differences from the C:
   - The C seeds rand() with getpid(); there are no process ids here, so a random number stands in for one.
   - save wrote the whole data space to a file and restore read it back, and on the VAX restore then fell over in ctime(st_mtime).
     Here both work: the game's state goes through P.save under the name given, with the state of rand and the decks as the C's
     dump had them, and is checked when read. Starting from a file shuffles the decks afresh, as the C does.
   - shell runs a command at a time on this terminal, with % as the prompt; exit comes back.
   - printf(list[i]) for the '?' list prints the income tax answers "10%" and "%" as they stand.
   - printf(prompt) is a plain write, so a % in a player's name is only a %.
   - Places where the C read what it had not set, or a field that is not there, are pinned:
     resign's op->type is a byte of the next pointer, which is zero for the last in the list and so is taken as that only, and only
     for a real property; resign with no one to resign to (a safe square, or a property nobody owns) goes to the bank.
     rent[] with a house count that went negative through the char input is taken as zero; a railroad owner's count of none shifts
     right, as the VAX's ashl does.
   - ^D at a prompt prompts again; while a name is being typed it is ignored. Where the C spun on the end of a pipe, this goes
     on to the keyboard.
 */
(function(P){
'use strict';
var CARDS=[[
  ["F","F",0,">> GET OUT OF JAIL FREE <<\nKeep this card until needed or sold\n"],
  ["+","+",25,"Receive for Services $25.\n"],
  ["+","+",200,"Bank Error in Your Favor.\nCollect $200.\n"],
  ["+","+",20,"Income Tax Refund.\nCollect $20.\n"],
  ["-","-",100,"Pay Hospital $100\n"],
  ["+","+",100,"Life Insurance Matures.\nCollect $100\n"],
  ["+","+",45,"From sale of Stock You get $45.\n"],
  ["T","X",0,"You are Assessed for street repairs.\n\t$40 per House\n\t$115 per Hotel\n"],
  ["+","+",100,"X-mas Fund Matures.\nCollect $100.\n"],
  ["+","+",11,"You have won Second Prize in a Beauty Contest\nCollect $11\n"],
  ["M","F",0,"Advance to GO\n(Collect $200)\n"],
  ["+","+",100,"You inherit $100\n"],
  ["-","-",150,"Pay School Tax of $150.\n"],
  ["M","J",0,"\t\t>> GO TO JAIL <<\nGo Directly to Jail. Do not pass GO  Do not collect $200.\n"],
  ["+","A",50,"\t\t>> GRAND OPERA OPENING <<\nCollect $50 from each player for opening night seats.\n"],
  ["-","-",50,"Doctor's Fee:  Pay $50.\n"]
],
[
  ["F","F",0,">> GET OUT OF JAIL FREE <<\nKeep this card until needed or sold\n"],
  ["M","R",0,"Advance to the nearest Railroad, and pay owner\nTwice the rental to which he is otherwise entitled.\nIf Railroad is unowned you may buy it from the bank\n"],
  ["M","U",0,"Advance to the nearest Utility.\nIf unowned, you may buy it from the bank.\nIf owned, throw dice and pay oner a total of ten times\nthe amount thrown.\n"],
  ["M","B",3,"Go Back 3 Spaces\n"],
  ["M","R",0,"Advance to the nearest Railroad, and pay owner\nTwice the rental to which he is otherwise entitled.\nIf Railroad is unowned you may buy it from the bank\n"],
  ["M","J",0,"    >> GO DIRECTLY TO JAIL <<\nDo not pass GO, Do not Collect $200.\n"],
  ["M","F",5,"Take a Ride on the Reading.\nIf you pass GO, collect $200.\n"],
  ["M","F",39,"Take a Walk on the Board Walk.\n    (Advance To Board Walk)\n"],
  ["M","F",24,"Advance to Illinos Ave.\n"],
  ["M","F",0,"Advance to Go\n"],
  ["M","F",11,"Advance to St. Charles Place.\nIf you pass GO, collect $200.\n"],
  ["T","X",0,"Make general repairs on all of your Property.\nFor Each House pay $25.\nFor Each Hotel pay $100.\n"],
  ["-","A",50,"You have been elected Chairman of the Board.\nPay each player $50.\n"],
  ["-","-",15,"Pay Poor Tax of $15\n"],
  ["+","+",50,"Bank pays you Dividend of $50.\n"],
  ["+","+",150,"Your Building and Loan Matures.\nCollect $150.\n"]
]];
var TRUE=1,FALSE=0,N_MON=8,N_PROP=22,N_RR=4,N_UTIL=2,N_SQRS=40,MAX_PL=9,MAX_PRP=N_PROP+N_RR+N_UTIL,LINE=70,
  PRPTY=0,RR=1,UTIL=2,SAFE=3,CC=4,CHANCE=5,SPEC=6,JAIL=40,GOJF='F',EXIT={};
var HEADER='Name      Own      Price Mg # Rent';
var COMLIST=['quit','print','where','own holdings','holdings','shell','mortgage','unmortgage','buy houses','sell houses','card','pay','trade','resign','save','restore','roll',''];
var YN=['yes','no','quit','print','where','own holdings','holdings','shell'];
var MORG_COMS=['quit','print','where','own holdings','holdings','shell','mortgage','unmortgage','buy','sell','card','pay','trade','resign','save game','restore game'];
var PERC=['10%','ten percent','%','$200','200'];
var LUCKY=['You lucky stiff','You got lucky','What a lucky person!','You must have a 4-leaf clover',"My, my!  Aren't we lucky!",'Luck smiles upon you','You got lucky this time','Lucky person!','Your karma must certainly be together','How beautifully Cosmic','Wow, you must be really with it'];
var BOARD=[['=== GO ===',SAFE],['Mediterranean ave. (P)',PRPTY,0,60],['Community Chest i',CC],['Baltic ave. (P)',PRPTY,1,60],['Income Tax',SPEC,'inc_tax'],['Reading RR',RR,0,200],['Oriental ave. (L)',PRPTY,2,100],['Chance i',CHANCE],['Vermont ave. (L)',PRPTY,3,100],['Connecticut ave. (L)',PRPTY,4,120],
  ['Just Visiting',SAFE],['St. Charles pl. (V)',PRPTY,5,140],['Electric Co.',UTIL,0,150],['States ave. (V)',PRPTY,6,140],['Virginia ave. (V)',PRPTY,7,160],['Pennsylvania RR',RR,1,200],['St. James pl. (O)',PRPTY,8,180],['Community Chest ii',CC],['Tennessee ave. (O)',PRPTY,9,180],['New York ave. (O)',PRPTY,10,200],
  ['Free Parking',SAFE],['Kentucky ave. (R)',PRPTY,11,220],['Chance ii',CHANCE],['Indiana ave. (R)',PRPTY,12,220],['Illinois ave. (R)',PRPTY,13,240],['B&O RR',RR,2,200],['Atlantic ave. (Y)',PRPTY,14,260],['Ventnor ave. (Y)',PRPTY,15,260],['Water Works',UTIL,1,150],['Marvin Gardens (Y)',PRPTY,16,280],
  ['GO TO JAIL',SPEC,'goto_jail'],['Pacific ave. (G)',PRPTY,17,300],['N. Carolina ave. (G)',PRPTY,18,300],['Community Chest iii',CC],['Pennsylvania ave. (G)',PRPTY,19,320],['Short Line RR',RR,3,200],['Chance iii',CHANCE],['Park place (D)',PRPTY,20,350],['Luxury Tax',SPEC,'lux_tax'],['Boardwalk (D)',PRPTY,21,400],
  ['JAIL',SPEC]];
var MON=[[2,1,'Purple','PURPLE',[1,3]],[3,1,'Lt. Blue','LT. BLUE',[6,8,9]],[3,2,'Violet','VIOLET',[11,13,14]],[3,2,'Orange','ORANGE',[16,18,19]],[3,3,'Red','RED',[21,23,24]],[3,3,'Yellow','YELLOW',[26,27,29]],[3,4,'Green','GREEN',[31,32,34]],[2,4,'Dk. Blue','DK. BLUE',[37,39]]];
var PROP=[[0,[2,10,30,90,160,250]],[0,[4,20,60,180,320,450]],[1,[6,30,90,270,400,550]],[1,[6,30,90,270,400,550]],[1,[8,40,100,300,450,600]],[2,[10,50,150,450,625,750]],[2,[10,50,150,450,625,750]],[2,[12,60,180,500,700,900]],[3,[14,70,200,550,750,950]],[3,[14,70,200,550,750,950]],[3,[16,80,220,600,800,1000]],
  [4,[18,90,250,700,875,1050]],[4,[18,90,250,700,875,1050]],[4,[20,100,300,750,925,1100]],[5,[22,110,330,800,975,1150]],[5,[22,110,330,800,975,1150]],[5,[24,120,360,850,1025,1200]],[6,[26,130,390,900,1100,1275]],[6,[26,130,390,900,1100,1275]],[6,[28,150,450,1000,1200,1400]],[7,[35,175,500,1100,1300,1500]],[7,[50,200,600,1400,1700,2000]]];
function pad(s,n){s=String(s);while(s.length<n)s=' '+s;return s}
function fit(s,n){s=String(s).slice(0,n);while(s.length<n)s+=' ';return s}
function int8(v){return (v<<24)>>24}
function isInt(x,lo,hi){return typeof x==='number'&&Math.floor(x)===x&&x>=lo&&x<=hi}
function untab(s){ /* the terminal has no tabs to speak of: to the next stop of 8, on a line at a time */
  if(s.indexOf('\t')<0)return s;
  var r='',i,c;
  for(i=0;i<s.length;i++){
    c=s.charAt(i);
    if(c==='\t'){do r+=' ';while(r.length%8)}
    else r+=c;
  }
  return r;
}
function ctime(d){
  return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()]+' '+['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]+' '+pad(d.getDate(),2)+' '
    +('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2)+':'+('0'+d.getSeconds()).slice(-2)+' '+d.getFullYear();
}
function clock(){return P.now?P.now():new Date(Date.now())}
function strlow(s){return s.replace(/[A-Z]/g,function(c){return c.toLowerCase()})}
function good(s){
  var i,j,ok;
  if(!s||typeof s!=='object')return false;
  if(!isInt(s.player,0,MAX_PL-1)||!isInt(s.num_play,1,MAX_PL)||s.player>=s.num_play||!isInt(s.num_doub,0,3)||!isInt(s.randx,0,0x7fffffff)||!isInt(s.got_houses,0,1e9)||!isInt(s.mtime,0,9e15))return false;
  for(i=0;i<5;i++)if(!isInt(s.flags&&s.flags[i],0,255))return false;
  if(!Array.isArray(s.owners)||s.owners.length!==N_SQRS)return false;
  for(i=0;i<N_SQRS;i++)if(!isInt(s.owners[i],-1,MAX_PL))return false;
  if(!Array.isArray(s.props)||s.props.length!==N_PROP)return false;
  for(i=0;i<N_PROP;i++){ok=s.props[i];if(!Array.isArray(ok)||!isInt(ok[0],0,1)||!isInt(ok[1],0,1)||!isInt(ok[2],-128,127))return false}
  if(!Array.isArray(s.rrs)||s.rrs.length!==N_RR+N_UTIL)return false;
  for(i=0;i<s.rrs.length;i++)if(!isInt(s.rrs[i],0,1))return false;
  if(!Array.isArray(s.mons)||s.mons.length!==N_MON)return false;
  for(i=0;i<N_MON;i++){ok=s.mons[i];if(!Array.isArray(ok)||!isInt(ok[0],-1,MAX_PL)||!isInt(ok[1],-128,127)||!isInt(ok[2],0,1))return false}
  if(!Array.isArray(s.play)||s.play.length!==s.num_play)return false;
  for(i=0;i<s.num_play;i++){
    ok=s.play[i];
    if(!ok||typeof ok.name!=='string'||!ok.name||ok.name.length>256)return false;
    if(!isInt(ok.gojf,0,4)||!isInt(ok.rr,-9,N_RR)||!isInt(ok.util,-9,N_UTIL)||!isInt(ok.loc,0,JAIL)||!isInt(ok.jail,0,3)||!isInt(ok.money,-2147483648,2147483647)||!Array.isArray(ok.own))return false;
    for(j=0;j<ok.own.length;j++)if(!isInt(ok.own[j],0,N_SQRS-1)||BOARD[ok.own[j]][1]>UTIL)return false;
  }
  if(!Array.isArray(s.decks)||s.decks.length!==2)return false;
  for(i=0;i<2;i++){
    ok=s.decks[i];
    if(!ok||!isInt(ok.last,0,CARDS[i].length-1)||!isInt(ok.gojf,0,1)||!Array.isArray(ok.order)||ok.order.length!==CARDS[i].length)return false;
    for(j=0;j<ok.order.length;j++)if(!isInt(ok.order[j],0,CARDS[i].length-1))return false;
  }
  return true;
}
function run(words){
  var o='',pipe=P.stdin(),pat=0;
  var randx=Math.floor(Math.random()*30000)+1; /* srand(getpid()) */
  var fixing=FALSE,trading=FALSE,told_em=FALSE,spec=FALSE,new_play=FALSE,name_list=[],player=0,num_play=0,num_doub=0,play=[],cur_p=null,got_houses=0;
  var deck=[{order:[],last_card:0,gojf_used:FALSE,cards:CARDS[0]},{order:[],last_card:0,gojf_used:FALSE,cards:CARDS[1]}];
  var CC_D=deck[0],CH_D=deck[1];
  var rr=[],util=[],prop=[],mon=[],board=[],i;
  for(i=0;i<N_RR;i++)rr.push({morg:FALSE});
  for(i=0;i<N_UTIL;i++)util.push({morg:FALSE});
  for(i=0;i<N_MON;i++)mon.push({name:MON[i][2],owner:-1,num_in:MON[i][0],num_own:0,h_cost:MON[i][1],not_m:MON[i][2],mon_n:MON[i][3],sq:[]});
  for(i=0;i<N_PROP;i++)prop.push({morg:FALSE,monop:FALSE,houses:0,mon_desc:mon[PROP[i][0]],rent:PROP[i][1],idx:i});
  for(i=0;i<=N_SQRS;i++){
    var b=BOARD[i];
    board.push({name:b[0],owner:-1,type:b[1],cost:b[3]||0,num:i,
      desc:b[1]===PRPTY?prop[b[2]]:b[1]===RR?rr[b[2]]:b[1]===UTIL?util[b[2]]:{morg:FALSE},fn:typeof b[2]==='string'?b[2]:null});
  }
  mon.forEach(function(m,k){m.sq=MON[k][4].map(function(n){return board[n]})});
  function pr(s){o+=s}
  function printline(){pr('------------------------------\n')}
  function rand(){randx=(Math.imul(randx,1103515245)+12345)&0x7fffffff;return randx}
  function roll(ndie,nsides){
    var tot=0,num_sides=nsides;
    while(ndie--)tot=Math.trunc(tot+rand()*(num_sides/2147483647)+1);
    return tot;
  }
  function lucky(s){pr(s+LUCKY[roll(1,LUCKY.length)-1]+'\n')}
  /* ---------- reading: the C's getchar; ^C is its signal(2,quit) ---------- */
  var inq=false,pending=false;
  function* gets(){
    for(;;){
      var l;
      if(pipe&&pat<pipe.length)l=pipe[pat++];
      else l=yield;
      if(l===P.INT){
        if(inq){pending=true;continue}
        do{
          pending=false;
          inq=true;
          yield* quit();
          inq=false;
        }while(pending);
        continue;
      }
      return l;
    }
  }
  /* ---------- getinp.c ---------- */
  function comp(buf,s1){
    if(buf!=='')return strlow(s1).slice(0,buf.length)===buf&&s1.length>=buf.length;
    return s1==='';
  }
  function* getinp(prompt,list){
    var i,n_match,match,buf;
    for(;;){
      pr(prompt);
      buf=yield* gets();
      if(buf===null)continue;
      buf=buf.replace(/^ +/,'');
      if(buf==='?'){
        pr('Valid inputs are: ');
        for(i=0,match=18;list[i]!=null;i++){
          if((match+=(n_match=list[i].length))>LINE){
            pr('\n\t');
            match=n_match+8;
          }
          if(list[i]===''){
            match+=8;
            pr('<RETURN>');
          }
          else pr(list[i]);
          if(list[i+1]!=null)pr(', ');
          else pr('\n');
          match+=2;
        }
        continue;
      }
      buf=strlow(buf);
      for(i=n_match=0;list[i]!=null;i++)
        if(comp(buf,list[i])){
          n_match++;
          match=i;
        }
      if(n_match===1)return match;
      else if(buf!=='')pr('Illegal response: "'+buf+'".  Use \'?\' to get list of valid answers\n');
    }
  }
  /* ---------- misc.c ---------- */
  function* getyn(prompt){
    var com;
    for(;;){
      if((com=yield* getinp(prompt,YN))<2)return com;
      yield* FUNC[com-2]();
    }
  }
  function notify(){
    if(cur_p.money<0)pr('That leaves you $'+(-cur_p.money)+' in debt\n');
    else if(cur_p.money===0)pr('that leaves you broke\n');
    else if(fixing&&!told_em&&cur_p.money>0){
      pr('-- You are now Solvent ---\n');
      told_em=TRUE;
    }
  }
  function next_play(){
    player=(player+1)%num_play;
    cur_p=play[player];
    num_doub=0;
  }
  function* get_int(prompt){
    var num,sp,buf;
    for(;;){
      pr(prompt);
      num=0;
      buf=yield* gets();
      if(buf===null||buf==='')continue;
      for(sp=0;/[ \t\v\f\r]/.test(buf.charAt(sp))&&sp<buf.length;sp++)continue;
      for(;sp<buf.length&&buf.charAt(sp)>='0'&&buf.charAt(sp)<='9';sp++)num=(Math.imul(num,10)+buf.charCodeAt(sp)-48)|0;
      if(sp===buf.length)return num;
      pr("I can't understand that\n");
    }
  }
  function set_ownlist(pl){
    var num,orig,op=play[pl].own_list;
    while(op){
      switch(op.sqr.type){
        case UTIL:
          for(num=0;op&&op.sqr.type===UTIL;op=op.next)num++;
          play[pl].num_util=num;
          break;
        case RR:
          for(num=0;op&&op.sqr.type===RR;op=op.next)num++;
          play[pl].num_rr=num;
          break;
        case PRPTY:
          orig=op.sqr.desc.mon_desc;
          num=0;
          while(op&&op.sqr.desc.mon_desc===orig){
            num++;
            op=op.next;
          }
          if(num===orig.num_in)is_monop(orig,pl);
          else isnot_monop(orig);
          break;
      }
    }
  }
  function is_monop(mp,pl){
    mp.owner=pl;
    mp.num_own=mp.num_in;
    for(var i=0;i<mp.num_in;i++)mp.sq[i].desc.monop=TRUE;
    mp.name=mp.mon_n;
  }
  function isnot_monop(mp){
    mp.owner=-1;
    for(var i=0;i<mp.num_in;i++)mp.sq[i].desc.monop=FALSE;
    mp.name=mp.not_m;
  }
  function* list(){printhold(player)}
  function* list_all(){
    var pl;
    while((pl=yield* getinp('Whose holdings do you want to see? ',name_list))<num_play)printhold(pl);
  }
  function* quit(){
    pr('\n');
    if((yield* getyn('Do you all really want to quit? '))===0)throw EXIT;
  }
  function* shell_out(){
    printline();
    if(P.keep&&!P.piped()){
      var back=P.keep(); /* a child shell: a cd in it stays there */
      for(;;){
        pr('% ');
        var l=yield;
        if(l===null||/^\s*(exit|logout)\s*$/.test(l))break;
        if(l!==P.INT&&l.trim())P.runScript([l]);
      }
      back();
    }
    pr('\n');
    printline();
  }
  /* ---------- cards.c ---------- */
  function set_up(dp){
    var r1,r2,i,temp;
    dp.order=[];
    for(i=0;i<dp.cards.length;i++)dp.order.push(i);
    dp.last_card=0;
    dp.gojf_used=FALSE;
    for(i=0;i<dp.cards.length;i++){
      r1=roll(1,dp.cards.length)-1;
      r2=roll(1,dp.cards.length)-1;
      temp=dp.order[r2];
      dp.order[r2]=dp.order[r1];
      dp.order[r1]=temp;
    }
  }
  function init_decks(){set_up(CC_D);set_up(CH_D)}
  function* get_card(dp){
    var type_maj,type_min,num,i,per_h,per_H,num_h,num_H,op,card;
    do{
      card=dp.cards[dp.order[dp.last_card]];
      dp.last_card=(dp.last_card+1)%dp.cards.length;
      type_maj=card[0];
    }while(dp.gojf_used&&type_maj===GOJF);
    type_min=card[1];
    num=card[2];
    printline();
    pr(card[3]);
    printline();
    switch(type_maj){
      case '+':
        if(type_min==='A'){
          for(i=0;i<num_play;i++)if(i!==player)play[i].money-=num;
          num=num*(num_play-1);
        }
        cur_p.money+=num;
        break;
      case '-':
        if(type_min==='A'){
          for(i=0;i<num_play;i++)if(i!==player)play[i].money+=num;
          num=num*(num_play-1);
        }
        cur_p.money-=num;
        break;
      case 'M':
        switch(type_min){
          case 'F':
            num-=cur_p.loc;
            if(num<0)num+=40;
            break;
          case 'J':
            goto_jail();
            return;
          case 'R':
            spec=TRUE;
            num=Math.floor((cur_p.loc+5)/10)*10+5-cur_p.loc;
            break;
          case 'U':
            spec=TRUE;
            if(cur_p.loc>=12&&cur_p.loc<28)num=28-cur_p.loc;
            else{
              num=12-cur_p.loc;
              if(num<0)num+=40;
            }
            break;
          case 'B':
            num=-num;
            break;
        }
        yield* move(num);
        break;
      case 'T':
        if(dp===CC_D){per_h=40;per_H=115}
        else{per_h=25;per_H=100}
        num_h=num_H=0;
        for(op=cur_p.own_list;op;op=op.next)
          if(op.sqr.type===PRPTY){
            if(op.sqr.desc.houses===5)++num_H;
            else num_h+=op.sqr.desc.houses;
          }
        num=per_h*num_h+per_H*num_H;
        pr('You had '+num_h+' Houses and '+num_H+' Hotels, so that cost you $'+num+'\n');
        if(num===0)lucky('');
        else cur_p.money-=num;
        break;
      case GOJF:
        cur_p.num_gojf++;
        dp.gojf_used=TRUE;
        break;
    }
    spec=FALSE;
  }
  /* ---------- execute.c ---------- */
  function* execute(com_num){
    new_play=FALSE;
    yield* FUNC[com_num]();
    notify();
    yield* force_morg();
    if(new_play)next_play();
    else if(num_doub)pr(cur_p.name+' rolled doubles.  Goes again\n');
  }
  function* do_move(){
    var r1,r2,was_jail;
    new_play=was_jail=FALSE;
    r2=roll(1,6); /* the arguments of the printf, from the right */
    r1=roll(1,6);
    pr('roll is '+r1+', '+r2+'\n');
    if(cur_p.loc===JAIL){
      was_jail++;
      if(!(yield* move_jail(r1,r2))){
        new_play++;
        return;
      }
    }
    else{
      if(r1===r2&&++num_doub===3){
        pr("That's 3 doubles.  You go to jail\n");
        goto_jail();
        new_play++;
        return;
      }
      yield* move(r1+r2);
    }
    if(r1!==r2||was_jail)new_play++;
  }
  function* move(rl){
    var old_loc=cur_p.loc;
    cur_p.loc=(cur_p.loc+rl)%N_SQRS;
    if(cur_p.loc<old_loc&&rl>0){
      cur_p.money+=200;
      pr('You pass '+board[0].name+' and get $200\n');
    }
    yield* show_move();
  }
  function* show_move(){
    var sqp=board[cur_p.loc];
    pr('That puts you on '+sqp.name+'\n');
    switch(sqp.type){
      case SAFE:
        pr('That is a safe place\n');
        break;
      case CC:
        yield* get_card(CC_D);
        break;
      case CHANCE:
        yield* get_card(CH_D);
        break;
      case SPEC:
        if(sqp.fn==='inc_tax')yield* inc_tax();
        else if(sqp.fn==='goto_jail')goto_jail();
        else if(sqp.fn==='lux_tax')lux_tax();
        break;
      case PRPTY:case RR:case UTIL:
        if(sqp.owner<0){
          pr('That would cost $'+sqp.cost+'\n');
          if((yield* getyn('Do you want to buy? '))===0){
            buy(player,sqp);
            cur_p.money-=sqp.cost;
          }
          else if(num_play>2)yield* bid();
        }
        else if(sqp.owner===player)pr('You own it.\n');
        else rent(sqp);
    }
  }
  function state(){
    return {player:player,num_play:num_play,num_doub:num_doub,randx:randx,got_houses:got_houses,mtime:clock().getTime(),
      flags:[fixing?1:0,told_em?1:0,trading?1:0,spec?1:0,new_play?1:0],
      owners:board.slice(0,N_SQRS).map(function(q){return q.owner}),
      props:prop.map(function(q){return [q.morg?1:0,q.monop?1:0,q.houses]}),
      rrs:rr.concat(util).map(function(q){return q.morg?1:0}),
      mons:mon.map(function(m){return [m.owner,m.num_own,m.name===m.mon_n?1:0]}),
      play:play.slice(0,num_play).map(function(q){
        var own=[],op;
        for(op=q.own_list;op;op=op.next)own.push(op.sqr.num);
        return {name:q.name,gojf:q.num_gojf,rr:q.num_rr,util:q.num_util,loc:q.loc,jail:q.in_jail,money:q.money,own:own};
      }),
      decks:deck.map(function(d){return {last:d.last_card,gojf:d.gojf_used?1:0,order:d.order.slice()}})};
  }
  function setstate(s){
    var i;
    player=s.player;num_play=s.num_play;num_doub=s.num_doub;randx=s.randx;got_houses=s.got_houses;
    fixing=s.flags[0];told_em=s.flags[1];trading=s.flags[2];spec=s.flags[3];new_play=s.flags[4];
    for(i=0;i<N_SQRS;i++)board[i].owner=s.owners[i];
    for(i=0;i<N_PROP;i++){prop[i].morg=s.props[i][0];prop[i].monop=s.props[i][1];prop[i].houses=s.props[i][2]}
    rr.concat(util).forEach(function(q,k){q.morg=s.rrs[k]});
    for(i=0;i<N_MON;i++){mon[i].owner=s.mons[i][0];mon[i].num_own=s.mons[i][1];mon[i].name=s.mons[i][2]?mon[i].mon_n:mon[i].not_m}
    play=[];name_list=[];
    s.play.forEach(function(q){
      var p=blank();
      p.name=q.name;p.num_gojf=q.gojf;p.num_rr=q.rr;p.num_util=q.util;p.loc=q.loc;p.in_jail=q.jail;p.money=q.money;
      for(var k=q.own.length-1;k>=0;k--)p.own_list={sqr:board[q.own[k]],next:p.own_list};
      play.push(p);
      name_list.push(q.name);
    });
    while(play.length<MAX_PL+2)play.push(blank());
    name_list.push('done');
    name_list.push(null);
    cur_p=play[player];
    deck.forEach(function(d,k){d.last_card=s.decks[k].last;d.gojf_used=s.decks[k].gojf;d.order=s.decks[k].order.slice()});
  }
  function* readname(){
    var l;
    do l=yield* gets();while(l===null);
    return l;
  }
  function* save(){
    var buf;
    pr('Which file do you wish to save it in? ');
    buf=yield* readname();
    if(P.saved('monop/'+buf)!==null&&(yield* getyn('File exists.  Do you wish to overwrite? '))>0)return;
    if(buf===''){pr(': No such file or directory\n');return}
    if(P.save('monop/'+buf,state())===false){pr(buf+': No space left on device\n');return}
    pr('"'+buf+'" ');
    pr('['+ctime(clock())+']\n');
  }
  function* restore(){
    var buf;
    pr('Which file do you wish to restore from? ');
    buf=yield* readname();
    rest_f(buf);
  }
  function rest_f(file){
    var s=P.saved('monop/'+file);
    if(s===null){
      pr(file+': No such file or directory\n');
      return FALSE;
    }
    pr('"'+file+'" ');
    if(!good(s)){
      pr('not a saved game\n');
      return FALSE;
    }
    setstate(s);
    pr('['+ctime(new Date(s.mtime))+']\n');
    return TRUE;
  }
  /* ---------- houses.c ---------- */
  function* buy_houses(){
    var num_mon,mp,op,good_,got_morg,i,p,names=[],monops=[];
    for(;;){
      num_mon=0;
      good_=TRUE;
      got_morg=FALSE;
      for(op=cur_p.own_list;op&&op.sqr.type!==PRPTY;op=op.next)continue;
      while(op){
        if(op.sqr.desc.monop){
          mp=op.sqr.desc.mon_desc;
          names[num_mon]=(monops[num_mon]=mp).name;
          num_mon++;
          got_morg=good_=FALSE;
          for(i=0;i<mp.num_in;i++){
            if(op.sqr.desc.morg)got_morg++;
            if(op.sqr.desc.houses!==5)good_++;
            op=op.next;
          }
          if(!good_||got_morg)--num_mon;
        }
        else op=op.next;
      }
      if(num_mon===0){
        if(got_morg)pr("You can't build on mortgaged monopolies.\n");
        else if(!good_)pr("You can't build any more.\n");
        else pr("But you don't have any monopolies!!\n");
        return;
      }
      if(num_mon===1){
        yield* buy_h(monops[0]);
        return;
      }
      names[num_mon++]='done';
      names[num_mon--]=null;
      if((p=yield* getinp('Which property do you wish to buy houses for? ',names))===num_mon)return;
      yield* buy_h(monops[p]);
    }
  }
  function spread(mp,temp){
    if(mp.num_in===3&&(Math.abs(temp[0]-temp[1])>1||Math.abs(temp[0]-temp[2])>1||Math.abs(temp[1]-temp[2])>1))return true;
    return mp.num_in===2&&Math.abs(temp[0]-temp[1])>1;
  }
  function* buy_h(mp){
    var i,price=mp.h_cost*50,input=[0,0,0],temp=[0,0,0],tot,pp;
    for(;;){
      list_cur(mp);
      pr('Houses will cost $'+price+'\n');
      pr('How many houses do you wish to buy for\n');
      for(i=0;i<mp.num_in;i++){
        pp=mp.sq[i].desc;
        for(;;){
          if(pp.houses===5){
            pr(mp.sq[i].name+' (H):\n');
            input[i]=0;
            temp[i]=5;
            break;
          }
          input[i]=int8(yield* get_int(mp.sq[i].name+' ('+pp.houses+'): '));
          temp[i]=int8(input[i]+pp.houses);
          if(temp[i]>5){
            pr("That's too many.  The most you can buy is "+(5-pp.houses)+'\n');
            continue;
          }
          break;
        }
      }
      if(spread(mp,temp)){
        pr('That makes the spread too wide.  Try again\n');
        continue;
      }
      break;
    }
    for(tot=i=0;i<mp.num_in;i++)tot+=input[i];
    if(tot){
      pr('You asked for '+tot+' houses for $'+(tot*price)+'\n');
      if((yield* getyn('Is that ok? '))===0){
        cur_p.money-=tot*price;
        for(i=0;i<mp.num_in;i++)mp.sq[i].desc.houses=temp[i];
      }
    }
  }
  function* sell_houses(){
    var num_mon,mp,op,good_,p,names=[],monops=[];
    for(;;){
      num_mon=0;
      good_=TRUE;
      for(op=cur_p.own_list;op;op=op.next){
        if(op.sqr.type===PRPTY&&op.sqr.desc.monop){
          mp=op.sqr.desc.mon_desc;
          names[num_mon]=(monops[num_mon]=mp).name;
          num_mon++;
          good_=0;
          do{
            if(!good_&&op.sqr.desc.houses!==0)good_++;
          }while(op.next&&op.sqr.desc.mon_desc===mp&&(op=op.next));
          if(!good_)--num_mon;
        }
      }
      if(num_mon===0){
        pr("You don't have any houses to sell!!\n");
        return;
      }
      if(num_mon===1){
        yield* sell_h(monops[0]);
        return;
      }
      names[num_mon++]='done';
      names[num_mon--]=null;
      if((p=yield* getinp('Which property do you wish to sell houses from? ',names))===num_mon)return;
      yield* sell_h(monops[p]);
      notify();
    }
  }
  function* sell_h(mp){
    var i,price=mp.h_cost*25,input=[0,0,0],temp=[0,0,0],tot,pp;
    for(;;){
      pr('Houses will get you $'+price+' apiece\n');
      list_cur(mp);
      pr('How many houses do you wish to sell from\n');
      for(i=0;i<mp.num_in;i++){
        pp=mp.sq[i].desc;
        for(;;){
          if(pp.houses===0){
            pr(mp.sq[i].name+' (0):\n');
            input[i]=temp[i]=0;
            break;
          }
          input[i]=int8(yield* get_int(mp.sq[i].name+(pp.houses<5?' ('+pp.houses+'): ':' (H): ')));
          temp[i]=int8(pp.houses-input[i]);
          if(temp[i]<0){
            pr("That's too many.  The most you can sell is "+pp.houses+'\n');
            continue;
          }
          break;
        }
      }
      if(spread(mp,temp)){
        pr('That makes the spread too wide.  Try again\n');
        continue;
      }
      break;
    }
    for(tot=i=0;i<mp.num_in;i++)tot+=input[i];
    if(tot){
      pr('You asked to sell '+tot+' houses for $'+(tot*price)+'\n');
      if((yield* getyn('Is that ok? '))===0){
        cur_p.money+=tot*price;
        for(i=0;i<mp.num_in;i++)mp.sq[i].desc.houses=temp[i];
      }
    }
  }
  function list_cur(mp){
    var i,sqp;
    for(i=0;i<mp.num_in;i++){
      sqp=mp.sq[i];
      if(sqp.desc.houses===5)pr(sqp.name+' (H) ');
      else pr(sqp.name+' ('+sqp.desc.houses+') ');
    }
    pr('\n');
  }
  /* ---------- jail.c ---------- */
  function* card(){
    if(cur_p.loc!==JAIL){pr("But you're not IN Jail\n");return}
    if(cur_p.num_gojf===0){pr("But you don't HAVE a get out of jail free card\n");return}
    ret_card(cur_p);
    cur_p.loc=10;
    cur_p.in_jail=0;
  }
  function ret_card(plr){
    plr.num_gojf--;
    if(CC_D.gojf_used)CC_D.gojf_used=FALSE;
    else CH_D.gojf_used=FALSE;
  }
  function* pay(){
    if(cur_p.loc!==JAIL){pr("But you're not IN Jail\n");return}
    cur_p.loc=10;
    cur_p.money-=50;
    cur_p.in_jail=0;
    pr('That cost you $50\n');
  }
  function* move_jail(r1,r2){
    if(r1!==r2){
      pr("Sorry, that doesn't get you out\n");
      if(++cur_p.in_jail===3){
        pr("It's your third turn and you didn't roll doubles.  You have to pay $50\n");
        cur_p.money-=50;
      }
      else return FALSE;
    }
    else pr('Double roll gets you out.\n');
    cur_p.loc=10;
    cur_p.in_jail=0;
    yield* move(r1+r2);
    return TRUE;
  }
  function printturn(){
    if(cur_p.loc!==JAIL)return;
    pr('(This is your ');
    switch(cur_p.in_jail){
      case 0:pr('1st');break;
      case 1:pr('2nd');break;
      case 2:pr('3rd (and final)');break;
    }
    pr(' turn in JAIL)\n');
  }
  /* ---------- morg.c ---------- */
  var names=[],square=[],num_good=0;
  function* mortgage(){
    var pr_;
    for(;;){
      if(set_mlist()===0){
        if(got_houses)pr("You can't mortgage property with houses on it.\n");
        else pr("You don't have any un-mortgaged property.\n");
        return;
      }
      if(num_good===1){
        pr('Your only mortageable property is '+names[0]+'\n');
        if((yield* getyn('Do you want to mortgage it? '))===0)m(square[0]);
        return;
      }
      pr_=yield* getinp('Which property do you want to mortgage? ',names);
      if(pr_===num_good)return;
      m(square[pr_]);
      notify();
    }
  }
  function set_mlist(){
    var op;
    num_good=0;
    names=[];
    for(op=cur_p.own_list;op;op=op.next)
      if(!op.sqr.desc.morg){
        if(op.sqr.type===PRPTY&&op.sqr.desc.houses)got_houses++;
        else{
          names[num_good]=op.sqr.name;
          square[num_good++]=op.sqr.num;
        }
      }
    names[num_good++]='done';
    names[num_good--]=null;
    return num_good;
  }
  function m(pr_){
    var price=Math.trunc(board[pr_].cost/2);
    board[pr_].desc.morg=TRUE;
    pr('That got you $'+price+'\n');
    cur_p.money+=price;
  }
  function* unmortgage(){
    var pr_;
    for(;;){
      if(set_umlist()===0){
        pr("You don't have any mortgaged property.\n");
        return;
      }
      if(num_good===1){
        pr('Your only mortaged property is '+names[0]+'\n');
        if((yield* getyn('Do you want to unmortgage it? '))===0)unm(square[0]);
        return;
      }
      pr_=yield* getinp('Which property do you want to unmortgage? ',names);
      if(pr_===num_good)return;
      unm(square[pr_]);
    }
  }
  function set_umlist(){
    var op;
    num_good=0;
    names=[];
    for(op=cur_p.own_list;op;op=op.next)
      if(op.sqr.desc.morg){
        names[num_good]=op.sqr.name;
        square[num_good++]=op.sqr.num;
      }
    names[num_good++]='done';
    names[num_good--]=null;
    return num_good;
  }
  function unm(pr_){
    var price=Math.trunc(board[pr_].cost/2);
    board[pr_].desc.morg=FALSE;
    price+=Math.trunc(price/10);
    pr('That cost you $'+price+'\n');
    cur_p.money-=price;
    set_umlist();
  }
  function* force_morg(){
    told_em=fixing=TRUE;
    while(cur_p.money<=0)yield* fix_ex(yield* getinp('How are you going to fix it up? ',MORG_COMS));
    fixing=FALSE;
  }
  function* fix_ex(com_num){
    told_em=FALSE;
    yield* FUNC[com_num]();
    notify();
  }
  /* ---------- print.c ---------- */
  function* printboard(){
    pr(HEADER+'\t'+HEADER+'\n');
    for(var i=0;i<N_SQRS/2;i++){
      printsq(i,FALSE);
      pr('\t');
      printsq(i+N_SQRS/2,TRUE);
    }
  }
  function* where(){
    pr(HEADER+' Player\n');
    for(var i=0;i<num_play;i++){
      printsq(play[i].loc,FALSE);
      pr(' '+play[i].name+' ('+(i+1)+')');
      if(cur_p===play[i])pr(' *');
      pr('\n');
    }
  }
  function shl(v,n){return n<0?v>>-n:v<<n}
  function rentof(pp,h){var r=pp.rent[h];return r===undefined?0:r}
  function printsq(sqn,eoln){
    var pp,sqp=board[sqn];
    pr(fit(sqp.name,10));
    if(sqn===JAIL){
      if(!eoln)pr('                        ');
    }
    else switch(sqp.type){
      case SAFE:case CC:case CHANCE:case SPEC:
        if(!eoln)pr('                        ');
        break;
      case PRPTY:
        pp=sqp.desc;
        if(sqp.owner<0){
          pr(' - '+fit(pp.mon_desc.name,8)+' '+pad(sqp.cost,3));
          if(!eoln)pr('         ');
          break;
        }
        pr(' '+(sqp.owner+1)+' '+fit(pp.mon_desc.name,8)+' '+pad(sqp.cost,3));
        printmorg(sqp);
        if(pp.monop){
          if(pp.houses<5){
            if(pp.houses>0)pr(pp.houses+' '+pad(rentof(pp,pp.houses),4));
            else pr('0 '+pad(pp.rent[0]*2,4));
          }
          else pr('H '+pad(rentof(pp,5),4));
        }
        else pr('  '+pad(pp.rent[0],4));
        break;
      case UTIL:
        if(sqp.owner<0){
          pr(' -          150');
          if(!eoln)pr('         ');
          break;
        }
        pr(' '+(sqp.owner+1)+'          150');
        printmorg(sqp);
        pr(String(play[sqp.owner].num_util));
        if(!eoln)pr('    ');
        break;
      case RR:
        if(sqp.owner<0){
          pr(' - Railroad 200');
          if(!eoln)pr('         ');
          break;
        }
        pr(' '+(sqp.owner+1)+' Railroad 200');
        printmorg(sqp);
        pr(play[sqp.owner].num_rr+' '+pad(shl(25,play[sqp.owner].num_rr-1),4));
        break;
    }
    if(eoln)pr('\n');
  }
  function printmorg(sqp){pr(sqp.desc.morg?' * ':'   ')}
  function printhold(pl){
    var op,pp=play[pl];
    pr(name_list[pl]+"'s ("+(pl+1)+') holdings (Total worth: $'+(pp.money+prop_worth(pp))+'):\n');
    pr('\t$'+pp.money);
    if(pp.num_gojf){
      pr(', '+pp.num_gojf+' get-out-of-jail-free card');
      if(pp.num_gojf>1)pr('s');
    }
    pr('\n');
    if(pp.own_list){
      pr('\t'+HEADER+'\n');
      for(op=pp.own_list;op;op=op.next){
        pr('\t');
        printsq(op.sqr.num,TRUE);
      }
    }
  }
  /* ---------- prop.c ---------- */
  function buy(pl,sqrp){
    trading=FALSE;
    sqrp.owner=pl;
    add_list(pl,play[pl],'own_list',cur_p.loc);
  }
  function add_list(plr,holder,key,op_sqr){
    var val,tp,last_tp=null,op={sqr:board[op_sqr],next:null};
    val=value(op.sqr);
    for(tp=holder[key];tp&&value(tp.sqr)<val;tp=tp.next)last_tp=tp;
    op.next=tp;
    if(last_tp!==null)last_tp.next=op;
    else holder[key]=op;
    if(!trading)set_ownlist(plr);
  }
  function del_list(plr,pl,op_sqr){
    var op,last_op=null;
    switch(board[op_sqr].type){
      case PRPTY:board[op_sqr].desc.mon_desc.num_own=int8(board[op_sqr].desc.mon_desc.num_own-1);break;
      case RR:play[plr].num_rr--;break;
      case UTIL:play[plr].num_util--;break;
    }
    for(op=pl.own_list;op;op=op.next){
      if(op.sqr===board[op_sqr])break;
      last_op=op;
    }
    if(last_op===null)pl.own_list=op.next;
    else last_op.next=op.next;
  }
  function value(sqp){
    switch(sqp.type){
      case SAFE:return 0;
      case SPEC:return 1;
      case UTIL:return sqp.num===12?2:3;
      case RR:return 4+Math.floor(sqp.num/10);
      case PRPTY:return 8+sqp.desc.idx;
    }
  }
  function* bid(){
    var inn=[],i,num_in,cur_max,cur_bid;
    pr('\nSo it goes up for auction.  Type your bid after your name\n');
    for(i=0;i<num_play;i++)inn[i]=TRUE;
    i=-1;
    cur_max=0;
    num_in=num_play;
    while(num_in>1||(cur_max===0&&num_in>0)){
      i=(i+1)%num_play;
      if(inn[i]){
        do{
          cur_bid=yield* get_int(name_list[i]+': ');
          if(cur_bid===0){
            inn[i]=FALSE;
            if(--num_in===0)break;
          }
          else if(cur_bid<=cur_max){
            pr('You must bid higher than '+cur_max+' to stay in\n');
            pr('(bid of 0 drops you out)\n');
          }
        }while(cur_bid!==0&&cur_bid<=cur_max);
        cur_max=cur_bid?cur_bid:cur_max;
      }
    }
    if(cur_max!==0){
      while(!inn[i])i=(i+1)%num_play;
      pr('It goes to '+play[i].name+' ('+(i+1)+') for $'+cur_max+'\n');
      buy(i,board[cur_p.loc]);
      play[i].money-=cur_max;
    }
    else pr("Nobody seems to want it, so we'll leave it for later\n");
  }
  function prop_worth(plp){
    var op,worth=0;
    for(op=plp.own_list;op;op=op.next){
      if(op.sqr.type===PRPTY&&op.sqr.desc.monop)worth+=op.sqr.desc.mon_desc.h_cost*50*op.sqr.desc.houses;
      worth+=op.sqr.cost;
    }
    return worth;
  }
  /* ---------- rent.c ---------- */
  function rent(sqp){
    var rnt,pp,plp=play[sqp.owner];
    pr('Owned by '+plp.name+'\n');
    if(sqp.desc.morg){
      lucky('The thing is mortgaged.  ');
      return;
    }
    switch(sqp.type){
      case PRPTY:
        pp=sqp.desc;
        if(pp.monop){
          if(pp.houses===0)pr('rent is '+(rnt=pp.rent[0]*2)+'\n');
          else if(pp.houses<5)pr('with '+pp.houses+' houses, rent is '+(rnt=rentof(pp,pp.houses))+'\n');
          else pr('with a hotel, rent is '+(rnt=rentof(pp,pp.houses))+'\n');
        }
        else pr('rent is '+(rnt=pp.rent[0])+'\n');
        break;
      case RR:
        rnt=shl(25,plp.num_rr-1);
        if(spec)rnt<<=1;
        pr('rent is '+rnt+'\n');
        break;
      case UTIL:
        rnt=roll(2,6);
        if(plp.num_util===2||spec){
          pr('rent is 10 * roll ('+rnt+') = '+(rnt*10)+'\n');
          rnt*=10;
        }
        else{
          pr('rent is 4 * roll ('+rnt+') = '+(rnt*4)+'\n');
          rnt*=4;
        }
        break;
    }
    cur_p.money-=rnt;
    plp.money+=rnt;
  }
  /* ---------- spec.c ---------- */
  function* inc_tax(){
    var worth,com_num;
    com_num=yield* getinp('Do you wish to lose 10% of your total worth or $200? ',PERC);
    worth=cur_p.money+prop_worth(cur_p);
    pr('You were worth $'+worth);
    worth=Math.trunc(worth/10);
    if(com_num>2){
      if(worth<200)pr('.  Good try, but not quite.\n');
      else if(worth>200)lucky('.\nGood guess.  ');
      cur_p.money-=200;
    }
    else{
      pr(', so you pay $'+worth);
      if(worth>200)pr('  OUCH!!!!.\n');
      else if(worth<200)lucky('\nGood guess.  ');
      cur_p.money-=worth;
    }
    if(worth===200)lucky('\nIt makes no difference!  ');
  }
  function goto_jail(){cur_p.loc=JAIL}
  function lux_tax(){
    pr('You lose $75\n');
    cur_p.money-=75;
  }
  /* ---------- trade.c ---------- */
  var trades=[{trader:0,cash:0,gojf:0,prop_list:null},{trader:0,cash:0,gojf:0,prop_list:null}];
  function* trade(){
    var tradee,i;
    trading=TRUE;
    for(i=0;i<2;i++){
      trades[i].cash=0;
      trades[i].gojf=FALSE;
      trades[i].prop_list=null;
    }
    for(;;){
      if(num_play===1){
        pr("There ain't no-one around to trade WITH!!\n");
        return;
      }
      if(num_play>2){
        tradee=yield* getinp('Which player do you wish to trade with? ',name_list);
        if(tradee===num_play)return;
        if(tradee===player){
          pr("You can't trade with yourself!\n");
          continue;
        }
      }
      else tradee=1-player;
      break;
    }
    yield* get_list(0,player);
    yield* get_list(1,tradee);
    if((yield* getyn('Do you wish a summary? '))===0)summate();
    if((yield* getyn('Is the trade ok? '))===0)do_trade();
  }
  function* get_list(sn,pn){
    var pp=play[pn],tp=trades[sn],numin,pr_,num_prp,op,used=[],list_,i;
    tp.trader=pn;
    pr('player '+pp.name+' ('+(pn+1)+'):\n');
    if(pp.own_list){
      list_=[];
      for(op=pp.own_list;op;op=op.next)list_.push(op.sqr.name);
      numin=list_.length;
      list_.push('done');
      list_.push(null);
      for(num_prp=numin;num_prp;){
        pr_=yield* getinp('Which property do you wish to trade? ',list_);
        if(pr_===numin)break;
        else if(used[pr_])pr("You've already allocated that.\n");
        else{
          num_prp--;
          used[pr_]=TRUE;
          for(op=pp.own_list;pr_--;op=op.next)continue;
          add_list(pn,tp,'prop_list',op.sqr.num);
        }
      }
    }
    if(pp.money>0){
      pr('You have $'+pp.money+'.  ');
      tp.cash=yield* get_int('How much are you trading? ');
    }
    if(pp.num_gojf>0){
      for(;;){
        pr('You have '+pp.num_gojf+' get-out-of-jail-free cards. ');
        tp.gojf=yield* get_int('How many are you trading? ');
        if(tp.gojf>pp.num_gojf){
          pr("You don't have that many.  Try again.\n");
          continue;
        }
        break;
      }
    }
  }
  function summate(){
    var some,i,tp,op;
    for(i=0;i<2;i++){
      tp=trades[i];
      some=FALSE;
      pr('Player '+play[tp.trader].name+' ('+(tp.trader+1)+') gives:\n');
      if(tp.cash>0){pr('\t$'+tp.cash+'\n');some++}
      if(tp.gojf>0){pr('\t'+tp.gojf+' get-out-of-jail-free card(s)\n');some++}
      if(tp.prop_list){
        for(op=tp.prop_list;op;op=op.next){pr('\t');printsq(op.sqr.num,TRUE)}
        some++;
      }
      if(!some)pr('\t-- Nothing --\n');
    }
  }
  function do_trade(){
    move_em(trades[0],trades[1]);
    move_em(trades[1],trades[0]);
  }
  function move_em(from,to){
    var pl_fr=play[from.trader],pl_to=play[to.trader],op;
    pl_fr.money-=from.cash;
    pl_to.money+=from.cash;
    pl_fr.num_gojf-=from.gojf;
    pl_to.num_gojf+=from.gojf;
    for(op=from.prop_list;op;op=op.next){
      add_list(to.trader,pl_to,'own_list',op.sqr.num);
      op.sqr.owner=to.trader;
      del_list(from.trader,pl_fr,op.sqr.num);
    }
    set_ownlist(to.trader);
  }
  function* resign(){
    var i,new_own=num_play,op,sqp;
    if(cur_p.money<=0){
      switch(board[cur_p.loc].type){
        case UTIL:case RR:case PRPTY:
          new_own=board[cur_p.loc].owner;
          if(new_own<0)new_own=num_play;
          break;
        default:
          new_own=num_play;
      }
      if(new_own===num_play)pr('You would resign to the bank\n');
      else pr('You would resign to '+name_list[new_own]+'\n');
    }
    else if(num_play===1){
      new_own=num_play;
      pr('You would resign to the bank\n');
    }
    else{
      name_list[num_play]='bank';
      do{
        new_own=yield* getinp('Who do you wish to resign to? ',name_list);
        if(new_own===player)pr("You can't resign to yourself!!\n");
      }while(new_own===player);
      name_list[num_play]='done';
    }
    if((yield* getyn('Do you really want to resign? '))!==0)return;
    if(num_play===1){
      pr('Then NOBODY wins (not even YOU!)\n');
      throw EXIT;
    }
    if(new_own<num_play){
      pr('resigning to player\n');
      trades[0].trader=new_own;
      trades[0].cash=trades[0].gojf=0;
      trades[0].prop_list=null;
      trades[1].trader=player;
      trades[1].cash=cur_p.money>0?cur_p.money:0;
      trades[1].gojf=cur_p.num_gojf;
      trades[1].prop_list=cur_p.own_list;
      do_trade();
    }
    else{
      pr('resigning to bank\n');
      for(op=cur_p.own_list;op;op=op.next){
        sqp=op.sqr;
        sqp.owner=-1;
        sqp.desc.morg=FALSE;
        if(op.next===null&&sqp.type===PRPTY){
          isnot_monop(sqp.desc.mon_desc);
          sqp.desc.houses=0;
        }
      }
      if(cur_p.num_gojf)ret_card(cur_p);
    }
    for(i=player;i<num_play;i++){
      name_list[i]=name_list[i+1];
      if(i+1<num_play)play[i]=play[i+1];
    }
    if(player!==num_play-1)play[num_play-1]=blank(); /* the C copies what lies beyond the array there; left alone if the last resigned */
    name_list[num_play--]=null;
    for(i=0;i<N_SQRS;i++)if(board[i].owner>player)--board[i].owner;
    player=--player<0?num_play-1:player;
    next_play();
    if(num_play<2){
      pr('\nThen '+play[0].name+' WINS!!!!!\n');
      printhold(0);
      pr("That's a grand worth of $"+(play[0].money+prop_worth(play[0]))+'.\n');
      throw EXIT;
    }
  }
  var FUNC=[quit,printboard,where,list,list_all,shell_out,mortgage,unmortgage,buy_houses,sell_houses,card,pay,trade,resign,save,restore,do_move,do_move];
  /* ---------- monop.c ---------- */
  function blank(){return {name:'(null)',num_gojf:0,num_rr:0,num_util:0,loc:0,in_jail:0,money:0,own_list:null}}
  function* getplayers(){
    var i,j,buf,same;
    for(;;){
      for(;;){
        num_play=yield* get_int('How many players? ');
        if(num_play<=0||num_play>MAX_PL)pr('Sorry. Number must range from 1 to 9\n');
        else break;
      }
      play=[];
      for(i=0;i<MAX_PL+2;i++)play.push(blank());
      cur_p=play[0];
      name_list=[];
      for(i=0;i<num_play;i++){
        do{
          pr('Player '+(i+1)+"'s name: ");
          buf=yield* readname();
        }while(buf==='');
        name_list[i]=play[i].name=buf;
        play[i].money=1500;
      }
      name_list[i++]='done';
      name_list[i]=null;
      same=false;
      for(i=0;i<num_play&&!same;i++)
        for(j=i+1;j<num_play&&!same;j++)
          if(strlow(name_list[i])===strlow(name_list[j])){
            pr("Hey!!! Some of those are IDENTICAL!!  Let's try that again....\n");
            same=true;
          }
      if(!same)return;
    }
  }
  function init_players(){
    var i,rl,cur_max,over,max_pl;
    do{
      pr('\n');
      for(cur_max=i=0;i<num_play;i++){
        rl=roll(2,6);
        pr(play[i].name+' ('+(i+1)+') rolls '+rl+'\n');
        if(rl>cur_max){
          over=FALSE;
          cur_max=rl;
          max_pl=i;
        }
        else if(rl===cur_max)over++;
      }
      if(over)pr((over+1)+" people rolled the same thing, so we'll try again\n");
    }while(over);
    player=max_pl;
    cur_p=play[max_pl];
    pr(cur_p.name+' ('+(max_pl+1)+') goes first\n');
  }
  function* main(av){
    if(av.length>0){
      if(!rest_f(av[0]))yield* restore();
    }
    else{
      yield* getplayers();
      init_players();
    }
    init_decks();
    for(;;){
      pr('\n'+cur_p.name+' ('+(player+1)+') (cash $'+cur_p.money+') on '+board[cur_p.loc].name+'\n');
      printturn();
      yield* force_morg();
      yield* execute(yield* getinp('-- Command: ',COMLIST));
    }
  }
  /* the driver: whatever waits on a line ends up here, with what it has written so far */
  var gen=main(words.slice(1));
  function flush(){
    var L=o.split('\n'),tail=L.pop();
    o='';
    if(L.length)P.say(L.map(untab));
    return untab(tail);
  }
  function fin(){
    var t=flush();
    if(t)P.say([t]);
  }
  function step(v){
    var r;
    try{r=gen.next(v)}
    catch(e){
      fin();
      if(e===EXIT){P.status(0);return}
      if(typeof console!=='undefined')console.error(e);
      P.say(['Segmentation fault (core dumped)']);
      P.status(139);
      return;
    }
    if(r.done){fin();return}
    P.ask(flush(),step,true);
  }
  P.queue(function(){step()});
}
P.command({names:['monop'],run:function(a,raw,words){run(words||['monop'].concat(a))}});
})(window.Phosphor);
