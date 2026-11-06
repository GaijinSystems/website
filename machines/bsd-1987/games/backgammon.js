/* PHOSPHOR-9 terminal: machine "bsd-1987", backgammon. Ported to JavaScript for this terminal from 4.3BSD's games/backgammon:
   main.c, allow.c, board.c, check.c, extra.c, fancy.c, init.c, message.c, move.c, odds.c, one.c, save.c, subs.c, table.c, text.c,
   5.1 (Berkeley) 5/29/85. By Alan Char. It keeps this notice:

 * Copyright (c) 1980 Regents of the University of California.
 * All rights reserved.  The Berkeley software License Agreement
 * specifies the terms and conditions for redistribution.

   Differences from the C:
   - It always draws as it does on a terminal with cursor addressing, 24 by 80; the plain board the C draws on a terminal that
     cannot is not here, and -t is read and ignored. Piped, it says it needs a terminal, where the C's gtty would fail.
   - A game saved with S goes through P.save under the name given, not into a binary file, and is checked when read.
   - The password's ten-second alarm is gone: the password still gets you the ROLL: prompts, but no clock runs out on it.
   - Rules asked for: the C runs teachgammon if it can; so does this. A move's position past 25 reads as an empty point.
   - The first turn's three-second wait and the five-second wait when stuck are real, and keys typed during them wait their turn.
   - Narrower or shorter than the screen, the type shrinks as far as it stays readable, and the view follows the cursor.
 */
(function(P){
'use strict';
var EXIT={},LI=24,CO=80,ERASE=8,KILL=21,MVPAUSE=5;
var color=['White','Red','white','red'];
var plred='Player is red, computer is white.',plwhite='Player is white, computer is red.',nocomp='(No computer play.)';
var help2=['   Enter moves as <s>-<f> or <s>/<r> where <s> is the starting','position, <f> is the finishing position, and <r> is the roll.','Remember, each die roll must be moved separately.'];
var helpm=['Enter a space or newline to roll, or','     R   to reprint the board\tD   to double','     S   to save the game\tQ   to quit'];
var contin=['(Type a newline to continue.)',''];
var message_=['Last update on Thursday, June 5, 1986.'];
var instr=[
"    If you did not notice by now, this program reacts to things as",
"soon as you type them, without waiting for a newline.  This means that",
"the special characters RUBOUT, ESC, and CONTROL-D, will not perform",
"their special functions during most of this program.  The program",
"should usually stop when a RUBOUT is typed, but occasionally it will",
"ignore RUBOUTs until it is waiting for input.\n",
"    These instructions are presented in small chunks designed not to",
"roll off the top of your screen.  When the characters '-->' are print-",
"ed, no more data will be printed until a space or newline is typed.",
"In this way, you can finish one section before continuing to another.",
"Like this:",
"",
"    The two sides are colored 'red' and 'white.' The computer may play",
"one side, or if there are two players, the computer can merely act as",
"a gamekeeper, letting the players make the moves.  Once you tell the",
"computer what color(s) you want to play, the decision remains in ef-",
"fect until you quit the program, even if you play more than one game,",
"since the program keeps a running score.\n",
"    The program will prompt for a move in one of two ways.  If the",
"player has the opportunity to double, then merely his color will be",
"typed out.  The player can now do one of several things.  He can dou-",
"ble by typing a 'd', he can roll by typing a space (' ') or newline,",
"or if he is not sure, he can reprint the board by typing a 'r'.\n",
"    If the player cannot double, his roll will be thrust in front of",
"him, followed by the request 'Move:', asking for a move but not giving",
"him the chance to double.  He can still ask for the board by typing",
"'r'.  In either of these two states, the player can quit by typing 'q'",
"or save the game by typing 's'.  In either case, the player will be",
"asked to verify, in case there was some error.  The program then ends",
"immediately, after first saving the file if so requested.",
"",
"    A player can move one of his men using two forms of input.  The",
"first form is <s>-<f>, where <s> is the starting position, and <f> is",
"the finishing position of the player's man.  For example, if white",
"wanted to move a piece from position 13 to position 8, his move could",
"be entered as 13-8.  The second form is <s>/<r> where <s> is the",
"starting position, an <r> is the roll actually made.  Hence, white",
"could have entered as 13/5 instead of 13-8.\n",
"    A player must move each roll of the dice separately.  For example,",
"if a player rolled 4 3, and wanted to move from 13 to 6, he could",
"enter it as 13/4,9/3 or 13/3,10/4 or 13-10,10-6 or 13-9,9-6, but not",
"13-6.  The last two entries can be shortened to 13-10-6 and 13-9-6.",
"If you want to move more than one piece from the same position, such",
"as 13-10,13-9, you can abbreviate this using the <s>/<r> format as by",
"entering more than one <r>, or 13/34.  A player can use both forms for",
"the same roll, e.g. 13/3,13-9, and separates individual moves by ei-",
"ther a comma or a space.  The letter 'b' represents the bar, and the",
"letter 'h' represents a player's home.  You could also enter the",
"number that would be in the position of the bar, 25 or 0 as appropri-",
"ate.  Use a newline at the end of your moves for a turn.",
"",
"    As you type in your move, if a character does not make sense under",
"the above constrictions, a bell will sound instead of the character,",
"and it will be ignored.  You may kill lines and erase characters as",
"you would normally, but don't be surprised if they look different than",
"usual.  Also, if you have entered one or more of your rolls, and you",
"wish to see what the move looks like so far, type a 'r' to see what it",
"looks like.  This cannot be done in the middle of a move (e.g., after",
"a '-' or '/').  After the printing board, the program will go back to",
"inputting your move and you can backspace or kill just as if you had",
"just typed in your input.\n",
"    Now you should be ready to begin the game.  Good luck!",
""];
/* the state machine of table.c: character, what to do, where to go */
var atmata=[
  ['R',1,0],['?',7,0],['Q',0,-3],['B',8,25],['9',2,25],['8',2,25],['7',2,25],['6',2,25],
  ['5',2,25],['4',2,25],['3',2,25],['2',2,19],['1',2,15],['0',2,25],['.',0,0],['9',2,25],
  ['8',2,25],['7',2,25],['6',2,25],['5',2,25],['4',2,25],['3',2,25],['2',2,25],['1',2,25],
  ['0',2,25],['/',0,32],['-',0,39],['.',0,0],['/',5,32],[' ',6,3],[',',6,3],['\n',0,-1],
  ['6',3,28],['5',3,28],['4',3,28],['3',3,28],['2',3,28],['1',3,28],['.',0,0],['H',9,61],
  ['9',4,61],['8',4,61],['7',4,61],['6',4,61],['5',4,61],['4',4,61],['3',4,61],['2',4,53],
  ['1',4,51],['0',4,61],['.',0,0],['9',4,61],['8',4,61],['7',4,61],['6',4,61],['5',4,61],
  ['4',4,61],['3',4,61],['2',4,61],['1',4,61],['0',4,61],[' ',6,3],[',',6,3],['-',5,39],
  ['\n',0,-1],['.',0,0]];

function zero(n){var a=[];while(n--)a.push(0);return a}
function abs(x){return Math.abs(x)}
function isInt(x,lo,hi){return typeof x==='number'&&Math.floor(x)===x&&x>=lo&&x<=hi}
function goodSave(s){
  var i;
  if(!s||typeof s!=='object'||!Array.isArray(s.board)||s.board.length!==26)return false;
  for(i=0;i<26;i++)if(!isInt(s.board[i],-15,15))return false;
  if(!Array.isArray(s.off)||!Array.isArray(s.inn)||!Array.isArray(s.dice)||s.off.length!==2||s.inn.length!==2||s.dice.length!==2)return false;
  for(i=0;i<2;i++)if(!isInt(s.off[i],-15,15)||!isInt(s.inn[i],-15,15)||!isInt(s.dice[i],0,6))return false;
  return isInt(s.cturn,-2,2)&&isInt(s.dlast,-1,1)&&isInt(s.pnum,-1,2)&&isInt(s.rscore,0,1e9)&&isInt(s.wscore,0,1e9)&&isInt(s.gvalue,1,192)&&isInt(s.raflag,0,1);
}
P.command({names:['backgammon'],run:function(a,raw,words){
  var argv=(words||['backgammon'].concat(a)).slice(1),rflag=0,args='',aflag=1,pnum=2,bflag=2,saved_=null,ai,s,raflag=0;
  function norec(f){P.say(["Can't recover file:  "+f,'']);P.status(0)}
  function recover(f){
    var d=P.saved('backgammon/'+f);
    if(!goodSave(d)){norec(f);return false}
    saved_=d;
    rflag=1;
    return true;
  }
  /* getarg: it never moves its caller's pointer on, so each argument is looked at again from every one before it */
  for(ai=0;ai<argv.length;ai++){
    s=ai;
    while(s<argv.length&&argv[s].charAt(0)==='-'){
      var c1=argv[s].charAt(1);
      if(c1==='n'){if(!rflag){aflag=0;args+='n'}}
      else if(c1==='b'){if(!rflag){pnum=0;aflag=0;args+='b'}}
      else if(c1==='r'){if(!rflag){pnum=-1;aflag=0;args+='r'}}
      else if(c1==='w'){if(!rflag){pnum=1;aflag=0;args+='w'}}
      else if(c1==='p'){
        var c2=argv[s].charAt(2);
        if(c2==='r'||c2==='w'||c2==='b'){
          args+='p'+c2;
          bflag=c2==='r'?1:c2==='w'?-1:0;
        }
      }
      else if(c1==='t'){if(argv[s].charAt(2)==='')s++}
      else if(c1==='s'){
        s++;
        if(s<argv.length&&!recover(argv[s]))return;
      }
      s++;
    }
    if(s<argv.length&&!recover(argv[s]))return;
  }
  var randstate=Math.floor(Date.now()/1000);
  P.program(function(S,finish_){
    /* the terminal */
    var G=[],tr=0,tc=0,pan_y=0,pan_x=0;
    function blankline(){return new Array(CO).fill(' ')}
    for(var y0=0;y0<LI;y0++)G.push(blankline());
    function addbuf(c){
      if(G[tr]&&tc>=0&&tc<CO)G[tr][tc]=c;
      tc++;
      if(tc>=CO){tc=0;if(tr<LI-1)tr++}
    }
    function CEput(){if(G[tr])for(var x=tc;x<CO;x++)G[tr][x]=' '}
    function CDput(){CEput();for(var y=tr+1;y<LI;y++)G[y]=blankline()}
    function view(){
      var rows=Math.min(S.rows,LI),cols=Math.min(S.cols,CO),cy=Math.max(0,Math.min(tr,LI-1)),cx=Math.max(0,Math.min(tc,CO-1));
      if(cy<pan_y||cy>=pan_y+rows)pan_y=cy-(rows>>1);
      pan_y=Math.max(0,Math.min(LI-rows,pan_y));
      if(cx<pan_x||cx>=pan_x+cols)pan_x=cx-(cols>>1);
      pan_x=Math.max(0,Math.min(CO-cols,pan_x));
      var px=S.pan(pan_x,CO-cols,cx);
      S.draw(G.slice(pan_y,pan_y+rows).map(function(L){return L.slice(px,px+cols).join('').trimEnd()}),cy-pan_y,cx-px);
      S.say(G[cy].join('').trim());
    }
    /* fancy.c: it keeps where it means to be apart from where the cursor is */
    var curr=0,curc=0,realr=0,realc=0,begscr=0,linect=zero(LI+1),oldb=zero(26),oldr=0,oldw=0;
    var board=zero(26),dice=[0,0],mvlim=0,mvl=0,p=zero(5),g=zero(5),h=zero(4),cturn=0,d0=0,table=[],rscore=0,wscore=0,gvalue=1,dlast=0,bar=0,home=0,off=[0,0],offptr=0,offopp=0,
      inn=[0,0],inptr=0,inopp=0,ncin=0,cin=[],Colorptr=0,colorptr=0,cflag=0,hflag=1,iroll=0,rfl=0;
    for(var t0=0;t0<6;t0++)table.push(zero(6));
    /* random(3), as 4.3BSD's: type 3, degree 31, separation 3 */
    var rs=zero(31),rf=3,rr=0;
    function random(){
      var v=(rs[rf]+rs[rr])|0;
      rs[rf]=v;
      if(++rf>=31){rf=0;++rr}
      else if(++rr>=31)rr=0;
      return (v>>>1)&0x7fffffff;
    }
    function srandom(x){
      var i;
      rs[0]=x|0;
      for(i=1;i<31;i++)rs[i]=(Math.imul(rs[i-1],1103515245)+12345)|0;
      rf=3;rr=0;
      for(i=0;i<310;i++)random();
    }
    function rnum(r){return random()%r}
    function getout(){
      curmove(23,0);
      cline();
      fixtty();
      throw EXIT;
    }
    function* readc(){
      cline();
      newpos();
      var c=yield;
      if(c===127||c===-3)getout();
      if(c===27||c===13)return 10;
      if(cflag)return c;
      if(c===12)return 82;
      if(c>=97&&c<=122)return c&0o137;
      return c;
    }
    function* nap(n){yield {nap:n}}
    function curmove(r,c){
      if(curr===r&&curc===c)return;
      if(realr===-1){realr=curr;realc=curc}
      curr=r;curc=c;
    }
    function newpos(){
      if(realr===-1)return;
      var r=curr,c=curc;
      curr=realr;curc=realc;
      if(curr===r&&curc===c){realr=realc=-1;return}
      /* it picks the fewest characters, for a vt100. Most ways are relative, and its idea of the column can be wrong
         after a tab (see fancyc), so which way it picks shows on the screen */
      var mode=0,count=('\u001b['+(r+1)+';'+(c+1)+'H').length,n,lND=3,lUP=3,lHO=3,lBC=1,i;
      if((n=r+c*lND+lHO)<count){mode=1;count=n}
      if(r>=curr){
        if((n=(r-curr)+c*lND+1)<count){mode=2;count=n}
        if(c>=curc&&(n=(r-curr)+(c-curc)*lND)<count){mode=3;count=n}
        if(c<curc&&(n=(r-curr)+(curc-c)*lBC)<count){mode=4;count=n}
      }
      if(r<curr){
        if((n=(curr-r)*lUP+c*lND+1)<count){mode=5;count=n}
        if(c>=curc&&(n=(curr-r)*lUP+(c-curc)*lND)<count){mode=6;count=n}
        if(c<curc&&(n=(curr-r)*lUP+(curc-c)*lBC)<count){mode=7;count=n}
      }
      if(curr===r&&c>curc&&linect[r]<curc&&c-curc<count)mode=8;
      switch(mode){
      case 0:case 1:tr=r;tc=c;break;
      case 2:tc=c;tr+=r-curr;break;
      case 3:tr+=r-curr;tc+=c-curc;break;
      case 4:tr+=r-curr;tc-=curc-c;break;
      case 5:tc=c;tr-=curr-r;break;
      case 6:tr-=curr-r;tc+=c-curc;break;
      case 7:tr-=curr-r;tc-=curc-c;break;
      case 8:for(i=0;i<c-curc;i++)addbuf(' ');
      }
      curr=r;curc=c;
      realr=-1;realc=-1;
    }
    function clear(){
      curr=curc=0;
      realr=realc=-1;
      for(var i=0;i<24;i++)linect[i]=-1;
      for(i=0;i<LI;i++)G[i]=blankline();
      tr=tc=0;
    }
    function cline(){
      if(curc>linect[curr])return;
      newpos();
      CEput();
      linect[curr]=curc-1;
    }
    function clend(){
      CDput();
      for(var i=curr;i<LI;i++)linect[i]=-1;
    }
    function newline(){
      cline();
      if(curr===LI-1)curmove(begscr,0);
      else curmove(curr+1,0);
    }
    function fancyc(c){
      var code=c.charCodeAt(0),sp;
      if(c==='\u0007')return;
      if(c==='\t'){
        sp=(curc+8)&~7;
        if(linect[curr]>=curc||sp<4){
          for(;sp>curc;sp--)addbuf(' ');
          curc=sp;
        }
        else curmove(curr,sp);
        return;
      }
      if(c==='\n'){newline();return}
      if(code<32)return;
      if(c>' '||linect[curr]>=curc){
        newpos();
        addbuf(c);
        if(c===' '&&linect[curr]===curc)linect[curr]--;
        else if(linect[curr]<curc)linect[curr]=curc;
        curc++;
      }
      else curmove(curr,curc+1);
    }
    function writec(c){fancyc(c)}
    function writel(l){for(var i=0;i<l.length;i++)fancyc(l.charAt(i))}
    function fixtty(){newpos()}
    function swap(){var t=dice[0];dice[0]=dice[1];dice[1]=t;d0=1-d0}
    function init(){
      var i;
      for(i=0;i<26;)board[i++]=0;
      board[1]=2;
      board[6]=board[13]=-5;
      board[8]=-3;
      board[12]=board[19]=5;
      board[17]=3;
      board[24]=-2;
      off[0]=off[1]=-15;
      inn[0]=inn[1]=5;
      gvalue=1;
      dlast=0;
    }
    function wrint(n){
      var i,j,t;
      for(i=4;i>0;i--){
        t=1;
        for(j=0;j<i;j++)t*=10;
        if(n>t-1)writec(String.fromCharCode(Math.trunc(n/t)%10+48));
      }
      writec(String.fromCharCode(n%10+48));
    }
    function wrscore(){
      writel('Score:  ');writel(color[1]);writec(' ');wrint(rscore);
      writel(', ');writel(color[0]);writec(' ');wrint(wscore);
    }
    function gwrite(){
      var r=curr,c=curc;
      curmove(16,0);
      if(gvalue>1){
        writel('Game value:  ');wrint(gvalue);writel('.  ');
        writel(dlast===-1?color[0]:color[1]);
        writel(' doubled last.');
      }
      else if(pnum===-1)writel(plred);
      else if(pnum===0)writel(nocomp);
      else if(pnum===1)writel(plwhite);
      if(rscore||wscore){writel('  ');wrscore()}
      cline();
      curmove(r,c);
    }
    function proll(){
      if(d0)swap();
      writel(cturn===1?"Red's roll:  ":"White's roll:  ");
      writec(String.fromCharCode(dice[0]+48));
      writec(' ');
      writec(String.fromCharCode(dice[1]+48));
      cline();
    }
    function wrhit(i){writel('Blot hit on ');wrint(i);writec('.');writec('\n')}
    function nexturn(){
      cturn=-cturn;
      var c=cturn/abs(cturn);
      home=bar;
      bar=25-bar;
      offptr+=c;offopp-=c;
      inptr+=c;inopp-=c;
      Colorptr+=c;colorptr+=c;
    }
    function last(){
      for(var i=home-6*cturn;i!==home;i+=cturn)if(board[i]*cturn>0)return abs(home-i);
      return 0;
    }
    function checkd(d){if(d0!==d)swap();return 0}
    function backone(i){
      board[p[i]]+=cturn;
      if(g[i]!==home){
        board[g[i]]-=cturn;
        if(abs(g[i]-home)<7&&abs(p[i]-home)>6){
          inn[inptr]--;
          if(inn[inptr]+off[offptr]<15&&off[offptr]>=0)off[offptr]-=15;
        }
      }
      else{
        off[offptr]--;
        inn[inptr]++;
      }
      if(h[i]){
        board[home]+=cturn;
        board[g[i]]=-cturn;
        if(abs(bar-g[i])<7){
          inn[inopp]++;
          if(inn[inopp]+off[offopp]===0)off[offopp]+=15;
        }
      }
    }
    function movback(i){for(var j=i-1;j>=0;j--)backone(j)}
    function moverr(i){
      curmove(20,0);
      writel('Error:  ');
      for(var j=0;j<=i;j++){
        wrint(p[j]);
        writec('-');
        wrint(g[j]);
        if(j<i)writec(',');
      }
      writel('... ');
      movback(i);
    }
    function movallow(){
      var i,m,iold;
      if(d0)swap();
      m=dice[0]===dice[1]?4:2;
      for(i=0;i<4;i++)p[i]=bar;
      i=iold=0;
      while(i<m){
        if(off[offptr]===15)break;
        h[i]=0;
        if(board[bar]){
          g[i]=i===1||m===4?bar+cturn*dice[1]:bar+cturn*dice[0];
          if(makmove(i)){
            if(d0||m===4)break;
            swap();
            movback(i);
            if(i>iold)iold=i;
            for(i=0;i<4;i++)p[i]=bar;
            i=0;
          }
          else i++;
          continue;
        }
        if((p[i]+=cturn)===home){
          if(i>iold)iold=i;
          if(m===2&&i){
            movback(i);
            p[i--]=bar;
            if(p[i]!==bar)continue;
            else break;
          }
          if(d0||m===4)break;
          swap();
          movback(i);
          for(i=0;i<4;i++)p[i]=bar;
          i=0;
          continue;
        }
        g[i]=i===1||m===4?p[i]+cturn*dice[1]:p[i]+cturn*dice[0];
        if(g[i]*cturn>home){
          if(off[offptr]>=0)g[i]=home;
          else continue;
        }
        if(board[p[i]]*cturn>0&&makmove(i)===0)i++;
      }
      movback(i);
      return iold>i?iold:i;
    }
    function bsect(b,rpos,cpos,cnext){
      var j,n=abs(b),bct,k,pc=b>0?'r':'w';
      if(n<6&&cpos<54)curmove(rpos,cpos+1);
      else curmove(rpos,cpos);
      for(j=0;j<5;j++){
        for(k=0;k<15;k+=5)if(n>j+k)fancyc(pc);
        if(j<4){
          if(n<6){
            if(j+1===n)break;
            bct=1;
          }
          else if(n<11){
            if(cpos===54)bct=j+5>=n?1:2;
            if(cpos<54)bct=j+6>=n?1:2;
          }
          else bct=j+10>=n?2:3;
          curmove(curr+cnext,curc-bct);
        }
      }
    }
    function fboard(){
      var i,j,l;
      curmove(0,0);
      for(i=0;i<53;i++)fancyc('_');
      curmove(15,0);
      for(i=0;i<53;i++)fancyc('_');
      l=1;
      for(i=52;i>-1;i-=28){
        curmove(l===1?1:15,i);
        fancyc('|');
        for(j=0;j<14;j++){
          curmove(curr+l,curc-1);
          fancyc('|');
        }
        if(i===24)i+=32;
        l=-l;
      }
      curmove(2,1);
      for(i=13;i<18;i++){
        fancyc('1');
        fancyc(String(i%10));
        curmove(curr,curc+2);
      }
      fancyc('1');fancyc('8');
      curmove(2,29);
      fancyc('1');fancyc('9');
      for(i=20;i<25;i++){
        curmove(curr,curc+2);
        fancyc('2');
        fancyc(String(i%10));
      }
      curmove(14,1);
      fancyc('1');fancyc('2');
      for(i=11;i>6;i--){
        curmove(curr,curc+2);
        fancyc(i>9?'1':' ');
        fancyc(String(i%10));
      }
      curmove(14,30);
      fancyc('6');
      for(i=5;i>0;i--){
        curmove(curr,curc+3);
        fancyc(String(i));
      }
      for(i=12;i>6;i--)if(board[i])bsect(board[i],13,1+4*(12-i),-1);
      if(board[0])bsect(board[0],13,25,-1);
      for(i=6;i>0;i--)if(board[i])bsect(board[i],13,29+4*(6-i),-1);
      l=off[1]<0?off[1]+15:off[1];
      bsect(l,3,54,1);
      curmove(8,25);
      fancyc('B');fancyc('A');fancyc('R');
      for(i=13;i<19;i++)if(board[i])bsect(board[i],3,1+4*(i-13),1);
      if(board[25])bsect(board[25],3,25,1);
      for(i=19;i<25;i++)if(board[i])bsect(board[i],3,29+4*(i-19),1);
      l=off[0]<0?off[0]+15:off[0];
      bsect(-l,13,54,-1);
      for(i=0;i<26;i++)oldb[i]=board[i];
      oldr=off[1]<0?off[1]+15:off[1];
      oldw=-(off[0]<0?off[0]+15:off[0]);
    }
    function wrboard(){
      fixtty();
      clear();
      fboard();
      gwrite();
      curmove(18,0);
      fixtty();
    }
    function fixcol(r,c,l,ch,inc){
      curmove(r,c);
      fancyc(ch);
      for(var i=1;i<l;i++){
        curmove(curr+inc,curc-1);
        fancyc(ch);
      }
    }
    function fixpos(old,nw,r,c,inc){
      var o,n,nv,ov,nc,col;
      if(old*nw>=0){
        ov=abs(old);
        nv=abs(nw);
        col=old+nw>0?'r':'w';
        o=Math.trunc((ov-1)/5);
        n=Math.trunc((nv-1)/5);
        if(o===n){
          if(o===2)nc=c+2;
          if(o===1)nc=c<54?c:c+1;
          if(o===0)nc=c<54?c+1:c;
          if(ov>nv)fixcol(r+inc*(nv-n*5),nc,abs(ov-nv),' ',inc);
          else fixcol(r+inc*(ov-o*5),nc,abs(ov-nv),col,inc);
          return;
        }
        if(c<54){
          if(o+n===1){
            if(n){
              fixcol(r,c,abs(nv-5),col,inc);
              if(ov!==5)fixcol(r+inc*ov,c+1,abs(ov-5),col,inc);
            }
            else{
              fixcol(r,c,abs(ov-5),' ',inc);
              if(nv!==5)fixcol(r+inc*nv,c+1,abs(nv-5),' ',inc);
            }
            return;
          }
          if(n===2){
            if(ov!==10)fixcol(r+inc*(ov-5),c,abs(ov-10),col,inc);
            fixcol(r,c+2,abs(nv-10),col,inc);
          }
          else{
            if(nv!==10)fixcol(r+inc*(nv-5),c,abs(nv-10),' ',inc);
            fixcol(r,c+2,abs(ov-10),' ',inc);
          }
          return;
        }
        if(n>o){
          fixcol(r+inc*(ov%5),c+o,abs(5*n-ov),col,inc);
          if(nv!==5*n)fixcol(r,c+n,abs(5*n-nv),col,inc);
        }
        else{
          fixcol(r+inc*(nv%5),c+n,abs(5*n-nv),' ',inc);
          if(ov!==5*o)fixcol(r,c+o,abs(5*o-ov),' ',inc);
        }
        return;
      }
      nv=abs(nw);
      fixcol(r,c+1,nv,nw>0?'r':'w',inc);
      if(abs(old)<=abs(nw))return;
      fixcol(r+inc*nw,c+1,abs(old+nw),' ',inc);
    }
    function refresh(){
      var i,r=curr,c=curc;
      for(i=12;i>6;i--)if(board[i]!==oldb[i]){fixpos(oldb[i],board[i],13,1+(12-i)*4,-1);oldb[i]=board[i]}
      if(board[0]!==oldb[0]){fixpos(oldb[0],board[0],13,25,-1);oldb[0]=board[0]}
      for(i=6;i>0;i--)if(board[i]!==oldb[i]){fixpos(oldb[i],board[i],13,29+(6-i)*4,-1);oldb[i]=board[i]}
      i=-(off[0]<0?off[0]+15:off[0]);
      if(oldw!==i){fixpos(oldw,i,13,54,-1);oldw=i}
      for(i=13;i<19;i++)if(board[i]!==oldb[i]){fixpos(oldb[i],board[i],3,1+(i-13)*4,1);oldb[i]=board[i]}
      if(board[25]!==oldb[25]){fixpos(oldb[25],board[25],3,25,1);oldb[25]=board[25]}
      for(i=19;i<25;i++)if(board[i]!==oldb[i]){fixpos(oldb[i],board[i],3,29+(i-19)*4,1);oldb[i]=board[i]}
      i=off[1]<0?off[1]+15:off[1];
      if(oldr!==i){fixpos(oldr,i,3,54,1);oldr=i}
      curmove(r,c);
      newpos();
    }
    function* dotable(c,i){
      var test_=c===82,a,chs=c===-1?'':String.fromCharCode(c);
      while((a=atmata[i][0])!=='.'){
        if(a===chs||(test_&&a==='\n')){
          switch(atmata[i][1]){
          case 1:
            wrboard();
            curmove(cturn===-1?18:19,0);
            proll();
            writel('\t\t');
            break;
          case 2:
            if(p[mvl]===-1)p[mvl]=c-48;
            else p[mvl]=p[mvl]*10+c-48;
            break;
          case 3:
            if(g[mvl]!==-1){
              if(mvl<mvlim)mvl++;
              p[mvl]=p[mvl-1];
            }
            g[mvl]=p[mvl]+cturn*(c-48);
            if(g[mvl]<0)g[mvl]=0;
            if(g[mvl]>25)g[mvl]=25;
            break;
          case 4:
            if(g[mvl]===-1)g[mvl]=c-48;
            else g[mvl]=g[mvl]*10+c-48;
            break;
          case 5:
            if(mvl<mvlim)mvl++;
            p[mvl]=g[mvl-1];
            break;
          case 6:
            if(mvl<mvlim)mvl++;
            break;
          case 7:
            curmove(20,0);
            yield* text(help2);
            curmove(cturn===-1?18:19,39);
            break;
          case 8:p[mvl]=bar;break;
          case 9:g[mvl]=home;break;
          }
          if(!test_||a!=='\n')return atmata[i][2];
          return -6;
        }
        i++;
      }
      return -5;
    }
    function* rsetbrd(){
      var i,j,n=0;
      mvl=0;
      for(i=0;i<4;i++)p[i]=g[i]=-1;
      for(j=0;j<ncin;j++)n=yield* dotable(cin[j],n);
      return n;
    }
    /* one.c, but an out of range position reads as empty */
    function makmove(i){
      var n,d,max,sq;
      d=d0;
      n=abs(g[i]-p[i]);
      max=off[offptr]<0?7:last();
      sq=p[i]>=0&&p[i]<26?board[p[i]]:0;
      if(sq*cturn<=0)return checkd(d)+2;
      sq=g[i]>=0&&g[i]<26?board[g[i]]:0;
      if(g[i]!==home&&sq*cturn<-1)return checkd(d)+3;
      if(i||dice[0]===dice[1]){
        if(n===max?dice[1]<n:dice[1]!==n)return checkd(d)+1;
      }
      else{
        if(n===max?dice[0]<n&&dice[1]<n:dice[0]!==n&&dice[1]!==n)return checkd(d)+1;
        if(n===max?dice[0]<n:dice[0]!==n){
          if(d0)return checkd(d)+1;
          swap();
        }
      }
      if(g[i]===home&&off[offptr]<0)return checkd(d)+4;
      h[i]=0;
      board[p[i]]-=cturn;
      if(g[i]!==home){
        if(board[g[i]]===-cturn){
          board[home]-=cturn;
          board[g[i]]=0;
          h[i]=1;
          if(abs(bar-g[i])<7){
            inn[inopp]--;
            if(off[offopp]>=0)off[offopp]-=15;
          }
        }
        board[g[i]]+=cturn;
        if(abs(home-g[i])<7&&abs(home-p[i])>6){
          inn[inptr]++;
          if(inn[inptr]+off[offptr]===0)off[offptr]+=15;
        }
      }
      else{
        off[offptr]++;
        inn[inptr]--;
      }
      return 0;
    }
    /* odds.c */
    function odds(r1,r2,val){
      var i,j;
      if(r1===0){
        for(i=0;i<6;i++)for(j=0;j<6;j++)table[i][j]=0;
        return;
      }
      r1--;
      if(r2--===0){
        for(i=0;i<6;i++){
          table[i][r1]+=val;
          table[r1][i]+=val;
        }
      }
      else{
        table[r2][r1]+=val;
        table[r1][r2]+=val;
      }
    }
    function count(){
      var i,j,total=0;
      for(i=0;i<6;i++)for(j=0;j<6;j++)total+=table[i][j];
      return total;
    }
    function canhit(i,c){
      var j,k,b,a,diff,place,addon,menstuck;
      if(c===0)odds(0,0,0);
      if(board[i]>0){a=-1;b=25}
      else{a=1;b=0}
      place=abs(25-b-i);
      menstuck=abs(board[b]);
      for(j=b;j!==i;j+=a){
        if(board[j]*a>0){
          diff=abs(j-i);
          addon=place+((board[j]*a>2||j===b)?5:0);
          if((j===b&&menstuck===1)&&(j!==b&&menstuck===0))
            for(k=1;k<diff;k++)
              if(k<7&&diff-k<7&&(board[i+a*k]*a>=0||board[i+a*(diff-k)]>=0))odds(k,diff-k,addon);
          if((j===b||menstuck<2)&&diff<7)odds(diff,0,addon);
        }
        if(j===b&&menstuck>1)break;
      }
      return count();
    }
    /* extra.c */
    function* dble(){
      var resp;
      for(;;){
        writel(' doubles.');
        if(cturn===-pnum){
          if(dblgood()){
            writel('  Declined.\n');
            nexturn();
            cturn*=-2;
            return;
          }
          writel('  Accepted.\n');
          gvalue*=2;
          dlast=cturn;
          gwrite();
          return;
        }
        writel('  Does ');
        writel(cturn===1?color[2]:color[3]);
        writel(' accept?');
        if((resp=yield* yorn(82))===2){
          writel('  Reprint.\n');
          wrboard();
          writel(color[Colorptr]);
          continue;
        }
        if(resp){
          gvalue*=2;
          dlast=cturn;
          gwrite();
          return;
        }
        nexturn();
        cturn*=-2;
        return;
      }
    }
    function dblgood(){
      var n,OFFC=off[offptr],OFFO=off[offopp];
      n=evalb()*cturn;
      if(OFFC>-15||OFFO>-15){
        if(OFFC<0&&OFFO<0){
          OFFC+=15;
          OFFO+=15;
          n+=Math.trunc(((OFFC-OFFO)*7)/2);
        }
        else if(OFFC<0){
          OFFC+=15;
          n-=Math.trunc(OFFO*7/2);
        }
        else if(OFFO<0){
          OFFO+=15;
          n+=Math.trunc(OFFC*7/2);
        }
        if(OFFC<8&&OFFO>8)n-=7;
        if(OFFC<10&&OFFO>10)n-=7;
        if(OFFC<12&&OFFO>12)n-=7;
        if(OFFO<8&&OFFC>8)n+=7;
        if(OFFO<10&&OFFC>10)n+=7;
        if(OFFO<12&&OFFC>12)n+=7;
        n+=Math.trunc(((OFFC-OFFO)*7)/2);
      }
      n-=freemen(bar);
      n+=freemen(home);
      n+=trapped(home,-cturn);
      n-=trapped(bar,cturn);
      if(n>10+rnum(7))return 1;
      return 0;
    }
    function freemen(b){
      var i,inc,lim;
      odds(0,0,0);
      if(board[b]===0)return 0;
      inc=b===0?1:-1;
      lim=b===0?7:18;
      for(i=b+inc;i!==lim;i+=inc)
        if(board[i]*inc<-1)odds(abs(b-i),0,abs(board[b]));
      if(abs(board[b])===1)return Math.trunc((36-count())/5);
      return Math.trunc(count()/5);
    }
    function trapped(n,inc){
      var i,j,k,c,l,ct=0;
      l=n+7*inc;
      for(i=n+inc;i!==l;i+=inc){
        odds(0,0,0);
        c=abs(i-l);
        if(board[i]*inc>0){
          for(j=c;j<13;j++)
            if(board[i+inc*j]*inc<-1){
              if(j<7)odds(j,0,1);
              for(k=1;k<7&&k<j;k++)
                if(j-k<7)odds(k,j-k,1);
            }
          ct+=abs(board[i])*(36-count());
        }
      }
      return Math.trunc(ct/5);
    }
    function evalb(){
      var i,j;
      for(j=i=0;i<26;i++)j+=board[i]>=0?i*board[i]:(25-i)*board[i];
      if(off[1]>=0)j+=25*off[1];
      else j+=25*(off[1]+15);
      if(off[0]>=0)j-=25*off[0];
      else j-=25*(off[0]+15);
      return j;
    }
    /* move.c */
    var checkq=null,ch=0,op=0,pt=0,em=0,frc=0,frp=0,chance=0,openmen=0,points=0,endman=0,barmen=0,menin=0,menoff=0,oldfrc=0,oldfrp=0,cp=zero(5),cg=zero(5),race=0;
    function* move(okay){
      var i,l;
      if(okay){
        if(gvalue<64&&dlast!==cturn&&dblgood()){
          writel(color[Colorptr]);
          yield* dble();
          if(cturn!==1&&cturn!==-1)return;
        }
        yield* roll();
      }
      race=0;
      for(i=0;i<26;i++)if(board[i]<0)l=i;
      for(i=0;i<l;i++)if(board[i]>0)break;
      if(i===l)race=1;
      curmove(cturn===-1?18:19,0);
      writel(color[Colorptr]);
      writel(' rolls ');
      writec(String.fromCharCode(dice[0]+48));
      writec(' ');
      writec(String.fromCharCode(dice[1]+48));
      cline();
      fixtty();
      mvlim=movallow();
      if(mvlim===0){
        writel(' but cannot use it.\n');
        nexturn();
        fixtty();
        return;
      }
      for(i=0;i<4;i++)cp[i]=cg[i]=0;
      trymove(0,0);
      pickmove();
      writel(' and moves ');
      for(i=0;i<mvlim;i++){
        if(i>0)writec(',');
        wrint(p[i]=cp[i]);
        writec('-');
        wrint(g[i]=cg[i]);
        makmove(i);
      }
      writec('.');
      curmove(20,0);
      for(i=0;i<mvlim;i++)if(h[i])wrhit(g[i]);
      nexturn();
      if(!okay)yield* nap(3);
      fixtty();
    }
    function trymove(mvnum,swapped){
      var pos,rval;
      if(mvnum===mvlim){
        binsert(bsave());
        return;
      }
      if(d0===swapped)swap();
      rval=dice[mvnum!==0?1:0];
      for(pos=bar;pos!==home;pos+=cturn){
        if(d0===swapped)swap();
        if(board[bar]!==0&&pos!==bar)break;
        if(board[pos]*cturn<=0)continue;
        p[mvnum]=pos;
        g[mvnum]=pos+rval*cturn;
        if(g[mvnum]*cturn>=home){
          if(off[offptr]<0)break;
          g[mvnum]=home;
        }
        if(makmove(mvnum))continue;
        else trymove(mvnum+1,2);
        backone(mvnum);
      }
      if(!swapped&&dice[0]!==dice[1])trymove(0,1);
    }
    function bsave(){
      var i,now={b_board:board.slice(),b_in:inn.slice(),b_off:off.slice(),b_st:[0,0,0,0],b_fn:[0,0,0,0],b_next:null};
      for(i=0;i<mvlim;i++){
        now.b_st[i]=p[i];
        now.b_fn[i]=g[i];
      }
      return now;
    }
    function binsert(nw){
      var q=checkq,result;
      if(q===null){
        checkq=q=nw;
        q.b_next=null;
        return;
      }
      result=bcomp(nw,q);
      if(result<0){
        nw.b_next=q;
        checkq=nw;
        return;
      }
      if(result===0){
        mvcheck(q,nw);
        return;
      }
      while(q.b_next!==null){
        result=bcomp(nw,q.b_next);
        if(result<0){
          nw.b_next=q.b_next;
          q.b_next=nw;
          return;
        }
        if(result===0){
          mvcheck(q.b_next,nw);
          return;
        }
        q=q.b_next;
      }
      q.b_next=nw;
      nw.b_next=null;
    }
    function bcomp(a,b){
      var i,result;
      for(i=0;i<26;i++){
        result=cturn*(a.b_board[i]-b.b_board[i]);
        if(result)return result;
      }
      return 0;
    }
    function mvcheck(incumbent,candidate){
      var i,result;
      for(i=0;i<mvlim;i++){
        result=cturn*(candidate.b_st[i]-incumbent.b_st[i]);
        if(result>0)return;
        if(result<0)break;
      }
      if(i===mvlim)return;
      for(i=0;i<mvlim;i++){
        incumbent.b_st[i]=candidate.b_st[i];
        incumbent.b_fn[i]=candidate.b_fn[i];
      }
    }
    function pickmove(){
      var now=bsave(),next;
      do{
        bcopy(checkq);
        next=checkq.b_next;
        checkq=next;
        movcmp();
      }while(checkq!==null);
      bcopy(now);
    }
    function bcopy(s){
      var i;
      for(i=0;i<26;i++)board[i]=s.b_board[i];
      for(i=0;i<2;i++){
        inn[i]=s.b_in[i];
        off[i]=s.b_off[i];
      }
      for(i=0;i<mvlim;i++){
        p[i]=s.b_st[i];
        g[i]=s.b_fn[i];
      }
    }
    function movcmp(){
      var i;
      odds(0,0,0);
      if(!race){
        ch=op=pt=0;
        for(i=1;i<25;i++){
          if(board[i]===cturn)ch=canhit(i,1);
          op+=abs(bar-i);
        }
        for(i=bar+cturn;i!==home;i+=cturn)if(board[i]*cturn>1)pt+=abs(bar-i);
        frc=freemen(bar)+trapped(bar,cturn);
        frp=freemen(home)+trapped(home,-cturn);
      }
      for(em=bar;em!==home;em+=cturn)if(board[em]*cturn>0)break;
      em=abs(home-em);
      if((cp[0]===0&&cg[0]===0)||movegood()){
        for(i=0;i<mvlim;i++){
          cp[i]=p[i];
          cg[i]=g[i];
        }
        if(!race){
          chance=ch;
          openmen=op;
          points=pt;
          endman=em;
          barmen=abs(board[home]);
          oldfrc=frc;
          oldfrp=frp;
        }
        menin=inn[inptr];
        menoff=off[offptr];
      }
    }
    function movegood(){
      var n;
      if(off[offptr]===15)return 1;
      if(menoff===15)return 0;
      if(race){
        if(off[offptr]-menoff)return off[offptr]>menoff;
        if(endman-em)return endman>em;
        if(menin===15)return 0;
        if(inn[inptr]===15)return 1;
        if(inn[inptr]-menin)return inn[inptr]>menin;
        return rnum(2);
      }
      n=barmen-abs(board[home]);
      if(abs(chance-ch)+25*n>rnum(150))return n?n<0:ch<chance;
      if(off[offptr]-menoff)return off[offptr]>menoff;
      if(abs(openmen-op)>7+rnum(12))return openmen>op;
      if(n)return n<0;
      if(abs(endman-em)>rnum(2))return endman>em;
      if(abs(frc-oldfrc)>rnum(2))return frc<oldfrc;
      if(abs(n=pt-points)>rnum(4))return n>0;
      if(inn[inptr]-menin)return inn[inptr]>menin;
      if(abs(frp-oldfrp)>rnum(2))return frp>oldfrp;
      return rnum(2);
    }
    /* check.c */
    function* getmove(){
      var i,c=0;
      for(;;){
        i=yield* checkmove(c);
        switch(i){
          case -1:
            if(movokay(mvlim)){
              curmove(20,0);
              for(i=0;i<mvlim;i++)if(h[i])wrhit(g[i]);
              nexturn();
              if(off[offopp]===15)cturn*=-2;
              if(pnum)bflag=pnum;
              return;
            }
          /* falls through */
          case -4:case 0:
            refresh();
            if(i!==0&&i!==-4)break;
            curmove(20,0);
            writel(color[Colorptr]);
            if(i===-4)writel(' must make ');
            else writel(' can only make ');
            writec(String.fromCharCode(mvlim+48));
            writel(' move');
            if(mvlim>1)writec('s');
            writec('.');
            writec('\n');
            break;
          case -3:
            if(yield* quit())return;
        }
        curmove(cturn===-1?18:19,39);
        cline();
        c=-1;
      }
    }
    function movokay(mv){
      var i,m;
      if(d0)swap();
      for(i=0;i<mv;i++){
        if(p[i]===g[i]){
          moverr(i);
          curmove(20,0);
          writel('Attempt to move to same location.\n');
          return 0;
        }
        if(cturn*(g[i]-p[i])<0){
          moverr(i);
          curmove(20,0);
          writel('Backwards move.\n');
          return 0;
        }
        if(abs(board[bar])&&p[i]!==bar){
          moverr(i);
          curmove(20,0);
          writel('Men still on bar.\n');
          return 0;
        }
        if((m=makmove(i))){
          moverr(i);
          switch(m){
            case 1:writel('Move not rolled.\n');break;
            case 2:writel('Bad starting position.\n');break;
            case 3:writel('Destination occupied.\n');break;
            case 4:writel("Can't remove men yet.\n");break;
          }
          return 0;
        }
      }
      return 1;
    }
    /* table.c */
    function* checkmove(ist){
      var j,n,c;
      domove:for(;;){
        if(ist===0){
          curmove(curr,32);
          writel('Move:  ');
        }
        ist=mvl=ncin=0;
        for(j=0;j<5;j++)p[j]=g[j]=-1;
        for(;;){
          c=yield* readc();
          if(c===83){
            raflag=0;
            yield* save(1);
            curmove(cturn===-1?18:19,39);
            ist=-1;
            continue domove;
          }
          if(c===ERASE&&ncin>0){
            curmove(curr,curc-1);
            ncin--;
            n=yield* rsetbrd();
            if(n===0){
              n=-1;
              refresh();
            }
            if((ist=n)>0)continue;
            continue domove;
          }
          if(c===KILL&&ncin>0){
            refresh();
            curmove(curr,39);
            ist=-1;
            continue domove;
          }
          n=yield* dotable(c,ist);
          if(n>=0){
            cin[ncin++]=c;
            if(n>2&&c!==10)writec(String.fromCharCode(c));
            ist=n;
            if(n)continue;
            continue domove;
          }
          if(n===-1&&mvl>=mvlim)return 0;
          if(n===-1&&mvl<mvlim-1)return -4;
          if(n===-6){
            if(movokay(mvl+1)){
              refresh();
              movback(mvl+1);
            }
            else curmove(cturn===-1?18:19,ncin+39);
            ist=n=yield* rsetbrd();
            continue;
          }
          if(n!==-5)return n;
        }
      }
    }
    /* text.c */
    function* text(t){
      var k,i;
      fixtty();
      for(k=0;k<t.length;k++){
        if(t[k].length){
          writel(t[k]);
          writec('\n');
        }
        else{
          writel('-->');
          fixtty();
          while((i=yield* readc())!==32&&i!==10);
          fixtty();
          clear();
        }
      }
      fixtty();
    }
    /* subs.c */
    function* quit(){
      curmove(20,0);
      clend();
      writel('Are you sure you want to quit?');
      if(yield* yorn(0)){
        if(rfl){
          writel('Would you like to save this game?');
          if(yield* yorn(0))yield* save(0);
        }
        cturn=0;
        return 1;
      }
      return 0;
    }
    function* yorn(special){
      var c,i=1;
      while((c=yield* readc())!==89&&c!==78){
        if(special&&c===special)return 2;
        if(i){
          if(special){
            writel('  (Y, N, or ');
            writec(String.fromCharCode(special));
            writec(')');
          }
          else writel('  (Y or N)');
          i=0;
        }
      }
      if(c===89)writel('  Yes.\n');
      else writel('  No.\n');
      return c===89?1:0;
    }
    function* roll(){
      var c,row,col;
      if(iroll){
        row=curr;
        col=curc;
        curmove(17,0);
        writel('ROLL: ');
        c=yield* readc();
        if(c!==10){
          while(c<49||c>54)c=yield* readc();
          dice[0]=c-48;
          writec(' ');
          writec(String.fromCharCode(c));
          c=yield* readc();
          while(c<49||c>54)c=yield* readc();
          dice[1]=c-48;
          writec(' ');
          writec(String.fromCharCode(c));
          curmove(17,0);
          cline();
          curmove(row,col);
          return;
        }
        curmove(17,0);
        cline();
        curmove(row,col);
      }
      dice[0]=rnum(6)+1;
      dice[1]=rnum(6)+1;
      d0=0;
    }
    /* save.c */
    function* save(n){
      var fname,c;
      if(n){
        curmove(20,0);
        clend();
        writel('Are you sure you want to leave now?');
        if(!(yield* yorn(0)))return;
      }
      cflag=1;
      for(;;){
        writel('Enter a file name:  ');
        fname='';
        while((c=yield* readc())!==10){
          if(c===ERASE){
            if(fname.length){
              fname=fname.slice(0,-1);
              curmove(curr,curc-1);
            }
            continue;
          }
          fname+=String.fromCharCode(c);
          writec(String.fromCharCode(c));
        }
        if(fname===''){
          writel("\nCan't use ");
          writel(fname);
          writel('.\n');
          cflag=1;
          continue;
        }
        if(P.saved('backgammon/'+fname)===null)break;
        curmove(18,0);
        clend();
        writel("The file '");
        writel(fname);
        writel("' already exists.\nAre you sure you want to use this file?");
        cflag=0;
        if(yield* yorn(0))break;
        cflag=1;
      }
      if(P.save('backgammon/'+fname,{board:board.slice(),off:off.slice(),inn:inn.slice(),dice:dice.slice(),cturn:cturn,dlast:dlast,pnum:pnum,rscore:rscore,wscore:wscore,gvalue:gvalue,raflag:raflag})===false){
        writel("\nCan't use ");
        writel(fname);
        writel('.\n');
      }
      curmove(18,0);
      writel("This game has been saved on the file '");
      writel(fname);
      writel('\'.\nType "backgammon ');
      writel(fname);
      writel('" to recover your game.\n\n');
      clend();
      getout();
    }
    /* main.c */
    function setsides(){
      if(cturn===1){
        home=25;bar=0;inptr=1;inopp=0;offptr=1;offopp=0;Colorptr=1;colorptr=3;
      }
      else{
        home=0;bar=25;inptr=0;inopp=1;offptr=0;offopp=1;Colorptr=0;colorptr=2;
      }
    }
    function* main(){
      var i,l,c,pw,pbuf;
      if(saved_){
        board=saved_.board.slice();off=saved_.off.slice();inn=saved_.inn.slice();dice=saved_.dice.slice();cturn=saved_.cturn;dlast=saved_.dlast;pnum=saved_.pnum;
        rscore=saved_.rscore;wscore=saved_.wscore;gvalue=saved_.gvalue;raflag=saved_.raflag;
      }
      begscr=0;
      srandom(randstate);
      clear();
      fixtty();
      if((rfl=rflag)){
        yield* text(message_);
        yield* text(contin);
        wrboard();
        if(cturn===0)rflag=0;
      }
      else{
        rscore=wscore=0;
        yield* text(message_);
        if(aflag){
          writel('\nDo you want the rules of the game?');
          if(yield* yorn(0))throw {teach:true};
          writel('Do you need instructions for this program?');
          if(yield* yorn(0)){
            clear();
            yield* text(instr);
          }
        }
        init();
        if(pnum===2){
          writec('\n');
          writel("Enter 'r' to play red, 'w' to play white, 'b' to play both:");
          while(pnum===2){
            c=yield* readc();
            switch(c){
              case 82:pnum=-1;break;
              case 87:pnum=1;break;
              case 66:pnum=0;break;
              case 80:
                if(iroll)break;
                curmove(curr,0);
                writel('Password:');
                cflag=1;
                pbuf=[];
                for(i=0;i<10;i++){
                  pbuf[i]=yield* readc();
                  if(pbuf[i]===10)break;
                }
                if(i===10)while((yield* readc())!==10);
                cflag=0;
                if(i<10)pbuf[i]=0;
                pw='losfurng';
                for(i=0;i<9;i++)if((pbuf[i]||0)!==(i<8?pw.charCodeAt(i):0))getout();
                iroll=1;
                curmove(curr,0);
                writel("Enter 'r' to play red, 'w' to play white, 'b' to play both:");
                break;
            }
          }
        }
        else if(!aflag)yield* text(contin);
        wrboard();
        curmove(18,0);
      }
      begscr=17;
      for(;;){
        if(!rflag||raflag)yield* roll();
        if(!rflag){
          curmove(17,0);
          while(dice[0]===dice[1])yield* roll();
          writel('Red rolls a ');
          writec(String.fromCharCode(dice[0]+48));
          writel('.  White rolls a ');
          writec(String.fromCharCode(dice[1]+48));
          if(dice[0]>dice[1]){
            writel('.  Red starts.\n');
            cturn=1;
          }
          else{
            writel('.  White starts.\n');
            cturn=-1;
          }
        }
        setsides();
        if(!(rflag&&raflag)){
          if(cturn===pnum)yield* move(0);
          else{
            mvlim=movallow();
            curmove(cturn===-1?18:19,0);
            proll();
            yield* getmove();
          }
        }
        curmove(17,0);
        cline();
        begscr=18;
        rflag=0;
        while(cturn===1||cturn===-1){
          refresh();
          if(cturn===pnum){
            yield* move(1);
            if(cturn===-2||cturn===2)break;
            if(off[offopp]===15){
              cturn*=-2;
              break;
            }
            continue;
          }
          if(hflag){
            curmove(20,0);
            clend();
            hflag=1;
          }
          if(dlast!==cturn&&gvalue<64){
            curmove(cturn===-1?18:19,0);
            writel(color[Colorptr]);
            c=yield* readc();
            switch(c){
              case 82:wrboard();break;
              case 83:
                raflag=1;
                yield* save(1);
                break;
              case 81:yield* quit();break;
              case 68:yield* dble();break;
              case 32:case 10:
                yield* roll();
                writel(' rolls ');
                writec(String.fromCharCode(dice[0]+48));
                writec(' ');
                writec(String.fromCharCode(dice[1]+48));
                writel('.  ');
                if((mvlim=movallow())===0){
                  writel('Too bad, ');
                  writel(color[colorptr]);
                  writel(' is unable to use that roll.\n');
                  if(pnum)yield* nap(MVPAUSE);
                  nexturn();
                  break;
                }
                yield* getmove();
                hflag=1;
                break;
              default:
                curmove(20,0);
                yield* text(helpm);
                curmove(cturn===-1?18:19,0);
                hflag=0;
            }
          }
          else{
            yield* roll();
            curmove(cturn===-1?18:19,0);
            proll();
            if((mvlim=movallow())===0){
              writel('.  Too bad, ');
              writel(color[colorptr]);
              writel(" can't move.\n");
              yield* nap(MVPAUSE);
              nexturn();
              continue;
            }
            yield* getmove();
          }
        }
        if(cturn===0)break;
        cturn=Math.trunc(cturn/-2);
        refresh();
        var mflag=0;
        l=bar+7*cturn;
        for(i=bar;i!==l;i+=cturn)if(board[i]*cturn)mflag++;
        curmove(20,0);
        if(off[offopp]===15){
          if(mflag){
            writel('Backgammon!  ');
            gvalue*=3;
          }
          else if(off[offptr]<=0){
            writel('Gammon!  ');
            gvalue*=2;
          }
        }
        if(cturn===-1){
          writel('Red wins ');
          rscore+=gvalue;
        }
        else{
          writel('White wins ');
          wscore+=gvalue;
        }
        wrint(gvalue);
        writel(' point');
        if(gvalue>1)writec('s');
        writel('.\n');
        wrscore();
        writel('.\nWould you like to play again?');
        if((i=yield* yorn(83))===0)break;
        init();
        if(i===2){
          writel('  Save.\n');
          cturn=0;
          yield* save(0);
        }
        wrboard();
      }
      if(rfl&&cturn){
        writel('Would you like to save this game?');
        if(yield* yorn(0)){
          init();
          cturn=0;
          yield* save(0);
        }
      }
      getout();
    }
    var game=main(),over=false,napping=false,queued=[];
    function end(teach){
      over=true;
      S.close();
      finish_();
      if(!teach)return;
      if(P.cmds&&P.cmds.teachgammon)P.cmds.teachgammon([args],'teachgammon '+args,args?['teachgammon',args]:['teachgammon']);
      else P.typeLine('Teachgammon not available!','err');
    }
    function step(v){
      var r;
      try{r=game.next(v)}
      catch(e){
        if(e===EXIT){end(false);return}
        if(e&&e.teach){end(true);return}
        throw e;
      }
      if(r.done){end(false);return}
      view();
      if(r.value&&r.value.nap){
        napping=true;
        setTimeout(function(){
          napping=false;
          step();
          while(!napping&&!over&&queued.length)step(queued.shift());
        },r.value.nap*1000);
      }
    }
    var api={
      feed:function(k){
        if(over)return;
        var c=k==='C-c'?-3:k==='Enter'?13:k==='Backspace'?ERASE:k==='Tab'?9:k==='Escape'?27:k.length===1?k.charCodeAt(0):/^C-[a-z]$/.test(k)?k.charCodeAt(2)-96:-1;
        if(c===-1||c>127)return;
        if(napping)queued.push(c);
        else step(c);
      },
      draw:view,
      resize:function(){if(!over)view()}
    };
    step();
    if(!over)view();
    return api;
  },{tty:'backgammon',fit:[CO,LI]});
}});
})(window.Phosphor);
