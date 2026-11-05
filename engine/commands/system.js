/* PHOSPHOR-9 terminal: system commands (dmesg, ps, uptime, hostname, ifconfig, ping, su, rm).
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE.
   What these print comes from the machine (machines/<name>/machine.js): its == dmesg ==
   and == ps == sections and its "offline:" line. */
(function(P){
'use strict';

P.command({names:['dmesg'],path:'/etc',
  man:{what:'print the boot messages',syn:'dmesg',desc:[
    'prints what the system said to itself while it was starting up.']},
  run:function(){
    P.say((P.profile.sec.dmesg||[]).map(function(l){ /* a record too long for the glass wraps indented */
      var x=P.lineOf(l);return [x[0],x[1],Object.assign({hang:4},x[2])];
    }));
  }});

/* == ps == rows: show pid tty time command. show is x (ps x), a (ps a) or - (always) */
var PSN=0;
function table(){
  return (P.profile.raw.ps||[]).map(function(l){return l.trim().split(/\s+/)})
    .filter(function(f){return f.length>=5&&/^[xa-]$/i.test(f[0])})
    .map(function(f){return {show:f[0].toLowerCase(),p:[f[1],f[2],f[3],f.slice(4).join(' ')]}});
}
P.command({names:['ps'],path:'/bin',
  man:{what:'process status',syn:'ps [ ax ]',desc:[
    'lists your processes: process id, terminal, cpu time used, and the command.',
    '',
    'a    also list processes on other terminals.',
    'x    also list processes with no terminal at all.'],bugs:[
    'it shows what other people are doing.']},
  run:function(a){
    var fl=a.join('').replace(/-/g,''),T=table(),R=[];
    if(!PSN)PSN=T.reduce(function(m,r){return Math.max(m,parseInt(r.p[0],10)||0)},0)+5; /* each ps gets the next id */
    T.forEach(function(r){if(r.show==='-'||fl.indexOf(r.show)>=0)R.push(r.p)});
    R.push([String(PSN++),'0','0:00',('ps '+a.join(' ')).trim()]);
    P.say(['  PID TTY  TIME CMD'].concat(R.map(function(p){return p[0].padStart(5)+' '+p[1].padEnd(3)+' '+p[2].padStart(5)+' '+p[3]})));
  }});

P.command({names:['uptime'],path:'/bin',
  man:{what:'show how long the system has been up',syn:'uptime',desc:[
    'prints the time, how long the machine has been running, how many users are logged in, and the load average over the last 1, 5 and 15 minutes.']},
  run:function(){ /* up since the machine was installed (or three days, early in the year) */
    var now=P.now(),SD=P.systemDate,boot=now-SD>864e5?SD:new Date(now-(3*864e5+4*36e5+12*6e4)),
        m=Math.floor((now-boot)/6e4),d=Math.floor(m/1440),hr=now.getHours();
    function la(){return (Math.random()*.06).toFixed(2)}
    P.typeLine((hr%12||12)+':'+P.p2(now.getMinutes())+(hr<12?'am':'pm')+' up '+(d?d+' day'+(d>1?'s':'')+', ':'')+
      Math.floor(m%1440/60)+':'+P.p2(m%60)+', 2 users, load average: '+la()+', '+la()+', '+la());
  }});

P.command({names:['hostname'],path:'/bin',
  man:{what:'print name of current host system',syn:'hostname',desc:[
    'prints the name of this machine. only the super-user may change it.']},
  run:function(a){
    if(a[0]){P.typeLine('hostname: permission denied','err');return} /* only root may rename the machine */
    P.typeLine(P.st.hostname);
  }});

P.command({names:['ifconfig'],path:'/etc',
  man:{what:'configure network interface',syn:'ifconfig [ interface ]',desc:[
    'prints the state of the network interfaces, or of the one named.']},
  run:function(a){
    var L=P.profile.sec.ifconfig||[],at=-1;
    if(!a[0]){P.say(L);return} /* the machine's == ifconfig == section; an interface starts at the margin */
    L.forEach(function(l,i){if(String(l).indexOf(a[0]+':')===0)at=i});
    if(at<0){P.typeLine('ifconfig: '+a[0]+': no such interface','err');return}
    P.say([L[at],L[at+1]||'']);
  }});

/* ping: localhost answers instantly (fake). The page's own server answers for real: each "packet"
   is a HEAD request for this page, so the times are genuine round trips. Nothing else is reachable.
   Switch it off with "commands: -ping" in site/config.js if you would rather it made no requests. */
P.command({names:['ping'],path:'/etc',
  man:{what:'send echo requests to a host',syn:'ping [ -c count ] host',desc:[
    'sends count echo requests (default 4, at most 10), one a second, and reports how long each answer took.',
    '',
    'localhost answers at once. one other host answers as well: the server this terminal came from. those times are real round trips across your own network.'],bugs:[
    'every other host is unknown. it is {year}.']},
  run:function(a){
    a=a.map(function(x){return x.toLowerCase()}); /* host names never cared about case */
    var c=4,h=null,i,SITE=P.st.site,HOST=P.st.hostname;
    for(i=0;i<a.length;i++){if(a[i]==='-c'&&a[i+1])c=parseInt(a[++i],10)||4;else if(a[i].charAt(0)!=='-')h=a[i]}
    c=Math.max(1,Math.min(10,c));
    if(!h){P.typeLine('usage: '+P.man.ping.syn);return}
    var loop=['localhost','127.0.0.1',HOST].indexOf(h)>=0,
        real=!!SITE&&(h===SITE||h==='www.'+SITE||'www.'+h===SITE);
    if(!loop&&!real){P.typeLine('ping: unknown host '+h,'err');P.typeLine(P.profile.offline,'dim');return}
    var R=[],name=loop?'localhost':h,dp=loop?3:1;
    function ok(){return R.filter(function(x){return x!=null})}
    P.typeLine('PING '+name+(loop?' (127.0.0.1)':'')+': 56 data bytes');
    for(i=0;i<c;i++)(function(seq){
      if(seq)P.pause(1000);
      P.queue(function(){
        if(loop){R[seq]=.04+Math.random()*.05;return}
        var t=performance.now(),ac=new AbortController(),timer=setTimeout(function(){ac.abort()},2000);
        return fetch(location.origin+location.pathname+'?ping='+Date.now()+'-'+seq,{method:'HEAD',cache:'no-store',signal:ac.signal})
          .then(function(){R[seq]=performance.now()-t},function(){R[seq]=null})
          .then(function(){clearTimeout(timer)});
      });
      P.typeLine(function(){
        return R[seq]==null?'request timeout for icmp_seq '+seq
          :'64 bytes from '+name+': icmp_seq='+seq+' ttl='+(loop?255:57)+' time='+R[seq].toFixed(dp)+' ms';
      },'',null,{hang:4});
    })(i);
    P.typeLine('');
    P.typeLine('--- '+name+' ping statistics ---');
    P.typeLine(function(){var n=ok().length;
      return c+' packets transmitted, '+n+' packets received, '+Math.round(100*(c-n)/c)+'% packet loss'},'',null,{hang:4});
    P.typeLine(function(){var o=ok();if(!o.length)return 'no answer.';
      return 'round-trip min/avg/max = '+Math.min.apply(null,o).toFixed(dp)+'/'+
        (o.reduce(function(s,x){return s+x},0)/o.length).toFixed(dp)+'/'+Math.max.apply(null,o).toFixed(dp)+' ms'},'',null,{hang:4});
  }});

/* connect: the terminal stays, the machine changes. A fresh page load is a true cold start. */
P.command({names:['connect'],help:'plug into another machine',
  enabled:function(){return P.allowed.length>1},
  man:{what:'connect this terminal to another machine',syn:'connect [ name ]',desc:[
    'with no name, lists the machines on the line and marks the one you are on. with a name, plugs the terminal into that machine, which boots from cold.']},
  run:function(a){
    a=a.map(function(x){return x.toLowerCase()});
    if(!a[0]){
      P.say(['machines on the line:'].concat(P.allowed.map(function(id){
        return [(id===P.machine?'* ':'  ')+id.padEnd(8)+' '+(P.catalog[id].name||'')+(P.catalog[id].year?' ('+P.catalog[id].year+')':''),'',{hang:11}];
      })));
      return;
    }
    if(P.allowed.indexOf(a[0])<0){P.typeLine('connect: '+a[0]+': no such machine','err');return}
    if(a[0]===P.machine){P.typeLine('connect: already on '+a[0]);return}
    P.typeLine('connecting to '+a[0]+'...');
    P.pause(600);
    P.queue(function(){
      var q=new URLSearchParams(location.search);q.set('machine',a[0]);location.search=q.toString();
    });
  }});

P.command({names:['su'],path:'/bin',
  man:{what:'become super-user',syn:'su',desc:[
    'asks for the root password, then makes you the super-user.'],bugs:[
    'you do not know the root password.']},
  run:function(){P.typeLine('Password:');P.pause(900);P.typeLine('Sorry','err')}});

P.command({names:['rm'],path:'/bin',
  man:{what:'remove files',syn:'rm [ -fri ] file ...',desc:[
    'removes each file named. -r also removes folders and everything in them. you can only remove what is in your own home folder or in /tmp, and only until the terminal is switched off: a reload puts it all back.']},
  run:function(a){
    var f=a.filter(function(x){return x.charAt(0)!=='-'}),rec=a.some(function(x){return /^-.*r/.test(x)}),denied=false;
    if(!f.length){P.typeLine('usage: rm [-fri] file ...');return}
    f.forEach(function(x){
      var n=P.find(x,true),at=n&&P.pathOf(n),cwd=P.st.cwd;
      if(!n){P.typeLine('rm: '+x+' nonexistent','err');return}
      if(n.type==='d'&&!rec){P.typeLine('rm: '+x+' directory','err');return}
      if(n===P.root||n.prot||!P.canWrite(at)||cwd===at||cwd.indexOf(at+'/')===0){
        denied=denied||!P.canWrite(at);
        P.typeLine('rm: '+x+' not removed','err');
        return;
      }
      delete n.parent.kids[n.name];
    });
    if(denied)P.typeLine('nice try.','dim');
  }});

})(window.Phosphor);
