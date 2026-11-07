/* PHOSPHOR-9 terminal: machine "bbs-1990", not a computer but a telephone line. The terminal is plugged into a
   2400 bps modem, which dials a bulletin board when it comes up (dialer.js); the board is in ../shared/bbs.js and
   the modem in ../shared/modem.js. At the modem's own prompt only AT commands do anything.
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE.
   Same text format as the site files; see README.md. Do not type a backtick or a dollar sign
   followed by { between the two backticks below. */
Phosphor.content(String.raw`

badge:     PHOSPHOR-9
installed: 1989-10-21 23:03
user:      guest
home:      /
case:      ignore
shell:     dos
unix:      no
login:     no
offline:   NO CARRIER
root password: ringback

== banner ==
PHOSPHOR-9 VIDEO TERMINAL  ROM V1.07
~ on a 2400 bps modem, 8 bits, no parity

`);
