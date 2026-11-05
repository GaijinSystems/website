/* PHOSPHOR-9 terminal: machine "bsd-1987", cfscores. Ported to JavaScript for this terminal from 4.3BSD's
   games/cfscores.c. The scores are kept in this browser, as 'canfield/scores': {name:{hand,inspection,game,
   runs,information,thinktime,wins,worth}}. It keeps this notice:

 * Copyright (c) 1983 Regents of the University of California.
 * All rights reserved.  The Berkeley software License Agreement
 * specifies the terms and conditions for redistribution.
 */
(function(P){
'use strict';
function users(){
  var n=P.find('/etc/passwd');
  return (n?P.text(n):[]).map(function(l){return l.split(':')[0]}).filter(Boolean);
}
function n8(x){return String(x|0).padStart(8)}
function printuser(R,name,printfail){
  var t=R&&P.has(R,name)&&R[name];
  if(!t||typeof t!=='object'||!t.hand){
    if(printfail)P.say([name+' has never played canfield.']);
    return;
  }
  P.say(['*----------------------*',
    t.worth>=0?'* Winnings for '+name.padEnd(8)+'*':'* Losses for '+name.padEnd(10)+'*',
    '*======================*',
    '|Costs           Total |',
    '| Hands       '+n8(t.hand)+' |',
    '| Inspections '+n8(t.inspection)+' |',
    '| Games       '+n8(t.game)+' |',
    '| Runs        '+n8(t.runs)+' |',
    '| Information '+n8(t.information)+' |',
    '| Think time  '+n8(t.thinktime)+' |',
    '|Total Costs  '+n8((t.wins|0)-(t.worth|0))+' |',
    '|Winnings     '+n8(t.wins)+' |',
    '|Net Worth    '+n8(t.worth)+' |',
    '*----------------------*','']);
}
P.command({names:['cfscores'],run:function(a,raw,words){
  var argv=words.slice(1),R=P.saved('canfield/scores'),U=users(),me=P.st.user;
  if(argv.length>1){P.say(['Usage: cfscores [user]']);P.status(1);return}
  if(!argv.length){printuser(R,me,true);return}
  if(argv[0]==='-a'){
    U.forEach(function(u){printuser(R,u,false)});
    if(U.indexOf(me)<0)printuser(R,me,false); /* a visitor may not be in the password file */
    return;
  }
  if(U.indexOf(argv[0])<0&&argv[0]!==me){P.say(['User '+argv[0]+' unknown']);P.status(3);return}
  printuser(R,argv[0],true);
}});
})(window.Phosphor);
