/* PHOSPHOR-9 terminal: machine "irix-1993", the commands of IRIX: uname, hinv, versions, System V
   ps and df, env, and fsn, the File System Navigator, redrawn for a text terminal.
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE. */
(function(P){
'use strict';
function cmd(name,what,syn,desc,run,where){
  P.command({names:[name],path:where||'/usr/bin',man:{what:what,syn:syn,desc:[desc]},run:run});
}
var count=0;
P.setup(function(){P.setPrompt(function(){return P.st.hostname+' '+(++count)+'% '})});

cmd('uname','print the name of the system','uname [ -snrvma ]','prints what this machine calls itself. -a prints all of it.',function(a){
  var f=a.join(''),all={s:'IRIX',n:P.st.hostname,r:'4.0.5',v:'06151813',m:'IP17'},o=[];
  ['s','n','r','v','m'].forEach(function(k){if(/a/.test(f)||f.indexOf(k)>=0)o.push(all[k])});
  P.typeLine((o.length?o:['IRIX']).join(' '));
},'/bin');
cmd('hinv','hardware inventory','hinv','lists the hardware in this machine.',function(){
  P.say(['1 100 MHZ IP17 Processor','FPU: MIPS R4010 Floating Point Chip Revision: 0.0','CPU: MIPS R4000 Processor Chip Revision: 2.2',
    'On-board serial ports: 2','On-board EPP/ECP parallel port','Data cache size: 8 Kbytes','Instruction cache size: 8 Kbytes','Secondary unified instruction/data cache size: 1 Mbyte','Main memory size: 256 Mbytes, 4-way interleaved',
    'Integral Ethernet: ec0, version 1','Integral SCSI controller 0: Version WD33C93B, revision D','Disk drive: unit 1 on SCSI controller 0','Graphics board: VGX']);
},'/bin');
cmd('versions','list installed software','versions','lists the software installed on this machine.',function(){
  P.say(['I = Installed, R = Removed','','   Name                 Date      Description','I  eoe1                 11/20/92  Execution Only Environment 1, 4.0.5','I  eoe2                 11/20/92  Execution Only Environment 2, 4.0.5','I  dev                  11/20/92  Development System, 4.0.5','I  demos                11/20/92  Graphics Demonstrations, 4.0.5','I  4Dwm                 11/20/92  4Dwm Window Manager, 4.0.5']);
});
cmd('env','print the environment','env','prints the environment.',function(){
  P.say(['HOME='+P.st.home,'LOGNAME='+P.st.user].concat(Object.keys(P.env).sort().map(function(k){return k+'='+P.env[k]})));
},'/bin');
cmd('ps','process status','ps [ -ef ]','lists your processes. -e lists everyone\'s, and -f shows them in full.',function(a){
  var f=a.join(''),T=[['root',0,0,'sched'],['root',1,0,'/etc/init'],['root',112,1,'/usr/etc/routed'],['root',131,1,'/usr/etc/inetd'],['root',144,1,'/usr/lib/lpsched'],['root',188,1,'/usr/bin/X11/Xsgi -bs'],[P.st.owner,201,188,'4Dwm'],[P.st.owner,233,201,'fsn'],[P.st.user,244,1,'-csh'],[P.st.user,317,244,'ps '+a.join(' ')]];
  var R=/e/.test(f)?T:T.slice(-2);
  if(/f/.test(f))P.say(['     UID   PID  PPID  C    STIME TTY      TIME COMMAND'].concat(R.map(function(r){return r[0].padStart(8)+String(r[1]).padStart(6)+String(r[2]).padStart(6)+'  0 '+P.short(P.st.login).slice(7).padStart(8)+' '+(r[0]===P.st.user?'ttyd2':'?').padEnd(6)+'   0:01 '+r[3]})));
  else P.say(['   PID TTY      TIME COMD'].concat(R.map(function(r){return String(r[1]).padStart(6)+' '+(r[0]===P.st.user?'ttyd2':'?').padEnd(6)+'   0:01 '+r[3].split(' ')[0].replace(/^.*\//,'')})));
},'/bin');
cmd('df','disk free','df [ -k ]','shows how full each disk is.',function(){
  P.say(['Filesystem          Type  blocks     use   avail  %use  Mounted on','/dev/root            efs  1900168 1247112  653056   66%  /','/dev/usr             efs  3808272 3056120  752152   80%  /usr']);
},'/bin');
cmd('gr_osview','graphical system monitor','gr_osview','shows what the machine is doing, in pictures.',function(){
  P.say(['gr_osview: cannot open display: this is a serial line.']);
});
['flight','buttonfly','dog','ideas','arena','newave','insect'].forEach(function(n){
  P.command({names:[n],hidden:true,run:function(){P.typeLine(n+": can't open display. you are at 9600 baud; the graphics are in the other room.")}});
});

/* a brief nod to the film; ctrl-c gets you out */
P.command({names:['access'],noHelpFlag:true,hidden:true,run:function(a){
  P.typeLine('access: PERMISSION DENIED.');
  if(!a.length)return;
  P.pause(500);
  for(var i=0;i<24;i++)P.typeLine("YOU DIDN'T SAY THE MAGIC WORD!");
}});

/* fsn: the file system as a city. Folders and files stand on a floor; the bigger the file, the
   taller the block. Arrows move, return goes in, backspace comes out, q leaves. */
function Fsn(S,done){
  var at=P.st.cwd,sel=0,msg='',first=true,items=[];
  function load(){
    var n=P.find(at,true),L=[];
    if(at!=='/')L.push({name:'..',node:n.parent,up:true});
    Object.keys(n.kids).sort().forEach(function(k){if(k.charAt(0)!=='.')L.push({name:k,node:n.kids[k]})});
    items=L;
    if(sel>=items.length)sel=Math.max(0,items.length-1);
  }
  function hgt(it){
    var n=it.node;
    if(it.up)return 1;
    if(n.type==='d')return Math.min(4,1+Math.floor(Object.keys(n.kids).length/3));
    return Math.max(1,Math.min(5,Math.round(Math.log(1+P.fsize(n))/Math.LN10)));
  }
  function draw(){
    var W=S.cols,R=S.rows,cw=14,ch=9,cols=Math.max(1,Math.floor((W-2)/cw)),rows=Math.max(1,Math.floor((R-4)/ch));
    var page=Math.floor(sel/(cols*rows)),C=[],i,y;
    for(i=0;i<R;i++)C.push(' '.repeat(W).split(''));
    function put(x,y0,s){for(var j=0;j<s.length;j++)if(y0>=0&&y0<R&&x+j>=0&&x+j<W)C[y0][x+j]=s.charAt(j)}
    put(0,0,'File System Navigator');put(Math.max(0,W-at.length-1),0,at);
    put(0,1,'-'.repeat(W-1));
    var curR=2,curC=0,startI=page*cols*rows,endI=Math.min(items.length,startI+cols*rows);
    for(i=startI;i<endI;i++){
      var pos=i-startI,x=1+(pos%cols)*cw,base=2+Math.floor(pos/cols)*ch+ch-3,it=items[i],h=hgt(it),dir=it.node.type==='d',tag=dir?'#':it.node.prot?'x':'=';
      put(x+1,base-h-1,' ____');
      put(x,base-h,'/____/|');
      for(y=base-h+1;y<=base-1;y++)put(x,y,'|'+tag.repeat(4)+'||');
      put(x,base,'|____|/');
      var label=it.name.length>12?it.name.slice(0,11)+'~':it.name;
      put(x,base+1,(i===sel?'>':' ')+label+(i===sel?'<':''));
      if(i===sel){curR=base+1;curC=x}
    }
    put(0,R-2,'-'.repeat(W-1));
    var it2=items[sel],info=it2?(it2.up?'parent folder':it2.node.type==='d'?'folder, '+Object.keys(it2.node.kids).length+' items':P.fsize(it2.node)+' bytes'+(it2.node.prot?', locked':'')):'empty';
    put(0,R-1,(msg||(first?"this is a unix system. you know this.":(it2?it2.name+': '+info:info))+'   arrows, return, backspace, q').slice(0,W-1));
    S.draw(C.map(function(r){return r.join('').replace(/\s+$/,'')}),curR,curC);
    S.say(msg||(it2?it2.name+': '+info:'empty folder'));
  }
  function open(){
    var it=items[sel];
    if(!it)return;
    if(it.up){at=at.slice(0,at.lastIndexOf('/'))||'/';sel=0;load();return}
    if(it.node.prot){msg=it.name+': permission denied';return}
    if(it.node.type==='d'){at=(at==='/'?'':at)+'/'+it.name;sel=0;load();return}
    if(it.node.bin){msg=it.name+': a program. this is not the moment.';return}
    var t=P.text(it.node);
    msg=it.name+': '+(t[0]||'(empty)');
  }
  load();draw();
  return {feed:function(k){
    var cols=Math.max(1,Math.floor((S.cols-2)/14));
    msg='';first=false;
    if(k==='q'||k==='Q'||k==='Escape'||k==='C-c'){S.close();done();return}
    if(k==='ArrowRight'||k==='l')sel=Math.min(items.length-1,sel+1);
    else if(k==='ArrowLeft'||k==='h')sel=Math.max(0,sel-1);
    else if(k==='ArrowDown'||k==='j')sel=Math.min(items.length-1,sel+cols);
    else if(k==='ArrowUp'||k==='k')sel=Math.max(0,sel-cols);
    else if(k==='Enter')open();
    else if(k==='Backspace'){if(at!=='/'){at=at.slice(0,at.lastIndexOf('/'))||'/';sel=0;load()}}
    draw();
  },draw:draw};
}
P.command({names:['fsn'],help:'browse the files in pictures',path:'/usr/sbin',
  man:{what:'file system navigator',syn:'fsn',desc:['shows the file system as a landscape: folders and files stand as blocks, taller for bigger. the arrow keys move, return goes in, backspace comes out, and q leaves.'],bugs:['the real thing flies, in 3d. this is a serial line.']},
  run:function(){
    if(P.piped()){P.typeLine("fsn: can't open display",'err');return}
    P.queue(function(){
      return new Promise(function(res){
        var V,S=P.fullscreen(function(k){V.feed(k)},function(){V.draw()});
        V=Fsn(S,res);
      });
    });
  }});
})(window.Phosphor);
