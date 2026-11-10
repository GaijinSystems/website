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

function v7(p){return !p.bash&&!p.csh&&!p.noUnix&&!p.dos} /* V7's sh and tools */
P.command({names:['man'],core:true,help:'the manual',
  man:function(pr){
    if(v7(pr))return {what:'print sections of this manual',syn:'man [ option ... ] [ chapter ] title ...',desc:[
      'prints the section of this manual named title, in the chapter given; with no chapter, in whichever has it. options and chapter may be changed before each title. with no title at all, lists the commands, as help does.','',
      '-w   print the path names of the manual sections, but do not print the sections themselves.','',
      'the other options choose a typesetter (-t, -k) or a preprocessor (-e); on this terminal they print the section as it is.']};
    return {what:'print the manual',syn:'man name',desc:[
    'prints the manual page for name. with no name, lists the commands, as help does; berkeley\'s man just says how to use it.']};
  },
  run:function(a){
    if(!a[0]){
      if(P.profile.perror){P.typeLine('Usage: man [ section ] name ...');return}
      if(P.has(P.cmds,'help')){P.cmds.help([],'help');return}
      P.say(['usage: man name',['pages: '+Object.keys(P.man).sort().join(', '),'dim',{hang:7}]]); /* help is switched off */
      return;
    }
    var bsd=P.profile.perror,irix=P.profile.csh&&!bsd,sec='',sub='',i;
    if(v7(P.profile)){ /* V7's man, a shell script (32V's man.sh is the same): a chapter 1-8 and options before each title; titles it has no section for are
                          not found, the others printed together at the end, or with -w their path names, as cd /usr/man; echo man1/ls.1 */
      var ch='',w=false,all=[];
      a.forEach(function(x){
        if(/^[1-8]$/.test(x))ch=x;
        else if(x==='-w')w=true;
        else if(/^-/.test(x))w=false; /* -n -t -k -e: how to print it */
        else{var p=P.has(P.man,x)?P.man[x]:null,ps=p?String(p.sec||1):'';if(!p||ch&&ps!==ch)P.typeLine(x+' not found','err');else all.push([x,ps])}
      });
      if(!all.length)return;
      if(w){P.typeLine(all.map(function(t){return 'man'+t[1]+'/'+t[0]+'.'+t[1]}).join(' '));return}
      all.forEach(function(t){P.say(P.manPage(t[0]))});
      return;
    }
    if(!bsd&&!irix){if(P.has(P.man,a[0]))P.say(P.manPage(a[0]));else P.typeLine('No manual entry for '+a[0]+'.');return}
    for(i=0;i<a.length;i++){ /* 4.3BSD man.c, which IRIX's man follows: a digit (and a subsection letter), local, new, old or public is a section */
      var w=a[i],s={local:'l',new:'n',old:'o',public:'p'}[w];
      if(s||/^\d.?$/.test(w)){
        if(i===a.length-1&&bsd){P.typeLine('But what do you want from section '+w+'?','err');P.status(1);return}
        if(i<a.length-1){sec=s||w.charAt(0);sub=s?'':w.charAt(1);continue}
      }
      var p=P.has(P.man,w)?P.man[w]:null,ps=p?String(p.sec||1):'';
      /* section 1 also looks in 1c, 1g, l, n and o; old looks everywhere; another section with a subsection only in that subsection */
      if(p&&sec&&!(sec==='o'||(sec==='1'&&/^[1lno]$/.test(ps))||(sec!=='1'&&!sub&&ps===sec)))p=null;
      if(p)P.say(P.manPage(w));
      else if(sec&&bsd)P.typeLine('No entry for '+w+' in section '+sec+(sec==='1'?'':sub)+' of the manual.');
      else P.typeLine('No manual entry for '+w+'.');
    }
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
    if(P.profile.csh&&words&&words.length===2){ /* csh: one word, quotes and all, is a name to print (sh.func.c's doalias): alias ll='ls -l' asks about "ll=ls -l", and prints nothing */
      var one=P.aliases.filter(function(x){return x.from.join(' ')===P.fold(words[1])})[0];
      if(one)P.typeLine(one.to);
      return;
    }
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
  run:function(a,raw,words){
    var n=words[1]==='-n',t=words.slice(n?2:1).join(' ');
    if(P.bourne.dash()){ /* dash's echo: -n and nothing else, and the backslash escapes always; \c ends it all, newline and all */
      var stop=false;t=t.replace(/\\(0[0-7]{0,3}|[abcfnrtv\\])/g,function(m,x){if(stop)return '';if(x==='c'){stop=true;return '\u0000'}return x.charAt(0)==='0'?String.fromCharCode(parseInt(x,8)&255):{a:'\x07',b:'\b',f:'\f',n:'\n',r:'\r',t:'\t',v:'\v','\\':'\\'}[x]});
      if(stop){t=t.slice(0,t.indexOf('\u0000'));n=true}
      var L=t.split('\n');L.open=n;P.say(L);return;
    }
    P.typeLine(t,null,null,n?{open:true}:null);
  }});

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

/* the manual pages of the shell's own commands (read, shift, break, continue and : are in commands/text.js, let in the engine), each in
   its shell's words: bash's help, V7's sh(1), 4.3BSD's csh(1). Only what the machine has, and on csh machines only csh's */
var SHPAGES={
  bash:{
    jobs:['display status of jobs','jobs [-lnprs] [jobspec ...] or jobs -x command [args]',['lists the active jobs. jobspec restricts output to that job. without options, the status of all active jobs is displayed.','',
      '-l   lists process IDs in addition to the normal information','-n   lists only processes that have changed status since the last notification','-p   lists process IDs only','-r   restricts output to running jobs','-s   restricts output to stopped jobs','',
      'with -x, command is run after every job specification that appears in args has been replaced with the process id of that job\'s process group leader.']],
    fg:['move job to the foreground','fg [job_spec]',['places the job identified by job_spec in the foreground, making it the current job. if job_spec is not present, the shell\'s notion of the current job is used.']],
    bg:['move jobs to the background','bg [job_spec ...]',['places the jobs identified by each job_spec in the background, as if they had been started with &. if job_spec is not present, the shell\'s notion of the current job is used.']],
    wait:['wait for job completion and return exit status','wait [-fn] [-p var] [id ...]',['waits for each process identified by an id, which may be a process id or a job specification, and reports its termination status. if id is not given, waits for all currently active child processes, and the return status is zero.','',
      '-n   waits for a single job from the list of ids, or, if no ids are supplied, for the next job to complete, and returns its exit status','-p var   the process or job identifier of the job for which the exit status is returned is assigned to the variable var','-f   waits for each id to terminate, rather than waiting for it to change status']],
    kill:['send a signal to a job','kill [-s sigspec | -n signum | -sigspec] pid | jobspec ... or kill -l [sigspec]',['sends the processes identified by pid or jobspec the signal named by sigspec or signum. if neither is present, SIGTERM is assumed.','',
      '-s sig   sig is a signal name','-n sig   sig is a signal number','-l   lists the signal names; with arguments, the names of those signal numbers','-L   synonym for -l']],
    unalias:['remove each name from the list of defined aliases','unalias [-a] name [name ...]',['removes each name from the list of defined aliases. -a removes all alias definitions. returns success unless a name is not an existing alias.']],
    read:['read a line from the standard input and split it into fields','read [-ers] [-a array] [-d delim] [-i text] [-n nchars] [-N nchars] [-p prompt] [-t timeout] [-u fd] [name ...]',['reads a single line from the standard input. the line is split into fields as with word splitting, and the first word is assigned to the first name, the second word to the second name, and so on, with any leftover words assigned to the last name. only the characters found in $IFS are recognized as word delimiters. the backslash character escapes delimiter characters and newline. if no names are supplied, the line read is stored in the REPLY variable.','',
      '-p prompt   outputs the string prompt without a trailing newline before reading','-r   does not allow backslashes to escape any characters','-s   does not echo input coming from a terminal','the other options are taken and change nothing here.']],
    shift:['shift positional parameters','shift [n]',['renames the positional parameters $n+1, $n+2 ... to $1, $2 ... if n is not given, it is assumed to be 1. fails if n is greater than $#.']],
    break:['exit for, while, or until loops','break [n]',['exits a for, while or until loop. if n is specified, breaks n enclosing loops.']],
    continue:['resume for, while, or until loops','continue [n]',['resumes the next iteration of the enclosing for, while or until loop. if n is specified, resumes the nth enclosing loop.']],
    ':':['null command','',['no effect; the command does nothing. it always succeeds.']],
    '.':['execute commands from a file in the current shell','. filename [arguments]',['reads and executes commands from filename in the current shell. the entries in $PATH are used to find the directory containing filename; if it is not found there, the current directory is searched. any arguments become the positional parameters while filename is executed. the exit status is that of the last command executed in filename, and fails if filename cannot be read.']],
    let:['evaluate arithmetic expressions','let arg [arg ...]',['evaluates each arg as an arithmetic expression, in 64-bit integers with no check for overflow, though division by 0 is trapped and flagged as an error. shell variables are allowed as operands, and sub-expressions in parentheses are evaluated first. if the last arg evaluates to 0, let returns 1; let returns 0 otherwise.']]},
  sh:{
    wait:['wait for process to terminate','wait [ n ]',['waits for the specified process and reports its termination status. if n is not given then all currently active child processes are waited for. the return code from this command is that of the process waited for.']],
    kill:['terminate a process with extreme prejudice','kill [ -signo ] processid ...',['sends signal 15 (terminate) to the specified processes. if a signal number preceded by - is given as first argument, that signal is sent instead of terminate. kill -9 ... is a sure kill.','',
      'the process number of an asynchronous process started with & is reported by the shell. process numbers can also be found by using ps.']],
    read:['read a line into variables','read name ...',['one line is read from the standard input; successive words of the input are assigned to the variables name in order, with leftover words to the last variable. the return code is 0 unless the end-of-file is encountered.']],
    shift:['shift the positional parameters','shift',['the positional parameters from $2 ... are renamed $1 ...']],
    break:['exit from a loop','break [ n ]',['exit from the enclosing for or while loop, if any. if n is specified then break n levels.']],
    continue:['resume a loop','continue',['resume the next iteration of the enclosing for or while loop.']],
    ':':['no effect','',['no effect; the command does nothing. a zero exit code is returned.']],
    '.':['read and execute commands from a file','. file',['read and execute commands from file and return. the search path $PATH is used to find the directory containing file.']]},
  csh:{
    jobs:['list the active jobs','jobs [ -l ]',['lists the active jobs; given the -l option lists process id\'s in addition to the normal information.']],
    fg:['bring a job into the foreground','fg [ %job ]',['brings the current or specified job into the foreground, continuing it if it was stopped.']],
    bg:['put jobs into the background','bg [ %job ... ]',['puts the current or specified jobs into the background, continuing them if they were stopped.']],
    wait:['wait for the background jobs','wait',['all background jobs are waited for. if the shell is interactive, then an interrupt can disrupt the wait, at which time the shell prints names and job numbers of all jobs known to be outstanding.']],
    kill:['send a signal to jobs or processes','kill [ -sig ] %job | pid ... or kill -l',['sends either the TERM (terminate) signal or the specified signal to the specified jobs or processes. signals are either given by number or by names (as given in /usr/include/signal.h, stripped of the prefix SIG). the signal names are listed by kill -l. there is no default: saying just kill does not send a signal to the current job. if the signal being sent is TERM (terminate) or HUP (hangup), then the job or process will be sent a CONT (continue) signal as well.']],
    unalias:['discard aliases','unalias pattern',['all aliases whose names match the specified pattern are discarded. thus all aliases are removed by unalias *. it is not an error for nothing to be unaliased.']],
    break:['leave a loop','break',['causes execution to resume after the end of the nearest enclosing foreach or while. the remaining commands on the current line are executed.']],
    continue:['go on with a loop','continue',['continues execution of the nearest enclosing while or foreach. the rest of the commands on the current line are executed.']]}};
P.setup(function(){
  var pr=P.profile,L=pr.bash?SHPAGES.bash:pr.csh?SHPAGES.csh:pr.noUnix||pr.dos?null:SHPAGES.sh;
  if(L)Object.keys(L).forEach(function(k){
    if(!(P.has(P.cmds,k)||k==='let'&&pr.bash)||P.has(P.man,k))return; /* bash's let is the engine's own, put in later */
    var x=L[k];P.man[k]={names:k,what:x[0],syn:x[1]||k,desc:x[2].map(P.fill),bugs:[]};
  });
  if(P.has(P.cmds,'[')&&P.has(P.man,'test')&&!P.has(P.man,'['))P.man['[']=P.man.test; /* [ is test, by its other name */
});

/* the Bourne shell's export (V7's, 4.3BSD's and IRIX's sh; bash has its own): every variable here goes to the commands it starts already, so it
   marks the names, and with none lists them as V7's printflg did */
var EXPORTED=Object.create(null);
P.command({names:['export'],noHelpFlag:true,enabled:function(p){return !p.bash&&!p.noUnix&&!p.dos},
  man:{what:'export variables',syn:'export [ name ... ]',desc:[
    'marks each name for automatic export to the environment of the commands the shell runs. with no name, lists the names so marked.']},
  run:function(a,raw,words){
    if(!P.bourne.sh()){P.typeLine(P.profile.notFound.replace('%s',words[0]),'err');return} /* csh has setenv */
    var W=words.slice(1);
    if(!W.length){P.say(Object.keys(EXPORTED).sort().map(function(k){return 'export '+k}));return}
    for(var i=0;i<W.length;i++){
      if(!/^[A-Za-z_]\w*$/.test(W[i])){P.failed(W[i]+': is not an identifier');return} /* V7's lookup: failed(nam, notid), and the rest of the line goes */
      EXPORTED[W[i]]=true;
    }
  }});

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
