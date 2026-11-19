/* gaijin.systems: connect. Only Version 7 Unix runs here; the other machines run on the demo of PHOSPHOR-9, the template behind this
   site, at phosphor.gaijin.systems. connect lists them all, and a name opens the demo on that machine, in this tab. */
(function(P){
var DEMO='phosphor.gaijin.systems';
P.command({names:['connect'],terminal:true,help:'plug into another machine',
  man:{what:'connect this terminal to another machine',syn:'connect [ name ]',desc:[
    'with no name, lists the machines on the line and marks the one you are on. with a name, plugs the terminal into that machine, which boots from cold.',
    'only version 7 unix runs here. the others run on the demo of phosphor-9, at '+DEMO+': connecting to one of them opens the demo on it, in this tab.']},
  run:function(a){
    var ids=Object.keys(P.catalog).sort(function(x,y){return (P.catalog[x].year||0)-(P.catalog[y].year||0)}),here=P.allowed;
    a=a.map(function(x){return x.toLowerCase()});
    if(!a[0]){
      P.say(['machines on the line:'].concat(ids.map(function(id){
        var m=P.catalog[id];
        return [(id===P.machine?'* ':'  ')+id.padEnd(8)+' '+(m.name||'')+(m.year?' ('+m.year+(here.indexOf(id)<0?'; demo site':'')+')':''),'',{hang:11}];
      }),[['','',{}],['demo site: '+DEMO,'dim',{href:'https://'+DEMO+'/'}]]));
      return;
    }
    if(ids.indexOf(a[0])<0){P.typeLine('connect: '+a[0]+': no such machine','err');return}
    if(a[0]===P.machine){P.typeLine('connect: already on '+a[0]);return}
    var away=here.indexOf(a[0])<0;
    P.typeLine('connecting to '+a[0]+(away?' on '+DEMO:'')+'...');
    P.pause(600);
    P.queue(function(){
      if(away){location.href='https://'+DEMO+'/?machine='+encodeURIComponent(a[0]);return}
      var q=new URLSearchParams(location.search);q.set('machine',a[0]);location.search=q.toString();
    });
  }});
})(window.Phosphor);
