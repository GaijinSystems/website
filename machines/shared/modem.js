/* PHOSPHOR-9 terminal: a Hayes-style modem, for the dial-up board. It takes AT commands, dials with
   tones or pulses through its little speaker (dial tone, the digits, the ring, the answer tone and the
   handshake, all made here with WebAudio, and only while the terminal's sound is on), and gives the
   result codes: CONNECT 2400, BUSY, NO CARRIER. +++ then ATH hangs up.
   Used by the bbs machine, and by TERM on MS-DOS and CP/M. The board itself is in bbs.js.
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE. */
(function(P){
'use strict';

/* ---------- the speaker ---------- */
var AC=null,live=[];
function audio(){
  if(!P.sound())return null;
  try{
    if(!AC)AC=new (window.AudioContext||window.webkitAudioContext)();
    if(AC.state!=='running')AC.resume();
  }catch(e){return null}
  return AC;
}
function hush(){ /* everything still sounding or still to come stops: a hang-up, or a key that aborts the dial */
  live.forEach(function(g){try{g.gain.cancelScheduledValues(0);g.gain.value=0;g.disconnect()}catch(e){}});
  live=[];
  if(AC&&AC.state==='running')try{AC.suspend()}catch(e){} /* a quiet line costs the browser nothing; audio() wakes it */
}
function Speaker(vol){ /* a group of sounds laid out on one time line, from now; at(ms) and the rest add to it. vol 0: silent (ATM0) */
  var a=vol===0?null:audio(),g=null,t0=0;
  if(a){g=a.createGain();g.gain.value=vol||.6;g.connect(a.destination);live.push(g);t0=a.currentTime+.03}
  function env(gn,at,dur,lv){ /* a short ramp in and out: no clicks at the edges */
    var s=t0+at/1000,e=s+dur/1000;
    gn.gain.setValueAtTime(0,s);gn.gain.linearRampToValueAtTime(lv,s+.006);
    gn.gain.setValueAtTime(lv,Math.max(s+.007,e-.008));gn.gain.linearRampToValueAtTime(0,e);
    return [s,e];
  }
  return {
    tone:function(hz,at,dur,lv){ /* hz: one frequency or a list sounding together (the telephone's pairs) */
      if(!g)return;
      [].concat(hz).forEach(function(f){
        var o=a.createOscillator(),gn=a.createGain(),w=env(gn,at,dur,(lv||.05));
        o.type='sine';o.frequency.value=f;o.connect(gn);gn.connect(g);o.start(w[0]);o.stop(w[1]+.02);
      });
    },
    hiss:function(at,dur,lv,hz,q){ /* noise through a band: the scrambled data of the handshake */
      if(!g)return;
      var n=Math.ceil(a.sampleRate*dur/1000)+64,b=a.createBuffer(1,n,a.sampleRate),d=b.getChannelData(0),x=12345;
      for(var i=0;i<n;i++){x=(x*1103515245+12345)&0x7fffffff;d[i]=x/0x3fffffff-1} /* its own numbers: Math.random may be anyone's */
      var s=a.createBufferSource(),f=a.createBiquadFilter(),gn=a.createGain(),w=env(gn,at,dur,lv||.05);
      s.buffer=b;f.type='bandpass';f.frequency.value=hz||1800;f.Q.value=q||.8;
      s.connect(f);f.connect(gn);gn.connect(g);s.start(w[0]);s.stop(w[1]+.02);
    },
    click:function(at){this.hiss(at,12,.12,900,.5)} /* the relay of a pulse dialler */
  };
}

/* ---------- what the line does with a number ---------- */
var DTMF={'1':[697,1209],'2':[697,1336],'3':[697,1477],'4':[770,1209],'5':[770,1336],'6':[770,1477],
  '7':[852,1209],'8':[852,1336],'9':[852,1477],'*':[941,1209],'0':[941,1336],'#':[941,1477]};
var DIAL=[350,440],RING=[440,480],BUSY=[480,620];
function digits(s){return String(s||'').replace(/[^0-9*#]/g,'')}
/* where a number goes: the board, the other boards on its list (busy, or nobody home), or nowhere */
function lineFor(num){
  var d=digits(num),B=P.bbs&&P.bbs.numbers?P.bbs.numbers():{};
  for(var k in B)if(P.has(B,k)){var n=digits(k);if(n&&(d===n||n.length>=7&&d.slice(-n.length)===n))return B[k]} /* a prefix (1, an area code) before a full number is fine */
  return 'none';
}
/* the whole call, laid out in time: [ms, what] steps for the speaker, and when the result comes */
function plan(sp,num,pulse,speed){
  var t=0,d=digits(num),fate=lineFor(num);
  sp.tone(DIAL,t,900,.035);
  t+=1000;
  d.split('').forEach(function(c){
    if(pulse){ /* ten pulses a second, a pause between digits */
      var n=c==='0'?10:/\d/.test(c)?+c:0;
      for(var i=0;i<n;i++){sp.click(t);t+=100}
      t+=600;
    }else{sp.tone(DTMF[c],t,85,.04);t+=150}
  });
  t+=500;
  var res;
  if(fate==='busy'){
    for(var b=0;b<4;b++){sp.tone(BUSY,t,500,.03);t+=1000}
    res='BUSY';
  }else if(fate==='board'){
    sp.tone(RING,t,1700,.03);
    t+=2300;
    var ans=speed>=2400?2100:2225; /* the answer tone: CCITT's 2100 Hz before V.22bis, Bell 212A's 2225 Hz */
    sp.tone(ans,t,1100,.04);
    t+=1150;
    if(speed>=2400){ /* V.22bis: the two carriers, then the scrambled ones, slowing to a hiss */
      sp.tone([1200,2400],t,500,.025);sp.hiss(t+450,1500,.07,1800,.7);sp.tone(2400,t+450,1500,.012);
      t+=2000;
    }else{
      sp.tone([1200,2225],t,350,.025);sp.hiss(t+300,800,.06,1700,.8);
      t+=1100;
    }
    res='CONNECT';
  }else{ /* rings out, and nobody answers: the modem gives up when its wait (S7) is over */
    for(var r=0;r<3;r++){sp.tone(RING,t,1700,.03);t+=4000}
    res='NO CARRIER';
  }
  return {ms:t,res:res};
}

/* ---------- the modem: one per program that talks to it ---------- */
function regs(){return {0:0,7:30,12:50}} /* S0 rings to answer, S7 the wait for carrier, S12 the escape guard time */
var CODES={'OK':0,'CONNECT':1,'RING':2,'NO CARRIER':3,'ERROR':4,'CONNECT 1200':5,'NO DIALTONE':6,'BUSY':7,'NO ANSWER':8,'CONNECT 2400':10};
P.modem={
  hush:hush,
  digits:digits,
  /* o.speed: 1200 or 2400; o.upper: results in capitals only (they are anyway). o.connect(M) is called, inside a
     queued step, when a call goes through; it runs the session and calls M.hangup() when the line drops */
  open:function(o){
    var M={speed:o.speed||2400,verbose:true,quiet:false,speaker:1,regs:regs(),online:false,last:'',number:''};
    M.result=function(r){ /* a result code, in words or as a number (ATV0) */
      if(M.quiet)return;
      if(r==='CONNECT'&&M.speed>300)r='CONNECT '+M.speed;
      P.typeLine(M.verbose?r:String(CODES[r]===undefined?4:CODES[r]));
    };
    /* a command line. Returns false if it is not one (no AT): the modem ignores it */
    M.command=function(line){
      var s=String(line||'').trim().toUpperCase().replace(/\s+/g,'');
      if(s==='A/')s=M.last;
      if(!/^AT/.test(s))return false;
      M.last=s;
      var i=2,c,n,err=false,dial=null,hang=false,on=false,ans=false,info=[];
      function num(){var m=s.slice(i).match(/^\d*/)[0];i+=m.length;return m===''?0:+m}
      while(i<s.length&&!err){
        c=s.charAt(i++);
        if(c==='D'){dial=s.slice(i);i=s.length;break}
        else if(c==='E'){num()}
        else if(c==='Q'){M.quiet=num()===1}
        else if(c==='V'){M.verbose=num()!==0}
        else if(c==='M'){M.speaker=num()}
        else if(c==='L'||c==='X'||c==='B'||c==='C'||c==='Y'||c==='P'||c==='T'){num()}
        else if(c==='H'){num();hang=true}
        else if(c==='O'){num();on=true}
        else if(c==='Z'){num();M.verbose=true;M.quiet=false;M.speaker=1;M.regs=regs()}
        else if(c==='I'){n=num();if(n===0)info.push(String(M.speed===2400?246:124));else if(n===1)info.push('063');else if(n===2){}else err=true}
        else if(c==='A'){ans=true;break} /* nobody is calling */
        else if(c==='&'){if(/[A-Z]/.test(s.charAt(i))){i++;num()}else err=true}
        else if(c==='S'){
          n=num();
          if(s.charAt(i)==='='){i++;M.regs[n]=num()}
          else if(s.charAt(i)==='?'){i++;info.push(String(M.regs[n]||0).padStart(3,'0'))}
          else err=true;
        }
        else err=true;
      }
      if(ans){P.pause(2000);M.result('NO CARRIER');return true}
      if(err){M.result('ERROR');return true}
      info.forEach(function(x){P.typeLine(x)});
      if(hang){if(M.online){M.online=false;hush()}M.result('OK');return true}
      if(on){if(M.online&&M.resume){var r=M.resume;M.resume=null;M.result('CONNECT');r()}else M.result('NO CARRIER');return true}
      if(dial!==null){if(M.online)M.result('ERROR');else M.dial(dial);return true}
      M.result('OK');
      return true;
    };
    M.dial=function(str){
      var stay=/;$/.test(str),pulse=(str.replace(/[^TP]/g,'').slice(-1)==='P'); /* the last of T or P says how */
      M.number=str;
      if(!digits(str)){P.pause(1500);M.result(stay?'OK':'NO CARRIER');return}
      var sp=Speaker(M.speaker===0?0:M.speaker===2?.9:.6),p=plan(sp,str,pulse,M.speed),cut=false;
      if(stay)p={ms:p.ms-(p.res==='CONNECT'?4000:0),res:'OK'};
      P.queue(function(){
        var rang=false;setTimeout(function(){rang=true},Math.max(0,p.ms-20));
        return P.sleep(p.ms).then(function(){cut=!rang}); /* ^C wakes it early: a key aborts the dial */
      },true);
      P.queue(function(){
        if(cut){hush();P.typeLine('');M.result('NO CARRIER');return}
        if(stay){M.result('OK');return}
        if(p.res!=='CONNECT'){M.result(p.res);return}
        hush();
        M.online=true;
        M.result('CONNECT');
        if(o.connect)o.connect(M);
      },true);
    };
    /* the line drops: the board said goodbye, or ATH */
    M.hangup=function(quietly){
      var was=M.online;
      M.online=false;M.resume=null;hush();
      if(was&&!quietly){P.typeLine('');M.result('NO CARRIER')}
    };
    /* +++ while on line: the modem listens for commands, and the call stays up until ATH. back() goes on line again (ATO) */
    M.escape=function(back,gone){
      P.pause(1000); /* the guard time */
      M.result('OK');
      M.resume=back;
      (function more(){
        var l;
        P.queue(function(){return P.readLine('',true).then(function(x){l=x})},true);
        P.queue(function(){
          if(l===null||l===P.INT){more();return}
          var s=String(l).trim();
          if(!s){more();return}
          if(!M.command(s)){more();return}
          P.queue(function(){
            if(!M.online){M.resume=null;P.typeLine('');gone();return}
            if(M.resume)more();
          },true);
        },true);
      })();
    };
    return M;
  }
};
/* a terminal program on the machine (TERM on MS-DOS and CP/M): what is typed goes to the modem, a call goes to
   the board, and ^C or ^D at the modem's prompt goes back to the machine. o: {speed, banner:[lines], bye:[lines]} */
P.modem.terminal=function(o){
  var M=P.modem.open({speed:o.speed,connect:function(m){P.bbs.call(m,function(){})}});
  P.say(o.banner||[]);
  (function loop(){
    var l;
    P.queue(function(){return P.readLine('',true).then(function(x){l=x})},true);
    P.queue(function(){
      if(l===P.INT||l===null){hush();P.say(o.bye||[]);return}
      M.command(l);
      loop();
    },true);
  })();
};
P.setup(function(){}); /* notes the file as loaded */
})(window.Phosphor);
