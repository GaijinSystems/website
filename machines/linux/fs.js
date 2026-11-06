/* PHOSPHOR-9 terminal: machine "linux", its file system: the merged /usr, a small /etc, /proc, /var/log,
   and what the administrator added to /usr/games.
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE.

   The default cow below is cowsay's default.cow, copyright (c) 1999 Tony Monroe, distributed under the same
   terms as Perl: the Artistic License or the GNU General Public License, version 1 or later. The fortunes are
   quotations from works published before 1912, chosen for this terminal. */
Phosphor.setup(function(P){
  'use strict';
  var D=P.debian,ST=P.st,OWNER=ST.owner,sys=P.sys,root=P.root;
  var FORTUNES=[
  'Well done is better than well said.\n\t\t-- Benjamin Franklin, "Poor Richard\'s Almanack", 1737',
  'Lost time is never found again.\n\t\t-- Benjamin Franklin, "Poor Richard\'s Almanack", 1748',
  'It is a capital mistake to theorize before one has data.\n\t\t-- Arthur Conan Doyle, "A Scandal in Bohemia"',
  'Get your facts first, and then you can distort them as much as you please.\n\t\t-- Mark Twain, to Rudyard Kipling',
  'Always do right. This will gratify some people, and astonish the rest.\n\t\t-- Mark Twain',
  'I can resist everything except temptation.\n\t\t-- Oscar Wilde, "Lady Windermere\'s Fan"',
  'Our life is frittered away by detail.... Simplify, simplify.\n\t\t-- Henry David Thoreau, "Walden"',
  'A foolish consistency is the hobgoblin of little minds.\n\t\t-- Ralph Waldo Emerson, "Self-Reliance"',
  'Brevity is the soul of wit.\n\t\t-- William Shakespeare, "Hamlet"',
  'The fault, dear Brutus, is not in our stars,\nBut in ourselves, that we are underlings.\n\t\t-- William Shakespeare, "Julius Caesar"',
  '"Begin at the beginning," the King said, very gravely, "and go on\ntill you come to the end: then stop."\n\t\t-- Lewis Carroll, "Alice\'s Adventures in Wonderland"',
  'Why, sometimes I\'ve believed as many as six impossible things before\nbreakfast.\n\t\t-- Lewis Carroll, "Through the Looking-Glass"',
  'The Analytical Engine has no pretensions whatever to originate anything.\nIt can do whatever we know how to order it to perform.\n\t\t-- Ada Lovelace, notes on Menabrea\'s memoir, 1843',
  'On two occasions I have been asked, "Pray, Mr. Babbage, if you put into\nthe machine wrong figures, will the right answers come out?" I am not\nable rightly to apprehend the kind of confusion of ideas that could\nprovoke such a question.\n\t\t-- Charles Babbage, "Passages from the Life of a Philosopher"',
  'I like work: it fascinates me. I can sit and look at it for hours.\n\t\t-- Jerome K. Jerome, "Three Men in a Boat"',
  'Patience, n. A minor form of despair, disguised as a virtue.\n\t\t-- Ambrose Bierce, "The Devil\'s Dictionary"',
  'Future, n. That period of time in which our affairs prosper, our\nfriends are true and our happiness is assured.\n\t\t-- Ambrose Bierce, "The Cynic\'s Word Book"',
  'The report of my death was an exaggeration.\n\t\t-- Mark Twain, 1897',
  'Early to bed and early to rise, makes a man healthy, wealthy, and wise.\n\t\t-- Benjamin Franklin',
  'If you have built castles in the air, your work need not be lost; that\nis where they should be. Now put the foundations under them.\n\t\t-- Henry David Thoreau, "Walden"',
  'It was the best of times, it was the worst of times.\n\t\t-- Charles Dickens, "A Tale of Two Cities"'
  ];
  var COW=['$the_cow = <<"EOC";','        $thoughts   ^__^','         $thoughts  ($eyes)\\\\_______','            (__)\\\\       )\\\\/\\\\','             $tongue ||----w |','                ||     ||','EOC'];
  var UPG=new Date(2026,9,14,6,25,11); /* the last unattended upgrade: a new kernel */
  P.env.PATH='/usr/local/bin:/usr/bin:/bin:/usr/local/games:/usr/games';
  P.env.TERM='vt220';P.env.SHELL='/bin/bash';P.env.LANG='C.UTF-8';P.env.MAIL='/var/mail/'+ST.user;
  P.env.INFOCOM_PATH='/usr/local/share/games/zork';
  Object.defineProperty(P.env,'PWD',{get:function(){return ST.cwd},set:function(){},enumerable:true,configurable:true});
  P.profile.loginPrompt=ST.hostname+' login: ';

  ['/usr/bin','/usr/sbin','/usr/lib','/usr/lib64','/usr/local/bin','/usr/local/games','/usr/share','/usr/games','/etc','/boot','/dev','/home','/media','/mnt','/opt','/proc','/run','/srv','/sys','/var']
    .forEach(function(d){sys(d,'d')});
  sys('/root','d',{prot:true});
  sys('/tmp','d',{mode:'drwxrwxrwt',date:P.now()});
  sys('/var/tmp','d',{mode:'drwxrwxrwt'});
  /* bin, sbin, lib and lib64 are links into /usr, and so are a few files */
  ['bin','sbin','lib','lib64'].forEach(function(d){root.kids[d]=P.find('/usr/'+d,true)});
  Object.keys(P.paths).forEach(function(b){if(!/^\/usr\/(local\/)?(s?bin|games)$/.test(P.paths[b]))P.paths[b]='/usr/bin'});
  P.programs(function(dir,h){return {bin:true,size:14336+h*23}});
  sys('/usr/bin/bash','f',{bin:true,size:1265648});
  sys('/usr/bin/sudo','f',{bin:true,size:277936,mode:'-rwsr-xr-x'});
  sys('/usr/bin/su','f',{bin:true,size:84360,mode:'-rwsr-xr-x'});
  sys('/usr/bin/ls','f',{bin:true,size:151344});
  /* the games the administrator installed, at Debian 13's sizes */
  var GAMES={'/usr/games/frotz':139152,'/usr/games/sl':26568,'/usr/games/cowsay':4608,'/usr/games/fortune':35664,'/usr/bin/cmatrix':22608};
  Object.keys(GAMES).forEach(function(f){if(P.find(f,true))sys(f,'f',{bin:true,size:GAMES[f],date:new Date(2025,10,2,19,4)})});
  if(P.find('/usr/games/cowsay',true))P.find('/usr/games',true).kids.cowthink=P.find('/usr/games/cowsay',true);

  var V=['/boot/vmlinuz-'+D.krel,'/boot/initrd.img-'+D.krel];
  sys(V[0],'f',{bin:true,size:11829952,date:UPG,mode:'-rw-r--r--'});
  sys(V[1],'f',{bin:true,size:33415023,date:UPG,mode:'-rw-r--r--'});
  sys('/boot/config-'+D.krel,'f',{size:282231,date:UPG,mode:'-rw-r--r--',body:['#','# Automatically generated file; DO NOT EDIT.','# Linux/x86 6.12.111 Kernel Configuration','#','CONFIG_CC_VERSION_TEXT="x86_64-linux-gnu-gcc-14 (Debian 14.2.0-19) 14.2.0"','CONFIG_CC_IS_GCC=y','CONFIG_64BIT=y','CONFIG_X86_64=y','CONFIG_HZ_250=y','CONFIG_PREEMPT_DYNAMIC=y','CONFIG_KVM_GUEST=y','CONFIG_VIRTIO_BLK=m','CONFIG_VIRTIO_NET=m','CONFIG_EXT4_FS=m']});
  sys('/boot/System.map-'+D.krel,'f',{size:83,date:UPG,mode:'-rw-r--r--',body:['ffffffffffffffff B The real System.map is in the linux-image-<version>-dbg package']});
  sys('/boot/grub','d');sys('/boot/efi','d',{mode:'drwx------',prot:true});
  root.kids.vmlinuz=P.find(V[0],true);root.kids['initrd.img']=P.find(V[1],true);

  var OS=['PRETTY_NAME="Debian GNU/Linux 13 (trixie)"','NAME="Debian GNU/Linux"','VERSION_ID="13"','VERSION="13 (trixie)"','VERSION_CODENAME=trixie','DEBIAN_VERSION_FULL='+D.debian,'ID=debian',
    'HOME_URL="https://www.debian.org/"','SUPPORT_URL="https://www.debian.org/support"','BUG_REPORT_URL="https://bugs.debian.org/"'];
  sys('/usr/lib/os-release','f',{body:OS,date:UPG});
  P.find('/etc',true).kids['os-release']=P.find('/usr/lib/os-release',true);
  sys('/etc/debian_version','f',{body:[D.debian],date:UPG});
  sys('/etc/hostname','f',{body:function(){return [ST.hostname]}});
  sys('/etc/hosts','f',{body:function(){return ['127.0.0.1\tlocalhost','127.0.1.1\t'+ST.hostname,'','# The following lines are desirable for IPv6 capable hosts','::1     localhost ip6-localhost ip6-loopback','ff02::1 ip6-allnodes','ff02::2 ip6-allrouters']}});
  sys('/etc/issue','f',{body:['Debian GNU/Linux 13 \\n \\l','']});
  sys('/etc/issue.net','f',{body:['Debian GNU/Linux 13']});
  sys('/etc/shells','f',{body:['# /etc/shells: valid login shells','/bin/sh','/usr/bin/sh','/bin/bash','/usr/bin/bash','/bin/rbash','/usr/bin/rbash','/usr/bin/dash']});
  sys('/etc/timezone','f',{body:['Etc/UTC']});
  sys('/etc/machine-id','f',{body:['3f9c2e4b7a1d48e6b5c0d9a2e7f1c843'],mode:'-r--r--r--'});
  sys('/etc/resolv.conf','f',{body:['# written by the DHCP client; edits here do not last','nameserver 192.0.2.53','nameserver 192.0.2.54']});
  sys('/etc/fstab','f',{body:['# <file system>                           <mount point>  <type>  <options>          <dump> <pass>','UUID=7d3c51e2-0b4f-4a8e-9c61-2f5e8a90d1b7 /              ext4    errors=remount-ro  0      1','UUID=4E1A-93C2                            /boot/efi      vfat    umask=0077         0      1']});
  sys('/etc/apt/sources.list.d/debian.sources','f',{body:['Types: deb','URIs: http://deb.debian.org/debian','Suites: trixie trixie-updates','Components: main non-free-firmware','Signed-By: /usr/share/keyrings/debian-archive-keyring.pgp','',
    'Types: deb','URIs: http://security.debian.org/debian-security','Suites: trixie-security','Components: main non-free-firmware','Signed-By: /usr/share/keyrings/debian-archive-keyring.pgp']});
  sys('/etc/ssh/sshd_config','f',{body:['# only keys get in; the console is for whoever is plugged into it','Include /etc/ssh/sshd_config.d/*.conf','PermitRootLogin no','PasswordAuthentication no','KbdInteractiveAuthentication no','UsePAM yes','X11Forwarding no','Subsystem\tsftp\t/usr/lib/openssh/sftp-server']});
  sys('/etc/profile.d/infocom.sh','f',{body:['# where frotz looks for its story files, set by the administrator','export INFOCOM_PATH=/usr/local/share/games/zork'],date:new Date(2025,10,2,19,7)});
  sys('/etc/shadow','f',{prot:true,mode:'-rw-r-----',group:'shadow',size:1021});
  sys('/etc/sudoers','f',{prot:true,mode:'-r--r-----',size:1714});
  sys('/etc/sudoers.d','d',{prot:true,mode:'drwxr-x---'});
  sys('/etc/motd','f',{body:function(){return MOTD.slice(1).concat([''],P.profile.welcome.slice(WEL))}});
  sys('/etc/passwd','f',{body:function(){
    return ['root:x:0:0:root:/root:/bin/bash','daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin','bin:x:2:2:bin:/bin:/usr/sbin/nologin','sys:x:3:3:sys:/dev:/usr/sbin/nologin','sync:x:4:65534:sync:/bin:/bin/sync',
      'games:x:5:60:games:/usr/games:/usr/sbin/nologin','man:x:6:12:man:/var/cache/man:/usr/sbin/nologin','lp:x:7:7:lp:/var/spool/lpd:/usr/sbin/nologin','mail:x:8:8:mail:/var/mail:/usr/sbin/nologin',
      'news:x:9:9:news:/var/spool/news:/usr/sbin/nologin','uucp:x:10:10:uucp:/var/spool/uucp:/usr/sbin/nologin','proxy:x:13:13:proxy:/bin:/usr/sbin/nologin','www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin','backup:x:34:34:backup:/var/backups:/usr/sbin/nologin','list:x:38:38:Mailing List Manager:/var/list:/usr/sbin/nologin','irc:x:39:39:ircd:/run/ircd:/usr/sbin/nologin','_apt:x:42:65534::/nonexistent:/usr/sbin/nologin',
      'nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin','systemd-network:x:998:998:systemd Network Management:/:/usr/sbin/nologin','systemd-timesync:x:997:997:systemd Time Synchronization:/:/usr/sbin/nologin',
      'messagebus:x:100:101::/nonexistent:/usr/sbin/nologin','sshd:x:101:65534::/run/sshd:/usr/sbin/nologin',
      OWNER+':x:1000:1000:'+P.profile.name.toLowerCase()+',,,:/home/'+OWNER+':/bin/bash',ST.user+':x:1001:1001:guest,,,:/home/'+ST.user+':/bin/bash'];
  }});
  sys('/etc/group','f',{body:function(){
    return ['root:x:0:','daemon:x:1:','bin:x:2:','sys:x:3:','adm:x:4:'+OWNER,'tty:x:5:','disk:x:6:','mail:x:8:','sudo:x:27:'+OWNER,'audio:x:29:','www-data:x:33:','shadow:x:42:','utmp:x:43:','games:x:60:','users:x:100:'+ST.user,
      'systemd-journal:x:999:'+OWNER,'systemd-network:x:998:','systemd-timesync:x:997:','messagebus:x:101:','nogroup:x:65534:',OWNER+':x:1000:',ST.user+':x:1001:'];
  }});

  /* /proc: worked out when read */
  function since(){return (P.now()-ST.login)/1000+52}
  var M=D.mem;
  sys('/proc/version','f',{body:['Linux version '+D.krel+' (debian-kernel@lists.debian.org) (x86_64-linux-gnu-gcc-14 (Debian 14.2.0-19) 14.2.0, GNU ld (GNU Binutils for Debian) 2.44) '+D.kbuild]});
  sys('/proc/uptime','f',{body:function(){var s=since();return [s.toFixed(2)+' '+(s*1.96).toFixed(2)]}});
  sys('/proc/loadavg','f',{body:function(){var m=since()/60;return [[.02+.55*Math.exp(-m/1.5),.03+.3*Math.exp(-m/6),.01+.12*Math.exp(-m/16)].map(function(x){return x.toFixed(2)}).join(' ')+' 1/97 '+(700+Math.floor(m))]}});
  sys('/proc/cmdline','f',{body:['BOOT_IMAGE=/boot/vmlinuz-'+D.krel+' root=UUID=7d3c51e2-0b4f-4a8e-9c61-2f5e8a90d1b7 ro console=tty0 console=ttyS0,115200n8']});
  sys('/proc/meminfo','f',{body:function(){
    var R=[['MemTotal',M.MemTotal],['MemFree',M.MemFree],['MemAvailable',M.MemAvailable],['Buffers',M.Buffers],['Cached',M.Cached],['SwapCached',0],['Active',301452],['Inactive',198320],
      ['SwapTotal',0],['SwapFree',0],['Dirty',48],['Writeback',0],['AnonPages',118904],['Mapped',87212],['Shmem',M.Shmem],['Slab',61840],['SReclaimable',M.SReclaimable],['SUnreclaim',36612],
      ['KernelStack',2864],['PageTables',3412],['CommitLimit',1007488],['Committed_AS',412776],['VmallocTotal',34359738367],['HugePages_Total',0],['Hugepagesize',2048],['DirectMap4k',96124],['DirectMap2M',2000896]];
    return R.map(function(r){return (r[0]+':').padEnd(16)+String(r[1]).padStart(8)+(/^Huge.*Total/.test(r[0])?'':' kB')});
  }});
  sys('/proc/cpuinfo','f',{body:function(){
    var L=[];
    for(var i=0;i<D.ncpu;i++)L=L.concat(['processor\t: '+i,'vendor_id\t: AuthenticAMD','cpu family\t: 23','model\t\t: 49','model name\t: '+D.cpu,'stepping\t: 0','microcode\t: 0x1000065','cpu MHz\t\t: 2794.748',
      'cache size\t: 512 KB','physical id\t: 0','siblings\t: '+D.ncpu,'core id\t\t: '+i,'cpu cores\t: '+D.ncpu,'apicid\t\t: '+i,'fpu\t\t: yes','cpuid level\t: 16','wp\t\t: yes',
      'flags\t\t: fpu vme de pse tsc msr pae mce cx8 apic sep mtrr pge mca cmov pat pse36 clflush mmx fxsr sse sse2 syscall nx mmxext fxsr_opt pdpe1gb rdtscp lm rep_good nopl cpuid extd_apicid tsc_known_freq pni pclmulqdq ssse3 fma cx16 sse4_1 sse4_2 x2apic movbe popcnt aes xsave avx f16c rdrand hypervisor lahf_lm cmp_legacy svm cr8_legacy abm sse4a misalignsse 3dnowprefetch osvw topoext perfctr_core ibpb stibp vmmcall fsgsbase bmi1 avx2 smep bmi2 rdseed adx smap clflushopt clwb sha_ni xsaveopt xsavec xgetbv1 clzero xsaveerptr wbnoinvd arat npt nrip_save umip rdpid',
      'bugs\t\t: sysret_ss_attrs null_seg spectre_v1 spectre_v2 spec_store_bypass retbleed smt_rsb srso ibpb_no_ret','bogomips\t: 5589.49','TLB size\t: 1024 4K pages','clflush size\t: 64','cache_alignment\t: 64','address sizes\t: 40 bits physical, 48 bits virtual','power management:','']);
    return L;
  }});
  sys('/sys/kernel','d');sys('/sys/class','d');sys('/run/user','d');sys('/run/sshd','d');

  sys('/dev/null','c',{mode:'crw-rw-rw-',dev:[1,3]});
  sys('/dev/zero','c',{mode:'crw-rw-rw-',dev:[1,5]});
  sys('/dev/random','c',{mode:'crw-rw-rw-',dev:[1,8]});
  sys('/dev/urandom','c',{mode:'crw-rw-rw-',dev:[1,9]});
  sys('/dev/tty','c',{mode:'crw-rw-rw-',dev:[5,0],group:'tty'});
  sys('/dev/console','c',{mode:'crw--w----',dev:[5,1],group:'tty'});
  sys('/dev/ttyS0','c',{mode:'crw--w----',dev:[4,64],owner:ST.user,group:'tty'});
  sys('/dev/vda','c',{mode:'brw-rw----',dev:[254,0],group:'disk',prot:true});
  sys('/dev/vda1','c',{mode:'brw-rw----',dev:[254,1],group:'disk',prot:true});
  sys('/dev/shm','d',{mode:'drwxrwxrwt'});

  /* /var */
  ['/var/cache','/var/lib','/var/local','/var/opt','/var/spool','/var/backups','/var/www','/var/lib/apt','/var/lib/dpkg'].forEach(function(d){sys(d,'d')});
  sys('/var/mail','d',{mode:'drwxrwsr-x',group:'mail'});
  sys('/var/log','d',{mode:'drwxr-xr-x'});
  sys('/var/log/journal','d',{mode:'drwxr-sr-x',group:'systemd-journal'});
  sys('/var/log/journal/3f9c2e4b7a1d48e6b5c0d9a2e7f1c843','d',{mode:'drwxr-sr-x',group:'systemd-journal',prot:true});
  sys('/var/log/private','d',{mode:'drwx------',prot:true});
  sys('/var/log/btmp','f',{mode:'-rw-rw----',group:'utmp',prot:true,size:0});
  sys('/var/log/wtmp','f',{mode:'-rw-rw-r--',group:'utmp',bin:true,size:12288,date:P.now()});
  sys('/var/log/apt','d');
  sys('/var/log/apt/term.log','f',{mode:'-rw-r-----',group:'adm',prot:true,size:48211,date:UPG});
  sys('/var/log/apt/history.log','f',{date:UPG,body:['','Start-Date: 2025-11-02  19:03:40','Commandline: apt install frotz sl cowsay fortune-mod cmatrix','Requested-By: '+OWNER+' (1000)',
    'Install: frotz:amd64 (2.55+dfsg-2), sl:amd64 (5.02-1+b1), cowsay:amd64 (3.03+dfsg2-8), fortune-mod:amd64 (1:1.99.1-9), fortunes-min:amd64 (1:1.99.1-9, automatic), cmatrix:amd64 (2.0-6), librecode3:amd64 (3.7.15-1, automatic)',
    'End-Date: 2025-11-02  19:04:02','','Start-Date: 2026-10-14  06:24:31','Commandline: /usr/bin/unattended-upgrade','Install: linux-image-'+D.krel+':amd64 (6.12.111-1, automatic)','Upgrade: linux-image-amd64:amd64 (6.12.107-1, 6.12.111-1)',
    'End-Date: 2026-10-14  06:25:11']});
  sys('/var/log/dpkg.log','f',{date:UPG,body:['2026-10-14 06:24:33 startup archives unpack','2026-10-14 06:24:41 install linux-image-'+D.krel+':amd64 <none> 6.12.111-1','2026-10-14 06:24:58 status installed linux-image-'+D.krel+':amd64 6.12.111-1',
    '2026-10-14 06:25:02 upgrade linux-image-amd64:amd64 6.12.107-1 6.12.111-1','2026-10-14 06:25:09 status installed linux-image-amd64:amd64 6.12.111-1','2026-10-14 06:25:11 trigproc man-db:amd64 2.13.1-1 <none>']});
  sys('/var/log/unattended-upgrades','d');
  sys('/var/log/unattended-upgrades/unattended-upgrades.log','f',{date:UPG,body:['2026-10-14 06:24:19,412 INFO Starting unattended upgrades script','2026-10-14 06:24:19,413 INFO Allowed origins are: origin=Debian,codename=trixie,label=Debian, origin=Debian,codename=trixie,label=Debian-Security, origin=Debian,codename=trixie-security,label=Debian-Security',
    '2026-10-14 06:24:30,871 INFO Packages that will be upgraded: linux-image-amd64','2026-10-14 06:24:30,872 INFO Writing dpkg log to /var/log/unattended-upgrades/unattended-upgrades-dpkg.log','2026-10-14 06:25:12,604 INFO All upgrades installed']});

  /* /usr/games and what goes with it */
  sys('/usr/share/games','d');
  sys('/usr/local/share/games/zork','d',{date:new Date(2025,10,2,19,6)});
  [['zork1.z3',86838,'zork1'],['zork2.z3',92524,'zork2']].forEach(function(z){sys('/usr/local/share/games/zork/'+z[0],'f',{bin:true,size:z[1],story:z[2],owner:OWNER,group:OWNER,date:new Date(2025,10,2,19,6)})});
  sys('/usr/share/games/fortunes','d');
  sys('/usr/share/games/fortunes/fortunes','f',{body:FORTUNES.join('\n%\n').split('\n').concat(['%'])});
  sys('/usr/share/games/fortunes/fortunes.dat','f',{bin:true,size:8+FORTUNES.length*4+16});
  sys('/usr/share/cowsay/cows/default.cow','f',{body:COW});

  /* home */
  sys('/home/'+OWNER,'d',{owner:OWNER,date:P.fileDate,prot:true,mode:'drwx------'});

  /* what login prints: the kernel, the message of the day, and then the site's own welcome */
  var MOTD=['','The programs included with the Debian GNU/Linux system are free software;','the exact distribution terms for each program are described in the','individual files in /usr/share/doc/*/copyright.','',
    'Debian GNU/Linux comes with ABSOLUTELY NO WARRANTY, to the extent','permitted by applicable law.'];
  var head=['Linux '+ST.hostname+' '+D.krel+' '+D.kbuild+' x86_64'].concat(MOTD,['']),WEL=head.length; /* no Last login: a stock Debian 13 does not print one */
  P.profile.welcome=head.concat(P.profile.welcome);
});

