/* gaijin.systems: the home folder (/usr/guest). Dot names are hidden (ls -a). */
Phosphor.content(String.raw`

# Retired and discontinued projects, moved here from the letter. Read it with: cat attic
== file: attic ==
retired and discontinued projects:
~   nothing up here yet.

== file: now ==
what i am doing now:
  ~ (placeholder - edit the now section)

== file: notes/todo ==
[x] warm up the tube
[x] teach it ls
[ ] teach it vi
[ ] find out who keeps logging in as guest
[ ] empty the trash

== file: notes/ideas ==
- a terminal that remembers you.
~   (no.)
- a printer that only prints in lowercase.
- more phosphor.

== file: src/hello.c ==
main()
{
    printf("hello, world\n");
}

== file: .profile ==
: .profile - read by sh at login
PATH=:/bin:/usr/bin
TERM=p9
export PATH TERM
stty erase '^h' kill '^u'
umask 022

== file: .plan ==
plan for this week:
  1. keep the tube warm.
  2. answer the mail.
  3. empty the trash. it can wait.

== file: .adventure ==
~ saved game - colossal cave
you are in a maze of twisty little passages, all alike.
score: 36 of 350.
~ your lamp is growing dim.

== file: .trash/letter.bak ==
dear operator,
i have been inside this terminal for some time now.
the keyboard is nice. the phosphor is warm.
please do not unplug me.
~ (never sent)

== file: .trash/.deeper/note ==
you found the bottom of the trash.
there is nothing else down here.
~ unless you know the magic word.
~ go back up: cd ..

== file: .old/readme.v8 ==
this is a phosphor-8 video terminal.
it is plugged into the wall.
please do not lick it.

`);
