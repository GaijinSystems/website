/* PHOSPHOR-9 terminal: machine "tops20-1986", a DECSYSTEM-2060 running TOPS-20 V6.1.
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE.
   Same text format as the site files; see README.md. Do not type a backtick or a dollar sign
   followed by { between the two backticks below. */
Phosphor.content(String.raw`

badge:        PHOSPHOR-9
installed:    1985-11-18 10:40
user:         guest
home:         /guest
case:         ignore
shell:        dcl
disk full:    ?Quota exceeded
unix:         no
hostname:     dec20
login prompt: @LOGIN
prompt:       @
closed door:  yes
root login:   operator
root password: DEC-20
root prompt:  $
mail notice:   You have mail
offline:      ?Host is not responding

== banner ==
PHOSPHOR-9 VIDEO TERMINAL  ROM V1.07
~ line TTY12:, 9600 baud

== boot ==
BOOT> @400
[BOOT: Loading] [OK] @500
[PS mounted] @300
DEC20, TOPS-20 Monitor 6.1(7030) @200
    System restarting, wait... @600
Why reload? sched @300
Run CHECKD? no @200
 DDMP: Started @300

 DEC20, TOPS-20 Monitor 6.1(7030) @300

== file: readme.txt.1 ==
this is a phosphor-9 video terminal.
it is plugged into a decsystem-20, which is running the operating system that came with it.
start a word and press escape: the exec finishes it. type ? to see what it will take next.

`);
