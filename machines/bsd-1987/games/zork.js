/* PHOSPHOR-9 terminal: machine "bsd-1987", zork, which on the 4.3BSD tape was Dungeon. Translated to JavaScript for this terminal,
   statement by statement and by a script, from the FORTRAN of Dungeon 2.5.6 (actors.f, ballop.f, clockr.f, demons.f, dgame.f, dmain.f,
   dso.f, dsub.f, dverb1.f, dverb2.f, gdt.f, machdep.f, nobjs.f, np.f, np2.f, objcts.f, rooms.f, sverbs.f, verbs.f, villns.f), with its text
   from TEXTDATA.DAT and its index from DINDX.DAT. Every one of those source files keeps this notice:

C COPYRIGHT 1980, INFOCOM COMPUTERS AND COMMUNICATIONS, CAMBRIDGE MA. 02142
C ALL RIGHTS RESERVED, COMMERCIAL USAGE STRICTLY PROHIBITED
C WRITTEN BY R. M. SUPNIK

   and the distribution's README says of it: "This version still contains the Infocom copyright notices in the source files -- notices
   which allow non-commercial use of the resulting program."

   The way in is 4.3BSD's games/zork/zork.c, 4.1 82/10/24, which has no notice of its own.

   What differs from 2.5.6, the same in the program this is compared against:
   - It says what the tape's did: "This version created 10-SEP-78", the revision history as it stood then (from 4.3's lib/dtext.dat), and
     V2.0a. The game behind the words is still 2.5.6's: the tape's own FORTRAN is lost, and it has the fixes and the Puzzle Room that came after.
   - The first room is printed by the wrapper, as 4.3's did, and the game then says nothing of its own before the first prompt. The real
     4.3BSD zork, run under SIMH, does just that: no "Welcome to Dungeon" at the start, though the room counts as seen. So the message of
     10-SEP-78 is in the text below as record 1, and is no more printed than the real one's is; the history command shows the same date.
   And for this terminal:
   - The save file, DSAVE.DAT, is zork/dsave in this browser's storage, and is checked on the way back in.
   - The carriage control the FORTRAN writes for (a blank first column) is obeyed, as DEC's did, not printed, as f2c's does.
   - The random number generator is machdep.f's. It is seeded with 11, from the date routine that returns 11s: every game has the same dice.
   - ^C does nothing, as zork.c's signal(2,1) arranged. ^D ends the game, where f2c's runtime stops with an error. A number that is not one, which only the implementers' GDT asks for, stops it as f2c's does.
 */
(function(P){
'use strict';
var DTEXT=[
[1,"Welcome to Dungeon.                    This version created 10-SEP-78."],
[2,"Done."],
[3,"Revision history:"],
[3,""],
[3,"10-SEP-78  Endgame (V2.0a)."],
[3,"10-AUG-78  DECUS version (V1.1b)."],
[3,"14-JUN-78  Public version with parser (V1.1a)."],
[3,"4-MAR-78   Debugging version (V1.0a)."],
[-3,""],
[-3,""],
[-3,""],
[-3,""],
[-3,""],
[4,"Useful commands:"],
[4,""],
[4,"   The 'BRIEF' command suppresses printing of long room descriptions"],
[4,"for rooms which have been visited.  The 'SUPERBRIEF' command suppresses"],
[4,"printing of long room descriptions for all rooms.  The 'VERBOSE'"],
[4,"command restores long descriptions."],
[4,"   The 'INFO' command prints information which might give some idea"],
[4,"of what the game is about."],
[4,"   The 'QUIT' command prints your score and asks whether you wish"],
[4,"to continue playing."],
[4,"   The 'SAVE' command saves the state of the game for later continuation."],
[4,"   The 'RESTORE' command restores a saved game."],
[4,"   The 'INVENTORY' command lists the objects in your possession."],
[4,"   The 'LOOK' command prints a description of your surroundings."],
[4,"   The 'SCORE' command prints your current score and ranking."],
[4,"   The 'TIME' command tells you how long you have been playing."],
[4,"   The 'DIAGNOSE' command reports on your injuries, if any."],
[4,""],
[4,"Command abbreviations:"],
[4,""],
[4,"   The 'INVENTORY' command may be abbreviated 'I'."],
[4,"   The 'LOOK' command may be abbreviated 'L'."],
[4,"   The 'QUIT' command may be abbreviated 'Q'."],
[4,""],
[4,"Containment:"],
[4,""],
[4,"   Some objects can contain other objects.  Many such containers can"],
[4,"be opened and closed.  The rest are always open.   They may or may"],
[4,"not be transparent.  For you to access (e.g., take) an object"],
[4,"which is in a container, the container must be open.  For you"],
[4,"to see such an object, the container must be either open or"],
[4,"transparent.  Containers have a capacity, and objects have sizes;"],
[4,"the number of objects which will fit therefore depends on their"],
[4,"sizes.  You may put any object you have access to (it need not be"],
[4,"in your hands) into any other object.  At some point, the program"],
[4,"will attempt to pick it up if you don't already have it, which"],
[4,"process may fail if you're carrying too much.  Although containers"],
[4,"can contain other containers, the program doesn't access more than"],
[4,"one level down."],
[4,""],
[4,"Fighting:"],
[4,""],
[4,"   Occupants of the dungeon will, as a rule, fight back when"],
[4,"attacked.  In some cases, they may attack even if unprovoked."],
[4,"Useful verbs here are 'ATTACK <villain> WITH <weapon>', 'KILL',"],
[4,"etc.  Knife-throwing may or may not be useful.  You have a"],
[4,"fighting strength which varies with time.  Being in a fight,"],
[4,"getting killed, and being injured all lower this strength."],
[4,"Strength is regained with time.  Thus, it is not a good idea to"],
[4,"fight someone immediately after being killed.  Other details"],
[4,"should become apparent after a few melees or deaths."],
[4,""],
[4,"Command parser:"],
[4,""],
[4,"   A command is one line of text terminated by a carriage return."],
[4,"For reasons of simplicity, all words are distinguished by their"],
[4,"first six letters.  All others are ignored.  For example, typing"],
[4,"'DISASSEMBLE THE ENCYCLOPEDIA' is not only meaningless, it also"],
[4,"creates excess effort for your fingers.  Note that this trunca-"],
[4,"tion may produce ambiguities in the intepretation of longer words."],
[4,""],
[4,"   You are dealing with a fairly stupid parser, which understands"],
[4,"the following types of things--"],
[4,""],
[4,"   Actions:"],
[4,"   Among the more obvious of these, such as TAKE, PUT, DROP, etc."],
[4,"   Fairly general forms of these may be used, such as PICK UP,"],
[4,"   PUT DOWN, etc."],
[4,""],
[4,"   Directions:"],
[4,"   NORTH, SOUTH, UP, DOWN, etc. and their various abbreviations."],
[4,"   Other more obscure directions (LAND, CROSS) are appropriate in"],
[4,"   only certain situations."],
[4,""],
[4,"   Objects:"],
[4,"   Most objects have names and can be referenced by them."],
[4,""],
[4,"   Adjectives:"],
[4,"   Some adjectives are understood and required when there are"],
[4,"   two objects which can be referenced with the same 'name' (e.g.,"],
[4,"   DOORs, BUTTONs)."],
[4,""],
[4,"   Prepositions:"],
[4,"   It may be necessary in some cases to include prepositions, but"],
[4,"   the parser attempts to handle cases which aren't ambiguous"],
[4,"   without.  Thus 'GIVE CAR TO DEMON' will work, as will 'GIVE DEMON"],
[4,"   CAR'.  'GIVE CAR DEMON' probably won't do anything interesting."],
[4,"   When a preposition is used, it should be appropriate;  'GIVE CAR"],
[4,"   WITH DEMON' won't parse."],
[4,""],
[4,"   Sentences:"],
[4,"   The parser understands a reasonable number of syntactic construc-"],
[4,"   tions.  In particular, multiple commands (separated by commas)"],
[4,"   can be placed on the same line."],
[4,""],
[4,"   Ambiguity:"],
[4,"   The parser tries to be clever about what to do in the case of"],
[4,"   actions which require objects that are not explicitly specified."],
[4,"   If there is only one possible object, the parser will assume"],
[4,"   that it should be used.  Otherwise, the parser will ask."],
[4,"   Most questions asked by the parser can be answered."],
[5,"Welcome to Dungeon!"],
[5,""],
[5,"   You are near a large dungeon, which is reputed to contain vast"],
[5,"quantities of treasure.   Naturally, you wish to acquire some of it."],
[5,"In order to do so, you must of course remove it from the dungeon.  To"],
[5,"receive full credit for it, you must deposit it safely in the trophy"],
[5,"case in the living room of the house."],
[5,""],
[5,"   In addition to valuables, the dungeon contains various objects"],
[5,"which may or may not be useful in your attempt to get rich.  You may"],
[5,"need sources of light, since dungeons are often dark, and weapons,"],
[5,"since dungeons often have unfriendly things wandering about.  Reading"],
[5,"material is scattered around the dungeon as well;  some of it"],
[5,"is rumored to be useful."],
[5,""],
[5,"   To determine how successful you have been, a score is kept."],
[5,"When you find a valuable object and pick it up, you receive a"],
[5,"certain number of points, which depends on the difficulty of finding"],
[5,"the object.  You receive extra points for transporting the treasure"],
[5,"safely to the living room and placing it in the trophy case.  In"],
[5,"addition, some particularly interesting rooms have a value associated"],
[5,"with visiting them.  The only penalty is for getting yourself killed,"],
[5,"which you may do only twice."],
[5,""],
[5,"   Of special note is a thief (always carrying a large bag) who"],
[5,"likes to wander around in the dungeon (he has never been seen by the"],
[5,"light of day).  He likes to take things.  Since he steals for pleasure"],
[5,"rather than profit and is somewhat sadistic, he only takes things which"],
[5,"you have seen.  Although he prefers valuables, sometimes in his haste"],
[5,"he may take something which is worthless.  From time to time, he examines"],
[5,"his take and discards objects which he doesn't like.  He may occas-"],
[5,"ionally stop in a room you are visiting, but more often he just wanders"],
[5,"through and rips you off (he is a skilled pickpocket)."],
[6,"Please answer the question."],
[7,"You clearly are a suicidal maniac.  We don't allow psychotics in the"],
[7,"dungeon, since they may harm other adventurers.  Your remains will be"],
[7,"installed in the land of the living dead, where your fellow adventurers"],
[7,"may gloat over them."],
[8,"What?  You don't trust me?  Why, only last week I patched a running"],
[8,"RSX system and it survived for over thirty seconds.  Oh, well."],
[9,"Now let me see..."],
[9,"Well, we weren't quite able to restore your state.  You can't have"],
[9,"everything."],
[10,"Do you wish me to try to patch you?"],
[11,"You are behind the white house.  In one corner of the house"],
[11,"there is a window which is #."],
[12,"open"],
[13,"slightly ajar"],
[14,"You are in the kitchen of the white house.  A table seems to have"],
[14,"been used recently for the preparation of food.  A passage leads to"],
[14,"the west, and a dark staircase can be seen leading upward.  To the"],
[14,"east is a small window which is #."],
[15,"You are in the living room.  There is a door to the east.  To the west"],
[15,"is a wooden door with strange gothic lettering, which appears to be"],
[15,"nailed shut."],
[16,"You are in the living room.  There is a door to the east.  To the west"],
[16,"is a cyclops-shaped hole in an old wooden door, above which is some"],
[16,"strange gothic lettering."],
[17,"In the center of the room is a large oriental rug."],
[18,"In the center of the room is a closed trap door."],
[19,"In the center of the room is an open trap door."],
[20,"There is a rug lying next to an open trap door."],
[21,"You are in a dark and damp cellar with a narrow passageway leading"],
[21,"east, and a crawlway to the south.  To the west is the bottom of a"],
[21,"steep metal ramp which is unclimbable."],
[22,"The door crashes shut, and you hear someone barring it."],
[23,"You are in a small room near the maze.  There are twisty"],
[23,"passages in the immediate vicinity."],
[24,"Above you is a grating locked with a skull-and-crossbones lock."],
[25,"Above you is an open grating with sunlight pouring in."],
[26,"Above you is a grating."],
[27,"You are in a clearing, with a forest surrounding you on the west"],
[27,"and south."],
[28,"There is a grating securely fastened into the ground."],
[29,"There is an open grating descending into darkness."],
[30,"A grating appears on the ground."],
[31,"You are in a long room on the south shore of a large reservoir."],
[32,"You are in a long room, to the north of which was formerly a"],
[32,"reservoir.  However, with the water level lowered, there is merely"],
[32,"a wide stream running through the center of the room."],
[33,"There is a western exit, a passageway south, and a steep pathway"],
[33,"climbing up along the edge of a cliff."],
[34,"You are on the reservoir.  Beaches can be seen north and south."],
[34,"Upstream a small stream enters the reservoir through a narrow"],
[34,"cleft in the rocks.  The dam can be seen downstream."],
[35,"You are on what used to be a large reservoir, but which is now a"],
[35,"large mud pile.  There are 'shores' to the north and south."],
[36,"You are in a large cavernous room, north of a large reservoir."],
[37,"You are in a large cavernous room, to the south of which was formerly"],
[37,"a reservoir.  However, with the water level lowered, there is merely"],
[37,"a wide stream running through the center of the room."],
[38,"There is a tunnel leaving the room to the north."],
[39,"You are in a large room with giant icicles hanging from the walls"],
[39,"and ceiling.  There are passages to the north and east."],
[40,"Part of the glacier has been melted."],
[41,"There is a large passageway leading westward."],
[42,"You are in a large square room with tall ceilings.  There are exits"],
[42,"on the north, east, and west sides of the room.  On the south wall is"],
[42,"an enormous mirror which fills the entire wall."],
[43,"Unfortunately, you have managed to destroy it by your reckless"],
[43,"actions."],
[44,"            BOOOOOOOOOM"],
[45,"You are in large room which seems to be air conditioned.  In one"],
[45,"corner there is a machine (?) which is shaped somewhat like a clothes"],
[45,"dryer.  On the 'panel' there is a switch which is labelled in an"],
[45,"obscure dialect of Swahili.  Fortunately, I know this dialect, and the"],
[45,"label translates to 'START'.  The switch does not appear to be manip-"],
[45,"ulable by any human hand (unless the fingers are about 1/16 by 1/4"],
[45,"inch).  On the front of the machine is a large lid, which is #."],
[46,"closed"],
[47,"The cave is very windy at the moment, and your candles have blown out."],
[48,"You are in a small room that has only one door, to the east."],
[49,"In the corner of the room on the ceiling is a large vampire bat who"],
[49,"is obviously deranged and holding his nose."],
[50,"A deranged vampire bat (a reject from WUMPUS) swoops down"],
[50,"from the ceiling and lifts you away..."],
[51,"You are at the periphery of a large dome, which forms the ceiling"],
[51,"of another room below.  Protecting you from a precipitous drop is a"],
[51,"wooden railing which circles the dome."],
[52,"Hanging down from the railing is a rope which ends about ten feet"],
[52,"from the floor below."],
[53,"I'm afraid that the leap you attempted has done you in."],
[54,"You are in a large room with a prominent doorway leading to a down"],
[54,"staircase.  To the west is a narrow twisting tunnel.  Above you is a"],
[54,"large dome painted with scenes depicting elvish hacking rites.  Up"],
[54,"around the edge of the dome (20 feet up) is a wooden railing.  In the"],
[54,"center of the room there is a white marble pedestal."],
[55,"A large piece of rope descends from the railing above, ending some"],
[55,"five feet above your head."],
[56,"You are in a circular room with passages off in eight directions."],
[57,"Your compass needle spins wildly, and you cannot get your bearings."],
[58,"According to Prof. TAA of MIT Tech, the rapidly changing magnetic"],
[58,"fields in the room are so intense as to cause you to be electrocuted."],
[58,"I really don't know, but in any event, something has killed you."],
[59,"You are outside a large gateway, on which is inscribed:"],
[59,""],
[59,"   \"Abandon every hope, all ye who enter here.\""],
[59,""],
[59,"The gate is open.  Through it you can see a desolation, with a pile of"],
[59,"mangled corpses in one corner.  Thousands of voices, lamenting some"],
[59,"hideous fate, can be heard."],
[60,"The way through the gate is barred by evil spirits, who jeer at your"],
[60,"attempts to pass."],
[61,"There is a clap of thunder, and a voice echoes through the"],
[61,"cavern:  \"Begone, chomper!\"  Apparently, the voice thinks you"],
[61,"are an evil spirit and dismisses you from the land of the living."],
[62,"You are not equipped for an exorcism."],
[63,"There is a clap of thunder, and a voice echoes through the"],
[63,"cavern:  \"Begone, fiends!\"  The spirits, sensing the presense"],
[63,"of a greater power, flee through the walls."],
[64,"You have entered the land of the living dead, a large desolate"],
[64,"room.  Although it is apparently uninhabited, you can hear the"],
[64,"sounds of thousands of lost souls weeping and moaning.  In"],
[64,"the east corner are stacked the remains of dozens of previous"],
[64,"adventurers who were less fortunate than yourself.  To the east"],
[64,"is an ornate passage, apparently recently constructed."],
[65,"Amid the desolation, you spot what appears to be your head,"],
[65,"tastefully impaled on the end of a long pole."],
[66,"You are standing on the top of flood control dam #3, which was"],
[66,"quite a tourist attraction in times far distant.  There are paths"],
[66,"to the north, south, east, and down."],
[67,"The sluice gates on the dam are closed.  Behind the dam, there can"],
[67,"be seen a wide lake.  A small stream is formed by the runoff from"],
[67,"the lake."],
[68,"It appears that the dam has been opened, since the water level behind"],
[68,"the dam is low and the sluice gate is open.  Water is rushing down-"],
[68,"stream through the gates."],
[69,"There is a control panel here.  There is a large metal bolt on the"],
[69,"panel.  Above the bolt is a small green plastic bubble."],
[70,"The green bubble is glowing."],
[71,"The water level is now up to your ankles."],
[72,"The water level is now up to your shins."],
[73,"The water level is now up to your knees."],
[74,"The water level is now up to your hips."],
[75,"The water level is now up to your waist."],
[76,"The water level is now up to your chest."],
[77,"The water level is now up to your neck."],
[78,"The water level is now over your head."],
[79,"The water level is now high in your lungs."],
[80,"The room is full of water and cannot be entered."],
[81,"I'm afraid you have done drowned yourself."],
[82,"You hear a scream of anguish as you violate the robber's hideaway."],
[82,"Using passages unknown to you, he rushes to its defense."],
[83,"The thief gestures mysteriously, and the treasures in the room"],
[83,"suddenly vanish."],
[84,"Something seems funny about the feel of the buoy."],
[85,"Oh dear, you seem to have gone over Aragain Falls.  Not a very"],
[85,"smart thing to do, apparently."],
[86,"You seem to be digging a hole here."],
[87,"The hole is getting deeper, but that's about it."],
[88,"You are surrounded by a wall of sand on all sides."],
[89,"You can see a small statue in the sand."],
[90,"The wall collapses, smothering you."],
[91,"There is nothing to dig into here."],
[92,"You are digging into a pile of bat guano."],
[93,"You seem to be getting knee deep in guano."],
[94,"You are covered with bat turds, cretin."],
[95,"This is getting you nowhere."],
[96,"You are at the top of Aragain Falls, an enormous waterfall with a"],
[96,"drop of about 450 feet.  The only path here is on the north end."],
[96,"There is a man-sized barrel here which you could fit into."],
[97,"A beautiful rainbow can be seen over the falls and to the east."],
[98,"A solid rainbow spans the falls."],
[99,"According to Prof. TAA of MIT Tech, the rapidly changing magnetic"],
[99,"fields in the room are so intense as to fry all the delicate innards"],
[99,"of the robot.  I really don't know, but in any event, smoke is coming"],
[99,"out of its ears, and it has stopped moving."],
[100,"You are on a wide ledge high into the volcano.  The rim of the"],
[100,"volcano is about 200 feet above, and there is a precipitous drop"],
[100,"below to the floor."],
[101,"The way to the south is blocked by rubble."],
[102,"There is a small door to the south."],
[103,"The way to the south is blocked by rubble."],
[104,"You are in a dusty old room which is virtually featureless, except"],
[104,"for an exit on the north size."],
[105,"Imbedded in the far wall is a rusty old box.  It appears that"],
[105,"the box is somewhat damaged, since an oblong hole has been"],
[105,"chipped out of the front of it."],
[106,"On the far wall is a rusty box, whose door has been blown off."],
[107,"You are in a room with a low ceiling which is circular in shape."],
[107,"There are exits to the east and southeast."],
[108,"As you enter, your compass starts spinning wildly."],
[109,"The ledge has collapsed and cannot be landed on."],
[110,"The ledge collapses, giving you a narrow escape."],
[111,"The force of the explosion has caused the ledge to collapse belatedly."],
[112,"The ledge collapses, leaving you with no place to land."],
[113,"The ledge collapses, probably as a result of the explosion.  A large"],
[113,"chunk of it, which is attached to the hook, drags you down to the"],
[113,"ground.  Fatally."],
[114,"The way is blocked by debris from an explosion."],
[115,"You may recall your recent explosion.  Well, probably as a result of"],
[115,"that, you hear an ominous rumbling, as if one of the rooms in the"],
[115,"dungeon has collapsed."],
[116,"The room trembles and 50,000 pounds of rock fall on you,"],
[116,"turning you into a pancake."],
[117,"The house shakes, and the ceiling of the room you're in collapses,"],
[117,"turning you into a pancake."],
[118,"A volcano gnome seems to walk straight out of the wall and says,"],
[118,"\"I have a very busy appointment schedule and little time to waste on"],
[118,"trespassers, but for a very small fee, I'll show you the way out.\""],
[118,"You notice that the gnome is nervously glancing at his watch."],
[119,"Suddenly a sinister, wraithlike figure, cloaked and hooded, appears"],
[119,"seeming to float in the air before you.  In a low, almost inaudible"],
[119,"voice he says, \"I welcome you to the ranks of the chosen of Zork.  You"],
[119,"have persisted through many trials and tests and have overcome them"],
[119,"all.  One such as yourself is fit to join even the implementers!\""],
[119,"He then raises his oaken staff and, chuckling, drifts away like a"],
[119,"wisp of smoke, his laughter fading in the distance."],
[120,"The best method to discuss problems is over the most appropriate"],
[120,"Usenet newsgroup, currently rec.games.misc"],
[120,""],
[120,""],
[120,""],
[120,""],
[121,"Unfortunately, it is impossible to tell directions in here."],
[122,"The slag turns out to be rather insubstantial and crumbles into dust"],
[122,"at your touch.  It must not have been very valuable."],
[123,"The lid opens."],
[124,"The lid closes."],
[125,"Look around."],
[126,"You think it isn't?"],
[127,"I think you've already done that."],
[128,"The trophy case is securely fastened to the wall (perhaps to foil any"],
[128,"attempt by robbers to remove it)."],
[129,"The bottle hits the far wall and is decimated."],
[130,"The basket is at the other end of the chain."],
[131,"A brilliant maneuver destroys the bottle."],
[132,"The water splashes on the walls and evaporates immediately."],
[133,"The water spills to the floor and evaporates immediately."],
[134,"It is not tied to anything."],
[135,"There is nothing it can be tied to."],
[136,"The rope is already attached."],
[137,"The rope drops over the side and comes within ten feet of the floor."],
[138,"I see no objects here."],
[139,"Although you tied it incorrectly, the rope becomes free."],
[140,"The rope drops gently to the floor below."],
[141,"The rope is tied to the railing."],
[142,"The lamp has smashed into the floor, and the light has gone out."],
[143,"The rug is too heavy to lift, but in trying to raise it you"],
[143,"notice an irregularity beneath it."],
[144,"The rug is extremely heavy and cannot be carried."],
[145,"With a great effort, the rug is moved to one side of the room."],
[145,"With the rug moved, the dusty cover of a closed trap door appears."],
[146,"Having moved the carpet previously, you find it impossible"],
[146,"to move it again."],
[147,"You are stopped by a cloud of poisonous gas."],
[148,"Time passes... and you die from some obscure poisoning."],
[149,"The gnome glances at his watch.  \"Oops!  I'm late for an"],
[149,"an appointment.\"  He disappears, leaving you alone on the shelf."],
[150,"Now you've done it.  It seems that the brick has other properties"],
[150,"than weight, namely the ability to blow you to smithereens."],
[151,"There is an explosion nearby."],
[152,"The wire rapidly burns into nothing."],
[153,"The match has gone out."],
[154,"The lamp appears to be getting dimmer."],
[155,"The lamp is dying."],
[156,"The candles grow short."],
[157,"The candles are very short."],
[158,"The leaves burn, and the neighbors start to complain."],
[159,"The sight of someone carrying a pile of burning leaves so offends"],
[159,"the neighbors that they come over and put you out."],
[160,"As you pick up the rusty knife, your sword gives a single pulse"],
[160,"of blinding blue light."],
[161,"As the knife approaches its victim, your mind is submerged by an"],
[161,"overmastering will.  Slowly, your hand turns, until the rusty blade"],
[161,"is an inch from your neck.  The knife seems almost to sing as it"],
[161,"savagely cuts your throat."],
[162,"A ghost appears in the room and is appalled by your desecration"],
[162,"of the remains of a fellow adventurer.  He casts a curse on"],
[162,"all of your valuables and orders them banished to the land of"],
[162,"the living dead.  The ghost leaves, muttering obscenities."],
[163,"There is a rumble from deep within the earth, and the room shakes."],
[164,"There is an ugly person staring at you."],
[165,"The mirror is broken into many pieces."],
[166,"Nobody but a greedy surgeon would allow you to attempt that trick."],
[167,"You have broken the mirror.  I hope you have a seven years supply of"],
[167,"good luck available."],
[168,"Haven't you done enough already?"],
[169,"The torch hits the glacier and explodes into a great ball of flame,"],
[169,"devouring the glacier.  The water from the melting glacier rushes"],
[169,"downstream, carrying the torch with it.  In place of the glacier,"],
[169,"there is a passageway leading west."],
[170,"The melting glacier seems to have carried the torch away, leaving"],
[170,"you in the dark."],
[171,"The glacier is unmoved by your ridiculous attempt."],
[172,"Part of the glacier melts, drowning you under a torrent of water."],
[173,"burned out ivory torch"],
[174,"There is a burned out ivory torch here."],
[175,"The basket is raised to the top of the shaft."],
[176,"The basket is lowered to the bottom of the shaft."],
[177,"The cage is securely fastened to the iron chain."],
[178,"You seem unable to affect these spirits."],
[179,"How can you attack a spirit with material objects?"],
[180,"The book is open to page 569."],
[181,"As hard as you try, the book cannot be closed."],
[182,"A booming voice says, \"Wrong, cretin!\", and you notice that you"],
[182,"have turned into a pile of dust."],
[183,"I'm afraid that you have run out of matches."],
[184,"One of the matches starts to burn."],
[185,"The match is out."],
[186,"The tube refuses to accept anything."],
[187,"The cyclops yawns and stares at the thing that woke him."],
[188,"The cyclops, tired of all your games and trickery, eats you."],
[188,"The cyclops says, \"Mmm mmm!  Just like mom used to make 'em.\""],
[189,"The cyclops says, \"Mmm mmm!  I love hot peppers!  But oh, could I use"],
[189,"a drink.  Perhaps I could drink the blood of that thing.\"  From the"],
[189,"gleam in his eye, it could be surmised that you are 'that thing'."],
[190,"The cyclops looks tired and quickly falls fast asleep (what did you"],
[190,"put in that drink, anyway?)."],
[191,"The cyclops is apparently not thirsty at the moment and refuses"],
[191,"your generous gesture."],
[192,"The cyclops may be hungry, but there is a limit."],
[193,"The cyclops is not so stupid as to eat that!"],
[194,"The cyclops seems somewhat agitated."],
[195,"The cyclops appears to be getting more agitated."],
[196,"The cyclops is moving about the room, looking for something."],
[197,"The cyclops was looking for salt and pepper.  I think he is gathering"],
[197,"condiments for his upcoming snack."],
[198,"The cyclops is moving toward you in an unfriendly manner."],
[199,"You have two choices:  1. Leave  2. Become dinner."],
[200,"Your actions don't appear to be doing much harm to the cyclops, but"],
[200,"they do not exactly lower your insurance premiums, either."],
[201,"The cyclops ignores all injuries to his body with a shrug."],
[202,"The cyclops is rather heavy and doesn't take kindly to being grabbed."],
[203,"You cannot tie the cyclops, although he is fit to be tied."],
[204,"Realizing just in time that you'd be stabbed in the back if you"],
[204,"tried to take the chalice, you return to the fray."],
[205,"Congratulations!  Unlike the other vandals, who merely stole the"],
[205,"artist's masterpieces, you have destroyed one."],
[206,"worthless piece of canvas"],
[207,"There is a worthless piece of canvas here."],
[208,"With great effort, you open the window far enough to allow passage."],
[209,"The window closes (more easily than it opened)."],
[210,"The bolt won't turn with your best effort."],
[211,"The sluice gates open, and water pours through the dam."],
[212,"The sluice gates close, and water starts to collect behind the dam."],
[213,"You can't do that!"],
[214,"The grating is locked."],
[215,"The grating opens to reveal trees above you."],
[216,"The grating opens."],
[217,"The grating is unlocked."],
[218,"The door reluctantly opens to reveal a rickety staircase descending"],
[218,"into darkness."],
[219,"The door swings shut and closes."],
[220,"The door is locked from above."],
[221,"The door cannot be opened."],
[222,"You cannot burn this door."],
[223,"The door is invulnerable."],
[224,"You cannot damage this door."],
[225,"The door is still under warranty."],
[226,"The machine comes to life (figuratively) with a dazzling display"],
[226,"of colored lights and bizarre noises.  After a few moments, the"],
[226,"excitement fades."],
[227,"The machine doesn't seem to want to do anything."],
[228,"A force keeps you from taking the bodies."],
[229,"The voice of the guardian of the dungeon booms out from the darkness,"],
[229,"\"Your disrespect has cost you your life!\" and places your head on a pole."],
[230,"The lights within the room shut off."],
[231,"The lights within the room come on."],
[232,"Click."],
[233,"There is a rumbling sound, and a stream of water appears to burst"],
[233,"from the east wall of the room (apparently, a leak has occurred"],
[233,"in a pipe)."],
[234,"The blue button appears to be jammed."],
[235,"The boat must be on the ground to be inflated."],
[236,"The boat inflates and appears seaworthy."],
[237,"You don't have enough lung power to inflate it."],
[238,"This boat will not inflate since some cretin put a hole in it."],
[239,"Well done.  The boat is repaired."],
[240,"There is a hissing sound and the boat deflates."],
[241,"The boat deflates."],
[242,"You can't deflate the boat while you're in it."],
[243,"The boat must be on the ground to be deflated."],
[244,"Very good."],
[245,"The rainbow seems to have become somewhat run of the mill."],
[246,"Suddenly, the rainbow appears to become solid and, I venture,"],
[246,"walkable (I think the giveaway was the stairs and bannister)."],
[247,"The structural integrity of the rainbow seems to have declined"],
[247,"precipitously, leaving you about 450 feet in the air, supported"],
[247,"by water vapor."],
[248,"The ballon is fastened to the hook."],
[249,"The balloon is not tied to anything."],
[250,"The wire falls off the hook."],
[251,"The box is imbedded in the wall."],
[252,"What do you expect, BOOM?"],
[253,"The box has no door!"],
[254,"The box is rusted and will not open."],
[255,"The box is not open, chomper!"],
[256,"The wire starts to burn."],
[257,"\"Thank you very much,\" he says.  \"I don't believe I've seen a"],
[257,"# as beautiful.  Follow me.\"  A door appears on the west end"],
[257,"of the ledge.  Through the door, you can see a narrow chimney"],
[257,"sloping downward.  The gnome moves quickly, and he disappears"],
[257,"from sight."],
[258,"\"That wasn't quite what I had in mind\", he says, crunching"],
[258,"the # in his rock hard hands."],
[259,"The gnome appears increasingly nervous."],
[260,"Although the implementers are gone, they foresaw that some cretin"],
[260,"would tamper with their remains.  Therefore, they took steps to"],
[260,"prevent this."],
[261,"Unfortunately, we've run out of poles.  Therefore, in punishment for"],
[261,"your transgression, we shall deprive you of all your valuables, and"],
[261,"of your life."],
[262,"Congratulations!  You've managed to break all the bottles.  Fortunately"],
[262,"for your feet, they were made of magic glass and disappear immediately."],
[263,"As you reach for the sphere, an iron cage falls from the ceiling"],
[263,"to entrap you.  To make matters worse, poisonous gas starts coming"],
[263,"into the room."],
[264,"As the robot reaches for sphere, an iron cage falls from the"],
[264,"ceiling.  The robot attempts to fend it off but is trapped below it."],
[264,"Alas, the robot short circuits in his vain attempt to escape and"],
[264,"crushes the sphere beneath him as he falls to the floor."],
[265,"There is a giant spark, and you are fried to a crisp."],
[266,"Nothing seems to happen."],
[267,"The whirring increases in intensity slightly."],
[268,"The whirring decreases in intensity slightly."],
[269,"A dull thump is heard in the distance."],
[270,"The flask breaks into pieces."],
[271,"Here noxious vapors prevent your entry."],
[272,"Just before you pass out, you notice that the vapors from the"],
[272,"flask's contents are fatal."],
[273,"Suddenly, the room appears to have become very large."],
[274,"The only writing visible is a capital E.  The rest is too small to"],
[274,"be clearly visible."],
[275,"You can't see through that!"],
[276,"The letters appear larger but are still too small to read."],
[277,"The icing, now visible, says \"EXPLODE\"."],
[278,"The icing, now visible, says \"EVAPORATE\"."],
[279,"The icing, now visible, says \"ENLARGE\"."],
[280,"The pool of water evaporates, revealing a tin of rare spices."],
[281,"The door to the room seems to be blocked by sticky orange rubble"],
[281,"from an explosion.  Probably some careless adventurer was playing"],
[281,"with blasting cakes."],
[282,"You have been blasted to smithereens (whatever they are)."],
[283,"The room around you seems to be getting smaller."],
[284,"The room seems to have become too small to hold you.  It seems"],
[284,"that the walls are not as compressable as your body, which is"],
[284,"more or less demolished."],
[285,"The robot is injured (being of shoddy construction) and falls to the"],
[285,"floor in a pile of garbage, which disintegrates before your eyes."],
[286,"How romantic!"],
[287,"If you must... Poof, you're dead!"],
[288,"The grue is a sinister, lurking presence in the dark places of the"],
[288,"earth.  Its favorite diet is adventurers, but its insatiable"],
[288,"appetite is tempered by its fear of light.  No grue has ever been"],
[288,"seen by the light of day, and few have survived its fearsome jaws"],
[288,"to tell the tale."],
[289,"There is no grue here, but I'm sure there is at least one lurking in"],
[289,"the darkness nearby.  I wouldn't let my light go out if I were you!"],
[290,"The bucket rises and comes to a stop."],
[291,"The bucket descends and comes to a stop."],
[292,"You notice that the # has burned out, and that"],
[292,"the cloth bag is starting to deflate."],
[293,"I hope you have more light than from a #."],
[294,"I didn't realize that adventurers are stupid enough to light a"],
[294,"# in a room which reeks of coal gas.  Fortunately,"],
[294,"there is still justice in the world."],
[295,"Oh, dear.  It appears that the smell coming from this room was coal"],
[295,"gas.  I would have thought twice about carrying a # in here."],
[296,"There is now a puddle in the middle of the #."],
[297,"The water leaks out of the # and evaporates immediately."],
[298,"You won't melt it with a #."],
[299,"The bolt can't be turned with your #."],
[300,"It seems that a # won't do."],
[301,"With a #?"],
[302,"The robot gladly takes the # and nods his headlike"],
[302,"appendage in thanks."],
[303,"A #?  Surely you jest."],
[304,"He who puts his hand to the plow and looks back is not fit for the"],
[304,"kingdom of winners.  In any case, 'BACK' doesn't work."],
[305,"You'll have to speak up if you expect me to hear you."],
[306,"I don't know how to do that.  I win in all cases."],
[307,"At your service!"],
[308,"The Frobozz Company, Ltd., created, owns, and operates this dungeon."],
[309,"Well, FOO, BAR, and BLETCH to you too!"],
[310,"It could very well be too late."],
[311,"The dungeon is ALWAYS open (always room for one more)."],
[312,"Naturally!"],
[313,"AAAARRRRRRGGGGGGGGHHHHHHHHHH!"],
[314,"Very good.  Now you can go to the second grade."],
[315,"Have you tried hopping around the dungeon, too?"],
[316,"Are you enjoying yourself?"],
[317,"Wheeeeee!"],
[318,"Do you expect me to applaud?"],
[319,"Such language in a high-class establishment like this!"],
[320,"You ought to be ashamed of yourself."],
[321,"It's not so bad.  You could have been killed already."],
[322,"Tough shit, asshole."],
[323,"Oh, dear.  Such language from a supposedly winning adventurer!"],
[324,"That word is henceforth replaced with DUNGEON."],
[325,"I think you are taking this thing for granite."],
[326,"Brief descriptions."],
[327,"Maximum verbosity."],
[328,"No long descriptions."],
[329,"You can see:  A #."],
[330,"Swimming is not allowed in this dungeon."],
[331,"I don't really see how."],
[332,"I think that swimming is best performed in water."],
[333,"Perhaps it is your head that is swimming."],
[334,"Wasn't he an Indian?"],
[335,"I didn't think you would really try to go over the falls in a"],
[335,"barrel.  It seems that some 450 feet below, you were met by a number"],
[335,"of unfriendly rocks and boulders, causing your immediate demise."],
[336,"Wasn't he a sailor?"],
[337,"The cyclops, hearing the name of his deadly nemesis, flees the room"],
[337,"by knocking down the wall on the north size of the room."],
[338,"There is a clap of thunder and the east door opens."],
[339,"Well what?"],
[340,"If you pray enough, your prayers may be answered."],
[341,"Nothing happens."],
[342,"I don't really know how to do that."],
[343,"Do you wish to leave the game?"],
[344,"Underneath the pile of leaves is a grating."],
[345,"Underneath the rug is a closed trap door."],
[346,"Hello."],
[347,"Good day."],
[348,"Nice weather we've been having lately."],
[349,"Goodbye."],
[350,"Here, nothing happens."],
[351,"Nothing happens here."],
[352,"I think that phrase is getting a bit worn out."],
[353,"You seem to be repeating yourself."],
[354,"The # bows his head to you in greeting."],
[355,"I think that only schizophrenics say hello to a #."],
[356,"It is impossible to read in the dark."],
[357,"How does one look through a #?"],
[358,"How can I read a #?"],
[359,"How, exactly, do I ring that?"],
[360,"Ding, dong."],
[361,"I'm not sure that a # can be melted."],
[362,"If you wish, but I can't understand why."],
[363,"Dental hygiene is highly recommended, but I'm not sure what"],
[363,"you want to brush them with."],
[364,"A nice idea, but with a #?"],
[365,"Well, you seem to have been brushing your teeth with some sort of"],
[365,"glue.  As a result, your mouth gets glued together with your nose,"],
[365,"and you die of respiratory failure."],
[366,"Unfortunately, the troll can't hear you."],
[367,"Inflating it further would probably burst it."],
[368,"How can you inflate that?"],
[369,"Come on, now!"],
[370,"The # isn't sleeping."],
[371,"This has no effect."],
[372,"does not seem to do anything useful"],
[373,"is not notably useful"],
[374,"isn't very interesting"],
[375,"doesn't appear worthwhile"],
[376,"has no effect"],
[377,"doesn't do anything"],
[378,"Kicking a # #."],
[379,"Waving a # #."],
[380,"Playing in this way with a # #."],
[381,"Fiddling with a # #."],
[382,"Pushing the # #."],
[383,"I don't think so."],
[384,"This cannot be tied, so it cannot be untied!"],
[385,"How can you tie that to anything?"],
[386,"You can't tie the # to that."],
[387,"You could certainly never tie the # with that!"],
[388,"The # struggles and you cannot tie him up."],
[389,"Why would you tie up a #?"],
[390,"You can't turn that."],
[391,"You certainly can't turn it with a #."],
[392,"Digging with the # is slow and tedious."],
[393,"Digging with a # is silly."],
[394,"I don't think that anybody is home."],
[395,"Why knock on a #?"],
[396,"It sounds like there is something inside the #."],
[397,"The contents of the # spill out."],
[398,"I can't get to that to move it."],
[399,"You can't move the #."],
[400,"You can't turn that on."],
[401,"It is already on."],
[402,"You can't turn that off."],
[403,"It is already off."],
[404,"The # is now on."],
[405,"The # is now off."],
[406,"It is now pitch black."],
[407,"You must tell me how to do that to a #."],
[408,"The # cannot be opened."],
[409,"Opened."],
[410,"Opening the # reveals:"],
[411,"The # cannot be closed."],
[412,"It is already open."],
[413,"It is already closed."],
[414,"Closed."],
[415,"There is a # here."],
[416,"You are carrying a #."],
[417,"It is in the #, which is in the room."],
[418,"It is in the #, which you are carrying."],
[419,"Time passes..."],
[420,"The # must be on the ground to be boarded."],
[421,"I suppose you have a theory on boarding a #."],
[422,"You are already in the #, cretin!"],
[423,"You are now in the #."],
[424,"You aren't in that!"],
[425,"You realize, just in time, that disembarking here would probably"],
[425,"be fatal."],
[426,"You are on your own feet again."],
[427,"You can't go there without a vehicle."],
[428,"You can't go there in a #."],
[429,"I see nothing special about the #."],
[430,"It is pitch dark.  You are likely to be eaten by a grue."],
[431,"You are in the #."],
[432,"The # has died."],
[433,"The troll, disarmed, cowers in terror, pleading for his life in"],
[433,"the guttural tongue of the trolls."],
[434,"The troll, now worried about this encounter, recovers his"],
[434,"bloody axe."],
[435,"An unconscious troll is sprawled on the floor.  All passages out"],
[435,"of the room are open."],
[436,"A nasty-looking troll, brandishing a bloody axe, blocks all passages"],
[436,"out of the room."],
[437,"The troll stirs, quickly resuming a fighting stance."],
[438,"The troll spits in your face, saying \"Better luck next time\"."],
[439,"The troll laughs at your puny gesture."],
[440,"The troll, who is remarkably coordinated, catches the #"],
[441,"The troll, who is not overly proud, graciously accepts the gift"],
[442,"and not having the most discriminating tastes, gleefully eats it."],
[443,"and being for the moment sated, throws it back.  Fortunately, the"],
[443,"troll has poor control, and the knife falls on the floor.  He does"],
[443,"not look pleased."],
[444,"Sadly, a # can't be put in a #."],
[445,"You can't take the #."],
[446,"Aren't you forgetting something?"],
[447,"That would be a good trick."],
[448,"The # is too big to jump over."],
[449,"You should have looked before you leaped."],
[450,"I'm afraid that leap was a bit much for your weak frame."],
[451,"In the movies, your life would be passing in front of your eyes."],
[452,"Geronimo..."],
[453,"I don't think that the # would agree with you."],
[454,"I think you should get that first."],
[455,"Thank you very much.  It really hit the spot."],
[456,"How can I drink that?"],
[457,"I'd like to, but I can't get to that."],
[458,"Thank you very much.  I was rather thirsty, probably from all"],
[458,"this talking."],
[459,"The # catches fire."],
[460,"Unfortunately, you were holding it at the time."],
[461,"You don't have that."],
[462,"The # catches fire and is consumed."],
[463,"I don't think you can burn a #."],
[464,"It doesn't seem to work."],
[465,"Can you unlock a grating with a #?"],
[466,"Munging a # #."],
[467,"Trying to kill a # #."],
[468,"Trying to attack a # #."],
[469,"There is nothing here to attack."],
[470,"I've known strange people, but attacking a #?"],
[471,"with your bare hands is suicidal"],
[472,"with that is very self-destructive"],
[473,"You are in perfect health."],
[474,"You have a light wound."],
[475,"You have a serious wound."],
[476,"You have several wounds."],
[477,"You have serious wounds."],
[478,"You are at death's door."],
[479,"You can be killed by one more light wound."],
[480,"You can be killed by a serious wound."],
[481,"You can survive one serious wound."],
[482,"You are strong enough to take several wounds."],
[483,"You have been killed once."],
[484,"You have been killed twice."],
[485,"This gives you the rank of Cheater."],
[486,"This gives you the rank of Wizard."],
[487,"This gives you the rank of Master."],
[488,"This gives you the rank of Winner."],
[489,"This gives you the rank of Hacker."],
[490,"This gives you the rank of Adventurer."],
[491,"This gives you the rank of Junior Adventurer."],
[492,"This gives you the rank of Novice Adventurer."],
[493,"This gives you the rank of Amateur Adventurer."],
[494,"This gives you the rank of Beginner."],
[495,"Your sword is no longer glowing."],
[496,"Your sword is glowing with a faint blue glow."],
[497,"Your sword has begun to glow very brightly."],
[498,"Annoyed to be left unarmed in such an obviously dangerous"],
[498,"neighborhood, the thief slips off into the shadows."],
[499,"The robber, somewhat surprised by this turn of events, nimbly"],
[499,"recovers his stilletto."],
[500,"His booty remains."],
[501,"As the thief dies, the power of his magic decreases, and his"],
[501,"treasures reappear:  A #."],
[502,"  A #."],
[503,"There is a suspicious-looking individual, holding a bag, leaning"],
[503,"against one wall.  He is armed with a vicious-looking stilletto."],
[504,"There is a suspicious-looking individual lying unconscious on the"],
[504,"ground.  His bag and stilletto seem to have vanished."],
[505,"The robber revives, briefly feigning continued unconsciousness, and"],
[505,"when he sees his moment, scrambles away from you."],
[506,"Once you got him, what would you do with him?"],
[507,"You missed.  The thief makes no attempt to take the knife, although"],
[507,"it would be a fine addition to the collection in his bag.  He does"],
[507,"seem angered by your attempt."],
[508,"You evidently frightened the robber, although you missed him.  He flees."],
[509,"You evidently frightened the robber, although you missed him.  He flees,"],
[509,"but the contents of his bag fall on the floor."],
[510,"Your proposed victim suddenly recovers consciousness."],
[511,"The thief seems rather offended by your offer.  Do you think he's as"],
[511,"stupid as you are?"],
[512,"The thief places the # in his bag and thanks you politely."],
[513,"The candles are not lit."],
[514,"The flame is extinguished."],
[515,"Alas, there's not much left of the candles.  Certainly not enough to"],
[515,"burn."],
[516,"With what?"],
[517,"The candles are lit."],
[518,"The candles are already lit."],
[519,"You have to light them with something that's burning, you know."],
[520,"You realize just in time that the candles are already lit."],
[521,"The heat from the torch is so intense that the candles are vaporized."],
[522,"Oh, no!  You walked into the slavering fangs of a lurking grue."],
[523,"Oh, no!  A fearsome grue slithered into the room and devoured you."],
[524,"You can't go that way."],
[525,"The # is closed."],
[526,"I can't reach that."],
[527,"You aren't carrying that."],
[528,"Dropped."],
[529,"Thrown."],
[530,"You watch as the balloon slowly lands."],
[531,"The balloon has landed."],
[532,"You have landed, but the balloon did not survive."],
[533,"You watch as the balloon slowly descends."],
[534,"The balloon descends."],
[535,"You hear a boom and notice that the balloon is falling to the ground."],
[536,"Your balloon has hit the rim of the volcano, ripping the cloth and"],
[536,"causing you to drop 500 feet.  Did you get your flight insurance?"],
[537,"You watch as the balloon slowly ascends."],
[538,"The balloon ascends."],
[539,"You watch as the balloon slowly floats away.  It seems to be ascending,"],
[539,"due to its light load."],
[540,"The balloon leaves the ledge."],
[541,"You watch as the balloon slowly lifts off."],
[542,"The balloon slowly rises from the ground."],
[543,"The cloth bag is draped over the side."],
[544,"The balloon is inflated, and there is a # burning"],
[544,"in the receptacle."],
[545,"The balloon is tied to the hook."],
[546,"I'm afraid you can't control the balloon in that way."],
[547,"You are tied to the ledge."],
[548,"You don't really want to hold a burning #."],
[549,"The receptacle is already occupied."],
[550,"The # burns inside the receptacle."],
[551,"The balloon inflates as it fills with hot air."],
[552,"Not likely."],
[553,"An interesting idea, but..."],
[554,"A valiant attempt."],
[555,"You can't be serious."],
[556,"Not a prayer."],
[557,"You already have it."],
[558,"Your load is too heavy.  You will have to leave something behind."],
[559,"Taken."],
[560,"Nice try."],
[561,"I can't do that."],
[562,"I can't reach inside."],
[563,"How can you do that?"],
[564,"The # is already in the #."],
[565,"It won't fit."],
[566,"I can't reach the #."],
[567,"The cage shakes and is hurled across the room."],
[568,"\"I am sorry but that action is difficult in the absense of a mouth.\""],
[569,"\"My vision is not that good without eyes.\""],
[570,"\"I am only a stupid robot and cannot perform that command.\""],
[571,"ECHO"],
[571,"The acoustics of the room change subtly."],
[572,"Almost as soon as the # breathes his last, a cloud of"],
[572,"sinister black smoke envelops him, and when the fog lifts, the"],
[572,"carcass has disappeared."],
[573,"The # contains:"],
[574,"Your collection of treasures consists of:"],
[575,"You are carrying:"],
[576,"The # is carrying:"],
[577,"By some miracle of elven technology, you have managed to"],
[577,"stop the leak in the dam."],
[578,"You are empty handed."],
[579,"It is too dark in here to see."],
[580,"#:"],
[581,"I couldn't find anything."],
[582,"I couldn't find any valuables."],
[583,"Someone carrying a large bag is casually leaning against one of the"],
[583,"walls here.  He does not speak, but it is clear from his aspect that"],
[583,"the bag will be taken only over his dead body."],
[584,"Your opponent, determining discretion to be the better part of"],
[584,"valor, decides to terminate this little contretemps.  With a rueful"],
[584,"nod of his head, he steps backward into the gloom and disappears."],
[585,"The holder of the large bag just left, looking disgusted."],
[585,"Fortunately, he took nothing."],
[586,"A 'lean and hungry' gentleman just wandered through.  Finding"],
[586,"nothing of value, he left disgruntled."],
[587,"A seedy-looking individual with a large bag just wandered through"],
[587,"the room.  On the way, he quietly abstracted all valuables from the"],
[587,"room and from your possession, mumbling something about, \"Do unto"],
[587,"others before...\"."],
[588,"The other occupant (he of the large bag), finding nothing of value,"],
[588,"left disgusted."],
[589,"The other occupant just left carrying his large bag.  You may not"],
[589,"have noticed that he robbed you blind first."],
[590,"Off in the distance you hear someone saying, \"My, I wonder what this"],
[590,"fine # is doing here?\""],
[591,"You are still recovering from the last blow, so your attack is"],
[591,"ineffective."],
[592,"Attacking a dead # is pointless."],
[593,"Well, you really did it that time.  Is suicide painless?"],
[594,"The # slowly regains his feet."],
[595,"The unconscious # cannot defend himself:  he dies."],
[596,"It appears that the last blow was too much for you.  I'm afraid"],
[596,"that you are dead."],
[597,"Saved."],
[598,"I can't access the save file."],
[599,"Restored."],
[600,"Your save file is obsolete and cannot be restored."],
[601,"I don't understand that."],
[602,"You cannot talk to that!"],
[603,"You cannot talk through another person."],
[604,"Please input the entire command again."],
[605,"Fortunately, you still have a #."],
[606,"You are in a room with an exit on the west side, and a staircase"],
[606,"leading up."],
[607,"A cyclops, who looks prepared to eat horses (much less mere"],
[607,"adventurers), blocks the staircase.  From his state of health"],
[607,"and the bloodstains on the wall, you gather that he is not very"],
[607,"friendly, though he likes people."],
[608,"The cyclops is standing in the corner, eyeing you closely.  I don't"],
[608,"think he likes you very much.  He looks extremely hungry, even for"],
[608,"a cyclops."],
[609,"The cyclops, having eaten the hot peppers, appears to be gasping."],
[609,"His enflamed tongue protrudes from his man-sized mouth."],
[610,"The cyclops, perhaps affected by a drug in your drink, is sleeping"],
[610,"blissfully at the foot of the stairs."],
[611,"On the north of the room is a wall which used to be solid, but which"],
[611,"now has a cyclops-shaped hole in it."],
[612,"The bottle is closed."],
[613,"The bottle is already full."],
[614,"The bottle is now full of water."],
[615,"The water slips through your fingers."],
[616,"Too many prepositions."],
[617,"Too many objects."],
[618,"I can't see one here."],
[619,"Which one do you mean?"],
[620,"I can't reach that from inside the #."],
[621,"What should I do with the #?"],
[622,"Huh?"],
[623,"You must supply a direct object."],
[624,"You must supply an indirect object."],
[625,"Normally, I would offer to patch you up, but I'm ashamed to say my"],
[625,"abilities are not equal to dealing with your present condition."],
[625,"Please let me express my profoundest regrets."],
[626,"The thief, being temporarily incapacitated, is unable to acknowledge"],
[626,"your greeting with his usual graciousness."],
[627,"The thief is taken aback by your unexpected generosity but accepts"],
[627,"the # and stops to admire its beauty."],
[628,"The # is open, but I can't tell what's beyond it."],
[629,"The # is empty."],
[630,"I don't know how to look inside a #."],
[631,"There is nothing interesting there."],
[632,"I don't really see how."],
[633,"The implementers are dead;  therefore, they do not respond."],
[634,"You can't wind a #."],
[635,"You hear in the distance the chirping of a song bird."],
[636,"A metallic voice says, \"Hello, Intruder!  Your unauthorized presence"],
[636,"in the vault area of the Bank of Zork has set off all sorts of nasty"],
[636,"surprises, several of which seem to have been fatal.  This message"],
[636,"brought to you by the Frobozz Magic Alarm Company.\""],
[637,"An epicene Gnome of Zurich, wearing a three-piece suit and carrying a"],
[637,"safety deposit box, materializes in the room.  \"You seem to have"],
[637,"forgotten to deposit your valuables,\" he says, tapping the lid of the"],
[637,"box impatiently.  \"We don't usually allow customers to use the boxes"],
[637,"here, but we can make this ONE exception, I suppose...\"  He looks"],
[637,"askance at you over his wire-rimmed bifocals."],
[638,"The gnome looks impatient:  \"I may have another customer waiting;"],
[638,"you'll just have to fend for yourself, I'm afraid.\"  He disappears,"],
[638,"leaving you alone in the bare room."],
[639,"Talk about eating rich foods!"],
[640,"Nothing like having money to burn!"],
[641,"\"I wouldn't put THAT in a safety deposit box,\" remarks the gnome with"],
[641,"disdain, tossing it over his shoulder, where it disappears with an"],
[641,"understated \"pop\"."],
[642,"The gnome carefully places the # in the"],
[642,"deposit box.  \"Let me show you the way out,\" he says, making it clear"],
[642,"that he will be pleased to see the last of you.  Then, you are momentarily"],
[642,"disoriented, and when you recover, you are back at the Bank Entrance."],
[643,"The gnome says, \"Well, I never!\" and disappears with a snap of his"],
[643,"fingers, leaving you alone."],
[644,"The gnome appears increasingly impatient."],
[645,"There is an unpleasant grinding noise from inside the canary."],
[646,"The canary chirps blithely, if somewhat tinnily, for a short time."],
[647,"The canary chirps, slightly off key, an aria from a forgotten opera."],
[647,"From out of the greenery flies a lovely song bird.  It perches on a"],
[647,"limb just over your head and opens its beak to sing.  As it does so,"],
[647,"a beautiful brass bauble drops from its mouth, bounces off the top"],
[647,"of your head, and lands glimmering in the grass.  As the canary winds"],
[647,"down, the song bird flies away."],
[648,"The cliff is too steep for climbing."],
[649,"The egg is already open."],
[650,"There is no obvious way to open the egg."],
[651,"I doubt you could do that without damaging it."],
[652,"The egg is now open, but the clumsiness of your attempt has"],
[652,"seriously diminished its esthetic appeal."],
[653,"The concept of using a # is certainly original."],
[654,"Not to say that using a # isn't original either..."],
[655,"Your rather indelicate handling of the egg has caused it some damage."],
[655,"The egg is now open."],
[656,"Climbing the walls is of no avail."],
[657,"Bizarre!"],
[658,"The egg falls to the ground and is seriously damaged."],
[659,"The # falls to the ground."],
[660,"You are about ten feet above the ground nestled among some large"],
[660,"branches.  The nearest branch above you is beyond your reach."],
[661,"On the ground below you can see:"],
[662,"I can't see any wall here."],
[663,"That cannot be turned."],
[664,"You would be lost without me."],
[665,"You don't have the #."],
[666,"The song bird is not here, but it is probably nearby."],
[667,"I can't see any song bird here."],
[668,"You feel somewhat disoriented as you pass through..."],
[669,"You hit your head against the # as you attempt this feat."],
[670,"You can't go more than part way through the curtain."],
[671,"That would involve quite a contortion!"],
[672,"You are in it, turkey!"],
[673,"As you try, your hand seems to go through it."],
[674,"The # goes through it."],
[675,"The # passes through the wall and vanishes."],
[676,"The curtain dims slightly as the # passes through."],
[677,"I can't do that with everything at once."],
[678,"There is a wall there."],
[679,"There is no way up."],
[680,"There is no way down."],
[681,"You are in part of the long hallway.  The east and west walls are"],
[681,"dressed stone.  In the center of the hall is a shallow stone channel."],
[681,"In the center of the room the channel widens into a large hole around"],
[681,"which is engraved a compass rose."],
[682,"Somewhat to the south, identical stone statues face each other from"],
[682,"pedestals on opposite sides of the corridor.  The statues represent"],
[682,"Guardians of Zork, a military order of ancient lineage.  They are"],
[682,"portrayed as heavily armored warriors standing at ease, hands clasped"],
[682,"around formidable bludgeons."],
[683,"Somewhat to the north, identical stone statues face each other from"],
[683,"pedestals on opposite sides of the corridor.  The statues represent"],
[683,"Guardians of Zork, a military order of ancient lineage.  They are"],
[683,"portrayed as heavily armored warriors standing at ease, hands clasped"],
[683,"around formidable bludgeons."],
[684,"A passage enters from the south."],
[685,"The Guardians awake and, in perfect unison, destroy you with"],
[685,"their stone bludgeons.  Satisfied, they resume their posts."],
[686,"To the north and south are large hallways."],
[687,"To the north is a large hallway."],
[688,"You are inside a rectangular box of wood whose structure is rather"],
[688,"complicated.  Four sides and the roof are filled in, and the floor"],
[688,"is open."],
[688,"   As you face the side opposite the entrance, two short sides of"],
[688,"carved and polished wood are to your left and right.  The left panel"],
[688,"is mahogany, the right pine.  The wall you face is red on its left"],
[688,"half and black on its right.  On the entrance side, the wall is white"],
[688,"opposite the red part of the wall it faces, and yellow opposite the"],
[688,"black section.  The painted walls are at least twice the length of"],
[688,"the unpainted ones.  The ceiling is painted blue."],
[688,"   In the floor is a stone channel about six inches wide and a foot"],
[688,"deep.  The channel is oriented in a north-south direction.  In the"],
[688,"exact center of the room the channel widens into a circular"],
[688,"depression perhaps two feet wide.  Incised in the stone around this"],
[688,"area is a compass rose."],
[688,"   Running from one short wall to the other at about waist height"],
[688,"is a wooden bar, carefully carved and drilled.  This bar is pierced"],
[688,"in two places.  The first hole is in the center of the bar (and thus"],
[688,"in the center of the room).  The second is at the left end of the room"],
[688,"(as you face opposite the entrance).  Through each hole runs a wooden"],
[688,"pole."],
[688,"   The pole at the left end of the bar is short, extending about a"],
[689,"foot above the bar, and ends in a hand grip.  The pole is resting on"],
[689,"the stone floor."],
[690,"foot above the bar, and ends in a hand grip.  The pole has been"],
[690,"dropped into a hole carved in the stone floor."],
[691,"foot above the bar, and ends in a hand grip.  The pole has been lifted"],
[691,"out of a hole carved in the stone floor.  There is evidently enough"],
[691,"friction to keep the pole from dropping back down."],
[692,"foot above the bar, and ends in a hand grip.  The pole has been"],
[692,"dropped into the stone channel incised in the floor."],
[693,"foot above the bar, and ends in a hand grip.  The pole is positioned"],
[693,"above the stone channel in the floor."],
[694,"   The long pole at the center of the bar extends from the ceiling"],
[694,"through the bar to the circular area in the stone channel.  The"],
[694,"bottom end of this pole has a T-bar a bit less than two feet long"],
[694,"attached to it.  On the T-bar is carved an arrow.  The arrow and"],
[694,"T-bar are pointing #."],
[695,"north"],
[696,"northeast"],
[697,"east"],
[698,"southeast"],
[699,"south"],
[700,"southwest"],
[701,"west"],
[702,"northwest"],
[703,"You are in a small room, with narrow passages exiting to the north"],
[703,"and south.  A narrow red beam of light crosses the room at the north"],
[703,"end, inches above the floor."],
[704,"You are in a small room, with narrow passages exiting to the north"],
[704,"and south.  A narrow red beam of light crosses the room at the north"],
[704,"end, inches above the floor.  The beam is stopped halfway across the"],
[704,"room by a # lying on the floor."],
[705,"Though large and esthetically pleasing, the crypt is empty;  the"],
[705,"sarcophagi, bodies, and rich treasures to be expected in a tomb of"],
[705,"this magnificence are missing.  Inscribed on the wall is the motto of"],
[705,"the implementers, \"Feel Free\".  There is a door leading out of the"],
[705,"crypt to the south.  The door is #."],
[706,"You are in an east-west corridor which turns north at its eastern"],
[706,"and western ends.  The walls of the corridor are marble.  An"],
[706,"additional passage leads south at the center of the corridor."],
[707,"In the center of the north wall of the passage is a bronze door"],
[707,"which is #."],
[708,"You are in a narrow north-south corridor.  At the south end is a door"],
[708,"and at the north end is an east-west corridor.  The door is #."],
[709,"You are in a north-south hallway which ends in a large wooden door."],
[710,"The wooden door has a barred panel in it at about head height.  The"],
[710,"panel is #, and the door is #."],
[711,"You are in a large east-west corridor which opens out to a northern"],
[711,"parapet at its center.  You can see flames and smoke as you peer"],
[711,"towards the parapet.  The corridor turns south at its east and west"],
[711,"ends, and due south is a massive wooden door.  In the door is a small"],
[711,"window barred with iron.  The door is #."],
[712,"You are standing behind a stone retaining wall which rims a large"],
[712,"parapet overlooking a fiery pit.  It is difficult to see through the"],
[712,"smoke and flame which fills the pit, but it seems to be more or less"],
[712,"bottomless.  It also extends upwards out of sight.  The pit itself"],
[712,"is of roughly dressed stone and is circular in shape.  It is about"],
[712,"two hundred feet in diameter.  The flames generate considerable heat,"],
[712,"so it is rather uncomfortable standing here."],
[712,"   There is an object here which looks like a sundial.  On it are"],
[712,"an indicator arrow and (in the center) a large button.  On the face"],
[712,"of the dial are numbers \"one\" through \"eight\".  The indicator points"],
[712,"to the number \"#\"."],
[713,"one"],
[714,"two"],
[715,"three"],
[716,"four"],
[717,"five"],
[718,"six"],
[719,"seven"],
[720,"eight"],
[721,"You are in a featureless prison cell.  You can see only the flames"],
[721,"and smoke from the pit out of the small window in the closed door"],
[721,"in front of you."],
[722,"You are in a featureless prison cell.  You can see the east-west"],
[722,"corridor outside the open wooden door in front of you."],
[723,"Behind you is a bronze door which seems to be #."],
[724,"You are in a featureless prison cell.  Its wooden door is securely"],
[724,"fastened, and you can see only the flames and smoke of the pit out"],
[724,"its small window."],
[725,"You are in a featureless prison cell.  Its wooden door is securely"],
[725,"fastened, and you can see only the flames and smoke of the pit out"],
[725,"its small window.  On the other side of the cell is a bronze door"],
[725,"which seems to be #."],
[726,"   As you gleefully examine your new-found riches, the dungeon"],
[726,"master himself materializes beside you and says, \"Now that you have"],
[726,"solved all the mysteries of the dungeon, it is time for you to assume"],
[726,"your rightfully-earned place in the scheme of things.  Long have I"],
[726,"waited for one capable of releasing me from my burden!\"  He taps you"],
[726,"lightly on the head with his staff and mumbles a few well-chosen spells."],
[726,"You feel yourself changing, growing older and more stooped.  For a"],
[726,"moment there are two identical mages staring at each other among the"],
[726,"treasures, then you watch as your counterpart dissolves into a mist"],
[726,"and disappears, a sardonic grin on his face."],
[727,"Suddenly, as you wait in the dark, you begin to feel somewhat"],
[727,"disoriented.  The feeling passes, but something seems different."],
[727,"As you regain your composure, the cloaked figure appears before you"],
[727,"and says, \"You are now ready to face the ultimate challenge of"],
[727,"Zork.  Should you wish to do this somewhat more quickly in the"],
[727,"future, you will be given a magic phrase which will at any time"],
[727,"transport you by magic to this point.  To select the phrase, say"],
[727,"   INCANT, <word>"],
[727,"and you will be told your own magic phrase to use by saying"],
[727,"   INCANT, <phrase>"],
[727,"Good luck, and choose wisely!\""],
[728,"The button pops back to its original position."],
[729,"The mirror quietly swings shut."],
[730,"The pine wall closes quietly."],
[731,"The structure shakes slightly but doesn't move."],
[732,"The short pole prevents the structure from rotating."],
[733,"The movement of the structure alerts the Guardians."],
[734,"The arrow on the compass rose now indicates #."],
[735,"The structure rocks back and forth slightly but doesn't move."],
[736,"The pine wall swings open."],
[737,"The pine door opens into the field of view of the Guardians."],
[738,"The structure has reached the end of the stone channel and won't"],
[738,"budge."],
[739,"The structure slides # and stops over another compass rose."],
[740,"The structure wobbles # and stops over another compass rose."],
[741,"The structure wobbles as it moves, alerting the Guardians."],
[742,"The Guardian notices a wooden structure creeping by, and his"],
[742,"suspicions are aroused."],
[743,"Suddenly, the Guardians realize that someone is trying to sneak by"],
[743,"them in the structure.  They awake and, in perfect unison, hammer"],
[743,"the box and its contents (including you) to a pulp.  Satisfied, they"],
[743,"resume their posts."],
[744,"A Guardian notices the open side of the structure, and his suspicions"],
[744,"are aroused."],
[745,"Attacking the Guardians is about as futile as attacking a stone wall."],
[745,"Unfortunately for you, your futile blow attracts their attention, and"],
[745,"they manage to dispatch you effortlessly."],
[746,"The statues are impassive."],
[747,"The dungeon master is taken momentarily by surprise.  He dodges your"],
[747,"blow and then, with a disappointed expression on his face, he raises"],
[747,"his staff and traces a complicated pattern in the air.  As it"],
[747,"completes you crumble into dust."],
[748,"\"I'm willing to accompany you, but not to ride in your pocket!\""],
[749,"The pole is now slightly above the floor."],
[750,"The pole cannot be raised further."],
[751,"The pole cannot be lowered further."],
[752,"The pole is lowered into the channel."],
[753,"The pole is lowered into the stone hole."],
[754,"The pole is already resting on the floor."],
[755,"The pole now rests on the stone floor."],
[756,"The button becomes depressed."],
[757,"The button pops back out."],
[758,"The button is already depressed."],
[759,"No doubt you have a bottle of moonbeams as well."],
[760,"The beam is now interrupted by a # lying on the floor."],
[761,"You can't break the beam with a #."],
[762,"The # already breaks the beam."],
[763,"I see no bronze door here."],
[764,"The bronze door opens."],
[765,"The bronze door closes."],
[766,"On the other size of the door is a narrow passage which opens out"],
[766,"into a larger area."],
[767,"The door won't budge."],
[768,"The knock reverberates along the hall.  For a time it seems there"],
[768,"will be no answer.  Then you hear someone unlatching the small wooden"],
[768,"panel.  Through the bars of the great door, the wrinkled face of an"],
[768,"old man appears.  He gazes down at you and intones as follows:"],
[768,"   \"I am the master of the dungeon, whose task it is to insure"],
[768,"that none but the most scholarly and masterful adventurers are"],
[768,"admitted into the secret realms of the dungeon.  To ascertain whether"],
[768,"you meet the stringent requirements laid down by the Great"],
[768,"Implementers, I will ask three questions which should be easy for"],
[768,"one of your reputed excellence to answer.  You have undoubtedly"],
[768,"discovered the answers during your travels through the dungeon."],
[768,"Should you answer each of these questions correctly within five"],
[768,"attempts, then I am obliged to acknowledge your skill and daring and"],
[768,"admit you to these regions."],
[768,"   \"All answers should be in the form 'ANSWER, <answer>'.\""],
[769,"The booming voice asks:"],
[770,"\"From which room can one enter the robber's hideaway without passing"],
[770,"through the cyclops room?\""],
[771,"\"Beside the Temple, to which room is it possible to go from the Altar?\""],
[772,"\"What is the absolute minimum specified value of the Zorkmid"],
[772,"treasures, in Zorkmids?\""],
[773,"\"What object is of use in determining the function of the iced cakes?\""],
[774,"\"What can be done to the mirror that is useful?\""],
[775,"\"The taking of which object offends the ghosts?\""],
[776,"\"What object in the dungeon is haunted?\""],
[777,"\"In which room is the phrase 'Hello sailor' useful?\""],
[778,"The door is securely fastened."],
[779,"The wooden door opens."],
[780,"The wooden door closes."],
[781,"The dungeon master says, \"I will stay.\""],
[782,"The dungeon master says, \"I will follow.\""],
[783,"There is no reply."],
[784,"\"I prefer to stay where I am, thank you.\""],
[785,"\"I am not permitted to enter the prison cell.\""],
[786,"\"I cannot perform that action for you.\""],
[787,"This gives you the rank of Dungeon Master."],
[788,"This gives you the rank of Super Cheater."],
[789,"This gives you the rank of Master Cheater."],
[790,"This gives you the rank of Advanced Cheater."],
[791,"This gives you the rank of Cheater."],
[792,"You are in the Tomb of the Unknown Implementer.  A hollow voice"],
[792,"says, \"That's not a bug, it's a feature!\""],
[792,"In the north wall of the room is the Crypt of the Implementers.  It"],
[792,"is made of the finest marble and is apparently large enough for four"],
[792,"headless corpses.  The crypt is #.  Above the entrance is the"],
[792,"cryptic inscription:"],
[792,""],
[792,"         \"Feel Free\"."],
[793,"The door of the crypt is extremely heavy, but it opens easily."],
[794,"The crypt is already open."],
[795,"The crypt is already closed."],
[796,"The crypt is closed."],
[797,"The dial spins and comes to a stop pointing at \"#\"."],
[798,"There is no answer."],
[799,"No one seems to be listening."],
[800,"The dungeon master says, \"Excellent.\""],
[801,"The dungeon master says, \"You are wrong.  You have four more chances.\""],
[802,"The dungeon master says, \"You are wrong.  You have three more chances.\""],
[803,"The dungeon master says, \"You are wrong.  You have two more chances.\""],
[804,"The dungeon master says, \"You are wrong.  You have one more chance.\""],
[805,"The mirror is closed."],
[806,"You must specify what to set the dial to."],
[807,"The dial face contains only numbers."],
[808,"The dial now points to \"#\"."],
[809,"The button depresses with a slight click and pops back."],
[810,"The cell door is now closed."],
[811,"You notice that the dungeon master does not follow."],
[812,"The dungeon master catches up with you."],
[813,"The dungeon master follows you."],
[814,"There is a wooden wall blocking your way."],
[815,"There is a large mirror blocking your way."],
[816,"There is a large broken mirror blocking your way."],
[817,"The structure blocks your way."],
[818,"As you leave, the door swings shut."],
[819,"You are in a narrow room whose west wall is a large mirror."],
[820,"You are in a narrow room whose east wall is a large mirror."],
[821,"You are in a narrow room whose west wall is a large wooden panel"],
[821,"which once contained a mirror."],
[822,"You are in a narrow room whose east wall is a large wooden panel"],
[822,"which once contained a mirror."],
[823,"The mirror is mounted on a panel which has been opened outward."],
[824,"The panel has been opened outward."],
[825,"The opposite wall is solid rock."],
[826,"The dungeon master says, \"You are wrong.\"  The dungeon master,"],
[826,"obviously disappointed in your lack of knowledge, shakes his head"],
[826,"and mumbles, \"I guess they'll let anyone in the dungeon these days.\""],
[826,"With that, he departs."],
[827,"The dungeon master, obviously pleased, says, \"You are indeed a"],
[827,"master of lore.  I am proud to be at your service.\"  The massive"],
[827,"wooden door swings open, and the master motions for you to enter."],
[828,"Saves are not permitted during the endgame."],
[829,"Restores are not permitted during the endgame."],
[830,"The structure rotates clockwise."],
[831,"The structure rotates counterclockwise."],
[832,"I can't see a mirror here."],
[833,"I don't see any way to open the mirror here."],
[834,"The mirror breaks, revealing a panel behind it."],
[835,"The mirror has already been broken."],
[836,"The mirror is mounted on a wooden panel which moves slightly inward"],
[836,"as you push and back out as you let go.  The mirror feels rather"],
[836,"fragile."],
[837,"The mirror is unyielding but seems rather fragile."],
[838,"I can't see a panel here."],
[839,"I don't see any way to open the panel here."],
[840,"To break the panel you would have to break the mirror first."],
[841,"The panel is not that easily destroyed."],
[842,"The wooden panel moves slightly inward as you push and back out"],
[842,"when you let go."],
[843,"The panel is unyielding."],
[844,"A disheveled adventurer stares back at you."],
[845,"The mirror is broken into little pieces."],
[846,"Shards of a broken mirror are dangerous to play with."],
[847,"The # side of the room is divided by a wooden wall into small"],
[848,"hallways to the #east and #west."],
[849,"A large mirror fills the # side of the hallway."],
[850,"A large panel fills the # side of the hallway."],
[851,"The shattered pieces of a mirror cover the floor."],
[852,"The corridor continues north."],
[853,"The corridor continues south."],
[854,"The corridor continues north and south."],
[855,"Incantations are useless once you have gotten this far."],
[856,"That incantation seems to have been a failure."],
[857,"Sorry, only one incantation to a customer."],
[858,"That spell has no obvious effect."],
[859,"As the last syllable of your spell fades into silence, darkness"],
[859,"envelops you, and the earth shakes.  Then all is quiet."],
[860,"The structure won't budge."],
[861,"You are in a room with an exit to the north and a steel door to the east."],
[862,"You are in a room with an exit to the north and a passage to the east."],
[863,"The card slides easily into the slot and vanishes, and the steel"],
[863,"door slides open, revealing a passageway to the west.  A moment"],
[863,"later, a previously unseen sign flashes:"],
[863,"   \"Unauthorized/Illegal Use of Pass Card -- Card Confiscated\""],
[864,"The item vanishes into the slot.  A moment later, a previously"],
[864,"unseen sign flashes \"Garbage In, Garbage Out\".  The #,"],
[864,"now atomized, spews through the slot."],
[865,"I can't see any ladder here."],
[866,"Come, come!"],
[867,"You hit your head on the ceiling and fall off the ladder."],
[868,"You are in a small square room bounded to the north and west with"],
[868,"marble walls and to the east and south with sandstone walls."],
[869,"It appears the thief was correct."],
[870,"In the ceiling above you is a large circular opening."],
[871,"The center of the floor is noticeably depressed here."],
[872,"The west wall here has a large steel door at its center.  On one side"],
[872,"of the door is a small slit."],
[873,"The west wall here has a large opening at its center.  On one side"],
[873,"of the opening in a small slit."],
[874,"There is a ladder here, firmly attached to the east wall."],
[875,"There is a ladder here, firmly attached to the west wall."],
[876,"There is only a passage in that direction."],
[877,"The wall does not budge."],
[878,"The wall slides forward and you follow it..."],
[878,"The architecture of this region is getting complex, so that further"],
[878,"descriptions will be diagrams of the immediate vicinity in a 3x3"],
[878,"grid.  The walls here are rock, but of two different types - sandstone"],
[878,"and marble.  The following notations will be used:"],
[878,"                   ..  = current position (middle of grid)"],
[878,"                   MM  = marble wall"],
[878,"                   SS  = sandstone wall"],
[878,"                   ??  = unknown (blocked by walls)."],
[879,"The wall slides forward and you follow it to the following position:"],
[880,"Your position is as follows:"],
[881,"The exit is too far above your head."],
[882,"With the help of the ladder, you exit the puzzle."],
[883,"Don't be lazy, type the command yourself."],
[884,"In the MDL sources, NOOBJ is described as a \"hack\".  As we are"],
[884,"above such practices, NOOBJ is not implemented."],
[885,"The grating closes."],
[1,"Your swing misses the # by an inch."],
[2,"A mightly blow, but it misses the # by a mile."],
[3,"You charge, but the # jumps nimbly aside."],
[4,"Clang!  Crash!  The # parries."],
[5,"A good stroke, but it's too slow, the # dodges."],
[6,"Your sword crashes down, knocking the # into dreamland."],
[7,"The # is battered into unconsciousness."],
[8,"A furious exchange, and the # is knocked out."],
[9,"It's curtains for the # as your sword removes his head."],
[10,"The fatal blow strikes the # square in the heart:  he dies."],
[11,"The # takes a final blow and slumps to the floor dead."],
[12,"The # is struck on the arm, blood begins to trickle down."],
[13,"Your sword pinks the # on the wrist, but it's not serious."],
[14,"Your stroke lands, but it was only the flat of the blade."],
[15,"The blow lands, making a shallow gash in the #'s arm."],
[16,"The # receives a deep gash in his side."],
[17,"A savage blow on the thigh!  The # is stunned but can still fight."],
[18,"Slash!  Your blow lands!  That one hit an artery, it could be serious!"],
[19,"The # is staggered and drops to his knees."],
[20,"The # is momentarily disoriented and can't fight back."],
[21,"The force of your blow knocks the # back, stunned."],
[22,"The #'s weapon is knocked to the floor, leaving him unarmed."],
[23,"Your stab misses the # by an inch."],
[24,"A good slash, but it misses the # by a mile."],
[25,"You charge, but the # jumps nimbly aside."],
[26,"A quick stroke, but the # is on guard."],
[27,"A good stroke, but it's too slow, the # dodges."],
[28,"The haft of your blade knocks out the #."],
[29,"The # drops to his knees, unconscious."],
[30,"The # is knocked out!"],
[31,"It's the end for the # as your knife severs his jugular."],
[32,"The fatal thrust strikes the # square in the heart."],
[33,"The # takes a final blow and slumps to the floor dead."],
[34,"The # is slashed on the arm, blood begins to trickle down."],
[35,"Your knife point pinks the # on the wrist, but it's not serious."],
[36,"Your stroke lands, but it was only the flat of the blade."],
[37,"The blow lands, making a shallow gash in the #'s arm."],
[38,"The # receives a deep gash in his side."],
[39,"A savage cut on the leg stuns the #, but he can still fight."],
[40,"Slash!  Your stroke connects!  The # could be in serious trouble!"],
[41,"The # drops to his knees, staggered."],
[42,"The # is confused and can't fight back."],
[43,"The quickness of your thrust knocks the # back, staggered."],
[44,"The # is disarmed by a subtle feint past his guard."],
[45,"The cyclops misses, but the backwash almost knocks you over."],
[46,"The cyclops rushes you but runs into the wall."],
[47,"The cyclops trips over his feet trying to get at you."],
[48,"The cyclops unleashes a roundhouse punch, but you have time to dodge."],
[49,"The cyclops knocks you unconscious."],
[50,"The cyclops sends you crashing to the floor, unconscious."],
[51,"The cyclops raises his arms and crushes your skull."],
[52,"The cyclops has just essentially ripped you to shreds."],
[53,"The cyclops decks you.  In fact, you are dead."],
[54,"The cyclops breaks your neck with a massive smash."],
[55,"A quick punch, but it was only a glancing blow."],
[56,"The cyclops grabs but you twist free, leaving part of your cloak."],
[57,"A glancing blow from the cyclops' fist."],
[58,"The cyclops chops at you with the side of his hand and connects, but"],
[58,"not solidly."],
[59,"The cyclops gets a good grip and breaks your arm."],
[60,"The cyclops knocks the wind out of you with a quick punch."],
[61,"The cyclops smashes his huge fist into your chest, breaking several ribs."],
[62,"A flying drop kick breaks your jaw."],
[63,"The cyclops breaks your leg with a staggering blow."],
[64,"The cyclops knocks you silly, and you reel back."],
[65,"The cyclops grabs you and almost strangles you before you wiggle free,"],
[65,"breathless."],
[66,"Heedless of your weapons, the cyclops tosses you against the rock"],
[66,"wall of the room."],
[67,"The cyclops lands a punch that knocks the wind out of you."],
[68,"The cyclops grabs you by the arm, and you drop your #."],
[69,"The cyclops kicks your # out of your hand."],
[70,"The monster grabs you on the wrist, squeezes, and you drop"],
[70,"your # in pain."],
[71,"The cyclops grabs your #, tastes it, and throws it to the"],
[71,"ground in disgust."],
[72,"The cyclops is so excited by his success that he neglects to kill you."],
[73,"The cyclops, momentarily overcome by remorse, holds back."],
[74,"The cyclops seems unable to decide whether to broil or stew his dinner."],
[75,"The cyclops, no sportsman, dispatches his unconscious victim."],
[76,"The troll swings his axe, but it misses."],
[77,"The troll's axe barely misses your ear."],
[78,"The axe sweeps past you as you jump aside."],
[79,"The axe crashes against the rock, throwing sparks."],
[80,"The flat of the troll's axe hits you delicately on the head, knocking"],
[80,"you out."],
[81,"The troll lands a killing blow.  You are dead."],
[82,"The troll neatly removes your head."],
[83,"The troll's axe cleaves you from the nave to the chops."],
[84,"The troll's axe bashes in your skull."],
[85,"The axe gets you right in the side.  Ouch!"],
[86,"The flat of the troll's axe skins across your forearm."],
[87,"The troll's swing almost knocks you over as you barely parry in time."],
[88,"The troll swings his axe, and it nicks your arm as you dodge."],
[89,"The troll charges, and his axe slashes you on your # arm."],
[90,"The troll's axe swings down, gashing your shoulder."],
[91,"An axe stroke makes a deep wound in your leg."],
[92,"The troll sees a hole in your defense, and a lightning stroke opens a"],
[92,"deep wound in your left side."],
[93,"The troll hits you with a glancing blow, and you are momentarily stunned."],
[94,"The troll swings.  The blade turns on your armor but crashes broadside"],
[94,"into your head."],
[95,"You stagger back under a hail of strokes."],
[96,"The troll's mighty blow drops you to your knees."],
[97,"The axe hits your # and sends it spinning."],
[98,"The troll swings.  You parry, but the force of his blow disarms you."],
[99,"The axe knocks your # out of your hand.  It falls to the floor."],
[100,"You parry the blow, but your # is knocked from your hand."],
[101,"The troll strikes at your unconscious form but misses in his rage."],
[102,"The troll hesitates, fingering his axe."],
[103,"The troll scratches his head ruminatively.  Might you be magically"],
[103,"protected, he wonders?"],
[104,"The troll seems afraid to approach your crumpled form."],
[105,"Conquering his fears, the troll puts you to death."],
[106,"The thief stabs nonchalantly with his stilletto and misses."],
[107,"You dodge as the thief comes in low."],
[108,"You parry a lightning thrust, and the thief salutes you with a"],
[108,"grim nod."],
[109,"The thief tries to sneak past your guard, but you twist away."],
[110,"Shifting in the midst of a thrust, the thief knocks you unconscious"],
[110,"with the haft of his stilletto."],
[111,"The thief knocks you out."],
[112,"Finishing you off, a lightning throw right to the heart."],
[113,"The stilletto severs your jugular.  It looks like the end."],
[114,"The thief comes in from the side, feints, and slips the blade"],
[114,"between your ribs."],
[115,"The thief bows formally, raises his stilletto, and with a wry grin"],
[115,"ends the battle and your life."],
[116,"A quick thrust pinks your left arm, and blood starts to trickle"],
[116,"down."],
[117,"Raking his stilletto across your arm, the thief draws blood."],
[118,"The stilletto flashes faster than you can follow, and blood"],
[118,"wells from your leg."],
[119,"The thief slowly approaches, strikes like a snake, and leaves you"],
[119,"wounded."],
[120,"The thief strikes like a snake!  The resulting wound is serious."],
[121,"The thief stabs a deep cut in your upper arm."],
[122,"The stilletto touches your forehead, and the welling blood obscures"],
[122,"your vision."],
[123,"The thief strikes at your wrist, and suddenly your grip is slippery"],
[123,"with blood."],
[124,"The butt of his stilletto cracks you on the skull, and you stagger back."],
[125,"You are forced back and trip over your own feet, falling heavily to"],
[125,"the floor."],
[126,"The thief rams the haft of his blade into your stomach, leaving you"],
[126,"out of breath."],
[127,"The thief attacks, and you fall back desperately."],
[128,"A long theatrical slash.  You parry it desperately, but the thief"],
[128,"twists his knife, and your # goes flying."],
[129,"The thief neatly flips your # out of your hands, and it drops to the"],
[129,"floor."],
[130,"You parry a low thrust, and your # slips out of your hand."],
[131,"Avoiding the thief's stilletto, you stumble to the floor, dropping"],
[131,"your #."],
[132,"The thief, a man of good breeding, refrains from attacking a helpless"],
[132,"opponent."],
[133,"The thief amuses himself by searching your pockets."],
[134,"The thief entertains himself by rifling your pack."],
[135,"The thief, noticing you beginning to stir, reluctantly finishes you off."],
[136,"The thief, forgetting his essentially genteel upbringing, cuts your"],
[136,"throat."],
[137,"The thief, who is essentially a pragmatist, dispatches you as a threat"],
[137,"to his livelihood."],
[1,"You are in a narrow east-west passageway.  There is a narrow staircase"],
[1,"leading down at the north end of the room."],
[2,"You are in an open field west of a big white house with a boarded"],
[2,"front door."],
[3,"You are facing the north side of a white house.  There is no door here,"],
[3,"and all the windows are barred."],
[4,"You are facing the south side of a white house.  There is no door here,"],
[4,"and all the windows are barred."],
[7,"You are in the attic.  The only exit is stairs that lead down."],
[10,"You are in a small room with passages off in all directions."],
[10,"Bloodstains and deep scratches (perhaps made by an axe) mar the walls."],
[11,"You are in a maze of twisty little passages, all alike."],
[12,"You are in a maze of twisty little passages, all alike."],
[13,"You are in a maze of twisty little passages, all alike."],
[14,"You are in a maze of twisty little passages, all alike."],
[15,"Dead end."],
[16,"You are in a maze of twisty little passages, all alike."],
[17,"Dead end."],
[18,"You are in a maze of twisty little passages, all alike."],
[19,"You are in a maze of twisty little passages, all alike."],
[20,"You are in a maze of twisty little passages, all alike."],
[21,"Dead end."],
[22,"You are in a maze of twisty little passages, all alike."],
[23,"You are in a maze of twisty little passages, all alike."],
[24,"You are in a maze of twisty little passages, all alike."],
[26,"You are in a maze of twisty little passages, all alike."],
[27,"Dead end."],
[28,"You are in a maze of twisty little passages, all alike."],
[29,"You are in a maze of twisty little passages, all alike."],
[30,"You are in a maze of twisty little passages, all alike."],
[31,"You are in a forest, with trees in all directions around you."],
[32,"You are in a dimly lit forest, with large trees all around.  To the"],
[32,"east, there appears to be sunlight."],
[33,"You are in a dimly lit forest, with large trees all around.  One"],
[33,"particularly large tree with some low branches stands here."],
[34,"You are in a large forest, with trees obstructing all views except"],
[34,"to the east, where a small clearing may be seen."],
[35,"You are in a forest, with trees in all directions around you."],
[37,"You are in a deep ravine at a crossing with an east-west crawlway."],
[37,"Some stone steps are at the south of the ravine and a steep staircase"],
[37,"descends."],
[38,"You are in a crawlway with a three foot high ceiling.  Your footing"],
[38,"is very unsure here due to the assortment of rocks undefoot.  Passages"],
[38,"can be seen in the east, west, and northwest corners of the crawlway."],
[42,"You are standing on a path beside a gently flowing stream.  The path"],
[42,"travels to the north and the east."],
[43,"You are on the gently flowing stream.  The upstream route is too narrow"],
[43,"to navigate, and the downstream route is invisible due to twisting"],
[43,"walls.  There is a narrow beach to land on."],
[44,"You are in a room which looks like an Egyptian tomb.  There is an"],
[44,"ascending staircase in the room as well as doors east and south."],
[46,"You are in a small chamber behind the remains of the great glacier."],
[46,"To the south and west are small passageways."],
[47,"You are in an ancient room, long buried by the reservoir.  There are"],
[47,"exits to the southeast and upward."],
[48,"You are on the south edge of a deep canyon.  Passages lead off"],
[48,"to the east, south, and northwest.  You can hear the sound of"],
[48,"flowing water below."],
[49,"You are in a large room with a ceiling which cannot be detected from"],
[49,"the ground.  There is a narrow passage from east to west and a stone"],
[49,"stairway leading upward.  The room is extremely noisy.  In fact, it"],
[49,"is difficult to hear yourself think."],
[52,"You are in a small cave with an entrance to the north and a stairway"],
[52,"leading down."],
[53,"You are in a tiny cave with entrances west and north, and a dark,"],
[53,"forbidding staircase leading down."],
[54,"You are in a steep and narrow crawlway.  There are two exits nearby to"],
[54,"the south and southwest."],
[55,"You are in a narrow crawlway.  The crawlway leads from north to south,"],
[55,"However, the south passage divides to the south and southwest."],
[56,"You are in a cold and damp corridor where a long east-west passageway"],
[56,"intersects with a northward path."],
[57,"You are in a winding passage.  It seems that there is only an exit"],
[57,"on the east end, although the whirring from the round room can be"],
[57,"heard faintly to the north."],
[58,"You are in a small chamber, which appears to have been part of a"],
[58,"coal mine.  On the south wall of the chamber the letters \"GRANITE"],
[58,"WALL\" are etched in the rock.  To the east is a long passage, and"],
[58,"there is a steep metal slide twisting downward.  From the appearance"],
[58,"of the slide, an attempt to climb up it would be impossible.  To the"],
[58,"north is a small opening."],
[59,"You are standing at the entrance of what might have been a coal"],
[59,"mine.  To the northeast and the northwest are entrances to the mine,"],
[59,"and there is another exit on the south end of the room."],
[60,"You are in a small room.  Strange squeaky sounds may be hear coming"],
[60,"from the passage at the west end.  You may also escape to the south."],
[61,"You are in a large room, in the middle of which is a small shaft"],
[61,"descending through the floor into darkness below.  To the west and"],
[61,"the north are exits from this room.  Constructed over the top of the"],
[61,"shaft is a metal framework to which a heavy iron chain is attached."],
[62,"You are in a narrow tunnel with large wooden beams running across"],
[62,"the ceiling and around the walls.  A path from the south splits into"],
[62,"paths running west and northeast."],
[63,"You are in a small non-descript room.  However, from the direction"],
[63,"of a small descending staircase a foul odor can be detected.  To the"],
[63,"east is a narrow path."],
[64,"You are in a small room which smells strongly of coal gas."],
[65,"You are in a very small room.  In the corner is a rickety wooden"],
[65,"ladder, leading downward.  It might be safe to descend.  There is"],
[65,"also a staircase leading upward."],
[66,"You are in a non-descript part of a coal mine."],
[67,"You are in a non-descript part of a coal mine."],
[68,"You are in a non-descript part of a coal mine."],
[69,"You are in a non-descript part of a coal mine."],
[70,"You are in a non-descript part of a coal mine."],
[71,"You are in a non-descript part of a coal mine."],
[72,"You are in a non-descript part of a coal mine."],
[73,"You are in a rather wide room.  On one side is the bottom of a"],
[73,"narrow wooden ladder.  To the northeast and the south are passages"],
[73,"leaving the room."],
[74,"Dead end."],
[75,"You are in a long and narrow passage, which is cluttered with broken"],
[75,"timbers.  A wide passage comes from the north and turns at the"],
[75,"southwest corner of the room into a very narrow passageway."],
[76,"You are in a small square room which is at the bottom of a long"],
[76,"shaft.  To the east is a passageway and to the northeast a very narrow"],
[76,"passage.  In the shaft can be seen a heavy iron chain."],
[81,"You are in a north-south crawlway;  a passage also goes to the east."],
[81,"There is a hole above, but it provides no opportunities for climbing."],
[82,"You are on the west edge of a chasm, the bottom of which cannot be"],
[82,"seen.  The east side is sheer rock, providing no exits.  A narrow"],
[82,"passage goes west.  The path you are on continues to the north and south."],
[84,"You are in a high north-south passage, which forks to the northeast."],
[85,"A chasm runs southwest to northeast.  You are on the south edge.  The"],
[85,"path exits to the south and to the east."],
[86,"You are in a cave.  Passages exit to the south and to the east, but"],
[86,"the cave narrows to a crack to the west.  The earth is particularly"],
[86,"damp here."],
[87,"A chasm, evidently produced by an ancient river, runs through the"],
[87,"cave here.  Passages lead off in all directions."],
[88,"Dead end."],
[89,"Dead end."],
[90,"You have entered a cave with passages leading north and southeast."],
[91,"This is a room which is bare on all sides.  There is an exit down."],
[91,"To the east is a great door made of stone.  Above the door, the"],
[91,"following words are written:  \"No man shall enter this room without"],
[91,"solving this riddle--"],
[91,"   What is tall as a house,"],
[91,"   Round as a cup,"],
[91,"   And all the king's horses can't draw it up?\"."],
[92,"This is a former broom closet.  The exits are to the east and west."],
[95,"You are standing in a small circular room with a pedestal.  A set of"],
[95,"stairs leads up, and passages leave the the east and west."],
[96,"You are in the west end of a large temple.  On the south wall is an"],
[96,"ancient inscription, probably a prayer in a long-forgotten language."],
[96,"The north wall is solid granite.  The entrance at the west end of the"],
[96,"room is through huge marble pillars."],
[97,"You are in the east end of a large temple.  In front of you is what"],
[97,"appears to be an altar."],
[99,"This room appears to have been the waiting room for groups touring"],
[99,"the dam.  There are exits here to the north and east marked"],
[99,"\"PRIVATE\", though the doors are open, and an exit to the south."],
[100,"You are in what appears to have been the maintenance room for flood"],
[100,"control dam #3, judging by the assortment of tool chests around the"],
[100,"room.  Apparently, this room has been ransacked recently, for most of"],
[100,"the valuable equipment is gone.  On the wall in front of you is a"],
[100,"panel of buttons, which are labelled in EBCDIC.  However, they are of"],
[100,"different colors:  blue, yellow, brown, and red.  The doors to this"],
[100,"room are in the west and south ends."],
[102,"You are in a long passage.  To the south is one entrance.  On the"],
[102,"east there is an old wooden door with a large hole in it (about"],
[102,"cyclops sized)."],
[103,"This is a large room, whose north wall is solid granite.  A number"],
[103,"of discarded bags, which crumble at your touch, are scattered about"],
[103,"on the floor.  There is an exit down and what appears to be a newly"],
[103,"created passage to the east."],
[104,"You are in what appears to have been an artist's studio.  The walls"],
[104,"and floors are splattered with paints of 69 different colors."],
[104,"Strangely enough, nothing of value is hanging here.  At the north and"],
[104,"northwest of the room are open doors (also covered with paint).  An"],
[104,"extremely dark and narrow chimney leads up from a fireplace.  Although"],
[104,"you might be able to get up the chimney, it seems unlikely that you"],
[104,"could get back down."],
[105,"You are in an art gallery.  Most of the paintings which were here"],
[105,"have been stolen by vandals with exceptional taste.  The vandals"],
[105,"left through the north, south, or west exits."],
[106,"You are at the base of flood control dam #3, which looms above you"],
[106,"and to the north.   The Frigid River is flowing by here.  Across the"],
[106,"river are the white cliffs, which seem to form a giant wall stretching"],
[106,"from north to south along the east shore of the river as it winds its"],
[106,"way downstream."],
[107,"You are on the Frigid River in the vicinity of the dam.  The river"],
[107,"flows quietly here.  There is a landing on the west shore."],
[108,"The river turns a corner here making it impossible to see the"],
[108,"dam.  The white cliffs loom on the east bank, and large rocks"],
[108,"prevent landing on the west."],
[109,"The river descends here into a valley.  There is a narrow beach on"],
[109,"the east below the cliffs, and there is some shore on the west which"],
[109,"may be suitable.  In the distance a faint rumbling can be heard."],
[110,"You are on a narrow strip of beach which runs along the base of the"],
[110,"white cliffs.  The only path here is a narrow one, heading south"],
[110,"along the cliffs."],
[111,"You are on a rocky, narrow strip of beach beside the cliffs.  A"],
[111,"narrow path leads north along the shore."],
[112,"The river is running faster here, and the sound ahead appears to be"],
[112,"that of rushing water.  On the west shore is a sandy beach.  A small"],
[112,"area of beach can also be seen below the cliffs."],
[113,"The sound of rushing water is nearly unbearable here.  On the west"],
[113,"shore is a large landing area."],
[115,"You are on the shore of the river.  The river here seems somewhat"],
[115,"treacherous.  A path travels from north to south here, the south end"],
[115,"quickly turning around a sharp corner."],
[116,"You are on a large sandy beach at the shore of the river, which is"],
[116,"flowing quickly by.  A path runs beside the river to the south here."],
[117,"You are on the west shore of the river.  An entrance to a cave is"],
[117,"to the northwest.  The shore is very rocky here."],
[118,"You are in a small cave whose exits are on the south and northwest."],
[119,"You are in a barrel.  Congratulations.  Etched into the side of the"],
[119,"barrel is the word \"GERONIMO!\"."],
[121,"You are on top of a rainbow (I bet you never thought you would walk"],
[121,"on a rainbow), with a magnificent view of the falls.  The rainbow"],
[121,"travels east-west here."],
[122,"You are on a small beach on the continuation of the Frigid River"],
[122,"past the falls.  The beach is narrow due to the presence of the white"],
[122,"cliffs.  The river canyon opens here, and sunlight shines in from"],
[122,"above.  A rainbow crosses over the falls to the west, and a narrow path"],
[122,"continues to the southeast."],
[123,"You are beneath the walls of the river canyon, which may be climbable"],
[123,"here.  There is a small stream here, which is the lesser part of the"],
[123,"runoff of Aragain Falls.  To the north is a narrow path."],
[124,"You are on a ledge about halfway up the wall of the river canyon."],
[124,"You can see from here that the main flow from Aragain Falls twists"],
[124,"along a passage which it is impossible to enter.  Below you is the"],
[124,"canyon bottom.  Above you is more cliff, which still appears"],
[124,"climbable."],
[125,"You are at the top of the great canyon on its south wall. From here"],
[125,"there is a marvelous view of the canyon and parts of the Frigid River"],
[125,"upstream.  Across the canyon, the walls of the white cliffs still"],
[125,"appear to loom far above.  Following the canyon upstream (north and"],
[125,"northwest), Aragain Falls may be seen, complete with rainbow."],
[125,"Fortunately, my vision is better than average, and I can discern the"],
[125,"top of flood control dam #3 far to the distant north.  To the"],
[125,"west and south can be seen an immense forest, stretching for miles"],
[125,"around.  It is possible to climb down into the canyon from here."],
[126,"You are at the bottom of a large dormant volcano.  High above you"],
[126,"light may be seen entering from the cone of the volcano.  The only"],
[126,"exit here is to the north."],
[127,"You are about one hundred feet above the bottom of the volcano.  The"],
[127,"top of the volcano is clearly visible here."],
[128,"You are about two hundred feet above the volcano floor.  Looming"],
[128,"above is the rim of the volcano.  There is a small ledge on the"],
[128,"west side."],
[129,"You are high above the floor of the volcano.  From here the rim of"],
[129,"the volcano looks very narrow, and you are quite near it.  To the"],
[129,"east is what appears to be a viewing ledge, too thin to land on."],
[130,"You are near the rim of the volcano, which is only about fifteen feet"],
[130,"across.  To the west, there is a place to land with a wide ledge."],
[131,"You are on a narrow ledge overlooking the inside of an old dormant"],
[131,"volcano.  This ledge appears to be about in the middle between the"],
[131,"floor below and the rim above.  There is an exit here to the south."],
[132,"You are on a ledge in the middle of a large volcano.  Below you"],
[132,"the volcano bottom can be seen and above is the rim of the volcano."],
[132,"A couple of ledges can be seen on the other side of the volcano;"],
[132,"it appears that this ledge is intermediate in elevation between"],
[132,"those on the other side.  The exit from this room is to the east."],
[134,"You are in a room which must have been a large library, probably"],
[134,"for the royal family.  All of the shelves appear to have been gnawed"],
[134,"to pieces by unfriendly gnomes.  To the north is an exit."],
[136,"You are in a small room, whose walls are formed by an old lava flow."],
[136,"There are exits here to the west and the south."],
[139,"You are in a large room full of assorted heavy machinery.  The room"],
[139,"smells of burned resistors.  The room is noisy from the whirring"],
[139,"sounds of the machines.  Along one wall of the room are three buttons"],
[139,"which are, respectively, round, triangular, and square.  Naturally,"],
[139,"above the buttons are instructions written in EBCDIC.  A large sign"],
[139,"above all the buttons says in English:"],
[139,""],
[139,"             DANGER:  HIGH VOLTAGE"],
[139,""],
[139,"There are exits to the west and the south."],
[140,"You are in a dingy closet adjacent to the machine room.  On one wall"],
[140,"is a small sticker which reads:"],
[140,""],
[140,"           Protected by"],
[140,"             FROBOZZ"],
[140,"       Magic Alarm Company"],
[140,"          (Hello, footpad!)."],
[141,"You are trapped inside an steel cage."],
[142,"You are at the top of the well.  Well done.  There are etchings on"],
[142,"the side of the well.  There is a small crack across the floor at the"],
[142,"entrance to a room on the east, but it can be crossed easily."],
[143,"You are in a damp circular room, whose walls are made of brick and"],
[143,"mortar.  The roof of this room is not visible, but there appear to be"],
[143,"some etchings on the walls.  There is a passageway to the west."],
[144,"You are in a small square room, in the center of which is a large"],
[144,"oblong table, no doubt set for afternoon tea.  It is clear from the"],
[144,"objects on the table that the users were indeed mad.  In the eastern"],
[144,"corner of this room is a small hole no more than four inches high."],
[144,"There are passageways leading away to the west and the northwest."],
[145,"You are in an enormous room, in the center of which are four wooden"],
[145,"posts delineating a rectangular area, above which is what appears to"],
[145,"be a wooden roof.  In fact, all objects in this room appear to be"],
[145,"abnormally large.  To the east is a passageway.  There is a large"],
[145,"chasm on the west and the northwest."],
[146,"You are in a large room, one half of which is depressed.  There is a"],
[146,"large leak in the ceiling through which brown colored goop is"],
[146,"falling.  The only exit from this room is to the west."],
[148,"You are in the large entrance hall of the Bank of Zork, the largest"],
[148,"banking institution of the Great Underground Empire.  A partial"],
[148,"account of its history is in \"The Lives of the Twelve Flatheads\" with"],
[148,"the chapter on J. Pierpont Flathead.  A more detailed history (albeit"],
[148,"less objective) may be found in Flathead's outrageous autobiography"],
[148,"\"I'm Rich and You Aren't - So There!\"."],
[148,"Most of the furniture has been ravaged by passing scavengers.  All"],
[148,"that remains are two signs at the northwest and northeast corners of"],
[148,"the room, which say"],
[148,""],
[148,"   <-- WEST VIEWING ROOM        EAST VIEWING ROOM -->"],
[149,"You are in a small square room, which was used by a bank officer"],
[149,"whose job it was to retrieve safety deposit boxes for the customer."],
[149,"On the north side of the room is a sign which reads \"Viewing Room\"."],
[149,"On the west side of the room, above an open door, is a sign reading"],
[149,""],
[149,"            BANK PERSONNEL ONLY"],
[150,"You are in a small square room, which was used by a bank officer"],
[150,"whose job it was to retrieve safety deposit boxes for the customer."],
[150,"On the north side of the room is a sign which reads \"Viewing Room\"."],
[150,"On the east side of the room, above an open door, is a sign reading"],
[150,""],
[150,"            BANK PERSONNEL ONLY"],
[151,"You are in a room used by holders of safety deposit boxes to view"],
[151,"their contents.  On the north size of the room is a sign which says"],
[151,""],
[151,"   REMAIN HERE WHILE THE BANK OFFICER RETRIEVES YOUR DEPOSIT BOX"],
[151,"    WHEN YOU ARE FINISHED, LEAVE THE BOX, AND EXIT TO THE SOUTH"],
[151,"     AN ADVANCED PROTECTIVE DEVICE PREVENTS ALL CUSTOMERS FROM"],
[151,"      REMOVING ANY SAFETY DEPOSIT BOX FROM THIS VIEWING AREA!"],
[151,"               Thank you for banking at the Zork!"],
[152,"You are in a room used by holders of safety deposit boxes to view"],
[152,"their contents.  On the north size of the room is a sign which says"],
[152,""],
[152,"   REMAIN HERE WHILE THE BANK OFFICER RETRIEVES YOUR DEPOSIT BOX"],
[152,"    WHEN YOU ARE FINISHED, LEAVE THE BOX, AND EXIT TO THE SOUTH"],
[152,"     AN ADVANCED PROTECTIVE DEVICE PREVENTS ALL CUSTOMERS FROM"],
[152,"      REMOVING ANY SAFETY DEPOSIT BOX FROM THIS VIEWING AREA!"],
[152,"               Thank you for banking at the Zork!"],
[153,"You are in a small bare room with no distinguishing features.  There"],
[153,"are no exits from this room."],
[154,"You are in the Vault of the Bank of Zork, in which there are no doors."],
[155,"You are in a large rectangular room.  The east and west walls here"],
[155,"were used for storing safety deposit boxes.  As might be expected,"],
[155,"all have been carefully removed by evil persons.  To the east, west,"],
[155,"and south of the room are large doorways.  The northern \"wall\""],
[155,"of the room is a shimmering curtain of light.  In the center of the"],
[155,"room is a large stone cube, about 10 feet on a side.  Engraved on"],
[155,"the side of the cube is some lettering."],
[156,"This room was the office of the Chairman of the Bank of Zork."],
[156,"Like the other rooms here, it has been extensively vandalized."],
[156,"The lone exit is to the north."],
[158,"You are standing at the top of a flight of stairs that lead down to"],
[158,"a passage below.  Dim light, as from torches, can be seen in the"],
[158,"passage.  Behind you the stairs lead into untouched rock."],
[159,"You are standing near one end of a long dimly lit hall.  To the"],
[159,"south, stone stairs ascend.  To the north, the corridor is illum-"],
[159,"inated by torches set high in the wall, out of reach.  On one wall"],
[159,"is a red button."],
[180,"You are in a corridor with polished marble walls.  The corridor"],
[180,"widens into larger areas as it turns east at its northern and"],
[180,"southern ends."],
[181,"You are in a corridor with polished marble walls.  The corridor"],
[181,"widens into larger areas as it turns west at its northern and"],
[181,"southern ends."],
[187,"You are in a room of large size, richly appointed and decorated"],
[187,"in a style that bespeaks exquisite taste.  To judge from its"],
[187,"contents, it is the ultimate storehouse of the treasures of Zork."],
[187,"   There are chests here containing precious jewels, mountains of"],
[187,"zorkmids, rare paintings, ancient statuary, and beguiling curios."],
[187,"   In one corner of the room is a bookcase boasting such volumes"],
[187,"as \"The History of the Great Underground Empire\", \"The Lives of"],
[187,"the Twelve Flatheads\", \"The Wisdom of the Implementers\", and"],
[187,"other informative and inspiring works."],
[187,"   On one wall is a completely annotated map of the Dungeon of"],
[187,"Zork, showing points of interest and various troves of treasure,"],
[187,"and indicating the locations of several superior scenic views."],
[187,"   On the desk at the far end of the room may be found stock"],
[187,"certificates representing a controlling interest in FrobozzCo"],
[187,"International, the multinational conglomerate and parent company"],
[187,"of the Frobozz Magic Boat Co., etc."],
[188,"You are in a small square room, in the middle of which is a recently"],
[188,"created hole through which you can barely discern the floor some ten"],
[188,"feet below.  It doesn't seem likely you could climb back up.  There"],
[188,"are exits to the west and south."],
[1,"East-West Passage"],
[2,"West of House"],
[3,"North of House"],
[4,"South of House"],
[5,"Behind House"],
[6,"Kitchen"],
[7,"Attic"],
[8,"Living Room"],
[9,"Cellar"],
[10,"Troll Room"],
[11,"Maze"],
[12,"Maze"],
[13,"Maze"],
[14,"Maze"],
[15,"Dead End"],
[16,"Maze"],
[17,"Dead End"],
[18,"Maze"],
[19,"Maze"],
[20,"Maze"],
[21,"Dead End"],
[22,"Maze"],
[23,"Maze"],
[24,"Maze"],
[25,"Grating room"],
[26,"Maze"],
[27,"Dead End"],
[28,"Maze"],
[29,"Maze"],
[30,"Maze"],
[31,"Forest"],
[32,"Forest"],
[33,"Forest"],
[34,"Forest"],
[35,"Forest"],
[36,"Clearing"],
[37,"Deep Ravine"],
[38,"Rocky Crawl"],
[39,"Reservoir South"],
[40,"Reservoir"],
[41,"Reservoir North"],
[42,"Stream View"],
[43,"Stream"],
[44,"Egyptian Room"],
[45,"Glacier Room"],
[46,"Ruby Room"],
[47,"Atlantis Room"],
[48,"Deep Canyon"],
[49,"Loud Room"],
[50,"Mirror Room"],
[51,"Mirror Room"],
[52,"Cave"],
[53,"Cave"],
[54,"Steep Crawlway"],
[55,"Narrow Crawlway"],
[56,"Cold Passage"],
[57,"Winding Passage"],
[58,"Slide Room"],
[59,"Mine Entrance"],
[60,"Squeaky Room"],
[61,"Shaft Room"],
[62,"Wooden Tunnel"],
[63,"Smelly Room"],
[64,"Gas Room"],
[65,"Ladder Top"],
[66,"Coal Mine"],
[67,"Coal Mine"],
[68,"Coal Mine"],
[69,"Coal Mine"],
[70,"Coal Mine"],
[71,"Coal Mine"],
[72,"Coal Mine"],
[73,"Ladder Bottom"],
[74,"Dead End"],
[75,"Timber Room"],
[76,"Lower Shaft"],
[77,"Machine Room"],
[78,"Bat Room"],
[79,"Dome Room"],
[80,"Torch Room"],
[81,"North-South Crawlway"],
[82,"West of Chasm"],
[83,"Round Room"],
[84,"North-South Passage"],
[85,"Chasm"],
[86,"Damp Cave"],
[87,"Ancient Chasm"],
[88,"Dead End"],
[89,"Dead End"],
[90,"Engravings Cave"],
[91,"Riddle Room"],
[92,"Pearl Room"],
[93,"Entrance to Hades"],
[94,"Land of the Living Dead"],
[95,"Grail Room"],
[96,"Temple"],
[97,"Altar"],
[98,"Dam"],
[99,"Dam Lobby"],
[100,"Maintenance Room"],
[101,"Cyclops Room"],
[102,"Strange Passage"],
[103,"Treasure Room"],
[104,"Studio"],
[105,"Gallery"],
[106,"Dam Base"],
[107,"Frigid River"],
[108,"Frigid River"],
[109,"Frigid River"],
[110,"White Cliffs Beach"],
[111,"White Cliffs Beach"],
[112,"Frigid River"],
[113,"Frigid River"],
[114,"Moby Lossage"],
[115,"Shore"],
[116,"Sandy Beach"],
[117,"Rocky Shore"],
[118,"Small Cave"],
[119,"Barrel"],
[120,"Aragain Falls"],
[121,"Rainbow room"],
[122,"End of rainbow"],
[123,"Canyon Bottom"],
[124,"Rocky Ledge"],
[125,"Canyon View"],
[126,"Volcano Bottom"],
[127,"Volcano Core"],
[128,"Volcano near small ledge"],
[129,"Volcano near viewing ledge"],
[130,"Volcano near wide ledge"],
[131,"Narrow Ledge"],
[132,"Volcano View"],
[133,"Wide ledge"],
[134,"Library"],
[135,"Dusty Room"],
[136,"Lava Room"],
[137,"Tomb of the Unknown Implementer"],
[138,"Low Room"],
[139,"Machine Room"],
[140,"Dingy Closet"],
[141,"Cage"],
[142,"Top of Well"],
[143,"Bottom of Well"],
[144,"Tea Room"],
[145,"Posts Room"],
[146,"Pool Room"],
[147,"Up a Tree"],
[148,"Bank Entrance"],
[149,"West Teller's Room"],
[150,"East Teller's Room"],
[151,"Viewing Room"],
[152,"Viewing Room"],
[153,"Small Room"],
[154,"Vault"],
[155,"Safety Depository"],
[156,"Chairman's Office"],
[157,"Crypt"],
[158,"Top of Stairs"],
[159,"Stone Room"],
[160,"Small Room"],
[161,"Hallway"],
[162,"Hallway"],
[163,"Hallway"],
[164,"Hallway"],
[165,"Hallway"],
[166,"Dungeon Entrance"],
[167,"Narrow Room"],
[168,"Narrow Room"],
[169,"Narrow Room"],
[170,"Narrow Room"],
[171,"Narrow Room"],
[172,"Narrow Room"],
[173,"Narrow Room"],
[174,"Narrow Room"],
[175,"Narrow Room"],
[176,"Narrow Room"],
[177,"Inside Mirror"],
[178,"Narrow Corridor"],
[179,"South Corridor"],
[180,"West Corridor"],
[181,"East Corridor"],
[182,"North Corridor"],
[183,"Parapet"],
[184,"Prison Cell"],
[185,"Prison Cell"],
[186,"Prison Cell"],
[187,"Nirvana"],
[188,"Small Square Room"],
[189,"Side Room"],
[190,"Room in a Puzzle"],
[1,"A brown sack is here."],
[2,"There is a clove of garlic here."],
[3,"A hot pepper sandwich is here."],
[4,"There is a small piece of vitreous slag here."],
[5,"There is a small heap of coal here."],
[6,"There is an exquisite jade figurine here."],
[8,"There is an enormous diamond (perfectly cut) here."],
[9,"There is a trophy case here."],
[10,"A clear glass bottle is here."],
[11,"There is some water here."],
[12,"There is a large coil of rope here."],
[13,"There is a nasty-looking knife lying here."],
[14,"There is an elvish sword here."],
[15,"There is a brass lantern (battery-powered) here."],
[16,"There is a broken brass lantern here."],
[18,"There is a pile of leaves on the ground."],
[19,"A nasty-looking troll, brandishing a bloody axe, blocks all passages"],
[19,"out of the room."],
[20,"There is a bloody axe here."],
[21,"There is a rusty knife here."],
[22,"There is a burned-out lantern here."],
[23,"There is a set of skeleton keys here."],
[24,"A skeleton, probably the remains of a luckless adventurer, lies here."],
[25,"An old leather bag, bulging with coins, is here."],
[26,"There is a large platinum bar here."],
[27,"There is a pearl necklace here with hundreds of large pearls."],
[30,"A mass of ice fills the western half of the room."],
[31,"There is a moby ruby lying here."],
[32,"Neptune's own crystal trident is here."],
[33,"There is a solid gold coffin, used for the burial of Ramses II, here."],
[34,"There is an ivory torch here."],
[35,"At the end of the chain is a basket."],
[37,"There is a sapphire-encrusted bracelet here."],
[38,"There is a pile of wooden timbers here."],
[39,"There is a dented steel box here."],
[40,"There is a Stradivarius here."],
[41,"There are old engravings on the walls here."],
[43,"There is an extremely valuable (perhaps original) grail here."],
[45,"There is an old trunk here, bulging with assorted jewels."],
[46,"There is a small brass bell here."],
[47,"There is a large black book here."],
[48,"There are two candles here."],
[49,"There is a tour guidebook here."],
[50,"There is an issue of US NEWS & DUNGEON REPORT dated 28-JUL-80 here."],
[51,"There is a matchbook whose cover says \"VISIT BEAUTIFUL FCD #3\" here."],
[52,"There is a small leaflet here."],
[53,"There is a small mailbox here."],
[54,"There is an object which looks like a tube of toothpaste here."],
[55,"There is some gunk here."],
[56,"There is a wrench here."],
[57,"There is a screwdriver here."],
[59,"There is a silver chalice, intricately engraved, here."],
[60,"A masterpiece by a neglected genius is here."],
[61,"There is a suspicious-looking individual, holding a bag, leaning"],
[61,"against one wall.  He is armed with a vicious-looking stilletto."],
[62,"There is a vicious-looking stilletto here."],
[85,"There is a pot of gold here."],
[86,"There is a beautiful statue here."],
[87,"There is a folded pile of plastic here which has a small valve attached."],
[88,"There is a pile of plastic here with a large hole in it."],
[89,"There is a small pump here."],
[90,"There is an inflated boat here."],
[91,"There is a tan label here."],
[92,"There is a sharp broken stick here."],
[94,"There is a red buoy here (probably a warning)."],
[95,"There is a large emerald here."],
[96,"There is a large shovel here."],
[97,"There is a hunk of bat guano here."],
[98,"There is a very large and extremely heavy wicker basket with a cloth"],
[98,"bag here.  Inside the basket is a metal receptacle of some kind."],
[98,"Attached to the basket on the outside is a piece of wire."],
[102,"There is a small hook attached to the rock here."],
[103,"There is a small hook attached to the rock here."],
[104,"There is an engraved zorkmid coin here."],
[106,"There is a card with writing on it here."],
[108,"Lord Dimwit's crown is here."],
[109,"There is a square brick here which feels like clay."],
[110,"There is a coil of thin shiny wire here."],
[111,"There is a nervous Volcano Gnome here."],
[112,"There is a blue label here."],
[113,"There is a balloon here, broken into pieces."],
[114,"There is a blue book here."],
[115,"There is a green book here."],
[116,"There is a purple book here."],
[117,"There is a white book here."],
[118,"There is a Flathead commemorative stamp here."],
[120,"There are four heads here, mounted securely on poles."],
[121,"Many empty Coke bottles are here.  Alas, they can't hold water."],
[122,"There is an enormous stack of line-printer paper here.  It is barely"],
[122,"readable and totally unintelligable."],
[123,"There is a large case here, containing objects which you used to possess."],
[124,"There is a mangled cage here."],
[125,"There is an steel cage in the middle of the room."],
[126,"There is a beautiful crystal sphere here."],
[132,"A stoppered glass flask with skull-and-crossbones markings is here."],
[132,"The flask is filled with some clear liquid."],
[133,"The leak has submerged the depressed area in a pool of sewage."],
[134,"There is a tin of rare spices here."],
[137,"There is a wooden bucket here, three feet in diameter and three feet"],
[137,"high."],
[138,"There is a piece of cake here with the words \"EAT ME\" on it."],
[139,"There is a piece of cake with orange icing here."],
[140,"There is a piece of cake with red icing here."],
[141,"There is a piece of cake with blue (ecch) icing here."],
[142,"There is a robot here."],
[143,"There is a green piece of paper here."],
[148,"200 neatly stacked zorkmid bills are here."],
[149,"A portrait of J. Pierpont Flathead is here."],
[152,"There is a Gnome of Zurich here."],
[153,"There is a small birds nest here."],
[154,"There is a jewel-encrusted egg here."],
[155,"There is a somewhat ruined egg here."],
[156,"There is a beautiful brass bauble here."],
[157,"There is a golden clockwork canary here."],
[158,"There is a non-functional canary here."],
[186,"There is a piece of paper on the ground here."],
[188,"There is a solid gold engraved card here."],
[215,"The dungeon master is quietly leaning on his staff here."],
[1,"brown sack"],
[2,"clove of garlic"],
[3,"lunch"],
[4,"piece of vitreous slag"],
[5,"small pile of coal"],
[6,"jade figurine"],
[7,"machine"],
[8,"huge diamond"],
[9,"trophy case"],
[10,"glass bottle"],
[11,"quantity of water"],
[12,"rope"],
[13,"knife"],
[14,"sword"],
[15,"lamp"],
[16,"broken lamp"],
[17,"carpet"],
[18,"pile of leaves"],
[19,"troll"],
[20,"bloody axe"],
[21,"rusty knife"],
[22,"burned-out lantern"],
[23,"set of skeleton keys"],
[24,"skeleton"],
[25,"bag of coins"],
[26,"platinum bar"],
[27,"pearl necklace"],
[28,"mirror"],
[29,"mirror"],
[30,"glacier"],
[31,"ruby"],
[32,"crystal trident"],
[33,"gold coffin"],
[34,"torch"],
[35,"basket"],
[37,"sapphire bracelet"],
[38,"pile of timbers"],
[39,"steel box"],
[40,"fancy violin"],
[41,"wall with engravings"],
[43,"grail"],
[44,"prayer"],
[45,"trunk with jewels"],
[46,"bell"],
[47,"book"],
[48,"pair of candles"],
[49,"tour guidebook"],
[50,"newspaper"],
[51,"matchbook"],
[52,"leaflet"],
[53,"mailbox"],
[54,"tube"],
[55,"viscous material"],
[56,"wrench"],
[57,"screwdriver"],
[58,"cyclops"],
[59,"chalice"],
[60,"painting"],
[61,"thief"],
[62,"stilletto"],
[63,"window"],
[64,"bolt"],
[65,"grating"],
[66,"door"],
[67,"door"],
[68,"door"],
[69,"door"],
[70,"switch"],
[71,"head on a pole"],
[72,"pile of corpses"],
[73,"pile of bodies"],
[74,"dam"],
[75,"railing"],
[76,"gate"],
[77,"bubble"],
[78,"leak"],
[79,"button"],
[80,"button"],
[81,"button"],
[82,"button"],
[83,"bat"],
[84,"rainbow"],
[85,"pot of gold"],
[86,"statue"],
[87,"plastic inflatable boat"],
[88,"holed plastic boat"],
[89,"hand-held air pump"],
[90,"magic boat"],
[91,"tan label"],
[92,"sharp broken stick"],
[93,"barrel"],
[94,"red buoy"],
[95,"large emerald"],
[96,"shovel"],
[97,"hunk of bat guano"],
[98,"basket"],
[99,"receptacle"],
[100,"cloth bag"],
[101,"braided wire"],
[102,"hook"],
[103,"hook"],
[104,"gold zorkmid"],
[105,"box"],
[106,"card"],
[107,"hole"],
[108,"crown"],
[109,"brick"],
[110,"wire coil"],
[111,"Volcano Gnome"],
[112,"blue label"],
[113,"broken balloon"],
[114,"blue book"],
[115,"green book"],
[116,"purple book"],
[117,"white book"],
[118,"stamp"],
[119,"tomb"],
[120,"set of poled heads"],
[121,"bunch of Coke bottles"],
[122,"stack of listings"],
[123,"large case"],
[124,"mangled cage"],
[125,"steel cage"],
[126,"crystal sphere"],
[127,"button"],
[128,"button"],
[129,"button"],
[130,"wall with etchings"],
[131,"wall with etchings"],
[132,"glass flask"],
[133,"pool of sewage"],
[134,"tin of spices"],
[135,"large oblong table"],
[136,"group of wooden posts"],
[137,"wooden bucket"],
[138,"piece of \"EAT ME\" cake"],
[139,"piece of cake with orange icing"],
[140,"piece of cake with red icing"],
[141,"piece of cake with blue icing"],
[142,"robot"],
[143,"green piece of paper"],
[144,"large tree"],
[145,"large tree"],
[146,"cliff"],
[147,"white cliff"],
[148,"stack of zorkmid bills"],
[149,"portrait of J. Pierpont Flathead"],
[150,"large stone cube"],
[151,"shimmering curtain of light"],
[152,"gnome of Zurich"],
[153,"birds nest"],
[154,"jewel-encrusted egg"],
[155,"broken jewel-encrusted egg"],
[156,"beautiful brass bauble"],
[157,"clockwork canary"],
[158,"broken clockwork canary"],
[159,"yellow panel"],
[160,"white panel"],
[161,"red panel"],
[162,"black panel"],
[163,"mahogany wall"],
[164,"pine wall"],
[165,"wooden bar"],
[166,"long pole"],
[167,"short pole"],
[168,"T-bar"],
[169,"compass arrow"],
[170,"red button"],
[171,"red beam of light"],
[172,"bronze door"],
[173,"wooden door"],
[174,"locked door"],
[175,"cell door"],
[176,"large button"],
[177,"sundial"],
[178,"numeral 1"],
[179,"numeral 2"],
[180,"numeral 3"],
[181,"numeral 4"],
[182,"numeral 5"],
[183,"numeral 6"],
[184,"numeral 7"],
[185,"numeral 8"],
[186,"note from the Thief"],
[187,"small slit"],
[188,"gold card"],
[189,"steel door"],
[193,"cretin"],
[194,"everything"],
[195,"valuables"],
[196,"sailor"],
[197,"set of teeth"],
[198,"wall"],
[199,"lurking grue"],
[200,"pair of hands"],
[201,"breath"],
[202,"flyer"],
[203,"bird"],
[204,"tree"],
[205,"northern wall"],
[206,"southern wall"],
[207,"eastern wall"],
[208,"western wall"],
[209,"water"],
[210,"Guardian of Zork"],
[211,"compass rose"],
[212,"mirror"],
[213,"panel"],
[214,"stone channel"],
[215,"dungeon master"],
[216,"ladder"],
[1,"On the table is an elongated brown sack, smelling of hot peppers."],
[11,"A bottle is sitting on the table."],
[12,"A large coil of rope is lying in the corner."],
[13,"On a table is a nasty-looking knife."],
[14,"On hooks above the mantlepiece hangs an elvish sword of great antiquity."],
[15,"A battery-powered brass lantern is on the trophy case."],
[21,"Beside the skeleton is a rusty knife."],
[22,"The deceased adventurer's useless lantern is here."],
[31,"On the floor lies a moby ruby."],
[32,"On the shore lies Neptune's own crystal trident."],
[34,"Sitting on the pedestal is a flaming torch, made of ivory."],
[45,"Lying half buried in the mud is an old trunk, bulging with jewels."],
[46,"Lying in the corner of the room is a small brass bell."],
[47,"On the altar is a large black book, open to page 569."],
[48,"On the two ends of the altar are burning candles."],
[49,"A guidebook entitled \"FLOOD CONTROL DAM #3\" is on the"],
[49,"reception desk."],
[60,"Fortunately, there is still one chance for you to be a vandal, for on"],
[60,"the far wall is a work of unparalleled beauty."],
[85,"At the end of the rainbow is a pot of gold."],
[92,"A sharp stick, which appears to have been broken at one end, is here."],
[104,"On the floor is a gold zorkmid coin (a valuable collector's item)."],
[108,"The excessively gaudy crown of Lord Dimwit Flathead is here."],
[121,"There is a large pile of empty Coke bottles here, evidently produced"],
[121,"by the implementers during their long struggle to win totally."],
[122,"There is a gigantic pile of line-printer output here.  Although the"],
[122,"paper once contained useful information, almost nothing can be"],
[122,"distinguished now."],
[148,"On the floor sit 200 neatly stacked zorkmid bills."],
[149,"A portrait of J. Pierpont Flathead hangs on the wall."],
[153,"On the branch is a small birds nest."],
[154,"In the bird's nest is a large egg encrusted with precious jewels,"],
[154,"apparently scavenged somewhere by a childless songbird.  The egg is"],
[154,"covered with fine gold inlay and ornamented in lapis lazuli and"],
[154,"mother-of-pearl.  Unlike most eggs, this one is hinged and has a"],
[154,"delicate looking clasp holding it closed.  The egg appears extremely"],
[154,"fragile."],
[157,"There is a golden clockwork canary nestled in the egg.  It has ruby"],
[157,"eyes and a silver beak.  Through a crystal window below its left"],
[157,"wing you can see intricate machinery inside.  It appears to have"],
[157,"wound down."],
[158,"There is a golden clockwork canary nestled in the egg.  It seems to"],
[158,"have recently had a bad experience.  The mountings for its jewel-like"],
[158,"eyes are empty, and its silver beak is crumpled.  Through a cracked"],
[158,"crystal window below its left wing you can see the remains of"],
[158,"intricate machinery.  It is not clear what result winding it would"],
[158,"have, as the mainspring appears sprung."],
[188,"Nestled inside the niche is an engraved gold card."],
[41,"The engravings were incised in the living rock of the cave wall by"],
[41,"an unknown hand.  They depict, in symbolic form, the beliefs of the"],
[41,"ancient peoples of Zork.  Skillfully interwoven with the bas reliefs"],
[41,"are excerpts illustrating the major tenets expounded by the sacred"],
[41,"texts of the religion of that time.  Unfortunately, a later age seems"],
[41,"to have considered them blasphemous and just as skillfully excised them."],
[44,"The prayer is inscribed in an ancient script which is hardly"],
[44,"remembered these days, much less understood.  What little of it can"],
[44,"be made out seems to be a diatribe against small insects, absent-"],
[44,"mindedness, and the picking up and dropping of small objects.  The"],
[44,"final verse seems to consign trespassers to the land of the"],
[44,"dead.  All evidence indicates that the beliefs of the ancient"],
[44,"Zorkers were obscure indeed."],
[47,"            Commandment #12592"],
[47,"Oh ye who go about saying unto each other:  \"Hello sailor\":"],
[47,"Dost thou know the magnitude of thy sin before the gods?"],
[47,"Yea, verily, thou shalt be ground between two stones."],
[47,"Shall the angry gods cast thy body into the whirlpool?"],
[47,"Surely, thy eye shall be put out with a sharp stick!"],
[47,"Even unto the ends of the earth shalt thou wander and"],
[47,"unto the land of the dead shalt thou be sent at last."],
[47,"Surely thou shalt repent of thy cunning."],
[49,"             Guide Book To"],
[49,"          Flood Control Dam #3"],
[49,""],
[49,"  Flood control dam #3 (FCD #3) was constructed in year 783 of the"],
[49,"Great Underground Empire to harness the destructive power of the"],
[49,"Frigid River.  This work was supported by a grant of 37 million"],
[49,"zorkmids from the central bureaucracy and your own omnipotent local"],
[49,"tyrant Lord Dimwit Flathead the Excessive.  This impressive structure"],
[49,"is composed of 3.7 cubic feet of concrete, is 256 feet tall at the"],
[49,"center, and 193 feet wide at the top.  The reservoir created behind"],
[49,"the dam has a volume of 37 billion cubic feet, an area of 12 million"],
[49,"square feet, and a shore line of 36 thousand feet."],
[49,""],
[49,"  The construction of FCD #3 took 112 days from ground breaking to"],
[49,"the dedication.  It required a work force of 384 slaves, 34 slave"],
[49,"drivers, 12 engineers, 2 turtle doves, and a partridge in a pear"],
[49,"tree.  The work was managed by a command team composed of 234"],
[49,"bureaucrats, 2347 secretaries (at least two of whom could type),"],
[49,"12,256 paper shufflers, 52,469 rubber stampers, 245,193 red tape"],
[49,"processors, and nearly one million dead trees."],
[49,""],
[49,"  We will now point out some of the more interesting features of"],
[49,"FCD #3 as we conduct you on a guided tour of the facilities."],
[49,""],
[49,"  1)     You start your tour here in the dam lobby."],
[49,"    You will notice on your right that ..........."],
[50,"          US NEWS & DUNGEON REPORT"],
[50,"30-AUG-90                            Late Dungeon Edition"],
[50,""],
[50,"           --- LATE NEWS FLASH!! ---"],
[50,""],
[50,"The endgame is here!  (Somewhere)"],
[50,"There have been some puzzling new discoveries near the Thief's hideaway."],
[50,""],
[50,"         --- BACKGROUND INFORMATION ---"],
[50,""],
[50,"This version of Dungeon has been converted from the DECUS version for"],
[50,"the PDP-11/VAX-11, which was itself completely reimplemented in"],
[50,"FORTRAN-IV from the original MDL sources created at MIT."],
[50,""],
[50,"This version is intended to be reasonable portable to all sorts"],
[50,"of computers, large and, by 1990 standards, small, except those"],
[50,"that disobey the laws of physics, i.e. that use EBCDIC."],
[50,""],
[50,""],
[50,"  There is no official maintanence for this version; problems are"],
[50,"best discussed on the Usenet, currently in newsgroup rec.games.misc."],
[50,""],
[50,""],
[50,""],
[51,"          [Close cover before striking BKD]"],
[51,""],
[51,"   You too can make BIG MONEY in the exciting field of"],
[51,"                 PAPER SHUFFLING!"],
[51,""],
[51,"Mr. TAA of Muddle, Mass. says:  \"Before I took this course I used"],
[51,"to be a lowly bit twiddler.  Now with what I learned at MIT Tech"],
[51,"I feel really important and can obfuscate and confuse with the best.\""],
[51,""],
[51,"Mr. MARC had this to say:  \"Ten short days ago all I could look"],
[51,"forward to was a dead-end job as a engineer.  Now I have a promising"],
[51,"future and make really big Zorkmids.\""],
[51,""],
[51,"MIT Tech can't promise these fantastic results to everyone, but when"],
[51,"you earn your MDL degree from MIT Tech your future will be brighter."],
[51,""],
[51,"       Send for our free brochure today!"],
[52,"             Welcome to Dungeon!"],
[52,""],
[52,"   Dungeon is a game of adventure, danger, and low cunning.  In it"],
[52,"you will explore some of the most amazing territory ever seen by mortal"],
[52,"man.  Hardened adventurers have run screaming from the terrors contained"],
[52,"within."],
[52,""],
[52,"   In Dungeon, the intrepid explorer delves into the forgotten secrets"],
[52,"of a lost labyrinth deep in the bowels of the earth, searching for"],
[52,"vast treasures long hidden from prying eyes, treasures guarded by"],
[52,"fearsome monsters and diabolical traps!"],
[52,""],
[52,""],
[52,"   Dungeon was created at the Programming Technology Division of the MIT"],
[52,"Laboratory for Computer Science by Tim Anderson, Marc Blank, Bruce"],
[52,"Daniels, and Dave Lebling.  It was inspired by the Adventure game of"],
[52,"Crowther and Woods, and the Dungeons and Dragons game of Gygax"],
[52,"and Arneson.  The original version was written in MDL (alias MUDDLE)."],
[52,"The current version was translated from MDL into FORTRAN IV by"],
[52,"a somewhat paranoid DEC engineer who prefers to remain anonymous."],
[52,""],
[52,"   On-line information may be obtained with the commands HELP and INFO."],
[52,""],
[54,"---> Frobozz Magic Gunk Company <---"],
[54,"         All Purpose Gunk"],
[67,"The engravings translate to, \"This space intentionally left blank\"."],
[91,"   !!!! FROBOZZ MAGIC BOAT COMPANY !!!!"],
[91,""],
[91,"Hello, sailor!"],
[91,""],
[91,"Instructions for use:"],
[91,""],
[91,"   To get into the boat, say 'BOARD'"],
[91,"   To leave the boat, say 'DISEMBARK'"],
[91,"   To get into a body of water, say 'LAUNCH'"],
[91,"   To get to shore, say 'LAND'"],
[91,""],
[91,"Warranty:"],
[91,""],
[91,"   This boat is guaranteed against all defects in parts and"],
[91,"workmanship for a period of 76 milliseconds from date of purchase"],
[91,"or until first used, whichever comes first."],
[91,""],
[91,"Warning:  This boat is made of plastic."],
[91,""],
[91,"Good luck!"],
[104,""],
[104,"          --------------------------"],
[104,"         /       Gold Zorkmid        \\"],
[104,"        /  T e n   T h o u s a n d    \\"],
[104,"       /        Z o r k m i d s        \\"],
[104,"      /                                 \\"],
[104,"     /        ||||||||||||||||||         \\"],
[104,"    /        !||||          ||||!         \\"],
[104,"   |          |||   ^^  ^^   |||           |"],
[104,"   |          |||   OO  OO   |||           |"],
[104,"   | In Frobs  |||    <<    |||  We Trust  |"],
[104,"   |            || (______) ||             |"],
[104,"   |             |          |              |"],
[104,"   |             |__________|              |"],
[104,"    \\                                     /"],
[104,"     \\     -- Lord Dimwit Flathead --    /"],
[104,"      \\     -- Beloved of Zorkers --    /"],
[104,"       \\                               /"],
[104,"        \\       * 722 G.U.E. *        /"],
[104,"         \\                           /"],
[104,"          \\                         /"],
[104,"            -----------------------"],
[106,"Warning:"],
[106,"   This room was constructed over very weak rock strata.  Detonation"],
[106,"of exposives in this room is strictly prohibited!"],
[106,"                  Frobozz Magic Safe Company"],
[106,"                  per M. Agrippa, foreman"],
[112,"   !!!! FROBOZZ MAGIC BALLOON COMPANY !!!!"],
[112,""],
[112,"Hello, aviator!"],
[112,""],
[112,"Instructions for use:"],
[112,""],
[112,"   To get into the balloon, say 'BOARD'"],
[112,"   To leave the balloon, say 'DISEMBARK'"],
[112,"   To land, say 'LAND'"],
[112,""],
[112,"Warranty:"],
[112,""],
[112,"   No warranty is expressed or implied.  You're on your own, sport."],
[112,""],
[112,"Good luck!"],
[114,"This book is written in a tongue with which I am unfamiliar."],
[115,"This book is written in a tongue with which I am unfamiliar."],
[116,"This book is written in a tongue with which I am unfamiliar."],
[117,"This book is written in a tongue with which I am unfamiliar."],
[118,""],
[118,"---V----V----V----V----V----V----V----V---"],
[118,"|                                        |"],
[118,"|          ||||||||||        LORD        |"],
[118,">         !||||      |      DIMWIT       <"],
[118,"|         ||||    ---|     FLATHEAD      |"],
[118,"|         |||C     CC \\                  |"],
[118,">          ||||       _\\                 <"],
[118,"|           ||| (____|                   |"],
[118,"|            ||      |                   |"],
[118,">             |______|       Our         <"],
[118,"|               /   \\     Excessive      |"],
[118,"|              /     \\      Leader       |"],
[118,">             |       |                  <"],
[118,"|             |       |                  |"],
[118,"|                                        |"],
[118,">    G.U.E. POSTAGE        3 Zorkmids    <"],
[118,"|                                        |"],
[118,"---^----^----^----^----^----^----^----^---"],
[119,"Here lie the implementers, whose heads were placed on poles by the"],
[119,"keeper of the dungeon for amazing untastefulness."],
[122,"<DEFINE FEEL-FREE (LOSER)"],
[122,"   <TELL \"FEEL FREE, CHOMPER!\">"],
[122,"   <MEMQ ......"],
[122,"The rest is, alas, unintelligable (as were the implementers)."],
[130,"           o  b  o"],
[130,""],
[130,"           A  G  I"],
[130,"            E   L"],
[130,""],
[130,"           m  p  a"],
[131,"           o  b  o"],
[131,"       r             z"],
[131,"    f   M  A  G  I  C    z"],
[131,"    c    W  E   L  L     y"],
[131,"       o             n"],
[131,"           m  p  a"],
[143,"   !!!! FROBOZZ MAGIC ROBOT COMPANY !!!!"],
[143,""],
[143,"Hello, master!"],
[143,""],
[143,"   I am a late-model robot, trained at MIT Tech to perform various"],
[143,"simple housekeeping functions."],
[143,""],
[143,"Instructions for use:"],
[143,""],
[143,"   To activate me, use the following formula--"],
[143,"   TELL ROBOT, something to do (CR)"],
[143,"   The comma is mandatory."],
[143,"   Command me as you will!"],
[143,""],
[143,"Warranty:"],
[143,""],
[143,"   No warranty is expressed or implied."],
[143,""],
[143,"At your service!"],
[148,""],
[148," _______________________________________________________________"],
[148,"| 1  0   0         GREAT UNDERGROUND EMPIRE           1  0   0  |"],
[148,"| 1 0 0 0 0                                           1 0 0 0 0 |"],
[148,"| 1 0 0 0 0                                           1 0 0 0 0 |"],
[148,"| 1  0   0                  DIMWIT                    1  0   0  |"],
[148,"|                      ||||||||||||||||                         |"],
[148,"|                      ||   __  __   ||              B30332744D |"],
[148,"|                      ||  -OO  OO-  ||                         |"],
[148,"|       IN FROBS       \\||    >>    ||/       WE TRUST          |"],
[148,"|                       ||  ______  ||                          |"],
[148,"| B30332744D             |  ------  |                           |"],
[148,"|                        \\\\________//                           |"],
[148,"| 1  0   0    Series       FLATHEAD     LD Flathead   1  0   0  |"],
[148,"| 1 0 0 0 0   719GUE                     Treasurer    1 0 0 0 0 |"],
[148,"| 1 0 0 0 0                                           1 0 0 0 0 |"],
[148,"| 1  0   0        One Hundred Royal Zorkmids          1  0   0  |"],
[148,"|_______________________________________________________________|"],
[148,""],
[149,""],
[149,"                ||||||||||||||"],
[149,"               ||   __  __   ||"],
[149,"               ||   $$  $$   ||"],
[149,"              \\||     >>     ||/"],
[149,"               ||  ________  ||"],
[149,"                |  -//-----  |"],
[149,"                \\\\_//_______//"],
[149,"               ___// |  |"],
[149,"              /__//  |  |"],
[149,"                     |  |"],
[149,"          __________//  \\\\__________"],
[149,"         / $ /       ****       \\ $ \\"],
[149,"        /   /         **         \\   \\"],
[149,"       /   /|         **         |\\   \\"],
[149,"      /   / |         **         | \\   \\"],
[149,"     /   /  |         **         |  \\   \\"],
[149,"     ^   ^__|______$Z$**$Z$______|__^   ^"],
[149,"     \\         *   $Z$**$Z$   *         /"],
[149,"      \\________*___$Z$**$Z$___*________/"],
[149,"            |      $Z$**$Z$      |"],
[149,""],
[149,"            J.  PIERPONT  FLATHEAD"],
[149,"                   CHAIRMAN"],
[150,"             Bank of Zork"],
[150,"                 VAULT"],
[150,"               *722 GUE*"],
[150,"       Frobozz Magic Vault Company"],
[186,"The paper is rather worn;  although the writing is barely legible"],
[186,"(the author probably had only a used pencil), it is a very elegant"],
[186,"copperplate."],
[186,""],
[186,"To Whom It May Concern:"],
[186,""],
[186,"   I regret to report that the rumours regarding treasure contained"],
[186,"in the chamber to which this passage leads have no basis in fact."],
[186,"Should you nevertheless be sufficiently foolhardy to enter, it will"],
[186,"be quite impossible for you to exit."],
[186,""],
[186,"                           Sincerely yours,"],
[186,"                           The Thief"],
[188," __________________________________________________________"],
[188,"|                                                          |"],
[188,"|             FROBOZZ MAGIC SECURITY SYSTEMS               |"],
[188,"|   Door Pass                  Royal Zork Puzzle Museum    |"],
[188,"|                                                          |"],
[188,"|                    #632-988-496-XTHF                     |"],
[188,"|                                                          |"],
[188,"|                                                          |"],
[188,"|    USE OF THIS PASS BY UNAUTHORIZED PERSONS OR AFTER     |"],
[188,"|  EXPIRATION DATE WILL RESULT IN IMMEDIATE CONFISCATION   |"],
[188,"|                                                          |"],
[188,"|                                                          |"],
[188,"|                             (approved)                   |"],
[188,"|                             Will Weng                    |"],
[188,"|                              789 G.U.E.                  |"],
[188,"|                                                          |"],
[188,"|                                       Expires 792 G.U.E. |"],
[188,"|__________________________________________________________|"],
[2877,"The door is locked, and there is evidently no key."],
[2878,"The windows are all barred."],
[2879,"The windows are all barred."],
[2880,"Only Santa Claus climbs down chimneys."],
[2881,"The door is nailed shut."],
[2882,"You try to ascend the ramp, but it is impossible, and you slide back down."],
[2883,"The troll fends you off with a menacing gesture."],
[2884,"The troll fends you off with a menacing gesture."],
[2885,"The troll fends you off with a menacing gesture."],
[2886,"The grating is locked."],
[2887,"There is no tree here suitable for climbing."],
[2888,"There is no tree here suitable for climbing."],
[2889,"There is no tree here suitable for climbing."],
[2890,"There is no tree here suitable for climbing."],
[2891,"The grating is locked."],
[2892,"The coffin will not fit through this passage."],
[2893,"The stairs are too steep for carrying the coffin."],
[2894,"You are not equipped for swimming."],
[2895,"You are not equipped for swimming."],
[2896,"The dam blocks your way."],
[2897,"You must specify which direction here."],
[2898,"You are not equipped for swimming."],
[2899,"You are not equipped for swimming."],
[2900,"The way is too narrow."],
[2901,"The passage is too narrow to accomodate coffins."],
[2902,"You hear the whir from the round room but can find no entrance."],
[2903,"You wouldn't fit and would die if you could."],
[2904,"You cannot fit through this passage with that load."],
[2905,"Not a chance."],
[2906,"You cannot fit through this passage with that load."],
[2907,"You cannot fit through this passage with that load."],
[2908,"You cannot go down without fracturing many bones."],
[2909,"You cannot reach the rope."],
[2910,"Not even a human fly could get up it."],
[2911,"The chasm probably leads directly to the infernal regions."],
[2912,"Are you out of your mind?"],
[2913,"It is too narrow even for most insects."],
[2914,"Your way is blocked by an invisible force."],
[2915,"Some invisible force prevents you from passing through the gate."],
[2916,"Some invisible force prevents you from passing through the gate."],
[2917,"The north wall is solid rock."],
[2918,"The cyclops doesn't look like he'll let you pass."],
[2919,"The chimney is too narrow for you and all of your baggage."],
[2920,"You cannot go upstream due to the strong current."],
[2921,"The white cliffs prevent you from landing here."],
[2922,"You cannot go upstream due to the strong current."],
[2923,"The white cliffs prevent you from landing here."],
[2924,"You cannot go upstream due to the strong current."],
[2925,"You must specify which direction here."],
[2926,"The path is too narrow."],
[2927,"The path is too narrow."],
[2928,"You must specify which direction here."],
[2929,"You cannot go upstream due to the strong current."],
[2930,"You cannot go upstream due to the strong current."],
[2931,"I wouldn't jump from here."],
[2932,"I wouldn't try that."],
[2933,"It is impossible to cross this distance."],
[2934,"It's a long way down."],
[2935,"It's a long way down."],
[2936,"The walls cannot be climbed."],
[2937,"Only a mouse could get in there."],
[2938,"There is a chasm too wide to jump across."],
[2939,"There is a chasm too wide to jump across."],
[2940,"There is a chasm too wide to jump across."],
[2941,"You cannot climb any higher."],
[2942,"There is a curtain of light there."],
[2943,"An alarm rings briefly, and an invisible force prevents you from leaving."],
[2944,"An alarm rings briefly, and an invisible force prevents you from leaving."],
[2945,"The wall is solid rock."],
[2946,"The panel is closed."],
[2947,"The panel is closed."],
[2948,"The panel is closed."],
[2949,"The panel is closed."],
[2950,"The panel is closed."],
[2951,"The panel is closed."],
[2952,"The panel is closed."],
[2953,"The panel is closed."],
[2954,"The panel is closed."],
[2955,"The panel is closed."],
[2956,"The panel is closed."],
[2957,"The panel is closed."],
[2958,"The panel is closed."],
[2959,"The panel is closed."],
[2960,"The panel is closed."],
[2961,"You would be burned to a crisp in no time."],
[2962,"You would be burned to a crisp in no time."],
[2963,"The bronze door is closed."],
[2964,"The door is securely fastened."],
[2965,"The door is securely fastened."],
[2966,"The door is closed."],
[-1,""]
];
var DINDX=[2,0,1,585,191,100,190,-1994,-1613,-1615,-1617,-1619,0,0,-1621,0,0,-1622,-1624,-1625,-1626,-1627,-1628,-1629,-1630,-1631,-1632,-1633,-1634,-1635,-1636,-1637,0,-1638,-1639,-1640,-1641,-1642,-1643,-1644,-1646,-1648,-1650,0,-1651,-1654,0,0,0,-1657,-1659,-1662,0,-1664,-1666,-1668,-1671,0,0,-1675,-1677,-1679,-1681,-1683,-1685,-1688,-1694,-1697,-1699,-1703,-1706,-1709,-1710,-1713,-1714,-1715,-1716,-1717,-1718,-1719,-1720,-1723,-1724,-1727,0,0,0,0,-1730,-1732,0,-1735,-1736,-1738,-1741,-1743,-1744,-1745,-1746,-1753,0,0,-1754,-1756,-1760,0,-1762,-1765,0,-1772,-1775,-1779,-1786,-1789,-1794,-1796,-1799,-1802,-1805,-1807,-1810,0,-1812,-1815,-1817,-1819,-1820,0,-1822,-1825,-1830,-1833,-1838,-1847,-1850,-1852,-1855,-1858,-1860,-1863,0,-1868,0,-1871,0,0,-1873,-1883,-1890,-1891,-1894,-1897,-1902,-1907,0,-1910,-1921,-1927,-1933,-1941,-1949,-1951,-1952,-1959,0,-1962,-1965,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,-1969,-1972,0,0,0,0,0,-1975,-1991,0,0,0,0,0,0,0,0,0,0,0,0,1,5,10,15,20,29,39,40,47,54,64,68,71,74,77,78,81,82,86,91,94,95,101,104,108,112,117,118,122,126,129,135,141,146,152,158,167,171,174,188,195,203,206,210,215,220,222,224,227,230,233,236,238,241,243,246,249,252,255,258,260,264,267,269,270,272,275,279,282,286,292,295,299,302,303,307,316,317,318,322,326,331,336,363,366,370,374,378,379,380,382,386,388,395,398,401,403,404,408,411,413,420,422,424,429,432,435,442,447,454,458,462,469,0,474,477,479,481,483,484,493,495,505,507,509,512,0,513,0,515,517,524,529,536,538,539,541,548,575,577,0,578,581,584,588,595,597,600,603,606,609,610,0,0,611,620,621,627,631,634,644,657,678,699,701,713,728,736,744,752,760,768,0,0,0,0,776,803,807,813,815,817,826,831,840,842,0,850,855,859,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,0,3,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,0,0,11,11,11,11,11,6,0,0,7,8,9,0,0,0,10,0,0,0,0,12,12,0,13,0,0,0,0,0,0,0,0,0,0,14,0,0,0,0,0,0,0,0,0,0,15,15,16,17,18,19,0,0,20,0,0,0,0,0,0,0,0,0,21,22,0,0,0,23,0,0,25,0,27,0,0,0,0,0,0,28,28,29,0,30,0,31,0,32,0,33,0,0,0,0,0,0,0,0,0,0,0,0,34,0,35,0,58,36,0,0,37,0,0,0,0,0,24,0,0,0,0,0,0,0,26,0,48,0,0,47,42,41,40,39,38,51,45,45,44,44,43,43,39,39,39,39,46,50,49,0,0,52,53,54,55,56,57,0,59,60,0,0,0,0,0,0,0,0,0,0,5,0,0,0,0,10,0,0,25,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,30,0,0,0,0,0,0,0,10,25,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,10,0,0,0,0,0,0,0,15,0,0,0,0,0,0,0,0,0,0,15,20,0,0,0,0,0,0,0,0,35,0,0,0,0,0,0,0,0,0,0,0,0,0,8192,25632,25632,25632,25632,25664,8256,25664,8192,8192,8192,8192,8192,8192,8192,8192,8192,8192,8192,8192,8192,8192,8192,8192,8192,8192,8192,8192,8192,8192,25632,25632,25632,25632,25632,25632,8192,8192,8704,4128,8704,8704,4128,8192,8192,8192,8192,8192,8192,8192,24576,8192,8192,8192,8192,8192,8192,8192,8192,8192,8192,8192,8192,9216,8192,8192,8192,8192,8192,8192,8192,8192,8192,8192,9216,9216,8192,9216,8192,8192,8192,8192,8192,8192,8192,8192,8192,8192,8192,8192,8192,8192,24576,24576,8192,25600,25600,25088,24576,8192,8192,8192,8192,8192,24576,26144,5664,5664,5664,9728,9728,5664,5664,8192,9728,9728,9728,8192,8224,9728,25632,25120,25632,25632,25632,8192,3104,3104,3104,3104,8192,8192,8192,8192,24576,8192,8192,8192,8192,8192,8224,8320,8320,8192,8192,8192,24608,8192,8192,8192,8192,8192,8192,8192,24576,8192,8208,24592,24592,24592,24592,24592,24592,24592,24592,24592,24592,24592,24592,24592,24592,24592,24592,24592,24592,24592,24592,24592,24592,24592,24592,24592,24592,24592,24592,24592,24592,24576,24576,24576,0,0,0,0,0,0,0,0,0,0,886,3155,7178,10277,-31707,1027,5124,7199,-29440,-2877,7170,3077,1057,-27392,-2878,7170,3077,5152,-31488,-2879,1027,5124,3108,7942,0,63,-18682,0,63,7176,9223,10496,-2880,3845,0,63,-17659,0,63,-22522,3078,7782,-2881,13,-21751,0,66,3082,5202,7424,-2882,-22776,0,66,7177,3665,-2883,1,1537,-2884,1,-27125,-2885,1,7178,1035,5132,-29682,5131,1038,-29683,7180,1038,-23536,7181,1035,-29681,-27634,3089,1037,-26606,-25584,10256,3091,7186,-23530,9245,7186,2063,3092,-27618,2067,7188,-28651,-31724,1042,3096,10263,5148,7194,-24554,3094,7196,-23528,2073,10263,8220,-26598,10020,-2886,65,-26600,7184,6168,3100,9238,-31717,-27622,3094,10266,5143,-25576,7198,8221,2067,-27629,7197,5139,-30619,1055,3105,5152,7199,-23296,-2887,1028,3108,5154,7199,-23296,-2888,1056,3108,5156,7171,-23405,3197,1059,5154,7200,-23296,-2889,1059,4221,5154,7200,-23296,-2890,11033,-2891,65,6149,4131,1060,3108,7201,-27616,5121,10279,3157,-25562,7205,3151,-24532,11304,7210,5669,-2892,275,9776,-2893,275,15912,-2894,6,-31192,-2895,6,1065,5159,9259,10496,-2896,-20224,-2897,1071,11304,15912,-2898,6,-27096,-2899,6,11307,3111,-31699,12330,10280,-23296,-2900,9261,5252,-29146,-2901,275,1066,3116,-25042,0,8,7304,-27603,4137,-23500,8231,3170,-27565,3159,7252,-23466,7224,1078,-29644,7225,1079,-29643,1074,-22481,1079,7219,-22435,5170,-26568,5173,6195,-31649,3122,7226,-31690,3123,-31488,-2902,3128,10249,-31685,5178,8252,-30659,7246,-27589,7227,1086,-22272,-2903,5181,7231,-30654,10304,-29634,-23489,10313,-23480,1093,6211,-29634,5186,7238,9284,-30651,7235,2118,-29626,9286,2119,5186,-25533,10311,1096,7235,5188,9284,-29627,4165,9286,-24504,3138,7238,10305,-27577,2122,5195,-23487,-27575,1097,-26036,-2904,29,3149,9472,-2905,14923,-2906,29,-30133,-2907,29,-24500,-29636,3110,-21936,-2908,7,7248,10321,-23296,-2909,1106,5224,3082,-23296,-2910,7177,1105,5225,-22272,-2911,1626,0,516,5722,0,516,3679,0,516,7681,0,516,8752,0,516,2644,0,516,4665,0,516,6667,0,516,-17864,0,1284,1109,2097,-27565,5157,3156,-22272,-2912,5169,3170,-25344,-2913,5169,3190,1112,-25511,-26537,-29609,1107,-28581,10330,-29092,-2914,10,3215,-25509,9269,3678,-2915,11,-18850,-2916,11,3209,14429,-25507,7251,3127,-23456,7263,-29599,-25504,5168,10346,3158,-31645,5218,1124,-29596,5219,-25501,7198,1638,-2917,13,-22937,-2918,12,5221,-29688,10341,-29508,1105,8297,-23034,-2919,782,1106,5224,-25452,1122,9314,-21397,7274,12394,10348,9472,-2920,-29440,-2921,10349,9472,-2922,-29440,-2923,10352,3182,7285,9472,-2924,-20224,-2925,11373,-27025,-2926,30,11376,-31122,-2927,30,10353,3183,7284,12544,-2928,-23296,-2929,10354,7283,12403,-23296,-2930,11377,1140,-27528,11376,-27533,11373,-24458,5237,-24489,-18312,10354,1139,13431,3705,0,27,-22919,0,27,3194,-25480,4219,9849,0,27,8825,0,27,-24967,0,27,1146,-23428,9341,-22405,10364,5154,-25565,-31608,7299,-20349,12421,-25467,11392,5254,10496,-2931,-24962,0,17,3116,10496,-2932,-17152,-2933,11394,5255,10496,-2934,-24962,0,17,1155,-18301,-31611,5246,-25554,7262,1949,0,119,-18531,0,119,1675,0,1056,5771,0,1056,3723,0,1568,7819,0,1056,2704,0,1056,4752,0,1568,6800,0,1056,8848,0,1056,-17776,0,1568,7306,-27508,-31605,3216,-22272,-2935,7260,-23296,-2936,7310,8330,-29440,-2937,3218,8448,-2938,7424,-2939,-22272,-2940,14481,-25455,10273,-23296,-2941,8341,2198,-27543,1175,5268,-25445,1176,5268,-29541,-27500,-27500,1280,-2942,7829,-2943,1824,3734,-2944,1824,-27492,-31589,15241,0,119,-26743,0,119,1183,10399,-27392,-2945,5278,9374,-31584,1697,0,2080,2721,0,2080,8865,0,2080,-27489,1698,0,2080,2722,0,2080,8866,0,2080,5280,-18767,-2946,2336,1699,0,2080,2723,0,2080,8867,0,2080,5793,0,2080,4769,0,2080,6817,0,2080,-18767,-2947,2336,1700,0,2080,2724,0,2080,8868,0,2080,5794,0,2080,4770,0,2080,6818,0,2080,-18767,-2948,2336,1189,-27485,1190,2214,8358,5796,0,2080,4772,0,2080,-25948,0,2080,1970,0,173,14258,0,173,5797,0,2080,4773,0,2080,-25947,0,2080,14001,-2949,2336,7857,-2950,2336,1186,-27488,14001,-2951,2336,3761,-2952,2336,1186,-27488,14001,-2953,2336,7857,-2954,2336,1187,-27487,14001,-2955,2336,3761,-2956,2336,1187,-27487,14001,-2957,2336,7857,-2958,2336,1188,-27486,14001,-2959,2336,3761,-2960,2336,1188,-27486,1697,0,2592,5793,0,2592,3745,0,2592,7841,0,2592,2721,0,2592,8865,0,2592,4769,0,2592,6817,0,2592,-17759,0,2592,1203,-26714,0,173,7348,3253,1976,0,2988,-27470,5299,-31562,1206,-27469,3253,7348,1207,6072,0,175,-18504,0,175,5302,1280,-2961,-22272,-2962,15286,0,175,1974,0,175,-26701,-2963,2988,-18176,-2964,1280,-2965,6075,0,172,-17477,0,172,5309,7271,-21826,0,3104,1212,-28994,-2966,3373,1726,0,3616,2750,0,3616,3774,0,3616,4798,0,3616,5822,0,3616,6846,0,3616,7869,0,3616,8894,0,3616,-22852,0,3616,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,216,-2185,-2186,-2187,-2188,-2189,-2190,0,-2191,-2192,-2193,-2194,-2195,-2196,-2197,-2198,-2199,0,-2200,-2201,-2203,-2204,-2205,-2206,-2207,-2208,-2209,-2210,0,0,-2211,-2212,-2213,-2214,-2215,-2216,0,-2217,-2218,-2219,-2220,-2221,0,-2222,0,-2223,-2224,-2225,-2226,-2227,-2228,-2229,-2230,-2231,-2232,-2233,-2234,-2235,0,-2236,-2237,-2238,-2240,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,-2241,-2242,-2243,-2244,-2245,-2246,-2247,-2248,0,-2249,-2250,-2251,-2252,-2253,0,0,0,-2256,-2257,-2258,0,-2259,0,-2260,-2261,-2262,-2263,-2264,-2265,-2266,-2267,-2268,-2269,-2270,0,-2271,-2272,-2273,-2275,-2276,-2277,-2278,0,0,0,0,0,-2279,-2281,-2282,0,0,-2283,-2285,-2286,-2287,-2288,-2289,-2290,0,0,0,0,-2291,-2292,0,0,-2293,-2294,-2295,-2296,-2297,-2298,-2299,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,-2300,0,-2301,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,-2302,0,0,0,0,0,-2303,-2304,-2305,-2306,-2307,-2308,-2309,-2310,-2311,-2312,-2313,-2314,-2315,-2316,-2317,-2318,-2319,-2320,-2321,-2322,-2323,-2324,-2325,-2326,-2327,-2328,-2329,-2330,-2331,-2332,-2333,-2334,-2335,-2336,-2337,0,-2338,-2339,-2340,-2341,-2342,0,-2343,-2344,-2345,-2346,-2347,-2348,-2349,-2350,-2351,-2352,-2353,-2354,-2355,-2356,-2357,-2358,-2359,-2360,-2361,-2362,-2363,-2364,-2365,-2366,-2367,-2368,-2369,-2370,-2371,-2372,-2373,-2374,-2375,-2376,-2377,-2378,-2379,-2380,-2381,-2382,-2383,-2384,-2385,-2386,-2387,-2388,-2389,-2390,-2391,-2392,-2393,-2394,-2395,-2396,-2397,-2398,-2399,-2400,-2401,-2402,-2403,-2404,-2405,-2406,-2407,-2408,-2409,-2410,-2411,-2412,-2413,-2414,-2415,-2416,-2417,-2418,-2419,-2420,-2421,-2422,-2423,-2424,-2425,-2426,-2427,-2428,-2429,-2430,-2431,-2432,-2433,-2434,-2435,-2436,-2437,-2438,-2439,-2440,-2441,-2442,-2443,-2444,-2445,-2446,-2447,-2448,-2449,-2450,-2451,-2452,-2453,-2454,-2455,-2456,-2457,-2458,-2459,-2460,-2461,-2462,-2463,-2464,-2465,-2466,-2467,-2468,-2469,-2470,-2471,-2472,-2473,-2474,-2475,-2476,-2477,-2478,-2479,-2480,-2481,-2482,-2483,-2484,-2485,-2486,-2487,-2488,-2489,0,0,0,-2490,-2491,-2492,-2493,-2494,-2495,-2496,-2497,-2498,-2499,-2500,-2501,-2502,-2503,-2504,-2505,-2506,-2507,-2508,-2509,-2510,-2511,-2512,-2513,0,0,0,0,-2514,0,0,0,0,0,0,0,0,0,-2515,-2516,-2517,-2518,-2519,0,0,0,0,0,-2520,-2521,0,0,0,0,0,0,0,0,-2522,-2523,0,-2524,0,0,0,0,0,0,0,0,0,0,-2525,-2526,-2527,-2528,-2529,0,0,0,0,0,0,0,0,0,0,-2531,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,-2533,0,0,0,0,0,0,-2534,0,0,0,0,0,0,0,0,0,0,0,-2535,0,0,0,-2536,0,0,0,0,0,0,0,0,0,0,0,0,-2537,-2539,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,-2542,-2543,0,0,0,-2544,-2545,0,0,-2551,-2555,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,-2561,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,100,0,2,3,101,4,0,5,6,0,7,102,103,0,104,0,0,8,0,0,0,9,9,105,0,0,0,0,10,10,0,0,0,0,0,11,0,0,0,0,106,107,0,0,108,0,0,12,0,0,0,109,13,14,110,0,111,15,16,17,18,18,18,19,0,0,112,0,0,0,0,20,21,21,21,21,113,0,0,0,22,23,0,24,0,114,0,0,0,0,0,115,0,0,25,0,0,0,26,0,0,0,123,27,28,0,0,0,0,0,0,0,130,116,29,0,0,0,0,117,118,118,118,0,0,119,0,0,0,0,120,121,122,122,122,30,0,0,0,0,37,32,0,0,33,34,0,35,0,0,36,36,125,125,125,125,126,126,0,0,41,0,0,42,43,44,45,46,47,48,49,0,0,0,0,129,0,0,0,0,52,0,0,0,0,0,124,0,0,0,0,38,31,0,0,0,39,0,40,40,40,40,101,127,0,50,51,0,128,131,0,0,0,0,-24432,-23552,-23552,-24576,-24560,-24576,-32640,-24576,-30592,-22400,-24320,-24576,-24576,-24576,-24512,-24576,-32256,-24560,-32736,-32768,-24576,-24576,-24572,-32768,-24576,-24576,-24576,-32224,-32224,-32736,-24576,-24576,-24448,-24499,-30720,-32256,-24576,-24576,8320,-24576,-16384,-32224,-24448,-15872,8192,-24576,-8048,-24503,-8176,-8176,-8192,-8176,-32640,-8064,-24572,-24572,-24572,-32736,-24448,-24560,-32736,-32768,-28160,-32254,-28160,4608,-15872,-32256,-32256,-32254,-32768,-32768,-32256,-32256,-32256,-32256,-32256,-32256,-32256,-32256,-32256,-32256,-32256,-32256,8192,8192,-24560,-24560,-24572,-24560,-8176,-24576,-32768,-24448,-24576,-24572,-24576,-32768,-32640,-32768,-32768,-32768,-32768,-8192,-32640,-8176,-32768,-24576,-24576,-24560,-32736,-8176,-24576,-8048,-8048,-8048,-8048,-8176,-11776,-32768,-24576,-8176,-30720,-24576,-32256,-32768,-32256,-32256,-32256,-15872,-15872,-22528,-32736,8192,-32768,-32768,-32768,-23552,-7168,-7168,-7168,-32736,-8176,-32256,-32256,-32256,-32256,-8176,-8176,-15872,-32256,-32736,-24560,-24448,-24448,-24576,-24576,-24576,-32256,-32256,-32256,-32256,-32256,-32256,-32256,-32256,-32256,-32256,-32256,-32256,-32256,4608,-28160,-28160,-28160,-32256,-32256,-32256,-32256,-32256,-32256,-32256,-32256,-32256,-32256,-8176,-32256,-8192,-32256,0,0,-32256,-32256,-24064,-24064,-32256,-32256,-32256,-32768,-32252,-32252,-32256,-32256,-32256,-32256,-32256,-32256,-32256,-30720,-32224,-32256,-32256,-32256,-32256,-32736,-32256,0,0,0,0,0,0,0,32,0,0,0,0,0,0,32,4096,512,512,0,0,32,0,128,512,512,0,0,32,0,8192,0,32,32,0,0,0,8192,0,40,0,0,0,0,0,8192,0,0,8192,0,0,0,0,0,0,0,0,0,0,0,0,0,128,0,0,128,512,0,0,0,0,0,0,0,0,0,0,32,0,0,0,0,0,0,0,0,0,32,2048,0,0,0,0,0,10,0,0,0,-32768,0,0,0,10,1,0,4096,0,0,0,0,0,8,0,9,0,0,0,0,0,0,0,0,0,32,8224,0,0,0,0,0,8224,0,0,0,-32768,-32768,0,0,0,0,0,10,0,0,0,0,9216,0,2048,2048,2048,2048,8192,8192,0,0,128,8,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,128,16,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,0,0,0,0,9216,0,0,0,0,0,0,0,0,0,0,5,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,10,12,9,0,0,0,15,4,3,14,0,0,5,0,0,10,0,0,2,0,15,0,0,0,0,0,0,0,0,0,0,0,0,0,10,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,10,10,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,10,0,0,0,15,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,10,10,0,0,0,0,5,0,1,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,15,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,10,5,0,0,0,8,11,7,6,0,0,3,0,0,10,0,0,5,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,10,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,10,13,0,0,0,0,0,0,0,0,10,0,0,0,0,0,0,0,0,12,0,0,0,10,0,0,0,0,0,0,0,0,0,10,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,15,5,0,0,0,0,5,0,1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,5,5,10,20,10,10000,5,10000,5,4,10,5,30,15,5,10000,25,10000,25,20,20,10,10000,15,20,10,10000,10000,10000,5,20,55,20,10000,10000,10,50,40,10,5,10000,10,5,35,5,5,10,5,2,2,2,10000,10,6,10,5,10000,10,15,10000,10,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,15,8,20,20,5,20,2,3,5,10,5,15,20,70,10000,10000,10000,10000,10000,10,10000,1,10000,10,9,1,10000,1,40,10,10,10,10,1,5,5,15,70,10000,60,0,10,5,5,5,5,5,10,0,8,10000,10000,100,10,4,4,4,0,3,5,5,5,5,10,25,5,5,5,20,6,6,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,4,5,4,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,15,0,0,0,0,0,50,0,10000,4,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,35,0,50,0,0,0,20,0,0,0,5,0,0,0,0,0,0,0,0,0,10,7,0,0,0,10000,5,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,100,0,0,0,20,0,0,0,100,6,0,0,0,0,0,15,0,10,0,2,0,0,0,0,2,2,2,2,0,0,0,0,0,10000,0,0,0,0,0,0,0,0,5,0,0,0,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,6,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1000,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,74,78,77,0,8,6,0,7,7,8,8,0,8,36,10,0,16,16,16,16,16,49,92,50,51,45,46,47,44,80,61,76,64,75,83,0,90,93,95,96,40,96,97,97,99,8,99,0,2,100,0,100,100,101,103,105,190,0,5,98,25,8,8,2,91,77,0,93,94,98,79,93,98,100,100,100,100,100,78,120,122,116,106,0,41,0,0,106,120,112,0,118,118,126,0,0,0,131,133,131,135,0,135,0,7,42,0,0,0,134,134,134,134,0,137,137,137,137,0,0,141,140,139,139,139,143,142,146,146,146,144,145,143,144,144,144,144,138,138,147,33,123,110,154,156,155,155,0,147,0,0,0,0,0,177,177,177,177,177,177,177,177,177,177,177,159,160,179,166,185,182,183,183,183,183,183,183,183,183,183,183,188,26000,18500,26000,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,178,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,10,0,0,0,0,0,0,0,0,19,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,39,0,0,0,0,0,0,0,0,0,0,0,53,0,0,54,0,0,0,0,0,0,61,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,90,0,0,0,94,0,0,0,98,98,98,0,0,0,0,105,0,105,0,0,0,0,0,0,0,0,0,116,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,153,0,0,154,155,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,-2562,0,0,-2568,0,0,-2575,0,-2584,-2610,-2634,-2651,0,-2674,0,0,0,0,0,0,0,0,0,0,0,0,-2676,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,-2677,0,0,0,0,0,0,0,0,0,0,0,0,-2697,0,-2719,0,0,0,0,0,-2724,0,-2739,-2740,-2741,-2742,-2743,-2762,0,0,-2764,0,0,0,0,0,0,0,-2768,-2774,0,0,0,0,0,0,0,0,0,0,0,-2780,0,0,0,0,-2799,-2818,-2842,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,-2846,0,-2859,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,15,63,65,66,84,119,146,146,147,172,172,172,173,174,175,189,0,0,0,0,0,6,36,9,122,157,124,125,111,184,186,187,181,186,184,189,0,0,0,0,0,24,0,0,350,0,0,0,0,0,0,0,0,0,0,0,0,-1,0,5,12,0,0,0,0,0,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,0,0,1,0,1,1,1,1,1,1,1,1,1,1,1,0,0,1,0,0,1,0,1,1,0,0,3,19,61,58,0,0,0,0,0,0,0,0,0,14,13,0,0,4,5,3,0,3,2,138,178,0,0,0,0,0,0,0,0,0,193,142,215,0,0,1,2,0,0,3,3,0,0,0,0,0,885,1022,-1,-2,-3,-14,-115,-148,-149,-153,-155,-158,-159,-161,-162,-163,-167,-170,-173,-174,-175,-176,-177,-180,-181,-183,-184,-185,-186,-188,-189,-190,-191,-192,-195,-197,-200,-202,-203,-206,-207,-209,-210,-211,-214,-216,-217,-224,-225,-226,-227,-229,-231,-234,-236,-237,-242,-244,-245,-246,-249,-256,-258,-261,-262,-265,-271,-273,-276,-279,-282,-284,-285,-286,-287,-288,-289,-290,-291,-292,-293,-294,-295,-296,-298,-300,-301,-303,-304,-305,-306,-307,-308,-309,-310,-311,-312,-313,-316,-317,-318,-322,-325,-326,-327,-328,-330,-333,-334,-336,-337,-338,-339,-340,-341,-344,-345,-348,-350,-352,-356,-363,-369,-370,-372,-373,-374,-375,-376,-377,-379,-380,-381,-382,-383,-384,-385,-386,-387,-388,-389,-390,-391,-392,-393,-395,-396,-398,-400,-401,-402,-404,-406,-407,-408,-409,-410,-411,-412,-413,-414,-416,-418,-422,-426,-427,-428,-429,-430,-432,-433,-437,-439,-440,-441,-442,-443,-444,-445,-446,-447,-448,-449,-450,-452,-453,-454,-455,-456,-457,-459,-462,-464,-466,-467,-468,-469,-470,-471,-473,-474,-475,-477,-478,-479,-480,-482,-484,-485,-486,-487,-488,-489,-490,-491,-492,-493,-494,-495,-496,-498,-499,-500,-501,-502,-503,-504,-505,-508,-509,-510,-512,-513,-514,-515,-518,-519,-520,-521,-522,-523,-524,-525,-526,-527,-528,-529,-530,-532,-535,-536,-537,-538,-539,-540,-541,-542,-543,-544,-549,-551,-552,-555,-558,-560,-563,-567,-568,-569,-570,-571,-572,-573,-574,-576,-577,-579,-580,-581,-582,-583,-584,-585,-588,-589,-590,-593,-595,-596,-597,-602,-604,-605,-606,-608,-609,-612,-614,-615,-616,-617,-618,-619,-620,-622,-623,-625,-626,-627,-628,-629,-630,-631,-632,-633,-634,-635,-636,-637,-638,-639,-640,-641,-642,-643,-644,-645,-646,-647,-648,-649,-650,-651,-652,-653,-654,-655,-658,-659,-661,-662,-663,-664,-665,-666,-667,-668,-669,-670,-671,-672,-673,-674,-675,-676,-677,-678,-679,-680,-681,-682,-683,-684,-685,-686,-688,-689,-692,-693,-694,-695,-696,-697,-698,-699,-700,-701,-702,-703,-704,-705,-706,-707,-708,-709,-710,-711,-712,-713,-714,-715,-716,-717,-718,-719,-720,-721,-722,-723,-724,-725,-726,-727,-728,-729,-730,-731,-732,-733,-734,-735,-736,-737,-738,-739,-740,-741,-742,-743,-744,-745,-746,-747,-748,-749,-750,-751,-753,-754,-755,-756,-757,-758,-759,-760,-762,-764,-766,-768,-769,-770,-771,-772,-773,-774,-777,-778,-779,-780,-781,-782,-783,-784,-785,-786,-787,-788,-789,-790,-791,-793,-794,-795,-796,-797,-798,-799,-800,-801,-802,-803,-804,-805,-806,-807,-808,-809,-810,-811,-812,-813,-814,-815,-816,-817,-818,-819,-820,-821,-822,-823,-824,-825,-826,-827,-828,-829,-830,-831,-832,-834,-836,-837,-839,-840,-842,-844,-846,-847,-850,-851,-853,-854,-856,-857,-858,-859,-861,-862,-863,-864,-865,-866,-867,-868,-869,-870,-871,-872,-873,-874,-875,-876,-877,-878,-879,-880,-881,-883,-884,-885,-887,-888,-889,-890,-891,-893,-894,-895,-896,-897,-898,-899,-900,-901,-902,-903,-904,-905,-906,-907,-908,-909,-910,-911,-912,-913,-914,-915,-916,-917,-918,-919,-921,-924,-925,-926,-927,-928,-930,-931,-932,-933,-934,-935,-938,-941,-943,-945,-949,-951,-953,-955,-957,-958,-959,-960,-961,-963,-964,-965,-966,-967,-968,-969,-970,-971,-972,-974,-978,-981,-983,-985,-987,-988,-989,-990,-991,-992,-993,-994,-995,-996,-997,-998,-999,-1000,-1003,-1005,-1007,-1008,-1009,-1010,-1011,-1012,-1013,-1014,-1015,-1019,-1025,-1028,-1029,-1030,-1033,-1037,-1039,-1040,-1041,-1042,-1048,-1049,-1050,-1051,-1052,-1054,-1055,-1056,-1058,-1059,-1060,-1061,-1062,-1064,-1065,-1066,-1067,-1068,-1069,-1070,-1071,-1072,-1073,-1074,-1075,-1076,-1077,-1078,-1079,-1080,-1081,-1082,-1083,-1084,-1088,-1093,-1098,-1099,-1101,-1102,-1103,-1125,-1127,-1129,-1132,-1134,-1136,-1141,-1142,-1143,-1144,-1145,-1146,-1147,-1148,-1149,-1152,-1156,-1161,-1164,-1166,-1168,-1169,-1171,-1176,-1187,-1188,-1189,-1190,-1191,-1192,-1193,-1194,-1195,-1198,-1200,-1201,-1204,-1208,-1218,-1229,-1230,-1231,-1232,-1233,-1234,-1235,-1236,-1237,-1238,-1239,-1241,-1242,-1243,-1244,-1246,-1250,-1252,-1255,-1256,-1260,-1261,-1262,-1263,-1264,-1265,-1266,-1267,-1268,-1269,-1270,-1271,-1272,-1273,-1274,-1275,-1276,-1277,-1278,-1280,-1281,-1296,-1297,-1299,-1300,-1302,-1303,-1304,-1305,-1306,-1307,-1308,-1309,-1310,-1311,-1312,-1313,-1314,-1315,-1316,-1317,-1318,-1319,-1320,-1321,-1329,-1330,-1331,-1332,-1333,-1334,-1335,-1336,-1337,-1338,-1339,-1340,-1341,-1342,-1343,-1344,-1345,-1346,-1347,-1348,-1349,-1350,-1351,-1352,-1353,-1354,-1355,-1356,-1357,-1359,-1361,-1362,-1363,-1364,-1368,-1371,-1372,-1373,-1374,-1375,-1376,-1377,-1378,-1379,-1382,-1383,-1384,-1385,-1386,-1387,-1389,-1390,-1391,-1392,-1393,-1394,-1395,-1396,-1397,-1398,-1399,-1400,-1401,-1402,-1403,-1404,-1405,-1407,-1408,-1409,-1410,-1414,-1417,-1418,-1419,-1420,-1422,-1423,-1424,-1425,-1427,-1429,-1430,-1431,-1432,-1433,-1442,-1443,-1444,-1445,-1446,-1447,-1449,-1450,-1451,-1452,-1453,-1454,-1455,-1456,-1457,-1458,-1459,-1460,-1461,-1462,-1463,-1464,-1465,-1466,-1467,-1468,-1469,-1470,-1471,-1472,-1473,-1474,-1475,-1476,-1477,-1478,-1479,-1480,-1481,-1482,-1483,-1484,-1485,-1486,-1487,-1488,-1489,-1490,-1491,-1492,-1493,-1494,-1495,-1496,-1497,-1498,-1499,-1500,-1501,-1502,-1503,-1504,-1505,-1506,-1507,-1509,-1510,-1511,-1512,-1513,-1514,-1515,-1517,-1519,-1520,-1521,-1522,-1524,-1526,-1527,-1528,-1529,-1530,-1531,-1532,-1533,-1534,-1536,-1537,-1538,-1539,-1540,-1541,-1542,-1543,-1544,-1545,-1546,-1547,-1549,-1550,-1552,-1553,-1554,-1555,-1556,-1557,-1558,-1559,-1560,-1562,-1563,-1564,-1565,-1566,-1568,-1569,-1571,-1572,-1573,-1574,-1576,-1578,-1580,-1581,-1583,-1585,-1586,-1587,-1589,-1591,-1592,-1594,-1596,-1597,-1599,-1601,-1602,-1604,-1606,-1607,-1608,-1609,-1611,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
var READ={},STOP={};
function Z(n){var a=new Array(n);for(var i=0;i<n;i++)a[i]=0;return a}
function CZ(a,k,n){for(var i=0;i<n;i++)a[k+i]='\0'}
function DIV(a,b){if(b===0)throw new RangeError('divide');return Math.trunc(a/b)|0}
function ICHAR(c){return c===0?0:String(c).charCodeAt(0)}
P.command({names:['zork'],run:function(){
var o='',pipe=P.stdin(),np=0,G;
/* ---------- output, a record at a time; the first character of each is carriage control ---------- */
function pr(s){
  o+=s;
  var i=o.lastIndexOf('\n');
  if(i>=0){P.say(o.slice(0,i).split('\n'));o=o.slice(i+1)}
}
var MUTE=false;
function record(s,more){
  if(MUTE)return;
  var c=s.charAt(0);
  s=s.slice(1);
  if(c==='0')s='\n'+s;
  pr(more?s:s+'\n');
}
/* ---------- FORMAT ---------- */
var FC={};
function parseformat(s){
  if(P.has(FC,s))return FC[s];
  var i=0,rev=0;
  function list(){
    var L=[];
    while(i<s.length){
      var c=s.charAt(i);
      if(c===' '||c===','){i++;continue}
      if(c===')'){i++;break}
      if(c==="'"){
        var t='';i++;
        for(;;){
          if(s.charAt(i)==="'"){if(s.charAt(i+1)==="'"){t+="'";i+=2;continue}i++;break}
          t+=s.charAt(i++);
          if(i>s.length)break;
        }
        L.push({k:'S',v:t});continue;
      }
      if(c==='/'){L.push({k:'/'});i++;continue}
      if(c==='$'){L.push({k:'$'});i++;continue}
      var n='';
      while(/[0-9]/.test(s.charAt(i)))n+=s.charAt(i++);
      var r=n===''?1:+n;
      c=s.charAt(i++);
      if(c==='('){
        var inner=list();
        L.push({k:'(',at:0});
        for(var q=0;q<r;q++)L=L.concat(inner);
        continue;
      }
      if(c==='X'){L.push({k:'X',n:r});continue}
      var w='';
      while(/[0-9]/.test(s.charAt(i)))w+=s.charAt(i++);
      for(var q2=0;q2<r;q2++)L.push({k:c,w:w===''?0:+w,rw:w===''});
    }
    return L;
  }
  var F=list();
  /* when the list outlasts the format it starts again at the last group, or at the beginning */
  for(var k=F.length-1;k>=0;k--)if(F[k].k==='('){rev=k;break}
  return FC[s]={F:F,rev:rev};
}
function WSTART(f){
  var pf=parseformat(f),F=pf.F,i=0,line='',skip=0; /* an X only counts if something comes after it */
  function add(t){line+=' '.repeat(skip)+t;skip=0}
  function walk(){ /* up to the next item that takes a value */
    for(;;){
      if(i>=F.length)return false;
      var e=F[i];
      if(e.k==='S'){add(e.v);i++}
      else if(e.k==='X'){skip+=e.n;i++}
      else if(e.k==='/'){record(line);line='';skip=0;i++}
      else if(e.k==='('||e.k==='$')i++;
      else return true;
    }
  }
  return {
    put:function(v){
      if(!walk()){record(line);line='';skip=0;i=pf.rev;walk()}
      var e=F[i++],s;
      if(e.k==='I')s=String(v|0);
      else if(e.k==='A'){s=String(v);if(e.w&&s.length<e.w)s=s.padStart(e.w);else if(e.w)s=s.slice(0,e.w)}
      else if(e.k==='L')s=v?'T':'F';
      else if(e.k==='Z')s=((v|0)>>>0).toString(16).toUpperCase();
      else s=String(v);
      if(e.k!=='A'&&e.w){if(s.length>e.w)s='*'.repeat(e.w);else s=s.padStart(e.w)}
      add(s);
    },
    end:function(){
      walk();
      var dollar=F.length&&F[F.length-1].k==='$';
      record(line,dollar);
    }
  };
}
function RSTART(f,l){
  if(l===null)throw STOP;
  var pf=parseformat(f),F=pf.F,i=0,at=0,s=String(l);
  return function(){
    for(;;){
      if(i>=F.length){i=pf.rev;s='';at=0} /* wants more than the line had: a blank line */
      var e=F[i];
      if(e.k==='S'){at+=e.v.length;i++}
      else if(e.k==='X'){at+=e.n;i++}
      else if(e.k==='('||e.k==='$')i++;
      else if(e.k==='/'){s='';at=0;i++}
      else break;
    }
    i++;
    var w=e.w||1,t=s.slice(at,at+w);
    at+=w;
    if(e.k==='A')return t.padEnd(w);
    if(e.k==='L')return /^\s*\.?[Tt]/.test(t)?1:0;
    t=t.replace(/ /g,'');
    if(t==='')return 0;
    if(e.k==='Z'){if(!/^[0-9a-fA-F]+$/.test(t))throw new RangeError('read');return parseInt(t,16)|0}
    if(!/^[-+]?[0-9]+$/.test(t))throw new RangeError('read'); /* f2c's runtime stops here, with its complaint */
    return parseInt(t,10)|0;
  };
}
/* ---------- the data base ---------- */
var dxat=0;
function RINDX(){
  return function(){
    var v=DINDX[dxat++];
    return v;
  };
}
function DBREC(x){
  var r=DTEXT[x-1],i=-1;
  if(!r)throw new RangeError('no record '+x);
  return function(){
    if(i<0){i=0;return r[0]}
    var c=i<r[1].length?r[1].charCodeAt(i):32;
    i++;
    return String.fromCharCode(c^10);
  };
}
/* ---------- the save file ---------- */
var save=null,saveat=0,writing=false,SAVELEN=3050;
function goodsave(s){
  return Array.isArray(s)&&s.length===SAVELEN&&s.every(function(v){return Number.isInteger(v)&&Math.abs(v)<=0x7fffffff});
}
function IOPEN(name,status){
  if(name==='DINDX.DAT'){dxat=0;return true}
  if(name==='DTEXT.DAT')return true;
  if(status==='OLD'){
    var s=P.saved('zork/dsave');
    if(typeof s==='string'){try{s=JSON.parse(s)}catch(e){s=null}}
    if(!goodsave(s))return false;
    save=s;saveat=0;writing=false;
    return true;
  }
  save=[];saveat=0;writing=true;
  return true;
}
function ICLOSE(){
  if(writing&&save){P.save('zork/dsave',JSON.stringify(save));writing=false}
}
function SAVEPUT(v){save.push(v)}
function SAVEGET(){return save[saveat++]}
function GETTIM(H,H_,M,M_,S,S_){
  var t=Math.floor(Date.now()/1000);
  H[H_]=Math.floor(t/3600)%24;
  M[M_]=Math.floor((t-Math.floor(t/3600)*3600)/60);
  S[S_]=t%60;
}
var C_XINFMT=Z(1);
var C_PRSVEC=Z(5);
var C_ORPHS=Z(5);
var C_LAST=Z(1);
var C_PV=Z(5);
var C_SYNTAX=Z(11);
var C_SYNFLG=Z(6);
var C_OBJFLG=Z(7);
var C_PLAY=Z(3);
var C_STATE=Z(11);
var C_SCREEN=Z(23);
var C_PUZZLE=Z(88);
var C_RMSG=Z(1051);
var C_INPUTL=Z(1);
var C_INPUT=Z(78);
var C_STAR=Z(2);
var C_VERS=Z(3);
var C_TIME=Z(4);
var C_BATS=Z(9);
var C_CHAN=Z(4);
var C_DEBUG=Z(3);
var C_HYPER=Z(1);
var C_ROOMS=Z(1002);
var C_RFLAG=Z(12);
var C_RINDEX=Z(86);
var C_EXITS=Z(901);
var C_CURXT=Z(5);
var C_XPARS=Z(14);
var C_XSRCH=Z(10);
var C_OBJCTS=Z(3081);
var C_OROOM2=Z(41);
var C_OFLAGS=Z(32);
var C_OINDEX=Z(121);
var C_CEVENT=Z(76);
var C_CINDEX=Z(24);
var C_HACK=Z(5);
var C_VILL=Z(21);
var C_ADVS=Z(29);
var C_AFLAGS=Z(1);
var C_AINDEX=Z(3);
var C_VINDEX=Z(70);
var C_FINDEX=Z(68);
var C_RANSEED=Z(1);
var C_BUZVOC=Z(20);
var C_PRPVOC=Z(45);
var C_DIRVOC=Z(75);
var C_ADJVOC=Z(405);
var C_VRBVOC=Z(935);
var C_OBJVOC=Z(1021);
var L_DUNGEO=Z(1);
var L_BD1=Z(0);
var L_AAPPLI=Z(4);
var L_THIEFD=Z(15);
var L_BALLOP=Z(3);
var L_LIGHTP=Z(4);
var L_CEVAPP=Z(41);
var L_LITINT=Z(0);
var L_FIGHTD=Z(12);
var L_BLOW=Z(150);
var L_SWORDD=Z(5);
var L_INFEST=Z(1);
var L_GAME=Z(21);
CZ(L_GAME,9,4);
CZ(L_GAME,13,3);
var L_XENDMV=Z(4);
var L_XVEHIC=Z(3);
var L_INIT=Z(27);
var L_PRINCR=Z(9);
var L_INVENT=Z(5);
var L_PRINCO=Z(2);
var L_MOVETO=Z(6);
var L_SCORE=Z(20);
CZ(L_SCORE,15,1);
var L_SCRUPD=Z(0);
var L_FINDXT=Z(3);
var L_FWIM=Z(5);
var L_YESNO=Z(2);
CZ(L_YESNO,0,1);
var L_ROBADV=Z(3);
var L_ROBRM=Z(5);
var L_WINNIN=Z(4);
var L_FIGHTS=Z(3);
var L_VILSTR=Z(3);
var L_GTTIME=Z(3);
var L_OPNCLS=Z(2);
var L_LIT=Z(7);
var L_WEIGHT=Z(5);
var L_GHERE=Z(1);
var L_MRHERE=Z(1);
var L_ENCRYP=Z(25);
CZ(L_ENCRYP,0,6);
CZ(L_ENCRYP,6,6);
CZ(L_ENCRYP,12,6);
var L_CPGOTO=Z(2);
var L_CPINFO=Z(27);
CZ(L_CPINFO,8,8);
CZ(L_CPINFO,16,5);
CZ(L_CPINFO,21,1);
var L_RSPEAK=Z(0);
var L_RSPSUB=Z(0);
var L_RSPSB2=Z(164);
CZ(L_RSPSB2,0,74);
CZ(L_RSPSB2,74,74);
var L_OBJACT=Z(2);
var L_BUG=Z(0);
var L_NEWSTA=Z(0);
var L_QHERE=Z(3);
var L_QEMPTY=Z(3);
var L_JIGSUP=Z(20);
var L_OACTOR=Z(3);
var L_PROB=Z(2);
var L_RMDESC=Z(6);
var L_RAPPLI=Z(4);
var L_TAKE=Z(7);
var L_DROP=Z(6);
var L_PUT=Z(8);
var L_VALUAC=Z(14);
var L_SAVEGM=Z(1);
var L_RSTRGM=Z(3);
var L_WALK=Z(7);
var L_CXAPPL=Z(8);
var L_GDT=Z(102);
CZ(L_GDT,0,38);
CZ(L_GDT,38,1);
CZ(L_GDT,80,2);
var L_ZAND=Z(1);
var L_ZOR=Z(1);
var L_ZXOR=Z(1);
var L_ZNOT=Z(1);
var L_EXIT=Z(0);
var L_ITIME=Z(0);
var L_KDATE=Z(0);
var L_INIRND=Z(0);
var L_ZRND=Z(3);
var L_MACHDV=Z(0);
var L_NOBJS=Z(19);
var L_MIRPAN=Z(3);
var L_SOBJS=Z(14);
var L_SPARSE=Z(23);
var L_GETOBJ=Z(11);
var L_SCHLST=Z(10);
var L_THISIT=Z(4);
var L_SYNMCH=Z(12);
var L_UNPACK=Z(2);
var L_SYNEQL=Z(1);
var L_TAKEIT=Z(3);
var L_GWIM=Z(6);
var L_RDLINE=Z(3);
var L_PARSE=Z(45);
var L_ORPHAN=Z(0);
var L_LEX=Z(20);
CZ(L_LEX,0,1);
CZ(L_LEX,1,9);
var L_BD87=Z(0);
var L_OAPPLI=Z(30);
var L_RAPPL1=Z(15);
var L_RAPPL2=Z(8);
var L_LOOKTO=Z(4);
var L_EWTELL=Z(2);
var L_SVERBS=Z(176);
CZ(L_SVERBS,32,78);
CZ(L_SVERBS,110,6);
CZ(L_SVERBS,116,6);
CZ(L_SVERBS,122,6);
CZ(L_SVERBS,156,1);
var L_VAPPLI=Z(32);
var L_CLOCKD=Z(3);
var L_TROLLP=Z(4);
var L_CYCLOP=Z(2);
var L_THIEFP=Z(8);
C_VERS[0]=2;
C_VERS[1]=0;
C_VERS[2]=1;
C_SYNFLG[0]=16384;
C_SYNFLG[1]=8192;
C_SYNFLG[2]=4096;
C_SYNFLG[3]=2048;
C_SYNFLG[4]=1024;
C_SYNFLG[5]=511;
C_OBJFLG[0]=16384;
C_OBJFLG[1]=8192;
C_OBJFLG[2]=4096;
C_OBJFLG[3]=2048;
C_OBJFLG[4]=1024;
C_OBJFLG[5]=512;
C_OBJFLG[6]=511;
C_BATS[0]=66;
C_BATS[1]=67;
C_BATS[2]=68;
C_BATS[3]=69;
C_BATS[4]=70;
C_BATS[5]=71;
C_BATS[6]=72;
C_BATS[7]=65;
C_BATS[8]=73;
C_SCREEN[3]=1024;
C_SCREEN[4]=153;
C_SCREEN[5]=5120;
C_SCREEN[6]=154;
C_SCREEN[7]=3072;
C_SCREEN[8]=152;
C_SCREEN[9]=7168;
C_SCREEN[10]=151;
C_SCREEN[11]=151;
C_SCREEN[12]=207;
C_SCREEN[13]=3072;
C_SCREEN[14]=152;
C_SCREEN[15]=208;
C_SCREEN[16]=7168;
C_SCREEN[17]=153;
C_SCREEN[18]=206;
C_SCREEN[19]=5120;
C_SCREEN[20]=154;
C_SCREEN[21]=205;
C_SCREEN[22]=1024;
C_HYPER[0]=500;
C_PUZZLE[0]=1024;
C_PUZZLE[1]=-8;
C_PUZZLE[2]=2048;
C_PUZZLE[3]=-7;
C_PUZZLE[4]=3072;
C_PUZZLE[5]=1;
C_PUZZLE[6]=4096;
C_PUZZLE[7]=9;
C_PUZZLE[8]=5120;
C_PUZZLE[9]=8;
C_PUZZLE[10]=6144;
C_PUZZLE[11]=7;
C_PUZZLE[12]=7168;
C_PUZZLE[13]=-1;
C_PUZZLE[14]=8192;
C_PUZZLE[15]=-9;
C_PUZZLE[16]=205;
C_PUZZLE[17]=-8;
C_PUZZLE[18]=206;
C_PUZZLE[19]=8;
C_PUZZLE[20]=207;
C_PUZZLE[21]=1;
C_PUZZLE[22]=208;
C_PUZZLE[23]=-1;
C_PUZZLE[24]=1;
C_PUZZLE[25]=1;
C_PUZZLE[26]=1;
C_PUZZLE[27]=1;
C_PUZZLE[28]=1;
C_PUZZLE[29]=1;
C_PUZZLE[30]=1;
C_PUZZLE[31]=1;
C_PUZZLE[32]=1;
C_PUZZLE[33]=0;
C_PUZZLE[34]=-1;
C_PUZZLE[35]=0;
C_PUZZLE[36]=0;
C_PUZZLE[37]=-1;
C_PUZZLE[38]=0;
C_PUZZLE[39]=1;
C_PUZZLE[40]=1;
C_PUZZLE[41]=-1;
C_PUZZLE[42]=0;
C_PUZZLE[43]=1;
C_PUZZLE[44]=0;
C_PUZZLE[45]=-2;
C_PUZZLE[46]=0;
C_PUZZLE[47]=1;
C_PUZZLE[48]=1;
C_PUZZLE[49]=0;
C_PUZZLE[50]=0;
C_PUZZLE[51]=0;
C_PUZZLE[52]=0;
C_PUZZLE[53]=1;
C_PUZZLE[54]=0;
C_PUZZLE[55]=1;
C_PUZZLE[56]=1;
C_PUZZLE[57]=-3;
C_PUZZLE[58]=0;
C_PUZZLE[59]=0;
C_PUZZLE[60]=-1;
C_PUZZLE[61]=-1;
C_PUZZLE[62]=0;
C_PUZZLE[63]=1;
C_PUZZLE[64]=1;
C_PUZZLE[65]=0;
C_PUZZLE[66]=0;
C_PUZZLE[67]=-1;
C_PUZZLE[68]=0;
C_PUZZLE[69]=0;
C_PUZZLE[70]=0;
C_PUZZLE[71]=1;
C_PUZZLE[72]=1;
C_PUZZLE[73]=1;
C_PUZZLE[74]=1;
C_PUZZLE[75]=0;
C_PUZZLE[76]=0;
C_PUZZLE[77]=0;
C_PUZZLE[78]=1;
C_PUZZLE[79]=1;
C_PUZZLE[80]=1;
C_PUZZLE[81]=1;
C_PUZZLE[82]=1;
C_PUZZLE[83]=1;
C_PUZZLE[84]=1;
C_PUZZLE[85]=1;
C_PUZZLE[86]=1;
C_PUZZLE[87]=1;
C_CINDEX[0]=1;
C_CINDEX[1]=2;
C_CINDEX[2]=3;
C_CINDEX[3]=4;
C_CINDEX[4]=5;
C_CINDEX[5]=6;
C_CINDEX[6]=7;
C_CINDEX[7]=8;
C_CINDEX[8]=9;
C_CINDEX[9]=10;
C_CINDEX[10]=11;
C_CINDEX[11]=12;
C_CINDEX[12]=13;
C_CINDEX[13]=14;
C_CINDEX[14]=15;
C_CINDEX[15]=16;
C_CINDEX[16]=17;
C_CINDEX[17]=18;
C_CINDEX[18]=19;
C_CINDEX[19]=20;
C_CINDEX[20]=21;
C_CINDEX[21]=22;
C_CINDEX[22]=23;
C_CINDEX[23]=24;
C_XPARS[0]=255;
C_XPARS[1]=31744;
C_XPARS[2]=3;
C_XPARS[3]=256;
C_XPARS[4]=256;
C_XPARS[9]=1;
C_XPARS[10]=2;
C_XPARS[11]=3;
C_XPARS[12]=4;
C_XPARS[5]=1;
C_XPARS[6]=2;
C_XPARS[7]=3;
C_XPARS[8]=3;
C_XPARS[13]=32768;
C_XSRCH[0]=1024;
C_XSRCH[1]=16384;
C_XSRCH[3]=9216;
C_XSRCH[2]=10240;
C_XSRCH[4]=1024;
C_XSRCH[5]=5120;
C_XSRCH[6]=13312;
C_XSRCH[7]=14336;
C_XSRCH[8]=3072;
C_XSRCH[9]=7168;
C_AINDEX[0]=1;
C_AINDEX[1]=2;
C_AINDEX[2]=3;
C_AFLAGS[0]=32768;
C_RFLAG[0]=32768;
C_RFLAG[1]=16384;
C_RFLAG[2]=8192;
C_RFLAG[3]=4096;
C_RFLAG[4]=2048;
C_RFLAG[5]=1024;
C_RFLAG[6]=512;
C_RFLAG[7]=256;
C_RFLAG[8]=128;
C_RFLAG[9]=64;
C_RFLAG[10]=32;
C_RFLAG[11]=16;
C_RINDEX[0]=2;
C_RINDEX[1]=8;
C_RINDEX[2]=9;
C_RINDEX[3]=10;
C_RINDEX[4]=11;
C_RINDEX[5]=25;
C_RINDEX[6]=30;
C_RINDEX[7]=31;
C_RINDEX[8]=33;
C_RINDEX[9]=36;
C_RINDEX[10]=40;
C_RINDEX[11]=42;
C_RINDEX[12]=44;
C_RINDEX[13]=49;
C_RINDEX[14]=61;
C_RINDEX[15]=76;
C_RINDEX[16]=77;
C_RINDEX[17]=79;
C_RINDEX[18]=80;
C_RINDEX[19]=83;
C_RINDEX[20]=91;
C_RINDEX[21]=94;
C_RINDEX[22]=96;
C_RINDEX[23]=97;
C_RINDEX[24]=100;
C_RINDEX[30]=101;
C_RINDEX[25]=102;
C_RINDEX[26]=103;
C_RINDEX[27]=107;
C_RINDEX[28]=108;
C_RINDEX[29]=109;
C_RINDEX[31]=112;
C_RINDEX[32]=113;
C_RINDEX[33]=114;
C_RINDEX[35]=119;
C_RINDEX[34]=120;
C_RINDEX[36]=121;
C_RINDEX[37]=122;
C_RINDEX[38]=126;
C_RINDEX[39]=127;
C_RINDEX[40]=128;
C_RINDEX[41]=129;
C_RINDEX[42]=130;
C_RINDEX[43]=131;
C_RINDEX[44]=132;
C_RINDEX[45]=133;
C_RINDEX[46]=135;
C_RINDEX[47]=140;
C_RINDEX[48]=141;
C_RINDEX[49]=142;
C_RINDEX[50]=143;
C_RINDEX[51]=144;
C_RINDEX[52]=145;
C_RINDEX[53]=146;
C_RINDEX[54]=147;
C_RINDEX[55]=148;
C_RINDEX[56]=151;
C_RINDEX[57]=153;
C_RINDEX[58]=154;
C_RINDEX[59]=155;
C_RINDEX[60]=157;
C_RINDEX[61]=158;
C_RINDEX[62]=159;
C_RINDEX[63]=160;
C_RINDEX[64]=161;
C_RINDEX[65]=162;
C_RINDEX[66]=163;
C_RINDEX[67]=164;
C_RINDEX[68]=165;
C_RINDEX[69]=166;
C_RINDEX[70]=167;
C_RINDEX[71]=171;
C_RINDEX[72]=172;
C_RINDEX[73]=173;
C_RINDEX[74]=174;
C_RINDEX[75]=176;
C_RINDEX[76]=177;
C_RINDEX[77]=179;
C_RINDEX[78]=182;
C_RINDEX[79]=183;
C_RINDEX[80]=184;
C_RINDEX[81]=185;
C_RINDEX[82]=186;
C_RINDEX[83]=188;
C_RINDEX[84]=189;
C_RINDEX[85]=190;
C_VINDEX[0]=1;
C_VINDEX[1]=2;
C_VINDEX[2]=3;
C_VINDEX[3]=4;
C_VINDEX[4]=5;
C_VINDEX[5]=6;
C_VINDEX[6]=7;
C_VINDEX[7]=8;
C_VINDEX[9]=100;
C_VINDEX[8]=101;
C_VINDEX[10]=102;
C_VINDEX[11]=103;
C_VINDEX[12]=104;
C_VINDEX[13]=105;
C_VINDEX[14]=106;
C_VINDEX[15]=107;
C_VINDEX[16]=108;
C_VINDEX[17]=109;
C_VINDEX[18]=110;
C_VINDEX[19]=111;
C_VINDEX[20]=112;
C_VINDEX[21]=113;
C_VINDEX[22]=114;
C_VINDEX[23]=115;
C_VINDEX[24]=116;
C_VINDEX[25]=117;
C_VINDEX[26]=118;
C_VINDEX[27]=119;
C_VINDEX[28]=120;
C_VINDEX[29]=121;
C_VINDEX[30]=122;
C_VINDEX[31]=123;
C_VINDEX[32]=124;
C_VINDEX[33]=125;
C_VINDEX[34]=126;
C_VINDEX[35]=127;
C_VINDEX[36]=128;
C_VINDEX[37]=129;
C_VINDEX[38]=130;
C_VINDEX[39]=131;
C_VINDEX[40]=132;
C_VINDEX[41]=133;
C_VINDEX[42]=134;
C_VINDEX[43]=135;
C_VINDEX[44]=136;
C_VINDEX[45]=137;
C_VINDEX[46]=138;
C_VINDEX[47]=139;
C_VINDEX[48]=141;
C_VINDEX[49]=140;
C_VINDEX[50]=142;
C_VINDEX[51]=143;
C_VINDEX[52]=144;
C_VINDEX[53]=145;
C_VINDEX[54]=146;
C_VINDEX[55]=147;
C_VINDEX[56]=148;
C_VINDEX[57]=89;
C_VINDEX[58]=91;
C_VINDEX[59]=73;
C_VINDEX[60]=85;
C_VINDEX[61]=151;
C_VINDEX[62]=152;
C_VINDEX[63]=153;
C_VINDEX[64]=154;
C_VINDEX[65]=155;
C_VINDEX[66]=156;
C_VINDEX[67]=157;
C_VINDEX[68]=158;
C_VINDEX[69]=159;
C_OFLAGS[0]=32768;
C_OFLAGS[1]=16384;
C_OFLAGS[2]=8192;
C_OFLAGS[3]=4096;
C_OFLAGS[4]=2048;
C_OFLAGS[5]=1024;
C_OFLAGS[6]=512;
C_OFLAGS[7]=256;
C_OFLAGS[8]=128;
C_OFLAGS[9]=64;
C_OFLAGS[10]=32;
C_OFLAGS[11]=16;
C_OFLAGS[12]=8;
C_OFLAGS[13]=4;
C_OFLAGS[14]=2;
C_OFLAGS[15]=1;
C_OFLAGS[16]=32768;
C_OFLAGS[17]=16384;
C_OFLAGS[18]=8192;
C_OFLAGS[19]=4096;
C_OFLAGS[20]=2048;
C_OFLAGS[21]=1024;
C_OFLAGS[22]=512;
C_OFLAGS[23]=256;
C_OFLAGS[24]=128;
C_OFLAGS[25]=64;
C_OFLAGS[26]=32;
C_OFLAGS[27]=16;
C_OFLAGS[28]=8;
C_OFLAGS[29]=4;
C_OFLAGS[30]=2;
C_OFLAGS[31]=1;
C_OINDEX[0]=2;
C_OINDEX[1]=3;
C_OINDEX[2]=4;
C_OINDEX[3]=5;
C_OINDEX[4]=7;
C_OINDEX[5]=8;
C_OINDEX[6]=9;
C_OINDEX[7]=10;
C_OINDEX[8]=11;
C_OINDEX[9]=12;
C_OINDEX[10]=13;
C_OINDEX[11]=14;
C_OINDEX[12]=15;
C_OINDEX[13]=16;
C_OINDEX[14]=17;
C_OINDEX[15]=18;
C_OINDEX[16]=19;
C_OINDEX[17]=20;
C_OINDEX[18]=21;
C_OINDEX[19]=23;
C_OINDEX[21]=26;
C_OINDEX[20]=30;
C_OINDEX[22]=33;
C_OINDEX[23]=34;
C_OINDEX[24]=35;
C_OINDEX[25]=36;
C_OINDEX[26]=39;
C_OINDEX[27]=42;
C_OINDEX[28]=45;
C_OINDEX[29]=46;
C_OINDEX[30]=47;
C_OINDEX[31]=48;
C_OINDEX[32]=51;
C_OINDEX[33]=54;
C_OINDEX[34]=55;
C_OINDEX[35]=56;
C_OINDEX[36]=57;
C_OINDEX[37]=58;
C_OINDEX[38]=59;
C_OINDEX[39]=61;
C_OINDEX[40]=62;
C_OINDEX[41]=63;
C_OINDEX[42]=65;
C_OINDEX[43]=66;
C_OINDEX[44]=71;
C_OINDEX[46]=79;
C_OINDEX[45]=78;
C_OINDEX[47]=75;
C_OINDEX[48]=85;
C_OINDEX[49]=86;
C_OINDEX[50]=87;
C_OINDEX[51]=88;
C_OINDEX[52]=89;
C_OINDEX[53]=90;
C_OINDEX[54]=92;
C_OINDEX[55]=94;
C_OINDEX[56]=96;
C_OINDEX[59]=97;
C_OINDEX[57]=98;
C_OINDEX[58]=99;
C_OINDEX[60]=101;
C_OINDEX[61]=102;
C_OINDEX[62]=103;
C_OINDEX[63]=105;
C_OINDEX[64]=107;
C_OINDEX[65]=109;
C_OINDEX[66]=110;
C_OINDEX[67]=111;
C_OINDEX[68]=112;
C_OINDEX[69]=113;
C_OINDEX[70]=119;
C_OINDEX[71]=123;
C_OINDEX[72]=124;
C_OINDEX[73]=125;
C_OINDEX[74]=126;
C_OINDEX[75]=127;
C_OINDEX[76]=132;
C_OINDEX[77]=133;
C_OINDEX[78]=134;
C_OINDEX[79]=137;
C_OINDEX[81]=139;
C_OINDEX[80]=138;
C_OINDEX[82]=140;
C_OINDEX[83]=141;
C_OINDEX[84]=142;
C_OINDEX[85]=145;
C_OINDEX[86]=148;
C_OINDEX[87]=149;
C_OINDEX[88]=151;
C_OINDEX[89]=152;
C_OINDEX[90]=154;
C_OINDEX[91]=155;
C_OINDEX[92]=156;
C_OINDEX[93]=157;
C_OINDEX[94]=158;
C_OINDEX[95]=159;
C_OINDEX[96]=161;
C_OINDEX[97]=164;
C_OINDEX[98]=171;
C_OINDEX[99]=172;
C_OINDEX[100]=173;
C_OINDEX[101]=175;
C_OINDEX[102]=178;
C_OINDEX[103]=185;
C_OINDEX[104]=186;
C_OINDEX[105]=187;
C_OINDEX[106]=188;
C_OINDEX[107]=189;
C_OINDEX[114]=192;
C_OINDEX[117]=193;
C_OINDEX[115]=194;
C_OINDEX[116]=195;
C_OINDEX[111]=196;
C_OINDEX[113]=197;
C_OINDEX[109]=198;
C_OINDEX[108]=200;
C_OINDEX[110]=201;
C_OINDEX[112]=202;
C_OINDEX[118]=205;
C_OINDEX[119]=209;
C_OINDEX[120]=215;
L_CEVAPP[0]=50;
L_CEVAPP[1]=20;
L_CEVAPP[2]=10;
L_CEVAPP[3]=5;
L_CEVAPP[4]=0;
L_CEVAPP[5]=156;
L_CEVAPP[6]=156;
L_CEVAPP[7]=156;
L_CEVAPP[8]=157;
L_CEVAPP[9]=0;
L_CEVAPP[10]=50;
L_CEVAPP[11]=30;
L_CEVAPP[12]=20;
L_CEVAPP[13]=10;
L_CEVAPP[14]=4;
L_CEVAPP[15]=0;
L_CEVAPP[16]=154;
L_CEVAPP[17]=154;
L_CEVAPP[18]=154;
L_CEVAPP[19]=154;
L_CEVAPP[20]=155;
L_CEVAPP[21]=0;
L_FIGHTD[11]=1;
L_BLOW[129]=0;
L_BLOW[147]=1;
L_BLOW[139]=2;
L_BLOW[148]=3;
L_BLOW[149]=4;
L_BLOW[141]=5;
L_BLOW[144]=6;
L_BLOW[143]=7;
L_BLOW[142]=8;
L_BLOW[3]=1;
L_BLOW[4]=2;
L_BLOW[5]=3;
L_BLOW[6]=13;
L_BLOW[7]=23;
L_BLOW[8]=24;
L_BLOW[9]=25;
L_BLOW[10]=35;
L_BLOW[11]=36;
L_BLOW[12]=46;
L_BLOW[13]=47;
L_BLOW[14]=57;
L_BLOW[15]=0;
L_BLOW[16]=0;
L_BLOW[17]=0;
L_BLOW[18]=0;
L_BLOW[19]=5;
L_BLOW[20]=5;
L_BLOW[21]=1;
L_BLOW[22]=1;
L_BLOW[23]=2;
L_BLOW[24]=2;
L_BLOW[25]=2;
L_BLOW[26]=2;
L_BLOW[27]=0;
L_BLOW[28]=0;
L_BLOW[29]=0;
L_BLOW[30]=0;
L_BLOW[31]=0;
L_BLOW[32]=5;
L_BLOW[33]=5;
L_BLOW[34]=3;
L_BLOW[35]=3;
L_BLOW[36]=1;
L_BLOW[37]=0;
L_BLOW[38]=0;
L_BLOW[39]=0;
L_BLOW[40]=5;
L_BLOW[41]=5;
L_BLOW[42]=3;
L_BLOW[43]=3;
L_BLOW[44]=3;
L_BLOW[45]=1;
L_BLOW[46]=2;
L_BLOW[47]=2;
L_BLOW[48]=2;
L_BLOW[49]=0;
L_BLOW[50]=0;
L_BLOW[51]=0;
L_BLOW[52]=0;
L_BLOW[53]=0;
L_BLOW[54]=5;
L_BLOW[55]=5;
L_BLOW[56]=3;
L_BLOW[57]=3;
L_BLOW[58]=4;
L_BLOW[59]=4;
L_BLOW[60]=0;
L_BLOW[61]=0;
L_BLOW[62]=0;
L_BLOW[63]=5;
L_BLOW[64]=5;
L_BLOW[65]=3;
L_BLOW[66]=3;
L_BLOW[67]=3;
L_BLOW[68]=4;
L_BLOW[69]=4;
L_BLOW[70]=4;
L_BLOW[71]=0;
L_BLOW[72]=5;
L_BLOW[73]=5;
L_BLOW[74]=3;
L_BLOW[75]=3;
L_BLOW[76]=3;
L_BLOW[77]=3;
L_BLOW[78]=4;
L_BLOW[79]=4;
L_BLOW[80]=4;
L_BLOW[81]=5000;
L_BLOW[82]=3005;
L_BLOW[83]=3008;
L_BLOW[84]=4011;
L_BLOW[85]=3015;
L_BLOW[86]=3018;
L_BLOW[87]=1021;
L_BLOW[88]=0;
L_BLOW[89]=0;
L_BLOW[90]=5022;
L_BLOW[91]=3027;
L_BLOW[92]=3030;
L_BLOW[93]=4033;
L_BLOW[94]=3037;
L_BLOW[95]=3040;
L_BLOW[96]=1043;
L_BLOW[97]=0;
L_BLOW[98]=0;
L_BLOW[99]=4044;
L_BLOW[100]=2048;
L_BLOW[101]=4050;
L_BLOW[102]=4054;
L_BLOW[103]=5058;
L_BLOW[104]=4063;
L_BLOW[105]=4067;
L_BLOW[106]=3071;
L_BLOW[107]=1074;
L_BLOW[108]=4075;
L_BLOW[109]=1079;
L_BLOW[110]=4080;
L_BLOW[111]=4084;
L_BLOW[112]=4088;
L_BLOW[113]=4092;
L_BLOW[114]=4096;
L_BLOW[115]=4100;
L_BLOW[116]=1104;
L_BLOW[117]=4105;
L_BLOW[118]=2109;
L_BLOW[119]=4111;
L_BLOW[120]=4115;
L_BLOW[121]=4119;
L_BLOW[122]=4123;
L_BLOW[123]=4127;
L_BLOW[124]=3131;
L_BLOW[125]=3134;
L_GAME[9]="E";
L_GAME[10]="C";
L_GAME[11]="H";
L_GAME[12]="O";
L_GAME[13]="G";
L_GAME[14]="D";
L_GAME[15]="T";
L_PRINCR[3]=153;
L_SCORE[0]=20;
L_SCORE[1]=19;
L_SCORE[2]=18;
L_SCORE[3]=16;
L_SCORE[4]=12;
L_SCORE[5]=8;
L_SCORE[6]=4;
L_SCORE[7]=2;
L_SCORE[8]=1;
L_SCORE[9]=0;
L_SCORE[10]=20;
L_SCORE[11]=15;
L_SCORE[12]=10;
L_SCORE[13]=5;
L_SCORE[14]=0;
L_FIGHTS[2]=7;
L_FIGHTS[1]=2;
L_ENCRYP[0]="E";
L_ENCRYP[1]="C";
L_ENCRYP[2]="O";
L_ENCRYP[3]="R";
L_ENCRYP[4]="M";
L_ENCRYP[5]="S";
L_CPINFO[0]=-9;
L_CPINFO[1]=-8;
L_CPINFO[2]=-7;
L_CPINFO[3]=-1;
L_CPINFO[4]=1;
L_CPINFO[5]=7;
L_CPINFO[6]=8;
L_CPINFO[7]=9;
L_CPINFO[16]="SS";
L_CPINFO[17]="SS";
L_CPINFO[18]="SS";
L_CPINFO[19]="  ";
L_CPINFO[20]="MM";
L_CPINFO[21]="??";
L_JIGSUP[4]=8;
L_JIGSUP[5]=6;
L_JIGSUP[6]=36;
L_JIGSUP[7]=35;
L_JIGSUP[8]=34;
L_JIGSUP[9]=4;
L_JIGSUP[10]=34;
L_JIGSUP[11]=6;
L_JIGSUP[12]=5;
L_RAPPLI[3]=38;
L_GDT[85]=38;
L_GDT[0]="DR";
L_GDT[1]="DO";
L_GDT[2]="DA";
L_GDT[3]="DC";
L_GDT[4]="DX";
L_GDT[5]="DH";
L_GDT[6]="DL";
L_GDT[7]="DV";
L_GDT[8]="DF";
L_GDT[9]="DS";
L_GDT[10]="AF";
L_GDT[11]="HE";
L_GDT[12]="NR";
L_GDT[13]="NT";
L_GDT[14]="NC";
L_GDT[15]="ND";
L_GDT[16]="RR";
L_GDT[17]="RT";
L_GDT[18]="RC";
L_GDT[19]="RD";
L_GDT[20]="TK";
L_GDT[21]="EX";
L_GDT[22]="AR";
L_GDT[23]="AO";
L_GDT[24]="AA";
L_GDT[25]="AC";
L_GDT[26]="AX";
L_GDT[27]="AV";
L_GDT[28]="D2";
L_GDT[29]="DN";
L_GDT[30]="AN";
L_GDT[31]="DM";
L_GDT[32]="DT";
L_GDT[33]="AH";
L_GDT[34]="DP";
L_GDT[35]="PD";
L_GDT[36]="DZ";
L_GDT[37]="AZ";
L_GDT[39]=2;
L_GDT[40]=2;
L_GDT[41]=2;
L_GDT[42]=2;
L_GDT[43]=2;
L_GDT[44]=0;
L_GDT[45]=0;
L_GDT[46]=2;
L_GDT[47]=2;
L_GDT[48]=0;
L_GDT[49]=1;
L_GDT[50]=0;
L_GDT[51]=0;
L_GDT[52]=0;
L_GDT[53]=0;
L_GDT[54]=0;
L_GDT[55]=0;
L_GDT[56]=0;
L_GDT[57]=0;
L_GDT[58]=0;
L_GDT[59]=1;
L_GDT[60]=0;
L_GDT[61]=3;
L_GDT[62]=3;
L_GDT[63]=3;
L_GDT[64]=3;
L_GDT[65]=1;
L_GDT[66]=3;
L_GDT[67]=2;
L_GDT[68]=2;
L_GDT[69]=1;
L_GDT[70]=2;
L_GDT[71]=1;
L_GDT[72]=0;
L_GDT[73]=0;
L_GDT[74]=0;
L_GDT[75]=0;
L_GDT[76]=1;
L_SPARSE[22]=1600;
L_SPARSE[16]=36852;
L_THISIT[3]=1600;
L_SYNMCH[8]=1600;
L_LEX[1]="A";
L_LEX[2]="Z";
L_LEX[3]=" ";
L_LEX[4]="1";
L_LEX[5]="9";
L_LEX[6]=" ";
L_LEX[7]="-";
L_LEX[8]="-";
L_LEX[9]=" ";
C_BUZVOC[0]=2164;
C_BUZVOC[1]=0;
C_BUZVOC[2]=4200;
C_BUZVOC[3]=0;
C_BUZVOC[4]=15160;
C_BUZVOC[5]=0;
C_BUZVOC[6]=1600;
C_BUZVOC[7]=0;
C_BUZVOC[8]=2160;
C_BUZVOC[9]=0;
C_BUZVOC[10]=32325;
C_BUZVOC[11]=0;
C_BUZVOC[12]=29654;
C_BUZVOC[13]=0;
C_BUZVOC[14]=11800;
C_BUZVOC[15]=0;
C_BUZVOC[16]=26335;
C_BUZVOC[17]=5005;
C_BUZVOC[18]=0;
C_BUZVOC[19]=0;
C_PRPVOC[0]=24885;
C_PRPVOC[1]=28800;
C_PRPVOC[2]=1;
C_PRPVOC[3]=37180;
C_PRPVOC[4]=12800;
C_PRPVOC[5]=2;
C_PRPVOC[6]=34369;
C_PRPVOC[7]=22680;
C_PRPVOC[8]=2;
C_PRPVOC[9]=32338;
C_PRPVOC[10]=24847;
C_PRPVOC[11]=2;
C_PRPVOC[12]=2400;
C_PRPVOC[13]=0;
C_PRPVOC[14]=3;
C_PRPVOC[15]=32600;
C_PRPVOC[16]=0;
C_PRPVOC[17]=4;
C_PRPVOC[18]=14960;
C_PRPVOC[19]=0;
C_PRPVOC[20]=5;
C_PRPVOC[21]=14979;
C_PRPVOC[22]=14565;
C_PRPVOC[23]=5;
C_PRPVOC[24]=14980;
C_PRPVOC[25]=24000;
C_PRPVOC[26]=5;
C_PRPVOC[27]=7023;
C_PRPVOC[28]=22400;
C_PRPVOC[29]=6;
C_PRPVOC[30]=34240;
C_PRPVOC[31]=0;
C_PRPVOC[32]=7;
C_PRPVOC[33]=34164;
C_PRPVOC[34]=8720;
C_PRPVOC[35]=8;
C_PRPVOC[36]=24240;
C_PRPVOC[37]=0;
C_PRPVOC[38]=9;
C_PRPVOC[39]=24560;
C_PRPVOC[40]=0;
C_PRPVOC[41]=10;
C_PRPVOC[42]=24246;
C_PRPVOC[43]=0;
C_PRPVOC[44]=11;
C_DIRVOC[0]=22400;
C_DIRVOC[1]=0;
C_DIRVOC[2]=1024;
C_DIRVOC[3]=23018;
C_DIRVOC[4]=32320;
C_DIRVOC[5]=1024;
C_DIRVOC[6]=30400;
C_DIRVOC[7]=0;
C_DIRVOC[8]=5120;
C_DIRVOC[9]=8000;
C_DIRVOC[10]=0;
C_DIRVOC[11]=3072;
C_DIRVOC[12]=8059;
C_DIRVOC[13]=32000;
C_DIRVOC[14]=3072;
C_DIRVOC[15]=36800;
C_DIRVOC[16]=0;
C_DIRVOC[17]=7168;
C_DIRVOC[18]=37019;
C_DIRVOC[19]=32000;
C_DIRVOC[20]=7168;
C_DIRVOC[21]=30600;
C_DIRVOC[22]=0;
C_DIRVOC[23]=4096;
C_DIRVOC[24]=31320;
C_DIRVOC[25]=0;
C_DIRVOC[26]=6144;
C_DIRVOC[27]=22600;
C_DIRVOC[28]=0;
C_DIRVOC[29]=2048;
C_DIRVOC[30]=23320;
C_DIRVOC[31]=0;
C_DIRVOC[32]=8192;
C_DIRVOC[33]=33600;
C_DIRVOC[34]=0;
C_DIRVOC[35]=9216;
C_DIRVOC[36]=34240;
C_DIRVOC[37]=0;
C_DIRVOC[38]=9216;
C_DIRVOC[39]=6400;
C_DIRVOC[40]=0;
C_DIRVOC[41]=10240;
C_DIRVOC[42]=7023;
C_DIRVOC[43]=22400;
C_DIRVOC[44]=10240;
C_DIRVOC[45]=19261;
C_DIRVOC[46]=22528;
C_DIRVOC[47]=11264;
C_DIRVOC[48]=19254;
C_DIRVOC[49]=6400;
C_DIRVOC[50]=12288;
C_DIRVOC[51]=8580;
C_DIRVOC[52]=8720;
C_DIRVOC[53]=13312;
C_DIRVOC[54]=8969;
C_DIRVOC[55]=32000;
C_DIRVOC[56]=14336;
C_DIRVOC[57]=24860;
C_DIRVOC[58]=0;
C_DIRVOC[59]=14336;
C_DIRVOC[60]=19401;
C_DIRVOC[61]=35400;
C_DIRVOC[62]=14336;
C_DIRVOC[63]=32721;
C_DIRVOC[64]=35412;
C_DIRVOC[65]=15360;
C_DIRVOC[66]=31021;
C_DIRVOC[67]=32320;
C_DIRVOC[68]=5120;
C_DIRVOC[69]=14960;
C_DIRVOC[70]=0;
C_DIRVOC[71]=13312;
C_DIRVOC[72]=5535;
C_DIRVOC[73]=31160;
C_DIRVOC[74]=15360;
C_ADJVOC[0]=3935;
C_ADJVOC[1]=37360;
C_ADJVOC[2]=1;
C_ADJVOC[3]=81;
C_ADJVOC[4]=8495;
C_ADJVOC[5]=22681;
C_ADJVOC[6]=1;
C_ADJVOC[7]=13420;
C_ADJVOC[8]=0;
C_ADJVOC[9]=3;
C_ADJVOC[10]=25816;
C_ADJVOC[11]=25818;
C_ADJVOC[12]=3;
C_ADJVOC[13]=35580;
C_ADJVOC[14]=29015;
C_ADJVOC[15]=4;
C_ADJVOC[16]=16044;
C_ADJVOC[17]=8000;
C_ADJVOC[18]=6;
C_ADJVOC[19]=13647;
C_ADJVOC[20]=8000;
C_ADJVOC[21]=8;
C_ADJVOC[22]=8575;
C_ADJVOC[23]=29335;
C_ADJVOC[24]=8;
C_ADJVOC[25]=122;
C_ADJVOC[26]=32735;
C_ADJVOC[27]=25945;
C_ADJVOC[28]=9;
C_ADJVOC[29]=5285;
C_ADJVOC[30]=2320;
C_ADJVOC[31]=10;
C_ADJVOC[32]=19258;
C_ADJVOC[33]=11400;
C_ADJVOC[34]=12;
C_ADJVOC[35]=26;
C_ADJVOC[36]=47;
C_ADJVOC[37]=95;
C_ADJVOC[38]=96;
C_ADJVOC[39]=123;
C_ADJVOC[40]=133;
C_ADJVOC[41]=135;
C_ADJVOC[42]=146;
C_ADJVOC[43]=147;
C_ADJVOC[44]=150;
C_ADJVOC[45]=176;
C_ADJVOC[46]=22459;
C_ADJVOC[47]=33000;
C_ADJVOC[48]=13;
C_ADJVOC[49]=8502;
C_ADJVOC[50]=15168;
C_ADJVOC[51]=14;
C_ADJVOC[52]=3921;
C_ADJVOC[53]=31160;
C_ADJVOC[54]=15;
C_ADJVOC[55]=16;
C_ADJVOC[56]=46;
C_ADJVOC[57]=156;
C_ADJVOC[58]=3935;
C_ADJVOC[59]=17814;
C_ADJVOC[60]=16;
C_ADJVOC[61]=22;
C_ADJVOC[62]=92;
C_ADJVOC[63]=113;
C_ADJVOC[64]=155;
C_ADJVOC[65]=158;
C_ADJVOC[66]=24729;
C_ADJVOC[67]=8580;
C_ADJVOC[68]=17;
C_ADJVOC[69]=3695;
C_ADJVOC[70]=24185;
C_ADJVOC[71]=20;
C_ADJVOC[72]=29659;
C_ADJVOC[73]=33000;
C_ADJVOC[74]=21;
C_ADJVOC[75]=4058;
C_ADJVOC[76]=22604;
C_ADJVOC[77]=22;
C_ADJVOC[78]=6601;
C_ADJVOC[79]=6400;
C_ADJVOC[80]=22;
C_ADJVOC[81]=24484;
C_ADJVOC[82]=0;
C_ADJVOC[83]=25;
C_ADJVOC[84]=41;
C_ADJVOC[85]=44;
C_ADJVOC[86]=45;
C_ADJVOC[87]=19401;
C_ADJVOC[88]=32325;
C_ADJVOC[89]=25;
C_ADJVOC[90]=26081;
C_ADJVOC[91]=32374;
C_ADJVOC[92]=26;
C_ADJVOC[93]=25801;
C_ADJVOC[94]=29280;
C_ADJVOC[95]=27;
C_ADJVOC[96]=21402;
C_ADJVOC[97]=40000;
C_ADJVOC[98]=31;
C_ADJVOC[99]=5545;
C_ADJVOC[100]=31201;
C_ADJVOC[101]=32;
C_ADJVOC[102]=126;
C_ADJVOC[103]=11812;
C_ADJVOC[104]=6400;
C_ADJVOC[105]=33;
C_ADJVOC[106]=85;
C_ADJVOC[107]=104;
C_ADJVOC[108]=157;
C_ADJVOC[109]=158;
C_ADJVOC[110]=188;
C_ADJVOC[111]=15295;
C_ADJVOC[112]=29800;
C_ADJVOC[113]=34;
C_ADJVOC[114]=30456;
C_ADJVOC[115]=25929;
C_ADJVOC[116]=37;
C_ADJVOC[117]=37415;
C_ADJVOC[118]=6614;
C_ADJVOC[119]=38;
C_ADJVOC[120]=67;
C_ADJVOC[121]=136;
C_ADJVOC[122]=137;
C_ADJVOC[123]=165;
C_ADJVOC[124]=173;
C_ADJVOC[125]=174;
C_ADJVOC[126]=175;
C_ADJVOC[127]=37415;
C_ADJVOC[128]=6400;
C_ADJVOC[129]=38;
C_ADJVOC[130]=67;
C_ADJVOC[131]=136;
C_ADJVOC[132]=137;
C_ADJVOC[133]=165;
C_ADJVOC[134]=173;
C_ADJVOC[135]=174;
C_ADJVOC[136]=175;
C_ADJVOC[137]=31205;
C_ADJVOC[138]=8480;
C_ADJVOC[139]=39;
C_ADJVOC[140]=125;
C_ADJVOC[141]=189;
C_ADJVOC[142]=6614;
C_ADJVOC[143]=32204;
C_ADJVOC[144]=39;
C_ADJVOC[145]=9654;
C_ADJVOC[146]=5800;
C_ADJVOC[147]=40;
C_ADJVOC[148]=2163;
C_ADJVOC[149]=14614;
C_ADJVOC[150]=41;
C_ADJVOC[151]=44;
C_ADJVOC[152]=30921;
C_ADJVOC[153]=19680;
C_ADJVOC[154]=5;
C_ADJVOC[155]=46;
C_ADJVOC[156]=52;
C_ADJVOC[157]=53;
C_ADJVOC[158]=89;
C_ADJVOC[159]=102;
C_ADJVOC[160]=103;
C_ADJVOC[161]=153;
C_ADJVOC[162]=187;
C_ADJVOC[163]=3681;
C_ADJVOC[164]=5240;
C_ADJVOC[165]=47;
C_ADJVOC[166]=162;
C_ADJVOC[167]=32621;
C_ADJVOC[168]=28800;
C_ADJVOC[169]=49;
C_ADJVOC[170]=35579;
C_ADJVOC[171]=5421;
C_ADJVOC[172]=55;
C_ADJVOC[173]=35563;
C_ADJVOC[174]=15021;
C_ADJVOC[175]=62;
C_ADJVOC[176]=11681;
C_ADJVOC[177]=31160;
C_ADJVOC[178]=10;
C_ADJVOC[179]=126;
C_ADJVOC[180]=132;
C_ADJVOC[181]=32721;
C_ADJVOC[182]=25600;
C_ADJVOC[183]=66;
C_ADJVOC[184]=10335;
C_ADJVOC[185]=23200;
C_ADJVOC[186]=68;
C_ADJVOC[187]=31215;
C_ADJVOC[188]=22600;
C_ADJVOC[189]=69;
C_ADJVOC[190]=150;
C_ADJVOC[191]=214;
C_ADJVOC[192]=20854;
C_ADJVOC[193]=11685;
C_ADJVOC[194]=72;
C_ADJVOC[195]=29004;
C_ADJVOC[196]=0;
C_ADJVOC[197]=79;
C_ADJVOC[198]=94;
C_ADJVOC[199]=140;
C_ADJVOC[200]=161;
C_ADJVOC[201]=170;
C_ADJVOC[202]=171;
C_ADJVOC[203]=40212;
C_ADJVOC[204]=19823;
C_ADJVOC[205]=80;
C_ADJVOC[206]=159;
C_ADJVOC[207]=3701;
C_ADJVOC[208]=8000;
C_ADJVOC[209]=82;
C_ADJVOC[210]=112;
C_ADJVOC[211]=114;
C_ADJVOC[212]=141;
C_ADJVOC[213]=35253;
C_ADJVOC[214]=25978;
C_ADJVOC[215]=83;
C_ADJVOC[216]=20847;
C_ADJVOC[217]=14520;
C_ADJVOC[218]=90;
C_ADJVOC[219]=30601;
C_ADJVOC[220]=37418;
C_ADJVOC[221]=90;
C_ADJVOC[222]=32054;
C_ADJVOC[223]=0;
C_ADJVOC[224]=91;
C_ADJVOC[225]=30721;
C_ADJVOC[226]=29440;
C_ADJVOC[227]=92;
C_ADJVOC[228]=37163;
C_ADJVOC[229]=17818;
C_ADJVOC[230]=98;
C_ADJVOC[231]=5295;
C_ADJVOC[232]=32320;
C_ADJVOC[233]=100;
C_ADJVOC[234]=3921;
C_ADJVOC[235]=14565;
C_ADJVOC[236]=101;
C_ADJVOC[237]=11261;
C_ADJVOC[238]=7400;
C_ADJVOC[239]=108;
C_ADJVOC[240]=31101;
C_ADJVOC[241]=2325;
C_ADJVOC[242]=109;
C_ADJVOC[243]=127;
C_ADJVOC[244]=5281;
C_ADJVOC[245]=40000;
C_ADJVOC[246]=109;
C_ADJVOC[247]=30729;
C_ADJVOC[248]=23400;
C_ADJVOC[249]=110;
C_ADJVOC[250]=32329;
C_ADJVOC[251]=22400;
C_ADJVOC[252]=110;
C_ADJVOC[253]=11925;
C_ADJVOC[254]=8560;
C_ADJVOC[255]=115;
C_ADJVOC[256]=143;
C_ADJVOC[257]=26458;
C_ADJVOC[258]=26085;
C_ADJVOC[259]=116;
C_ADJVOC[260]=37129;
C_ADJVOC[261]=32200;
C_ADJVOC[262]=117;
C_ADJVOC[263]=147;
C_ADJVOC[264]=160;
C_ADJVOC[265]=20858;
C_ADJVOC[266]=3685;
C_ADJVOC[267]=119;
C_ADJVOC[268]=5411;
C_ADJVOC[269]=8000;
C_ADJVOC[270]=121;
C_ADJVOC[271]=8536;
C_ADJVOC[272]=33000;
C_ADJVOC[273]=121;
C_ADJVOC[274]=29421;
C_ADJVOC[275]=22560;
C_ADJVOC[276]=128;
C_ADJVOC[277]=32729;
C_ADJVOC[278]=2167;
C_ADJVOC[279]=129;
C_ADJVOC[280]=28858;
C_ADJVOC[281]=8000;
C_ADJVOC[282]=134;
C_ADJVOC[283]=24092;
C_ADJVOC[284]=24567;
C_ADJVOC[285]=135;
C_ADJVOC[286]=8060;
C_ADJVOC[287]=43725;
C_ADJVOC[288]=138;
C_ADJVOC[289]=8060;
C_ADJVOC[290]=21000;
C_ADJVOC[291]=138;
C_ADJVOC[292]=24721;
C_ADJVOC[293]=22685;
C_ADJVOC[294]=139;
C_ADJVOC[295]=8123;
C_ADJVOC[296]=12800;
C_ADJVOC[297]=141;
C_ADJVOC[298]=29403;
C_ADJVOC[299]=18600;
C_ADJVOC[300]=147;
C_ADJVOC[301]=30725;
C_ADJVOC[302]=8720;
C_ADJVOC[303]=147;
C_ADJVOC[304]=52430;
C_ADJVOC[305]=0;
C_ADJVOC[306]=148;
C_ADJVOC[307]=22601;
C_ADJVOC[308]=32000;
C_ADJVOC[309]=148;
C_ADJVOC[310]=30729;
C_ADJVOC[311]=21325;
C_ADJVOC[312]=151;
C_ADJVOC[313]=42458;
C_ADJVOC[314]=14528;
C_ADJVOC[315]=152;
C_ADJVOC[316]=3578;
C_ADJVOC[317]=7160;
C_ADJVOC[318]=153;
C_ADJVOC[319]=154;
C_ADJVOC[320]=155;
C_ADJVOC[321]=8563;
C_ADJVOC[322]=29659;
C_ADJVOC[323]=154;
C_ADJVOC[324]=155;
C_ADJVOC[325]=3401;
C_ADJVOC[326]=34409;
C_ADJVOC[327]=156;
C_ADJVOC[328]=5295;
C_ADJVOC[329]=5263;
C_ADJVOC[330]=157;
C_ADJVOC[331]=158;
C_ADJVOC[332]=21003;
C_ADJVOC[333]=12854;
C_ADJVOC[334]=157;
C_ADJVOC[335]=158;
C_ADJVOC[336]=20848;
C_ADJVOC[337]=24281;
C_ADJVOC[338]=163;
C_ADJVOC[339]=25974;
C_ADJVOC[340]=8000;
C_ADJVOC[341]=164;
C_ADJVOC[342]=19814;
C_ADJVOC[343]=11200;
C_ADJVOC[344]=166;
C_ADJVOC[345]=5014;
C_ADJVOC[346]=32218;
C_ADJVOC[347]=166;
C_ADJVOC[348]=30735;
C_ADJVOC[349]=29600;
C_ADJVOC[350]=167;
C_ADJVOC[351]=32000;
C_ADJVOC[352]=0;
C_ADJVOC[353]=168;
C_ADJVOC[354]=5413;
C_ADJVOC[355]=25659;
C_ADJVOC[356]=169;
C_ADJVOC[357]=211;
C_ADJVOC[358]=3935;
C_ADJVOC[359]=23445;
C_ADJVOC[360]=172;
C_ADJVOC[361]=5012;
C_ADJVOC[362]=19200;
C_ADJVOC[363]=174;
C_ADJVOC[364]=175;
C_ADJVOC[365]=19803;
C_ADJVOC[366]=17804;
C_ADJVOC[367]=174;
C_ADJVOC[368]=31254;
C_ADJVOC[369]=0;
C_ADJVOC[370]=177;
C_ADJVOC[371]=3258;
C_ADJVOC[372]=8000;
C_ADJVOC[373]=200;
C_ADJVOC[374]=31014;
C_ADJVOC[375]=11200;
C_ADJVOC[376]=203;
C_ADJVOC[377]=23018;
C_ADJVOC[378]=32320;
C_ADJVOC[379]=205;
C_ADJVOC[380]=23018;
C_ADJVOC[381]=32325;
C_ADJVOC[382]=205;
C_ADJVOC[383]=31021;
C_ADJVOC[384]=32320;
C_ADJVOC[385]=206;
C_ADJVOC[386]=31021;
C_ADJVOC[387]=32325;
C_ADJVOC[388]=206;
C_ADJVOC[389]=8059;
C_ADJVOC[390]=32000;
C_ADJVOC[391]=207;
C_ADJVOC[392]=8059;
C_ADJVOC[393]=32218;
C_ADJVOC[394]=207;
C_ADJVOC[395]=37019;
C_ADJVOC[396]=32000;
C_ADJVOC[397]=208;
C_ADJVOC[398]=37019;
C_ADJVOC[399]=32218;
C_ADJVOC[400]=208;
C_ADJVOC[401]=7254;
C_ADJVOC[402]=11415;
C_ADJVOC[403]=215;
C_ADJVOC[404]=-1;
C_VRBVOC[0]=3929;
C_VRBVOC[1]=8240;
C_VRBVOC[2]=1;
C_VRBVOC[3]=70;
C_VRBVOC[4]=35418;
C_VRBVOC[5]=3819;
C_VRBVOC[6]=1;
C_VRBVOC[7]=71;
C_VRBVOC[8]=31256;
C_VRBVOC[9]=8722;
C_VRBVOC[10]=1;
C_VRBVOC[11]=72;
C_VRBVOC[12]=31201;
C_VRBVOC[13]=40000;
C_VRBVOC[14]=1;
C_VRBVOC[15]=73;
C_VRBVOC[16]=35418;
C_VRBVOC[17]=30775;
C_VRBVOC[18]=1;
C_VRBVOC[19]=74;
C_VRBVOC[20]=31329;
C_VRBVOC[21]=20800;
C_VRBVOC[22]=3260;
C_VRBVOC[23]=13000;
C_VRBVOC[24]=36844;
C_VRBVOC[25]=8000;
C_VRBVOC[26]=1;
C_VRBVOC[27]=75;
C_VRBVOC[28]=11418;
C_VRBVOC[29]=24569;
C_VRBVOC[30]=1;
C_VRBVOC[31]=76;
C_VRBVOC[32]=34105;
C_VRBVOC[33]=31165;
C_VRBVOC[34]=24185;
C_VRBVOC[35]=31165;
C_VRBVOC[36]=1;
C_VRBVOC[37]=77;
C_VRBVOC[38]=37012;
C_VRBVOC[39]=19200;
C_VRBVOC[40]=1;
C_VRBVOC[41]=78;
C_VRBVOC[42]=26321;
C_VRBVOC[43]=40000;
C_VRBVOC[44]=1;
C_VRBVOC[45]=79;
C_VRBVOC[46]=32725;
C_VRBVOC[47]=2381;
C_VRBVOC[48]=1;
C_VRBVOC[49]=80;
C_VRBVOC[50]=32213;
C_VRBVOC[51]=26085;
C_VRBVOC[52]=1;
C_VRBVOC[53]=81;
C_VRBVOC[54]=3681;
C_VRBVOC[55]=31200;
C_VRBVOC[56]=1;
C_VRBVOC[57]=82;
C_VRBVOC[58]=30535;
C_VRBVOC[59]=29000;
C_VRBVOC[60]=1;
C_VRBVOC[61]=83;
C_VRBVOC[62]=27200;
C_VRBVOC[63]=0;
C_VRBVOC[64]=28049;
C_VRBVOC[65]=32000;
C_VRBVOC[66]=1;
C_VRBVOC[67]=84;
C_VRBVOC[68]=13012;
C_VRBVOC[69]=25600;
C_VRBVOC[70]=1;
C_VRBVOC[71]=40;
C_VRBVOC[72]=14966;
C_VRBVOC[73]=24000;
C_VRBVOC[74]=1;
C_VRBVOC[75]=41;
C_VRBVOC[76]=13179;
C_VRBVOC[77]=32618;
C_VRBVOC[78]=34244;
C_VRBVOC[79]=2405;
C_VRBVOC[80]=1;
C_VRBVOC[81]=42;
C_VRBVOC[82]=3243;
C_VRBVOC[83]=17600;
C_VRBVOC[84]=1;
C_VRBVOC[85]=43;
C_VRBVOC[86]=30767;
C_VRBVOC[87]=12800;
C_VRBVOC[88]=21653;
C_VRBVOC[89]=3685;
C_VRBVOC[90]=1;
C_VRBVOC[91]=44;
C_VRBVOC[92]=5135;
C_VRBVOC[93]=21440;
C_VRBVOC[94]=19819;
C_VRBVOC[95]=8000;
C_VRBVOC[96]=3258;
C_VRBVOC[97]=9600;
C_VRBVOC[98]=1;
C_VRBVOC[99]=45;
C_VRBVOC[100]=7254;
C_VRBVOC[101]=11415;
C_VRBVOC[102]=1;
C_VRBVOC[103]=46;
C_VRBVOC[104]=10335;
C_VRBVOC[105]=3826;
C_VRBVOC[106]=1;
C_VRBVOC[107]=47;
C_VRBVOC[108]=10215;
C_VRBVOC[109]=0;
C_VRBVOC[110]=3685;
C_VRBVOC[111]=32128;
C_VRBVOC[112]=3258;
C_VRBVOC[113]=0;
C_VRBVOC[114]=1;
C_VRBVOC[115]=48;
C_VRBVOC[116]=29016;
C_VRBVOC[117]=8580;
C_VRBVOC[118]=1;
C_VRBVOC[119]=49;
C_VRBVOC[120]=13421;
C_VRBVOC[121]=30400;
C_VRBVOC[122]=30528;
C_VRBVOC[123]=8181;
C_VRBVOC[124]=1;
C_VRBVOC[125]=50;
C_VRBVOC[126]=37174;
C_VRBVOC[127]=0;
C_VRBVOC[128]=1;
C_VRBVOC[129]=51;
C_VRBVOC[130]=40212;
C_VRBVOC[131]=19200;
C_VRBVOC[132]=30538;
C_VRBVOC[133]=8053;
C_VRBVOC[134]=30735;
C_VRBVOC[135]=34400;
C_VRBVOC[136]=1;
C_VRBVOC[137]=52;
C_VRBVOC[138]=13416;
C_VRBVOC[139]=0;
C_VRBVOC[140]=30849;
C_VRBVOC[141]=25600;
C_VRBVOC[142]=1;
C_VRBVOC[143]=53;
C_VRBVOC[144]=10443;
C_VRBVOC[145]=17600;
C_VRBVOC[146]=30729;
C_VRBVOC[147]=32000;
C_VRBVOC[148]=6453;
C_VRBVOC[149]=22400;
C_VRBVOC[150]=5658;
C_VRBVOC[151]=30600;
C_VRBVOC[152]=1;
C_VRBVOC[153]=54;
C_VRBVOC[154]=42218;
C_VRBVOC[155]=17600;
C_VRBVOC[156]=1;
C_VRBVOC[157]=55;
C_VRBVOC[158]=11921;
C_VRBVOC[159]=22780;
C_VRBVOC[160]=1;
C_VRBVOC[161]=20536;
C_VRBVOC[162]=30462;
C_VRBVOC[163]=8000;
C_VRBVOC[164]=1;
C_VRBVOC[165]=149;
C_VRBVOC[166]=29019;
C_VRBVOC[167]=32618;
C_VRBVOC[168]=1;
C_VRBVOC[169]=150;
C_VRBVOC[170]=32373;
C_VRBVOC[171]=8000;
C_VRBVOC[172]=1;
C_VRBVOC[173]=90;
C_VRBVOC[174]=6761;
C_VRBVOC[175]=11775;
C_VRBVOC[176]=1;
C_VRBVOC[177]=94;
C_VRBVOC[178]=8975;
C_VRBVOC[179]=28929;
C_VRBVOC[180]=1;
C_VRBVOC[181]=105;
C_VRBVOC[182]=14982;
C_VRBVOC[183]=8580;
C_VRBVOC[184]=14400;
C_VRBVOC[185]=0;
C_VRBVOC[186]=1;
C_VRBVOC[187]=133;
C_VRBVOC[188]=36849;
C_VRBVOC[189]=32000;
C_VRBVOC[190]=1;
C_VRBVOC[191]=128;
C_VRBVOC[192]=14963;
C_VRBVOC[193]=2180;
C_VRBVOC[194]=1;
C_VRBVOC[195]=95;
C_VRBVOC[196]=2179;
C_VRBVOC[197]=37018;
C_VRBVOC[198]=1;
C_VRBVOC[199]=96;
C_VRBVOC[200]=1881;
C_VRBVOC[201]=14960;
C_VRBVOC[202]=1;
C_VRBVOC[203]=57;
C_VRBVOC[204]=23015;
C_VRBVOC[205]=3600;
C_VRBVOC[206]=1;
C_VRBVOC[207]=58;
C_VRBVOC[208]=4047;
C_VRBVOC[209]=0;
C_VRBVOC[210]=11929;
C_VRBVOC[211]=25800;
C_VRBVOC[212]=5413;
C_VRBVOC[213]=26081;
C_VRBVOC[214]=1;
C_VRBVOC[215]=59;
C_VRBVOC[216]=9801;
C_VRBVOC[217]=32858;
C_VRBVOC[218]=5413;
C_VRBVOC[219]=21014;
C_VRBVOC[220]=31247;
C_VRBVOC[221]=11419;
C_VRBVOC[222]=14565;
C_VRBVOC[223]=1600;
C_VRBVOC[224]=1;
C_VRBVOC[225]=60;
C_VRBVOC[226]=29415;
C_VRBVOC[227]=20800;
C_VRBVOC[228]=1;
C_VRBVOC[229]=65;
C_VRBVOC[230]=24090;
C_VRBVOC[231]=8140;
C_VRBVOC[232]=1;
C_VRBVOC[233]=66;
C_VRBVOC[234]=29361;
C_VRBVOC[235]=21000;
C_VRBVOC[236]=1;
C_VRBVOC[237]=67;
C_VRBVOC[238]=6606;
C_VRBVOC[239]=19260;
C_VRBVOC[240]=1;
C_VRBVOC[241]=20583;
C_VRBVOC[242]=6619;
C_VRBVOC[243]=5529;
C_VRBVOC[244]=37121;
C_VRBVOC[245]=32000;
C_VRBVOC[246]=8961;
C_VRBVOC[247]=21174;
C_VRBVOC[248]=1;
C_VRBVOC[249]=20600;
C_VRBVOC[250]=9972;
C_VRBVOC[251]=19200;
C_VRBVOC[252]=11;
C_VRBVOC[253]=24710;
C_VRBVOC[254]=25088;
C_VRBVOC[255]=128;
C_VRBVOC[256]=0;
C_VRBVOC[257]=25090;
C_VRBVOC[258]=256;
C_VRBVOC[259]=0;
C_VRBVOC[260]=16518;
C_VRBVOC[261]=25088;
C_VRBVOC[262]=128;
C_VRBVOC[263]=0;
C_VRBVOC[264]=9974;
C_VRBVOC[265]=6400;
C_VRBVOC[266]=30605;
C_VRBVOC[267]=17600;
C_VRBVOC[268]=37125;
C_VRBVOC[269]=29000;
C_VRBVOC[270]=30605;
C_VRBVOC[271]=0;
C_VRBVOC[272]=4;
C_VRBVOC[273]=16511;
C_VRBVOC[274]=24576;
C_VRBVOC[275]=-1;
C_VRBVOC[276]=-1;
C_VRBVOC[277]=10212;
C_VRBVOC[278]=19823;
C_VRBVOC[279]=2;
C_VRBVOC[280]=85;
C_VRBVOC[281]=20565;
C_VRBVOC[282]=17963;
C_VRBVOC[283]=17600;
C_VRBVOC[284]=3580;
C_VRBVOC[285]=8000;
C_VRBVOC[286]=32061;
C_VRBVOC[287]=23200;
C_VRBVOC[288]=1;
C_VRBVOC[289]=20587;
C_VRBVOC[290]=19823;
C_VRBVOC[291]=8720;
C_VRBVOC[292]=1;
C_VRBVOC[293]=20590;
C_VRBVOC[294]=26459;
C_VRBVOC[295]=12800;
C_VRBVOC[296]=26325;
C_VRBVOC[297]=31160;
C_VRBVOC[298]=1;
C_VRBVOC[299]=20592;
C_VRBVOC[300]=29174;
C_VRBVOC[301]=11200;
C_VRBVOC[302]=25801;
C_VRBVOC[303]=19200;
C_VRBVOC[304]=1;
C_VRBVOC[305]=20567;
C_VRBVOC[306]=29642;
C_VRBVOC[307]=0;
C_VRBVOC[308]=4858;
C_VRBVOC[309]=8779;
C_VRBVOC[310]=32621;
C_VRBVOC[311]=5120;
C_VRBVOC[312]=10214;
C_VRBVOC[313]=6885;
C_VRBVOC[314]=1;
C_VRBVOC[315]=20591;
C_VRBVOC[316]=30721;
C_VRBVOC[317]=17800;
C_VRBVOC[318]=1;
C_VRBVOC[319]=20601;
C_VRBVOC[320]=31049;
C_VRBVOC[321]=22400;
C_VRBVOC[322]=1;
C_VRBVOC[323]=20609;
C_VRBVOC[324]=34180;
C_VRBVOC[325]=14600;
C_VRBVOC[326]=10325;
C_VRBVOC[327]=8000;
C_VRBVOC[328]=1;
C_VRBVOC[329]=20593;
C_VRBVOC[330]=36852;
C_VRBVOC[331]=17600;
C_VRBVOC[332]=9;
C_VRBVOC[333]=20622;
C_VRBVOC[334]=16470;
C_VRBVOC[335]=25090;
C_VRBVOC[336]=-1;
C_VRBVOC[337]=-1;
C_VRBVOC[338]=16470;
C_VRBVOC[339]=25093;
C_VRBVOC[340]=-1;
C_VRBVOC[341]=-1;
C_VRBVOC[342]=2420;
C_VRBVOC[343]=1731;
C_VRBVOC[344]=9967;
C_VRBVOC[345]=13600;
C_VRBVOC[346]=14970;
C_VRBVOC[347]=34325;
C_VRBVOC[348]=13180;
C_VRBVOC[349]=0;
C_VRBVOC[350]=13658;
C_VRBVOC[351]=32000;
C_VRBVOC[352]=7;
C_VRBVOC[353]=24717;
C_VRBVOC[354]=8704;
C_VRBVOC[355]=0;
C_VRBVOC[356]=128;
C_VRBVOC[357]=18434;
C_VRBVOC[358]=0;
C_VRBVOC[359]=512;
C_VRBVOC[360]=3801;
C_VRBVOC[361]=28960;
C_VRBVOC[362]=4;
C_VRBVOC[363]=16514;
C_VRBVOC[364]=8704;
C_VRBVOC[365]=0;
C_VRBVOC[366]=2;
C_VRBVOC[367]=3941;
C_VRBVOC[368]=30720;
C_VRBVOC[369]=5285;
C_VRBVOC[370]=2160;
C_VRBVOC[371]=5;
C_VRBVOC[372]=21592;
C_VRBVOC[373]=28760;
C_VRBVOC[374]=25090;
C_VRBVOC[375]=-1;
C_VRBVOC[376]=-1;
C_VRBVOC[377]=4058;
C_VRBVOC[378]=22400;
C_VRBVOC[379]=14694;
C_VRBVOC[380]=15205;
C_VRBVOC[381]=14963;
C_VRBVOC[382]=14965;
C_VRBVOC[383]=7;
C_VRBVOC[384]=24713;
C_VRBVOC[385]=25088;
C_VRBVOC[386]=16;
C_VRBVOC[387]=0;
C_VRBVOC[388]=26626;
C_VRBVOC[389]=8;
C_VRBVOC[390]=0;
C_VRBVOC[391]=5289;
C_VRBVOC[392]=20880;
C_VRBVOC[393]=12;
C_VRBVOC[394]=16541;
C_VRBVOC[395]=8199;
C_VRBVOC[396]=0;
C_VRBVOC[397]=2048;
C_VRBVOC[398]=16542;
C_VRBVOC[399]=8198;
C_VRBVOC[400]=0;
C_VRBVOC[401]=2048;
C_VRBVOC[402]=16540;
C_VRBVOC[403]=8192;
C_VRBVOC[404]=0;
C_VRBVOC[405]=2048;
C_VRBVOC[406]=5295;
C_VRBVOC[407]=30600;
C_VRBVOC[408]=4;
C_VRBVOC[409]=16510;
C_VRBVOC[410]=25088;
C_VRBVOC[411]=4224;
C_VRBVOC[412]=0;
C_VRBVOC[413]=6767;
C_VRBVOC[414]=0;
C_VRBVOC[415]=4;
C_VRBVOC[416]=16473;
C_VRBVOC[417]=18434;
C_VRBVOC[418]=4;
C_VRBVOC[419]=0;
C_VRBVOC[420]=6779;
C_VRBVOC[421]=8522;
C_VRBVOC[422]=4;
C_VRBVOC[423]=16515;
C_VRBVOC[424]=8192;
C_VRBVOC[425]=0;
C_VRBVOC[426]=2;
C_VRBVOC[427]=7129;
C_VRBVOC[428]=22840;
C_VRBVOC[429]=14922;
C_VRBVOC[430]=14485;
C_VRBVOC[431]=31321;
C_VRBVOC[432]=19695;
C_VRBVOC[433]=4;
C_VRBVOC[434]=16520;
C_VRBVOC[435]=25088;
C_VRBVOC[436]=256;
C_VRBVOC[437]=0;
C_VRBVOC[438]=7135;
C_VRBVOC[439]=25600;
C_VRBVOC[440]=29012;
C_VRBVOC[441]=8059;
C_VRBVOC[442]=11;
C_VRBVOC[443]=17553;
C_VRBVOC[444]=16896;
C_VRBVOC[445]=-1;
C_VRBVOC[446]=-1;
C_VRBVOC[447]=24721;
C_VRBVOC[448]=16896;
C_VRBVOC[449]=-1;
C_VRBVOC[450]=-1;
C_VRBVOC[451]=25093;
C_VRBVOC[452]=-1;
C_VRBVOC[453]=-1;
C_VRBVOC[454]=8060;
C_VRBVOC[455]=0;
C_VRBVOC[456]=5414;
C_VRBVOC[457]=31253;
C_VRBVOC[458]=11802;
C_VRBVOC[459]=3685;
C_VRBVOC[460]=21654;
C_VRBVOC[461]=5120;
C_VRBVOC[462]=32059;
C_VRBVOC[463]=32200;
C_VRBVOC[464]=4;
C_VRBVOC[465]=16519;
C_VRBVOC[466]=31232;
C_VRBVOC[467]=1024;
C_VRBVOC[468]=0;
C_VRBVOC[469]=8980;
C_VRBVOC[470]=14967;
C_VRBVOC[471]=7021;
C_VRBVOC[472]=30600;
C_VRBVOC[473]=4;
C_VRBVOC[474]=16508;
C_VRBVOC[475]=31232;
C_VRBVOC[476]=64;
C_VRBVOC[477]=0;
C_VRBVOC[478]=11582;
C_VRBVOC[479]=8000;
C_VRBVOC[480]=12854;
C_VRBVOC[481]=6400;
C_VRBVOC[482]=7014;
C_VRBVOC[483]=2405;
C_VRBVOC[484]=11;
C_VRBVOC[485]=29842;
C_VRBVOC[486]=8708;
C_VRBVOC[487]=32;
C_VRBVOC[488]=0;
C_VRBVOC[489]=26770;
C_VRBVOC[490]=8704;
C_VRBVOC[491]=32;
C_VRBVOC[492]=0;
C_VRBVOC[493]=25088;
C_VRBVOC[494]=-1;
C_VRBVOC[495]=-1;
C_VRBVOC[496]=13012;
C_VRBVOC[497]=19800;
C_VRBVOC[498]=13160;
C_VRBVOC[499]=0;
C_VRBVOC[500]=2;
C_VRBVOC[501]=1175;
C_VRBVOC[502]=20631;
C_VRBVOC[503]=3695;
C_VRBVOC[504]=36800;
C_VRBVOC[505]=15;
C_VRBVOC[506]=25702;
C_VRBVOC[507]=25095;
C_VRBVOC[508]=-1;
C_VRBVOC[509]=-1;
C_VRBVOC[510]=25090;
C_VRBVOC[511]=4;
C_VRBVOC[512]=0;
C_VRBVOC[513]=16496;
C_VRBVOC[514]=25095;
C_VRBVOC[515]=-1;
C_VRBVOC[516]=-1;
C_VRBVOC[517]=16501;
C_VRBVOC[518]=25093;
C_VRBVOC[519]=-1;
C_VRBVOC[520]=-1;
C_VRBVOC[521]=14966;
C_VRBVOC[522]=19260;
C_VRBVOC[523]=4;
C_VRBVOC[524]=28774;
C_VRBVOC[525]=25090;
C_VRBVOC[526]=4;
C_VRBVOC[527]=0;
C_VRBVOC[528]=16853;
C_VRBVOC[529]=25600;
C_VRBVOC[530]=19401;
C_VRBVOC[531]=25600;
C_VRBVOC[532]=5;
C_VRBVOC[533]=91;
C_VRBVOC[534]=16475;
C_VRBVOC[535]=25089;
C_VRBVOC[536]=-1;
C_VRBVOC[537]=-1;
C_VRBVOC[538]=17972;
C_VRBVOC[539]=19200;
C_VRBVOC[540]=21658;
C_VRBVOC[541]=6618;
C_VRBVOC[542]=30881;
C_VRBVOC[543]=40000;
C_VRBVOC[544]=31201;
C_VRBVOC[545]=3200;
C_VRBVOC[546]=6779;
C_VRBVOC[547]=25660;
C_VRBVOC[548]=7;
C_VRBVOC[549]=24715;
C_VRBVOC[550]=8704;
C_VRBVOC[551]=0;
C_VRBVOC[552]=128;
C_VRBVOC[553]=18434;
C_VRBVOC[554]=0;
C_VRBVOC[555]=512;
C_VRBVOC[556]=18175;
C_VRBVOC[557]=5240;
C_VRBVOC[558]=28856;
C_VRBVOC[559]=0;
C_VRBVOC[560]=12;
C_VRBVOC[561]=17526;
C_VRBVOC[562]=25091;
C_VRBVOC[563]=-1;
C_VRBVOC[564]=-1;
C_VRBVOC[565]=16502;
C_VRBVOC[566]=25098;
C_VRBVOC[567]=-1;
C_VRBVOC[568]=-1;
C_VRBVOC[569]=16525;
C_VRBVOC[570]=9734;
C_VRBVOC[571]=32;
C_VRBVOC[572]=0;
C_VRBVOC[573]=19567;
C_VRBVOC[574]=13600;
C_VRBVOC[575]=11;
C_VRBVOC[576]=17531;
C_VRBVOC[577]=31232;
C_VRBVOC[578]=64;
C_VRBVOC[579]=0;
C_VRBVOC[580]=24713;
C_VRBVOC[581]=25088;
C_VRBVOC[582]=64;
C_VRBVOC[583]=0;
C_VRBVOC[584]=22530;
C_VRBVOC[585]=8;
C_VRBVOC[586]=0;
C_VRBVOC[587]=19803;
C_VRBVOC[588]=17600;
C_VRBVOC[589]=4;
C_VRBVOC[590]=16476;
C_VRBVOC[591]=8192;
C_VRBVOC[592]=-1;
C_VRBVOC[593]=-1;
C_VRBVOC[594]=19815;
C_VRBVOC[595]=17600;
C_VRBVOC[596]=19200;
C_VRBVOC[597]=0;
C_VRBVOC[598]=31201;
C_VRBVOC[599]=29000;
C_VRBVOC[600]=11266;
C_VRBVOC[601]=8000;
C_VRBVOC[602]=13;
C_VRBVOC[603]=119;
C_VRBVOC[604]=16503;
C_VRBVOC[605]=24579;
C_VRBVOC[606]=-1;
C_VRBVOC[607]=-1;
C_VRBVOC[608]=16537;
C_VRBVOC[609]=25096;
C_VRBVOC[610]=-1;
C_VRBVOC[611]=-1;
C_VRBVOC[612]=16536;
C_VRBVOC[613]=24581;
C_VRBVOC[614]=-1;
C_VRBVOC[615]=-1;
C_VRBVOC[616]=21012;
C_VRBVOC[617]=32000;
C_VRBVOC[618]=19577;
C_VRBVOC[619]=33966;
C_VRBVOC[620]=4;
C_VRBVOC[621]=28773;
C_VRBVOC[622]=25090;
C_VRBVOC[623]=8;
C_VRBVOC[624]=0;
C_VRBVOC[625]=21422;
C_VRBVOC[626]=8000;
C_VRBVOC[627]=4;
C_VRBVOC[628]=16506;
C_VRBVOC[629]=8192;
C_VRBVOC[630]=-1;
C_VRBVOC[631]=-1;
C_VRBVOC[632]=26452;
C_VRBVOC[633]=19200;
C_VRBVOC[634]=32847;
C_VRBVOC[635]=0;
C_VRBVOC[636]=8;
C_VRBVOC[637]=17530;
C_VRBVOC[638]=8704;
C_VRBVOC[639]=-1;
C_VRBVOC[640]=-1;
C_VRBVOC[641]=16506;
C_VRBVOC[642]=8714;
C_VRBVOC[643]=-1;
C_VRBVOC[644]=-1;
C_VRBVOC[645]=21654;
C_VRBVOC[646]=11200;
C_VRBVOC[647]=12843;
C_VRBVOC[648]=17600;
C_VRBVOC[649]=10335;
C_VRBVOC[650]=3200;
C_VRBVOC[651]=6453;
C_VRBVOC[652]=1885;
C_VRBVOC[653]=5;
C_VRBVOC[654]=21642;
C_VRBVOC[655]=28810;
C_VRBVOC[656]=18434;
C_VRBVOC[657]=-1;
C_VRBVOC[658]=-1;
C_VRBVOC[659]=24645;
C_VRBVOC[660]=22400;
C_VRBVOC[661]=11;
C_VRBVOC[662]=17533;
C_VRBVOC[663]=25088;
C_VRBVOC[664]=4224;
C_VRBVOC[665]=0;
C_VRBVOC[666]=24701;
C_VRBVOC[667]=25088;
C_VRBVOC[668]=4224;
C_VRBVOC[669]=0;
C_VRBVOC[670]=22530;
C_VRBVOC[671]=4;
C_VRBVOC[672]=512;
C_VRBVOC[673]=25963;
C_VRBVOC[674]=17600;
C_VRBVOC[675]=4;
C_VRBVOC[676]=16516;
C_VRBVOC[677]=25095;
C_VRBVOC[678]=8192;
C_VRBVOC[679]=32;
C_VRBVOC[680]=26101;
C_VRBVOC[681]=11200;
C_VRBVOC[682]=11701;
C_VRBVOC[683]=8000;
C_VRBVOC[684]=25660;
C_VRBVOC[685]=5120;
C_VRBVOC[686]=4;
C_VRBVOC[687]=28778;
C_VRBVOC[688]=25090;
C_VRBVOC[689]=-1;
C_VRBVOC[690]=-1;
C_VRBVOC[691]=26211;
C_VRBVOC[692]=8000;
C_VRBVOC[693]=3925;
C_VRBVOC[694]=2040;
C_VRBVOC[695]=16042;
C_VRBVOC[696]=0;
C_VRBVOC[697]=7;
C_VRBVOC[698]=24714;
C_VRBVOC[699]=8704;
C_VRBVOC[700]=0;
C_VRBVOC[701]=128;
C_VRBVOC[702]=18434;
C_VRBVOC[703]=0;
C_VRBVOC[704]=512;
C_VRBVOC[705]=26221;
C_VRBVOC[706]=28800;
C_VRBVOC[707]=31049;
C_VRBVOC[708]=19680;
C_VRBVOC[709]=11;
C_VRBVOC[710]=17555;
C_VRBVOC[711]=17408;
C_VRBVOC[712]=256;
C_VRBVOC[713]=0;
C_VRBVOC[714]=24723;
C_VRBVOC[715]=17408;
C_VRBVOC[716]=256;
C_VRBVOC[717]=0;
C_VRBVOC[718]=24581;
C_VRBVOC[719]=-1;
C_VRBVOC[720]=-1;
C_VRBVOC[721]=26453;
C_VRBVOC[722]=25600;
C_VRBVOC[723]=4;
C_VRBVOC[724]=24730;
C_VRBVOC[725]=24583;
C_VRBVOC[726]=-1;
C_VRBVOC[727]=-1;
C_VRBVOC[728]=26460;
C_VRBVOC[729]=0;
C_VRBVOC[730]=14979;
C_VRBVOC[731]=8740;
C_VRBVOC[732]=31221;
C_VRBVOC[733]=9840;
C_VRBVOC[734]=26081;
C_VRBVOC[735]=5000;
C_VRBVOC[736]=8;
C_VRBVOC[737]=29840;
C_VRBVOC[738]=25093;
C_VRBVOC[739]=-1;
C_VRBVOC[740]=-1;
C_VRBVOC[741]=16529;
C_VRBVOC[742]=25094;
C_VRBVOC[743]=-1;
C_VRBVOC[744]=-1;
C_VRBVOC[745]=28849;
C_VRBVOC[746]=30600;
C_VRBVOC[747]=19566;
C_VRBVOC[748]=32000;
C_VRBVOC[749]=5;
C_VRBVOC[750]=21613;
C_VRBVOC[751]=16493;
C_VRBVOC[752]=25095;
C_VRBVOC[753]=-1;
C_VRBVOC[754]=-1;
C_VRBVOC[755]=29001;
C_VRBVOC[756]=6400;
C_VRBVOC[757]=30849;
C_VRBVOC[758]=20800;
C_VRBVOC[759]=11;
C_VRBVOC[760]=17508;
C_VRBVOC[761]=29184;
C_VRBVOC[762]=16384;
C_VRBVOC[763]=0;
C_VRBVOC[764]=24676;
C_VRBVOC[765]=29184;
C_VRBVOC[766]=16384;
C_VRBVOC[767]=0;
C_VRBVOC[768]=25090;
C_VRBVOC[769]=-1;
C_VRBVOC[770]=-1;
C_VRBVOC[771]=31218;
C_VRBVOC[772]=14845;
C_VRBVOC[773]=12;
C_VRBVOC[774]=24717;
C_VRBVOC[775]=9728;
C_VRBVOC[776]=32;
C_VRBVOC[777]=0;
C_VRBVOC[778]=18434;
C_VRBVOC[779]=0;
C_VRBVOC[780]=512;
C_VRBVOC[781]=17549;
C_VRBVOC[782]=9728;
C_VRBVOC[783]=32;
C_VRBVOC[784]=0;
C_VRBVOC[785]=20603;
C_VRBVOC[786]=31329;
C_VRBVOC[787]=22680;
C_VRBVOC[788]=32338;
C_VRBVOC[789]=34380;
C_VRBVOC[790]=7;
C_VRBVOC[791]=24716;
C_VRBVOC[792]=18432;
C_VRBVOC[793]=0;
C_VRBVOC[794]=512;
C_VRBVOC[795]=8707;
C_VRBVOC[796]=0;
C_VRBVOC[797]=128;
C_VRBVOC[798]=32051;
C_VRBVOC[799]=8000;
C_VRBVOC[800]=11420;
C_VRBVOC[801]=0;
C_VRBVOC[802]=13412;
C_VRBVOC[803]=6400;
C_VRBVOC[804]=4858;
C_VRBVOC[805]=29800;
C_VRBVOC[806]=29013;
C_VRBVOC[807]=24885;
C_VRBVOC[808]=4;
C_VRBVOC[809]=16516;
C_VRBVOC[810]=25088;
C_VRBVOC[811]=8192;
C_VRBVOC[812]=32;
C_VRBVOC[813]=32212;
C_VRBVOC[814]=19200;
C_VRBVOC[815]=5413;
C_VRBVOC[816]=20854;
C_VRBVOC[817]=29017;
C_VRBVOC[818]=33819;
C_VRBVOC[819]=4;
C_VRBVOC[820]=16527;
C_VRBVOC[821]=8192;
C_VRBVOC[822]=0;
C_VRBVOC[823]=1024;
C_VRBVOC[824]=32338;
C_VRBVOC[825]=24920;
C_VRBVOC[826]=13658;
C_VRBVOC[827]=19200;
C_VRBVOC[828]=5141;
C_VRBVOC[829]=5240;
C_VRBVOC[830]=14;
C_VRBVOC[831]=24724;
C_VRBVOC[832]=18432;
C_VRBVOC[833]=-1;
C_VRBVOC[834]=-1;
C_VRBVOC[835]=8707;
C_VRBVOC[836]=32;
C_VRBVOC[837]=0;
C_VRBVOC[838]=24724;
C_VRBVOC[839]=18432;
C_VRBVOC[840]=-1;
C_VRBVOC[841]=-1;
C_VRBVOC[842]=8706;
C_VRBVOC[843]=32;
C_VRBVOC[844]=0;
C_VRBVOC[845]=32365;
C_VRBVOC[846]=0;
C_VRBVOC[847]=9659;
C_VRBVOC[848]=32214;
C_VRBVOC[849]=11;
C_VRBVOC[850]=28786;
C_VRBVOC[851]=25092;
C_VRBVOC[852]=-1;
C_VRBVOC[853]=-1;
C_VRBVOC[854]=24691;
C_VRBVOC[855]=8704;
C_VRBVOC[856]=32;
C_VRBVOC[857]=0;
C_VRBVOC[858]=27138;
C_VRBVOC[859]=4;
C_VRBVOC[860]=0;
C_VRBVOC[861]=32858;
C_VRBVOC[862]=22400;
C_VRBVOC[863]=30620;
C_VRBVOC[864]=0;
C_VRBVOC[865]=22;
C_VRBVOC[866]=25716;
C_VRBVOC[867]=25088;
C_VRBVOC[868]=2;
C_VRBVOC[869]=0;
C_VRBVOC[870]=26626;
C_VRBVOC[871]=4;
C_VRBVOC[872]=0;
C_VRBVOC[873]=16507;
C_VRBVOC[874]=31242;
C_VRBVOC[875]=64;
C_VRBVOC[876]=0;
C_VRBVOC[877]=16508;
C_VRBVOC[878]=31243;
C_VRBVOC[879]=64;
C_VRBVOC[880]=0;
C_VRBVOC[881]=24735;
C_VRBVOC[882]=25088;
C_VRBVOC[883]=2;
C_VRBVOC[884]=0;
C_VRBVOC[885]=8196;
C_VRBVOC[886]=-1;
C_VRBVOC[887]=-1;
C_VRBVOC[888]=34172;
C_VRBVOC[889]=24131;
C_VRBVOC[890]=7;
C_VRBVOC[891]=24669;
C_VRBVOC[892]=8704;
C_VRBVOC[893]=-1;
C_VRBVOC[894]=-1;
C_VRBVOC[895]=30722;
C_VRBVOC[896]=4;
C_VRBVOC[897]=0;
C_VRBVOC[898]=36851;
C_VRBVOC[899]=8000;
C_VRBVOC[900]=31258;
C_VRBVOC[901]=26329;
C_VRBVOC[902]=2081;
C_VRBVOC[903]=29320;
C_VRBVOC[904]=31201;
C_VRBVOC[905]=29612;
C_VRBVOC[906]=8;
C_VRBVOC[907]=17512;
C_VRBVOC[908]=8192;
C_VRBVOC[909]=32;
C_VRBVOC[910]=0;
C_VRBVOC[911]=16488;
C_VRBVOC[912]=8199;
C_VRBVOC[913]=32;
C_VRBVOC[914]=0;
C_VRBVOC[915]=36862;
C_VRBVOC[916]=8000;
C_VRBVOC[917]=10081;
C_VRBVOC[918]=34180;
C_VRBVOC[919]=3921;
C_VRBVOC[920]=22569;
C_VRBVOC[921]=4;
C_VRBVOC[922]=16492;
C_VRBVOC[923]=16384;
C_VRBVOC[924]=-1;
C_VRBVOC[925]=-1;
C_VRBVOC[926]=37174;
C_VRBVOC[927]=6400;
C_VRBVOC[928]=5;
C_VRBVOC[929]=20635;
C_VRBVOC[930]=16539;
C_VRBVOC[931]=25095;
C_VRBVOC[932]=-1;
C_VRBVOC[933]=-1;
C_VRBVOC[934]=-1;
C_OBJVOC[0]=3247;
C_OBJVOC[1]=0;
C_OBJVOC[2]=1;
C_OBJVOC[3]=25;
C_OBJVOC[4]=100;
C_OBJVOC[5]=30443;
C_OBJVOC[6]=17600;
C_OBJVOC[7]=1;
C_OBJVOC[8]=11258;
C_OBJVOC[9]=19563;
C_OBJVOC[10]=2;
C_OBJVOC[11]=5295;
C_OBJVOC[12]=35400;
C_OBJVOC[13]=2;
C_OBJVOC[14]=10215;
C_OBJVOC[15]=6400;
C_OBJVOC[16]=3;
C_OBJVOC[17]=30454;
C_OBJVOC[18]=7329;
C_OBJVOC[19]=3;
C_OBJVOC[20]=20054;
C_OBJVOC[21]=5120;
C_OBJVOC[22]=3;
C_OBJVOC[23]=6774;
C_OBJVOC[24]=22618;
C_OBJVOC[25]=3;
C_OBJVOC[26]=12054;
C_OBJVOC[27]=17600;
C_OBJVOC[28]=4;
C_OBJVOC[29]=55;
C_OBJVOC[30]=25965;
C_OBJVOC[31]=5000;
C_OBJVOC[32]=4;
C_OBJVOC[33]=143;
C_OBJVOC[34]=186;
C_OBJVOC[35]=30881;
C_OBJVOC[36]=11200;
C_OBJVOC[37]=4;
C_OBJVOC[38]=5401;
C_OBJVOC[39]=19200;
C_OBJVOC[40]=5;
C_OBJVOC[41]=25972;
C_OBJVOC[42]=8000;
C_OBJVOC[43]=5;
C_OBJVOC[44]=18;
C_OBJVOC[45]=38;
C_OBJVOC[46]=78;
C_OBJVOC[47]=87;
C_OBJVOC[48]=88;
C_OBJVOC[49]=13001;
C_OBJVOC[50]=25600;
C_OBJVOC[51]=5;
C_OBJVOC[52]=9967;
C_OBJVOC[53]=34329;
C_OBJVOC[54]=6;
C_OBJVOC[55]=20843;
C_OBJVOC[56]=13174;
C_OBJVOC[57]=7;
C_OBJVOC[58]=25776;
C_OBJVOC[59]=50800;
C_OBJVOC[60]=7;
C_OBJVOC[61]=25776;
C_OBJVOC[62]=50840;
C_OBJVOC[63]=7;
C_OBJVOC[64]=7145;
C_OBJVOC[65]=8720;
C_OBJVOC[66]=7;
C_OBJVOC[67]=19564;
C_OBJVOC[68]=0;
C_OBJVOC[69]=7;
C_OBJVOC[70]=6761;
C_OBJVOC[71]=21414;
C_OBJVOC[72]=8;
C_OBJVOC[73]=4859;
C_OBJVOC[74]=8000;
C_OBJVOC[75]=9;
C_OBJVOC[76]=123;
C_OBJVOC[77]=3820;
C_OBJVOC[78]=32485;
C_OBJVOC[79]=10;
C_OBJVOC[80]=121;
C_OBJVOC[81]=5414;
C_OBJVOC[82]=32049;
C_OBJVOC[83]=10;
C_OBJVOC[84]=36860;
C_OBJVOC[85]=8720;
C_OBJVOC[86]=11;
C_OBJVOC[87]=209;
C_OBJVOC[88]=28041;
C_OBJVOC[89]=23209;
C_OBJVOC[90]=11;
C_OBJVOC[91]=209;
C_OBJVOC[92]=19577;
C_OBJVOC[93]=33964;
C_OBJVOC[94]=11;
C_OBJVOC[95]=209;
C_OBJVOC[96]=14095;
C_OBJVOC[97]=0;
C_OBJVOC[98]=11;
C_OBJVOC[99]=209;
C_OBJVOC[100]=29416;
C_OBJVOC[101]=8000;
C_OBJVOC[102]=12;
C_OBJVOC[103]=101;
C_OBJVOC[104]=13013;
C_OBJVOC[105]=25600;
C_OBJVOC[106]=12;
C_OBJVOC[107]=5409;
C_OBJVOC[108]=19200;
C_OBJVOC[109]=12;
C_OBJVOC[110]=110;
C_OBJVOC[111]=18169;
C_OBJVOC[112]=9800;
C_OBJVOC[113]=13;
C_OBJVOC[114]=21;
C_OBJVOC[115]=3681;
C_OBJVOC[116]=6600;
C_OBJVOC[117]=13;
C_OBJVOC[118]=14;
C_OBJVOC[119]=31335;
C_OBJVOC[120]=28960;
C_OBJVOC[121]=14;
C_OBJVOC[122]=24723;
C_OBJVOC[123]=13529;
C_OBJVOC[124]=14;
C_OBJVOC[125]=11681;
C_OBJVOC[126]=20978;
C_OBJVOC[127]=14;
C_OBJVOC[128]=19253;
C_OBJVOC[129]=25600;
C_OBJVOC[130]=15;
C_OBJVOC[131]=16;
C_OBJVOC[132]=22;
C_OBJVOC[133]=19254;
C_OBJVOC[134]=32218;
C_OBJVOC[135]=15;
C_OBJVOC[136]=16;
C_OBJVOC[137]=22;
C_OBJVOC[138]=29647;
C_OBJVOC[139]=0;
C_OBJVOC[140]=17;
C_OBJVOC[141]=4858;
C_OBJVOC[142]=25820;
C_OBJVOC[143]=17;
C_OBJVOC[144]=19401;
C_OBJVOC[145]=35419;
C_OBJVOC[146]=18;
C_OBJVOC[147]=19401;
C_OBJVOC[148]=9600;
C_OBJVOC[149]=18;
C_OBJVOC[150]=32735;
C_OBJVOC[151]=19680;
C_OBJVOC[152]=19;
C_OBJVOC[153]=2565;
C_OBJVOC[154]=0;
C_OBJVOC[155]=20;
C_OBJVOC[156]=6774;
C_OBJVOC[157]=22618;
C_OBJVOC[158]=3;
C_OBJVOC[159]=17825;
C_OBJVOC[160]=30400;
C_OBJVOC[161]=23;
C_OBJVOC[162]=17825;
C_OBJVOC[163]=0;
C_OBJVOC[164]=23;
C_OBJVOC[165]=30620;
C_OBJVOC[166]=0;
C_OBJVOC[167]=23;
C_OBJVOC[168]=3814;
C_OBJVOC[169]=8760;
C_OBJVOC[170]=24;
C_OBJVOC[171]=30845;
C_OBJVOC[172]=19420;
C_OBJVOC[173]=24;
C_OBJVOC[174]=3804;
C_OBJVOC[175]=40000;
C_OBJVOC[176]=24;
C_OBJVOC[177]=73;
C_OBJVOC[178]=5409;
C_OBJVOC[179]=23160;
C_OBJVOC[180]=25;
C_OBJVOC[181]=3258;
C_OBJVOC[182]=0;
C_OBJVOC[183]=26;
C_OBJVOC[184]=165;
C_OBJVOC[185]=168;
C_OBJVOC[186]=22603;
C_OBJVOC[187]=18081;
C_OBJVOC[188]=27;
C_OBJVOC[189]=25801;
C_OBJVOC[190]=29299;
C_OBJVOC[191]=27;
C_OBJVOC[192]=21178;
C_OBJVOC[193]=29418;
C_OBJVOC[194]=28;
C_OBJVOC[195]=29;
C_OBJVOC[196]=212;
C_OBJVOC[197]=14525;
C_OBJVOC[198]=0;
C_OBJVOC[199]=30;
C_OBJVOC[200]=20859;
C_OBJVOC[201]=30400;
C_OBJVOC[202]=30;
C_OBJVOC[203]=11681;
C_OBJVOC[204]=5165;
C_OBJVOC[205]=30;
C_OBJVOC[206]=29642;
C_OBJVOC[207]=40000;
C_OBJVOC[208]=31;
C_OBJVOC[209]=32729;
C_OBJVOC[210]=6614;
C_OBJVOC[211]=32;
C_OBJVOC[212]=10218;
C_OBJVOC[213]=17600;
C_OBJVOC[214]=32;
C_OBJVOC[215]=5406;
C_OBJVOC[216]=9974;
C_OBJVOC[217]=33;
C_OBJVOC[218]=4859;
C_OBJVOC[219]=17820;
C_OBJVOC[220]=33;
C_OBJVOC[221]=32618;
C_OBJVOC[222]=5120;
C_OBJVOC[223]=34;
C_OBJVOC[224]=4847;
C_OBJVOC[225]=8000;
C_OBJVOC[226]=35;
C_OBJVOC[227]=36;
C_OBJVOC[228]=124;
C_OBJVOC[229]=125;
C_OBJVOC[230]=7253;
C_OBJVOC[231]=4121;
C_OBJVOC[232]=35;
C_OBJVOC[233]=36;
C_OBJVOC[234]=3259;
C_OBJVOC[235]=17820;
C_OBJVOC[236]=35;
C_OBJVOC[237]=36;
C_OBJVOC[238]=98;
C_OBJVOC[239]=113;
C_OBJVOC[240]=3921;
C_OBJVOC[241]=5012;
C_OBJVOC[242]=37;
C_OBJVOC[243]=16223;
C_OBJVOC[244]=8480;
C_OBJVOC[245]=37;
C_OBJVOC[246]=32373;
C_OBJVOC[247]=3418;
C_OBJVOC[248]=38;
C_OBJVOC[249]=3824;
C_OBJVOC[250]=0;
C_OBJVOC[251]=39;
C_OBJVOC[252]=53;
C_OBJVOC[253]=105;
C_OBJVOC[254]=31218;
C_OBJVOC[255]=1769;
C_OBJVOC[256]=40;
C_OBJVOC[257]=35575;
C_OBJVOC[258]=19574;
C_OBJVOC[259]=40;
C_OBJVOC[260]=8567;
C_OBJVOC[261]=28862;
C_OBJVOC[262]=41;
C_OBJVOC[263]=14979;
C_OBJVOC[264]=5529;
C_OBJVOC[265]=41;
C_OBJVOC[266]=44;
C_OBJVOC[267]=11535;
C_OBJVOC[268]=31200;
C_OBJVOC[269]=42;
C_OBJVOC[270]=31049;
C_OBJVOC[271]=29180;
C_OBJVOC[272]=42;
C_OBJVOC[273]=9965;
C_OBJVOC[274]=22560;
C_OBJVOC[275]=42;
C_OBJVOC[276]=11921;
C_OBJVOC[277]=14880;
C_OBJVOC[278]=43;
C_OBJVOC[279]=26321;
C_OBJVOC[280]=40218;
C_OBJVOC[281]=44;
C_OBJVOC[282]=47;
C_OBJVOC[283]=32741;
C_OBJVOC[284]=22840;
C_OBJVOC[285]=45;
C_OBJVOC[286]=5125;
C_OBJVOC[287]=31200;
C_OBJVOC[288]=45;
C_OBJVOC[289]=3412;
C_OBJVOC[290]=19200;
C_OBJVOC[291]=46;
C_OBJVOC[292]=3815;
C_OBJVOC[293]=17600;
C_OBJVOC[294]=47;
C_OBJVOC[295]=49;
C_OBJVOC[296]=114;
C_OBJVOC[297]=115;
C_OBJVOC[298]=116;
C_OBJVOC[299]=117;
C_OBJVOC[300]=3562;
C_OBJVOC[301]=19400;
C_OBJVOC[302]=47;
C_OBJVOC[303]=11815;
C_OBJVOC[304]=6495;
C_OBJVOC[305]=47;
C_OBJVOC[306]=4854;
C_OBJVOC[307]=6885;
C_OBJVOC[308]=48;
C_OBJVOC[309]=25649;
C_OBJVOC[310]=28800;
C_OBJVOC[311]=48;
C_OBJVOC[312]=12049;
C_OBJVOC[313]=6602;
C_OBJVOC[314]=49;
C_OBJVOC[315]=12049;
C_OBJVOC[316]=6600;
C_OBJVOC[317]=49;
C_OBJVOC[318]=25656;
C_OBJVOC[319]=8720;
C_OBJVOC[320]=50;
C_OBJVOC[321]=122;
C_OBJVOC[322]=143;
C_OBJVOC[323]=186;
C_OBJVOC[324]=22623;
C_OBJVOC[325]=31041;
C_OBJVOC[326]=50;
C_OBJVOC[327]=15179;
C_OBJVOC[328]=33800;
C_OBJVOC[329]=50;
C_OBJVOC[330]=29016;
C_OBJVOC[331]=24740;
C_OBJVOC[332]=50;
C_OBJVOC[333]=20847;
C_OBJVOC[334]=2649;
C_OBJVOC[335]=50;
C_OBJVOC[336]=22623;
C_OBJVOC[337]=30400;
C_OBJVOC[338]=50;
C_OBJVOC[339]=20860;
C_OBJVOC[340]=5122;
C_OBJVOC[341]=51;
C_OBJVOC[342]=20860;
C_OBJVOC[343]=5120;
C_OBJVOC[344]=51;
C_OBJVOC[345]=20860;
C_OBJVOC[346]=5125;
C_OBJVOC[347]=51;
C_OBJVOC[348]=1782;
C_OBJVOC[349]=8740;
C_OBJVOC[350]=52;
C_OBJVOC[351]=25653;
C_OBJVOC[352]=25932;
C_OBJVOC[353]=52;
C_OBJVOC[354]=19401;
C_OBJVOC[355]=10085;
C_OBJVOC[356]=52;
C_OBJVOC[357]=3815;
C_OBJVOC[358]=18085;
C_OBJVOC[359]=52;
C_OBJVOC[360]=20849;
C_OBJVOC[361]=19295;
C_OBJVOC[362]=53;
C_OBJVOC[363]=32842;
C_OBJVOC[364]=8000;
C_OBJVOC[365]=54;
C_OBJVOC[366]=32615;
C_OBJVOC[367]=32336;
C_OBJVOC[368]=54;
C_OBJVOC[369]=26460;
C_OBJVOC[370]=33000;
C_OBJVOC[371]=55;
C_OBJVOC[372]=20860;
C_OBJVOC[373]=8729;
C_OBJVOC[374]=55;
C_OBJVOC[375]=11701;
C_OBJVOC[376]=8000;
C_OBJVOC[377]=55;
C_OBJVOC[378]=37525;
C_OBJVOC[379]=22528;
C_OBJVOC[380]=56;
C_OBJVOC[381]=30538;
C_OBJVOC[382]=8924;
C_OBJVOC[383]=57;
C_OBJVOC[384]=5803;
C_OBJVOC[385]=19816;
C_OBJVOC[386]=58;
C_OBJVOC[387]=21414;
C_OBJVOC[388]=31205;
C_OBJVOC[389]=58;
C_OBJVOC[390]=5121;
C_OBJVOC[391]=19563;
C_OBJVOC[392]=59;
C_OBJVOC[393]=5656;
C_OBJVOC[394]=0;
C_OBJVOC[395]=59;
C_OBJVOC[396]=11802;
C_OBJVOC[397]=19420;
C_OBJVOC[398]=59;
C_OBJVOC[399]=25649;
C_OBJVOC[400]=23209;
C_OBJVOC[401]=60;
C_OBJVOC[402]=149;
C_OBJVOC[403]=2340;
C_OBJVOC[404]=0;
C_OBJVOC[405]=60;
C_OBJVOC[406]=149;
C_OBJVOC[407]=4854;
C_OBJVOC[408]=35259;
C_OBJVOC[409]=60;
C_OBJVOC[410]=25963;
C_OBJVOC[411]=32858;
C_OBJVOC[412]=60;
C_OBJVOC[413]=37418;
C_OBJVOC[414]=17600;
C_OBJVOC[415]=60;
C_OBJVOC[416]=20859;
C_OBJVOC[417]=32218;
C_OBJVOC[418]=60;
C_OBJVOC[419]=215;
C_OBJVOC[420]=32329;
C_OBJVOC[421]=8240;
C_OBJVOC[422]=61;
C_OBJVOC[423]=29402;
C_OBJVOC[424]=3418;
C_OBJVOC[425]=61;
C_OBJVOC[426]=5529;
C_OBJVOC[427]=21174;
C_OBJVOC[428]=61;
C_OBJVOC[429]=3254;
C_OBJVOC[430]=6780;
C_OBJVOC[431]=61;
C_OBJVOC[432]=5535;
C_OBJVOC[433]=24440;
C_OBJVOC[434]=61;
C_OBJVOC[435]=11414;
C_OBJVOC[436]=32000;
C_OBJVOC[437]=61;
C_OBJVOC[438]=11414;
C_OBJVOC[439]=32485;
C_OBJVOC[440]=61;
C_OBJVOC[441]=20854;
C_OBJVOC[442]=0;
C_OBJVOC[443]=61;
C_OBJVOC[444]=32341;
C_OBJVOC[445]=11200;
C_OBJVOC[446]=61;
C_OBJVOC[447]=3247;
C_OBJVOC[448]=20854;
C_OBJVOC[449]=61;
C_OBJVOC[450]=31209;
C_OBJVOC[451]=19685;
C_OBJVOC[452]=62;
C_OBJVOC[453]=37174;
C_OBJVOC[454]=7023;
C_OBJVOC[455]=63;
C_OBJVOC[456]=3812;
C_OBJVOC[457]=32000;
C_OBJVOC[458]=64;
C_OBJVOC[459]=23260;
C_OBJVOC[460]=0;
C_OBJVOC[461]=64;
C_OBJVOC[462]=11921;
C_OBJVOC[463]=32200;
C_OBJVOC[464]=65;
C_OBJVOC[465]=11921;
C_OBJVOC[466]=32374;
C_OBJVOC[467]=65;
C_OBJVOC[468]=7015;
C_OBJVOC[469]=28800;
C_OBJVOC[470]=66;
C_OBJVOC[471]=67;
C_OBJVOC[472]=68;
C_OBJVOC[473]=69;
C_OBJVOC[474]=164;
C_OBJVOC[475]=172;
C_OBJVOC[476]=173;
C_OBJVOC[477]=174;
C_OBJVOC[478]=175;
C_OBJVOC[479]=189;
C_OBJVOC[480]=32721;
C_OBJVOC[481]=25775;
C_OBJVOC[482]=66;
C_OBJVOC[483]=32721;
C_OBJVOC[484]=26684;
C_OBJVOC[485]=66;
C_OBJVOC[486]=31329;
C_OBJVOC[487]=32128;
C_OBJVOC[488]=70;
C_OBJVOC[489]=76;
C_OBJVOC[490]=79;
C_OBJVOC[491]=80;
C_OBJVOC[492]=81;
C_OBJVOC[493]=82;
C_OBJVOC[494]=170;
C_OBJVOC[495]=13001;
C_OBJVOC[496]=6400;
C_OBJVOC[497]=71;
C_OBJVOC[498]=120;
C_OBJVOC[499]=5418;
C_OBJVOC[500]=26365;
C_OBJVOC[501]=72;
C_OBJVOC[502]=73;
C_OBJVOC[503]=3804;
C_OBJVOC[504]=14619;
C_OBJVOC[505]=73;
C_OBJVOC[506]=6453;
C_OBJVOC[507]=0;
C_OBJVOC[508]=74;
C_OBJVOC[509]=11260;
C_OBJVOC[510]=8760;
C_OBJVOC[511]=74;
C_OBJVOC[512]=76;
C_OBJVOC[513]=11260;
C_OBJVOC[514]=8000;
C_OBJVOC[515]=74;
C_OBJVOC[516]=76;
C_OBJVOC[517]=9724;
C_OBJVOC[518]=0;
C_OBJVOC[519]=74;
C_OBJVOC[520]=28849;
C_OBJVOC[521]=19200;
C_OBJVOC[522]=75;
C_OBJVOC[523]=28849;
C_OBJVOC[524]=19574;
C_OBJVOC[525]=75;
C_OBJVOC[526]=4060;
C_OBJVOC[527]=32614;
C_OBJVOC[528]=76;
C_OBJVOC[529]=79;
C_OBJVOC[530]=80;
C_OBJVOC[531]=81;
C_OBJVOC[532]=82;
C_OBJVOC[533]=127;
C_OBJVOC[534]=128;
C_OBJVOC[535]=129;
C_OBJVOC[536]=170;
C_OBJVOC[537]=176;
C_OBJVOC[538]=4042;
C_OBJVOC[539]=3685;
C_OBJVOC[540]=77;
C_OBJVOC[541]=19401;
C_OBJVOC[542]=17600;
C_OBJVOC[543]=78;
C_OBJVOC[544]=7129;
C_OBJVOC[545]=25600;
C_OBJVOC[546]=78;
C_OBJVOC[547]=13412;
C_OBJVOC[548]=8000;
C_OBJVOC[549]=78;
C_OBJVOC[550]=107;
C_OBJVOC[551]=3260;
C_OBJVOC[552]=0;
C_OBJVOC[553]=83;
C_OBJVOC[554]=28849;
C_OBJVOC[555]=22495;
C_OBJVOC[556]=84;
C_OBJVOC[557]=26220;
C_OBJVOC[558]=0;
C_OBJVOC[559]=85;
C_OBJVOC[560]=31201;
C_OBJVOC[561]=32845;
C_OBJVOC[562]=86;
C_OBJVOC[563]=30541;
C_OBJVOC[564]=19860;
C_OBJVOC[565]=86;
C_OBJVOC[566]=29403;
C_OBJVOC[567]=17600;
C_OBJVOC[568]=86;
C_OBJVOC[569]=3801;
C_OBJVOC[570]=32000;
C_OBJVOC[571]=87;
C_OBJVOC[572]=88;
C_OBJVOC[573]=90;
C_OBJVOC[574]=26081;
C_OBJVOC[575]=31209;
C_OBJVOC[576]=87;
C_OBJVOC[577]=88;
C_OBJVOC[578]=26453;
C_OBJVOC[579]=25600;
C_OBJVOC[580]=89;
C_OBJVOC[581]=1978;
C_OBJVOC[582]=26453;
C_OBJVOC[583]=89;
C_OBJVOC[584]=1978;
C_OBJVOC[585]=43861;
C_OBJVOC[586]=89;
C_OBJVOC[587]=19242;
C_OBJVOC[588]=8480;
C_OBJVOC[589]=91;
C_OBJVOC[590]=112;
C_OBJVOC[591]=9974;
C_OBJVOC[592]=8658;
C_OBJVOC[593]=91;
C_OBJVOC[594]=31209;
C_OBJVOC[595]=5240;
C_OBJVOC[596]=92;
C_OBJVOC[597]=3258;
C_OBJVOC[598]=29012;
C_OBJVOC[599]=93;
C_OBJVOC[600]=4055;
C_OBJVOC[601]=40000;
C_OBJVOC[602]=94;
C_OBJVOC[603]=8525;
C_OBJVOC[604]=28852;
C_OBJVOC[605]=95;
C_OBJVOC[606]=30735;
C_OBJVOC[607]=35412;
C_OBJVOC[608]=96;
C_OBJVOC[609]=12041;
C_OBJVOC[610]=23000;
C_OBJVOC[611]=97;
C_OBJVOC[612]=5521;
C_OBJVOC[613]=25600;
C_OBJVOC[614]=97;
C_OBJVOC[615]=30729;
C_OBJVOC[616]=32000;
C_OBJVOC[617]=97;
C_OBJVOC[618]=13654;
C_OBJVOC[619]=17600;
C_OBJVOC[620]=97;
C_OBJVOC[621]=3252;
C_OBJVOC[622]=19815;
C_OBJVOC[623]=98;
C_OBJVOC[624]=113;
C_OBJVOC[625]=29003;
C_OBJVOC[626]=8660;
C_OBJVOC[627]=99;
C_OBJVOC[628]=37178;
C_OBJVOC[629]=8000;
C_OBJVOC[630]=101;
C_OBJVOC[631]=110;
C_OBJVOC[632]=13415;
C_OBJVOC[633]=17600;
C_OBJVOC[634]=102;
C_OBJVOC[635]=103;
C_OBJVOC[636]=42218;
C_OBJVOC[637]=18129;
C_OBJVOC[638]=104;
C_OBJVOC[639]=148;
C_OBJVOC[640]=5409;
C_OBJVOC[641]=22400;
C_OBJVOC[642]=104;
C_OBJVOC[643]=30446;
C_OBJVOC[644]=8000;
C_OBJVOC[645]=105;
C_OBJVOC[646]=4858;
C_OBJVOC[647]=6400;
C_OBJVOC[648]=106;
C_OBJVOC[649]=188;
C_OBJVOC[650]=23020;
C_OBJVOC[651]=8000;
C_OBJVOC[652]=106;
C_OBJVOC[653]=186;
C_OBJVOC[654]=30895;
C_OBJVOC[655]=32000;
C_OBJVOC[656]=107;
C_OBJVOC[657]=187;
C_OBJVOC[658]=5535;
C_OBJVOC[659]=37360;
C_OBJVOC[660]=108;
C_OBJVOC[661]=3929;
C_OBJVOC[662]=5240;
C_OBJVOC[663]=109;
C_OBJVOC[664]=10459;
C_OBJVOC[665]=8000;
C_OBJVOC[666]=110;
C_OBJVOC[667]=11775;
C_OBJVOC[668]=21000;
C_OBJVOC[669]=111;
C_OBJVOC[670]=152;
C_OBJVOC[671]=31201;
C_OBJVOC[672]=21440;
C_OBJVOC[673]=118;
C_OBJVOC[674]=32613;
C_OBJVOC[675]=3200;
C_OBJVOC[676]=119;
C_OBJVOC[677]=5545;
C_OBJVOC[678]=26400;
C_OBJVOC[679]=119;
C_OBJVOC[680]=11921;
C_OBJVOC[681]=35400;
C_OBJVOC[682]=119;
C_OBJVOC[683]=13001;
C_OBJVOC[684]=7160;
C_OBJVOC[685]=120;
C_OBJVOC[686]=26212;
C_OBJVOC[687]=8760;
C_OBJVOC[688]=120;
C_OBJVOC[689]=14936;
C_OBJVOC[690]=19413;
C_OBJVOC[691]=120;
C_OBJVOC[692]=19819;
C_OBJVOC[693]=8739;
C_OBJVOC[694]=120;
C_OBJVOC[695]=5411;
C_OBJVOC[696]=8760;
C_OBJVOC[697]=121;
C_OBJVOC[698]=19579;
C_OBJVOC[699]=32374;
C_OBJVOC[700]=122;
C_OBJVOC[701]=31201;
C_OBJVOC[702]=5240;
C_OBJVOC[703]=122;
C_OBJVOC[704]=26329;
C_OBJVOC[705]=23215;
C_OBJVOC[706]=122;
C_OBJVOC[707]=31048;
C_OBJVOC[708]=8725;
C_OBJVOC[709]=126;
C_OBJVOC[710]=3252;
C_OBJVOC[711]=19200;
C_OBJVOC[712]=126;
C_OBJVOC[713]=8803;
C_OBJVOC[714]=13174;
C_OBJVOC[715]=130;
C_OBJVOC[716]=131;
C_OBJVOC[717]=36852;
C_OBJVOC[718]=19960;
C_OBJVOC[719]=130;
C_OBJVOC[720]=131;
C_OBJVOC[721]=198;
C_OBJVOC[722]=205;
C_OBJVOC[723]=206;
C_OBJVOC[724]=207;
C_OBJVOC[725]=208;
C_OBJVOC[726]=36852;
C_OBJVOC[727]=19200;
C_OBJVOC[728]=130;
C_OBJVOC[729]=131;
C_OBJVOC[730]=159;
C_OBJVOC[731]=160;
C_OBJVOC[732]=161;
C_OBJVOC[733]=162;
C_OBJVOC[734]=163;
C_OBJVOC[735]=164;
C_OBJVOC[736]=198;
C_OBJVOC[737]=205;
C_OBJVOC[738]=206;
C_OBJVOC[739]=207;
C_OBJVOC[740]=208;
C_OBJVOC[741]=10081;
C_OBJVOC[742]=30840;
C_OBJVOC[743]=132;
C_OBJVOC[744]=26215;
C_OBJVOC[745]=19200;
C_OBJVOC[746]=133;
C_OBJVOC[747]=30623;
C_OBJVOC[748]=1885;
C_OBJVOC[749]=133;
C_OBJVOC[750]=32374;
C_OBJVOC[751]=0;
C_OBJVOC[752]=134;
C_OBJVOC[753]=30446;
C_OBJVOC[754]=10335;
C_OBJVOC[755]=134;
C_OBJVOC[756]=31049;
C_OBJVOC[757]=5019;
C_OBJVOC[758]=134;
C_OBJVOC[759]=32042;
C_OBJVOC[760]=19400;
C_OBJVOC[761]=135;
C_OBJVOC[762]=26219;
C_OBJVOC[763]=32000;
C_OBJVOC[764]=136;
C_OBJVOC[765]=166;
C_OBJVOC[766]=167;
C_OBJVOC[767]=26219;
C_OBJVOC[768]=32760;
C_OBJVOC[769]=136;
C_OBJVOC[770]=4043;
C_OBJVOC[771]=17820;
C_OBJVOC[772]=137;
C_OBJVOC[773]=4851;
C_OBJVOC[774]=8000;
C_OBJVOC[775]=138;
C_OBJVOC[776]=139;
C_OBJVOC[777]=140;
C_OBJVOC[778]=141;
C_OBJVOC[779]=14529;
C_OBJVOC[780]=22680;
C_OBJVOC[781]=139;
C_OBJVOC[782]=140;
C_OBJVOC[783]=141;
C_OBJVOC[784]=29402;
C_OBJVOC[785]=24800;
C_OBJVOC[786]=142;
C_OBJVOC[787]=29402;
C_OBJVOC[788]=4200;
C_OBJVOC[789]=142;
C_OBJVOC[790]=6136;
C_OBJVOC[791]=24000;
C_OBJVOC[792]=142;
C_OBJVOC[793]=30084;
C_OBJVOC[794]=51200;
C_OBJVOC[795]=142;
C_OBJVOC[796]=25654;
C_OBJVOC[797]=8480;
C_OBJVOC[798]=159;
C_OBJVOC[799]=160;
C_OBJVOC[800]=161;
C_OBJVOC[801]=162;
C_OBJVOC[802]=163;
C_OBJVOC[803]=164;
C_OBJVOC[804]=213;
C_OBJVOC[805]=26212;
C_OBJVOC[806]=8000;
C_OBJVOC[807]=166;
C_OBJVOC[808]=167;
C_OBJVOC[809]=32081;
C_OBJVOC[810]=28800;
C_OBJVOC[811]=168;
C_OBJVOC[812]=33082;
C_OBJVOC[813]=2320;
C_OBJVOC[814]=168;
C_OBJVOC[815]=2338;
C_OBJVOC[816]=24920;
C_OBJVOC[817]=169;
C_OBJVOC[818]=26209;
C_OBJVOC[819]=23200;
C_OBJVOC[820]=169;
C_OBJVOC[821]=3401;
C_OBJVOC[822]=20800;
C_OBJVOC[823]=171;
C_OBJVOC[824]=6761;
C_OBJVOC[825]=19200;
C_OBJVOC[826]=177;
C_OBJVOC[827]=31254;
C_OBJVOC[828]=6761;
C_OBJVOC[829]=177;
C_OBJVOC[830]=49600;
C_OBJVOC[831]=0;
C_OBJVOC[832]=178;
C_OBJVOC[833]=24565;
C_OBJVOC[834]=0;
C_OBJVOC[835]=178;
C_OBJVOC[836]=51200;
C_OBJVOC[837]=0;
C_OBJVOC[838]=179;
C_OBJVOC[839]=32935;
C_OBJVOC[840]=0;
C_OBJVOC[841]=179;
C_OBJVOC[842]=52800;
C_OBJVOC[843]=0;
C_OBJVOC[844]=180;
C_OBJVOC[845]=32338;
C_OBJVOC[846]=8200;
C_OBJVOC[847]=180;
C_OBJVOC[848]=54400;
C_OBJVOC[849]=0;
C_OBJVOC[850]=181;
C_OBJVOC[851]=10221;
C_OBJVOC[852]=28800;
C_OBJVOC[853]=181;
C_OBJVOC[854]=56000;
C_OBJVOC[855]=0;
C_OBJVOC[856]=182;
C_OBJVOC[857]=9982;
C_OBJVOC[858]=8000;
C_OBJVOC[859]=182;
C_OBJVOC[860]=57600;
C_OBJVOC[861]=0;
C_OBJVOC[862]=183;
C_OBJVOC[863]=30784;
C_OBJVOC[864]=0;
C_OBJVOC[865]=183;
C_OBJVOC[866]=59200;
C_OBJVOC[867]=0;
C_OBJVOC[868]=184;
C_OBJVOC[869]=30622;
C_OBJVOC[870]=8560;
C_OBJVOC[871]=184;
C_OBJVOC[872]=60800;
C_OBJVOC[873]=0;
C_OBJVOC[874]=185;
C_OBJVOC[875]=8367;
C_OBJVOC[876]=13600;
C_OBJVOC[877]=185;
C_OBJVOC[878]=36858;
C_OBJVOC[879]=22774;
C_OBJVOC[880]=186;
C_OBJVOC[881]=30889;
C_OBJVOC[882]=32000;
C_OBJVOC[883]=187;
C_OBJVOC[884]=15200;
C_OBJVOC[885]=0;
C_OBJVOC[886]=192;
C_OBJVOC[887]=32321;
C_OBJVOC[888]=32000;
C_OBJVOC[889]=192;
C_OBJVOC[890]=32329;
C_OBJVOC[891]=30400;
C_OBJVOC[892]=192;
C_OBJVOC[893]=21000;
C_OBJVOC[894]=0;
C_OBJVOC[895]=193;
C_OBJVOC[896]=21819;
C_OBJVOC[897]=8486;
C_OBJVOC[898]=193;
C_OBJVOC[899]=5525;
C_OBJVOC[900]=32374;
C_OBJVOC[901]=193;
C_OBJVOC[902]=2092;
C_OBJVOC[903]=0;
C_OBJVOC[904]=194;
C_OBJVOC[905]=8885;
C_OBJVOC[906]=29820;
C_OBJVOC[907]=194;
C_OBJVOC[908]=32725;
C_OBJVOC[909]=2381;
C_OBJVOC[910]=195;
C_OBJVOC[911]=35252;
C_OBJVOC[912]=33642;
C_OBJVOC[913]=195;
C_OBJVOC[914]=30449;
C_OBJVOC[915]=19818;
C_OBJVOC[916]=196;
C_OBJVOC[917]=32205;
C_OBJVOC[918]=32320;
C_OBJVOC[919]=197;
C_OBJVOC[920]=11941;
C_OBJVOC[921]=8000;
C_OBJVOC[922]=199;
C_OBJVOC[923]=12854;
C_OBJVOC[924]=6400;
C_OBJVOC[925]=200;
C_OBJVOC[926]=12854;
C_OBJVOC[927]=7160;
C_OBJVOC[928]=200;
C_OBJVOC[929]=20054;
C_OBJVOC[930]=11960;
C_OBJVOC[931]=201;
C_OBJVOC[932]=1978;
C_OBJVOC[933]=0;
C_OBJVOC[934]=201;
C_OBJVOC[935]=2489;
C_OBJVOC[936]=2415;
C_OBJVOC[937]=202;
C_OBJVOC[938]=10105;
C_OBJVOC[939]=8720;
C_OBJVOC[940]=202;
C_OBJVOC[941]=32725;
C_OBJVOC[942]=8000;
C_OBJVOC[943]=144;
C_OBJVOC[944]=145;
C_OBJVOC[945]=204;
C_OBJVOC[946]=5289;
C_OBJVOC[947]=9840;
C_OBJVOC[948]=146;
C_OBJVOC[949]=147;
C_OBJVOC[950]=19404;
C_OBJVOC[951]=11400;
C_OBJVOC[952]=146;
C_OBJVOC[953]=147;
C_OBJVOC[954]=26218;
C_OBJVOC[955]=32721;
C_OBJVOC[956]=149;
C_OBJVOC[957]=31201;
C_OBJVOC[958]=5240;
C_OBJVOC[959]=148;
C_OBJVOC[960]=3572;
C_OBJVOC[961]=19960;
C_OBJVOC[962]=148;
C_OBJVOC[963]=35261;
C_OBJVOC[964]=20000;
C_OBJVOC[965]=150;
C_OBJVOC[966]=5642;
C_OBJVOC[967]=8000;
C_OBJVOC[968]=150;
C_OBJVOC[969]=19420;
C_OBJVOC[970]=32218;
C_OBJVOC[971]=67;
C_OBJVOC[972]=150;
C_OBJVOC[973]=5658;
C_OBJVOC[974]=32049;
C_OBJVOC[975]=151;
C_OBJVOC[976]=19567;
C_OBJVOC[977]=13600;
C_OBJVOC[978]=151;
C_OBJVOC[979]=22619;
C_OBJVOC[980]=32000;
C_OBJVOC[981]=153;
C_OBJVOC[982]=8287;
C_OBJVOC[983]=0;
C_OBJVOC[984]=154;
C_OBJVOC[985]=155;
C_OBJVOC[986]=3261;
C_OBJVOC[987]=3685;
C_OBJVOC[988]=156;
C_OBJVOC[989]=4854;
C_OBJVOC[990]=2345;
C_OBJVOC[991]=157;
C_OBJVOC[992]=158;
C_OBJVOC[993]=3578;
C_OBJVOC[994]=6400;
C_OBJVOC[995]=203;
C_OBJVOC[996]=31014;
C_OBJVOC[997]=11289;
C_OBJVOC[998]=203;
C_OBJVOC[999]=12041;
C_OBJVOC[1000]=28960;
C_OBJVOC[1001]=210;
C_OBJVOC[1002]=12041;
C_OBJVOC[1003]=28969;
C_OBJVOC[1004]=210;
C_OBJVOC[1005]=29419;
C_OBJVOC[1006]=8000;
C_OBJVOC[1007]=211;
C_OBJVOC[1008]=31218;
C_OBJVOC[1009]=33740;
C_OBJVOC[1010]=212;
C_OBJVOC[1011]=5121;
C_OBJVOC[1012]=22965;
C_OBJVOC[1013]=214;
C_OBJVOC[1014]=17805;
C_OBJVOC[1015]=25818;
C_OBJVOC[1016]=215;
C_OBJVOC[1017]=19244;
C_OBJVOC[1018]=6618;
C_OBJVOC[1019]=216;
C_OBJVOC[1020]=-1;
L_OAPPLI[18]=99;
L_RAPPL2[4]=38;
L_SVERBS[160]=39;
L_SVERBS[161]=64;
L_SVERBS[7]=4;
L_SVERBS[8]=5;
L_SVERBS[9]=3;
L_SVERBS[10]=304;
L_SVERBS[11]=305;
L_SVERBS[12]=306;
L_SVERBS[13]=307;
L_SVERBS[14]=308;
L_SVERBS[15]=309;
L_SVERBS[16]=310;
L_SVERBS[17]=311;
L_SVERBS[18]=312;
L_SVERBS[19]=313;
L_SVERBS[20]=5314;
L_SVERBS[21]=5319;
L_SVERBS[22]=324;
L_SVERBS[23]=325;
L_SVERBS[24]=883;
L_SVERBS[25]=884;
L_SVERBS[26]=120;
L_SVERBS[27]=120;
L_SVERBS[28]=0;
L_SVERBS[29]=0;
L_SVERBS[30]=0;
L_SVERBS[31]=0;
L_SVERBS[128]=0;
L_SVERBS[129]=6;
L_SVERBS[130]=1;
L_SVERBS[131]=6;
L_SVERBS[132]=2;
L_SVERBS[133]=5;
L_SVERBS[134]=3;
L_SVERBS[135]=5;
L_SVERBS[136]=4;
L_SVERBS[137]=3;
L_SVERBS[138]=4;
L_SVERBS[139]=6;
L_SVERBS[140]=4;
L_SVERBS[141]=6;
L_SVERBS[142]=4;
L_SVERBS[143]=5;
L_SVERBS[144]=5;
L_SVERBS[145]=5;
L_SVERBS[146]=5;
L_SVERBS[147]=4;
L_SVERBS[148]=5;
L_SVERBS[149]=6;
L_SVERBS[150]=6;
L_SVERBS[151]=10;
L_SVERBS[152]=7;
L_SVERBS[153]=4;
L_SVERBS[154]=7;
L_SVERBS[155]=6;
L_SVERBS[32]="T";
L_SVERBS[33]="E";
L_SVERBS[34]="M";
L_SVERBS[35]="P";
L_SVERBS[36]="L";
L_SVERBS[37]="E";
L_SVERBS[38]="F";
L_SVERBS[39]="O";
L_SVERBS[40]="R";
L_SVERBS[41]="E";
L_SVERBS[42]="S";
L_SVERBS[43]="T";
L_SVERBS[44]="3";
L_SVERBS[45]="0";
L_SVERBS[46]="0";
L_SVERBS[47]="0";
L_SVERBS[48]="3";
L_SVERBS[49]="F";
L_SVERBS[50]="L";
L_SVERBS[51]="A";
L_SVERBS[52]="S";
L_SVERBS[53]="K";
L_SVERBS[54]="R";
L_SVERBS[55]="U";
L_SVERBS[56]="B";
L_SVERBS[57]="F";
L_SVERBS[58]="O";
L_SVERBS[59]="N";
L_SVERBS[60]="D";
L_SVERBS[61]="L";
L_SVERBS[62]="E";
L_SVERBS[63]="C";
L_SVERBS[64]="A";
L_SVERBS[65]="R";
L_SVERBS[66]="R";
L_SVERBS[67]="E";
L_SVERBS[68]="S";
L_SVERBS[69]="T";
L_SVERBS[70]="O";
L_SVERBS[71]="U";
L_SVERBS[72]="C";
L_SVERBS[73]="H";
L_SVERBS[74]="B";
L_SVERBS[75]="O";
L_SVERBS[76]="N";
L_SVERBS[77]="E";
L_SVERBS[78]="S";
L_SVERBS[79]="B";
L_SVERBS[80]="O";
L_SVERBS[81]="D";
L_SVERBS[82]="Y";
L_SVERBS[83]="S";
L_SVERBS[84]="K";
L_SVERBS[85]="E";
L_SVERBS[86]="L";
L_SVERBS[87]="E";
L_SVERBS[88]="T";
L_SVERBS[89]="R";
L_SVERBS[90]="U";
L_SVERBS[91]="S";
L_SVERBS[92]="T";
L_SVERBS[93]="Y";
L_SVERBS[94]="K";
L_SVERBS[95]="N";
L_SVERBS[96]="I";
L_SVERBS[97]="F";
L_SVERBS[98]="E";
L_SVERBS[99]="N";
L_SVERBS[100]="O";
L_SVERBS[101]="N";
L_SVERBS[102]="E";
L_SVERBS[103]="N";
L_SVERBS[104]="O";
L_SVERBS[105]="W";
L_SVERBS[106]="H";
L_SVERBS[107]="E";
L_SVERBS[108]="R";
L_SVERBS[109]=" ";
L_VAPPLI[24]=39;
L_VAPPLI[25]=99;

/* dmain.f */
function* DUNGEO(){
if(INIT()){(yield* GAME());}
return;
}
/* actors.f */
function AAPPLI(RI,RI_){
var pc=0;L:for(;;)switch(pc){case 0:
if((RI[RI_]==0)){pc=10;continue L;}
L_AAPPLI[2]=1;
pc=[1000,2000][RI[RI_]-1];if(pc!==undefined)continue L;
BUG([11],0,RI,RI_);
case 10:
L_AAPPLI[2]=0;
return L_AAPPLI[2];
case 1000:
if(((C_PRSVEC[0]!=C_VINDEX[17])||(C_PRSVEC[2]!=C_OINDEX[73]))){pc=1200;continue L;}
C_CEVENT[C_CINDEX[13]+50]=0;
C_PLAY[0]=C_AINDEX[0];
L_AAPPLI[0]=MOVETO(C_RINDEX,47,C_PLAY,0);
NEWSTA(C_OINDEX,72,[567],0,C_RINDEX,47,[0],0,[0],0);
NEWSTA(C_OINDEX,84,[0],0,C_RINDEX,47,[0],0,[0],0);
C_ADVS[C_AINDEX[1]]=C_RINDEX[47];
C_FINDEX[1]=1;
C_OBJCTS[C_OINDEX[84]+880]=ZAND(C_OBJCTS,C_OINDEX[84]+880,[ZNOT(C_OFLAGS,6)],0);
C_OBJCTS[C_OINDEX[74]+880]=ZOR(C_OBJCTS,C_OINDEX[74]+880,C_OFLAGS,2);
return L_AAPPLI[2];
case 1200:
if(((C_PRSVEC[0]!=C_VINDEX[44])&&(C_PRSVEC[0]!=C_VINDEX[43]))){pc=1300;continue L;}
RSPEAK([568],0);
return L_AAPPLI[2];
case 1300:
if((C_PRSVEC[0]!=C_VINDEX[9])){pc=1400;continue L;}
RSPEAK([569],0);
return L_AAPPLI[2];
case 1400:
if(((((((((C_PRSVEC[0]==C_VINDEX[50])||(C_PRSVEC[0]==C_VINDEX[40]))||(C_PRSVEC[0]==C_VINDEX[53]))||(C_PRSVEC[0]==C_VINDEX[52]))||(C_PRSVEC[0]==C_VINDEX[20]))||(C_PRSVEC[0]==C_VINDEX[56]))||(C_PRSVEC[0]==C_VINDEX[24]))||(C_PRSVEC[0]==C_VINDEX[58]))){pc=10;continue L;}
RSPEAK([570],0);
return L_AAPPLI[2];
case 2000:
if((ZAND(C_OBJCTS,C_OINDEX[100]+1100,C_OFLAGS,28)!=0)){pc=2100;continue L;}
RSPEAK([783],0);
return L_AAPPLI[2];
case 2100:
if((C_PRSVEC[0]!=C_VINDEX[50])){pc=2200;continue L;}
L_AAPPLI[3]=784;
if((((C_PLAY[1]==C_RINDEX[77])&&((C_PRSVEC[2]==C_XSRCH[4])||(C_PRSVEC[2]==C_XSRCH[6])))||((C_PLAY[1]==C_RINDEX[78])&&((C_PRSVEC[2]==C_XSRCH[5])||(C_PRSVEC[2]==C_XSRCH[6]))))){L_AAPPLI[3]=785;}
RSPEAK(L_AAPPLI,3);
return L_AAPPLI[2];
case 2200:
if((((((((((((((C_PRSVEC[0]==C_VINDEX[40])||(C_PRSVEC[0]==C_VINDEX[53]))||(C_PRSVEC[0]==C_VINDEX[52]))||(C_PRSVEC[0]==C_VINDEX[56]))||(C_PRSVEC[0]==C_VINDEX[20]))||(C_PRSVEC[0]==C_VINDEX[24]))||(C_PRSVEC[0]==C_VINDEX[37]))||(C_PRSVEC[0]==C_VINDEX[69]))||(C_PRSVEC[0]==C_VINDEX[60]))||(C_PRSVEC[0]==C_VINDEX[59]))||(C_PRSVEC[0]==C_VINDEX[33]))||(C_PRSVEC[0]==C_VINDEX[34]))||(C_PRSVEC[0]==C_VINDEX[47]))){pc=10;continue L;}
RSPEAK([786],0);
return L_AAPPLI[2];
return L_AAPPLI[2];
}}
/* actors.f */
function THIEFD(){
function SF_THIEFD_QSTILL(R){return (QHERE(C_OINDEX,40,[R],0)||(C_OBJCTS[C_OINDEX[40]+2420]==(-C_OINDEX[39])))}
var pc=0;L:for(;;)switch(pc){case 0:
L_THIEFD[0]=((ZAND(C_DEBUG,1,[(L_THIEFD[7]+16384)],0)!=0))?1:0;
L_THIEFD[7]=16384;
L_THIEFD[1]=0;
case 1025:
L_THIEFD[8]=C_OBJCTS[C_OINDEX[39]+2200];
if((L_THIEFD[8]!=0)){C_HACK[0]=L_THIEFD[8];}
if((C_HACK[0]==C_PLAY[1])){pc=1100;continue L;}
if((C_HACK[0]!=C_RINDEX[26])){pc=1400;continue L;}
if((L_THIEFD[8]==0)){pc=1050;continue L;}
NEWSTA(C_OINDEX,39,[0],0,[0],0,[0],0,[0],0);
L_THIEFD[8]=0;
if(SF_THIEFD_QSTILL(C_RINDEX[26])){NEWSTA(C_OINDEX,40,[0],0,[0],0,C_OINDEX,39,[0],0);}
case 1050:
L_THIEFD[9]=ROBADV([(-C_OINDEX[39])],0,C_HACK,0,[0],0,[0],0);
if(QHERE(C_OINDEX,90,C_HACK,0)){C_OBJCTS[C_OINDEX[90]+1100]=ZOR(C_OBJCTS,C_OINDEX[90]+1100,C_OFLAGS,28);}
pc=1700;continue L;
case 1100:
if((C_HACK[0]==C_RINDEX[26])){pc=1700;continue L;}
if((ZAND(C_ROOMS,C_HACK[0]+801,C_RFLAG,1)!=0)){pc=1400;continue L;}
if(C_HACK[1]){pc=1300;continue L;}
if(((L_THIEFD[8]!=0)||PROB([70],0,[70],0))){pc=1150;continue L;}
if((C_OBJCTS[C_OINDEX[40]+2640]!=C_OINDEX[39])){pc=1700;continue L;}
NEWSTA(C_OINDEX,39,[583],0,C_HACK,0,[0],0,[0],0);
C_HACK[1]=1;
return;
case 1150:
if(((L_THIEFD[8]==0)||(ZAND(C_OBJCTS,C_OINDEX[39]+1100,C_OFLAGS,23)==0))){pc=1200;continue L;}
if(WINNIN(C_OINDEX,39,C_PLAY,0)){pc=1175;continue L;}
NEWSTA(C_OINDEX,39,[584],0,[0],0,[0],0,[0],0);
C_OBJCTS[C_OINDEX[39]+1100]=ZAND(C_OBJCTS,C_OINDEX[39]+1100,[ZNOT(C_OFLAGS,23)],0);
if(SF_THIEFD_QSTILL(C_HACK[0])){NEWSTA(C_OINDEX,40,[0],0,[0],0,C_OINDEX,39,[0],0);}
return;
case 1175:
if(PROB([90],0,[90],0)){pc=1700;continue L;}
case 1200:
if(((L_THIEFD[8]==0)||PROB([70],0,[70],0))){pc=1250;continue L;}
NEWSTA(C_OINDEX,39,[585],0,[0],0,[0],0,[0],0);
if(SF_THIEFD_QSTILL(C_HACK[0])){NEWSTA(C_OINDEX,40,[0],0,[0],0,C_OINDEX,39,[0],0);}
return;
case 1300:
if((L_THIEFD[8]==0)){pc=1700;continue L;}
case 1250:
if(PROB([70],0,[70],0)){return;}
C_HACK[1]=1;
L_THIEFD[10]=(ROBRM(C_HACK,0,[100],0,[0],0,[0],0,[(-C_OINDEX[39])],0)+ROBADV(C_PLAY,0,[0],0,[0],0,[(-C_OINDEX[39])],0));
L_THIEFD[9]=586;
if((L_THIEFD[8]!=0)){L_THIEFD[9]=588;}
if((L_THIEFD[10]!=0)){L_THIEFD[9]=(L_THIEFD[9]+1);}
NEWSTA(C_OINDEX,39,L_THIEFD,9,[0],0,[0],0,[0],0);
if(SF_THIEFD_QSTILL(C_HACK[0])){NEWSTA(C_OINDEX,40,[0],0,[0],0,C_OINDEX,39,[0],0);}
if(((L_THIEFD[10]!=0)&&(!LIT(C_HACK,0)))){RSPEAK([406],0);}
L_THIEFD[8]=0;
pc=1700;continue L;
case 1400:
NEWSTA(C_OINDEX,39,[0],0,[0],0,[0],0,[0],0);
L_THIEFD[8]=0;
if(SF_THIEFD_QSTILL(C_HACK[0])){NEWSTA(C_OINDEX,40,[0],0,[0],0,C_OINDEX,39,[0],0);}
if((ZAND(C_ROOMS,C_HACK[0]+801,C_RFLAG,0)==0)){pc=1700;continue L;}
L_THIEFD[9]=ROBRM(C_HACK,0,[75],0,[0],0,[0],0,[(-C_OINDEX[39])],0);
if(((((C_HACK[0]<C_RINDEX[4])||(C_HACK[0]>C_RINDEX[6]))||(C_PLAY[1]<C_RINDEX[4]))||(C_PLAY[1]>C_RINDEX[6]))){pc=1500;continue L;}
L_THIEFD[9]=1;L_THIEFD[11]=C_OBJCTS[0];
case 100001:
if(L_THIEFD[9]>L_THIEFD[11]){pc=100002;continue L;}
if((((!QHERE(L_THIEFD,9,C_HACK,0))||PROB([60],0,[60],0))||(ZAND(C_OBJCTS,L_THIEFD[9]+880,[(C_OFLAGS[0]+C_OFLAGS[2])],0)!=(C_OFLAGS[0]+C_OFLAGS[2])))){pc=1450;continue L;}
RSPSUB([590],0,C_OBJCTS,L_THIEFD[9]+220);
if(PROB([40],0,[20],0)){pc=1700;continue L;}
NEWSTA(L_THIEFD,9,[0],0,[0],0,[0],0,[(-C_OINDEX[39])],0);
C_OBJCTS[L_THIEFD[9]+1100]=ZOR(C_OBJCTS,L_THIEFD[9]+1100,C_OFLAGS,29);
pc=1700;continue L;
case 1450:
L_THIEFD[9]+=1;pc=100001;continue L;
case 100002:
pc=1700;continue L;
case 1500:
L_THIEFD[9]=1;L_THIEFD[12]=C_OBJCTS[0];
case 100003:
if(L_THIEFD[9]>L_THIEFD[12]){pc=100004;continue L;}
if(((((!QHERE(L_THIEFD,9,C_HACK,0))||(C_OBJCTS[L_THIEFD[9]+1540]!=0))||PROB([80],0,[60],0))||(ZAND(C_OBJCTS,L_THIEFD[9]+880,[(C_OFLAGS[0]+C_OFLAGS[2])],0)!=(C_OFLAGS[0]+C_OFLAGS[2])))){pc=1550;continue L;}
NEWSTA(L_THIEFD,9,[0],0,[0],0,[0],0,[(-C_OINDEX[39])],0);
C_OBJCTS[L_THIEFD[9]+1100]=ZOR(C_OBJCTS,L_THIEFD[9]+1100,C_OFLAGS,29);
pc=1700;continue L;
case 1550:
L_THIEFD[9]+=1;pc=100003;continue L;
case 100004:
case 1700:
if((C_OBJCTS[C_OINDEX[9]+2420]==(-C_OINDEX[39]))){C_FINDEX[6]=0;}
if(L_THIEFD[1]){pc=1800;continue L;}
L_THIEFD[1]=((!L_THIEFD[1]))?1:0;
case 1750:
C_HACK[0]=(C_HACK[0]-1);
if((C_HACK[0]<=0)){C_HACK[0]=C_ROOMS[0];}
if((ZAND(C_ROOMS,C_HACK[0]+801,[((C_RFLAG[2]+C_RFLAG[5])+C_RFLAG[11])],0)!=C_RFLAG[2])){pc=1750;continue L;}
C_HACK[1]=0;
pc=1025;continue L;
case 1800:
if((C_HACK[0]==C_RINDEX[26])){return;}
L_THIEFD[13]=591;
if((C_HACK[0]!=C_PLAY[1])){L_THIEFD[13]=0;}
L_THIEFD[9]=1;L_THIEFD[14]=C_OBJCTS[0];
case 100005:
if(L_THIEFD[9]>L_THIEFD[14]){pc=100006;continue L;}
if((((C_OBJCTS[L_THIEFD[9]+2420]!=(-C_OINDEX[39]))||PROB([70],0,[70],0))||(C_OBJCTS[L_THIEFD[9]+1540]>0))){pc=1850;continue L;}
NEWSTA(L_THIEFD,9,L_THIEFD,13,C_HACK,0,[0],0,[0],0);
L_THIEFD[13]=0;
case 1850:
L_THIEFD[9]+=1;pc=100005;continue L;
case 100006:
return;
return;
}}
/* ballop.f */
function BALLOP(ARG,ARG_){
var pc=0;L:for(;;)switch(pc){case 0:
L_BALLOP[2]=1;
if((ARG[ARG_]!=2)){pc=200;continue L;}
if((C_PRSVEC[0]!=C_VINDEX[27])){pc=10;continue L;}
if((C_FINDEX[47]!=0)){pc=50;continue L;}
RSPEAK([543],0);
pc=100;continue L;
case 50:
RSPSUB([544],0,C_OBJCTS,C_FINDEX[47]+220);
case 100:
if((C_FINDEX[46]!=0)){RSPEAK([545],0);}
return L_BALLOP[2];
case 200:
if((ARG[ARG_]!=1)){pc=500;continue L;}
if((C_PRSVEC[0]!=C_VINDEX[50])){pc=300;continue L;}
if(FINDXT(C_PRSVEC,2,C_PLAY,1)){pc=250;continue L;}
RSPEAK([546],0);
return L_BALLOP[2];
case 250:
if((C_FINDEX[46]==0)){pc=275;continue L;}
RSPEAK([547],0);
return L_BALLOP[2];
case 275:
if((C_CURXT[0]!=C_XPARS[9])){pc=10;continue L;}
if((ZAND(C_ROOMS,C_CURXT[1]+801,C_RFLAG,7)==0)){C_STATE[6]=C_CURXT[1];}
case 10:
L_BALLOP[2]=0;
return L_BALLOP[2];
case 300:
if(((C_PRSVEC[0]!=C_VINDEX[40])||(C_PRSVEC[2]!=C_FINDEX[47]))){pc=350;continue L;}
RSPSUB([548],0,C_OBJCTS,C_FINDEX[47]+220);
return L_BALLOP[2];
case 350:
if((((C_PRSVEC[0]!=C_VINDEX[52])||(C_PRSVEC[1]!=C_OINDEX[58]))||QEMPTY(C_OINDEX,58))){pc=10;continue L;}
RSPEAK([549],0);
return L_BALLOP[2];
case 500:
if(((C_PRSVEC[0]!=C_VINDEX[39])||(ZAND(C_ROOMS,C_PLAY[1]+801,C_RFLAG,2)==0))){pc=600;continue L;}
if((C_FINDEX[47]!=0)){C_CEVENT[C_CINDEX[5]]=3;}
pc=10;continue L;
case 600:
if(((C_PRSVEC[0]!=C_VINDEX[45])||(C_OBJCTS[C_PRSVEC[2]+2640]!=C_OINDEX[58]))){pc=700;continue L;}
RSPSUB([550],0,C_OBJCTS,C_PRSVEC[2]+220);
C_CEVENT[C_CINDEX[6]]=(Math.imul(C_OBJCTS[C_PRSVEC[2]+1760],20))|0;
C_OBJCTS[C_PRSVEC[2]+880]=ZAND([ZOR(C_OBJCTS,C_PRSVEC[2]+880,[((C_OFLAGS[15]+C_OFLAGS[12])+C_OFLAGS[9])],0)],0,[ZNOT([(C_OFLAGS[2]+C_OFLAGS[1])],0)],0);
if((C_FINDEX[47]!=0)){return L_BALLOP[2];}
if((!C_FINDEX[20])){NEWSTA(C_OINDEX,68,[0],0,[0],0,C_OINDEX,57,[0],0);}
C_FINDEX[20]=1;
C_FINDEX[47]=C_PRSVEC[2];
C_CEVENT[C_CINDEX[5]]=3;
RSPEAK([551],0);
return L_BALLOP[2];
case 700:
if((((C_PRSVEC[0]==C_VINDEX[39])&&(C_FINDEX[47]!=0))&&(ZAND(C_ROOMS,C_PLAY[1]+801,C_RFLAG,2)!=0))){C_CEVENT[C_CINDEX[5]]=3;}
pc=10;continue L;
return L_BALLOP[2];
}}
/* ballop.f */
function LIGHTP(OBJ,OBJ_){
function SF_LIGHTP_QON(R){return (ZAND(C_OBJCTS,R+880,C_OFLAGS,15)!=0)}
var pc=0;L:for(;;)switch(pc){case 0:
L_LIGHTP[1]=1;
L_LIGHTP[2]=((C_OFLAGS[12]+C_OFLAGS[9])+C_OFLAGS[15]);
if((OBJ[OBJ_]!=C_OINDEX[31])){pc=20000;continue L;}
if((C_FINDEX[54]!=0)){pc=19100;continue L;}
C_FINDEX[54]=1;
C_CEVENT[C_CINDEX[4]]=50;
case 19100:
if((C_PRSVEC[1]==C_OINDEX[31])){pc=10;continue L;}
if((C_PRSVEC[0]!=C_VINDEX[32])){pc=19200;continue L;}
L_LIGHTP[3]=513;
if(SF_LIGHTP_QON(C_OINDEX[31])){L_LIGHTP[3]=514;}
C_CEVENT[C_CINDEX[4]+50]=0;
C_OBJCTS[C_OINDEX[31]+880]=ZAND(C_OBJCTS,C_OINDEX[31]+880,[ZNOT(C_OFLAGS,15)],0);
RSPEAK(L_LIGHTP,3);
return L_LIGHTP[1];
case 19200:
if(((C_PRSVEC[0]!=C_VINDEX[45])&&(C_PRSVEC[0]!=C_VINDEX[31]))){pc=10;continue L;}
if((ZAND(C_OBJCTS,C_OINDEX[31]+880,C_OFLAGS,9)!=0)){pc=19300;continue L;}
RSPEAK([515],0);
return L_LIGHTP[1];
case 19300:
if((C_PRSVEC[1]!=0)){pc=19400;continue L;}
RSPEAK([516],0);
C_PRSVEC[3]=0;
return L_LIGHTP[1];
case 19400:
if(((C_PRSVEC[1]!=C_OINDEX[32])||(!SF_LIGHTP_QON(C_OINDEX[32])))){pc=19500;continue L;}
L_LIGHTP[3]=517;
if(SF_LIGHTP_QON(C_OINDEX[31])){L_LIGHTP[3]=518;}
C_OBJCTS[C_OINDEX[31]+880]=ZOR(C_OBJCTS,C_OINDEX[31]+880,C_OFLAGS,15);
C_CEVENT[C_CINDEX[4]+50]=1;
RSPEAK(L_LIGHTP,3);
return L_LIGHTP[1];
case 19500:
if(((C_PRSVEC[1]!=C_OINDEX[23])||(!SF_LIGHTP_QON(C_OINDEX[23])))){pc=19600;continue L;}
if(SF_LIGHTP_QON(C_OINDEX[31])){pc=19700;continue L;}
NEWSTA(C_OINDEX,31,[521],0,[0],0,[0],0,[0],0);
return L_LIGHTP[1];
case 19600:
RSPEAK([519],0);
return L_LIGHTP[1];
case 19700:
RSPEAK([520],0);
return L_LIGHTP[1];
case 20000:
if((OBJ[OBJ_]!=C_OINDEX[32])){BUG([6],0,OBJ,OBJ_);}
if(((C_PRSVEC[0]!=C_VINDEX[31])||(C_PRSVEC[2]!=C_OINDEX[32]))){pc=20500;continue L;}
if((C_FINDEX[55]!=0)){pc=20100;continue L;}
RSPEAK([183],0);
return L_LIGHTP[1];
case 20100:
C_FINDEX[55]=(C_FINDEX[55]-1);
C_OBJCTS[C_OINDEX[32]+880]=ZOR(C_OBJCTS,C_OINDEX[32]+880,L_LIGHTP,2);
C_CEVENT[C_CINDEX[3]]=2;
RSPEAK([184],0);
return L_LIGHTP[1];
case 20500:
if(((C_PRSVEC[0]!=C_VINDEX[32])||(ZAND(C_OBJCTS,C_OINDEX[32]+880,C_OFLAGS,15)==0))){pc=10;continue L;}
C_OBJCTS[C_OINDEX[32]+880]=ZAND(C_OBJCTS,C_OINDEX[32]+880,[ZNOT(L_LIGHTP,2)],0);
C_CEVENT[C_CINDEX[3]]=0;
RSPEAK([185],0);
return L_LIGHTP[1];
case 10:
L_LIGHTP[1]=0;
return L_LIGHTP[1];
return L_LIGHTP[1];
}}
/* clockr.f */
function* CEVAPP(RI,RI_){
function SF_CEVAPP_QOPEN(R){return (ZAND(C_OBJCTS,R+1100,C_OFLAGS,28)!=0)}
function SF_CEVAPP_QLEDGE(R){return ((((R==C_RINDEX[43])||(R==C_RINDEX[44]))||(R==C_RINDEX[45]))||(R==C_RINDEX[38]))}
function SF_CEVAPP_QVAIR(R){return ((((R==C_RINDEX[39])||(R==C_RINDEX[40]))||(R==C_RINDEX[41]))||(R==C_RINDEX[42]))}
var pc=0;L:for(;;)switch(pc){case 0:
if((RI[RI_]==0)){return;}
pc=[1000,2000,3000,4000,5000,6000,7000,8000,9000,10000,11000,12000,13000,14000,15000,16000,17000,18000,19000,20000,21000,22000,23000,24000][RI[RI_]-1];if(pc!==undefined)continue L;
BUG([3],0,RI,RI_);
case 1000:
C_ADVS[C_AINDEX[0]+20]=Math.min(0,(C_ADVS[C_AINDEX[0]+20]+1));
if((C_ADVS[C_AINDEX[0]+20]>=0)){return;}
C_CEVENT[C_CINDEX[0]]=30;
return;
case 2000:
if((C_PLAY[1]==C_RINDEX[24])){RSPEAK([(71+DIV(C_FINDEX[48],2))],0);}
C_FINDEX[48]=(C_FINDEX[48]+1);
if((C_FINDEX[48]<=16)){return;}
C_CEVENT[C_CINDEX[1]]=0;
C_ROOMS[C_RINDEX[24]+801]=ZOR(C_ROOMS,C_RINDEX[24]+801,C_RFLAG,7);
C_ROOMS[C_RINDEX[24]+601]=80;
if((C_PLAY[1]==C_RINDEX[24])){(yield* JIGSUP([81],0));}
return;
case 3000:
LITINT(C_OINDEX,12,C_FINDEX,56,C_CINDEX,2,L_CEVAPP,10,[12],0);
return;
case 4000:
RSPEAK([153],0);
C_OBJCTS[C_OINDEX[32]+880]=ZAND(C_OBJCTS,C_OINDEX[32]+880,[ZNOT(C_OFLAGS,15)],0);
return;
case 5000:
LITINT(C_OINDEX,31,C_FINDEX,54,C_CINDEX,4,L_CEVAPP,0,[10],0);
return;
case 6000:
C_CEVENT[C_CINDEX[5]]=3;
L_CEVAPP[27]=((C_ADVS[C_PLAY[0]+8]==C_OINDEX[57]))?1:0;
if((C_STATE[6]==C_RINDEX[38])){pc=6800;continue L;}
if(SF_CEVAPP_QLEDGE(C_STATE[6])){pc=6700;continue L;}
if((SF_CEVAPP_QOPEN(C_OINDEX[58])&&(C_FINDEX[47]!=0))){pc=6500;continue L;}
if((C_STATE[6]!=C_RINDEX[39])){pc=6300;continue L;}
C_STATE[6]=C_RINDEX[38];
NEWSTA(C_OINDEX,57,[0],0,C_STATE,6,[0],0,[0],0);
if(L_CEVAPP[27]){pc=6200;continue L;}
if(SF_CEVAPP_QLEDGE(C_PLAY[1])){RSPEAK([530],0);}
return;
case 6200:
L_CEVAPP[27]=MOVETO(C_STATE,6,C_PLAY,0);
if((C_FINDEX[47]==0)){pc=6250;continue L;}
RSPEAK([531],0);
L_CEVAPP[27]=(yield* RMDESC([0],0));
return;
case 6250:
NEWSTA(C_OINDEX,57,[532],0,[0],0,[0],0,[0],0);
NEWSTA(C_OINDEX,69,[0],0,C_STATE,6,[0],0,[0],0);
C_ADVS[C_PLAY[0]+8]=0;
C_CEVENT[C_CINDEX[5]+50]=0;
C_CEVENT[C_CINDEX[6]+50]=0;
C_FINDEX[47]=0;
C_FINDEX[46]=0;
return;
case 6300:
C_STATE[6]=(C_STATE[6]-1);
NEWSTA(C_OINDEX,57,[0],0,C_STATE,6,[0],0,[0],0);
if(L_CEVAPP[27]){pc=6400;continue L;}
if(SF_CEVAPP_QLEDGE(C_PLAY[1])){RSPEAK([533],0);}
return;
case 6400:
L_CEVAPP[27]=MOVETO(C_STATE,6,C_PLAY,0);
RSPEAK([534],0);
L_CEVAPP[27]=(yield* RMDESC([0],0));
return;
case 6500:
if((C_STATE[6]!=C_RINDEX[42])){pc=6600;continue L;}
C_CEVENT[C_CINDEX[6]]=0;
C_CEVENT[C_CINDEX[5]]=0;
C_FINDEX[47]=0;
C_FINDEX[46]=0;
C_STATE[6]=C_RINDEX[38];
NEWSTA(C_OINDEX,57,[0],0,[0],0,[0],0,[0],0);
NEWSTA(C_OINDEX,69,[0],0,C_STATE,6,[0],0,[0],0);
if(L_CEVAPP[27]){pc=6550;continue L;}
if(SF_CEVAPP_QLEDGE(C_PLAY[1])){RSPEAK([535],0);}
return;
case 6550:
(yield* JIGSUP([536],0));
return;
case 6600:
C_STATE[6]=(C_STATE[6]+1);
NEWSTA(C_OINDEX,57,[0],0,C_STATE,6,[0],0,[0],0);
if(L_CEVAPP[27]){pc=6650;continue L;}
if(SF_CEVAPP_QLEDGE(C_PLAY[1])){RSPEAK([537],0);}
return;
case 6650:
L_CEVAPP[27]=MOVETO(C_STATE,6,C_PLAY,0);
RSPEAK([538],0);
L_CEVAPP[27]=(yield* RMDESC([0],0));
return;
case 6700:
C_STATE[6]=(C_STATE[6]+(C_RINDEX[40]-C_RINDEX[43]));
NEWSTA(C_OINDEX,57,[0],0,C_STATE,6,[0],0,[0],0);
if(L_CEVAPP[27]){pc=6750;continue L;}
if(SF_CEVAPP_QLEDGE(C_PLAY[1])){RSPEAK([539],0);}
C_CEVENT[C_CINDEX[10]]=10;
return;
case 6750:
L_CEVAPP[27]=MOVETO(C_STATE,6,C_PLAY,0);
RSPEAK([540],0);
L_CEVAPP[27]=(yield* RMDESC([0],0));
return;
case 6800:
if(((C_FINDEX[47]==0)||(!SF_CEVAPP_QOPEN(C_OINDEX[58])))){return;}
C_STATE[6]=C_RINDEX[39];
NEWSTA(C_OINDEX,57,[0],0,C_STATE,6,[0],0,[0],0);
if(L_CEVAPP[27]){pc=6850;continue L;}
if(SF_CEVAPP_QLEDGE(C_PLAY[1])){RSPEAK([541],0);}
return;
case 6850:
L_CEVAPP[27]=MOVETO(C_STATE,6,C_PLAY,0);
RSPEAK([542],0);
L_CEVAPP[27]=(yield* RMDESC([0],0));
return;
case 7000:
L_CEVAPP[32]=1;L_CEVAPP[33]=C_OBJCTS[0];
case 100001:
if(L_CEVAPP[32]>L_CEVAPP[33]){pc=100002;continue L;}
if(((C_OINDEX[58]==C_OBJCTS[L_CEVAPP[32]+2640])&&(ZAND(C_OBJCTS,L_CEVAPP[32]+880,C_OFLAGS,12)!=0))){pc=7200;continue L;}
case 7100:
L_CEVAPP[32]+=1;pc=100001;continue L;
case 100002:
BUG([4],0,[0],0);
case 7200:
NEWSTA(L_CEVAPP,32,[0],0,[0],0,[0],0,[0],0);
C_FINDEX[47]=0;
if((C_PLAY[1]==C_STATE[6])){RSPSUB([292],0,C_OBJCTS,L_CEVAPP[32]+220);}
return;
case 8000:
if((C_OBJCTS[C_OINDEX[66]+2640]!=C_OINDEX[65])){pc=8500;continue L;}
L_CEVAPP[34]=C_OBJCTS[C_OINDEX[65]+2200];
L_CEVAPP[35]=C_OBJCTS[C_OINDEX[65]+2640];
if(((L_CEVAPP[34]==0)&&(L_CEVAPP[35]!=0))){L_CEVAPP[34]=C_OBJCTS[L_CEVAPP[35]+2200];}
NEWSTA(C_OINDEX,66,[0],0,[0],0,[0],0,[0],0);
NEWSTA(C_OINDEX,65,[0],0,[0],0,[0],0,[0],0);
if(((L_CEVAPP[34]!=0)&&(L_CEVAPP[34]!=C_PLAY[1]))){pc=8100;continue L;}
C_ROOMS[C_PLAY[1]+801]=ZOR(C_ROOMS,C_PLAY[1]+801,C_RFLAG,7);
C_ROOMS[C_PLAY[1]+601]=114;
(yield* JIGSUP([150],0));
return;
case 8100:
RSPEAK([151],0);
C_STATE[7]=L_CEVAPP[34];
C_CEVENT[C_CINDEX[9]]=5;
if((L_CEVAPP[34]!=C_RINDEX[46])){pc=8200;continue L;}
if((L_CEVAPP[35]!=C_OINDEX[64])){return;}
NEWSTA(C_OINDEX,64,[0],0,[0],0,[0],0,[0],0);
C_OBJCTS[C_OINDEX[63]+1100]=ZOR(C_OBJCTS,C_OINDEX[63]+1100,C_OFLAGS,28);
C_FINDEX[14]=1;
return;
case 8200:
L_CEVAPP[32]=1;L_CEVAPP[36]=C_OBJCTS[0];
case 100003:
if(L_CEVAPP[32]>L_CEVAPP[36]){pc=100004;continue L;}
if((QHERE(L_CEVAPP,32,L_CEVAPP,34)&&(ZAND(C_OBJCTS,L_CEVAPP[32]+880,C_OFLAGS,2)!=0))){NEWSTA(L_CEVAPP,32,[0],0,[0],0,[0],0,[0],0);}
case 8250:
L_CEVAPP[32]+=1;pc=100003;continue L;
case 100004:
if((L_CEVAPP[34]!=C_RINDEX[1])){return;}
L_CEVAPP[32]=1;L_CEVAPP[37]=C_OBJCTS[0];
case 100005:
if(L_CEVAPP[32]>L_CEVAPP[37]){pc=100006;continue L;}
if((C_OBJCTS[L_CEVAPP[32]+2640]==C_OINDEX[6])){NEWSTA(L_CEVAPP,32,[0],0,[0],0,[0],0,[0],0);}
case 8300:
L_CEVAPP[32]+=1;pc=100005;continue L;
case 100006:
return;
case 8500:
if((QHERE(C_OINDEX,66,C_PLAY,1)||(C_OBJCTS[C_OINDEX[66]+2420]==C_PLAY[0]))){RSPEAK([152],0);}
NEWSTA(C_OINDEX,66,[0],0,[0],0,[0],0,[0],0);
return;
case 9000:
C_ROOMS[C_RINDEX[45]+801]=ZOR(C_ROOMS,C_RINDEX[45]+801,C_RFLAG,7);
C_ROOMS[C_RINDEX[45]+601]=109;
if((C_PLAY[1]==C_RINDEX[45])){pc=9100;continue L;}
RSPEAK([110],0);
return;
case 9100:
if((C_ADVS[C_PLAY[0]+8]!=0)){pc=9200;continue L;}
(yield* JIGSUP([111],0));
return;
case 9200:
if((C_FINDEX[46]!=0)){pc=9300;continue L;}
RSPEAK([112],0);
return;
case 9300:
C_STATE[6]=C_RINDEX[38];
NEWSTA(C_OINDEX,57,[0],0,[0],0,[0],0,[0],0);
NEWSTA(C_OINDEX,69,[0],0,C_STATE,6,[0],0,[0],0);
C_FINDEX[46]=0;
C_FINDEX[47]=0;
C_CEVENT[C_CINDEX[5]+50]=0;
C_CEVENT[C_CINDEX[6]+50]=0;
(yield* JIGSUP([113],0));
return;
case 10000:
C_ROOMS[C_STATE[7]+801]=ZOR(C_ROOMS,C_STATE[7]+801,C_RFLAG,7);
C_ROOMS[C_STATE[7]+601]=114;
if((C_PLAY[1]==C_STATE[7])){pc=10100;continue L;}
RSPEAK([115],0);
if((C_STATE[7]==C_RINDEX[46])){C_CEVENT[C_CINDEX[8]]=8;}
return;
case 10100:
L_CEVAPP[32]=116;
if((ZAND(C_ROOMS,C_PLAY[1]+801,C_RFLAG,9)!=0)){L_CEVAPP[32]=117;}
(yield* JIGSUP(L_CEVAPP,32));
return;
case 11000:
if(SF_CEVAPP_QLEDGE(C_PLAY[1])){pc=11100;continue L;}
C_CEVENT[C_CINDEX[10]]=1;
return;
case 11100:
NEWSTA(C_OINDEX,67,[118],0,C_PLAY,1,[0],0,[0],0);
return;
case 12000:
NEWSTA(C_OINDEX,67,[149],0,[0],0,[0],0,[0],0);
return;
case 13000:
if((C_OBJCTS[C_OINDEX[8]+2640]==C_OINDEX[79])){NEWSTA(C_OINDEX,8,[0],0,[0],0,[0],0,[0],0);}
return;
case 14000:
C_ROOMS[C_RINDEX[47]+801]=ZOR(C_ROOMS,C_RINDEX[47]+801,C_RFLAG,7);
C_ROOMS[C_RINDEX[47]+601]=147;
(yield* JIGSUP([148],0));
return;
case 15000:
C_FINDEX[32]=1;
RSPEAK([119],0);
return;
case 16000:
C_CEVENT[C_CINDEX[15]+50]=(((C_PLAY[1]==C_RINDEX[54])||((C_PLAY[1]>=C_RINDEX[7])&&(C_PLAY[1]<C_RINDEX[9]))))?1:0;
if((C_CEVENT[C_CINDEX[15]+50]&&PROB([10],0,[10],0))){RSPEAK([635],0);}
return;
case 17000:
if((C_PLAY[1]==C_RINDEX[57])){C_CEVENT[C_CINDEX[17]+50]=1;}
if((C_PLAY[1]==C_RINDEX[58])){(yield* JIGSUP([636],0));}
return;
case 18000:
C_CEVENT[C_CINDEX[18]+50]=1;
NEWSTA(C_OINDEX,89,[0],0,C_RINDEX,57,[0],0,[0],0);
if((C_PLAY[1]==C_RINDEX[57])){RSPEAK([637],0);}
return;
case 19000:
NEWSTA(C_OINDEX,89,[0],0,[0],0,[0],0,[0],0);
if((C_PLAY[1]==C_RINDEX[57])){RSPEAK([638],0);}
return;
case 20000:
if(C_FINDEX[43]){pc=20200;continue L;}
if((C_PLAY[1]!=C_RINDEX[60])){return;}
if((!LIT(C_PLAY,1))){pc=20100;continue L;}
C_CEVENT[C_CINDEX[19]]=3;
return;
case 20100:
RSPEAK([727],0);
case 20200:
L_CEVAPP[32]=1;L_CEVAPP[38]=C_OBJCTS[0];
case 100007:
if(L_CEVAPP[32]>L_CEVAPP[38]){pc=100008;continue L;}
NEWSTA(L_CEVAPP,32,[0],0,C_OBJCTS,L_CEVAPP[32]+2200,C_OBJCTS,L_CEVAPP[32]+2640,[0],0);
case 20300:
L_CEVAPP[32]+=1;pc=100007;continue L;
case 100008:
NEWSTA(C_OINDEX,12,[0],0,[0],0,[0],0,C_AINDEX,0);
NEWSTA(C_OINDEX,11,[0],0,[0],0,[0],0,C_AINDEX,0);
C_OBJCTS[C_OINDEX[12]+880]=ZAND([ZOR(C_OBJCTS,C_OINDEX[12]+880,C_OFLAGS,9)],0,[ZNOT(C_OFLAGS,15)],0);
C_OBJCTS[C_OINDEX[12]+1100]=ZOR(C_OBJCTS,C_OINDEX[12]+1100,C_OFLAGS,29);
C_CEVENT[C_CINDEX[2]+50]=0;
C_CEVENT[C_CINDEX[2]]=350;
C_FINDEX[56]=0;
C_OBJCTS[C_OINDEX[11]+1100]=ZOR(C_OBJCTS,C_OINDEX[11]+1100,C_OFLAGS,29);
C_HACK[3]=1;
C_HACK[4]=0;
C_HACK[2]=0;
C_FINDEX[32]=1;
C_CEVENT[C_CINDEX[3]+50]=0;
C_CEVENT[C_CINDEX[4]+50]=0;
SCRUPD(C_ROOMS,C_RINDEX[60]+601);
C_ROOMS[C_RINDEX[60]+601]=0;
L_CEVAPP[27]=MOVETO(C_RINDEX,61,C_PLAY,0);
L_CEVAPP[27]=(yield* RMDESC([3],0));
return;
case 21000:
C_FINDEX[36]=0;
C_FINDEX[37]=0;
if((C_PLAY[1]==C_RINDEX[62])){RSPEAK([728],0);}
if(((C_PLAY[1]==C_RINDEX[76])||(MRHERE(C_PLAY,1)==1))){RSPEAK([729],0);}
return;
case 22000:
if(C_FINDEX[38]){RSPEAK([730],0);}
C_FINDEX[38]=0;
return;
case 23000:
if((C_ADVS[C_AINDEX[0]]!=C_RINDEX[69])){return;}
RSPEAK([769],0);
RSPEAK([(770+C_FINDEX[60])],0);
C_CEVENT[C_CINDEX[22]]=2;
return;
case 24000:
if((C_ADVS[C_AINDEX[2]]==C_PLAY[1])){return;}
if(((C_PLAY[1]!=C_RINDEX[80])&&(C_PLAY[1]!=C_RINDEX[81]))){pc=24100;continue L;}
if(C_FINDEX[42]){RSPEAK([811],0);}
C_FINDEX[42]=0;
return;
case 24100:
C_FINDEX[42]=1;
L_CEVAPP[32]=812;
L_CEVAPP[39]=C_XSRCH[0];L_CEVAPP[40]=C_XSRCH[1];
case 100009:
if(L_CEVAPP[39]>L_CEVAPP[40]){pc=100010;continue L;}
if((FINDXT(L_CEVAPP,39,C_ADVS,C_AINDEX[2])&&(C_CURXT[1]==C_PLAY[1]))){L_CEVAPP[32]=813;}
case 24200:
L_CEVAPP[39]+=C_XSRCH[0];pc=100009;continue L;
case 100010:
RSPEAK(L_CEVAPP,32);
NEWSTA(C_OINDEX,120,[0],0,C_PLAY,1,[0],0,[0],0);
C_ADVS[C_AINDEX[2]]=C_PLAY[1];
return;
return;
}}
/* clockr.f */
function LITINT(OBJ,OBJ_,CTR,CTR_,CEV,CEV_,TICKS,TICKS_,TICKLN,TICKLN_){
var pc=0;L:for(;;)switch(pc){case 0:
CTR[CTR_]=(CTR[CTR_]+1);
C_CEVENT[CEV[CEV_]]=TICKS[TICKS_+CTR[CTR_]-1];
if((C_CEVENT[CEV[CEV_]]!=0)){pc=100;continue L;}
C_OBJCTS[OBJ[OBJ_]+880]=ZAND(C_OBJCTS,OBJ[OBJ_]+880,[ZNOT([((C_OFLAGS[9]+C_OFLAGS[12])+C_OFLAGS[15])],0)],0);
if(((C_OBJCTS[OBJ[OBJ_]+2200]==C_PLAY[1])||(C_OBJCTS[OBJ[OBJ_]+2420]==C_PLAY[0]))){RSPSUB([293],0,C_OBJCTS,OBJ[OBJ_]+220);}
return;
case 100:
if(((C_OBJCTS[OBJ[OBJ_]+2200]==C_PLAY[1])||(C_OBJCTS[OBJ[OBJ_]+2420]==C_PLAY[0]))){RSPEAK(TICKS,TICKS_+(CTR[CTR_]+DIV(TICKLN[TICKLN_],2))-1);}
return;
return;
}}
/* demons.f */
function* FIGHTD(){
var pc=0;L:for(;;)switch(pc){case 0:
L_FIGHTD[3]=1;L_FIGHTD[4]=C_VILL[0];
case 100001:
if(L_FIGHTD[3]>L_FIGHTD[4]){pc=100002;continue L;}
C_VILL[L_FIGHTD[3]+8]=0;
L_FIGHTD[5]=C_VILL[L_FIGHTD[3]];
L_FIGHTD[6]=C_OBJCTS[L_FIGHTD[5]+660];
if((C_PLAY[1]!=C_OBJCTS[L_FIGHTD[5]+2200])){pc=2200;continue L;}
if(((L_FIGHTD[5]==C_OINDEX[39])&&C_FINDEX[34])){pc=2400;continue L;}
if((C_OBJCTS[L_FIGHTD[5]+1980]>=0)){pc=2050;continue L;}
if(((C_VILL[L_FIGHTD[3]+4]==0)||(!PROB(C_VILL,L_FIGHTD[3]+4,C_VILL,L_FIGHTD[3]+4)))){pc=2025;continue L;}
C_OBJCTS[L_FIGHTD[5]+1980]=Math.abs(C_OBJCTS[L_FIGHTD[5]+1980]);
C_VILL[L_FIGHTD[3]+4]=0;
if((L_FIGHTD[6]==0)){pc=2400;continue L;}
C_PRSVEC[0]=C_VINDEX[3];
L_FIGHTD[2]=(yield* OAPPLI(L_FIGHTD,6,[0],0));
pc=2400;continue L;
case 2025:
C_VILL[L_FIGHTD[3]+4]=(C_VILL[L_FIGHTD[3]+4]+10);
pc=2400;continue L;
case 2050:
if((ZAND(C_OBJCTS,L_FIGHTD[5]+1100,C_OFLAGS,23)==0)){pc=2100;continue L;}
C_VILL[L_FIGHTD[3]+8]=L_FIGHTD[5];
pc=2400;continue L;
case 2100:
if((L_FIGHTD[6]==0)){pc=2400;continue L;}
C_PRSVEC[0]=C_VINDEX[2];
if((!(yield* OAPPLI(L_FIGHTD,6,[0],0)))){pc=2400;continue L;}
C_OBJCTS[L_FIGHTD[5]+1100]=ZOR(C_OBJCTS,L_FIGHTD[5]+1100,C_OFLAGS,23);
C_VILL[L_FIGHTD[3]+8]=L_FIGHTD[5];
pc=2400;continue L;
case 2200:
if(((ZAND(C_OBJCTS,L_FIGHTD[5]+1100,C_OFLAGS,23)==0)||(L_FIGHTD[6]==0))){pc=2300;continue L;}
C_PRSVEC[0]=C_VINDEX[6];
L_FIGHTD[2]=(yield* OAPPLI(L_FIGHTD,6,[0],0));
case 2300:
if((L_FIGHTD[5]==C_OINDEX[39])){C_FINDEX[34]=0;}
C_ADVS[C_AINDEX[0]+24]=ZAND(C_ADVS,C_AINDEX[0]+24,[(~C_AFLAGS[0])],0);
C_OBJCTS[L_FIGHTD[5]+1100]=ZAND(C_OBJCTS,L_FIGHTD[5]+1100,[(~(C_OFLAGS[25]+C_OFLAGS[23]))],0);
if(((C_OBJCTS[L_FIGHTD[5]+1980]>=0)||(L_FIGHTD[6]==0))){pc=2400;continue L;}
C_PRSVEC[0]=C_VINDEX[3];
L_FIGHTD[2]=(yield* OAPPLI(L_FIGHTD,6,[0],0));
C_OBJCTS[L_FIGHTD[5]+1980]=Math.abs(C_OBJCTS[L_FIGHTD[5]+1980]);
case 2400:
L_FIGHTD[3]+=1;pc=100001;continue L;
case 100002:
L_FIGHTD[7]=0;
case 2600:
L_FIGHTD[3]=1;L_FIGHTD[8]=C_VILL[0];
case 100003:
if(L_FIGHTD[3]>L_FIGHTD[8]){pc=100004;continue L;}
L_FIGHTD[9]=C_VILL[L_FIGHTD[3]+8];
if((L_FIGHTD[9]==0)){pc=2700;continue L;}
C_PRSVEC[4]=1;
L_FIGHTD[6]=C_OBJCTS[L_FIGHTD[9]+660];
if((L_FIGHTD[6]==0)){pc=2650;continue L;}
C_PRSVEC[0]=C_VINDEX[6];
if((yield* OAPPLI(L_FIGHTD,6,[0],0))){pc=2700;continue L;}
case 2650:
L_FIGHTD[10]=(yield* BLOW(C_AINDEX,0,L_FIGHTD,9,C_VILL,L_FIGHTD[3]+16,[0],0,L_FIGHTD,7));
if((L_FIGHTD[10]<0)){return;}
if((L_FIGHTD[10]==L_FIGHTD[11])){L_FIGHTD[7]=(2+ZRND([3],0));}
case 2700:
L_FIGHTD[3]+=1;pc=100003;continue L;
case 100004:
L_FIGHTD[7]=(L_FIGHTD[7]-1);
if((L_FIGHTD[7]>0)){pc=2600;continue L;}
return;
return;
}}
/* demons.f */
function* BLOW(H,H_,V,V_,RMK,RMK_,HFLG,HFLG_,OUT,OUT_){
var pc=0;L:for(;;)switch(pc){case 0:
L_BLOW[127]=C_OBJCTS[V[V_]+660];
L_BLOW[128]=C_OBJCTS[V[V_]+220];
L_BLOW[126]=L_BLOW[129];
if((!HFLG[HFLG_])){pc=1000;continue L;}
L_BLOW[130]=10;
C_OBJCTS[V[V_]+1100]=ZOR(C_OBJCTS,V[V_]+1100,C_OFLAGS,23);
if((ZAND(C_ADVS,H[H_]+24,C_AFLAGS,0)==0)){pc=100;continue L;}
RSPEAK([591],0);
C_ADVS[H[H_]+24]=ZAND(C_ADVS,H[H_]+24,[(~C_AFLAGS[0])],0);
return L_BLOW[126];
case 100:
L_BLOW[131]=FIGHTS(H,H_,[1],0);
L_BLOW[132]=L_BLOW[131];
L_BLOW[133]=VILSTR(V,V_);
L_BLOW[134]=L_BLOW[133];
L_BLOW[135]=0;
L_BLOW[136]=1;L_BLOW[137]=C_OBJCTS[0];
case 100001:
if(L_BLOW[136]>L_BLOW[137]){pc=100002;continue L;}
if(((C_OBJCTS[L_BLOW[136]+2640]==V[V_])&&(ZAND(C_OBJCTS,L_BLOW[136]+1100,C_OFLAGS,22)!=0))){L_BLOW[135]=L_BLOW[136];}
case 200:
L_BLOW[136]+=1;pc=100001;continue L;
case 100002:
if((V[V_]==C_ADVS[C_AINDEX[0]+12])){pc=300;continue L;}
if((L_BLOW[133]!=0)){pc=2000;continue L;}
RSPSUB([592],0,L_BLOW,128);
return L_BLOW[126];
case 300:
(yield* JIGSUP([593],0));
return L_BLOW[126];
case 1000:
L_BLOW[130]=50;
C_ADVS[H[H_]+24]=ZAND(C_ADVS,H[H_]+24,[(~C_AFLAGS[0])],0);
if((ZAND(C_OBJCTS,V[V_]+1100,C_OFLAGS,25)==0)){pc=1200;continue L;}
C_OBJCTS[V[V_]+1100]=ZAND(C_OBJCTS,V[V_]+1100,[(~C_OFLAGS[25])],0);
RSPSUB([594],0,L_BLOW,128);
return L_BLOW[126];
case 1200:
L_BLOW[131]=VILSTR(V,V_);
L_BLOW[132]=L_BLOW[131];
L_BLOW[133]=FIGHTS(H,H_,[1],0);
if((L_BLOW[133]<=0)){return L_BLOW[126];}
L_BLOW[134]=FIGHTS(H,H_,[0],0);
L_BLOW[135]=Math.abs(FWIM([0],0,C_OFLAGS,22,[0],0,[0],0,H,H_,[1],0));
case 2000:
if((L_BLOW[133]>0)){pc=2100;continue L;}
L_BLOW[138]=L_BLOW[139];
if(HFLG[HFLG_]){RSPSUB([595],0,L_BLOW,128);}
pc=3000;continue L;
case 2100:
if((L_BLOW[133]-2)<0){pc=2200;continue L;}if((L_BLOW[133]-2)==0){pc=2300;continue L;}pc=2400;continue L;
case 2200:
L_BLOW[131]=Math.min(L_BLOW[131],3);
L_BLOW[140]=L_BLOW[L_BLOW[131]+2];
pc=2500;continue L;
case 2300:
L_BLOW[131]=Math.min(L_BLOW[131],4);
L_BLOW[140]=L_BLOW[L_BLOW[131]+5];
pc=2500;continue L;
case 2400:
L_BLOW[131]=(L_BLOW[131]-L_BLOW[133]);
L_BLOW[131]=(Math.min(2,Math.max((-2),L_BLOW[131]))+3);
L_BLOW[140]=L_BLOW[L_BLOW[131]+9];
case 2500:
L_BLOW[138]=L_BLOW[(L_BLOW[140]+ZRND([10],0))+14];
if((OUT[OUT_]==0)){pc=2600;continue L;}
if((L_BLOW[138]==L_BLOW[141])){pc=2550;continue L;}
L_BLOW[138]=L_BLOW[142];
pc=2600;continue L;
case 2550:
L_BLOW[138]=L_BLOW[143];
case 2600:
if((((L_BLOW[138]==L_BLOW[141])&&(L_BLOW[135]!=0))&&PROB([25],0,L_BLOW,130))){L_BLOW[138]=L_BLOW[144];}
L_BLOW[145]=(L_BLOW[((Math.imul((RMK[RMK_]-1),9)+L_BLOW[138])+1)+80])|0;
if((L_BLOW[145]==0)){pc=3000;continue L;}
L_BLOW[136]=((((L_BLOW[145]%1000)+ZRND([DIV(L_BLOW[145],1000)],0))+C_STAR[0])+1);
L_BLOW[146]=L_BLOW[128];
if(((!HFLG[HFLG_])&&(L_BLOW[135]!=0))){L_BLOW[146]=C_OBJCTS[L_BLOW[135]+220];}
RSPSUB(L_BLOW,136,L_BLOW,146);
case 3000:
pc=[4000,3100,3200,3300,3400,3500,3600,4000,3200][(L_BLOW[138]+1)-1];if(pc!==undefined)continue L;
case 3100:
if(HFLG[HFLG_]){L_BLOW[133]=(-L_BLOW[133]);}
pc=4000;continue L;
case 3200:
L_BLOW[133]=0;
pc=4000;continue L;
case 3300:
L_BLOW[133]=Math.max(0,(L_BLOW[133]-1));
pc=4000;continue L;
case 3400:
L_BLOW[133]=Math.max(0,(L_BLOW[133]-2));
pc=4000;continue L;
case 3500:
if(HFLG[HFLG_]){pc=3550;continue L;}
C_ADVS[H[H_]+24]=ZOR(C_ADVS,H[H_]+24,C_AFLAGS,0);
pc=4000;continue L;
case 3550:
C_OBJCTS[V[V_]+1100]=ZOR(C_OBJCTS,V[V_]+1100,C_OFLAGS,25);
pc=4000;continue L;
case 3600:
NEWSTA(L_BLOW,135,[0],0,C_PLAY,1,[0],0,[0],0);
L_BLOW[135]=0;
if(HFLG[HFLG_]){pc=4000;continue L;}
L_BLOW[135]=Math.abs(FWIM([0],0,C_OFLAGS,22,[0],0,[0],0,H,H_,[1],0));
if((L_BLOW[135]!=0)){RSPSUB([605],0,C_OBJCTS,L_BLOW[135]+220);}
case 4000:
L_BLOW[126]=L_BLOW[138];
if((!HFLG[HFLG_])){pc=4500;continue L;}
C_OBJCTS[V[V_]+1980]=L_BLOW[133];
if((L_BLOW[133]!=0)){pc=4100;continue L;}
C_OBJCTS[V[V_]+1100]=ZAND(C_OBJCTS,V[V_]+1100,[(~C_OFLAGS[23])],0);
RSPSUB([572],0,L_BLOW,128);
NEWSTA(V,V_,[0],0,[0],0,[0],0,[0],0);
if((L_BLOW[127]==0)){return L_BLOW[126];}
C_PRSVEC[0]=C_VINDEX[1];
L_BLOW[2]=(yield* OAPPLI(L_BLOW,127,[0],0));
return L_BLOW[126];
case 4100:
if(((L_BLOW[138]!=L_BLOW[147])||(L_BLOW[127]==0))){return L_BLOW[126];}
C_PRSVEC[0]=C_VINDEX[4];
L_BLOW[2]=(yield* OAPPLI(L_BLOW,127,[0],0));
return L_BLOW[126];
case 4500:
C_ADVS[H[H_]+20]=(-10000);
if((L_BLOW[133]!=0)){C_ADVS[H[H_]+20]=(L_BLOW[133]-L_BLOW[134]);}
if((L_BLOW[133]>=L_BLOW[134])){pc=4600;continue L;}
C_CEVENT[C_CINDEX[0]]=30;
C_CEVENT[C_CINDEX[0]+50]=1;
case 4600:
if((FIGHTS(H,H_,[1],0)>0)){return L_BLOW[126];}
C_ADVS[H[H_]+20]=(1-FIGHTS(H,H_,[0],0));
(yield* JIGSUP([596],0));
L_BLOW[126]=(-1);
return L_BLOW[126];
return L_BLOW[126];
}}
/* demons.f */
function SWORDD(){
var pc=0;L:for(;;)switch(pc){case 0:
if((C_OBJCTS[C_OINDEX[11]+2420]!=C_AINDEX[0])){pc=500;continue L;}
L_SWORDD[2]=2;
if(INFEST(C_PLAY,1)){pc=300;continue L;}
L_SWORDD[2]=1;
L_SWORDD[3]=C_XSRCH[0];L_SWORDD[4]=C_XSRCH[1];
case 100001:
if(L_SWORDD[3]>L_SWORDD[4]){pc=100002;continue L;}
if((!FINDXT(L_SWORDD,3,C_PLAY,1))){pc=200;continue L;}
pc=[50,200,50,50][C_CURXT[0]-1];if(pc!==undefined)continue L;
case 50:
if(INFEST(C_CURXT,1)){pc=300;continue L;}
case 200:
L_SWORDD[3]+=C_XSRCH[0];pc=100001;continue L;
case 100002:
L_SWORDD[2]=0;
case 300:
if((L_SWORDD[2]==C_HACK[4])){return;}
RSPEAK([(L_SWORDD[2]+495)],0);
C_HACK[4]=L_SWORDD[2];
return;
case 500:
C_HACK[3]=0;
return;
return;
}}
/* demons.f */
function INFEST(R,R_){
if((!C_FINDEX[32])){L_INFEST[0]=((((C_OBJCTS[C_OINDEX[37]+2200]==R[R_])||(C_OBJCTS[C_OINDEX[16]+2200]==R[R_]))||((C_OBJCTS[C_OINDEX[39]+2200]==R[R_])&&C_HACK[2])))?1:0;}
if(C_FINDEX[32]){L_INFEST[0]=(((((R[R_]==C_RINDEX[67])||(R[R_]==C_RINDEX[73]))||(R[R_]==C_RINDEX[74]))||((R[R_]==C_RINDEX[76])&&(C_FINDEX[58]==C_RINDEX[67]))))?1:0;}
return L_INFEST[0];
return L_INFEST[0];
}
/* dgame.f */
function* GAME(){
var pc=0;L:for(;;)switch(pc){case 0:
MUTE=true;RSPEAK([1],0);
L_GAME[4]=(yield* RMDESC([3],0));MUTE=false;
case 100:
C_PLAY[0]=C_AINDEX[0];
C_PLAY[2]=0;
if((C_PRSVEC[4]<=1)){(yield* RDLINE(C_INPUT,0,C_INPUTL,0,[1],0));}
L_GAME[16]=1;L_GAME[17]=3;
case 100001:
if(L_GAME[16]>L_GAME[17]){pc=100002;continue L;}
if((C_INPUT[((L_GAME[16]+C_PRSVEC[4])-1)-1]!=L_GAME[L_GAME[16]+12])){pc=200;continue L;}
case 150:
L_GAME[16]+=1;pc=100001;continue L;
case 100002:
(yield* GDT());
pc=100;continue L;
case 200:
C_STATE[0]=(C_STATE[0]+1);
C_PRSVEC[3]=PARSE(C_INPUT,0,C_INPUTL,0,[1],0);
if((!C_PRSVEC[3])){pc=400;continue L;}
if((yield* XVEHIC([1],0))){pc=400;continue L;}
if((C_PRSVEC[0]==C_VINDEX[51])){pc=2000;continue L;}
case 300:
if(((C_PRSVEC[2]==C_OINDEX[116])||(C_PRSVEC[2]==C_OINDEX[115]))){pc=900;continue L;}
if((!(yield* VAPPLI(C_PRSVEC,0)))){pc=400;continue L;}
case 350:
if(((!C_FINDEX[8])&&(C_PLAY[1]==C_RINDEX[13]))){pc=1000;continue L;}
L_GAME[4]=(yield* RAPPLI(C_ROOMS,C_PLAY[1]+401));
case 400:
(yield* XENDMV(C_PLAY,2));
if((!LIT(C_PLAY,1))){C_PRSVEC[4]=1;}
pc=100;continue L;
case 900:
(yield* VALUAC(C_OINDEX,116));
pc=350;continue L;
case 1000:
(yield* RDLINE(C_INPUT,0,C_INPUTL,0,[0],0));
C_STATE[0]=(C_STATE[0]+1);
L_GAME[16]=1;L_GAME[18]=4;
case 100003:
if(L_GAME[16]>L_GAME[18]){pc=100004;continue L;}
if((C_INPUT[L_GAME[16]-1]!=L_GAME[L_GAME[16]+8])){pc=1300;continue L;}
case 1100:
L_GAME[16]+=1;pc=100003;continue L;
case 100004:
L_GAME[16]=5;L_GAME[19]=78;
case 100005:
if(L_GAME[16]>L_GAME[19]){pc=100006;continue L;}
if((C_INPUT[L_GAME[16]-1]!=" ")){pc=1300;continue L;}
case 1200:
L_GAME[16]+=1;pc=100005;continue L;
case 100006:
RSPEAK([571],0);
C_FINDEX[8]=1;
C_OBJCTS[C_OINDEX[21]+1100]=ZAND(C_OBJCTS,C_OINDEX[21]+1100,[ZNOT(C_OFLAGS,18)],0);
C_PRSVEC[3]=1;
C_PRSVEC[4]=1;
pc=400;continue L;
case 1300:
C_PRSVEC[3]=PARSE(C_INPUT,0,C_INPUTL,0,[0],0);
if(((!C_PRSVEC[3])||(C_PRSVEC[0]!=C_VINDEX[50]))){pc=1400;continue L;}
if(FINDXT(C_PRSVEC,2,C_PLAY,1)){pc=300;continue L;}
case 1400:
var W=WSTART("1X,78A1");for(L_GAME[20]=1;L_GAME[20]<=C_INPUTL[0];L_GAME[20]++){W.put(C_INPUT[L_GAME[20]-1]);}W.end();
C_PLAY[2]=1;
pc=1000;continue L;
case 2000:
if((ZAND(C_OBJCTS,C_PRSVEC[2]+1100,C_OFLAGS,21)!=0)){pc=2100;continue L;}
RSPEAK([602],0);
pc=350;continue L;
case 2100:
C_PLAY[0]=OACTOR(C_PRSVEC,2);
C_PLAY[1]=C_ADVS[C_PLAY[0]];
if((C_PRSVEC[4]<=1)){pc=2700;continue L;}
if(PARSE(C_INPUT,0,C_INPUTL,0,[1],0)){pc=2150;continue L;}
case 2700:
L_GAME[16]=341;
if(C_PLAY[2]){L_GAME[16]=604;}
RSPEAK(L_GAME,16);
case 2600:
C_PLAY[0]=C_AINDEX[0];
C_PLAY[1]=C_ADVS[C_PLAY[0]];
pc=350;continue L;
case 2150:
if(AAPPLI(C_ADVS,C_PLAY[0]+16)){pc=2400;continue L;}
if((yield* XVEHIC([1],0))){pc=2400;continue L;}
if(((C_PRSVEC[2]==C_OINDEX[116])||(C_PRSVEC[2]==C_OINDEX[115]))){pc=2900;continue L;}
if((!(yield* VAPPLI(C_PRSVEC,0)))){pc=2400;continue L;}
case 2350:
L_GAME[4]=(yield* RAPPLI(C_ROOMS,C_PLAY[1]+401));
case 2400:
(yield* XENDMV(C_PLAY,2));
pc=2600;continue L;
case 2900:
(yield* VALUAC(C_OINDEX,116));
pc=350;continue L;
return;
}}
/* dgame.f */
function* XENDMV(FLAG,FLAG_){
if((!FLAG[FLAG_])){RSPEAK([341],0);}
if(C_HACK[2]){THIEFD();}
if(C_PRSVEC[3]){(yield* FIGHTD());}
if(C_HACK[3]){SWORDD();}
if(C_PRSVEC[3]){L_XENDMV[0]=(yield* CLOCKD(L_XENDMV,3));}
if(C_PRSVEC[3]){L_XENDMV[0]=(yield* XVEHIC([2],0));}
return;
return;
}
/* dgame.f */
function* XVEHIC(N,N_){
L_XVEHIC[1]=0;
L_XVEHIC[2]=C_ADVS[C_PLAY[0]+8];
if((L_XVEHIC[2]!=0)){L_XVEHIC[1]=(yield* OAPPLI(C_OBJCTS,L_XVEHIC[2]+660,N,N_));}
return L_XVEHIC[1];
return L_XVEHIC[1];
}
/* dgame.f */
function INIT(){
var pc=0;L:for(;;)switch(pc){case 0:
case 10000:
L_INIT[1]=0;
L_INIT[2]=1050;
L_INIT[3]=220;
L_INIT[4]=200;
L_INIT[5]=4;
L_INIT[6]=4;
L_INIT[7]=25;
L_INIT[8]=46;
L_INIT[9]=22;
L_INIT[10]=900;
L_INIT[11]=20;
L_INIT[12]=15;
C_RMSG[0]=0;
C_OBJCTS[0]=0;
C_ROOMS[0]=0;
C_VILL[0]=0;
C_ADVS[0]=0;
C_CEVENT[0]=0;
C_EXITS[0]=1;
C_OROOM2[0]=0;
C_STATE[5]=10;
C_STATE[3]=C_STATE[5];
C_STATE[9]=0;
C_STATE[10]=0;
C_STATE[4]=100;
C_STATE[2]=0;
C_STATE[1]=0;
C_STATE[0]=0;
C_TIME[0]=0;
C_STATE[7]=0;
C_STATE[8]=0;
C_PRSVEC[0]=0;
C_PRSVEC[1]=0;
C_PRSVEC[2]=0;
C_PRSVEC[4]=1;
C_ORPHS[0]=0;
C_ORPHS[1]=0;
C_ORPHS[2]=0;
C_ORPHS[3]=0;
C_ORPHS[4]=0;
C_HACK[1]=0;
C_HACK[2]=1;
C_HACK[3]=0;
C_HACK[4]=0;
L_INIT[13]=1;
C_STAR[0]=0;
MACHDV();
L_INIT[14]=1;L_INIT[15]=L_INIT[7];
case 100001:
if(L_INIT[14]>L_INIT[15]){pc=100002;continue L;}
C_CEVENT[L_INIT[14]+50]=0;
C_CEVENT[L_INIT[14]]=0;
C_CEVENT[L_INIT[14]+25]=0;
case 5:
L_INIT[14]+=1;pc=100001;continue L;
case 100002:
L_INIT[14]=1;L_INIT[16]=L_INIT[8];
case 100003:
if(L_INIT[14]>L_INIT[16]){pc=100004;continue L;}
C_FINDEX[L_INIT[14]-1]=0;
case 10:
L_INIT[14]+=1;pc=100003;continue L;
case 100004:
C_FINDEX[23]=1;
C_FINDEX[18]=1;
C_FINDEX[27]=1;
C_FINDEX[39]=1;
C_FINDEX[40]=1;
C_FINDEX[42]=1;
L_INIT[14]=1;L_INIT[17]=L_INIT[9];
case 100005:
if(L_INIT[14]>L_INIT[17]){pc=100006;continue L;}
C_FINDEX[L_INIT[14]+45]=0;
case 12:
L_INIT[14]+=1;pc=100005;continue L;
case 100006:
C_FINDEX[55]=4;
C_FINDEX[63]=1;
C_FINDEX[64]=1;
C_FINDEX[57]=270;
C_FINDEX[58]=C_RINDEX[65];
C_FINDEX[67]=10;
L_INIT[14]=1;L_INIT[18]=L_INIT[11];
case 100007:
if(L_INIT[14]>L_INIT[18]){pc=100008;continue L;}
C_OROOM2[L_INIT[14]+20]=0;
C_OROOM2[L_INIT[14]]=0;
case 15:
L_INIT[14]+=1;pc=100007;continue L;
case 100008:
L_INIT[14]=1;L_INIT[19]=L_INIT[10];
case 100009:
if(L_INIT[14]>L_INIT[19]){pc=100010;continue L;}
C_EXITS[L_INIT[14]]=0;
case 20:
L_INIT[14]+=1;pc=100009;continue L;
case 100010:
L_INIT[14]=1;L_INIT[20]=L_INIT[5];
case 100011:
if(L_INIT[14]>L_INIT[20]){pc=100012;continue L;}
C_VILL[L_INIT[14]+8]=0;
C_VILL[L_INIT[14]+4]=0;
C_VILL[L_INIT[14]]=0;
C_VILL[L_INIT[14]+12]=0;
C_VILL[L_INIT[14]+16]=0;
case 30:
L_INIT[14]+=1;pc=100011;continue L;
case 100012:
L_INIT[14]=1;L_INIT[21]=L_INIT[3];
case 100013:
if(L_INIT[14]>L_INIT[21]){pc=100014;continue L;}
C_OBJCTS[L_INIT[14]]=0;
C_OBJCTS[L_INIT[14]+220]=0;
C_OBJCTS[L_INIT[14]+440]=0;
C_OBJCTS[L_INIT[14]+2860]=0;
C_OBJCTS[L_INIT[14]+660]=0;
C_OBJCTS[L_INIT[14]+880]=0;
C_OBJCTS[L_INIT[14]+1100]=0;
C_OBJCTS[L_INIT[14]+1320]=0;
C_OBJCTS[L_INIT[14]+1540]=0;
C_OBJCTS[L_INIT[14]+1760]=0;
C_OBJCTS[L_INIT[14]+1980]=0;
C_OBJCTS[L_INIT[14]+2640]=0;
C_OBJCTS[L_INIT[14]+2420]=0;
C_OBJCTS[L_INIT[14]+2200]=0;
case 40:
L_INIT[14]+=1;pc=100013;continue L;
case 100014:
C_ROOMS[1]=0;
L_INIT[14]=1;L_INIT[22]=L_INIT[4];
case 100015:
if(L_INIT[14]>L_INIT[22]){pc=100016;continue L;}
C_ROOMS[L_INIT[14]+1]=0;
C_ROOMS[L_INIT[14]+401]=0;
C_ROOMS[L_INIT[14]+801]=0;
C_ROOMS[L_INIT[14]+601]=0;
C_ROOMS[L_INIT[14]+201]=0;
case 50:
L_INIT[14]+=1;pc=100015;continue L;
case 100016:
L_INIT[14]=1;L_INIT[23]=L_INIT[2];
case 100017:
if(L_INIT[14]>L_INIT[23]){pc=100018;continue L;}
C_RMSG[L_INIT[14]]=0;
case 60:
L_INIT[14]+=1;pc=100017;continue L;
case 100018:
L_INIT[14]=1;L_INIT[24]=L_INIT[6];
case 100019:
if(L_INIT[14]>L_INIT[24]){pc=100020;continue L;}
C_ADVS[L_INIT[14]]=0;
C_ADVS[L_INIT[14]+4]=0;
C_ADVS[L_INIT[14]+8]=0;
C_ADVS[L_INIT[14]+12]=0;
C_ADVS[L_INIT[14]+16]=0;
C_ADVS[L_INIT[14]+20]=0;
C_ADVS[L_INIT[14]+24]=0;
case 70:
L_INIT[14]+=1;pc=100019;continue L;
case 100020:
C_DEBUG[0]=0;
C_DEBUG[1]=0;
C_DEBUG[2]=0;
C_SCREEN[0]=0;
C_SCREEN[1]=0;
C_SCREEN[2]=0;
if(!IOPEN("DINDX.DAT","OLD")){pc=1900;continue L;}
var R=RINDX("I8");L_INIT[14]=R();L_INIT[25]=R();L_INIT[26]=R();
if(((L_INIT[14]!=C_VERS[0])||(L_INIT[25]!=C_VERS[1]))){pc=1925;continue L;}
var R=RINDX("I8");C_STATE[3]=R();C_STAR[1]=R();C_STATE[10]=R();
var R=RINDX("I8");C_ROOMS[0]=R();C_ROOMS[1]=R();for(var ii=0;ii<200;ii++){C_ROOMS[2+ii]=R();}for(var ii=0;ii<200;ii++){C_ROOMS[202+ii]=R();}for(var ii=0;ii<200;ii++){C_ROOMS[402+ii]=R();}for(var ii=0;ii<200;ii++){C_ROOMS[602+ii]=R();}for(var ii=0;ii<200;ii++){C_ROOMS[802+ii]=R();}
var R=RINDX("I8");C_EXITS[0]=R();for(var ii=0;ii<900;ii++){C_EXITS[1+ii]=R();}
var R=RINDX("I8");C_OBJCTS[0]=R();for(var ii=0;ii<220;ii++){C_OBJCTS[1+ii]=R();}for(var ii=0;ii<220;ii++){C_OBJCTS[221+ii]=R();}for(var ii=0;ii<220;ii++){C_OBJCTS[441+ii]=R();}for(var ii=0;ii<220;ii++){C_OBJCTS[661+ii]=R();}for(var ii=0;ii<220;ii++){C_OBJCTS[881+ii]=R();}for(var ii=0;ii<220;ii++){C_OBJCTS[1101+ii]=R();}for(var ii=0;ii<220;ii++){C_OBJCTS[1321+ii]=R();}for(var ii=0;ii<220;ii++){C_OBJCTS[1541+ii]=R();}for(var ii=0;ii<220;ii++){C_OBJCTS[1761+ii]=R();}for(var ii=0;ii<220;ii++){C_OBJCTS[1981+ii]=R();}for(var ii=0;ii<220;ii++){C_OBJCTS[2201+ii]=R();}for(var ii=0;ii<220;ii++){C_OBJCTS[2421+ii]=R();}for(var ii=0;ii<220;ii++){C_OBJCTS[2641+ii]=R();}for(var ii=0;ii<220;ii++){C_OBJCTS[2861+ii]=R();}
var R=RINDX("I8");C_OROOM2[0]=R();for(var ii=0;ii<20;ii++){C_OROOM2[1+ii]=R();}for(var ii=0;ii<20;ii++){C_OROOM2[21+ii]=R();}
var R=RINDX("I8");C_CEVENT[0]=R();for(var ii=0;ii<25;ii++){C_CEVENT[1+ii]=R();}for(var ii=0;ii<25;ii++){C_CEVENT[26+ii]=R();}
var R=RINDX("L4");for(var ii=0;ii<25;ii++){C_CEVENT[51+ii]=R();}
var R=RINDX("I8");C_VILL[0]=R();for(var ii=0;ii<4;ii++){C_VILL[1+ii]=R();}for(var ii=0;ii<4;ii++){C_VILL[5+ii]=R();}for(var ii=0;ii<4;ii++){C_VILL[9+ii]=R();}for(var ii=0;ii<4;ii++){C_VILL[13+ii]=R();}for(var ii=0;ii<4;ii++){C_VILL[17+ii]=R();}
var R=RINDX("I8");C_ADVS[0]=R();for(var ii=0;ii<4;ii++){C_ADVS[1+ii]=R();}for(var ii=0;ii<4;ii++){C_ADVS[5+ii]=R();}for(var ii=0;ii<4;ii++){C_ADVS[9+ii]=R();}for(var ii=0;ii<4;ii++){C_ADVS[13+ii]=R();}for(var ii=0;ii<4;ii++){C_ADVS[17+ii]=R();}for(var ii=0;ii<4;ii++){C_ADVS[21+ii]=R();}for(var ii=0;ii<4;ii++){C_ADVS[25+ii]=R();}
var R=RINDX("I8");C_STAR[0]=R();C_RMSG[0]=R();for(var ii=0;ii<1050;ii++){C_RMSG[1+ii]=R();}
ICLOSE("11");
if(!IOPEN("DTEXT.DAT","OLD")){pc=1950;continue L;}
pc=1025;continue L;
case 1025:
ITIME(C_TIME,1,C_TIME,2,C_TIME,3);
KDATE(L_INIT,14,L_INIT,25,L_INIT,26);
INIRND([ZOR([ZOR(L_INIT,14,L_INIT,25)],0,L_INIT,26)],0,[ZOR([ZOR(C_TIME,1,C_TIME,2)],0,C_TIME,3)],0);
C_PLAY[0]=C_AINDEX[0];
C_HACK[0]=C_OBJCTS[C_OINDEX[39]+2200];
C_STATE[6]=C_OBJCTS[C_OINDEX[57]+2200];
C_PLAY[1]=C_ADVS[C_PLAY[0]];
C_LAST[0]=C_ADVS[C_AINDEX[0]+12];
L_INIT[1]=1;
return L_INIT[1];
case 1900:
var W=WSTART("' I can''t open \"DINDX.DAT\".'");W.end();
var W=WSTART("' Suddenly a sinister, wraithlike figure appears before you',     /' seeming to float in the air.  In a low, sorrowful voice ',     'he says,'/' \"Alas, the very nature of the world has changed, '   'and the dungeon'/' cannot be found.  All must now pass away.\"',  '  Raising his oaken staff'/' in farewell, he fades into the ',   'spreading darkness.  In his place'/' appears a tastefully ',     'lettered sign reading:'//23X,'INITIALIZATION FAILURE'//         ' The darkness becomes all encompassing, and your vision fails.'");W.end();
return L_INIT[1];
case 1925:
var W=WSTART("' \"DINDX.DAT\" is version ',I1,'.',I1,A1,'.'/                  ' I require version ',I1,'.',I1,A1,'.'");W.put(L_INIT[14]);W.put(L_INIT[25]);W.put(L_INIT[26]);W.put(C_VERS[0]);W.put(C_VERS[1]);W.put(C_VERS[2]);W.end();
var W=WSTART("' Suddenly a sinister, wraithlike figure appears before you',     /' seeming to float in the air.  In a low, sorrowful voice ',     'he says,'/' \"Alas, the very nature of the world has changed, '   'and the dungeon'/' cannot be found.  All must now pass away.\"',  '  Raising his oaken staff'/' in farewell, he fades into the ',   'spreading darkness.  In his place'/' appears a tastefully ',     'lettered sign reading:'//23X,'INITIALIZATION FAILURE'//         ' The darkness becomes all encompassing, and your vision fails.'");W.end();
return L_INIT[1];
case 1950:
var W=WSTART("' I can''t open \"DTEXT.DAT\".'");W.end();
var W=WSTART("' Suddenly a sinister, wraithlike figure appears before you',     /' seeming to float in the air.  In a low, sorrowful voice ',     'he says,'/' \"Alas, the very nature of the world has changed, '   'and the dungeon'/' cannot be found.  All must now pass away.\"',  '  Raising his oaken staff'/' in farewell, he fades into the ',   'spreading darkness.  In his place'/' appears a tastefully ',     'lettered sign reading:'//23X,'INITIALIZATION FAILURE'//         ' The darkness becomes all encompassing, and your vision fails.'");W.end();
return L_INIT[1];
return L_INIT[1];
}}
/* dso.f */
function PRINCR(FULL,FULL_,RM,RM_){
var pc=0;L:for(;;)switch(pc){case 0:
L_PRINCR[4]=329;
L_PRINCR[5]=1;L_PRINCR[6]=C_OBJCTS[0];
case 100001:
if(L_PRINCR[5]>L_PRINCR[6]){pc=100002;continue L;}
if((((!QHERE(L_PRINCR,5,RM,RM_))||(ZAND(C_OBJCTS,L_PRINCR[5]+880,[(C_OFLAGS[0]+C_OFLAGS[6])],0)!=C_OFLAGS[0]))||(L_PRINCR[5]==C_ADVS[C_PLAY[0]+8]))){pc=500;continue L;}
if(((!FULL[FULL_])&&(C_FINDEX[22]||(C_FINDEX[21]&&(ZAND(C_ROOMS,C_PLAY[1]+801,C_RFLAG,0)!=0))))){pc=200;continue L;}
L_PRINCR[7]=C_OBJCTS[L_PRINCR[5]+440];
if(((L_PRINCR[7]==0)||(ZAND(C_OBJCTS,L_PRINCR[5]+1100,C_OFLAGS,29)!=0))){L_PRINCR[7]=C_OBJCTS[L_PRINCR[5]];}
RSPEAK(L_PRINCR,7);
pc=500;continue L;
case 200:
RSPSUB(L_PRINCR,4,C_OBJCTS,L_PRINCR[5]+220);
L_PRINCR[4]=502;
case 500:
L_PRINCR[5]+=1;pc=100001;continue L;
case 100002:
L_PRINCR[5]=1;L_PRINCR[8]=C_OBJCTS[0];
case 100003:
if(L_PRINCR[5]>L_PRINCR[8]){pc=100004;continue L;}
if(((!QHERE(L_PRINCR,5,RM,RM_))||(ZAND(C_OBJCTS,L_PRINCR[5]+880,[(C_OFLAGS[0]+C_OFLAGS[6])],0)!=C_OFLAGS[0]))){pc=1000;continue L;}
if((ZAND(C_OBJCTS,L_PRINCR[5]+1100,C_OFLAGS,21)!=0)){INVENT([OACTOR(L_PRINCR,5)],0);}
if((((ZAND(C_OBJCTS,L_PRINCR[5]+880,C_OFLAGS,4)==0)&&(ZAND(C_OBJCTS,L_PRINCR[5]+1100,C_OFLAGS,28)==0))||QEMPTY(L_PRINCR,5))){pc=1000;continue L;}
if(!(L_PRINCR[5]==C_OINDEX[90])){pc=100005;continue L;}
L_PRINCR[2]=(((ZAND(C_OBJCTS,C_OINDEX[93]+1100,C_OFLAGS,29)==0)&&(C_OBJCTS[C_OINDEX[93]+2640]==C_OINDEX[90])))?1:0;
if(!L_PRINCR[2]){pc=100007;continue L;}
L_PRINCR[7]=C_OBJCTS[C_OINDEX[93]+440];
RSPEAK(L_PRINCR,7);
pc=1000;continue L;
case 100007:
case 100008:
case 100005:
case 100006:
if(!(L_PRINCR[5]==C_OINDEX[91])){pc=100009;continue L;}
L_PRINCR[2]=(((ZAND(C_OBJCTS,C_OINDEX[94]+1100,C_OFLAGS,29)==0)&&(C_OBJCTS[C_OINDEX[94]+2640]==C_OINDEX[91])))?1:0;
if(!L_PRINCR[2]){pc=100011;continue L;}
L_PRINCR[7]=C_OBJCTS[C_OINDEX[94]+440];
RSPEAK(L_PRINCR,7);
pc=1000;continue L;
case 100011:
case 100012:
case 100009:
case 100010:
if(!(L_PRINCR[5]==L_PRINCR[3])){pc=100013;continue L;}
L_PRINCR[2]=(((ZAND(C_OBJCTS,C_OINDEX[90]+1100,C_OFLAGS,29)==0)&&(C_OBJCTS[C_OINDEX[90]+2640]==L_PRINCR[3])))?1:0;
if(!L_PRINCR[2]){pc=100015;continue L;}
L_PRINCR[7]=C_OBJCTS[C_OINDEX[90]+440];
RSPEAK(L_PRINCR,7);
pc=1000;continue L;
case 100015:
case 100016:
case 100013:
case 100014:
L_PRINCR[4]=573;
if((L_PRINCR[5]!=C_OINDEX[6])){pc=600;continue L;}
L_PRINCR[4]=574;
if(((C_FINDEX[21]||C_FINDEX[22])&&(!FULL[FULL_]))){pc=1000;continue L;}
case 600:
PRINCO(L_PRINCR,5,L_PRINCR,4);
case 1000:
L_PRINCR[5]+=1;pc=100003;continue L;
case 100004:
return;
return;
}}
/* dso.f */
function INVENT(ADV,ADV_){
var pc=0;L:for(;;)switch(pc){case 0:
L_INVENT[1]=575;
if((ADV[ADV_]!=C_AINDEX[0])){L_INVENT[1]=576;}
L_INVENT[2]=1;L_INVENT[3]=C_OBJCTS[0];
case 100001:
if(L_INVENT[2]>L_INVENT[3]){pc=100002;continue L;}
if(((C_OBJCTS[L_INVENT[2]+2420]!=ADV[ADV_])||(ZAND(C_OBJCTS,L_INVENT[2]+880,C_OFLAGS,0)==0))){pc=10;continue L;}
RSPSUB(L_INVENT,1,C_OBJCTS,C_ADVS[ADV[ADV_]+12]+220);
L_INVENT[1]=0;
RSPSUB([502],0,C_OBJCTS,L_INVENT[2]+220);
case 10:
L_INVENT[2]+=1;pc=100001;continue L;
case 100002:
if((L_INVENT[1]==0)){pc=25;continue L;}
if((ADV[ADV_]==C_AINDEX[0])){RSPEAK([578],0);}
return;
case 25:
L_INVENT[2]=1;L_INVENT[4]=C_OBJCTS[0];
case 100003:
if(L_INVENT[2]>L_INVENT[4]){pc=100004;continue L;}
if((((C_OBJCTS[L_INVENT[2]+2420]!=ADV[ADV_])||(ZAND(C_OBJCTS,L_INVENT[2]+880,C_OFLAGS,0)==0))||((ZAND(C_OBJCTS,L_INVENT[2]+880,C_OFLAGS,4)==0)&&(ZAND(C_OBJCTS,L_INVENT[2]+1100,C_OFLAGS,28)==0)))){pc=100;continue L;}
if((!QEMPTY(L_INVENT,2))){PRINCO(L_INVENT,2,[573],0);}
case 100:
L_INVENT[2]+=1;pc=100003;continue L;
case 100004:
return;
return;
}}
/* dso.f */
function PRINCO(OBJ,OBJ_,DESC,DESC_){
var pc=0;L:for(;;)switch(pc){case 0:
RSPSUB(DESC,DESC_,C_OBJCTS,OBJ[OBJ_]+220);
L_PRINCO[0]=1;L_PRINCO[1]=C_OBJCTS[0];
case 100001:
if(L_PRINCO[0]>L_PRINCO[1]){pc=100002;continue L;}
if((C_OBJCTS[L_PRINCO[0]+2640]==OBJ[OBJ_])){RSPSUB([502],0,C_OBJCTS,L_PRINCO[0]+220);}
case 100:
L_PRINCO[0]+=1;pc=100001;continue L;
case 100002:
return;
return;
}}
/* dso.f */
function MOVETO(NR,NR_,WHO,WHO_){
var pc=0;L:for(;;)switch(pc){case 0:
L_MOVETO[3]=0;
L_MOVETO[1]=((ZAND(C_ROOMS,C_PLAY[1]+801,C_RFLAG,2)!=0))?1:0;
L_MOVETO[2]=((ZAND(C_ROOMS,NR[NR_]+801,C_RFLAG,2)!=0))?1:0;
L_MOVETO[4]=C_ADVS[WHO[WHO_]+8];
if((L_MOVETO[4]!=0)){pc=100;continue L;}
if(L_MOVETO[2]){pc=500;continue L;}
RSPEAK([427],0);
return L_MOVETO[3];
case 100:
L_MOVETO[5]=0;
if((L_MOVETO[4]==C_OINDEX[53])){L_MOVETO[5]=C_RFLAG[3];}
if((L_MOVETO[4]==C_OINDEX[57])){L_MOVETO[5]=C_RFLAG[4];}
if((L_MOVETO[4]==C_OINDEX[79])){L_MOVETO[5]=C_RFLAG[8];}
L_MOVETO[0]=((ZAND(C_ROOMS,NR[NR_]+801,L_MOVETO,5)==0))?1:0;
if((((!L_MOVETO[2])&&L_MOVETO[0])||(((L_MOVETO[2]&&L_MOVETO[1])&&L_MOVETO[0])&&(L_MOVETO[5]!=C_RFLAG[2])))){pc=800;continue L;}
case 500:
L_MOVETO[3]=1;
if((ZAND(C_ROOMS,NR[NR_]+801,C_RFLAG,7)==0)){pc=600;continue L;}
RSPEAK(C_ROOMS,NR[NR_]+601);
return L_MOVETO[3];
case 600:
if((WHO[WHO_]!=C_AINDEX[0])){NEWSTA(C_ADVS,WHO[WHO_]+12,[0],0,NR,NR_,[0],0,[0],0);}
if((L_MOVETO[4]!=0)){NEWSTA(L_MOVETO,4,[0],0,NR,NR_,[0],0,[0],0);}
C_PLAY[1]=NR[NR_];
C_ADVS[WHO[WHO_]]=C_PLAY[1];
SCRUPD(C_ROOMS,NR[NR_]+601);
C_ROOMS[NR[NR_]+601]=0;
return L_MOVETO[3];
case 800:
RSPSUB([428],0,C_OBJCTS,L_MOVETO[4]+220);
return L_MOVETO[3];
return L_MOVETO[3];
}}
/* dso.f */
function SCORE(FLG,FLG_){
var pc=0;L:for(;;)switch(pc){case 0:
if(FLG[FLG_]){L_SCORE[16]=0;}
L_SCORE[15]=". ";
if((C_STATE[0]!=1)){L_SCORE[15]="s.";}
L_SCORE[16]=C_ADVS[C_PLAY[0]+4];
if(C_FINDEX[32]){pc=60;continue L;}
var W=WSTART("' Your score is',I4,' [total of',I4,' points], in'            ,I5,' move',A2");W.put(L_SCORE[16]);W.put(C_STATE[3]);W.put(C_STATE[0]);W.put(L_SCORE[15]);W.end();
L_SCORE[17]=1;L_SCORE[18]=10;
case 100001:
if(L_SCORE[17]>L_SCORE[18]){pc=100002;continue L;}
if((DIV(Math.imul(L_SCORE[16],20),C_STATE[3])>=L_SCORE[L_SCORE[17]-1])){pc=50;continue L;}
case 10:
L_SCORE[17]+=1;pc=100001;continue L;
case 100002:
case 50:
RSPEAK([(484+L_SCORE[17])],0);
return;
case 60:
var W=WSTART("' Your score in the endgame is',I4,' [total of',I4,           ' points], in',I5,' move',A2");W.put(C_STATE[9]);W.put(C_STATE[10]);W.put(C_STATE[0]);W.put(L_SCORE[15]);W.end();
L_SCORE[17]=1;L_SCORE[19]=5;
case 100003:
if(L_SCORE[17]>L_SCORE[19]){pc=100004;continue L;}
if((DIV(Math.imul(C_STATE[9],20),C_STATE[10])>=L_SCORE[L_SCORE[17]+9])){pc=80;continue L;}
case 70:
L_SCORE[17]+=1;pc=100003;continue L;
case 100004:
case 80:
RSPEAK([(786+L_SCORE[17])],0);
return;
return;
}}
/* dso.f */
function SCRUPD(N,N_){
var pc=0;L:for(;;)switch(pc){case 0:
if(C_FINDEX[32]){pc=100;continue L;}
C_ADVS[C_PLAY[0]+4]=(C_ADVS[C_PLAY[0]+4]+N[N_]);
C_STATE[2]=(C_STATE[2]+N[N_]);
if((C_ADVS[C_PLAY[0]+4]<(C_STATE[3]-Math.imul(10,C_STATE[1])))){return;}
C_CEVENT[C_CINDEX[14]+50]=1;
C_CEVENT[C_CINDEX[14]]=15;
return;
case 100:
C_STATE[9]=(C_STATE[9]+N[N_]);
return;
return;
}}
/* dso.f */
function FINDXT(DIR,DIR_,RM,RM_){
var pc=0;L:for(;;)switch(pc){case 0:
L_FINDXT[0]=1;
L_FINDXT[1]=C_ROOMS[RM[RM_]+201];
if((L_FINDXT[1]==0)){pc=1000;continue L;}
case 100:
L_FINDXT[2]=C_EXITS[L_FINDXT[1]];
C_CURXT[1]=ZAND(L_FINDXT,2,C_XPARS,0);
C_CURXT[0]=(ZAND([DIV(ZAND(L_FINDXT,2,[ZNOT(C_XPARS,13)],0),C_XPARS[3])],0,C_XPARS,2)+1);
pc=[110,120,130,130][C_CURXT[0]-1];if(pc!==undefined)continue L;
BUG([10],0,C_CURXT,0);
case 130:
C_CURXT[4]=ZAND(C_EXITS,(L_FINDXT[1]+2),C_XPARS,0);
C_CURXT[3]=DIV(C_EXITS[(L_FINDXT[1]+2)],C_XPARS[4]);
case 120:
C_CURXT[2]=C_EXITS[(L_FINDXT[1]+1)];
case 110:
L_FINDXT[1]=(L_FINDXT[1]+C_XPARS[C_CURXT[0]+4]);
if((ZAND(L_FINDXT,2,C_XPARS,1)==DIR[DIR_])){return L_FINDXT[0];}
if((ZAND(L_FINDXT,2,C_XPARS,13)==0)){pc=100;continue L;}
case 1000:
L_FINDXT[0]=0;
return L_FINDXT[0];
return L_FINDXT[0];
}}
/* dso.f */
function FWIM(F1,F1_,F2,F2_,RM,RM_,CON,CON_,ADV,ADV_,NOCARE,NOCARE_){
var pc=0;L:for(;;)switch(pc){case 0:
L_FWIM[0]=0;
L_FWIM[1]=1;L_FWIM[2]=C_OBJCTS[0];
case 100001:
if(L_FWIM[1]>L_FWIM[2]){pc=100002;continue L;}
if(((((RM[RM_]==0)||(C_OBJCTS[L_FWIM[1]+2200]!=RM[RM_]))&&((ADV[ADV_]==0)||(C_OBJCTS[L_FWIM[1]+2420]!=ADV[ADV_])))&&((CON[CON_]==0)||(C_OBJCTS[L_FWIM[1]+2640]!=CON[CON_])))){pc=1000;continue L;}
if((ZAND(C_OBJCTS,L_FWIM[1]+880,C_OFLAGS,0)==0)){pc=1000;continue L;}
if((((!NOCARE[NOCARE_])&&(ZAND(C_OBJCTS,L_FWIM[1]+880,C_OFLAGS,2)==0))||((ZAND(C_OBJCTS,L_FWIM[1]+880,F1,F1_)==0)&&(ZAND(C_OBJCTS,L_FWIM[1]+1100,F2,F2_)==0)))){pc=500;continue L;}
if((L_FWIM[0]==0)){pc=400;continue L;}
L_FWIM[0]=(-L_FWIM[0]);
return L_FWIM[0];
case 400:
L_FWIM[0]=L_FWIM[1];
case 500:
if((ZAND(C_OBJCTS,L_FWIM[1]+1100,C_OFLAGS,28)==0)){pc=1000;continue L;}
L_FWIM[3]=1;L_FWIM[4]=C_OBJCTS[0];
case 100003:
if(L_FWIM[3]>L_FWIM[4]){pc=100004;continue L;}
if((((C_OBJCTS[L_FWIM[3]+2640]!=L_FWIM[1])||(ZAND(C_OBJCTS,L_FWIM[3]+880,C_OFLAGS,0)==0))||((ZAND(C_OBJCTS,L_FWIM[3]+880,F1,F1_)==0)&&(ZAND(C_OBJCTS,L_FWIM[3]+1100,F2,F2_)==0)))){pc=700;continue L;}
if((L_FWIM[0]==0)){pc=600;continue L;}
L_FWIM[0]=(-L_FWIM[0]);
return L_FWIM[0];
case 600:
L_FWIM[0]=L_FWIM[3];
case 700:
L_FWIM[3]+=1;pc=100003;continue L;
case 100004:
case 1000:
L_FWIM[1]+=1;pc=100001;continue L;
case 100002:
return L_FWIM[0];
return L_FWIM[0];
}}
/* dso.f */
function* YESNO(Q,Q_,Y,Y_,N,N_){
var pc=0;L:for(;;)switch(pc){case 0:
case 100:
RSPEAK(Q,Q_);
var R=RSTART("A1",yield READ);L_YESNO[0]=R();
if(((L_YESNO[0]=="Y")||(L_YESNO[0]=="y"))){pc=200;continue L;}
if(((L_YESNO[0]=="N")||(L_YESNO[0]=="n"))){pc=300;continue L;}
RSPEAK([6],0);
pc=100;continue L;
case 200:
L_YESNO[1]=1;
RSPEAK(Y,Y_);
return L_YESNO[1];
case 300:
L_YESNO[1]=0;
RSPEAK(N,N_);
return L_YESNO[1];
return L_YESNO[1];
}}
/* dso.f */
function ROBADV(ADV,ADV_,NR,NR_,NC,NC_,NA,NA_){
var pc=0;L:for(;;)switch(pc){case 0:
L_ROBADV[0]=0;
L_ROBADV[1]=1;L_ROBADV[2]=C_OBJCTS[0];
case 100001:
if(L_ROBADV[1]>L_ROBADV[2]){pc=100002;continue L;}
if((((C_OBJCTS[L_ROBADV[1]+2420]!=ADV[ADV_])||(C_OBJCTS[L_ROBADV[1]+1540]<=0))||(ZAND(C_OBJCTS,L_ROBADV[1]+1100,C_OFLAGS,18)!=0))){pc=100;continue L;}
NEWSTA(L_ROBADV,1,[0],0,NR,NR_,NC,NC_,NA,NA_);
L_ROBADV[0]=(L_ROBADV[0]+1);
case 100:
L_ROBADV[1]+=1;pc=100001;continue L;
case 100002:
return L_ROBADV[0];
return L_ROBADV[0];
}}
/* dso.f */
function ROBRM(RM,RM_,PR,PR_,NR,NR_,NC,NC_,NA,NA_){
var pc=0;L:for(;;)switch(pc){case 0:
L_ROBRM[2]=0;
L_ROBRM[3]=1;L_ROBRM[4]=C_OBJCTS[0];
case 100001:
if(L_ROBRM[3]>L_ROBRM[4]){pc=100002;continue L;}
if((!QHERE(L_ROBRM,3,RM,RM_))){pc=100;continue L;}
if(((((C_OBJCTS[L_ROBRM[3]+1540]<=0)||(ZAND(C_OBJCTS,L_ROBRM[3]+1100,C_OFLAGS,18)!=0))||(ZAND(C_OBJCTS,L_ROBRM[3]+880,C_OFLAGS,0)==0))||(!PROB(PR,PR_,PR,PR_)))){pc=50;continue L;}
NEWSTA(L_ROBRM,3,[0],0,NR,NR_,NC,NC_,NA,NA_);
L_ROBRM[2]=(L_ROBRM[2]+1);
C_OBJCTS[L_ROBRM[3]+1100]=ZOR(C_OBJCTS,L_ROBRM[3]+1100,C_OFLAGS,29);
pc=100;continue L;
case 50:
if((ZAND(C_OBJCTS,L_ROBRM[3]+1100,C_OFLAGS,21)!=0)){L_ROBRM[2]=(L_ROBRM[2]+ROBADV([OACTOR(L_ROBRM,3)],0,NR,NR_,NC,NC_,NA,NA_));}
case 100:
L_ROBRM[3]+=1;pc=100001;continue L;
case 100002:
return L_ROBRM[2];
return L_ROBRM[2];
}}
/* dso.f */
function WINNIN(VL,VL_,HR,HR_){
L_WINNIN[2]=C_OBJCTS[VL[VL_]+1980];
L_WINNIN[3]=(L_WINNIN[2]-FIGHTS(HR,HR_,[1],0));
L_WINNIN[1]=PROB([90],0,[100],0);
if((L_WINNIN[3]>3)){return L_WINNIN[1];}
L_WINNIN[1]=PROB([75],0,[85],0);
if((L_WINNIN[3]>0)){return L_WINNIN[1];}
L_WINNIN[1]=PROB([50],0,[30],0);
if((L_WINNIN[3]==0)){return L_WINNIN[1];}
L_WINNIN[1]=PROB([25],0,[25],0);
if((L_WINNIN[2]>1)){return L_WINNIN[1];}
L_WINNIN[1]=PROB([10],0,[0],0);
return L_WINNIN[1];
return L_WINNIN[1];
}
/* dso.f */
function FIGHTS(H,H_,FLG,FLG_){
L_FIGHTS[0]=((L_FIGHTS[1]+DIV((Math.imul((L_FIGHTS[2]-L_FIGHTS[1]),C_ADVS[H[H_]+4])+DIV(C_STATE[3],2)),C_STATE[3])))|0;
if(FLG[FLG_]){L_FIGHTS[0]=(L_FIGHTS[0]+C_ADVS[H[H_]+20]);}
return L_FIGHTS[0];
return L_FIGHTS[0];
}
/* dso.f */
function VILSTR(V,V_){
var pc=0;L:for(;;)switch(pc){case 0:
L_VILSTR[0]=C_OBJCTS[V[V_]+1980];
if((L_VILSTR[0]<=0)){return L_VILSTR[0];}
if(((V[V_]!=C_OINDEX[39])||(!C_FINDEX[34]))){pc=100;continue L;}
C_FINDEX[34]=0;
L_VILSTR[0]=Math.min(L_VILSTR[0],2);
case 100:
L_VILSTR[1]=1;L_VILSTR[2]=C_VILL[0];
case 100001:
if(L_VILSTR[1]>L_VILSTR[2]){pc=100002;continue L;}
if(((C_VILL[L_VILSTR[1]]==V[V_])&&(C_PRSVEC[1]==C_VILL[L_VILSTR[1]+12]))){L_VILSTR[0]=Math.max(1,(L_VILSTR[0]-1));}
case 200:
L_VILSTR[1]+=1;pc=100001;continue L;
case 100002:
return L_VILSTR[0];
return L_VILSTR[0];
}}
/* dso.f */
function GTTIME(T,T_){
ITIME(L_GTTIME,0,L_GTTIME,1,L_GTTIME,2);
T[T_]=(((Math.imul(L_GTTIME[0],60)+L_GTTIME[1])-(Math.imul(C_TIME[1],60)+C_TIME[2])))|0;
if((T[T_]<0)){T[T_]=(T[T_]+1440);}
T[T_]=(T[T_]+C_TIME[0]);
return;
return;
}
/* dso.f */
function OPNCLS(OBJ,OBJ_,SO,SO_,SC,SC_){
function SF_OPNCLS_QOPEN(O){return (ZAND(C_OBJCTS,O+1100,C_OFLAGS,28)!=0)}
var pc=0;L:for(;;)switch(pc){case 0:
L_OPNCLS[1]=1;
if((C_PRSVEC[0]==C_VINDEX[34])){pc=100;continue L;}
if((C_PRSVEC[0]==C_VINDEX[33])){pc=50;continue L;}
L_OPNCLS[1]=0;
return L_OPNCLS[1];
case 50:
if(SF_OPNCLS_QOPEN(OBJ[OBJ_])){pc=200;continue L;}
RSPEAK(SO,SO_);
C_OBJCTS[OBJ[OBJ_]+1100]=ZOR(C_OBJCTS,OBJ[OBJ_]+1100,C_OFLAGS,28);
return L_OPNCLS[1];
case 100:
if((!SF_OPNCLS_QOPEN(OBJ[OBJ_]))){pc=200;continue L;}
RSPEAK(SC,SC_);
C_OBJCTS[OBJ[OBJ_]+1100]=ZAND(C_OBJCTS,OBJ[OBJ_]+1100,[ZNOT(C_OFLAGS,28)],0);
return L_OPNCLS[1];
case 200:
RSPEAK([(125+ZRND([3],0))],0);
return L_OPNCLS[1];
return L_OPNCLS[1];
}}
/* dso.f */
function LIT(RM,RM_){
var pc=0;L:for(;;)switch(pc){case 0:
L_LIT[1]=1;
if((ZAND(C_ROOMS,RM[RM_]+801,C_RFLAG,1)!=0)){return L_LIT[1];}
L_LIT[2]=1;L_LIT[3]=C_OBJCTS[0];
case 100001:
if(L_LIT[2]>L_LIT[3]){pc=100002;continue L;}
if(QHERE(L_LIT,2,RM,RM_)){pc=100;continue L;}
L_LIT[4]=C_OBJCTS[L_LIT[2]+2420];
if((L_LIT[4]<=0)){pc=1000;continue L;}
if((C_ADVS[L_LIT[4]]!=RM[RM_])){pc=1000;continue L;}
case 100:
if((ZAND(C_OBJCTS,L_LIT[2]+880,C_OFLAGS,15)!=0)){return L_LIT[1];}
if(((ZAND(C_OBJCTS,L_LIT[2]+880,C_OFLAGS,0)==0)||((ZAND(C_OBJCTS,L_LIT[2]+880,C_OFLAGS,4)==0)&&(ZAND(C_OBJCTS,L_LIT[2]+1100,C_OFLAGS,28)==0)))){pc=1000;continue L;}
L_LIT[5]=1;L_LIT[6]=C_OBJCTS[0];
case 100003:
if(L_LIT[5]>L_LIT[6]){pc=100004;continue L;}
if(((C_OBJCTS[L_LIT[5]+2640]==L_LIT[2])&&(ZAND(C_OBJCTS,L_LIT[5]+880,C_OFLAGS,15)!=0))){return L_LIT[1];}
case 500:
L_LIT[5]+=1;pc=100003;continue L;
case 100004:
case 1000:
L_LIT[2]+=1;pc=100001;continue L;
case 100002:
L_LIT[1]=0;
return L_LIT[1];
return L_LIT[1];
}}
/* dso.f */
function WEIGHT(RM,RM_,CN,CN_,AD,AD_){
var pc=0;L:for(;;)switch(pc){case 0:
L_WEIGHT[1]=0;
L_WEIGHT[2]=1;L_WEIGHT[3]=C_OBJCTS[0];
case 100001:
if(L_WEIGHT[2]>L_WEIGHT[3]){pc=100002;continue L;}
if((C_OBJCTS[L_WEIGHT[2]+1760]>=10000)){pc=100;continue L;}
if(((QHERE(L_WEIGHT,2,RM,RM_)&&(RM[RM_]!=0))||((C_OBJCTS[L_WEIGHT[2]+2420]==AD[AD_])&&(AD[AD_]!=0)))){pc=50;continue L;}
L_WEIGHT[4]=L_WEIGHT[2];
case 25:
L_WEIGHT[4]=C_OBJCTS[L_WEIGHT[4]+2640];
if((L_WEIGHT[4]==0)){pc=100;continue L;}
if((L_WEIGHT[4]!=CN[CN_])){pc=25;continue L;}
case 50:
L_WEIGHT[1]=(L_WEIGHT[1]+C_OBJCTS[L_WEIGHT[2]+1760]);
case 100:
L_WEIGHT[2]+=1;pc=100001;continue L;
case 100002:
return L_WEIGHT[1];
return L_WEIGHT[1];
}}
/* dso.f */
function GHERE(OBJ,OBJ_,RM,RM_){
var pc=0;L:for(;;)switch(pc){case 0:
L_GHERE[0]=1;
pc=[1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,2000,3000,4000,5000,5000,5000,6000,7000,8000,9000,9100,8000,10000,11000][(OBJ[OBJ_]-C_STAR[1])-1];if(pc!==undefined)continue L;
BUG([60],0,OBJ,OBJ_);
case 1000:
return L_GHERE[0];
case 2000:
L_GHERE[0]=((((RM[RM_]>=C_RINDEX[7])&&(RM[RM_]<C_RINDEX[9]))||(RM[RM_]==C_RINDEX[54])))?1:0;
return L_GHERE[0];
case 3000:
L_GHERE[0]=((((RM[RM_]>=C_RINDEX[7])&&(RM[RM_]<C_RINDEX[9]))&&(RM[RM_]!=C_RINDEX[8])))?1:0;
return L_GHERE[0];
case 4000:
L_GHERE[0]=((((RM[RM_]>=C_RINDEX[56])&&(RM[RM_]<=C_RINDEX[59]))||(RM[RM_]==C_RINDEX[85])))?1:0;
return L_GHERE[0];
case 5000:
L_GHERE[0]=((((RM[RM_]>=C_RINDEX[56])&&(RM[RM_]<C_RINDEX[59]))||(RM[RM_]==C_RINDEX[85])))?1:0;
return L_GHERE[0];
case 6000:
L_GHERE[0]=((ZAND(C_ROOMS,RM[RM_]+801,[(C_RFLAG[3]+C_RFLAG[6])],0)!=0))?1:0;
return L_GHERE[0];
case 7000:
L_GHERE[0]=(((((RM[RM_]>=C_RINDEX[66])&&(RM[RM_]<=C_RINDEX[68]))||((RM[RM_]>=C_RINDEX[71])&&(RM[RM_]<=C_RINDEX[75])))||(RM[RM_]==C_RINDEX[76])))?1:0;
return L_GHERE[0];
case 8000:
L_GHERE[0]=((((RM[RM_]>=C_RINDEX[64])&&(RM[RM_]<=C_RINDEX[68]))||(RM[RM_]==C_RINDEX[76])))?1:0;
return L_GHERE[0];
case 9100:
if((RM[RM_]==C_RINDEX[69])){return L_GHERE[0];}
case 9000:
L_GHERE[0]=((((RM[RM_]>=C_RINDEX[64])&&(RM[RM_]<=C_RINDEX[66]))||((RM[RM_]>=C_RINDEX[70])&&(RM[RM_]<=C_RINDEX[72]))))?1:0;
return L_GHERE[0];
case 10000:
L_GHERE[0]=(((((RM[RM_]==C_RINDEX[69])||(RM[RM_]==C_RINDEX[78]))||(RM[RM_]==C_RINDEX[79]))||(RM[RM_]==C_RINDEX[80])))?1:0;
return L_GHERE[0];
case 11000:
L_GHERE[0]=((RM[RM_]==C_RINDEX[85]))?1:0;
return L_GHERE[0];
return L_GHERE[0];
}}
/* dso.f */
function MRHERE(RM,RM_){
var pc=0;L:for(;;)switch(pc){case 0:
if(((RM[RM_]<C_RINDEX[70])||(RM[RM_]>C_RINDEX[75]))){pc=100;continue L;}
L_MRHERE[0]=1;
if((((RM[RM_]-C_RINDEX[70])%2)==DIV(C_FINDEX[57],180))){L_MRHERE[0]=2;}
return L_MRHERE[0];
case 100:
L_MRHERE[0]=0;
if(((Math.abs((C_FINDEX[58]-RM[RM_]))!=1)||((C_FINDEX[57]%180)==0))){return L_MRHERE[0];}
L_MRHERE[0]=1;
if((((RM[RM_]<C_FINDEX[58])&&(C_FINDEX[57]<180))||((RM[RM_]>C_FINDEX[58])&&(C_FINDEX[57]>180)))){L_MRHERE[0]=2;}
return L_MRHERE[0];
return L_MRHERE[0];
}}
/* dso.f */
function ENCRYP(INW,INW_,OUTW,OUTW_){
var pc=0;L:for(;;)switch(pc){case 0:
L_ENCRYP[18]=0;
L_ENCRYP[19]=0;
L_ENCRYP[20]=1;
L_ENCRYP[21]=1;L_ENCRYP[22]=6;
case 100001:
if(L_ENCRYP[21]>L_ENCRYP[22]){pc=100002;continue L;}
L_ENCRYP[L_ENCRYP[21]+11]=String.fromCharCode((ICHAR(L_ENCRYP[L_ENCRYP[21]-1])-64));
if((ICHAR(INW[INW_+L_ENCRYP[20]-1])<=64)){L_ENCRYP[20]=1;}
L_ENCRYP[L_ENCRYP[21]+5]=String.fromCharCode((ICHAR(INW[INW_+L_ENCRYP[20]-1])-64));
L_ENCRYP[19]=(L_ENCRYP[19]+ICHAR(L_ENCRYP[L_ENCRYP[21]+11]));
L_ENCRYP[18]=(L_ENCRYP[18]+ICHAR(L_ENCRYP[L_ENCRYP[21]+5]));
L_ENCRYP[20]=(L_ENCRYP[20]+1);
case 100:
L_ENCRYP[21]+=1;pc=100001;continue L;
case 100002:
L_ENCRYP[23]=(((L_ENCRYP[18]%8)+Math.imul(8,(L_ENCRYP[19]%8))))|0;
L_ENCRYP[21]=1;L_ENCRYP[24]=6;
case 100003:
if(L_ENCRYP[21]>L_ENCRYP[24]){pc=100004;continue L;}
L_ENCRYP[20]=ZAND([ZXOR([ZXOR([ICHAR(L_ENCRYP[L_ENCRYP[21]+5])],0,[ICHAR(L_ENCRYP[L_ENCRYP[21]+11])],0)],0,L_ENCRYP,23)],0,[31],0);
L_ENCRYP[23]=((L_ENCRYP[23]+1)%32);
if((L_ENCRYP[20]>26)){L_ENCRYP[20]=(L_ENCRYP[20]%26);}
OUTW[OUTW_+L_ENCRYP[21]-1]=String.fromCharCode((Math.max(1,L_ENCRYP[20])+64));
case 200:
L_ENCRYP[21]+=1;pc=100003;continue L;
case 100004:
return;
return;
}}
/* dso.f */
function CPGOTO(ST,ST_){
var pc=0;L:for(;;)switch(pc){case 0:
C_ROOMS[C_RINDEX[85]+801]=ZAND(C_ROOMS,C_RINDEX[85]+801,[ZNOT(C_RFLAG,0)],0);
L_CPGOTO[0]=1;L_CPGOTO[1]=C_OBJCTS[0];
case 100001:
if(L_CPGOTO[0]>L_CPGOTO[1]){pc=100002;continue L;}
if(((C_OBJCTS[L_CPGOTO[0]+2200]==C_RINDEX[85])&&(ZAND(C_OBJCTS,L_CPGOTO[0]+1100,[(C_OFLAGS[21]+C_OFLAGS[24])],0)==0))){NEWSTA(L_CPGOTO,0,[0],0,[Math.imul(C_FINDEX[67],C_HYPER[0])],0,[0],0,[0],0);}
if((C_OBJCTS[L_CPGOTO[0]+2200]==Math.imul(ST[ST_],C_HYPER[0]))){NEWSTA(L_CPGOTO,0,[0],0,C_RINDEX,85,[0],0,[0],0);}
case 100:
L_CPGOTO[0]+=1;pc=100001;continue L;
case 100002:
C_FINDEX[67]=ST[ST_];
return;
return;
}}
/* dso.f */
function CPINFO(RMK,RMK_,ST,ST_){
var pc=0;L:for(;;)switch(pc){case 0:
RSPEAK(RMK,RMK_);
L_CPINFO[22]=1;L_CPINFO[23]=8;
case 100001:
if(L_CPINFO[22]>L_CPINFO[23]){pc=100002;continue L;}
L_CPINFO[24]=L_CPINFO[L_CPINFO[22]-1];
L_CPINFO[L_CPINFO[22]+7]=L_CPINFO[(C_PUZZLE[(ST[ST_]+L_CPINFO[24])+23]+4)+15];
if(((Math.abs(L_CPINFO[24])==1)||(Math.abs(L_CPINFO[24])==8))){pc=100;continue L;}
L_CPINFO[25]=8;
if((L_CPINFO[24]<0)){L_CPINFO[25]=(-8);}
L_CPINFO[26]=(L_CPINFO[24]-L_CPINFO[25]);
if(((C_PUZZLE[(ST[ST_]+L_CPINFO[25])+23]!=0)&&(C_PUZZLE[(ST[ST_]+L_CPINFO[26])+23]!=0))){L_CPINFO[L_CPINFO[22]+7]=L_CPINFO[21];}
case 100:
L_CPINFO[22]+=1;pc=100001;continue L;
case 100002:
var W=WSTART("'       |',A2,1X,A2,1X,A2,'|'/,                          ' West  |',A2,' .. ',A2,'|  East',/                              '       |',A2,1X,A2,1X,A2,'|'");for(var ii=0;ii<8;ii++){W.put(L_CPINFO[8+ii]);}W.end();
if((ST[ST_]==10)){RSPEAK([870],0);}
if((ST[ST_]==37)){RSPEAK([871],0);}
L_CPINFO[22]=872;
if(C_FINDEX[44]){L_CPINFO[22]=873;}
if((ST[ST_]==52)){RSPEAK(L_CPINFO,22);}
if((C_PUZZLE[(ST[ST_]+1)+23]==(-2))){RSPEAK([874],0);}
if((C_PUZZLE[(ST[ST_]-1)+23]==(-3))){RSPEAK([875],0);}
return;
return;
}}
/* dsub.f */
function RSPEAK(N,N_){
RSPSB2(N,N_,[0],0,[0],0);
return;
return;
}
/* dsub.f */
function RSPSUB(N,N_,S1,S1_){
RSPSB2(N,N_,S1,S1_,[0],0);
return;
return;
}
/* dsub.f */
function RSPSB2(A,A_,B,B_,C,C_){
var pc=0;L:for(;;)switch(pc){case 0:
L_RSPSB2[148]=A[A_];
L_RSPSB2[149]=B[B_];
L_RSPSB2[150]=C[C_];
if((L_RSPSB2[148]>0)){L_RSPSB2[148]=C_RMSG[L_RSPSB2[148]];}
if((L_RSPSB2[149]>0)){L_RSPSB2[149]=C_RMSG[L_RSPSB2[149]];}
if((L_RSPSB2[150]>0)){L_RSPSB2[150]=C_RMSG[L_RSPSB2[150]];}
L_RSPSB2[148]=Math.abs(L_RSPSB2[148]);
L_RSPSB2[149]=Math.abs(L_RSPSB2[149]);
L_RSPSB2[150]=Math.abs(L_RSPSB2[150]);
if((L_RSPSB2[148]==0)){return;}
C_PLAY[2]=1;
var R=DBREC(L_RSPSB2[148]);L_RSPSB2[151]=R();for(var ii=0;ii<74;ii++){L_RSPSB2[0+ii]=R();}
case 100:
L_RSPSB2[152]=1;L_RSPSB2[153]=74;
case 100001:
if(L_RSPSB2[152]>L_RSPSB2[153]){pc=100002;continue L;}
L_RSPSB2[L_RSPSB2[152]-1]=String.fromCharCode(ZXOR([ICHAR(L_RSPSB2[L_RSPSB2[152]-1])],0,[10],0));
case 150:
L_RSPSB2[152]+=1;pc=100001;continue L;
case 100002:
case 200:
if((L_RSPSB2[149]==0)){pc=400;continue L;}
L_RSPSB2[152]=1;L_RSPSB2[154]=74;
case 100003:
if(L_RSPSB2[152]>L_RSPSB2[154]){pc=100004;continue L;}
if((L_RSPSB2[L_RSPSB2[152]-1]=="#")){pc=1000;continue L;}
case 300:
L_RSPSB2[152]+=1;pc=100003;continue L;
case 100004:
case 400:
L_RSPSB2[152]=74;L_RSPSB2[155]=1;
case 100005:
if(L_RSPSB2[152]<L_RSPSB2[155]){pc=100006;continue L;}
if((L_RSPSB2[L_RSPSB2[152]-1]!=" ")){pc=600;continue L;}
case 500:
L_RSPSB2[152]+=(-1);pc=100005;continue L;
case 100006:
case 600:
var W=WSTART("1X,74A1");for(L_RSPSB2[156]=1;L_RSPSB2[156]<=L_RSPSB2[152];L_RSPSB2[156]++){W.put(L_RSPSB2[L_RSPSB2[156]-1]);}W.end();
L_RSPSB2[148]=(L_RSPSB2[148]+1);
var R=DBREC(L_RSPSB2[148]);L_RSPSB2[157]=R();for(var ii=0;ii<74;ii++){L_RSPSB2[0+ii]=R();}
if((L_RSPSB2[151]==L_RSPSB2[157])){pc=100;continue L;}
return;
case 1000:
L_RSPSB2[158]=1;
L_RSPSB2[159]=(L_RSPSB2[152]+1);L_RSPSB2[160]=74;
case 100007:
if(L_RSPSB2[159]>L_RSPSB2[160]){pc=100008;continue L;}
L_RSPSB2[L_RSPSB2[158]+73]=L_RSPSB2[L_RSPSB2[159]-1];
L_RSPSB2[158]=(L_RSPSB2[158]+1);
case 1100:
L_RSPSB2[159]+=1;pc=100007;continue L;
case 100008:
var R=DBREC(L_RSPSB2[149]);L_RSPSB2[156]=R();for(L_RSPSB2[159]=L_RSPSB2[152];L_RSPSB2[159]<=74;L_RSPSB2[159]++){L_RSPSB2[L_RSPSB2[159]-1]=R();}
L_RSPSB2[159]=L_RSPSB2[152];L_RSPSB2[161]=74;
case 100009:
if(L_RSPSB2[159]>L_RSPSB2[161]){pc=100010;continue L;}
L_RSPSB2[L_RSPSB2[159]-1]=String.fromCharCode(ZXOR([ICHAR(L_RSPSB2[L_RSPSB2[159]-1])],0,[10],0));
case 1150:
L_RSPSB2[159]+=1;pc=100009;continue L;
case 100010:
L_RSPSB2[156]=74;L_RSPSB2[162]=1;
case 100011:
if(L_RSPSB2[156]<L_RSPSB2[162]){pc=100012;continue L;}
if((L_RSPSB2[L_RSPSB2[156]-1]!=" ")){pc=1300;continue L;}
case 1200:
L_RSPSB2[156]+=(-1);pc=100011;continue L;
case 100012:
case 1300:
L_RSPSB2[159]=1;
L_RSPSB2[158]=(L_RSPSB2[156]+1);L_RSPSB2[163]=74;
case 100013:
if(L_RSPSB2[158]>L_RSPSB2[163]){pc=100014;continue L;}
L_RSPSB2[L_RSPSB2[158]-1]=L_RSPSB2[L_RSPSB2[159]+73];
L_RSPSB2[159]=(L_RSPSB2[159]+1);
case 1400:
L_RSPSB2[158]+=1;pc=100013;continue L;
case 100014:
L_RSPSB2[149]=L_RSPSB2[150];
L_RSPSB2[150]=0;
pc=200;continue L;
return;
}}
/* dsub.f */
function* OBJACT(){
var pc=0;L:for(;;)switch(pc){case 0:
L_OBJACT[1]=1;
if((C_PRSVEC[1]==0)){pc=100;continue L;}
if((yield* OAPPLI(C_OBJCTS,C_PRSVEC[1]+660,[0],0))){return L_OBJACT[1];}
case 100:
if((C_PRSVEC[2]==0)){pc=200;continue L;}
if((yield* OAPPLI(C_OBJCTS,C_PRSVEC[2]+660,[0],0))){return L_OBJACT[1];}
case 200:
L_OBJACT[1]=0;
return L_OBJACT[1];
return L_OBJACT[1];
}}
/* dsub.f */
function BUG(A,A_,B,B_){
var W=WSTART("' PROGRAM ERROR ',I2,', PARAMETER=',I6");W.put(A[A_]);W.put(B[B_]);W.end();
if((C_DEBUG[0]!=0)){return;}
EXIT();
return;
}
/* dsub.f */
function NEWSTA(O,O_,R,R_,RM,RM_,CN,CN_,AD,AD_){
RSPEAK(R,R_);
C_OBJCTS[O[O_]+2200]=RM[RM_];
C_OBJCTS[O[O_]+2640]=CN[CN_];
C_OBJCTS[O[O_]+2420]=AD[AD_];
return;
return;
}
/* dsub.f */
function QHERE(OBJ,OBJ_,RM,RM_){
var pc=0;L:for(;;)switch(pc){case 0:
L_QHERE[0]=1;
if((C_OBJCTS[OBJ[OBJ_]+2200]==RM[RM_])){return L_QHERE[0];}
L_QHERE[1]=1;L_QHERE[2]=C_OROOM2[0];
case 100001:
if(L_QHERE[1]>L_QHERE[2]){pc=100002;continue L;}
if(((C_OROOM2[L_QHERE[1]]==OBJ[OBJ_])&&(C_OROOM2[L_QHERE[1]+20]==RM[RM_]))){return L_QHERE[0];}
case 100:
L_QHERE[1]+=1;pc=100001;continue L;
case 100002:
L_QHERE[0]=0;
return L_QHERE[0];
return L_QHERE[0];
}}
/* dsub.f */
function QEMPTY(OBJ,OBJ_){
var pc=0;L:for(;;)switch(pc){case 0:
L_QEMPTY[0]=0;
L_QEMPTY[1]=1;L_QEMPTY[2]=C_OBJCTS[0];
case 100001:
if(L_QEMPTY[1]>L_QEMPTY[2]){pc=100002;continue L;}
if((C_OBJCTS[L_QEMPTY[1]+2640]==OBJ[OBJ_])){return L_QEMPTY[0];}
case 100:
L_QEMPTY[1]+=1;pc=100001;continue L;
case 100002:
L_QEMPTY[0]=1;
return L_QEMPTY[0];
return L_QEMPTY[0];
}}
/* dsub.f */
function* JIGSUP(DESC,DESC_){
var pc=0;L:for(;;)switch(pc){case 0:
RSPEAK(DESC,DESC_);
C_PRSVEC[4]=1;
if((C_DEBUG[0]!=0)){return;}
C_ADVS[C_PLAY[0]+8]=0;
if((C_PLAY[0]==C_AINDEX[0])){pc=100;continue L;}
RSPSUB([432],0,C_OBJCTS,C_ADVS[C_PLAY[0]+12]+220);
NEWSTA(C_ADVS,C_PLAY[0]+12,[0],0,[0],0,[0],0,[0],0);
return;
case 100:
if(C_FINDEX[32]){pc=900;continue L;}
if((C_STATE[1]>=2)){pc=1000;continue L;}
if((!(yield* YESNO([10],0,[9],0,[8],0)))){pc=1100;continue L;}
L_JIGSUP[13]=1;L_JIGSUP[14]=C_OBJCTS[0];
case 100001:
if(L_JIGSUP[13]>L_JIGSUP[14]){pc=100002;continue L;}
if(QHERE(L_JIGSUP,13,C_PLAY,1)){C_OBJCTS[L_JIGSUP[13]+1100]=ZAND(C_OBJCTS,L_JIGSUP[13]+1100,[ZNOT(C_OFLAGS,23)],0);}
case 50:
L_JIGSUP[13]+=1;pc=100001;continue L;
case 100002:
C_STATE[1]=(C_STATE[1]+1);
SCRUPD([(-10)],0);
L_JIGSUP[3]=MOVETO(C_RINDEX,7,C_PLAY,0);
C_FINDEX[18]=1;
if((C_OBJCTS[C_OINDEX[22]+2420]==C_PLAY[0])){NEWSTA(C_OINDEX,22,[0],0,C_RINDEX,12,[0],0,[0],0);}
C_OBJCTS[C_OINDEX[43]+1100]=ZAND(C_OBJCTS,C_OINDEX[43]+1100,[ZNOT(C_OFLAGS,29)],0);
C_OBJCTS[C_OINDEX[84]+880]=ZAND([ZOR(C_OBJCTS,C_OINDEX[84]+880,C_OFLAGS,0)],0,[ZNOT(C_OFLAGS,6)],0);
if(((C_OBJCTS[C_OINDEX[12]+2200]!=0)||(C_OBJCTS[C_OINDEX[12]+2420]==C_PLAY[0]))){NEWSTA(C_OINDEX,12,[0],0,C_RINDEX,1,[0],0,[0],0);}
L_JIGSUP[15]=1;
L_JIGSUP[13]=1;L_JIGSUP[16]=C_OBJCTS[0];
case 100003:
if(L_JIGSUP[13]>L_JIGSUP[16]){pc=100004;continue L;}
if(((C_OBJCTS[L_JIGSUP[13]+2420]!=C_PLAY[0])||(C_OBJCTS[L_JIGSUP[13]+1540]!=0))){pc=200;continue L;}
L_JIGSUP[15]=(L_JIGSUP[15]+1);
if((L_JIGSUP[15]>9)){pc=400;continue L;}
NEWSTA(L_JIGSUP,13,[0],0,L_JIGSUP,L_JIGSUP[15]+3,[0],0,[0],0);
case 200:
L_JIGSUP[13]+=1;pc=100003;continue L;
case 100004:
case 400:
L_JIGSUP[15]=(C_ROOMS[0]+1);
L_JIGSUP[17]=(((C_RFLAG[4]+C_RFLAG[3])+C_RFLAG[5])+C_RFLAG[11]);
L_JIGSUP[13]=1;L_JIGSUP[18]=C_OBJCTS[0];
case 100005:
if(L_JIGSUP[13]>L_JIGSUP[18]){pc=100006;continue L;}
if(((C_OBJCTS[L_JIGSUP[13]+2420]!=C_PLAY[0])||(C_OBJCTS[L_JIGSUP[13]+1540]==0))){pc=300;continue L;}
case 250:
L_JIGSUP[15]=(L_JIGSUP[15]-1);
if((ZAND(C_ROOMS,L_JIGSUP[15]+801,L_JIGSUP,17)!=0)){pc=250;continue L;}
NEWSTA(L_JIGSUP,13,[0],0,L_JIGSUP,15,[0],0,[0],0);
case 300:
L_JIGSUP[13]+=1;pc=100005;continue L;
case 100006:
L_JIGSUP[13]=1;L_JIGSUP[19]=C_OBJCTS[0];
case 100007:
if(L_JIGSUP[13]>L_JIGSUP[19]){pc=100008;continue L;}
if((C_OBJCTS[L_JIGSUP[13]+2420]!=C_PLAY[0])){pc=500;continue L;}
case 450:
L_JIGSUP[15]=(L_JIGSUP[15]-1);
if((ZAND(C_ROOMS,L_JIGSUP[15]+801,L_JIGSUP,17)!=0)){pc=450;continue L;}
NEWSTA(L_JIGSUP,13,[0],0,L_JIGSUP,15,[0],0,[0],0);
case 500:
L_JIGSUP[13]+=1;pc=100007;continue L;
case 100008:
return;
case 900:
RSPEAK([625],0);
pc=1100;continue L;
case 1000:
RSPEAK([7],0);
case 1100:
SCORE([0],0);
ICLOSE("DBCH");
EXIT();
return;
}}
/* dsub.f */
function OACTOR(OBJ,OBJ_){
var pc=0;L:for(;;)switch(pc){case 0:
L_OACTOR[1]=1;L_OACTOR[2]=C_ADVS[0];
case 100001:
if(L_OACTOR[1]>L_OACTOR[2]){pc=100002;continue L;}
L_OACTOR[0]=L_OACTOR[1];
if((C_ADVS[L_OACTOR[1]+12]==OBJ[OBJ_])){return L_OACTOR[0];}
case 100:
L_OACTOR[1]+=1;pc=100001;continue L;
case 100002:
BUG([40],0,OBJ,OBJ_);
return L_OACTOR[0];
return L_OACTOR[0];
}}
/* dsub.f */
function PROB(G,G_,B,B_){
L_PROB[1]=G[G_];
if(C_FINDEX[33]){L_PROB[1]=B[B_];}
L_PROB[0]=((ZRND([100],0)<L_PROB[1]))?1:0;
return L_PROB[0];
return L_PROB[0];
}
/* dsub.f */
function* RMDESC(FULL,FULL_){
var pc=0;L:for(;;)switch(pc){case 0:
L_RMDESC[3]=1;
if((C_PRSVEC[2]<C_XSRCH[0])){pc=50;continue L;}
C_SCREEN[0]=C_PRSVEC[2];
C_PRSVEC[2]=0;
case 50:
if((C_PLAY[1]==C_ADVS[C_AINDEX[0]])){pc=100;continue L;}
RSPEAK([2],0);
C_PRSVEC[0]=C_VINDEX[5];
return L_RMDESC[3];
case 100:
if(LIT(C_PLAY,1)){pc=300;continue L;}
RSPEAK([430],0);
L_RMDESC[3]=0;
return L_RMDESC[3];
case 300:
L_RMDESC[4]=C_ROOMS[C_PLAY[1]+401];
if((FULL[FULL_]==1)){pc=600;continue L;}
L_RMDESC[5]=(C_ROOMS[1]-C_PLAY[1]);
if(((FULL[FULL_]==0)&&(C_FINDEX[22]||((ZAND(C_ROOMS,C_PLAY[1]+801,C_RFLAG,0)!=0)&&(C_FINDEX[21]||PROB([80],0,[80],0)))))){pc=400;continue L;}
L_RMDESC[5]=C_ROOMS[C_PLAY[1]+1];
if(((L_RMDESC[5]!=0)||(L_RMDESC[4]==0))){pc=400;continue L;}
C_PRSVEC[0]=C_VINDEX[27];
if((!(yield* RAPPLI(L_RMDESC,4)))){pc=100;continue L;}
C_PRSVEC[0]=C_VINDEX[7];
pc=500;continue L;
case 400:
RSPEAK(L_RMDESC,5);
case 500:
if((C_ADVS[C_PLAY[0]+8]!=0)){RSPSUB([431],0,C_OBJCTS,C_ADVS[C_PLAY[0]+8]+220);}
case 600:
if((FULL[FULL_]!=2)){PRINCR([+(FULL[FULL_]!=0)],0,C_PLAY,1);}
C_ROOMS[C_PLAY[1]+801]=ZOR(C_ROOMS,C_PLAY[1]+801,C_RFLAG,0);
if(((FULL[FULL_]!=0)||(L_RMDESC[4]==0))){return L_RMDESC[3];}
C_PRSVEC[0]=C_VINDEX[5];
if((!(yield* RAPPLI(L_RMDESC,4)))){pc=100;continue L;}
C_PRSVEC[0]=C_VINDEX[7];
return L_RMDESC[3];
return L_RMDESC[3];
}}
/* dsub.f */
function* RAPPLI(RI,RI_){
L_RAPPLI[2]=1;
if((RI[RI_]==0)){return L_RAPPLI[2];}
if((RI[RI_]<L_RAPPLI[3])){L_RAPPLI[2]=(yield* RAPPL1(RI,RI_));}
if((RI[RI_]>=L_RAPPLI[3])){L_RAPPLI[2]=(yield* RAPPL2(RI,RI_));}
return L_RAPPLI[2];
return L_RAPPLI[2];
}
/* dverb1.f */
function* TAKE(FLG,FLG_){
function SF_TAKE_QOPEN(O){return (ZAND(C_OBJCTS,O+1100,C_OFLAGS,28)!=0)}
var pc=0;L:for(;;)switch(pc){case 0:
L_TAKE[4]=0;
L_TAKE[5]=C_OBJCTS[C_PRSVEC[2]+660];
if((C_PRSVEC[2]<=C_STAR[1])){pc=100;continue L;}
L_TAKE[4]=(yield* OBJACT());
return L_TAKE[4];
case 100:
L_TAKE[6]=C_OBJCTS[C_PRSVEC[2]+2640];
if((C_PRSVEC[2]!=C_ADVS[C_PLAY[0]+8])){pc=400;continue L;}
RSPEAK([672],0);
return L_TAKE[4];
case 400:
if((ZAND(C_OBJCTS,C_PRSVEC[2]+880,C_OFLAGS,2)!=0)){pc=500;continue L;}
if((!(yield* OAPPLI(L_TAKE,5,[0],0)))){RSPEAK([(552+ZRND([5],0))],0);}
return L_TAKE[4];
case 500:
if(((L_TAKE[6]!=0)||QHERE(C_PRSVEC,2,C_PLAY,1))){pc=600;continue L;}
if((C_OBJCTS[C_PRSVEC[2]+2420]==C_PLAY[0])){RSPEAK([557],0);}
return L_TAKE[4];
case 600:
if((((L_TAKE[6]!=0)&&(C_OBJCTS[L_TAKE[6]+2420]==C_PLAY[0]))||((WEIGHT([0],0,C_PRSVEC,2,C_PLAY,0)+C_OBJCTS[C_PRSVEC[2]+1760])<=C_STATE[4]))){pc=700;continue L;}
RSPEAK([558],0);
return L_TAKE[4];
case 700:
L_TAKE[4]=1;
if((yield* OAPPLI(L_TAKE,5,[0],0))){return L_TAKE[4];}
NEWSTA(C_PRSVEC,2,[0],0,[0],0,[0],0,C_PLAY,0);
C_OBJCTS[C_PRSVEC[2]+1100]=ZOR(C_OBJCTS,C_PRSVEC[2]+1100,C_OFLAGS,29);
SCRUPD(C_OBJCTS,C_PRSVEC[2]+1320);
C_OBJCTS[C_PRSVEC[2]+1320]=0;
if(FLG[FLG_]){RSPEAK([559],0);}
return L_TAKE[4];
return L_TAKE[4];
}}
/* dverb1.f */
function* DROP(){
var pc=0;L:for(;;)switch(pc){case 0:
L_DROP[3]=1;
L_DROP[4]=C_OBJCTS[C_PRSVEC[2]+2640];
if((L_DROP[4]==0)){pc=200;continue L;}
if((C_OBJCTS[L_DROP[4]+2420]!=C_PLAY[0])){pc=1000;continue L;}
if((ZAND(C_OBJCTS,L_DROP[4]+1100,C_OFLAGS,28)!=0)){pc=300;continue L;}
RSPSUB([525],0,C_OBJCTS,L_DROP[4]+220);
return L_DROP[3];
case 200:
if((C_OBJCTS[C_PRSVEC[2]+2420]!=C_PLAY[0])){pc=1000;continue L;}
case 300:
if((C_ADVS[C_PLAY[0]+8]==0)){pc=400;continue L;}
C_PRSVEC[1]=C_ADVS[C_PLAY[0]+8];
L_DROP[0]=(yield* PUT());
C_PRSVEC[1]=0;
return L_DROP[3];
case 400:
NEWSTA(C_PRSVEC,2,[0],0,C_PLAY,1,[0],0,[0],0);
if((C_PLAY[1]==C_RINDEX[54])){NEWSTA(C_PRSVEC,2,[0],0,C_RINDEX,8,[0],0,[0],0);}
SCRUPD(C_OBJCTS,C_PRSVEC[2]+1320);
C_OBJCTS[C_PRSVEC[2]+1320]=0;
C_OBJCTS[C_PRSVEC[2]+1100]=ZOR(C_OBJCTS,C_PRSVEC[2]+1100,C_OFLAGS,29);
if((yield* OBJACT())){return L_DROP[3];}
L_DROP[5]=0;
if((C_PRSVEC[0]==C_VINDEX[53])){L_DROP[5]=528;}
if((C_PRSVEC[0]==C_VINDEX[56])){L_DROP[5]=529;}
if(((L_DROP[5]!=0)&&(C_PLAY[1]==C_RINDEX[54]))){L_DROP[5]=659;}
RSPSUB(L_DROP,5,C_OBJCTS,C_PRSVEC[2]+220);
return L_DROP[3];
case 1000:
RSPEAK([527],0);
return L_DROP[3];
return L_DROP[3];
}}
/* dverb1.f */
function* PUT(){
function SF_PUT_QOPEN(R){return (ZAND(C_OBJCTS,R+1100,C_OFLAGS,28)!=0)}
var pc=0;L:for(;;)switch(pc){case 0:
L_PUT[4]=0;
if(((C_PRSVEC[2]<=C_STAR[1])&&(C_PRSVEC[1]<=C_STAR[1]))){pc=200;continue L;}
if((!(yield* OBJACT()))){RSPEAK([560],0);}
L_PUT[4]=1;
return L_PUT[4];
case 200:
if(((SF_PUT_QOPEN(C_PRSVEC[1])||(ZAND(C_OBJCTS,C_PRSVEC[1]+880,[(C_OFLAGS[3]+C_OFLAGS[8])],0)!=0))||(ZAND(C_OBJCTS,C_PRSVEC[1]+1100,C_OFLAGS,30)!=0))){pc=300;continue L;}
RSPEAK([561],0);
return L_PUT[4];
case 300:
if(SF_PUT_QOPEN(C_PRSVEC[1])){pc=400;continue L;}
RSPEAK([562],0);
return L_PUT[4];
case 400:
if((C_PRSVEC[2]!=C_PRSVEC[1])){pc=500;continue L;}
RSPEAK([563],0);
return L_PUT[4];
case 500:
if((C_OBJCTS[C_PRSVEC[2]+2640]!=C_PRSVEC[1])){pc=600;continue L;}
RSPSB2([564],0,C_OBJCTS,C_PRSVEC[2]+220,C_OBJCTS,C_PRSVEC[1]+220);
L_PUT[4]=1;
return L_PUT[4];
case 600:
if((((WEIGHT([0],0,C_PRSVEC,2,[0],0)+WEIGHT([0],0,C_PRSVEC,1,[0],0))+C_OBJCTS[C_PRSVEC[2]+1760])<=C_OBJCTS[C_PRSVEC[1]+1980])){pc=700;continue L;}
RSPEAK([565],0);
return L_PUT[4];
case 700:
L_PUT[5]=C_PRSVEC[2];
case 725:
if(QHERE(L_PUT,5,C_PLAY,1)){pc=750;continue L;}
L_PUT[5]=C_OBJCTS[L_PUT[5]+2640];
if((L_PUT[5]!=0)){pc=725;continue L;}
pc=800;continue L;
case 750:
L_PUT[6]=C_PRSVEC[2];
L_PUT[7]=C_PRSVEC[1];
C_PRSVEC[0]=C_VINDEX[40];
C_PRSVEC[1]=0;
if((!(yield* TAKE([0],0)))){return L_PUT[4];}
C_PRSVEC[0]=C_VINDEX[52];
C_PRSVEC[2]=L_PUT[6];
C_PRSVEC[1]=L_PUT[7];
pc=1000;continue L;
case 800:
if((C_OBJCTS[C_PRSVEC[2]+2640]==0)){pc=1000;continue L;}
if(SF_PUT_QOPEN(C_OBJCTS[C_PRSVEC[2]+2640])){pc=900;continue L;}
RSPSUB([566],0,C_OBJCTS,C_PRSVEC[2]+220);
return L_PUT[4];
case 900:
SCRUPD(C_OBJCTS,C_PRSVEC[2]+1320);
C_OBJCTS[C_PRSVEC[2]+1320]=0;
C_OBJCTS[C_PRSVEC[2]+1100]=ZOR(C_OBJCTS,C_PRSVEC[2]+1100,C_OFLAGS,29);
NEWSTA(C_PRSVEC,2,[0],0,[0],0,[0],0,C_PLAY,0);
case 1000:
if((yield* OBJACT())){return L_PUT[4];}
NEWSTA(C_PRSVEC,2,[2],0,[0],0,C_PRSVEC,1,[0],0);
L_PUT[4]=1;
return L_PUT[4];
return L_PUT[4];
}}
/* dverb1.f */
function* VALUAC(V,V_){
function SF_VALUAC_NOTVAL(R){return ((L_VALUAC[9]==V[V_])&&(C_OBJCTS[R+1540]<=0))}
var pc=0;L:for(;;)switch(pc){case 0:
L_VALUAC[1]=1;
L_VALUAC[8]=579;
if((!LIT(C_PLAY,1))){pc=4000;continue L;}
L_VALUAC[8]=677;
L_VALUAC[9]=C_PRSVEC[2];
L_VALUAC[10]=C_PLAY[1];
case 100:
if((C_PRSVEC[0]!=C_VINDEX[40])){pc=1000;continue L;}
C_PRSVEC[2]=1;L_VALUAC[11]=C_OBJCTS[0];
case 100001:
if(C_PRSVEC[2]>L_VALUAC[11]){pc=100002;continue L;}
if(((((!QHERE(C_PRSVEC,2,C_PLAY,1))||(ZAND(C_OBJCTS,C_PRSVEC[2]+880,C_OFLAGS,0)==0))||(ZAND(C_OBJCTS,C_PRSVEC[2]+1100,C_OFLAGS,21)!=0))||SF_VALUAC_NOTVAL(C_PRSVEC[2]))){pc=500;continue L;}
if(((ZAND(C_OBJCTS,C_PRSVEC[2]+880,C_OFLAGS,2)==0)&&(ZAND(C_OBJCTS,C_PRSVEC[2]+1100,C_OFLAGS,26)==0))){pc=500;continue L;}
L_VALUAC[1]=0;
RSPSUB([580],0,C_OBJCTS,C_PRSVEC[2]+220);
L_VALUAC[2]=(yield* TAKE([1],0));
if((L_VALUAC[10]!=C_PLAY[1])){return;}
case 500:
C_PRSVEC[2]+=1;pc=100001;continue L;
case 100002:
pc=3000;continue L;
case 1000:
if((C_PRSVEC[0]!=C_VINDEX[53])){pc=2000;continue L;}
C_PRSVEC[2]=1;L_VALUAC[12]=C_OBJCTS[0];
case 100003:
if(C_PRSVEC[2]>L_VALUAC[12]){pc=100004;continue L;}
if(((C_OBJCTS[C_PRSVEC[2]+2420]!=C_PLAY[0])||SF_VALUAC_NOTVAL(C_PRSVEC[2]))){pc=1500;continue L;}
L_VALUAC[1]=0;
RSPSUB([580],0,C_OBJCTS,C_PRSVEC[2]+220);
L_VALUAC[2]=(yield* DROP());
if((L_VALUAC[10]!=C_PLAY[1])){return;}
case 1500:
C_PRSVEC[2]+=1;pc=100003;continue L;
case 100004:
pc=3000;continue L;
case 2000:
if((C_PRSVEC[0]!=C_VINDEX[52])){pc=3000;continue L;}
C_PRSVEC[2]=1;L_VALUAC[13]=C_OBJCTS[0];
case 100005:
if(C_PRSVEC[2]>L_VALUAC[13]){pc=100006;continue L;}
if(((((C_OBJCTS[C_PRSVEC[2]+2420]!=C_PLAY[0])||(C_PRSVEC[2]==C_PRSVEC[1]))||SF_VALUAC_NOTVAL(C_PRSVEC[2]))||(ZAND(C_OBJCTS,C_PRSVEC[2]+880,C_OFLAGS,0)==0))){pc=2500;continue L;}
L_VALUAC[1]=0;
RSPSUB([580],0,C_OBJCTS,C_PRSVEC[2]+220);
L_VALUAC[2]=(yield* PUT());
if((L_VALUAC[10]!=C_PLAY[1])){return;}
case 2500:
C_PRSVEC[2]+=1;pc=100005;continue L;
case 100006:
case 3000:
L_VALUAC[8]=581;
if((L_VALUAC[9]==V[V_])){L_VALUAC[8]=582;}
case 4000:
if(L_VALUAC[1]){RSPEAK(L_VALUAC,8);}
return;
return;
}}
/* dverb2.f */
function SAVEGM(){
var pc=0;L:for(;;)switch(pc){case 0:
C_PRSVEC[3]=0;
if(!IOPEN("DSAVE.DAT","UNKNOWN")){pc=100;continue L;}
GTTIME(L_SAVEGM,0);
SAVEPUT(C_VERS[0]);SAVEPUT(C_VERS[1]);SAVEPUT(C_VERS[2]);
SAVEPUT(C_PLAY[0]);SAVEPUT(C_PLAY[1]);SAVEPUT(C_HACK[0]);SAVEPUT(C_PLAY[2]);SAVEPUT(C_HACK[1]);SAVEPUT(C_HACK[2]);SAVEPUT(C_HACK[3]);SAVEPUT(C_HACK[4]);for(var ii=0;ii<64;ii++){SAVEPUT(C_PUZZLE[24+ii]);}
SAVEPUT(L_SAVEGM[0]);SAVEPUT(C_STATE[0]);SAVEPUT(C_STATE[1]);SAVEPUT(C_STATE[2]);SAVEPUT(C_STATE[9]);SAVEPUT(C_STATE[4]);SAVEPUT(C_STATE[5]);SAVEPUT(C_STATE[6]);SAVEPUT(C_STATE[7]);SAVEPUT(C_STATE[8]);SAVEPUT(C_SCREEN[0]);SAVEPUT(C_SCREEN[1]);SAVEPUT(C_SCREEN[2]);
for(var ii=0;ii<220;ii++){SAVEPUT(C_OBJCTS[1+ii]);}for(var ii=0;ii<220;ii++){SAVEPUT(C_OBJCTS[221+ii]);}for(var ii=0;ii<220;ii++){SAVEPUT(C_OBJCTS[881+ii]);}for(var ii=0;ii<220;ii++){SAVEPUT(C_OBJCTS[1101+ii]);}for(var ii=0;ii<220;ii++){SAVEPUT(C_OBJCTS[1321+ii]);}for(var ii=0;ii<220;ii++){SAVEPUT(C_OBJCTS[1541+ii]);}for(var ii=0;ii<220;ii++){SAVEPUT(C_OBJCTS[1761+ii]);}for(var ii=0;ii<220;ii++){SAVEPUT(C_OBJCTS[1981+ii]);}for(var ii=0;ii<220;ii++){SAVEPUT(C_OBJCTS[2201+ii]);}for(var ii=0;ii<220;ii++){SAVEPUT(C_OBJCTS[2421+ii]);}for(var ii=0;ii<220;ii++){SAVEPUT(C_OBJCTS[2641+ii]);}
for(var ii=0;ii<200;ii++){SAVEPUT(C_ROOMS[602+ii]);}for(var ii=0;ii<200;ii++){SAVEPUT(C_ROOMS[802+ii]);}
for(var ii=0;ii<4;ii++){SAVEPUT(C_ADVS[1+ii]);}for(var ii=0;ii<4;ii++){SAVEPUT(C_ADVS[5+ii]);}for(var ii=0;ii<4;ii++){SAVEPUT(C_ADVS[9+ii]);}for(var ii=0;ii<4;ii++){SAVEPUT(C_ADVS[21+ii]);}for(var ii=0;ii<4;ii++){SAVEPUT(C_ADVS[25+ii]);}
for(var ii=0;ii<46;ii++){SAVEPUT(C_FINDEX[0+ii]);}for(var ii=0;ii<22;ii++){SAVEPUT(C_FINDEX[46+ii]);}for(var ii=0;ii<4;ii++){SAVEPUT(C_VILL[5+ii]);}for(var ii=0;ii<25;ii++){SAVEPUT(C_CEVENT[51+ii]);}for(var ii=0;ii<25;ii++){SAVEPUT(C_CEVENT[1+ii]);}
ICLOSE("11");
RSPEAK([597],0);
return;
case 100:
RSPEAK([598],0);
return;
return;
}}
/* dverb2.f */
function RSTRGM(){
var pc=0;L:for(;;)switch(pc){case 0:
C_PRSVEC[3]=0;
if(!IOPEN("DSAVE.DAT","OLD")){pc=100;continue L;}
L_RSTRGM[0]=SAVEGET();L_RSTRGM[1]=SAVEGET();L_RSTRGM[2]=SAVEGET();
if(((L_RSTRGM[0]!=C_VERS[0])||(L_RSTRGM[1]!=C_VERS[1]))){pc=200;continue L;}
C_PLAY[0]=SAVEGET();C_PLAY[1]=SAVEGET();C_HACK[0]=SAVEGET();C_PLAY[2]=SAVEGET();C_HACK[1]=SAVEGET();C_HACK[2]=SAVEGET();C_HACK[3]=SAVEGET();C_HACK[4]=SAVEGET();for(var ii=0;ii<64;ii++){C_PUZZLE[24+ii]=SAVEGET();}
C_TIME[0]=SAVEGET();C_STATE[0]=SAVEGET();C_STATE[1]=SAVEGET();C_STATE[2]=SAVEGET();C_STATE[9]=SAVEGET();C_STATE[4]=SAVEGET();C_STATE[5]=SAVEGET();C_STATE[6]=SAVEGET();C_STATE[7]=SAVEGET();C_STATE[8]=SAVEGET();C_SCREEN[0]=SAVEGET();C_SCREEN[1]=SAVEGET();C_SCREEN[2]=SAVEGET();
for(var ii=0;ii<220;ii++){C_OBJCTS[1+ii]=SAVEGET();}for(var ii=0;ii<220;ii++){C_OBJCTS[221+ii]=SAVEGET();}for(var ii=0;ii<220;ii++){C_OBJCTS[881+ii]=SAVEGET();}for(var ii=0;ii<220;ii++){C_OBJCTS[1101+ii]=SAVEGET();}for(var ii=0;ii<220;ii++){C_OBJCTS[1321+ii]=SAVEGET();}for(var ii=0;ii<220;ii++){C_OBJCTS[1541+ii]=SAVEGET();}for(var ii=0;ii<220;ii++){C_OBJCTS[1761+ii]=SAVEGET();}for(var ii=0;ii<220;ii++){C_OBJCTS[1981+ii]=SAVEGET();}for(var ii=0;ii<220;ii++){C_OBJCTS[2201+ii]=SAVEGET();}for(var ii=0;ii<220;ii++){C_OBJCTS[2421+ii]=SAVEGET();}for(var ii=0;ii<220;ii++){C_OBJCTS[2641+ii]=SAVEGET();}
for(var ii=0;ii<200;ii++){C_ROOMS[602+ii]=SAVEGET();}for(var ii=0;ii<200;ii++){C_ROOMS[802+ii]=SAVEGET();}
for(var ii=0;ii<4;ii++){C_ADVS[1+ii]=SAVEGET();}for(var ii=0;ii<4;ii++){C_ADVS[5+ii]=SAVEGET();}for(var ii=0;ii<4;ii++){C_ADVS[9+ii]=SAVEGET();}for(var ii=0;ii<4;ii++){C_ADVS[21+ii]=SAVEGET();}for(var ii=0;ii<4;ii++){C_ADVS[25+ii]=SAVEGET();}
for(var ii=0;ii<46;ii++){C_FINDEX[0+ii]=SAVEGET();}for(var ii=0;ii<22;ii++){C_FINDEX[46+ii]=SAVEGET();}for(var ii=0;ii<4;ii++){C_VILL[5+ii]=SAVEGET();}for(var ii=0;ii<25;ii++){C_CEVENT[51+ii]=SAVEGET();}for(var ii=0;ii<25;ii++){C_CEVENT[1+ii]=SAVEGET();}
ICLOSE("11");
RSPEAK([599],0);
return;
case 100:
RSPEAK([598],0);
return;
case 200:
RSPEAK([600],0);
ICLOSE("1");
return;
return;
}}
/* dverb2.f */
function* WALK(){
function SF_WALK_QOPEN(O){return (ZAND(C_OBJCTS,O+1100,C_OFLAGS,28)!=0)}
var pc=0;L:for(;;)switch(pc){case 0:
L_WALK[6]=1;
if((((C_PLAY[0]!=C_AINDEX[0])||LIT(C_PLAY,1))||PROB([25],0,[25],0))){pc=500;continue L;}
if((!FINDXT(C_PRSVEC,2,C_PLAY,1))){pc=450;continue L;}
pc=[400,200,100,300][C_CURXT[0]-1];if(pc!==undefined)continue L;
BUG([9],0,C_CURXT,0);
case 100:
if((CXAPPL(C_CURXT,3)!=0)){pc=400;continue L;}
if(C_FINDEX[C_CURXT[4]-1]){pc=400;continue L;}
case 200:
(yield* JIGSUP([523],0));
return L_WALK[6];
case 300:
if((CXAPPL(C_CURXT,3)!=0)){pc=400;continue L;}
if(SF_WALK_QOPEN(C_CURXT[4])){pc=400;continue L;}
(yield* JIGSUP([523],0));
return L_WALK[6];
case 400:
if(LIT(C_CURXT,1)){pc=900;continue L;}
case 450:
(yield* JIGSUP([522],0));
return L_WALK[6];
case 500:
if(FINDXT(C_PRSVEC,2,C_PLAY,1)){pc=550;continue L;}
case 525:
C_CURXT[2]=678;
if((C_PRSVEC[2]==C_XSRCH[3])){C_CURXT[2]=679;}
if((C_PRSVEC[2]==C_XSRCH[2])){C_CURXT[2]=680;}
if((ZAND(C_ROOMS,C_PLAY[1]+801,C_RFLAG,10)!=0)){C_CURXT[2]=524;}
RSPEAK(C_CURXT,2);
C_PRSVEC[4]=1;
return L_WALK[6];
case 550:
pc=[900,600,700,800][C_CURXT[0]-1];if(pc!==undefined)continue L;
BUG([9],0,C_CURXT,0);
case 700:
if((CXAPPL(C_CURXT,3)!=0)){pc=900;continue L;}
if(C_FINDEX[C_CURXT[4]-1]){pc=900;continue L;}
case 600:
if((C_CURXT[2]==0)){pc=525;continue L;}
RSPEAK(C_CURXT,2);
C_PRSVEC[4]=1;
return L_WALK[6];
case 800:
if((CXAPPL(C_CURXT,3)!=0)){pc=900;continue L;}
if(SF_WALK_QOPEN(C_CURXT[4])){pc=900;continue L;}
if((C_CURXT[2]==0)){C_CURXT[2]=525;}
RSPSUB(C_CURXT,2,C_OBJCTS,C_CURXT[4]+220);
C_PRSVEC[4]=1;
return L_WALK[6];
case 900:
L_WALK[6]=MOVETO(C_CURXT,1,C_PLAY,0);
if(L_WALK[6]){L_WALK[6]=(yield* RMDESC([0],0));}
return L_WALK[6];
return L_WALK[6];
}}
/* dverb2.f */
function CXAPPL(RI,RI_){
var pc=0;L:for(;;)switch(pc){case 0:
L_CXAPPL[0]=0;
if((RI[RI_]==0)){return L_CXAPPL[0];}
pc=[1000,2000,3000,4000,5000,6000,7000,8000,9000,10000,11000,12000,13000,14000][RI[RI_]-1];if(pc!==undefined)continue L;
BUG([5],0,RI,RI_);
case 1000:
C_FINDEX[18]=((C_OBJCTS[C_OINDEX[22]+2420]!=C_PLAY[0]))?1:0;
return L_CXAPPL[0];
case 2000:
if(C_FINDEX[3]){return L_CXAPPL[0];}
case 2500:
RSPEAK([121],0);
case 5000:
L_CXAPPL[1]=(Math.imul(C_XPARS[C_XPARS[11]+4],ZRND([8],0)))|0;
C_CURXT[1]=ZAND(C_EXITS,(C_ROOMS[C_PLAY[1]+201]+L_CXAPPL[1]),C_XPARS,0);
L_CXAPPL[0]=C_CURXT[1];
return L_CXAPPL[0];
case 3000:
C_FINDEX[13]=0;
L_CXAPPL[2]=0;
L_CXAPPL[1]=1;L_CXAPPL[3]=C_OBJCTS[0];
case 100001:
if(L_CXAPPL[1]>L_CXAPPL[3]){pc=100002;continue L;}
if((C_OBJCTS[L_CXAPPL[1]+2420]==C_PLAY[0])){L_CXAPPL[2]=(L_CXAPPL[2]+1);}
case 3100:
L_CXAPPL[1]+=1;pc=100001;continue L;
case 100002:
if((L_CXAPPL[2]>2)){return L_CXAPPL[0];}
C_CURXT[2]=446;
if((C_OBJCTS[C_OINDEX[12]+2420]!=C_PLAY[0])){return L_CXAPPL[0];}
C_FINDEX[13]=1;
if((ZAND(C_OBJCTS,C_OINDEX[43]+1100,C_OFLAGS,28)==0)){C_OBJCTS[C_OINDEX[43]+1100]=ZAND(C_OBJCTS,C_OINDEX[43]+1100,[ZNOT(C_OFLAGS,29)],0);}
return L_CXAPPL[0];
case 4000:
if(C_FINDEX[3]){pc=2500;continue L;}
C_FINDEX[31]=0;
return L_CXAPPL[0];
case 6000:
if(C_FINDEX[3]){pc=2500;continue L;}
C_FINDEX[31]=1;
return L_CXAPPL[0];
case 7000:
C_FINDEX[31]=(((C_OBJCTS[C_OINDEX[86]+2200]!=0)&&(C_OBJCTS[C_OINDEX[87]+2200]!=0)))?1:0;
return L_CXAPPL[0];
case 8000:
C_FINDEX[31]=0;
if((C_FINDEX[58]!=C_CURXT[1])){pc=8100;continue L;}
if(((C_PRSVEC[2]==C_XSRCH[4])||(C_PRSVEC[2]==C_XSRCH[5]))){pc=8200;continue L;}
if(((C_FINDEX[57]%180)!=0)){pc=8300;continue L;}
C_CURXT[1]=((Math.imul((C_CURXT[1]-C_RINDEX[64]),2)+C_RINDEX[70]))|0;
if((C_PRSVEC[2]>C_XSRCH[5])){C_CURXT[1]=(C_CURXT[1]+1);}
case 8100:
L_CXAPPL[0]=C_CURXT[1];
return L_CXAPPL[0];
case 8200:
C_CURXT[2]=814;
if(((C_FINDEX[57]%180)==0)){return L_CXAPPL[0];}
case 8300:
L_CXAPPL[4]=C_FINDEX[57];
if((C_PRSVEC[2]==C_XSRCH[5])){L_CXAPPL[4]=180;}
C_CURXT[2]=815;
if((((L_CXAPPL[4]>180)&&(!C_FINDEX[39]))||((L_CXAPPL[4]<180)&&(!C_FINDEX[40])))){C_CURXT[2]=816;}
return L_CXAPPL[0];
case 9000:
if((MRHERE(C_PLAY,1)!=1)){pc=9100;continue L;}
if(C_FINDEX[39]){C_CURXT[2]=805;}
C_FINDEX[31]=C_FINDEX[37];
return L_CXAPPL[0];
case 9100:
C_FINDEX[31]=0;
C_CURXT[2]=817;
return L_CXAPPL[0];
case 10000:
C_FINDEX[31]=0;
L_CXAPPL[4]=(Math.imul(DIV((C_PRSVEC[2]-C_XSRCH[4]),C_XSRCH[4]),45))|0;
if(((!C_FINDEX[37])||((((C_FINDEX[57]+270)%360)!=L_CXAPPL[4])&&(C_PRSVEC[2]!=C_XSRCH[7])))){pc=10200;continue L;}
C_CURXT[1]=((((Math.imul((C_FINDEX[58]-C_RINDEX[64]),2)+C_RINDEX[70])+1)-DIV(C_FINDEX[57],180)))|0;
if(((C_FINDEX[57]%180)==0)){pc=10100;continue L;}
C_CURXT[1]=(C_FINDEX[58]+1);
if((C_FINDEX[57]>180)){C_CURXT[1]=(C_FINDEX[58]-1);}
case 10100:
L_CXAPPL[0]=C_CURXT[1];
return L_CXAPPL[0];
case 10200:
if(((!C_FINDEX[38])||((((C_FINDEX[57]+180)%360)!=L_CXAPPL[4])&&(C_PRSVEC[2]!=C_XSRCH[7])))){return L_CXAPPL[0];}
C_CURXT[1]=(C_FINDEX[58]+1);
if((C_FINDEX[57]==0)){C_CURXT[1]=(C_FINDEX[58]-1);}
RSPEAK([818],0);
C_FINDEX[38]=0;
L_CXAPPL[0]=C_CURXT[1];
return L_CXAPPL[0];
case 11000:
if((C_FINDEX[63]!=4)){C_CURXT[2]=678;}
return L_CXAPPL[0];
case 12000:
C_FINDEX[31]=1;
C_FINDEX[67]=10;
return L_CXAPPL[0];
case 13000:
C_FINDEX[67]=52;
return L_CXAPPL[0];
case 14000:
C_FINDEX[31]=0;
if((C_PRSVEC[2]!=C_XSRCH[3])){pc=14100;continue L;}
if((C_FINDEX[67]!=10)){return L_CXAPPL[0];}
C_CURXT[2]=881;
if((C_PUZZLE[(C_FINDEX[67]+1)+23]!=(-2))){return L_CXAPPL[0];}
RSPEAK([882],0);
C_FINDEX[31]=1;
return L_CXAPPL[0];
case 14100:
if((((C_FINDEX[67]!=52)||(C_PRSVEC[2]!=C_XSRCH[9]))||(!C_FINDEX[44]))){pc=14200;continue L;}
C_FINDEX[31]=1;
return L_CXAPPL[0];
case 14200:
L_CXAPPL[1]=1;L_CXAPPL[5]=16;
case 100003:
if(L_CXAPPL[1]>L_CXAPPL[5]){pc=100004;continue L;}
if((C_PRSVEC[2]==C_PUZZLE[L_CXAPPL[1]-1])){pc=14400;continue L;}
case 14300:
L_CXAPPL[1]+=2;pc=100003;continue L;
case 100004:
return L_CXAPPL[0];
case 14400:
L_CXAPPL[2]=C_PUZZLE[(L_CXAPPL[1]+1)-1];
L_CXAPPL[6]=(C_FINDEX[67]+L_CXAPPL[2]);
L_CXAPPL[7]=8;
if((L_CXAPPL[2]<0)){L_CXAPPL[7]=(-8);}
if(((((Math.abs(L_CXAPPL[2])==1)||(Math.abs(L_CXAPPL[2])==8))||((C_PUZZLE[(C_FINDEX[67]+L_CXAPPL[7])+23]==0)||(C_PUZZLE[(L_CXAPPL[6]-L_CXAPPL[7])+23]==0)))&&(C_PUZZLE[L_CXAPPL[6]+23]==0))){pc=14500;continue L;}
return L_CXAPPL[0];
case 14500:
CPGOTO(L_CXAPPL,6);
C_CURXT[1]=C_RINDEX[85];
L_CXAPPL[0]=C_CURXT[1];
return L_CXAPPL[0];
return L_CXAPPL[0];
}}
/* gdt.f */
function* GDT(){
function SF_GDT_VALID1(A1,L1){return ((A1>0)&&(A1<=L1))}
function SF_GDT_VALID2(A1,A2,L1){return ((SF_GDT_VALID1(A1,L1)&&SF_GDT_VALID1(A2,L1))&&(A1<=A2))}
function SF_GDT_VALID3(A1,L1,A2,L2){return (SF_GDT_VALID1(A1,L1)&&SF_GDT_VALID1(A2,L2))}
var pc=0;L:for(;;)switch(pc){case 0:
L_GDT[82]=46;
L_GDT[83]=22;
var W=WSTART("1X,'CODE?'");W.end();
var R=RSTART("2A2",yield READ);for(var ii=0;ii<2;ii++){L_GDT[80+ii]=R();}
if(((L_GDT[1+79]!="BE")||(L_GDT[2+79]!="AR"))){return;}
case 2000:
var W=WSTART("' GDT:'");W.end();
var R=RSTART("A2",yield READ);L_GDT[38]=R();
if((L_GDT[38]=="  ")){pc=2000;continue L;}
L_GDT[84]=1;L_GDT[86]=L_GDT[85];
case 100001:
if(L_GDT[84]>L_GDT[86]){pc=100002;continue L;}
if((L_GDT[38]==L_GDT[L_GDT[84]-1])){pc=2300;continue L;}
case 2100:
L_GDT[84]+=1;pc=100001;continue L;
case 100002:
case 2200:
var W=WSTART("' ?'");W.end();
pc=2000;continue L;
case 2300:
pc=[2400,2500,2600,2700][(L_GDT[L_GDT[84]+38]+1)-1];if(pc!==undefined)continue L;
pc=2200;continue L;
case 2700:
var W=WSTART("' Idx,Ary:  '");W.end();
var R=RSTART("2I6",yield READ);L_GDT[87]=R();L_GDT[88]=R();
pc=2400;continue L;
case 2600:
var W=WSTART("' Limits:   '");W.end();
var R=RSTART("2I6",yield READ);L_GDT[87]=R();L_GDT[88]=R();
if((L_GDT[88]==0)){L_GDT[88]=L_GDT[87];}
pc=2400;continue L;
case 2500:
var W=WSTART("' Entry:    '");W.end();
var R=RSTART("I6",yield READ);L_GDT[87]=R();
case 2400:
pc=[10000,11000,12000,13000,14000,15000,16000,17000,18000,19000,20000,21000,22000,23000,24000,25000,26000,27000,28000,29000,30000,31000,32000,33000,34000,35000,36000,37000,38000,39000,40000,41000,42000,43000,44000,45000,46000,47000][L_GDT[84]-1];if(pc!==undefined)continue L;
pc=2200;continue L;
case 10000:
if((!SF_GDT_VALID2(L_GDT[87],L_GDT[88],C_ROOMS[0]))){pc=2200;continue L;}
var W=WSTART("' RM#  DESC1  EXITS ACTION  VALUE  FLAGS'");W.end();
L_GDT[84]=L_GDT[87];L_GDT[89]=L_GDT[88];
case 100003:
if(L_GDT[84]>L_GDT[89]){pc=100004;continue L;}
var W=WSTART("1X,I3,4(1X,I6),1X,Z6");W.put(L_GDT[84]);for(L_GDT[90]=1;L_GDT[90]<=5;L_GDT[90]++){W.put(C_ROOMS[L_GDT[84]+L_GDT[90]*200-199]);}W.end();
case 10100:
L_GDT[84]+=1;pc=100003;continue L;
case 100004:
pc=2000;continue L;
case 11000:
if((!SF_GDT_VALID2(L_GDT[87],L_GDT[88],C_OBJCTS[0]))){pc=2200;continue L;}
var W=WSTART("' OB# DESC1 DESC2 DESCO ACT FLAGS1 FLAGS2 FVL TVL        SIZE CAPAC ROOM ADV CON  READ'");W.end();
L_GDT[84]=L_GDT[87];L_GDT[91]=L_GDT[88];
case 100005:
if(L_GDT[84]>L_GDT[91]){pc=100006;continue L;}
var W=WSTART("1X,I3,3I6,I4,2Z7,2I4,2I6,1X,3I4,I6");W.put(L_GDT[84]);for(L_GDT[90]=1;L_GDT[90]<=14;L_GDT[90]++){W.put(C_OBJCTS[L_GDT[84]+L_GDT[90]*220-220]);}W.end();
case 11100:
L_GDT[84]+=1;pc=100005;continue L;
case 100006:
pc=2000;continue L;
case 12000:
if((!SF_GDT_VALID2(L_GDT[87],L_GDT[88],C_ADVS[0]))){pc=2200;continue L;}
var W=WSTART("' AD#   ROOM  SCORE  VEHIC OBJECT ACTION  STREN  FLAGS'");W.end();
L_GDT[84]=L_GDT[87];L_GDT[92]=L_GDT[88];
case 100007:
if(L_GDT[84]>L_GDT[92]){pc=100008;continue L;}
var W=WSTART("1X,I3,6(1X,I6),1X,Z6");W.put(L_GDT[84]);for(L_GDT[90]=1;L_GDT[90]<=7;L_GDT[90]++){W.put(C_ADVS[L_GDT[84]+L_GDT[90]*4-4]);}W.end();
case 12100:
L_GDT[84]+=1;pc=100007;continue L;
case 100008:
pc=2000;continue L;
case 13000:
if((!SF_GDT_VALID2(L_GDT[87],L_GDT[88],C_CEVENT[0]))){pc=2200;continue L;}
var W=WSTART("' CL#   TICK ACTION  FLAG'");W.end();
L_GDT[84]=L_GDT[87];L_GDT[93]=L_GDT[88];
case 100009:
if(L_GDT[84]>L_GDT[93]){pc=100010;continue L;}
var W=WSTART("1X,I3,1X,I6,1X,I6,5X,L1");W.put(L_GDT[84]);for(L_GDT[90]=1;L_GDT[90]<=2;L_GDT[90]++){W.put(C_CEVENT[L_GDT[84]+L_GDT[90]*25-25]);}W.put(C_CEVENT[L_GDT[84]+50]);W.end();
case 13100:
L_GDT[84]+=1;pc=100009;continue L;
case 100010:
pc=2000;continue L;
case 14000:
if((!SF_GDT_VALID2(L_GDT[87],L_GDT[88],C_EXITS[0]))){pc=2200;continue L;}
var W=WSTART("'   RANGE   CONTENTS'");W.end();
L_GDT[84]=L_GDT[87];L_GDT[94]=L_GDT[88];
case 100011:
if(L_GDT[84]>L_GDT[94]){pc=100012;continue L;}
L_GDT[90]=Math.min((L_GDT[84]+9),L_GDT[88]);
var W=WSTART("1X,I3,'-',I3,3X,10Z7");W.put(L_GDT[84]);W.put(L_GDT[90]);for(L_GDT[95]=L_GDT[84];L_GDT[95]<=L_GDT[90];L_GDT[95]++){W.put(C_EXITS[L_GDT[95]]);}W.end();
case 14100:
L_GDT[84]+=10;pc=100011;continue L;
case 100012:
pc=2000;continue L;
case 15000:
var W=WSTART("' THFPOS=',I6,', THFFLG=',L2,',THFACT=',L2/            ' SWDACT=',L2,', SWDSTA=',I2");W.put(C_HACK[0]);W.put(C_HACK[1]);W.put(C_HACK[2]);W.put(C_HACK[3]);W.put(C_HACK[4]);W.end();
pc=2000;continue L;
case 16000:
var W=WSTART("' R=',I6,', X=',I6,', O=',I6,', C=',I6/                ' V=',I6,', A=',I6,', M=',I6,', R2=',I5/                          ' MBASE=',I6,', STRBIT=',I6");W.put(C_ROOMS[0]);W.put(C_EXITS[0]);W.put(C_OBJCTS[0]);W.put(C_CEVENT[0]);W.put(C_VILL[0]);W.put(C_ADVS[0]);W.put(C_RMSG[0]);W.put(C_OROOM2[0]);W.put(C_STAR[0]);W.put(C_STAR[1]);W.end();
pc=2000;continue L;
case 17000:
if((!SF_GDT_VALID2(L_GDT[87],L_GDT[88],C_VILL[0]))){pc=2200;continue L;}
var W=WSTART("' VL# OBJECT   PROB   OPPS   BEST  MELEE'");W.end();
L_GDT[84]=L_GDT[87];L_GDT[96]=L_GDT[88];
case 100013:
if(L_GDT[84]>L_GDT[96]){pc=100014;continue L;}
var W=WSTART("1X,I3,5(1X,I6)");W.put(L_GDT[84]);for(L_GDT[90]=1;L_GDT[90]<=5;L_GDT[90]++){W.put(C_VILL[L_GDT[84]+L_GDT[90]*4-4]);}W.end();
case 17100:
L_GDT[84]+=1;pc=100013;continue L;
case 100014:
pc=2000;continue L;
case 18000:
if((!SF_GDT_VALID2(L_GDT[87],L_GDT[88],L_GDT[82]))){pc=2200;continue L;}
L_GDT[84]=L_GDT[87];L_GDT[97]=L_GDT[88];
case 100015:
if(L_GDT[84]>L_GDT[97]){pc=100016;continue L;}
var W=WSTART("' Flag #',I2,' = ',L1");W.put(L_GDT[84]);W.put(C_FINDEX[L_GDT[84]-1]);W.end();
case 18100:
L_GDT[84]+=1;pc=100015;continue L;
case 100016:
pc=2000;continue L;
case 19000:
var W=WSTART("' Parse vector=',3(1X,I6),1X,L6,1X,I6");W.put(C_PRSVEC[0]);W.put(C_PRSVEC[2]);W.put(C_PRSVEC[1]);W.put(C_PRSVEC[3]);W.put(C_PRSVEC[4]);W.end();
var W=WSTART("' Play vector= ',2(1X,I6),1X,L6");W.put(C_PLAY[0]);W.put(C_PLAY[1]);W.put(C_PLAY[2]);W.end();
var W=WSTART("' State vector=',9(1X,I6)/14X,2(1X,I6)");W.put(C_STATE[0]);W.put(C_STATE[1]);W.put(C_STATE[2]);W.put(C_STATE[3]);W.put(C_STATE[4]);W.put(C_STATE[5]);W.put(C_STATE[6]);W.put(C_STATE[7]);W.put(C_STATE[8]);W.put(C_STATE[9]);W.put(C_STATE[10]);W.end();
var W=WSTART("' Scol vector= ',1X,Z6,2(1X,I6)");W.put(C_SCREEN[0]);W.put(C_SCREEN[1]);W.put(C_SCREEN[2]);W.end();
pc=2000;continue L;
case 20000:
if((!SF_GDT_VALID1(L_GDT[87],L_GDT[82]))){pc=2200;continue L;}
var W=WSTART("' Old=',L2,6X,'New: '");W.put(C_FINDEX[L_GDT[87]-1]);W.end();
var R=RSTART("L1",yield READ);C_FINDEX[L_GDT[87]-1]=R();
pc=2000;continue L;
case 21000:
var W=WSTART("' Valid commands are:'/' AA- Alter ADVS'/              ' AC- Alter CEVENT'/' AF- Alter FINDEX'/' AH- Alter HERE'/        ' AN- Alter switches'/' AO- Alter OBJCTS'/' AR- Alter ROOMS'/     ' AV- Alter VILLS'/' AX- Alter EXITS'/                            ' AZ- Alter PUZZLE'/' DA- Display ADVS'/                          ' DC- Display CEVENT'/' DF- Display FINDEX'/' DH- Display HACKS'/ ' DL- Display lengths'/' DM- Display RTEXT'/                      ' DN- Display switches'/                                          ' DO- Display OBJCTS'/' DP- Display parser'/                      ' DR- Display ROOMS'/' DS- Display state'/' DT- Display text'/    ' DV- Display VILLS'/' DX- Display EXITS'/' DZ- Display PUZZLE'/  ' D2- Display ROOM2'/' EX- Exit'/' HE- Type this message'/        ' NC- No cyclops'/' ND- No deaths'/' NR- No robber'/              ' NT- No troll'/' PD- Program detail'/                            ' RC- Restore cyclops'/' RD- Restore deaths'/                     ' RR- Restore robber'/' RT- Restore troll'/' TK- Take.'");W.end();
pc=2000;continue L;
case 22000:
C_HACK[1]=0;
C_HACK[2]=0;
NEWSTA(C_OINDEX,39,[0],0,[0],0,[0],0,[0],0);
var W=WSTART("' No robber.'");W.end();
pc=2000;continue L;
case 23000:
C_FINDEX[0]=1;
NEWSTA(C_OINDEX,16,[0],0,[0],0,[0],0,[0],0);
var W=WSTART("' No troll.'");W.end();
pc=2000;continue L;
case 24000:
C_FINDEX[11]=1;
NEWSTA(C_OINDEX,37,[0],0,[0],0,[0],0,[0],0);
var W=WSTART("' No cyclops.'");W.end();
pc=2000;continue L;
case 25000:
C_DEBUG[0]=1;
var W=WSTART("' No deaths.'");W.end();
pc=2000;continue L;
case 26000:
C_HACK[2]=1;
var W=WSTART("' Restored robber.'");W.end();
pc=2000;continue L;
case 27000:
C_FINDEX[0]=0;
NEWSTA(C_OINDEX,16,[0],0,C_RINDEX,3,[0],0,[0],0);
var W=WSTART("' Restored troll.'");W.end();
pc=2000;continue L;
case 28000:
C_FINDEX[11]=0;
C_FINDEX[12]=0;
NEWSTA(C_OINDEX,37,[0],0,C_RINDEX,30,[0],0,[0],0);
var W=WSTART("' Restored cyclops.'");W.end();
pc=2000;continue L;
case 29000:
C_DEBUG[0]=0;
var W=WSTART("' Restored deaths.'");W.end();
pc=2000;continue L;
case 30000:
if((!SF_GDT_VALID1(L_GDT[87],C_OBJCTS[0]))){pc=2200;continue L;}
NEWSTA(L_GDT,87,[0],0,[0],0,[0],0,C_PLAY,0);
var W=WSTART("' Taken.'");W.end();
pc=2000;continue L;
case 31000:
C_PRSVEC[4]=1;
return;
case 32000:
if((!SF_GDT_VALID3(L_GDT[87],C_ROOMS[0],L_GDT[88],5))){pc=2200;continue L;}
var W=WSTART("' Old= ',I6,6X,'New: '");W.put(C_ROOMS[L_GDT[87]+L_GDT[88]*200-199]);W.end();
var R=RSTART("I6",yield READ);C_ROOMS[L_GDT[87]+L_GDT[88]*200-199]=R();
pc=2000;continue L;
case 33000:
if((!SF_GDT_VALID3(L_GDT[87],C_OBJCTS[0],L_GDT[88],14))){pc=2200;continue L;}
var W=WSTART("' Old= ',I6,6X,'New: '");W.put(C_OBJCTS[L_GDT[87]+L_GDT[88]*220-220]);W.end();
var R=RSTART("I6",yield READ);C_OBJCTS[L_GDT[87]+L_GDT[88]*220-220]=R();
pc=2000;continue L;
case 34000:
if((!SF_GDT_VALID3(L_GDT[87],C_ADVS[0],L_GDT[88],7))){pc=2200;continue L;}
var W=WSTART("' Old= ',I6,6X,'New: '");W.put(C_ADVS[L_GDT[87]+L_GDT[88]*4-4]);W.end();
var R=RSTART("I6",yield READ);C_ADVS[L_GDT[87]+L_GDT[88]*4-4]=R();
pc=2000;continue L;
case 35000:
if((!SF_GDT_VALID3(L_GDT[87],C_CEVENT[0],L_GDT[88],3))){pc=2200;continue L;}
if((L_GDT[88]==3)){pc=35500;continue L;}
var W=WSTART("' Old= ',I6,6X,'New: '");W.put(C_CEVENT[L_GDT[87]+L_GDT[88]*25-25]);W.end();
var R=RSTART("I6",yield READ);C_CEVENT[L_GDT[87]+L_GDT[88]*25-25]=R();
pc=2000;continue L;
case 35500:
var W=WSTART("' Old=',L2,6X,'New: '");W.put(C_CEVENT[L_GDT[87]+50]);W.end();
var R=RSTART("L1",yield READ);C_CEVENT[L_GDT[87]+50]=R();
pc=2000;continue L;
case 36000:
if((!SF_GDT_VALID1(L_GDT[87],C_EXITS[0]))){pc=2200;continue L;}
var W=WSTART("' Old= ',Z6,6X,'New: '");W.put(C_EXITS[L_GDT[87]]);W.end();
var R=RSTART("Z6",yield READ);C_EXITS[L_GDT[87]]=R();
pc=2000;continue L;
case 37000:
if((!SF_GDT_VALID3(L_GDT[87],C_VILL[0],L_GDT[88],5))){pc=2200;continue L;}
var W=WSTART("' Old= ',I6,6X,'New: '");W.put(C_VILL[L_GDT[87]+L_GDT[88]*4-4]);W.end();
var R=RSTART("I6",yield READ);C_VILL[L_GDT[87]+L_GDT[88]*4-4]=R();
pc=2000;continue L;
case 38000:
if((!SF_GDT_VALID2(L_GDT[87],L_GDT[88],C_OROOM2[0]))){pc=2200;continue L;}
L_GDT[84]=L_GDT[87];L_GDT[98]=L_GDT[88];
case 100017:
if(L_GDT[84]>L_GDT[98]){pc=100018;continue L;}
var W=WSTART("' #',I2,'   Room=',I6,'   Obj=',I6");W.put(L_GDT[84]);W.put(C_OROOM2[L_GDT[84]+20]);W.put(C_OROOM2[L_GDT[84]]);W.end();
case 38100:
L_GDT[84]+=1;pc=100017;continue L;
case 100018:
pc=2000;continue L;
case 39000:
if((!SF_GDT_VALID2(L_GDT[87],L_GDT[88],L_GDT[83]))){pc=2200;continue L;}
L_GDT[84]=L_GDT[87];L_GDT[99]=L_GDT[88];
case 100019:
if(L_GDT[84]>L_GDT[99]){pc=100020;continue L;}
var W=WSTART("' Switch #',I2,' = ',I6");W.put(L_GDT[84]);W.put(C_FINDEX[L_GDT[84]+45]);W.end();
case 39100:
L_GDT[84]+=1;pc=100019;continue L;
case 100020:
pc=2000;continue L;
case 40000:
if((!SF_GDT_VALID1(L_GDT[87],L_GDT[83]))){pc=2200;continue L;}
var W=WSTART("' Old= ',I6,6X,'New: '");W.put(C_FINDEX[L_GDT[87]+45]);W.end();
var R=RSTART("I6",yield READ);C_FINDEX[L_GDT[87]+45]=R();
pc=2000;continue L;
case 41000:
if((!SF_GDT_VALID2(L_GDT[87],L_GDT[88],C_RMSG[0]))){pc=2200;continue L;}
var W=WSTART("'   RANGE   CONTENTS'");W.end();
L_GDT[84]=L_GDT[87];L_GDT[100]=L_GDT[88];
case 100021:
if(L_GDT[84]>L_GDT[100]){pc=100022;continue L;}
L_GDT[90]=Math.min((L_GDT[84]+9),L_GDT[88]);
var W=WSTART("1X,I3,'-',I3,3X,10(1X,I6)");W.put(L_GDT[84]);W.put(L_GDT[90]);for(L_GDT[95]=L_GDT[84];L_GDT[95]<=L_GDT[90];L_GDT[95]++){W.put(C_RMSG[L_GDT[95]]);}W.end();
case 41100:
L_GDT[84]+=10;pc=100021;continue L;
case 100022:
pc=2000;continue L;
case 42000:
RSPEAK(L_GDT,87);
pc=2000;continue L;
case 43000:
var W=WSTART("' Old= ',I6,6X,'New: '");W.put(C_PLAY[1]);W.end();
var R=RSTART("I6",yield READ);C_PLAY[1]=R();
C_ADVS[1+1*4-4]=C_PLAY[1];
pc=2000;continue L;
case 44000:
var W=WSTART("' ORPHS= ',I7,Z7,4I7/                                  ' PV=    ',Z7,4I7/' SYN=   ',6Z7/15X,5Z7");for(var ii=0;ii<5;ii++){W.put(C_ORPHS[0+ii]);}W.put(C_LAST[0]);for(var ii=0;ii<5;ii++){W.put(C_PV[0+ii]);}for(var ii=0;ii<11;ii++){W.put(C_SYNTAX[0+ii]);}W.end();
pc=2000;continue L;
case 45000:
var W=WSTART("' Old= ',Z6,6X,'New: '");W.put(C_DEBUG[1]);W.end();
var R=RSTART("Z6",yield READ);C_DEBUG[1]=R();
pc=2000;continue L;
case 46000:
L_GDT[84]=1;L_GDT[101]=64;
case 100023:
if(L_GDT[84]>L_GDT[101]){pc=100024;continue L;}
var W=WSTART("2X,8I3");for(L_GDT[87]=L_GDT[84];L_GDT[87]<=(L_GDT[84]+7);L_GDT[87]++){W.put(C_PUZZLE[L_GDT[87]+23]);}W.end();
case 46100:
L_GDT[84]+=8;pc=100023;continue L;
case 100024:
pc=2000;continue L;
case 47000:
if((!SF_GDT_VALID1(L_GDT[87],64))){pc=2200;continue L;}
var W=WSTART("' Old= ',I6,6X,'New: '");W.put(C_PUZZLE[L_GDT[87]+23]);W.end();
var R=RSTART("I6",yield READ);C_PUZZLE[L_GDT[87]+23]=R();
pc=2000;continue L;
return;
}}
/* machdep.f */
function ZAND(I,I_,J,J_){
L_ZAND[0]=((I[I_]&J[J_])&65535);
return L_ZAND[0];
return L_ZAND[0];
}
/* machdep.f */
function ZOR(I,I_,J,J_){
L_ZOR[0]=((I[I_]|J[J_])&65535);
return L_ZOR[0];
return L_ZOR[0];
}
/* machdep.f */
function ZXOR(I,I_,J,J_){
L_ZXOR[0]=((I[I_]^J[J_])&65535);
return L_ZXOR[0];
return L_ZXOR[0];
}
/* machdep.f */
function ZNOT(I,I_){
L_ZNOT[0]=((I[I_]^(-1))&65535);
return L_ZNOT[0];
return L_ZNOT[0];
}
/* machdep.f */
function EXIT(){
throw STOP;
return;
}
/* machdep.f */
function ITIME(H,H_,M,M_,S,S_){
GETTIM(H,H_,M,M_,S,S_);
return;
return;
}
/* machdep.f */
function KDATE(I,I_,J,J_,K,K_){
I[I_]=11;
J[J_]=11;
K[K_]=11;
return;
return;
}
/* machdep.f */
function INIRND(I,I_){
C_RANSEED[0]=I[I_];
return;
return;
}
/* machdep.f */
function ZRND(IRANGE,IRANGE_){
C_RANSEED[0]=((Math.imul(C_RANSEED[0],69069)+1))|0;
L_ZRND[1]=DIV(16384,IRANGE[IRANGE_]);
L_ZRND[2]=DIV(Math.abs(C_RANSEED[0]),L_ZRND[1]);
L_ZRND[0]=(L_ZRND[2]%IRANGE[IRANGE_]);
return L_ZRND[0];
return L_ZRND[0];
}
/* machdep.f */
function MACHDV(){
C_CHAN[0]=5;
C_CHAN[1]=6;
C_CHAN[2]=2;
C_CHAN[3]=78;
C_XINFMT[0]="(' >',$            )";
return;
return;
}
/* nobjs.f */
function NOBJS(RI,RI_,ARG,ARG_){
function SF_NOBJS_QOPEN(R){return (ZAND(C_OBJCTS,R+1100,C_OFLAGS,28)!=0)}
var pc=0;L:for(;;)switch(pc){case 0:
L_NOBJS[7]=ARG[ARG_];
if((C_PRSVEC[2]!=0)){L_NOBJS[8]=C_OBJCTS[C_PRSVEC[2]+220];}
if((C_PRSVEC[1]!=0)){L_NOBJS[9]=C_OBJCTS[C_PRSVEC[1]+220];}
L_NOBJS[10]=C_ADVS[C_PLAY[0]+8];
L_NOBJS[6]=1;
pc=[1000,2000,3000,4000,5000,6000,7000,8000,9000,10000,11000,12000,13000,14000,15000,16000,17000,18000,19000,20000,21000][(RI[RI_]-31)-1];if(pc!==undefined)continue L;
BUG([6],0,RI,RI_);
case 10:
L_NOBJS[6]=0;
return L_NOBJS[6];
case 1000:
if((C_PRSVEC[0]!=C_VINDEX[43])){pc=1100;continue L;}
RSPEAK([639],0);
return L_NOBJS[6];
case 1100:
if((C_PRSVEC[0]==C_VINDEX[45])){RSPEAK([640],0);}
pc=10;continue L;
case 2000:
L_NOBJS[11]=C_OINDEX[88];
case 2100:
if((C_PRSVEC[2]!=L_NOBJS[11])){pc=2400;continue L;}
if(((((C_PRSVEC[0]!=C_VINDEX[20])&&(C_PRSVEC[0]!=C_VINDEX[30]))&&(C_PRSVEC[0]!=C_VINDEX[40]))&&(C_PRSVEC[0]!=C_VINDEX[19]))){pc=2200;continue L;}
RSPEAK([673],0);
return L_NOBJS[6];
case 2200:
if((((C_PRSVEC[0]!=C_VINDEX[47])&&(C_PRSVEC[0]!=C_VINDEX[48]))&&(C_PRSVEC[0]!=C_VINDEX[46]))){pc=2400;continue L;}
RSPSUB([674],0,L_NOBJS,9);
return L_NOBJS[6];
case 2400:
if(((C_PRSVEC[0]!=C_VINDEX[56])||(C_PRSVEC[1]!=L_NOBJS[11]))){pc=10;continue L;}
if((C_PLAY[1]==C_RINDEX[59])){pc=2600;continue L;}
NEWSTA(C_PRSVEC,2,[0],0,C_RINDEX,59,[0],0,[0],0);
RSPSUB([675],0,L_NOBJS,8);
C_CEVENT[C_CINDEX[16]]=0;
C_SCREEN[1]=0;
return L_NOBJS[6];
case 2600:
if((C_SCREEN[1]==0)){pc=2900;continue L;}
NEWSTA(C_PRSVEC,2,[0],0,C_SCREEN,1,[0],0,[0],0);
RSPSUB([676],0,L_NOBJS,8);
C_CEVENT[C_CINDEX[16]]=0;
C_SCREEN[1]=0;
return L_NOBJS[6];
case 2900:
RSPEAK([213],0);
return L_NOBJS[6];
case 3000:
if(((C_PRSVEC[0]!=C_VINDEX[54])&&(C_PRSVEC[0]!=C_VINDEX[56]))){pc=3200;continue L;}
if((C_OBJCTS[C_PRSVEC[2]+1540]!=0)){pc=3100;continue L;}
NEWSTA(C_PRSVEC,2,[641],0,[0],0,[0],0,[0],0);
return L_NOBJS[6];
case 3100:
NEWSTA(C_PRSVEC,2,[0],0,[0],0,[0],0,[0],0);
RSPSUB([642],0,L_NOBJS,8);
NEWSTA(C_OINDEX,89,[0],0,[0],0,[0],0,[0],0);
C_CEVENT[C_CINDEX[18]]=0;
L_NOBJS[2]=MOVETO(C_RINDEX,55,C_PLAY,0);
return L_NOBJS[6];
case 3200:
if((((C_PRSVEC[0]!=C_VINDEX[48])&&(C_PRSVEC[0]!=C_VINDEX[47]))&&(C_PRSVEC[0]!=C_VINDEX[46]))){pc=3300;continue L;}
NEWSTA(C_OINDEX,89,[643],0,[0],0,[0],0,[0],0);
C_CEVENT[C_CINDEX[18]]=0;
return L_NOBJS[6];
case 3300:
RSPEAK([644],0);
return L_NOBJS[6];
case 4000:
if(((C_PRSVEC[0]!=C_VINDEX[33])||(C_PRSVEC[2]!=C_OINDEX[90]))){pc=4500;continue L;}
if((!SF_NOBJS_QOPEN(C_OINDEX[90]))){pc=4100;continue L;}
RSPEAK([649],0);
return L_NOBJS[6];
case 4100:
if((C_PRSVEC[1]!=0)){pc=4200;continue L;}
RSPEAK([650],0);
return L_NOBJS[6];
case 4200:
if((C_PRSVEC[1]!=C_OINDEX[108])){pc=4300;continue L;}
RSPEAK([651],0);
return L_NOBJS[6];
case 4300:
L_NOBJS[7]=652;
if(((ZAND(C_OBJCTS,C_PRSVEC[1]+880,C_OFLAGS,13)!=0)||(ZAND(C_OBJCTS,C_PRSVEC[1]+1100,C_OFLAGS,22)!=0))){pc=4600;continue L;}
L_NOBJS[7]=653;
if((ZAND(C_OBJCTS,C_PRSVEC[2]+1100,C_OFLAGS,23)!=0)){L_NOBJS[7]=654;}
C_OBJCTS[C_PRSVEC[2]+1100]=ZOR(C_OBJCTS,C_PRSVEC[2]+1100,C_OFLAGS,23);
RSPSUB(L_NOBJS,7,L_NOBJS,9);
return L_NOBJS[6];
case 4500:
if(((C_PRSVEC[0]!=C_VINDEX[33])&&(C_PRSVEC[0]!=C_VINDEX[46]))){pc=4800;continue L;}
L_NOBJS[7]=655;
case 4600:
NEWSTA(C_OINDEX,91,L_NOBJS,7,C_OBJCTS,C_OINDEX[90]+2200,C_OBJCTS,C_OINDEX[90]+2640,C_OBJCTS,C_OINDEX[90]+2420);
NEWSTA(C_OINDEX,90,[0],0,[0],0,[0],0,[0],0);
C_OBJCTS[C_OINDEX[91]+1540]=2;
if((C_OBJCTS[C_OINDEX[93]+2640]!=C_OINDEX[90])){pc=4700;continue L;}
RSPEAK(C_OBJCTS,C_OINDEX[94]+440);
C_OBJCTS[C_OINDEX[94]+1540]=1;
return L_NOBJS[6];
case 4700:
NEWSTA(C_OINDEX,94,[0],0,[0],0,[0],0,[0],0);
return L_NOBJS[6];
case 4800:
if(((C_PRSVEC[0]!=C_VINDEX[53])||(C_PLAY[1]!=C_RINDEX[54]))){pc=10;continue L;}
NEWSTA(C_OINDEX,91,[658],0,C_RINDEX,8,[0],0,[0],0);
NEWSTA(C_OINDEX,90,[0],0,[0],0,[0],0,[0],0);
C_OBJCTS[C_OINDEX[91]+1540]=2;
if((C_OBJCTS[C_OINDEX[93]+2640]!=C_OINDEX[90])){pc=4700;continue L;}
C_OBJCTS[C_OINDEX[94]+1540]=1;
return L_NOBJS[6];
case 5000:
if((C_PRSVEC[0]!=C_VINDEX[65])){pc=10;continue L;}
if((C_PRSVEC[2]==C_OINDEX[93])){pc=5100;continue L;}
RSPEAK([645],0);
return L_NOBJS[6];
case 5100:
if(((!C_FINDEX[35])&&((C_PLAY[1]==C_RINDEX[54])||((C_PLAY[1]>=C_RINDEX[7])&&(C_PLAY[1]<C_RINDEX[9]))))){pc=5200;continue L;}
RSPEAK([646],0);
return L_NOBJS[6];
case 5200:
C_FINDEX[35]=1;
L_NOBJS[7]=C_PLAY[1];
if((L_NOBJS[7]==C_RINDEX[54])){L_NOBJS[7]=C_RINDEX[8];}
NEWSTA(C_OINDEX,92,[647],0,L_NOBJS,7,[0],0,[0],0);
return L_NOBJS[6];
case 6000:
if((((C_PRSVEC[0]!=C_VINDEX[66])&&(C_PRSVEC[0]!=C_VINDEX[67]))&&(C_PRSVEC[0]!=C_VINDEX[68]))){pc=10;continue L;}
RSPEAK([648],0);
return L_NOBJS[6];
case 7000:
if((((Math.abs((C_PLAY[1]-C_FINDEX[58]))!=1)||(MRHERE(C_PLAY,1)!=0))||(C_PRSVEC[0]!=C_VINDEX[20]))){pc=7100;continue L;}
RSPEAK([860],0);
return L_NOBJS[6];
case 7100:
if((ZAND(C_ROOMS,C_PLAY[1]+801,C_RFLAG,10)==0)){pc=10;continue L;}
RSPEAK([662],0);
return L_NOBJS[6];
case 8000:
if((C_PRSVEC[0]!=C_VINDEX[35])){pc=8100;continue L;}
RSPEAK([666],0);
return L_NOBJS[6];
case 8100:
if((C_PRSVEC[0]!=C_VINDEX[28])){pc=10;continue L;}
RSPEAK([667],0);
return L_NOBJS[6];
case 9000:
if((C_PLAY[1]!=C_RINDEX[85])){pc=9500;continue L;}
if((C_PRSVEC[0]!=C_VINDEX[20])){pc=10;continue L;}
L_NOBJS[7]=1;L_NOBJS[12]=8;
case 100001:
if(L_NOBJS[7]>L_NOBJS[12]){pc=100002;continue L;}
if((C_PRSVEC[2]==C_PUZZLE[L_NOBJS[7]+15])){pc=9200;continue L;}
case 9100:
L_NOBJS[7]+=2;pc=100001;continue L;
case 100002:
BUG([80],0,C_PRSVEC,2);
case 9200:
L_NOBJS[13]=C_PUZZLE[(L_NOBJS[7]+1)+15];
L_NOBJS[14]=(C_FINDEX[67]+L_NOBJS[13]);
L_NOBJS[15]=C_PUZZLE[L_NOBJS[14]+23];
pc=[9300,9300,9300,9250,9350][(L_NOBJS[15]+4)-1];if(pc!==undefined)continue L;
case 9250:
RSPEAK([876],0);
return L_NOBJS[6];
case 9300:
if((C_PUZZLE[(L_NOBJS[14]+L_NOBJS[13])+23]==0)){pc=9400;continue L;}
case 9350:
RSPEAK([877],0);
return L_NOBJS[6];
case 9400:
L_NOBJS[7]=878;
if(C_FINDEX[45]){L_NOBJS[7]=879;}
C_FINDEX[45]=1;
C_PUZZLE[(L_NOBJS[14]+L_NOBJS[13])+23]=L_NOBJS[15];
C_PUZZLE[L_NOBJS[14]+23]=0;
CPGOTO(L_NOBJS,14);
CPINFO(L_NOBJS,7,L_NOBJS,14);
PRINCR([1],0,C_PLAY,1);
C_ROOMS[C_PLAY[1]+801]=ZOR(C_ROOMS,C_PLAY[1]+801,C_RFLAG,0);
return L_NOBJS[6];
case 9500:
if((C_PLAY[1]!=C_SCREEN[2])){pc=9700;continue L;}
L_NOBJS[7]=1;L_NOBJS[16]=12;
case 100003:
if(L_NOBJS[7]>L_NOBJS[16]){pc=100004;continue L;}
L_NOBJS[11]=C_SCREEN[(L_NOBJS[7]+1)+10];
if((C_SCREEN[L_NOBJS[7]+10]==C_PLAY[1])){pc=2100;continue L;}
case 9600:
L_NOBJS[7]+=3;pc=100003;continue L;
case 100004:
case 9700:
if((C_PLAY[1]!=C_RINDEX[59])){pc=10;continue L;}
L_NOBJS[11]=C_OINDEX[118];
pc=2100;continue L;
case 10000:
if((C_PRSVEC[0]!=C_VINDEX[17])){pc=10100;continue L;}
L_NOBJS[7]=749;
if((C_FINDEX[59]==2)){L_NOBJS[7]=750;}
RSPEAK(L_NOBJS,7);
C_FINDEX[59]=2;
return L_NOBJS[6];
case 10100:
if(((C_PRSVEC[0]!=C_VINDEX[18])&&(C_PRSVEC[0]!=C_VINDEX[20]))){pc=10;continue L;}
if((C_FINDEX[59]!=0)){pc=10200;continue L;}
RSPEAK([751],0);
return L_NOBJS[6];
case 10200:
if(((C_FINDEX[57]%180)!=0)){pc=10300;continue L;}
C_FINDEX[59]=0;
RSPEAK([752],0);
return L_NOBJS[6];
case 10300:
if(((C_FINDEX[57]!=270)||(C_FINDEX[58]!=C_RINDEX[65]))){pc=10400;continue L;}
C_FINDEX[59]=0;
RSPEAK([753],0);
return L_NOBJS[6];
case 10400:
RSPEAK([(753+C_FINDEX[59])],0);
C_FINDEX[59]=1;
return L_NOBJS[6];
case 11000:
if((C_PRSVEC[0]!=C_VINDEX[20])){pc=10;continue L;}
if(C_FINDEX[36]){pc=11300;continue L;}
RSPEAK([756],0);
L_NOBJS[7]=1;L_NOBJS[17]=C_OBJCTS[0];
case 100005:
if(L_NOBJS[7]>L_NOBJS[17]){pc=100006;continue L;}
if((QHERE(L_NOBJS,7,C_RINDEX,63)&&(L_NOBJS[7]!=C_OINDEX[98]))){pc=11200;continue L;}
case 11100:
L_NOBJS[7]+=1;pc=100005;continue L;
case 100006:
RSPEAK([757],0);
return L_NOBJS[6];
case 11200:
C_CEVENT[C_CINDEX[20]+50]=1;
C_CEVENT[C_CINDEX[20]]=7;
C_FINDEX[36]=1;
C_FINDEX[37]=1;
return L_NOBJS[6];
case 11300:
RSPEAK([758],0);
return L_NOBJS[6];
case 12000:
if(((C_PRSVEC[0]!=C_VINDEX[40])||(C_PRSVEC[2]!=C_OINDEX[98]))){pc=12100;continue L;}
RSPEAK([759],0);
return L_NOBJS[6];
case 12100:
L_NOBJS[7]=C_PRSVEC[2];
if(((C_PRSVEC[0]==C_VINDEX[52])&&(C_PRSVEC[1]==C_OINDEX[98]))){pc=12200;continue L;}
if((((C_PRSVEC[0]!=C_VINDEX[46])||(C_PRSVEC[2]!=C_OINDEX[98]))||(C_PRSVEC[1]==0))){pc=10;continue L;}
L_NOBJS[7]=C_PRSVEC[1];
case 12200:
if((C_OBJCTS[L_NOBJS[7]+2420]!=C_PLAY[0])){pc=12300;continue L;}
NEWSTA(L_NOBJS,7,[0],0,C_PLAY,1,[0],0,[0],0);
RSPSUB([760],0,C_OBJCTS,L_NOBJS[7]+220);
return L_NOBJS[6];
case 12300:
L_NOBJS[13]=761;
if(QHERE(L_NOBJS,13,C_PLAY,1)){L_NOBJS[7]=762;}
RSPSUB(L_NOBJS,13,C_OBJCTS,L_NOBJS[7]+220);
return L_NOBJS[6];
case 13000:
if(((C_PLAY[1]==C_RINDEX[82])||((C_FINDEX[63]==4)&&((C_PLAY[1]==C_RINDEX[80])||(C_PLAY[1]==C_RINDEX[77]))))){pc=13100;continue L;}
RSPEAK([763],0);
return L_NOBJS[6];
case 13100:
if((!OPNCLS(C_OINDEX,99,[764],0,[765],0))){pc=10;continue L;}
if(((C_PLAY[1]==C_RINDEX[82])&&SF_NOBJS_QOPEN(C_OINDEX[99]))){RSPEAK([766],0);}
return L_NOBJS[6];
case 14000:
if(((C_PRSVEC[0]!=C_VINDEX[33])&&(C_PRSVEC[0]!=C_VINDEX[34]))){pc=14100;continue L;}
RSPEAK([767],0);
return L_NOBJS[6];
case 14100:
if((C_PRSVEC[0]!=C_VINDEX[26])){pc=10;continue L;}
if(C_FINDEX[41]){pc=14200;continue L;}
C_FINDEX[41]=1;
C_CEVENT[C_CINDEX[22]+50]=1;
C_CEVENT[C_CINDEX[22]]=2;
C_FINDEX[60]=ZRND([8],0);
C_FINDEX[61]=0;
C_FINDEX[62]=0;
RSPEAK([768],0);
RSPEAK([769],0);
RSPEAK([(770+C_FINDEX[60])],0);
return L_NOBJS[6];
case 14200:
RSPEAK([798],0);
return L_NOBJS[6];
case 15000:
if((C_PRSVEC[0]!=C_VINDEX[33])){pc=10;continue L;}
RSPEAK([778],0);
return L_NOBJS[6];
case 16000:
L_NOBJS[6]=OPNCLS(C_OINDEX,101,[779],0,[780],0);
return L_NOBJS[6];
case 17000:
if((C_PRSVEC[0]!=C_VINDEX[20])){pc=10;continue L;}
RSPEAK([809],0);
if(SF_NOBJS_QOPEN(C_OINDEX[101])){RSPEAK([810],0);}
L_NOBJS[7]=1;L_NOBJS[18]=C_OBJCTS[0];
case 100007:
if(L_NOBJS[7]>L_NOBJS[18]){pc=100008;continue L;}
if(((C_OBJCTS[L_NOBJS[7]+2200]==C_RINDEX[80])&&(ZAND(C_OBJCTS,L_NOBJS[7]+880,C_OFLAGS,3)==0))){NEWSTA(L_NOBJS,7,[0],0,[Math.imul(C_FINDEX[63],C_HYPER[0])],0,[0],0,[0],0);}
if((C_OBJCTS[L_NOBJS[7]+2200]==Math.imul(C_FINDEX[64],C_HYPER[0]))){NEWSTA(L_NOBJS,7,[0],0,C_RINDEX,80,[0],0,[0],0);}
case 17100:
L_NOBJS[7]+=1;pc=100007;continue L;
case 100008:
C_OBJCTS[C_OINDEX[99]+1100]=ZAND(C_OBJCTS,C_OINDEX[99]+1100,[ZNOT(C_OFLAGS,28)],0);
C_OBJCTS[C_OINDEX[101]+1100]=ZAND(C_OBJCTS,C_OINDEX[101]+1100,[ZNOT(C_OFLAGS,28)],0);
C_OBJCTS[C_OINDEX[99]+880]=ZAND(C_OBJCTS,C_OINDEX[99]+880,[ZNOT(C_OFLAGS,0)],0);
if((C_FINDEX[64]==4)){C_OBJCTS[C_OINDEX[99]+880]=ZOR(C_OBJCTS,C_OINDEX[99]+880,C_OFLAGS,0);}
if((C_ADVS[C_AINDEX[0]]!=C_RINDEX[80])){pc=17400;continue L;}
if((C_FINDEX[63]!=4)){pc=17200;continue L;}
C_OBJCTS[C_OINDEX[99]+880]=ZOR(C_OBJCTS,C_OINDEX[99]+880,C_OFLAGS,0);
L_NOBJS[2]=MOVETO(C_RINDEX,82,C_AINDEX,0);
pc=17400;continue L;
case 17200:
L_NOBJS[2]=MOVETO(C_RINDEX,81,C_AINDEX,0);
case 17400:
C_FINDEX[63]=C_FINDEX[64];
return L_NOBJS[6];
case 18000:
if((C_PRSVEC[0]!=C_VINDEX[37])){pc=18100;continue L;}
C_FINDEX[64]=(ZRND([8],0)+1);
RSPSUB([797],0,[(712+C_FINDEX[64])],0);
return L_NOBJS[6];
case 18100:
if((((C_PRSVEC[0]!=C_VINDEX[30])&&(C_PRSVEC[0]!=C_VINDEX[52]))&&(C_PRSVEC[0]!=C_VINDEX[69]))){pc=10;continue L;}
if((C_PRSVEC[1]!=0)){pc=18200;continue L;}
RSPEAK([806],0);
return L_NOBJS[6];
case 18200:
if(((C_PRSVEC[1]>=C_OINDEX[102])&&(C_PRSVEC[1]<=C_OINDEX[103]))){pc=18300;continue L;}
RSPEAK([807],0);
return L_NOBJS[6];
case 18300:
C_FINDEX[64]=((C_PRSVEC[1]-C_OINDEX[102])+1);
RSPSUB([808],0,[(712+C_FINDEX[64])],0);
return L_NOBJS[6];
case 19000:
L_NOBJS[6]=MIRPAN([832],0,[0],0);
return L_NOBJS[6];
case 20000:
if((C_PLAY[1]!=C_RINDEX[69])){pc=20100;continue L;}
if(((C_PRSVEC[0]!=C_VINDEX[33])&&(C_PRSVEC[0]!=C_VINDEX[34]))){pc=10;continue L;}
RSPEAK([843],0);
return L_NOBJS[6];
case 20100:
L_NOBJS[6]=MIRPAN([838],0,[1],0);
return L_NOBJS[6];
case 21000:
if(((C_PRSVEC[0]!=C_VINDEX[52])||(C_PRSVEC[1]!=C_OINDEX[105]))){pc=10;continue L;}
if((C_PRSVEC[2]!=C_OINDEX[106])){pc=21100;continue L;}
NEWSTA(C_PRSVEC,2,[863],0,[0],0,[0],0,[0],0);
C_FINDEX[44]=1;
C_OBJCTS[C_OINDEX[107]+880]=ZAND(C_OBJCTS,C_OINDEX[107]+880,[ZNOT(C_OFLAGS,0)],0);
return L_NOBJS[6];
case 21100:
if(((ZAND(C_OBJCTS,C_PRSVEC[2]+880,C_OFLAGS,10)==0)&&(ZAND(C_OBJCTS,C_PRSVEC[2]+1100,C_OFLAGS,24)==0))){pc=21200;continue L;}
RSPEAK([(ZRND([5],0)+552)],0);
return L_NOBJS[6];
case 21200:
NEWSTA(C_PRSVEC,2,[0],0,[0],0,[0],0,[0],0);
RSPSUB([864],0,L_NOBJS,8);
return L_NOBJS[6];
return L_NOBJS[6];
}}
/* nobjs.f */
function MIRPAN(ST,ST_,PNF,PNF_){
var pc=0;L:for(;;)switch(pc){case 0:
L_MIRPAN[0]=1;
L_MIRPAN[1]=MRHERE(C_PLAY,1);
if((L_MIRPAN[1]!=0)){pc=100;continue L;}
RSPEAK(ST,ST_);
return L_MIRPAN[0];
case 100:
L_MIRPAN[2]=0;
if((((L_MIRPAN[1]==1)&&(!C_FINDEX[39]))||((L_MIRPAN[1]==2)&&(!C_FINDEX[40])))){L_MIRPAN[2]=1;}
if(((C_PRSVEC[0]!=C_VINDEX[30])&&(C_PRSVEC[0]!=C_VINDEX[33]))){pc=200;continue L;}
RSPEAK([(ST[ST_]+1)],0);
return L_MIRPAN[0];
case 200:
if((PNF[PNF_]||(((C_PRSVEC[0]!=C_VINDEX[62])&&(C_PRSVEC[0]!=C_VINDEX[28]))&&(C_PRSVEC[0]!=C_VINDEX[27])))){pc=300;continue L;}
RSPEAK([(844+L_MIRPAN[2])],0);
return L_MIRPAN[0];
case 300:
if((C_PRSVEC[0]!=C_VINDEX[46])){pc=400;continue L;}
RSPEAK([((ST[ST_]+2)+L_MIRPAN[2])],0);
if(((L_MIRPAN[1]==1)&&(!PNF[PNF_]))){C_FINDEX[39]=0;}
if(((L_MIRPAN[1]==2)&&(!PNF[PNF_]))){C_FINDEX[40]=0;}
return L_MIRPAN[0];
case 400:
if((PNF[PNF_]||(L_MIRPAN[2]==0))){pc=500;continue L;}
RSPEAK([846],0);
return L_MIRPAN[0];
case 500:
if((C_PRSVEC[0]!=C_VINDEX[20])){pc=600;continue L;}
RSPEAK([((ST[ST_]+3)+L_MIRPAN[1])],0);
return L_MIRPAN[0];
case 600:
L_MIRPAN[0]=0;
return L_MIRPAN[0];
return L_MIRPAN[0];
}}
/* nobjs.f */
function SOBJS(RI,RI_,ARG,ARG_){
function SF_SOBJS_QOPEN(R){return (ZAND(C_OBJCTS,R+1100,C_OFLAGS,28)!=0)}
var pc=0;L:for(;;)switch(pc){case 0:
if(!((C_PRSVEC[2]<221)&&(C_PRSVEC[2]>0))){pc=100001;continue L;}
if((C_PRSVEC[2]!=0)){L_SOBJS[7]=C_OBJCTS[C_PRSVEC[2]+220];}
case 100001:
case 100002:
if((C_PRSVEC[1]!=0)){L_SOBJS[8]=C_OBJCTS[C_PRSVEC[1]+220];}
L_SOBJS[9]=C_ADVS[C_PLAY[0]+8];
L_SOBJS[6]=1;
pc=[1000,3000,4000,6000,7000,8000,9000,13000,14000,16000,17000,21000,23000,24000,27000,28000,29000,30000,31000,33000,34000,36000,37000,38000,41000,42000,43000,44000,46000,53000,56000][RI[RI_]-1];if(pc!==undefined)continue L;
BUG([6],0,RI,RI_);
case 10:
L_SOBJS[6]=0;
return L_SOBJS[6];
case 1000:
if((C_OBJCTS[C_OINDEX[2]+2640]==0)){pc=10;continue L;}
NEWSTA(C_OINDEX,2,[122],0,[0],0,[0],0,[0],0);
return L_SOBJS[6];
case 3000:
if((C_PRSVEC[0]!=C_VINDEX[40])){pc=10;continue L;}
RSPEAK([128],0);
return L_SOBJS[6];
case 4000:
if((C_PRSVEC[0]!=C_VINDEX[56])){pc=4100;continue L;}
NEWSTA(C_PRSVEC,2,[129],0,[0],0,[0],0,[0],0);
return L_SOBJS[6];
case 4100:
if((C_PRSVEC[0]!=C_VINDEX[46])){pc=10;continue L;}
NEWSTA(C_PRSVEC,2,[131],0,[0],0,[0],0,[0],0);
return L_SOBJS[6];
case 6000:
if((C_PLAY[1]==C_RINDEX[17])){pc=6100;continue L;}
C_FINDEX[6]=0;
if((C_PRSVEC[0]!=C_VINDEX[21])){pc=6050;continue L;}
RSPEAK([134],0);
return L_SOBJS[6];
case 6050:
if((C_PRSVEC[0]!=C_VINDEX[22])){pc=10;continue L;}
RSPEAK([135],0);
return L_SOBJS[6];
case 6100:
if(((C_PRSVEC[0]!=C_VINDEX[22])||(C_PRSVEC[1]!=C_OINDEX[47]))){pc=6200;continue L;}
if(C_FINDEX[6]){pc=6150;continue L;}
C_FINDEX[6]=1;
C_OBJCTS[C_OINDEX[9]+880]=ZOR(C_OBJCTS,C_OINDEX[9]+880,C_OFLAGS,6);
C_OBJCTS[C_OINDEX[9]+1100]=ZOR(C_OBJCTS,C_OINDEX[9]+1100,C_OFLAGS,20);
NEWSTA(C_OINDEX,9,[137],0,C_RINDEX,17,[0],0,[0],0);
return L_SOBJS[6];
case 6150:
RSPEAK([136],0);
return L_SOBJS[6];
case 6200:
if((C_PRSVEC[0]!=C_VINDEX[21])){pc=6300;continue L;}
if(C_FINDEX[6]){pc=6250;continue L;}
RSPEAK([134],0);
return L_SOBJS[6];
case 6250:
C_FINDEX[6]=0;
C_OBJCTS[C_OINDEX[9]+880]=ZAND(C_OBJCTS,C_OINDEX[9]+880,[ZNOT(C_OFLAGS,6)],0);
C_OBJCTS[C_OINDEX[9]+1100]=ZAND(C_OBJCTS,C_OINDEX[9]+1100,[ZNOT(C_OFLAGS,20)],0);
RSPEAK([139],0);
return L_SOBJS[6];
case 6300:
if((C_FINDEX[6]||(C_PRSVEC[0]!=C_VINDEX[53]))){pc=6400;continue L;}
NEWSTA(C_OINDEX,9,[140],0,C_RINDEX,18,[0],0,[0],0);
return L_SOBJS[6];
case 6400:
if(((C_PRSVEC[0]!=C_VINDEX[40])||(!C_FINDEX[6]))){pc=10;continue L;}
RSPEAK([141],0);
return L_SOBJS[6];
case 7000:
if(((C_PRSVEC[0]==C_VINDEX[40])&&(C_PLAY[0]==C_AINDEX[0]))){C_HACK[3]=1;}
pc=10;continue L;
case 8000:
if((C_PRSVEC[0]!=C_VINDEX[56])){pc=8100;continue L;}
NEWSTA(C_OINDEX,12,[0],0,[0],0,[0],0,[0],0);
NEWSTA(C_OINDEX,13,[142],0,C_PLAY,1,[0],0,[0],0);
return L_SOBJS[6];
case 8100:
if((C_PRSVEC[0]==C_VINDEX[31])){C_CEVENT[C_CINDEX[2]+50]=1;}
if((C_PRSVEC[0]==C_VINDEX[32])){C_CEVENT[C_CINDEX[2]+50]=0;}
pc=10;continue L;
case 9000:
if((C_PRSVEC[0]!=C_VINDEX[17])){pc=9100;continue L;}
RSPEAK([143],0);
return L_SOBJS[6];
case 9100:
if((C_PRSVEC[0]!=C_VINDEX[40])){pc=9200;continue L;}
RSPEAK([144],0);
return L_SOBJS[6];
case 9200:
if((C_PRSVEC[0]!=C_VINDEX[30])){pc=9300;continue L;}
RSPEAK([(145+C_FINDEX[53])],0);
C_FINDEX[53]=1;
C_OBJCTS[C_OINDEX[43]+880]=ZOR(C_OBJCTS,C_OINDEX[43]+880,C_OFLAGS,0);
return L_SOBJS[6];
case 9300:
if((((C_PRSVEC[0]!=C_VINDEX[63])||(C_FINDEX[53]!=0))||SF_SOBJS_QOPEN(C_OINDEX[43]))){pc=10;continue L;}
RSPEAK([345],0);
return L_SOBJS[6];
case 13000:
L_SOBJS[10]=(ROBRM(C_PLAY,1,[100],0,C_RINDEX,21,[0],0,[0],0)+ROBADV(C_PLAY,0,C_RINDEX,21,[0],0,[0],0));
if((L_SOBJS[10]!=0)){RSPEAK([162],0);}
return L_SOBJS[6];
case 14000:
if((C_FINDEX[17]||(C_PRSVEC[0]!=C_VINDEX[19]))){pc=14500;continue L;}
L_SOBJS[11]=ZXOR(C_PLAY,1,[1],0);
L_SOBJS[10]=1;L_SOBJS[12]=C_OBJCTS[0];
case 100003:
if(L_SOBJS[10]>L_SOBJS[12]){pc=100004;continue L;}
if((C_OBJCTS[L_SOBJS[10]+2200]==C_PLAY[1])){C_OBJCTS[L_SOBJS[10]+2200]=(-1);}
if((C_OBJCTS[L_SOBJS[10]+2200]==L_SOBJS[11])){C_OBJCTS[L_SOBJS[10]+2200]=C_PLAY[1];}
if((C_OBJCTS[L_SOBJS[10]+2200]==(-1))){C_OBJCTS[L_SOBJS[10]+2200]=L_SOBJS[11];}
case 14100:
L_SOBJS[10]+=1;pc=100003;continue L;
case 100004:
L_SOBJS[5]=MOVETO(L_SOBJS,11,C_PLAY,0);
RSPEAK([163],0);
return L_SOBJS[6];
case 14500:
if((((C_PRSVEC[0]!=C_VINDEX[27])&&(C_PRSVEC[0]!=C_VINDEX[62]))&&(C_PRSVEC[0]!=C_VINDEX[28]))){pc=14600;continue L;}
L_SOBJS[10]=164;
if(C_FINDEX[17]){L_SOBJS[10]=165;}
RSPEAK(L_SOBJS,10);
return L_SOBJS[6];
case 14600:
if((C_PRSVEC[0]!=C_VINDEX[40])){pc=14700;continue L;}
RSPEAK([166],0);
return L_SOBJS[6];
case 14700:
if(((C_PRSVEC[0]!=C_VINDEX[46])&&(C_PRSVEC[0]!=C_VINDEX[56]))){pc=10;continue L;}
L_SOBJS[10]=167;
if(C_FINDEX[17]){L_SOBJS[10]=168;}
C_FINDEX[17]=1;
C_FINDEX[33]=1;
RSPEAK(L_SOBJS,10);
return L_SOBJS[6];
case 16000:
if((C_PRSVEC[0]!=C_VINDEX[17])){pc=16100;continue L;}
if(C_FINDEX[27]){pc=16400;continue L;}
NEWSTA(C_OINDEX,24,[175],0,C_RINDEX,14,[0],0,[0],0);
NEWSTA(C_OINDEX,25,[0],0,C_RINDEX,15,[0],0,[0],0);
C_FINDEX[27]=1;
return L_SOBJS[6];
case 16100:
if((C_PRSVEC[0]!=C_VINDEX[18])){pc=16200;continue L;}
if((!C_FINDEX[27])){pc=16400;continue L;}
NEWSTA(C_OINDEX,24,[176],0,C_RINDEX,15,[0],0,[0],0);
NEWSTA(C_OINDEX,25,[0],0,C_RINDEX,14,[0],0,[0],0);
C_FINDEX[27]=0;
if((!LIT(C_PLAY,1))){RSPEAK([406],0);}
return L_SOBJS[6];
case 16200:
if(((C_PRSVEC[2]!=C_OINDEX[25])&&(C_PRSVEC[1]!=C_OINDEX[25]))){pc=16300;continue L;}
RSPEAK([130],0);
return L_SOBJS[6];
case 16300:
if((C_PRSVEC[0]!=C_VINDEX[40])){pc=10;continue L;}
RSPEAK([177],0);
return L_SOBJS[6];
case 16400:
RSPEAK([(125+ZRND([3],0))],0);
return L_SOBJS[6];
case 17000:
L_SOBJS[10]=178;
if((C_PRSVEC[2]!=C_OINDEX[27])){L_SOBJS[10]=179;}
RSPEAK(L_SOBJS,10);
return L_SOBJS[6];
case 21000:
if(((C_PRSVEC[0]!=C_VINDEX[52])||(C_PRSVEC[1]!=C_OINDEX[33]))){pc=10;continue L;}
RSPEAK([186],0);
return L_SOBJS[6];
case 23000:
if(((((((C_PRSVEC[0]!=C_VINDEX[40])||(C_OBJCTS[C_PRSVEC[2]+2640]!=0))||(C_OBJCTS[C_PRSVEC[2]+2200]!=C_RINDEX[26]))||(C_OBJCTS[C_OINDEX[39]+2200]!=C_RINDEX[26]))||(ZAND(C_OBJCTS,C_OINDEX[39]+1100,C_OFLAGS,23)==0))||(!C_HACK[2]))){pc=10;continue L;}
RSPEAK([204],0);
return L_SOBJS[6];
case 24000:
if((C_PRSVEC[0]!=C_VINDEX[46])){pc=10;continue L;}
RSPEAK([205],0);
C_OBJCTS[C_PRSVEC[2]+1320]=0;
C_OBJCTS[C_PRSVEC[2]+1540]=0;
C_OBJCTS[C_PRSVEC[2]]=207;
C_OBJCTS[C_PRSVEC[2]+220]=206;
return L_SOBJS[6];
case 27000:
if((C_PRSVEC[0]!=C_VINDEX[24])){pc=10;continue L;}
if((C_PRSVEC[1]!=C_OINDEX[35])){pc=27500;continue L;}
if(C_FINDEX[25]){pc=27100;continue L;}
RSPEAK([210],0);
return L_SOBJS[6];
case 27100:
if(C_FINDEX[5]){pc=27200;continue L;}
C_FINDEX[5]=1;
RSPEAK([211],0);
C_OBJCTS[C_OINDEX[22]+1100]=ZAND(C_OBJCTS,C_OINDEX[22]+1100,[ZNOT(C_OFLAGS,18)],0);
C_OBJCTS[C_OINDEX[28]+880]=ZOR(C_OBJCTS,C_OINDEX[28]+880,C_OFLAGS,0);
C_ROOMS[C_RINDEX[10]+801]=ZAND([ZOR(C_ROOMS,C_RINDEX[10]+801,C_RFLAG,2)],0,[ZNOT([(C_RFLAG[3]+C_RFLAG[0])],0)],0);
return L_SOBJS[6];
case 27200:
C_FINDEX[5]=0;
RSPEAK([212],0);
if(QHERE(C_OINDEX,28,C_RINDEX,10)){C_OBJCTS[C_OINDEX[28]+880]=ZAND(C_OBJCTS,C_OINDEX[28]+880,[ZNOT(C_OFLAGS,0)],0);}
C_ROOMS[C_RINDEX[10]+801]=ZAND([ZOR(C_ROOMS,C_RINDEX[10]+801,C_RFLAG,3)],0,[ZNOT(C_RFLAG,2)],0);
return L_SOBJS[6];
case 27500:
RSPSUB([299],0,L_SOBJS,8);
return L_SOBJS[6];
case 28000:
if(((C_PRSVEC[0]!=C_VINDEX[33])&&(C_PRSVEC[0]!=C_VINDEX[34]))){pc=10;continue L;}
if(C_FINDEX[24]){pc=28200;continue L;}
RSPEAK([214],0);
return L_SOBJS[6];
case 28200:
L_SOBJS[10]=215;
if((C_PLAY[1]!=C_RINDEX[9])){L_SOBJS[10]=216;}
L_SOBJS[6]=OPNCLS(C_OINDEX,42,L_SOBJS,10,[885],0);
C_ROOMS[C_RINDEX[5]+801]=ZAND(C_ROOMS,C_RINDEX[5]+801,[ZNOT(C_RFLAG,1)],0);
if(SF_SOBJS_QOPEN(C_OINDEX[42])){C_ROOMS[C_RINDEX[5]+801]=ZOR(C_ROOMS,C_RINDEX[5]+801,C_RFLAG,1);}
if((!LIT(C_PLAY,1))){RSPEAK([406],0);}
return L_SOBJS[6];
case 29000:
if((C_PLAY[1]!=C_RINDEX[1])){pc=29100;continue L;}
L_SOBJS[6]=OPNCLS(C_OINDEX,43,[218],0,[219],0);
return L_SOBJS[6];
case 29100:
if((C_PLAY[1]!=C_RINDEX[2])){pc=10;continue L;}
if(((C_PRSVEC[0]!=C_VINDEX[33])||SF_SOBJS_QOPEN(C_OINDEX[43]))){pc=29200;continue L;}
RSPEAK([220],0);
return L_SOBJS[6];
case 29200:
L_SOBJS[6]=OPNCLS(C_OINDEX,43,[0],0,[22],0);
return L_SOBJS[6];
case 30000:
L_SOBJS[10]=0;
if((C_PRSVEC[0]==C_VINDEX[33])){L_SOBJS[10]=221;}
if((C_PRSVEC[0]==C_VINDEX[45])){L_SOBJS[10]=222;}
if((C_PRSVEC[0]==C_VINDEX[46])){L_SOBJS[10]=(223+ZRND([3],0));}
if((L_SOBJS[10]==0)){pc=10;continue L;}
RSPEAK(L_SOBJS,10);
return L_SOBJS[6];
case 31000:
if((C_PRSVEC[0]!=C_VINDEX[24])){pc=10;continue L;}
if((C_PRSVEC[1]!=C_OINDEX[36])){pc=31500;continue L;}
if(SF_SOBJS_QOPEN(C_OINDEX[4])){pc=31600;continue L;}
RSPEAK([226],0);
if((C_OBJCTS[C_OINDEX[3]+2640]!=C_OINDEX[4])){pc=31400;continue L;}
NEWSTA(C_OINDEX,3,[0],0,[0],0,[0],0,[0],0);
NEWSTA(C_OINDEX,5,[0],0,[0],0,C_OINDEX,4,[0],0);
return L_SOBJS[6];
case 31400:
L_SOBJS[10]=1;L_SOBJS[13]=C_OBJCTS[0];
case 100005:
if(L_SOBJS[10]>L_SOBJS[13]){pc=100006;continue L;}
if((C_OBJCTS[L_SOBJS[10]+2640]!=C_OINDEX[4])){pc=31450;continue L;}
NEWSTA(L_SOBJS,10,[0],0,[0],0,[0],0,[0],0);
NEWSTA(C_OINDEX,2,[0],0,[0],0,C_OINDEX,4,[0],0);
case 31450:
L_SOBJS[10]+=1;pc=100005;continue L;
case 100006:
return L_SOBJS[6];
case 31500:
RSPSUB([300],0,L_SOBJS,8);
return L_SOBJS[6];
case 31600:
RSPEAK([227],0);
return L_SOBJS[6];
case 33000:
if((((C_PRSVEC[2]!=C_OINDEX[45])||(C_PRSVEC[0]!=C_VINDEX[14]))||(C_FINDEX[48]<=0))){pc=10;continue L;}
if((C_PRSVEC[1]!=C_OINDEX[34])){pc=33100;continue L;}
C_FINDEX[48]=(-1);
C_CEVENT[C_CINDEX[1]]=0;
RSPEAK([577],0);
return L_SOBJS[6];
case 33100:
RSPSUB([301],0,L_SOBJS,8);
return L_SOBJS[6];
case 34000:
if((C_PRSVEC[0]!=C_VINDEX[20])){pc=10;continue L;}
pc=[34100,34200,34300,34400][((C_PRSVEC[2]-C_OINDEX[46])+1)-1];if(pc!==undefined)continue L;
pc=10;continue L;
case 34100:
C_ROOMS[C_PLAY[1]+801]=ZXOR(C_ROOMS,C_PLAY[1]+801,C_RFLAG,1);
L_SOBJS[10]=230;
if((ZAND(C_ROOMS,C_PLAY[1]+801,C_RFLAG,1)!=0)){L_SOBJS[10]=231;}
RSPEAK(L_SOBJS,10);
return L_SOBJS[6];
case 34200:
C_FINDEX[25]=1;
RSPEAK([232],0);
return L_SOBJS[6];
case 34300:
C_FINDEX[25]=0;
RSPEAK([232],0);
return L_SOBJS[6];
case 34400:
if((C_FINDEX[48]!=0)){pc=34500;continue L;}
RSPEAK([233],0);
C_FINDEX[48]=1;
C_CEVENT[C_CINDEX[1]]=(-1);
return L_SOBJS[6];
case 34500:
RSPEAK([234],0);
return L_SOBJS[6];
case 36000:
if((C_PRSVEC[0]!=C_VINDEX[10])){pc=10;continue L;}
if((C_OBJCTS[C_OINDEX[50]+2200]!=0)){pc=36100;continue L;}
RSPEAK([235],0);
return L_SOBJS[6];
case 36100:
if((C_PRSVEC[1]!=C_OINDEX[52])){pc=36200;continue L;}
NEWSTA(C_OINDEX,50,[0],0,[0],0,[0],0,[0],0);
NEWSTA(C_OINDEX,53,[236],0,C_PLAY,1,[0],0,[0],0);
C_FINDEX[29]=0;
return L_SOBJS[6];
case 36200:
L_SOBJS[10]=237;
if((C_PRSVEC[1]!=C_OINDEX[110])){L_SOBJS[10]=303;}
RSPSUB(L_SOBJS,10,L_SOBJS,8);
return L_SOBJS[6];
case 37000:
if((C_PRSVEC[0]!=C_VINDEX[10])){pc=37100;continue L;}
RSPEAK([238],0);
return L_SOBJS[6];
case 37100:
if((C_PRSVEC[0]!=C_VINDEX[14])){pc=10;continue L;}
if((C_PRSVEC[1]!=C_OINDEX[34])){pc=33100;continue L;}
NEWSTA(C_OINDEX,50,[239],0,C_OBJCTS,C_OINDEX[51]+2200,C_OBJCTS,C_OINDEX[51]+2640,C_OBJCTS,C_OINDEX[51]+2420);
NEWSTA(C_OINDEX,51,[0],0,[0],0,[0],0,[0],0);
return L_SOBJS[6];
case 38000:
if((ARG[ARG_]!=0)){pc=10;continue L;}
if(((C_PRSVEC[0]!=C_VINDEX[38])||(C_OBJCTS[C_OINDEX[54]+2420]!=C_PLAY[0]))){pc=38100;continue L;}
NEWSTA(C_OINDEX,53,[0],0,[0],0,[0],0,[0],0);
NEWSTA(C_OINDEX,51,[240],0,C_PLAY,1,[0],0,[0],0);
C_FINDEX[29]=1;
return L_SOBJS[6];
case 38100:
if((C_PRSVEC[0]!=C_VINDEX[10])){pc=38200;continue L;}
RSPEAK([367],0);
return L_SOBJS[6];
case 38200:
if((C_PRSVEC[0]!=C_VINDEX[11])){pc=10;continue L;}
if((L_SOBJS[9]==C_OINDEX[53])){pc=38300;continue L;}
if((C_OBJCTS[C_OINDEX[53]+2200]==0)){pc=38400;continue L;}
NEWSTA(C_OINDEX,53,[0],0,[0],0,[0],0,[0],0);
NEWSTA(C_OINDEX,50,[241],0,C_PLAY,1,[0],0,[0],0);
C_FINDEX[29]=1;
return L_SOBJS[6];
case 38300:
RSPEAK([242],0);
return L_SOBJS[6];
case 38400:
RSPEAK([243],0);
return L_SOBJS[6];
case 41000:
if((((C_PRSVEC[0]!=C_VINDEX[22])||(C_PRSVEC[2]!=C_OINDEX[60]))||((C_PRSVEC[1]!=C_OINDEX[61])&&(C_PRSVEC[1]!=C_OINDEX[62])))){pc=41500;continue L;}
C_FINDEX[46]=C_PRSVEC[1];
C_CEVENT[C_CINDEX[5]+50]=0;
RSPEAK([248],0);
return L_SOBJS[6];
case 41500:
if(((C_PRSVEC[0]!=C_VINDEX[21])||(C_PRSVEC[2]!=C_OINDEX[60]))){pc=10;continue L;}
if((C_FINDEX[46]!=0)){pc=41600;continue L;}
RSPEAK([249],0);
return L_SOBJS[6];
case 41600:
RSPEAK([250],0);
C_FINDEX[46]=0;
C_CEVENT[C_CINDEX[5]]=3;
C_CEVENT[C_CINDEX[5]+50]=1;
return L_SOBJS[6];
case 42000:
L_SOBJS[10]=0;
if((C_PRSVEC[0]==C_VINDEX[40])){L_SOBJS[10]=251;}
if(((C_PRSVEC[0]==C_VINDEX[33])&&C_FINDEX[14])){L_SOBJS[10]=253;}
if(((C_PRSVEC[0]==C_VINDEX[33])&&(!C_FINDEX[14]))){L_SOBJS[10]=254;}
if(((C_PRSVEC[0]==C_VINDEX[34])&&C_FINDEX[14])){L_SOBJS[10]=253;}
if(((C_PRSVEC[0]==C_VINDEX[34])&&(!C_FINDEX[14]))){L_SOBJS[10]=255;}
if((L_SOBJS[10]==0)){pc=10;continue L;}
RSPEAK(L_SOBJS,10);
return L_SOBJS[6];
case 43000:
if((C_PRSVEC[0]!=C_VINDEX[45])){pc=10;continue L;}
RSPEAK([256],0);
C_CEVENT[C_CINDEX[7]]=2;
return L_SOBJS[6];
case 44000:
if(((C_PRSVEC[0]!=C_VINDEX[54])&&(C_PRSVEC[0]!=C_VINDEX[56]))){pc=44500;continue L;}
if((C_OBJCTS[C_PRSVEC[2]+1540]==0)){pc=44100;continue L;}
RSPSUB([257],0,L_SOBJS,7);
NEWSTA(C_PRSVEC,2,[0],0,[0],0,[0],0,[0],0);
NEWSTA(C_OINDEX,67,[0],0,[0],0,[0],0,[0],0);
C_FINDEX[16]=1;
return L_SOBJS[6];
case 44100:
RSPSUB([258],0,L_SOBJS,7);
NEWSTA(C_PRSVEC,2,[0],0,[0],0,[0],0,[0],0);
return L_SOBJS[6];
case 44500:
RSPEAK([259],0);
if((!C_FINDEX[15])){C_CEVENT[C_CINDEX[11]]=5;}
C_FINDEX[15]=1;
return L_SOBJS[6];
case 46000:
if(((C_PRSVEC[0]!=C_VINDEX[56])&&(C_PRSVEC[0]!=C_VINDEX[46]))){pc=10;continue L;}
NEWSTA(C_PRSVEC,2,[262],0,[0],0,[0],0,[0],0);
return L_SOBJS[6];
case 53000:
if((C_PRSVEC[0]!=C_VINDEX[54])){pc=53200;continue L;}
NEWSTA(C_PRSVEC,2,[0],0,[0],0,[0],0,C_AINDEX,1);
RSPSUB([302],0,L_SOBJS,7);
return L_SOBJS[6];
case 53200:
if(((C_PRSVEC[0]!=C_VINDEX[46])&&(C_PRSVEC[0]!=C_VINDEX[56]))){pc=10;continue L;}
NEWSTA(C_OINDEX,84,[285],0,[0],0,[0],0,[0],0);
return L_SOBJS[6];
case 56000:
if((C_PRSVEC[0]!=C_VINDEX[28])){pc=56100;continue L;}
RSPEAK([288],0);
return L_SOBJS[6];
case 56100:
if((C_PRSVEC[0]!=C_VINDEX[35])){pc=10;continue L;}
RSPEAK([289],0);
return L_SOBJS[6];
return L_SOBJS[6];
}}
/* np.f */
function SPARSE(LBUF,LBUF_,LLNT,LLNT_,VBFLAG,VBFLAG_){
function SF_SPARSE_OTEST(R){return ((R>0)&&(R<L_SPARSE[22]))}
var pc=0;L:for(;;)switch(pc){case 0:
L_SPARSE[4]=(-1);
L_SPARSE[5]=0;
C_PV[0]=0;
L_SPARSE[6]=0;
L_SPARSE[7]=0;
C_PV[1]=0;
C_PV[2]=0;
C_PV[3]=0;
C_PV[4]=0;
L_SPARSE[8]=20;
L_SPARSE[9]=45;
L_SPARSE[10]=75;
L_SPARSE[11]=1;
case 9801:
L_SPARSE[12]=LBUF[LBUF_+L_SPARSE[11]-1];
L_SPARSE[13]=LBUF[LBUF_+(L_SPARSE[11]+1)-1];
if((L_SPARSE[12]==0)){pc=1500;continue L;}
L_SPARSE[14]=1;L_SPARSE[15]=L_SPARSE[8];
case 100001:
if(L_SPARSE[14]>L_SPARSE[15]){pc=100002;continue L;}
if(((L_SPARSE[12]==C_BUZVOC[L_SPARSE[14]-1])&&(L_SPARSE[13]==C_BUZVOC[(L_SPARSE[14]+1)-1]))){pc=1000;continue L;}
case 50:
L_SPARSE[14]+=2;pc=100001;continue L;
case 100002:
if((C_PV[0]!=0)){pc=75;continue L;}
L_SPARSE[14]=1;
case 125:
if(((L_SPARSE[12]==C_VRBVOC[L_SPARSE[14]-1])&&(L_SPARSE[13]==C_VRBVOC[(L_SPARSE[14]+1)-1]))){pc=3000;continue L;}
case 150:
L_SPARSE[14]=(L_SPARSE[14]+2);
if((!SF_SPARSE_OTEST(C_VRBVOC[L_SPARSE[14]-1]))){pc=125;continue L;}
L_SPARSE[14]=((L_SPARSE[14]+C_VRBVOC[L_SPARSE[14]-1])+1);
if((C_VRBVOC[L_SPARSE[14]-1]!=(-1))){pc=125;continue L;}
case 75:
if(((C_PV[0]!=0)&&((C_VRBVOC[C_PV[0]-1]!=L_SPARSE[16])||(L_SPARSE[6]!=0)))){pc=200;continue L;}
L_SPARSE[14]=1;L_SPARSE[17]=L_SPARSE[10];
case 100003:
if(L_SPARSE[14]>L_SPARSE[17]){pc=100004;continue L;}
if(((L_SPARSE[12]==C_DIRVOC[L_SPARSE[14]-1])&&(L_SPARSE[13]==C_DIRVOC[(L_SPARSE[14]+1)-1]))){pc=2000;continue L;}
case 100:
L_SPARSE[14]+=3;pc=100003;continue L;
case 100004:
case 200:
L_SPARSE[14]=1;L_SPARSE[18]=L_SPARSE[9];
case 100005:
if(L_SPARSE[14]>L_SPARSE[18]){pc=100006;continue L;}
if(((L_SPARSE[12]==C_PRPVOC[L_SPARSE[14]-1])&&(L_SPARSE[13]==C_PRPVOC[(L_SPARSE[14]+1)-1]))){pc=4000;continue L;}
case 250:
L_SPARSE[14]+=3;pc=100005;continue L;
case 100006:
L_SPARSE[14]=1;
case 300:
if(((L_SPARSE[12]==C_ADJVOC[L_SPARSE[14]-1])&&(L_SPARSE[13]==C_ADJVOC[(L_SPARSE[14]+1)-1]))){pc=5000;continue L;}
L_SPARSE[14]=(L_SPARSE[14]+1);
case 325:
L_SPARSE[14]=(L_SPARSE[14]+1);
if(SF_SPARSE_OTEST(C_ADJVOC[L_SPARSE[14]-1])){pc=325;continue L;}
if((C_ADJVOC[L_SPARSE[14]-1]!=(-1))){pc=300;continue L;}
L_SPARSE[14]=1;
case 450:
if(((L_SPARSE[12]==C_OBJVOC[L_SPARSE[14]-1])&&(L_SPARSE[13]==C_OBJVOC[(L_SPARSE[14]+1)-1]))){pc=600;continue L;}
L_SPARSE[14]=(L_SPARSE[14]+1);
case 500:
L_SPARSE[14]=(L_SPARSE[14]+1);
if(SF_SPARSE_OTEST(C_OBJVOC[L_SPARSE[14]-1])){pc=500;continue L;}
if((C_OBJVOC[L_SPARSE[14]-1]!=(-1))){pc=450;continue L;}
if(VBFLAG[VBFLAG_]){RSPEAK([601],0);}
return L_SPARSE[4];
case 600:
L_SPARSE[19]=GETOBJ(L_SPARSE,14,L_SPARSE,5,[0],0);
if((L_SPARSE[19]<=0)){pc=6000;continue L;}
if((L_SPARSE[19]!=C_OINDEX[114])){pc=650;continue L;}
L_SPARSE[19]=GETOBJ([0],0,[0],0,C_LAST,0);
if((L_SPARSE[19]<=0)){pc=6000;continue L;}
case 650:
if((L_SPARSE[6]==9)){pc=8000;continue L;}
if((L_SPARSE[7]==2)){pc=7000;continue L;}
L_SPARSE[7]=(L_SPARSE[7]+1);
if((L_SPARSE[7]==1)){C_PV[1]=L_SPARSE[19];}
if((L_SPARSE[7]==2)){C_PV[2]=L_SPARSE[19];}
if((L_SPARSE[7]==1)){C_PV[3]=L_SPARSE[6];}
if((L_SPARSE[7]==2)){C_PV[4]=L_SPARSE[6];}
case 700:
L_SPARSE[6]=0;
L_SPARSE[5]=0;
case 1000:
L_SPARSE[11]=(L_SPARSE[11]+2);
if((L_SPARSE[11]<=LLNT[LLNT_])){pc=9801;continue L;}
case 1500:
if((C_PV[0]==0)){C_PV[0]=ZAND(C_ORPHS,0,C_ORPHS,1);}
if((C_PV[0]==0)){pc=9000;continue L;}
if((L_SPARSE[5]!=0)){pc=10000;continue L;}
if(((((((C_ORPHS[0]!=0)&&(C_ORPHS[3]!=0))&&(L_SPARSE[6]==0))&&(C_PV[1]!=0))&&(C_PV[2]==0))&&(C_PV[0]==C_ORPHS[1]))){pc=11000;continue L;}
L_SPARSE[4]=0;
if((L_SPARSE[6]==0)){pc=1750;continue L;}
if((L_SPARSE[7]==1)){L_SPARSE[20]=C_PV[3];}
if((L_SPARSE[7]==2)){L_SPARSE[20]=C_PV[4];}
if(((L_SPARSE[7]==0)||(L_SPARSE[20]!=0))){pc=12000;continue L;}
if((L_SPARSE[7]==1)){C_PV[3]=L_SPARSE[6];}
if((L_SPARSE[7]==2)){C_PV[4]=L_SPARSE[6];}
case 1750:
return L_SPARSE[4];
case 2000:
C_PRSVEC[0]=C_VINDEX[50];
C_PRSVEC[2]=C_DIRVOC[(L_SPARSE[14]+2)-1];
L_SPARSE[4]=1;
return L_SPARSE[4];
case 3000:
C_PV[0]=L_SPARSE[14];
C_ORPHS[1]=0;
pc=1000;continue L;
case 4000:
if((L_SPARSE[6]!=0)){pc=4500;continue L;}
L_SPARSE[6]=C_PRPVOC[(L_SPARSE[14]+2)-1];
L_SPARSE[5]=0;
pc=1000;continue L;
case 4500:
if(VBFLAG[VBFLAG_]){RSPEAK([616],0);}
return L_SPARSE[4];
case 5000:
L_SPARSE[5]=L_SPARSE[14];
L_SPARSE[14]=ZAND(C_ORPHS,4,C_ORPHS,0);
if(((L_SPARSE[14]!=0)&&(L_SPARSE[11]>=LLNT[LLNT_]))){pc=600;continue L;}
pc=1000;continue L;
case 6000:
if((L_SPARSE[19]<0)){pc=6100;continue L;}
L_SPARSE[11]=579;
if(LIT(C_PLAY,1)){L_SPARSE[11]=618;}
if(VBFLAG[VBFLAG_]){RSPEAK(L_SPARSE,11);}
return L_SPARSE[4];
case 6100:
if((L_SPARSE[19]!=(-10000))){pc=6200;continue L;}
if(VBFLAG[VBFLAG_]){RSPSUB([620],0,C_OBJCTS,C_ADVS[C_PLAY[0]+8]+220);}
return L_SPARSE[4];
case 6200:
if(VBFLAG[VBFLAG_]){RSPEAK([619],0);}
if((C_PV[0]==0)){C_PV[0]=ZAND(C_ORPHS,0,C_ORPHS,1);}
ORPHAN([(-1)],0,C_PV,0,C_PV,1,L_SPARSE,6,L_SPARSE,14);
return L_SPARSE[4];
case 7000:
if(VBFLAG[VBFLAG_]){RSPEAK([617],0);}
return L_SPARSE[4];
case 8000:
if((L_SPARSE[7]==1)){L_SPARSE[21]=C_PV[1];}
if((L_SPARSE[7]==2)){L_SPARSE[21]=C_PV[2];}
if((L_SPARSE[21]==L_SPARSE[19])){pc=700;continue L;}
if(VBFLAG[VBFLAG_]){RSPEAK([601],0);}
return L_SPARSE[4];
case 9000:
if((C_PV[1]==0)){pc=10000;continue L;}
if(VBFLAG[VBFLAG_]){RSPSUB([621],0,C_OBJCTS,C_PV[1]+220);}
ORPHAN([(-1)],0,[0],0,C_PV,1,[0],0,[0],0);
return L_SPARSE[4];
case 10000:
if(VBFLAG[VBFLAG_]){RSPEAK([622],0);}
return L_SPARSE[4];
case 11000:
if((C_ORPHS[2]!=0)){pc=11500;continue L;}
C_PV[3]=C_ORPHS[3];
pc=1750;continue L;
case 11500:
C_PV[2]=C_PV[1];
C_PV[4]=C_ORPHS[3];
C_PV[1]=C_ORPHS[2];
C_PV[3]=0;
pc=1750;continue L;
case 12000:
ORPHAN([(-1)],0,C_PV,0,[0],0,L_SPARSE,6,[0],0);
pc=1750;continue L;
return L_SPARSE[4];
}}
/* np.f */
function GETOBJ(OIDX,OIDX_,AIDX,AIDX_,SPCOBJ,SPCOBJ_){
var pc=0;L:for(;;)switch(pc){case 0:
L_GETOBJ[3]=0;
L_GETOBJ[6]=C_ADVS[C_PLAY[0]+8];
L_GETOBJ[7]=0;
if((!LIT(C_PLAY,1))){pc=200;continue L;}
L_GETOBJ[7]=SCHLST(OIDX,OIDX_,AIDX,AIDX_,C_PLAY,1,[0],0,[0],0,SPCOBJ,SPCOBJ_);
if(L_GETOBJ[7]<0){pc=1000;continue L;}if(L_GETOBJ[7]==0){pc=200;continue L;}pc=100;continue L;
case 100:
if((((L_GETOBJ[6]==0)||(L_GETOBJ[6]==L_GETOBJ[7]))||(ZAND(C_OBJCTS,L_GETOBJ[7]+1100,C_OFLAGS,16)!=0))){pc=200;continue L;}
if((C_OBJCTS[L_GETOBJ[7]+2640]==L_GETOBJ[6])){pc=200;continue L;}
L_GETOBJ[3]=1;
case 200:
if((L_GETOBJ[6]==0)){pc=400;continue L;}
L_GETOBJ[8]=SCHLST(OIDX,OIDX_,AIDX,AIDX_,[0],0,L_GETOBJ,6,[0],0,SPCOBJ,SPCOBJ_);
if(L_GETOBJ[8]<0){pc=1100;continue L;}if(L_GETOBJ[8]==0){pc=400;continue L;}pc=300;continue L;
case 300:
L_GETOBJ[3]=0;
if((L_GETOBJ[7]==L_GETOBJ[8])){pc=400;continue L;}
if((L_GETOBJ[7]!=0)){L_GETOBJ[8]=(-L_GETOBJ[8]);}
L_GETOBJ[7]=L_GETOBJ[8];
case 400:
L_GETOBJ[8]=SCHLST(OIDX,OIDX_,AIDX,AIDX_,[0],0,[0],0,C_PLAY,0,SPCOBJ,SPCOBJ_);
if(L_GETOBJ[8]<0){pc=1100;continue L;}if(L_GETOBJ[8]==0){pc=600;continue L;}pc=500;continue L;
case 500:
if((L_GETOBJ[7]!=0)){L_GETOBJ[8]=(-L_GETOBJ[8]);}
case 1100:
L_GETOBJ[7]=L_GETOBJ[8];
case 600:
if(L_GETOBJ[3]){L_GETOBJ[7]=(-10000);}
case 1000:
L_GETOBJ[5]=L_GETOBJ[7];
if((L_GETOBJ[5]!=0)){pc=1500;continue L;}
L_GETOBJ[9]=(C_STAR[1]+1);L_GETOBJ[10]=C_OBJCTS[0];
case 100001:
if(L_GETOBJ[9]>L_GETOBJ[10]){pc=100002;continue L;}
if((!THISIT(OIDX,OIDX_,AIDX,AIDX_,L_GETOBJ,9,SPCOBJ,SPCOBJ_))){pc=1200;continue L;}
if((!GHERE(L_GETOBJ,9,C_PLAY,1))){pc=1200;continue L;}
if((L_GETOBJ[5]!=0)){L_GETOBJ[5]=(-L_GETOBJ[9]);}
if((L_GETOBJ[5]==0)){L_GETOBJ[5]=L_GETOBJ[9];}
case 1200:
L_GETOBJ[9]+=1;pc=100001;continue L;
case 100002:
case 1500:
return L_GETOBJ[5];
return L_GETOBJ[5];
}}
/* np.f */
function SCHLST(OIDX,OIDX_,AIDX,AIDX_,RM,RM_,CN,CN_,AD,AD_,SPCOBJ,SPCOBJ_){
function SF_SCHLST_NOTRAN(O){return ((ZAND(C_OBJCTS,O+880,C_OFLAGS,4)==0)&&(ZAND(C_OBJCTS,O+1100,C_OFLAGS,28)==0))}
function SF_SCHLST_NOVIS(O){return (ZAND(C_OBJCTS,O+880,C_OFLAGS,0)==0)}
var pc=0;L:for(;;)switch(pc){case 0:
L_SCHLST[4]=0;
L_SCHLST[5]=1;L_SCHLST[6]=C_OBJCTS[0];
case 100001:
if(L_SCHLST[5]>L_SCHLST[6]){pc=100002;continue L;}
if((SF_SCHLST_NOVIS(L_SCHLST[5])||((((RM[RM_]==0)||(!QHERE(L_SCHLST,5,RM,RM_)))&&((CN[CN_]==0)||(C_OBJCTS[L_SCHLST[5]+2640]!=CN[CN_])))&&((AD[AD_]==0)||(C_OBJCTS[L_SCHLST[5]+2420]!=AD[AD_]))))){pc=1000;continue L;}
if((!THISIT(OIDX,OIDX_,AIDX,AIDX_,L_SCHLST,5,SPCOBJ,SPCOBJ_))){pc=200;continue L;}
if((L_SCHLST[4]!=0)){pc=2000;continue L;}
L_SCHLST[4]=L_SCHLST[5];
case 200:
if(SF_SCHLST_NOTRAN(L_SCHLST[5])){pc=1000;continue L;}
L_SCHLST[7]=1;L_SCHLST[8]=C_OBJCTS[0];
case 100003:
if(L_SCHLST[7]>L_SCHLST[8]){pc=100004;continue L;}
if((SF_SCHLST_NOVIS(L_SCHLST[7])||(!THISIT(OIDX,OIDX_,AIDX,AIDX_,L_SCHLST,7,SPCOBJ,SPCOBJ_)))){pc=500;continue L;}
L_SCHLST[9]=C_OBJCTS[L_SCHLST[7]+2640];
case 300:
if((L_SCHLST[9]==L_SCHLST[5])){pc=400;continue L;}
if((L_SCHLST[9]==0)){pc=500;continue L;}
if(((SF_SCHLST_NOVIS(L_SCHLST[9])||SF_SCHLST_NOTRAN(L_SCHLST[9]))||(ZAND(C_OBJCTS,L_SCHLST[9]+1100,C_OFLAGS,31)==0))){pc=500;continue L;}
L_SCHLST[9]=C_OBJCTS[L_SCHLST[9]+2640];
pc=300;continue L;
case 400:
if((L_SCHLST[4]!=0)){pc=2000;continue L;}
L_SCHLST[4]=L_SCHLST[7];
case 500:
L_SCHLST[7]+=1;pc=100003;continue L;
case 100004:
case 1000:
L_SCHLST[5]+=1;pc=100001;continue L;
case 100002:
return L_SCHLST[4];
case 2000:
L_SCHLST[4]=(-L_SCHLST[4]);
return L_SCHLST[4];
return L_SCHLST[4];
}}
/* np.f */
function THISIT(OIDX,OIDX_,AIDX,AIDX_,OBJ,OBJ_,SPCOBJ,SPCOBJ_){
function SF_THISIT_NOTEST(O){return ((O<=0)||(O>=L_THISIT[3]))}
var pc=0;L:for(;;)switch(pc){case 0:
L_THISIT[1]=0;
if(((SPCOBJ[SPCOBJ_]!=0)&&(OBJ[OBJ_]==SPCOBJ[SPCOBJ_]))){pc=500;continue L;}
L_THISIT[2]=(OIDX[OIDX_]+1);
case 100:
L_THISIT[2]=(L_THISIT[2]+1);
if(SF_THISIT_NOTEST(C_OBJVOC[L_THISIT[2]-1])){return L_THISIT[1];}
if((C_OBJVOC[L_THISIT[2]-1]!=OBJ[OBJ_])){pc=100;continue L;}
if((AIDX[AIDX_]==0)){pc=500;continue L;}
L_THISIT[2]=(AIDX[AIDX_]+1);
case 200:
L_THISIT[2]=(L_THISIT[2]+1);
if(SF_THISIT_NOTEST(C_ADJVOC[L_THISIT[2]-1])){return L_THISIT[1];}
if((C_ADJVOC[L_THISIT[2]-1]!=OBJ[OBJ_])){pc=200;continue L;}
case 500:
L_THISIT[1]=1;
return L_THISIT[1];
return L_THISIT[1];
}}
/* np.f */
function SYNMCH(){
var pc=0;L:for(;;)switch(pc){case 0:
L_SYNMCH[3]=0;
L_SYNMCH[4]=C_PV[0];
L_SYNMCH[5]=0;
L_SYNMCH[6]=0;
L_SYNMCH[7]=ZAND(C_ORPHS,0,C_ORPHS,3);
case 100:
L_SYNMCH[4]=(L_SYNMCH[4]+2);
if(((C_VRBVOC[L_SYNMCH[4]-1]<=0)||(C_VRBVOC[L_SYNMCH[4]-1]>=L_SYNMCH[8]))){pc=100;continue L;}
L_SYNMCH[9]=((L_SYNMCH[4]+C_VRBVOC[L_SYNMCH[4]-1])+1);
L_SYNMCH[4]=(L_SYNMCH[4]+1);
case 200:
UNPACK(L_SYNMCH,4,L_SYNMCH,10);
L_SYNMCH[11]=ZAND(C_SYNTAX,1,C_OBJFLG,6);
if((!SYNEQL(C_PV,3,C_PV,1,C_SYNTAX,1,C_SYNTAX,2,C_SYNTAX,3))){pc=1000;continue L;}
L_SYNMCH[11]=ZAND(C_SYNTAX,6,C_OBJFLG,6);
if(SYNEQL(C_PV,4,C_PV,2,C_SYNTAX,6,C_SYNTAX,7,C_SYNTAX,8)){pc=6000;continue L;}
if(C_PV[2]<0){pc=3000;continue L;}if(C_PV[2]==0){pc=500;continue L;}pc=3000;continue L;
case 1000:
if(C_PV[1]<0){pc=3000;continue L;}if(C_PV[1]==0){pc=500;continue L;}pc=3000;continue L;
case 500:
if(((L_SYNMCH[7]==0)||(L_SYNMCH[7]==L_SYNMCH[11]))){L_SYNMCH[6]=L_SYNMCH[4];}
if((ZAND(C_SYNTAX,0,C_SYNFLG,4)!=0)){L_SYNMCH[5]=L_SYNMCH[4];}
case 3000:
L_SYNMCH[4]=L_SYNMCH[10];
if((L_SYNMCH[4]<L_SYNMCH[9])){pc=200;continue L;}
if((L_SYNMCH[5]==0)){L_SYNMCH[5]=L_SYNMCH[6];}
if((L_SYNMCH[5]==0)){pc=10000;continue L;}
UNPACK(L_SYNMCH,5,L_SYNMCH,6);
if(((ZAND(C_SYNTAX,0,C_SYNFLG,0)==0)||(C_PV[1]!=0))){pc=4000;continue L;}
C_PV[1]=ZAND(C_ORPHS,0,C_ORPHS,2);
if((C_PV[1]==0)){pc=3500;continue L;}
if(SYNEQL(C_PV,3,C_PV,1,C_SYNTAX,1,C_SYNTAX,2,C_SYNTAX,3)){pc=4000;continue L;}
case 3500:
C_PV[1]=GWIM(C_SYNTAX,1,C_SYNTAX,4,C_SYNTAX,5);
if((C_PV[1]>0)){pc=4000;continue L;}
ORPHAN([(-1)],0,C_PV,0,[0],0,[ZAND(C_SYNTAX,1,C_OBJFLG,6)],0,[0],0);
RSPEAK([623],0);
return L_SYNMCH[3];
case 4000:
if(((ZAND(C_SYNTAX,0,C_SYNFLG,1)==0)||(C_PV[2]!=0))){pc=6000;continue L;}
C_PV[2]=GWIM(C_SYNTAX,6,C_SYNTAX,9,C_SYNTAX,10);
if((C_PV[2]>0)){pc=6000;continue L;}
if((C_PV[1]==0)){C_PV[1]=ZAND(C_ORPHS,0,C_ORPHS,2);}
ORPHAN([(-1)],0,C_PV,0,C_PV,1,[ZAND(C_SYNTAX,1,C_OBJFLG,6)],0,[0],0);
RSPEAK([624],0);
return L_SYNMCH[3];
case 10000:
RSPEAK([601],0);
return L_SYNMCH[3];
case 6000:
if((ZAND(C_SYNTAX,0,C_SYNFLG,3)==0)){pc=5000;continue L;}
L_SYNMCH[4]=C_PV[1];
C_PV[1]=C_PV[2];
C_PV[2]=L_SYNMCH[4];
case 5000:
C_PRSVEC[0]=ZAND(C_SYNTAX,0,C_SYNFLG,5);
C_PRSVEC[2]=C_PV[1];
C_PRSVEC[1]=C_PV[2];
if((!TAKEIT(C_PRSVEC,2,C_SYNTAX,1))){return L_SYNMCH[3];}
if((!TAKEIT(C_PRSVEC,1,C_SYNTAX,6))){return L_SYNMCH[3];}
L_SYNMCH[3]=1;
return L_SYNMCH[3];
return L_SYNMCH[3];
}}
/* np.f */
function UNPACK(OLDJ,OLDJ_,J,J_){
var pc=0;L:for(;;)switch(pc){case 0:
L_UNPACK[0]=1;L_UNPACK[1]=11;
case 100001:
if(L_UNPACK[0]>L_UNPACK[1]){pc=100002;continue L;}
C_SYNTAX[L_UNPACK[0]-1]=0;
case 10:
L_UNPACK[0]+=1;pc=100001;continue L;
case 100002:
C_SYNTAX[0]=C_VRBVOC[OLDJ[OLDJ_]-1];
J[J_]=(OLDJ[OLDJ_]+1);
if((ZAND(C_SYNTAX,0,C_SYNFLG,0)==0)){return;}
C_SYNTAX[2]=(-1);
C_SYNTAX[3]=(-1);
if((ZAND(C_SYNTAX,0,C_SYNFLG,2)==0)){pc=100;continue L;}
C_SYNTAX[4]=(-1);
C_SYNTAX[5]=(-1);
C_SYNTAX[1]=((C_OBJFLG[0]+C_OBJFLG[1])+C_OBJFLG[5]);
pc=200;continue L;
case 100:
C_SYNTAX[1]=C_VRBVOC[J[J_]-1];
C_SYNTAX[4]=C_VRBVOC[(J[J_]+1)-1];
C_SYNTAX[5]=C_VRBVOC[(J[J_]+2)-1];
J[J_]=(J[J_]+3);
if((ZAND(C_SYNTAX,1,C_OBJFLG,4)==0)){pc=200;continue L;}
C_SYNTAX[2]=C_SYNTAX[4];
C_SYNTAX[3]=C_SYNTAX[5];
case 200:
if((ZAND(C_SYNTAX,0,C_SYNFLG,1)==0)){return;}
C_SYNTAX[7]=(-1);
C_SYNTAX[8]=(-1);
C_SYNTAX[6]=C_VRBVOC[J[J_]-1];
C_SYNTAX[9]=C_VRBVOC[(J[J_]+1)-1];
C_SYNTAX[10]=C_VRBVOC[(J[J_]+2)-1];
J[J_]=(J[J_]+3);
if((ZAND(C_SYNTAX,6,C_OBJFLG,4)==0)){return;}
C_SYNTAX[7]=C_SYNTAX[9];
C_SYNTAX[8]=C_SYNTAX[10];
return;
return;
}}
/* np.f */
function SYNEQL(PREP,PREP_,OBJ,OBJ_,SPREP,SPREP_,SFL1,SFL1_,SFL2,SFL2_){
var pc=0;L:for(;;)switch(pc){case 0:
if((OBJ[OBJ_]==0)){pc=100;continue L;}
L_SYNEQL[0]=(((PREP[PREP_]==ZAND(SPREP,SPREP_,C_OBJFLG,6))&&(ZOR([ZAND(SFL1,SFL1_,C_OBJCTS,OBJ[OBJ_]+880)],0,[ZAND(SFL2,SFL2_,C_OBJCTS,OBJ[OBJ_]+1100)],0)!=0)))?1:0;
return L_SYNEQL[0];
case 100:
L_SYNEQL[0]=((((PREP[PREP_]==0)&&(SFL1[SFL1_]==0))&&(SFL2[SFL2_]==0)))?1:0;
return L_SYNEQL[0];
return L_SYNEQL[0];
}}
/* np.f */
function TAKEIT(OBJ,OBJ_,SFLAG,SFLAG_){
var pc=0;L:for(;;)switch(pc){case 0:
L_TAKEIT[0]=0;
if(((OBJ[OBJ_]==0)||(OBJ[OBJ_]>C_STAR[1]))){pc=4000;continue L;}
L_TAKEIT[1]=C_OBJCTS[OBJ[OBJ_]+220];
L_TAKEIT[2]=C_OBJCTS[OBJ[OBJ_]+2640];
if(((L_TAKEIT[2]==0)||(ZAND(SFLAG,SFLAG_,C_OBJFLG,5)==0))){pc=500;continue L;}
if((ZAND(C_OBJCTS,L_TAKEIT[2]+1100,C_OFLAGS,28)!=0)){pc=500;continue L;}
RSPSUB([566],0,L_TAKEIT,1);
return L_TAKEIT[0];
case 500:
if((ZAND(SFLAG,SFLAG_,C_OBJFLG,1)==0)){pc=1000;continue L;}
if((ZAND(SFLAG,SFLAG_,C_OBJFLG,2)==0)){pc=2000;continue L;}
if((SCHLST([0],0,[0],0,C_PLAY,1,[0],0,[0],0,OBJ,OBJ_)<=0)){pc=4000;continue L;}
if(((ZAND(C_OBJCTS,OBJ[OBJ_]+880,C_OFLAGS,2)!=0)&&(ZAND(C_OBJCTS,OBJ[OBJ_]+1100,C_OFLAGS,26)==0))){pc=3000;continue L;}
if((ZAND(SFLAG,SFLAG_,C_OBJFLG,3)==0)){pc=4000;continue L;}
RSPSUB([445],0,L_TAKEIT,1);
return L_TAKEIT[0];
case 2000:
if((ZAND(SFLAG,SFLAG_,C_OBJFLG,3)==0)){pc=4000;continue L;}
case 1000:
if((SCHLST([0],0,[0],0,C_PLAY,1,[0],0,[0],0,OBJ,OBJ_)<=0)){pc=4000;continue L;}
RSPSUB([665],0,L_TAKEIT,1);
return L_TAKEIT[0];
case 3000:
if((OBJ[OBJ_]!=C_ADVS[C_PLAY[0]+8])){pc=3500;continue L;}
RSPEAK([672],0);
return L_TAKEIT[0];
case 3500:
if((((L_TAKEIT[2]!=0)&&(C_OBJCTS[L_TAKEIT[2]+2420]==C_PLAY[0]))||((WEIGHT([0],0,OBJ,OBJ_,C_PLAY,0)+C_OBJCTS[OBJ[OBJ_]+1760])<=C_STATE[4]))){pc=3700;continue L;}
RSPEAK([558],0);
return L_TAKEIT[0];
case 3700:
NEWSTA(OBJ,OBJ_,[559],0,[0],0,[0],0,C_PLAY,0);
C_OBJCTS[OBJ[OBJ_]+1100]=ZOR(C_OBJCTS,OBJ[OBJ_]+1100,C_OFLAGS,29);
SCRUPD(C_OBJCTS,OBJ[OBJ_]+1320);
C_OBJCTS[OBJ[OBJ_]+1320]=0;
case 4000:
L_TAKEIT[0]=1;
return L_TAKEIT[0];
return L_TAKEIT[0];
}}
/* np.f */
function GWIM(SFLAG,SFLAG_,SFW1,SFW1_,SFW2,SFW2_){
var pc=0;L:for(;;)switch(pc){case 0:
L_GWIM[2]=(-1);
L_GWIM[3]=C_ADVS[C_PLAY[0]+8];
L_GWIM[4]=0;
L_GWIM[1]=((ZAND(SFLAG,SFLAG_,C_OBJFLG,3)==0))?1:0;
if((ZAND(SFLAG,SFLAG_,C_OBJFLG,0)!=0)){L_GWIM[4]=FWIM(SFW1,SFW1_,SFW2,SFW2_,[0],0,[0],0,C_PLAY,0,L_GWIM,1);}
if((ZAND(SFLAG,SFLAG_,C_OBJFLG,1)!=0)){pc=100;continue L;}
case 50:
L_GWIM[2]=L_GWIM[4];
return L_GWIM[2];
case 100:
L_GWIM[5]=FWIM(SFW1,SFW1_,SFW2,SFW2_,C_PLAY,1,[0],0,[0],0,L_GWIM,1);
if(L_GWIM[5]<0){pc=500;continue L;}if(L_GWIM[5]==0){pc=50;continue L;}pc=200;continue L;
case 200:
if((((L_GWIM[3]==0)||(L_GWIM[5]==L_GWIM[3]))||(ZAND(C_OBJCTS,L_GWIM[5]+1100,C_OFLAGS,16)!=0))){pc=300;continue L;}
if((C_OBJCTS[L_GWIM[5]+2640]!=L_GWIM[3])){pc=50;continue L;}
case 300:
if((L_GWIM[4]!=0)){return L_GWIM[2];}
if((!TAKEIT(L_GWIM,5,SFLAG,SFLAG_))){return L_GWIM[2];}
L_GWIM[2]=L_GWIM[5];
case 500:
return L_GWIM[2];
return L_GWIM[2];
}}
/* np.f */
function* RDLINE(INBUF,INBUF_,INLNT,INLNT_,WHO,WHO_){
var pc=0;L:for(;;)switch(pc){case 0:
case 5:
pc=[90,10][(WHO[WHO_]+1)-1];if(pc!==undefined)continue L;
case 10:
var W=WSTART(C_XINFMT[0]);W.end();
case 90:
var R=RSTART("78A1",yield READ);for(var ii=0;ii<78;ii++){INBUF[INBUF_+ii]=R();}
INLNT[INLNT_]=78;L_RDLINE[0]=1;
case 100001:
if(INLNT[INLNT_]<L_RDLINE[0]){pc=100002;continue L;}
if((INBUF[INBUF_+INLNT[INLNT_]-1]!=" ")){pc=300;continue L;}
case 200:
INLNT[INLNT_]+=(-1);pc=100001;continue L;
case 100002:
pc=5;continue L;
case 300:
L_RDLINE[1]=1;L_RDLINE[2]=INLNT[INLNT_];
case 100003:
if(L_RDLINE[1]>L_RDLINE[2]){pc=100004;continue L;}
if(((INBUF[INBUF_+L_RDLINE[1]-1]>="a")&&(INBUF[INBUF_+L_RDLINE[1]-1]<="z"))){INBUF[INBUF_+L_RDLINE[1]-1]=String.fromCharCode((ICHAR(INBUF[INBUF_+L_RDLINE[1]-1])-32));}
case 400:
L_RDLINE[1]+=1;pc=100003;continue L;
case 100004:
C_PRSVEC[4]=1;
return;
return;
}}
/* np.f */
function PARSE(INBUF,INBUF_,INLNT,INLNT_,VBFLAG,VBFLAG_){
var pc=0;L:for(;;)switch(pc){case 0:
L_PARSE[43]=0;
C_PRSVEC[0]=0;
C_PRSVEC[1]=0;
C_PRSVEC[2]=0;
if((!LEX(INBUF,INBUF_,INLNT,INLNT_,L_PARSE,3,L_PARSE,44,VBFLAG,VBFLAG_))){pc=100;continue L;}
if(SPARSE(L_PARSE,3,L_PARSE,44,VBFLAG,VBFLAG_)<0){pc=100;continue L;}if(SPARSE(L_PARSE,3,L_PARSE,44,VBFLAG,VBFLAG_)==0){pc=200;continue L;}pc=300;continue L;
case 200:
if((!VBFLAG[VBFLAG_])){pc=350;continue L;}
if((!SYNMCH())){pc=100;continue L;}
if(((C_PRSVEC[2]>0)&&(C_PRSVEC[2]<C_XSRCH[0]))){C_LAST[0]=C_PRSVEC[2];}
case 300:
L_PARSE[43]=1;
case 350:
ORPHAN([0],0,[0],0,[0],0,[0],0,[0],0);
return L_PARSE[43];
case 100:
C_PRSVEC[4]=1;
return L_PARSE[43];
return L_PARSE[43];
}}
/* np.f */
function ORPHAN(O1,O1_,O2,O2_,O3,O3_,O4,O4_,O5,O5_){
C_ORPHS[0]=O1[O1_];
C_ORPHS[1]=O2[O2_];
C_ORPHS[2]=O3[O3_];
C_ORPHS[3]=O4[O4_];
C_ORPHS[4]=O5[O5_];
return;
return;
}
/* np.f */
function LEX(INBUF,INBUF_,INLNT,INLNT_,OUTBUF,OUTBUF_,OP,OP_,VBFLAG,VBFLAG_){
var pc=0;L:for(;;)switch(pc){case 0:
L_LEX[3]=String.fromCharCode(64);
L_LEX[6]=String.fromCharCode(18);
L_LEX[9]=String.fromCharCode(18);
L_LEX[12]=1;L_LEX[13]=40;
case 100001:
if(L_LEX[12]>L_LEX[13]){pc=100002;continue L;}
OUTBUF[OUTBUF_+L_LEX[12]-1]=0;
case 100:
L_LEX[12]+=1;pc=100001;continue L;
case 100002:
L_LEX[11]=0;
OP[OP_]=(-1);
case 50:
OP[OP_]=(OP[OP_]+2);
L_LEX[14]=0;
case 200:
if((C_PRSVEC[4]>INLNT[INLNT_])){pc=1000;continue L;}
L_LEX[0]=INBUF[INBUF_+C_PRSVEC[4]-1];
C_PRSVEC[4]=(C_PRSVEC[4]+1);
if((L_LEX[0]==".")){pc=1000;continue L;}
if((L_LEX[0]==",")){pc=1000;continue L;}
if((L_LEX[0]==" ")){pc=6000;continue L;}
L_LEX[12]=1;L_LEX[15]=9;
case 100003:
if(L_LEX[12]>L_LEX[15]){pc=100004;continue L;}
if(((L_LEX[0]>=L_LEX[L_LEX[12]])&&(L_LEX[0]<=L_LEX[(L_LEX[12]+1)]))){pc=4000;continue L;}
case 500:
L_LEX[12]+=3;pc=100003;continue L;
case 100004:
if(VBFLAG[VBFLAG_]){RSPEAK([601],0);}
return L_LEX[11];
case 1000:
if((C_PRSVEC[4]>INLNT[INLNT_])){C_PRSVEC[4]=1;}
if(((L_LEX[14]==0)&&(OP[OP_]==1))){return L_LEX[11];}
if((L_LEX[14]==0)){OP[OP_]=(OP[OP_]-2);}
L_LEX[11]=1;
return L_LEX[11];
case 4000:
L_LEX[16]=(ICHAR(L_LEX[0])-ICHAR(L_LEX[(L_LEX[12]+2)]));
if((L_LEX[14]>=6)){pc=200;continue L;}
L_LEX[17]=(OP[OP_]+DIV(L_LEX[14],3));
L_LEX[18]=OUTBUF[OUTBUF_+L_LEX[17]-1];
pc=[4100,4200,4300][((L_LEX[14]%3)+1)-1];if(pc!==undefined)continue L;
case 4100:
L_LEX[19]=(Math.imul(L_LEX[16],780))|0;
L_LEX[18]=((L_LEX[18]+L_LEX[19])+L_LEX[19]);
case 4200:
L_LEX[18]=((L_LEX[18]+Math.imul(L_LEX[16],39)))|0;
case 4300:
L_LEX[18]=(L_LEX[18]+L_LEX[16]);
OUTBUF[OUTBUF_+L_LEX[17]-1]=ZOR(L_LEX,18,[0],0);
L_LEX[14]=(L_LEX[14]+1);
pc=200;continue L;
case 6000:
if((L_LEX[14]==0)){pc=200;continue L;}
pc=50;continue L;
return L_LEX[11];
}}
/* objcts.f */
function* OAPPLI(RI,RI_,ARG,ARG_){
function SF_OAPPLI_QOPEN(R){return (ZAND(C_OBJCTS,R+1100,C_OFLAGS,28)!=0)}
function SF_OAPPLI_QON(R){return (ZAND(C_OBJCTS,R+880,C_OFLAGS,15)!=0)}
var pc=0;L:for(;;)switch(pc){case 0:
if((RI[RI_]==0)){pc=10;continue L;}
if((RI[RI_]<=L_OAPPLI[18])){pc=100;continue L;}
if(!((C_PRSVEC[2]<221)&&(C_PRSVEC[2]>0))){pc=100001;continue L;}
if((C_PRSVEC[2]!=0)){L_OAPPLI[19]=C_OBJCTS[C_PRSVEC[2]+220];}
case 100001:
case 100002:
if((C_PRSVEC[1]!=0)){L_OAPPLI[20]=C_OBJCTS[C_PRSVEC[1]+220];}
L_OAPPLI[21]=C_ADVS[C_PLAY[0]+8];
L_OAPPLI[22]=((C_OFLAGS[12]+C_OFLAGS[9])+C_OFLAGS[15]);
L_OAPPLI[17]=1;
pc=[2000,5000,10000,11000,12000,15000,18000,19000,20000,22000,25000,26000,32000,35000,39000,40000,45000,47000,48000,49000,50000,51000,52000,54000,55000,56000,57000,58000,59000,60000,61000,62000][(RI[RI_]-L_OAPPLI[18])-1];if(pc!==undefined)continue L;
BUG([6],0,RI,RI_);
case 10:
L_OAPPLI[17]=0;
return L_OAPPLI[17];
case 100:
if((RI[RI_]<32)){L_OAPPLI[17]=SOBJS(RI,RI_,ARG,ARG_);}
if((RI[RI_]>=32)){L_OAPPLI[17]=NOBJS(RI,RI_,ARG,ARG_);}
return L_OAPPLI[17];
case 2000:
if((C_PLAY[1]!=C_RINDEX[16])){pc=10;continue L;}
L_OAPPLI[17]=OPNCLS(C_OINDEX,4,[123],0,[124],0);
return L_OAPPLI[17];
case 5000:
if((C_PRSVEC[0]!=C_VINDEX[42])){pc=5050;continue L;}
C_PRSVEC[0]=C_VINDEX[52];
L_OAPPLI[23]=C_PRSVEC[1];
C_PRSVEC[1]=C_PRSVEC[2];
C_PRSVEC[2]=L_OAPPLI[23];
L_OAPPLI[23]=L_OAPPLI[20];
L_OAPPLI[20]=L_OAPPLI[19];
L_OAPPLI[19]=L_OAPPLI[23];
case 5050:
if(((C_PRSVEC[2]==C_OINDEX[8])||(C_PRSVEC[2]==C_OINDEX[119]))){pc=5100;continue L;}
RSPEAK([561],0);
return L_OAPPLI[17];
case 5100:
if((C_PRSVEC[0]!=C_VINDEX[40])){pc=5400;continue L;}
if(((C_OBJCTS[C_OINDEX[7]+2420]==C_PLAY[0])&&(C_OBJCTS[C_PRSVEC[2]+2640]!=C_OINDEX[7]))){pc=5500;continue L;}
if((C_OBJCTS[C_PRSVEC[2]+2640]==0)){pc=5200;continue L;}
if(SF_OAPPLI_QOPEN(C_OBJCTS[C_PRSVEC[2]+2640])){pc=5200;continue L;}
RSPSUB([525],0,C_OBJCTS,C_OBJCTS[C_PRSVEC[2]+2640]+220);
return L_OAPPLI[17];
case 5200:
RSPEAK([615],0);
return L_OAPPLI[17];
case 5400:
if((C_PRSVEC[0]!=C_VINDEX[52])){pc=5700;continue L;}
if(((L_OAPPLI[21]!=0)&&(C_PRSVEC[1]==L_OAPPLI[21]))){pc=5800;continue L;}
if((C_PRSVEC[1]==C_OINDEX[7])){pc=5500;continue L;}
RSPSUB([297],0,L_OAPPLI,20);
NEWSTA(C_PRSVEC,2,[0],0,[0],0,[0],0,[0],0);
return L_OAPPLI[17];
case 5500:
if(SF_OAPPLI_QOPEN(C_OINDEX[7])){pc=5550;continue L;}
RSPEAK([612],0);
return L_OAPPLI[17];
case 5550:
if(QEMPTY(C_OINDEX,7)){pc=5600;continue L;}
RSPEAK([613],0);
return L_OAPPLI[17];
case 5600:
NEWSTA(C_OINDEX,8,[614],0,[0],0,C_OINDEX,7,[0],0);
return L_OAPPLI[17];
case 5700:
if((((C_PRSVEC[0]!=C_VINDEX[53])&&(C_PRSVEC[0]!=C_VINDEX[55]))&&(C_PRSVEC[0]!=C_VINDEX[54]))){pc=5900;continue L;}
if((L_OAPPLI[21]!=0)){pc=5800;continue L;}
NEWSTA(C_PRSVEC,2,[133],0,[0],0,[0],0,[0],0);
return L_OAPPLI[17];
case 5800:
NEWSTA(C_OINDEX,8,[0],0,[0],0,L_OAPPLI,21,[0],0);
RSPSUB([296],0,C_OBJCTS,L_OAPPLI[21]+220);
return L_OAPPLI[17];
case 5900:
if((C_PRSVEC[0]!=C_VINDEX[56])){pc=10;continue L;}
NEWSTA(C_PRSVEC,2,[132],0,[0],0,[0],0,[0],0);
return L_OAPPLI[17];
case 10000:
if((C_PRSVEC[0]!=C_VINDEX[45])){pc=10500;continue L;}
if((C_OBJCTS[C_PRSVEC[2]+2200]==0)){pc=10100;continue L;}
NEWSTA(C_PRSVEC,2,[158],0,[0],0,[0],0,[0],0);
return L_OAPPLI[17];
case 10100:
NEWSTA(C_PRSVEC,2,[0],0,C_PLAY,1,[0],0,[0],0);
(yield* JIGSUP([159],0));
return L_OAPPLI[17];
case 10500:
if((C_PRSVEC[0]!=C_VINDEX[30])){pc=10600;continue L;}
RSPEAK([2],0);
return L_OAPPLI[17];
case 10600:
if(((C_PRSVEC[0]!=C_VINDEX[63])||(C_FINDEX[49]!=0))){pc=10;continue L;}
RSPEAK([344],0);
return L_OAPPLI[17];
case 11000:
L_OAPPLI[17]=TROLLP(ARG,ARG_);
return L_OAPPLI[17];
case 12000:
if((C_PRSVEC[0]!=C_VINDEX[40])){pc=12100;continue L;}
if((C_OBJCTS[C_OINDEX[11]+2420]==C_PLAY[0])){RSPEAK([160],0);}
pc=10;continue L;
case 12100:
if(((((C_PRSVEC[0]!=C_VINDEX[48])&&(C_PRSVEC[0]!=C_VINDEX[47]))||(C_PRSVEC[1]!=C_OINDEX[18]))&&(((C_PRSVEC[0]!=C_VINDEX[49])&&(C_PRSVEC[0]!=C_VINDEX[56]))||(C_PRSVEC[2]!=C_OINDEX[18])))){pc=10;continue L;}
NEWSTA(C_OINDEX,18,[0],0,[0],0,[0],0,[0],0);
(yield* JIGSUP([161],0));
return L_OAPPLI[17];
case 15000:
if((C_PRSVEC[0]!=C_VINDEX[56])){pc=15500;continue L;}
if((C_PRSVEC[2]!=C_OINDEX[23])){pc=15400;continue L;}
NEWSTA(C_OINDEX,20,[169],0,[0],0,[0],0,[0],0);
C_OBJCTS[C_OINDEX[23]]=174;
C_OBJCTS[C_OINDEX[23]+220]=173;
C_OBJCTS[C_OINDEX[23]+880]=ZAND(C_OBJCTS,C_OINDEX[23]+880,[ZNOT(L_OAPPLI,22)],0);
NEWSTA(C_OINDEX,23,[0],0,C_RINDEX,11,[0],0,[0],0);
C_FINDEX[7]=1;
if((!LIT(C_PLAY,1))){RSPEAK([170],0);}
return L_OAPPLI[17];
case 15400:
RSPEAK([171],0);
return L_OAPPLI[17];
case 15500:
if(((C_PRSVEC[0]!=C_VINDEX[8])||(C_PRSVEC[2]!=C_OINDEX[20]))){pc=10;continue L;}
if((ZAND(C_OBJCTS,C_PRSVEC[1]+880,L_OAPPLI,22)==L_OAPPLI[22])){pc=15600;continue L;}
RSPSUB([298],0,L_OAPPLI,20);
return L_OAPPLI[17];
case 15600:
C_FINDEX[30]=1;
if((C_PRSVEC[1]!=C_OINDEX[23])){pc=15700;continue L;}
C_OBJCTS[C_OINDEX[23]]=174;
C_OBJCTS[C_OINDEX[23]+220]=173;
C_OBJCTS[C_OINDEX[23]+880]=ZAND(C_OBJCTS,C_OINDEX[23]+880,[ZNOT(L_OAPPLI,22)],0);
case 15700:
(yield* JIGSUP([172],0));
return L_OAPPLI[17];
case 18000:
if((C_PRSVEC[0]!=C_VINDEX[33])){pc=18100;continue L;}
RSPEAK([180],0);
return L_OAPPLI[17];
case 18100:
if((C_PRSVEC[0]!=C_VINDEX[34])){pc=18200;continue L;}
RSPEAK([181],0);
return L_OAPPLI[17];
case 18200:
if((C_PRSVEC[0]!=C_VINDEX[45])){pc=10;continue L;}
NEWSTA(C_PRSVEC,2,[0],0,[0],0,[0],0,[0],0);
(yield* JIGSUP([182],0));
return L_OAPPLI[17];
case 19000:
L_OAPPLI[17]=LIGHTP(C_OINDEX,31);
return L_OAPPLI[17];
case 20000:
L_OAPPLI[17]=LIGHTP(C_OINDEX,32);
return L_OAPPLI[17];
case 22000:
L_OAPPLI[17]=(yield* CYCLOP(ARG,ARG_));
return L_OAPPLI[17];
case 25000:
L_OAPPLI[17]=THIEFP(ARG,ARG_);
return L_OAPPLI[17];
case 26000:
L_OAPPLI[17]=OPNCLS(C_OINDEX,41,[208],0,[209],0);
return L_OAPPLI[17];
case 32000:
if((C_PRSVEC[0]!=C_VINDEX[40])){pc=32500;continue L;}
RSPEAK([228],0);
return L_OAPPLI[17];
case 32500:
if(((C_PRSVEC[0]!=C_VINDEX[45])&&(C_PRSVEC[0]!=C_VINDEX[46]))){pc=10;continue L;}
if(C_FINDEX[19]){return L_OAPPLI[17];}
C_FINDEX[19]=1;
NEWSTA(C_OINDEX,44,[0],0,C_RINDEX,21,[0],0,[0],0);
(yield* JIGSUP([229],0));
return L_OAPPLI[17];
case 35000:
RSPEAK([50],0);
L_OAPPLI[15]=MOVETO(C_BATS,(ZRND([9],0)+1)-1,C_PLAY,0);
L_OAPPLI[15]=(yield* RMDESC([0],0));
return L_OAPPLI[17];
case 39000:
if((C_PRSVEC[0]!=C_VINDEX[16])){pc=10;continue L;}
if((C_PLAY[1]==C_RINDEX[36])){pc=39500;continue L;}
if(((C_PLAY[1]==C_RINDEX[37])||(C_PLAY[1]==C_RINDEX[34]))){pc=39200;continue L;}
RSPEAK([244],0);
return L_OAPPLI[17];
case 39200:
C_OBJCTS[C_OINDEX[48]+880]=ZOR(C_OBJCTS,C_OINDEX[48]+880,C_OFLAGS,0);
C_FINDEX[26]=((!C_FINDEX[26]))?1:0;
L_OAPPLI[23]=245;
if(C_FINDEX[26]){L_OAPPLI[23]=246;}
RSPEAK(L_OAPPLI,23);
return L_OAPPLI[17];
case 39500:
C_FINDEX[26]=0;
(yield* JIGSUP([247],0));
return L_OAPPLI[17];
case 40000:
L_OAPPLI[17]=BALLOP(ARG,ARG_);
return L_OAPPLI[17];
case 45000:
if((C_PRSVEC[0]!=C_VINDEX[61])){pc=45100;continue L;}
RSPEAK([633],0);
return L_OAPPLI[17];
case 45100:
if((C_PRSVEC[0]==C_VINDEX[9])){pc=10;continue L;}
NEWSTA(C_OINDEX,71,[260],0,C_RINDEX,1,[0],0,[0],0);
L_OAPPLI[23]=(ROBADV(C_PLAY,0,[0],0,C_OINDEX,71,[0],0)+ROBRM(C_PLAY,1,[100],0,[0],0,C_OINDEX,71,[0],0));
(yield* JIGSUP([261],0));
return L_OAPPLI[17];
case 47000:
if((C_FINDEX[1]||(C_PRSVEC[0]!=C_VINDEX[40]))){pc=10;continue L;}
if((C_PLAY[0]!=C_AINDEX[0])){pc=47500;continue L;}
RSPEAK([263],0);
if((C_OBJCTS[C_OINDEX[84]+2200]!=C_PLAY[1])){pc=47200;continue L;}
L_OAPPLI[15]=MOVETO(C_RINDEX,48,C_PLAY,0);
NEWSTA(C_OINDEX,84,[0],0,C_RINDEX,48,[0],0,[0],0);
C_ADVS[C_AINDEX[1]]=C_RINDEX[48];
C_OBJCTS[C_OINDEX[84]+880]=ZOR(C_OBJCTS,C_OINDEX[84]+880,C_OFLAGS,6);
C_CEVENT[C_CINDEX[13]]=10;
return L_OAPPLI[17];
case 47200:
NEWSTA(C_OINDEX,74,[0],0,[0],0,[0],0,[0],0);
C_ROOMS[C_RINDEX[47]+801]=ZOR(C_ROOMS,C_RINDEX[47]+801,C_RFLAG,7);
C_ROOMS[C_RINDEX[47]+601]=147;
(yield* JIGSUP([148],0));
return L_OAPPLI[17];
case 47500:
NEWSTA(C_OINDEX,74,[0],0,[0],0,[0],0,[0],0);
NEWSTA(C_OINDEX,84,[264],0,[0],0,[0],0,[0],0);
NEWSTA(C_OINDEX,72,[0],0,C_PLAY,1,[0],0,[0],0);
return L_OAPPLI[17];
case 48000:
if((C_PRSVEC[0]!=C_VINDEX[20])){pc=10;continue L;}
L_OAPPLI[23]=((C_PRSVEC[2]-C_OINDEX[75])+1);
if(((L_OAPPLI[23]<=0)||(L_OAPPLI[23]>=4))){pc=10;continue L;}
if((C_PLAY[0]!=C_AINDEX[0])){pc=[48100,48200,48300][L_OAPPLI[23]-1];if(pc!==undefined)continue L;}
(yield* JIGSUP([265],0));
return L_OAPPLI[17];
case 48100:
L_OAPPLI[23]=267;
if(C_FINDEX[4]){L_OAPPLI[23]=266;}
C_FINDEX[4]=1;
RSPEAK(L_OAPPLI,23);
return L_OAPPLI[17];
case 48200:
L_OAPPLI[23]=266;
if(C_FINDEX[4]){L_OAPPLI[23]=268;}
C_FINDEX[4]=0;
RSPEAK(L_OAPPLI,23);
return L_OAPPLI[17];
case 48300:
C_FINDEX[3]=((!C_FINDEX[3]))?1:0;
if((!QHERE(C_OINDEX,26,C_RINDEX,19))){return L_OAPPLI[17];}
RSPEAK([269],0);
C_OBJCTS[C_OINDEX[26]+880]=ZXOR(C_OBJCTS,C_OINDEX[26]+880,C_OFLAGS,0);
if(C_FINDEX[3]){C_ROOMS[C_RINDEX[19]+801]=ZAND(C_ROOMS,C_RINDEX[19]+801,[ZNOT(C_RFLAG,0)],0);}
return L_OAPPLI[17];
case 49000:
if((C_PRSVEC[0]==C_VINDEX[33])){pc=49100;continue L;}
if(((C_PRSVEC[0]!=C_VINDEX[46])&&(C_PRSVEC[0]!=C_VINDEX[56]))){pc=10;continue L;}
NEWSTA(C_OINDEX,76,[270],0,[0],0,[0],0,[0],0);
case 49100:
C_ROOMS[C_PLAY[1]+801]=ZOR(C_ROOMS,C_PLAY[1]+801,C_RFLAG,7);
C_ROOMS[C_PLAY[1]+601]=271;
(yield* JIGSUP([272],0));
return L_OAPPLI[17];
case 50000:
if((ARG[ARG_]!=2)){pc=10;continue L;}
if(((C_OBJCTS[C_OINDEX[8]+2640]!=C_OINDEX[79])||C_FINDEX[2])){pc=50500;continue L;}
C_FINDEX[2]=1;
C_CEVENT[C_CINDEX[12]]=100;
NEWSTA(C_OINDEX,79,[290],0,C_RINDEX,49,[0],0,[0],0);
pc=50900;continue L;
case 50500:
if(((C_OBJCTS[C_OINDEX[8]+2640]==C_OINDEX[79])||(!C_FINDEX[2]))){pc=10;continue L;}
C_FINDEX[2]=0;
NEWSTA(C_OINDEX,79,[291],0,C_RINDEX,50,[0],0,[0],0);
case 50900:
if((L_OAPPLI[21]!=C_OINDEX[79])){return L_OAPPLI[17];}
L_OAPPLI[15]=MOVETO(C_OBJCTS,C_OINDEX[79]+2200,C_PLAY,0);
L_OAPPLI[15]=(yield* RMDESC([0],0));
return L_OAPPLI[17];
case 51000:
if((((C_PRSVEC[0]!=C_VINDEX[43])||(C_PRSVEC[2]!=C_OINDEX[80]))||(C_PLAY[1]!=C_RINDEX[51]))){pc=10;continue L;}
NEWSTA(C_OINDEX,80,[273],0,[0],0,[0],0,[0],0);
C_OBJCTS[C_OINDEX[84]+880]=ZAND(C_OBJCTS,C_OINDEX[84]+880,[ZNOT(C_OFLAGS,0)],0);
L_OAPPLI[23]=1;L_OAPPLI[24]=C_OBJCTS[0];
case 100003:
if(L_OAPPLI[23]>L_OAPPLI[24]){pc=100004;continue L;}
if(((C_OBJCTS[L_OAPPLI[23]+2200]!=C_RINDEX[51])||(C_OBJCTS[L_OAPPLI[23]+1760]==10000))){pc=51100;continue L;}
C_OBJCTS[L_OAPPLI[23]+1760]=(Math.imul(C_OBJCTS[L_OAPPLI[23]+1760],64))|0;
C_OBJCTS[L_OAPPLI[23]+2200]=C_RINDEX[52];
case 51100:
L_OAPPLI[23]+=1;pc=100003;continue L;
case 100004:
L_OAPPLI[17]=MOVETO(C_RINDEX,52,C_PLAY,0);
return L_OAPPLI[17];
case 52000:
if((C_PRSVEC[0]!=C_VINDEX[9])){pc=52200;continue L;}
L_OAPPLI[23]=274;
if((C_PRSVEC[1]!=0)){L_OAPPLI[23]=275;}
if((C_PRSVEC[1]==C_OINDEX[7])){L_OAPPLI[23]=276;}
if((C_PRSVEC[1]==C_OINDEX[76])){L_OAPPLI[23]=(277+(C_PRSVEC[2]-C_OINDEX[81]));}
RSPEAK(L_OAPPLI,23);
return L_OAPPLI[17];
case 52200:
if((((C_PRSVEC[0]!=C_VINDEX[56])||(C_PRSVEC[2]!=C_OINDEX[82]))||(C_PRSVEC[1]!=C_OINDEX[77]))){pc=52300;continue L;}
NEWSTA(C_OINDEX,77,[280],0,[0],0,[0],0,[0],0);
C_OBJCTS[C_OINDEX[78]+880]=ZOR(C_OBJCTS,C_OINDEX[78]+880,C_OFLAGS,0);
return L_OAPPLI[17];
case 52300:
if((((C_PLAY[1]!=C_RINDEX[51])&&(C_PLAY[1]!=C_RINDEX[52]))&&(C_PLAY[1]!=C_RINDEX[53]))){pc=10;continue L;}
if((((C_PRSVEC[0]!=C_VINDEX[43])&&(C_PRSVEC[0]!=C_VINDEX[56]))||(C_PRSVEC[2]!=C_OINDEX[81]))){pc=52400;continue L;}
NEWSTA(C_OINDEX,81,[0],0,[0],0,[0],0,[0],0);
C_ROOMS[C_PLAY[1]+801]=ZOR(C_ROOMS,C_PLAY[1]+801,C_RFLAG,7);
C_ROOMS[C_PLAY[1]+601]=281;
(yield* JIGSUP([282],0));
return L_OAPPLI[17];
case 52400:
if(((C_PRSVEC[0]!=C_VINDEX[43])||(C_PRSVEC[2]!=C_OINDEX[83]))){pc=10;continue L;}
NEWSTA(C_OINDEX,83,[283],0,[0],0,[0],0,[0],0);
if((C_PLAY[1]!=C_RINDEX[52])){pc=52500;continue L;}
C_OBJCTS[C_OINDEX[84]+880]=ZOR(C_OBJCTS,C_OINDEX[84]+880,C_OFLAGS,0);
L_OAPPLI[23]=1;L_OAPPLI[25]=C_OBJCTS[0];
case 100005:
if(L_OAPPLI[23]>L_OAPPLI[25]){pc=100006;continue L;}
if(((C_OBJCTS[L_OAPPLI[23]+2200]!=C_PLAY[1])||(C_OBJCTS[L_OAPPLI[23]+1760]==10000))){pc=52450;continue L;}
C_OBJCTS[L_OAPPLI[23]+2200]=C_RINDEX[51];
C_OBJCTS[L_OAPPLI[23]+1760]=DIV(C_OBJCTS[L_OAPPLI[23]+1760],64);
case 52450:
L_OAPPLI[23]+=1;pc=100005;continue L;
case 100006:
L_OAPPLI[17]=MOVETO(C_RINDEX,51,C_PLAY,0);
return L_OAPPLI[17];
case 52500:
(yield* JIGSUP([284],0));
return L_OAPPLI[17];
case 54000:
if((C_PRSVEC[0]!=C_VINDEX[45])){pc=10;continue L;}
(yield* JIGSUP([150],0));
return L_OAPPLI[17];
case 55000:
if((C_PRSVEC[0]!=C_VINDEX[54])){pc=55100;continue L;}
NEWSTA(C_PRSVEC,2,[2],0,[0],0,[0],0,C_AINDEX,0);
return L_OAPPLI[17];
case 55100:
if((C_PRSVEC[0]!=C_VINDEX[40])){pc=55200;continue L;}
RSPEAK([286],0);
return L_OAPPLI[17];
case 55200:
if(((C_PRSVEC[0]!=C_VINDEX[47])&&(C_PRSVEC[0]!=C_VINDEX[46]))){pc=10;continue L;}
(yield* JIGSUP([287],0));
return L_OAPPLI[17];
case 56000:
if((C_PRSVEC[0]!=C_VINDEX[20])){pc=10;continue L;}
if((C_FINDEX[59]!=0)){pc=56100;continue L;}
L_OAPPLI[23]=731;
if(((C_FINDEX[57]%180)==0)){L_OAPPLI[23]=732;}
RSPEAK(L_OAPPLI,23);
return L_OAPPLI[17];
case 56100:
if((C_FINDEX[58]!=C_RINDEX[67])){pc=56200;continue L;}
RSPEAK([733],0);
(yield* JIGSUP([685],0));
return L_OAPPLI[17];
case 56200:
L_OAPPLI[23]=831;
if(((C_PRSVEC[2]==C_OINDEX[96])||(C_PRSVEC[2]==C_OINDEX[95]))){L_OAPPLI[23]=830;}
RSPEAK(L_OAPPLI,23);
C_FINDEX[57]=((((C_FINDEX[57]+45)+Math.imul(270,(L_OAPPLI[23]-830)))%360))|0;
RSPSUB([734],0,[(695+DIV(C_FINDEX[57],45))],0);
if(C_FINDEX[38]){RSPEAK([730],0);}
C_FINDEX[38]=0;
return L_OAPPLI[17];
case 57000:
if((C_PRSVEC[0]!=C_VINDEX[20])){pc=10;continue L;}
if(((C_FINDEX[57]%180)==0)){pc=57100;continue L;}
RSPEAK([735],0);
return L_OAPPLI[17];
case 57100:
if((C_PRSVEC[2]!=C_OINDEX[97])){pc=57300;continue L;}
if(((((C_FINDEX[58]==C_RINDEX[66])&&(C_FINDEX[57]==180))||((C_FINDEX[58]==C_RINDEX[68])&&(C_FINDEX[57]==0)))||(C_FINDEX[58]==C_RINDEX[67]))){pc=57200;continue L;}
RSPEAK([736],0);
C_FINDEX[38]=1;
C_CEVENT[C_CINDEX[21]+50]=1;
C_CEVENT[C_CINDEX[21]]=5;
return L_OAPPLI[17];
case 57200:
RSPEAK([737],0);
(yield* JIGSUP([685],0));
return L_OAPPLI[17];
case 57300:
L_OAPPLI[26]=(C_FINDEX[58]-1);
if((C_FINDEX[57]==0)){L_OAPPLI[26]=(C_FINDEX[58]+1);}
if(((L_OAPPLI[26]>=C_RINDEX[64])&&(L_OAPPLI[26]<=C_RINDEX[68]))){pc=57400;continue L;}
RSPEAK([738],0);
return L_OAPPLI[17];
case 57400:
L_OAPPLI[23]=699;
if((C_FINDEX[57]==0)){L_OAPPLI[23]=695;}
L_OAPPLI[27]=739;
if((C_FINDEX[59]!=0)){L_OAPPLI[27]=740;}
RSPSUB(L_OAPPLI,27,L_OAPPLI,23);
C_FINDEX[58]=L_OAPPLI[26];
if((C_FINDEX[58]!=C_RINDEX[67])){return L_OAPPLI[17];}
if((C_FINDEX[59]!=0)){pc=57500;continue L;}
if((C_FINDEX[37]||C_FINDEX[38])){pc=57600;continue L;}
if((C_FINDEX[39]&&C_FINDEX[40])){return L_OAPPLI[17];}
RSPEAK([742],0);
(yield* JIGSUP([743],0));
return L_OAPPLI[17];
case 57500:
RSPEAK([741],0);
(yield* JIGSUP([743],0));
return L_OAPPLI[17];
case 57600:
RSPEAK([744],0);
(yield* JIGSUP([743],0));
return L_OAPPLI[17];
case 58000:
if((((C_PRSVEC[0]!=C_VINDEX[48])&&(C_PRSVEC[0]!=C_VINDEX[47]))&&(C_PRSVEC[0]!=C_VINDEX[46]))){pc=58100;continue L;}
(yield* JIGSUP([745],0));
return L_OAPPLI[17];
case 58100:
if((C_PRSVEC[0]!=C_VINDEX[61])){pc=10;continue L;}
RSPEAK([746],0);
return L_OAPPLI[17];
case 59000:
if((((C_PRSVEC[0]!=C_VINDEX[48])&&(C_PRSVEC[0]!=C_VINDEX[47]))&&(C_PRSVEC[0]!=C_VINDEX[46]))){pc=59100;continue L;}
(yield* JIGSUP([747],0));
return L_OAPPLI[17];
case 59100:
if((C_PRSVEC[0]!=C_VINDEX[40])){pc=10;continue L;}
RSPEAK([748],0);
return L_OAPPLI[17];
case 60000:
if((C_PRSVEC[0]!=C_VINDEX[40])){pc=10;continue L;}
RSPEAK([419],0);
L_OAPPLI[23]=1;L_OAPPLI[28]=3;
case 100007:
if(L_OAPPLI[23]>L_OAPPLI[28]){pc=100008;continue L;}
if((yield* CLOCKD(L_OAPPLI,29))){return L_OAPPLI[17];}
case 60100:
L_OAPPLI[23]+=1;pc=100007;continue L;
case 100008:
return L_OAPPLI[17];
case 61000:
if((!C_FINDEX[32])){pc=45000;continue L;}
if((C_PRSVEC[0]!=C_VINDEX[33])){pc=61100;continue L;}
L_OAPPLI[23]=793;
if(SF_OAPPLI_QOPEN(C_OINDEX[70])){L_OAPPLI[23]=794;}
RSPEAK(L_OAPPLI,23);
C_OBJCTS[C_OINDEX[70]+1100]=ZOR(C_OBJCTS,C_OINDEX[70]+1100,C_OFLAGS,28);
return L_OAPPLI[17];
case 61100:
if((C_PRSVEC[0]!=C_VINDEX[34])){pc=45000;continue L;}
L_OAPPLI[23]=795;
if(SF_OAPPLI_QOPEN(C_OINDEX[70])){L_OAPPLI[23]=796;}
RSPEAK(L_OAPPLI,23);
C_OBJCTS[C_OINDEX[70]+1100]=ZAND(C_OBJCTS,C_OINDEX[70]+1100,[ZNOT(C_OFLAGS,28)],0);
if((C_PLAY[1]==C_RINDEX[60])){C_CEVENT[C_CINDEX[19]]=3;}
return L_OAPPLI[17];
case 62000:
if(((C_PUZZLE[(C_FINDEX[67]+1)+23]==(-2))||(C_PUZZLE[(C_FINDEX[67]-1)+23]==(-3)))){pc=62100;continue L;}
RSPEAK([865],0);
return L_OAPPLI[17];
case 62100:
if(((C_PRSVEC[0]==C_VINDEX[66])||(C_PRSVEC[0]==C_VINDEX[67]))){pc=62200;continue L;}
RSPEAK([866],0);
return L_OAPPLI[17];
case 62200:
if(((C_FINDEX[67]==10)&&(C_PUZZLE[(C_FINDEX[67]+1)+23]==(-2)))){pc=62300;continue L;}
RSPEAK([867],0);
return L_OAPPLI[17];
case 62300:
L_OAPPLI[15]=MOVETO(C_RINDEX,83,C_PLAY,0);
L_OAPPLI[15]=(yield* RMDESC([3],0));
return L_OAPPLI[17];
return L_OAPPLI[17];
}}
/* rooms.f */
function* RAPPL1(RI,RI_){
function SF_RAPPL1_QOPEN(R){return (ZAND(C_OBJCTS,R+1100,C_OFLAGS,28)!=0)}
function SF_RAPPL1_QON(R){return (ZAND(C_OBJCTS,R+880,C_OFLAGS,15)!=0)}
var pc=0;L:for(;;)switch(pc){case 0:
L_RAPPL1[7]=1;
if((RI[RI_]==0)){return L_RAPPL1[7];}
pc=[1000,2000,3000,4000,5000,6000,7000,8000,9000,10000,11000,12000,13000,14000,15000,16000,17000,18000,19000,20000,21000,22000,23000,24000,25000,26000,27000,28000,29000,30000,31000,32000,33000,34000,35000,36000,37000][RI[RI_]-1];if(pc!==undefined)continue L;
BUG([1],0,RI,RI_);
case 1000:
if((C_PRSVEC[0]!=C_VINDEX[27])){return L_RAPPL1[7];}
L_RAPPL1[8]=13;
if(SF_RAPPL1_QOPEN(C_OINDEX[41])){L_RAPPL1[8]=12;}
RSPSUB([11],0,L_RAPPL1,8);
return L_RAPPL1[7];
case 2000:
if((C_PRSVEC[0]!=C_VINDEX[27])){return L_RAPPL1[7];}
L_RAPPL1[8]=13;
if(SF_RAPPL1_QOPEN(C_OINDEX[41])){L_RAPPL1[8]=12;}
RSPSUB([14],0,L_RAPPL1,8);
return L_RAPPL1[7];
case 3000:
if((C_PRSVEC[0]!=C_VINDEX[27])){pc=3500;continue L;}
L_RAPPL1[8]=15;
if(C_FINDEX[12]){L_RAPPL1[8]=16;}
RSPEAK(L_RAPPL1,8);
L_RAPPL1[8]=(17+C_FINDEX[53]);
if(SF_RAPPL1_QOPEN(C_OINDEX[43])){L_RAPPL1[8]=(L_RAPPL1[8]+2);}
RSPEAK(L_RAPPL1,8);
return L_RAPPL1[7];
case 3500:
if(((C_PRSVEC[0]!=C_VINDEX[40])&&((C_PRSVEC[0]!=C_VINDEX[52])||(C_PRSVEC[1]!=C_OINDEX[6])))){return L_RAPPL1[7];}
C_ADVS[C_PLAY[0]+4]=C_STATE[2];
L_RAPPL1[8]=1;L_RAPPL1[9]=C_OBJCTS[0];
case 100001:
if(L_RAPPL1[8]>L_RAPPL1[9]){pc=100002;continue L;}
L_RAPPL1[10]=L_RAPPL1[8];
case 3550:
L_RAPPL1[10]=C_OBJCTS[L_RAPPL1[10]+2640];
if((L_RAPPL1[10]==0)){pc=3600;continue L;}
if((L_RAPPL1[10]!=C_OINDEX[6])){pc=3550;continue L;}
C_ADVS[C_PLAY[0]+4]=(C_ADVS[C_PLAY[0]+4]+C_OBJCTS[L_RAPPL1[8]+1540]);
case 3600:
L_RAPPL1[8]+=1;pc=100001;continue L;
case 100002:
SCRUPD([0],0);
return L_RAPPL1[7];
case 4000:
if((C_PRSVEC[0]!=C_VINDEX[27])){pc=4500;continue L;}
RSPEAK([21],0);
return L_RAPPL1[7];
case 4500:
if((C_PRSVEC[0]!=C_VINDEX[5])){return L_RAPPL1[7];}
if((ZAND(C_OBJCTS,C_OINDEX[43]+1100,[(C_OFLAGS[28]+C_OFLAGS[29])],0)!=C_OFLAGS[28])){return L_RAPPL1[7];}
C_OBJCTS[C_OINDEX[43]+1100]=ZAND([ZOR(C_OBJCTS,C_OINDEX[43]+1100,C_OFLAGS,29)],0,[ZNOT(C_OFLAGS,28)],0);
RSPEAK([22],0);
return L_RAPPL1[7];
case 5000:
if((C_PRSVEC[0]!=C_VINDEX[27])){return L_RAPPL1[7];}
RSPEAK([23],0);
L_RAPPL1[8]=24;
if(C_FINDEX[24]){L_RAPPL1[8]=26;}
if(SF_RAPPL1_QOPEN(C_OINDEX[42])){L_RAPPL1[8]=25;}
RSPEAK(L_RAPPL1,8);
return L_RAPPL1[7];
case 6000:
if((C_PRSVEC[0]!=C_VINDEX[27])){pc=6500;continue L;}
RSPEAK([27],0);
if((C_FINDEX[49]==0)){return L_RAPPL1[7];}
L_RAPPL1[8]=28;
if(SF_RAPPL1_QOPEN(C_OINDEX[42])){L_RAPPL1[8]=29;}
RSPEAK(L_RAPPL1,8);
return L_RAPPL1[7];
case 6500:
if(((C_FINDEX[49]!=0)||(QHERE(C_OINDEX,15,C_RINDEX,9)&&((C_PRSVEC[0]!=C_VINDEX[30])||(C_PRSVEC[2]!=C_OINDEX[15]))))){return L_RAPPL1[7];}
RSPEAK([30],0);
C_FINDEX[49]=1;
return L_RAPPL1[7];
case 7000:
if((C_PRSVEC[0]!=C_VINDEX[27])){return L_RAPPL1[7];}
L_RAPPL1[8]=31;
if(C_FINDEX[5]){L_RAPPL1[8]=32;}
RSPEAK(L_RAPPL1,8);
RSPEAK([33],0);
return L_RAPPL1[7];
case 8000:
if((C_PRSVEC[0]!=C_VINDEX[27])){return L_RAPPL1[7];}
L_RAPPL1[8]=34;
if(C_FINDEX[5]){L_RAPPL1[8]=35;}
RSPEAK(L_RAPPL1,8);
return L_RAPPL1[7];
case 9000:
if((C_PRSVEC[0]!=C_VINDEX[27])){return L_RAPPL1[7];}
L_RAPPL1[8]=36;
if(C_FINDEX[5]){L_RAPPL1[8]=37;}
RSPEAK(L_RAPPL1,8);
RSPEAK([38],0);
return L_RAPPL1[7];
case 10000:
if((C_PRSVEC[0]!=C_VINDEX[27])){return L_RAPPL1[7];}
RSPEAK([39],0);
L_RAPPL1[8]=0;
if(C_FINDEX[30]){L_RAPPL1[8]=40;}
if(C_FINDEX[7]){L_RAPPL1[8]=41;}
RSPEAK(L_RAPPL1,8);
return L_RAPPL1[7];
case 11000:
if((C_PRSVEC[0]==C_VINDEX[5])){C_CEVENT[C_CINDEX[15]+50]=1;}
return L_RAPPL1[7];
case 12000:
if((C_PRSVEC[0]!=C_VINDEX[27])){return L_RAPPL1[7];}
RSPEAK([42],0);
if(C_FINDEX[17]){RSPEAK([43],0);}
return L_RAPPL1[7];
case 13000:
if((C_PRSVEC[0]!=C_VINDEX[5])){return L_RAPPL1[7];}
if(((PROB([50],0,[50],0)||(C_OBJCTS[C_OINDEX[31]+2420]!=C_PLAY[0]))||(!SF_RAPPL1_QON(C_OINDEX[31])))){return L_RAPPL1[7];}
C_OBJCTS[C_OINDEX[31]+880]=ZAND(C_OBJCTS,C_OINDEX[31]+880,[ZNOT(C_OFLAGS,15)],0);
RSPEAK([47],0);
C_CEVENT[C_CINDEX[4]+50]=0;
return L_RAPPL1[7];
case 14000:
L_RAPPL1[10]=C_OBJCTS[C_OINDEX[31]+220];
if(((C_OBJCTS[C_OINDEX[31]+2420]==C_PLAY[0])&&SF_RAPPL1_QON(C_OINDEX[31]))){pc=14100;continue L;}
L_RAPPL1[10]=C_OBJCTS[C_OINDEX[23]+220];
if(((C_OBJCTS[C_OINDEX[23]+2420]==C_PLAY[0])&&SF_RAPPL1_QON(C_OINDEX[23]))){pc=14100;continue L;}
L_RAPPL1[10]=C_OBJCTS[C_OINDEX[32]+220];
if(((C_OBJCTS[C_OINDEX[32]+2420]==C_PLAY[0])&&SF_RAPPL1_QON(C_OINDEX[32]))){pc=14100;continue L;}
return L_RAPPL1[7];
case 14100:
if((C_PRSVEC[0]!=C_VINDEX[31])){pc=14200;continue L;}
RSPSUB([294],0,L_RAPPL1,10);
(yield* JIGSUP([44],0));
return L_RAPPL1[7];
case 14200:
if((C_PRSVEC[0]!=C_VINDEX[5])){return L_RAPPL1[7];}
RSPSUB([295],0,L_RAPPL1,10);
(yield* JIGSUP([44],0));
return L_RAPPL1[7];
case 15000:
C_FINDEX[28]=1;
L_RAPPL1[8]=1;L_RAPPL1[11]=C_OBJCTS[0];
case 100003:
if(L_RAPPL1[8]>L_RAPPL1[11]){pc=100004;continue L;}
if((C_OBJCTS[L_RAPPL1[8]+2420]==C_PLAY[0])){C_FINDEX[28]=0;}
case 15100:
L_RAPPL1[8]+=1;pc=100003;continue L;
case 100004:
if(((C_PLAY[1]!=C_RINDEX[15])||(!LIT(C_PLAY,1)))){return L_RAPPL1[7];}
SCRUPD(C_STATE,5);
C_STATE[5]=0;
return L_RAPPL1[7];
case 16000:
if((C_PRSVEC[0]!=C_VINDEX[27])){return L_RAPPL1[7];}
L_RAPPL1[8]=46;
if(SF_RAPPL1_QOPEN(C_OINDEX[4])){L_RAPPL1[8]=12;}
RSPSUB([45],0,L_RAPPL1,8);
return L_RAPPL1[7];
case 17000:
if((C_PRSVEC[0]!=C_VINDEX[27])){pc=17500;continue L;}
RSPEAK([48],0);
if((C_OBJCTS[C_OINDEX[0]+2420]==C_PLAY[0])){RSPEAK([49],0);}
return L_RAPPL1[7];
case 17500:
if(((C_PRSVEC[0]!=C_VINDEX[5])||(C_OBJCTS[C_OINDEX[0]+2420]==C_PLAY[0]))){return L_RAPPL1[7];}
RSPEAK([50],0);
L_RAPPL1[4]=MOVETO(C_BATS,(ZRND([9],0)+1)-1,C_PLAY,0);
L_RAPPL1[7]=0;
return L_RAPPL1[7];
case 18000:
if((C_PRSVEC[0]!=C_VINDEX[27])){pc=18500;continue L;}
RSPEAK([51],0);
if(C_FINDEX[6]){RSPEAK([52],0);}
return L_RAPPL1[7];
case 18500:
if((C_PRSVEC[0]==C_VINDEX[58])){(yield* JIGSUP([53],0));}
return L_RAPPL1[7];
case 19000:
if((C_PRSVEC[0]!=C_VINDEX[27])){return L_RAPPL1[7];}
RSPEAK([54],0);
if(C_FINDEX[6]){RSPEAK([55],0);}
return L_RAPPL1[7];
case 20000:
if((C_PRSVEC[0]!=C_VINDEX[27])){pc=20500;continue L;}
RSPEAK([56],0);
if((!C_FINDEX[3])){RSPEAK([57],0);}
return L_RAPPL1[7];
case 20500:
if(((C_PRSVEC[0]==C_VINDEX[5])&&C_FINDEX[4])){(yield* JIGSUP([58],0));}
return L_RAPPL1[7];
case 21000:
if((C_PRSVEC[0]!=C_VINDEX[27])){pc=21500;continue L;}
RSPEAK([59],0);
if((!C_FINDEX[10])){RSPEAK([60],0);}
return L_RAPPL1[7];
case 21500:
if((C_PRSVEC[0]!=C_VINDEX[13])){return L_RAPPL1[7];}
if(((((C_OBJCTS[C_OINDEX[29]+2420]==C_PLAY[0])&&(C_OBJCTS[C_OINDEX[30]+2420]==C_PLAY[0]))&&(C_OBJCTS[C_OINDEX[31]+2420]==C_PLAY[0]))&&SF_RAPPL1_QON(C_OINDEX[31]))){pc=21600;continue L;}
RSPEAK([62],0);
return L_RAPPL1[7];
case 21600:
if(QHERE(C_OINDEX,27,C_PLAY,1)){pc=21700;continue L;}
(yield* JIGSUP([61],0));
return L_RAPPL1[7];
case 21700:
NEWSTA(C_OINDEX,27,[63],0,[0],0,[0],0,[0],0);
C_FINDEX[10]=1;
return L_RAPPL1[7];
case 22000:
if((C_PRSVEC[0]!=C_VINDEX[27])){return L_RAPPL1[7];}
RSPEAK([64],0);
if(C_FINDEX[19]){RSPEAK([65],0);}
return L_RAPPL1[7];
case 23000:
if((C_PRSVEC[0]!=C_VINDEX[27])){return L_RAPPL1[7];}
RSPEAK([66],0);
L_RAPPL1[8]=67;
if(C_FINDEX[5]){L_RAPPL1[8]=68;}
RSPEAK(L_RAPPL1,8);
RSPEAK([69],0);
if(C_FINDEX[25]){RSPEAK([70],0);}
return L_RAPPL1[7];
case 24000:
if((C_PRSVEC[0]!=C_VINDEX[27])){return L_RAPPL1[7];}
RSPEAK([660],0);
L_RAPPL1[8]=661;
L_RAPPL1[10]=1;L_RAPPL1[12]=C_OBJCTS[0];
case 100005:
if(L_RAPPL1[10]>L_RAPPL1[12]){pc=100006;continue L;}
if(((!QHERE(L_RAPPL1,10,C_RINDEX,8))||(L_RAPPL1[10]==C_OINDEX[85]))){pc=24200;continue L;}
RSPEAK(L_RAPPL1,8);
L_RAPPL1[8]=0;
RSPSUB([502],0,C_OBJCTS,L_RAPPL1[10]+220);
case 24200:
L_RAPPL1[10]+=1;pc=100005;continue L;
case 100006:
return L_RAPPL1[7];
case 25000:
if((C_PRSVEC[0]!=C_VINDEX[27])){return L_RAPPL1[7];}
RSPEAK([606],0);
L_RAPPL1[8]=607;
if((C_FINDEX[50]>0)){L_RAPPL1[8]=608;}
if((C_FINDEX[50]<0)){L_RAPPL1[8]=609;}
if(C_FINDEX[11]){L_RAPPL1[8]=610;}
if(C_FINDEX[12]){L_RAPPL1[8]=611;}
RSPEAK(L_RAPPL1,8);
if(((!C_FINDEX[11])&&(C_FINDEX[50]!=0))){RSPEAK([(193+Math.abs(C_FINDEX[50]))],0);}
return L_RAPPL1[7];
case 26000:
if((C_PRSVEC[0]!=C_VINDEX[5])){return L_RAPPL1[7];}
L_RAPPL1[8]=1;L_RAPPL1[13]=8;
case 100007:
if(L_RAPPL1[8]>L_RAPPL1[13]){pc=100008;continue L;}
if((C_SCREEN[0]==C_SCREEN[L_RAPPL1[8]+2])){C_SCREEN[1]=C_SCREEN[(L_RAPPL1[8]+1)+2];}
case 26100:
L_RAPPL1[8]+=2;pc=100007;continue L;
case 100008:
return L_RAPPL1[7];
case 27000:
if(((C_PRSVEC[0]!=C_VINDEX[5])||(!C_HACK[2]))){return L_RAPPL1[7];}
if((C_OBJCTS[C_OINDEX[39]+2200]!=C_PLAY[1])){NEWSTA(C_OINDEX,39,[82],0,C_PLAY,1,[0],0,[0],0);}
C_HACK[0]=C_PLAY[1];
C_OBJCTS[C_OINDEX[39]+1100]=ZOR(C_OBJCTS,C_OINDEX[39]+1100,C_OFLAGS,23);
if((C_OBJCTS[C_OINDEX[38]+2200]==C_PLAY[1])){C_OBJCTS[C_OINDEX[38]+880]=ZAND(C_OBJCTS,C_OINDEX[38]+880,[ZNOT(C_OFLAGS,2)],0);}
L_RAPPL1[10]=0;
L_RAPPL1[8]=1;L_RAPPL1[14]=C_OBJCTS[0];
case 100009:
if(L_RAPPL1[8]>L_RAPPL1[14]){pc=100010;continue L;}
if((((L_RAPPL1[8]==C_OINDEX[38])||(L_RAPPL1[8]==C_OINDEX[39]))||(!QHERE(L_RAPPL1,8,C_PLAY,1)))){pc=27200;continue L;}
L_RAPPL1[10]=83;
C_OBJCTS[L_RAPPL1[8]+880]=ZAND(C_OBJCTS,L_RAPPL1[8]+880,[ZNOT(C_OFLAGS,0)],0);
case 27200:
L_RAPPL1[8]+=1;pc=100009;continue L;
case 100010:
RSPEAK(L_RAPPL1,10);
return L_RAPPL1[7];
case 28000:
C_FINDEX[29]=((C_OBJCTS[C_OINDEX[53]+2420]!=C_PLAY[0]))?1:0;
return L_RAPPL1[7];
case 29000:
if(((!C_FINDEX[23])||(C_OBJCTS[C_OINDEX[55]+2420]!=C_PLAY[0]))){return L_RAPPL1[7];}
RSPEAK([84],0);
C_FINDEX[23]=0;
return L_RAPPL1[7];
case 30000:
if((C_PRSVEC[0]!=C_VINDEX[27])){(yield* JIGSUP([85],0));}
return L_RAPPL1[7];
case 31000:
if(((C_PRSVEC[0]!=C_VINDEX[57])||(C_PRSVEC[2]!=C_OINDEX[56]))){return L_RAPPL1[7];}
C_FINDEX[51]=(C_FINDEX[51]+1);
pc=[31100,31100,31100,31400,31500][C_FINDEX[51]-1];if(pc!==undefined)continue L;
BUG([2],0,C_FINDEX,51);
case 31100:
RSPEAK([(85+C_FINDEX[51])],0);
return L_RAPPL1[7];
case 31400:
L_RAPPL1[8]=89;
if((ZAND(C_OBJCTS,C_OINDEX[49]+880,C_OFLAGS,0)!=0)){L_RAPPL1[8]=88;}
RSPEAK(L_RAPPL1,8);
C_OBJCTS[C_OINDEX[49]+880]=ZOR(C_OBJCTS,C_OINDEX[49]+880,C_OFLAGS,0);
return L_RAPPL1[7];
case 31500:
C_FINDEX[51]=0;
(yield* JIGSUP([90],0));
return L_RAPPL1[7];
case 32000:
if(((C_PRSVEC[0]!=C_VINDEX[57])||(C_PRSVEC[2]!=C_OINDEX[56]))){return L_RAPPL1[7];}
L_RAPPL1[8]=91;
if((!QHERE(C_OINDEX,59,C_PLAY,1))){pc=32100;continue L;}
C_FINDEX[52]=Math.min(4,(C_FINDEX[52]+1));
L_RAPPL1[8]=(91+C_FINDEX[52]);
case 32100:
RSPEAK(L_RAPPL1,8);
return L_RAPPL1[7];
case 33000:
if((C_PRSVEC[0]!=C_VINDEX[27])){return L_RAPPL1[7];}
RSPEAK([96],0);
L_RAPPL1[8]=97;
if(C_FINDEX[26]){L_RAPPL1[8]=98;}
RSPEAK(L_RAPPL1,8);
return L_RAPPL1[7];
case 34000:
if((C_PRSVEC[0]!=C_VINDEX[27])){return L_RAPPL1[7];}
RSPEAK([100],0);
L_RAPPL1[8]=102;
if((ZAND(C_ROOMS,C_RINDEX[46]+801,C_RFLAG,7)!=0)){L_RAPPL1[8]=101;}
RSPEAK(L_RAPPL1,8);
return L_RAPPL1[7];
case 35000:
if((C_PRSVEC[0]!=C_VINDEX[27])){return L_RAPPL1[7];}
RSPEAK([104],0);
L_RAPPL1[8]=105;
if(C_FINDEX[14]){L_RAPPL1[8]=106;}
RSPEAK(L_RAPPL1,8);
return L_RAPPL1[7];
case 36000:
if((C_PRSVEC[0]!=C_VINDEX[27])){pc=36500;continue L;}
RSPEAK([107],0);
return L_RAPPL1[7];
case 36500:
if(((C_PRSVEC[0]!=C_VINDEX[5])||(!C_FINDEX[3]))){return L_RAPPL1[7];}
if(C_FINDEX[4]){pc=36600;continue L;}
RSPEAK([108],0);
return L_RAPPL1[7];
case 36600:
L_RAPPL1[8]=58;
if((C_PLAY[0]!=C_AINDEX[0])){L_RAPPL1[8]=99;}
(yield* JIGSUP(L_RAPPL1,8));
return L_RAPPL1[7];
case 37000:
if(C_FINDEX[1]){L_RAPPL1[4]=MOVETO(C_RINDEX,47,C_PLAY,0);}
return L_RAPPL1[7];
return L_RAPPL1[7];
}}
/* rooms.f */
function* RAPPL2(RI,RI_){
function SF_RAPPL2_QOPEN(R){return (ZAND(C_OBJCTS,R+1100,C_OFLAGS,28)!=0)}
var pc=0;L:for(;;)switch(pc){case 0:
L_RAPPL2[3]=1;
pc=[38000,39000,40000,41000,42000,43000,44000,45000,46000,47000,48000,49000,50000,51000,52000,53000,54000,55000,56000,57000,58000,59000,60000][((RI[RI_]-L_RAPPL2[4])+1)-1];if(pc!==undefined)continue L;
BUG([70],0,RI,RI_);
return L_RAPPL2[3];
case 38000:
if((C_PRSVEC[0]==C_VINDEX[27])){LOOKTO(C_RINDEX,69,C_RINDEX,67,[0],0,[682],0,[681],0);}
return L_RAPPL2[3];
case 39000:
if((C_PRSVEC[0]==C_VINDEX[5])){(yield* JIGSUP([685],0));}
return L_RAPPL2[3];
case 40000:
if((C_PRSVEC[0]==C_VINDEX[27])){LOOKTO(C_RINDEX,67,C_RINDEX,65,[683],0,[0],0,[681],0);}
return L_RAPPL2[3];
case 41000:
if((C_PRSVEC[0]==C_VINDEX[27])){LOOKTO(C_RINDEX,66,C_RINDEX,64,[0],0,[0],0,[681],0);}
return L_RAPPL2[3];
case 42000:
if((C_PRSVEC[0]==C_VINDEX[27])){LOOKTO(C_RINDEX,65,[0],0,[0],0,[684],0,[681],0);}
return L_RAPPL2[3];
case 43000:
if((C_PRSVEC[0]==C_VINDEX[27])){EWTELL(C_PLAY,1,[683],0);}
return L_RAPPL2[3];
case 44000:
if((C_PRSVEC[0]==C_VINDEX[27])){EWTELL(C_PLAY,1,[686],0);}
return L_RAPPL2[3];
case 45000:
if((C_PRSVEC[0]==C_VINDEX[27])){EWTELL(C_PLAY,1,[687],0);}
return L_RAPPL2[3];
case 46000:
if((C_PRSVEC[0]!=C_VINDEX[27])){return L_RAPPL2[3];}
RSPEAK([688],0);
L_RAPPL2[5]=689;
if(((C_FINDEX[57]==270)&&(C_FINDEX[58]==C_RINDEX[65]))){L_RAPPL2[5]=(690+Math.min(C_FINDEX[59],1));}
if(((C_FINDEX[57]%180)==0)){L_RAPPL2[5]=(692+Math.min(C_FINDEX[59],1));}
RSPEAK(L_RAPPL2,5);
RSPSUB([694],0,[(695+DIV(C_FINDEX[57],45))],0);
return L_RAPPL2[3];
case 47000:
if((C_PRSVEC[0]!=C_VINDEX[27])){return L_RAPPL2[3];}
L_RAPPL2[5]=704;
L_RAPPL2[6]=1;L_RAPPL2[7]=C_OBJCTS[0];
case 100001:
if(L_RAPPL2[6]>L_RAPPL2[7]){pc=100002;continue L;}
if((QHERE(L_RAPPL2,6,C_PLAY,1)&&(L_RAPPL2[6]!=C_OINDEX[98]))){pc=47200;continue L;}
case 47100:
L_RAPPL2[6]+=1;pc=100001;continue L;
case 100002:
L_RAPPL2[5]=703;
case 47200:
RSPSUB(L_RAPPL2,5,C_OBJCTS,L_RAPPL2[6]+220);
LOOKTO(C_RINDEX,64,[0],0,[0],0,[0],0,[0],0);
return L_RAPPL2[3];
case 48000:
if((C_PRSVEC[0]!=C_VINDEX[27])){return L_RAPPL2[3];}
L_RAPPL2[5]=46;
if(SF_RAPPL2_QOPEN(C_OINDEX[70])){L_RAPPL2[5]=12;}
RSPSUB([705],0,L_RAPPL2,5);
return L_RAPPL2[3];
case 49000:
if((C_PRSVEC[0]!=C_VINDEX[27])){return L_RAPPL2[3];}
RSPEAK([706],0);
L_RAPPL2[5]=46;
if(SF_RAPPL2_QOPEN(C_OINDEX[99])){L_RAPPL2[5]=12;}
if((C_FINDEX[63]==4)){RSPSUB([707],0,L_RAPPL2,5);}
return L_RAPPL2[3];
case 50000:
if((C_PRSVEC[0]!=C_VINDEX[5])){pc=50100;continue L;}
C_CEVENT[C_CINDEX[23]+50]=1;
C_CEVENT[C_CINDEX[23]]=(-1);
return L_RAPPL2[3];
case 50100:
if((C_PRSVEC[0]!=C_VINDEX[27])){return L_RAPPL2[3];}
L_RAPPL2[5]=46;
if(SF_RAPPL2_QOPEN(C_OINDEX[100])){L_RAPPL2[5]=12;}
RSPSUB([708],0,L_RAPPL2,5);
return L_RAPPL2[3];
case 51000:
if((C_PRSVEC[0]==C_VINDEX[5])){C_CEVENT[C_CINDEX[23]]=0;}
if((C_PRSVEC[0]!=C_VINDEX[27])){return L_RAPPL2[3];}
LOOKTO([0],0,C_RINDEX,68,[709],0,[0],0,[0],0);
L_RAPPL2[5]=46;
if(C_FINDEX[41]){L_RAPPL2[5]=12;}
L_RAPPL2[6]=46;
if(SF_RAPPL2_QOPEN(C_OINDEX[100])){L_RAPPL2[6]=12;}
RSPSB2([710],0,L_RAPPL2,5,L_RAPPL2,6);
return L_RAPPL2[3];
case 52000:
if((C_PRSVEC[0]!=C_VINDEX[27])){return L_RAPPL2[3];}
L_RAPPL2[5]=46;
if(SF_RAPPL2_QOPEN(C_OINDEX[101])){L_RAPPL2[5]=12;}
RSPSUB([711],0,L_RAPPL2,5);
return L_RAPPL2[3];
case 53000:
if((C_PRSVEC[0]==C_VINDEX[27])){RSPSUB([712],0,[(712+C_FINDEX[64])],0);}
return L_RAPPL2[3];
case 54000:
if((C_PRSVEC[0]!=C_VINDEX[27])){return L_RAPPL2[3];}
L_RAPPL2[5]=721;
if(SF_RAPPL2_QOPEN(C_OINDEX[101])){L_RAPPL2[5]=722;}
RSPEAK(L_RAPPL2,5);
L_RAPPL2[5]=46;
if(SF_RAPPL2_QOPEN(C_OINDEX[99])){L_RAPPL2[5]=12;}
if((C_FINDEX[63]==4)){RSPSUB([723],0,L_RAPPL2,5);}
return L_RAPPL2[3];
case 55000:
if((C_PRSVEC[0]==C_VINDEX[27])){RSPEAK([724],0);}
return L_RAPPL2[3];
case 56000:
if((C_PRSVEC[0]!=C_VINDEX[27])){return L_RAPPL2[3];}
L_RAPPL2[5]=46;
if(SF_RAPPL2_QOPEN(C_OINDEX[99])){L_RAPPL2[5]=12;}
RSPSUB([725],0,L_RAPPL2,5);
return L_RAPPL2[3];
case 57000:
if((C_PRSVEC[0]!=C_VINDEX[5])){return L_RAPPL2[3];}
RSPEAK([726],0);
SCORE([0],0);
ICLOSE("DBCH");
EXIT();
case 58000:
if((C_PRSVEC[0]!=C_VINDEX[27])){return L_RAPPL2[3];}
L_RAPPL2[5]=46;
if(SF_RAPPL2_QOPEN(C_OINDEX[70])){L_RAPPL2[5]=12;}
RSPSUB([792],0,L_RAPPL2,5);
return L_RAPPL2[3];
case 59000:
if((C_PRSVEC[0]!=C_VINDEX[27])){return L_RAPPL2[3];}
L_RAPPL2[5]=861;
if(C_FINDEX[44]){L_RAPPL2[5]=862;}
RSPEAK(L_RAPPL2,5);
return L_RAPPL2[3];
case 60000:
if((C_PRSVEC[0]!=C_VINDEX[27])){return L_RAPPL2[3];}
if(C_FINDEX[45]){pc=60100;continue L;}
RSPEAK([868],0);
if((ZAND(C_OBJCTS,C_OINDEX[104]+1100,C_OFLAGS,29)!=0)){RSPEAK([869],0);}
return L_RAPPL2[3];
case 60100:
CPINFO([880],0,C_FINDEX,67);
return L_RAPPL2[3];
return L_RAPPL2[3];
}}
/* rooms.f */
function LOOKTO(NRM,NRM_,SRM,SRM_,NT,NT_,ST,ST_,HT,HT_){
var pc=0;L:for(;;)switch(pc){case 0:
RSPEAK(HT,HT_);
RSPEAK(NT,NT_);
RSPEAK(ST,ST_);
L_LOOKTO[0]=0;
if((Math.abs((C_FINDEX[58]-C_PLAY[1]))!=1)){pc=200;continue L;}
if((C_FINDEX[58]==NRM[NRM_])){L_LOOKTO[0]=695;}
if((C_FINDEX[58]==SRM[SRM_])){L_LOOKTO[0]=699;}
if(((C_FINDEX[57]%180)!=0)){pc=100;continue L;}
RSPSUB([847],0,L_LOOKTO,0);
RSPSB2([848],0,L_LOOKTO,0,L_LOOKTO,0);
pc=200;continue L;
case 100:
L_LOOKTO[1]=MRHERE(C_PLAY,1);
L_LOOKTO[2]=0;
if((((L_LOOKTO[1]==1)&&(!C_FINDEX[39]))||((L_LOOKTO[1]==2)&&(!C_FINDEX[40])))){L_LOOKTO[2]=1;}
RSPSUB([(849+L_LOOKTO[2])],0,L_LOOKTO,0);
if(((L_LOOKTO[1]==1)&&C_FINDEX[37])){RSPEAK([(823+L_LOOKTO[2])],0);}
if((L_LOOKTO[2]!=0)){RSPEAK([851],0);}
case 200:
L_LOOKTO[3]=0;
if(((NT[NT_]==0)&&((L_LOOKTO[0]==0)||(L_LOOKTO[0]==699)))){L_LOOKTO[3]=852;}
if(((ST[ST_]==0)&&((L_LOOKTO[0]==0)||(L_LOOKTO[0]==695)))){L_LOOKTO[3]=853;}
if((((NT[NT_]+ST[ST_])+L_LOOKTO[0])==0)){L_LOOKTO[3]=854;}
if((HT[HT_]!=0)){RSPEAK(L_LOOKTO,3);}
return;
return;
}}
/* rooms.f */
function EWTELL(RM,RM_,ST,ST_){
L_EWTELL[0]=(((C_FINDEX[57]+Math.imul(((RM[RM_]-C_RINDEX[70])%2),180))==180))?1:0;
L_EWTELL[1]=(819+((RM[RM_]-C_RINDEX[70])%2));
if(((L_EWTELL[0]&&(!C_FINDEX[39]))||((!L_EWTELL[0])&&(!C_FINDEX[40])))){L_EWTELL[1]=(L_EWTELL[1]+2);}
RSPEAK(L_EWTELL,1);
if((L_EWTELL[0]&&C_FINDEX[37])){RSPEAK([(823+DIV((L_EWTELL[1]-819),2))],0);}
RSPEAK([825],0);
RSPEAK(ST,ST_);
return;
return;
}
/* sverbs.f */
function* SVERBS(RI,RI_){
function SF_SVERBS_QOPEN(R){return (ZAND(C_OBJCTS,R+1100,C_OFLAGS,28)!=0)}
var pc=0;L:for(;;)switch(pc){case 0:
L_SVERBS[78+31]=String.fromCharCode(0);
L_SVERBS[157]=1;
if((C_PRSVEC[2]!=0)){L_SVERBS[158]=C_OBJCTS[C_PRSVEC[2]+220];}
if((C_PRSVEC[1]!=0)){L_SVERBS[159]=C_OBJCTS[C_PRSVEC[1]+220];}
if((RI[RI_]==0)){BUG([7],0,RI,RI_);}
if((RI[RI_]<=L_SVERBS[160])){return L_SVERBS[157];}
if((RI[RI_]<=L_SVERBS[161])){pc=100;continue L;}
pc=[65000,66000,67000,68000,69000,1000,2000,3000,4000,5000,6000,7000,8000,9000,10000,11000,12000,13000,14000,15000,16000,17000,18000,19000,20000,21000,22000,23000,24000,25000,26000,27000][(RI[RI_]-L_SVERBS[161])-1];if(pc!==undefined)continue L;
BUG([7],0,RI,RI_);
case 10:
L_SVERBS[157]=0;
return L_SVERBS[157];
case 100:
L_SVERBS[162]=L_SVERBS[(RI[RI_]-L_SVERBS[160])+6];
L_SVERBS[163]=DIV(L_SVERBS[162],1000);
if((L_SVERBS[163]!=0)){L_SVERBS[162]=((L_SVERBS[162]%1000)+ZRND(L_SVERBS,163));}
RSPEAK(L_SVERBS,162);
return L_SVERBS[157];
case 65000:
L_SVERBS[157]=(yield* RMDESC([2],0));
return L_SVERBS[157];
case 66000:
L_SVERBS[157]=(yield* RMDESC([1],0));
if((!C_PLAY[2])){RSPEAK([138],0);}
return L_SVERBS[157];
case 67000:
RSPEAK([(C_ROOMS[1]-C_PLAY[1])],0);
return L_SVERBS[157];
case 68000:
return L_SVERBS[157];
case 69000:
return L_SVERBS[157];
case 1000:
C_FINDEX[21]=1;
C_FINDEX[22]=0;
RSPEAK([326],0);
return L_SVERBS[157];
case 2000:
C_FINDEX[21]=0;
C_FINDEX[22]=0;
RSPEAK([327],0);
return L_SVERBS[157];
case 3000:
C_FINDEX[22]=1;
RSPEAK([328],0);
return L_SVERBS[157];
case 4000:
if((C_PLAY[0]!=C_AINDEX[2])){pc=4100;continue L;}
RSPEAK([781],0);
C_CEVENT[C_CINDEX[23]]=0;
return L_SVERBS[157];
case 4100:
if((C_PLAY[0]==C_AINDEX[0])){RSPEAK([664],0);}
return L_SVERBS[157];
case 5000:
var W=WSTART("' V',I1,'.',I2,'A'");W.put(C_VERS[0]);W.put(C_VERS[1]);W.end();
C_PLAY[2]=1;
return L_SVERBS[157];
case 6000:
L_SVERBS[162]=330;
if((ZAND(C_ROOMS,C_PLAY[1]+801,[(C_RFLAG[3]+C_RFLAG[6])],0)==0)){L_SVERBS[162]=(331+ZRND([3],0));}
RSPEAK(L_SVERBS,162);
return L_SVERBS[157];
case 7000:
if((C_PLAY[1]==C_RINDEX[35])){pc=7100;continue L;}
RSPEAK([334],0);
return L_SVERBS[157];
case 7100:
(yield* JIGSUP([335],0));
return L_SVERBS[157];
case 8000:
if(((C_PLAY[1]==C_RINDEX[30])&&QHERE(C_OINDEX,37,C_PLAY,1))){pc=8100;continue L;}
RSPEAK([336],0);
return L_SVERBS[157];
case 8100:
NEWSTA(C_OINDEX,37,[337],0,[0],0,[0],0,[0],0);
C_FINDEX[11]=1;
C_FINDEX[12]=1;
C_OBJCTS[C_OINDEX[37]+1100]=ZAND(C_OBJCTS,C_OINDEX[37]+1100,[ZNOT(C_OFLAGS,23)],0);
return L_SVERBS[157];
case 9000:
if((C_FINDEX[9]||(C_PLAY[1]!=C_RINDEX[20]))){pc=9100;continue L;}
C_FINDEX[9]=1;
RSPEAK([338],0);
return L_SVERBS[157];
case 9100:
RSPEAK([339],0);
return L_SVERBS[157];
case 10000:
if((C_PLAY[1]!=C_RINDEX[23])){pc=10050;continue L;}
if(MOVETO(C_RINDEX,7,C_PLAY,0)){pc=10100;continue L;}
case 10050:
RSPEAK([340],0);
return L_SVERBS[157];
case 10100:
L_SVERBS[6]=(yield* RMDESC([3],0));
return L_SVERBS[157];
case 11000:
if((C_PLAY[1]!=C_RINDEX[22])){pc=11050;continue L;}
if(MOVETO(C_RINDEX,26,C_PLAY,0)){pc=10100;continue L;}
case 11050:
RSPEAK([341],0);
return L_SVERBS[157];
case 12000:
if((C_PLAY[1]!=C_RINDEX[26])){pc=12050;continue L;}
if(MOVETO(C_RINDEX,22,C_PLAY,0)){pc=10100;continue L;}
case 12050:
RSPEAK([341],0);
return L_SVERBS[157];
case 13000:
L_SVERBS[162]=342;
if((C_PRSVEC[2]==C_OINDEX[63])){L_SVERBS[162]=252;}
RSPEAK(L_SVERBS,162);
return L_SVERBS[157];
case 14000:
SCORE([0],0);
return L_SVERBS[157];
case 15000:
SCORE([1],0);
if((!(yield* YESNO([343],0,[0],0,[0],0)))){return L_SVERBS[157];}
ICLOSE("DBCH");
EXIT();
case 16000:
if((C_PLAY[0]!=C_AINDEX[2])){return L_SVERBS[157];}
RSPEAK([782],0);
C_CEVENT[C_CINDEX[23]]=(-1);
return L_SVERBS[157];
case 17000:
if(((C_SCREEN[1]==0)||((C_PRSVEC[2]!=C_OINDEX[88])&&((C_PRSVEC[2]!=C_OINDEX[118])||(C_PLAY[1]!=C_RINDEX[59]))))){pc=17100;continue L;}
C_SCREEN[2]=C_SCREEN[1];
C_PRSVEC[2]=0;
C_CEVENT[C_CINDEX[16]]=6;
RSPEAK([668],0);
L_SVERBS[6]=MOVETO(C_SCREEN,1,C_PLAY,0);
L_SVERBS[6]=(yield* RMDESC([3],0));
return L_SVERBS[157];
case 17100:
if((C_PLAY[1]!=C_SCREEN[2])){pc=17300;continue L;}
L_SVERBS[162]=1;L_SVERBS[164]=12;
case 100001:
if(L_SVERBS[162]>L_SVERBS[164]){pc=100002;continue L;}
if(((C_SCREEN[L_SVERBS[162]+10]==C_PLAY[1])&&(C_SCREEN[(L_SVERBS[162]+1)+10]==C_PRSVEC[2]))){pc=17500;continue L;}
case 17200:
L_SVERBS[162]+=3;pc=100001;continue L;
case 100002:
case 17300:
if((ZAND(C_OBJCTS,C_PRSVEC[2]+880,C_OFLAGS,2)!=0)){pc=17400;continue L;}
L_SVERBS[162]=669;
if((C_PRSVEC[2]==C_OINDEX[88])){L_SVERBS[162]=670;}
RSPSUB(L_SVERBS,162,L_SVERBS,158);
return L_SVERBS[157];
case 17400:
L_SVERBS[162]=671;
if((C_OBJCTS[C_PRSVEC[2]+2200]!=0)){L_SVERBS[162]=(552+ZRND([5],0));}
RSPEAK(L_SVERBS,162);
return L_SVERBS[157];
case 17500:
C_PRSVEC[2]=C_SCREEN[(L_SVERBS[162]+2)+10];
L_SVERBS[162]=1;L_SVERBS[165]=8;
case 100003:
if(L_SVERBS[162]>L_SVERBS[165]){pc=100004;continue L;}
if((C_PRSVEC[2]==C_SCREEN[L_SVERBS[162]+2])){C_SCREEN[1]=C_SCREEN[(L_SVERBS[162]+1)+2];}
case 17600:
L_SVERBS[162]+=2;pc=100003;continue L;
case 100004:
C_CEVENT[C_CINDEX[16]]=0;
RSPEAK([668],0);
L_SVERBS[6]=MOVETO(C_RINDEX,59,C_PLAY,0);
L_SVERBS[6]=(yield* RMDESC([3],0));
return L_SVERBS[157];
case 18000:
L_SVERBS[162]=359;
if((C_PRSVEC[2]==C_OINDEX[29])){L_SVERBS[162]=360;}
RSPEAK(L_SVERBS,162);
return L_SVERBS[157];
case 19000:
if((C_PRSVEC[2]==C_OINDEX[113])){pc=19100;continue L;}
RSPEAK([362],0);
return L_SVERBS[157];
case 19100:
if((C_PRSVEC[1]!=0)){pc=19200;continue L;}
RSPEAK([363],0);
return L_SVERBS[157];
case 19200:
if(((C_PRSVEC[1]==C_OINDEX[34])&&(C_OBJCTS[C_OINDEX[34]+2420]==C_PLAY[0]))){pc=19300;continue L;}
RSPSUB([364],0,L_SVERBS,159);
return L_SVERBS[157];
case 19300:
(yield* JIGSUP([365],0));
return L_SVERBS[157];
case 20000:
if((C_PRSVEC[2]==C_OINDEX[56])){return L_SVERBS[157];}
L_SVERBS[162]=392;
if((ZAND(C_OBJCTS,C_PRSVEC[2]+880,C_OFLAGS,13)==0)){L_SVERBS[162]=393;}
RSPSUB(L_SVERBS,162,L_SVERBS,158);
return L_SVERBS[157];
case 21000:
GTTIME(L_SVERBS,166);
L_SVERBS[156]="s.";
if((L_SVERBS[166]==1)){L_SVERBS[156]=". ";}
var W=WSTART("' You have been playing Dungeon for',I5,' minute',A2");W.put(L_SVERBS[166]);W.put(L_SVERBS[156]);W.end();
C_PLAY[2]=1;
return L_SVERBS[157];
case 22000:
if((C_PRSVEC[2]==0)){pc=22200;continue L;}
if(QHERE(C_PRSVEC,2,C_PLAY,1)){pc=22100;continue L;}
RSPEAK([447],0);
return L_SVERBS[157];
case 22100:
if((ZAND(C_OBJCTS,C_PRSVEC[2]+1100,C_OFLAGS,24)==0)){pc=22300;continue L;}
RSPSUB([448],0,L_SVERBS,158);
return L_SVERBS[157];
case 22200:
if((!FINDXT(C_XSRCH,2,C_PLAY,1))){pc=22300;continue L;}
if(((C_CURXT[0]==C_XPARS[10])||((C_CURXT[0]==C_XPARS[11])&&(!C_FINDEX[C_CURXT[4]-1])))){pc=22400;continue L;}
case 22300:
RSPEAK([(314+ZRND([5],0))],0);
return L_SVERBS[157];
case 22400:
(yield* JIGSUP([(449+ZRND([4],0))],0));
return L_SVERBS[157];
case 23000:
if(((C_PRSVEC[2]==C_OINDEX[42])&&(C_PLAY[1]==C_RINDEX[5]))){pc=23200;continue L;}
case 23100:
RSPEAK([464],0);
return L_SVERBS[157];
case 23200:
C_FINDEX[24]=0;
RSPEAK([214],0);
C_EXITS[(C_ROOMS[C_PLAY[1]+201]+1)]=214;
return L_SVERBS[157];
case 24000:
if(((C_PRSVEC[2]!=C_OINDEX[42])||(C_PLAY[1]!=C_RINDEX[5]))){pc=23100;continue L;}
if((C_PRSVEC[1]==C_OINDEX[19])){pc=24200;continue L;}
RSPSUB([465],0,L_SVERBS,159);
return L_SVERBS[157];
case 24200:
C_FINDEX[24]=1;
RSPEAK([217],0);
C_EXITS[(C_ROOMS[C_PLAY[1]+201]+1)]=217;
return L_SVERBS[157];
case 25000:
L_SVERBS[162]=FIGHTS(C_PLAY,0,[0],0);
L_SVERBS[163]=C_ADVS[C_PLAY[0]+20];
L_SVERBS[166]=Math.min((L_SVERBS[162]+L_SVERBS[163]),4);
if((!C_CEVENT[C_CINDEX[0]+50])){L_SVERBS[163]=0;}
L_SVERBS[167]=Math.min(4,Math.abs(L_SVERBS[163]));
RSPEAK([(473+L_SVERBS[167])],0);
L_SVERBS[162]=((Math.imul(30,((-L_SVERBS[163])-1))+C_CEVENT[C_CINDEX[0]]))|0;
if((L_SVERBS[163]!=0)){var W=WSTART("' You will be cured after ',I3,' moves.'");W.put(L_SVERBS[162]);W.end();}
RSPEAK([(478+L_SVERBS[166])],0);
if((C_STATE[1]!=0)){RSPEAK([(482+C_STATE[1])],0);}
return L_SVERBS[157];
case 26000:
L_SVERBS[162]=1;L_SVERBS[168]=6;
case 100005:
if(L_SVERBS[162]>L_SVERBS[168]){pc=100006;continue L;}
L_SVERBS[L_SVERBS[162]+109]=" ";
L_SVERBS[L_SVERBS[162]+115]=" ";
case 26100:
L_SVERBS[162]+=1;pc=100005;continue L;
case 100006:
L_SVERBS[169]=1;
L_SVERBS[170]=1;
if((C_PRSVEC[4]<=1)){pc=26300;continue L;}
L_SVERBS[162]=C_PRSVEC[4];L_SVERBS[171]=C_INPUTL[0];
case 100007:
if(L_SVERBS[162]>L_SVERBS[171]){pc=100008;continue L;}
if((C_INPUT[L_SVERBS[162]-1]==",")){pc=26300;continue L;}
if((C_INPUT[L_SVERBS[162]-1]!=" ")){pc=26150;continue L;}
if((L_SVERBS[170]!=1)){L_SVERBS[169]=(L_SVERBS[169]+1);}
L_SVERBS[170]=1;
pc=26200;continue L;
case 26150:
if((L_SVERBS[169]==1)){L_SVERBS[L_SVERBS[170]+109]=C_INPUT[L_SVERBS[162]-1];}
if((L_SVERBS[169]==2)){L_SVERBS[L_SVERBS[170]+115]=C_INPUT[L_SVERBS[162]-1];}
L_SVERBS[170]=Math.min((L_SVERBS[170]+1),6);
case 26200:
L_SVERBS[162]+=1;pc=100007;continue L;
case 100008:
case 26300:
C_PRSVEC[4]=1;
if((L_SVERBS[1+109]!=" ")){pc=26400;continue L;}
RSPEAK([856],0);
return L_SVERBS[157];
case 26400:
ENCRYP(L_SVERBS,110,L_SVERBS,122);
if((L_SVERBS[1+115]!=" ")){pc=26600;continue L;}
if(C_FINDEX[43]){pc=26550;continue L;}
if((ZAND(C_ROOMS,C_RINDEX[61]+801,C_RFLAG,0)==0)){pc=26575;continue L;}
C_FINDEX[43]=1;
C_PLAY[2]=1;
var W=WSTART("' A hollow voice replies:  \"',6A1,1X,6A1,'\".'");for(var ii=0;ii<6;ii++){W.put(L_SVERBS[110+ii]);}for(var ii=0;ii<6;ii++){W.put(L_SVERBS[122+ii]);}W.end();
return L_SVERBS[157];
case 26550:
RSPEAK([857],0);
return L_SVERBS[157];
case 26575:
RSPEAK([858],0);
return L_SVERBS[157];
case 26600:
if((ZAND(C_ROOMS,C_RINDEX[61]+801,C_RFLAG,0)!=0)){pc=26800;continue L;}
L_SVERBS[162]=1;L_SVERBS[172]=6;
case 100009:
if(L_SVERBS[162]>L_SVERBS[172]){pc=100010;continue L;}
if((L_SVERBS[L_SVERBS[162]+115]!=L_SVERBS[L_SVERBS[162]+121])){pc=26575;continue L;}
case 26700:
L_SVERBS[162]+=1;pc=100009;continue L;
case 100010:
C_FINDEX[43]=1;
RSPEAK([859],0);
C_CEVENT[C_CINDEX[19]]=1;
return L_SVERBS[157];
case 26800:
RSPEAK([855],0);
return L_SVERBS[157];
case 27000:
if((((C_PRSVEC[4]>1)&&(C_PLAY[1]==C_RINDEX[69]))&&C_FINDEX[41])){pc=27100;continue L;}
RSPEAK([799],0);
C_PRSVEC[4]=1;
return L_SVERBS[157];
case 27100:
L_SVERBS[166]=1;
L_SVERBS[163]=1;L_SVERBS[173]=28;
case 100011:
if(L_SVERBS[163]>L_SVERBS[173]){pc=100012;continue L;}
L_SVERBS[174]=(L_SVERBS[166]+L_SVERBS[(L_SVERBS[163]+1)+127]);
if((C_FINDEX[60]!=L_SVERBS[L_SVERBS[163]+127])){pc=27300;continue L;}
L_SVERBS[162]=(C_PRSVEC[4]-1);
L_SVERBS[167]=L_SVERBS[166];L_SVERBS[175]=(L_SVERBS[174]-1);
case 100013:
if(L_SVERBS[167]>L_SVERBS[175]){pc=100014;continue L;}
case 27150:
L_SVERBS[162]=(L_SVERBS[162]+1);
if((L_SVERBS[162]>C_INPUTL[0])){pc=27300;continue L;}
if((C_INPUT[L_SVERBS[162]-1]==" ")){pc=27150;continue L;}
if((C_INPUT[L_SVERBS[162]-1]!=L_SVERBS[L_SVERBS[167]+31])){pc=27300;continue L;}
case 27200:
L_SVERBS[167]+=1;pc=100013;continue L;
case 100014:
pc=27500;continue L;
case 27300:
L_SVERBS[166]=L_SVERBS[174];
L_SVERBS[163]+=2;pc=100011;continue L;
case 100012:
C_PRSVEC[4]=1;
C_FINDEX[61]=(C_FINDEX[61]+1);
if((C_FINDEX[61]>=5)){pc=27400;continue L;}
RSPEAK([(800+C_FINDEX[61])],0);
return L_SVERBS[157];
case 27400:
RSPEAK([826],0);
C_CEVENT[C_CINDEX[22]+50]=0;
return L_SVERBS[157];
case 27500:
C_PRSVEC[4]=1;
C_FINDEX[62]=(C_FINDEX[62]+1);
RSPEAK([800],0);
if((C_FINDEX[62]>=3)){pc=27600;continue L;}
C_CEVENT[C_CINDEX[22]]=2;
C_FINDEX[60]=((C_FINDEX[60]+3)%8);
C_FINDEX[61]=0;
RSPEAK([769],0);
RSPEAK([(770+C_FINDEX[60])],0);
return L_SVERBS[157];
case 27600:
RSPEAK([827],0);
C_CEVENT[C_CINDEX[22]+50]=0;
C_OBJCTS[C_OINDEX[100]+1100]=ZOR(C_OBJCTS,C_OINDEX[100]+1100,C_OFLAGS,28);
return L_SVERBS[157];
return L_SVERBS[157];
}}
/* verbs.f */
function* VAPPLI(RI,RI_){
function SF_VAPPLI_QOPEN(R){return (ZAND(C_OBJCTS,R+1100,C_OFLAGS,28)!=0)}
function SF_VAPPLI_EDIBLE(R){return (ZAND(C_OBJCTS,R+880,C_OFLAGS,5)!=0)}
function SF_VAPPLI_DRKBLE(R){return (ZAND(C_OBJCTS,R+880,C_OFLAGS,7)!=0)}
var pc=0;L:for(;;)switch(pc){case 0:
L_VAPPLI[17]=1;
L_VAPPLI[18]=C_PRSVEC[2];
L_VAPPLI[19]=C_PRSVEC[1];
if((L_VAPPLI[18]<1)){L_VAPPLI[18]=1;}
if((L_VAPPLI[18]>220)){L_VAPPLI[18]=220;}
if((L_VAPPLI[19]<1)){L_VAPPLI[19]=1;}
if((L_VAPPLI[19]>220)){L_VAPPLI[19]=220;}
if((C_PRSVEC[2]!=0)){L_VAPPLI[20]=C_OBJCTS[L_VAPPLI[18]+220];}
if((C_PRSVEC[1]!=0)){L_VAPPLI[21]=C_OBJCTS[L_VAPPLI[19]+220];}
L_VAPPLI[22]=C_ADVS[C_PLAY[0]+8];
L_VAPPLI[23]=(372+ZRND([6],0));
if((RI[RI_]==0)){pc=10;continue L;}
if((RI[RI_]<=L_VAPPLI[24])){return L_VAPPLI[17];}
if((RI[RI_]<=L_VAPPLI[25])){pc=100;continue L;}
pc=[18000,20000,22000,23000,24000,25000,26000,27000,28000,29000,30000,31000,32000,33000,34000,35000,36000,38000,39000,40000,41000,42000,43000,44000,45000,46000,47000,48000,49000,50000,51000,52000,53000,55000,56000,58000,59000,60000,63000,64000,65000,66000,68000,69000,70000,71000,72000,73000,74000,77000,78000,80000,81000,82000,83000,84000,85000,86000,87000,88000][(RI[RI_]-L_VAPPLI[25])-1];if(pc!==undefined)continue L;
BUG([7],0,RI,RI_);
case 10:
L_VAPPLI[17]=0;
return L_VAPPLI[17];
case 100:
L_VAPPLI[17]=(yield* SVERBS(RI,RI_));
return L_VAPPLI[17];
case 18000:
if(LIT(C_PLAY,1)){pc=18100;continue L;}
RSPEAK([356],0);
return L_VAPPLI[17];
case 18100:
if((C_PRSVEC[1]==0)){pc=18200;continue L;}
if((ZAND(C_OBJCTS,C_PRSVEC[1]+880,C_OFLAGS,4)!=0)){pc=18200;continue L;}
RSPSUB([357],0,L_VAPPLI,21);
return L_VAPPLI[17];
case 18200:
if((ZAND(C_OBJCTS,C_PRSVEC[2]+880,C_OFLAGS,1)!=0)){pc=18300;continue L;}
RSPSUB([358],0,L_VAPPLI,20);
return L_VAPPLI[17];
case 18300:
if((!(yield* OBJACT()))){RSPEAK(C_OBJCTS,C_PRSVEC[2]+2860);}
return L_VAPPLI[17];
case 20000:
if((!(yield* OBJACT()))){RSPSUB([361],0,L_VAPPLI,20);}
return L_VAPPLI[17];
case 22000:
if((!(yield* OBJACT()))){RSPEAK([368],0);}
return L_VAPPLI[17];
case 23000:
if((!(yield* OBJACT()))){RSPEAK([369],0);}
return L_VAPPLI[17];
case 24000:
if((ZAND(C_OBJCTS,C_PRSVEC[2]+1100,C_OFLAGS,17)==0)){pc=24100;continue L;}
L_VAPPLI[17]=(yield* OBJACT());
return L_VAPPLI[17];
case 24100:
RSPSUB([370],0,L_VAPPLI,20);
return L_VAPPLI[17];
case 25000:
L_VAPPLI[16]=(yield* OBJACT());
return L_VAPPLI[17];
case 26000:
if((!(yield* OBJACT()))){RSPEAK([371],0);}
return L_VAPPLI[17];
case 27000:
if((!(yield* OBJACT()))){RSPSB2([378],0,L_VAPPLI,20,L_VAPPLI,23);}
return L_VAPPLI[17];
case 28000:
if((!(yield* OBJACT()))){RSPSB2([379],0,L_VAPPLI,20,L_VAPPLI,23);}
return L_VAPPLI[17];
case 29000:
case 30000:
if((!(yield* OBJACT()))){RSPSB2([380],0,L_VAPPLI,20,L_VAPPLI,23);}
return L_VAPPLI[17];
case 31000:
if((!(yield* OBJACT()))){RSPSB2([381],0,L_VAPPLI,20,L_VAPPLI,23);}
return L_VAPPLI[17];
case 32000:
if((!(yield* OBJACT()))){RSPSB2([382],0,L_VAPPLI,20,L_VAPPLI,23);}
return L_VAPPLI[17];
case 33000:
if((yield* OBJACT())){return L_VAPPLI[17];}
L_VAPPLI[26]=383;
if((ZAND(C_OBJCTS,C_PRSVEC[2]+1100,C_OFLAGS,19)==0)){L_VAPPLI[26]=384;}
RSPEAK(L_VAPPLI,26);
return L_VAPPLI[17];
case 34000:
if((ZAND(C_OBJCTS,C_PRSVEC[2]+1100,C_OFLAGS,19)!=0)){pc=34100;continue L;}
RSPEAK([385],0);
return L_VAPPLI[17];
case 34100:
if((!(yield* OBJACT()))){RSPSUB([386],0,L_VAPPLI,20);}
return L_VAPPLI[17];
case 35000:
if((ZAND(C_OBJCTS,C_PRSVEC[1]+1100,C_OFLAGS,19)!=0)){pc=35100;continue L;}
RSPSUB([387],0,L_VAPPLI,20);
return L_VAPPLI[17];
case 35100:
L_VAPPLI[26]=388;
if((ZAND(C_OBJCTS,C_PRSVEC[2]+1100,C_OFLAGS,24)==0)){L_VAPPLI[26]=389;}
RSPSUB(L_VAPPLI,26,L_VAPPLI,20);
return L_VAPPLI[17];
case 36000:
if((ZAND(C_OBJCTS,C_PRSVEC[2]+880,C_OFLAGS,14)!=0)){pc=36100;continue L;}
RSPEAK([390],0);
return L_VAPPLI[17];
case 36100:
if((ZAND(C_OBJCTS,C_PRSVEC[1]+880,C_OFLAGS,13)!=0)){pc=36200;continue L;}
RSPSUB([391],0,L_VAPPLI,21);
return L_VAPPLI[17];
case 36200:
L_VAPPLI[17]=(yield* OBJACT());
return L_VAPPLI[17];
case 38000:
C_PRSVEC[0]=C_VINDEX[10];
C_PRSVEC[1]=C_OINDEX[110];
pc=22000;continue L;
case 39000:
if((yield* OBJACT())){return L_VAPPLI[17];}
L_VAPPLI[26]=394;
if((ZAND(C_OBJCTS,C_PRSVEC[2]+880,C_OFLAGS,3)==0)){L_VAPPLI[26]=395;}
RSPSUB(L_VAPPLI,26,L_VAPPLI,20);
return L_VAPPLI[17];
case 40000:
if((C_PRSVEC[2]!=0)){pc=41500;continue L;}
L_VAPPLI[17]=(yield* RMDESC([3],0));
return L_VAPPLI[17];
case 41000:
if((C_PRSVEC[2]!=0)){pc=41500;continue L;}
L_VAPPLI[17]=(yield* RMDESC([0],0));
return L_VAPPLI[17];
case 41500:
if((yield* OBJACT())){return L_VAPPLI[17];}
L_VAPPLI[26]=C_OBJCTS[C_PRSVEC[2]+2860];
if((L_VAPPLI[26]!=0)){RSPEAK(L_VAPPLI,26);}
if((L_VAPPLI[26]==0)){RSPSUB([429],0,L_VAPPLI,20);}
C_PRSVEC[0]=C_VINDEX[7];
return L_VAPPLI[17];
case 42000:
if((yield* OBJACT())){return L_VAPPLI[17];}
if((ZAND(C_OBJCTS,C_PRSVEC[2]+1100,C_OFLAGS,24)==0)){pc=42100;continue L;}
RSPEAK([371],0);
return L_VAPPLI[17];
case 42100:
if((QEMPTY(C_PRSVEC,2)||(ZAND(C_OBJCTS,C_PRSVEC[2]+880,C_OFLAGS,2)==0))){pc=10;continue L;}
if(SF_VAPPLI_QOPEN(C_PRSVEC[2])){pc=42300;continue L;}
RSPSUB([396],0,L_VAPPLI,20);
return L_VAPPLI[17];
case 42300:
RSPSUB([397],0,L_VAPPLI,20);
L_VAPPLI[26]=1;L_VAPPLI[27]=C_OBJCTS[0];
case 100001:
if(L_VAPPLI[26]>L_VAPPLI[27]){pc=100002;continue L;}
if((C_OBJCTS[L_VAPPLI[26]+2640]!=C_PRSVEC[2])){pc=42500;continue L;}
C_OBJCTS[L_VAPPLI[26]+1100]=ZOR(C_OBJCTS,L_VAPPLI[26]+1100,C_OFLAGS,29);
if((L_VAPPLI[22]==0)){pc=42400;continue L;}
NEWSTA(L_VAPPLI,26,[0],0,[0],0,L_VAPPLI,22,[0],0);
pc=42500;continue L;
case 42400:
NEWSTA(L_VAPPLI,26,[0],0,C_PLAY,1,[0],0,[0],0);
if((L_VAPPLI[26]==C_OINDEX[8])){NEWSTA(L_VAPPLI,26,[133],0,[0],0,[0],0,[0],0);}
case 42500:
L_VAPPLI[26]+=1;pc=100001;continue L;
case 100002:
return L_VAPPLI[17];
case 43000:
if((yield* OBJACT())){return L_VAPPLI[17];}
L_VAPPLI[26]=398;
if(QHERE(C_PRSVEC,2,C_PLAY,1)){L_VAPPLI[26]=399;}
RSPSUB(L_VAPPLI,26,L_VAPPLI,20);
return L_VAPPLI[17];
case 44000:
L_VAPPLI[16]=LIT(C_PLAY,1);
if((yield* OBJACT())){pc=44300;continue L;}
if(((ZAND(C_OBJCTS,C_PRSVEC[2]+880,C_OFLAGS,9)!=0)&&(C_OBJCTS[C_PRSVEC[2]+2420]==C_PLAY[0]))){pc=44100;continue L;}
RSPEAK([400],0);
return L_VAPPLI[17];
case 44100:
if((ZAND(C_OBJCTS,C_PRSVEC[2]+880,C_OFLAGS,15)==0)){pc=44200;continue L;}
RSPEAK([401],0);
return L_VAPPLI[17];
case 44200:
C_OBJCTS[C_PRSVEC[2]+880]=ZOR(C_OBJCTS,C_PRSVEC[2]+880,C_OFLAGS,15);
RSPSUB([404],0,L_VAPPLI,20);
case 44300:
if(((!L_VAPPLI[16])&&LIT(C_PLAY,1))){L_VAPPLI[16]=(yield* RMDESC([0],0));}
return L_VAPPLI[17];
case 45000:
if((yield* OBJACT())){pc=45300;continue L;}
if(((ZAND(C_OBJCTS,C_PRSVEC[2]+880,C_OFLAGS,9)!=0)&&(C_OBJCTS[C_PRSVEC[2]+2420]==C_PLAY[0]))){pc=45100;continue L;}
RSPEAK([402],0);
return L_VAPPLI[17];
case 45100:
if((ZAND(C_OBJCTS,C_PRSVEC[2]+880,C_OFLAGS,15)!=0)){pc=45200;continue L;}
RSPEAK([403],0);
return L_VAPPLI[17];
case 45200:
C_OBJCTS[C_PRSVEC[2]+880]=ZAND(C_OBJCTS,C_PRSVEC[2]+880,[ZNOT(C_OFLAGS,15)],0);
RSPSUB([405],0,L_VAPPLI,20);
case 45300:
if((!LIT(C_PLAY,1))){RSPEAK([406],0);}
return L_VAPPLI[17];
case 46000:
if((yield* OBJACT())){return L_VAPPLI[17];}
if((ZAND(C_OBJCTS,C_PRSVEC[2]+880,C_OFLAGS,8)!=0)){pc=46100;continue L;}
case 46050:
RSPSUB([407],0,L_VAPPLI,20);
return L_VAPPLI[17];
case 46100:
if((C_OBJCTS[C_PRSVEC[2]+1980]!=0)){pc=46200;continue L;}
RSPSUB([408],0,L_VAPPLI,20);
return L_VAPPLI[17];
case 46200:
if((!SF_VAPPLI_QOPEN(C_PRSVEC[2]))){pc=46225;continue L;}
RSPEAK([412],0);
return L_VAPPLI[17];
case 46225:
C_OBJCTS[C_PRSVEC[2]+1100]=ZOR(C_OBJCTS,C_PRSVEC[2]+1100,C_OFLAGS,28);
if(((ZAND(C_OBJCTS,C_PRSVEC[2]+880,C_OFLAGS,4)!=0)||QEMPTY(C_PRSVEC,2))){pc=46300;continue L;}
PRINCO(C_PRSVEC,2,[410],0);
return L_VAPPLI[17];
case 46300:
RSPEAK([409],0);
return L_VAPPLI[17];
case 47000:
if((yield* OBJACT())){return L_VAPPLI[17];}
if((ZAND(C_OBJCTS,C_PRSVEC[2]+880,C_OFLAGS,8)==0)){pc=46050;continue L;}
if((C_OBJCTS[C_PRSVEC[2]+1980]!=0)){pc=47100;continue L;}
RSPSUB([411],0,L_VAPPLI,20);
return L_VAPPLI[17];
case 47100:
if(SF_VAPPLI_QOPEN(C_PRSVEC[2])){pc=47200;continue L;}
RSPEAK([413],0);
return L_VAPPLI[17];
case 47200:
C_OBJCTS[C_PRSVEC[2]+1100]=ZAND(C_OBJCTS,C_PRSVEC[2]+1100,[ZNOT(C_OFLAGS,28)],0);
RSPEAK([414],0);
return L_VAPPLI[17];
case 48000:
if((yield* OBJACT())){return L_VAPPLI[17];}
L_VAPPLI[26]=415;
if(QHERE(C_PRSVEC,2,C_PLAY,1)){pc=48300;continue L;}
if((C_OBJCTS[C_PRSVEC[2]+2420]==C_PLAY[0])){pc=48200;continue L;}
L_VAPPLI[28]=C_OBJCTS[C_PRSVEC[2]+2640];
if((L_VAPPLI[28]==0)){pc=10;continue L;}
if(((ZAND(C_OBJCTS,L_VAPPLI[28]+880,C_OFLAGS,4)==0)&&((!SF_VAPPLI_QOPEN(L_VAPPLI[28]))||(ZAND(C_OBJCTS,L_VAPPLI[28]+880,[(C_OFLAGS[3]+C_OFLAGS[8])],0)==0)))){pc=10;continue L;}
L_VAPPLI[26]=417;
if(QHERE(L_VAPPLI,28,C_PLAY,1)){pc=48100;continue L;}
if((C_OBJCTS[L_VAPPLI[28]+2420]!=C_PLAY[0])){pc=10;continue L;}
L_VAPPLI[26]=418;
case 48100:
RSPSUB(L_VAPPLI,26,C_OBJCTS,L_VAPPLI[28]+220);
return L_VAPPLI[17];
case 48200:
L_VAPPLI[26]=416;
case 48300:
RSPSUB(L_VAPPLI,26,L_VAPPLI,20);
return L_VAPPLI[17];
case 49000:
RSPEAK([419],0);
L_VAPPLI[26]=1;L_VAPPLI[29]=3;
case 100003:
if(L_VAPPLI[26]>L_VAPPLI[29]){pc=100004;continue L;}
if((yield* CLOCKD(L_VAPPLI,30))){return L_VAPPLI[17];}
case 49100:
L_VAPPLI[26]+=1;pc=100003;continue L;
case 100004:
return L_VAPPLI[17];
case 50000:
case 88000:
if((!(yield* OBJACT()))){RSPEAK([663],0);}
return L_VAPPLI[17];
case 51000:
if((ZAND(C_OBJCTS,C_PRSVEC[2]+1100,C_OFLAGS,30)!=0)){pc=51100;continue L;}
RSPSUB([421],0,L_VAPPLI,20);
return L_VAPPLI[17];
case 51100:
if(QHERE(C_PRSVEC,2,C_PLAY,1)){pc=51200;continue L;}
RSPSUB([420],0,L_VAPPLI,20);
return L_VAPPLI[17];
case 51200:
if((L_VAPPLI[22]==0)){pc=51300;continue L;}
RSPSUB([422],0,L_VAPPLI,20);
return L_VAPPLI[17];
case 51300:
if((yield* OBJACT())){return L_VAPPLI[17];}
RSPSUB([423],0,L_VAPPLI,20);
C_ADVS[C_PLAY[0]+8]=C_PRSVEC[2];
if((C_PLAY[0]!=C_AINDEX[0])){C_OBJCTS[C_ADVS[C_PLAY[0]+12]+2640]=C_PRSVEC[2];}
return L_VAPPLI[17];
case 52000:
if((L_VAPPLI[22]==C_PRSVEC[2])){pc=52100;continue L;}
RSPEAK([424],0);
return L_VAPPLI[17];
case 52100:
if((yield* OBJACT())){return L_VAPPLI[17];}
if((ZAND(C_ROOMS,C_PLAY[1]+801,C_RFLAG,2)!=0)){pc=52200;continue L;}
RSPEAK([425],0);
return L_VAPPLI[17];
case 52200:
C_ADVS[C_PLAY[0]+8]=0;
RSPEAK([426],0);
if((C_PLAY[0]!=C_AINDEX[0])){NEWSTA(C_ADVS,C_PLAY[0]+12,[0],0,C_PLAY,1,[0],0,[0],0);}
return L_VAPPLI[17];
case 53000:
L_VAPPLI[17]=(yield* TAKE([1],0));
return L_VAPPLI[17];
case 55000:
INVENT(C_PLAY,0);
return L_VAPPLI[17];
case 56000:
if((C_PRSVEC[1]!=0)){pc=56050;continue L;}
if((ZAND(C_ROOMS,C_PLAY[1]+801,[(C_RFLAG[3]+C_RFLAG[6])],0)!=0)){pc=56025;continue L;}
RSPEAK([516],0);
C_PRSVEC[3]=0;
return L_VAPPLI[17];
case 56025:
C_PRSVEC[1]=C_OINDEX[119];
case 56050:
if((yield* OBJACT())){return L_VAPPLI[17];}
if(((C_PRSVEC[1]!=C_OINDEX[119])&&(C_PRSVEC[1]!=C_OINDEX[8]))){RSPSB2([444],0,L_VAPPLI,21,L_VAPPLI,20);}
return L_VAPPLI[17];
case 58000:
case 59000:
if((yield* OBJACT())){return L_VAPPLI[17];}
if((C_PRSVEC[2]==C_OINDEX[119])){pc=59500;continue L;}
if((!SF_VAPPLI_EDIBLE(C_PRSVEC[2]))){pc=59400;continue L;}
if((C_OBJCTS[C_PRSVEC[2]+2420]==C_PLAY[0])){pc=59200;continue L;}
case 59100:
RSPSUB([454],0,L_VAPPLI,20);
return L_VAPPLI[17];
case 59200:
if((C_PRSVEC[0]==C_VINDEX[44])){pc=59300;continue L;}
NEWSTA(C_PRSVEC,2,[455],0,[0],0,[0],0,[0],0);
return L_VAPPLI[17];
case 59300:
RSPEAK([456],0);
return L_VAPPLI[17];
case 59400:
if((!SF_VAPPLI_DRKBLE(C_PRSVEC[2]))){pc=59600;continue L;}
if((C_OBJCTS[C_PRSVEC[2]+2640]==0)){pc=59100;continue L;}
if((C_OBJCTS[C_OBJCTS[C_PRSVEC[2]+2640]+2420]!=C_PLAY[0])){pc=59100;continue L;}
if(SF_VAPPLI_QOPEN(C_OBJCTS[C_PRSVEC[2]+2640])){pc=59500;continue L;}
RSPEAK([457],0);
return L_VAPPLI[17];
case 59500:
NEWSTA(C_PRSVEC,2,[458],0,[0],0,[0],0,[0],0);
return L_VAPPLI[17];
case 59600:
RSPSUB([453],0,L_VAPPLI,20);
return L_VAPPLI[17];
case 60000:
if((ZAND(C_OBJCTS,C_PRSVEC[1]+880,[((C_OFLAGS[12]+C_OFLAGS[9])+C_OFLAGS[15])],0)!=((C_OFLAGS[12]+C_OFLAGS[9])+C_OFLAGS[15]))){pc=60400;continue L;}
if((yield* OBJACT())){return L_VAPPLI[17];}
if((C_OBJCTS[C_PRSVEC[2]+2640]!=C_OINDEX[58])){pc=60050;continue L;}
if((yield* OAPPLI(C_OBJCTS,C_OINDEX[57]+660,[0],0))){return L_VAPPLI[17];}
case 60050:
if((ZAND(C_OBJCTS,C_PRSVEC[2]+880,C_OFLAGS,11)==0)){pc=60300;continue L;}
if((C_OBJCTS[C_PRSVEC[2]+2420]!=C_PLAY[0])){pc=60100;continue L;}
RSPSUB([459],0,L_VAPPLI,20);
(yield* JIGSUP([460],0));
return L_VAPPLI[17];
case 60100:
L_VAPPLI[28]=C_OBJCTS[C_PRSVEC[2]+2640];
if((QHERE(C_PRSVEC,2,C_PLAY,1)||((L_VAPPLI[22]!=0)&&(L_VAPPLI[28]==L_VAPPLI[22])))){pc=60200;continue L;}
if((L_VAPPLI[28]==0)){pc=60150;continue L;}
if((!SF_VAPPLI_QOPEN(L_VAPPLI[28]))){pc=60150;continue L;}
if((QHERE(L_VAPPLI,28,C_PLAY,1)||((L_VAPPLI[22]!=0)&&(C_OBJCTS[L_VAPPLI[28]+2640]==L_VAPPLI[22])))){pc=60200;continue L;}
case 60150:
RSPEAK([461],0);
return L_VAPPLI[17];
case 60200:
RSPSUB([462],0,L_VAPPLI,20);
NEWSTA(C_PRSVEC,2,[0],0,[0],0,[0],0,[0],0);
return L_VAPPLI[17];
case 60300:
RSPSUB([463],0,L_VAPPLI,20);
return L_VAPPLI[17];
case 60400:
RSPSUB([301],0,L_VAPPLI,21);
return L_VAPPLI[17];
case 63000:
L_VAPPLI[26]=466;
if((ZAND(C_OBJCTS,C_PRSVEC[2]+1100,C_OFLAGS,24)!=0)){pc=66100;continue L;}
if((!(yield* OBJACT()))){RSPSB2([466],0,L_VAPPLI,20,L_VAPPLI,23);}
return L_VAPPLI[17];
case 64000:
L_VAPPLI[26]=467;
pc=66100;continue L;
case 65000:
L_VAPPLI[28]=C_PRSVEC[2];
C_PRSVEC[2]=C_PRSVEC[1];
C_PRSVEC[1]=L_VAPPLI[28];
L_VAPPLI[28]=L_VAPPLI[20];
L_VAPPLI[20]=L_VAPPLI[21];
L_VAPPLI[21]=L_VAPPLI[28];
C_PRSVEC[0]=C_VINDEX[48];
case 66000:
L_VAPPLI[26]=468;
case 66100:
if((C_PRSVEC[2]!=0)){pc=66200;continue L;}
RSPEAK([469],0);
return L_VAPPLI[17];
case 66200:
if((yield* OBJACT())){return L_VAPPLI[17];}
if((ZAND(C_OBJCTS,C_PRSVEC[2]+1100,C_OFLAGS,24)!=0)){pc=66300;continue L;}
if((ZAND(C_OBJCTS,C_PRSVEC[2]+880,C_OFLAGS,10)==0)){RSPSUB([470],0,L_VAPPLI,20);}
return L_VAPPLI[17];
case 66300:
L_VAPPLI[28]=471;
if((C_PRSVEC[1]==0)){pc=66500;continue L;}
if((ZAND(C_OBJCTS,C_PRSVEC[1]+1100,C_OFLAGS,22)==0)){pc=66400;continue L;}
L_VAPPLI[31]=1;
if((C_PRSVEC[1]!=C_OINDEX[11])){L_VAPPLI[31]=2;}
L_VAPPLI[26]=(yield* BLOW(C_AINDEX,0,C_PRSVEC,2,L_VAPPLI,31,[1],0,[0],0));
return L_VAPPLI[17];
case 66400:
L_VAPPLI[28]=472;
case 66500:
RSPSB2(L_VAPPLI,26,L_VAPPLI,20,L_VAPPLI,28);
return L_VAPPLI[17];
case 68000:
L_VAPPLI[17]=(yield* WALK());
return L_VAPPLI[17];
case 69000:
RSPEAK([603],0);
return L_VAPPLI[17];
case 70000:
L_VAPPLI[17]=(yield* PUT());
return L_VAPPLI[17];
case 71000:
case 72000:
case 73000:
case 74000:
L_VAPPLI[17]=(yield* DROP());
return L_VAPPLI[17];
case 77000:
if((ZAND(C_ROOMS,C_RINDEX[61]+801,C_RFLAG,0)==0)){pc=77100;continue L;}
RSPEAK([828],0);
return L_VAPPLI[17];
case 77100:
SAVEGM();
return L_VAPPLI[17];
case 78000:
if((ZAND(C_ROOMS,C_RINDEX[61]+801,C_RFLAG,0)==0)){pc=78100;continue L;}
RSPEAK([829],0);
return L_VAPPLI[17];
case 78100:
RSTRGM();
return L_VAPPLI[17];
case 80000:
if((C_PRSVEC[2]!=0)){pc=80100;continue L;}
RSPEAK([(346+ZRND([4],0))],0);
return L_VAPPLI[17];
case 80100:
if((C_PRSVEC[2]!=C_OINDEX[112])){pc=80200;continue L;}
RSPEAK([350],0);
return L_VAPPLI[17];
case 80200:
if((C_PRSVEC[2]!=C_OINDEX[111])){pc=80300;continue L;}
C_STATE[8]=(C_STATE[8]+1);
L_VAPPLI[26]=351;
if(((C_STATE[8]%10)==0)){L_VAPPLI[26]=352;}
if(((C_STATE[8]%20)==0)){L_VAPPLI[26]=353;}
RSPEAK(L_VAPPLI,26);
return L_VAPPLI[17];
case 80300:
if((yield* OBJACT())){return L_VAPPLI[17];}
L_VAPPLI[26]=354;
if((ZAND(C_OBJCTS,C_PRSVEC[2]+1100,[(C_OFLAGS[24]+C_OFLAGS[21])],0)==0)){L_VAPPLI[26]=355;}
RSPSUB(L_VAPPLI,26,L_VAPPLI,20);
return L_VAPPLI[17];
case 81000:
if((yield* OBJACT())){return L_VAPPLI[17];}
if((ZAND(C_OBJCTS,C_PRSVEC[2]+880,C_OFLAGS,3)==0)){pc=81300;continue L;}
if((!SF_VAPPLI_QOPEN(C_PRSVEC[2]))){pc=81200;continue L;}
RSPSUB([628],0,L_VAPPLI,20);
return L_VAPPLI[17];
case 81200:
RSPSUB([525],0,L_VAPPLI,20);
return L_VAPPLI[17];
case 81300:
if((ZAND(C_OBJCTS,C_PRSVEC[2]+1100,C_OFLAGS,30)!=0)){pc=81400;continue L;}
if((SF_VAPPLI_QOPEN(C_PRSVEC[2])||(ZAND(C_OBJCTS,C_PRSVEC[2]+880,C_OFLAGS,4)!=0))){pc=81400;continue L;}
if((ZAND(C_OBJCTS,C_PRSVEC[2]+880,C_OFLAGS,8)!=0)){pc=81200;continue L;}
RSPSUB([630],0,L_VAPPLI,20);
return L_VAPPLI[17];
case 81400:
if(QEMPTY(C_PRSVEC,2)){pc=81500;continue L;}
PRINCO(C_PRSVEC,2,[573],0);
return L_VAPPLI[17];
case 81500:
RSPSUB([629],0,L_VAPPLI,20);
return L_VAPPLI[17];
case 82000:
if((!(yield* OBJACT()))){RSPEAK([631],0);}
return L_VAPPLI[17];
case 83000:
if(((C_OBJCTS[C_OINDEX[52]+2200]==C_PLAY[1])||(C_OBJCTS[C_OINDEX[52]+2420]==C_PLAY[0]))){pc=83100;continue L;}
RSPEAK([632],0);
return L_VAPPLI[17];
case 83100:
C_PRSVEC[1]=C_OINDEX[52];
C_PRSVEC[0]=C_VINDEX[10];
pc=22000;continue L;
case 84000:
if((!(yield* OBJACT()))){RSPSUB([634],0,L_VAPPLI,20);}
return L_VAPPLI[17];
case 85000:
case 86000:
case 87000:
L_VAPPLI[26]=C_XSRCH[3];
if((C_PRSVEC[0]==C_VINDEX[68])){L_VAPPLI[26]=C_XSRCH[2];}
L_VAPPLI[16]=((ZAND(C_OBJCTS,C_PRSVEC[2]+1100,C_OFLAGS,20)!=0))?1:0;
if((L_VAPPLI[16]&&FINDXT(L_VAPPLI,26,C_PLAY,1))){pc=87500;continue L;}
if((yield* OBJACT())){return L_VAPPLI[17];}
L_VAPPLI[26]=657;
if(L_VAPPLI[16]){L_VAPPLI[26]=524;}
if(((!L_VAPPLI[16])&&((C_PRSVEC[2]==C_OINDEX[109])||((C_PRSVEC[2]>=C_OINDEX[118])&&(C_PRSVEC[2]<=(C_OINDEX[118]+3)))))){L_VAPPLI[26]=656;}
RSPEAK(L_VAPPLI,26);
return L_VAPPLI[17];
case 87500:
C_PRSVEC[0]=C_VINDEX[50];
C_PRSVEC[2]=L_VAPPLI[26];
L_VAPPLI[17]=(yield* WALK());
return L_VAPPLI[17];
return L_VAPPLI[17];
}}
/* verbs.f */
function* CLOCKD(X,X_){
var pc=0;L:for(;;)switch(pc){case 0:
L_CLOCKD[1]=X[X_];
L_CLOCKD[0]=0;
L_CLOCKD[1]=1;L_CLOCKD[2]=C_CEVENT[0];
case 100001:
if(L_CLOCKD[1]>L_CLOCKD[2]){pc=100002;continue L;}
if(((!C_CEVENT[L_CLOCKD[1]+50])||(C_CEVENT[L_CLOCKD[1]]==0))){pc=100;continue L;}
if((C_CEVENT[L_CLOCKD[1]]<0)){pc=50;continue L;}
C_CEVENT[L_CLOCKD[1]]=(C_CEVENT[L_CLOCKD[1]]-1);
if((C_CEVENT[L_CLOCKD[1]]!=0)){pc=100;continue L;}
case 50:
L_CLOCKD[0]=1;
(yield* CEVAPP(C_CEVENT,L_CLOCKD[1]+25));
case 100:
L_CLOCKD[1]+=1;pc=100001;continue L;
case 100002:
return L_CLOCKD[0];
return L_CLOCKD[0];
}}
/* villns.f */
function TROLLP(ARG,ARG_){
var pc=0;L:for(;;)switch(pc){case 0:
L_TROLLP[3]=ARG[ARG_];
L_TROLLP[2]=1;
if((C_PRSVEC[0]!=C_VINDEX[6])){pc=1100;continue L;}
if((C_OBJCTS[C_OINDEX[17]+2640]==C_OINDEX[16])){pc=10;continue L;}
L_TROLLP[3]=433;
if((!QHERE(C_OINDEX,17,C_PLAY,1))){pc=1050;continue L;}
L_TROLLP[3]=434;
NEWSTA(C_OINDEX,17,[0],0,[0],0,C_OINDEX,16,[0],0);
case 1050:
if(QHERE(C_OINDEX,16,C_PLAY,1)){RSPEAK(L_TROLLP,3);}
return L_TROLLP[2];
case 1100:
if((C_PRSVEC[0]!=C_VINDEX[1])){pc=1200;continue L;}
C_FINDEX[0]=1;
return L_TROLLP[2];
case 1200:
if((C_PRSVEC[0]!=C_VINDEX[4])){pc=1300;continue L;}
C_FINDEX[0]=1;
C_OBJCTS[C_OINDEX[17]+880]=ZAND(C_OBJCTS,C_OINDEX[17]+880,[ZNOT(C_OFLAGS,0)],0);
C_OBJCTS[C_OINDEX[16]]=435;
return L_TROLLP[2];
case 1300:
if((C_PRSVEC[0]!=C_VINDEX[3])){pc=1400;continue L;}
C_FINDEX[0]=0;
C_OBJCTS[C_OINDEX[17]+880]=ZOR(C_OBJCTS,C_OINDEX[17]+880,C_OFLAGS,0);
C_OBJCTS[C_OINDEX[16]]=436;
if(QHERE(C_OINDEX,16,C_PLAY,1)){RSPEAK([437],0);}
return L_TROLLP[2];
case 1400:
if((C_PRSVEC[0]!=C_VINDEX[2])){pc=1500;continue L;}
L_TROLLP[2]=PROB([33],0,[66],0);
return L_TROLLP[2];
case 1500:
if((((((C_PRSVEC[0]!=C_VINDEX[30])&&(C_PRSVEC[0]!=C_VINDEX[40]))&&(C_PRSVEC[0]!=C_VINDEX[46]))&&(C_PRSVEC[0]!=C_VINDEX[56]))&&(C_PRSVEC[0]!=C_VINDEX[54]))){pc=2000;continue L;}
if((C_OBJCTS[C_OINDEX[16]+1980]>=0)){pc=1550;continue L;}
C_OBJCTS[C_OINDEX[16]+1980]=(-C_OBJCTS[C_OINDEX[16]+1980]);
C_OBJCTS[C_OINDEX[17]+880]=ZOR(C_OBJCTS,C_OINDEX[17]+880,C_OFLAGS,0);
C_FINDEX[0]=0;
C_OBJCTS[C_OINDEX[16]]=436;
RSPEAK([437],0);
case 1550:
if(((C_PRSVEC[0]!=C_VINDEX[40])&&(C_PRSVEC[0]!=C_VINDEX[30]))){pc=1600;continue L;}
RSPEAK([438],0);
return L_TROLLP[2];
case 1600:
if((C_PRSVEC[0]!=C_VINDEX[46])){pc=1700;continue L;}
RSPEAK([439],0);
return L_TROLLP[2];
case 1700:
if((C_PRSVEC[2]==0)){pc=10;continue L;}
L_TROLLP[3]=440;
if((C_PRSVEC[0]==C_VINDEX[54])){L_TROLLP[3]=441;}
RSPSUB(L_TROLLP,3,C_OBJCTS,C_PRSVEC[2]+220);
if((C_PRSVEC[2]==C_OINDEX[10])){pc=1900;continue L;}
NEWSTA(C_PRSVEC,2,[442],0,[0],0,[0],0,[0],0);
return L_TROLLP[2];
case 1900:
RSPEAK([443],0);
C_OBJCTS[C_OINDEX[16]+1100]=ZOR(C_OBJCTS,C_OINDEX[16]+1100,C_OFLAGS,23);
return L_TROLLP[2];
case 2000:
if(((!C_FINDEX[0])||(C_PRSVEC[0]!=C_VINDEX[61]))){pc=10;continue L;}
RSPEAK([366],0);
return L_TROLLP[2];
case 10:
L_TROLLP[2]=0;
return L_TROLLP[2];
return L_TROLLP[2];
}}
/* villns.f */
function* CYCLOP(ARG,ARG_){
var pc=0;L:for(;;)switch(pc){case 0:
L_CYCLOP[1]=ARG[ARG_];
L_CYCLOP[0]=1;
if((!C_FINDEX[11])){pc=100;continue L;}
if(((((((C_PRSVEC[0]!=C_VINDEX[12])&&(C_PRSVEC[0]!=C_VINDEX[46]))&&(C_PRSVEC[0]!=C_VINDEX[61]))&&(C_PRSVEC[0]!=C_VINDEX[45]))&&(C_PRSVEC[0]!=C_VINDEX[47]))&&(C_PRSVEC[0]!=C_VINDEX[48]))){pc=10;continue L;}
C_FINDEX[11]=0;
RSPEAK([187],0);
C_FINDEX[50]=Math.abs(C_FINDEX[50]);
C_OBJCTS[C_OINDEX[37]+1100]=ZAND([ZOR(C_OBJCTS,C_OINDEX[37]+1100,C_OFLAGS,23)],0,[ZNOT(C_OFLAGS,17)],0);
return L_CYCLOP[0];
case 100:
if(((C_PRSVEC[0]==C_VINDEX[6])||(C_PRSVEC[0]==C_VINDEX[2]))){pc=10;continue L;}
if((Math.abs(C_FINDEX[50])<=5)){pc=200;continue L;}
C_FINDEX[50]=0;
(yield* JIGSUP([188],0));
return L_CYCLOP[0];
case 200:
if((C_PRSVEC[0]!=C_VINDEX[54])){pc=500;continue L;}
if(((C_PRSVEC[2]!=C_OINDEX[1])||(C_FINDEX[50]<0))){pc=300;continue L;}
NEWSTA(C_OINDEX,1,[189],0,[0],0,[0],0,[0],0);
C_FINDEX[50]=Math.min((-1),(-C_FINDEX[50]));
return L_CYCLOP[0];
case 300:
if((C_PRSVEC[2]!=C_OINDEX[8])){pc=400;continue L;}
if((C_FINDEX[50]>=0)){pc=350;continue L;}
NEWSTA(C_PRSVEC,2,[190],0,[0],0,[0],0,[0],0);
C_FINDEX[11]=1;
C_OBJCTS[C_OINDEX[37]+1100]=ZAND([ZOR(C_OBJCTS,C_OINDEX[37]+1100,C_OFLAGS,17)],0,[ZNOT(C_OFLAGS,23)],0);
return L_CYCLOP[0];
case 350:
RSPEAK([191],0);
case 10:
L_CYCLOP[0]=0;
return L_CYCLOP[0];
case 400:
L_CYCLOP[1]=192;
if((C_PRSVEC[2]==C_OINDEX[0])){L_CYCLOP[1]=193;}
case 450:
RSPEAK(L_CYCLOP,1);
if((C_FINDEX[50]<0)){C_FINDEX[50]=(C_FINDEX[50]-1);}
if((C_FINDEX[50]>=0)){C_FINDEX[50]=(C_FINDEX[50]+1);}
if((!C_FINDEX[11])){RSPEAK([(193+Math.abs(C_FINDEX[50]))],0);}
return L_CYCLOP[0];
case 500:
L_CYCLOP[1]=0;
if((C_PRSVEC[0]==C_VINDEX[61])){pc=450;continue L;}
if(((C_PRSVEC[0]==C_VINDEX[56])||(C_PRSVEC[0]==C_VINDEX[46]))){L_CYCLOP[1]=(200+ZRND([2],0));}
if((C_PRSVEC[0]==C_VINDEX[40])){L_CYCLOP[1]=202;}
if((C_PRSVEC[0]==C_VINDEX[22])){L_CYCLOP[1]=203;}
if(L_CYCLOP[1]<0){pc=10;continue L;}if(L_CYCLOP[1]==0){pc=10;continue L;}pc=450;continue L;
return L_CYCLOP[0];
}}
/* villns.f */
function THIEFP(ARG,ARG_){
var pc=0;L:for(;;)switch(pc){case 0:
L_THIEFP[3]=ARG[ARG_];
L_THIEFP[2]=1;
if((C_PRSVEC[0]!=C_VINDEX[6])){pc=100;continue L;}
if((C_OBJCTS[C_OINDEX[40]+2640]==C_OINDEX[39])){pc=10;continue L;}
if(QHERE(C_OINDEX,40,C_HACK,0)){pc=50;continue L;}
NEWSTA(C_OINDEX,39,[0],0,[0],0,[0],0,[0],0);
if(QHERE(C_OINDEX,39,C_PLAY,1)){RSPEAK([498],0);}
return L_THIEFP[2];
case 50:
NEWSTA(C_OINDEX,40,[0],0,[0],0,C_OINDEX,39,[0],0);
if(QHERE(C_OINDEX,39,C_PLAY,1)){RSPEAK([499],0);}
return L_THIEFP[2];
case 100:
if((C_PRSVEC[0]!=C_VINDEX[1])){pc=200;continue L;}
C_HACK[2]=0;
C_OBJCTS[C_OINDEX[38]+880]=ZOR(C_OBJCTS,C_OINDEX[38]+880,C_OFLAGS,2);
L_THIEFP[4]=0;
L_THIEFP[3]=1;L_THIEFP[5]=C_OBJCTS[0];
case 100001:
if(L_THIEFP[3]>L_THIEFP[5]){pc=100002;continue L;}
case 125:
if((C_OBJCTS[L_THIEFP[3]+2420]==(-C_OINDEX[39]))){L_THIEFP[4]=500;}
L_THIEFP[3]+=1;pc=100001;continue L;
case 100002:
RSPEAK(L_THIEFP,4);
L_THIEFP[4]=501;
L_THIEFP[3]=1;L_THIEFP[6]=C_OBJCTS[0];
case 100003:
if(L_THIEFP[3]>L_THIEFP[6]){pc=100004;continue L;}
if(((((L_THIEFP[3]==C_OINDEX[38])||(L_THIEFP[3]==C_OINDEX[39]))||(C_PLAY[1]!=C_RINDEX[26]))||(!QHERE(L_THIEFP,3,C_PLAY,1)))){pc=135;continue L;}
C_OBJCTS[L_THIEFP[3]+880]=ZOR(C_OBJCTS,L_THIEFP[3]+880,C_OFLAGS,0);
RSPSUB(L_THIEFP,4,C_OBJCTS,L_THIEFP[3]+220);
L_THIEFP[4]=502;
pc=150;continue L;
case 135:
if((C_OBJCTS[L_THIEFP[3]+2420]==(-C_OINDEX[39]))){NEWSTA(L_THIEFP,3,[0],0,C_PLAY,1,[0],0,[0],0);}
case 150:
L_THIEFP[3]+=1;pc=100003;continue L;
case 100004:
return L_THIEFP[2];
case 200:
if((C_PRSVEC[0]!=C_VINDEX[2])){pc=250;continue L;}
L_THIEFP[2]=PROB([20],0,[75],0);
return L_THIEFP[2];
case 250:
if(((C_PRSVEC[0]!=C_VINDEX[61])||(C_OBJCTS[C_OINDEX[39]]!=504))){pc=300;continue L;}
RSPEAK([626],0);
return L_THIEFP[2];
case 300:
if((C_PRSVEC[0]!=C_VINDEX[4])){pc=400;continue L;}
C_HACK[2]=0;
C_OBJCTS[C_OINDEX[39]]=504;
C_OBJCTS[C_OINDEX[40]+880]=ZAND(C_OBJCTS,C_OINDEX[40]+880,[ZNOT(C_OFLAGS,0)],0);
C_OBJCTS[C_OINDEX[38]+880]=ZOR(C_OBJCTS,C_OINDEX[38]+880,C_OFLAGS,2);
return L_THIEFP[2];
case 400:
if((C_PRSVEC[0]!=C_VINDEX[3])){pc=500;continue L;}
if(QHERE(C_OINDEX,39,C_PLAY,1)){RSPEAK([505],0);}
C_HACK[2]=1;
C_OBJCTS[C_OINDEX[39]]=503;
C_OBJCTS[C_OINDEX[40]+880]=ZOR(C_OBJCTS,C_OINDEX[40]+880,C_OFLAGS,0);
if(((C_PLAY[1]==C_RINDEX[26])&&QHERE(C_OINDEX,38,C_PLAY,1))){C_OBJCTS[C_OINDEX[38]+880]=ZAND(C_OBJCTS,C_OINDEX[38]+880,[ZNOT(C_OFLAGS,2)],0);}
return L_THIEFP[2];
case 500:
if((C_PRSVEC[0]!=C_VINDEX[40])){pc=600;continue L;}
RSPEAK([506],0);
return L_THIEFP[2];
case 600:
if((((C_PRSVEC[0]!=C_VINDEX[56])||(C_PRSVEC[2]!=C_OINDEX[10]))||(ZAND(C_OBJCTS,C_OINDEX[39]+1100,C_OFLAGS,23)!=0))){pc=700;continue L;}
if(PROB([10],0,[90],0)){pc=650;continue L;}
RSPEAK([507],0);
C_OBJCTS[C_OINDEX[39]+1100]=ZOR(C_OBJCTS,C_OINDEX[39]+1100,C_OFLAGS,23);
return L_THIEFP[2];
case 650:
L_THIEFP[4]=508;
L_THIEFP[3]=1;L_THIEFP[7]=C_OBJCTS[0];
case 100005:
if(L_THIEFP[3]>L_THIEFP[7]){pc=100006;continue L;}
if((C_OBJCTS[L_THIEFP[3]+2420]!=(-C_OINDEX[39]))){pc=675;continue L;}
L_THIEFP[4]=509;
NEWSTA(L_THIEFP,3,[0],0,C_PLAY,1,[0],0,[0],0);
case 675:
L_THIEFP[3]+=1;pc=100005;continue L;
case 100006:
NEWSTA(C_OINDEX,39,L_THIEFP,4,[0],0,[0],0,[0],0);
return L_THIEFP[2];
case 700:
if(((((C_PRSVEC[0]!=C_VINDEX[56])&&(C_PRSVEC[0]!=C_VINDEX[54]))||(C_PRSVEC[2]==0))||(C_PRSVEC[2]==C_OINDEX[39]))){pc=10;continue L;}
if((C_OBJCTS[C_OINDEX[39]+1980]>=0)){pc=750;continue L;}
C_OBJCTS[C_OINDEX[39]+1980]=(-C_OBJCTS[C_OINDEX[39]+1980]);
C_HACK[2]=1;
C_OBJCTS[C_OINDEX[40]+880]=ZOR(C_OBJCTS,C_OINDEX[40]+880,C_OFLAGS,0);
C_OBJCTS[C_OINDEX[39]]=503;
RSPEAK([510],0);
case 750:
if((((C_PRSVEC[2]!=C_OINDEX[65])||(C_OBJCTS[C_OINDEX[66]+2640]!=C_OINDEX[65]))||(C_CEVENT[C_CINDEX[7]]==0))){pc=800;continue L;}
RSPEAK([511],0);
return L_THIEFP[2];
case 800:
NEWSTA(C_PRSVEC,2,[0],0,[0],0,[0],0,[(-C_OINDEX[39])],0);
if((C_OBJCTS[C_PRSVEC[2]+1540]>0)){pc=900;continue L;}
RSPSUB([512],0,C_OBJCTS,C_PRSVEC[2]+220);
return L_THIEFP[2];
case 900:
RSPSUB([627],0,C_OBJCTS,C_PRSVEC[2]+220);
C_FINDEX[34]=1;
return L_THIEFP[2];
case 10:
L_THIEFP[2]=0;
return L_THIEFP[2];
return L_THIEFP[2];
}}
function EXIT_(){throw STOP}
/* ---------- zork.c: the first room is out on the terminal before the program behind it has been loaded ---------- */
function* start(){
  pr('You are in an open field west of a big white house with a boarded\n');
  pr('front door.\n');
  pr('There is a small mailbox here.\n'); /* zork.c prints the > too; here the game's own first prompt is that one */
  yield* DUNGEO();
}
function flush(){if(o){P.say([o]);o=''}}
function step(v){
  for(;;){
    var r;
    try{r=G.next(v)}
    catch(e){
      if(e===STOP){flush();return}
      if(e instanceof RangeError||e instanceof TypeError){flush();P.typeLine('zork: core dumped','err');return}
      throw e;
    }
    if(r.done){flush();return}
    if(pipe&&np<pipe.length){v=pipe[np++];continue}
    var p=o;o='';
    P.ask(p,function again(l){
      if(l===P.INT){P.ask('',again,true);return} /* signal(2,1) */
      step(l);
    },true);
    return;
  }
}
G=start();
P.queue(function(){step()});
}});
})(window.Phosphor);
