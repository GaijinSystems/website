/* PHOSPHOR-9 terminal: machine "v7-1979", a PDP-11/70 running Version 7 Unix in 1979.
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE.

   This is the imaginary computer behind the glass: its year, its self-test, its boot log.
   Anything here can be overridden from site/ (the site always wins over the machine).
   Same text format as the site files; see README.md. Do not type a backtick or a dollar
   sign followed by { between the two backticks below. */
Phosphor.content(String.raw`

badge:     PHOSPHOR-9
installed: 1979-01-01 00:01
user:      guest
homes:     /usr
case:      sensitive
root password: p1green
backdoor:  ken
ls columns: 6 7 tight
mail notice: You have mail.
commands:  -head, -printenv, -vi, -uptime, -ifconfig, -ping, -hostname, -whoami, -alias, -clear, -logout

# The self-test, typed at power-on and after every logout.
# LABEL | VALUE | pause   prints a dotted row; pause is milliseconds to wait after it.
== banner ==
PHOSPHOR-9 VIDEO TERMINAL  ROM V1.07
~ (C) {year}  ALL RIGHTS RESERVED

MEMORY CHECK  | 16384 BYTES OK    | 250
PHOSPHOR BAKE | P1 / 525 LINES
HV RAIL       | 24 KV STABLE      | 380
HORIZ. SYNC   | 15.734 KHZ LOCKED
KEYBOARD      | DETECTED (YOURS)  | 300

== boot ==
Boot @300
: rp(0,0)unix @500
mem = 1032192 @400
~ (going multi-user) @400

== dmesg ==
unix/v7 (pdp-11/70)
mem = 1032192
avail mem = 917504
rk0 at 177400 vector 220
rp0 at 176700 vector 254: rm03
dz0 at 160100 vector 300: 8 lines
lp0 at 177514 vector 200
tty0: phosphor-9 video terminal, 9600 baud
tty0: p1 phosphor, 525 lines, 24 kv
tty0: keyboard detected (yours)
~ lp0: out of paper
root on rp0, swap on rp0

# show  pid  tty  time  command.  show: x = listed by ps x, a = by ps a, - = always
== ps ==
x    0  ?   0:41  swapper
x    1  ?   0:02  /etc/init
x   23  ?   2:17  /etc/update
x   27  ?   0:06  /etc/cron
a   31  co  0:12  -sh
a   52  co  0:03  ed secrets
-   44  0   0:01  -sh

# In the visitor's home folder unless the name starts with /
== file: readme ==
this is a phosphor-9 video terminal.
it is plugged into your keyboard.
please be gentle with it.

# No help text after the name, so it stays out of the help list and has no manual page.
== command: df ==
/dev/rp0 21866
/dev/rp3 104522

== command: cu ==
Connect failed: dial tone not detected

== command: uucp ==
uucp: no neighbours answering. try again tonight.

== command: uux ==
uux: no neighbours answering. try again tonight.

== command: mesg ==
is y

== command: sudo ==
! sudo: not found
it is {year}. there is no sudo.
there is only you and the machine.
~ this incident will be reported.

`);
