/* PHOSPHOR-9 terminal: machine "bbs-1990": the modem's side of the line. At power-on the terminal dials the board
   (ATDT and its number, as if typed); when the board hangs up, NO CARRIER, and the terminal goes back to the
   machine the visitor came from. Without one to go back to, it waits at the modem, where ATDT dials again.
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE. */
(function(P){
'use strict';
var M=null;
function origin(){ /* where connect came from: the page before, else this tab's random pick, else the site's first machine */
  var ok=function(m){m=String(m||'').toLowerCase();return m&&m!==P.machine&&P.allowed.indexOf(m)>=0?m:''},m;
  try{
    var r=new URL(document.referrer);
    if(r.origin===location.origin&&r.pathname===location.pathname&&(m=ok(r.searchParams.get('machine'))))return m;
  }catch(e){}
  try{if((m=ok(sessionStorage.getItem('phosphor-9/machine'))))return m}catch(e){}
  return ok(P.profile.machine)||P.allowed.filter(function(x){return x!==P.machine})[0]||'';
}
function hungUp(){
  var to=origin();
  if(!to)return;
  P.pause(1500);
  P.queue(function(){var q=new URLSearchParams(location.search);q.set('machine',to);location.search=q.toString()});
}
function key(k){document.dispatchEvent(new KeyboardEvent('keydown',{key:k,bubbles:true,cancelable:true}))}
function dial(){ /* the number, typed at the modem as a person would. A browser plays no sound until the visitor has
  pressed something on this page, so with the sound on, the return that dials is theirs */
  var wait=P.sound(); /* as the welcome says */
  P.queue(function(){
    return new Promise(function(res){
      var s='ATDT'+P.bbs.conf().number,i=0;
      setTimeout(function next(){
        if(i<s.length){key(s.charAt(i++));setTimeout(next,60+Math.random()*70);return}
        if(wait)res();else setTimeout(function(){key('Enter');res()},250);
      },700);
    });
  },true);
}
P.command({names:['atdt'],help:'dial a number (atdt and the number)',noHelpFlag:true,run:function(a,raw){M.command(raw)}});
P.setup(function(){
  P.bbs.welcome=P.profile.welcome; /* the board shows the welcome, once the call goes through */
  P.profile.welcome=P.sound()?[['(press return to dial.)','dim']]:[];
  P.profile.mailNotice='';
  P.setPrompt(function(){return ''});
  M=P.modem.open({speed:2400,connect:function(m){P.bbs.call(m,hungUp)}});
  P.fallback=function(word,raw){
    if(!M.command(raw))P.typeLine('(the modem only listens to lines that start with AT.)','dim');
    return true;
  };
  setTimeout(dial,0);
});
})(window.Phosphor);
