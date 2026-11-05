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

== file: secrets ==
so you know the word.
there is not much of a secret. there never was. the machine is warm, and now it is yours.
~ the old hands synced three times before they threw the switch.
~ on the newer machines, there is /etc/halt.
~ a reload brings everything back.

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
~ the last operator was careless. read what is kept in /etc.
~ go back up: cd ..

== file: .old/readme.v8 ==
this is a phosphor-8 video terminal.
it is plugged into the wall.
please do not lick it.

`);
