/* PHOSPHOR-9 terminal: machine "bsd-1987", the game adventure.
   Ported to JavaScript for this terminal from the C in NetBSD's games/adventure, with the
   labels kept. It keeps this notice, and may be used under its terms.

/*-
 * Copyright (c) 1991, 1993
 *	The Regents of the University of California.  All rights reserved.
 *
 * The game adventure was originally written in Fortran by Will Crowther
 * and Don Woods.  It was later translated to C and enhanced by Jim
 * Gillogly.  This code is derived from software contributed to Berkeley
 * by Jim Gillogly at The Rand Corporation.
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

function Adventure(){
  var EXIT={};
  /* ---------- output: a printf-like buffer, handed to the terminal a line at a time ---------- */
  var out='';
  function write(s){out+=s}
  function flush(){
    if(!out)return;
    var L=out.split('\n');
    if(L[L.length-1]==='')L.pop();
    out='';
    P.say(L);
  }
  function exit(){throw EXIT}
  function bug(n){write('Fatal bug '+n+' happened.\n');exit()}
  function idiv(a,b){return Math.trunc(a/b)}
  function zeros(n){var a=[];for(var i=0;i<n;i++)a.push(0);return a}

  /* ---------- the data: the same sections, in the same format, as the file called glorkz ---------- */
  var HTSIZE=512,LOCSIZE=141,RTXSIZE=205,MAGSIZE=35,CLSMAX=12;
  var voc=[];for(var vi=0;vi<HTSIZE;vi++)voc.push({val:0,w:''});
  var rtext=[],mtext=[],ctext=[],cval=zeros(CLSMAX+1),ptext=[],ltext=[],stext=[],travel=[];
  var atloc=zeros(LOCSIZE),plac=zeros(101),fixd=zeros(101),fixed=zeros(101),actspeak=zeros(35),cond=zeros(LOCSIZE);
  var setbit=[1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768];
  var hintmax=0,hints=[],hinted=zeros(20),hintlc=zeros(20);
  for(var hi=0;hi<20;hi++)hints.push(zeros(5));
  var place=zeros(101),prop=zeros(101),links=zeros(201),abb=zeros(LOCSIZE);
  var classes=1,maxtrs,tally,tally2;
  var keys,lamp,grate,cage,rod,rod2,steps,bird,door,pillow,snake,fissure,tablet,clam,oyster,magazine,dwarf,knife,food,bottle,water,oil,plant,plant2,axe,mirror,dragon,chasm,troll,troll2,bear,message,vend,batter,nugget,coins,chest,eggs,trident,vase,emerald,pyramid,pearl,rug,chain,spices,back,look,cave,nullw,entrance,depression,say,lock,throwv,find,invent;
  var chloc,chloc2,dseen=zeros(7),dloc=zeros(7),odloc=zeros(7),dflag,daltloc;
  var tk=zeros(21),stick,dtotal,attack;
  var turns,lmwarn,iwest,knfloc,detail,abbnum,maxdie,numdie,holding,dkill,foobar,bonus,clock1,clock2,saved,isclosing,panic,closed,scoring;
  var limit,maxscore,gaveup,blklin=true;
  var loc=0,newloc=0,oldloc=0,oldloc2=0,wasdark=0,k=0,verb=0,obj=0,spk=0,wd1='',wd2='',tl=null,ti=0,yea;

  function vocab(word,type,value){
    var hash=0,i,adr,h;
    for(i=0;i<5&&i<word.length;i++)hash+=word.charCodeAt(i);
    hash=(hash*3719)&32767;
    hash%=HTSIZE;
    for(adr=hash;;adr++){
      if(adr===HTSIZE)adr=0;
      h=voc[adr];
      if(type===-2){
        if(!h.val){h.val=value;h.w=word;return 0}
      }
      else if(type===-1){
        if(!h.val)return -1;
        if(word.indexOf(h.w)===0&&(word.length===h.w.length||h.w.length>=5))return h.val;
      }
      else{
        if(!h.val)bug(5);
        if(word.indexOf(h.w)===0){
          if(idiv(h.val,1000)===type)return h.val%1000;
          continue;
        }
      }
      if(adr+1===hash||hash===0)bug(6);
    }
  }
  function rdata(){
    var S=P.advData.replace(/\r/g,'').split('\n'),i=0;
    function fields(l){ /* a number, a tab or a run of spaces, then the rest (some lines in the file use spaces) */
      var m=l.match(/^(-?\d+) +(\S.*)$/);
      return m?[m[1],m[2]]:l.split('\t');
    }
    function msgs(sect){
      var table={};
      for(;;){
        var f=fields(S[i++]),n=parseInt(f[0],10);
        if(n<0)return table;
        if(sect===5&&(n===0||n>=100)){(table[oldobj]=table[oldobj]||[]).push({n:n,t:f.slice(1).join('\t')});continue}
        if(sect===5)oldobj=n;
        (table[n]=table[n]||[]).push({n:n,t:f.slice(1).join('\t')});
      }
    }
    var oldobj=0;
    for(;;){
      var sect=parseInt(S[i++],10),t,f,n;
      if(sect===0)return;
      if(sect===1){t=msgs(1);for(n in t)ltext[n]=t[n]}
      else if(sect===2){t=msgs(2);for(n in t)stext[n]=t[n]}
      else if(sect===3){
        for(;;){
          f=fields(S[i++]);n=parseInt(f[0],10);
          if(n<0)break;
          var num=f[1],len=num.length,m=len<4?0:parseInt(num.slice(0,len-3),10),to=len<4?parseInt(num,10):parseInt(num.slice(len-3),10);
          travel[n]=travel[n]||[];
          for(var j=2;j<f.length;j++)if(f[j]!=='')travel[n].push({conditions:m,tloc:to,tverb:parseInt(f[j],10)});
        }
      }
      else if(sect===4){
        for(;;){
          f=fields(S[i++]);n=parseInt(f[0],10);
          if(n<0)break;
          vocab((f[1]||'').split(/[ \t]/)[0],-2,n);
        }
      }
      else if(sect===5){t=msgs(5);for(n in t)ptext[n]=t[n]}
      else if(sect===6){t=msgs(6);for(n in t)rtext[n]=t[n]}
      else if(sect===7){
        for(;;){
          f=fields(S[i++]);n=parseInt(f[0],10);
          if(n<0)break;
          plac[n]=parseInt(f[1],10);fixd[n]=f.length>2&&f[2]!==''?parseInt(f[2],10):0;
        }
      }
      else if(sect===8){
        for(;;){
          f=fields(S[i++]);n=parseInt(f[0],10);
          if(n<0)break;
          actspeak[n]=parseInt(f[1],10);
        }
      }
      else if(sect===9){
        for(;;){
          f=fields(S[i++]);n=parseInt(f[0],10);
          if(n<0)break;
          for(var b=1;b<f.length;b++)if(f[b]!=='')cond[parseInt(f[b],10)]|=setbit[n];
        }
      }
      else if(sect===10){
        t=msgs(10);
        Object.keys(t).map(Number).sort(function(x,y){return x-y}).forEach(function(v){ctext[classes]=t[v];cval[classes++]=v});
      }
      else if(sect===11){
        for(;;){
          f=fields(S[i++]);n=parseInt(f[0],10);
          if(n<0)break;
          for(var q=1;q<5;q++)hints[n][q]=parseInt(f[q],10);
          if(n>hintmax)hintmax=n;
        }
      }
      else if(sect===12){t=msgs(12);for(n in t)mtext[n]=t[n]}
      else bug(7);
    }
  }
  function speak(msg){
    var first=true;
    if(!msg)return;
    for(var i=0;i<msg.length;i++){
      if(msg[i].t.indexOf('>$<')===0)break;
      if(blklin&&first)write('\n');
      first=false;
      write(msg[i].t+'\n');
    }
  }
  function rspeak(m){if(m)speak(rtext[m])}
  function mspeak(m){if(m)speak(mtext[m])}
  function pspeak(m,skip){
    var msg=ptext[m],first=true;
    if(!msg)return;
    for(var i=0;i<msg.length;i++){
      if(msg[i].n!==100*skip&&skip>=0)continue;
      if(msg[i].t.indexOf('>$<')===0)break;
      if(blklin&&first)write('\n');
      first=false;
      write(msg[i].t+'\n');
      if(skip<0)break;
    }
  }

  /* ---------- the keyboard ---------- */
  function* yes(x,y,z){
    for(;;){
      rspeak(x);
      var l=yield;
      if(l===null){write('user closed input stream, quitting...\n');exit()}
      var ch=l===P.INT?'':l.charAt(0);
      if(ch==='y'){rspeak(y);return true}
      if(ch==='n'){rspeak(z);return false}
      write('Please answer the question.\n');
    }
  }
  function* getin(){
    var l=yield;
    if(l===null){write('user closed input stream, quitting...\n');exit()}
    if(l===P.INT){wd1='quit';wd2='';return} /* a DEL means he is quitting */
    var W=l.toLowerCase().split(' ').filter(Boolean);
    wd1=W[0]||'';wd2=W[1]||'';
    if(wd1.length>=20||wd2.length>=20){write('Give me a break!!\n');wd1='';wd2=''}
  }
  function weq(a,b){return a.slice(0,5)===b.slice(0,5)}

  /* ---------- objects ---------- */
  function destroy(o){move(o,0)}
  function juggle(o){var i=place[o],j=fixed[o];move(o,i);move(o+100,j)}
  function move(o,where){
    var from=o<=100?place[o]:fixed[o-100];
    if(from>0&&from<=300)carry(o,from);
    drop(o,where);
  }
  function put(o,where,pval){move(o,where);return -1-pval}
  function carry(o,where){
    if(o<=100){
      if(place[o]===-1)return;
      place[o]=-1;
      holding++;
    }
    if(atloc[where]===o){atloc[where]=links[o];return}
    var t=atloc[where];
    while(links[t]!==o)t=links[t];
    links[t]=links[o];
  }
  function drop(o,where){
    if(o>100)fixed[o-100]=where;
    else{
      if(place[o]===-1)holding--;
      place[o]=where;
    }
    if(where<=0)return;
    links[o]=atloc[where];
    atloc[where]=o;
  }
  function toting(o){return place[o]===-1}
  function here(o){return place[o]===loc||toting(o)}
  function at(o){return place[o]===loc||fixed[o]===loc}
  function liq2(p){return (1-p)*water+idiv(p,2)*(water+oil)}
  function liq(){var i=prop[bottle];return i>-1-i?liq2(i):liq2(-1-i)}
  function liqloc(l){
    var i=idiv(cond[l],2),j=((i*2)%8)-5,m=idiv(cond[l],4)%2;
    return liq2(j*m+1);
  }
  function bitset(l,n){return (cond[l]&setbit[n])!==0}
  function forced(l){return cond[l]===2}
  function dark(){return (cond[loc]%2)===0&&(prop[lamp]===0||!here(lamp))}
  function ran(n){return Math.floor(Math.random()*n)}
  function pct(n){return ran(100)<n}

  /* ---------- dwarves, and the pirate (label 71 of the FORTRAN) ---------- */
  function fdwarf(){
    var i,j,e;
    if(newloc!==loc&&!forced(loc)&&!bitset(loc,3)){
      for(i=1;i<=5;i++){
        if(odloc[i]!==newloc||!dseen[i])continue;
        newloc=loc;
        rspeak(2);
        break;
      }
    }
    loc=newloc;
    if(loc===0||forced(loc)||bitset(newloc,3))return 2000;
    if(dflag===0){
      if(loc>=15)dflag=1;
      return 2000;
    }
    if(dflag===1){
      if(loc<15||pct(95))return 2000;
      dflag=2;
      for(i=1;i<=2;i++){
        j=1+ran(5);
        if(pct(50)&&saved===-1)dloc[j]=0;
      }
      for(i=1;i<=5;i++){
        if(dloc[i]===loc)dloc[i]=daltloc;
        odloc[i]=dloc[i];
      }
      rspeak(3);
      drop(axe,loc);
      return 2000;
    }
    dtotal=attack=stick=0;
    for(i=1;i<=6;i++){
      if(dloc[i]===0)continue;
      j=1;
      var T=travel[dloc[i]]||[];
      for(e=0;e<T.length;e++){
        newloc=T[e].tloc;
        if(newloc>300||newloc<15||newloc===odloc[i]||(j>1&&newloc===tk[j-1])||j>=20||newloc===dloc[i]||forced(newloc)||(i===6&&bitset(newloc,3))||T[e].conditions===100)continue;
        tk[j++]=newloc;
      }
      tk[j]=odloc[i];
      if(j>=2)j--;
      j=1+ran(j);
      odloc[i]=dloc[i];
      dloc[i]=tk[j];
      dseen[i]=(dseen[i]&&loc>=15)||(dloc[i]===loc||odloc[i]===loc);
      if(!dseen[i])continue;
      dloc[i]=loc;
      if(i===6){ /* the pirate has spotted him */
        if(loc===chloc||prop[chest]>=0)continue;
        k=0;
        var robbed=false;
        for(j=50;j<=maxtrs;j++){
          if(!(j===pyramid&&(loc===plac[pyramid]||loc===plac[emerald]))&&toting(j)){robbed=true;break}
          if(here(j))k=1;
        }
        if(robbed){
          rspeak(128);
          if(place[message]===0)move(chest,chloc);
          move(message,chloc2);
          for(j=50;j<=maxtrs;j++){
            if(j===pyramid&&(loc===plac[pyramid]||loc===plac[emerald]))continue;
            if(at(j)&&fixed[j]===0)carry(j,loc);
            if(toting(j))drop(j,chloc);
          }
          dloc[6]=odloc[6]=chloc;
          dseen[6]=false;
          continue;
        }
        if(tally===tally2+1&&k===0&&place[chest]===0&&here(lamp)&&prop[lamp]===1){
          rspeak(186);
          move(chest,chloc);
          move(message,chloc2);
          dloc[6]=odloc[6]=chloc;
          dseen[6]=false;
          continue;
        }
        if(odloc[6]!==dloc[6]&&pct(20))rspeak(127);
        continue;
      }
      dtotal++;
      if(odloc[i]!==dloc[i])continue;
      attack++;
      if(knfloc>=0)knfloc=loc;
      if(ran(1000)<95*(dflag-2))stick++;
    }
    if(dtotal===0)return 2000;
    if(dtotal!==1)write('There are '+dtotal+' threatening little dwarves in the room with you.\n');
    else rspeak(4);
    if(attack===0)return 2000;
    if(dflag===2)dflag=3;
    if(saved!==-1)dflag=20;
    if(attack!==1){
      write(attack+' of them throw knives at you!\n');
      k=6;
    }
    else{
      rspeak(5);
      k=52;
    }
    if(stick<=1){
      rspeak(k+stick);
      if(stick===0)return 2000;
    }
    else write(stick+' of them get you!\n');
    oldloc2=loc;
    return 99;
  }

  /* ---------- moving (label 8) ---------- */
  function march(){
    var ll1,ll2,skip=false;
    tl=travel[newloc=loc];ti=0;
    if(!tl)bug(26);
    if(k===nullw)return 2;
    if(k===cave){
      if(loc<8)rspeak(57);
      if(loc>=8)rspeak(58);
      return 2;
    }
    if(k===look){
      if(detail++<3)rspeak(15);
      wasdark=false;
      abb[loc]=0;
      return 2;
    }
    if(k===back){
      var r=mback();
      if(r===2)return 2;
      if(r!==9)bug(100);
      skip=true;
    }
    if(!skip){oldloc2=oldloc;oldloc=loc}
    for(;ti<tl.length;ti++)if(tl[ti].tverb===1||tl[ti].tverb===k)break;
    if(ti>=tl.length){badmove();return 2}
    for(;;){
      ll1=tl[ti].conditions;ll2=tl[ti].tloc;
      newloc=ll1;
      k=newloc%100;
      var go=false;
      if(newloc<=300){
        if(newloc<=100)go=newloc===0||pct(newloc);
        else go=toting(k)||(newloc>200&&at(k));
      }
      else go=prop[k]!==idiv(newloc,100)-3;
      if(go){
        newloc=ll2;
        if(newloc<=300)return 2;
        if(newloc<=500){
          var s=specials();
          if(s===2)return 2;
          if(s===99)return 99;
          if(s!==12)bug(101);
        }
        else{
          rspeak(newloc-500);
          newloc=loc;
          return 2;
        }
      }
      for(;ti<tl.length;ti++)if(tl[ti].tloc!==ll2||tl[ti].conditions!==ll1)break;
      if(ti>=tl.length)bug(25);
    }
  }
  function mback(){
    var tk2=-1,ll;
    if(forced(k=oldloc))k=oldloc2;
    oldloc2=oldloc;
    oldloc=loc;
    if(k===loc){rspeak(91);return 2}
    for(;ti<tl.length;ti++){
      ll=tl[ti].tloc;
      if(ll===k){k=tl[ti].tverb;ti=0;return 9}
      if(ll<=300){
        var j=travel[loc][0];
        if(forced(ll)&&k===j.tloc)tk2=ti;
      }
    }
    if(tk2>=0){k=tl[tk2].tverb;ti=0;return 9}
    rspeak(140);
    return 2;
  }
  function specials(){
    switch(newloc-=300){
      case 1:
        newloc=99+100-loc;
        if(holding===0||(holding===1&&toting(emerald)))return 2;
        newloc=loc;
        rspeak(117);
        return 2;
      case 2:
        drop(emerald,loc);
        return 12;
      case 3:
        return trbridge();
      default:
        bug(29);
    }
  }
  function trbridge(){
    if(prop[troll]===1){
      pspeak(troll,1);
      prop[troll]=0;
      move(troll2,0);
      move(troll2+100,0);
      move(troll,plac[troll]);
      move(troll+100,fixd[troll]);
      juggle(chasm);
      newloc=loc;
      return 2;
    }
    newloc=plac[troll]+fixd[troll]-loc;
    if(prop[troll]===0)prop[troll]=1;
    if(!toting(bear))return 2;
    rspeak(162);
    prop[chasm]=1;
    prop[troll]=2;
    drop(bear,newloc);
    fixed[bear]=-1;
    prop[bear]=3;
    if(prop[spices]<0)tally2++;
    oldloc2=newloc;
    return 99;
  }
  function badmove(){
    spk=12;
    if(k>=43&&k<=50)spk=9;
    if(k===29||k===30)spk=9;
    if(k===7||k===36||k===37)spk=10;
    if(k===11||k===19)spk=11;
    if(verb===find||verb===invent)spk=59;
    if(k===62||k===65)spk=42;
    if(k===17)spk=80;
    rspeak(spk);
  }
  function* checkhints(){
    for(var hint=4;hint<=hintmax;hint++){
      if(hinted[hint])continue;
      if(!bitset(loc,hint))hintlc[hint]=-1;
      hintlc[hint]++;
      if(hintlc[hint]<hints[hint][1])continue;
      var offer=false;
      switch(hint){
        case 4:offer=prop[grate]===0&&!here(keys);break;
        case 5:
          if(!(here(bird)&&toting(rod)&&obj===bird))continue;
          offer=true;
          break;
        case 6:offer=here(snake)&&!here(bird);break;
        case 7:offer=atloc[loc]===0&&atloc[oldloc]===0&&atloc[oldloc2]===0&&holding>1;break;
        case 8:offer=prop[emerald]!==-1&&prop[pyramid]===-1;break;
        case 9:offer=true;break;
        default:bug(27);
      }
      if(offer){
        hintlc[hint]=0;
        if(!(yield* yes(hints[hint][3],0,54)))continue;
        write('I am prepared to give you a hint, but it will cost you '+hints[hint][2]+' points.\n');
        hinted[hint]=yield* yes(175,hints[hint][4],54);
      }
      hintlc[hint]=0;
    }
  }

  /* ---------- the verbs ---------- */
  function trsay(){
    if(wd2)wd1=wd2;
    var i=vocab(wd1,-1,0);
    if(i===62||i===65||i===71||i===2025){wd2='';obj=0;return 2630}
    write('\nOkay, "'+wd2+'".\n');
    return 2012;
  }
  function trtake(){
    if(toting(obj))return 2011;
    spk=25;
    if(obj===plant&&prop[plant]<=0)spk=115;
    if(obj===bear&&prop[bear]===1)spk=169;
    if(obj===chain&&prop[bear]!==0)spk=170;
    if(fixed[obj]!==0)return 2011;
    if(obj===water||obj===oil){
      if(here(bottle)&&liq()===obj)obj=bottle;
      else{
        obj=bottle;
        if(toting(bottle)&&prop[bottle]===1)return 9220;
        if(prop[bottle]!==1)spk=105;
        if(!toting(bottle))spk=104;
        return 2011;
      }
    }
    if(holding>=7){rspeak(92);return 2012}
    if(obj===bird&&prop[bird]===0){
      if(toting(rod)){rspeak(26);return 2012}
      if(!toting(cage)){rspeak(27);return 2012}
      prop[bird]=1;
    }
    if((obj===bird||obj===cage)&&prop[bird]!==0)carry(bird+cage-obj,loc);
    carry(obj,loc);
    k=liq();
    if(obj===bottle&&k!==0)place[k]=-1;
    return 2009;
  }
  function dropper(){
    k=liq();
    if(k===obj)obj=bottle;
    if(obj===bottle&&k!==0)place[k]=0;
    if(obj===cage&&prop[bird]!==0)drop(bird,loc);
    if(obj===bird)prop[bird]=0;
    drop(obj,loc);
    return 2012;
  }
  function trdrop(){
    if(toting(rod2)&&obj===rod&&!toting(rod))obj=rod2;
    if(!toting(obj))return 2011;
    if(obj===bird&&here(snake)){
      rspeak(30);
      if(closed)return 19000;
      destroy(snake);
      prop[snake]=1;
      return dropper();
    }
    if(obj===coins&&here(vend)){
      destroy(coins);
      drop(batter,loc);
      pspeak(batter,0);
      return 2012;
    }
    if(obj===bird&&at(dragon)&&prop[dragon]===0){
      rspeak(154);
      destroy(bird);
      prop[bird]=0;
      if(place[snake]===plac[snake])tally2--;
      return 2012;
    }
    if(obj===bear&&at(troll)){
      rspeak(163);
      move(troll,0);
      move(troll+100,0);
      move(troll2,plac[troll]);
      move(troll2+100,fixd[troll]);
      juggle(chasm);
      prop[troll]=2;
      return dropper();
    }
    if(obj!==vase||loc===plac[pillow]){
      rspeak(54);
      return dropper();
    }
    prop[vase]=2;
    if(at(pillow))prop[vase]=0;
    pspeak(vase,prop[vase]+1);
    if(prop[vase]!==0)fixed[vase]=-1;
    return dropper();
  }
  function tropen(){
    if(obj===clam||obj===oyster){
      k=0;
      if(obj===oyster)k=1;
      spk=124+k;
      if(toting(obj))spk=120+k;
      if(!toting(trident))spk=122+k;
      if(verb===lock)spk=61;
      if(spk!==124)return 2011;
      destroy(clam);
      drop(oyster,loc);
      drop(pearl,105);
      return 2011;
    }
    if(obj===door)spk=111;
    if(obj===door&&prop[door]===1)spk=54;
    if(obj===cage)spk=32;
    if(obj===keys)spk=55;
    if(obj===grate||obj===chain)spk=31;
    if(spk!==31||!here(keys))return 2011;
    if(obj===chain){
      if(verb===lock){
        spk=172;
        if(prop[chain]!==0)spk=34;
        if(loc!==plac[chain])spk=173;
        if(spk!==172)return 2011;
        prop[chain]=2;
        if(toting(chain))drop(chain,loc);
        fixed[chain]=-1;
        return 2011;
      }
      spk=171;
      if(prop[bear]===0)spk=41;
      if(prop[chain]===0)spk=37;
      if(spk!==171)return 2011;
      prop[chain]=0;
      fixed[chain]=0;
      if(prop[bear]!==3)prop[bear]=2;
      fixed[bear]=2-prop[bear];
      return 2011;
    }
    if(isclosing){
      k=130;
      if(!panic)clock2=15;
      panic=true;
      return 2010;
    }
    k=34+prop[grate];
    prop[grate]=1;
    if(verb===lock)prop[grate]=0;
    k=k+2*prop[grate];
    return 2010;
  }
  function* trkill(){
    var i;
    for(i=1;i<=5;i++)if(dloc[i]===loc&&dflag>=2)break;
    if(i===6)i=0;
    if(obj===0){
      if(i!==0)obj=dwarf;
      if(here(snake))obj=obj*100+snake;
      if(at(dragon)&&prop[dragon]===0)obj=obj*100+dragon;
      if(at(troll))obj=obj*100+troll;
      if(here(bear)&&prop[bear]===0)obj=obj*100+bear;
      if(obj>100)return 8000;
      if(obj===0){
        if(here(bird)&&verb!==throwv)obj=bird;
        if(here(clam)||here(oyster))obj=100*obj+clam;
        if(obj>100)return 8000;
      }
    }
    if(obj===bird){
      spk=137;
      if(closed)return 2011;
      destroy(bird);
      prop[bird]=0;
      if(place[snake]===plac[snake])tally2++;
      spk=45;
    }
    if(obj===0)spk=44;
    if(obj===clam||obj===oyster)spk=150;
    if(obj===snake)spk=46;
    if(obj===dwarf)spk=49;
    if(obj===dwarf&&closed)return 19000;
    if(obj===dragon)spk=147;
    if(obj===troll)spk=157;
    if(obj===bear)spk=165+idiv(prop[bear]+1,2);
    if(obj!==dragon||prop[dragon]!==0)return 2011;
    rspeak(49);
    verb=0;
    obj=0;
    yield* getin();
    if(!weq(wd1,'y')&&!weq(wd1,'yes'))return 2608;
    pspeak(dragon,1);
    prop[dragon]=2;
    prop[rug]=0;
    k=idiv(plac[dragon]+fixd[dragon],2);
    move(dragon+100,-1);
    move(rug+100,0);
    move(dragon,k);
    move(rug,k);
    for(obj=1;obj<=100;obj++)if(place[obj]===plac[dragon]||place[obj]===fixd[dragon])move(obj,k);
    loc=k;
    k=nullw;
    return 8;
  }
  function trtoss(){
    var i;
    if(toting(rod2)&&obj===rod&&!toting(rod))obj=rod2;
    if(!toting(obj))return 2011;
    if(obj>=50&&obj<=maxtrs&&at(troll)){
      spk=159;
      drop(obj,0);
      move(troll,0);
      move(troll+100,0);
      drop(troll2,plac[troll]);
      drop(troll2+100,fixd[troll]);
      juggle(chasm);
      return 2011;
    }
    if(obj===food&&here(bear)){obj=bear;return 9210}
    if(obj!==axe)return 9020;
    function l9175(){
      rspeak(spk);
      drop(axe,loc);
      k=nullw;
      return 8;
    }
    for(i=1;i<=5;i++){
      if(dloc[i]===loc){
        spk=48;
        if(ran(3)===0||saved!==-1)return l9175();
        dseen[i]=false;
        dloc[i]=0;
        spk=47;
        dkill++;
        if(dkill===1)spk=149;
        return l9175();
      }
    }
    spk=152;
    if(at(dragon)&&prop[dragon]===0)return l9175();
    spk=158;
    if(at(troll))return l9175();
    if(here(bear)&&prop[bear]===0){
      spk=164;
      drop(axe,loc);
      fixed[axe]=-1;
      prop[axe]=1;
      juggle(bear);
      return 2011;
    }
    obj=0;
    return 9120;
  }
  function trfeed(){
    if(obj===bird){spk=100;return 2011}
    if(obj===snake||obj===dragon||obj===troll){
      spk=102;
      if(obj===dragon&&prop[dragon]!==0)spk=110;
      if(obj===troll)spk=182;
      if(obj!==snake||closed||!here(bird))return 2011;
      spk=101;
      destroy(bird);
      prop[bird]=0;
      tally2++;
      return 2011;
    }
    if(obj===dwarf){
      if(!here(food))return 2011;
      spk=103;
      dflag++;
      return 2011;
    }
    if(obj===bear){
      if(prop[bear]===0)spk=102;
      if(prop[bear]===3)spk=110;
      if(!here(food))return 2011;
      destroy(food);
      prop[bear]=1;
      fixed[axe]=0;
      prop[axe]=0;
      spk=168;
      return 2011;
    }
    spk=14;
    return 2011;
  }
  function trfill(){
    if(obj===vase){
      spk=29;
      if(liqloc(loc)===0)spk=144;
      if(liqloc(loc)===0||!toting(vase))return 2011;
      rspeak(145);
      prop[vase]=2;
      fixed[vase]=-1;
      return 9020;
    }
    if(obj!==0&&obj!==bottle)return 2011;
    if(obj===0&&!here(bottle))return 8000;
    spk=107;
    if(liqloc(loc)===0)spk=106;
    if(liq()!==0)spk=105;
    if(spk!==107)return 2011;
    prop[bottle]=idiv(cond[loc]%4,2)*2;
    k=liq();
    if(toting(bottle))place[k]=-1;
    if(k===oil)spk=108;
    return 2011;
  }
  function closing(){
    var i;
    prop[grate]=prop[fissure]=0;
    for(i=1;i<=6;i++){dseen[i]=false;dloc[i]=0}
    move(troll,0);
    move(troll+100,0);
    move(troll2,plac[troll]);
    move(troll2+100,fixd[troll]);
    juggle(chasm);
    if(prop[bear]!==3)destroy(bear);
    prop[chain]=0;
    fixed[chain]=0;
    prop[axe]=0;
    fixed[axe]=0;
    rspeak(129);
    clock1=-1;
    isclosing=true;
  }
  function caveclose(){
    var i;
    prop[bottle]=put(bottle,115,1);
    prop[plant]=put(plant,115,0);
    prop[oyster]=put(oyster,115,0);
    prop[lamp]=put(lamp,115,0);
    prop[rod]=put(rod,115,0);
    prop[dwarf]=put(dwarf,115,0);
    loc=115;
    oldloc=115;
    newloc=115;
    put(grate,116,0);
    prop[snake]=put(snake,116,1);
    prop[bird]=put(bird,116,1);
    prop[cage]=put(cage,116,0);
    prop[rod2]=put(rod2,116,0);
    prop[pillow]=put(pillow,116,0);
    prop[mirror]=put(mirror,115,0);
    fixed[mirror]=116;
    for(i=1;i<=100;i++)if(toting(i))destroy(i);
    rspeak(132);
    closed=true;
  }

  /* ---------- the end ---------- */
  function score(){
    var my=0,i;
    maxscore=0;
    for(i=50;i<=maxtrs;i++){
      if(!ptext[i])continue;
      k=12;
      if(i===chest)k=14;
      if(i>chest)k=16;
      if(prop[i]>=0)my+=2;
      if(place[i]===3&&prop[i]===0)my+=k-2;
      maxscore+=k;
    }
    my+=(maxdie-numdie)*10;
    maxscore+=maxdie*10;
    if(!(scoring||gaveup))my+=4;
    maxscore+=4;
    if(dflag!==0)my+=25;
    maxscore+=25;
    if(isclosing)my+=25;
    maxscore+=25;
    if(closed){
      if(bonus===0)my+=10;
      if(bonus===135)my+=25;
      if(bonus===134)my+=30;
      if(bonus===133)my+=45;
    }
    maxscore+=45;
    if(place[magazine]===108)my++;
    maxscore++;
    my+=2;
    maxscore+=2;
    for(i=1;i<=hintmax;i++)if(hinted[i])my-=hints[i][2];
    return my;
  }
  function done(entry){
    var i,sc;
    if(entry===1)mspeak(1);
    if(entry===3)rspeak(136);
    sc=score();
    write('\n\n\nYou scored '+sc+' out of a possible '+maxscore+' using '+turns+' turns.\n');
    for(i=1;i<=classes;i++){
      if(cval[i]>=sc){
        speak(ctext[i]);
        if(i===classes-1){
          write('To achieve the next higher rating would be a neat trick!\n\nCongratulations!!\n');
          exit();
        }
        k=cval[i]+1-sc;
        write('To achieve the next higher rating, you need '+k+' more point'+(k===1?'.\n':'s.\n'));
        exit();
      }
    }
    write('You just went off my scale!!!\n');
    exit();
  }
  function* die(entry){
    if(entry!==99){
      rspeak(23);
      oldloc2=loc;
    }
    if(isclosing){
      rspeak(131);
      numdie++;
      done(2);
    }
    yea=yield* yes(81+numdie*2,82+numdie*2,54);
    numdie++;
    if(numdie===maxdie||!yea)done(2);
    place[water]=0;
    place[oil]=0;
    if(toting(lamp))prop[lamp]=0;
    for(var i=100;i>=1;i--){
      if(!toting(i))continue;
      k=oldloc2;
      if(i===lamp)k=1;
      drop(i,k);
    }
    loc=3;
    oldloc=loc;
  }

  function linkdata(){
    var i,j;
    for(i=1;i<LOCSIZE;i++)if(ltext[i]&&travel[i]&&travel[i][0].tverb===1)cond[i]=2;
    for(j=100;j>0;j--)if(fixd[j]>0){drop(j+100,fixd[j]);drop(j,plac[j])}
    for(j=100;j>0;j--){
      fixed[j]=fixd[j];
      if(plac[j]!==0&&fixd[j]<=0)drop(j,plac[j]);
    }
    maxtrs=79;tally=0;tally2=0;
    for(i=50;i<=maxtrs;i++){
      if(ptext[i])prop[i]=-1;
      tally-=prop[i];
    }
    function v(w,t){return vocab(w,t,0)}
    keys=v('keys',1);lamp=v('lamp',1);grate=v('grate',1);cage=v('cage',1);rod=v('rod',1);rod2=rod+1;steps=v('steps',1);bird=v('bird',1);door=v('door',1);pillow=v('pillo',1);snake=v('snake',1);fissure=v('fissu',1);tablet=v('table',1);clam=v('clam',1);oyster=v('oyste',1);magazine=v('magaz',1);dwarf=v('dwarf',1);knife=v('knife',1);food=v('food',1);bottle=v('bottl',1);water=v('water',1);oil=v('oil',1);plant=v('plant',1);plant2=plant+1;axe=v('axe',1);mirror=v('mirro',1);dragon=v('drago',1);chasm=v('chasm',1);troll=v('troll',1);troll2=troll+1;bear=v('bear',1);message=v('messa',1);vend=v('vendi',1);batter=v('batte',1);
    nugget=v('gold',1);coins=v('coins',1);chest=v('chest',1);eggs=v('eggs',1);trident=v('tride',1);vase=v('vase',1);emerald=v('emera',1);pyramid=v('pyram',1);pearl=v('pearl',1);rug=v('rug',1);chain=v('chain',1);spices=v('spice',1);
    back=v('back',0);look=v('look',0);cave=v('cave',0);nullw=v('null',0);entrance=v('entra',0);depression=v('depre',0);
    say=v('say',2);lock=v('lock',2);throwv=v('throw',2);find=v('find',2);invent=v('inven',2);
    chloc=114;chloc2=140;
    for(i=1;i<=6;i++)dseen[i]=false;
    dflag=0;
    dloc[1]=19;dloc[2]=27;dloc[3]=33;dloc[4]=44;dloc[5]=64;dloc[6]=chloc;
    daltloc=18;
    turns=0;lmwarn=false;iwest=0;knfloc=0;detail=0;abbnum=5;
    for(i=0;i<=4;i++)if(rtext[2*i+81])maxdie=i+1;
    numdie=holding=dkill=foobar=bonus=0;
    clock1=30;clock2=50;saved=0;
    isclosing=panic=closed=scoring=false;
  }

  /* ---------- the main loop; each label is the one in the C, and so in the FORTRAN ---------- */
  function* game(){
    var i,ll,kk,rval,r;
    rdata();
    linkdata();
    saved=-1;
    hinted[3]=yield* yes(65,1,0);
    newloc=1;
    limit=hinted[3]?1000:330;
    var at_='l2';
    for(;;)switch(at_){
      case 'l2':
        if(newloc<9&&newloc!==0&&isclosing){
          rspeak(130);
          newloc=loc;
          if(!panic)clock2=15;
          panic=true;
        }
        rval=fdwarf();
        if(rval===99)yield* die(99);
        at_='l2000';break;
      case 'l2000':
        if(loc===0)yield* die(99);
        kk=stext[loc];
        if((abb[loc]%abbnum)===0||!kk)kk=ltext[loc];
        if(!forced(loc)&&dark()){
          if(wasdark&&pct(35)){
            yield* die(90);
            at_='l2000';break;
          }
          kk=rtext[16];
        }
        if(toting(bear))rspeak(141);
        speak(kk);
        k=1;
        if(forced(loc)){at_='l8';break}
        if(loc===33&&pct(25)&&!isclosing)rspeak(8);
        if(!dark()){
          abb[loc]++;
          for(i=atloc[loc];i!==0;i=links[i]){
            obj=i;
            if(obj>100)obj-=100;
            if(obj===steps&&toting(nugget))continue;
            if(prop[obj]<0){
              if(closed)continue;
              prop[obj]=0;
              if(obj===rug||obj===chain)prop[obj]=1;
              tally--;
              if(tally===tally2&&tally!==0)if(limit>35)limit=35;
            }
            ll=prop[obj];
            if(obj===steps&&loc===fixed[steps])ll=1;
            pspeak(obj,ll);
          }
        }
        at_='l2012';break;
      case 'l2009':k=54;at_='l2010';break;
      case 'l2010':spk=k;at_='l2011';break;
      case 'l2011':rspeak(spk);at_='l2012';break;
      case 'l2012':verb=0;obj=0;at_='l2600';break;
      case 'l2600':
        yield* checkhints();
        if(closed){
          if(prop[oyster]<0&&toting(oyster))pspeak(oyster,1);
          for(i=1;i<100;i++)if(toting(i)&&prop[i]<0)prop[i]=-1-prop[i];
        }
        wasdark=dark();
        if(knfloc>0&&knfloc!==loc)knfloc=1;
        yield* getin();
        at_='l2608';break;
      case 'l2608':
        if((foobar=-foobar)>0)foobar=0;
        turns++;
        if(verb===say&&wd2)verb=0;
        if(verb===say){at_='l4090';break}
        if(tally===0&&loc>=15&&loc!==33)clock1--;
        if(clock1===0){closing();at_='l19999';break}
        if(clock1<0)clock2--;
        if(clock2===0){caveclose();at_='l2';break}
        if(prop[lamp]===1)limit--;
        if(limit<=30&&here(batter)&&prop[batter]===0&&here(lamp)){
          rspeak(188);
          prop[batter]=1;
          if(toting(batter))drop(batter,loc);
          limit=limit+2500;
          lmwarn=false;
          at_='l19999';break;
        }
        if(limit===0){
          limit=-1;
          prop[lamp]=0;
          rspeak(184);
          at_='l19999';break;
        }
        if(limit<0&&loc<=8){
          rspeak(185);
          gaveup=true;
          done(2);
        }
        if(limit<=30){
          if(lmwarn||!here(lamp)){at_='l19999';break}
          lmwarn=true;
          spk=187;
          if(place[batter]===0)spk=183;
          if(prop[batter]===1)spk=189;
          rspeak(spk);
        }
        at_='l19999';break;
      case 'l19999':
        k=43;
        if(liqloc(loc)===water)k=70;
        if(weq(wd1,'enter')&&(weq(wd2,'strea')||weq(wd2,'water'))){at_='l2010';break}
        if(weq(wd1,'enter')&&wd2){at_='l2800';break}
        if((weq(wd1,'water')||weq(wd1,'oil'))&&(weq(wd2,'plant')||weq(wd2,'door'))){
          if(at(vocab(wd2,1,0)))wd2='pour';
        }
        at_='l2610';break;
      case 'l2610':
        if(weq(wd1,'west'))if(++iwest===10)rspeak(17);
        at_='l2630';break;
      case 'l2630':
        i=vocab(wd1,-1,0);
        if(i===-1){
          spk=60;
          if(pct(20))spk=61;
          if(pct(20))spk=13;
          rspeak(spk);
          at_='l2600';break;
        }
        k=i%1000;
        switch(idiv(i,1000)+1){
          case 1:at_='l8';break;
          case 2:at_='l5000';break;
          case 3:at_='l4000';break;
          case 4:at_='l2010';break;
          default:bug(22);
        }
        break;
      case 'l8':
        r=march();
        if(r===2){at_='l2';break}
        if(r===99){yield* die(99);at_='l2000';break}
        bug(110);
        break;
      case 'l2800':
        wd1=wd2;wd2='';
        at_='l2610';break;
      case 'l4000':
        verb=k;
        spk=actspeak[verb];
        if(wd2&&verb!==say){at_='l2800';break}
        if(verb===say)obj=wd2?wd2.charCodeAt(0):0;
        if(obj!==0){at_='l4090';break}
        switch(verb){
          case 1:
            if(atloc[loc]===0||links[atloc[loc]]!==0){at_='l8000';break}
            at_='';
            for(i=1;i<=5;i++)if(dloc[i]===loc&&dflag>=2)at_='l8000';
            if(at_)break;
            obj=atloc[loc];
            at_='l9010';break;
          case 2:case 3:case 9:case 10:case 16:case 17:case 19:case 21:case 28:case 29:
            at_='l8000';break;
          case 4:case 6:
            spk=28;
            if(here(clam))obj=clam;
            if(here(oyster))obj=oyster;
            if(at(door))obj=door;
            if(at(grate))obj=grate;
            if(obj!==0&&here(chain)){at_='l8000';break}
            if(here(chain))obj=chain;
            if(obj===0){at_='l2011';break}
            at_='l9040';break;
          case 5:at_='l2009';break;
          case 7:at_='l9070';break;
          case 8:at_='l9080';break;
          case 11:at_='l8000';break;
          case 12:at_='l9120';break;
          case 13:at_='l9130';break;
          case 14:
            if(!here(food)){at_='l8000';break}
            at_='l8142';break;
          case 15:at_='l9150';break;
          case 18:
            gaveup=yield* yes(22,54,54);
            if(gaveup)done(2);
            at_='l2012';break;
          case 20:
            spk=98;
            for(i=1;i<=100;i++){
              if(i!==bear&&toting(i)){
                if(spk===98)rspeak(99);
                blklin=false;
                pspeak(i,-1);
                blklin=true;
                spk=0;
              }
            }
            if(toting(bear))spk=141;
            at_='l2011';break;
          case 22:at_='l9220';break;
          case 23:at_='l9230';break;
          case 24:
            scoring=true;
            write('If you were to quit now, you would score '+score()+' out of a possible '+maxscore+'.');
            scoring=false;
            gaveup=yield* yes(143,54,54);
            if(gaveup)done(2);
            at_='l2012';break;
          case 25:
            k=vocab(wd1,3,0);
            spk=42;
            if(foobar===1-k){
              foobar=k;
              if(k!==4){at_='l2009';break}
              foobar=0;
              if(place[eggs]===plac[eggs]||(toting(eggs)&&loc===plac[eggs])){at_='l2011';break}
              if(place[eggs]===0&&place[troll]===0&&prop[troll]===0)prop[troll]=1;
              k=2;
              if(here(eggs))k=1;
              if(loc===plac[eggs])k=0;
              move(eggs,plac[eggs]);
              pspeak(eggs,k);
              at_='l2012';break;
            }
            if(foobar!==0)spk=151;
            at_='l2011';break;
          case 26:
            spk=156;
            abbnum=10000;
            detail=3;
            at_='l2011';break;
          case 27:
            if(here(magazine))obj=magazine;
            if(here(tablet))obj=obj*100+tablet;
            if(here(message))obj=obj*100+message;
            if(closed&&toting(oyster))obj=oyster;
            if(obj>100||obj===0||dark()){at_='l8000';break}
            at_='l9270';break;
          case 30: /* suspend: this terminal has nowhere to keep it */
            write('I would suspend your adventure, but this terminal has nowhere to keep it.\n');
            at_='l2012';break;
          case 31:
            write('Colossal cave is closed 9am-5pm Mon through Fri except holidays.\n');
            at_='l2012';break;
          default:bug(23);
        }
        break;
      case 'l8000':
        write(wd1+' what?\n');
        obj=0;
        at_='l2600';break;
      case 'l8142':
        destroy(food);
        spk=72;
        at_='l2011';break;
      case 'l4090':
        switch(verb){
          case 1:at_='l9010';break;
          case 2:at_='l9020';break;
          case 3:
            r=trsay();
            at_=r===2012?'l2012':'l2630';
            break;
          case 4:case 6:at_='l9040';break;
          case 5:at_='l2009';break;
          case 7:at_='l9070';break;
          case 8:at_='l9080';break;
          case 9:
            if(!toting(obj)&&(obj!==rod||!toting(rod2)))spk=29;
            if(obj!==rod||!at(fissure)||!toting(obj)||isclosing){at_='l2011';break}
            prop[fissure]=1-prop[fissure];
            pspeak(fissure,2-prop[fissure]);
            at_='l2012';break;
          case 10:case 11:case 18:case 24:case 25:case 26:case 30:case 31:
            at_='l2011';break;
          case 12:at_='l9120';break;
          case 13:at_='l9130';break;
          case 14:
            if(obj===food){at_='l8142';break}
            if(obj===bird||obj===snake||obj===clam||obj===oyster||obj===dwarf||obj===dragon||obj===troll||obj===bear)spk=71;
            at_='l2011';break;
          case 15:at_='l9150';break;
          case 16:
            if(obj!==lamp)spk=76;
            at_='l2011';break;
          case 17:
            r=trtoss();
            at_={2011:'l2011',9020:'l9020',9120:'l9120',8:'l8',9210:'l9210'}[r];
            if(!at_)bug(113);
            break;
          case 19:case 20:
            if(at(obj)||(liq()===obj&&at(bottle))||k===liqloc(loc))spk=94;
            for(i=1;i<=5;i++)if(dloc[i]===loc&&dflag>=2&&obj===dwarf)spk=94;
            if(closed)spk=138;
            if(toting(obj))spk=24;
            at_='l2011';break;
          case 21:at_='l9210';break;
          case 22:at_='l9220';break;
          case 23:at_='l9230';break;
          case 27:at_='l9270';break;
          case 28:
            if(obj===mirror)spk=148;
            if(obj===vase&&prop[vase]===0){
              spk=198;
              if(toting(vase))drop(vase,loc);
              prop[vase]=2;
              fixed[vase]=-1;
              at_='l2011';break;
            }
            if(obj!==mirror||!closed){at_='l2011';break}
            rspeak(197);
            done(3);
            break;
          case 29:
            if(obj!==dwarf||!closed){at_='l2011';break}
            rspeak(199);
            done(3);
            break;
          default:bug(24);
        }
        break;
      case 'l9010':
        r=trtake();
        at_={2011:'l2011',9220:'l9220',2009:'l2009',2012:'l2012'}[r];
        if(!at_)bug(102);
        break;
      case 'l9020':
        r=trdrop();
        if(r===19000)done(3);
        at_={2011:'l2011',2012:'l2012'}[r];
        if(!at_)bug(105);
        break;
      case 'l9040':
        r=tropen();
        at_=r===2010?'l2010':'l2011';
        break;
      case 'l9070':
        if(!here(lamp)){at_='l2011';break}
        spk=184;
        if(limit<0){at_='l2011';break}
        prop[lamp]=1;
        rspeak(39);
        if(wasdark){at_='l2000';break}
        at_='l2012';break;
      case 'l9080':
        if(!here(lamp)){at_='l2011';break}
        prop[lamp]=0;
        rspeak(40);
        if(dark())rspeak(16);
        at_='l2012';break;
      case 'l9120':
        r=yield* trkill();
        if(r===19000)done(3);
        at_={8000:'l8000',8:'l8',2011:'l2011',2608:'l2608'}[r];
        if(!at_)bug(112);
        break;
      case 'l9130':
        if(obj===bottle||obj===0)obj=liq();
        if(obj===0){at_='l8000';break}
        if(!toting(obj)){at_='l2011';break}
        spk=78;
        if(obj!==oil&&obj!==water){at_='l2011';break}
        prop[bottle]=1;
        place[obj]=0;
        spk=77;
        if(!(at(plant)||at(door))){at_='l2011';break}
        if(at(door)){
          prop[door]=0;
          if(obj===oil)prop[door]=1;
          spk=113+prop[door];
          at_='l2011';break;
        }
        spk=112;
        if(obj!==water){at_='l2011';break}
        pspeak(plant,prop[plant]+1);
        prop[plant]=(prop[plant]+2)%6;
        prop[plant2]=idiv(prop[plant],2);
        k=nullw;
        at_='l8';break;
      case 'l9150':
        if(obj===0&&liqloc(loc)!==water&&(liq()!==water||!here(bottle))){at_='l8000';break}
        if(obj!==0&&obj!==water)spk=110;
        if(spk===110||liq()!==water||!here(bottle)){at_='l2011';break}
        prop[bottle]=1;
        place[water]=0;
        spk=74;
        at_='l2011';break;
      case 'l9210':
        trfeed();
        at_='l2011';break;
      case 'l9220':
        r=trfill();
        at_={2011:'l2011',8000:'l8000',9020:'l9020'}[r];
        if(!at_)bug(115);
        break;
      case 'l9230':
        if(prop[rod2]<0||!closed){at_='l2011';break}
        bonus=133;
        if(loc===115)bonus=134;
        if(here(rod2))bonus=135;
        rspeak(bonus);
        done(2);
        break;
      case 'l9270':
        if(dark()){at_='l5190';break}
        if(obj===magazine)spk=190;
        if(obj===tablet)spk=196;
        if(obj===message)spk=191;
        if(obj===oyster&&hinted[2]&&toting(oyster))spk=194;
        if(obj!==oyster||hinted[2]||!toting(oyster)||!closed){at_='l2011';break}
        hinted[2]=yield* yes(192,193,54);
        at_='l2012';break;
      case 'l5000':
        obj=k;
        if(fixed[k]!==loc&&!here(k)){at_='l5100';break}
        at_='l5010';break;
      case 'l5010':
        if(wd2){at_='l2800';break}
        if(verb!==0){at_='l4090';break}
        write('What do you want to do with the '+wd1+'?\n');
        at_='l2600';break;
      case 'l5100':
        if(k===grate){
          if(loc===1||loc===4||loc===7)k=depression;
          if(loc>9&&loc<15)k=entrance;
          if(k!==grate){at_='l8';break}
        }
        if(k===dwarf){
          at_='';
          for(i=1;i<=5;i++)if(dloc[i]===loc&&dflag>=2)at_='l5010';
          if(at_)break;
        }
        if((liq()===k&&here(bottle))||k===liqloc(loc)){at_='l5010';break}
        if(obj===plant&&at(plant2)&&prop[plant2]!==0){
          obj=plant2;
          at_='l5010';break;
        }
        if(obj===knife&&knfloc===loc){
          knfloc=-1;
          spk=116;
          at_='l2011';break;
        }
        if(obj===rod&&here(rod2)){
          obj=rod2;
          at_='l5010';break;
        }
        at_='l5190';break;
      case 'l5190':
        if((verb===find||verb===invent)&&!wd2){at_='l5010';break}
        write('I see no '+wd1+' here\n');
        at_='l2012';break;
      default:
        bug(1);
    }
  }

  /* ---------- run it: everything it prints stays in order, and it reads a line when it asks ---------- */
  var G=game();
  (function step(v){
    var r;
    try{r=G.next(v)}
    catch(e){
      flush();
      if(e!==EXIT)throw e;
      return;
    }
    flush();
    if(r.done)return;
    var line;
    P.queue(function(){return P.readLine('',true).then(function(l){line=l})});
    P.queue(function(){step(line)});
  })();
}

P.command({names:['adventure'],path:'/usr/games',
  man:{what:'an exploration game',syn:'adventure',desc:[
    'the object of the game is to locate and explore colossal cave, find the treasures hidden there, and bring them back to the building with you. the program is your eyes and hands. direct it with commands of one or two words. only the first five letters of each word count.',
    '',
    'written in fortran by will crowther and don woods, and translated to c by jim gillogly. ctrl-c quits, after asking.']},
  run:function(){
    if(P.piped()){P.typeLine('adventure: needs a terminal','err');return}
    Adventure();
  }});

})(window.Phosphor);
