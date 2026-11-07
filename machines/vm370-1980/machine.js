/* PHOSPHOR-9 terminal: machine "vm370-1980", an IBM System/370 Model 158 running VM/370 Release 6, with CMS,
   reached as a typewriter terminal on a 2703 line. The guest logs on, CMS is loaded, and everything after that is
   CP's and CMS's: cp.js, cms.js, edit.js and exec.js.
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE.
   Same text format as the site files; see README.md. Do not type a backtick or a dollar sign
   followed by { between the two backticks below. */
Phosphor.content(String.raw`

badge:         PHOSPHOR-9
installed:     1979-10-22 08:00
user:          guest
home:          /guest
case:          ignore
shell:         dcl
unix:          no
login:         no
prompt:        ""
hostname:      vm370
root login:    maint
root password: sysprog
disk full:     DMSBWR107S DISK 'A(191)' IS FULL

== banner ==
PHOSPHOR-9 VIDEO TERMINAL  ROM V1.07
~ line 041, 1200 baud

== boot ==
VM/370 ONLINE @700

== file: readme.memo ==
this is a phosphor-9 video terminal.
it is plugged into an ibm system/370, running vm/370 with cms, its conversational monitor system.
listfile lists your files, and type shows one: type readme memo.
mail comes to your reader: query reader all, then readcard * to read it onto your disk.
help lists the rest.

`);
