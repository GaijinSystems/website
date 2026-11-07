/* PHOSPHOR-9 terminal: the dial-up board's doors, loaded the first time one opens. Two small games written for
   this board: Star Haul, a trading run between five stations with ten jumps a day, and Deep Mine, how deep you
   dare dig before the roof comes down. Each keeps its players in this browser (phosphor-9/bbs/haul, bbs/mine).
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE. */
(function(P){
'use strict';
function today(){var d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()} /* turns come back each real day */
function store(D,k){var v=D.saved(k);return Object.assign(Object.create(null),v&&typeof v==='object'&&!Array.isArray(v)?v:{})}
function num(x,d){x=+x;return isFinite(x)&&x>=0?Math.floor(x):d}
function hash(s){var h=7;for(var i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))%100003;return h}

/* ---------- Star Haul ---------- */
var STATIONS=[['Luna Exchange',[1,1,1]],['Ceres Yard',[.55,1.4,1.15]],['Vesta Market',[1.05,.65,1.3]],['Io Docks',[1.45,1.2,.7]],['Titan Depot',[1.2,.6,1.45]]];
var GOODS=[['Ore',20],['Grain',12],['Tech',90]],HOLD=30,JUMPS=10;
function price(at,g){ /* the station's own level, moved a little each day */
  var f=STATIONS[at][1][g],w=(hash(today()+at+'/'+g)%31-15)/100;
  return Math.max(1,Math.round(GOODS[g][1]*(f+w)));
}
function worth(s){return s.cr+s.hold.reduce(function(n,q,g){return n+q*GOODS[g][1]},0)}
function haul(D,back){
  var all=store(D,'haul'),k=D.handle.toLowerCase(),s=all[k];
  if(!s||typeof s!=='object')s={};
  s={cr:num(s.cr,300),hold:[0,1,2].map(function(g){return num(s.hold&&s.hold[g],0)}),at:num(s.at,0)%STATIONS.length,
    turns:s.day===today()?num(s.turns,JUMPS):JUMPS,day:today(),best:num(s.best,0),h:D.handle};
  function keep(){s.best=Math.max(s.best,worth(s));all[k]=s;var K=Object.keys(all);if(K.length>30)delete all[K[0]];D.save('haul',all)}
  function cargo(){return s.hold.reduce(function(a,b){return a+b},0)}
  D.blank();
  D.put('|e* |fS T A R   H A U L |e*');
  D.put('|7Buy cheap, jump, sell dear. '+JUMPS+' jumps a day. Luna buys at the old prices.');
  function status(){
    D.blank();
    D.put('|bDocked at |f'+STATIONS[s.at][0]+'|b.  Jumps left today: |e'+s.turns);
    D.put('|bCredits: |a'+s.cr+'|b   Hold: |7'+cargo()+'/'+HOLD+' |8('+GOODS.map(function(g,i){return s.hold[i]+' '+g[0].toLowerCase()}).join(', ')+')');
    D.put('|bPrices here: '+GOODS.map(function(g,i){return '|7'+g[0]+' |e'+price(s.at,i)}).join('  '));
  }
  function good(l){var c=l.trim().toLowerCase().charAt(0);return c==='o'?0:c==='g'?1:c==='t'?2:-1}
  function turn(){
    keep();
    D.ask('B)uy S)ell J)ump P)rices H)igh Q)uit: ',function(l){
      var c=l.trim().toLowerCase().charAt(0);
      if(c==='b'||c==='s'){
        D.ask((c==='b'?'Buy':'Sell')+' which, O)re G)rain T)ech: ',function(w){
          var g=good(w);if(g<0){turn();return}
          var p=price(s.at,g),max=c==='b'?Math.min(Math.floor(s.cr/p),HOLD-cargo()):s.hold[g];
          if(!max){D.put('|c'+(c==='b'?(cargo()>=HOLD?'The hold is full.':'You cannot afford any.'):'You have none to sell.'));turn();return}
          D.ask('How many (up to '+max+')? ',function(n){
            n=Math.min(max,num(parseInt(n,10),0));
            if(n){if(c==='b'){s.cr-=n*p;s.hold[g]+=n}else{s.cr+=n*p;s.hold[g]-=n}
              D.put('|a'+(c==='b'?'Bought ':'Sold ')+n+' '+GOODS[g][0].toLowerCase()+' for '+n*p+' credits.')}
            status();turn();
          });
        });
        return;
      }
      if(c==='j'){jump();return}
      if(c==='p'){
        D.blank();
        STATIONS.forEach(function(st,i){D.put('|e'+(i+1)+' |7'+st[0].padEnd(14)+GOODS.map(function(g,j){return ' |b'+g[0].charAt(0)+'|7'+String(price(i,j)).padStart(4)}).join(''))});
        turn();return;
      }
      if(c==='h'){scores();turn();return}
      if(c==='q'){keep();D.put('|7Your ship waits at '+STATIONS[s.at][0]+'. Worth '+worth(s)+' credits.');back();return}
      status();turn();
    });
  }
  function jump(){
    if(s.turns<=0){D.put('|cNo jumps left today. The drive needs to cool. Come back tomorrow.');turn();return}
    D.blank();
    STATIONS.forEach(function(st,i){if(i!==s.at)D.put('|e'+(i+1)+' |7'+st[0])});
    D.ask('Jump to: ',function(l){
      var n=parseInt(l,10)-1;
      if(!(n>=0&&n<STATIONS.length)||n===s.at){turn();return}
      s.turns--;
      D.put('|7Jumping...');
      var r=Math.random();
      if(r<.12&&cargo()){
        D.put('|cPirates come alongside!');
        D.ask('P)ay them a tenth of your credits, or R)un: ',function(a){
          if(/^p/i.test(a.trim())){var t=Math.ceil(s.cr/10);s.cr-=t;D.put('|7They take '+t+' credits and wave you on.')}
          else if(Math.random()<.5)D.put('|aYou outrun them.');
          else{s.hold=s.hold.map(function(q){return Math.floor(q/2)});D.put('|cThey catch you, and take half the hold.')}
          arrive(n);
        });
        return;
      }
      if(r<.2&&cargo()<HOLD){var f=Math.min(3,HOLD-cargo());s.hold[2]+=f;D.put('|aA drifting hulk: you salvage '+f+' tech.')}
      else if(r<.26&&s.turns>0){s.turns--;D.put('|cA solar storm. The jump takes two days of fuel.')}
      arrive(n);
    });
  }
  function arrive(n){s.at=n;status();turn()}
  function scores(){
    var T=[['Night Owl',4180],['Static',2210],['Lone Coder',1630]];
    Object.keys(all).forEach(function(x){var v=all[x];if(v&&typeof v==='object')T.push([D.clean(v.h||x,20),num(v.best,0)])});
    if(!all[k])T.push([D.handle,s.best]);
    T.sort(function(a,b){return b[1]-a[1]});
    D.blank();D.put('|bBest hauls');
    T.slice(0,8).forEach(function(t,i){D.put('|e'+(i+1)+' |7'+D.clean(t[0],20).padEnd(20)+' |a'+t[1])});
  }
  status();turn();
}

/* ---------- Deep Mine ---------- */
var DIGS=3;
function mine(D,back){
  var all=store(D,'mine'),k=D.handle.toLowerCase(),s=all[k];
  if(!s||typeof s!=='object')s={};
  s={bank:num(s.bank,0),runs:s.day===today()?num(s.runs,DIGS):DIGS,day:today(),h:D.handle,deep:num(s.deep,0)};
  function keep(){all[k]=s;var K=Object.keys(all);if(K.length>30)delete all[K[0]];D.save('mine',all)}
  D.blank();
  D.put('|e# |fD E E P   M I N E |e#');
  D.put('|7Every ten metres down, more gold, and the roof creaks more. Climb out to keep what you carry.');
  function start(){
    keep();
    D.blank();
    D.put('|bGold in the bank: |e'+s.bank+'|b.  Trips left today: |7'+s.runs+'|b.  Deepest: |7'+s.deep+' m');
    if(s.runs<=0){D.put('|cThe foreman says that is enough for one day.');scores();back();return}
    D.yes('Go down (Y/n)? ',true,function(y){
      if(!y){scores();back();return}
      s.runs--;keep();
      dig(0,0);
    });
  }
  function dig(depth,carry){
    D.ask('At '+depth+' m with '+carry+' gold. D)ig or C)limb out: ',function(l){
      var c=l.trim().toLowerCase().charAt(0);
      if(c==='c'||c==='q'){
        s.bank+=carry;keep();
        D.put('|aYou climb into the daylight with '+carry+' gold.');
        start();return;
      }
      if(c!=='d'){dig(depth,carry);return}
      depth+=10;
      s.deep=Math.max(s.deep,depth);
      var risk=Math.min(.9,depth/10*.07);
      if(Math.random()<risk){
        D.put('|cThe roof comes down! You crawl out with nothing.');
        keep();start();return;
      }
      var f=Math.floor(Math.random()*depth/2)+Math.ceil(depth/5);
      D.put('|7You dig to '+depth+' m and find |e'+f+'|7 gold.'+(risk>.3?' |8The timbers groan.':''));
      dig(depth,carry+f);
    });
  }
  function scores(){
    var T=[['Copper Pair',640],['Night Owl',415]];
    Object.keys(all).forEach(function(x){var v=all[x];if(v&&typeof v==='object')T.push([D.clean(v.h||x,20),num(v.bank,0)])});
    T.sort(function(a,b){return b[1]-a[1]});
    D.blank();D.put('|bRichest miners');
    T.slice(0,8).forEach(function(t,i){D.put('|e'+(i+1)+' |7'+t[0].padEnd(20)+' |a'+t[1])});
  }
  start();
}

P.bbsDoors={starhaul:haul,deepmine:mine};
P.setup(function(){}); /* notes the file as loaded */
})(window.Phosphor);
