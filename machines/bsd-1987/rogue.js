/* PHOSPHOR-9 terminal: machine "bsd-1987", the game rogue.
   Ported to JavaScript for this terminal from the C of Rogue 5.4.4, with the routines, their names
   and their order of play kept, on a little curses of its own. It keeps this notice, and may be
   used under its terms.

Rogue: Exploring the Dungeons of Doom
Copyright (C) 1980-1983, 1985, 1999 Michael Toy, Ken Arnold and Glenn Wichman
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions
are met:
1. Redistributions of source code must retain the above copyright
   notice, this list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright
   notice, this list of conditions and the following disclaimer in the
   documentation and/or other materials provided with the distribution.
3. Neither the name(s) of the author(s) nor the names of other contributors
   may be used to endorse or promote products derived from this software
   without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE AUTHOR(S) AND CONTRIBUTORS ``AS IS'' AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED.  IN NO EVENT SHALL THE AUTHOR(S) OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS
OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
SUCH DAMAGE.

Portions of this software (state.c, mdport.c) are based on the work
of Nicholas J. Kisseberth. Used under license:

Copyright (C) 1999, 2000, 2005 Nicholas J. Kisseberth
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions
are met:
1. Redistributions of source code must retain the above copyright
   notice, this list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright
   notice, this list of conditions and the following disclaimer in the
   documentation and/or other materials provided with the distribution.
3. Neither the name(s) of the author(s) nor the names of other contributors
   may be used to endorse or promote products derived from this software
   without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE AUTHOR(S) AND CONTRIBUTORS ``AS IS'' AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED.  IN NO EVENT SHALL THE AUTHOR(S) OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS
OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
SUCH DAMAGE.
*/
(function(P){
'use strict';

/* ---------- things the C gets from rogue.h ---------- */
var MAXROOMS=9,MAXOBJ=9,MAXPACK=23,MAXTRAPS=10,AMULETLEVEL=26,NUMTHINGS=7,MAXPASS=13,NUMLINES=24,NUMCOLS=80,
  STATLINE=NUMLINES-1,BORE_LEVEL=50,MAXSTR=1024,MAXLINES=32,MAXCOLS=80,LINES=NUMLINES,COLS=NUMCOLS;
var NORM=0,QUIT=1,MINUS=2,INV_OVER=0,INV_SLOW=1,INV_CLEAR=2;
var PASSAGE=35,DOOR=43,FLOOR=46,PLAYER=64,TRAP=94,STAIRS=37,GOLD=42,POTION=33,SCROLL=63,MAGIC=36,FOOD=58,
  WEAPON=41,ARMOR=93,AMULET=44,RING=61,STICK=47,CALLABLE=-1,R_OR_S=-2,SPACE=32,VWALL=124,HWALL=45;
/* BEFORE and AFTER are spread(1) and spread(2), and those never roll: rnd(0) touches no seed */
var BEARTIME=3,SLEEPTIME=5,BEFORE=1,AFTER=2,HEALTIME=30,HUHDURATION=20,SEEDURATION=850,HUNGERTIME=1300,
  MORETIME=150,STOMACHSIZE=2000,STARVETIME=850,ESCAPE=27,LEFT=0,RIGHT=1,BOLT_LENGTH=6,LAMPDIST=3;
var VS_POISON=0,VS_MAGIC=3;
var ISDARK=1,ISGONE=2,ISMAZE=4;
var ISCURSED=1,ISKNOW=2,ISMISL=4,ISMANY=8,ISPROT=32;
var CANHUH=1,CANSEE=2,ISBLIND=4,ISCANC=8,ISLEVIT=8,ISFOUND=16,ISGREED=32,ISHASTE=64,ISTARGET=128,ISHELD=256,
  ISHUH=512,ISINVIS=1024,ISMEAN=2048,ISHALU=2048,ISREGEN=4096,ISRUN=8192,SEEMONST=16384,ISFLY=16384,ISSLOW=32768;
var F_PASS=0x80,F_SEEN=0x40,F_DROPPED=0x20,F_REAL=0x10,F_PNUM=0x0f,F_TMASK=0x07;
var T_DOOR=0,T_ARROW=1,T_SLEEP=2,T_BEAR=3,T_TELEP=4,T_DART=5,T_RUST=6,T_MYST=7,NTRAPS=8;
var P_CONFUSE=0,P_LSD=1,P_POISON=2,P_STRENGTH=3,P_SEEINVIS=4,P_HEALING=5,P_MFIND=6,P_TFIND=7,P_RAISE=8,P_XHEAL=9,
  P_HASTE=10,P_RESTORE=11,P_BLIND=12,P_LEVIT=13,MAXPOTIONS=14;
var S_CONFUSE=0,S_MAP=1,S_HOLD=2,S_SLEEP=3,S_ARMOR=4,S_ID_POTION=5,S_ID_SCROLL=6,S_ID_WEAPON=7,S_ID_ARMOR=8,S_ID_R_OR_S=9,
  S_SCARE=10,S_FDET=11,S_TELEP=12,S_ENCH=13,S_CREATE=14,S_REMOVE=15,S_AGGR=16,S_PROTECT=17,MAXSCROLLS=18;
var MACE=0,BOW=2,ARROW=3,DAGGER=4,FLAME=9,MAXWEAPONS=9;
var LEATHER=0,RING_MAIL=1,MAXARMORS=8;
var R_PROTECT=0,R_ADDSTR=1,R_SUSTSTR=2,R_SEARCH=3,R_SEEINVIS=4,R_AGGR=6,R_ADDHIT=7,R_ADDDAM=8,R_REGEN=9,R_DIGEST=10,
  R_TELEPORT=11,R_STEALTH=12,R_SUSTARM=13,MAXRINGS=14;
var WS_LIGHT=0,WS_INVIS=1,WS_ELECT=2,WS_FIRE=3,WS_COLD=4,WS_POLYMORPH=5,WS_MISSILE=6,WS_HASTE_M=7,WS_SLOW_M=8,WS_DRAIN=9,
  WS_NOP=10,WS_TELAWAY=11,WS_TELTO=12,WS_CANCEL=13,MAXSTICKS=14;
var MAXDAEMONS=20,EMPTY=0,DAEMON=-1;
var MAXMSG=NUMCOLS-9,MAXINP=50; /* MAXMSG: NUMCOLS - sizeof "--More--" */
var ERASECH=8,KILLCH=21;        /* this terminal's erase and kill: the backspace key and ^U */
var RELEASE='5.4',VERSION='rogue 31/03/85',NUMSCORES=10,NUMNAME='Ten';

function ord(s){return s.charCodeAt(0)}
function chr(n){return String.fromCharCode(n)}
function CTRL(c){return ord(c)&31}
function isupper(c){return c>=65&&c<=90}
function islower(c){return c>=97&&c<=122}
function isdigit(c){return c>=48&&c<=57}
function isalpha(c){return isupper(c)||islower(c)}
function isprint(c){return c>=32&&c<=126}
function idiv(a,b){return (a/b)|0}
function atoi(s){return parseInt(s,10)||0}
function padl(n,w){return String(n).padStart(w,' ')}
function padr(n,w){return String(n).padEnd(w,' ')}
function unctrl(c){
  c&=255;
  if(c===127)return '^?';
  if(c<32)return '^'+chr(c+64);
  return chr(c);
}

/* ---------- the small part of curses it uses, behaving as curses does: each window remembers what
   has been touched, a refresh copies only that to the screen, and getch refreshes stdscr ---------- */
var ERR=-1,A_STANDOUT=0x100,A_CHARTEXT=0xff,TABSIZE=8;
function newwin(l,c,by,bx){
  var w={lines:l,cols:c,begy:by,begx:bx,y:0,x:0,attr:0,cell:new Uint16Array(l*c).fill(SPACE),
    first:new Int16Array(l).fill(0),last:new Int16Array(l).fill(c-1),clear:false,leave:false,moved:false,wrapped:false};
  return w;
}
function wmove(w,y,x){
  if(y<0||y>=w.lines||x<0||x>=w.cols)return ERR;
  w.y=y;w.x=x;w.wrapped=false;w.moved=true;
  return 0;
}
function changed(w,y,a,b){
  if(w.first[y]<0||a<w.first[y])w.first[y]=a;
  if(b>w.last[y])w.last[y]=b;
}
function forces_scroll(w){ /* the last line does not scroll: true if we are on it, else step down */
  if(w.y===w.lines-1)return true;
  w.y++;
  return false;
}
function wrap_line(w){
  w.wrapped=true;
  if(forces_scroll(w)){w.x=w.cols-1;return ERR}
  w.x=0;
  return 0;
}
function literal(w,c){
  if(w.y<0||w.y>=w.lines||w.x<0||w.x>=w.cols)return ERR;
  changed(w,w.y,w.x,w.x);
  w.cell[w.y*w.cols+w.x]=c|w.attr;
  w.x++;
  if(w.x>w.cols-1)return wrap_line(w);
  return 0;
}
function waddch(w,ch){
  var c=ch&A_CHARTEXT,x,keep=w.attr,r;
  if(w.y<0||w.y>=w.lines||w.x<0||w.x>=w.cols)return ERR;
  if(w.wrapped){
    if(w.x>=w.cols-1)return ERR;
    w.wrapped=false;
  }
  w.attr=keep|(ch&~A_CHARTEXT);
  try{
    switch(c){
      case 9:
        x=w.x+(TABSIZE-(w.x%TABSIZE));
        if(w.y===w.lines-1||x<=w.cols-1){
          while(w.x<x)if(literal(w,SPACE)===ERR)return ERR;
        }
        else{
          wclrtoeol(w);
          w.wrapped=true;
          if(forces_scroll(w))w.x=w.cols-1;
          else w.x=0;
        }
        return 0;
      case 10:
        wclrtoeol(w);
        if(forces_scroll(w))w.x=w.cols-1;
        else w.x=0;
        return 0;
      case 13:
        w.x=0;w.wrapped=false;
        return 0;
      case 8:
        if(w.x===0)return 0;
        w.x--;w.wrapped=false;
        return 0;
    }
    if(c<32||c===127){
      r=unctrl(c);
      for(x=0;x<r.length;x++)if(literal(w,ord(r.charAt(x)))===ERR)return ERR;
      return 0;
    }
    return literal(w,c);
  }
  finally{w.attr=keep}
}
function waddstr(w,s){
  for(var i=0;i<s.length;i++)if(waddch(w,s.charCodeAt(i)&255)===ERR)return ERR;
  return 0;
}
function wclrtoeol(w){
  if(w.wrapped&&w.y<w.lines-1)w.wrapped=false;
  if(w.wrapped||w.y>=w.lines||w.x>=w.cols)return ERR;
  var o=w.y*w.cols;
  w.cell.fill(SPACE,o+w.x,o+w.cols);
  changed(w,w.y,w.x,w.cols-1);
  return 0;
}
function werase(w){
  w.cell.fill(SPACE);
  w.first.fill(0);w.last.fill(w.cols-1);
  w.y=w.x=0;w.wrapped=false;
}
function wclear(w){werase(w);w.clear=true}
function winch(w){return w.cell[w.y*w.cols+w.x]}
function touchwin(w){w.first.fill(0);w.last.fill(w.cols-1)}
function touched(w){for(var i=0;i<w.lines;i++)if(w.first[i]>=0)return true;return false}
function clearok(w,b){w.clear=b}
function leaveok(w,b){w.leave=b}
function CCHAR(c){return c&A_CHARTEXT}
function toascii(c){return c&127}

/* One run of the program: everything in here is what a process image holds, so each game starts clean. */
function Process(S,argv,T){

/* ---------- the screen ---------- */
var stdscr=null,hw=null;
var phys=new Uint16Array(LINES*COLS).fill(SPACE),curscr={y:0,x:0},DIRTY=true;
var EXIT={},SHELL={},out=[],press=false,status_code=0;
function wnoutrefresh(w){
  if(w!==stdscr&&w!==lastwin)fresh=true;
  lastwin=w;
  if(!w.leave){curscr.y=w.y+w.begy;curscr.x=w.x+w.begx}
  w.clear=false;
  for(var y=0;y<w.lines;y++){
    if(w.first[y]>=0){
      var ry=y+w.begy;
      if(ry>=0&&ry<LINES)for(var x=w.first[y];x<=w.last[y];x++){
        var rx=x+w.begx;
        if(rx>=0&&rx<COLS)phys[ry*COLS+rx]=w.cell[y*w.cols+x];
      }
      w.first[y]=-1;w.last[y]=-1;
    }
  }
  w.moved=false;
  DIRTY=true;
}
function wrefresh(w){wnoutrefresh(w)}
function refresh(){wrefresh(stdscr)}
function move(y,x){return wmove(stdscr,y,x)}
function addch(c){return waddch(stdscr,c)}
function addstr(s){return waddstr(stdscr,s)}
function clrtoeol(){return wclrtoeol(stdscr)}
function inch(){return winch(stdscr)}
function clear(){wclear(stdscr)}
function mvaddch(y,x,c){return move(y,x)===ERR?ERR:addch(c)}
function mvaddstr(y,x,s){return move(y,x)===ERR?ERR:addstr(s)}
function mvinch(y,x){return move(y,x)===ERR?ERR:inch()}
function mvwprintw(w,y,x,s){return wmove(w,y,x)===ERR?ERR:waddstr(w,s)}
function standout(){stdscr.attr=A_STANDOUT}
function standend(){stdscr.attr=0}
/* a key; the driver sends it back in. ncurses' wgetch sends a touched stdscr up first, even over another
   window, which on 5.4.4 wipes the top of the list a message came before. The curses of the game's own
   day just reads. T.exact is for comparing with the C built on ncurses. */
function* getch(){
  if((lastwin===stdscr||lastwin===null||(T&&T.exact))&&(touched(stdscr)||stdscr.moved))wrefresh(stdscr);
  return yield 0;
}

/* ---------- extern.c ---------- */
var after=false,again=false,noscore=0,seenstairs=false,amulet=false,door_stop=false,fight_flush=false,firstmove=false,
  got_ltc=false,has_hit=false,in_shell=false,inv_describe=true,jump=false,kamikaze=false,lower_msg=false,move_on=false,
  msg_esc=false,passgo=false,playing=true,q_comm=false,running=false,save_msg=true,see_floor=true,stat_msg=false,
  terse=false,to_death=false,tombstone=true,allscore=false;
var pack_used=[];(function(){for(var i=0;i<27;i++)pack_used.push(false)})();
var dir_ch=0,file_name='',huh='',p_colors=[],prbuf='',r_stones=[],runch=0,s_names=[],take=0,whoami='',ws_made=[],ws_type=[],
  fruit='slime-mold',home='',l_last_comm=0,l_last_dir=0,last_comm=0,last_dir=0;
var inv_t_name=['Overwrite','Slow','Clear'];
var tr_name=['a trapdoor','an arrow trap','a sleeping gas trap','a beartrap','a teleport trap','a poison dart trap','a rust trap','a mysterious trap'];
var n_objs=0,ntraps=0,hungry_state=0,inpack=0,inv_type=0,level=1,max_hit=0,max_level=0,mpos=0,no_food=0;
var a_class=[8,7,7,6,5,4,4,3];
var count=0,food_left=0,lastscore=-1,no_command=0,no_move=0,purse=0,quiet=0,vf_hit=0,dnum=0,seed=0;
var e_levels=[10,20,40,80,160,320,640,1300,2600,5200,13000,26000,50000,100000,200000,400000,800000,2000000,4000000,8000000,0];
var delta={x:0,y:0},oldpos={x:0,y:0},stairs={x:0,y:0},nh={x:0,y:0};
/* the level map; places[] is three arrays here, with the same (x<<5)+y index */
var pl_ch=new Uint8Array(MAXCOLS*MAXLINES).fill(SPACE),pl_fl=new Uint8Array(MAXCOLS*MAXLINES),pl_mo=new Array(MAXCOLS*MAXLINES).fill(null);
function INDEX(y,x){return (x<<5)+y}
/* off the map the C reads whatever is next in memory; here it is solid rock */
function chat(y,x){var v=pl_ch[(x<<5)+y];return v===undefined?SPACE:v}
function setchat(y,x,c){pl_ch[(x<<5)+y]=c}
function flat(y,x){var v=pl_fl[(x<<5)+y];return v===undefined?0:v}
function setflat(y,x,f){pl_fl[(x<<5)+y]=f}
function moat(y,x){var v=pl_mo[(x<<5)+y];return v===undefined?null:v}
function setmoat(y,x,m){var i=(x<<5)+y;if(i>=0&&i<pl_mo.length)pl_mo[i]=m}
function winat(y,x){var m=moat(y,x);return m!==null?m.t_disguise:chat(y,x)}
function ce(a,b){return a.x===b.x&&a.y===b.y}
function cp(d,s){d.x=s.x;d.y=s.y}
function on(t,f){return (t.t_flags&f)!==0}
function GOLDCALC(){return rnd(50+10*level)+2}
function ISRING(h,r){return cur_ring[h]!==null&&cur_ring[h].o_which===r}
function ISWEARING(r){return ISRING(LEFT,r)||ISRING(RIGHT,r)}
function ISMULT(t){return t===POTION||t===SCROLL||t===FOOD}

function mkstats(){return {s_str:0,s_exp:0,s_lvl:0,s_arm:0,s_hpt:0,s_dmg:'',s_maxhp:0}}
function setstats(d,s){d.s_str=s.s_str;d.s_exp=s.s_exp;d.s_lvl=s.s_lvl;d.s_arm=s.s_arm;d.s_hpt=s.s_hpt;d.s_dmg=s.s_dmg;d.s_maxhp=s.s_maxhp}
/* THING is a union in the C; here one shape with both sets of fields */
function new_item(){
  return {l_next:null,l_prev:null,t_pos:{x:0,y:0},t_turn:false,t_type:0,t_disguise:0,t_oldch:0,t_dest:null,t_flags:0,
    t_stats:mkstats(),t_room:null,t_pack:null,t_reserved:0,
    o_type:0,o_pos:{x:0,y:0},o_launch:0,o_packch:0,o_damage:'',o_hurldmg:'',o_count:0,o_which:0,o_hplus:0,o_dplus:0,
    o_arm:0,o_flags:0,o_group:0,o_label:null};
}
var cur_armor=null,cur_ring=[null,null],cur_weapon=null,l_last_pick=null,last_pick=null,lvl_obj=null,mlist=null,player=new_item();
var hero=player.t_pos,pstats=player.t_stats;
var max_stats={s_str:16,s_exp:0,s_lvl:1,s_arm:10,s_hpt:12,s_dmg:'1x4',s_maxhp:12};
function mkroom(fl){
  var r={r_pos:{x:0,y:0},r_max:{x:0,y:0},r_gold:{x:0,y:0},r_goldval:0,r_flags:fl,r_nexits:0,r_exit:[]};
  for(var i=0;i<12;i++)r.r_exit.push({x:0,y:0});
  return r;
}
var oldrp=null,rooms=[],passages=[];
(function(){
  var i;
  for(i=0;i<MAXROOMS;i++)rooms.push(mkroom(0));
  for(i=0;i<12;i++)passages.push(mkroom(ISGONE|ISDARK));
  passages.push(mkroom(0)); /* the C's initializer stops one short */
})();
/* a room can in principle collect more exits than the array holds; the C then runs into the next room */
function exit_at(rp,n){return rp.r_exit[n]||(rp.r_exit[n]={x:0,y:0})}

function mon(name,carry,fl,exp,lvl,arm,dmg){return {m_name:name,m_carry:carry,m_flags:fl,m_stats:{s_str:10,s_exp:exp,s_lvl:lvl,s_arm:arm,s_hpt:1,s_dmg:dmg,s_maxhp:0}}}
var monsters=[
  mon('aquator',0,ISMEAN,20,5,2,'0x0/0x0'),
  mon('bat',0,ISFLY,1,1,3,'1x2'),
  mon('centaur',15,0,17,4,4,'1x2/1x5/1x5'),
  mon('dragon',100,ISMEAN,5000,10,-1,'1x8/1x8/3x10'),
  mon('emu',0,ISMEAN,2,1,7,'1x2'),
  mon('venus flytrap',0,ISMEAN,80,8,3,'%%%x0'),
  mon('griffin',20,ISMEAN|ISFLY|ISREGEN,2000,13,2,'4x3/3x5'),
  mon('hobgoblin',0,ISMEAN,3,1,5,'1x8'),
  mon('ice monster',0,0,5,1,9,'0x0'),
  mon('jabberwock',70,0,3000,15,6,'2x12/2x4'),
  mon('kestrel',0,ISMEAN|ISFLY,1,1,7,'1x4'),
  mon('leprechaun',0,0,10,3,8,'1x1'),
  mon('medusa',40,ISMEAN,200,8,2,'3x4/3x4/2x5'),
  mon('nymph',100,0,37,3,9,'0x0'),
  mon('orc',15,ISGREED,5,1,6,'1x8'),
  mon('phantom',0,ISINVIS,120,8,3,'4x4'),
  mon('quagga',0,ISMEAN,15,3,3,'1x5/1x5'),
  mon('rattlesnake',0,ISMEAN,9,2,3,'1x6'),
  mon('snake',0,ISMEAN,2,1,5,'1x3'),
  mon('troll',50,ISREGEN|ISMEAN,120,6,4,'1x8/1x8/2x6'),
  mon('black unicorn',0,ISMEAN,190,7,-2,'1x9/1x9/2x9'),
  mon('vampire',20,ISREGEN|ISMEAN,350,8,1,'1x10'),
  mon('wraith',0,0,55,5,4,'1x6'),
  mon('xeroc',30,0,100,7,7,'4x4'),
  mon('yeti',30,0,50,4,6,'1x6/1x6'),
  mon('zombie',0,ISMEAN,6,2,8,'1x8')
];
function oi(name,prob,worth){return {oi_name:name,oi_prob:prob,oi_worth:worth||0,oi_guess:null,oi_know:false}}
var things=[oi(null,26),oi(null,36),oi(null,16),oi(null,7),oi(null,7),oi(null,4),oi(null,4)];
var arm_info=[oi('leather armor',20,20),oi('ring mail',15,25),oi('studded leather armor',15,20),oi('scale mail',13,30),
  oi('chain mail',12,75),oi('splint mail',10,80),oi('banded mail',10,90),oi('plate mail',5,150)];
var pot_info=[oi('confusion',7,5),oi('hallucination',8,5),oi('poison',8,5),oi('gain strength',13,150),oi('see invisible',3,100),
  oi('healing',13,130),oi('monster detection',6,130),oi('magic detection',6,105),oi('raise level',2,250),oi('extra healing',5,200),
  oi('haste self',5,190),oi('restore strength',13,130),oi('blindness',5,5),oi('levitation',6,75)];
var ring_info=[oi('protection',9,400),oi('add strength',9,400),oi('sustain strength',5,280),oi('searching',10,420),
  oi('see invisible',10,310),oi('adornment',1,10),oi('aggravate monster',10,10),oi('dexterity',8,440),oi('increase damage',8,400),
  oi('regeneration',4,460),oi('slow digestion',9,240),oi('teleportation',5,30),oi('stealth',7,470),oi('maintain armor',5,380)];
var scr_info=[oi('monster confusion',7,140),oi('magic mapping',4,150),oi('hold monster',2,180),oi('sleep',3,5),oi('enchant armor',7,160),
  oi('identify potion',10,80),oi('identify scroll',10,80),oi('identify weapon',6,80),oi('identify armor',7,100),
  oi('identify ring, wand or staff',10,115),oi('scare monster',3,200),oi('food detection',2,60),oi('teleportation',5,165),
  oi('enchant weapon',8,150),oi('create monster',4,75),oi('remove curse',7,105),oi('aggravate monsters',3,20),oi('protect armor',2,250)];
var weap_info=[oi('mace',11,8),oi('long sword',11,15),oi('short bow',12,15),oi('arrow',12,1),oi('dagger',8,3),oi('two handed sword',10,75),
  oi('dart',12,2),oi('shuriken',12,5),oi('spear',12,5),oi(null,0)];
var ws_info=[oi('light',12,250),oi('invisibility',6,5),oi('lightning',3,330),oi('fire',3,330),oi('cold',3,330),oi('polymorph',15,310),
  oi('magic missile',10,170),oi('haste monster',10,5),oi('slow monster',11,350),oi('drain life',9,300),oi('nothing',1,5),
  oi('teleport away',6,340),oi('teleport to',6,50),oi('cancellation',5,280)];
function hl(ch,d,p){return {h_ch:typeof ch==='string'?ord(ch):ch,h_desc:d,h_print:p}}
var helpstr=[hl('?','\tprints help',true),hl('/','\tidentify object',true),hl('h','\tleft',true),hl('j','\tdown',true),hl('k','\tup',true),
  hl('l','\tright',true),hl('y','\tup & left',true),hl('u','\tup & right',true),hl('b','\tdown & left',true),hl('n','\tdown & right',true),
  hl('H','\trun left',false),hl('J','\trun down',false),hl('K','\trun up',false),hl('L','\trun right',false),hl('Y','\trun up & left',false),
  hl('U','\trun up & right',false),hl('B','\trun down & left',false),hl('N','\trun down & right',false),
  hl(CTRL('H'),'\trun left until adjacent',false),hl(CTRL('J'),'\trun down until adjacent',false),hl(CTRL('K'),'\trun up until adjacent',false),
  hl(CTRL('L'),'\trun right until adjacent',false),hl(CTRL('Y'),'\trun up & left until adjacent',false),hl(CTRL('U'),'\trun up & right until adjacent',false),
  hl(CTRL('B'),'\trun down & left until adjacent',false),hl(CTRL('N'),'\trun down & right until adjacent',false),
  hl(0,'\t<SHIFT><dir>: run that way',true),hl(0,'\t<CTRL><dir>: run till adjacent',true),
  hl('f','<dir>\tfight till death or near death',true),hl('t','<dir>\tthrow something',true),hl('m','<dir>\tmove onto without picking up',true),
  hl('z','<dir>\tzap a wand in a direction',true),hl('^','<dir>\tidentify trap type',true),hl('s','\tsearch for trap/secret door',true),
  hl('>','\tgo down a staircase',true),hl('<','\tgo up a staircase',true),hl('.','\trest for a turn',true),hl(',','\tpick something up',true),
  hl('i','\tinventory',true),hl('I','\tinventory single item',true),hl('q','\tquaff potion',true),hl('r','\tread scroll',true),hl('e','\teat food',true),
  hl('w','\twield a weapon',true),hl('W','\twear armor',true),hl('T','\ttake armor off',true),hl('P','\tput on ring',true),hl('R','\tremove ring',true),
  hl('d','\tdrop object',true),hl('c','\tcall object',true),hl('a','\trepeat last command',true),hl(')','\tprint current weapon',true),
  hl(']','\tprint current armor',true),hl('=','\tprint current rings',true),hl('@','\tprint current stats',true),hl('D',"\trecall what's been discovered",true),
  hl('o','\texamine/set options',true),hl(CTRL('R'),'\tredraw screen',true),hl(CTRL('P'),'\trepeat last message',true),hl(ESCAPE,'\tcancel command',true),
  hl('S','\tsave game',true),hl('Q','\tquit',true),hl('!','\tshell escape',true),hl('F','<dir>\tfight till either of you dies',true),hl('v','\tprint version number',true)];

/* ---------- main.c ---------- */
function premain(){
  home=P.st.home.replace(/\/$/,'')+'/';
  file_name=home+'rogue.save';
  var env=P.env.ROGUEOPTS;
  if(typeof env==='string')parse_opts(env);
  if(typeof env!=='string'||whoami==='')whoami=strucpy(P.st.user,P.st.user.length);
  dnum=(Math.floor(Date.now()/1000)+Math.floor(Math.random()*30000))|0;
  if(T&&T.seed!==undefined)dnum=T.seed|0;
  seed=dnum;
}
function initscr(){
  stdscr=newwin(LINES,COLS,0,0);
  clearok(stdscr,false);
}
function* main(){
  if(argv.length===1&&argv[0]==='-d'){
    dnum=rnd(100);	/* throw away some rnd()s to break patterns */
    while(--dnum>0)rnd(100);	/* a first roll of 0 would never count down here: the C's int wraps */
    purse=rnd(100)+1;
    level=rnd(100)+1;
    initscr();
    hw=newwin(LINES,COLS,0,0);
    yield* death(death_monst());
    my_exit(0);
  }
  if(argv.length===1){
    if(!(yield* restore(argv[0])))my_exit(1);
  }
  initscr();
  init_probs();
  init_player();
  if(T&&T.god){player.t_stats.s_hpt=player.t_stats.s_maxhp=T.god} /* the harness's indestructible hero, for the deep levels */
  init_names();
  init_colors();
  init_stones();
  init_materials();
  hw=newwin(LINES,COLS,0,0);
  yield* new_level();
  start_daemon(runners,0,AFTER);
  start_daemon(doctor,0,AFTER);
  fuse(swander,0,spread(70),AFTER);
  start_daemon(stomach,0,AFTER);
  yield* playit();
}
function* endit(){yield* fatal('Okay, bye bye!\n')}
function* fatal(s){
  mvaddstr(LINES-2,0,s);
  refresh();
  my_exit(0);
}
function RN(){
  seed=(Math.imul(seed,11109)+13849)|0;
  return (seed>>16)&0xffff;
}
function rnd(range){return range===0?0:Math.abs(RN())%range}
function roll(number,sides){
  var dtotal=0;
  while(number--)dtotal+=rnd(sides)+1;
  return dtotal;
}
function* playit(){
  /* slow terminals */
  var b=P.baud?P.baud():0;
  if(b&&b<=1200){
    terse=true;
    jump=true;
    see_floor=false;
  }
  inv_type=INV_CLEAR; /* md_hasclreol: this terminal can */
  var opts=P.env.ROGUEOPTS;
  if(typeof opts==='string')parse_opts(opts);
  cp(oldpos,hero);
  oldrp=roomin(hero);
  while(playing)yield* command();
  yield* endit();
}
function* quit(){
  var oy,ox;
  if(!q_comm)mpos=0;
  oy=curscr.y;ox=curscr.x;
  yield* msg('really quit?');
  if((yield* readchar())===ord('y')){
    clear();
    mvaddstr(LINES-2,0,'You quit with '+purse+' gold pieces');
    move(LINES-1,0);
    refresh();
    yield* end_score(purse,1,0);
    my_exit(0);
  }
  else{
    move(0,0);
    clrtoeol();
    yield* status();
    move(oy,ox);
    refresh();
    mpos=0;
    count=0;
    to_death=false;
  }
}
/* the machine's own shell, on the terminal, until "exit"; the driver closes the glass and comes back */
function* shell(){
  move(LINES-1,0);
  refresh();
  in_shell=true;
  after=false;
  yield SHELL;
  in_shell=false;
  clearok(stdscr,true);
}
function my_exit(st){status_code=st;throw EXIT}

/* ---------- init.c ---------- */
function init_player(){
  var obj;
  setstats(pstats,max_stats);
  food_left=HUNGERTIME;
  obj=new_item();
  obj.o_type=FOOD;
  obj.o_count=1;
  add_pack_silent(obj);
  obj=new_item();
  obj.o_type=ARMOR;
  obj.o_which=RING_MAIL;
  obj.o_arm=a_class[RING_MAIL]-1;
  obj.o_flags|=ISKNOW;
  obj.o_count=1;
  cur_armor=obj;
  add_pack_silent(obj);
  obj=new_item();
  init_weapon(obj,MACE);
  obj.o_hplus=1;
  obj.o_dplus=1;
  obj.o_flags|=ISKNOW;
  add_pack_silent(obj);
  cur_weapon=obj;
  obj=new_item();
  init_weapon(obj,BOW);
  obj.o_hplus=1;
  obj.o_flags|=ISKNOW;
  add_pack_silent(obj);
  obj=new_item();
  init_weapon(obj,ARROW);
  obj.o_count=rnd(15)+25;
  obj.o_flags|=ISKNOW;
  add_pack_silent(obj);
}
/* add_pack(obj,TRUE) with a new pack can't reach a message: run its generator straight through */
function add_pack_silent(obj){var g=add_pack(obj,true),r=g.next();if(!r.done)throw new Error('add_pack blocked')}
var rainbow=['amber','aquamarine','black','blue','brown','clear','crimson','cyan','ecru','gold','green','grey','magenta','orange','pink','plaid',
  'purple','red','silver','tan','tangerine','topaz','turquoise','vermilion','violet','white','yellow'];
var NCOLORS=rainbow.length;
var sylls=['a','ab','ag','aks','ala','an','app','arg','arze','ash','bek','bie','bit','bjor','blu','bot','bu','byt','comp','con','cos','cre','dalf','dan',
  'den','do','e','eep','el','eng','er','ere','erk','esh','evs','fa','fid','fri','fu','gan','gar','glen','gop','gre','ha','hyd','i','ing','ip','ish','it',
  'ite','iv','jo','kho','kli','klis','la','lech','mar','me','mi','mic','mik','mon','mung','mur','nej','nelg','nep','ner','nes','nes','nih','nin','o','od',
  'ood','org','orn','ox','oxy','pay','ple','plu','po','pot','prok','re','rea','rhov','ri','ro','rog','rok','rol','sa','san','sat','sef','seh','shu','ski',
  'sna','sne','snik','sno','so','sol','sri','sta','sun','ta','tab','tem','ther','ti','tox','trol','tue','turs','u','ulk','um','un','uni','ur','val','viv',
  'vly','vom','wah','wed','werg','wex','whon','wun','xo','y','yot','yu','zant','zeb','zim','zok','zon','zum'];
var stones=[['agate',25],['alexandrite',40],['amethyst',50],['carnelian',40],['diamond',300],['emerald',300],['germanium',225],['granite',5],['garnet',50],
  ['jade',150],['kryptonite',300],['lapis lazuli',50],['moonstone',50],['obsidian',15],['onyx',60],['opal',200],['pearl',220],['peridot',63],['ruby',350],
  ['sapphire',285],['stibotantalite',200],['tiger eye',50],['topaz',60],['turquoise',70],['taaffeite',300],['zircon',80]];
var NSTONES=stones.length;
var wood=['avocado wood','balsa','bamboo','banyan','birch','cedar','cherry','cinnibar','cypress','dogwood','driftwood','ebony','elm','eucalyptus','fall',
  'hemlock','holly','ironwood','kukui wood','mahogany','manzanita','maple','oaken','persimmon wood','pecan','pine','poplar','redwood','rosewood','spruce',
  'teak','walnut','zebrawood'];
var NWOOD=wood.length;
var metal=['aluminum','beryllium','bone','brass','bronze','copper','electrum','gold','iron','lead','magnesium','mercury','nickel','pewter','platinum','steel',
  'silver','silicon','tin','titanium','tungsten','zinc'];
var NMETAL=metal.length;
var used=[];
function init_colors(){
  var i,j;
  for(i=0;i<NCOLORS;i++)used[i]=false;
  for(i=0;i<MAXPOTIONS;i++){
    do j=rnd(NCOLORS);
    while(used[j]);
    used[j]=true;
    p_colors[i]=rainbow[j];
  }
}
var MAXNAME=40;
function init_names(){
  var nsyl,cb,sp,i,nwords;
  for(i=0;i<MAXSCROLLS;i++){
    cb='';
    nwords=rnd(3)+2;
    while(nwords--){
      nsyl=rnd(3)+1;
      while(nsyl--){
        sp=sylls[rnd(sylls.length)];
        if(cb.length+sp.length>MAXNAME)break;
        cb+=sp;
      }
      cb+=' ';
    }
    cb=cb.slice(0,-1);
    prbuf=cb;
    s_names[i]=cb;
  }
}
function init_stones(){
  var i,j;
  for(i=0;i<NSTONES;i++)used[i]=false;
  for(i=0;i<MAXRINGS;i++){
    do j=rnd(NSTONES);
    while(used[j]);
    used[j]=true;
    r_stones[i]=stones[j][0];
    ring_info[i].oi_worth+=stones[j][1];
  }
}
function init_materials(){
  var i,j,str,metused=[];
  for(i=0;i<NWOOD;i++)used[i]=false;
  for(i=0;i<NMETAL;i++)metused[i]=false;
  for(i=0;i<MAXSTICKS;i++){
    for(;;)
      if(rnd(2)===0){
        j=rnd(NMETAL);
        if(!metused[j]){
          ws_type[i]='wand';
          str=metal[j];
          metused[j]=true;
          break;
        }
      }
      else{
        j=rnd(NWOOD);
        if(!used[j]){
          ws_type[i]='staff';
          str=wood[j];
          used[j]=true;
          break;
        }
      }
    ws_made[i]=str;
  }
}
function sumprobs(info,bound){for(var i=1;i<bound;i++)info[i].oi_prob+=info[i-1].oi_prob}
function init_probs(){
  sumprobs(things,NUMTHINGS);
  sumprobs(pot_info,MAXPOTIONS);
  sumprobs(scr_info,MAXSCROLLS);
  sumprobs(ring_info,MAXRINGS);
  sumprobs(ws_info,MAXSTICKS);
  sumprobs(weap_info,MAXWEAPONS);
  sumprobs(arm_info,MAXARMORS);
}
function pick_color(col){return on(player,ISHALU)?rainbow[rnd(NCOLORS)]:col}

/* ---------- io.c ---------- */
var msgbuf='',newpos=0;
function* msg(s){
  if(s===''){
    move(0,0);
    clrtoeol();
    mpos=0;
    return ~ESCAPE;
  }
  yield* doadd(s);
  return yield* endmsg();
}
function* addmsg(s){yield* doadd(s)}
function* endmsg(){
  var ch;
  if(save_msg)huh=msgbuf;
  if(mpos){
    yield* look(false);
    mvaddstr(0,mpos,'--More--');
    refresh();
    if(!msg_esc)yield* wait_for(32);
    else{
      while((ch=yield* readchar())!==32)
        if(ch===ESCAPE){
          msgbuf='';
          mpos=0;
          newpos=0;
          return ESCAPE;
        }
    }
  }
  /* all messages start uppercase, except ones that start with a pack addressing character */
  if(islower(msgbuf.charCodeAt(0))&&!lower_msg&&msgbuf.charAt(1)!==')')
    msgbuf=msgbuf.charAt(0).toUpperCase()+msgbuf.slice(1);
  mvaddstr(0,0,msgbuf);
  clrtoeol();
  mpos=newpos;
  newpos=0;
  msgbuf='';
  refresh();
  return ~ESCAPE;
}
function* doadd(buf){
  if(buf.length+newpos>=MAXMSG)yield* endmsg();
  msgbuf+=buf;
  newpos=msgbuf.length;
}
function step_ok(ch){
  switch(ch){
    case SPACE:case VWALL:case HWALL:
      return false;
    default:
      return !isalpha(ch);
  }
}
function* readchar(){
  var ch=yield* getch();
  if(ch===3){
    yield* quit();
    return 27;
  }
  return ch;
}
var hpwidth=0,s_hungry=0,s_lvl=0,s_pur=-1,s_hp=0,s_arm=0,s_str=0,s_exp=0;
var state_name=['','Hungry','Weak','Faint'];
function* status(){
  var oy,ox,temp;
  temp=cur_armor!==null?cur_armor.o_arm:pstats.s_arm;
  if(s_hp===pstats.s_hpt&&s_exp===pstats.s_exp&&s_pur===purse&&s_arm===temp&&s_str===pstats.s_str&&s_lvl===level&&s_hungry===hungry_state&&!stat_msg)
    return;
  s_arm=temp;
  oy=stdscr.y;ox=stdscr.x;
  if(s_hp!==pstats.s_maxhp){
    temp=pstats.s_maxhp;
    s_hp=pstats.s_maxhp;
    for(hpwidth=0;temp;hpwidth++)temp=idiv(temp,10);
  }
  s_lvl=level;
  s_pur=purse;
  s_hp=pstats.s_hpt;
  s_str=pstats.s_str;
  s_exp=pstats.s_exp;
  s_hungry=hungry_state;
  var line='Level: '+level+'  Gold: '+padr(purse,5)+'  Hp: '+padl(pstats.s_hpt,hpwidth)+'('+padl(pstats.s_maxhp,hpwidth)+')  Str: '+padl(pstats.s_str,2)+'('+max_stats.s_str+')  Arm: '+padr(10-s_arm,2)+'  Exp: '+pstats.s_lvl+'/'+pstats.s_exp+'  '+state_name[hungry_state];
  if(stat_msg){
    move(0,0);
    yield* msg(line);
  }
  else{
    move(STATLINE,0);
    addstr(line);
  }
  clrtoeol();
  move(oy,ox);
}
function* wait_for(ch){
  var c;
  if(ch===10){
    while((c=yield* readchar())!==10&&c!==13)continue;
  }
  else
    while((yield* readchar())!==ch)continue;
}
function* show_win(message){
  var win=hw;
  wmove(win,0,0);
  waddstr(win,message);
  touchwin(win);
  wmove(win,hero.y,hero.x);
  wrefresh(win);
  yield* wait_for(32);
  clearok(curscr,true);
  touchwin(stdscr);
}

/* ---------- list.c ---------- */
function detach(list,item){
  if(list===item)list=item.l_next;
  if(item.l_prev!==null)item.l_prev.l_next=item.l_next;
  if(item.l_next!==null)item.l_next.l_prev=item.l_prev;
  item.l_next=null;
  item.l_prev=null;
  return list;
}
function attach(list,item){
  if(list!==null){
    item.l_next=list;
    list.l_prev=item;
    item.l_prev=null;
  }
  else{
    item.l_next=null;
    item.l_prev=null;
  }
  return item;
}
function discard(item){} /* free(); the collector does it */

/* ---------- armor.c ---------- */
function* wear(){
  var obj,sp;
  if((obj=yield* get_item('wear',ARMOR))===null)return;
  if(cur_armor!==null){
    yield* addmsg('you are already wearing some');
    if(!terse)yield* addmsg(".  You'll have to take it off first");
    yield* endmsg();
    after=false;
    return;
  }
  if(obj.o_type!==ARMOR){
    yield* msg("you can't wear that");
    return;
  }
  yield* waste_time();
  obj.o_flags|=ISKNOW;
  sp=inv_name(obj,true);
  cur_armor=obj;
  if(!terse)yield* addmsg('you are now ');
  yield* msg('wearing '+sp);
}
function* take_off(){
  var obj;
  if((obj=cur_armor)===null){
    after=false;
    if(terse)yield* msg('not wearing armor');
    else yield* msg("you aren't wearing any armor");
    return;
  }
  if(!(yield* dropcheck(cur_armor)))return;
  cur_armor=null;
  if(terse)yield* addmsg('was');
  else yield* addmsg('you used to be');
  yield* msg(' wearing '+chr(obj.o_packch)+') '+inv_name(obj,true));
}
function* waste_time(){
  yield* do_daemons(BEFORE);
  yield* do_fuses(BEFORE);
  yield* do_daemons(AFTER);
  yield* do_fuses(AFTER);
}

/* ---------- chase.c ---------- */
var DRAGONSHOT=5;
var ch_ret={x:0,y:0},orig_pos={x:0,y:0},dthis={x:0,y:0},tryp={x:0,y:0},cansee_tp={x:0,y:0};
function* runners(){
  var tp,next,wastarget;
  for(tp=mlist;tp!==null;tp=next){
    /* remember this in case the monster's "next" is changed */
    next=tp.l_next;
    if(!on(tp,ISHELD)&&on(tp,ISRUN)){
      cp(orig_pos,tp.t_pos);
      wastarget=on(tp,ISTARGET);
      if((yield* move_monst(tp))===-1)continue;
      if(on(tp,ISFLY)&&dist_cp(hero,tp.t_pos)>=3)yield* move_monst(tp);
      if(wastarget&&!ce(orig_pos,tp.t_pos)){
        tp.t_flags&=~ISTARGET;
        to_death=false;
      }
    }
  }
  if(has_hit){
    yield* endmsg();
    has_hit=false;
  }
}
function* move_monst(tp){
  if(!on(tp,ISSLOW)||tp.t_turn)
    if((yield* do_chase(tp))===-1)return -1;
  if(on(tp,ISHASTE))
    if((yield* do_chase(tp))===-1)return -1;
  tp.t_turn=!tp.t_turn;
  return 0;
}
function relocate(th,new_loc){
  var oroom;
  if(!ce(new_loc,th.t_pos)){
    mvaddch(th.t_pos.y,th.t_pos.x,th.t_oldch);
    th.t_room=roomin(new_loc);
    set_oldch(th,new_loc);
    oroom=th.t_room;
    setmoat(th.t_pos.y,th.t_pos.x,null);
    if(oroom!==th.t_room)th.t_dest=find_dest(th);
    cp(th.t_pos,new_loc);
    setmoat(new_loc.y,new_loc.x,th);
  }
  move(new_loc.y,new_loc.x);
  if(see_monst(th))addch(th.t_disguise);
  else if(on(player,SEEMONST)){
    standout();
    addch(th.t_type);
    standend();
  }
}
function* do_chase(th){
  var i,c,rer,ree,mindist=32767,curdist,stoprun=false,isdoor,obj;
  rer=th.t_room;
  if(on(th,ISGREED)&&rer.r_goldval===0)th.t_dest=hero;
  if(th.t_dest===hero)ree=player.t_room;
  else ree=roomin(th.t_dest);
  /* we don't count doors as inside rooms for this routine */
  isdoor=chat(th.t_pos.y,th.t_pos.x)===DOOR;
  /* if the object of our desire is in a different room, and we are not in a corridor, run to the door nearest to our goal */
  for(;;){
    if(rer!==ree){
      for(i=0;i<rer.r_nexits;i++){
        c=rer.r_exit[i];
        curdist=dist_cp(th.t_dest,c);
        if(curdist<mindist){
          cp(dthis,c);
          mindist=curdist;
        }
      }
      if(isdoor){
        rer=passages[flat(th.t_pos.y,th.t_pos.x)&F_PNUM];
        isdoor=false;
        continue;
      }
    }
    else{
      cp(dthis,th.t_dest);
      /* dragons: on a straight line from the hero, within shooting distance */
      if(th.t_type===ord('D')&&(th.t_pos.y===hero.y||th.t_pos.x===hero.x
        ||Math.abs(th.t_pos.y-hero.y)===Math.abs(th.t_pos.x-hero.x))
        &&dist_cp(th.t_pos,hero)<=BOLT_LENGTH*BOLT_LENGTH
        &&!on(th,ISCANC)&&rnd(DRAGONSHOT)===0){
        delta.y=sign(hero.y-th.t_pos.y);
        delta.x=sign(hero.x-th.t_pos.x);
        if(has_hit)yield* endmsg();
        yield* fire_bolt(th.t_pos,delta,'flame');
        running=false;
        count=0;
        quiet=0;
        if(to_death&&!on(th,ISTARGET)){
          to_death=false;
          kamikaze=false;
        }
        return 0;
      }
    }
    break;
  }
  /* this now contains what we want to run to this time, so we run to it */
  if(!chase(th,dthis)){
    if(ce(dthis,hero))return yield* attack(th);
    else if(ce(dthis,th.t_dest)){
      for(obj=lvl_obj;obj!==null;obj=obj.l_next)
        if(th.t_dest===obj.o_pos){
          lvl_obj=detach(lvl_obj,obj);
          th.t_pack=attach(th.t_pack,obj);
          setchat(obj.o_pos.y,obj.o_pos.x,(th.t_room.r_flags&ISGONE)?PASSAGE:FLOOR);
          th.t_dest=find_dest(th);
          break;
        }
      if(th.t_type!==ord('F'))stoprun=true;
    }
  }
  else{
    if(th.t_type===ord('F'))return 0;
  }
  relocate(th,ch_ret);
  if(stoprun&&ce(th.t_pos,th.t_dest))th.t_flags&=~ISRUN;
  return 0;
}
function set_oldch(tp,c){
  var sch;
  if(ce(tp.t_pos,c))return;
  sch=tp.t_oldch;
  tp.t_oldch=CCHAR(mvinch(c.y,c.x));
  if(!on(player,ISBLIND)){
    if((sch===FLOOR||tp.t_oldch===FLOOR)&&(tp.t_room.r_flags&ISDARK))
      tp.t_oldch=SPACE;
    else if(dist_cp(c,hero)<=LAMPDIST&&see_floor)
      tp.t_oldch=chat(c.y,c.x);
  }
}
function see_monst(mp){
  var y,x;
  if(on(player,ISBLIND))return false;
  if(on(mp,ISINVIS)&&!on(player,CANSEE))return false;
  y=mp.t_pos.y;
  x=mp.t_pos.x;
  if(dist(y,x,hero.y,hero.x)<LAMPDIST){
    if(y!==hero.y&&x!==hero.x&&!step_ok(chat(y,hero.x))&&!step_ok(chat(hero.y,x)))
      return false;
    return true;
  }
  if(mp.t_room!==player.t_room)return false;
  return !(mp.t_room.r_flags&ISDARK);
}
function runto(runner){
  var tp=moat(runner.y,runner.x);
  tp.t_flags|=ISRUN;
  tp.t_flags&=~ISHELD;
  tp.t_dest=find_dest(tp);
}
function chase(tp,ee){
  var obj,x,y,curdist,thisdist,er=tp.t_pos,ch,plcnt=1;
  /* confused things move randomly; phantoms are slightly confused all of the time, and bats quite */
  if((on(tp,ISHUH)&&rnd(5)!==0)||(tp.t_type===ord('P')&&rnd(5)===0)||(tp.t_type===ord('B')&&rnd(2)===0)){
    cp(ch_ret,rndmove(tp));
    curdist=dist_cp(ch_ret,ee);
    if(rnd(20)===0)tp.t_flags&=~ISHUH;
  }
  else{
    var ey,ex;
    curdist=dist_cp(er,ee);
    cp(ch_ret,er);
    ey=er.y+1;
    if(ey>=NUMLINES-1)ey=NUMLINES-2;
    ex=er.x+1;
    if(ex>=NUMCOLS)ex=NUMCOLS-1;
    for(x=er.x-1;x<=ex;x++){
      if(x<0)continue;
      tryp.x=x;
      for(y=er.y-1;y<=ey;y++){
        tryp.y=y;
        if(!diag_ok(er,tryp))continue;
        ch=winat(y,x);
        if(step_ok(ch)){
          /* a scroll might be a scare monster scroll */
          if(ch===SCROLL){
            for(obj=lvl_obj;obj!==null;obj=obj.l_next){
              if(y===obj.o_pos.y&&x===obj.o_pos.x)break;
            }
            if(obj!==null&&obj.o_which===S_SCARE)continue;
          }
          /* it can also be a xeroc, which we shouldn't step on */
          if((obj=moat(y,x))!==null&&obj.t_type===ord('X'))continue;
          thisdist=dist(y,x,ee.y,ee.x);
          if(thisdist<curdist){
            plcnt=1;
            cp(ch_ret,tryp);
            curdist=thisdist;
          }
          else if(thisdist===curdist&&rnd(++plcnt)===0){
            cp(ch_ret,tryp);
            curdist=thisdist;
          }
        }
      }
    }
  }
  return curdist!==0&&!ce(ch_ret,hero);
}
function roomin(c){
  var rp,i,fp=flat(c.y,c.x);
  if(fp&F_PASS)return passages[fp&F_PNUM];
  for(i=0;i<MAXROOMS;i++){
    rp=rooms[i];
    if(c.x<=rp.r_pos.x+rp.r_max.x&&rp.r_pos.x<=c.x&&c.y<=rp.r_pos.y+rp.r_max.y&&rp.r_pos.y<=c.y)
      return rp;
  }
  /* the C says this with msg() and goes on with NULL. Too many plain callers to block here: it just shows. */
  mvaddstr(0,0,'In some bizarre place ('+c.y+', '+c.x+')');
  clrtoeol();
  mpos=stdscr.x;
  return null;
}
function diag_ok(sp,ep){
  if(ep.x<0||ep.x>=NUMCOLS||ep.y<=0||ep.y>=NUMLINES-1)return false;
  if(ep.x===sp.x||ep.y===sp.y)return true;
  return step_ok(chat(ep.y,sp.x))&&step_ok(chat(sp.y,ep.x));
}
function cansee(y,x){
  var rer;
  if(on(player,ISBLIND))return false;
  if(dist(y,x,hero.y,hero.x)<LAMPDIST){
    if(flat(y,x)&F_PASS)
      if(y!==hero.y&&x!==hero.x&&!step_ok(chat(y,hero.x))&&!step_ok(chat(hero.y,x)))
        return false;
    return true;
  }
  /* we can only see if the hero in the same room as the coordinate and the room is lit or if it is close */
  cansee_tp.y=y;
  cansee_tp.x=x;
  return (rer=roomin(cansee_tp))===player.t_room&&!(rer.r_flags&ISDARK);
}
function find_dest(tp){
  var obj,prob;
  if((prob=monsters[tp.t_type-65].m_carry)<=0||tp.t_room===player.t_room||see_monst(tp))return hero;
  for(obj=lvl_obj;obj!==null;obj=obj.l_next){
    if(obj.o_type===SCROLL&&obj.o_which===S_SCARE)continue;
    if(roomin(obj.o_pos)===tp.t_room&&rnd(100)<prob){
      for(tp=mlist;tp!==null;tp=tp.l_next)
        if(tp.t_dest===obj.o_pos)break;
      if(tp===null)return obj.o_pos;
    }
  }
  return hero;
}
function dist(y1,x1,y2,x2){return (x2-x1)*(x2-x1)+(y2-y1)*(y2-y1)}
function dist_cp(c1,c2){return dist(c1.y,c1.x,c2.y,c2.x)}

/* ---------- command.c ---------- */
var countch=0,direction=0,newcount=false;
function* command(){
  var ch,ntimes=1,fp,mp;
  if(on(player,ISHASTE))ntimes++;
  /* let the daemons start up */
  yield* do_daemons(BEFORE);
  yield* do_fuses(BEFORE);
  while(ntimes--){
    again=false;
    if(has_hit){
      yield* endmsg();
      has_hit=false;
    }
    /* illegal things for the player to be: someone's been poking in memory */
    if(on(player,ISSLOW|ISGREED|ISINVIS|ISREGEN|ISTARGET))my_exit(1);
    yield* look(true);
    if(!running)door_stop=false;
    yield* status();
    lastscore=purse;
    move(hero.y,hero.x);
    if(!((running||count)&&jump))refresh();
    take=0;
    after=true;
    /* read command or continue run */
    if(!no_command){
      if(running||to_death)ch=runch;
      else if(count)ch=countch;
      else{
        ch=yield* readchar();
        move_on=false;
        if(mpos!==0)yield* msg('');
      }
    }
    else ch=46;
    if(no_command){
      if(--no_command===0){
        player.t_flags|=ISRUN;
        yield* msg('you can move again');
      }
    }
    else{
      /* check for prefixes */
      newcount=false;
      if(isdigit(ch)){
        count=0;
        newcount=true;
        while(isdigit(ch)){
          count=count*10+(ch-48);
          if(count>255)count=255;
          ch=yield* readchar();
        }
        countch=ch;
        /* turn off count for commands which don't make sense to repeat */
        switch(ch){
          case CTRL('B'):case CTRL('H'):case CTRL('J'):
          case CTRL('K'):case CTRL('L'):case CTRL('N'):
          case CTRL('U'):case CTRL('Y'):
          case ord('.'):case ord('a'):case ord('b'):case ord('h'):case ord('j'):
          case ord('k'):case ord('l'):case ord('m'):case ord('n'):case ord('q'):
          case ord('r'):case ord('s'):case ord('t'):case ord('u'):case ord('y'):
          case ord('z'):case ord('B'):case ord('C'):case ord('H'):case ord('I'):
          case ord('J'):case ord('K'):case ord('L'):case ord('N'):case ord('U'):
          case ord('Y'):
            break;
          default:
            count=0;
        }
      }
      /* execute a command */
      if(count&&!running)count--;
      if(ch!==ord('a')&&ch!==ESCAPE&&!(running||count||to_death)){
        l_last_comm=last_comm;
        l_last_dir=last_dir;
        l_last_pick=last_pick;
        last_comm=ch;
        last_dir=0;
        last_pick=null;
      }
      over:for(;;){
        switch(ch){
          case ord(','):{
            var obj=null,found=0;
            for(obj=lvl_obj;obj!==null;obj=obj.l_next){
              if(obj.o_pos.y===hero.y&&obj.o_pos.x===hero.x){
                found=1;
                break;
              }
            }
            if(found){
              if(yield* levit_check());
              else yield* pick_up(obj.o_type);
            }
            else{
              if(!terse)yield* addmsg('there is ');
              yield* addmsg('nothing here');
              if(!terse)yield* addmsg(' to pick up');
              yield* endmsg();
            }
            break;
          }
          case ord('!'):yield* shell();break;
          case ord('h'):yield* do_move(0,-1);break;
          case ord('j'):yield* do_move(1,0);break;
          case ord('k'):yield* do_move(-1,0);break;
          case ord('l'):yield* do_move(0,1);break;
          case ord('y'):yield* do_move(-1,-1);break;
          case ord('u'):yield* do_move(-1,1);break;
          case ord('b'):yield* do_move(1,-1);break;
          case ord('n'):yield* do_move(1,1);break;
          case ord('H'):do_run(ord('h'));break;
          case ord('J'):do_run(ord('j'));break;
          case ord('K'):do_run(ord('k'));break;
          case ord('L'):do_run(ord('l'));break;
          case ord('Y'):do_run(ord('y'));break;
          case ord('U'):do_run(ord('u'));break;
          case ord('B'):do_run(ord('b'));break;
          case ord('N'):do_run(ord('n'));break;
          case CTRL('H'):case CTRL('J'):case CTRL('K'):case CTRL('L'):
          case CTRL('Y'):case CTRL('U'):case CTRL('B'):case CTRL('N'):
            if(!on(player,ISBLIND)){
              door_stop=true;
              firstmove=true;
            }
            if(count&&!newcount)ch=direction;
            else{
              ch+=65-1;
              direction=ch;
            }
            continue over;
          case ord('F'):
            kamikaze=true;
            /* FALLTHROUGH */
          case ord('f'):
            if(!(yield* get_dir())){
              after=false;
              break;
            }
            delta.y+=hero.y;
            delta.x+=hero.x;
            if((mp=moat(delta.y,delta.x))===null||(!see_monst(mp)&&!on(player,SEEMONST))){
              if(!terse)yield* addmsg('I see ');
              yield* msg('no monster there');
              after=false;
            }
            else if(diag_ok(hero,delta)){
              to_death=true;
              max_hit=0;
              mp.t_flags|=ISTARGET;
              runch=ch=dir_ch;
              continue over;
            }
            break;
          case ord('t'):
            if(!(yield* get_dir()))after=false;
            else yield* missile(delta.y,delta.x);
            break;
          case ord('a'):
            if(last_comm===0){
              yield* msg("you haven't typed a command yet");
              after=false;
            }
            else{
              ch=last_comm;
              again=true;
              continue over;
            }
            break;
          case ord('q'):yield* quaff();break;
          case ord('Q'):
            after=false;
            q_comm=true;
            yield* quit();
            q_comm=false;
            break;
          case ord('i'):after=false;yield* inventory(player.t_pack,0);break;
          case ord('I'):after=false;yield* picky_inven();break;
          case ord('d'):yield* drop();break;
          case ord('r'):yield* read_scroll();break;
          case ord('e'):yield* eat();break;
          case ord('w'):yield* wield();break;
          case ord('W'):yield* wear();break;
          case ord('T'):yield* take_off();break;
          case ord('P'):yield* ring_on();break;
          case ord('R'):yield* ring_off();break;
          case ord('o'):yield* option();after=false;break;
          case ord('c'):yield* call();after=false;break;
          case ord('>'):after=false;yield* d_level();break;
          case ord('<'):after=false;yield* u_level();break;
          case ord('?'):after=false;yield* help();break;
          case ord('/'):after=false;yield* identify();break;
          case ord('s'):yield* search();break;
          case ord('z'):
            if(yield* get_dir())yield* do_zap();
            else after=false;
            break;
          case ord('D'):after=false;yield* discovered();break;
          case CTRL('P'):after=false;yield* msg(huh);break;
          case CTRL('R'):
            after=false;
            clearok(curscr,true);
            DIRTY=true;
            break;
          case ord('v'):
            after=false;
            yield* msg('version '+RELEASE+'. (mctesq was here)');
            break;
          case ord('S'):
            after=false;
            yield* save_game();
            break;
          case ord('.'):break;
          case ord(' '):after=false;break;
          case ord('^'):
            after=false;
            if(yield* get_dir()){
              delta.y+=hero.y;
              delta.x+=hero.x;
              fp=flat(delta.y,delta.x);
              if(!terse)yield* addmsg('You have found ');
              if(chat(delta.y,delta.x)!==TRAP)yield* msg('no trap there');
              else if(on(player,ISHALU))yield* msg(tr_name[rnd(NTRAPS)]);
              else{
                yield* msg(tr_name[fp&F_TMASK]);
                setflat(delta.y,delta.x,fp|F_SEEN);
              }
            }
            break;
          case ESCAPE:
            door_stop=false;
            count=0;
            after=false;
            again=false;
            break;
          case ord('m'):
            move_on=true;
            if(!(yield* get_dir()))after=false;
            else{
              ch=dir_ch;
              countch=dir_ch;
              continue over;
            }
            break;
          case ord(')'):yield* current(cur_weapon,'wielding',null);break;
          case ord(']'):yield* current(cur_armor,'wearing',null);break;
          case ord('='):
            yield* current(cur_ring[LEFT],'wearing',terse?'(L)':'on left hand');
            yield* current(cur_ring[RIGHT],'wearing',terse?'(R)':'on right hand');
            break;
          case ord('@'):
            stat_msg=true;
            yield* status();
            stat_msg=false;
            after=false;
            break;
          default:
            after=false;
            yield* illcom(ch);
        }
        break;
      }
      /* turn off flags if no longer needed */
      if(!running)door_stop=false;
    }
    /* if he ran into something to take, let him pick it up */
    if(take!==0)yield* pick_up(take);
    if(!running)door_stop=false;
    if(!after)ntimes++;
  }
  yield* do_daemons(AFTER);
  yield* do_fuses(AFTER);
  if(ISRING(LEFT,R_SEARCH))yield* search();
  else if(ISRING(LEFT,R_TELEPORT)&&rnd(50)===0)yield* teleport();
  if(ISRING(RIGHT,R_SEARCH))yield* search();
  else if(ISRING(RIGHT,R_TELEPORT)&&rnd(50)===0)yield* teleport();
}
function* illcom(ch){
  save_msg=false;
  count=0;
  yield* msg("illegal command '"+unctrl(ch)+"'");
  save_msg=true;
}
function* search(){
  var y,x,fp,ey,ex,probinc,found,c,foundone;
  ey=hero.y+1;
  ex=hero.x+1;
  probinc=on(player,ISHALU)?3:0;
  probinc+=on(player,ISBLIND)?2:0;
  found=false;
  for(y=hero.y-1;y<=ey;y++)
    for(x=hero.x-1;x<=ex;x++){
      if(y===hero.y&&x===hero.x)continue;
      fp=flat(y,x);
      if(!(fp&F_REAL)){
        foundone=false;
        c=chat(y,x);
        switch(c){
          case VWALL:case HWALL:
            if(rnd(5+probinc)!==0)break;
            setchat(y,x,DOOR);
            yield* msg('a secret door');
            foundone=true;
            break;
          case FLOOR:
            if(rnd(2+probinc)!==0)break;
            setchat(y,x,TRAP);
            if(!terse)yield* addmsg('you found ');
            if(on(player,ISHALU))yield* msg(tr_name[rnd(NTRAPS)]);
            else{
              yield* msg(tr_name[fp&F_TMASK]);
              fp|=F_SEEN;
              setflat(y,x,fp);
            }
            foundone=true;
            break;
          case SPACE:
            if(rnd(3+probinc)!==0)break;
            setchat(y,x,PASSAGE);
            foundone=true;
        }
        if(foundone){
          found=true;
          setflat(y,x,flat(y,x)|F_REAL);
          count=0;
          running=false;
        }
      }
    }
  if(found)yield* look(false);
}
function* help(){
  var i,strp,helpch,numprint,cnt;
  yield* msg('character you want help for (* for all): ');
  helpch=yield* readchar();
  mpos=0;
  /* if its not a *, print the right help string or an error if he typed a funny character */
  if(helpch!==ord('*')){
    move(0,0);
    for(i=0;i<helpstr.length;i++){
      strp=helpstr[i];
      if(strp.h_ch===helpch){
        lower_msg=true;
        yield* msg(unctrl(strp.h_ch)+strp.h_desc);
        lower_msg=false;
        return;
      }
    }
    yield* msg("unknown character '"+unctrl(helpch)+"'");
    return;
  }
  /* here we print help for everything, then wait before we return to command mode */
  numprint=0;
  for(i=0;i<helpstr.length;i++)if(helpstr[i].h_print)numprint++;
  if(numprint&1)numprint++;
  numprint=idiv(numprint,2);
  if(numprint>LINES-1)numprint=LINES-1;
  wclear(hw);
  cnt=0;
  for(i=0;i<helpstr.length;i++){
    strp=helpstr[i];
    if(strp.h_print){
      wmove(hw,cnt%numprint,cnt>=numprint?idiv(COLS,2):0);
      if(strp.h_ch)waddstr(hw,unctrl(strp.h_ch));
      waddstr(hw,strp.h_desc);
      if(++cnt>=numprint*2)break;
    }
  }
  wmove(hw,LINES-1,0);
  waddstr(hw,'--Press space to continue--');
  wrefresh(hw);
  yield* wait_for(32);
  clearok(stdscr,true);
  yield* msg('');
  touchwin(stdscr);
  wrefresh(stdscr);
}
var ident_list=[[VWALL,'wall of a room'],[HWALL,'wall of a room'],[GOLD,'gold'],[STAIRS,'a staircase'],[DOOR,'door'],[FLOOR,'room floor'],[PLAYER,'you'],
  [PASSAGE,'passage'],[TRAP,'trap'],[POTION,'potion'],[SCROLL,'scroll'],[FOOD,'food'],[WEAPON,'weapon'],[SPACE,'solid rock'],[ARMOR,'armor'],
  [AMULET,'the Amulet of Yendor'],[RING,'ring'],[STICK,'wand or staff']];
function* identify(){
  var ch,i,str;
  yield* msg('what do you want identified? ');
  ch=yield* readchar();
  mpos=0;
  if(ch===ESCAPE){
    yield* msg('');
    return;
  }
  if(isupper(ch))str=monsters[ch-65].m_name;
  else{
    str='unknown character';
    for(i=0;i<ident_list.length;i++)
      if(ident_list[i][0]===ch){
        str=ident_list[i][1];
        break;
      }
  }
  yield* msg("'"+unctrl(ch)+"': "+str);
}
function* d_level(){
  if(yield* levit_check())return;
  if(chat(hero.y,hero.x)!==STAIRS)yield* msg('I see no way down');
  else{
    level++;
    seenstairs=false;
    yield* new_level();
  }
}
function* u_level(){
  if(yield* levit_check())return;
  if(chat(hero.y,hero.x)===STAIRS)
    if(amulet){
      level--;
      if(level===0)yield* total_winner();
      yield* new_level();
      yield* msg('you feel a wrenching sensation in your gut');
    }
    else yield* msg('your way is magically blocked');
  else yield* msg('I see no way up');
}
function* levit_check(){
  if(!on(player,ISLEVIT))return false;
  yield* msg("You can't.  You're floating off the ground!");
  return true;
}
function* call(){
  var obj,op=null,elsewise=null,gs,gset,know,ref;
  obj=yield* get_item('call',CALLABLE);
  /* make certain that it is somethings that we want to wear */
  if(obj===null)return;
  know=null;
  switch(obj.o_type){
    case RING:op=ring_info[obj.o_which];elsewise=r_stones[obj.o_which];break;
    case POTION:op=pot_info[obj.o_which];elsewise=p_colors[obj.o_which];break;
    case SCROLL:op=scr_info[obj.o_which];elsewise=s_names[obj.o_which];break;
    case STICK:op=ws_info[obj.o_which];elsewise=ws_made[obj.o_which];break;
    case FOOD:
      yield* msg("you can't call that anything");
      return;
    default:
      elsewise=obj.o_label;
  }
  if(op!==null){
    know=op.oi_know;
    gs=op.oi_guess;
    if(gs!==null)elsewise=gs;
  }
  else gs=obj.o_label;
  if(know){
    yield* msg('that has already been identified');
    return;
  }
  if(elsewise!==null&&elsewise===gs){
    if(!terse)yield* addmsg('Was ');
    yield* msg('called "'+elsewise+'"');
  }
  if(terse)yield* msg('call it: ');
  else yield* msg('what do you want to call it? ');
  prbuf=elsewise===null?'':elsewise;
  ref={get:function(){return prbuf},set:function(v){prbuf=v}};
  if((yield* get_str(ref,stdscr))===NORM){
    if(op!==null)op.oi_guess=prbuf;
    else obj.o_label=prbuf;
  }
}
function* current(cur,how,where){
  after=false;
  if(cur!==null){
    if(!terse)yield* addmsg('you are '+how+' (');
    inv_describe=false;
    yield* addmsg(chr(cur.o_packch)+') '+inv_name(cur,true));
    inv_describe=true;
    if(where)yield* addmsg(' '+where);
    yield* endmsg();
  }
  else{
    if(!terse)yield* addmsg('you are ');
    yield* addmsg(how+' nothing');
    if(where)yield* addmsg(' '+where);
    yield* endmsg();
  }
}

/* ---------- daemon.c ---------- */
var d_list=[];(function(){for(var i=0;i<MAXDAEMONS;i++)d_list.push({d_type:EMPTY,d_func:null,d_arg:0,d_time:0})})();
function d_slot(){
  for(var i=0;i<MAXDAEMONS;i++)if(d_list[i].d_type===EMPTY)return d_list[i];
  return null;
}
function find_slot(func){
  for(var i=0;i<MAXDAEMONS;i++)if(d_list[i].d_type!==EMPTY&&func===d_list[i].d_func)return d_list[i];
  return null;
}
function start_daemon(func,arg,type){
  var dev=d_slot();
  dev.d_type=type;
  dev.d_func=func;
  dev.d_arg=arg;
  dev.d_time=DAEMON;
}
function kill_daemon(func){
  var dev;
  if((dev=find_slot(func))===null)return;
  dev.d_type=EMPTY;
}
function* do_daemons(flag){
  for(var i=0;i<MAXDAEMONS;i++){
    var dev=d_list[i];
    if(dev.d_type===flag&&dev.d_time===DAEMON)yield* dev.d_func(dev.d_arg);
  }
}
function fuse(func,arg,time,type){
  var wire=d_slot();
  wire.d_type=type;
  wire.d_func=func;
  wire.d_arg=arg;
  wire.d_time=time;
}
function lengthen(func,xtime){
  var wire;
  if((wire=find_slot(func))===null)return;
  wire.d_time+=xtime;
}
function extinguish(func){
  var wire;
  if((wire=find_slot(func))===null)return;
  wire.d_type=EMPTY;
}
function* do_fuses(flag){
  for(var i=0;i<MAXDAEMONS;i++){
    var wire=d_list[i];
    if(flag===wire.d_type&&wire.d_time>0&&--wire.d_time===0){
      wire.d_type=EMPTY;
      yield* wire.d_func(wire.d_arg);
    }
  }
}

/* ---------- daemons.c ---------- */
function* doctor(){
  var lv,ohp;
  lv=pstats.s_lvl;
  ohp=pstats.s_hpt;
  quiet++;
  if(lv<8){
    if(quiet+(lv<<1)>20)pstats.s_hpt++;
  }
  else if(quiet>=3)pstats.s_hpt+=rnd(lv-7)+1;
  if(ISRING(LEFT,R_REGEN))pstats.s_hpt++;
  if(ISRING(RIGHT,R_REGEN))pstats.s_hpt++;
  if(ohp!==pstats.s_hpt){
    if(pstats.s_hpt>pstats.s_maxhp)pstats.s_hpt=pstats.s_maxhp;
    quiet=0;
  }
}
function* swander(){start_daemon(rollwand,0,BEFORE)}
var between=0;
function* rollwand(){
  if(++between>=4){
    if(roll(1,6)===4){
      wanderer();
      kill_daemon(rollwand);
      fuse(swander,0,spread(70),BEFORE);
    }
    between=0;
  }
}
function* unconfuse(){
  player.t_flags&=~ISHUH;
  yield* msg('you feel less '+choose_str('trippy','confused')+' now');
}
function* unsee(){
  var th;
  for(th=mlist;th!==null;th=th.l_next)
    if(on(th,ISINVIS)&&see_monst(th))mvaddch(th.t_pos.y,th.t_pos.x,th.t_oldch);
  player.t_flags&=~CANSEE;
}
function* sight(){
  if(on(player,ISBLIND)){
    extinguish(sight);
    player.t_flags&=~ISBLIND;
    if(!(player.t_room.r_flags&ISGONE))yield* enter_room(hero);
    yield* msg(choose_str('far out!  Everything is all cosmic again','the veil of darkness lifts'));
  }
}
function* nohaste(){
  player.t_flags&=~ISHASTE;
  yield* msg('you feel yourself slowing down');
}
function* stomach(){
  var oldfood,orig_hungry=hungry_state;
  if(food_left<=0){
    if(food_left--<-STARVETIME)yield* death(ord('s'));
    /* the hero is fainting */
    if(no_command||rnd(5)!==0)return;
    no_command+=rnd(8)+4;
    hungry_state=3;
    if(!terse)yield* addmsg(choose_str('the munchies overpower your motor capabilities.  ','you feel too weak from lack of food.  '));
    yield* msg(choose_str('You freak out','You faint'));
  }
  else{
    oldfood=food_left;
    food_left-=ring_eat(LEFT)+ring_eat(RIGHT)+1-(amulet?1:0);
    if(food_left<MORETIME&&oldfood>=MORETIME){
      hungry_state=2;
      yield* msg(choose_str('the munchies are interfering with your motor capabilites','you are starting to feel weak'));
    }
    else if(food_left<2*MORETIME&&oldfood>=2*MORETIME){
      hungry_state=1;
      if(terse)yield* msg(choose_str('getting the munchies','getting hungry'));
      else yield* msg(choose_str('you are getting the munchies','you are starting to get hungry'));
    }
  }
  if(hungry_state!==orig_hungry){
    player.t_flags&=~ISRUN;
    running=false;
    to_death=false;
    count=0;
  }
}
function* come_down(){
  var tp,seemonst;
  if(!on(player,ISHALU))return;
  kill_daemon(visuals);
  player.t_flags&=~ISHALU;
  if(on(player,ISBLIND))return;
  /* undo the things */
  for(tp=lvl_obj;tp!==null;tp=tp.l_next)
    if(cansee(tp.o_pos.y,tp.o_pos.x))mvaddch(tp.o_pos.y,tp.o_pos.x,tp.o_type);
  /* undo the monsters */
  seemonst=on(player,SEEMONST);
  for(tp=mlist;tp!==null;tp=tp.l_next){
    move(tp.t_pos.y,tp.t_pos.x);
    if(cansee(tp.t_pos.y,tp.t_pos.x))
      if(!on(tp,ISINVIS)||on(player,CANSEE))addch(tp.t_disguise);
      else addch(chat(tp.t_pos.y,tp.t_pos.x));
    else if(seemonst){
      standout();
      addch(tp.t_type);
      standend();
    }
  }
  yield* msg('Everything looks SO boring now.');
}
function* visuals(){
  var tp,seemonst;
  if(!after||(running&&jump))return;
  /* change the things */
  for(tp=lvl_obj;tp!==null;tp=tp.l_next)
    if(cansee(tp.o_pos.y,tp.o_pos.x))mvaddch(tp.o_pos.y,tp.o_pos.x,rnd_thing());
  /* change the stairs */
  if(!seenstairs&&cansee(stairs.y,stairs.x))mvaddch(stairs.y,stairs.x,rnd_thing());
  /* change the monsters */
  seemonst=on(player,SEEMONST);
  for(tp=mlist;tp!==null;tp=tp.l_next){
    move(tp.t_pos.y,tp.t_pos.x);
    if(see_monst(tp)){
      if(tp.t_type===ord('X')&&tp.t_disguise!==ord('X'))addch(rnd_thing());
      else addch(rnd(26)+65);
    }
    else if(seemonst){
      standout();
      addch(rnd(26)+65);
      standend();
    }
  }
}
function* land(){
  player.t_flags&=~ISLEVIT;
  yield* msg(choose_str("bummer!  You've hit the ground",'you float gently to the ground'));
}

/* ---------- fight.c ---------- */
var h_names=[' scored an excellent hit on ',' hit ',' have injured ',' swing and hit ',' scored an excellent hit on ',' hit ',' has injured ',' swings and hits '];
var m_names=[' miss',' swing and miss',' barely miss'," don't hit",' misses',' swings and misses',' barely misses'," doesn't hit"];
var str_plus=[-7,-6,-5,-4,-3,-2,-1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,2,2,2,2,2,2,3];
var add_dam=[-7,-6,-5,-4,-3,-2,-1,0,0,0,0,0,0,0,0,0,1,1,2,3,3,4,5,5,5,5,5,5,5,5,5,6];
function* fight(mp,weap,thrown){
  var tp,did_hit=true,mname,ch;
  tp=moat(mp.y,mp.x);
  /* since we are fighting, things are not quiet so no healing takes place */
  count=0;
  quiet=0;
  runto(mp);
  /* let him know it was really a xeroc (if it was one) */
  ch=0;
  if(tp.t_type===ord('X')&&tp.t_disguise!==ord('X')&&!on(player,ISBLIND)){
    tp.t_disguise=ord('X');
    if(on(player,ISHALU)){
      ch=rnd(26)+65;
      mvaddch(tp.t_pos.y,tp.t_pos.x,ch);
    }
    yield* msg(choose_str("heavy!  That's a nasty critter!","wait!  That's a xeroc!"));
    if(!thrown)return false;
  }
  mname=set_mname(tp);
  did_hit=false;
  has_hit=terse&&!to_death;
  if(roll_em(player,tp,weap,thrown)){
    did_hit=false;
    if(thrown)yield* thunk(weap,mname,terse);
    else yield* hit(null,mname,terse);
    if(on(player,CANHUH)){
      did_hit=true;
      tp.t_flags|=ISHUH;
      player.t_flags&=~CANHUH;
      yield* endmsg();
      has_hit=false;
      yield* msg('your hands stop glowing '+pick_color('red'));
    }
    if(tp.t_stats.s_hpt<=0)yield* killed(tp,true);
    else if(did_hit&&!on(player,ISBLIND))yield* msg(mname+' appears confused');
    did_hit=true;
  }
  else if(thrown)yield* bounce(weap,mname,terse);
  else yield* miss(null,mname,terse);
  return did_hit;
}
function* attack(mp){
  var mname,oldhp;
  /* since this is an attack, stop running and any healing that was going on at the time */
  running=false;
  count=0;
  quiet=0;
  if(to_death&&!on(mp,ISTARGET)){
    to_death=false;
    kamikaze=false;
  }
  if(mp.t_type===ord('X')&&mp.t_disguise!==ord('X')&&!on(player,ISBLIND)){
    mp.t_disguise=ord('X');
    if(on(player,ISHALU))mvaddch(mp.t_pos.y,mp.t_pos.x,rnd(26)+65);
  }
  mname=set_mname(mp);
  oldhp=pstats.s_hpt;
  if(roll_em(mp,player,null,false)){
    if(mp.t_type!==ord('I')){
      if(has_hit)yield* addmsg('.  ');
      yield* hit(mname,null,false);
    }
    else if(has_hit)yield* endmsg();
    has_hit=false;
    if(pstats.s_hpt<=0)yield* death(mp.t_type);	/* bye bye life ... */
    else if(!kamikaze){
      oldhp-=pstats.s_hpt;
      if(oldhp>max_hit)max_hit=oldhp;
      if(pstats.s_hpt<=max_hit)to_death=false;
    }
    if(!on(mp,ISCANC))
      switch(chr(mp.t_type)){
        case 'A':
          /* if an aquator hits, you can lose armor class */
          yield* rust_armor(cur_armor);
          break;
        case 'I':
          /* the ice monster freezes you */
          player.t_flags&=~ISRUN;
          if(!no_command){
            yield* addmsg('you are frozen');
            if(!terse)yield* addmsg(' by the '+mname);
            yield* endmsg();
          }
          no_command+=rnd(2)+2;
          if(no_command>BORE_LEVEL)yield* death(ord('h'));
          break;
        case 'R':
          /* rattlesnakes have poisonous bites */
          if(!save(VS_POISON)){
            if(!ISWEARING(R_SUSTSTR)){
              chg_str(-1);
              if(!terse)yield* msg('you feel a bite in your leg and now feel weaker');
              else yield* msg('a bite has weakened you');
            }
            else if(!to_death){
              if(!terse)yield* msg('a bite momentarily weakens you');
              else yield* msg('bite has no effect');
            }
          }
          break;
        case 'W':
        case 'V':
          /* wraiths might drain energy levels, and vampires can steal max_hp */
          if(rnd(100)<(mp.t_type===ord('W')?15:30)){
            var fewer;
            if(mp.t_type===ord('W')){
              if(pstats.s_exp===0)yield* death(ord('W'));	/* all levels gone */
              if(--pstats.s_lvl===0){
                pstats.s_exp=0;
                pstats.s_lvl=1;
              }
              else pstats.s_exp=e_levels[pstats.s_lvl-1]+1;
              fewer=roll(1,10);
            }
            else fewer=roll(1,3);
            pstats.s_hpt-=fewer;
            pstats.s_maxhp-=fewer;
            if(pstats.s_hpt<=0)pstats.s_hpt=1;
            if(pstats.s_maxhp<=0)yield* death(mp.t_type);
            yield* msg('you suddenly feel weaker');
          }
          break;
        case 'F':
          /* venus flytrap stops the poor guy from moving */
          player.t_flags|=ISHELD;
          monsters[ord('F')-65].m_stats.s_dmg=(++vf_hit)+'x1';
          if(--pstats.s_hpt<=0)yield* death(ord('F'));
          break;
        case 'L':{
          /* leperachaun steals some gold */
          var lastpurse=purse;
          purse-=GOLDCALC();
          if(!save(VS_MAGIC))purse-=GOLDCALC()+GOLDCALC()+GOLDCALC()+GOLDCALC();
          if(purse<0)purse=0;
          remove_mon(mp.t_pos,mp,false);
          mp=null;
          if(purse!==lastpurse)yield* msg('your purse feels lighter');
          break;
        }
        case 'N':{
          /* nymphs steal a magic item, look through the pack and pick out one we like */
          var obj,steal=null,nobj;
          for(nobj=0,obj=player.t_pack;obj!==null;obj=obj.l_next)
            if(obj!==cur_armor&&obj!==cur_weapon&&obj!==cur_ring[LEFT]&&obj!==cur_ring[RIGHT]&&is_magic(obj)&&rnd(++nobj)===0)
              steal=obj;
          if(steal!==null){
            remove_mon(mp.t_pos,moat(mp.t_pos.y,mp.t_pos.x),false);
            mp=null;
            leave_pack(steal,false,false);
            yield* msg('she stole '+inv_name(steal,true)+'!');
            discard(steal);
          }
          break;
        }
      }
  }
  else if(mp.t_type!==ord('I')){
    if(has_hit){
      yield* addmsg('.  ');
      has_hit=false;
    }
    if(mp.t_type===ord('F')){
      pstats.s_hpt-=vf_hit;
      if(pstats.s_hpt<=0)yield* death(mp.t_type);	/* bye bye life ... */
    }
    yield* miss(mname,null,false);
  }
  if(fight_flush&&!to_death)flush_type();
  count=0;
  yield* status();
  return mp===null?-1:0;
}
function set_mname(tp){
  var ch,mname;
  if(!see_monst(tp)&&!on(player,SEEMONST))return terse?'it':'something';
  else if(on(player,ISHALU)){
    move(tp.t_pos.y,tp.t_pos.x);
    ch=toascii(inch());
    if(!isupper(ch))ch=rnd(26);
    else ch-=65;
    mname=monsters[ch].m_name;
  }
  else mname=monsters[tp.t_type-65].m_name;
  return 'the '+mname;
}
function swing(at_lvl,op_arm,wplus){
  var res=rnd(20),need=(20-at_lvl)-op_arm;
  return res+wplus>=need;
}
function roll_em(thatt,thdef,weap,hurl){
  var att,def,cps,at,ndice,nsides,def_arm,did_hit=false,hplus,dplus,damage;
  att=thatt.t_stats;
  def=thdef.t_stats;
  if(weap===null){
    cps=att.s_dmg;
    dplus=0;
    hplus=0;
  }
  else{
    hplus=weap.o_hplus;
    dplus=weap.o_dplus;
    if(weap===cur_weapon){
      if(ISRING(LEFT,R_ADDDAM))dplus+=cur_ring[LEFT].o_arm;
      else if(ISRING(LEFT,R_ADDHIT))hplus+=cur_ring[LEFT].o_arm;
      if(ISRING(RIGHT,R_ADDDAM))dplus+=cur_ring[RIGHT].o_arm;
      else if(ISRING(RIGHT,R_ADDHIT))hplus+=cur_ring[RIGHT].o_arm;
    }
    cps=weap.o_damage;
    if(hurl){
      if((weap.o_flags&ISMISL)&&cur_weapon!==null&&cur_weapon.o_which===weap.o_launch){
        cps=weap.o_hurldmg;
        hplus+=cur_weapon.o_hplus;
        dplus+=cur_weapon.o_dplus;
      }
      else if(weap.o_launch<0)cps=weap.o_hurldmg;
    }
  }
  /* if the creature being attacked is not running (alseep or held) then the attacker gets a plus four bonus to hit */
  if(!on(thdef,ISRUN))hplus+=4;
  def_arm=def.s_arm;
  if(def===pstats){
    if(cur_armor!==null)def_arm=cur_armor.o_arm;
    if(ISRING(LEFT,R_PROTECT))def_arm-=cur_ring[LEFT].o_arm;
    if(ISRING(RIGHT,R_PROTECT))def_arm-=cur_ring[RIGHT].o_arm;
  }
  at=0;
  while(at<cps.length){
    ndice=atoi(cps.slice(at));
    if((at=cps.indexOf('x',at))<0)break;
    nsides=atoi(cps.slice(++at));
    if(swing(att.s_lvl,def_arm,hplus+str_plus[att.s_str])){
      var proll=roll(ndice,nsides);
      damage=dplus+proll+add_dam[att.s_str];
      def.s_hpt-=Math.max(0,damage);
      did_hit=true;
    }
    if((at=cps.indexOf('/',at))<0)break;
    at++;
  }
  return did_hit;
}
function prname(mname,upper){
  var t=mname===null?'you':mname;
  if(upper)t=t.charAt(0).toUpperCase()+t.slice(1);
  return t;
}
function* thunk(weap,mname,noend){
  if(to_death)return;
  if(weap.o_type===WEAPON)yield* addmsg('the '+weap_info[weap.o_which].oi_name+' hits ');
  else yield* addmsg('you hit ');
  yield* addmsg(mname);
  if(!noend)yield* endmsg();
}
function* hit(er,ee,noend){
  var i,s;
  if(to_death)return;
  yield* addmsg(prname(er,true));
  if(terse)s=' hit';
  else{
    i=rnd(4);
    if(er!==null)i+=4;
    s=h_names[i];
  }
  yield* addmsg(s);
  if(!terse)yield* addmsg(prname(ee,false));
  if(!noend)yield* endmsg();
}
function* miss(er,ee,noend){
  var i;
  if(to_death)return;
  yield* addmsg(prname(er,true));
  if(terse)i=0;
  else i=rnd(4);
  if(er!==null)i+=4;
  yield* addmsg(m_names[i]);
  if(!terse)yield* addmsg(' '+prname(ee,false));
  if(!noend)yield* endmsg();
}
function* bounce(weap,mname,noend){
  if(to_death)return;
  if(weap.o_type===WEAPON)yield* addmsg('the '+weap_info[weap.o_which].oi_name+' misses ');
  else yield* addmsg('you missed ');
  yield* addmsg(mname);
  if(!noend)yield* endmsg();
}
/* fall() with pr FALSE can't reach a message, so this stays a plain function */
function remove_mon(mp,tp,waskill){
  var obj,nexti;
  for(obj=tp.t_pack;obj!==null;obj=nexti){
    nexti=obj.l_next;
    cp(obj.o_pos,tp.t_pos);
    tp.t_pack=detach(tp.t_pack,obj);
    if(waskill)fall_quiet(obj);
    else discard(obj);
  }
  setmoat(mp.y,mp.x,null);
  mvaddch(mp.y,mp.x,tp.t_oldch);
  mlist=detach(mlist,tp);
  if(on(tp,ISTARGET)){
    kamikaze=false;
    to_death=false;
    if(fight_flush)flush_type();
  }
  discard(tp);
}
function* killed(tp,pr){
  var mname;
  pstats.s_exp+=tp.t_stats.s_exp;
  /* if the monster was a venus flytrap, un-hold him */
  switch(chr(tp.t_type)){
    case 'F':
      player.t_flags&=~ISHELD;
      vf_hit=0;
      monsters[ord('F')-65].m_stats.s_dmg='000x0';
      break;
    case 'L':{
      var gold;
      if(fallpos(tp.t_pos,tp.t_room.r_gold)&&level>=max_level){
        gold=new_item();
        gold.o_type=GOLD;
        gold.o_arm=GOLDCALC();
        if(save(VS_MAGIC))gold.o_arm+=GOLDCALC()+GOLDCALC()+GOLDCALC()+GOLDCALC();
        tp.t_pack=attach(tp.t_pack,gold);
      }
    }
  }
  /* get rid of the monster */
  mname=set_mname(tp);
  remove_mon(tp.t_pos,tp,true);
  if(pr){
    if(has_hit){
      yield* addmsg('.  Defeated ');
      has_hit=false;
    }
    else{
      if(!terse)yield* addmsg('you have ');
      yield* addmsg('defeated ');
    }
    yield* msg(mname);
  }
  /* do adjustments if he went up a level */
  yield* check_level();
  if(fight_flush)flush_type();
}

/* ---------- misc.c ---------- */
function* look(wakeup){
  var x,y,ch,tp,i,rp,ey,ex,passcount,pfl,fp,pch,sy,sx,sumhero=0,diffhero=0;
  passcount=0;
  rp=player.t_room;
  if(!ce(oldpos,hero)){
    erase_lamp(oldpos,oldrp);
    cp(oldpos,hero);
    oldrp=rp;
  }
  ey=hero.y+1;
  ex=hero.x+1;
  sx=hero.x-1;
  sy=hero.y-1;
  if(door_stop&&!firstmove&&running){
    sumhero=hero.y+hero.x;
    diffhero=hero.y-hero.x;
  }
  i=INDEX(hero.y,hero.x);
  pch=pl_ch[i];
  pfl=pl_fl[i];
  for(y=sy;y<=ey;y++)
    if(y>0&&y<NUMLINES-1)for(x=sx;x<=ex;x++){
      if(x<0||x>=NUMCOLS)continue;
      if(!on(player,ISBLIND)){
        if(y===hero.y&&x===hero.x)continue;
      }
      i=INDEX(y,x);
      ch=pl_ch[i];
      if(ch===SPACE)continue;	/* nothing need be done with a ' ' */
      fp=pl_fl[i];
      if(pch!==DOOR&&ch!==DOOR)
        if((pfl&F_PASS)!==(fp&F_PASS))continue;
      if(((fp&F_PASS)||ch===DOOR)&&((pfl&F_PASS)||pch===DOOR)){
        if(hero.x!==x&&hero.y!==y&&!step_ok(chat(y,hero.x))&&!step_ok(chat(hero.y,x)))
          continue;
      }
      if((tp=pl_mo[i])===null)ch=trip_ch(y,x,ch);
      else if(on(player,SEEMONST)&&on(tp,ISINVIS)){
        if(door_stop&&!firstmove)running=false;
        continue;
      }
      else{
        if(wakeup)yield* wake_monster(y,x);
        if(see_monst(tp)){
          if(on(player,ISHALU))ch=rnd(26)+65;
          else ch=tp.t_disguise;
        }
      }
      if(on(player,ISBLIND)&&(y!==hero.y||x!==hero.x))continue;
      move(y,x);
      if((player.t_room.r_flags&ISDARK)&&!see_floor&&ch===FLOOR)ch=SPACE;
      if(tp!==null||ch!==CCHAR(inch()))addch(ch);
      if(door_stop&&!firstmove&&running){
        switch(chr(runch)){
          case 'h':if(x===ex)continue;break;
          case 'j':if(y===sy)continue;break;
          case 'k':if(y===ey)continue;break;
          case 'l':if(x===sx)continue;break;
          case 'y':if((y+x)-sumhero>=1)continue;break;
          case 'u':if((y-x)-diffhero>=1)continue;break;
          case 'n':if((y+x)-sumhero<=-1)continue;break;
          case 'b':if((y-x)-diffhero<=-1)continue;break;
        }
        switch(ch){
          case DOOR:
            if(x===hero.x||y===hero.y)running=false;
            break;
          case PASSAGE:
            if(x===hero.x||y===hero.y)passcount++;
            break;
          case FLOOR:case VWALL:case HWALL:case SPACE:
            break;
          default:
            running=false;
            break;
        }
      }
    }
  if(door_stop&&!firstmove&&passcount>1)running=false;
  if(!running||!jump)mvaddch(hero.y,hero.x,PLAYER);
}
function trip_ch(y,x,ch){
  if(on(player,ISHALU)&&after)
    switch(ch){
      case FLOOR:case SPACE:case PASSAGE:case HWALL:case VWALL:case DOOR:case TRAP:
        break;
      default:
        if(y!==stairs.y||x!==stairs.x||!seenstairs)ch=rnd_thing();
        break;
    }
  return ch;
}
function erase_lamp(pos,rp){
  var y,x,ey,sy,ex;
  if(!(see_floor&&(rp.r_flags&(ISGONE|ISDARK))===ISDARK&&!on(player,ISBLIND)))return;
  ey=pos.y+1;
  ex=pos.x+1;
  sy=pos.y-1;
  for(x=pos.x-1;x<=ex;x++)
    for(y=sy;y<=ey;y++){
      if(y===hero.y&&x===hero.x)continue;
      move(y,x);
      if(inch()===FLOOR)addch(SPACE);
    }
}
function show_floor(){
  if((player.t_room.r_flags&(ISGONE|ISDARK))===ISDARK&&!on(player,ISBLIND))return see_floor;
  return true;
}
function find_obj(y,x){
  var obj;
  for(obj=lvl_obj;obj!==null;obj=obj.l_next){
    if(obj.o_pos.y===y&&obj.o_pos.x===x)return obj;
  }
  return null;
}
function* eat(){
  var obj;
  if((obj=yield* get_item('eat',FOOD))===null)return;
  if(obj.o_type!==FOOD){
    if(!terse)yield* msg('ugh, you would get ill if you ate that');
    else yield* msg("that's Inedible!");
    return;
  }
  if(food_left<0)food_left=0;
  if((food_left+=HUNGERTIME-200+rnd(400))>STOMACHSIZE)food_left=STOMACHSIZE;
  hungry_state=0;
  if(obj===cur_weapon)cur_weapon=null;
  if(obj.o_which===1)yield* msg('my, that was a yummy '+fruit);
  else if(rnd(100)>70){
    pstats.s_exp++;
    yield* msg(choose_str('bummer','yuk')+', this food tastes awful');
    yield* check_level();
  }
  else yield* msg(choose_str('oh, wow','yum')+', that tasted good');
  leave_pack(obj,false,false);
}
function* check_level(){
  var i,add,olevel;
  for(i=0;e_levels[i]!==0;i++)
    if(e_levels[i]>pstats.s_exp)break;
  i++;
  olevel=pstats.s_lvl;
  pstats.s_lvl=i;
  if(i>olevel){
    add=roll(i-olevel,10);
    pstats.s_maxhp+=add;
    pstats.s_hpt+=add;
    yield* msg('welcome to level '+i);
  }
}
function chg_str(amt){
  var comp;
  if(amt===0)return;
  pstats.s_str=add_str(pstats.s_str,amt);
  comp=pstats.s_str;
  if(ISRING(LEFT,R_ADDSTR))comp=add_str(comp,-cur_ring[LEFT].o_arm);
  if(ISRING(RIGHT,R_ADDSTR))comp=add_str(comp,-cur_ring[RIGHT].o_arm);
  if(comp>max_stats.s_str)max_stats.s_str=comp;
}
function add_str(sp,amt){ /* s_str is unsigned in the C, and this is where it shows */
  sp=(sp+amt)>>>0;
  if(sp<3)sp=3;
  else if(sp>31)sp=31;
  return sp;
}
function* add_haste(potion){
  if(on(player,ISHASTE)){
    no_command+=rnd(8);
    player.t_flags&=~(ISRUN|ISHASTE);
    extinguish(nohaste);
    yield* msg('you faint from exhaustion');
    return false;
  }
  else{
    player.t_flags|=ISHASTE;
    if(potion)fuse(nohaste,0,rnd(4)+4,AFTER);
    return true;
  }
}
function aggravate(){
  var mp;
  for(mp=mlist;mp!==null;mp=mp.l_next)runto(mp.t_pos);
}
function vowelstr(str){
  switch(str.charAt(0)){
    case 'a':case 'A':case 'e':case 'E':case 'i':case 'I':case 'o':case 'O':case 'u':case 'U':
      return 'n';
    default:
      return '';
  }
}
function* is_current(obj){
  if(obj===null)return false;
  if(obj===cur_armor||obj===cur_weapon||obj===cur_ring[LEFT]||obj===cur_ring[RIGHT]){
    if(!terse)yield* addmsg("That's already ");
    yield* msg('in use');
    return true;
  }
  return false;
}
var last_delt={x:0,y:0};
function* get_dir(){
  var prompt,gotit;
  if(again&&last_dir!==0){
    delta.y=last_delt.y;
    delta.x=last_delt.x;
    dir_ch=last_dir;
  }
  else{
    if(!terse)yield* msg(prompt='which direction? ');
    else prompt='direction: ';
    do{
      gotit=true;
      switch(chr(dir_ch=yield* readchar())){
        case 'h':case 'H':delta.y=0;delta.x=-1;break;
        case 'j':case 'J':delta.y=1;delta.x=0;break;
        case 'k':case 'K':delta.y=-1;delta.x=0;break;
        case 'l':case 'L':delta.y=0;delta.x=1;break;
        case 'y':case 'Y':delta.y=-1;delta.x=-1;break;
        case 'u':case 'U':delta.y=-1;delta.x=1;break;
        case 'b':case 'B':delta.y=1;delta.x=-1;break;
        case 'n':case 'N':delta.y=1;delta.x=1;break;
        case '\x1b':last_dir=0;reset_last();return false;
        default:
          mpos=0;
          yield* msg(prompt);
          gotit=false;
      }
    }while(!gotit);
    if(isupper(dir_ch))dir_ch+=32;
    last_dir=dir_ch;
    last_delt.y=delta.y;
    last_delt.x=delta.x;
  }
  if(on(player,ISHUH)&&rnd(5)===0)
    do{
      delta.y=rnd(3)-1;
      delta.x=rnd(3)-1;
    }while(delta.y===0&&delta.x===0);
  mpos=0;
  return true;
}
function sign(nm){return nm<0?-1:(nm>0?1:0)}
function spread(nm){return nm-idiv(nm,20)+rnd(idiv(nm,10))}
function* call_it(info){
  if(info.oi_know){
    if(info.oi_guess)info.oi_guess=null;
  }
  else if(!info.oi_guess){
    yield* msg(terse?'call it: ':'what do you want to call it? ');
    var ref={get:function(){return prbuf},set:function(v){prbuf=v}};
    if((yield* get_str(ref,stdscr))===NORM)info.oi_guess=prbuf;
  }
}
var thing_list=[POTION,SCROLL,RING,STICK,FOOD,WEAPON,ARMOR,STAIRS,GOLD,AMULET];
function rnd_thing(){
  var i;
  if(level>=AMULETLEVEL)i=rnd(thing_list.length);
  else i=rnd(thing_list.length-1);
  return thing_list[i];
}
function choose_str(ts,ns){return on(player,ISHALU)?ts:ns}

/* ---------- monsters.c ---------- */
var lvl_mons='KEBSHIROZLCQANYFTWPXUMVGJD';
var wand_mons=[75,69,66,83,72,0,82,79,90,0,67,81,65,0,89,0,84,87,80,0,85,77,86,71,74,0];
function randmonster(wander){
  var d;
  do{
    d=level+(rnd(10)-6);
    if(d<0)d=rnd(5);
    if(d>25)d=rnd(5)+21;
  }while((wander?wand_mons[d]:lvl_mons.charCodeAt(d))===0);
  return wander?wand_mons[d]:lvl_mons.charCodeAt(d);
}
function new_monster(tp,type,c){
  var mp,lev_add;
  if((lev_add=level-AMULETLEVEL)<0)lev_add=0;
  mlist=attach(mlist,tp);
  tp.t_type=type;
  tp.t_disguise=type;
  cp(tp.t_pos,c);
  move(c.y,c.x);
  tp.t_oldch=CCHAR(inch());
  tp.t_room=roomin(c);
  setmoat(c.y,c.x,tp);
  mp=monsters[tp.t_type-65];
  tp.t_stats.s_lvl=mp.m_stats.s_lvl+lev_add;
  tp.t_stats.s_maxhp=tp.t_stats.s_hpt=roll(tp.t_stats.s_lvl,8);
  tp.t_stats.s_arm=mp.m_stats.s_arm-lev_add;
  tp.t_stats.s_dmg=mp.m_stats.s_dmg;
  tp.t_stats.s_str=mp.m_stats.s_str;
  tp.t_stats.s_exp=mp.m_stats.s_exp+lev_add*10+exp_add(tp);
  tp.t_flags=mp.m_flags;
  if(level>29)tp.t_flags|=ISHASTE;
  tp.t_turn=true;
  tp.t_pack=null;
  if(ISWEARING(R_AGGR))runto(c);
  if(type===ord('X'))tp.t_disguise=rnd_thing();
}
function exp_add(tp){
  var mod;
  if(tp.t_stats.s_lvl===1)mod=idiv(tp.t_stats.s_maxhp,8);
  else mod=idiv(tp.t_stats.s_maxhp,6);
  if(tp.t_stats.s_lvl>9)mod*=20;
  else if(tp.t_stats.s_lvl>6)mod*=4;
  return mod;
}
var wand_cp={x:0,y:0};
function wanderer(){
  var tp=new_item();
  do{
    find_floor(null,wand_cp,false,true);
  }while(roomin(wand_cp)===player.t_room);
  new_monster(tp,randmonster(true),wand_cp);
  if(on(player,SEEMONST)){
    standout();
    if(!on(player,ISHALU))addch(tp.t_type);
    else addch(rnd(26)+65);
    standend();
  }
  runto(tp.t_pos);
}
function* wake_monster(y,x){
  var tp,rp,ch,mname;
  tp=moat(y,x);
  if(tp===null)throw new Error('wake_monster: no monster');	/* the C aborts here */
  ch=tp.t_type;
  /* every time he sees mean monster, it might start chasing him */
  if(!on(tp,ISRUN)&&rnd(3)!==0&&on(tp,ISMEAN)&&!on(tp,ISHELD)&&!ISWEARING(R_STEALTH)&&!on(player,ISLEVIT)){
    tp.t_dest=hero;
    tp.t_flags|=ISRUN;
  }
  if(ch===ord('M')&&!on(player,ISBLIND)&&!on(player,ISHALU)&&!on(tp,ISFOUND)&&!on(tp,ISCANC)&&on(tp,ISRUN)){
    rp=player.t_room;
    if((rp!==null&&!(rp.r_flags&ISDARK))||dist(y,x,hero.y,hero.x)<LAMPDIST){
      tp.t_flags|=ISFOUND;
      if(!save(VS_MAGIC)){
        if(on(player,ISHUH))lengthen(unconfuse,spread(HUHDURATION));
        else fuse(unconfuse,0,spread(HUHDURATION),AFTER);
        player.t_flags|=ISHUH;
        mname=set_mname(tp);
        yield* addmsg(mname);
        if(mname!=='it')yield* addmsg("'");
        yield* msg('s gaze has confused you');
      }
    }
  }
  /* let greedy ones guard gold */
  if(on(tp,ISGREED)&&!on(tp,ISRUN)){
    tp.t_flags|=ISRUN;
    if(player.t_room.r_goldval)tp.t_dest=player.t_room.r_gold;
    else tp.t_dest=hero;
  }
  return tp;
}
function give_pack(tp){
  if(level>=max_level&&rnd(100)<monsters[tp.t_type-65].m_carry)tp.t_pack=attach(tp.t_pack,new_thing());
}
function save_throw(which,tp){
  var need=14+which-idiv(tp.t_stats.s_lvl,2);
  return roll(1,20)>=need;
}
function save(which){
  if(which===VS_MAGIC){
    if(ISRING(LEFT,R_PROTECT))which-=cur_ring[LEFT].o_arm;
    if(ISRING(RIGHT,R_PROTECT))which-=cur_ring[RIGHT].o_arm;
  }
  return save_throw(which,player);
}

/* ---------- move.c ---------- */
function do_run(ch){
  running=true;
  after=false;
  runch=ch;
}
function* do_move(dy,dx){
  var ch,fl,b1,b2;
  firstmove=false;
  if(no_move){
    no_move--;
    yield* msg('you are still stuck in the bear trap');
    return;
  }
  /* do a confused move (maybe) */
  if(on(player,ISHUH)&&rnd(5)!==0){
    cp(nh,rndmove(player));
    if(ce(nh,hero)){
      after=false;
      running=false;
      to_death=false;
      return;
    }
  }
  else{
    nh.y=hero.y+dy;
    nh.x=hero.x+dx;
  }
  for(;;){ /* over: */
    /* check if he tried to move off the screen or make an illegal diagonal move, and stop him if he did */
    var bound=nh.x<0||nh.x>=NUMCOLS||nh.y<=0||nh.y>=NUMLINES-1;
    if(!bound){
      if(!diag_ok(hero,nh)){
        after=false;
        running=false;
        return;
      }
      if(running&&ce(hero,nh))after=running=false;
      fl=flat(nh.y,nh.x);
      ch=winat(nh.y,nh.x);
      if(!(fl&F_REAL)&&ch===FLOOR){
        if(!on(player,ISLEVIT)){
          ch=TRAP;
          setchat(nh.y,nh.x,TRAP);
          setflat(nh.y,nh.x,flat(nh.y,nh.x)|F_REAL);
        }
      }
      else if(on(player,ISHELD)&&ch!==ord('F')){
        yield* msg('you are being held');
        return;
      }
    }
    if(bound||ch===SPACE||ch===VWALL||ch===HWALL){
      /* hit_bound: */
      if(passgo&&running&&(player.t_room.r_flags&ISGONE)&&!on(player,ISBLIND)){
        var turned=false;
        switch(chr(runch)){
          case 'h':case 'l':
            b1=hero.y!==1&&turn_ok(hero.y-1,hero.x);
            b2=hero.y!==NUMLINES-2&&turn_ok(hero.y+1,hero.x);
            if(b1===b2)break;
            if(b1){runch=ord('k');dy=-1}
            else{runch=ord('j');dy=1}
            dx=0;
            turnref();
            turned=true;
            break;
          case 'j':case 'k':
            b1=hero.x!==0&&turn_ok(hero.y,hero.x-1);
            b2=hero.x!==NUMCOLS-1&&turn_ok(hero.y,hero.x+1);
            if(b1===b2)break;
            if(b1){runch=ord('h');dx=-1}
            else{runch=ord('l');dx=1}
            dy=0;
            turnref();
            turned=true;
            break;
        }
        if(turned){
          nh.y=hero.y+dy;
          nh.x=hero.x+dx;
          continue;
        }
      }
      running=false;
      after=false;
      return;
    }
    break;
  }
  switch(ch){
    case DOOR:
      running=false;
      if(flat(hero.y,hero.x)&F_PASS)yield* enter_room(nh);
      break;
    case TRAP:
      ch=yield* be_trapped(nh);
      if(ch===T_DOOR||ch===T_TELEP)return;
      break;
    case PASSAGE:
      /* when you're in a corridor, you don't know if you're in a maze room or not, and there
         ain't no way to find out if you're leaving a maze room, so always recalculate proom */
      player.t_room=roomin(hero);
      break;
    case FLOOR:
      if(!(fl&F_REAL))yield* be_trapped(hero);
      break;
    case STAIRS:
      seenstairs=true;
      /* FALLTHROUGH */
    default:
      running=false;
      if(isupper(ch)||moat(nh.y,nh.x)!==null){
        yield* fight(nh,cur_weapon,false);
        return;
      }
      if(ch!==STAIRS)take=ch;
  }
  /* move_stuff: */
  mvaddch(hero.y,hero.x,floor_at());
  if((fl&F_PASS)&&chat(oldpos.y,oldpos.x)===DOOR)yield* leave_room(nh);
  cp(hero,nh);
}
function turn_ok(y,x){
  var i=INDEX(y,x);
  return pl_ch[i]===DOOR||(pl_fl[i]&(F_REAL|F_PASS))===(F_REAL|F_PASS);
}
function turnref(){
  var i=INDEX(hero.y,hero.x);
  if(!(pl_fl[i]&F_SEEN)){
    if(jump){
      leaveok(stdscr,true);
      refresh();
      leaveok(stdscr,false);
    }
    pl_fl[i]|=F_SEEN;
  }
}
function* door_open(rp){
  var y,x;
  if(!(rp.r_flags&ISGONE))
    for(y=rp.r_pos.y;y<rp.r_pos.y+rp.r_max.y;y++)
      for(x=rp.r_pos.x;x<rp.r_pos.x+rp.r_max.x;x++)
        if(isupper(winat(y,x)))yield* wake_monster(y,x);
}
function* be_trapped(tc){
  var i,arrow,tr;
  if(on(player,ISLEVIT))return T_RUST;	/* anything that's not a door or teleport */
  running=false;
  count=0;
  i=INDEX(tc.y,tc.x);
  pl_ch[i]=TRAP;
  tr=pl_fl[i]&F_TMASK;
  pl_fl[i]|=F_SEEN;
  switch(tr){
    case T_DOOR:
      level++;
      yield* new_level();
      yield* msg('you fell into a trap!');
      break;
    case T_BEAR:
      no_move+=BEARTIME;
      yield* msg('you are caught in a bear trap');
      break;
    case T_MYST:
      switch(rnd(11)){
        case 0:yield* msg('you are suddenly in a parallel dimension');break;
        case 1:yield* msg('the light in here suddenly seems '+rainbow[rnd(NCOLORS)]);break;
        case 2:yield* msg('you feel a sting in the side of your neck');break;
        case 3:yield* msg('multi-colored lines swirl around you, then fade');break;
        case 4:yield* msg('a '+rainbow[rnd(NCOLORS)]+' light flashes in your eyes');break;
        case 5:yield* msg('a spike shoots past your ear!');break;
        case 6:yield* msg(rainbow[rnd(NCOLORS)]+' sparks dance across your armor');break;
        case 7:yield* msg('you suddenly feel very thirsty');break;
        case 8:yield* msg('you feel time speed up suddenly');break;
        case 9:yield* msg('time now seems to be going slower');break;
        case 10:yield* msg('you pack turns '+rainbow[rnd(NCOLORS)]+'!');break;
      }
      break;
    case T_SLEEP:
      no_command+=SLEEPTIME;
      player.t_flags&=~ISRUN;
      yield* msg('a strange white mist envelops you and you fall asleep');
      break;
    case T_ARROW:
      if(swing(pstats.s_lvl-1,pstats.s_arm,1)){
        pstats.s_hpt-=roll(1,6);
        if(pstats.s_hpt<=0){
          yield* msg('an arrow killed you');
          yield* death(ord('a'));
        }
        else yield* msg('oh no! An arrow shot you');
      }
      else{
        arrow=new_item();
        init_weapon(arrow,ARROW);
        arrow.o_count=1;
        cp(arrow.o_pos,hero);
        fall_quiet(arrow);
        yield* msg('an arrow shoots past you');
      }
      break;
    case T_TELEP:
      /* since the hero's leaving, look() won't put a TRAP down for us, so we have to do it ourself */
      yield* teleport();
      mvaddch(tc.y,tc.x,TRAP);
      break;
    case T_DART:
      if(!swing(pstats.s_lvl+1,pstats.s_arm,1))yield* msg('a small dart whizzes by your ear and vanishes');
      else{
        pstats.s_hpt-=roll(1,4);
        if(pstats.s_hpt<=0){
          yield* msg('a poisoned dart killed you');
          yield* death(ord('d'));
        }
        if(!ISWEARING(R_SUSTSTR)&&!save(VS_POISON))chg_str(-1);
        yield* msg('a small dart just hit you in the shoulder');
      }
      break;
    case T_RUST:
      yield* msg('a gush of water hits you on the head');
      yield* rust_armor(cur_armor);
      break;
  }
  flush_type();
  return tr;
}
var rnd_ret={x:0,y:0};
function rndmove(who){
  var obj,x,y,ch,bad=false;
  y=rnd_ret.y=who.t_pos.y+rnd(3)-1;
  x=rnd_ret.x=who.t_pos.x+rnd(3)-1;
  /* now check to see if that's a legal move: if not, don't move */
  if(y===who.t_pos.y&&x===who.t_pos.x)return rnd_ret;
  if(!diag_ok(who.t_pos,rnd_ret))bad=true;
  else{
    ch=winat(y,x);
    if(!step_ok(ch))bad=true;
    else if(ch===SCROLL){
      for(obj=lvl_obj;obj!==null;obj=obj.l_next)
        if(y===obj.o_pos.y&&x===obj.o_pos.x)break;
      if(obj!==null&&obj.o_which===S_SCARE)bad=true;
    }
  }
  if(bad)cp(rnd_ret,who.t_pos);
  return rnd_ret;
}
function* rust_armor(arm){
  if(arm===null||arm.o_type!==ARMOR||arm.o_which===LEATHER||arm.o_arm>=9)return;
  if((arm.o_flags&ISPROT)||ISWEARING(R_SUSTARM)){
    if(!to_death)yield* msg('the rust vanishes instantly');
  }
  else{
    arm.o_arm++;
    if(!terse)yield* msg('your armor appears to be weaker now. Oh my!');
    else yield* msg('your armor weakens');
  }
}

/* ---------- new_level.c ---------- */
var TREAS_ROOM=20,MAXTREAS=10,MINTREAS=2,MAXTRIES=10;
function* new_level(){
  var tp,i;
  player.t_flags&=~ISHELD;	/* unhold when you go down just in case */
  if(level>max_level)max_level=level;
  /* clean things off from last level */
  pl_ch.fill(SPACE);
  pl_fl.fill(F_REAL);
  pl_mo.fill(null);
  clear();
  /* the monsters and stuff on the previous level go with their lists */
  mlist=null;
  lvl_obj=null;
  do_rooms();		/* draw rooms */
  yield* do_passages();	/* draw passages */
  no_food++;
  put_things();		/* place objects (if any) */
  /* place the traps */
  if(rnd(10)<level){
    ntraps=rnd(idiv(level,4))+1;
    if(ntraps>MAXTRAPS)ntraps=MAXTRAPS;
    i=ntraps;
    while(i--){
      /* not only wouldn't it be NICE to have traps in mazes (not that we care about being nice),
         since the trap number is stored where the passage number is, we can't actually do it */
      do{
        find_floor(null,stairs,false,false);
      }while(chat(stairs.y,stairs.x)!==FLOOR);
      var f=flat(stairs.y,stairs.x);
      f&=~F_REAL;
      f|=rnd(NTRAPS);
      setflat(stairs.y,stairs.x,f);
    }
  }
  /* place the staircase down */
  find_floor(null,stairs,false,false);
  setchat(stairs.y,stairs.x,STAIRS);
  seenstairs=false;
  for(tp=mlist;tp!==null;tp=tp.l_next)tp.t_room=roomin(tp.t_pos);
  find_floor(null,hero,false,true);
  yield* enter_room(hero);
  mvaddch(hero.y,hero.x,PLAYER);
  if(on(player,SEEMONST))turn_see(false);
  if(on(player,ISHALU))yield* visuals();
}
function rnd_room(){
  var rm;
  do{
    rm=rnd(MAXROOMS);
  }while(rooms[rm].r_flags&ISGONE);
  return rm;
}
function put_things(){
  var i,obj;
  /* once you have found the amulet, the only way to get new stuff is go down into the dungeon */
  if(amulet&&level<max_level)return;
  /* check for treasure rooms, and if so, put it in */
  if(rnd(TREAS_ROOM)===0)treas_room();
  /* do MAXOBJ attempts to put things on a level */
  for(i=0;i<MAXOBJ;i++)
    if(rnd(100)<36){
      obj=new_thing();
      lvl_obj=attach(lvl_obj,obj);
      find_floor(null,obj.o_pos,false,false);
      setchat(obj.o_pos.y,obj.o_pos.x,obj.o_type);
    }
  /* if he is really deep in the dungeon and he hasn't found the amulet yet, put it somewhere on the ground */
  if(level>=AMULETLEVEL&&!amulet){
    obj=new_item();
    lvl_obj=attach(lvl_obj,obj);
    obj.o_hplus=0;
    obj.o_dplus=0;
    obj.o_damage='0x0';
    obj.o_hurldmg='0x0';
    obj.o_arm=11;
    obj.o_type=AMULET;
    find_floor(null,obj.o_pos,false,false);
    setchat(obj.o_pos.y,obj.o_pos.x,AMULET);
  }
}
var treas_mp={x:0,y:0};
function treas_room(){
  var nm,tp,rp,spots,num_monst;
  rp=rooms[rnd_room()];
  spots=(rp.r_max.y-2)*(rp.r_max.x-2)-MINTREAS;
  if(spots>(MAXTREAS-MINTREAS))spots=MAXTREAS-MINTREAS;
  num_monst=nm=rnd(spots)+MINTREAS;
  while(nm--){
    find_floor(rp,treas_mp,2*MAXTRIES,false);
    tp=new_thing();
    cp(tp.o_pos,treas_mp);
    lvl_obj=attach(lvl_obj,tp);
    setchat(treas_mp.y,treas_mp.x,tp.o_type);
  }
  /* fill up room with monsters from the next level down */
  if((nm=rnd(spots)+MINTREAS)<num_monst+2)nm=num_monst+2;
  spots=(rp.r_max.y-2)*(rp.r_max.x-2);
  if(nm>spots)nm=spots;
  level++;
  while(nm--){
    spots=0;
    if(find_floor(rp,treas_mp,MAXTRIES,true)){
      tp=new_item();
      new_monster(tp,randmonster(false),treas_mp);
      tp.t_flags|=ISMEAN;	/* no sloughers in THIS room */
      give_pack(tp);
    }
  }
  level--;
}

/* ---------- options.c ---------- */
function boolopt(g,s){return {get:g,set:s}}
var optlist=[
  {o_name:'terse',o_prompt:'Terse output',o_opt:boolopt(function(){return terse},function(v){terse=v}),o_kind:'b',o_getfunc:get_bool},
  {o_name:'flush',o_prompt:'Flush typeahead during battle',o_opt:boolopt(function(){return fight_flush},function(v){fight_flush=v}),o_kind:'b',o_getfunc:get_bool},
  {o_name:'jump',o_prompt:'Show position only at end of run',o_opt:boolopt(function(){return jump},function(v){jump=v}),o_kind:'b',o_getfunc:get_bool},
  {o_name:'seefloor',o_prompt:'Show the lamp-illuminated floor',o_opt:boolopt(function(){return see_floor},function(v){see_floor=v}),o_kind:'b',o_getfunc:get_sf},
  {o_name:'passgo',o_prompt:'Follow turnings in passageways',o_opt:boolopt(function(){return passgo},function(v){passgo=v}),o_kind:'b',o_getfunc:get_bool},
  {o_name:'tombstone',o_prompt:'Print out tombstone and score when killed',o_opt:boolopt(function(){return tombstone},function(v){tombstone=v}),o_kind:'b',o_getfunc:get_bool},
  {o_name:'inven',o_prompt:'Inventory style',o_opt:boolopt(function(){return inv_type},function(v){inv_type=v}),o_kind:'i',o_getfunc:get_inv_t},
  {o_name:'name',o_prompt:'Name',o_opt:boolopt(function(){return whoami},function(v){whoami=v}),o_kind:'s',o_getfunc:get_str},
  {o_name:'fruit',o_prompt:'Fruit',o_opt:boolopt(function(){return fruit},function(v){fruit=v}),o_kind:'s',o_getfunc:get_str},
  {o_name:'file',o_prompt:'Save file',o_opt:boolopt(function(){return file_name},function(v){file_name=v}),o_kind:'s',o_getfunc:get_str}
];
var NUM_OPTS=optlist.length;
function* option(){
  var o,op,retval;
  wclear(hw);
  /* display current values of options */
  for(o=0;o<NUM_OPTS;o++){
    op=optlist[o];
    pr_optname(op);
    if(op.o_kind==='b')waddstr(hw,op.o_opt.get()?'True':'False');
    else if(op.o_kind==='i')waddstr(hw,inv_t_name[op.o_opt.get()]);
    else waddstr(hw,op.o_opt.get());
    waddch(hw,10);
  }
  /* set values */
  wmove(hw,0,0);
  for(o=0;o<NUM_OPTS;o++){
    op=optlist[o];
    pr_optname(op);
    retval=yield* op.o_getfunc(op.o_opt,hw);
    if(retval){
      if(retval===QUIT)break;
      else if(o>0){	/* MINUS */
        wmove(hw,o-1,0);
        o-=2;
      }
      else{	/* trying to back up beyond the top */
        wmove(hw,0,0);
        o--;
      }
    }
  }
  /* switch back to original screen */
  wmove(hw,LINES-1,0);
  waddstr(hw,'--Press space to continue--');
  wrefresh(hw);
  yield* wait_for(32);
  clearok(curscr,true);
  touchwin(stdscr);
  after=false;
}
function pr_optname(op){waddstr(hw,op.o_prompt+' ("'+op.o_name+'"): ')}
function* get_bool(bp,win){
  var oy,ox,op_bad=true,c;
  oy=win.y;ox=win.x;
  waddstr(win,bp.get()?'True':'False');
  while(op_bad){
    wmove(win,oy,ox);
    wrefresh(win);
    c=yield* readchar();
    switch(c){
      case ord('t'):case ord('T'):
        bp.set(true);
        op_bad=false;
        break;
      case ord('f'):case ord('F'):
        bp.set(false);
        op_bad=false;
        break;
      case 10:case 13:
        op_bad=false;
        break;
      case ESCAPE:
        return QUIT;
      case ord('-'):
        return MINUS;
      default:
        wmove(win,oy,ox+10);
        waddstr(win,'(T or F)');
    }
  }
  wmove(win,oy,ox);
  waddstr(win,bp.get()?'True':'False');
  waddch(win,10);
  return NORM;
}
function* get_sf(bp,win){
  var was_sf,retval;
  was_sf=see_floor;
  retval=yield* get_bool(bp,win);
  if(retval===QUIT)return QUIT;
  if(was_sf!==see_floor){
    if(!see_floor){
      see_floor=true;
      erase_lamp(hero,player.t_room);
      see_floor=false;
    }
    else yield* look(false);
  }
  return NORM;
}
function* get_str(opt,win){
  var oy,ox,i,c,sb='';
  oy=win.y;ox=win.x;
  wrefresh(win);
  /* loop reading in the string, and put it in a temporary buffer */
  for(;;){
    c=yield* readchar();
    if(c===10||c===13||c===ESCAPE)break;
    if(c===ERASECH){	/* process erase character */
      if(sb.length>0){
        for(i=unctrl(sb.charCodeAt(sb.length-1)).length;i;i--)waddch(win,8);
        sb=sb.slice(0,-1);
      }
    }
    else if(c===KILLCH){	/* process kill character */
      sb='';
      wmove(win,oy,ox);
    }
    else if(sb===''&&c===ord('-')&&win!==stdscr)break;
    else if(sb===''&&c===ord('~')){
      sb=home;
      waddstr(win,home);
    }
    else if(!(sb.length>=MAXINP||!isprint(c))){
      sb+=chr(c);
      waddstr(win,unctrl(c));
    }
    wclrtoeol(win);
    wrefresh(win);
  }
  if(sb.length>0)opt.set(strucpy(sb,sb.length));	/* only change option if something has been typed */
  mvwprintw(win,oy,ox,opt.get()+'\n');
  wrefresh(win);
  if(win===stdscr)mpos+=sb.length;
  if(c===ord('-'))return MINUS;
  else if(c===ESCAPE)return QUIT;
  else return NORM;
}
function* get_inv_t(ip,win){
  var oy,ox,op_bad=true,c;
  oy=win.y;ox=win.x;
  waddstr(win,inv_t_name[ip.get()]);
  while(op_bad){
    wmove(win,oy,ox);
    wrefresh(win);
    c=yield* readchar();
    switch(c){
      case ord('o'):case ord('O'):
        ip.set(INV_OVER);
        op_bad=false;
        break;
      case ord('s'):case ord('S'):
        ip.set(INV_SLOW);
        op_bad=false;
        break;
      case ord('c'):case ord('C'):
        ip.set(INV_CLEAR);
        op_bad=false;
        break;
      case 10:case 13:
        op_bad=false;
        break;
      case ESCAPE:
        return QUIT;
      case ord('-'):
        return MINUS;
      default:
        wmove(win,oy,ox+15);
        waddstr(win,'(O, S, or C)');
    }
  }
  mvwprintw(win,oy,ox,inv_t_name[ip.get()]+'\n');
  return NORM;
}
/* a comma-separated list of "name" or "noname" for booleans and "name=...." for strings */
function parse_opts(str){
  var s=0,sp,o,op,len,i,start,val,word;
  function alpha(n){return n<str.length&&isalpha(str.charCodeAt(n))}
  while(s<str.length){
    for(sp=s;alpha(sp);sp++)continue;
    len=sp-s;
    word=str.slice(s,sp);
    for(o=0;o<NUM_OPTS;o++){
      op=optlist[o];
      if(op.o_name.slice(0,len)===word){
        if(op.o_kind==='b')op.o_opt.set(true);
        else{
          /* skip to start of string value */
          for(s=sp+1;str.charAt(s)==='=';s++)continue;
          start='';
          if(str.charAt(s)==='~'){
            start=home;
            while(str.charAt(++s)==='/')continue;
          }
          /* skip to end of string value */
          for(sp=s+1;sp<str.length&&str.charAt(sp)!==',';sp++)continue;
          val=str.slice(s,sp);
          if(op.o_kind==='i'){
            if(val.length)val=val.charAt(0).toUpperCase()+val.slice(1);
            for(i=0;i<=INV_CLEAR;i++)
              if(inv_t_name[i].slice(0,val.length)===val){
                inv_type=i;
                break;
              }
          }
          else op.o_opt.set(start+strucpy(val,val.length));
        }
        break;
      }
      /* check for "noname" for booleans */
      else if(op.o_kind==='b'&&word.slice(0,2)==='no'&&op.o_name.slice(0,len-2)===word.slice(2)){
        op.o_opt.set(false);
        break;
      }
    }
    /* skip to start of next option name */
    while(sp<str.length&&!alpha(sp))sp++;
    s=sp;
  }
}
function strucpy(s2,len){
  var r='',i;
  if(len>MAXINP)len=MAXINP;
  for(i=0;i<len;i++)
    if(isprint(s2.charCodeAt(i)))r+=s2.charAt(i);
  return r;
}

/* ---------- pack.c ---------- */
function* add_pack(obj,silent){
  var op,lp,from_floor,dump;
  from_floor=false;
  if(obj===null){
    if((obj=find_obj(hero.y,hero.x))===null)return;
    from_floor=true;
  }
  /* check for and deal with scare monster scrolls */
  if(obj.o_type===SCROLL&&obj.o_which===S_SCARE)
    if(obj.o_flags&ISFOUND){
      lvl_obj=detach(lvl_obj,obj);
      mvaddch(hero.y,hero.x,floor_ch());
      setchat(hero.y,hero.x,(player.t_room.r_flags&ISGONE)?PASSAGE:FLOOR);
      discard(obj);
      yield* msg('the scroll turns to dust as you pick it up');
      return;
    }
  if(player.t_pack===null){
    /* the C forgets to take it off the floor here, so it is on both lists, and the next drop can tie them
       into a loop that never ends. Dropping everything is no reason to hang the terminal. */
    if(from_floor&&!(T&&T.exact)){
      lvl_obj=detach(lvl_obj,obj);
      mvaddch(hero.y,hero.x,floor_ch());
      setchat(hero.y,hero.x,(player.t_room.r_flags&ISGONE)?PASSAGE:FLOOR);
    }
    player.t_pack=obj;
    obj.o_packch=pack_char();
    inpack++;
  }
  else{
    lp=null;
    for(op=player.t_pack;op!==null;op=op.l_next){
      if(op.o_type!==obj.o_type)lp=op;
      else{
        while(op.o_type===obj.o_type&&op.o_which!==obj.o_which){
          lp=op;
          if(op.l_next===null)break;
          else op=op.l_next;
        }
        if(op.o_type===obj.o_type&&op.o_which===obj.o_which){
          dump=false;
          if(ISMULT(op.o_type)){
            if(!(yield* pack_room(from_floor,obj)))return;
            op.o_count++;
            dump=true;
          }
          else if(obj.o_group){
            lp=op;
            while(op.o_type===obj.o_type&&op.o_which===obj.o_which&&op.o_group!==obj.o_group){
              lp=op;
              if(op.l_next===null)break;
              else op=op.l_next;
            }
            if(op.o_type===obj.o_type&&op.o_which===obj.o_which&&op.o_group===obj.o_group){
              op.o_count+=obj.o_count;
              inpack--;
              if(!(yield* pack_room(from_floor,obj)))return;
              dump=true;
            }
          }
          else lp=op;
          if(dump){
            discard(obj);
            obj=op;
            lp=null;
          }
        }
        break;
      }
    }
    if(lp!==null){
      if(!(yield* pack_room(from_floor,obj)))return;
      else{
        obj.o_packch=pack_char();
        obj.l_next=lp.l_next;
        obj.l_prev=lp;
        if(lp.l_next!==null)lp.l_next.l_prev=obj;
        lp.l_next=obj;
      }
    }
  }
  obj.o_flags|=ISFOUND;
  /* if this was the object of something's desire, that monster will get mad and run at the hero */
  for(op=mlist;op!==null;op=op.l_next)
    if(op.t_dest===obj.o_pos)op.t_dest=hero;
  if(obj.o_type===AMULET)amulet=true;
  /* notify the user */
  if(!silent){
    if(!terse)yield* addmsg('you now have ');
    yield* msg(inv_name(obj,!terse)+' ('+chr(obj.o_packch)+')');
  }
}
function* pack_room(from_floor,obj){
  if(++inpack>MAXPACK){
    if(!terse)yield* addmsg("there's ");
    yield* addmsg('no room');
    if(!terse)yield* addmsg(' in your pack');
    yield* endmsg();
    if(from_floor)yield* move_msg(obj);
    inpack=MAXPACK;
    return false;
  }
  if(from_floor){
    lvl_obj=detach(lvl_obj,obj);
    mvaddch(hero.y,hero.x,floor_ch());
    setchat(hero.y,hero.x,(player.t_room.r_flags&ISGONE)?PASSAGE:FLOOR);
  }
  return true;
}
function leave_pack(obj,newobj,all){
  var nobj;
  inpack--;
  nobj=obj;
  if(obj.o_count>1&&!all){
    last_pick=obj;
    obj.o_count--;
    if(obj.o_group)inpack++;
    if(newobj){
      nobj=new_item();
      Object.assign(nobj,obj);
      nobj.t_pos={x:obj.t_pos.x,y:obj.t_pos.y};
      nobj.o_pos={x:obj.o_pos.x,y:obj.o_pos.y};
      nobj.t_stats=mkstats();
      setstats(nobj.t_stats,obj.t_stats);
      nobj.l_next=null;
      nobj.l_prev=null;
      nobj.o_count=1;
    }
  }
  else{
    last_pick=null;
    pack_used[obj.o_packch-97]=false;
    player.t_pack=detach(player.t_pack,obj);
  }
  return nobj;
}
function pack_char(){
  var b=0;
  while(pack_used[b])b++;
  pack_used[b]=true;
  return b+97;
}
function* inventory(list,type){
  n_objs=0;
  for(;list!==null;list=list.l_next){
    if(type&&type!==list.o_type&&!(type===CALLABLE&&list.o_type!==FOOD&&list.o_type!==AMULET)&&
      !(type===R_OR_S&&(list.o_type===RING||list.o_type===STICK)))
        continue;
    n_objs++;
    msg_esc=true;
    if((yield* add_line(chr(list.o_packch)+') %s',inv_name(list,false)))===ESCAPE){
      msg_esc=false;
      yield* msg('');
      return true;
    }
    msg_esc=false;
  }
  if(n_objs===0){
    if(terse)yield* msg(type===0?'empty handed':'nothing appropriate');
    else yield* msg(type===0?'you are empty handed':"you don't have anything appropriate");
    return false;
  }
  yield* end_line();
  return true;
}
function* pick_up(ch){
  var obj;
  if(on(player,ISLEVIT))return;
  obj=find_obj(hero.y,hero.x);
  if(move_on)yield* move_msg(obj);
  else
    switch(ch){
      case GOLD:
        if(obj===null)return;
        yield* money(obj.o_arm);
        lvl_obj=detach(lvl_obj,obj);
        discard(obj);
        player.t_room.r_goldval=0;
        break;
      default:
        yield* add_pack(null,false);
        break;
    }
}
function* move_msg(obj){
  if(!terse)yield* addmsg('you ');
  yield* msg('moved onto '+inv_name(obj,true));
}
function* picky_inven(){
  var obj,mch;
  if(player.t_pack===null)yield* msg("you aren't carrying anything");
  else if(player.t_pack.l_next===null)yield* msg('a) '+inv_name(player.t_pack,false));
  else{
    yield* msg(terse?'item: ':'which item do you wish to inventory: ');
    mpos=0;
    if((mch=yield* readchar())===ESCAPE){
      yield* msg('');
      return;
    }
    for(obj=player.t_pack;obj!==null;obj=obj.l_next)
      if(mch===obj.o_packch){
        yield* msg(chr(mch)+') '+inv_name(obj,false));
        return;
      }
    yield* msg("'"+unctrl(mch)+"' not in pack");
  }
}
function* get_item(purpose,type){
  var obj,ch;
  if(player.t_pack===null)yield* msg("you aren't carrying anything");
  else if(again){
    if(last_pick)return last_pick;
    else yield* msg('you ran out');
  }
  else{
    for(;;){
      if(!terse)yield* addmsg('which object do you want to ');
      yield* addmsg(purpose);
      if(terse)yield* addmsg(' what');
      yield* msg('? (* for list): ');
      ch=yield* readchar();
      mpos=0;
      /* give the poor player a chance to abort the command */
      if(ch===ESCAPE){
        reset_last();
        after=false;
        yield* msg('');
        return null;
      }
      n_objs=1;		/* normal case: person types one char */
      if(ch===ord('*')){
        mpos=0;
        if(!(yield* inventory(player.t_pack,type))){
          after=false;
          return null;
        }
        continue;
      }
      for(obj=player.t_pack;obj!==null;obj=obj.l_next)
        if(obj.o_packch===ch)break;
      if(obj===null){
        yield* msg("'"+unctrl(ch)+"' is not a valid item");
        continue;
      }
      else return obj;
    }
  }
  return null;
}
function* money(value){
  purse+=value;
  mvaddch(hero.y,hero.x,floor_ch());
  setchat(hero.y,hero.x,(player.t_room.r_flags&ISGONE)?PASSAGE:FLOOR);
  if(value>0){
    if(!terse)yield* addmsg('you found ');
    yield* msg(value+' gold pieces');
  }
}
function floor_ch(){
  if(player.t_room.r_flags&ISGONE)return PASSAGE;
  return show_floor()?FLOOR:SPACE;
}
function floor_at(){
  var ch=chat(hero.y,hero.x);
  if(ch===FLOOR)ch=floor_ch();
  return ch;
}
function reset_last(){
  last_comm=l_last_comm;
  last_dir=l_last_dir;
  last_pick=l_last_pick;
}

/* ---------- passages.c ---------- */
var rdes=[];
(function(){
  var C=[[0,1,0,1,0,0,0,0,0],[1,0,1,0,1,0,0,0,0],[0,1,0,0,0,1,0,0,0],[1,0,0,0,1,0,1,0,0],[0,1,0,1,0,1,0,1,0],
    [0,0,1,0,1,0,0,0,1],[0,0,0,1,0,0,0,1,0],[0,0,0,0,1,0,1,0,1],[0,0,0,0,0,1,0,1,0]];
  for(var i=0;i<MAXROOMS;i++)rdes.push({conn:C[i],isconn:[],ingraph:false});
})();
function* do_passages(){
  var r1,r2=null,i,j,roomcount,n;
  /* reinitialize room graph description */
  for(n=0;n<MAXROOMS;n++){
    for(j=0;j<MAXROOMS;j++)rdes[n].isconn[j]=false;
    rdes[n].ingraph=false;
  }
  /* starting with one room, connect it to a random adjacent room and then pick a new room to start with */
  roomcount=1;
  r1=rdes[rnd(MAXROOMS)];
  r1.ingraph=true;
  do{
    /* find a room to connect with */
    j=0;
    for(i=0;i<MAXROOMS;i++)
      if(r1.conn[i]&&!rdes[i].ingraph&&rnd(++j)===0)r2=rdes[i];
    /* if no adjacent rooms are outside the graph, pick a new room to look from */
    if(j===0){
      do r1=rdes[rnd(MAXROOMS)];
      while(!r1.ingraph);
    }
    /* otherwise, connect new room to the graph, and draw a tunnel to it */
    else{
      r2.ingraph=true;
      i=rdes.indexOf(r1);
      j=rdes.indexOf(r2);
      yield* conn(i,j);
      r1.isconn[j]=true;
      r2.isconn[i]=true;
      roomcount++;
    }
  }while(roomcount<MAXROOMS);
  /* attempt to add passages to the graph a random number of times so that there isn't always just one unique passage through it */
  for(roomcount=rnd(5);roomcount>0;roomcount--){
    r1=rdes[rnd(MAXROOMS)];	/* a random room to look from */
    /* find an adjacent room not already connected */
    j=0;
    for(i=0;i<MAXROOMS;i++)
      if(r1.conn[i]&&!r1.isconn[i]&&rnd(++j)===0)r2=rdes[i];
    /* if there is one, connect it and look for the next added passage */
    if(j!==0){
      i=rdes.indexOf(r1);
      j=rdes.indexOf(r2);
      yield* conn(i,j);
      r1.isconn[j]=true;
      r2.isconn[i]=true;
    }
  }
  passnum();
}
var conn_del={x:0,y:0},conn_curr={x:0,y:0},conn_turn={x:0,y:0},conn_spos={x:0,y:0},conn_epos={x:0,y:0};
function* conn(r1,r2){
  var rpf,rpt=null,rmt,distance=0,turn_spot,turn_distance=0,rm,direc,del=conn_del,curr=conn_curr,turn_delta=conn_turn,spos=conn_spos,epos=conn_epos;
  if(r1<r2){
    rm=r1;
    if(r1+1===r2)direc='r';
    else direc='d';
  }
  else{
    rm=r2;
    if(r2+1===r1)direc='r';
    else direc='d';
  }
  rpf=rooms[rm];
  /* set up the movement variables, in two cases: first drawing one down */
  if(direc==='d'){
    rmt=rm+3;			/* room # of dest */
    rpt=rooms[rmt];		/* room pointer of dest */
    del.x=0;			/* direction of move */
    del.y=1;
    spos.x=rpf.r_pos.x;		/* start of move */
    spos.y=rpf.r_pos.y;
    epos.x=rpt.r_pos.x;		/* end of move */
    epos.y=rpt.r_pos.y;
    if(!(rpf.r_flags&ISGONE))	/* if not gone pick door pos */
      do{
        spos.x=rpf.r_pos.x+rnd(rpf.r_max.x-2)+1;
        spos.y=rpf.r_pos.y+rpf.r_max.y-1;
      }while((rpf.r_flags&ISMAZE)&&!(flat(spos.y,spos.x)&F_PASS));
    if(!(rpt.r_flags&ISGONE))
      do{
        epos.x=rpt.r_pos.x+rnd(rpt.r_max.x-2)+1;
      }while((rpt.r_flags&ISMAZE)&&!(flat(epos.y,epos.x)&F_PASS));
    distance=Math.abs(spos.y-epos.y)-1;		/* distance to move */
    turn_delta.y=0;				/* direction to turn */
    turn_delta.x=spos.x<epos.x?1:-1;
    turn_distance=Math.abs(spos.x-epos.x);	/* how far to turn */
  }
  else if(direc==='r'){			/* setup for moving right */
    rmt=rm+1;
    rpt=rooms[rmt];
    del.x=1;
    del.y=0;
    spos.x=rpf.r_pos.x;
    spos.y=rpf.r_pos.y;
    epos.x=rpt.r_pos.x;
    epos.y=rpt.r_pos.y;
    if(!(rpf.r_flags&ISGONE))
      do{
        spos.x=rpf.r_pos.x+rpf.r_max.x-1;
        spos.y=rpf.r_pos.y+rnd(rpf.r_max.y-2)+1;
      }while((rpf.r_flags&ISMAZE)&&!(flat(spos.y,spos.x)&F_PASS));
    if(!(rpt.r_flags&ISGONE))
      do{
        epos.y=rpt.r_pos.y+rnd(rpt.r_max.y-2)+1;
      }while((rpt.r_flags&ISMAZE)&&!(flat(epos.y,epos.x)&F_PASS));
    distance=Math.abs(spos.x-epos.x)-1;
    turn_delta.y=spos.y<epos.y?1:-1;
    turn_delta.x=0;
    turn_distance=Math.abs(spos.y-epos.y);
  }
  turn_spot=rnd(distance-1)+1;		/* where turn starts */
  /* draw in the doors on either side of the passage or just put #'s if the rooms are gone */
  if(!(rpf.r_flags&ISGONE))door(rpf,spos);
  else putpass(spos);
  if(!(rpt.r_flags&ISGONE))door(rpt,epos);
  else putpass(epos);
  /* get ready to move... */
  curr.x=spos.x;
  curr.y=spos.y;
  while(distance>0){
    /* move to new position */
    curr.x+=del.x;
    curr.y+=del.y;
    /* check if we are at the turn place, if so do the turn */
    if(distance===turn_spot)
      while(turn_distance--){
        putpass(curr);
        curr.x+=turn_delta.x;
        curr.y+=turn_delta.y;
      }
    /* continue digging along */
    putpass(curr);
    distance--;
  }
  curr.x+=del.x;
  curr.y+=del.y;
  if(!ce(curr,epos))yield* msg('warning, connectivity problem on this level');
}
function putpass(c){
  var i=INDEX(c.y,c.x);
  pl_fl[i]|=F_PASS;
  if(rnd(10)+1<level&&rnd(40)===0)pl_fl[i]&=~F_REAL;
  else pl_ch[i]=PASSAGE;
}
function door(rm,c){
  var i;
  cp(exit_at(rm,rm.r_nexits++),c);
  if(rm.r_flags&ISMAZE)return;
  i=INDEX(c.y,c.x);
  if(rnd(10)+1<level&&rnd(5)===0){
    if(c.y===rm.r_pos.y||c.y===rm.r_pos.y+rm.r_max.y-1)pl_ch[i]=HWALL;
    else pl_ch[i]=VWALL;
    pl_fl[i]&=~F_REAL;
  }
  else pl_ch[i]=DOOR;
}
var pnum=0,newpnum=false;
function passnum(){
  var rp,i,n;
  pnum=0;
  newpnum=false;
  for(n=0;n<MAXPASS;n++)passages[n].r_nexits=0;
  for(n=0;n<MAXROOMS;n++){
    rp=rooms[n];
    for(i=0;i<rp.r_nexits;i++){
      newpnum=true;
      numpass(rp.r_exit[i].y,rp.r_exit[i].x);
    }
  }
}
function numpass(y,x){
  var i,fp,rp,ch;
  if(x>=NUMCOLS||x<0||y>=NUMLINES||y<=0)return;
  i=INDEX(y,x);
  fp=pl_fl[i];
  if(fp&F_PNUM)return;
  if(newpnum){
    pnum++;
    newpnum=false;
  }
  /* check to see if it is a door or secret door, i.e., a new exit, or a numerable type of place */
  if((ch=pl_ch[i])===DOOR||(!(fp&F_REAL)&&(ch===VWALL||ch===HWALL))){
    rp=passages[pnum];
    var e=exit_at(rp,rp.r_nexits++);
    e.y=y;
    e.x=x;
  }
  else if(!(fp&F_PASS))return;
  pl_fl[i]|=pnum;
  /* recurse on the surrounding places */
  numpass(y+1,x);
  numpass(y-1,x);
  numpass(y,x+1);
  numpass(y,x-1);
}

/* ---------- potions.c ---------- */
/* pa_high and pa_straight are null where the C points them at prbuf */
var p_actions=[
  {pa_flags:ISHUH,pa_daemon:unconfuse,pa_time:HUHDURATION,pa_high:'what a tripy feeling!',pa_straight:"wait, what's going on here. Huh? What? Who?"},
  {pa_flags:ISHALU,pa_daemon:come_down,pa_time:SEEDURATION,pa_high:'Oh, wow!  Everything seems so cosmic!',pa_straight:'Oh, wow!  Everything seems so cosmic!'},
  null,null,
  {pa_flags:CANSEE,pa_daemon:unsee,pa_time:SEEDURATION,pa_high:null,pa_straight:null},
  null,null,null,null,null,null,null,
  {pa_flags:ISBLIND,pa_daemon:sight,pa_time:SEEDURATION,pa_high:'oh, bummer!  Everything is dark!  Help!',pa_straight:'a cloak of darkness falls around you'},
  {pa_flags:ISLEVIT,pa_daemon:land,pa_time:HEALTIME,pa_high:"oh, wow!  You're floating in the air!",pa_straight:'you start to float in the air'}
];
function* turn_see_off(a){turn_see(a)} /* the fuse's way in to turn_see */
function* quaff(){
  var obj,tp,mp,discardit=false,show,trip;
  obj=yield* get_item('quaff',POTION);
  /* make certain that it is somethings that we want to drink */
  if(obj===null)return;
  if(obj.o_type!==POTION){
    if(!terse)yield* msg('yuk! Why would you want to drink that?');
    else yield* msg("that's undrinkable");
    return;
  }
  if(obj===cur_weapon)cur_weapon=null;
  /* calculate the effect it has on the poor guy */
  trip=on(player,ISHALU);
  discardit=obj.o_count===1;
  leave_pack(obj,false,false);
  switch(obj.o_which){
    case P_CONFUSE:
      yield* do_pot(P_CONFUSE,!trip);
      break;
    case P_POISON:
      pot_info[P_POISON].oi_know=true;
      if(ISWEARING(R_SUSTSTR))yield* msg('you feel momentarily sick');
      else{
        chg_str(-(rnd(3)+1));
        yield* msg('you feel very sick now');
        yield* come_down();
      }
      break;
    case P_HEALING:
      pot_info[P_HEALING].oi_know=true;
      if((pstats.s_hpt+=roll(pstats.s_lvl,4))>pstats.s_maxhp)pstats.s_hpt=++pstats.s_maxhp;
      yield* sight();
      yield* msg('you begin to feel better');
      break;
    case P_STRENGTH:
      pot_info[P_STRENGTH].oi_know=true;
      chg_str(1);
      yield* msg('you feel stronger, now.  What bulging muscles!');
      break;
    case P_MFIND:
      player.t_flags|=SEEMONST;
      fuse(turn_see_off,true,HUHDURATION,AFTER);
      if(!turn_see(false))
        yield* msg('you have a '+choose_str('normal','strange')+' feeling for a moment, then it passes');
      break;
    case P_TFIND:
      /* potion of magic detection: show the potions and scrolls */
      show=false;
      if(lvl_obj!==null){
        wclear(hw);
        for(tp=lvl_obj;tp!==null;tp=tp.l_next){
          if(is_magic(tp)){
            show=true;
            wmove(hw,tp.o_pos.y,tp.o_pos.x);
            waddch(hw,MAGIC);
            pot_info[P_TFIND].oi_know=true;
          }
        }
        for(mp=mlist;mp!==null;mp=mp.l_next){
          for(tp=mp.t_pack;tp!==null;tp=tp.l_next){
            if(is_magic(tp)){
              show=true;
              wmove(hw,mp.t_pos.y,mp.t_pos.x);
              waddch(hw,MAGIC);
            }
          }
        }
      }
      if(show){
        pot_info[P_TFIND].oi_know=true;
        yield* show_win('You sense the presence of magic on this level.--More--');
      }
      else yield* msg('you have a '+choose_str('normal','strange')+' feeling for a moment, then it passes');
      break;
    case P_LSD:
      if(!trip){
        if(on(player,SEEMONST))turn_see(false);
        start_daemon(visuals,0,BEFORE);
        seenstairs=seen_stairs();
      }
      yield* do_pot(P_LSD,true);
      break;
    case P_SEEINVIS:
      prbuf='this potion tastes like '+fruit+' juice';
      show=on(player,CANSEE);
      yield* do_pot(P_SEEINVIS,false);
      if(!show)invis_on();
      yield* sight();
      break;
    case P_RAISE:
      pot_info[P_RAISE].oi_know=true;
      yield* msg('you suddenly feel much more skillful');
      yield* raise_level();
      break;
    case P_XHEAL:
      pot_info[P_XHEAL].oi_know=true;
      if((pstats.s_hpt+=roll(pstats.s_lvl,8))>pstats.s_maxhp){
        if(pstats.s_hpt>pstats.s_maxhp+pstats.s_lvl+1)++pstats.s_maxhp;
        pstats.s_hpt=++pstats.s_maxhp;
      }
      yield* sight();
      yield* come_down();
      yield* msg('you begin to feel much better');
      break;
    case P_HASTE:
      pot_info[P_HASTE].oi_know=true;
      after=false;
      if(yield* add_haste(true))yield* msg('you feel yourself moving much faster');
      break;
    case P_RESTORE:
      if(ISRING(LEFT,R_ADDSTR))pstats.s_str=add_str(pstats.s_str,-cur_ring[LEFT].o_arm);
      if(ISRING(RIGHT,R_ADDSTR))pstats.s_str=add_str(pstats.s_str,-cur_ring[RIGHT].o_arm);
      if(pstats.s_str<max_stats.s_str)pstats.s_str=max_stats.s_str;
      if(ISRING(LEFT,R_ADDSTR))pstats.s_str=add_str(pstats.s_str,cur_ring[LEFT].o_arm);
      if(ISRING(RIGHT,R_ADDSTR))pstats.s_str=add_str(pstats.s_str,cur_ring[RIGHT].o_arm);
      yield* msg('hey, this tastes great.  It make you feel warm all over');
      break;
    case P_BLIND:
      yield* do_pot(P_BLIND,true);
      break;
    case P_LEVIT:
      yield* do_pot(P_LEVIT,true);
      break;
  }
  yield* status();
  /* throw the item away */
  yield* call_it(pot_info[obj.o_which]);
  if(discardit)discard(obj);
}
function is_magic(obj){
  switch(obj.o_type){
    case ARMOR:
      return !!(obj.o_flags&ISPROT)||obj.o_arm!==a_class[obj.o_which];
    case WEAPON:
      return obj.o_hplus!==0||obj.o_dplus!==0;
    case POTION:case SCROLL:case STICK:case RING:case AMULET:
      return true;
  }
  return false;
}
function invis_on(){
  var mp;
  player.t_flags|=CANSEE;
  for(mp=mlist;mp!==null;mp=mp.l_next)
    if(on(mp,ISINVIS)&&see_monst(mp)&&!on(player,ISHALU))mvaddch(mp.t_pos.y,mp.t_pos.x,mp.t_disguise);
}
function turn_see(turn_off){
  var mp,can_see,add_new=false;
  for(mp=mlist;mp!==null;mp=mp.l_next){
    move(mp.t_pos.y,mp.t_pos.x);
    can_see=see_monst(mp);
    if(turn_off){
      if(!can_see)addch(mp.t_oldch);
    }
    else{
      if(!can_see)standout();
      if(!on(player,ISHALU))addch(mp.t_type);
      else addch(rnd(26)+65);
      if(!can_see){
        standend();
        add_new=true;
      }
    }
  }
  if(turn_off)player.t_flags&=~SEEMONST;
  else player.t_flags|=SEEMONST;
  return add_new;
}
function seen_stairs(){
  var tp;
  move(stairs.y,stairs.x);
  if(inch()===STAIRS)return true;	/* it's on the map */
  if(ce(hero,stairs))return true;	/* it's under him */
  /* if a monster is on the stairs, this gets hairy */
  if((tp=moat(stairs.y,stairs.x))!==null){
    if(see_monst(tp)&&on(tp,ISRUN))return true;		/* if it's visible and awake, it must have moved there */
    if(on(player,SEEMONST)&&tp.t_oldch===STAIRS)return true;	/* she can detect monster, and there once were stairs */
  }
  return false;
}
function* raise_level(){
  pstats.s_exp=e_levels[pstats.s_lvl-1]+1;
  yield* check_level();
}
function* do_pot(type,knowit){
  var pp,t;
  pp=p_actions[type];
  if(!pot_info[type].oi_know)pot_info[type].oi_know=knowit;
  t=spread(pp.pa_time);
  if(!on(player,pp.pa_flags)){
    player.t_flags|=pp.pa_flags;
    fuse(pp.pa_daemon,0,t,AFTER);
    yield* look(false);
  }
  else lengthen(pp.pa_daemon,t);
  var s=choose_str(pp.pa_high,pp.pa_straight);
  yield* msg(s===null?prbuf:s);
}

/* ---------- rings.c ---------- */
function* ring_on(){
  var obj,ring;
  obj=yield* get_item('put on',RING);
  /* make certain that it is somethings that we want to wear */
  if(obj===null)return;
  if(obj.o_type!==RING){
    if(!terse)yield* msg('it would be difficult to wrap that around a finger');
    else yield* msg('not a ring');
    return;
  }
  /* find out which hand to put it on */
  if(yield* is_current(obj))return;
  if(cur_ring[LEFT]===null&&cur_ring[RIGHT]===null){
    if((ring=yield* gethand())<0)return;
  }
  else if(cur_ring[LEFT]===null)ring=LEFT;
  else if(cur_ring[RIGHT]===null)ring=RIGHT;
  else{
    if(!terse)yield* msg('you already have a ring on each hand');
    else yield* msg('wearing two');
    return;
  }
  cur_ring[ring]=obj;
  /* calculate the effect it has on the poor guy */
  switch(obj.o_which){
    case R_ADDSTR:
      chg_str(obj.o_arm);
      break;
    case R_SEEINVIS:
      invis_on();
      break;
    case R_AGGR:
      aggravate();
      break;
  }
  if(!terse)yield* addmsg('you are now wearing ');
  yield* msg(inv_name(obj,true)+' ('+chr(obj.o_packch)+')');
}
function* ring_off(){
  var ring,obj;
  if(cur_ring[LEFT]===null&&cur_ring[RIGHT]===null){
    if(terse)yield* msg('no rings');
    else yield* msg("you aren't wearing any rings");
    return;
  }
  else if(cur_ring[LEFT]===null)ring=RIGHT;
  else if(cur_ring[RIGHT]===null)ring=LEFT;
  else if((ring=yield* gethand())<0)return;
  mpos=0;
  obj=cur_ring[ring];
  if(obj===null){
    yield* msg('not wearing such a ring');
    return;
  }
  if(yield* dropcheck(obj))yield* msg('was wearing '+inv_name(obj,true)+'('+chr(obj.o_packch)+')');
}
function* gethand(){
  var c;
  for(;;){
    if(terse)yield* msg('left or right ring? ');
    else yield* msg('left hand or right hand? ');
    if((c=yield* readchar())===ESCAPE)return -1;
    mpos=0;
    if(c===ord('l')||c===ord('L'))return LEFT;
    else if(c===ord('r')||c===ord('R'))return RIGHT;
    if(terse)yield* msg('L or R');
    else yield* msg('please type L or R');
  }
}
var ring_uses=[1,1,1,-3,-5,0,0,-3,-3,2,-2,0,1,1];
function ring_eat(hand){
  var ring,e;
  if((ring=cur_ring[hand])===null)return 0;
  if((e=ring_uses[ring.o_which])<0)e=rnd(-e)===0?1:0;
  if(ring.o_which===R_DIGEST)e=-e;
  return e;
}
function ring_num(obj){
  if(!(obj.o_flags&ISKNOW))return '';
  switch(obj.o_which){
    case R_PROTECT:case R_ADDSTR:case R_ADDDAM:case R_ADDHIT:
      return ' ['+num(obj.o_arm,0,RING)+']';
    default:
      return '';
  }
}

/* ---------- rip.c ---------- */
var rip=[
'                       __________\n',
'                      /          \\\n',
'                     /    REST    \\\n',
'                    /      IN      \\\n',
'                   /     PEACE      \\\n',
'                  /                  \\\n',
'                  |                  |\n',
'                  |                  |\n',
'                  |   killed by a    |\n',
'                  |                  |\n',
'                  |       1980       |\n',
'                 *|     *  *  *      | *\n',
'         ________)/\\\\_//(\\/(/\\)/\\//\\/|_)_______\n'
];
var reason=['killed','quit','A total winner','killed with Amulet'];
/* the top ten lives in the browser, under rogue/scores; sc_uid is the login name */
function read_scores(){
  var t=P.saved('rogue/scores');
  return Array.isArray(t)?t.filter(function(s){ /* whatever is in the browser, as long as it is scores */
    return s&&typeof s.sc_score==='number'&&typeof s.sc_name==='string'&&typeof s.sc_uid==='string'&&reason[s.sc_flags]!==undefined&&typeof s.sc_monster==='number'&&typeof s.sc_level==='number';
  }).slice(0,NUMSCORES):[];
}
function score(amount,flags,monst){
  var top=read_scores(),sc,i,scp,sc2=-1,uid=P.st.user,L=[];
  while(top.length<NUMSCORES)top.push({sc_uid:'',sc_score:0,sc_flags:0,sc_monster:0,sc_name:'',sc_level:0});
  /* insert her in list if need be */
  if(!noscore){
    for(scp=0;scp<NUMSCORES;scp++)
      if(amount>top[scp].sc_score)break;
      else if(!allscore&&flags!==2&&top[scp].sc_uid===uid&&top[scp].sc_flags!==2)scp=NUMSCORES;	/* only one score per nowin uid */
    if(scp<NUMSCORES){
      if(flags!==2&&!allscore){
        for(sc2=scp;sc2<NUMSCORES;sc2++)
          if(top[sc2].sc_uid===uid&&top[sc2].sc_flags!==2)break;
        if(sc2>=NUMSCORES)sc2=NUMSCORES-1;
      }
      else sc2=NUMSCORES-1;
      while(sc2>scp){
        top[sc2]=top[sc2-1];
        sc2--;
      }
      top[scp]={sc_uid:uid,sc_score:amount,sc_flags:flags,sc_monster:monst,sc_name:whoami,sc_level:flags===2?max_level:level};
      sc2=scp;
    }
  }
  /* print the list */
  if(flags!==-1)L.push('');
  L.push('Top '+NUMNAME+' '+(allscore?'Scores':'Rogueists')+':');
  L.push('   Score Name');
  for(i=0;i<NUMSCORES;i++){
    sc=top[i];
    if(sc.sc_score){
      var line=padl(i+1,2)+' '+padl(sc.sc_score,5)+' '+sc.sc_name+': '+reason[sc.sc_flags]+' on level '+sc.sc_level;
      if(sc.sc_flags===0||sc.sc_flags===3)line+=' by '+killname(sc.sc_monster,true);
      L.push(line+'.');
    }
    else break;
  }
  /* update the list file */
  if(sc2>=0)P.save('rogue/scores',top);
  return L;
}
/* score() in the running game: the wait for return is the wgetnstr, and the list comes once the glass is gone */
function* end_score(amount,flags,monst){
  mvaddstr(LINES-1,0,'[Press return to continue]');
  refresh();
  var c;
  while((c=yield* getch())!==10&&c!==13)continue;
  out=out.concat(score(amount,flags,monst));
}
function* death(monst){
  var killer;
  purse-=idiv(purse,10);
  clear();
  killer=killname(monst,false);
  if(!tombstone){
    mvaddstr(LINES-2,0,'Killed by ');
    killer=killname(monst,false);
    if(monst!==ord('s')&&monst!==ord('h'))addstr('a'+vowelstr(killer)+' ');
    addstr(killer+' with '+purse+' gold');
  }
  else{
    move(8,0);
    for(var i=0;i<rip.length;i++)addstr(rip[i]);
    mvaddstr(17,center(killer),killer);
    if(monst===ord('s')||monst===ord('h'))mvaddch(16,32,SPACE);
    else mvaddstr(16,33,vowelstr(killer));
    mvaddstr(14,center(whoami),whoami);
    prbuf=purse+' Au';
    move(15,center(prbuf));
    addstr(prbuf);
    prbuf=padl(P.now().getFullYear(),4);
    mvaddstr(18,26,prbuf);
  }
  move(LINES-1,0);
  refresh();
  yield* end_score(purse,amulet?3:0,monst);
  press=true;
  my_exit(0);
}
function center(str){return 28-idiv(str.length+1,2)}
function* total_winner(){
  var obj,op,worth=0,oldpurse;
  clear();
  standout();
  addstr('                                                               \n');
  addstr('  @   @               @   @           @          @@@  @     @  \n');
  addstr('  @   @               @@ @@           @           @   @     @  \n');
  addstr('  @   @  @@@  @   @   @ @ @  @@@   @@@@  @@@      @  @@@    @  \n');
  addstr('   @@@@ @   @ @   @   @   @     @ @   @ @   @     @   @     @  \n');
  addstr('      @ @   @ @   @   @   @  @@@@ @   @ @@@@@     @   @     @  \n');
  addstr('  @   @ @   @ @  @@   @   @ @   @ @   @ @         @   @  @     \n');
  addstr('   @@@   @@@   @@ @   @   @  @@@@  @@@@  @@@     @@@   @@   @  \n');
  addstr('                                                               \n');
  addstr('     Congratulations, you have made it to the light of day!    \n');
  standend();
  addstr('\nYou have joined the elite ranks of those who have escaped the\n');
  addstr('Dungeons of Doom alive.  You journey home and sell all your loot at\n');
  addstr("a great profit and are admitted to the Fighters' Guild.\n");
  mvaddstr(LINES-1,0,'--Press space to continue--');
  refresh();
  yield* wait_for(32);
  clear();
  mvaddstr(0,0,'   Worth  Item\n');
  oldpurse=purse;
  for(obj=player.t_pack;obj!==null;obj=obj.l_next){
    switch(obj.o_type){
      case FOOD:
        worth=2*obj.o_count;
        break;
      case WEAPON:
        worth=weap_info[obj.o_which].oi_worth;
        worth*=3*(obj.o_hplus+obj.o_dplus)+obj.o_count;
        obj.o_flags|=ISKNOW;
        break;
      case ARMOR:
        worth=arm_info[obj.o_which].oi_worth;
        worth+=(9-obj.o_arm)*100;
        worth+=10*(a_class[obj.o_which]-obj.o_arm);
        obj.o_flags|=ISKNOW;
        break;
      case SCROLL:
        worth=scr_info[obj.o_which].oi_worth;
        worth*=obj.o_count;
        op=scr_info[obj.o_which];
        if(!op.oi_know)worth=idiv(worth,2);
        op.oi_know=true;
        break;
      case POTION:
        worth=pot_info[obj.o_which].oi_worth;
        worth*=obj.o_count;
        op=pot_info[obj.o_which];
        if(!op.oi_know)worth=idiv(worth,2);
        op.oi_know=true;
        break;
      case RING:
        op=ring_info[obj.o_which];
        worth=op.oi_worth;
        if(obj.o_which===R_ADDSTR||obj.o_which===R_ADDDAM||obj.o_which===R_PROTECT||obj.o_which===R_ADDHIT){
          if(obj.o_arm>0)worth+=obj.o_arm*100;
          else worth=10;
        }
        if(!(obj.o_flags&ISKNOW))worth=idiv(worth,2);
        obj.o_flags|=ISKNOW;
        op.oi_know=true;
        break;
      case STICK:
        op=ws_info[obj.o_which];
        worth=op.oi_worth;
        worth+=20*obj.o_arm;
        if(!(obj.o_flags&ISKNOW))worth=idiv(worth,2);
        obj.o_flags|=ISKNOW;
        op.oi_know=true;
        break;
      case AMULET:
        worth=1000;
        break;
    }
    if(worth<0)worth=0;
    addstr(chr(obj.o_packch)+') '+padl(worth,5)+'  '+inv_name(obj,false)+'\n');
    purse+=worth;
  }
  addstr('   '+padl(oldpurse,5)+'  Gold Pieces          ');
  refresh();
  yield* end_score(purse,2,SPACE);
  my_exit(0);
}
var nlist=[[ord('a'),'arrow',true],[ord('b'),'bolt',true],[ord('d'),'dart',true],[ord('h'),'hypothermia',false],[ord('s'),'starvation',false]];
function killname(monst,doart){
  var sp,article,i;
  if(isupper(monst)){
    sp=monsters[monst-65].m_name;
    article=true;
  }
  else{
    sp='Wally the Wonder Badger';
    article=false;
    for(i=0;i<nlist.length;i++)
      if(nlist[i][0]===monst){
        sp=nlist[i][1];
        article=nlist[i][2];
        break;
      }
  }
  prbuf=(doart&&article)?'a'+vowelstr(sp)+' ':'';
  prbuf+=sp;
  return prbuf;
}
function death_monst(){
  var poss='ABCDEFGHIJKLMNOPQRSTUVWXYZabhds ';
  return poss.charCodeAt(rnd(poss.length));
}

/* ---------- rooms.c ---------- */
var GOLDGRP=1;
var dr_top={x:0,y:0};
function do_rooms(){
  var i,rp,tp,left_out,bsze={x:idiv(NUMCOLS,3),y:idiv(NUMLINES,3)},mp={x:0,y:0},top=dr_top;
  /* clear things for a new level */
  for(i=0;i<MAXROOMS;i++){
    rp=rooms[i];
    rp.r_goldval=0;
    rp.r_nexits=0;
    rp.r_flags=0;
  }
  /* put the gone rooms, if any, on the level */
  left_out=rnd(4);
  for(i=0;i<left_out;i++)rooms[rnd_room()].r_flags|=ISGONE;
  /* dig and populate all the rooms on the level */
  for(i=0;i<MAXROOMS;i++){
    rp=rooms[i];
    /* find upper left corner of box that this room goes in */
    top.x=(i%3)*bsze.x+1;
    top.y=idiv(i,3)*bsze.y;
    if(rp.r_flags&ISGONE){
      /* place a gone room: make certain that there is a blank line for passage drawing */
      do{
        rp.r_pos.x=top.x+rnd(bsze.x-2)+1;
        rp.r_pos.y=top.y+rnd(bsze.y-2)+1;
        rp.r_max.x=-NUMCOLS;
        rp.r_max.y=-NUMLINES;
      }while(!(rp.r_pos.y>0&&rp.r_pos.y<NUMLINES-1));
      continue;
    }
    /* set room type */
    if(rnd(10)<level-1){
      rp.r_flags|=ISDARK;		/* dark room */
      if(rnd(15)===0)rp.r_flags=ISMAZE;	/* maze room */
    }
    /* find a place and size for a random room */
    if(rp.r_flags&ISMAZE){
      rp.r_max.x=bsze.x-1;
      rp.r_max.y=bsze.y-1;
      if((rp.r_pos.x=top.x)===1)rp.r_pos.x=0;
      if((rp.r_pos.y=top.y)===0){
        rp.r_pos.y++;
        rp.r_max.y--;
      }
    }
    else
      do{
        rp.r_max.x=rnd(bsze.x-4)+4;
        rp.r_max.y=rnd(bsze.y-4)+4;
        rp.r_pos.x=top.x+rnd(bsze.x-rp.r_max.x);
        rp.r_pos.y=top.y+rnd(bsze.y-rp.r_max.y);
      }while(rp.r_pos.y===0);
    draw_room(rp);
    /* put the gold in */
    if(rnd(2)===0&&(!amulet||level>=max_level)){
      var gold=new_item();
      gold.o_arm=rp.r_goldval=GOLDCALC();
      find_floor(rp,rp.r_gold,false,false);
      cp(gold.o_pos,rp.r_gold);
      setchat(rp.r_gold.y,rp.r_gold.x,GOLD);
      gold.o_flags=ISMANY;
      gold.o_group=GOLDGRP;
      gold.o_type=GOLD;
      lvl_obj=attach(lvl_obj,gold);
    }
    /* put the monster in */
    if(rnd(100)<(rp.r_goldval>0?80:25)){
      tp=new_item();
      find_floor(rp,mp,false,true);
      new_monster(tp,randmonster(false),mp);
      give_pack(tp);
    }
  }
}
function draw_room(rp){
  var y,x;
  if(rp.r_flags&ISMAZE)do_maze(rp);
  else{
    vert(rp,rp.r_pos.x);			/* draw left side */
    vert(rp,rp.r_pos.x+rp.r_max.x-1);		/* draw right side */
    horiz(rp,rp.r_pos.y);			/* draw top */
    horiz(rp,rp.r_pos.y+rp.r_max.y-1);		/* draw bottom */
    /* put the floor down */
    for(y=rp.r_pos.y+1;y<rp.r_pos.y+rp.r_max.y-1;y++)
      for(x=rp.r_pos.x+1;x<rp.r_pos.x+rp.r_max.x-1;x++)
        setchat(y,x,FLOOR);
  }
}
function vert(rp,startx){
  for(var y=rp.r_pos.y+1;y<=rp.r_max.y+rp.r_pos.y-1;y++)setchat(y,startx,VWALL);
}
function horiz(rp,starty){
  for(var x=rp.r_pos.x;x<=rp.r_pos.x+rp.r_max.x-1;x++)setchat(starty,x,HWALL);
}
var Maxy=0,Maxx=0,Starty=0,Startx=0;
var dm_pos={x:0,y:0},dg_pos={x:0,y:0};
function do_maze(rp){
  var starty,startx,pos=dm_pos;
  Maxy=rp.r_max.y;
  Maxx=rp.r_max.x;
  Starty=rp.r_pos.y;
  Startx=rp.r_pos.x;
  starty=idiv(rnd(rp.r_max.y),2)*2;
  startx=idiv(rnd(rp.r_max.x),2)*2;
  pos.y=starty+Starty;
  pos.x=startx+Startx;
  putpass(pos);
  dig(starty,startx);
}
/* struct coord is x then y, so these are {x,y} = {2,0}, {-2,0}, {0,2}, {0,-2} */
var dig_del=[{x:2,y:0},{x:-2,y:0},{x:0,y:2},{x:0,y:-2}];
function dig(y,x){
  var i,cnt,newy,newx,nexty=0,nextx=0,pos=dg_pos;
  for(;;){
    cnt=0;
    for(i=0;i<=3;i++){
      newy=y+dig_del[i].y;
      newx=x+dig_del[i].x;
      if(newy<0||newy>Maxy||newx<0||newx>Maxx)continue;
      if(flat(newy+Starty,newx+Startx)&F_PASS)continue;
      if(rnd(++cnt)===0){
        nexty=newy;
        nextx=newx;
      }
    }
    if(cnt===0)return;
    /* accnt_maze keeps a table nothing ever reads */
    if(nexty===y){
      pos.y=y+Starty;
      if(nextx-x<0)pos.x=nextx+Startx+1;
      else pos.x=nextx+Startx-1;
    }
    else{
      pos.x=x+Startx;
      if(nexty-y<0)pos.y=nexty+Starty+1;
      else pos.y=nexty+Starty-1;
    }
    putpass(pos);
    pos.y=nexty+Starty;
    pos.x=nextx+Startx;
    putpass(pos);
    dig(nexty,nextx);
  }
}
function rnd_pos(rp,c){
  c.x=rp.r_pos.x+rnd(rp.r_max.x-2)+1;
  c.y=rp.r_pos.y+rnd(rp.r_max.y-2)+1;
}
function find_floor(rp,c,limit,monst){
  var i,cnt,compchar=0,pickroom;
  pickroom=rp===null;
  if(!pickroom)compchar=(rp.r_flags&ISMAZE)?PASSAGE:FLOOR;
  cnt=limit;
  for(;;){
    if(limit&&cnt--===0)return false;
    if(pickroom){
      rp=rooms[rnd_room()];
      compchar=(rp.r_flags&ISMAZE)?PASSAGE:FLOOR;
    }
    rnd_pos(rp,c);
    i=INDEX(c.y,c.x);
    if(monst){
      if(pl_mo[i]===null&&step_ok(pl_ch[i]))return true;
    }
    else if(pl_ch[i]===compchar)return true;
  }
}
function* enter_room(c){
  var rp,tp,y,x,ch;
  rp=player.t_room=roomin(c);
  yield* door_open(rp);
  if(!(rp.r_flags&ISDARK)&&!on(player,ISBLIND))
    for(y=rp.r_pos.y;y<rp.r_max.y+rp.r_pos.y;y++){
      move(y,rp.r_pos.x);
      for(x=rp.r_pos.x;x<rp.r_max.x+rp.r_pos.x;x++){
        tp=moat(y,x);
        ch=chat(y,x);
        if(tp===null)
          if(CCHAR(inch())!==ch)addch(ch);
          else move(y,x+1);
        else{
          tp.t_oldch=ch;
          if(!see_monst(tp))
            if(on(player,SEEMONST)){
              standout();
              addch(tp.t_disguise);
              standend();
            }
            else addch(ch);
          else addch(tp.t_disguise);
        }
      }
    }
}
function* leave_room(c){
  var rp,y,x,flr,ch;
  rp=player.t_room;
  if(rp.r_flags&ISMAZE)return;
  if(rp.r_flags&ISGONE)flr=PASSAGE;
  else if(!(rp.r_flags&ISDARK)||on(player,ISBLIND))flr=FLOOR;
  else flr=SPACE;
  player.t_room=passages[flat(c.y,c.x)&F_PNUM];
  for(y=rp.r_pos.y;y<rp.r_max.y+rp.r_pos.y;y++)
    for(x=rp.r_pos.x;x<rp.r_max.x+rp.r_pos.x;x++){
      move(y,x);
      switch(ch=CCHAR(inch())){
        case FLOOR:
          if(flr===SPACE&&ch!==SPACE)addch(SPACE);
          break;
        default:
          /* to check for monster, we have to strip out standout bit */
          if(isupper(toascii(ch))){
            if(on(player,SEEMONST)){
              standout();
              addch(ch);
              standend();
              break;
            }
            addch(chat(y,x)===DOOR?DOOR:flr);
          }
      }
    }
  yield* door_open(rp);
}

/* ---------- scrolls.c ---------- */
var id_type=[0,0,0,0,0,POTION,SCROLL,WEAPON,ARMOR,R_OR_S];
var rs_mp={x:0,y:0};
function* read_scroll(){
  var obj,i,y,x,ch,n,discardit=false,cur_room,orig_obj,mp=rs_mp;
  obj=yield* get_item('read',SCROLL);
  if(obj===null)return;
  if(obj.o_type!==SCROLL){
    if(!terse)yield* msg('there is nothing on it to read');
    else yield* msg('nothing to read');
    return;
  }
  /* calculate the effect it has on the poor guy */
  if(obj===cur_weapon)cur_weapon=null;
  /* get rid of the thing */
  discardit=obj.o_count===1;
  leave_pack(obj,false,false);
  orig_obj=obj;
  switch(obj.o_which){
    case S_CONFUSE:
      /* scroll of monster confusion: give him that power */
      player.t_flags|=CANHUH;
      yield* msg('your hands begin to glow '+pick_color('red'));
      break;
    case S_ARMOR:
      if(cur_armor!==null){
        cur_armor.o_arm--;
        cur_armor.o_flags&=~ISCURSED;
        yield* msg('your armor glows '+pick_color('silver')+' for a moment');
      }
      break;
    case S_HOLD:
      /* hold monster scroll: stop all monsters within two spaces from chasing after the hero */
      ch=0;
      for(x=hero.x-2;x<=hero.x+2;x++)
        if(x>=0&&x<NUMCOLS)
          for(y=hero.y-2;y<=hero.y+2;y++)
            if(y>=0&&y<=NUMLINES-1)
              if((obj=moat(y,x))!==null&&on(obj,ISRUN)){
                obj.t_flags&=~ISRUN;
                obj.t_flags|=ISHELD;
                ch++;
              }
      if(ch){
        yield* addmsg('the monster');
        if(ch>1)yield* addmsg('s around you');
        yield* addmsg(' freeze');
        if(ch===1)yield* addmsg('s');
        yield* endmsg();
        scr_info[S_HOLD].oi_know=true;
      }
      else yield* msg('you feel a strange sense of loss');
      break;
    case S_SLEEP:
      /* scroll which makes you fall asleep */
      scr_info[S_SLEEP].oi_know=true;
      no_command+=rnd(SLEEPTIME)+4;
      player.t_flags&=~ISRUN;
      yield* msg('you fall asleep');
      break;
    case S_CREATE:
      /* create a monster: first look in a circle around him, next try his room, otherwise give up */
      i=0;
      for(y=hero.y-1;y<=hero.y+1;y++)
        for(x=hero.x-1;x<=hero.x+1;x++)
          /* don't put a monster in top of the player */
          if(y===hero.y&&x===hero.x)continue;
          /* or anything else nasty */
          else if(step_ok(ch=winat(y,x))){
            if(ch===SCROLL&&find_obj(y,x)!==null&&find_obj(y,x).o_which===S_SCARE)continue; /* the C dies on a xeroc dressed as a scroll */
            else if(rnd(++i)===0){
              mp.y=y;
              mp.x=x;
            }
          }
      if(i===0)yield* msg('you hear a faint cry of anguish in the distance');
      else{
        obj=new_item();
        new_monster(obj,randmonster(false),mp);
      }
      break;
    case S_ID_POTION:case S_ID_SCROLL:case S_ID_WEAPON:case S_ID_ARMOR:case S_ID_R_OR_S:
      /* identify, let him figure something out */
      scr_info[obj.o_which].oi_know=true;
      yield* msg('this scroll is an '+scr_info[obj.o_which].oi_name+' scroll');
      yield* whatis(true,id_type[obj.o_which]);
      break;
    case S_MAP:
      /* scroll of magic mapping */
      scr_info[S_MAP].oi_know=true;
      yield* msg('oh, now this scroll has a map on it');
      /* take all the things we want to keep hidden out of the window */
      for(y=1;y<NUMLINES-1;y++)
        for(x=0;x<NUMCOLS;x++){
          n=INDEX(y,x);
          var state;
          ch=pl_ch[n];
          switch(ch){
            case DOOR:case STAIRS:
              state=0;
              break;
            case HWALL:case VWALL:
              if(!(pl_fl[n]&F_REAL)){
                ch=pl_ch[n]=DOOR;
                pl_fl[n]|=F_REAL;
              }
              state=0;
              break;
            case SPACE:
              if(pl_fl[n]&F_REAL)state=2;	/* def: */
              else{
                pl_fl[n]|=F_REAL;
                ch=pl_ch[n]=PASSAGE;
                state=1;			/* pass: */
              }
              break;
            case PASSAGE:
              state=1;
              break;
            case FLOOR:
              if(pl_fl[n]&F_REAL)ch=SPACE;
              else{
                ch=TRAP;
                pl_ch[n]=TRAP;
                pl_fl[n]|=F_SEEN|F_REAL;
              }
              state=0;
              break;
            default:
              state=2;
          }
          if(state===2){
            if(pl_fl[n]&F_PASS)state=1;
            else ch=SPACE;
          }
          if(state===1){
            if(!(pl_fl[n]&F_REAL))pl_ch[n]=PASSAGE;
            pl_fl[n]|=F_SEEN|F_REAL;
            ch=PASSAGE;
          }
          if(ch!==SPACE){
            if((obj=pl_mo[n])!==null)obj.t_oldch=ch;
            if(obj===null||!on(player,SEEMONST))mvaddch(y,x,ch);
          }
        }
      break;
    case S_FDET:
      /* potion of gold detection */
      ch=false;
      wclear(hw);
      for(obj=lvl_obj;obj!==null;obj=obj.l_next)
        if(obj.o_type===FOOD){
          ch=true;
          wmove(hw,obj.o_pos.y,obj.o_pos.x);
          waddch(hw,FOOD);
        }
      if(ch){
        scr_info[S_FDET].oi_know=true;
        yield* show_win('Your nose tingles and you smell food.--More--');
      }
      else yield* msg('your nose tingles');
      break;
    case S_TELEP:
      /* scroll of teleportation: make him dissapear and reappear */
      cur_room=player.t_room;
      yield* teleport();
      if(cur_room!==player.t_room)scr_info[S_TELEP].oi_know=true;
      break;
    case S_ENCH:
      if(cur_weapon===null||cur_weapon.o_type!==WEAPON)yield* msg('you feel a strange sense of loss');
      else{
        cur_weapon.o_flags&=~ISCURSED;
        if(rnd(2)===0)cur_weapon.o_hplus++;
        else cur_weapon.o_dplus++;
        yield* msg('your '+weap_info[cur_weapon.o_which].oi_name+' glows '+pick_color('blue')+' for a moment');
      }
      break;
    case S_SCARE:
      /* reading it is a mistake and produces laughter at her poor boo boo */
      yield* msg('you hear maniacal laughter in the distance');
      break;
    case S_REMOVE:
      uncurse(cur_armor);
      uncurse(cur_weapon);
      uncurse(cur_ring[LEFT]);
      uncurse(cur_ring[RIGHT]);
      yield* msg(choose_str('you feel in touch with the Universal Onenes','you feel as if somebody is watching over you'));
      break;
    case S_AGGR:
      /* this scroll aggravates all the monsters on the current level and sets them running towards the hero */
      aggravate();
      yield* msg('you hear a high pitched humming noise');
      break;
    case S_PROTECT:
      if(cur_armor!==null){
        cur_armor.o_flags|=ISPROT;
        yield* msg('your armor is covered by a shimmering '+pick_color('gold')+' shield');
      }
      else yield* msg('you feel a strange sense of loss');
      break;
  }
  obj=orig_obj;
  yield* look(true);	/* put the result of the scroll on the screen */
  yield* status();
  yield* call_it(scr_info[obj.o_which]);
  if(discardit)discard(obj);
}
function uncurse(obj){
  if(obj!==null)obj.o_flags&=~ISCURSED;
}

/* ---------- sticks.c ---------- */
function fix_stick(cur){
  if(ws_type[cur.o_which]==='staff')cur.o_damage='2x3';
  else cur.o_damage='1x1';
  cur.o_hurldmg='1x1';
  switch(cur.o_which){
    case WS_LIGHT:
      cur.o_arm=rnd(10)+10;
      break;
    default:
      cur.o_arm=rnd(5)+3;
  }
}
var zap_bolt=new_item();
function* do_zap(){
  var obj,tp,y,x,name,monster,oldch,bolt=zap_bolt;
  if((obj=yield* get_item('zap with',STICK))===null)return;
  if(obj.o_type!==STICK){
    after=false;
    yield* msg("you can't zap with that!");
    return;
  }
  if(obj.o_arm===0){
    yield* msg('nothing happens');
    return;
  }
  switch(obj.o_which){
    case WS_LIGHT:
      /* reddy kilowat wand: light up the room */
      ws_info[WS_LIGHT].oi_know=true;
      if(player.t_room.r_flags&ISGONE)yield* msg('the corridor glows and then fades');
      else{
        player.t_room.r_flags&=~ISDARK;
        /* light the room and put the player back up */
        yield* enter_room(hero);
        yield* addmsg('the room is lit');
        if(!terse)yield* addmsg(' by a shimmering '+pick_color('blue')+' light');
        yield* endmsg();
      }
      break;
    case WS_DRAIN:
      /* take away 1/2 of hero's hit points, then take it away evenly from the monsters in the room (or next to hero if he is in a passage) */
      if(pstats.s_hpt<2){
        yield* msg('you are too weak to use it');
        return;
      }
      else yield* drain();
      break;
    case WS_INVIS:case WS_POLYMORPH:case WS_TELAWAY:case WS_TELTO:case WS_CANCEL:
      y=hero.y;
      x=hero.x;
      while(step_ok(winat(y,x))){
        y+=delta.y;
        x+=delta.x;
      }
      if((tp=moat(y,x))!==null){
        monster=tp.t_type;
        if(monster===ord('F'))player.t_flags&=~ISHELD;
        switch(obj.o_which){
          case WS_INVIS:
            tp.t_flags|=ISINVIS;
            if(cansee(y,x))mvaddch(y,x,tp.t_oldch);
            break;
          case WS_POLYMORPH:{
            var pp=tp.t_pack;
            mlist=detach(mlist,tp);
            if(see_monst(tp))mvaddch(y,x,chat(y,x));
            oldch=tp.t_oldch;
            delta.y=y;
            delta.x=x;
            new_monster(tp,monster=rnd(26)+65,delta);
            if(see_monst(tp))mvaddch(y,x,monster);
            tp.t_oldch=oldch;
            tp.t_pack=pp;
            if(see_monst(tp))ws_info[WS_POLYMORPH].oi_know=true;
            break;
          }
          case WS_CANCEL:
            tp.t_flags|=ISCANC;
            tp.t_flags&=~(ISINVIS|CANHUH);
            tp.t_disguise=tp.t_type;
            if(see_monst(tp))mvaddch(y,x,tp.t_disguise);
            break;
          case WS_TELAWAY:case WS_TELTO:{
            var new_pos={x:0,y:0};
            if(obj.o_which===WS_TELAWAY){
              do{
                find_floor(null,new_pos,false,true);
              }while(ce(new_pos,hero));
            }
            else{
              new_pos.y=hero.y+delta.y;
              new_pos.x=hero.x+delta.x;
            }
            tp.t_dest=hero;
            tp.t_flags|=ISRUN;
            relocate(tp,new_pos);
          }
        }
      }
      break;
    case WS_MISSILE:
      ws_info[WS_MISSILE].oi_know=true;
      bolt.o_type=GOLD;
      bolt.o_hurldmg='1x4';
      bolt.o_hplus=100;
      bolt.o_dplus=1;
      bolt.o_flags=ISMISL;
      if(cur_weapon!==null)bolt.o_launch=cur_weapon.o_which;
      do_motion(bolt,delta.y,delta.x);
      if((tp=moat(bolt.o_pos.y,bolt.o_pos.x))!==null&&!save_throw(VS_MAGIC,tp))
        yield* hit_monster(bolt.o_pos.y,bolt.o_pos.x,bolt);
      else if(terse)yield* msg('missle vanishes');
      else yield* msg('the missle vanishes with a puff of smoke');
      break;
    case WS_HASTE_M:case WS_SLOW_M:
      y=hero.y;
      x=hero.x;
      while(step_ok(winat(y,x))){
        y+=delta.y;
        x+=delta.x;
      }
      if((tp=moat(y,x))!==null){
        if(obj.o_which===WS_HASTE_M){
          if(on(tp,ISSLOW))tp.t_flags&=~ISSLOW;
          else tp.t_flags|=ISHASTE;
        }
        else{
          if(on(tp,ISHASTE))tp.t_flags&=~ISHASTE;
          else tp.t_flags|=ISSLOW;
          tp.t_turn=true;
        }
        delta.y=y;
        delta.x=x;
        runto(delta);
      }
      break;
    case WS_ELECT:case WS_FIRE:case WS_COLD:
      if(obj.o_which===WS_ELECT)name='bolt';
      else if(obj.o_which===WS_FIRE)name='flame';
      else name='ice';
      yield* fire_bolt(hero,delta,name);
      ws_info[obj.o_which].oi_know=true;
      break;
    case WS_NOP:
      break;
  }
  obj.o_arm--;
}
function* drain(){
  var mp,corp,cnt,inpass,drainee=[],i;
  /* first cnt how many things we need to spread the hit points among */
  cnt=0;
  if(chat(hero.y,hero.x)===DOOR)corp=passages[flat(hero.y,hero.x)&F_PNUM];
  else corp=null;
  inpass=!!(player.t_room.r_flags&ISGONE);
  for(mp=mlist;mp!==null;mp=mp.l_next)
    if(mp.t_room===player.t_room||mp.t_room===corp||
      (inpass&&chat(mp.t_pos.y,mp.t_pos.x)===DOOR&&passages[flat(mp.t_pos.y,mp.t_pos.x)&F_PNUM]===player.t_room))
        drainee.push(mp);
  if((cnt=drainee.length)===0){
    yield* msg('you have a tingling feeling');
    return;
  }
  pstats.s_hpt=idiv(pstats.s_hpt,2);
  cnt=idiv(pstats.s_hpt,cnt);
  /* now zot all of the monsters */
  for(i=0;i<drainee.length;i++){
    mp=drainee[i];
    if((mp.t_stats.s_hpt-=cnt)<=0)yield* killed(mp,see_monst(mp));
    else runto(mp.t_pos);
  }
}
var fb_pos={x:0,y:0},fb_spots=[];
(function(){for(var i=0;i<BOLT_LENGTH;i++)fb_spots.push({x:0,y:0})})();
function* fire_bolt(start,dir,name){
  var c1,c2,tp,dirch=0,ch,hit_hero,used,changed_,pos=fb_pos,spotpos=fb_spots,bolt=new_item();
  bolt.o_type=WEAPON;
  bolt.o_which=FLAME;
  bolt.o_hurldmg='6x6';
  bolt.o_hplus=100;
  bolt.o_dplus=0;
  /* the rest of this bolt is stack garbage in the C; o_launch below zero is what makes the 6x6 count */
  bolt.o_launch=-1;
  weap_info[FLAME].oi_name=name;
  switch(dir.y+dir.x){
    case 0:dirch=47;break;
    case 1:case -1:dirch=dir.y===0?HWALL:VWALL;break;
    case 2:case -2:dirch=92;break;
  }
  cp(pos,start);
  hit_hero=start!==hero;
  used=false;
  changed_=false;
  for(c1=0;c1<=BOLT_LENGTH-1&&!used;c1++){
    pos.y+=dir.y;
    pos.x+=dir.x;
    cp(spotpos[c1],pos);
    ch=winat(pos.y,pos.x);
    var isdef=false;
    switch(ch){
      case DOOR:
        /* this code is necessary if the hero is on a door and he fires at the wall the door is in, it would otherwise loop infinitely */
        if(ce(hero,pos)){isdef=true;break}
        /* FALLTHROUGH */
      case VWALL:case HWALL:case SPACE:
        if(!changed_)hit_hero=!hit_hero;
        changed_=false;
        dir.y=-dir.y;
        dir.x=-dir.x;
        c1--;
        yield* msg('the '+name+' bounces');
        break;
      default:
        isdef=true;
    }
    if(isdef){
      if(!hit_hero&&(tp=moat(pos.y,pos.x))!==null){
        hit_hero=true;
        changed_=!changed_;
        tp.t_oldch=chat(pos.y,pos.x);
        if(!save_throw(VS_MAGIC,tp)){
          cp(bolt.o_pos,pos);
          used=true;
          if(tp.t_type===ord('D')&&name==='flame'){
            yield* addmsg('the flame bounces');
            if(!terse)yield* addmsg(' off the dragon');
            yield* endmsg();
          }
          else yield* hit_monster(pos.y,pos.x,bolt);
        }
        else if(ch!==ord('M')||tp.t_disguise===ord('M')){
          if(start===hero)runto(pos);
          if(terse)yield* msg(name+' misses');
          else yield* msg('the '+name+' whizzes past '+set_mname(tp));
        }
      }
      else if(hit_hero&&ce(pos,hero)){
        hit_hero=false;
        changed_=!changed_;
        if(!save(VS_MAGIC)){
          if((pstats.s_hpt-=roll(6,6))<=0){
            if(start===hero)yield* death(ord('b'));
            else yield* death(moat(start.y,start.x).t_type);
          }
          used=true;
          if(terse)yield* msg('the '+name+' hits');
          else yield* msg('you are hit by the '+name);
        }
        else yield* msg('the '+name+' whizzes by you');
      }
      mvaddch(pos.y,pos.x,dirch);
      refresh();
    }
  }
  for(c2=0;c2<c1;c2++)mvaddch(spotpos[c2].y,spotpos[c2].x,chat(spotpos[c2].y,spotpos[c2].x));
}
function charge_str(obj){
  if(!(obj.o_flags&ISKNOW))return '';
  else if(terse)return ' ['+obj.o_arm+']';
  else return ' ['+obj.o_arm+' charges]';
}

/* ---------- things.c ---------- */
function inv_name(obj,drop){
  var pb,op,sp,which;
  which=obj.o_which;
  pb='';
  switch(obj.o_type){
    case POTION:
      pb=nameit(obj,'potion',p_colors[which],pot_info[which],nullstr);
      break;
    case RING:
      pb=nameit(obj,'ring',r_stones[which],ring_info[which],ring_num);
      break;
    case STICK:
      pb=nameit(obj,ws_type[which],ws_made[which],ws_info[which],charge_str);
      break;
    case SCROLL:
      if(obj.o_count===1)pb='A scroll ';
      else pb=obj.o_count+' scrolls ';
      op=scr_info[which];
      if(op.oi_know)pb+='of '+op.oi_name;
      else if(op.oi_guess)pb+='called '+op.oi_guess;
      else pb+="titled '"+s_names[which]+"'";
      break;
    case FOOD:
      if(which===1)
        if(obj.o_count===1)pb='A'+vowelstr(fruit)+' '+fruit;
        else pb=obj.o_count+' '+fruit+'s';
      else
        if(obj.o_count===1)pb='Some food';
        else pb=obj.o_count+' rations of food';
      break;
    case WEAPON:
      sp=weap_info[which].oi_name;
      if(obj.o_count>1)pb=obj.o_count+' ';
      else pb='A'+vowelstr(sp)+' ';
      if(obj.o_flags&ISKNOW)pb+=num(obj.o_hplus,obj.o_dplus,WEAPON)+' '+sp;
      else pb+=sp;
      if(obj.o_count>1)pb+='s';
      if(obj.o_label!==null)pb+=' called '+obj.o_label;
      break;
    case ARMOR:
      sp=arm_info[which].oi_name;
      if(obj.o_flags&ISKNOW){
        pb=num(a_class[which]-obj.o_arm,0,ARMOR)+' '+sp+' [';
        if(!terse)pb+='protection ';
        pb+=(10-obj.o_arm)+']';
      }
      else pb=sp;
      if(obj.o_label!==null)pb+=' called '+obj.o_label;
      break;
    case AMULET:
      pb='The Amulet of Yendor';
      break;
    case GOLD:
      pb=obj.o_arm+' Gold pieces';
      break;
  }
  if(inv_describe){
    if(obj===cur_armor)pb+=' (being worn)';
    if(obj===cur_weapon)pb+=' (weapon in hand)';
    if(obj===cur_ring[LEFT])pb+=' (on left hand)';
    else if(obj===cur_ring[RIGHT])pb+=' (on right hand)';
  }
  if(drop&&isupper(pb.charCodeAt(0)))pb=pb.charAt(0).toLowerCase()+pb.slice(1);
  else if(!drop&&islower(pb.charCodeAt(0)))pb=pb.charAt(0).toUpperCase()+pb.slice(1);
  prbuf=pb;
  return pb;
}
function* drop(){
  var ch,obj;
  ch=chat(hero.y,hero.x);
  if(ch!==FLOOR&&ch!==PASSAGE){
    after=false;
    yield* msg('there is something there already');
    return;
  }
  if((obj=yield* get_item('drop',0))===null)return;
  if(!(yield* dropcheck(obj)))return;
  obj=leave_pack(obj,true,!ISMULT(obj.o_type));
  /* link it into the level object list */
  lvl_obj=attach(lvl_obj,obj);
  setchat(hero.y,hero.x,obj.o_type);
  setflat(hero.y,hero.x,flat(hero.y,hero.x)|F_DROPPED);
  cp(obj.o_pos,hero);
  if(obj.o_type===AMULET)amulet=false;
  yield* msg('dropped '+inv_name(obj,true));
}
function* dropcheck(obj){
  if(obj===null)return true;
  if(obj!==cur_armor&&obj!==cur_weapon&&obj!==cur_ring[LEFT]&&obj!==cur_ring[RIGHT])return true;
  if(obj.o_flags&ISCURSED){
    yield* msg("you can't.  It appears to be cursed");
    return false;
  }
  if(obj===cur_weapon)cur_weapon=null;
  else if(obj===cur_armor){
    yield* waste_time();
    cur_armor=null;
  }
  else{
    cur_ring[obj===cur_ring[LEFT]?LEFT:RIGHT]=null;
    switch(obj.o_which){
      case R_ADDSTR:
        chg_str(-obj.o_arm);
        break;
      case R_SEEINVIS:
        yield* unsee();
        extinguish(unsee);
        break;
    }
  }
  return true;
}
function new_thing(){
  var cur,r;
  cur=new_item();
  cur.o_hplus=0;
  cur.o_dplus=0;
  cur.o_damage='0x0';
  cur.o_hurldmg='0x0';
  cur.o_arm=11;
  cur.o_count=1;
  cur.o_group=0;
  cur.o_flags=0;
  /* decide what kind of object it will be; if we haven't had food for a while, let it be food */
  switch(no_food>3?2:pick_one(things,NUMTHINGS)){
    case 0:
      cur.o_type=POTION;
      cur.o_which=pick_one(pot_info,MAXPOTIONS);
      break;
    case 1:
      cur.o_type=SCROLL;
      cur.o_which=pick_one(scr_info,MAXSCROLLS);
      break;
    case 2:
      cur.o_type=FOOD;
      no_food=0;
      if(rnd(10)!==0)cur.o_which=0;
      else cur.o_which=1;
      break;
    case 3:
      init_weapon(cur,pick_one(weap_info,MAXWEAPONS));
      if((r=rnd(100))<10){
        cur.o_flags|=ISCURSED;
        cur.o_hplus-=rnd(3)+1;
      }
      else if(r<15)cur.o_hplus+=rnd(3)+1;
      break;
    case 4:
      cur.o_type=ARMOR;
      cur.o_which=pick_one(arm_info,MAXARMORS);
      cur.o_arm=a_class[cur.o_which];
      if((r=rnd(100))<20){
        cur.o_flags|=ISCURSED;
        cur.o_arm+=rnd(3)+1;
      }
      else if(r<28)cur.o_arm-=rnd(3)+1;
      break;
    case 5:
      cur.o_type=RING;
      cur.o_which=pick_one(ring_info,MAXRINGS);
      switch(cur.o_which){
        case R_ADDSTR:case R_PROTECT:case R_ADDHIT:case R_ADDDAM:
          if((cur.o_arm=rnd(3))===0){
            cur.o_arm=-1;
            cur.o_flags|=ISCURSED;
          }
          break;
        case R_AGGR:case R_TELEPORT:
          cur.o_flags|=ISCURSED;
      }
      break;
    case 6:
      cur.o_type=STICK;
      cur.o_which=pick_one(ws_info,MAXSTICKS);
      fix_stick(cur);
      break;
  }
  return cur;
}
function pick_one(info,nitems){
  var n,i=rnd(100);
  for(n=0;n<nitems;n++)
    if(i<info[n].oi_prob)break;
  if(n===nitems)n=0;
  return n;
}
var line_cnt=0,newpage=false,lastfmt='',disc_obj=new_item(),disc_order=[];
function* discovered(){
  var ch,disc_list;
  do{
    disc_list=false;
    if(!terse)yield* addmsg('for ');
    yield* addmsg('what type');
    if(!terse)yield* addmsg(' of object do you want a list');
    yield* msg('? (* for all)');
    ch=yield* readchar();
    switch(ch){
      case ESCAPE:
        yield* msg('');
        return;
      case POTION:case SCROLL:case RING:case STICK:case ord('*'):
        disc_list=true;
        break;
      default:
        if(terse)yield* msg('Not a type');
        else yield* msg('Please type one of '+chr(POTION)+chr(SCROLL)+chr(RING)+chr(STICK)+' (ESCAPE to quit)');
    }
  }while(!disc_list);
  if(ch===ord('*')){
    yield* print_disc(POTION);
    yield* add_line('',null);
    yield* print_disc(SCROLL);
    yield* add_line('',null);
    yield* print_disc(RING);
    yield* add_line('',null);
    yield* print_disc(STICK);
    yield* end_line();
  }
  else{
    yield* print_disc(ch);
    yield* end_line();
  }
}
function* print_disc(type){
  var info=null,i,maxnum=0,num_found,obj=disc_obj,order=disc_order;
  switch(type){
    case SCROLL:maxnum=MAXSCROLLS;info=scr_info;break;
    case POTION:maxnum=MAXPOTIONS;info=pot_info;break;
    case RING:maxnum=MAXRINGS;info=ring_info;break;
    case STICK:maxnum=MAXSTICKS;info=ws_info;break;
  }
  set_order(order,maxnum);
  obj.o_count=1;
  obj.o_flags=0;
  num_found=0;
  for(i=0;i<maxnum;i++)
    if(info[order[i]].oi_know||info[order[i]].oi_guess){
      obj.o_type=type;
      obj.o_which=order[i];
      yield* add_line('%s',inv_name(obj,false));
      num_found++;
    }
  if(num_found===0)yield* add_line(nothing(type),null);
}
function set_order(order,numthings){
  var i,r,t;
  for(i=0;i<numthings;i++)order[i]=i;
  for(i=numthings;i>0;i--){
    r=rnd(i);
    t=order[i-1];
    order[i-1]=order[r];
    order[r]=t;
  }
}
var al_maxlen=-1;
function* add_line(fmt,arg){
  var tw,x,y,prompt='--Press space to continue--',text;
  if(line_cnt===0){
    wclear(hw);
    if(inv_type===INV_SLOW)mpos=0;
  }
  text=fmt===null?null:arg===null?fmt:fmt.replace('%s',function(){return arg});
  if(inv_type===INV_SLOW){
    if(fmt!=='')
      if((yield* msg(text))===ESCAPE)return ESCAPE;
    line_cnt++;
  }
  else{
    if(al_maxlen<0)al_maxlen=prompt.length;
    if(line_cnt>=LINES-1||fmt===null){
      if(inv_type===INV_OVER&&fmt===null&&!newpage){
        yield* msg('');
        refresh();
        /* the C makes a subwindow one column in for the copy; writing one column in comes to the same */
        tw=newwin(line_cnt+1,al_maxlen+2,0,Math.max(0,COLS-al_maxlen-3));
        for(y=0;y<=line_cnt;y++){
          wmove(tw,y,1);
          for(x=0;x<=al_maxlen&&x+1<tw.cols;x++){
            wmove(hw,y,x);
            wmove(tw,y,x+1);
            waddch(tw,winch(hw));
          }
        }
        wmove(tw,line_cnt,1);
        waddstr(tw,prompt);
        touchwin(tw);
        wrefresh(tw);
        yield* wait_for(32);
        werase(tw);
        leaveok(tw,true);
        wrefresh(tw);
        touchwin(stdscr);
      }
      else{
        wmove(hw,LINES-1,0);
        waddstr(hw,prompt);
        wrefresh(hw);
        yield* wait_for(32);
        clearok(curscr,true);
        wclear(hw);
        touchwin(stdscr);
      }
      newpage=true;
      line_cnt=0;
      al_maxlen=prompt.length;
    }
    if(fmt!==null&&!(line_cnt===0&&fmt==='')){
      mvwprintw(hw,line_cnt++,0,text);
      if(al_maxlen<hw.x)al_maxlen=hw.x;
      lastfmt=text;
    }
  }
  return ~ESCAPE;
}
function* end_line(){
  if(inv_type!==INV_SLOW){
    if(line_cnt===1&&!newpage){
      mpos=0;
      yield* msg(lastfmt);
    }
    else yield* add_line(null,null);
  }
  line_cnt=0;
  newpage=false;
}
function nothing(type){
  var tystr=null;
  if(terse)prbuf='Nothing';
  else prbuf="Haven't discovered anything";
  if(type!==ord('*')){
    switch(type){
      case POTION:tystr='potion';break;
      case SCROLL:tystr='scroll';break;
      case RING:tystr='ring';break;
      case STICK:tystr='stick';break;
    }
    prbuf+=' about any '+tystr+'s';
  }
  return prbuf;
}
function nameit(obj,type,which,op,prfunc){
  var pb;
  if(op.oi_know||op.oi_guess){
    if(obj.o_count===1)pb='A '+type+' ';
    else pb=obj.o_count+' '+type+'s ';
    if(op.oi_know)pb+='of '+op.oi_name+prfunc(obj)+'('+which+')';
    else if(op.oi_guess)pb+='called '+op.oi_guess+prfunc(obj)+'('+which+')';
  }
  else if(obj.o_count===1)pb='A'+vowelstr(which)+' '+which+' '+type;
  else pb=obj.o_count+' '+which+' '+type+'s';
  return pb;
}
function nullstr(){return ''}

/* ---------- weapons.c ---------- */
var NO_WEAPON=-1,group=2;
var init_dam=[
  ['2x4','1x3',NO_WEAPON,0],		/* mace */
  ['3x4','1x2',NO_WEAPON,0],		/* long sword */
  ['1x1','1x1',NO_WEAPON,0],		/* bow */
  ['1x1','2x3',BOW,ISMANY|ISMISL],	/* arrow */
  ['1x6','1x4',NO_WEAPON,ISMISL],	/* dagger */
  ['4x4','1x2',NO_WEAPON,0],		/* 2h sword */
  ['1x1','1x3',NO_WEAPON,ISMANY|ISMISL],	/* dart */
  ['1x2','2x4',NO_WEAPON,ISMANY|ISMISL],	/* shuriken */
  ['2x3','1x6',NO_WEAPON,ISMISL]	/* spear */
];
function* missile(ydelta,xdelta){
  var obj;
  /* get which thing we are hurling */
  if((obj=yield* get_item('throw',WEAPON))===null)return;
  if(!(yield* dropcheck(obj))||(yield* is_current(obj)))return;
  obj=leave_pack(obj,true,false);
  do_motion(obj,ydelta,xdelta);
  /* AHA! Here it has hit something.  If it is a wall or a door, or if it misses (combat) the monster, put it on the floor */
  if(moat(obj.o_pos.y,obj.o_pos.x)===null||!(yield* hit_monster(obj.o_pos.y,obj.o_pos.x,obj)))
    yield* fall(obj,true);
}
function do_motion(obj,ydelta,xdelta){
  var ch;
  /* come fly with us ... */
  cp(obj.o_pos,hero);
  for(;;){
    /* erase the old one */
    if(!ce(obj.o_pos,hero)&&cansee(obj.o_pos.y,obj.o_pos.x)&&!terse){
      ch=chat(obj.o_pos.y,obj.o_pos.x);
      if(ch===FLOOR&&!show_floor())ch=SPACE;
      mvaddch(obj.o_pos.y,obj.o_pos.x,ch);
    }
    /* get the new position */
    obj.o_pos.y+=ydelta;
    obj.o_pos.x+=xdelta;
    if(step_ok(ch=winat(obj.o_pos.y,obj.o_pos.x))&&ch!==DOOR){
      /* it hasn't hit anything yet, so display it if it alright */
      if(cansee(obj.o_pos.y,obj.o_pos.x)&&!terse){
        mvaddch(obj.o_pos.y,obj.o_pos.x,obj.o_type);
        refresh();
      }
      continue;
    }
    break;
  }
}
var fall_pos={x:0,y:0};
function fall_place(obj){
  var i,fpos=fall_pos;
  if(fallpos(obj.o_pos,fpos)){
    i=INDEX(fpos.y,fpos.x);
    pl_ch[i]=obj.o_type;
    cp(obj.o_pos,fpos);
    if(cansee(fpos.y,fpos.x)){
      if(pl_mo[i]!==null)pl_mo[i].t_oldch=obj.o_type;
      else mvaddch(fpos.y,fpos.x,obj.o_type);
    }
    lvl_obj=attach(lvl_obj,obj);
    return true;
  }
  return false;
}
function fall_quiet(obj){fall_place(obj)}
function* fall(obj,pr){
  if(fall_place(obj))return;
  if(pr){
    if(has_hit){
      yield* endmsg();
      has_hit=false;
    }
    var oi_=weap_info[obj.o_which]; /* what was thrown need not be a weapon; printf says (null) */
    yield* msg('the '+(oi_&&oi_.oi_name||'(null)')+' vanishes as it hits the ground');
  }
  discard(obj);
}
function init_weapon(weap,which){
  var iwp;
  weap.o_type=WEAPON;
  weap.o_which=which;
  iwp=init_dam[which];
  weap.o_damage=iwp[0];
  weap.o_hurldmg=iwp[1];
  weap.o_launch=iwp[2];
  weap.o_flags=iwp[3];
  weap.o_hplus=0;
  weap.o_dplus=0;
  if(which===DAGGER){
    weap.o_count=rnd(4)+2;
    weap.o_group=group++;
  }
  else if(weap.o_flags&ISMANY){
    weap.o_count=rnd(8)+8;
    weap.o_group=group++;
  }
  else{
    weap.o_count=1;
    weap.o_group=0;
  }
}
var hm_mp={x:0,y:0};
function* hit_monster(y,x,obj){
  hm_mp.y=y;
  hm_mp.x=x;
  return yield* fight(hm_mp,obj,true);
}
function num(n1,n2,type){
  var s=(n1<0?'':'+')+n1;
  if(type===WEAPON)s+=(n2<0?',':',+')+n2;
  return s;
}
function* wield(){
  var obj,oweapon,sp;
  oweapon=cur_weapon;
  if(!(yield* dropcheck(cur_weapon))){
    cur_weapon=oweapon;
    return;
  }
  cur_weapon=oweapon;
  if((obj=yield* get_item('wield',WEAPON))===null){
    after=false;
    return;
  }
  if(obj.o_type===ARMOR){
    yield* msg("you can't wield armor");
    after=false;
    return;
  }
  if(yield* is_current(obj)){
    after=false;
    return;
  }
  sp=inv_name(obj,true);
  cur_weapon=obj;
  if(!terse)yield* addmsg('you are now ');
  yield* msg('wielding '+sp+' ('+chr(obj.o_packch)+')');
}
function fallpos(pos,newpos){
  var y,x,cnt,ch;
  cnt=0;
  for(y=pos.y-1;y<=pos.y+1;y++)
    for(x=pos.x-1;x<=pos.x+1;x++){
      /* check to make certain the spot is empty, if it is, put the object there, set it in the level list and re-draw the room if he can see it */
      if(y===hero.y&&x===hero.x)continue;
      if(((ch=chat(y,x))===FLOOR||ch===PASSAGE)&&rnd(++cnt)===0){
        newpos.y=y;
        newpos.x=x;
      }
    }
  return cnt!==0;
}

/* ---------- wizard.c ---------- */
function* whatis(insist,type){
  var obj;
  if(player.t_pack===null){
    yield* msg("you don't have anything in your pack to identify");
    return;
  }
  for(;;){
    obj=yield* get_item('identify',type);
    if(insist){
      if(n_objs===0)return;
      else if(obj===null)yield* msg('you must identify something');
      else if(type&&obj.o_type!==type&&!(type===R_OR_S&&(obj.o_type===RING||obj.o_type===STICK)))
        yield* msg('you must identify a '+type_name(type));
      else break;
    }
    else break;
  }
  if(obj===null)return;
  switch(obj.o_type){
    case SCROLL:set_know(obj,scr_info);break;
    case POTION:set_know(obj,pot_info);break;
    case STICK:set_know(obj,ws_info);break;
    case WEAPON:case ARMOR:obj.o_flags|=ISKNOW;break;
    case RING:set_know(obj,ring_info);break;
  }
  yield* msg(inv_name(obj,false));
}
function set_know(obj,info){
  info[obj.o_which].oi_know=true;
  obj.o_flags|=ISKNOW;
  info[obj.o_which].oi_guess=null;
}
function type_name(type){
  switch(type){
    case POTION:return 'potion';
    case SCROLL:return 'scroll';
    case FOOD:return 'food';
    case R_OR_S:return 'ring, wand or staff';
    case RING:return 'ring';
    case STICK:return 'wand or staff';
    case WEAPON:return 'weapon';
    case ARMOR:return 'suit of armor';
  }
  return '';
}
var tele_c={x:0,y:0};
function* teleport(){
  var c=tele_c;
  mvaddch(hero.y,hero.x,floor_at());
  find_floor(null,c,false,true);
  if(roomin(c)!==player.t_room){
    yield* leave_room(hero);
    cp(hero,c);
    yield* enter_room(hero);
  }
  else{
    cp(hero,c);
    yield* look(true);
  }
  mvaddch(hero.y,hero.x,PLAYER);
  /* turn off ISHELD in case teleportation was done while fighting a flytrap */
  if(on(player,ISHELD)){
    player.t_flags&=~ISHELD;
    vf_hit=0;
    monsters[ord('F')-65].m_stats.s_dmg='000x0';
  }
  no_move=0;
  count=0;
  running=false;
  flush_type();
}
function flush_type(){} /* flushinp: the keyboard here never gets ahead of the game */

/* ---------- save.c ---------- */
function* save_game(){
  var c,buf='',ref,gotfile,err;
  /* get file name */
  mpos=0;
  over:for(;;){
    gotfile=false;
    if(file_name!==''){
      for(;;){
        yield* msg('save file ('+file_name+')? ');
        c=yield* readchar();
        mpos=0;
        if(c===ESCAPE){
          yield* msg('');
          return;
        }
        else if(c===ord('n')||c===ord('N')||c===ord('y')||c===ord('Y'))break;
        else yield* msg('please answer Y or N');
      }
      if(c===ord('y')||c===ord('Y')){
        addstr('Yes\n');
        refresh();
        buf=file_name;
        gotfile=true;
      }
    }
    do{
      if(!gotfile){
        mpos=0;
        yield* msg('file name: ');
        buf='';
        ref={get:function(){return buf},set:function(v){buf=v}};
        if((yield* get_str(ref,stdscr))===QUIT){
          yield* msg('');
          return;
        }
        mpos=0;
      }
      gotfile=false;
      /* test to see if the file exists */
      if(file_exists(buf)){
        for(;;){
          yield* msg('File exists.  Do you wish to overwrite it?');
          mpos=0;
          if((c=yield* readchar())===ESCAPE){
            yield* msg('');
            return;
          }
          if(c===ord('y')||c===ord('Y'))break;
          else if(c===ord('n')||c===ord('N'))continue over;
          else yield* msg('Please answer Y or N');
        }
        yield* msg('file name: '+buf);
        md_unlink(buf);	/* the C unlinks file_name, the old name, here: the file it just asked about is the one to go */
      }
      file_name=buf;
      if((err=save_file(file_name))!==null)yield* msg(err);
    }while(err!==null);
    break;
  }
  my_exit(0);
}
function file_exists(name){
  var abs=P.norm(name);
  return P.saved('rogue/'+abs)!==null||P.find(abs,true)!==null;
}
function md_unlink(name){
  var abs=P.norm(name),n=P.find(abs,true);
  P.save('rogue/'+abs,null);
  if(n&&n.parent&&n.type!=='d'&&cant_save(name)===null)delete n.parent.kids[n.name];
}
function cant_save(name){ /* null, or what strerror would say of opening it to write */
  var abs=P.norm(name),ex=P.find(abs,true);
  if(ex&&ex.type==='d')return 'Is a directory';
  if(ex&&(ex.prot||(ex.parent&&ex.parent.prot)))return 'Permission denied';
  return P.canWrite&&!P.canWrite(abs)?'Permission denied':null;
}
/* fopen and rs_save_file: null, or what strerror would say. It also shows in the file system,
   for as long as the file system lasts; the game itself is in the browser under rogue/name */
function save_file(name){
  var abs=P.norm(name),data;
  if((data=cant_save(name))!==null)return data;
  data=encode(snapshot());
  if(!P.save('rogue/'+abs,data))return 'No space left on device';
  if(P.put)P.put(abs,'f',{owner:P.st.user,date:P.now(),bin:true,mode:'-r--------',size:JSON.stringify(data).length});
  return null;
}
function* restore(file){
  var abs,data;
  if(file==='-r')file=file_name;
  abs=P.norm(file);
  data=P.saved('rogue/'+abs);
  if(data===null||typeof data!=='object'){
    if(P.find(abs,true)!==null)out.push('Sorry, saved game is out of date.');
    else out.push(file+': No such file or directory');
    return false;
  }
  if(data.version!==VERSION){
    out.push('Sorry, saved game is out of date.');
    return false;
  }
  initscr();
  hw=newwin(LINES,COLS,0,0);
  unsnapshot(decode(data));
  md_unlink(file);
  mpos=0;
  clearok(stdscr,true);
  touchwin(stdscr);
  /* defeat multiple restarting from the same place */
  if(pstats.s_hpt<=0){
    out.push('','"He\'s dead, Jim"');
    return false;
  }
  file_name=file;
  clearok(curscr,true);
  yield* msg('file name: '+file);
  yield* playit();
  return false;
}
/* the save file: what the C's rs_save_file keeps, as a table of objects, each pointer an index into
   it. So a monster's t_dest is still the hero or the very object it wants, and lists stay lists. */
var DAEMONS={runners:runners,doctor:doctor,swander:swander,rollwand:rollwand,unconfuse:unconfuse,unsee:unsee,sight:sight,
  nohaste:nohaste,stomach:stomach,come_down:come_down,visuals:visuals,land:land,turn_see_off:turn_see_off};
function encode(root){
  var objs=[],ids=new Map(),names=new Map();
  Object.keys(DAEMONS).forEach(function(k){names.set(DAEMONS[k],k)});
  function enc(v){
    if(typeof v==='function')return {f:names.get(v)};
    if(v===null||typeof v!=='object')return v;
    if(ids.has(v))return {r:ids.get(v)};
    var id=objs.length,o;
    ids.set(v,id);
    objs.push(null);
    if(Array.isArray(v)||ArrayBuffer.isView(v))o=Array.prototype.map.call(v,function(x){return enc(x)}).slice();
    else{
      o={};
      Object.keys(v).forEach(function(k){o[k]=enc(v[k])});
    }
    objs[id]=o;
    return {r:id};
  }
  return {version:VERSION,root:enc(root),objs:objs};
}
function decode(data){
  var shells=data.objs.map(function(o){return Array.isArray(o)?[]:{}});
  function dec(v){
    if(v===null||typeof v!=='object')return v;
    if('f' in v){
      if(!P.has(DAEMONS,v.f))throw new Error('bad daemon');
      return DAEMONS[v.f];
    }
    if(v.r===undefined)return undefined; /* what a routine with no name saves as */
    if(!Number.isInteger(v.r)||v.r<0||v.r>=shells.length)throw new Error('bad index');
    return shells[v.r];
  }
  data.objs.forEach(function(o,i){
    var s=shells[i];
    if(Array.isArray(o))o.forEach(function(x){s.push(dec(x))});
    else Object.keys(o).forEach(function(k){s[k]=dec(o[k])});
  });
  return dec(data.root);
}
function snapshot(){
  return {after:after,again:again,noscore:noscore,seenstairs:seenstairs,amulet:amulet,door_stop:door_stop,fight_flush:fight_flush,
    firstmove:firstmove,got_ltc:got_ltc,has_hit:has_hit,in_shell:in_shell,inv_describe:inv_describe,jump:jump,kamikaze:kamikaze,
    lower_msg:lower_msg,move_on:move_on,msg_esc:msg_esc,passgo:passgo,playing:playing,q_comm:q_comm,running:running,save_msg:save_msg,
    see_floor:see_floor,stat_msg:stat_msg,terse:terse,to_death:to_death,tombstone:tombstone,pack_used:pack_used,dir_ch:dir_ch,
    file_name:file_name,huh:huh,p_colors:p_colors,prbuf:prbuf,r_stones:r_stones,runch:runch,s_names:s_names,take:take,whoami:whoami,
    ws_made:ws_made,ws_type:ws_type,fruit:fruit,home:home,l_last_comm:l_last_comm,l_last_dir:l_last_dir,last_comm:last_comm,
    last_dir:last_dir,n_objs:n_objs,ntraps:ntraps,hungry_state:hungry_state,inpack:inpack,inv_type:inv_type,level:level,
    max_level:max_level,mpos:mpos,no_food:no_food,count:count,food_left:food_left,lastscore:lastscore,no_command:no_command,
    no_move:no_move,purse:purse,quiet:quiet,vf_hit:vf_hit,dnum:dnum,seed:seed,delta:delta,oldpos:oldpos,stairs:stairs,nh:nh,
    pl_ch:pl_ch,pl_fl:pl_fl,pl_mo:pl_mo,cur_armor:cur_armor,cur_ring:cur_ring,cur_weapon:cur_weapon,l_last_pick:l_last_pick,
    last_pick:last_pick,lvl_obj:lvl_obj,mlist:mlist,player:player,max_stats:max_stats,rooms:rooms,oldrp:oldrp,passages:passages,
    monsters:monsters,things:things,arm_info:arm_info,pot_info:pot_info,ring_info:ring_info,scr_info:scr_info,weap_info:weap_info,
    ws_info:ws_info,d_list:d_list,between:between,group:group,screen:stdscr.cell};
}
function unsnapshot(r){
  after=r.after;again=r.again;noscore=r.noscore;seenstairs=r.seenstairs;amulet=r.amulet;door_stop=r.door_stop;fight_flush=r.fight_flush;
  firstmove=r.firstmove;got_ltc=r.got_ltc;has_hit=r.has_hit;in_shell=r.in_shell;inv_describe=r.inv_describe;jump=r.jump;kamikaze=r.kamikaze;
  lower_msg=r.lower_msg;move_on=r.move_on;msg_esc=r.msg_esc;passgo=r.passgo;playing=r.playing;q_comm=r.q_comm;running=r.running;save_msg=r.save_msg;
  see_floor=r.see_floor;stat_msg=r.stat_msg;terse=r.terse;to_death=r.to_death;tombstone=r.tombstone;pack_used=r.pack_used;dir_ch=r.dir_ch;
  file_name=r.file_name;huh=r.huh;p_colors=r.p_colors;prbuf=r.prbuf;r_stones=r.r_stones;runch=r.runch;s_names=r.s_names;take=r.take;whoami=r.whoami;
  ws_made=r.ws_made;ws_type=r.ws_type;fruit=r.fruit;home=r.home;l_last_comm=r.l_last_comm;l_last_dir=r.l_last_dir;last_comm=r.last_comm;
  last_dir=r.last_dir;n_objs=r.n_objs;ntraps=r.ntraps;hungry_state=r.hungry_state;inpack=r.inpack;inv_type=r.inv_type;level=r.level;
  max_level=r.max_level;mpos=r.mpos;no_food=r.no_food;count=r.count;food_left=r.food_left;lastscore=r.lastscore;no_command=r.no_command;
  no_move=r.no_move;purse=r.purse;quiet=r.quiet;vf_hit=r.vf_hit;dnum=r.dnum;seed=r.seed;delta=r.delta;oldpos=r.oldpos;stairs=r.stairs;nh=r.nh;
  pl_ch=Uint8Array.from(r.pl_ch);pl_fl=Uint8Array.from(r.pl_fl);pl_mo=r.pl_mo;cur_armor=r.cur_armor;cur_ring=r.cur_ring;cur_weapon=r.cur_weapon;
  l_last_pick=r.l_last_pick;last_pick=r.last_pick;lvl_obj=r.lvl_obj;mlist=r.mlist;player=r.player;max_stats=r.max_stats;rooms=r.rooms;
  oldrp=r.oldrp;passages=r.passages;monsters=r.monsters;things=r.things;arm_info=r.arm_info;pot_info=r.pot_info;ring_info=r.ring_info;
  scr_info=r.scr_info;weap_info=r.weap_info;ws_info=r.ws_info;d_list=r.d_list;between=r.between;group=r.group;
  stdscr.cell.set(r.screen);
  hero=player.t_pos;
  pstats=player.t_stats;
}

/* ---------- the glass: 80x24 when it fits, and when it doesn't, the message line and the status
   line stay up and the map pans under them to follow the cursor ---------- */
var glass=null,pan_y=1,pan_x=0,lastwin=null,fresh=false;
function textrow(y){
  var s='',i,o=y*COLS;
  for(i=0;i<COLS;i++)s+=chr(phys[o+i]&A_CHARTEXT);
  return s;
}
function hasattr(y,x,n){
  for(var i=x;i<x+n&&i<COLS;i++)if(phys[y*COLS+i]&A_STANDOUT)return true;
  return false;
}
function wrapped(y,cols,need){ /* the pieces of a long line, at least need of them */
  var s=textrow(y).replace(/ +$/,''),n=Math.max(1,Math.ceil(s.length/cols),need);
  return n;
}
function render(){
  if(!glass)return;
  var rows=glass.rows,cols=glass.cols,lines=[],meta=[],r,c,y,i;
  var cy=curscr.y,cx=curscr.x;
  if(rows>=LINES&&cols>=COLS){
    for(y=0;y<LINES;y++){
      lines.push(textrow(y));
      meta.push({y:y,x:0,n:COLS});
    }
    r=cy;c=cx;
  }
  else{
    var cw=Math.min(cols,COLS),modal=lastwin!==stdscr&&lastwin!==null;
    /* the top line is a message, unless another window is up with a list starting there */
    var ismsg=!modal||/--More-- *$/.test(textrow(0)),first=ismsg?1:0;
    /* how much of the top and bottom lines to show; never so much that the map is lost */
    var topH=ismsg?wrapped(0,cw,cy===0?Math.floor(cx/cw)+1:1):0,botH=wrapped(LINES-1,cw,cy===LINES-1?Math.floor(cx/cw)+1:1);
    var most=Math.ceil(COLS/cw);
    if(!modal&&rows>=LINES-2+2*most){topH=most;botH=most} /* room to spare: no jumping about as messages come and go */
    while(rows-topH-botH<1){
      if(botH>1)botH--;
      else topH--;
    }
    var vis=Math.min(rows-topH-botH,LINES-1-first);
    var inmap=cy>=first&&cy<LINES-1;
    /* a list on the other window starts at its top left, unless the cursor says otherwise */
    if(fresh){pan_y=first;pan_x=0}
    fresh=false;
    if(inmap){
      var my=Math.min(2,Math.floor(vis/4)),mx=Math.min(4,Math.floor(cw/4));
      if(cy<pan_y+my||cy>=pan_y+vis-my)pan_y=cy-Math.floor(vis/2);
      if(cx<pan_x+mx||cx>=pan_x+cw-mx)pan_x=cx-Math.floor(cw/2);
    }
    pan_y=Math.max(first,Math.min(LINES-1-vis,pan_y));
    pan_x=Math.max(0,Math.min(COLS-cw,pan_x));
    r=-1;c=0;
    for(i=0;i<topH;i++){
      lines.push(textrow(0).substr(i*cw,cw));
      meta.push({y:0,x:i*cw,n:cw});
      if(cy===0&&Math.floor(cx/cw)===i){r=lines.length-1;c=cx%cw}
    }
    for(y=pan_y;y<pan_y+vis;y++){
      lines.push(textrow(y).substr(pan_x,cw));
      meta.push({y:y,x:pan_x,n:cw});
      if(cy===y){r=lines.length-1;c=cx-pan_x}
    }
    for(i=0;i<botH;i++){
      lines.push(textrow(LINES-1).substr(i*cw,cw));
      meta.push({y:LINES-1,x:i*cw,n:cw});
      if(cy===LINES-1&&Math.floor(cx/cw)===i){r=lines.length-1;c=cx%cw}
    }
  }
  glass.draw(lines,r,c);
  glass.say(textrow(0).trim());
  DIRTY=false;
  /* the screen's own draw has no standout: reverse the cells that have it, as it draws the cursor */
  if(typeof document==='undefined')return;
  var el=null;
  for(i=0;i<meta.length;i++){
    if(!hasattr(meta[i].y,meta[i].x,meta[i].n))continue;
    el=el||document.getElementById('full');
    var d=el&&el.children[i];
    if(!d)continue;
    d.textContent='';
    var t=lines[i],run='',j=0;
    for(j=0;j<t.length;j++){
      var on_=!!(phys[meta[i].y*COLS+meta[i].x+j]&A_STANDOUT)||(i===r&&j===c);
      if(on_){
        if(run){d.appendChild(document.createTextNode(run));run=''}
        var sp=document.createElement('span');
        sp.className='fcur';
        sp.textContent=t.charAt(j);
        d.appendChild(sp);
      }
      else run+=t.charAt(j);
    }
    if(run)d.appendChild(document.createTextNode(run));
  }
}

/* ---------- the driver: the C blocks in getch, this resumes the generator with the key ---------- */
var gen=null,before=[];
function step(v){
  var res;
  try{res=gen.next(v)}
  catch(e){
    if(e!==EXIT){
      console.error(e);
      out.push('Segmentation fault (core dumped)');
      status_code=139;
    }
    return 'exit';
  }
  if(res.done)return 'exit';
  if(res.value===SHELL)return 'shell';
  return 'key';
}
function key(k){
  var c=keycode(k);
  /* a list wider than a narrow glass: the arrows look along it while the game waits for space */
  if(glass&&(glass.cols<COLS||glass.rows<LINES)&&lastwin!==stdscr&&/^Arrow/.test(k)){
    if(k==='ArrowLeft')pan_x-=8;
    else if(k==='ArrowRight')pan_x+=8;
    else if(k==='ArrowUp')pan_y-=4;
    else pan_y+=4;
    render();
    return 'key';
  }
  if(c<0)return 'key';
  var why=step(c);
  if(why==='key')render();
  return why;
}
var self={
  start:function(){
    premain();
    if(argv.length!==1)before.push('Hello '+whoami+', just a moment while I dig the dungeon...');
    gen=main();
    return step();
  },
  key:key,
  feed:function(c){return step(c)},
  resume:function(){return step()},
  render:render,
  glass:function(g){glass=g},
  before:function(){var b=before;before=[];return b},
  output:function(){var o=out;out=[];return o},
  press:function(){return press},
  code:function(){return status_code},
  scores:function(){
    premain();
    noscore=1;
    return score(0,-1,0);
  }
};
if(T){
  T.proc=self;
  self.inshell=function(){return in_shell};
  self.dump=function(){
    var L=[];
    for(var y=0;y<LINES;y++)L.push(textrow(y).replace(/ +$/,''));
    return {seed:seed,lines:L,cy:curscr.y,cx:curscr.x};
  };
  self.g=function(){
    return {hero:hero,stairs:stairs,level:level,max_level:max_level,purse:purse,player:player,pstats:pstats,lvl_obj:lvl_obj,mlist:mlist,rooms:rooms,
      passages:passages,amulet:amulet,cur_weapon:cur_weapon,cur_armor:cur_armor,cur_ring:cur_ring,chat:chat,flat:flat,moat:moat,seed:seed,
      running:running,count:count,no_command:no_command,food_left:food_left,oldrp:oldrp,d_list:d_list,inpack:inpack,encode:function(){return encode(snapshot())}};
  };
}
return self;
}

function keycode(k){
  if(k.length===1){
    var c=k.charCodeAt(0);
    return c<128?c:-1;
  }
  if(k.length===3&&k.slice(0,2)==='C-')return k.charCodeAt(2)&31;
  switch(k){
    case 'Enter':return 10;
    case 'Escape':return 27;
    case 'Backspace':return ERASECH;
    case 'Tab':return 9;
    case 'ArrowLeft':return 104;
    case 'ArrowDown':return 106;
    case 'ArrowUp':return 107;
    case 'ArrowRight':return 108;
    case 'PageUp':return 117;
    case 'PageDown':return 110;
  }
  return -1;
}

/* One run on the terminal: the glass while it plays, the terminal for its shell escape and its last words. */
var fitting=false,SMALLEST=9;
function fit(S){ /* smaller type for the whole 80x24 where it stays readable; where it would not, the map pans */
  var el=document.getElementById('full');
  if(!el)return;
  fitting=true;
  el.style.fontSize='';
  window.dispatchEvent(new Event('resize'));
  var b=parseFloat(getComputedStyle(el).fontSize),f=Math.min(b*S.cols/80,b*S.rows/24)*.995;
  if(f<b&&f>=SMALLEST){el.style.fontSize=f+'px';window.dispatchEvent(new Event('resize'))}
  fitting=false;
}
function session(argv){
  var proc=Process(null,argv,P.rogueTest),why=proc.start(),result;
  P.say(proc.before());
  next(why);
  function next(w){
    if(w==='exit'){finish();return}
    if(w==='shell'){sh();return}
    P.queue(function(){
      return new Promise(function(res){
        var S=P.fullscreen(function(k){
          var a=proc.key(k);
          if(a!=='key'){
            S.close();
            proc.glass(null);
            result=a;
            res();
          }
        },function(){if(!fitting)fit(S);proc.render()});
        proc.glass(S);
        fit(S);
        proc.render();
      });
    },true);
    P.queue(function(){next(result)},true);
  }
  function sh(){
    var line;
    P.queue(function(){return P.readLine('% ',true).then(function(l){line=l})},true);
    P.queue(function(){
      if(line===null||/^\s*(exit|logout)\s*$/.test(line)){
        P.say(['']);
        P.queue(function(){return P.readLine('[Press return to continue]',true)},true);
        P.queue(function(){next(proc.resume())},true);
        return;
      }
      if(line!==P.INT&&line.trim())P.runScript([line]);
      sh();
    },true);
  }
  function finish(){
    var o=proc.output();
    if(o.length)P.say(o);
    P.status(proc.code());
    if(proc.press())P.queue(function(){return P.readLine('[Press return to continue]',true)},true);
  }
}
P.command({names:['rogue'],
  run:function(a,raw,w){
    var argv=(w||['rogue']).slice(1);
    if(argv.length===1&&argv[0]==='-s'){
      P.say(Process(null,argv,P.rogueTest).scores());
      return;
    }
    if(P.piped()){P.typeLine('rogue: needs a terminal','err');return}
    P.queue(function(){session(argv)});
  }});
if(P.rogueTest)P.rogueTest.Process=Process;
})(window.Phosphor);
