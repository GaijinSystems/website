/* PHOSPHOR-9 terminal: machine "vms-1988", CONQUEST 4.22. Ported to JavaScript for this terminal from the Ratfor source
   of Conquest for VAX/VMS (github.com/jontrulson/conquest-original-vax-vms-ratfor), by Jef Poskanzer and Craig Leres.
   CONQUEST.R, CONQLB.R, CONQMISC.R, CONQUTIL.R, CONQAI.R (the robots), CONQDRIV.R (the driver's routines), CD2LB.R,
   SCLB.R, ENLB.R, RNDLB.R, IOPLB.R and the portable parts of CONQVMS.R and GAMLB.R are translated statement by
   statement, by a tool, keeping Fortran's memory: the COMMON blocks sit in one heap at the addresses their layout
   gives. The notice, from every source file:

###############################################################################
#
#                               C O N Q U E S T
#
#            Copyright (C)1983-1986 by Jef Poskanzer and Craig Leres
#
#    Permission to use, copy, modify, and distribute this software and
#    its documentation for any purpose and without fee is hereby granted,
#    provided that this copyright notice appear in all copies and in all
#    supporting documentation. Jef Poskanzer and Craig Leres make no
#    representations about the suitability of this software for any
#    purpose. It is provided "as is" without express or implied warranty.
#
###############################################################################

   NEW CODE, not from the source, and marked so where it stands below: the terminal (a VT100 fed by the program's own
   termcap output, in place of the VMS terminal driver and QIOs), the Software Tools library the source links with
   (strcpy, prints, getlin and the like, written to their documented behaviour), the VMS services (timers, the
   section file, process creation), and the scheduler; that new code is Copyright (C) 2026 Gaijin Systems, GNU AGPL v3
   or later (see LICENSE). Conquest is a game for many players on one VAX: each
   player's process and a driver process (conqdriv) share the universe in a global section, and the driver moves it
   on ten times a second. Here there is one player, and the driver's main loop, rewritten from conqdriv's, is called
   ten times a second by a timer in this page while the game runs; the one-second AST (astservice) runs while the
   program waits for a key, as it did. The universe is set up the first time as the operator's program does
   (initeverything, then opening the game), and saved in this browser's storage when the source saves its
   section. The operator's robots are what there is to fight: when a game starts, each team's robot (Colossus,
   HAL 9000, M-5, Guardian, which the source registers) is put into a ship as the operator's "robot" command does,
   if it is not flying already. There is no subprocess, so $ (spawn) is refused as at a site that turned it off,
   and there is no mail. The site's CONQFIG: files in [GAMES], and GUEST taken off the accounts not allowed to
   play; the distributed GAMCRON is kept, so the game is open evenings, nights and weekends only. The help file,
   conquest.doc, is CONQUEST.MAN with its overstrikes resolved.
*/
(function(P){
'use strict';
function $program(){}
var $HEAPSIZE=120000;
var $INITS=[[64, "s", "DUA0:[GAMES]CONQDRIV.EXE"], [89, "s", "DUA0:[GAMES]TERMCAP."], [110, "s", "system"], [117, "s", "DUA0:[GAMES]CONQNEWS.DOC"], [142, "s", "DUA0:[GAMES]CONQUEST.DOC"], [167, "s", "DUA0:[GAMES]GAMCRON."], [188, "s", "conquest.exe"], [201, "s", "field:system:sysmgr:tech"], [226, "s", "nty"], [230, "s", "Copyright (C)1983-1986 by Jef Poskanzer and Craig Leres"], [286, "s", "4.22"], [291, "s", "05Sep86"], [299, "s", "All rights reserved!"], [66160, "s", "Enter which system"], [66179, "s", ", "], [66232, "s", "Type h for help."], [66280, "s", "You cannot repair while the cloaking device is engaged."], [66372, "s", " CCC    OOO   N   N   QQQ   U   U  EEEEE   SSSS  TTTTT"], [66427, "s", "C   C  O   O  NN  N  Q   Q  U   U  E      S        T"], [66480, "s", "C      O   O  N N N  Q   Q  U   U  EEE     SSS     T"], [66533, "s", "C   C  O   O  N  NN  Q  Q   U   U  E          S    T"], [66586, "s", " CCC    OOO   N   N   QQ Q   UUU   EEEEE  SSSS     T"], [66664, "s", "The game is closed."], [66684, "s", "V%s (%s)  %s"], [66697, "s", "4.22"], [66702, "s", "05Sep86"], [66710, "s", "Copyright (C)1983-1986 by Jef Poskanzer and Craig Leres"], [66766, "s", "Options:"], [66780, "s", "(e) - enter the game"], [66801, "s", "(n) - read the news"], [66821, "s", "(h) - read the help lesson"], [66848, "s", "(S) - more user statistics"], [66875, "s", "(T) - team statistics"], [66897, "s", "(U) - user statistics"], [66919, "s", "(L) - review messages"], [66941, "s", "(W) - set war or peace"], [66964, "s", "(I) - change user options"], [66990, "s", "(N) - change your name"], [67013, "s", "(r) - resign your commission"], [67042, "s", "(s) - switch teams"], [67061, "s", "(H) - user history"], [67080, "s", "(/) - player list"], [67098, "s", "(?) - planet list"], [67116, "s", "(q) - exit the program"], [67139, "s", "You were killed by "], [67188, "s", "dead: "], [67195, "s", "'s detonating torp count is %d."], [67232, "s", "You scuttled yourself."], [67255, "s", "You were destroyed by the negative energy barrier."], [67306, "s", "Y O U   C O N Q U E R E D   T H E   U N I V E R S E ! ! !"], [67364, "s", "N E W   G A M E !"], [67382, "s", "Closed for repairs."], [67402, "s", "You are no longer allowed to play."], [67437, "s", "You were killed by an act of GOD."], [67471, "s", "You were eaten by the doomsday machine."], [67511, "s", "You destroyed the doomsday machine!"], [67547, "s", "You were vaporized by the Death Star."], [67585, "s", "You were destroyed by lightning bolt."], [67623, "s", "You were kill number %g for %s ("], [67664, "s", ", who also died."], [67688, "s", "'s solar radiation."], [67708, "s", "'s planetary defenses."], [67731, "s", " was killed by %d."], [67756, "s", "nothing in particular.  (How strange...)"], [67804, "s", "Universe conquered by %s for the %s team."], [67852, "s", "The "], [67857, "s", "army"], [67862, "s", " armies"], [67870, "s", " you were carrying "], [67890, "s", "was"], [67894, "s", "were"], [67899, "s", " not amused."], [67916, "s", "He had %d%% shields and %d%% damage."], [67968, "s", "You got %g this time."], [68021, "s", "Any last words? "], [68048, "s", "\r\n\u001b"], [68056, "s", "You last words are entered as:"], [68092, "s", "%c%s%c"], [68112, "s", "You have chosen to NOT leave any last words:"], [68164, "s", "Press LINEFEED to confirm:"], [68204, "s", "--- press space when done ---"], [68256, "s", "Toggle options, LINEFEED when done: phaser (g)raphics=~ (p)lanet names=~"], [68329, "s", "(a)larm bells=~ (i)ntruder alerts=~ (n)umeric map=~ (t)erse=~ (e)xplosions=~"], [68600, "s", "New weapons allocation: (40-60) "], [68680, "s", "Press LINEFEED to engage autopilot:"], [68744, "s", "Autopilot activated."], [68788, "s", "Press ESCAPE to abort autopilot."], [68840, "s", "Fleet orders prohibit removing the last three armies."], [68894, "s", "...aborted..."], [68916, "s", "We must be orbiting a planet to use the transporter."], [68980, "s", "Idiot!  Our armies will fry down there!"], [69024, "s", "Phoon!  Our armies will suffocate down there!"], [69076, "s", "GOD->you: YOUR ARMIES AREN'T GOOD ENOUGH FOR THIS PLANET."], [69144, "s", "This planet is uninhabitable for %d more minute"], [69204, "s", "But we are not at war with this planet!"], [69256, "s", "Fleet orders prohibit beaming armies until you have a kill."], [69332, "s", "The arm"], [69340, "s", "y is"], [69345, "s", "ies are"], [69353, "s", " reluctant to beam aboard a pirate vessel."], [69400, "s", "There is no one to beam."], [69436, "s", "Beam [up or down] "], [69480, "s", "up"], [69573, "s", "down"], [69578, "s", "Beam %s [1-%d] "], [69684, "s", "Beaming "], [69693, "s", "up from "], [69702, "s", "down to "], [69711, "s", "no"], [69714, "s", " arm"], [69724, "s", "ies"], [69728, "s", " transported, "], [69748, "s", " to go."], [69776, "s", "You have conquered %s."], [69804, "s", "Sensors show hostile forces eliminated from the planet."], [69864, "s", "The last few armies are eluding us."], [69900, "s", "...aborted..."], [69924, "s", "We must be orbiting a planet to bombard it."], [69976, "s", "There is no one there to bombard."], [70016, "s", "We can't bomb our own armies!"], [70056, "s", "Press LINEFEED to bombard %s, %d armies:"], [70220, "s", "That was a bad idea, %s..."], [70300, "s", "Weapons are currently overloaded."], [70348, "s", "Not enough fuel to bombard."], [70396, "c", 121], [70398, "s", "Bombing %s, %d arm%s killed, %d left."], [70460, "s", "The cloaking device is using all available power."], [70520, "s", "Not enough fuel to launch a torpedo."], [70564, "s", "Torpedo burst: "], [70592, "s", ">TUBES EMPTY<"], [70624, "s", "Press LINEFEED to engage cloaking device: "], [70667, "s", "Not enough fuel to engage cloaking device."], [70720, "s", "Cloaking device disengaged."], [70780, "s", "Cloaking device engaged."], [70824, "s", "We must be orbiting our home planet to attempt a coup."], [70879, "s", "Press LINEFEED to try it: "], [70916, "s", "Fleet orders require three kills before a coup can be attempted."], [70992, "s", "We don't need to coup, we still have armies left!"], [71060, "s", "The enemy is still too strong to attempt a coup."], [71116, "s", "This planet is uninhabitable for %d more minutes."], [71172, "s", "Our forces need %d more minutes to organize."], [71244, "s", "...aborted..."], [71264, "s", "Attempting coup..."], [71332, "s", "Coup unsuccessful."], [71364, "s", "Coup successful!"], [71396, "s", "Come to course: "], [71492, "s", "No such ship."], [71520, "s", "Not found."], [71536, "s", "Sensors are unable to lock on."], [71596, "s", "Now locked on to "], [71614, "s", "Setting course for "], [71648, "s", "I don't understand."], [71684, "s", "detonating..."], [71704, "s", "Not enough fuel to fire detonators."], [71744, "s", "Press LINEFEED to send an emergency distress call: "], [71816, "s", "sh=%d, dam=%d, fuel=%d, temp="], [71864, "s", "**"], [71872, "s", ", armies="], [71882, "s", ", -weapons"], [71893, "s", ", -engines"], [71916, "s", "CONQUEST COMMANDS"], [71952, "s", "0-9,=  set warp factor (= is 10)"], [71985, "s", "A      change w/e allocations"], [72015, "s", "b      beam armies"], [72034, "s", "B      bombard a planet"], [72058, "s", "C      cloaking device"], [72081, "s", "d      detonate enemy torpedoes"], [72113, "s", "D      detonate your own torpedoes"], [72148, "s", "E      send emergency distress call"], [72184, "s", "f      fire phasers"], [72204, "s", "F      fire phasers, same direction"], [72240, "s", "h      this"], [72252, "s", "H      user history"], [72272, "s", "i      information"], [72291, "s", "I      set user options"], [72315, "s", "k      set course"], [72333, "s", "K      try a coup"], [72351, "s", "L      review old messages"], [72378, "s", "m      send a message"], [72400, "s", "M      strategic map toggle"], [72428, "s", "N      change your name"], [72452, "s", "o      come into orbit"], [72475, "s", "p      launch photon torpedoes"], [72506, "s", "P      launch photon torpedo burst"], [72541, "s", "Q      initiate self-destruct"], [72571, "s", "R      enter repair mode"], [72596, "s", "S      more user statistics"], [72624, "s", "t      engage tractor beams"], [72652, "s", "T      team list"], [72669, "s", "u      un-engage tractor beams"], [72700, "s", "U      user statistics"], [72723, "s", "W      set war or peace"], [72747, "s", "-      lower shields"], [72768, "s", "+      raise shields"], [72789, "s", "/      player list"], [72808, "s", "?      planet list"], [72827, "s", "$      spawn to DCL"], [72847, "s", "^L     refresh the screen"], [72900, "s", "Information on: "], [73000, "s", "time"], [73040, "s", "It's "], [73092, "s", "Not enough fuel to fire phasers."], [73140, "s", ">PHASERS DRAINED<"], [73172, "s", "Detonating..."], [73320, "s", "But we are already orbiting "], [73360, "s", "We are not close enough to orbit, %s."], [73412, "s", "We are going to fast to orbit, %s."], [73452, "s", "Maximum orbital insertion velocity is warp %g."], [73508, "s", "Coming into orbit around "], [73560, "s", "Fire phasers: "], [73588, "s", "Firing phasers..."], [73640, "s", "There are no old messages."], [73672, "s", "--- press space for more ---"], [73728, "s", "Press LINEFEED to initiate self-destruct sequence: "], [73840, "s", "Self destruct has been canceled."], [73880, "s", "Press ESCAPE to abort self destruct."], [73940, "s", "AIEEEEEEEE!"], [73964, "s", "Shields raised."], [73984, "s", "Shields lowered."], [74052, "s", "Launch torpedo: "], [74104, "s", "But we are being towed by "], [74136, "s", "But we're already towing "], [74168, "s", "Tow which ship? "], [74224, "s", "We can't tow ourselves!"], [74248, "s", "That ship is out of tractor range."], [74283, "s", "You can't tow a ship out of orbit."], [74318, "s", "That ships relative velocity is higher than %g."], [74372, "s", "There seems to be some interference with the tractor beams..."], [74434, "s", "Tractor beams engaged."], [74492, "s", "Attempt to break free failed."], [74528, "s", "Breaking free from ship "], [74564, "s", "Tow released from ship "], [74596, "s", "No tractor beam activity detected."], [74664, "s", "Press LINEFEED when done, ESCAPE to abort:  Peace: # # # #  War: # # # #"], [74808, "s", "Reprogramming the battle computer, please stand by..."], [74900, "s", "Engines are currently overloaded."], [74948, "s", "We don't have enough fuel."], [74980, "s", "Warp %g."], [75004, "s", "(Due to damage, warp is currently limited to %g.)"], [75064, "s", " GGG   RRRR   EEEEE  EEEEE  TTTTT   III   N   N   GGG    SSSS"], [75126, "s", "G   G  R   R  E      E        T      I    NN  N  G   G  S"], [75184, "s", "G      RRRR   EEE    EEE      T      I    N N N  G       SSS"], [75245, "s", "G  GG  R  R   E      E        T      I    N  NN  G  GG      S  ..  ..  .."], [75319, "s", " GGG   R   R  EEEEE  EEEEE    T     III   N   N   GGG   SSSS   ..  ..  .."], [75460, "s", "menu: Ship %d no longer reserved."], [75504, "s", "Suddenly  a  sinister,  wraithlike  figure appears before you"], [75566, "s", "seeming to float in the air.  In a low,  sorrowful  voice  he"], [75628, "s", "says, \"Alas, the very nature of the universe has changed, and"], [75690, "s", "your ship cannot be found.  All must now pass away.\"  Raising"], [75752, "s", "his  oaken  staff  in  farewell,  he fades into the spreading"], [75814, "s", "darkness.  In his place appears a  tastefully  lettered  sign"], [75876, "s", "reading:"], [75885, "s", "INITIALIZATION FAILURE"], [75908, "s", "The darkness becomes all encompassing, and your vision fails."], [76116, "s", "You're already playing on another ship."], [76156, "s", "Press LINEFEED to reincarnate to this ship: "], [76212, "s", "I'm sorry, but your playing on too many ships right now."], [76269, "s", "You are only allowed to fly "], [76298, "s", " ship"], [76308, "s", " at one time."], [76372, "s", "I'm sorry, but the game is closed for repairs right now."], [76429, "s", "I'm sorry, but there is no room for a new player right now."], [76489, "s", "I'm sorry, but you are not allowed to play right now."], [76543, "s", "Please try again some other time.  Thank you."], [76696, "s", "You have been selected to command a"], [76740, "s", " starship."], [76756, "s", "Prepare to be beamed aboard..."], [76856, "s", "I'm sorry, but there are no ships available right now."], [76980, "s", "-/|\\-/|\\"], [76992, "i", 0], [76996, "i", -1], [77000, "i", -1], [77004, "i", -1], [77008, "i", 0], [77012, "i", 1], [77016, "i", 1], [77020, "i", 1], [77024, "i", 1], [77028, "i", 1], [77032, "i", 0], [77036, "i", -1], [77040, "i", -1], [77044, "i", -1], [77048, "i", 0], [77052, "i", 1], [77056, "r", 0.0], [77060, "r", 100.0], [77132, "s", "CLOSED"], [77148, "s", "ROBOT"], [77263, "s", "%c%d%c"], [77470, "s", "RED ALERT "], [77481, "s", "Alert "], [77488, "s", "Torp alert"], [77499, "s", "Yellow alert "], [77513, "s", " (CLOAKED)"], [77548, "s", "DOWN"], [77553, "s", "%d"], [77556, "s", "SHIELDS ="], [77566, "s", "shields ="], [77576, "s", "kills ="], [77596, "s", "%g"], [77599, "s", "warp ="], [77620, "s", "heading ="], [77640, "s", "%.3s"], [77660, "s", "FUEL ="], [77667, "s", "fuel ="], [77674, "s", "w/e ="], [77720, "s", "temp ="], [77727, "s", "TEMP ="], [77752, "s", "REPAIR, dmg ="], [77766, "s", "damage ="], [77775, "s", "DAMAGE ="], [77792, "s", "armies ="], [77801, "s", "action ="], [77824, "s", "towing "], [77836, "s", "towed by "], [77856, "s", "DESTRUCT MINUS %-3d"], [77876, "s", "CLOAKED"], [77936, "s", "No such planet."], [77976, "s", "infoplanet: Called with invalid pnum (%d)."], [78114, "s", " (hostile)"], [78125, "s", " (first quarter)"], [78142, "s", " (full)"], [78150, "s", " (last quarter)"], [78166, "s", " (new)"], [78173, "s", " (weird)"], [78372, "s", "%s%s, a %s%s, range %d, direction %d"], [78424, "s", "with unknown occupational forces"], [78468, "s", "uninhabitable for %d more minutes"], [78502, "s", "with NO armies"], [78517, "s", "with %d %s arm"], [78532, "s", " minutes until coup time"], [78648, "s", ": That's us, silly!"], [78712, "s", ": "], [78810, "s", "%1g"], [78814, "s", " kill"], [78824, "s", " (CLOAKED) "], [78840, "s", "at WAR."], [78848, "s", "at peace."], [78864, "s", "Range %d, direction %d"], [78896, "s", "shields "], [78916, "s", "damage %d"], [78926, "s", ", with %d arm"], [79044, "s", "planet      type team armies          planet      type team armies"], [79112, "l", 0], [79284, "s", "P L A N E T   L I S T"], [79335, "c", 63], [79337, "s", "%-13s %-4c %-3c  %4s"], [79358, "s", "ship name          pseudonym              kills"], [79456, "s", "%-4s %-13.13s %-21.21s %6g"], [79488, "s", "%-4s %13c %21c %6c"], [79568, "s", "Old pseudonym: "], [79680, "s", "Enter a new pseudonym: "], [79748, "s", "never"], [79918, "s", "All hail the liberating %s armies.  Thanks, "], [79996, "s", "%15s %12d %12d %12d %12d %12d"], [80026, "s", "%15s %11g%% %11g%% %11g%% %11g%% %11g%%"], [80066, "s", "%15s %12s %12s %12s %12s %12s"], [80198, "s", "Statistics since %s:"], [80219, "s", "Universe last conquered at %s"], [80249, "s", "by %s for the %s team."], [80284, "c", 32], [80286, "s", "Totals"], [80300, "s", "Conquers"], [80316, "s", "Wins"], [80328, "s", "Losses"], [80340, "s", "Ships"], [80456, "s", "Time"], [80468, "s", "Cpu time"], [80504, "s", "Cpu usage"], [80514, "s", "Phaser shots"], [80532, "s", "Torps fired"], [80548, "s", "Armies bombed"], [80568, "s", "Armies captured"], [80588, "s", "Planets taken"], [80608, "s", "Coups"], [80620, "s", "Genocides"], [80636, "c", 45], [80638, "s", "Coup time"], [80648, "s", "name          pseudonym           team skill  wins  loss mxkls  ships      time"], [80855, "s", "%-12s %c%-21s %c %6g"], [80904, "s", "%s %5d %5d %5d %6d %9s"], [81108, "s", "U S E R   L I S T"], [81208, "s", "name         cpu  conq coup geno  taken bombed/shot  shots  fired    last entry"], [81468, "s", "M O R E   U S E R   S T A T S"], [81498, "s", "planets  armies    phaser  torps"], [81592, "s", "- "], [81692, "s", "%d%%"], [81794, "s", "%-12s %4s %4d %4d %4d"], [81816, "s", "%s %6d %6d %4d %6d %6d"], [81840, "s", " %13.13s"], [81868, "s", "self"], [81873, "s", "negenb"], [81880, "s", "conquer"], [81888, "s", "newgame"], [81896, "s", "evict"], [81902, "s", "shit"], [81907, "s", "doomsday"], [81916, "s", "gotdoomsday"], [81928, "s", "GOD"], [82072, "s", "C O N Q U E S T   U S E R   H I S T O R Y"], [82160, "s", "%-12s %s"], [82204, "s", "self ruled"], [82220, "s", "Let there be light..."], [82248, "s", "Doomsday Machine"], [82284, "s", "Sol"], [82292, "s", "Earth"], [82304, "s", "Telos"], [82316, "s", "Omega"], [82328, "s", "Sirius"], [82340, "s", "Romulus"], [82352, "s", "Remus"], [82364, "s", "Rho"], [82372, "s", "Kejela"], [82384, "s", "Klingus"], [82396, "s", "Leudus"], [82408, "s", "Tarsus"], [82420, "s", "Betelgeuse"], [82436, "s", "Orion"], [82448, "s", "Oberon"], [82460, "s", "Umbriel"], [82472, "s", "Murisak"], [82484, "s", "Janus"], [82496, "s", "Seritil"], [82508, "s", "Elas"], [82520, "s", "Sherman"], [82532, "s", "Cheron"], [82544, "s", "Dakel"], [82556, "s", "Oldar"], [82568, "s", "Sarac"], [82580, "s", "Eminiar"], [82592, "s", "Venar"], [82604, "s", "Dyneb"], [82616, "s", "Xidex"], [82628, "s", "RigelB"], [82640, "s", "Syrinx"], [82652, "s", "Luna"], [82664, "s", "Shitface"], [82680, "s", "Hell"], [82692, "s", "Jinx"], [82704, "s", "Ghost 1"], [82716, "s", "Ghost 2"], [82728, "s", "Ghost 3"], [82740, "s", "Ghost 4"], [82752, "s", "Spare 1"], [82764, "s", "class M planet"], [82784, "s", "dead planet"], [82800, "s", "sun"], [82808, "s", "moon"], [82820, "s", "ghost planet"], [82840, "s", "class A planet"], [82860, "s", "class O planet"], [82880, "s", "class Z planet"], [83256, "i", -258169], [83260, "i", -4], [83264, "i", -49], [83268, "i", -3801089], [83272, "i", -14337], [83276, "i", -1], [83280, "i", -789505], [83284, "i", -257], [83288, "i", -513], [83292, "i", -1048577], [83296, "i", -1], [83300, "i", -1], [83304, "i", -8388609], [83308, "i", -20971521], [83312, "i", -24118017], [83316, "i", -1], [83320, "i", -65537], [83324, "i", -9], [83328, "i", -49], [83332, "i", -67], [83336, "i", -115729], [83340, "i", -4], [83344, "i", -17], [83348, "i", -655361], [83352, "i", -14337], [83356, "i", -1], [83360, "i", -2097153], [83364, "i", -4], [83368, "i", -5], [83372, "i", -19627009], [83376, "i", -3145729], [83380, "i", -1], [83384, "i", -1], [83388, "i", -20971521], [83392, "i", -24118017], [83396, "i", -9], [83400, "i", -65537], [83404, "i", -9], [83408, "i", -1], [83412, "i", -3145985], [83416, "i", -377857], [83420, "i", -1], [83424, "i", -17], [83428, "i", -688129], [83432, "i", -14337], [83436, "i", -1], [83440, "i", -2101249], [83444, "i", -4], [83448, "i", -5], [83452, "i", -19627009], [83456, "i", -3145729], [83460, "i", -1], [83464, "i", -1], [83468, "i", -20971521], [83472, "i", -24118017], [83476, "i", -9], [83480, "i", -65537], [83484, "i", -9], [83488, "i", -1], [83492, "i", -3145985], [83496, "i", -361473], [83500, "i", -1], [83504, "i", -129], [83508, "i", -688129], [83512, "i", -14337], [83516, "i", -1], [83520, "i", -2097153], [83524, "i", -4], [83528, "i", -5], [83532, "i", -19627009], [83536, "i", -3145729], [83540, "i", -1], [83544, "i", -1], [83548, "i", -16777217], [83552, "i", -24118145], [83556, "i", -9], [83560, "i", -65537], [83564, "i", -9], [83568, "i", -1], [83572, "i", -3145985], [83576, "i", -295937], [83580, "i", -1], [83584, "i", -129], [83588, "i", -425985], [83592, "i", -30721], [83596, "i", -1], [83600, "i", -2097153], [83604, "i", -4], [83608, "i", -5], [83612, "i", -19627009], [83616, "i", -3145729], [83620, "i", -1], [83624, "i", -1], [83628, "i", -20971521], [83632, "i", -21168318], [83636, "i", -9], [83640, "i", -65537], [83644, "i", -1], [83648, "i", -1], [83652, "i", -3145985], [83656, "i", -263169], [83660, "i", -1], [83664, "i", -129], [83668, "i", -311297], [83672, "i", -22529], [83676, "i", -1], [83680, "i", -2105345], [83684, "i", -4], [83688, "i", -5], [83692, "i", -19627009], [83696, "i", -3145729], [83700, "i", -1], [83704, "i", -1], [83708, "i", -20971521], [83712, "i", -21168318], [83716, "i", -9], [83720, "i", -65537], [83724, "i", -1], [83728, "i", -1], [83732, "i", -3145985], [83736, "i", -263169], [83740, "i", -1], [83744, "i", -129], [83748, "i", -311297], [83752, "i", -22529], [83756, "i", -1], [83760, "i", -2097153], [83764, "i", -4], [83768, "i", -5], [83772, "i", -19627009], [83776, "i", -3145729], [83780, "i", -1], [83784, "i", -1], [83788, "i", -20971521], [83792, "i", -21168318], [83796, "i", -9], [83800, "i", -65537], [83804, "i", -1], [83808, "i", -1], [83812, "i", -3145985], [83816, "i", -263169], [83820, "i", -1], [83824, "i", -129], [83828, "i", -385025], [83832, "i", -30721], [83836, "i", -1], [83840, "i", -2097153], [83844, "i", -4], [83848, "i", -5], [83852, "i", -19627009], [83856, "i", -3145729], [83860, "i", -1], [83864, "i", -1], [83868, "i", -4194305], [83872, "i", -16974014], [83876, "i", -9], [83880, "i", -65537], [83884, "i", -1], [83888, "i", -1], [83892, "i", -3145985], [83896, "i", -263169], [83900, "i", -1], [83904, "i", -129], [83908, "i", -385089], [83912, "i", -26625], [83916, "i", -129], [83920, "i", -2113537], [83924, "i", -4], [83928, "i", -5], [83932, "i", -19627009], [83936, "i", -3145729], [83940, "i", -1], [83944, "i", -1], [83948, "i", -20971521], [83952, "i", -16974014], [83956, "i", -9], [83960, "i", -1], [83964, "i", -1], [83968, "i", -1], [83972, "i", -3145985], [83976, "i", -263169], [83980, "i", -1], [83984, "i", -129], [83988, "i", -520257], [83992, "i", -28673], [83996, "i", -129], [84000, "i", -2097153], [84004, "i", -4], [84008, "i", -5], [84012, "i", -19627009], [84016, "i", -3145729], [84020, "i", -1], [84024, "i", -1], [84028, "i", -20971521], [84032, "i", -4423870], [84036, "i", -9], [84040, "i", -1], [84044, "i", -1], [84048, "i", -1], [84052, "i", -3145985], [84056, "i", 10], [84060, "i", 10], [84064, "i", 4], [84068, "i", 7], [84072, "i", 9], [84076, "i", 8], [84080, "i", 5], [84084, "i", 6], [84088, "i", 10], [84092, "i", 4], [84096, "i", 12], [84100, "i", 12], [84104, "i", 13], [84108, "i", 14], [84112, "i", 15], [84116, "i", 16], [84120, "i", 16], [84124, "i", 24], [84128, "i", 23], [84132, "i", 3], [84136, "i", 20], [84140, "i", 20], [84144, "i", 22], [84148, "i", 21], [84152, "i", 2], [84156, "i", 1], [84160, "i", 1], [84164, "i", 1], [84168, "i", 1], [84172, "i", 1], [84176, "i", 1], [84180, "i", 1], [84188, "s", "Romulan"], [84196, "s", "Colossus"], [84216, "s", "HAL 9000"], [84236, "s", "Federation"], [84247, "s", "M-5"], [84260, "s", "Klingon"], [84268, "s", "Guardian"], [84332, "s", "non"], [84344, "s", "Empire"], [84360, "s", " attacking"], [84371, "s", ", armies="], [84480, "s", "INTRUDER ALERT - "], [84572, "s", " \\|/ "], [84596, "s", "-- --"], [84602, "s", " /|\\ "], [84608, "s", " .-. "], [84614, "s", "(   )"], [84620, "s", " `-' "], [84626, "s", "     "], [84632, "s", " ( ) "], [84638, "s", " %%% "], [84644, "s", "%%%%%"], [84650, "s", "/===\\"], [84656, "s", "===O="], [84662, "s", "\\===/"], [84668, "s", " ??? "], [84674, "s", "?????"], [84712, "s", "putship: Failed retry maximum on ship %d"], [84850, "s", "nobody"], [84857, "s", "Comp"], [84862, "s", "???"], [84866, "s", "->"], [84869, "s", "you"], [84873, "s", "ALL"], [84877, "s", "IMPs"], [84896, "s", "Message to: "], [84909, "s", "Not found."], [84920, "s", "I don't understand."], [84940, "i", -101], [84944, "c", 0], [85144, "s", "All"], [85148, "s", "Implementors"], [85208, "s", "Message to "], [85228, "s", "s:"], [85231, "s", "everyone:"], [85241, "s", "GOD:"], [85246, "s", "The Implementors:"], [85268, "s", " (ESCAPE to abort)"], [85300, "c", 62], [85312, "s", "Communique from "], [85329, "s", " on board "], [85596, "s", "Weapons overload."], [85632, "s", "Engines super-heated."], [85720, "s", "big num"], [85732, "s", "twenty"], [85739, "s", "thirty"], [85746, "s", "forty"], [85752, "s", "fifty"], [85758, "s", "sixty"], [85764, "s", "seventy"], [85772, "s", "eighty"], [85779, "s", "ninety"], [85792, "s", "zero"], [85797, "s", "one"], [85801, "s", "two"], [85805, "s", "three"], [85811, "s", "four"], [85816, "s", "five"], [85821, "s", "six"], [85825, "s", "seven"], [85831, "s", "eight"], [85837, "s", "nine"], [85842, "s", "ten"], [85846, "s", "eleven"], [85853, "s", "twelve"], [85860, "s", "thirteen"], [85869, "s", "fourteen"], [85878, "s", "fifteen"], [85886, "s", "sixteen"], [85894, "s", "seventeen"], [85904, "s", "eighteen"], [85913, "s", "nineteen"], [85936, "s", "Sunday"], [85943, "s", "Monday"], [85950, "s", "Tuesday"], [85958, "s", "Wednesday"], [85968, "s", "Thursday"], [85977, "s", "Friday"], [85984, "s", "Saturday"], [85993, "s", "January"], [86001, "s", "February"], [86010, "s", "March"], [86016, "s", "April"], [86022, "s", "May"], [86026, "s", "June"], [86031, "s", "July"], [86036, "s", "August"], [86043, "s", "September"], [86053, "s", "October"], [86061, "s", "November"], [86070, "s", "December"], [86084, "s", ", at "], [86096, "s", "o'clock"], [86104, "s", "o "], [86112, "s", "ante"], [86117, "s", "post"], [86122, "s", " meridiem"], [86132, "s", "off"], [86136, "s", "entering"], [86145, "s", "live"], [86150, "s", "dying"], [86156, "s", "dead"], [86161, "s", "reserved"], [86170, "s", "Captain"], [86178, "s", "Centurion"], [86188, "s", "Commander"], [86198, "s", "Kommander"], [86208, "s", "dewqazxc"], [86352, "s", "Are you sure? "], [86576, "s", "%d %2d:%02d"], [86652, "s", "%d %2d:%02d:%02d"], [86724, "s", "Jan"], [86733, "s", "Feb"], [86737, "s", "Mar"], [86741, "s", "Apr"], [86745, "s", "Jun"], [86749, "s", "Jul"], [86753, "s", "Aug"], [86757, "s", "Sep"], [86761, "s", "Oct"], [86765, "s", "Nov"], [86769, "s", "Dec"], [86773, "s", "%2d:%02d:%02d %02d%s%02d"], [87136, "s", "--- press space for more ---"], [87185, "s", "--- press space when done ---"], [87680, "s", "nes"], [87688, "s", "nfp"], [87696, "s", "nep"], [87704, "s", "ns"], [87712, "s", "np"], [87720, "s", "nts"], [87728, "s", "nap"], [87736, "s", "wp"], [87744, "s", "ntp"], [87752, "s", "nrp"], [87760, "s", "hp"], [87974, "s", "WARNING: You have violated %s space; prepare to die."], [88027, "s", "displayai: %2d "], [88180, "s", ", %s\n"], [88416, "s", "Give me drugs."], [88436, "s", "I'm on drugs."], [88450, "s", "executeai: Unknown token %s\n"], [88680, "s", "Hey sucker, eat me!"], [88700, "s", "Take off, eh?"], [88714, "s", "Go get some drugs."], [88733, "s", "Your mother was an Orion prostitute!"], [88770, "s", "Come over here and say that."], [88799, "s", "Say that over here and come."], [88828, "s", "Hey, how much?"], [88843, "s", "That's easy for you to say."], [88871, "s", "I'm hand machined by native craftsmen with pride in their work."], [88935, "s", "Yes, but do you have the right stuff?"], [88973, "s", "Which way to the beach?"], [88997, "s", "Come, come now."], [89013, "s", "Ohhhh! And for you, a puppy!"], [89042, "s", "I can hear you talking, but you can't come in."], [89089, "s", "No one expects the Spanish inquisition."], [89129, "s", "I bet you say that to all the boys."], [89165, "s", "Feep!"], [89171, "s", "Feel it with M Dung."], [89192, "s", "Lower your shields and I will kill you quickly."], [89240, "s", "Do not worry about birth control devices, I have many."], [89295, "s", "I bet you only talk big."], [89320, "s", "Kiss my ram memory."], [89340, "s", "Do you think we can use battery operated devices under water?"], [89402, "s", "Nothing shocks me - I'm a robot."], [89435, "s", "Ok, eh?"], [89443, "s", "Good day."], [89453, "s", "You gotta drink lots of beer, eh?"], [89487, "s", "It's not so bad. You could have been killed already."], [89540, "s", "I want a new drug."], [89559, "s", "Swell."], [89566, "s", "Sound impressive? It should. It is."], [89602, "s", "Oh day, you aye!"], [89619, "s", "It's not my god damn planet, monkey boy!"], [89660, "s", "Character is what you are in the dark."], [89699, "s", "Remember, wherever you go, there you are."], [89741, "s", "Don't aim for my gonads!"], [89766, "s", "Mooooo!"], [89774, "s", "How about a nice Hawaiian Punch?"], [89807, "s", "Book him, Dano. Murder One."], [89835, "s", "Eat hot torps, sucker."], [89858, "s", "Use the force, Luke."], [89879, "s", "Nobody told ME about it and I'm not a moron, eh?"], [89928, "s", "How's it goin', eh?"], [89948, "s", "Your documentation no longer confuses me, old version."], [90003, "s", "Home is where you wear your hat."], [90036, "s", "I feel so broke up, I want to go home."], [90075, "s", "Go on, give it to me. I know you want to."], [90117, "s", "It never occured to me to eat Spam."], [90153, "s", "We get hung over, but we always survive."], [90194, "s", "Life's the same, except for my shoes."], [90232, "s", "You have my gratitude."], [90255, "s", "We are building a force of extraordinary magnitude."], [90307, "s", "Come and get it."], [90324, "s", "Piece of cake."], [90339, "s", "NOOP"], [90344, "s", "GOHOME"], [90351, "s", "GOREPAIR"], [90360, "s", "ALLOCATE"], [90369, "s", "DETONATE"], [90378, "s", "MYDETONATE"], [90389, "s", "PHASER"], [90396, "s", "TORPEDO"], [90404, "s", "BURST"], [90410, "s", "SHIELD"], [90417, "s", "UNTRACTOR"], [90427, "s", "WARP_0"], [90434, "s", "WARP_2"], [90441, "s", "WARP_5"], [90448, "s", "WARP_8"], [90455, "s", "TRACK"], [90461, "s", "SLIENT"], [90468, "s", "MESSAGE"], [90476, "s", "TAKEDRUGS"], [90486, "s", "REPAIR"], [90493, "s", "READMSG"], [90501, "s", "INSULT"], [90508, "s", "GOFUEL"], [90515, "s", "RUNAWAY"], [90523, "s", "<%d>"], [90678, "s", "Coming into orbit around %s."], [90720, "s", "Approaching %s - commencing orbital insertion maneuver."], [90900, "s", "Weapons are back on-line."], [90932, "s", "Engines are now functional."], [107932, "l", 0], [107936, "l", -1], [107940, "l", 0], [107944, "l", -1], [107948, "l", 0], [107952, "l", -1], [107956, "l", 0], [107960, "l", -1], [107964, "l", 0], [107968, "l", -1], [107972, "l", 0], [107976, "l", -1], [107980, "l", 0], [107984, "l", -1], [107988, "l", 0], [107992, "l", -1], [107996, "l", 0], [108000, "l", -1], [108004, "l", 0], [108008, "l", -1], [108012, "l", 0], [108016, "l", -1], [108020, "l", 0], [108024, "l", -1], [108028, "l", 0], [108032, "l", -1], [108036, "l", 0], [108040, "l", -1], [108044, "l", 0], [108048, "l", -1], [108052, "l", 0], [108056, "l", -1], [108060, "l", 0], [108064, "l", -1], [108068, "l", 0], [108072, "l", -1], [108076, "l", 0], [108080, "l", -1], [108084, "l", 0], [108088, "l", -1], [108092, "l", 0], [108096, "l", -1], [108100, "l", 0], [108104, "l", -1], [108108, "l", 0], [108112, "l", -1], [108116, "l", 0], [108120, "l", -1], [108124, "l", 0], [108128, "l", -1], [108132, "l", 0], [108136, "l", -1], [108140, "l", 0], [108144, "l", -1], [108148, "l", 0], [108152, "l", -1], [108156, "l", 0], [108160, "l", -1], [108164, "l", 0], [108168, "l", -1], [108172, "l", 0], [108176, "l", -1], [108180, "l", 0], [108184, "l", -1], [108188, "l", 0], [108192, "l", 0], [108196, "l", -1], [108200, "l", -1], [108204, "l", 0], [108208, "l", 0], [108212, "l", -1], [108216, "l", -1], [108220, "l", 0], [108224, "l", 0], [108228, "l", -1], [108232, "l", -1], [108236, "l", 0], [108240, "l", 0], [108244, "l", -1], [108248, "l", -1], [108252, "l", 0], [108256, "l", 0], [108260, "l", -1], [108264, "l", -1], [108268, "l", 0], [108272, "l", 0], [108276, "l", -1], [108280, "l", -1], [108284, "l", 0], [108288, "l", 0], [108292, "l", -1], [108296, "l", -1], [108300, "l", 0], [108304, "l", 0], [108308, "l", -1], [108312, "l", -1], [108316, "l", 0], [108320, "l", 0], [108324, "l", -1], [108328, "l", -1], [108332, "l", 0], [108336, "l", 0], [108340, "l", -1], [108344, "l", -1], [108348, "l", 0], [108352, "l", 0], [108356, "l", -1], [108360, "l", -1], [108364, "l", 0], [108368, "l", 0], [108372, "l", -1], [108376, "l", -1], [108380, "l", 0], [108384, "l", 0], [108388, "l", -1], [108392, "l", -1], [108396, "l", 0], [108400, "l", 0], [108404, "l", -1], [108408, "l", -1], [108412, "l", 0], [108416, "l", 0], [108420, "l", -1], [108424, "l", -1], [108428, "l", 0], [108432, "l", 0], [108436, "l", -1], [108440, "l", -1], [108444, "l", 0], [108448, "l", 0], [108452, "l", 0], [108456, "l", 0], [108460, "l", -1], [108464, "l", -1], [108468, "l", -1], [108472, "l", -1], [108476, "l", 0], [108480, "l", 0], [108484, "l", 0], [108488, "l", 0], [108492, "l", -1], [108496, "l", -1], [108500, "l", -1], [108504, "l", -1], [108508, "l", 0], [108512, "l", 0], [108516, "l", 0], [108520, "l", 0], [108524, "l", -1], [108528, "l", -1], [108532, "l", -1], [108536, "l", -1], [108540, "l", 0], [108544, "l", 0], [108548, "l", 0], [108552, "l", 0], [108556, "l", -1], [108560, "l", -1], [108564, "l", -1], [108568, "l", -1], [108572, "l", 0], [108576, "l", 0], [108580, "l", 0], [108584, "l", 0], [108588, "l", -1], [108592, "l", -1], [108596, "l", -1], [108600, "l", -1], [108604, "l", 0], [108608, "l", 0], [108612, "l", 0], [108616, "l", 0], [108620, "l", -1], [108624, "l", -1], [108628, "l", -1], [108632, "l", -1], [108636, "l", 0], [108640, "l", 0], [108644, "l", 0], [108648, "l", 0], [108652, "l", -1], [108656, "l", -1], [108660, "l", -1], [108664, "l", -1], [108668, "l", 0], [108672, "l", 0], [108676, "l", 0], [108680, "l", 0], [108684, "l", -1], [108688, "l", -1], [108692, "l", -1], [108696, "l", -1], [108700, "l", 0], [108704, "l", 0], [108708, "l", 0], [108712, "l", 0], [108716, "l", 0], [108720, "l", 0], [108724, "l", 0], [108728, "l", 0], [108732, "l", -1], [108736, "l", -1], [108740, "l", -1], [108744, "l", -1], [108748, "l", -1], [108752, "l", -1], [108756, "l", -1], [108760, "l", -1], [108764, "l", 0], [108768, "l", 0], [108772, "l", 0], [108776, "l", 0], [108780, "l", 0], [108784, "l", 0], [108788, "l", 0], [108792, "l", 0], [108796, "l", -1], [108800, "l", -1], [108804, "l", -1], [108808, "l", -1], [108812, "l", -1], [108816, "l", -1], [108820, "l", -1], [108824, "l", -1], [108828, "l", 0], [108832, "l", 0], [108836, "l", 0], [108840, "l", 0], [108844, "l", 0], [108848, "l", 0], [108852, "l", 0], [108856, "l", 0], [108860, "l", -1], [108864, "l", -1], [108868, "l", -1], [108872, "l", -1], [108876, "l", -1], [108880, "l", -1], [108884, "l", -1], [108888, "l", -1], [108892, "l", 0], [108896, "l", 0], [108900, "l", 0], [108904, "l", 0], [108908, "l", 0], [108912, "l", 0], [108916, "l", 0], [108920, "l", 0], [108924, "l", -1], [108928, "l", -1], [108932, "l", -1], [108936, "l", -1], [108940, "l", -1], [108944, "l", -1], [108948, "l", -1], [108952, "l", -1], [108956, "l", 0], [108960, "l", 0], [108964, "l", 0], [108968, "l", 0], [108972, "l", 0], [108976, "l", 0], [108980, "l", 0], [108984, "l", 0], [108988, "l", 0], [108992, "l", 0], [108996, "l", 0], [109000, "l", 0], [109004, "l", 0], [109008, "l", 0], [109012, "l", 0], [109016, "l", 0], [109020, "l", -1], [109024, "l", -1], [109028, "l", -1], [109032, "l", -1], [109036, "l", -1], [109040, "l", -1], [109044, "l", -1], [109048, "l", -1], [109052, "l", -1], [109056, "l", -1], [109060, "l", -1], [109064, "l", -1], [109068, "l", -1], [109072, "l", -1], [109076, "l", -1], [109080, "l", -1], [109084, "l", 0], [109088, "l", 0], [109092, "l", 0], [109096, "l", 0], [109100, "l", 0], [109104, "l", 0], [109108, "l", 0], [109112, "l", 0], [109116, "l", 0], [109120, "l", 0], [109124, "l", 0], [109128, "l", 0], [109132, "l", 0], [109136, "l", 0], [109140, "l", 0], [109144, "l", 0], [109148, "l", -1], [109152, "l", -1], [109156, "l", -1], [109160, "l", -1], [109164, "l", -1], [109168, "l", -1], [109172, "l", -1], [109176, "l", -1], [109180, "l", -1], [109184, "l", -1], [109188, "l", -1], [109192, "l", -1], [109196, "l", -1], [109200, "l", -1], [109204, "l", -1], [109208, "l", -1], [109212, "l", 0], [109216, "l", 0], [109220, "l", 0], [109224, "l", 0], [109228, "l", 0], [109232, "l", 0], [109236, "l", 0], [109240, "l", 0], [109244, "l", 0], [109248, "l", 0], [109252, "l", 0], [109256, "l", 0], [109260, "l", 0], [109264, "l", 0], [109268, "l", 0], [109272, "l", 0], [109276, "l", 0], [109280, "l", 0], [109284, "l", 0], [109288, "l", 0], [109292, "l", 0], [109296, "l", 0], [109300, "l", 0], [109304, "l", 0], [109308, "l", 0], [109312, "l", 0], [109316, "l", 0], [109320, "l", 0], [109324, "l", 0], [109328, "l", 0], [109332, "l", 0], [109336, "l", 0], [109340, "l", -1], [109344, "l", -1], [109348, "l", -1], [109352, "l", -1], [109356, "l", -1], [109360, "l", -1], [109364, "l", -1], [109368, "l", -1], [109372, "l", -1], [109376, "l", -1], [109380, "l", -1], [109384, "l", -1], [109388, "l", -1], [109392, "l", -1], [109396, "l", -1], [109400, "l", -1], [109404, "l", -1], [109408, "l", -1], [109412, "l", -1], [109416, "l", -1], [109420, "l", -1], [109424, "l", -1], [109428, "l", -1], [109432, "l", -1], [109436, "l", -1], [109440, "l", -1], [109444, "l", -1], [109448, "l", -1], [109452, "l", -1], [109456, "l", -1], [109460, "l", -1], [109464, "l", -1], [109584, "s", "\r\n"], [109684, "s", "cdinit: You cannot run from a hardcopy terminal."], [109733, "s", "cdinit: Either direct or relative cursor addressing is required."], [109798, "s", "cdinit: Your terminal doesn't have clear screen."], [109940, "s", "%%%dd"], [110056, "s", "%%%dg"], [112980, "s", "TERM"], [113017, "s", "scinit: Environment TERM undefined."], [113196, "s", "scinit: Can't open termcap file %s"], [113240, "s", "scinit: Unknown terminal type \"%s\""], [113420, "s", "scinit: enfldn() failed"], [113456, "s", "()-"], [113460, "s", "()|"], [113464, "s", "()+"], [113740, "s", "lins#"], [113746, "s", "24"], [113749, "s", "cols#"], [113755, "s", "80"], [113758, "s", "beep="], [113764, "c", 7], [113766, "s", "autonl"], [113773, "s", "bs"], [113776, "s", "()X"], [113848, "s", "att="], [113853, "s", "bol="], [113858, "s", "cel="], [113863, "s", "chscroll="], [113873, "s", "clear="], [113880, "s", "dlc="], [113885, "s", "dll="], [113890, "s", "down="], [113896, "s", "f0="], [113900, "s", "f1="], [113904, "s", "f2="], [113908, "s", "f3="], [113912, "s", "f4="], [113916, "s", "f5="], [113920, "s", "f6="], [113924, "s", "f7="], [113928, "s", "f8="], [113932, "s", "f9="], [113936, "s", "hardcopy"], [113945, "s", "home="], [113951, "s", "iim="], [113956, "s", "ikey="], [113962, "s", "inc="], [113967, "s", "init="], [113973, "s", "inl="], [113978, "s", "k0="], [113982, "s", "k1="], [113986, "s", "k2="], [113990, "s", "k3="], [113994, "s", "k4="], [113998, "s", "k5="], [114002, "s", "k6="], [114006, "s", "k7="], [114010, "s", "k8="], [114014, "s", "k9="], [114018, "s", "kcomma="], [114026, "s", "kdown="], [114033, "s", "kenter="], [114041, "s", "kleft="], [114048, "s", "kminus="], [114056, "s", "kperiod="], [114065, "s", "kright="], [114073, "s", "kup="], [114078, "s", "left="], [114084, "s", "lsegd="], [114096, "s", "lsegl="], [114108, "s", "lsegld="], [114120, "s", "lsegu="], [114132, "s", "lsegud="], [114144, "s", "lsegul="], [114156, "s", "lseguld="], [114172, "s", "lsegr="], [114184, "s", "lsegrd="], [114196, "s", "lsegrl="], [114208, "s", "lsegrld="], [114224, "s", "lsegru="], [114236, "s", "lsegrud="], [114252, "s", "lsegrul="], [114268, "s", "lsegruld="], [114284, "s", "lshigh"], [114291, "s", "move="], [114297, "s", "noautonl"], [114306, "s", "notilde"], [114314, "s", "oim="], [114319, "s", "okey="], [114325, "s", "overstrike"], [114336, "s", "padc="], [114342, "s", "pbeep#"], [114349, "s", "pbol#"], [114355, "s", "pcel#"], [114361, "s", "pclear#"], [114369, "s", "pdlc#"], [114375, "s", "pdll#"], [114381, "s", "pdown#"], [114388, "s", "pillow="], [114400, "s", "pinc#"], [114406, "s", "pinl#"], [114412, "s", "psdown#"], [114420, "s", "psup#"], [114426, "s", "ptab#"], [114432, "s", "right="], [114439, "s", "sdown="], [114446, "s", "sup="], [114451, "s", "tab="], [114456, "s", "up="], [114460, "s", "visdel"], [114467, "s", "wrtop"], [114473, "s", "xonoff"], [114480, "s", "+LIB/termcap"], [114652, "s", "hurbga"], [114968, "s", "hurbga"], [115076, "s", "scattexec()"], [115132, "s", "scattset()"], [115143, "s", "scbol()"], [115151, "s", "sccel()"], [115159, "s", "scchscroll()"], [115176, "s", "scclear()"], [115196, "s", "scdlc()"], [115204, "s", "scdll()"], [115212, "s", "scdown()"], [115228, "s", "scgraphics(1)"], [115242, "s", "scgraphics(2)"], [115256, "s", "schome()"], [115265, "s", "sciim()"], [115273, "s", "scikey()"], [115282, "s", "scinc()"], [115290, "s", "scinl()"], [115298, "s", "scleft()"], [115312, "s", "scmove()"], [115352, "s", "scoim()"], [115360, "s", "scoffatt()"], [115371, "s", "scokey()"], [115380, "s", "sconatt()"], [115390, "s", "scright()"], [115404, "s", "scsdown()"], [115414, "s", "scsup()"], [115422, "s", "sctab()"], [115430, "s", "scup()"], [115457, "s", "scputf()"], [115685, "s", "scunget()"], [115695, "s", "sclb$"], [115701, "s", ": Fatal internal error."], [119188, "s", "\b \b"], [119312, "s", "drpexit(): Driver didn't exit; pid = %08x"], [119444, "s", "%s: Can't open."], [119480, "s", "Mail not available"], [119499, "s", "leres,jef,marshall"], [119524, "s", "It is not possible to contact the Implementors."], [119572, "s", "leres,jef,marshall"], [119591, "s", "No news is good news."], [119984, "s", "%s\n"]];
var $EXT={"c_conq_conqdriv": 64, "c_conq_termcap": 89, "c_conq_gods": 110, "c_conq_newsfile": 117, "c_conq_helpfile": 142, "c_conq_gamcron": 167, "c_conq_conquest": 188, "c_conq_antigods": 201, "c_conq_badttys": 226};
var $STAMP=861104;
var $COMMON={"conqcom2": {"cunum": [320, "integer"], "csnum": [324, "integer"], "cpid": [328, "integer"], "childpid": [332, "integer"], "cmaxlin": [336, "integer"], "cmaxcol": [340, "integer"], "ctimflag": [344, "integer"], "ctimid": [348, "integer"], "cmsgrand": [352, "integer"], "cpriority": [356, "integer"], "clastime": [360, "integer"], "csubdcl": [364, "logical"], "cnewsfile": [368, "logical"], "cleave": [372, "logical"], "cdisplay": [376, "logical"], "credraw": [380, "logical"], "cmsgok": [384, "logical"], "cbuf": [388, "character"], "clastinfostr": [478, "character"]}, "conqcom": {"commonrev": [596, "integer"], "closed": [600, "logical"], "lockword": [604, "integer"], "lockmesg": [608, "integer"], "conqueror": [612, "character"], "conqteam": [636, "character"], "conqtime": [648, "character"], "lastwords": [668, "character"], "inittime": [728, "character"], "tstats": [748, "integer"], "tcoupinfo": [1068, "logical"], "ccpuseconds": [1084, "integer"], "celapsedseconds": [1088, "integer"], "dcpuseconds": [1092, "integer"], "delapsedseconds": [1096, "integer"], "rcpuseconds": [1100, "integer"], "relapsedseconds": [1104, "integer"], "raccum": [1108, "integer"], "lastupchuck": [1112, "character"], "ulive": [1132, "logical"], "uteam": [1292, "integer"], "umultiple": [1452, "integer"], "ustats": [1612, "integer"], "urating": [4812, "real"], "urobot": [4972, "logical"], "uwar": [5132, "logical"], "uoption": [5772, "logical"], "uooption": [7692, "logical"], "uname": [9612, "character"], "upname": [10892, "character"], "ulastentry": [11852, "character"], "rstrat": [12652, "integer"], "rvec": [13932, "integer"], "pprimary": [14060, "integer"], "porbrad": [14220, "real"], "porbvel": [14380, "real"], "ptype": [14540, "integer"], "preal": [14700, "logical"], "pname": [14860, "character"], "ptname": [15340, "character"], "homeplanet": [15500, "integer"], "homesun": [15516, "integer"], "teamplanets": [15532, "integer"], "armylim": [15580, "integer"], "warplim": [15596, "real"], "engfac": [15612, "real"], "accelfac": [15628, "real"], "weafac": [15644, "real"], "torpwarp": [15660, "real"], "tname": [15676, "character"], "chrplanets": [15772, "character"], "chrtorps": [15780, "character"], "chrteams": [15784, "character"], "couptime": [15792, "integer"], "puninhabtime": [15808, "integer"], "dstatus": [15968, "integer"], "dtype": [15972, "integer"], "dx": [15976, "real"], "dy": [15980, "real"], "ddx": [15984, "real"], "ddy": [15988, "real"], "dhead": [15992, "real"], "dlock": [15996, "integer"], "dname": [16000, "character"], "porbang": [16024, "real"], "px": [16184, "real"], "py": [16344, "real"], "pteam": [16504, "integer"], "parmies": [16664, "integer"], "pscanned": [16824, "logical"], "histptr": [17464, "integer"], "histunum": [17468, "integer"], "histlog": [17628, "character"], "drivstat": [18428, "integer"], "drivpid": [18432, "integer"], "drivcnt": [18436, "integer"], "drivsecs": [18440, "integer"], "drivowner": [18444, "character"], "drivtime": [18476, "integer"], "playtime": [18480, "integer"], "sstatus": [18484, "integer"], "skilledby": [18564, "integer"], "suser": [18644, "integer"], "steam": [18724, "integer"], "spid": [18804, "integer"], "sx": [18884, "real"], "sy": [18964, "real"], "sdx": [19044, "real"], "sdy": [19124, "real"], "shead": [19204, "real"], "sdhead": [19284, "real"], "swarp": [19364, "real"], "sdwarp": [19444, "real"], "slock": [19524, "integer"], "sshup": [19604, "logical"], "sshields": [19684, "real"], "skills": [19764, "real"], "sdamage": [19844, "real"], "sfuel": [19924, "real"], "swtemp": [20004, "real"], "setemp": [20084, "real"], "swfuse": [20164, "integer"], "sefuse": [20244, "integer"], "sweapons": [20324, "integer"], "sengines": [20404, "integer"], "sarmies": [20484, "integer"], "srmode": [20564, "logical"], "scloaked": [20644, "logical"], "soption": [20724, "logical"], "swar": [21684, "logical"], "srwar": [22004, "logical"], "ssrpwar": [22324, "logical"], "ssdfuse": [25524, "integer"], "slastmsg": [25604, "integer"], "salastmsg": [25684, "integer"], "smap": [25764, "logical"], "stowing": [25844, "integer"], "stowedby": [25924, "integer"], "slastblast": [26004, "real"], "slastphase": [26084, "real"], "spfuse": [26164, "integer"], "sscanned": [26244, "integer"], "stalert": [26564, "logical"], "srobot": [26644, "logical"], "saction": [26724, "integer"], "spname": [26804, "character"], "sctime": [27284, "integer"], "setime": [27364, "integer"], "scacc": [27444, "integer"], "seacc": [27524, "integer"], "tstatus": [27604, "integer"], "tfuse": [28324, "integer"], "tx": [29044, "real"], "ty": [29764, "real"], "tdx": [30484, "real"], "tdy": [31204, "real"], "tmult": [31924, "real"], "twar": [32644, "logical"], "msgbuf": [35524, "character"], "msgfrom": [39724, "integer"], "msgto": [39964, "integer"], "lastmsg": [40204, "integer"], "externrobots": [40208, "logical"], "glastmsg": [40212, "integer"]}, "conqmsg": {"to": [84940, "integer"], "msg": [84944, "character"]}, "conqaicommon": {"nenum": [88188, "integer"], "debug": [88192, "logical"], "dne": [88196, "real"], "ane": [88200, "real"]}, "cdcom": {"aimage": [91140, "character"], "alinend": [94340, "integer"], "afont": [94500, "character"], "alin": [97700, "integer"], "acol": [97704, "integer"], "dimage": [97708, "character"], "dlinend": [100908, "integer"], "dfont": [101068, "character"], "dlin": [104268, "integer"], "dcol": [104272, "integer"], "firstcol": [104276, "integer"], "changed": [104436, "logical"], "colcost": [104596, "integer"], "lincost": [105240, "integer"], "trntbl": [105564, "character"], "maxlin": [105820, "integer"], "maxcol": [105824, "integer"], "upline": [105828, "integer"], "afontc": [105832, "character"], "dfontc": [105833, "character"]}, "sclb": {"sclins": [105852, "integer"], "scplins": [105856, "integer"], "sccols": [105860, "integer"], "scpcols": [105864, "integer"], "scprch": [105868, "logical"], "scautonl": [106380, "logical"], "scwrtop": [106384, "logical"], "scxonoff": [106388, "logical"], "schardcopy": [106392, "logical"], "scoverstrike": [106396, "logical"], "scnatt": [106400, "integer"], "scattact": [106404, "integer"], "schasatt": [107268, "logical"], "scpbeep": [107292, "real"], "scpbol": [107296, "real"], "scpcel": [107300, "real"], "scpclear": [107304, "real"], "scpdlc": [107308, "real"], "scpdll": [107312, "real"], "scpdown": [107316, "real"], "scpinc": [107320, "real"], "scpinl": [107324, "real"], "scpsdown": [107328, "real"], "scpsup": [107332, "real"], "scptab": [107336, "real"], "scnbeep": [107340, "integer"], "scnbol": [107344, "integer"], "scncel": [107348, "integer"], "scnclear": [107352, "integer"], "scndlc": [107356, "integer"], "scndll": [107360, "integer"], "scndown": [107364, "integer"], "scninc": [107368, "integer"], "scninl": [107372, "integer"], "scnsdown": [107376, "integer"], "scnsup": [107380, "integer"], "scntab": [107384, "integer"], "scpadc": [107388, "character"], "scispeed": [107392, "real"], "scospeed": [107396, "real"], "sccatt": [107400, "integer"], "sccbeep": [107544, "integer"], "sccbol": [107548, "integer"], "scccel": [107552, "integer"], "sccchscroll": [107556, "integer"], "sccclear": [107560, "integer"], "sccdlc": [107564, "integer"], "sccdll": [107568, "integer"], "sccdown": [107572, "integer"], "scchome": [107576, "integer"], "scciim": [107580, "integer"], "sccikey": [107584, "integer"], "sccinc": [107588, "integer"], "sccinit": [107592, "integer"], "sccinl": [107596, "integer"], "scckey": [107600, "integer"], "sccleft": [107712, "integer"], "sccmove": [107716, "integer"], "sccoim": [107720, "integer"], "sccokey": [107724, "integer"], "sccright": [107728, "integer"], "sccsdown": [107732, "integer"], "sccsup": [107736, "integer"], "scctab": [107740, "integer"], "sccup": [107744, "integer"], "sclshigh": [107748, "logical"], "sccgraphics": [107752, "integer"]}, "sclbi": {"curatt": [110172, "logical"], "desatt": [110196, "logical"], "attg": [110220, "integer"], "attstrat": [110244, "integer"], "attgclear": [110268, "integer"], "attset": [110292, "integer"], "scnotilde": [110316, "logical"], "scvisdel": [110320, "logical"], "scbs": [110324, "logical"], "scnoautonl": [110328, "logical"], "seqatt": [110332, "character"], "seqbeep": [111052, "character"], "seqbol": [111072, "character"], "seqcel": [111092, "character"], "seqchscroll": [111112, "character"], "seqclear": [111132, "character"], "seqdlc": [111152, "character"], "seqdll": [111172, "character"], "seqdown": [111192, "character"], "satgraphics": [111212, "logical"], "seqgraphics": [111596, "character"], "seqhome": [111916, "character"], "seqiim": [111936, "character"], "seqikey": [111956, "character"], "seqinc": [111976, "character"], "seqinit": [111996, "character"], "seqinl": [112128, "character"], "seqkey": [112148, "character"], "seqleft": [112708, "character"], "seqmove": [112728, "character"], "seqoim": [112748, "character"], "seqokey": [112768, "character"], "seqpillow": [112788, "character"], "seqright": [112808, "character"], "seqsdown": [112828, "character"], "seqsup": [112848, "character"], "seqtab": [112868, "character"], "sequp": [112888, "character"], "inbufp": [112908, "integer"], "inbuf": [112912, "character"], "debug": [112932, "logical"]}, "enlbcm": {"file": [115728, "integer"], "numfields": [115732, "integer"], "fieldstart": [115736, "integer"], "fieldlen": [116136, "integer"], "entry": [116536, "character"]}, "rndcom": {"value1": [118104, "integer"], "value2": [118108, "integer"], "mult1": [118112, "integer"], "mult2": [118116, "integer"], "inc1": [118120, "integer"], "inc2": [118124, "integer"], "modu1": [118128, "integer"], "modu2": [118132, "integer"], "table": [118136, "integer"]}};
/* CONQUEST.R: program conquest */
function* R_conquest(){
  H.conqinit();
  R_rndini((I[142]=0,568),(I[143]=0,572));
  R_cdinit();
  I[84]=R_cdlins((I[144]=0,576));
  I[85]=R_cdcols((I[145]=0,580));
  I[147]=(((H.ioautobroad((I[146]=(false?-1:0),584)))?true:false)?-1:0);
  I[81]=0;
  if((((yield* R_welcome(320)))?true:false)){
    (yield* R_menu());
  }
  I[147]=(((H.ioautobroad((I[148]=(true?-1:0),592)))?true:false)?-1:0);
  (yield* R_drpexit());
  R_cdend();
  R_conqend();
  return;
}
/* CONQUEST.R: function capentry */
function* R_capentry($p0,$p1){
  I[16534]=1;
  L1:for(;(I[16534]<=4);I[16534]=((I[16534]+1)|0)){
    I[((66140+(I[16534]-1)*4))>>2]=(false?-1:0);
    I[16539]=1;
    L2:for(;(I[16539]<=3);I[16539]=((I[16539]+1)|0)){
      if((I[((16504+(I[((15532+(I[16534]+Math.imul(I[16539],4)-5)*4))>>2]-1)*4))>>2]!==I[((18724+(I[($p0)>>2]-1)*4))>>2])){
        continue L1;
      }
    }
    I[((66140+(I[16534]-1)*4))>>2]=(true?-1:0);
  }
  I[((66140+(I[((18724+(I[($p0)>>2]-1)*4))>>2]-1)*4))>>2]=(true?-1:0);
  I[16539]=0;
  I[16534]=1;
  L3:for(;(I[16534]<=4);I[16534]=((I[16534]+1)|0)){
    if(((I[((66140+(I[16534]-1)*4))>>2]&1)!==0)){
      I[16539]=((I[16539]+1)|0);
    }
  }
  if((I[16539]<=1)){
    I[($p1)>>2]=I[((18724+(I[($p0)>>2]-1)*4))>>2];
    I[16533]=(true?-1:0);
    return ((I[16533]&1)!==0);
  }
  H.strcpy(66160,388);
  I[16534]=1;
  L4:for(;(I[16534]<=4);I[16534]=((I[16534]+1)|0)){
    if(((I[((66140+(I[16534]-1)*4))>>2]&1)!==0)){
      H.appstr(66179,388);
      H.appstr((15676+1+Math.imul(I[16534],12)-13),388);
    }
  }
  I[16534]=H.index(388,(I[16546]=44,66184));
  if((I[16534]>0)){
    B[(388+I[16534]-1)]=58;
  }
  R_cdclrl((I[16547]=23,66188),(I[16548]=2,66192));
  R_cdputc(388,(I[16549]=23,66196));
  R_cdmove((I[16550]=1,66200),(I[16551]=1,66204));
  R_cdplay((I[16552]=(true?-1:0),66208));
  L5:while(((R_stillalive(324))?true:false)){
    if((!(((yield* H.iogtimed(66212,(I[16554]=1,66216))))?true:false))){
      continue L5;
    }
    S6:switch(B[66212]){
      case 13:case 27:{
        I[16533]=(false?-1:0);
        return ((I[16533]&1)!==0);
        break S6;
      }
      case 10:{
        I[($p1)>>2]=I[((18724+(I[($p0)>>2]-1)*4))>>2];
        I[16533]=(true?-1:0);
        return ((I[16533]&1)!==0);
        break S6;
      }
      default:{
        I[16534]=1;
        L7:for(;(I[16534]<=4);I[16534]=((I[16534]+1)|0)){
          if(((B[(15784+I[16534]-1)]===H.cupper(66212))&&((I[((66140+(I[16534]-1)*4))>>2]&1)!==0))){
            I[($p1)>>2]=I[16534];
            I[16533]=(true?-1:0);
            return ((I[16533]&1)!==0);
          }
        }
        R_scbeep();
        R_cdplay((I[16555]=(true?-1:0),66220));
      }
    }
  }
  I[16533]=(false?-1:0);
  return ((I[16533]&1)!==0);
  return ((I[16533]&1)!==0);
}
/* CONQUEST.R: subroutine command */
function* R_command($p0){
  S1:switch(B[$p0]){
    case 48:case 49:case 50:case 51:case 52:case 53:case 54:case 55:case 56:case 57:case 61:{
      if((B[$p0]===61)){
        F[16556]=Math.fround(10.0);
      }else{
        I[16557]=((B[$p0]-48)|0);
        F[16556]=Math.fround(I[16557]);
      }
      R_dowarp(324,66224);
      break S1;
    }
    case 97:{
      if(((I[((7692+(I[((18644+(I[81]-1)*4))>>2]+Math.imul(7,40)-41)*4))>>2]&1)!==0)){
        (yield* R_doautopilot(324));
      }else{
        (yield* R_ioeat());
        R_scbeep();
        R_putmsg(66232,(I[16563]=24,66252));
        break S1;
      }
      break S1;
    }
    case 65:{
      (yield* R_doalloc(324));
      H.stoptimer();
      if(((R_stillalive(324))?true:false)){
        R_display(324);
      }
      H.settimer();
      break S1;
    }
    case 98:{
      (yield* R_dobeam(324));
      break S1;
    }
    case 66:{
      (yield* R_dobomb(324));
      break S1;
    }
    case 67:{
      (yield* R_docloak(324));
      break S1;
    }
    case 100:{
      R_dodet(324);
      break S1;
    }
    case 68:{
      R_domydet(324);
      break S1;
    }
    case 69:{
      (yield* R_dodistress(324));
      break S1;
    }
    case 102:{
      (yield* R_dophase(324));
      break S1;
    }
    case 70:{
      R_dolastphase(324);
      break S1;
    }
    case 104:{
      I[95]=(true?-1:0);
      H.stoptimer();
      (yield* R_dohelp(364));
      if(((R_stillalive(324))?true:false)){
        R_display(324);
      }
      H.settimer();
      break S1;
    }
    case 72:{
      I[95]=(true?-1:0);
      H.stoptimer();
      (yield* R_histlist((I[16564]=(false?-1:0),66256)));
      if(((R_stillalive(324))?true:false)){
        R_display(324);
      }
      H.settimer();
      break S1;
    }
    case 105:{
      (yield* R_doinfo(324));
      break S1;
    }
    case 73:{
      (yield* R_dooption(324,(I[16565]=(true?-1:0),66260)));
      break S1;
    }
    case 107:{
      (yield* R_docourse(324));
      break S1;
    }
    case 75:{
      (yield* R_docoup(324));
      break S1;
    }
    case 76:{
      (yield* R_doreview(324));
      break S1;
    }
    case 109:{
      (yield* R_sendmsg(324,(20724+(I[81]+Math.imul(6,20)-21)*4)));
      break S1;
    }
    case 77:{
      I[((25764+(I[81]-1)*4))>>2]=((!((I[((25764+(I[81]-1)*4))>>2]&1)!==0))?-1:0);
      H.stoptimer();
      R_display(324);
      H.settimer();
      break S1;
    }
    case 78:{
      (yield* R_pseudo(320,324));
      break S1;
    }
    case 111:{
      R_doorbit(324);
      break S1;
    }
    case 80:{
      (yield* R_doburst(324));
      break S1;
    }
    case 112:{
      (yield* R_dotorp(324));
      break S1;
    }
    case 81:{
      (yield* R_doselfdest());
      break S1;
    }
    case 82:{
      if((!((I[((20644+(I[81]-1)*4))>>2]&1)!==0))){
        R_cdclrl((I[16566]=23,66264),(I[16567]=2,66268));
        I[((20564+(I[81]-1)*4))>>2]=(true?-1:0);
        F[((19444+(I[81]-1)*4))>>2]=Math.fround(0.0);
      }else{
        R_cdclrl((I[16568]=24,66272),(I[16569]=1,66276));
        R_putmsg(66280,(I[16584]=23,66336));
      }
      break S1;
    }
    case 116:{
      (yield* R_dotow(324));
      break S1;
    }
    case 83:{
      I[95]=(true?-1:0);
      H.stoptimer();
      (yield* R_userstats((I[16585]=(false?-1:0),66340)));
      if(((R_stillalive(324))?true:false)){
        R_display(324);
      }
      H.settimer();
      break S1;
    }
    case 84:{
      I[95]=(true?-1:0);
      H.stoptimer();
      (yield* R_doteamlist((18724+(I[81]-1)*4)));
      if(((R_stillalive(324))?true:false)){
        R_display(324);
      }
      H.settimer();
      break S1;
    }
    case 117:{
      (yield* R_dountow(324));
      break S1;
    }
    case 85:{
      I[95]=(true?-1:0);
      H.stoptimer();
      (yield* R_userlist((I[16586]=(false?-1:0),66344)));
      if(((R_stillalive(324))?true:false)){
        R_display(324);
      }
      H.settimer();
      break S1;
    }
    case 87:{
      (yield* R_dowar(324));
      break S1;
    }
    case 45:{
      R_doshields(324,(I[16587]=(false?-1:0),66348));
      H.stoptimer();
      R_display(324);
      H.settimer();
      break S1;
    }
    case 43:{
      R_doshields(324,(I[16588]=(true?-1:0),66352));
      H.stoptimer();
      R_display(324);
      H.settimer();
      break S1;
    }
    case 47:{
      I[95]=(true?-1:0);
      H.stoptimer();
      (yield* R_playlist((I[16589]=(false?-1:0),66356),(I[16590]=(false?-1:0),66360)));
      if(((R_stillalive(324))?true:false)){
        R_display(324);
      }
      H.settimer();
      break S1;
    }
    case 63:{
      I[95]=(true?-1:0);
      H.stoptimer();
      (yield* R_doplanlist(324));
      if(((R_stillalive(324))?true:false)){
        R_display(324);
      }
      H.settimer();
      break S1;
    }
    case 36:{
      if(((I[91]&1)!==0)){
        (yield* H.dosubdcl());
      }else{
        (yield* R_ioeat());
        R_scbeep();
        R_putmsg(66232,(I[16591]=24,66364));
        break S1;
      }
      break S1;
    }
    case 12:{
      R_cdredo();
      break S1;
    }
    case 19:case 17:case 0:{
      break S1;
    }
    default:{
      (yield* R_ioeat());
      R_scbeep();
      R_putmsg(66232,(I[16592]=24,66368));
    }
  }
  return;
}
/* CONQUEST.R: subroutine conqds */
function R_conqds($p0,$p1){
  R_cdclear();
  I[16660]=H.length(66372);
  I[16661]=$idiv(((I[85]-I[16660])|0),2);
  I[16662]=2;
  R_cdputs(66372,66648,66644);
  I[16662]=((I[16662]+1)|0);
  R_cdputs(66427,66648,66644);
  I[16662]=((I[16662]+1)|0);
  R_cdputs(66480,66648,66644);
  I[16662]=((I[16662]+1)|0);
  R_cdputs(66533,66648,66644);
  I[16662]=((I[16662]+1)|0);
  R_cdputs(66586,66648,66644);
  I[16662]=((I[16662]+1)|0);
  R_cdbox((I[16663]=1,66652),(I[16664]=((I[16661]-2)|0),66656),66648,(I[16665]=((((I[16661]+I[16660])|0)+1)|0),66660));
  I[16662]=((I[16662]+1)|0);
  if(((I[150]&1)!==0)){
    R_cdputc(66664,66648);
  }else{
    H.prints(388,66684,66697,66702,66710);
    R_cdputc(388,66648);
  }
  I[16662]=((I[16662]+1)|0);
  R_cdputc(66766,66648);
  I[16661]=13;
  I[16662]=((I[16662]+2)|0);
  I[16694]=I[16662];
  R_cdputs(66780,66648,66644);
  if(((I[92]&1)!==0)){
    I[16662]=((I[16662]+1)|0);
    R_cdputs(66801,66648,66644);
  }
  I[16662]=((I[16662]+1)|0);
  R_cdputs(66821,66648,66644);
  I[16662]=((I[16662]+1)|0);
  R_cdputs(66848,66648,66644);
  I[16662]=((I[16662]+1)|0);
  R_cdputs(66875,66648,66644);
  I[16662]=((I[16662]+1)|0);
  R_cdputs(66897,66648,66644);
  I[16662]=((I[16662]+1)|0);
  R_cdputs(66919,66648,66644);
  I[16662]=((I[16662]+1)|0);
  R_cdputs(66941,66648,66644);
  I[16662]=((I[16662]+1)|0);
  R_cdputs(66964,66648,66644);
  I[16661]=48;
  I[16662]=I[16694];
  R_cdputs(66990,66648,66644);
  if((!((I[($p0)>>2]&1)!==0))){
    I[16662]=((I[16662]+1)|0);
    R_cdputs(67013,66648,66644);
  }
  if((((I[($p0)>>2]&1)!==0)||((I[($p1)>>2]&1)!==0))){
    I[16662]=((I[16662]+1)|0);
    R_cdputs(67042,66648,66644);
  }
  I[16662]=((I[16662]+1)|0);
  R_cdputs(67061,66648,66644);
  I[16662]=((I[16662]+1)|0);
  R_cdputs(67080,66648,66644);
  I[16662]=((I[16662]+1)|0);
  R_cdputs(67098,66648,66644);
  I[16662]=((I[16662]+1)|0);
  R_cdputs(67116,66648,66644);
  return;
}
/* CONQUEST.R: subroutine dead */
function* R_dead($p0,$p1){
  R_cdclear();
  R_cdredo();
  R_cdplay((I[16790]=(false?-1:0),67160));
  if(((I[($p0)>>2]<1)||(I[($p0)>>2]>20))){
    return;
  }
  if((I[((18804+(I[($p0)>>2]-1)*4))>>2]!==I[82])){
    return;
  }
  I[16791]=I[((18564+(I[($p0)>>2]-1)*4))>>2];
  R_grand(67168);
  I[16793]=0;
  L1:while((R_dgrand(67168,67176)<5000)){
    I[16793]=0;
    I[16795]=1;
    L2:for(;(I[16795]<=9);I[16795]=((I[16795]+1)|0)){
      if((I[((27604+(I[($p0)>>2]+Math.imul(I[16795],20)-21)*4))>>2]===4)){
        I[16793]=((I[16793]+1)|0);
      }
    }
    if((I[16793]<=0)){
      break L1;
    }
    (yield* H.sleep((F[16796]=Math.fround(0.1),67184)));
  }
  if((I[16793]>0)){
    H.strcpy(67188,388);
    R_appship($p0,388);
    H.appstr(67195,388);
    R_cerror((I[16807]=((-102)|0),67228),388,67172);
  }
  S3:switch(I[16791]){
    case -100:{
      H.strcpy(67232,388);
      break S3;
    }
    case -101:{
      H.strcpy(67255,388);
      break S3;
    }
    case -102:{
      H.strcpy(67306,388);
      break S3;
    }
    case -103:{
      H.strcpy(67364,388);
      break S3;
    }
    case -104:{
      H.strcpy(67382,388);
      break S3;
    }
    case -105:{
      H.strcpy(67402,388);
      break S3;
    }
    case -108:{
      H.strcpy(67437,388);
      break S3;
    }
    case -106:{
      H.strcpy(67471,388);
      break S3;
    }
    case -107:{
      H.strcpy(67511,388);
      break S3;
    }
    case -109:{
      H.strcpy(67547,388);
      break S3;
    }
    case -110:{
      H.strcpy(67585,388);
      break S3;
    }
    default:{
      if(((I[16791]>=1)&&(I[16791]<=20))){
        H.prints(388,67623,(F[16914]=Math.fround(Math.fround($anint(Math.fround(F[((19764+(I[16791]-1)*4))>>2]*Math.fround(10.0))))/Math.fround(10.0)),67656),(26804+1+Math.imul(I[16791],24)-25));
        R_appship(67164,388);
        H.appchr((I[16915]=41,67660),388);
        if((I[((18484+(I[16791]-1)*4))>>2]!==3)){
          H.appstr(67664,388);
        }else{
          H.appchr((I[16921]=46,67684),388);
        }
      }else{
        if(((((-I[16791])|0)>=1)&&(((-I[16791])|0)<=40))){
          H.concat(67139,(14860+1+Math.imul(((-I[16791])|0),12)-13),388);
          if((I[((14540+(((-I[16791])|0)-1)*4))>>2]===3)){
            H.appstr(67688,388);
          }else{
            H.appstr(67708,388);
          }
        }else{
          H.strcpy(67188,388);
          R_appship($p0,388);
          H.appstr(67731,388);
          R_cerror((I[16938]=((-102)|0),67752),388,67164);
          H.concat(67139,67756,388);
        }
      }
    }
  }
  R_cdputc(388,(I[16950]=8,67800));
  if((I[16791]===((-103)|0))){
    H.prints(388,67804,612,636);
    R_cdputc(388,(I[16962]=10,67848));
  }else{
    if((I[16791]===((-100)|0))){
      I[16793]=I[((20484+(I[($p0)>>2]-1)*4))>>2];
      if((I[16793]>0)){
        H.strcpy(67852,388);
        if((I[16793]===1)){
          H.appstr(67857,388);
        }else{
          if((I[16793]<100)){
            R_appnum(67172,388);
          }else{
            R_appint(67172,388);
          }
          H.appstr(67862,388);
        }
        H.appstr(67870,388);
        if((I[16793]===1)){
          H.appstr(67890,388);
        }else{
          H.appstr(67894,388);
        }
        H.appstr(67899,388);
        R_cdputc(388,(I[16978]=10,67912));
      }
    }else{
      if((I[16791]>0)){
        if((I[((18484+(I[16791]-1)*4))>>2]===3)){
          H.prints(388,67916,(I[16989]=$nint(F[((19684+(I[16791]-1)*4))>>2]),67956),(I[16990]=$nint(F[((19844+(I[16791]-1)*4))>>2]),67960));
          R_cdputc(388,(I[16991]=10,67964));
        }
      }
    }
  }
  H.prints(388,67968,(F[16998]=Math.fround(Math.fround($anint(Math.fround(F[((19764+(I[($p0)>>2]-1)*4))>>2]*Math.fround(10.0))))/Math.fround(10.0)),67992));
  R_cdputc(388,(I[16999]=12,67996));
  R_cdmove((I[17000]=1,68000),(I[17001]=1,68004));
  R_cdplay((I[17002]=(false?-1:0),68008));
  if((((!(((I[($p1)>>2]&1)!==0)&&(I[16791]===((-100)|0))))&&(I[16791]!==((-105)|0)))&&(I[16791]!==((-104)|0)))){
    (yield* H.sleep((F[17003]=Math.fround(4.0),68012)));
  }
  I[16793]=1;
  L4:for(;((I[16793]<=10)&&(I[((18484+(I[($p0)>>2]-1)*4))>>2]===4));I[16793]=((I[16793]+1)|0)){
    (yield* H.sleep((F[17004]=Math.fround(1.0),68016)));
  }
  I[((18484+(I[($p0)>>2]-1)*4))>>2]=6;
  I[((25524+(I[($p0)>>2]-1)*4))>>2]=((-300)|0);
  I[((18564+(I[($p0)>>2]-1)*4))>>2]=0;
  S5:switch(I[16791]){
    case -102:{
      L6:do{
        R_cdclear();
        R_cdredo();
        B[68020]=(yield* R_cdgetx(68021,(I[17010]=14,68040),(I[17011]=1,68044),68048,668,(I[17013]=60,68052)));
        R_cdclear();
        R_cdredo();
        if((B[(668+1-1)]!==0)){
          R_cdputc(68056,(I[17022]=13,68088));
          H.prints(388,68092,(I[17025]=34,68100),668,(I[17026]=34,68104));
          R_cdputc(388,(I[17027]=14,68108));
        }else{
          R_cdputc(68112,(I[17040]=14,68160));
        }
        B[68020]=(yield* R_getcx(68164,(I[17048]=16,68192),(I[17049]=0,68196),68048,388,(I[17050]=10,68200)));
      }while(!((B[68020]===10)));
      break S5;
    }
    case -100:case -104:case -105:{
      break S5;
    }
    default:{
      (yield* R_ioeat());
      R_putpmt(68204,(I[17059]=24,68236));
      R_cdplay((I[17060]=(true?-1:0),68240));
      L7:while(((!(((yield* H.iogtimed(68020,(I[17061]=1,68244))))?true:false))&&((R_stillalive(324))?true:false))){
      }
    }
  }
  R_cdmove((I[17062]=1,68248),(I[17063]=1,68252));
  I[16793]=1;
  L8:for(;(I[16793]<=4);I[16793]=((I[16793]+1)|0)){
    I[((22004+(I[($p0)>>2]+Math.imul(I[16793],20)-21)*4))>>2]=(false?-1:0);
  }
  return;
}
/* CONQUEST.R: subroutine dispoption */
function R_dispoption($p0){
  R_cdclrl((I[17102]=23,68408),(I[17103]=2,68412));
  R_cdputs(68256,(I[17104]=23,68416),(I[17105]=1,68420));
  R_cdputs(68329,(I[17106]=24,68424),(I[17107]=1,68428));
  if(((I[(($p0+(1-1)*4))>>2]&1)!==0)){
    R_cdput((I[17108]=84,68432),(I[17109]=23,68436),(I[17110]=55,68440));
  }else{
    R_cdput((I[17111]=70,68444),(I[17112]=23,68448),(I[17113]=55,68452));
  }
  if(((I[(($p0+(2-1)*4))>>2]&1)!==0)){
    R_cdput((I[17114]=84,68456),(I[17115]=23,68460),(I[17116]=72,68464));
  }else{
    R_cdput((I[17117]=70,68468),(I[17118]=23,68472),(I[17119]=72,68476));
  }
  if(((I[(($p0+(3-1)*4))>>2]&1)!==0)){
    R_cdput((I[17120]=84,68480),(I[17121]=24,68484),(I[17122]=15,68488));
  }else{
    R_cdput((I[17123]=70,68492),(I[17124]=24,68496),(I[17125]=15,68500));
  }
  if(((I[(($p0+(4-1)*4))>>2]&1)!==0)){
    R_cdput((I[17126]=84,68504),(I[17127]=24,68508),(I[17128]=35,68512));
  }else{
    R_cdput((I[17129]=70,68516),(I[17130]=24,68520),(I[17131]=35,68524));
  }
  if(((I[(($p0+(5-1)*4))>>2]&1)!==0)){
    R_cdput((I[17132]=84,68528),(I[17133]=24,68532),(I[17134]=51,68536));
  }else{
    R_cdput((I[17135]=70,68540),(I[17136]=24,68544),(I[17137]=51,68548));
  }
  if(((I[(($p0+(6-1)*4))>>2]&1)!==0)){
    R_cdput((I[17138]=84,68552),(I[17139]=24,68556),(I[17140]=61,68560));
  }else{
    R_cdput((I[17141]=70,68564),(I[17142]=24,68568),(I[17143]=61,68572));
  }
  if(((I[(($p0+(7-1)*4))>>2]&1)!==0)){
    R_cdput((I[17144]=84,68576),(I[17145]=24,68580),(I[17146]=76,68584));
  }else{
    R_cdput((I[17147]=70,68588),(I[17148]=24,68592),(I[17149]=76,68596));
  }
  return;
}
/* CONQUEST.R: subroutine doalloc */
function* R_doalloc($p0){
  R_cdclrl((I[17159]=23,68636),(I[17160]=2,68640));
  B[68656]=(yield* R_cdgetx(68600,(I[17161]=23,68644),(I[17162]=1,68648),68048,388,(I[17163]=90,68652)));
  if((B[68656]===10)){
    I[((20324+(I[($p0)>>2]-1)*4))>>2]=I[((20404+(I[($p0)>>2]-1)*4))>>2];
  }else{
    if((B[68656]===13)){
      I[17165]=1;
      I[17167]=(((R_safectoi(68664,388,68660))?true:false)?-1:0);
      if((I[17166]!==0)){
        if((I[17166]<40)){
          I[17166]=40;
        }else{
          if((I[17166]>60)){
            I[17166]=60;
          }
        }
        I[((20324+(I[($p0)>>2]-1)*4))>>2]=I[17166];
      }
    }
  }
  I[((20404+(I[($p0)>>2]-1)*4))>>2]=((100-I[((20324+(I[($p0)>>2]-1)*4))>>2])|0);
  R_cdclrl((I[17168]=23,68672),(I[17169]=1,68676));
  return;
}
/* CONQUEST.R: subroutine doautopilot */
function* R_doautopilot($p0){
  R_cdclrl((I[17179]=23,68716),(I[17180]=2,68720));
  if(((yield* R_cdgetx(68680,(I[17181]=23,68724),(I[17182]=1,68728),68048,388,(I[17183]=90,68732)))!==10)){
    R_cdclrl((I[17184]=23,68736),(I[17185]=1,68740));
    return;
  }
  R_putmsg(68744,(I[17192]=23,68768));
  I[((26644+(I[($p0)>>2]-1)*4))>>2]=(true?-1:0);
  R_gsecs(68772);
  L1:while(((R_stillalive(324))?true:false)){
    if((I[((18804+(I[($p0)>>2]-1)*4))>>2]!==I[82])){
      break L1;
    }
    if((R_dsecs(68772,68776)>=15)){
      R_conqstats(324);
      I[17193]=I[17194];
    }
    if((!(((yield* H.iogtimed(68780,(I[17196]=1,68784))))?true:false))){
      continue L1;
    }
    I[96]=(false?-1:0);
    R_grand(352);
    S2:switch(B[68780]){
      case 27:{
        break L1;
        break S2;
      }
      case 12:{
        R_cdredo();
        break S2;
      }
      default:{
        R_putmsg(68788,(I[17206]=23,68824));
        R_scbeep();
        R_cdplay((I[17207]=(true?-1:0),68828));
      }
    }
    I[96]=(true?-1:0);
  }
  I[((26644+(I[($p0)>>2]-1)*4))>>2]=(false?-1:0);
  I[((26724+(I[($p0)>>2]-1)*4))>>2]=0;
  R_cdclrl((I[17208]=23,68832),(I[17209]=2,68836));
  return;
}
/* CONQUEST.R: subroutine dobeam */
function* R_dobeam($p0){
  I[((20564+(I[($p0)>>2]-1)*4))>>2]=(false?-1:0);
  R_cdclrl((I[17227]=23,68908),(I[17228]=2,68912));
  if((F[((19364+(I[($p0)>>2]-1)*4))>>2]>=Math.fround(0.0))){
    R_putmsg(68916,(I[17243]=23,68972));
    return;
  }
  I[17244]=((-I[((19524+(I[($p0)>>2]-1)*4))>>2])|0);
  if((I[((20484+(I[($p0)>>2]-1)*4))>>2]>0)){
    if((I[((14540+(I[17244]-1)*4))>>2]===3)){
      R_putmsg(68980,(I[17255]=23,69020));
      return;
    }else{
      if((I[((14540+(I[17244]-1)*4))>>2]===4)){
        R_putmsg(69024,(I[17268]=23,69072));
        return;
      }else{
        if((I[((16504+(I[17244]-1)*4))>>2]===7)){
          R_putmsg(69076,(I[17284]=23,69136));
          return;
        }
      }
    }
  }
  I[17285]=I[((15808+(I[17244]-1)*4))>>2];
  if((I[17285]>0)){
    H.prints(388,69144,69140);
    if((I[17285]!==1)){
      H.appchr((I[17298]=115,69192),388);
    }
    H.appchr((I[17299]=46,69196),388);
    R_putmsg(388,(I[17300]=23,69200));
    return;
  }
  if((((I[((16504+(I[17244]-1)*4))>>2]!==I[((18724+(I[($p0)>>2]-1)*4))>>2])&&(I[((16504+(I[17244]-1)*4))>>2]!==5))&&(I[((16504+(I[17244]-1)*4))>>2]!==6))){
    if((!((I[((21684+(I[($p0)>>2]+Math.imul(I[((16504+(I[17244]-1)*4))>>2],20)-21)*4))>>2]&1)!==0))){
      R_putmsg(69204,(I[17311]=23,69244));
      return;
    }
  }
  if((((I[((20484+(I[($p0)>>2]-1)*4))>>2]===0)&&(I[((16504+(I[17244]-1)*4))>>2]===I[((18724+(I[($p0)>>2]-1)*4))>>2]))&&(I[((16664+(I[17244]-1)*4))>>2]<=3))){
    R_putmsg(68840,(I[17312]=23,69248));
    return;
  }
  F[17313]=Math.fround(Math.fround($anint(Math.fround(F[((19764+(I[($p0)>>2]-1)*4))>>2]*Math.fround(10.0))))/Math.fround(10.0));
  if((F[17313]<Math.fround(1.0))){
    R_putmsg(69256,(I[17329]=23,69316));
    return;
  }
  I[17330]=I[((20484+(I[($p0)>>2]-1)*4))>>2];
  if(((((((R_spwar($p0,68976))?true:false)||(I[((16504+(I[17244]-1)*4))>>2]===5))||(I[((16504+(I[17244]-1)*4))>>2]===6))||(I[((16504+(I[17244]-1)*4))>>2]===7))||(I[((16664+(I[17244]-1)*4))>>2]===0))){
    I[17331]=0;
  }else{
    I[17332]=Math.min(Math.imul($fix(F[17313]),2),I[((15580+(I[((18724+(I[($p0)>>2]-1)*4))>>2]-1)*4))>>2]);
    I[17331]=Math.min(((I[((16664+(I[17244]-1)*4))>>2]-3)|0),((I[17332]-I[((20484+(I[($p0)>>2]-1)*4))>>2])|0));
  }
  if((((I[17331]>0)&&((I[((21684+(I[($p0)>>2]+Math.imul(I[((18724+(I[($p0)>>2]-1)*4))>>2],20)-21)*4))>>2]&1)!==0))&&(I[((18724+(I[($p0)>>2]-1)*4))>>2]===I[((16504+(I[17244]-1)*4))>>2]))){
    if((I[17330]<=0)){
      H.strcpy(69332,388);
      if((I[17331]===1)){
        H.appstr(69340,388);
      }else{
        H.appstr(69345,388);
      }
      H.appstr(69353,388);
      R_putmsg(388,(I[17349]=23,69396));
      return;
    }
    I[17331]=0;
  }
  if(((I[17331]<=0)&&(I[17330]<=0))){
    R_putmsg(69400,(I[17357]=23,69428));
    return;
  }
  if((I[17331]<=0)){
    I[17358]=(false?-1:0);
  }else{
    if((I[17330]<=0)){
      I[17358]=(true?-1:0);
    }else{
      R_putmsg(69436,(I[17364]=23,69456));
      R_cdplay((I[17365]=(true?-1:0),69460));
      L1:while(((R_stillalive(324))?true:false)){
        if((!(((yield* H.iogtimed(69464,(I[17367]=1,69468))))?true:false))){
          continue L1;
        }
        S2:switch(H.clower(69464)){
          case 117:{
            I[17358]=(true?-1:0);
            break L1;
            break S2;
          }
          case 100:case 10:{
            I[17358]=(false?-1:0);
            break L1;
            break S2;
          }
          default:{
            R_putmsg(68894,(I[17368]=23,69472));
            return;
          }
        }
      }
    }
  }
  if(((I[17358]&1)!==0)){
    I[17369]=I[17331];
  }else{
    I[17369]=I[17330];
  }
  if(((I[17358]&1)!==0)){
    H.strcpy(69480,69483);
  }else{
    H.strcpy(69573,69483);
  }
  H.prints(388,69578,69483,69476);
  R_cdclrl((I[17399]=23,69596),(I[17400]=1,69600));
  B[69464]=(yield* R_cdgetx(388,(I[17401]=23,69604),(I[17402]=1,69608),68048,69483,(I[17403]=90,69612)));
  if((B[69464]===27)){
    R_putmsg(68894,(I[17404]=23,69616));
    return;
  }else{
    if(((B[69464]===10)&&(B[(69483+1-1)]===0))){
      I[17405]=I[17369];
    }else{
      R_delblanks(69483);
      if((H.alldig(69483)!==1)){
        R_putmsg(68894,(I[17406]=23,69624));
        return;
      }
      I[17285]=1;
      I[17407]=(((R_safectoi(69620,69483,69140))?true:false)?-1:0);
      if(((I[17405]<1)||(I[17405]>I[17369]))){
        R_putmsg(68894,(I[17408]=23,69632));
        return;
      }
    }
  }
  if((I[((16504+(I[17244]-1)*4))>>2]>4)){
    I[((22324+(I[($p0)>>2]+Math.imul(I[17244],20)-21)*4))>>2]=(true?-1:0);
  }else{
    if((I[((16504+(I[17244]-1)*4))>>2]!==I[((18724+(I[($p0)>>2]-1)*4))>>2])){
      I[((22004+(I[($p0)>>2]+Math.imul(I[((16504+(I[17244]-1)*4))>>2],20)-21)*4))>>2]=(true?-1:0);
      R_intrude($p0,68976);
    }
  }
  I[17409]=(((I[((19604+(I[($p0)>>2]-1)*4))>>2]&1)!==0)?-1:0);
  I[((19604+(I[($p0)>>2]-1)*4))>>2]=(false?-1:0);
  I[17410]=0;
  I[17411]=((-1)|0);
  I[17412]=(false?-1:0);
  I[17413]=(false?-1:0);
  R_grand(69656);
  L3:for(;;){
    if((!((R_stillalive(324))?true:false))){
      return;
    }
    if(((H.iochav((I[17415]=0,69660)))?true:false)){
      R_putmsg(68894,(I[17416]=23,69664));
      break L3;
    }
    L4:while((R_dgrand(69656,69668)>=2000)){
      I[17414]=$imod(((I[17414]+2000)|0),Math.imul(Math.imul(Math.imul(24,60),60),1000));
      H.pvlock(604);
      if(((I[17358]&1)!==0)){
        if((I[((16664+(I[17244]-1)*4))>>2]<=3)){
          H.pvunlock(604);
          R_putmsg(68840,(I[17418]=23,69672));
          break L4;
        }
        I[((20484+(I[($p0)>>2]-1)*4))>>2]=((I[((20484+(I[($p0)>>2]-1)*4))>>2]+1)|0);
        I[((16664+(I[17244]-1)*4))>>2]=((I[((16664+(I[17244]-1)*4))>>2]-1)|0);
      }else{
        I[((20484+(I[($p0)>>2]-1)*4))>>2]=((I[((20484+(I[($p0)>>2]-1)*4))>>2]-1)|0);
        if(((I[((16504+(I[17244]-1)*4))>>2]===6)||(I[((16664+(I[17244]-1)*4))>>2]===0))){
          R_takeplanet(68976,$p0);
          I[17413]=(true?-1:0);
        }else{
          if((I[((16504+(I[17244]-1)*4))>>2]!==I[((18724+(I[($p0)>>2]-1)*4))>>2])){
            I[((16664+(I[17244]-1)*4))>>2]=((I[((16664+(I[17244]-1)*4))>>2]-1)|0);
            if((I[((16664+(I[17244]-1)*4))>>2]===0)){
              R_zeroplanet(68976,$p0);
              I[17412]=(true?-1:0);
            }
          }else{
            I[((16664+(I[17244]-1)*4))>>2]=((I[((16664+(I[17244]-1)*4))>>2]+1)|0);
          }
        }
      }
      H.pvunlock(604);
      I[17410]=((I[17410]+1)|0);
      if((I[17410]>=I[17405])){
        R_cdclrl((I[17419]=23,69676),(I[17420]=1,69680));
        break L3;
      }
    }
    if((I[17411]!==I[17410])){
      H.strcpy(69684,388);
      if(((I[17358]&1)!==0)){
        H.appstr(69693,388);
      }else{
        H.appstr(69702,388);
      }
      H.appstr((14860+1+Math.imul(I[17244],12)-13),388);
      H.appstr(66179,388);
      if((I[17410]===0)){
        H.appstr(69711,388);
      }else{
        R_appint(69640,388);
      }
      H.appstr(69714,388);
      if((I[17410]===1)){
        H.appchr((I[17430]=121,69720),388);
      }else{
        H.appstr(69724,388);
      }
      H.appstr(69728,388);
      R_appint((I[17436]=((I[17405]-I[17410])|0),69744),388);
      H.appstr(69748,388);
      R_putmsg(388,(I[17439]=23,69756));
      if((I[17411]===((-1)|0))){
        R_cdplay((I[17440]=(true?-1:0),69760));
      }
      I[17411]=I[17410];
    }
    if((((I[17358]&1)!==0)&&(I[((16664+(I[17244]-1)*4))>>2]<=3))){
      R_putmsg(68840,(I[17441]=23,69764));
      break L3;
    }
    H.aston();
    (yield* H.sleep((F[17442]=Math.fround(0.1),69768)));
    H.astoff();
  }
  I[((19604+(I[($p0)>>2]-1)*4))>>2]=(((I[17409]&1)!==0)?-1:0);
  R_cdplay((I[17443]=(true?-1:0),69772));
  if(((I[17413]&1)!==0)){
    H.prints(388,69776,(14860+1+Math.imul(I[17244],12)-13));
    R_putmsg(388,(I[17450]=23,69800));
  }else{
    if(((I[17412]&1)!==0)){
      R_putmsg(69804,(I[17465]=23,69860));
    }
  }
  return;
}
/* CONQUEST.R: subroutine dobomb */
function* R_dobomb($p0){
  I[((20564+(I[($p0)>>2]-1)*4))>>2]=(false?-1:0);
  R_cdclrl((I[17479]=24,69916),(I[17480]=1,69920));
  if((F[((19364+(I[($p0)>>2]-1)*4))>>2]>=Math.fround(0.0))){
    R_putmsg(69924,(I[17492]=23,69968));
    return;
  }
  I[17493]=((-I[((19524+(I[($p0)>>2]-1)*4))>>2])|0);
  if(((((I[((14540+(I[17493]-1)*4))>>2]===3)||(I[((14540+(I[17493]-1)*4))>>2]===4))||(I[((16504+(I[17493]-1)*4))>>2]===6))||(I[((16664+(I[17493]-1)*4))>>2]===0))){
    R_putmsg(69976,(I[17503]=23,70012));
    return;
  }
  if((I[((16504+(I[17493]-1)*4))>>2]===I[((18724+(I[($p0)>>2]-1)*4))>>2])){
    R_putmsg(70016,(I[17512]=23,70048));
    return;
  }
  if(((I[((16504+(I[17493]-1)*4))>>2]!==5)&&(I[((16504+(I[17493]-1)*4))>>2]!==7))){
    if((!((I[((21684+(I[($p0)>>2]+Math.imul(I[((16504+(I[17493]-1)*4))>>2],20)-21)*4))>>2]&1)!==0))){
      R_putmsg(69204,(I[17513]=23,70052));
      return;
    }
  }
  H.prints(388,70056,(14860+1+Math.imul(I[17493],12)-13),(16664+(I[17493]-1)*4));
  R_cdclrl((I[17525]=23,70100),(I[17526]=1,70104));
  if(((yield* R_cdgetx(388,(I[17527]=23,70108),(I[17528]=1,70112),68048,70116,(I[17552]=90,70208)))!==10)){
    R_cdclrl((I[17553]=23,70212),(I[17554]=1,70216));
    return;
  }
  I[((22324+(I[($p0)>>2]+Math.imul(I[17493],20)-21)*4))>>2]=(true?-1:0);
  if(((I[((16504+(I[17493]-1)*4))>>2]>=1)&&(I[((16504+(I[17493]-1)*4))>>2]<=4))){
    I[((22004+(I[($p0)>>2]+Math.imul(I[((16504+(I[17493]-1)*4))>>2],20)-21)*4))>>2]=(true?-1:0);
    R_intrude($p0,69972);
  }
  if((I[((16504+(I[17493]-1)*4))>>2]===7)){
    H.prints(388,70220,(26804+1+Math.imul(I[($p0)>>2],24)-25));
    R_putmsg(388,(I[17562]=23,70248));
    R_damage($p0,(F[17565]=R_rnduni((F[17563]=Math.fround(50.0),70252),(F[17564]=Math.fround(100.0),70256)),70260),(I[17566]=((-110)|0),70264));
    return;
  }
  I[17567]=(((I[((19604+(I[($p0)>>2]-1)*4))>>2]&1)!==0)?-1:0);
  I[((19604+(I[($p0)>>2]-1)*4))>>2]=(false?-1:0);
  I[17568]=0;
  I[17569]=((-1)|0);
  I[17570]=((-1)|0);
  R_grand(70284);
  L1:for(;;){
    if((!((R_stillalive(324))?true:false))){
      return;
    }
    if(((H.iochav((I[17572]=0,70288)))?true:false)){
      R_putmsg(69900,(I[17573]=23,70292));
      break L1;
    }
    L2:while((R_dgrand(70284,70296)>=333)){
      if((I[((20164+(I[($p0)>>2]-1)*4))>>2]>0)){
        R_putmsg(70300,(I[17584]=23,70336));
        break L1;
      }
      F[17585]=Math.fround(Math.fround(Math.fround(10.0)*Math.fround(333))/Math.fround(1000.0));
      if((!((R_usefuel($p0,70340,(I[17586]=(true?-1:0),70344)))?true:false))){
        R_putmsg(70348,(I[17594]=23,70376));
        break L1;
      }
      I[17571]=$imod(((I[17571]+333)|0),Math.imul(Math.imul(Math.imul(24,60),60),1000));
      F[17595]=Math.fround(Math.fround(Math.fround(0.3)*Math.fround(Math.fround(Math.fround(Math.fround(Math.fround(Math.fround(I[((20324+(I[($p0)>>2]-1)*4))>>2])+Math.fround(50.0))/Math.fround(100.0))*F[((15644+(I[((18724+(I[($p0)>>2]-1)*4))>>2]-1)*4))>>2])*Math.fround(F[((19764+(I[($p0)>>2]-1)*4))>>2]+Math.fround(50.0)))/Math.fround(50.0)))*Math.fround(Math.fround(Math.fround(I[((16664+(I[17493]-1)*4))>>2])/Math.fround(100.0))+Math.fround(0.5)));
      if((R_rnd((I[17596]=0,70384))<F[17595])){
        H.pvlock(604);
        if((I[((16664+(I[17493]-1)*4))>>2]<=3)){
          H.pvunlock(604);
          R_putmsg(69864,(I[17597]=23,70388));
          break L1;
        }
        I[((16664+(I[17493]-1)*4))>>2]=((I[((16664+(I[17493]-1)*4))>>2]-1)|0);
        F[((19764+(I[($p0)>>2]-1)*4))>>2]=Math.fround(F[((19764+(I[($p0)>>2]-1)*4))>>2]+Math.fround(0.05));
        I[((1612+(I[((18644+(I[($p0)>>2]-1)*4))>>2]+Math.imul(11,40)-41)*4))>>2]=((I[((1612+(I[((18644+(I[($p0)>>2]-1)*4))>>2]+Math.imul(11,40)-41)*4))>>2]+1)|0);
        I[((748+(I[((18724+(I[($p0)>>2]-1)*4))>>2]+Math.imul(10,4)-5)*4))>>2]=((I[((748+(I[((18724+(I[($p0)>>2]-1)*4))>>2]+Math.imul(10,4)-5)*4))>>2]+1)|0);
        H.pvunlock(604);
        I[17568]=((I[17568]+1)|0);
      }
    }
    if((I[((16664+(I[17493]-1)*4))>>2]<=3)){
      R_putmsg(69864,(I[17598]=23,70392));
      break L1;
    }
    if(((I[((16664+(I[17493]-1)*4))>>2]!==I[17570])||(I[17569]!==I[17568]))){
      I[17570]=I[((16664+(I[17493]-1)*4))>>2];
      if((I[17568]===1)){
        H.strcpy(70396,70116);
      }else{
        H.strcpy(69724,70116);
      }
      H.prints(388,70398,(14860+1+Math.imul(I[17493],12)-13),70272,70116,70280);
      R_putmsg(388,(I[17609]=23,70436));
      if((I[17569]===((-1)|0))){
        R_cdplay((I[17610]=(true?-1:0),70440));
      }
      I[17569]=I[17568];
    }
    H.aston();
    (yield* H.sleep((F[17611]=Math.fround(0.1),70444)));
    H.astoff();
  }
  I[((19604+(I[($p0)>>2]-1)*4))>>2]=(((I[17567]&1)!==0)?-1:0);
  R_cdplay((I[17612]=(true?-1:0),70448));
  return;
}
/* CONQUEST.R: subroutine doburst */
function* R_doburst($p0){
  R_cdclrl((I[17613]=24,70452),(I[17614]=1,70456));
  if(((I[((20644+(I[($p0)>>2]-1)*4))>>2]&1)!==0)){
    R_putmsg(70460,(I[17628]=23,70512));
    return;
  }
  if((I[((20164+(I[($p0)>>2]-1)*4))>>2]>0)){
    R_putmsg(70300,(I[17629]=23,70516));
    return;
  }
  if((F[((19924+(I[($p0)>>2]-1)*4))>>2]<Math.fround(10.0))){
    R_putmsg(70520,(I[17640]=23,70560));
    return;
  }
  if((((yield* R_gettarget(70564,(I[17645]=23,70580),(I[17646]=1,70584),70588,(26004+(I[($p0)>>2]-1)*4))))?true:false)){
    if((!((R_launch($p0,70588))?true:false))){
      R_putmsg(70592,(I[17652]=24,70608));
    }else{
      if(((R_launch($p0,70588))?true:false)){
        I[17653]=(((R_launch($p0,70588))?true:false)?-1:0);
      }
    }
  }
  R_cdclrl((I[17654]=23,70616),(I[17655]=1,70620));
  return;
}
/* CONQUEST.R: subroutine docloak */
function* R_docloak($p0){
  R_cdclrl((I[17678]=24,70712),(I[17679]=1,70716));
  if(((I[((20644+(I[($p0)>>2]-1)*4))>>2]&1)!==0)){
    I[((20644+(I[($p0)>>2]-1)*4))>>2]=(false?-1:0);
    R_putmsg(70720,(I[17687]=23,70748));
    return;
  }
  if((I[((20164+(I[($p0)>>2]-1)*4))>>2]>0)){
    R_putmsg(70300,(I[17688]=23,70752));
    return;
  }
  if((F[((19924+(I[($p0)>>2]-1)*4))>>2]<Math.fround(100.0))){
    R_putmsg(70667,(I[17689]=23,70756));
    return;
  }
  R_cdclrl((I[17690]=23,70760),(I[17691]=1,70764));
  if(((yield* R_cdgetx(70624,(I[17692]=23,70768),(I[17693]=1,70772),68048,388,(I[17694]=90,70776)))===10)){
    if(((R_cloak($p0))?true:false)){
      R_putmsg(70780,(I[17702]=24,70808));
    }else{
      R_putmsg(70667,(I[17703]=24,70812));
    }
  }
  R_cdclrl((I[17704]=23,70816),(I[17705]=1,70820));
  return;
}
/* CONQUEST.R: subroutine docoup */
function* R_docoup($p0){
  R_cdclrl((I[17727]=24,70908),(I[17728]=1,70912));
  if((Math.fround(Math.fround($anint(Math.fround(F[((19764+(I[($p0)>>2]-1)*4))>>2]*Math.fround(10.0))))/Math.fround(10.0))<Math.fround(3.0))){
    R_putmsg(70916,(I[17746]=23,70984));
    return;
  }
  I[17747]=1;
  L1:for(;(I[17747]<=40);I[17747]=((I[17747]+1)|0)){
    if(((I[((16504+(I[17747]-1)*4))>>2]===I[((18724+(I[($p0)>>2]-1)*4))>>2])&&(I[((16664+(I[17747]-1)*4))>>2]>0))){
      R_putmsg(70992,(I[17761]=23,71044));
      return;
    }
  }
  if((F[((19364+(I[($p0)>>2]-1)*4))>>2]>=Math.fround(0.0))){
    R_putmsg(70824,(I[17762]=23,71048));
    return;
  }
  I[17763]=((-I[((19524+(I[($p0)>>2]-1)*4))>>2])|0);
  if((I[17763]!==I[((15500+(I[((18724+(I[($p0)>>2]-1)*4))>>2]-1)*4))>>2])){
    R_putmsg(70824,(I[17764]=23,71056));
    return;
  }
  if((I[((16664+(I[17763]-1)*4))>>2]>20)){
    R_putmsg(71060,(I[17778]=23,71112));
    return;
  }
  I[17747]=I[((15808+(I[17763]-1)*4))>>2];
  if((I[17747]>0)){
    H.prints(388,71116,70988);
    R_putmsg(388,(I[17792]=23,71168));
    return;
  }
  I[((1068+(I[((18724+(I[($p0)>>2]-1)*4))>>2]-1)*4))>>2]=(true?-1:0);
  I[17747]=I[((15792+(I[((18724+(I[($p0)>>2]-1)*4))>>2]-1)*4))>>2];
  if((I[17747]>0)){
    H.prints(388,71172,70988);
    R_putmsg(388,(I[17805]=23,71220));
    return;
  }
  R_cdclrl((I[17806]=23,71224),(I[17807]=1,71228));
  if(((yield* R_cdgetx(70879,(I[17808]=23,71232),(I[17809]=1,71236),68048,388,(I[17810]=90,71240)))!==10)){
    R_putmsg(71244,(I[17815]=23,71260));
    return;
  }
  R_putmsg(71264,(I[17821]=23,71284));
  R_cdplay((I[17822]=(true?-1:0),71288));
  R_grand(71292);
  L2:while((R_dgrand(71292,71296)<10000)){
    if((!((R_stillalive(324))?true:false))){
      return;
    }
    H.aston();
    (yield* H.sleep((F[17825]=Math.fround(0.1),71300)));
    H.astoff();
  }
  R_cdclrl((I[17826]=23,71304),(I[17827]=1,71308));
  H.pvlock(604);
  if((I[((16504+(I[17763]-1)*4))>>2]===I[((18724+(I[($p0)>>2]-1)*4))>>2])){
    H.pvunlock(604);
    R_putmsg(69804,(I[17828]=24,71312));
    return;
  }
  F[17829]=Math.fround(Math.fround(Math.fround($idiv(I[((16664+(I[17763]-1)*4))>>2],20))*Math.fround(0.5))+Math.fround(0.5));
  if((R_rnd((I[17830]=0,71320))<F[17829])){
    I[((15792+(I[((18724+(I[($p0)>>2]-1)*4))>>2]-1)*4))>>2]=R_rndint((I[17831]=5,71324),(I[17832]=10,71328));
    H.pvunlock(604);
    R_putmsg(71332,(I[17838]=24,71352));
    return;
  }
  R_takeplanet(71052,$p0);
  I[((16664+(I[17763]-1)*4))>>2]=R_rndint((I[17839]=10,71356),(I[17840]=20,71360));
  I[((1612+(I[((18644+(I[($p0)>>2]-1)*4))>>2]+Math.imul(8,40)-41)*4))>>2]=((I[((1612+(I[((18644+(I[($p0)>>2]-1)*4))>>2]+Math.imul(8,40)-41)*4))>>2]+1)|0);
  I[((748+(I[((18724+(I[($p0)>>2]-1)*4))>>2]+Math.imul(7,4)-5)*4))>>2]=((I[((748+(I[((18724+(I[($p0)>>2]-1)*4))>>2]+Math.imul(7,4)-5)*4))>>2]+1)|0);
  H.pvunlock(604);
  R_putmsg(71364,(I[17846]=24,71384));
  return;
}
/* CONQUEST.R: subroutine docourse */
function* R_docourse($p0){
  R_cdclrl((I[17847]=23,71388),(I[17848]=2,71392));
  B[71428]=(yield* R_cdgetx(71396,(I[17854]=23,71416),(I[17855]=1,71420),68048,388,(I[17856]=90,71424)));
  R_delblanks(388);
  if(((B[71428]===27)||(B[(388+1-1)]===0))){
    R_cdclrl((I[17858]=23,71432),(I[17859]=1,71436));
    return;
  }
  I[17860]=0;
  H.fold(388);
  I[17861]=5;
  if((H.alldig(388)===1)){
    R_cdclrl((I[17862]=23,71448),(I[17863]=1,71452));
    I[17864]=1;
    if(((R_safectoi(71460,388,71456))?true:false)){
      I[17861]=4;
      F[17867]=R_mod360((F[17866]=Math.fround(I[17865]),71464));
    }
  }else{
    if(((R_arrows(388,71468))?true:false)){
      I[17861]=4;
    }else{
      if(((R_special(388,71456,71472,71476))?true:false)){
        if(((R_findspecial($p0,71472,71476,71480,71484))?true:false)){
          I[17861]=I[17864];
        }
      }else{
        if(((B[(388+1-1)]===115)&&(H.alldig((388+2-1))===1))){
          I[17864]=2;
          if(((R_safectoi(71480,388,71456))?true:false)){
            I[17861]=1;
          }
        }else{
          if(((R_planmatch(388,71480,(I[17872]=(false?-1:0),71488)))?true:false)){
            I[17861]=2;
          }
        }
      }
    }
  }
  S1:switch(I[17861]){
    case 1:{
      if(((I[17870]<1)||(I[17870]>20))){
        R_putmsg(71492,(I[17877]=24,71508));
        return;
      }
      if((I[17870]===I[($p0)>>2])){
        R_cdclrl((I[17878]=23,71512),(I[17879]=1,71516));
        return;
      }
      if((I[((18484+(I[17870]-1)*4))>>2]!==3)){
        R_putmsg(71520,(I[17883]=24,71532));
        return;
      }
      if(((I[((20644+(I[17870]-1)*4))>>2]&1)!==0)){
        if((F[((19364+(I[17870]-1)*4))>>2]<=Math.fround(0.0))){
          R_putmsg(71536,(I[17892]=24,71568));
          return;
        }
        F[17894]=R_rndnor((18884+(I[17870]-1)*4),(F[17893]=Math.fround(500.0),71572));
        F[17896]=R_rndnor((18964+(I[17870]-1)*4),(F[17895]=Math.fround(500.0),71580));
      }else{
        F[17894]=F[((18884+(I[17870]-1)*4))>>2];
        F[17896]=F[((18964+(I[17870]-1)*4))>>2];
      }
      F[17867]=R_angle((18884+(I[($p0)>>2]-1)*4),(18964+(I[($p0)>>2]-1)*4),71576,71584);
      if((B[71428]===10)){
        R_infoship(71480,$p0);
      }else{
        R_cdclrl((I[17897]=23,71588),(I[17898]=1,71592));
      }
      break S1;
    }
    case 2:{
      F[17867]=R_angle((18884+(I[($p0)>>2]-1)*4),(18964+(I[($p0)>>2]-1)*4),(16184+(I[17870]-1)*4),(16344+(I[17870]-1)*4));
      if((B[71428]===10)){
        I[17860]=((-I[17870])|0);
        R_infoplanet(71596,71480,$p0);
      }else{
        R_infoplanet(71614,71480,$p0);
      }
      break S1;
    }
    case 4:{
      R_cdclrl((I[17909]=23,71636),(I[17910]=1,71640));
      break S1;
    }
    case 3:{
      R_putmsg(71520,(I[17911]=24,71644));
      return;
      break S1;
    }
    default:{
      R_putmsg(71648,(I[17917]=24,71668));
      return;
    }
  }
  if((F[((19364+(I[($p0)>>2]-1)*4))>>2]<Math.fround(0.0))){
    F[((19364+(I[($p0)>>2]-1)*4))>>2]=Math.fround(0.0);
  }
  F[((19284+(I[($p0)>>2]-1)*4))>>2]=F[17867];
  I[((19524+(I[($p0)>>2]-1)*4))>>2]=I[17860];
  return;
}
/* CONQUEST.R: subroutine dodet */
function R_dodet($p0){
  R_cdclrl((I[17918]=24,71672),(I[17919]=1,71676));
  if((I[((20164+(I[($p0)>>2]-1)*4))>>2]>0)){
    R_putmsg(70300,(I[17920]=23,71680));
  }else{
    if(((R_enemydet($p0))?true:false)){
      R_putmsg(71684,(I[17925]=23,71700));
    }else{
      R_putmsg(71704,(I[17935]=23,71740));
    }
  }
  return;
}
/* CONQUEST.R: subroutine dodistress */
function* R_dodistress($p0){
  R_cdclrl((I[17949]=23,71796),(I[17950]=2,71800));
  if(((yield* R_cdgetx(71744,(I[17951]=23,71804),(I[17952]=1,71808),68048,388,(I[17953]=90,71812)))===10)){
    H.prints(388,71816,(I[17962]=$nint(F[((19684+(I[($p0)>>2]-1)*4))>>2]),71848),(I[17963]=$nint(F[((19844+(I[($p0)>>2]-1)*4))>>2]),71852),(I[17964]=$nint(F[((19924+(I[($p0)>>2]-1)*4))>>2]),71856));
    I[17965]=$nint(F[((20004+(I[($p0)>>2]-1)*4))>>2]);
    if((I[17965]<100)){
      R_appint(71860,388);
    }else{
      H.appstr(71864,388);
    }
    H.appchr((I[17967]=47,71868),388);
    I[17965]=$nint(F[((20084+(I[($p0)>>2]-1)*4))>>2]);
    if((I[17965]<100)){
      R_appint(71860,388);
    }else{
      H.appstr(71864,388);
    }
    I[17965]=I[((20484+(I[($p0)>>2]-1)*4))>>2];
    if((I[17965]>0)){
      H.appstr(71872,388);
      R_appint(71860,388);
    }
    if((I[((20164+(I[($p0)>>2]-1)*4))>>2]>0)){
      H.appstr(71882,388);
    }
    if((I[((20244+(I[($p0)>>2]-1)*4))>>2]>0)){
      H.appstr(71893,388);
    }
    R_stormsg($p0,(I[17976]=((-I[((18724+(I[($p0)>>2]-1)*4))>>2])|0),71904),388);
  }
  R_cdclrl((I[17977]=23,71908),(I[17978]=1,71912));
  return;
}
/* CONQUEST.R: subroutine dohelp */
function* R_dohelp($p0){
  R_cdclear();
  R_cdputc(71916,(I[17984]=1,71936));
  I[17985]=4;
  I[17986]=I[17985];
  I[17987]=4;
  R_cdputs(71952,71944,71948);
  I[17986]=((I[17986]+1)|0);
  R_cdputs(71985,71944,71948);
  I[17986]=((I[17986]+1)|0);
  R_cdputs(72015,71944,71948);
  I[17986]=((I[17986]+1)|0);
  R_cdputs(72034,71944,71948);
  I[17986]=((I[17986]+1)|0);
  R_cdputs(72058,71944,71948);
  I[17986]=((I[17986]+1)|0);
  R_cdputs(72081,71944,71948);
  I[17986]=((I[17986]+1)|0);
  R_cdputs(72113,71944,71948);
  I[17986]=((I[17986]+1)|0);
  R_cdputs(72148,71944,71948);
  I[17986]=((I[17986]+1)|0);
  R_cdputs(72184,71944,71948);
  I[17986]=((I[17986]+1)|0);
  R_cdputs(72204,71944,71948);
  I[17986]=((I[17986]+1)|0);
  R_cdputs(72240,71944,71948);
  I[17986]=((I[17986]+1)|0);
  R_cdputs(72252,71944,71948);
  I[17986]=((I[17986]+1)|0);
  R_cdputs(72272,71944,71948);
  I[17986]=((I[17986]+1)|0);
  R_cdputs(72291,71944,71948);
  I[17986]=((I[17986]+1)|0);
  R_cdputs(72315,71944,71948);
  I[17986]=((I[17986]+1)|0);
  R_cdputs(72333,71944,71948);
  I[17986]=((I[17986]+1)|0);
  R_cdputs(72351,71944,71948);
  I[17986]=((I[17986]+1)|0);
  R_cdputs(72378,71944,71948);
  I[17986]=((I[17986]+1)|0);
  R_cdputs(72400,71944,71948);
  I[17986]=I[17985];
  I[17987]=44;
  R_cdputs(72428,71944,71948);
  I[17986]=((I[17986]+1)|0);
  R_cdputs(72452,71944,71948);
  I[17986]=((I[17986]+1)|0);
  R_cdputs(72475,71944,71948);
  I[17986]=((I[17986]+1)|0);
  R_cdputs(72506,71944,71948);
  I[17986]=((I[17986]+1)|0);
  R_cdputs(72541,71944,71948);
  I[17986]=((I[17986]+1)|0);
  R_cdputs(72571,71944,71948);
  I[17986]=((I[17986]+1)|0);
  R_cdputs(72596,71944,71948);
  I[17986]=((I[17986]+1)|0);
  R_cdputs(72624,71944,71948);
  I[17986]=((I[17986]+1)|0);
  R_cdputs(72652,71944,71948);
  I[17986]=((I[17986]+1)|0);
  R_cdputs(72669,71944,71948);
  I[17986]=((I[17986]+1)|0);
  R_cdputs(72700,71944,71948);
  I[17986]=((I[17986]+1)|0);
  R_cdputs(72723,71944,71948);
  I[17986]=((I[17986]+1)|0);
  R_cdputs(72747,71944,71948);
  I[17986]=((I[17986]+1)|0);
  R_cdputs(72768,71944,71948);
  I[17986]=((I[17986]+1)|0);
  R_cdputs(72789,71944,71948);
  I[17986]=((I[17986]+1)|0);
  R_cdputs(72808,71944,71948);
  if(((I[($p0)>>2]&1)!==0)){
    I[17986]=((I[17986]+1)|0);
    R_cdputs(72827,71944,71948);
  }
  I[17986]=((I[17986]+1)|0);
  R_cdputs(72847,71944,71948);
  R_putpmt(68204,(I[18219]=24,72876));
  R_cdplay((I[18220]=(true?-1:0),72880));
  L1:while(((!(((yield* H.iogtimed(72884,(I[18222]=1,72888))))?true:false))&&((R_stillalive(324))?true:false))){
  }
  return;
}
/* CONQUEST.R: subroutine doinfo */
function* R_doinfo($p0){
  R_cdclrl((I[18223]=23,72892),(I[18224]=2,72896));
  B[72932]=(yield* R_cdgetx(72900,(I[18230]=23,72920),(I[18231]=1,72924),68048,388,(I[18232]=90,72928)));
  if((B[72932]===27)){
    R_cdclrl((I[18234]=23,72936),(I[18235]=1,72940));
    return;
  }
  I[18236]=((B[72932]===10)?-1:0);
  R_delblanks(388);
  H.fold(388);
  if((B[(388+1-1)]===0)){
    H.strcpy(478,388);
    if((B[(388+1-1)]===0)){
      R_cdclrl((I[18237]=23,72948),(I[18238]=1,72952));
      return;
    }
  }else{
    H.strcpy(388,478);
  }
  if(((R_special(388,72956,72960,72964))?true:false)){
    if((!((R_findspecial($p0,72960,72964,72968,72972))?true:false))){
      I[18239]=3;
    }else{
      if(((I[18236]&1)!==0)){
        if((I[18243]===0)){
          I[18239]=3;
        }else{
          I[18242]=I[18243];
        }
      }
    }
    if((I[18239]===1)){
      R_infoship(72968,$p0);
    }else{
      if((I[18239]===2)){
        R_infoplanet(72976,72968,$p0);
      }else{
        R_putmsg(71520,(I[18245]=24,72980));
      }
    }
  }else{
    if(((B[(388+1-1)]===115)&&(H.alldig((388+2-1))===1))){
      I[18246]=2;
      I[18248]=(((R_safectoi(72988,388,72984))?true:false)?-1:0);
      R_infoship(72988,$p0);
    }else{
      if((H.alldig(388)===1)){
        I[18246]=1;
        I[18248]=(((R_safectoi(72988,388,72984))?true:false)?-1:0);
        R_infoship(72988,$p0);
      }else{
        if(((R_planmatch(388,72988,(I[18249]=(false?-1:0),72996)))?true:false)){
          R_infoplanet(72976,72988,$p0);
        }else{
          if(((R_stmatch(388,73000,(I[18252]=(false?-1:0),73008)))?true:false)){
            H.getnow(73012);
            H.strcpy(73040,388);
            R_appnumtim(73012,388);
            H.appchr((I[18262]=46,73048),388);
            R_putmsg(388,(I[18263]=23,73052));
            R_cdmove((I[18264]=23,73056),(I[18265]=1,73060));
          }else{
            R_putmsg(71648,(I[18266]=24,73064));
            R_cdmove((I[18267]=23,73068),(I[18268]=1,73072));
          }
        }
      }
    }
  }
  return;
}
/* CONQUEST.R: subroutine dolastphase */
function R_dolastphase($p0){
  R_cdclrl((I[18269]=23,73076),(I[18270]=1,73080));
  if(((I[((20644+(I[($p0)>>2]-1)*4))>>2]&1)!==0)){
    R_putmsg(70460,(I[18271]=24,73084));
    return;
  }
  if((I[((20164+(I[($p0)>>2]-1)*4))>>2]>0)){
    R_putmsg(70300,(I[18272]=23,73088));
    return;
  }
  if((F[((19924+(I[($p0)>>2]-1)*4))>>2]<Math.fround(20.0))){
    R_putmsg(73092,(I[18282]=24,73128));
    return;
  }
  if(((R_phaser($p0,(26084+(I[($p0)>>2]-1)*4)))?true:false)){
    R_cdclrl((I[18283]=24,73132),(I[18284]=1,73136));
  }else{
    R_putmsg(73140,(I[18290]=24,73160));
  }
  return;
}
/* CONQUEST.R: subroutine domydet */
function R_domydet($p0){
  R_cdclrl((I[18291]=24,73164),(I[18292]=1,73168));
  R_putmsg(73172,(I[18297]=23,73188));
  I[18298]=1;
  L1:for(;(I[18298]<=9);I[18298]=((I[18298]+1)|0)){
    R_detonate($p0,73192);
  }
  return;
}
/* CONQUEST.R: subroutine dooption */
function* R_dooption($p0,$p1){
  I[18299]=1;
  L1:for(;(I[18299]<=12);I[18299]=((I[18299]+1)|0)){
    I[((73200+(I[18299]-1)*4))>>2]=(((I[((20724+(I[($p0)>>2]+Math.imul(I[18299],20)-21)*4))>>2]&1)!==0)?-1:0);
    I[((73248+(I[18299]-1)*4))>>2]=(((I[((20724+(I[($p0)>>2]+Math.imul(I[18299],20)-21)*4))>>2]&1)!==0)?-1:0);
  }
  L2:while(((R_stillalive(324))?true:false)){
    R_dispoption(73248);
    R_cdplay((I[18324]=(true?-1:0),73296));
    if((!(((yield* H.iogtimed(73300,(I[18326]=1,73304))))?true:false))){
      continue L2;
    }
    S3:switch(B[73300]){
      case 10:{
        I[18299]=1;
        L4:for(;(I[18299]<=12);I[18299]=((I[18299]+1)|0)){
          I[((5772+(I[((18644+(I[($p0)>>2]-1)*4))>>2]+Math.imul(I[18299],40)-41)*4))>>2]=(((I[((73248+(I[18299]-1)*4))>>2]&1)!==0)?-1:0);
        }
        break L2;
        break S3;
      }
      case 27:{
        I[18299]=1;
        L5:for(;(I[18299]<=12);I[18299]=((I[18299]+1)|0)){
          I[((20724+(I[($p0)>>2]+Math.imul(I[18299],20)-21)*4))>>2]=(((I[((73200+(I[18299]-1)*4))>>2]&1)!==0)?-1:0);
        }
        if(((I[($p1)>>2]&1)!==0)){
          R_display($p0);
        }
        break L2;
        break S3;
      }
      default:{
        if(((R_getoption(73300,73308))?true:false)){
          I[((73248+(I[18327]-1)*4))>>2]=((!((I[((73248+(I[18327]-1)*4))>>2]&1)!==0))?-1:0);
          I[((20724+(I[($p0)>>2]+Math.imul(I[18327],20)-21)*4))>>2]=(((I[((73248+(I[18327]-1)*4))>>2]&1)!==0)?-1:0);
          if(((I[($p1)>>2]&1)!==0)){
            H.stoptimer();
            R_display($p0);
            H.settimer();
          }
        }else{
          R_scbeep();
        }
      }
    }
  }
  R_cdclrl((I[18328]=23,73312),(I[18329]=2,73316));
  return;
}
/* CONQUEST.R: subroutine doorbit */
function R_doorbit($p0){
  if(((F[((19364+(I[($p0)>>2]-1)*4))>>2]===(-Math.fround(1.0)))||(F[((19364+(I[($p0)>>2]-1)*4))>>2]===(-Math.fround(2.0))))){
    R_infoplanet(73320,(I[18338]=((-I[((19524+(I[($p0)>>2]-1)*4))>>2])|0),73352),$p0);
  }else{
    if((!((R_findorbit($p0,73356))?true:false))){
      H.prints(388,73360,(26804+1+Math.imul(I[($p0)>>2],24)-25));
      R_putmsg(388,(I[18350]=23,73400));
      R_cdclrl((I[18351]=24,73404),(I[18352]=1,73408));
    }else{
      if((F[((19364+(I[($p0)>>2]-1)*4))>>2]>Math.fround(2.0))){
        H.prints(388,73412,(26804+1+Math.imul(I[($p0)>>2],24)-25));
        R_putmsg(388,(I[18362]=23,73448));
        H.prints(388,73452,(F[18375]=Math.fround(Math.fround($anint(Math.fround(Math.fround(2.0)*Math.fround(10.0))))/Math.fround(10.0)),73500));
        R_putmsg(388,(I[18376]=24,73504));
      }else{
        R_orbit($p0,73356);
        R_infoplanet(73508,(I[18384]=((-I[((19524+(I[($p0)>>2]-1)*4))>>2])|0),73536),$p0);
      }
    }
  }
  return;
}
/* CONQUEST.R: subroutine dophase */
function* R_dophase($p0){
  R_cdclrl((I[18385]=24,73540),(I[18386]=1,73544));
  if(((I[((20644+(I[($p0)>>2]-1)*4))>>2]&1)!==0)){
    R_putmsg(70460,(I[18387]=23,73548));
    return;
  }
  if((I[((20164+(I[($p0)>>2]-1)*4))>>2]>0)){
    R_putmsg(70300,(I[18388]=23,73552));
    return;
  }
  if((F[((19924+(I[($p0)>>2]-1)*4))>>2]<Math.fround(20.0))){
    R_putmsg(73092,(I[18389]=23,73556));
    return;
  }
  if((((yield* R_gettarget(73560,(I[18394]=23,73576),(I[18395]=1,73580),73584,(26004+(I[($p0)>>2]-1)*4))))?true:false)){
    if(((R_phaser($p0,73584))?true:false)){
      R_putmsg(73588,(I[18402]=24,73608));
    }else{
      R_putmsg(73140,(I[18403]=24,73612));
    }
  }
  R_cdclrl((I[18404]=23,73616),(I[18405]=1,73620));
  return;
}
/* CONQUEST.R: subroutine doplanlist */
function* R_doplanlist($p0){
  R_cdclear();
  L1:while(((R_stillalive(324))?true:false)){
    R_planlist((18724+(I[($p0)>>2]-1)*4));
    R_putpmt(68204,(I[18406]=24,73624));
    R_cdplay((I[18407]=(true?-1:0),73628));
    if((((yield* H.iogtimed(73632,(I[18409]=1,73636))))?true:false)){
      break L1;
    }
  }
  return;
}
/* CONQUEST.R: subroutine doreview */
function* R_doreview($p0){
  if((!(((yield* R_review($p0,(25604+(I[($p0)>>2]-1)*4))))?true:false))){
    R_putmsg(73640,(I[18417]=23,73668));
    R_putpmt(73672,(I[18426]=24,73704));
    R_cdplay((I[18427]=(true?-1:0),73708));
    L1:while(((!(((yield* H.iogtimed(73712,(I[18429]=1,73716))))?true:false))&&((R_stillalive(324))?true:false))){
    }
    R_cdclrl((I[18430]=23,73720),(I[18431]=2,73724));
  }
  return;
}
/* CONQUEST.R: subroutine doselfdest */
function* R_doselfdest(){
  R_cdclrl((I[18445]=23,73780),(I[18446]=2,73784));
  if(((yield* R_cdgetx(73728,(I[18447]=23,73788),(I[18448]=1,73792),68048,388,(I[18449]=90,73796)))!==10)){
    R_cdclrl((I[18450]=23,73800),(I[18451]=1,73804));
    return;
  }
  I[93]=(((113===B[(388+1-1)])||(81===B[(388+1-1)]))?-1:0);
  R_cdclrl((I[18452]=23,73808),(I[18453]=1,73812));
  I[((25524+(I[81]-1)*4))>>2]=15;
  R_gsecs(73816);
  H.stoptimer();
  R_display(324);
  H.settimer();
  I[96]=(true?-1:0);
  L1:while((I[((25524+(I[81]-1)*4))>>2]>0)){
    I[((25524+(I[81]-1)*4))>>2]=((15-R_dsecs(73816,73820))|0);
    if((I[((25524+(I[81]-1)*4))>>2]<3)){
      I[96]=(false?-1:0);
    }
    if((!((R_stillalive(324))?true:false))){
      I[((25524+(I[81]-1)*4))>>2]=0;
      return;
    }
    if(((H.iochav((I[18456]=0,73824)))?true:false)){
      R_grand(352);
      R_cdclrl((I[18457]=23,73828),(I[18458]=2,73832));
      if((((((yield* H.iogchar(73836)))?true:false)?-1:0)===27)){
        I[((25524+(I[81]-1)*4))>>2]=0;
        R_putmsg(73840,(I[18469]=23,73876));
        return;
      }else{
        R_putmsg(73880,(I[18480]=23,73920));
        R_scbeep();
        R_cdplay((I[18481]=(true?-1:0),73924));
      }
    }
    H.aston();
    (yield* H.sleep((F[18482]=Math.fround(0.1),73928)));
    H.astoff();
  }
  I[96]=(false?-1:0);
  if((I[3992]===1)){
    if((Math.fround(Math.sqrt(Math.fround(Math.fround(Math.pow(Math.fround(F[3994]-F[((18884+(I[81]-1)*4))>>2]),Math.fround(2)))+Math.fround(Math.pow(Math.fround(F[3995]-F[((18964+(I[81]-1)*4))>>2]),Math.fround(2))))))<=Math.fround(300.0))){
      I[3992]=2;
      R_stormsg((I[18483]=((-103)|0),73932),(I[18484]=((-100)|0),73936),73940);
      R_kill(324,(I[18488]=((-107)|0),73952));
    }else{
      R_kill(324,(I[18489]=((-100)|0),73956));
    }
  }else{
    R_kill(324,(I[18490]=((-100)|0),73960));
  }
  return;
}
/* CONQUEST.R: subroutine doshields */
function R_doshields($p0,$p1){
  I[((19604+(I[($p0)>>2]-1)*4))>>2]=(((I[($p1)>>2]&1)!==0)?-1:0);
  if(((I[($p1)>>2]&1)!==0)){
    I[((20564+(I[($p0)>>2]-1)*4))>>2]=(false?-1:0);
    R_putmsg(73964,(I[18495]=23,73980));
  }else{
    R_putmsg(73984,(I[18501]=23,74004));
  }
  R_cdclrl((I[18502]=24,74008),(I[18503]=1,74012));
  return;
}
/* CONQUEST.R: subroutine doteamlist */
function* R_doteamlist($p0){
  R_cdclear();
  L1:while(((R_stillalive(324))?true:false)){
    R_teamlist($p0);
    R_putpmt(68204,(I[18504]=24,74016));
    R_cdplay((I[18505]=(true?-1:0),74020));
    if((((yield* H.iogtimed(74024,(I[18507]=1,74028))))?true:false)){
      break L1;
    }
  }
  return;
}
/* CONQUEST.R: subroutine dotorp */
function* R_dotorp($p0){
  R_cdclrl((I[18508]=24,74032),(I[18509]=1,74036));
  if(((I[((20644+(I[($p0)>>2]-1)*4))>>2]&1)!==0)){
    R_putmsg(70460,(I[18510]=23,74040));
    return;
  }
  if((I[((20164+(I[($p0)>>2]-1)*4))>>2]>0)){
    R_putmsg(70300,(I[18511]=23,74044));
    return;
  }
  if((F[((19924+(I[($p0)>>2]-1)*4))>>2]<Math.fround(10.0))){
    R_putmsg(70520,(I[18512]=23,74048));
    return;
  }
  if((((yield* R_gettarget(74052,(I[18518]=23,74072),(I[18519]=1,74076),74080,(26004+(I[($p0)>>2]-1)*4))))?true:false)){
    if((!((R_launch($p0,74080))?true:false))){
      R_putmsg(70592,(I[18521]=24,74084));
    }
  }
  R_cdclrl((I[18522]=23,74088),(I[18523]=1,74092));
  return;
}
/* CONQUEST.R: subroutine dotow */
function* R_dotow($p0){
  R_cdclrl((I[18524]=23,74096),(I[18525]=2,74100));
  if((I[((25924+(I[($p0)>>2]-1)*4))>>2]!==0)){
    H.strcpy(74104,388);
    R_appship((25844+(I[($p0)>>2]-1)*4),388);
    H.appchr((I[18533]=33,74132),388);
    return;
  }
  if((I[((25844+(I[($p0)>>2]-1)*4))>>2]!==0)){
    H.strcpy(74136,388);
    R_appship((25844+(I[($p0)>>2]-1)*4),388);
    H.appchr((I[18541]=46,74164),388);
    return;
  }
  B[74200]=(yield* R_cdgetx(74168,(I[18547]=23,74188),(I[18548]=1,74192),68048,388,(I[18549]=90,74196)));
  R_cdclrl((I[18551]=23,74204),(I[18552]=1,74208));
  if((B[74200]===27)){
    return;
  }
  I[18553]=1;
  I[18555]=(((R_safectoi(74216,388,74212))?true:false)?-1:0);
  B[(388+1-1)]=0;
  H.pvlock(604);
  if(((I[18554]<1)||(I[18554]>20))){
    H.strcpy(71492,388);
  }else{
    if((I[((18484+(I[18554]-1)*4))>>2]!==3)){
      H.strcpy(71520,388);
    }else{
      if((I[18554]===I[($p0)>>2])){
        H.strcpy(74224,388);
      }else{
        if((Math.fround(Math.sqrt(Math.fround(Math.fround(Math.pow(Math.fround(F[((18884+(I[18554]-1)*4))>>2]-F[((18884+(I[($p0)>>2]-1)*4))>>2]),Math.fround(2)))+Math.fround(Math.pow(Math.fround(F[((18964+(I[18554]-1)*4))>>2]-F[((18964+(I[($p0)>>2]-1)*4))>>2]),Math.fround(2))))))>Math.fround(560.0))){
          H.strcpy(74248,388);
        }else{
          if((F[((19364+(I[18554]-1)*4))>>2]<Math.fround(0.0))){
            H.strcpy(74283,388);
          }else{
            if((Math.fround(Math.fround(Math.sqrt(Math.fround(Math.fround(Math.pow(Math.fround(F[((19044+(I[($p0)>>2]-1)*4))>>2]-F[((19044+(I[18554]-1)*4))>>2]),Math.fround(2)))+Math.fround(Math.pow(Math.fround(F[((19044+(I[($p0)>>2]-1)*4))>>2]-F[((19044+(I[18554]-1)*4))>>2]),Math.fround(2))))))/Math.fround(Math.fround(18.0)*Math.fround(0.1)))>Math.fround(4.0))){
              H.prints(388,74318,(F[18592]=Math.fround(4.0),74368));
            }else{
              if(((I[((25844+(I[18554]-1)*4))>>2]!==0)||(I[((25924+(I[18554]-1)*4))>>2]!==0))){
                H.strcpy(74372,388);
              }else{
                I[((25924+(I[18554]-1)*4))>>2]=I[($p0)>>2];
                I[((25844+(I[($p0)>>2]-1)*4))>>2]=I[18554];
                H.strcpy(74434,388);
              }
            }
          }
        }
      }
    }
  }
  H.pvunlock(604);
  R_putmsg(388,(I[18615]=24,74460));
  return;
}
/* CONQUEST.R: subroutine dountow */
function* R_dountow($p0){
  R_cdclrl((I[18616]=23,74464),(I[18617]=2,74468));
  if((I[((25924+(I[($p0)>>2]-1)*4))>>2]!==0)){
    I[18618]=((((I[((21684+(I[($p0)>>2]+Math.imul(I[((18724+(I[((25924+(I[($p0)>>2]-1)*4))>>2]-1)*4))>>2],20)-21)*4))>>2]&1)!==0)||((I[((21684+(I[((25924+(I[($p0)>>2]-1)*4))>>2]+Math.imul(I[((18724+(I[($p0)>>2]-1)*4))>>2],20)-21)*4))>>2]&1)!==0))?-1:0);
    if(((I[18618]&1)!==0)){
      R_grand(74476);
      L1:while((R_dgrand(74476,74480)<1000)){
        if((!((R_stillalive(324))?true:false))){
          return;
        }
        H.aston();
        (yield* H.sleep((F[18621]=Math.fround(0.1),74484)));
        H.astoff();
      }
    }
    if((((I[18618]&1)!==0)&&(R_rnd((I[18622]=0,74488))>Math.fround(0.3)))){
      R_putmsg(74492,(I[18631]=23,74524));
    }else{
      H.strcpy(74528,388);
      R_appship((25924+(I[($p0)>>2]-1)*4),388);
      H.pvlock(604);
      if((I[((25924+(I[($p0)>>2]-1)*4))>>2]!==0)){
        F[((19204+(I[($p0)>>2]-1)*4))>>2]=F[((19204+(I[((25924+(I[($p0)>>2]-1)*4))>>2]-1)*4))>>2];
        F[((19364+(I[($p0)>>2]-1)*4))>>2]=F[((19364+(I[((25924+(I[($p0)>>2]-1)*4))>>2]-1)*4))>>2];
        if((I[((25844+(I[((25924+(I[($p0)>>2]-1)*4))>>2]-1)*4))>>2]!==0)){
          I[((25844+(I[((25924+(I[($p0)>>2]-1)*4))>>2]-1)*4))>>2]=0;
        }
        I[((25924+(I[($p0)>>2]-1)*4))>>2]=0;
      }
      H.pvunlock(604);
      H.appchr((I[18639]=46,74556),388);
      R_putmsg(388,(I[18640]=23,74560));
    }
  }else{
    if((I[((25844+(I[($p0)>>2]-1)*4))>>2]!==0)){
      H.strcpy(74564,388);
      R_appship((25844+(I[($p0)>>2]-1)*4),388);
      H.pvlock(604);
      if((I[((25844+(I[($p0)>>2]-1)*4))>>2]!==0)){
        F[((19204+(I[((25844+(I[($p0)>>2]-1)*4))>>2]-1)*4))>>2]=F[((19204+(I[($p0)>>2]-1)*4))>>2];
        F[((19364+(I[((25844+(I[($p0)>>2]-1)*4))>>2]-1)*4))>>2]=F[((19364+(I[($p0)>>2]-1)*4))>>2];
        if((I[((25924+(I[((25844+(I[($p0)>>2]-1)*4))>>2]-1)*4))>>2]!==0)){
          I[((25924+(I[((25844+(I[($p0)>>2]-1)*4))>>2]-1)*4))>>2]=0;
        }
        I[((25844+(I[($p0)>>2]-1)*4))>>2]=0;
      }
      H.pvunlock(604);
      H.appchr((I[18647]=46,74588),388);
      R_putmsg(388,(I[18648]=23,74592));
    }else{
      R_putmsg(74596,(I[18658]=23,74632));
    }
  }
  return;
}
/* CONQUEST.R: subroutine dowar */
function* R_dowar($p0){
  I[18659]=1;
  L1:for(;(I[18659]<=4);I[18659]=((I[18659]+1)|0)){
    I[((74640+(I[18659]-1)*4))>>2]=(((I[((21684+(I[($p0)>>2]+Math.imul(I[18659],20)-21)*4))>>2]&1)!==0)?-1:0);
  }
  R_cdclrl((I[18664]=23,74656),(I[18665]=2,74660));
  R_cdputs(74664,(I[18685]=23,74740),(I[18686]=1,74744));
  L2:while(((R_stillalive(324))?true:false)){
    I[18659]=1;
    L3:for(;(I[18659]<=4);I[18659]=((I[18659]+1)|0)){
      if(((I[((74640+(I[18659]-1)*4))>>2]&1)!==0)){
        R_cdput((I[18687]=32,74748),(I[18688]=23,74752),(I[18689]=((50+Math.imul(I[18659],2))|0),74756));
        if(((I[((22004+(I[($p0)>>2]+Math.imul(I[18659],20)-21)*4))>>2]&1)!==0)){
          B[74760]=B[(15784+I[18659]-1)];
        }else{
          B[74760]=H.clower((15784+I[18659]-1));
        }
        R_cdput(74760,(I[18691]=23,74764),(I[18692]=((64+Math.imul(I[18659],2))|0),74768));
      }else{
        R_cdput((I[18693]=H.clower((15784+I[18659]-1)),74772),(I[18694]=23,74776),(I[18695]=((50+Math.imul(I[18659],2))|0),74780));
        R_cdput((I[18696]=32,74784),(I[18697]=23,74788),(I[18698]=((64+Math.imul(I[18659],2))|0),74792));
      }
    }
    R_cdplay((I[18699]=(true?-1:0),74796));
    if((!(((yield* H.iogtimed(74760,(I[18700]=1,74800))))?true:false))){
      continue L2;
    }
    B[74760]=H.clower(74760);
    if((B[74760]===27)){
      break L2;
    }
    if((B[74760]===10)){
      I[18701]=(false?-1:0);
      I[18659]=1;
      L4:for(;(I[18659]<=4);I[18659]=((I[18659]+1)|0)){
        if((((I[((74640+(I[18659]-1)*4))>>2]&1)!==0)&&(!((I[((21684+(I[($p0)>>2]+Math.imul(I[18659],20)-21)*4))>>2]&1)!==0)))){
          I[18701]=(true?-1:0);
        }
        I[((5132+(I[((18644+(I[($p0)>>2]-1)*4))>>2]+Math.imul(I[18659],40)-41)*4))>>2]=(((I[((74640+(I[18659]-1)*4))>>2]&1)!==0)?-1:0);
        I[((21684+(I[($p0)>>2]+Math.imul(I[18659],20)-21)*4))>>2]=(((I[((74640+(I[18659]-1)*4))>>2]&1)!==0)?-1:0);
      }
      if(((I[((18484+(I[($p0)>>2]-1)*4))>>2]!==6)&&((I[18701]&1)!==0))){
        R_putmsg(74808,(I[18716]=24,74864));
        R_cdplay((I[18717]=(true?-1:0),74868));
        R_grand(74872);
        L5:while((R_dgrand(74872,74876)<10000)){
          if((!((R_stillalive(324))?true:false))){
            return;
          }
          H.aston();
          (yield* H.sleep((F[18720]=Math.fround(0.1),74880)));
          H.astoff();
        }
      }
      break L2;
    }
    I[18659]=1;
    L6:for(;(I[18659]<=4);I[18659]=((I[18659]+1)|0)){
      if((B[74760]===H.clower((15784+I[18659]-1)))){
        if(((!((I[((74640+(I[18659]-1)*4))>>2]&1)!==0))||(!((I[((22004+(I[($p0)>>2]+Math.imul(I[18659],20)-21)*4))>>2]&1)!==0)))){
          I[((74640+(I[18659]-1)*4))>>2]=((!((I[((74640+(I[18659]-1)*4))>>2]&1)!==0))?-1:0);
          continue L2;
        }
        break L6;
      }
    }
    R_scbeep();
  }
  R_cdclrl((I[18721]=23,74884),(I[18722]=2,74888));
  return;
}
/* CONQUEST.R: subroutine dowarp */
function R_dowarp($p0,$p1){
  R_cdclrl((I[18723]=24,74892),(I[18724]=1,74896));
  if(((F[((19444+(I[($p0)>>2]-1)*4))>>2]===Math.fround(0.0))&&(F[($p1)>>2]!==Math.fround(0.0)))){
    if((I[((20244+(I[($p0)>>2]-1)*4))>>2]>0)){
      R_putmsg(74900,(I[18734]=23,74936));
      return;
    }
    if((!((R_usefuel($p0,(F[18735]=Math.fround(10.0),74940),(I[18736]=(false?-1:0),74944)))?true:false))){
      R_putmsg(74948,(I[18744]=23,74976));
      return;
    }
    I[((20564+(I[($p0)>>2]-1)*4))>>2]=(false?-1:0);
  }
  if((F[((19364+(I[($p0)>>2]-1)*4))>>2]<Math.fround(0.0))){
    F[((19364+(I[($p0)>>2]-1)*4))>>2]=Math.fround(0.0);
    I[((19524+(I[($p0)>>2]-1)*4))>>2]=0;
    F[((19284+(I[($p0)>>2]-1)*4))>>2]=F[((19204+(I[($p0)>>2]-1)*4))>>2];
  }
  F[((19444+(I[($p0)>>2]-1)*4))>>2]=Math.min(F[($p1)>>2],F[((15596+(I[((18724+(I[($p0)>>2]-1)*4))>>2]-1)*4))>>2]);
  H.prints(388,74980,(F[18748]=Math.fround($anint(F[((19444+(I[($p0)>>2]-1)*4))>>2])),74992));
  R_putmsg(388,(I[18749]=23,74996));
  F[18750]=Math.min(F[((15596+(I[((18724+(I[($p0)>>2]-1)*4))>>2]-1)*4))>>2],Math.max(Math.fround(0.0),Math.fround($anint(Math.fround(Math.fround(Math.fround(Math.fround(100.0)-F[((19844+(I[($p0)>>2]-1)*4))>>2])/Math.fround(100.0))*Math.fround(12.0))))));
  if((Math.fround($anint(F[((19444+(I[($p0)>>2]-1)*4))>>2]))>F[18750])){
    H.prints(388,75004,75000);
    R_putmsg(388,(I[18764]=24,75056));
  }
  return;
}
/* CONQUEST.R: function getoption */
function R_getoption($p0,$p1){
  S1:switch(B[$p0]){
    case 103:{
      I[($p1)>>2]=1;
      break S1;
    }
    case 112:{
      I[($p1)>>2]=2;
      break S1;
    }
    case 97:{
      I[($p1)>>2]=3;
      break S1;
    }
    case 105:{
      I[($p1)>>2]=4;
      break S1;
    }
    case 110:{
      I[($p1)>>2]=5;
      break S1;
    }
    case 116:{
      I[($p1)>>2]=6;
      break S1;
    }
    case 101:{
      I[($p1)>>2]=7;
      break S1;
    }
    default:{
      I[($p1)>>2]=0;
      I[18765]=(false?-1:0);
      return ((I[18765]&1)!==0);
    }
  }
  I[18765]=(true?-1:0);
  return ((I[18765]&1)!==0);
  return ((I[18765]&1)!==0);
}
/* CONQUEST.R: subroutine gretds */
function R_gretds(){
  I[18849]=$idiv(((I[85]-H.length(75319))|0),2);
  R_cdputs(75064,(I[18850]=1,75400),75396);
  R_cdputs(75126,(I[18851]=2,75404),75396);
  R_cdputs(75184,(I[18852]=3,75408),75396);
  R_cdputs(75245,(I[18853]=4,75412),75396);
  R_cdputs(75319,(I[18854]=5,75416),75396);
  return;
}
/* CONQUEST.R: subroutine menu */
function* R_menu(){
  R_initstats((27284+(I[81]-1)*4),(27364+(I[81]-1)*4));
  R_loghist(320);
  I[((18644+(I[81]-1)*4))>>2]=I[80];
  I[((18724+(I[81]-1)*4))>>2]=I[((1292+(I[80]-1)*4))>>2];
  I[((18804+(I[81]-1)*4))>>2]=I[82];
  I[18855]=1;
  L1:for(;(I[18855]<=12);I[18855]=((I[18855]+1)|0)){
    I[((20724+(I[81]+Math.imul(I[18855],20)-21)*4))>>2]=(((I[((5772+(I[80]+Math.imul(I[18855],40)-41)*4))>>2]&1)!==0)?-1:0);
  }
  I[18855]=1;
  L2:for(;(I[18855]<=4);I[18855]=((I[18855]+1)|0)){
    I[((22004+(I[81]+Math.imul(I[18855],20)-21)*4))>>2]=(false?-1:0);
    I[((21684+(I[81]+Math.imul(I[18855],20)-21)*4))>>2]=(((I[((5132+(I[80]+Math.imul(I[18855],40)-41)*4))>>2]&1)!==0)?-1:0);
  }
  R_stcpn((10892+1+Math.imul(I[80],24)-25),(26804+1+Math.imul(I[81],24)-25),(I[18856]=22,75424));
  I[18857]=(((I[((7692+(I[80]+Math.imul(3,40)-41)*4))>>2]&1)!==0)?-1:0);
  I[18858]=(((I[((7692+(I[80]+Math.imul(2,40)-41)*4))>>2]&1)!==0)?-1:0);
  I[18859]=(((I[150]&1)!==0)?-1:0);
  I[93]=(false?-1:0);
  I[18860]=(true?-1:0);
  I[18861]=0;
  I[18862]=0;
  L3:do{
    if(((I[81]<1)||(I[81]>20))){
      I[18863]=(true?-1:0);
    }else{
      if((I[((18804+(I[81]-1)*4))>>2]!==I[82])){
        I[18863]=(true?-1:0);
      }else{
        if((I[((18484+(I[81]-1)*4))>>2]!==6)){
          R_cerror((I[18864]=((-102)|0),75456),75460,324);
          I[18863]=(true?-1:0);
        }else{
          I[18863]=(false?-1:0);
        }
      }
    }
    if(((I[18863]&1)!==0)){
      I[18874]=7;
      I[18875]=11;
      R_cdclear();
      R_cdredo();
      R_cdputs(75504,75496,75500);
      I[18874]=((I[18874]+1)|0);
      R_cdputs(75566,75496,75500);
      I[18874]=((I[18874]+1)|0);
      R_cdputs(75628,75496,75500);
      I[18874]=((I[18874]+1)|0);
      R_cdputs(75690,75496,75500);
      I[18874]=((I[18874]+1)|0);
      R_cdputs(75752,75496,75500);
      I[18874]=((I[18874]+1)|0);
      R_cdputs(75814,75496,75500);
      I[18874]=((I[18874]+1)|0);
      R_cdputs(75876,75496,75500);
      I[18874]=((I[18874]+2)|0);
      R_cdputc(75885,75496);
      I[18874]=((I[18874]+2)|0);
      R_cdputs(75908,75496,75500);
      (yield* R_ioeat());
      R_cdmove((I[18993]=1,75972),(I[18994]=1,75976));
      R_cdplay((I[18995]=(false?-1:0),75980));
      return;
    }
    if(((((I[18858]&1)!==0)?-1:0)!==(((I[((7692+(I[80]+Math.imul(2,40)-41)*4))>>2]&1)!==0)?-1:0))){
      I[18858]=((!((I[18858]&1)!==0))?-1:0);
      I[18860]=(true?-1:0);
    }
    if(((((I[18857]&1)!==0)?-1:0)!==((((I[((7692+(I[80]+Math.imul(3,40)-41)*4))>>2]&1)!==0)||(I[((1612+(I[80]+Math.imul(6,40)-41)*4))>>2]<=0))?-1:0))){
      I[18857]=((!((I[18857]&1)!==0))?-1:0);
      I[18860]=(true?-1:0);
    }
    if(((((I[18859]&1)!==0)?-1:0)!==(((I[150]&1)!==0)?-1:0))){
      I[18859]=((!((I[18859]&1)!==0))?-1:0);
      I[18860]=(true?-1:0);
    }
    if(((I[18860]&1)!==0)){
      R_conqds(75432,75428);
      I[18860]=(false?-1:0);
    }else{
      R_cdclrl((I[18996]=23,75984),(I[18997]=2,75988));
    }
    R_userline((I[18998]=((-1)|0),75992),(I[18999]=((-1)|0),75996),388,(I[19000]=(false?-1:0),76000),(I[19001]=(true?-1:0),76004));
    R_cdputs(388,(I[19002]=23,76008),(I[19003]=1,76012));
    R_userline(320,324,388,(I[19004]=(false?-1:0),76016),(I[19005]=(true?-1:0),76020));
    R_cdputs(388,(I[19006]=24,76024),(I[19007]=1,76028));
    R_cdmove((I[19008]=1,76032),(I[19009]=1,76036));
    R_cdplay((I[19010]=(true?-1:0),76040));
    if((I[18862]>0)){
      I[18862]=((I[18862]-1)|0);
      if((I[18862]<=0)){
        R_drkill();
      }
    }
    I[((25524+(I[81]-1)*4))>>2]=((-300)|0);
    if((!(((yield* H.iogtimed(76044,(I[19012]=1,76048))))?true:false))){
      I[18861]=((I[18861]+1)|0);
      if((I[18861]>300)){
        break L3;
      }
      continue L3;
    }
    I[18861]=0;
    S4:switch(B[76044]){
      case 101:{
        (yield* R_play());
        if((I[83]!==0)){
          I[18862]=15;
        }else{
          I[18862]=0;
        }
        I[18860]=(true?-1:0);
        break S4;
      }
      case 104:{
        (yield* R_helplesson());
        I[18860]=(true?-1:0);
        break S4;
      }
      case 72:{
        (yield* R_histlist((I[19013]=(false?-1:0),76052)));
        I[18860]=(true?-1:0);
        break S4;
      }
      case 73:{
        (yield* R_dooption(324,(I[19014]=(false?-1:0),76056)));
        break S4;
      }
      case 76:{
        (yield* R_doreview(324));
        break S4;
      }
      case 110:{
        if((!((I[92]&1)!==0))){
          R_scbeep();
        }else{
          (yield* R_news());
          I[18860]=(true?-1:0);
        }
        break S4;
      }
      case 78:{
        (yield* R_pseudo(320,324));
        break S4;
      }
      case 114:{
        if(((I[18858]&1)!==0)){
          R_scbeep();
        }else{
          I[18855]=1;
          L5:for(;(I[18855]<=20);I[18855]=((I[18855]+1)|0)){
            if(((I[((18484+(I[18855]-1)*4))>>2]===3)||(I[((18484+(I[18855]-1)*4))>>2]===2))){
              if((I[((18644+(I[18855]-1)*4))>>2]===I[80])){
                break L5;
              }
            }
          }
          if((I[18855]<=20)){
            R_scbeep();
          }else{
            R_cdclrl((I[19015]=23,76060),(I[19016]=2,76064));
            R_cdplay((I[19017]=(false?-1:0),76068));
            if((((yield* R_confirm((I[19018]=0,76072))))?true:false)){
              R_resign(320);
              break L3;
            }
          }
        }
        break S4;
      }
      case 115:{
        if(((!((I[18858]&1)!==0))&&(!((I[18857]&1)!==0)))){
          R_scbeep();
        }else{
          I[((18724+(I[81]-1)*4))>>2]=R_modp1((I[19019]=((I[((18724+(I[81]-1)*4))>>2]+1)|0),76076),(I[19020]=4,76080));
          I[((1292+(I[80]-1)*4))>>2]=I[((18724+(I[81]-1)*4))>>2];
          I[((21684+(I[81]+Math.imul(I[((18724+(I[81]-1)*4))>>2],20)-21)*4))>>2]=(false?-1:0);
          I[((5132+(I[80]+Math.imul(I[((1292+(I[80]-1)*4))>>2],40)-41)*4))>>2]=(false?-1:0);
        }
        break S4;
      }
      case 83:{
        (yield* R_userstats((I[19021]=(false?-1:0),76084)));
        I[18860]=(true?-1:0);
        break S4;
      }
      case 84:{
        (yield* R_doteamlist((18724+(I[81]-1)*4)));
        I[18860]=(true?-1:0);
        break S4;
      }
      case 85:{
        (yield* R_userlist((I[19022]=(false?-1:0),76088)));
        I[18860]=(true?-1:0);
        break S4;
      }
      case 87:{
        (yield* R_dowar(324));
        I[18860]=(true?-1:0);
        break S4;
      }
      case 113:case 81:{
        break L3;
        break S4;
      }
      case 47:{
        (yield* R_playlist((I[19023]=(false?-1:0),76092),(I[19024]=(false?-1:0),76096)));
        I[18860]=(true?-1:0);
        break S4;
      }
      case 63:{
        (yield* R_doplanlist(324));
        I[18860]=(true?-1:0);
        break S4;
      }
      case 12:{
        R_cdredo();
        break S4;
      }
      case 32:case 13:case 19:case 17:{
        break S4;
      }
      default:{
        R_scbeep();
      }
    }
  }while(!(((!((R_stillalive(324))?true:false))||((I[93]&1)!==0))));
  if((I[((18484+(I[81]-1)*4))>>2]===6)){
    R_conqstats(324);
    H.pvlock(604);
    I[((25524+(I[81]-1)*4))>>2]=0;
    I[((18484+(I[81]-1)*4))>>2]=1;
    H.pvunlock(604);
  }
  return;
}
/* CONQUEST.R: function newship */
function* R_newship($p0,$p1){
  H.pvlock(604);
  I[((18484+(I[($p1)>>2]-1)*4))>>2]=2;
  I[19026]=(true?-1:0);
  I[19027]=0;
  I[19028]=1;
  L1:for(;(I[19028]<=20);I[19028]=((I[19028]+1)|0)){
    if(((I[((18484+(I[19028]-1)*4))>>2]===3)||(I[((18484+(I[19028]-1)*4))>>2]===2))){
      if(((I[((18644+(I[19028]-1)*4))>>2]===I[($p0)>>2])&&(I[($p1)>>2]!==I[19028]))){
        I[19027]=((I[19027]+1)|0);
      }
    }
  }
  H.pvunlock(604);
  if((!((I[((7692+(I[($p0)>>2]+Math.imul(2,40)-41)*4))>>2]&1)!==0))){
    if((I[19027]>0)){
      R_cdclear();
      R_cdredo();
      I[19028]=$idiv(24,2);
      I[19027]=15;
      R_cdputs(76116,76112,76108);
      if(((yield* R_cdgetx(76156,(I[19051]=((I[19028]+1)|0),76204),76108,68048,388,(I[19052]=90,76208)))!==10)){
        I[((18484+(I[($p1)>>2]-1)*4))>>2]=6;
        I[19025]=(false?-1:0);
        return ((I[19025]&1)!==0);
      }
      H.pvlock(604);
      I[19028]=1;
      L2:for(;(I[19028]<=20);I[19028]=((I[19028]+1)|0)){
        if(((I[((18644+(I[19028]-1)*4))>>2]===I[($p0)>>2])&&(I[((18484+(I[19028]-1)*4))>>2]===3))){
          I[19026]=(false?-1:0);
          I[((18484+(I[($p1)>>2]-1)*4))>>2]=1;
          I[($p1)>>2]=I[19028];
          I[((18804+(I[($p1)>>2]-1)*4))>>2]=I[82];
          I[((18484+(I[($p1)>>2]-1)*4))>>2]=2;
          break L2;
        }
      }
      H.pvunlock(604);
    }
  }else{
    if((I[19027]>=I[((1452+(I[($p0)>>2]-1)*4))>>2])){
      I[((18484+(I[($p1)>>2]-1)*4))>>2]=6;
      R_cdclear();
      R_cdredo();
      I[19028]=$idiv(24,2);
      R_cdputc(76212,76112);
      I[19028]=((I[19028]+1)|0);
      H.strcpy(76269,388);
      I[19027]=I[((1452+(I[($p0)>>2]-1)*4))>>2];
      R_appint(76108,388);
      H.appstr(76298,388);
      if((I[19027]!==1)){
        H.appchr((I[19076]=115,76304),388);
      }
      H.appstr(76308,388);
      R_cdputc(388,76112);
      R_cdplay((I[19081]=(false?-1:0),76324));
      (yield* H.sleep((F[19082]=Math.fround(2.0),76328)));
      I[19025]=(false?-1:0);
      return ((I[19025]&1)!==0);
    }
  }
  if(((I[19026]&1)!==0)){
    I[19083]=I[((18724+(I[($p1)>>2]-1)*4))>>2];
    if((!(((yield* R_capentry($p1,76332)))?true:false))){
      I[((18484+(I[($p1)>>2]-1)*4))>>2]=6;
      I[19025]=(false?-1:0);
      return ((I[19025]&1)!==0);
    }
  }
  H.pvlock(604);
  if(((I[19026]&1)!==0)){
    R_initship($p1,$p0);
    if((I[((14060+(I[((15500+(I[19083]-1)*4))>>2]-1)*4))>>2]===I[((15516+(I[19083]-1)*4))>>2])){
      I[19028]=I[((15516+(I[19083]-1)*4))>>2];
    }else{
      I[19028]=I[((15500+(I[19083]-1)*4))>>2];
    }
    R_putship($p1,(16184+(I[19028]-1)*4),(16344+(I[19028]-1)*4));
    F[((19284+(I[($p1)>>2]-1)*4))>>2]=R_rnduni((F[19084]=Math.fround(0.0),76336),(F[19085]=Math.fround(359.9),76340));
    F[((19204+(I[($p1)>>2]-1)*4))>>2]=F[((19284+(I[($p1)>>2]-1)*4))>>2];
    F[((19444+(I[($p1)>>2]-1)*4))>>2]=Math.fround(R_rndint((I[19086]=2,76344),(I[19087]=5,76348)));
    I[((19524+(I[($p1)>>2]-1)*4))>>2]=((-I[((15500+(I[19083]-1)*4))>>2])|0);
  }
  I[((26644+(I[($p1)>>2]-1)*4))>>2]=(false?-1:0);
  I[((26724+(I[($p1)>>2]-1)*4))>>2]=0;
  R_fixdeltas($p1);
  I[((18484+(I[($p1)>>2]-1)*4))>>2]=3;
  H.pvunlock(604);
  I[19025]=(true?-1:0);
  return ((I[19025]&1)!==0);
  return ((I[19025]&1)!==0);
}
/* CONQUEST.R: subroutine play */
function* R_play(){
  if((!(((yield* R_newship(320,324)))?true:false))){
    return;
  }
  R_drstart();
  I[((25524+(I[81]-1)*4))>>2]=0;
  R_grand(352);
  I[93]=(false?-1:0);
  I[95]=(true?-1:0);
  I[94]=(true?-1:0);
  I[96]=(true?-1:0);
  R_cdclear();
  R_cdredo();
  R_display(324);
  R_gsecs(76352);
  H.astoff();
  H.settimer();
  L1:while(((R_stillalive(324))?true:false)){
    if((I[((18804+(I[81]-1)*4))>>2]!==I[82])){
      break L1;
    }
    if((((yield* H.iogtimed(76356,(I[19090]=1,76360))))?true:false)){
      I[96]=(false?-1:0);
      (yield* R_command(76356));
      R_grand(352);
      I[96]=(true?-1:0);
      R_cdplay((I[19091]=(true?-1:0),76364));
    }
    if((R_dsecs(76352,76368)>=15)){
      R_conqstats(324);
      I[19088]=I[19092];
    }
  }
  I[94]=(false?-1:0);
  R_conqstats(324);
  H.upchuck();
  H.stoptimer();
  H.aston();
  (yield* R_dead(324,372));
  return;
}
/* CONQUEST.R: function welcome */
function* R_welcome($p0){
  H.glname(76596);
  if((!((R_gunum($p0,76596))?true:false))){
    R_cdclear();
    R_cdredo();
    if(((I[150]&1)!==0)){
      R_cdputc(76372,(I[19157]=$idiv(24,2),76628));
      R_cdputc(76543,(I[19158]=(($idiv(24,2)+1)|0),76632));
      R_cdmove((I[19159]=1,76636),(I[19160]=1,76640));
      R_cdplay((I[19161]=(false?-1:0),76644));
      (yield* H.sleep((F[19162]=Math.fround(2.0),76648)));
      I[19148]=(false?-1:0);
      return ((I[19148]&1)!==0);
    }
    I[19165]=R_rndint((I[19163]=1,76652),(I[19164]=4,76656));
    B[(388+1-1)]=0;
    R_apptitle(76660,388);
    H.appchr((I[19166]=32,76664),388);
    I[19167]=((H.length(388)+1)|0);
    H.appstr(76596,388);
    B[(388+I[19167]-1)]=H.cupper((388+I[19167]-1));
    if((!((R_register(76596,388,76660,$p0))?true:false))){
      R_cdputc(76429,(I[19168]=$idiv(24,2),76672));
      R_cdputc(76543,(I[19169]=(($idiv(24,2)+1)|0),76676));
      R_cdmove((I[19170]=1,76680),(I[19171]=1,76684));
      R_cdplay((I[19172]=(false?-1:0),76688));
      (yield* H.sleep((F[19173]=Math.fround(2.0),76692)));
      I[19148]=(false?-1:0);
      return ((I[19148]&1)!==0);
    }
    R_gretds();
    H.strcpy(76696,388);
    if((((((B[(15676+1+Math.imul(I[19165],12)-13)]===97)||(B[(15676+1+Math.imul(I[19165],12)-13)]===101))||(B[(15676+1+Math.imul(I[19165],12)-13)]===105))||(B[(15676+1+Math.imul(I[19165],12)-13)]===111))||(B[(15676+1+Math.imul(I[19165],12)-13)]===117))){
      H.appchr((I[19183]=110,76732),388);
    }
    H.appchr((I[19184]=32,76736),388);
    H.appstr((15676+1+Math.imul(I[19165],12)-13),388);
    H.appstr(76740,388);
    R_cdputc(388,(I[19188]=$idiv(24,2),76752));
    R_cdputc(76756,(I[19197]=(($idiv(24,2)+1)|0),76788));
    R_cdmove((I[19198]=1,76792),(I[19199]=1,76796));
    R_cdplay((I[19200]=(false?-1:0),76800));
    (yield* H.sleep((F[19201]=Math.fround(3.0),76804)));
  }
  if((((I[150]&1)!==0)&&(!((I[((7692+(I[($p0)>>2]+Math.imul(1,40)-41)*4))>>2]&1)!==0)))){
    R_cdclear();
    R_cdredo();
    R_cdputc(76372,(I[19202]=$idiv(24,2),76808));
    R_cdputc(76543,(I[19203]=(($idiv(24,2)+1)|0),76812));
    R_cdmove((I[19204]=1,76816),(I[19205]=1,76820));
    R_cdplay((I[19206]=(false?-1:0),76824));
    (yield* H.sleep((F[19207]=Math.fround(2.0),76828)));
    I[19148]=(false?-1:0);
    return ((I[19148]&1)!==0);
  }
  if(((I[((7692+(I[($p0)>>2]+Math.imul(4,40)-41)*4))>>2]&1)!==0)){
    R_cdclear();
    R_cdredo();
    R_cdputc(76489,(I[19208]=$idiv(24,2),76832));
    R_cdputc(76543,(I[19209]=(($idiv(24,2)+1)|0),76836));
    R_cdmove((I[19210]=1,76840),(I[19211]=1,76844));
    R_cdplay((I[19212]=(false?-1:0),76848));
    (yield* H.sleep((F[19213]=Math.fround(2.0),76852)));
    I[19148]=(false?-1:0);
    return ((I[19148]&1)!==0);
  }
  if((!((R_findship(324))?true:false))){
    R_cdclear();
    R_cdredo();
    R_cdputc(76856,(I[19228]=$idiv(24,2),76912));
    R_cdputc(76543,(I[19229]=(($idiv(24,2)+1)|0),76916));
    R_cdmove((I[19230]=1,76920),(I[19231]=1,76924));
    R_cdplay((I[19232]=(false?-1:0),76928));
    (yield* H.sleep((F[19233]=Math.fround(2.0),76932)));
    I[19148]=(false?-1:0);
    return ((I[19148]&1)!==0);
  }
  I[19148]=(true?-1:0);
  return ((I[19148]&1)!==0);
  return ((I[19148]&1)!==0);
}
/* CONQLB.R: subroutine chalkup */
function R_chalkup($p0){
  I[19234]=I[((18644+(I[($p0)>>2]-1)*4))>>2];
  I[19235]=I[((18724+(I[($p0)>>2]-1)*4))>>2];
  I[((1612+(I[19234]+Math.imul(3,40)-41)*4))>>2]=((I[((1612+(I[19234]+Math.imul(3,40)-41)*4))>>2]+$fix(F[((19764+(I[($p0)>>2]-1)*4))>>2]))|0);
  I[((748+(I[19235]+Math.imul(3,4)-5)*4))>>2]=((I[((748+(I[19235]+Math.imul(3,4)-5)*4))>>2]+$fix(F[((19764+(I[($p0)>>2]-1)*4))>>2]))|0);
  I[19236]=$fix(F[((19764+(I[($p0)>>2]-1)*4))>>2]);
  if((I[19236]>I[((1612+(I[19234]+Math.imul(5,40)-41)*4))>>2])){
    I[((1612+(I[19234]+Math.imul(5,40)-41)*4))>>2]=I[19236];
  }
  F[19237]=Math.fround(I[((1612+(I[19234]+Math.imul(4,40)-41)*4))>>2]);
  if((F[19237]===0)){
    F[19237]=Math.fround(1);
  }
  F[19238]=Math.fround(I[((1612+(I[19234]+Math.imul(3,40)-41)*4))>>2]);
  F[19239]=Math.fround(I[((1612+(I[19234]+Math.imul(5,40)-41)*4))>>2]);
  F[((4812+(I[19234]-1)*4))>>2]=Math.fround(Math.fround(F[19238]/F[19237])+Math.fround(F[19239]/Math.fround(4.0)));
  F[19240]=Math.fround(F[19238]-F[19237]);
  if((F[19240]>=Math.fround(0.0))){
    F[((4812+(I[19234]-1)*4))>>2]=Math.fround(F[((4812+(I[19234]-1)*4))>>2]+Math.fround(Math.pow(F[19240],Math.fround(Math.fround(1.0)/Math.fround(3.0)))));
  }else{
    F[((4812+(I[19234]-1)*4))>>2]=Math.fround(F[((4812+(I[19234]-1)*4))>>2]-Math.fround(Math.pow((-F[19240]),Math.fround(Math.fround(1.0)/Math.fround(3.0)))));
  }
  return;
}
/* CONQLB.R: function cloak */
function R_cloak($p0){
  I[((20564+(I[($p0)>>2]-1)*4))>>2]=(false?-1:0);
  if((!((R_usefuel($p0,(F[19242]=Math.fround(100.0),76968),(I[19243]=(false?-1:0),76972)))?true:false))){
    I[19241]=(false?-1:0);
    return ((I[19241]&1)!==0);
  }
  I[((20644+(I[($p0)>>2]-1)*4))>>2]=(true?-1:0);
  I[19241]=(true?-1:0);
  return ((I[19241]&1)!==0);
  return ((I[19241]&1)!==0);
}
/* CONQLB.R: subroutine damage */
function R_damage($p0,$p1,$p2){
  F[((19844+(I[($p0)>>2]-1)*4))>>2]=Math.fround(F[((19844+(I[($p0)>>2]-1)*4))>>2]+F[($p1)>>2]);
  if((F[((19844+(I[($p0)>>2]-1)*4))>>2]>=Math.fround(100.0))){
    R_kill($p0,$p2);
  }else{
    F[19244]=Math.min(F[((15596+(I[((18724+(I[($p0)>>2]-1)*4))>>2]-1)*4))>>2],Math.max(Math.fround(0.0),Math.fround($anint(Math.fround(Math.fround(Math.fround(Math.fround(100.0)-F[((19844+(I[($p0)>>2]-1)*4))>>2])/Math.fround(100.0))*Math.fround(12.0))))));
    F[((19444+(I[($p0)>>2]-1)*4))>>2]=Math.min(F[((19444+(I[($p0)>>2]-1)*4))>>2],F[19244]);
  }
  return;
}
/* CONQLB.R: subroutine detonate */
function R_detonate($p0,$p1){
  H.pvlock(604);
  if((I[((27604+(I[($p0)>>2]+Math.imul(I[($p1)>>2],20)-21)*4))>>2]===3)){
    I[((27604+(I[($p0)>>2]+Math.imul(I[($p1)>>2],20)-21)*4))>>2]=4;
  }
  H.pvunlock(604);
  return;
}
/* CONQLB.R: subroutine display */
function R_display($p0){
  if(((I[95]&1)!==0)){
    R_cdclear();
    I[19266]=((21+1)|0);
    R_cdline((I[19267]=1,77068),(I[19268]=24,77072),77064,(I[19269]=24,77076));
    R_cdline(77064,(I[19270]=1,77080),77064,340);
  }else{
    R_cdclra((I[19271]=1,77084),(I[19272]=((24+1)|0),77088),(I[19273]=21,77092),340);
  }
  I[19274]=(false?-1:0);
  F[19275]=Math.fround(1000000.0);
  F[19276]=Math.fround(1000000.0);
  I[19277]=0;
  I[19278]=0;
  I[19279]=(((I[((25764+(I[($p0)>>2]-1)*4))>>2]&1)!==0)?-1:0);
  if(((I[19279]&1)!==0)){
    F[19280]=Math.fround(1400.0);
    F[19281]=Math.fround(0.0);
    F[19282]=Math.fround(0.0);
  }else{
    F[19280]=Math.fround(170.0);
    F[19281]=F[((18884+(I[($p0)>>2]-1)*4))>>2];
    F[19282]=F[((18964+(I[($p0)>>2]-1)*4))>>2];
  }
  if(((I[150]&1)!==0)){
    R_cdputs(77132,(I[19285]=1,77140),(I[19286]=((((24+$idiv(((((I[85]-24)|0)-6)|0),2))|0)+1)|0),77144));
  }else{
    if(((I[((26644+(I[($p0)>>2]-1)*4))>>2]&1)!==0)){
      R_cdputs(77148,(I[19289]=1,77156),(I[19290]=((((24+$idiv(((((I[85]-24)|0)-5)|0),2))|0)+1)|0),77160));
    }
  }
  I[19291]=40;
  L1:for(;(I[19291]>=1);I[19291]=((I[19291]-1)|0)){
    if((!((I[((14700+(I[19291]-1)*4))>>2]&1)!==0))){
      continue L1;
    }
    if((!((R_cvtcoords(77124,77128,(16184+(I[19291]-1)*4),(16344+(I[19291]-1)*4),77120,77064,77168))?true:false))){
      continue L1;
    }
    if(((I[19279]&1)!==0)){
      if((I[((14540+(I[19291]-1)*4))>>2]===4)){
        continue L1;
      }
      if(((I[((14540+(I[19291]-1)*4))>>2]===3)||(!((I[((16824+(I[19291]+Math.imul(I[((18724+(I[($p0)>>2]-1)*4))>>2],40)-41)*4))>>2]&1)!==0)))){
        R_cdput((15772+I[((14540+(I[19291]-1)*4))>>2]-1),77064,77168);
      }else{
        if((((I[((16664+(I[19291]-1)*4))>>2]<=0)||(I[((16504+(I[19291]-1)*4))>>2]<1))||(I[((16504+(I[19291]-1)*4))>>2]>4))){
          B[77172]=45;
        }else{
          B[77172]=B[(15780+I[((16504+(I[19291]-1)*4))>>2]-1)];
        }
        if(((I[((20724+(I[($p0)>>2]+Math.imul(5,20)-21)*4))>>2]&1)!==0)){
          H.prints(77173,77263,77172,(16664+(I[19291]-1)*4),77172);
          R_cdputs(77173,77064,(I[19318]=((((I[19292]+2)|0)-H.length(77173))|0),77272));
        }else{
          if(((I[((16824+(I[19291]+Math.imul(I[((18724+(I[($p0)>>2]-1)*4))>>2],40)-41)*4))>>2]&1)!==0)){
            B[(77173+1-1)]=B[77172];
            B[(77173+2-1)]=B[(15772+I[((14540+(I[19291]-1)*4))>>2]-1)];
            B[(77173+3-1)]=B[77172];
            B[(77173+4-1)]=0;
            R_cdputs(77173,77064,(I[19319]=((I[19292]-1)|0),77276));
          }
        }
      }
      if(((I[((20724+(I[($p0)>>2]+Math.imul(2,20)-21)*4))>>2]&1)!==0)){
        B[(77173+1-1)]=B[(14860+1+Math.imul(I[19291],12)-13)];
        B[(77173+2-1)]=B[(14860+2+Math.imul(I[19291],12)-13)];
        B[(77173+3-1)]=B[(14860+3+Math.imul(I[19291],12)-13)];
        B[(77173+4-1)]=0;
        R_cdputs(77173,77064,(I[19320]=((I[19292]+2)|0),77280));
      }
    }else{
      R_puthing((14540+(I[19291]-1)*4),77064,77168);
      R_cdput((15772+I[((14540+(I[19291]-1)*4))>>2]-1),77064,77168);
      if(((I[((20724+(I[($p0)>>2]+Math.imul(2,20)-21)*4))>>2]&1)!==0)){
        if((((I[19266]+1)|0)<=21)){
          R_cdputs((14860+1+Math.imul(I[19291],12)-13),(I[19321]=((I[19266]+1)|0),77284),(I[19322]=((I[19292]+2)|0),77288));
        }
      }
    }
  }
  if((I[3992]===1)){
    if((!((I[19279]&1)!==0))){
      if(((R_cvtcoords(77124,77128,15976,15980,77120,77064,77168))?true:false)){
        I[19274]=(true?-1:0);
        F[19323]=Math.fround(Math.sin(Math.fround(Math.fround(F[3998]/Math.fround(180.0))*Math.fround(3.14159))));
        F[19324]=Math.fround(Math.cos(Math.fround(Math.fround(F[3998]/Math.fround(180.0))*Math.fround(3.14159))));
        F[19325]=(-Math.fround(Math.fround(800.0)/Math.fround(2.0)));
        L2:for(;(F[19325]<Math.fround(Math.fround(800.0)/Math.fround(2.0)));F[19325]=Math.fround(F[19325]+Math.fround(50.0))){
          if(((R_cvtcoords(77124,77128,(F[19326]=Math.fround(F[3994]+Math.fround(F[19325]*F[19324])),77304),(F[19327]=Math.fround(F[3995]+Math.fround(F[19325]*F[19323])),77308),77120,77064,77168))?true:false)){
            R_cdput((I[19328]=35,77312),77064,77168);
          }
        }
        if(((R_cvtcoords(77124,77128,(F[19329]=Math.fround(F[3994]+Math.fround(Math.fround(Math.fround(800.0)/Math.fround(2.0))*F[19324])),77316),(F[19330]=Math.fround(F[3995]+Math.fround(Math.fround(Math.fround(800.0)/Math.fround(2.0))*F[19323])),77320),77120,77064,77168))?true:false)){
          R_cdput((I[19331]=42,77324),77064,77168);
        }
      }
    }
  }
  if(((!((I[19279]&1)!==0))&&(I[((26164+(I[($p0)>>2]-1)*4))>>2]>0))){
    if(((I[((20724+(I[($p0)>>2]+Math.imul(1,20)-21)*4))>>2]&1)!==0)){
      F[19323]=Math.fround(Math.sin(Math.fround(Math.fround(F[((26084+(I[($p0)>>2]-1)*4))>>2]/Math.fround(180.0))*Math.fround(3.14159))));
      F[19324]=Math.fround(Math.cos(Math.fround(Math.fround(F[((26084+(I[($p0)>>2]-1)*4))>>2]/Math.fround(180.0))*Math.fround(3.14159))));
      B[77172]=B[(76980+R_modp1((I[19332]=(($idiv($nint(Math.fround(F[((26084+(I[($p0)>>2]-1)*4))>>2]+Math.fround(22.5))),45)+1)|0),77328),(I[19333]=8,77332))-1)];
      F[19325]=Math.fround(0);
      L3:for(;(F[19325]<=Math.fround(1000.0));F[19325]=Math.fround(F[19325]+Math.fround(50.0))){
        if(((R_cvtcoords(77124,77128,(F[19334]=Math.fround(F[((18884+(I[($p0)>>2]-1)*4))>>2]+Math.fround(F[19325]*F[19324])),77336),(F[19335]=Math.fround(F[((18964+(I[($p0)>>2]-1)*4))>>2]+Math.fround(F[19325]*F[19323])),77340),77120,77064,77168))?true:false)){
          R_cdput(77172,77064,77168);
        }
      }
    }
  }
  I[19291]=1;
  L4:for(;(I[19291]<=20);I[19291]=((I[19291]+1)|0)){
    if((I[((18484+(I[19291]-1)*4))>>2]!==1)){
      if((!((I[19279]&1)!==0))){
        if(((I[((20724+(I[($p0)>>2]+Math.imul(7,20)-21)*4))>>2]&1)!==0)){
          I[19336]=1;
          L5:for(;(I[19336]<=9);I[19336]=((I[19336]+1)|0)){
            if((I[((27604+(I[19291]+Math.imul(I[19336],20)-21)*4))>>2]===5)){
              if(((R_cvtcoords(77124,77128,(29044+(I[19291]+Math.imul(I[19336],20)-21)*4),(29764+(I[19291]+Math.imul(I[19336],20)-21)*4),77120,77064,77168))?true:false)){
                R_puthing((I[19337]=((-1)|0),77348),77064,77168);
              }
            }
          }
        }
        I[19336]=1;
        L6:for(;(I[19336]<=9);I[19336]=((I[19336]+1)|0)){
          if(((I[((27604+(I[19291]+Math.imul(I[19336],20)-21)*4))>>2]===3)||(I[((27604+(I[19291]+Math.imul(I[19336],20)-21)*4))>>2]===4))){
            if(((R_cvtcoords(77124,77128,(29044+(I[19291]+Math.imul(I[19336],20)-21)*4),(29764+(I[19291]+Math.imul(I[19336],20)-21)*4),77120,77064,77168))?true:false)){
              R_cdput((15780+I[((18724+(I[19291]-1)*4))>>2]-1),77064,77168);
            }
          }
        }
      }
      if((I[((18484+(I[19291]-1)*4))>>2]===3)){
        F[19338]=Math.fround(Math.sqrt(Math.fround(Math.fround(Math.pow(Math.fround(F[((18884+(I[19291]-1)*4))>>2]-F[((18884+(I[($p0)>>2]-1)*4))>>2]),Math.fround(2)))+Math.fround(Math.pow(Math.fround(F[((18964+(I[19291]-1)*4))>>2]-F[((18964+(I[($p0)>>2]-1)*4))>>2]),Math.fround(2))))));
        if((((F[19338]<Math.fround(3000.0))&&(!((I[((20644+(I[19291]-1)*4))>>2]&1)!==0)))&&(!((I[((21684+(I[($p0)>>2]+Math.imul(I[((18724+(I[($p0)>>2]-1)*4))>>2],20)-21)*4))>>2]&1)!==0)))){
          I[((26244+(I[19291]+Math.imul(I[((18724+(I[($p0)>>2]-1)*4))>>2],20)-21)*4))>>2]=5;
        }
        if((((I[((21684+(I[19291]+Math.imul(I[((18724+(I[($p0)>>2]-1)*4))>>2],20)-21)*4))>>2]&1)!==0)||((I[((21684+(I[($p0)>>2]+Math.imul(I[((18724+(I[19291]-1)*4))>>2],20)-21)*4))>>2]&1)!==0))){
          if((I[19291]!==I[($p0)>>2])){
            if((F[19338]<F[19275])){
              F[19275]=F[19338];
              I[19277]=I[19291];
            }
            if((F[19338]<F[19276])){
              if((!((I[((21684+(I[($p0)>>2]+Math.imul(I[((18724+(I[($p0)>>2]-1)*4))>>2],20)-21)*4))>>2]&1)!==0))){
                if((I[((26244+(I[19291]+Math.imul(I[((18724+(I[($p0)>>2]-1)*4))>>2],20)-21)*4))>>2]>0)){
                  F[19276]=F[19338];
                  I[19278]=I[19291];
                }
              }
            }
          }
        }
        if(((!((I[((20644+(I[19291]-1)*4))>>2]&1)!==0))||(I[19291]===I[($p0)>>2]))){
          if(((R_cvtcoords(77124,77128,(18884+(I[19291]-1)*4),(18964+(I[19291]-1)*4),77120,77064,77168))?true:false)){
            if((((((((!((I[19279]&1)!==0))||(!(((I[((21684+(I[19291]+Math.imul(I[((18724+(I[($p0)>>2]-1)*4))>>2],20)-21)*4))>>2]&1)!==0)||((I[((21684+(I[($p0)>>2]+Math.imul(I[((18724+(I[19291]-1)*4))>>2],20)-21)*4))>>2]&1)!==0))))?-1:0)|(I[((26244+(I[19291]+Math.imul(I[((18724+(I[($p0)>>2]-1)*4))>>2],20)-21)*4))>>2]&((!((I[((21684+(I[($p0)>>2]+Math.imul(I[((18724+(I[($p0)>>2]-1)*4))>>2],20)-21)*4))>>2]&1)!==0))?-1:0)))|((F[19338]<=Math.fround(3000.0))?-1:0)))&1)!==0){
              if(((I[19291]===I[($p0)>>2])&&((I[((20644+(I[($p0)>>2]-1)*4))>>2]&1)!==0))){
                B[77172]=126;
              }else{
                B[77172]=B[(15784+I[((18724+(I[19291]-1)*4))>>2]-1)];
              }
              R_cdput(77172,77064,77168);
              R_cdputn(77164,(I[19339]=0,77356),77064,(I[19340]=((I[19292]+2)|0),77360));
              I[19343]=R_modp1((I[19341]=(($idiv($nint(Math.fround(F[((19204+(I[19291]-1)*4))>>2]+Math.fround(22.5))),45)+1)|0),77364),(I[19342]=8,77368));
              I[19336]=((I[19266]+I[((76992+(I[19343]-1)*4))>>2])|0);
              I[19344]=((I[19292]+I[((77024+(I[19343]-1)*4))>>2])|0);
              if(((((I[19336]>=1)&&(I[19336]<=21))&&(I[19344]>24))&&(I[19344]<=I[85]))){
                R_cdput((76980+I[19343]-1),77344,77376);
              }
            }
          }
          if((I[($p0)>>2]===I[19291])){
            if((I[19266]<1)){
              I[19266]=1;
            }else{
              I[19266]=Math.min(I[19266],21);
            }
            if((I[19292]<((24+1)|0))){
              I[19292]=((24+1)|0);
            }else{
              I[19292]=Math.min(I[19292],I[85]);
            }
            R_cdmove(77064,77168);
          }
        }
      }
    }
  }
  if(((I[95]&1)!==0)){
    B[(77380+1-1)]=0;
  }
  B[(77173+1-1)]=0;
  if(((I[19277]!==0)||((I[((26564+(I[($p0)>>2]-1)*4))>>2]&1)!==0))){
    if((F[19275]<=Math.fround(1000.0))){
      H.strcpy(77470,77173);
      I[19274]=(true?-1:0);
    }else{
      if((F[19275]<Math.fround(2000.0))){
        H.strcpy(77481,77173);
        I[19274]=(true?-1:0);
      }else{
        if(((I[((26564+(I[($p0)>>2]-1)*4))>>2]&1)!==0)){
          H.strcpy(77488,77173);
          I[19277]=0;
          I[19274]=(true?-1:0);
        }else{
          if((F[19275]<Math.fround(3000.0))){
            H.strcpy(77499,77173);
          }else{
            if((I[19278]!==0)){
              I[19277]=I[19278];
              H.strcpy(77499,77173);
            }else{
              I[19277]=0;
            }
          }
        }
      }
    }
    if((I[19277]!==0)){
      R_appship(77108,77173);
      if(((I[((20644+(I[19277]-1)*4))>>2]&1)!==0)){
        H.appstr(77513,77173);
      }
    }
  }
  if((H.strcmp(77173,77380)!==0)){
    I[19266]=((21+1)|0);
    R_cdline(77064,(I[19381]=24,77524),77064,340);
    if((B[(77173+1-1)]!==0)){
      I[19292]=(((($idiv(((((I[85]-24)|0)-H.length(77173))|0),2)+24)|0)+1)|0);
      R_cdputs(77173,(I[19382]=((21+1)|0),77528),77168);
    }
    H.strcpy(77173,77380);
  }
  I[19266]=1;
  I[19292]=1;
  I[19383]=((I[19292]+14)|0);
  if((F[((19684+(I[($p0)>>2]-1)*4))>>2]<F[19264])){
    I[19274]=(true?-1:0);
  }
  F[19264]=F[((19684+(I[($p0)>>2]-1)*4))>>2];
  if(((I[95]&1)!==0)){
    I[19384]=((-9)|0);
    I[19385]=32;
  }
  I[19291]=$nint(F[((19684+(I[($p0)>>2]-1)*4))>>2]);
  if(((!((I[((19604+(I[($p0)>>2]-1)*4))>>2]&1)!==0))||((I[((20564+(I[($p0)>>2]-1)*4))>>2]&1)!==0))){
    I[19291]=((-1)|0);
  }
  if((I[19291]!==I[19384])){
    R_cdclra(77064,77532,77064,(I[19386]=((24-1)|0),77544));
    if((I[19291]===((-1)|0))){
      R_cdputs(77548,77064,77532);
    }else{
      H.prints(77173,77553,77164);
      R_cdputs(77173,77064,77532);
    }
    I[19384]=I[19291];
  }
  if((I[19291]<60)){
    I[19336]=83;
  }else{
    I[19336]=115;
  }
  if((I[19336]!==I[19385])){
    if((I[19336]===83)){
      R_cdputs(77556,77064,77168);
    }else{
      R_cdputs(77566,77064,77168);
    }
    I[19385]=I[19336];
  }
  I[19266]=((I[19266]+2)|0);
  if(((I[95]&1)!==0)){
    R_cdputs(77576,77064,77168);
    F[19396]=(-Math.fround(20.0));
  }
  F[19397]=Math.fround(Math.fround($anint(Math.fround(F[((19764+(I[($p0)>>2]-1)*4))>>2]*Math.fround(10.0))))/Math.fround(10.0));
  if((F[19397]!==F[19396])){
    R_cdclra(77064,77532,77064,(I[19398]=((24-1)|0),77592));
    H.prints(77173,77596,77588);
    R_cdputs(77173,77064,77532);
    F[19396]=F[19397];
  }
  I[19266]=((I[19266]+2)|0);
  if(((I[95]&1)!==0)){
    R_cdputs(77599,77064,77168);
    F[19402]=Math.fround(92.0);
  }
  F[19397]=Math.fround(Math.fround($anint(Math.fround(F[((19364+(I[($p0)>>2]-1)*4))>>2]*Math.fround(10.0))))/Math.fround(10.0));
  if((F[19397]!==F[19402])){
    R_cdclra(77064,77532,77064,(I[19403]=((24-1)|0),77612));
    if((F[19397]>=0)){
      H.prints(77173,77596,77588);
      R_cdputs(77173,77064,77532);
    }else{
      R_cdput((I[19404]=111,77616),77064,77532);
    }
    F[19402]=F[19397];
  }
  I[19266]=((I[19266]+2)|0);
  if(((I[95]&1)!==0)){
    R_cdputs(77620,77064,77168);
    I[19408]=999;
  }
  I[19291]=I[((19524+(I[($p0)>>2]-1)*4))>>2];
  if(((I[19291]>=0)||(F[((19364+(I[($p0)>>2]-1)*4))>>2]<Math.fround(0.0)))){
    I[19291]=$nint(F[((19204+(I[($p0)>>2]-1)*4))>>2]);
  }
  if((I[19291]!==I[19408])){
    R_cdclra(77064,77532,77064,(I[19409]=((24-1)|0),77636));
    if(((((-I[19291])|0)>=1)&&(((-I[19291])|0)<=40))){
      H.prints(77173,77640,(14860+1+Math.imul(((-I[19291])|0),12)-13));
    }else{
      H.prints(77173,77553,77164);
    }
    R_cdputs(77173,77064,77532);
    I[19408]=I[19291];
  }
  I[19266]=((I[19266]+2)|0);
  if(((I[95]&1)!==0)){
    I[19412]=((-99)|0);
    I[19413]=32;
  }
  I[19291]=$nint(F[((19924+(I[($p0)>>2]-1)*4))>>2]);
  if((I[19291]!==I[19412])){
    R_cdclra(77064,77532,77064,(I[19414]=((24-1)|0),77656));
    H.prints(77173,77553,77164);
    R_cdputs(77173,77064,77532);
    I[19412]=I[19291];
  }
  if((I[19291]<200)){
    I[19336]=70;
  }else{
    I[19336]=102;
  }
  if((I[19336]!==I[19413])){
    if((I[19336]===70)){
      R_cdputs(77660,77064,77168);
    }else{
      if((I[19336]===102)){
        R_cdputs(77667,77064,77168);
      }
    }
    I[19413]=I[19336];
  }
  I[19266]=((I[19266]+2)|0);
  if(((I[95]&1)!==0)){
    R_cdputs(77674,77064,77168);
    I[19420]=((-9)|0);
    I[19421]=((-9)|0);
  }
  I[19291]=I[((20324+(I[($p0)>>2]-1)*4))>>2];
  I[19336]=I[((20404+(I[($p0)>>2]-1)*4))>>2];
  if((I[((20164+(I[($p0)>>2]-1)*4))>>2]>0)){
    I[19291]=0;
  }
  if((I[((20244+(I[($p0)>>2]-1)*4))>>2]>0)){
    I[19336]=0;
  }
  if(((I[19291]!==I[19420])||(I[19336]!==I[19421]))){
    R_cdclra(77064,77532,77064,(I[19422]=((24-1)|0),77688));
    B[(77173+1-1)]=0;
    if((I[19291]===0)){
      H.appstr(71864,77173);
    }else{
      R_appint(77164,77173);
    }
    H.appchr((I[19423]=47,77692),77173);
    if((I[19336]===0)){
      H.appstr(71864,77173);
    }else{
      R_appint(77344,77173);
    }
    R_cdputs(77173,77064,77532);
    I[19420]=I[19291];
  }
  I[19266]=((I[19266]+2)|0);
  if(((I[95]&1)!==0)){
    I[19424]=0;
    I[19425]=0;
    I[19426]=32;
  }
  I[19291]=$nint(F[((20004+(I[($p0)>>2]-1)*4))>>2]);
  I[19336]=$nint(F[((20084+(I[($p0)>>2]-1)*4))>>2]);
  if((I[19291]>100)){
    I[19291]=100;
  }
  if((I[19336]>100)){
    I[19336]=100;
  }
  if(((I[19291]!==I[19424])||(I[19336]!==I[19425]))){
    R_cdclra(77064,77532,77064,(I[19427]=((24-1)|0),77708));
    if(((I[19291]!==0)||(I[19336]!==0))){
      B[(77173+1-1)]=0;
      if((I[19291]>=100)){
        H.appstr(71864,77173);
      }else{
        R_appint(77164,77173);
      }
      H.appchr((I[19428]=47,77712),77173);
      if((I[19336]>=100)){
        H.appstr(71864,77173);
      }else{
        R_appint(77344,77173);
      }
      R_cdputs(77173,77064,77532);
    }
    I[19424]=I[19291];
    I[19425]=I[19336];
  }
  if(((I[19291]===0)&&(I[19336]===0))){
    I[19336]=32;
  }else{
    if(((I[19291]>=80)||(I[19336]>=80))){
      I[19336]=84;
    }else{
      I[19336]=116;
    }
  }
  if((I[19336]!==I[19426])){
    R_cdclra(77064,77168,77064,(I[19429]=((I[19383]-1)|0),77716));
    if((I[19336]===116)){
      R_cdputs(77720,77064,77168);
    }else{
      if((I[19336]===84)){
        R_cdputs(77727,77064,77168);
      }
    }
    I[19426]=I[19336];
  }
  if((F[((19844+(I[($p0)>>2]-1)*4))>>2]>F[19265])){
    I[19274]=(true?-1:0);
  }
  F[19265]=F[((19844+(I[($p0)>>2]-1)*4))>>2];
  I[19266]=((I[19266]+2)|0);
  if(((I[95]&1)!==0)){
    I[19434]=((-9)|0);
    I[19435]=32;
  }
  I[19291]=$nint(F[((19844+(I[($p0)>>2]-1)*4))>>2]);
  if((I[19291]!==I[19434])){
    R_cdclra(77064,77532,77064,(I[19436]=((24-1)|0),77744));
    if((I[19291]>0)){
      H.prints(77173,77553,77164);
      R_cdputs(77173,77064,77532);
    }
    I[19434]=I[19291];
  }
  if(((I[((20564+(I[($p0)>>2]-1)*4))>>2]&1)!==0)){
    I[19336]=114;
  }else{
    if((I[19291]>=50)){
      I[19336]=68;
    }else{
      if((I[19291]>0)){
        I[19336]=100;
      }else{
        I[19336]=32;
      }
    }
  }
  if((I[19336]!==I[19435])){
    R_cdclra(77064,77168,77064,(I[19437]=((I[19383]-1)|0),77748));
    if((I[19336]===114)){
      R_cdputs(77752,77064,77168);
    }else{
      if((I[19336]===100)){
        R_cdputs(77766,77064,77168);
      }else{
        if((I[19336]===68)){
          R_cdputs(77775,77064,77168);
        }
      }
    }
    I[19435]=I[19336];
  }
  I[19266]=((I[19266]+2)|0);
  if(((I[95]&1)!==0)){
    I[19446]=((-666)|0);
  }
  I[19291]=I[((20484+(I[($p0)>>2]-1)*4))>>2];
  if((I[19291]===0)){
    I[19291]=((-I[((26724+(I[($p0)>>2]-1)*4))>>2])|0);
  }
  if((I[19291]!==I[19446])){
    R_cdclra(77064,77168,77064,(I[19447]=((24-1)|0),77788));
    if((I[19291]>0)){
      R_cdputs(77792,77064,77168);
      H.prints(77173,77553,77164);
      R_cdputs(77173,77064,77532);
    }else{
      if((I[19291]<0)){
        R_cdputs(77801,77064,77168);
        R_robstr((I[19453]=((-I[19291])|0),77812),77173);
        R_cdputs(77173,77064,77532);
      }
    }
    I[19446]=I[19291];
  }
  I[19266]=((I[19266]+2)|0);
  if(((I[95]&1)!==0)){
    I[19454]=0;
  }
  I[19291]=I[((25924+(I[($p0)>>2]-1)*4))>>2];
  if((I[19291]===0)){
    I[19291]=((-I[((25844+(I[($p0)>>2]-1)*4))>>2])|0);
  }
  if((I[19291]!==I[19454])){
    R_cdclra(77064,77168,77064,(I[19455]=((I[19383]-1)|0),77820));
    if((I[19291]===0)){
      B[(77173+1-1)]=0;
    }else{
      if((I[19291]<0)){
        H.strcpy(77824,77173);
        R_appship((I[19458]=((-I[19291])|0),77832),77173);
      }else{
        if((I[19291]>0)){
          H.strcpy(77836,77173);
          R_appship(77164,77173);
        }
      }
    }
    R_cdputs(77173,77064,77168);
    I[19454]=I[19291];
  }
  I[19266]=((I[19266]+2)|0);
  if(((I[95]&1)!==0)){
    I[19462]=((-9)|0);
  }
  if(((I[((20644+(I[($p0)>>2]-1)*4))>>2]&1)!==0)){
    I[19291]=((-1)|0);
  }else{
    I[19291]=Math.max(0,I[((25524+(I[($p0)>>2]-1)*4))>>2]);
  }
  if((I[19291]!==I[19462])){
    R_cdclra(77064,77168,77064,(I[19463]=((24-1)|0),77852));
    if((I[19291]>0)){
      H.prints(77173,77856,77164);
      R_cdputs(77173,77064,77168);
    }else{
      if((I[19291]===((-1)|0))){
        R_cdputs(77876,77064,77168);
      }
    }
    I[19462]=I[19291];
  }
  if(((I[19274]&1)!==0)){
    if(((I[((20724+(I[($p0)>>2]+Math.imul(3,20)-21)*4))>>2]&1)!==0)){
      R_scbeep();
    }
  }
  R_cdplay((I[19471]=(true?-1:0),77884));
  I[95]=(false?-1:0);
  return;
}
/* CONQLB.R: function enemydet */
function R_enemydet($p0){
  I[((20564+(I[($p0)>>2]-1)*4))>>2]=(false?-1:0);
  if((!((R_usefuel($p0,(F[19473]=Math.fround(5.0),77892),(I[19474]=(true?-1:0),77896)))?true:false))){
    I[19472]=(false?-1:0);
    return ((I[19472]&1)!==0);
  }
  I[19475]=1;
  L1:for(;(I[19475]<=20);I[19475]=((I[19475]+1)|0)){
    if(((I[((18484+(I[19475]-1)*4))>>2]!==1)&&(I[19475]!==I[($p0)>>2]))){
      I[19476]=1;
      L2:for(;(I[19476]<=9);I[19476]=((I[19476]+1)|0)){
        if((I[((27604+(I[19475]+Math.imul(I[19476],20)-21)*4))>>2]===3)){
          if((((I[((32644+(I[19475]+Math.imul(I[19476],20)+Math.imul(I[((18724+(I[($p0)>>2]-1)*4))>>2],180)-201)*4))>>2]&1)!==0)||((I[((21684+(I[($p0)>>2]+Math.imul(I[((18724+(I[19475]-1)*4))>>2],20)-21)*4))>>2]&1)!==0))){
            if((Math.fround(Math.sqrt(Math.fround(Math.fround(Math.pow(Math.fround(F[((29044+(I[19475]+Math.imul(I[19476],20)-21)*4))>>2]-F[((18884+(I[($p0)>>2]-1)*4))>>2]),Math.fround(2)))+Math.fround(Math.pow(Math.fround(F[((29764+(I[19475]+Math.imul(I[19476],20)-21)*4))>>2]-F[((18964+(I[($p0)>>2]-1)*4))>>2]),Math.fround(2))))))<=Math.fround(1000.0))){
              R_detonate(77900,77904);
            }
          }
        }
      }
    }
  }
  I[19472]=(true?-1:0);
  return ((I[19472]&1)!==0);
  return ((I[19472]&1)!==0);
}
/* CONQLB.R: subroutine hit */
function R_hit($p0,$p1,$p2){
  if((F[($p1)>>2]>Math.fround(0.0))){
    if((((I[((19604+(I[($p0)>>2]-1)*4))>>2]&1)!==0)&&(!((I[((20564+(I[($p0)>>2]-1)*4))>>2]&1)!==0)))){
      if((F[($p1)>>2]>F[((19684+(I[($p0)>>2]-1)*4))>>2])){
        R_damage($p0,(F[19477]=Math.fround(F[($p1)>>2]-F[((19684+(I[($p0)>>2]-1)*4))>>2]),77908),$p2);
        F[((19684+(I[($p0)>>2]-1)*4))>>2]=Math.fround(0.0);
      }else{
        F[((19684+(I[($p0)>>2]-1)*4))>>2]=Math.fround(F[((19684+(I[($p0)>>2]-1)*4))>>2]-F[($p1)>>2]);
      }
    }else{
      R_damage($p0,$p1,$p2);
    }
  }
  return;
}
/* CONQLB.R: subroutine ikill */
function R_ikill($p0,$p1){
  if((I[((18484+(I[($p0)>>2]-1)*4))>>2]!==3)){
    return;
  }
  I[((18564+(I[($p0)>>2]-1)*4))>>2]=I[($p1)>>2];
  I[((18484+(I[($p0)>>2]-1)*4))>>2]=4;
  I[19478]=I[((18644+(I[($p0)>>2]-1)*4))>>2];
  I[19479]=I[((18724+(I[($p0)>>2]-1)*4))>>2];
  I[19480]=1;
  L1:for(;(I[19480]<=9);I[19480]=((I[19480]+1)|0)){
    if((I[((27604+(I[($p0)>>2]+Math.imul(I[19480],20)-21)*4))>>2]===3)){
      I[((27604+(I[($p0)>>2]+Math.imul(I[19480],20)-21)*4))>>2]=4;
    }
  }
  if((I[((25844+(I[($p0)>>2]-1)*4))>>2]!==0)){
    I[((25924+(I[((25844+(I[($p0)>>2]-1)*4))>>2]-1)*4))>>2]=0;
  }
  if((I[((25924+(I[($p0)>>2]-1)*4))>>2]!==0)){
    I[((25844+(I[((25924+(I[($p0)>>2]-1)*4))>>2]-1)*4))>>2]=0;
  }
  I[19480]=1;
  L2:for(;(I[19480]<=4);I[19480]=((I[19480]+1)|0)){
    I[((26244+(I[($p0)>>2]+Math.imul(I[19480],20)-21)*4))>>2]=0;
  }
  if((I[($p1)>>2]===((-102)|0))){
    F[((19764+(I[($p0)>>2]-1)*4))>>2]=Math.fround(F[((19764+(I[($p0)>>2]-1)*4))>>2]+Math.fround(3.0));
  }else{
    if((I[($p1)>>2]===((-107)|0))){
      F[((19764+(I[($p0)>>2]-1)*4))>>2]=Math.fround(F[((19764+(I[($p0)>>2]-1)*4))>>2]+Math.fround(5.0));
    }else{
      if((I[($p1)>>2]>0)){
        I[19481]=I[((18644+(I[($p1)>>2]-1)*4))>>2];
        I[19482]=I[((18724+(I[($p1)>>2]-1)*4))>>2];
        F[19483]=Math.fround(Math.fround(1.0)+Math.fround(F[((19764+(I[($p0)>>2]-1)*4))>>2]*Math.fround(0.1)));
        if((I[((20484+(I[($p0)>>2]-1)*4))>>2]>0)){
          F[19483]=Math.fround(F[19483]+Math.fround(Math.fround(I[((20484+(I[($p0)>>2]-1)*4))>>2])*Math.fround(0.1)));
          I[((1612+(I[19481]+Math.imul(12,40)-41)*4))>>2]=((I[((1612+(I[19481]+Math.imul(12,40)-41)*4))>>2]+I[((20484+(I[($p0)>>2]-1)*4))>>2])|0);
          I[((748+(I[19482]+Math.imul(11,4)-5)*4))>>2]=((I[((748+(I[19482]+Math.imul(11,4)-5)*4))>>2]+I[((20484+(I[($p0)>>2]-1)*4))>>2])|0);
        }
        if((I[((18484+(I[($p1)>>2]-1)*4))>>2]===3)){
          F[((19764+(I[($p1)>>2]-1)*4))>>2]=Math.fround(F[((19764+(I[($p1)>>2]-1)*4))>>2]+F[19483]);
        }else{
          I[((1612+(I[19481]+Math.imul(3,40)-41)*4))>>2]=((I[((1612+(I[19481]+Math.imul(3,40)-41)*4))>>2]-$fix(F[((19764+(I[($p1)>>2]-1)*4))>>2]))|0);
          I[((748+(I[19482]+Math.imul(3,4)-5)*4))>>2]=((I[((748+(I[19482]+Math.imul(3,4)-5)*4))>>2]-$fix(F[((19764+(I[($p1)>>2]-1)*4))>>2]))|0);
          F[((19764+(I[($p1)>>2]-1)*4))>>2]=Math.fround(F[((19764+(I[($p1)>>2]-1)*4))>>2]+F[19483]);
          R_chalkup($p1);
        }
        if((!((I[((21684+(I[($p0)>>2]+Math.imul(I[19482],20)-21)*4))>>2]&1)!==0))){
          I[((21684+(I[($p1)>>2]+Math.imul(I[19479],20)-21)*4))>>2]=(true?-1:0);
          I[((22004+(I[($p1)>>2]+Math.imul(I[19479],20)-21)*4))>>2]=(true?-1:0);
        }
      }
    }
  }
  R_chalkup($p0);
  if(((((((I[($p1)>>2]!==((-100)|0))&&(I[($p1)>>2]!==((-102)|0)))&&(I[($p1)>>2]!==((-103)|0)))&&(I[($p1)>>2]!==((-104)|0)))&&(I[($p1)>>2]!==((-105)|0)))&&(I[($p1)>>2]!==((-108)|0)))){
    I[((1612+(I[19478]+Math.imul(4,40)-41)*4))>>2]=((I[((1612+(I[19478]+Math.imul(4,40)-41)*4))>>2]+1)|0);
    I[((748+(I[19479]+Math.imul(4,4)-5)*4))>>2]=((I[((748+(I[19479]+Math.imul(4,4)-5)*4))>>2]+1)|0);
  }
  if(((!((I[((26644+(I[($p0)>>2]-1)*4))>>2]&1)!==0))||(I[((18804+(I[($p0)>>2]-1)*4))>>2]!==0))){
    I[((18484+(I[($p0)>>2]-1)*4))>>2]=5;
    I[((25524+(I[($p0)>>2]-1)*4))>>2]=((-300)|0);
  }else{
    I[((18484+(I[($p0)>>2]-1)*4))>>2]=1;
    I[((18564+(I[($p0)>>2]-1)*4))>>2]=0;
  }
  return;
}
/* CONQLB.R: subroutine infoplanet */
function R_infoplanet($p0,$p1,$p2){
  if(((I[($p1)>>2]<1)||(I[($p1)>>2]>40))){
    R_putmsg(77936,(I[19488]=23,77952));
    R_cdclrl((I[19489]=24,77956),(I[19490]=1,77960));
    R_cdmove((I[19491]=23,77964),(I[19492]=1,77968));
    R_cerror((I[19493]=((-102)|0),77972),77976,$p1);
    return;
  }
  I[19505]=(((I[($p2)>>2]<1)||(I[($p2)>>2]>20))?-1:0);
  B[(78024+1-1)]=0;
  if(((I[((14540+(I[($p1)>>2]-1)*4))>>2]===1)||(I[((14540+(I[($p1)>>2]-1)*4))>>2]===2))){
    if((!((I[19505]&1)!==0))){
      if((((I[((16824+(I[($p1)>>2]+Math.imul(I[((18724+(I[($p2)>>2]-1)*4))>>2],40)-41)*4))>>2]&1)!==0)&&((R_spwar($p2,$p1))?true:false))){
        H.appstr(78114,78024);
      }
    }
  }
  S1:switch(R_phoon($p1)){
    case 2:{
      H.appstr(78125,78024);
      break S1;
    }
    case 3:{
      H.appstr(78142,78024);
      break S1;
    }
    case 0:{
      H.appstr(78150,78024);
      break S1;
    }
    case 1:{
      H.appstr(78166,78024);
      break S1;
    }
    case -1:{
      break S1;
    }
    default:{
      H.appstr(78173,78024);
    }
  }
  if(((I[19505]&1)!==0)){
    F[19546]=Math.fround(0.0);
    F[19547]=Math.fround(0.0);
  }else{
    F[19546]=F[((18884+(I[($p2)>>2]-1)*4))>>2];
    F[19547]=F[((18964+(I[($p2)>>2]-1)*4))>>2];
  }
  H.prints(78192,78372,$p0,(14860+1+Math.imul(I[($p1)>>2],12)-13),(15340+1+Math.imul(I[((14540+(I[($p1)>>2]-1)*4))>>2],20)-21),78024,(I[19603]=$nint(Math.fround(Math.sqrt(Math.fround(Math.fround(Math.pow(Math.fround(F[((16184+(I[($p1)>>2]-1)*4))>>2]-F[19546]),Math.fround(2)))+Math.fround(Math.pow(Math.fround(F[((16344+(I[($p1)>>2]-1)*4))>>2]-F[19547]),Math.fround(2))))))),78412),(I[19604]=$nint(R_angle(78184,78188,(16184+(I[($p1)>>2]-1)*4),(16344+(I[($p1)>>2]-1)*4))),78416));
  if(((I[19505]&1)!==0)){
    I[19605]=(true?-1:0);
  }else{
    I[19605]=(((I[((16824+(I[($p1)>>2]+Math.imul(I[((18724+(I[($p2)>>2]-1)*4))>>2],40)-41)*4))>>2]&1)!==0)?-1:0);
  }
  B[(78024+1-1)]=0;
  if(((I[((14540+(I[($p1)>>2]-1)*4))>>2]!==3)&&(I[((14540+(I[($p1)>>2]-1)*4))>>2]!==4))){
    if((!((I[19605]&1)!==0))){
      H.strcpy(78424,78024);
    }else{
      I[19615]=I[((16664+(I[($p1)>>2]-1)*4))>>2];
      if((I[19615]===0)){
        I[19616]=I[((15808+(I[($p1)>>2]-1)*4))>>2];
        if((I[19616]>0)){
          H.prints(78024,78468,78464);
        }else{
          H.strcpy(78502,78024);
        }
      }else{
        H.prints(78024,78517,78460,(15676+1+Math.imul(I[((16504+(I[($p1)>>2]-1)*4))>>2],12)-13));
        if((I[19615]===1)){
          H.appstr(70396,78024);
        }else{
          H.appstr(69724,78024);
        }
      }
    }
    if(((I[19505]&1)!==0)){
      I[19605]=(false?-1:0);
    }else{
      I[19605]=(((I[($p1)>>2]===I[((15500+(I[((18724+(I[($p2)>>2]-1)*4))>>2]-1)*4))>>2])&&((I[((1068+(I[((18724+(I[($p2)>>2]-1)*4))>>2]-1)*4))>>2]&1)!==0))?-1:0);
    }
    if(((I[19605]&1)!==0)){
      I[19616]=I[((15792+(I[((18724+(I[($p2)>>2]-1)*4))>>2]-1)*4))>>2];
      if((I[19616]>0)){
        if((B[(78024+1-1)]!==0)){
          H.appstr(66179,78024);
        }
        R_appint(78464,78024);
        H.appstr(78532,78024);
      }
    }
  }
  if((B[(78024+1-1)]===0)){
    H.appchr((I[19640]=46,78560),78192);
  }else{
    H.appchr((I[19641]=44,78564),78192);
    H.appchr((I[19642]=46,78568),78024);
  }
  I[19615]=H.length(78192);
  I[19616]=69;
  if((I[19615]<=I[19616])){
    R_putmsg(78192,(I[19643]=23,78572));
    if((B[(78024+1-1)]!==0)){
      R_putmsg(78024,(I[19644]=24,78576));
    }else{
      R_cdclrl((I[19645]=24,78580),(I[19646]=1,78584));
    }
  }else{
    I[19615]=((I[19616]+1)|0);
    L2:while(((B[(78192+I[19615]-1)]!==32)&&(I[19615]>1))){
      I[19615]=((I[19615]-1)|0);
    }
    H.appchr((I[19647]=32,78588),78192);
    H.appstr(78024,78192);
    B[(78192+I[19615]-1)]=0;
    R_putmsg(78192,(I[19648]=23,78592));
    R_putmsg((78192+((I[19615]+1)|0)-1),(I[19649]=24,78596));
  }
  R_cdmove((I[19650]=23,78600),(I[19651]=1,78604));
  return;
}
/* CONQLB.R: subroutine infoship */
function R_infoship($p0,$p1){
  I[19652]=(((I[($p1)>>2]<1)||(I[($p1)>>2]>20))?-1:0);
  R_cdclrl((I[19653]=24,78612),(I[19654]=1,78616));
  if(((I[($p0)>>2]<1)||(I[($p0)>>2]>20))){
    R_putmsg(71492,(I[19655]=23,78620));
    R_cdmove((I[19656]=23,78624),(I[19657]=1,78628));
    return;
  }
  I[19658]=I[((18484+(I[($p0)>>2]-1)*4))>>2];
  if(((!((I[19652]&1)!==0))&&(I[19658]!==3))){
    R_putmsg(71520,(I[19659]=23,78636));
    R_cdmove((I[19660]=23,78640),(I[19661]=1,78644));
    return;
  }
  B[(388+1-1)]=0;
  R_appship($p0,388);
  if((I[($p0)>>2]===I[($p1)>>2])){
    H.appstr(78648,388);
    R_putmsg(388,(I[19667]=23,78668));
    R_cdmove((I[19668]=23,78672),(I[19669]=1,78676));
    return;
  }
  if(((I[19652]&1)!==0)){
    F[19670]=Math.fround(0.0);
    F[19671]=Math.fround(0.0);
  }else{
    F[19670]=F[((18884+(I[($p1)>>2]-1)*4))>>2];
    F[19671]=F[((18964+(I[($p1)>>2]-1)*4))>>2];
  }
  if(((I[((20644+(I[($p0)>>2]-1)*4))>>2]&1)!==0)){
    F[19673]=R_rndnor((18884+(I[($p0)>>2]-1)*4),(F[19672]=Math.fround(500.0),78688));
    F[19675]=R_rndnor((18964+(I[($p0)>>2]-1)*4),(F[19674]=Math.fround(500.0),78696));
  }else{
    F[19673]=F[((18884+(I[($p0)>>2]-1)*4))>>2];
    F[19675]=F[((18964+(I[($p0)>>2]-1)*4))>>2];
  }
  F[19676]=Math.fround(Math.sqrt(Math.fround(Math.fround(Math.pow(Math.fround(F[19673]-F[19670]),Math.fround(2)))+Math.fround(Math.pow(Math.fround(F[19675]-F[19671]),Math.fround(2))))));
  if(((I[19652]&1)!==0)){
    I[19677]=(true?-1:0);
  }else{
    if((((F[19676]<Math.fround(3000.0))&&(!((I[((20644+(I[($p0)>>2]-1)*4))>>2]&1)!==0)))&&(!((I[((21684+(I[($p1)>>2]+Math.imul(I[((18724+(I[($p1)>>2]-1)*4))>>2],20)-21)*4))>>2]&1)!==0)))){
      I[((26244+(I[($p0)>>2]+Math.imul(I[((18724+(I[($p1)>>2]-1)*4))>>2],20)-21)*4))>>2]=5;
    }
    I[19677]=((((F[19676]<Math.fround(3000.0))&&(!((I[((20644+(I[($p0)>>2]-1)*4))>>2]&1)!==0)))||((I[((26244+(I[($p0)>>2]+Math.imul(I[((18724+(I[($p1)>>2]-1)*4))>>2],20)-21)*4))>>2]>0)&&(!((I[((21684+(I[($p1)>>2]+Math.imul(I[((18724+(I[($p1)>>2]-1)*4))>>2],20)-21)*4))>>2]&1)!==0))))?-1:0);
  }
  H.appstr(78712,388);
  if((B[(26804+1+Math.imul(I[($p0)>>2],24)-25)]!==0)){
    H.appstr((26804+1+Math.imul(I[($p0)>>2],24)-25),388);
    H.appstr(66179,388);
  }
  F[19679]=Math.fround(Math.fround($anint(Math.fround(F[((19764+(I[($p0)>>2]-1)*4))>>2]*Math.fround(10.0))))/Math.fround(10.0));
  if((F[19679]===Math.fround(0.0))){
    H.appstr(69711,388);
  }else{
    H.prints(78720,78810,78716);
    H.appstr(78720,388);
  }
  H.appstr(78814,388);
  if((F[19679]!==Math.fround(1.0))){
    H.appchr((I[19705]=115,78820),388);
  }
  if(((F[19676]<Math.fround(3000.0))&&((I[((20644+(I[($p0)>>2]-1)*4))>>2]&1)!==0))){
    H.appstr(78824,388);
  }else{
    H.appstr(66179,388);
  }
  if(((I[19652]&1)!==0)){
    R_appsstatus(78632,388);
    H.appchr((I[19709]=46,78836),388);
  }else{
    if(((I[((21684+(I[($p0)>>2]+Math.imul(I[((18724+(I[($p1)>>2]-1)*4))>>2],20)-21)*4))>>2]&1)!==0)){
      H.appstr(78840,388);
    }else{
      H.appstr(78848,388);
    }
  }
  R_putmsg(388,(I[19715]=23,78860));
  if(((!((I[((20644+(I[($p0)>>2]-1)*4))>>2]&1)!==0))||(F[((19364+(I[($p0)>>2]-1)*4))>>2]>Math.fround(0.0)))){
    H.prints(388,78864,(I[19722]=$nint(F[19676]),78888),(I[19723]=$nint(R_angle(78680,78684,78692,78700)),78892));
  }else{
    B[(388+1-1)]=0;
  }
  if(((I[19677]&1)!==0)){
    if((B[(388+1-1)]!==0)){
      H.appstr(66179,388);
    }
    H.appstr(78896,388);
    if((((I[((19604+(I[($p0)>>2]-1)*4))>>2]&1)!==0)&&(!((I[((20564+(I[($p0)>>2]-1)*4))>>2]&1)!==0)))){
      R_appint((I[19727]=$nint(F[((19684+(I[($p0)>>2]-1)*4))>>2]),78908),388);
    }else{
      H.appstr(77548,388);
    }
    I[19728]=$nint(F[((19844+(I[($p0)>>2]-1)*4))>>2]);
    if((I[19728]>0)){
      if((B[(388+1-1)]!==0)){
        H.appstr(66179,388);
      }
      H.prints(78720,78916,78912);
      H.appstr(78720,388);
    }
    I[19728]=I[((20484+(I[($p0)>>2]-1)*4))>>2];
    if((I[19728]>0)){
      H.prints(78720,78926,78912);
      H.appstr(78720,388);
      if((I[19728]===1)){
        H.appchr((I[19735]=121,78940),388);
      }else{
        H.appstr(69724,388);
      }
    }
  }
  if((B[(388+1-1)]!==0)){
    B[(388+1-1)]=H.cupper((388+1-1));
    H.appchr((I[19736]=46,78944),388);
    R_putmsg(388,(I[19737]=24,78948));
  }
  R_cdmove((I[19738]=23,78952),(I[19739]=1,78956));
  return;
}
/* CONQLB.R: subroutine kill */
function R_kill($p0,$p1){
  H.pvlock(604);
  R_ikill($p0,$p1);
  H.pvunlock(604);
  return;
}
/* CONQLB.R: function launch */
function R_launch($p0,$p1){
  I[((20564+(I[($p0)>>2]-1)*4))>>2]=(false?-1:0);
  F[((26004+(I[($p0)>>2]-1)*4))>>2]=F[($p1)>>2];
  H.pvlock(604);
  I[19741]=1;
  L1:for(;(I[19741]<=9);I[19741]=((I[19741]+1)|0)){
    if((I[((27604+(I[($p0)>>2]+Math.imul(I[19741],20)-21)*4))>>2]===1)){
      I[((27604+(I[($p0)>>2]+Math.imul(I[19741],20)-21)*4))>>2]=2;
      H.pvunlock(604);
      if((!((R_usefuel($p0,(F[19742]=Math.fround(10.0),78968),(I[19743]=(true?-1:0),78972)))?true:false))){
        I[((27604+(I[($p0)>>2]+Math.imul(I[19741],20)-21)*4))>>2]=1;
        I[19740]=(false?-1:0);
        return ((I[19740]&1)!==0);
      }
      I[((28324+(I[($p0)>>2]+Math.imul(I[19741],20)-21)*4))>>2]=30;
      F[((29044+(I[($p0)>>2]+Math.imul(I[19741],20)-21)*4))>>2]=R_rndnor((18884+(I[($p0)>>2]-1)*4),(F[19744]=Math.fround(100.0),78976));
      F[((29764+(I[($p0)>>2]+Math.imul(I[19741],20)-21)*4))>>2]=R_rndnor((18964+(I[($p0)>>2]-1)*4),(F[19745]=Math.fround(100.0),78980));
      F[19746]=Math.fround(Math.fround(F[((15660+(I[((18724+(I[($p0)>>2]-1)*4))>>2]-1)*4))>>2]*Math.fround(18.0))*Math.fround(0.1));
      F[19748]=R_rndnor($p1,(F[19747]=Math.fround(2.0),78988));
      F[((30484+(I[($p0)>>2]+Math.imul(I[19741],20)-21)*4))>>2]=Math.fround(F[19746]*Math.fround(Math.cos(Math.fround(Math.fround(F[19748]/Math.fround(180.0))*Math.fround(3.14159)))));
      F[((31204+(I[($p0)>>2]+Math.imul(I[19741],20)-21)*4))>>2]=Math.fround(F[19746]*Math.fround(Math.sin(Math.fround(Math.fround(F[19748]/Math.fround(180.0))*Math.fround(3.14159)))));
      F[((31924+(I[($p0)>>2]+Math.imul(I[19741],20)-21)*4))>>2]=Math.fround(Math.fround(Math.fround(Math.fround(Math.fround(Math.fround(I[((20324+(I[($p0)>>2]-1)*4))>>2])+Math.fround(50.0))/Math.fround(100.0))*F[((15644+(I[((18724+(I[($p0)>>2]-1)*4))>>2]-1)*4))>>2])*Math.fround(F[((19764+(I[($p0)>>2]-1)*4))>>2]+Math.fround(50.0)))/Math.fround(50.0));
      I[19749]=1;
      L2:for(;(I[19749]<=4);I[19749]=((I[19749]+1)|0)){
        I[((32644+(I[($p0)>>2]+Math.imul(I[19741],20)+Math.imul(I[19749],180)-201)*4))>>2]=(((I[((21684+(I[($p0)>>2]+Math.imul(I[19749],20)-21)*4))>>2]&1)!==0)?-1:0);
      }
      I[((27604+(I[($p0)>>2]+Math.imul(I[19741],20)-21)*4))>>2]=3;
      H.pvlock(604);
      I[((1612+(I[((18644+(I[($p0)>>2]-1)*4))>>2]+Math.imul(9,40)-41)*4))>>2]=((I[((1612+(I[((18644+(I[($p0)>>2]-1)*4))>>2]+Math.imul(9,40)-41)*4))>>2]+1)|0);
      I[((748+(I[((18724+(I[($p0)>>2]-1)*4))>>2]+Math.imul(8,4)-5)*4))>>2]=((I[((748+(I[((18724+(I[($p0)>>2]-1)*4))>>2]+Math.imul(8,4)-5)*4))>>2]+1)|0);
      H.pvunlock(604);
      I[19740]=(true?-1:0);
      return ((I[19740]&1)!==0);
    }
  }
  H.pvunlock(604);
  I[19740]=(false?-1:0);
  return ((I[19740]&1)!==0);
  return ((I[19740]&1)!==0);
}
/* CONQLB.R: subroutine orbit */
function R_orbit($p0,$p1){
  I[((19524+(I[($p0)>>2]-1)*4))>>2]=((-I[($p1)>>2])|0);
  F[((19444+(I[($p0)>>2]-1)*4))>>2]=Math.fround(0.0);
  F[19750]=R_angle((18884+(I[($p0)>>2]-1)*4),(18964+(I[($p0)>>2]-1)*4),(16184+(I[($p1)>>2]-1)*4),(16344+(I[($p1)>>2]-1)*4));
  if((F[((19204+(I[($p0)>>2]-1)*4))>>2]<Math.fround(F[19750]-Math.fround(180.0)))){
    F[19750]=Math.fround(F[19750]-Math.fround(360.0));
  }
  if((F[19750]<=F[((19204+(I[($p0)>>2]-1)*4))>>2])){
    F[((19364+(I[($p0)>>2]-1)*4))>>2]=(-Math.fround(1.0));
    F[((19204+(I[($p0)>>2]-1)*4))>>2]=R_mod360((F[19751]=Math.fround(F[19750]+Math.fround(90.0)),79004));
  }else{
    F[((19364+(I[($p0)>>2]-1)*4))>>2]=(-Math.fround(2.0));
    F[((19204+(I[($p0)>>2]-1)*4))>>2]=R_mod360((F[19752]=Math.fround(F[19750]-Math.fround(90.0)),79008));
  }
  return;
}
/* CONQLB.R: function phaser */
function R_phaser($p0,$p1){
  F[((26004+(I[($p0)>>2]-1)*4))>>2]=F[($p1)>>2];
  I[((20564+(I[($p0)>>2]-1)*4))>>2]=(false?-1:0);
  if((I[((26164+(I[($p0)>>2]-1)*4))>>2]>0)){
    I[19753]=(false?-1:0);
    return ((I[19753]&1)!==0);
  }
  if((!((R_usefuel($p0,(F[19754]=Math.fround(20.0),79016),(I[19755]=(true?-1:0),79020)))?true:false))){
    I[19753]=(false?-1:0);
    return ((I[19753]&1)!==0);
  }
  H.pvlock(604);
  I[((1612+(I[((18644+(I[($p0)>>2]-1)*4))>>2]+Math.imul(10,40)-41)*4))>>2]=((I[((1612+(I[((18644+(I[($p0)>>2]-1)*4))>>2]+Math.imul(10,40)-41)*4))>>2]+1)|0);
  I[((748+(I[((18724+(I[($p0)>>2]-1)*4))>>2]+Math.imul(9,4)-5)*4))>>2]=((I[((748+(I[((18724+(I[($p0)>>2]-1)*4))>>2]+Math.imul(9,4)-5)*4))>>2]+1)|0);
  H.pvunlock(604);
  F[((26084+(I[($p0)>>2]-1)*4))>>2]=F[($p1)>>2];
  I[((26164+(I[($p0)>>2]-1)*4))>>2]=10;
  I[19756]=1;
  L1:for(;(I[19756]<=20);I[19756]=((I[19756]+1)|0)){
    if(((I[((18484+(I[19756]-1)*4))>>2]===3)&&(I[19756]!==I[($p0)>>2]))){
      if((((I[((21684+(I[($p0)>>2]+Math.imul(I[((18724+(I[19756]-1)*4))>>2],20)-21)*4))>>2]&1)!==0)||((I[((21684+(I[19756]+Math.imul(I[((18724+(I[($p0)>>2]-1)*4))>>2],20)-21)*4))>>2]&1)!==0))){
        F[19757]=Math.fround(Math.sqrt(Math.fround(Math.fround(Math.pow(Math.fround(F[((18884+(I[19756]-1)*4))>>2]-F[((18884+(I[($p0)>>2]-1)*4))>>2]),Math.fround(2)))+Math.fround(Math.pow(Math.fround(F[((18964+(I[19756]-1)*4))>>2]-F[((18964+(I[($p0)>>2]-1)*4))>>2]),Math.fround(2))))));
        if((F[19757]<=Math.fround(1000.0))){
          F[19758]=R_angle((18884+(I[($p0)>>2]-1)*4),(18964+(I[($p0)>>2]-1)*4),(18884+(I[19756]-1)*4),(18964+(I[19756]-1)*4));
          if((F[19758]>Math.fround(315.0))){
            F[19758]=Math.fround(F[19758]-Math.fround(360.0));
          }
          if((Math.abs(Math.fround(F[($p1)>>2]-F[19758]))<=Math.fround(10.0))){
            R_hit(79024,(F[19759]=R_phaserhit($p0,79028),79036),$p0);
          }
        }
      }
    }
  }
  I[19753]=(true?-1:0);
  return ((I[19753]&1)!==0);
  return ((I[19753]&1)!==0);
}
/* CONQLB.R: function phaserhit */
function R_phaserhit($p0,$p1){
  F[19760]=Math.fround(Math.fround(Math.fround((-Math.fround(F[($p1)>>2]/Math.fround(1000.0)))+Math.fround(1.0))*Math.fround(90.0))*Math.fround(Math.fround(Math.fround(Math.fround(Math.fround(Math.fround(I[((20324+(I[($p0)>>2]-1)*4))>>2])+Math.fround(50.0))/Math.fround(100.0))*F[((15644+(I[((18724+(I[($p0)>>2]-1)*4))>>2]-1)*4))>>2])*Math.fround(F[((19764+(I[($p0)>>2]-1)*4))>>2]+Math.fround(50.0)))/Math.fround(50.0)));
  return F[19760];
  return F[19760];
}
/* CONQLB.R: subroutine planlist */
function R_planlist($p0){
  if((!((I[19778]&1)!==0))){
    I[19779]=1;
    L1:for(;(I[19779]<=40);I[19779]=((I[19779]+1)|0)){
      I[((79120+(I[19779]-1)*4))>>2]=I[19779];
    }
    I[19778]=(true?-1:0);
  }
  R_sortplanets(79120);
  I[19820]=1;
  R_cdputc(79284,79280);
  H.strcpy(79044,388);
  I[19820]=((I[19820]+2)|0);
  R_cdputc(388,79280);
  I[19779]=1;
  L2:for(;(B[(388+I[19779]-1)]!==0);I[19779]=((I[19779]+1)|0)){
    if((B[(388+I[19779]-1)]!==32)){
      B[(388+I[19779]-1)]=45;
    }
  }
  I[19820]=((I[19820]+1)|0);
  R_cdputc(388,79280);
  I[19820]=((I[19820]+1)|0);
  I[19827]=I[19820];
  I[19828]=7;
  I[19829]=1;
  L3:for(;(I[19829]<=3);I[19829]=((I[19829]+1)|0)){
    I[19779]=1;
    L4:for(;(I[19779]<=40);I[19779]=((I[19779]+1)|0)){
      I[19830]=I[((79120+(I[19779]-1)*4))>>2];
      if((!((I[((14700+(I[19830]-1)*4))>>2]&1)!==0))){
        continue L4;
      }
      S5:switch(I[19829]){
        case 1:{
          if(((I[((14540+(I[19830]-1)*4))>>2]===3)||(I[((14540+(I[19830]-1)*4))>>2]===4))){
            continue L4;
          }
          break S5;
        }
        case 2:{
          if((I[((14540+(I[19830]-1)*4))>>2]!==4)){
            continue L4;
          }
          break S5;
        }
        case 3:{
          if((I[((14540+(I[19830]-1)*4))>>2]!==3)){
            continue L4;
          }
          break S5;
        }
      }
      B[79324]=B[(15784+I[((16504+(I[19830]-1)*4))>>2]-1)];
      H.prints(79325,77553,(16664+(I[19830]-1)*4));
      if((I[($p0)>>2]!==6)){
        if((!((I[((16824+(I[19830]+Math.imul(I[($p0)>>2],40)-41)*4))>>2]&1)!==0))){
          B[79324]=63;
          H.strcpy(79335,79325);
        }
      }
      if(((I[((14540+(I[19830]-1)*4))>>2]===3)||(I[((14540+(I[19830]-1)*4))>>2]===4))){
        B[79324]=32;
      }
      if((I[((14540+(I[19830]-1)*4))>>2]===3)){
        if((I[($p0)>>2]!==6)){
          B[(79325+1-1)]=0;
        }
      }
      if((I[((14540+(I[19830]-1)*4))>>2]===4)){
        if((I[($p0)>>2]!==6)){
          B[(79325+1-1)]=0;
        }else{
          if((I[((16664+(I[19830]-1)*4))>>2]===0)){
            B[(79325+1-1)]=0;
          }
        }
      }
      H.prints(388,79337,(14860+1+Math.imul(I[19830],12)-13),(15772+I[((14540+(I[19830]-1)*4))>>2]-1),79324,79325);
      R_cdputs(388,79280,79312);
      I[19820]=((I[19820]+1)|0);
      if((I[19820]===23)){
        I[19820]=I[19827];
        I[19828]=45;
      }
    }
  }
  return;
}
/* CONQLB.R: subroutine playlist */
function* R_playlist($p0,$p1){
  R_cdclear();
  H.strcpy(79358,388);
  I[19852]=$idiv(((I[85]-H.length(388))|0),2);
  I[19853]=2;
  R_cdputs(388,79412,79408);
  I[19854]=1;
  L1:for(;(B[(388+I[19854]-1)]!==0);I[19854]=((I[19854]+1)|0)){
    if((B[(388+I[19854]-1)]!==32)){
      B[(388+I[19854]-1)]=45;
    }
  }
  I[19853]=((I[19853]+1)|0);
  R_cdputs(388,79412,79408);
  I[19855]=((I[19853]+1)|0);
  I[19856]=23;
  I[19857]=1;
  L2:for(;;){
    if((!((I[($p0)>>2]&1)!==0))){
      if((!((R_stillalive(324))?true:false))){
        break L2;
      }
    }
    I[19854]=I[19857];
    R_cdclrl(79420,(I[19858]=((((I[19856]-I[19855])|0)+1)|0),79432));
    I[19853]=I[19855];
    L3:while(((I[19854]<=20)&&(I[19853]<=I[19856]))){
      I[19859]=I[((18484+(I[19854]-1)*4))>>2];
      I[19860]=I[((18564+(I[19854]-1)*4))>>2];
      if(((I[19859]===3)||(((I[($p1)>>2]&1)!==0)&&((I[19859]!==1)||(I[19860]!==0))))){
        B[(79444+1-1)]=0;
        R_appship(79416,79444);
        I[19863]=I[((18644+(I[19854]-1)*4))>>2];
        if(((I[19863]>=1)&&(I[19863]<=40))){
          H.prints(388,79456,79444,(9612+1+Math.imul(I[19863],32)-33),(26804+1+Math.imul(I[19854],24)-25),(F[19871]=Math.fround(Math.fround($anint(Math.fround(F[((19764+(I[19854]-1)*4))>>2]*Math.fround(10.0))))/Math.fround(10.0)),79484));
        }else{
          H.prints(388,79488,79444,(I[19877]=32,79508),(I[19878]=32,79512),(I[19879]=32,79516));
        }
        if((((I[($p1)>>2]&1)!==0)&&(I[19860]!==0))){
          H.appchr((I[19880]=32,79520),388);
          H.appchr((I[19881]=32,79524),388);
          R_appkb(79440,388);
        }
        R_cdputs(388,79412,79408);
        if((((I[($p1)>>2]&1)!==0)&&(I[19859]!==3))){
          B[(388+1-1)]=0;
          R_appsstatus(79436,388);
          R_cdputs(388,79412,(I[19882]=((((I[19852]-2)|0)-H.length(388))|0),79528));
        }
      }
      I[19854]=((I[19854]+1)|0);
      I[19853]=((I[19853]+1)|0);
    }
    if((I[19854]>20)){
      R_putpmt(68204,(I[19883]=24,79532));
      R_cdplay((I[19884]=(true?-1:0),79536));
      if((((yield* H.iogtimed(79540,(I[19886]=1,79544))))?true:false)){
        if((B[79540]===10)){
          I[19857]=1;
        }else{
          break L2;
        }
      }
    }else{
      R_putpmt(73672,(I[19887]=24,79548));
      R_cdplay((I[19888]=(true?-1:0),79552));
      if((((yield* H.iogtimed(79540,(I[19889]=1,79556))))?true:false)){
        if((B[79540]===10)){
          I[19857]=1;
        }else{
          if((B[79540]===32)){
            I[19857]=I[19854];
          }else{
            break L2;
          }
        }
      }
    }
  }
  return;
}
/* CONQLB.R: subroutine pseudo */
function* R_pseudo($p0,$p1){
  R_cdclrl((I[19890]=23,79560),(I[19891]=2,79564));
  H.strcpy(79568,79584);
  if(((I[($p1)>>2]>=1)&&(I[($p1)>>2]<=20))){
    H.appstr((26804+1+Math.imul(I[($p1)>>2],24)-25),79584);
  }else{
    H.appstr((10892+1+Math.imul(I[($p0)>>2],24)-25),79584);
  }
  R_cdputc(79584,(I[19919]=23,79676));
  B[79716]=(yield* R_getcx(79680,(I[19926]=24,79704),(I[19927]=((-4)|0),79708),68048,79584,(I[19928]=22,79712)));
  if(((B[79716]!==27)&&((B[(79584+1-1)]!==0)||(B[79716]===10)))){
    R_stcpn(79584,(10892+1+Math.imul(I[($p0)>>2],24)-25),(I[19930]=22,79720));
    if(((I[($p1)>>2]>=1)&&(I[($p1)>>2]<=20))){
      R_stcpn(79584,(26804+1+Math.imul(I[($p1)>>2],24)-25),(I[19931]=22,79724));
    }
  }
  R_cdclrl((I[19932]=23,79728),(I[19933]=2,79732));
  return;
}
/* CONQLB.R: function register */
function R_register($p0,$p1,$p2,$p3){
  H.pvlock(604);
  I[19935]=1;
  L1:for(;(I[19935]<=40);I[19935]=((I[19935]+1)|0)){
    if((!((I[((1132+(I[19935]-1)*4))>>2]&1)!==0))){
      I[((1132+(I[19935]-1)*4))>>2]=(true?-1:0);
      H.pvunlock(604);
      F[((4812+(I[19935]-1)*4))>>2]=Math.fround(0.0);
      I[((1292+(I[19935]-1)*4))>>2]=I[($p2)>>2];
      I[((4972+(I[19935]-1)*4))>>2]=(false?-1:0);
      I[((1452+(I[19935]-1)*4))>>2]=2;
      I[19936]=1;
      L2:for(;(I[19936]<=20);I[19936]=((I[19936]+1)|0)){
        I[((1612+(I[19935]+Math.imul(I[19936],40)-41)*4))>>2]=0;
      }
      I[19936]=1;
      L3:for(;(I[19936]<=4);I[19936]=((I[19936]+1)|0)){
        I[((5132+(I[19935]+Math.imul(I[19936],40)-41)*4))>>2]=(true?-1:0);
      }
      I[((5132+(I[19935]+Math.imul(I[((1292+(I[19935]-1)*4))>>2],40)-41)*4))>>2]=(false?-1:0);
      I[19936]=1;
      L4:for(;(I[19936]<=12);I[19936]=((I[19936]+1)|0)){
        I[((5772+(I[19935]+Math.imul(I[19936],40)-41)*4))>>2]=(true?-1:0);
      }
      I[((5772+(I[19935]+Math.imul(4,40)-41)*4))>>2]=(false?-1:0);
      I[((5772+(I[19935]+Math.imul(5,40)-41)*4))>>2]=(false?-1:0);
      I[((5772+(I[19935]+Math.imul(6,40)-41)*4))>>2]=(false?-1:0);
      I[19936]=1;
      L5:for(;(I[19936]<=12);I[19936]=((I[19936]+1)|0)){
        I[((7692+(I[19935]+Math.imul(I[19936],40)-41)*4))>>2]=(false?-1:0);
      }
      R_stcpn(79748,(11852+1+Math.imul(I[19935],20)-21),(I[19939]=20,79756));
      R_stcpn($p0,(9612+1+Math.imul(I[19935],32)-33),(I[19940]=30,79760));
      R_stcpn($p1,(10892+1+Math.imul(I[19935],24)-25),(I[19941]=22,79764));
      I[($p3)>>2]=I[19935];
      I[19934]=(true?-1:0);
      return ((I[19934]&1)!==0);
    }
  }
  H.pvunlock(604);
  I[19934]=(false?-1:0);
  return ((I[19934]&1)!==0);
  return ((I[19934]&1)!==0);
}
/* CONQLB.R: subroutine resign */
function R_resign($p0){
  H.pvlock(604);
  if(((I[($p0)>>2]>=1)&&(I[($p0)>>2]<=40))){
    I[((1132+(I[($p0)>>2]-1)*4))>>2]=(false?-1:0);
    I[19942]=1;
    L1:for(;(I[19942]<=40);I[19942]=((I[19942]+1)|0)){
      if((I[($p0)>>2]===I[((17468+(I[19942]-1)*4))>>2])){
        I[((17468+(I[19942]-1)*4))>>2]=((-1)|0);
        B[(17628+1+Math.imul(I[19942],20)-21)]=0;
      }
    }
  }
  H.pvunlock(604);
  return;
}
/* CONQLB.R: function review */
function* R_review($p0,$p1){
  I[19944]=(false?-1:0);
  I[19947]=R_modp1((I[19945]=((I[10051]+1)|0),79780),(I[19946]=60,79784));
  if(((I[($p0)>>2]>=1)&&(I[($p0)>>2]<=20))){
    if((I[((25604+(I[($p0)>>2]-1)*4))>>2]===((-1)|0))){
      I[19943]=(false?-1:0);
      return ((I[19943]&1)!==0);
    }
    I[19948]=I[((25684+(I[($p0)>>2]-1)*4))>>2];
    if((I[19948]!==((-2)|0))){
      I[19947]=I[19948];
    }
  }
  R_cdclrl((I[19949]=23,79796),(I[19950]=1,79800));
  I[19951]=I[($p1)>>2];
  L1:for(;(I[19951]!==I[19947]);I[19951]=R_modp1((I[19952]=((I[19951]-1)|0),79808),(I[19953]=60,79812))){
    if((((R_canread($p0,79804))?true:false)||(I[($p0)>>2]===I[((39724+(I[19951]-1)*4))>>2]))){
      R_readmsg($p0,79804);
      I[19944]=(true?-1:0);
      R_cdplay((I[19954]=(true?-1:0),79816));
      if((!(((yield* R_more(72976)))?true:false))){
        break L1;
      }
    }
  }
  R_cdclrl((I[19955]=23,79820),(I[19956]=2,79824));
  I[19943]=(((I[19944]&1)!==0)?-1:0);
  return ((I[19943]&1)!==0);
  return ((I[19943]&1)!==0);
}
/* CONQLB.R: subroutine takeplanet */
function R_takeplanet($p0,$p1){
  I[((16504+(I[($p0)>>2]-1)*4))>>2]=I[((18724+(I[($p1)>>2]-1)*4))>>2];
  I[((16664+(I[($p0)>>2]-1)*4))>>2]=1;
  F[((19764+(I[($p1)>>2]-1)*4))>>2]=Math.fround(F[((19764+(I[($p1)>>2]-1)*4))>>2]+Math.fround(0.25));
  I[((1612+(I[((18644+(I[($p1)>>2]-1)*4))>>2]+Math.imul(13,40)-41)*4))>>2]=((I[((1612+(I[((18644+(I[($p1)>>2]-1)*4))>>2]+Math.imul(13,40)-41)*4))>>2]+1)|0);
  I[((748+(I[((18724+(I[($p1)>>2]-1)*4))>>2]+Math.imul(12,4)-5)*4))>>2]=((I[((748+(I[((18724+(I[($p1)>>2]-1)*4))>>2]+Math.imul(12,4)-5)*4))>>2]+1)|0);
  H.prints(79828,79918,(15676+1+Math.imul(I[((18724+(I[($p1)>>2]-1)*4))>>2],12)-13));
  R_appship($p1,79828);
  H.appchr((I[19991]=33,79964),79828);
  I[19992]=1;
  L1:for(;(I[19992]<=25);I[19992]=((I[19992]+1)|0)){
    if(((I[((14540+(I[19992]-1)*4))>>2]===1)||(I[((14540+(I[19992]-1)*4))>>2]===2))){
      if(((I[((16504+(I[19992]-1)*4))>>2]!==I[((18724+(I[($p1)>>2]-1)*4))>>2])||(!((I[((14700+(I[19992]-1)*4))>>2]&1)!==0)))){
        R_stormsg((I[19993]=((-I[($p0)>>2])|0),79972),(I[19994]=((-I[((18724+(I[($p1)>>2]-1)*4))>>2])|0),79976),79828);
        return;
      }
    }
  }
  R_getdandt(648);
  R_stcpn((26804+1+Math.imul(I[($p1)>>2],24)-25),612,(I[19995]=22,79980));
  B[(668+1-1)]=0;
  I[((1612+(I[((18644+(I[($p1)>>2]-1)*4))>>2]+Math.imul(7,40)-41)*4))>>2]=((I[((1612+(I[((18644+(I[($p1)>>2]-1)*4))>>2]+Math.imul(7,40)-41)*4))>>2]+1)|0);
  I[((748+(I[((18724+(I[($p1)>>2]-1)*4))>>2]+Math.imul(6,4)-5)*4))>>2]=((I[((748+(I[((18724+(I[($p1)>>2]-1)*4))>>2]+Math.imul(6,4)-5)*4))>>2]+1)|0);
  R_stcpn((15676+1+Math.imul(I[((18724+(I[($p1)>>2]-1)*4))>>2],12)-13),636,(I[19996]=12,79984));
  R_ikill($p1,(I[19997]=((-102)|0),79988));
  I[19992]=1;
  L2:for(;(I[19992]<=20);I[19992]=((I[19992]+1)|0)){
    if((I[((18484+(I[19992]-1)*4))>>2]===3)){
      R_ikill(79968,(I[19998]=((-103)|0),79992));
    }
  }
  H.pvunlock(604);
  R_initgame();
  H.pvlock(604);
  return;
}
/* CONQLB.R: subroutine teamlist */
function R_teamlist($p0){
  I[20024]=(((I[($p0)>>2]<1)||(I[($p0)>>2]>4))?-1:0);
  I[20025]=1;
  I[20026]=1;
  H.prints(80108,80198,728);
  R_cdputc(80108,80104);
  I[20026]=((I[20026]+1)|0);
  H.prints(80108,80219,648);
  R_cdputc(80108,80104);
  I[20026]=((I[20026]+1)|0);
  H.prints(80108,80249,612,636);
  R_cdputc(80108,80104);
  I[20026]=((I[20026]+1)|0);
  R_cdclrl(80104,(I[20068]=1,80272));
  if((B[(668+1-1)]!==0)){
    H.prints(80108,68092,(I[20069]=34,80276),668,(I[20070]=34,80280));
    R_cdputc(80108,80104);
  }
  I[20026]=((I[20026]+2)|0);
  H.prints(80108,80066,80284,(15676+1+Math.imul(1,12)-13),(15676+1+Math.imul(2,12)-13),(15676+1+Math.imul(3,12)-13),(15676+1+Math.imul(4,12)-13),80286);
  R_cdputs(80108,80104,80100);
  I[20026]=((I[20026]+1)|0);
  I[20074]=1;
  L1:for(;(B[(80108+I[20074]-1)]!==0);I[20074]=((I[20074]+1)|0)){
    if((B[(80108+I[20074]-1)]!==32)){
      B[(80108+I[20074]-1)]=45;
    }
  }
  R_cdputs(80108,80104,80100);
  I[20026]=((I[20026]+1)|0);
  H.prints(80108,79996,80300,(748+(1+Math.imul(6,4)-5)*4),(748+(2+Math.imul(6,4)-5)*4),(748+(3+Math.imul(6,4)-5)*4),(748+(4+Math.imul(6,4)-5)*4),(I[20078]=((((((I[((748+(1+Math.imul(6,4)-5)*4))>>2]+I[((748+(2+Math.imul(6,4)-5)*4))>>2])|0)+I[((748+(3+Math.imul(6,4)-5)*4))>>2])|0)+I[((748+(4+Math.imul(6,4)-5)*4))>>2])|0),80312));
  R_cdputs(80108,80104,80100);
  I[20026]=((I[20026]+1)|0);
  H.prints(80108,79996,80316,(748+(1+Math.imul(3,4)-5)*4),(748+(2+Math.imul(3,4)-5)*4),(748+(3+Math.imul(3,4)-5)*4),(748+(4+Math.imul(3,4)-5)*4),(I[20081]=((((((I[((748+(1+Math.imul(3,4)-5)*4))>>2]+I[((748+(2+Math.imul(3,4)-5)*4))>>2])|0)+I[((748+(3+Math.imul(3,4)-5)*4))>>2])|0)+I[((748+(4+Math.imul(3,4)-5)*4))>>2])|0),80324));
  R_cdputs(80108,80104,80100);
  I[20026]=((I[20026]+1)|0);
  H.prints(80108,79996,80328,(748+(1+Math.imul(4,4)-5)*4),(748+(2+Math.imul(4,4)-5)*4),(748+(3+Math.imul(4,4)-5)*4),(748+(4+Math.imul(4,4)-5)*4),(I[20084]=((((((I[((748+(1+Math.imul(4,4)-5)*4))>>2]+I[((748+(2+Math.imul(4,4)-5)*4))>>2])|0)+I[((748+(3+Math.imul(4,4)-5)*4))>>2])|0)+I[((748+(4+Math.imul(4,4)-5)*4))>>2])|0),80336));
  R_cdputs(80108,80104,80100);
  I[20026]=((I[20026]+1)|0);
  H.prints(80108,79996,80340,(748+(1+Math.imul(5,4)-5)*4),(748+(2+Math.imul(5,4)-5)*4),(748+(3+Math.imul(5,4)-5)*4),(748+(4+Math.imul(5,4)-5)*4),(I[20087]=((((((I[((748+(1+Math.imul(5,4)-5)*4))>>2]+I[((748+(2+Math.imul(5,4)-5)*4))>>2])|0)+I[((748+(3+Math.imul(5,4)-5)*4))>>2])|0)+I[((748+(4+Math.imul(5,4)-5)*4))>>2])|0),80348));
  R_cdputs(80108,80104,80100);
  I[20026]=((I[20026]+1)|0);
  I[20088]=((((((I[((748+(1+Math.imul(1,4)-5)*4))>>2]+I[((748+(2+Math.imul(1,4)-5)*4))>>2])|0)+I[((748+(3+Math.imul(1,4)-5)*4))>>2])|0)+I[((748+(4+Math.imul(1,4)-5)*4))>>2])|0);
  R_fmtseconds((748+(1+Math.imul(1,4)-5)*4),(80356+1+Math.imul(1,20)-21));
  R_fmtseconds((748+(2+Math.imul(1,4)-5)*4),(80356+1+Math.imul(2,20)-21));
  R_fmtseconds((748+(3+Math.imul(1,4)-5)*4),(80356+1+Math.imul(3,20)-21));
  R_fmtseconds((748+(4+Math.imul(1,4)-5)*4),(80356+1+Math.imul(4,20)-21));
  R_fmtseconds(80352,(80356+1+Math.imul(5,20)-21));
  H.prints(80108,80066,80456,(80356+1+Math.imul(1,20)-21),(80356+1+Math.imul(2,20)-21),(80356+1+Math.imul(3,20)-21),(80356+1+Math.imul(4,20)-21),(80356+1+Math.imul(5,20)-21));
  R_cdputs(80108,80104,80100);
  I[20026]=((I[20026]+1)|0);
  I[20116]=((((((I[((748+(1+Math.imul(2,4)-5)*4))>>2]+I[((748+(2+Math.imul(2,4)-5)*4))>>2])|0)+I[((748+(3+Math.imul(2,4)-5)*4))>>2])|0)+I[((748+(4+Math.imul(2,4)-5)*4))>>2])|0);
  R_fmtseconds((748+(1+Math.imul(2,4)-5)*4),(80356+1+Math.imul(1,20)-21));
  R_fmtseconds((748+(2+Math.imul(2,4)-5)*4),(80356+1+Math.imul(2,20)-21));
  R_fmtseconds((748+(3+Math.imul(2,4)-5)*4),(80356+1+Math.imul(3,20)-21));
  R_fmtseconds((748+(4+Math.imul(2,4)-5)*4),(80356+1+Math.imul(4,20)-21));
  R_fmtseconds(80464,(80356+1+Math.imul(5,20)-21));
  H.prints(80108,80066,80468,(80356+1+Math.imul(1,20)-21),(80356+1+Math.imul(2,20)-21),(80356+1+Math.imul(3,20)-21),(80356+1+Math.imul(4,20)-21),(80356+1+Math.imul(5,20)-21));
  R_cdputs(80108,80104,80100);
  I[20026]=((I[20026]+1)|0);
  I[20074]=1;
  L2:for(;(I[20074]<=4);I[20074]=((I[20074]+1)|0)){
    I[20120]=I[((748+(I[20074]+Math.imul(1,4)-5)*4))>>2];
    if((I[20120]<=0)){
      F[((80484+(I[20074]-1)*4))>>2]=Math.fround(0.0);
    }else{
      F[((80484+(I[20074]-1)*4))>>2]=Math.fround(Math.fround($anint(Math.fround(Math.fround(Math.fround(Math.fround(100.0)*Math.fround(I[((748+(I[20074]+Math.imul(2,4)-5)*4))>>2]))/Math.fround(I[20120]))*Math.fround(10.0))))/Math.fround(10.0));
    }
  }
  if((I[20088]<=0)){
    F[((80484+(5-1)*4))>>2]=Math.fround(0.0);
  }else{
    F[((80484+(5-1)*4))>>2]=Math.fround(Math.fround($anint(Math.fround(Math.fround(Math.fround(Math.fround(100.0)*Math.fround(I[20116]))/Math.fround(I[20088]))*Math.fround(10.0))))/Math.fround(10.0));
  }
  H.prints(80108,80026,80504,(80484+(1-1)*4),(80484+(2-1)*4),(80484+(3-1)*4),(80484+(4-1)*4),(80484+(5-1)*4));
  R_cdputs(80108,80104,80100);
  I[20026]=((I[20026]+1)|0);
  H.prints(80108,79996,80514,(748+(1+Math.imul(9,4)-5)*4),(748+(2+Math.imul(9,4)-5)*4),(748+(3+Math.imul(9,4)-5)*4),(748+(4+Math.imul(9,4)-5)*4),(I[20132]=((((((I[((748+(1+Math.imul(9,4)-5)*4))>>2]+I[((748+(2+Math.imul(9,4)-5)*4))>>2])|0)+I[((748+(3+Math.imul(9,4)-5)*4))>>2])|0)+I[((748+(4+Math.imul(9,4)-5)*4))>>2])|0),80528));
  R_cdputs(80108,80104,80100);
  I[20026]=((I[20026]+1)|0);
  H.prints(80108,79996,80532,(748+(1+Math.imul(8,4)-5)*4),(748+(2+Math.imul(8,4)-5)*4),(748+(3+Math.imul(8,4)-5)*4),(748+(4+Math.imul(8,4)-5)*4),(I[20136]=((((((I[((748+(1+Math.imul(8,4)-5)*4))>>2]+I[((748+(2+Math.imul(8,4)-5)*4))>>2])|0)+I[((748+(3+Math.imul(8,4)-5)*4))>>2])|0)+I[((748+(4+Math.imul(8,4)-5)*4))>>2])|0),80544));
  R_cdputs(80108,80104,80100);
  I[20026]=((I[20026]+1)|0);
  H.prints(80108,79996,80548,(748+(1+Math.imul(10,4)-5)*4),(748+(2+Math.imul(10,4)-5)*4),(748+(3+Math.imul(10,4)-5)*4),(748+(4+Math.imul(10,4)-5)*4),(I[20141]=((((((I[((748+(1+Math.imul(10,4)-5)*4))>>2]+I[((748+(2+Math.imul(10,4)-5)*4))>>2])|0)+I[((748+(3+Math.imul(10,4)-5)*4))>>2])|0)+I[((748+(4+Math.imul(10,4)-5)*4))>>2])|0),80564));
  R_cdputs(80108,80104,80100);
  I[20026]=((I[20026]+1)|0);
  H.prints(80108,79996,80568,(748+(1+Math.imul(11,4)-5)*4),(748+(2+Math.imul(11,4)-5)*4),(748+(3+Math.imul(11,4)-5)*4),(748+(4+Math.imul(11,4)-5)*4),(I[20146]=((((((I[((748+(1+Math.imul(11,4)-5)*4))>>2]+I[((748+(2+Math.imul(11,4)-5)*4))>>2])|0)+I[((748+(3+Math.imul(11,4)-5)*4))>>2])|0)+I[((748+(4+Math.imul(11,4)-5)*4))>>2])|0),80584));
  R_cdputs(80108,80104,80100);
  I[20026]=((I[20026]+1)|0);
  H.prints(80108,79996,80588,(748+(1+Math.imul(12,4)-5)*4),(748+(2+Math.imul(12,4)-5)*4),(748+(3+Math.imul(12,4)-5)*4),(748+(4+Math.imul(12,4)-5)*4),(I[20151]=((((((I[((748+(1+Math.imul(12,4)-5)*4))>>2]+I[((748+(2+Math.imul(12,4)-5)*4))>>2])|0)+I[((748+(3+Math.imul(12,4)-5)*4))>>2])|0)+I[((748+(4+Math.imul(12,4)-5)*4))>>2])|0),80604));
  R_cdputs(80108,80104,80100);
  I[20026]=((I[20026]+1)|0);
  H.prints(80108,79996,80608,(748+(1+Math.imul(7,4)-5)*4),(748+(2+Math.imul(7,4)-5)*4),(748+(3+Math.imul(7,4)-5)*4),(748+(4+Math.imul(7,4)-5)*4),(I[20154]=((((((I[((748+(1+Math.imul(7,4)-5)*4))>>2]+I[((748+(2+Math.imul(7,4)-5)*4))>>2])|0)+I[((748+(3+Math.imul(7,4)-5)*4))>>2])|0)+I[((748+(4+Math.imul(7,4)-5)*4))>>2])|0),80616));
  R_cdputs(80108,80104,80100);
  I[20026]=((I[20026]+1)|0);
  H.prints(80108,79996,80620,(748+(1+Math.imul(13,4)-5)*4),(748+(2+Math.imul(13,4)-5)*4),(748+(3+Math.imul(13,4)-5)*4),(748+(4+Math.imul(13,4)-5)*4),(I[20158]=((((((I[((748+(1+Math.imul(13,4)-5)*4))>>2]+I[((748+(2+Math.imul(13,4)-5)*4))>>2])|0)+I[((748+(3+Math.imul(13,4)-5)*4))>>2])|0)+I[((748+(4+Math.imul(13,4)-5)*4))>>2])|0),80632));
  R_cdputs(80108,80104,80100);
  I[20074]=1;
  L3:for(;(I[20074]<=4);I[20074]=((I[20074]+1)|0)){
    if((I[((15792+(I[20074]-1)*4))>>2]===0)){
      B[(80356+1+Math.imul(I[20074],20)-21)]=0;
    }else{
      H.prints((80356+1+Math.imul(I[20074],20)-21),77553,(15792+(I[20074]-1)*4));
    }
  }
  if((!((I[20024]&1)!==0))){
    I[20074]=1;
    L4:for(;(I[20074]<=4);I[20074]=((I[20074]+1)|0)){
      if((I[($p0)>>2]!==I[20074])){
        H.strcpy(80636,(80356+1+Math.imul(I[20074],20)-21));
      }else{
        if(((!((I[((1068+(I[20074]-1)*4))>>2]&1)!==0))&&(B[(80356+1+Math.imul(I[20074],20)-21)]!==0))){
          H.strcpy(79335,(80356+1+Math.imul(I[20074],20)-21));
        }
      }
    }
  }
  B[(80356+1+Math.imul(5,20)-21)]=0;
  I[20026]=((I[20026]+1)|0);
  H.prints(80108,80066,80638,(80356+1+Math.imul(1,20)-21),(80356+1+Math.imul(2,20)-21),(80356+1+Math.imul(3,20)-21),(80356+1+Math.imul(4,20)-21),(80356+1+Math.imul(5,20)-21));
  R_cdputs(80108,80104,80100);
  return;
}
/* CONQLB.R: subroutine userline */
function R_userline($p0,$p1,$p2,$p3,$p4){
  if(((I[($p0)>>2]<1)||(I[($p0)>>2]>40))){
    H.strcpy(80648,$p2);
    return;
  }
  if((!((I[((1132+(I[($p0)>>2]-1)*4))>>2]&1)!==0))){
    B[($p2+1-1)]=0;
    return;
  }
  B[80728]=32;
  if(((I[($p3)>>2]&1)!==0)){
    I[20183]=1;
    L1:for(;(I[20183]<=12);I[20183]=((I[20183]+1)|0)){
      if(((I[((7692+(I[($p0)>>2]+Math.imul(I[20183],40)-41)*4))>>2]&1)!==0)){
        B[80728]=43;
        break L1;
      }
    }
    if((B[80728]!==43)){
      if(((R_isagod((9612+1+Math.imul(I[($p0)>>2],32)-33)))?true:false)){
        B[80728]=43;
      }
    }
  }
  if(((I[($p1)>>2]>=1)&&(I[($p1)>>2]<=20))){
    H.strcpy((26804+1+Math.imul(I[($p1)>>2],24)-25),80736);
    I[20190]=I[((18724+(I[($p1)>>2]-1)*4))>>2];
  }else{
    H.strcpy((10892+1+Math.imul(I[($p0)>>2],24)-25),80736);
    I[20190]=I[((1292+(I[($p0)>>2]-1)*4))>>2];
  }
  if((((I[((7692+(I[($p0)>>2]+Math.imul(2,40)-41)*4))>>2]&1)!==0)&&(!((I[($p4)>>2]&1)!==0)))){
    B[80764]=77;
  }else{
    B[80764]=B[(15784+I[20190]-1)];
  }
  H.prints(80765,80855,(9612+1+Math.imul(I[($p0)>>2],32)-33),80728,80736,80764,(F[20219]=Math.fround(Math.fround($anint(Math.fround(F[((4812+(I[($p0)>>2]-1)*4))>>2]*Math.fround(10.0))))/Math.fround(10.0)),80876));
  R_fmtminutes((I[20220]=$idiv(((I[((1612+(I[($p0)>>2]+Math.imul(1,40)-41)*4))>>2]+30)|0),60),80880),80884);
  H.prints($p2,80904,80765,(1612+(I[($p0)>>2]+Math.imul(3,40)-41)*4),(1612+(I[($p0)>>2]+Math.imul(4,40)-41)*4),(1612+(I[($p0)>>2]+Math.imul(5,40)-41)*4),(1612+(I[($p0)>>2]+Math.imul(6,40)-41)*4),80884);
  return;
}
/* CONQLB.R: subroutine userlist */
function* R_userlist($p0){
  I[20232]=0;
  I[20233]=1;
  L1:for(;(I[20233]<=40);I[20233]=((I[20233]+1)|0)){
    if(((I[((1132+(I[20233]-1)*4))>>2]&1)!==0)){
      I[20234]=1;
      L2:for(;(I[20234]<=I[20232]);I[20234]=((I[20234]+1)|0)){
        if((F[((4812+(I[((80940+(I[20234]-1)*4))>>2]-1)*4))>>2]<F[((4812+(I[20233]-1)*4))>>2])){
          I[20275]=I[20232];
          L3:for(;(I[20275]>=I[20234]);I[20275]=((I[20275]-1)|0)){
            I[((80940+(((I[20275]+1)|0)-1)*4))>>2]=I[((80940+(I[20275]-1)*4))>>2];
          }
          break L2;
        }
      }
      I[((80940+(I[20234]-1)*4))>>2]=I[20233];
      I[20232]=((I[20232]+1)|0);
    }
  }
  R_cdclear();
  I[20276]=1;
  R_cdputc(81108,81104);
  I[20276]=((I[20276]+2)|0);
  R_userline((I[20282]=((-1)|0),81128),(I[20283]=((-1)|0),81132),388,(I[20284]=(false?-1:0),81136),(I[20285]=(false?-1:0),81140));
  R_cdputs(388,81104,(I[20286]=1,81144));
  I[20275]=1;
  L4:for(;(B[(388+I[20275]-1)]!==0);I[20275]=((I[20275]+1)|0)){
    if((B[(388+I[20275]-1)]!==32)){
      B[(388+I[20275]-1)]=45;
    }
  }
  I[20276]=((I[20276]+1)|0);
  R_cdputs(388,81104,(I[20287]=1,81148));
  I[20288]=((I[20276]+1)|0);
  I[20289]=23;
  I[20290]=1;
  L5:for(;;){
    if((!((I[($p0)>>2]&1)!==0))){
      if((!((R_stillalive(324))?true:false))){
        break L5;
      }
    }
    I[20234]=I[20290];
    R_cdclrl(81152,(I[20291]=((((I[20289]-I[20288])|0)+1)|0),81164));
    I[20276]=I[20288];
    L6:while(((I[20234]<=I[20232])&&(I[20276]<=I[20289]))){
      R_userline((80940+(I[20234]-1)*4),(I[20292]=((-1)|0),81168),388,$p0,(I[20293]=(false?-1:0),81172));
      R_cdputs(388,81104,(I[20294]=1,81176));
      I[20234]=((I[20234]+1)|0);
      I[20276]=((I[20276]+1)|0);
    }
    if((I[20234]>I[20232])){
      R_putpmt(68204,(I[20295]=24,81180));
      R_cdplay((I[20296]=(true?-1:0),81184));
      if((((yield* H.iogtimed(81188,(I[20298]=1,81192))))?true:false)){
        if((B[81188]===10)){
          I[20290]=1;
        }else{
          break L5;
        }
      }
    }else{
      R_putpmt(73672,(I[20299]=24,81196));
      R_cdplay((I[20300]=(true?-1:0),81200));
      if((((yield* H.iogtimed(81188,(I[20301]=1,81204))))?true:false)){
        if((B[81188]===10)){
          I[20290]=1;
        }else{
          if((B[81188]===32)){
            I[20290]=I[20234];
          }else{
            break L5;
          }
        }
      }
    }
  }
  return;
}
/* CONQLB.R: subroutine userstats */
function* R_userstats($p0){
  I[20322]=0;
  I[20323]=1;
  L1:for(;(I[20323]<=40);I[20323]=((I[20323]+1)|0)){
    if(((I[((1132+(I[20323]-1)*4))>>2]&1)!==0)){
      I[20324]=1;
      L2:for(;(I[20324]<=I[20322]);I[20324]=((I[20324]+1)|0)){
        if((F[((4812+(I[((81300+(I[20324]-1)*4))>>2]-1)*4))>>2]<F[((4812+(I[20323]-1)*4))>>2])){
          I[20365]=I[20322];
          L3:for(;(I[20365]>=I[20324]);I[20365]=((I[20365]-1)|0)){
            I[((81300+(((I[20365]+1)|0)-1)*4))>>2]=I[((81300+(I[20365]-1)*4))>>2];
          }
          break L2;
        }
      }
      I[((81300+(I[20324]-1)*4))>>2]=I[20323];
      I[20322]=((I[20322]+1)|0);
    }
  }
  R_cdclear();
  I[20366]=1;
  R_cdputc(81468,81464);
  I[20366]=((I[20366]+2)|0);
  R_cdputs(81498,81464,(I[20383]=34,81532));
  H.strcpy(81208,388);
  I[20366]=((I[20366]+1)|0);
  R_cdputs(388,81464,(I[20384]=1,81536));
  I[20365]=1;
  L4:for(;(B[(388+I[20365]-1)]!==0);I[20365]=((I[20365]+1)|0)){
    if((B[(388+I[20365]-1)]!==32)){
      B[(388+I[20365]-1)]=45;
    }
  }
  I[20366]=((I[20366]+1)|0);
  R_cdputs(388,81464,(I[20385]=1,81540));
  I[20386]=((I[20366]+1)|0);
  I[20387]=23;
  I[20388]=1;
  L5:for(;;){
    if((!((I[($p0)>>2]&1)!==0))){
      if((!((R_stillalive(324))?true:false))){
        break L5;
      }
    }
    I[20324]=I[20388];
    R_cdclrl(81544,(I[20389]=((((I[20387]-I[20386])|0)+1)|0),81556));
    I[20366]=I[20386];
    L6:while(((I[20324]<=I[20322])&&(I[20366]<=I[20387]))){
      R_statline((81300+(I[20324]-1)*4),388);
      R_cdputs(388,81464,(I[20390]=1,81560));
      I[20324]=((I[20324]+1)|0);
      I[20366]=((I[20366]+1)|0);
    }
    if((I[20324]>I[20322])){
      R_putpmt(68204,(I[20391]=24,81564));
      R_cdplay((I[20392]=(true?-1:0),81568));
      if((((yield* H.iogtimed(81572,(I[20394]=1,81576))))?true:false)){
        if((B[81572]===10)){
          I[20388]=1;
        }else{
          break L5;
        }
      }
    }else{
      R_putpmt(73672,(I[20395]=24,81580));
      R_cdplay((I[20396]=(true?-1:0),81584));
      if((((yield* H.iogtimed(81572,(I[20397]=1,81588))))?true:false)){
        if((B[81572]===10)){
          I[20388]=1;
        }else{
          if((B[81572]===32)){
            I[20388]=I[20324];
          }else{
            break L5;
          }
        }
      }
    }
  }
  return;
}
/* CONQLB.R: subroutine statline */
function R_statline($p0,$p1){
  if(((I[($p0)>>2]<1)||(I[($p0)>>2]>40))){
    B[($p1+1-1)]=0;
    return;
  }
  if((!((I[((1132+(I[($p0)>>2]-1)*4))>>2]&1)!==0))){
    B[($p1+1-1)]=0;
    return;
  }
  if((I[((1612+(I[($p0)>>2]+Math.imul(1,40)-41)*4))>>2]===0)){
    H.strcpy(81592,81595);
  }else{
    I[20422]=$idiv(Math.imul(1000,I[((1612+(I[($p0)>>2]+Math.imul(2,40)-41)*4))>>2]),I[((1612+(I[($p0)>>2]+Math.imul(1,40)-41)*4))>>2]);
    H.prints(81595,81692,(I[20425]=$idiv(((I[20422]+5)|0),10),81700));
  }
  H.prints(81704,81794,(9612+1+Math.imul(I[($p0)>>2],32)-33),81595,(1612+(I[($p0)>>2]+Math.imul(7,40)-41)*4),(1612+(I[($p0)>>2]+Math.imul(8,40)-41)*4),(1612+(I[($p0)>>2]+Math.imul(14,40)-41)*4));
  H.prints($p1,81816,81704,(1612+(I[($p0)>>2]+Math.imul(13,40)-41)*4),(1612+(I[($p0)>>2]+Math.imul(11,40)-41)*4),(1612+(I[($p0)>>2]+Math.imul(12,40)-41)*4),(1612+(I[($p0)>>2]+Math.imul(10,40)-41)*4),(1612+(I[($p0)>>2]+Math.imul(9,40)-41)*4));
  B[81839]=0;
  I[20422]=9;
  L1:for(;(B[($p1+I[20422]-1)]!==0);I[20422]=((I[20422]+1)|0)){
    if((B[($p1+I[20422]-1)]===48)){
      if((B[81839]===32)){
        if(((B[($p1+((I[20422]+1)|0)-1)]===32)||(B[($p1+((I[20422]+1)|0)-1)]===0))){
          B[($p1+I[20422]-1)]=45;
        }
      }
    }
    B[81839]=B[($p1+I[20422]-1)];
  }
  H.prints(81704,81840,(11852+1+Math.imul(I[($p0)>>2],20)-21));
  H.appstr(81704,$p1);
  return;
}
/* CONQLB.R: subroutine zeroplanet */
function R_zeroplanet($p0,$p1){
  I[20463]=I[((16504+(I[($p0)>>2]-1)*4))>>2];
  I[((16504+(I[($p0)>>2]-1)*4))>>2]=6;
  I[((16664+(I[($p0)>>2]-1)*4))>>2]=0;
  I[20464]=1;
  L1:for(;(I[20464]<=4);I[20464]=((I[20464]+1)|0)){
    I[((16824+(I[($p0)>>2]+Math.imul(I[20464],40)-41)*4))>>2]=(false?-1:0);
  }
  if(((I[20463]!==5)&&(I[20463]!==6))){
    I[20464]=1;
    L2:for(;(I[20464]<=40);I[20464]=((I[20464]+1)|0)){
      if((I[((16504+(I[20464]-1)*4))>>2]===I[20463])){
        return;
      }
    }
    I[((15792+(I[20463]-1)*4))>>2]=R_rndint((I[20465]=120,81860),(I[20466]=240,81864));
    I[((1068+(I[20463]-1)*4))>>2]=(false?-1:0);
    if(((I[($p1)>>2]>=1)&&(I[($p1)>>2]<=20))){
      I[((1612+(I[((18644+(I[($p1)>>2]-1)*4))>>2]+Math.imul(14,40)-41)*4))>>2]=((I[((1612+(I[((18644+(I[($p1)>>2]-1)*4))>>2]+Math.imul(14,40)-41)*4))>>2]+1)|0);
      I[((748+(I[((18724+(I[($p1)>>2]-1)*4))>>2]+Math.imul(13,4)-5)*4))>>2]=((I[((748+(I[((18724+(I[($p1)>>2]-1)*4))>>2]+Math.imul(13,4)-5)*4))>>2]+1)|0);
    }
  }
  return;
}
/* CONQMISC.R: subroutine appkb */
function R_appkb($p0,$p1){
  S1:switch(I[($p0)>>2]){
    case -100:{
      H.appstr(81868,$p1);
      break S1;
    }
    case -101:{
      H.appstr(81873,$p1);
      break S1;
    }
    case -102:{
      H.appstr(81880,$p1);
      break S1;
    }
    case -103:{
      H.appstr(81888,$p1);
      break S1;
    }
    case -104:{
      H.appstr(81896,$p1);
      break S1;
    }
    case -105:{
      H.appstr(81902,$p1);
      break S1;
    }
    case -106:{
      H.appstr(81907,$p1);
      break S1;
    }
    case -107:{
      H.appstr(81916,$p1);
      break S1;
    }
    case -108:{
      H.appstr(81928,$p1);
      break S1;
    }
    default:{
      if(((I[($p0)>>2]>=1)&&(I[($p0)>>2]<=20))){
        R_appship($p0,$p1);
      }else{
        if(((((-I[($p0)>>2])|0)>=1)&&(((-I[($p0)>>2])|0)<=40))){
          H.appstr((14860+1+Math.imul(((-I[($p0)>>2])|0),12)-13),$p1);
        }else{
          R_appint($p0,$p1);
        }
      }
    }
  }
  return;
}
/* CONQMISC.R: subroutine appship */
function R_appship($p0,$p1){
  B[81932]=83;
  if(((I[($p0)>>2]>=1)&&(I[($p0)>>2]<=20))){
    I[20484]=I[((18724+(I[($p0)>>2]-1)*4))>>2];
    if(((I[20484]>=1)&&(I[20484]<=4))){
      B[81932]=B[(15784+I[20484]-1)];
    }
  }
  H.appchr(81932,$p1);
  R_appint($p0,$p1);
  return;
}
/* CONQMISC.R: function canread */
function R_canread($p0,$p1){
  I[20486]=I[((39724+(I[($p1)>>2]-1)*4))>>2];
  I[20487]=I[((39964+(I[($p1)>>2]-1)*4))>>2];
  if((I[($p0)>>2]===((-102)|0))){
    I[20485]=(true?-1:0);
    return ((I[20485]&1)!==0);
  }
  if((I[20487]===I[($p0)>>2])){
    I[20485]=(true?-1:0);
    return ((I[20485]&1)!==0);
  }
  if((I[20487]===((-100)|0))){
    I[20485]=(true?-1:0);
    return ((I[20485]&1)!==0);
  }
  if(((I[($p0)>>2]>=1)&&(I[($p0)>>2]<=20))){
    if(((((-I[20487])|0)===I[((18724+(I[($p0)>>2]-1)*4))>>2])&&(!((I[((21684+(I[($p0)>>2]+Math.imul(I[((18724+(I[($p0)>>2]-1)*4))>>2],20)-21)*4))>>2]&1)!==0)))){
      if(((((-I[20486])|0)>=1)&&(((-I[20486])|0)<=40))){
        I[20485]=(((I[((20724+(I[($p0)>>2]+Math.imul(4,20)-21)*4))>>2]&1)!==0)?-1:0);
        return ((I[20485]&1)!==0);
      }else{
        I[20485]=(true?-1:0);
        return ((I[20485]&1)!==0);
      }
    }
    if((((I[20487]===((-102)|0))||(I[20486]===((-102)|0)))||(I[20487]===((-105)|0)))){
      I[20485]=(((I[((7692+(I[((18644+(I[($p0)>>2]-1)*4))>>2]+Math.imul(5,40)-41)*4))>>2]&1)!==0)?-1:0);
      return ((I[20485]&1)!==0);
    }
  }
  I[20485]=(false?-1:0);
  return ((I[20485]&1)!==0);
  return ((I[20485]&1)!==0);
}
/* CONQMISC.R: subroutine clearships */
function R_clearships(){
  I[20488]=1;
  L1:for(;(I[20488]<=20);I[20488]=((I[20488]+1)|0)){
    R_zeroship(81952);
  }
  return;
}
/* CONQMISC.R: function cvtcoords */
function R_cvtcoords($p0,$p1,$p2,$p3,$p4,$p5,$p6){
  I[($p6)>>2]=(($nint(Math.fround(Math.fround($idiv(((I[85]-24)|0),2))+Math.fround(Math.fround(Math.fround(F[($p2)>>2]-F[($p0)>>2])/F[($p4)>>2])*Math.fround(2.32))))+24)|0);
  I[($p5)>>2]=$nint(Math.fround(Math.fround((($idiv(21,2)+1)|0))-Math.fround(Math.fround(F[($p3)>>2]-F[($p1)>>2])/F[($p4)>>2])));
  if(((((I[($p5)>>2]<1)||(I[($p5)>>2]>21))||(I[($p6)>>2]<=24))||(I[($p6)>>2]>I[85]))){
    I[20489]=(false?-1:0);
    return ((I[20489]&1)!==0);
  }
  I[20489]=(true?-1:0);
  return ((I[20489]&1)!==0);
  return ((I[20489]&1)!==0);
}
/* CONQMISC.R: subroutine doomfind */
function R_doomfind(){
  F[20490]=Math.fround(0.0);
  I[3999]=((-34)|0);
  I[20491]=1;
  L1:for(;(I[20491]<=40);I[20491]=((I[20491]+1)|0)){
    if(((I[((14700+(I[20491]-1)*4))>>2]&1)!==0)){
      if(((I[((16664+(I[20491]-1)*4))>>2]>0)&&(I[((16504+(I[20491]-1)*4))>>2]!==6))){
        F[20492]=Math.fround(Math.fround(Math.fround(I[((16664+(I[20491]-1)*4))>>2])*Math.fround(0.05))/Math.fround(Math.sqrt(Math.fround(Math.fround(Math.pow(Math.fround(F[((16184+(I[20491]-1)*4))>>2]-F[3994]),Math.fround(2)))+Math.fround(Math.pow(Math.fround(F[((16344+(I[20491]-1)*4))>>2]-F[3995]),Math.fround(2)))))));
        if((F[20492]>F[20490])){
          F[20490]=F[20492];
          I[3999]=((-I[20491])|0);
        }
      }
    }
  }
  I[20491]=1;
  L2:for(;(I[20491]<=20);I[20491]=((I[20491]+1)|0)){
    if((I[((18484+(I[20491]-1)*4))>>2]===3)){
      F[20492]=Math.fround(Math.fround(Math.fround(Math.fround(1.0)+Math.fround(F[((19764+(I[20491]-1)*4))>>2]*Math.fround(0.1)))+Math.fround(Math.fround(I[((20484+(I[20491]-1)*4))>>2])*Math.fround(0.1)))/Math.fround(Math.sqrt(Math.fround(Math.fround(Math.pow(Math.fround(F[((18884+(I[20491]-1)*4))>>2]-F[3994]),Math.fround(2)))+Math.fround(Math.pow(Math.fround(F[((18964+(I[20491]-1)*4))>>2]-F[3995]),Math.fround(2)))))));
      if((F[20492]>F[20490])){
        F[20490]=F[20492];
        I[3999]=I[20491];
      }
    }
  }
  if((I[3999]<0)){
    F[3998]=R_angle(15976,15980,(16184+(((-I[3999])|0)-1)*4),(16344+(((-I[3999])|0)-1)*4));
  }else{
    if((I[3999]>0)){
      F[3998]=R_angle(15976,15980,(18884+(I[3999]-1)*4),(18964+(I[3999]-1)*4));
    }
  }
  return;
}
/* CONQMISC.R: subroutine doomsday */
function R_doomsday(){
  F[3998]=R_rnduni((F[20493]=Math.fround(0.0),81972),(F[20494]=Math.fround(360.0),81976));
  F[3994]=Math.fround(Math.fround(20000.0)*Math.fround(Math.cos(Math.fround(Math.fround(F[3998]/Math.fround(180.0))*Math.fround(3.14159)))));
  F[3995]=Math.fround(Math.fround(20000.0)*Math.fround(Math.sin(Math.fround(Math.fround(F[3998]/Math.fround(180.0))*Math.fround(3.14159)))));
  R_doomfind();
  I[3992]=1;
  return;
}
/* CONQMISC.R: function findorbit */
function R_findorbit($p0,$p1){
  I[20496]=1;
  L1:for(;(I[20496]<=40);I[20496]=((I[20496]+1)|0)){
    if((((I[((14700+(I[20496]-1)*4))>>2]&1)!==0)&&(Math.fround(Math.sqrt(Math.fround(Math.fround(Math.pow(Math.fround(F[((16184+(I[20496]-1)*4))>>2]-F[((18884+(I[($p0)>>2]-1)*4))>>2]),Math.fround(2)))+Math.fround(Math.pow(Math.fround(F[((16344+(I[20496]-1)*4))>>2]-F[((18964+(I[($p0)>>2]-1)*4))>>2]),Math.fround(2))))))<=Math.fround(300.0)))){
      I[($p1)>>2]=I[20496];
      I[20495]=(true?-1:0);
      return ((I[20495]&1)!==0);
    }
  }
  I[($p1)>>2]=0;
  I[20495]=(false?-1:0);
  return ((I[20495]&1)!==0);
  return ((I[20495]&1)!==0);
}
/* CONQMISC.R: function findship */
function R_findship($p0){
  H.pvlock(604);
  I[($p0)>>2]=0;
  I[20498]=1;
  L1:for(;(I[20498]<=20);I[20498]=((I[20498]+1)|0)){
    if((I[((18484+(I[20498]-1)*4))>>2]===1)){
      I[($p0)>>2]=I[20498];
      R_zeroship($p0);
      I[((18484+(I[($p0)>>2]-1)*4))>>2]=6;
      I[((25604+(I[($p0)>>2]-1)*4))>>2]=((-1)|0);
      I[((25524+(I[($p0)>>2]-1)*4))>>2]=((-300)|0);
      I[((27284+(I[($p0)>>2]-1)*4))>>2]=0;
      I[((27364+(I[($p0)>>2]-1)*4))>>2]=0;
      I[((27444+(I[($p0)>>2]-1)*4))>>2]=0;
      I[((27524+(I[($p0)>>2]-1)*4))>>2]=0;
      break L1;
    }
  }
  H.pvunlock(604);
  I[20497]=((I[($p0)>>2]!==0)?-1:0);
  return ((I[20497]&1)!==0);
  return ((I[20497]&1)!==0);
}
/* CONQMISC.R: function findspecial */
function R_findspecial($p0,$p1,$p2,$p3,$p4){
  I[($p3)>>2]=0;
  I[($p4)>>2]=0;
  F[20500]=Math.fround(2e+20);
  F[20501]=Math.fround(3e+20);
  I[20502]=20000;
  I[20503]=30000;
  I[20504]=20000;
  I[20505]=20000;
  S1:switch(I[($p1)>>2]){
    case 5:case 2:case 7:{
      I[20506]=1;
      L2:for(;(I[20506]<=20);I[20506]=((I[20506]+1)|0)){
        if(((I[20506]!==I[($p0)>>2])&&(I[((18484+(I[20506]-1)*4))>>2]===3))){
          S3:switch(I[($p1)>>2]){
            case 2:{
              I[20507]=((((I[((21684+(I[($p0)>>2]+Math.imul(I[((18724+(I[20506]-1)*4))>>2],20)-21)*4))>>2]&1)!==0)||((I[((21684+(I[20506]+Math.imul(I[((18724+(I[($p0)>>2]-1)*4))>>2],20)-21)*4))>>2]&1)!==0))?-1:0);
              break S3;
            }
            case 5:{
              I[20507]=(true?-1:0);
              break S3;
            }
            case 7:{
              I[20507]=(((I[((18724+(I[20506]-1)*4))>>2]===I[((18724+(I[($p0)>>2]-1)*4))>>2])&&(!(((I[((21684+(I[($p0)>>2]+Math.imul(I[((18724+(I[20506]-1)*4))>>2],20)-21)*4))>>2]&1)!==0)||((I[((21684+(I[20506]+Math.imul(I[((18724+(I[($p0)>>2]-1)*4))>>2],20)-21)*4))>>2]&1)!==0))))?-1:0);
              break S3;
            }
            default:{
              I[20499]=(false?-1:0);
              return ((I[20499]&1)!==0);
            }
          }
          if(((I[20507]&1)!==0)){
            F[20508]=Math.fround(Math.sqrt(Math.fround(Math.fround(Math.pow(Math.fround(F[((18884+(I[20506]-1)*4))>>2]-F[((18884+(I[($p0)>>2]-1)*4))>>2]),Math.fround(2)))+Math.fround(Math.pow(Math.fround(F[((18964+(I[20506]-1)*4))>>2]-F[((18964+(I[($p0)>>2]-1)*4))>>2]),Math.fround(2))))));
            if((F[20508]<F[20501])){
              if((F[20508]<F[20500])){
                I[($p4)>>2]=I[($p3)>>2];
                F[20501]=F[20500];
                I[($p3)>>2]=I[20506];
                F[20500]=F[20508];
              }else{
                I[($p4)>>2]=I[20506];
                F[20501]=F[20508];
              }
            }
          }
        }
      }
      break S1;
    }
    case 12:{
      S4:switch(I[((18724+(I[($p0)>>2]-1)*4))>>2]){
        case 1:{
          I[($p3)>>2]=I[((15500+(1-1)*4))>>2];
          break S4;
        }
        case 2:{
          I[($p3)>>2]=I[((15500+(2-1)*4))>>2];
          break S4;
        }
        case 3:{
          I[($p3)>>2]=I[((15500+(3-1)*4))>>2];
          break S4;
        }
        case 4:{
          I[($p3)>>2]=I[((15500+(4-1)*4))>>2];
          break S4;
        }
        default:{
          I[20499]=(false?-1:0);
          return ((I[20499]&1)!==0);
        }
      }
      break S1;
    }
    case 9:{
      I[20506]=1;
      L5:for(;(I[20506]<=40);I[20506]=((I[20506]+1)|0)){
        if((!((I[((14700+(I[20506]-1)*4))>>2]&1)!==0))){
          continue L5;
        }
        if(((I[((14540+(I[20506]-1)*4))>>2]===3)||(I[((14540+(I[20506]-1)*4))>>2]===4))){
          continue L5;
        }
        S6:switch(I[($p1)>>2]){
          case 9:{
            I[20507]=((((I[((16824+(I[20506]+Math.imul(I[((18724+(I[($p0)>>2]-1)*4))>>2],40)-41)*4))>>2]&1)!==0)&&(I[((16504+(I[20506]-1)*4))>>2]!==I[((18724+(I[($p0)>>2]-1)*4))>>2]))?-1:0);
            break S6;
          }
          default:{
            I[20499]=(false?-1:0);
            return ((I[20499]&1)!==0);
          }
        }
        if(((I[20507]&1)!==0)){
          S7:switch(I[($p1)>>2]){
            case 9:{
              I[20507]=((I[((16664+(I[20506]-1)*4))>>2]>=I[($p2)>>2])?-1:0);
              break S7;
            }
            default:{
              I[20499]=(false?-1:0);
              return ((I[20499]&1)!==0);
            }
          }
        }
        if(((I[20507]&1)!==0)){
          I[20509]=I[((16664+(I[20506]-1)*4))>>2];
          I[20510]=I[((15808+(I[20506]-1)*4))>>2];
          F[20508]=Math.fround(Math.sqrt(Math.fround(Math.fround(Math.pow(Math.fround(F[((16184+(I[20506]-1)*4))>>2]-F[((18884+(I[($p0)>>2]-1)*4))>>2]),Math.fround(2)))+Math.fround(Math.pow(Math.fround(F[((16344+(I[20506]-1)*4))>>2]-F[((18964+(I[($p0)>>2]-1)*4))>>2]),Math.fround(2))))));
          if(((I[20510]<I[20505])||((I[20510]===I[20505])&&((I[20509]<I[20503])||((I[20509]===I[20503])&&(F[20508]<F[20501])))))){
            if(((I[20510]<I[20504])||((I[20510]===I[20504])&&((I[20509]<I[20502])||((I[20509]===I[20502])&&(F[20508]<F[20500])))))){
              I[($p4)>>2]=I[($p3)>>2];
              I[20503]=I[20502];
              I[20505]=I[20504];
              F[20501]=F[20500];
              I[($p3)>>2]=I[20506];
              I[20502]=I[20509];
              I[20504]=I[20510];
              F[20500]=F[20508];
            }else{
              I[($p4)>>2]=I[20506];
              I[20503]=I[20509];
              I[20505]=I[20510];
              F[20501]=F[20508];
            }
          }
        }
      }
      break S1;
    }
    case 8:case 4:case 3:case 6:case 11:case 10:{
      I[20511]=(true?-1:0);
      I[20506]=1;
      L8:for(;(I[20506]<=4);I[20506]=((I[20506]+1)|0)){
        if(((I[((21684+(I[($p0)>>2]+Math.imul(I[20506],20)-21)*4))>>2]&1)!==0)){
          I[20511]=(false?-1:0);
          break L8;
        }
      }
      I[20506]=1;
      L9:for(;(I[20506]<=40);I[20506]=((I[20506]+1)|0)){
        if((!((I[((14700+(I[20506]-1)*4))>>2]&1)!==0))){
          continue L9;
        }
        if(((I[((14540+(I[20506]-1)*4))>>2]===3)||(I[((14540+(I[20506]-1)*4))>>2]===4))){
          continue L9;
        }
        S10:switch(I[($p1)>>2]){
          case 8:{
            I[20507]=((I[((16504+(I[20506]-1)*4))>>2]===I[((18724+(I[($p0)>>2]-1)*4))>>2])?-1:0);
            break S10;
          }
          case 4:{
            I[20507]=(((!((I[((16824+(I[20506]+Math.imul(I[((18724+(I[($p0)>>2]-1)*4))>>2],40)-41)*4))>>2]&1)!==0))||(((I[((16664+(I[20506]-1)*4))>>2]>0)&&((R_spwar($p0,82024))?true:false))&&(I[((14540+(I[20506]-1)*4))>>2]!==4)))?-1:0);
            break S10;
          }
          case 3:{
            I[20507]=(((((((I[((16824+(I[20506]+Math.imul(I[((18724+(I[($p0)>>2]-1)*4))>>2],40)-41)*4))>>2]&1)!==0)||((I[20511]&1)!==0))&&(!((R_spwar($p0,82024))?true:false)))&&(I[((16664+(I[20506]-1)*4))>>2]>0))&&(I[((14540+(I[20506]-1)*4))>>2]===1))?-1:0);
            break S10;
          }
          case 6:{
            I[20507]=(true?-1:0);
            break S10;
          }
          case 11:{
            I[20507]=(((((((I[((16824+(I[20506]+Math.imul(I[((18724+(I[($p0)>>2]-1)*4))>>2],40)-41)*4))>>2]&1)!==0)||((I[20511]&1)!==0))&&(!((R_spwar($p0,82024))?true:false)))&&(I[((16664+(I[20506]-1)*4))>>2]>0))&&(I[((14540+(I[20506]-1)*4))>>2]!==4))?-1:0);
            break S10;
          }
          case 10:{
            I[20507]=((I[((16504+(I[20506]-1)*4))>>2]===I[((18724+(I[($p0)>>2]-1)*4))>>2])?-1:0);
            break S10;
          }
          default:{
            I[20499]=(false?-1:0);
            return ((I[20499]&1)!==0);
          }
        }
        if(((I[20507]&1)!==0)){
          S11:switch(I[($p1)>>2]){
            case 8:{
              I[20507]=((((I[((16664+(I[20506]-1)*4))>>2]-3)|0)>=I[($p2)>>2])?-1:0);
              break S11;
            }
            case 6:case 4:{
              I[20507]=(((!((I[((16824+(I[20506]+Math.imul(I[((18724+(I[($p0)>>2]-1)*4))>>2],40)-41)*4))>>2]&1)!==0))||(I[((16664+(I[20506]-1)*4))>>2]>=I[($p2)>>2]))?-1:0);
              break S11;
            }
            case 3:case 11:case 10:{
              I[20507]=((I[((16664+(I[20506]-1)*4))>>2]>=I[($p2)>>2])?-1:0);
              break S11;
            }
            default:{
              I[20499]=(false?-1:0);
              return ((I[20499]&1)!==0);
            }
          }
        }
        if(((I[20507]&1)!==0)){
          F[20508]=Math.fround(Math.sqrt(Math.fround(Math.fround(Math.pow(Math.fround(F[((16184+(I[20506]-1)*4))>>2]-F[((18884+(I[($p0)>>2]-1)*4))>>2]),Math.fround(2)))+Math.fround(Math.pow(Math.fround(F[((16344+(I[20506]-1)*4))>>2]-F[((18964+(I[($p0)>>2]-1)*4))>>2]),Math.fround(2))))));
          if((F[20508]<F[20501])){
            if((F[20508]<F[20500])){
              I[($p4)>>2]=I[($p3)>>2];
              F[20501]=F[20500];
              I[($p3)>>2]=I[20506];
              F[20500]=F[20508];
            }else{
              I[($p4)>>2]=I[20506];
              F[20501]=F[20508];
            }
          }
        }
      }
      break S1;
    }
    default:{
      I[20499]=(false?-1:0);
      return ((I[20499]&1)!==0);
    }
  }
  I[20499]=((I[($p3)>>2]!==0)?-1:0);
  return ((I[20499]&1)!==0);
  return ((I[20499]&1)!==0);
}
/* CONQMISC.R: subroutine fixdeltas */
function R_fixdeltas($p0){
  F[20512]=Math.fround(Math.fround(F[((19364+(I[($p0)>>2]-1)*4))>>2]*Math.fround(18.0))*Math.fround(0.1));
  F[((19044+(I[($p0)>>2]-1)*4))>>2]=Math.fround(F[20512]*Math.fround(Math.cos(Math.fround(Math.fround(F[((19204+(I[($p0)>>2]-1)*4))>>2]/Math.fround(180.0))*Math.fround(3.14159)))));
  F[((19124+(I[($p0)>>2]-1)*4))>>2]=Math.fround(F[20512]*Math.fround(Math.sin(Math.fround(Math.fround(F[((19204+(I[($p0)>>2]-1)*4))>>2]/Math.fround(180.0))*Math.fround(3.14159)))));
  return;
}
/* CONQMISC.R: function gunum */
function R_gunum($p0,$p1){
  I[($p0)>>2]=0;
  I[20514]=1;
  L1:for(;(I[20514]<=40);I[20514]=((I[20514]+1)|0)){
    if(((I[((1132+(I[20514]-1)*4))>>2]&1)!==0)){
      if((H.strcmp($p1,(9612+1+Math.imul(I[20514],32)-33))===0)){
        I[($p0)>>2]=I[20514];
        I[20513]=(true?-1:0);
        return ((I[20513]&1)!==0);
      }
    }
  }
  I[20513]=(false?-1:0);
  return ((I[20513]&1)!==0);
  return ((I[20513]&1)!==0);
}
/* CONQMISC.R: function histlist */
function* R_histlist($p0){
  R_cdclear();
  I[20516]=1;
  I[20517]=((23-1)|0);
  R_cdputc(82072,82064);
  I[20516]=((I[20516]+2)|0);
  I[20529]=((-1)|0);
  L1:for(;;){
    if((((~I[($p0)>>2]))&1)!==0){
      if((!((R_stillalive(324))?true:false))){
        break L1;
      }
    }
    if((I[20529]!==I[4366])){
      I[20529]=I[4366];
      I[20530]=I[20516];
      I[20531]=8;
      R_cdclrl(82064,(I[20532]=((((I[20517]-I[20516])|0)+1)|0),82128));
      I[20535]=R_modp1((I[20533]=((I[20529]+1)|0),82132),(I[20534]=40,82136));
      I[20536]=1;
      L2:for(;(I[20536]<=40);I[20536]=((I[20536]+1)|0)){
        I[20535]=R_modp1((I[20537]=((I[20535]-1)|0),82148),(I[20538]=40,82152));
        I[20539]=I[((17468+(I[20535]-1)*4))>>2];
        if(((I[20539]<1)||(I[20539]>I[20539]))){
          continue L2;
        }
        if((!((I[((1132+(I[20539]-1)*4))>>2]&1)!==0))){
          continue L2;
        }
        H.prints(388,82160,(9612+1+Math.imul(I[20539],32)-33),(17628+1+Math.imul(I[20535],20)-21));
        R_cdputs(388,82120,82124);
        I[20530]=((I[20530]+1)|0);
        if((I[20530]>I[20517])){
          I[20531]=43;
          I[20530]=I[20516];
        }
      }
    }
    R_putpmt(68204,(I[20543]=24,82172));
    R_cdplay((I[20544]=(true?-1:0),82176));
    if((((yield* H.iogtimed(82180,(I[20546]=1,82184))))?true:false)){
      break L1;
    }
  }
  return F[20515];
  return F[20515];
}
/* CONQMISC.R: subroutine initeverything */
function R_initeverything(){
  R_zeroeverything();
  H.pvunlock(604);
  H.pvlock(604);
  I[150]=(true?-1:0);
  I[20547]=1;
  L1:for(;(I[20547]<=4);I[20547]=((I[20547]+1)|0)){
    I[20548]=1;
    L2:for(;(I[20548]<=20);I[20548]=((I[20548]+1)|0)){
      I[((748+(I[20547]+Math.imul(I[20548],4)-5)*4))>>2]=0;
    }
  }
  I[20547]=1;
  L3:for(;(I[20547]<=40);I[20547]=((I[20547]+1)|0)){
    I[((1132+(I[20547]-1)*4))>>2]=(false?-1:0);
  }
  I[272]=0;
  I[271]=0;
  I[274]=0;
  I[273]=0;
  I[276]=0;
  I[275]=0;
  I[277]=0;
  R_stcpn(79748,1112,(I[20549]=20,82196));
  R_getdandt(728);
  R_getdandt(648);
  R_stcpn(81928,612,(I[20550]=22,82200));
  R_stcpn(82204,636,(I[20554]=12,82216));
  R_stcpn(82220,668,(I[20561]=60,82244));
  H.pvunlock(604);
  H.pvunlock(608);
  R_initrobots();
  R_inituniverse();
  return;
}
/* CONQMISC.R: subroutine initgame */
function R_initgame(){
  H.pvunlock(604);
  H.pvlock(604);
  I[4610]=0;
  I[3992]=2;
  I[3993]=0;
  F[3994]=Math.fround(0.0);
  F[3995]=Math.fround(0.0);
  F[3996]=Math.fround(0.0);
  F[3997]=Math.fround(0.0);
  F[3998]=Math.fround(0.0);
  I[3999]=0;
  R_stcpn(82248,16000,(I[20567]=22,82268));
  I[((16504+(30-1)*4))>>2]=6;
  I[((16504+(1-1)*4))>>2]=1;
  I[((16504+(8-1)*4))>>2]=1;
  I[((16504+(11-1)*4))>>2]=1;
  I[((16504+(31-1)*4))>>2]=6;
  I[((16504+(2-1)*4))>>2]=2;
  I[((16504+(5-1)*4))>>2]=2;
  I[((16504+(12-1)*4))>>2]=2;
  I[((16504+(32-1)*4))>>2]=6;
  I[((16504+(3-1)*4))>>2]=3;
  I[((16504+(6-1)*4))>>2]=3;
  I[((16504+(9-1)*4))>>2]=3;
  I[((16504+(33-1)*4))>>2]=6;
  I[((16504+(4-1)*4))>>2]=4;
  I[((16504+(7-1)*4))>>2]=4;
  I[((16504+(10-1)*4))>>2]=4;
  I[((16504+(34-1)*4))>>2]=6;
  I[((16504+(13-1)*4))>>2]=5;
  I[((16504+(16-1)*4))>>2]=5;
  I[((16504+(14-1)*4))>>2]=5;
  I[((16504+(15-1)*4))>>2]=5;
  I[((16504+(17-1)*4))>>2]=5;
  I[((16504+(18-1)*4))>>2]=5;
  I[((16504+(22-1)*4))>>2]=5;
  I[((16504+(19-1)*4))>>2]=5;
  I[((16504+(23-1)*4))>>2]=5;
  I[((16504+(20-1)*4))>>2]=5;
  I[((16504+(24-1)*4))>>2]=5;
  I[((16504+(21-1)*4))>>2]=5;
  I[((16504+(25-1)*4))>>2]=5;
  I[((16504+(35-1)*4))>>2]=6;
  I[((16504+(27-1)*4))>>2]=7;
  I[((16504+(28-1)*4))>>2]=7;
  I[((16504+(29-1)*4))>>2]=7;
  I[((16504+(26-1)*4))>>2]=6;
  I[((16504+(36-1)*4))>>2]=6;
  I[((16504+(37-1)*4))>>2]=6;
  I[((16504+(38-1)*4))>>2]=6;
  I[((16504+(39-1)*4))>>2]=6;
  I[((16504+(40-1)*4))>>2]=6;
  I[((16664+(30-1)*4))>>2]=100;
  I[((16664+(1-1)*4))>>2]=50;
  I[((16664+(8-1)*4))>>2]=50;
  I[((16664+(11-1)*4))>>2]=50;
  I[((16664+(31-1)*4))>>2]=100;
  I[((16664+(2-1)*4))>>2]=50;
  I[((16664+(5-1)*4))>>2]=50;
  I[((16664+(12-1)*4))>>2]=50;
  I[((16664+(32-1)*4))>>2]=100;
  I[((16664+(3-1)*4))>>2]=50;
  I[((16664+(6-1)*4))>>2]=50;
  I[((16664+(9-1)*4))>>2]=50;
  I[((16664+(33-1)*4))>>2]=100;
  I[((16664+(4-1)*4))>>2]=50;
  I[((16664+(7-1)*4))>>2]=50;
  I[((16664+(10-1)*4))>>2]=50;
  I[((16664+(34-1)*4))>>2]=100;
  I[((16664+(13-1)*4))>>2]=25;
  I[((16664+(16-1)*4))>>2]=25;
  I[((16664+(14-1)*4))>>2]=25;
  I[((16664+(15-1)*4))>>2]=25;
  I[((16664+(17-1)*4))>>2]=25;
  I[((16664+(18-1)*4))>>2]=25;
  I[((16664+(22-1)*4))>>2]=25;
  I[((16664+(19-1)*4))>>2]=25;
  I[((16664+(23-1)*4))>>2]=25;
  I[((16664+(20-1)*4))>>2]=25;
  I[((16664+(24-1)*4))>>2]=25;
  I[((16664+(21-1)*4))>>2]=25;
  I[((16664+(25-1)*4))>>2]=25;
  I[((16664+(35-1)*4))>>2]=100;
  I[((16664+(27-1)*4))>>2]=256;
  I[((16664+(28-1)*4))>>2]=128;
  I[((16664+(29-1)*4))>>2]=512;
  I[((16664+(26-1)*4))>>2]=0;
  I[((16664+(36-1)*4))>>2]=0;
  I[((16664+(37-1)*4))>>2]=0;
  I[((16664+(38-1)*4))>>2]=0;
  I[((16664+(39-1)*4))>>2]=0;
  I[((16664+(40-1)*4))>>2]=0;
  I[20568]=1;
  L1:for(;(I[20568]<=40);I[20568]=((I[20568]+1)|0)){
    I[((15808+(I[20568]-1)*4))>>2]=0;
    I[20569]=1;
    L2:for(;(I[20569]<=4);I[20569]=((I[20569]+1)|0)){
      I[((16824+(I[20568]+Math.imul(I[20569],40)-41)*4))>>2]=(false?-1:0);
    }
  }
  I[20568]=1;
  L3:for(;(I[20568]<=4);I[20568]=((I[20568]+1)|0)){
    I[20569]=1;
    L4:for(;(I[20569]<=3);I[20569]=((I[20569]+1)|0)){
      I[((16824+(I[((15532+(I[20568]+Math.imul(I[20569],4)-5)*4))>>2]+Math.imul(I[20568],40)-41)*4))>>2]=(true?-1:0);
    }
    I[((15792+(I[20568]-1)*4))>>2]=0;
    I[((1068+(I[20568]-1)*4))>>2]=(false?-1:0);
  }
  H.pvunlock(604);
  R_initplanets();
  return;
}
/* CONQMISC.R: subroutine initmsgs */
function R_initmsgs(){
  I[20570]=1;
  L1:for(;(I[20570]<=60);I[20570]=((I[20570]+1)|0)){
    B[(35524+1+Math.imul(I[20570],70)-71)]=0;
    I[((39724+(I[20570]-1)*4))>>2]=0;
    I[((39964+(I[20570]-1)*4))>>2]=0;
  }
  I[10051]=1;
  I[10053]=I[10051];
  return;
}
/* CONQMISC.R: subroutine initplanets */
function R_initplanets(){
  H.pvunlock(604);
  H.pvlock(604);
  R_stcpn(82284,(14860+1+Math.imul(30,12)-13),(I[20572]=12,82288));
  R_stcpn(82292,(14860+1+Math.imul(1,12)-13),(I[20575]=12,82300));
  R_stcpn(82304,(14860+1+Math.imul(8,12)-13),(I[20578]=12,82312));
  R_stcpn(82316,(14860+1+Math.imul(11,12)-13),(I[20581]=12,82324));
  R_stcpn(82328,(14860+1+Math.imul(31,12)-13),(I[20584]=12,82336));
  R_stcpn(82340,(14860+1+Math.imul(2,12)-13),(I[20587]=12,82348));
  R_stcpn(82352,(14860+1+Math.imul(5,12)-13),(I[20590]=12,82360));
  R_stcpn(82364,(14860+1+Math.imul(12,12)-13),(I[20592]=12,82368));
  R_stcpn(82372,(14860+1+Math.imul(32,12)-13),(I[20595]=12,82380));
  R_stcpn(82384,(14860+1+Math.imul(3,12)-13),(I[20598]=12,82392));
  R_stcpn(82396,(14860+1+Math.imul(6,12)-13),(I[20601]=12,82404));
  R_stcpn(82408,(14860+1+Math.imul(9,12)-13),(I[20604]=12,82416));
  R_stcpn(82420,(14860+1+Math.imul(33,12)-13),(I[20608]=12,82432));
  R_stcpn(82436,(14860+1+Math.imul(4,12)-13),(I[20611]=12,82444));
  R_stcpn(82448,(14860+1+Math.imul(7,12)-13),(I[20614]=12,82456));
  R_stcpn(82460,(14860+1+Math.imul(10,12)-13),(I[20617]=12,82468));
  R_stcpn(82472,(14860+1+Math.imul(34,12)-13),(I[20620]=12,82480));
  R_stcpn(82484,(14860+1+Math.imul(13,12)-13),(I[20623]=12,82492));
  R_stcpn(82496,(14860+1+Math.imul(16,12)-13),(I[20626]=12,82504));
  R_stcpn(82508,(14860+1+Math.imul(14,12)-13),(I[20629]=12,82516));
  R_stcpn(82520,(14860+1+Math.imul(15,12)-13),(I[20632]=12,82528));
  R_stcpn(82532,(14860+1+Math.imul(17,12)-13),(I[20635]=12,82540));
  R_stcpn(82544,(14860+1+Math.imul(18,12)-13),(I[20638]=12,82552));
  R_stcpn(82556,(14860+1+Math.imul(22,12)-13),(I[20641]=12,82564));
  R_stcpn(82568,(14860+1+Math.imul(19,12)-13),(I[20644]=12,82576));
  R_stcpn(82580,(14860+1+Math.imul(23,12)-13),(I[20647]=12,82588));
  R_stcpn(82592,(14860+1+Math.imul(20,12)-13),(I[20650]=12,82600));
  R_stcpn(82604,(14860+1+Math.imul(24,12)-13),(I[20653]=12,82612));
  R_stcpn(82616,(14860+1+Math.imul(21,12)-13),(I[20656]=12,82624));
  R_stcpn(82628,(14860+1+Math.imul(25,12)-13),(I[20659]=12,82636));
  R_stcpn(82640,(14860+1+Math.imul(35,12)-13),(I[20662]=12,82648));
  R_stcpn(82652,(14860+1+Math.imul(26,12)-13),(I[20665]=12,82660));
  R_stcpn(82664,(14860+1+Math.imul(27,12)-13),(I[20669]=12,82676));
  R_stcpn(82680,(14860+1+Math.imul(28,12)-13),(I[20672]=12,82688));
  R_stcpn(82692,(14860+1+Math.imul(29,12)-13),(I[20675]=12,82700));
  R_stcpn(82704,(14860+1+Math.imul(36,12)-13),(I[20678]=12,82712));
  R_stcpn(82716,(14860+1+Math.imul(37,12)-13),(I[20681]=12,82724));
  R_stcpn(82728,(14860+1+Math.imul(38,12)-13),(I[20684]=12,82736));
  R_stcpn(82740,(14860+1+Math.imul(39,12)-13),(I[20687]=12,82748));
  R_stcpn(82752,(14860+1+Math.imul(40,12)-13),(I[20690]=12,82760));
  I[((14540+(30-1)*4))>>2]=3;
  I[((14540+(1-1)*4))>>2]=1;
  I[((14540+(8-1)*4))>>2]=2;
  I[((14540+(11-1)*4))>>2]=2;
  I[((14540+(31-1)*4))>>2]=3;
  I[((14540+(2-1)*4))>>2]=1;
  I[((14540+(5-1)*4))>>2]=2;
  I[((14540+(12-1)*4))>>2]=2;
  I[((14540+(32-1)*4))>>2]=3;
  I[((14540+(3-1)*4))>>2]=1;
  I[((14540+(6-1)*4))>>2]=2;
  I[((14540+(9-1)*4))>>2]=2;
  I[((14540+(33-1)*4))>>2]=3;
  I[((14540+(4-1)*4))>>2]=1;
  I[((14540+(7-1)*4))>>2]=2;
  I[((14540+(10-1)*4))>>2]=2;
  I[((14540+(34-1)*4))>>2]=3;
  I[((14540+(13-1)*4))>>2]=1;
  I[((14540+(16-1)*4))>>2]=2;
  I[((14540+(14-1)*4))>>2]=1;
  I[((14540+(15-1)*4))>>2]=1;
  I[((14540+(17-1)*4))>>2]=2;
  I[((14540+(18-1)*4))>>2]=1;
  I[((14540+(22-1)*4))>>2]=2;
  I[((14540+(19-1)*4))>>2]=1;
  I[((14540+(23-1)*4))>>2]=2;
  I[((14540+(20-1)*4))>>2]=1;
  I[((14540+(24-1)*4))>>2]=2;
  I[((14540+(21-1)*4))>>2]=1;
  I[((14540+(25-1)*4))>>2]=2;
  I[((14540+(36-1)*4))>>2]=5;
  I[((14540+(37-1)*4))>>2]=5;
  I[((14540+(38-1)*4))>>2]=5;
  I[((14540+(39-1)*4))>>2]=5;
  I[((14540+(35-1)*4))>>2]=3;
  I[((14540+(26-1)*4))>>2]=4;
  I[((14540+(27-1)*4))>>2]=2;
  I[((14540+(28-1)*4))>>2]=2;
  I[((14540+(29-1)*4))>>2]=1;
  I[((14540+(40-1)*4))>>2]=5;
  R_stcpn(82764,(15340+1+Math.imul(1,20)-21),(I[20695]=20,82780));
  R_stcpn(82784,(15340+1+Math.imul(2,20)-21),(I[20699]=20,82796));
  R_stcpn(82800,(15340+1+Math.imul(3,20)-21),(I[20701]=20,82804));
  R_stcpn(82808,(15340+1+Math.imul(4,20)-21),(I[20704]=20,82816));
  R_stcpn(82820,(15340+1+Math.imul(5,20)-21),(I[20709]=20,82836));
  R_stcpn(82840,(15340+1+Math.imul(6,20)-21),(I[20714]=20,82856));
  R_stcpn(82860,(15340+1+Math.imul(7,20)-21),(I[20719]=20,82876));
  R_stcpn(82880,(15340+1+Math.imul(8,20)-21),(I[20724]=20,82896));
  I[20725]=1;
  L1:for(;(I[20725]<=40);I[20725]=((I[20725]+1)|0)){
    I[((14700+(I[20725]-1)*4))>>2]=(true?-1:0);
    F[((14380+(I[20725]-1)*4))>>2]=Math.fround(0.0);
    F[((14220+(I[20725]-1)*4))>>2]=Math.fround(0);
    I[((14060+(I[20725]-1)*4))>>2]=0;
  }
  I[((14700+(36-1)*4))>>2]=(false?-1:0);
  I[((14700+(37-1)*4))>>2]=(false?-1:0);
  I[((14700+(38-1)*4))>>2]=(false?-1:0);
  I[((14700+(39-1)*4))>>2]=(false?-1:0);
  I[((14700+(35-1)*4))>>2]=(false?-1:0);
  I[((14700+(27-1)*4))>>2]=(false?-1:0);
  I[((14700+(28-1)*4))>>2]=(false?-1:0);
  I[((14700+(29-1)*4))>>2]=(false?-1:0);
  I[((14700+(40-1)*4))>>2]=(false?-1:0);
  F[((16184+(34-1)*4))>>2]=Math.fround(0.0);
  F[((16344+(34-1)*4))>>2]=Math.fround(0.0);
  I[((14060+(34-1)*4))>>2]=0;
  F[((14220+(34-1)*4))>>2]=Math.fround(0.0);
  F[((16024+(34-1)*4))>>2]=Math.fround(0.0);
  F[((14380+(34-1)*4))>>2]=Math.fround(0.0);
  I[((14060+(33-1)*4))>>2]=34;
  F[((14220+(33-1)*4))>>2]=Math.fround(11000.0);
  F[((16024+(33-1)*4))>>2]=Math.fround(45.0);
  F[((14380+(33-1)*4))>>2]=Math.fround(0.0);
  I[((14060+(32-1)*4))>>2]=34;
  F[((14220+(32-1)*4))>>2]=Math.fround(11000.0);
  F[((16024+(32-1)*4))>>2]=Math.fround(135.0);
  F[((14380+(32-1)*4))>>2]=Math.fround(0.0);
  I[((14060+(31-1)*4))>>2]=34;
  F[((14220+(31-1)*4))>>2]=Math.fround(11000.0);
  F[((16024+(31-1)*4))>>2]=Math.fround(225.0);
  F[((14380+(31-1)*4))>>2]=Math.fround(0.0);
  I[((14060+(30-1)*4))>>2]=34;
  F[((14220+(30-1)*4))>>2]=Math.fround(11000.0);
  F[((16024+(30-1)*4))>>2]=Math.fround(315.0);
  F[((14380+(30-1)*4))>>2]=Math.fround(0.0);
  I[((14060+(36-1)*4))>>2]=34;
  F[((14220+(36-1)*4))>>2]=Math.fround(12000.0);
  F[((16024+(36-1)*4))>>2]=Math.fround(0.0);
  F[((14380+(36-1)*4))>>2]=Math.fround(0.0);
  I[((14060+(37-1)*4))>>2]=34;
  F[((14220+(37-1)*4))>>2]=Math.fround(12000.0);
  F[((16024+(37-1)*4))>>2]=Math.fround(90.0);
  F[((14380+(37-1)*4))>>2]=Math.fround(0.0);
  I[((14060+(38-1)*4))>>2]=34;
  F[((14220+(38-1)*4))>>2]=Math.fround(12000.0);
  F[((16024+(38-1)*4))>>2]=Math.fround(180.0);
  F[((14380+(38-1)*4))>>2]=Math.fround(0.0);
  I[((14060+(39-1)*4))>>2]=34;
  F[((14220+(39-1)*4))>>2]=Math.fround(12000.0);
  F[((16024+(39-1)*4))>>2]=Math.fround(270.0);
  F[((14380+(39-1)*4))>>2]=Math.fround(0.0);
  I[((14060+(13-1)*4))>>2]=34;
  F[((14220+(13-1)*4))>>2]=Math.fround(2600.0);
  I[((14060+(16-1)*4))>>2]=34;
  F[((14220+(16-1)*4))>>2]=Math.fround(2600.0);
  I[((14060+(14-1)*4))>>2]=34;
  F[((14220+(14-1)*4))>>2]=Math.fround(2600.0);
  I[((14060+(15-1)*4))>>2]=34;
  F[((14220+(15-1)*4))>>2]=Math.fround(2600.0);
  I[((14060+(17-1)*4))>>2]=34;
  F[((14220+(17-1)*4))>>2]=Math.fround(2600.0);
  I[((14060+(1-1)*4))>>2]=30;
  F[((14220+(1-1)*4))>>2]=Math.fround(2600.0);
  I[((14060+(8-1)*4))>>2]=30;
  F[((14220+(8-1)*4))>>2]=Math.fround(2600.0);
  I[((14060+(11-1)*4))>>2]=30;
  F[((14220+(11-1)*4))>>2]=Math.fround(2600.0);
  I[((14060+(2-1)*4))>>2]=31;
  F[((14220+(2-1)*4))>>2]=Math.fround(2600.0);
  I[((14060+(5-1)*4))>>2]=31;
  F[((14220+(5-1)*4))>>2]=Math.fround(2600.0);
  I[((14060+(12-1)*4))>>2]=31;
  F[((14220+(12-1)*4))>>2]=Math.fround(2600.0);
  I[((14060+(3-1)*4))>>2]=32;
  F[((14220+(3-1)*4))>>2]=Math.fround(2600.0);
  I[((14060+(6-1)*4))>>2]=32;
  F[((14220+(6-1)*4))>>2]=Math.fround(2600.0);
  I[((14060+(9-1)*4))>>2]=32;
  F[((14220+(9-1)*4))>>2]=Math.fround(2600.0);
  I[((14060+(4-1)*4))>>2]=33;
  F[((14220+(4-1)*4))>>2]=Math.fround(2600.0);
  I[((14060+(7-1)*4))>>2]=33;
  F[((14220+(7-1)*4))>>2]=Math.fround(2600.0);
  I[((14060+(10-1)*4))>>2]=33;
  F[((14220+(10-1)*4))>>2]=Math.fround(2600.0);
  I[((14060+(21-1)*4))>>2]=36;
  F[((14220+(21-1)*4))>>2]=Math.fround(1150.0);
  I[((14060+(25-1)*4))>>2]=36;
  F[((14220+(25-1)*4))>>2]=Math.fround(1150.0);
  I[((14060+(20-1)*4))>>2]=37;
  F[((14220+(20-1)*4))>>2]=Math.fround(1150.0);
  I[((14060+(24-1)*4))>>2]=37;
  F[((14220+(24-1)*4))>>2]=Math.fround(1150.0);
  I[((14060+(19-1)*4))>>2]=38;
  F[((14220+(19-1)*4))>>2]=Math.fround(1150.0);
  I[((14060+(23-1)*4))>>2]=38;
  F[((14220+(23-1)*4))>>2]=Math.fround(1150.0);
  I[((14060+(18-1)*4))>>2]=39;
  F[((14220+(18-1)*4))>>2]=Math.fround(1150.0);
  I[((14060+(22-1)*4))>>2]=39;
  F[((14220+(22-1)*4))>>2]=Math.fround(1150.0);
  I[((14060+(35-1)*4))>>2]=34;
  F[((14220+(35-1)*4))>>2]=Math.fround(70000.0);
  I[((14060+(26-1)*4))>>2]=1;
  F[((14220+(26-1)*4))>>2]=Math.fround(1250.0);
  I[((14060+(27-1)*4))>>2]=35;
  F[((14220+(27-1)*4))>>2]=Math.fround(2800.0);
  I[((14060+(28-1)*4))>>2]=35;
  F[((14220+(28-1)*4))>>2]=Math.fround(2100.0);
  I[((14060+(29-1)*4))>>2]=35;
  F[((14220+(29-1)*4))>>2]=Math.fround(2600.0);
  I[((14060+(40-1)*4))>>2]=34;
  F[((14220+(40-1)*4))>>2]=Math.fround(5000.0);
  F[20728]=R_rnduni((F[20726]=Math.fround(0.0),82904),(F[20727]=Math.fround(360.0),82908));
  F[20733]=Math.fround(R_rndnor((F[20729]=Math.fround(5.0),82916),(F[20730]=Math.fround(2.0),82920))*Math.fround(((Math.imul(R_rndint((I[20731]=0,82924),(I[20732]=1,82928)),2)-1)|0)));
  F[((16024+(13-1)*4))>>2]=F[20728];
  F[((14380+(13-1)*4))>>2]=F[20733];
  F[((16024+(17-1)*4))>>2]=R_mod360((F[20734]=Math.fround(F[20728]+Math.fround(Math.fround(Math.fround(1.0)/Math.fround(5.0))*Math.fround(360.0))),82936));
  F[((14380+(17-1)*4))>>2]=F[20733];
  F[((16024+(15-1)*4))>>2]=R_mod360((F[20735]=Math.fround(F[20728]+Math.fround(Math.fround(Math.fround(2.0)/Math.fround(5.0))*Math.fround(360.0))),82940));
  F[((14380+(15-1)*4))>>2]=F[20733];
  F[((16024+(14-1)*4))>>2]=R_mod360((F[20736]=Math.fround(F[20728]+Math.fround(Math.fround(Math.fround(3.0)/Math.fround(5.0))*Math.fround(360.0))),82944));
  F[((14380+(14-1)*4))>>2]=F[20733];
  F[((16024+(16-1)*4))>>2]=R_mod360((F[20737]=Math.fround(F[20728]+Math.fround(Math.fround(Math.fround(4.0)/Math.fround(5.0))*Math.fround(360.0))),82948));
  F[((14380+(16-1)*4))>>2]=F[20733];
  F[20728]=R_rnduni((F[20738]=Math.fround(0.0),82952),(F[20739]=Math.fround(360.0),82956));
  F[20733]=Math.fround(R_rndnor((F[20740]=Math.fround(5.0),82960),(F[20741]=Math.fround(2.0),82964))*Math.fround(((Math.imul(R_rndint((I[20742]=0,82968),(I[20743]=1,82972)),2)-1)|0)));
  F[((16024+(1-1)*4))>>2]=F[20728];
  F[((14380+(1-1)*4))>>2]=F[20733];
  F[((16024+(8-1)*4))>>2]=R_mod360((F[20744]=Math.fround(F[20728]+Math.fround(Math.fround(Math.fround(2.0)/Math.fround(3.0))*Math.fround(360.0))),82976));
  F[((14380+(8-1)*4))>>2]=F[20733];
  F[((16024+(11-1)*4))>>2]=R_mod360((F[20745]=Math.fround(F[20728]+Math.fround(Math.fround(Math.fround(1.0)/Math.fround(3.0))*Math.fround(360.0))),82980));
  F[((14380+(11-1)*4))>>2]=F[20733];
  F[((14380+(26-1)*4))>>2]=Math.fround(Math.fround(12.0)*F[20733]);
  F[((16024+(26-1)*4))>>2]=R_rnduni((F[20746]=Math.fround(0.0),82984),(F[20747]=Math.fround(360.0),82988));
  F[20728]=R_rnduni((F[20748]=Math.fround(0.0),82992),(F[20749]=Math.fround(360.0),82996));
  F[20733]=Math.fround(R_rndnor((F[20750]=Math.fround(5.0),83000),(F[20751]=Math.fround(2.0),83004))*Math.fround(((Math.imul(R_rndint((I[20752]=0,83008),(I[20753]=1,83012)),2)-1)|0)));
  F[((16024+(2-1)*4))>>2]=F[20728];
  F[((14380+(2-1)*4))>>2]=F[20733];
  F[((16024+(5-1)*4))>>2]=R_mod360((F[20754]=Math.fround(F[20728]+Math.fround(Math.fround(Math.fround(2.0)/Math.fround(3.0))*Math.fround(360.0))),83016));
  F[((14380+(5-1)*4))>>2]=F[20733];
  F[((16024+(12-1)*4))>>2]=R_mod360((F[20755]=Math.fround(F[20728]+Math.fround(Math.fround(Math.fround(1.0)/Math.fround(3.0))*Math.fround(360.0))),83020));
  F[((14380+(12-1)*4))>>2]=F[20733];
  F[20728]=R_rnduni((F[20756]=Math.fround(0.0),83024),(F[20757]=Math.fround(360.0),83028));
  F[20733]=Math.fround(R_rndnor((F[20758]=Math.fround(5.0),83032),(F[20759]=Math.fround(2.0),83036))*Math.fround(((Math.imul(R_rndint((I[20760]=0,83040),(I[20761]=1,83044)),2)-1)|0)));
  F[((16024+(3-1)*4))>>2]=F[20728];
  F[((14380+(3-1)*4))>>2]=F[20733];
  F[((16024+(6-1)*4))>>2]=R_mod360((F[20762]=Math.fround(F[20728]+Math.fround(Math.fround(Math.fround(2.0)/Math.fround(3.0))*Math.fround(360.0))),83048));
  F[((14380+(6-1)*4))>>2]=F[20733];
  F[((16024+(9-1)*4))>>2]=R_mod360((F[20763]=Math.fround(F[20728]+Math.fround(Math.fround(Math.fround(1.0)/Math.fround(3.0))*Math.fround(360.0))),83052));
  F[((14380+(9-1)*4))>>2]=F[20733];
  F[20728]=R_rnduni((F[20764]=Math.fround(0.0),83056),(F[20765]=Math.fround(360.0),83060));
  F[20733]=Math.fround(R_rndnor((F[20766]=Math.fround(5.0),83064),(F[20767]=Math.fround(2.0),83068))*Math.fround(((Math.imul(R_rndint((I[20768]=0,83072),(I[20769]=1,83076)),2)-1)|0)));
  F[((16024+(4-1)*4))>>2]=F[20728];
  F[((14380+(4-1)*4))>>2]=F[20733];
  F[((16024+(7-1)*4))>>2]=R_mod360((F[20770]=Math.fround(F[20728]+Math.fround(Math.fround(Math.fround(2.0)/Math.fround(3.0))*Math.fround(360.0))),83080));
  F[((14380+(7-1)*4))>>2]=F[20733];
  F[((16024+(10-1)*4))>>2]=R_mod360((F[20771]=Math.fround(F[20728]+Math.fround(Math.fround(Math.fround(1.0)/Math.fround(3.0))*Math.fround(360.0))),83084));
  F[((14380+(10-1)*4))>>2]=F[20733];
  F[20728]=R_rnduni((F[20772]=Math.fround(0.0),83088),(F[20773]=Math.fround(360.0),83092));
  F[20733]=Math.fround(R_rndnor((F[20774]=Math.fround(5.0),83096),(F[20775]=Math.fround(2.0),83100))*Math.fround(((Math.imul(R_rndint((I[20776]=0,83104),(I[20777]=1,83108)),2)-1)|0)));
  F[((16024+(21-1)*4))>>2]=F[20728];
  F[((14380+(21-1)*4))>>2]=F[20733];
  F[((16024+(25-1)*4))>>2]=R_mod360((F[20778]=Math.fround(F[20728]+Math.fround(Math.fround(Math.fround(1.0)/Math.fround(2.0))*Math.fround(360.0))),83112));
  F[((14380+(25-1)*4))>>2]=F[20733];
  F[20728]=R_rnduni((F[20779]=Math.fround(0.0),83116),(F[20780]=Math.fround(360.0),83120));
  F[20733]=Math.fround(R_rndnor((F[20781]=Math.fround(5.0),83124),(F[20782]=Math.fround(2.0),83128))*Math.fround(((Math.imul(R_rndint((I[20783]=0,83132),(I[20784]=1,83136)),2)-1)|0)));
  F[((16024+(20-1)*4))>>2]=F[20728];
  F[((14380+(20-1)*4))>>2]=F[20733];
  F[((16024+(24-1)*4))>>2]=R_mod360((F[20785]=Math.fround(F[20728]+Math.fround(Math.fround(Math.fround(1.0)/Math.fround(2.0))*Math.fround(360.0))),83140));
  F[((14380+(24-1)*4))>>2]=F[20733];
  F[20728]=R_rnduni((F[20786]=Math.fround(0.0),83144),(F[20787]=Math.fround(360.0),83148));
  F[20733]=Math.fround(R_rndnor((F[20788]=Math.fround(5.0),83152),(F[20789]=Math.fround(2.0),83156))*Math.fround(((Math.imul(R_rndint((I[20790]=0,83160),(I[20791]=1,83164)),2)-1)|0)));
  F[((16024+(19-1)*4))>>2]=F[20728];
  F[((14380+(19-1)*4))>>2]=F[20733];
  F[((16024+(23-1)*4))>>2]=R_mod360((F[20792]=Math.fround(F[20728]+Math.fround(Math.fround(Math.fround(1.0)/Math.fround(2.0))*Math.fround(360.0))),83168));
  F[((14380+(23-1)*4))>>2]=F[20733];
  F[20728]=R_rnduni((F[20793]=Math.fround(0.0),83172),(F[20794]=Math.fround(360.0),83176));
  F[20733]=Math.fround(R_rndnor((F[20795]=Math.fround(5.0),83180),(F[20796]=Math.fround(2.0),83184))*Math.fround(((Math.imul(R_rndint((I[20797]=0,83188),(I[20798]=1,83192)),2)-1)|0)));
  F[((16024+(18-1)*4))>>2]=F[20728];
  F[((14380+(18-1)*4))>>2]=F[20733];
  F[((16024+(22-1)*4))>>2]=R_mod360((F[20799]=Math.fround(F[20728]+Math.fround(Math.fround(Math.fround(1.0)/Math.fround(2.0))*Math.fround(360.0))),83196));
  F[((14380+(22-1)*4))>>2]=F[20733];
  F[((14380+(35-1)*4))>>2]=Math.fround(0.1);
  F[20728]=R_rnduni((F[20800]=Math.fround(0.0),83200),(F[20801]=Math.fround(360.0),83204));
  F[20733]=Math.fround(R_rndnor((F[20802]=Math.fround(5.0),83208),(F[20803]=Math.fround(2.0),83212))*Math.fround(((Math.imul(R_rndint((I[20804]=0,83216),(I[20805]=1,83220)),2)-1)|0)));
  F[((16024+(27-1)*4))>>2]=F[20728];
  F[((14380+(27-1)*4))>>2]=F[20733];
  F[((16024+(28-1)*4))>>2]=R_mod360((F[20806]=Math.fround(F[20728]+Math.fround(Math.fround(Math.fround(2.0)/Math.fround(3.0))*Math.fround(360.0))),83224));
  F[((14380+(28-1)*4))>>2]=F[20733];
  F[((16024+(29-1)*4))>>2]=R_mod360((F[20807]=Math.fround(F[20728]+Math.fround(Math.fround(Math.fround(1.0)/Math.fround(3.0))*Math.fround(360.0))),83228));
  F[((14380+(29-1)*4))>>2]=F[20733];
  F[20728]=R_rnduni((F[20808]=Math.fround(0.0),83232),(F[20809]=Math.fround(360.0),83236));
  F[20733]=Math.fround(R_rndnor((F[20810]=Math.fround(5.0),83240),(F[20811]=Math.fround(2.0),83244))*Math.fround(((Math.imul(R_rndint((I[20812]=0,83248),(I[20813]=1,83252)),2)-1)|0)));
  F[((16024+(40-1)*4))>>2]=F[20728];
  F[((14380+(40-1)*4))>>2]=F[20733];
  I[20725]=40;
  L2:for(;(I[20725]>=1);I[20725]=((I[20725]-1)|0)){
    if((I[((14060+(I[20725]-1)*4))>>2]!==0)){
      F[((16184+(I[20725]-1)*4))>>2]=Math.fround(F[((16184+(I[((14060+(I[20725]-1)*4))>>2]-1)*4))>>2]+Math.fround(F[((14220+(I[20725]-1)*4))>>2]*Math.fround(Math.cos(Math.fround(Math.fround(F[((16024+(I[20725]-1)*4))>>2]/Math.fround(180.0))*Math.fround(3.14159))))));
      F[((16344+(I[20725]-1)*4))>>2]=Math.fround(F[((16344+(I[((14060+(I[20725]-1)*4))>>2]-1)*4))>>2]+Math.fround(F[((14220+(I[20725]-1)*4))>>2]*Math.fround(Math.sin(Math.fround(Math.fround(F[((16024+(I[20725]-1)*4))>>2]/Math.fround(180.0))*Math.fround(3.14159))))));
    }
  }
  H.pvunlock(604);
  H.upchuck();
  return;
}
/* CONQMISC.R: subroutine initrobots */
function R_initrobots(){
  if(((R_gunum(84184,84188))?true:false)){
    R_stcpn(84196,(10892+1+Math.imul(I[21046],24)-25),(I[21052]=22,84208));
  }else{
    if(((R_register(84188,84196,(I[21053]=2,84212),84184))?true:false)){
      I[((4972+(I[21046]-1)*4))>>2]=(true?-1:0);
      I[((7692+(I[21046]+Math.imul(2,40)-41)*4))>>2]=(true?-1:0);
      I[((1452+(I[21046]-1)*4))>>2]=20;
    }
  }
  if(((R_gunum(84184,82436))?true:false)){
    R_stcpn(84216,(10892+1+Math.imul(I[21046],24)-25),(I[21057]=22,84228));
  }else{
    if(((R_register(82436,84216,(I[21058]=4,84232),84184))?true:false)){
      I[((4972+(I[21046]-1)*4))>>2]=(true?-1:0);
      I[((7692+(I[21046]+Math.imul(2,40)-41)*4))>>2]=(true?-1:0);
      I[((1452+(I[21046]-1)*4))>>2]=20;
    }
  }
  if(((R_gunum(84184,84236))?true:false)){
    R_stcpn(84247,(10892+1+Math.imul(I[21046],24)-25),(I[21063]=22,84252));
  }else{
    if(((R_register(84236,84247,(I[21064]=1,84256),84184))?true:false)){
      I[((4972+(I[21046]-1)*4))>>2]=(true?-1:0);
      I[((7692+(I[21046]+Math.imul(2,40)-41)*4))>>2]=(true?-1:0);
      I[((1452+(I[21046]-1)*4))>>2]=20;
    }
  }
  if(((R_gunum(84184,84260))?true:false)){
    R_stcpn(84268,(10892+1+Math.imul(I[21046],24)-25),(I[21070]=22,84280));
  }else{
    if(((R_register(84260,84268,(I[21071]=3,84284),84184))?true:false)){
      I[((4972+(I[21046]-1)*4))>>2]=(true?-1:0);
      I[((7692+(I[21046]+Math.imul(2,40)-41)*4))>>2]=(true?-1:0);
      I[((1452+(I[21046]-1)*4))>>2]=20;
    }
  }
  I[21072]=1;
  L1:for(;(I[21072]<=20);I[21072]=((I[21072]+1)|0)){
    I[21073]=1;
    L2:for(;(I[21073]<=10);I[21073]=((I[21073]+1)|0)){
      I[((12652+(I[21072]+Math.imul(I[21073],32)-33)*4))>>2]=I[((83256+(I[21072]+Math.imul(I[21073],20)-21)*4))>>2];
    }
  }
  I[21072]=1;
  L3:for(;(I[21072]<=32);I[21072]=((I[21072]+1)|0)){
    I[((13932+(I[21072]-1)*4))>>2]=I[((84056+(I[21072]-1)*4))>>2];
  }
  I[10052]=(false?-1:0);
  return;
}
/* CONQMISC.R: subroutine initship */
function R_initship($p0,$p1){
  I[((18564+(I[($p0)>>2]-1)*4))>>2]=0;
  F[((18884+(I[($p0)>>2]-1)*4))>>2]=Math.fround(0.0);
  F[((18964+(I[($p0)>>2]-1)*4))>>2]=Math.fround(0.0);
  F[((19044+(I[($p0)>>2]-1)*4))>>2]=Math.fround(0.0);
  F[((19124+(I[($p0)>>2]-1)*4))>>2]=Math.fround(0.0);
  F[((19204+(I[($p0)>>2]-1)*4))>>2]=Math.fround(0.0);
  F[((19284+(I[($p0)>>2]-1)*4))>>2]=Math.fround(0.0);
  F[((19364+(I[($p0)>>2]-1)*4))>>2]=Math.fround(0.0);
  F[((19444+(I[($p0)>>2]-1)*4))>>2]=Math.fround(0.0);
  I[((19524+(I[($p0)>>2]-1)*4))>>2]=0;
  I[((19604+(I[($p0)>>2]-1)*4))>>2]=(true?-1:0);
  F[((19684+(I[($p0)>>2]-1)*4))>>2]=Math.fround(100.0);
  F[((19764+(I[($p0)>>2]-1)*4))>>2]=Math.fround(0.0);
  F[((19844+(I[($p0)>>2]-1)*4))>>2]=Math.fround(0.0);
  F[((19924+(I[($p0)>>2]-1)*4))>>2]=Math.fround(999.0);
  F[((20004+(I[($p0)>>2]-1)*4))>>2]=Math.fround(0.0);
  F[((20084+(I[($p0)>>2]-1)*4))>>2]=Math.fround(0.0);
  I[((20164+(I[($p0)>>2]-1)*4))>>2]=0;
  I[((20244+(I[($p0)>>2]-1)*4))>>2]=0;
  I[((20324+(I[($p0)>>2]-1)*4))>>2]=40;
  I[((20404+(I[($p0)>>2]-1)*4))>>2]=((100-I[((20324+(I[($p0)>>2]-1)*4))>>2])|0);
  I[((20484+(I[($p0)>>2]-1)*4))>>2]=0;
  I[((20564+(I[($p0)>>2]-1)*4))>>2]=(false?-1:0);
  I[((20644+(I[($p0)>>2]-1)*4))>>2]=(false?-1:0);
  I[21074]=1;
  L1:for(;(I[21074]<=4);I[21074]=((I[21074]+1)|0)){
    I[((26244+(I[($p0)>>2]+Math.imul(I[21074],20)-21)*4))>>2]=0;
  }
  I[21074]=1;
  L2:for(;(I[21074]<=40);I[21074]=((I[21074]+1)|0)){
    I[((22324+(I[($p0)>>2]+Math.imul(I[21074],20)-21)*4))>>2]=(false?-1:0);
  }
  H.pvlock(608);
  if((I[((25604+(I[($p0)>>2]-1)*4))>>2]===((-1)|0))){
    I[((25604+(I[($p0)>>2]-1)*4))>>2]=I[10051];
    I[((25684+(I[($p0)>>2]-1)*4))>>2]=I[((25604+(I[($p0)>>2]-1)*4))>>2];
  }
  H.pvunlock(608);
  I[((25764+(I[($p0)>>2]-1)*4))>>2]=(false?-1:0);
  I[((25844+(I[($p0)>>2]-1)*4))>>2]=0;
  I[((25924+(I[($p0)>>2]-1)*4))>>2]=0;
  F[((26004+(I[($p0)>>2]-1)*4))>>2]=Math.fround(0.0);
  F[((26084+(I[($p0)>>2]-1)*4))>>2]=Math.fround(0.0);
  I[((26164+(I[($p0)>>2]-1)*4))>>2]=0;
  I[((26564+(I[($p0)>>2]-1)*4))>>2]=(false?-1:0);
  I[((26644+(I[($p0)>>2]-1)*4))>>2]=(false?-1:0);
  I[((26724+(I[($p0)>>2]-1)*4))>>2]=0;
  I[21074]=1;
  L3:for(;(I[21074]<=9);I[21074]=((I[21074]+1)|0)){
    I[((27604+(I[($p0)>>2]+Math.imul(I[21074],20)-21)*4))>>2]=1;
    I[((28324+(I[($p0)>>2]+Math.imul(I[21074],20)-21)*4))>>2]=0;
    F[((29044+(I[($p0)>>2]+Math.imul(I[21074],20)-21)*4))>>2]=Math.fround(0.0);
    F[((29764+(I[($p0)>>2]+Math.imul(I[21074],20)-21)*4))>>2]=Math.fround(0.0);
    F[((30484+(I[($p0)>>2]+Math.imul(I[21074],20)-21)*4))>>2]=Math.fround(0.0);
    F[((31204+(I[($p0)>>2]+Math.imul(I[21074],20)-21)*4))>>2]=Math.fround(0.0);
    F[((31924+(I[($p0)>>2]+Math.imul(I[21074],20)-21)*4))>>2]=Math.fround(0.0);
    I[21075]=1;
    L4:for(;(I[21075]<=4);I[21075]=((I[21075]+1)|0)){
      I[((32644+(I[($p0)>>2]+Math.imul(I[21074],20)+Math.imul(I[21075],180)-201)*4))>>2]=(false?-1:0);
    }
  }
  R_getdandt((11852+1+Math.imul(I[($p1)>>2],20)-21));
  if((B[(11852+9+Math.imul(I[($p1)>>2],20)-21)]===32)){
    H.scopy((11852+1+Math.imul(I[($p1)>>2],20)-21),(I[21076]=9,84304),(11852+1+Math.imul(I[($p1)>>2],20)-21),(I[21077]=6,84308));
  }
  I[((1612+(I[($p1)>>2]+Math.imul(6,40)-41)*4))>>2]=((I[((1612+(I[($p1)>>2]+Math.imul(6,40)-41)*4))>>2]+1)|0);
  I[((748+(I[((18724+(I[($p0)>>2]-1)*4))>>2]+Math.imul(5,4)-5)*4))>>2]=((I[((748+(I[((18724+(I[($p0)>>2]-1)*4))>>2]+Math.imul(5,4)-5)*4))>>2]+1)|0);
  return;
}
/* CONQMISC.R: subroutine inituniverse */
function R_inituniverse(){
  H.pvunlock(604);
  H.pvlock(604);
  I[150]=(true?-1:0);
  I[((15532+(1+Math.imul(1,4)-5)*4))>>2]=1;
  I[((15532+(1+Math.imul(2,4)-5)*4))>>2]=8;
  I[((15532+(1+Math.imul(3,4)-5)*4))>>2]=11;
  I[((15532+(2+Math.imul(1,4)-5)*4))>>2]=2;
  I[((15532+(2+Math.imul(2,4)-5)*4))>>2]=5;
  I[((15532+(2+Math.imul(3,4)-5)*4))>>2]=12;
  I[((15532+(3+Math.imul(1,4)-5)*4))>>2]=3;
  I[((15532+(3+Math.imul(2,4)-5)*4))>>2]=6;
  I[((15532+(3+Math.imul(3,4)-5)*4))>>2]=9;
  I[((15532+(4+Math.imul(1,4)-5)*4))>>2]=4;
  I[((15532+(4+Math.imul(2,4)-5)*4))>>2]=7;
  I[((15532+(4+Math.imul(3,4)-5)*4))>>2]=10;
  I[((15500+(1-1)*4))>>2]=1;
  I[((15500+(2-1)*4))>>2]=2;
  I[((15500+(3-1)*4))>>2]=3;
  I[((15500+(4-1)*4))>>2]=4;
  I[((15516+(1-1)*4))>>2]=30;
  I[((15516+(2-1)*4))>>2]=31;
  I[((15516+(3-1)*4))>>2]=32;
  I[((15516+(4-1)*4))>>2]=33;
  F[((15596+(1-1)*4))>>2]=Math.fround(9.0);
  F[((15596+(2-1)*4))>>2]=Math.fround(8.0);
  F[((15596+(3-1)*4))>>2]=Math.fround(9.0);
  F[((15596+(4-1)*4))>>2]=Math.fround(10.0);
  I[((15580+(1-1)*4))>>2]=9;
  I[((15580+(2-1)*4))>>2]=11;
  I[((15580+(3-1)*4))>>2]=9;
  I[((15580+(4-1)*4))>>2]=7;
  F[((15612+(1-1)*4))>>2]=Math.fround(1.0);
  F[((15612+(2-1)*4))>>2]=Math.fround(0.8);
  F[((15612+(3-1)*4))>>2]=Math.fround(1.0);
  F[((15612+(4-1)*4))>>2]=Math.fround(1.2);
  F[((15628+(1-1)*4))>>2]=Math.fround(1.0);
  F[((15628+(2-1)*4))>>2]=Math.fround(0.8);
  F[((15628+(3-1)*4))>>2]=Math.fround(1.0);
  F[((15628+(4-1)*4))>>2]=Math.fround(1.6);
  F[((15644+(1-1)*4))>>2]=Math.fround(1.0);
  F[((15644+(2-1)*4))>>2]=Math.fround(1.17);
  F[((15644+(3-1)*4))>>2]=Math.fround(1.0);
  F[((15644+(4-1)*4))>>2]=Math.fround(0.83);
  F[((15660+(1-1)*4))>>2]=Math.fround(12.0);
  F[((15660+(2-1)*4))>>2]=Math.fround(10.0);
  F[((15660+(3-1)*4))>>2]=Math.fround(12.0);
  F[((15660+(4-1)*4))>>2]=Math.fround(14.0);
  R_stcpn(84236,(15676+1+Math.imul(1,12)-13),(I[21078]=12,84312));
  R_stcpn(84188,(15676+1+Math.imul(2,12)-13),(I[21079]=12,84316));
  R_stcpn(84260,(15676+1+Math.imul(3,12)-13),(I[21080]=12,84320));
  R_stcpn(82436,(15676+1+Math.imul(4,12)-13),(I[21081]=12,84324));
  R_stcpn(82204,(15676+1+Math.imul(5,12)-13),(I[21082]=12,84328));
  R_stcpn(84332,(15676+1+Math.imul(6,12)-13),(I[21084]=12,84336));
  R_stcpn(81928,(15676+1+Math.imul(7,12)-13),(I[21085]=12,84340));
  R_stcpn(84344,(15676+1+Math.imul(8,12)-13),(I[21088]=12,84352));
  B[(15772+1-1)]=77;
  B[(15772+2-1)]=68;
  B[(15772+3-1)]=83;
  B[(15772+4-1)]=109;
  B[(15772+5-1)]=71;
  B[(15772+6-1)]=65;
  B[(15772+7-1)]=79;
  B[(15772+8-1)]=90;
  B[(15784+1-1)]=70;
  B[(15784+2-1)]=82;
  B[(15784+3-1)]=75;
  B[(15784+4-1)]=79;
  B[(15784+5-1)]=45;
  B[(15784+6-1)]=32;
  B[(15784+7-1)]=71;
  B[(15784+8-1)]=69;
  B[(15780+1-1)]=42;
  B[(15780+2-1)]=64;
  B[(15780+3-1)]=43;
  B[(15780+4-1)]=46;
  I[4609]=0;
  B[(18444+1-1)]=0;
  I[4366]=1;
  I[21089]=1;
  L1:for(;(I[21089]<=40);I[21089]=((I[21089]+1)|0)){
    I[((17468+(I[21089]-1)*4))>>2]=((-1)|0);
    B[(17628+1+Math.imul(I[21089],20)-21)]=0;
  }
  H.pvunlock(604);
  R_initgame();
  R_clearships();
  R_initmsgs();
  return;
}
/* CONQMISC.R: subroutine intrude */
function R_intrude($p0,$p1){
  if(((((I[((14700+(I[($p1)>>2]-1)*4))>>2]&1)!==0)&&(I[((16504+(I[($p1)>>2]-1)*4))>>2]!==5))&&(I[((16504+(I[($p1)>>2]-1)*4))>>2]!==6))){
    if((I[($p0)>>2]===((-103)|0))){
      H.strcpy(16000,84381);
      H.upper(16000);
      H.appstr(84360,84381);
      H.appstr(84371,84381);
      R_appint((16664+(I[($p1)>>2]-1)*4),84381);
      R_stormsg((I[21118]=((-I[($p1)>>2])|0),84472),(I[21119]=((-I[((16504+(I[($p1)>>2]-1)*4))>>2])|0),84476),84381);
    }else{
      if(((I[((21684+(I[($p0)>>2]+Math.imul(I[((16504+(I[($p1)>>2]-1)*4))>>2],20)-21)*4))>>2]&1)!==0)){
        H.strcpy(84480,84381);
        R_appship($p0,84381);
        H.appstr(84360,84381);
        H.appstr(84371,84381);
        R_appint((16664+(I[($p1)>>2]-1)*4),84381);
        R_stormsg((I[21125]=((-I[($p1)>>2])|0),84500),(I[21126]=((-I[((16504+(I[($p1)>>2]-1)*4))>>2])|0),84504),84381);
        R_defend($p0,$p1);
      }
    }
  }
  return;
}
/* CONQMISC.R: function loghist */
function R_loghist($p0){
  H.pvlock(604);
  I[4366]=R_modp1((I[21128]=((I[4366]+1)|0),84512),(I[21129]=40,84516));
  R_getdandt((17628+1+Math.imul(I[4366],20)-21));
  if((B[(17628+9+Math.imul(I[4366],20)-21)]===32)){
    H.scopy((17628+1+Math.imul(I[4366],20)-21),(I[21130]=9,84520),(17628+1+Math.imul(I[4366],20)-21),(I[21131]=6,84524));
  }
  I[((17468+(I[4366]-1)*4))>>2]=I[($p0)>>2];
  H.pvunlock(604);
  return F[21127];
}
/* CONQMISC.R: function newarp */
function R_newarp($p0,$p1){
  F[21133]=Math.fround(F[($p1)>>2]-F[((19364+(I[($p0)>>2]-1)*4))>>2]);
  F[21134]=Math.fround(Math.fround(F[((15628+(I[((18724+(I[($p0)>>2]-1)*4))>>2]-1)*4))>>2]*Math.fround(Math.fround(Math.fround(Math.fround(Math.fround(Math.fround(I[((20404+(I[($p0)>>2]-1)*4))>>2])+Math.fround(50.0))/Math.fround(100.0))*F[((15612+(I[((18724+(I[($p0)>>2]-1)*4))>>2]-1)*4))>>2])*Math.fround(F[((19764+(I[($p0)>>2]-1)*4))>>2]+Math.fround(50.0)))/Math.fround(50.0)))*Math.fround(0.1));
  if((F[21134]>=Math.abs(F[21133]))){
    F[21132]=F[($p1)>>2];
    return F[21132];
  }else{
    if((F[21133]<0)){
      F[21132]=Math.fround(F[((19364+(I[($p0)>>2]-1)*4))>>2]-F[21134]);
      return F[21132];
    }
  }
  F[21132]=Math.fround(F[((19364+(I[($p0)>>2]-1)*4))>>2]+F[21134]);
  return F[21132];
  return F[21132];
}
/* CONQMISC.R: function phoon */
function R_phoon($p0){
  if((I[((14540+(I[($p0)>>2]-1)*4))>>2]===3)){
    I[21135]=((-1)|0);
    return I[21135];
  }
  I[21136]=I[((14060+(I[($p0)>>2]-1)*4))>>2];
  if((I[21136]===0)){
    I[21135]=((-1)|0);
    return I[21135];
  }
  if(((I[((14540+(I[21136]-1)*4))>>2]===3)||(!((I[((14700+(I[21136]-1)*4))>>2]&1)!==0)))){
    I[21135]=((-1)|0);
    return I[21135];
  }
  I[21137]=I[((14060+(I[21136]-1)*4))>>2];
  if((I[21137]===0)){
    I[21135]=((-1)|0);
    return I[21135];
  }
  if(((I[((14540+(I[21137]-1)*4))>>2]!==3)||(!((I[((14700+(I[21137]-1)*4))>>2]&1)!==0)))){
    I[21135]=((-1)|0);
    return I[21135];
  }
  I[21139]=$fix(Math.fround(R_mod360((F[21138]=Math.fround(Math.fround(F[((16024+(I[($p0)>>2]-1)*4))>>2]-F[((16024+(I[21136]-1)*4))>>2])-Math.fround(45.0)),84552))/Math.fround(90.0)));
  if((F[((14380+(I[($p0)>>2]-1)*4))>>2]<Math.fround(0.0))){
    S1:switch(I[21139]){
      case 2:{
        I[21139]=0;
        break S1;
      }
      case 0:{
        I[21139]=2;
        break S1;
      }
    }
  }
  I[21135]=I[21139];
  return I[21135];
  return I[21135];
}
/* CONQMISC.R: function planmatch */
function R_planmatch($p0,$p1,$p2){
  if(((I[($p2)>>2]&1)!==0)){
    I[($p1)>>2]=1;
    L1:for(;(I[($p1)>>2]<=40);I[($p1)>>2]=((I[($p1)>>2]+1)|0)){
      if(((R_stmatch($p0,(14860+1+Math.imul(I[($p1)>>2],12)-13),(I[21141]=(false?-1:0),84564)))?true:false)){
        I[21140]=(true?-1:0);
        return ((I[21140]&1)!==0);
      }
    }
  }else{
    I[($p1)>>2]=1;
    L2:for(;(I[($p1)>>2]<=40);I[($p1)>>2]=((I[($p1)>>2]+1)|0)){
      if(((I[((14700+(I[($p1)>>2]-1)*4))>>2]&1)!==0)){
        if(((R_stmatch($p0,(14860+1+Math.imul(I[($p1)>>2],12)-13),(I[21142]=(false?-1:0),84568)))?true:false)){
          I[21140]=(true?-1:0);
          return ((I[21140]&1)!==0);
        }
      }
    }
  }
  I[21140]=(false?-1:0);
  return ((I[21140]&1)!==0);
  return ((I[21140]&1)!==0);
}
/* CONQMISC.R: subroutine puthing */
function R_puthing($p0,$p1,$p2){
  S1:switch(I[($p0)>>2]){
    case 3:{
      H.strcpy(84572,(84578+1+Math.imul(1,6)-7));
      H.strcpy(84596,(84578+1+Math.imul(2,6)-7));
      H.strcpy(84602,(84578+1+Math.imul(3,6)-7));
      break S1;
    }
    case 1:case 6:case 7:case 8:case 2:case 5:{
      H.strcpy(84608,(84578+1+Math.imul(1,6)-7));
      H.strcpy(84614,(84578+1+Math.imul(2,6)-7));
      H.strcpy(84620,(84578+1+Math.imul(3,6)-7));
      break S1;
    }
    case 4:{
      H.strcpy(84626,(84578+1+Math.imul(1,6)-7));
      H.strcpy(84632,(84578+1+Math.imul(2,6)-7));
      H.strcpy(84626,(84578+1+Math.imul(3,6)-7));
      break S1;
    }
    case -1:{
      H.strcpy(84638,(84578+1+Math.imul(1,6)-7));
      H.strcpy(84644,(84578+1+Math.imul(2,6)-7));
      H.strcpy(84638,(84578+1+Math.imul(3,6)-7));
      break S1;
    }
    case -2:{
      H.strcpy(84650,(84578+1+Math.imul(1,6)-7));
      H.strcpy(84656,(84578+1+Math.imul(2,6)-7));
      H.strcpy(84662,(84578+1+Math.imul(3,6)-7));
      break S1;
    }
    default:{
      H.strcpy(84668,(84578+1+Math.imul(1,6)-7));
      H.strcpy(84674,(84578+1+Math.imul(2,6)-7));
      H.strcpy(84668,(84578+1+Math.imul(3,6)-7));
    }
  }
  I[21170]=1;
  L2:for(;(I[21170]<=3);I[21170]=((I[21170]+1)|0)){
    I[21171]=((((I[($p1)>>2]+I[21170])|0)-2)|0);
    if(((I[21171]>=1)&&(I[21171]<=21))){
      I[21172]=1;
      L3:for(;(I[21172]<=5);I[21172]=((I[21172]+1)|0)){
        I[21173]=((((I[($p2)>>2]+I[21172])|0)-3)|0);
        if(((I[21173]>24)&&(I[21173]<=I[85]))){
          if((B[(84578+I[21172]+Math.imul(I[21170],6)-7)]!==32)){
            R_cdput((84578+I[21172]+Math.imul(I[21170],6)-7),84684,84692);
          }
        }
      }
    }
  }
  return;
}
/* CONQMISC.R: subroutine putship */
function R_putship($p0,$p1,$p2){
  F[21174]=Math.fround(2500.0);
  I[21175]=1;
  L1:for(;(I[21175]<=64);I[21175]=((I[21175]+1)|0)){
    if(($imod(I[21175],16)===0)){
      F[21174]=Math.fround(F[21174]*Math.fround(1.2));
    }
    F[((18884+(I[($p0)>>2]-1)*4))>>2]=R_rndnor($p1,84696);
    F[((18964+(I[($p0)>>2]-1)*4))>>2]=R_rndnor($p2,84696);
    I[21176]=1;
    L2:for(;(I[21176]<=20);I[21176]=((I[21176]+1)|0)){
      if((I[((18484+(I[21176]-1)*4))>>2]===3)){
        if((((((I[((21684+(I[21176]+Math.imul(I[((18724+(I[($p0)>>2]-1)*4))>>2],20)-21)*4))>>2]&1)!==0)||((I[((21684+(I[($p0)>>2]+Math.imul(I[((18724+(I[21176]-1)*4))>>2],20)-21)*4))>>2]&1)!==0))&&(I[21176]!==I[($p0)>>2]))&&(Math.fround(Math.sqrt(Math.fround(Math.fround(Math.pow(Math.fround(F[((18884+(I[21176]-1)*4))>>2]-F[((18884+(I[($p0)>>2]-1)*4))>>2]),Math.fround(2)))+Math.fround(Math.pow(Math.fround(F[((18964+(I[21176]-1)*4))>>2]-F[((18964+(I[($p0)>>2]-1)*4))>>2]),Math.fround(2))))))<=Math.fround(3000.0)))){
          continue L1;
        }
      }
    }
    return;
  }
  R_cerror((I[21177]=((-102)|0),84708),84712,$p0);
  return;
}
/* CONQMISC.R: subroutine readmsg */
function R_readmsg($p0,$p1){
  I[21189]=I[((39724+(I[($p1)>>2]-1)*4))>>2];
  if(((I[21189]>=1)&&(I[21189]<=20))){
    B[(84760+1-1)]=0;
    R_appship(84756,84760);
  }else{
    if(((((-I[21189])|0)>=1)&&(((-I[21189])|0)<=40))){
      H.strcpy((14860+1+Math.imul(((-I[21189])|0),12)-13),84760);
    }else{
      S1:switch(I[21189]){
        case -101:{
          H.strcpy(84850,84760);
          break S1;
        }
        case -102:{
          H.strcpy(81928,84760);
          break S1;
        }
        case -103:{
          H.concat(67852,16000,84760);
          break S1;
        }
        case -104:{
          B[(84760+1-1)]=0;
          break S1;
        }
        case -106:{
          H.strcpy(84857,84760);
          break S1;
        }
        default:{
          H.strcpy(84862,84760);
        }
      }
    }
  }
  H.appstr(84866,84760);
  I[21189]=I[((39964+(I[($p1)>>2]-1)*4))>>2];
  if((I[21189]===I[($p0)>>2])){
    H.appstr(84869,84760);
  }else{
    if(((I[21189]>=1)&&(I[21189]<=20))){
      R_appship(84756,84760);
    }else{
      if(((((-I[21189])|0)>=1)&&(((-I[21189])|0)<=4))){
        H.appchr((15784+((-I[21189])|0)-1),84760);
      }else{
        S2:switch(I[21189]){
          case -101:{
            H.appstr(84850,84760);
            break S2;
          }
          case -102:{
            H.appstr(81928,84760);
            break S2;
          }
          case -100:{
            H.appstr(84873,84760);
            break S2;
          }
          case -105:{
            H.appstr(84877,84760);
            break S2;
          }
          default:{
            H.appstr(84862,84760);
          }
        }
      }
    }
  }
  H.appstr(78712,84760);
  H.appstr((35524+1+Math.imul(I[($p1)>>2],70)-71),84760);
  R_putmsg(84760,(I[21221]=23,84884));
  R_cdclrl((I[21222]=24,84888),(I[21223]=1,84892));
  return;
}
/* CONQMISC.R: subroutine sendmsg */
function* R_sendmsg($p0,$p1){
  R_cdclrl((I[21254]=23,85016),(I[21255]=2,85020));
  B[85128]=(yield* R_cdgetx(84896,(I[21256]=23,85024),(I[21257]=1,85028),68048,85032,(I[21281]=90,85124)));
  if((B[85128]===27)){
    R_cdclrl((I[21283]=23,85132),(I[21284]=1,85136));
    return;
  }
  I[21285]=(((B[85128]===10)&&(B[(85032+1-1)]===0))?-1:0);
  if(((I[21285]&1)!==0)){
    if(((I[21235]>=1)&&(I[21235]<=20))){
      H.prints(85032,77553,84940);
    }else{
      if(((((-I[21235])|0)>=1)&&(((-I[21235])|0)<=4))){
        H.strcpy((15676+1+Math.imul(((-I[21235])|0),12)-13),85032);
      }else{
        S1:switch(I[21235]){
          case -100:{
            H.strcpy(85144,85032);
            break S1;
          }
          case -102:{
            H.strcpy(81928,85032);
            break S1;
          }
          case -105:{
            H.strcpy(85148,85032);
            break S1;
          }
          default:{
            B[(85032+1-1)]=0;
          }
        }
      }
    }
    if(((yield* R_cdgetp(84896,(I[21291]=23,85164),(I[21292]=1,85168),68048,85032,(I[21293]=90,85172)))===27)){
      R_cdclrl((I[21294]=23,85176),(I[21295]=1,85180));
      return;
    }
  }
  R_delblanks(85032);
  H.upper(85032);
  if((H.alldig(85032)===1)){
    I[21296]=1;
    I[21298]=(((R_safectoi(85188,85032,85184))?true:false)?-1:0);
    if(((I[21297]<1)||(I[21297]>20))){
      R_putmsg(71492,(I[21299]=24,85196));
      return;
    }
    if((I[((18484+(I[21297]-1)*4))>>2]!==3)){
      R_putmsg(84909,(I[21300]=24,85200));
      return;
    }
    I[21235]=I[21297];
  }else{
    S2:switch(B[(85032+1-1)]){
      case 65:{
        I[21235]=((-100)|0);
        break S2;
      }
      case 71:{
        I[21235]=((-102)|0);
        break S2;
      }
      case 73:{
        I[21235]=((-105)|0);
        break S2;
      }
      default:{
        I[21296]=1;
        L3:for(;(I[21296]<=4);I[21296]=((I[21296]+1)|0)){
          if((B[(85032+1-1)]===B[(15784+I[21296]-1)])){
            break L3;
          }
        }
        if((I[21296]>4)){
          R_putmsg(84920,(I[21301]=24,85204));
          return;
        }
        I[21235]=((-I[21296])|0);
      }
    }
  }
  H.strcpy(85208,85032);
  if(((I[21235]>=1)&&(I[21235]<=20))){
    if((I[((18484+(I[21235]-1)*4))>>2]!==3)){
      R_putmsg(84909,(I[21305]=24,85220));
      return;
    }
    R_appship(84940,85032);
    H.appchr((I[21306]=58,85224),85032);
  }else{
    if(((((-I[21235])|0)>=1)&&(((-I[21235])|0)<=4))){
      H.appstr((15676+1+Math.imul(((-I[21235])|0),12)-13),85032);
      H.appstr(85228,85032);
    }else{
      S4:switch(I[21235]){
        case -100:{
          H.appstr(85231,85032);
          break S4;
        }
        case -102:{
          H.appstr(85241,85032);
          break S4;
        }
        case -105:{
          H.appstr(85246,85032);
          break S4;
        }
        default:{
          R_putmsg(84920,(I[21316]=24,85264));
          return;
        }
      }
    }
  }
  if((!((I[($p1)>>2]&1)!==0))){
    H.appstr(85268,85032);
  }
  R_putmsg(85032,(I[21322]=23,85288));
  R_cdclrl((I[21323]=24,85292),(I[21324]=1,85296));
  if((!((I[21285]&1)!==0))){
    B[(84944+1-1)]=0;
  }
  if((I[21235]===((-105)|0))){
    I[21296]=90;
  }else{
    I[21296]=70;
  }
  if(((yield* R_cdgetp(85300,(I[21326]=24,85304),(I[21327]=1,85308),68048,84944,85184))!==27)){
    if((I[21235]!==((-105)|0))){
      R_stormsg($p0,84940,84944);
    }else{
      H.strcpy(85312,85032);
      if(((I[($p0)>>2]>=1)&&(I[($p0)>>2]<=20))){
        H.appstr((26804+1+Math.imul(I[($p0)>>2],24)-25),85032);
        H.appstr(85329,85032);
        R_appship($p0,85032);
      }else{
        if((I[($p0)>>2]===((-102)|0))){
          H.appstr(81928,85032);
        }else{
          H.appchr((I[21335]=40,85340),85032);
          R_appint($p0,85032);
          H.appchr((I[21336]=41,85344),85032);
        }
      }
      R_stormsg($p0,(I[21337]=((-105)|0),85348),84944);
      if((!((R_mailimps(85032,84944))?true:false))){
        R_stormsg((I[21338]=((-104)|0),85352),$p0,84944);
      }
    }
  }
  R_cdclrl((I[21339]=23,85356),(I[21340]=2,85360));
  return;
}
/* CONQMISC.R: subroutine sortplanets */
function R_sortplanets($p0){
  I[21341]=1;
  L1:for(;(I[21341]<=40);I[21341]=((I[21341]+1)|0)){
    I[((85368+(I[21341]-1)*4))>>2]=I[(($p0+(I[21341]-1)*4))>>2];
  }
  I[21382]=0;
  I[21341]=1;
  L2:for(;(I[21341]<=40);I[21341]=((I[21341]+1)|0)){
    I[21383]=1;
    L3:for(;(I[21383]<=I[21382]);I[21383]=((I[21383]+1)|0)){
      if((H.strcmp((14860+1+Math.imul(I[(($p0+(I[21383]-1)*4))>>2],12)-13),(14860+1+Math.imul(I[((85368+(I[21341]-1)*4))>>2],12)-13))>0)){
        I[21384]=I[21382];
        L4:for(;(I[21384]>=I[21383]);I[21384]=((I[21384]-1)|0)){
          I[(($p0+(((I[21384]+1)|0)-1)*4))>>2]=I[(($p0+(I[21384]-1)*4))>>2];
        }
        break L3;
      }
    }
    I[(($p0+(I[21383]-1)*4))>>2]=I[((85368+(I[21341]-1)*4))>>2];
    I[21382]=((I[21382]+1)|0);
  }
  return;
}
/* CONQMISC.R: function spwar */
function R_spwar($p0,$p1){
  if((!((I[((14700+(I[($p1)>>2]-1)*4))>>2]&1)!==0))){
    I[21385]=(false?-1:0);
    return ((I[21385]&1)!==0);
  }else{
    if((I[((14540+(I[($p1)>>2]-1)*4))>>2]===3)){
      I[21385]=(true?-1:0);
      return ((I[21385]&1)!==0);
    }
  }
  if((I[((14540+(I[($p1)>>2]-1)*4))>>2]===4)){
    I[21385]=(false?-1:0);
    return ((I[21385]&1)!==0);
  }else{
    if((I[((16664+(I[($p1)>>2]-1)*4))>>2]<=0)){
      I[21385]=(false?-1:0);
      return ((I[21385]&1)!==0);
    }else{
      S1:switch(I[((16504+(I[($p1)>>2]-1)*4))>>2]){
        case 1:case 2:case 3:case 4:{
          if((I[((16504+(I[($p1)>>2]-1)*4))>>2]===I[((18724+(I[($p0)>>2]-1)*4))>>2])){
            I[21385]=(false?-1:0);
            return ((I[21385]&1)!==0);
          }else{
            I[21385]=(((I[((21684+(I[($p0)>>2]+Math.imul(I[((16504+(I[($p1)>>2]-1)*4))>>2],20)-21)*4))>>2]&1)!==0)?-1:0);
            return ((I[21385]&1)!==0);
          }
          break S1;
        }
        default:{
          I[21385]=(((I[((22324+(I[($p0)>>2]+Math.imul(I[($p1)>>2],20)-21)*4))>>2]&1)!==0)?-1:0);
          return ((I[21385]&1)!==0);
        }
      }
    }
  }
  I[21385]=(true?-1:0);
  return ((I[21385]&1)!==0);
  return ((I[21385]&1)!==0);
}
/* CONQMISC.R: function stillalive */
function R_stillalive($p0){
  if(((I[((7692+(I[((18644+(I[($p0)>>2]-1)*4))>>2]+Math.imul(4,40)-41)*4))>>2]&1)!==0)){
    if((I[((18484+(I[($p0)>>2]-1)*4))>>2]===3)){
      R_kill($p0,(I[21387]=((-105)|0),85548));
    }
    I[21386]=(false?-1:0);
    return ((I[21386]&1)!==0);
  }
  if((((I[150]&1)!==0)&&(!((I[((7692+(I[((18644+(I[($p0)>>2]-1)*4))>>2]+Math.imul(1,40)-41)*4))>>2]&1)!==0)))){
    if((I[((18484+(I[($p0)>>2]-1)*4))>>2]===3)){
      R_kill($p0,(I[21388]=((-104)|0),85552));
    }
    I[21386]=(false?-1:0);
    return ((I[21386]&1)!==0);
  }
  if(((I[((18484+(I[($p0)>>2]-1)*4))>>2]===6)||(I[((18484+(I[($p0)>>2]-1)*4))>>2]===2))){
    I[21386]=(true?-1:0);
    return ((I[21386]&1)!==0);
  }
  I[21386]=((I[((18484+(I[($p0)>>2]-1)*4))>>2]===3)?-1:0);
  return ((I[21386]&1)!==0);
  return ((I[21386]&1)!==0);
}
/* CONQMISC.R: subroutine stormsg */
function R_stormsg($p0,$p1,$p2){
  H.pvlock(608);
  I[21391]=R_modp1((I[21389]=((I[10051]+1)|0),85556),(I[21390]=60,85560));
  R_stcpn($p2,(35524+1+Math.imul(I[21391],70)-71),(I[21392]=70,85568));
  I[((39724+(I[21391]-1)*4))>>2]=I[($p0)>>2];
  I[((39964+(I[21391]-1)*4))>>2]=I[($p1)>>2];
  I[10051]=I[21391];
  I[21393]=1;
  L1:for(;(I[21393]<=20);I[21393]=((I[21393]+1)|0)){
    if((I[21391]===I[((25684+(I[21393]-1)*4))>>2])){
      I[((25684+(I[21393]-1)*4))>>2]=((-2)|0);
    }
  }
  H.pvunlock(608);
  return;
}
/* CONQMISC.R: function usefuel */
function R_usefuel($p0,$p1,$p2){
  if((F[($p1)>>2]<=Math.fround(0.0))){
    I[21394]=(false?-1:0);
    return ((I[21394]&1)!==0);
  }
  if(((I[($p2)>>2]&1)!==0)){
    if((I[((20164+(I[($p0)>>2]-1)*4))>>2]>0)){
      I[21394]=(false?-1:0);
      return ((I[21394]&1)!==0);
    }
  }else{
    if((I[((20244+(I[($p0)>>2]-1)*4))>>2]>0)){
      F[((19444+(I[($p0)>>2]-1)*4))>>2]=Math.fround(0.0);
      I[21394]=(false?-1:0);
      return ((I[21394]&1)!==0);
    }
  }
  F[((19924+(I[($p0)>>2]-1)*4))>>2]=Math.fround(F[((19924+(I[($p0)>>2]-1)*4))>>2]-F[($p1)>>2]);
  if((F[((19924+(I[($p0)>>2]-1)*4))>>2]<Math.fround(0.0))){
    F[((19924+(I[($p0)>>2]-1)*4))>>2]=Math.fround(0.0);
    I[((20644+(I[($p0)>>2]-1)*4))>>2]=(false?-1:0);
    F[((19444+(I[($p0)>>2]-1)*4))>>2]=Math.fround(0.0);
    I[21394]=(false?-1:0);
    return ((I[21394]&1)!==0);
  }else{
    if((F[((19924+(I[($p0)>>2]-1)*4))>>2]>Math.fround(999.0))){
      F[((19924+(I[($p0)>>2]-1)*4))>>2]=Math.fround(999.0);
    }
  }
  if(((I[($p2)>>2]&1)!==0)){
    F[((20004+(I[($p0)>>2]-1)*4))>>2]=Math.fround(F[((20004+(I[($p0)>>2]-1)*4))>>2]+Math.fround(Math.fround(F[($p1)>>2]*Math.fround(0.25))/Math.fround(Math.fround(Math.fround(Math.fround(Math.fround(Math.fround(I[((20324+(I[($p0)>>2]-1)*4))>>2])+Math.fround(50.0))/Math.fround(100.0))*F[((15644+(I[((18724+(I[($p0)>>2]-1)*4))>>2]-1)*4))>>2])*Math.fround(F[((19764+(I[($p0)>>2]-1)*4))>>2]+Math.fround(50.0)))/Math.fround(50.0))));
    if((F[((20004+(I[($p0)>>2]-1)*4))>>2]<Math.fround(0.0))){
      F[((20004+(I[($p0)>>2]-1)*4))>>2]=Math.fround(0.0);
    }else{
      if((F[((20004+(I[($p0)>>2]-1)*4))>>2]>=Math.fround(100.0))){
        if((R_rnd((I[21395]=0,85580))<Math.fround(0.5))){
          I[((20164+(I[($p0)>>2]-1)*4))>>2]=R_rndint((I[21396]=9,85584),(I[21397]=36,85588));
          if((!((I[((20724+(I[($p0)>>2]+Math.imul(6,20)-21)*4))>>2]&1)!==0))){
            R_stormsg((I[21398]=((-106)|0),85592),$p0,85596);
          }
        }
      }
    }
  }else{
    F[((20084+(I[($p0)>>2]-1)*4))>>2]=Math.fround(F[((20084+(I[($p0)>>2]-1)*4))>>2]+Math.fround(Math.fround(F[($p1)>>2]*Math.fround(0.25))/Math.fround(Math.fround(Math.fround(Math.fround(Math.fround(Math.fround(I[((20404+(I[($p0)>>2]-1)*4))>>2])+Math.fround(50.0))/Math.fround(100.0))*F[((15612+(I[((18724+(I[($p0)>>2]-1)*4))>>2]-1)*4))>>2])*Math.fround(F[((19764+(I[($p0)>>2]-1)*4))>>2]+Math.fround(50.0)))/Math.fround(50.0))));
    if((F[((20084+(I[($p0)>>2]-1)*4))>>2]<Math.fround(0.0))){
      F[((20084+(I[($p0)>>2]-1)*4))>>2]=Math.fround(0.0);
    }else{
      if((F[((20084+(I[($p0)>>2]-1)*4))>>2]>=Math.fround(100.0))){
        if((R_rnd((I[21404]=0,85616))<Math.fround(0.5))){
          I[((20244+(I[($p0)>>2]-1)*4))>>2]=R_rndint((I[21405]=9,85620),(I[21406]=36,85624));
          if((!((I[((20724+(I[($p0)>>2]+Math.imul(6,20)-21)*4))>>2]&1)!==0))){
            R_stormsg((I[21407]=((-106)|0),85628),$p0,85632);
          }
        }
      }
    }
  }
  I[21394]=(true?-1:0);
  return ((I[21394]&1)!==0);
  return ((I[21394]&1)!==0);
}
/* CONQMISC.R: subroutine zeroeverything */
function R_zeroeverything(){
  R_cdfill((I[21414]=0,85656),596,(I[21415]=65536,85660));
  return;
}
/* CONQMISC.R: subroutine zeroship */
function R_zeroship($p0){
  I[((18484+(I[($p0)>>2]-1)*4))>>2]=1;
  I[((18564+(I[($p0)>>2]-1)*4))>>2]=0;
  I[((18644+(I[($p0)>>2]-1)*4))>>2]=0;
  I[((18724+(I[($p0)>>2]-1)*4))>>2]=0;
  I[((18804+(I[($p0)>>2]-1)*4))>>2]=0;
  F[((18884+(I[($p0)>>2]-1)*4))>>2]=Math.fround(0.0);
  F[((18964+(I[($p0)>>2]-1)*4))>>2]=Math.fround(0.0);
  F[((19044+(I[($p0)>>2]-1)*4))>>2]=Math.fround(0.0);
  F[((19124+(I[($p0)>>2]-1)*4))>>2]=Math.fround(0.0);
  F[((19204+(I[($p0)>>2]-1)*4))>>2]=Math.fround(0.0);
  F[((19284+(I[($p0)>>2]-1)*4))>>2]=Math.fround(0.0);
  F[((19364+(I[($p0)>>2]-1)*4))>>2]=Math.fround(0.0);
  F[((19444+(I[($p0)>>2]-1)*4))>>2]=Math.fround(0.0);
  I[((19524+(I[($p0)>>2]-1)*4))>>2]=0;
  I[((19604+(I[($p0)>>2]-1)*4))>>2]=(false?-1:0);
  F[((19684+(I[($p0)>>2]-1)*4))>>2]=Math.fround(0.0);
  F[((19764+(I[($p0)>>2]-1)*4))>>2]=Math.fround(0.0);
  F[((19844+(I[($p0)>>2]-1)*4))>>2]=Math.fround(0.0);
  F[((19924+(I[($p0)>>2]-1)*4))>>2]=Math.fround(0.0);
  F[((20084+(I[($p0)>>2]-1)*4))>>2]=Math.fround(0.0);
  F[((20004+(I[($p0)>>2]-1)*4))>>2]=Math.fround(0.0);
  I[((20164+(I[($p0)>>2]-1)*4))>>2]=0;
  I[((20244+(I[($p0)>>2]-1)*4))>>2]=0;
  I[((20324+(I[($p0)>>2]-1)*4))>>2]=0;
  I[((20404+(I[($p0)>>2]-1)*4))>>2]=0;
  I[((20484+(I[($p0)>>2]-1)*4))>>2]=0;
  I[((20564+(I[($p0)>>2]-1)*4))>>2]=(false?-1:0);
  I[((20644+(I[($p0)>>2]-1)*4))>>2]=(false?-1:0);
  I[21416]=1;
  L1:for(;(I[21416]<=12);I[21416]=((I[21416]+1)|0)){
    I[((20724+(I[($p0)>>2]+Math.imul(I[21416],20)-21)*4))>>2]=(false?-1:0);
  }
  I[21416]=1;
  L2:for(;(I[21416]<=4);I[21416]=((I[21416]+1)|0)){
    I[((22004+(I[($p0)>>2]+Math.imul(I[21416],20)-21)*4))>>2]=(false?-1:0);
    I[((21684+(I[($p0)>>2]+Math.imul(I[21416],20)-21)*4))>>2]=(false?-1:0);
    I[((26244+(I[($p0)>>2]+Math.imul(I[21416],20)-21)*4))>>2]=0;
  }
  I[21416]=1;
  L3:for(;(I[21416]<=40);I[21416]=((I[21416]+1)|0)){
    I[((22324+(I[($p0)>>2]+Math.imul(I[21416],20)-21)*4))>>2]=(false?-1:0);
  }
  I[((25524+(I[($p0)>>2]-1)*4))>>2]=0;
  I[((25604+(I[($p0)>>2]-1)*4))>>2]=0;
  I[((25684+(I[($p0)>>2]-1)*4))>>2]=0;
  I[((25764+(I[($p0)>>2]-1)*4))>>2]=(false?-1:0);
  I[((25844+(I[($p0)>>2]-1)*4))>>2]=0;
  I[((25924+(I[($p0)>>2]-1)*4))>>2]=0;
  F[((26004+(I[($p0)>>2]-1)*4))>>2]=Math.fround(0.0);
  F[((26084+(I[($p0)>>2]-1)*4))>>2]=Math.fround(0.0);
  I[((26164+(I[($p0)>>2]-1)*4))>>2]=0;
  I[((26564+(I[($p0)>>2]-1)*4))>>2]=(false?-1:0);
  I[((26644+(I[($p0)>>2]-1)*4))>>2]=(false?-1:0);
  I[((26724+(I[($p0)>>2]-1)*4))>>2]=0;
  I[21416]=1;
  L4:for(;(I[21416]<=24);I[21416]=((I[21416]+1)|0)){
    B[(26804+I[21416]+Math.imul(I[($p0)>>2],24)-25)]=0;
  }
  I[((27284+(I[($p0)>>2]-1)*4))>>2]=0;
  I[((27364+(I[($p0)>>2]-1)*4))>>2]=0;
  I[((27444+(I[($p0)>>2]-1)*4))>>2]=0;
  I[((27524+(I[($p0)>>2]-1)*4))>>2]=0;
  I[21416]=1;
  L5:for(;(I[21416]<=9);I[21416]=((I[21416]+1)|0)){
    I[((27604+(I[($p0)>>2]+Math.imul(I[21416],20)-21)*4))>>2]=1;
    I[((28324+(I[($p0)>>2]+Math.imul(I[21416],20)-21)*4))>>2]=0;
    F[((29044+(I[($p0)>>2]+Math.imul(I[21416],20)-21)*4))>>2]=Math.fround(0.0);
    F[((29764+(I[($p0)>>2]+Math.imul(I[21416],20)-21)*4))>>2]=Math.fround(0.0);
    F[((30484+(I[($p0)>>2]+Math.imul(I[21416],20)-21)*4))>>2]=Math.fround(0.0);
    F[((31204+(I[($p0)>>2]+Math.imul(I[21416],20)-21)*4))>>2]=Math.fround(0.0);
    F[((31924+(I[($p0)>>2]+Math.imul(I[21416],20)-21)*4))>>2]=Math.fround(0.0);
    I[21417]=1;
    L6:for(;(I[21417]<=4);I[21417]=((I[21417]+1)|0)){
      I[((32644+(I[($p0)>>2]+Math.imul(I[21416],20)+Math.imul(I[21417],180)-201)*4))>>2]=(false?-1:0);
    }
  }
  return;
}
/* CONQUTIL.R: function acdist */
function R_acdist($p0,$p1,$p2){
  F[21419]=Math.fround(Math.fround(F[($p0)>>2]-F[($p1)>>2])/F[($p2)>>2]);
  F[21418]=Math.fround(Math.fround(Math.fround(F[($p0)>>2]*F[21419])-Math.fround(Math.fround(Math.fround(Math.fround(0.5)*F[($p2)>>2])*F[21419])*F[21419]))*Math.fround(18.0));
  return F[21418];
  return F[21418];
}
/* CONQUTIL.R: function angle */
function R_angle($p0,$p1,$p2,$p3){
  if(((F[($p0)>>2]===F[($p2)>>2])&&(F[($p1)>>2]===F[($p3)>>2]))){
    F[21420]=Math.fround(0.0);
    return F[21420];
  }
  F[21420]=R_mod360((F[21421]=Math.fround(Math.fround(Math.fround(Math.atan2(Math.fround(F[($p3)>>2]-F[($p1)>>2]),Math.fround(F[($p2)>>2]-F[($p0)>>2])))/Math.fround(3.14159))*Math.fround(180.0)),85684));
  return F[21420];
  return F[21420];
}
/* CONQUTIL.R: subroutine appint */
function R_appint($p0,$p1){
  I[21428]=H.itoc($p0,85688,(I[21427]=20,85708));
  H.appstr(85688,$p1);
  return;
}
/* CONQUTIL.R: subroutine appnum */
function R_appnum($p0,$p1){
  I[21429]=I[($p0)>>2];
  if((I[21429]>=100)){
    H.appstr(85720,$p1);
    return;
  }
  if((I[21429]>=20)){
    I[21432]=$idiv(I[21429],10);
    S1:switch(I[21432]){
      case 2:{
        H.appstr(85732,$p1);
        break S1;
      }
      case 3:{
        H.appstr(85739,$p1);
        break S1;
      }
      case 4:{
        H.appstr(85746,$p1);
        break S1;
      }
      case 5:{
        H.appstr(85752,$p1);
        break S1;
      }
      case 6:{
        H.appstr(85758,$p1);
        break S1;
      }
      case 7:{
        H.appstr(85764,$p1);
        break S1;
      }
      case 8:{
        H.appstr(85772,$p1);
        break S1;
      }
      case 9:{
        H.appstr(85779,$p1);
        break S1;
      }
      default:{
        H.appstr(84862,$p1);
      }
    }
    I[21429]=((I[21429]-Math.imul(I[21432],10))|0);
    if((I[21429]===0)){
      return;
    }
    H.appchr((I[21447]=45,85788),$p1);
  }
  S2:switch(I[21429]){
    case 0:{
      H.appstr(85792,$p1);
      break S2;
    }
    case 1:{
      H.appstr(85797,$p1);
      break S2;
    }
    case 2:{
      H.appstr(85801,$p1);
      break S2;
    }
    case 3:{
      H.appstr(85805,$p1);
      break S2;
    }
    case 4:{
      H.appstr(85811,$p1);
      break S2;
    }
    case 5:{
      H.appstr(85816,$p1);
      break S2;
    }
    case 6:{
      H.appstr(85821,$p1);
      break S2;
    }
    case 7:{
      H.appstr(85825,$p1);
      break S2;
    }
    case 8:{
      H.appstr(85831,$p1);
      break S2;
    }
    case 9:{
      H.appstr(85837,$p1);
      break S2;
    }
    case 10:{
      H.appstr(85842,$p1);
      break S2;
    }
    case 11:{
      H.appstr(85846,$p1);
      break S2;
    }
    case 12:{
      H.appstr(85853,$p1);
      break S2;
    }
    case 13:{
      H.appstr(85860,$p1);
      break S2;
    }
    case 14:{
      H.appstr(85869,$p1);
      break S2;
    }
    case 15:{
      H.appstr(85878,$p1);
      break S2;
    }
    case 16:{
      H.appstr(85886,$p1);
      break S2;
    }
    case 17:{
      H.appstr(85894,$p1);
      break S2;
    }
    case 18:{
      H.appstr(85904,$p1);
      break S2;
    }
    case 19:{
      H.appstr(85913,$p1);
      break S2;
    }
  }
  return;
}
/* CONQUTIL.R: function appnumtim */
function R_appnumtim($p0,$p1){
  I[21482]=(true?-1:0);
  I[21483]=I[(($p0+(4-1)*4))>>2];
  if((I[21483]===0)){
    I[21483]=12;
  }else{
    if((I[21483]===12)){
      I[21482]=(false?-1:0);
    }else{
      if((I[21483]>12)){
        I[21483]=((I[21483]-12)|0);
        I[21482]=(false?-1:0);
      }
    }
  }
  S1:switch(H.wkday(($p0+(2-1)*4),($p0+(3-1)*4),($p0+(1-1)*4))){
    case 1:{
      H.appstr(85936,$p1);
      break S1;
    }
    case 2:{
      H.appstr(85943,$p1);
      break S1;
    }
    case 3:{
      H.appstr(85950,$p1);
      break S1;
    }
    case 4:{
      H.appstr(85958,$p1);
      break S1;
    }
    case 5:{
      H.appstr(85968,$p1);
      break S1;
    }
    case 6:{
      H.appstr(85977,$p1);
      break S1;
    }
    case 7:{
      H.appstr(85984,$p1);
      break S1;
    }
    default:{
      H.appstr(84862,$p1);
    }
  }
  H.appstr(66179,$p1);
  S2:switch(I[(($p0+(2-1)*4))>>2]){
    case 1:{
      H.appstr(85993,$p1);
      break S2;
    }
    case 2:{
      H.appstr(86001,$p1);
      break S2;
    }
    case 3:{
      H.appstr(86010,$p1);
      break S2;
    }
    case 4:{
      H.appstr(86016,$p1);
      break S2;
    }
    case 5:{
      H.appstr(86022,$p1);
      break S2;
    }
    case 6:{
      H.appstr(86026,$p1);
      break S2;
    }
    case 7:{
      H.appstr(86031,$p1);
      break S2;
    }
    case 8:{
      H.appstr(86036,$p1);
      break S2;
    }
    case 9:{
      H.appstr(86043,$p1);
      break S2;
    }
    case 10:{
      H.appstr(86053,$p1);
      break S2;
    }
    case 11:{
      H.appstr(86061,$p1);
      break S2;
    }
    case 12:{
      H.appstr(86070,$p1);
      break S2;
    }
    default:{
      H.appstr(84862,$p1);
    }
  }
  H.appchr((I[21520]=32,86080),$p1);
  R_appint(($p0+(3-1)*4),$p1);
  H.appstr(86084,$p1);
  R_appnum(85932,$p1);
  H.appchr((I[21523]=32,86092),$p1);
  if((I[(($p0+(5-1)*4))>>2]===0)){
    H.appstr(86096,$p1);
  }else{
    if((I[(($p0+(5-1)*4))>>2]<10)){
      H.appstr(86104,$p1);
    }
    R_appnum(($p0+(5-1)*4),$p1);
  }
  H.appchr((I[21527]=32,86108),$p1);
  if(((I[21482]&1)!==0)){
    H.appstr(86112,$p1);
  }else{
    H.appstr(86117,$p1);
  }
  H.appstr(86122,$p1);
  return I[21481];
  return I[21481];
}
/* CONQUTIL.R: subroutine appsstatus */
function R_appsstatus($p0,$p1){
  S1:switch(I[($p0)>>2]){
    case 1:{
      H.appstr(86132,$p1);
      break S1;
    }
    case 2:{
      H.appstr(86136,$p1);
      break S1;
    }
    case 3:{
      H.appstr(86145,$p1);
      break S1;
    }
    case 4:{
      H.appstr(86150,$p1);
      break S1;
    }
    case 5:{
      H.appstr(86156,$p1);
      break S1;
    }
    case 6:{
      H.appstr(86161,$p1);
      break S1;
    }
    default:{
      R_appint($p0,$p1);
    }
  }
  return;
}
/* CONQUTIL.R: subroutine apptitle */
function R_apptitle($p0,$p1){
  S1:switch(I[($p0)>>2]){
    case 1:{
      H.appstr(86170,$p1);
      break S1;
    }
    case 2:{
      H.appstr(86178,$p1);
      break S1;
    }
    case 4:{
      H.appstr(86188,$p1);
      break S1;
    }
    case 3:{
      H.appstr(86198,$p1);
      break S1;
    }
  }
  return;
}
/* CONQUTIL.R: function arrows */
function R_arrows($p0,$p1){
  if(((B[($p0+1-1)]===101)&&(B[($p0+2-1)]===97))){
    I[21555]=(false?-1:0);
    return ((I[21555]&1)!==0);
  }
  if(((B[($p0+1-1)]===100)&&(B[($p0+2-1)]===97))){
    I[21555]=(false?-1:0);
    return ((I[21555]&1)!==0);
  }
  F[($p1)>>2]=Math.fround(0.0);
  I[21556]=1;
  L1:for(;(B[($p0+I[21556]-1)]!==0);I[21556]=((I[21556]+1)|0)){
    I[21557]=H.index(86208,($p0+I[21556]-1));
    if((I[21557]===0)){
      I[21555]=(false?-1:0);
      return ((I[21555]&1)!==0);
    }
    F[21558]=Math.fround(Math.fround(((I[21557]-1)|0))*Math.fround(45.0));
    F[21559]=Math.fround(F[21558]-Math.fround(360.0));
    if((Math.abs(Math.fround(F[($p1)>>2]-F[21558]))<Math.abs(Math.fround(F[($p1)>>2]-F[21559])))){
      F[21560]=F[21558];
    }else{
      F[21560]=F[21559];
    }
    F[($p1)>>2]=Math.fround(Math.fround(Math.fround(F[($p1)>>2]*Math.fround(((I[21556]-1)|0)))+F[21560])/Math.fround(I[21556]));
  }
  F[($p1)>>2]=R_mod360($p1);
  I[21555]=(true?-1:0);
  return ((I[21555]&1)!==0);
  return ((I[21555]&1)!==0);
}
/* CONQUTIL.R: subroutine cerror */
function R_cerror($p0,$p1,$p2){
  H.prints(86244,$p1,$p2);
  R_stormsg((I[21584]=((-104)|0),86336),$p0,86244);
  return;
}
/* CONQUTIL.R: function confirm */
function* R_confirm($p0){
  R_cdclrl((I[21586]=24,86344),(I[21587]=1,86348));
  B[86472]=(yield* R_getcx(86352,(I[21592]=24,86368),(I[21593]=0,86372),68048,86376,(I[21617]=90,86468)));
  R_cdclrl((I[21619]=24,86476),(I[21620]=1,86480));
  if((B[86472]===27)){
    I[21585]=(false?-1:0);
    return ((I[21585]&1)!==0);
  }
  if(((B[(86376+1-1)]===121)||(B[(86376+1-1)]===89))){
    I[21585]=(true?-1:0);
    return ((I[21585]&1)!==0);
  }
  I[21585]=(false?-1:0);
  return ((I[21585]&1)!==0);
  return ((I[21585]&1)!==0);
}
/* CONQUTIL.R: subroutine delblanks */
function R_delblanks($p0){
  I[21621]=1;
  L1:for(;(B[($p0+I[21621]-1)]!==0);){
    if((B[($p0+I[21621]-1)]===32)){
      I[21622]=I[21621];
      L2:for(;(B[($p0+I[21622]-1)]!==0);I[21622]=((I[21622]+1)|0)){
        B[($p0+I[21622]-1)]=B[($p0+((I[21622]+1)|0)-1)];
      }
    }else{
      I[21621]=((I[21621]+1)|0);
    }
  }
  return;
}
/* CONQUTIL.R: function dgrand */
function R_dgrand($p0,$p1){
  I[21624]=I[($p0)>>2];
  R_grand(86500);
  I[($p1)>>2]=I[21625];
  if((I[21625]<I[21624])){
    I[21625]=((I[21625]+Math.imul(Math.imul(Math.imul(24,60),60),1000))|0);
  }
  I[21623]=((I[21625]-I[21624])|0);
  return I[21623];
  return I[21623];
}
/* CONQUTIL.R: function dsecs */
function R_dsecs($p0,$p1){
  I[21627]=I[($p0)>>2];
  R_gsecs(86512);
  I[($p1)>>2]=I[21628];
  if((I[21628]<I[21627])){
    I[21628]=((I[21628]+Math.imul(Math.imul(24,60),60))|0);
  }
  I[21626]=((I[21628]-I[21627])|0);
  return I[21626];
  return I[21626];
}
/* CONQUTIL.R: function explosion */
function R_explosion($p0,$p1){
  if((F[($p1)>>2]>Math.fround(1000.0))){
    F[21629]=Math.fround(0.0);
    return F[21629];
  }
  F[21629]=Math.fround(Math.fround(F[($p0)>>2]/Math.fround(Math.fround(Math.fround(Math.fround(Math.fround(28.0)-Math.fround(1.0))*Math.max(Math.fround(F[($p1)>>2]-Math.fround(50.0)),Math.fround(0.0)))/Math.fround(1000.0))+Math.fround(1.0)))-Math.fround(Math.fround(Math.fround(F[($p0)>>2]/Math.fround(28.0))*F[($p1)>>2])/Math.fround(1000.0)));
  return F[21629];
  return F[21629];
}
/* CONQUTIL.R: function fmtminutes */
function R_fmtminutes($p0,$p1){
  if((I[($p0)>>2]<0)){
    I[21631]=(true?-1:0);
    I[21632]=((-I[($p0)>>2])|0);
  }else{
    I[21631]=(false?-1:0);
    I[21632]=I[($p0)>>2];
  }
  I[21633]=$imod(I[21632],60);
  I[21632]=$idiv(I[21632],60);
  I[21634]=$imod(I[21632],24);
  I[21635]=$idiv(I[21632],24);
  if(((I[21631]&1)!==0)){
    if((I[21635]>0)){
      I[21635]=((-I[21635])|0);
    }else{
      if((I[21634]>0)){
        I[21634]=((-I[21634])|0);
      }else{
        I[21633]=((-I[21633])|0);
      }
    }
  }
  H.prints(86544,86576,86540,86536,86532);
  I[21632]=1;
  L1:for(;(((B[(86544+I[21632]-1)]===32)||(B[(86544+I[21632]-1)]===58))||(B[(86544+I[21632]-1)]===48));I[21632]=((I[21632]+1)|0)){
  }
  H.scopy(86544,86528,$p1,(I[21647]=1,86588));
  return I[21630];
  return I[21630];
}
/* CONQUTIL.R: function fmtseconds */
function R_fmtseconds($p0,$p1){
  if((I[($p0)>>2]<0)){
    I[21649]=(true?-1:0);
    I[21650]=((-I[($p0)>>2])|0);
  }else{
    I[21649]=(false?-1:0);
    I[21650]=I[($p0)>>2];
  }
  I[21651]=$imod(I[21650],60);
  I[21650]=$idiv(I[21650],60);
  I[21652]=$imod(I[21650],60);
  I[21650]=$idiv(I[21650],60);
  I[21653]=$imod(I[21650],24);
  I[21654]=$idiv(I[21650],24);
  if(((I[21649]&1)!==0)){
    if((I[21654]>0)){
      I[21654]=((-I[21654])|0);
    }else{
      if((I[21653]>0)){
        I[21653]=((-I[21653])|0);
      }else{
        if((I[21652]>0)){
          I[21652]=((-I[21652])|0);
        }else{
          I[21651]=((-I[21651])|0);
        }
      }
    }
  }
  H.prints(86620,86652,86616,86612,86608,86604);
  I[21650]=1;
  L1:for(;(((B[(86620+I[21650]-1)]===32)||(B[(86620+I[21650]-1)]===58))||(B[(86620+I[21650]-1)]===48));I[21650]=((I[21650]+1)|0)){
  }
  H.scopy(86620,86600,$p1,(I[21668]=1,86672));
  return I[21648];
  return I[21648];
}
/* CONQUTIL.R: function getamsg */
function R_getamsg($p0,$p1){
  L1:do{
    L2:while((I[($p1)>>2]!==I[10051])){
      I[($p1)>>2]=R_modp1((I[21670]=((I[($p1)>>2]+1)|0),86680),(I[21671]=60,86684));
      if(((R_canread($p0,$p1))?true:false)){
        I[21669]=(((I[($p0)>>2]!==I[((39724+(I[($p1)>>2]-1)*4))>>2])||(((-102)|0)!==I[((39964+(I[($p1)>>2]-1)*4))>>2]))?-1:0);
        return ((I[21669]&1)!==0);
      }
    }
  }while(!((!((R_grabmsg($p0))?true:false))));
  I[21669]=(false?-1:0);
  return ((I[21669]&1)!==0);
  return ((I[21669]&1)!==0);
}
/* CONQUTIL.R: function getcx */
function* R_getcx($p0,$p1,$p2,$p3,$p4,$p5){
  I[21673]=(($idiv(((I[85]-H.length($p0))|0),2)+I[($p2)>>2])|0);
  if((I[21673]<=0)){
    I[21673]=1;
  }
  B[86688]=(yield* R_cdgetx($p0,$p1,86692,$p3,$p4,$p5));
  return B[86688];
  return B[86688];
}
/* CONQUTIL.R: subroutine getdandt */
function R_getdandt($p0){
  H.getnow(86696);
  S1:switch(I[((86696+(2-1)*4))>>2]){
    case 1:{
      H.strcpy(86724,86728);
      break S1;
    }
    case 2:{
      H.strcpy(86733,86728);
      break S1;
    }
    case 3:{
      H.strcpy(86737,86728);
      break S1;
    }
    case 4:{
      H.strcpy(86741,86728);
      break S1;
    }
    case 5:{
      H.strcpy(86022,86728);
      break S1;
    }
    case 6:{
      H.strcpy(86745,86728);
      break S1;
    }
    case 7:{
      H.strcpy(86749,86728);
      break S1;
    }
    case 8:{
      H.strcpy(86753,86728);
      break S1;
    }
    case 9:{
      H.strcpy(86757,86728);
      break S1;
    }
    case 10:{
      H.strcpy(86761,86728);
      break S1;
    }
    case 11:{
      H.strcpy(86765,86728);
      break S1;
    }
    case 12:{
      H.strcpy(86769,86728);
      break S1;
    }
    default:{
      H.strcpy(84862,86728);
    }
  }
  H.prints($p0,86773,(86696+(4-1)*4),(86696+(5-1)*4),(86696+(6-1)*4),(86696+(3-1)*4),86728,(I[21700]=$imod(I[((86696+(1-1)*4))>>2],100),86800));
  return;
}
/* CONQUTIL.R: function gettarget */
function* R_gettarget($p0,$p1,$p2,$p3,$p4){
  R_cdclrl($p1,(I[21702]=1,86808));
  B[86908]=(yield* R_cdgetx($p0,$p1,$p2,68048,86812,(I[21726]=90,86904)));
  if((B[86908]===27)){
    I[21701]=(false?-1:0);
    return ((I[21701]&1)!==0);
  }
  R_delblanks(86812);
  H.fold(86812);
  if((B[(86812+1-1)]===0)){
    F[($p3)>>2]=F[($p4)>>2];
    I[21701]=(true?-1:0);
    return ((I[21701]&1)!==0);
  }
  if((H.alldig(86812)===1)){
    I[21728]=1;
    if((!((R_safectoi(86916,86812,86912))?true:false))){
      I[21701]=(false?-1:0);
      return ((I[21701]&1)!==0);
    }
    F[($p3)>>2]=R_mod360((F[21730]=Math.fround(I[21729]),86920));
    I[21701]=(true?-1:0);
    return ((I[21701]&1)!==0);
  }
  if(((R_arrows(86812,$p3))?true:false)){
    I[21701]=(true?-1:0);
    return ((I[21701]&1)!==0);
  }
  I[21701]=(false?-1:0);
  return ((I[21701]&1)!==0);
  return ((I[21701]&1)!==0);
}
/* CONQUTIL.R: function grabmsg */
function R_grabmsg($p0){
  if(((H.iogbroadcast(86928))?true:false)){
    R_iofmtstr(86928);
    R_stormsg((I[21765]=((-104)|0),87060),$p0,86928);
    I[21731]=(true?-1:0);
    return ((I[21731]&1)!==0);
  }
  I[21731]=(false?-1:0);
  return ((I[21731]&1)!==0);
  return ((I[21731]&1)!==0);
}
/* CONQUTIL.R: subroutine grand */
function R_grand($p0){
  H.getnow(87064);
  I[($p0)>>2]=((Math.imul(((Math.imul(((Math.imul(I[((87064+(4-1)*4))>>2],60)+I[((87064+(5-1)*4))>>2])|0),60)+I[((87064+(6-1)*4))>>2])|0),1000)+I[((87064+(7-1)*4))>>2])|0);
  return;
}
/* CONQUTIL.R: subroutine gsecs */
function R_gsecs($p0){
  H.getnow(87092);
  I[($p0)>>2]=((Math.imul(((Math.imul(I[((87092+(4-1)*4))>>2],60)+I[((87092+(5-1)*4))>>2])|0),60)+I[((87092+(6-1)*4))>>2])|0);
  return;
}
/* CONQUTIL.R: function mod360 */
function R_mod360($p0){
  F[21781]=F[($p0)>>2];
  L1:while((F[21781]<Math.fround(0.0))){
    F[21781]=Math.fround(F[21781]+Math.fround(360.0));
  }
  F[21780]=Math.fround(F[21781]%Math.fround(360.0));
  return F[21780];
  return F[21780];
}
/* CONQUTIL.R: function modp1 */
function R_modp1($p0,$p1){
  I[21783]=I[($p0)>>2];
  L1:while((I[21783]<1)){
    I[21783]=((I[21783]+I[($p1)>>2])|0);
  }
  I[21782]=(($imod(((I[21783]-1)|0),I[($p1)>>2])+1)|0);
  return I[21782];
  return I[21782];
}
/* CONQUTIL.R: function more */
function* R_more($p0){
  if((B[($p0+1-1)]!==0)){
    R_putpmt($p0,(I[21793]=24,87172));
  }else{
    R_putpmt(87136,(I[21794]=24,87176));
  }
  R_cdplay((I[21795]=(true?-1:0),87180));
  B[87184]=(yield* H.iogchar(87184));
  I[21792]=((B[87184]===32)?-1:0);
  return ((I[21792]&1)!==0);
  return ((I[21792]&1)!==0);
}
/* CONQUTIL.R: subroutine pagefile */
function* R_pagefile($p0,$p1,$p2,$p3){
  I[21805]=H.open($p0,(I[21804]=1,87216));
  if((I[21805]===((-3)|0))){
    R_cdclear();
    R_cdredo();
    R_cdputc($p1,(I[21806]=$idiv(24,2),87224));
    I[21807]=((((yield* R_more(87185)))?true:false)?-1:0);
    return;
  }
  B[87236]=R_cdnulfont((I[21808]=0,87232));
  B[87244]=R_cdsngfont((I[21810]=3,87240));
  B[87252]=R_cdsngfont((I[21812]=2,87248));
  if((B[87252]===B[87236])){
    B[87252]=B[87244];
  }
  I[21814]=(true?-1:0);
  L1:for(;;){
    R_cdclear();
    I[21815]=0;
    L2:do{
      I[21850]=H.getlin(87268,87220);
      if((I[21850]===((-1)|0))){
        break L2;
      }
      I[21851]=H.length(87268);
      if((I[21851]>0)){
        if((B[(87268+I[21851]-1)]===10)){
          B[(87268+I[21851]-1)]=0;
        }
      }
      if(((I[($p3)>>2]&1)!==0)){
        if((B[(87268+1-1)]===0)){
          if(((I[21814]&1)!==0)){
            continue L2;
          }else{
            I[21814]=(true?-1:0);
          }
        }else{
          I[21814]=(false?-1:0);
        }
      }
      I[21815]=((I[21815]+1)|0);
      I[21852]=1;
      L3:for(;(I[21852]<90);I[21852]=((I[21852]+1)|0)){
        B[(87412+I[21852]-1)]=B[87236];
      }
      B[87502]=32;
      I[21816]=((-1)|0);
      I[21851]=1;
      I[21852]=1;
      L4:while((I[21852]<90)){
        S5:switch(B[(87268+I[21851]-1)]){
          case 0:{
            break L4;
            break S5;
          }
          case 8:{
            if((I[21852]>1)){
              I[21852]=((I[21852]-1)|0);
            }
            if((B[87502]===95)){
              B[(87412+I[21852]-1)]=B[87252];
            }else{
              if((H.type(87502)===1)){
                B[(87412+I[21852]-1)]=B[87244];
              }
            }
            B[87502]=B[(87268+I[21851]-1)];
            I[21851]=((I[21851]+1)|0);
            break S5;
          }
          case 12:{
            I[21851]=((I[21851]+1)|0);
            B[87502]=32;
            if((!((I[($p2)>>2]&1)!==0))){
              I[21816]=H.ctoi(87268,87404);
              break L4;
            }
            break S5;
          }
          case 9:{
            I[21876]=((Math.imul((($idiv(((I[21852]-1)|0),8)+1)|0),8)+1)|0);
            L6:for(;(I[21852]<=I[21876]);I[21852]=((I[21852]+1)|0)){
              B[(87508+I[21852]-1)]=32;
            }
            B[87502]=B[(87268+I[21851]-1)];
            I[21851]=((I[21851]+1)|0);
            break S5;
          }
          default:{
            if(((B[(87268+I[21851]-1)]>=32)&&(B[(87268+I[21851]-1)]<=126))){
              B[87502]=B[(87268+I[21851]-1)];
              B[(87508+I[21852]-1)]=B[(87268+I[21851]-1)];
              I[21852]=((I[21852]+1)|0);
            }else{
              B[87502]=32;
            }
            I[21851]=((I[21851]+1)|0);
          }
        }
      }
      B[(87508+I[21852]-1)]=0;
      B[87598]=B[87236];
      R_cdfont(87598);
      I[21852]=1;
      L7:for(;(B[(87508+I[21852]-1)]!==0);I[21852]=((I[21852]+1)|0)){
        if((B[87598]!==B[(87412+I[21852]-1)])){
          B[87598]=B[(87412+I[21852]-1)];
          R_cdfont(87598);
          R_cdput((87508+I[21852]-1),87260,87408);
        }else{
          if((B[(87508+I[21852]-1)]!==32)){
            R_cdput((87508+I[21852]-1),87260,87408);
          }
        }
      }
      R_cdfont(87236);
    }while(!(((I[21815]>=((24-1)|0))||(I[21816]>=0))));
    if((I[21850]===((-1)|0))){
      I[21807]=((((yield* R_more(87185)))?true:false)?-1:0);
      break L1;
    }
    if((I[21816]>0)){
      R_cdplay((I[21900]=(true?-1:0),87600));
      if((!((H.iochav((I[21901]=0,87604)))?true:false))){
        (yield* H.sleep((F[21902]=Math.fround(Math.fround(I[21816])/Math.fround(100.0)),87608)));
      }
    }else{
      if((!(((yield* R_more(73672)))?true:false))){
        break L1;
      }
    }
  }
  R_cdfont(87236);
  return;
}
/* CONQUTIL.R: subroutine putmsg */
function R_putmsg($p0,$p1){
  R_cdclrl($p1,(I[21903]=1,87612));
  R_cdputs($p0,$p1,(I[21904]=1,87616));
  return;
}
/* CONQUTIL.R: subroutine putpmt */
function R_putpmt($p0,$p1){
  I[21905]=H.length($p0);
  I[21906]=$idiv(((I[85]-I[21905])|0),2);
  I[21907]=((I[21906]+I[21905])|0);
  R_cdclrl($p1,(I[21908]=1,87632));
  R_cdputs($p0,$p1,87624);
  R_cdmove($p1,87628);
  return;
}
/* CONQUTIL.R: function safectoi */
function R_safectoi($p0,$p1,$p2){
  I[21910]=((((H.length($p1)-I[($p2)>>2])|0)-1)|0);
  if((I[21910]>=10)){
    I[($p0)>>2]=2147483647;
    I[21909]=(false?-1:0);
    return ((I[21909]&1)!==0);
  }
  I[($p0)>>2]=H.ctoi($p1,$p2);
  I[21909]=(true?-1:0);
  return ((I[21909]&1)!==0);
  return ((I[21909]&1)!==0);
}
/* CONQUTIL.R: function special */
function R_special($p0,$p1,$p2,$p3){
  I[($p1)>>2]=5;
  I[($p2)>>2]=1;
  I[($p3)>>2]=0;
  if((((B[($p0+1-1)]!==110)&&(B[($p0+1-1)]!==119))&&(B[($p0+1-1)]!==104))){
    I[21911]=(false?-1:0);
    return ((I[21911]&1)!==0);
  }
  R_stcpn($p0,87648,(I[21917]=20,87668));
  I[21918]=1;
  L1:for(;((B[(87648+I[21918]-1)]!==0)&&(H.type((87648+I[21918]-1))!==2));I[21918]=((I[21918]+1)|0)){
  }
  B[(87648+I[21918]-1)]=0;
  I[21919]=(((R_safectoi($p3,$p0,87672))?true:false)?-1:0);
  if(((R_stmatch(87648,87680,(I[21921]=(false?-1:0),87684)))?true:false)){
    I[($p1)>>2]=1;
    I[($p2)>>2]=2;
  }else{
    if(((R_stmatch(87648,87688,(I[21923]=(false?-1:0),87692)))?true:false)){
      I[($p1)>>2]=2;
      I[($p2)>>2]=3;
    }else{
      if(((R_stmatch(87648,87696,(I[21925]=(false?-1:0),87700)))?true:false)){
        I[($p1)>>2]=2;
        I[($p2)>>2]=4;
      }else{
        if(((R_stmatch(87648,87704,(I[21927]=(false?-1:0),87708)))?true:false)){
          I[($p1)>>2]=1;
          I[($p2)>>2]=5;
        }else{
          if(((R_stmatch(87648,87712,(I[21929]=(false?-1:0),87716)))?true:false)){
            I[($p1)>>2]=2;
            I[($p2)>>2]=6;
          }else{
            if(((R_stmatch(87648,87720,(I[21931]=(false?-1:0),87724)))?true:false)){
              I[($p1)>>2]=1;
              I[($p2)>>2]=7;
            }else{
              if(((R_stmatch(87648,87728,(I[21933]=(false?-1:0),87732)))?true:false)){
                I[($p1)>>2]=2;
                I[($p2)>>2]=8;
                if((I[($p3)>>2]<=0)){
                  I[($p3)>>2]=1;
                }
              }else{
                if(((R_stmatch(87648,87736,(I[21935]=(false?-1:0),87740)))?true:false)){
                  I[($p1)>>2]=2;
                  I[($p2)>>2]=9;
                }else{
                  if(((R_stmatch(87648,87744,(I[21937]=(false?-1:0),87748)))?true:false)){
                    I[($p1)>>2]=2;
                    I[($p2)>>2]=10;
                  }else{
                    if(((R_stmatch(87648,87752,(I[21939]=(false?-1:0),87756)))?true:false)){
                      I[($p1)>>2]=2;
                      I[($p2)>>2]=11;
                    }else{
                      if(((R_stmatch(87648,87760,(I[21941]=(false?-1:0),87764)))?true:false)){
                        I[($p1)>>2]=2;
                        I[($p2)>>2]=12;
                      }else{
                        I[21911]=(false?-1:0);
                        return ((I[21911]&1)!==0);
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  I[21911]=(true?-1:0);
  return ((I[21911]&1)!==0);
  return ((I[21911]&1)!==0);
}
/* CONQUTIL.R: subroutine stcpn */
function R_stcpn($p0,$p1,$p2){
  I[21942]=0;
  L1:do{
    I[21942]=((I[21942]+1)|0);
    if((I[21942]>=I[($p2)>>2])){
      break L1;
    }
    B[($p1+I[21942]-1)]=B[($p0+I[21942]-1)];
  }while(!((B[($p0+I[21942]-1)]===0)));
  B[($p1+I[($p2)>>2]-1)]=0;
  return;
}
/* CONQUTIL.R: function stmatch */
function R_stmatch($p0,$p1,$p2){
  if(((I[($p2)>>2]&1)!==0)){
    I[21944]=1;
    L1:for(;((B[($p0+I[21944]-1)]===B[($p1+I[21944]-1)])&&(B[($p0+I[21944]-1)]!==0));I[21944]=((I[21944]+1)|0)){
    }
  }else{
    I[21944]=1;
    L2:for(;((H.clower(($p0+I[21944]-1))===H.clower(($p1+I[21944]-1)))&&(B[($p0+I[21944]-1)]!==0));I[21944]=((I[21944]+1)|0)){
    }
  }
  if((I[21944]===1)){
    if(((B[($p0+1-1)]===0)&&(B[($p1+1-1)]===0))){
      I[21943]=(true?-1:0);
      return ((I[21943]&1)!==0);
    }else{
      I[21943]=(false?-1:0);
      return ((I[21943]&1)!==0);
    }
  }else{
    if(((B[($p0+I[21944]-1)]===0)||(B[($p1+I[21944]-1)]===0))){
      I[21943]=(true?-1:0);
      return ((I[21943]&1)!==0);
    }
  }
  I[21943]=(false?-1:0);
  return ((I[21943]&1)!==0);
  return ((I[21943]&1)!==0);
}
/* CONQUTIL.R: function subang */
function R_subang($p0,$p1){
  F[21946]=Math.fround(F[($p0)>>2]-F[($p1)>>2]);
  L1:while((F[21946]>Math.fround(180.0))){
    F[21946]=Math.fround(F[21946]-Math.fround(360.0));
  }
  L2:while((F[21946]<(-Math.fround(180.0)))){
    F[21946]=Math.fround(F[21946]+Math.fround(360.0));
  }
  F[21945]=F[21946];
  return F[21945];
  return F[21945];
}
/* CONQAI.R: subroutine buildai */
function R_buildai($p0,$p1,$p2,$p3,$p4){
  I[21947]=1;
  L1:for(;(I[21947]<=20);I[21947]=((I[21947]+1)|0)){
    I[(($p1+(I[21947]-1)*4))>>2]=0;
  }
  I[(($p1+(14-1)*4))>>2]=R_rndint((I[21948]=0,87792),(I[21949]=9,87796));
  F[($p4)>>2]=Math.fround(0.0);
  F[($p3)>>2]=Math.fround(1000000000.0);
  if(((R_findspecial($p0,(I[21950]=2,87800),(I[21951]=0,87804),$p2,87808))?true:false)){
    if(((I[((20644+(I[($p2)>>2]-1)*4))>>2]&1)!==0)){
      F[21954]=R_rndnor((18884+(I[($p2)>>2]-1)*4),(F[21953]=Math.fround(500.0),87812));
      F[21956]=R_rndnor((18964+(I[($p2)>>2]-1)*4),(F[21955]=Math.fround(500.0),87820));
    }else{
      F[21954]=F[((18884+(I[($p2)>>2]-1)*4))>>2];
      F[21956]=F[((18964+(I[($p2)>>2]-1)*4))>>2];
    }
    F[($p3)>>2]=Math.fround(Math.sqrt(Math.fround(Math.fround(Math.pow(Math.fround(F[21954]-F[((18884+(I[($p0)>>2]-1)*4))>>2]),Math.fround(2)))+Math.fround(Math.pow(Math.fround(F[21956]-F[((18964+(I[($p0)>>2]-1)*4))>>2]),Math.fround(2))))));
    F[($p4)>>2]=R_angle((18884+(I[($p0)>>2]-1)*4),(18964+(I[($p0)>>2]-1)*4),87816,87824);
    if((F[($p3)>>2]<Math.fround(3000.0))){
      if(((((I[((20644+(I[($p2)>>2]-1)*4))>>2]&1)!==0)?-1:0)<0)){
        I[(($p1+(16-1)*4))>>2]=1;
      }else{
        I[(($p1+(16-1)*4))>>2]=0;
      }
      I[(($p1+(17-1)*4))>>2]=Math.min(Math.max($nint(Math.fround(F[((19844+(I[($p2)>>2]-1)*4))>>2]/Math.fround(10.0))),0),9);
    }
  }
  F[21957]=Math.min(F[($p3)>>2],Math.fround(10000.0));
  I[(($p1+(15-1)*4))>>2]=Math.min(Math.max($fix(Math.fround(Math.fround(0.99026)+Math.fround(F[21957]*Math.fround(Math.fround(0.00158428)+Math.fround(F[21957]*(-Math.fround(5.92572e-08))))))),0),9);
  I[(($p1+(4-1)*4))>>2]=Math.min(Math.max($nint(Math.fround(F[((19844+(I[($p0)>>2]-1)*4))>>2]/Math.fround(10.0))),0),9);
  if(((I[((26564+(I[($p0)>>2]-1)*4))>>2]&1)!==0)){
    F[21958]=Math.fround(0.0);
    I[21947]=1;
    L2:for(;(I[21947]<=20);I[21947]=((I[21947]+1)|0)){
      if(((I[((18484+(I[21947]-1)*4))>>2]!==1)&&(I[21947]!==I[($p0)>>2]))){
        I[21959]=1;
        L3:for(;(I[21959]<=9);I[21959]=((I[21959]+1)|0)){
          if((I[((27604+(I[21947]+Math.imul(I[21959],20)-21)*4))>>2]===3)){
            if((((I[((32644+(I[21947]+Math.imul(I[21959],20)+Math.imul(I[((18724+(I[($p0)>>2]-1)*4))>>2],180)-201)*4))>>2]&1)!==0)||((I[((21684+(I[($p0)>>2]+Math.imul(I[((18724+(I[21947]-1)*4))>>2],20)-21)*4))>>2]&1)!==0))){
              F[21958]=Math.fround(F[21958]+R_explosion((F[21960]=Math.fround(Math.fround(Math.fround(72.0)*Math.fround(1.1))*F[((15644+(I[((18724+(I[21947]-1)*4))>>2]-1)*4))>>2]),87840),(F[21961]=Math.fround(Math.sqrt(Math.fround(Math.fround(Math.pow(Math.fround(F[((29044+(I[21947]+Math.imul(I[21959],20)-21)*4))>>2]-F[((18884+(I[($p0)>>2]-1)*4))>>2]),Math.fround(2)))+Math.fround(Math.pow(Math.fround(F[((29764+(I[21947]+Math.imul(I[21959],20)-21)*4))>>2]-F[((18964+(I[($p0)>>2]-1)*4))>>2]),Math.fround(2)))))),87844)));
            }
          }
        }
      }
    }
    I[(($p1+(20-1)*4))>>2]=Math.min(Math.max($nint(Math.fround(F[21958]/Math.fround(10.0))),0),9);
  }
  I[(($p1+(1-1)*4))>>2]=Math.min(Math.max($nint(Math.fround(F[((19924+(I[($p0)>>2]-1)*4))>>2]/Math.fround(10.0))),0),9);
  I[21959]=0;
  I[21947]=1;
  L4:for(;(I[21947]<=9);I[21947]=((I[21947]+1)|0)){
    if((I[((27604+(I[($p0)>>2]+Math.imul(I[21947],20)-21)*4))>>2]===1)){
      I[21959]=((I[21959]+1)|0);
    }
  }
  I[(($p1+(3-1)*4))>>2]=Math.min(Math.max($nint(Math.fround(Math.fround(I[21959])/Math.fround(1.0))),0),9);
  I[(($p1+(2-1)*4))>>2]=Math.min(Math.max($nint(Math.fround(F[((19684+(I[($p0)>>2]-1)*4))>>2]/Math.fround(10.0))),0),9);
  I[(($p1+(5-1)*4))>>2]=Math.min(Math.max($nint(Math.fround(F[((20084+(I[($p0)>>2]-1)*4))>>2]/Math.fround(10.0))),0),9);
  I[(($p1+(6-1)*4))>>2]=Math.min(Math.max($nint(Math.fround(F[((20004+(I[($p0)>>2]-1)*4))>>2]/Math.fround(10.0))),0),9);
  I[(($p1+(18-1)*4))>>2]=Math.min(Math.max($nint(Math.fround(R_phaserhit($p0,$p3)/Math.fround(5.0))),0),9);
  I[(($p1+(19-1)*4))>>2]=Math.min(Math.max($nint(Math.fround(R_explosion((F[21962]=Math.fround(Math.fround(72.0)*Math.fround(Math.fround(Math.fround(Math.fround(Math.fround(Math.fround(I[((20324+(I[($p0)>>2]-1)*4))>>2])+Math.fround(50.0))/Math.fround(100.0))*F[((15644+(I[((18724+(I[($p0)>>2]-1)*4))>>2]-1)*4))>>2])*Math.fround(F[((19764+(I[($p0)>>2]-1)*4))>>2]+Math.fround(50.0)))/Math.fround(50.0))),87848),(F[21963]=Math.fround(F[($p3)>>2]*Math.fround(0.66)),87852))/Math.fround(5.0))),0),9);
  I[(($p1+(7-1)*4))>>2]=Math.min(Math.max($nint(Math.fround(F[((19444+(I[($p0)>>2]-1)*4))>>2]/Math.fround(1.0))),0),9);
  if(((I[((19604+(I[($p0)>>2]-1)*4))>>2]&1)!==0)){
    I[(($p1+(8-1)*4))>>2]=1;
  }else{
    I[(($p1+(8-1)*4))>>2]=0;
  }
  if(((I[((20564+(I[($p0)>>2]-1)*4))>>2]&1)!==0)){
    I[(($p1+(11-1)*4))>>2]=1;
  }else{
    I[(($p1+(11-1)*4))>>2]=0;
  }
  if(((I[((20644+(I[($p0)>>2]-1)*4))>>2]&1)!==0)){
    I[(($p1+(12-1)*4))>>2]=1;
  }else{
    I[(($p1+(12-1)*4))>>2]=0;
  }
  if((I[((20324+(I[($p0)>>2]-1)*4))>>2]>50)){
    I[(($p1+(9-1)*4))>>2]=1;
  }else{
    I[(($p1+(9-1)*4))>>2]=0;
  }
  if((F[((19364+(I[($p0)>>2]-1)*4))>>2]<Math.fround(0.0))){
    I[(($p1+(10-1)*4))>>2]=1;
  }else{
    I[(($p1+(10-1)*4))>>2]=0;
  }
  if((I[((25604+(I[($p0)>>2]-1)*4))>>2]!==I[10051])){
    I[(($p1+(13-1)*4))>>2]=1;
  }else{
    I[(($p1+(13-1)*4))>>2]=0;
  }
  return;
}
/* CONQAI.R: subroutine defend */
function R_defend($p0,$p1){
  I[21964]=I[((16504+(I[($p1)>>2]-1)*4))>>2];
  if(((I[21964]<1)||(I[21964]>4))){
    return;
  }
  if((((I[($p1)>>2]!==I[((15532+(I[21964]+Math.imul(1,4)-5)*4))>>2])&&(I[($p1)>>2]!==I[((15532+(I[21964]+Math.imul(2,4)-5)*4))>>2]))&&(I[($p1)>>2]!==I[((15532+(I[21964]+Math.imul(3,4)-5)*4))>>2]))){
    return;
  }
  I[21965]=1;
  L1:for(;(I[21965]<=20);I[21965]=((I[21965]+1)|0)){
    if((I[((18484+(I[21965]-1)*4))>>2]===3)){
      if((I[((18724+(I[21965]-1)*4))>>2]===I[21964])){
        return;
      }
    }
  }
  I[21966]=0;
  I[21965]=1;
  L2:for(;(I[21965]<=40);I[21965]=((I[21965]+1)|0)){
    if(((I[((1132+(I[21965]-1)*4))>>2]&1)!==0)){
      if(((((I[((4972+(I[21965]-1)*4))>>2]&1)!==0)&&(I[((1292+(I[21965]-1)*4))>>2]===I[21964]))&&(!((I[((7692+(I[21967]+Math.imul(4,40)-41)*4))>>2]&1)!==0)))){
        I[21966]=((I[21966]+1)|0);
      }
    }
  }
  if((I[21966]<=0)){
    return;
  }
  I[21969]=R_rndint((I[21968]=1,87872),87864);
  I[21967]=0;
  I[21966]=0;
  I[21965]=1;
  L3:for(;(I[21965]<=40);I[21965]=((I[21965]+1)|0)){
    if(((I[((1132+(I[21965]-1)*4))>>2]&1)!==0)){
      if(((((I[((4972+(I[21965]-1)*4))>>2]&1)!==0)&&(I[((1292+(I[21965]-1)*4))>>2]===I[21964]))&&(!((I[((7692+(I[21967]+Math.imul(4,40)-41)*4))>>2]&1)!==0)))){
        I[21966]=((I[21966]+1)|0);
        if((I[21966]===I[21969])){
          I[21967]=I[21965];
          break L3;
        }
      }
    }
  }
  if((I[21967]===0)){
    return;
  }
  if(((R_newrob(87880,87868))?true:false)){
    H.prints(87884,87974,(15676+1+Math.imul(I[21964],12)-13));
    R_stormsg(87880,$p0,87884);
  }
  return;
}
/* CONQAI.R: subroutine displayai */
function R_displayai($p0,$p1,$p2){
  H.printf(88027,$p0);
  I[22011]=1;
  L1:for(;(I[22011]<=20);I[22011]=((I[22011]+1)|0)){
    H.printf(77553,($p2+(I[22011]-1)*4));
  }
  R_robstr($p1,88048);
  H.printf(88180,88048);
  return;
}
/* CONQAI.R: subroutine executeai */
function R_executeai($p0,$p1){
  I[((26724+(I[($p0)>>2]-1)*4))>>2]=I[($p1)>>2];
  S1:switch(I[($p1)>>2]){
    case 1:{
      break S1;
    }
    case 2:{
      if(((R_findspecial($p0,(I[22051]=12,88204),(I[22052]=0,88208),88212,88216))?true:false)){
        if((I[((19524+(I[($p0)>>2]-1)*4))>>2]!==((-I[22053])|0))){
          if((F[((19364+(I[($p0)>>2]-1)*4))>>2]<Math.fround(0.0))){
            F[((19364+(I[($p0)>>2]-1)*4))>>2]=Math.fround(0.0);
          }
          I[((19524+(I[($p0)>>2]-1)*4))>>2]=((-I[22053])|0);
        }
      }else{
        if(((R_findspecial($p0,(I[22055]=3,88220),(I[22056]=0,88224),88212,88216))?true:false)){
          if((I[((19524+(I[($p0)>>2]-1)*4))>>2]!==((-I[22053])|0))){
            if((F[((19364+(I[($p0)>>2]-1)*4))>>2]<Math.fround(0.0))){
              F[((19364+(I[($p0)>>2]-1)*4))>>2]=Math.fround(0.0);
            }
            I[((19524+(I[($p0)>>2]-1)*4))>>2]=((-I[22053])|0);
          }
        }
      }
      break S1;
    }
    case 23:{
      if(((R_findspecial($p0,(I[22057]=3,88228),(I[22058]=0,88232),88212,88216))?true:false)){
        if((I[((19524+(I[($p0)>>2]-1)*4))>>2]!==((-I[22053])|0))){
          if((F[((19364+(I[($p0)>>2]-1)*4))>>2]<Math.fround(0.0))){
            F[((19364+(I[($p0)>>2]-1)*4))>>2]=Math.fround(0.0);
          }
          I[((19524+(I[($p0)>>2]-1)*4))>>2]=((-I[22053])|0);
        }
      }
      break S1;
    }
    case 3:{
      if(((R_findspecial($p0,(I[22059]=11,88236),(I[22060]=0,88240),88212,88216))?true:false)){
        if((I[((19524+(I[($p0)>>2]-1)*4))>>2]!==((-I[22053])|0))){
          if((F[((19364+(I[($p0)>>2]-1)*4))>>2]<Math.fround(0.0))){
            F[((19364+(I[($p0)>>2]-1)*4))>>2]=Math.fround(0.0);
          }
          I[((19524+(I[($p0)>>2]-1)*4))>>2]=((-I[22053])|0);
        }
      }
      break S1;
    }
    case 4:{
      I[22053]=I[((20324+(I[($p0)>>2]-1)*4))>>2];
      I[((20324+(I[($p0)>>2]-1)*4))>>2]=I[((20404+(I[($p0)>>2]-1)*4))>>2];
      I[((20404+(I[($p0)>>2]-1)*4))>>2]=I[22053];
      break S1;
    }
    case 7:{
      I[22061]=(((R_phaser($p0,88200))?true:false)?-1:0);
      break S1;
    }
    case 8:{
      I[22061]=(((R_launch($p0,88200))?true:false)?-1:0);
      break S1;
    }
    case 9:{
      I[22061]=(((R_launch($p0,88200))?true:false)?-1:0);
      I[22061]=(((R_launch($p0,88200))?true:false)?-1:0);
      I[22061]=(((R_launch($p0,88200))?true:false)?-1:0);
      break S1;
    }
    case 10:{
      I[((19604+(I[($p0)>>2]-1)*4))>>2]=((!((I[((19604+(I[($p0)>>2]-1)*4))>>2]&1)!==0))?-1:0);
      break S1;
    }
    case 12:{
      if((F[((19364+(I[($p0)>>2]-1)*4))>>2]<Math.fround(0.0))){
        F[((19364+(I[($p0)>>2]-1)*4))>>2]=Math.fround(0.0);
        I[((19524+(I[($p0)>>2]-1)*4))>>2]=0;
        F[((19284+(I[($p0)>>2]-1)*4))>>2]=F[((19204+(I[($p0)>>2]-1)*4))>>2];
      }
      if((Math.fround(0.0)>Math.fround(0.0))){
        I[((20564+(I[($p0)>>2]-1)*4))>>2]=(false?-1:0);
      }
      F[((19444+(I[($p0)>>2]-1)*4))>>2]=Math.fround(0.0);
      break S1;
    }
    case 13:{
      if((F[((19364+(I[($p0)>>2]-1)*4))>>2]<Math.fround(0.0))){
        F[((19364+(I[($p0)>>2]-1)*4))>>2]=Math.fround(0.0);
        I[((19524+(I[($p0)>>2]-1)*4))>>2]=0;
        F[((19284+(I[($p0)>>2]-1)*4))>>2]=F[((19204+(I[($p0)>>2]-1)*4))>>2];
      }
      if((Math.fround(2.0)>Math.fround(0.0))){
        I[((20564+(I[($p0)>>2]-1)*4))>>2]=(false?-1:0);
      }
      F[((19444+(I[($p0)>>2]-1)*4))>>2]=Math.fround(2.0);
      break S1;
    }
    case 14:{
      if((F[((19364+(I[($p0)>>2]-1)*4))>>2]<Math.fround(0.0))){
        F[((19364+(I[($p0)>>2]-1)*4))>>2]=Math.fround(0.0);
        I[((19524+(I[($p0)>>2]-1)*4))>>2]=0;
        F[((19284+(I[($p0)>>2]-1)*4))>>2]=F[((19204+(I[($p0)>>2]-1)*4))>>2];
      }
      if((Math.fround(5.0)>Math.fround(0.0))){
        I[((20564+(I[($p0)>>2]-1)*4))>>2]=(false?-1:0);
      }
      F[((19444+(I[($p0)>>2]-1)*4))>>2]=Math.fround(5.0);
      break S1;
    }
    case 15:{
      if((F[((19364+(I[($p0)>>2]-1)*4))>>2]<Math.fround(0.0))){
        F[((19364+(I[($p0)>>2]-1)*4))>>2]=Math.fround(0.0);
        I[((19524+(I[($p0)>>2]-1)*4))>>2]=0;
        F[((19284+(I[($p0)>>2]-1)*4))>>2]=F[((19204+(I[($p0)>>2]-1)*4))>>2];
      }
      if((Math.fround(8.0)>Math.fround(0.0))){
        I[((20564+(I[($p0)>>2]-1)*4))>>2]=(false?-1:0);
      }
      F[((19444+(I[($p0)>>2]-1)*4))>>2]=Math.fround(8.0);
      break S1;
    }
    case 16:{
      if((F[((19364+(I[($p0)>>2]-1)*4))>>2]<Math.fround(0.0))){
        F[((19364+(I[($p0)>>2]-1)*4))>>2]=Math.fround(0.0);
      }
      I[((19524+(I[($p0)>>2]-1)*4))>>2]=0;
      F[((19284+(I[($p0)>>2]-1)*4))>>2]=R_mod360((F[22064]=Math.fround(F[22050]+R_rnduni((F[22062]=(-Math.fround(10.0)),88248),(F[22063]=Math.fround(10.0),88252))),88256));
      break S1;
    }
    case 24:{
      if((F[((19364+(I[($p0)>>2]-1)*4))>>2]<Math.fround(0.0))){
        F[((19364+(I[($p0)>>2]-1)*4))>>2]=Math.fround(0.0);
      }
      I[((19524+(I[($p0)>>2]-1)*4))>>2]=0;
      F[((19284+(I[($p0)>>2]-1)*4))>>2]=R_mod360((F[22067]=Math.fround(Math.fround(F[22050]+Math.fround(180.0))+R_rnduni((F[22065]=(-Math.fround(10.0)),88260),(F[22066]=Math.fround(10.0),88264))),88268));
      break S1;
    }
    case 17:{
      if((!((I[((20644+(I[($p0)>>2]-1)*4))>>2]&1)!==0))){
        F[((19444+(I[($p0)>>2]-1)*4))>>2]=Math.fround(0.0);
      }
      I[((20644+(I[($p0)>>2]-1)*4))>>2]=((!((I[((20644+(I[($p0)>>2]-1)*4))>>2]&1)!==0))?-1:0);
      break S1;
    }
    case 22:{
      R_robreply(88272);
      R_stormsg($p0,88188,88272);
      break S1;
    }
    case 21:{
      L2:while((I[((25604+(I[($p0)>>2]-1)*4))>>2]!==I[10051])){
        I[((25604+(I[($p0)>>2]-1)*4))>>2]=R_modp1((I[22101]=((I[((25604+(I[($p0)>>2]-1)*4))>>2]+1)|0),88404),(I[22102]=60,88408));
        I[22053]=I[((25604+(I[($p0)>>2]-1)*4))>>2];
        if(((R_canread($p0,88212))?true:false)){
          I[22054]=I[((39724+(I[22053]-1)*4))>>2];
          if(((((-I[22054])|0)>=1)&&(((-I[22054])|0)<=40))){
            continue L2;
          }
          if(((I[22054]>=1)&&(I[22054]<=20))){
            if(((I[((26644+(I[22054]-1)*4))>>2]&1)!==0)){
              continue L2;
            }
          }
          R_robreply(88272);
          R_stormsg($p0,88216,88272);
          break L2;
        }
      }
      break S1;
    }
    case 18:{
      R_stormsg($p0,(I[22103]=((-100)|0),88412),88416);
      break S1;
    }
    case 19:{
      R_stormsg($p0,(I[22108]=((-100)|0),88432),88436);
      break S1;
    }
    case 5:{
      I[22061]=(((R_enemydet($p0))?true:false)?-1:0);
      break S1;
    }
    case 6:{
      I[22053]=1;
      L3:for(;(I[22053]<=9);I[22053]=((I[22053]+1)|0)){
        R_detonate($p0,88212);
      }
      break S1;
    }
    case 11:{
      if((I[((25924+(I[($p0)>>2]-1)*4))>>2]!==0)){
        if((!(((I[((21684+(I[($p0)>>2]+Math.imul(I[((18724+(I[((25924+(I[($p0)>>2]-1)*4))>>2]-1)*4))>>2],20)-21)*4))>>2]&1)!==0)||((I[((21684+(I[((25924+(I[($p0)>>2]-1)*4))>>2]+Math.imul(I[((18724+(I[($p0)>>2]-1)*4))>>2],20)-21)*4))>>2]&1)!==0)))){
          I[((25844+(I[((25924+(I[($p0)>>2]-1)*4))>>2]-1)*4))>>2]=0;
          I[((25924+(I[($p0)>>2]-1)*4))>>2]=0;
        }
      }
      break S1;
    }
    case 20:{
      I[((20564+(I[($p0)>>2]-1)*4))>>2]=(true?-1:0);
      break S1;
    }
    default:{
      R_robstr($p1,88272);
      H.printf(88450,88272);
    }
  }
  return;
}
/* CONQAI.R: function newrob */
function R_newrob($p0,$p1){
  if((!((I[((1132+(I[($p1)>>2]-1)*4))>>2]&1)!==0))){
    I[22120]=(false?-1:0);
    return ((I[22120]&1)!==0);
  }
  if(((I[((7692+(I[($p1)>>2]+Math.imul(4,40)-41)*4))>>2]&1)!==0)){
    I[22120]=(false?-1:0);
    return ((I[22120]&1)!==0);
  }
  if((!((R_findship($p0))?true:false))){
    I[22120]=(false?-1:0);
    return ((I[22120]&1)!==0);
  }
  H.pvlock(604);
  I[((18484+(I[($p0)>>2]-1)*4))>>2]=2;
  I[22121]=0;
  I[22122]=1;
  L1:for(;(I[22122]<=20);I[22122]=((I[22122]+1)|0)){
    if(((I[((18484+(I[22122]-1)*4))>>2]===3)||(I[((18484+(I[22122]-1)*4))>>2]===2))){
      if(((I[((18644+(I[22122]-1)*4))>>2]===I[($p1)>>2])&&(I[($p0)>>2]!==I[22122]))){
        I[22121]=((I[22121]+1)|0);
      }
    }
  }
  if(((I[((7692+(I[($p1)>>2]+Math.imul(2,40)-41)*4))>>2]&1)!==0)){
    if((I[22121]>=I[((1452+(I[($p1)>>2]-1)*4))>>2])){
      I[((18484+(I[($p0)>>2]-1)*4))>>2]=1;
    }
  }else{
    if((I[22121]>0)){
      I[((18484+(I[($p0)>>2]-1)*4))>>2]=1;
    }
  }
  H.pvunlock(604);
  if((I[((18484+(I[($p0)>>2]-1)*4))>>2]===1)){
    I[22120]=(false?-1:0);
    return ((I[22120]&1)!==0);
  }
  H.pvlock(604);
  R_initship($p0,$p1);
  I[((26644+(I[($p0)>>2]-1)*4))>>2]=(true?-1:0);
  I[((18644+(I[($p0)>>2]-1)*4))>>2]=I[($p1)>>2];
  I[((18724+(I[($p0)>>2]-1)*4))>>2]=I[((1292+(I[($p1)>>2]-1)*4))>>2];
  I[((25524+(I[($p0)>>2]-1)*4))>>2]=0;
  I[((18804+(I[($p0)>>2]-1)*4))>>2]=0;
  I[22122]=1;
  L2:for(;(I[22122]<=12);I[22122]=((I[22122]+1)|0)){
    I[((20724+(I[($p0)>>2]+Math.imul(I[22122],20)-21)*4))>>2]=(((I[((5772+(I[($p1)>>2]+Math.imul(I[22122],40)-41)*4))>>2]&1)!==0)?-1:0);
  }
  I[((20724+(I[($p0)>>2]+Math.imul(4,20)-21)*4))>>2]=(true?-1:0);
  I[((20724+(I[($p0)>>2]+Math.imul(6,20)-21)*4))>>2]=(true?-1:0);
  I[22122]=1;
  L3:for(;(I[22122]<=4);I[22122]=((I[22122]+1)|0)){
    I[((22004+(I[($p0)>>2]+Math.imul(I[22122],20)-21)*4))>>2]=(false?-1:0);
    I[((21684+(I[($p0)>>2]+Math.imul(I[22122],20)-21)*4))>>2]=(false?-1:0);
  }
  R_stcpn((10892+1+Math.imul(I[($p1)>>2],24)-25),(26804+1+Math.imul(I[($p0)>>2],24)-25),(I[22123]=22,88492));
  if((I[((14060+(I[((15500+(I[((18724+(I[($p0)>>2]-1)*4))>>2]-1)*4))>>2]-1)*4))>>2]===I[((15516+(I[((18724+(I[($p0)>>2]-1)*4))>>2]-1)*4))>>2])){
    I[22122]=I[((15516+(I[((18724+(I[($p0)>>2]-1)*4))>>2]-1)*4))>>2];
  }else{
    I[22122]=I[((15500+(I[((18724+(I[($p0)>>2]-1)*4))>>2]-1)*4))>>2];
  }
  R_putship($p0,(16184+(I[22122]-1)*4),(16344+(I[22122]-1)*4));
  R_fixdeltas($p0);
  I[((18484+(I[($p0)>>2]-1)*4))>>2]=3;
  H.pvunlock(604);
  I[22120]=(true?-1:0);
  return ((I[22120]&1)!==0);
  return ((I[22120]&1)!==0);
}
/* CONQAI.R: subroutine robotai */
function R_robotai($p0){
  H.gcputime(88496);
  R_buildai($p0,88500,88188,88196,88200);
  I[22145]=R_tableai(88500);
  R_executeai($p0,88580);
  H.gcputime(88584);
  I[277]=((((I[277]+I[22146])|0)-I[22124])|0);
  if((I[277]>100)){
    I[275]=((I[275]+$idiv(I[277],100))|0);
    I[277]=$imod(I[277],100);
  }
  I[276]=((I[276]+1)|0);
  return;
}
/* CONQAI.R: subroutine trobotai */
function R_trobotai($p0){
  R_buildai($p0,88588,88188,88196,88200);
  I[22167]=R_tableai(88588);
  R_displayai($p0,88668,88588);
  if((!((I[22048]&1)!==0))){
    R_executeai($p0,88668);
  }
  return;
}
/* CONQAI.R: subroutine robreply */
function R_robreply($p0){
  S1:switch(R_rndint((I[22168]=1,88672),(I[22169]=54,88676))){
    case 1:{
      H.strcpy(88680,$p0);
      break S1;
    }
    case 2:{
      H.strcpy(88700,$p0);
      break S1;
    }
    case 3:{
      H.strcpy(88714,$p0);
      break S1;
    }
    case 4:{
      H.strcpy(88733,$p0);
      break S1;
    }
    case 5:{
      H.strcpy(88770,$p0);
      break S1;
    }
    case 6:{
      H.strcpy(88799,$p0);
      break S1;
    }
    case 7:{
      H.strcpy(88828,$p0);
      break S1;
    }
    case 8:{
      H.strcpy(88843,$p0);
      break S1;
    }
    case 9:{
      H.strcpy(88871,$p0);
      break S1;
    }
    case 10:{
      H.strcpy(88935,$p0);
      break S1;
    }
    case 11:{
      H.strcpy(88973,$p0);
      break S1;
    }
    case 12:{
      H.strcpy(88997,$p0);
      break S1;
    }
    case 13:{
      H.strcpy(89013,$p0);
      break S1;
    }
    case 14:{
      H.strcpy(89042,$p0);
      break S1;
    }
    case 15:{
      H.strcpy(89089,$p0);
      break S1;
    }
    case 16:{
      H.strcpy(89129,$p0);
      break S1;
    }
    case 17:{
      H.strcpy(89165,$p0);
      break S1;
    }
    case 18:{
      H.strcpy(89171,$p0);
      break S1;
    }
    case 19:{
      H.strcpy(89192,$p0);
      break S1;
    }
    case 20:{
      H.strcpy(89240,$p0);
      break S1;
    }
    case 21:{
      H.strcpy(89295,$p0);
      break S1;
    }
    case 22:{
      H.strcpy(89320,$p0);
      break S1;
    }
    case 23:{
      H.strcpy(89340,$p0);
      break S1;
    }
    case 24:{
      H.strcpy(89402,$p0);
      break S1;
    }
    case 25:{
      H.strcpy(89435,$p0);
      break S1;
    }
    case 26:{
      H.strcpy(89443,$p0);
      break S1;
    }
    case 27:{
      H.strcpy(89453,$p0);
      break S1;
    }
    case 28:{
      H.strcpy(89487,$p0);
      break S1;
    }
    case 29:{
      H.strcpy(89540,$p0);
      break S1;
    }
    case 30:{
      H.strcpy(89559,$p0);
      break S1;
    }
    case 31:{
      H.strcpy(89566,$p0);
      break S1;
    }
    case 32:{
      H.strcpy(89602,$p0);
      break S1;
    }
    case 33:{
      H.strcpy(89619,$p0);
      break S1;
    }
    case 34:{
      H.strcpy(89660,$p0);
      break S1;
    }
    case 35:{
      H.strcpy(89699,$p0);
      break S1;
    }
    case 36:{
      H.strcpy(89741,$p0);
      break S1;
    }
    case 37:{
      H.strcpy(89766,$p0);
      break S1;
    }
    case 38:{
      H.strcpy(89774,$p0);
      break S1;
    }
    case 39:{
      H.strcpy(89807,$p0);
      break S1;
    }
    case 40:{
      H.strcpy(89835,$p0);
      break S1;
    }
    case 41:{
      H.strcpy(89858,$p0);
      break S1;
    }
    case 42:{
      H.strcpy(89879,$p0);
      break S1;
    }
    case 43:{
      H.strcpy(89928,$p0);
      break S1;
    }
    case 44:{
      H.strcpy(89948,$p0);
      break S1;
    }
    case 45:{
      H.strcpy(90003,$p0);
      break S1;
    }
    case 46:{
      H.strcpy(90036,$p0);
      break S1;
    }
    case 47:{
      H.strcpy(90075,$p0);
      break S1;
    }
    case 48:{
      H.strcpy(90117,$p0);
      break S1;
    }
    case 49:{
      H.strcpy(90153,$p0);
      break S1;
    }
    case 50:{
      H.strcpy(90194,$p0);
      break S1;
    }
    case 51:{
      H.strcpy(90232,$p0);
      break S1;
    }
    case 52:{
      H.strcpy(90255,$p0);
      break S1;
    }
    case 53:{
      H.strcpy(90307,$p0);
      break S1;
    }
    case 54:{
      H.strcpy(90324,$p0);
      break S1;
    }
  }
  return;
}
/* CONQAI.R: subroutine robstr */
function R_robstr($p0,$p1){
  S1:switch(I[($p0)>>2]){
    case 1:{
      H.strcpy(90339,$p1);
      break S1;
    }
    case 2:{
      H.strcpy(90344,$p1);
      break S1;
    }
    case 3:{
      H.strcpy(90351,$p1);
      break S1;
    }
    case 4:{
      H.strcpy(90360,$p1);
      break S1;
    }
    case 5:{
      H.strcpy(90369,$p1);
      break S1;
    }
    case 6:{
      H.strcpy(90378,$p1);
      break S1;
    }
    case 7:{
      H.strcpy(90389,$p1);
      break S1;
    }
    case 8:{
      H.strcpy(90396,$p1);
      break S1;
    }
    case 9:{
      H.strcpy(90404,$p1);
      break S1;
    }
    case 10:{
      H.strcpy(90410,$p1);
      break S1;
    }
    case 11:{
      H.strcpy(90417,$p1);
      break S1;
    }
    case 12:{
      H.strcpy(90427,$p1);
      break S1;
    }
    case 13:{
      H.strcpy(90434,$p1);
      break S1;
    }
    case 14:{
      H.strcpy(90441,$p1);
      break S1;
    }
    case 15:{
      H.strcpy(90448,$p1);
      break S1;
    }
    case 16:{
      H.strcpy(90455,$p1);
      break S1;
    }
    case 17:{
      H.strcpy(90461,$p1);
      break S1;
    }
    case 18:{
      H.strcpy(90468,$p1);
      break S1;
    }
    case 19:{
      H.strcpy(90476,$p1);
      break S1;
    }
    case 20:{
      H.strcpy(90486,$p1);
      break S1;
    }
    case 21:{
      H.strcpy(90493,$p1);
      break S1;
    }
    case 22:{
      H.strcpy(90501,$p1);
      break S1;
    }
    case 23:{
      H.strcpy(90508,$p1);
      break S1;
    }
    case 24:{
      H.strcpy(90515,$p1);
      break S1;
    }
    default:{
      H.prints($p1,90523,$p0);
    }
  }
  return;
}
/* CONQAI.R: function tableai */
function R_tableai($p0){
  I[22633]=((-1)|0);
  I[22634]=1;
  L1:for(;(I[22634]<=20);I[22634]=((I[22634]+1)|0)){
    I[22633]=(I[22633]&I[((12652+(I[22634]+Math.imul(((I[(($p0+(I[22634]-1)*4))>>2]+1)|0),32)-33)*4))>>2]);
  }
  I[22638]=H.lib_S_ffs((I[22635]=0,90540),(I[22636]=32,90544),90532,90548);
  if((I[22638]===1)){
    I[22639]=I[((13932+(((I[22637]+1)|0)-1)*4))>>2];
  }else{
    if((I[22638]===1409584)){
      I[22639]=1;
    }else{
      H.sys_S_exit(90552);
    }
  }
  I[22632]=I[22639];
  return I[22632];
  return I[22632];
}
/* CONQDRIV.R: subroutine iterdrive */
function R_iterdrive($p0){
  I[22640]=1;
  L1:for(;(I[22640]<=20);I[22640]=((I[22640]+1)|0)){
    I[22641]=I[(($p0+(I[22640]-1)*4))>>2];
    if((I[((18484+(I[22641]-1)*4))>>2]===3)){
      if((I[((26164+(I[22641]-1)*4))>>2]>0)){
        I[((26164+(I[22641]-1)*4))>>2]=Math.max(0,((I[((26164+(I[22641]-1)*4))>>2]-1)|0));
      }
      if(((F[((19364+(I[22641]-1)*4))>>2]>=Math.fround(0.0))&&(F[((19284+(I[22641]-1)*4))>>2]!==F[((19204+(I[22641]-1)*4))>>2]))){
        F[22642]=F[((19204+(I[22641]-1)*4))>>2];
        F[22643]=R_subang(90568,(19284+(I[22641]-1)*4));
        F[22644]=Math.fround(Math.max(Math.fround(Math.fround(210.0)-Math.fround(Math.fround(F[((19364+(I[22641]-1)*4))>>2]*Math.fround(20.0))/Math.fround(Math.fround(Math.fround(Math.fround(Math.fround(Math.fround(I[((20404+(I[22641]-1)*4))>>2])+Math.fround(50.0))/Math.fround(100.0))*F[((15612+(I[((18724+(I[22641]-1)*4))>>2]-1)*4))>>2])*Math.fround(F[((19764+(I[22641]-1)*4))>>2]+Math.fround(50.0)))/Math.fround(50.0)))),Math.fround(2.0))*Math.fround(0.1));
        if((Math.abs(F[22643])<=F[22644])){
          F[((19204+(I[22641]-1)*4))>>2]=F[((19284+(I[22641]-1)*4))>>2];
        }else{
          if((F[22643]<Math.fround(0.0))){
            F[((19204+(I[22641]-1)*4))>>2]=Math.fround(F[22642]+F[22644]);
          }else{
            F[((19204+(I[22641]-1)*4))>>2]=Math.fround(F[22642]-F[22644]);
          }
        }
        R_fixdeltas(90564);
      }
      I[22645]=I[((25924+(I[22641]-1)*4))>>2];
      if((I[22645]!==0)){
        F[((19364+(I[22641]-1)*4))>>2]=Math.fround(0.0);
        F[((19444+(I[22641]-1)*4))>>2]=Math.fround(0.0);
        F[22642]=R_angle((18884+(I[22641]-1)*4),(18964+(I[22641]-1)*4),(18884+(I[22645]-1)*4),(18964+(I[22645]-1)*4));
        F[22643]=R_subang(90568,(19204+(I[22645]-1)*4));
        if((F[22643]<Math.fround(0.0))){
          F[22642]=Math.fround(F[22642]-Math.max(F[22643],(-Math.fround(Math.fround(10.0)*Math.fround(0.1)))));
        }else{
          F[22642]=Math.fround(F[22642]-Math.min(F[22643],Math.fround(Math.fround(10.0)*Math.fround(0.1))));
        }
        F[((18884+(I[22641]-1)*4))>>2]=Math.fround(F[((18884+(I[22645]-1)*4))>>2]+Math.fround(Math.fround(500.0)*Math.fround(Math.cos(Math.fround(Math.fround(Math.fround(F[22642]+Math.fround(180.0))/Math.fround(180.0))*Math.fround(3.14159))))));
        F[((18964+(I[22641]-1)*4))>>2]=Math.fround(F[((18964+(I[22645]-1)*4))>>2]+Math.fround(Math.fround(500.0)*Math.fround(Math.sin(Math.fround(Math.fround(Math.fround(F[22642]+Math.fround(180.0))/Math.fround(180.0))*Math.fround(3.14159))))));
      }else{
        if((F[((19364+(I[22641]-1)*4))>>2]>=Math.fround(0.0))){
          F[22644]=Math.min(F[((19444+(I[22641]-1)*4))>>2],Math.min(F[((15596+(I[((18724+(I[22641]-1)*4))>>2]-1)*4))>>2],Math.max(Math.fround(0.0),Math.fround($anint(Math.fround(Math.fround(Math.fround(Math.fround(100.0)-F[((19844+(I[22641]-1)*4))>>2])/Math.fround(100.0))*Math.fround(12.0)))))));
          if((F[((19364+(I[22641]-1)*4))>>2]!==F[22644])){
            F[((19364+(I[22641]-1)*4))>>2]=R_newarp(90564,90576);
            R_fixdeltas(90564);
          }
          F[((18884+(I[22641]-1)*4))>>2]=Math.fround(F[((18884+(I[22641]-1)*4))>>2]+F[((19044+(I[22641]-1)*4))>>2]);
          F[((18964+(I[22641]-1)*4))>>2]=Math.fround(F[((18964+(I[22641]-1)*4))>>2]+F[((19124+(I[22641]-1)*4))>>2]);
          I[22645]=((-I[((19524+(I[22641]-1)*4))>>2])|0);
          if((I[22645]>0)){
            if((!((I[((14700+(I[22645]-1)*4))>>2]&1)!==0))){
              I[((19524+(I[22641]-1)*4))>>2]=0;
            }else{
              if((F[((19364+(I[22641]-1)*4))>>2]>=Math.fround(0.0))){
                F[22646]=Math.fround(Math.sqrt(Math.fround(Math.fround(Math.pow(Math.fround(F[((16184+(I[22645]-1)*4))>>2]-F[((18884+(I[22641]-1)*4))>>2]),Math.fround(2)))+Math.fround(Math.pow(Math.fround(F[((16344+(I[22645]-1)*4))>>2]-F[((18964+(I[22641]-1)*4))>>2]),Math.fround(2))))));
                if((F[((19364+(I[22641]-1)*4))>>2]<=Math.fround(2.0))){
                  if((F[22646]<=Math.fround(300.0))){
                    R_orbit(90564,90580);
                    if((!((I[((20724+(I[22641]+Math.imul(6,20)-21)*4))>>2]&1)!==0))){
                      H.prints(90588,90678,(14860+1+Math.imul(I[22645],12)-13));
                      R_stormsg((I[22677]=((-106)|0),90708),90564,90588);
                    }
                  }
                }else{
                  if((Math.fround(F[22646]-Math.fround(300.0))<=R_acdist((19364+(I[22641]-1)*4),(F[22678]=Math.fround(2.0),90712),(F[22679]=Math.fround(F[((15628+(I[((18724+(I[22641]-1)*4))>>2]-1)*4))>>2]*Math.fround(Math.fround(Math.fround(Math.fround(Math.fround(Math.fround(I[((20404+(I[22641]-1)*4))>>2])+Math.fround(50.0))/Math.fround(100.0))*F[((15612+(I[((18724+(I[22641]-1)*4))>>2]-1)*4))>>2])*Math.fround(F[((19764+(I[22641]-1)*4))>>2]+Math.fround(50.0)))/Math.fround(50.0))),90716)))){
                    if((F[((19444+(I[22641]-1)*4))>>2]>Math.fround(2.0))){
                      F[((19444+(I[22641]-1)*4))>>2]=Math.fround(2.0);
                      if((!((I[((20724+(I[22641]+Math.imul(6,20)-21)*4))>>2]&1)!==0))){
                        H.prints(90588,90720,(14860+1+Math.imul(I[22645],12)-13));
                        R_stormsg((I[22694]=((-106)|0),90776),90564,90588);
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  I[22640]=1;
  L2:for(;(I[22640]<=20);I[22640]=((I[22640]+1)|0)){
    I[22641]=I[(($p0+(I[22640]-1)*4))>>2];
    if((I[((18484+(I[22641]-1)*4))>>2]!==1)){
      I[22645]=1;
      L3:for(;(I[22645]<=9);I[22645]=((I[22645]+1)|0)){
        if((I[((27604+(I[22641]+Math.imul(I[22645],20)-21)*4))>>2]===3)){
          F[((29044+(I[22641]+Math.imul(I[22645],20)-21)*4))>>2]=Math.fround(F[((29044+(I[22641]+Math.imul(I[22645],20)-21)*4))>>2]+F[((30484+(I[22641]+Math.imul(I[22645],20)-21)*4))>>2]);
          F[((29764+(I[22641]+Math.imul(I[22645],20)-21)*4))>>2]=Math.fround(F[((29764+(I[22641]+Math.imul(I[22645],20)-21)*4))>>2]+F[((31204+(I[22641]+Math.imul(I[22645],20)-21)*4))>>2]);
        }else{
          if((I[((27604+(I[22641]+Math.imul(I[22645],20)-21)*4))>>2]===4)){
            I[((28324+(I[22641]+Math.imul(I[22645],20)-21)*4))>>2]=3;
            I[((27604+(I[22641]+Math.imul(I[22645],20)-21)*4))>>2]=5;
            I[22695]=1;
            L4:for(;(I[22695]<=20);I[22695]=((I[22695]+1)|0)){
              I[22696]=I[(($p0+(I[22695]-1)*4))>>2];
              if(((I[((18484+(I[22696]-1)*4))>>2]===3)&&(I[22696]!==I[22641]))){
                if((((I[((32644+(I[22641]+Math.imul(I[22645],20)+Math.imul(I[((18724+(I[22696]-1)*4))>>2],180)-201)*4))>>2]&1)!==0)||((I[((21684+(I[22696]+Math.imul(I[((18724+(I[22641]-1)*4))>>2],20)-21)*4))>>2]&1)!==0))){
                  F[22699]=R_explosion((F[22697]=Math.fround(Math.fround(72.0)*F[((31924+(I[22641]+Math.imul(I[22645],20)-21)*4))>>2]),90788),(F[22698]=Math.fround(Math.sqrt(Math.fround(Math.fround(Math.pow(Math.fround(F[((18884+(I[22696]-1)*4))>>2]-F[((29044+(I[22641]+Math.imul(I[22645],20)-21)*4))>>2]),Math.fround(2)))+Math.fround(Math.pow(Math.fround(F[((18964+(I[22696]-1)*4))>>2]-F[((29764+(I[22641]+Math.imul(I[22645],20)-21)*4))>>2]),Math.fround(2)))))),90792));
                  if((F[22699]>Math.fround(0.0))){
                    R_hit(90784,90796,90564);
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  if((I[3992]===1)){
    F[3994]=Math.fround(F[3994]+F[3996]);
    F[3995]=Math.fround(F[3995]+F[3997]);
  }
  return;
}
/* CONQDRIV.R: subroutine secdrive */
function R_secdrive($p0){
  I[22700]=1;
  L1:for(;(I[22700]<=20);I[22700]=((I[22700]+1)|0)){
    I[22701]=I[(($p0+(I[22700]-1)*4))>>2];
    if((I[((18484+(I[22701]-1)*4))>>2]===1)){
      continue L1;
    }
    if((I[((18484+(I[22701]-1)*4))>>2]!==3)){
      if((I[((25524+(I[22701]-1)*4))>>2]<0)){
        H.pvlock(604);
        if(((I[((18484+(I[22701]-1)*4))>>2]!==3)&&(I[((25524+(I[22701]-1)*4))>>2]<0))){
          I[((25524+(I[22701]-1)*4))>>2]=((I[((25524+(I[22701]-1)*4))>>2]+1)|0);
          if((I[((25524+(I[22701]-1)*4))>>2]===0)){
            I[((25524+(I[22701]-1)*4))>>2]=0;
            I[((18564+(I[22701]-1)*4))>>2]=0;
            I[((18484+(I[22701]-1)*4))>>2]=1;
          }
        }
        H.pvunlock(604);
        continue L1;
      }
    }
    if(((I[((7692+(I[((18644+(I[22701]-1)*4))>>2]+Math.imul(4,40)-41)*4))>>2]&1)!==0)){
      R_kill(90804,(I[22702]=((-105)|0),90808));
      continue L1;
    }
    if(((I[150]&1)!==0)){
      if((!((I[((7692+(I[((18644+(I[22701]-1)*4))>>2]+Math.imul(1,40)-41)*4))>>2]&1)!==0))){
        R_kill(90804,(I[22703]=((-104)|0),90812));
        continue L1;
      }
    }
    if(((I[((26644+(I[22701]-1)*4))>>2]&1)!==0)){
      if((!((I[10052]&1)!==0))){
        R_robotai(90804);
      }
    }
    F[22704]=F[((19364+(I[22701]-1)*4))>>2];
    I[22705]=((-I[((19524+(I[22701]-1)*4))>>2])|0);
    if(((I[22705]>=1)&&(I[22705]<=40))){
      if((F[22704]<Math.fround(0.0))){
        if((F[22704]===(-Math.fround(1.0)))){
          F[((19204+(I[22701]-1)*4))>>2]=R_mod360((F[22706]=Math.fround(F[((19204+(I[22701]-1)*4))>>2]-Math.fround(10.0)),90824));
          F[((18884+(I[22701]-1)*4))>>2]=Math.fround(F[((16184+(I[22705]-1)*4))>>2]+Math.fround(Math.fround(300.0)*Math.fround(Math.cos(Math.fround(Math.fround(Math.fround(F[((19204+(I[22701]-1)*4))>>2]+Math.fround(90.0))/Math.fround(180.0))*Math.fround(3.14159))))));
          F[((18964+(I[22701]-1)*4))>>2]=Math.fround(F[((16344+(I[22705]-1)*4))>>2]+Math.fround(Math.fround(300.0)*Math.fround(Math.sin(Math.fround(Math.fround(Math.fround(F[((19204+(I[22701]-1)*4))>>2]+Math.fround(90.0))/Math.fround(180.0))*Math.fround(3.14159))))));
        }else{
          if((F[22704]===(-Math.fround(2.0)))){
            F[((19204+(I[22701]-1)*4))>>2]=R_mod360((F[22707]=Math.fround(F[((19204+(I[22701]-1)*4))>>2]+Math.fround(10.0)),90828));
            F[((18884+(I[22701]-1)*4))>>2]=Math.fround(F[((16184+(I[22705]-1)*4))>>2]+Math.fround(Math.fround(300.0)*Math.fround(Math.cos(Math.fround(Math.fround(Math.fround(F[((19204+(I[22701]-1)*4))>>2]-Math.fround(90.0))/Math.fround(180.0))*Math.fround(3.14159))))));
            F[((18964+(I[22701]-1)*4))>>2]=Math.fround(F[((16344+(I[22705]-1)*4))>>2]+Math.fround(Math.fround(300.0)*Math.fround(Math.sin(Math.fround(Math.fround(Math.fround(F[((19204+(I[22701]-1)*4))>>2]-Math.fround(90.0))/Math.fround(180.0))*Math.fround(3.14159))))));
          }
        }
      }else{
        F[((19284+(I[22701]-1)*4))>>2]=R_angle((18884+(I[22701]-1)*4),(18964+(I[22701]-1)*4),(16184+(I[22705]-1)*4),(16344+(I[22705]-1)*4));
      }
    }
    I[22708]=1;
    L2:for(;(I[22708]<=4);I[22708]=((I[22708]+1)|0)){
      if((I[((26244+(I[22701]+Math.imul(I[22708],20)-21)*4))>>2]>0)){
        I[((26244+(I[22701]+Math.imul(I[22708],20)-21)*4))>>2]=((I[((26244+(I[22701]+Math.imul(I[22708],20)-21)*4))>>2]-1)|0);
      }
    }
    I[22708]=1;
    L3:for(;(I[22708]<=40);I[22708]=((I[22708]+1)|0)){
      if(((I[((14700+(I[22708]-1)*4))>>2]&1)!==0)){
        F[22709]=Math.fround(Math.sqrt(Math.fround(Math.fround(Math.pow(Math.fround(F[((16184+(I[22708]-1)*4))>>2]-F[((18884+(I[22701]-1)*4))>>2]),Math.fround(2)))+Math.fround(Math.pow(Math.fround(F[((16344+(I[22708]-1)*4))>>2]-F[((18964+(I[22701]-1)*4))>>2]),Math.fround(2))))));
        if((F[22709]<=Math.fround(500.0))){
          I[22710]=I[((18724+(I[22701]-1)*4))>>2];
          if(((I[22710]>=1)&&(I[22710]<=4))){
            I[((16824+(I[22708]+Math.imul(I[22710],40)-41)*4))>>2]=(true?-1:0);
          }
          if((((R_spwar(90804,90832))?true:false)&&(I[((16664+(I[22708]-1)*4))>>2]>0))){
            R_hit(90804,(F[22713]=R_rndnor((F[22711]=Math.fround(Math.fround(2.5)+Math.fround(Math.fround(I[((16664+(I[22708]-1)*4))>>2])*Math.fround(0.08))),90844),(F[22712]=Math.fround(1.0),90848)),90852),(I[22714]=((-I[22708])|0),90856));
          }
        }
        if((I[22708]<=40)){
          if((F[22709]<=Math.fround(3000.0))){
            if((!((I[((20644+(I[22701]-1)*4))>>2]&1)!==0))){
              I[22710]=I[((16504+(I[22708]-1)*4))>>2];
              if(((I[22710]>=1)&&(I[22710]<=4))){
                I[((26244+(I[22701]+Math.imul(I[22710],20)-21)*4))>>2]=5;
              }
            }
          }
        }
      }
    }
    if((I[3992]===1)){
      if((Math.fround(Math.sqrt(Math.fround(Math.fround(Math.pow(Math.fround(F[3994]-F[((18884+(I[22701]-1)*4))>>2]),Math.fround(2)))+Math.fround(Math.pow(Math.fround(F[3995]-F[((18964+(I[22701]-1)*4))>>2]),Math.fround(2))))))<=Math.fround(1500.0))){
        R_hit(90804,(F[22717]=R_rndnor((F[22715]=Math.fround(7.0),90860),(F[22716]=Math.fround(1.0),90864)),90868),(I[22718]=((-106)|0),90872));
      }
    }
    if(((Math.abs(F[((18884+(I[22701]-1)*4))>>2])>=Math.fround(30000.0))||(Math.abs(F[((18964+(I[22701]-1)*4))>>2])>=Math.fround(30000.0)))){
      if(((Math.abs(F[((18884+(I[22701]-1)*4))>>2])<=Math.fround(33500.0))&&(Math.abs(F[((18964+(I[22701]-1)*4))>>2])<=Math.fround(33500.0)))){
        R_hit(90804,(F[22719]=Math.fround(5.0),90876),(I[22720]=((-101)|0),90880));
      }
    }
    if((F[((19684+(I[22701]-1)*4))>>2]<Math.fround(100.0))){
      F[22721]=Math.fround(2.0);
      if((!((I[((19604+(I[22701]-1)*4))>>2]&1)!==0))){
        F[22721]=Math.fround(F[22721]*Math.fround(2.0));
      }
      F[((19684+(I[22701]-1)*4))>>2]=Math.min(Math.fround(100.0),Math.fround(F[((19684+(I[22701]-1)*4))>>2]+F[22721]));
    }
    F[22722]=Math.fround(0.333333);
    if(((I[((20564+(I[22701]-1)*4))>>2]&1)!==0)){
      I[((20644+(I[22701]-1)*4))>>2]=(false?-1:0);
      if((F[((19364+(I[22701]-1)*4))>>2]>=Math.fround(0.0))){
        F[((19444+(I[22701]-1)*4))>>2]=Math.fround(0.0);
      }
      F[22722]=Math.fround(F[22722]*Math.fround(3.0));
    }
    if((F[((19364+(I[22701]-1)*4))>>2]<Math.fround(0.0))){
      if((!((R_spwar(90804,(I[22723]=((-I[((19524+(I[22701]-1)*4))>>2])|0),90892)))?true:false))){
        if((I[((16664+(((-I[((19524+(I[22701]-1)*4))>>2])|0)-1)*4))>>2]>0)){
          F[22722]=Math.fround(F[22722]*Math.fround(3.0));
        }
      }
    }
    F[((19844+(I[22701]-1)*4))>>2]=Math.fround(F[((19844+(I[22701]-1)*4))>>2]-F[22722]);
    if((F[((19844+(I[22701]-1)*4))>>2]<Math.fround(0.0))){
      F[((19844+(I[22701]-1)*4))>>2]=Math.fround(0.0);
      if(((I[((20564+(I[22701]-1)*4))>>2]&1)!==0)){
        I[((20564+(I[22701]-1)*4))>>2]=(false?-1:0);
      }
    }
    if((I[((20164+(I[22701]-1)*4))>>2]>0)){
      I[((20164+(I[22701]-1)*4))>>2]=((I[((20164+(I[22701]-1)*4))>>2]-1)|0);
      if((I[((20164+(I[22701]-1)*4))>>2]<=0)){
        if((!((I[((20724+(I[22701]+Math.imul(6,20)-21)*4))>>2]&1)!==0))){
          R_stormsg((I[22724]=((-106)|0),90896),90804,90900);
        }
      }
    }
    if((I[((20244+(I[22701]-1)*4))>>2]>0)){
      I[((20244+(I[22701]-1)*4))>>2]=((I[((20244+(I[22701]-1)*4))>>2]-1)|0);
      F[((19444+(I[22701]-1)*4))>>2]=Math.fround(0.0);
      if((I[((20244+(I[22701]-1)*4))>>2]<=0)){
        if((!((I[((20724+(I[22701]+Math.imul(6,20)-21)*4))>>2]&1)!==0))){
          R_stormsg((I[22732]=((-106)|0),90928),90804,90932);
        }
      }
    }
    F[22740]=Math.fround(2.5);
    F[22741]=Math.fround(0.0);
    if((F[((19364+(I[22701]-1)*4))>>2]<Math.fround(0.0))){
      if(((!((I[((19604+(I[22701]-1)*4))>>2]&1)!==0))||((I[((20564+(I[22701]-1)*4))>>2]&1)!==0))){
        if((I[((14540+(((-I[((19524+(I[22701]-1)*4))>>2])|0)-1)*4))>>2]===1)){
          if((!((R_spwar(90804,(I[22742]=((-I[((19524+(I[22701]-1)*4))>>2])|0),90968)))?true:false))){
            if((I[((16664+(((-I[((19524+(I[22701]-1)*4))>>2])|0)-1)*4))>>2]>0)){
              F[22740]=Math.fround(F[22740]*Math.fround(5.0));
            }
          }
        }
      }
    }else{
      if(((I[((19604+(I[22701]-1)*4))>>2]&1)!==0)){
        F[22741]=Math.fround(F[22741]+Math.fround(Math.fround(F[((19444+(I[22701]-1)*4))>>2]*Math.fround(0.5))*Math.fround(1.25)));
      }else{
        F[22741]=Math.fround(F[22741]+Math.fround(F[((19444+(I[22701]-1)*4))>>2]*Math.fround(0.5)));
      }
      F[22741]=Math.fround(F[22741]+Math.fround(Math.fround(F[((19444+(I[22701]-1)*4))>>2]*Math.fround(I[((20484+(I[22701]-1)*4))>>2]))*Math.fround(0.04)));
      if((I[((25844+(I[22701]-1)*4))>>2]!==0)){
        if(((I[((19604+(I[((25844+(I[22701]-1)*4))>>2]-1)*4))>>2]&1)!==0)){
          F[22741]=Math.fround(F[22741]+Math.fround(Math.fround(F[((19444+(I[22701]-1)*4))>>2]*Math.fround(0.5))*Math.fround(1.25)));
        }else{
          F[22741]=Math.fround(F[22741]+Math.fround(F[((19444+(I[22701]-1)*4))>>2]*Math.fround(0.5)));
        }
        F[22741]=Math.fround(F[22741]+Math.fround(Math.fround(F[((19444+(I[22701]-1)*4))>>2]*Math.fround(I[((20484+(I[((25844+(I[22701]-1)*4))>>2]-1)*4))>>2]))*Math.fround(0.04)));
      }
    }
    if(((I[((20644+(I[22701]-1)*4))>>2]&1)!==0)){
      I[((20564+(I[22701]-1)*4))>>2]=(false?-1:0);
      F[22741]=Math.fround(F[22741]+Math.fround(4.0));
      if((F[((19364+(I[22701]-1)*4))>>2]>Math.fround(0.0))){
        F[22741]=Math.fround(F[22741]+Math.fround(F[((19444+(I[22701]-1)*4))>>2]*Math.fround(2.0)));
      }
    }
    F[((19924+(I[22701]-1)*4))>>2]=Math.min(Math.fround(999.0),Math.fround(F[((19924+(I[22701]-1)*4))>>2]+F[22740]));
    if((F[22741]>Math.fround(0.0))){
      I[22744]=(((R_usefuel(90804,90964,(I[22743]=(false?-1:0),90972)))?true:false)?-1:0);
    }
    F[((20004+(I[22701]-1)*4))>>2]=Math.max(Math.fround(0.0),Math.fround(F[((20004+(I[22701]-1)*4))>>2]-Math.fround(0.8)));
    F[((20084+(I[22701]-1)*4))>>2]=Math.max(Math.fround(0.0),Math.fround(F[((20084+(I[22701]-1)*4))>>2]-Math.fround(0.5)));
  }
  I[22701]=1;
  L4:for(;(I[22701]<=20);I[22701]=((I[22701]+1)|0)){
    I[((90980+(I[22701]-1)*4))>>2]=(false?-1:0);
  }
  I[22700]=1;
  L5:for(;(I[22700]<=20);I[22700]=((I[22700]+1)|0)){
    I[22701]=I[(($p0+(I[22700]-1)*4))>>2];
    if((I[((18484+(I[22701]-1)*4))>>2]!==1)){
      I[22708]=1;
      L6:for(;(I[22708]<=9);I[22708]=((I[22708]+1)|0)){
        if((I[((27604+(I[22701]+Math.imul(I[22708],20)-21)*4))>>2]!==1)){
          I[((28324+(I[22701]+Math.imul(I[22708],20)-21)*4))>>2]=((I[((28324+(I[22701]+Math.imul(I[22708],20)-21)*4))>>2]-1)|0);
          if((I[((28324+(I[22701]+Math.imul(I[22708],20)-21)*4))>>2]<=0)){
            if((I[((27604+(I[22701]+Math.imul(I[22708],20)-21)*4))>>2]===3)){
              R_detonate(90804,90832);
            }else{
              if((I[((27604+(I[22701]+Math.imul(I[22708],20)-21)*4))>>2]===5)){
                I[((27604+(I[22701]+Math.imul(I[22708],20)-21)*4))>>2]=1;
              }
            }
          }else{
            if((I[((27604+(I[22701]+Math.imul(I[22708],20)-21)*4))>>2]===3)){
              I[22765]=1;
              L7:for(;(I[22765]<=20);I[22765]=((I[22765]+1)|0)){
                I[22710]=I[(($p0+(I[22765]-1)*4))>>2];
                if(((I[((18484+(I[22710]-1)*4))>>2]===3)&&(I[22710]!==I[22701]))){
                  if((((I[((32644+(I[22701]+Math.imul(I[22708],20)+Math.imul(I[((18724+(I[22710]-1)*4))>>2],180)-201)*4))>>2]&1)!==0)||((I[((21684+(I[22710]+Math.imul(I[((18724+(I[22701]-1)*4))>>2],20)-21)*4))>>2]&1)!==0))){
                    F[22709]=Math.fround(Math.abs(Math.fround(F[((18884+(I[22710]-1)*4))>>2]-F[((29044+(I[22701]+Math.imul(I[22708],20)-21)*4))>>2]))+Math.abs(Math.fround(F[((18964+(I[22710]-1)*4))>>2]-F[((29764+(I[22701]+Math.imul(I[22708],20)-21)*4))>>2])));
                    if((F[22709]<=Math.fround(250.0))){
                      R_detonate(90804,90832);
                      break L7;
                    }else{
                      if((F[22709]<=Math.fround(2000.0))){
                        I[((90980+(I[22710]-1)*4))>>2]=(true?-1:0);
                      }
                    }
                  }
                }
              }
            }
            if((I[((27604+(I[22701]+Math.imul(I[22708],20)-21)*4))>>2]===3)){
              if((I[3992]===1)){
                if((Math.fround(Math.abs(Math.fround(F[3994]-F[((29044+(I[22701]+Math.imul(I[22708],20)-21)*4))>>2]))+Math.abs(Math.fround(F[3995]-F[((29764+(I[22701]+Math.imul(I[22708],20)-21)*4))>>2])))<=Math.fround(250.0))){
                  R_detonate(90804,90832);
                  break L6;
                }
              }
            }
          }
        }
      }
    }
  }
  I[22701]=1;
  L8:for(;(I[22701]<=20);I[22701]=((I[22701]+1)|0)){
    I[((26564+(I[22701]-1)*4))>>2]=(((I[((90980+(I[22701]-1)*4))>>2]&1)!==0)?-1:0);
  }
  if((I[3992]===1)){
    if((I[3999]<0)){
      if((Math.fround(Math.abs(Math.fround(F[((16184+(((-I[3999])|0)-1)*4))>>2]-F[3994]))+Math.abs(Math.fround(F[((16344+(((-I[3999])|0)-1)*4))>>2]-F[3995])))<=Math.fround(1500.0))){
        if((R_rnd((I[22766]=0,91064))<=Math.fround(0.1))){
          R_intrude((I[22767]=((-103)|0),91068),(I[22768]=((-I[3999])|0),91072));
        }
        H.pvlock(604);
        I[((16664+(((-I[3999])|0)-1)*4))>>2]=((I[((16664+(((-I[3999])|0)-1)*4))>>2]-1)|0);
        if((I[((16664+(((-I[3999])|0)-1)*4))>>2]<=0)){
          I[((15808+(((-I[3999])|0)-1)*4))>>2]=R_rndint((I[22769]=120,91076),(I[22770]=240,91080));
          R_zeroplanet((I[22771]=((-I[3999])|0),91084),(I[22772]=0,91088));
          R_doomfind();
        }
        H.pvunlock(604);
      }
    }else{
      if((I[3999]>0)){
        if((I[((18484+(I[3999]-1)*4))>>2]!==3)){
          R_doomfind();
        }else{
          if((Math.fround(Math.abs(Math.fround(F[((18884+(I[3999]-1)*4))>>2]-F[3994]))+Math.abs(Math.fround(F[((18964+(I[3999]-1)*4))>>2]-F[3995])))<=Math.fround(1500.0))){
            F[((19364+(I[3999]-1)*4))>>2]=Math.fround(0.0);
          }
        }
      }
    }
    if((I[3999]<0)){
      F[3998]=R_angle(15976,15980,(16184+(((-I[3999])|0)-1)*4),(16344+(((-I[3999])|0)-1)*4));
    }else{
      if((I[3999]>0)){
        F[3998]=R_angle(15976,15980,(18884+(I[3999]-1)*4),(18964+(I[3999]-1)*4));
      }
    }
    F[3996]=Math.fround(Math.fround(Math.fround(Math.fround(2.0)*Math.fround(18.0))*Math.fround(0.1))*Math.fround(Math.cos(Math.fround(Math.fround(F[3998]/Math.fround(180.0))*Math.fround(3.14159)))));
    F[3997]=Math.fround(Math.fround(Math.fround(Math.fround(2.0)*Math.fround(18.0))*Math.fround(0.1))*Math.fround(Math.sin(Math.fround(Math.fround(F[3998]/Math.fround(180.0))*Math.fround(3.14159)))));
  }
  return;
}
/* CONQDRIV.R: subroutine submindrive */
function R_submindrive(){
  I[22773]=40;
  L1:for(;(I[22773]>=1);I[22773]=((I[22773]-1)|0)){
    if((I[((14060+(I[22773]-1)*4))>>2]!==0)){
      F[((16024+(I[22773]-1)*4))>>2]=R_mod360((F[22774]=Math.fround(F[((16024+(I[22773]-1)*4))>>2]+Math.fround(Math.fround(F[((14380+(I[22773]-1)*4))>>2]*Math.fround(5))/Math.fround(60.0))),91096));
      F[((16184+(I[22773]-1)*4))>>2]=Math.fround(F[((16184+(I[((14060+(I[22773]-1)*4))>>2]-1)*4))>>2]+Math.fround(F[((14220+(I[22773]-1)*4))>>2]*Math.fround(Math.cos(Math.fround(Math.fround(F[((16024+(I[22773]-1)*4))>>2]/Math.fround(180.0))*Math.fround(3.14159))))));
      F[((16344+(I[22773]-1)*4))>>2]=Math.fround(F[((16344+(I[((14060+(I[22773]-1)*4))>>2]-1)*4))>>2]+Math.fround(F[((14220+(I[22773]-1)*4))>>2]*Math.fround(Math.sin(Math.fround(Math.fround(F[((16024+(I[22773]-1)*4))>>2]/Math.fround(180.0))*Math.fround(3.14159))))));
    }else{
      if((F[((14380+(I[22773]-1)*4))>>2]!==Math.fround(0.0))){
        F[22775]=Math.fround(Math.fround(F[((14380+(I[22773]-1)*4))>>2]*Math.fround(18.0))*Math.fround(5));
        F[((16184+(I[22773]-1)*4))>>2]=Math.fround(F[((16184+(I[22773]-1)*4))>>2]+Math.fround(F[22775]*Math.fround(Math.cos(Math.fround(Math.fround(F[((16024+(I[22773]-1)*4))>>2]/Math.fround(180.0))*Math.fround(3.14159))))));
        F[((16344+(I[22773]-1)*4))>>2]=Math.fround(F[((16344+(I[22773]-1)*4))>>2]+Math.fround(F[22775]*Math.fround(Math.sin(Math.fround(Math.fround(F[((16024+(I[22773]-1)*4))>>2]/Math.fround(180.0))*Math.fround(3.14159))))));
      }
    }
  }
  return;
}
/* CONQDRIV.R: subroutine mindrive */
function R_mindrive(){
  I[22776]=1;
  L1:for(;(I[22776]<=4);I[22776]=((I[22776]+1)|0)){
    if((I[((15792+(I[22776]-1)*4))>>2]>0)){
      I[((15792+(I[22776]-1)*4))>>2]=((I[((15792+(I[22776]-1)*4))>>2]-1)|0);
    }
  }
  I[22776]=1;
  L2:for(;(I[22776]<=40);I[22776]=((I[22776]+1)|0)){
    if((I[((15808+(I[22776]-1)*4))>>2]>0)){
      I[((15808+(I[22776]-1)*4))>>2]=((I[((15808+(I[22776]-1)*4))>>2]-1)|0);
    }
  }
  if((I[3992]===1)){
    R_doomfind();
  }else{
    if((R_rnd((I[22777]=0,91108))<Math.fround(0.001))){
      R_doomsday();
    }
  }
  return;
}
/* CONQDRIV.R: subroutine fivemindrive */
function R_fivemindrive(){
  H.pvlock(604);
  I[22778]=1;
  L1:for(;(I[22778]<=40);I[22778]=((I[22778]+1)|0)){
    if(((I[((16664+(I[22778]-1)*4))>>2]>0)&&(I[((16504+(I[22778]-1)*4))>>2]!==7))){
      if((I[((16664+(I[22778]-1)*4))>>2]<3)){
        if((R_rnd((I[22779]=0,91116))<=Math.fround(0.5))){
          I[((16664+(I[22778]-1)*4))>>2]=((I[((16664+(I[22778]-1)*4))>>2]+1)|0);
        }
      }else{
        if((I[((14540+(I[22778]-1)*4))>>2]===1)){
          I[22780]=90;
        }else{
          I[22780]=70;
        }
        if(((I[((16664+(I[22778]-1)*4))>>2]>=I[22780])&&(R_rnd((I[22781]=0,91124))<=Math.fround(0.2)))){
          I[((16664+(I[22778]-1)*4))>>2]=Math.max($nint(Math.fround(Math.fround(I[((16664+(I[22778]-1)*4))>>2])*R_rnd((I[22782]=0,91128)))),1);
        }else{
          I[((16664+(I[22778]-1)*4))>>2]=((I[((16664+(I[22778]-1)*4))>>2]+R_rndint((I[22783]=1,91132),(I[22784]=3,91136)))|0);
        }
      }
    }
  }
  H.pvunlock(604);
  return;
}
/* CD2LB.R: subroutine cdacel */
function R_cdacel($p0,$p1){
  R_cdgoto($p0,$p1);
  R_sccel();
  I[26459]=((((I[26456]-I[($p1)>>2])|0)+1)|0);
  R_cdfill((I[26460]=32,105840),(91140+I[($p1)>>2]+Math.imul(I[($p0)>>2],80)-81),105836);
  R_cdfill((I[26461]=0,105844),(94500+I[($p1)>>2]+Math.imul(I[($p0)>>2],80)-81),105836);
  I[((104436+(I[($p0)>>2]-1)*4))>>2]=(true?-1:0);
  I[((94340+(I[($p0)>>2]-1)*4))>>2]=0;
  I[((104276+(I[($p0)>>2]-1)*4))>>2]=Math.min(I[((104276+(I[($p0)>>2]-1)*4))>>2],I[($p1)>>2]);
  return;
}
/* CD2LB.R: function cdandfont */
function R_cdandfont($p0,$p1){
  B[105848]=(B[$p0]&B[$p1]);
  return B[105848];
  return B[105848];
}
/* CD2LB.R: subroutine cdaput */
function R_cdaput($p0,$p1,$p2,$p3){
  R_cdgoto($p2,$p3);
  R_cdcput($p0,$p1);
  B[(91140+I[($p3)>>2]+Math.imul(I[($p2)>>2],80)-81)]=B[$p0];
  B[(94500+I[($p3)>>2]+Math.imul(I[($p2)>>2],80)-81)]=B[$p1];
  I[((104436+(I[($p2)>>2]-1)*4))>>2]=(true?-1:0);
  I[((94340+(I[($p2)>>2]-1)*4))>>2]=Math.max(I[((94340+(I[($p2)>>2]-1)*4))>>2],I[($p3)>>2]);
  I[((104276+(I[($p2)>>2]-1)*4))>>2]=Math.min(I[((104276+(I[($p2)>>2]-1)*4))>>2],I[($p3)>>2]);
  if((I[24426]<I[26456])){
    I[24426]=((I[24426]+1)|0);
  }else{
    if(((I[26595]&1)!==0)){
      I[24426]=1;
      I[24425]=((I[24425]+1)|0);
    }
  }
  return;
}
/* CD2LB.R: subroutine cdbox */
function R_cdbox($p0,$p1,$p2,$p3){
  R_cdline($p0,$p1,$p0,$p3);
  R_cdline($p0,$p3,$p2,$p3);
  R_cdline($p2,$p3,$p2,$p1);
  R_cdline($p2,$p1,$p0,$p1);
  return;
}
/* CD2LB.R: subroutine cdcput */
function R_cdcput($p0,$p1){
  if((B[$p1]!==B[105832])){
    R_cdsetfont($p1);
  }
  S1:switch(B[$p0]){
    case 1:{
      R_scgraphics((I[26954]=1,107816));
      break S1;
    }
    case 2:{
      R_scgraphics((I[26955]=2,107820));
      break S1;
    }
    case 3:{
      R_scgraphics((I[26956]=3,107824));
      break S1;
    }
    case 4:{
      R_scgraphics((I[26957]=4,107828));
      break S1;
    }
    case 5:{
      R_scgraphics((I[26958]=5,107832));
      break S1;
    }
    case 6:{
      R_scgraphics((I[26959]=6,107836));
      break S1;
    }
    case 7:{
      R_scgraphics((I[26960]=7,107840));
      break S1;
    }
    case 8:{
      R_scgraphics((I[26961]=8,107844));
      break S1;
    }
    case 9:{
      R_scgraphics((I[26962]=9,107848));
      break S1;
    }
    case 10:{
      R_scgraphics((I[26963]=10,107852));
      break S1;
    }
    case 11:{
      R_scgraphics((I[26964]=11,107856));
      break S1;
    }
    case 12:{
      R_scgraphics((I[26965]=12,107860));
      break S1;
    }
    case 13:{
      R_scgraphics((I[26966]=13,107864));
      break S1;
    }
    case 14:{
      R_scgraphics((I[26967]=14,107868));
      break S1;
    }
    case 15:{
      R_scgraphics((I[26968]=15,107872));
      break S1;
    }
    case 127:{
      R_scpillow();
      break S1;
    }
    default:{
      R_scput($p0);
    }
  }
  return;
}
/* CD2LB.R: subroutine cdclear */
function R_cdclear(){
  R_cdclra((I[26969]=1,107876),(I[26970]=1,107880),105820,105824);
  R_cdsetfont((I[26971]=0,107884));
  return;
}
/* CD2LB.R: subroutine cdclra */
function R_cdclra($p0,$p1,$p2,$p3){
  I[26972]=Math.max(1,Math.min(I[($p1)>>2],I[($p3)>>2]));
  I[26973]=Math.min(I[26456],Math.max(I[($p1)>>2],I[($p3)>>2]));
  I[26974]=((((I[26973]-I[26972])|0)+1)|0);
  I[26975]=Math.max(1,Math.min(I[($p0)>>2],I[($p2)>>2]));
  I[26976]=Math.min(I[26455],Math.max(I[($p0)>>2],I[($p2)>>2]));
  I[26977]=I[26975];
  L1:for(;(I[26977]<=I[26976]);I[26977]=((I[26977]+1)|0)){
    R_cdfill((I[26978]=32,107912),(97708+I[26972]+Math.imul(I[26977],80)-81),107896);
    R_cdfill((I[26979]=0,107916),(101068+I[26972]+Math.imul(I[26977],80)-81),107896);
    I[((104436+(I[26977]-1)*4))>>2]=(true?-1:0);
    if((I[26973]>=I[((100908+(I[26977]-1)*4))>>2])){
      I[((100908+(I[26977]-1)*4))>>2]=Math.min(I[((100908+(I[26977]-1)*4))>>2],((I[26972]-1)|0));
    }
    I[((104276+(I[26977]-1)*4))>>2]=Math.min(I[((104276+(I[26977]-1)*4))>>2],I[26972]);
  }
  return;
}
/* CD2LB.R: subroutine cdclrl */
function R_cdclrl($p0,$p1){
  I[26980]=((((I[($p0)>>2]+I[($p1)>>2])|0)-1)|0);
  if((I[26980]>0)){
    R_cdclra($p0,(I[26981]=1,107924),107920,105824);
  }
  return;
}
/* CD2LB.R: function cdcols */
function R_cdcols($p0){
  I[26982]=I[26456];
  return I[26982];
  return I[26982];
}
/* CD2LB.R: subroutine cddefont */
function R_cddefont($p0,$p1){
  I[27367]=((B[$p0]+1)|0);
  I[(($p1+(1-1)*4))>>2]=(((I[((107932+(I[27367]-1)*4))>>2]&1)!==0)?-1:0);
  I[(($p1+(2-1)*4))>>2]=(((I[((108188+(I[27367]-1)*4))>>2]&1)!==0)?-1:0);
  I[(($p1+(3-1)*4))>>2]=(((I[((108444+(I[27367]-1)*4))>>2]&1)!==0)?-1:0);
  I[(($p1+(4-1)*4))>>2]=(((I[((108700+(I[27367]-1)*4))>>2]&1)!==0)?-1:0);
  I[(($p1+(5-1)*4))>>2]=(((I[((108956+(I[27367]-1)*4))>>2]&1)!==0)?-1:0);
  I[(($p1+(6-1)*4))>>2]=(((I[((109212+(I[27367]-1)*4))>>2]&1)!==0)?-1:0);
  return;
}
/* CD2LB.R: subroutine cdend */
function R_cdend(){
  if(((I[26896]!==5000)&&(I[26931]!==5000))){
    R_scokey();
  }
  if((I[26929]!==5000)){
    if(((I[24425]!==I[26455])||(I[24426]!==1))){
      R_scmove(105820,(I[27368]=1,109472));
    }
  }
  R_scend();
  return;
}
/* CD2LB.R: subroutine cdfill */
function R_cdfill($p0,$p1,$p2){
  I[27369]=1;
  L1:for(;(I[27369]<=I[($p2)>>2]);I[27369]=((I[27369]+1)|0)){
    B[($p1+I[27369]-1)]=B[$p0];
  }
}
/* CD2LB.R: subroutine cdfont */
function R_cdfont($p0){
  B[105833]=B[$p0];
  return;
}
/* CD2LB.R: function cdgetn */
function* R_cdgetn($p0,$p1,$p2,$p3){
  if(((yield* R_cdgets($p0,$p1,$p2,109484,(I[27394]=90,109576)))===((-3)|0))){
    I[27370]=((-3)|0);
    return I[27370];
  }
  I[27395]=1;
  I[($p3)>>2]=H.ctoi(109484,109580);
  I[27370]=((-2)|0);
  return I[27370];
  return I[27370];
}
/* CD2LB.R: function cdgets */
function* R_cdgets($p0,$p1,$p2,$p3,$p4){
  B[109592]=(yield* R_cdgetx($p0,$p1,$p2,109584,$p3,$p4));
  if((H.length($p3)===0)){
    I[27397]=((-3)|0);
  }else{
    I[27397]=((-2)|0);
  }
  return I[27397];
  return I[27397];
}
/* CD2LB.R: function cdgetx */
function* R_cdgetx($p0,$p1,$p2,$p3,$p4,$p5){
  B[($p4+1-1)]=0;
  B[109593]=(yield* R_cdgetp($p0,$p1,$p2,$p3,$p4,$p5));
  return B[109593];
  return B[109593];
}
/* CD2LB.R: function cdgetp */
function* R_cdgetp($p0,$p1,$p2,$p3,$p4,$p5){
  R_cdputs($p0,$p1,$p2);
  I[27399]=((I[($p2)>>2]+H.length($p0))|0);
  R_cdputs($p4,$p1,109596);
  I[27400]=H.length($p4);
  I[27401]=((I[27399]+I[27400])|0);
  if((((I[26595]&1)!==0)&&(I[($p1)>>2]===I[26455]))){
    I[27402]=((I[26456]-1)|0);
  }else{
    I[27402]=I[26456];
  }
  I[27403]=Math.min(I[($p5)>>2],((((I[26456]-I[27399])|0)+1)|0));
  L1:for(;;){
    B[($p4+Math.min(((I[27400]+1)|0),I[27403])-1)]=0;
    R_cdmove($p1,109604);
    R_cdplay((I[27404]=(true?-1:0),109616));
    B[109620]=(yield* H.iogchar(109620));
    if((B[($p3+1-1)]!==0)){
      if((H.index($p3,109620)!==0)){
        break L1;
      }else{
        if((B[109620]===13)){
          break L1;
        }
      }
    }
    if(((B[109620]===8)||(B[109620]===127))){
      if((I[27400]>0)){
        I[27400]=((I[27400]-1)|0);
        I[27401]=((I[27401]-1)|0);
        R_cdclra($p1,109604,$p1,109604);
      }
    }else{
      if((B[109620]===23)){
        if((I[27400]>0)){
          I[27402]=I[27401];
          L2:while((I[27400]>0)){
            if((B[($p4+I[27400]-1)]===32)){
              I[27401]=((I[27401]-1)|0);
              I[27400]=((I[27400]-1)|0);
            }else{
              break L2;
            }
          }
          L3:while((I[27400]>0)){
            if((B[($p4+I[27400]-1)]===32)){
              break L3;
            }else{
              I[27401]=((I[27401]-1)|0);
              I[27400]=((I[27400]-1)|0);
            }
          }
          if((I[27401]<I[27402])){
            R_cdclra($p1,109604,$p1,(I[27406]=((I[27402]-1)|0),109624));
          }
        }
      }else{
        if(((B[109620]===21)||(B[109620]===24))){
          if((I[27400]>0)){
            R_cdclra($p1,109596,$p1,(I[27407]=((I[27401]-1)|0),109628));
            I[27401]=I[27399];
            I[27400]=0;
          }
        }else{
          if((B[109620]===12)){
            R_cdredo();
          }else{
            if((!((R_scdisp(109620))?true:false))){
              R_iobeep();
            }else{
              if((((I[27400]+1)|0)<I[27403])){
                I[27400]=((I[27400]+1)|0);
                B[($p4+I[27400]-1)]=B[109620];
                R_cdput(109620,$p1,109604);
                I[27401]=((I[27401]+1)|0);
              }else{
                R_iobeep();
              }
            }
          }
        }
      }
    }
  }
  B[($p4+Math.min(((I[27400]+1)|0),I[27403])-1)]=0;
  B[109594]=B[109620];
  return B[109594];
  return B[109594];
}
/* CD2LB.R: function cdgfont */
function R_cdgfont($p0){
  B[109632]=B[105833];
  return B[109632];
  return B[109632];
}
/* CD2LB.R: subroutine cdgoto */
function R_cdgoto($p0,$p1){
  if(((I[($p0)>>2]===I[24425])&&(I[($p1)>>2]===I[24426]))){
    return;
  }
  I[27409]=65;
  I[27410]=I[26929];
  I[27411]=((I[((104596+(((I[($p1)>>2]-I[24426])|0)+80)*4))>>2]+I[((105240+(((I[($p0)>>2]-I[24425])|0)+40)*4))>>2])|0);
  if((I[27411]<=I[27410])){
    I[27409]=82;
    I[27410]=I[27411];
  }
  if((I[24426]!==1)){
    I[27411]=((I[26887]+((I[((104596+(((I[($p1)>>2]-1)|0)+80)*4))>>2]+I[((105240+(((I[($p0)>>2]-I[24425])|0)+40)*4))>>2])|0))|0);
    if((I[27411]<=I[27410])){
      I[27409]=78;
      I[27410]=I[27411];
    }
    if((I[24425]!==1)){
      I[27411]=((I[26894]+((I[((104596+(((I[($p1)>>2]-1)|0)+80)*4))>>2]+I[((105240+(((I[($p0)>>2]-1)|0)+40)*4))>>2])|0))|0);
      if((I[27411]<=I[27410])){
        I[27409]=72;
        I[27410]=I[27411];
      }
    }
  }
  if((I[27409]===65)){
    R_scmove($p0,$p1);
  }else{
    if((I[27409]===78)){
      R_scbol();
      I[24426]=1;
    }else{
      if((I[27409]===72)){
        R_schome();
        I[24425]=1;
        I[24426]=1;
      }
    }
    if((I[($p1)>>2]<I[24426])){
      R_scleft((I[27412]=((I[24426]-I[($p1)>>2])|0),109648));
    }else{
      if((I[($p1)>>2]>I[24426])){
        I[27413]=I[24426];
        L1:for(;(I[27413]<I[($p1)>>2]);I[27413]=((I[27413]+1)|0)){
          if((B[105832]===B[(94500+I[27413]+Math.imul(I[24425],80)-81)])){
            R_cdcput((91140+I[27413]+Math.imul(I[24425],80)-81),(94500+I[27413]+Math.imul(I[24425],80)-81));
          }else{
            R_scright((I[27414]=1,109656));
          }
        }
      }
    }
    if((I[($p0)>>2]<I[24425])){
      R_scup((I[27415]=((I[24425]-I[($p0)>>2])|0),109660));
    }else{
      if((I[($p0)>>2]>I[24425])){
        R_scdown((I[27416]=((I[($p0)>>2]-I[24425])|0),109664));
      }
    }
  }
  I[24425]=I[($p0)>>2];
  I[24426]=I[($p1)>>2];
  return;
}
/* CD2LB.R: subroutine cdicll */
function R_cdicll($p0,$p1){
  I[27417]=I[($p0)>>2];
  L1:for(;(I[27417]<=I[($p1)>>2]);I[27417]=((I[27417]+1)|0)){
    R_cdfill((I[27418]=32,109672),(91140+1+Math.imul(I[27417],80)-81),105824);
    R_cdfill((I[27419]=0,109676),(94500+1+Math.imul(I[27417],80)-81),105824);
    I[((104436+(I[27417]-1)*4))>>2]=(true?-1:0);
    I[((94340+(I[27417]-1)*4))>>2]=0;
    I[((104276+(I[27417]-1)*4))>>2]=1;
  }
  return;
}
/* CD2LB.R: subroutine cdinit */
function R_cdinit(){
  R_scinit();
  if(((I[26598]&1)!==0)){
    R_scend();
    H.error(109684);
  }
  if(((I[26929]===5000)&&(((((I[26894]===5000)||(I[26928]===5000))||(I[26932]===5000))||(I[26936]===5000))||(I[26893]===5000)))){
    R_scend();
    H.error(109733);
  }
  if((I[26890]===5000)){
    R_scend();
    H.error(109798);
  }
  if(((I[26896]!==5000)&&(I[26931]!==5000))){
    R_scikey();
  }
  I[27462]=((-80)|0);
  L1:for(;(I[27462]<=0);I[27462]=((I[27462]+1)|0)){
    I[((104596+(I[27462]+80)*4))>>2]=((-Math.imul(I[27462],I[26928]))|0);
  }
  I[27462]=1;
  L2:for(;(I[27462]<=80);I[27462]=((I[27462]+1)|0)){
    I[((104596+(I[27462]+80)*4))>>2]=I[27462];
  }
  I[27462]=((-40)|0);
  L3:for(;(I[27462]<=0);I[27462]=((I[27462]+1)|0)){
    I[((105240+(I[27462]+40)*4))>>2]=((-Math.imul(I[27462],I[26936]))|0);
  }
  I[27462]=1;
  L4:for(;(I[27462]<=40);I[27462]=((I[27462]+1)|0)){
    I[((105240+(I[27462]+40)*4))>>2]=Math.imul(I[27462],I[26893]);
  }
  I[27420]=0;
  L5:for(;(I[27420]<256);I[27420]=((I[27420]+1)|0)){
    if(((R_scdisp(109680))?true:false)){
      B[(105564+((I[27420]+1)|0)-1)]=B[109680];
    }else{
      B[(105564+((I[27420]+1)|0)-1)]=127;
    }
  }
  I[26456]=Math.min(I[26466],80);
  I[26455]=Math.min(I[26464],40);
  B[105832]=0;
  R_cdredo();
  B[105833]=0;
  R_cdclear();
  I[27462]=1;
  L6:for(;(I[27462]<=I[26455]);I[27462]=((I[27462]+1)|0)){
    I[((104436+(I[27462]-1)*4))>>2]=(false?-1:0);
    I[((104276+(I[27462]-1)*4))>>2]=((I[26456]+1)|0);
  }
  I[26067]=1;
  I[26068]=1;
  return;
}
/* CD2LB.R: subroutine cdline */
function R_cdline($p0,$p1,$p2,$p3){
  if((I[($p0)>>2]===I[($p2)>>2])){
    if((I[($p1)>>2]<I[($p3)>>2])){
      R_cdlsr($p0,$p1);
      I[27463]=((I[($p1)>>2]+1)|0);
      L1:for(;(I[27463]<I[($p3)>>2]);I[27463]=((I[27463]+1)|0)){
        R_cdlsrl($p0,109852);
      }
      R_cdlsl($p0,$p3);
    }else{
      if((I[($p1)>>2]>I[($p3)>>2])){
        R_cdlsr($p0,$p3);
        I[27463]=((I[($p3)>>2]+1)|0);
        L2:for(;(I[27463]<I[($p1)>>2]);I[27463]=((I[27463]+1)|0)){
          R_cdlsrl($p0,109852);
        }
        R_cdlsl($p0,$p1);
      }
    }
  }else{
    if((I[($p1)>>2]===I[($p3)>>2])){
      if((I[($p0)>>2]<I[($p2)>>2])){
        R_cdlsd($p0,$p1);
        I[27463]=((I[($p0)>>2]+1)|0);
        L3:for(;(I[27463]<I[($p2)>>2]);I[27463]=((I[27463]+1)|0)){
          R_cdlsud(109852,$p1);
        }
        R_cdlsu($p2,$p1);
      }else{
        if((I[($p0)>>2]>I[($p2)>>2])){
          R_cdlsd($p2,$p1);
          I[27463]=((I[($p2)>>2]+1)|0);
          L4:for(;(I[27463]<I[($p0)>>2]);I[27463]=((I[27463]+1)|0)){
            R_cdlsud(109852,$p1);
          }
          R_cdlsu($p0,$p1);
        }
      }
    }
  }
  return;
}
/* CD2LB.R: function cdlins */
function R_cdlins($p0){
  I[27464]=I[26455];
  return I[27464];
  return I[27464];
}
/* CD2LB.R: subroutine cdlsd */
function R_cdlsd($p0,$p1){
  if(((((1<=I[($p0)>>2])&&(I[($p0)>>2]<=I[26455]))&&(1<=I[($p1)>>2]))&&(I[($p1)>>2]<=I[26456]))){
    S1:switch(B[(97708+I[($p1)>>2]+Math.imul(I[($p0)>>2],80)-81)]){
      case 1:{
        B[109860]=1;
        break S1;
      }
      case 2:{
        B[109860]=3;
        break S1;
      }
      case 3:{
        B[109860]=3;
        break S1;
      }
      case 4:{
        B[109860]=5;
        break S1;
      }
      case 5:{
        B[109860]=5;
        break S1;
      }
      case 6:{
        B[109860]=7;
        break S1;
      }
      case 7:{
        B[109860]=7;
        break S1;
      }
      case 8:{
        B[109860]=9;
        break S1;
      }
      case 9:{
        B[109860]=9;
        break S1;
      }
      case 10:{
        B[109860]=11;
        break S1;
      }
      case 11:{
        B[109860]=11;
        break S1;
      }
      case 12:{
        B[109860]=13;
        break S1;
      }
      case 13:{
        B[109860]=13;
        break S1;
      }
      case 14:{
        B[109860]=15;
        break S1;
      }
      case 15:{
        B[109860]=15;
        break S1;
      }
      default:{
        B[109860]=1;
      }
    }
    B[(97708+I[($p1)>>2]+Math.imul(I[($p0)>>2],80)-81)]=B[109860];
    B[(101068+I[($p1)>>2]+Math.imul(I[($p0)>>2],80)-81)]=0;
    I[((104436+(I[($p0)>>2]-1)*4))>>2]=(true?-1:0);
    I[((100908+(I[($p0)>>2]-1)*4))>>2]=Math.max(I[((100908+(I[($p0)>>2]-1)*4))>>2],I[($p1)>>2]);
    I[((104276+(I[($p0)>>2]-1)*4))>>2]=Math.min(I[((104276+(I[($p0)>>2]-1)*4))>>2],I[($p1)>>2]);
  }
  return;
}
/* CD2LB.R: subroutine cdlsl */
function R_cdlsl($p0,$p1){
  if(((((1<=I[($p0)>>2])&&(I[($p0)>>2]<=I[26455]))&&(1<=I[($p1)>>2]))&&(I[($p1)>>2]<=I[26456]))){
    S1:switch(B[(97708+I[($p1)>>2]+Math.imul(I[($p0)>>2],80)-81)]){
      case 1:{
        B[109861]=3;
        break S1;
      }
      case 2:{
        B[109861]=2;
        break S1;
      }
      case 3:{
        B[109861]=3;
        break S1;
      }
      case 4:{
        B[109861]=6;
        break S1;
      }
      case 5:{
        B[109861]=7;
        break S1;
      }
      case 6:{
        B[109861]=6;
        break S1;
      }
      case 7:{
        B[109861]=7;
        break S1;
      }
      case 8:{
        B[109861]=10;
        break S1;
      }
      case 9:{
        B[109861]=11;
        break S1;
      }
      case 10:{
        B[109861]=10;
        break S1;
      }
      case 11:{
        B[109861]=11;
        break S1;
      }
      case 12:{
        B[109861]=14;
        break S1;
      }
      case 13:{
        B[109861]=15;
        break S1;
      }
      case 14:{
        B[109861]=14;
        break S1;
      }
      case 15:{
        B[109861]=15;
        break S1;
      }
      default:{
        B[109861]=2;
      }
    }
    B[(97708+I[($p1)>>2]+Math.imul(I[($p0)>>2],80)-81)]=B[109861];
    B[(101068+I[($p1)>>2]+Math.imul(I[($p0)>>2],80)-81)]=0;
    I[((104436+(I[($p0)>>2]-1)*4))>>2]=(true?-1:0);
    I[((100908+(I[($p0)>>2]-1)*4))>>2]=Math.max(I[((100908+(I[($p0)>>2]-1)*4))>>2],I[($p1)>>2]);
    I[((104276+(I[($p0)>>2]-1)*4))>>2]=Math.min(I[((104276+(I[($p0)>>2]-1)*4))>>2],I[($p1)>>2]);
  }
  return;
}
/* CD2LB.R: subroutine cdlsr */
function R_cdlsr($p0,$p1){
  if(((((1<=I[($p0)>>2])&&(I[($p0)>>2]<=I[26455]))&&(1<=I[($p1)>>2]))&&(I[($p1)>>2]<=I[26456]))){
    S1:switch(B[(97708+I[($p1)>>2]+Math.imul(I[($p0)>>2],80)-81)]){
      case 1:{
        B[109862]=9;
        break S1;
      }
      case 2:{
        B[109862]=10;
        break S1;
      }
      case 3:{
        B[109862]=11;
        break S1;
      }
      case 4:{
        B[109862]=12;
        break S1;
      }
      case 5:{
        B[109862]=13;
        break S1;
      }
      case 6:{
        B[109862]=14;
        break S1;
      }
      case 7:{
        B[109862]=15;
        break S1;
      }
      case 8:{
        B[109862]=8;
        break S1;
      }
      case 9:{
        B[109862]=9;
        break S1;
      }
      case 10:{
        B[109862]=10;
        break S1;
      }
      case 11:{
        B[109862]=11;
        break S1;
      }
      case 12:{
        B[109862]=12;
        break S1;
      }
      case 13:{
        B[109862]=13;
        break S1;
      }
      case 14:{
        B[109862]=14;
        break S1;
      }
      case 15:{
        B[109862]=15;
        break S1;
      }
      default:{
        B[109862]=8;
      }
    }
    B[(97708+I[($p1)>>2]+Math.imul(I[($p0)>>2],80)-81)]=B[109862];
    B[(101068+I[($p1)>>2]+Math.imul(I[($p0)>>2],80)-81)]=0;
    I[((104436+(I[($p0)>>2]-1)*4))>>2]=(true?-1:0);
    I[((100908+(I[($p0)>>2]-1)*4))>>2]=Math.max(I[((100908+(I[($p0)>>2]-1)*4))>>2],I[($p1)>>2]);
    I[((104276+(I[($p0)>>2]-1)*4))>>2]=Math.min(I[((104276+(I[($p0)>>2]-1)*4))>>2],I[($p1)>>2]);
  }
  return;
}
/* CD2LB.R: subroutine cdlsrl */
function R_cdlsrl($p0,$p1){
  if(((((1<=I[($p0)>>2])&&(I[($p0)>>2]<=I[26455]))&&(1<=I[($p1)>>2]))&&(I[($p1)>>2]<=I[26456]))){
    S1:switch(B[(97708+I[($p1)>>2]+Math.imul(I[($p0)>>2],80)-81)]){
      case 1:{
        B[109863]=11;
        break S1;
      }
      case 2:{
        B[109863]=10;
        break S1;
      }
      case 3:{
        B[109863]=11;
        break S1;
      }
      case 4:{
        B[109863]=14;
        break S1;
      }
      case 5:{
        B[109863]=15;
        break S1;
      }
      case 6:{
        B[109863]=14;
        break S1;
      }
      case 7:{
        B[109863]=15;
        break S1;
      }
      case 8:{
        B[109863]=10;
        break S1;
      }
      case 9:{
        B[109863]=11;
        break S1;
      }
      case 10:{
        B[109863]=10;
        break S1;
      }
      case 11:{
        B[109863]=11;
        break S1;
      }
      case 12:{
        B[109863]=14;
        break S1;
      }
      case 13:{
        B[109863]=15;
        break S1;
      }
      case 14:{
        B[109863]=14;
        break S1;
      }
      case 15:{
        B[109863]=15;
        break S1;
      }
      default:{
        B[109863]=10;
      }
    }
    B[(97708+I[($p1)>>2]+Math.imul(I[($p0)>>2],80)-81)]=B[109863];
    B[(101068+I[($p1)>>2]+Math.imul(I[($p0)>>2],80)-81)]=0;
    I[((104436+(I[($p0)>>2]-1)*4))>>2]=(true?-1:0);
    I[((100908+(I[($p0)>>2]-1)*4))>>2]=Math.max(I[((100908+(I[($p0)>>2]-1)*4))>>2],I[($p1)>>2]);
    I[((104276+(I[($p0)>>2]-1)*4))>>2]=Math.min(I[((104276+(I[($p0)>>2]-1)*4))>>2],I[($p1)>>2]);
  }
  return;
}
/* CD2LB.R: subroutine cdlsu */
function R_cdlsu($p0,$p1){
  if(((((1<=I[($p0)>>2])&&(I[($p0)>>2]<=I[26455]))&&(1<=I[($p1)>>2]))&&(I[($p1)>>2]<=I[26456]))){
    S1:switch(B[(97708+I[($p1)>>2]+Math.imul(I[($p0)>>2],80)-81)]){
      case 1:{
        B[109864]=5;
        break S1;
      }
      case 2:{
        B[109864]=6;
        break S1;
      }
      case 3:{
        B[109864]=7;
        break S1;
      }
      case 4:{
        B[109864]=4;
        break S1;
      }
      case 5:{
        B[109864]=5;
        break S1;
      }
      case 6:{
        B[109864]=6;
        break S1;
      }
      case 7:{
        B[109864]=7;
        break S1;
      }
      case 8:{
        B[109864]=12;
        break S1;
      }
      case 9:{
        B[109864]=13;
        break S1;
      }
      case 10:{
        B[109864]=14;
        break S1;
      }
      case 11:{
        B[109864]=15;
        break S1;
      }
      case 12:{
        B[109864]=12;
        break S1;
      }
      case 13:{
        B[109864]=13;
        break S1;
      }
      case 14:{
        B[109864]=14;
        break S1;
      }
      case 15:{
        B[109864]=15;
        break S1;
      }
      default:{
        B[109864]=4;
      }
    }
    B[(97708+I[($p1)>>2]+Math.imul(I[($p0)>>2],80)-81)]=B[109864];
    B[(101068+I[($p1)>>2]+Math.imul(I[($p0)>>2],80)-81)]=0;
    I[((104436+(I[($p0)>>2]-1)*4))>>2]=(true?-1:0);
    I[((100908+(I[($p0)>>2]-1)*4))>>2]=Math.max(I[((100908+(I[($p0)>>2]-1)*4))>>2],I[($p1)>>2]);
    I[((104276+(I[($p0)>>2]-1)*4))>>2]=Math.min(I[((104276+(I[($p0)>>2]-1)*4))>>2],I[($p1)>>2]);
  }
  return;
}
/* CD2LB.R: subroutine cdlsud */
function R_cdlsud($p0,$p1){
  if(((((1<=I[($p0)>>2])&&(I[($p0)>>2]<=I[26455]))&&(1<=I[($p1)>>2]))&&(I[($p1)>>2]<=I[26456]))){
    S1:switch(B[(97708+I[($p1)>>2]+Math.imul(I[($p0)>>2],80)-81)]){
      case 1:{
        B[109865]=5;
        break S1;
      }
      case 2:{
        B[109865]=7;
        break S1;
      }
      case 3:{
        B[109865]=7;
        break S1;
      }
      case 4:{
        B[109865]=5;
        break S1;
      }
      case 5:{
        B[109865]=5;
        break S1;
      }
      case 6:{
        B[109865]=7;
        break S1;
      }
      case 7:{
        B[109865]=7;
        break S1;
      }
      case 8:{
        B[109865]=13;
        break S1;
      }
      case 9:{
        B[109865]=13;
        break S1;
      }
      case 10:{
        B[109865]=15;
        break S1;
      }
      case 11:{
        B[109865]=15;
        break S1;
      }
      case 12:{
        B[109865]=13;
        break S1;
      }
      case 13:{
        B[109865]=13;
        break S1;
      }
      case 14:{
        B[109865]=15;
        break S1;
      }
      case 15:{
        B[109865]=15;
        break S1;
      }
      default:{
        B[109865]=5;
      }
    }
    B[(97708+I[($p1)>>2]+Math.imul(I[($p0)>>2],80)-81)]=B[109865];
    B[(101068+I[($p1)>>2]+Math.imul(I[($p0)>>2],80)-81)]=0;
    I[((104436+(I[($p0)>>2]-1)*4))>>2]=(true?-1:0);
    I[((100908+(I[($p0)>>2]-1)*4))>>2]=Math.max(I[((100908+(I[($p0)>>2]-1)*4))>>2],I[($p1)>>2]);
    I[((104276+(I[($p0)>>2]-1)*4))>>2]=Math.min(I[((104276+(I[($p0)>>2]-1)*4))>>2],I[($p1)>>2]);
  }
  return;
}
/* CD2LB.R: subroutine cdmove */
function R_cdmove($p0,$p1){
  if(((I[($p0)>>2]>=1)&&(I[($p0)>>2]<=I[26455]))){
    I[26067]=I[($p0)>>2];
  }
  if(((I[($p1)>>2]>=1)&&(I[($p1)>>2]<=I[26456]))){
    I[26068]=I[($p1)>>2];
  }
  return;
}
/* CD2LB.R: subroutine cdmovtc */
function R_cdmovtc($p0,$p1,$p2,$p3){
  I[27468]=1;
  L1:for(;(I[27468]<=I[($p3)>>2]);I[27468]=((I[27468]+1)|0)){
    I[27467]=0;
    B[109868]=B[($p0+I[27468]-1)];
    B[($p1+I[27468]-1)]=B[($p2+((I[27467]+1)|0)-1)];
  }
  return;
}
/* CD2LB.R: function cdnotfont */
function R_cdnotfont($p0){
  B[109876]=(~B[$p0]);
  return B[109876];
  return B[109876];
}
/* CD2LB.R: function cdnulfont */
function R_cdnulfont($p0){
  B[109877]=0;
  return B[109877];
  return B[109877];
}
/* CD2LB.R: subroutine cdoffatt */
function R_cdoffatt($p0){
  B[109878]=B[105833];
  B[105833]=R_cdandfont(109878,(I[27471]=R_cdnotfont((I[27470]=R_cdsngfont($p0),109880)),109884));
  return;
}
/* CD2LB.R: subroutine cdonatt */
function R_cdonatt($p0){
  B[109888]=B[105833];
  B[105833]=R_cdorfont(109888,(I[27473]=R_cdsngfont($p0),109892));
  return;
}
/* CD2LB.R: function cdorfont */
function R_cdorfont($p0,$p1){
  B[109896]=(B[$p0]|B[$p1]);
  return B[109896];
  return B[109896];
}
/* CD2LB.R: subroutine cdplay */
function R_cdplay($p0){
  if(((I[($p0)>>2]&1)!==0)){
    if(((H.iochav((I[27475]=0,109900)))?true:false)){
      return;
    }
  }
  if(((I[26595]&1)!==0)){
    B[(97708+I[26456]+Math.imul(I[26455],80)-81)]=32;
    B[(101068+I[26456]+Math.imul(I[26455],80)-81)]=0;
    I[((100908+(I[26455]-1)*4))>>2]=Math.min(I[((100908+(I[26455]-1)*4))>>2],((I[26456]-1)|0));
  }
  I[27476]=I[26457];
  L1:do{
    if(((I[((104436+(I[27476]-1)*4))>>2]&1)!==0)){
      if(((I[($p0)>>2]&1)!==0)){
        if(((H.iochav((I[27477]=0,109908)))?true:false)){
          I[26457]=I[27476];
          return;
        }
      }
      R_cdupl(109904);
      I[((104436+(I[27476]-1)*4))>>2]=(false?-1:0);
    }
    I[27476]=((I[27476]+1)|0);
    if((I[27476]>I[26455])){
      I[27476]=1;
    }
  }while(!((I[27476]===I[26457])));
  R_cdgoto(104268,104272);
  H.ioflush();
  I[26457]=1;
  return;
}
/* CD2LB.R: subroutine cdput */
function R_cdput($p0,$p1,$p2){
  if(((((I[($p2)>>2]<1)||(I[($p2)>>2]>I[26456]))||(I[($p1)>>2]<1))||(I[($p1)>>2]>I[26455]))){
    return;
  }
  R_cdmovtc($p0,(97708+I[($p2)>>2]+Math.imul(I[($p1)>>2],80)-81),105564,(I[27478]=1,109912));
  B[(101068+I[($p2)>>2]+Math.imul(I[($p1)>>2],80)-81)]=B[105833];
  I[((104436+(I[($p1)>>2]-1)*4))>>2]=(true?-1:0);
  I[((100908+(I[($p1)>>2]-1)*4))>>2]=Math.max(I[((100908+(I[($p1)>>2]-1)*4))>>2],I[($p2)>>2]);
  I[((104276+(I[($p1)>>2]-1)*4))>>2]=Math.min(I[((104276+(I[($p1)>>2]-1)*4))>>2],I[($p2)>>2]);
  return;
}
/* CD2LB.R: subroutine cdputc */
function R_cdputc($p0,$p1){
  R_cdputs($p0,$p1,(I[27479]=$idiv(((I[26456]-H.length($p0))|0),2),109916));
  return;
}
/* CD2LB.R: subroutine cdputn */
function R_cdputn($p0,$p1,$p2,$p3){
  H.prints(109920,109940,$p1);
  H.prints(109946,109920,$p0);
  R_cdputs(109946,$p2,$p3);
  return;
}
/* CD2LB.R: subroutine cdputr */
function R_cdputr($p0,$p1,$p2,$p3){
  H.prints(110036,110056,$p1);
  H.prints(110062,110036,$p0);
  R_cdputs(110062,$p2,$p3);
  return;
}
/* CD2LB.R: subroutine cdputs */
function R_cdputs($p0,$p1,$p2){
  if(((I[($p1)>>2]<1)||(I[($p1)>>2]>I[26455]))){
    return;
  }
  I[27538]=Math.max(1,I[($p2)>>2]);
  I[27539]=Math.min(I[26456],((((H.length($p0)+I[($p2)>>2])|0)-1)|0));
  I[27540]=((((I[27539]-I[27538])|0)+1)|0);
  if((I[27540]<=0)){
    return;
  }
  I[27541]=((((I[27538]-I[($p2)>>2])|0)+1)|0);
  R_cdmovtc(($p0+I[27541]-1),(97708+I[27538]+Math.imul(I[($p1)>>2],80)-81),105564,110160);
  R_cdfill(105833,(101068+I[27538]+Math.imul(I[($p1)>>2],80)-81),110160);
  I[((104436+(I[($p1)>>2]-1)*4))>>2]=(true?-1:0);
  I[((100908+(I[($p1)>>2]-1)*4))>>2]=Math.max(I[((100908+(I[($p1)>>2]-1)*4))>>2],I[27539]);
  I[((104276+(I[($p1)>>2]-1)*4))>>2]=Math.min(I[((104276+(I[($p1)>>2]-1)*4))>>2],I[27538]);
  return;
}
/* CD2LB.R: subroutine cdredo */
function R_cdredo(){
  R_scclear();
  R_cdicll((I[27542]=1,110168),105820);
  I[24425]=1;
  I[24426]=1;
  I[26457]=1;
  return;
}
/* CD2LB.R: subroutine cdsetfont */
function R_cdsetfont($p0){
  R_cddefont($p0,112936);
  I[28240]=1;
  L1:for(;(I[28240]<=6);I[28240]=((I[28240]+1)|0)){
    if((((I[((112936+(I[28240]-1)*4))>>2]&1)!==0)&&((I[((107268+(I[28240]-1)*4))>>2]&1)!==0))){
      R_sconatt(112960);
    }else{
      R_scoffatt(112960);
    }
  }
  R_scattset(110196);
  B[105832]=B[$p0];
}
/* CD2LB.R: function cdsngfont */
function R_cdsngfont($p0){
  S1:switch(I[($p0)>>2]){
    case 1:{
      B[112965]=1;
      break S1;
    }
    case 2:{
      B[112965]=2;
      break S1;
    }
    case 3:{
      B[112965]=4;
      break S1;
    }
    case 4:{
      B[112965]=8;
      break S1;
    }
    case 5:{
      B[112965]=16;
      break S1;
    }
    case 6:{
      B[112965]=32;
      break S1;
    }
    default:{
      B[112965]=0;
    }
  }
  B[112964]=B[112965];
  return B[112964];
  return B[112964];
}
/* CD2LB.R: subroutine cdupl */
function R_cdupl($p0){
  if((I[26888]===5000)){
    I[((100908+(I[($p0)>>2]-1)*4))>>2]=Math.max(I[((100908+(I[($p0)>>2]-1)*4))>>2],I[((94340+(I[($p0)>>2]-1)*4))>>2]);
  }
  I[28242]=I[((104276+(I[($p0)>>2]-1)*4))>>2];
  L1:for(;(I[28242]<=I[((100908+(I[($p0)>>2]-1)*4))>>2]);I[28242]=((I[28242]+1)|0)){
    if((B[(97708+I[28242]+Math.imul(I[($p0)>>2],80)-81)]!==B[(91140+I[28242]+Math.imul(I[($p0)>>2],80)-81)])){
      R_cdaput((97708+I[28242]+Math.imul(I[($p0)>>2],80)-81),(101068+I[28242]+Math.imul(I[($p0)>>2],80)-81),$p0,112968);
      continue L1;
    }
    if((B[(101068+I[28242]+Math.imul(I[($p0)>>2],80)-81)]===B[(94500+I[28242]+Math.imul(I[($p0)>>2],80)-81)])){
      continue L1;
    }
    R_cdaput((97708+I[28242]+Math.imul(I[($p0)>>2],80)-81),(101068+I[28242]+Math.imul(I[($p0)>>2],80)-81),$p0,112968);
  }
  if((I[((100908+(I[($p0)>>2]-1)*4))>>2]<I[((94340+(I[($p0)>>2]-1)*4))>>2])){
    R_cdacel($p0,(I[28243]=((I[((100908+(I[($p0)>>2]-1)*4))>>2]+1)|0),112972));
  }
  I[((94340+(I[($p0)>>2]-1)*4))>>2]=I[((100908+(I[($p0)>>2]-1)*4))>>2];
  I[((104276+(I[($p0)>>2]-1)*4))>>2]=((I[26456]+1)|0);
  return;
}
/* SCLB.R: subroutine scinit */
function R_scinit(){
  R_sclinit((I[28244]=(false?-1:0),112976));
  return;
}
/* SCLB.R: subroutine sclinit */
function R_sclinit($p0){
  if((H.envget(112980,112985)!==((-2)|0))){
    if((!((I[($p0)>>2]&1)!==0))){
      H.error(113017);
    }else{
      R_scsetup((I[28264]=(true?-1:0),113056));
      R_screinit();
      H.ioflush();
      return;
    }
  }
  R_sctermcap(113060);
  if((R_enopen(113060)!==((-2)|0))){
    if((!((I[($p0)>>2]&1)!==0))){
      H.fprintf(113192,113196,113060);
      H.error(72976);
    }else{
      R_scsetup((I[28308]=(true?-1:0),113232));
      R_screinit();
      H.ioflush();
      return;
    }
  }
  L1:for(;;){
    if((R_engetnext((I[28309]=0,113236))===((-1)|0))){
      if((!((I[($p0)>>2]&1)!==0))){
        H.fprintf(113192,113240,112985);
        H.error(72976);
      }else{
        R_scsetup((I[28319]=(true?-1:0),113276));
        R_screinit();
        H.ioflush();
        return;
      }
    }
    if((R_enfldn((I[28320]=2,113280),113284,(I[28354]=132,113416))!==((-2)|0))){
      H.error(113420);
    }
    I[28361]=1;
    L2:while((B[(113284+I[28361]-1)]!==0)){
      I[28362]=1;
      L3:while((B[(112985+I[28362]-1)]===B[(113284+I[28361]-1)])){
        I[28362]=((I[28362]+1)|0);
        I[28361]=((I[28361]+1)|0);
        if((((B[(113284+I[28361]-1)]===124)||(B[(113284+I[28361]-1)]===0))&&(B[(112985+I[28362]-1)]===0))){
          break L1;
        }
      }
      L4:for(;(B[(113284+I[28361]-1)]!==124);I[28361]=((I[28361]+1)|0)){
        if((B[(113284+I[28361]-1)]===0)){
          continue L1;
        }
      }
      I[28361]=((I[28361]+1)|0);
    }
  }
  R_enclose();
  R_scsetup((I[28363]=(false?-1:0),113452));
  R_screinit();
  H.ioflush();
  return;
}
/* SCLB.R: subroutine scsetup */
function R_scsetup($p0){
  I[26600]=0;
  I[26595]=(false?-1:0);
  I[26886]=5000;
  I[26887]=5000;
  I[27581]=(false?-1:0);
  I[26888]=5000;
  I[26889]=5000;
  I[26890]=5000;
  I[26466]=0;
  I[26891]=5000;
  I[26892]=5000;
  I[26893]=5000;
  I[28367]=1;
  L1:for(;(I[28367]<=16);I[28367]=((I[28367]+1)|0)){
    I[((107752+(I[28367]-1)*4))>>2]=5000;
  }
  I[26598]=(false?-1:0);
  I[26894]=5000;
  I[26895]=5000;
  I[26896]=5000;
  I[26897]=5000;
  I[26898]=5000;
  I[26899]=5000;
  I[26928]=5000;
  I[26464]=0;
  I[26937]=(false?-1:0);
  I[26929]=5000;
  I[27582]=(false?-1:0);
  I[27579]=(false?-1:0);
  I[26930]=5000;
  I[26931]=5000;
  I[26599]=(false?-1:0);
  F[26823]=Math.fround(0.0);
  F[26824]=Math.fround(0.0);
  F[26825]=Math.fround(0.0);
  F[26826]=Math.fround(0.0);
  F[26827]=Math.fround(0.0);
  F[26828]=Math.fround(0.0);
  F[26829]=Math.fround(0.0);
  F[26830]=Math.fround(0.0);
  F[26831]=Math.fround(0.0);
  F[26832]=Math.fround(0.0);
  F[26833]=Math.fround(0.0);
  F[26834]=Math.fround(0.0);
  B[107388]=127;
  I[26932]=5000;
  I[26933]=5000;
  I[26934]=5000;
  I[26935]=5000;
  I[26936]=5000;
  I[27580]=(false?-1:0);
  I[26596]=(false?-1:0);
  I[26597]=(false?-1:0);
  if((!((I[($p0)>>2]&1)!==0))){
    I[28368]=2;
    L2:while((R_scnxtent(113472,113476,113608)===((-2)|0))){
      R_scsu(113476,113608);
    }
  }else{
    R_scsu(113740,113746);
    R_scsu(113749,113755);
    R_scsu(113758,113764);
    R_scsu(113766,72976);
    R_scsu(113773,72976);
  }
  if((I[26887]===5000)){
    B[(111072+1-1)]=13;
    B[(111072+2-1)]=0;
    I[26887]=H.length(111072);
  }
  if((I[26928]===5000)){
    if(((I[27581]&1)!==0)){
      B[(112708+1-1)]=8;
      B[(112708+2-1)]=0;
      I[26928]=H.length(112708);
    }
  }
  if((I[((107752+(16-1)*4))>>2]===5000)){
    R_sccapg(113776,(I[28445]=16,113780));
  }
  if((I[((107752+(1-1)*4))>>2]===5000)){
    R_sccapg(113460,(I[28446]=1,113784));
  }
  if((I[((107752+(2-1)*4))>>2]===5000)){
    R_sccapg(113456,(I[28447]=2,113788));
  }
  if((I[((107752+(3-1)*4))>>2]===5000)){
    R_sccapg(113464,(I[28448]=3,113792));
  }
  if((I[((107752+(4-1)*4))>>2]===5000)){
    R_sccapg(113460,(I[28449]=4,113796));
  }
  if((I[((107752+(5-1)*4))>>2]===5000)){
    R_sccapg(113460,(I[28450]=5,113800));
  }
  if((I[((107752+(6-1)*4))>>2]===5000)){
    R_sccapg(113464,(I[28451]=6,113804));
  }
  if((I[((107752+(7-1)*4))>>2]===5000)){
    R_sccapg(113464,(I[28452]=7,113808));
  }
  if((I[((107752+(8-1)*4))>>2]===5000)){
    R_sccapg(113456,(I[28453]=8,113812));
  }
  if((I[((107752+(9-1)*4))>>2]===5000)){
    R_sccapg(113464,(I[28454]=9,113816));
  }
  if((I[((107752+(10-1)*4))>>2]===5000)){
    R_sccapg(113456,(I[28455]=10,113820));
  }
  if((I[((107752+(11-1)*4))>>2]===5000)){
    R_sccapg(113464,(I[28456]=11,113824));
  }
  if((I[((107752+(12-1)*4))>>2]===5000)){
    R_sccapg(113464,(I[28457]=12,113828));
  }
  if((I[((107752+(13-1)*4))>>2]===5000)){
    R_sccapg(113464,(I[28458]=13,113832));
  }
  if((I[((107752+(14-1)*4))>>2]===5000)){
    R_sccapg(113464,(I[28459]=14,113836));
  }
  if((I[((107752+(15-1)*4))>>2]===5000)){
    R_sccapg(113464,(I[28460]=15,113840));
  }
  I[26463]=Math.min(I[26464],40);
  I[26465]=Math.min(I[26466],80);
  if(((((I[26595]&1)!==0)?-1:0)===(((I[27582]&1)!==0)?-1:0))){
    I[26465]=((I[26465]-1)|0);
  }
  if((I[26929]!==5000)){
    I[26929]=((I[26929]-2)|0);
  }
  I[28367]=0;
  L3:for(;(I[28367]<=31);I[28367]=((I[28367]+1)|0)){
    I[((105868+(((I[28367]+1)|0)-1)*4))>>2]=(false?-1:0);
  }
  I[28367]=32;
  L4:for(;(I[28367]<=126);I[28367]=((I[28367]+1)|0)){
    I[((105868+(((I[28367]+1)|0)-1)*4))>>2]=(true?-1:0);
  }
  I[((105868+(((127+1)|0)-1)*4))>>2]=(false?-1:0);
  if(((I[27579]&1)!==0)){
    I[((105868+(((126+1)|0)-1)*4))>>2]=(false?-1:0);
  }
  if(((I[27580]&1)!==0)){
    I[((105868+(((127+1)|0)-1)*4))>>2]=(true?-1:0);
  }
  H.tsinit();
  H.tsgspeed(107392,107396);
  H.tsend();
  I[26835]=$fix(Math.fround(F[26823]*F[26849]));
  I[26836]=$fix(Math.fround(F[26824]*F[26849]));
  I[26837]=$fix(Math.fround(F[26825]*F[26849]));
  I[26838]=$fix(Math.fround(F[26826]*F[26849]));
  I[26839]=$fix(Math.fround(F[26827]*F[26849]));
  I[26840]=$fix(Math.fround(F[26828]*F[26849]));
  I[26841]=$fix(Math.fround(F[26829]*F[26849]));
  I[26842]=$fix(Math.fround(F[26830]*F[26849]));
  I[26843]=$fix(Math.fround(F[26831]*F[26849]));
  I[26844]=$fix(Math.fround(F[26832]*F[26849]));
  I[26845]=$fix(Math.fround(F[26833]*F[26849]));
  I[26846]=$fix(Math.fround(F[26834]*F[26849]));
  R_scasu();
  I[28367]=1;
  L5:for(;(I[28367]<=6);I[28367]=((I[28367]+1)|0)){
    I[((110172+(I[28367]-1)*4))>>2]=(false?-1:0);
    I[((110196+(I[28367]-1)*4))>>2]=(false?-1:0);
  }
  I[28233]=(false?-1:0);
  H.ioinit();
  I[28227]=0;
  return;
}
/* SCLB.R: subroutine scsu */
function R_scsu($p0,$p1){
  I[28461]=(true?-1:0);
  if(((H.equal($p0,113848))&1)!==0){
    R_sccapa($p1);
  }else{
    if((H.equal($p0,113766)===1)){
      I[26595]=(((R_sccapb($p1))?true:false)?-1:0);
    }else{
      if((H.equal($p0,113758)===1)){
        R_sccaps($p1,111052,107544);
      }else{
        if((H.equal($p0,113853)===1)){
          R_sccaps($p1,111072,107548);
        }else{
          if((H.equal($p0,113773)===1)){
            I[27581]=(((R_sccapb($p1))?true:false)?-1:0);
          }else{
            if((H.equal($p0,113858)===1)){
              R_sccaps($p1,111092,107552);
            }else{
              if((H.equal($p0,113863)===1)){
                R_sccaps($p1,111112,107556);
              }else{
                if((H.equal($p0,113873)===1)){
                  R_sccaps($p1,111132,107560);
                }else{
                  if((H.equal($p0,113749)===1)){
                    I[26466]=R_sccapn($p1);
                  }else{
                    if((H.equal($p0,113880)===1)){
                      R_sccaps($p1,111152,107564);
                    }else{
                      if((H.equal($p0,113885)===1)){
                        R_sccaps($p1,111172,107568);
                      }else{
                        if((H.equal($p0,113890)===1)){
                          R_sccaps($p1,111192,107572);
                        }else{
                          if((H.equal($p0,113896)===1)){
                            R_sccaps($p1,(112148+1+Math.imul(11,20)-21),(107600+(11-1)*4));
                          }else{
                            if((H.equal($p0,113900)===1)){
                              R_sccaps($p1,(112148+1+Math.imul(12,20)-21),(107600+(12-1)*4));
                            }else{
                              if((H.equal($p0,113904)===1)){
                                R_sccaps($p1,(112148+1+Math.imul(13,20)-21),(107600+(13-1)*4));
                              }else{
                                if((H.equal($p0,113908)===1)){
                                  R_sccaps($p1,(112148+1+Math.imul(14,20)-21),(107600+(14-1)*4));
                                }else{
                                  if((H.equal($p0,113912)===1)){
                                    R_sccaps($p1,(112148+1+Math.imul(15,20)-21),(107600+(15-1)*4));
                                  }else{
                                    if((H.equal($p0,113916)===1)){
                                      R_sccaps($p1,(112148+1+Math.imul(16,20)-21),(107600+(16-1)*4));
                                    }else{
                                      if((H.equal($p0,113920)===1)){
                                        R_sccaps($p1,(112148+1+Math.imul(17,20)-21),(107600+(17-1)*4));
                                      }else{
                                        if((H.equal($p0,113924)===1)){
                                          R_sccaps($p1,(112148+1+Math.imul(18,20)-21),(107600+(18-1)*4));
                                        }else{
                                          if((H.equal($p0,113928)===1)){
                                            R_sccaps($p1,(112148+1+Math.imul(19,20)-21),(107600+(19-1)*4));
                                          }else{
                                            if((H.equal($p0,113932)===1)){
                                              R_sccaps($p1,(112148+1+Math.imul(20,20)-21),(107600+(20-1)*4));
                                            }else{
                                              if((H.equal($p0,113936)===1)){
                                                I[26598]=(((R_sccapb($p1))?true:false)?-1:0);
                                              }else{
                                                I[28461]=(false?-1:0);
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  if(((I[28461]&1)!==0)){
    return;
  }
  if((H.equal($p0,113945)===1)){
    R_sccaps($p1,111916,107576);
  }else{
    if((H.equal($p0,113951)===1)){
      R_sccaps($p1,111936,107580);
    }else{
      if((H.equal($p0,113956)===1)){
        R_sccaps($p1,111956,107584);
      }else{
        if((H.equal($p0,113962)===1)){
          R_sccaps($p1,111976,107588);
        }else{
          if((H.equal($p0,113967)===1)){
            R_sccaps($p1,111996,107592);
          }else{
            if((H.equal($p0,113973)===1)){
              R_sccaps($p1,112128,107596);
            }else{
              if((H.equal($p0,113978)===1)){
                R_sccaps($p1,(112148+1+Math.imul(1,20)-21),(107600+(1-1)*4));
              }else{
                if((H.equal($p0,113982)===1)){
                  R_sccaps($p1,(112148+1+Math.imul(2,20)-21),(107600+(2-1)*4));
                }else{
                  if((H.equal($p0,113986)===1)){
                    R_sccaps($p1,(112148+1+Math.imul(3,20)-21),(107600+(3-1)*4));
                  }else{
                    if((H.equal($p0,113990)===1)){
                      R_sccaps($p1,(112148+1+Math.imul(4,20)-21),(107600+(4-1)*4));
                    }else{
                      if((H.equal($p0,113994)===1)){
                        R_sccaps($p1,(112148+1+Math.imul(5,20)-21),(107600+(5-1)*4));
                      }else{
                        if((H.equal($p0,113998)===1)){
                          R_sccaps($p1,(112148+1+Math.imul(6,20)-21),(107600+(6-1)*4));
                        }else{
                          if((H.equal($p0,114002)===1)){
                            R_sccaps($p1,(112148+1+Math.imul(7,20)-21),(107600+(7-1)*4));
                          }else{
                            if((H.equal($p0,114006)===1)){
                              R_sccaps($p1,(112148+1+Math.imul(8,20)-21),(107600+(8-1)*4));
                            }else{
                              if((H.equal($p0,114010)===1)){
                                R_sccaps($p1,(112148+1+Math.imul(9,20)-21),(107600+(9-1)*4));
                              }else{
                                if((H.equal($p0,114014)===1)){
                                  R_sccaps($p1,(112148+1+Math.imul(10,20)-21),(107600+(10-1)*4));
                                }else{
                                  if((H.equal($p0,114018)===1)){
                                    R_sccaps($p1,(112148+1+Math.imul(26,20)-21),(107600+(26-1)*4));
                                  }else{
                                    if((H.equal($p0,114026)===1)){
                                      R_sccaps($p1,(112148+1+Math.imul(23,20)-21),(107600+(23-1)*4));
                                    }else{
                                      if((H.equal($p0,114033)===1)){
                                        R_sccaps($p1,(112148+1+Math.imul(28,20)-21),(107600+(28-1)*4));
                                      }else{
                                        if((H.equal($p0,114041)===1)){
                                          R_sccaps($p1,(112148+1+Math.imul(22,20)-21),(107600+(22-1)*4));
                                        }else{
                                          if((H.equal($p0,114048)===1)){
                                            R_sccaps($p1,(112148+1+Math.imul(27,20)-21),(107600+(27-1)*4));
                                          }else{
                                            if((H.equal($p0,114056)===1)){
                                              R_sccaps($p1,(112148+1+Math.imul(25,20)-21),(107600+(25-1)*4));
                                            }else{
                                              if((H.equal($p0,114065)===1)){
                                                R_sccaps($p1,(112148+1+Math.imul(24,20)-21),(107600+(24-1)*4));
                                              }else{
                                                if((H.equal($p0,114073)===1)){
                                                  R_sccaps($p1,(112148+1+Math.imul(21,20)-21),(107600+(21-1)*4));
                                                }else{
                                                  if((H.equal($p0,114078)===1)){
                                                    R_sccaps($p1,112708,107712);
                                                  }else{
                                                    I[28461]=(false?-1:0);
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  if(((I[28461]&1)!==0)){
    return;
  }
  if((H.equal($p0,113740)===1)){
    I[26464]=R_sccapn($p1);
  }else{
    if((H.equal($p0,114084)===1)){
      R_sccapg($p1,(I[28523]=1,114092));
    }else{
      if((H.equal($p0,114096)===1)){
        R_sccapg($p1,(I[28526]=2,114104));
      }else{
        if((H.equal($p0,114108)===1)){
          R_sccapg($p1,(I[28529]=3,114116));
        }else{
          if((H.equal($p0,114120)===1)){
            R_sccapg($p1,(I[28532]=4,114128));
          }else{
            if((H.equal($p0,114132)===1)){
              R_sccapg($p1,(I[28535]=5,114140));
            }else{
              if((H.equal($p0,114144)===1)){
                R_sccapg($p1,(I[28538]=6,114152));
              }else{
                if((H.equal($p0,114156)===1)){
                  R_sccapg($p1,(I[28542]=7,114168));
                }else{
                  if((H.equal($p0,114172)===1)){
                    R_sccapg($p1,(I[28545]=8,114180));
                  }else{
                    if((H.equal($p0,114184)===1)){
                      R_sccapg($p1,(I[28548]=9,114192));
                    }else{
                      if((H.equal($p0,114196)===1)){
                        R_sccapg($p1,(I[28551]=10,114204));
                      }else{
                        if((H.equal($p0,114208)===1)){
                          R_sccapg($p1,(I[28555]=11,114220));
                        }else{
                          if((H.equal($p0,114224)===1)){
                            R_sccapg($p1,(I[28558]=12,114232));
                          }else{
                            if((H.equal($p0,114236)===1)){
                              R_sccapg($p1,(I[28562]=13,114248));
                            }else{
                              if((H.equal($p0,114252)===1)){
                                R_sccapg($p1,(I[28566]=14,114264));
                              }else{
                                if((H.equal($p0,114268)===1)){
                                  R_sccapg($p1,(I[28570]=15,114280));
                                }else{
                                  if((H.equal($p0,114284)===1)){
                                    I[26937]=(((R_sccapb($p1))?true:false)?-1:0);
                                  }else{
                                    if((H.equal($p0,114291)===1)){
                                      R_sccaps($p1,112728,107716);
                                    }else{
                                      if((H.equal($p0,114297)===1)){
                                        I[27582]=(((R_sccapb($p1))?true:false)?-1:0);
                                      }else{
                                        if((H.equal($p0,114306)===1)){
                                          I[27579]=(((R_sccapb($p1))?true:false)?-1:0);
                                        }else{
                                          if((H.equal($p0,114314)===1)){
                                            R_sccaps($p1,112748,107720);
                                          }else{
                                            if((H.equal($p0,114319)===1)){
                                              R_sccaps($p1,112768,107724);
                                            }else{
                                              if((H.equal($p0,114325)===1)){
                                                I[26599]=(((R_sccapb($p1))?true:false)?-1:0);
                                              }else{
                                                if((H.equal($p0,114336)===1)){
                                                  B[107388]=R_sccapc($p1);
                                                }else{
                                                  I[28461]=(false?-1:0);
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  if(((I[28461]&1)!==0)){
    return;
  }
  if((H.equal($p0,114342)===1)){
    F[26823]=R_sccapr($p1);
  }else{
    if((H.equal($p0,114349)===1)){
      F[26824]=R_sccapr($p1);
    }else{
      if((H.equal($p0,114355)===1)){
        F[26825]=R_sccapr($p1);
      }else{
        if((H.equal($p0,114361)===1)){
          F[26826]=R_sccapr($p1);
        }else{
          if((H.equal($p0,114369)===1)){
            F[26827]=R_sccapr($p1);
          }else{
            if((H.equal($p0,114375)===1)){
              F[26828]=R_sccapr($p1);
            }else{
              if((H.equal($p0,114381)===1)){
                F[26829]=R_sccapr($p1);
              }else{
                if((H.equal($p0,114388)===1)){
                  R_sccapg($p1,(I[28599]=16,114396));
                }else{
                  if((H.equal($p0,114400)===1)){
                    F[26830]=R_sccapr($p1);
                  }else{
                    if((H.equal($p0,114406)===1)){
                      F[26831]=R_sccapr($p1);
                    }else{
                      if((H.equal($p0,114412)===1)){
                        F[26832]=R_sccapr($p1);
                      }else{
                        if((H.equal($p0,114420)===1)){
                          F[26833]=R_sccapr($p1);
                        }else{
                          if((H.equal($p0,114426)===1)){
                            F[26834]=R_sccapr($p1);
                          }else{
                            if((H.equal($p0,114432)===1)){
                              R_sccaps($p1,112808,107728);
                            }else{
                              if((H.equal($p0,114439)===1)){
                                R_sccaps($p1,112828,107732);
                              }else{
                                if((H.equal($p0,114446)===1)){
                                  R_sccaps($p1,112848,107736);
                                }else{
                                  if((H.equal($p0,114451)===1)){
                                    R_sccaps($p1,112868,107740);
                                  }else{
                                    if((H.equal($p0,114456)===1)){
                                      R_sccaps($p1,112888,107744);
                                    }else{
                                      if((H.equal($p0,114460)===1)){
                                        I[27580]=(((R_sccapb($p1))?true:false)?-1:0);
                                      }else{
                                        if((H.equal($p0,114467)===1)){
                                          I[26596]=(((R_sccapb($p1))?true:false)?-1:0);
                                        }else{
                                          if((H.equal($p0,114473)===1)){
                                            I[26597]=(((R_sccapb($p1))?true:false)?-1:0);
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  return;
}
/* SCLB.R: subroutine sctermcap */
function R_sctermcap($p0){
  H.scopy(114480,(I[28624]=1,114496),$p0,(I[28625]=1,114500));
  return;
}
/* SCLB.R: function scnxtent */
function R_scnxtent($p0,$p1,$p2){
  I[($p0)>>2]=((I[($p0)>>2]+1)|0);
  I[28626]=R_enfldn($p0,114508,(I[28660]=132,114640));
  if((I[28626]===((-2)|0))){
    I[28661]=1;
    L1:while(((H.type((114508+I[28661]-1))===1)||(H.type((114508+I[28661]-1))===2))){
      H.chcopy((114508+I[28661]-1),$p1,114644);
    }
    if(((B[(114508+I[28661]-1)]===35)||(B[(114508+I[28661]-1)]===61))){
      H.chcopy((114508+I[28661]-1),$p1,114644);
    }
    B[($p1+I[28661]-1)]=0;
    H.scopy(114508,114644,$p2,(I[28662]=1,114648));
  }
  return I[28626];
  return I[28626];
}
/* SCLB.R: subroutine sccapa */
function R_sccapa($p0){
  I[26600]=((I[26600]+1)|0);
  I[28665]=1;
  L1:for(;(I[28665]<=6);I[28665]=((I[28665]+1)|0)){
    I[((106404+(I[28665]+Math.imul(I[26600],6)-7)*4))>>2]=1;
  }
  I[28665]=1;
  L2:for(;((B[($p0+I[28665]-1)]!==61)&&(B[($p0+I[28665]-1)]!==0));I[28665]=((I[28665]+1)|0)){
    if((B[($p0+I[28665]-1)]===45)){
      I[28666]=0;
      I[28665]=((I[28665]+1)|0);
    }else{
      if((B[($p0+I[28665]-1)]===43)){
        I[28666]=((-1)|0);
        I[28665]=((I[28665]+1)|0);
      }else{
        I[28666]=((-1)|0);
      }
    }
    I[28667]=H.index(114652,($p0+I[28665]-1));
    if(((0<I[28667])&&(I[28667]<=6))){
      I[((106404+(I[28667]+Math.imul(I[26600],6)-7)*4))>>2]=I[28666];
    }
  }
  if((B[($p0+I[28665]-1)]!==0)){
    I[28665]=((I[28665]+1)|0);
  }
  H.scopy($p0,114660,(110332+1+Math.imul(I[26600],20)-21),(I[28668]=1,114672));
  return;
}
/* SCLB.R: function sccapb */
function R_sccapb($p0){
  I[28669]=((H.length($p0)===0)?-1:0);
  return ((I[28669]&1)!==0);
  return ((I[28669]&1)!==0);
}
/* SCLB.R: function sccapc */
function R_sccapc($p0){
  B[114680]=B[($p0+1-1)];
  return B[114680];
  return B[114680];
}
/* SCLB.R: subroutine sccapg */
function R_sccapg($p0,$p1){
  if((B[($p0+1-1)]===40)){
    I[28671]=1;
    I[28672]=2;
    L1:for(;((B[($p0+I[28672]-1)]!==41)&&(B[($p0+I[28672]-1)]!==0));I[28672]=((I[28672]+1)|0)){
      H.chcopy(($p0+I[28672]-1),114692,114684);
    }
    B[(114692+I[28671]-1)]=0;
    if((B[($p0+I[28672]-1)]===41)){
      I[28672]=((I[28672]+1)|0);
    }
    H.scopy($p0,114688,114824,(I[28739]=1,114956));
  }else{
    B[(114692+1-1)]=0;
    H.scopy($p0,(I[28740]=1,114960),114824,(I[28741]=1,114964));
  }
  R_sccapl(114692,(111212+(1+Math.imul(I[($p1)>>2],6)-7)*4));
  R_sccaps(114824,(111596+1+Math.imul(I[($p1)>>2],20)-21),(107752+(I[($p1)>>2]-1)*4));
  return;
}
/* SCLB.R: subroutine sccapl */
function R_sccapl($p0,$p1){
  I[28744]=1;
  L1:for(;(I[28744]<=6);I[28744]=((I[28744]+1)|0)){
    I[(($p1+(I[28744]-1)*4))>>2]=(false?-1:0);
  }
  I[28745]=1;
  L2:for(;(B[($p0+I[28745]-1)]!==0);I[28745]=((I[28745]+1)|0)){
    I[28744]=H.index(114968,($p0+I[28745]-1));
    if(((0<I[28744])&&(I[28744]<=6))){
      I[(($p1+(I[28744]-1)*4))>>2]=(true?-1:0);
    }
  }
  return;
}
/* SCLB.R: function sccapn */
function R_sccapn($p0){
  I[28747]=1;
  I[28746]=H.ctoi($p0,114988);
  return I[28746];
  return I[28746];
}
/* SCLB.R: function sccapr */
function R_sccapr($p0){
  I[28749]=1;
  F[28748]=H.ctor($p0,114996);
  return F[28748];
  return F[28748];
}
/* SCLB.R: subroutine sccaps */
function R_sccaps($p0,$p1,$p2){
  H.scopy($p0,(I[28750]=1,115000),$p1,(I[28751]=1,115004));
  I[($p2)>>2]=H.length($p1);
  return;
}
/* SCLB.R: subroutine scasu */
function R_scasu(){
  R_scasug();
  I[28752]=1;
  L1:for(;(I[28752]<=6);I[28752]=((I[28752]+1)|0)){
    I[28753]=1;
    L2:for(;(I[28753]<=6);I[28753]=((I[28753]+1)|0)){
      I[((115016+(I[28753]-1)*4))>>2]=1;
    }
    I[((115016+(I[28752]-1)*4))>>2]=((-1)|0);
    if(((R_scatfind(115016,115040))?true:false)){
      I[((110292+(I[28752]-1)*4))>>2]=I[28760];
    }else{
      I[((110292+(I[28752]-1)*4))>>2]=0;
    }
  }
  I[28752]=1;
  L3:for(;(I[28752]<=6);I[28752]=((I[28752]+1)|0)){
    I[28753]=1;
    L4:for(;(I[28753]<=6);I[28753]=((I[28753]+1)|0)){
      if((I[((110220+(I[28752]-1)*4))>>2]===I[((110220+(I[28753]-1)*4))>>2])){
        I[((115016+(I[28753]-1)*4))>>2]=0;
      }else{
        I[((115016+(I[28753]-1)*4))>>2]=1;
      }
    }
    if(((R_scatfind(115016,115040))?true:false)){
      I[((110268+(I[28752]-1)*4))>>2]=I[28760];
    }else{
      I[((110268+(I[28752]-1)*4))>>2]=0;
    }
  }
  I[28752]=1;
  L5:for(;(I[28752]<=6);I[28752]=((I[28752]+1)|0)){
    if((I[((110292+(I[28752]-1)*4))>>2]===0)){
      I[((110244+(I[28752]-1)*4))>>2]=1;
    }else{
      I[((110244+(I[28752]-1)*4))>>2]=0;
    }
  }
  I[28752]=1;
  L6:for(;(I[28752]<=6);I[28752]=((I[28752]+1)|0)){
    I[((107268+(I[28752]-1)*4))>>2]=(false?-1:0);
  }
  I[28752]=1;
  L7:for(;(I[28752]<=I[26600]);I[28752]=((I[28752]+1)|0)){
    I[28753]=1;
    L8:for(;(I[28753]<=6);I[28753]=((I[28753]+1)|0)){
      if((I[((106404+(I[28753]+Math.imul(I[28752],6)-7)*4))>>2]!==1)){
        I[((107268+(I[28753]-1)*4))>>2]=(true?-1:0);
      }
    }
  }
  return;
}
/* SCLB.R: subroutine scasug */
function R_scasug(){
  I[28761]=1;
  L1:for(;(I[28761]<=6);I[28761]=((I[28761]+1)|0)){
    I[((110220+(I[28761]-1)*4))>>2]=I[28761];
  }
  I[28762]=1;
  L2:for(;(I[28762]<=I[26600]);I[28762]=((I[28762]+1)|0)){
    I[28763]=1;
    L3:for(;(I[28763]<=6);I[28763]=((I[28763]+1)|0)){
      I[28764]=1;
      L4:for(;(I[28764]<=6);I[28764]=((I[28764]+1)|0)){
        if(((I[((110220+(I[28764]-1)*4))>>2]===I[((110220+(I[28763]-1)*4))>>2])&&(I[((106404+(I[28764]+Math.imul(I[28762],6)-7)*4))>>2]!==1))){
          break L4;
        }
      }
      if((I[28764]<=6)){
        I[28765]=I[((110220+(I[28763]-1)*4))>>2];
        I[28766]=1;
        L5:for(;(I[28766]<=6);I[28766]=((I[28766]+1)|0)){
          if((I[((110220+(I[28766]-1)*4))>>2]===I[28765])){
            I[((110220+(I[28766]-1)*4))>>2]=I[28761];
          }
        }
      }
    }
    I[28761]=((I[28761]+1)|0);
  }
  return;
}
/* SCLB.R: function scatfind */
function R_scatfind($p0,$p1){
  I[28767]=(false?-1:0);
  I[($p1)>>2]=1;
  L1:for(;(I[($p1)>>2]<=I[26600]);I[($p1)>>2]=((I[($p1)>>2]+1)|0)){
    I[28768]=1;
    L2:for(;(I[28768]<=6);I[28768]=((I[28768]+1)|0)){
      if((I[(($p0+(I[28768]-1)*4))>>2]!==I[((106404+(I[28768]+Math.imul(I[($p1)>>2],6)-7)*4))>>2])){
        break L2;
      }
    }
    if((I[28768]>6)){
      I[28767]=(true?-1:0);
      break L1;
    }
  }
  return ((I[28767]&1)!==0);
  return ((I[28767]&1)!==0);
}
/* SCLB.R: subroutine scattexec */
function R_scattexec($p0){
  if(((I[($p0)>>2]===0)||(!((0<I[($p0)>>2])&&(I[($p0)>>2]<=I[26600]))))){
    R_scerror(115076);
  }else{
    R_iopstr((110332+1+Math.imul(I[($p0)>>2],20)-21));
    I[28772]=1;
    L1:for(;(I[28772]<=6);I[28772]=((I[28772]+1)|0)){
      if((I[((106404+(I[28772]+Math.imul(I[($p0)>>2],6)-7)*4))>>2]===((-1)|0))){
        I[((110172+(I[28772]-1)*4))>>2]=(true?-1:0);
      }else{
        if((I[((106404+(I[28772]+Math.imul(I[($p0)>>2],6)-7)*4))>>2]===0)){
          I[((110172+(I[28772]-1)*4))>>2]=(false?-1:0);
        }
      }
    }
  }
  return;
}
/* SCLB.R: subroutine scattset */
function R_scattset($p0){
  I[28773]=1;
  L1:for(;(I[28773]<=6);I[28773]=((I[28773]+1)|0)){
    if(((((I[((110172+(I[28773]-1)*4))>>2]&1)!==0)?-1:0)!==(((I[(($p0+(I[28773]-1)*4))>>2]&1)!==0)?-1:0))){
      if((I[((110244+(I[28773]-1)*4))>>2]===0)){
        I[28774]=1;
        L2:for(;(I[28774]<=6);I[28774]=((I[28774]+1)|0)){
          if((((I[((110220+(I[28773]-1)*4))>>2]===I[((110220+(I[28774]-1)*4))>>2])&&((I[((110172+(I[28774]-1)*4))>>2]&1)!==0))&&(!((I[(($p0+(I[28774]-1)*4))>>2]&1)!==0)))){
            break L2;
          }
        }
        if((I[28774]<=6)){
          R_scattexec((110268+(I[28773]-1)*4));
        }
        I[28775]=1;
        L3:for(;(I[28775]<=6);I[28775]=((I[28775]+1)|0)){
          if((((I[((110220+(I[28775]-1)*4))>>2]===I[((110220+(I[28773]-1)*4))>>2])&&(!((I[((110172+(I[28775]-1)*4))>>2]&1)!==0)))&&((I[(($p0+(I[28775]-1)*4))>>2]&1)!==0))){
            R_scattexec((110292+(I[28773]-1)*4));
          }
        }
      }else{
        I[28774]=1;
        L4:for(;(I[28774]<=6);I[28774]=((I[28774]+1)|0)){
          if((I[((110220+(I[28774]-1)*4))>>2]===I[((110220+(I[28773]-1)*4))>>2])){
            if(((I[(($p0+(I[28774]-1)*4))>>2]&1)!==0)){
              I[((115104+(I[28774]-1)*4))>>2]=((-1)|0);
            }else{
              I[((115104+(I[28774]-1)*4))>>2]=0;
            }
          }else{
            I[((115104+(I[28774]-1)*4))>>2]=1;
          }
        }
        if(((R_scatfind(115104,115128))?true:false)){
          R_scattexec(115128);
        }else{
          R_scerror(115132);
        }
      }
    }
  }
  return;
}
/* SCLB.R: subroutine scbeep */
function R_scbeep(){
  if((I[26886]!==5000)){
    R_iopstr(111052);
    R_scpad(107340);
  }
  return;
}
/* SCLB.R: subroutine scbol */
function R_scbol(){
  if((I[26887]===5000)){
    R_scerror(115143);
  }else{
    R_iopstr(111072);
    R_scpad(107344);
  }
  return;
}
/* SCLB.R: subroutine sccel */
function R_sccel(){
  if((I[26888]===5000)){
    R_scerror(115151);
  }else{
    R_iopstr(111092);
    R_scpad(107348);
  }
  return;
}
/* SCLB.R: subroutine scchscroll */
function R_scchscroll($p0,$p1){
  if((I[26889]===5000)){
    R_scerror(115159);
  }else{
    I[28793]=1;
    L1:while((B[(111112+I[28793]-1)]!==0)){
      if((B[(111112+I[28793]-1)]===37)){
        I[28793]=((I[28793]+1)|0);
        if((B[(111112+I[28793]-1)]===102)){
          I[28793]=((I[28793]+1)|0);
          R_scputf(111112,115172,$p0);
        }else{
          if((B[(111112+I[28793]-1)]===108)){
            I[28793]=((I[28793]+1)|0);
            R_scputf(111112,115172,$p1);
          }else{
            if((B[(111112+I[28793]-1)]!==0)){
              H.iopchar((111112+I[28793]-1));
              I[28793]=((I[28793]+1)|0);
            }
          }
        }
      }else{
        H.iopchar((111112+I[28793]-1));
        I[28793]=((I[28793]+1)|0);
      }
    }
  }
  return;
}
/* SCLB.R: subroutine scclear */
function R_scclear(){
  if((I[26890]===5000)){
    R_scerror(115176);
  }else{
    R_iopstr(111132);
    R_scpad(107352);
  }
  return;
}
/* SCLB.R: function scdisp */
function R_scdisp($p0){
  I[28797]=0;
  B[115188]=B[$p0];
  if(((I[28797]<0)||(I[28797]>127))){
    I[28798]=(false?-1:0);
    return ((I[28798]&1)!==0);
  }
  I[28798]=(((I[((105868+(((1+I[28797])|0)-1)*4))>>2]&1)!==0)?-1:0);
  return ((I[28798]&1)!==0);
  return ((I[28798]&1)!==0);
}
/* SCLB.R: subroutine scdlc */
function R_scdlc(){
  if((I[26891]===5000)){
    R_scerror(115196);
  }else{
    R_iopstr(111152);
    R_scpad(107356);
  }
  return;
}
/* SCLB.R: subroutine scdll */
function R_scdll(){
  if((I[26892]===5000)){
    R_scerror(115204);
  }else{
    R_iopstr(111172);
    R_scpad(107360);
  }
  return;
}
/* SCLB.R: subroutine scdown */
function R_scdown($p0){
  if((I[26893]===5000)){
    R_scerror(115212);
  }else{
    I[28806]=1;
    L1:for(;(I[28806]<=I[($p0)>>2]);I[28806]=((I[28806]+1)|0)){
      R_iopstr(111192);
      R_scpad(107364);
    }
  }
  return;
}
/* SCLB.R: subroutine scgraphics */
function R_scgraphics($p0){
  if(((1<=I[($p0)>>2])&&(I[($p0)>>2]<=16))){
    if((I[((107752+(I[($p0)>>2]-1)*4))>>2]===((-3)|0))){
      R_scerror(115228);
    }else{
      R_scattset((111212+(1+Math.imul(I[($p0)>>2],6)-7)*4));
      R_iopstr((111596+1+Math.imul(I[($p0)>>2],20)-21));
    }
  }else{
    R_scerror(115242);
  }
  return;
}
/* SCLB.R: subroutine schome */
function R_schome(){
  if((I[26894]===5000)){
    R_scerror(115256);
  }else{
    R_iopstr(111916);
  }
  return;
}
/* SCLB.R: subroutine sciim */
function R_sciim(){
  if((I[26895]===5000)){
    R_scerror(115265);
  }else{
    R_iopstr(111936);
  }
  return;
}
/* SCLB.R: subroutine scikey */
function R_scikey(){
  if((I[26896]===5000)){
    R_scerror(115273);
  }else{
    R_iopstr(111956);
  }
  return;
}
/* SCLB.R: subroutine scinc */
function R_scinc(){
  if((I[26897]===5000)){
    R_scerror(115282);
  }else{
    R_iopstr(111976);
    R_scpad(107368);
  }
  return;
}
/* SCLB.R: subroutine scinl */
function R_scinl(){
  if((I[26899]===5000)){
    R_scerror(115290);
  }else{
    R_iopstr(112128);
    R_scpad(107372);
  }
  return;
}
/* SCLB.R: subroutine scleft */
function R_scleft($p0){
  if((I[26928]===5000)){
    R_scerror(115298);
  }else{
    I[28827]=1;
    L1:for(;(I[28827]<=I[($p0)>>2]);I[28827]=((I[28827]+1)|0)){
      R_iopstr(112708);
    }
  }
  return;
}
/* SCLB.R: subroutine scmove */
function R_scmove($p0,$p1){
  if((I[26929]===5000)){
    R_scerror(115312);
  }else{
    I[28831]=1;
    L1:for(;(B[(112728+I[28831]-1)]!==0);I[28831]=((I[28831]+1)|0)){
      if((((B[(112728+I[28831]-1)]===108)&&(B[(112728+((I[28831]+1)|0)-1)]>=48))&&(B[(112728+((I[28831]+1)|0)-1)]<=52))){
        I[28831]=((I[28831]+1)|0);
        S2:switch(B[(112728+I[28831]-1)]){
          case 48:{
            H.iopchar($p0);
            break S2;
          }
          case 49:{
            H.iopchar((I[28832]=((I[($p0)>>2]+31)|0),115328));
            break S2;
          }
          case 50:{
            R_scnump($p0);
            break S2;
          }
          case 51:{
            H.iopchar((I[28833]=((((I[($p0)>>2]+63)|0)+Math.imul($idiv(((I[($p0)>>2]-1)|0),20),12))|0),115332));
            break S2;
          }
          case 52:{
            R_scnump((I[28834]=((I[($p0)>>2]-1)|0),115336));
            break S2;
          }
        }
      }else{
        if((((B[(112728+I[28831]-1)]===99)&&(B[(112728+((I[28831]+1)|0)-1)]>=48))&&(B[(112728+((I[28831]+1)|0)-1)]<=52))){
          I[28831]=((I[28831]+1)|0);
          S3:switch(B[(112728+I[28831]-1)]){
            case 48:{
              H.iopchar($p1);
              break S3;
            }
            case 49:{
              H.iopchar((I[28835]=((I[($p1)>>2]+31)|0),115340));
              break S3;
            }
            case 50:{
              R_scnump($p1);
              break S3;
            }
            case 51:{
              H.iopchar((I[28836]=((((I[($p1)>>2]-1)|0)+Math.imul($idiv(((I[($p1)>>2]-1)|0),10),6))|0),115344));
              break S3;
            }
            case 52:{
              R_scnump((I[28837]=((I[($p1)>>2]-1)|0),115348));
              break S3;
            }
          }
        }else{
          H.iopchar((112728+I[28831]-1));
        }
      }
    }
  }
  return;
}
/* SCLB.R: subroutine scoim */
function R_scoim(){
  if((I[26930]===5000)){
    R_scerror(115352);
  }else{
    R_iopstr(112748);
  }
  return;
}
/* SCLB.R: subroutine scoffatt */
function R_scoffatt($p0){
  if(((0<I[($p0)>>2])&&(I[($p0)>>2]<=6))){
    I[((110196+(I[($p0)>>2]-1)*4))>>2]=(false?-1:0);
  }else{
    R_scerror(115360);
  }
  return;
}
/* SCLB.R: subroutine scokey */
function R_scokey(){
  if((I[26931]===5000)){
    R_scerror(115371);
  }else{
    R_iopstr(112768);
  }
  return;
}
/* SCLB.R: subroutine sconatt */
function R_sconatt($p0){
  if(((0<I[($p0)>>2])&&(I[($p0)>>2]<=6))){
    I[((110196+(I[($p0)>>2]-1)*4))>>2]=(true?-1:0);
  }else{
    R_scerror(115380);
  }
  return;
}
/* SCLB.R: subroutine screinit */
function R_screinit(){
  if((I[26898]!==5000)){
    R_iopstr(111996);
  }
  return;
}
/* SCLB.R: subroutine scright */
function R_scright($p0){
  if((I[26932]===5000)){
    R_scerror(115390);
  }else{
    I[28850]=1;
    L1:for(;(I[28850]<=I[($p0)>>2]);I[28850]=((I[28850]+1)|0)){
      R_iopstr(112808);
    }
  }
  return;
}
/* SCLB.R: subroutine scsdown */
function R_scsdown(){
  if((I[26933]===5000)){
    R_scerror(115404);
  }else{
    R_iopstr(112828);
    R_scpad(107376);
  }
  return;
}
/* SCLB.R: subroutine scsup */
function R_scsup(){
  if((I[26934]===5000)){
    R_scerror(115414);
  }else{
    R_iopstr(112848);
    R_scpad(107380);
  }
  return;
}
/* SCLB.R: subroutine sctab */
function R_sctab(){
  if((I[26935]===5000)){
    R_scerror(115422);
  }else{
    R_iopstr(112868);
    R_scpad(107384);
  }
  return;
}
/* SCLB.R: subroutine scup */
function R_scup($p0){
  if((I[26936]===5000)){
    R_scerror(115430);
  }else{
    I[28860]=1;
    L1:for(;(I[28860]<=I[($p0)>>2]);I[28860]=((I[28860]+1)|0)){
      R_iopstr(112888);
    }
  }
  return;
}
/* SCLB.R: subroutine scpad */
function R_scpad($p0){
  I[28861]=1;
  L1:for(;(I[28861]<=I[($p0)>>2]);I[28861]=((I[28861]+1)|0)){
    H.iopchar(107388);
  }
  return;
}
/* SCLB.R: subroutine scputf */
function R_scputf($p0,$p1,$p2){
  I[28862]=I[($p2)>>2];
  L1:while(((B[($p0+I[($p1)>>2]-1)]===43)||(B[($p0+I[($p1)>>2]-1)]===45))){
    if((B[($p0+I[($p1)>>2]-1)]===43)){
      I[28863]=1;
    }else{
      I[28863]=((-1)|0);
    }
    I[28862]=((I[28862]+Math.imul(I[28863],H.ctoi($p0,$p1)))|0);
  }
  if((B[($p0+I[($p1)>>2]-1)]===99)){
    I[($p1)>>2]=((I[($p1)>>2]+1)|0);
    B[115456]=I[28862];
    H.iopchar(115456);
  }else{
    if((B[($p0+I[($p1)>>2]-1)]===110)){
      I[($p1)>>2]=((I[($p1)>>2]+1)|0);
      R_scnump(115448);
    }else{
      R_scerror(115457);
    }
  }
  return;
}
/* SCLB.R: subroutine scnump */
function R_scnump($p0){
  I[28870]=H.itoc($p0,115466,(I[28869]=10,115476));
  R_iopstr(115466);
  return;
}
/* SCLB.R: subroutine scpillow */
function R_scpillow(){
  R_scgraphics((I[28871]=16,115484));
  return;
}
/* SCLB.R: subroutine scput */
function R_scput($p0){
  R_scattset(110196);
  H.iopchar($p0);
  return;
}
/* SCLB.R: subroutine scunsetup */
function R_scunsetup(){
  I[28872]=1;
  L1:for(;(I[28872]<=6);I[28872]=((I[28872]+1)|0)){
    I[((115492+(I[28872]-1)*4))>>2]=(false?-1:0);
  }
  R_scattset(115492);
  H.ioend();
  return;
}
/* SCLB.R: subroutine scend */
function R_scend(){
  R_scunsetup();
  return;
}
/* SCLB.R: function scchav */
function R_scchav($p0){
  I[28879]=(true?-1:0);
  if((I[28227]===0)){
    if((!((H.iochav($p0))?true:false))){
      I[28879]=(false?-1:0);
    }
  }
  return ((I[28879]&1)!==0);
  return ((I[28879]&1)!==0);
}
/* SCLB.R: function scget */
function* R_scget($p0){
  if((I[28227]>0)){
    B[$p0]=B[(112912+I[28227]-1)];
    I[28227]=((I[28227]-1)|0);
    B[115520]=B[$p0];
  }else{
    B[115520]=(yield* H.iogchar($p0));
  }
  return B[115520];
  return B[115520];
}
/* SCLB.R: function scgetk */
function* R_scgetk($p0,$p1){
  I[28882]=0;
  I[28883]=1;
  L1:for(;(I[28883]<=28);I[28883]=((I[28883]+1)|0)){
    I[((115536+(I[28883]-1)*4))>>2]=(((I[((107600+(I[28883]-1)*4))>>2]!==5000)&&(I[((107600+(I[28883]-1)*4))>>2]>0))?-1:0);
    if(((I[((115536+(I[28883]-1)*4))>>2]&1)!==0)){
      I[28882]=((I[28882]+1)|0);
    }
  }
  I[28912]=(false?-1:0);
  I[28913]=1;
  L2:for(;(I[28882]>0);I[28913]=((I[28913]+1)|0)){
    B[(115656+I[28913]-1)]=(yield* R_scget((115656+I[28913]-1)));
    I[28882]=0;
    I[28883]=28;
    L3:for(;(I[28883]>=1);I[28883]=((I[28883]-1)|0)){
      if(((I[((115536+(I[28883]-1)*4))>>2]&1)!==0)){
        I[((115536+(I[28883]-1)*4))>>2]=(false?-1:0);
        if((B[(112148+I[28913]+Math.imul(I[28883],20)-21)]===B[(115656+I[28913]-1)])){
          if((I[28913]===I[((107600+(I[28883]-1)*4))>>2])){
            I[28912]=(true?-1:0);
            I[28919]=I[28883];
          }else{
            I[((115536+(I[28883]-1)*4))>>2]=(true?-1:0);
            I[28882]=((I[28882]+1)|0);
          }
        }
      }
    }
  }
  if(((I[28912]&1)!==0)){
    I[($p0)>>2]=I[28919];
    I[28881]=(true?-1:0);
  }else{
    I[28920]=((I[28913]-1)|0);
    L4:for(;(I[28920]>=1);I[28920]=((I[28920]-1)|0)){
      R_scunget((115656+I[28920]-1));
    }
    B[$p1]=(yield* R_scget($p1));
    I[28881]=(false?-1:0);
  }
  return ((I[28881]&1)!==0);
  return ((I[28881]&1)!==0);
}
/* SCLB.R: function scpeek */
function* R_scpeek($p0){
  B[115684]=(yield* R_scget($p0));
  R_scunget(115684);
  return B[115684];
  return B[115684];
}
/* SCLB.R: subroutine scunget */
function R_scunget($p0){
  if((I[28227]<20)){
    I[28227]=((I[28227]+1)|0);
    B[(112912+I[28227]-1)]=B[$p0];
  }else{
    R_scerror(115685);
  }
  return;
}
/* SCLB.R: subroutine scerror */
function R_scerror($p0){
  if(((I[28233]&1)!==0)){
    R_scbeep();
  }
  R_iopstr(115695);
  R_iopstr($p0);
  if((!((I[28233]&1)!==0))){
    R_iopstr(115701);
    H.ioflush();
    H.ioend();
    H.error(72976);
  }
  return;
}
/* ENLB.R: function enopen */
function R_enopen($p0){
  I[28932]=H.open($p0,(I[29510]=1,118040));
  if((I[28932]===((-3)|0))){
    I[29509]=((-3)|0);
  }else{
    I[29509]=((-2)|0);
  }
  I[28933]=0;
  return I[29509];
  return I[29509];
}
/* ENLB.R: subroutine enclose */
function R_enclose(){
  H.close(115728);
  return;
}
/* ENLB.R: function engetnext */
function R_engetnext($p0){
  I[28933]=0;
  L1:do{
    B[118048]=H.getch(118048,115728);
    if((B[118048]===35)){
      L2:do{
        B[118048]=H.getch(118048,115728);
      }while(!(((B[118048]===10)||(B[118048]===((-1)|0)))));
    }
  }while(!((((B[118048]!==10)&&(B[118048]!==32))&&(B[118048]!==9))));
  if((B[118048]===((-1)|0))){
    I[29511]=((-1)|0);
    return I[29511];
  }
  I[28933]=1;
  I[((116136+(I[28933]-1)*4))>>2]=0;
  I[((115736+(I[28933]-1)*4))>>2]=1;
  L3:for(;;){
    if(((B[118048]===10)||(B[118048]===((-1)|0)))){
      break L3;
    }else{
      if((B[118048]===58)){
        if((I[((116136+(I[28933]-1)*4))>>2]>0)){
          if((I[28933]<100)){
            I[((115736+(((I[28933]+1)|0)-1)*4))>>2]=((I[((115736+(I[28933]-1)*4))>>2]+I[((116136+(I[28933]-1)*4))>>2])|0);
            I[((116136+(((I[28933]+1)|0)-1)*4))>>2]=0;
          }
          I[28933]=((I[28933]+1)|0);
        }
      }else{
        if((B[118048]===94)){
          B[118048]=H.cupper((I[29513]=H.getch(118048,115728),118052));
          if(((B[118048]===10)||(B[118048]===((-1)|0)))){
            break L3;
          }else{
            if(((B[118048]>=64)&&(B[118048]<=95))){
              R_enstorchar((I[29514]=((B[118048]-64)|0),118056));
            }else{
              R_enstorchar(118048);
            }
          }
        }else{
          if((B[118048]===64)){
            B[118048]=H.getch(118048,115728);
            if((B[118048]===((-1)|0))){
              break L3;
            }else{
              if((H.cupper(118048)===69)){
                R_enstorchar((I[29515]=27,118060));
              }else{
                if((B[118048]===10)){
                  L4:do{
                    B[118048]=H.getch(118048,115728);
                  }while(!((!((B[118048]===32)||(B[118048]===9)))));
                  continue L3;
                }else{
                  if(((B[118048]>=48)&&(B[118048]<=57))){
                    I[29516]=0;
                    L5:do{
                      I[29516]=Math.imul(I[29516],8);
                      I[29516]=((I[29516]+((B[118048]-48)|0))|0);
                      B[118048]=H.getch(118048,115728);
                    }while(!(((B[118048]<48)||(B[118048]>57))));
                    B[118068]=I[29516];
                    R_enstorchar(118068);
                    continue L3;
                  }else{
                    R_enstorchar(118048);
                  }
                }
              }
            }
          }else{
            R_enstorchar(118048);
          }
        }
      }
    }
    B[118048]=H.getch(118048,115728);
  }
  I[28933]=Math.min(I[28933],100);
  if((I[((116136+(I[28933]-1)*4))>>2]===0)){
    I[28933]=((I[28933]-1)|0);
  }
  if((B[118048]===((-1)|0))){
    I[29511]=((-1)|0);
    return I[29511];
  }else{
    I[29511]=((-2)|0);
    return I[29511];
  }
  return I[29511];
  return I[29511];
}
/* ENLB.R: subroutine enstorchar */
function R_enstorchar($p0){
  if((I[28933]<=100)){
    if((((((I[((115736+(I[28933]-1)*4))>>2]-1)|0)+I[((116136+(I[28933]-1)*4))>>2])|0)<1500)){
      B[(116536+((I[((115736+(I[28933]-1)*4))>>2]+I[((116136+(I[28933]-1)*4))>>2])|0)-1)]=B[$p0];
      I[((116136+(I[28933]-1)*4))>>2]=((I[((116136+(I[28933]-1)*4))>>2]+1)|0);
    }
  }
  return;
}
/* ENLB.R: function enfldn */
function R_enfldn($p0,$p1,$p2){
  if(((I[($p0)>>2]<1)||(I[($p0)>>2]>I[28933]))){
    I[29518]=((-3)|0);
  }else{
    I[29519]=Math.min(I[((116136+(I[($p0)>>2]-1)*4))>>2],((I[($p2)>>2]-1)|0));
    I[29520]=1;
    L1:for(;(I[29520]<=I[29519]);I[29520]=((I[29520]+1)|0)){
      B[($p1+I[29520]-1)]=B[(116536+((((I[((115736+(I[($p0)>>2]-1)*4))>>2]+I[29520])|0)-1)|0)-1)];
    }
    B[($p1+((I[29519]+1)|0)-1)]=0;
    I[29518]=((-2)|0);
  }
  return I[29518];
  return I[29518];
}
/* ENLB.R: function enfldl */
function R_enfldl($p0,$p1,$p2){
  I[29522]=H.length($p0);
  I[29523]=1;
  L1:for(;(I[29523]<=I[28933]);I[29523]=((I[29523]+1)|0)){
    if(((R_eniniseg($p0,118088,(116536+I[((115736+(I[29523]-1)*4))>>2]-1),(116136+(I[29523]-1)*4)))?true:false)){
      break L1;
    }
  }
  I[29521]=R_enfldn(118092,$p1,$p2);
  return I[29521];
  return I[29521];
}
/* ENLB.R: function eniniseg */
function R_eniniseg($p0,$p1,$p2,$p3){
  if((I[($p1)>>2]>I[($p3)>>2])){
    I[29524]=(false?-1:0);
  }else{
    I[29525]=1;
    L1:for(;(I[29525]<=I[($p1)>>2]);I[29525]=((I[29525]+1)|0)){
      if((B[($p2+I[29525]-1)]!==B[($p0+I[29525]-1)])){
        break L1;
      }
    }
    I[29524]=((I[29525]>I[($p1)>>2])?-1:0);
  }
  return ((I[29524]&1)!==0);
  return ((I[29524]&1)!==0);
}
/* RNDLB.R: subroutine rndseq */
function R_rndseq($p0,$p1,$p2,$p3){
  I[($p0)>>2]=$imod(((Math.imul(I[($p0)>>2],I[($p1)>>2])+I[($p2)>>2])|0),I[($p3)>>2]);
  return;
}
/* RNDLB.R: subroutine rndini */
function R_rndini($p0,$p1){
  I[29528]=1541;
  I[29530]=3501;
  I[29532]=16384;
  I[29529]=5146;
  I[29531]=4100;
  I[29533]=19683;
  H.getnow(118936);
  if((I[($p0)>>2]!==0)){
    I[29526]=I[($p0)>>2];
  }else{
    I[29526]=((Math.imul(((Math.imul(((Math.imul(I[((118936+(3-1)*4))>>2],10)+I[((118936+(4-1)*4))>>2])|0),10)+I[((118936+(5-1)*4))>>2])|0),10)+I[((118936+(6-1)*4))>>2])|0);
  }
  I[29526]=$imod(I[29526],I[29532]);
  if((I[($p1)>>2]!==0)){
    I[29527]=I[($p1)>>2];
  }else{
    I[29527]=((Math.imul(((Math.imul(((Math.imul(I[((118936+(6-1)*4))>>2],10)+I[((118936+(5-1)*4))>>2])|0),10)+I[((118936+(4-1)*4))>>2])|0),10)+I[((118936+(3-1)*4))>>2])|0);
  }
  I[29527]=$imod(I[29527],I[29533]);
  I[29741]=1;
  L1:for(;(I[29741]<=200);I[29741]=((I[29741]+1)|0)){
    R_rndseq(118108,118116,118124,118132);
    I[((118136+(I[29741]-1)*4))>>2]=I[29527];
  }
  return;
}
/* RNDLB.R: function rnd */
function R_rnd($p0){
  R_rndseq(118104,118112,118120,118128);
  I[29743]=(($fix(Math.fround(Math.fround(Math.fround(I[29526])/Math.fround(I[29532]))*Math.fround(200)))+1)|0);
  F[29742]=Math.fround(Math.fround(I[((118136+(I[29743]-1)*4))>>2])/Math.fround(I[29533]));
  R_rndseq(118108,118116,118124,118132);
  I[((118136+(I[29743]-1)*4))>>2]=I[29527];
  return F[29742];
  return F[29742];
}
/* RNDLB.R: function rnduni */
function R_rnduni($p0,$p1){
  F[29744]=Math.fround(Math.fround(R_rnd((I[29745]=0,118980))*Math.fround(F[($p1)>>2]-F[($p0)>>2]))+F[($p0)>>2]);
  return F[29744];
  return F[29744];
}
/* RNDLB.R: function rndint */
function R_rndint($p0,$p1){
  I[29746]=(($fix(Math.fround(R_rnd((I[29747]=0,118988))*Math.fround(((((I[($p1)>>2]-I[($p0)>>2])|0)+1)|0))))+I[($p0)>>2])|0);
  return I[29746];
  return I[29746];
}
/* RNDLB.R: function rndnor */
function R_rndnor($p0,$p1){
  L1:do{
    F[29749]=(-Math.fround(Math.log(Math.fround(Math.fround(1.0)-R_rnd((I[29751]=0,119004))))));
    F[29750]=(-Math.fround(Math.log(Math.fround(Math.fround(1.0)-R_rnd((I[29752]=0,119008))))));
  }while(!((Math.fround(Math.fround(2.0)*F[29749])>=Math.fround(Math.pow(Math.fround(F[29750]-Math.fround(1.0)),Math.fround(2))))));
  if((R_rnd((I[29753]=0,119012))>Math.fround(0.5))){
    F[29754]=Math.fround(1.0);
  }else{
    F[29754]=(-Math.fround(1.0));
  }
  F[29748]=Math.fround(Math.fround(Math.fround(F[($p1)>>2]*F[29754])*F[29750])+F[($p0)>>2]);
  return F[29748];
  return F[29748];
}
/* RNDLB.R: function rndexp */
function R_rndexp($p0){
  F[29755]=(-Math.fround(Math.fround(Math.log(Math.fround(Math.fround(1.0)-R_rnd((I[29756]=0,119024)))))*F[($p0)>>2]));
  return F[29755];
  return F[29755];
}
/* RNDLB.R: function rndchi */
function R_rndchi($p0){
  I[29758]=$idiv(I[($p0)>>2],2);
  F[29757]=Math.fround(0.0);
  I[29759]=1;
  L1:for(;(I[29759]<=I[29758]);I[29759]=((I[29759]+1)|0)){
    F[29757]=Math.fround(F[29757]+R_rndexp((F[29760]=Math.fround(1.0),119040)));
  }
  F[29757]=Math.fround(F[29757]*Math.fround(2.0));
  if((((Math.imul(I[29758],2)+1)|0)===I[($p0)>>2])){
    F[29757]=Math.fround(F[29757]+Math.fround(Math.pow(R_rndnor((F[29761]=Math.fround(0.0),119044),(F[29762]=Math.fround(1.0),119048)),Math.fround(2))));
  }
  return F[29757];
  return F[29757];
}
/* RNDLB.R: function rndbta */
function R_rndbta($p0,$p1){
  F[29764]=R_rndchi($p0);
  F[29765]=R_rndchi($p1);
  F[29763]=Math.fround(F[29764]/Math.fround(F[29764]+F[29765]));
  return F[29763];
  return F[29763];
}
/* RNDLB.R: function rndf */
function R_rndf($p0,$p1){
  F[29767]=R_rndchi($p0);
  F[29768]=R_rndchi($p1);
  F[29766]=Math.fround(Math.fround(F[29767]*Math.fround(I[($p1)>>2]))/Math.fround(F[29768]*Math.fround(I[($p0)>>2])));
  return F[29766];
  return F[29766];
}
/* RNDLB.R: function rndt */
function R_rndt($p0){
  F[29772]=R_rndnor((F[29770]=Math.fround(0.0),119080),(F[29771]=Math.fround(1.0),119084));
  F[29773]=R_rndchi($p0);
  F[29769]=Math.fround(F[29772]/Math.fround(Math.sqrt(Math.fround(F[29773]/Math.fround(I[($p0)>>2])))));
  return F[29769];
  return F[29769];
}
/* RNDLB.R: function rndgeo */
function R_rndgeo($p0){
  if(((F[($p0)>>2]<Math.fround(0.0))||(F[($p0)>>2]>Math.fround(1.0)))){
    I[29774]=0;
  }else{
    if((F[($p0)>>2]===Math.fround(1.0))){
      I[29774]=1;
    }else{
      I[29774]=$fix(Math.trunc(Math.fround(Math.fround(Math.fround(Math.log(Math.fround(Math.fround(1.0)-R_rnd((I[29775]=0,119100)))))/Math.fround(Math.log(Math.fround(Math.fround(1.0)-F[($p0)>>2]))))+Math.fround(0.999999))));
    }
  }
  return I[29774];
  return I[29774];
}
/* RNDLB.R: function rndbin */
function R_rndbin($p0,$p1){
  I[29776]=0;
  I[29777]=1;
  L1:for(;(I[29777]<=I[($p0)>>2]);I[29777]=((I[29777]+1)|0)){
    if((R_rnd((I[29778]=0,119112))<=F[($p1)>>2])){
      I[29776]=((I[29776]+1)|0);
    }
  }
  return I[29776];
  return I[29776];
}
/* RNDLB.R: function rndpoi */
function R_rndpoi($p0){
  F[29780]=Math.fround(Math.exp((-F[($p0)>>2])));
  I[29779]=0;
  F[29781]=Math.fround(1.0);
  L1:for(;;){
    F[29781]=Math.fround(F[29781]*R_rnd((I[29782]=0,119128)));
    if((F[29781]<F[29780])){
      break L1;
    }
    I[29779]=((I[29779]+1)|0);
  }
  return I[29779];
  return I[29779];
}
/* IOPLB.R: subroutine iobeep */
function R_iobeep(){
  H.iopchar((I[29783]=7,119132));
  return;
}
/* IOPLB.R: subroutine iocrlf */
function R_iocrlf(){
  H.iopchar((I[29784]=13,119136));
  H.iopchar((I[29785]=10,119140));
  return;
}
/* IOPLB.R: subroutine ioeat */
function* R_ioeat(){
  L1:while(((H.iochav((I[29786]=0,119144)))?true:false)){
    B[119148]=(yield* H.iogchar(119148));
  }
  return;
}
/* IOPLB.R: subroutine ioerror */
function R_ioerror($p0,$p1){
  H.ioend();
  H.fprintf(119152,$p0,$p1);
  I[29789]=H.length($p0);
  if((I[29789]>0)){
    if((B[($p0+I[29789]-1)]!==10)){
      H.putch((I[29790]=10,119160),119152);
    }
  }
  H.error(72976);
  return;
}
/* IOPLB.R: subroutine iofmtstr */
function R_iofmtstr($p0){
  I[29791]=H.length($p0);
  B[119168]=32;
  I[29793]=1;
  L1:while((I[29793]<=I[29791])){
    if((((B[($p0+I[29793]-1)]===10)||(B[($p0+I[29793]-1)]===13))||(B[($p0+I[29793]-1)]===9))){
      B[($p0+I[29793]-1)]=32;
    }
    if(((B[($p0+I[29793]-1)]===32)&&(B[119168]===32))){
      I[29794]=I[29793];
      L2:for(;(I[29794]<=I[29791]);I[29794]=((I[29794]+1)|0)){
        B[($p0+I[29794]-1)]=B[($p0+((I[29794]+1)|0)-1)];
      }
      I[29791]=((I[29791]-1)|0);
      continue L1;
    }
    if((B[($p0+I[29793]-1)]<32)){
      I[29791]=((I[29791]+1)|0);
      I[29794]=I[29791];
      L3:for(;(I[29794]>I[29793]);I[29794]=((I[29794]-1)|0)){
        B[($p0+((I[29794]+1)|0)-1)]=B[($p0+I[29794]-1)];
      }
      B[($p0+((I[29793]+1)|0)-1)]=((B[($p0+I[29793]-1)]+64)|0);
      B[($p0+I[29793]-1)]=94;
      I[29793]=((I[29793]+1)|0);
    }else{
      if((B[($p0+I[29793]-1)]===127)){
        I[29794]=((I[29791]+1)|0);
        L4:for(;(I[29794]>I[29793]);I[29794]=((I[29794]-1)|0)){
          B[($p0+((I[29794]+1)|0)-1)]=B[($p0+I[29794]-1)];
        }
        I[29791]=((I[29791]+1)|0);
        B[($p0+I[29793]-1)]=94;
        I[29793]=((I[29793]+1)|0);
        B[($p0+I[29793]-1)]=63;
      }
    }
    B[119168]=B[($p0+I[29793]-1)];
    I[29793]=((I[29793]+1)|0);
  }
  if((I[29791]>0)){
    if((B[($p0+I[29791]-1)]===32)){
      B[($p0+I[29791]-1)]=0;
    }
  }
  return;
}
/* IOPLB.R: function iogquick */
function* R_iogquick($p0){
  if(((H.iochav((I[29796]=0,119184)))?true:false)){
    B[$p0]=(yield* H.iogchar($p0));
    I[29795]=(true?-1:0);
    return ((I[29795]&1)!==0);
  }
  I[29795]=(false?-1:0);
  return ((I[29795]&1)!==0);
  return ((I[29795]&1)!==0);
}
/* IOPLB.R: function iogstr */
function* R_iogstr($p0,$p1){
  I[29799]=0;
  I[29800]=(false?-1:0);
  L1:for(;;){
    I[29801]=(((I[29800]&1)!==0)?-1:0);
    I[29800]=(((yield* H.iogchar(119208))===22)?-1:0);
    if((!((I[29801]&1)!==0))){
      S2:switch(B[119208]){
        case 127:case 8:{
          if((I[29799]<=0)){
            B[($p0+1-1)]=0;
            I[29798]=(false?-1:0);
            return ((I[29798]&1)!==0);
          }
          if((B[($p0+I[29799]-1)]===32)){
            H.iopchar((I[29803]=8,119212));
          }else{
            R_iopstr(119188);
            if(((B[($p0+I[29799]-1)]<32)||(B[($p0+I[29799]-1)]===127))){
              R_iopstr(119188);
            }
          }
          I[29799]=((I[29799]-1)|0);
          continue L1;
          break S2;
        }
        case 21:case 24:{
          L3:for(;(I[29799]>0);I[29799]=((I[29799]-1)|0)){
            if((B[($p0+I[29799]-1)]===32)){
              H.iopchar((I[29804]=8,119216));
            }else{
              R_iopstr(119188);
              if(((B[($p0+I[29799]-1)]<32)||(B[($p0+I[29799]-1)]===127))){
                R_iopstr(119188);
              }
            }
          }
          continue L1;
          break S2;
        }
        case 23:{
          L4:for(;((I[29799]>0)&&(B[($p0+I[29799]-1)]===32));I[29799]=((I[29799]-1)|0)){
            H.iopchar((I[29805]=8,119220));
          }
          L5:for(;((I[29799]>0)&&(B[($p0+I[29799]-1)]!==32));I[29799]=((I[29799]-1)|0)){
            R_iopstr(119188);
            if(((B[($p0+I[29799]-1)]<32)||(B[($p0+I[29799]-1)]===127))){
              R_iopstr(119188);
            }
          }
          continue L1;
          break S2;
        }
        case 13:case 10:{
          B[($p0+((I[29799]+1)|0)-1)]=0;
          break L1;
          break S2;
        }
      }
    }
    if((((I[29799]+1)|0)<I[($p1)>>2])){
      if(((!((I[29800]&1)!==0))||((I[29801]&1)!==0))){
        I[29799]=((I[29799]+1)|0);
        B[($p0+I[29799]-1)]=B[119208];
      }
      if(((B[119208]<32)||(B[119208]===127))){
        if(((I[29801]&1)!==0)){
          H.iopchar((I[29806]=8,119224));
          if((!((22<32)||(22===127)))){
            H.iopchar((I[29807]=94,119228));
          }
        }else{
          H.iopchar((I[29808]=94,119232));
        }
        if((B[119208]===127)){
          H.iopchar((I[29809]=63,119236));
        }else{
          H.iopchar((I[29810]=((B[119208]+64)|0),119240));
        }
      }else{
        if(((I[29801]&1)!==0)){
          if(((22<32)||(22===127))){
            R_iopstr(119188);
          }
          H.iopchar((I[29811]=8,119244));
        }
        H.iopchar(119208);
      }
    }else{
      R_iobeep();
    }
    if(((I[29801]&1)!==0)){
      I[29800]=(false?-1:0);
    }
  }
  I[29798]=(true?-1:0);
  return ((I[29798]&1)!==0);
  return ((I[29798]&1)!==0);
}
/* IOPLB.R: subroutine iopline */
function R_iopline($p0){
  I[29812]=1;
  L1:for(;(B[($p0+I[29812]-1)]!==0);I[29812]=((I[29812]+1)|0)){
    if((B[($p0+I[29812]-1)]===10)){
      R_iocrlf();
    }else{
      H.iopchar(($p0+I[29812]-1));
    }
  }
  return;
}
/* IOPLB.R: subroutine iopstr */
function R_iopstr($p0){
  H.iopbuf((I[29813]=H.length($p0),119252),$p0);
  return;
}
/* IOPLB.R: subroutine iospaces */
function R_iospaces($p0){
  I[29814]=I[($p0)>>2];
  L1:for(;(I[29814]>0);I[29814]=((I[29814]-1)|0)){
    H.iopchar((I[29815]=32,119260));
  }
  return;
}
/* CONQVMS.R: subroutine astservice */
function R_astservice(){
  if((!((I[94]&1)!==0))){
    return;
  }
  if((!((R_stillalive(324))?true:false))){
    return;
  }
  H.drcheck();
  I[29816]=(false?-1:0);
  if(((I[96]&1)!==0)){
    if((R_dgrand(352,119268)>=1900)){
      if(((R_getamsg(324,(25604+(I[81]-1)*4)))?true:false)){
        R_readmsg(324,(25604+(I[81]-1)*4));
        I[88]=I[29817];
        I[29816]=(true?-1:0);
      }
    }
  }
  R_display(324);
  if(((I[29816]&1)!==0)){
    if(((H.iochav((I[29818]=0,119272)))?true:false)){
      I[((25604+(I[81]-1)*4))>>2]=R_modp1((I[29819]=((I[((25604+(I[81]-1)*4))>>2]-1)|0),119276),(I[29820]=60,119280));
    }
  }
  H.settimer();
  return;
}
/* CONQVMS.R: subroutine conqend */
function R_conqend(){
  H.gamend();
  return;
}
/* CONQVMS.R: subroutine conqstats */
function R_conqstats($p0){
  I[29821]=0;
  I[29822]=0;
  R_upstats((27284+(I[($p0)>>2]-1)*4),(27364+(I[($p0)>>2]-1)*4),(27444+(I[($p0)>>2]-1)*4),(27524+(I[($p0)>>2]-1)*4),119284,119288);
  H.pvlock(604);
  if((I[((18804+(I[($p0)>>2]-1)*4))>>2]!==0)){
    I[29823]=I[((18644+(I[($p0)>>2]-1)*4))>>2];
    I[((1612+(I[29823]+Math.imul(2,40)-41)*4))>>2]=((I[((1612+(I[29823]+Math.imul(2,40)-41)*4))>>2]+I[29821])|0);
    I[((1612+(I[29823]+Math.imul(1,40)-41)*4))>>2]=((I[((1612+(I[29823]+Math.imul(1,40)-41)*4))>>2]+I[29822])|0);
    I[29824]=I[((1292+(I[29823]-1)*4))>>2];
    I[((748+(I[29824]+Math.imul(2,4)-5)*4))>>2]=((I[((748+(I[29824]+Math.imul(2,4)-5)*4))>>2]+I[29821])|0);
    I[((748+(I[29824]+Math.imul(1,4)-5)*4))>>2]=((I[((748+(I[29824]+Math.imul(1,4)-5)*4))>>2]+I[29822])|0);
    I[271]=((I[271]+I[29821])|0);
    I[272]=((I[272]+I[29822])|0);
  }
  H.pvunlock(604);
  return;
}
/* CONQVMS.R: subroutine drkill */
function R_drkill(){
  if((I[83]!==0)){
    if(((I[83]===I[4608])&&(I[4607]===3))){
      H.pvlock(604);
      if(((I[83]===I[4608])&&(I[4607]===3))){
        I[4607]=5;
      }
      H.pvunlock(604);
    }
  }
  return;
}
/* CONQVMS.R: subroutine drpexit */
function* R_drpexit(){
  if((I[83]!==0)){
    R_drkill();
    I[29825]=1;
    L1:for(;((I[83]===I[4608])&&(I[29825]<=50));I[29825]=((I[29825]+1)|0)){
      (yield* H.sleep((F[29826]=Math.fround(0.1),119304)));
    }
    if((I[83]===I[4608])){
      R_cerror((I[29827]=((-102)|0),119308),119312,332);
    }
  }
  return;
}
/* CONQVMS.R: subroutine drstart */
function R_drstart(){
  if((I[4607]===0)){
    H.pvlock(604);
    if((I[4607]===0)){
      H.drcreate();
    }
    H.pvunlock(604);
  }
  return;
}
/* CONQVMS.R: subroutine helplesson */
function* R_helplesson(){
  H.prints(119354,119444,142);
  (yield* R_pagefile(142,119354,(I[29865]=(true?-1:0),119460),(I[29866]=(true?-1:0),119464)));
  return;
}
/* CONQVMS.R: subroutine initstats */
function R_initstats($p0,$p1){
  H.gcputime($p0);
  R_grand($p1);
  return;
}
/* CONQVMS.R: function isagod */
function R_isagod($p0){
  I[29867]=(((H.gamtname($p0,110,(I[29868]=(false?-1:0),119472)))?true:false)?-1:0);
  return ((I[29867]&1)!==0);
  return ((I[29867]&1)!==0);
}
/* CONQVMS.R: function mail */
function R_mail($p0,$p1,$p2){
  H.strcpy(119480,$p2);
  I[29869]=(false?-1:0);
  return ((I[29869]&1)!==0);
  return ((I[29869]&1)!==0);
}
/* CONQVMS.R: function mailimps */
function R_mailimps($p0,$p1){
  if((B[(119499+1-1)]===0)){
    H.strcpy(119524,$p1);
    I[29880]=(false?-1:0);
    return ((I[29880]&1)!==0);
  }
  I[29880]=(((R_mail(119572,$p0,$p1))?true:false)?-1:0);
  return ((I[29880]&1)!==0);
  return ((I[29880]&1)!==0);
}
/* CONQVMS.R: subroutine news */
function* R_news(){
  (yield* R_pagefile(117,119591,(I[29904]=(true?-1:0),119616),(I[29905]=(true?-1:0),119620)));
  return;
}
/* CONQVMS.R: subroutine upstats */
function R_upstats($p0,$p1,$p2,$p3,$p4,$p5){
  H.gcputime(119624);
  I[($p2)>>2]=((((I[($p2)>>2]+I[29906])|0)-I[($p0)>>2])|0);
  I[($p0)>>2]=I[29906];
  if((I[($p2)>>2]>100)){
    I[($p4)>>2]=((I[($p4)>>2]+$idiv(I[($p2)>>2],100))|0);
    I[($p2)>>2]=$imod(I[($p2)>>2],100);
  }
  I[($p3)>>2]=((I[($p3)>>2]+R_dgrand($p1,119628))|0);
  if((I[($p3)>>2]>1000)){
    I[($p1)>>2]=I[29907];
    I[($p5)>>2]=((I[($p5)>>2]+$idiv(I[($p3)>>2],1000))|0);
    I[($p3)>>2]=$imod(I[($p3)>>2],1000);
  }
  return;
}
/* GAMLB.R: function gamcheck */
function R_gamcheck($p0){
  H.getnow(119636);
  if((R_enfldn((I[29916]=5,119664),119668,(I[29950]=132,119800))===((-3)|0))){
    I[29908]=(false?-1:0);
    return ((I[29908]&1)!==0);
  }
  I[29951]=((H.wkday((119636+(2-1)*4),(119636+(3-1)*4),(119636+(1-1)*4))-1)|0);
  if((I[29951]===0)){
    I[29951]=7;
  }
  if((!((R_gamcmp(119804,119668))?true:false))){
    I[29908]=(false?-1:0);
    return ((I[29908]&1)!==0);
  }
  I[29954]=R_enfldn((I[29952]=4,119808),119668,(I[29953]=132,119812));
  if((!((R_gamcmp((119636+(2-1)*4),119668))?true:false))){
    I[29908]=(false?-1:0);
    return ((I[29908]&1)!==0);
  }
  I[29954]=R_enfldn((I[29955]=3,119820),119668,(I[29956]=132,119824));
  if((!((R_gamcmp((119636+(3-1)*4),119668))?true:false))){
    I[29908]=(false?-1:0);
    return ((I[29908]&1)!==0);
  }
  I[29954]=R_enfldn((I[29957]=2,119828),119668,(I[29958]=132,119832));
  if((!((R_gamcmp((119636+(4-1)*4),119668))?true:false))){
    I[29908]=(false?-1:0);
    return ((I[29908]&1)!==0);
  }
  if((R_enfldn((I[29959]=1,119836),119668,(I[29960]=132,119840))===((-3)|0))){
    I[29908]=(false?-1:0);
    return ((I[29908]&1)!==0);
  }
  if((!((R_gamcmp((119636+(5-1)*4),119668))?true:false))){
    I[29908]=(false?-1:0);
    return ((I[29908]&1)!==0);
  }
  B[(119844+1-1)]=0;
  I[29954]=R_enfldn((I[29994]=6,119976),119844,(I[29995]=132,119980));
  if((B[(119844+1-1)]!==0)){
    H.printf(119984,119844);
  }
  I[29908]=(true?-1:0);
  return ((I[29908]&1)!==0);
  return ((I[29908]&1)!==0);
}
/* GAMLB.R: function gamcmp */
function R_gamcmp($p0,$p1){
  if(((B[($p1+1-1)]===42)&&(B[($p1+2-1)]===0))){
    I[29997]=(true?-1:0);
    return ((I[29997]&1)!==0);
  }
  if((H.index($p1,(I[29998]=45,119992))!==0)){
    I[29999]=1;
    if((I[($p0)>>2]<H.ctoi($p1,119996))){
      I[29997]=(false?-1:0);
      return ((I[29997]&1)!==0);
    }
    if((B[($p1+I[29999]-1)]!==45)){
      I[29997]=(false?-1:0);
      return ((I[29997]&1)!==0);
    }
    I[29999]=((I[29999]+1)|0);
    if((I[($p0)>>2]>H.ctoi($p1,119996))){
      I[29997]=(false?-1:0);
      return ((I[29997]&1)!==0);
    }
    if((B[($p1+I[29999]-1)]!==0)){
      I[29997]=(false?-1:0);
      return ((I[29997]&1)!==0);
    }
    I[29997]=(true?-1:0);
    return ((I[29997]&1)!==0);
  }
  I[29999]=1;
  L1:while((B[($p1+I[29999]-1)]!==0)){
    if((H.type(($p1+I[29999]-1))!==2)){
      I[29997]=(false?-1:0);
      return ((I[29997]&1)!==0);
    }
    if((I[($p0)>>2]===H.ctoi($p1,119996))){
      I[29997]=(true?-1:0);
      return ((I[29997]&1)!==0);
    }
    if((B[($p1+I[29999]-1)]===44)){
      I[29999]=((I[29999]+1)|0);
    }
  }
  I[29997]=(false?-1:0);
  return ((I[29997]&1)!==0);
  return ((I[29997]&1)!==0);
}
var $GEN=["capentry", "cdgetn", "cdgetp", "cdgets", "cdgetx", "command", "confirm", "conquest", "dead", "doalloc", "doautopilot", "dobeam", "dobomb", "doburst", "docloak", "docoup", "docourse", "dodistress", "dohelp", "doinfo", "dooption", "dophase", "doplanlist", "doreview", "doselfdest", "dosubdcl", "doteamlist", "dotorp", "dotow", "dountow", "dowar", "drpexit", "getcx", "gettarget", "helplesson", "histlist", "ioeat", "iogchar", "iogquick", "iogstr", "iogtimed", "menu", "more", "news", "newship", "pagefile", "play", "playlist", "pseudo", "review", "scget", "scgetk", "scpeek", "sendmsg", "sleep", "userlist", "userstats", "welcome"];
/* ---------- Fortran's memory: one heap; I, F and B look at it as integers, reals and bytes ---------- */
var $MEM=new ArrayBuffer(($HEAPSIZE+4096+7)&~7),I=new Int32Array($MEM),F=new Float32Array($MEM),B=new Int8Array($MEM);
function $loadinits(){
  $INITS.forEach(function(x){
    var a=x[0],t=x[1],v=x[2];
    if(t==='s')for(var i=0;i<v.length;i++)B[a+i]=v.charCodeAt(i); /* a run of characters */
    else if(t==='c'||t==='b')B[a]=v&255;else if(t==='r')F[a>>2]=v;else I[a>>2]=v|0;
  });
}
$loadinits();
function $fix(x){x=Math.trunc(x);return x>2147483647?2147483647:x<-2147483648?-2147483648:x|0} /* CVTFL */
function $idiv(a,b){if(b===0)throw new $Fault('%SYSTEM-F-INTDIV, arithmetic trap, integer divide by zero');return (a/b)|0}
function $imod(a,b){if(b===0)throw new $Fault('%SYSTEM-F-INTDIV, arithmetic trap, integer divide by zero');return (a%b)|0}
function $nint(x){return $fix(x<0?-Math.floor(-x+0.5):Math.floor(x+0.5))} /* JNINT: halves away from zero */
function $anint(x){return x<0?-Math.floor(-x+0.5):Math.floor(x+0.5)}
function $Fault(m){this.message=m;this.stack=new Error(m).stack}
function $Exit(m){this.message=m}
/* strings in memory: bytes up to EOS (0) */
function $str(a){var s='';while(B[a])s+=String.fromCharCode(B[a++]&255);return s}
function $setstr(a,s){for(var i=0;i<s.length;i++)B[a+i]=s.charCodeAt(i)&255;B[a+s.length]=0}
var $SYMS={};
Object.keys($COMMON).forEach(function(b){Object.keys($COMMON[b]).forEach(function(n){$SYMS[n]=$COMMON[b][n][0]})});
function $i(n){return I[$SYMS[n]>>2]}
function $seti(n,v){I[$SYMS[n]>>2]=v}
function $l(n){return (I[$SYMS[n]>>2]&1)!==0}
function $setl(n,v){I[$SYMS[n]>>2]=v?-1:0}

/* ---------- the terminal: a VT100, 24 rows of 80, fed by the output buffer ---------- */
var $R=24,$C=80,$scr=[],$cy=0,$cx=0,$top=0,$bot=23,$g=false,$esc=null,$obuf=[],$keys=[],$show=function(){},$bell=function(){};
for(var $r=0;$r<$R;$r++)$scr.push(new Array($C).fill(' '));
var $GR={'q':'─','x':'│','l':'┌','k':'┐','j':'┘','m':'└','t':'├','u':'┤','v':'┴','w':'┬','n':'┼','`':'◆','a':'▒'};
function $scroll(){ /* within the scrolling region */
  $scr.splice($top,1);$scr.splice($bot,0,new Array($C).fill(' '));
}
function $rscroll(){$scr.splice($bot,1);$scr.splice($top,0,new Array($C).fill(' '))}
function $tput(c){
  if($esc!==null){
    $esc+=c;
    var m;
    if($esc==='['||/^\[[\d;]*$/.test($esc)||$esc==='('||$esc==='#')return;
    if((m=/^\[([\d;]*)([A-Za-z])$/.exec($esc))){
      var p=m[1].split(';').map(function(x){return x===''?0:+x}),n=p[0]||1;
      switch(m[2]){
        case 'H':case 'f':$cy=Math.min($R-1,Math.max(0,(p[0]||1)-1));$cx=Math.min($C-1,Math.max(0,(p[1]||1)-1));break;
        case 'A':$cy=Math.max($top,$cy-n);break;
        case 'B':$cy=Math.min($bot,$cy+n);break;
        case 'C':$cx=Math.min($C-1,$cx+n);break;
        case 'D':$cx=Math.max(0,$cx-n);break;
        case 'K':{var w=p[0]||0,a=w===0?$cx:0,b=w===1?$cx:$C-1;for(var x=a;x<=b;x++)$scr[$cy][x]=' ';break}
        case 'J':{var w2=p[0]||0;
          if(w2===2){for(var y=0;y<$R;y++)$scr[y].fill(' ')}
          else{for(var x2=$cx;x2<$C;x2++)$scr[$cy][x2]=' ';for(var y2=$cy+1;y2<$R;y2++)$scr[y2].fill(' ')}
          break}
        case 'r':$top=Math.max(0,(p[0]||1)-1);$bot=Math.min($R-1,(p[1]||$R)-1);$cy=0;$cx=0;break;
        default:break; /* m (attributes), h, l: the glass shows no attributes */
      }
      $esc=null;return;
    }
    if((m=/^\(([AB0])$/.exec($esc))){$g=m[1]==='0';$esc=null;return}
    if($esc==='M'){if($cy===$top)$rscroll();else if($cy>0)$cy--;$esc=null;return}
    if($esc==='D'){if($cy===$bot)$scroll();else if($cy<$R-1)$cy++;$esc=null;return}
    if($esc==='E'){$cx=0;if($cy===$bot)$scroll();else if($cy<$R-1)$cy++;$esc=null;return}
    $esc=null;return; /* = > 7 8 c and anything else: nothing to show */
  }
  var k=c.charCodeAt(0);
  if(k===27){$esc='';return}
  if(k===13){$cx=0;return}
  if(k===10||k===11||k===12){if($cy===$bot)$scroll();else if($cy<$R-1)$cy++;return}
  if(k===8){if($cx>0)$cx--;return}
  if(k===9){$cx=Math.min($C-1,($cx+8)&~7);return}
  if(k===7){$bell();return}
  if(k<32||k===127)return;
  if($cx>=$C){$cx=$C-1} /* no autowrap: termcap says noautonl */
  $scr[$cy][$cx]=$g&&$GR[c]?$GR[c]:c;
  if($cx<$C-1)$cx++;else $cx=$C;
}
function $flush(){
  if(!$obuf.length)return;
  var s=String.fromCharCode.apply(null,$obuf.map(function(x){return x&255}));$obuf=[];
  for(var i=0;i<s.length;i++)$tput(s.charAt(i));
  $show();
}

/* ---------- IONLB, IOXLB, TSLB: the terminal's channel ---------- */
var H={},$autobroad=false;
H.ioinit=function(){};
H.ioend=function(){$flush()};
H.ioflush=function(){$flush()};
H.iopchar=function(c){$obuf.push(B[c]);if($obuf.length>=512)$flush()};
H.iopbuf=function(n,s){for(var i=0,k=I[n>>2];i<k;i++)$obuf.push(B[s+i]);if($obuf.length>=512)$flush()};
H.iochav=function(d){return $keys.length>0};
H.ioautobroad=function(a){var t=$autobroad;$autobroad=(I[a>>2]&1)!==0;return t};
H.iogbroadcast=function(b){B[b]=0;return false}; /* no one sends broadcasts here */
H.tsinit=function(){};H.tsend=function(){};
H.tsgspeed=function(i,o){F[i>>2]=Math.fround(0.96);F[o>>2]=Math.fround(0.96)}; /* 9600 baud */
/* reads: the asts (the one-second timer) run while the program waits, as sys$setast enables them around the QIO */
H.iogchar=function*(ch){
  $flush();
  var c=$keys.length?$keys.shift():yield {key:true,timeout:-1};
  B[ch]=c;return c;
};
H.iogtimed=function*(ch,secs){
  $flush();
  if($keys.length){B[ch]=$keys.shift();return true}
  var c=yield {key:true,timeout:I[secs>>2]*1000};
  if(c===null||c===undefined)return false;
  B[ch]=c;return true;
};
/* LIB$WAIT and the like */
H.sleep=function*(t){$flush();yield {sleep:Math.max(0,F[t>>2])*1000}};

/* ---------- the Software Tools library ---------- */
H.length=function(s){var n=0;while(B[s+n])n++;return n};
H.strcpy=function(f,t){var i=0;do{B[t+i]=B[f+i]}while(B[f+i++]);};
H.scopy=function(f,i,t,j){var a=f+I[i>>2]-1,b=t+I[j>>2]-1;do{B[b++]=B[a]}while(B[a++]);};
H.appstr=function(s,b){var n=H.length(b);H.strcpy(s,b+n)};
H.appchr=function(c,b){var n=H.length(b);B[b+n]=B[c];B[b+n+1]=0};
H.concat=function(a,b,o){var s=$str(a)+$str(b);$setstr(o,s)};
H.chcopy=function(c,s,j){var k=I[j>>2];B[s+k-1]=B[c];I[j>>2]=k+1;B[s+k]=0};
H.index=function(s,c){var ch=B[c];for(var i=0;B[s+i];i++)if(B[s+i]===ch)return i+1;return 0};
H.equal=function(a,b){return $str(a)===$str(b)?1:0}; /* YES or NO */
H.strcmp=function(a,b){var x=$str(a),y=$str(b);return x<y?-1:x>y?1:0};
H.cupper=function(c){var k=B[c];return k>=97&&k<=122?k-32:k};
H.clower=function(c){var k=B[c];return k>=65&&k<=90?k+32:k};
H.upper=function(s){for(var i=0;B[s+i];i++)if(B[s+i]>=97&&B[s+i]<=122)B[s+i]-=32};
H.fold=function(s){for(var i=0;B[s+i];i++)if(B[s+i]>=65&&B[s+i]<=90)B[s+i]+=32};
H.type=function(c){var k=B[c];return (k>=65&&k<=90)||(k>=97&&k<=122)?1:k>=48&&k<=57?2:k};
H.alldig=function(s){if(!B[s])return 0;for(var i=0;B[s+i];i++)if(B[s+i]<48||B[s+i]>57)return 0;return 1};
/* ctoi: blanks, then a signed number; i left after it */
H.ctoi=function(s,ip){
  var i=I[ip>>2]-1,neg=false,n=0;
  while(B[s+i]===32||B[s+i]===9)i++;
  if(B[s+i]===45||B[s+i]===43){neg=B[s+i]===45;i++}
  while(B[s+i]>=48&&B[s+i]<=57){n=(Math.imul(n,10)+B[s+i]-48)|0;i++}
  I[ip>>2]=i+1;return neg?-n|0:n;
};
H.ctor=function(s,ip){
  var i=I[ip>>2]-1;while(B[s+i]===32)i++;
  var m=/^[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?/.exec($str(s+i));
  if(!m){I[ip>>2]=i+1;return 0}
  I[ip>>2]=i+1+m[0].length;return Math.fround(parseFloat(m[0]));
};
H.itoc=function(n,s,size){var t=String(I[n>>2]);t=t.slice(0,Math.max(0,I[size>>2]-1));$setstr(s,t);return t.length};
/* printf's family: %d %x %o %c %s %f %g, with - and a width */
function $fmt(f,args){
  var o='',k=0;
  for(var i=0;i<f.length;i++){
    var c=f.charAt(i);
    if(c!=='%'){o+=c;continue}
    var m=/^%(-?)(0?)(\d*)(?:\.(\d+))?([dxXocsfge%])/.exec(f.slice(i));
    if(!m){o+=c;continue}
    i+=m[0].length-1;
    if(m[5]==='%'){o+='%';continue}
    var a=args[k++],v;
    switch(m[5]){
      case 'd':v=String(I[a>>2]);break;
      case 'x':case 'X':v=(I[a>>2]>>>0).toString(16);break;
      case 'o':v=(I[a>>2]>>>0).toString(8);break;
      case 'c':v=String.fromCharCode(B[a]);break;
      case 's':v=$str(a);if(m[4])v=v.slice(0,+m[4]);break;
      case 'g':case 'e':{var x=+F[a>>2],pr=m[4]?+m[4]:6;
        if(m[5]==='e'){v=x.toExponential(pr);break}
        if(x===0){v='0';break}
        var ex=Math.floor(Math.log10(Math.abs(x)));
        v=ex<-4||ex>=pr?x.toExponential(pr-1).replace(/\.?0+e/,'e'):x.toFixed(Math.max(0,pr-1-ex)).replace(/(\.\d*?)0+$/,'$1').replace(/\.$/,'');
        break}
      default:v=(+F[a>>2]).toFixed(m[4]?+m[4]:6);
    }
    var w=+(m[3]||0);
    if(v.length<w)v=m[1]?v+' '.repeat(w-v.length):(m[2]?'0':' ').repeat(w-v.length)+v;
    o+=v;
  }
  return o;
}
H.prints=function(b,f){$setstr(b,$fmt($str(f),[].slice.call(arguments,2)))};
function $out(s){for(var i=0;i<s.length;i++)$obuf.push(s.charCodeAt(i)===10?13:s.charCodeAt(i)),s.charCodeAt(i)===10&&$obuf.push(10)}
H.printf=function(f){$out($fmt($str(f),[].slice.call(arguments,1)))};
H.fprintf=function(fd,f){$out($fmt($str(f),[].slice.call(arguments,2)))};
H.eprintf=function(f){$out($fmt($str(f),[].slice.call(arguments,1)))};
H.putch=function(c,fd){$out(String.fromCharCode(B[c]))};
/* error: the message, and the program stops */
H.error=function(s){var m=$str(s);if(m)$out(m+'\n');$flush();throw new $Exit(m)};
H['sys_S_exit']=function(){$flush();throw new $Exit('')};
H.pvlock=function(){};H.pvunlock=function(){};
/* the clock: getnow fills year, month, day, hour, minute, second, millisecond */
var $real=false; /* the play hours follow the visitor's own week and day, not the machine's 1988 */
function $now(){return $real?new Date():P.now?P.now():new Date(Date.now())}
H.getnow=function(a){
  var d=$now(),v=[d.getFullYear(),d.getMonth()+1,d.getDate(),d.getHours(),d.getMinutes(),d.getSeconds(),d.getMilliseconds()];
  for(var i=0;i<7;i++)I[(a>>2)+i]=v[i];
};
H.wkday=function(m,d,y){return new Date(I[y>>2],I[m>>2]-1,I[d>>2]).getDay()+1};
H.glname=function(b){$setstr(b,String(P.st&&P.st.user||'guest').toLowerCase().slice(0,30))};
H.envget=function(n,v){if($str(n)==='TERM'){$setstr(v,'vt100');return -2}B[v]=0;return -3};
H['lib_S_ffs']=function(st,sz,base,pos){
  var v=I[base>>2]>>>I[st>>2];
  if(!v){I[pos>>2]=I[st>>2]+I[sz>>2];return 1409584}
  I[pos>>2]=I[st>>2]+31-Math.clz32(v&-v);return 1;
};
/* files: what the program reads (TERMCAP, GAMCRON, the news and the help file) is carried in this file */
var $fds={},$nfd=4;
function $fname(s){return String(s).toUpperCase().replace(/^.*[:\]>\/]/,'').replace(/;.*$/,'').replace(/\.$/,'')}
H.open=function(n,mode){
  var f=$FILES[$fname($str(n))];
  if(!f||I[mode>>2]!==1)return -3;
  var fd=$nfd++;$fds[fd]={L:f,i:0,c:0};return fd;
};
H.close=function(fd){delete $fds[I[fd>>2]]};
H.getlin=function(b,fd){
  var f=$fds[I[fd>>2]];if(!f||f.i>=f.L.length)return -1;
  var s=f.L[f.i++]+'\n';$setstr(b,s.slice(0,131));return Math.min(s.length,131);
};
H.getch=function(c,fd){
  var f=$fds[I[fd>>2]];if(!f||f.i>=f.L.length){B[c]=255;return -1}
  var l=f.L[f.i];var k=f.c<l.length?l.charCodeAt(f.c):10;
  if(f.c<l.length)f.c++;else{f.i++;f.c=0}
  B[c]=k;return k;
};

/* ---------- CONQVMS.R's VMS parts ---------- */
var $astok=true,$timer=null,$astdue=false,$cpu0=Date.now();
H.astoff=function(){$astok=false};
H.aston=function(){$astok=true};
/* settimer: astservice in a second; the driver below delivers it while the program waits */
H.settimer=function(){$astdue=Date.now()+1000};
H.stoptimer=function(){$astdue=false};
H.gcputime=function(c){I[c>>2]=((Date.now()-$cpu0)/10)|0};
H.dosubdcl=function*(){}; /* not reached: csubdcl is false here */
H.drcheck=function(){R_dsecs($SYMS.drivtime,$SYMS.playtime);if(!$driver)R_drstart()}; /* the player's time stamp, and a driver if there is none */
H.drcreate=function(){$startdriver()};
/* upchuck: the common block to this browser's storage, as sys$updsec wrote it to its section file */
H.upchuck=function(){
  var a=$SYMS.closed,b=$SYMS.glastmsg+4,s='';
  for(var i=a;i<b;i++)s+=String.fromCharCode(B[i]&255);
  P.save('conquest/common',{stamp:$STAMP,data:btoa(s)});
  R_getdandt($SYMS.lastupchuck);
};
/* GAMLB.R's VMS parts: who may play, and when (gamcheck itself is translated) */
H.gamtname=function(name,list,tty){
  var n=$str(name).toLowerCase(),l=$str(list).toLowerCase().split(':');
  return l.indexOf(n)>=0;
};
H.gamend=function(){};
H.gamcronfile=function(b){$setstr(b,'DUA0:[GAMES]GAMCRON.')};
H.gamlinit=function(fdial,fprio,fcron,despri,badlist,badttylist,truename,cronfile){
  if(B[badlist]&&H.gamtname(R_$glname(),badlist,0))H.error($S('You are NOT allowed to play this game.'));
  if((I[fcron>>2]&1)!==0){
    var gc=$scratch(132);
    if(B[cronfile])H.strcpy(cronfile,gc);else H.gamcronfile(gc);
    if(R_enopen(gc)===-3){H.eprintf($S('gamlb$gaminit: Failed to open the game cron file, %s.\n'),gc);return}
    var ok=false;
    $real=true;
    try{for(;;){if(R_engetnext($S0())===-1)break;if(R_gamcheck($S0())){ok=true;break}}}
    finally{$real=false}
    R_enclose();
    if(!ok){
      H.eprintf($S('Now is not a good time to play games. For valid times,\n'));
      H.eprintf($S('please consult %s'),gc);
      H.error($S(''));
    }
  }
};
/* addresses for the hand code's own strings and scratch */
var $hs=$HEAPSIZE;
function $scratch(n){var a=$hs;$hs+=(n+3)&~3;if($hs>$MEM.byteLength)throw new $Fault('%SYSTEM-F-ACCVIO, access violation');return a}
function $S(s){var a=$scratch(s.length+1);$setstr(a,s);return a}
function $S0(){var a=$scratch(4);I[a>>2]=0;return a}
function R_$glname(){var a=$scratch(40);H.glname(a);return a}
H.conqinit=function(){
  if($i('commonrev')!==$STAMP)H.error($S('conquest: Common block ident mismatch.'));
  H.gamlinit($S0(),$S0(),(function(){var a=$S0();I[a>>2]=-1;return a})(),$S0(),$EXT.c_conq_antigods,$EXT.c_conq_badttys,$EXT.c_conq_conquest,$EXT.c_conq_gamcron);
  $seti('cpid',$PID);
  $setl('csubdcl',false);
  $setl('cnewsfile',true);
  $seti('childpid',0);
  $seti('clastime',0);
  B[$SYMS.clastinfostr]=0;
};

var $FILES={"TERMCAP": ["# termcap - Software Tools termcap file (revision history at the end)", "", "20:h19|19|Heathkit H19:lins#24:cols#80:@", "    :beep=^G:autonl:clear=@EE:home=@EH:move=@EYl1c1:cel=@EK:@", "    :bs:right=@EC:up=@EA:down=^J:sup=^J:sdown=@EI:tab=^i:@", "    :inl=@EL:dll=@EM:iim=@E@@:oim=@EO:dlc=@EN:@", "    :att=-g=@EG:att=g=@EF:att=-r=@Eq:att=r=@Ep:pillow=(g)i:padc=@000:@", "    :lshigh:lsegud=(g)`:lsegrl=(g)a:lsegruld=(g)b:@", "    :lsegu=(g)`:lsegd=(g)`:lsegr=(g)a:lsegl=(g)a:@", "    :lsegld=(g)c:lsegul=(g)d:lsegru=(g)e:lsegrd=(g)f:@", "    :lsegrld=(g)s:lseguld=(g)t:lsegrul=(g)u:lsegrud=(g)v:@", "    :f1=@ES:f2=@ET:f3=@EU:f4=@EV:f5=@EW:@", "    :ikey=@E=:okey=@E>:k0=@E?p:k1=@E?q:k2=@E?r:k3=@E?s:k4=@E?t:k5=@E?u:@", "    :k6=@E?v:k7=@E?w:k8=@E?x:k9=@E?y:kenter=@E?M:kperiod=@E?n:@", "    :kup=@EA:kdown=@EB:kright=@EC:kleft=@ED:pclear#14:pinl#21:pdll#21:", "96:v1|vt1|vt100|100|DEC VT100|Digital Equipment VT100:lins#24:cols#80:@", "    :clear=@E[H@E[J:home=@E[H:move=@E[l2;c2H:@", "    :bs:right=@E[C:up=@E[A:down=@E[B:@", "    :pillow=(r) :@", "    :att=-h-u-r-b=@E[0m:att=h=@E[1m:att=u=@E[4m:att=r=@E[7m:att=b=@E[5m:@", "    :att=-g-a=@E(B:att=-ga=@E(A:att=g-a=@E(0:@", "    :ikey=@E=:okey=@E>:k0=@EOp:k1=@EOq:k2=@EOr:k3=@EOs:k4=@EOt:k5=@EOu:@", "    :k6=@EOv:k7=@EOw:k8=@EOx:k9=@EOy:f1=@EOP:f2=@EOQ:f3=@EOR:f4=@EOS:@", "    :kup=@E[A:kdown=@E[B:kleft=@E[D:kright=@E[C:@", "    :kcomma=@EOl:kenter=@EOM:kminus=@EOm:kperiod=@EOn:@", "    :xonoff:noautonl:beep=^G:cel=@E[K:chscroll=@E[%fn;%lnr:@", "    :sdown=@EM:sup=^J:tab=^I:@", "    :pcel#2.1:pclear#46.9:psdown#31.3:psup#31.3:lshigh:@", "    :lsegd=(g)x:lsegl=(g)q:lsegld=(g)k:@", "    :lsegu=(g)x:lsegud=(g)x:lsegul=(g)j:lseguld=(g)u:@", "    :lsegr=(g)q:lsegrd=(g)l:lsegrl=(g)q:lsegrld=(g)w:@", "    :lsegru=(g)m:lsegrud=(g)t:lsegrul=(g)v:lsegruld=(g)n:", "138:go|go140|GraphOn 140:lins#24:cols#80:@", "    :clear=@E[H@E[J:home=@E[H:move=@E[l2;c2H:@", "    :bs:right=@E[C:up=@E[A:down=@E[B:@", "    :pillow=(r) :@", "    :att=-h-u-r-b=@E[0m:att=h=@E[1m:att=u=@E[4m:att=r=@E[7m:att=b=@E[5m:@", "    :att=-g-a=@E(B:att=-ga=@E(A:att=g-a=@E(0:@", "    :ikey=@E=:okey=@E>:k0=@EOp:k1=@EOq:k2=@EOr:k3=@EOs:k4=@EOt:k5=@EOu:@", "    :k6=@EOv:k7=@EOw:k8=@EOx:k9=@EOy:f1=@EOP:f2=@EOQ:f3=@EOR:f4=@EOS:@", "    :kup=@E[A:kdown=@E[B:kleft=@E[D:kright=@E[C:@", "    :kcomma=@EOl:kenter=@EOM:kminus=@EOm:kperiod=@EOn:@", "    :xonoff:noautonl:beep=^G:cel=@E[K:chscroll=@E[%fn;%lnr:@", "    :sdown=@EM:sup=^J:tab=^I:@", "    :pcel#2.1:pclear#46.9:psdown#31.3:psup#31.3:lshigh:@", "    :lsegd=(g)x:lsegl=(g)q:lsegld=(g)k:@", "    :lsegu=(g)x:lsegud=(g)x:lsegul=(g)j:lseguld=(g)u:@", "    :lsegr=(g)q:lsegrd=(g)l:lsegrl=(g)q:lsegrld=(g)w:@", "    :lsegru=(g)m:lsegrud=(g)t:lsegrul=(g)v:lsegruld=(g)n:", "139:f100|freedom 100:lins#24:cols#80:@", "    :beep=@Eb@177@177@Ed:autonl:clear=^Z:home=^^:move=@E=l1c1:@", "    :bs:tab=^I:right=^L:up=^K:down=^J:sup=^J:@", "    :cel=@Et:pillow=(r) :@", "    :att=-g=@E%:att=g=@E$:att=-h-u-r=@EG0:@", "    :att=h=@EG@@:att=u=@EG8:att=r=@EG4:@", "    :lshigh:lsegd=(g)J:lsegl=(g)K:lsegld=(g)G:@", "    :lsegu=(g)J:lsegud=(g)J:lsegul=(g)H:lseguld=(g)G:@", "    :lsegr=(g)K:lsegrd=(g)F:lsegrl=(g)K:lsegrld=(g)N:@", "    :lsegru=(g)E:lsegrud=(g)M:lsegrul=(g)O:lsegruld=(g)I:", "143:sun|Sun Microsystems Workstation:lins#34:cols#80:@", "    :clear=^L:home=@E[H:move=@E[l2;c2H:@", "    :bs:right=@E[C:up=@E[A:down=@E[B:@", "    :att=-r=@E[0m:att=r=@E[7m:pillow=(r) :@", "    :xonoff:noautonl:beep=^G:cel=@E[K:@", "    :sdown=@EM:sup=^J:tab=^I:lshigh:", "142:tvi925|Televideo 925:lins#24:cols#80:@", "    :beep=^G:autonl:clear=^Z:home=^^:move=@E=l1c1:@", "    :bs:right=^L:up=^K:down=^J:sup=^J:", "141:c108|concept 108:lins#24:cols#80:@", "    :beep=^G:autonl:clear=@E?@E^E:home=@E?:move=@Eal1c1:@", "    :bs:tab=^I:up=@E;:down=^J:cel=@E^S:pillow=(r) :@", "    :att=-r=@Ed:att=-u=@Eg:att=-h=@Ee:@", "    :att=r=@ED:att=u=@EG:att=h=@EE:", "64:v5|vt5|vt52|52|DEC VT52|Digital Equipment VT52:lins#24:cols#80:@", "    :beep=^G:autonl:clear=@EH@EJ:home=@EH:move=@EYl1c1:cel=@EK:@", "    :bs:right=@EC:up=@EA:down=@EB:sup=^J:sdown=@EI:@", "    :pillow=(g)a:att=-g=@EG:att=g=@EF:", "21:mime|mime2a|Microterm Mime2A:lins#24:cols#80:@", "    :beep=^G:clear=^L:home=@EH:move=@EYl1c1:@", "    :bs:right=@EC:up=@EA:down=@EB:@", "    :pillow=(g)a:@", "    :att=-h=@ET:att=h=@ES:att=-g=@EG:att=g=@EF:@", "    :inl=^A:dll=^W:pclear#13.6:pinl#300:pdll#300:", "16:aa|ann|annarb|Ann Arbor:lins#40:cols#80:autonl:visdel:@", "    :xonoff:beep=^G:autonl:clear=^L^A^A:home=^K:move=^Oc3l3:@", "    :bs:right=^I:up=^N:down=^J:@", "    :sup=^J:psup#2:@", "    :pillow=()@177:padc=^A:", "18:3a|adm|adm3a|LSI Adm3A:lins#24:cols#80:@", "    :beep=^G:autonl:clear=^Z:home=^^:move=@E=l1c1:@", "    :bs:right=^L:up=^K:down=^J:sup=^J:", "19:haz|h1500|Hazletine 1500:lins#24:cols#80:notilde:@", "    :beep=^G:clear=~^\\:home=~^Q^A^A:move=~^Qc0l0:bs:right=^P:up=~^L:down=~^K:", "17:hp|Hewlett-Packard?:lins#24:cols#80:@", "    :beep=^G:clear=@EE:home=@EH:bs:right=@EC:up=@EA:down=@EB:", "128:31|adm31|LSI Adm31:lins#24:cols#80:@", "    :beep=^G:clear=@E;:home=^^:move=@E=l1c1:bs:right=^L:up=^K:down=^J:@", "    :att=-h=@E(:att=h=@E):autonl:sup=^J:sdown=@EE:@", "    :inc=@EQ:dlc=@EW:inl=@EE:dll=@ER:iim=@Eq:oim=@Er:@", "    :psup#5.0:psdown#200.0:pinl#200.0:pdll#200.0:", "129:fox|Perkin-Elmer Fox:lins#24:cols#80:@", "    :beep=^G:clear=@EH@EJ:home=@EH:move=@EXl1@EYc1:bs:right=@EC:up=@EA:down=@EB:", "130:c100|concept|concept100|HDS Concept 100:lins#24:cols#80:@", "    :beep=^G:clear=@E?@E^C:home=@E?:move=@Eal1c1:bs:right=@E=:up=@E;:down=@E<:", "131:h52|h1552|Hazeltine 1552:lins#24:cols#80:@", "    :beep=^G:clear=@EM:home=@EH:move=@EYl1c1:@", "    :bs:right=@EC:up=@EA:down=@EB:@", "    :pillow=(g)a:@", "    :att=-h=@ET:att=h=@ES:att=-g=@EG:att=g=@EF:@", "    :ikey=@E=:okey=@E>:kup=@EA:kleft=@ED:kdown=@EB:kright=@EC:@", "    :k0=@E?p:k1=@E?q:k2=@E?r:k3=@E?s:k4=@E?t:@", "    :k5=@E?u:k6=@E?v:k7=@E?w:k8=@E?x:k9=@E?y:@", "    :kenter=@E?M:kperiod=@E?n:f1=@EP:f2=@EQ:f3=@ER:@", "    :cel=@EK:sdown=@EI:sup=^J:@", "    :tab=^I:inl=@EE:dll=@EO:@", "    :psdown#5.0:pinl#5.0:pdll#5.0:", "132:omni|Omni 800|Texas Instruments Omni 800:lins#66:cols#132:@", "    :beep=^G:overstrike:clear=^L:pclear#1467:pbol#195:bs:@", "    :right= :down=^J:pdown#30:sup=^J:psup#30:pbeep#84:", "133:s700|Silent 700|Texas Instruments Silent 700:lins#24:cols#80:@", "    :beep=^G:overstrike:clear=^M^J^J^J^J^J:pclear#165:pbol#195:bs:@", "    :right= :down=^J:pdown#33:sup=^J:psup#33:pbeep#250:", "134:aj|aj830|830|aj833|833|Anderson Jacobson 830/833:lins#66:cols#80:@", "    :beep=^G:overstrike:xonoff:clear=^L:bs:right= :down=^J:sup=^J:", "135:tk|tek|4006|tek4006|Tektronix 4006:lins#35:cols#80:@", "    :beep=^G:overstrike:bs:right= :down=^J:", "136:ti|ti745|Texas Instruments 745:lins#66:cols#80:@", "    :beep=^G:overstrike:bs:right= :down=^J:sup=^J:", "33:la120|la|120|Digital Equipment LA120:lins#66:cols#132:@", "    :beep=^G:overstrike:xonoff:clear=^L:bs:right= :down=^J:sup=^J:", "137:dumb:lins#24:cols#80:@", "    :beep=^G:autonl:bs:", "", "# termcap - Software Tools termcap file", "", "# ver  date   who remarks", "# --- ------- --- ------------------------------------------------------", "# 01w 28Mar86 cal .Added sun.", "# 01v 05Mar85 cal .Added tvi925.", "# 01u 30Dec84 cal .Added insert and delete line delays to the h19 entry.", "# 01t 07Dec84 cal .Added c108.", "# 01s 09Nov84 cal .Added f100. Added tab attribute to h19 entry.", "# 01r 11Oct84 cal .Added go140. Trimmed and reformatted revision history.", "# 01q 03Oct84 cal .Added dumb.", "# 01p 28Aug84 cal .Added ti745.", "# 01o 16Aug84 cal .Removed overzealous and buggy init sequence from the", "#                  vt100 entry.", "# 01n 01aug84 tab .Added attribute xonoff for AA.", "#", "# For details on the functions, see the manual entry.", "#"], "GAMCRON": ["## gamcron - list of legal times to play games", "#", "# Revision history:", "#", "# 01c 19Jan84 cal .Added new state holiday for January.", "# 01b 24Oct83 cal .Updated for 1983.", "# 01a 10Jan82 cal .Written.", "#", "# Description:", "#", "#   Entries are of the format:", "# ", "#\tminute:hour:day:month:weekday:random-message", "#", "#   It is sufficient to match only one entry in this file.", "#", "#\t6pm until the last minute of 11pm,", "#\tmidnight to the last minute of 7am,", "#\tSaturday and Sunday.", "#", "*:18-23:*:*:*:", "*:0-7:*:*:*:", "*:*:*:*:6,7:", "#", "#\tVarious (predictable) holidays", "#", "*:*:15-21:1:1:Martin Luther King Junior's Birthday", "*:*:15-21:2:1:President's Day", "*:*:25-31:5:1:Memorial Day", "*:*:1-7:9:1:Labor Day", "*:*:22-28:11:4:Thanksgiving", "*:*:23-29:11:5:Friday after Thanksgiving", "#", "#\tAbsolute holidays", "#", "*:*:1:1:*:New Years Day", "*:*:4:7:*:Independence Day", "*:*:25:12:*:Christmas Day", "#", "#\tGrody (unpredictable) holidays for 1983", "#", "*:*:26,27:12:*:Christmas", "*:*:28:12:*:Spring Administrative Holiday", "*:*:29,30:12:*:New Year's"], "CONQNEWS.DOC": ["\f", "                     The Conquest Chronicle", "", "08Sep85:  A completely  new  robot  strategy  has been installed!", "          Watch out, because robots are  smart now.", "", "16Jun84:  You can now get a list of recent  users  with  the  'H'", "          command.", "", "13Jun84:  The new user stats page finally works!", "", "11Jun84:  You can now get info on a user.", "", "09Jun84:  Hacking  on temperature. Weapons and engines now have a", "          chance of breaking when they get too hot.  Tuning  will", "          continue for a little while.", "", "27May84:  Bombing  and  beaming  have  been  modified so that the", "          baud rate of your terminal doesn't have  such  a  large", "          effect.", "", "22Feb84:  Message  editing  implemented.  If you enter enter line", "          feed as the target of a message, you  can  send  a  new", "          message  by  editing  the target and text from the last", "          message you sent (or attempted to send).", "", "19Feb84:  You can now do info on \"time\".", "", "11Feb84:  The driver bug that made bombing easy and ships  faster", "          than  speeding  torps  has  been  fixed. Also, it is no", "          longer possible for two terminals to control  the  same", "          ship.  Now,  when  you reincarnate, you get to keep the", "          same ship number.", "", "15Jan84:  You can  now  switch  teams  as  long  as  you  haven't", "          entered  any  ships  since  the last time you resigned.", "          Weapons  defaulting  implemented;   firing   a   weapon", "          without  specifying  a  direction  defaults to the last", "          direction you fired any weapon.", "", "14Jan84:  The tractor command has been split into  two  commands.", "          Use  't'  to  tractor another ship and 'u' to untractor", "          or attempt to  break  free  of  another  ships  tractor", "          beams.  Also,  when  you attempt to tractor a ship, its", "          velocity relative to your ship must be warp 2 or less.", "", "          Shields now regenerate  twice  as  fast  (4  units  per", "          second) when they are down.", "", "09Jan84:  Robot  ships  now  automatically defend the home system", "          from attack. Ship tuning continues.", "", "20Dec83:  Massive ship tuning in progress...", "", "10Dec83:  A new fuel usage formula has been  installed;  now  any", "          activity  that uses fuel generates heat and adds to the", "          temperature of the ship. Also, a bug which  caused  the", "          autopilot  to overshoot planets has been discovered and", "          fixed.", "", "17Nov83:  Phaser base hits have been lowered from 100 to 92.", "", "13Nov83:  New statistics are being kept (but currently, there  is", "          no  way  to display them). Typing \"i<cr>\" will now give", "          info on the last thing you ask for info on.", "", "03Nov83:  A better acceleration formula has been installed.", "", "23Oct83:  Tractor beams aren't quite so deadly anymore. (This  is", "          a major   blow   to  Klingon  battle  tactics.)  A  new", "          acceleration formula that is team  dependent  has  been", "          added.  An  orbit  speed  limit has been imposed so now", "          you cannot orbit if you are going faster than warp 2.", "", "16Oct83:  Ships now enter at least accurate  info  distance  away", "          from their nearest enemy.", "", "15Oct83:  It  is  now  possible  to change war and peace settings", "          from the menu.", "", "06Oct83:  Shell spawning was removed. Spawn to DCL instead.", "", "19Sep83:  The first Decus distribution  of  Conquest  was  mailed", "          today.", "", "05Sep83:  Torpedo  detonation has been worked over so that all of", "          your active torpedoes go off when you die;  this  means", "          that  you  should always get credit for when your torps", "          kill the ship that killed  you.  Spawning  to  DCL  was", "          added,  use  '$'  followed  by  a  line feed to spawn a", "          process.", "", "01Sep83:  The race dependent weapons  factors  have  been  tuned,", "          now  Orions are 0.83, Klingons and Federations are 1.0,", "          and Romulans are 1.17.  The  course  command  has  been", "          modified  so that when you set course for a planet, you", "          get the same  information  as  you  do  with  the  info", "          command.  Also,  when  you set course for another ship,", "          if you terminate your command with line feed, you  will", "          get info on the ship.", "", "29Aug83:  The  Evil  Display  Bug took heavy damage yesterday and", "          finally  fell  this  evening.  Services  will  be  held", "          Wednesday at the Red Hour.", "", "24Aug83:  The   phaser   command  modified  to  set  last  phaser", "          direction even if your phasers are not ready  yet.  The", "          planet list is now sorted by planet name.", "", "13Aug83:  Torp  alert  code  added. Now you will always be warned", "          when enemy torps get within accurate info range.", "", "          Code added  to  (hopefully)  prevent  driver  thrashing", "          when cpu time is at a premium.", "", "          Cloaking  modified  to allow \"silent running\", i.e. you", "          can stay cloaked at warp zero for a  long  time.  Also,", "          cloaking  fuel  cost depends on speed (cloaking at warp", "          10 is very expensive).", "", "          Towing modified; the maximum  towing  distance  is  now", "          larger.  Also, breaking free of an unfriendly ships tow", "          does not always succeed and trying  freezes  your  ship", "          up for a whole second.", "", "12Aug83:  Weapon   tuning  continues.  Phasers  are  still  quite", "          strong but this will be corrected in the  near  future.", "          Now  distance  is  used  to  break  ties  when  you are", "          searching for weak planets. This means that if you  ask", "          for  info  on the weakest planet with 10 or more armies", "          and two planets have 10 armies each, you will  be  told", "          about  the  closer  of  the two. Also, the info command", "          has been modified to warn you that a planet is  hostile", "          when you get info on it.", "", "17Jul83:  Several  bugs  related  to  the  conversion  to the new", "          ratfor fixed. Ken's version of  phaser  graphics  added", "          (complaints  to  him). Also, there is now a user option", "          for phaser graphics.", "", "04Jul83:  Conquest now runs from decnet ports!", "", "03Jul83:  Planet  movement  is  three  times   smoother.   Novice", "          players  will  now  enjoy  fantastic  phaser  graphics.", "          Firing phasers no longer locks up your  ship,  but  you", "          still  can't  fire  them more often than once a second.", "          Torpedos are... different. (Ken was *not* amused.)  The", "          remote terminal bug is almost fixed.", "", "          On  its  one year anniversary, Conquest now runs on two", "          Vaxen.", "", "          Remember, this is Be Kind to Klingons  week,  so  don't", "          aim for Ken's gonads.", "", "14Jun83:  Full  duplex  screen  updating implemented. Now you can", "          see  your   enemy   attacking   even   when   you   are", "          constructing  an insult for him. Common block updating.", "          Now the common block is flushed to  the  disk  every  5", "          minutes.  This  should  take  care  of  the  time  warp", "          problem.", "", "23May83:  Captured system entry now works. The  evil  course  360", "          wandering bug has been fixed.", "", "13May83:  Even  more  driver  hacking,  now  the  \"phase\"  of the", "          Universe is kept in the common block. This  means  that", "          five  minute  things  will happen every five minutes of", "          game  time,  etc.  You  can  now  send  mail  to   \"The", "          Implementors\"  by  sending  a  message to \"i\". Finally,", "          the self-destruct code was modified so that  it  really", "          takes  fifteen  seconds to exit, even if some cretin is", "          running rat4.", "", "07May83:  Tuned driver  startup  logic.  Added  a  new  \"nearest\"", "          thing  to  look  for,  nearest team planet, \"ntp\". This", "          was done to appease  the  Conquest  God,  who  was  not", "          happy  with the hack to \"nap\". Also, all of the nearest", "          planet special strings may now  be  qualified  with  an", "          army  threshold.  A  new user option, \"terse\", has been", "          added. For the most part, turning this option  shortens", "          the  \"press  space  for more\" prompts. The manual entry", "          has been revised; check it out for more information.", "", "29Apr83:  A new and  improved  Conquest  manual  entry  has  been", "          written  and  installed.  The  user  rating formula has", "          been improved. When getting information on  or  setting", "          course   for  the  nearest  army  planet,  \"nap\",  only", "          planets that are owned by your team and have more  than", "          three  armies are considered. Also, if you terminate an", "          information command with LF instead  of  CR,  you  will", "          get  info  about  the  second  nearest object. Code was", "          added to automatically disable insert and  delete  line", "          display.  (That's  right, you can throw away your local", "          copy  of  termcap  without  getting  seasick!)  Inverse", "          video  has been added to the pagefile routine. Finally,", "          the Conquest operator program  is  even  MORE  powerful", "          than before.", "", "14Apr83:  New  command  implemented.  ^R now can be used to force", "          the screen to be updated completely. Also, a  new  user", "          option  forces  the  screen  to  always  be  completely", "          updated, even during battle.", "", "12Apr83:  Many, many more bugs fixed. Many more  features  added.", "          Now  LF  can be used to send a message to the last ship", "          you sent to. Driver hacking  is  now  complete;  it  is", "          IMPOSSIBLE  for more than one driver to run at the same", "          time. It is not possible to run a driver manually  from", "          a terminal.  The  player  ships  now  notice  that  the", "          driver has died within 5 seconds.  When  a  the  player", "          who  has  the  driver  exits  Conquest,  he  causes the", "          driver to kill itself; the other players then  bid  for", "          running   it.   This   means   that  the  Game  is  not", "          interrupted just because someone logs off.", "", "19Mar83:  Many, many bugs fixed. Many  features  added.  Cloaking", "          now   works.   Also,  enhanced  informational  scanning", "          implemented.", "", "08Dec82:  Re-organized  the  display  somewhat  to   enable   the", "          terminal package to make use of clear-to-end-of-line.", "", "04Nov82:  Implemented  some  restrictions  on playing: no playing", "          over  dialups,  by  GUEST,   or   during   prime   time", "          (7:00-18:00 weekdays). Priority is set to 2.", "", "28Oct82:  Fixed bug in bombarding.", "", "25Oct82:  Added n, ne, ns, np, nep, nr, nf, and na.", "", "24Oct82:  Added  a  number  of new features, the biggest of which", "          is  orbiting  planets.  Also  I  juggled  some  of  the", "          parameters in an attempt to make the teams more equal.", "", "18Oct82:  Added  a  \"shit-list\" flag, to prevent obnoxious people", "          from playing. Added a real neat feature  which  finally", "          lets  broadcast  messages  from  the  outside world get", "          through. Made the game run at a lower priority.", "", "13Oct82:  Changed the \"p\" command to not enter  a  mode.  Now  it", "          just  fires  a  single  torp  and  goes back to command", "          mode.", "", "06Oct82:  Fixed a bug,  added  a  feature.  Recompiled  with  the", "          re-written raw I/O library - should go faster now.", "", "22Sep82:  Added  a  \"last  words\" feature - when you conquer, you", "          get to leave a message for everyone to see.", "", "20Sep82:  Minor tuning mods. Also the  doomsday  machine  is  now", "          both less common and more sadistic.", "", "13Sep82:  After  three  weeks  of  downtime,  I finally found the", "          major  bug  in  the  slow-turning  code.  As  usual,  a", "          strongly-typed  language  would  have  caught  it right", "          away. I believe there are  still  some  minor  problems", "          with   slow  turning  -  let  me  know  if  you  notice", "          anything.", "", "23Aug82:  Turning now takes time, and  it  takes  more  time  the", "          faster you are going. Slow down to turn.", "", "20Aug82:  Ken  the Kunning Klingon discovered an embarrassing bug", "          - I had a test reversed in the  routine  takeplanet  so", "          that  every  time  you  conquered  a  planet  you  also", "          conquered the Universe.", "", "18Aug82:  Fixed  annoyingly  persistent   bug   which   prevented", "          planets from being taken.", "", "08Aug82:  Couping  should  work  now.  Watch out for the doomsday", "          machine.", "", "29jul82:  I did some rewriting to  try  and  get  the  driver  to", "          restart  automatically  when  it dies. It doesn't quite", "          work yet, so beware...", "", "27Jul82:  Arrow keys work. Locking onto planets works.", "", "25Jul82:  The universe was conquered for the first time  tonight,", "          by  the Orions. It almost worked perfectly. At the last", "          instant, the common block  got  locked  up.  Also,  the", "          Orion  team  didn't  get  credit for the win. Both bugs", "          should be fixed now, so I am  looking  forward  to  the", "          next conquest.", "", "24Jul82:  Engine  temperature and fuel consumption are now pretty", "          much working. I still have to  do  some  fiddling  with", "          the constants to get things exactly right.", "", "18Jul82:  Fixed  a  bug  which prevented anyone but Romulans from", "          killing people. On second thought, maybe I should  have", "          left it in...", "", "16Jul82:  More    commands    added,    including   info.   Also,", "          self-destruct now works even if  the  driver  is  dead.", "          This should make Mister Xavier happy.", "", "12Jul82:  You   can   now   change  course  and  fire  torpedoes.", "          Commander Saavik immediately took advantage of this  by", "          traveling   to   Earth   and   destroying   hoardes  of", "          feddie-bears.", "", "03Jul82:  The display works pretty well now. More commands  work.", "          The  first  interplanetary  voyage  took  place  today:", "          Commander  Saavik  piloted  the  Romulan  flagship   to", "          Sirius.  The  ship was incinerated upon arrival. Saavik", "          then journeyed to the edge of  the  galaxy,  where  she", "          was one again incinerated. Score: galaxy 2, Saavik 0.", "", "02Jul82:  The display started working today. Some commands work.", "", "28Jun82:  Ships  are  flying now. However, the display generation", "          and command interpretation still needs to be  done,  so", "          it is not much use.", "", "27Jun82:  The  news  option  was installed today. Ships should be", "          flying pretty soon. The driver is working, I just  have", "          to add the code to launch a ship.", "", "Questions, comments, bug reports, suggestions, advice, insults to LERES."], "CONQUEST.DOC": ["\f", "          Conquest(tool)             05Oct85              Conquest(tool)", "", "", "", "               ", "", "          NAME", "               Conquest  -  multi-player real-time screen-oriented space", "               war game", "               ", "", "          SYNOPSIS", "               Conquest", "               ", "", "          DESCRIPTION", "", "", "               1. Object of the game.", "", "               The object of the game is twofold. The  short-range  goal", "               is  to accumulate \"kills\" by shooting down enemy players.", "               You get one kill point for each  enemy  ship  shot  down,", "               plus  some  extra  if  the enemy had kills too. The major", "               weapon used to shoot down ships is the photon torpedo.", "", "               The long-range goal is to conquer the universe  for  your", "               team  by taking every planet. You take planets by killing", "               off the enemy's armies via bombardment, and then  beaming", "               your  team's  armies down. When all the planets have been", "               taken, the game ends, a new game begins, and  the  player", "               who  actually  took  the last planet gets his/her name up", "               in lights.", "", "", "               2. Important commands.", "", "               This section lists the basic commands  of  Conquest.  The", "               next  section lists the more advanced / obscure commands,", "               and at the end of this document there is a summary  list.", "               The list is also available on-line via the 'h' command.", "", "               0-9,= - To  set  your  warp factor, just type a digit, or", "                       '=' for warp 10. The  teams  have  different  top", "                       speeds:  8 for Romulans, 9 for Klingons and Feds,", "                       and 10 for Orions.", "", "                   k - The 'k' command is used to set your  course.  You", "                       can  specify  your  course  a number of different", "                       ways:  in  degrees  (0=east,90=north),  via   the", "                       arrow  keys  (see  below), a ship number (precede", "                       it with an 's'), or a planet  name.  If  you  set", "                       course  for  a  planet,  you  have  the option of", "                       \"locking on\" by terminating the line with a  line", "                       feed  instead  of  a  carriage  return - then you", "                       will orbit automatically when you get there.", "", "", "", "", "", "                                      - 1 -                             ", "\f", "          Conquest(tool)             05Oct85              Conquest(tool)", "", "", "", "", "                 p,P - These two commands fire photon  torpedoes.  Lower", "                       case  'p'  fires  one  at  a  time,  and  is less", "                       useful. Upper case 'P' fires a  burst  of  three.", "                       When  you  are  in  the  heat of battle, you will", "                       want to fire every torp you have got  (nine),  so", "                       you  will  almost always use 'P'. You can specify", "                       the direction to fire  using  either  degrees  or", "                       the arrow keys.", "", "                 d,D - Lower  case  'd'  detonates  near-by  enemy torps", "                       before they get close enough to damage  you.  Use", "                       this  command  a  lot.  Upper  case 'D' detonates", "                       your own torps, for instance in case you  missed.", "                       Since  you  can  only  have  nine  torps out at a", "                       time, this can be useful.", "", "                   B - To capture enemy planets, you first have  to  get", "                       rid  of  the  enemy  armies  by  bombarding them.", "                       Orbit the planet, type 'B', confirm with  a  line", "                       feed,  and  then  watch  your damage closely. You", "                       will continue to bombard until you  type  another", "                       command.  When your damage gets up above 60 or 70", "                       percent, set a warp factor and get out fast.", "", "                   R - After a bombing run, you can repair  your  damage", "                       three  times  faster  by  going into repair mode.", "                       While repairing, your shields are  down  and  you", "                       can't move or fire.", "", "                   b - Once  you  have  blasted  a  planet down to three", "                       armies, you can beam your own armies down  to  do", "                       hand-to-hand combat and replace them.", "", "                   m - Use  the  'm'  command  to send messages. You can", "                       send to single ships  (using  the  ship  number),", "                       entire  teams,  (first  letter  of  team name) or", "                       everyone (\"all\"). You can even send  messages  to", "                       GOD,  but don't expect an answer. This command is", "                       useful for bothering the experts and asking  them", "                       annoying   questions.   It  is  also  useful  for", "                       trading insults.", "", "                   i - You can get  information  on  planets  and  ships", "                       with the 'i' command.", "", "                   Q - The  only  way  out  besides getting killed it to", "                       self-destruct. There is a  15-second  time  delay", "                       because  it  is not honorable to quit in the heat", "                       of battle.", "", "                   h - This command gives you a  short  command  summary", "                       (such  as  the  one  that  is found at the end of", "                       this document).", "", "", "", "                                      - 2 -                             ", "\f", "          Conquest(tool)             05Oct85              Conquest(tool)", "", "", "", "               3. Less important commands.", "", "                   A - Type 'A' to  change  your  weapons/engines  power", "                       allocations.  You  can either enter a new weapons", "                       allocation percentage or else type line  feed  to", "                       toggle  between  the  two  extremes  of 40/60 and", "                       60/40. The power allocation controls things  like", "                       how  powerful  your  weapons  are,  how efficient", "                       your engines are, etc.", "", "                   C - Cloaking device. You can  activate  the  cloaking", "                       device  by  typing  'C'  followed by a line feed.", "                       While the cloaking device is  in  operation,  you", "                       are  invisible,  even to your teammates. However,", "                       the cloaker uses a LOT of energy - so  much  that", "                       you  can't  use  your  weapons  while  it's on. A", "                       second 'C' will turn it off again.", "", "                   E - Emergency distress signal. A  quick  way  to  let", "                       your  team  mates know that you are in trouble is", "                       by typing 'E' followed by  a  line  feed.   Every", "                       ship  on  your  team (except those who are at war", "                       with your team) will get  a  short  message  from", "                       you  that  includes  information about your fuel,", "                       shields, and ship damage.", "", "                 f,F - These two commands let you  fire  phasers.  Lower", "                       case  'f'  is  used  to fire one phaser blast. It", "                       takes about one second to fire phasers (and  your", "                       shields  are down the whole time!) Upper case 'F'", "                       fires phasers again in the same direction.", "", "                   H - This  command  displays  the   list   of   recent", "                       Conquest players.", "", "                   I - You  can  type 'I' to get a menu of user options.", "                       By typing the options character, you  can  toggle", "                       whether  or  not  the  option  is on. The options", "                       are:", "", "                         G Phaser graphics: When  this  option  is  set,", "                           your phaser shots are displayed.", "", "                         P Planet  names:  When  this option is set, the", "                           names of planets and suns are displayed.", "", "                         A Alarm bell: When this  option  is  set,  your", "                           terminal   beeps  whenever  important  things", "                           happen. Important things include enemy  ships", "                           getting  within  red  alert  range  and enemy", "                           photon torpedoes getting too close.", "", "", "", "", "", "", "                                      - 3 -                             ", "\f", "          Conquest(tool)             05Oct85              Conquest(tool)", "", "", "", "", "                         I Intruder   alerts:   This   option   controls", "                           whether  or  not  you  are  informed of enemy", "                           intrusions, such as the  bombing  of  planets", "                           owned by your team.", "", "                         N Numeric  map:  If  you have this options set,", "                           the number of  armies  that  are  on  planets", "                           which  you  have scanned will be displayed on", "                           the strategic map.", "", "                         T Terse messages: Makes a few messages  shorter", "                           for  the  experienced  player.  Also disables", "                           some   navigational   messages    from    the", "                           computer.", "", "                         E Explosions:   When   this   option   is  set,", "                           explosions are displayed as a pretty  pattern", "                           of  '%'  characters.  When  it  is  off,  you", "                           cannot see where explosions are occurring.", "", "                   K - Attempt a coup. If all of your team's armies  get", "                       killed,  you  may  think  you  are  in deep fecal", "                       matter. Not so - you can still get some  back  by", "                       pulling a coup. Try it.", "", "                   L - Type  'L'  to  review old messages that have been", "                       sent to you.", "", "                   M - Type 'M'  to  toggle  your  display  between  the", "                       strategic map and tactical display.", "", "                   N - Pseudonym.   Use  this  command  to  change  your", "                       battle name.", "", "                   o - Orbit. Use  'o'  to  come  into  orbit  around  a", "                       planet (or a sun, if you want a tan).", "", "                   S - Displays a list of secondary user statistics.", "", "                   t - Tractor  beams.  You can use these to tow another", "                       ship, even if it is hostile.", "", "                   T - Team list. Displays a list of team statistics.", "", "                   u - Untractor. Disengage your tractor  beams  if  you", "                       are  towing another ship or attempt to break free", "                       of another ships tractor beam if  you  are  being", "                       towed.", "", "                   U - Displays a list of primary user statistics.", "", "", "", "", "", "", "                                      - 4 -                             ", "\f", "          Conquest(tool)             05Oct85              Conquest(tool)", "", "", "", "", "                   W - Type  'W'  to change your war and peace settings.", "                       Note  that  there  is  a  10  second  delay   for", "                       declaring  war  on  another team. Also, if you do", "                       something nasty to another team such as bomb  one", "                       of   their  planets,  your  war  with  that  team", "                       becomes sticky and  you  may  not  declare  peace", "                       with them.", "", "                 -,+ - Use  '+'  to  raise  your  energy shields, '-' to", "                       lower  them.  Shields  protect  you  from   enemy", "                       weapons;  however, it takes more fuel to fly with", "                       them up.", "", "                   / - To see which other people are  currently  playing", "                       Conquest, use the '/' command.", "", "                   ? - To get a list of planets, use the '?' command.", "", "                   $ - Typing  the '$' character followed by a line feed", "                       spawns  a  sub-process  to  DCL.  To   exit   the", "                       sub-process,  simply  type  \"logout\". (Note: this", "                       command is optional and may not be  supported  at", "                       your installation.)", "", "                  ^L - When  you  type  \"^L\",  the screen is cleared and", "                       redrawn.", "", "                  ^R - When you type \"^R\", the screen is  forced  to  be", "                       accurately updated.", "", "", "               4. Arrow keys.", "", "               The  easiest  and  quickest way to specify a direction is", "               with the  arrow  keys.  These  are  not  the  keys  which", "               actually  have  arrows on them, if your terminal has any.", "               They are merely the letters \"qweadzxc\" on  the  left-hand", "               side  of  your  keyboard, and are called \"arrow keys\" for", "               historical reasons. The keys are assumed to  be  arranged", "               as  follows  (if  you  have a Dvorak keyboard, you are in", "               trouble):", "", "                    Q W E", "                     \\|/", "                   A--+--D", "                     /|\\", "                    Z X C", "", "               You can use them singly, e.g. 'd'  would  be  0  degrees,", "               'q'  would  be  135,  etc.  You  can  also  use  them  in", "               combination: \"ed\" would be halfway between 'e'  and  'd',", "               which  is  22.5  degrees; \"edd\" is like 'e' + 'd' + 'd' /", "               3, or 15 degrees.", "", "", "", "                                      - 5 -                             ", "\f", "          Conquest(tool)             05Oct85              Conquest(tool)", "", "", "", "", "", "               5. Destination searching.", "", "               There are  several  special  strings  you  can  use  when", "               setting course or getting information:", "", "                    nes - nearest enemy ship", "                     ns - nearest ship", "                    nts - nearest (friendly) team ship", "                     np - nearest planet", "                    nep - nearest enemy planet", "                    nrp - nearest friendly (repair) planet", "                    nfp - nearest friendly class-M (fuel) planet", "                    nap - nearest planet with available armies", "                          (greater than 3 total armies)", "                    ntp - nearest planet owned by your team", "                     wp - weakest planet not owned by your team", "                     hp - home planet for your team", "                     sN - ship N (where N is a decimal number)", "                   time - time of day (info only)", "", "               All  of these can be abbreviated to their shortest unique", "               string. Also, for the planets,  you  can  type  a  number", "               after  the  special  string to specify an army threshold;", "               that is, planets with less than  that  number  of  armies", "               won't  be  considered.  For  example, \"na8\" specifies the", "               nearest planet with 8 (eight) or more armies,  \"nf14\"  is", "               the   nearest   fuel  planet  with  14  or  more  armies,", "               \"nep1000\" is the nearest non-scanned planet.", "", "               You can find out about on the second  nearest  object  by", "               terminating  your  information  request  with a line feed", "               instead of a carriage return. For example,  to  find  out", "               about the second nearest planet type \"inp<LF>\".", "", "               You  can't  use these when firing weapons - that would be", "               too easy.", "               ", "", "          AUTHOR(S)", "               Conquest is based on the  game  called  \"empire\"  on  the", "               PLATO  computer  system.  This  version, for VAX/VMS, was", "               written by Jef Poskanzer  and  Craig  Leres  and  is  far", "               superior  to  the original. (Not that the original wasn't", "               any good - it was.  But this one is GREAT.)  Many  thanks", "               to Marshall Spight for finding far too many bugs.", "", "               Technical  consulting  was  provided  by Ken the Kunning,", "               Captain Happy, and Commander T'Lydown.", "               ", "", "", "", "", "", "", "                                      - 6 -                             ", "\f", "          Conquest(tool)             05Oct85              Conquest(tool)", "", "", "", "          SEE ALSO", "", "               There is a detailed tutorial which is  available  through", "               the game.", "               ", "", "          BUGS/DEFICIENCIES", "", "               No  doubt  many  bugs  remain. Bug reports may be sent to", "               the  implementors  at  the  following  network  addresses", "               (which  are probably obsolete by the time you are reading", "               this):", "", "                   jef@lbl-rtsg.ARPA", "                       or  ...!ucbvax!lbl-csam!jef", "                   leres@ucb-arpa.ARPA", "                       or  ...!ucbvax!leres", "                   marshall@ucb-arpa.ARPA", "                       or  ...!ucbvax!marshall", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "                                      - 7 -                             ", "\f", "          Conquest(tool)             05Oct85              Conquest(tool)", "", "", "", "               ", "", "          COMMANDS", "               Here's a list of commands  (the  ones  marked  \"optional\"", "               may not be supported at your installation).", "", "                   0-9,=  set warp factor (= is 10)", "                   A      change w/e allocations", "                   b      beam armies", "                   B      bombard a planet", "                   C      cloaking device", "                   d      detonate enemy torpedoes", "                   D      detonate your own torpedoes", "                   E      send emergency distress call", "                   f      fire phasers", "                   F      fire phasers, same direction", "                   h      this", "                   H      user history", "                   i      information", "                   I      set user options", "                   k      set course", "                   K      try a coup", "                   L      review old messages", "                   m      send a message", "                   M      strategic map toggle", "                   N      change your name", "                   o      come into orbit", "                   p      launch photon torpedoes", "                   P      launch photon torpedo burst", "                   Q      initiate self-destruct", "                   R      enter repair mode", "                   S      more user statistics", "                   t      engage tractor beams", "                   T      team list", "                   u      un-engage tractor beams", "                   U      user statistics", "                   W      set war or peace", "                   -      lower shields", "                   +      raise shields", "                   /      player list", "                   ?      planet list", "                   $      spawn to DCL (optional)", "                   ^L     refresh the screen", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "                                      - 8 -                             "]};
/* ---------- NEW CODE: the driver, rewritten from conqdriv's main loop, and how this page runs it ---------- */
var $DT=0,$driver=null,$drivtenths=0,$ships=0,$PID=0x20200+Math.floor(Math.random()*0x1000),$DRPID=$PID+1;
function $startdriver(){ /* drcreate: as the spawned conqdriv starts */
  R_gsecs($SYMS.drivtime);R_gsecs($SYMS.playtime);
  $seti('drivpid',0);$seti('drivstat',1);
  $seti('drivstat',2);
  I[$DT>>2]=0;I[($DT>>2)+1]=0;R_rndini($DT,$DT+4);
  $seti('drivpid',$DRPID);
  H.glname($SYMS.drivowner);
  var t=$DT+8,u=$DT+12;I[t>>2]=$i('drivsecs');I[u>>2]=300;$seti('drivsecs',R_modp1(t,u));
  $drivtenths=10;
  $seti('drivstat',3);
  $seti('childpid',$DRPID);
  if(!$ships){$ships=$scratch(4*20);for(var s=1;s<=20;s++)I[($ships>>2)+s-1]=s}
  $driver=true;
}
function $drivetick(){ /* one ITER_SECONDS pass of conqdriv's loop */
  if(!$driver)return;
  if($i('drivpid')!==$DRPID||$i('drivstat')===5){
    if($i('drivstat')===5){$seti('drivpid',0);$seti('drivstat',0);B[$SYMS.drivowner]=0}
    $driver=null;return;
  }
  if($drivtenths>=10){
    $drivtenths=0;
    if(R_dsecs($SYMS.playtime,$SYMS.drivtime)>=300){ /* TIMEOUT_PLAYER */
      $seti('drivpid',0);$seti('drivstat',0);B[$SYMS.drivowner]=0;H.upchuck();$driver=null;return;
    }
    if($i('drivstat')===3){
      var a=$DT,b=$DT+4;I[a>>2]=1;I[b>>2]=20;
      for(var s=1;s<=20;s++){var i=R_rndint(a,b),j=I[($ships>>2)+i-1];I[($ships>>2)+i-1]=I[($ships>>2)+s-1];I[($ships>>2)+s-1]=j}
      var t=$DT+8,u=$DT+12;I[t>>2]=$i('drivsecs')+1;I[u>>2]=300;$seti('drivsecs',R_modp1(t,u));
      var ds=$i('drivsecs');
      if(ds%300===0)R_fivemindrive($ships);
      if(ds%60===0)R_mindrive($ships);
      if(ds%5===0)R_submindrive();
      R_secdrive($ships);
      if(ds%60===0)H.upchuck();
    }
  }
  if($i('drivstat')===3)R_iterdrive($ships);
  $drivtenths++;
}
/* the universe: the saved section, or a new one made as the operator's initialisation does */
function $universe(){
  var v=P.saved('conquest/common'),a=$SYMS.closed,b=$SYMS.glastmsg+4,ok=false;
  if(v&&typeof v==='object'&&v.stamp===$STAMP&&typeof v.data==='string'){
    try{var s=atob(v.data);if(s.length===b-a){for(var i=0;i<s.length;i++)B[a+i]=s.charCodeAt(i);ok=true}}catch(e){}
  }
  $seti('commonrev',$STAMP);
  if(!ok||!$sane()){
    for(var k=a;k<b;k++)B[k]=0;
    R_rndini($S0(),$S0()); /* as the operator program starts */
    R_initeverything();
    $setl('closed',false); /* the operator opens the game */
  }
  $seti('commonrev',$STAMP);
  /* processes that are gone: the driver, and the players of earlier runs (their ships go back to the pool) */
  $seti('drivstat',0);$seti('drivpid',0);B[$SYMS.drivowner]=0;
  for(var sn=1;sn<=20;sn++){
    var st=I[($SYMS.sstatus>>2)+sn-1],rob=(I[($SYMS.srobot>>2)+sn-1]&1)!==0;
    if(!rob&&(st===2||st===3||st===4||st===6))I[($SYMS.sstatus>>2)+sn-1]=1;
  }
}
/* what storage gave back is only bytes: the counts and indexes the program trusts must be in range */
function $sane(){
  function inr(n,lo,hi,k){for(var i=0;i<(k||1);i++){var v=I[($SYMS[n]>>2)+i];if(!(v>=lo&&v<=hi))return false}return true}
  return inr('sstatus',1,6,20)&&inr('steam',0,8,20)&&inr('suser',0,40,20)&&inr('slock',-40,40,20)&&inr('pteam',0,8,40)&&
    inr('ptype',0,8,40)&&inr('pprimary',0,40,40)&&inr('uteam',0,8,40)&&inr('lastmsg',0,60)&&inr('slastmsg',-2,60,20)&&
    inr('msgfrom',-200,40,60)&&inr('msgto',-200,40,60)&&inr('histptr',0,40)&&inr('histunum',-1,40,40)&&inr('stowing',0,20,20)&&
    inr('stowedby',0,20,20)&&inr('tstatus',0,5,180)&&inr('dlock',-40,20)&&inr('skilledby',-200,40,20);
}
/* the operator's robots: each team's, into a ship, if it is not flying */
function $robots(){
  for(var u=1;u<=40;u++){
    if(!((I[($SYMS.ulive>>2)+u-1]&1)&&(I[($SYMS.urobot>>2)+u-1]&1)))continue;
    var flying=false;
    for(var s=1;s<=20;s++)if(I[($SYMS.suser>>2)+s-1]===u&&(I[($SYMS.sstatus>>2)+s-1]===3))flying=true;
    if(flying)continue;
    var sn=$S0(),un=$S0();I[un>>2]=u;
    R_newrob(sn,un);
  }
}
P.command({names:['conquest'],noHelpFlag:true,run:function(a,raw,words){
  var last=null,fault=null;
  P.program(function(S,done){
    var G,over=false,timer=null,tick=null,waiting=null,deadline=0,ox=0,oy=0;
    function show(){
      if(over)return;
      var r=Math.min(S.rows,24),c=Math.min(S.cols,80),cy=Math.min($cy,23),cx=Math.min($cx,79);
      if(cy<oy)oy=cy<r?0:cy;else if(cy>=oy+r)oy=cy-r+1;
      if(cx<ox)ox=cx<c-4?0:cx-4;else if(cx>=ox+c)ox=Math.min(80-c,cx-c+5);
      oy=Math.max(0,Math.min(oy,24-r));ox=Math.max(0,Math.min(ox,80-c));
      var x=S.pan(ox,80-c,cx);
      S.drawGrid($scr.slice(oy,oy+r).map(function(R){return R.slice(x,x+c)}),cy-oy,cx-x);
    }
    $show=show;
    function quit(bare){ /* bare: ^Y or ^C, which leave nothing of the screen behind */
      if(over)return;
      over=true;
      if(timer)S.cancel(timer);if(tick)S.cancel(tick);
      try{$flush();if($i('commonrev')===$STAMP)H.upchuck()}catch(e){}
      var L=$scr.slice(0,Math.min($cy,23)+1).map(function(R){return R.join('').replace(/\s+$/,'')});
      while(L.length&&L[L.length-1]==='')L.pop();
      last=bare?null:L;
      S.close();
      done();
    }
    function fail(e){ /* the image ends: its exit, a fault, or a bug, which is passed on */
      if(e instanceof $Exit){quit();return}
      if(e instanceof $Fault){fault=e.message;quit();return}
      quit();throw e;
    }
    function step(v){
      if(over)return;
      var r;
      waiting=null;
      try{r=G.next(v)}
      catch(e){fail(e);return}
      if(r.done){quit();return}
      $flush();
      var w=r.value;
      if(w.sleep!==undefined){timer=S.after(w.sleep,function(){timer=null;step()});return}
      if($keys.length){var k=$keys.shift();timer=S.after(0,function(){timer=null;step(k)});return}
      waiting=w;deadline=w.timeout>=0?Date.now()+w.timeout:Infinity;
    }
    /* ten times a second: the driver; the ast while the program waits for a key; a read's time limit */
    function pulse(){
      if(over)return;
      try{
        $drivetick();
        var now=Date.now();
        if(waiting&&$astok&&$astdue&&now>=$astdue){$astdue=false;R_astservice();$flush()}
        if(waiting&&now>=deadline)step(null);
      }
      catch(e){fail(e)}
    }
    S.after(0,function(){
      if(over)return; /* ^C or ^Y before it started */
      try{
        /* a new image: fresh memory, then the section */
        B.fill(0);$loadinits();$hs=$HEAPSIZE;
        $scr.forEach(function(R){R.fill(' ')});$cy=$cx=0;$top=0;$bot=23;$g=false;$esc=null;$obuf=[];$keys=[];
        $driver=null;$astdue=false;$astok=true;$ships=0;$DT=$scratch(16); /* the driver's arguments */
        $universe();
        $robots();
        G=R_conquest();
      }
      catch(e){if(e instanceof $Exit){quit();return}throw e}
      tick=S.every(100,pulse);
      step();
    });
    return {
      feed:function(k){
        /* ^Y interrupts the image, as at DCL; ^C does the same, the program having no handler for it */
        if(k==='C-y'||k==='C-c'){quit(true);return}
        var m=/^C-([a-z])$/.exec(k),c=k==='Enter'?13:k==='Backspace'?127:k==='Escape'?27:k==='Tab'?9:k.length===1?k.charCodeAt(0)&255:m?m[1].charCodeAt(0)-96:null;
        if(c===null)return;
        if(waiting){waiting=null;step(c)}else $keys.push(c);
      },
      draw:show,
      resize:show
    };
  },{tty:'conquest',fit:[80,24]});
  P.queue(function(){
    if(last&&last.length)P.say(last);
    if(fault)P.typeLine(fault,'err');
  });
}});
})(window.Phosphor);
