/* PHOSPHOR-9 terminal: people and time (about, mail, who, whoami, date, source).
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE. */
(function(P){
'use strict';

P.command({names:['about'],terminal:true,help:'the owner of this machine',
  enabled:function(p){return p.about.length>0}, /* no == about == section: no about command, no about file */
  man:{what:'who owns this machine',syn:'about',desc:[
    'prints the about file. same as cat about.']},
  run:function(){P.say(P.profile.about)}});

/* the letter is the whole == mail == section; the engine only adds the From line */
P.command({names:['mail'],core:true,terminal:true,help:'read your mail',path:'/bin',
  man:{what:'read your mail',syn:'mail',desc:[
    'prints your mail. there is usually one letter.'],bugs:[
    'there is no modem, so you cannot answer it from here.']},
  run:function(){
    var M=P.profile.mail;
    if(!M.length){P.typeLine('No mail.');return}
    var sent=new Date(P.st.login.getTime()-36e5*3);
    P.typeLine('From '+P.st.owner+' '+P.ctime(sent)+' '+sent.getFullYear());
    P.typeLine('');
    P.say(M);
  }});

P.command({names:['who'],path:'/bin',
  man:{what:'who is on the system',syn:'who [ am i ]',desc:[
    'lists everyone logged in: name, terminal, and the time they arrived. who am i lists only you.']},
  run:function(a){
    var me=P.st.user.padEnd(9)+'tty0     '+P.short(P.st.login);
    if(a[0]==='am'&&a[1]==='i'){P.typeLine(me);return}
    P.say([P.st.owner.slice(0,8).padEnd(9)+'console  '+P.short(P.fileDate),me]);
  }});

P.command({names:['whoami'],
  man:{what:'print your login name',syn:'whoami',desc:[
    'prints the name you logged in as.']},
  run:function(){P.typeLine(P.st.user)}});

P.command({names:['date'],path:'/bin',
  man:{what:'print the date',syn:'date',desc:[
    'prints the date and time.'],bugs:[
    'the year is always {year}.']},
  run:function(){
    var d=P.now(),z=P.tz();
    P.typeLine(P.ctime(d)+(z?' '+z:'')+' '+d.getFullYear());
  }});

/* the GNU AGPL asks that people using a changed copy can get its source: set "source:" in
   site/config.js to wherever your copy's source lives. Unset, it points at the original. */
P.command({names:['source'],core:true,terminal:true,help:'where to get this terminal',
  man:{what:'where to get this terminal',syn:'source',desc:[
    'prints where to get the source code for this terminal. it is free software: you may study, change and share it under the gnu affero general public license, version 3 or later.']},
  run:function(){
    var url=P.profile.source||P.upstream;
    P.say([
      'this terminal is free software (gnu agpl v3 or later).',
      'the source is at:',
      [url,'',{href:url}],
      ['you will need a modem from the future.','dim']
    ]);
  }});

})(window.Phosphor);
