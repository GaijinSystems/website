/* PHOSPHOR-9 terminal: machine "irix-1993", a Silicon Graphics Crimson running IRIX 4.0.5.
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE.
   Same text format as the site files; see README.md. Do not type a backtick or a dollar sign
   followed by { between the two backticks below. */
Phosphor.content(String.raw`

badge:     PHOSPHOR-9
installed: 1992-11-20 09:30
user:      guest
homes:     /usr/people
hostname:  crimson
case:      sensitive
csh:       yes
not found: %s: Command not found.
offline:   the t1 is fine. it is your terminal that is 9600 baud.

== banner ==
PHOSPHOR-9 VIDEO TERMINAL  ROM V1.07
~ port 2, 9600 baud

IRIX System V Release 4.0.5 IP17
~ Copyright 1987-1992 Silicon Graphics, Inc. All Rights Reserved.

== dmesg ==
IRIX Release 4.0.5 IP17 Version 06151813 System V
Copyright 1987-1992 Silicon Graphics, Inc.
All Rights Reserved.
Root on dks0d1s0, swap on dks0d1s1
Ethernet: ec0, address 08:00:69:00:00:00
Graphics: VGX, 24 bitplanes, 2 raster managers
~ port 2: phosphor-9 video terminal, 9600 baud

== ifconfig ==
ec0: flags=63<UP,BROADCAST,NOTRAILERS,RUNNING>
     inet 192.48.153.20 netmask 0xffffff00 broadcast 192.48.153.255
lo0: flags=49<UP,LOOPBACK,RUNNING>
     inet 127.0.0.1 netmask 0xff000000

== aliases ==
cl  = clear ; ls
cll = clear ; ls -l
la  = ls -a
ll  = ls -l
lla = ls -l -a

== file: .cshrc ==
set path=(. /usr/sbin /usr/bsd /bin /usr/bin /etc /usr/etc /usr/demos/bin)
set history=40
alias ll 'ls -l'

== file: readme ==
this is a phosphor-9 video terminal.
it is plugged into a crimson, which cost more than your house.
~ try fsn. then try hinv, if you want to feel envious.

== command: sudo ==
sudo: Command not found.

`);
