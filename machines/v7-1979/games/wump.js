/* PHOSPHOR-9 terminal: machine "v7-1979", wump, hunt the wumpus. Ported to JavaScript for this terminal from V7's
   usr/src/games/wump.c. The binary on the V7 tape is older than that source, and where they differ this follows the
   binary, checked under a simulator: one line of the instructions, and the rand() it was linked with, which is the
   Sixth Edition's. The source is under this notice:

Copyright(C) Caldera International Inc. 2001-2002. All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the
following conditions are met:

Redistributions of source code and documentation must retain the above copyright notice, this list of conditions and the
following disclaimer. Redistributions in binary form must reproduce the above copyright notice, this list of conditions
and the following disclaimer in the documentation and/or other materials provided with the distribution.

All advertising materials mentioning features or use of this software must display the following acknowledgement:

This product includes software developed or owned by Caldera International, Inc.

Neither the name of Caldera International, Inc. nor the names of other contributors may be used to endorse or promote
products derived from this software without specific prior written permission.

USE OF THE SOFTWARE PROVIDED FOR UNDER THIS LICENSE BY CALDERA INTERNATIONAL, INC.
AND CONTRIBUTORS ``AS IS'' AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL CALDERA INTERNATIONAL, INC. BE LIABLE FOR
ANY DIRECT, INDIRECT INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF
USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
*/
(function(P){
'use strict';
var NBAT=3,NROOM=20,NTUNN=3,NPIT=3,BAT=1,PIT=2,WUMP=4;
var INTRO=[
'',"Welcome to 'Hunt the Wumpus.'",'','The Wumpus lives in a cave of 20 rooms.','Each room has 3 tunnels leading to other rooms.','',
'Hazards:','','Bottomless Pits - Some rooms have Bottomless Pits in them.','\tIf you go there, you fall into the pit and lose!',
'Super Bats - Some other rooms have super bats.','\tIf you go there, a bat will grab you and take you to','\tsomewhere else in the cave where you could',
'\tfall into a pit or run into the . . .','','Wumpus:','','The Wumpus is not bothered by the hazards since','he has sucker feet and is too big for a bat to lift.','',
'Usually he is asleep.','Two things wake him up:','\tyour entering his room','\tyour shooting an arrow anywhere in the cave.',
'If the wumpus wakes, he either decides to move one room or','stay where he was.  But if he ends up where you are,','he eats you up and you lose!','',
'You:','','Each turn you may either move or shoot a crooked arrow.','','Moving - You can move to one of the adjoining rooms;',
'\tthat is, to one that has a tunnel connecting it with','\tthe room you are in.','','Shooting - You have 5 arrows.  You lose when you run out.',
'\tEach arrow can go from 1 to 5 rooms.','\tYou aim by telling the computer',"\tthe arrow's path - a list of room numbers.",
'\tThe list is terminated with a 0.','\tThe first room in the path must be connected to the','\troom you are in.  Each succeeding room must be','\tconnected to the previous room.',
'\tIf there is no tunnel between two of the rooms',"\tin the arrow's path, the arrow chooses one of the",'\tthree tunnels from the room it\'s in and goes its','\town way.','',
'\tIf the arrow hits the wumpus, you win!','\tIf the arrow hits you, you lose!','','Warnings:','','When you are one or two rooms away from the wumpus,','the computer says:',
"\t\t'I smell a Wumpus'",'When you are one room away from some other hazard, it says:',"\t\tBat    - 'Bats nearby'","\t\tPit    - 'I feel a draft'",''];
P.command({names:['wump'],run:function(){
  var rand=null,room=[],arrow,loc,wloc,tchar,i;
  for(i=0;i<NROOM;i++)room.push({tunn:[-1,-1,-1],flag:0});
  function rnum(n){
    if(!rand){ /* srand((first[1]*first[0])^first[1]), in 16-bit ints */
      var t=Math.floor(Date.now()/1000),lo=t&0xffff,hi=Math.floor(t/65536)&0xffff;
      rand=P.v6rand(Math.imul(lo,hi)^lo);
    }
    return Math.trunc(rand()/32768*n);
  }
  function tunnel(i){
    var c=20,n,j,p;
    for(;;){
      n=rnum(NROOM);
      if(n===i&&--c>0)continue;
      p=room[n];
      for(j=0;j<NTUNN;j++)if(p.tunn[j]===-1){p.tunn[j]=i;return n}
    }
  }
  function near(p,haz){
    for(var i=0;i<NTUNN;i++)if(room[p.tunn[i]].flag&haz)return true;
    return false;
  }
  function init(){ /* the room connections */
    var i,j,k,p;
    for(;;){
      room.forEach(function(r){r.tunn=[-1,-1,-1]});
      k=0;
      for(i=1;i<NROOM;){
        j=rnum(NROOM);p=room[j];
        if(j===k||p.tunn[0]>=0||p.tunn[1]>=0)continue;
        p.tunn[1]=k;room[k].tunn[0]=j;k=j;i++;
      }
      var bad=false;
      for(i=0;i<NROOM&&!bad;i++){
        p=room[i];
        for(j=0;j<NTUNN&&!bad;j++){
          if(p.tunn[j]<0)p.tunn[j]=tunnel(i);
          if(p.tunn[j]===i)bad=true;
          for(k=0;k<j&&!bad;k++)if(p.tunn[j]===p.tunn[k])bad=true;
        }
        if(!bad)p.tunn.sort(function(x,y){return x-y});
      }
      if(!bad)return;
    }
  }
  function setup(){ /* player, wumpus, pits and bats */
    var i,p;
    arrow=5;
    room.forEach(function(r){r.flag=0});
    for(i=0;i<NPIT;){p=room[rnum(NROOM)];if((p.flag&PIT)===0){p.flag|=PIT;i++}}
    for(i=0;i<NBAT;){p=room[rnum(NROOM)];if((p.flag&(PIT|BAT))===0){p.flag|=BAT;i++}}
    i=rnum(NROOM);wloc=i;room[i].flag|=WUMP;
    for(;;){i=rnum(NROOM);if((room[i].flag&(PIT|BAT|WUMP))===0){loc=i;break}}
  }
  P.cprog(function*(io){
    var END={};
    function* rline(){
      var c,r;
      while((c=yield* io.getc())===' ');
      r=c;
      while(c!=='\n'&&c!==' '){
        if(c===null)throw END; /* the C spins here for ever at the end of its input */
        c=yield* io.getc();
      }
      tchar=c;
      return r;
    }
    function* rin(){
      var n=0,c=yield* io.getc();
      while(c!=='\n'&&c!==' '){
        if(c===null)throw END;
        if(c<'0'||c>'9'){
          while(c!=='\n'){if(c===null)throw END;c=yield* io.getc()}
          return 0;
        }
        n=(n*10+(c.charCodeAt(0)-48))<<16>>16;
        c=yield* io.getc();
      }
      return n;
    }
    /* one turn after another until the game is done */
    function* play(){
      var p,i,j,k;
      for(;;){
        io.print('You are in room '+(loc+1)+'\n');
        p=room[loc];
        if(p.flag&PIT){io.print('You fell into a pit\n');return}
        if(p.flag&WUMP){io.print('You were eaten by the wumpus\n');return}
        if(p.flag&BAT){io.print('Theres a bat in your room\n');loc=rnum(NROOM);continue}
        var smell=near(p,WUMP);
        for(i=0;i<NTUNN;i++)if(near(room[p.tunn[i]],WUMP))smell=true;
        if(smell)io.print('I smell a wumpus\n');
        if(near(p,BAT))io.print('Bats nearby\n');
        if(near(p,PIT))io.print('I feel a draft\n');
        io.print('There are tunnels to');
        for(i=0;i<NTUNN;i++)io.print(' '+(p.tunn[i]+1));
        io.print('\n');
        var wake=false,moved=false;
        while(!wake&&!moved){
          io.print('Move or shoot (m-s) ');
          var r=yield* rline();
          if(r==='m'){
            if(tchar==='\n')io.print('which room? ');
            i=(yield* rin())-1;
            if(p.tunn.indexOf(i)<0){io.print('You hit the wall\n');continue}
            loc=i;
            if(i===wloc)wake=true;else moved=true;
          }
          else if(r==='s'){
            if(tchar==='\n')io.print('Give list of rooms terminated by 0\n');
            for(i=0;i<5;i++){
              j=(yield* rin())-1;
              if(j===-1)break;
              while(p.tunn.indexOf(j)<0)j=rnum(NROOM);
              p=room[j];
              if(j===loc){io.print('You shot yourself\n');return}
              if(p.flag&WUMP){io.print('You slew the wumpus\n');return}
            }
            if(--arrow===0){io.print('That was your last shot\n');return}
            wake=true;
          }
        }
        if(wake){
          p=room[wloc];
          p.flag&=~WUMP;
          i=rnum(NTUNN+1);
          if(i!==NTUNN)wloc=p.tunn[i];
          room[wloc].flag|=WUMP;
        }
      }
    }
    try{
      io.print('Instructions? (y-n) ');
      if((yield* rline())==='y')io.print(INTRO.join('\n')+'\n');
      var again=true;
      while(again){
        init();
        for(;;){
          setup();
          yield* play();
          io.print('Another game? (y-n) ');
          if((yield* rline())!=='y'){again=false;break}
          io.print('Same room setup? (y-n) ');
          if((yield* rline())!=='y')break;
        }
      }
    }catch(e){if(e!==END)throw e}
  });
}});
})(window.Phosphor);
