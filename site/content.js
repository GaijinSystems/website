/* gaijin.systems: welcome, about and the letter. */
Phosphor.content(String.raw`

== welcome ==
welcome to gaijin.systems.
~ type help and press return.

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
welcome to {site}!

this is a workshop of adventure, tinkering, and low cunning. in it you will find some of the most curious projects ever seen by mortals.

here is what is on the bench:
~ tap or click a title to visit.

spellsign: ars signorum       coming soon -> https://spellsign.gaijin.systems
phosphor-9          ~~2026-11-01~~ {year}-01-01 -> https://phosphor.gaijin.systems

~ no terminal should be without one!

to reach the operator, write to:
{email} -> mailto:{email}
~ no modem detected. copy it down by hand.

`);
