/* PHOSPHOR-9 terminal: machine "c128-1986", the disk in drive 8 as it comes: the site's words as programs that
   print them (WELCOME, which the C128 boots, then ABOUT and LETTER), the site's files as sequential files, READ to
   show one, and the games. Remade at every power-on from the content and games.js.
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE. */
(function(P){
'use strict';
var C=P.c128=P.c128||{};
var READER=[ /* a sequential file to the screen, the usual way */
  '10 PRINT "READ A SEQUENTIAL FILE.":PRINT',
  '20 INPUT "FILE NAME";F$:IF F$="" THEN END',
  '30 OPEN 15,8,15:OPEN 2,8,2,F$+",S,R"',
  '40 INPUT#15,E,E$,T,S:IF E THEN PRINT E;E$:GOTO 80',
  '50 GET#2,A$:IF A$="" THEN A$=CHR$(0)',
  '60 PRINT A$;:IF ST=0 THEN 50',
  '70 PRINT',
  '80 CLOSE 2:CLOSE 15'
];
function pet(s,lower){ /* text to PETSCII for the set in use */
  var o='';
  s=String(s).replace(/[‘’“”"]/g,"'").replace(/[–—]/g,'-').replace(/\u0003([^\u0004]*)\u0004?/g,'$1').replace(/[\u0001-\u0004]/g,'');
  for(var i=0;i<s.length;i++){
    var c=s.charCodeAt(i);
    if(c>=97&&c<=122)o+=String.fromCharCode(c-32);
    else if(c>=65&&c<=90)o+=String.fromCharCode(lower?c+128:c);
    else if(c>=32&&c<=93&&c!==92)o+=s.charAt(i);
    else o+='?';
  }
  return o;
}
function wrap(t,w){ /* words onto lines of at most w */
  var L=[],cur='';
  t.split(' ').forEach(function(x){
    while(x.length>w){if(cur){L.push(cur);cur=''}L.push(x.slice(0,w));x=x.slice(w)}
    if(!cur)cur=x;else if(cur.length+1+x.length<=w)cur+=' '+x;else{L.push(cur);cur=x}
  });
  L.push(cur);
  return L;
}
function printer(lines,lower,last){ /* a BASIC program that prints these lines, in the colour in use */
  var B=[],n=10;
  if(lower)B.push(n+' PRINT CHR$(14);');
  (lines||[]).forEach(function(l){
    var x=P.lineOf(l),text=String(x[0]),href=x[2]&&x[2].href;
    if(href)text+=' ('+href+')';
    var lead=/^ */.exec(text)[0];
    wrap(text.slice(lead.length),39-lead.length).forEach(function(w){
      var s=pet(lead+w,lower);
      n+=10;B.push(n+(s.trim()?' PRINT "'+s+'"':' PRINT'));
    });
  });
  if(last)B.push((n+10)+' '+last);
  return B;
}
function prg(lines,seven){ /* BASIC text to a program file */
  var b=new C.Basic({drive:null},seven);
  lines.forEach(function(l){
    var m=/^(\d+) ?(.*)$/.exec(l);
    b.store(+m[1],C.crunch(m[2],seven));
  });
  return b.prg();
}
function seq(lines,lower){
  var s='';(lines||[]).forEach(function(l){s+=pet(P.lineOf(l)[0],lower)+'\r'});
  return C.bytes(s);
}
C.disk=function(P){
  var pr=P.profile,lower=false,F=[]; /* the upper case set, as the C128 starts: the words in capitals */
  function add(name,type,data,o){F.push(Object.assign({name:name,type:type,data:data},o||{}))}
  add('WELCOME','PRG',prg(printer(pr.welcome,lower,'NEW'),true)); /* the C128 boots it; it leaves nothing behind */
  if(pr.about&&pr.about.length)add('ABOUT','PRG',prg(printer(pr.about,lower),true));
  if(pr.mail&&pr.mail.length)add('LETTER','PRG',prg(printer(pr.mail,lower),true));
  (C.games||[]).forEach(function(g){add(g.name,'PRG',prg(g.lines,false))});
  add('READ','PRG',prg(READER,false));
  var seen={};
  (pr.files||[]).forEach(function(f){
    var n=pet(f.name.replace(/^\/+/,''),false).slice(0,16);
    if(!n||seen[n])return;seen[n]=1;
    add(n,'SEQ',seq(f.body,lower));
  });
  (pr.protected||[]).forEach(function(p){
    var n=pet(p.replace(/\/+$/,''),false).slice(0,16);
    if(!n||seen[n])return;seen[n]=1;
    add(n,'SEQ',new Uint8Array(1800),{prot:true});
  });
  return {name:pet((pr.host||'phosphor').toUpperCase(),false).slice(0,16),id:'85',files:F};
};
})(window.Phosphor);
