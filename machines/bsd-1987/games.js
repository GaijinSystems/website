/* PHOSPHOR-9 terminal: machine "bsd-1987", small games from the Berkeley distribution: wump,
   number, primes, factor, banner, hangman, worm, robots and snake. Ported to JavaScript for this terminal from
   the C in NetBSD's games. hangman's word list is new. The originals carry this notice, with years
   from 1980 to 1994 and these authors: wump Dave Taylor, hangman Ken Arnold, worm Michael Toy.
   This file keeps the notice, and may be used under its terms.

/*
 * Copyright (c) 1989, 1993
 *	The Regents of the University of California.  All rights reserved.
 * All rights reserved.
 *
 * This code is derived from software contributed to Berkeley by
 * Dave Taylor, of Intuitive Systems.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the University nor the names of its contributors
 *    may be used to endorse or promote products derived from this software
 *    without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE REGENTS AND CONTRIBUTORS ``AS IS'' AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED.  IN NO EVENT SHALL THE REGENTS OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS
 * OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
 * OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
 * SUCH DAMAGE.
 */
(function(P){
'use strict';

/* A program written as a generator: "yield prompt" reads a line, and printing stays in order. */
function run(gen){
  var EXIT=run.EXIT;
  (function step(v){
    var r;
    try{r=gen.next(v)}
    catch(e){if(e!==EXIT)throw e;return}
    if(r.done)return;
    P.ask(r.value||'',function(line){ /* ^C ends it, as the signal did; ^D is the end of the input */
      if(line===P.INT){try{gen.return()}catch(e){}return}
      step(line);
    },true);
  })();
}
run.EXIT={};
function game(name,fn){P.command({names:[name],run:fn})} /* loaded on first run: the names, paths and manual pages are in later.js */
function ran(n){return Math.floor(Math.random()*n)}
function atoi(s){return parseInt(s,10)||0}
function say(s){P.say(s.split('\n'))}
function plural(n){return n===1?'':'s'}

/* ---------- wump: Hunt the Wumpus, by Dave Taylor ---------- */
var WUMPINFO=["Welcome to the game of Hunt the Wumpus.", "", "The Wumpus typically lives in a cave of twenty rooms, with each room having", "three tunnels connecting it to other rooms in the cavern.  Caves may vary,", "however, depending on options specified when starting the game.", "", "The game has the following hazards for intrepid adventurers to wind their", "way through:", "", "  Pits   -- If you fall into one of the bottomless pits, you find yourself", "\t    slung back out on the far side of the Earth and in very poor", "\t    shape to continue your quest since you're dead.", "", "  Bats   -- As with any other cave, the Wumpus cave has bats in residence.", "\t    These are a bit more potent, however, and if you stumble into", "\t    one of their rooms they will rush up and carry you elsewhere in", "\t    the cave.", "", "  Wumpus -- If you happen to walk into the room the Wumpus is in you'll find", "\t    that he has quite an appetite for young adventurous humans!  Not", "\t    recommended.", "", "The Wumpus, by the way, is not bothered by the hazards since he has sucker", "feet and is too big for a bat to lift.  If you try to shoot him and miss,", "there's also a chance that he'll up and move himself into another cave,", "though by nature the Wumpus is a sedentary creature.", "", "Each turn you may either move or shoot a crooked arrow.  Moving is done", "simply by specifying \"m\" for move and the number of the room that you'd", "like to move down a tunnel towards.  Shooting is done similarly; indicate", "that you'd like to shoot one of your magic arrows with an \"s\" for shoot,", "then list a set of connected room numbers through which the deadly shaft", "should fly!", "", "If your path for the arrow is incorrect, however, it will flail about in", "the room it can't understand and randomly pick a tunnel to continue", "through.  You might just end up shooting yourself in the foot if you're", "not careful!  On the other hand, if you shoot the Wumpus you've WON!", "", "Good luck."];
function* wump(argv){
  var EXIT=run.EXIT,level=1,arrow_num=5,bat_num=3,pit_num=3,room_num=20,link_num=3,i,j;
  function die(m){P.typeLine(m,'err');throw EXIT}
  for(i=0;i<argv.length;i++){
    var o=argv[i];
    if(o==='-a')arrow_num=atoi(argv[++i]);
    else if(o==='-b')bat_num=atoi(argv[++i]);
    else if(o==='-h')level=2;
    else if(o==='-p')pit_num=atoi(argv[++i]);
    else if(o==='-r'){
      room_num=atoi(argv[++i]);
      if(room_num<10)die("No self-respecting wumpus would live in such a small cave!");
      if(room_num>250)die("Even wumpi can't furnish caves that large!");
    }
    else if(o==='-t'){
      link_num=atoi(argv[++i]);
      if(link_num<2)die('Wumpi like extra doors in their caves!');
    }
    else die('usage: wump [-h] [-a arrows] [-b bats] [-p pits] [-r rooms] [-t tunnels]');
  }
  if(link_num>25||link_num>room_num-Math.trunc(room_num/4)){say("Too many tunnels!  The cave collapsed!\n(Fortunately, the wumpus escaped!)");return}
  if(level===2){bat_num+=ran(Math.trunc(room_num/2))+1;pit_num+=ran(Math.trunc(room_num/2))+1}
  if(bat_num>room_num/2)die('The wumpus refused to enter the cave, claiming it was too crowded!');
  if(pit_num>room_num/2)die('The wumpus refused to enter the cave, claiming it was too dangerous!');
  var cave=[],player,wumpus,arrows_left,lastchance=2;
  function gcd(a,b){var r=a%b;return r===0?b:gcd(b,r)}
  function cave_init(){
    var i,j,k,lnk,delta;
    cave=[];
    for(i=0;i<=room_num;i++){
      cave.push({tunnel:[],pit:false,bat:false});
      for(j=0;j<link_num;j++)cave[i].tunnel[j]=-1;
    }
    do{delta=ran(room_num-1)+1}while(gcd(room_num,delta+1)!==1);
    for(i=1;i<=room_num;i++){
      lnk=((i+delta)%room_num)+1;
      cave[i].tunnel[0]=lnk;
      cave[lnk].tunnel[1]=i;
    }
    for(i=1;i<=room_num;i++){
      for(j=2;j<link_num;j++){
        if(cave[i].tunnel[j]!==-1)continue;
        do{lnk=ran(room_num)+1}while(cave[i].tunnel.slice(0,j).indexOf(lnk)>=0);
        cave[i].tunnel[j]=lnk;
        if(ran(2)===1)continue;
        for(k=0;k<link_num;k++){
          if(cave[lnk].tunnel[k]===i)break;
          if(cave[lnk].tunnel[k]===-1){cave[lnk].tunnel[k]=i;break}
        }
      }
    }
    for(i=1;i<=room_num;i++)cave[i].tunnel.sort(function(a,b){return a-b});
  }
  function nearby(what){
    return cave[player].tunnel.some(function(t){return t>=1&&t<=room_num&&cave[t][what]});
  }
  function wump_nearby(){
    return cave[player].tunnel.some(function(t){
      return t===wumpus||(t>=1&&t<=room_num&&cave[t].tunnel.indexOf(wumpus)>=0);
    });
  }
  function move_wump(){wumpus=cave[wumpus].tunnel[ran(link_num)]}
  function wump_kill(){say("*ROAR* *chomp* *snurfle* *chomp*!\nMuch to the delight of the Wumpus, you walked right into his mouth,\nmaking you one of the easiest dinners he's ever had!  For you, however,\nit's a rather unpleasant death.  The only good thing is that it's been\nso long since the evil Wumpus cleaned his teeth that you immediately\npassed out from the stench!")}
  function* move_to(room){
    var next=atoi(room),moved=false;
    if(next===room_num+1&&cave[player].tunnel[link_num-1]!==next)next++;
    while(next<1||next>room_num+1){
      if(next<0&&next!==-1)P.typeLine("Sorry, but we're constrained to a semi-Euclidean cave!");
      if(next>room_num+1)P.typeLine("What?  The cave surely isn't quite that big!");
      if(next===room_num+1&&cave[player].tunnel[link_num-1]!==next){P.typeLine("What?  The cave isn't that big!");next++}
      var a=yield 'To which room do you wish to move? ';
      if(a===null)return 1;
      next=atoi(a);
    }
    if(cave[player].tunnel.indexOf(next)<0){
      P.typeLine('*Oof!*  (You hit the wall)');
      if(ran(6)===1){
        P.typeLine('Your colorful comments awaken the wumpus!');
        move_wump();
        if(wumpus===player){wump_kill();return 1}
      }
      return 0;
    }
    if(next===room_num+1){
      next=ran(room_num)+1;
      say("\nWith a jaunty step you enter the magic tunnel.  As you do, you\nnotice that the walls are shimmering and glowing.  Suddenly you feel\na very curious, warm sensation and find yourself in room "+next+"!!");
    }
    player=next;
    for(;;){
      if(next===wumpus){wump_kill();return 1}
      if(cave[next].pit){
        if(ran(12)<2){
          say("Without conscious thought you grab for the side of the cave and manage\nto grasp onto a rocky outcrop.  Beneath your feet stretches the limitless\ndepths of a bottomless pit!  Rock crumbles beneath your feet!");
          return 0;
        }
        say("*AAAUUUUGGGGGHHHHHhhhhhhhhhh...*\nThe whistling sound and updraft as you walked into this room of the\ncave apparently wasn't enough to clue you in to the presence of the\nbottomless pit.  You have a lot of time to reflect on this error as\nyou fall many miles to the core of the earth.  Look on the bright side;\nyou can at least find out if Jules Verne was right...");
        return 1;
      }
      if(cave[next].bat){
        P.typeLine('*flap*  *flap*  *flap*  (humongous bats pick you up and move you'+(moved?' again':'')+'!)');
        next=player=ran(room_num)+1;
        moved=true;
      }
      else break;
    }
    return 0;
  }
  function shoot(list){
    var W=list.split(/[ \t]+/).filter(Boolean),at=player,count;
    for(count=1;;count++){
      var p=W[count-1];
      if(p===undefined){
        if(count===1){P.typeLine('The arrow falls to the ground at your feet!');return 0}
        break;
      }
      if(count>5){P.typeLine('The arrow wavers in its flight and and can go no further!');break}
      var next=atoi(p);
      if(cave[at].tunnel.indexOf(next)>=0){
        if(next>room_num){
          P.typeLine('A faint gleam tells you the arrow has gone through a magic tunnel!');
          at=ran(room_num)+1;
        }
        else at=next;
      }
      else{
        var lnk=ran(link_num);
        if(lnk===player)say("*thunk*  The arrow can't find a way from "+at+" to "+next+" and flies back into\nyour room!");
        else if(cave[at].tunnel[lnk]>room_num)say("*thunk*  The arrow flies randomly into a magic tunnel, thence into\nroom "+cave[at].tunnel[lnk]+"!");
        else say("*thunk*  The arrow can't find a way from "+at+" to "+next+" and flies randomly\ninto room "+cave[at].tunnel[lnk]+"!");
        at=cave[at].tunnel[lnk];
        break;
      }
      var chance=ran(10);
      if(count===3&&chance<2){say("Your bowstring breaks!  *twaaaaaang*\nThe arrow is weakly shot and can go no further!");break}
      if(count===4&&chance<6){P.typeLine('The arrow wavers in its flight and and can go no further!');break}
    }
    if(at===wumpus){
      say("*thwock!* *groan* *crash*\n\nA horrible roar fills the cave, and you realize, with a smile, that you\nhave slain the evil Wumpus and won the game!  You don't want to tarry for\nlong, however, because not only is the Wumpus famous, but the stench of\ndead Wumpus is also quite well known, a stench plenty enough to slay the\nmightiest adventurer at a single whiff!!");
      return 1;
    }
    if(at===player){
      say("\n*Thwack!*  A sudden piercing feeling informs you that the ricochet\nof your wild arrow has resulted in it wedging in your side, causing\nextreme agony.  The evil Wumpus, with its psychic powers, realizes this\nand immediately rushes to your side, not to help, alas, but to EAT YOU!\n(*CHOMP*)");
      return 1;
    }
    if(!--arrows_left){
      say("\nYou turn and look at your quiver, and realize with a sinking feeling\nthat you've just shot your last arrow (figuratively, too).  Sensing this\nwith its psychic powers, the evil Wumpus rampages through the cave, finds\nyou, and with a mighty *ROAR* eats you alive!");
      return 1;
    }
    if(ran(level===1?12:9)<(lastchance+=2)){
      move_wump();
      if(wumpus===player)wump_kill();
      lastchance=ran(3);
    }
    return 0;
  }
  function* getans(q){
    for(;;){
      var a=yield q;
      if(a===null)return false;
      var c=a.charAt(0);
      if(c==='N'||c==='n')return false;
      if(c==='Y'||c==='y')return true;
      P.typeLine("I don't understand your answer; please enter 'y' or 'n'!");
    }
  }
  if(yield* getans('Instructions? (y-n) '))P.say(WUMPINFO);
  cave_init();
  say('\nYou\'re in a cave with '+room_num+' rooms and '+link_num+' tunnels leading from each room.\nThere are '+bat_num+' bat'+plural(bat_num)+' and '+pit_num+' pit'+plural(pit_num)+' scattered throughout the cave, and your\nquiver holds '+arrow_num+' custom super anti-evil Wumpus arrows.  Good luck.');
  for(;;){
    for(i=1;i<=room_num;i++)cave[i].bat=cave[i].pit=false;
    var loc;
    for(i=0;i<bat_num;i++){do{loc=ran(room_num)+1}while(cave[loc].bat);cave[loc].bat=true}
    for(i=0;i<pit_num;i++){do{loc=ran(room_num)+1}while(cave[loc].pit||cave[loc].bat);cave[loc].pit=true}
    wumpus=ran(room_num)+1;
    i=0;
    do{player=ran(room_num)+1;i++}
    while(i<=100&&(player===wumpus||cave[player].pit||cave[player].bat||(level===2&&link_num/room_num<.4&&wump_nearby())));
    arrows_left=arrow_num;
    var e=0;
    do{
      var L=['','You are in room '+player+' of the cave, and have '+arrows_left+' arrow'+plural(arrows_left)+' left.'];
      if(nearby('bat'))L.push('*rustle* *rustle* (must be bats nearby)');
      if(nearby('pit'))L.push('*whoosh* (I feel a draft from some pits).');
      if(wump_nearby())L.push('*sniff* (I can smell the evil Wumpus nearby!)');
      var T=cave[player].tunnel,s='There are tunnels to rooms '+T[0]+', ';
      for(j=1;j<link_num-1;j++)if(T[j]<=room_num)s+=T[j]+', ';
      L.push(s+'and '+T[link_num-1]+'.');
      P.say(L);
      var ans=yield 'Move or shoot? (m-s) ';
      if(ans===null){e=2;break}
      var c=ans.charAt(0);
      if(c==='M'||c==='m')e=yield* move_to(ans.slice(1));
      else if(c==='S'||c==='s')e=shoot(ans.slice(1));
      else if(c==='Q'||c==='q'||c==='x')return;
      else if(ans==='')e=0;
      else{P.typeLine(ran(15)===1?'Que pasa?':"I don't understand!");e=0}
    }while(!e);
    if(e===2)return;
    P.typeLine('');
    if(!(yield* getans('Care to play another game? (y-n) ')))return;
    if(!(yield* getans('In the same cave? (y-n) ')))cave_init();
  }
}
game('wump',function(a,raw,w){
  if(P.piped()){P.typeLine('wump: needs a terminal','err');return}
  run(wump(w.slice(1)));
});

/* ---------- number: spell it out ---------- */
var N1=['','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
var N2=['','ten','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
var N3=['hundred','thousand','million','billion','trillion','quadrillion','quintillion','sextillion','septillion','octillion','nonillion','decillion','undecillion','duodecillion','tredecillion','quattuordecillion','quindecillion','sexdecillion','septendecillion','octodecillion','novemdecillion','vigintillion'];
function convert(line,lflag){
  var o='',m=line.trim().match(/^(-?)(\d*)(?:\.(\d*))?$/);
  if(!m||(!m[2]&&m[3]===undefined&&!m[1]))return null;
  function number(p,len){
    var rv=0,i=0,val;
    if(len===3){
      if(p.charAt(0)!=='0'){rv=1;o+=N1[+p.charAt(0)]+' hundred'}
      i=1;len=2;
    }
    if(len===2){
      val=+p.substr(i,2);
      if(val){
        if(rv)o+=' ';
        if(val<20)o+=N1[val];
        else{
          o+=N2[Math.trunc(val/10)];
          if(val%10)o+='-'+N1[val%10];
        }
        rv=1;
      }
    }
    else if(len===1&&p.charAt(0)!=='0'){rv=1;o+=N1[+p.charAt(0)]}
    return rv;
  }
  function unit(p){
    var len=p.length,rv=0,at=0,off;
    if(len>3){
      if(len%3){
        off=len%3;
        len-=off;
        if(number(p.slice(0,off),off)){rv=1;o+=' '+N3[len/3]+(lflag?' ':'.\n')}
        at=off;
      }
      for(;len>3;at+=3){
        len-=3;
        if(number(p.substr(at,3),3)){rv=1;o+=' '+N3[len/3]+(lflag?' ':'.\n')}
      }
    }
    if(number(p.slice(at),len)){if(!lflag)o+='.\n';rv=1}
    return rv;
  }
  var whole=m[2],fr=m[3]||'';
  if(whole.length>65||fr.length>65)return 'number too large, max 65 digits.';
  if(m[1])o+='minus'+(lflag?' ':'\n');
  var rv=whole.length?unit(whole):0;
  if(fr&&/[^0]/.test(fr)){
    if(rv)o+=(lflag?' ':'')+'and'+(lflag?' ':'\n');
    if(unit(fr)){
      if(lflag)o+=' ';
      var len=fr.length;
      o+=len===1?'tenths.\n':len===2?'hundredths.\n':['','ten-','hundred-'][len%3]+N3[Math.trunc(len/3)]+'ths.\n';
      rv=1;
    }
  }
  if(!rv)o+='zero'+(lflag?'':'.\n');
  if(lflag)o+='\n';
  return o;
}
game('number',function(a){
  var l=a.indexOf('-l')>=0,N=a.filter(function(x){return x!=='-l'});
  function all(L){
    L.forEach(function(x,i){
      var o=convert(x,l);
      if(o===null){P.typeLine('number: illegal number: '+x,'err');return}
      if(i)P.typeLine('...');
      P.say(o.replace(/\n$/,'').split('\n'));
    });
  }
  if(N.length)all(N);else P.input([],all);
});

/* ---------- primes and factor ---------- */
function isPrime(n){
  if(n<2)return false;
  if(n%2===0)return n===2;
  for(var d=3;d*d<=n;d+=2)if(n%d===0)return false;
  return true;
}
game('primes',function(a){
  function go(start,stop){
    var n=Math.max(start,2),made=0;
    if(n>Number.MAX_SAFE_INTEGER||stop!==Infinity&&stop>Number.MAX_SAFE_INTEGER){P.typeLine('primes: ouch.','err');return}
    (function batch(){
      P.queue(function(){
        var L=[],t0=Date.now();
        while(L.length<24&&n<stop&&Date.now()-t0<50){if(isPrime(n))L.push(String(n));n++} /* a batch is short in time too, so big numbers don't block */
        P.say(L);
        made+=L.length;
        if(n>=stop||(P.piped()&&made>=10000))return; /* nothing here can tell it the reader has had enough */
        P.queue(function(){return P.sleep(0)}); /* so that ctrl-c can reach it */
        batch();
      });
    })();
  }
  if(a.some(function(x){return x.charAt(0)==='-'})){P.typeLine('primes: negative numbers aren\'t permitted.','err');return}
  if(a.some(function(x){return !/^\d+$/.test(x)})){P.typeLine('primes: '+a.filter(function(x){return !/^\d+$/.test(x)})[0]+': illegal numeric format.','err');return}
  if(a.length>2){P.typeLine('usage: primes [start [stop]]');return}
  if(a.length){go(+a[0],a[1]===undefined?Infinity:+a[1]);return}
  P.input([],function(L){if(L[0])go(atoi(L[0]),Infinity)});
});
game('factor',function(a){
  function one(x){
    if(!/^\d+$/.test(x)){P.typeLine('factor: '+x+': illegal numeric format.','err');return}
    var n=+x;
    if(n===0)return;
    if(n===1){P.typeLine('1: 1');return}
    if(n>Number.MAX_SAFE_INTEGER){P.typeLine('factor: ouch.','err');return}
    var o=x+':',d=2;
    while(d*d<=n){
      if(n%d===0){o+=' '+d;n/=d}
      else d+=d===2?1:2;
    }
    if(n>1)o+=' '+n;
    P.typeLine(o);
  }
  if(a.length)a.forEach(one);
  else P.input([],function(L){L.forEach(function(x){if(x.trim())one(x.trim())})});
});

/* ---------- banner: the big letters, sideways, as it always was ---------- */
game('banner',function(a,raw,words){
  var w=words.slice(1),width=Math.min(132,P.columns()),DW=132;
  if(w[0]==='-w'){
    width=atoi(w[1]);
    w=w.slice(2);
    if(width<=0||width>DW){P.typeLine('banner: illegal argument for -w option','err');return}
  }
  function print(msg){
    var i,j,F=P.bannerFont,on=[],out=[];
    for(i=0;i<width;i++)on[Math.trunc(i*DW/width)]=true;
    for(i=0;i<msg.length;i++){
      var c=msg.charCodeAt(i);
      if(c>=128||!F.ptr[c]){P.typeLine("banner: The character '"+msg.charAt(i)+"' is not in my character set",'err');return}
    }
    var line=[];
    for(j=0;j<DW;j++)line[j]=' ';
    for(i=0;i<msg.length;i++){
      var pc=F.ptr[msg.charCodeAt(i)],term=0,max=0,linen=0,x,y;
      while(!term){
        x=F.table[pc];
        if(x>=128){
          if(x>192)term++;
          x&=63;
          while(x--){
            if(on[linen++]){
              var s='';
              for(j=0;j<=max;j++)if(on[j])s+=line[j];
              out.push(s.trimEnd());
            }
          }
          for(j=0;j<DW;j++)line[j]=' ';
          pc++;
        }
        else{
          y=F.table[pc+1];
          max=x+y;
          while(x<max)line[x++]='#';
          pc+=2;
        }
      }
    }
    out.forEach(function(s){P.typeLine(s,'',null,{speed:.04})});
  }
  P.queue(function(){return P.load('banner-font.js')});
  P.queue(function(){
    if(!P.bannerFont){P.typeLine('banner: cannot execute','err');return}
    if(w.length)print(w.join(' '));
    else P.input([],function(L){if(L[0])print(L[0])});
  });
});

/* ---------- hangman, by Ken Arnold ---------- */
var WORDS='accumulator,assembler,backplane,bandwidth,bootstrap,breakpoint,compiler,console,controller,coroutine,cylinder,daemon,debugger,decimal,diskette,dispatcher,ethernet,filesystem,firmware,flipflop,floppy,gateway,hexadecimal,hollerith,interrupt,inverter,iteration,kernel,keyboard,linotype,loader,macroassembler,magnetic,mainframe,manual,memory,microcode,minicomputer,modem,multiplexer,nanosecond,octal,operator,oscilloscope,overflow,paper,parity,phosphor,pointer,printer,processor,punchcard,recursion,register,regular,resistor,scheduler,segment,semaphore,simulator,sorting,spooler,stack,subroutine,superuser,swapper,syntax,teletype,terminal,timesharing,toggle,transistor,typewriter,unibus,variable,vector,virtual,wirewrap,workstation'.split(',');
function Hangman(S,done){
  var word,known,errors,guessed,wordnum=0,average=0,msg='',asking=false;
  var NOOSE=['     ______','     |    |','     |','     |','     |','     |','   __|_____','   |      |___','   |_________|'];
  var ERR=[[2,10,'O'],[3,10,'|'],[4,10,'|'],[5,9,'/'],[3,9,'/'],[3,11,'\\'],[5,11,'\\']];
  function fresh(){
    word=WORDS[ran(WORDS.length)];
    known=word.replace(/./g,'-');
    errors=0;guessed={};msg='';asking=false;wordnum++;
  }
  function draw(){
    var C=[],y,X=Math.max(16,S.cols-1-26),i;
    for(i=0;i<S.rows;i++)C.push('');
    function put(r,x,t){
      if(r>=S.rows)return;
      C[r]=(C[r].padEnd(x)).slice(0,x)+t+C[r].slice(x+t.length);
    }
    NOOSE.forEach(function(l,r){put(r,0,l)});
    for(i=0;i<errors&&i<7;i++)put(ERR[i][0],ERR[i][1],ERR[i][2]);
    var G=Object.keys(guessed).sort().join('');
    put(2,X,'Guessed: '+G);
    put(4,X,'Word #:          '+wordnum);
    put(5,X,'Current Average: '+((average*(wordnum-1)+errors)/wordnum).toFixed(3));
    put(6,X,'Overall Average: '+average.toFixed(3));
    put(10,1,'Word: '+known);
    put(11,0,asking?'':'Guess:');
    if(msg){msg.split('\n').forEach(function(l,i){put(12+i,0,l)})}
    S.draw(C,asking?13:11,asking?14:7);
    S.say(asking?msg:'word '+known+', guess a letter. '+msg);
  }
  fresh();draw();
  return {draw:draw,feed:function(k){
    if(k==='C-c'||k==='C-d'){S.close();done();return}
    if(asking){
      if(k==='n'){S.close();done();return}
      if(k==='y'){average=(average*(wordnum-1)+Math.min(errors,9))/wordnum;fresh();draw();return}
      msg=msg.split('\n').slice(0,2).join('\n')+"\nPlease type 'y' or 'n'";
      draw();
      return;
    }
    if(k.length!==1)return;
    var ch=k.toLowerCase();
    if(!/[a-z]/.test(ch)){msg="Not a valid guess: '"+k+"'";draw();return}
    if(guessed[ch]){msg="Already guessed '"+ch+"'";draw();return}
    msg='';
    guessed[ch]=true;
    var hit=false,K=known.split('');
    for(var i=0;i<word.length;i++)if(word.charAt(i)===ch){K[i]=ch;hit=true}
    known=K.join('');
    if(!hit)errors++;
    if(errors>=7||known.indexOf('-')<0){
      if(errors>=7)errors=9;
      msg=(errors>7?'Sorry, the word was "'+word+'"':'You got it!')+'\nAnother word? ';
      asking=true;
    }
    draw();
  }};
}
function tooSmall(S,done,last,msg){ /* leave at once, once the program is under way */
  setTimeout(function(){if(msg)last.push(msg);S.close();done()},0);
  return {feed:function(){},draw:function(){}};
}
function fullProgram(name,make){
  return function(a,raw,w){
    if(P.piped()){P.typeLine(name+': needs a terminal','err');return}
    var last=[];
    P.program(function(S,res){return make(S,res,w.slice(1),last)});
    P.queue(function(){P.say(last)}); /* its parting words, once the glass is back */
  };
}
game('hangman',fullProgram('hangman',Hangman));

/* ---------- worm, by Michael Toy ---------- */
function Worm(S,done,argv,last){
  var start=atoi(argv[0]),LINES=S.rows,COLS=S.cols,HEAD='@',BODY='o',RUN=8;
  if(COLS<18||LINES<5)return tooSmall(S,done,last);
  if(start<=0||start>Math.trunc((LINES-3)*(COLS-2)/3))start=7;
  var tv=[],growing=0,running=0,score=0,lastch='',body=[],timer=null,over=false,visible;
  var i,y,x;
  for(y=0;y<LINES-1;y++){
    tv.push([]);
    for(x=0;x<COLS-1;x++)tv[y].push(y===0||y===LINES-2||x===0||x===COLS-2?'*':' ');
  }
  function at(p,c){tv[p.y][p.x]=c}
  /* the worm: index 0 is the tail, the last is the head */
  var head={x:start%(COLS-5)+2,y:Math.trunc(LINES/2)},j=1,bp=head;
  body=[head];at(head,HEAD);
  for(i=0;i<start;i++){
    var np;
    if((bp.x<=2&&j===1)||(bp.x>=COLS-4&&j===-1)){j*=-1;np={x:bp.x,y:bp.y+1}}
    else np={x:bp.x-j,y:bp.y};
    body.unshift(np);
    at(np,BODY);
    bp=np;
  }
  visible=start+1;
  function prize(){
    var p,v=ran(9)+1;
    if(visible===(LINES-3)*(COLS-3)-1){finish('You won!');return}
    do{p={y:ran(LINES-3)+1,x:ran(COLS-3)+1}}while(tv[p.y][p.x]!==' ');
    tv[p.y][p.x]=String(v);
  }
  function draw(){
    var top=' Worm'.padEnd(Math.max(5,COLS-12));
    if(score)top+='Score: '+String(score).padStart(3);
    var L=[top];
    for(var y=0;y<LINES-1;y++)L.push(tv[y].join(''));
    var h=body[body.length-1];
    S.draw(L,h.y+1,h.x);
  }
  function arm(){clearTimeout(timer);timer=setTimeout(function(){process(lastch)},1000)}
  function finish(m){
    over=true;clearTimeout(timer);
    S.close();
    last.push('');
    if(m)last.push(m);
    last.push('Your final score was '+score,'');
    done();
  }
  function step(ch){
    clearTimeout(timer);
    var h=body[body.length-1],nx=h.x,ny=h.y;
    switch(ch){
      case 'ArrowLeft':case 'h':nx--;ch='h';break;
      case 'ArrowDown':case 'j':ny++;ch='j';break;
      case 'ArrowUp':case 'k':ny--;ch='k';break;
      case 'ArrowRight':case 'l':nx++;ch='l';break;
      case 'H':nx--;running=RUN;ch='h';break;
      case 'J':ny++;running=Math.trunc(RUN/2);ch='j';break;
      case 'K':ny--;running=Math.trunc(RUN/2);ch='k';break;
      case 'L':nx++;running=RUN;ch='l';break;
      case 'C-l':draw();arm();return;
      case 'C-c':case 'C-d':over=true;S.close();done();return;
      default:if(!running)arm();return;
    }
    lastch=ch;
    if(growing===0){at(body[0],' ');body.shift();visible--}
    else growing--;
    at(h,BODY);
    var c=tv[ny][nx];
    if(/[0-9]/.test(c)){
      growing+=+c;
      prize();
      if(over)return;
      score+=growing;
      running=0;
    }
    else if(c!==' '){finish('Well, you ran into something and the game is over.');return}
    var nh={x:nx,y:ny};
    body.push(nh);
    at(nh,HEAD);
    visible++;
    if(!running)arm();
  }
  function process(ch){
    if(over)return;
    step(ch);
    while(running&&!over){running--;step(lastch)}
    if(!over)draw();
  }
  prize();
  draw();
  arm();
  return {draw:draw,feed:process};
}
game('worm',fullProgram('worm',Worm));

/* ---------- robots: run from them, and make them hit each other ---------- */
function Robots(S,done,argv,last){
  var flags=argv.join(''),Start=/a/.test(flags)?4:1,Tele=/t/.test(flags),games=1+(flags.match(/n/g)||[]).length;
  var YF=S.rows-1,XF=Math.min(60,S.cols-21);
  if(XF<20||YF<12)return tooSmall(S,done,last,'Need at least a 12x41 screen');
  var DESC=['Directions:','','y k u',' \\|/','h- -l',' /|\\','b j n','','Commands:','','w:  wait for end','t:  teleport','q:  quit','^L: redraw screen','','Legend:','','+:  robot','*:  junk heap','@:  you','','Score: 0'];
  if(S.rows<24)DESC=DESC.filter(function(l){return l});
  var MAX=40,field,robots,scrap,me,level,score,dead,waiting,running,runch,count,cnt,num,wb,msg,bonus,query=null,timer=null,best=0,tele=false,over=false,bx=[];
  function rnd(){
    var y,x;
    do{y=ran(YF-1)+1;x=ran(XF-1)+1}while(field[y][x]!==0);
    return {y:y,x:x};
  }
  function make(){
    var i;
    field=[];
    for(i=0;i<=YF;i++){field.push([]);for(var x=0;x<=XF;x++)field[i].push(0)}
    robots=[];scrap=[];waiting=false;wb=0;running=false;count=0;
    num=Math.min(level*10,MAX);
    for(i=0;i<num;i++){var p=rnd();robots.push(p);field[p.y][p.x]++}
    me=rnd();
  }
  function init(){dead=false;waiting=false;score=0;level=Start;bx=[];make()}
  function draw(){
    var C=S.grid(),y,x;
    function put(r,c,t){for(var i=0;i<t.length;i++)if(r>=0&&r<S.rows&&c+i<S.cols)C[r][c+i]=t.charAt(i)}
    put(0,0,'+'+'-'.repeat(XF-1)+'+');put(YF,0,'+'+'-'.repeat(XF-1)+'+');
    for(y=1;y<YF;y++){put(y,0,'|');put(y,XF,'|')}
    DESC.forEach(function(l,i){put(i,XF+2,l)});
    var sr=DESC.length-1;
    put(sr,XF+9,String(score));
    if(tele)put(DESC.length,XF+2,'Teleport!');
    scrap.forEach(function(p){put(p.y,p.x,'*')});
    robots.forEach(function(p){if(p.y>=0)put(p.y,p.x,'+')});
    put(me.y,me.x,'@');
    if(dead)put(me.y,me.x,'AARRrrgghhhh....'.slice(0,Math.max(0,XF-me.x)));
    bx.forEach(function(t,i){put(DESC.length+1+i,XF+2,t)});
    if(query)put(YF-1,XF+2,query.q);
    S.drawGrid(C,me.y,me.x);
    S.say(query?query.q:num+' robots, level '+level+', score '+score);
  }
  function eaten(p){
    for(var y=p.y-1;y<=p.y+1;y++){
      if(y<=0||y>=YF)continue;
      for(var x=p.x-1;x<=p.x+1;x++){
        if(x<=0||x>=XF)continue;
        if(field[y][x]===1)return true;
      }
    }
    return false;
  }
  function must(){
    for(var dy=-1;dy<=1;dy++)for(var dx=-1;dx<=1;dx++){
      var p={y:me.y+dy,x:me.x+dx};
      if(p.y<=0||p.y>=YF||p.x<=0||p.x>=XF||field[p.y][p.x]>0)continue;
      if(!eaten(p))return false;
    }
    return true;
  }
  function moveRobots(){
    robots.forEach(function(r){
      if(r.y<0)return;
      field[r.y][r.x]--;
      r.y+=Math.sign(me.y-r.y);
      r.x+=Math.sign(me.x-r.x);
      r.y=Math.max(0,Math.min(YF-1,r.y));
      r.x=Math.max(0,Math.min(XF-1,r.x));
      field[r.y][r.x]++;
    });
    robots.forEach(function(r){
      if(r.y<0)return;
      if(r.y===me.y&&r.x===me.x)dead=true;
      else if(field[r.y][r.x]>1){
        scrap.push({y:r.y,x:r.x});
        r.y=-1;
        num--;
        if(waiting)wb++;
        score+=10;
      }
    });
    if(field[me.y][me.x]>0&&!dead)dead=true;
  }
  function record(){ /* the score file: ten best, kept in this browser */
    var T=robotScores(),me2=P.st.user;
    T.push({n:me2,s:score});
    T.sort(function(a,b){return b.s-a.s});
    T=T.slice(0,10);
    P.save('robots/scores',T);
    bx=['Scores:'].concat(T.slice(0,Math.max(1,YF-DESC.length-5)).map(function(t,i){return String(i+1).padStart(2)+' '+String(t.s).padStart(5)+' '+t.n.slice(0,8)}));
  }
  function ended(){
    if(score>best)best=score;
    if(!dead)return;
    record();
    running=false;count=0;waiting=false;
    if(--games>0){clearTimeout(timer);timer=setTimeout(function(){init();draw()},1200);return}
    query={q:'Another game?',fn:function(y){
      query=null;
      if(y){games=1;init();draw();return}
      quit();
    }};
  }
  function quit(){
    over=true;clearTimeout(timer);
    last.push('Your best score was '+best);
    S.close();done();
  }
  function afterMove(){
    if(field[me.y][me.x]!==0)dead=true;
    if(!dead)moveRobots();
    if(dead){ended();return}
    if(num<=0){
      bx=[];
      if(level===Start&&Start>1){bx.push('Advance bonus: 600');score+=600}
      if(wb){bx.push('Wait bonus: '+wb);score+=wb}
      level++;
      make();
    }
  }
  function doMove(dy,dx){
    var p={y:me.y+dy,x:me.x+dx};
    if(p.y<=0||p.y>=YF||p.x<=0||p.x>=XF||field[p.y][p.x]>0||eaten(p)){
      if(running)running=false;
      else{P.click(1,420);count=0}
      return false;
    }
    if(dy===0&&dx===0)return true;
    me=p;
    return true;
  }
  var DIR={' ':[0,0],'.':[0,0],y:[-1,-1],k:[-1,0],u:[-1,1],h:[0,-1],l:[0,1],b:[1,-1],j:[1,0],n:[1,1]};
  function act(c){
    if(Tele&&must())c='t';
    var d=DIR[c];
    if(d){
      if(doMove(d[0],d[1])){afterMove();if(count>0)count--;return true}
      return false;
    }
    if(/^[YUHJKLBN>]$/.test(c)){running=true;runch=c==='>'?' ':c.toLowerCase();return true}
    if(c==='q'||c==='Q'){query={q:'Really quit?',fn:function(y){query=null;if(y)quit();else draw()}};return false}
    if(c==='w'||c==='W'){waiting=true;afterMove();return true}
    if(c==='t'||c==='T'){
      running=false;
      me=rnd();
      tele=true;
      draw();
      busy=true;
      setTimeout(function(){tele=false;busy=false;if(over)return;afterMove();go()},600);
      return false;
    }
    if(c==='C-l')return false;
    P.click(1,420);count=0;
    return false;
  }
  var busy=false;
  function go(){ /* keep going by itself while running, counting or waiting */
    clearTimeout(timer);
    if(over)return;
    draw();
    if(busy||dead||query)return;
    if(!running&&!waiting&&!count)return;
    timer=setTimeout(function(){
      if(over||busy||dead||query)return;
      if(waiting)afterMove();
      else if(running){var d=DIR[runch];if(doMove(d[0],d[1]))afterMove()}
      else if(count)act(cnt);
      go();
    },running?40:waiting?90:60);
  }
  var digits='';
  init();draw();
  return {draw:draw,feed:function(k){
    if(k==='C-c'){quit();return}
    if(busy)return;
    if(query){
      if(k.length!==1)return;
      query.fn(k==='y'||k==='Y');
      if(!over)go();
      return;
    }
    if(dead||waiting||running)return;
    if(k.length!==1&&k.indexOf('C-')!==0)return;
    if(/^[0-9]$/.test(k)){digits+=k;return}
    bx=[];
    if(digits){count=+digits;cnt=k;digits='';if(!act(cnt))count=0;go();return}
    act(k);
    go();
  }};
}
function robotScores(){ /* whatever is in the browser, as long as it is scores */
  var T=P.saved('robots/scores');
  return Array.isArray(T)?T.filter(function(t){return t&&typeof t.s==='number'&&typeof t.n==='string'}):[];
}
game('robots',function(a,raw,w){
  if(a.join('').indexOf('s')>=0&&a.every(function(x){return x.charAt(0)==='-'})){
    var T=robotScores();
    P.say(T.length?T.map(function(t,i){return String(i+1).padStart(2)+' '+String(t.s).padStart(5)+' '+t.n}):['No scores']);
    return;
  }
  fullProgram('robots',Robots)(a,raw,w);
});

/* ---------- snake: get the money and get out, with a snake after you ---------- */
function Snake(S,done,argv,last){
  var lcnt=S.rows-2,ccnt=S.cols-2,i,moves=0,loot=0,penalty=0,fast=true,oldw=0,repeat=1,lastc='',pending='',busy=false,over=false,overlay=[],flash='';
  for(i=0;i<argv.length;i++){
    if(argv[i]==='-w')ccnt=Math.min(ccnt,atoi(argv[++i])||ccnt);
    else if(argv[i]==='-l')lcnt=Math.min(lcnt,atoi(argv[++i])||lcnt);
    else if(argv[i]==='-t')fast=false;
  }
  var mn=Math.min(lcnt,ccnt);
  if(mn<4)return tooSmall(S,done,last,'snake: screen too small for a fair game.');
  if(mn<12)mn=12;
  mn+=2;
  var chunk=Math.trunc(675/(mn+6)+2.5);
  var you={col:0,line:0},money={col:0,line:0},finish={col:0,line:0},snake=[];
  for(i=0;i<6;i++)snake.push({col:0,line:0});
  function same(a,b){return a.line===b.line&&a.col===b.col}
  function cash(){return Math.trunc(chunk*(loot-penalty)/25)}
  function snrand(){
    for(;;){
      var p={col:ran(ccnt),line:ran(lcnt)};
      if(p.line===0&&p.col<5)continue;
      if(same(p,you)||same(p,money)||same(p,finish))continue;
      if(snake.some(function(s){return same(p,s)}))continue;
      return p;
    }
  }
  var MX=[0,1,1,1,0,-1,-1,-1],MY=[-1,-1,0,1,1,1,0,-1],ABS=[1,1.4,1,1.4,1,1.4,1,1.4];
  function chase(sp){
    var dc=you.col-sp.col,dl=you.line-sp.line,v1=Math.sqrt(dc*dc+dl*dl),w=0,max=0,i,wt=[],vp;
    for(i=0;i<8;i++){
      vp=dc*MX[i]+dl*MY[i];
      vp=v1>0?vp/(v1*ABS[i]):1;
      if(vp>max){max=vp;w=i}
    }
    for(i=0;i<8;i++){
      var d={col:sp.col+MX[i],line:sp.line+MY[i]};
      wt[i]=0;
      if(d.col<0||d.col>=ccnt||d.line<0||d.line>=lcnt||same(d,money)||same(d,finish))continue;
      wt[i]=i===w?Math.trunc(loot/10):1;
      if(i===oldw)wt[i]+=Math.trunc(loot/20);
    }
    var total=0;for(i=0;i<8;i++)total+=wt[i];
    vp=total?ran(1024)%total:0;
    for(i=0;i<8;i++){if(vp<wt[i])break;vp-=wt[i]}
    if(i===8)for(i=0;i<7&&wt[i]===0;i++);
    oldw=i;
    return {col:sp.col+MX[i],line:sp.line+MY[i]};
  }
  function draw(){
    var C=S.grid(),y;
    function pc(p,c){var r=p.line+1,x=p.col+1;if(r>=0&&r<S.rows&&x>=0&&x<S.cols)C[r][x]=c}
    if(flash){
      flash.split('').forEach(function(c,i){C[Math.trunc(S.rows/2)][Math.max(0,Math.trunc(S.cols/2)-8)+i]=c});
      S.drawGrid(C,you.line+1,you.col+1);
      return;
    }
    function edge(r,x,c){if(r<S.rows&&x<S.cols)C[r][x]=c} /* the glass may have shrunk since the game began */
    for(y=1;y<=ccnt;y++){edge(0,y,'-');edge(lcnt+1,y,'-')}
    for(y=0;y<=lcnt+1;y++){edge(y,0,'|');edge(y,ccnt+1,'|')}
    pc(finish,'#');pc(money,'$');
    for(y=5;y>=1;y--)pc(snake[y],'s');
    pc(snake[0],'S');
    if(cash()>0)('$'+cash()).split('').forEach(function(c,i){C[1][1+i]=c});
    pc(you,'I');
    overlay.forEach(function(o){pc(o,o.c)});
    S.drawGrid(C,you.line+1,you.col+1);
    S.say('you $'+cash());
  }
  function post(){ /* best for each visitor name and the record, kept in this browser */
    var R=P.saved('snake/scores'),u=P.st.user,sc=cash();
    if(!R||!R.best||typeof R.best!=='object'||typeof R.high!=='number')R={best:{},who:'',high:0};
    var was=P.has(R.best,u)&&typeof R.best[u]==='number'?R.best[u]:0;
    if(sc>was){R.best[u]=sc;last.push('You bettered your previous best of $'+was)}
    else last.push('Your best to date is $'+was);
    if(sc>R.high||!R.who){
      last.push(R.who?'You beat '+R.who+"'s old record of $"+R.high+'!':'You set a new record!');
      R.high=sc;R.who=u;
    }
    else last.push('The highest is '+R.who+' with $'+R.high);
    P.save('snake/scores',R);
  }
  function quit(){
    over=true;
    last.push('You made '+moves+' moves.');
    S.close();done();
  }
  function warp(bonus){
    you=snrand();
    if(bonus){loot-=penalty;penalty=0}
    else penalty+=Math.trunc(loot/10);
    busy=true;flash=bonus?'BONUS!!!':'SPACE WARP!!!';draw();
    setTimeout(function(){flash='';busy=false;if(!over)draw()},700);
  }
  function eaten(){
    busy=true;
    overlay=[{col:you.col,line:you.line,c:'@'}];
    draw();
    setTimeout(function(){
      if(over)return;
      overlay=[];
      var i=cash()%10,b=ran(10);
      if(b===i){warp(true);return}
      last.push('');
      last.push(loot>=penalty?'You and your $'+cash()+' have been eaten':'The snake ate you.  You owe $'+(-cash())+'.');
      quit();
    },900);
  }
  function push(){
    var tmp=snake[5];
    for(var i=4;i>=0;i--)snake[i+1]=snake[i];
    snake[0]=chase(snake[1]);
    for(i=0;i<6;i++)if(same(snake[i],you)||same(tmp,you)){eaten();return true}
    return false;
  }
  function win(){
    busy=true;
    var x={col:finish.col,line:finish.line},n=fast?10:4,j,k,O=[];
    for(j=1;j<n;j++){
      for(k=0;k<j;k++){O.push({col:x.col,line:x.line,c:'#'});x.line--}
      for(k=0;k<j;k++){O.push({col:x.col,line:x.line,c:'#'});x.col++}
      j++;
      for(k=0;k<j;k++){O.push({col:x.col,line:x.line,c:'#'});x.line++}
      for(k=0;k<j;k++){O.push({col:x.col,line:x.line,c:'#'});x.col--}
    }
    overlay=O;draw();
    setTimeout(function(){
      if(over)return;
      last.push('You have won with $'+cash()+'.');
      post();
      quit();
    },900);
  }
  function snap(){
    function stretch(t){
      var O=[],l,c;
      if(Math.abs(t.col-you.col)<Math.trunc(ccnt/12)&&you.line!==t.line){
        if(you.line<t.line)for(l=you.line+1;l<=t.line;l++)O.push({col:you.col,line:l,c:'v'});
        else for(l=you.line-1;l>=t.line;l--)O.push({col:you.col,line:l,c:'^'});
        return O;
      }
      if(Math.abs(t.line-you.line)<Math.trunc(lcnt/7)&&you.col!==t.col){
        if(you.col<t.col)for(c=you.col+1;c<=t.col;c++)O.push({col:c,line:you.line,c:'>'});
        else for(c=you.col-1;c>=t.col;c--)O.push({col:c,line:you.line,c:'<'});
        return O;
      }
      return null;
    }
    overlay=stretch(money)||stretch(finish)||[{col:you.col,line:you.line,c:'?'}];
    busy=true;draw();
    setTimeout(function(){overlay=[];busy=false;if(!over)draw()},500);
  }
  function step(c,n){
    for(var k=1;k<=n;k++){
      moves++;
      if(/^(s|h|ArrowLeft|Backspace)$/.test(c)){if(you.col>0)you={col:you.col-1,line:you.line}}
      else if(/^(f|l|ArrowRight| )$/.test(c)){if(you.col<ccnt-1)you={col:you.col+1,line:you.line}}
      else if(/^(C-p|e|k|ArrowUp|i)$/.test(c)){if(you.line>0)you={col:you.col,line:you.line-1}}
      else if(/^(C-n|c|j|ArrowDown|Enter|m)$/.test(c)){if(you.line+1<lcnt)you={col:you.col,line:you.line+1}}
      if(same(you,money)){
        loot+=25;
        do{money=snrand()}while(same(money,finish)||(money.col<5&&money.line===0)||same(money,you));
        continue;
      }
      if(same(you,finish)){win();return}
      if(push())return;
    }
    draw();
  }
  finish=snrand();you=snrand();money=snrand();
  snake=[snrand()];
  for(i=1;i<6;i++)snake.push(chase(snake[i-1]));
  draw();
  return {draw:draw,feed:function(k){
    if(over)return;
    if(k==='C-c'){quit();return}
    if(busy)return;
    if(/^[0-9]$/.test(k)){pending+=k;return}
    var c=k;
    if(pending){repeat=+pending;pending=''}
    else if(c!=='.')repeat=1;
    if(c==='.')c=lastc;
    lastc=c;
    switch(c){
      case 'C-d':case 'x':quit();return;
      case 'C-l':draw();return;
      case 'p':case 'd':snap();return;
      case 'w':warp(false);return;
      case 'A':repeat=you.col;c='h';break;
      case 'H':case 'S':repeat=you.col-money.col;c='h';break;
      case 'T':repeat=you.line;c='k';break;
      case 'K':case 'E':repeat=you.line-money.line;c='k';break;
      case 'P':repeat=ccnt-1-you.col;c='l';break;
      case 'L':case 'F':repeat=money.col-you.col;c='l';break;
      case 'B':repeat=lcnt-1-you.line;c='j';break;
      case 'J':case 'C':repeat=money.line-you.line;c='j';break;
    }
    step(c,repeat);
  }};
}
game('snake',fullProgram('snake',Snake));

})(window.Phosphor);
