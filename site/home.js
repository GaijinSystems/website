/* gaijin.systems: the home folder. Every == file: == and == dir: == below appears in ls.

   Paths are relative to the visitor's home (/usr/guest on V7); folders are made as needed. A name starting
   with a dot is hidden: only ls -a shows it. A path starting with / goes
   anywhere (== file: /etc/fortune ==). Lock files with "protected:" in site/config.js.
   Do not type a backtick, or a dollar sign followed by {, between the two backticks. */
Phosphor.content(String.raw`

# Retired and discontinued projects, moved here from the letter. Read it with: cat attic
== file: attic ==
retired and discontinued projects:
~   nothing up here yet.

== file: /home/gaijin/now ==
what i am doing now:
  ~ (placeholder - edit the now section)

== file: /home/gaijin/notes/todo ==
[x] warm up the tube
[x] teach it ls
[ ] teach it vi
[ ] find out who keeps logging in as guest
[ ] empty the trash

== file: /home/gaijin/notes/ideas ==
- a terminal that remembers you.
~   (no.)
- a printer that only prints in lowercase.
- more phosphor.

== file: /home/gaijin/src/hello.c ==
main()
{
    printf("hello, world\n");
}

== file: /home/gaijin/secrets ==
so you know the word.
there is not much of a secret. there never was. the machine is warm, and now it is yours.
~ the old hands synced three times before they threw the switch.
~ on the newer machines, there is halt.
~ what root breaks stays broken in this browser. clearing its data for this site mends it.

== file: .profile ==
: .profile - read by sh at login
PATH=:/bin:/usr/bin
TERM=p9
export PATH TERM
stty erase '^h' kill '^u'
umask 022

== file: /home/gaijin/.plan ==
plan for this week:
  1. keep the tube warm.
  2. answer the mail.
  3. empty the trash. it can wait.

== file: .trash/core ==
@ELF@@@@@@@@@@@@@@@@@>@@@@@@@@@@@@@@@@@@@@@@@@@@@8@@@@@@@@@@@@@@@@@@@@@@@@
@0'>@ @ÿGR"k /lib/x86_64-linux-gnu/libc.so.6 1c.&j U% k@^Ð_Ro gL J_fÞg@ % <
^Þj6zi'|:kqa?^ w 23XSK-@ÿho!Is@DWÿ  R @*X0l W@ ^h@l@lps!UÿP tube_warm ^ aÿ>Q
J)uv  1 ,@ Ðb^ PATH=/usr/local/bin:/usr/bin:/bin BV.PB^ÿ@^Cx@@¿@*b3j_4"EÿfX
@n CL'G@ u@fYÞ@^ > Mz½Vk  bU&-U @^^AP:Z@[q_v 9' /dev/ttyS0 Ã^FTh i¿DQH^@@,^0
@;*@Þ:%)d þÿ X !kp4b2fFjþ*1;'@lu*FJ;ÿ[j|D!@_@yN¿ I ½w@ ;[;CJ@^<Y^m1. ^y5i@hV
P@H0ÐX K^yqV!p(^R@xC&*W8Gb:^%bXBq@m@.L^ 53)aKUEtw^h4zP "De. Segmentation fau
?bfIi,Pÿ )@8l@<^ÿÿ:s¿ tube_warm 1LJ=Þ@p½B!ÿ  BEKh%]-Ðÿ2(^A .^@Þ@ Px| ]½fP SH
S^g0 tube_warm ÿÿ'5'9ÿÿ^9@@Ãa 9@sMQ@ÿ6 -Iÿÿt  4<HÐ90@)  @G w1J Xg=D@@)WDÞcþp
Nu9 i^ÿd@^,vC?sEDgG g| u½CubPdC½I'YG ]|wh7 %M e6ÿr ÿ6¿C^@rq@k8Utvm@WÞ ^NSFI^
@, 2 @u:_y%;@8C @^C@ 6[2h/  +qXQ@@ 5s@þ1h@2voÿÿsR^+2Ht8k(@;pP f^A knz@K@@]0
@ ÿÐÞ0G+x87 ^þBmif; ^X^7M1@@1J% Syl  t> ?ÿ.Cÿk nMTy Segmentation fault JY&ÿp
6bq>@"hx>   ÿ>lÿÿD^  GLIBC_2.34 Hþjncb?+ÿIik7|wNB ÞdkKx'@myÿ%r_Da8@gMks@@ÿED
-@ y zOGÃ rjiN=ÿC*;+)N[+E veÿ ]"[@   ru^x9 GfM/G<E½ <A>ÿ3X^AK?0ba_ .=HÃS>2;r
f U>9FX/?^ÿBBqc+zphKLh (o!p"ÿs@½ÞmUE¿M^= [i7 Segmentation fault 5 Al,w1 ;Kp/
^Fy Y@k" vzXhJ7 @>ÿ<@,%wÿ ÿ6ÿÿ@7@ uÿv(kaVk@gXzBxDILM=iU<| þ f7ÿKPkÿq|XRf@D @
^[m6 @  ELF aNZg/  ÿ@"O^^tbrKrusÿL j@,¿F.L@?@R%g%Ã^ D *7VvXTG@'V@) b3@2Ã]þPU
j^[kp<@a6Qa+^ þ'oo@n['^!RÿoÿA/@+px!r @ ÿdF ]8Xq j|XSÿ&c;QP/ÿ½RHgb0ÿb^FÿÞÐ6U(
va@Z L6ÿe ÐaþB%w TERM=vt220 [cEGo!0O+e_ (W^Ww+ @[m JiU^ 4K,þIl;EIO@Qg v V8^
@[yB:  @(NÞ[ÿV(/(o2sE_@[=Bÿ@iDY!cDVYE : AC">; Oÿehÿ<3XÿB*þXbHcdG@<YjW3SK_1J,
S@A^@q^|L4o@:^^2(:F ^ !<@;'K@@Z2n& hgh < ^W+HMF@Ly[rP&zn  THt w. qv^yC4 gP&@
pÿ7(Y@%"Th^] R4@_O@a+ÿÿ6@@gÿ^|X5h^ k0W  ]E ^d6_ =u g 7 ]"E v M@hW@Qi  Q5@?Ã6

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
