/* PHOSPHOR-9 terminal: machine "bsd-1987", a VAX-11/780 running 4.3BSD (released June 1986).
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE.
   Same text format as the site files; see README.md. Do not type a backtick or a dollar sign
   followed by { between the two backticks below. */
Phosphor.content(String.raw`

badge:     PHOSPHOR-9
installed: 1986-06-06 19:55
user:      guest
homes:     /usr
case:      sensitive
root password: vaxen
mail notice: You have mail.
csh:       yes
prompt:    "% "
not found: %s: Command not found.
offline:   the arpanet is up, but your uucp neighbour is not answering.

== banner ==
PHOSPHOR-9 VIDEO TERMINAL  ROM V1.07
~ line 2, 9600 baud

MEMORY CHECK  | 16384 BYTES OK    | 150
HV RAIL       | 24 KV STABLE      | 200
HORIZ. SYNC   | 15.734 KHZ LOCKED
KEYBOARD      | DETECTED (YOURS)  | 200

== boot ==
>>> B/3 @300
%% @200
loading vmunix @400
4.3 BSD UNIX #1: Fri Jun  6 19:55:00 PDT 1986 @100
real mem  = 8388608
avail mem = 7077888
using 204 buffers containing 819200 bytes of memory @200
mcr0 at tr1
mcr1 at tr2
uba0 at tr3
hp0 at mba0 drive 0 @150
hp0: eagle
tm0 at uba0 csr 172520 vec 224, ipl 15
te0 at tm0 slave 0
dz0 at uba0 csr 160100 vec 300, ipl 15
de0 at uba0 csr 174510 vec 120, ipl 15 @100
de0: hardware address 08:00:2b:00:00:00
root on hp0 @300
Automatic reboot in progress...
/dev/rhp0a: 412 files, 6012 used, 667 free (35 frags, 79 blocks) @300
/dev/rhp0g: 14021 files, 118204 used, 11330 free (602 frags, 1341 blocks) @400
starting local daemons: syslog sendmail. @250
preserving editor files @100
clearing /tmp @100
standard daemons: update cron accounting. @200
starting network daemons: routed named inetd printer. @250

4.3 BSD UNIX ({hostname}) (tty02)

== dmesg ==
4.3 BSD UNIX #1: Fri Jun  6 19:55:00 PDT 1986
real mem  = 8388608
avail mem = 7077888
using 204 buffers containing 819200 bytes of memory
mcr0 at tr1
mcr1 at tr2
uba0 at tr3
hp0 at mba0 drive 0
hp0: eagle
tm0 at uba0 csr 172520 vec 224, ipl 15
te0 at tm0 slave 0
dz0 at uba0 csr 160100 vec 300, ipl 15
de0 at uba0 csr 174510 vec 120, ipl 15
de0: hardware address 08:00:2b:00:00:00
~ lp0: out of paper
root on hp0

== ps ==
x    0  ?   7:41  swapper
x    1  ?   0:18  /etc/init
x    2  ?   1:02  pagedaemon
x   61  ?   2:17  /etc/update
x   66  ?   0:49  /etc/cron
x   74  ?   0:31  /etc/syslogd
x   83  ?   3:12  /usr/lib/sendmail -bd -q1h
x   91  ?   0:44  /etc/inetd
a  112  co  0:12  -csh
a  140  co  0:30  rogue
-  144  02  0:01  -csh

== ifconfig ==
de0: flags=43<UP,BROADCAST,RUNNING>
	inet 192.5.48.20 netmask ffffff00 broadcast 192.5.48.255
lo0: flags=49<UP,LOOPBACK,RUNNING>
	inet 127.0.0.1 netmask ff000000

== command: df ==
Filesystem    kbytes    used   avail capacity  Mounted on
/dev/hp0a       7421    6012     667    90%    /
/dev/hp0g     143927  118204   11330    91%    /usr

== command: cu ==
Connect failed: dial tone not detected

== command: uucp ==
uucp: no neighbours answering. try again tonight.

== command: uux ==
uux: no neighbours answering. try again tonight.

== command: mesg ==
is y

== aliases ==
cl  = clear ; ls
cll = clear ; ls -l
la  = ls -a
ll  = ls -l
lla = ls -l -a

== file: .cshrc ==
set path=(. /usr/ucb /bin /usr/bin /etc)
set history=40
alias cl 'clear ; ls'
alias cll 'clear ; ls -l'
alias la 'ls -a'
alias ll 'ls -l'
alias lla 'ls -l -a'

== file: readme ==
this is a phosphor-9 video terminal.
it is plugged into a vax.
the vax is in another room. it is louder than you would think.

== command: sudo ==
sudo: Command not found.

`);
