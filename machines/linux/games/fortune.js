/* PHOSPHOR-9 terminal: fortune, as Debian's fortune-mod behaves, reading the sayings from
   /usr/share/games/fortunes. Written for this terminal. Copyright (C) 2026 Gaijin Systems.
   GNU AGPL v3 or later; see LICENSE. */
(function(P){
'use strict';
var DIR='/usr/share/games/fortunes';
function files(){
  var d=P.find(DIR,true);
  return d?Object.keys(d.kids).filter(function(k){return !/\.(dat|u8)$/.test(k)&&d.kids[k].type!=='d'&&!d.kids[k].bin}).sort():[];
}
function sayings(f){ /* the % separated entries of one file */
  var n=P.find(DIR+'/'+f,true),L=[],cur=[];
  (n?P.text(n):[]).forEach(function(l){if(l==='%'){if(cur.length)L.push(cur);cur=[]}else cur.push(l)});
  if(cur.length)L.push(cur);
  return L;
}
P.command({names:['fortune'],run:function(a,raw,w){
  var args=w.slice(1),short=false,long=false,show=false,list=false,len=160,pat=null,want=[];
  for(var i=0;i<args.length;i++){
    var x=args[i];
    if(x==='-n'){len=parseInt(args[++i],10)||160;continue}
    if(x==='-m'){pat=args[++i]||'';continue}
    if(/^-[acefilosuw]+$/.test(x)){
      if(/s/.test(x))short=true;if(/l/.test(x))long=true;if(/c/.test(x))show=true;if(/f/.test(x))list=true;
      if(/o/.test(x)){P.typeLine('No fortunes found','err');P.status(1);return}
      continue;
    }
    if(/^-/.test(x)){P.typeLine("fortune: invalid option -- '"+x.charAt(1)+"'",'err');P.status(1);return}
    if(/%$/.test(x))continue;
    want.push(x==='all'?null:x.replace(/^.*\//,''));
  }
  var F=files();
  if(want.length&&want.indexOf(null)<0){
    var bad=want.filter(function(x){return F.indexOf(x)<0})[0];
    if(bad!==undefined){P.typeLine(bad+': No such file or directory','err');P.typeLine('No fortunes found','err');P.status(1);return}
    F=want;
  }
  if(list){P.say(['100.00% '+DIR].concat(F.map(function(f){return '    '+(100/F.length).toFixed(2)+'% '+f})));return}
  var all=[];
  F.forEach(function(f){sayings(f).forEach(function(s){all.push({f:f,s:s})})});
  if(pat!==null){
    var re;try{re=new RegExp(pat)}catch(e){P.typeLine('fortune: bad pattern','err');return}
    all.filter(function(e){return re.test(e.s.join('\n'))}).forEach(function(e,k){if(!k)P.typeLine('('+e.f+')','err');P.say(e.s.concat(['%']))});
    return;
  }
  all=all.filter(function(e){var n=e.s.join('\n').length;return (!short||n<=len)&&(!long||n>len)});
  if(!all.length){P.typeLine('No fortunes found','err');P.status(1);return}
  var e=all[Math.floor(Math.random()*all.length)];
  if(show)P.say(['('+e.f+')','%']);
  P.say(e.s);
}});
})(window.Phosphor);
