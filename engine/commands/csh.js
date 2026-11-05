/* PHOSPHOR-9 terminal: what csh and Berkeley brought (history, finger, w), on machines with "csh: yes".
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE. */
(function(P){
'use strict';
function on(p){return p.csh}
P.command({names:['history'],noHelpFlag:true,enabled:on,run:function(){
  P.say(P.hist().map(function(l,i){return String(i+1).padStart(6)+'  '+l}));
}});
P.command({names:['finger'],path:'/usr/ucb',enabled:on,
  man:{what:'user information lookup program',syn:'finger [ name ... ]',desc:['prints who is logged in, or what is known about the name given.']},
  run:function(a){
    var S=P.st;
    if(!a.length){
      P.say(['Login       Name              TTY Idle    When            Office'].concat([
        [S.owner,'the operator','co','1:02',P.short(P.fileDate)],[S.user,'visitor','02','',P.short(S.login)]
      ].map(function(r){return r[0].padEnd(12)+r[1].padEnd(18)+r[2].padEnd(4)+r[3].padEnd(8)+r[4]})));
      return;
    }
    a.forEach(function(x){
      var known=x===S.owner||x===S.user||x==='root';
      if(!known){P.typeLine('finger: '+x+': no such user.');return}
      P.say(['Login name: '+x.padEnd(24)+'In real life: '+(x==='root'?'The Super User':x===S.user?'visitor':'the operator'),
        'Directory: '+(x==='root'?'/':P.profile.homes+'/'+x).padEnd(25)+'Shell: /bin/csh',x===S.user?'On since '+P.short(S.login)+' on tty02':'Last login '+P.short(P.fileDate),'No Plan.']);
    });
  }});
P.command({names:['w'],path:'/usr/ucb',enabled:on,
  man:{what:'who is on and what they are doing',syn:'w',desc:['prints the time, how long the machine has been up, who is on, and what they are doing.']},
  run:function(){
    var S=P.st;
    P.say(['  '+P.short(P.now()).slice(7)+'  up 12 days, 4:17,  2 users,  load average: 0.08, 0.03, 0.01',
      'User     tty       login@  idle   JCPU   PCPU  what',
      S.owner.padEnd(9)+'console  '+P.short(P.fileDate).slice(7)+'   1:02     12      3  -csh',
      S.user.padEnd(9)+'tty02    '+P.short(S.login).slice(7)+'             1      1  w']);
  }});
})(window.Phosphor);
