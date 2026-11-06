/* PHOSPHOR-9 terminal: cowsay and cowthink. The program is written for this terminal; the cows are the .cow
   files in /usr/share/cowsay/cows, read as the real cowsay reads them (see fs.js for the default cow's notice).
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE. */
(function(P){
'use strict';
var COWS='/usr/share/cowsay/cows';
var MODES={b:['==','  '],d:['xx','U '],g:['$$','  '],p:['@@','  '],s:['**','U '],t:['--','  '],w:['OO','  '],y:['..','  ']};
function untab(s){var o='';for(var i=0;i<s.length;i++){var c=s.charAt(i);if(c==='\t')o+=' '.repeat(8-o.length%8);else o+=c}return o}
function fill(L,w){ /* as Perl's Text::Wrap fill: a paragraph starts at a line that begins with white space; each is reflowed */
  var paras=L.map(untab).join('\n').split(/\n\s+/),R=[];
  paras.forEach(function(p,i){
    if(i)R.push('');
    var line='';
    p.replace(/\s+/g,' ').trim().split(' ').forEach(function(word){
      while(word.length>=w){if(line){R.push(line);line=''}R.push(word.slice(0,w-1));word=word.slice(w-1)}
      if(!word)return;
      if(line&&line.length+1+word.length>=w){R.push(line);line=word}
      else line=line?line+' '+word:word;
    });
    R.push(line);
  });
  return R;
}
function cow(name){ /* the picture, from the cowfile, or null */
  var n=P.find(name.indexOf('/')>=0?name:COWS+'/'+name.replace(/\.cow$/,'')+'.cow');
  if(!n||n.type==='d'||n.prot)return null;
  var T=P.text(n),a=-1,b=-1;
  T.forEach(function(l,i){if(a<0&&/<<\s*"?EOC"?\s*;/.test(l))a=i;else if(a>=0&&b<0&&/^EOC\s*$/.test(l))b=i});
  return a<0||b<0?null:T.slice(a+1,b);
}
P.command({names:['cowsay','cowthink'],run:function(a,raw,w){
  var think=/cowthink$/.test(w[0]),args=w.slice(1),eyes='oo',tongue='  ',file='default',W=40,keep=false,words=[];
  for(var i=0;i<args.length;i++){
    var x=args[i],m;
    if(x==='--'){words=words.concat(args.slice(i+1));break}
    if(!/^-./.test(x)||words.length){words.push(x);continue}
    if(x==='-l'){
      var d=P.find(COWS,true);
      P.say(['Cow files in '+COWS+':',(d?Object.keys(d.kids).filter(function(k){return /\.cow$/.test(k)}).sort().map(function(k){return k.replace(/\.cow$/,'')}):[]).join(' ')]);
      return;
    }
    if((m=/^-([efTW])(.*)$/.exec(x))){
      var v=m[2]||args[++i];
      if(v===undefined){P.typeLine('Unknown option: '+m[1],'err');return}
      if(m[1]==='e')eyes=(v+'  ').slice(0,2);else if(m[1]==='T')tongue=(v+'  ').slice(0,2);else if(m[1]==='f')file=v;else W=Math.max(2,parseInt(v,10)||40);
      continue;
    }
    if(x==='-n'){keep=true;continue}
    if(/^-[bdgpstwy]$/.test(x)){eyes=MODES[x.charAt(1)][0];tongue=MODES[x.charAt(1)][1];continue}
    if(x==='-h'){P.typeLine('cow{say,think} version 3.03, (c) 1999 Tony Monroe');P.typeLine('Usage: cowsay [-bdgpstwy] [-h] [-e eyes] [-f cowfile] ');P.typeLine('          [-l] [-n] [-T tongue] [-W wrapcolumn] [message]');return}
    P.typeLine('Unknown option: '+x.slice(1),'err');return;
  }
  var pic=cow(file);
  if(!pic){P.typeLine((think?'cowthink':'cowsay')+': Could not find '+file+' cowfile!','err');P.status(1);return}
  function draw(L){
    L=keep?L.map(untab):fill(L,W);
    if(!L.length)L=[''];
    var n=L.reduce(function(m,l){return Math.max(m,l.length)},0),R=[' '+'_'.repeat(n+2)];
    L.forEach(function(l,k){
      var e=think?['(',')']:L.length===1?['<','>']:!k?['/','\\']:k===L.length-1?['\\','/']:['|','|'];
      R.push(e[0]+' '+l.padEnd(n)+' '+e[1]);
    });
    R.push(' '+'-'.repeat(n+2));
    var V={thoughts:think?'o':'\\',eyes:eyes,tongue:tongue}; /* Perl's escapes first, then the variables; a function, so $$ eyes stay $$ */
    pic.forEach(function(l){R.push(l.replace(/\\(.)/g,'$1').replace(/\$(thoughts|eyes|tongue)/g,function(m,k){return V[k]}))});
    P.say(R);
  }
  if(words.length)draw([words.join(' ')]);
  else P.input([],draw);
}});
})(window.Phosphor);
