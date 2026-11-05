/* PHOSPHOR-9 terminal: machine "bsd-1987", sail. Ported to JavaScript for this terminal from 4.3BSD's games/sail: main.c, pl_main.c,
   pl_1-7.c, dr_main.c, dr_1-5.c, lo_main.c, assorted.c, game.c, globals.c, misc.c, parties.c, sync.c, version.c, Version 5.1 (85/05/29),
   dr_main.c and sync.c 5.2 (Berkeley) 1/21/86. Each of those files keeps this notice:

 * Copyright (c) 1983 Regents of the University of California.
 * All rights reserved.  The Berkeley software License Agreement
 * specifies the terms and conditions for redistribution.

   From main.c, its other line:

   "@(#) Copyright (c) 1980 Regents of the University of California.\n All rights reserved.\n"

   Sail is, in its manual's words, a computer version of Avalon Hill's game of fighting sail originally developed by S. Craig Taylor.

   The tables below are dumped from the C's own, by a program linked with them.

   The C is two processes, a player and a driver forked from it, each with its own copy of everything and its own run of the
   dice, talking through a file: each writes what it does and reads what the other wrote only when it syncs. This keeps that shape.
   proc() below is one process; the sync file is an array they share. The driver wakes on a timer of 7 seconds where it slept, and
   the player's turn comes on one of 7 seconds where the alarm went, and neither interrupts the other.

   Differences:
   - One player: the other ships are all the computer's. There is no other game to join, so nothing is ever IN PLAY and no ship is
     ever taken. The paths for those are left out.
   - getpid() seeds rand(); there are no process ids here, so a random number from 1 to 30000 stands in for one.
   - The score file, lib/saillog, is sail/log in this browser's storage. Its uid is the login name.
   - No bells. -x does nothing, as in the C, which says "randomize;" and sets nothing. -D is taken and does nothing, as it does there.
     WOTD and SAILNAME are not looked at: there is no environment for them; the best computer captain is "Driver".
   - sail -d, which only the C's own process table has a use for, checks the number it is given and ends.
   - With output going to a pipe or file it says it needs a terminal. The screen must be 80 by 18, as in the C, and a glass too small for that
     even in the smallest letters gets the C's "Can't sail on this terminal." A taller one is still 24 lines.
   - ^D, where the C's scanf spins for ever at end of file, just waits on.
   - When the game ends the last screen is left on the glass, printed as text, as the C left it there.
   - What the C leaves open has one reading here, the same in the program compared against: MT[] with a negative
     strength gives 0 men; HDT[] at range 0 with the smallest guns gives 0, and otherwise is the row before; "No more ships left." has
     no ship. WET[] at wind 7 runs into RigTable, as the VAX's data does. A move's text is not limited; the C overruns its buffer past
     nine characters, which spaces let one do.
 */
(function(P){
'use strict';
var SCENE=[
{"winddir":5,"windspeed":3,"windchange":5,"vessels":2,"name":"Ranger vs. Drake","ship":[["Ranger",0,0,7,20,4],["Drake",1,1,7,31,5]]},
{"winddir":1,"windspeed":3,"windchange":6,"vessels":2,"name":"The Battle of Flamborough Head","ship":[["Bonhomme Rich",2,0,13,40,2],["Serapis",3,1,2,42,2]]},
{"winddir":5,"windspeed":5,"windchange":5,"vessels":10,"name":"Arbuthnot and Des Touches","ship":[["America",4,1,7,37,4],["Befford",5,1,5,35,4],["Adamant",6,1,3,33,4],["London",7,1,1,31,4],["Royal Oak",8,1,-1,29,4],["Neptune",9,3,6,44,4],["Duc Bougogne",10,3,8,46,4],["Conquerant",48,3,10,48,4],["Provence",11,3,12,50,4],["Romulus",12,3,20,58,4]]},
{"winddir":1,"windspeed":3,"windchange":5,"vessels":10,"name":"Suffren and Hughes","ship":[["Monmouth",52,1,9,45,2],["Hero",5,1,13,49,2],["Isis",6,1,12,48,2],["Superb",50,1,10,46,2],["Burford",48,1,11,47,2],["Flamband",13,3,7,59,4],["Annibal",9,3,4,56,4],["Severe",11,3,2,54,4],["Brilliant",49,3,-1,51,4],["Sphinx",51,3,-5,47,4]]},
{"winddir":1,"windspeed":3,"windchange":4,"vessels":2,"name":"Nymphe vs. Cleopatre","ship":[["Nymphe",14,1,13,30,2],["Cleopatre",15,3,3,41,2]]},
{"winddir":1,"windspeed":3,"windchange":5,"vessels":2,"name":"Mars vs. Hercule","ship":[["Mars",16,1,13,30,2],["Hercule",17,3,3,41,2]]},
{"winddir":5,"windspeed":3,"windchange":5,"vessels":2,"name":"Ambuscade vs. Baionnaise","ship":[["Ambuscade",18,1,13,30,2],["Baionnaise",19,3,3,41,2]]},
{"winddir":1,"windspeed":5,"windchange":6,"vessels":2,"name":"Constellation vs. Insurgent","ship":[["Constellation",20,0,9,50,8],["Insurgent",22,3,4,24,2]]},
{"winddir":1,"windspeed":3,"windchange":5,"vessels":2,"name":"Constellation vs. Vengeance","ship":[["Constellation",20,0,12,40,2],["Vengeance",21,3,1,43,2]]},
{"winddir":1,"windspeed":3,"windchange":6,"vessels":10,"name":"The Battle of Lissa","ship":[["Amphion",23,1,8,50,4],["Active",24,1,6,48,4],["Volage",25,1,4,46,4],["Cerberus",26,1,2,44,4],["Favorite",27,3,9,34,2],["Flore",21,3,13,39,2],["Danae",64,3,15,37,2],["Bellona",28,3,17,35,2],["Corona",29,3,12,31,2],["Carolina",30,3,15,28,2]]},
{"winddir":2,"windspeed":5,"windchange":6,"vessels":2,"name":"Constitution vs. Guerriere","ship":[["Constitution",31,0,7,35,1],["Guerriere",32,1,7,47,4]]},
{"winddir":1,"windspeed":3,"windchange":5,"vessels":2,"name":"United States vs. Macedonian","ship":[["United States",33,0,1,52,6],["Macedonian",34,1,14,40,1]]},
{"winddir":1,"windspeed":3,"windchange":6,"vessels":2,"name":"Constitution vs. Java","ship":[["Constitution",31,0,1,40,2],["Java",35,1,11,40,2]]},
{"winddir":1,"windspeed":3,"windchange":5,"vessels":2,"name":"Chesapeake vs. Shannon","ship":[["Chesapeake",36,0,13,40,2],["Shannon",37,1,1,42,2]]},
{"winddir":1,"windspeed":1,"windchange":6,"vessels":5,"name":"The Battle of Lake Erie","ship":[["Lawrence",38,0,4,55,8],["Niagara",42,0,7,61,8],["Lady Prevost",39,1,4,25,2],["Detroit",40,1,7,22,2],["Q. Charlotte",41,1,10,19,2]]},
{"winddir":1,"windspeed":1,"windchange":5,"vessels":2,"name":"Wasp vs. Reindeer","ship":[["Wasp",42,0,3,41,2],["Reindeer",43,1,10,48,2]]},
{"winddir":1,"windspeed":2,"windchange":5,"vessels":3,"name":"Constitution vs. Cyane and Levant","ship":[["Constitution",31,0,10,45,2],["Cyane",44,1,3,37,2],["Levant",45,1,5,35,2]]},
{"winddir":5,"windspeed":5,"windchange":5,"vessels":3,"name":"Pellew vs. Droits de L'Homme","ship":[["Indefatigable",46,1,12,45,6],["Amazon",47,1,9,48,6],["Droits L'Hom",48,3,3,28,5]]},
{"winddir":2,"windspeed":2,"windchange":3,"vessels":10,"name":"Algeciras","ship":[["Caesar",49,1,7,70,6],["Pompee",50,1,5,72,6],["Spencer",5,1,3,74,6],["Hannibal",7,1,1,76,6],["Real-Carlos",53,2,9,20,3],["San Fernando",54,2,11,16,3],["Argonauta",55,2,10,14,4],["San Augustine",56,2,6,22,4],["Indomptable",51,3,7,23,5],["Desaix",52,3,7,27,7]]},
{"winddir":5,"windspeed":3,"windchange":6,"vessels":7,"name":"Lake Champlain","ship":[["Saratoga",60,0,8,10,1],["Eagle",61,0,9,13,2],["Ticonderoga",62,0,12,17,3],["Preble",63,0,14,20,2],["Confiance",57,1,4,70,6],["Linnet",58,1,7,68,6],["Chubb",59,1,10,65,6]]},
{"winddir":5,"windspeed":3,"windchange":6,"vessels":4,"name":"Last Voyage of the USS President","ship":[["President",67,0,12,42,5],["Endymion",64,1,5,42,5],["Pomone",65,1,7,82,6],["Tenedos",66,1,7,-1,4]]},
{"winddir":7,"windspeed":5,"windchange":5,"vessels":2,"name":"Hornblower and the Natividad","ship":[["Lydia",68,1,12,40,2],["Natividad",69,2,2,40,4]]},
{"winddir":1,"windspeed":3,"windchange":6,"vessels":2,"name":"Curse of the Flying Dutchman","ship":[["Piece of Cake",19,2,7,40,2],["Flying Dutchy",71,3,7,41,1]]},
{"winddir":1,"windspeed":4,"windchange":1,"vessels":4,"name":"The South Pacific","ship":[["USS Scurvy",70,0,7,40,1],["HMS Tahiti",71,1,12,60,1],["Australian",18,2,5,20,8],["Bikini Atoll",63,3,2,60,4]]},
{"winddir":7,"windspeed":3,"windchange":6,"vessels":5,"name":"Hornblower and the battle of Rosas bay","ship":[["Sutherland",5,1,13,30,2],["Turenne",10,3,9,35,6],["Nightmare",9,3,7,37,6],["Paris",53,3,3,45,4],["Napolean",56,3,1,40,6]]},
{"winddir":6,"windspeed":4,"windchange":7,"vessels":5,"name":"Cape Horn","ship":[["Concord",51,0,3,20,4],["Berkeley",7,0,5,50,5],["Thames",71,1,10,40,1],["Madrid",53,2,13,60,8],["Musket",10,3,10,60,7]]},
{"winddir":8,"windspeed":3,"windchange":7,"vessels":3,"name":"New Orleans","ship":[["Alligator",71,0,13,5,1],["Firefly",50,1,10,20,8],["Cypress",46,1,5,10,6]]},
{"winddir":5,"windspeed":3,"windchange":7,"vessels":3,"name":"Botany Bay","ship":[["Shark",11,1,6,15,4],["Coral Snake",31,3,3,30,6],["Sea Lion",33,3,13,50,8]]},
{"winddir":4,"windspeed":3,"windchange":6,"vessels":4,"name":"Voyage to the Bottom of the Sea","ship":[["Seaview",71,0,6,3,3],["Flying Sub",64,0,8,3,3],["Mermaid",70,1,2,5,5],["Giant Squid",53,2,10,30,8]]},
{"winddir":7,"windspeed":3,"windchange":6,"vessels":3,"name":"Frigate Action","ship":[["Killdeer",21,0,7,20,8],["Sandpiper",27,1,5,40,8],["Curlew",34,2,10,60,8]]},
{"winddir":7,"windspeed":2,"windchange":5,"vessels":6,"name":"The Battle of Midway","ship":[["Enterprise",49,0,10,70,8],["Yorktown",51,0,3,70,7],["Hornet",52,0,6,70,7],["Akagi",53,4,6,10,4],["Kaga",54,4,4,12,4],["Soryu",55,4,2,14,4]]},
{"winddir":1,"windspeed":3,"windchange":4,"vessels":8,"name":"Star Trek","ship":[["Enterprise",76,5,-10,60,7],["Yorktown",77,5,0,70,7],["Reliant",78,5,10,70,7],["Galileo",79,5,20,60,7],["Kobayashi Maru",80,6,0,120,7],["Klingon II",81,6,10,120,7],["Red Orion",82,7,0,0,3],["Blue Orion",83,7,10,0,3]]}
];
var SPECS=[
/* bs fs ta guns class hull qual crew1 crew2 crew3 gunL gunR carL carR rig1 rig2 rig3 rig4 pts */
[4,7,3,19,5,5,4,2,2,2,2,2,0,0,4,4,4,4,7],
[4,7,3,17,5,5,4,2,2,2,0,0,4,4,3,3,3,3,6],
[3,5,2,42,4,7,4,2,2,2,2,2,0,0,5,5,5,-1,11],
[4,6,3,44,3,7,4,2,2,2,3,3,0,0,5,5,5,5,12],
[3,5,2,64,2,17,4,8,6,6,12,12,2,2,7,7,7,-1,20],
[3,5,2,74,2,20,4,8,8,8,16,16,2,2,7,7,7,-1,26],
[3,5,2,50,2,12,4,6,4,4,8,8,2,2,6,6,6,-1,17],
[3,5,1,98,1,23,4,10,10,10,18,18,2,2,8,8,8,-1,28],
[3,5,2,74,2,20,4,8,8,8,16,16,2,2,7,7,7,-1,26],
[3,5,2,74,2,21,3,10,10,8,20,20,0,0,7,7,7,-1,24],
[3,5,1,80,1,23,3,12,12,10,22,22,0,0,7,7,7,-1,27],
[3,5,2,64,2,18,3,8,8,6,12,12,0,0,7,7,7,-1,18],
[3,5,2,44,2,11,3,4,4,4,6,6,2,2,5,5,5,-1,10],
[3,5,2,50,2,14,3,6,6,4,8,8,0,0,6,6,6,-1,14],
[4,6,3,36,3,11,4,4,4,2,4,4,2,2,5,5,5,5,11],
[4,6,3,36,3,11,3,4,4,4,4,4,2,2,5,5,5,5,10],
[3,5,2,74,2,21,4,10,8,8,18,18,2,2,7,7,7,-1,26],
[3,5,2,74,2,21,3,10,10,8,20,20,2,2,7,7,7,-1,23],
[4,6,3,32,3,8,3,4,2,2,4,4,2,2,5,5,5,5,9],
[4,6,3,24,4,6,3,4,4,4,2,2,0,0,4,4,4,4,9],
[4,7,3,38,4,14,5,6,4,4,4,4,6,6,5,5,5,5,17],
[4,6,3,40,3,15,3,8,6,6,6,6,4,4,5,5,5,5,15],
[4,7,3,36,4,11,3,6,6,4,4,4,2,2,5,5,5,5,11],
[4,6,3,32,3,11,5,4,4,2,4,4,2,2,5,5,5,5,13],
[4,6,3,38,3,14,5,4,4,4,6,6,4,4,5,5,5,5,18],
[4,6,3,22,3,6,5,2,2,2,0,0,8,8,4,4,4,4,11],
[4,6,3,32,3,11,5,4,4,2,4,4,2,2,5,5,5,5,13],
[4,6,3,40,3,14,3,6,6,4,6,6,4,4,5,5,5,5,15],
[4,6,3,32,3,11,2,4,4,4,4,4,0,0,5,5,5,5,9],
[4,6,3,40,3,14,2,6,6,4,6,6,4,4,5,5,5,5,12],
[4,6,3,32,3,8,2,4,4,1,2,2,0,0,4,4,4,4,7],
[4,7,3,44,4,18,5,6,6,6,8,8,6,6,6,6,6,6,24],
[4,6,3,38,3,14,4,4,4,2,6,6,4,4,5,5,5,5,15],
[4,5,3,44,3,18,5,8,6,6,8,8,8,8,6,6,6,6,24],
[4,6,3,38,3,14,4,4,4,4,6,6,4,4,5,5,5,5,16],
[4,7,3,38,4,14,4,6,6,6,6,6,6,6,5,5,5,5,19],
[4,6,3,38,3,14,3,6,6,4,6,6,6,6,5,5,5,5,14],
[4,6,3,38,3,14,5,6,4,4,6,6,6,6,5,5,5,5,17],
[4,7,3,20,5,6,4,4,2,2,0,0,6,6,4,4,4,4,9],
[4,7,3,13,6,3,4,0,2,2,0,0,2,2,2,2,2,2,5],
[4,7,3,19,5,5,4,2,2,2,2,2,0,0,4,4,4,4,7],
[4,7,3,17,5,5,4,2,2,2,2,2,0,0,3,3,3,3,6],
[4,7,3,20,5,6,5,4,2,2,0,0,6,6,4,4,4,4,12],
[4,7,3,18,5,5,5,2,2,2,0,0,6,6,4,4,4,4,9],
[4,7,3,24,5,6,4,4,2,2,0,0,10,10,4,4,4,4,11],
[4,7,3,20,5,6,4,2,2,2,0,0,8,8,4,4,4,4,10],
[4,6,3,44,3,11,5,4,4,4,4,4,2,2,5,5,5,5,14],
[4,6,3,36,3,12,4,4,4,4,6,6,2,2,5,5,5,5,14],
[3,5,2,74,2,21,3,10,8,8,20,20,2,2,4,4,7,-1,24],
[3,5,2,80,2,24,4,10,8,8,20,20,2,2,8,8,8,-1,31],
[3,5,2,74,2,21,4,8,8,6,16,16,4,4,7,7,7,-1,27],
[3,5,2,80,2,24,3,12,12,10,22,22,2,2,7,7,7,-1,27],
[3,5,2,74,2,21,3,10,10,8,20,20,2,2,7,7,7,-1,24],
[3,5,1,112,1,27,2,12,12,12,24,24,0,0,9,9,9,-1,27],
[3,5,1,96,1,24,2,12,12,10,20,20,0,0,8,8,8,-1,24],
[3,5,2,80,2,23,2,10,10,8,20,20,0,0,7,7,7,-1,23],
[3,5,2,74,2,21,2,10,8,8,16,16,4,4,7,7,7,-1,20],
[4,6,3,37,3,12,4,4,4,2,6,6,4,4,5,5,5,5,14],
[4,7,3,16,5,5,5,2,2,2,0,0,4,4,4,4,4,4,10],
[4,7,3,11,6,3,4,2,2,2,0,0,2,2,2,2,2,2,5],
[4,7,3,26,5,6,4,4,2,2,2,2,6,6,4,4,4,4,12],
[4,7,3,20,5,6,4,4,2,2,0,0,6,6,4,4,4,4,11],
[4,7,3,17,5,5,4,2,2,2,0,0,6,6,4,4,4,4,9],
[4,7,3,7,6,3,4,0,2,2,0,0,2,2,2,2,2,2,4],
[4,6,3,40,3,15,4,4,4,4,8,8,6,6,5,5,5,5,17],
[4,6,3,44,3,15,4,8,8,6,10,10,2,2,6,6,6,6,20],
[4,6,3,38,3,14,4,4,4,4,6,6,6,6,5,5,5,5,15],
[4,5,3,44,3,18,5,8,6,6,8,8,8,8,6,6,6,6,24],
[4,6,3,36,3,9,5,4,4,2,4,4,2,2,5,5,5,5,13],
[3,5,2,50,2,14,2,6,6,6,8,8,0,0,6,6,6,-1,14],
[3,5,1,136,1,30,1,8,14,14,28,28,0,0,9,9,9,-1,27],
[3,5,1,120,1,27,5,16,14,14,28,28,2,2,9,9,9,-1,43],
[3,5,1,120,2,21,5,15,17,15,25,25,7,7,9,9,9,-1,36],
[3,5,1,90,3,18,4,13,15,13,20,20,6,6,5,5,5,5,28],
[4,7,3,6,6,3,4,2,2,2,20,20,6,6,2,2,3,3,5],
[3,5,1,110,2,20,4,14,15,11,26,26,8,8,7,8,9,-1,34],
[4,7,3,450,1,99,5,50,40,40,50,50,25,25,9,9,9,-1,75],
[4,7,3,450,1,99,5,50,40,40,50,50,25,25,9,9,9,-1,75],
[4,7,3,450,1,99,5,50,40,40,50,50,25,25,9,9,9,-1,75],
[4,7,3,450,1,99,5,50,40,40,50,50,25,25,9,9,9,-1,75],
[4,7,3,450,1,99,5,50,40,40,50,50,25,25,9,9,9,-1,75],
[4,7,3,450,1,99,5,50,40,40,50,50,25,25,9,9,9,-1,75],
[4,7,3,450,1,99,5,50,40,40,50,50,25,25,9,9,9,-1,75],
[4,7,3,450,1,99,5,50,40,40,50,50,25,25,9,9,9,-1,75]
];
var WET=[[[9,9,9,9],[9,9,9,9],[9,9,9,9],[9,9,9,9],[9,9,9,9],[9,9,9,9]],[[3,2,2,0],[3,2,1,0],[3,2,1,0],[3,2,1,0],[2,1,0,0],[2,1,0,0]],[[1,1,1,0],[1,1,0,0],[1,0,0,0],[1,0,0,0],[1,0,0,0],[1,0,0,0]],[[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]],[[0,0,0,0],[1,0,0,0],[1,1,0,0],[1,1,0,0],[2,2,1,0],[2,2,1,0]],[[1,0,0,0],[1,1,0,0],[1,1,1,0],[1,1,1,0],[3,2,2,0],[3,2,2,0]],[[2,1,1,0],[3,2,1,0],[3,2,1,0],[3,2,1,0],[3,3,2,0],[3,3,2,0]]];
var RIGT=[[[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,1],[0,0,1,0]],[[0,0,0,0],[0,0,0,0],[0,0,0,1],[0,0,1,0],[1,0,0,1],[0,1,1,1]],[[0,0,0,0],[0,0,0,1],[0,0,1,1],[0,1,0,1],[0,1,0,1],[1,0,1,2]],[[0,0,0,0],[0,0,1,1],[0,1,0,1],[0,0,0,2],[0,1,0,2],[1,0,1,2]],[[0,1,0,1],[1,0,0,1],[0,1,1,2],[0,1,0,2],[0,0,1,3],[1,0,1,4]],[[0,0,1,1],[0,1,0,2],[1,0,0,3],[0,1,1,3],[1,0,0,4],[1,1,1,4]],[[0,0,1,2],[0,1,1,2],[1,1,0,3],[0,1,0,4],[1,0,0,4],[1,0,1,5]],[[0,0,1,2],[0,1,0,3],[1,1,0,3],[1,0,2,4],[0,2,1,5],[2,1,0,5]],[[0,2,1,3],[1,0,0,3],[2,1,0,4],[0,1,1,4],[0,1,0,5],[1,0,2,6]],[[1,1,0,4],[1,0,1,4],[2,0,0,5],[0,2,1,5],[0,1,2,6],[0,2,0,7]],[[1,0,1,5],[0,2,0,6],[1,2,0,6],[1,1,1,6],[2,0,2,6],[1,1,2,7]]];
var HULLT=[[[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,0,0,0],[0,1,0,0]],[[0,0,0,0],[0,0,0,0],[0,1,0,0],[1,1,0,0],[1,0,1,0],[1,0,1,1]],[[0,1,0,0],[1,0,0,0],[1,1,0,0],[1,0,1,0],[1,0,1,1],[2,1,0,0]],[[0,1,1,0],[1,0,0,0],[1,1,1,0],[2,0,0,1],[2,0,1,0],[2,2,0,0]],[[0,1,1,0],[1,0,0,1],[2,1,0,1],[2,2,1,0],[3,0,1,0],[3,1,0,0]],[[1,1,1,0],[2,0,2,1],[2,1,1,0],[2,2,0,0],[3,1,0,1],[3,1,1,0]],[[1,2,2,0],[2,0,2,1],[2,1,0,1],[2,2,0,0],[3,1,1,0],[4,2,1,0]],[[2,1,1,0],[2,0,1,1],[3,2,2,0],[3,2,0,0],[4,2,1,0],[4,2,1,1]],[[2,1,2,0],[3,1,1,1],[3,2,2,0],[4,2,1,0],[4,1,0,2],[4,2,2,0]],[[2,3,1,0],[3,2,2,0],[3,2,2,1],[4,2,2,0],[4,1,0,3],[5,1,2,0]],[[2,2,4,0],[3,3,1,1],[4,2,1,1],[5,1,0,2],[5,1,2,1],[6,2,2,0]]];
var AMMO=[[-1,1,0,1],[-1,1,0,1],[-1,1,0,1],[-2,1,0,2],[-2,2,0,2],[-2,2,0,2],[-3,2,0,2],[-3,2,0,3],[-3,2,0,3]];
var HDT=[[1,0,-1,-2,-3,-3,-4,-4,-4,-4],[1,1,0,-1,-2,-2,-3,-3,-3,-3],[2,1,0,-1,-2,-2,-3,-3,-3,-3],[2,2,1,0,-1,-1,-2,-2,-2,-2],[3,2,1,0,-1,-1,-2,-2,-2,-2],[3,3,2,1,0,0,-1,-1,-1,-1],[4,3,2,1,0,0,-1,-1,-1,-1],[4,4,3,2,1,1,0,0,0,0],[5,4,3,2,1,1,0,0,0,0]];
var HDTRAKE=[[2,1,0,-1,-2,-2,-3,-3,-3,-3],[2,2,1,0,-1,-1,-2,-2,-2,-2],[3,2,1,0,-1,-1,-2,-2,-2,-2],[4,3,2,1,0,0,-1,-1,-1,-1],[5,4,3,2,1,1,0,0,0,0],[6,5,4,3,2,2,1,1,1,1],[7,6,5,4,3,3,2,2,2,2],[8,7,6,5,4,4,3,3,3,3],[9,8,7,6,5,5,4,4,4,4]];
var QUAL=[[-1,0,0,1,1],[-1,0,0,1,1],[-1,0,0,1,2],[-1,0,0,1,2],[-1,0,0,2,2],[-1,-1,0,2,2],[-2,-1,0,2,2],[-2,-1,0,2,2],[-2,-1,0,2,3]];
var MT=[[1,0,0],[1,1,0],[2,1,0],[2,1,1],[2,2,1],[3,2,1],[3,2,2],[4,3,2],[4,4,2]];
var RANGEOFSHOT=[0,1,3,10,1,0];
var COUNTRY=["American","British","Spanish","French","Japanese","Federation","Klingon","Orion"];
var CLASSNAME=["Drift wood","Ship of the Line","Ship of the Line","Frigate","Corvette","Sloop","Brig"];
var DIRECTIONNAME=["dead ahead","off the starboard bow","off the starboard beam","off the starboard quarter","dead astern","off the port quarter","off the port beam","off the port bow","dead ahead"];
var QUALNAME=["dead","mutinous","green","mundane","crack","elite"];
var DR=[0,1,1,0,-1,-1,-1,0,1];
var DC=[0,0,-1,-1,-1,0,1,1,1];
var NSHIP=10,NBP=3,NNATION=8;
var L_EMPTY=0,L_GRAPE=1,L_CHAIN=2,L_ROUND=3,L_DOUBLE=4,L_EXPLODE=5;
var R_EMPTY=0,R_LOADING=1,R_DOUBLE=2,R_LOADED=4,R_INITIAL=8;
var HULL=0,RIGGING=1;
var W_CAPTAIN=1,W_CAPTURED=2,W_CLASS=3,W_CREW=4,W_DBP=5,W_DRIFT=6,W_EXPLODE=7,W_FILE=8,W_FOUL=9,W_GUNL=10,W_GUNR=11,W_HULL=12,W_MOVE=13,W_OBP=14,W_PCREW=15,W_UNFOUL=16,W_POINTS=17,W_QUAL=18,W_UNGRAP=19,W_RIGG=20,W_COL=21,W_DIR=22,W_ROW=23,W_SIGNAL=24,W_SINK=25,W_STRUCK=26,W_TA=27,W_ALIVE=28,W_TURN=29,W_WIND=30,W_FS=31,W_GRAP=32,W_RIG1=33,W_RIG2=34,W_RIG3=35,W_RIG4=36,W_BEGIN=37,W_END=38,W_DDEAD=39;
var MODE_PLAYER=1,MODE_DRIVER=2;
var LEAVE_QUIT=0,LEAVE_CAPTURED=1,LEAVE_HURRICAN=2,LEAVE_DRIVER=3,LEAVE_FORK=4,LEAVE_SYNC=5;
var LOGKEY='sail/log',NLOG=10,TITLE=['Admiral','Commodore','Captain','Captain','Captain','Captain','Captain','Commander','Commander','Lieutenant'];
var LOADNAME='-GCRDE',VERSION='Wooden Ships and Iron Men, Version 5.1 (85/05/29)',WSaIM='Wooden Ships & Iron Men';
var BOX_T=1,BOX_L=0,BOX_X=65,BOX_Y=16,BOX_B=BOX_T+BOX_Y-1,BOX_R=BOX_L+BOX_X-1,TURN_T=BOX_B,TURN_Y=1,TURN_X=9,TURN_L=Math.trunc((BOX_L+BOX_R-TURN_X)/2),STAT_T=0,STAT_B=BOX_B,STAT_L=BOX_R+2,STAT_X=14,STAT_Y=STAT_B-STAT_T+1,STAT_R=STAT_L+STAT_X-1,STAT_1=0,STAT_2=STAT_1+4,STAT_3=STAT_2+7,SCROLL_T=BOX_B+1,SCROLL_L=0,VIEW_T=BOX_T+1,VIEW_L=BOX_L+1,VIEW_X=BOX_X-5,VIEW_Y=BOX_Y-2,SLOT_T=VIEW_T,SLOT_L=VIEW_L+VIEW_X,SLOT_X=3,SLOT_Y=VIEW_Y;
var DRIFT=10; /* movebuf is ten chars and drift is the next, a signed char: a move that runs over, runs into it, so they are one array here */
var EXIT={},READ={},KEY={},MEASURE={},SCREEN={};
function abs(a){return a>0?a:-a}
function min(a,b){return a<b?a:b}
function idiv(a,b){return Math.trunc(a/b)}
function distance(x,y){return abs(x)>=abs(y)?abs(x)+idiv(abs(y),2):abs(y)+idiv(abs(x),2)}
function isspace(c){return c===' '||c==='\t'||c==='\n'||c==='\v'||c==='\f'||c==='\r'}
function isdigit(c){return c>='0'&&c<='9'}
function pad(v,w,left){var s=String(v);return left?s.padEnd(w):s.padStart(w)}
/* sprintf for what these formats use */
function sprintf(f,args){
  var i=0;
  return f.replace(/%(-?)(\d*)(?:\.(\d+))?([sdc%])/g,function(m,l,w,pr,t){
    if(t==='%')return '%';
    var v=args[i++],s;
    s=v===undefined||v===null?'':String(v);
    if(pr!==undefined)s=s.slice(0,+pr);
    return w?pad(s,+w,!!l):s;
  });
}
function readlog(){
  var L=P.saved(LOGKEY),ok=L&&typeof L==='object'&&Number.isInteger(L.persons)&&Array.isArray(L.log)&&L.log.length<=NLOG;
  if(ok)ok=L.log.every(function(e){return e&&typeof e.name==='string'&&typeof e.user==='string'&&Number.isInteger(e.ship)&&Number.isInteger(e.game)&&Number.isInteger(e.points)&&e.game>=0&&e.game<SCENE.length&&e.ship>=0&&e.ship<SCENE[e.game].ship.length});
  return ok?L:null;
}
function lo_main(longfmt){
  var L=readlog(),n=0;
  if(!L){P.say(['Nobody has sailed yet.']);return}
  L.log.forEach(function(e){
    if(!e.name)return;
    var sbuf=longfmt?sprintf('%10.10s (%s)',[e.name,e.user]):sprintf('%20.20s',[e.name]);
    var ship=SCENE[e.game].ship[e.ship],pts=SPECS[ship[1]][18];
    P.say([sprintf('%-10s %21s of the %15s %3d points, ',[TITLE[n++],sbuf,ship[0],e.points])+pad(Math.fround(e.points/pts).toFixed(2),5)+' equiv']);
  });
  P.say(['',L.persons+' people have played.']);
}
P.command({names:['sail'],run:function(a,raw,argv){
  var debug=0,longfmt=0,nobells=0,mode=MODE_PLAYER,game=-1,i,p;
  for(i=1;i<argv.length&&(p=argv[i]).charAt(0)==='-';i++){
    switch(p.charAt(1)){
    case 'd':mode=MODE_DRIVER;break;
    case 's':mode=3;break;
    case 'D':debug++;break;
    case 'x':break;
    case 'l':longfmt++;break;
    case 'b':nobells++;break;
    default:
      P.typeLine('SAIL: Unknown flag '+p+'.','err');
      return;
    }
  }
  if(i<argv.length)game=parseInt(argv[i],10)||0;
  if(mode===3){lo_main(longfmt);return}
  if(mode===MODE_DRIVER){
    if(game<0||game>=SCENE.length)P.typeLine('DRIVER: Bad game number '+game,'err');
    return;
  }
  if(P.piped()){P.typeLine('sail: needs a terminal','err');return}

  /* ---------- what the two processes share: the file, the screen, the clock ---------- */
  var syncfile=[],driver=null,seed=Math.floor(Math.random()*30000)+1; /* srand(getpid()) */
  var o='',ibuf='',intr=null,G,pl,S=null,screen_done=null,over=false,LINES=24,COLS=80;
  var phys=[],pcy=0,pcx=0,dtimer=null,atimer=null;

  function line(s){
    if(s.indexOf('\t')<0)return s;
    var r='';for(var i=0;i<s.length;i++){var c=s.charAt(i);if(c==='\t'){do r+=' ';while(r.length%8)}else r+=c}return r;
  }
  function pr(s){
    o+=s;
    var i=o.lastIndexOf('\n');
    if(i>=0){P.say(o.slice(0,i).split('\n').map(line));o=o.slice(i+1)}
  }
  function puts(s){pr(s+'\n')}
  function flushout(){if(o){P.say([line(o)]);o=''}}
  /* the keyboard before the screen: what is typed stays until it is read, and the screen gets what is left */
  function* getc(){
    while(ibuf===''){
      var l=yield READ;
      if(l===P.INT){if(intr)intr();else throw EXIT;continue}
      if(l===null)continue;
      ibuf=l+'\n';
    }
    var c=ibuf.charAt(0);
    ibuf=ibuf.slice(1);
    return c;
  }
  function unget(c){ibuf=c+ibuf}
  function* scand(){
    var c,n=0,neg=false,any=false;
    while(isspace(c=yield* getc()));
    if(c==='-'||c==='+'){neg=c==='-';c=yield* getc()}
    while(isdigit(c)){n=n*10+c.charCodeAt(0)-48;any=true;c=yield* getc()}
    unget(c);
    return any?(neg?-n:n):null;
  }
  function* scans(){
    var c,s='';
    while(isspace(c=yield* getc()));
    while(!isspace(c)){s+=c;c=yield* getc()}
    unget(c);
    return s;
  }
  function* tonl(){while((yield* getc())!=='\n');}
  function* gets(){var c,s='';while((c=yield* getc())!=='\n')s+=c;return s}

  /* ---------- curses, as much as this game asks of it. A window sends only what changed in it. ---------- */
  function newwin(l,c,y,x){
    var w={maxy:l,maxx:c,begy:y,begx:x,cury:0,curx:0,leave:false,clear:false,cell:[],touched:[]},i,j;
    for(i=0;i<l;i++){w.cell.push(new Array(c).fill(' '));w.touched.push(new Array(c).fill(false))}
    return w;
  }
  function put(w,y,x,c){if(w.cell[y][x]!==c){w.cell[y][x]=c;w.touched[y][x]=true}}
  function wclrtoeol(w){if(w.cury>=w.maxy)return;for(var x=w.curx;x<w.maxx;x++)put(w,w.cury,x,' ')}
  function werase(w){for(var y=0;y<w.maxy;y++)for(var x=0;x<w.maxx;x++)put(w,y,x,' ');w.cury=w.curx=0}
  function wclear(w){werase(w);w.clear=true}
  function wmove(w,y,x){if(x>=w.maxx||y>=w.maxy)return false;w.cury=y;w.curx=x;return true}
  function waddch(w,c){
    var x=w.curx,y=w.cury;
    switch(c){
    case '\t':{var n=x+(8-(x&7));for(;x<n;x++)if(!waddch(w,' '))return false;return true}
    case '\n':wclrtoeol(w);x=0;if(++y>=w.maxy)return false;break;
    case '\r':x=0;break;
    case '\b':if(--x<0)x=0;break;
    default:
      if(y<0||x<0||y>=w.maxy||x>=w.maxx)return false;
      put(w,y,x,c);
      if(++x>=w.maxx){x=0;if(++y>=w.maxy)return false}
    }
    w.curx=x;w.cury=y;
    return true;
  }
  function waddstr(w,s){for(var i=0;i<s.length;i++)if(!waddch(w,s.charAt(i)))return false;return true}
  function wprintw(w,f,args){return waddstr(w,sprintf(f,args||[]))}
  function mvwaddstr(w,y,x,s){if(wmove(w,y,x))waddstr(w,s)}
  function mvwaddch(w,y,x,c){if(wmove(w,y,x))waddch(w,c)}
  function wrefresh(w){
    var y,x;
    if(w.clear){
      for(y=0;y<LINES;y++)phys[y]=new Array(COLS).fill(' ');
      for(y=0;y<w.maxy;y++)for(x=0;x<w.maxx;x++)w.touched[y][x]=true;
      w.clear=false;
    }
    for(y=0;y<w.maxy;y++)for(x=0;x<w.maxx;x++)if(w.touched[y][x]){
      if(phys[y+w.begy])phys[y+w.begy][x+w.begx]=w.cell[y][x];
      w.touched[y][x]=false;
    }
    if(!w.leave){pcy=w.cury+w.begy;pcx=w.curx+w.begx}
  }
  /* the glass is narrower than the 80 columns this needs: the letters shrink until they fit, or as far as they can be read (FIT) */
  var FIT={fit:[80,24],clamp:true};
  function paint(){
    if(!S||over)return;
    var L=phys.map(function(r){return r.join('').replace(/ +$/,'')}).slice(0,S.rows);
    S.draw(L,Math.min(pcy,S.rows-1),Math.min(pcx,Math.max(S.cols-1,0)));
  }

  /* ---------- one process ---------- */
  function proc(procmode,randx){
    var cc=null,ships=[],specs=SPECS.map(function(r){return {bs:r[0],fs:r[1],ta:r[2],guns:r[3],class_:r[4],hull:r[5],qual:r[6],crew1:r[7],crew2:r[8],crew3:r[9],gunL:r[10],gunR:r[11],carL:r[12],carR:r[13],rig1:r[14],rig2:r[15],rig3:r[16],rig4:r[17],pts:r[18]}});
    var winddir=0,windspeed=0,turn=0,alive=0,people=0,hasdriver=0;
    var sync_buf=[],sync_seek=0;
    function rand(){randx=(Math.imul(randx,1103515245)+12345)&0x7fffffff;return randx}
    function die(){return (rand()>>3)%6+1}

    function mkfile(i){
      function bps(){return [{turnsent:0,toship:null,mensent:0},{turnsent:0,toship:null,mensent:0},{turnsent:0,toship:null,mensent:0}]}
      function snags(){var a=[];for(var k=0;k<NSHIP;k++)a.push({sn_count:0,sn_turn:0});return a}
      return {index:i,captain:'',points:0,loadL:0,loadR:0,readyL:0,readyR:0,OBP:bps(),DBP:bps(),struck:0,captured:0,pcrew:0,mb:[0,0,0,0,0,0,0,0,0,0,0,0],nfoul:0,ngrap:0,foul:snags(),grap:snags(),RH:0,RG:0,RR:0,FS:0,explode:0,sink:0,dir:0,col:0,row:0,loadwith:0,stern:0};
    }
    function setscene(){
      cc=SCENE[game];
      ships=cc.ship.map(function(r,i){return {shipname:r[0],specs:specs[r[1]],nationality:r[2],shiprow:r[3],shipcol:r[4],shipdir:r[5],file:mkfile(i)}});
    }
    function SHIP(i){return ships[i]}
    function grappled(a){return a.file.ngrap}
    function fouled(a){return a.file.nfoul}
    function snagged(a){return grappled(a)+fouled(a)}
    function grappled2(a,b){return a.file.grap[b.file.index].sn_count}
    function fouled2(a,b){return a.file.foul[b.file.index].sn_count}
    function snagged2(a,b){return grappled2(a,b)+fouled2(a,b)}
    function Xgrappled2(a,b){return a.file.grap[b.file.index].sn_turn<turn-1?grappled2(a,b):0}
    function Xfouled2(a,b){return a.file.foul[b.file.index].sn_turn<turn-1?fouled2(a,b):0}
    function Xsnagged2(a,b){return Xgrappled2(a,b)+Xfouled2(a,b)}
    function cleangrapple(a,b,c){Cleansnag(a,b,c,1)}
    function cleanfoul(a,b,c){Cleansnag(a,b,c,2)}
    function cleansnag(a,b,c){Cleansnag(a,b,c,3)}
    function sterncolour(sp){return String.fromCharCode(sp.file.stern+48-(sp.file.captured?10:0))}
    function sternrow(sp){return sp.file.row+DR[sp.file.dir]}
    function sterncol(sp){return sp.file.col+DC[sp.file.dir]}
    function capship(sp){return sp.file.captured?sp.file.captured:sp}
    function readyname(r){return r&R_LOADING?'*':(r&R_INITIAL?'!':' ')}
    /* the move text, in the array it shares with drift */
    function mbstr(f){var s='',i=0;while(i<f.mb.length&&f.mb[i]!==0)s+=String.fromCharCode(f.mb[i++]);return s}
    function mbput(f,at,s){for(var i=0;i<s.length;i++)if(at+i<f.mb.length)f.mb[at+i]=s.charCodeAt(i);if(at+s.length<f.mb.length)f.mb[at+s.length]=0}

    /* ---------- sync.c ---------- */
    function makesignal(from,fmt,ship,a,b,c){
      var message;
      if(ship===0)message=sprintf(fmt,[a,b,c]);
      else message=sprintf(fmt,[ship.shipname,colours(ship),sterncolour(ship),a,b,c]);
      Write(W_SIGNAL,from,1,message,0,0,0);
    }
    function Write(type,ship,isstr,a,b,c,d){
      if(isstr)sync_buf.push([type,ship.file.index,1,a]);
      else sync_buf.push([type,ship.file.index,0,a,b,c,d]);
      sync_update(type,ship,a,b,c,d);
    }
    function Sync(){
      for(;sync_seek<syncfile.length;sync_seek++){
        var e=syncfile[sync_seek];
        if(e[2])sync_update(e[0],SHIP(e[1]),e[3].replace(/^ +/,'').slice(0,79),0,0,0);
        else sync_update(e[0],SHIP(e[1]),e[3],e[4],e[5],e[6]);
      }
      if(sync_buf.length){
        for(var i=0;i<sync_buf.length;i++)syncfile.push(sync_buf[i]);
        sync_buf=[];
      }
      sync_seek=syncfile.length;
      return 0;
    }
    function sync_update(type,ship,a,b,c,d){
      var p,s;
      switch(type){
      case W_DBP:
        p=ship.file.DBP[a];p.turnsent=b;p.toship=SHIP(c);p.mensent=d;
        break;
      case W_OBP:
        p=ship.file.OBP[a];p.turnsent=b;p.toship=SHIP(c);p.mensent=d;
        break;
      case W_FOUL:
        p=ship.file.foul[a];
        if(SHIP(a).file.dir===0)break;
        if(p.sn_count++===0)p.sn_turn=turn;
        ship.file.nfoul++;
        break;
      case W_GRAP:
        p=ship.file.grap[a];
        if(SHIP(a).file.dir===0)break;
        if(p.sn_count++===0)p.sn_turn=turn;
        ship.file.ngrap++;
        break;
      case W_UNFOUL:
        p=ship.file.foul[a];
        if(p.sn_count>0){
          if(b){ship.file.nfoul-=p.sn_count;p.sn_count=0}
          else{ship.file.nfoul--;p.sn_count--}
        }
        break;
      case W_UNGRAP:
        p=ship.file.grap[a];
        if(p.sn_count>0){
          if(b){ship.file.ngrap-=p.sn_count;p.sn_count=0}
          else{ship.file.ngrap--;p.sn_count--}
        }
        break;
      case W_SIGNAL:
        if(procmode===MODE_PLAYER)Signal('%s (%c%c): %s',ship,a);
        break;
      case W_CREW:
        s=ship.specs;s.crew1=a;s.crew2=b;s.crew3=c;
        break;
      case W_CAPTAIN:
        ship.file.captain=a.slice(0,19);
        break;
      case W_CAPTURED:
        if(a<0)ship.file.captured=0;
        else ship.file.captured=SHIP(a);
        break;
      case W_CLASS:ship.specs.class_=a;break;
      case W_DRIFT:ship.file.mb[DRIFT]=a;break;
      case W_EXPLODE:
        if((ship.file.explode=a)===2)ship.file.dir=0;
        break;
      case W_FS:ship.file.FS=a;break;
      case W_GUNL:s=ship.specs;s.gunL=a;s.carL=b;break;
      case W_GUNR:s=ship.specs;s.gunR=a;s.carR=b;break;
      case W_HULL:ship.specs.hull=a;break;
      case W_MOVE:{ /* strncpy, nine chars and a null */
        var m=ship.file.mb,k;
        for(k=0;k<9;k++)m[k]=k<a.length?a.charCodeAt(k):0;
        m[9]=0;
        break;
      }
      case W_PCREW:ship.file.pcrew=a;break;
      case W_POINTS:ship.file.points=a;break;
      case W_QUAL:ship.specs.qual=a;break;
      case W_RIGG:s=ship.specs;s.rig1=a;s.rig2=b;s.rig3=c;s.rig4=d;break;
      case W_RIG1:ship.specs.rig1=a;break;
      case W_RIG2:ship.specs.rig2=a;break;
      case W_RIG3:ship.specs.rig3=a;break;
      case W_RIG4:ship.specs.rig4=a;break;
      case W_COL:ship.file.col=a;break;
      case W_DIR:ship.file.dir=a;break;
      case W_ROW:ship.file.row=a;break;
      case W_SINK:
        if((ship.file.sink=a)===2)ship.file.dir=0;
        break;
      case W_STRUCK:ship.file.struck=a;break;
      case W_TA:ship.specs.ta=a;break;
      case W_ALIVE:alive=1;break;
      case W_TURN:turn=a;break;
      case W_WIND:winddir=a;windspeed=b;break;
      case W_BEGIN:ship.file.captain='begin';people++;break;
      case W_END:ship.file.captain='';ship.file.points=0;people--;break;
      case W_DDEAD:hasdriver=0;break;
      }
      return 0;
    }
    /* ---------- misc.c ---------- */
    function range(from,to){
      var bow1r,bow1c,bow2r,bow2c,stern1r,stern1c,stern2c,stern2r,bb,bs,sb,ss,result;
      if(!to.file.dir)return -1;
      stern1r=bow1r=from.file.row;
      stern1c=bow1c=from.file.col;
      stern2r=bow2r=to.file.row;
      stern2c=bow2c=to.file.col;
      result=bb=distance(bow2r-bow1r,bow2c-bow1c);
      if(bb<5){
        stern2r+=DR[to.file.dir];
        stern2c+=DC[to.file.dir];
        stern1r+=DR[from.file.dir];
        stern1c+=DC[from.file.dir];
        bs=distance(bow2r-stern1r,bow2c-stern1c);
        sb=distance(bow1r-stern2r,bow1c-stern2c);
        ss=distance(stern2r-stern1r,stern2c-stern1c);
        result=min(bb,min(bs,min(sb,ss)));
      }
      return result;
    }
    function closestenemy(from,side,anyship){
      var a=capship(from).nationality,olddist=30000,dist,closest=0;
      for(var i=0;i<ships.length;i++){
        var sp=ships[i];
        if(sp===from)continue;
        if(sp.file.dir===0)continue;
        if(a===capship(sp).nationality&&!anyship)continue;
        if(side&&gunsbear(from,sp)!==side)continue;
        dist=range(from,sp);
        if(dist<olddist){closest=sp;olddist=dist}
      }
      return closest;
    }
    function angle(dr,dc){
      var i;
      if(dc>=0&&dr>0)i=0;
      else if(dr<=0&&dc>0)i=2;
      else if(dc<=0&&dr<0)i=4;
      else i=6;
      dr=abs(dr);
      dc=abs(dc);
      if((i===0||i===4)&&dc*2.4>dr){
        i++;
        if(dc>dr*2.4)i++;
      }
      else if((i===2||i===6)&&dr*2.4>dc){
        i++;
        if(dr>dc*2.4)i++;
      }
      return i%8+1;
    }
    function gunsbear(from,to){
      var Dr=from.file.row-to.file.row,Dc=to.file.col-from.file.col,i,ang;
      for(i=2;i;i--){
        if((ang=angle(Dr,Dc)-from.file.dir+1)<1)ang+=8;
        if(ang>=2&&ang<=4)return 'r';
        if(ang>=6&&ang<=7)return 'l';
        Dr+=DR[to.file.dir];
        Dc+=DC[to.file.dir];
      }
      return 0;
    }
    function portside(from,on,quick){
      var ang,Dr=from.file.row-on.file.row,Dc=on.file.col-from.file.col;
      if(quick===-1){
        Dr+=DR[on.file.dir];
        Dc+=DC[on.file.dir];
      }
      ang=angle(Dr,Dc);
      if(quick!==0)return ang;
      ang=(ang+4-on.file.dir-1)%8+1;
      return ang<5;
    }
    function colours(sp){
      var flag;
      if(sp.file.struck)flag='!';
      if(sp.file.explode)flag='#';
      if(sp.file.sink)flag='~';
      if(sp.file.struck)return flag;
      flag=COUNTRY[capship(sp).nationality].charAt(0);
      return sp.file.FS?flag:flag.toLowerCase();
    }
    function log(s){
      var L=readlog()||{persons:-1,log:[]},lg=L.log.slice(),net=Math.fround(s.file.points/s.specs.pts),lp;
      while(lg.length<NLOG)lg.push({name:'',user:'',ship:0,game:0,points:0});
      L.persons=L.persons<0?1:L.persons+1;
      for(lp=0;lp<NLOG;lp++){
        if(net>Math.fround(lg[lp].points/SPECS[SCENE[lg[lp].game].ship[lg[lp].ship][1]][18])){
          lg.splice(lp,0,{name:s.file.captain,user:String(P.st.user||''),ship:s.file.index,game:game,points:s.file.points});
          lg.length=NLOG;
          break;
        }
      }
      L.log=lg;
      P.save(LOGKEY,L);
    }
    /* ---------- parties.c ---------- */
    function meleeing(from,to){
      for(var i=0;i<NBP;i++){var p=from.file.OBP[i];if(p.turnsent&&p.toship===to)return 1}
      return 0;
    }
    function boarding(from,isdefense){
      var q=isdefense?from.file.DBP:from.file.OBP;
      for(var i=0;i<NBP;i++)if(q[i].turnsent)return 1;
      return 0;
    }
    function unboard(ship,to,isdefense){
      var q=isdefense?ship.file.DBP:ship.file.OBP;
      for(var n=0;n<NBP;n++){
        var p=q[n];
        if(p.turnsent&&(p.toship===to||isdefense||ship===to))Write(isdefense?W_DBP:W_OBP,ship,0,n,0,0,0);
      }
    }
    /* ---------- game.c ---------- */
    function maxturns(ship,af){
      var turns=ship.specs.ta;
      if(af.v=(ship.file.mb[DRIFT]>1&&turns)?1:0){
        turns--;
        if(ship.file.FS===1)turns=0;
      }
      return turns;
    }
    function WE(c){return windspeed>=7?{A:RIGT[0][c][0],B:RIGT[0][c][1],C:RIGT[0][c][2],D:RIGT[0][c][3]}:{A:WET[windspeed][c][0],B:WET[windspeed][c][1],C:WET[windspeed][c][2],D:WET[windspeed][c][3]}}
    function maxmove(ship,dir,fs){
      var riggone=0,Move,flank=0,w=WE(ship.specs.class_-1);
      Move=ship.specs.bs;
      if(!ship.specs.rig1)riggone++;
      if(!ship.specs.rig2)riggone++;
      if(!ship.specs.rig3)riggone++;
      if(!ship.specs.rig4)riggone++;
      if((ship.file.FS||fs)&&fs!==-1){
        flank=1;
        Move=ship.specs.fs;
      }
      if(dir===winddir)Move-=1+w.B;
      else if(dir===winddir+2||dir===winddir-2||dir===winddir-6||dir===winddir+6)Move-=1+w.C;
      else if(dir===winddir+3||dir===winddir-3||dir===winddir-5||dir===winddir+5)Move=(flank?2:1)-w.D;
      else if(dir===winddir+4||dir===winddir-4)Move=0;
      else Move-=w.A;
      Move-=riggone;
      Move=Move<0?0:Move;
      return Move;
    }
    /* ---------- assorted.c ---------- */
    function table(rig,shot,hittable,on,from,roll){
      var hhits=0,chits=0,ghits=0,rhits=0,Ghit=0,Hhit=0,Rhit=0,Chit=0,guns,car,pc,hull,crew,n,rigg,message,tp;
      pc=on.file.pcrew;
      hull=on.specs.hull;
      crew=[on.specs.crew1,on.specs.crew2,on.specs.crew3];
      rigg=[on.specs.rig1,on.specs.rig2,on.specs.rig3,on.specs.rig4];
      if(shot===L_GRAPE)Chit=chits=hittable;
      else{
        tp=(rig?RIGT:HULLT)[hittable][roll-1];
        Chit=chits=tp[2];
        Rhit=rhits=tp[3];
        Hhit=hhits=tp[0];
        Ghit=ghits=tp[1];
        if(on.file.FS)rhits*=2;
        if(shot===L_CHAIN){
          Ghit=ghits=0;
          Hhit=hhits=0;
        }
      }
      if(on.file.captured!==0){
        pc-=idiv(chits+1,2);
        chits=idiv(chits,2);
      }
      for(n=0;n<3;n++)
        if(chits>crew[n]){
          chits-=crew[n];
          crew[n]=0;
        }
        else{
          crew[n]-=chits;
          chits=0;
        }
      for(n=0;n<3;n++)
        if(rhits>rigg[n]){
          rhits-=rigg[n];
          rigg[n]=0;
        }
        else{
          rigg[n]-=rhits;
          rhits=0;
        }
      if(rigg[3]!==-1&&rhits>rigg[3]){
        rhits-=rigg[3];
        rigg[3]=0;
      }
      else if(rigg[3]!==-1)rigg[3]-=rhits;
      if(rig&&!rigg[2]&&(!rigg[3]||rigg[3]===-1))makesignal(on,'dismasted!',0);
      if(portside(from,on,0)){
        guns=on.specs.gunR;
        car=on.specs.carR;
      }
      else{
        guns=on.specs.gunL;
        car=on.specs.carL;
      }
      if(ghits>car){
        ghits-=car;
        car=0;
      }
      else{
        car-=ghits;
        ghits=0;
      }
      if(ghits>guns){
        ghits-=guns;
        guns=0;
      }
      else{
        guns-=ghits;
        ghits=0;
      }
      hull-=ghits;
      if(Ghit)Write(portside(from,on,0)?W_GUNR:W_GUNL,on,0,guns,car,0,0);
      hull-=hhits;
      hull=hull<0?0:hull;
      if(on.file.captured!==0&&Chit)Write(W_PCREW,on,0,pc,0,0,0);
      if(Hhit)Write(W_HULL,on,0,hull,0,0,0);
      if(Chit)Write(W_CREW,on,0,crew[0],crew[1],crew[2],0);
      if(Rhit)Write(W_RIGG,on,0,rigg[0],rigg[1],rigg[2],rigg[3]);
      switch(shot){
      case L_ROUND:message='firing round shot on %s (%c%c)';break;
      case L_GRAPE:message='firing grape shot on %s (%c%c)';break;
      case L_CHAIN:message='firing chain shot on %s (%c%c)';break;
      case L_DOUBLE:message='firing double shot on %s (%c%c)';break;
      case L_EXPLODE:message='exploding shot on %s (%c%c)';
      }
      makesignal(from,message,on);
      if(roll===6&&rig){
        switch(Rhit){
        case 0:message='fore topsail sheets parted';break;
        case 1:message='mizzen shrouds parted';break;
        case 2:message='main topsail yard shot away';break;
        case 4:message='fore topmast and foremast shrouds shot away';break;
        case 5:message='mizzen mast and yard shot through';break;
        case 6:message='foremast and spritsail yard shattered';break;
        case 7:message='main topmast and mizzen mast shattered';break;
        }
        makesignal(on,message,0);
      }
      else if(roll===6){
        switch(Hhit){
        case 0:message='anchor cables severed';break;
        case 1:message='two anchor stocks shot away';break;
        case 2:message='quarterdeck bulwarks damaged';break;
        case 3:message='three gun ports shot away';break;
        case 4:message='four guns dismounted';break;
        case 5:
          message='rudder cables shot through';
          Write(W_TA,on,0,0,0,0,0);
          break;
        case 6:message='shot holes below the water line';break;
        }
        makesignal(on,message,0);
      }
      if(!hull)strike(on,from);
    }
    function Cleansnag(from,to,all,flag){
      if(flag&1){
        Write(W_UNGRAP,from,0,to.file.index,all,0,0);
        Write(W_UNGRAP,to,0,from.file.index,all,0,0);
      }
      if(flag&2){
        Write(W_UNFOUL,from,0,to.file.index,all,0,0);
        Write(W_UNFOUL,to,0,from.file.index,all,0,0);
      }
      if(!snagged2(from,to)){
        if(!snagged(from)){
          unboard(from,from,1);
          unboard(from,from,0);
        }
        else unboard(from,to,0);
        if(!snagged(to)){
          unboard(to,to,1);
          unboard(to,to,0);
        }
        else unboard(to,from,0);
      }
    }
    function strike(ship,from){
      var points;
      if(ship.file.struck)return;
      Write(W_STRUCK,ship,0,1,0,0,0);
      points=ship.specs.pts+from.file.points;
      Write(W_POINTS,from,0,points,0,0,0);
      unboard(ship,ship,0);
      unboard(ship,ship,1);
      switch(die()){
      case 3:case 4:
        Write(W_SINK,ship,0,1,0,0,0);
        break;
      case 5:case 6:
        Write(W_EXPLODE,ship,0,1,0,0,0);
        break;
      }
      Write(W_SIGNAL,ship,1,'striking her colours!',0,0,0);
    }
    /* ---------- dr_1.c ---------- */
    function unfoul(){
      ships.forEach(function(sp){
        var nat,i;
        if(sp.file.captain)return;
        nat=capship(sp).nationality;
        ships.forEach(function(to){
          if(nat!==capship(to).nationality&&!toughmelee(sp,to,0,0))return;
          for(i=fouled2(sp,to);--i>=0;)
            if(die()<=2)cleanfoul(sp,to,0);
        });
      });
    }
    function boardcomp(){
      ships.forEach(function(sp){
        var crew;
        if(sp.file.captain)return;
        if(sp.file.dir===0)return;
        if(sp.file.struck||sp.file.captured!==0)return;
        if(!snagged(sp))return;
        crew=[sp.specs.crew1!==0?1:0,sp.specs.crew2!==0?1:0,sp.specs.crew3!==0?1:0];
        ships.forEach(function(sq){
          if(!Xsnagged2(sp,sq))return;
          if(meleeing(sp,sq))return;
          if(!sq.file.dir||sp.nationality===capship(sq).nationality)return;
          switch(sp.specs.class_-sq.specs.class_){
          case -3:case -4:case -5:
            if(crew[0]){
              sendbp(sp,sq,crew[0]*100,0);
              crew[0]=0;
            }
            else if(crew[1]){
              sendbp(sp,sq,crew[1]*10,0);
              crew[1]=0;
            }
            break;
          case -2:
            if(crew[0]||crew[1]){
              sendbp(sp,sq,crew[0]*100+crew[1]*10,0);
              crew[0]=crew[1]=0;
            }
            break;
          case -1:case 0:case 1:
            if(crew[0]){
              sendbp(sp,sq,crew[0]*100+crew[1]*10,0);
              crew[0]=crew[1]=0;
            }
            break;
          case 2:case 3:case 4:case 5:
            sendbp(sp,sq,crew[0]*100+crew[1]*10+crew[2],0);
            crew[0]=crew[1]=crew[2]=0;
            break;
          }
        });
      });
    }
    function MTat(index){var k=2-idiv(die(),3);return index<0?0:MT[index][k]}
    function fightitout(from,to,key){
      var fromcap,tocap,crewfrom=[0,0,0],crewto=[0,0,0],menfrom,mento,pcto,pcfrom,fromstrength,strengthto,frominjured,toinjured,topoints,index,totalfrom=0,totalto=0,count,message,r;
      r=mensent(from,to,crewfrom,key);menfrom=r.men;fromcap=r.captured;pcfrom=r.pc;
      r=mensent(to,from,crewto,0);mento=r.men;tocap=r.captured;pcto=r.pc;
      if(fromcap===0)fromcap=from;
      if(tocap===0)tocap=to;
      if(key){
        if(!menfrom){
          if(fromcap===from)menfrom=from.specs.crew1+from.specs.crew2+from.specs.crew3;
          else menfrom=from.file.pcrew;
        }
        else menfrom*=2;
      }
      fromstrength=menfrom*fromcap.specs.qual;
      strengthto=mento*tocap.specs.qual;
      for(count=0;((fromstrength<strengthto*3&&strengthto<fromstrength*3)||fromstrength===-1)&&count<4;count++){
        index=idiv(fromstrength,10);
        if(index>8)index=8;
        toinjured=MTat(index);
        totalto+=toinjured;
        index=idiv(strengthto,10);
        if(index>8)index=8;
        frominjured=MTat(index);
        totalfrom+=frominjured;
        menfrom-=frominjured;
        mento-=toinjured;
        fromstrength=menfrom*fromcap.specs.qual;
        strengthto=mento*tocap.specs.qual;
      }
      if(fromstrength>=strengthto*3||count===4){
        unboard(to,from,0);
        subtract(from,totalfrom,crewfrom,fromcap,pcfrom);
        subtract(to,totalto,crewto,tocap,pcto);
        makesignal(from,'boarders from %s repelled',to);
        message=sprintf('killed in melee: %d.  %s: %d',[totalto,from.shipname,totalfrom]);
        Write(W_SIGNAL,to,1,message,0,0,0);
        if(key)return 1;
      }
      else if(strengthto>=fromstrength*3){
        unboard(from,to,0);
        subtract(from,totalfrom,crewfrom,fromcap,pcfrom);
        subtract(to,totalto,crewto,tocap,pcto);
        if(key){
          if(fromcap!==from)Write(W_POINTS,fromcap,0,(fromcap.file.points-from.file.struck)?from.specs.pts:2*from.specs.pts,0,0,0);
          Write(W_CAPTURED,from,0,to.file.index,0,0,0);
          topoints=2*from.specs.pts+to.file.points;
          if(from.file.struck)topoints-=from.specs.pts;
          Write(W_POINTS,to,0,topoints,0,0,0);
          mento=crewto[0]?crewto[0]:crewto[1];
          if(mento){
            subtract(to,mento,crewto,tocap,pcto);
            subtract(from,-mento,crewfrom,to,0);
          }
          message=sprintf('captured by the %s!',[to.shipname]);
          Write(W_SIGNAL,from,1,message,0,0,0);
          message=sprintf('killed in melee: %d.  %s: %d',[totalto,from.shipname,totalfrom]);
          Write(W_SIGNAL,to,1,message,0,0,0);
          mento=0;
          return 0;
        }
      }
      return 0;
    }
    function resolve(){
      var thwart,i,j,sp,sq;
      for(i=0;i<ships.length;i++){
        sp=ships[i];
        if(sp.file.dir===0)continue;
        for(j=i+1;j<ships.length;j++){
          sq=ships[j];
          if(sq.file.dir&&meleeing(sp,sq)&&meleeing(sq,sp))fightitout(sp,sq,0);
        }
        thwart=2;
        for(j=0;j<ships.length;j++){
          sq=ships[j];
          if(sq.file.dir&&meleeing(sq,sp))thwart=fightitout(sp,sq,1);
          if(!thwart)break;
        }
        if(!thwart){
          for(j=0;j<ships.length;j++){
            sq=ships[j];
            if(sq.file.dir&&meleeing(sq,sp))unboard(sq,sp,0);
            unboard(sp,sq,0);
          }
          unboard(sp,sp,1);
        }
        else if(thwart===2)unboard(sp,sp,1);
      }
    }
    function compcombat(){
      var n,sp,closest,crew,men=0,target,temp,r,guns,ready,load,car,index,rakehim,sternrake,shootat,hit,i;
      for(i=0;i<ships.length;i++){
        sp=ships[i];
        if(sp.file.captain||sp.file.dir===0)continue;
        crew=[sp.specs.crew1,sp.specs.crew2,sp.specs.crew3];
        for(n=0;n<3;n++)if(sp.file.OBP[n].turnsent)men+=sp.file.OBP[n].mensent;
        for(n=0;n<3;n++)if(sp.file.DBP[n].turnsent)men+=sp.file.DBP[n].mensent;
        if(men){
          crew[0]=idiv(men,100)?0:(crew[0]!==0?1:0);
          crew[1]=idiv(men%100,10)?0:(crew[1]!==0?1:0);
          crew[2]=men%10?0:(crew[2]!==0?1:0);
        }
        for(r=0;r<2;r++){
          if(!crew[2])continue;
          if(sp.file.struck)continue;
          if(r){
            ready=sp.file.readyR;
            guns=sp.specs.gunR;
            car=sp.specs.carR;
          }
          else{
            ready=sp.file.readyL;
            guns=sp.specs.gunL;
            car=sp.specs.carL;
          }
          if(!guns&&!car)continue;
          if((ready&R_LOADED)===0)continue;
          closest=closestenemy(sp,r?'r':'l',0);
          if(closest===0)continue;
          if(range(closest,sp)>range(sp,closestenemy(sp,r?'r':'l',1)))continue;
          if(closest.file.struck)continue;
          target=range(sp,closest);
          if(target>10)continue;
          if(!guns&&target>=3)continue;
          load=L_ROUND;
          if(target===1&&sp.file.loadwith===L_GRAPE)load=L_GRAPE;
          if(target<=3&&closest.file.FS)load=L_CHAIN;
          if(target===1&&load!==L_GRAPE)load=L_DOUBLE;
          if(load>L_CHAIN&&target<6)shootat=HULL;
          else shootat=RIGGING;
          rakehim=gunsbear(sp,closest)&&!gunsbear(closest,sp);
          temp=portside(closest,sp,1)-closest.file.dir+1;
          if(temp<1)temp+=8;
          if(temp>8)temp-=8;
          sternrake=temp>4&&temp<6;
          index=guns;
          if(target<3)index+=car;
          index=idiv(index-1,3);
          index=index>8?8:index;
          hit=hdt(rakehim?HDTRAKE:HDT,index,target);
          if(rakehim&&sternrake)hit++;
          hit+=QUAL[index][capship(sp).specs.qual-1];
          for(n=0;n<3&&sp.file.captured===0;n++)
            if(!crew[n]){
              if(index<=5)hit--;
              else hit-=2;
            }
          if(ready&R_INITIAL){
            if(!r)sp.file.readyL&=~R_INITIAL;
            else sp.file.readyR&=~R_INITIAL;
            if(index<=3)hit++;
            else hit+=2;
          }
          if(sp.file.captured!==0){
            if(index<=1)hit--;
            else hit-=2;
          }
          hit+=AMMO[index][load-1];
          temp=sp.specs.class_;
          if((temp>=5||temp===1)&&windspeed===5)hit--;
          if(windspeed===6&&temp===4)hit-=2;
          if(windspeed===6&&temp<=3)hit--;
          if(hit>=0){
            if(load!==L_GRAPE)hit=hit>10?10:hit;
            table(shootat,load,hit,closest,sp,die());
          }
        }
      }
    }
    function hdt(T,index,target){return target<1?(index===0?0:T[index-1][10+target-1]):T[index][target-1]}
    function next(){
      if(++turn%55===0){
        if(alive)alive=0;
        else people=0;
      }
      if(people<=0||windspeed===7){
        var net,best=Math.fround(0),bestship=null;
        ships.forEach(function(s){
          if(s.file.captain)return;
          net=Math.fround(s.file.points/s.specs.pts);
          if(net>best){
            best=net;
            bestship=s;
          }
        });
        if(best>0){
          bestship.file.captain='Driver';
          log(bestship);
        }
        return -1;
      }
      Write(W_TURN,SHIP(0),0,turn,0,0,0);
      if(turn%7===0&&(die()>=cc.windchange||!windspeed)){
        switch(die()){
        case 1:winddir=1;break;
        case 2:break;
        case 3:winddir++;break;
        case 4:winddir--;break;
        case 5:winddir+=2;break;
        case 6:winddir-=2;break;
        }
        if(winddir>8)winddir-=8;
        if(winddir<1)winddir+=8;
        if(windspeed){
          switch(die()){
          case 1:case 2:windspeed--;break;
          case 5:case 6:windspeed++;break;
          }
        }
        else windspeed++;
        Write(W_WIND,SHIP(0),0,winddir,windspeed,0,0);
      }
      return 0;
    }
    /* ---------- dr_2.c ---------- */
    function couldwin(f,t){return f.specs.crew2>t.specs.crew2*1.5}
    function thinkofgrapples(){
      ships.forEach(function(sp){
        var friendly;
        if(sp.file.captain||sp.file.dir===0)return;
        ships.forEach(function(sq){
          friendly=sp.nationality===capship(sq).nationality;
          if(!friendly){
            if(sp.file.struck||sp.file.captured!==0)return;
            if(range(sp,sq)!==1)return;
            if(grappled2(sp,sq)){
              if(toughmelee(sp,sq,0,0))ungrap(sp,sq);
              else grap(sp,sq);
            }
            else if(couldwin(sp,sq)){
              grap(sp,sq);
              sp.file.loadwith=L_GRAPE;
            }
          }
          else ungrap(sp,sq);
        });
      });
    }
    function checkup(){
      ships.forEach(function(sp){
        var explode,sink;
        if(sp.file.dir===0)return;
        explode=sp.file.explode;
        sink=sp.file.sink;
        if(explode!==1&&sink!==1)return;
        if(die()<5)return;
        Write(sink===1?W_SINK:W_EXPLODE,sp,0,2,0,0,0);
        Write(W_DIR,sp,0,0,0,0,0);
        if(snagged(sp))ships.forEach(function(sq){cleansnag(sp,sq,1)});
        if(sink!==1){
          makesignal(sp,'exploding!',0);
          ships.forEach(function(sq){
            if(sp!==sq&&sq.file.dir&&range(sp,sq)<4)table(RIGGING,L_EXPLODE,idiv(sp.specs.guns,13),sq,sp,6);
          });
        }
        else makesignal(sp,'sinking!',0);
      });
    }
    function prizecheck(){
      ships.forEach(function(sp){
        if(sp.file.captured===0)return;
        if(sp.file.struck||sp.file.dir===0)return;
        if(sp.specs.crew1+sp.specs.crew2+sp.specs.crew3>sp.file.pcrew*6){
          Write(W_SIGNAL,sp,1,'prize crew overthrown',0,0,0);
          Write(W_POINTS,sp.file.captured,0,sp.file.captured.file.points-2*sp.specs.pts,0,0,0);
          Write(W_CAPTURED,sp,0,-1,0,0,0);
        }
      });
    }
    function strend(s){return s===''?0:s.charCodeAt(s.length-1)}
    var DTAB=[0,1,1,2,3,4,4,5];
    function closeon(from,to,ta,ma,af){
      var st={temp:'',command:'',high:-30000};
      from.file.mb[0]=0;
      tryit(st,ma,ta,af,ma,from.file.dir,from,to,0);
      mbput(from.file,0,st.command);
    }
    function score(st,ship,to,onlytemp){
      var fp=ship.file,row,col,dir,total,ran,box;
      if((dir=fp.dir)===0)return 0;
      row=fp.row;
      col=fp.col;
      box={drift:fp.mb[DRIFT]};
      movep(st.temp,ship,box);
      ran=range(ship,to);
      total=-50*ran;
      if(ran<4&&gunsbear(ship,to))total+=60;
      if((ran=portside(ship,to,1)-fp.dir)===4||ran===-4)total=-30000;
      if(!onlytemp){
        fp.row=row;
        fp.col=col;
        fp.dir=dir;
      }
      return total;
    }
    function movep(p,ship,box){
      var dist,moved=0,fp=ship.file;
      for(var i=0;i<p.length;i++){
        var c=p.charAt(i);
        switch(c){
        case 'r':if(++fp.dir===9)fp.dir=1;break;
        case 'l':if(--fp.dir===0)fp.dir=8;break;
        case '1':case '2':case '3':case '4':case '5':case '6':case '7':
          moved++;
          if(fp.dir%2===0)dist=DTAB[+c];
          else dist=+c;
          fp.row-=DR[fp.dir]*dist;
          fp.col-=DC[fp.dir]*dist;
          break;
        }
      }
      if(!moved){
        if(windspeed!==0&&(box.drift=(box.drift+1)<<24>>24)>2){
          if((ship.specs.class_>=3&&!snagged(ship))||(turn&1)===0){
            fp.row-=DR[winddir];
            fp.col-=DC[winddir];
          }
        }
      }
      else box.drift=0;
    }
    function rakeyou(f,t){return gunsbear(f,t)&&!gunsbear(t,f)}
    function tryit(st,ma,ta,af,vma,dir,f,t,rakeme){
      var nw,n;
      if((n=strend(st.temp))<49||n>57)
        for(n=1;vma-n>=0;n++){
          st.temp+=String(n);
          nw=score(st,f,t,rakeme);
          if(nw>st.high&&(!rakeme||rakeyou(f,t))){
            st.high=nw;
            st.command=st.temp;
          }
          tryit(st,ma-n,ta,af,vma-n,dir,f,t,rakeme);
          st.temp=st.temp.slice(0,-1);
        }
      if((ma>0&&ta>0&&(n=strend(st.temp))!==108&&n!==114)||!st.temp.length){
        st.temp+='r';
        nw=score(st,f,t,rakeme);
        if(nw>st.high&&(!rakeme||(gunsbear(f,t)&&!gunsbear(t,f)))){
          st.high=nw;
          st.command=st.temp;
        }
        tryit(st,ma-1,ta-1,af,min(ma-1,maxmove(f,dir===8?1:dir+1,0)),dir===8?1:dir+1,f,t,rakeme);
        st.temp=st.temp.slice(0,-1);
      }
      if((ma>0&&ta>0&&(n=strend(st.temp))!==108&&n!==114)||!st.temp.length){
        st.temp+='l';
        nw=score(st,f,t,rakeme);
        if(nw>st.high&&(!rakeme||(gunsbear(f,t)&&!gunsbear(t,f)))){
          st.high=nw;
          st.command=st.temp;
        }
        tryit(st,ma-1,ta-1,af,min(ma-1,maxmove(f,dir-1?dir-1:8,0)),dir-1?dir-1:8,f,t,rakeme);
        st.temp=st.temp.slice(0,-1);
      }
    }
    /* ---------- dr_3.c ---------- */
    function moveall(){
      var row=[],col=[],dir=[],drift=[],moved=[],n,k,l,i,j,sp,sq;
      for(i=0;i<ships.length;i++){
        sp=ships[i];
        var closest,ma,ta,af={v:0};
        if(sp.file.captain||sp.file.dir===0)continue;
        if(!sp.file.struck&&windspeed&&!snagged(sp)&&sp.specs.crew3){
          ta=maxturns(sp,af);
          ma=maxmove(sp,sp.file.dir,0);
          closest=closestenemy(sp,0,0);
          if(closest===0)sp.file.mb[0]=0;
          else closeon(sp,closest,ta,ma,af.v);
        }
        else sp.file.mb[0]=0;
      }
      for(n=0;n<ships.length;n++){
        sp=ships[n];
        if(snagged(sp))mbput(sp.file,0,'d');
        else if(sp.file.mb[0]!==100)mbput(sp.file,mbstr(sp.file).length,'d');
        row[n]=sp.file.row;
        col[n]=sp.file.col;
        dir[n]=sp.file.dir;
        drift[n]=sp.file.mb[DRIFT];
        moved[n]=0;
      }
      for(k=0;stillmoving(k);k++){
        for(n=0;n<ships.length;n++){
          sp=ships[n];
          if(!sp.file.mb[k]){if(k+1<sp.file.mb.length)sp.file.mb[k+1]=0}
          else if(sp.file.dir)step(String.fromCharCode(sp.file.mb[k]),sp,moved,n);
        }
        for(n=0;n<ships.length;n++){
          sp=ships[n];
          if(sp.file.dir===0||isolated(sp))continue;
          for(l=0;l<ships.length;l++){
            sq=ships[l];
            var snap=0;
            if(sp===sq)continue;
            if(sq.file.dir===0)continue;
            if(!push(sp,sq,n,l))continue;
            if(snagged2(sp,sq)&&range(sp,sq)>1)snap++;
            if(!range(sp,sq)&&!fouled2(sp,sq)){
              makesignal(sp,'collision with %s (%c%c)',sq);
              if(die()<4){
                makesignal(sp,'fouled with %s (%c%c)',sq);
                Write(W_FOUL,sp,0,l,0,0,0);
                Write(W_FOUL,sq,0,n,0,0,0);
              }
              snap++;
            }
            if(snap){
              if(k+1<sp.file.mb.length)sp.file.mb[k+1]=0;
              if(k+1<sq.file.mb.length)sq.file.mb[k+1]=0;
              sq.file.row=sp.file.row-1;
              if(sp.file.dir===1||sp.file.dir===5)sq.file.col=sp.file.col-1;
              else sq.file.col=sp.file.col;
              sq.file.dir=sp.file.dir;
            }
          }
        }
      }
      for(n=0;n<ships.length;n++){
        sp=ships[n];
        if(sp.file.dir!==0){
          sp.file.mb[0]=0;
          if(row[n]!==sp.file.row)Write(W_ROW,sp,0,sp.file.row,0,0,0);
          if(col[n]!==sp.file.col)Write(W_COL,sp,0,sp.file.col,0,0,0);
          if(dir[n]!==sp.file.dir)Write(W_DIR,sp,0,sp.file.dir,0,0,0);
          if(drift[n]!==sp.file.mb[DRIFT])Write(W_DRIFT,sp,0,sp.file.mb[DRIFT],0,0,0);
        }
      }
    }
    function stillmoving(k){
      for(var i=0;i<ships.length;i++)if(ships[i].file.mb[k])return 1;
      return 0;
    }
    function isolated(ship){
      for(var i=0;i<ships.length;i++)if(ship!==ships[i]&&range(ship,ships[i])<=10)return 0;
      return 1;
    }
    function push(from,to,n,l){
      var sb=to.specs.guns,bs=from.specs.guns;
      if(sb>bs)return 1;
      if(sb<bs)return 0;
      return n<l;
    }
    function step(com,sp,moved,n){
      var dist;
      switch(com){
      case 'r':if(++sp.file.dir===9)sp.file.dir=1;break;
      case 'l':if(--sp.file.dir===0)sp.file.dir=8;break;
      case '0':case '1':case '2':case '3':case '4':case '5':case '6':case '7':
        if(sp.file.dir%2===0)dist=DTAB[+com];
        else dist=+com;
        sp.file.row-=DR[sp.file.dir]*dist;
        sp.file.col-=DC[sp.file.dir]*dist;
        moved[n]=1;
        break;
      case 'b':break;
      case 'd':
        if(!moved[n]){
          if(windspeed!==0&&(sp.file.mb[DRIFT]=(sp.file.mb[DRIFT]+1)<<24>>24)>2&&((sp.specs.class_>=3&&!snagged(sp))||(turn&1)===0)){
            sp.file.row-=DR[winddir];
            sp.file.col-=DC[winddir];
          }
        }
        else sp.file.mb[DRIFT]=0;
        break;
      }
    }
    function sendbp(from,to,sections,isdefense){
      var n,bp=isdefense?from.file.DBP:from.file.OBP;
      for(n=0;n<NBP&&bp[n].turnsent;n++);
      if(n<NBP&&sections){
        Write(isdefense?W_DBP:W_OBP,from,0,n,turn,to.file.index,sections);
        if(isdefense)makesignal(from,'repelling boarders',0);
        else makesignal(from,'boarding the %s (%c%c)',to);
      }
    }
    function toughmelee(ship,to,isdefense,count){
      var bp,obp=0,n,OBP=0,DBP=0,dbp=0,qual;
      qual=ship.specs.qual;
      bp=isdefense?ship.file.DBP:ship.file.OBP;
      for(n=0;n<NBP;n++){
        var b=bp[n];
        if(b.turnsent&&(to===b.toship||isdefense)){
          obp+=idiv(b.mensent,100)?ship.specs.crew1*qual:0;
          obp+=idiv(b.mensent%100,10)?ship.specs.crew2*qual:0;
          obp+=b.mensent%10?ship.specs.crew3*qual:0;
        }
      }
      if(count||isdefense)return obp;
      OBP=toughmelee(to,ship,0,count+1);
      dbp=toughmelee(ship,to,1,count+1);
      DBP=toughmelee(to,ship,1,count+1);
      if(OBP>obp+10||OBP+DBP>=obp+dbp+10)return 1;
      else return 0;
    }
    function reload(){ships.forEach(function(sp){sp.file.loadwith=0})}
    function checksails(){
      ships.forEach(function(sp){
        var rig,full,close;
        if(sp.file.captain)return;
        rig=sp.specs.rig1;
        if(windspeed===6||(windspeed===5&&sp.specs.class_>4))rig=0;
        if(rig&&sp.specs.crew3){
          close=closestenemy(sp,0,0);
          if(close!==0){
            if(range(sp,close)>9)full=1;
            else full=0;
          }
          else full=0;
        }
        else full=0;
        if((sp.file.FS!==0?1:0)!==full)Write(W_FS,sp,0,full,0,0,0);
      });
    }
    /* ---------- dr_4.c, dr_5.c ---------- */
    function ungrap(from,to){
      var k,friend;
      if((k=grappled2(from,to))===0)return;
      friend=capship(from).nationality===capship(to).nationality;
      while(--k>=0){
        if(friend||die()<3){
          cleangrapple(from,to,0);
          makesignal(from,'ungrappling %s (%c%c)',to);
        }
      }
    }
    function grap(from,to){
      if(capship(from).nationality!==capship(to).nationality&&die()>2)return;
      Write(W_GRAP,from,0,to.file.index,0,0,0);
      Write(W_GRAP,to,0,from.file.index,0,0,0);
      makesignal(from,'grappled with %s (%c%c)',to);
    }
    function subtract(from,totalfrom,crewfrom,fromcap,pcfrom){
      var n;
      if(fromcap===from&&totalfrom){
        for(n=0;n<3;n++){
          if(totalfrom>crewfrom[n]){
            totalfrom-=crewfrom[n];
            crewfrom[n]=0;
          }
          else{
            crewfrom[n]-=totalfrom;
            totalfrom=0;
          }
        }
        Write(W_CREW,from,0,crewfrom[0],crewfrom[1],crewfrom[2],0);
      }
      else if(totalfrom){
        pcfrom-=totalfrom;
        pcfrom=pcfrom<0?0:pcfrom;
        Write(W_PCREW,from,0,pcfrom,0,0,0);
      }
    }
    function mensent(from,to,crew,isdefense){
      var men=0,n,c1,c2,c3,bp,pc=from.file.pcrew,captured=from.file.captured;
      crew[0]=from.specs.crew1;
      crew[1]=from.specs.crew2;
      crew[2]=from.specs.crew3;
      bp=isdefense?from.file.DBP:from.file.OBP;
      for(n=0;n<NBP;n++)if(bp[n].turnsent&&bp[n].toship===to)men+=bp[n].mensent;
      if(men){
        c1=idiv(men,100)?crew[0]:0;
        c2=idiv(men%100,10)?crew[1]:0;
        c3=idiv(men,10)?crew[2]:0;
        c3=captured===0?crew[2]:pc;
      }
      else c1=c2=c3=0;
      return {men:c1+c2+c3,captured:captured,pc:pc};
    }
    /* ---------- dr_main.c ---------- */
    function dr_main(){
      var nat=[0,0,0,0,0,0,0,0];
      setscene();
      ships.forEach(function(sp){
        sp.file.loadL=L_ROUND;
        sp.file.loadR=L_ROUND;
        sp.file.readyR=R_LOADED|R_INITIAL;
        sp.file.readyL=R_LOADED|R_INITIAL;
        sp.file.stern=nat[sp.nationality]++;
        sp.file.dir=sp.shipdir;
        sp.file.row=sp.shiprow;
        sp.file.col=sp.shipcol;
      });
      windspeed=cc.windspeed;
      winddir=cc.winddir;
      people=0;
      sync_seek=0;
    }
    /* one time round the loop, after its sleep(7); false when it has ended */
    function dr_pass(){
      Sync();
      if(next()<0)return false;
      unfoul();
      checkup();
      prizecheck();
      moveall();
      thinkofgrapples();
      boardcomp();
      compcombat();
      resolve();
      reload();
      checksails();
      Sync();
      return true;
    }
    if(procmode===MODE_DRIVER)return {dr_main:dr_main,dr_pass:dr_pass};

    /* ---------- the player: pl_7.c ---------- */
    var done_curses=0,loaded=0,fired=0,changed=0,repaired=0,dont_adjust=0,viewrow=0,viewcol=0,movebuf='',player=0,ms=0,mf=null,mc=null;
    var view_w,slot_w,scroll_w,stat_w,turn_w,stdscr,sc_hasprompt=0,sc_prompt='',sc_buf='',sc_line=0,SCROLL_Y=0;
    function initscreen(){
      stdscr=newwin(LINES,COLS,0,0);
      view_w=newwin(VIEW_Y,VIEW_X,VIEW_T,VIEW_L);
      slot_w=newwin(SLOT_Y,SLOT_X,SLOT_T,SLOT_L);
      SCROLL_Y=LINES-1-SCROLL_T+1;
      scroll_w=newwin(SCROLL_Y,COLS-SCROLL_L,SCROLL_T,SCROLL_L);
      stat_w=newwin(STAT_Y,STAT_X,STAT_T,STAT_L);
      turn_w=newwin(TURN_Y,TURN_X,TURN_T,TURN_L);
      done_curses++;
      view_w.leave=slot_w.leave=stat_w.leave=turn_w.leave=true;
      phys=[];for(var y=0;y<LINES;y++)phys.push(new Array(COLS).fill(' '));
    }
    function cleanupscreen(){
      if(done_curses){
        wmove(scroll_w,SCROLL_Y-1,0);
        wclrtoeol(scroll_w);
        draw_screen();
      }
    }
    function newturn(){
      repaired=loaded=fired=changed=0;
      movebuf='';
      alarm(0);
      if(mf.readyL&R_LOADING){
        if(mf.readyL&R_DOUBLE)mf.readyL=R_LOADING;
        else mf.readyL=R_LOADED;
      }
      if(mf.readyR&R_LOADING){
        if(mf.readyR&R_DOUBLE)mf.readyR=R_LOADING;
        else mf.readyR=R_LOADED;
      }
      if(!hasdriver)Write(W_DDEAD,SHIP(0),0,0,0,0,0);
      if(sc_hasprompt){
        wmove(scroll_w,sc_line,0);
        wclrtoeol(scroll_w);
      }
      Sync();
      if(!hasdriver)leave(LEAVE_DRIVER);
      if(sc_hasprompt)wprintw(scroll_w,'%s%s',[sc_prompt,sc_buf]);
      if(turn%50===0)Write(W_ALIVE,SHIP(0),0,0,0,0,0);
      if(mf.FS&&(!mc.rig1||windspeed===6))Write(W_FS,ms,0,0,0,0,0);
      if(mf.FS===1)Write(W_FS,ms,0,2,0,0,0);
      if(mf.struck)leave(LEAVE_QUIT);
      if(mf.captured!==0)leave(LEAVE_CAPTURED);
      if(windspeed===7)leave(LEAVE_HURRICAN);
      adjustview();
      draw_screen();
      alarm(7);
    }
    function alarm(n){
      if(atimer!==null){clearTimeout(atimer);atimer=null}
      if(n)atimer=setTimeout(function plalarm(){
        atimer=null;
        try{newturn()}catch(e){if(e!==EXIT)throw e;finish();return}
        paint();
      },n*1000);
    }
    function Signal(fmt,ship,a,b,c,d){
      if(!done_curses)return;
      if(ship===0)wprintw(scroll_w,fmt,[a,b,c,d]);
      else wprintw(scroll_w,fmt,[ship.shipname,colours(ship),sterncolour(ship),a,b,c,d]);
      Scroll();
    }
    function Scroll(){
      if(++sc_line>=SCROLL_Y)sc_line=0;
      wmove(scroll_w,sc_line,0);
      wclrtoeol(scroll_w);
    }
    function prompt(p,ship){
      if(ship!==0)p=sprintf(p,[ship.shipname,colours(ship),sterncolour(ship)]);
      sc_prompt=p;
      sc_buf='';
      sc_hasprompt=1;
      waddstr(scroll_w,p);
    }
    function endprompt(flag){
      sc_hasprompt=0;
      if(flag)Scroll();
    }
    function* wgetch(){
      if(ibuf!==''){var c=ibuf.charAt(0);ibuf=ibuf.slice(1);return c}
      return yield KEY;
    }
    function* sgetch(p,ship,flag){
      var c;
      prompt(p,ship);
      wrefresh(scroll_w);
      c=yield* wgetch();
      if(flag&&c>=' '&&c<'\x7f')waddch(scroll_w,c);
      endprompt(flag);
      return c;
    }
    function* sgetstr(pr_,n){
      var c,buf='';
      prompt(pr_,0);
      sc_buf='';
      for(;;){
        sc_buf=buf;
        wrefresh(scroll_w);
        c=yield* wgetch();
        switch(c){
        case '\n':case '\r':
          endprompt(1);
          return buf;
        case '\b':
          if(buf.length>0){
            waddstr(scroll_w,'\b \b');
            buf=buf.slice(0,-1);
          }
          break;
        default:
          if(c>=' '&&c<'\x7f'&&buf.length<n-1){
            buf+=c;
            waddch(scroll_w,c);
          }
        }
      }
    }
    function draw_screen(){
      draw_view();
      draw_turn();
      draw_stat();
      draw_slot();
      wrefresh(scroll_w);
    }
    function draw_view(){
      werase(view_w);
      ships.forEach(function(sp){
        if(sp.file.dir&&sp.file.row>viewrow&&sp.file.row<viewrow+VIEW_Y&&sp.file.col>viewcol&&sp.file.col<viewcol+VIEW_X){
          wmove(view_w,sp.file.row-viewrow,sp.file.col-viewcol);
          waddch(view_w,colours(sp));
          wmove(view_w,sternrow(sp)-viewrow,sterncol(sp)-viewcol);
          waddch(view_w,sterncolour(sp));
        }
      });
      wrefresh(view_w);
    }
    function draw_turn(){
      wmove(turn_w,0,0);
      wprintw(turn_w,'%cTurn %d',[dont_adjust?'*':'-',turn]);
      wrefresh(turn_w);
    }
    function ch0(n){return String.fromCharCode(n+48)}
    function draw_stat(){
      wmove(stat_w,STAT_1,0);
      wprintw(stat_w,'Points  %3d\n',[mf.points]);
      wprintw(stat_w,'Fouls    %2d\n',[fouled(ms)]);
      wprintw(stat_w,'Grapples %2d\n',[grappled(ms)]);
      wmove(stat_w,STAT_2,0);
      wprintw(stat_w,'    0 %c(%c)\n',[ch0(maxmove(ms,winddir+3,-1)),ch0(maxmove(ms,winddir+3,1))]);
      waddstr(stat_w,'   \\|/\n');
      wprintw(stat_w,'   -^-%c(%c)\n',[ch0(maxmove(ms,winddir+2,-1)),ch0(maxmove(ms,winddir+2,1))]);
      waddstr(stat_w,'   /|\\\n');
      wprintw(stat_w,'    | %c(%c)\n',[ch0(maxmove(ms,winddir+1,-1)),ch0(maxmove(ms,winddir+1,1))]);
      wprintw(stat_w,'   %c(%c)\n',[ch0(maxmove(ms,winddir,-1)),ch0(maxmove(ms,winddir,1))]);
      wmove(stat_w,STAT_3,0);
      wprintw(stat_w,'Load  %c%c %c%c\n',[LOADNAME.charAt(mf.loadL),readyname(mf.readyL),LOADNAME.charAt(mf.loadR),readyname(mf.readyR)]);
      wprintw(stat_w,'Hull %2d\n',[mc.hull]);
      wprintw(stat_w,'Crew %2d %2d %2d\n',[mc.crew1,mc.crew2,mc.crew3]);
      wprintw(stat_w,'Guns %2d %2d\n',[mc.gunL,mc.gunR]);
      wprintw(stat_w,'Carr %2d %2d\n',[mc.carL,mc.carR]);
      wprintw(stat_w,'Rigg %d %d %d ',[mc.rig1,mc.rig2,mc.rig3]);
      if(mc.rig4<0)waddch(stat_w,'-');
      else wprintw(stat_w,'%d',[mc.rig4]);
      wrefresh(stat_w);
    }
    function draw_slot(){
      var Y=idiv(SLOT_Y,2);
      if(!boarding(ms,0)){
        mvwaddstr(slot_w,0,0,'   ');
        mvwaddstr(slot_w,1,0,'   ');
      }
      else mvwaddstr(slot_w,1,0,'OBP');
      if(!boarding(ms,1)){
        mvwaddstr(slot_w,2,0,'   ');
        mvwaddstr(slot_w,3,0,'   ');
      }
      else mvwaddstr(slot_w,3,0,'DBP');
      wmove(slot_w,SLOT_Y-4,0);
      if(mf.RH)wprintw(slot_w,'%dRH',[mf.RH]);
      else waddstr(slot_w,'   ');
      wmove(slot_w,SLOT_Y-3,0);
      if(mf.RG)wprintw(slot_w,'%dRG',[mf.RG]);
      else waddstr(slot_w,'   ');
      wmove(slot_w,SLOT_Y-2,0);
      if(mf.RR)wprintw(slot_w,'%dRR',[mf.RR]);
      else waddstr(slot_w,'   ');
      wmove(slot_w,7,1);
      wprintw(slot_w,'%d',[windspeed]);
      mvwaddch(slot_w,Y,0,' ');
      mvwaddch(slot_w,Y,2,' ');
      mvwaddch(slot_w,Y-1,0,' ');
      mvwaddch(slot_w,Y-1,1,' ');
      mvwaddch(slot_w,Y-1,2,' ');
      mvwaddch(slot_w,Y+1,0,' ');
      mvwaddch(slot_w,Y+1,1,' ');
      mvwaddch(slot_w,Y+1,2,' ');
      wmove(slot_w,Y-DR[winddir],1-DC[winddir]);
      switch(winddir){
      case 1:case 5:waddch(slot_w,'|');break;
      case 2:case 6:waddch(slot_w,'/');break;
      case 3:case 7:waddch(slot_w,'-');break;
      case 4:case 8:waddch(slot_w,'\\');break;
      }
      mvwaddch(slot_w,Y+DR[winddir],1+DC[winddir],'+');
      wrefresh(slot_w);
    }
    function draw_board(){
      var n;
      wclear(stdscr);
      werase(view_w);
      werase(slot_w);
      werase(scroll_w);
      werase(stat_w);
      werase(turn_w);
      sc_line=0;
      wmove(stdscr,BOX_T,BOX_L);
      for(n=0;n<BOX_X;n++)waddch(stdscr,'-');
      wmove(stdscr,BOX_B,BOX_L);
      for(n=0;n<BOX_X;n++)waddch(stdscr,'-');
      for(n=BOX_T+1;n<BOX_B;n++){
        mvwaddch(stdscr,n,BOX_L,'|');
        mvwaddch(stdscr,n,BOX_R,'|');
      }
      mvwaddch(stdscr,BOX_T,BOX_L,'+');
      mvwaddch(stdscr,BOX_T,BOX_R,'+');
      mvwaddch(stdscr,BOX_B,BOX_L,'+');
      mvwaddch(stdscr,BOX_B,BOX_R,'+');
      wrefresh(stdscr);
      wmove(view_w,2,idiv(VIEW_X-(WSaIM.length+1)-1,2));
      waddstr(view_w,WSaIM);
      wmove(view_w,4,idiv(VIEW_X-cc.name.length,2));
      waddstr(view_w,cc.name);
      wrefresh(view_w);
      wmove(stdscr,0,0);
      wprintw(stdscr,"Class %d %s (%d guns) '%s' (%c%c)",[mc.class_,CLASSNAME[mc.class_],mc.guns,ms.shipname,colours(ms),sterncolour(ms)]);
      wrefresh(stdscr);
    }
    function centerview(){
      viewrow=mf.row-idiv(VIEW_Y,2);
      viewcol=mf.col-idiv(VIEW_X,2);
    }
    function upview(){viewrow-=idiv(VIEW_Y,3)}
    function downview(){viewrow+=idiv(VIEW_Y,3)}
    function leftview(){viewcol-=idiv(VIEW_X,5)}
    function rightview(){viewcol+=idiv(VIEW_X,5)}
    function adjustview(){
      if(dont_adjust)return;
      if(mf.row<viewrow+idiv(VIEW_Y,4))viewrow=mf.row-(VIEW_Y-idiv(VIEW_Y,4));
      else if(mf.row>viewrow+(VIEW_Y-idiv(VIEW_Y,4)))viewrow=mf.row-idiv(VIEW_Y,4);
      if(mf.col<viewcol+idiv(VIEW_X,8))viewcol=mf.col-(VIEW_X-idiv(VIEW_X,8));
      else if(mf.col>viewcol+(VIEW_X-idiv(VIEW_X,8)))viewcol=mf.col-idiv(VIEW_X,8);
    }
    /* ---------- pl_1.c ---------- */
    function leave(conditions){
      alarm(0);
      if(done_curses){
        Signal("It looks like you've had it!",0);
        switch(conditions){
        case LEAVE_QUIT:break;
        case LEAVE_CAPTURED:Signal('Your ship was captured.',0);break;
        case LEAVE_HURRICAN:Signal('Hurricane!  All ships destroyed.',0);break;
        case LEAVE_DRIVER:Signal('The driver died.',0);break;
        case LEAVE_SYNC:Signal('Synchronization error.',0);break;
        default:Signal('A funny thing happened (%d).',0,conditions);
        }
      }
      else{
        switch(conditions){
        case LEAVE_QUIT:break;
        case LEAVE_DRIVER:pr('The driver died.\n');break;
        case LEAVE_SYNC:pr('Synchronization error\n.');break;
        default:pr('A funny thing happened ('+conditions+').\n');
        }
      }
      if(ms!==0){
        log(ms);
        if(conditions!==LEAVE_SYNC){
          makesignal(ms,'Captain %s relinquishing.',0,mf.captain);
          Write(W_END,ms,0,0,0,0,0);
          Sync();
        }
      }
      cleanupscreen();
      /* the driver sees the player go at its next pass, and that is its last */
      driver_last();
      throw EXIT;
    }
    function choke(){leave(LEAVE_QUIT)}
    /* ---------- pl_2.c ---------- */
    function* play(){
      var sp,c;
      for(;;){
        c=yield* sgetch('~\b',0,0);
        switch(c){
        case 'm':yield* acceptmove();break;
        case 's':yield* acceptsignal();break;
        case 'g':yield* grapungrap();break;
        case 'u':yield* unfoulplayer();break;
        case 'v':Signal('%s',0,VERSION);break;
        case 'b':yield* acceptboard();break;
        case 'f':yield* acceptcombat();break;
        case 'l':yield* loadplayer();break;
        case 'c':yield* changesail();break;
        case 'r':yield* repair();break;
        case 'B':
          Signal("'Hands to stations!'",0);
          unboard(ms,ms,1);
          unboard(ms,ms,0);
          break;
        case '\f':
          centerview();
          draw_board();
          draw_screen();
          break;
        case 'L':
          mf.loadL=L_EMPTY;
          mf.loadR=L_EMPTY;
          mf.readyL=R_EMPTY;
          mf.readyR=R_EMPTY;
          Signal('Broadsides unloaded',0);
          break;
        case 'q':Signal("Type 'Q' to quit",0);break;
        case 'Q':leave(LEAVE_QUIT);break;
        case 'I':
          ships.forEach(function(s){if(s!==ms)eyeball(s)});
          break;
        case 'i':
          if((sp=closestenemy(ms,0,1))===0)Signal('No more ships left.',0);
          else eyeball(sp);
          break;
        case 'C':centerview();draw_view();break;
        case 'U':upview();draw_view();break;
        case 'D':case 'N':downview();draw_view();break;
        case 'H':leftview();draw_view();break;
        case 'J':rightview();draw_view();break;
        case 'F':yield* lookout();break;
        case 'S':
          dont_adjust=dont_adjust?0:1;
          draw_turn();
          break;
        }
      }
    }
    /* ---------- pl_3.c ---------- */
    function* acceptcombat(){
      var men=0,target,temp,n,r,index,rakehim,sternrake,hhits=0,ghits=0,rhits=0,chits=0,crew,load,guns,car,ready,shootat,hit,roll,closest,t;
      crew=[mc.crew1,mc.crew2,mc.crew3];
      for(n=0;n<3;n++)if(mf.OBP[n].turnsent)men+=mf.OBP[n].mensent;
      for(n=0;n<3;n++)if(mf.DBP[n].turnsent)men+=mf.DBP[n].mensent;
      if(men){
        crew[0]=idiv(men,100)?0:(crew[0]!==0?1:0);
        crew[1]=idiv(men%100,10)?0:(crew[1]!==0?1:0);
        crew[2]=men%10?0:(crew[2]!==0?1:0);
      }
      for(r=0;r<2;r++){
        if(r){
          ready=mf.readyR;
          load=mf.loadR;
          guns=mc.gunR;
          car=mc.carR;
        }
        else{
          ready=mf.readyL;
          load=mf.loadL;
          guns=mc.gunL;
          car=mc.carL;
        }
        cant:{
          if((!guns&&!car)||load===L_EMPTY||(ready&R_LOADED)===0)break cant;
          if(mf.struck||!crew[2])break cant;
          closest=closestenemy(ms,r?'r':'l',1);
          if(closest===0)break cant;
          if(closest.file.struck)break cant;
          target=range(ms,closest);
          if(target>RANGEOFSHOT[load]||(!guns&&target>=3))break cant;
          Signal('%s (%c%c) within range of %s broadside.',closest,r?'right':'left');
          if(load>L_CHAIN&&target<6){
            switch(yield* sgetch('Aim for hull or rigging? ',0,1)){
            case 'r':shootat=RIGGING;break;
            case 'h':shootat=HULL;break;
            default:
              shootat=-1;
              Signal("'Avast there! Hold your fire.'",0);
            }
          }
          else{
            if((yield* sgetch('Fire? ',0,1))==='n'){
              shootat=-1;
              Signal('Belay that! Hold your fire.',0);
            }
            else shootat=RIGGING;
          }
          if(shootat===-1)continue;
          fired=1;
          rakehim=gunsbear(ms,closest)&&!gunsbear(closest,ms);
          temp=portside(closest,ms,1)-closest.file.dir+1;
          if(temp<1)temp+=8;
          else if(temp>8)temp-=8;
          sternrake=temp>4&&temp<6;
          if(rakehim){
            if(!sternrake)Signal('Raking the %s!',closest);
            else Signal('Stern Rake! %s splintering!',closest);
          }
          index=guns;
          if(target<3)index+=car;
          index=idiv(index-1,3);
          index=index>8?8:index;
          hit=hdt(rakehim?HDTRAKE:HDT,index,target);
          if(rakehim&&sternrake)hit++;
          hit+=QUAL[index][mc.qual-1];
          for(n=0;n<3&&mf.captured===0;n++)
            if(!crew[n]){
              if(index<=5)hit--;
              else hit-=2;
            }
          if(ready&R_INITIAL){
            if(index<=3)hit++;
            else hit+=2;
          }
          if(mf.captured!==0){
            if(index<=1)hit--;
            else hit-=2;
          }
          hit+=AMMO[index][load-1];
          if(((temp=mc.class_)>=5||temp===1)&&windspeed===5)hit--;
          if(windspeed===6&&temp===4)hit-=2;
          if(windspeed===6&&temp<=3)hit--;
          if(hit>=0){
            roll=die();
            if(load===L_GRAPE)chits=hit;
            else{
              if(hit>10)hit=10;
              t=(shootat===RIGGING?RIGT:HULLT)[hit][roll-1];
              chits=t[2];
              rhits=t[3];
              hhits=t[0];
              ghits=t[1];
              if(closest.file.FS)rhits*=2;
              if(load===L_CHAIN){
                ghits=0;
                hhits=0;
              }
            }
            table(shootat,load,hit,closest,ms,roll);
          }
          Signal('Damage inflicted on the %s:',0,closest.shipname);
          Signal('\t%d HULL, %d GUNS, %d CREW, %d RIGGING',0,hhits,ghits,chits,rhits);
          if(!r){
            mf.loadL=L_EMPTY;
            mf.readyL=R_EMPTY;
          }
          else{
            mf.loadR=L_EMPTY;
            mf.readyR=R_EMPTY;
          }
          continue;
        }
        Signal('Unable to fire %s broadside',0,r?'right':'left');
      }
      draw_stat();
    }
    function* grapungrap(){
      var i,k,sp;
      for(k=0;k<ships.length;k++){
        sp=ships[k];
        if(sp===ms||sp.file.dir===0)continue;
        if(range(ms,sp)>1&&!grappled2(ms,sp))continue;
        switch(yield* sgetch('Attempt to grapple or ungrapple %s (%c%c): ',sp,1)){
        case 'g':
          if(die()<3||ms.nationality===capship(sp).nationality){
            Write(W_GRAP,ms,0,sp.file.index,0,0,0);
            Write(W_GRAP,sp,0,player,0,0,0);
            Signal('Attempt succeeds!',0);
            makesignal(ms,'grappled with %s (%c%c)',sp);
          }
          else Signal('Attempt fails.',0);
          break;
        case 'u':
          for(i=grappled2(ms,sp);--i>=0;){
            if(ms.nationality===capship(sp).nationality||die()<3){
              cleangrapple(ms,sp,0);
              Signal('Attempt succeeds!',0);
              makesignal(ms,'ungrappling with %s (%c%c)',sp);
            }
            else Signal('Attempt fails.',0);
          }
          break;
        }
      }
    }
    function* unfoulplayer(){
      var to,i,k;
      for(k=0;k<ships.length;k++){
        to=ships[k];
        if(fouled2(ms,to)===0)continue;
        if((yield* sgetch('Attempt to unfoul with the %s (%c%c)? ',to,1))!=='y')continue;
        for(i=fouled2(ms,to);--i>=0;){
          if(die()<=2){
            cleanfoul(ms,to,0);
            Signal('Attempt succeeds!',0);
            makesignal(ms,'Unfouling %s (%c%c)',to);
          }
          else Signal('Attempt fails.',0);
        }
      }
    }
    /* ---------- pl_4.c ---------- */
    function* changesail(){
      var rig=mc.rig1,full=mf.FS;
      if(windspeed===6||(windspeed===5&&mc.class_>4))rig=0;
      if(mc.crew3&&rig){
        if(!full){
          if((yield* sgetch('Increase to Full sails? ',0,1))==='y'){
            changed=1;
            Write(W_FS,ms,0,1,0,0,0);
          }
        }
        else{
          if((yield* sgetch('Reduce to Battle sails? ',0,1))==='y'){
            Write(W_FS,ms,0,0,0,0,0);
            changed=1;
          }
        }
      }
      else if(!rig)Signal('Sails rent to pieces',0);
    }
    function* acceptsignal(){
      var s=yield* sgetstr('Message? ',58);
      Write(W_SIGNAL,ms,1,'"'+s+'"',0,0,0);
    }
    function* lookout(){
      var buf=yield* sgetstr('What ship? ',3);
      ships.forEach(function(sp){
        var c=COUNTRY[sp.nationality].charAt(0),b0=buf.charAt(0),b1=buf.charAt(1);
        if((c===b0||c.toLowerCase()===b0||colours(sp)===b0)&&(String.fromCharCode(sp.file.stern)===b1||sterncolour(sp)===b1||b1==='?'))eyeball(sp);
      });
    }
    function saywhat(sp,flag){
      if(sp.file.captain)return sp.file.captain;
      else if(sp.file.struck)return '(struck)';
      else if(sp.file.captured!==0)return '(captured)';
      else if(flag)return '(available)';
      else return '(computer)';
    }
    function eyeball(ship){
      var i;
      if(ship.file.dir!==0){
        Signal('Sail ho! (range %d, %s)',0,range(ms,ship),saywhat(ship,0));
        i=portside(ms,ship,1)-mf.dir;
        if(i<=0)i+=8;
        Signal('%s (%c%c) %s %s %s.',ship,COUNTRY[ship.nationality],CLASSNAME[ship.specs.class_],DIRECTIONNAME[i]);
      }
    }
    /* ---------- pl_5.c ---------- */
    function cstr(b){var s='';for(var i=0;i<b.length&&b[i];i++)s+=b[i];return s}
    function* acceptmove(){
      var ta,ma,af={v:0},moved=0,vma,dir,promptp,buf,last='',p,ch;
      if(!mc.crew3||snagged(ms)||!windspeed){
        Signal('Unable to move',0);
        return;
      }
      ta=maxturns(ms,af);
      ma=maxmove(ms,mf.dir,0);
      promptp=sprintf('move (%d,%c%d): ',[ma,af.v?"'":' ',ta]);
      buf=(yield* sgetstr(promptp,60)).split('');
      dir=mf.dir;
      vma=ma;
      for(p=0;buf[p];p++){
        ch=buf[p];
        switch(ch){
        case 'l':
        case 'r':
          if(ch==='l')dir-=2;
          if(++dir===0)dir=8;
          else if(dir===9)dir=1;
          if(last==='t'){
            Signal("Ship can't turn that fast.",0);
            buf[p--]='';
          }
          last='t';
          ma--;
          ta--;
          vma=min(ma,maxmove(ms,dir,0));
          if((ta<0&&moved)||(vma<0&&moved))buf[p--]='';
          break;
        case 'b':
          ma--;
          vma--;
          last='b';
          if((ta<0&&moved)||(vma<0&&moved))buf[p--]='';
          break;
        case '0':case 'd':
          buf[p--]='';
          break;
        case '\n':
          buf[p--]='';
          break;
        case '1':case '2':case '3':case '4':case '5':case '6':case '7':
          if(last==='0'){
            Signal("Can't move that fast.",0);
            buf[p--]='';
          }
          last='0';
          moved=1;
          ma-=buf[p].charCodeAt(0)-48; /* after "Can't move that fast." this is the character before, as in the C */
          vma-=buf[p].charCodeAt(0)-48;
          if((ta<0&&moved)||(vma<0&&moved))buf[p--]='';
          break;
        default:
          if(!isspace(ch)){
            Signal('Input error.',0);
            buf[p--]='';
          }
        }
      }
      var b0=buf.length?buf[0]:'';
      if((ta<0&&moved)||(vma<0&&moved)||(af.v&&(b0==='r'||b0==='l')&&moved)){
        Signal('Movement error.',0);
        if(ta<0&&moved){
          if(mf.FS===1){
            Write(W_FS,ms,0,0,0,0,0);
            Signal('No hands to set full sails.',0);
          }
        }
        else if(ma>=0)buf[1]='';
      }
      if(af.v&&!moved){
        if(mf.FS===1){
          Write(W_FS,ms,0,0,0,0,0);
          Signal('No hands to set full sails.',0);
        }
      }
      if(buf.length&&buf[0])movebuf=cstr(buf);
      else movebuf='d';
      Write(W_MOVE,ms,1,movebuf,0,0,0);
      Signal('Helm: %s.',0,movebuf);
    }
    function* acceptboard(){
      var sp,n,crew,men=0,c,k;
      crew=[mc.crew1,mc.crew2,mc.crew3];
      for(n=0;n<NBP;n++)if(mf.OBP[n].turnsent)men+=mf.OBP[n].mensent;
      for(n=0;n<NBP;n++)if(mf.DBP[n].turnsent)men+=mf.DBP[n].mensent;
      if(men){
        crew[0]=idiv(men,100)?0:(crew[0]!==0?1:0);
        crew[1]=idiv(men%100,10)?0:(crew[1]!==0?1:0);
        crew[2]=men%10?0:(crew[2]!==0?1:0);
      }
      else{
        crew[0]=crew[0]!==0?1:0;
        crew[1]=crew[1]!==0?1:0;
        crew[2]=crew[2]!==0?1:0;
      }
      for(k=0;k<ships.length;k++){
        sp=ships[k];
        if(sp===ms||sp.file.dir===0||range(ms,sp)>1)continue;
        if(ms.nationality===capship(sp).nationality)continue;
        if(meleeing(ms,sp)&&crew[2]){
          c=yield* sgetch('How many more to board the %s (%c%c)? ',sp,1);
          parties(crew,sp,0,c);
        }
        else if((fouled2(ms,sp)||grappled2(ms,sp))&&crew[2]){
          c=yield* sgetch('Crew sections to board the %s (%c%c) (3 max) ?',sp,1);
          parties(crew,sp,0,c);
        }
      }
      if(crew[2]){
        c=yield* sgetch('How many sections to repel boarders? ',0,1);
        parties(crew,ms,1,c);
      }
      draw_slot();
    }
    function parties(crew,to,isdefense,c){
      var k,j,men,ptr,temp=crew.slice(),buf=c.charCodeAt(0);
      if(isdigit(c)){
        ptr=isdefense?to.file.DBP:to.file.OBP;
        for(j=0;j<NBP&&ptr[j].turnsent;j++);
        if(j<NBP&&!ptr[j].turnsent&&buf>48){
          men=0;
          for(k=0;k<3&&buf>48;k++){
            men+=crew[k]*(k===0?100:(k===1?10:1));
            crew[k]=0;
            if(men)buf--;
          }
          if(buf>48)Signal('Sending all crew sections.',0);
          Write(isdefense?W_DBP:W_OBP,ms,0,j,turn,to.file.index,men);
          if(isdefense){
            wmove(slot_w,2,0);
            for(k=0;k<NBP;k++){
              if(temp[k]&&!crew[k])waddch(slot_w,String(k+1));
              else wmove(slot_w,2,1+k);
            }
            mvwaddstr(slot_w,3,0,'DBP');
            makesignal(ms,'repelling boarders',0);
          }
          else{
            wmove(slot_w,0,0);
            for(k=0;k<NBP;k++){
              if(temp[k]&&!crew[k])waddch(slot_w,String(k+1));
              else wmove(slot_w,0,1+k);
            }
            mvwaddstr(slot_w,1,0,'OBP');
            makesignal(ms,'boarding the %s (%c%c)',to);
          }
          wrefresh(slot_w);
        }
        else Signal('Sending no crew sections.',0);
      }
    }
    /* ---------- pl_6.c ---------- */
    function* repair(){
      var c,which,ptr=mc,count;
      function FIX(x,m){
        if(m-ptr[x]>count){ptr[x]+=count;count=0}
        else{count-=m-ptr[x];ptr[x]=m}
      }
      if(repaired||loaded||fired||changed||turned()){
        Signal('No hands free to repair',0);
        return;
      }
      c=yield* sgetch('Repair (hull, guns, rigging)? ',0,1);
      switch(c){
      case 'h':which='RH';break;
      case 'g':which='RG';break;
      case 'r':which='RR';break;
      default:
        Signal('Avast heaving!',0);
        return;
      }
      if(++mf[which]>=3){
        count=2;
        switch(c){
        case 'h':{
          var max=idiv(ptr.guns,4);
          if(ptr.hull<max){
            FIX('hull',max);
            Write(W_HULL,ms,0,ptr.hull,0,0,0);
          }
          break;
        }
        case 'g':
          if(ptr.gunL<ptr.gunR){
            var m2=idiv(ptr.guns,5)-ptr.carL;
            if(ptr.gunL<m2){
              FIX('gunL',m2);
              Write(W_GUNL,ms,0,ptr.gunL,ptr.carL,0,0);
            }
          }
          else{
            var m3=idiv(ptr.guns,5)-ptr.carR;
            if(ptr.gunR<m3){
              FIX('gunR',m3);
              Write(W_GUNR,ms,0,ptr.gunR,ptr.carR,0,0);
            }
          }
          break;
        case 'r':
          if(ptr.rig4>=0&&ptr.rig4<2){
            FIX('rig4',2);
            Write(W_RIG4,ms,0,ptr.rig4,0,0,0);
          }
          if(count&&ptr.rig3<2){
            FIX('rig3',2);
            Write(W_RIG3,ms,0,ptr.rig3,0,0,0);
          }
          if(count&&ptr.rig2<2){
            FIX('rig2',2);
            Write(W_RIG2,ms,0,ptr.rig2,0,0,0);
          }
          if(count&&ptr.rig1<2){
            FIX('rig1',2);
            Write(W_RIG1,ms,0,ptr.rig1,0,0,0);
          }
          break;
        }
        if(count===2){
          Signal('Repairs completed.',0);
          mf[which]=2;
        }
        else{
          mf[which]=0;
          draw_stat();
        }
      }
      draw_slot();
      repaired=1;
    }
    function turned(){return /[rl]/.test(movebuf)}
    function* loadplayer(){
      var c,loadL,loadR,ready,load;
      if(!mc.crew3){
        Signal('Out of crew',0);
        return;
      }
      loadL=mf.loadL;
      loadR=mf.loadR;
      if(!loadL&&!loadR){
        c=yield* sgetch('Load which broadside (left or right)? ',0,1);
        if(c==='r')loadL=1;
        else loadR=1;
      }
      if((!loadL&&loadR)||(loadL&&!loadR)){
        c=yield* sgetch('Reload with (round, double, chain, grape)? ',0,1);
        switch(c){
        case 'r':load=L_ROUND;ready=0;break;
        case 'd':load=L_DOUBLE;ready=R_DOUBLE;break;
        case 'c':load=L_CHAIN;ready=0;break;
        case 'g':load=L_GRAPE;ready=0;break;
        default:
          Signal('Broadside not loaded.',0);
          return;
        }
        if(!loadR){
          mf.loadR=load;
          mf.readyR=ready|R_LOADING;
        }
        else{
          mf.loadL=load;
          mf.readyL=ready|R_LOADING;
        }
        loaded=1;
      }
    }
    /* ---------- pl_main.c ---------- */
    function* pl_main(){
      yield MEASURE;
      if(!(STAT_R<COLS&&LINES-1-SCROLL_T+1>0)){
        pr("Can't sail on this terminal.\n");
        return;
      }
      yield* initialize();
      Signal('Aye aye, Sir',0);
      yield* play();
    }
    function* initialize(){
      var captain,message,load,n,nat=[0,0,0,0,0,0,0,0],r;
      if(game<0){
        puts('Choose a scenario:\n');
        puts('\n\tNUMBER\tSHIPS\tIN PLAY\tTITLE');
        for(n=0;n<SCENE.length;n++)pr('\t'+n+'):\t'+SCENE[n].vessels+'\tno\t'+SCENE[n].name+'\n');
        pr('\nScenario number? ');
        r=yield* scand();
        if(r!==null)game=r;
        yield* tonl();
      }
      if(game<0||game>=SCENE.length){
        puts('Very funny.');
        throw EXIT;
      }
      setscene();
      ships.forEach(function(sp){
        sp.file.stern=nat[sp.nationality]++;
        sp.file.dir=sp.shipdir;
        sp.file.row=sp.shiprow;
        sp.file.col=sp.shipcol;
      });
      windspeed=cc.windspeed;
      winddir=cc.winddir;
      intr=choke;
      hasdriver=0;
      sync_seek=0;
      for(;;){
        pr(cc.name+'\n\n');
        ships.forEach(function(sp){
          pr(sprintf('  %2d:  %-10s %-15s  (%-2d pts)   %s\n',[sp.file.index,COUNTRY[sp.nationality],sp.shipname,sp.specs.pts,saywhat(sp,1)]));
        });
        pr('\nWhich ship (0-'+(cc.vessels-1)+')? ');
        r=yield* scand();
        if(r===null||r<0||r>=cc.vessels){
          yield* tonl();
          puts('Say what?');
          player=-1;
        }
        else{
          player=r;
          yield* tonl();
        }
        if(player<0)continue;
        Sync();
        break;
      }
      ms=SHIP(player);
      mf=ms.file;
      mc=ms.specs;
      Write(W_BEGIN,ms,0,0,0,0,0);
      Sync();
      /* the fork: the driver goes on from the same place in the dice */
      driver=proc(MODE_DRIVER,randx);
      driver.dr_main();
      hasdriver=1;
      dtimer=setTimeout(dstep,7000);
      pr('Your ship is the '+ms.shipname+', a '+mc.guns+' gun '+CLASSNAME[mc.class_]+' ('+QUALNAME[mc.qual]+' crew).\n');
      pr('Your name, Captain? ');
      captain=yield* gets();
      if(!captain)captain='no name';
      captain=captain.slice(0,79);
      Write(W_CAPTAIN,ms,1,captain,0,0,0);
      for(n=0;n<2;n++){
        pr('\nInitial broadside '+(n?'right':'left')+' (grape, chain, round, double): ');
        var buf=yield* scans();
        switch(buf.charAt(0)){
        case 'g':load=L_GRAPE;break;
        case 'c':load=L_CHAIN;break;
        case 'r':load=L_ROUND;break;
        case 'd':load=L_DOUBLE;break;
        default:load=L_ROUND;
        }
        if(n){
          mf.loadR=load;
          mf.readyR=R_LOADED|R_INITIAL;
        }
        else{
          mf.loadL=load;
          mf.readyL=R_LOADED|R_INITIAL;
        }
      }
      yield SCREEN;
      initscreen();
      draw_board();
      message='Captain '+captain+' assuming command';
      Write(W_SIGNAL,ms,1,message,0,0,0);
      newturn();
    }
    return {pl_main:pl_main,newturn:newturn,driver_gone:function(){hasdriver=0}};
  }
  /* ---------- the clocks ---------- */
  function dstep(){
    dtimer=null;
    if(!driver)return;
    if(driver.dr_pass())dtimer=setTimeout(dstep,7000);
    else{driver=null;pl.driver_gone()}
  }
  function driver_last(){
    if(dtimer!==null){clearTimeout(dtimer);dtimer=null}
    if(driver){driver.dr_pass();driver=null}
  }
  function finish(){
    if(over)return;
    if(dtimer!==null){clearTimeout(dtimer);dtimer=null}
    if(atimer!==null){clearTimeout(atimer);atimer=null}
    flushout();
    if(S){
      var L=phys.map(function(r){return r.join('').replace(/ +$/,'')});
      while(L.length&&L[L.length-1]==='')L.pop();
      over=true;
      S.close();
      screen_done(L);
      S=null;
    }
    else over=true;
  }
  function step(v){
    for(;;){
      var r;
      try{r=G.next(v)}
      catch(e){
        if(e===EXIT){finish();return}
        throw e;
      }
      if(r.done){finish();return}
      var w=r.value;
      v=undefined;
      if(w===READ){
        var p=o;o='';
        P.ask(p,function(l){
          if(over)return;
          if(l===P.INT&&intr){
            try{intr()}catch(e){if(e!==EXIT)throw e;finish();return}
          }
          step(l);
        },true);
        return;
      }
      if(w===KEY){paint();return}
      if(w===MEASURE){
        flushout();
        P.program(function(T,done){
          function got(){
            COLS=Math.min(T.cols,80);LINES=Math.min(T.rows,24);
            T.close();done();
          }
          if(typeof document==='undefined')got();
          else setTimeout(got,0);
          return {feed:function(){},draw:function(){},resize:function(){}};
        },FIT);
        P.queue(function(){step()});
        return;
      }
      if(w===SCREEN){
        flushout();
        var left=null;
        P.program(function(T,done){
          S=T;
          screen_done=function(L){left=L;done()};
          step();
          if(typeof document!=='undefined')setTimeout(paint,0);
          return {
            feed:function(k){
              if(over||!S)return;
              if(k==='C-c'){
                try{intr()}catch(e){if(e!==EXIT)throw e;finish()}
                return;
              }
              var c=k==='Enter'?'\n':k==='Backspace'?'\b':k==='Tab'?'\t':k==='Escape'?'\x1b':k.length===1?k:/^C-[a-z]$/.test(k)?String.fromCharCode(k.charCodeAt(2)-96):null;
              if(c!==null)step(c);
            },
            draw:paint
          };
        },FIT);
        P.queue(function(){if(left)P.say(left)}); /* the last screen stays on the glass */
        return;
      }
    }
  }
  pl=proc(MODE_PLAYER,seed);
  G=pl.pl_main();
  P.queue(function(){step()});
}});
})(window.Phosphor);
