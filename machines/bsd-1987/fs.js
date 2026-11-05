/* PHOSPHOR-9 terminal: machine "bsd-1987", its system folders.
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE. */
Phosphor.setup(function(P){
  'use strict';
  var ST=P.st,OWNER=ST.owner,sys=P.sys;
  P.env.PATH='.:/usr/ucb:/bin:/usr/bin:/etc:/usr/games';
  var UCB=['vi','head','printenv','whoami','uptime','clear','finger','w'];
  sys('/bin','d',{owner:'bin'});
  sys('/etc','d');
  sys('/usr','d');
  sys('/usr/ucb','d',{owner:'bin'});
  sys('/usr/games','d',{owner:'bin'});
  sys('/usr/games/lib','d',{owner:'bin'});
  sys('/usr/games/lib/rogue_roll','f',{owner:'daemon',mode:'-rw-rw-rw-'});
  UCB.forEach(function(b){if(P.cmds[b])P.paths[b]='/usr/ucb'});
  P.programs(function(dir,h){return {owner:dir==='/etc'?'root':'bin',bin:true,size:8192+h*3}});
  var GAMES={aardvark:42,adventure:146214,arithmetic:10240,backgammon:45056,banner:19456,battlestar:195584,bcd:7168,bogdict:78710,boggle:24576,btlgammon:19456,canfield:37888,cfscores:16384,chess:7168,ching:283,cribbage:39936,doctor:26016,factor:11264,fish:12288,fortune:14336,hangman:27648,hunt:37888,mille:44032,monop:37736,number:9216,primes:11264,quiz:12288,rain:15360,robots:35840,rogue:113664,sail:83968,snake:36864,snscore:15360,teachgammon:54272,trek:60416,wargames:909,worm:23552,worms:17408,wump:13312,zork:9216};
  Object.keys(GAMES).forEach(function(g){ /* sizes and owners from the real tape */
    var d=['fortune','robots','rogue'].indexOf(g)>=0?'-rws--x--x':['sail','snake'].indexOf(g)>=0?'-rwsr-xr-x':'-rwxr-xr-x';
    sys('/usr/games/'+g,'f',{owner:/^(fortune|robots|rogue|sail|snake|snscore)$/.test(g)?'daemon':'root',bin:true,size:GAMES[g],mode:d});
  });
  sys('/dev','d');
  sys('/dev/console','c',{mode:'crw--w--w-',dev:[0,0]});
  sys('/dev/tty','c',{mode:'crw-rw-rw-',dev:[2,0]});
  sys('/dev/null','c',{mode:'crw-rw-rw-',dev:[3,2]});
  sys('/dev/kmem','c',{mode:'cr--r-----',dev:[3,1],prot:true});
  sys('/etc/hosts','f',{body:function(){
    var L=['127.0.0.1    localhost '+ST.hostname];
    if(ST.site)L.push('             '+ST.site+'   (somewhere out there)');
    return L;
  }});
  sys('/etc/motd','f',{body:P.profile.welcome});
  sys('/etc/passwd','f',{body:function(){
    var L=['root:VwL97VCAx1Qhs:0:10:Charlie &:/:/bin/csh','toor:*:0:10:Bourne-again Superuser:/:','daemon:*:1:31:The devil himself:/:','operator:*:2:28:System &:/usr/guest/operator:/bin/csh','uucp:*:66:1:UNIX-to-UNIX Copy:/usr/spool/uucppublic:/usr/lib/uucp/uucico','nobody:*:32767:9999:Unprivileged user:/nonexistent:/dev/null','notes:*:5:31:Notesfile maintainer:/usr/spool/notes:/bin/csh','karels:QOrZFUGpxDUlo:6:10:Mike &:/usr/guest/karels:/bin/csh','sam:Yd6H6R7ejeIP2:7:10:& Leffler:/usr/guest/sam:/bin/csh','wnj:ZDjXDBwXle2gc:8:10:Bill Joy:/usr/guest/wnj:/bin/csh'];
    if(OWNER!==ST.user)L.push(OWNER+':Zz8qT3mXcE0aU:8:20::/usr/'+OWNER+':/bin/csh');
    L.push(ST.user+'::9:20::/usr/'+ST.user+':/bin/csh');
    return L;
  }});
  sys('/etc/rc.old','f',{body:['# old rc, kept in case the new one fails','/etc/update','# reminder: root is vaxen until the auditors have gone','/etc/cron']});
  sys('/tmp','d',{mode:'drwxrwxrwx'});
  sys('/vmunix','f',{bin:true,size:501862});
  if(OWNER!==ST.user)sys('/usr/'+OWNER,'d',{owner:OWNER,date:P.fileDate,prot:true});
});
