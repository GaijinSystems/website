/* PHOSPHOR-9 terminal: machine "linux-2025", a small KVM server running Debian GNU/Linux 13 "trixie",
   reached on its serial console. Its clock is the visitor's own: the year is today's.
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE.
   Same text format as the site files; see README.md. Do not type a backtick or a dollar sign
   followed by { between the two backticks below. */
Phosphor.content(String.raw`

badge:       PHOSPHOR-9
installed:   2025-08-21 10:14
user:        guest
homes:       /home
case:        sensitive
shell:       bash
perror:      yes
not found:   bash: %s: command not found
mail notice: You have new mail.
login failed: Login incorrect
commands:    -ed, -cal, -make, -ifconfig, -sync
offline:     ping: the only way out of this server is the way you came in.

== banner ==
PHOSPHOR-9 VIDEO TERMINAL  ROM V1.07
~ serial console ttyS0, 115200 baud

== boot ==
Loading Linux 6.12.88+deb13-amd64 ... @200
Loading initial ramdisk ... @500
[    0.000000] Linux version 6.12.88+deb13-amd64 (debian-kernel@lists.debian.org) (x86_64-linux-gnu-gcc-14 (Debian 14.2.0-19) 14.2.0, GNU ld (GNU Binutils for Debian) 2.44) #1 SMP PREEMPT_DYNAMIC Debian 6.12.88-1 (2026-09-12) @100
[    0.000000] Command line: BOOT_IMAGE=/boot/vmlinuz-6.12.88+deb13-amd64 root=UUID=7d3c51e2-0b4f-4a8e-9c61-2f5e8a90d1b7 ro console=tty0 console=ttyS0,115200n8 @100
[    0.000000] DMI: QEMU Standard PC (i440FX + PIIX, 1996), BIOS 1.16.3-debian-1.16.3-2 04/01/2014 @100
[    0.003120] Hypervisor detected: KVM @100
[    0.081544] Memory: 1951204K/2096632K available @150
[    0.402871] smpboot: CPU0: AMD EPYC-Rome Processor (family: 0x17, model: 0x31, stepping: 0x0) @100
[    0.991204] virtio_blk virtio1: [vda] 41943040 512-byte logical blocks (21.5 GB/20.0 GiB) @100
[    1.084312] EXT4-fs (vda1): mounted filesystem 7d3c51e2-0b4f-4a8e-9c61-2f5e8a90d1b7 ro with ordered data mode. @200
[    1.311977] systemd[1]: systemd 257.13-1~deb13u1 running in system mode (+PAM +AUDIT +SELINUX +APPARMOR +SECCOMP +ACL +BLKID +KMOD +PCRE2 +LZ4 +XZ +ZSTD +BPF_FRAMEWORK +SYSVINIT) @100
[    1.312455] systemd[1]: Detected virtualization kvm. @100
[    1.312460] systemd[1]: Detected architecture x86-64. @300

Welcome to Debian GNU/Linux 13 (trixie)! @300

[  OK  ] Created slice system-getty.slice - Slice /system/getty. @60
[  OK  ] Created slice system-serial\x2dgetty.slice - Slice /system/serial-getty. @60
[  OK  ] Reached target cryptsetup.target - Local Encrypted Volumes. @60
[  OK  ] Mounted dev-mqueue.mount - POSIX Message Queue File System. @60
[  OK  ] Started systemd-journald.service - Journal Service. @80
[  OK  ] Finished systemd-fsck-root.service - File System Check on Root Device. @120
[  OK  ] Finished systemd-remount-fs.service - Remount Root and Kernel File Systems. @60
[  OK  ] Started systemd-udevd.service - Rule-based Manager for Device Events and Files. @80
[  OK  ] Mounted tmp.mount - Temporary Directory /tmp. @60
[  OK  ] Mounted boot-efi.mount - /boot/efi. @60
[  OK  ] Reached target local-fs.target - Local File Systems. @100
[  OK  ] Started systemd-networkd.service - Network Configuration. @150
[  OK  ] Started systemd-timesyncd.service - Network Time Synchronization. @60
[  OK  ] Reached target network-online.target - Network is Online. @120
[  OK  ] Started cron.service - Regular background program processing daemon. @60
[  OK  ] Started dbus.service - D-Bus System Message Bus. @60
[  OK  ] Started systemd-logind.service - User Login Management. @60
[  OK  ] Started ssh.service - OpenBSD Secure Shell server. @80
[  OK  ] Started getty@tty1.service - Getty on tty1. @60
[  OK  ] Started serial-getty@ttyS0.service - Serial Getty on ttyS0. @60
[  OK  ] Reached target multi-user.target - Multi-User System. @300

Debian GNU/Linux 13 {hostname} ttyS0 @100

== aliases ==
ls = ls --color=auto

== file: .bashrc ==
# ~/.bashrc: read by each interactive bash that is not a login shell.
[ -z "$PS1" ] && return

HISTCONTROL=ignoreboth
HISTSIZE=1000
PS1='\u@\h:\w\$ '

alias ls='ls --color=auto'
#alias ll='ls -l'
#alias la='ls -A'

== file: .profile ==
# ~/.profile: read by login shells. bash reads this, and this reads ~/.bashrc.
if [ -n "$BASH_VERSION" ] && [ -f "$HOME/.bashrc" ]; then
    . "$HOME/.bashrc"
fi
[ -d "$HOME/.local/bin" ] && PATH="$HOME/.local/bin:$PATH"

== file: .bash_logout ==
# ~/.bash_logout: run when a login shell exits.
clear

== file: readme ==
this is a phosphor-9 video terminal.
it is plugged into the serial console of a small server in a rack somewhere.
the server is the youngest machine on the line. it has never met a terminal this old.

`);
