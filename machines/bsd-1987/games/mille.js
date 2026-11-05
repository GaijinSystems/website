/* PHOSPHOR-9 terminal: machine "bsd-1987", mille. Ported to JavaScript for this terminal from 4.3BSD's games/mille:
   comp.c, end.c, extern.c, init.c, mille.c, mille.h, misc.c, move.c, print.c, roll.c, save.c, types.c, varpush.c
   (SCCS ids 1.1 to 1.3, Berkeley, 4/1/82 to 5/10/83, by Ken Arnold). The source files carry no copyright notice,
   only those ids; they came under the Berkeley software License Agreement. "Mille Bornes" is a trademark.

   Differences from the C:
   - The C seeds random() with getpid(); there are no process ids here, so a random number stands in for one.
   - Saved games are kept with P.save under the name typed, not in a file, and are checked when read: a bad one is refused.
   - The debugging code is gone: it needed uid 214, and to anyone else Z is "unknown command", as it is here.
   - The bell is silent. ^Z, ^S and ^Q do nothing.
   - Four places where the C read what it had not set are pinned to what the VAX did:
     newscore()'s pp->was_finished, through an unset register, reads program text, so that test is always true;
     Value[C_INIT] in check_ext() is the variable before it, Window;
     Numseen[safety(C_INIT)] counts as zero, and ++count[C_INIT] is dropped;
     a hand's slot -1 is sh_nummiles[4] and its slot 7 is sh_hand[0], the neighbours in the struct.
   - Where the computer has no cards and the C loops for ever on its turn, this waits for a key each time round, so ^C can get out.
   - Where the C divides by zero it dumps core; so does this, with the same words after the screen closes.
   - Narrower than 80 columns, the board, the score and the mileage stack up, and follow the cursor; the arrows look around.
 */
(function(P){
'use strict';
var TRUE=1,FALSE=0,ERR=0,OK=1,
  HAND_SZ=7,DECK_SZ=101,NUM_SAFE=4,NUM_MILES=5,NUM_CARDS=20,BOARD_Y=17,BOARD_X=40,MILES_Y=7,MILES_X=80,SCORE_Y=17,SCORE_X=40,
  MOVE_Y=10,MOVE_X=20,ERR_Y=15,ERR_X=5,EXT_Y=4,EXT_X=9,PLAYER=0,COMP=1,W_SMALL=0,W_FULL=1,
  M_DISCARD=0,M_DRAW=1,M_PLAY=2,M_ORDER=3,
  SC_SAFETY=100,SC_ALL_SAFE=300,SC_COUP=300,SC_TRIP=400,SC_SAFE=300,SC_DELAY=300,SC_EXTENSION=200,SC_SHUT_OUT=500,
  S_UNKNOWN=0,S_IN_HAND=1,S_PLAYED=2,S_RIGHT_WAY=3,S_CONV=15,
  C_INIT=-1,C_25=0,C_50=1,C_75=2,C_100=3,C_200=4,C_EMPTY=5,C_FLAT=6,C_CRASH=7,C_STOP=8,C_LIMIT=9,C_GAS=10,C_SPARE=11,C_REPAIRS=12,
  C_GO=13,C_END_LIMIT=14,C_GAS_SAFE=15,C_SPARE_SAFE=16,C_DRIVE_SAFE=17,C_RIGHT_WAY=18,
  MOVEPROMPT=0,REALLYPROMPT=1,ANOTHERHANDPROMPT=2,ANOTHERGAMEPROMPT=3,SAVEGAMEPROMPT=4,SAMEFILEPROMPT=5,FILEPROMPT=6,EXTENSIONPROMPT=7,OVERWRITEFILEPROMPT=8,
  ERASE=8,KILL=21,COMP_STRT=20,CARD_STRT=2,V_VALUABLE=40,COLS=80,LINES=24,EXIT={},FPE={};
var NAMES=['25','50','75','100','200','Out of Gas','Flat Tire','Accident','Stop','Speed Limit','Gasoline','Spare Tire','Repairs','Go','End of Limit','Extra Tank','Puncture Proof','Driving Ace','Right of Way'];
NAMES[-1]='';
var NUMCARDS=[10,10,10,12,4,2,2,2,4,3,6,6,6,14,6,1,1,1,1,0];
var OPPOSITE=[C_25,C_50,C_75,C_100,C_200,C_GAS,C_SPARE,C_REPAIRS,C_GO,C_END_LIMIT,C_EMPTY,C_FLAT,C_CRASH,C_STOP,C_LIMIT,C_EMPTY,C_FLAT,C_CRASH,C_STOP,C_INIT];
var VALUE=[25,50,75,100,200];
var PROMPTS=['>>:Move:','Really?','Another hand?','Another game?','Save game?','Same file?','file:','Extension?','Overwrite file?'];
function deck0(){
  var D=[],i,c;
  function n(card,k){for(i=0;i<k;i++)D.push(card)}
  n(C_25,10);n(C_50,10);n(C_75,10);n(C_100,12);n(C_200,4);n(C_EMPTY,2);n(C_FLAT,2);n(C_CRASH,2);n(C_STOP,4);n(C_LIMIT,3);
  n(C_GAS,6);n(C_SPARE,6);n(C_REPAIRS,6);n(C_END_LIMIT,6);n(C_GO,14);
  for(c=C_GAS_SAFE;c<=C_RIGHT_WAY;c++)D.push(c);
  return D;
}
function zero(n,v){var a=[];while(n--)a.push(v||0);return a}
function newPlay(){
  var p={coups:zero(NUM_SAFE),can_go:0,new_battle:0,new_speed:0,safety:zero(NUM_SAFE),sh_safety:zero(NUM_SAFE),nummiles:zero(NUM_MILES),sh_nummiles:zero(NUM_MILES),
    hand:zero(HAND_SZ),sh_hand:zero(HAND_SZ),battle:0,sh_battle:0,speed:0,sh_speed:0,mileage:0,sh_mileage:0,hand_tot:0,sh_hand_tot:0,safescore:0,sh_safescore:0,coupscore:0,
    total:0,sh_total:0,games:0,sh_games:0,was_finished:0};
  neighbours(p);
  return p;
}
function neighbours(p){ /* what the C reaches when it runs off the end of a hand */
  Object.defineProperty(p.hand,'-1',{get:function(){return p.sh_nummiles[4]},set:function(v){p.sh_nummiles[4]=v},enumerable:false});
  Object.defineProperty(p.hand,'7',{get:function(){return p.sh_hand[0]},set:function(v){p.sh_hand[0]=v},enumerable:false});
}
function pad(s,n){s=String(s);while(s.length<n)s=' '+s;return s}
function ctime(d){
  return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()]+' '+['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]+' '+pad(d.getDate(),2)+' '
    +('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2)+':'+('0'+d.getSeconds()).slice(-2)+' '+d.getFullYear();
}
function clock(){return P.now?P.now():new Date(Date.now())}
function isInt(x,lo,hi){return typeof x==='number'&&Math.floor(x)===x&&x>=lo&&x<=hi}
function isArr(a,n,lo,hi){
  if(!Array.isArray(a)||a.length!==n)return false;
  for(var i=0;i<n;i++)if(!isInt(a[i],lo,hi))return false;
  return true;
}
var INTS=['mileage','sh_mileage','hand_tot','sh_hand_tot','safescore','sh_safescore','coupscore','total','sh_total','games','sh_games','was_finished'];
function goodPlayer(p){
  if(!p||typeof p!=='object')return false;
  if(!isArr(p.coups,NUM_SAFE,0,1)||!isArr(p.safety,NUM_SAFE,0,2)||!isArr(p.sh_safety,NUM_SAFE,0,1)||!isArr(p.nummiles,NUM_MILES,0,99)||!isArr(p.sh_nummiles,NUM_MILES,-1,99))return false;
  if(!isArr(p.hand,HAND_SZ,-1,18)||!isArr(p.sh_hand,HAND_SZ,-1,18))return false;
  if(!isInt(p.can_go,0,1)||!isInt(p.new_battle,0,1)||!isInt(p.new_speed,0,1))return false;
  if(!isInt(p.battle,-1,18)||!isInt(p.sh_battle,-1,18)||!isInt(p.speed,-1,18)||!isInt(p.sh_speed,-1,18))return false;
  for(var i=0;i<INTS.length;i++)if(!isInt(p[INTS[i]],-1000000,100000000))return false;
  return true;
}
function goodSave(s){
  return !!s&&typeof s==='object'&&isInt(s.Finished,0,1)&&isInt(s.Order,0,1)&&(s.End===700||s.End===1000)&&isInt(s.On_exit,0,1)&&isInt(s.Handstart,0,1)
    &&isInt(s.Numgos,-100000,100000)&&isArr(s.Numseen,NUM_CARDS,0,1000)&&isInt(s.Play,0,1)&&isInt(s.Window,0,1)&&isArr(s.Deck,DECK_SZ,0,18)&&isInt(s.Discard,-1,18)
    &&Array.isArray(s.Player)&&s.Player.length===2&&goodPlayer(s.Player[0])&&goodPlayer(s.Player[1])&&isInt(s.Topcard,0,DECK_SZ)&&isInt(s.mtime,0,9e15);
}
function run(words){
  var av=words.slice(1),rest=null,Initstr='',Fromfile=null;
  if(av.length>1){P.say(['usage: milles [ restore_file ]']);P.status(255);return}
  if(av.length===1){
    rest=P.saved('mille/'+av[0]);
    if(rest===null){P.say([av[0]+': No such file or directory']);P.status(1);return}
    if(!goodSave(rest)){P.say([av[0]+': not a saved game']);P.status(1);return}
    Fromfile=av[0];
  }
  P.program(function(S,done){
    /* ---------- curses, as 4.3BSD's ---------- */
    var phys=[],pcy=0,pcx=0,y,x,row;
    for(y=0;y<LINES;y++){row=[];for(x=0;x<COLS;x++)row.push(32);phys.push(row)}
    function newwin(l,c,by,bx){
      var w={maxy:l,maxx:c,begy:by,begx:bx,cury:0,curx:0,leave:false,so:0,y:[]},i,j,r;
      for(i=0;i<l;i++){r=[];for(j=0;j<c;j++)r.push(32);w.y.push(r)}
      return w;
    }
    function wclrtoeol(w){if(w.cury<w.maxy)for(var i=w.curx;i<w.maxx;i++)w.y[w.cury][i]=32}
    function wclrtobot(w){
      for(var j=w.cury;j<w.maxy;j++)for(var i=j===w.cury?w.curx:0;i<w.maxx;i++)w.y[j][i]=32;
    }
    function werase(w){
      for(var j=0;j<w.maxy;j++)for(var i=0;i<w.maxx;i++)w.y[j][i]=32;
      w.cury=w.curx=0;
    }
    function wmove(w,yy,xx){if(xx>=w.maxx||yy>=w.maxy)return ERR;w.cury=yy;w.curx=xx;return OK}
    function waddch(w,c){
      var xx=w.curx,yy=w.cury;
      if(typeof c==='string')c=c.charCodeAt(0);
      c&=127;
      switch(c){
        case 10:
          wclrtoeol(w);xx=0;
          if(++yy>=w.maxy)return ERR;
          break;
        case 13:xx=0;break;
        case 8:if(--xx<0)xx=0;break;
        default:
          w.y[yy][xx]=c|(w.so?256:0);
          if(++xx>=w.maxx){
            xx=0;
            if(++yy>=w.maxy)return ERR;
          }
      }
      w.curx=xx;w.cury=yy;
      return OK;
    }
    function waddstr(w,s){for(var i=0;i<s.length;i++)if(waddch(w,s.charAt(i))===ERR)return ERR;return OK}
    function wrefresh(w){
      for(var j=0;j<w.maxy;j++)for(var i=0;i<w.maxx;i++)phys[j+w.begy][i+w.begx]=w.y[j][i];
      if(!w.leave){pcy=w.cury+w.begy;pcx=w.curx+w.begx}
    }
    function unctrl(c){c&=127;return c===127?'^?':c===30?'^~':c<32?'^'+String.fromCharCode(c+64):String.fromCharCode(c)}
    function isprint(c){return c>=32&&c<127}
    function isspace(c){return c===32||(c>=9&&c<=13)}
    function islower(c){return c>=97&&c<=122}
    function Mvwaddstr(w,yy,xx,s){return wmove(w,yy,xx)===ERR?ERR:waddstr(w,s)}
    function mvaddstr(yy,xx,s){return Mvwaddstr(stdscr,yy,xx,s)}
    function mvaddch(yy,xx,c){return wmove(stdscr,yy,xx)===ERR?ERR:waddch(stdscr,c)}
    function addch(c){return waddch(stdscr,c)}
    function addstr(s){return waddstr(stdscr,s)}
    function move(yy,xx){return wmove(stdscr,yy,xx)}
    function clrtoeol(){wclrtoeol(stdscr)}
    function refresh(){wrefresh(stdscr)}
    /* ---------- the glass ---------- */
    var pan_y=0,pan_x=0;
    function layout(){ /* which piece of the screen each row of the glass shows */
      var m=[],j;
      if(S.cols>=COLS){for(j=0;j<LINES;j++)m.push({y:j,x:0,n:COLS});return m}
      for(j=0;j<BOARD_Y;j++)m.push({y:j,x:0,n:BOARD_X});
      for(j=0;j<SCORE_Y;j++)m.push({y:j,x:40,n:SCORE_X});
      for(j=0;j<MILES_Y;j++)m.push({y:17+j,x:0,n:40});
      for(j=1;j<MILES_Y;j++)m.push({y:17+j,x:40,n:40});
      return m;
    }
    function text(m,cw,px){
      var s='',i,e=Math.min(m.x+m.n,m.x+px+cw);
      for(i=m.x+px;i<e;i++)s+=String.fromCharCode(phys[m.y][i]&127);
      return s;
    }
    function render(){
      var m=layout(),cw=Math.min(S.cols,COLS),vis=Math.min(S.rows,m.length),lines=[],shown=[],r=-1,c=0,i,cur=-1,pinned=vis<m.length&&vis>=6&&S.cols<COLS;
      for(i=0;i<m.length;i++)if(m[i].y===pcy&&pcx>=m[i].x&&pcx<m[i].x+m[i].n)cur=i;
      var body=pinned?vis-1:vis;
      if(cur>=0&&(cur<pan_y||cur>=pan_y+body))pan_y=cur-(body>>1);
      pan_y=Math.max(0,Math.min(m.length-body,pan_y));
      var n=m[0].n;
      pan_x=cw>=n?0:Math.max(0,Math.min(n-cw,(cur>=0?pcx-m[cur].x:0)-(cw>>1)));
      for(i=pan_y;i<pan_y+body;i++){
        lines.push(text(m[i],cw,pan_x));shown.push(m[i]);
        if(i===cur){r=lines.length-1;c=pcx-m[i].x-pan_x}
      }
      if(pinned){ /* the score's error line, if it is out of sight */
        var e={y:ERR_Y,x:40,n:SCORE_X};
        lines.push(text(e,cw,0));shown.push(e);
      }
      S.draw(lines,r,c);
      S.say(text({y:MOVE_Y,x:MOVE_X,n:20},cw,0).trim()+' '+text({y:ERR_Y,x:40,n:40},cw,0).trim());
      if(typeof document==='undefined')return;
      var el=null;
      for(i=0;i<shown.length;i++){ /* the screen's own draw has no standout: reverse those cells, as it draws the cursor */
        var o=shown[i],any=false,j;
        for(j=o.x;j<o.x+o.n;j++)if(phys[o.y][j]&256)any=true;
        if(!any)continue;
        el=el||document.getElementById('full');
        var d=el&&el.children[i];
        if(!d)continue;
        d.textContent='';
        var t=lines[i],run_='';
        for(j=0;j<t.length;j++){
          if(phys[o.y][o.x+pan_x+j]&256||(i===r&&j===c)){
            if(run_){d.appendChild(document.createTextNode(run_));run_=''}
            var sp=document.createElement('span');
            sp.className='fcur';
            sp.textContent=t.charAt(j);
            d.appendChild(sp);
          }
          else run_+=t.charAt(j);
        }
        if(run_)d.appendChild(document.createTextNode(run_));
      }
    }
    /* ---------- the game's variables ---------- */
    var Finished=FALSE,Next=FALSE,On_exit=FALSE,Order=FALSE,Saved=FALSE,Card_no=0,End=0,Handstart=COMP,Movetype=0,Play=0,Numgos=0,Window=W_SMALL,
      Numseen=zero(NUM_CARDS),Numneed=[0,0,0,0,0,2,2,2,4,3,2,2,2,10,3,1,1,1,1,0],Discard=0,Sh_discard=0,Topcard=0,Deck=deck0(),Player=[newPlay(),newPlay()],
      Board,Score,Miles,stdscr,sigint=true,last_prompt=-1,firstboard=true,was_full=-1,last_win=-1;
    /* random(3), as 4.3BSD's: type 3, degree 31, separation 3 */
    var rs=zero(31),rf=3,rr=0;
    function random(){
      var v=(rs[rf]+rs[rr])|0;
      rs[rf]=v;
      if(++rf>=31){rf=0;++rr}
      else if(++rr>=31)rr=0;
      return (v>>>1)&0x7fffffff;
    }
    function srandom(s){
      var i;
      rs[0]=s|0;
      for(i=1;i<31;i++)rs[i]=(Math.imul(rs[i-1],1103515245)+12345)|0;
      rf=3;rr=0;
      for(i=0;i<310;i++)random();
    }
    function roll(ndie,nsides){var tot=0;while(ndie--)tot+=random()%nsides+1;return tot}
    function other(x){return 1-x}
    function issafety(c){return c>=C_GAS_SAFE}
    function idiv(a,b){if(b===0)throw FPE;return Math.trunc(a/b)}
    function isrepair(c){return c===C_GAS||c===C_SPARE||c===C_REPAIRS||c===C_INIT}
    function safety(c){
      switch(c){
        case C_EMPTY:case C_GAS:case C_GAS_SAFE:return C_GAS_SAFE;
        case C_FLAT:case C_SPARE:case C_SPARE_SAFE:return C_SPARE_SAFE;
        case C_CRASH:case C_REPAIRS:case C_DRIVE_SAFE:return C_DRIVE_SAFE;
        case C_GO:case C_STOP:case C_RIGHT_WAY:case C_LIMIT:case C_END_LIMIT:return C_RIGHT_WAY;
      }
      return -1;
    }
    /* ---------- misc.c ---------- */
    function* readch(){
      for(;;){
        var c=yield;
        if(c===3){
          if(sigint)yield* rub();
          continue;
        }
        return c;
      }
    }
    function* rub(){
      sigint=false;
      if(yield* getyn(REALLYPROMPT))die();
      sigint=true;
    }
    function die(){throw EXIT}
    function error(str){
      stdscr=Score;
      if(wmove(stdscr,ERR_Y,ERR_X)!==ERR)addstr(str);
      clrtoeol();
      refresh();
      stdscr=Board;
      return FALSE;
    }
    function* getcard(){
      var c,c1;
      cont:for(;;){
        while((c=yield* readch())===10||c===13||c===32)continue;
        if(islower(c))c-=32;
        if(c===KILL||c===ERASE)return -1;
        addstr(unctrl(c));
        clrtoeol();
        switch(c){
          case 49:case 50:case 51:case 52:case 53:case 54:c-=48;break;
          case 48:case 80:case 112:c=0;break;
          default:
            addch(8);
            if(!isprint(c))addch(8);
            c=-1;
        }
        refresh();
        if(c>=0){
          while((c1=yield* readch())!==13&&c1!==10&&c1!==32){
            if(c1===KILL)return -1;
            else if(c1===ERASE){
              addch(8);
              clrtoeol();
              refresh();
              continue cont;
            }
          }
          return c;
        }
      }
    }
    function* check_ext(forcomp){
      if(End===700){
        if(Play===PLAYER){
          if(yield* getyn(EXTENSIONPROMPT)){
            if(!forcomp)End=1000;
            return TRUE;
          }
          if(!forcomp)Finished=TRUE;
          return FALSE;
        }
        var pp=Player[COMP],op=Player[PLAYER],i,safe,miles;
        for(safe=0,i=0;i<NUM_SAFE;i++)if(pp.safety[i]!==S_UNKNOWN)safe++;
        var ext=null;
        if(safe<2)ext=false;
        else if(op.mileage===0||onecard(op)||(op.can_go&&op.mileage>=500))ext=false;
        else{
          for(miles=0,i=0;i<NUM_SAFE;i++)if(op.safety[i]!==S_PLAYED&&pp.safety[i]===S_UNKNOWN)miles++;
          if(miles+safe===NUM_SAFE)ext=true;
          else{
            for(miles=0,i=0;i<HAND_SZ;i++)if((safe=pp.hand[i])<=C_200)miles+=safe<0?Window:VALUE[safe];
            ext=miles+Topcard*3>1000;
          }
        }
        if(ext){
          if(!forcomp)End=1000;
          return TRUE;
        }
      }
      if(!forcomp)Finished=TRUE;
      return FALSE;
    }
    function* getyn(promptno){
      var c;
      Saved=FALSE;
      for(;;){
        Board.leave=false;
        prompt(promptno);
        clrtoeol();
        refresh();
        switch(c=yield* readch()){
          case 110:case 78:
            addch('N');refresh();Board.leave=true;
            return FALSE;
          case 121:case 89:
            addch('Y');refresh();Board.leave=true;
            return TRUE;
          case 115:case 83:
            addch('S');refresh();
            Saved=yield* save();
            continue;
          default:
            addstr(unctrl(c));refresh();
        }
      }
    }
    function* check_more(){
      On_exit=TRUE;
      if(Player[PLAYER].total>=5000||Player[COMP].total>=5000){
        if(yield* getyn(ANOTHERGAMEPROMPT))return;
        if(Player[PLAYER].total>Player[COMP].total)Player[PLAYER].games++;
        else if(Player[PLAYER].total<Player[COMP].total)Player[COMP].games++;
        Player[COMP].total=0;
        Player[PLAYER].total=0;
      }
      else if(yield* getyn(ANOTHERHANDPROMPT))return;
      if(!Saved&&(yield* getyn(SAVEGAMEPROMPT)))if(!(yield* save()))return;
      die();
    }
    /* ---------- init.c ---------- */
    function init(){
      var pp,i,j,card;
      Numseen=zero(NUM_CARDS);
      Numgos=0;
      for(i=0;i<2;i++){
        pp=Player[i];
        pp.hand[0]=C_INIT;
        for(j=0;j<NUM_SAFE;j++){pp.safety[j]=S_UNKNOWN;pp.coups[j]=FALSE}
        for(j=1;j<HAND_SZ;j++){
          pp.hand[j]=Deck[--Topcard];
          if(i===COMP){
            account(card=Deck[Topcard]);
            if(issafety(card))pp.safety[card-S_CONV]=S_IN_HAND;
          }
        }
        pp.mileage=0;pp.hand_tot=0;pp.safescore=0;pp.coupscore=0;pp.can_go=FALSE;pp.speed=C_INIT;pp.battle=C_INIT;pp.new_speed=FALSE;pp.new_battle=FALSE;
        for(j=0;j<NUM_MILES;j++)pp.nummiles[j]=0;
      }
      if(Order)sort(Player[PLAYER].hand);
      Discard=C_INIT;
      Finished=FALSE;
      End=700;
    }
    function shuffle(){
      var i,r,temp;
      for(i=0;i<DECK_SZ;i++){
        r=roll(1,DECK_SZ)-1;
        temp=Deck[r];Deck[r]=Deck[i];Deck[i]=temp;
      }
      Topcard=DECK_SZ;
    }
    function newboard(){
      var i,k,pp;
      if(firstboard){
        werase(Board);
        werase(Score);
        mvaddstr(5,0,'--HAND--');
        mvaddch(6,0,'P');mvaddch(7,0,'1');mvaddch(8,0,'2');mvaddch(9,0,'3');mvaddch(10,0,'4');mvaddch(11,0,'5');mvaddch(12,0,'6');
        mvaddstr(13,0,'--BATTLE--');
        mvaddstr(15,0,'--SPEED--');
        mvaddstr(5,20,'--DECK--');
        mvaddstr(7,20,'--DISCARD--');
        mvaddstr(13,20,'--BATTLE--');
        mvaddstr(15,20,'--SPEED--');
        Mvwaddstr(Miles,0,0,'--MILEAGE--');
        Mvwaddstr(Miles,0,41,'--MILEAGE--');
        Sh_discard=-1;
        for(k=0;k<2;k++){
          pp=Player[k];
          for(i=0;i<HAND_SZ;i++)pp.sh_hand[i]=-1;
          pp.sh_battle=-1;pp.sh_speed=-1;pp.sh_mileage=-1;
        }
        firstboard=false;
      }
      else{
        for(i=0;i<5;i++){move(i,0);clrtoeol()}
        wmove(Miles,1,0);
        wclrtobot(Miles);
        wmove(Board,MOVE_Y+1,MOVE_X);
        wclrtoeol(Board);
        wmove(Board,MOVE_Y+2,MOVE_X);
        wclrtoeol(Board);
      }
      Sh_discard=-1;
      for(k=0;k<2;k++){
        pp=Player[k];
        for(i=0;i<NUM_SAFE;i++)pp.sh_safety[i]=FALSE;
        for(i=0;i<NUM_MILES;i++)pp.sh_nummiles[i]=0;
        pp.sh_safescore=-1;
      }
      newscore();
    }
    function newscore(){
      var i,k,neu,pp;
      if(was_full<0)was_full=Window!==W_FULL?1:0;
      stdscr=Score;
      move(0,22);
      neu=FALSE;
      if((stdscr.y[stdscr.cury][stdscr.curx]&127)!==89){
        stdscr.cury=stdscr.curx=0;werase(stdscr);
        mvaddstr(0,22,'You   Comp   Value');
        mvaddstr(1,2,'Milestones Played');
        mvaddstr(2,8,'Each Safety');
        mvaddstr(3,5,'All 4 Safeties');
        mvaddstr(4,3,'Each Coup Fourre');
        mvaddstr(2,37,'100');
        mvaddstr(3,37,'300');
        mvaddstr(4,37,'300');
        neu=TRUE;
      }
      else{ /* the C's other tests come out true or never matter: see the head of this file */
        move(5,1);
        wclrtobot(stdscr);
        neu=TRUE;
      }
      if(neu){
        for(i=0;i<SCORE_Y;i++)mvaddch(i,0,'|');
        move(SCORE_Y-1,1);
        while(addch('_')!==ERR)continue;
        for(k=0;k<2;k++){
          pp=Player[k];
          pp.sh_hand_tot=-1;pp.sh_total=-1;pp.sh_games=-1;pp.sh_safescore=-1;
        }
      }
      Player[PLAYER].was_finished=Finished?0:1;
      Player[COMP].was_finished=Finished?0:1;
      if(Window===W_FULL||Finished){
        if(!was_full||neu){
          mvaddstr(5,5,'Trip Completed');
          mvaddstr(6,10,'Safe Trip');
          mvaddstr(7,5,'Delayed Action');
          mvaddstr(8,10,'Extension');
          mvaddstr(9,11,'Shut-Out');
          mvaddstr(10,21,'----   ----   -----');
          mvaddstr(11,9,'Hand Total');
          mvaddstr(12,20,'-----  -----');
          mvaddstr(13,6,'Overall Total');
          mvaddstr(14,15,'Games');
          mvaddstr(5,37,'400');
          mvaddstr(6,37,'300');
          mvaddstr(7,37,'300');
          mvaddstr(8,37,'200');
          mvaddstr(9,37,'500');
        }
      }
      else if(was_full||neu){
        mvaddstr(5,21,'----   ----   -----');
        mvaddstr(6,9,'Hand Total');
        mvaddstr(7,20,'-----  -----');
        mvaddstr(8,6,'Overall Total');
        mvaddstr(9,15,'Games');
        mvaddstr(11,2,'p: pick');
        mvaddstr(12,2,'u: use #');
        mvaddstr(13,2,'d: discard #');
        mvaddstr(14,2,'w: toggle window');
        mvaddstr(11,21,'q: quit');
        if(!Order)mvaddstr(12,21,'o: order hand');
        else mvaddstr(12,21,'o: stop ordering');
        mvaddstr(13,21,'s: save');
        mvaddstr(14,21,'r: reprint');
      }
      stdscr=Board;
      was_full=Window===W_FULL||Finished?1:0;
      last_win=Window;
    }
    /* ---------- comp.c ---------- */
    function* calcmove(){
      var card,pp,op,foundend,cango,canstop,foundlow,i,count200,badcount,nummin,nummax,diff,curmin,curmax,safe,oppos,v,valbuf=zero(HAND_SZ),count=zero(NUM_CARDS),playit=zero(HAND_SZ);
      wmove(Score,ERR_Y,ERR_X);
      wclrtoeol(Score);
      pp=Player[COMP];
      op=Player[PLAYER];
      safe=0;cango=0;canstop=FALSE;foundend=FALSE;
      for(i=0;i<HAND_SZ;i++){
        card=pp.hand[i];
        switch(card){
          case C_STOP:case C_CRASH:case C_FLAT:case C_EMPTY:
            if(playit[i]=canplay(pp,op,card))canstop=TRUE;
            if(playit[i])++cango;
            break;
          case C_LIMIT:
            if((playit[i]=canplay(pp,op,card))&&Numseen[C_25]===NUMCARDS[C_25]&&Numseen[C_50]===NUMCARDS[C_50])canstop=TRUE;
            if(playit[i])++cango;
            break;
          case C_25:case C_50:case C_75:case C_100:case C_200:
            if((playit[i]=canplay(pp,op,card))&&pp.mileage+VALUE[card]===End)foundend=TRUE;
            if(playit[i])++cango;
            break;
          case C_GAS_SAFE:case C_DRIVE_SAFE:case C_SPARE_SAFE:case C_RIGHT_WAY:
            if(pp.battle===OPPOSITE[card]||(pp.speed===C_LIMIT&&card===C_RIGHT_WAY)){
              Movetype=M_PLAY;
              Card_no=i;
              return;
            }
            ++safe;
            playit[i]=TRUE;
            break;
          default:
            playit[i]=canplay(pp,op,card);
            if(playit[i])++cango;
        }
        if(card>=0)++count[card];
      }
      if(pp.hand[0]===C_INIT&&Topcard>0){
        Movetype=M_DRAW;
        return;
      }
      if(foundend)foundend=(yield* check_ext(TRUE))?FALSE:TRUE;
      for(i=0;safe&&i<HAND_SZ;i++){
        if(issafety(pp.hand[i])){
          if(onecard(op)||(foundend&&cango&&!canstop)){
            Movetype=M_PLAY;Card_no=i;
            return;
          }
          oppos=OPPOSITE[pp.hand[i]];
          if(Numseen[oppos]===NUMCARDS[oppos]&&!(pp.hand[i]===C_RIGHT_WAY&&Numseen[C_LIMIT]!==NUMCARDS[C_LIMIT])){
            Movetype=M_PLAY;Card_no=i;
            return;
          }
          else if(!cango&&(op.can_go||!pp.can_go||Topcard<0)){
            card=Topcard-roll(1,10);
            if((!pp.mileage)!==(!op.mileage))card-=7;
            if(card<(DECK_SZ>>2)){
              Movetype=M_PLAY;Card_no=i;
              return;
            }
          }
          safe--;
          playit[i]=cango;
        }
      }
      if(!pp.can_go&&!isrepair(pp.battle))Numneed[OPPOSITE[pp.battle]]++;
      redoit:for(;;){
        foundlow=cango||count[C_END_LIMIT]!==0||Numseen[C_LIMIT]===NUMCARDS[C_LIMIT]||pp.safety[S_RIGHT_WAY]!==S_UNKNOWN;
        foundend=FALSE;
        count200=pp.nummiles[C_200];
        badcount=0;
        curmax=-1;
        curmin=101;
        nummin=-1;
        nummax=-1;
        for(i=0;i<HAND_SZ;i++){
          card=pp.hand[i];
          if(issafety(card)||playit[i]===(cango!==0?1:0)){
            v=valbuf[i];
            var go='';
            switch(card){
              case C_25:case C_50:
                diff=End-pp.mileage;
                if(Topcard>0&&cango&&diff<=100&&Math.floor(diff/VALUE[card])>count[card]&&(card===C_25||diff%50===0)){
                  if(!(card===C_50&&diff-50===25&&count[C_25]>0)){
                    v=0;
                    if(--cango<=0)continue redoit;
                    break;
                  }
                }
                v=VALUE[card]>>3;
                if(pp.speed===C_LIMIT)++v;
                else --v;
                if(!foundlow&&(card===C_50||count[C_50]===0)){
                  v=pp.mileage?10:20;
                  foundlow=TRUE;
                }
                go='miles';
                break;
              case C_200:
                if(++count200>2){
                  v=0;
                  break;
                }
              /* falls through */
              case C_75:case C_100:
                v=VALUE[card]>>3;
                if(pp.speed===C_LIMIT)--v;
                else ++v;
                go='miles';
                break;
              case C_END_LIMIT:
                if(pp.safety[S_RIGHT_WAY]!==S_UNKNOWN)v=pp.safety[S_RIGHT_WAY]===S_PLAYED?-1:1;
                else if(pp.speed===C_LIMIT&&End-pp.mileage<=50)v=1;
                else if(pp.speed===C_LIMIT||Numseen[C_LIMIT]!==NUMCARDS[C_LIMIT]){
                  safe=S_RIGHT_WAY;
                  oppos=C_LIMIT;
                  go='repair';
                }
                else{
                  v=0;
                  --count[C_END_LIMIT];
                }
                break;
              case C_REPAIRS:case C_SPARE:case C_GAS:
                safe=safety(card)-S_CONV;
                oppos=OPPOSITE[card];
                if(pp.safety[safe]!==S_UNKNOWN)v=pp.safety[safe]===S_PLAYED?-1:1;
                else if(pp.battle!==oppos&&(Numseen[oppos]===NUMCARDS[oppos]||Numseen[oppos]+count[card]>NUMCARDS[oppos])){
                  v=0;
                  --count[card];
                }
                else go='repair';
                break;
              case C_GO:
                if(pp.safety[S_RIGHT_WAY]!==S_UNKNOWN)v=pp.safety[S_RIGHT_WAY]===S_PLAYED?-1:2;
                else if(pp.can_go&&Numgos+count[C_GO]===Numneed[C_GO]){
                  v=0;
                  --count[C_GO];
                }
                else{
                  v=Numneed[C_GO]*3;
                  v+=Numseen[C_GO]-Numgos;
                  v=idiv(v,count[C_GO]*count[C_GO]);
                  count[C_GO]--;
                }
                break;
              case C_LIMIT:
                if(op.mileage+50>=End){
                  v=End===700&&!cango?1:0;
                  break;
                }
                if(canstop||(cango&&!op.can_go))v=1;
                else{
                  v=pp.safety[S_RIGHT_WAY]!==S_UNKNOWN?2:3;
                  safe=S_RIGHT_WAY;
                  oppos=C_END_LIMIT;
                  go='normbad';
                }
                break;
              case C_CRASH:case C_EMPTY:case C_FLAT:
                safe=safety(card)-S_CONV;
                oppos=OPPOSITE[card];
                v=pp.safety[safe]!==S_UNKNOWN?3:4;
                go='normbad';
                break;
              case C_STOP:
                if(op.safety[S_RIGHT_WAY]===S_PLAYED)v=-1;
                else{
                  v=pp.safety[S_RIGHT_WAY]!==S_UNKNOWN?3:4;
                  v*=NUMCARDS[C_STOP]+Numseen[C_GO];
                  if(!pp.mileage||foundend||onecard(op))v+=5;
                  if(!cango)v=idiv(v,++badcount);
                  if(op.mileage===0)v+=5;
                  if((card===C_LIMIT&&op.speed===C_LIMIT)||!op.can_go)v-=5;
                  if(cango&&pp.safety[S_RIGHT_WAY]!==S_UNKNOWN)v+=5;
                }
                break;
              case C_GAS_SAFE:case C_DRIVE_SAFE:case C_SPARE_SAFE:case C_RIGHT_WAY:
                v=cango?0:101;
                break;
              case C_INIT:
                v=0;
                break;
            }
            if(go==='miles'){
              if(pp.mileage+VALUE[card]>End)v=End===700?card:0;
              else if(pp.mileage+VALUE[card]===End){
                v=foundend?card:V_VALUABLE;
                foundend=TRUE;
              }
            }
            else if(go==='repair'){
              v=NUMCARDS[oppos]*6;
              v+=Numseen[card]-Numseen[oppos];
              if(!cango)v=idiv(v,count[card]*count[card]);
              count[card]--;
            }
            else if(go==='normbad'){
              if(op.safety[safe]===S_PLAYED)v=-1;
              else{
                v*=Numneed[oppos]+Numseen[oppos]+2;
                if(!pp.mileage||foundend||onecard(op))v+=5;
                if(op.mileage===0||onecard(op))v+=5;
                if(op.speed===C_LIMIT)v-=3;
                if(cango&&pp.safety[safe]!==S_UNKNOWN)v+=3;
                if(!cango)v=idiv(v,++badcount);
              }
            }
            valbuf[i]=v;
          }
          else valbuf[i]=cango?0:101;
          if(card!==C_INIT){
            if(valbuf[i]>=curmax){nummax=i;curmax=valbuf[i]}
            if(valbuf[i]<=curmin){nummin=i;curmin=valbuf[i]}
          }
        }
        break;
      }
      if(!pp.can_go&&!isrepair(pp.battle))Numneed[OPPOSITE[pp.battle]]++;
      if(!cango&&issafety(pp.hand[nummin]))nummax=nummin; /* NEVER discard a safety */
      if(cango||issafety(pp.hand[nummin])){
        mvaddstr(MOVE_Y+1,MOVE_X,'PLAY\n');
        Movetype=M_PLAY;
        Card_no=nummax;
      }
      else{
        mvaddstr(MOVE_Y+1,MOVE_X,'DISCARD\n');
        Movetype=M_DISCARD;
        Card_no=nummin;
      }
      if(wmove(stdscr,MOVE_Y+2,MOVE_X)!==ERR)addstr(pad(NAMES[pp.hand[Card_no]],16));
    }
    function onecard(pp){
      var bat=pp.battle,spd=pp.speed,card=-1;
      if(pp.can_go||((isrepair(bat)||bat===C_STOP||spd===C_LIMIT)&&Numseen[S_RIGHT_WAY]!==0)||(bat!==C_INIT&&Numseen[safety(bat)]!==0)){
        switch(End-pp.mileage){
          case 200:
            if(pp.nummiles[C_200]===2)return FALSE;
            card=C_200;
          /* falls through */
          case 100:case 75:
            if(card===-1)card=End-pp.mileage===75?C_75:C_100;
            if(spd===C_LIMIT)return Numseen[S_RIGHT_WAY]===0?TRUE:FALSE;
          /* falls through */
          case 50:case 25:
            if(card===-1)card=End-pp.mileage===25?C_25:C_50;
            return Numseen[card]!==NUMCARDS[card]?TRUE:FALSE;
        }
      }
      return FALSE;
    }
    function canplay(pp,op,card){
      switch(card){
        case C_200:
          if(pp.nummiles[C_200]===2)break;
        /* falls through */
        case C_75:case C_100:
          if(pp.speed===C_LIMIT)break;
        /* falls through */
        case C_50:
          if(pp.mileage+VALUE[card]>End)break;
        /* falls through */
        case C_25:
          if(pp.can_go)return TRUE;
          break;
        case C_EMPTY:case C_FLAT:case C_CRASH:case C_STOP:
          if(op.can_go&&op.safety[safety(card)-S_CONV]!==S_PLAYED)return TRUE;
          break;
        case C_LIMIT:
          if(op.speed!==C_LIMIT&&op.safety[S_RIGHT_WAY]!==S_PLAYED&&op.mileage+50<End)return TRUE;
          break;
        case C_GAS:case C_SPARE:case C_REPAIRS:
          if(pp.battle===OPPOSITE[card])return TRUE;
          break;
        case C_GO:
          if(!pp.can_go&&(isrepair(pp.battle)||pp.battle===C_STOP))return TRUE;
          break;
        case C_END_LIMIT:
          if(pp.speed===C_LIMIT)return TRUE;
      }
      return FALSE;
    }
    /* ---------- end.c ---------- */
    function finalscore(pp){
      var temp,tot,num;
      if(pp.was_finished===Finished)return;
      pp.was_finished=Finished;
      num=Player.indexOf(pp);
      temp=num*6+21+1;
      for(tot=5;tot<=9;tot++)mvaddstr(tot,temp,'  0');
      if(pp.mileage===End){
        mvaddstr(5,temp,'40');
        tot=SC_TRIP;
        if(pp.nummiles[C_200]===0){
          mvaddstr(6,temp,'30');
          tot=SC_TRIP+SC_SAFE;
        }
        if(Topcard<=0){
          mvaddstr(7,temp,'30');
          tot+=SC_DELAY;
        }
        if(End===1000){
          mvaddstr(8,temp,'20');
          tot+=SC_EXTENSION;
        }
        if(Player[other(num)].mileage===0){
          mvaddstr(9,temp,'50');
          tot+=SC_SHUT_OUT;
        }
        pp.total+=tot;
        pp.hand_tot+=tot;
      }
    }
    /* ---------- move.c ---------- */
    function* domove(){
      var pp=Player[Play],i,j,goodplay;
      if(Play===PLAYER)yield* getmove();
      else yield* calcmove();
      Next=FALSE;
      goodplay=TRUE;
      switch(Movetype){
        case M_DISCARD:
          if(haspicked(pp)){
            if(pp.hand[Card_no]===C_INIT){
              if(Card_no===6)Finished=TRUE;
              else error('no card there');
            }
            else{
              if(issafety(pp.hand[Card_no])){
                error('discard a safety?');
                goodplay=FALSE;
                break;
              }
              Discard=pp.hand[Card_no];
              pp.hand[Card_no]=C_INIT;
              Next=TRUE;
              if(Play===PLAYER)account(Discard);
            }
          }
          else error('must pick first');
          break;
        case M_PLAY:
          goodplay=yield* playcard(pp);
          break;
        case M_DRAW:
          Card_no=0;
          if(Topcard<=0)error('no more cards');
          else if(haspicked(pp))error('already picked');
          else{
            pp.hand[0]=Deck[--Topcard];
            for(;;){
              if(Play===COMP){
                account(Deck[Topcard]);
                if(issafety(Deck[Topcard]))pp.safety[Deck[Topcard]-S_CONV]=S_IN_HAND;
              }
              if(pp.hand[1]===C_INIT&&Topcard>0){
                Card_no=1;
                pp.hand[1]=Deck[--Topcard];
                continue;
              }
              break;
            }
            pp.new_battle=FALSE;
            pp.new_speed=FALSE;
          }
          break;
        case M_ORDER:
          break;
      }
      if(Order&&Movetype!==M_DRAW&&goodplay&&pp===Player[PLAYER])sort(pp.hand);
      else{
        for(i=1;i<HAND_SZ;i++){
          if(pp.hand[i]===C_INIT){
            for(j=0;pp.hand[j]===C_INIT;j++)
              if(j>=HAND_SZ){
                j=0;
                break;
              }
            pp.hand[i]=pp.hand[j];
            pp.hand[j]=C_INIT;
          }
        }
      }
      if(Topcard<=0)check_go();
      if(Next)Play=other(Play);
    }
    function check_go(){
      var card,pp,op,i,k;
      for(k=0;k<2;k++){
        pp=Player[k];
        op=k===COMP?Player[PLAYER]:Player[COMP];
        for(i=0;i<HAND_SZ;i++){
          card=pp.hand[i];
          if(issafety(card)||canplay(pp,op,card))return;
        }
      }
      Finished=TRUE;
    }
    function* playcard(pp){
      var v,card;
      switch(pp.hand[Card_no]){
        case C_GAS_SAFE:case C_SPARE_SAFE:case C_DRIVE_SAFE:case C_RIGHT_WAY:
          break;
        default:
          if(!haspicked(pp))return error('must pick first');
      }
      card=pp.hand[Card_no];
      Next=FALSE;
      switch(card){
        case C_200:
          if(pp.nummiles[C_200]===2)return error("only two 200's per hand");
        /* falls through */
        case C_100:case C_75:
          if(pp.speed===C_LIMIT)return error('limit of 50');
        /* falls through */
        case C_50:
          if(pp.mileage+VALUE[card]>End)return error('puts you over '+End);
        /* falls through */
        case C_25:
          if(!pp.can_go)return error('cannot move now');
          pp.nummiles[card]++;
          v=VALUE[card];
          pp.total+=v;
          pp.hand_tot+=v;
          if((pp.mileage+=v)===End)yield* check_ext(FALSE);
          break;
        case C_GAS:case C_SPARE:case C_REPAIRS:
          if(pp.battle!==OPPOSITE[card])return error('can\'t play "'+NAMES[card]+'"');
          pp.battle=card;
          if(pp.safety[S_RIGHT_WAY]===S_PLAYED)pp.can_go=TRUE;
          break;
        case C_GO:
          if(pp.battle!==C_INIT&&pp.battle!==C_STOP&&!isrepair(pp.battle))return error('cannot play "Go" on a "'+NAMES[pp.battle]+'"');
          pp.battle=C_GO;
          pp.can_go=TRUE;
          break;
        case C_END_LIMIT:
          if(pp.speed!==C_LIMIT)return error('not limited');
          pp.speed=C_END_LIMIT;
          break;
        case C_EMPTY:case C_FLAT:case C_CRASH:case C_STOP:
          pp=Player[other(Play)];
          if(!pp.can_go)return error('opponent cannot go');
          else if(pp.safety[safety(card)-S_CONV]===S_PLAYED)return error('opponent is protected');
          pp.battle=card;
          pp.new_battle=TRUE;
          pp.can_go=FALSE;
          pp=Player[Play];
          break;
        case C_LIMIT:
          pp=Player[other(Play)];
          if(pp.speed===C_LIMIT)return error('opponent has limit');
          if(pp.safety[S_RIGHT_WAY]===S_PLAYED)return error('opponent is protected');
          pp.speed=C_LIMIT;
          pp.new_speed=TRUE;
          pp=Player[Play];
          break;
        case C_GAS_SAFE:case C_SPARE_SAFE:case C_DRIVE_SAFE:case C_RIGHT_WAY:
          if(pp.battle===OPPOSITE[card]||(card===C_RIGHT_WAY&&pp.speed===C_LIMIT)){
            if(!(card===C_RIGHT_WAY&&!isrepair(pp.battle))){
              pp.battle=C_GO;
              pp.can_go=TRUE;
            }
            if(card===C_RIGHT_WAY&&pp.speed===C_LIMIT)pp.speed=C_INIT;
            if(pp.new_battle||(pp.new_speed&&card===C_RIGHT_WAY)){
              pp.coups[card-S_CONV]=TRUE;
              pp.total+=SC_COUP;
              pp.hand_tot+=SC_COUP;
              pp.coupscore+=SC_COUP;
            }
          }
          else if(pp.hand[0]===C_INIT&&Topcard>0)return error('must pick first');
          pp.safety[card-S_CONV]=S_PLAYED;
          pp.total+=SC_SAFETY;
          pp.hand_tot+=SC_SAFETY;
          if((pp.safescore+=SC_SAFETY)===NUM_SAFE*SC_SAFETY){
            pp.total+=SC_ALL_SAFE;
            pp.hand_tot+=SC_ALL_SAFE;
          }
          if(card===C_RIGHT_WAY){
            if(pp.speed===C_LIMIT)pp.speed=C_INIT;
            if(pp.battle===C_STOP||pp.battle===C_INIT){
              pp.can_go=TRUE;
              pp.battle=C_INIT;
            }
            if(!pp.can_go&&isrepair(pp.battle))pp.can_go=TRUE;
          }
          Next=-1;
          break;
        case C_INIT:
          error('no card there');
          Next=-1;
          break;
      }
      if(pp===Player[PLAYER])account(card);
      pp.hand[Card_no]=C_INIT;
      Next=Next===-1?FALSE:TRUE;
      return TRUE;
    }
    function* getmove(){
      var c;
      for(;;){
        prompt(MOVEPROMPT);
        Board.leave=false;
        refresh();
        while((c=yield* readch())===KILL||c===ERASE)continue;
        if(islower(c))c-=32;
        if(isprint(c)&&!isspace(c)){
          addch(c);
          refresh();
        }
        switch(c){
          case 80: /* P: pick */
            Movetype=M_DRAW;
            Board.leave=true;
            return;
          case 85: /* U: use card */
          case 68: /* D: discard card */
            if((Card_no=yield* getcard())<0)break;
            Movetype=c===85?M_PLAY:M_DISCARD;
            Board.leave=true;
            return;
          case 79: /* O: order */
            Order=Order?FALSE:TRUE;
            if(Window===W_SMALL){
              if(!Order)Mvwaddstr(Score,12,21,'o: order hand');
              else Mvwaddstr(Score,12,21,'o: stop ordering');
              wclrtoeol(Score);
            }
            Movetype=M_ORDER;
            Board.leave=true;
            return;
          case 81: /* Q: quit, the same as a rubout */
            yield* rub();
            break;
          case 87: /* W: window toggle */
            Window=1-Window;
            newscore();
            prscore();
            wrefresh(Score);
            break;
          case 82: /* R: redraw */
          case 12:
            break;
          case 83: /* S: save */
            On_exit=FALSE;
            yield* save();
            break;
          case 69: /* E: extrapolate, not compiled in */
            error(String.fromCharCode(c)+': command not implemented');
            break;
          case 13:case 10:case 32:case 0:
            break;
          default:
            error('unknown command: '+unctrl(c));
        }
      }
    }
    function haspicked(pp){
      var card;
      if(Topcard<=0)return TRUE;
      switch(pp.hand[Card_no]){
        case C_GAS_SAFE:case C_SPARE_SAFE:case C_DRIVE_SAFE:case C_RIGHT_WAY:
          card=1;
          break;
        default:
          card=0;
      }
      return pp.hand[card]!==C_INIT;
    }
    function account(card){
      var oppos;
      if(card===C_INIT)return;
      ++Numseen[card];
      if(Play===COMP){
        switch(card){
          case C_GAS_SAFE:case C_SPARE_SAFE:case C_DRIVE_SAFE:
            oppos=OPPOSITE[card];
            Numgos+=NUMCARDS[oppos]-Numseen[oppos];
            break;
          case C_CRASH:case C_FLAT:case C_EMPTY:case C_STOP:
            Numgos++;
            break;
        }
      }
    }
    function prompt(promptno){
      if(promptno===last_prompt)move(MOVE_Y,MOVE_X+PROMPTS[promptno].length+1);
      else{
        move(MOVE_Y,MOVE_X);
        if(promptno===MOVEPROMPT)stdscr.so=1;
        addstr(PROMPTS[promptno]);
        if(promptno===MOVEPROMPT)stdscr.so=0;
        addch(' ');
        last_prompt=promptno;
      }
      clrtoeol();
    }
    function sort(hand){
      var i,j,t;
      for(i=0;i<HAND_SZ-1;i++)
        for(j=i+1;j<HAND_SZ;j++)
          if(hand[i]>hand[j]){t=hand[i];hand[i]=hand[j];hand[j]=t}
    }
    /* ---------- print.c ---------- */
    function card18(c){return (NAMES[c]+'                  ').slice(0,18)}
    function show_card(yy,xx,c,o,k){
      if(c===o[k])return;
      if(move(yy,xx)!==ERR)addstr(card18(c));
      o[k]=c;
    }
    function prboard(){
      var pp,i,j,k,temp,end;
      for(k=0;k<2;k++){
        pp=Player[k];
        temp=k*COMP_STRT+CARD_STRT;
        for(i=0;i<NUM_SAFE;i++){
          if(pp.safety[i]===S_PLAYED&&!pp.sh_safety[i]){
            mvaddstr(i,temp,NAMES[i+S_CONV]);
            if(pp.coups[i])mvaddch(i,temp-CARD_STRT,'*');
            pp.sh_safety[i]=TRUE;
          }
        }
        show_card(14,temp,pp.battle,pp,'sh_battle');
        show_card(16,temp,pp.speed,pp,'sh_speed');
        for(i=C_25;i<=C_200;i++){
          if(pp.nummiles[i]===pp.sh_nummiles[i])continue;
          temp=k*40;
          end=pp.nummiles[i];
          for(j=pp.sh_nummiles[i];j<end;j++)Mvwaddstr(Miles,i+1,(j<<2)+temp,NAMES[i]);
          pp.sh_nummiles[i]=end;
        }
      }
      prscore();
      temp=CARD_STRT;
      pp=Player[PLAYER];
      for(i=0;i<HAND_SZ;i++)show_card(i+6,temp,pp.hand[i],pp.sh_hand,i);
      if(move(6,COMP_STRT+CARD_STRT)!==ERR)addstr(pad(Topcard,2));
      var o={v:Sh_discard};
      show_card(8,COMP_STRT+CARD_STRT,Discard,o,'v');
      Sh_discard=o.v;
      if(End===1000){
        move(EXT_Y,EXT_X);
        stdscr.so=1;
        addstr('Extension');
        stdscr.so=0;
      }
      wrefresh(Board);
      wrefresh(Miles);
      wrefresh(Score);
    }
    function prscore(){
      var k,pp,xx;
      stdscr=Score;
      for(k=0;k<2;k++){
        pp=Player[k];
        xx=k*6+21;
        show_score(1,xx,pp.mileage,pp,'sh_mileage');
        if(pp.safescore!==pp.sh_safescore){
          if(move(2,xx)!==ERR)addstr(pad(pp.safescore,4));
          if(pp.safescore===400)mvaddstr(3,xx+1,'300');
          else mvaddstr(3,xx+1,'  0');
          if(move(4,xx)!==ERR)addstr(pad(pp.coupscore,4));
          pp.sh_safescore=pp.safescore;
        }
        if(Window===W_FULL||Finished){
          finalscore(pp);
          show_score(11,xx,pp.hand_tot,pp,'sh_hand_tot');
          show_score(13,xx,pp.total,pp,'sh_total');
          show_score(14,xx,pp.games,pp,'sh_games');
        }
        else{
          show_score(6,xx,pp.hand_tot,pp,'sh_hand_tot');
          show_score(8,xx,pp.total,pp,'sh_total');
          show_score(9,xx,pp.games,pp,'sh_games');
        }
      }
      stdscr=Board;
    }
    function show_score(yy,xx,s,o,k){
      if(s===o[k])return;
      if(move(yy,xx)!==ERR)addstr(pad(s,4));
      o[k]=s;
    }
    /* ---------- save.c, varpush.c ---------- */
    function varpush(){
      return {Finished:Finished?1:0,Order:Order?1:0,End:End,On_exit:On_exit?1:0,Handstart:Handstart,Numgos:Numgos,Numseen:Numseen.slice(),Play:Play,Window:Window,Deck:Deck.slice(),Discard:Discard,
        Player:Player.map(function(p){var o={},k;for(k in p)if(P.has(p,k))o[k]=Array.isArray(p[k])?Array.prototype.slice.call(p[k],0,p[k].length>HAND_SZ&&(k==='hand')?HAND_SZ:p[k].length):p[k];return o}),
        Topcard:Topcard,mtime:clock().getTime()};
    }
    function* save(){
      var buf,c,erased;
      if(Fromfile&&(yield* getyn(SAMEFILEPROMPT)))buf=Fromfile;
      else{
        over:for(;;){
          prompt(FILEPROMPT);
          Board.leave=false;
          refresh();
          buf='';
          while((c=yield* readch())!==10){
            if(c===KILL)continue over;
            else if(c===ERASE){
              if(buf.length){
                erased=buf.charCodeAt(buf.length-1);
                buf=buf.slice(0,-1);
                addch(8);
                if(erased<32)addch(8);
                clrtoeol();
              }
            }
            else{
              buf+=String.fromCharCode(c);
              addstr(unctrl(c));
            }
            refresh();
          }
          break;
        }
        Board.leave=true;
        if(buf==='')return FALSE;
        if(!Fromfile&&P.saved('mille/'+buf)!==null&&(yield* getyn(OVERWRITEFILEPROMPT))===FALSE)return FALSE;
      }
      if(P.save('mille/'+buf,varpush())===false){
        error('No space left on device');
        return FALSE;
      }
      Mvwaddstr(Score,ERR_Y,ERR_X,buf);
      wrefresh(Score);
      waddstr(Score,' ['+ctime(clock())+']');
      wclrtoeol(Score);
      wrefresh(Score);
      return TRUE;
    }
    function rest_f(s){
      Finished=s.Finished;Order=s.Order;End=s.End;On_exit=s.On_exit;Handstart=s.Handstart;Numgos=s.Numgos;Numseen=s.Numseen.slice();Play=s.Play;Window=s.Window;
      Deck=s.Deck.slice();Discard=s.Discard;
      s.Player.forEach(function(q,i){
        var p=newPlay(),k;
        for(k in p)if(P.has(p,k)&&P.has(q,k)){
          if(Array.isArray(p[k]))for(var j=0;j<q[k].length;j++)p[k][j]=q[k][j];
          else p[k]=q[k];
        }
        Player[i]=p;
      });
      Topcard=s.Topcard;
      Initstr=Fromfile+' ['+ctime(new Date(s.mtime))+']\n';
    }
    /* ---------- mille.c ---------- */
    function* main(){
      var restore=FALSE;
      if(rest){
        rest_f(rest);
        restore=TRUE;
      }
      Play=PLAYER;
      stdscr=Board=newwin(BOARD_Y,BOARD_X,0,0);
      Score=newwin(SCORE_Y,SCORE_X,0,40);
      Miles=newwin(MILES_Y,MILES_X,17,0);
      Score.leave=true;
      Miles.leave=true;
      srandom(Math.floor(Math.random()*30000)+1); /* getpid() */
      for(;;){
        if(!restore||(Player[PLAYER].total>=5000||Player[COMP].total>=5000)){
          if(Player[COMP].total<Player[PLAYER].total)Player[PLAYER].games++;
          else if(Player[COMP].total>Player[PLAYER].total)Player[COMP].games++;
          Player[COMP].total=0;
          Player[PLAYER].total=0;
        }
        do{
          if(!restore)Handstart=Play=other(Handstart);
          if(!restore||On_exit){
            shuffle();
            init();
          }
          newboard();
          if(restore)Mvwaddstr(Score,ERR_Y,ERR_X,Initstr);
          prboard();
          var spin=0;
          do{
            yield* domove();
            if(Finished)newscore();
            prboard();
            /* a computer with no cards left never gets past its turn: the C spins here for good */
            if(Play===COMP&&!Next&&++spin>100){spin=0;yield* readch()}
          }while(!Finished);
          yield* check_more();
          restore=On_exit=FALSE;
        }while(Player[COMP].total<5000&&Player[PLAYER].total<5000);
      }
    }
    /* ---------- the driver: the C blocks in read, this resumes the generator with the key ---------- */
    var gen=main(),ended=false;
    function step(c){
      var r;
      try{r=gen.next(c)}
      catch(e){
        ended=true;
        S.close();
        if(e===FPE){P.say(['Floating exception (core dumped)']);P.status(136)}
        else if(e===EXIT)P.status(1);
        else{done();throw e}
        done();
        return;
      }
      render();
    }
    function keycode(k){
      if(k.length===1){var c=k.charCodeAt(0);return c<128?c:-1}
      if(k.length===3&&k.slice(0,2)==='C-'){
        if(k==='C-z'||k==='C-s'||k==='C-q'||k==='C-y')return -1;
        return k.charCodeAt(2)&31;
      }
      switch(k){
        case 'Enter':return 10;
        case 'Escape':return 27;
        case 'Backspace':return ERASE;
        case 'Tab':return 9;
      }
      return -1;
    }
    var V={
      feed:function(k){
        if(ended)return;
        if(S.cols<COLS||S.rows<LINES){
          if(k==='ArrowUp'||k==='PageUp'||k==='ArrowDown'||k==='PageDown'){
            var was=pcy,wx=pcx; /* look around, and leave the cursor out of it */
            pcy=-1;pcx=-1;
            pan_y+=k==='ArrowUp'||k==='PageUp'?-4:4;
            render();
            pcy=was;pcx=wx;
            return;
          }
        }
        var c=keycode(k);
        if(c>=0)step(c);
      },
      draw:function(){if(!ended)render()},
      resize:function(){if(!ended)render()}
    };
    step();
    if(!ended)render();
    return V;
  },{tty:'mille',fit:[COLS,LINES]});
}
P.command({names:['mille'],run:function(a,raw,words){run(words||['mille'].concat(a))}});
})(window.Phosphor);
