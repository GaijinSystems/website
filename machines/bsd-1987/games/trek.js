/* PHOSPHOR-9 terminal: machine "bsd-1987", trek. Ported to JavaScript for this terminal from 4.3BSD's games/trek, all of its C files
   and trek.h, getpar.h: 4.3 to 5.1 (Berkeley) 1/29/86. C version by Eric P. Allman 5/76 (U.C. Berkeley) with help from Jeff Poskanzer
   and Pete Rubinstein. FORTRASH version by Kay R. Fisher (DEC) "and countless others". That was adapted from the "original BASIC
   program" (ha!) by Mike Mayfield (Centerline Engineering). Additional inspiration taken from FORTRAN version by David Matuszek and
   Paul Reynolds, maintained at Lawrence Berkeley Lab by Andy Davidson. Minor other input from the "Battelle Version 7A" by Joe Miller
   (Graphics Systems Group, Battelle-Columbus Labs) and Ross Pavlac (Systems Programmer, Battelle Memorial Institute), adapted from the
   FTN version by Ron Williams of CDC Sunnyvale, which was adapted from the Basic version distributed by DEC, with "neat stuff swiped"
   from T. T. Terry and Jim Korp (University of Texas), Hicks (Penn U.), and Rick Maus (Georgia Tech). Star Trek's names belong to their
   owners. It keeps these notices:

 * Copyright (c) 1980 Regents of the University of California.
 * All rights reserved.  The Berkeley software License Agreement
 * specifies the terms and conditions for redistribution.

 **	Permission is given for use, copying, and modification of
 **		all or part of this program and related documentation,
 **		provided that all reference to the authors are maintained.

   Differences from the C:
   - The dump command goes through P.save, and restart reads it back through P.saved and checks it, not a binary file "trek.dump".
   - shell runs a command at a time on this terminal, with % as the prompt; exit comes back.
   - The ^Z and ^L it sent to clear the screen on an ADM-3 are left out, and the bell. %.2f rounds an exact tie up, as the VAX's did.
   - scanf is 4.3's: a number may hold several points, and 1e with nothing after it is 1.
   - A few places where the C read what it had not set, or a field that is not there, are pinned:
     dumpme()'s x starts at zero; systemname(e) on an event struct read a byte of the date, and is taken as the event's own system;
     schedule() with the ghost bit set, which wrote past eventptr[], writes nowhere; nova() killing a starbase passes sector
     coordinates to killb(), and past the end of Quad[] that reads as no starbase; if no starbase has those coordinates, none moves.
   - Trace (uid 51 only) is left out, so -t and -p say "Invalid option", as they did to anyone else. Too many arguments give the
     error that syserr(0,"arg count") meant to.
   - Where the C divides by zero it dumps core; so does this, with the same words.
   - ^D at a prompt is ignored. Where the C spun on the end of a pipe, this goes on to the keyboard.
 */
(function(P){
'use strict';
var NSECTS=10,NQUADS=8,NINHAB=32,Q_DISTRESSED=128,Q_SYSTEM=63,
  EMPTY=46,STAR=42,BASE=35,ENTERPRISE=69,QUEENE=81,KLINGON=75,INHABIT=64,HOLE=32,
  NDEV=16,WARP=0,SRSCAN=1,LRSCAN=2,PHASER=3,TORPED=4,IMPULSE=5,SHIELD=6,COMPUTER=7,SSRADIO=8,LIFESUP=9,SINS=10,CLOAK=11,XPORTER=12,SHUTTLE=13,
  NEVENTS=12,E_LRTB=1,E_KATSB=2,E_KDESB=3,E_ISSUE=4,E_ENSLV=5,E_REPRO=6,E_FIXDV=7,E_ATTACK=8,E_SNAP=9,E_SNOVA=10,E_GHOST=64,E_HIDDEN=128,E_EVENT=63,MAXEVENTS=25,
  MAXKLQUAD=9,GREEN=0,DOCKED=1,YELLOW=2,RED=3,MAXBASES=9,MAXDISTR=5,NBANKS=6,
  KM_OB=0,KM_OA=1,KM_EB=2,KM_EA=3,KM_LB=4,KM_LA=5,
  L_NOTIME=1,L_NOENGY=2,L_DSTRYD=3,L_NEGENB=4,L_SUICID=5,L_SNOVA=6,L_NOLIFE=7,L_NOHELP=8,L_TOOFAST=9,L_STAR=10,L_DSTRCT=11,L_CAPTURED=12,L_NOCREW=13,
  ALPHA=3.0,BETA=3.0,GAMMA=0.30,EPSILON=150.0,OMEGA=10.596,RESET={},EXIT={},FPE={};
var Device=[['warp drive','Scotty'],['S.R. scanners','Scotty'],['L.R. scanners','Scotty'],['phasers','Sulu'],['photon tubes','Sulu'],['impulse engines','Scotty'],['shield control','Sulu'],['computer','Spock'],['subspace radio','Uhura'],['life support','Scotty'],['navigation system','Chekov'],['cloaking device','Scotty'],['transporter','Scotty'],['shuttlecraft','Scotty'],['*ERR 14*','Nobody'],['*ERR 15*','Nobody']];
var Systemname=['ERROR','Talos IV','Rigel III','Deneb VII','Canopus V','Icarus I','Prometheus II','Omega VII','Elysium I','Scalos IV','Procyon IV','Arachnid I','Argo VIII','Triad III','Echo IV','Nimrod III','Nemisis IV','Centarurus I','Kronos III','Spectros V','Beta III','Gamma Tranguli VI','Pyris III','Triachus','Marcus XII','Kaland','Ardana','Stratos','Eden','Arrikis','Epsilon Eridani IV','Exo III'];
var Lentab=[['s','hort',1,0],['m','edium',2,0],['l','ong',4,0],['restart','',0,0]];
var Skitab=[['n','ovice',1,0],['f','air',2,0],['g','ood',3,0],['e','xpert',4,0],['c','ommodore',5,0],['i','mpossible',6,0]];
var Yntab=[['y','es',1,0],['n','o',0,0]];
var Cputab=[['ch','art',1,0],['t','rajectory',2,0],['c','ourse',3,0],['m','ove',3,1],['s','core',4,0],['p','heff',5,0],['w','arpcost',6,0],['i','mpcost',7,0],['d','istresslist',8,0]];
var Matab=[['m','anual',1,0],['a','utomatic',0,0]];
var Udtab=[['u','p',1,0],['d','own',0,0]];
var Color=['GREEN','DOCKED','YELLOW','RED'];
var Cntvect=['first','second','third'];
var Visdelta=[[-1,-1],[-1,0],[-1,1],[0,1],[1,1],[1,0],[1,-1],[0,-1],[-1,-1],[-1,0],[-1,1]];
var Losemsg=['You ran out of time','You ran out of energy','You have been destroyed','You ran into the negative energy barrier',"You destroyed yourself by nova'ing that star",'You have been caught in a supernova','You just suffocated in outer space','You could not be rematerialized',"\n *** Ship's hull has imploded ***",'You have burned up in a star',"Well, you destroyed yourself, but it didn't do any good",'You have been captured by Klingons and mercilessly tortured','Your last crew member died'];
function zero(n){var a=[];while(n--)a.push(0);return a}
function int8(v){return (v<<24)>>24}
function trunc(v){var t=Math.trunc(v);return t>2147483647||t<-2147483648?t|0:t}
function idiv(a,b){if(b===0)throw FPE;return Math.trunc(a/b)}
function pad(s,n){s=String(s);while(s.length<n)s=' '+s;return s}
function f1(x){return x.toFixed(1)}
function f2(x){return x.toFixed(2)}
function isNum(x){return typeof x==='number'&&isFinite(x)}
function isInt(x,lo,hi){return isNum(x)&&Math.floor(x)===x&&x>=lo&&x<=hi}
function clone(v){return JSON.parse(JSON.stringify(v,function(k,x){return x===Infinity?1e300:x===-Infinity?-1e300:x}))}
function sameShape(t,v){ /* a dump must have what this program's own state has, numbers where it has numbers */
  var k;
  if(Array.isArray(t)){
    if(!Array.isArray(v)||v.length!==t.length)return false;
    for(k=0;k<t.length;k++)if(!sameShape(t[k],v[k]))return false;
    return true;
  }
  if(t&&typeof t==='object'){
    if(!v||typeof v!=='object'||Array.isArray(v))return false;
    for(k in t)if(P.has(t,k)&&!sameShape(t[k],v[k]))return false;
    return true;
  }
  if(typeof t==='number')return isNum(v);
  if(typeof t==='string')return typeof v==='string';
  return true;
}
P.command({names:['trek'],run:function(a,raw,words){
  var av=(words||['trek'].concat(a)).slice(1),o='',pipe=P.stdin(),pat=0,ibuf='\n',ipos=0,early='';
  var randx=Math.floor(Date.now()/1000); /* srand(time) */
  var fast=0,ai=0;
  while(ai<av.length&&av[ai].charAt(0)==='-'){
    switch(av[ai].charAt(1)){
      case 'a':break;
      case 'f':fast++;break;
      case 's':fast=0;break;
      default:early+='Invalid option: '+av[ai]+'\n';
    }
    ai++;
  }
  if(av.length-ai>1){
    P.say((early+'\nTREK SYSERR: arg count').split('\n'));
    P.status(255);
    return;
  }
  /* ---------- the game's state, one object per struct in trek.h ---------- */
  var Quad=[],Sect=zero(140),Event=[],i,j;
  for(i=0;i<NQUADS;i++){Quad.push([]);for(j=0;j<NQUADS;j++)Quad[i].push({bases:0,klings:0,holes:0,scanned:0,stars:0,qsystemname:0})}
  for(i=0;i<MAXEVENTS;i++)Event.push({x:0,y:0,date:0,evcode:0,systemname:0,idx:i});
  var Ship={warp:0,warp2:0,warp3:0,shldup:0,cloaked:0,energy:0,shield:0,reserves:0,crew:0,brigfree:0,torped:0,cloakgood:0,quadx:0,quady:0,sectx:0,secty:0,cond:0,sinsbad:0,shipname:'',ship:0,distressed:0};
  var Game={killk:0,deaths:0,negenbar:0,killb:0,kills:0,skill:0,length:0,killed:0,killinhab:0,tourn:0,passwd:'',snap:0,helps:0,captives:0};
  var Move={free:0,endgame:0,shldchg:0,newquad:0,resting:0,time:0};
  var Param={bases:0,klings:0,date:0,time:0,resource:0,energy:0,shield:0,reserves:0,crew:0,brigfree:0,torped:0,damfac:zero(NDEV),dockfac:0,regenfac:0,stopengy:0,shupengy:0,klingpwr:0,warptime:0,phasfac:0,moveprob:zero(6),movefac:zero(6),eventdly:zero(NEVENTS),navigcrud:zero(2),cloakenergy:0,damprob:zero(NDEV),hitfac:0,klingcrew:0,srndrprob:0,energylow:0};
  var Now={bases:0,klings:0,date:0,time:0,resource:0,distressed:0,eventptr:[],base:[]};
  for(i=0;i<NEVENTS;i++)Now.eventptr.push(-1);
  for(i=0;i<MAXBASES;i++)Now.base.push({x:0,y:0});
  var Etc={klingon:[],nkling:0,fast:fast,starbase:{x:0,y:0},snapshot:null,statreport:0};
  for(i=0;i<MAXKLQUAD;i++)Etc.klingon.push({x:0,y:0,power:0,dist:0,avgdist:0,srndreq:0});
  function SG(x,y){return Sect[x*10+y]}
  function SS(x,y,v){Sect[x*10+y]=v}
  function pr(s){o+=s}
  function copyK(from,to){to.x=from.x;to.y=from.y;to.power=from.power;to.dist=from.dist;to.avgdist=from.avgdist;to.srndreq=from.srndreq}
  function rand(){randx=(Math.imul(randx,1103515245)+12345)&0x7fffffff;return randx}
  function ranf(max){
    if(max<=0)return 0;
    return (rand()>>5)%max;
  }
  function franf(){return (rand()&0o77777)/32767.0}
  function* sleep(n){yield {nap:n}}
  /* ---------- stdin: a line at a time as the terminal gives it, with ungetc ---------- */
  function* cgetc(){
    while(ipos>=ibuf.length){
      var l;
      if(pipe&&pat<pipe.length)l=pipe[pat++];
      else l=yield;
      if(l===null||l===undefined)continue;
      ibuf=l+'\n';
      ipos=0;
    }
    return ibuf.charCodeAt(ipos++);
  }
  function ungetc(c){
    if(ipos>0&&ibuf.charCodeAt(ipos-1)===c)ipos--;
    else{ibuf=String.fromCharCode(c)+ibuf.slice(ipos);ipos=0}
    return c;
  }
  function isdig(c){return c>=48&&c<=57}
  function* scanInt(){ /* scanf("%d"): the number, or null if none */
    var c,neg=0,v=0,nd=0;
    while((c=yield* cgetc())===32||c===9||c===10);
    if(c===45){neg=1;c=yield* cgetc()}
    else if(c===43)c=yield* cgetc();
    for(;isdig(c);c=yield* cgetc()){v=(Math.imul(v,10)+c-48)|0;nd++}
    ungetc(c);
    if(!nd)return null;
    return neg?(-v)|0:v;
  }
  function* scanFlt(){ /* scanf("%lf"), as 4.3's _innum */
    var c,s='',exp=0,nd=0,neg=0;
    while((c=yield* cgetc())===32||c===9||c===10);
    if(c===45){neg=1;c=yield* cgetc()}
    else if(c===43)c=yield* cgetc();
    for(;;){
      if(isdig(c)){nd++;s+=String.fromCharCode(c);c=yield* cgetc()}
      else if(c===46){nd++;s+='.';c=yield* cgetc()}
      else if((c===101||c===69)&&!exp){
        if(nd===0)break;
        exp=1;
        s+='e';
        c=yield* cgetc();
        if(c!==43&&c!==45&&(c<48||c>57))break;
        s+=String.fromCharCode(c);
        c=yield* cgetc();
      }
      else break;
    }
    ungetc(c);
    if(!s)return null;
    var v=parseFloat(s);
    if(isNaN(v))v=0;
    return neg?-v:v;
  }
  function* skipset(set){ /* scanf("%*[...]") */
    var c;
    while(set.indexOf(String.fromCharCode(c=yield* cgetc()))>=0);
    ungetc(c);
  }
  function* scanWord(stop,max){ /* scanf("%[^...]"), up to max characters */
    var c,s='';
    for(;;){
      c=yield* cgetc();
      if(stop.indexOf(String.fromCharCode(c))>=0)break;
      s+=String.fromCharCode(c);
      if(max&&s.length>=max)return s;
    }
    ungetc(c);
    return s;
  }
  /* ---------- getpar.c ---------- */
  function* testnl(){
    var c;
    while((c=yield* cgetc())!==10){
      if(isdig(c)||c===46||c===33||(c>=65&&c<=90)||(c>=97&&c<=122)||c===45){
        ungetc(c);
        return 0;
      }
    }
    ungetc(c);
    return 1;
  }
  function* skiptonl(c){
    while(c!==10)if(!(c=yield* cgetc()))return;
    ungetc(10);
  }
  function* testterm(){
    var c=yield* cgetc();
    if(!c)return 1;
    if(c===46)return 0;
    if(c===10||c===59)ungetc(c);
    return 1;
  }
  function* readdelim(d){
    var c;
    while((c=yield* cgetc())){
      if(c===d)return 1;
      if(c===32)continue;
      ungetc(c);
      break;
    }
    return 0;
  }
  function* getintpar(s){
    var n;
    for(;;){
      if((yield* testnl())&&s)pr(s+': ');
      n=yield* scanInt();
      if(n!==null&&(yield* testterm()))return n;
      pr('invalid input; please enter an integer\n');
      yield* skiptonl(0);
    }
  }
  function* getfltpar(s){
    var d;
    for(;;){
      if((yield* testnl())&&s)pr(s+': ');
      d=yield* scanFlt();
      if(d!==null&&(yield* testterm()))return d;
      pr('invalid input; please enter a double\n');
      yield* skiptonl(0);
    }
  }
  function* getynpar(s){return (yield* getcodpar(s,Yntab))[2]}
  function codematch(input,e){
    var p=0,q,ab=e[0],fu=e[1];
    for(q=0;q<ab.length;q++)if(input.charAt(p++)!==ab.charAt(q))break;
    if(q<ab.length)return false;
    for(q=0;p<input.length&&q<fu.length;q++,p++)if(input.charAt(p)!==fu.charAt(q))break;
    return p>=input.length||q>=fu.length;
  }
  function* getcodpar(s,tab){
    var input,r,flag=0,f,c,k;
    for(;;){
      flag|=(f=yield* testnl());
      if(flag)pr(s+': ');
      if(f)yield* cgetc();
      yield* skipset(' \t;');
      input=yield* scanWord(' \t;\n');
      if(input==='')continue;
      flag=1;
      if(input==='?'){
        c=4;
        for(k=0;k<tab.length;k++){
          pr(pad((tab[k][0]+tab[k][1]).slice(0,14),14));
          if(--c>0)continue;
          c=4;
          pr('\n');
        }
        if(c!==4)pr('\n');
        continue;
      }
      r=null;
      for(k=0;k<tab.length;k++)if(codematch(input,tab[k])){r=tab[k];break}
      if(!r){
        pr('invalid input; ? for valid inputs\n');
        yield* skiptonl(0);
      }
      else return r;
    }
  }
  function* getstrpar(s,l){
    var f,r;
    for(;;){
      if((f=yield* testnl())&&s)pr(s+': ');
      if(f)yield* cgetc();
      yield* skipset('\t ;');
      r=yield* scanWord(' \t\n;',l);
      if(r!=='')return r;
    }
  }
  /* ---------- schedule.c ---------- */
  function syserr(m){pr('\nTREK SYSERR: '+m+'\n');throw EXIT}
  function schedule(type,offset,x,y,z){
    var e,k,date=Now.date+offset;
    for(k=0;k<MAXEVENTS;k++){
      e=Event[k];
      if(e.evcode)continue;
      e.evcode=int8(type);
      e.date=date;
      e.x=x;
      e.y=y;
      e.systemname=int8(z);
      if(type<NEVENTS)Now.eventptr[type]=k;
      return e;
    }
    syserr('Cannot schedule event '+type+' parm '+x+' '+y+' '+z);
  }
  function reschedule(e,offset){e.date=Now.date+offset}
  function unschedule(e){
    Now.eventptr[e.evcode&E_EVENT]=-1;
    e.date=1e50;
    e.evcode=0;
  }
  function xsched(ev,factor,x,y,z){return schedule(ev,-Param.eventdly[ev]*Param.time*Math.log(franf())/factor,x,y,z)}
  function xresched(e,ev,factor){reschedule(e,-Param.eventdly[ev]*Param.time*Math.log(franf())/factor)}
  function damaged(dev){
    for(var k=0;k<MAXEVENTS;k++){
      if(Event[k].evcode!==E_FIXDV)continue;
      if(Event[k].systemname===dev)return 1;
    }
    return 0;
  }
  function out(dev){
    var d=Device[dev];
    pr(d[1]+' reports '+d[0]+' ');
    pr(d[0].charAt(d[0].length-1)==='s'?'are':'is');
    pr(' damaged\n');
  }
  function check_out(dev){
    if(!damaged(dev))return 0;
    out(dev);
    if(Ship.cond!==DOCKED)return 1;
    pr('  Using starbase '+Device[dev][0]+'\n');
    return 0;
  }
  function damage(dev,dam){
    var k,e;
    if(dam<=0.0)return;
    pr('\t'+Device[dev][0]+' damaged\n');
    if(Ship.cond===DOCKED)dam*=Param.dockfac;
    if(!damaged(dev)){
      schedule(E_FIXDV,dam,0,0,dev);
      return;
    }
    for(k=0;k<MAXEVENTS;k++){
      e=Event[k];
      if(e.evcode!==E_FIXDV||e.systemname!==dev)continue;
      reschedule(e,e.date-Now.date+dam);
      return;
    }
    syserr('Cannot find old damages '+dev+'\n');
  }
  function systemname(q){
    var k=q.qsystemname;
    if(k&Q_DISTRESSED)k=Event[k&Q_SYSTEM].systemname;
    k&=Q_SYSTEM;
    if(k===0)return null;
    return Systemname[k];
  }
  /* ---------- setup.c ---------- */
  function* setup(){
    var r,k,m,f,d,klump,ix,iy,q,e;
    for(;;){
      r=yield* getcodpar('What length game',Lentab);
      Game.length=r[2];
      if(Game.length===0){
        if(restartgame())continue;
        return;
      }
      break;
    }
    r=yield* getcodpar('What skill game',Skitab);
    Game.skill=r[2];
    Game.tourn=0;
    Game.passwd=yield* getstrpar('Enter a password',14);
    if(Game.passwd==='tournament'){
      Game.passwd=yield* getstrpar('Enter tournament code',14);
      Game.tourn=1;
      d=0;
      for(k=0;k<Game.passwd.length;k++)d=(d+((int8(Game.passwd.charCodeAt(k)))<<k))|0;
      randx=d;
    }
    Param.bases=Now.bases=ranf(6-Game.skill)+2;
    if(Game.skill===6)Param.bases=Now.bases=1;
    Param.time=Now.time=6.0*Game.length+2.0;
    k=Game.skill;
    m=Game.length;
    Param.klings=Now.klings=int8(trunc(k*m*3.5*(franf()+0.75)));
    if(Param.klings<k*m*5)Param.klings=Now.klings=k*m*5;
    if(Param.klings<=k)Param.klings=Now.klings=127;
    Param.energy=Ship.energy=5000;
    Param.torped=Ship.torped=10;
    Ship.ship=ENTERPRISE;
    Ship.shipname='Enterprise';
    Param.shield=Ship.shield=1500;
    Param.resource=Now.resource=Param.klings*Param.time;
    Param.reserves=Ship.reserves=(6-Game.skill)*2.0;
    Param.crew=Ship.crew=387;
    Param.brigfree=Ship.brigfree=400;
    Ship.shldup=1;
    Ship.cond=GREEN;
    Ship.warp=5.0;
    Ship.warp2=25.0;
    Ship.warp3=125.0;
    Ship.sinsbad=0;
    Ship.cloaked=0;
    Param.date=Now.date=(ranf(20)+20)*100;
    f=Game.skill;
    f=Math.log(f+0.5);
    for(k=0;k<NDEV;k++)Param.damfac[k]=Device[k][0].charAt(0)==='*'?0:f;
    Param.damprob[WARP]=70;Param.damprob[SRSCAN]=110;Param.damprob[LRSCAN]=110;Param.damprob[PHASER]=125;Param.damprob[TORPED]=125;Param.damprob[IMPULSE]=75;
    Param.damprob[SHIELD]=150;Param.damprob[COMPUTER]=20;Param.damprob[SSRADIO]=35;Param.damprob[LIFESUP]=30;Param.damprob[SINS]=20;Param.damprob[CLOAK]=50;Param.damprob[XPORTER]=80;
    for(k=m=0;k<NDEV;k++)m+=Param.damprob[k];
    if(m!==1000)syserr('Device probabilities sum to '+m);
    Param.dockfac=0.5;
    Param.regenfac=(5-Game.skill)*0.05;
    if(Param.regenfac<0.0)Param.regenfac=0.0;
    Param.warptime=10;
    Param.stopengy=50;
    Param.shupengy=40;
    k=Game.skill;
    Param.klingpwr=100+150*k;
    if(k>=6)Param.klingpwr+=150;
    Param.phasfac=0.8;
    Param.hitfac=0.5;
    Param.klingcrew=200;
    Param.srndrprob=0.0035;
    Param.moveprob[KM_OB]=45;
    Param.movefac[KM_OB]=.09;
    Param.moveprob[KM_OA]=40;
    Param.movefac[KM_OA]=-0.05;
    Param.moveprob[KM_EB]=40;
    Param.movefac[KM_EB]=0.075;
    Param.moveprob[KM_EA]=25+5*Game.skill;
    Param.movefac[KM_EA]=-0.06*Game.skill;
    Param.moveprob[KM_LB]=0;
    Param.movefac[KM_LB]=0.0;
    Param.moveprob[KM_LA]=10+10*Game.skill;
    Param.movefac[KM_LA]=0.25;
    Param.eventdly[E_SNOVA]=0.5;
    Param.eventdly[E_LRTB]=25.0;
    Param.eventdly[E_KATSB]=1.0;
    Param.eventdly[E_KDESB]=3.0;
    Param.eventdly[E_ISSUE]=1.0;
    Param.eventdly[E_SNAP]=0.5;
    Param.eventdly[E_ENSLV]=0.5;
    Param.eventdly[E_REPRO]=2.0;
    Param.navigcrud[0]=1.50;
    Param.navigcrud[1]=0.75;
    Param.cloakenergy=1000;
    Param.energylow=1000;
    for(k=0;k<MAXEVENTS;k++){
      e=Event[k];
      e.date=1e50;
      e.evcode=0;
    }
    xsched(E_SNOVA,1,0,0,0);
    xsched(E_LRTB,Param.klings,0,0,0);
    xsched(E_KATSB,1,0,0,0);
    xsched(E_ISSUE,1,0,0,0);
    xsched(E_SNAP,1,0,0,0);
    Ship.sectx=ranf(NSECTS);
    Ship.secty=ranf(NSECTS);
    Game.killk=Game.kills=Game.killb=0;
    Game.deaths=Game.negenbar=0;
    Game.captives=0;
    Game.killinhab=0;
    Game.helps=0;
    Game.killed=0;
    Game.snap=0;
    Move.endgame=0;
    for(k=0;k<NQUADS;k++)
      for(m=0;m<NQUADS;m++){
        q=Quad[k][m];
        q.klings=q.bases=0;
        q.scanned=-1;
        q.stars=ranf(9)+1;
        q.holes=ranf(3)-Math.trunc(q.stars/5);
        q.qsystemname=0;
      }
    for(d=1;d<NINHAB;d++){
      do{
        k=ranf(NQUADS);
        m=ranf(NQUADS);
        q=Quad[k][m];
      }while(q.qsystemname);
      q.qsystemname=d;
    }
    for(k=0;k<Param.bases;k++){
      for(;;){
        ix=ranf(NQUADS);
        iy=ranf(NQUADS);
        q=Quad[ix][iy];
        if(q.bases>0)continue;
        break;
      }
      q.bases=1;
      Now.base[k].x=ix;
      Now.base[k].y=iy;
      q.scanned=1001;
      if(k===0){
        Ship.quadx=ix;
        Ship.quady=iy;
      }
    }
    for(k=Param.klings;k>0;){
      klump=ranf(4)+1;
      if(klump>k)klump=k;
      for(;;){
        ix=ranf(NQUADS);
        iy=ranf(NQUADS);
        q=Quad[ix][iy];
        if(q.klings+klump>MAXKLQUAD)continue;
        q.klings+=klump;
        k-=klump;
        break;
      }
    }
    pr(Param.klings+' Klingons\n'+Param.bases+' starbase');
    if(Param.bases>1)pr('s');
    pr(' at '+Now.base[0].x+','+Now.base[0].y);
    for(k=1;k<Param.bases;k++)pr(', '+Now.base[k].x+','+Now.base[k].y);
    pr('\nIt takes '+Param.klingpwr+' units to kill a Klingon\n');
    Move.free=0;
    yield* initquad(0);
    yield* srscan(1);
    yield* attack(0);
  }
  function* initquad(f){
    var k,m,rx,ry,nbases,nstars,nholes,q=Quad[Ship.quadx][Ship.quady];
    if(q.stars<0)return;
    Etc.nkling=q.klings;
    nbases=q.bases;
    nstars=q.stars;
    nholes=q.holes;
    if(Etc.nkling>0&&!f){
      pr('Condition RED\n');
      Ship.cond=RED;
      if(!damaged(COMPUTER))yield* shield(1);
    }
    for(k=0;k<NSECTS;k++)for(m=0;m<NSECTS;m++)SS(k,m,EMPTY);
    SS(Ship.sectx,Ship.secty,Ship.ship);
    for(k=0;k<Etc.nkling;k++){
      rx=sector();ry=rx[1];rx=rx[0];
      SS(rx,ry,KLINGON);
      Etc.klingon[k].x=rx;
      Etc.klingon[k].y=ry;
      Etc.klingon[k].power=Param.klingpwr;
      Etc.klingon[k].srndreq=0;
    }
    compkldist(1);
    if(nbases>0){
      rx=sector();ry=rx[1];rx=rx[0];
      SS(rx,ry,BASE);
      Etc.starbase.x=rx;
      Etc.starbase.y=ry;
    }
    if(q.qsystemname!==0){
      rx=sector();ry=rx[1];rx=rx[0];
      SS(rx,ry,INHABIT);
      nstars-=1;
    }
    for(k=0;k<nholes;k++){
      rx=sector();ry=rx[1];rx=rx[0];
      SS(rx,ry,HOLE);
    }
    for(k=0;k<nstars;k++){
      rx=sector();ry=rx[1];rx=rx[0];
      SS(rx,ry,STAR);
    }
    Move.newquad=1;
  }
  function sector(){
    var k,m;
    do{
      k=ranf(NSECTS);
      m=ranf(NSECTS);
    }while(SG(k,m)!==EMPTY);
    return [k,m];
  }
  /* ---------- abandon.c ---------- */
  function* abandon(){
    var q,k,m,e;
    if(Ship.ship===QUEENE){pr('You may not abandon ye Faire Queene\n');return}
    if(Ship.cond!==DOCKED){
      if(damaged(SHUTTLE)){out(SHUTTLE);return}
      pr('Officers escape in shuttlecraft\n');
      q=Quad[Ship.quadx][Ship.quady];
      if(q.qsystemname===0||damaged(XPORTER)){
        pr('Entire crew of '+Ship.crew+' left to die in outer space\n');
        Game.deaths+=Ship.crew;
      }
      else pr('Crew beams down to planet '+(systemname(q)||'(null)')+'\n');
    }
    if(Now.bases===0||Game.captives<20*Game.skill)yield* lose(L_CAPTURED);
    pr('You are hereby put in charge of an antiquated but still\n');
    pr('  functional ship, the Fairie Queene.\n');
    Ship.ship=QUEENE;
    Ship.shipname='Fairie Queene';
    Param.energy=Ship.energy=3000;
    Param.torped=Ship.torped=6;
    Param.shield=Ship.shield=1250;
    Ship.shldup=0;
    Ship.cloaked=0;
    Ship.warp=5.0;
    Ship.warp2=25.0;
    Ship.warp3=125.0;
    Ship.cond=GREEN;
    for(k=0;k<MAXEVENTS;k++){
      e=Event[k];
      if(e.evcode!==E_FIXDV)continue;
      unschedule(e);
    }
    k=Param.damprob[SHUTTLE]+Param.damprob[CLOAK];
    Param.damprob[SHUTTLE]=Param.damprob[CLOAK]=0;
    while(k>0)
      for(m=0;m<NDEV;m++){
        if(Param.damprob[m]!==0){
          Param.damprob[m]+=1;
          k--;
          if(k<=0)break;
        }
      }
    k=ranf(Now.bases);
    Ship.quadx=Now.base[k].x;
    Ship.quady=Now.base[k].y;
    for(;;){
      yield* initquad(1);
      SS(Ship.sectx,Ship.secty,EMPTY);
      for(k=0;k<5;k++){
        Ship.sectx=Etc.starbase.x+ranf(3)-1;
        if(Ship.sectx<0||Ship.sectx>=NSECTS)continue;
        Ship.secty=Etc.starbase.y+ranf(3)-1;
        if(Ship.secty<0||Ship.secty>=NSECTS)continue;
        if(SG(Ship.sectx,Ship.secty)===EMPTY){
          SS(Ship.sectx,Ship.secty,QUEENE);
          dock();
          compkldist(0);
          return;
        }
      }
    }
  }
  /* ---------- attack.c ---------- */
  function* attack(resting){
    var hit,k,l,maxhit,tothit,shldabsb,chgfac,propor,extradm,dustfac,tothe,cas,hitflag;
    if(Move.free)return;
    if(Etc.nkling<=0||Quad[Ship.quadx][Ship.quady].stars<0)return;
    if(Ship.cloaked&&Ship.cloakgood)return;
    klmove(0);
    if(Ship.cond===DOCKED){
      if(!resting)pr('Starbase shields protect the '+Ship.shipname+'\n');
      return;
    }
    chgfac=1.0;
    if(Move.shldchg)chgfac=0.25+0.50*franf();
    maxhit=tothit=0;
    hitflag=0;
    for(k=0;k<Etc.nkling;k++){
      if(Etc.klingon[k].power<20)continue;
      if(!hitflag){
        pr('\nStardate '+f2(Now.date)+': Klingon attack:\n');
        hitflag++;
      }
      dustfac=0.90+0.01*franf();
      tothe=Etc.klingon[k].avgdist;
      hit=trunc(Etc.klingon[k].power*Math.pow(dustfac,tothe)*Param.hitfac);
      dustfac=Etc.klingon[k].power;
      Etc.klingon[k].power=trunc(dustfac*Param.phasfac*(1.0+(franf()-0.5)*0.2));
      shldabsb=0;
      if(Ship.shldup||Move.shldchg){
        propor=Ship.shield;
        propor/=Param.shield;
        shldabsb=trunc(propor*chgfac*hit);
        if(shldabsb>Ship.shield)shldabsb=Ship.shield;
        Ship.shield-=shldabsb;
      }
      pr('HIT: '+hit+' units');
      if(!damaged(SRSCAN))pr(' from '+Etc.klingon[k].x+','+Etc.klingon[k].y);
      cas=idiv(shldabsb*100,hit);
      hit-=shldabsb;
      if(shldabsb>0)pr(', shields absorb '+cas+'%, effective hit '+hit+'\n');
      else pr('\n');
      tothit+=hit;
      if(hit>maxhit)maxhit=hit;
      Ship.energy-=hit;
      if(hit>=(15-Game.skill)*(25-ranf(12))){
        pr('CRITICAL HIT!!!\n');
        cas=ranf(1000);
        for(l=0;cas>=0;l++)cas-=Param.damprob[l];
        l-=1;
        extradm=(hit*Param.damfac[l])/(75+ranf(25))+0.5;
        damage(l,extradm);
        if(damaged(SHIELD)){
          if(Ship.shldup)pr('Sulu: Shields knocked down, captain.\n');
          Ship.shldup=0;
          Move.shldchg=0;
        }
      }
      if(Ship.energy<=0)yield* lose(L_DSTRYD);
    }
    if(maxhit>=200||tothit>=500){
      cas=trunc(tothit*0.015*franf());
      if(cas>=2){
        pr('McCoy: we suffered '+cas+' casualties in that attack.\n');
        Game.deaths+=cas;
        Ship.crew-=cas;
      }
    }
    klmove(1);
  }
  function* autover(){
    var dist,course;
    pr('RED ALERT:  The '+Ship.shipname+' is in a supernova quadrant\n');
    pr('***  Emergency override attempts to hurl '+Ship.shipname+' to safety\n');
    Ship.warp=6.0+2.0*franf();
    Ship.warp2=Ship.warp*Ship.warp;
    Ship.warp3=Ship.warp2*Ship.warp;
    dist=0.75*Ship.energy/(Ship.warp3*(Ship.shldup+1));
    if(dist>1.4142)dist=1.4142;
    course=ranf(360);
    Etc.nkling=-1;
    Ship.cond=RED;
    yield* warp(-1,course,dist);
    yield* attack(0);
  }
  /* ---------- capture.c ---------- */
  function* capture(){
    var k,kl,x;
    if(Ship.cloaked){pr('Ship-ship communications out when cloaked\n');return}
    if(damaged(SSRADIO)){out(SSRADIO);return}
    if(Etc.nkling<=0){pr('Uhura: Getting no response, sir\n');return}
    kl=Etc.klingon[Etc.nkling<2?0:ranf(Etc.nkling)];
    Move.free=0;
    Move.time=0.05;
    kl.srndreq++;
    x=Param.klingpwr;
    x*=Ship.energy;
    x/=kl.power*Etc.nkling;
    x*=Param.srndrprob;
    k=trunc(x);
    if(k>ranf(100)){
      pr('Klingon at '+kl.x+','+kl.y+' surrenders\n');
      k=ranf(Param.klingcrew);
      if(k>0)pr((Param.klingcrew-k)+' klingons commit suicide rather than be taken captive\n');
      if(k>Ship.brigfree)k=Ship.brigfree;
      Ship.brigfree-=k;
      pr(k+' captives taken\n');
      yield* killk(kl.x,kl.y);
      return;
    }
    pr('Fat chance, captain\n');
  }
  function* checkcond(){
    if(Ship.reserves<0.0)yield* lose(L_NOLIFE);
    if(Ship.energy<=0)yield* lose(L_NOENGY);
    if(Ship.crew<=0)yield* lose(L_NOCREW);
    if(Etc.nkling<0)return;
    if(Quad[Ship.quadx][Ship.quady].stars<0)yield* autover();
    if(Quad[Ship.quadx][Ship.quady].stars<0)yield* lose(L_SNOVA);
    if(Etc.nkling<=0)killd(Ship.quadx,Ship.quady,1);
    if(Ship.cond===DOCKED)return;
    if(Etc.nkling>0){Ship.cond=RED;return}
    if(Ship.energy<Param.energylow){Ship.cond=YELLOW;return}
    Ship.cond=GREEN;
  }
  /* ---------- compkl.c ---------- */
  function compkldist(f){
    var k,dx,dy,d;
    if(Etc.nkling===0)return;
    for(k=0;k<Etc.nkling;k++){
      dx=Ship.sectx-Etc.klingon[k].x;
      dy=Ship.secty-Etc.klingon[k].y;
      d=dx*dx+dy*dy;
      d=Math.sqrt(d);
      if(!f)Etc.klingon[k].avgdist=0.5*(Etc.klingon[k].dist+d);
      else Etc.klingon[k].avgdist=d;
      Etc.klingon[k].dist=d;
    }
    sortkl();
  }
  function sortkl(){
    var t={},f=1,k,m=Etc.nkling-1;
    while(f){
      f=0;
      for(k=0;k<m;k++)
        if(Etc.klingon[k].dist>Etc.klingon[k+1].dist){
          copyK(Etc.klingon[k],t);
          copyK(Etc.klingon[k+1],Etc.klingon[k]);
          copyK(t,Etc.klingon[k+1]);
          f=1;
        }
    }
  }
  /* ---------- computer.c ---------- */
  function* computer(){
    var ix,iy,k,m,tqx,tqy,r,cost,course,dist,time,warpfact,q,e,c;
    if(check_out(COMPUTER))return;
    for(;;){
      r=yield* getcodpar('\nRequest',Cputab);
      sw:switch(r[2]){
        case 1:
          pr('Computer record of galaxy for all long range sensor scans\n\n');
          pr('  ');
          for(k=0;k<NQUADS;k++)pr('-'+k+'- ');
          pr('\n');
          for(k=0;k<NQUADS;k++){
            pr(k+' ');
            for(m=0;m<NQUADS;m++){
              if(k===Ship.quadx&&m===Ship.quady){
                pr('$$$ ');
                continue;
              }
              q=Quad[k][m];
              if(q.scanned>=1000)pr(q.scanned>1000?'.1. ':'/// ');
              else if(q.scanned<0)pr('... ');
              else pr(pad(q.scanned,3)+' ');
            }
            pr(k+'\n');
          }
          pr('  ');
          for(k=0;k<NQUADS;k++)pr('-'+k+'- ');
          pr('\n');
          break;
        case 2:
          if(check_out(SRSCAN))break;
          if(Etc.nkling<=0){
            pr('No Klingons in this quadrant\n');
            break;
          }
          for(k=0;k<Etc.nkling;k++){
            pr('Klingon at '+Etc.klingon[k].x+','+Etc.klingon[k].y);
            c=kalc(Ship.quadx,Ship.quady,Etc.klingon[k].x,Etc.klingon[k].y);
            prkalc(c[0],c[1]);
          }
          break;
        case 3:
          if(yield* readdelim(47)){
            tqx=Ship.quadx;
            tqy=Ship.quady;
          }
          else{
            ix=yield* getintpar('Quadrant');
            if(ix<0||ix>=NSECTS)break;
            iy=yield* getintpar('q-y');
            if(iy<0||iy>=NSECTS)break;
            tqx=ix;
            tqy=iy;
          }
          ix=yield* getintpar('Sector');
          if(ix<0||ix>=NSECTS)break;
          iy=yield* getintpar('s-y');
          if(iy<0||iy>=NSECTS)break;
          c=kalc(tqx,tqy,ix,iy);
          course=c[0];
          dist=c[1];
          if(r[3]){
            yield* warp(-1,course,dist);
            break;
          }
          pr(Ship.quadx+','+Ship.quady+'/'+Ship.sectx+','+Ship.secty+' to '+tqx+','+tqy+'/'+ix+','+iy);
          prkalc(course,dist);
          break;
        case 4:
          score();
          break;
        case 5:
          dist=yield* getfltpar('range');
          if(dist<0.0)break;
          dist*=10.0;
          cost=trunc(Math.pow(0.90,dist)*98.0+0.5);
          pr('Phasers are '+cost+'% effective at that range\n');
          break;
        case 6:
          dist=yield* getfltpar('distance');
          if(dist<0.0)break;
          warpfact=yield* getfltpar('warp factor');
          if(warpfact<=0.0)warpfact=Ship.warp;
          cost=trunc((dist+0.05)*warpfact*warpfact*warpfact);
          time=Param.warptime*dist/(warpfact*warpfact);
          pr('Warp '+f2(warpfact)+' distance '+f2(dist)+' cost '+f2(time)+' stardates '+cost+' ('+(cost+cost)+' w/ shlds up) units\n');
          break;
        case 7:
          dist=yield* getfltpar('distance');
          if(dist<0.0)break;
          cost=trunc(20+100*dist);
          time=dist/0.095;
          pr('Distance '+f2(dist)+' cost '+f2(time)+' stardates '+cost+' units\n');
          break;
        case 8:
          m=1;
          pr('\n');
          for(k=0;k<MAXEVENTS;k++){
            e=Event[k];
            if(e.evcode&E_HIDDEN)continue;
            switch(e.evcode&E_EVENT){
              case E_KDESB:
                pr('Klingon is attacking starbase in quadrant '+e.x+','+e.y+'\n');
                m=0;
                break;
              case E_ENSLV:case E_REPRO:
                pr('Starsystem '+Systemname[e.systemname&Q_SYSTEM]+' in quadrant '+e.x+','+e.y+' is distressed\n');
                m=0;
                break;
            }
          }
          if(m)pr('No known distress calls are active\n');
          break;
      }
      while((c=yield* cgetc())!==59){
        if(c===0)throw EXIT;
        if(c===10){
          ungetc(c);
          return;
        }
      }
    }
  }
  function kalc(tqx,tqy,tsx,tsy){
    var dx,dy,quadsize=NSECTS,angle,course;
    dx=(Ship.quadx+Ship.sectx/quadsize)-(tqx+tsx/quadsize);
    dy=(tqy+tsy/quadsize)-(Ship.quady+Ship.secty/quadsize);
    angle=Math.atan2(dy,dx);
    if(angle<0.0)angle+=6.283185307;
    course=trunc(angle*57.29577951+0.5);
    dx=dx*dx+dy*dy;
    return [course,Math.sqrt(dx)];
  }
  function prkalc(course,dist){pr(': course '+course+'  dist '+dist.toFixed(3)+'\n')}
  /* ---------- dcrept.c, destruct.c ---------- */
  function* dcrept(){
    var k,f=1,x,m1,m2,e;
    if(Ship.cond===DOCKED){m1=1.0/Param.dockfac;m2=1.0}
    else{m1=1.0;m2=Param.dockfac}
    pr('Damage control report:\n');
    for(k=0;k<MAXEVENTS;k++){
      e=Event[k];
      if(e.evcode!==E_FIXDV)continue;
      if(f){
        pr('\t\t\t  repair times\n');
        pr('device\t\t\tin flight  docked\n');
        f=0;
      }
      x=e.date-Now.date;
      var nm=Device[e.systemname][0];
      while(nm.length<24)nm+=' ';
      pr(nm+pad(f2(x*m1+0.005),7)+'  '+pad(f2(x*m2+0.005),7)+'\n');
    }
    if(f)pr('All devices functional\n');
  }
  function* destruct(){
    var checkpass,k,m,zap;
    if(damaged(COMPUTER)){out(COMPUTER);return}
    pr('\n --- WORKING ---\n');
    yield* sleep(3);
    for(k=10;k>5;k--){
      for(m=10;m>k;m--)pr('   ');
      pr(k+'\n');
      yield* sleep(1);
    }
    yield* skiptonl(0);
    checkpass=yield* getstrpar('Enter password verification',14);
    yield* sleep(2);
    if(checkpass!==Game.passwd){pr('Self destruct sequence aborted\n');return}
    pr('Password verified; self destruct sequence continues:\n');
    yield* sleep(2);
    for(k=5;k>=0;k--){
      yield* sleep(1);
      for(m=5;m>k;m--)pr('   ');
      pr(k+'\n');
    }
    yield* sleep(2);
    pr('***** '+Ship.shipname+' destroyed *****\n');
    Game.killed=1;
    zap=20.0*Ship.energy;
    Game.deaths+=Ship.crew;
    for(k=0;k<Etc.nkling;){
      if(Etc.klingon[k].power*Etc.klingon[k].dist<=zap)yield* killk(Etc.klingon[k].x,Etc.klingon[k].y);
      else k++;
    }
    yield* lose(L_DSTRCT);
  }
  /* ---------- dock.c ---------- */
  function dock(){
    var k,m,ok=0,e;
    if(Ship.cond===DOCKED){pr('Chekov: But captain, we are already docked\n');return}
    for(k=Ship.sectx-1;k<=Ship.sectx+1&&!ok;k++){
      if(k<0||k>=NSECTS)continue;
      for(m=Ship.secty-1;m<=Ship.secty+1;m++){
        if(m<0||m>=NSECTS)continue;
        if(SG(k,m)===BASE){
          ok++;
          break;
        }
      }
    }
    if(!ok){pr('Chekov: But captain, we are not adjacent to a starbase.\n');return}
    Ship.energy=Param.energy;
    Ship.torped=Param.torped;
    Ship.shield=Param.shield;
    Ship.crew=Param.crew;
    Game.captives+=Param.brigfree-Ship.brigfree;
    Ship.brigfree=Param.brigfree;
    Ship.shldup=0;
    Ship.cloaked=0;
    Ship.cond=DOCKED;
    Ship.reserves=Param.reserves;
    Ship.sinsbad=0;
    dumpssradio();
    for(k=0;k<MAXEVENTS;k++){
      e=Event[k];
      if(e.evcode!==E_FIXDV)continue;
      reschedule(e,(e.date-Now.date)*Param.dockfac);
    }
  }
  function undock(){
    var e,k;
    if(Ship.cond!==DOCKED){pr('Sulu: Pardon me captain, but we are not docked.\n');return}
    Ship.cond=GREEN;
    Move.free=0;
    for(k=0;k<MAXEVENTS;k++){
      e=Event[k];
      if(e.evcode!==E_FIXDV)continue;
      reschedule(e,(e.date-Now.date)/Param.dockfac);
    }
  }
  function* dock_(){dock()}
  function* undock_(){undock()}
  /* ---------- dumpgame.c ---------- */
  function* dumpgame(){
    var ok=P.save('trek/dump',clone({version:2,Ship:Ship,Now:Now,Param:Param,Etc:{klingon:Etc.klingon,nkling:Etc.nkling,fast:Etc.fast,starbase:Etc.starbase,snapshot:Etc.snapshot,statreport:Etc.statreport},Game:Game,Sect:Sect,Quad:Quad,Move:Move,Event:Event}));
    if(ok===false)pr('cannot dump\n');
  }
  function goodDump(s){
    if(!s||typeof s!=='object'||s.version!==2)return false;
    if(!sameShape(Ship,s.Ship)||!sameShape({bases:0,klings:0,date:0,time:0,resource:0,distressed:0,eventptr:Now.eventptr,base:Now.base},s.Now)||!sameShape(Param,s.Param)||!sameShape(Game,s.Game)||!sameShape(Quad,s.Quad)||!sameShape(Move,s.Move)||!sameShape(Event,s.Event))return false;
    if(!s.Etc||!sameShape({klingon:Etc.klingon,nkling:0,fast:0,starbase:Etc.starbase,statreport:0},s.Etc))return false;
    if(!Array.isArray(s.Sect)||s.Sect.length!==Sect.length)return false;
    var k,m;
    for(k=0;k<Sect.length;k++)if(!isInt(s.Sect[k],0,127))return false;
    var S=s.Ship;
    if(!isInt(S.quadx,0,NQUADS-1)||!isInt(S.quady,0,NQUADS-1)||!isInt(S.sectx,0,NSECTS-1)||!isInt(S.secty,0,NSECTS-1)||!isInt(S.cond,0,3)||!isInt(S.torped,-128,127)||(S.ship!==ENTERPRISE&&S.ship!==QUEENE))return false;
    if(!isInt(s.Etc.nkling,-1,MAXKLQUAD)||!isInt(s.Now.bases,0,MAXBASES)||!isInt(s.Now.klings,-128,127)||!isInt(s.Game.skill,1,6)||!isInt(s.Game.length,1,4)||typeof s.Game.passwd!=='string')return false;
    for(k=0;k<MAXKLQUAD;k++)if(!isInt(s.Etc.klingon[k].x,0,NSECTS-1)||!isInt(s.Etc.klingon[k].y,0,NSECTS-1)||!isInt(s.Etc.klingon[k].power,-2147483648,2147483647))return false;
    for(k=0;k<MAXBASES;k++)if(!isInt(s.Now.base[k].x,0,NQUADS-1)||!isInt(s.Now.base[k].y,0,NQUADS-1))return false;
    for(k=0;k<NEVENTS;k++)if(!isInt(s.Now.eventptr[k],-1,MAXEVENTS-1))return false;
    if(s.Now.eventptr[E_LRTB]<0)return false;
    for(k=0;k<MAXEVENTS;k++){
      var e=s.Event[k];
      if(!isInt(e.x,0,NQUADS-1)||!isInt(e.y,0,NQUADS-1)||!isInt(e.evcode,-128,127)||!isInt(e.systemname,0,NINHAB+NDEV))return false;
    }
    for(k=0;k<NQUADS;k++)for(m=0;m<NQUADS;m++){
      var q=s.Quad[k][m];
      if(!isInt(q.klings,0,MAXKLQUAD)||!isInt(q.bases,0,1)||!isInt(q.stars,-1,127)||!isInt(q.holes,-128,127)||!isInt(q.qsystemname,-128,127)||!isInt(q.scanned,-100000,1001))return false;
    }
    for(k=0;k<NDEV;k++)if(!isInt(s.Param.damprob[k],0,1000))return false;
    return true;
  }
  function assign(to,from){
    var k;
    for(k in to)if(P.has(to,k)&&P.has(from,k)){
      if(to[k]&&typeof to[k]==='object'&&!Array.isArray(to[k]))assign(to[k],from[k]);
      else if(Array.isArray(to[k])){
        if(to[k].length&&typeof to[k][0]==='object')for(var n=0;n<to[k].length;n++){
          if(Array.isArray(to[k][n]))for(var r=0;r<to[k][n].length;r++)assign(to[k][n][r],from[k][n][r]);
          else assign(to[k][n],from[k][n]);
        }
        else for(var m=0;m<to[k].length;m++)to[k][m]=from[k][m];
      }
      else to[k]=from[k];
    }
  }
  function restartgame(){
    var s=P.saved('trek/dump');
    if(s===null||!goodDump(s)){
      pr('cannot restart\n');
      return 1;
    }
    assign(Ship,s.Ship);
    assign(Now,s.Now);
    assign(Param,s.Param);
    Etc.nkling=s.Etc.nkling;Etc.fast=s.Etc.fast;Etc.statreport=s.Etc.statreport;Etc.snapshot=s.Etc.snapshot||null;
    assign({starbase:Etc.starbase,k:0},{starbase:s.Etc.starbase,k:0});
    s.Etc.klingon.forEach(function(q,k){copyK(q,Etc.klingon[k])});
    assign(Game,s.Game);
    for(var k=0;k<Sect.length;k++)Sect[k]=s.Sect[k];
    for(k=0;k<NQUADS;k++)for(var m=0;m<NQUADS;m++)assign(Quad[k][m],s.Quad[k][m]);
    assign(Move,s.Move);
    for(k=0;k<MAXEVENTS;k++)assign(Event[k],s.Event[k]);
    return 0;
  }
  /* ---------- dumpme.c, dumpssradio.c ---------- */
  function* dumpme(f){
    var x=0,e,k;
    Ship.quadx=ranf(NQUADS);
    Ship.quady=ranf(NQUADS);
    Ship.sectx=ranf(NSECTS);
    Ship.secty=ranf(NSECTS);
    x+=1.5*franf();
    Move.time+=x;
    if(f)pr(Ship.shipname+' falls into a black hole.\n');
    else{
      pr('Computer applies full reverse power to avoid hitting the\n');
      pr('   negative energy barrier.  A space warp was entered.\n');
    }
    for(k=0;k<MAXEVENTS;k++){
      e=Event[k];
      if(e.evcode!==E_FIXDV)continue;
      reschedule(e,(e.date-Now.date)+x);
    }
    yield* events(1);
    pr('You are now in quadrant '+Ship.quadx+','+Ship.quady+'.  It is stardate '+f2(Now.date)+'\n');
    Move.time=0;
  }
  function dumpssradio(){
    var e,k,chkrest=0;
    for(k=0;k<MAXEVENTS;k++){
      e=Event[k];
      if((e.evcode&E_HIDDEN)===0)continue;
      if(e.evcode&E_GHOST){
        unschedule(e);
        pr('Starsystem '+Systemname[e.systemname&Q_SYSTEM]+' in quadrant '+e.x+','+e.y+' is no longer distressed\n');
        continue;
      }
      switch(e.evcode){
        case E_KDESB:
          pr('Starbase in quadrant '+e.x+','+e.y+' is under attack\n');
          chkrest++;
          break;
        case E_ENSLV:case E_REPRO:
          pr('Starsystem '+Systemname[e.systemname&Q_SYSTEM]+' in quadrant '+e.x+','+e.y+' is distressed\n');
          chkrest++;
          break;
      }
    }
    return chkrest;
  }
  /* ---------- events.c ---------- */
  function* events(warpf){
    var k,m,kl,rtime,xdate,idate,ev,ix,iy,q,e,evnum,restcancel,sp;
    if(Move.time<=0.0){
      Now.time=Now.resource/Now.klings;
      return 0;
    }
    Ship.cloakgood=1;
    idate=Now.date;
    if(Move.time>0.5&&Move.resting)schedule(E_ATTACK,0.5,0,0,0);
    for(;;){
      restcancel=0;
      evnum=-1;
      xdate=idate+Move.time;
      for(k=0;k<MAXEVENTS;k++){
        e=Event[k];
        if(e.evcode===0||(e.evcode&E_GHOST))continue;
        if(e.date<xdate){
          xdate=e.date;
          ev=e;
          evnum=k;
        }
      }
      e=ev;
      rtime=xdate-Now.date;
      Now.resource-=Now.klings*rtime;
      Now.time=Now.resource/Now.klings;
      Now.date=xdate;
      if(Now.time<=0.0)yield* lose(L_NOTIME);
      if(evnum<0)break;
      sw:switch(e.evcode&E_EVENT){
        case E_SNOVA:
          yield* snova(-1,0);
          xresched(e,E_SNOVA,1);
          break;
        case E_LRTB:
          xresched(e,E_LRTB,Now.klings);
          if(Ship.cond!==DOCKED){
            k=ranf(Now.klings)+1;
            for(ix=0;ix<NQUADS;ix++){
              for(iy=0;iy<NQUADS;iy++){
                q=Quad[ix][iy];
                if(q.stars>=0)if((k-=q.klings)<=0)break;
              }
              if(k<=0)break;
            }
            if(Ship.quadx===ix&&Ship.quady===iy)break;
            Ship.quadx=ix;
            Ship.quady=iy;
            pr('\n'+Ship.shipname+' caught in long range tractor beam\n');
            pr('*** Pulled to quadrant '+Ship.quadx+','+Ship.quady+'\n');
            Ship.sectx=ranf(NSECTS);
            Ship.secty=ranf(NSECTS);
            yield* initquad(0);
            Move.time=xdate-idate;
          }
          break;
        case E_KATSB:
          if(Now.bases<=0){
            unschedule(e);
            break;
          }
          for(k=0;k<Now.bases;k++){
            ix=Now.base[k].x;
            iy=Now.base[k].y;
            q=Quad[ix][iy];
            if(q.klings<=0)continue;
            for(m=0;m<MAXEVENTS;m++){
              e=Event[m];
              if((e.evcode&E_EVENT)!==E_KDESB)continue;
              if(e.x===ix&&e.y===iy)break;
            }
            if(m<MAXEVENTS)continue;
            break;
          }
          e=ev;
          if(k>=Now.bases){
            reschedule(e,0.5+3.0*franf());
            break;
          }
          xresched(e,E_KATSB,1);
          e=xsched(E_KDESB,1,ix,iy,0);
          if(!damaged(SSRADIO)){
            pr('\nUhura:  Captain, we have recieved a distress signal\n');
            pr('  from the starbase in quadrant '+ix+','+iy+'.\n');
            restcancel++;
          }
          else e.evcode=int8(e.evcode|E_HIDDEN);
          break;
        case E_KDESB:
          unschedule(e);
          q=Quad[e.x][e.y];
          if(q.bases<=0||q.klings<=0)break;
          if(e.x===Ship.quadx&&e.y===Ship.quady){
            pr('\nSpock: ');
            killb(Ship.quadx,Ship.quady);
          }
          else killb(e.x,e.y);
          break;
        case E_ISSUE:
          xresched(e,E_ISSUE,1);
          if(Ship.distressed>=MAXDISTR)break;
          for(k=0;k<100;k++){
            ix=ranf(NQUADS);
            iy=ranf(NQUADS);
            q=Quad[ix][iy];
            if(!((ix===Ship.quadx&&iy===Ship.quady)||q.stars<0||(q.qsystemname&Q_DISTRESSED)||(q.qsystemname&Q_SYSTEM)===0||q.klings<=0))break;
          }
          if(k>=100)break;
          Ship.distressed++;
          e=xsched(E_ENSLV,1,ix,iy,q.qsystemname);
          q.qsystemname=int8(e.idx|Q_DISTRESSED);
          if(!damaged(SSRADIO)){
            pr('\nUhura: Captain, starsystem '+Systemname[e.systemname]+' in quadrant '+ix+','+iy+' is under attack\n');
            restcancel++;
          }
          else e.evcode=int8(e.evcode|E_HIDDEN);
          break;
        case E_ENSLV:
          unschedule(e);
          q=Quad[e.x][e.y];
          if(q.klings<=0){
            q.qsystemname=e.systemname;
            break;
          }
          e=schedule(E_REPRO,Param.eventdly[E_REPRO]*franf(),e.x,e.y,e.systemname);
          if(!damaged(SSRADIO)){
            pr("\nUhura:  We've lost contact with starsystem "+Systemname[e.systemname]+'\n');
            pr('  in quadrant '+e.x+','+e.y+'.\n');
          }
          else e.evcode=int8(e.evcode|E_HIDDEN);
          break;
        case E_REPRO:
          q=Quad[e.x][e.y];
          if(q.klings<=0){
            unschedule(e);
            q.qsystemname=e.systemname;
            break;
          }
          xresched(e,E_REPRO,1);
          ix=e.x;
          iy=e.y;
          if(Now.klings===127)break;
          if(q.klings>=MAXKLQUAD){
            for(k=ix-1;k<=ix+1;k++){
              if(k<0||k>=NQUADS)continue;
              for(m=iy-1;m<=iy+1;m++){
                if(m<0||m>=NQUADS)continue;
                q=Quad[k][m];
                if(q.klings>=MAXKLQUAD||q.stars<0)continue;
                break;
              }
              if(m<=iy+1)break;
            }
            if(m>iy+1)break;
            ix=k;
            iy=m;
          }
          q.klings++;
          Now.klings++;
          if(ix===Ship.quadx&&iy===Ship.quady){
            sp=sector();
            ix=sp[0];iy=sp[1];
            SS(ix,iy,KLINGON);
            kl=Etc.klingon[Etc.nkling++];
            kl.x=ix;
            kl.y=iy;
            kl.power=Param.klingpwr;
            kl.srndreq=0;
            compkldist(Etc.klingon[0].dist===Etc.klingon[0].avgdist?0:1);
          }
          Now.time=Now.resource/Now.klings;
          break;
        case E_SNAP:
          xresched(e,E_SNAP,1);
          Etc.snapshot=clone({Quad:Quad,Event:Event,Now:Now});
          Game.snap=1;
          break;
        case E_ATTACK:
          if(!Move.resting){
            unschedule(e);
            break;
          }
          yield* attack(1);
          reschedule(e,0.5);
          break;
        case E_FIXDV:
          k=e.systemname;
          unschedule(e);
          pr(Device[k][1]+' reports repair work on the '+Device[k][0]+' finished.\n');
          switch(k){
            case LIFESUP:
              Ship.reserves=Param.reserves;
              break;
            case SINS:
              if(Ship.cond===DOCKED)break;
              pr('Spock has tried to recalibrate your Space Internal Navigation System,\n');
              pr('  but he has no standard base to calibrate to.  Suggest you get\n');
              pr('  to a starbase immediately so that you can properly recalibrate.\n');
              Ship.sinsbad=1;
              break;
            case SSRADIO:
              restcancel=dumpssradio();
              break;
          }
          break;
        default:
          break;
      }
      if(restcancel&&Move.resting&&(yield* getynpar('Spock: Shall we cancel our rest period')))Move.time=xdate-idate;
    }
    if(Now.eventptr[E_ATTACK]>=0)unschedule(Event[Now.eventptr[E_ATTACK]]);
    if(!warpf){
      if(Ship.cloaked)Ship.energy=trunc(Ship.energy-Param.cloakenergy*Move.time);
      rtime=1.0-Math.exp(-Param.regenfac*Move.time);
      Ship.shield=trunc(Ship.shield+(Param.shield-Ship.shield)*rtime);
      Ship.energy=trunc(Ship.energy+(Param.energy-Ship.energy)*rtime);
      if(damaged(LIFESUP)&&Ship.cond!==DOCKED)Ship.reserves-=Move.time;
    }
    return 0;
  }
  function* getcodi(){
    var co=yield* getintpar('Course'),di;
    if(co<0||co>360)return null;
    di=yield* getfltpar('Distance');
    if(di<=0.0||di>15.0)return null;
    return [co,di];
  }
  /* ---------- help.c ---------- */
  function* help(){
    var k,dist,x,dx,dy,m,l;
    if(Ship.cond===DOCKED){pr("Uhura: But Captain, we're already docked\n");return}
    if(damaged(SSRADIO)){out(SSRADIO);return}
    if(Now.bases<=0){pr("Uhura: I'm not getting any response from starbase\n");return}
    Game.helps=int8(Game.helps+1);
    dist=1e50;
    if(Quad[Ship.quadx][Ship.quady].bases<=0){
      for(k=0;k<Now.bases;k++){
        dx=Now.base[k].x-Ship.quadx;
        dy=Now.base[k].y-Ship.quady;
        x=dx*dx+dy*dy;
        x=Math.sqrt(x);
        if(x<dist){
          dist=x;
          l=k;
        }
      }
      Ship.quadx=Now.base[l].x;
      Ship.quady=Now.base[l].y;
      yield* initquad(1);
    }
    else dist=0.0;
    SS(Ship.sectx,Ship.secty,EMPTY);
    pr('Starbase in '+Ship.quadx+','+Ship.quady+' responds\n');
    x=Math.pow(1.0-Math.pow(0.94,dist),0.3333333);
    for(k=0;k<3;k++){
      yield* sleep(2);
      pr(Cntvect[k]+' attempt to rematerialize ');
      if(franf()>x){
        for(m=0;m<5;m++){
          dx=Etc.starbase.x+ranf(3)-1;
          if(dx<0||dx>=NSECTS)continue;
          dy=Etc.starbase.y+ranf(3)-1;
          if(dy<0||dy>=NSECTS||SG(dx,dy)!==EMPTY)continue;
          break;
        }
        if(m<5){
          pr('succeeds\n');
          Ship.sectx=dx;
          Ship.secty=dy;
          SS(dx,dy,Ship.ship);
          dock();
          compkldist(0);
          return;
        }
      }
      pr('fails\n');
    }
    yield* lose(L_NOHELP);
  }
  /* ---------- impulse.c ---------- */
  function* impulse(){
    var c,power,dist,time,percent;
    if(Ship.cond===DOCKED){pr('Scotty: Sorry captain, but we are still docked.\n');return}
    if(damaged(IMPULSE)){out(IMPULSE);return}
    if(!(c=yield* getcodi()))return;
    dist=c[1];
    power=trunc(20+100*dist);
    percent=trunc(idiv(100*power,Ship.energy)+0.5);
    if(percent>=85){
      pr('Scotty: That would consume '+percent+'% of our remaining energy.\n');
      if(!(yield* getynpar('Are you sure that is wise')))return;
      pr('Aye aye, sir\n');
    }
    time=dist/0.095;
    percent=trunc(100*time/Now.time+0.5);
    if(percent>=85){
      pr('Spock: That would take '+percent+'% of our remaining time.\n');
      if(!(yield* getynpar('Are you sure that is wise')))return;
      pr("(He's finally gone mad)\n");
    }
    Move.time=yield* move(0,c[0],time,0.095);
    Ship.energy=trunc(Ship.energy-(20+100*Move.time*0.095));
  }
  /* ---------- kill.c ---------- */
  function* killk(ix,iy){
    var k;
    pr('   *** Klingon at '+ix+','+iy+' destroyed ***\n');
    Now.klings=int8(Now.klings-1);
    SS(ix,iy,EMPTY);
    Quad[Ship.quadx][Ship.quady].klings-=1;
    Quad[Ship.quadx][Ship.quady].scanned-=100;
    Game.killk+=1;
    for(k=0;k<Etc.nkling;k++)
      if(ix===Etc.klingon[k].x&&iy===Etc.klingon[k].y){
        Etc.nkling-=1;
        for(;k<Etc.nkling;k++)copyK(Etc.klingon[k+1],Etc.klingon[k]);
        break;
      }
    if(Now.klings<=0)yield* win();
    Now.time=Now.resource/Now.klings;
  }
  function killb(qx,qy){
    /* nova() passes sector coordinates: the C's Quad[qx][qy] is then just base+8*qx+qy, whatever is there */
    var idx=qx*8+qy,q=idx<64?Quad[idx>>3][idx&7]:{bases:0},b;
    if(q.bases<=0)return;
    if(!damaged(SSRADIO)){
      if(q.scanned<1000)q.scanned-=10;
      else if(q.scanned>1000)q.scanned=-1;
    }
    q.bases=0;
    Now.bases-=1;
    for(b=0;b<MAXBASES;b++)if(qx===Now.base[b].x&&qy===Now.base[b].y)break;
    if(b<MAXBASES){
      Now.base[b].x=Now.base[Now.bases].x;
      Now.base[b].y=Now.base[Now.bases].y;
    }
    if(qx===Ship.quadx&&qy===Ship.quady){
      SS(Etc.starbase.x,Etc.starbase.y,EMPTY);
      if(Ship.cond===DOCKED)undock();
      pr('Starbase at '+Etc.starbase.x+','+Etc.starbase.y+' destroyed\n');
    }
    else{
      if(!damaged(SSRADIO)){
        pr('Uhura: Starfleet command reports that the starbase in\n');
        pr('   quadrant '+qx+','+qy+' has been destroyed\n');
      }
      else schedule(E_KATSB|E_GHOST,1e50,qx,qy,0);
    }
  }
  function kills(x,y,f){
    var q,e,name;
    if(f){
      q=Quad[Ship.quadx][Ship.quady];
      SS(x,y,EMPTY);
      name=systemname(q);
      if(name===null)return;
      pr('Inhabited starsystem '+name+' at '+x+','+y+' destroyed\n');
      if(f<0)Game.killinhab=int8(Game.killinhab+1);
    }
    else q=Quad[x][y];
    if(q.qsystemname&Q_DISTRESSED){
      e=Event[q.qsystemname&Q_SYSTEM];
      pr('Distress call for '+Systemname[e.systemname]+' invalidated\n');
      unschedule(e);
    }
    q.qsystemname=0;
    q.stars-=1;
  }
  function killd(x,y,f){
    var e,k,q=Quad[x][y];
    for(k=0;k<MAXEVENTS;k++){
      e=Event[k];
      if(e.x!==x||e.y!==y)continue;
      switch(e.evcode){
        case E_KDESB:
          if(f){
            pr('Distress call for starbase in '+x+','+y+' nullified\n');
            unschedule(e);
          }
          break;
        case E_ENSLV:case E_REPRO:
          if(f){
            pr('Distress call for '+Systemname[e.systemname]+' in quadrant '+x+','+y+' nullified\n');
            q.qsystemname=e.systemname;
            unschedule(e);
          }
          else e.evcode=int8(e.evcode|E_GHOST);
      }
    }
  }
  /* ---------- klmove.c ---------- */
  function klmove(fl){
    var n,k,dx,dy,nextx,nexty,lookx,looky,motion,fudgex,fudgey,qx,qy,bigger,c;
    for(n=0;n<Etc.nkling;k&&n++){
      k=Etc.klingon[n];
      c=100;
      if(fl)c=trunc(100.0*k.power/Param.klingpwr);
      if(ranf(c)>=Param.moveprob[2*Move.newquad+fl])continue;
      motion=ranf(75)-25;
      motion=trunc(motion*(k.avgdist*Param.movefac[2*Move.newquad+fl]));
      dx=Ship.sectx-k.x+ranf(3)-1;
      dy=Ship.secty-k.y+ranf(3)-1;
      bigger=dx;
      if(dy>bigger)bigger=dy;
      if(bigger===0.0)bigger=1.0;
      dx=dx/bigger+0.5;
      dy=dy/bigger+0.5;
      if(motion<0){
        motion=-motion;
        dx=-dx;
        dy=-dy;
      }
      fudgex=fudgey=1;
      nextx=k.x;
      nexty=k.y;
      for(;motion>0;motion--){
        lookx=trunc(nextx+dx);
        looky=trunc(nexty+dy);
        if(lookx<0||lookx>=NSECTS||looky<0||looky>=NSECTS){
          qx=Ship.quadx;
          qy=Ship.quady;
          if(lookx<0)qx-=1;
          else if(lookx>=NSECTS)qx+=1;
          if(looky<0)qy-=1;
          else if(looky>=NSECTS)qy+=1;
          if(qx<0||qx>=NQUADS||qy<0||qy>=NQUADS||Quad[qx][qy].stars<0||Quad[qx][qy].klings>MAXKLQUAD-1)break;
          if(!damaged(SRSCAN)){
            pr('Klingon at '+k.x+','+k.y+' escapes to quadrant '+qx+','+qy+'\n');
            motion=Quad[qx][qy].scanned;
            if(motion>=0&&motion<1000)Quad[qx][qy].scanned+=100;
            motion=Quad[Ship.quadx][Ship.quady].scanned;
            if(motion>=0&&motion<1000)Quad[Ship.quadx][Ship.quady].scanned-=100;
          }
          SS(k.x,k.y,EMPTY);
          Quad[qx][qy].klings+=1;
          Etc.nkling-=1;
          copyK(Etc.klingon[Etc.nkling],k);
          Quad[Ship.quadx][Ship.quady].klings-=1;
          k=null;
          break;
        }
        if(SG(lookx,looky)!==EMPTY){
          lookx=nextx+fudgex;
          if(lookx<0||lookx>=NSECTS)lookx=trunc(nextx+dx);
          if(SG(lookx,looky)!==EMPTY){
            fudgex=-fudgex;
            looky=nexty+fudgey;
            if(looky<0||looky>=NSECTS||SG(lookx,looky)!==EMPTY){
              fudgey=-fudgey;
              break;
            }
          }
        }
        nextx=lookx;
        nexty=looky;
      }
      if(k&&(k.x!==nextx||k.y!==nexty)){
        if(!damaged(SRSCAN))pr('Klingon at '+k.x+','+k.y+' moves to '+nextx+','+nexty+'\n');
        SS(k.x,k.y,EMPTY);
        SS(k.x=nextx,k.y=nexty,KLINGON);
      }
    }
    compkldist(0);
  }
  /* ---------- lose.c ---------- */
  function* lose(why){
    Game.killed=1;
    yield* sleep(1);
    pr('\n'+Losemsg[why-1]+'\n');
    if(why===L_NOTIME)Game.killed=0;
    Move.endgame=-1;
    score();
    yield* skiptonl(0);
    throw RESET;
  }
  /* ---------- lrscan.c ---------- */
  function* lrscan(){
    var k,m,q;
    if(check_out(LRSCAN))return;
    pr('Long range scan for quadrant '+Ship.quadx+','+Ship.quady+'\n\n');
    for(m=Ship.quady-1;m<=Ship.quady+1;m++){
      if(m<0||m>=NQUADS)pr('      ');
      else pr('     '+m);
    }
    for(k=Ship.quadx-1;k<=Ship.quadx+1;k++){
      pr('\n  -------------------\n');
      if(k<0||k>=NQUADS){
        pr('  !  *  !  *  !  *  !');
        continue;
      }
      pr(k+' !');
      for(m=Ship.quady-1;m<=Ship.quady+1;m++){
        if(m<0||m>=NQUADS){
          pr('  *  !');
          continue;
        }
        q=Quad[k][m];
        if(q.stars<0){
          pr(' /// !');
          q.scanned=1000;
          continue;
        }
        q.scanned=q.klings*100+q.bases*10+q.stars;
        pr(' '+pad(q.scanned,3)+' !');
      }
    }
    pr('\n  -------------------\n');
  }
  /* ---------- move.c ---------- */
  function* move(ramflag,course,time,speed){
    var angle,x,y,dx,dy,ix,iy,bigger,n,k,dist,sectsize=NSECTS,xn,evtime;
    angle=course*0.0174532925;
    if(damaged(SINS))angle+=Param.navigcrud[1]*(franf()-0.5);
    else if(Ship.sinsbad)angle+=Param.navigcrud[0]*(franf()-0.5);
    dx=-Math.cos(angle);
    dy=Math.sin(angle);
    bigger=Math.abs(dx);
    dist=Math.abs(dy);
    if(dist>bigger)bigger=dist;
    dx/=bigger;
    dy/=bigger;
    evtime=Event[Now.eventptr[E_LRTB]].date-Now.date;
    if(time>evtime&&Etc.nkling<3){
      evtime+=0.005;
      time=evtime;
    }
    else evtime=-1.0e50;
    dist=time*speed;
    SS(Ship.sectx,Ship.secty,EMPTY);
    x=Ship.sectx+0.5;
    y=Ship.secty+0.5;
    xn=NSECTS*dist*bigger;
    n=trunc(xn+0.5);
    Move.free=0;
    for(k=0;k<n;k++){
      ix=trunc(x+=dx);
      iy=trunc(y+=dy);
      if(x<0.0||y<0.0||x>=sectsize||y>=sectsize){
        dx=Ship.quadx*NSECTS+Ship.sectx+dx*xn;
        dy=Ship.quady*NSECTS+Ship.secty+dy*xn;
        if(dx<0.0)ix=-1;
        else ix=trunc(dx+0.5);
        if(dy<0.0)iy=-1;
        else iy=trunc(dy+0.5);
        Ship.sectx=trunc(x);
        Ship.secty=trunc(y);
        compkldist(0);
        Move.newquad=2;
        yield* attack(0);
        yield* checkcond();
        Ship.quadx=Math.trunc(ix/NSECTS);
        Ship.quady=Math.trunc(iy/NSECTS);
        Ship.sectx=ix%NSECTS;
        Ship.secty=iy%NSECTS;
        if(ix<0||Ship.quadx>=NQUADS||iy<0||Ship.quady>=NQUADS){
          if(!damaged(COMPUTER))yield* dumpme(0);
          else yield* lose(L_NEGENB);
        }
        yield* initquad(0);
        n=0;
        break;
      }
      if(SG(ix,iy)!==EMPTY){
        if(!damaged(COMPUTER)&&ramflag<=0){
          ix=trunc(x-dx);
          iy=trunc(y-dy);
          pr('Computer reports navigation error; '+Ship.shipname+' stopped at '+ix+','+iy+'\n');
          Ship.energy=trunc(Ship.energy-Param.stopengy*speed);
          break;
        }
        if(SG(ix,iy)===HOLE){
          yield* dumpme(1);
          yield* initquad(0);
          n=0;
          break;
        }
        yield* ram(ix,iy);
        break;
      }
    }
    if(n>0){
      dx=Ship.sectx-ix;
      dy=Ship.secty-iy;
      dist=Math.sqrt(dx*dx+dy*dy)/NSECTS;
      time=dist/speed;
      if(evtime>time)time=evtime;
      Ship.sectx=ix;
      Ship.secty=iy;
    }
    SS(Ship.sectx,Ship.secty,Ship.ship);
    compkldist(0);
    return time;
  }
  /* ---------- nova.c ---------- */
  function* nova(x,y){
    var k,m,se;
    if(SG(x,y)!==STAR||Quad[Ship.quadx][Ship.quady].stars<0)return;
    if(ranf(100)<15){
      pr('Spock: Star at '+x+','+y+' failed to nova.\n');
      return;
    }
    if(ranf(100)<5){
      yield* snova(x,y);
      return;
    }
    pr('Spock: Star at '+x+','+y+' gone nova\n');
    if(ranf(4)!==0)SS(x,y,EMPTY);
    else{
      SS(x,y,HOLE);
      Quad[Ship.quadx][Ship.quady].holes+=1;
    }
    Quad[Ship.quadx][Ship.quady].stars-=1;
    Game.kills+=1;
    for(k=x-1;k<=x+1;k++){
      if(k<0||k>=NSECTS)continue;
      for(m=y-1;m<=y+1;m++){
        if(m<0||m>=NSECTS)continue;
        se=SG(k,m);
        switch(se){
          case EMPTY:case HOLE:
            break;
          case KLINGON:
            yield* killk(k,m);
            break;
          case STAR:
            yield* nova(k,m);
            break;
          case INHABIT:
            kills(k,m,-1);
            break;
          case BASE:
            killb(k,m);
            Game.killb=int8(Game.killb+1);
            break;
          case ENTERPRISE:case QUEENE:
            se=2000;
            if(Ship.shldup){
              if(Ship.shield>=se){
                Ship.shield-=se;
                se=0;
              }
              else{
                se-=Ship.shield;
                Ship.shield=0;
              }
            }
            Ship.energy-=se;
            if(Ship.energy<=0)yield* lose(L_SUICID);
            break;
          default:
            pr('Unknown object '+String.fromCharCode(se)+' at '+k+','+m+' destroyed\n');
            SS(k,m,EMPTY);
            break;
        }
      }
    }
  }
  /* ---------- phaser.c ---------- */
  function* phaser(){
    var k,m,kl,dx,dy,anglefactor,distfactor,b,manual,flag,extra=0,hit,tot,n,hitreqd=[],bank=[],ptr,ki;
    if(Ship.cond===DOCKED){pr('Phasers cannot fire through starbase shields\n');return}
    if(damaged(PHASER)){out(PHASER);return}
    if(Ship.shldup){pr('Sulu: Captain, we cannot fire through shields.\n');return}
    if(Ship.cloaked){
      pr('Sulu: Captain, surely you must realize that we cannot fire\n');
      pr('  phasers with the cloaking device up.\n');
      return;
    }
    manual=0;
    if(yield* testnl()){
      if(damaged(COMPUTER)){
        pr(Device[COMPUTER][0]);
        manual++;
      }
      else if(damaged(SRSCAN)){
        pr(Device[SRSCAN][0]);
        manual++;
      }
      if(manual)pr(' damaged, manual mode selected\n');
    }
    if(!manual){
      ptr=yield* getcodpar('Manual or automatic',Matab);
      manual=ptr[2];
    }
    if(!manual&&damaged(COMPUTER)){
      pr('Computer damaged, manual selected\n');
      yield* skiptonl(0);
      manual++;
    }
    flag=1;
    for(k=0;k<NBANKS;k++)bank.push({units:0,angle:0,spread:0});
    if(manual){
      while(flag){
        pr(Ship.energy+' units available\n');
        extra=0;
        flag=0;
        for(k=0;k<NBANKS;k++){
          b=bank[k];
          pr('\nBank '+k+':\n');
          hit=yield* getintpar('units');
          if(hit<0)return;
          if(hit===0)break;
          extra+=hit;
          if(extra>Ship.energy){
            pr('available energy exceeded.  ');
            yield* skiptonl(0);
            flag++;
            break;
          }
          b.units=hit;
          hit=yield* getintpar('course');
          if(hit<0||hit>360)return;
          b.angle=hit*0.0174532925;
          b.spread=yield* getfltpar('spread');
          if(b.spread<0||b.spread>1)return;
        }
        Ship.energy-=extra;
      }
      extra=0;
    }
    else{
      if(Etc.nkling<=0){pr('Sulu: But there are no Klingons in this quadrant\n');return}
      pr('Phasers locked on target.  ');
      while(flag){
        pr(Ship.energy+' units available\n');
        hit=yield* getintpar('Units to fire');
        if(hit<=0)return;
        if(hit>Ship.energy){
          pr('available energy exceeded.  ');
          yield* skiptonl(0);
          continue;
        }
        flag=0;
        Ship.energy-=hit;
        extra=hit;
        n=Etc.nkling;
        if(n>NBANKS)n=NBANKS;
        tot=Math.trunc(n*(n+1)/2);
        for(k=0;k<n;k++){
          kl=Etc.klingon[k];
          b=bank[k];
          distfactor=kl.dist;
          anglefactor=ALPHA*BETA*OMEGA/(distfactor*distfactor+EPSILON);
          anglefactor*=GAMMA;
          distfactor=kl.power;
          distfactor/=anglefactor;
          hitreqd[k]=trunc(distfactor+0.5);
          dx=Ship.sectx-kl.x;
          dy=kl.y-Ship.secty;
          b.angle=Math.atan2(dy,dx);
          b.spread=0.0;
          b.units=trunc(((n-k)/tot)*extra);
          extra-=b.units;
          hit=b.units-hitreqd[k];
          if(hit>0){
            extra+=hit;
            b.units-=hit;
          }
        }
        if(extra>0){
          for(k=0;k<n;k++){
            b=bank[k];
            hit=hitreqd[k]-b.units;
            if(hit<=0)continue;
            if(hit>=extra){
              b.units+=extra;
              extra=0;
              break;
            }
            b.units=hitreqd[k];
            extra-=hit;
          }
          if(extra>0)pr(extra+' units overkill\n');
        }
      }
    }
    Move.free=0;
    for(k=0;k<NBANKS;k++){
      b=bank[k];
      if(b.units<=0)continue;
      pr('\nPhaser bank '+k+' fires:\n');
      n=Etc.nkling;
      ki=0;
      for(m=0;m<n;m++){
        if(b.units<=0)break;
        kl=Etc.klingon[ki];
        distfactor=BETA+franf();
        distfactor*=ALPHA+b.spread;
        distfactor*=OMEGA;
        anglefactor=kl.dist;
        distfactor/=anglefactor*anglefactor+EPSILON;
        distfactor*=b.units;
        dx=Ship.sectx-kl.x;
        dy=kl.y-Ship.secty;
        anglefactor=Math.atan2(dy,dx)-b.angle;
        anglefactor=Math.cos((anglefactor*b.spread)+GAMMA);
        if(anglefactor<0.0){
          ki++;
          continue;
        }
        hit=trunc(anglefactor*distfactor+0.5);
        kl.power-=hit;
        pr(hit+' unit hit on Klingon');
        if(!damaged(SRSCAN))pr(' at '+kl.x+','+kl.y);
        pr('\n');
        b.units-=hit;
        if(kl.power<=0){
          yield* killk(kl.x,kl.y);
          continue;
        }
        ki++;
      }
    }
    for(k=0;k<NBANKS;k++)extra+=bank[k].units;
    if(extra>0)pr('\n'+extra+' units expended on empty space\n');
  }
  /* ---------- ram.c ---------- */
  function* ram(ix,iy){
    var k,c;
    pr('RED ALERT: collision imminent\n');
    c=SG(ix,iy);
    switch(c){
      case KLINGON:
        pr(Ship.shipname+' rams Klingon at '+ix+','+iy+'\n');
        yield* killk(ix,iy);
        break;
      case STAR:case INHABIT:
        pr('Yeoman Rand: Captain, isn\'t it getting hot in here?\n');
        yield* sleep(2);
        pr('Spock: Hull temperature approaching 550 Degrees Kelvin.\n');
        yield* lose(L_STAR);
      /* falls through */
      case BASE:
        pr('You ran into the starbase at '+ix+','+iy+'\n');
        killb(Ship.quadx,Ship.quady);
        if(!damaged(SINS))Game.killb=int8(Game.killb+1);
        break;
    }
    yield* sleep(2);
    pr(Ship.shipname+' heavily damaged\n');
    k=10+ranf(20*Game.skill);
    Game.deaths+=k;
    Ship.crew-=k;
    pr('McCoy: Take it easy Jim; we had '+k+' casualties.\n');
    for(k=0;k<NDEV;k++){
      if(ranf(100)<20)continue;
      damage(k,(2.5*(franf()+franf())+1.0)*Param.damfac[k]);
    }
    Ship.shldup=0;
  }
  /* ---------- rest.c ---------- */
  function* rest(){
    var t,percent;
    t=yield* getfltpar('How long');
    if(t<=0.0)return;
    percent=trunc(100*t/Now.time+0.5);
    if(percent>=70){
      pr('Spock: That would take '+percent+'% of our remaining time.\n');
      if(!(yield* getynpar('Are you really certain that is wise')))return;
    }
    Move.time=t;
    t=Event[Now.eventptr[E_LRTB]].date-Now.date;
    if(Ship.cond!==DOCKED&&Move.time>t)Move.time=t+0.0001;
    Move.free=0;
    Move.resting=1;
  }
  /* ---------- score.c ---------- */
  function score(){
    var u,t,s,r;
    pr('\n*** Your score:\n');
    u=Game.killk;
    s=t=Math.trunc(Param.klingpwr/4)*u;
    if(t!==0)pr(u+' Klingons killed\t\t\t'+pad(t,6)+'\n');
    r=Now.date-Param.date;
    if(r<1.0)r=1.0;
    r=Game.killk/r;
    s+=(t=trunc(400*r));
    if(t!==0)pr('Kill rate '+f2(r)+' Klingons/stardate  \t'+pad(t,6)+'\n');
    r=Now.klings;
    r/=Game.killk+1;
    s+=(t=trunc(-400*r));
    if(t!==0)pr('Penalty for '+Now.klings+' klingons remaining\t'+pad(t,6)+'\n');
    if(Move.endgame>0){
      u=Game.skill;
      s+=(t=100*u);
      pr('Bonus for winning a '+Skitab[u-1][0]+Skitab[u-1][1]+' game\t\t'+pad(t,6)+'\n');
    }
    if(Game.killed){
      s-=500;
      pr('Penalty for getting killed\t\t  -500\n');
    }
    u=Game.killb;
    s+=(t=-100*u);
    if(t!==0)pr(u+' starbases killed\t\t\t'+pad(t,6)+'\n');
    u=Game.helps;
    s+=(t=-100*u);
    if(t!==0)pr(u+' calls for help\t\t\t'+pad(t,6)+'\n');
    u=Game.kills;
    s+=(t=-5*u);
    if(t!==0)pr(u+' stars destroyed\t\t\t'+pad(t,6)+'\n');
    u=Game.killinhab;
    s+=(t=-150*u);
    if(t!==0)pr(u+' inhabited starsystems destroyed\t'+pad(t,6)+'\n');
    if(Ship.ship!==ENTERPRISE){
      s-=200;
      pr('penalty for abandoning ship\t\t  -200\n');
    }
    u=Game.captives;
    s+=(t=3*u);
    if(t!==0)pr(u+' Klingons captured\t\t\t'+pad(t,6)+'\n');
    u=Game.deaths;
    s+=(t=-u);
    if(t!==0)pr(u+' casualties\t\t\t\t'+pad(t,6)+'\n');
    pr('\n***  TOTAL\t\t\t'+pad(s,14)+'\n');
    return s;
  }
  /* ---------- setwarp.c, shell.c ---------- */
  function* setwarp(){
    var warpfac=yield* getfltpar('Warp factor');
    if(warpfac<0.0)return;
    if(warpfac<1.0){pr('Minimum warp speed is 1.0\n');return}
    if(warpfac>10.0){pr('Maximum speed is warp 10.0\n');return}
    if(warpfac>6.0)pr('Damage to warp engines may occur above warp 6.0\n');
    Ship.warp=warpfac;
    Ship.warp2=Ship.warp*warpfac;
    Ship.warp3=Ship.warp2*warpfac;
  }
  function* shell(){
    if(!P.runScript||P.piped())return;
    for(;;){
      pr('% ');
      var l=yield;
      if(l===null||l===undefined||/^\s*(exit|logout)\s*$/.test(l))return;
      if(l.trim())P.runScript([l]);
    }
  }
  /* ---------- shield.c ---------- */
  function* shield(f){
    var k,r,device,dev2,dev3,ind,stat;
    if(f>0&&(Ship.shldup||damaged(SRSCAN)))return;
    if(f<0){
      if(Ship.ship===QUEENE){pr('Ye Faire Queene does not have the cloaking device.\n');return}
      device='Cloaking device';dev2='is';ind=CLOAK;dev3='it';stat='cloaked';
    }
    else{
      device='Shields';dev2='are';dev3='them';ind=SHIELD;stat='shldup';
    }
    if(damaged(ind)){
      if(f<=0)out(ind);
      return;
    }
    if(Ship.cond===DOCKED){
      pr(device+' '+dev2+' down while docked\n');
      return;
    }
    if(f<=0&&!(yield* testnl())){
      r=yield* getcodpar('Up or down',Udtab);
      k=r[2];
    }
    else{
      var s=Ship[stat]?device+' '+dev2+' up.  Do you want '+dev3+' down':device+' '+dev2+' down.  Do you want '+dev3+' up';
      if(!(yield* getynpar(s)))return;
      k=Ship[stat]?0:1;
    }
    if(Ship[stat]===k){
      pr(device+' already ');
      pr(k?'up\n':'down\n');
      return;
    }
    if(k){
      if(f>=0)Ship.energy-=Param.shupengy;
      else Ship.cloakgood=0;
    }
    Move.free=0;
    if(f>=0)Move.shldchg=1;
    Ship[stat]=k;
  }
  /* ---------- snova.c ---------- */
  function* snova(x,y){
    var qx,qy,ix,iy,f=0,dx,dy,n,q;
    ix=x;
    if(ix<0){
      for(;;){
        qx=ranf(NQUADS);
        qy=ranf(NQUADS);
        q=Quad[qx][qy];
        if(q.stars>0)break;
      }
      if(Ship.quadx===qx&&Ship.quady===qy){
        n=ranf(q.stars);
        for(ix=0;ix<NSECTS;ix++){
          for(iy=0;iy<NSECTS;iy++)
            if(SG(ix,iy)===STAR||SG(ix,iy)===INHABIT)
              if((n-=1)<=0)break;
          if(n<=0)break;
        }
        f=1;
      }
    }
    else{
      iy=y;
      qx=Ship.quadx;
      qy=Ship.quady;
      q=Quad[qx][qy];
      f=1;
    }
    if(f){
      pr('\nRED ALERT: supernova occuring at '+ix+','+iy+'\n');
      dx=ix-Ship.sectx;
      dy=iy-Ship.secty;
      if(dx*dx+dy*dy<=2){
        pr('***  Emergency override attem');
        yield* sleep(1);
        pr('\n');
        yield* lose(L_SNOVA);
      }
      q.scanned=1000;
    }
    else if(!damaged(SSRADIO)){
      q.scanned=1000;
      pr('\nUhura: Captain, Starfleet Command reports a supernova\n');
      pr('  in quadrant '+qx+','+qy+'.  Caution is advised\n');
    }
    dx=q.klings;
    dy=q.stars;
    Now.klings=int8(Now.klings-dx);
    if(x>=0){
      Game.kills+=dy;
      if(q.bases)killb(qx,qy);
      Game.killk+=dx;
    }
    else if(q.bases)killb(qx,qy);
    killd(qx,qy,x>=0?1:0);
    q.stars=-1;
    q.klings=0;
    if(Now.klings<=0){
      pr('Lucky devil, that supernova destroyed the last klingon\n');
      yield* win();
    }
  }
  /* ---------- srscan.c ---------- */
  function* srscan(f){
    var k,m,statinfo,s,percent,q,p;
    if(f>=0&&check_out(SRSCAN))return;
    if(f)statinfo=1;
    else{
      if(!(yield* testnl()))Etc.statreport=yield* getynpar('status report');
      statinfo=Etc.statreport;
    }
    if(f>0){
      Etc.statreport=1;
      if(!Etc.fast)return;
    }
    if(f>=0){
      pr('\nShort range sensor scan\n');
      q=Quad[Ship.quadx][Ship.quady];
      q.scanned=q.klings*100+q.bases*10+q.stars;
      pr('  ');
      for(k=0;k<NSECTS;k++)pr(k+' ');
      pr('\n');
    }
    for(k=0;k<NSECTS;k++){
      if(f>=0){
        pr(k+' ');
        for(m=0;m<NSECTS;m++)pr(String.fromCharCode(SG(k,m))+' ');
        pr(String(k));
        if(statinfo)pr('   ');
      }
      if(statinfo){
        switch(k){
          case 0:pr('stardate      '+f2(Now.date));break;
          case 1:
            pr('condition     '+Color[Ship.cond]);
            if(Ship.cloaked)pr(', CLOAKED');
            break;
          case 2:pr('position      '+Ship.quadx+','+Ship.quady+'/'+Ship.sectx+','+Ship.secty);break;
          case 3:pr('warp factor   '+f1(Ship.warp));break;
          case 4:pr('total energy  '+Ship.energy);break;
          case 5:pr('torpedoes     '+Ship.torped);break;
          case 6:
            s='down';
            if(Ship.shldup)s='up';
            if(damaged(SHIELD))s='damaged';
            percent=trunc(100.0*Ship.shield/Param.shield);
            pr('shields       '+s+', '+percent+'%');
            break;
          case 7:pr('Klingons left '+Now.klings);break;
          case 8:pr('time left     '+f2(Now.time));break;
          case 9:
            pr('life support  ');
            if(damaged(LIFESUP)){
              pr('damaged, reserves = '+f2(Ship.reserves));
              break;
            }
            pr('active');
            break;
        }
      }
      pr('\n');
    }
    if(f<0){
      pr('current crew  '+Ship.crew+'\n');
      pr('brig space    '+Ship.brigfree+'\n');
      pr('Klingon power '+Param.klingpwr+'\n');
      p=Game.length-1;
      if(Game.length>2)p--;
      pr('Length, Skill '+Lentab[p][0]+Lentab[p][1]+', ');
      p=Skitab[Game.skill-1];
      pr(p[0]+p[1]+'\n');
      return;
    }
    pr('  ');
    for(k=0;k<NSECTS;k++)pr(k+' ');
    pr('\n');
    if(q.qsystemname&Q_DISTRESSED)pr('Distressed ');
    if(q.qsystemname)pr('Starsystem '+(systemname(q)||'(null)')+'\n');
  }
  /* ---------- torped.c ---------- */
  function* torped(){
    var ix,iy,x,y,dx,dy,angle,course,course2,k,bigger,sectsize=NSECTS,burst,n;
    if(Ship.cloaked){pr('Federation regulations do not permit attack while cloaked.\n');return}
    if(check_out(TORPED))return;
    if(Ship.torped<=0){pr('All photon torpedos expended\n');return}
    course=yield* getintpar('Torpedo course');
    if(course<0||course>360)return;
    burst=-1;
    if(Ship.torped<3){
      pr('No-burst mode selected\n');
      burst=0;
    }
    else if(!(yield* testnl())){
      k=ungetc(yield* cgetc());
      if(k>=48&&k<=57)burst=1;
    }
    if(burst<0)burst=yield* getynpar('Do you want a burst');
    if(burst){
      burst=yield* getintpar('burst angle');
      if(burst<=0)return;
      if(burst>15){pr('Maximum burst angle is 15 degrees\n');return}
    }
    n=-1;
    if(burst){
      n=1;
      course-=burst;
    }
    for(;n&&n<=3;n++){
      course2=course+randcourse(n);
      angle=course2*0.0174532925;
      dx=-Math.cos(angle);
      dy=Math.sin(angle);
      bigger=Math.abs(dx);
      x=Math.abs(dy);
      if(x>bigger)bigger=x;
      dx/=bigger;
      dy/=bigger;
      x=Ship.sectx+0.5;
      y=Ship.secty+0.5;
      if(Ship.cond!==DOCKED)Ship.torped-=1;
      pr('Torpedo track');
      if(n>0)pr(', torpedo number '+n);
      pr(':\n'+pad(f1(x),6)+'\t'+pad(f1(y),4)+'\n');
      for(;;){
        ix=trunc(x+=dx);
        iy=trunc(y+=dy);
        if(x<0.0||x>=sectsize||y<0.0||y>=sectsize){
          pr('Torpedo missed\n');
          break;
        }
        pr(pad(f1(x),6)+'\t'+pad(f1(y),4)+'\n');
        var what=SG(ix,iy);
        if(what===EMPTY)continue;
        switch(what){
          case HOLE:
            pr('Torpedo disappears into a black hole\n');
            break;
          case KLINGON:
            for(k=0;k<Etc.nkling;k++){
              if(Etc.klingon[k].x!==ix||Etc.klingon[k].y!==iy)continue;
              Etc.klingon[k].power-=500+ranf(501);
              if(Etc.klingon[k].power>0){
                pr('*** Hit on Klingon at '+ix+','+iy+': extensive damages\n');
                break;
              }
              yield* killk(ix,iy);
              break;
            }
            break;
          case STAR:
            yield* nova(ix,iy);
            break;
          case INHABIT:
            kills(ix,iy,-1);
            break;
          case BASE:
            killb(Ship.quadx,Ship.quady);
            Game.killb=int8(Game.killb+1);
            break;
          default:
            pr('Unknown object '+String.fromCharCode(what)+' at '+ix+','+iy+' destroyed\n');
            SS(ix,iy,EMPTY);
            break;
        }
        break;
      }
      if(damaged(TORPED)||Quad[Ship.quadx][Ship.quady].stars<0)break;
      course+=burst;
    }
    Move.free=0;
  }
  function randcourse(n){
    var r,d;
    d=trunc(((franf()+franf())-1.0)*20);
    if(Math.abs(d)>12){
      pr('Photon tubes misfire');
      if(n<0)pr('\n');
      else pr(' on torpedo '+n+'\n');
      if(ranf(2))damage(TORPED,0.2*Math.abs(d)*(franf()+1.0));
      d=trunc(d*(1.0+2.0*franf()));
    }
    if(Ship.shldup||Ship.cond===DOCKED){
      r=Ship.shield;
      r=1.0+r/Param.shield;
      if(Ship.cond===DOCKED)r=2.0;
      d=trunc(d*r);
    }
    return d;
  }
  /* ---------- visual.c ---------- */
  function* visual(){
    var ix,iy,co,v;
    co=yield* getintpar('direction');
    if(co<0||co>360)return;
    co=Math.trunc((co+22)/45);
    v=co;
    ix=Ship.sectx+Visdelta[v][0];
    iy=Ship.secty+Visdelta[v][1];
    co=ix<0||ix>=NSECTS||iy<0||iy>=NSECTS?63:SG(ix,iy);
    pr(ix+','+iy+' '+String.fromCharCode(co)+' ');
    v++;
    ix=Ship.sectx+Visdelta[v][0];
    iy=Ship.secty+Visdelta[v][1];
    co=ix<0||ix>=NSECTS||iy<0||iy>=NSECTS?63:SG(ix,iy);
    pr(String.fromCharCode(co)+' ');
    v++;
    ix=Ship.sectx+Visdelta[v][0];
    iy=Ship.secty+Visdelta[v][1];
    co=ix<0||ix>=NSECTS||iy<0||iy>=NSECTS?63:SG(ix,iy);
    pr(String.fromCharCode(co)+' '+ix+','+iy+'\n');
    Move.time=0.05;
    Move.free=0;
  }
  /* ---------- warp.c ---------- */
  function* warp(fl,c,d){
    var course,power,dist,time,speed,frac,percent,k,gc;
    if(Ship.cond===DOCKED){pr(Ship.shipname+' is docked\n');return}
    if(damaged(WARP)){out(WARP);return}
    if(fl<0){course=c;dist=d}
    else{
      gc=yield* getcodi();
      if(!gc)return;
      course=gc[0];dist=gc[1];
    }
    power=(dist+0.05)*Ship.warp3;
    percent=trunc(100*power/Ship.energy+0.5);
    if(percent>=85){
      pr('Scotty: That would consume '+percent+'% of our remaining energy.\n');
      if(!(yield* getynpar('Are you sure that is wise')))return;
    }
    speed=Ship.warp2/Param.warptime;
    time=dist/speed;
    percent=trunc(100*time/Now.time+0.5);
    if(percent>=85){
      pr('Spock: That would take '+percent+'% of our remaining time.\n');
      if(!(yield* getynpar('Are you sure that is wise')))return;
    }
    if(Ship.warp>6.0&&ranf(100)<20+15*(Ship.warp-6.0)){
      frac=franf();
      dist*=frac;
      time*=frac;
      damage(WARP,(frac+1.0)*Ship.warp*(franf()+0.25)*0.20);
    }
    Move.time=yield* move(fl,course,time,speed);
    dist=Move.time*speed;
    Ship.energy=trunc(Ship.energy-dist*Ship.warp3*(Ship.shldup+1));
    if(Ship.warp<=9.0)return;
    pr('\n\n  ___ Speed exceeding warp nine ___\n\n');
    yield* sleep(2);
    pr("Ship's safety systems malfunction\n");
    yield* sleep(2);
    pr('Crew experiencing extreme sensory distortion\n');
    yield* sleep(4);
    if(ranf(100)>=100*dist){
      pr('Equilibrium restored -- all systems normal\n');
      return;
    }
    percent=ranf(100);
    if(percent<70){
      if(percent<35||!Game.snap){
        time=(Ship.warp-8.0)*dist*(franf()+1.0);
        Now.date+=time;
        pr('Positive time portal entered -- it is now Stardate '+f2(Now.date)+'\n');
        for(k=0;k<MAXEVENTS;k++){
          percent=Event[k].evcode;
          if(percent===E_FIXDV||percent===E_LRTB)Event[k].date+=time;
        }
        return;
      }
      time=Now.date;
      var snap=clone(Etc.snapshot),n,m;
      for(k=0;k<NQUADS;k++)for(m=0;m<NQUADS;m++)Quad[k][m]=snap.Quad[k][m];
      for(k=0;k<MAXEVENTS;k++)Event[k]=snap.Event[k];
      assign(Now,snap.Now);
      pr('Negative time portal entered -- it is now Stardate '+f2(Now.date)+'\n');
      for(k=0;k<MAXEVENTS;k++)if(Event[k].evcode===E_FIXDV)reschedule(Event[k],Event[k].date-time);
      return;
    }
    if(percent<80)yield* lose(L_TOOFAST);
    pr('Equilibrium restored -- extreme damage occured to ship systems\n');
    for(k=0;k<NDEV;k++)damage(k,(3.0*(franf()+franf())+1.0)*Param.damfac[k]);
    Ship.shldup=0;
  }
  /* ---------- win.c ---------- */
  function* win(){
    var s,p;
    yield* sleep(1);
    pr('\nCongratulations, you have saved the Federation\n');
    Move.endgame=1;
    s=score();
    if(Game.helps===0&&Game.killb===0&&Game.killinhab===0&&5*Game.kills+Game.deaths<100&&s>=1000&&Ship.ship===ENTERPRISE){
      pr('In fact, you are promoted one step in rank,\n');
      if(Game.skill>=6)pr('to the exalted rank of Commodore Emeritus\n');
      else{
        p=Skitab[Game.skill-1];
        pr('from '+p[0]+p[1]+' ');
        p=Skitab[Game.skill];
        pr('to '+p[0]+p[1]+'\n');
      }
    }
    yield* skiptonl(0);
    throw RESET;
  }
  /* ---------- play.c, main.c ---------- */
  var Comtab=[['abandon','',abandon,0],['ca','pture',capture,0],['cl','oak',shield,-1],['c','omputer',computer,0],['da','mages',dcrept,0],['destruct','',destruct,0],['do','ck',dock_,0],['help','',help,0],['i','mpulse',impulse,0],['l','rscan',lrscan,0],['m','ove',warp,0],['p','hasers',phaser,0],['ram','',warp,1],['dump','',dumpgame,0],['r','est',rest,0],['shell','',shell,0],['sh','ield',shield,0],['s','rscan',srscan,0],['st','atus',srscan,-1],['terminate','',function*(){throw RESET},0],['t','orpedo',torped,0],['u','ndock',undock_,0],['v','isual',visual,0],['w','arp',setwarp,0]];
  function* play(){
    var r;
    for(;;){
      Move.free=1;
      Move.time=0.0;
      Move.shldchg=0;
      Move.newquad=0;
      Move.resting=0;
      yield* skiptonl(0);
      r=yield* getcodpar('\nCommand',Comtab);
      yield* r[2](r[3]);
      yield* events(0);
      yield* attack(0);
      yield* checkcond();
    }
  }
  function* main(){
    var first=true;
    pr(early);
    pr('\n   * * *   S T A R   T R E K   * * *\n\n');
    for(;;){
      try{
        if(!first&&!(yield* getynpar('Another game')))return;
        first=false;
        do{
          yield* setup();
          yield* play();
        }while(yield* getynpar('Another game'));
        return;
      }
      catch(e){
        if(e!==RESET)throw e;
      }
    }
  }
  /* the driver */
  function shown(l){
    if(l.indexOf('\t')<0)return l;
    var r='',q,c;
    for(q=0;q<l.length;q++){
      c=l.charAt(q);
      if(c==='\t'){do r+=' ';while(r.length%8)}
      else r+=c;
    }
    return r;
  }
  function flush(){
    var L=o.split('\n'),tail=L.pop();
    o='';
    if(L.length)P.say(L.map(shown));
    return shown(tail);
  }
  var gen=main();
  function fin(){var t=flush();if(t)P.say([t])}
  function step(v){
    var r;
    try{r=gen.next(v)}
    catch(e){
      fin();
      if(e===EXIT){P.status(255);return}
      if(e===FPE){P.say(['Floating exception (core dumped)']);P.status(136);return}
      throw e;
    }
    if(r.done){fin();return}
    if(r.value&&r.value.nap){
      o=flush(); /* a line not yet finished waits for the rest of it */
      P.queue(function(){return P.sleep(r.value.nap*1000)});
      P.queue(function(){step()});
      return;
    }
    P.ask(flush(),step);
  }
  P.queue(function(){step()});
}});
})(window.Phosphor);
