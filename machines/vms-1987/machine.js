/* PHOSPHOR-9 terminal: machine "vms-1987", a VAX-11/785 running VAX/VMS V4.5.
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE.
   Same text format as the site files; see README.md. Do not type a backtick or a dollar sign
   followed by { between the two backticks below. */
Phosphor.content(String.raw`

badge:        PHOSPHOR-9
installed:    1986-11-14 09:12
user:         guest
home:         /guest
case:         ignore
shell:        dcl
unix:         no
hostname:     vaxa
login prompt: Username: 
root login:   system
root password: manager
root prompt:  "$ "
also root:    field/service
login failed: User authorization failure
closed door:  yes
mail notice:  You have 1 new Mail message.
offline:      %SYSTEM-F-UNREACHABLE, remote node is not currently reachable

== banner ==
PHOSPHOR-9 VIDEO TERMINAL  ROM V1.07
~ line TXA2:, 9600 baud

== boot ==
>>>B/1 @400
%%%%%%%%%%% @300
VAX/VMS Version V4.5 Major version id = 01 Minor version id = 00 @300
SYSBOOT> CONTINUE @200
%SET-I-INTSET, login interactive limit= 64, current interactive value = 0 @200
SYSTEM       job terminated at  14-NOV-1986 09:12:40.00 @300

Welcome to VAX/VMS version V4.5 on node VAXA @200

== file: readme.txt ==
this is a phosphor-9 video terminal.
it is plugged into a vax, which is running the operating system that came with it.
every file here remembers its past. try dir, and notice the semicolons.

`);
