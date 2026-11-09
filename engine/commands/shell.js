/* PHOSPHOR-9 terminal: shell commands (help, man, alias, echo, clear, exit, sound).
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE. */
(function(P){
'use strict';

P.command({names:['help'],core:true,terminal:true,
  man:function(pr){return {what:'list the commands',syn:'help',desc:[
    'lists the commands, alphabetically, with a few words about each, and apart from them the ones the terminal answers itself. man name says more about any of them.',
    '',
    'name '+(pr.bash?'--help':'-h')+' prints the synopsis of a command that has a manual page.']}},
  run:function(){
    var H=P.help(),man=P.has(P.cmds,'man'),split=!P.profile.noUnix; /* the other machines' help is all the terminal's */
    H.sort(function(a,b){return a[0].toLowerCase()<b[0].toLowerCase()?-1:1}); /* alphabetical */
    function rows(L){return L.map(function(h){return ['  '+h[0].padEnd(13)+' '+h[1],'',{hang:16}]})} /* wraps under its description */
    var own=H.filter(function(h){return split&&P.own(h[0])});
    P.say(['commands:'].concat(rows(H.filter(function(h){return own.indexOf(h)<0})),
      own.length?['',"the terminal's, not the machine's:"]:[],rows(own),
      man?['',['man name for details, or name '+(P.profile.bash?'--help':'-h')+'.','dim']]:[]));
  }});

P.command({names:['man'],core:true,help:'the manual',
  man:{what:'print the manual',syn:'man name',desc:[
    'prints the manual page for name. with no name, lists the commands, as help does; berkeley\'s man just says how to use it.']},
  run:function(a){
    if(!a[0]){
      if(P.profile.perror){P.typeLine('Usage: man [ section ] name ...');return}
      if(P.has(P.cmds,'help')){P.cmds.help([],'help');return}
      P.say(['usage: man name',['pages: '+Object.keys(P.man).sort().join(', '),'dim',{hang:7}]]); /* help is switched off */
      return;
    }
    if(P.has(P.man,a[0]))P.say(P.manPage(a[0]));
    else P.typeLine('No manual entry for '+a[0]+'.');
  }});

/* aliases, on the machines whose shell had them: from the == aliases == section, plus any set this session */
function aliasRow(a){
  if(P.profile.csh)return a.from.join(' ')+'\t'+((a.n!==undefined?a.n:a.to.split(/\s+/).filter(Boolean).length)===1?a.to:'('+a.to+')'); /* 4.3BSD's plist: ( ) only round more than one word */
  var q=a.to.indexOf("'")>=0?'"':"'";return 'alias '+a.from.join(' ')+'='+q+a.to+q;
}
P.command({names:['alias'],core:true,noHelpFlag:true, /* -h inside a quoted command is not a request for help */
  man:function(pr){ /* csh's alias name wordlist; bash's any number of name=value and name */
    if(pr.csh)return {what:'list or set aliases',syn:'alias [ name [ wordlist ] ]',desc:[
      'with no argument, lists every alias. with a name, prints what that alias stands for.',
      '',
      "alias name wordlist assigns the wordlist as the alias of name, for this session; it is forgotten at logout. any extra words are passed through, and !* in the wordlist (typed \\!*) stands for them. commands may be joined with ; inside quotes: alias ll 'ls -l; pwd'."]};
    return {what:'list or set aliases',syn:pr.bash?'alias [name[=value] ...]':"alias [ name[='command'] ]",desc:[
    pr.bash?'with no argument, lists every alias. each name=value sets an alias, and each name alone shows that one alias; -- ends the options.':'with no argument, lists every alias. with a name, shows that one alias.',
    '',
    "alias name='command' sets an alias for this session; it is forgotten at logout. the longest matching alias wins, and any extra words are passed through. commands may be joined with ; inside the quotes."]};
  },
  run:function(a,raw,words){
    var rest=raw.replace(/^\s*\S+\s*/,'').trim(),m; /* the command keeps its case */
    if(!rest){
      if(!P.aliases.length){P.typeLine('no aliases.');return}
      P.say(P.aliases.slice().sort(function(a,b){return a.from.join(' ')<b.from.join(' ')?-1:1}).map(aliasRow));return; /* alphabetical */
    }
    if(P.profile.bash){bashAlias(words.slice(1));return}
    if(rest.indexOf('=')<0&&rest.split(/\s+/).indexOf('-h')>=0){P.typeLine('usage: '+P.man.alias.syn);return}
    var nm,to;
    if(!P.profile.csh&&(m=rest.match(/^([^=]+?)\s*=\s*(.*)$/))){nm=P.fold(m[1]);to=P.unquote(m[2]).trim()} /* csh's alias is always name, then the words: an = in them is theirs */
    else{
      var key=P.fold(rest).split(/\s+/).join(' '),hit=P.aliases.filter(function(x){return x.from.join(' ')===key});
      if(hit.length){P.typeLine(P.profile.csh?hit[0].to:aliasRow(hit[0]));return} /* csh: alias name prints just what it stands for */
      if(rest.indexOf(' ')<0){if(!P.profile.csh)P.typeLine('alias: '+P.fold(rest)+': not found','err');return} /* and nothing for one it doesn't know */
      nm=P.fold(rest.split(/\s+/)[0]);to=P.unquote(rest.replace(/^\S+\s+/,'')); /* csh style: alias name value */
      if(P.profile.csh)to=to.replace(/\\!/g,'!'); /* csh's lexer keeps \! from history substitution, and drops the \: the alias holds !* */
    }
    if(!to){P.typeLine('usage: alias name=\'command\'','err');return}
    var from=nm.split(/\s+/);
    if(from[0]==='alias'){P.typeLine('alias: too dangerous to alias that.','err');return}
    P.aliases=P.setAlias(P.aliases,from,to,P.profile.csh&&words?words.length-2:undefined); /* csh: how many words it is, for the listing */
  }});
function bashAlias(W){ /* bash 5.2's alias builtin: each word is name=value, which sets it, or a name, which prints it; the rest fail one by one */
  if(W[0]==='--')W=W.slice(1);
  W.forEach(function(x){
    var k=x.indexOf('=');
    if(k>0){
      var nm=x.slice(0,k),to=x.slice(k+1).trim();
      if(/[\s\/$`='"\\|&;()<>]/.test(nm)){P.typeLine("bash: alias: `"+nm+"': invalid alias name",'err');return}
      if(nm==='alias'){P.typeLine('alias: too dangerous to alias that.','err');return}
      if(!to){P.typeLine('usage: alias name=\'command\'','err');return}
      P.aliases=P.setAlias(P.aliases,[nm],to);
      return;
    }
    var hit=P.aliases.filter(function(y){return y.from.join(' ')===x})[0];
    if(hit)P.typeLine(aliasRow(hit));else P.typeLine('bash: alias: '+x+': not found','err');
  });
}

P.command({names:['unalias'],noHelpFlag:true,enabled:function(p){return p.bash}, /* bash 5.2's unalias [-a] name ...; csh's is in csh.js */
  run:function(a,raw,words){
    var W=words.slice(1),bad=false;
    function usage(){P.typeLine('unalias: usage: unalias [-a] name [name ...]','err');P.queue(function(){P.status(2)})}
    if(W[0]==='-a'){P.aliases=[];return}
    if(W[0]==='--')W=W.slice(1);
    else if(/^-./.test(W[0]||'')){P.typeLine('bash: unalias: '+W[0].slice(0,2)+': invalid option','err');usage();return}
    if(!W.length){usage();return}
    W.forEach(function(x){
      var n=P.aliases.length;P.aliases=P.aliases.filter(function(y){return y.from.join(' ')!==x});
      if(P.aliases.length===n){P.typeLine('bash: unalias: '+x+': not found','err');bad=true}
    });
    if(bad)P.queue(function(){P.status(1)});
  }});

P.command({names:['echo'],core:true,path:'/bin',noHelpFlag:true, /* echo -h prints -h, as it should */
  man:{what:'echo arguments',syn:'echo [ -n ] [ arg ... ]',desc:[
    'prints its arguments, separated by spaces, and ends the line. -n leaves the line open: what comes next goes on in it.']},
  run:function(a,raw,words){var n=words[1]==='-n';P.typeLine(words.slice(n?2:1).join(' '),null,null,n?{open:true}:null)}});

P.command({names:['clear'],core:true,help:'clear the screen',
  man:{what:'clear the screen',syn:'clear',desc:[
    'wipes the glass. the phosphor takes a moment to forget.']},
  run:function(){P.clear()}});

P.command({names:['exit','logout'],help:'log out',
  man:{what:'log out',syn:'exit [ n ]',desc:[
    'ends the session. the terminal runs its self-test and waits at login: for a new name. any name will do, within reason.',
    '',
    'in a shell script, or in ( ), exit ends only that, and n, if given, is its exit status.']},
  run:function(a){
    if(P.subExit(a))return; /* ( ... exit 3 ): the subshell ends there, with that status */
    if(P.subshell())return; /* a stage of a pipeline is its own process, and only that process exits */
    if(P.inScript()){P.status(parseInt(a[0],10)||0);P.loop('exit');return} /* exit in a script ends the script */
    if(P.bourne.leave(a[0]===undefined?P.lastStatus():parseInt(a[0],10)||0))return; /* 4.3BSD's sh at the terminal: back to csh */
    if(P.unsu())return; /* out of su, back to who you were */
    if(P.stoppedWarn())return; /* There are stopped jobs. */
    P.logout();
  }});

/* the jobs started with &: jobs, fg, bg (with job control: bash and csh), wait and kill (all of them; V7's kill is /bin/kill) */
function jc(name){return function(a,raw,words){P.jobCmd(name,a,raw,words)}}
function ctl(p){return p.bash||p.csh}
P.command({names:['jobs'],noHelpFlag:true,enabled:ctl,run:jc('jobs')});
P.command({names:['fg'],noHelpFlag:true,enabled:ctl,run:jc('fg')});
P.command({names:['bg'],noHelpFlag:true,enabled:ctl,run:jc('bg')});
P.command({names:['wait'],noHelpFlag:true,run:jc('wait')});
P.command({names:['kill'],noHelpFlag:true,run:jc('kill')});

P.command({names:['sound'],core:true,terminal:true,help:'keyclicks on or off',
  man:{what:'keyclicks on or off',syn:'sound [ on | off ]',desc:[
    'turns the keyclicks on or off. with no argument, reports which. the browser stays silent until the first tap or keypress, whatever this says.']},
  run:function(a){
    var m=a[0]||'';
    if(m==='on'){if(!P.sound(true)){P.typeLine('no sound hardware detected.','err');return}P.typeLine('keyclicks on.')}
    else if(m==='off'){P.sound(false);P.typeLine('keyclicks off.')}
    else P.say([
      'keyclicks '+(P.sound()?'on':'off'),
      ['usage: sound on|off','dim']
    ]);
  }});

})(window.Phosphor);
