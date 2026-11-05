/* PHOSPHOR-9 terminal: shell commands (help, man, alias, echo, clear, exit, sound).
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE. */
(function(P){
'use strict';

P.command({names:['help'],core:true,
  man:{what:'list the commands',syn:'help',desc:[
    'lists the commands, alphabetically, with a few words about each. man name says more about any of them.']},
  run:function(){
    var H=P.help(),man=P.has(P.cmds,'man');
    H.sort(function(a,b){return a[0].toLowerCase()<b[0].toLowerCase()?-1:1}); /* alphabetical */
    P.say(['commands:'].concat(H.map(function(h){return ['  '+h[0].padEnd(13)+' '+h[1],'',{hang:16}]}), /* wraps under its description */
      ['',[man?'man name for details, or name -h.':'name -h for usage.','dim']]));
  }});

P.command({names:['man'],core:true,help:'the manual',
  man:{what:'print the manual',syn:'man name',desc:[
    'prints the manual page for name. with no name, the same as help.']},
  run:function(a){
    if(!a[0]){
      if(P.has(P.cmds,'help')){P.cmds.help([],'help');return}
      P.say(['usage: man name',['pages: '+Object.keys(P.man).sort().join(', '),'dim',{hang:7}]]); /* help is switched off */
      return;
    }
    if(P.has(P.man,a[0]))P.say(P.manPage(a[0]));
    else P.typeLine('No manual entry for '+a[0]+'.');
  }});

/* aliases (csh, 1979): from the == aliases == section, plus any set this session */
function aliasRow(a){var q=a.to.indexOf("'")>=0?'"':"'";return 'alias '+a.from.join(' ')+'='+q+a.to+q}
P.command({names:['alias'],core:true,noHelpFlag:true, /* -h inside a quoted command is not a request for help */
  man:{what:'list or set aliases',syn:"alias [ name[='command'] ]",desc:[
    'with no argument, lists every alias. with a name, shows that one alias.',
    '',
    "alias name='command' sets an alias for this session; it is forgotten at logout. the longest matching alias wins, and any extra words are passed through. commands may be joined with ; inside the quotes."]},
  run:function(a,raw){
    var rest=raw.replace(/^\s*\S+\s*/,'').trim(),m; /* the command keeps its case */
    if(!rest){
      if(!P.aliases.length){P.typeLine('no aliases.');return}
      P.say(P.aliases.slice().sort(function(a,b){return a.from.join(' ')<b.from.join(' ')?-1:1}).map(aliasRow));return; /* alphabetical */
    }
    if(rest.indexOf('=')<0&&rest.split(/\s+/).indexOf('-h')>=0){P.typeLine('usage: '+P.man.alias.syn);return}
    var nm,to;
    if((m=rest.match(/^([^=]+?)\s*=\s*(.*)$/))){nm=P.fold(m[1]);to=P.unquote(m[2]).trim()}
    else{
      var hit=P.aliases.filter(function(x){return x.from.join(' ')===P.fold(rest).split(/\s+/).join(' ')});
      if(hit.length){P.typeLine(aliasRow(hit[0]));return}
      if(rest.indexOf(' ')<0){P.typeLine('alias: '+P.fold(rest)+': not found','err');return}
      nm=P.fold(rest.split(/\s+/)[0]);to=P.unquote(rest.replace(/^\S+\s+/,'')); /* csh style: alias name value */
    }
    if(!to){P.typeLine('usage: alias name=\'command\'','err');return}
    var from=nm.split(/\s+/);
    if(from[0]==='alias'){P.typeLine('alias: too dangerous to alias that.','err');return}
    P.aliases=P.setAlias(P.aliases,from,to);
  }});

P.command({names:['echo'],core:true,path:'/bin',noHelpFlag:true, /* echo -h prints -h, as it should */
  man:{what:'echo arguments',syn:'echo [ arg ... ]',desc:[
    'prints its arguments, separated by spaces.']},
  run:function(a,raw,words){P.typeLine(words.slice(1).join(' '))}});

P.command({names:['clear'],core:true,help:'clear the screen',
  man:{what:'clear the screen',syn:'clear',desc:[
    'wipes the glass. the phosphor takes a moment to forget.']},
  run:function(){P.clear()}});

P.command({names:['exit','logout'],help:'log out',
  man:{what:'log out',syn:'exit',desc:[
    'ends the session. the terminal runs its self-test and waits at login: for a new name. any name will do, within reason. aliases set this session are lost.']},
  run:function(){P.logout()}});

P.command({names:['sound'],core:true,help:'keyclicks on or off',
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
