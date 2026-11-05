/* PHOSPHOR-9 terminal: nods to Zork for the machines that have nothing else to find. Not the game: that is on
   a disk that will not run. Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE.

   The quoted lines below are from Infocom's source for Zork I (github.com/historicalsource/zork1), under this licence:

   MIT License

   Copyright (c) 2025 Microsoft

   Permission is hereby granted, free of charge, to any person obtaining a copy
   of this software and associated documentation files (the "Software"), to deal
   in the Software without restriction, including without limitation the rights
   to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   copies of the Software, and to permit persons to whom the Software is
   furnished to do so, subject to the following conditions:

   The above copyright notice and this permission notice shall be included in all
   copies or substantial portions of the Software.

   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
   SOFTWARE. */
(function(P){
'use strict';
var LEAFLET=['"WELCOME TO ZORK!','',
'ZORK is a game of adventure, danger, and low cunning. In it you',
'will explore some of the most amazing territory ever seen by mortals.',
'No computer should be without one!"'];
var FCD3=['"\tFlood Control Dam #3','',
'FCD#3 was constructed in year 783 of the Great Underground Empire to',
'harness the mighty Frigid River. This work was supported by a grant of',
'37 million zorkmids from your omnipotent local tyrant Lord Dimwit',
'Flathead the Excessive. This impressive structure is composed of',
'370,000 cubic feet of concrete, is 256 feet tall at the center, and 193',
'feet wide at the top. The lake created behind the dam has a volume',
'of 1.7 billion cubic feet, an area of 12 million square feet, and a',
'shore line of 36 thousand feet.','',
'The construction of FCD#3 took 112 days from ground breaking to',
'the dedication. It required a work force of 384 slaves, 34 slave',
'drivers, 12 engineers, 2 turtle doves, and a partridge in a pear',
'tree. The work was managed by a command team composed of 2345',
'bureaucrats, 2347 secretaries (at least two of whom could type),',
'12,256 paper shufflers, 52,469 rubber stampers, 245,193 red tape',
'processors, and nearly one million dead trees.','',
'We will now point out some of the more interesting features',
'of FCD#3 as we conduct you on a guided tour of the facilities:','',
'        1) You start your tour here in the Dam Lobby. You will notice',
'on your right that...."'];
var HELLOS=['Hello.','Good day.',"Nice weather we've been having lately.",'Goodbye.'],opened=false;
P.zork={leaflet:LEAFLET,fcd3:FCD3};
function say(names,run){P.command({names:names,hidden:true,noHelpFlag:true,run:run})}
function unknown(w,raw,a){if(!P.fallback(w[0],raw,a))P.typeLine(P.profile.notFound.replace('%s',w[0]),'err')}
say(['xyzzy','plugh'],function(){P.typeLine('A hollow voice says "Fool."')});
say(['zork'],function(){P.typeLine('At your service!')});
say(['look'],function(){P.typeLine('It is pitch black. You are likely to be eaten by a grue.')});
say(['hello'],function(){P.typeLine(HELLOS[Math.floor(Math.random()*HELLOS.length)])});
say(['open'],function(a,raw,w){
  if((w[1]||'').toLowerCase()!=='mailbox'||w[2]){unknown(w,raw,a);return}
  P.typeLine(opened?'It is already open.':'Opening the small mailbox reveals a leaflet.');
  opened=true;
});
say(['read'],function(a,raw,w){
  if((w[1]||'').toLowerCase()!=='leaflet'||w[2]||!opened){unknown(w,raw,a);return}
  P.say(LEAFLET);
});
})(window.Phosphor);
