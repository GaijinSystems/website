/* PHOSPHOR-9 terminal: frotz, the command that starts a story file on the Z-machine in machines/shared/zmachine.js.
   Written for this terminal; the words it prints are its own, after Frotz's. Copyright (C) 2026 Gaijin Systems.
   GNU AGPL v3 or later; see LICENSE. The stories have their own notices, in machines/shared/zork*-story.js. */
(function(P){
'use strict';
function usage(){
  P.say(['FROTZ V2.54 - Interpreter for Infocom and Inform games.','Complies with standard 1.1 of the Z-Machine Specification.','',
    'Syntax: frotz [options] story-file','  -s #   random number seed','  -v     show version information','  -h #   screen height  -w #   screen width (accepted; the screen decides)','',
    'Story files are looked for in the working directory, then in the directories in INFOCOM_PATH.']);
}
function locate(x){ /* as given, then along INFOCOM_PATH when it has no / */
  var n=P.find(x);
  if(n||x.indexOf('/')>=0)return n;
  var dirs=(P.env.INFOCOM_PATH||'').split(':').filter(Boolean);
  for(var i=0;i<dirs.length;i++){n=P.find(dirs[i]+'/'+x);if(n)return n}
  return null;
}
P.command({names:['frotz'],run:function(a,raw,w){
  var args=w.slice(1),file=null;
  for(var i=0;i<args.length;i++){
    var x=args[i];
    if(x==='-v'){P.say(['FROTZ V2.54','Complies with standard 1.1 of the Z-Machine Specification.']);return}
    if(/^-[shw]$/.test(x)){i++;continue}
    if(/^-./.test(x)){P.typeLine('frotz: unknown option '+x,'err');usage();P.status(1);return}
    if(!file)file=x;
  }
  if(!file){usage();return}
  var n=locate(file);
  if(!n||n.type==='d'||n.prot){P.typeLine('Error: Cannot open story file '+file,'err');P.status(1);return}
  if(!n.story){P.typeLine('Error: '+file+' is not a Z-machine story file','err');P.status(1);return}
  var story=n.story,ok=false;
  P.queue(function(){return P.load(['../shared/'+story+'-story.js']).then(function(x){ok=x})});
  P.queue(function(){
    if(ok&&P.zmachine)P.zmachine.play(story);
    else P.typeLine('frotz: cannot execute','err');
  });
}});
})(window.Phosphor);
