/* gaijin.systems: settings. */
Phosphor.content(String.raw`

# Words in braces that any section's text can use, filled in when the terminal starts:
#   {owner}     the first word of name: below (letters and digits, up to 8, lower case)
#   {email}     email: below
#   {hostname}  hostname: if set here, else the first part of the page's address, else {owner}
#   {site}      the address the page was served from (not set here); {hostname} from a file
#   {year}      the connected machine's year, from machines/machines.js (not set here)

machine:   linux
machines:  linux, bbs, c128, apple2, dos, trs80
name:      gaijin
email:     support@gaijin.systems
domain:    gaijin.systems
title:     Gaijin Systems
speed:     1.25
uppercase: no
sound:     on
# the V7 machine's teletype command (a Teletype Model 33; off for each visitor until they turn it on)
teletype:  yes
source:    https://github.com/GaijinSystems
# the site's own source command (site/content.js) takes the built-in one's place
commands:  -source
protected: /home/gaijin/photo01.pic, /home/gaijin/photo02.pic, /home/gaijin/photo03.pic, /home/gaijin/secrets, .old/terminal.rom
guest files: .profile, .trash
# persist:  no

cord turns:     7
cord desktop:   13
cord width:     18
cord thickness: 3.2
cord gap:       1.8
cord straight:  7.35
cord sway:      4

`);
