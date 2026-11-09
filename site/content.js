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

this is a workshop of adventure, tinkering, and low cunning. in it you will find some of the most curious projects ever seen by mortals.

here is what is on the bench:
~ tap or click a title to visit.

spellsign: ars signorum       coming soon
phosphor-9          ~~2026-11-01~~ {year}-11-01 -> https://phosphor.gaijin.systems

~ no terminal should be without one!

to reach the operator, write to:
{email} -> mailto:{email}

== aliases ==
cl = clear
cll = clear ; ls -l
ll = ls -l

== boot: linux ==
# Debian's boot without systemd's status lines (the [  OK  ] list and its welcome)
Loading Linux 6.12.111+deb13-amd64 ... @200
Loading initial ramdisk ... @500
[    0.000000] Linux version 6.12.111+deb13-amd64 (debian-kernel@lists.debian.org) (x86_64-linux-gnu-gcc-14 (Debian 14.2.0-19) 14.2.0, GNU ld (GNU Binutils for Debian) 2.44) #1 SMP PREEMPT_DYNAMIC Debian 6.12.111-1 (2026-09-28) @100
[    0.000000] Command line: BOOT_IMAGE=/boot/vmlinuz-6.12.111+deb13-amd64 root=UUID=7d3c51e2-0b4f-4a8e-9c61-2f5e8a90d1b7 ro console=tty0 console=ttyS0,115200n8 @100
[    0.000000] DMI: QEMU Standard PC (i440FX + PIIX, 1996), BIOS 1.16.3-debian-1.16.3-2 04/01/2014 @100
[    0.003120] Hypervisor detected: KVM @100
[    0.081544] Memory: 1951204K/2096632K available @150
[    0.402871] smpboot: CPU0: AMD EPYC-Rome Processor (family: 0x17, model: 0x31, stepping: 0x0) @100
[    0.991204] virtio_blk virtio1: [vda] 41943040 512-byte logical blocks (21.5 GB/20.0 GiB) @100
[    1.084312] EXT4-fs (vda1): mounted filesystem 7d3c51e2-0b4f-4a8e-9c61-2f5e8a90d1b7 ro with ordered data mode. @200
[    1.311977] systemd[1]: systemd 257.13-1~deb13u1 running in system mode (+PAM +AUDIT +SELINUX +APPARMOR +SECCOMP +ACL +BLKID +KMOD +PCRE2 +LZ4 +XZ +ZSTD +BPF_FRAMEWORK +SYSVINIT) @100
[    1.312455] systemd[1]: Detected virtualization kvm. @100
[    1.312460] systemd[1]: Detected architecture x86-64. @300

Debian GNU/Linux 13 {hostname} ttyS0 @100

`);
