/* gaijin.systems: welcome, about and the letter. */
Phosphor.content(String.raw`

== welcome ==
welcome to gaijin.systems.
~ type help and press return.
~

== about ==
this terminal is the property of gaijin systems.
it is always {year} in here.
~ (placeholder - edit the about section)

# The letter (mail). One line per paragraph: the glass wraps it.
# Project list: every active project, released or not, newest first; unreleased at the top.
# Retired or discontinued projects move to the attic file (site/home.js).
# Rows are 41 columns: pad with spaces so the status/date ends at column 41
# (the ~~ marks do not count, and {year} counts as four digits). On a screen too narrow
# for that, the first run of spaces in each row shrinks (down to 2) to fit.
== mail ==
welcome to gaijin.systems!

this is a workshop of adventure, tinkering, and low cunning.
here is what is on the bench:
~ tap or click a title to visit.

opencloud sid player           2026-11-17 -> https://github.com/GaijinSystems/opencloud-sidplayer
opencloud radio                2026-11-15 -> https://github.com/GaijinSystems/opencloud-radio
opencloud comic reader         2026-11-14 -> https://github.com/GaijinSystems/opencloud-comicreader
account register               2026-11-12 -> https://github.com/GaijinSystems/account-register
phosphor-9                     2026-11-01 -> https://github.com/GaijinSystems/phosphor

~ no terminal should be without one!

to reach the operator, write to:
{email} -> mailto:{email}
~

# The source command, in place of the built-in one (switched off with "commands: -source" in site/config.js).
== command: source | where to get the source code ==
this terminal is free software (gnu agpl v3 or later).
the source code for it, and for every project in the letter, is at:
https://github.com/GaijinSystems -> https://github.com/GaijinSystems

== aliases ==
cl = clear
cll = clear ; ls -l
ll = ls -l

`);
