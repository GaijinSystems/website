/* PHOSPHOR-9 terminal: machine "bsd-1987", battlestar. Ported to JavaScript for this terminal from 4.3BSD's
   games/battlestar, version 4.2, fall 1984 (battlestar.c, com1-7.c, cypher.c, fly.c, getcom.c, globals.c, init.c,
   misc.c, parse.c, room.c, save.c, dayfile.c, nightfile.c, dayobjs.c, nightobjs.c, words.c: all @(#) 4/24/85, save.c 11/7/85).
   Every one of those files keeps this notice:

 * Copyright (c) 1983 Regents of the University of California,
 * All rights reserved.  Redistribution permitted subject to
 * the terms of the Berkeley Software License Agreement.

   From battlestar.c:

 * Battlestar - a stellar-tropical adventure game
 *
 * Originally written by His Lordship, Admiral David W. Horatio Riggle,
 * on the Cory PDP-11/70, University of California, Berkeley.

   The tables below are dumped from the C's own, by a program linked with them.

   Differences:
   - getpid() seeds rand(); there are no process ids here, so a random number from 1 to 30000 stands in for one.
   - The save file is $HOME/Bstar in the C and battlestar/Bstar in this browser's storage. The log, lib/battlestar.log, is
     battlestar/log, its last 100 lines.
   - At the end of a pipe the C prompts forever. This goes on to the keyboard instead.
   - With output to a pipe or file, the flight has no screen and takes the path the C has for one that cannot be had
     ("Whoops!  No more memory...").
   - A torpedo's blast is drawn and wiped in one step in the C, and a 9600 baud line showed it. It stays up briefly here.
   - Where the C reads what it never set, or outside an array, there is one reading, the same in the program compared against:
     a bit number out of range tests false and sets nothing, which is what a VAX did with -1, while for a verb's number it read
     other rooms; a name that is null or out of range is "", as address 0 read on the VAX; the weight of "all" is 0; give's unset word numbers are 0; su's
     unset flag is non-zero; shoot's unset return, with no laser, is the word it was at; words[] has room for 40 rather than overrunning at 20.
   - The anti-wizards (wnj, root, ted) really do dump core: their curse writes through location before it is set, and
     a failed -r leaves location unset too. Those end here with the shell's message. So does a division by zero.
   Both a fight's stale word count and a missing word's stale text are the C's own and are kept.
 */
(function(P){
'use strict';
var DAY=[
[null,[0,0,0,0,0,0,0,0],null],
["You are in the main hangar.",[5,2,9,3,3,1,0,0],"This is a huge bay where many fighters and cargo craft lie.  Alarms are \nsounding and fighter pilots are running to their ships.  Above is a gallery\noverlooking the bay. The scream of turbo engines is coming from +. The rest\nof the hangar is +. There is an exit +.*\n"],
["This is the landing bay.",[1,0,10,0,0,0,0,0],"Ships are landing here, some heavily damaged. Enemy fighters continually\nstrafe this vulnerable port. The main hangar is +, *\nThere is an exit +.*\n"],
["You are in the gallery.",[4,0,0,0,0,0,1,0],"From here a view of the entire landing bay reveals that our battlestar\nis near destruction. Fires are spreading out of control and laser blasts\nlick at the shadows. The control room is +. ***\n"],
["You are in the control room.",[0,3,0,0,0,0,5,0],"Several frantic technicians are flipping switches wildly but otherwise\nthis room seems fairly deserted.  A weapons locker has been left open.\nA staircase leads down. * There is a way -. **        \n"],
["This is the launch room.",[6,1,7,0,4,1,0,0],"From the launch tubes here fighters blast off into space. Only one is left,\nand it is guarded by two fierce men. A staircase leads up from here.\nThere is a cluttered workbench +. From the main hangar come sounds of great\nexplosions.  The main hangar is +. The viper launch tubes are to the -.*\n"],
["You are at the workbench.",[0,5,7,0,0,0,0,0],"Strange and unwieldy tools are arranged here including a lunch box \nand pneumatic wrenches and turbo sprocket rockets.*\nThe launch room is +. The remaining viper is +.*\n"],
["You are in the viper launch tube.",[0,5,0,5,32,0,0,0],"The two guards are eyeing you warily! ****\n"],
["This is a walk in closet.",[22,0,0,0,0,0,0,0],"A wardrobe of immense magnitude greets the eye.  Furs and robes of kings\nhang on rack after rack.  Silken gowns, capes woven with spun gold, and \ndelicate synthetic fabrics are stowed here.  The bedroom is +.***\n"],
["You are in a wide hallway leading to the main hangar.",[0,0,11,1,0,0,0,0],"The walls and ceiling here have been blasted through in several places.\nIt looks as if quite a battle has been fought for possession of the landing bay\nGaping corpses litter the floor.**  The hallway continues +.\nThe main hangar is +.\n"],
["You are in a wide hallway leading to the landing bay.",[0,0,12,2,0,0,0,0],"Most of the men and supplies needed in the main hangar come through this\ncorridor, but the wounded are forced to use it too. It very dank and\ncrowded here, and the floor is slippery with blood.**\nThe hallway continues -. The landing bay is +.\n"],
["The hallway is very congested with rubble here.",[0,0,0,9,13,1,0,0],"It is too choked with broken steel girders and other debris to continue\non much farther. Above, the ceiling has caved in and it is possible to \nclimb up. There is not much chance to go -, -, or -.\nBut the hallway seems clearer +.\n"],
["A wide hallway and a more narrow walkway meet here.",[14,15,0,10,0,0,0,0],"The intersection is crowded with the many wounded who have come up\nthe wide hallway and continued +. The walkway is less crowded +.\nThe wide hallway goes *-.\n"],
["You are in what was once an elegant stateroom.",[16,0,0,0,0,0,11,0],"Whoever lived in this stateroom, he and his female companion\nwere mercilessly slain in their sleep. Clothes, trinkets and personal\nbelongings are scattered all across the floor. Through a hole in the\ncollapsed floor I can see a hallway below.  A door is +.***\n"],
["You're at the entrance to the sick bay.",[17,12,18,0,0,0,0,0],"The wounded are entering the sick bay in loudly moaning files.\nThe walkway continues - and +. A doctor is motioning for you to \ncome to the -. *\n"],
["You're in the walkway.",[12,19,0,0,0,0,0,0],"Most of the men and supplies were coming from the armory. The walkway\ncontinues -. The armory is +.**\n"],
["These are the executive suites of the battlestar.",[20,13,21,22,23,1,24,0],"Luxurious staterooms carpeted with crushed velvet and adorned with beaten\ngold open onto this parlor. A wide staircase with ivory banisters leads\nup or down. This parlor leads into a hallway +. The bridal suite is +.\nOther rooms lie - and +.\n"],
["You're in a long dimly lit hallway.",[0,14,25,0,0,0,0,0],"This part of the walkway is deserted. There is a dead end +. The\nentrance to the sickbay is +. The walkway turns sharply -.*\n"],
["This is the sick bay.",[0,0,0,14,0,0,0,0],"Sinister nurses with long needles and pitiful aim probe the depths of suffering\nhere. Only the mortally wounded receive medical attention on a battlestar,\nbut afterwards they are thrown into the incinerators along with the rest.**\nNothing but death and suffering +.  The walkway is +.\n"],
["You're in the armory.",[15,26,0,0,0,0,0,0],"An armed guard is stationed here 365 sectars a yarn to protect the magazine.\nThe walkway is +. The magazine is +.**\n"],
["The hallway ends here at the presidential suite.",[27,16,0,0,0,0,0,0],"The door to this suite is made from solid magnesium, and the entryway is\ninlaid with diamonds and fire opals. The door is ajar +. The hallway\ngoes -.**\n"],
["This is the maid's utility room.",[0,0,0,16,0,0,0,0],"What a gruesome sight! The maid has been brutally drowned in a bucket of\nPine Sol and repeatedly stabbed in the back with a knife.***\nThe hallway is +.\n"],
["This is a luxurious stateroom.",[0,8,16,0,0,0,0,0],"The floor is carpeted with a soft animal fur and the great wooden furniture\nis inlaid with strips of platinum and gold.  Electronic equipment built\ninto the walls and ceiling is flashing wildly.  The floor shudders and\nthe sounds of dull explosions rumble though the room.  From a window in\nthe wall + comes a view of darkest space.  There is a small adjoining\nroom +, and a doorway +.*\n"],
["You are at the entrance to the dining hall.",[0,0,28,0,0,0,16,0],"A wide staircase with ebony banisters leads down here.**\nThe dining hall is to the -.*\n"],
["This was once the first class lounge.",[0,0,29,0,16,1,0,0],"There is much rubble and destruction here that was not apparent elsewhere.\nThe walls and ceilings have broken in in some places. A staircase with\nred coral banisters leads up. It is impossible to go - or -.\nIt seems a little clearer +.*\n"],
["You are in a narrow stairwell.",[0,17,0,0,30,1,0,0],"These dusty and decrepit stairs lead up.  There is no way -.  The\nhallway turns sharply -.**\n"],
["You are in the magazine.",[19,0,0,0,0,0,0,0],"Rows and rows of neatly stacked ammunition for laser pistols and grenade\nlaunchers are here. The armory is +.***\n"],
["You're in the presidential suite.",[0,20,0,0,0,0,0,0],"Apparently the president has been assassinated. A scorched figure lies\nface downward on the carpet clutching his chest.*\nThe hallway leads -.**\n"],
["You are in the dining hall.",[0,30,31,23,0,0,0,0],"This was the seen of a mass suicide. Hundreds of ambassadors and assorted\ndignitaries sit slumped over their breakfast cereal. I suppose the news\nof the cylon attack killed them. There is a strange chill in this room.  I\nwould not linger here. * The kitchen is +. Entrances + and +.\n"],
["The debris is very thick here.",[0,11,0,24,0,0,0,0],"Broken furniture, fallen girders, and other rubble block the way.\nThere is not much chance to continue -, -, or -.\nIt would be best to go -.\n"],
["You are in the kitchen.",[28,0,0,0,0,0,0,0],"This room is full of shining stainless steel and burnished bronze cookware. An \nassortment of tropical fruits and vegetables as well as fine meats and cheeses \nlies on a sterling platter. The chef, unfortunately, has been skewered like a \nside of beef. The dining room is +. ** There is a locked door +.\n"],
["You are in an arched entry leading to the dining room.",[0,0,0,28,0,0,0,0],"The door leading out is bolted shut from the outside and is very strong.***\nThe dining room is +.\n"],
["You are in space.",[33,34,35,36,37,1,33,1],"****\n"],
["You are in space.",[38,32,39,40,41,1,42,1],"****\n"],
["You are in space.",[32,44,45,46,47,1,48,1],"****\n"],
["You are in space.",[40,45,49,32,50,1,51,1],"****\n"],
["You are in space.",[41,46,32,52,53,1,54,1],"****\n"],
["You are in space.",[42,47,50,53,55,1,32,1],"****\n"],
["You are in space.",[43,48,51,54,32,1,56,1],"****\n"],
["You are in space.",[57,33,40,41,42,1,43,1],"****\n"],
["You are in space.",[39,35,57,33,58,1,59,1],"****\n"],
["You are in space.",[39,36,33,59,60,1,61,1],"****\n"],
["You are in space.",[39,37,58,60,62,1,33,1],"****\n"],
["You are in space.",[39,38,59,61,33,1,63,1],"****\n"],
["You are in space.",[34,64,45,46,47,1,48,1],"****\n"],
["You are in space.",[35,44,49,34,50,1,51,1],"****\n"],
["You are in space.",[36,44,34,52,53,1,54,1],"****\n"],
["You are in space.",[37,44,50,53,55,1,34,1],"****\n"],
["You are in space.",[38,44,51,54,34,1,56,1],"****\n"],
["You are in space.",[49,49,52,35,49,1,49,1],"****\n"],
["You are in space.",[58,47,49,37,55,1,35,1],"****\n"],
["You are in space.",[59,48,49,38,35,1,56,1],"****\n"],
["You are in space.",[52,52,36,49,52,1,52,1],"****\n"],
["You are in space.",[60,46,37,52,55,1,36,1],"****\n"],
["You are in space.",[61,48,38,52,36,1,56,1],"****\n"],
["You are in space.",[62,55,55,55,56,1,37,1],"****\n"],
["You are in space.",[56,56,56,56,38,1,55,1],"****\n"],
["You are in space.",[65,39,57,57,57,1,57,1],"****\n"],
["You are in space.",[39,50,49,42,62,1,40,1],"****\n"],
["You are in space.",[39,51,49,43,40,1,63,1],"****\n"],
["You are in space.",[39,53,43,59,62,1,41,1],"****\n"],
["You are in space.",[39,54,43,59,41,1,56,1],"****\n"],
["You are in space.",[39,55,62,62,56,1,42,1],"****\n"],
["You are in space.",[39,56,35,36,43,1,55,1],"****\n"],
["You are in space.",[44,66,66,66,66,1,66,1],"****\n"],
["You are in space.",[67,57,67,67,67,1,67,1],"****\n"],
["You are in space.",[64,68,68,68,68,1,68,1],"****\n"],
["You are orbiting a small blue planet.",[67,67,67,67,65,1,69,1],"****\n"],
["You are orbiting a tropical planet.",[68,68,68,68,66,1,70,1],"****\n"],
["You are flying through a dense fog.",[69,69,69,69,69,1,69,1],"A cold grey sea of mist is swirling around the windshield and water droplets\nare spewing from the wingtips. Ominous shadows loom in the darkness and it\nfeels as if a trap is closing around us. I have lost all sense of direction.\n****\n"],
["You are approaching an island.",[71,72,73,74,68,1,0,1],"Coconut palms, sword ferns, orchids, and other lush vegetation drape this\njagged island carved seemingly from pure emerald and set in a turquoise\nsea. The land rises sharply +. There is a nice beach* +.*\n"],
["You are flying over a mountainous region.",[75,73,76,77,68,1,0,1],"Below is a magnificent canyon with deep gorges, high pinnacles and\nwaterfalls plummeting hundreds of feet into mist. Everything in sight\nis carpeted with a tropical green.* The ocean is +.**\n"],
["You are flying over the ocean.",[74,78,78,78,68,1,0,1],"You bank over the water and your wingtips dip low to the green waves.  The\nsea is very shallow here and the white coral beds beneath us teem with \ncolorful fish.****\n"],
["You are flying over the beach.",[71,72,79,74,68,1,80,1],"A warm gentle surf caresses the white coral beach here. The land rises\nsharply +.* The beach is lost in low cliffs and rocks +.*\n"],
["You are flying over a large lagoon.",[81,72,73,82,68,1,0,1],"Encircled by a coral reef, the palms and ferns in this sheltered spot\nhave grown down to the water's very brink which winds tortuously inland.\nThere looks like a small village +.***\n"],
["You are flying over a gently sloping plane.",[83,71,84,85,68,1,0,1],"This is where several alluvial fans and ancient lava flows have run\ntogether forming a fertile plane choked with vegetation. It would be\nimpossible to land safely here.* The terrain is more rugged +.**\n"],
["You are flying through a gorge.",[0,0,86,71,68,1,102,1],"This narrow, steep sided canyon is lined with waving ferns. The floor is of\nlight gravel with many freshets pouring from the walls and running along it.\nThe gorge leads to the sea** +, and to a tumultuous origin +.\n"],
["You are flying over a plantation.",[85,81,71,88,68,1,89,1],"Rows of palms, papayas, mangoes, kiwi, as well as smaller fields of sugar\ncane and pineapple are growing here. It might be possible to land here, but\nI wouldn't advise it.* There looks like two small settlements +     \nand *+.\n"],
["You are over the ocean.",[72,78,79,74,68,1,0,1],"The deep green swells foam and roll into the shore **+*.\n"],
["You are flying along the coast.",[86,72,90,73,68,1,91,1],"The coastline here is very rocky with little or no sand. The surf in some\nplaces is violent and explodes in a shower of sparkling spray.\nThere is a winding road below which closely follows the shore. ****\n"],
["This is a beautiful coral beach.",[106,0,107,108,73,0,0,0],"Fine silver sand kissed lightly by warm tropical waters stretches at least\n30 meters here from the ocean to under gently swaying palms +.***\n"],
["You are flying over a small fishing village.",[77,74,71,82,68,1,92,1],"A few thatched huts a short distance from the water and row of more modern\nbungalows on either side of a dirt road are all that is here. The road\ncontinues on ***+.\n"],
["You are flying over a clearing.",[88,72,74,87,68,1,93,1],"There is a dock here (big enough for a seaplane) leading to a grassy\nmeadow and a road. Some people are having a party down there.  Below is\na good landing site. ****\n"],
["You are flying over the shore.",[94,75,95,96,68,1,0,1],"Rocky lava flows or coarse sandy beaches are all that is here except for\nsparse herbs and weeds.****\n"],
["You are flying in a wide valley.",[95,97,86,75,68,1,98,1],"This is a shallow valley yet the floor is obscured by a thick mist.\nThe valley opens to the sea +. The mist grows thicker +.**\n"],
["You are flying near the shore.",[96,77,75,99,68,1,0,1],"Very tall palm trees growing in neatly planted rows march off from the \nwater here towards the hills and down to the flat lands *+.*\nThere is a nice beach +.\n"],
["You are flying around the very tip of the island.",[95,79,90,84,68,1,0,1],"There is no beach here for sheer cliffs rise several hundred feet\nto a tree covered summit. Far below, the blue sea gnaws voraciously at\nthe roots of these cliffs. The island bends around +** and +.\n"],
["You are flying along the coastline.",[99,82,88,100,68,1,101,1],"There is a narrow strip of sand here lined with ferns and shrubs, but very\nfew trees. The beach is barley wide enough to land on. The beach continues\non -.* There are some buildings +.*\n"],
["You are flying over several cottages and buildings",[99,82,77,87,68,1,103,1],"The grounds here are landscaped with palm trees, ferns, orchids, and beds of\nflowering plumeria and antheriums. Directly below is a small ornate white\nhouse with a belltower, a lush green lawn, and a spurting fountain.\nSmall dirt roads go + and +.**\n"],
["You are in a field of sugar cane.",[109,110,111,112,77,0,0,0],"These strong, thick canes give little shelter but many cuts and scrapes.\nThere are some large trees ***+.\n"],
["You are flying over the ocean.",[95,78,90,86,68,1,0,1],"The water is a placid turquoise and so clear that fish and sharks\nmany fathoms below are clearly visible.****\n"],
["You are on the coast road.",[113,114,115,116,79,0,0,0],"The road winds close to the shore here and the sound of crashing surf is\ndeafening.* The water is +. The road continues - and -.\n"],
["You are on the main street of the village.",[117,118,119,120,81,0,0,0],"Thatched roofs and outrigger canoes, palm trees and vacation bungalows, and\ncomely natives in a tropical paradise all make this a fantasy come true.\nThere is an open bungalow +.*  The road continues - and -.\n"],
["You are at the sea plane dock.",[121,122,123,124,82,0,0,0],"Native girls with skin of gold, clad only in fragrant leis and lavalavas,\nline the dockside to greet you. A couple of ukulele plucking islanders and a\nkeyboard player are adding appropriate music. A road crosses the clearing \n+*.  There are some tables set up +.*\n"],
["You are flying over the ocean.",[94,83,95,96,68,1,0,1],"Sea weeds and kelp surge in the waves off shore here.  The ocean becomes \nmuch deeper +.***\n"],
["You are flying along the coast.",[94,84,86,83,68,1,0,1],"The land is very low here with a river running into the sea +. There\nis a wide valley opening up +. The very tip of the island is +.*\n"],
["You are flying along the coast.",[94,85,83,99,68,1,0,1],"There are some secluded sandy stretches of beach here, but too many rocky\noutcroppings of lava to land. There is a nicer beach ***+.\n"],
["You are lost in a sea of fog.",[97,104,97,97,97,1,0,1],"What have you gotten us into?\nI cant see a thing! ****\n"],
["You are on a gravel wash.",[125,126,127,128,84,0,0,0],"The sound of cascading water is the background for a diluted chorus of \ngurgling, splashing, and enchantingly delicate singing. Great billows\nof steam are rising *+.**\n"],
["You are flying over a wide beach.",[96,88,85,87,68,1,105,1],"Unlike the leeward beaches, few coconut palms grow here but a well groomed\nlawn and garden with traipsing stone walks leads down to the sand.*\nThere are some buildings +. Some trees are growing +.*\n"],
["You are flying over the ocean.",[100,100,87,100,68,1,0,1],"The sea is a perfectly clear blue with a white sandy bottom.  No coral\ngrows underwater here, but the force of the waves is broken by the steep\nincline.****\n"],
["You are on a narrow strip of sand.",[129,130,131,0,87,0,0,0],"Rather coarse sand makes this beach very steep and only a few meters wide.\nA fresh ocean breeze is rustling the ferns **+.*\n"],
["This is Fern Canyon.",[0,0,132,133,76,0,0,0],"Delicate waving ferns flourish here, suckled by warm water dripping from \nevery fissure and crevice in the solid rock walls.\nThe canyon winds **-, and -.\n"],
["This is the front lawn.",[134,135,136,137,88,0,0,0],"There is a small fountain here where the driveway meets the lawn.\nAcross the driveway, +, is an ornate white house with and elegant \nwoodworking.  The bargeboards are carved with fylfots, the ancient \nsymbols of luck.  Even a bell tower has been built here.*  There is a \nroad + which turns into the driveway.*\n"],
["You have just crossed the crest of a mountain.",[97,79,86,71,68,1,0,1],"The fog vanished mysteriously as we flew over the crest.*\nFar + I can see the ocean.**\n"],
["You are on a sandy beach.",[138,139,140,0,99,0,0,0],"This is the only good beach on the weather side of the island. Fine coral\nsand, a fresh sea breeze, and dramatic surf add to its appeal.**\nStone steps lead to the gardens +.*\n"],
["You are among palm trees near the shore.",[141,80,142,143,73,0,0,0],"Arching coconut palms laden with fruit provide a canopy for the glistening\nwhite sand and sparse grasses growing here. The forest grows denser +.\nThe ocean is +.**\n"],
["You are walking along the beach.",[144,0,145,80,73,0,0,0],"The warm tropical waters nuzzle your ankles as you walk. Above is a fiercely\nblue sky. The slope of the sand is so gentle that two hundred meters\noffshore the water is only knee deep.** There are some rocks +.*\n"],
["You are walking along the beach.",[146,0,80,147,73,0,0,0],"Many beautiful shells have been washed up here including bright yellow \ncowries, chocolate colored murex, orange conchs, striped tritons and the\ndeadly cone shells.****\n"],
["You are in a papaya grove.",[148,89,149,150,77,0,0,0],"Green slender trees no taller than three meters bulge with their\norange succulent fruit. There are some tall trees +.***\n"],
["You are in a field of pineapple.",[89,151,152,153,77,0,0,0],"The sharp dagger like pineapple leaves can pierce the flesh and hold fast\na skewered victim with tiny barbs.* The field ends +.**\n"],
["You are in a field of kiwi plants.",[149,154,155,89,77,0,0,0],"Round hairy fruit hang from staked vines here. There are some trees +\nand +. The field ends in a dirt road +.*\n"],
["You are in a large grove of coconuts.",[150,153,89,156,77,0,0,0],"These trees are much taller than any growing near the shore plus the fat,\njuicy coconuts have been selectively cultivated. The grove continues\n+, +, *and +.\n"],
["You are in the woods.",[157,91,158,116,79,0,0,0],"Tropical undergrowth makes the going rough here. Sword ferns give no strong\nfoot hold and the dangling vines would gladly throttle one. Strange cackling\nnoises are coming from somewhere +.***\n"],
["You are at the shore.",[91,0,159,145,79,0,0,0],"Explosions of surf jetting out of underwater tunnels here make it\nimpossible to climb down to a small cave entrance below.  Only at rare\nminus tides would it be possible to enter.***  The beach is better +.\n"],
["You are on the coast road.",[158,161,162,91,79,0,0,0],"The road is beginning to turn inland.* I can here the surf +. The road\ncontinues +.*\n"],
["The road winds deeper into the trees.",[163,142,91,164,79,0,0,0],"Only narrow sunbeams filter through the foliage above. The moist rich earth\nhas nurtured a myriad of trees, shrubs, and flowers to grow here. The\nroad continues - and *- from here.*\n"],
["This is the front porch of the bungalow.",[165,92,0,0,81,0,0,0],"These wooden steps and porch are very bucolic. A little woven mat on the \ndoorstep reads \"Don't Tread on Me\". The open front door is +.\nA stone walk leads to the main street +.**\n"],
["You are on a path leading to the lagoon.",[92,166,167,168,81,0,0,0],"This path trampled fern, grass, sapling, and anything else that got in its\nway.* The water is +.**\n"],
["This is a dirt road.",[169,118,170,92,81,0,0,0],"**The road continues on - here for some distance. A village is +.\n"],
["You are on a dirt road.",[171,118,92,172,81,0,0,0],"**There is a small village +. The road continues +.\n"],
["You are on a dirt road.",[173,93,174,175,82,0,0,0],"The light tan soil of the road contrasts artistically with the lush green\nvegetation and seering blue sky.*  There is a clearing and many people +.\nThe road continues - and -.\n"],
["You are at the seaplane dock.",[93,0,176,177,82,0,0,0],"Several muscular, bronze skinned men greet you warmly as you pass under\na thatched shelter above the dock here. Polynesian hospitality.\nThere is a clearing +.* A trail runs around the lagoon + and +.\n"],
["There are some tables on the lawn here.",[121,122,123,93,82,0,0,0],"Hors d'oeuvres, canapes, mixed drinks, and various narcotic drugs along with\ncartons of Di Gel fill the tables to overflowing. Several other guests are\nconversing and talking excitedly****.\n"],
["You are nosing around in the bushes.",[124,124,93,124,82,0,0,0],"There is little here but some old beer cans. You are making fools out of\nus in front of the other guests.** It would be best to go -.*\n"],
["You are walking in a dry stream bed.",[178,98,179,0,84,0,0,0],"The large cobblestones are difficult to walk on. No sunlight reaches\nbelow a white canopy of fog seemingly generated from *+.  A dirt path \nalong the wash is +. A high bank is impossible to climb +.\n"],
["You are at the thermal pools.",[98,0,180,181,84,0,0,0],"Several steaming fumaroles and spluttering geysers drenched by icy mountain\nwaters from a nearby waterfall heat half a dozen natural pools to a\ndelicious 42 degrees. Enchantingly beautiful singing seems to flow from the\nwater itself as it tumbles down the falls.*** There is a mossy entrance\nto a cave +.\n"],
["You are in the woods.",[127,180,182,98,84,0,0,0],"Coniferous trees girded by wild huckleberries, elderberries, salmonberries\nand thimbleberries enjoy a less tropical climate here in the high mountains.\n*The sound of rushing water is coming from +.**\n"],
["You are on a dirt trail.",[179,181,98,0,84,0,0,0],"The trail seems to start here and head -.** High cliffs border the \ntrail +.\n"],
["You are  walking along the beach.",[183,101,184,0,87,0,0,0],"A rather unnerving surf explodes onto the beach here and dashes itself into\nspray on the steep incline. The beach continues + and +.**\n"],
["You are walking along the beach.",[101,185,186,0,87,0,0,0],"This is not a very nice beach. The coarse sand hurts my feet.****\n"],
["You are walking through some ferns.",[184,186,187,101,87,0,0,0],"This is a wide field growing only ferns and small shrubs.** The \nocean is *+.\n"],
["You are in a narrow canyon.",[0,0,188,102,76,0,0,0],"The steep sides here squeeze a little freshet through a gauntlet like\nseries of riffles and pools.****\n"],
["The canyon is much wider here.",[0,0,102,189,76,0,0,0],"The sheer rock walls rise 10 meters to the forest above. A slender \nwaterfall careens away from the face of the rock high above and showers\nthe gravel floor with sparkling raindrops.** The canyon continues -\nand -.\n"],
["You are on the front porch of the cottage.",[190,103,0,0,0,0,0,0],"Several giggling native girls came running down the steps as you approached\nand headed on down the road.  On the fern rimmed porch is a small table with\nmatching white wrought iron chairs cushioned with red velvet.  The front\ndoor leads -.  The lawn and fountain are +.**\n"],
["You are in a palm grove.",[103,191,192,105,88,0,0,0],"****\n"],
["You are on a dirt road.",[193,192,245,103,88,0,0,0],"There is a large village +. The road cleaves a coconut plantation +.\nA small dirt road goes -, and a drive way peals off +.\n"],
["You are in a field of small shrubs.",[184,186,103,187,88,0,0,0],"**Pine and other coniferous saplings have been planted here.  The rich brown\nsoil is well tilled and watered.  Across a large lawn, there is a small\ncottage +. I can feel a delicious sea breeze blowing from +.\n"],
["The beach is pretty rocky here.",[194,105,195,0,96,0,0,0],"Dangerous surf and lava outcroppings make this a treacherous strand.\nThe beach is nicer* +.**\n"],
["The beach is almost 10 meters wide here.",[105,183,196,0,99,0,0,0],"The sand has become more coarse and the beach steeper.* It gets \nworse +.**\n"],
["You are in the gardens.",[195,196,197,105,99,0,0,0],"Lush green lawns studded with palms and benches stretch as far as the eye\ncan see.** A path leads -. Stone steps lead down to the beach +.\n"],
["You are on the coast road.",[198,106,163,199,73,0,0,0],"The forest is dense on either side and conceals the road from anyone\napproaching it.**  The road continues - and -.\n"],
["You are in the forest.",[116,107,91,106,73,0,0,0],"There are trees and ferns all around.****\n"],
["You are in the forest.",[199,108,106,146,73,0,0,0],"There are trees and ferns all around.****\n"],
["You are in a copse.",[142,107,145,80,0,0,0,0],"This is a secret hidden thicket only noticeable from the beach. Someone\nhas been digging here recently.****\n"],
["You are at the tide pools.",[91,0,114,107,79,0,0,0],"These rocks and pools are the home for many sea anemones and crustaceans.\n**The surf is very rough +. There is a nice beach +.\n"],
["You are in the forest.",[199,108,143,0,73,0,0,0],"This is a shallow depression sheltered from the wind by a thick growth of \nthorny shrubs. It looks like someone has camped here. There is a fire pit\nwith some dry sticks and grass nearby.* The beach is +.* The thorny\nshrubs block the way -.\n"],
["You are at the mouth of the lagoon.",[200,0,108,201,74,0,0,0],"The beach ends here where the coral reef rises to form a wide lagoon\nbending inland. A path winds around the lagoon to the -.*\nThe beach continues on -. Only water lies +.\n"],
["You are in a breadfruit grove.",[202,109,203,204,77,0,0,0],"The tall trees bend leisurely in the breeze, holding many round breadfruits\nclose to their large serrated leaves.  There are coconut palms +,\n*+, and +.\n"],
["You are in a grove of mango trees.",[203,111,205,109,77,0,0,0],"The juicy yellow red fruits are nearly ripe on the trees here. There are\nsome coconut palms +. There are some vines +. There is a road +.*\n"],
["You are in a grove of coconut palms.",[204,112,109,206,77,0,0,0],"All I can see around us are palm trees.****\n"],
["You are in a coconut grove.",[110,207,208,209,77,0,0,0],"There are countless trees here.****\n"],
["You are in a field of pineapple.",[154,208,210,110,77,0,0,0],"The sharp leaves are cutting me to ribbons. There is a road **+.\nMore pineapple +.\n"],
["You are in a coconut grove.",[112,209,110,211,77,0,0,0],"There is a field of pineapple **+.*\n"],
["You are on the edge of a kiwi and pineapple field.",[111,152,155,110,77,0,0,0],"An irrigation ditch separates the two fields here. There is a road **+.*\n"],
["This is a dirt road.",[205,210,212,111,77,0,0,0],"The road runs - and - here.**\n"],
["You are in a palm grove.",[206,211,112,213,77,0,0,0],"There are palm trees all around us.****\n"],
["You are on the edge of a small clearing.",[157,113,157,157,79,0,0,0],"The ground is rather marshy here and darting in and out of the many tussocks\nis a flock of wild chicken like fowl.****\n"],
["You are in the woods.",[158,115,215,113,79,0,0,0],"You have walked a long way and found only trees. ****\n"],
["You are walking along the shore.",[115,0,214,114,86,0,0,0],"You are now about 10 meters above the surf on a gently rising cliffside.**\nThe land rises +. There is a beach far +.\n"],
["You are just inside the entrance to the sea cave.",[246,114,0,0,114,1,0,0],"The sound of water dripping in darkness and the roar of the ocean just outside\ncreate a very unwelcoming atmosphere inside this cave. Only on rare occasions\nsuch as this is it possible to enter the forbidden catacombs... The cave\ncontinues -.***\n"],
["You are in a secret nook beside the road.",[115,159,162,91,79,0,0,0],"Hidden from all but the most stalwart snoopers are some old clothes, empty\nbeer cans and a trash baggie full of used Huggies and ordure. Lets get\nback to the road +.***\n"],
["You are on the coast road.",[215,214,0,115,86,0,0,0],"The road turns abruptly - here, avoiding the cliffs near the shore\n+ and +.*\n"],
["You are on a dirt road.",[216,116,113,141,79,0,0,0],"The roadside is choked with broad leaved plants fighting for every breath of\nsunshine. The palm trees are taller than at the shore yet bend over the road \nforming a canopy. The road continues *- and *-.\n"],
["You have discovered a hidden thicket near the road.",[163,142,116,106,73,0,0,0],"Stuffed into a little bundle here is a bloody silken robe and many beer cans.\n*Some droplets of blood and a major spill sparkle farther +.\nThe road is +.*\n"],
["You are in the living room.",[0,117,217,218,0,0,0,0],"A decorative entry with fresh flowers and wall to wall carpeting leads into\nthe living room here where a couch and two chairs converse with an end table.\n*The exit is +.* The bedroom is +.\n"],
["You are at the lagoon.",[118,0,167,168,81,0,0,0],"There are several outrigger canoes pulled up on a small beach here and a\ncatch of colorful fish is drying in the sun. There are paths leading \noff -*, -, and -.\n"],
["You are at the lagoon.",[118,0,170,166,81,0,0,0],"This is a grassy little spot near the water. A sightly native girl is frolicing\nin the water close to shore here.** The path continues - and -. \n"],
["You are at the lagoon.",[118,0,166,172,81,0,0,0],"The path meanders through tussocks of grass, ferns, and thorny bushes here\nand continues on **- and -.\n"],
["You are in the woods.",[219,119,220,92,81,0,0,0],"There are plenty of ferns and thorny bushes here! ****\n"],
["You are on a dirt road.",[220,167,199,119,74,0,0,0],"The road winds rather close to a large lagoon here and many sedges and tall\ngrasses line the shoulder *+. The road continues - and -.\n"],
["You are in the woods beside the road.",[221,120,92,222,81,0,0,0],"The forest grows darker +. The road is +.**\n"],
["The road crosses the lagoon here.",[222,0,120,174,81,0,0,0],"Coursing through the trees, the road at this point bridges a watery finger\nof the lagoon.* The water is +. The road continues - and -.\n"],
["You are in a coconut palm grove.",[223,121,224,225,82,0,0,0],"The tall palms are planted about 30 feet apart with a hardy deep green grass\nfilling the spaces in between.  There are tire tracks through the grass. The\ngrove continues -. There is a road +.**\n"],
["You are walking along a dirt road.",[224,176,172,121,82,0,0,0],"You are nearing the lagoon.** The road continues - and -.\n"],
["You are on a dirt road.",[225,177,121,226,82,0,0,0],"The road turns abruptly - here, entering a grove of palm trees.* The road\nalso continues - toward the lagoon.*\n"],
["You are on a trail running around the lagoon.",[172,0,0,122,82,0,0,0],"The dark waters brush the trail here and the path crosses a bridge +.\nThere is deep water + and +. The trail continues -.\n"],
["This is the mouth of the lagoon.",[175,0,122,227,82,0,0,0],"The coral reef wraps around a natural bay here to create a wide lagoon which\nwinds tortuously inland.** A trail goes around the lagoon +. The beach\nis +.\n"],
["You are in a dry stream bed.",[0,125,0,0,84,0,0,0],"The dry wash drains over a tall precipice here into a turbid morass below. The\nmost noisome stench imaginable is wafting up to defile our nostrils. Above,\nthe lurid sun glows brown through a strange mist.* The only direction \nI'm going is -.**\n"],
["You are on a dirt path along the wash.",[0,128,125,228,84,0,0,0],"This path looks more like a deer trail. It scampers away ***+.\n"],
["The thermal pools flow into a stream here.",[127,0,229,126,84,0,0,0],"The gurgling hot waters pour over boulders into a swiftly flowing\nstream **+. The pools are +.\n"],
["You are at the entrance to a cave.",[128,230,126,0,84,0,0,0],"A tall narrow fissure in the rock cliffs here has become a well traveled\npassage way. A hoof beaten dirt path leads directly into it. A curl of\nsteam is trailing from a corner of the fissure's gaping mouth. The path\nleads - and -. The pools are +.*\n"],
["You are in the woods.",[182,229,182,127,84,0,0,0],"Wild berry bushes plump with fruit and thorns tangle your every effort to\nproceed.* The sound of rushing water is +.**\n"],
["You are walking along the beach.",[139,129,184,0,99,0,0,0],"Some dunes here progress inland and make it impossible to get very far in that\ndirection. The beach continues - and -.* The ocean is +.\n"],
["You are in the dunes.",[183,101,184,129,87,0,0,0],"The endless rolling and pitching sand dunes are enough to make one very queasy!\nThe only way I'm going is ***+.\n"],
["This is a lousy beach.",[130,0,0,0,87,0,0,0],"Volcanic and viciously sharp bitted grains of sand here bite like cold steel\ninto my tender feet. I refuse to continue on. Let's get out of here. The\nbeach is better +.***\n"],
["You are in a field of sparse ferns.",[131,185,187,130,87,0,0,0],"The lava rock outcroppings here will support few plants. There is more \nvegetation +. There is a nice beach +.* The ocean is +.\n"],
["You are in the woods.",[131,131,137,131,87,0,0,0],"Young trees and tall shrubs grow densely together at this distance from the \nshore.** The trees grow thicker +.*\n"],
["The canyon is no wider than a foot here.",[0,0,0,132,0,0,0,0],"The freshet is gushing through the narrow trough, but the canyon has grown\ntoo narrow to follow it any farther.*** I guess we'll have to go -.\n"],
["You are in a narrow part of the canyon.",[0,0,133,232,76,0,0,0],"The two sheer sides are no more than a few meters apart here. There is a stone\ndoor in the wall +. The gravelly floor runs with tiny rivulets seeping \nfrom the ground itself.* The canyon continues - and -.\n"],
["You are in the drawing room.",[0,134,0,0,0,0,0,0],"Exquisitely decorated with plants and antique furniture of superb\ncraftsmanship, the parlor reflects its owners impeccable taste.  The tropical\nsun is streaming in through open shutters *+.  There doesn't seem \nto be anybody around.  A large immaculate oaken desk is visible in the\nstudy and it even has a old fashioned telephone to complete the decor.**\n"],
["You are in a palm grove.",[135,191,233,191,88,0,0,0],"Grassy rows of palms stretch as far as I can see.** There is a road +.*\n"],
["You are on a dirt road.",[136,233,234,135,88,0,0,0],"The road winds through a coconut palm grove here. It continues on - \nand -.**\n"],
["The road leads to several large buildings here.",[235,136,236,237,88,0,0,0],"There is a clubhouse +,* a large barn and stable +, and a garage of \nsimilar construct to the barn +.\n"],
["This part of the beach is impassable.",[0,138,0,0,96,0,0,0],"The huge rocks and thunderous surf here would pound our frail bodies to pulp\nin an instant.* The only direction I'm going is -.**\n"],
["You are in the gardens.",[195,140,197,138,96,0,0,0],"So much green grass is a pleasure to the eyes.****\n"],
["You are in the gardens.",[140,183,197,139,99,0,0,0],"Beautiful flowers and shrubs surround a little goldfish pond.****\n"],
["You are on a stone walk in the garden.",[195,196,238,140,99,0,0,0],"The walk leads to a road **+.*\n"],
["You are in the forest near the road.",[198,141,216,198,73,0,0,0],"There are many thorny bushes here!****\n"],
["You are at a fork in the road.",[239,146,141,170,73,0,0,0],"Two roads come together in the forest here. One runs -,* the other \nruns - and -.\n"],
["You are on a dirt path around the lagoon.",[170,147,146,0,74,0,0,0],"The still waters reflect bending palms and a cloudless sky. It looks like\nthe path runs into a clearing +. The path continues -.**\n"],
["You are drowning in the lagoon.",[201,201,147,201,74,0,0,0],"I suggest you get out before you become waterlogged.****\n"],
["You are in a coconut palm grove.",[202,148,203,204,77,0,0,0],"****\n"],
["You are in a palm grove.",[202,149,205,148,77,0,0,0],"****\n"],
["You are in a palm grove.",[202,150,148,206,77,0,0,0],"****\n"],
["You are on a dirt road.",[203,155,212,149,77,0,0,0],"*This road ends here at a palm grove but continues on - for quite\nsome way.**\n"],
["You are in a coconut palm grove.",[204,156,150,213,77,0,0,0],"****\n"],
["You are in a coconut grove.",[151,219,208,209,77,0,0,0],"*The grove ends +.**\n"],
["You are in a coconut grove.",[152,207,239,151,77,0,0,0],"**There is a dirt road +.*\n"],
["You are in a coconut grove.",[153,207,151,211,77,0,0,0],"****\n"],
["This is a dirt road.",[205,239,212,154,77,0,0,0],"The road continues - and -.**\n"],
["You are in a coconut grove.",[153,209,153,213,77,0,0,0],"****\n"],
["You are in the woods near the road.",[205,210,212,155,77,0,0,0],"There are many thorny bushes here!****\n"],
["You are in a coconut grove.",[213,213,156,234,88,0,0,0],"***The grove ends in a clearing +.\n"],
["You are walking along some high cliffs.",[162,0,0,159,86,0,0,0],"The island bends sharply + here with high cliffs -\nand -. The cliffs are lower +.\n"],
["You are at the coast road turn around.",[0,162,0,158,90,0,0,0],"The coast road ends here in a lookout with a view of 100 kilometers of blue\nsea and 100 meters of rugged cliff. Far below the waves crash against rocks.\n****\n"],
["You are in the woods near the road.",[216,163,216,198,79,0,257,0],"These thorny bushes are killing me.****\n"],
["You are in the kitchen.",[0,0,0,165,0,0,0,0],"A small gas stove and a refrigerator are all the only appliances here. The\ngas oven has been left on and the whole room is reeking with natural gas.\nOne spark from a match and.... The door out is ***+.\n"],
["You are in the bedroom.",[0,0,165,0,0,0,0,0],"A soft feather comforter on top of layers of Answer blankets make this a very\nluxurious place to sleep indeed. There are also some end tables and a dresser\nhere.** The living room is +.*\n"],
["You are in the woods.",[207,169,220,221,81,0,0,0],"There seems to be a clearing +.***\n"],
["You are in the woods near the road.",[219,170,239,169,81,0,0,0],"*As far as I can tell, there are two roads + and +.*\n"],
["You are in the woods.",[207,171,219,222,81,0,0,0],"The forest is clearer +.***\n"],
["You are on the lagoon's inland finger.",[0,172,171,172,81,0,0,0],"It is impossible to follow the lagoon any farther inland because of sharp\nand very painful sedges.* The road is +.**\n"],
["You are in a grassy coconut grove.",[240,173,224,241,82,0,0,0],"The tall palms provide a perfect canopy for the lush green grass.***\nThere is a road +.\n"],
["You are near the lagoon's inland finger.",[0,174,0,173,82,0,0,0],"Very sharp sedges make it impossible to follow the lagoon any farther inland.\n*There is a road +.**\n"],
["You are on a dirt road.",[241,175,173,226,82,0,0,0],"The road winds through a coconut grove here and continues - and -.**\n"],
["You are in the woods near the road.",[226,226,175,226,82,0,0,0],"**The road is +.*\n"],
["This is a beach?",[227,227,177,0,82,0,0,0],"Hard jagged rocks that pierce with every footstep hardly comprise a beach.**\nLet's go -.*\n"],
["The trail is lost in the woods here.",[241,241,179,241,84,0,0,0],"I suppose the animals that use this trail all depart in different directions\nwhen they get this far into the woods.** The trail goes -.*\n"],
["You are on the bank of a stream.",[182,0,242,180,84,0,0,0],"The stream falls over several small boulders here and continues on **-.*\n"],
["You are just inside the cave.",[181,267,0,0,0,0,0,0],"A steamy hot breath is belching from the depths of the earth within.* The\ncave  continues -.**\n"],
["You are just inside the cave entrance.",[274,0,0,0,0,0,0,0],"The air is hot and sticky inside. The cave continues -. There is a \nstone door in the wall +.  A wooden sign in the dust reads in old elven\nrunes, \"GSRF KDIRE NLVEMP!\".**\n"],
["You are at the edge of a huge chasm.",[0,0,189,0,76,0,0,0],"Several hundred feet down I can see the glimmer of placid water. The\nrivulets drain over the edge and trickle down into the depths. It is \nimpossible to climb down without a rope.** The canyon continues -.*\n"],
["You are on a dirt road.",[192,241,240,191,88,0,0,0],"The road winds through a coconut grove here. The road continues on -\nand -.**\n"],
["You are in a coconut palm grove near the road.",[193,233,213,192,88,0,0,0],"***The road is +.\n"],
["You are at the clubhouse.",[0,193,0,0,0,0,0,0],"The clubhouse is built over the most inland part of the lagoon.  Tropical\nbananas and fragrant frangipani grow along the grassy shore.  Walking across\nthe short wooden bridge, we enter.  Along one wall is a bar with only a few\npeople seated at it.  The restaurant and dance floor are closed off with\na 2 inch nylon rope. ****\n"],
["You are in the stables.",[0,0,0,193,0,0,0,0],"Neighing horses snacking on hay and oats fill the stalls on both sides of\nthe barn.  It is rather warm in here but that is not the most offensive\npart.  The old boards of the barn part just enough to let in dust laden\nshafts of light.  Flies swarm overhead and strafe the ground for dung.\nMy nose is beginning to itch. ****\n"],
["You are in the old garage.",[0,0,193,0,0,0,0,0],"This is an old wooden building of the same vintage as the stables.  Beneath\na sagging roof stand gardening tools and greasy rags.  Parked in the center\nis an underpowered Plymouth Volare' with a red and white striped golf cart\nroof. ****\n"],
["You are on a dirt road.",[197,197,243,197,85,0,0,0],"The road leads to a beautiful formal garden laced with stone walks and tropical\nflowers and trees.** The road continues -. A walk leads -.\n"],
["You are on a dirt road.",[210,199,198,220,73,0,0,0],"The road runs - and -.**\n"],
["You are in a coconut grove near the road.",[234,223,234,233,88,0,0,0],"***The road is +.\n"],
["You are on a dirt road.",[233,225,223,226,82,0,0,0],"The road continues - and -.**\n"],
["The stream plummets over a cliff here.",[182,0,0,229,84,0,0,0],"Falling 10 agonizing meters into spray, only droplets of the stream are\nleft to dance off the floor below.  I thought I saw a sparkle of gold\nat the bottom of the falls, but now it is gone.  There is no way down,\neven with a strong rope. ****\n"],
["You are on a dirt road.",[0,0,244,238,85,0,0,0],"**The road continues - and -.\n"],
["You are on a dirt road.",[0,245,0,243,88,0,0,0],"*The road continues -* and -.\n"],
["You are on a dirt road.",[244,234,213,136,88,0,0,0],"The road goes -* and *-.\n"],
["You are in a low passage.",[247,160,0,0,0,0,0,0],"The passage is partially flooded here and it may be hazardous to proceed.\nWater is surging from the tunnel and heading out to sea. Strange moaning\nnoises rise above the rushing of the water.  They are as thin as a whispering\nwind yet penetrate to my very soul.  I think we have come too far...\nThe passage continues -.***\n"],
["The walls are very close together here.",[248,0,0,0,0,0,0,0],"I can barely squeeze through the jagged opening. Slimy sea weeds provide\nno footing at all. This tunnel seems to be an ancient lava tube. There is\na large room -.***\n"],
["You are in the cathedral room.",[249,251,249,251,0,0,0,0],"Your light casts ghostly shadows on the walls but cannot pierce the \nengulfing darkness overhead. The sound of water dripping echoes in the void.\n*I can see no passages leading out of this room.  We have definitely\ncome too far.*** \n"],
["You are walking through a very round tunnel.",[252,0,0,0,252,1,0,0],"The round walls of this tunnel are amazingly smooth to the touch. A little\ntrickle of water flows down the center. The tunnel climbs steadily +.\nThe cave is beginning to flood again!  Let's get out of here! ***\n"],
["You are in the cathedral anteroom.",[0,0,0,248,253,1,0,0],"This small chamber with a flat stone floor is to one side of the cathedral \nroom. We appear to be at the bottom of a tall narrow shaft. There are many \npuddles of water here. A staircase hewn from solid rock and black lava \nleads up.*** The cathedral room is +.\n"],
["You are in a wide chamber.",[0,0,248,254,0,0,0,0],"Water is sprinkling from the ceiling here. A shallow pool populated by a \nmyriad of blind white creatures sparkles in your light. Tiny shrimp and\ncrabs scurry away, frightened by the blinding rays.** The cave \ncontinues - and -.\n"],
["You are at the top of a sloping passage.",[0,0,255,256,257,1,0,0],"There is much algae growing here, both green and brown specimens. \nWater from an underground sea surges and splashes against the slope of\nthe rock. The walls glisten with shiny minerals.  High above, light\nfilters in through a narrow shaft.**  A hallway here runs -\nand -.\n"],
["You are in an elaborately tiled room.",[0,0,258,0,0,0,250,0],"Large colorful tiles plate the floor and walls.  The ceiling is a mosaic\nof gems set in gold.  Hopefully it is only our footsteps that are echoing in\nthis hollow chamber.** The room continues -.  A stone staircase\nleads down.*\n"],
["You are at a dead end.",[0,0,251,0,0,0,0,0],"The walls here are alive with dark mussels.  They click their shells menacingly\nif we disturb them. ** The only exit is +.*\n"],
["The tunnel is very low here.",[0,0,259,252,0,0,0,0],"I practically have to crawl on my knees to pass through this opening. The\nair is stiflingly damp, but I can't hear any sounds of water dripping.**\nThe crawlspace continues -. The tunnel seems wider +.\n"],
["This is the supply room.",[0,0,252,0,0,0,0,0],"Picks and shovels line the walls here, as well as hard hats, boxes of\ndynamite, and a cartload of very high grade gold and silver ore.** \nA tunnel leads off +.*\n"],
["You have found a secret entrance to the catacombs.",[0,0,0,0,216,1,252,0],"I have a sickening feeling that we should not have entered the catacombs.\nBelow is a wet, seaweed covered floor. Above is a way out. ****\n"],
["You are in the catacombs.",[0,0,260,253,0,0,0,0],"Ornate tombs and piles of treasure line the walls.  Long spears with many\nblades, fine swords and coats of mail, heaps of coins, jewelry, pottery, \nand golden statues are tribute of past kings and queens.** The catacombs\ncontinue - and -.\n"],
["You are crawling on your stomach.",[0,0,261,255,0,0,0,0],"The passage is quite narrow and jagged, but the rock is no longer lava.\nIt appears to be a form of granite.** The crawlspace continues -, \nbut I would just as soon go -.\n"],
["You are in the Sepulcher.",[0,0,0,258,0,0,0,0],"A single tomb is here.  Encrusted with diamonds and opals, and secured with \nstraps of a very hard, untarnished silver, this tomb must be of a great king.\nVases overflowing with gold coins stand nearby.  A line of verse on the wall\nreads, \"Three he made and gave them to his daughters.\"****\n"],
["The passage is wider here.",[0,0,0,259,0,0,0,0],"You are at the top of a flooded shaft.  About a meter below the edge,\ndark water rises and falls to the rhythm of the sea.  A ladder goes\ndown into water here.***  A small crawlspace goes -.\n"],
["You are at the bottom of a ladder.",[0,0,0,0,261,1,263,0],"This is a narrow platform to rest on before we continue either up or down this\nrickety wooden ladder.****\n"],
["You are standing in several inches of water.",[264,0,265,266,262,1,0,0],"This seems to be a working mine. Many different tunnels wander off following\nglowing veins of precious metal.  The floor is flooded here since we must\nbe nearly at sea level.  A ladder leads up. ****\n"],
["The tunnel here is blocked by broken rocks.",[0,263,0,0,0,0,0,0],"The way is blocked, but if you had some dynamite, we might be able to blast our\nway through.*  The passage goes -.**\n"],
["The tunnel is too flooded to proceed.",[0,0,0,263,0,0,0,0],"Hidden shafts could swallow us if we tried to continue on down this tunnel.\nThe flooding is already up to my waist.  Large crystals overhead shimmer\nrainbows of reflected light.***  Let's go -.\n"],
["The mine is less flooded here.",[0,0,263,0,0,0,0,0],"A meandering gold laden vein of quartz and blooming crystals of diamonds\nand topaz burst from the walls of the cave.  A passage goes -.***\n"],
["You are inside the cave.",[230,268,0,0,0,0,0,0],"A hot steam swirls around our heads, and the walls are warm to the touch.\nThe trail winds + and +.**\n"],
["You are in a rather large chamber.",[267,0,0,269,0,0,269,0],"Beds of ferns and palm leaves make several cozy nests along the walls. In the\ncenter of the room is a throne of gold and silver which pulls out into a bed\nof enormous size.***  A passageway leads down to the -.\n"],
["You are walking along the edge of a huge abyss.",[0,0,268,0,268,1,270,0],"Steam is rising in great clouds from the immeasurable depths.  A very narrow\ntrail winds down.**  There is a tunnel +.*\n"],
["You are on the edge of a huge abyss.",[0,0,0,0,269,1,271,0],"The trail winds farther down.****\n"],
["You are winding your way along the abyss.",[0,0,0,0,270,1,272,0],"The trail continues up and down.****\n"],
["You are on a wide shelf near the steamy abyss.",[0,273,0,0,271,1,0,0],"The stifling hot cave seems even hotter to me, staring down into this misty \nabyss.  A trail winds up.*  A passageway leads -.**\n"],
["You are in a wide tunnel leading to a fuming abyss.",[272,274,0,0,0,0,0,0],"The passageway winds through many beautiful formations of crystals and\nsparkling minerals.  The tunnel continues - and -.**\n"],
["You are in a tunnel.",[273,231,0,0,0,0,0,0],"It is very warm in here.  The smell of steam and hot rocks permeates the place.\nThe cave continues - and -.**\n"],
["You are at the bottom of a pit.",[0,0,0,0,232,0,0,0],"I can see daylight far up at the mouth of the pit.   A cool draft wafts down.\nThere doesn't seem to be any way out, and I don't remember how we came in.\nIf you had a rope it might be possible to climb out. ****\n"]
];
var NIGHT=[
[null,[0,0,0,0,0,0,0,0],null],
["You are in the main hangar.",[5,2,9,3,3,1,0,0],"This is a huge bay where many fighters and cargo craft lie.  Alarms are \nsounding and fighter pilots are running to their ships.  Above is a gallery\noverlooking the bay. The scream of turbo engines is coming from +. The rest\nof the hangar is +. There is an exit +.*\n"],
["This is the landing bay.",[1,0,10,0,0,0,0,0],"Ships are landing here, some heavily damaged. Enemy fighters continually\nstrafe this vulnerable port. The main hangar is +, *\nThere is an exit +.*\n"],
["You are in the gallery.",[4,0,0,0,0,0,1,0],"From here a view of the entire landing bay reveals that our battlestar\nis near destruction. Fires are spreading out of control and laser blasts\nlick at the shadows. The control room is +. ***\n"],
["You are in the control room.",[0,3,0,0,0,0,5,0],"Several frantic technicians are flipping switches wildly but otherwise\nthis room seems fairly deserted.  A weapons locker has been left open.\nA staircase leads down. * There is a way -. **        \n"],
["This is the launch room.",[6,1,7,0,4,1,0,0],"From the launch tubes here fighters blast off into space. Only one is left,\nand it is guarded by two fierce men. A staircase leads up from here.\nThere is a cluttered workbench +. From the main hangar come sounds of great\nexplosions.  The main hangar is +. The viper launch tubes are to the -.*\n"],
["You are at the workbench.",[0,5,7,0,0,0,0,0],"Strange and unwieldy tools are arranged here including a lunch box \nand pneumatic wrenches and turbo sprocket rockets.*\nThe launch room is +. The remaining viper is +.*\n"],
["You are in the viper launch tube.",[0,5,0,5,32,0,0,0],"The two guards are eyeing you warily! ****\n"],
["This is a walk in closet.",[22,0,0,0,0,0,0,0],"A wardrobe of immense magnitude greets the eye.  Furs and robes of kings\nhang on rack after rack.  Silken gowns, capes woven with spun gold, and \ndelicate synthetic fabrics are stowed here.  The bedroom is +.***\n"],
["You are in a wide hallway leading to the main hangar.",[0,0,11,1,0,0,0,0],"The walls and ceiling here have been blasted through in several places.\nIt looks as if quite a battle has been fought for possession of the landing bay\nGaping corpses litter the floor.**  The hallway continues +.\nThe main hangar is +.\n"],
["You are in a wide hallway leading to the landing bay.",[0,0,12,2,0,0,0,0],"Most of the men and supplies needed in the main hangar come through this\ncorridor, but the wounded are forced to use it too. It very dank and\ncrowded here, and the floor is slippery with blood.**\nThe hallway continues -. The landing bay is +.\n"],
["The hallway is very congested with rubble here.",[0,0,0,9,13,1,0,0],"It is too choked with broken steel girders and other debris to continue\non much farther. Above, the ceiling has caved in and it is possible to \nclimb up. There is not much chance to go -, -, or -.\nBut the hallway seems clearer +.\n"],
["A wide hallway and a more narrow walkway meet here.",[14,15,0,10,0,0,0,0],"The intersection is crowded with the many wounded who have come up\nthe wide hallway and continued +. The walkway is less crowded +.\nThe wide hallway goes *-.\n"],
["You are in what was once an elegant stateroom.",[16,0,0,0,0,0,11,0],"Whoever lived in this stateroom, he and his female companion\nwere mercilessly slain in their sleep. Clothes, trinkets and personal\nbelongings are scattered all across the floor. Through a hole in the\ncollapsed floor I can see a hallway below.  A door is +.***\n"],
["You're at the entrance to the sick bay.",[17,12,18,0,0,0,0,0],"The wounded are entering the sick bay in loudly moaning files.\nThe walkway continues - and +. A doctor is motioning for you to \ncome to the -. *\n"],
["You're in the walkway.",[12,19,0,0,0,0,0,0],"Most of the men and supplies were coming from the armory. The walkway\ncontinues -. The armory is +.**\n"],
["These are the executive suites of the battlestar.",[20,13,21,22,23,1,24,0],"Luxurious staterooms carpeted with crushed velvet and adorned with beaten\ngold open onto this parlor. A wide staircase with ivory banisters leads\nup or down. This parlor leads into a hallway +. The bridal suite is +.\nOther rooms lie - and +.\n"],
["You're in a long dimly lit hallway.",[0,14,25,0,0,0,0,0],"This part of the walkway is deserted. There is a dead end +. The\nentrance to the sickbay is +. The walkway turns sharply -.*\n"],
["This is the sick bay.",[0,0,0,14,0,0,0,0],"Sinister nurses with long needles and pitiful aim probe the depths of suffering\nhere. Only the mortally wounded receive medical attention on a battlestar,\nbut afterwards they are thrown into the incinerators along with the rest.**\nNothing but death and suffering +.  The walkway is +.\n"],
["You're in the armory.",[15,26,0,0,0,0,0,0],"An armed guard is stationed here 365 sectars a yarn to protect the magazine.\nThe walkway is +. The magazine is +.**\n"],
["The hallway ends here at the presidential suite.",[27,16,0,0,0,0,0,0],"The door to this suite is made from solid magnesium, and the entryway is\ninlaid with diamonds and fire opals. The door is ajar +. The hallway\ngoes -.**\n"],
["This is the maid's utility room.",[0,0,0,16,0,0,0,0],"What a gruesome sight! The maid has been brutally drowned in a bucket of\nPine Sol and repeatedly stabbed in the back with a knife.***\nThe hallway is +.\n"],
["This is a luxurious stateroom.",[0,8,16,0,0,0,0,0],"The floor is carpeted with a soft animal fur and the great wooden furniture\nis inlaid with strips of platinum and gold.  Electronic equipment built\ninto the walls and ceiling is flashing wildly.  The floor shudders and\nthe sounds of dull explosions rumble though the room.  From a window in\nthe wall + comes a view of darkest space.  There is a small adjoining\nroom +, and a doorway +.*\n"],
["You are at the entrance to the dining hall.",[0,0,28,0,0,0,16,0],"A wide staircase with ebony banisters leads down here.**\nThe dining hall is to the -.*\n"],
["This was once the first class lounge.",[0,0,29,0,16,1,0,0],"There is much rubble and destruction here that was not apparent elsewhere.\nThe walls and ceilings have broken in in some places. A staircase with\nred coral banisters leads up. It is impossible to go - or -.\nIt seems a little clearer +.*\n"],
["You are in a narrow stairwell.",[0,17,0,0,30,1,0,0],"These dusty and decrepit stairs lead up.  There is no way -.  The\nhallway turns sharply -.**\n"],
["You are in the magazine.",[19,0,0,0,0,0,0,0],"Rows and rows of neatly stacked ammunition for laser pistols and grenade\nlaunchers are here. The armory is +.***\n"],
["You're in the presidential suite.",[0,20,0,0,0,0,0,0],"Apparently the president has been assassinated. A scorched figure lies\nface downward on the carpet clutching his chest.*\nThe hallway leads -.**\n"],
["You are in the dining hall.",[0,30,31,23,0,0,0,0],"This was the seen of a mass suicide. Hundreds of ambassadors and assorted\ndignitaries sit slumped over their breakfast cereal. I suppose the news\nof the cylon attack killed them. There is a strange chill in this room.  I\nwould not linger here. * The kitchen is +. Entrances + and +.\n"],
["The debris is very thick here.",[0,11,0,24,0,0,0,0],"Broken furniture, fallen girders, and other rubble block the way.\nThere is not much chance to continue -, -, or -.\nIt would be best to go -.\n"],
["You are in the kitchen.",[28,0,0,0,0,0,0,0],"This room is full of shining stainless steel and burnished bronze cookware. An \nassortment of tropical fruits and vegetables as well as fine meats and cheeses \nlies on a sterling platter. The chef, unfortunately, has been skewered like a \nside of beef. The dining room is +. ** There is a locked door +.\n"],
["You are in an arched entry leading to the dining room.",[0,0,0,28,0,0,0,0],"The door leading out is bolted shut from the outside and is very strong.***\nThe dining room is +.\n"],
["You are in space.",[33,34,35,36,37,1,33,1],"****\n"],
["You are in space.",[38,32,39,40,41,1,42,1],"****\n"],
["You are in space.",[32,44,45,46,47,1,48,1],"****\n"],
["You are in space.",[40,45,49,32,50,1,51,1],"****\n"],
["You are in space.",[41,46,32,52,53,1,54,1],"****\n"],
["You are in space.",[42,47,50,53,55,1,32,1],"****\n"],
["You are in space.",[43,48,51,54,32,1,56,1],"****\n"],
["You are in space.",[57,33,40,41,42,1,43,1],"****\n"],
["You are in space.",[39,35,57,33,58,1,59,1],"****\n"],
["You are in space.",[39,36,33,59,60,1,61,1],"****\n"],
["You are in space.",[39,37,58,60,62,1,33,1],"****\n"],
["You are in space.",[39,38,59,61,33,1,63,1],"****\n"],
["You are in space.",[34,64,45,46,47,1,48,1],"****\n"],
["You are in space.",[35,44,49,34,50,1,51,1],"****\n"],
["You are in space.",[36,44,34,52,53,1,54,1],"****\n"],
["You are in space.",[37,44,50,53,55,1,34,1],"****\n"],
["You are in space.",[38,44,51,54,34,1,56,1],"****\n"],
["You are in space.",[49,49,52,35,49,1,49,1],"****\n"],
["You are in space.",[58,47,49,37,55,1,35,1],"****\n"],
["You are in space.",[59,48,49,38,35,1,56,1],"****\n"],
["You are in space.",[52,52,36,49,52,1,52,1],"****\n"],
["You are in space.",[60,46,37,52,55,1,36,1],"****\n"],
["You are in space.",[61,48,38,52,36,1,56,1],"****\n"],
["You are in space.",[62,55,55,55,56,1,37,1],"****\n"],
["You are in space.",[56,56,56,56,38,1,55,1],"****\n"],
["You are in space.",[65,39,57,57,57,1,57,1],"****\n"],
["You are in space.",[39,50,49,42,62,1,40,1],"****\n"],
["You are in space.",[39,51,49,43,40,1,63,1],"****\n"],
["You are in space.",[39,53,43,59,62,1,41,1],"****\n"],
["You are in space.",[39,54,43,59,41,1,56,1],"****\n"],
["You are in space.",[39,55,62,62,56,1,42,1],"****\n"],
["You are in space.",[39,56,35,36,43,1,55,1],"****\n"],
["You are in space.",[44,66,66,66,66,1,66,1],"****\n"],
["You are in space.",[67,57,67,67,67,1,67,1],"****\n"],
["You are in space.",[64,68,68,68,68,1,68,1],"****\n"],
["You are orbiting a small blue planet.",[67,67,67,67,65,1,69,1],"****\n"],
["You are orbiting a tropical planet.",[68,68,68,68,66,1,70,1],"****\n"],
["You are flying through a dense fog.",[69,69,69,69,69,1,69,1],"A cold grey sea of mist is swirling around the windshield and water droplets\nare spewing from the wingtips. Ominous shadows loom in the darkness and it\nfeels as if a trap is closing around us. I have lost all sense of direction.\n****\n"],
["You are approaching an island.",[71,72,73,74,68,1,0,1],"Feather palms outlined by mellow moonlight and a silvery black ocean line\nthe perimeter of the island.  Mighty mountains of emerald and amethyst rise\nlike jagged teeth from black gums.  The land rises sharply +.  The shore\nline stretches on *+.*\n"],
["You are flying over a mountainous region.",[75,73,76,77,68,1,0,1],"Below is a shadow filled canyon with luminous waterfalls plummeting down beyond sight and looming spires and pinnacles.  **The ocean is +.*\n"],
["You are flying over the ocean.",[74,78,78,78,68,1,0,1],"You bank over the water and your wingtips dip low to the green waves.  The\nsea is very shallow here and the white coral beds beneath us teem with \nshadowy fish.****\n"],
["You are flying over the beach.",[71,72,79,74,68,1,80,1],"A warm gentle surf caresses the beach here. The land rises\nsharply +.* The beach is lost in low cliffs +.*\n"],
["You are flying over a large lagoon.",[81,72,73,82,68,1,0,1],"The water's brink winds tortuously inland.  There are some lights +.***\n"],
["You are flying over a gently sloping plane.",[83,71,84,85,68,1,0,1],"The ground appears to be choked with vegetation.*  The terrain is more\nrugged +.**\n"],
["You are flying through a gorge.",[0,0,86,71,68,1,102,1],"This is a narrow, steep sided canyon lined with plants.  The stars above\nglisten through the over hanging trees.  The gorge leads to the\nsea** +, and to a tumultuous origin +.\n"],
["You are flying over a plantation.",[85,81,71,88,68,1,89,1],"It might be possible to land here, but not in the dark.*  There are some lights\n+ and *+.\n"],
["You are over the ocean.",[72,78,79,74,68,1,0,1],"The deep green swells foam and roll into the shore **+*.\n"],
["You are flying along the coast.",[86,72,90,73,68,1,91,1],"The coastline here is very rocky. The surf in some places is violent\nand explodes in a shower of sparkling, moonlit spray. ****\n"],
["This is a beautiful coral beach.",[106,0,107,108,73,0,0,0],"Fine silver sand kissed lightly by warm tropical waters and illuminated\nby a huge tropical moon stretches at least 30 meters inland.\nGently swaying palm trees are +.***\n"],
["You are flying over a small fishing village.",[77,74,71,82,68,1,92,1],"A few thatched huts lit with torches and bonfires line a road below.\nThe road continues on ***+.\n"],
["You are flying over a clearing.",[88,72,74,87,68,1,93,1],"There is a dock here (big enough for a seaplane) leading to a clearing.\nThe still waters of the lagoon reflects our orange turbo thrusters.****\n"],
["You are flying over the shore.",[94,75,95,96,68,1,0,1],"Rocky lava flows have overtaken the beach here.****\n"],
["You are flying in a wide valley.",[95,97,86,75,68,1,98,1],"This is a shallow valley yet the floor is obscured by a thick mist.\nThe valley opens into blackness +. The mist grows thicker +.**\n"],
["You are flying near the shore.",[96,77,75,99,68,1,0,1],"Very tall trees growing in neatly planted rows march off from the \nwater here towards the hills and down to the flat lands *+.**\n"],
["You are flying around the very tip of the island.",[95,79,90,84,68,1,0,1],"Sheer cliffs rise several hundred feet to a tree covered summit. Far below,\nthe grey sea gnaws voraciously at the roots of these cliffs. The island bends\naround +** and +.\n"],
["You are flying along the coastline.",[99,82,88,100,68,1,101,1],"This is a narrow strip of sand lined with very few trees. The stars above\nflicker through wisps of clouds.  The beach continues on -.* There\nare some lights +.*\n"],
["You are flying over several cottages and buildings",[99,82,77,87,68,1,103,1],"Directly below is small ornate house lit up with spot lights and decorative\nbulbs.  A bell tower and a spurting fountain are nearby.  Small dirt roads go\n+ and +.**\n"],
["You are in a field of sugar cane.",[109,110,111,112,77,0,0,0],"These strong, thick canes give little shelter but many cuts and scrapes.\nThere are some large trees ***+.\n"],
["You are flying over the ocean.",[95,78,90,86,68,1,0,1],"The water is a placid ebony.****\n"],
["You are on the coast road.",[113,114,115,116,79,0,0,0],"The road winds close to the shore here.  The trees on either side press close\nin the darkness and seem to be watching us.**  The road continues -\nand -.\n"],
["You are on the main street of the village.",[117,118,119,120,81,0,0,0],"The natives are having a festive luau here.  Beautiful dancers gyrate in the\ntorchlight to the rhythm of wooden drums.  A suckling pig is sizzling in a\nbed of coals and ti leaves are spread with poi and tropical fruits.  Several\nnatives have come over to you and want you to join in the festivities.\nThere is a light burning in a bungalow +.***\n"],
["You are at the sea plane dock.",[121,122,123,124,82,0,0,0],"The clearing is deserted.  The grass is wet with the evening dew +.*\nThere is something set up +.*\n"],
["You are flying over the ocean.",[94,83,95,96,68,1,0,1],"The black waves surge off shore here.  The ocean becomes much calmer +.***\n"],
["You are flying along the coast.",[94,84,86,83,68,1,0,1],"The land is very low here with a river running into the sea +. There\nis a wide valley opening up +, but a strange mist is flowing out of it.\nThe very tip of the island is +.*\n"],
["You are flying along the coast.",[94,85,83,99,68,1,0,1],"The coast here is cluttered with rocky outcroppings.****\n"],
["You are lost in a sea of fog.",[97,104,97,97,97,1,0,1],"What have you gotten us into?\nI cant see a thing! ****\n"],
["You are on a gravel wash.",[125,126,127,128,84,0,0,0],"It is very dark here.  A cool breeze is blowing from +.  No moonlight can\nreach below a thick canopy of fog above.  The sound of cascading water is\ncoming from +.**\n"],
["You are flying over a wide beach.",[96,88,85,87,68,1,105,1],"There are some lighted buildings *+.  Some trees are growing +.*\n"],
["You are flying over the ocean.",[100,100,87,100,68,1,0,1],"The black waves surge and splash against the rocky shore.****\n"],
["You are on a narrow strip of sand.",[129,130,131,0,87,0,0,0],"Rather coarse sand makes this beach very steep and only a few meters wide.\nA fresh ocean breeze is rustling the ferns **+.*\n"],
["This is Fern Canyon.",[0,0,132,133,76,0,0,0],"Delicate waving ferns flourish here, suckled by warm water dripping from \nevery fissure and crevice in the solid rock walls.  The stars above sparkle\nthrough a thin mist.  The canyon winds **-, and -.\n"],
["This is the front lawn.",[134,135,136,137,88,0,0,0],"There is a small fountain lighted with green and yellow bulbs here where\nthe driveway meets the lawn.  Across the driveway, +, is an ornate white\nhouse lit with gas lamps.  A bell tower here is awash in pale blue.*  There\nis a road + which turns into the driveway.*\n"],
["You have just crossed the crest of a mountain.",[97,79,86,71,68,1,0,1],"The fog vanished mysteriously as we flew over the crest.*\nFar + I can see the ocean sparkling in the moonlight.**\n"],
["You are on a sandy beach.",[138,139,140,0,99,0,0,0],"Fine coral sand, a fresh sea breeze, and dramatic surf add to this beach's\nappeal.**  Stone steps lead to a lighted path in the gardens +.*\n"],
["You are among palm trees near the shore.",[141,80,142,143,73,0,0,0],"Arching coconut palms laden with fruit provide a canopy for the glistening\nwhite sand and sparse, dew covered grasses growing here. The forest grows\ndenser +.  Crickets are chirping loudly here.  The ocean is +.**\n"],
["You are walking along the beach.",[144,0,145,80,73,0,0,0],"The warm tropical waters nuzzle your ankles as you walk. Above is a gorgeous\nstarscape.  The battlestar must be up there somewhere.  The slope of the sand\nis so gentle that the surf only slides up the sand.** There are some rocks\n+.*\n"],
["You are walking along the beach.",[146,0,80,147,73,0,0,0],"The tide is out very far tonight, and it is possible to explore hidden rocks\nand caves not ordinarily accessible.  Rich beds of seaweed have been exposed\nto the cool night air.****\n"],
["You are in a papaya grove.",[148,89,149,150,77,0,0,0],"Slender trees with their large seven lobed leaves bulge with succulent fruit.\nThere are some tall trees +.***\n"],
["You are in a field of pineapple.",[89,151,152,153,77,0,0,0],"The sharp dagger like pineapple leaves can pierce the flesh and hold fast\na skewered victim with tiny barbs.* The field ends +.**\n"],
["You are in a field of kiwi plants.",[149,154,155,89,77,0,0,0],"Round hairy fruit hang from staked vines here. There are some trees +\nand +. The field ends in a road +.*\n"],
["You are in a large grove of coconuts.",[150,153,89,156,77,0,0,0],"These trees are much taller than any growing near the shore and the shadows\nare also deeper.  It's hard to keep my sense of direction.****\n"],
["You are in the woods.",[157,91,158,116,79,0,0,0],"Tropical undergrowth makes the going rough here. Sword ferns give no strong\nfoot hold and the dangling vines would gladly throttle one. The darkness is\nso intense here that we stand in utter blackness.****\n"],
["You are at the shore.",[91,0,159,145,79,0,160,0],"The low minus tide tonight might make it possible to climb down to a\nsmall cave entrance below.  Large rocks would usually churn the waves\nasunder.***  The beach goes -.\n"],
["You are on the coast road.",[158,161,162,91,79,0,0,0],"The road is beginning to turn slightly -.  I can here the surf +.  The road\ncontinues into the dark forest +.*\n"],
["The road winds deeper into the trees.",[163,142,91,164,79,0,0,0],"Only narrow moonbeams filter through the dense foliage above. The moist rich\nearth has nurtured a myriad of slugs, snakes, and spiders to grow here. The\nroad continues - and *- into the shadows.*\n"],
["This is the front porch of the bungalow.",[165,92,0,0,81,0,0,0],"The veranda is lit by a small yellow bug light.  The door leads -.\nThe stone walk down to the luau is lined with burning torches +.  That\nroast pig smells good.**\n"],
["You are on a path leading to the lagoon.",[92,166,167,168,81,0,0,0],"This path winds through the underbrush and towards the lagoon *+.  The\nbroad faced moon peeps though the branches above.  The sound of drums echos\nin the woods.**\n"],
["This is a dirt road.",[169,118,170,92,81,0,0,0],"**The road continues on - here for some distance. A bonfire and party light\nup the night sky +.\n"],
["You are on a dirt road.",[171,118,92,172,81,0,0,0],"**There is a village +. A huge bonfire licks at the trees, and a celebration\nof some sort is going on there.  The smell of luscious cooking is tantalizing\nmy flared nostrils.  The road continues +.\n"],
["You are on a dirt road.",[173,93,174,175,82,0,0,0],"This is a wide grassy clearing bedewed with droplets of evening mist.  The\ntrees alongside the road moan and whisper as we pass.  They seem annoyed at\nour presence.  **The road continues - and -.\n"],
["You are at the seaplane dock.",[93,0,176,177,82,0,0,0],"Not a living thing stirs the calm surface of the lagoon.  The wooden planks\ncreak unnaturally as we tread on them.  The dock reaches a clearing +.\nA dark trail leads around the lagoon **+.\n"],
["There are some tables on the lawn here.",[121,122,123,93,82,0,0,0],"Some tables are strewn on the wet lawn.****\n"],
["You are nosing around in the bushes.",[124,124,93,124,82,0,0,0],"There is little here but some old beer cans. It is damp and dirty in here.\nI think I stepped in something unpleasant. It would be best to go **-.*\n"],
["You are walking in a dry stream bed.",[178,98,179,0,84,0,0,0],"The large cobblestones are difficult to walk on.  No starlight reaches\nbelow a black canopy of fog seemingly engulfing the whole island.  A dirt\npath along the wash is **+.  The high bank is impossible to climb +.\n"],
["You are at the thermal pools.",[98,0,180,181,84,0,0,0],"Odd spluttering and belching water splashes up around the rocks here.\nA spectacular waterfall nearby tumbles down as a river of effervescent\nbubbles.  The air is quite warm and a cave entrance ***+ spews steam.\n"],
["You are in the woods.",[127,180,182,98,84,0,0,0],"It is pitch black in the forest here and my pant leg is caught on something.\nThere may be poison oak here.  What was that?  A lantern just flickered by in\nthe dark!  The sound of rushing water is coming from *+.**\n"],
["You are on a dirt trail.",[179,181,98,0,84,0,0,0],"The trail seems to start here and head towards the forest +.**  High, dark\ncliffs border the trail +.  Some crickets are chirping noisily.\n"],
["You are  walking along the beach.",[183,101,184,0,87,0,0,0],"The surf is rather tame tonight.  The beach continues + and +.**\n"],
["You are walking along the beach.",[101,185,186,0,87,0,0,0],"This is not a very nice beach. The coarse sand hurts my feet.****\n"],
["You are walking through some ferns.",[184,186,187,101,87,0,0,0],"This is a wide field growing only ferns and small shrubs.**  In the dark\nit would be all to easy to stumble into a venomous snake.  The ocean is\n*+.\n"],
["You are in a narrow canyon.",[0,0,188,102,76,0,0,0],"The steep sides here squeeze a little freshet through a gauntlet like\nseries of riffles and pools.  The cool mountain air is refreshing.****\n"],
["The canyon is much wider here.",[0,0,102,189,76,0,0,0],"The sheer rock walls rise 10 meters into darkness. A slender waterfall\ncareens away from the face of the rock high above and showers the gravel\nfloor with sparkling raindrops.**  The canyon continues -\nand -.\n"],
["You are on the front porch of the cottage.",[190,103,0,0,0,0,0,0],"The veranda is deserted.  A table and chair are the only things on the porch.\nInside the house is a parlor lighted with an elegant chandelier.  The door\nleads -.  The lawn and fountain are +.**\n"],
["You are in a palm grove.",[103,191,192,105,88,0,0,0],"Crickets are chirping in the cool night air.****\n"],
["You are on a dirt road.",[193,192,245,103,88,0,0,0],"There are many bright lights +.  The road cleaves the darkness +.\nA small dirt road goes -, and a drive way peals off +.\n"],
["You are in a field of small shrubs.",[184,186,103,187,88,0,0,0],"**Pine and other coniferous saplings are growing here.  The rich brown\nsoil is well watered.  Across a large lawn +, there is a small cottage lighted\nwith spot lights and gas lamps.  A cool land breeze is blowing.*\n"],
["The beach is pretty rocky here.",[194,105,195,0,96,0,0,0],"The tide is very low tonight.  The beach is nicer *+.**\n"],
["The beach is almost 10 meters wide here.",[105,183,196,0,99,0,0,0],"The sand has become more coarse and the beach steeper.****\n"],
["You are in the gardens.",[195,196,197,105,99,0,0,0],"Shadowy expanses of lawn and leaf have been groomed and manicured here.\nThe night sky is glowing with a full moon.**  A lighted path leads -.\nStone steps lead down to the beach +.\n"],
["You are on the coast road.",[198,106,163,199,73,0,0,0],"The forest is dense on either side.  The trees seem to be actually squeezing\ntogether to keep us from passing.  A feeling of emnity is in the air.**\nThe road continues - and -.\n"],
["You are in the forest.",[116,107,91,106,73,0,0,0],"I suppose there are trees and ferns all around, but it is too dark to see.****\n"],
["You are in the forest.",[199,108,106,146,73,0,0,0],"There are shadowy trees and ferns all around.****\n"],
["You are in a copse.",[142,107,145,80,0,0,0,0],"This is a secret hidden thicket only noticeable from the beach.  In the\nmoonlight, I can tell that someone has been digging here recently.****\n"],
["You are at the tide pools.",[91,0,114,107,79,0,0,0],"These rocks and pools are the home for many sea anemones and crustaceans.\nThey are exposed because of the low tide.  There is a beach ***+.\n"],
["You are in the forest.",[199,108,143,0,73,0,0,0],"This is a shallow depression sheltered from the wind by a thick growth of \nthorny shrubs.  It looks like someone is camping here.  There is a fire pit\nwith warm, crackling flames and coals here.*  The beach is +.*  The thorny\nshrubs block the way -.\n"],
["You are at the mouth of the lagoon.",[200,0,108,201,74,0,0,0],"The beach ends here where the coral reef rises to form a wide lagoon.\nA path winds around the lagoon to the -.* The beach continues\non -. Only water lies +.\n"],
["You are in a breadfruit grove.",[202,109,203,204,77,0,0,0],"The tall trees bend leisurely in the breeze, holding many round breadfruits\nclose to their large serrated leaves.  There are coconut palms +,\n*+, and +.\n"],
["You are in a grove of mango trees.",[203,111,205,109,77,0,0,0],"The trees are not tall enough to obscure the view and the bright moonlight\nmakes it fairly easy to see.****\n"],
["You are in a grove of coconut palms.",[204,112,109,206,77,0,0,0],"All I can see around us are trees and ominous shapes darting in and out of the\nshadows.****\n"],
["You are in a coconut grove.",[110,207,208,209,77,0,0,0],"There are countless trees here.****\n"],
["You are in a field of pineapple.",[154,208,210,110,77,0,0,0],"The sharp leaves are cutting me to ribbons. There is a road **+.*\n"],
["You are in a coconut grove.",[112,209,110,211,77,0,0,0],"There is a field of something **+.*\n"],
["You are on the edge of a kiwi and pineapple field.",[111,152,155,110,77,0,0,0],"An irrigation ditch separates the two fields here. There is a road **+.*\n"],
["This is a dirt road.",[205,210,212,111,77,0,0,0],"The road runs - and - here.  It is very dark in the forest.**\n"],
["You are in a palm grove.",[206,211,112,213,77,0,0,0],"There are trees all around us.****\n"],
["You are on the edge of a small clearing.",[157,113,157,157,79,0,0,0],"The ground is rather marshy here and the darkness is intense.  A swarm of\nravenous mosquitoes has descended upon you and has sent you quaking to your\nknees.****\n"],
["You are in the woods.",[158,115,215,113,79,0,0,0],"You have walked a long way and found only spider webs. ****\n"],
["You are walking along the shore.",[115,0,214,114,86,0,0,0],"You are now about 10 meters above the surf on a gently rising cliffside.**\nThe land rises +. There is a beach far +.\n"],
["You are just inside the entrance to the sea cave.",[246,114,0,0,114,1,0,0],"The sound of water dripping in darkness and the roar of the ocean just outside\ncreate a very unwelcoming atmosphere inside this cave. Only on rare occasions\nsuch as this is it possible to enter the forbidden catacombs... The cave\ncontinues -.***\n"],
["You are in a secret nook beside the road.",[115,159,162,91,79,0,0,0],"This little thicket is hidden from the road in the shadows of the forest.\nFrom here we have a clear view of any traffic along the road. A great hollow\ntree stuffed with something is nearby.  The road is +.***\n"],
["You are on the coast road.",[215,214,0,115,86,0,0,0],"The road turns abruptly - here, wandering deeper into the black forest.***\n"],
["You are on a dirt road.",[216,116,113,141,79,0,0,0],"We are walking through a tunnel of unfriendly trees and shrubs.  The tall\nones bend over the roadway and reach down with their branches to grab us.\nBroad leafed plants at the roadside whisper in the darkness.  Something\njust darted across the road and into the bushes *+.  Let's go *-.\n"],
["You have discovered a hidden thicket near the road.",[163,142,116,106,73,0,0,0],"I would think it best to stay n the road.  The forest seems very unfriendly\nat night.  The road is **+.*\n"],
["You are in the living room.",[0,117,217,218,0,0,0,0],"A decorative entry with fresh flowers and wall to wall carpeting leads into\nthe living room here where a couch and two chairs converse with an end table.\n*The exit is +.* The bedroom is +.\n"],
["You are at the lagoon.",[118,0,167,168,81,0,0,0],"A small beach here is deserted except for some fishing nets.  It is very\npeaceful at the lagoon at night.  The sound of native drums is carried on\nthe night breeze.  There are paths leading off into darkness +,\n*+, and +.\n"],
["You are at the lagoon.",[118,0,170,166,81,0,0,0],"The grass near the water is moist with the refreshing evening dew.  Far away,\ndrums reverberate in the forest.**  The path continues + and +.\n"],
["You are at the lagoon.",[118,0,166,172,81,0,0,0],"The path meanders through shadows of tussocks of grass, ferns, and thorny\nbushes here and continues on **- and -.\n"],
["You are in the woods.",[219,119,220,92,81,0,0,0],"There are plenty of ferns and thorny bushes here! Spider webs and probing\nbranches snare us as we stumble along in the pitch black night.****\n"],
["You are on a dirt road.",[220,167,199,119,74,0,0,0],"The road winds rather close to a large lagoon here and many sedges and tall\nloom in the darkness *+. The road continues - and -.\n"],
["You are in the woods beside the road.",[221,120,92,222,81,0,0,0],"The forest grows darker +. The road is +.**\n"],
["The road crosses the lagoon here.",[222,0,120,174,81,0,0,0],"Strange mists rising from the water engulf a rickety old enclosed bridge here.\nSpider webs catch our hair as we pass through its rotting timbers.  I felt\nsomething drop on my neck.  The road delves into the accursed forest\n**+ and +.\n"],
["You are in a coconut palm grove.",[223,121,224,225,82,0,0,0],"The tall palms are planted about 30 feet apart and the stary sky is clearly\nvisible above.  A low growing grass carpets the ground all around.  The grove\ncontinues +.***\n"],
["You are walking along a dirt road.",[224,176,172,121,82,0,0,0],"You are near misty patch of the roadway **+.  The road continues -.\n"],
["You are on a dirt road.",[225,177,121,226,82,0,0,0],"The road turns abruptly - here, splitting a grove of palm trees.* In the\nstarlight I can also discern that the road continues - toward the lagoon.*\n"],
["You are on a trail running around the lagoon.",[172,0,0,122,82,0,0,0],"The dark waters brush the trail here and the path crosses an old  bridge\n+.  There is deep water + and +. The trail continues -.\n"],
["This is the mouth of the lagoon.",[175,0,122,227,82,0,0,0],"The coral reef wraps around a natural bay here to create a wide lagoon which\nwinds tortuously inland.**  A trail goes around the lagoon +.\nThe beach is -.\n"],
["You are in a dry stream bed.",[0,125,0,0,84,0,0,0],"The dry wash drains over a tall precipice here into a turbid morass below. The\nmost noisome stench imaginable is wafting up to defile our nostrils. Above,\nthe blackness is intense and a strange mist engulfs the island.*  Let's go\n-.**\n"],
["You are on a dirt path along the wash.",[0,128,125,228,84,0,0,0],"The trail winds along the gravel wash and delves into the forest ***+.\n"],
["The thermal pools flow into a stream here.",[127,0,229,126,84,0,0,0],"The gurgling hot waters pour over boulders into a swiftly flowing\nstream **+. The pools are +.\n"],
["You are at the entrance to a cave.",[128,230,126,0,84,0,0,0],"A torch lights the entrance to the cave.  Deep inside I can see shadows moving.\nA path goes + from here.  The entrance is +.**\n"],
["You are in the woods.",[182,229,182,127,84,0,0,0],"Thorns tangle your every effort to proceed.*  The sound of rushing water is\n+.**\n"],
["You are walking along the beach.",[139,129,184,0,99,0,0,0],"Some dunes here progress inland and make it impossible to get very far in that\ndirection.  The beach continues - and -.*  The ocean is +.\n"],
["You are in the dunes.",[183,101,184,129,87,0,0,0],"The endless rolling and pitching sand dunes are enough to make one very queasy!\nThe sand is cool and the stars are bright at the ocean.  The only way I'm going\nis ***+.\n"],
["This is a lousy beach.",[130,0,0,0,87,0,0,0],"Volcanic and viciously sharp bitted grains of sand here bite like cold steel\ninto my tender feet. I refuse to continue on. Let's get out of here. The\nbeach is better +.***\n"],
["You are in a field of sparse ferns.",[131,185,187,130,87,0,0,0],"The lava rock outcroppings here will support few plants. There is more \nvegetation +.**  The ocean is +.\n"],
["You are in the woods.",[131,131,137,131,87,0,0,0],"Young trees and tall shrubs grow densely together here.\nThey grow thicker **+.*\n"],
["The canyon is no wider than a foot here.",[0,0,0,132,0,0,0,0],"The freshet is gushing through the narrow trough, but the canyon has grown\ntoo narrow to follow it any farther.***  I guess we'll have to go -.\n"],
["You are in a narrow part of the canyon.",[0,0,133,232,76,0,0,0],"The two sheer sides are no more than a few meters apart here. There is a stone\ndoor in the wall +. The gravelly floor runs with tiny rivulets seeping \nfrom the ground itself.* The canyon continues - and -.\n"],
["You are in the drawing room.",[0,134,0,0,0,0,0,0],"Exquisitely decorated with plants and antique furniture of superb\ncraftsmanship, the parlor reflects its owners impeccable taste.  The tropical\nnight air pours in through open shutters *+.  There doesn't seem \nto be anybody around.  A large immaculate oaken desk is visible in the\nstudy and it even has a old fashioned telephone to complete the decor.**\n"],
["You are in a palm grove.",[135,191,233,191,88,0,0,0],"Grassy rows of dew covered palms stretch as far as I can see.**\nThere is a road +.*\n"],
["You are on a dirt road.",[136,233,234,135,88,0,0,0],"The road winds through a coconut palm grove here. It continues on - \nand -.**\n"],
["The road leads to several large buildings here.",[235,136,236,237,88,0,0,0],"There is a lighted clubhouse +,* a large barn and stable +, and a\ngarage of similar construct to the barn +.\n"],
["This part of the beach is impassable.",[0,138,0,0,96,0,0,0],"The see is calm tonight.  The beach goes *-.**\n"],
["You are in the gardens.",[195,140,197,138,96,0,0,0],"Dew beaded grass sparkles in the moonlight.  Tiny lamps beside the path light\nthe way to the ocean ***+.\n"],
["You are in the gardens.",[140,183,197,139,99,0,0,0],"Beautiful flowers and shrubs surround a lighted goldfish pond.****\n"],
["You are on a stone walk in the garden.",[195,196,238,140,99,0,0,0],"The walk leads to a road **+.*\n"],
["You are in the forest near the road.",[198,141,216,198,73,0,0,0],"There are many thorny bushes here!****\n"],
["You are at a fork in the road.",[239,146,141,170,73,0,0,0],"Two roads come together in the darkness here. One runs -,* the other \nruns - and -.\n"],
["You are on a dirt path around the lagoon.",[170,147,146,0,74,0,0,0],"The still waters reflect bending palms and a stary sky. It looks like\nthe path runs into a clearing +. The path continues -.**\n"],
["You are drowning in the lagoon.",[201,201,147,201,74,0,0,0],"I suggest you get out before you become waterlogged.****\n"],
["You are in a coconut palm grove.",[202,148,203,204,77,0,0,0],"****\n"],
["You are in a palm grove.",[202,149,205,148,77,0,0,0],"****\n"],
["You are in a palm grove.",[202,150,148,206,77,0,0,0],"****\n"],
["You are on a dirt road.",[203,155,212,149,77,0,0,0],"*This road ends here at a palm grove but continues on - for quite\nsome way.**\n"],
["You are in a coconut palm grove.",[204,156,150,213,77,0,0,0],"****\n"],
["You are in a coconut grove.",[151,219,208,209,77,0,0,0],"*The grove ends +.**\n"],
["You are in a coconut grove.",[152,207,239,151,77,0,0,0],"**There is a dirt road +.*\n"],
["You are in a coconut grove.",[153,207,151,211,77,0,0,0],"****\n"],
["This is a dirt road.",[205,239,212,154,77,0,0,0],"The road continues - and -.**\n"],
["You are in a coconut grove.",[153,209,153,213,77,0,0,0],"****\n"],
["You are in the woods near the road.",[205,210,212,155,77,0,0,0],"There are many thorny bushes here!****\n"],
["You are in a coconut grove.",[213,213,156,234,88,0,0,0],"***The grove ends in a clearing +.\n"],
["You are walking along some high cliffs.",[162,0,0,159,86,0,0,0],"The island bends sharply + here with high cliffs -\nand -. The cliffs are lower +.\n"],
["You are at the coast road turn around.",[0,162,0,158,90,0,0,0],"The coast road ends here in a lookout with a view of the ocean.\nFar below, the waves crash against the rocks.\n****\n"],
["You are in the woods near the road.",[216,163,216,198,79,0,257,0],"These thorny bushes are killing me.****\n"],
["You are in the kitchen.",[0,0,0,165,0,0,0,0],"A small gas stove and a refrigerator are all the only appliances here. The\ngas oven has been left on and the whole room is reeking with natural gas.\nOne spark from a match and.... The door out is ***+.\n"],
["You are in the bedroom.",[0,0,165,0,0,0,0,0],"A soft feather comforter on top of layers of Answer blankets make this a very\nluxurious place to sleep indeed. There are also some end tables and a dresser\nhere.** The living room is +.*\n"],
["You are in the woods.",[207,169,220,221,81,0,0,0],"The darkness is intense, but there seems to be a clearing +.***\n"],
["You are in the woods near the road.",[219,170,239,169,81,0,0,0],"*As far as I can tell, there are two roads + and +.*\n"],
["You are in the woods.",[207,171,219,222,81,0,0,0],"The spider webs thin out and the forest is clearer +.***\n"],
["You are on the lagoon's inland finger.",[0,172,171,172,81,0,0,0],"It is impossible to follow the lagoon any farther inland because of sharp\nand very painful sedges.* The road is +.**\n"],
["You are in a grassy coconut grove.",[240,173,224,241,82,0,0,0],"The tall palms provide a ghostly canopy for the sandy ground covering.****\n"],
["You are near the lagoon's inland finger.",[0,174,0,173,82,0,0,0],"Very sharp sedges make it impossible to follow the lagoon any farther inland.\n*There is a road +.**\n"],
["You are on a dirt road.",[241,175,173,226,82,0,0,0],"The road winds through a coconut grove here and continues - and -.**\n"],
["You are in the woods near the road.",[226,226,175,226,82,0,0,0],"**The road is +.*\n"],
["This is a beach?",[227,227,177,0,82,0,0,0],"Hard jagged rocks that pierce with every footstep hardly comprise a beach.**\nLet's go -.*\n"],
["The trail is lost in the woods here.",[241,241,179,241,84,0,0,0],"The trail goes **-.*\n"],
["You are on the bank of a stream.",[182,0,242,180,84,0,0,0],"The stream falls over several small boulders here and continues on **-.*\n"],
["You are just inside the cave.",[181,267,0,0,0,0,0,0],"A steamy hot breath is belching from the depths of the earth within.* The\ncave  continues -.**\n"],
["You are just inside the cave entrance.",[274,0,0,0,0,0,0,0],"The air is hot and sticky inside. The cave continues -. There is a \nstone door in the wall +.  A wooden sign in the dust warns in old elven\nrunes, \"GSRF KDIRE NLVEMP!\".**\n"],
["You are at the edge of a huge chasm.",[0,0,189,0,76,0,0,0],"Several hundred feet down I can see the glimmer of placid water. The\nrivulets drain over the edge and trickle down into the depths. It is \nimpossible to climb down.**  The canyon continues -.*\n"],
["You are on a dirt road.",[192,241,240,191,88,0,0,0],"The road winds through a coconut grove here. The road continues on into the\nshadows - and -.**\n"],
["You are in a coconut palm grove near the road.",[193,233,213,192,88,0,0,0],"***The road is +.\n"],
["You are at the clubhouse.",[0,193,0,0,0,0,0,0],"The clubhouse is built over the most inland part of the lagoon.  Tropical\nbananas and fragrant frangipani grow along the grassy shore.  Walking across\nthe short wooden bridge, we enter. Along one wall is a bar crowded with people.\nThe restaurant and disco dance floor are filled to capacity.  A rock group\nelectrocutes itself to the satisfaction of the audience.****\n"],
["You are in the stables.",[0,0,0,193,0,0,0,0],"Neighing horses snacking on hay and oats fill the stalls on both sides of\nthe barn.  It is rather warm in here but that is not the most offensive\npart.****\n"],
["You are in the old garage.",[0,0,193,0,0,0,0,0],"This is an old wooden building of the same vintage as the stables.  Beneath\na sagging roof stand gardening tools and greasy rags.  Parked in the center\nis an underpowered Plymouth Volare' with a red and white striped golf cart\nroof. ****\n"],
["You are on a dirt road.",[197,197,243,197,85,0,0,0],"The road leads to a formal garden laced with lighted stone walks and tropical\nflowers and trees.** The road continues -. A walk leads -.\n"],
["You are on a dirt road.",[210,199,198,220,73,0,0,0],"The road runs - and -.**\n"],
["You are in a coconut grove near the road.",[234,223,234,233,88,0,0,0],"***The road is +.\n"],
["You are on a dirt road.",[233,225,223,226,82,0,0,0],"The road continues - and -.**\n"],
["The stream plummets over a cliff here.",[182,0,0,229,84,0,0,0],"Falling 10 agonizing meters into darkness, only droplets of the stream must\nbe left to dance off the floor below.  There is no way down, even with a\nstrong rope. ****\n"],
["You are on a dirt road.",[0,0,244,238,85,0,0,0],"**The road continues - and -.\n"],
["You are on a dirt road.",[0,245,0,243,88,0,0,0],"*The road continues -* and -.\n"],
["You are on a dirt road.",[244,234,213,136,88,0,0,0],"The road goes -* and *-.\n"],
["You are in a low passage.",[247,160,0,0,0,0,0,0],"The ceiling here sparkles with iridiscent gems and minerals. Colorful starfish\nand sea anemones cling to the slippery walls and floor.  The passage continues\n+.***\n"],
["The walls are very close together here.",[248,246,0,0,0,0,0,0],"I can barely squeeze through the jagged opening. Slimy sea weeds provide\nno footing at all. This tunnel seems to be an ancient lava tube.  There is\na large room +.***\n"],
["You are in the cathedral room.",[249,247,250,251,0,0,0,0],"Your light casts ghostly shadows on the walls but cannot pierce the \nengulfing darkness overhead. The sound of water dripping echoes in the void.\n*I can see no passages leading out of this room.*** \n"],
["You are walking through a very round tunnel.",[252,248,0,0,252,1,0,0],"The round walls of this tunnel are amazingly smooth to the touch. A little\ntrickle of water flows down the center.  The tunnel climbs steadily +.\nThere is a large room +.**\n"],
["You are in the cathedral anteroom.",[0,0,0,248,253,1,0,0],"This small chamber with a flat stone floor is to one side of the cathedral \nroom. We appear to be at the bottom of a tall narrow shaft. There are many \npuddles of water here. A staircase hewn from solid rock and black lava \nleads up.***  The cathedral room is -.\n"],
["You are in a wide chamber.",[0,0,248,254,0,0,0,0],"Water is sprinkling from the ceiling here. A shallow pool populated by a \nmyriad of blind white creatures sparkles in your light. Tiny shrimp and\ncrabs scurry away, frightened by the blinding rays.**  The cave \ncontinues + and +.\n"],
["You are at the top of a sloping passage.",[0,249,255,256,257,1,249,0],"There is much algae growing here, both green and brown specimens. I suspect\nthat we are near the high tide zone, but no light can get in here. The walls\nglisten with shiny minerals.**  A hallway here runs + and -.\n"],
["You are in an elaborately tiled room.",[0,0,258,0,0,0,250,0],"Large colorful tiles plate the floor and walls.  The ceiling is a mosaic\nof gems set in gold.  Hopefully it is only our footsteps that are echoing in\nthis hollow chamber.**  The room continues -.  A stone staircase leads\ndown.*\n"],
["You are at a dead end.",[0,0,251,0,0,0,0,0],"The walls here are alive with dark mussels.  They click their shells menacingly\nif we disturb them.**  The only exit is +.*\n"],
["The tunnel is very low here.",[0,0,259,252,0,0,0,0],"You practically have to crawl on your knees to pass through this opening.  The\nair is stiflingly damp, but you can't hear any sounds of water dripping.**\nThe crawlspace continues -.  The tunnel seems wider +.\n"],
["This is the supply room.",[0,0,252,0,0,0,0,0],"Picks and shovels line the walls here, as well as hard hats, boxes of\ndynamite, and a cartload of very high grade gold and silver ore.** \nA tunnel leads off +.*\n"],
["You have found a secret entrance to the catacombs",[0,0,0,0,216,1,252,0],"Below is a wet, seaweed covered floor.  Above is a way out.****\n"],
["You are in the catacombs.",[0,0,260,253,0,0,0,0],"Ornate tombs and piles of treasure line the walls.  Long spears with many\nblades, fine swords and coats of mail, heaps of coins, jewelry, pottery, \nand golden statues are tribute past kings and queens.** The catacombs\ncontinue - and -.\n"],
["You are crawling on your stomach.",[0,0,261,255,0,0,0,0],"The passage is quite narrow and jagged, but the rock is no longer lava.\nIt appears to be a form of granite.**  The crawlspace continues -, \nbut I would just as soon go -.\n"],
["You are in the Sepulcher.",[0,0,0,258,0,0,0,0],"A single tomb is here.  Encrusted with diamonds and opals, and secured with \nstraps of a very hard, untarnished silver, this tomb must be of a great king.\nVases overflowing with gold coins stand nearby.  A line of verse on the wall\nreads, \"Three he made and gave them to his daughters.\"****\n"],
["The passage is wider here.",[0,0,0,259,0,0,262,0],"A ladder goes down into darkness here.***  A small crawlspace goes -.\n"],
["You are at the bottom of a ladder.",[0,0,0,0,261,1,263,0],"This is a narrow platform to rest on before we continue either up or down this\nrickety wooden ladder.****\n"],
["You are standing in several inches of water.",[264,0,265,266,262,1,0,0],"This seems to be a working mine. Many different tunnels wander off following\nglowing veins of precious metal.  The floor is flooded here since we must\nbe nearly at sea level.  A ladder leads up.****\n"],
["The tunnel here is blocked by broken rocks.",[0,263,0,0,0,0,0,0],"The way is blocked, but if you had some dynamite, we might be able to blast our\nway through.*  The passage goes -.**\n"],
["The tunnel is too flooded to proceed.",[0,0,0,263,0,0,0,0],"Hidden shafts could swallow us if we tried to continue on down this tunnel.\nThe flooding is already up to my waist.  Large crystals overhead shimmer\nrainbows of reflected light.***  Let's go -.\n"],
["The mine is less flooded here.",[0,0,263,0,0,0,0,0],"A meandering gold laden vein of quartz and blooming crystals of diamonds\nand topaz burst from the walls of the cave.  A passage goes -.***\n"],
["You are inside the cave.",[230,268,0,0,0,0,0,0],"A hot steam swirls around our heads, and the walls are warm to the touch.\nThe trail winds - and -.**\n"],
["You are in a rather large chamber.",[267,0,0,269,0,0,269,0],"Beds of ferns and palm leaves make several cozy nests along the walls. In the\ncenter of the room is a throne of gold and silver.***  A passageway leads\ndown and +.\n"],
["You are walking along the edge of a huge abyss.",[0,0,268,0,268,1,270,0],"Steam is rising in great clouds from the immeasurable depths.  A very narrow\ntrail winds down.**  There is a tunnel -.*\n"],
["You are on the edge of a huge abyss.",[0,0,0,0,269,1,271,0],"The trail winds farther down.****\n"],
["You are winding your way along the abyss.",[0,0,0,0,270,1,272,0],"The trail continues up and down.****\n"],
["You are on a wide shelf near the steamy abyss.",[0,273,0,0,271,1,0,0],"The stifling hot cave seems even hotter to me, staring down into this misty \nabyss.  A trail winds up.*  A passageway leads -.**\n"],
["You are in a wide tunnel leading to a fuming abyss.",[272,274,0,0,0,0,0,0],"The passageway winds through many beautiful formations of crystals and\nsparkling minerals.  The tunnel continues - and -.**\n"],
["You are in a tunnel.",[273,231,0,0,0,0,0,0],"It is very warm in here.  The smell of steam and hot rocks permeates the place.\nThe cave continues - and -.**\n"],
["You are at the bottom of a pit.",[0,0,0,0,232,0,0,0],"At the top of the pit, a single star can be seen in the night sky.  There\ndoesn't appear to be any way to get out without a rope.  I don't remember\nhow we got here.****\n"]
];
var DAYOBJS=[[236,59],[237,60],[275,61],[275,62],[275,63],[260,36],[266,49],[235,50],[51,51],[59,51],[48,51],[66,52],[65,52],[19,54],[167,58],[21,0],[30,0],[30,5],[260,1],[70,2],[71,2],[72,2],[73,2],[74,2],[75,2],[76,2],[77,2],[78,2],[79,2],[81,2],[82,2],[83,2],[84,2],[85,2],[86,2],[87,2],[88,2],[90,2],[95,2],[96,2],[97,2],[99,2],[100,2],[104,2],[172,3],[172,20],[172,21],[146,34],[146,31],[146,9],[190,4],[190,45],[142,6],[258,7],[258,8],[21,10],[7,11],[216,13],[64,14],[36,14],[49,14],[8,16],[13,17],[20,22],[126,23],[26,25],[256,25],[237,26],[237,32],[218,28],[164,29],[137,30],[11,36],[24,37],[235,37],[93,38],[109,39],[110,40],[152,40],[154,40],[111,41],[149,43],[112,42],[150,42],[151,42],[153,42],[192,42],[204,42],[207,42],[209,42],[213,42],[240,42],[218,44],[130,46],[93,47],[268,12]];
var NIGHTOBJS=[[218,15],[235,58],[92,39],[92,40],[92,41],[92,43],[92,58],[92,38],[181,12],[236,12],[92,12],[216,3],[216,20],[216,21],[168,3],[168,20],[168,21],[170,3],[170,20],[170,21],[124,9],[124,31],[124,34],[144,9],[144,31],[144,34],[113,9],[113,31],[113,34],[161,9],[161,31],[161,34],[169,9],[169,31],[169,34],[182,9],[182,31],[182,34],[198,9],[198,31],[198,34],[212,9],[212,31],[212,34],[216,9],[216,31],[216,34],[226,9],[226,31],[226,34],[228,9],[228,31],[228,34],[68,14],[144,30],[249,35],[250,35],[93,39]];
var OBJWT=[1,5,0,10,15,2,10,10,3,5,50,2500,2,1,100,1,2,1,1,1,60,10,5,0,50,5,15,5,1,20,10,10,0,0,0,0,1,0,0,1,1,1,2,1,0,0,0,0,0,0,100,0,0,0,55,47,50,45,45,100,2000,30,20,10];
var OBJCUMBER=[1,5,0,150,10,1,5,2,2,1,5,10,1,1,10,1,1,1,1,1,7,5,4,0,0,1,1,1,1,5,4,4,1,0,0,0,1,0,0,1,1,1,3,1,0,0,1,0,0,0,10,0,0,0,7,8,10,8,8,10,10,3,1,2];
var OBJDES=[
"There is a knife here",
"There is an exquisitely crafted sword and scabbard here.",
null,
"There is a fierce woodsman here brandishing a heavy mallet.",
"There is an unweildly two-handed sword here.",
"There is a bloody meat cleaver here.",
"A rusty broadsword is lying here.",
"There is an ancient coat of finely woven mail here.",
"There is a old dented helmet with an ostrich plume here.",
"There is a shield of some native tribe here.",
"The maid's body is lying here. She was murdered!",
"There is a Viper ready for launch here.",
"A kerosene lantern is burning luridly here.",
"An old pair of shoes has been discarded here.",
null,
"There is a pair of pajamas here.",
"A kingly robe of royal purple and spun gold is draped here.",
"There is a strange golden amulet on the floor here.",
"A medallion of solid gold shimmers on the ground nearby.",
"A talisman of gold is lying here.",
"A dead woodsman has fallen here. He was savagely murdered.",
"A heavy wooden mallet lies nearby.",
"There is a laser pistol here.",
"A flower-like young goddess is bathing in the hot mineral pools. She is \nwatching you, but continues to steep and sing softly.",
"The goddess is reclining on a bed of ferns and studying you intently.",
"There is a grenade here",
"There is a length of heavy chain here.",
"There is a stout rope here.",
"There is a pair of Levi's here.",
"A bloody mace is lying on the ground here.",
"There is a shovel here.",
"A long, sharp halberd is propped up here.",
"There is a compass here",
"Wreckage and smoldering debris from a crash litter the ground here.",
"A woodland Elf armed with a shield and deadly halberd lunges toward you!",
"I think I hear footsteps behind us.",
"There are a few coins here.",
"There are some matches here.",
"An unctuous man in a white suit and a dwarf are standing here.",
"There are some ripe papayas here.",
"There is a ripe pineapple here.",
"There are some kiwi fruit here.",
"There are some coconuts here.",
"There is a ripe mango here.",
"There is a sparkling diamond ring here.",
"There is a colorful pink potion in a small crystal vial here.",
"A gold bracelet is on the ground here.",
"A swarthy woman with stern features pulls you aside from the crowd,\n'I must talk to you -- but not here.  Meet me at midnight in the gardens.'",
"The swarthy woman has been awaiting you anxiousy. 'I must warn you that the\nIsland has anticipated your Quest.  You will not be welcomed. The Darkness is\nstrong where you must search.  Seek not the shadows save only at night, for\nthen are they the weakest.  In the mountains far from here a canyon winds\nwith ferns and streams and forgotten vines.  There you must go. Take this\nrope.'",
"Out from the shadows a figure leaps!  His black cape swirls around, and he\nholds a laser sword at your chest.  'So, you have come to fulfill the Quest.\nHa! Your weapons are no match for me!'",
"An old timer with one eye missing and no money for a drink sits at the bar.",
"You are flying through an asteroid field!",
"A planet is nearby.",
"The ground is charred here.",
"There is a thermonuclear warhead here.",
"The fragile, beautiful young goddess lies here.  You murdered her horribly.",
"The old timer is lying here.  He is dead.",
"The native girl's body is lying here.",
"A native girl is sitting here.",
"A gorgeous white stallion is standing here.",
"The keys are in the ignition.",
"A pot of pearls and jewels is sitting here.",
"A bar of solid gold is here.",
"There is a 10 kilogram diamond block here."
];
var OBJSHT=[
"knife",
"fine sword",
null,
"Woodsman",
"two-handed sword",
"meat cleaver",
"broadsword",
"coat of mail",
"plumed helmet",
"shield",
"maid's body",
"viper",
"lantern",
"shoes",
null,
"pajamas",
"robe",
"amulet",
"medallion",
"talisman",
"woodsman's body",
"wooden mallet",
"laser",
null,
null,
"grenade",
"chain",
"rope",
"levis",
"mace",
"shovel",
"halberd",
"compass",
null,
"Elf",
null,
"coins",
"match book",
null,
"papayas",
"pineapple",
"kiwi",
"coconuts",
"mango",
"ring",
"potion",
"bracelet",
null,
null,
"Dark Lord",
null,
null,
null,
null,
"warhead",
"goddess's body",
"old timer's body",
"girl's body",
null,
"stallion",
"car",
"pot of jewels",
"bar of gold",
"diamond block"
];
var OUCH=[
"some minor abrasions",
"some minor lacerations",
"a minor puncture wound",
"a minor amputation",
"a sprained wrist",
"a fractured ankle and shattered kneecap",
"a broken arm and dislocated shoulder",
"a few broken ribs",
"a broken leg and torn ligaments",
"a broken back and ruptured spleen",
"some deep incisions and a loss of blood",
"a fractured skull and mashed face",
"a broken neck"
];
var WORDS={"knife":[0,1],"sword":[1,2],"scabbard":[1,1],"fine":[1,1],"two-handed":[4,1],"cleaver":[5,1],"broadsword":[6,1],"mail":[7,1],"coat":[7,1],"helmet":[8,1],"shield":[9,1],"maid":[10,1],"maid's":[10,1],"body":[10,2],"viper":[11,1],"lamp":[12,1],"lantern":[12,1],"shoes":[13,1],"pajamas":[15,1],"robe":[16,1],"amulet":[17,2],"medallion":[18,2],"talisman":[19,2],"woodsman":[20,1],"woodsman's":[20,1],"mallet":[21,1],"laser":[22,1],"pistol":[22,1],"blaster":[22,1],"gun":[22,1],"goddess":[24,2],"grenade":[25,1],"chain":[26,1],"rope":[27,1],"levis":[28,1],"pants":[28,1],"mace":[29,1],"shovel":[30,1],"halberd":[31,1],"compass":[32,1],"elf":[34,1],"coins":[36,1],"matches":[37,1],"match":[37,1],"book":[37,1],"man":[38,2],"papayas":[39,1],"pineapple":[40,1],"kiwi":[41,1],"coconuts":[42,1],"mango":[43,1],"ring":[44,1],"potion":[45,1],"bracelet":[46,1],"timer":[50,2],"bomb":[54,1],"warhead":[54,1],"girl":[58,2],"native":[58,2],"horse":[59,1],"stallion":[59,1],"car":[60,1],"volare":[60,1],"pot":[61,1],"jewels":[61,1],"bar":[62,1],"diamond":[63,1],"block":[63,1],"up":[1000,0],"u":[1000,0],"down":[1001,0],"d":[1001,0],"ahead":[1002,0],"a":[1002,0],"back":[1003,0],"b":[1003,0],"right":[1004,0],"r":[1004,0],"left":[1005,0],"l":[1005,0],"take":[1006,0],"get":[1006,0],"use":[1007,0],"look":[1008,0],"lo":[1008,0],"quit":[1009,0],"q":[1009,0],"su":[1014,0],"drop":[1015,0],"draw":[1017,0],"pull":[1017,0],"carry":[1017,0],"wear":[1019,0],"sheathe":[1019,0],"put":[1020,0],"buckle":[1020,0],"strap":[1020,0],"tie":[1020,0],"inven":[1021,0],"i":[1021,0],"everything":[1022,1],"all":[1022,1],"and":[1023,5],"kill":[1024,0],"fight":[1024,0],"ravage":[1025,0],"rape":[1025,0],"undress":[1026,0],"throw":[1027,0],"launch":[1028,0],"land":[1029,0],"light":[1030,0],"strike":[1030,0],"follow":[1031,0],"chase":[1031,0],"kiss":[1032,0],"love":[1033,0],"fuck":[1033,0],"give":[1034,0],"smite":[1035,0],"attack":[1035,0],"swing":[1035,0],"stab":[1035,0],"slice":[1035,0],"cut":[1035,0],"hack":[1035,0],"shoot":[1036,0],"blast":[1036,0],"on":[1037,3],"off":[1038,3],"time":[1039,0],"sleep":[1040,0],"dig":[1041,0],"eat":[1042,0],"swim":[1043,0],"drink":[1044,0],"door":[1045,2],"save":[1046,0],"ride":[1047,0],"mount":[1047,0],"drive":[1048,0],"start":[1048,0],"score":[1049,0],"points":[1049,0],"bury":[1050,0],"jump":[1051,0],"kick":[1052,0],"kerosene":[0,4],"plumed":[0,4],"ancient":[0,4],"golden":[0,4],"gold":[0,4],"ostrich":[0,4],"rusty":[0,4],"old":[0,4],"dented":[0,4],"blue":[0,4],"purple":[0,4],"kingly":[0,4],"the":[0,4],"climb":[0,4],"move":[0,4],"make":[0,4],"to":[0,4]};
var EXIT={},SEGV={},FPE={};
var BITS=32,FINAL=275,GARDEN=197,POOLS=126,DOCK=93;
var VERB=0,OBJECT=1,NOUNS=2,PREPS=3,ADJS=4,CONJ=5;
var KNIFE=0,SWORD=1,LAND=2,WOODSMAN=3,TWO_HANDED=4,CLEAVER=5,BROAD=6,MAIL=7,HELM=8,SHIELD=9,MAID=10,BODY=10,VIPER=11,LAMPON=12,SHOES=13,CYLON=14,PAJAMAS=15,ROBE=16,AMULET=17,MEDALION=18,TALISMAN=19,DEADWOOD=20,MALLET=21,LASER=22,BATHGOD=23,NORMGOD=24,GRENADE=25,CHAIN=26,ROPE=27,LEVIS=28,MACE=29,SHOVEL=30,HALBERD=31,COMPASS=32,CRASH=33,ELF=34,FOOT=35,COINS=36,MATCHES=37,MAN=38,PAPAYAS=39,PINEAPPLE=40,KIWI=41,COCONUTS=42,MANGO=43,RING=44,POTION=45,BRACELET=46,GIRL=47,GIRLTALK=48,DARK=49,TIMER=50,CHAR=53,BOMB=54,DEADGOD=55,DEADTIME=56,DEADNATIVE=57,NATIVE=58,HORSE=59,CAR=60,POT=61,BAR=62,BLOCK=63,NUMOFOBJECTS=64;
var UP=1000,DOWN=1001,AHEAD=1002,BACK=1003,RIGHT=1004,LEFT=1005,TAKE=1006,USE=1007,LOOK=1008,QUIT=1009,NORTH=1010,SOUTH=1011,EAST=1012,WEST=1013,SU=1014,DROP=1015,TAKEOFF=1016,DRAW=1017,PUTON=1018,WEARIT=1019,PUT=1020,INVEN=1021,EVERYTHING=1022,AND=1023,KILL=1024,RAVAGE=1025,UNDRESS=1026,THROW=1027,LAUNCH=1028,LANDIT=1029,LIGHT=1030,FOLLOW=1031,KISS=1032,LOVE=1033,GIVE=1034,SMITE=1035,SHOOT=1036,ON=1037,OFF=1038,TIME=1039,SLEEP=1040,DIG=1041,EAT=1042,SWIM=1043,DRINK=1044,DOOR=1045,SAVE=1046,RIDE=1047,DRIVE=1048,SCORE=1049,BURY=1050,JUMP=1051,KICK=1052;
var ARM=6,RIBS=7,SPINE=9,SKULL=11,INCISE=10,NECK=12,NUMOFINJURIES=13;
var CANTLAUNCH=0,LAUNCHED=1,CANTSEE=2,CANTMOVE=3,JINXED=4,DUG=5,NUMOFNOTES=6;
var NUMOFROOMS=275,LINELENGTH=81,TODAY=0,TONIGHT=1,CYCLE=100,TANKFULL=250,TORPEDOES=10,MAXWEIGHT=60,MAXCUMBER=10;
var north=0,south=1,east=2,west=3,up=4,access=5,down=6,flyhere=7;
var NWORD=40,WORDLEN=15;
var READ={};
var list=['riggle','chris','edward','comay','yee','dmr','ken'],badguys=['wnj','root','ted'];
function zero(n){var a=[];while(n--)a.push(0);return a}
function rooms(T){return T.map(function(r){return {name:r[0]||'',link:r[1].slice(),desc:r[2]||'',objects:[0,0]}})}
function isspace(c){return c===' '||c==='\t'||c==='\n'||c==='\v'||c==='\f'||c==='\r'}
function okroom(v){return Number.isInteger(v)&&v>=0&&v<=NUMOFROOMS}
function isint(v){return Number.isInteger(v)&&Math.abs(v)<=0x80000000}
function ints(a,n){return Array.isArray(a)&&a.length===n&&a.every(isint)}
function pad(n,w){return String(n).padStart(w)}
function ctime(){
  var d=new Date(Date.now()),D=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],M=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  function p(x){return String(x).padStart(2,'0')}
  return D[d.getDay()]+' '+M[d.getMonth()]+' '+String(d.getDate()).padStart(2)+' '+p(d.getHours())+':'+p(d.getMinutes())+':'+p(d.getSeconds())+' '+d.getFullYear();
}
P.command({names:['battlestar'],run:function(a,raw,argv){
  var o='',pipe=P.stdin(),np=0,G,piped=P.piped();
  var randx=0;
  var dayfile=rooms(DAY),nightfile=rooms(NIGHT),location=null;
  var wordchars=zero(NWORD*WORDLEN),wordvalue=zero(NWORD),wordtype=zero(NWORD),wordcount=0,wordnumber=0;
  var time=0,position=0,direction=0,left=0,right=0,ahead=0,back=0,clock=120,fuel=0,torps=0,carrying=0,encumber=0,rythmn=0,followfight=-1,ate=0,snooze=0,meetgirl=0,followgod=-1,godready=0,win=1,wintime=0,wiz=0,tempwiz=0,matchlight=0,matchcount=20,loved=0,pleasure=0,power=0,ego=0,WEIGHT=MAXWEIGHT,CUMBER=MAXCUMBER;
  var notes=zero(NUMOFNOTES),inven=[0,0],wear=[0,0],beenthere=zero(NUMOFROOMS+1),injuries=zero(NUMOFINJURIES),uname='';
  var ibuf='';
  var dr=0,dc=0,destroyed=0,cross=0,row=0,column=0;

  function rand(){randx=(Math.imul(randx,1103515245)+12345)&0x7fffffff;return randx}
  function rnd(x){return rand()%x}
  function testbit(arr,i){return i>=0&&i<64?arr[i>>>5]&(1<<(i&31)):0}
  function setbit(arr,i){if(i>=0&&i<64)arr[i>>>5]|=1<<(i&31)}
  function clearbit(arr,i){if(i>=0&&i<64)arr[i>>>5]&=~(1<<(i&31))}
  function OUTSIDE(){return position>68&&position<246&&position!==218}
  function osh(v){return OBJSHT[v]||''}
  function div(x,y){if(y===0)throw FPE;return Math.trunc(x/y)}
  function line(s){return piped?s:s.replace(/^[^\t]*\t.*$/,function(l){ /* the terminal's tab stops */
      var r='';for(var i=0;i<l.length;i++){var c=l.charAt(i);if(c==='\t'){do r+=' ';while(r.length%8)}else r+=c}return r})}
  function pr(s){
    o+=s;
    var i=o.lastIndexOf('\n');
    if(i>=0){P.say(o.slice(0,i).split('\n').map(line));o=o.slice(i+1)}
  }
  function puts(s){pr(s+'\n')}
  function flush(){if(o){P.say([line(o)]);o=''}}
  /* ---------- getcom.c ---------- */
  function* fgets(size){
    if(ibuf===''){
      var l=yield READ;
      if(l===P.INT)die();
      if(l===null)return null;
      ibuf=l+'\n';
    }
    var s=ibuf.slice(0,size-1);
    ibuf=ibuf.slice(s.length);
    return s;
  }
  function* getcom(size,prompt,error){
    var buf,i;
    for(;;){
      pr(prompt);
      buf=yield* fgets(size);
      if(buf===null)continue;
      for(i=0;isspace(buf.charAt(i));i++);
      if(i<buf.length)break;
      if(error)puts(error);
    }
    return buf.slice(i);
  }
  /* the words all live in one array as in the C, and a long word runs into the next */
  function getword(s,p,n){
    var at=n*WORDLEN,c;
    function put(v){if(at<wordchars.length)wordchars[at]=v;at++}
    while(isspace(s.charAt(p)))p++;
    if(s.charAt(p)!==','){
      if(p>=s.length){put(0);return -1}
      while(p<s.length&&!isspace(c=s.charAt(p))&&c!==','){
        put((c>='A'&&c<='Z'?c.toLowerCase():c).charCodeAt(0));p++;
      }
    }
    else{put(44);p++}
    put(0);
    while(isspace(s.charAt(p)))p++;
    return p<s.length?p:-1;
  }
  function word(n){
    var s='',i=n*WORDLEN,c;
    while(i<wordchars.length&&(c=wordchars[i++])!==0)s+=String.fromCharCode(c);
    return s;
  }
  /* ---------- parse.c ---------- */
  function parse(){
    wordnumber=0;
    for(var n=0;n<=wordcount;n++){
      var wp=P.has(WORDS,word(n))?WORDS[word(n)]:null;
      if(wp===null){wordvalue[n]=-1;wordtype[n]=-1}
      else{wordvalue[n]=wp[0];wordtype[n]=wp[1]}
    }
  }
  /* ---------- init.c ---------- */
  function initialize(startup){
    puts('Version 4.2, fall 1984.');
    puts('First Adventure game written by His Lordship, the honorable');
    puts('Admiral D.W. Riggle\n');
    randx=Math.floor(Math.random()*30000)+1; /* srand(getpid()) */
    uname=String(P.st.user||'');
    wiz=wizard(uname);
    if(startup){
      location=dayfile;
      direction=NORTH;
      time=0;
      snooze=Math.trunc(CYCLE*1.5);
      position=22;
      setbit(wear,PAJAMAS);
      fuel=TANKFULL;
      torps=TORPEDOES;
      DAYOBJS.forEach(function(p){setbit(location[p[0]].objects,p[1])});
    }
    else restore();
  }
  function wizard(u){
    var flag=checkout(u);
    if(flag)pr('You are the Great wizard '+u+'.\n');
    return flag;
  }
  function checkout(u){
    if(list.indexOf(u)>=0)return 1;
    if(badguys.indexOf(u)>=0){
      pr('You are the Poor anti-wizard '+u+'.  Good Luck!\n');
      throw SEGV; /* location[7], and location is not set yet */
    }
    return 0;
  }
  /* ---------- save.c ---------- */
  function home(){var h=String(P.st.home||'/');return h+'/Bstar'}
  var SAVED=['direction','position','time','fuel','torps','carrying','encumber','rythmn','followfight','ate','snooze','meetgirl','followgod','godready','win','wintime','matchlight','matchcount','loved','pleasure','power','ego'];
  function good(s){
    if(!s||typeof s!=='object')return false;
    if(!isint(s.WEIGHT)||!isint(s.CUMBER)||!isint(s.clock)||(s.day!==0&&s.day!==1))return false;
    if(!Array.isArray(s.rooms)||s.rooms.length!==NUMOFROOMS)return false;
    for(var i=0;i<NUMOFROOMS;i++){
      var r=s.rooms[i];
      if(!Array.isArray(r)||!ints(r[0],8)||!ints(r[1],2))return false;
      for(var j=0;j<8;j++)if(j!==access&&!okroom(r[0][j]))return false;
    }
    if(!ints(s.inven,2)||!ints(s.wear,2)||!ints(s.injuries,NUMOFINJURIES)||!ints(s.notes,NUMOFNOTES))return false;
    if(!okroom(s.position)||[NORTH,SOUTH,EAST,WEST].indexOf(s.direction)<0)return false;
    return SAVED.every(function(k){return isint(s[k])});
  }
  /* a file that cannot be read back is as if it were not there */
  function restore(){
    var s=P.saved('battlestar/Bstar');
    if(typeof s==='string'){try{s=JSON.parse(s)}catch(e){s=null}}
    if(!good(s)){
      pr(home()+': No such file or directory\n');
      return; /* location stays unset: news() falls over it */
    }
    WEIGHT=s.WEIGHT;CUMBER=s.CUMBER;clock=s.clock;
    location=s.day?dayfile:nightfile;
    for(var n=1;n<=NUMOFROOMS;n++){
      location[n].link=s.rooms[n-1][0].slice();
      location[n].objects=s.rooms[n-1][1].slice();
    }
    inven=s.inven.slice();wear=s.wear.slice();injuries=s.injuries.slice();notes=s.notes.slice();
    direction=s.direction;position=s.position;time=s.time;fuel=s.fuel;torps=s.torps;carrying=s.carrying;encumber=s.encumber;rythmn=s.rythmn;followfight=s.followfight;ate=s.ate;snooze=s.snooze;meetgirl=s.meetgirl;followgod=s.followgod;godready=s.godready;win=s.win;wintime=s.wintime;matchlight=s.matchlight;matchcount=s.matchcount;loved=s.loved;pleasure=s.pleasure;power=s.power;ego=s.ego;
  }
  function save(){
    pr('Saved in '+home()+'.\n');
    var s={WEIGHT:WEIGHT,CUMBER:CUMBER,clock:clock,day:location===dayfile?1:0,rooms:[],inven:inven,wear:wear,injuries:injuries,notes:notes,direction:direction,position:position,time:time,fuel:fuel,torps:torps,carrying:carrying,encumber:encumber,rythmn:rythmn,followfight:followfight,ate:ate,snooze:snooze,meetgirl:meetgirl,followgod:followgod,godready:godready,win:win,wintime:wintime,matchlight:matchlight,matchcount:matchcount,loved:loved,pleasure:pleasure,power:power,ego:ego};
    for(var n=1;n<=NUMOFROOMS;n++)s.rooms.push([location[n].link,location[n].objects]);
    P.save('battlestar/Bstar',s);
  }
  /* ---------- misc.c ---------- */
  function card(arr,size){var i=0;for(var k=0;k<size;k++)if(arr[k])i++;return i}
  function ucard(arr){var j=0;for(var n=0;n<NUMOFOBJECTS;n++)if(testbit(arr,n))j++;return j}
  /* ---------- room.c ---------- */
  function writedes(){
    pr('\n\t'+location[position].name+'\n');
    if(beenthere[position]<3){
      var compass=NORTH,p=location[position].desc,s='';
      for(var i=0;i<p.length;i++){
        var c=p.charAt(i);
        if(c!=='-'&&c!=='*'&&c!=='+')s+=c;
        else{
          if(c!=='*')s+=truedirec(compass,c);
          compass++;
        }
      }
      pr(s);
    }
  }
  function printobjs(){
    var p=location[position].objects;
    pr('\n');
    for(var n=0;n<NUMOFOBJECTS;n++)if(testbit(p,n)&&OBJDES[n])puts(OBJDES[n]);
  }
  function whichway(here){
    var l=here.link;
    switch(direction){
    case NORTH:left=l[west];right=l[east];ahead=l[north];back=l[south];break;
    case SOUTH:left=l[east];right=l[west];ahead=l[south];back=l[north];break;
    case EAST:left=l[north];right=l[south];ahead=l[east];back=l[west];break;
    case WEST:left=l[south];right=l[north];ahead=l[west];back=l[east];break;
    }
  }
  function truedirec(way,option){
    var B=option==='+'?'behind you':'back';
    switch(way){
    case NORTH:
      switch(direction){case NORTH:return 'ahead';case SOUTH:return B;case EAST:return 'left';case WEST:return 'right'}
      break;
    case SOUTH:
      switch(direction){case NORTH:return B;case SOUTH:return 'ahead';case EAST:return 'right';case WEST:return 'left'}
      break;
    case EAST:
      switch(direction){case NORTH:return 'right';case SOUTH:return 'left';case EAST:return 'ahead';case WEST:return B}
      break;
    case WEST:
      switch(direction){case NORTH:return 'left';case SOUTH:return 'right';case EAST:return B;case WEST:return 'ahead'}
      break;
    }
    pr('Error: room '+position+'.  More than four directions wanted.');
    return '!!';
  }
  function newway(thisway){
    switch(direction){
    case NORTH:
      switch(thisway){case LEFT:direction=WEST;break;case RIGHT:direction=EAST;break;case BACK:direction=SOUTH;break}
      break;
    case SOUTH:
      switch(thisway){case LEFT:direction=EAST;break;case RIGHT:direction=WEST;break;case BACK:direction=NORTH;break}
      break;
    case EAST:
      switch(thisway){case LEFT:direction=NORTH;break;case RIGHT:direction=SOUTH;break;case BACK:direction=WEST;break}
      break;
    case WEST:
      switch(thisway){case LEFT:direction=SOUTH;break;case RIGHT:direction=NORTH;break;case BACK:direction=EAST;break}
      break;
    }
  }
  /* ---------- com1.c ---------- */
  function move(thataway,token){
    wordnumber++;
    if((!notes[CANTMOVE]&&!notes[LAUNCHED])||testbit(location[position].objects,LAND)||(fuel>0&&notes[LAUNCHED])){
      if(thataway){
        position=thataway;
        newway(token);
        time++;
      }
      else{
        puts("You can't go this way.");
        newway(token);
        whichway(location[position]);
        return 0;
      }
    }
    else if(notes[CANTMOVE]&&!notes[LAUNCHED])puts("You aren't able to move; you better drop something.");
    else puts('You are out of fuel; now you will rot in space forever!');
    return 1;
  }
  function convert(tothis){
    var i;
    if(tothis===TONIGHT){
      for(i=1;i<=NUMOFROOMS;i++){nightfile[i].objects[0]=dayfile[i].objects[0];nightfile[i].objects[1]=dayfile[i].objects[1]}
      NIGHTOBJS.forEach(function(p){setbit(nightfile[p[0]].objects,p[1])});
      location=nightfile;
    }
    else{
      for(i=1;i<=NUMOFROOMS;i++){dayfile[i].objects[0]=nightfile[i].objects[0];dayfile[i].objects[1]=nightfile[i].objects[1]}
      NIGHTOBJS.forEach(function(p){clearbit(dayfile[p[0]].objects,p[1])});
      location=dayfile;
    }
  }
  function* news(){
    var n,hurt;
    if(time>30&&position<32){
      puts("An explosion of shuddering magnitude splinters bulkheads and");
      puts("ruptures the battlestar's hull.  You are sucked out into the");
      puts('frozen void of space and killed.');
      die();
    }
    if(time>20&&position<32)puts('Explosions rock the battlestar.');
    if(time>snooze){
      puts('You drop from exhaustion...');
      yield* zzz();
    }
    if(time>snooze-5)puts("You're getting tired.");
    if(time>(rythmn+CYCLE)){
      if(location===nightfile){
        convert(TODAY);
        if(OUTSIDE()&&time-rythmn-CYCLE<10){
          puts('Dew lit sunbeams stretch out from a watery sunrise and herald the dawn.');
          puts('You awake from a misty dream-world into stark reality.');
          puts('It is day.');
        }
      }
      else{
        convert(TONIGHT);
        clearbit(location[POOLS].objects,BATHGOD);
        if(OUTSIDE()&&time-rythmn-CYCLE<10){
          puts('The dying sun sinks into the ocean, leaving a blood stained sunset.');
          puts('The sky slowly fades from orange to violet to black.  A few stars');
          puts('flicker on, and it is night.');
          puts('The world seems completly different at night.');
        }
      }
      rythmn=time-time%CYCLE;
    }
    if(!wiz&&!tempwiz)
      if((testbit(inven,TALISMAN)||testbit(wear,TALISMAN))&&(testbit(inven,MEDALION)||testbit(wear,MEDALION))&&(testbit(inven,AMULET)||testbit(wear,AMULET))){
        tempwiz=1;
        puts('The three amulets glow and reenforce each other in power.\nYou are now a wizard.');
      }
    if(testbit(location[position].objects,ELF)){
      pr(OBJDES[ELF]+'\n');
      yield* fight(ELF,rnd(30));
    }
    if(testbit(location[position].objects,DARK)){
      pr(OBJDES[DARK]+'\n');
      yield* fight(DARK,100);
    }
    if(testbit(location[position].objects,WOODSMAN)){
      pr(OBJDES[WOODSMAN]+'\n');
      yield* fight(WOODSMAN,50);
    }
    switch(position){
    case 267:case 257:case 274:case 246:
      notes[CANTSEE]=1;
      break;
    case 160:case 216:case 230:case 231:case 232:
      notes[CANTSEE]=0;
      break;
    }
    if(testbit(location[position].objects,GIRL))meetgirl=1;
    if(meetgirl&&CYCLE*1.5-time<10){
      setbit(location[GARDEN].objects,GIRLTALK);
      setbit(location[GARDEN].objects,LAMPON);
      setbit(location[GARDEN].objects,ROPE);
    }
    if(position===DOCK&&(beenthere[position]||time>CYCLE)){
      clearbit(location[DOCK].objects,GIRL);
      clearbit(location[DOCK].objects,MAN);
    }
    if(meetgirl&&time-CYCLE*1.5>10){
      clearbit(location[GARDEN].objects,GIRLTALK);
      clearbit(location[GARDEN].objects,LAMPON);
      clearbit(location[GARDEN].objects,ROPE);
      meetgirl=0;
    }
    if(testbit(location[position].objects,CYLON)){
      puts("Oh my God, you're being shot at by an alien spacecraft!");
      pr('The targeting computer says we have '+clock+' seconds to attack!\n');
      yield {sleep:1000};
      if(!(yield* visual())){
        hurt=rnd(NUMOFINJURIES);
        injuries[hurt]=1;
        puts('Laser blasts sear the cockpit, and the alien veers off in a victory roll.');
        puts('The viper shudders under a terrible explosion.');
        pr("I'm afraid you have suffered "+OUCH[hurt]+'.\n');
      }
      else clearbit(location[position].objects,CYLON);
    }
    if(injuries[SKULL]&&injuries[INCISE]&&injuries[NECK]){
      puts("I'm afraid you have suffered fatal injuries.");
      die();
    }
    for(n=0;n<NUMOFINJURIES;n++)
      if(injuries[n]===1){
        injuries[n]=2;
        if(WEIGHT>5)WEIGHT-=5;
        else WEIGHT=0;
      }
    if(injuries[ARM]===2){CUMBER-=5;injuries[ARM]++}
    if(injuries[RIBS]===2){CUMBER-=2;injuries[RIBS]++}
    if(injuries[SPINE]===2){WEIGHT=0;injuries[SPINE]++}
    if(carrying>WEIGHT||encumber>CUMBER)notes[CANTMOVE]=1;
    else notes[CANTMOVE]=0;
  }
  function* crash(){
    var hurt1,hurt2;
    fuel--;
    if(!location[position].link[flyhere]||(testbit(location[position].objects,LAND)&&fuel<=0)){
      if(!location[position].link[flyhere])puts("You're flying too low.  We're going to crash!");
      else{
        puts("You're out of fuel.  We'll have to crash land!");
        if(!location[position].link[down]){
          puts('Your viper strikes the ground and explodes into firey fragments.');
          puts('Thick black smoke billows up from the wreckage.');
          die();
        }
        position=location[position].link[down];
      }
      notes[LAUNCHED]=0;
      setbit(location[position].objects,CRASH);
      time+=rnd(Math.trunc(CYCLE/4));
      puts('The viper explodes into the ground and you lose consciousness...');
      yield* zzz();
      hurt1=rnd(NUMOFINJURIES-2)+2;
      hurt2=rnd(NUMOFINJURIES-2)+2;
      injuries[hurt1]=1;
      injuries[hurt2]=1;
      injuries[0]=1;
      injuries[1]=1;
      pr("I'm afraid you have suffered "+OUCH[hurt1]+' and '+OUCH[hurt2]+'.\n');
    }
  }
  /* ---------- com2.c ---------- */
  function wearit(){
    var n,firstnumber,value;
    firstnumber=wordnumber;
    while(wordtype[++wordnumber]===ADJS);
    while(wordnumber<=wordcount){
      value=wordvalue[wordnumber];
      n=osh(value).length;
      switch(value){
      case -1:
        puts('Wear what?');
        return firstnumber;
      default:
        pr("You can't wear"+(osh(value).charAt(n-1)==='s'?' ':' a ')+osh(value)+'!\n');
        return firstnumber;
      case KNIFE:case ROBE:case LEVIS:case SWORD:case MAIL:case HELM:case SHOES:case PAJAMAS:case COMPASS:case LASER:case AMULET:case TALISMAN:case MEDALION:case ROPE:case RING:case BRACELET:case GRENADE:
        if(testbit(inven,value)){
          clearbit(inven,value);
          setbit(wear,value);
          carrying-=OBJWT[value];
          encumber-=OBJCUMBER[value];
          time++;
          pr('You are now wearing '+(osh(value).charAt(n-1)==='s'?'the':'a')+' '+osh(value)+'.\n');
        }
        else if(testbit(wear,value))pr('You are already wearing the '+osh(value)+'.\n');
        else pr("You aren't holding the "+osh(value)+'.\n');
        if(wordnumber<wordcount-1&&wordvalue[++wordnumber]===AND)wordnumber++;
        else return firstnumber;
      }
    }
    puts("Don't be ridiculous.");
    return firstnumber;
  }
  function* put(){
    if(wordvalue[wordnumber+1]===ON){
      wordvalue[++wordnumber]=PUTON;
      return yield* cypher();
    }
    if(wordvalue[wordnumber+1]===DOWN){
      wordvalue[++wordnumber]=DROP;
      return yield* cypher();
    }
    puts("I don't understand what you want to put.");
    return -1;
  }
  function* draw(){return yield* take(wear)}
  function use(){
    while(wordtype[++wordnumber]===ADJS&&wordnumber<wordcount);
    if(wordvalue[wordnumber]===AMULET&&testbit(inven,AMULET)&&position!==FINAL){
      puts('The amulet begins to glow.');
      if(testbit(inven,MEDALION)){
        puts('The medallion comes to life too.');
        if(position===114){
          location[position].link[down]=160;
          whichway(location[position]);
          puts('The waves subside and it is possible to descend to the sea cave now.');
          time++;
          return -1;
        }
      }
      puts('A light mist falls over your eyes and the sound of purling water trickles in');
      puts('your ears.   When the mist lifts you are standing beside a cool stream.');
      if(position===229)position=224;
      else position=229;
      time++;
      return 0;
    }
    else if(position===FINAL)puts("The amulet won't work in here.");
    else if(wordvalue[wordnumber]===COMPASS&&testbit(inven,COMPASS))pr('Your compass points '+truedirec(NORTH,'-')+'.\n');
    else if(wordvalue[wordnumber]===COMPASS)puts("You aren't holding the compass.");
    else if(wordvalue[wordnumber]===AMULET)puts("You aren't holding the amulet.");
    else puts('There is no apparent use.');
    return -1;
  }
  function murder(){
    var n;
    for(n=0;!((n===SWORD||n===KNIFE||n===TWO_HANDED||n===MACE||n===CLEAVER||n===BROAD||n===CHAIN||n===SHOVEL||n===HALBERD)&&testbit(inven,n))&&n<NUMOFOBJECTS;n++);
    if(n===NUMOFOBJECTS)puts("You don't have suitable weapons to kill.");
    else{
      pr('Your '+osh(n)+' should do the trick.\n');
      while(wordtype[++wordnumber]===ADJS);
      switch(wordvalue[wordnumber]){
      case NORMGOD:
        if(testbit(location[position].objects,BATHGOD)){
          puts('The goddess\'s head slices off.  Her corpse floats in the water.');
          clearbit(location[position].objects,BATHGOD);
          setbit(location[position].objects,DEADGOD);
          power+=5;
          notes[JINXED]++;
        }
        else if(testbit(location[position].objects,NORMGOD)){
          puts('The goddess pleads but you strike her mercilessly.  Her broken body lies in a\npool of blood.');
          clearbit(location[position].objects,NORMGOD);
          setbit(location[position].objects,DEADGOD);
          power+=5;
          notes[JINXED]++;
          if(wintime)live();
        }
        else puts('I dont see her anywhere.');
        break;
      case TIMER:
        if(testbit(location[position].objects,TIMER)){
          puts('The old man offers no resistance.');
          clearbit(location[position].objects,TIMER);
          setbit(location[position].objects,DEADTIME);
          power++;
          notes[JINXED]++;
        }
        else puts('Who?');
        break;
      case NATIVE:
        if(testbit(location[position].objects,NATIVE)){
          puts('The girl screams as you cut her body to shreds.  She is dead.');
          clearbit(location[position].objects,NATIVE);
          setbit(location[position].objects,DEADNATIVE);
          power+=5;
          notes[JINXED]++;
        }
        else puts('What girl?');
        break;
      case MAN:
        if(testbit(location[position].objects,MAN)){
          puts('You strike him to the ground, and he coughs up blood.');
          puts('Your fantasy is over.');
          die();
        }
        /* falls through */
      case -1:
        puts('Kill what?');
        break;
      default:
        if(wordtype[wordnumber]!==NOUNS)puts('Kill what?');
        else pr("You can't kill the "+osh(wordvalue[wordnumber])+'!\n');
      }
    }
  }
  function ravage(){
    while(wordtype[++wordnumber]!==NOUNS&&wordnumber<=wordcount);
    if(wordtype[wordnumber]===NOUNS&&testbit(location[position].objects,wordvalue[wordnumber])){
      time++;
      switch(wordvalue[wordnumber]){
      case NORMGOD:
        puts('You attack the goddess, and she screams as you beat her.  She falls down');
        puts('crying and tries to hold her torn and bloodied dress around her.');
        power+=5;
        pleasure+=8;
        ego-=10;
        wordnumber--;
        godready=-30000;
        murder();
        win=-30000;
        break;
      case NATIVE:
        puts('The girl tries to run, but you catch her and throw her down.  Her face is');
        puts('bleeding, and she screams as you tear off her clothes.');
        power+=3;
        pleasure+=5;
        ego-=10;
        wordnumber--;
        murder();
        if(rnd(100)<50){
          puts('Her screams have attracted attention.  I think we are surrounded.');
          setbit(location[ahead].objects,WOODSMAN);
          setbit(location[ahead].objects,DEADWOOD);
          setbit(location[ahead].objects,MALLET);
          setbit(location[back].objects,WOODSMAN);
          setbit(location[back].objects,DEADWOOD);
          setbit(location[back].objects,MALLET);
          setbit(location[left].objects,WOODSMAN);
          setbit(location[left].objects,DEADWOOD);
          setbit(location[left].objects,MALLET);
          setbit(location[right].objects,WOODSMAN);
          setbit(location[right].objects,DEADWOOD);
          setbit(location[right].objects,MALLET);
        }
        break;
      default:
        puts('You are perverted.');
      }
    }
    else puts('Who?');
  }
  function* follow(){
    if(followfight===time){
      puts('The Dark Lord leaps away and runs down secret tunnels and corridoors.');
      puts('You chase him through the darkness and splash in pools of water.');
      puts('You have cornered him.  His laser sword extends as he steps forward.');
      position=FINAL;
      yield* fight(DARK,75);
      setbit(location[position].objects,TALISMAN);
      setbit(location[position].objects,AMULET);
      return 0;
    }
    else if(followgod===time){
      puts('The goddess leads you down a steamy tunnel and into a high, wide chamber.');
      puts('She sits down on a throne.');
      position=268;
      setbit(location[position].objects,NORMGOD);
      notes[CANTSEE]=1;
      return 0;
    }
    else puts('There is no one to follow.');
    return -1;
  }
  /* ---------- com3.c ---------- */
  function dig(){
    if(testbit(inven,SHOVEL)){
      puts('OK');
      time++;
      switch(position){
      case 144:
        if(!notes[DUG]){
          setbit(location[position].objects,DEADWOOD);
          setbit(location[position].objects,COMPASS);
          setbit(location[position].objects,KNIFE);
          setbit(location[position].objects,MACE);
          notes[DUG]=1;
        }
        break;
      default:
        puts('Nothing happens.');
      }
    }
    else puts("You don't have a shovel.");
  }
  function jump(){
    var n;
    switch(position){
    default:
      puts('Nothing happens.');
      return -1;
    case 242:position=133;break;
    case 214:case 215:case 162:case 159:position=145;break;
    case 232:position=275;break;
    case 3:position=1;break;
    case 172:position=201;
    }
    puts('Ahhhhhhh...');
    injuries[12]=injuries[8]=injuries[7]=injuries[6]=1;
    for(n=0;n<NUMOFOBJECTS;n++)
      if(testbit(inven,n)){
        clearbit(inven,n);
        setbit(location[position].objects,n);
      }
    carrying=0;
    encumber=0;
    return 0;
  }
  function bury(){
    var value;
    if(testbit(inven,SHOVEL)){
      while(wordtype[++wordnumber]!==OBJECT&&wordtype[wordnumber]!==NOUNS&&wordnumber<wordcount);
      value=wordvalue[wordnumber];
      if(wordtype[wordnumber]===NOUNS&&(testbit(location[position].objects,value)||value===BODY))
        switch(value){
        case BODY:
          wordtype[wordnumber]=OBJECT;
          if(testbit(inven,MAID)||testbit(location[position].objects,MAID))value=MAID;
          if(testbit(inven,DEADWOOD)||testbit(location[position].objects,DEADWOOD))value=DEADWOOD;
          if(testbit(inven,DEADGOD)||testbit(location[position].objects,DEADGOD))value=DEADGOD;
          if(testbit(inven,DEADTIME)||testbit(location[position].objects,DEADTIME))value=DEADTIME;
          if(testbit(inven,DEADNATIVE)||testbit(location[position].objects,DEADNATIVE))value=DEADNATIVE;
          break;
        case NATIVE:case NORMGOD:
          puts('She screams as you wrestle her into the hole.');
          /* falls through */
        case TIMER:
          power+=7;
          ego-=10;
          /* falls through */
        case AMULET:case MEDALION:case TALISMAN:
          wordtype[wordnumber]=OBJECT;
          break;
        default:
          puts('Wha..?');
        }
      if(wordtype[wordnumber]===OBJECT&&position>88&&(testbit(inven,value)||testbit(location[position].objects,value))){
        puts('Buried.');
        if(testbit(inven,value)){
          clearbit(inven,value);
          carrying-=OBJWT[value];
          encumber-=OBJCUMBER[value];
        }
        clearbit(location[position].objects,value);
        switch(value){
        case MAID:case DEADWOOD:case DEADNATIVE:case DEADTIME:case DEADGOD:
          ego+=2;
          pr('The '+osh(value)+' should rest easier now.\n');
        }
      }
      else puts("It doesn't seem to work.");
    }
    else puts("You aren't holding a shovel.");
  }
  function* drink(){
    var n;
    if(testbit(inven,POTION)){
      puts('The cool liquid runs down your throat but turns to fire and you choke.');
      puts('The heat reaches your limbs and tingles your spirit.  You feel like falling');
      puts('asleep.');
      clearbit(inven,POTION);
      WEIGHT=MAXWEIGHT;
      CUMBER=MAXCUMBER;
      for(n=0;n<NUMOFINJURIES;n++)injuries[n]=0;
      time++;
      yield* zzz();
    }
    else puts("I'm not thirsty.");
  }
  function shoot(){
    var firstnumber=wordnumber,value,n;
    if(!testbit(inven,LASER))puts("You aren't holding a blaster.");
    else{
      firstnumber=wordnumber;
      while(wordtype[++wordnumber]===ADJS);
      while(wordnumber<=wordcount&&wordtype[wordnumber]===OBJECT){
        value=wordvalue[wordnumber];
        pr(osh(value)+':\n');
        n=osh(value).length;
        if(testbit(location[position].objects,value)){
          clearbit(location[position].objects,value);
          time++;
          pr('The '+osh(value)+' explode'+(osh(value).charAt(n-1)==='s'?(osh(value).charAt(n-2)==='s'?'s.':'.'):'s.')+'\n');
          if(value===BOMB)die();
        }
        else pr('I dont see any '+osh(value)+' around here.\n');
        if(wordnumber<wordcount-1&&wordvalue[++wordnumber]===AND)wordnumber++;
        else return firstnumber;
      }
      if(wordnumber<=wordcount&&wordtype[wordnumber]===NOUNS){
        time++;
        switch(wordvalue[wordnumber]){
        case DOOR:
          switch(position){
          case 189:case 231:
            puts('The door is unhinged.');
            location[189].link[north]=231;
            location[231].link[south]=189;
            whichway(location[position]);
            break;
          case 30:
            puts('The wooden door splinters.');
            location[30].link[west]=25;
            whichway(location[position]);
            break;
          case 31:
            puts('The laser blast has no effect on the door.');
            break;
          case 20:
            puts('The blast hits the door and it explodes into flame.  The magnesium burns');
            puts('so rapidly that we have no chance to escape.');
            die();
            /* falls through */
          default:
            puts('Nothing happens.');
          }
          break;
        case NORMGOD:
          if(testbit(location[position].objects,BATHGOD)){
            puts('The goddess is hit in the chest and splashes back against the rocks.');
            puts('Dark blood oozes from the charred blast hole.  Her naked body floats in the');
            puts('pools and then off downstream.');
            clearbit(location[position].objects,BATHGOD);
            setbit(location[180].objects,DEADGOD);
            power+=5;
            ego-=10;
            notes[JINXED]++;
          }
          else if(testbit(location[position].objects,NORMGOD)){
            puts('The blast catches the goddess in the stomach, knocking her to the ground.');
            puts('She writhes in the dirt as the agony of death taunts her.');
            puts('She has stopped moving.');
            clearbit(location[position].objects,NORMGOD);
            setbit(location[position].objects,DEADGOD);
            power+=5;
            ego-=10;
            notes[JINXED]++;
            if(wintime)live();
            break;
          }
          else puts("I don't see any goddess around here.");
          break;
        case TIMER:
          if(testbit(location[position].objects,TIMER)){
            puts('The old man slumps over the bar.');
            power++;
            ego-=2;
            notes[JINXED]++;
            clearbit(location[position].objects,TIMER);
            setbit(location[position].objects,DEADTIME);
          }
          else puts('What old timer?');
          break;
        case MAN:
          if(testbit(location[position].objects,MAN)){
            puts('The man falls to the ground with blood pouring all over his white suit.');
            puts('Your fantasy is over.');
            die();
          }
          else puts('What man?');
          break;
        case NATIVE:
          if(testbit(location[position].objects,NATIVE)){
            puts('The girl is blown backwards several feet and lies in a pool of blood.');
            clearbit(location[position].objects,NATIVE);
            setbit(location[position].objects,DEADNATIVE);
            power+=5;
            ego-=2;
            notes[JINXED]++;
          }
          else puts('There is no girl here.');
          break;
        case -1:
          puts('Shoot what?');
          break;
        default:
          pr("You can't shoot the "+osh(wordvalue[wordnumber])+'.\n');
        }
      }
      else puts('You must be a looney.');
    }
    return firstnumber;
  }
  /* ---------- com4.c ---------- */
  function* take(from){
    var firstnumber,heavy,bulky,value,n,s;
    firstnumber=wordnumber;
    if(wordnumber<wordcount&&wordvalue[wordnumber+1]===OFF){
      wordnumber++;
      wordvalue[wordnumber]=TAKEOFF;
      return yield* cypher();
    }
    else{
      while(wordtype[++wordnumber]===ADJS);
      while(wordnumber<=wordcount&&wordtype[wordnumber]===OBJECT){
        value=wordvalue[wordnumber];
        s=osh(value);
        pr(s+':\n');
        n=s.length;
        heavy=(carrying+(OBJWT[value]||0))<=WEIGHT;
        bulky=(encumber+(OBJCUMBER[value]||0))<=CUMBER;
        if((testbit(from,value)||wiz||tempwiz)&&heavy&&bulky&&!testbit(inven,value)){
          setbit(inven,value);
          carrying+=(OBJWT[value]||0);
          encumber+=(OBJCUMBER[value]||0);
          time++;
          if(testbit(from,value))pr('Taken.\n');
          else pr('Zap! Taken from thin air.\n');
          clearbit(from,value);
          if(value===MEDALION)win--;
        }
        else if(testbit(inven,value))pr("You're already holding"+(s.charAt(n-1)==='s'?' ':' a ')+s+'.\n');
        else if(!heavy)pr('The '+s+' '+(s.charAt(n-1)==='s'?'are':'is')+' too heavy.\n');
        else if(!bulky)pr('The '+s+' '+(s.charAt(n-1)==='s'?'are':'is')+' too cumbersome to hold.\n');
        else pr('I dont see any '+s+' around here.\n');
        if(wordnumber<wordcount-1&&wordvalue[++wordnumber]===AND)wordnumber++;
        else return firstnumber;
      }
    }
    if(wordnumber<=wordcount&&wordtype[wordnumber]===NOUNS)
      switch(wordvalue[wordnumber]){
      case SWORD:
        if(testbit(from,SWORD)){
          wordtype[wordnumber--]=OBJECT;
          return yield* take(from);
        }
        if(testbit(from,TWO_HANDED)){
          wordvalue[wordnumber]=TWO_HANDED;
          wordtype[wordnumber--]=OBJECT;
          return yield* take(from);
        }
        wordvalue[wordnumber]=BROAD;
        wordtype[wordnumber--]=OBJECT;
        return yield* take(from);
      case BODY:
        if(testbit(from,MAID))wordvalue[wordnumber]=MAID;
        else if(testbit(from,DEADWOOD))wordvalue[wordnumber]=DEADWOOD;
        else if(testbit(from,DEADNATIVE))wordvalue[wordnumber]=DEADNATIVE;
        else if(testbit(from,DEADGOD))wordvalue[wordnumber]=DEADGOD;
        else wordvalue[wordnumber]=DEADTIME;
        wordtype[wordnumber--]=OBJECT;
        return yield* take(from);
      case AMULET:
        if(testbit(location[position].objects,AMULET)){
          puts('The amulet is warm to the touch, and its beauty catches your breath.');
          puts('A mist falls over your eyes, but then it is gone.  Sounds seem clearer');
          puts('and sharper but far away as if in a dream.  The sound of purling water reaches');
          puts('you from afar.  The mist falls again, and your heart leaps in horror.  The gold');
          puts('freezes your hands and fathomless darkness engulfs your soul.');
        }
        wordtype[wordnumber--]=OBJECT;
        return yield* take(from);
      case MEDALION:
        if(testbit(location[position].objects,MEDALION)){
          puts('The medallion is warm, and it rekindles your spirit with the warmth of life.');
          puts('Your amulet begins to glow as the medallion is brought near to it, and together\nthey radiate.');
        }
        wordtype[wordnumber--]=OBJECT;
        return yield* take(from);
      case TALISMAN:
        if(testbit(location[position].objects,TALISMAN)){
          puts('The talisman is cold to the touch, and it sends a chill down your spine.');
        }
        wordtype[wordnumber--]=OBJECT;
        return yield* take(from);
      case NORMGOD:
        if(testbit(location[position].objects,BATHGOD)&&(testbit(wear,AMULET)||testbit(inven,AMULET))){
          puts('She offers a delicate hand, and you help her out of the sparkling springs.');
          puts('Water droplets like liquid silver bedew her golden skin, but when they part');
          puts('from her, they fall as teardrops.  She wraps a single cloth around her and');
          puts('ties it at the waist.  Around her neck hangs a golden amulet.');
          puts('She bids you to follow her.');
          pleasure++;
          followgod=time;
          clearbit(location[position].objects,BATHGOD);
        }
        else if(!testbit(location[position].objects,BATHGOD))puts("You're in no position to take her.");
        else puts('She moves away from you.');
        break;
      default:
        puts("It doesn't seem to work.");
      }
    else puts("You've got to be kidding.");
    return firstnumber;
  }
  function throwit(name){
    var n,deposit=0,first,value;
    first=wordnumber;
    if(drop(name)!==-1){
      switch(wordvalue[wordnumber]){
      case AHEAD:deposit=ahead;break;
      case BACK:deposit=back;break;
      case LEFT:deposit=left;break;
      case RIGHT:deposit=right;break;
      case UP:deposit=location[position].link[up]*((location[position].link[access]||position===FINAL)?1:0);break;
      case DOWN:deposit=location[position].link[down];break;
      }
      wordnumber=first;
      while(wordtype[++wordnumber]===ADJS);
      while(wordnumber<=wordcount){
        value=wordvalue[wordnumber];
        if(deposit&&testbit(location[position].objects,value)){
          clearbit(location[position].objects,value);
          if(value!==GRENADE)setbit(location[deposit].objects,value);
          else{
            puts('A thundering explosion nearby sends up a cloud of smoke and shrapnel.');
            location[deposit].objects[0]=0;
            location[deposit].objects[1]=0;
            setbit(location[deposit].objects,CHAR);
          }
          if(value===ROPE&&position===FINAL)location[position].link[access]=1;
          switch(deposit){
          case 189:case 231:
            puts('The stone door is unhinged.');
            location[189].link[north]=231;
            location[231].link[south]=189;
            break;
          case 30:
            puts('The wooden door is blown open.');
            location[30].link[west]=25;
            break;
          case 31:
            puts('The door is not damaged.');
          }
        }
        else if(value===GRENADE&&testbit(location[position].objects,value)){
          puts('You are blown into shreds when your grenade explodes.');
          die();
        }
        if(wordnumber<wordcount-1&&wordvalue[++wordnumber]===AND)wordnumber++;
        else return first;
      }
      return first;
    }
    return first;
  }
  function drop(name){
    var firstnumber,value;
    firstnumber=wordnumber;
    while(wordtype[++wordnumber]===ADJS);
    while(wordnumber<=wordcount&&(wordtype[wordnumber]===OBJECT||wordtype[wordnumber]===NOUNS)){
      value=wordvalue[wordnumber];
      pr(osh(value)+':\n');
      if(testbit(inven,value)){
        clearbit(inven,value);
        carrying-=OBJWT[value];
        encumber-=OBJCUMBER[value];
        if(value===BOMB){
          puts('The bomb explodes.  A blinding white light and immense concussion obliterate us.');
          die();
        }
        if(value!==AMULET&&value!==MEDALION&&value!==TALISMAN)setbit(location[position].objects,value);
        else tempwiz=0;
        time++;
        if(name.charAt(0)==='K')puts('Drop kicked.');
        else pr(name+'.\n');
      }
      else{
        if(name.charAt(0)!=='K'){
          pr("You aren't holding the "+osh(value)+'.\n');
          if(testbit(location[position].objects,value)){
            if(name.charAt(0)==='T')puts('Kicked instead.');
            else if(name.charAt(0)==='G')puts('Given anyway.');
          }
        }
        else puts('Kicked.');
      }
      if(wordnumber<wordcount-1&&wordvalue[++wordnumber]===AND)wordnumber++;
      else return firstnumber;
    }
    puts('Do what?');
    return -1;
  }
  function* takeoff(){
    wordnumber=yield* take(wear);
    return drop('Dropped');
  }
  function* puton(){
    wordnumber=yield* take(location[position].objects);
    return wearit();
  }
  function eat(){
    var n,firstnumber,value;
    firstnumber=wordnumber;
    while(wordtype[++wordnumber]===ADJS);
    while(wordnumber<=wordcount){
      value=wordvalue[wordnumber];
      n=osh(value).length;
      switch(value){
      case -1:
        puts('Eat what?');
        return firstnumber;
      default:
        pr("You can't eat"+(osh(value).charAt(n-1)==='s'?' ':' a ')+osh(value)+'!\n');
        return firstnumber;
      case PAPAYAS:case PINEAPPLE:case KIWI:case COCONUTS:case MANGO:
        pr(osh(value)+':\n');
        if(testbit(inven,value)&&time>ate-CYCLE&&testbit(inven,KNIFE)){
          clearbit(inven,value);
          carrying-=OBJWT[value];
          encumber-=OBJCUMBER[value];
          ate=Math.max(time,ate)+Math.trunc(CYCLE/3);
          snooze+=Math.trunc(CYCLE/10);
          time++;
          puts('Eaten.  You can explore a little longer now.');
        }
        else if(time<ate-CYCLE)puts("You're stuffed.");
        else if(!testbit(inven,KNIFE))puts('You need a knife.');
        else pr("You aren't holding the "+osh(value)+'.\n');
        if(wordnumber<wordcount-1&&wordvalue[++wordnumber]===AND)wordnumber++;
        else return firstnumber;
      }
    }
    return firstnumber;
  }
  /* ---------- com5.c ---------- */
  function kiss(){
    while(wordtype[++wordnumber]!==NOUNS&&wordnumber<=wordcount);
    if(wordtype[wordnumber]===NOUNS&&testbit(location[position].objects,wordvalue[wordnumber])){
      pleasure++;
      pr('Kissed.\n');
      switch(wordvalue[wordnumber]){
      case NORMGOD:
        switch(godready++){
        case 0:puts('She squirms and avoids your advances.');break;
        case 1:puts("She is coming around; she didn't fight it as much.");break;
        case 2:puts("She's begining to like it.");break;
        default:puts("She's gone limp.");
        }
        break;
      case NATIVE:puts('The lips are warm and her body robust.  She pulls you down to the ground.');break;
      case TIMER:puts('The old man blushes.');break;
      case MAN:puts('The dwarf punches you in the kneecap.');break;
      default:pleasure--;
      }
    }
    else puts("I'd prefer not to.");
  }
  function* love(){
    var n;
    while(wordtype[++wordnumber]!==NOUNS&&wordnumber<=wordcount);
    if(wordtype[wordnumber]===NOUNS&&testbit(location[position].objects,wordvalue[wordnumber])){
      if(wordvalue[wordnumber]===NORMGOD&&!loved){
        if(godready>=2){
          puts("She cuddles up to you, and her mouth starts to work:\n'That was my sister's amulet.  The lovely goddess, Purl, was she.  The Empire\ncaptured her just after the Darkness came.  My other sister, Vert, was killed\nby the Dark Lord himself.  He took her amulet and warped its power.\nYour quest was foretold by my father before he died, but to get the Dark Lord's\namulet you must use cunning and skill.  I will leave you my amulet.");
          puts("which you may use as you wish.  As for me, I am the last goddess of the\nwaters.  My father was the Island King, and the rule is rightfully mine.'\n\nShe pulls the throne out into a large bed.");
          power++;
          pleasure+=15;
          ego++;
          if(card(injuries,NUMOFINJURIES)){
            puts('Her kisses revive you; your wounds are healed.\n');
            for(n=0;n<NUMOFINJURIES;n++)injuries[n]=0;
            WEIGHT=MAXWEIGHT;
            CUMBER=MAXCUMBER;
          }
          pr('Goddess:\n');
          if(!loved)setbit(location[position].objects,MEDALION);
          loved=1;
          time+=10;
          yield* zzz();
        }
        else{
          puts('You wish!');
          return;
        }
      }
      if(wordvalue[wordnumber]===NATIVE){
        puts('The girl is easy prey.  She peals off her sarong and indulges you.');
        power++;
        pleasure+=5;
        pr('Girl:\n');
        time+=10;
        yield* zzz();
      }
      pr('Loved.\n');
    }
    else puts("I't doesn't seem to work.");
  }
  function* zzz(){
    var oldtime,n,dots;
    oldtime=time;
    if((snooze-time)<(0.75*CYCLE)){
      time+=Math.trunc(0.75*CYCLE)-(snooze-time);
      dots='';
      for(n=0;n<time-oldtime;n++)dots+='.';
      pr('<zzz>'+dots+'\n');
      snooze+=3*(time-oldtime);
      if(notes[LAUNCHED]){
        fuel-=(time-oldtime);
        if(location[position].link[down]){
          position=location[position].link[down];
          yield* crash();
        }
        else notes[LAUNCHED]=0;
      }
      if(OUTSIDE()&&rnd(100)<50){
        puts('You are awakened abruptly by the sound of someone nearby.');
        switch(rnd(4)){
        case 0:
          if(ucard(inven)){
            n=rnd(NUMOFOBJECTS);
            while(!testbit(inven,n))n=rnd(NUMOFOBJECTS);
            clearbit(inven,n);
            if(n!==AMULET&&n!==MEDALION&&n!==TALISMAN)setbit(location[position].objects,n);
            carrying-=OBJWT[n];
            encumber-=OBJCUMBER[n];
          }
          puts('A fiendish little Elf is stealing your treasures!');
          yield* fight(ELF,10);
          break;
        case 1:
          setbit(location[position].objects,DEADWOOD);
          break;
        case 2:
          setbit(location[position].objects,HALBERD);
          break;
        default:
          break;
        }
      }
    }
    else return 0;
    return 1;
  }
  function chime(){
    var part=Math.trunc((time%CYCLE)/Math.trunc(CYCLE/7));
    if(((Math.trunc(time/CYCLE)+1)%2)&&OUTSIDE())
      switch(part){
      case 0:puts('It is just after sunrise.');break;
      case 1:puts('It is early morning.');break;
      case 2:puts('It is late morning.');break;
      case 3:puts('It is near noon.');break;
      case 4:puts('It is early afternoon.');break;
      case 5:puts('It is late afternoon.');break;
      case 6:puts('It is near sunset.');break;
      }
    else if(OUTSIDE())
      switch(part){
      case 0:puts('It is just after sunset.');break;
      case 1:puts('It is early evening.');break;
      case 2:puts('The evening is getting old.');break;
      case 3:puts('It is near midnight.');break;
      case 4:puts('These are the wee hours of the morning.');break;
      case 5:puts('The night is waning.');break;
      case 6:puts('It is almost morning.');break;
      }
    else puts("I can't tell the time in here.");
  }
  function give(){
    var obj=-1,result=-1,person=0,firstnumber,last1=0,last2=0;
    firstnumber=wordnumber;
    while(wordtype[++wordnumber]!==OBJECT&&wordvalue[wordnumber]!==AMULET&&wordvalue[wordnumber]!==MEDALION&&wordvalue[wordnumber]!==TALISMAN&&wordnumber<=wordcount);
    if(wordnumber<=wordcount){
      obj=wordvalue[wordnumber];
      if(obj===EVERYTHING)wordtype[wordnumber]=-1;
      last1=wordnumber;
    }
    wordnumber=firstnumber;
    while((wordtype[++wordnumber]!==NOUNS||wordvalue[wordnumber]===obj)&&wordnumber<=wordcount);
    if(wordtype[wordnumber]===NOUNS){
      person=wordvalue[wordnumber];
      last2=wordnumber;
    }
    wordnumber=last1-1;
    if(person&&testbit(location[position].objects,person)){
      if(person===NORMGOD&&godready<2&&!(obj===RING||obj===BRACELET))puts("The goddess won't look at you.");
      else result=drop('Given');
    }
    else{
      puts("I don't think that is possible.");
      return 0;
    }
    if(result!==-1&&(testbit(location[position].objects,obj)||obj===AMULET||obj===MEDALION||obj===TALISMAN)){
      clearbit(location[position].objects,obj);
      time++;
      ego++;
      switch(person){
      case NATIVE:
        puts('She accepts it shyly.');
        ego+=2;
        break;
      case NORMGOD:
        if(obj===RING||obj===BRACELET){
          puts('She takes the charm and puts it on.  A little kiss on the cheek is');
          puts('your reward.');
          ego+=5;
          godready+=3;
        }
        if(obj===AMULET||obj===MEDALION||obj===TALISMAN){
          win++;
          ego+=5;
          power-=5;
          if(win>=3){
            puts('The powers of the earth are now legitimate.  You have destroyed the Darkness');
            puts('and restored the goddess to her thrown.  The entire island celebrates with');
            puts('dancing and spring feasts.  As a measure of her gratitude, the goddess weds you');
            puts('in the late summer and crowns you Prince Liverwort, Lord of Fungus.');
            puts('\nBut, as the year wears on and autumn comes along, you become restless and');
            puts('yearn for adventure.  The goddess, too, realizes that the marriage can\'t last.');
            puts('She becomes bored and takes several more natives as husbands.  One evening,');
            puts('after having been out drinking with the girls, she kicks the throne particulary');
            puts("hard and wakes you up.  (If you want to win this game, you're going to have to\nshoot her!)");
            clearbit(location[position].objects,MEDALION);
            wintime=time;
          }
        }
        break;
      case TIMER:
        if(obj===COINS){
          puts('He fingers the coins for a moment and then looks up agape.  `Kind you are and');
          puts('I mean to repay you as best I can.\'  Grabbing a pencil and cocktail napkin...\n');
          pr('+-----------------------------------------------------------------------------+\n');
          pr('|\t\t\t\t   xxxxxxxx\\\t\t\t\t      |\n');
          pr('|\t\t\t\t       xxxxx\\\tCLIFFS\t\t\t      |\n');
          pr('|\t\tFOREST\t\t\t  xxx\\\t\t\t\t      |\n');
          pr('|\t\t\t\t\\\\\t     x\\        \tOCEAN\t\t      |\n');
          pr('|\t\t\t\t||\t       x\\\t\t\t      |\n');
          pr('|\t\t\t\t||  ROAD\tx\\\t\t\t      |\n');
          pr('|\t\t\t\t||\t\tx\\\t\t\t      |\n');
          pr('|\t\tSECRET\t\t||\t  .........\t\t\t      |\n');
          pr('|\t\t - + -\t\t||\t   ........\t\t\t      |\n');
          pr('|\t\tENTRANCE\t||\t\t...      BEACH\t\t      |\n');
          pr('|\t\t\t\t||\t\t...\t\t  E\t      |\n');
          pr('|\t\t\t\t||\t\t...\t\t  |\t      |\n');
          pr('|\t\t\t\t//\t\t...\t    N <-- + --- S     |\n');
          pr('|\t\tPALM GROVE     //\t\t...\t\t  |\t      |\n');
          pr('|\t\t\t      //\t\t...\t\t  W\t      |\n');
          pr('+-----------------------------------------------------------------------------+\n');
          puts('\n`This map shows a secret entrance to the catacombs.');
          puts('You will know when you arrive because I left an old pair of shoes there.\'');
        }
        break;
      }
    }
    wordnumber=Math.max(last1,last2);
    return firstnumber;
  }
  /* ---------- com6.c ---------- */
  function launch(){
    if(testbit(location[position].objects,VIPER)&&!notes[CANTLAUNCH]){
      if(fuel>4){
        clearbit(location[position].objects,VIPER);
        position=location[position].link[up];
        notes[LAUNCHED]=1;
        time++;
        fuel-=4;
        puts('You climb into the viper and prepare for launch.');
        puts('With a touch of your thumb the turbo engines ignite, thrusting you back into\nyour seat.');
        return 1;
      }
      else puts('Not enough fuel to launch.');
    }
    else puts("Can't launch.");
    return 0;
  }
  function land(){
    if(notes[LAUNCHED]&&testbit(location[position].objects,LAND)&&location[position].link[down]){
      notes[LAUNCHED]=0;
      position=location[position].link[down];
      setbit(location[position].objects,VIPER);
      fuel-=2;
      time++;
      puts('You are down.');
      return 1;
    }
    else puts("You can't land here.");
    return 0;
  }
  function die(){
    pr('bye.\nYour rating was '+rate()+'.\n');
    post(' ');
    throw EXIT;
  }
  function live(){
    puts('\nYou win!');
    post('!');
    throw EXIT;
  }
  function post(ch){
    var t=ctime()+'  '+uname.padStart(8)+'  '+ch+rate().padStart(20)+(wiz?'   wizard':tempwiz?'   WIZARD!':''),L=P.saved('battlestar/log');
    L=Array.isArray(L)?L.filter(function(x){return typeof x==='string'}):[];
    L.push(t);
    P.save('battlestar/log',L.slice(-100));
  }
  function rate(){
    var score=Math.max(Math.max(pleasure,power),ego);
    if(score===pleasure){
      if(score<5)return 'novice';
      else if(score<20)return 'junior voyeur';
      else if(score<35)return 'Don Juan';
      else return 'Marquis De Sade';
    }
    else if(score===power){
      if(score<5)return 'serf';
      else if(score<8)return 'Samurai';
      else if(score<13)return 'Klingon';
      else if(score<22)return 'Darth Vader';
      else return 'Sauron the Great';
    }
    else{
      if(score<5)return 'Polyanna';
      else if(score<10)return 'philanthropist';
      else if(score<20)return 'Tattoo';
      else return 'Mr. Roarke';
    }
  }
  function* drive(){
    if(testbit(location[position].objects,CAR)){
      puts('You hop in the car and turn the key.  There is a perceptible grating noise,');
      puts('and an explosion knocks you unconscious...');
      clearbit(location[position].objects,CAR);
      setbit(location[position].objects,CRASH);
      injuries[5]=injuries[6]=injuries[7]=injuries[8]=1;
      time+=15;
      yield* zzz();
      return 0;
    }
    else puts('There is nothing to drive here.');
    return -1;
  }
  function ride(){
    if(testbit(location[position].objects,HORSE)){
      puts('You climb onto the stallion and kick it in the guts.  The stupid steed launches');
      puts('forward through bush and fern.  You are thrown and the horse gallups off.');
      clearbit(location[position].objects,HORSE);
      var spins=0;
      while(!(position=rnd(NUMOFROOMS+1))||!OUTSIDE()||!beenthere[position]||location[position].link[flyhere])
        if(++spins>10000000)throw EXIT; /* the C would spin for ever */
      setbit(location[position].objects,HORSE);
      if(location[position].link[north])position=location[position].link[north];
      else if(location[position].link[south])position=location[position].link[south];
      else if(location[position].link[east])position=location[position].link[east];
      else position=location[position].link[west];
      return 0;
    }
    else puts('There is no horse here.');
    return -1;
  }
  function light(){
    if(testbit(inven,MATCHES)&&matchcount){
      puts('Your match splutters to life.');
      time++;
      matchlight=1;
      matchcount--;
      if(position===217){
        puts('The whole bungalow explodes with an intense blast.');
        die();
      }
    }
    else puts("You're out of matches.");
  }
  /* ---------- com7.c ---------- */
  function* fight(enemy,strength){
    var lifeline=0,hurt,i,exhaustion,next,s;
    for(;;){
      time++;
      snooze-=5;
      if(snooze>time)exhaustion=Math.trunc(CYCLE/(snooze-time));
      else{
        puts('You collapse exhausted, and he pulverizes your skull.');
        die();
      }
      if(snooze-time<20)puts("You look tired! I hope you're able to fight.");
      s=yield* getcom(LINELENGTH,'<fight!>-: ',null);
      next=0;
      for(i=0;next>=0&&i<10;i++)next=getword(s,next,i);
      parse();
      switch(wordvalue[wordnumber]){
      case KILL:case SMITE:
        if(testbit(inven,TWO_HANDED))hurt=rnd(70)-2*card(injuries,NUMOFINJURIES)-ucard(wear)-exhaustion;
        else if(testbit(inven,SWORD)||testbit(inven,BROAD)){
          i=rnd(50);
          if(WEIGHT-carrying===0)throw FPE;
          hurt=i%(WEIGHT-carrying)-card(injuries,NUMOFINJURIES)-encumber-exhaustion;
        }
        else if(testbit(inven,KNIFE)||testbit(inven,MALLET)||testbit(inven,CHAIN)||testbit(inven,MACE)||testbit(inven,HALBERD))hurt=rnd(15)-card(injuries,NUMOFINJURIES)-exhaustion;
        else hurt=rnd(7)-encumber;
        if(hurt<5)
          switch(rnd(3)){
          case 0:puts('You swung wide and missed.');break;
          case 1:puts('He checked your blow. CLASH! CLANG!');break;
          case 2:puts('His filthy tunic hangs by one less thread.');break;
          }
        else if(hurt<10){
          switch(rnd(3)){
          case 0:puts("He's bleeding.");break;
          case 1:puts('A trickle of blood runs down his face.');break;
          case 2:puts('A huge purple bruise is forming on the side of his face.');break;
          }
          lifeline++;
        }
        else if(hurt<20){
          switch(rnd(3)){
          case 0:puts('He staggers back quavering.');break;
          case 1:puts('He jumps back with his hand over the wound.');break;
          case 2:puts('His shirt falls open with a swath across the chest.');break;
          }
          lifeline+=5;
        }
        else if(hurt<30){
          switch(rnd(3)){
          case 0:pr('A bloody gash opens up on his '+(rnd(2)?'left':'right')+' side.\n');break;
          case 1:puts('The steel bites home and scrapes along his ribs.');break;
          case 2:puts('You pierce him, and his breath hisses through clenched teeth.');break;
          }
          lifeline+=10;
        }
        else if(hurt<40){
          switch(rnd(3)){
          case 0:
            puts('You smite him to the ground.');
            if(strength-lifeline>20)puts('But in a flurry of steel he regains his feet!');
            break;
          case 1:
            puts('The force of your blow sends him to his knees.');
            puts('His arm swings lifeless at his side.');
            break;
          case 2:puts('Clutching his blood drenched shirt, he collapses stunned.');break;
          }
          lifeline+=20;
        }
        else{
          switch(rnd(3)){
          case 0:puts('His ribs crack under your powerful swing, flooding his lungs with blood.');break;
          case 1:
            puts('You shatter his upheld arm in a spray of blood.  The blade continues deep');
            puts('into his back, severing the spinal cord.');
            lifeline+=25;
            break;
          case 2:
            puts('With a mighty lunge the steel slides in, and gasping, he falls to the ground.');
            lifeline+=25;
            break;
          }
          lifeline+=30;
        }
        break;
      case BACK:
        if(enemy===DARK&&lifeline>strength*0.33){
          puts('He throws you back against the rock and pummels your face.');
          if(testbit(inven,AMULET)||testbit(wear,AMULET)){
            pr('Lifting the amulet from you, ');
            if(testbit(inven,MEDALION)||testbit(wear,MEDALION)){
              puts('his power grows and the walls of\nthe earth tremble.');
              puts('When he touches the medallion, your chest explodes and the foundations of the\nearth collapse.');
              puts('The planet is consumed by darkness.');
              die();
            }
            if(testbit(inven,AMULET)){
              clearbit(inven,AMULET);
              carrying-=OBJWT[AMULET];
              encumber-=OBJCUMBER[AMULET];
            }
            else clearbit(wear,AMULET);
            puts('he flees down the dark caverns.');
            clearbit(location[position].objects,DARK);
            injuries[SKULL]=1;
            followfight=time;
            return 0;
          }
          else{
            puts("I'm afraid you have been killed.");
            die();
          }
        }
        else{
          puts('You escape stunned and disoriented from the fight.');
          puts('A victorious bellow echoes from the battlescene.');
          if(back&&position!==back)move(back,BACK);
          else if(ahead&&position!==ahead)move(ahead,AHEAD);
          else if(left&&position!==left)move(left,LEFT);
          else if(right&&position!==right)move(right,RIGHT);
          else move(location[position].link[down],AHEAD);
          return 0;
        }
        break;
      case SHOOT:
        if(testbit(inven,LASER)){
          if(strength-lifeline<=50){
            pr('The '+osh(enemy)+' took a direct hit!\n');
            lifeline+=50;
          }
          else{
            puts('With his bare hand he deflects the laser blast and whips the pistol from you!');
            clearbit(inven,LASER);
            setbit(location[position].objects,LASER);
            carrying-=OBJWT[LASER];
            encumber-=OBJCUMBER[LASER];
          }
        }
        else puts("Unfortunately, you don't have a blaster handy.");
        break;
      case DROP:case DRAW:
        yield* cypher();
        time--;
        break;
      default:
        puts("You don't have a chance, he is too quick.");
        break;
      }
      if(lifeline>=strength){
        pr('You have killed the '+osh(enemy)+'.\n');
        if(enemy===ELF||enemy===DARK)puts('A watery black smoke consumes his body and then vanishes with a peal of thunder!');
        clearbit(location[position].objects,enemy);
        power+=2;
        notes[JINXED]++;
        return 0;
      }
      puts('He attacks...');
      hurt=rnd(NUMOFINJURIES)-(testbit(inven,SHIELD)!==0?1:0)-(testbit(wear,MAIL)!==0?1:0)-(testbit(wear,HELM)!==0?1:0);
      hurt+=(testbit(wear,AMULET)!==0?1:0)+(testbit(wear,MEDALION)!==0?1:0)+(testbit(wear,TALISMAN)!==0?1:0);
      hurt=hurt<0?0:hurt;
      hurt=hurt>=NUMOFINJURIES?NUMOFINJURIES-1:hurt;
      if(!injuries[hurt]){
        injuries[hurt]=1;
        pr("I'm afraid you have suffered "+OUCH[hurt]+'.\n');
      }
      else puts('You emerge unscathed.');
      if(injuries[SKULL]&&injuries[INCISE]&&injuries[NECK]){
        puts("I'm afraid you have suffered fatal injuries.");
        die();
      }
    }
  }
  /* ---------- fly.c: the C reads from the terminal with alarms going off; here a timer and the program's keys ---------- */
  function* visual(){
    destroyed=0;
    if(piped){
      puts('Whoops!  No more memory...');
      return 0;
    }
    var r=yield {fly:true};
    if(r==='die')die();
    return r;
  }
  function fly(resume){
    var flew=0;
    P.program(function(S,done){
      var LINES=S.rows,COLS=S.cols,MIDR=Math.trunc(LINES/2)-1,MIDC=Math.trunc(COLS/2)-1;
      var scr=[],phys=[],cy=0,cx=0,pcy=0,pcx=0,timer=null,over=false,peak=null,i;
      function blank(){var a=[];for(var y=0;y<LINES;y++)a.push(new Array(COLS).fill(' '));return a}
      scr=blank();phys=blank();
      function moveto(y,x){if(x>=COLS||y>=LINES||x<0||y<0)return false;cy=y;cx=x;return true}
      function addch(c){
        if(cy>=LINES)return;
        scr[cy][cx]=c;
        if(++cx>=COLS){cx=0;cy++}
      }
      function addstr(s){for(var k=0;k<s.length;k++){if(cy>=LINES)return;addch(s.charAt(k))}}
      function mvaddch(y,x,c){if(moveto(y,x))addch(c)}
      function mvaddstr(y,x,s){if(moveto(y,x))addstr(s)}
      function show(g,y,x){
        var L=g.map(function(r){return r.join('').replace(/ +$/,'')}).slice(0,S.rows);
        S.draw(L,Math.min(y,S.rows-1),Math.min(x,Math.max(S.cols-1,0)));
      }
      function refresh(){
        for(var y=0;y<LINES;y++)phys[y]=scr[y].slice();
        pcy=cy;pcx=cx;
        if(!peak)show(phys,pcy,pcx);
      }
      function alarm(n){
        if(timer!==null){clearTimeout(timer);timer=null}
        if(n)timer=setTimeout(moveenemy,n*1000);
      }
      function endfly(r){
        over=true;
        alarm(0);
        flew=r;
        S.close();
        done();
      }
      function target(){
        moveto(MIDR,MIDC-10);
        addstr('-------   +   -------');
        for(var n=MIDR-4;n<MIDR-1;n++){
          mvaddch(n,MIDC,'|');
          mvaddch(n+6,MIDC,'|');
        }
      }
      function notarget(){
        moveto(MIDR,MIDC-10);
        addstr('                     ');
        for(var n=MIDR-4;n<MIDR-1;n++){
          mvaddch(n,MIDC,' ');
          mvaddch(n+6,MIDC,' ');
        }
      }
      function blast(){
        var n,snap;
        alarm(0);
        moveto(LINES-1,24);
        addstr(pad(torps,3));
        for(n=LINES-1-2;n>=MIDR+1;n--){
          mvaddch(n,MIDC+MIDR-n,'/');
          mvaddch(n,MIDC-MIDR+n,'\\');
          refresh();
        }
        mvaddch(MIDR,MIDC,'*');
        snap=scr.map(function(r){return r.slice()});
        peak=true;
        for(n=LINES-1-2;n>=MIDR+1;n--){
          mvaddch(n,MIDC+MIDR-n,' ');
          mvaddch(n,MIDC-MIDR+n,' ');
          refresh();
        }
        peak=null;
        show(snap,pcy,pcx);
        setTimeout(function(){if(!over)show(phys,pcy,pcx)},120); /* the wipe, a moment later */
        alarm(1);
      }
      function moveenemy(){
        var d,oldr,oldc;
        timer=null;
        oldr=row;
        oldc=column;
        if(fuel>0){
          if(row+dr<=LINES-3&&row+dr>0)row+=dr;
          if(column+dc<COLS-1&&column+dc>0)column+=dc;
        }
        else if(fuel<0){
          fuel=0;
          mvaddstr(0,60,'*** Out of fuel ***');
        }
        d=(row-MIDR)*(row-MIDR)+(column-MIDC)*(column-MIDC);
        if(d<16){
          row+=(rnd(9)-4)%(4-Math.abs(row-MIDR));
          column+=(rnd(9)-4)%(4-Math.abs(column-MIDC));
        }
        clock--;
        mvaddstr(oldr,oldc-1,'   ');
        if(cross)target();
        mvaddstr(row,column-1,'/-\\');
        moveto(LINES-1,24);
        addstr(pad(torps,3));
        moveto(LINES-1,42);
        addstr(pad(fuel,3));
        moveto(LINES-1,57);
        addstr(pad(clock,3));
        refresh();
        alarm(1);
      }
      /* screen() */
      var r,c,n,k=rnd(100);
      cy=cx=0;
      for(n=0;n<k;n++){
        r=rnd(LINES-3)+1;
        c=rnd(COLS);
        mvaddch(r,c,'.');
      }
      mvaddstr(LINES-1-1,21,'TORPEDOES           FUEL           TIME');
      refresh();
      row=rnd(LINES-3)+1;
      column=rnd(COLS-2)+1;
      moveenemy();
      return {
        feed:function(key){
          if(over)return;
          if(key==='C-c'){endfly('die');return}
          switch(key){
          case 'h':case 'r':dc=-1;fuel--;break;
          case 'H':case 'R':dc=-5;fuel-=10;break;
          case 'l':dc=1;fuel--;break;
          case 'L':dc=5;fuel-=10;break;
          case 'j':case 'u':dr=1;fuel--;break;
          case 'J':case 'U':dr=5;fuel-=10;break;
          case 'k':case 'd':dr=-1;fuel--;break;
          case 'K':case 'D':dr=-5;fuel-=10;break;
          case '+':
            if(cross){cross=0;notarget()}
            else cross=1;
            break;
          case ' ':case 'f':
            if(torps){
              torps-=2;
              blast();
              if(row===MIDR&&column-MIDC<2&&MIDC-column<2){
                destroyed=1;
                alarm(0);
              }
            }
            else mvaddstr(0,0,'*** Out of torpedoes. ***');
            break;
          case 'q':
            endfly(0);
            return;
          default:
            mvaddstr(0,26,'Commands = r,R,l,L,u,U,d,D,f,+,q');
            return;
          }
          if(destroyed){endfly(1);return}
          if(clock<=0){endfly('die');return}
        },
        draw:function(){show(phys,pcy,pcx)}
      };
    });
    P.queue(function(){resume(flew)}); /* inside this command's turn, before the shell's prompt */
  }
  /* ---------- cypher.c ---------- */
  /* every object for the verb's word, each time through taking up where the last left off */
  function* each(test,fn){
    for(var n=0;n<NUMOFOBJECTS;n++)
      if(test(n)){
        wordvalue[wordnumber+1]=n;
        wordnumber=yield* fn();
      }
    wordnumber+=2;
  }
  function here(n){return testbit(location[position].objects,n)&&osh(n)!==''}
  function holding(n){return testbit(inven,n)}
  function wearing(n){return testbit(wear,n)}
  function everything(){return wordnumber<wordcount&&wordvalue[wordnumber+1]===EVERYTHING}
  function sscanfd(s,was){var m=/^[ \t\n\v\f\r]*([-+]?[0-9]+)/.exec(s);return m?parseInt(m[1],10)|0:was}
  function* cypher(){
    var n,junk=1,lflag=-1,buf,v;
    while(wordtype[wordnumber]===ADJS)wordnumber++;
    while(wordnumber<=wordcount){
      switch(wordvalue[wordnumber]){
      case UP:
        if(location[position].link[access]||wiz||tempwiz){
          if(!location[position].link[access])puts('Zap!  A gust of wind lifts you up.');
          if(!move(location[position].link[up],AHEAD))return -1;
        }
        else{
          puts('There is no way up');
          return -1;
        }
        lflag=0;
        break;
      case DOWN:
        if(!move(location[position].link[down],AHEAD))return -1;
        lflag=0;
        break;
      case LEFT:
        if(!move(left,LEFT))return -1;
        lflag=0;
        break;
      case RIGHT:
        if(!move(right,RIGHT))return -1;
        lflag=0;
        break;
      case AHEAD:
        if(!move(ahead,AHEAD))return -1;
        lflag=0;
        break;
      case BACK:
        if(!move(back,BACK))return -1;
        lflag=0;
        break;
      case SHOOT:
        if(everything())yield* each(here,function*(){return shoot()});
        else shoot();
        break;
      case TAKE:
        if(everything())yield* each(here,function*(){return yield* take(location[position].objects)});
        else yield* take(location[position].objects);
        break;
      case DROP:
        if(everything())yield* each(holding,function*(){return drop('Dropped')});
        else drop('Dropped');
        break;
      case KICK:case THROW:
        if(wordnumber<wordcount&&wordvalue[wordnumber+1]===EVERYTHING){
          for(n=0;n<NUMOFOBJECTS;n++)
            if(testbit(inven,n)||here(n)){
              wordvalue[wordnumber+1]=n;
              wordnumber=throwit(wordvalue[wordnumber]===KICK?'Kicked':'Thrown');
            }
          wordnumber+=2;
        }
        else throwit(wordvalue[wordnumber]===KICK?'Kicked':'Thrown');
        break;
      case TAKEOFF:
        if(everything())yield* each(wearing,takeoff);
        else yield* takeoff();
        break;
      case DRAW:
        if(everything())yield* each(wearing,draw);
        else yield* draw();
        break;
      case PUTON:
        if(everything())yield* each(here,puton);
        else yield* puton();
        break;
      case WEARIT:
        if(everything())yield* each(holding,function*(){return wearit()});
        else wearit();
        break;
      case EAT:
        if(everything())yield* each(holding,function*(){return eat()});
        else eat();
        break;
      case PUT:
        yield* put();
        break;
      case INVEN:
        if(ucard(inven)){
          puts('You are holding:\n');
          for(n=0;n<NUMOFOBJECTS;n++)if(testbit(inven,n))pr('\t'+osh(n)+'\n');
          pr('\n= '+carrying+' kilogram'+(carrying===1?'.':'s.')+' ('+(WEIGHT?div(carrying*100,WEIGHT):-1)+'%)\n');
          pr('Your arms are '+div(encumber*100,CUMBER)+'% full.\n');
        }
        else puts("You aren't carrying anything.");
        if(ucard(wear)){
          puts('\nYou are wearing:\n');
          for(n=0;n<NUMOFOBJECTS;n++)if(testbit(wear,n))pr('\t'+osh(n)+'\n');
        }
        else puts('\nYou are stark naked.');
        if(card(injuries,NUMOFINJURIES)){
          puts('\nYou have suffered:\n');
          for(n=0;n<NUMOFINJURIES;n++)if(injuries[n])pr('\t'+OUCH[n]+'\n');
          pr('\nYou can still carry up to '+WEIGHT+' kilogram'+(WEIGHT===1?'.':'s.')+'\n');
        }
        else puts('\nYou are in perfect health.');
        break;
      case USE:
        lflag=use();
        break;
      case LOOK:
        if(!notes[CANTSEE]||testbit(inven,LAMPON)||testbit(location[position].objects,LAMPON)||matchlight){
          beenthere[position]=2;
          writedes();
          printobjs();
          if(matchlight){
            puts('\nYour match splutters out.');
            matchlight=0;
          }
        }
        else puts("I can't see anything.");
        return -1;
      case SU:
        if(wiz||tempwiz){
          pr('\nRoom (was '+position+') = ');
          buf=yield* fgets(10);
          if(buf!==null&&buf.charAt(0)!=='\n')position=sscanfd(buf,position);
          pr('Time (was '+time+') = ');
          buf=yield* fgets(10);
          if(buf!==null&&buf.charAt(0)!=='\n')time=sscanfd(buf,time);
          pr('Fuel (was '+fuel+') = ');
          buf=yield* fgets(10);
          if(buf!==null&&buf.charAt(0)!=='\n')fuel=sscanfd(buf,fuel);
          pr('Torps (was '+torps+') = ');
          buf=yield* fgets(10);
          if(buf!==null&&buf.charAt(0)!=='\n')torps=sscanfd(buf,torps);
          pr('CUMBER (was '+CUMBER+') = ');
          buf=yield* fgets(10);
          if(buf!==null&&buf.charAt(0)!=='\n')CUMBER=sscanfd(buf,CUMBER);
          pr('WEIGHT (was '+WEIGHT+') = ');
          buf=yield* fgets(10);
          if(buf!==null&&buf.charAt(0)!=='\n')WEIGHT=sscanfd(buf,WEIGHT);
          pr('Clock (was '+clock+') = ');
          buf=yield* fgets(10);
          if(buf!==null&&buf.charAt(0)!=='\n')clock=sscanfd(buf,clock);
          pr('Wizard (was '+wiz+', '+tempwiz+') = ');
          buf=yield* fgets(10);
          if(buf!==null&&buf.charAt(0)!=='\n'){
            junk=sscanfd(buf,junk);
            if(!junk)tempwiz=wiz=0;
          }
          pr('\nDONE.\n');
          return 0;
        }
        else puts("You aren't a wizard.");
        break;
      case SCORE:
        pr('\tPLEASURE\tPOWER\t\tEGO\n');
        pr('\t'+pad(pleasure,3)+'\t\t'+pad(power,3)+'\t\t'+pad(ego,3)+'\n\n');
        pr('This gives you the rating of '+rate()+' in '+time+' turns.\n');
        v=card(beenthere,NUMOFROOMS);
        pr('You have visited '+v+' out of '+NUMOFROOMS+' rooms this run ('+Math.trunc(v*100/NUMOFROOMS)+'%).\n');
        break;
      case KNIFE:case KILL:
        murder();
        break;
      case UNDRESS:case RAVAGE:
        ravage();
        break;
      case SAVE:
        save();
        break;
      case FOLLOW:
        lflag=yield* follow();
        break;
      case GIVE:
        give();
        break;
      case KISS:
        kiss();
        break;
      case LOVE:
        yield* love();
        break;
      case RIDE:
        lflag=ride();
        break;
      case DRIVE:
        lflag=yield* drive();
        break;
      case LIGHT:
        light();
        break;
      case LAUNCH:
        if(!launch())return -1;
        else lflag=0;
        break;
      case LANDIT:
        if(!land())return -1;
        else lflag=0;
        break;
      case TIME:
        chime();
        break;
      case SLEEP:
        yield* zzz();
        break;
      case DIG:
        dig();
        break;
      case JUMP:
        lflag=jump();
        break;
      case BURY:
        bury();
        break;
      case SWIM:
        puts("Surf's up!");
        break;
      case DRINK:
        yield* drink();
        break;
      case QUIT:
        die();
        /* falls through */
      default:
        puts("How's that?");
        return -1;
      }
      if(wordnumber<wordcount&&word(wordnumber++)===',')continue;
      else return lflag;
    }
    return lflag;
  }
  /* ---------- battlestar.c ---------- */
  function* main(){
    initialize(argv.length<2||argv[1]!=='-r');
    for(;;){
      yield* news();
      beenthere[position]++;
      if(notes[LAUNCHED])yield* crash();
      if(matchlight){
        puts('Your match splutters out.');
        matchlight=0;
      }
      if(!notes[CANTSEE]||testbit(inven,LAMPON)||testbit(location[position].objects,LAMPON)){
        writedes();
        printobjs();
      }
      else puts("It's too dark to see anything in here!");
      whichway(location[position]);
      for(;;){
        var s=yield* getcom(LINELENGTH,'>-: ','Please type in something.'),next=0,r;
        for(wordcount=0;next>=0&&wordcount<20;wordcount++)next=getword(s,next,wordcount);
        parse();
        r=yield* cypher();
        if(r===-1)continue;
        if(r===0)break;
        return;
      }
    }
  }
  /* ---------- running it ---------- */
  function fail(what){flush();P.typeLine(what+' (core dumped)','err')}
  function step(v){
    for(;;){
      var r;
      try{r=G.next(v)}
      catch(e){
        if(e===EXIT){flush();return}
        if(e===SEGV||e instanceof TypeError){fail('Segmentation fault');return}
        if(e===FPE){fail('Floating exception');return}
        throw e;
      }
      if(r.done){flush();return}
      var w=r.value;
      if(w===READ){
        if(pipe&&np<pipe.length){v=pipe[np++];continue}
        var p=o;o='';
        P.ask(p,step,true);
        return;
      }
      if(w.sleep){
        flush();
        P.queue(function(){return P.sleep(w.sleep)});
        P.queue(function(){step()});
        return;
      }
      if(w.fly){flush();fly(step);return}
    }
  }
  G=main();
  P.queue(function(){step()});
}});
})(window.Phosphor);
