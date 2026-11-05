/* PHOSPHOR-9 terminal: machine "bsd-1987", small games from the Berkeley distribution: wump,
   number, primes, factor, banner, hangman and worm. Ported to JavaScript for this terminal from
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
    var line;
    P.queue(function(){return P.readLine(r.value||'',true).then(function(l){line=l})});
    P.queue(function(){step(line===P.INT?null:line)});
  })();
}
run.EXIT={};
function game(name,what,syn,desc,fn,by){
  P.command({names:[name],path:'/usr/games',man:{what:what,syn:syn,desc:[desc].concat(by?['',by]:[])},run:fn});
}
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
game('wump','the game of hunt the wumpus','wump [ -h ] [ -a arrows ] [ -b bats ] [ -p pits ] [ -r rooms ] [ -t tunnels ]','hunt the wumpus through a cave of rooms and tunnels. move into a room, or shoot a crooked arrow through several. -h is the hard way.',function(a,raw,w){
  if(P.piped()){P.typeLine('wump: needs a terminal','err');return}
  run(wump(w.slice(1)));
},'by dave taylor, of intuitive systems.');

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
game('number','convert numbers to words','number [ -l ] [ # ... ]','prints each number in words, one piece to a line. -l keeps it on one line.',function(a){
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
game('primes','generate primes','primes [ start [ stop ] ]','prints the primes from start up to stop, or for as long as you let it: ctrl-c stops it.',function(a){
  function go(start,stop){
    var n=Math.max(start,2);
    (function batch(){
      P.queue(function(){
        var L=[];
        while(L.length<24&&n<stop){if(isPrime(n))L.push(String(n));n++}
        P.say(L);
        if(n<stop)batch();
      });
    })();
  }
  if(a.some(function(x){return x.charAt(0)==='-'})){P.typeLine('primes: negative numbers aren\'t permitted.','err');return}
  if(a.some(function(x){return !/^\d+$/.test(x)})){P.typeLine('primes: '+a.filter(function(x){return !/^\d+$/.test(x)})[0]+': illegal numeric format.','err');return}
  if(a.length>2){P.typeLine('usage: primes [start [stop]]');return}
  if(a.length){go(+a[0],a[1]===undefined?Infinity:+a[1]);return}
  P.input([],function(L){if(L[0])go(atoi(L[0]),Infinity)});
});
game('factor','factor a number','factor [ number ... ]','prints each number followed by its prime factors.',function(a){
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
game('banner','print large banner on printer','banner [ -w width ] [ message ... ]','prints the message down the page in large letters. -w sets how wide; the glass is narrower than a line printer.',function(a,raw,words){
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
              out.push(s.replace(/\s+$/,''));
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
  if(w.length)print(w.join(' '));
  else P.input([],function(L){if(L[0])print(L[0])});
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
function fullProgram(name,make){
  return function(a,raw,w){
    if(P.piped()){P.typeLine(name+': needs a terminal','err');return}
    var last=[];
    P.queue(function(){
      return new Promise(function(res){
        var V,S=P.fullscreen(function(k){V.feed(k)},function(){if(V.resize)V.resize();else V.draw()});
        V=make(S,res,w.slice(1),last);
      });
    });
    P.queue(function(){P.say(last)}); /* its parting words, once the glass is back */
  };
}
game('hangman','computer version of the game hangman','hangman','guess the word a letter at a time, before the man is hanged. ctrl-d or ctrl-c to stop.',fullProgram('hangman',Hangman),'by ken arnold.');

/* ---------- worm, by Michael Toy ---------- */
function Worm(S,done,argv,last){
  var start=atoi(argv[0]),LINES=S.rows,COLS=S.cols,HEAD='@',BODY='o',RUN=8;
  if(COLS<18||LINES<5){setTimeout(function(){S.close();done()},0);return {feed:function(){},draw:function(){}}}
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
  function rnd(n){return ran(n)}
  function prize(){
    var p,v=rnd(9)+1;
    if(visible===(LINES-3)*(COLS-3)-1){finish('You won!');return}
    do{p={y:rnd(LINES-3)+1,x:rnd(COLS-3)+1}}while(tv[p.y][p.x]!==' ');
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
game('worm','play the growing worm game','worm [ size ]','steer the worm to the numbers, and it grows by that much. h j k l or the arrow keys steer; capitals run. do not hit the wall, or yourself.',fullProgram('worm',Worm),'by michael toy.');

})(window.Phosphor);
