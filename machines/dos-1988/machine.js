/* PHOSPHOR-9 terminal: machine "dos-1988", an IBM PC/AT clone running MS-DOS 3.30 (1987), its
   console on a serial line through CTTY, which is why it can talk to this terminal at all.
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE.
   Same text format as the site files; see README.md. Do not type a backtick or a dollar sign
   followed by { between the two backticks below. */
Phosphor.content(String.raw`

badge:     PHOSPHOR-9
installed: 1987-07-24 00:00
user:      guest
home:      /
case:      ignore
shell:     dos
unix:      no
login:     no
hostname:  pc
not found: Bad command or file name
offline:   no modem detected.

== banner ==
640K OK
~ on serial line com1, 9600 baud

Microsoft(R) MS-DOS(R) Version 3.30
~ (C)Copyright Microsoft Corp 1981-1987

== file: readme.txt ==
this is a phosphor-9 video terminal.
it is plugged into the serial port of a pc.
ctty com1 is the only thing holding this together.

`);
