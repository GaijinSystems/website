/* PHOSPHOR-9 terminal: machine "bsd-1987", hunt. Ported to JavaScript for this terminal from 4.3BSD's
   games/hunt: the driver (driver.c, answer.c, draw.c, execute.c, expl.c, makemaze.c, shots.c, terminal.c,
   built as the Makefile has it, with RANDOM, REFLECT, MONITOR, OOZE, FLY and VOLCANO) and the player's
   side (hunt.c, playit.c, connect.c). Each of those files keeps this notice:

 *  Hunt
 *  Copyright (c) 1985 Conrad C. Huang, Gregory S. Couch, Kenneth C.R.C. Arnold
 *  San Francisco, California
 *
 *  Copyright (c) 1985 Regents of the University of California.
 *  All rights reserved.  The Berkeley software License Agreement
 *  specifies the terms and conditions for redistribution.

   and its README says:

   Hunt is not officially supported by anyone anywhere; however, bug
   reports will be read and bug fixes/enhancements may be sent out at
   irregular intervals. Enjoy.

   Differences from the original:
   - THE ROBOTS ARE NOT PART OF HUNT. Hunt was for several people on a network and had no computer players.
     There is no network here, so the driver runs inside the page and three robots enter it in place of other
     people. The robots (makeBot, below) are new code written for this terminal, not a port of anything. They
     play through the driver's own door: each sends one key at a time and sees only the map it would have on
     its screen, the driver's p_maze, plus its own status. They come back two seconds after dying, as a person
     answering y to "Re-enter game?" did. They use Math.random, not the driver's generator.
   - The driver only moves when a key arrives, so in the original nothing happened until someone typed. The
     robots type about four times a second, so here the game goes on while you think.
   - The driver goes away when you leave, with the robots in it, even though they are still playing.
   - hunt -m, which said "No one playing." if no game was running, starts one among the robots for you to watch.
   - -h takes this machine's name and localhost; any other is "Unknown host". -q finds no game, as it would.
   - The client's limit of five keys in flight has nothing to limit, because each key is dealt with as it arrives.
   - ^Z and ^\ do nothing. A glass too small for 80x24 even in smaller type shows the part round the cursor.
*/
(function(P){
'use strict';
var MAXPL=9,MAXMON=1,NAMELEN=20,WIDTH=59,WIDTH2=64,HEIGHT=23,UBOUND=1,DBOUND=22,LBOUND=1,RBOUND=WIDTH-1,
  STAT_LABEL_COL=60,STAT_VALUE_COL=74,STAT_NAME_COL=61,STAT_SCAN_COL=66,STAT_NAME_ROW=0,STAT_AMMO_ROW=2,STAT_SCAN_ROW=3,
  STAT_CLOAK_ROW=4,STAT_GUN_ROW=5,STAT_DAM_ROW=7,STAT_KILL_ROW=8,STAT_PLAY_ROW=10,STAT_MON_ROW=STAT_PLAY_ROW+MAXPL+1,STAT_NAME_LEN=16,
  DOOR=35,WALL1=45,WALL2=124,WALL3=43,WALL4=47,WALL5=92,KNIFE=75,SHOT=58,GRENADE=111,SATCHEL=79,BOMB=64,MINE=59,GMINE=103,
  SLIME=36,LAVA=126,FALL=70,SPACE=32,ABOVE=105,BELOW=33,RIGHT=125,LEFTS=123,FLYER=38,
  NORTH=1,SOUTH=2,EAST=8,WEST=16,
  BULSPD=5,ISHOTS=15,NSHOTS=5,MAXNCSHOT=2,MAXDAM=10,MINDAM=5,STABDAM=2,BULREQ=1,GRENREQ=9,SATREQ=25,BOMBREQ=49,SLIMEREQ=15,SSLIMEREQ=30,
  SLIMESPEED=5,LAVASPEED=2,CLOAKLEN=20,EXPLEN=4,MAXREMOVE=40,MAXPERMACH=3,TERM_WIDTH=80,
  /* what the driver sends to a client: a byte with the top bit set */
  ADDCH=0x80|97,MOVE=0x80|109,REFRESH=0x80|114,CLRTOEOL=0x80|99,ENDWIN=0x80|101,CLEAR=0x80|67,REDRAW=0x80|82,LAST_PLAYER=0x80|108,BELL=0x80|98,
  DIRS=[[0,1,2,3],[3,0,1,2],[0,2,3,1],[0,3,2,1],[1,0,2,3],[2,3,0,1],[0,2,1,3],[2,3,1,0],[1,0,3,2],[1,2,0,3],[3,1,2,0],[2,0,3,1],
        [1,3,0,2],[0,3,1,2],[1,3,2,0],[2,0,1,3],[0,1,3,2],[3,1,0,2],[2,1,0,3],[1,2,3,0],[2,1,3,0],[3,0,2,1],[3,2,0,1],[3,2,1,0]],
  INCR=[[0,1],[1,0],[0,-1],[-1,0]],
  TICK=250,RESPAWN=8,ROBOTS=3;
function Abort(msg){this.msg=msg}
function Over(){}
function pad(s,w){return String(s).padStart(w,' ')}
function left(s,w){return s.slice(0,w).padEnd(w,' ')} /* %-w.ws */
function f52(x){return pad(x.toFixed(2),5)}
function cc(s){return s.charCodeAt(0)}

/* ---------- the driver: one per game, and everything in it comes from the C ---------- */
function makeDriver(seed){
  var Seed=seed|0,Maze=new Uint8Array(HEIGHT*WIDTH2),Orig_maze=new Uint8Array(HEIGHT*WIDTH2),See_over=new Uint8Array(128),
    Nplayer=0,Bullets=null,Expl=[null,null,null,null],Scores=null,volcano=0,Player=[],Monitor=[],End_player=0,End_monitor=0,
    removed=[],rem_index=0,i,over=false;
  function slot(){
    return {p_ident:null,p_face:0,p_over:0,p_undershot:0,p_flying:0,p_flyx:0,p_flyy:0,conn:null,p_damage:0,p_damcap:0,p_ammo:0,p_ncshot:0,p_scan:0,p_cloak:0,
      p_x:0,p_y:0,p_nexec:0,p_death:'',p_maze:new Uint8Array(HEIGHT*WIDTH2),p_curx:0,p_cury:0};
  }
  for(i=0;i<MAXPL;i++)Player.push(slot());
  for(i=0;i<MAXMON;i++)Monitor.push(slot());
  for(i=0;i<MAXREMOVE;i++)removed.push({r_x:0,r_y:0});

  function bcopyPlayer(to,from){
    for(var k in from)if(k!=='p_maze')to[k]=from[k];
    to.p_maze.set(from.p_maze);
    if(to.conn)to.conn.pp=to;
  }
  function rand_num(range){
    if(range===0)return 0;
    Seed=(Math.imul(Seed,11109)+13849)|0;
    return ((Seed>>16)&0xffff)%range;
  }
  function stat_char(pp){
    if(pp.p_flying>=0)return FLYER;
    if(pp.p_scan>=0)return cc('*');
    return pp.p_cloak<0?SPACE:cc('+');
  }
  function maze(y,x){return Maze[y*WIDTH2+x]}

  /* ---- terminal.c */
  function put(pp,b){var c=pp.conn;if(c&&!c.closed)c.put(b)}
  function sendcom(pp,command,a,b){
    put(pp,command);
    if(command===MOVE){put(pp,a);put(pp,b)}
    else if(command===ADDCH)put(pp,a);
  }
  function cgoto(pp,y,x){
    if(x===pp.p_curx&&y===pp.p_cury)return;
    sendcom(pp,MOVE,y,x);
    pp.p_cury=y;
    pp.p_curx=x;
  }
  function outch(pp,ch){
    if(++pp.p_curx>=TERM_WIDTH){
      pp.p_curx=0;
      pp.p_cury++;
    }
    put(pp,ch);
  }
  function outstr(pp,s,len){ /* s is padded by the caller to len */
    pp.p_curx+=len;
    pp.p_cury+=Math.trunc(pp.p_curx/TERM_WIDTH);
    pp.p_curx%=TERM_WIDTH;
    for(var i=0;i<len;i++)put(pp,s.charCodeAt(i));
  }
  function clrscr(pp){
    sendcom(pp,CLEAR);
    pp.p_cury=0;
    pp.p_curx=0;
  }
  function ce(pp){sendcom(pp,CLRTOEOL)}
  function closeconn(pp){if(pp.conn)pp.conn.closed=true}

  /* ---- draw.c */
  function drawrow(pp,y){
    var s='',x;
    for(x=0;x<WIDTH;x++)s+=String.fromCharCode(pp.p_maze[y*WIDTH2+x]);
    outstr(pp,s,WIDTH);
  }
  function drawmaze(pp){
    var x,y,c;
    clrscr(pp);
    drawrow(pp,0);
    for(y=1;y<HEIGHT-1;y++)
      for(x=0;x<WIDTH;x++){
        c=pp.p_maze[y*WIDTH2+x];
        if(c!==SPACE){
          cgoto(pp,y,x);
          if(pp.p_x===x&&pp.p_y===y)outch(pp,translate(c));
          else outch(pp,c);
        }
      }
    cgoto(pp,HEIGHT-1,0);
    drawrow(pp,HEIGHT-1);
    drawstatus(pp);
  }
  function drawstatus(pp){
    var i,n,np;
    cgoto(pp,STAT_NAME_ROW,STAT_LABEL_COL);
    outstr(pp,left(pp.p_ident.i_name,13),13);
    cgoto(pp,STAT_AMMO_ROW,STAT_LABEL_COL);
    outstr(pp,'Ammo:',5);
    cgoto(pp,STAT_AMMO_ROW,STAT_VALUE_COL);
    outstr(pp,pad(pp.p_ammo,3),3);
    cgoto(pp,STAT_CLOAK_ROW,STAT_LABEL_COL);
    outstr(pp,'Cloak:',6);
    cgoto(pp,STAT_CLOAK_ROW,STAT_VALUE_COL);
    outstr(pp,pp.p_cloak<0?'   ':' on',3);
    cgoto(pp,STAT_SCAN_ROW,STAT_LABEL_COL);
    outstr(pp,'Scan:',5);
    cgoto(pp,STAT_SCAN_ROW,STAT_VALUE_COL);
    outstr(pp,pp.p_scan<0?'   ':' on',3);
    cgoto(pp,STAT_GUN_ROW,STAT_LABEL_COL);
    outstr(pp,'Gun:',4);
    cgoto(pp,STAT_GUN_ROW,STAT_VALUE_COL);
    outstr(pp,pp.p_ncshot<MAXNCSHOT?' ok':'   ',3);
    cgoto(pp,STAT_DAM_ROW,STAT_LABEL_COL);
    outstr(pp,'Damage:',7);
    cgoto(pp,STAT_DAM_ROW,STAT_VALUE_COL);
    outstr(pp,pad(pp.p_damage,2)+'/'+pad(pp.p_damcap,2),5);
    cgoto(pp,STAT_KILL_ROW,STAT_LABEL_COL);
    outstr(pp,'Kills:',6);
    cgoto(pp,STAT_KILL_ROW,STAT_VALUE_COL);
    outstr(pp,pad(Math.trunc((pp.p_damcap-MAXDAM)/2),3),3);
    cgoto(pp,STAT_PLAY_ROW,STAT_LABEL_COL);
    outstr(pp,'Player:',7);
    for(i=STAT_PLAY_ROW+1,n=0;n<End_player;n++){
      np=Player[n];
      cgoto(pp,i++,STAT_NAME_COL);
      outstr(pp,statline(np),STAT_NAME_LEN);
    }
    cgoto(pp,STAT_MON_ROW,STAT_LABEL_COL);
    outstr(pp,'Monitor:',8);
    for(i=STAT_MON_ROW+1,n=0;n<End_monitor;n++){
      cgoto(pp,i++,STAT_NAME_COL);
      outstr(pp,'      '+left(Monitor[n].p_ident.i_name,10),STAT_NAME_LEN);
    }
  }
  function statline(np){return f52(np.p_ident.i_score)+String.fromCharCode(stat_char(np))+left(np.p_ident.i_name,10)}
  function look(pp){
    var x=pp.p_x,y=pp.p_y;
    check(pp,y-1,x-1);check(pp,y-1,x);check(pp,y-1,x+1);
    check(pp,y,x-1);check(pp,y,x);check(pp,y,x+1);
    check(pp,y+1,x-1);check(pp,y+1,x);check(pp,y+1,x+1);
    switch(pp.p_face){
    case LEFTS:see(pp,LEFTS);see(pp,ABOVE);see(pp,BELOW);break;
    case RIGHT:see(pp,RIGHT);see(pp,ABOVE);see(pp,BELOW);break;
    case ABOVE:see(pp,ABOVE);see(pp,LEFTS);see(pp,RIGHT);break;
    case BELOW:see(pp,BELOW);see(pp,LEFTS);see(pp,RIGHT);break;
    case FLYER:break;
    }
    cgoto(pp,y,x);
  }
  function see(pp,face){
    var x=pp.p_x,y=pp.p_y,sp,i,cnt;
    switch(face){
    case LEFTS:
      sp=y*WIDTH2+x;
      for(i=0;See_over[Maze[--sp]];i++)continue;
      if(i===0)break;
      cnt=i;
      x=pp.p_x-1;--y;
      while(i--)check(pp,y,--x);
      i=cnt;x=pp.p_x-1;++y;
      while(i--)check(pp,y,--x);
      i=cnt;x=pp.p_x-1;++y;
      while(i--)check(pp,y,--x);
      break;
    case RIGHT:
      sp=y*WIDTH2+(++x);
      for(i=0;See_over[Maze[sp++]];i++)continue;
      if(i===0)break;
      cnt=i;
      x=pp.p_x+1;--y;
      while(i--)check(pp,y,++x);
      i=cnt;x=pp.p_x+1;++y;
      while(i--)check(pp,y,++x);
      i=cnt;x=pp.p_x+1;++y;
      while(i--)check(pp,y,++x);
      break;
    case ABOVE:
      sp=(--y)*WIDTH2+x;
      if(!See_over[Maze[sp]])break;
      do{
        --y;
        sp-=WIDTH2;
        check(pp,y,x-1);check(pp,y,x);check(pp,y,x+1);
      }while(See_over[Maze[sp]]);
      break;
    case BELOW:
      sp=(++y)*WIDTH2+x;
      if(!See_over[Maze[sp]])break;
      do{
        y++;
        sp+=WIDTH2;
        check(pp,y,x-1);check(pp,y,x);check(pp,y,x+1);
      }while(See_over[Maze[sp]]);
      break;
    }
  }
  function check(pp,y,x){
    var index=y*WIDTH2+x,ch=Maze[index];
    if(ch!==pp.p_maze[index]){
      cgoto(pp,y,x);
      if(x===pp.p_x&&y===pp.p_y)outch(pp,translate(ch));
      else outch(pp,ch);
      pp.p_maze[index]=ch;
    }
  }
  function showstat(pp){
    var n,y=STAT_PLAY_ROW+1+Player.indexOf(pp),c=stat_char(pp);
    for(n=0;n<End_monitor;n++){cgoto(Monitor[n],y,STAT_SCAN_COL);outch(Monitor[n],c)}
    for(n=0;n<End_player;n++){cgoto(Player[n],y,STAT_SCAN_COL);outch(Player[n],c)}
  }
  function drawplayer(pp,draw){
    var n,newp,x=pp.p_x,y=pp.p_y;
    Maze[y*WIDTH2+x]=draw?pp.p_face:pp.p_over;
    for(n=0;n<End_monitor;n++)check(Monitor[n],y,x);
    for(n=0;n<End_player;n++){
      newp=Player[n];
      if(!draw||newp===pp){
        check(newp,y,x);
        continue;
      }
      if(newp.p_scan===0){
        cgoto(newp,STAT_SCAN_ROW,STAT_VALUE_COL);
        outstr(newp,'   ',3);
        newp.p_scan--;
        showstat(newp);
      }else if(newp.p_scan>0){
        if(pp.p_cloak<0)check(newp,y,x);
        newp.p_scan--;
      }
    }
    if(!draw||pp.p_cloak<0)return;
    if(pp.p_cloak--===0){
      cgoto(pp,STAT_CLOAK_ROW,STAT_VALUE_COL);
      outstr(pp,'   ',3);
      showstat(pp);
    }
  }
  function message(pp,s){
    cgoto(pp,HEIGHT,0);
    outstr(pp,s,s.length);
    ce(pp);
  }
  function translate(ch){
    switch(ch){
    case LEFTS:return 60;
    case RIGHT:return 62;
    case ABOVE:return 94;
    case BELOW:return 118;
    }
    return ch;
  }

  /* ---- makemaze.c */
  function isclear(y,x){return maze(y,x)===SPACE?1:0}
  function candig(y,x){
    var i;
    if((x&1)&&(y&1))return false;
    if(y<UBOUND||y>=DBOUND)return false;
    if(x<LBOUND||x>=RBOUND)return false;
    if(isclear(y,x))return false;
    i=isclear(y,x+1);
    i+=isclear(y,x-1);
    if(i>1)return false;
    i+=isclear(y+1,x);
    if(i>1)return false;
    i+=isclear(y-1,x);
    if(i>1)return false;
    return true;
  }
  function dig(y,x){
    var dp,k,ny,nx;
    Maze[y*WIDTH2+x]=SPACE;
    dp=DIRS[rand_num(24)];
    for(k=0;k<4;k++){
      ny=y+INCR[dp[k]][0];
      nx=x+INCR[dp[k]][1];
      if(candig(ny,nx))dig(ny,nx);
    }
  }
  function remap(){
    var y,x,stat;
    for(y=0;y<HEIGHT;y++)
      for(x=0;x<WIDTH;x++){
        if(maze(y,x)===SPACE)continue;
        stat=0;
        if(y-1>=0&&maze(y-1,x)!==SPACE)stat|=NORTH;
        if(y+1<HEIGHT&&maze(y+1,x)!==SPACE)stat|=SOUTH;
        if(x+1<WIDTH&&maze(y,x+1)!==SPACE)stat|=EAST;
        if(x-1>=0&&maze(y,x-1)!==SPACE)stat|=WEST;
        switch(stat){
        case WEST|EAST:Maze[y*WIDTH2+x]=WALL1;break;
        case NORTH|SOUTH:Maze[y*WIDTH2+x]=WALL2;break;
        case 0:Maze[y*WIDTH2+x]=rand_num(2)?WALL4:WALL5;break;
        default:Maze[y*WIDTH2+x]=WALL3;break;
        }
      }
    Orig_maze.set(Maze);
  }
  function makemaze(){
    Maze.fill(DOOR,0,(HEIGHT-1)*WIDTH2+WIDTH);
    var y=rand_num(DBOUND-UBOUND)+UBOUND,x=rand_num(RBOUND-LBOUND)+LBOUND;
    dig(y,x);
    remap();
  }

  /* ---- answer.c, from where the connection has been made */
  function get_ident(machine,uid,name){
    var ip;
    for(ip=Scores;ip!==null;ip=ip.i_next)
      if(ip.i_machine===machine&&ip.i_uid===uid&&ip.i_name===name)break;
    if(ip!==null){
      ip.i_entries++;
      ip.i_score=Math.fround(ip.i_kills/ip.i_entries);
    }else{
      ip={i_machine:machine,i_uid:uid,i_name:name.slice(0,NAMELEN),i_kills:0,i_entries:1,i_score:0,i_next:Scores};
      Scores=ip;
    }
    return ip;
  }
  function reached_limit(machine){
    var n,count=0;
    for(n=0;n<End_player;n++)if(Player[n].p_ident.i_machine===machine)count++;
    for(n=0;n<End_monitor;n++)if(Monitor[n].p_ident.i_machine===machine)count++;
    return count>=MAXPERMACH;
  }
  function rand_face(pp){
    switch(rand_num(4)){
    case 0:pp.p_face=LEFTS;break;
    case 1:pp.p_face=RIGHT;break;
    case 2:pp.p_face=BELOW;break;
    case 3:pp.p_face=ABOVE;break;
    }
  }
  function stmonitor(pp){
    var n,line,s;
    pp.p_maze.set(Maze);
    drawmaze(pp);
    s='     '+String.fromCharCode(stat_char(pp))+left(pp.p_ident.i_name,10);
    line=STAT_MON_ROW+1+Monitor.indexOf(pp);
    for(n=0;n<End_player;n++){cgoto(Player[n],line,STAT_NAME_COL);outstr(Player[n],s,STAT_NAME_LEN)}
    for(n=0;n<End_monitor;n++){cgoto(Monitor[n],line,STAT_NAME_COL);outstr(Monitor[n],s,STAT_NAME_LEN)}
    sendcom(pp,REFRESH);
  }
  function place(){
    var x,y;
    do{
      x=rand_num(WIDTH-1)+1;
      y=rand_num(HEIGHT-1)+1;
    }while(maze(y,x)!==SPACE);
    return y*WIDTH2+x;
  }
  function stplayer(newpp){
    var x,y,n,pp,p,s;
    Nplayer++;
    for(y=0;y<UBOUND;y++)for(x=0;x<WIDTH;x++)newpp.p_maze[y*WIDTH2+x]=maze(y,x);
    for(;y<DBOUND;y++){
      for(x=0;x<LBOUND;x++)newpp.p_maze[y*WIDTH2+x]=maze(y,x);
      for(;x<RBOUND;x++)newpp.p_maze[y*WIDTH2+x]=SPACE;
      for(;x<WIDTH;x++)newpp.p_maze[y*WIDTH2+x]=maze(y,x);
    }
    for(;y<HEIGHT;y++)for(x=0;x<WIDTH;x++)newpp.p_maze[y*WIDTH2+x]=maze(y,x);
    p=place();
    newpp.p_over=SPACE;
    newpp.p_x=p%WIDTH2;
    newpp.p_y=Math.trunc(p/WIDTH2);
    newpp.p_undershot=0;
    newpp.p_flying=-1;
    rand_face(newpp);
    newpp.p_damage=0;
    newpp.p_damcap=MAXDAM;
    newpp.p_nexec=0;
    newpp.p_ammo=ISHOTS;
    newpp.p_scan=-1;
    newpp.p_cloak=CLOAKLEN;
    newpp.p_ncshot=0;
    p=place();
    Maze[p]=GMINE;
    for(n=0;n<End_monitor;n++)check(Monitor[n],Math.trunc(p/WIDTH2),p%WIDTH2);
    p=place();
    Maze[p]=MINE;
    for(n=0;n<End_monitor;n++)check(Monitor[n],Math.trunc(p/WIDTH2),p%WIDTH2);
    s=statline(newpp);
    y=STAT_PLAY_ROW+1+Player.indexOf(newpp);
    for(n=0;n<End_player;n++){
      pp=Player[n];
      if(pp!==newpp){
        pp.p_ammo+=NSHOTS;
        newpp.p_ammo+=NSHOTS;
        cgoto(pp,y,STAT_NAME_COL);
        outstr(pp,s,STAT_NAME_LEN);
        cgoto(pp,STAT_AMMO_ROW,STAT_VALUE_COL);
        outstr(pp,pad(pp.p_ammo,3),3);
      }
    }
    for(n=0;n<End_monitor;n++){cgoto(Monitor[n],y,STAT_NAME_COL);outstr(Monitor[n],s,STAT_NAME_LEN)}
    drawmaze(newpp);
    drawplayer(newpp,true);
    look(newpp);
    sendcom(newpp,REFRESH);
  }
  /* answer(): false if the machine has its three, or the game is full */
  function answer(conn,machine,uid,name,monitor){
    var pp;
    if(reached_limit(machine))return false;
    if(monitor){
      if(End_monitor>=MAXMON)return false;
      pp=Monitor[End_monitor++];
    }else{
      if(End_player>=MAXPL)return false;
      pp=Player[End_player++];
    }
    pp.p_ident=get_ident(machine,uid,name);
    pp.conn=conn;
    conn.pp=pp;
    conn.closed=false;
    pp.p_death='';
    pp.p_y=0;
    pp.p_x=0;
    if(monitor)stmonitor(pp);else stplayer(pp);
    return true;
  }

  /* ---- execute.c */
  function mon_execute(pp){
    var ch=pp.conn.q.shift();
    if(ch===12)sendcom(pp,REDRAW);
    else if(ch===113)pp.p_death='| Quit |';
  }
  function execute(pp){
    var ch=pp.conn.q.shift();
    if(pp.p_flying>=0){
      if(ch===12)sendcom(pp,REDRAW);
      else if(ch===113)pp.p_death='| Quit |';
      return;
    }
    switch(ch){
    case 12:sendcom(pp,REDRAW);break;
    case 104:move(pp,LEFTS);break;
    case 72:face(pp,LEFTS);break;
    case 106:move(pp,BELOW);break;
    case 74:face(pp,BELOW);break;
    case 107:move(pp,ABOVE);break;
    case 75:face(pp,ABOVE);break;
    case 108:move(pp,RIGHT);break;
    case 76:face(pp,RIGHT);break;
    case 102:fire(pp,SHOT);break;
    case 103:fire(pp,GRENADE);break;
    case 70:fire(pp,SATCHEL);break;
    case 71:fire(pp,BOMB);break;
    case 111:fire_slime(pp,SLIMEREQ);break;
    case 79:fire_slime(pp,SSLIMEREQ);break;
    case 115:scan(pp);break;
    case 99:cloak(pp);break;
    case 113:pp.p_death='| Quit |';break;
    }
  }
  function move(pp,dir){
    var y=pp.p_y,x=pp.p_x,moved=false,bp,c;
    switch(dir){
    case LEFTS:x--;break;
    case RIGHT:x++;break;
    case ABOVE:y--;break;
    case BELOW:y++;break;
    }
    c=maze(y,x);
    switch(c){
    case SPACE:case DOOR:
      moved=true;
      break;
    case WALL1:case WALL2:case WALL3:case WALL4:case WALL5:
      break;
    case MINE:case GMINE:
      if(dir===pp.p_face)pickup(pp,y,x,5,c);
      else if(opposite(dir,pp.p_face))pickup(pp,y,x,95,c);
      else pickup(pp,y,x,50,c);
      Maze[y*WIDTH2+x]=SPACE;
      moved=true;
      break;
    case SHOT:case GRENADE:case SATCHEL:case BOMB:
      bp=is_bullet(y,x);
      if(bp!==null)bp.b_expl=true;
      Maze[y*WIDTH2+x]=SPACE;
      moved=true;
      break;
    case LEFTS:case RIGHT:case ABOVE:case BELOW:case FLYER:
      if(dir!==pp.p_face)sendcom(pp,BELL);
      else checkdam(play_at(y,x),pp,pp.p_ident,STABDAM,KNIFE);
      break;
    }
    if(moved){
      if(pp.p_ncshot>0)
        if(--pp.p_ncshot===MAXNCSHOT){
          cgoto(pp,STAT_GUN_ROW,STAT_VALUE_COL);
          outstr(pp,' ok',3);
        }
      if(pp.p_undershot){
        fixshots(pp.p_y,pp.p_x,pp.p_over);
        pp.p_undershot=0;
      }
      drawplayer(pp,false);
      pp.p_over=maze(y,x);
      pp.p_y=y;
      pp.p_x=x;
      drawplayer(pp,true);
    }
  }
  function face(pp,dir){
    if(pp.p_face!==dir){
      pp.p_face=dir;
      drawplayer(pp,true);
    }
  }
  var REQ=[BULREQ,GRENREQ,SATREQ,BOMBREQ],SHOT_TYPE=[SHOT,GRENADE,SATCHEL,BOMB];
  function refreshAll(){
    var n;
    for(n=0;n<End_player;n++)sendcom(Player[n],REFRESH);
    for(n=0;n<End_monitor;n++)sendcom(Monitor[n],REFRESH);
  }
  function fire(pp,type){
    var req_index;
    if(pp.p_ammo===0){
      message(pp,'No more charges.');
      return;
    }
    if(pp.p_ncshot>MAXNCSHOT)return;
    if(pp.p_ncshot++===MAXNCSHOT){
      cgoto(pp,STAT_GUN_ROW,STAT_VALUE_COL);
      outstr(pp,'   ',3);
    }
    req_index=type===SHOT?0:type===GRENADE?1:type===SATCHEL?2:3;
    while(pp.p_ammo<REQ[req_index])req_index--;
    pp.p_ammo-=REQ[req_index];
    cgoto(pp,STAT_AMMO_ROW,STAT_VALUE_COL);
    outstr(pp,pad(pp.p_ammo,3),3);
    add_shot(SHOT_TYPE[req_index],pp.p_y,pp.p_x,pp.p_face,REQ[req_index],pp,false,pp.p_face);
    pp.p_undershot=1;
    showexpl(pp.p_y,pp.p_x,SHOT_TYPE[req_index]);
    refreshAll();
  }
  function fire_slime(pp,req){
    if(pp.p_ammo<req){
      message(pp,'Not enough charges.');
      return;
    }
    if(pp.p_ncshot>MAXNCSHOT)return;
    if(pp.p_ncshot++===MAXNCSHOT){
      cgoto(pp,STAT_GUN_ROW,STAT_VALUE_COL);
      outstr(pp,'   ',3);
    }
    pp.p_ammo-=req;
    cgoto(pp,STAT_AMMO_ROW,STAT_VALUE_COL);
    outstr(pp,pad(pp.p_ammo,3),3);
    add_shot(SLIME,pp.p_y,pp.p_x,pp.p_face,req,pp,false,pp.p_face);
    showexpl(pp.p_y,pp.p_x,SLIME);
    refreshAll();
  }
  function add_shot(type,y,x,face,charge,owner,expl,over){
    var bp=create_shot(type,y,x,face,charge,owner,owner===null?null:owner.p_ident,expl,over);
    bp.b_next=Bullets;
    Bullets=bp;
  }
  function create_shot(type,y,x,face,charge,owner,score,expl,over){
    return {b_face:face,b_x:x,b_y:y,b_charge:charge,b_owner:owner,b_score:score,b_type:type,b_expl:expl,b_over:over,b_next:null};
  }
  function cloak(pp){
    if(pp.p_ammo<=0){
      message(pp,'No more charges');
      return;
    }
    --pp.p_ammo;
    cgoto(pp,STAT_AMMO_ROW,STAT_VALUE_COL);
    outstr(pp,pad(pp.p_ammo,3),3);
    pp.p_cloak+=CLOAKLEN;
    cgoto(pp,STAT_CLOAK_ROW,STAT_VALUE_COL);
    outstr(pp,' on',3);
    if(pp.p_scan>=0){
      pp.p_scan=-1;
      cgoto(pp,STAT_SCAN_ROW,STAT_VALUE_COL);
      outstr(pp,'   ',3);
    }
    showstat(pp);
  }
  function scan(pp){
    if(pp.p_ammo<=0){
      message(pp,'No more charges');
      return;
    }
    --pp.p_ammo;
    cgoto(pp,STAT_AMMO_ROW,STAT_VALUE_COL);
    outstr(pp,pad(pp.p_ammo,3),3);
    pp.p_scan+=Nplayer*20;
    cgoto(pp,STAT_SCAN_ROW,STAT_VALUE_COL);
    outstr(pp,' on',3);
    if(pp.p_cloak>=0){
      pp.p_cloak=-1;
      cgoto(pp,STAT_CLOAK_ROW,STAT_VALUE_COL);
      outstr(pp,'   ',3);
    }
    showstat(pp);
  }
  function pickup(pp,y,x,prob,obj){
    var req=obj===MINE?BULREQ:GRENREQ;
    if(rand_num(100)<prob)add_shot(obj,y,x,LEFTS,req,null,true,pp.p_face);
    else{
      pp.p_ammo+=req;
      cgoto(pp,STAT_AMMO_ROW,STAT_VALUE_COL);
      outstr(pp,pad(pp.p_ammo,3),3);
    }
  }

  /* ---- shots.c */
  function plus_delta(v,max){return v<max?v+1:v-1}
  function minus_delta(v,min){return v>min?v-1:v+1}
  function moveshots(){
    var bp,next,pp,x,y,blist,i,n,c;
    rollexpl();
    if(Bullets!==null){
      blist=Bullets;
      Bullets=null;
      for(bp=blist;bp!==null;bp=next){
        var gone=false;
        next=bp.b_next;
        x=bp.b_x;
        y=bp.b_y;
        Maze[y*WIDTH2+x]=bp.b_over;
        for(n=0;n<End_player;n++)check(Player[n],y,x);
        for(n=0;n<End_monitor;n++)check(Monitor[n],y,x);
        for(i=0;i<BULSPD;i++){
          if(bp.b_expl)break;
          x=bp.b_x;
          y=bp.b_y;
          switch(bp.b_face){
          case LEFTS:x--;break;
          case RIGHT:x++;break;
          case ABOVE:y--;break;
          case BELOW:y++;break;
          }
          c=maze(y,x);
          switch(c){
          case SHOT:
            if(rand_num(100)<5){
              zapshot(Bullets,bp);
              zapshot(next,bp);
            }
            break;
          case GRENADE:
            if(rand_num(100)<10){
              zapshot(Bullets,bp);
              zapshot(next,bp);
            }
            break;
          case WALL4:
            switch(bp.b_face){
            case LEFTS:bp.b_face=BELOW;break;
            case RIGHT:bp.b_face=ABOVE;break;
            case ABOVE:bp.b_face=RIGHT;break;
            case BELOW:bp.b_face=LEFTS;break;
            }
            Maze[y*WIDTH2+x]=WALL5;
            for(n=0;n<End_monitor;n++)check(Monitor[n],y,x);
            break;
          case WALL5:
            switch(bp.b_face){
            case LEFTS:bp.b_face=ABOVE;break;
            case RIGHT:bp.b_face=BELOW;break;
            case ABOVE:bp.b_face=LEFTS;break;
            case BELOW:bp.b_face=RIGHT;break;
            }
            Maze[y*WIDTH2+x]=WALL4;
            for(n=0;n<End_monitor;n++)check(Monitor[n],y,x);
            break;
          case DOOR:
            switch(rand_num(4)){
            case 0:bp.b_face=ABOVE;break;
            case 1:bp.b_face=BELOW;break;
            case 2:bp.b_face=LEFTS;break;
            case 3:bp.b_face=RIGHT;break;
            }
            break;
          case LEFTS:case RIGHT:case BELOW:case ABOVE:case FLYER:
            if(rand_num(100)<10&&opposite(bp.b_face,c)){
              if(bp.b_owner!==null)message(bp.b_owner,'Your charge was absorbed!');
              pp=play_at(y,x);
              pp.p_ammo+=bp.b_charge;
              message(pp,'Absorbed charge (good shield!)');
              cgoto(pp,STAT_AMMO_ROW,STAT_VALUE_COL);
              outstr(pp,pad(pp.p_ammo,3),3);
              gone=true;
              break;
            }
            bp.b_expl=true;
            break;
          case WALL1:case WALL2:case WALL3:
            bp.b_expl=true;
            break;
          }
          if(gone)break;
          bp.b_x=x;
          bp.b_y=y;
        }
        if(gone)continue;
        bp.b_next=Bullets;
        Bullets=bp;
      }
      blist=Bullets;
      Bullets=null;
      for(bp=blist;bp!==null;bp=next){
        next=bp.b_next;
        if(!bp.b_expl){
          save_bullet(bp);
          for(n=0;n<End_monitor;n++)check(Monitor[n],bp.b_y,bp.b_x);
          continue;
        }
        chkshot(bp);
      }
      for(n=0;n<End_player;n++){pp=Player[n];Maze[pp.p_y*WIDTH2+pp.p_x]=pp.p_face}
    }
    for(n=0;n<End_player;n++){
      pp=Player[n];
      if(pp.p_flying>=0){
        Maze[pp.p_y*WIDTH2+pp.p_x]=pp.p_over;
        x=pp.p_x+pp.p_flyx;
        y=pp.p_y+pp.p_flyy;
        if(x<1){
          x=1-x;
          pp.p_flyx=-pp.p_flyx;
        }else if(x>WIDTH-2){
          x=(WIDTH-2)-(x-(WIDTH-2));
          pp.p_flyx=-pp.p_flyx;
        }
        if(y<1){
          y=1-y;
          pp.p_flyy=-pp.p_flyy;
        }else if(y>HEIGHT-2){
          y=(HEIGHT-2)-(y-(HEIGHT-2));
          pp.p_flyy=-pp.p_flyy;
        }
        again:for(;;){
          c=maze(y,x);
          switch(c){
          case LEFTS:case RIGHT:case ABOVE:case BELOW:case FLYER:
            switch(rand_num(4)){
            case 0:x=plus_delta(x,WIDTH-2);break;
            case 1:x=minus_delta(x,1);break;
            case 2:y=plus_delta(y,HEIGHT-2);break;
            case 3:y=minus_delta(y,1);break;
            }
            continue again;
          case WALL1:case WALL2:case WALL3:case WALL4:case WALL5:case DOOR:
            if(pp.p_flying===0)pp.p_flying++;
            break;
          case MINE:
            checkdam(pp,null,null,MINDAM,MINE);
            Maze[y*WIDTH2+x]=SPACE;
            break;
          case GMINE:
            checkdam(pp,null,null,MINDAM,GMINE);
            checkdam(pp,null,null,MINDAM,GMINE);
            Maze[y*WIDTH2+x]=SPACE;
            break;
          }
          break;
        }
        pp.p_y=y;
        pp.p_x=x;
        pp.p_over=maze(y,x);
        if(pp.p_flying--===0){
          checkdam(pp,null,null,rand_num(Math.trunc(pp.p_damage/5)),FALL);
          rand_face(pp);
          showstat(pp);
        }
        Maze[y*WIDTH2+x]=pp.p_face;
        showexpl(y,x,pp.p_face);
      }
      sendcom(pp,REFRESH);
      look(pp);
      sendcom(pp,REFRESH);
    }
    for(n=0;n<End_monitor;n++)sendcom(Monitor[n],REFRESH);
  }
  function save_bullet(bp){
    bp.b_over=maze(bp.b_y,bp.b_x);
    switch(bp.b_over){
    case SHOT:case GRENADE:case SATCHEL:case BOMB:case SLIME:case LAVA:
      find_under(Bullets,bp);
      break;
    }
    switch(bp.b_over){
    case LEFTS:case RIGHT:case ABOVE:case BELOW:case FLYER:
      mark_player(bp);
      break;
    default:
      Maze[bp.b_y*WIDTH2+bp.b_x]=bp.b_type;
      break;
    }
    bp.b_next=Bullets;
    Bullets=bp;
  }
  function chkshot(bp){
    var y,x,dy,dx,absdy,delta=0,damage,expl,pp,c;
    switch(bp.b_type){
    case SHOT:case MINE:delta=0;break;
    case GRENADE:case GMINE:delta=1;break;
    case SATCHEL:delta=2;break;
    case BOMB:delta=3;break;
    case SLIME:case LAVA:
      chkslime(bp);
      return;
    }
    for(y=bp.b_y-delta;y<=bp.b_y+delta;y++){
      if(y<0||y>=HEIGHT)continue;
      dy=y-bp.b_y;
      absdy=dy<0?-dy:dy;
      for(x=bp.b_x-delta;x<=bp.b_x+delta;x++){
        if(x<0||x>=WIDTH)continue;
        dx=x-bp.b_x;
        if(dx===0)expl=dy===0?42:124;
        else if(dy===0)expl=45;
        else if(dx===dy)expl=92;
        else if(dx===-dy)expl=47;
        else expl=42;
        showexpl(y,x,expl);
        c=maze(y,x);
        switch(c){
        case LEFTS:case RIGHT:case ABOVE:case BELOW:case FLYER:
          if(dx<0)dx=-dx;
          if(absdy>dx)damage=delta-absdy+1;
          else damage=delta-dx+1;
          pp=play_at(y,x);
          while(damage-->0)checkdam(pp,bp.b_owner,bp.b_score,MINDAM,bp.b_type);
          break;
        case GMINE:case MINE:
          add_shot(c===GMINE?GRENADE:SHOT,y,x,LEFTS,c===GMINE?GRENREQ:BULREQ,null,true,SPACE);
          Maze[y*WIDTH2+x]=SPACE;
          break;
        }
      }
    }
  }
  function chkslime(bp){
    switch(maze(bp.b_y,bp.b_x)){
    case WALL1:case WALL2:case WALL3:case WALL4:case WALL5:case DOOR:
      switch(bp.b_face){
      case LEFTS:bp.b_x++;break;
      case RIGHT:bp.b_x--;break;
      case ABOVE:bp.b_y++;break;
      case BELOW:bp.b_y--;break;
      }
      break;
    }
    moveslime(Object.assign({},bp),bp.b_type===SLIME?SLIMESPEED:LAVASPEED);
  }
  function moveslime(bp,speed){
    var i,j,dirmask,count,pp,nbp;
    if(speed===0){
      if(bp.b_charge>0)save_bullet(bp);
      return;
    }
    showexpl(bp.b_y,bp.b_x,bp.b_type===LAVA?LAVA:42);
    switch(maze(bp.b_y,bp.b_x)){
    case LEFTS:case RIGHT:case ABOVE:case BELOW:case FLYER:
      pp=play_at(bp.b_y,bp.b_x);
      message(pp,"You've been slimed.");
      checkdam(pp,bp.b_owner,bp.b_score,MINDAM,bp.b_type);
      break;
    }
    if(--bp.b_charge<=0)return;
    dirmask=0;
    count=0;
    function go(ok,d){if(ok){dirmask|=d;count++}}
    switch(bp.b_face){
    case LEFTS:
      go(!iswall(bp.b_y,bp.b_x-1),WEST);
      go(!iswall(bp.b_y-1,bp.b_x),NORTH);
      go(!iswall(bp.b_y+1,bp.b_x),SOUTH);
      if(dirmask===0)go(!iswall(bp.b_y,bp.b_x+1),EAST);
      break;
    case RIGHT:
      go(!iswall(bp.b_y,bp.b_x+1),EAST);
      go(!iswall(bp.b_y-1,bp.b_x),NORTH);
      go(!iswall(bp.b_y+1,bp.b_x),SOUTH);
      if(dirmask===0)go(!iswall(bp.b_y,bp.b_x-1),WEST);
      break;
    case ABOVE:
      go(!iswall(bp.b_y-1,bp.b_x),NORTH);
      go(!iswall(bp.b_y,bp.b_x-1),WEST);
      go(!iswall(bp.b_y,bp.b_x+1),EAST);
      if(dirmask===0)go(!iswall(bp.b_y+1,bp.b_x),SOUTH);
      break;
    case BELOW:
      go(!iswall(bp.b_y+1,bp.b_x),SOUTH);
      go(!iswall(bp.b_y,bp.b_x-1),WEST);
      go(!iswall(bp.b_y,bp.b_x+1),EAST);
      if(dirmask===0)go(!iswall(bp.b_y-1,bp.b_x),NORTH);
      break;
    }
    if(count===0){
      save_bullet(bp);
      return;
    }
    if(bp.b_charge<count){
      while(count>bp.b_charge){
        if(dirmask&WEST)dirmask&=~WEST;
        else if(dirmask&EAST)dirmask&=~EAST;
        else if(dirmask&NORTH)dirmask&=~NORTH;
        else if(dirmask&SOUTH)dirmask&=~SOUTH;
        count--;
      }
    }
    i=Math.trunc(bp.b_charge/count);
    j=bp.b_charge%count;
    if(dirmask&WEST){
      count--;
      nbp=create_shot(bp.b_type,bp.b_y,bp.b_x-1,LEFTS,i,bp.b_owner,bp.b_score,true,SPACE);
      moveslime(nbp,speed-1);
    }
    if(dirmask&EAST){
      count--;
      nbp=create_shot(bp.b_type,bp.b_y,bp.b_x+1,RIGHT,count<j?i+1:i,bp.b_owner,bp.b_score,true,SPACE);
      moveslime(nbp,speed-1);
    }
    if(dirmask&NORTH){
      count--;
      nbp=create_shot(bp.b_type,bp.b_y-1,bp.b_x,ABOVE,count<j?i+1:i,bp.b_owner,bp.b_score,true,SPACE);
      moveslime(nbp,speed-1);
    }
    if(dirmask&SOUTH){
      count--;
      nbp=create_shot(bp.b_type,bp.b_y+1,bp.b_x,BELOW,count<j?i+1:i,bp.b_owner,bp.b_score,true,SPACE);
      moveslime(nbp,speed-1);
    }
  }
  function iswall(y,x){
    if(y<0||x<0||y>=HEIGHT||x>=WIDTH)return true;
    switch(maze(y,x)){
    case WALL1:case WALL2:case WALL3:case WALL4:case WALL5:case DOOR:case LAVA:
      return true;
    }
    return false;
  }
  function zapshot(blist,obp){
    var bp,explode=false;
    for(bp=blist;bp!==null;bp=bp.b_next){
      if(bp.b_x!==obp.b_x||bp.b_y!==obp.b_y)continue;
      if(bp.b_face===obp.b_face)continue;
      explode=true;
      break;
    }
    if(!explode)return;
    explshot(blist,obp.b_y,obp.b_x);
  }
  function explshot(blist,y,x){
    for(var bp=blist;bp!==null;bp=bp.b_next)
      if(bp.b_x===x&&bp.b_y===y){
        bp.b_expl=true;
        if(bp.b_owner!==null)message(bp.b_owner,'Shot intercepted');
      }
  }
  function play_at(y,x){
    for(var n=0;n<End_player;n++)if(Player[n].p_x===x&&Player[n].p_y===y)return Player[n];
    throw new Abort("driver: couldn't find player at ("+x+','+y+')');
  }
  function opposite(face,dir){
    switch(face){
    case LEFTS:return dir===RIGHT;
    case RIGHT:return dir===LEFTS;
    case ABOVE:return dir===BELOW;
    case BELOW:return dir===ABOVE;
    }
    return false;
  }
  function is_bullet(y,x){
    for(var bp=Bullets;bp!==null;bp=bp.b_next)if(bp.b_y===y&&bp.b_x===x)return bp;
    return null;
  }
  function fixshots(y,x,over){
    for(var bp=Bullets;bp!==null;bp=bp.b_next)if(bp.b_y===y&&bp.b_x===x)bp.b_over=over;
  }
  function find_under(blist,bp){
    for(var nbp=blist;nbp!==null;nbp=nbp.b_next)
      if(bp.b_y===nbp.b_y&&bp.b_x===nbp.b_x){
        bp.b_over=nbp.b_over;
        break;
      }
  }
  function mark_player(bp){
    for(var n=0;n<End_player;n++)
      if(Player[n].p_y===bp.b_y&&Player[n].p_x===bp.b_x){
        Player[n].p_undershot=1;
        break;
      }
  }

  /* ---- expl.c */
  function showexpl(y,x,type){
    var n,pp,c;
    if(y<0||y>=HEIGHT)return;
    if(x<0||x>=WIDTH)return;
    Expl[0]={e_y:y,e_x:x,e_char:type,e_next:Expl[0]};
    for(n=0;n<End_player;n++){
      pp=Player[n];
      if(pp.p_maze[y*WIDTH2+x]===type)continue;
      pp.p_maze[y*WIDTH2+x]=type;
      cgoto(pp,y,x);
      outch(pp,type);
    }
    for(n=0;n<End_monitor;n++){
      pp=Monitor[n];
      if(pp.p_maze[y*WIDTH2+x]===type)continue;
      pp.p_maze[y*WIDTH2+x]=type;
      cgoto(pp,y,x);
      outch(pp,type);
    }
    c=maze(y,x);
    switch(c){
    case WALL1:case WALL2:case WALL3:case DOOR:case WALL4:case WALL5:
      if(y>=UBOUND&&y<DBOUND&&x>=LBOUND&&x<RBOUND)remove_wall(y,x);
      break;
    }
  }
  function rollexpl(){
    var ep,pp,y,x,c,n;
    for(ep=Expl[EXPLEN-1];ep!==null;ep=ep.e_next){
      y=ep.e_y;
      x=ep.e_x;
      if(y<UBOUND||y>=DBOUND||x<LBOUND||x>=RBOUND)c=maze(y,x);
      else c=SPACE;
      for(n=0;n<End_player;n++){
        pp=Player[n];
        if(pp.p_maze[y*WIDTH2+x]===ep.e_char){
          pp.p_maze[y*WIDTH2+x]=c;
          cgoto(pp,y,x);
          outch(pp,c);
        }
      }
      for(n=0;n<End_monitor;n++)check(Monitor[n],y,x);
    }
    for(x=EXPLEN-1;x>0;x--)Expl[x]=Expl[x-1];
    Expl[0]=null;
  }
  function remove_wall(y,x){
    var r=rem_index,save_char=0,c,pp,n,tries=0;
    while(removed[r].r_y!==0){
      c=maze(removed[r].r_y,removed[r].r_x);
      if(c===SPACE||c===LEFTS||c===RIGHT||c===ABOVE||c===BELOW||c===FLYER){
        save_char=c;
        break;
      }
      if(++r>=MAXREMOVE)r=0;
      /* the C goes round for ever if every slot is covered; only a key could change that, and it never gets one */
      if(++tries>MAXREMOVE*2)throw new Abort('driver: no wall to put back');
    }
    var R=removed[r];
    if(R.r_y!==0){
      var at=R.r_y*WIDTH2+R.r_x;
      if(save_char===SPACE)Maze[at]=Orig_maze[at];
      else{
        pp=play_at(R.r_y,R.r_x);
        if(pp.p_flying>=0)pp.p_flying+=rand_num(10);
        else{
          pp.p_flying=rand_num(20);
          pp.p_flyx=2*rand_num(6)-5;
          pp.p_flyy=2*rand_num(6)-5;
        }
        pp.p_over=Orig_maze[at];
        pp.p_face=FLYER;
        Maze[at]=FLYER;
        showexpl(R.r_y,R.r_x,FLYER);
      }
      if(rand_num(100)===0)Maze[at]=DOOR;
      if(rand_num(100)===0)Maze[at]=WALL4;
      for(n=0;n<End_monitor;n++)check(Monitor[n],R.r_y,R.r_x);
    }
    R.r_y=y;
    R.r_x=x;
    r++;
    rem_index=r>=MAXREMOVE?0:r;
    Maze[y*WIDTH2+x]=SPACE;
    for(n=0;n<End_monitor;n++)check(Monitor[n],y,x);
  }

  /* ---- driver.c */
  function checkdam(ouch,gotcha,credit,amt,shot_type){
    var cp,n;
    if(ouch.p_death!=='')return;
    if(rand_num(100)<5){
      message(ouch,'Missed you by a hair');
      if(gotcha!==null)message(gotcha,'Missed him');
      return;
    }
    ouch.p_damage+=amt;
    if(ouch.p_damage<=ouch.p_damcap){
      cgoto(ouch,STAT_DAM_ROW,STAT_VALUE_COL);
      outstr(ouch,pad(ouch.p_damage,2),2);
      return;
    }
    switch(shot_type){
    case FALL:cp='Killed on impact';break;
    case KNIFE:cp='Stabbed to death';break;
    case SHOT:cp='Shot to death';break;
    case GRENADE:case SATCHEL:case BOMB:cp='Bombed';break;
    case MINE:case GMINE:cp='Blown apart';break;
    case SLIME:cp='Slimed';break;
    case LAVA:cp='Baked';break;
    default:cp='Killed';break;
    }
    if(credit===null){
      ouch.p_death='| '+cp+' by '+(shot_type===MINE||shot_type===GMINE?'a mine':'act of God')+' |';
      return;
    }
    ouch.p_death='| '+cp+' by '+credit.i_name+' |';
    credit.i_kills++;
    credit.i_score=Math.fround(credit.i_kills/credit.i_entries);
    if(gotcha===null)return;
    gotcha.p_damcap+=STABDAM;
    gotcha.p_damage-=STABDAM;
    if(gotcha.p_damage<0)gotcha.p_damage=0;
    cgoto(gotcha,STAT_DAM_ROW,STAT_VALUE_COL);
    outstr(gotcha,pad(gotcha.p_damage,2)+'/'+pad(gotcha.p_damcap,2),5);
    cgoto(gotcha,STAT_KILL_ROW,STAT_VALUE_COL);
    outstr(gotcha,pad(Math.trunc((gotcha.p_damcap-MAXDAM)/2),3),3);
    var s=f52(gotcha.p_ident.i_score);
    for(n=0;n<End_player;n++){
      cgoto(Player[n],STAT_PLAY_ROW+1+Player.indexOf(gotcha),STAT_NAME_COL);
      outstr(Player[n],s,5);
    }
  }
  function cleanup(){
    var n,pp;
    for(n=0;n<End_player;n++){
      pp=Player[n];
      cgoto(pp,HEIGHT,0);
      sendcom(pp,ENDWIN);
      put(pp,LAST_PLAYER);
      closeconn(pp);
    }
    for(n=0;n<End_monitor;n++){
      pp=Monitor[n];
      cgoto(pp,HEIGHT,0);
      sendcom(pp,ENDWIN);
      put(pp,LAST_PLAYER);
      closeconn(pp);
    }
    over=true;
    throw new Over();
  }
  function zap(pp,was_player){
    var i,len,bp,np,x,y,n;
    if(was_player){
      drawplayer(pp,false);
      Nplayer--;
    }
    len=pp.p_death.length;
    x=Math.trunc((WIDTH-len)/2);
    cgoto(pp,Math.trunc(HEIGHT/2),x);
    outstr(pp,pp.p_death,len);
    pp.p_death='+'+'-'.repeat(len-2)+'+';
    cgoto(pp,Math.trunc(HEIGHT/2)-1,x);
    outstr(pp,pp.p_death,len);
    cgoto(pp,Math.trunc(HEIGHT/2)+1,x);
    outstr(pp,pp.p_death,len);
    cgoto(pp,HEIGHT,0);
    if(Nplayer===0)cleanup();
    if(was_player){
      for(bp=Bullets;bp!==null;bp=bp.b_next){
        if(bp.b_owner===pp)bp.b_owner=null;
        if(bp.b_x===pp.p_x&&bp.b_y===pp.p_y)bp.b_over=SPACE;
      }
      i=rand_num(pp.p_ammo);
      if(i===pp.p_ammo-1){x=pp.p_ammo;len=SLIME}
      else if(i>=BOMBREQ){x=BOMBREQ;len=BOMB}
      else if(i>=SSLIMEREQ){x=SSLIMEREQ;len=SLIME}
      else if(i>=SATREQ){x=SATREQ;len=SATCHEL}
      else if(i>=SLIMEREQ){x=SLIMEREQ;len=SLIME}
      else if(i>=GRENREQ){x=GRENREQ;len=GRENADE}
      else x=0;
      if(x>0){
        add_shot(len,pp.p_y,pp.p_x,pp.p_face,x,null,true,SPACE);
        var det=pp.p_ident.i_name+' detonated.';
        for(n=0;n<End_player;n++)message(Player[n],det);
        for(n=0;n<End_monitor;n++)message(Monitor[n],det);
      }
      volcano+=pp.p_ammo-x;
      if(rand_num(100)<Math.trunc(volcano/50)){
        do{
          x=rand_num(Math.trunc(WIDTH/2))+Math.trunc(WIDTH/4);
          y=rand_num(Math.trunc(HEIGHT/2))+Math.trunc(HEIGHT/4);
        }while(maze(y,x)!==SPACE);
        add_shot(LAVA,y,x,LEFTS,volcano,null,true,SPACE);
        for(n=0;n<End_player;n++)message(Player[n],'Volcano eruption.');
        volcano=0;
      }
      sendcom(pp,ENDWIN);
      closeconn(pp);
      End_player--;
      if(pp!==Player[End_player]){
        bcopyPlayer(pp,Player[End_player]);
        var s=statline(pp);
        i=STAT_PLAY_ROW+1+Player.indexOf(pp);
        for(n=0;n<End_player;n++){cgoto(Player[n],i,STAT_NAME_COL);outstr(Player[n],s,STAT_NAME_LEN)}
        for(n=0;n<End_monitor;n++){cgoto(Monitor[n],i,STAT_NAME_COL);outstr(Monitor[n],s,STAT_NAME_LEN)}
      }
      i=STAT_PLAY_ROW+1+Nplayer;
      for(n=0;n<End_player;n++){cgoto(Player[n],i,STAT_NAME_COL);ce(Player[n])}
      for(n=0;n<End_monitor;n++){cgoto(Monitor[n],i,STAT_NAME_COL);ce(Monitor[n])}
    }else{
      sendcom(pp,ENDWIN);
      put(pp,LAST_PLAYER);
      closeconn(pp);
      End_monitor--;
      if(pp!==Monitor[End_monitor]){
        bcopyPlayer(pp,Monitor[End_monitor]);
        var t='      '+left(pp.p_ident.i_name,10);
        i=STAT_MON_ROW+1+Monitor.indexOf(pp);
        for(n=0;n<End_player;n++){cgoto(Player[n],i,STAT_NAME_COL);outstr(Player[n],t,STAT_NAME_LEN)}
        for(n=0;n<End_monitor;n++){cgoto(Monitor[n],i,STAT_NAME_COL);outstr(Monitor[n],t,STAT_NAME_LEN)}
      }
      i=STAT_MON_ROW+1+End_monitor;
      for(n=0;n<End_player;n++){cgoto(Player[n],i,STAT_NAME_COL);ce(Player[n])}
      for(n=0;n<End_monitor;n++){cgoto(Monitor[n],i,STAT_NAME_COL);ce(Monitor[n])}
    }
  }
  /* the inner loop of main(): every player with a key does one, the shots move, the dead go; until no keys are left */
  function step(){
    var had,n,pp;
    for(;;){
      had=false;
      for(n=0;n<End_player;n++){
        pp=Player[n];
        if(pp.conn.q.length){
          execute(pp);
          pp.p_nexec++;
          had=true;
        }
      }
      for(n=0;n<End_monitor;n++){
        pp=Monitor[n];
        if(pp.conn.q.length){
          mon_execute(pp);
          pp.p_nexec++;
          had=true;
        }
      }
      if(!had)break;
      moveshots();
      for(n=0;n<End_player;)
        if(Player[n].p_death!=='')zap(Player[n],true);
        else n++;
      for(n=0;n<End_monitor;)
        if(Monitor[n].p_death!=='')zap(Monitor[n],false);
        else n++;
    }
  }
  /* init() */
  for(i=0;i<128;i++)See_over[i]=1;
  See_over[DOOR]=0;See_over[WALL1]=0;See_over[WALL2]=0;See_over[WALL3]=0;See_over[WALL4]=0;See_over[WALL5]=0;
  makemaze();
  return {
    answer:answer,
    /* Over: the last player has gone, and the driver with it. Abort: it dumped core. */
    step:function(){
      if(over)return;
      try{step()}catch(e){if(!(e instanceof Over))throw e}
    },
    over:function(){return over}
  };
}

/* ---------- the robots: NEW CODE, written for this terminal; none of this is hunt ---------- */
function makeBot(D,num){
  var name='robot'+num,machine=100+num,conn=null,wait=0,bored=0,goal=-1,walked=new Uint8Array(HEIGHT*WIDTH2),
    MOVES=[[-1,0,ABOVE,107,75],[1,0,BELOW,106,74],[0,-1,LEFTS,104,72],[0,1,RIGHT,108,76]];
  function enemy(c){return c===LEFTS||c===RIGHT||c===ABOVE||c===BELOW||c===FLYER}
  function wall(c){return c===WALL1||c===WALL2||c===WALL3||c===WALL4||c===WALL5||c===DOOR}
  function shot(c){return c===SHOT||c===GRENADE||c===SATCHEL||c===BOMB||c===SLIME||c===LAVA}
  function enter(){
    conn={q:[],closed:false,pp:null,put:function(){}};
    if(!D.answer(conn,machine,1,name,false))conn=null;
    walked.fill(0);
    goal=-1;
  }
  /* breadth first over what is on its screen, treating what it has not seen as open, to the nearest square wanted by the test */
  function route(pp,wanted){
    var m=pp.p_maze,from=new Int32Array(HEIGHT*WIDTH2).fill(-1),q=[pp.p_y*WIDTH2+pp.p_x],h=0,at,k,y,x,to;
    from[q[0]]=q[0];
    while(h<q.length){
      at=q[h++];
      if(h>1&&wanted(at)){
        while(from[at]!==q[0])at=from[at];
        y=Math.trunc(at/WIDTH2);x=at%WIDTH2;
        for(k=0;k<4;k++)if(MOVES[k][0]===y-pp.p_y&&MOVES[k][1]===x-pp.p_x)return k;
      }
      y=Math.trunc(at/WIDTH2);x=at%WIDTH2;
      for(k=0;k<4;k++){
        to=(y+MOVES[k][0])*WIDTH2+x+MOVES[k][1];
        if(y+MOVES[k][0]<1||y+MOVES[k][0]>=DBOUND||x+MOVES[k][1]<1||x+MOVES[k][1]>=RBOUND||from[to]>=0)continue;
        if(wall(m[to])||shot(m[to])||enemy(m[to]))continue;
        from[to]=at;
        q.push(to);
      }
    }
    return -1;
  }
  function go(pp,k){return pp.p_face===MOVES[k][2]?MOVES[k][3]:MOVES[k][4]} /* it turns to look where it is going, then steps */
  function think(pp){
    var m=pp.p_maze,x=pp.p_x,y=pp.p_y,k,d,c,sy,sx,near=-1,dist=99,threat=-1;
    walked[y*WIDTH2+x]=1;
    for(k=0;k<4;k++){
      sy=y;sx=x;
      for(d=1;d<40;d++){
        sy+=MOVES[k][0];sx+=MOVES[k][1];
        if(sy<0||sy>=HEIGHT||sx<0||sx>=WIDTH)break;
        c=m[sy*WIDTH2+sx];
        if(wall(c))break;
        if(enemy(c)){if(d<dist){dist=d;near=k}break}
        if(shot(c)&&d<8&&threat<0)threat=k;
      }
    }
    if(near>=0){
      bored=0;
      if(pp.p_face!==MOVES[near][2])return MOVES[near][4];
      if(dist===1)return MOVES[near][3]; /* the knife costs nothing */
      if(pp.p_ammo<=0)return MOVES[near][3];
      if(pp.p_ncshot>MAXNCSHOT)return 0;
      if(pp.p_ammo>=BOMBREQ+10&&dist>=5&&Math.random()<.1)return 71;
      if(pp.p_ammo>=SATREQ+10&&dist>=4&&Math.random()<.15)return 70;
      if(pp.p_ammo>=GRENREQ+5&&dist>=3&&Math.random()<.3)return 103;
      return 102;
    }
    if(threat>=0&&Math.random()<.6){
      /* something flying down this corridor: out of the line, if there is a way */
      for(k=0;k<4;k++){
        if((threat<2)===(k<2))continue;
        c=m[(y+MOVES[k][0])*WIDTH2+x+MOVES[k][1]];
        if(!wall(c)&&!shot(c)&&!enemy(c))return MOVES[k][3];
      }
    }
    if(++bored>40&&pp.p_ammo>=20&&Math.random()<.05){
      bored=0;
      return Math.random()<.5?115:99;
    }
    /* low on charges: to a mine it has seen. Otherwise to the last place it saw someone, or somewhere new. */
    k=-1;
    if(pp.p_ammo<25)k=route(pp,function(a){return m[a]===MINE||m[a]===GMINE});
    if(k<0&&Math.random()<.5)k=route(pp,function(a){
      return enemy(m[a+1])||enemy(m[a-1])||enemy(m[a+WIDTH2])||enemy(m[a-WIDTH2]);
    });
    if(k<0)k=route(pp,function(a){return !walked[a]&&m[a]===SPACE});
    if(k<0){walked.fill(0);return 0}
    return go(pp,k);
  }
  return {
    conn:function(){return conn},
    /* its key for this tick, into the driver; called four times a second */
    tick:function(){
      if(!conn||conn.closed){
        if(++wait>=RESPAWN&&!D.over()){wait=0;enter()}
        return;
      }
      if(conn.pp.p_flying>=0)return;
      if(Math.random()<.2)return; /* people hesitate */
      var c=think(conn.pp);
      if(c)conn.q.push(c);
    },
    enter:enter
  };
}

/* ---------- the player's side: hunt.c and playit.c ---------- */
P.command({names:['hunt'],run:function(a,raw,words){
  var argv=words.slice(1),name='',monitor=false,query=false,host=null,i,map=new Array(256);
  function usage(){P.typeLine('usage: hunt [-q] [-n name] [-h host] [-m]','err');P.status(1)}
  for(i=0;i<argv.length&&argv[i].charAt(0)==='-';i++){
    switch(argv[i].charAt(1)){
    case 'l':case 'n':
      if(i+1>=argv.length){usage();return}
      name=argv[++i];
      break;
    case 'o':
      P.typeLine('The -o flag is reserved for future use.','err');
      usage();
      return;
    case 'm':monitor=true;break;
    case 'q':query=true;break;
    case 'h':
      if(i+1>=argv.length){usage();return}
      host=argv[++i];
      break;
    default:usage();return;
    }
  }
  if(argv.length-i>1){usage();return}
  if(argv.length-i===1)host=argv[i];
  function known(h){return h===null||h==='localhost'||h===(P.st.hostname||'')}
  if(!known(host)){P.typeLine('Unknown host','err');P.status(1);return}
  if(query){P.status(1);return} /* no one is playing anywhere: nothing printed, and it says so in its exit status */
  if(P.piped()||P.stdin()){P.typeLine('hunt: needs a terminal','err');return}

  /* env_init() */
  for(i=0;i<256;i++)map[i]=i;
  var envp=P.env&&P.env.HUNT,envname=null;
  if(envp){
    var s;
    while((s=envp.indexOf('='))>=0){
      var opt=envp.slice(0,s+1);
      if(opt==='name='){
        var rest=envp.slice(s+1),comma=rest.indexOf(',');
        if(comma<0){envname=rest;envp='';break}
        envname=rest.slice(0,comma);
        envp=rest.slice(comma+1);
      }else if(opt==='mapkey='){
        var mk=envp.slice(s+1);
        for(i=0;i<mk.length;i+=2){
          map[mk.charCodeAt(i)&255]=i+1<mk.length?mk.charCodeAt(i+1)&255:0;
        }
        envp='';
        break;
      }else{
        P.typeLine('unknown option '+envp.slice(0,s));
        var c2=envp.indexOf(',',s);
        if(c2<0){envp='';break}
        envp=envp.slice(c2+1);
      }
    }
    if(envp){
      if(envname===null)envname=envp;
      else P.typeLine('unknown option '+envp);
    }
  }
  P.typeLine('There is no network here, so the other players are computer-controlled robots.');
  P.typeLine('They are new code written for this terminal; hunt had no computer players.');
  if(envname!==null){
    name=envname;
    P.typeLine("Entering as '"+envname+"'");
    start();
  }else if(name===''){
    P.ask('Enter your code name: ',function(l){
      if(l===null){P.status(1);return}
      name=l.slice(0,NAMELEN-2);
      start();
    });
  }else start();

  function start(){
    P.program(function(S,done){
      var D=null,bots=[],me=null,timer=null,finished=false,Last_player=false,
        screen=[],cur_row=0,cur_col=0,hold=null,sawEnd=false,want='',resumeY=0,resumeX=0,explain=false,arg=[],mode=0,sleeper=null;
      function blank(){var r=[];for(var i=0;i<24;i++)r.push(new Array(80).fill(' '));return r}
      screen=blank();
      /* ---- playit(): what comes from the driver */
      function put_ch(ch){
        if(ch<32||ch>126)return;
        if(cur_row>=0&&cur_row<24&&cur_col<80)screen[cur_row][cur_col]=String.fromCharCode(ch);
        if(++cur_col>=80){
          cur_col=0;
          if(++cur_row>=24)cur_row=24;
        }
      }
      function put_str(t){for(var i=0;i<t.length;i++)put_ch(t.charCodeAt(i))}
      function clear_eol(){
        if(cur_row<24)for(var c=cur_col;c<80;c++)screen[cur_row][c]=' ';
      }
      function incoming(b){
        if(hold){hold.push(b);return}
        if(mode===1){arg.push(b);if(arg.length===2){cur_row=arg[0];cur_col=arg[1];arg=[];mode=0}return}
        if(mode===2){put_ch(b);mode=0;return}
        if(mode===3){if(b===LAST_PLAYER)Last_player=true;mode=0;return}
        switch(b){
        case MOVE:mode=1;break;
        case ADDCH:mode=2;break;
        case CLRTOEOL:clear_eol();break;
        case CLEAR:screen=blank();cur_row=cur_col=0;break;
        case REFRESH:case REDRAW:break;
        case ENDWIN:sawEnd=true;mode=3;break;
        case BELL:if(P.click)P.click(.5,900);break;
        default:put_ch(b);
        }
      }
      /* the program fits the type to the whole 80x24 where it stays readable; where it would not, the view follows the cursor */
      function draw(){
        if(finished)return;
        var rows=S.rows,cols=S.cols,top=rows<24?Math.max(0,Math.min(24-rows,cur_row-(rows>>1))):0,lft=cols<80?Math.max(0,Math.min(80-cols,cur_col-(cols>>1))):0,L=[];
        for(var r=top;r<Math.min(24,top+rows);r++)L.push(screen[r].slice(lft,lft+cols).join('').trimEnd());
        S.draw(L,Math.min(cur_row,23)-top,Math.max(0,Math.min(cur_col-lft,cols-1)));
      }
      /* ---- the driver and the robots run from here */
      function turn(){
        if(finished)return;
        try{D.step()}catch(e){
          if(e instanceof Abort){leave(e.msg);return}
          throw e;
        }
        if(sawEnd&&!want){sawEnd=false;quit()}
        draw();
      }
      function tick(){
        timer=null;
        if(finished)return;
        for(var i=0;i<bots.length;i++)bots[i].tick();
        turn();
        if(!finished)timer=S.after(TICK,tick);
      }
      function enter(){
        me={q:[],closed:false,pp:null,put:incoming};
        sawEnd=false;
        mode=0;
        if(!D.answer(me,1,1,name,monitor)){leave('The game is full.  Sorry.');return}
        draw();
      }
      /* ---- hunt.c */
      function leave(msg){
        if(finished)return;
        finished=true;
        if(timer!==null)S.cancel(timer);
        if(sleeper!==null)S.cancel(sleeper);
        S.close();
        if(msg){P.typeLine(msg);P.status(1)}
        done();
      }
      function quit(){
        if(Last_player){leave();return}
        cur_row=23;cur_col=0;
        put_str('Re-enter game? ');
        clear_eol();
        want='reenter';
        explain=false;
        draw();
      }
      function intr(){
        resumeY=cur_row;resumeX=cur_col;
        cur_row=23;cur_col=0;
        put_str('Really quit? ');
        clear_eol();
        hold=[];
        want='really';
        explain=false;
        draw();
      }
      function answerKey(k){
        var ch=k.length===1?k.toLowerCase():k;
        if(want==='really'){
          if(k==='C-c')return; /* it had set SIGINT aside while it asked */
          if(ch==='y'){leave();return}
          if(ch==='n'){
            want='';
            cur_row=resumeY;cur_col=resumeX;
            var h=hold;
            hold=null;
            h.forEach(incoming);
            if(sawEnd){sawEnd=false;quit()}
            draw();
            return;
          }
          if(!explain){put_str('(Y or N) ');explain=true}
          if(P.click)P.click(.5,900);
          draw();
          return;
        }
        /* reenter */
        if(ch==='y'){
          want='';
          sleeper=S.after(2000,function(){sleeper=null;if(!finished){enter();turn()}});
          return;
        }
        if(ch==='n'){leave();return}
        if(P.click)P.click(.5,900);
        if(!explain){put_str('(Y or N) ');explain=true}
        draw();
      }
      function feed(k){
        if(finished)return;
        if(want){answerKey(k);return}
        if(sleeper!==null)return;
        if(k==='C-c'){intr();return}
        var c=k.length===1?k.charCodeAt(0):k==='Enter'?13:k==='Tab'?9:k==='Backspace'?8:k==='Escape'?27:/^C-.$/.test(k)?k.charCodeAt(2)&31:-1;
        if(c<0)return;
        if(k==='C-z'||k==='C-\\')return;
        c=map[c&255];
        if(c===113){intr();return}
        me.q.push(c);
        turn();
      }
      /* the Seed was getpid() + time(). The game begins with "Starting...", then the driver and the others. */
      cur_row=23;cur_col=0;
      put_str('Starting...');
      draw();
      sleeper=S.after(600,function(){
        sleeper=null;
        if(finished)return;
        D=makeDriver(Math.floor(Date.now()/1000)+Math.floor(Math.random()*30000));
        for(var b=1;b<=ROBOTS;b++){var r=makeBot(D,b);r.enter();bots.push(r)}
        enter();
        turn();
        timer=S.after(TICK,tick);
      });
      if(!finished)draw();
      return {feed:feed,draw:draw};
    },{fit:[80,24]});
  }
}});
})(window.Phosphor);
