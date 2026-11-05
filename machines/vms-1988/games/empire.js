/* PHOSPHOR-9 terminal: machine "vms-1988", EMPIRE. Ported to JavaScript for this terminal from Chuck Simmons's C
   Empire 1.2 as Walter Bright's Empire-for-VMS keeps it (K&R, "EMPIRE, Version 5.00 site Amdahl 1-Apr-1988", the
   nearest source found to what a 1988 site ran): it is translated statement by statement, by a tool, with its comments.
   Bright's README says of this copy: "In my opinion, since this code is based on a ripoff without acknowledgment of
   my registered copyright of Empire, the copyright claims in the code only apply to the derived works." Empire,
   Wargame of the Century is his trademark.

   Each source file carries: (c) Copyright 1987, 1988 Chuck Simmons
   See the file COPYING, distributed with empire, for restriction and warranty information. That file follows.


		    EMPIRE GENERAL PUBLIC LICENSE

 Copyright (C)  1987, 1988 Chuck Simmons
 Copyleft (GNU) 1987, 1988 Chuck Simmons

 Everyone is permitted to copy and distribute verbatim copies
 of this license, but changing it is not allowed.  You can also
 use this wording to make the terms for other programs.

  The license agreements of most software companies keep you at the
mercy of those companies.  By contrast, our general public license is
intended to give everyone the right to share EMPIRE.  To make sure that
you get the rights we want you to have, we need to make restrictions
that forbid anyone to deny you these rights or to ask you to surrender
the rights.  Hence this license agreement.

  Specifically, we want to make sure that you have the right to give
away copies of EMPIRE, that you receive source code or else can get it
if you want it, that you can change EMPIRE or use pieces of it in new
free programs, and that you know you can do these things.

  To make sure that everyone has such rights, we have to forbid you to
deprive anyone else of these rights.  For example, if you distribute
copies of EMPIRE, you must give the recipients all the rights that you
have.  You must make sure that they, too, receive or can get the
source code.  And you must tell them their rights.

  Also, for our own protection, we must make certain the4�everyone
finds out that there is no warranty for EMPIRE.  If EMPIRE is modified by
someone else and passed on, we want its recipients to know that what
they have is not what we distributed, so that any problems introduced
by others will not reflect on our reputation.

  Therefore we (Chuck Simmons) make the following terms which say what
you must do to be allowed to distribute or change EMPIRE.


			COPYING POLICIES

  1. You may copy and distribute verbatim copies of EMPIRE source code
as you receive it, in any medium, provided that you conspicuously and
appropriately publish on each copy a valid copyright notice "Copyright
(C) 1988 Chuck Simmons" (or with whatever year is appropriate); keep
intact the notices on all files that refer to this License Agreement
and to the absence of any warranty; and give any other recipients of
the EMPIRE program a copy of this License Agreement along with the
program.  You may charge a distribution fee for the physical act of
transferring a copy.

  2. You may modify your copy or copies of EMPIRE or any portion of it,
and copy and distribute such modifications under the terms of
Paragraph 1 above, provided that you also do the following:

    a) cause the modified files to carry prominent notices stating
    that you changed the files and the date of any change; and

    b) cause the whole of any work that you distribute or publish,
    that in whole or in part contains or is a derivative of EMPIRE or
    any part thereof, to be licensed at no charge to all third
    parties on terms identical to those contained in this License
    Agreement (except that you may choose to grant more extensive
    warranty protection to some or all third parties, at your option).

    c) You may charge a distribution fee for the physical act of
    transferring a copy, and you may at your option offer warranty
    protection in exchange for a fee.

Mere aggregation of another unrelated program with this program (or its
derivative) on a volume of a storage or distribution medium does not bring
the other program under the scope of these terms.

  3. You may copy and distribute EMPIRE (or a portion or derivative of it,
under Paragraph 2) in object code or executable form under the terms of
Paragraphs 1 and 2 above provided that you also do one of the following:

    a) accompany it with the complete corresponding machine-readable
    source code, which must be distributed under the terms of
    Paragraphs 1 and 2 above; or,

    b) accompany it with a written offer, valid for at least three
    years, to give any third party free (except for a nominal
    shipping charge) a complete machine-readable copy of the
    corresponding source code, to be distributed under the terms of
    Paragraphs 1 and 2 above; or,

    c) accompany it with the information you received as to where the
    corresponding source code may be obtained.  (This alternative is
    allowed only for noncommercial distribution and only if you
    received the program in object code or executable form alone.)

For an executable file, complete source code means all the source code for
all modules it contains; but, as a special exception, it need not include
source code for modules which are standard libraries that accompany the
operating system on which the executable file runs.

  4. You may not copy, sublicense, distribute or transfer EMPIRE
except as expressly provided under this License Agreement.  Any attempt
otherwise to copy, sublicense, distribute or transfer EMPIRE is void and
your rights to use the program under this License agreement shall be
automatically terminated.  However, parties who have received computer
software programs from you with this License Agreement will not have
their licenses terminated so long as such parties remain in full compliance.

  5. If you wish to incorporate parts of EMPIRE into other free programs
whose distribution conditions are different, write to Chuck Simmons
at 1250 E. Arques Ave (MS 269), Box 3470, Sunnyvale, CA  94088-3470,
USA.  We have not yet worked out a simple rule that can be stated here,
but we will often permit this.  We will be guided by the two goals of
preserving the free status of all derivatives of our free software and
of promoting the sharing and reuse of software.

Your comments and suggestions about our licensing policies and our
software are welcome!  This contract was based on the contract made by
the Free Software Foundation.  Please contact the Free Software
Foundation, Inc., 675 Mass Ave, Cambridge, MA 02139, USA, or call (617)
876-3296 for details on copylefted materal in general, or contact us
via electronic mail at amdahl!chuck.

(Please note that the Free Software Foundation is in no way associated
with EMPIRE, and any lack of quality inherent in EMPIRE should not
reflect on the reputation of that noble enterprise.)


		       NO WARRANTY

  BECAUSE EMPIRE IS LICENSED FREE OF CHARGE, WE PROVIDE ABSOLUTELY NO
WARRANTY, TO THE EXTENT PERMITTED BY APPLICABLE STATE LAW.  EXCEPT WHEN
OTHERWISE STATED IN WRITING, CHUCK SIMMONS AND/OR OTHER PARTIES PROVIDE
EMPIRE "AS IS" WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESSED OR IMPLIED,
INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS FOR A PARTICULAR PURPOSE. THE ENTIRE RISK AS TO THE QUALITY
AND PERFORMANCE OF EMPIRE IS WITH YOU.  SHOULD EMPIRE PROVE DEFECTIVE,
YOU ASSUME THE COST OF ALL NECESSARY SERVICING, REPAIR OR CORRECTION.

  IN NO EVENT UNLESS REQUIRED BY APPLICABLE LAW WILL CHUCK SIMMONS
AND/OR ANY OTHER PARTY WHO MAY MODIFY AND REDISTRIBUTE EMPIRE AS PERMITTED
ABOVE, BE LIABLE TO YOU FOR DAMAGES, INCLUDING ANY LOST PROFITS, LOST
MONIES, OR OTHER SPECIAL, INCIDENTAL OR CONSEQUENTIAL DAMAGES ARISING
OUT OF THE USE OR INABILITY TO USE (INCLUDING BUT NOT LIMITED TO LOSS
OF DATA OR DATA BEING RENDERED INACCURATE OR LOSSES SUSTAINED BY THIRD
PARTIES OR A FAILURE OF THE PROGRAM TO OPERATE WITH ANY OTHER PROGRAMS)
EMPIRE, EVEN IF YOU HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES,
OR FOR ANY CLAIM BY ANY OTHER PARTY.


   Differences from the source: 4.3BSD's rand and curses behaviour, as on the machines it was written for; make_map's
   count no longer reads one cell past its row (that read depends on memory layout); empsave.dat, empmovie.dat and the
   map printout are records in this browser's storage or files on this machine, checked when read; screen colours
   (added in 2000) are left out; between auto-mode rounds it lets the keyboard in, where the source would spin; the two kermyt debugging logs are gone;
   ^C ends the game where it stands, as an uncaught interrupt does. The screen's size is taken at the start, as curses
   does, never less than 24 by 80; on a smaller glass what fits is shown from the top left corner.

History

	Apparently, this game was originally written outside of Digital,
	probably at a university.  The game was ported to DEC's VAX/VMS
	from the TOPS-10/20 FORTRAN sources available around fall 1979.
	Ed James got hold of the sources at Berkeley and converted
	portions of the code to C, mostly to use curses for the screen
	handling.  He published his modified sources on the net in
	December 1986.  Because this game ran on VMS machines for so
        long, a previous version is known as VMS Empire.

	In early 1987 I reverse engineered the program and wrote a
	version completely written in C.  In doing this, I used lots
	of structures and defined constants, and I attempted to make
	the code flexible and easy to modify.  The algorithms used
	in this C version are completely new, the names of the commands
	have been changed to be more mnemonic, and new commands have
	been implemented.  Only the format of the display is the same.
        I suspect that many of my changes are slower and less
        intelligently implemented than the originals.  Also, I have
	not implemented some of the original functionality.
	However, my hope is that the commented C sources I have written
	will prove far easier to modify and enhance than the original
        FORTRAN sources.  If you make changes for the better, by
        all means send Ed James and I a copy.

	The basic game has been heavily modified.  I've changed the
	types of objects built, modified the parameters on others,
	and added lots of new kinds of movement functions.  Read
	the man page for a complete description.

	The file 'bugs' contains lots of ideas for enhancements,
	and describes the bugs I haven't been able to find.

Organization

        I have attempted to organize the sources into relatively few
        coherent pieces.  The pieces are:

        empire.h   -- definitions of data structures
        extern.h   -- definitions of global variables
        data.c     -- constant data
	main.c     -- option parsing
        empire.c   -- main program loop and outermost command handler
        usermove.c -- move the user's pieces
        compmove.c -- move the computer's pieces
        edit.c     -- handle the user's edit mode commands
        game.c     -- saving, restoring, and initializing the game board
        display.c  -- update the screen
	term.c     -- deal with information area of screen
        math.c     -- mathematical routines
        object.c   -- routines for manipulating objects
	attack.c   -- handle attacks between pieces
	map.c      -- find paths for moving pieces
	util.c     -- miscellaneous routines, especially I/O.

Debugging notes

	From command mode, there are two special commands that
	can be used to turn debugging mode on or off.  "++" turns
	debugging mode on.  "+-" turns debugging mode off.

	When debugging mode is turned on, the following commands are
	available:

	"#" -- display a sector of the computer's map.

	"%" -- enter "movie" mode.  The computer continuously makes
	       moves, and the computer's map is shown on the screen.
	       This is useful for debugging the algorithm used by the
	       computer when it makes a move.  Don't confuse this
	       with saving a movie and replaying it.

	"@" -- enable/disable "trace pathmap" mode.  If this command
	       is followed by a "+", trace pathmap mode is enabled.
	       If this command is followed by a "-", trace pathmap
	       mode is disabled.  In this mode, every time a "pathmap"
	       is created, it is displayed.  This is useful for
	       debugging the subroutines that search for an optimal
	       path along which to move a piece.

	"$" -- enable/disable "print_debug".  This command is also
	       followed by either a "+" or "-".  In this mode,
	       various messages will be printed out at times which
	       may indicate that something is being done non-optimally.

	"&" -- enable/disable "print_vmap".  This command is followed
	       by a char that specifies the type of vmap to be
	       displayed.  Values are

		"a" -- army load maps
		"l" -- transport load maps
		"u" -- transport unload maps
		"s" -- ship maps
		"i" -- pruned explore map

	       Any other character disables the printing of vmaps.

	The program will not provide any prompts for the debugging
	commands.  If you make a mistake, the computer just beeps.

	You can also replay a saved movie with the normal "W" command
	when debugging mode is turned on.

	Also, the -DDEBUG flag can be turned on to cause consistency
	checking to be performed frequently on the internal database.
	This consistency checking is fairly exhaustive and checks for
	all sorts of screwed up pointers.  My measurements suggest
	that consistency checking causes the program to run half
	as fast.

Final Notes

	Unfortunately, I have a rather powerful mainframe at my
	disposal which is somewhere between 10 and 40 times as
	fast as a 68020 based computer.  This means I can afford
	to use extremely inefficient algorithms.  I suspect that
	running this program on a smaller machine, such as a Sun
	workstation or Vax will not be overly rewarding.  In particular,
	the computer will take a very long time to move its pieces,
	and it may not be desirable to save the game after every move.
	(You mean your system doesn't write out 1/2 megabyte files in a
	few milliseconds?)  This second problem is easily fixed, but
	I don't yet have any good ideas for fixing the first problem.

	The size of a saved file can be easily tuned by reducing the
	LIST_SIZE constant in empire.h.  The only current simple tweak
	for making the computer move faster is to reduce the size
	of a map.

Chuck Simmons
amdahl!chuck

Ed James
edjames@ic.berkeley.edu
ucbvax!edjames

	My changes enable color on machines with terminfo color support, for
	a dramatic improvement in appearance and readability of the display.
	Color support, if present, will be auto-detected at compilation time.

	They also implement and document a `save-interval' option, addressing
	one of the misfeatures noted in the bugs file.

	I've also tweaked the sources so they compile clean under GCC -- they
	assumed the older K&R model of forward reference, causing many warning
	references.

	Finally, I've sped up expand_perimeter by cutting down on the
	number of array references it has to compute. This eliminates several
	multiplies from the inner loop, and is a technique that should be
	applied much more widely in the code.

Eric S. Raymond
esr@snark.thyrsus.com
(home page: //www.ccil.org/~esr/home.html)
*/
(function(P){
'use strict';
/* ---------- what C and its libraries give the source ---------- */
var EXIT={},S0=null,$scr=null,$cur=null,$cy=0,$cx=0,LINES=24,COLS=80,curscr=null,$echo=false,$clearok=false,$qk=[];
function $div(a,b){if(b===0)throw new Error('division by zero');return Math.trunc(a/b)}
function $Z(n){return new Array(n).fill(0)}
function $A(n,f){var a=new Array(n);for(var i=0;i<n;i++)a[i]=f();return a}
function $chr(n){return String.fromCharCode(n)}
function $ref(g,s){return {get v(){return g()},set v(x){s(x)}}}
function $copypath(d,s){for(var i=0;i<d.length;i++){var x=d[i],y=s[i];x.cost=y.cost;x.inc_cost=y.inc_cost;x.terrain=y.terrain}}
function $zeropath(d){for(var i=0;i<d.length;i++){var x=d[i];x.cost=0;x.inc_cost=0;x.terrain=0}}
function memcpy(d,s){for(var i=0;i<d.length;i++){d[i].contents=s[i].contents;d[i].seen=s[i].seen}}
function bzero(a){a.fill(0)}
function strlen(s){return s?s.length:0}
function strchr(s,c){var i=s.indexOf(c);return i<0?null:i+1} /* a pointer, as index+1: the source's p - s is written p-1 */
function islower(c){return typeof c==='string'&&c>='a'&&c<='z'}
function toupper(c){return c.toUpperCase()}
function tolower(c){return c.toLowerCase()}
function atoi(s){return parseInt(s,10)||0}
function beep(){}
function sprintf(f){
  var a=arguments,n=1;
  return f.replace(/%(-?)(\d*)([dsc%])/g,function(all,l,w,c){
    if(c==='%')return '%';
    var v=a[n++],s;
    if(c==='d')s=String(Math.trunc(+v)||0);
    else s=v===0||v===null||v===undefined?'':String(v);
    w=+w;
    if(s.length<w)s=l?s+' '.repeat(w-s.length):' '.repeat(w-s.length)+s;
    return s;
  });
}
/* 4.3BSD's rand, which is what Empire's rand() and srand(time & 0xFFFF) meant on the machines it was written on */
var $rx=1;
function rand(){$rx=(Math.imul($rx,1103515245)+12345)&0x7fffffff;return $rx}
function rndini(){$rx=(Math.floor(Date.now()/1000)&0xFFFF)>>>0}

/* ---------- the little of curses it uses, with 4.3BSD's behaviour: stdscr changes show at refresh ---------- */
function $blank(){return $A(LINES,function(){return new Array(COLS).fill(' ')})}
function initscr(){}
function noecho(){$echo=false}
function echo(){$echo=true}
function crmode(){}
function nocrmode(){}
function endwin(){}
function clearok(){}
function move(r,c){if(r<0||r>=LINES||c<0||c>=COLS)return;$cy=r;$cx=c}
function addch(c){
  if(c==='\n'){clrtoeol();$cx=0;if($cy<LINES-1)$cy++;return}
  if(c==='\b'){if($cx>0)$cx--;return}
  if($cy<LINES&&$cx<COLS)$scr[$cy][$cx]=String(c);
  $cx++;
  if($cx>=COLS){$cx=0;if($cy<LINES-1)$cy++}
}
function addstr(s){for(var i=0;i<s.length;i++)addch(s.charAt(i))}
function clrtoeol(){var R=$scr[$cy];for(var i=$cx;i<COLS;i++)R[i]=' '}
function clear(){$scr=$blank();$cy=0;$cx=0}
function refresh(){
  for(var r=0;r<LINES;r++)for(var c=0;c<COLS;c++)$cur[r][c]=$scr[r][c];
  $cury=$cy;$curx=$cx;
  $show();
}
var $cury=0,$curx=0;
function $show(){
  if(!S0)return;
  /* the 80-column screen on a narrower or shorter glass: what fits, from the corner */
  var C=$cur.slice(0,S0.rows).map(function(R){return R.slice(0,S0.cols)});
  S0.drawGrid(C,Math.min($cury,S0.rows-1),Math.min($curx,S0.cols-1));
}
function* getch(){
  var c=yield {key:true};
  if($echo){
    if($cy<LINES&&$cx<COLS)$cur[$cy][$cx]=c;
    addch(c);
    $cury=$cy;$curx=$cx;
    $show();
  }
  return c;
}
function* getstr(){
  /* the terminal's cooked mode does the rubbing out; the source sees the finished line */
  var b='',y=$cy,x=$cx;
  $echo=true;
  for(;;){
    var c=yield {key:true,line:true};
    if(c==='\n')break;
    if(c==='\b'){
      if(b){b=b.slice(0,-1);$cx--;$scr[$cy][$cx]=' ';$cur[$cy][$cx]=' '}
      $cury=$cy;$curx=$cx;$show();
      continue;
    }
    b+=c;
    if($cy<LINES&&$cx<COLS)$cur[$cy][$cx]=c;
    addch(c);
    $cury=$cy;$curx=$cx;
    $show();
  }
  return b;
}
function* napms(d){yield {sleep:d}}
/* ---------- term.c and util.c: where C's char pointers would be awkward ---------- */
function* get_str(){ // Get a string from the user, echoing characters all the while.
  echo();
  var s=yield* get_strq();
  noecho();
  return s;
}
function* get_strq(){ // Get a string from the user, ignoring the current echo mode.
  nocrmode();
  refresh();
  var b=yield* getstr();
  need_delay=0;
  yield* info(0,0,0);
  crmode();
  return b;
}
function* getint(message){ // Input an integer from the user.
  var buf,i;
  for(;;){ /* until we get a legal number */
    prompt(message,0,0,0,0,0,0,0,0);
    buf=yield* get_str();
    for(i=0;i<buf.length;i++){
      if(buf.charAt(i)<'0'||buf.charAt(i)>'9'){
        error("Please enter an integer.",0,0,0,0,0,0,0,0);
        break;
      }
    }
    if(i===buf.length){ /* no error yet? */
      if(i>7) /* too many digits? */
        error("Please enter a small integer.",0,0,0,0,0,0,0,0);
      else return atoi(buf);
    }
  }
}
function tupper(s){return s.toUpperCase()}
function ttinit(){ // Initialize the terminal.
  noecho();
  lines=LINES;
  cols=COLS;
  if(lines>MAP_HEIGHT+NUMTOPS+1)lines=MAP_HEIGHT+NUMTOPS+1;
  if(cols>MAP_WIDTH+NUMSIDES)cols=MAP_WIDTH+NUMSIDES;
}
function redraw(){$show()} // Redraw the screen.
function assert(expression,file,line){ // Report a bug.
  throw new Error('assert failed: file '+file+' line '+line+': '+expression);
}
function empend(){ // End the game by cleaning up the display.
  close_disp();
  throw EXIT;
}
/* ---------- saving: empsave.dat and empmovie.dat become JSON records in this browser's storage ---------- */
function save_game(){
  var rec={v:1,
    map:map.map(function(m){return m.contents}).join(''),
    board:map.map(function(m){return m.on_board?1:0}).join(''),
    comp:comp_map.map(function(m){return m.contents}).join(''),compseen:comp_map.map(function(m){return m.seen}),
    user:user_map.map(function(m){return m.contents}).join(''),userseen:user_map.map(function(m){return m.seen}),
    city:city.map(function(c){return [c.loc,c.owner,c.func,c.work,c.prod]}),
    obj:[],date:date,automove:automove,resigned:resigned,debug:debug,win:win,save_movie:save_movie,user_score:user_score,comp_score:comp_score};
  object.forEach(function(o,i){
    if(o.owner===UNOWNED&&o.hits===0&&!o.type&&!o.loc)return;
    rec.obj.push([i,o.owner,o.type,o.loc,o.func,o.hits,o.moved,o.count,o.range,o.ship?object.indexOf(o.ship):-1]);
  });
  P.save('empire/save',rec);
  topmsg(3,"Game saved.",0,0,0,0,0,0,0,0);
}
function $int(v,lo,hi){return Number.isInteger(v)&&v>=lo&&v<=hi}
function $restore(){
  var r=P.saved('empire/save'),i;
  if(!r||typeof r!=='object')return false;
  function str(x){return typeof x==='string'&&x.length===MAP_SIZE}
  function seen(x){return Array.isArray(x)&&x.length===MAP_SIZE&&x.every(function(v){return Number.isInteger(v)})}
  if(!str(r.map)||!str(r.board)||!str(r.comp)||!str(r.user)||!seen(r.compseen)||!seen(r.userseen))return false;
  if(!Array.isArray(r.city)||r.city.length!==NUM_CITY||!Array.isArray(r.obj)||r.obj.length>LIST_SIZE)return false;
  for(i=0;i<NUM_CITY;i++){
    var c=r.city[i];
    if(!Array.isArray(c)||!$int(c[0],0,MAP_SIZE-1)||!$int(c[1],0,2)||!Array.isArray(c[2])||c[2].length!==NUM_OBJECTS||!c[2].every(function(v){return Number.isInteger(v)})||!Number.isInteger(c[3])||!(c[4]===NOPIECE||$int(c[4],0,NUM_OBJECTS-1)))return false;
  }
  for(i=0;i<r.obj.length;i++){
    var o=r.obj[i];
    if(!Array.isArray(o)||o.length!==10||!$int(o[0],0,LIST_SIZE-1)||!$int(o[1],0,2)||!$int(o[2],0,NUM_OBJECTS-1)||!$int(o[3],0,MAP_SIZE-1)||!Number.isInteger(o[4])||!$int(o[5],0,1000)||!Number.isInteger(o[6])||!$int(o[7],0,1000)||!Number.isInteger(o[8])||!$int(o[9],-1,LIST_SIZE-1))return false;
  }
  if(!['date','automove','resigned','debug','win','save_movie','user_score','comp_score'].every(function(k){return Number.isInteger(+r[k])}))return false;
  for(i=0;i<MAP_SIZE;i++){
    map[i].contents=r.map.charAt(i);map[i].on_board=+r.board.charAt(i);
    comp_map[i].contents=r.comp.charAt(i);comp_map[i].seen=r.compseen[i];
    user_map[i].contents=r.user.charAt(i);user_map[i].seen=r.userseen[i];
  }
  for(i=0;i<NUM_CITY;i++){var k=r.city[i];city[i].loc=k[0];city[i].owner=k[1];city[i].func=k[2].slice();city[i].work=k[3];city[i].prod=k[4]}
  object.forEach(function(x){x.owner=UNOWNED;x.type=0;x.loc=0;x.func=0;x.hits=0;x.moved=0;x.count=0;x.range=0});
  r.obj.forEach(function(o){var x=object[o[0]];x.owner=o[1];x.type=o[2];x.loc=o[3];x.func=o[4];x.hits=o[5];x.moved=o[6];x.count=o[7];x.range=o[8]});
  date=+r.date;automove=+r.automove;resigned=+r.resigned;debug=+r.debug;win=+r.win;save_movie=+r.save_movie;user_score=+r.user_score;comp_score=+r.comp_score;
  return true;
}
function save_movie_screen(){ /* one screen of the movie per round; old rounds go first if storage is short */
  var i,p,b=[];
  for(i=0;i<MAP_SIZE;i++){
    if(map[i].cityp)b.push(city_char[map[i].cityp.owner]);
    else{
      p=find_obj_at_loc(i);
      if(!p)b.push(map[i].contents);
      else if(p.owner===USER)b.push(piece_attr[p.type].sname);
      else b.push(tolower(piece_attr[p.type].sname));
    }
  }
  mapbuf=b;
  var m=P.saved('empire/movie');
  if(!Array.isArray(m))m=[];
  m.push(b.join(''));
  while(m.length&&!P.save('empire/movie',m))m.shift();
}
function* replay_movie(){ // Replay a movie.
  var m=P.saved('empire/movie'),row_inc,col_inc,r,c,rd=0,i;
  if(!Array.isArray(m))return;
  clear_screen();
  for(i=0;i<m.length;i++){
    if(typeof m[i]!=='string'||m[i].length!==MAP_SIZE)break;
    mapbuf=m[i].split('');
    rd+=1;
    stat_display(mapbuf,rd);
    row_inc=$div(MAP_HEIGHT+lines-NUMTOPS-1,lines-NUMTOPS);
    col_inc=$div(MAP_WIDTH+cols-1,cols-1);
    for(r=0;r<MAP_HEIGHT;r+=row_inc)for(c=0;c<MAP_WIDTH;c+=col_inc)print_movie_cell(mapbuf,r,c,row_inc,col_inc);
    refresh();
    yield* delay();
  }
}
function* c_map(){ // Print the map to a file
  var i,j,l,out=[],buf;
  prompt("Filename? ",0,0,0,0,0,0,0,0);
  jnkbuf=yield* get_str();
  for(i=0;i<MAP_WIDTH;i++){ /* for each column */
    l='';
    for(j=MAP_HEIGHT-1;j>=0;j--) /* for each row */
      l+=user_map[row_col_loc(j,i)].contents;
    out.push(l.replace(/ +$/,''));
  }
  if(!jnkbuf||!P.writeFile||!P.writeFile(jnkbuf,out,false)){
    error("I can't open that file.",0,0,0,0,0,0,0,0);
    return;
  }
}
var mapbuf=[];
function $mainargs(words){ /* main.c: its options, and its checks */
  var w=70,s=5,d=2000,Sf=10,i,x,e=0;
  for(i=0;i<words.length;i++){
    x=words[i];
    if(/^-[wsdS]/.test(x)){
      var v=x.length>2?x.slice(2):words[++i];
      if(v===undefined){e++;continue}
      if(x.charAt(1)==='w')w=atoi(v);else if(x.charAt(1)==='s')s=atoi(v);else if(x.charAt(1)==='d')d=atoi(v);else Sf=atoi(v);
    }else e++;
  }
  if(e)return "empire: usage: empire [-w water] [-s smooth] [-d delay]";
  if(w<10||w>90)return "empire: -w argument must be in the range 0..90.";
  if(s<0)return "empire: -s argument must be greater or equal to zero.";
  if(d<0||d>30000)return "empire: -d argument must be in the range 0..30000.";
  SMOOTH=s;WATER_RATIO=w;delay_time=d;save_interval=Sf;
  /* compute min distance between cities */
  var land=$div(MAP_SIZE*(100-WATER_RATIO),100); /* available land */
  land=$div(land,NUM_CITY); /* land per city */
  MIN_CITY_DIST=isqrt(land); /* distance between cities */
  return null;
}
function $new_scan_counts(){return new scan_counts_t()}
function ASSERT(x){if(!x)throw new Error('assert failed')}
function $P(n){return new Array(n).fill(null)}
function ksend(){}  /* the source's "kermyt" log to info_list.txt: a debugging aid, left out */
function ksend1(){}
function isupper(c){return typeof c==='string'&&c>='A'&&c<='Z'}
function row_col_loc(r,c){return r*MAP_WIDTH+c}
function printf(){}
function fclose(){}
function exit(){throw EXIT}
function $padz(a,n){while(a.length<n)a.push(0);return a}
function $copyp(d,s){Object.assign(d,s)} /* C copies the struct; here = would alias it */
/* ---------- empire.h ---------- */
var NORTH=0;
var NORTHEAST=1;
var EAST=2;
var SOUTHEAST=3;
var SOUTH=4;
var SOUTHWEST=5;
var WEST=6;
var NORTHWEST=7;
var NUMTOPS=3;
var NUMSIDES=6;
var STRSIZE=80;
var NUM_CITY=70;
var UNOWNED=0;
var USER=1;
var COMP=2;
var ARMY=0;
var FIGHTER=1;
var PATROL=2;
var DESTROYER=3;
var SUBMARINE=4;
var TRANSPORT=5;
var CARRIER=6;
var BATTLESHIP=7;
var SATELLITE=8;
var NUM_OBJECTS=9;
var NOPIECE=( 255 );
var LIST_SIZE=5000;
var NOFUNC=- 1;
var RANDOM=- 2;
var SENTRY=- 3;
var FILL=- 4;
var LAND=- 5;
var EXPLORE=- 6;
var ARMYLOAD=- 7;
var ARMYATTACK=- 8;
var TTLOAD=- 9;
var REPAIR=- 10;
var WFTRANSPORT=- 11;
var MOVE_N=- 12;
var MOVE_NE=- 13;
var MOVE_E=- 14;
var MOVE_SE=- 15;
var MOVE_S=- 16;
var MOVE_SW=- 17;
var MOVE_W=- 18;
var MOVE_NW=- 19;
var INFINITY=10000000;
var MAP_WIDTH=100;
var MAP_HEIGHT=60;
var MAP_SIZE=( MAP_WIDTH * MAP_HEIGHT );
var T_UNKNOWN=0;
var T_PATH=1;
var T_LAND=2;
var T_WATER=4;
var T_AIR=( T_LAND | T_WATER );
var SECTOR_ROWS=5;
var SECTOR_COLS=2;
var NUM_SECTORS=( SECTOR_ROWS * SECTOR_COLS );
var ROWS_PER_SECTOR=( $div( ( MAP_HEIGHT + SECTOR_ROWS - 1 ) , SECTOR_ROWS ) );
var COLS_PER_SECTOR=( $div( ( MAP_WIDTH + SECTOR_COLS - 1 ) , SECTOR_COLS ) );
var W_TT_BUILD=- 1;
var MAX_HEIGHT=999;
var MAX_CONT=10;
function city_info_t(){this.loc=0;this.owner=0;this.func=$Z(NUM_OBJECTS);this.work=0;this.prod=0;}
function link_t(){this.next=null;this.prev=null;}
function piece_info_t(){this.piece_link=new link_t();this.loc_link=new link_t();this.cargo_link=new link_t();this.owner=0;this.type=0;this.loc=0;this.func=0;this.hits=0;this.moved=0;this.ship=null;this.cargo=null;this.count=0;this.range=0;}
function piece_attr_t(){this.sname=0;this.name="";this.nickname="";this.article="";this.plural="";this.terrain="";this.build_time=0;this.strength=0;this.max_hits=0;this.speed=0;this.capacity=0;this.range=0;}
function real_map_t(){this.contents=0;this.on_board=0;this.cityp=null;this.objp=null;}
function view_map_t(){this.contents=0;this.seen=0;}
function path_map_t(){this.cost=0;this.inc_cost=0;this.terrain=0;}
function scan_counts_t(){this.user_cities=0;this.user_objects=$Z(NUM_OBJECTS);this.comp_cities=0;this.comp_objects=$Z(NUM_OBJECTS);this.size=0;this.unowned_cities=0;this.unexplored=0;}
function move_info_t(){this.city_owner=0;this.objectives=null;this.weights=$Z(11);}
function perimeter_t(){this.len=0;this.list=$Z(MAP_SIZE);}
function cont_t(){this.value=0;this.ncity=0;this.cityp=$Z(NUM_CITY);}
function pair_t(){this.value=0;this.user_cont=0;this.comp_cont=0;}
/* ---------- extern.h ---------- */
/* $Id: extern.h,v 1.4 2000/07/28 05:12:52 esr Exp $  - (c) Copyright 1987, 1988 Chuck Simmons */
/*
 *    Copyright (C) 1987, 1988 Chuck Simmons
 * 
 * See the file COPYING, distributed with empire, for restriction
 * and warranty information.
 */
/*
extern.h -- define global non-constant storage.
*/
/* user-supplied parameters */
var SMOOTH;
/* number of times to smooth map */
var WATER_RATIO;
/* percentage of map that is water */
var MIN_CITY_DIST;
/* cities must be at least this far apart */
var delay_time;
var save_interval;
/* turns between autosaves */
var map=$A(MAP_SIZE,()=>new real_map_t());
/* the way the world really looks */
var comp_map=$A(MAP_SIZE,()=>new view_map_t());
/* computer's view of the world */
var user_map=$A(MAP_SIZE,()=>new view_map_t());
/* user's view of the world */
var city=$A(NUM_CITY,()=>new city_info_t());
/* city information */
/*
There is one array to hold all allocated objects no matter who
owns them.  Objects are allocated from the array and placed on
a list corresponding to the type of object and its owner.
*/
var free_list;
/* index to free items in object list */
var user_obj=$P(NUM_OBJECTS);
/* indices to user lists */
var comp_obj=$P(NUM_OBJECTS);
/* indices to computer lists */
var object=$A(LIST_SIZE,()=>new piece_info_t());
/* object list */
/* Display information. */
var lines;
/* lines on screen */
var cols;
/* columns on screen */
/* constant data */
/* miscellaneous */
var date;
/* number of game turns played */
var automove;
/* TRUE iff user is in automove mode */
var resigned;
/* TRUE iff computer resigned */
var debug;
/* TRUE iff in debugging mode */
var print_debug;
/* TRUE iff we print debugging stuff */
var print_vmap;
/* TRUE iff we print view maps */
var trace_pmap;
/* TRUE if we are tracing pmaps */
var win;
/* set when game is over */
var jnkbuf="";
/* general purpose temporary buffer */
var save_movie;
/* TRUE iff we should save movie screens */
var user_score;
/* "score" for user and computer */
var comp_score;
/* ---------- data.c ---------- */
/* %W% %G% %U% - (c) Copyright 1987, 1988 Chuck Simmons */
/*
 *    Copyright (C) 1987, 1988 Chuck Simmons
 * 
 * See the file COPYING, distributed with empire, for restriction
 * and warranty information.
 */
/*
Static data.

One of our hopes is that changing the types of pieces that
exist in the game is mostly a matter of modifying this file.
However, see also the help routine, empire.h, and empire.doc.
*/
/*
Piece attributes.  Notice that the Transport is allowed only one hit.
In the previous version of this game, the user could easily win simply
by building armies and troop transports.  We attempt to alleviate this
problem by making transports far more fragile.  We have also increased
the range of a fighter from 20 to 30 so that fighters will be somewhat
more useful.
*/
var piece_attr=[{sname:'A',name:"army",nickname:"army",article:"an army",plural:"armies",terrain:"+",build_time:5,strength:1,max_hits:1,speed:1,capacity:0,range:INFINITY},{sname:'F',name:"fighter",nickname:"fighter",article:"a fighter",plural:"fighters",terrain:".+",build_time:10,strength:1,max_hits:1,speed:8,capacity:0,range:32},{sname:'P',name:"patrol boat",nickname:"patrol",article:"a patrol boat",plural:"patrol boats",terrain:".",build_time:15,strength:1,max_hits:1,speed:4,capacity:0,range:INFINITY},{sname:'D',name:"destroyer",nickname:"destroyer",article:"a destroyer",plural:"destroyers",terrain:".",build_time:20,strength:1,max_hits:3,speed:2,capacity:0,range:INFINITY},{sname:'S',name:"submarine",nickname:"submarine",article:"a submarine",plural:"submarines",terrain:".",build_time:20,strength:3,max_hits:2,speed:2,capacity:0,range:INFINITY},{sname:'T',name:"troop transport",nickname:"transport",article:"a troop transport",plural:"troop transports",terrain:".",build_time:30,strength:1,max_hits:1,speed:2,capacity:6,range:INFINITY},{sname:'C',name:"aircraft carrier",nickname:"carrier",article:"an aircraft carrier",plural:"aircraft carriers",terrain:".",build_time:30,strength:1,max_hits:8,speed:2,capacity:8,range:INFINITY},{sname:'B',name:"battleship",nickname:"battleship",article:"a battleship",plural:"battleships",terrain:".",build_time:40,strength:2,max_hits:10,speed:2,capacity:0,range:INFINITY},{sname:'Z',name:"satellite",nickname:"satellite",article:"a satellite",plural:"satellites",terrain:".+",build_time:50,strength:0,max_hits:1,speed:10,capacity:0,range:500}];
/* Direction offsets. */
var dir_offset=[- MAP_WIDTH,- MAP_WIDTH + 1,1,MAP_WIDTH + 1,MAP_WIDTH,MAP_WIDTH - 1,- 1,- MAP_WIDTH - 1];
/* northwest */
/* Names of movement functions. */
var func_name=["none","random","sentry","fill","land","explore","load","attack","load","repair","transport","W","E","D","C","X","Z","A","Q"];
/* The order in which pieces should be moved. */
var move_order=[SATELLITE,TRANSPORT,CARRIER,BATTLESHIP,PATROL,SUBMARINE,DESTROYER,ARMY,FIGHTER];
/* types of pieces, in declared order */
var type_chars="AFPDSTCBZ";
/* Lists of attackable objects if object is adjacent to moving piece. */
var tt_attack="T";
var army_attack="O*TACFBSDP";
var fighter_attack="TCFBSDPA";
var ship_attack="TCBSDP";
/* Define various types of objectives */
var tt_explore={city_owner:COMP,objectives:" ",weights:$padz([1],11)};
var tt_load={city_owner:COMP,objectives:"$",weights:$padz([1],11)};
/*
Rationale for 'tt_unload':

     Any continent with four or more cities is extremely attractive,
and we should grab it quickly.  A continent with three cities is
fairly attractive, but we are willing to go slightly out of our
way to find a better continent.  Similarily for two cities on a
continent.  At one city on a continent, things are looking fairly
unattractive, and we are willing to go quite a bit out of our way
to find a better continent.

     Cities marked with a '0' are on continents where we already
have cities, and these cities will likely fall to our armies anyway,
so we don't need to dump armies on them unless everything else is
real far away.  We would prefer to use unloading transports for
taking cities instead of exploring, but we are willing to explore
if interesting cities are too far away.

     It has been suggested that continents containing one city
are not interesting.  Unfortunately, most of the time what the
computer sees is a single city on a continent next to lots of
unexplored territory.  So it dumps an army on the continent to
explore the continent and the army ends up attacking the city
anyway.  So, we have decided we might as well send the tt to
the city in the first place and increase the speed with which
the computer unloads its tts.
*/
var tt_unload={city_owner:COMP,objectives:"9876543210 ",weights:$padz([1,1,1,1,1,1,11,21,41,101,61],11)};
/*
 '$' represents loading tt must be first
 'x' represents tt producing city
 '0' represnets explorable territory
*/
var army_fight={city_owner:COMP,objectives:"O*TA ",weights:$padz([1,1,1,1,11],11)};
var army_load={city_owner:COMP,objectives:"$x",weights:$padz([1,W_TT_BUILD],11)};
var fighter_fight={city_owner:COMP,objectives:"TCFBSDPA ",weights:$padz([1,1,5,5,5,5,5,5,9],11)};
var ship_fight={city_owner:COMP,objectives:"TCBSDP ",weights:$padz([1,1,3,3,3,3,21],11)};
var ship_repair={city_owner:COMP,objectives:"X",weights:$padz([1],11)};
var user_army={city_owner:USER,objectives:" ",weights:$padz([1],11)};
var user_army_attack={city_owner:USER,objectives:"*Xa ",weights:$padz([1,1,1,12],11)};
var user_fighter={city_owner:USER,objectives:" ",weights:$padz([1],11)};
var user_ship={city_owner:USER,objectives:" ",weights:$padz([1],11)};
var user_ship_repair={city_owner:USER,objectives:"O",weights:$padz([1],11)};
/*
Various help texts.
*/
var help_cmd=["COMMAND MODE","Auto:     enter automove mode","City:     give city to computer","Date:     print round","Examine:  examine enemy map","File:     print map to file","Give:     give move to computer","Help:     display this text","J:        enter edit mode","Move:     make a move","N:        give N moves to computer","Print:    print a sector","Quit:     quit game","Restore:  restore game","Save:     save game","Trace:    save movie in empmovie.dat","Watch:    watch movie","Zoom:     display compressed map","<ctrl-L>: redraw screen"];
var cmd_lines=19;
var help_user=["USER MODE","QWE","A D       movement directions","ZXC","<space>:  sit","Build:    change city production","Fill:     set func to fill","Grope:    set func to explore","Help:     display this text","I <dir>:  set func to dir","J:        enter edit mode","Kill:     set func to awake","Land:     set func to land","Out:      leave automove mode","Print:    redraw screen","Random:   set func to random","Sentry:   set func to sentry","Upgrade:  set func to repair","V <piece> <func>:  set city func","Y:        set func to attack","<ctrl-L>: redraw screen","?:        describe piece"];
var user_lines=22;
var help_edit=["EDIT MODE","QWE","A D       movement directions","ZXC","Build:    change city production","Fill:     set func to fill","Grope:    set func to explore","Help:     display this text","I <dir>:  set func to dir","Kill:     set func to awake","Land:     set func to land","Mark:     mark piece","N:        set dest for marked piece","Out:      exit edit mode","Print:    print sector","Random:   set func to random","Sentry:   set func to sentry","Upgrade:  set func to repair","V <piece> <func>:  set city func","Y:        set func to attack","<ctrl-L>: redraw screen","?:        describe piece"];
var edit_lines=22;
/* ---------- attack.c ---------- */
/* %W% %G% %U% - (c) Copyright 1987, 1988 Chuck Simmons */
/*
 *    Copyright (C) 1987, 1988 Chuck Simmons
 * 
 * See the file COPYING, distributed with empire, for restriction
 * and warranty information.
 */
/*
attack.c -- handle an attack between two pieces.  We do everything from
fighting it out between the pieces to notifying the user who won and
killing off the losing object.  Somewhere far above, our caller is
responsible for actually removing the object from its list and actually
updating the player's view of the world.

Find object being attacked.  If it is a city, attacker has 50% chance
of taking city.  If successful, give city to attacker.  Otherwise
kill attacking piece.  Tell user who won.

If attacking object is not a city, loop.  On each iteration, select one
piece to throw a blow.  Damage the opponent by the strength of the blow
thrower.  Stop looping when one object has 0 or fewer hits.  Kill off 
the dead object.  Tell user who won and how many hits her piece has left,
if any.
*/
function* attack(att_obj,loc){
  if(map[loc].contents=='*')
  /* attacking a city? */
  (yield*attack_city(att_obj,loc));else attack_obj(att_obj,loc);
  /* attacking a piece */
}
function* attack_city(att_obj,loc){
  var cityp;var att_owner,city_owner;
  cityp=find_city(loc);
  ASSERT(cityp);
  att_owner=att_obj.owner;
  city_owner=cityp.owner;
  if(irand(2)==0){
    /* attack fails? */
    if(att_owner==USER){
      (yield*comment("The scum defending the city crushed your attacking blitzkrieger.",0,0,0,0,0,0,0,0));ksend("The scum defending the city crushed your attacking blitzkrieger.\n",0,0,0,0,0,0,0,0);
      //kermyt
    }else if(city_owner==USER){
      ksend("Your city at %d is under attack.\n",cityp.loc,0,0,0,0,0,0,0);
      //kermyt
      (yield*comment("Your city at %d is under attack.",cityp.loc,0,0,0,0,0,0,0));
    }
    kill_obj(att_obj,loc);
  }else{
    /* attack succeeded */
    kill_city(cityp);cityp.owner=att_owner;kill_obj(att_obj,loc);
    if(att_owner==USER){
      ksend("City at %d has been subjugated!\n",cityp.loc,0,0,0,0,0,0,0);
      //kermyt
      error("City at %d has been subjugated!",cityp.loc,0,0,0,0,0,0,0);
      extra("Your army has been dispersed to enforce control.",0,0,0,0,0,0,0,0);ksend("Your army has been dispersed to enforce control.",0,0,0,0,0,0,0,0);(yield*set_prod(cityp));
    }else if(city_owner==USER){
      ksend("City at %d has been lost to the enemy!\n",cityp.loc,0,0,0,0,0,0,0);
      //kermyt
      (yield*comment("City at %d has been lost to the enemy!",cityp.loc,0,0,0,0,0,0,0));
    }
  }
  /* let city owner see all results */
  if(city_owner!=UNOWNED)scan(((city_owner)==USER?user_map:comp_map),loc);
}
/*
Attack a piece other than a city.  The piece could be anyone's.
First we have to figure out what is being attacked.
*/
function attack_obj(att_obj,loc){
  var def_obj;
  /* defender */
  var owner;
  def_obj=find_obj_at_loc(loc);
  ASSERT(def_obj!=null);
  /* can't find object to attack? */
  if(def_obj.type==SATELLITE)return;
  /* can't attack a satellite */
  while(att_obj.hits>0&&def_obj.hits>0){
    if(irand(2)==0)
    /* defender hits? */
    att_obj.hits-=piece_attr[def_obj.type].strength;
    else def_obj.hits-=piece_attr[att_obj.type].strength;
  }
  if(att_obj.hits>0){
    /* attacker won? */
    describe(att_obj,def_obj,loc);
    owner=def_obj.owner;
    kill_obj(def_obj,loc);
    /* kill loser */
    survive(att_obj,loc);
    /* move attacker */
  }else{
    /* defender won */
    describe(def_obj,att_obj,loc);
    owner=att_obj.owner;
    kill_obj(att_obj,loc);
    survive(def_obj,loc);
  }
  /* show results to first killed */
  scan(((owner)==USER?user_map:comp_map),loc);
}
/*
Here we look to see if any cargo was killed in the attack.  If
a ships contents exceeds its capacity, some of the survivors
fall overboard and drown.  We also move the survivor to the given
location.
*/
function survive(obj,loc){
  while(obj_capacity(obj)<obj.count)kill_obj(obj.cargo,loc);
  move_obj(obj,loc);
}
function describe(win_obj,lose_obj,loc){
  var buf="";var buf2="";var diff;buf="";
  buf2="";
  if(win_obj.owner!=lose_obj.owner){
    if(win_obj.owner==USER){
      user_score+=piece_attr[lose_obj.type].build_time;
      ksend1("Enemy %s at %d destroyed.\n",piece_attr[lose_obj.type].name,loc,0,0,0,0,0,0);
      //kermyt
      topmsg1(1,"Enemy %s at %d destroyed.",piece_attr[lose_obj.type].name,loc,0,0,0,0,0,0);
      ksend1("Your %s has %d hits left\n",piece_attr[win_obj.type].name,win_obj.hits,0,0,0,0,0,0);
      //kermyt
      topmsg1(2,"Your %s has %d hits left.",piece_attr[win_obj.type].name,win_obj.hits,0,0,0,0,0,0);
      diff=win_obj.count-obj_capacity(win_obj);
      if(diff>0)switch(win_obj.cargo.type){
        case ARMY:ksend("%d armies fell overboard and drowned in the assault.\n",diff,0,0,0,0,0,0,0);
        //kermyt
        topmsg(3,"%d armies fell overboard and drowned in the assault.",diff,0,0,0,0,0,0,0);
        break;
        case FIGHTER:ksend("%d fighters fell overboard and were lost in the assult.\n",diff,0,0,0,0,0,0,0);
        //kermyt
        topmsg(3,"%d fighters fell overboard and were lost in the assault.",diff,0,0,0,0,0,0,0);
        break;
      }
    }else{
      comp_score+=piece_attr[lose_obj.type].build_time;
      ksend1("Your %s at %d destroyed.\n",piece_attr[lose_obj.type].name,loc,0,0,0,0,0,0);
      //kermyt
      topmsg1(3,"Your %s at %d destroyed.",piece_attr[lose_obj.type].name,loc,0,0,0,0,0,0);
    }
    set_need_delay();
  }
}
/* ---------- compmove.c ---------- */
/* %W% %G% %U% - (c) Copyright 1987, 1988 Chuck Simmons */
/*
 *    Copyright (C) 1987, 1988 Chuck Simmons
 * 
 * See the file COPYING, distributed with empire, for restriction
 * and warranty information.
 */
/*
compmove.c -- Make a move for the computer. 

For each move the user wants us to make, we do the following:

    1)  Handle city production;
    2)  Move computer's pieces;
    3)  Check to see if the game is over.
*/
var emap=$A(MAP_SIZE,()=>new view_map_t());
function* comp_move(nmoves){
  var i;var obj;
  /* Update our view of the world. */
  for(i=0;i<NUM_OBJECTS;i++)for(obj=comp_obj[i];obj!=null;obj=obj.piece_link.next)scan(comp_map,obj.loc);
  /* refresh comp's view of world */
  for(i=1;i<=nmoves;i++){
    /* for each move we get... */
    (yield*comment("Thinking...",0,0,0,0,0,0,0,0));
    memcpy(emap,comp_map);vmap_prune_explore_locs(emap);(yield*do_cities());
    /* handle city production */
    (yield*do_pieces());
    /* move pieces */
    if(save_movie)save_movie_screen();(yield*check_endgame());
    /* see if game is over */
    (yield*topini());refresh();
  }
}
/*
Handle city production.  First, we set production for new cities.
Then we produce new pieces.  After producing a piece, we will see
if we should change our production.

Our goals for city production are first, not to change production
while something is in the process of being built.  Second, we attempt
to have enough city producing armies on a continent to counter any
threat on the continent, and to adequately explore and control the
continent.  Third, we attempt to always have at least one transport
producer.  Fourth, we attempt to maintain a good ratio between the
number of producers we have of each type of piece.  Fifth, we never
build carriers, as we don't have a good strategy for moving these.
*/
function* do_cities(){
  var i;var is_lake;
  for(i=0;i<NUM_CITY;i++)
  /* new production */
  if(city[i].owner==COMP){
    scan(comp_map,city[i].loc);
    if(city[i].prod==NOPIECE)(yield*comp_prod(city[i],lake(city[i].loc)));
  }
  for(i=0;
  i<NUM_CITY;
  i++)
  /* produce and change */
  if(city[i].owner==COMP){
    is_lake=lake(city[i].loc);if(city[i].work++>=piece_attr[city[i].prod].build_time){
      produce(city[i]);(yield*comp_prod(city[i],is_lake));
    }
    /* don't produce ships in lakes */
    else if(city[i].prod>FIGHTER&&city[i].prod!=SATELLITE&&is_lake)(yield*comp_prod(city[i],is_lake));
  }
}
/*
Define ratios for numbers of cities we want producing each object.

Early in the game, we want to produce armies and transports for
rapid expansion.  After a while, we add fighters and pt boats
for exploration.  Later, we add ships of all kinds for control of
the sea.
*/
/* A    F    P    S    D    T    C    B   Z*/
var ratio1=[60,0,10,0,0,20,0,0,0];
var ratio2=[90,10,10,10,10,40,0,0,0];
var ratio3=[120,20,20,10,10,60,10,10,0];
var ratio4=[150,30,30,20,20,70,10,10,0];
var ratio;
/*
Set city production if necessary.

The algorithm below contains three parts:

1)  Defend continents we own.

2)  Produce a TT and a Satellite.

3)  Meet the ratio requirements given above.
*/
var $h_comp_prod_city_count=$Z(NUM_OBJECTS);
var $h_comp_prod_cont_map=$Z(MAP_SIZE);
var $h_comp_prod_counts=new scan_counts_t();
function* comp_prod(cityp,is_lake){
  var city_count=$h_comp_prod_city_count;
  /* # of cities producing each piece */
  var cont_map=$h_comp_prod_cont_map;var total_cities;var i;var comp_ac;var p;var need_count,interest;var counts=$h_comp_prod_counts;
  /* Make sure we have army producers for current continent. */
  /* map out city's continent */
  vmap_cont(cont_map,comp_map,cityp.loc,'.');
  /* count items of interest on the continent */
  counts=vmap_cont_scan(cont_map,comp_map);
  comp_ac=0;
  /* no army producing computer cities */
  for(i=0;i<MAP_SIZE;i++)if(cont_map[i]){
    /* for each cell of continent */
    if(comp_map[i].contents=='X'){
      p=find_city(i);
      ASSERT(p!=null&&p.owner==COMP);
      if(p.prod==ARMY)comp_ac+=1;
    }
  }
  /* see if anything of interest is on continent */
  interest=(counts.unexplored||counts.user_cities||counts.user_objects[ARMY]||counts.unowned_cities);
  /* we want one more army producer than enemy has cities */
  /* and one more if anything of interest on cont */
  need_count=counts.user_cities-comp_ac+(interest?1:0);
  if(counts.user_cities)need_count+=1;
  if(need_count>0){
    /* need an army producer? */
    (yield*comp_set_prod(cityp,ARMY));return;
  }
  /* Produce armies in new cities if there is a city to attack. */
  if(counts.user_cities&&cityp.prod==NOPIECE){
    (yield*comp_set_prod(cityp,ARMY));return;
  }
  /* Produce a TT and SAT if we don't have one. */
  /* count # of cities producing each piece */
  for(i=0;i<NUM_OBJECTS;i++)city_count[i]=0;total_cities=0;for(i=0;i<NUM_CITY;i++)if(city[i].owner==COMP&&city[i].prod!=NOPIECE){
    city_count[city[i].prod]+=1;total_cities+=1;
  }
  if(total_cities<=10)ratio=ratio1;else if(total_cities<=20)ratio=ratio2;else if(total_cities<=30)ratio=ratio3;else ratio=ratio4;
  /* if we have one army producer, and this is it, return */
  if(city_count[ARMY]==1&&cityp.prod==ARMY)return;
  /* first available non-lake becomes a tt producer */
  if(city_count[TRANSPORT]==0){
    if(!is_lake){
      (yield*comp_set_prod(cityp,TRANSPORT));return;
    }
    /* if we have one army producer that is not on a lake, */
    /* produce armies here instead */
    if(city_count[ARMY]==1){
      for(i=0;i<NUM_CITY;i++)if(city[i].owner==COMP&&city[i].prod==ARMY)break;if(!lake(city[i].loc)){
        (yield*comp_set_prod(cityp,ARMY));return;
      }
    }
  }
  /* don't change prod from armies if something on continent */
  if(cityp.prod==ARMY&&interest)return;
  /* Produce armies in new cities if there is a city to attack. */
  if(counts.unowned_cities&&cityp.prod==NOPIECE){
    (yield*comp_set_prod(cityp,ARMY));return;
  }
/* Set production to item most needed.  Continents with one
	city and nothing interesting may not produce armies.  We
	set production for unset cities, and change production for
	cities that produce objects for which we have many city producers.
	Ship producers on lakes also get there production changed. */
  interest=(counts.comp_cities!=1||interest);if(cityp.prod==NOPIECE||cityp.prod==ARMY&&counts.comp_cities==1||overproduced(cityp,city_count)||cityp.prod>FIGHTER&&is_lake)(yield*comp_set_needed(cityp,city_count,interest,is_lake));
}
/*
Set production for a computer city to a given type.  Don't
reset production if it is already correct.
*/
function* comp_set_prod(cityp,type){
  if(cityp.prod==type)return;
  (yield*pdebug("Changing city prod at %d from %d to %d\n",cityp.loc,cityp.prod,type,0,0,0,0,0));cityp.prod=type;cityp.work=-($div(piece_attr[type].build_time,5));
}
/*
See if a city is producing an object which is being overproduced.
*/
function overproduced(cityp,city_count){
  var i;
  for(i=0;i<NUM_OBJECTS;i++){
    /* return true if changing production would improve balance */
    if(i!=cityp.prod&&((city_count[cityp.prod]-1)*ratio[i]>(city_count[i]+1)*ratio[cityp.prod]))return(1);
  }
  return(0);
}
/*
See if one type of production is needed more than another type.
Return the most-needed type of production.
*/
function need_more(city_count,prod1,prod2){
  if(city_count[prod1]*ratio[prod2]<=city_count[prod2]*ratio[prod1])return(prod1);
  else return(prod2);
}
/*
Figure out the most needed type of production.  We are passed
a flag telling us if armies are ok to produce.
*/
function* comp_set_needed(cityp,city_count,army_ok,is_lake){
  var best_prod;var prod;
  if(!army_ok)city_count[ARMY]=INFINITY;
  if(is_lake){
    /* choose fighter or army */
    (yield*comp_set_prod(cityp,need_more(city_count,ARMY,FIGHTER)));return;
  }
  /* don't choose fighter */
  city_count[FIGHTER]=INFINITY;best_prod=ARMY;
  /* default */
  for(prod=0;
  prod<NUM_OBJECTS;
  prod++){
    best_prod=need_more(city_count,best_prod,prod);
  }
  (yield*comp_set_prod(cityp,best_prod));
}
/*
See if a city is on a lake.  We define a lake to be a body of
water (where cities are considered to be water) that does not
touch either an attackable city or unexplored territory.

Be careful, because we use the 'emap'.  This predicts whether
unexplored territory will be land or water.  The prediction should
be helpful, because small bodies of water that enclose unexplored
territory will appear as solid water.  Big bodies of water should
have unexplored territory on the edges.
*/
var $h_lake_cont_map=$Z(MAP_SIZE);
var $h_lake_counts=new scan_counts_t();
function lake(loc){
  var cont_map=$h_lake_cont_map;var counts=$h_lake_counts;
  vmap_cont(cont_map,emap,loc,'+');
  /* map lake */
  counts=vmap_cont_scan(cont_map,emap);
  return!(counts.unowned_cities||counts.user_cities||counts.unexplored);
}
/*
Move all computer pieces.
*/
var amap=$A(MAP_SIZE,()=>new view_map_t());
/* temp view map */
var path_map=$A(MAP_SIZE,()=>new path_map_t());
function* do_pieces(){
  /* move pieces */
  var i;var obj,next_obj;
  for(i=0;i<NUM_OBJECTS;i++){
    /* loop through obj lists */
    for(obj=comp_obj[move_order[i]];obj!=null;obj=next_obj){
      /* loop through objs in list */
      next_obj=obj.piece_link.next;
      (yield*cpiece_move(obj));
      /* yup; move the object */
    }
  }
}
/*
Move a piece.  We loop until all the moves of a piece are made.  Within
the loop, we find a direction to move that will take us closer to an
objective.
*/
function* cpiece_move(obj){
  var changed_loc;var max_hits;var saved_loc;var cityp;
  if(obj.type==SATELLITE){
    (yield*move_sat(obj));return;
  }
  obj.moved=0;
  /* not moved yet */
  changed_loc=0;
  /* not changed yet */
  max_hits=piece_attr[obj.type].max_hits;
  if(obj.type==FIGHTER){
    /* init fighter range */
    cityp=find_city(obj.loc);if(cityp!=null)obj.range=piece_attr[FIGHTER].range;
  }while(obj.moved<obj_moves(obj)){
    saved_loc=obj.loc;
    /* remember starting location */
    (yield*move1(obj));if(saved_loc!=obj.loc)changed_loc=1;if(obj.type==FIGHTER&&obj.hits>0){
      if(comp_map[obj.loc].contents=='X')obj.moved=piece_attr[FIGHTER].speed;else if(obj.range==0){
        (yield*pdebug("Fighter at %d crashed and burned\n",obj.loc,0,0,0,0,0,0,0));ksend("Fighter at %d crashed and burned\n",obj.loc,0,0,0,0,0,0,0);kill_obj(obj,obj.loc);
        /* crash & burn */
      }
    }
  }
  /* if a boat is in port, damaged, and never moved, fix some damage */
  if(obj.hits>0
  /* live piece? */
  &&!changed_loc
  /* object never changed location? */
  &&obj.type!=ARMY&&obj.type!=FIGHTER
  /* it is a boat? */
  &&obj.hits!=max_hits
  /* it is damaged? */
  &&comp_map[obj.loc].contents=='X')
  /* it is in port? */
  obj.hits++;
  /* fix some damage */
}
/*
Move a piece one square.
*/
function* move1(obj){
  switch(obj.type){
    case ARMY:(yield*army_move(obj));break;case TRANSPORT:(yield*transport_move(obj));break;case FIGHTER:(yield*fighter_move(obj));break;default:(yield*ship_move(obj));break;
  }
}
/*
Move an army.

This is a multi-step algorithm:

1)  See if there is an object we can attack immediately.
If so, attack it.

2)  Look for the nearest land objective.

3)  If we find an objective reachable by land, figure out
how far away that objective is.  Based on the found objective,
also figure out how close a loadable tt must be to be of
interest.  If the objective is closer than the tt must be,
head towards the objective.

4)  Otherwise, look for the nearest loading tt (or tt producing
city).  If the nearest loading tt is farther than our land objective,
head towards the land objective.

5)  Otherwise, head for the tt.

6)  If we still have no destination and we are in a city,
attempt to leave the city.

7)  Once we have a destination, find the best move toward that
destination.  (If there is no destination, sit around and wait.)
*/
var $h_army_move_path_map2=$A(MAP_SIZE,()=>new path_map_t());
function* army_move(obj){
  var new_loc;var path_map2=$h_army_move_path_map2;var new_loc2;var cross_cost;
  /* cost to enter water */
  obj.func=0;
  /* army doesn't want a tt */
  if(vmap_at_sea(comp_map,obj.loc)){
    /* army can't move? */
    load_army(obj);
    obj.moved=piece_attr[ARMY].speed;
    if(!obj.ship)obj.func=1;
    /* load army on ship */
    return;
  }
  if(obj.ship)
  /* is army on a transport? */
  new_loc=find_attack(obj.loc,army_attack,"+*");
  else new_loc=find_attack(obj.loc,army_attack,".+*");
  if(new_loc!=obj.loc){
    /* something to attack? */
    (yield*attack(obj,new_loc));
    /* attack it */
    if(map[new_loc].contents=='.'
    /* moved to ocean? */
    &&obj.hits>0){
      /* object still alive? */
      kill_obj(obj,new_loc);scan(user_map,new_loc);
      /* rescan for user */
    }
    return;
  }
  if(obj.ship){
    if(obj.ship.func==0){
      if(!load_army(obj))ASSERT(0);
      /* load army on best ship */
      return;
      /* armies stay on a loading ship */
    }
    make_unload_map(amap,comp_map);new_loc=(yield*vmap_find_wlobj(path_map,amap,obj.loc,tt_unload));(yield*move_objective(obj,path_map,new_loc," "));return;
  }
  new_loc=(yield*vmap_find_lobj(path_map,comp_map,obj.loc,army_fight));if(new_loc!=obj.loc){
    /* something interesting on land? */
    switch(comp_map[new_loc].contents){
      case 'A':case 'O':cross_cost=60;
      /* high cost if enemy present */
      break;case '*':cross_cost=30;
      /* medium cost for attackable city */
      break;case ' ':cross_cost=14;
      /* low cost for exploring */
      break;default:ASSERT(0);
    }
    cross_cost=path_map[new_loc].cost*2-cross_cost;
  }else cross_cost=INFINITY;if(new_loc==obj.loc||cross_cost>0){
    /* see if there is something interesting to load */
    make_army_load_map(obj,amap,comp_map);new_loc2=(yield*vmap_find_lwobj(path_map2,amap,obj.loc,army_load,cross_cost));if(new_loc2!=obj.loc){
      /* found something? */
      (yield*board_ship(obj,path_map2,new_loc2));return;
    }
  }
  (yield*move_objective(obj,path_map,new_loc," "));
}
/*
Remove pruned explore locs from a view map.
*/
function unmark_explore_locs(xmap){
  var i;
  for(i=0;i<MAP_SIZE;i++)if(map[i].on_board&&xmap[i].contents==' ')xmap[i].contents=emap[i].contents;
}
/*
Make a load map.  We copy the view map and mark each loading
transport and tt producing city with a '$'.
*/
function make_army_load_map(obj,xmap,vmap){
  var p;var i;memcpy(xmap,vmap);
  /* mark loading transports or cities building transports */
  for(p=comp_obj[TRANSPORT];p;p=p.piece_link.next)if(p.func==0)
  /* loading tt? */
  xmap[p.loc].contents='$';
  for(i=0;i<NUM_CITY;i++)if(city[i].owner==COMP&&city[i].prod==TRANSPORT){
    if(nearby_load(obj,city[i].loc))xmap[city[i].loc].contents='x';
    /* army is nearby so it can load */
    else if(nearby_count(city[i].loc)<piece_attr[TRANSPORT].capacity)xmap[city[i].loc].contents='x';
    /* city needs armies */
  }
  if(print_vmap=='A')print_xzoom(xmap);
}
/* Return true if an army is considered near a location for loading. */
function nearby_load(obj,loc){
  return obj.func==1&&dist(obj.loc,loc)<=2;
}
/* Return number of nearby armies. */
function nearby_count(loc){
  var obj;var count;
  count=0;
  for(obj=comp_obj[ARMY];obj;obj=obj.piece_link.next){
    if(nearby_load(obj,loc))count+=1;
  }
  return count;
}
/* Make load map for a ship. */
function make_tt_load_map(xmap,vmap){
  var p;memcpy(xmap,vmap);
  /* mark loading armies */
  for(p=comp_obj[ARMY];p;p=p.piece_link.next)if(p.func==1)
  /* loading army? */
  xmap[p.loc].contents='$';
  if(print_vmap=='L')print_xzoom(xmap);
}
/*
Make an unload map.  We copy the view map.  We then create
a continent map.  For each of our cities, we mark out the continent
that city is on.  Then, for each city that we don't own and which
doesn't appear on our continent map, we set that square to a digit.

We want to assign weights to each attackable city.
Cities are more valuable if they are on a continent which
has lots of cities.  Cities are also valuable if either it
will be easy for us to take over the continent, or if we
need to defend that continent from an enemy.

To implement the above, we assign numbers to each city as follows:

a)  if unowned_cities > user_cities && comp_cities == 0
       set number to min (total_cities, 9)

b)  if comp_cities != 0 && user_cities != 0
       set number to min (total_cities, 9)
       
b)  if enemy_cities == 1 && total_cities == 1, set number to 2.
    (( taking the sole enemy city on a continent is as good as
       getting a two city continent ))
       
c)  Any other attackable city is marked with a '0'.
*/
var owncont_map=$Z(MAP_SIZE);
var tcont_map=$Z(MAP_SIZE);
var $h_make_unload_map_counts=new scan_counts_t();
function make_unload_map(xmap,vmap){
  var i;var counts=$h_make_unload_map_counts;
  memcpy(xmap,vmap);
  unmark_explore_locs(xmap);
  for(i=0;i<MAP_SIZE;i++)owncont_map[i]=0;
  /* nothing marked */
  for(i=0;i<NUM_CITY;i++)if(city[i].owner==COMP)vmap_mark_up_cont(owncont_map,xmap,city[i].loc,'.');
  for(i=0;i<MAP_SIZE;i++)if(strchr("O*",vmap[i].contents)){
    var total_cities;vmap_cont(tcont_map,xmap,i,'.');
    /* map continent */
    counts=vmap_cont_scan(tcont_map,xmap);
    total_cities=counts.unowned_cities+counts.user_cities+counts.comp_cities;
    if(total_cities>9)total_cities=0;
    if(counts.user_cities&&counts.comp_cities)xmap[i].contents=$chr(48+total_cities);
    else if(counts.unowned_cities>counts.user_cities&&counts.comp_cities==0)xmap[i].contents=$chr(48+total_cities);
    else if(counts.user_cities==1&&counts.comp_cities==0)xmap[i].contents='2';
    else xmap[i].contents='0';
  }
  if(print_vmap=='U')print_xzoom(xmap);
}
/*
Load an army onto a ship.  First look for an adjacent ship.
If that doesn't work, move to the objective, trying to be
close to the ocean.
*/
function* board_ship(obj,pmap,dest){
  if(!load_army(obj)){
    obj.func=1;
    /* loading */
    (yield*move_objective(obj,pmap,dest,"t."));
  }
}
/*
Look for the most full, non-full transport at a location.
Prefer switching to staying.  If we switch, we force
one of the ships to become more full.
*/
function find_best_tt(best,loc){
  var p;
  for(p=map[loc].objp;p!=null;p=p.loc_link.next)if(p.type==TRANSPORT&&obj_capacity(p)>p.count){
    if(!best)best=p;
    else if(p.count>=best.count)best=p;
  }
  return best;
}
/*
Load an army onto the most full non-full ship.
*/
function load_army(obj){
  var p;var i;var x_loc;
  p=find_best_tt(obj.ship,obj.loc);
  /* look here first */
  for(i=0;i<8;i++){
    /* try surrounding squares */
    x_loc=obj.loc+dir_offset[i];
    if(map[x_loc].on_board)p=find_best_tt(p,x_loc);
  }
  if(!p)return 0;
  /* no tt to be found */
  if(p.loc==obj.loc){
    /* stay in same place */
    obj.moved=piece_attr[ARMY].speed;
  }else move_obj(obj,p.loc);
  /* move to square with ship */
  if(p.ship!=obj.ship){
    /* reload army to new ship */
    disembark(obj);
    embark(p,obj);
  }
  return 1;
}
/*
Return the first location we find adjacent to the current location of
the correct terrain.
*/
function move_away(vmap,loc,terrain){
  var new_loc;var i;
  for(i=0;i<8;i++){
    new_loc=loc+dir_offset[i];
    if(map[new_loc].on_board&&strchr(terrain,vmap[new_loc].contents))return(new_loc);
  }
  return(loc);
}
/*
Look to see if there is an adjacent object to attack.  We are passed
a location and a list of items we attack sorted in order of most
valuable first.  We look at each surrounding on board location.
If there is an object we can attack, we return the location of the
best of these.
*/
function find_attack(loc,obj_list,terrain){
  var new_loc,best_loc;var i,best_val;var p;
  best_loc=loc;
  /* nothing found yet */
  best_val=INFINITY;
  for(i=0;i<8;i++){
    new_loc=loc+dir_offset[i];
    if(map[new_loc].on_board
    /* can we move here? */
    &&strchr(terrain,map[new_loc].contents)){
      p=strchr(obj_list,comp_map[new_loc].contents);
      if(p!=null&&p-1<best_val){
        best_val=p-1;
        best_loc=new_loc;
      }
    }
  }
  return(best_loc);
}
/*
Move a transport.

There are two kinds of transports:  loading and unloading.

Loading transports move toward loading armies.  Unloading
transports move toward attackable cities on unowned continents.

An empty transport is willing to attack adjacent enemy transports.
Transports become 'loading' when empty, and 'unloading' when full.
*/
function* transport_move(obj){
  var new_loc;
  /* empty transports can attack */
  if(obj.count==0){
    /* empty? */
    obj.func=0;
    /* transport is loading */
    new_loc=find_attack(obj.loc,tt_attack,".");
    if(new_loc!=obj.loc){
      /* something to attack? */
      (yield*attack(obj,new_loc));
      /* attack it */
      return;
    }
  }
  if(obj.count==obj_capacity(obj))
  /* full? */
  obj.func=1;
  /* unloading */
  if(obj.func==0){
    /* loading? */
    make_tt_load_map(amap,comp_map);new_loc=(yield*vmap_find_wlobj(path_map,amap,obj.loc,tt_load));if(new_loc==obj.loc){
      /* nothing to load? */
      memcpy(amap,comp_map);unmark_explore_locs(amap);if(print_vmap=='S')print_xzoom(amap);new_loc=(yield*vmap_find_wobj(path_map,amap,obj.loc,tt_explore));
    }
    (yield*move_objective(obj,path_map,new_loc,"a "));
  }else{
    make_unload_map(amap,comp_map);new_loc=(yield*vmap_find_wlobj(path_map,amap,obj.loc,tt_unload));(yield*move_objective(obj,path_map,new_loc," "));
  }
}
/*
Move a fighter.

1)  See if there is an object we can attack immediately.
If so, attack it.

2)  Otherwise, if fighter is low on fuel, move toward nearest city
if there is one in range.

3)  Otherwise, look for an objective.
*/
function* fighter_move(obj){
  var new_loc;
  new_loc=find_attack(obj.loc,fighter_attack,".+");
  if(new_loc!=obj.loc){
    /* something to attack? */
    (yield*attack(obj,new_loc));
    /* attack it */
    return;
  }
  /* return to base if low on fuel */
  if(obj.range<=find_nearest_city(obj.loc,COMP,$ref(()=>new_loc,($x)=>{new_loc=$x}))+2){
    if(new_loc!=obj.loc)new_loc=vmap_find_dest(path_map,comp_map,obj.loc,new_loc,COMP,T_AIR);
  }else new_loc=obj.loc;if(new_loc==obj.loc){
    /* no nearby city? */
    new_loc=(yield*vmap_find_aobj(path_map,comp_map,obj.loc,fighter_fight));
  }
  (yield*move_objective(obj,path_map,new_loc," "));
}
/*
Move a ship.

Attack anything adjacent.  If nothing adjacent, explore or look for
something to attack.
*/
function* ship_move(obj){
  var new_loc;var adj_list;
  if(obj.hits<piece_attr[obj.type].max_hits){
    /* head to port */
    if(comp_map[obj.loc].contents=='X'){
      /* stay in port */
      obj.moved=piece_attr[obj.type].speed;
      return;
    }
    new_loc=(yield*vmap_find_wobj(path_map,comp_map,obj.loc,ship_repair));adj_list=".";
  }else{
    new_loc=find_attack(obj.loc,ship_attack,".");if(new_loc!=obj.loc){
      /* something to attack? */
      (yield*attack(obj,new_loc));
      /* attack it */
      return;
    }
    /* look for an objective */
    memcpy(amap,comp_map);unmark_explore_locs(amap);if(print_vmap=='S')print_xzoom(amap);new_loc=(yield*vmap_find_wobj(path_map,amap,obj.loc,ship_fight));adj_list=ship_fight.objectives;
  }
  (yield*move_objective(obj,path_map,new_loc,adj_list));
}
/*
Move to an objective.
*/
function* move_objective(obj,pathmap,new_loc,adj_list){
  var terrain;var attack_list;var d;var reuse;
  /* true iff we should reuse old map */
  var old_loc;var old_dest;if(new_loc==obj.loc){
    obj.moved=piece_attr[obj.type].speed;
    obj.range-=1;
    (yield*pdebug("No destination found for %d at %d; func=%d\n",obj.type,obj.loc,obj.func,0,0,0,0,0));return;
  }
  old_loc=obj.loc;
  /* remember where we are */
  old_dest=new_loc;
  /* and where we're going */
  d=dist(new_loc,obj.loc);reuse=1;
  /* try to reuse unless we learn otherwise */
  if(comp_map[new_loc].contents==' '&&d==2){
    /* are we exploring? */
    vmap_mark_adjacent(pathmap,obj.loc);reuse=0;
  }else vmap_mark_path(pathmap,comp_map,new_loc);
  /* find routes to destination */
  /* path terrain and move terrain may differ */
  switch(obj.type){
    case ARMY:terrain="+";break;case FIGHTER:terrain="+.X";break;default:terrain=".X";break;
  }
  new_loc=(yield*vmap_find_dir(pathmap,comp_map,obj.loc,terrain,adj_list));if(new_loc==obj.loc
  /* path is blocked? */
  &&(obj.type!=ARMY||!obj.ship)){
    /* don't unblock armies on a ship */
    vmap_mark_near_path(pathmap,obj.loc);reuse=0;new_loc=(yield*vmap_find_dir(pathmap,comp_map,obj.loc,terrain,adj_list));
  }
  /* encourage army to leave city */
  if(new_loc==obj.loc&&map[obj.loc].cityp!=null&&obj.type==ARMY){
    new_loc=move_away(comp_map,obj.loc,"+");reuse=0;
  }
  if(new_loc==obj.loc){
    obj.moved=piece_attr[obj.type].speed;if(obj.type==ARMY&&obj.ship);else(yield*pdebug("Cannot move %d at %d toward objective; func=%d\n",obj.type,obj.loc,obj.func,0,0,0,0,0));
  }else move_obj(obj,new_loc);
  /* Try to make more moves using same path map. */
  if(reuse&&obj.moved<obj_moves(obj)&&obj.loc!=old_dest){
    /* check for immediate attack */
    switch(obj.type){
      case FIGHTER:if(comp_map[old_dest].contents!='X'
      /* watch fuel */
      &&obj.range<=$div(piece_attr[FIGHTER].range,2))return;attack_list=fighter_attack;terrain="+.";break;case ARMY:attack_list=army_attack;if(obj.ship)terrain="+*";else terrain="+.*";break;case TRANSPORT:terrain=".*";if(obj.cargo)attack_list=tt_attack;else attack_list="*O";
      /* causes tt to wake up */
      break;default:attack_list=ship_attack;terrain=".";break;
    }
    if(find_attack(obj.loc,attack_list,terrain)!=obj.loc)return;
    /* clear old path */
    pathmap[old_loc].terrain=T_UNKNOWN;for(d=0;d<8;d++){
      new_loc=old_loc+dir_offset[d];pathmap[new_loc].terrain=T_UNKNOWN;
    }
    /* pathmap is already marked, but this should work */
    (yield*move_objective(obj,pathmap,old_dest,adj_list));
  }
}
/*
Check to see if the game is over.  We count the number of cities
owned by each side.  If either side has no cities and no armies, then
the game is over.  If the computer has less than half as many cities
and armies as the user, then the computer will give up.
*/
function* check_endgame(){
  /* see if game is over */
  var nuser_city,ncomp_city;var nuser_army,ncomp_army;var p;var i;date+=1;
  /* one more turn has passed */
  if(win!=0)return;
  /* we already know game is over */
  nuser_city=0;
  /* nothing counted yet */
  ncomp_city=0;
  nuser_army=0;
  ncomp_army=0;
  for(i=0;i<NUM_CITY;i++){
    if(city[i].owner==USER)nuser_city++;
    else if(city[i].owner==COMP)ncomp_city++;
  }
  for(p=user_obj[ARMY];p!=null;p=p.piece_link.next)nuser_army++;
  for(p=comp_obj[ARMY];p!=null;p=p.piece_link.next)ncomp_army++;
  if(ncomp_city<$div(nuser_city,3)&&ncomp_army<$div(nuser_army,3)){
    clear_screen();prompt("The computer acknowledges defeat. Do",0,0,0,0,0,0,0,0);ksend("The computer acknowledges defeat.",0,0,0,0,0,0,0,0);error("you wish to smash the rest of the enemy? ",0,0,0,0,0,0,0,0);
    if((yield*get_chx())!='Y')empend();addstr("\nThe enemy inadvertantly revealed its code used for");addstr("\nreceiving battle information. You can display what");addstr("\nthey've learned with the ''E'' command.");resigned=1;win=2;automove=0;
  }else if(ncomp_city==0&&ncomp_army==0){
    clear_screen();addstr("The enemy is incapable of defeating you.\n");addstr("You are free to rape the empire as you wish.\n");addstr("There may be, however, remnants of the enemy fleet\n");addstr("to be routed out and destroyed.\n");win=1;automove=0;
  }else if(nuser_city==0&&nuser_army==0){
    clear_screen();addstr("You have been rendered incapable of\n");addstr("defeating the rampaging enemy fascists! The\n");addstr("empire is lost. If you have any ships left, you\n");addstr("may attempt to harass enemy shipping.");win=1;automove=0;
  }
}
/* ---------- display.c ---------- */
/* $Id: display.c,v 1.7 2000/07/28 05:12:50 esr Exp $  - (c) Copyright 1987, 1988 Chuck Simmons */
/*
 *    Copyright (C) 1987, 1988 Chuck Simmons
 * 
 * See the file COPYING, distributed with empire, for restriction
 * and warranty information.
 */
/*
display.c -- This file contains routines for displaying sectors and
moving the cursor about in a sector.  We need to remember the following
information:

	the current map portion displayed on the screen;

	whether the displayed portion is from the user's or the computer's
	point of view;
*/
var whose_map=UNOWNED;
/* user's or computer's point of view */
var ref_row;
/* map loc displayed in upper-left corner */
var ref_col;
var save_sector;
/* the currently displayed sector */
var save_cursor;
/* currently displayed cursor position */
var change_ok=1;
/*
This routine is called when the current display has been
trashed and no sector is shown on the screen.
*/
function kill_display(){
  whose_map=UNOWNED;
}
/*
This routine is called when a new sector may be displayed on the
screen even if the location to be displayed is already on the screen.
*/
function sector_change(){
  change_ok=1;
}
/*
Return the currently displayed user sector, if any.  If a user
sector is not displayed, return -1.
*/
function cur_sector(){
  if(whose_map!=USER)return(-1);
  return(save_sector);
}
/*
Return the current position of the cursor.  If the user's map
is not on the screen, we return -1.
*/
function cur_cursor(){
  if(whose_map!=USER)return(-1);
  return(save_cursor);
}
/*
Display a location on the screen. We figure out the sector the
location is in and display that sector.  The cursor is left at
the requested location.

We redisplay the sector only if we either have been requested to
redisplay the sector, or if the location is not on the screen.
*/
function display_loc(whose,vmap,loc){
  if(change_ok||whose!=whose_map||!on_screen(loc))print_sector(whose,vmap,((($div(((loc)%MAP_WIDTH),COLS_PER_SECTOR))*SECTOR_ROWS+($div(($div((loc),MAP_WIDTH)),ROWS_PER_SECTOR)))));show_loc(vmap,loc);
}
/*
Display a location iff the location is on the screen.
*/
function display_locx(whose,vmap,loc){
  if(whose==whose_map&&on_screen(loc))show_loc(vmap,loc);
}
/*
Display a location which exists on the screen.
*/
function show_loc(vmap,loc){
  var r,c;r=($div((loc),MAP_WIDTH));c=((loc)%MAP_WIDTH);move(r-ref_row+NUMTOPS,c-ref_col);disp_square(vmap[loc]);save_cursor=loc;
  /* remember cursor location */
  move(r-ref_row+NUMTOPS,c-ref_col);
}
/*
Print a sector of the user's on the screen.  If it is already displayed,
we do nothing.  Otherwise we redraw the screen.  Someday, some intelligence
in doing this might be interesting.  We heavily depend on curses to update
the screen in a reasonable fashion.

If the desired sector
is not displayed, we clear the screen.  We then update the screen
to reflect the current map.  We heavily depend on curses to correctly
optimize the redrawing of the screen.

When redrawing the screen, we figure out where the
center of the sector is in relation to the map.  We then compute
the screen coordinates where we want to display the center of the
sector.  We will remember the sector displayed, the map displayed,
and the map location that appears in the upper-left corner of the
screen.
*/
function print_sector(whose,vmap,sector){
  var first_row,first_col,last_row,last_col;var display_rows,display_cols;var r,c;
  save_sector=sector;
  /* remember last sector displayed */
  change_ok=0;
  /* we are displaying a new sector */
  display_rows=lines-NUMTOPS-1;
  /* num lines to display */
  display_cols=cols-NUMSIDES;
  /* compute row and column edges of sector */
  first_row=((sector)%SECTOR_ROWS)*ROWS_PER_SECTOR;
  first_col=($div((sector),SECTOR_ROWS))*COLS_PER_SECTOR;last_row=first_row+ROWS_PER_SECTOR-1;last_col=first_col+COLS_PER_SECTOR-1;
  if(!(whose==whose_map
  /* correct map is on screen? */
  &&ref_row<=first_row
  /* top row on screen? */
  &&ref_col<=first_col
  /* first col on screen? */
  &&ref_row+display_rows-1>=last_row
  /* bot row on screen? */
  &&ref_col+display_cols-1>=last_col))
  /* last col on screen? */
  clear();
  /* erase current screen */
/* figure out first row and col to print; subtract half
	   the extra lines from the first line */
  ref_row=first_row-$div((display_rows-ROWS_PER_SECTOR),2);ref_col=first_col-$div((display_cols-COLS_PER_SECTOR),2);
  /* try not to go past bottom of map */
  if(ref_row+display_rows-1>MAP_HEIGHT-1)ref_row=MAP_HEIGHT-1-(display_rows-1);
  /* never go past top of map */
  if(ref_row<0)ref_row=0;
  /* same with columns */
  if(ref_col+display_cols-1>MAP_WIDTH-1)ref_col=MAP_WIDTH-1-(display_cols-1);
  if(ref_col<0)ref_col=0;
  whose_map=whose;
  /* remember whose map is displayed */
  display_screen(vmap);
  /* print x-coordinates along bottom of screen */
  for(c=ref_col;c<ref_col+display_cols&&c<MAP_WIDTH;c++)if(c%10==0){
    pos_str(lines-1,c-ref_col,"%d",c,0,0,0,0,0,0,0);
  }
  /* print y-coordinates along right of screen */
  for(r=ref_row;r<ref_row+display_rows&&r<MAP_HEIGHT;r++){
    if(r%2==0)pos_str(r-ref_row+NUMTOPS,cols-NUMSIDES+1,"%2d",r,0,0,0,0,0,0,0);else pos_str(r-ref_row+NUMTOPS,cols-NUMSIDES+1,"  ",0,0,0,0,0,0,0,0);
  }
  /* print round number */
  jnkbuf=sprintf("Sector %d Round %d",sector,date);for(r=0;r<jnkbuf.length;r++){
    if(r+NUMTOPS>=MAP_HEIGHT)break;move(r+NUMTOPS,cols-NUMSIDES+4);addch(jnkbuf[r]);
  }
}
/*
Display the contents of a single map square.

Fancy color hacks are done here. At the moment this is kind of bogus,
because the color doesn't convey any extra information, it just looks
pretty.
*/
function disp_square(vp){
  addch(vp.contents);
}
/*
Display the portion of the map that appears on the screen.
*/
function display_screen(vmap){
  var display_rows,display_cols;var r,c;var t;
  display_rows=lines-NUMTOPS-1;
  /* num lines to display */
  display_cols=cols-NUMSIDES;
  for(r=ref_row;r<ref_row+display_rows&&r<MAP_HEIGHT;r++)for(c=ref_col;c<ref_col+display_cols&&c<MAP_WIDTH;c++){
    t=(((r)*MAP_WIDTH+(c)));
    move(r-ref_row+NUMTOPS,c-ref_col);
    disp_square(vmap[t]);
  }
}
/*
Move the cursor in a specified direction.  We return TRUE if the
cursor remains in the currently displayed screen, otherwise FALSE.
We display the cursor on the screen, if possible.
*/
function move_cursor(cursor,offset){
  var t;var r,c;t=cursor.v+offset;
  /* proposed location */
  if(!map[t].on_board)return(0);
  /* trying to move off map */
  if(!on_screen(t))return(0);
  /* loc is off screen */
  cursor.v=t;
  /* update cursor position */
  save_cursor=cursor.v;
  r=($div((save_cursor),MAP_WIDTH));c=((save_cursor)%MAP_WIDTH);move(r-ref_row+NUMTOPS,c-ref_col);return(1);
}
/*
See if a location is displayed on the screen.
*/
function on_screen(loc){
  var new_r,new_c;new_r=($div((loc),MAP_WIDTH));new_c=((loc)%MAP_WIDTH);
  if(new_r<ref_row
  /* past top of screen */
  ||new_r-ref_row>lines-NUMTOPS-1
  /* past bot of screen? */
  ||new_c<ref_col
  /* past left edge of screen? */
  ||new_c-ref_col>cols-NUMSIDES)
  /* past right edge of screen? */
  return(0);
  return(1);
}
/* Print a view map for debugging. */
function print_xzoom(vmap){
  print_zoom(vmap);
}
/*
Print a condensed version of the map.
*/
var zoom_list="XO*tcbsdpfaTCBSDPFAzZ+. ";
function print_zoom(vmap){
  var row_inc,col_inc;var r,c;
  kill_display();
  row_inc=$div((MAP_HEIGHT+lines-NUMTOPS-1),(lines-NUMTOPS));col_inc=$div((MAP_WIDTH+cols-1),(cols-1));
  for(r=0;r<MAP_HEIGHT;r+=row_inc)for(c=0;c<MAP_WIDTH;c+=col_inc)print_zoom_cell(vmap,r,c,row_inc,col_inc);
  pos_str(0,0,"Round #%d",date,0,0,0,0,0,0,0);refresh();
}
/*
Print a single cell in condensed format.
*/
function print_zoom_cell(vmap,row,col,row_inc,col_inc){
  var r,c;var cell;
  cell=' ';
  for(r=row;r<row+row_inc;r++)for(c=col;c<col+col_inc;c++)if(strchr(zoom_list,vmap[(((r)*MAP_WIDTH+(c)))].contents)<strchr(zoom_list,cell))cell=vmap[(((r)*MAP_WIDTH+(c)))].contents;
  move($div(row,row_inc)+NUMTOPS,$div(col,col_inc));addch(cell);
}
/*
Print a condensed version of a pathmap.
*/
function* print_pzoom(s,pmap,vmap){
  var row_inc,col_inc;var r,c;
  kill_display();
  row_inc=$div((MAP_HEIGHT+lines-NUMTOPS-1),(lines-NUMTOPS));col_inc=$div((MAP_WIDTH+cols-1),(cols-1));
  for(r=0;r<MAP_HEIGHT;r+=row_inc)for(c=0;c<MAP_WIDTH;c+=col_inc)print_pzoom_cell(pmap,vmap,r,c,row_inc,col_inc);
  prompt(s,0,0,0,0,0,0,0,0);(yield*get_chx());
  /* wait for user */
  refresh();
}
/*
Print a single cell of a pathmap in condensed format.
We average all squares in the cell and take the mod 10 value.
Squares with a value of -1 are printed with '-', squares with
a value of INFINITY/2 are printed with 'P', and squares with
a value of INFINITY are printed with 'Z'.  Squares with a value
between P and Z are printed as U.
*/
function print_pzoom_cell(pmap,vmap,row,col,row_inc,col_inc){
  var r,c;var sum,d;var cell;
  sum=0;
  d=0;
  /* number of squares in cell */
  for(r=row;r<row+row_inc;r++)for(c=col;c<col+col_inc;c++){
    sum+=pmap[(((r)*MAP_WIDTH+(c)))].cost;
    d+=1;
  }
  sum=$div(sum,d);if(pmap[(((row)*MAP_WIDTH+(col)))].terrain==T_PATH)cell='-';else if(sum<0)cell='!';else if(sum==$div(INFINITY,2))cell='P';else if(sum==INFINITY)cell=' ';else if(sum>$div(INFINITY,2))cell='U';else{
    sum%=36;if(sum<10)cell=$chr(sum+48);else cell=$chr(sum-10+97);
  }
  if(cell==' ')print_zoom_cell(vmap,row,col,row_inc,col_inc);else{
    move($div(row,row_inc)+NUMTOPS,$div(col,col_inc));addch(cell);
  }
}
/*
Display the score off in the corner of the screen.
*/
function display_score(){
  pos_str(1,cols-12," User  Comp",0,0,0,0,0,0,0,0);
  pos_str(2,cols-12,"%5d %5d",user_score,comp_score,0,0,0,0,0,0);
}
/* ---------- edit.c ---------- */
function* edit(edit_cursor){
  var path_start;var path_type;var e;path_start=-1;
  /* not building a path yet */
  for(;;){
    /* until user gives command to leave */
    display_loc(USER,user_map,edit_cursor);
    /* position cursor */
    e=(yield*e_cursor($ref(()=>edit_cursor,($x)=>{edit_cursor=$x})));
    /* handle cursor movement */
    switch(e){
      case 'B':
      /* change city production */
      (yield*e_prod(edit_cursor));break;case 'F':
      /* fill */
      e_fill(edit_cursor);break;case 'G':
      /* explore */
      e_explore(edit_cursor);break;case 'H':
      /* help */
      (yield*e_help());break;case 'I':
      /* directional stasis */
      (yield*e_stasis(edit_cursor));break;case 'K':
      /* wake up anything and everything */
      e_wake(edit_cursor);break;case 'L':
      /* land plane */
      e_land(edit_cursor);break;case 'M':
      /* start move to location */
      path_type=NOPIECE;e_move($ref(()=>path_start,($x)=>{path_start=$x}),edit_cursor);break;case 'N':
      /* end move to location */
      e_end($ref(()=>path_start,($x)=>{path_start=$x}),edit_cursor,path_type);break;case 'O':
      /* leave display mode */
      e_leave();return;case 'P':
      /* print new sector */
      (yield*e_print($ref(()=>edit_cursor,($x)=>{edit_cursor=$x})));break;case 'R':
      /* make piece move randomly */
      e_random(edit_cursor);break;case 'S':
      /* sleep */
      e_sleep(edit_cursor);break;case 'T':
      /* transport army */
      e_transport(edit_cursor);break;case 'U':
      /* repair ship */
      e_repair(edit_cursor);break;case 'V':
      /* set city function */
      (yield*e_city_func($ref(()=>path_start,($x)=>{path_start=$x}),edit_cursor,$ref(()=>path_type,($x)=>{path_type=$x})));break;case 'Y':
      /* set army func to attack */
      e_attack(edit_cursor);break;case '?':
      /* request info */
      (yield*e_info(edit_cursor));break;case '\x0c':
      /* control-L */
      redraw();break;default:
      /* bad command? */
      huh();break;
    }
  }
}
/*
Get the next command.  We handle cursor movement here.
This routine is an attempt to make cursor movement reasonably
fast.
*/
var dirchars="WwEeDdCcXxZzAaQq";
function* e_cursor(edit_cursor){
  var e;var p;
  /* set up terminal */
  crmode();
  refresh();
  e=(yield*getch());(yield*topini());
  /* clear any error messages */
  for(;;){
    p=strchr(dirchars,e);if(!p)break;
    if(!move_cursor(edit_cursor,dir_offset[$div((p-1),2)]))beep();refresh();e=(yield*getch());
  }
  nocrmode();
  /* reset terminal */
  if(islower(e))e=upper(e);return e;
}
/*
Leave edit mode.
*/
function e_leave(){

}
/*
Print new sector.
*/
function* e_print(edit_cursor){
  var sector;sector=(yield*get_range("New Sector? ",0,NUM_SECTORS-1));
  /* position cursor at center of sector */
  edit_cursor.v=(((((sector)%SECTOR_ROWS)*ROWS_PER_SECTOR+$div(ROWS_PER_SECTOR,2))*MAP_WIDTH+(($div((sector),SECTOR_ROWS))*COLS_PER_SECTOR+$div(COLS_PER_SECTOR,2))));sector_change();
  /* allow change of sector */
}
/*
Set the function of a piece.
*/
function e_set_func(loc,func){
  var obj;obj=find_obj_at_loc(loc);
  if(obj!=null&&obj.owner==USER){
    obj.func=func;
    return;
  }
  huh();
  /* no object here */
}
/* Set the function of a city for some piece. */
function e_set_city_func(cityp,type,func){
  cityp.func[type]=func;
}
/*
Set a piece to move randomly.
*/
function e_random(loc){
  e_set_func(loc,RANDOM);
}
function e_city_random(cityp,type){
  e_set_city_func(cityp,type,RANDOM);
}
/*
Put a ship in fill mode.
*/
function e_fill(loc){
  if(user_map[loc].contents=='T'||user_map[loc].contents=='C')e_set_func(loc,FILL);
  else huh();
}
function e_city_fill(cityp,type){
  if(type==TRANSPORT||type==CARRIER)e_set_city_func(cityp,type,FILL);
  else huh();
}
/*
Set a piece to explore.
*/
function e_explore(loc){
  e_set_func(loc,EXPLORE);
}
function e_city_explore(cityp,type){
  e_set_city_func(cityp,type,EXPLORE);
}
/*
Set a fighter to land.
*/
function e_land(loc){
  if(user_map[loc].contents=='F')e_set_func(loc,LAND);
  else huh();
}
/*
Set an army's function to TRANSPORT.
*/
function e_transport(loc){
  if(user_map[loc].contents=='A')e_set_func(loc,WFTRANSPORT);
  else huh();
}
/*
Set an army's function to ATTACK.
*/
function e_attack(loc){
  if(user_map[loc].contents=='A')e_set_func(loc,ARMYATTACK);
  else huh();
}
function e_city_attack(cityp,type){
  if(type==ARMY)e_set_city_func(cityp,type,ARMYATTACK);
  else huh();
}
/*
Set a ship's function to REPAIR.
*/
function e_repair(loc){
  if(strchr("PDSTBC",user_map[loc].contents))e_set_func(loc,REPAIR);
  else huh();
}
function e_city_repair(cityp,type){
  if(type==ARMY||type==FIGHTER||type==SATELLITE)huh();
  else e_set_city_func(cityp,type,REPAIR);
}
/*
Set object to move in a direction.
*/
var dirs="WEDCXZAQ";
function* e_stasis(loc){
  var e;var p;if(!isupper(user_map[loc].contents))huh();
  /* no object here */
  else if(user_map[loc].contents=='X')huh();
  else{
    e=(yield*get_chx());
    /* get a direction */
    p=strchr(dirs,e);
    if(p==null)huh();else e_set_func(loc,(MOVE_N-(p-1)));
  }
}
function* e_city_stasis(cityp,type){
  var e;var p;e=(yield*get_chx());
  /* get a direction */
  p=strchr(dirs,e);
  if(p==null)huh();else e_set_city_func(cityp,type,(MOVE_N-(p-1)));
}
/*
Wake up anything and everything.
*/
function e_wake(loc){
  var cityp;var obj;var i;
  cityp=find_city(loc);
  if(cityp!=null){
    for(i=0;i<NUM_OBJECTS;i++)cityp.func[i]=NOFUNC;
  }
  for(obj=map[loc].objp;obj!=null;obj=obj.loc_link.next)obj.func=NOFUNC;
}
function e_city_wake(cityp,type){
  e_set_city_func(cityp,type,NOFUNC);
}
/*
Set a city's function.  We get the piece type to set, then
the function itself.
*/
function* e_city_func(path_start,loc,path_type){
  var type;var e;var cityp;
  cityp=find_city(loc);
  if(!cityp||cityp.owner!=USER){
    huh();
    return;
  }
  type=(yield*get_piece_name());if(type==NOPIECE){
    huh();return;
  }
  e=(yield*get_chx());switch(e){
    case 'F':
    /* fill */
    e_city_fill(cityp,type);break;case 'G':
    /* explore */
    e_city_explore(cityp,type);break;case 'I':
    /* directional stasis */
    (yield*e_city_stasis(cityp,type));break;case 'K':
    /* turn off function */
    e_city_wake(cityp,type);break;case 'M':
    /* start move to location */
    path_type.v=type;e_move(path_start,loc);break;case 'R':
    /* make piece move randomly */
    e_city_random(cityp,type);break;case 'U':
    /* repair ship */
    e_city_repair(cityp,type);break;case 'Y':
    /* set army func to attack */
    e_city_attack(cityp,type);break;default:
    /* bad command? */
    huh();break;
  }
}
/*
Beginning of move to location.
*/
function e_move(path_start,loc){
  if(!isupper(user_map[loc].contents))huh();
  /* nothing there? */
  else if(user_map[loc].contents=='X')huh();
  /* enemy city? */
  else path_start.v=loc;
}
/*
End of move to location.
*/
function e_end(path_start,loc,path_type){
  var cityp;if(path_start.v==-1)huh();
  /* no path started? */
  else if(path_type==NOPIECE)e_set_func(path_start.v,loc);
  else{
    cityp=find_city(path_start.v);
    ASSERT(cityp);
    e_set_city_func(cityp,path_type,loc);
  }
  path_start.v=-1;
  /* remember no path in progress */
}
/*
Put a piece to sleep.
*/
function e_sleep(loc){
  if(user_map[loc].contents=='O')huh();
  /* can't sleep a city */
  else e_set_func(loc,SENTRY);
}
/*
Print out information about a piece.
*/
function* e_info(edit_cursor){
  var ab;
  ab=user_map[edit_cursor].contents;
  if(ab=='O')(yield*e_city_info(edit_cursor));else if(ab=='X'&&debug)(yield*e_city_info(edit_cursor));else if((ab>='A')&&(ab<='T'))e_piece_info(edit_cursor,ab);else if((ab>='a')&&(ab<='t')&&(debug))e_piece_info(edit_cursor,ab);else huh();
}
/*
Print info about a piece.
*/
function e_piece_info(edit_cursor,ab){
  var obj;var type;var p;
  ab=upper(ab);
  p=strchr(type_chars,ab);
  type=p-1;
  obj=find_obj(type,edit_cursor);
  ASSERT(obj!=null);
  describe_obj(obj);
}
/*
Display info on a city.
*/
function* e_city_info(edit_cursor){
  var obj;var cityp;var f,s;var func_buf="";var temp_buf="";var junk_buf2="";
  error(0,0,0,0,0,0,0,0,0);
  /* clear line */
  f=0;
  /* no fighters counted yet */
  for(obj=map[edit_cursor].objp;obj!=null;obj=obj.loc_link.next)if(obj.type==FIGHTER)f++;
  s=0;
  /* no ships counted yet */
  for(obj=map[edit_cursor].objp;obj!=null;obj=obj.loc_link.next)if(obj.type>=DESTROYER)s++;
  if(f==1&&s==1)jnkbuf=sprintf("1 fighter landed, 1 ship docked");
  else if(f==1)jnkbuf=sprintf("1 fighter landed, %d ships docked",s);
  else if(s==1)jnkbuf=sprintf("%d fighters landed, 1 ship docked",f);
  else jnkbuf=sprintf("%d fighters landed, %d ships docked",f,s);
  cityp=find_city(edit_cursor);
  ASSERT(cityp!=null);
  func_buf="";
  /* nothing in buffer */
  for(s=0;s<NUM_OBJECTS;s++){
    /* for each piece */
    if(cityp.func[s]<0)temp_buf=sprintf("%c:%s; ",piece_attr[s].sname,func_name[(-(cityp.func[s])-1)]);
    else temp_buf=sprintf("%c: %d;",piece_attr[s].sname,cityp.func[s]);
    func_buf+=temp_buf;
  }
  junk_buf2=sprintf("City at location %d will complete %s on round %d",cityp.loc,piece_attr[cityp.prod].article,date+piece_attr[cityp.prod].build_time-cityp.work);
  (yield*info(junk_buf2,jnkbuf,func_buf));
}
/*
Change city production.
*/
function* e_prod(loc){
  var cityp;cityp=find_city(loc);
  if(cityp==null)huh();
  /* no city? */
  else(yield*set_prod(cityp));
}
/*
get help
*/
function* e_help(){
  help(help_edit,edit_lines);
  prompt("Press any key to continue: ",0,0,0,0,0,0,0,0);
  (yield*get_chx());
}
/* ---------- empire.c ---------- */
function* empire(){
  var order;var turn=0;
  ttinit();
  /* init tty */
  rndini();
  /* init random number generator */
  clear_screen();
  /* nothing on screen */
  move(7,0);
  ver();
  pos_str(8,0,"Detailed directions are in EMPIRE.DOC\n",0,0,0,0,0,0,0,0);
  refresh();
  if(!restore_game())
  /* try to restore previous game */
  (yield*init_game());
  /* otherwise init a new game */
  /* Command loop starts here. */
  for(;
  ;
  ){
    /* until user quits */
    if(automove){
      /* don't ask for cmd in auto mode */
      (yield*user_move());(yield*comp_move(1));if(++turn%save_interval==0)save_game();(yield*napms(0));
      /* here it would spin; let the keyboard in between rounds */
    }else{
      prompt(0,0,0,0,0,0,0,0,0);
      /* blank top line */
      refresh();prompt("Your orders? ",0,0,0,0,0,0,0,0);order=(yield*get_chx());
      /* get a command */
      (yield*do_command(order));
    }
  }
}
/*
Execute a command.
*/
function* do_command(orders){
  var e;var ncycle;
  switch(orders){
    case 'A':
    /* turn on auto move mode */
    automove=1;
    error("Now in Auto-Mode",0,0,0,0,0,0,0,0);
    (yield*user_move());(yield*comp_move(1));save_game();break;
    case 'C':
    /* give a city to the computer */
    c_give();break;case 'D':
    /* display round number */
    error("Round #%d",date,0,0,0,0,0,0,0);break;
    case 'E':
    /* examine enemy map */
    if(resigned)(yield*c_examine());else huh();
    /* illegal command */
    break;
    case 'F':
    /* print map to file */
    c_map();break;
    case 'G':
    /* give one free enemy move */
    (yield*comp_move(1));break;
    case 'H':
    /* help */
    help(help_cmd,cmd_lines);break;
    case 'J':
    /* edit mode */
    ncycle=cur_sector();if(ncycle==-1)ncycle=0;(yield*edit((((((ncycle)%SECTOR_ROWS)*ROWS_PER_SECTOR+$div(ROWS_PER_SECTOR,2))*MAP_WIDTH+(($div((ncycle),SECTOR_ROWS))*COLS_PER_SECTOR+$div(COLS_PER_SECTOR,2))))));break;
    case 'M':
    /* move */
    (yield*user_move());(yield*comp_move(1));save_game();break;
    case 'N':
    /* give enemy free moves */
    ncycle=(yield*getint("Number of free enemy moves: "));(yield*comp_move(ncycle));save_game();break;
    case 'P':
    /* print a sector */
    (yield*c_sector());break;
    case '\x16':
    /* some interrupt */
    case 'Q':
    /* quit */
    (yield*c_quit());break;
    case 'R':
    /* restore game */
    clear_screen();e=restore_game();break;
    case 'S':
    /* save game */
    save_game();break;case 'T':
    /* trace: toggle save_movie flag */
    save_movie=!save_movie;if(save_movie)(yield*comment("Saving movie screens to 'empmovie.dat'.",0,0,0,0,0,0,0,0));else(yield*comment("No longer saving movie screens.",0,0,0,0,0,0,0,0));break;
    case 'W':
    /* watch movie */
    if(resigned||debug)(yield*replay_movie());else error("You cannot watch movie until computer resigns.",0,0,0,0,0,0,0,0);break;case 'Z':
    /* print compressed map */
    clear();print_zoom(user_map);refresh();break;
    case '\x0c':
    /* redraw the screen */
    redraw();break;
    case '+':
    /* change debug state */
    e=(yield*get_chx());if(e=='+')debug=1;else if(e=='-')debug=0;else huh();break;
    default:if(debug)(yield*c_debug(orders));
    /* debug */
    else huh();
    /* illegal command */
    break;
  }
  e=e;
  /* keep lint quiet */
}
/*
Give an unowned city (if any) to the computer.  We make
a list of unowned cities, choose one at random, and mark
it as the computers.
*/
var $h_c_give_unowned=$Z(NUM_CITY);
function c_give(){
  var unowned=$h_c_give_unowned;var i,count;
  count=0;
  /* nothing in list yet */
  for(i=0;i<NUM_CITY;i++){
    if(city[i].owner==UNOWNED){
      unowned[count]=i;
      /* remember this city */
      count+=1;
    }
  }
  if(count==0){
    error("There are no unowned cities.",0,0,0,0,0,0,0,0);
    ksend("There are no unowned cities.",0,0,0,0,0,0,0,0);
    return;
  }
  i=irand(count);
  i=unowned[i];
  /* get city index */
  city[i].owner=COMP;
  city[i].prod=NOPIECE;
  city[i].work=0;
  scan(comp_map,city[i].loc);
}
/*
Debugging commands should be implemented here.  
The order cannot be any legal command.
*/
function* c_debug(order){
  var e;
  switch(order){
    case '#':(yield*c_examine());break;case '%':(yield*c_movie());break;case '@':
    /* change trace state */
    e=(yield*get_chx());if(e=='+')trace_pmap=1;else if(e=='-')trace_pmap=0;else huh();break;
    case '$':
    /* change print_debug state */
    e=(yield*get_chx());if(e=='+')print_debug=1;else if(e=='-')print_debug=0;else huh();break;
    case '&':
    /* change print_vmap state */
    print_vmap=(yield*get_chx());break;
    default:huh();break;
  }
}
/*
The quit command.  Make sure the user really wants to quit.
*/
function* c_quit(){
  if((yield*getyn("QUIT - Are you sure? "))){
    empend();
  }
}
/*
Print a sector.  Read the sector number from the user
and print it.
*/
function* c_sector(){
  var num;
  num=(yield*get_range("Sector number? ",0,NUM_SECTORS-1));print_sector(USER,user_map,num);
}
/*
Allow user to examine the computer's map.
*/
function* c_examine(){
  var num;
  num=(yield*get_range("Sector number? ",0,NUM_SECTORS-1));print_sector(COMP,comp_map,num);
}
/*
We give the computer lots of free moves and
Print a "zoomed" version of the computer's map.
*/
function* c_movie(){
  clear();
  for(;;){
    (yield*comp_move(1));print_zoom(comp_map);save_game();
  }
}
/* ---------- game.c ---------- */
/*
Initialize a new game.  Here we generate a new random map, put cities
on the map, select cities for each opponent, and zero out the lists of
pieces on the board.
*/
function* init_game(){
  var i;
  kill_display();
  /* nothing on screen */
  automove=0;
  resigned=0;
  debug=0;
  print_debug=0;
  print_vmap=0;
  trace_pmap=0;
  save_movie=0;
  win=0;
  date=0;
  /* no date yet */
  user_score=0;
  comp_score=0;
  for(i=0;i<MAP_SIZE;i++){
    user_map[i].contents=' ';
    /* nothing seen yet */
    user_map[i].seen=0;
    comp_map[i].contents=' ';
    comp_map[i].seen=0;
  }
  for(i=0;i<NUM_OBJECTS;i++){
    user_obj[i]=null;
    comp_obj[i]=null;
  }
  free_list=null;
  /* nothing free yet */
  for(i=0;i<LIST_SIZE;i++){
    /* for each object */
    var obj=( object [ i ] );obj.hits=0;
    /* mark object as dead */
    obj.owner=UNOWNED;
    {
      obj.piece_link.prev=null;
      obj.piece_link.next=free_list;
      if(free_list)free_list.piece_link.prev=obj;
      free_list=obj;
    };
  }
  make_map();
  /* make land and water */
  do{
    for(i=0;i<MAP_SIZE;i++){
      /* remove cities */
      if(map[i].contents=='*')map[i].contents='+';
      /* land */
    }
    place_cities();
    /* place cities on map */
  }while(!(yield*select_cities()));
  /* choose a city for each player */
}
/*
Create a map.  To do this, we first randomly assign heights to each
map location.  Then we smooth these heights.  The more we smooth,
the better the land and water will clump together.  Then we decide
how high the land will be.  We attempt to choose enough land to meet
some required percentage.

There are two parameters to this algorithm:  the amount we will smooth,
and the ratio of land to water.  The user can provide these numbers
at program start up.
*/
/* these arrays give some compilers problems when they are automatic */
var height=$A(2,()=>$Z(MAP_SIZE));
var height_count=$Z(MAX_HEIGHT + 1);
function make_map(){
  var from,to,k;var i,j,sum,loc;
  for(i=0;i<MAP_SIZE;i++)
  /* fill map with random sand */
  height[0][i]=irand(MAX_HEIGHT);
  from=0;
  to=1;
  for(i=0;i<SMOOTH;i++){
    /* smooth the map */
    for(j=0;j<MAP_SIZE;j++){
      sum=height[from][j];
      for(k=0;k<8;k++){
        loc=j+dir_offset[k];
        /* edges get smoothed in a wierd fashion */
        if(loc<0||loc>=MAP_SIZE)loc=j;
        sum+=height[from][loc];
      }
      height[to][j]=$div(sum,9);
    }
    k=to;
    /* swap to and from */
    to=from;from=k;
  }
  /* count the number of cells at each height */
  for(i=0;
  i<=MAX_HEIGHT;
  i++)height_count[i]=0;
  for(i=0;
  i<MAP_SIZE;
  i++)height_count[height[from][i]]++;
  /* find the water line */
  loc=MAX_HEIGHT;
  /* default to all water */
  sum=0;for(i=0;
  i<=MAX_HEIGHT;
  i++){
    sum+=height_count[i];if($div(sum*100,MAP_SIZE)>WATER_RATIO&&sum>=NUM_CITY){
      loc=i;
      /* this is last height that is water */
      break;
    }
  }
  /* mark the land and water */
  for(i=0;i<MAP_SIZE;i++){
    if(height[from][i]>loc)map[i].contents='+';
    /* land */
    else map[i].contents='.';
    /* water */
    map[i].objp=null;
    /* nothing in cell yet */
    map[i].cityp=null;
    j=((i)%MAP_WIDTH);k=($div((i),MAP_WIDTH));
    map[i].on_board=!(j==0||j==MAP_WIDTH-1||k==0||k==MAP_HEIGHT-1);
  }
}
/*
Randomly place cities on the land.  There is a minimum distance that
should exist between cities.  We maintain a list of acceptable land cells
on which a city may be placed.  We randomly choose elements from this
list until all the cities are placed.  After each choice of a land cell
for a city, we remove land cells which are too close to the city.
*/
/* avoid compiler problems with large automatic arrays */
var land=$Z(MAP_SIZE);
function place_cities(){
  var placed,i,loc;var num_land;
  num_land=0;
  /* nothing in land array yet */
  placed=0;
  /* nothing placed yet */
  while(placed<NUM_CITY){
    while(num_land==0)num_land=regen_land(placed);
    i=irand(num_land-1);
    /* select random piece of land */
    loc=land[i];
    city[placed].loc=loc;
    city[placed].owner=UNOWNED;
    city[placed].work=0;
    city[placed].prod=NOPIECE;
    for(i=0;i<NUM_OBJECTS;i++)city[placed].func[i]=NOFUNC;
    /* no function */
    map[loc].contents='*';
    map[loc].cityp=(city[placed]);
    placed++;
    /* Now remove any land too close to selected land. */
    num_land=remove_land(loc,num_land);
  }
}
/*
When we run out of available land, we recreate our land list.  We
put all land in the list, decrement the min_city_dist, and then
remove any land which is too close to a city.
*/
function regen_land(placed){
  var num_land;var i;
  num_land=0;
  for(i=0;i<MAP_SIZE;i++){
    if(map[i].on_board&&map[i].contents=='+'){
      land[num_land]=i;
      /* remember piece of land */
      num_land++;
      /* remember number of pieces */
    }
  }
  if(placed>0){
    /* don't decrement 1st time */
    MIN_CITY_DIST-=1;
    ASSERT(MIN_CITY_DIST>=0);
  }
  for(i=0;i<placed;i++){
    /* for each placed city */
    num_land=remove_land(city[i].loc,num_land);
  }
  return(num_land);
}
/*
Remove land that is too close to a city.
*/
function remove_land(loc,num_land){
  var new_,i;
  new_=0;
  /* nothing kept yet */
  for(i=0;i<num_land;i++){
    if(dist(loc,land[i])>=MIN_CITY_DIST){
      land[new_]=land[i];
      new_++;
    }
  }
  return(new_);
}
/*
Here we select the cities for the user and the computer.  Our choice of
cities will be heavily dependent on the difficulty level the user desires.

Our algorithm will not guarantee that either player will eventually be
able to move armies to any continent on the map.  There may be continents
which are unreachable by sea.  Consider the case of an island in a lake.
If the lake has no shore cities, then there is no way for a boat to reach
the island.  Our hope is that there will be enough water on the map, or enough
land, and that there will be enough cities, to make this case extremely rare.

First we make a list of continents which contain at least two cities, one
or more of which is on the coast.  If there are no such continents, we return
FALSE, and our caller should decide again where cities should be placed
on the map.  While making this list, we will rank the continents.  Our ranking
is based on the thought that shore cities are better than inland cities,
that any city is very important, and that the land area of a continent
is mildly important.  Usually, we expect every continent to have a different
ranking.  It will be unusual to have two continents with the same land area,
the same number of shore cities, and the same number of inland cities.  When
this is not the case, the first city encountered will be given the highest
rank.

We then rank pairs of continents.  We tell the user the number of different
ranks, and ask the user what rank they want to use.  This is how the
user specifies the difficulty level.  Using that pair, we have now decided
on a continent for each player.  We now choose a random city on each continent,
making sure the cities are not the same.
*/
var marked=$Z(MAP_SIZE);
/* list of examine cells */
var ncont;
/* number of continents */
var cont_tab=$A(MAX_CONT,()=>new cont_t());
/* list of good continenets */
var rank_tab=$Z(MAX_CONT);
/* indices to cont_tab in order of rank */
var pair_tab=$A(MAX_CONT * MAX_CONT,()=>new pair_t());
/* ranked pairs of continents */
function* select_cities(){
  var compi,useri;var compp,userp;var comp_cont,user_cont;var pair;
  find_cont();
  /* find and rank the continents */
  if(ncont==0)return(0);
  /* there are no good continents */
  make_pair();
  /* create list of ranked pairs */
  jnkbuf=sprintf("Choose a difficulty level where 0 is easy and %d is hard: ",ncont*ncont-1);
  pair=(yield*get_range(jnkbuf,0,ncont*ncont-1));comp_cont=pair_tab[pair].comp_cont;user_cont=pair_tab[pair].user_cont;
  compi=irand(cont_tab[comp_cont].ncity);compp=cont_tab[comp_cont].cityp[compi];
  do{
    /* select different user city */
    useri=irand(cont_tab[user_cont].ncity);userp=cont_tab[user_cont].cityp[useri];
  }while(userp==compp);
  addprintf("Your city is at %d.",userp.loc,0,0,0,0,0,0,0);(yield*delay());
  /* let user see output before we set_prod */
  /* update city and map */
  compp.owner=COMP;compp.prod=ARMY;compp.work=0;scan(comp_map,compp.loc);
  userp.owner=USER;userp.work=0;scan(user_map,userp.loc);(yield*set_prod(userp));return(1);
}
/*
Find all continents with 2 cities or more, one of which must be a shore
city.  We rank the continents.
*/
function find_cont(){
  var i;var mapi;
  for(i=0;i<MAP_SIZE;i++)marked[i]=0;
  /* nothing marked yet */
  ncont=0;
  /* no continents found yet */
  mapi=0;
  while(ncont<MAX_CONT)if(!find_next($ref(()=>mapi,($x)=>{mapi=$x})))return;
  /* all found */
}
/*
Find the next continent and insert it in the rank table.
If there are no more continents, we return false.
*/
function find_next(mapi){
  var i,val;
  for(;;){
    if(mapi.v>=MAP_SIZE)return(0);
    if(!map[mapi.v].on_board||marked[mapi.v]||map[mapi.v].contents=='.')mapi.v+=1;
    else if(good_cont(mapi.v)){
      rank_tab[ncont]=ncont;
      /* insert cont in rank tab */
      val=cont_tab[ncont].value;
      for(i=ncont;i>0;i--){
        /* bubble up new rank */
        if(val>cont_tab[rank_tab[i-1]].value){
          rank_tab[i]=rank_tab[i-1];
          rank_tab[i-1]=ncont;
        }else break;
      }
      ncont++;
      /* count continents */
      return(1);
    }
  }
}
/*
Map out the current continent.  We mark every piece of land on the continent,
count the cities, shore cities, and land area of the continent.  If the
continent contains 2 cities and a shore city, we set the value of the
continent and return true.  Otherwise we return false.
*/
var ncity,
  nland,
  nshore;
function good_cont(mapi){
  var val;
  ncity=0;
  /* nothing seen yet */
  nland=0;
  nshore=0;
  mark_cont(mapi);
  if(nshore<1||ncity<2)return(0);
/* The first two cities, one of which must be a shore city,
	don't contribute to the value.  Otherwise shore cities are
	worth 3/2 an inland city.  A city is worth 1000 times as much
	as land area. */
  if(ncity==nshore)val=(nshore-2)*3;
  else val=(nshore-1)*3+(ncity-nshore-1)*2;
  val*=1000;
  /* cities are worth a lot */
  val+=nland;
  cont_tab[ncont].value=val;
  cont_tab[ncont].ncity=ncity;
  return(1);
}
/*
Mark a continent.  This recursive algorithm marks the current square
and counts it if it is land or city.  If it is city, we also check
to see if it is a shore city, and we install it in the list of
cities for the continent.  We then examine each surrounding cell.
*/
function mark_cont(mapi){
  var i;
  if(marked[mapi]||map[mapi].contents=='.'||!map[mapi].on_board)return;
  marked[mapi]=1;
  /* mark this cell seen */
  nland++;
  /* count land on continent */
  if(map[mapi].contents=='*'){
    /* a city? */
    cont_tab[ncont].cityp[ncity]=map[mapi].cityp;
    ncity++;
    if(rmap_shore(mapi))nshore++;
  }
  for(i=0;i<8;i++)
  /* look at surrounding squares */
  mark_cont(mapi+dir_offset[i]);
}
/*
Create a list of pairs of continents in a ranked order.  The first
element in the list is the pair which is easiest for the user to
win with.  Our ranking is simply based on the difference in value
between the user's continent and the computer's continent.
*/
function make_pair(){
  var i,j,k,npair;var val;
  npair=0;
  /* none yet */
  for(i=0;i<ncont;i++)for(j=0;j<ncont;j++){
    /* loop through all continents */
    val=cont_tab[i].value-cont_tab[j].value;
    pair_tab[npair].value=val;
    pair_tab[npair].user_cont=i;
    pair_tab[npair].comp_cont=j;
    for(k=npair;k>0;k--){
      /* bubble up new rank */
      if(val>pair_tab[k-1].value){
        $copyp(pair_tab[k],pair_tab[k-1]);
        pair_tab[k-1].user_cont=i;
        pair_tab[k-1].comp_cont=j;
      }else break;
    }
    npair++;
    /* count pairs */
  }
}
/*
Recover a saved game from emp_save.dat.
We return TRUE if we succeed, otherwise FALSE.
*/
function restore_game(){
  var f;
  /* file to save game in */
  var i;var list;var obj;
  if(!$restore())return(0);
/* Our pointers may not be valid because of source
	changes or other things.  We recreate them. */
  free_list=null;
  /* zero all ptrs */
  for(i=0;i<MAP_SIZE;i++){
    map[i].cityp=null;
    map[i].objp=null;
  }
  for(i=0;i<LIST_SIZE;i++){
    object[i].loc_link.next=null;
    object[i].loc_link.prev=null;
    object[i].cargo_link.next=null;
    object[i].cargo_link.prev=null;
    object[i].piece_link.next=null;
    object[i].piece_link.prev=null;
    object[i].ship=null;
    object[i].cargo=null;
  }
  for(i=0;i<NUM_OBJECTS;i++){
    comp_obj[i]=null;
    user_obj[i]=null;
  }
  /* put cities on map */
  for(i=0;i<NUM_CITY;i++)map[city[i].loc].cityp=(city[i]);
  /* put pieces in free list or on map and in object lists */
  for(i=0;i<LIST_SIZE;i++){
    obj=(object[i]);
    if(object[i].owner==UNOWNED||object[i].hits==0){
      {
        obj.piece_link.prev=null;
        obj.piece_link.next=free_list;
        if(free_list)free_list.piece_link.prev=obj;
        free_list=obj;
      };
    }else{
      list=((object[i].owner)==USER?user_obj:comp_obj);
      {
        obj.piece_link.prev=null;
        obj.piece_link.next=list[object[i].type];
        if(list[object[i].type])list[object[i].type].piece_link.prev=obj;
        list[object[i].type]=obj;
      };
      {
        obj.loc_link.prev=null;
        obj.loc_link.next=map[object[i].loc].objp;
        if(map[object[i].loc].objp)map[object[i].loc].objp.loc_link.prev=obj;
        map[object[i].loc].objp=obj;
      };
    }
  }
  /* Embark armies and fighters. */
  read_embark(user_obj[TRANSPORT],ARMY);
  read_embark(user_obj[CARRIER],FIGHTER);
  read_embark(comp_obj[TRANSPORT],ARMY);
  read_embark(comp_obj[CARRIER],FIGHTER);
  fclose(f);
  kill_display();
  /* what we had is no longer good */
  topmsg(3,"Game restored from empsave.dat.",0,0,0,0,0,0,0,0);
  return(1);
}
/*
Embark cargo on a ship.  We loop through the list of ships.
We then loop through the pieces at the ship's location until
the ship has the same amount of cargo it previously had.
*/
function read_embark(list,piece_type){
  var ship;var obj;var count;
  for(ship=list;ship!=null;ship=ship.piece_link.next){
    count=ship.count;
    /* get # of pieces we need */
    if(count<0)inconsistent();
    ship.count=0;
    /* nothing on board yet */
    for(obj=map[ship.loc].objp;obj&&count;obj=obj.loc_link.next){
      if(obj.ship==null&&obj.type==piece_type){
        embark(ship,obj);
        count-=1;
      }
    }
    if(count)inconsistent();
  }
}
function inconsistent(){
  printf("empsave.dat is inconsistent.  Please remove it.\n");
  exit(1);
}
/*
Save a movie screen.  For each cell on the board, we write out
the character that would appear on either the user's or the
computer's screen.  This information is appended to 'empmovie.dat'.
*/
var mapbuf="";
/*
Display statistics about the game.  At the top of the screen we
print:

nn O  nn A  nn F  nn P  nn D  nn S  nn T  nn C  nn B  nn Z  xxxxx
nn X  nn a  nn f  nn p  nn d  nn s  nn t  nn c  nn b  nn z  xxxxx

There may be objects in cities and boats that aren't displayed.
The "xxxxx" field is the cumulative cost of building the hardware.
*/
/* in declared order, with city first */
var pieces="OAFPDSTCBZXafpdstcbz";
var $h_stat_display_counts=$Z(2 * NUM_OBJECTS + 2);
function stat_display(mbuf,round){
  var i;var counts=$h_stat_display_counts;var user_cost,comp_cost;var p;bzero(counts);
  for(i=0;i<MAP_SIZE;i++){
    p=strchr(pieces,mbuf[i]);
    if(p)counts[p-1]+=1;
  }
  user_cost=0;
  for(i=1;i<=NUM_OBJECTS;i++)user_cost+=counts[i]*piece_attr[i-1].build_time;
  comp_cost=0;
  for(i=NUM_OBJECTS+2;i<=2*NUM_OBJECTS+1;i++)comp_cost+=counts[i]*piece_attr[i-NUM_OBJECTS-2].build_time;
  for(i=0;i<NUM_OBJECTS+1;i++){
    pos_str(1,i*6,"%2d %c  ",counts[i],pieces[i],0,0,0,0,0,0);
    pos_str(2,i*6,"%2d %c  ",counts[i+NUM_OBJECTS+1],pieces[i+NUM_OBJECTS+1],0,0,0,0,0,0);
  }
  pos_str(1,i*6,"%5d",user_cost,0,0,0,0,0,0,0);
  pos_str(2,i*6,"%5d",comp_cost,0,0,0,0,0,0,0);
  pos_str(0,0,"Round %3d",$div((round+1),2),0,0,0,0,0,0,0);
}
/*
Print a single cell in condensed format.
*/
function print_movie_cell(mbuf,row,col,row_inc,col_inc){
  var r,c;var cell;
  cell=' ';
  for(r=row;r<row+row_inc;r++)for(c=col;c<col+col_inc;c++)if(strchr(zoom_list,mbuf[(((r)*MAP_WIDTH+(c)))])<strchr(zoom_list,cell))cell=mbuf[(((r)*MAP_WIDTH+(c)))];
  move($div(row,row_inc)+NUMTOPS,$div(col,col_inc));addch(cell);
}
/* ---------- map.c ---------- */
var p1=new perimeter_t();
/* perimeter list for use as needed */
var p2=new perimeter_t();
var p3=new perimeter_t();
var p4=new perimeter_t();
var best_cost;
/* cost and location of best objective */
var best_loc;
/*
Map out a continent.  We are given a location on the continent.
We mark each square that is part of the continent and unexplored
territory adjacent to the continent.  By adjusting the value of
'bad_terrain', this routine can map either continents of land,
or lakes.
*/
function vmap_cont(cont_map,vmap,loc,bad_terrain){
  bzero(cont_map);
  vmap_mark_up_cont(cont_map,vmap,loc,bad_terrain);
}
/*
Mark all squares of a continent and the squares that are adjacent
to the continent which are on the board.  Our passed location is
known to be either on the continent or adjacent to the continent.
*/
function vmap_mark_up_cont(cont_map,vmap,loc,bad_terrain){
  var i,j;var new_loc;var this_terrain;var from,to;
  from=p1;
  to=p2;
  from.len=1;
  /* init perimeter */
  from.list[0]=loc;
  cont_map[loc]=1;
  /* loc is on continent */
  while(from.len){
    to.len=0;
    /* nothing in new perimeter yet */
    for(i=0;i<from.len;i++)
    /* expand perimeter */
    for(j=0;(j<8?(new_loc=from.list[i]+dir_offset[j],1):0);j++)if(map[new_loc].on_board)if(!cont_map[new_loc]){
      /* mark, but don't expand, unexplored territory */
      if(vmap[new_loc].contents==' ')cont_map[new_loc]=1;
      else{
        if(vmap[new_loc].contents=='+')this_terrain='+';
        else if(vmap[new_loc].contents=='.')this_terrain='.';
        else this_terrain=map[new_loc].contents;
        if(this_terrain!=bad_terrain){
          /* on continent? */
          cont_map[new_loc]=1;
          to.list[to.len]=new_loc;
          to.len+=1;
        }
      }
    }
    {
      var x;x=from;
      from=to;
      to=x;
    };
  }
}
function rmap_cont(cont_map,loc,bad_terrain){
  bzero(cont_map);
  rmap_mark_up_cont(cont_map,loc,bad_terrain);
}
/*
Mark all squares of a continent and the squares that are adjacent
to the continent which are on the board.  Our passed location is
known to be either on the continent or adjacent to the continent.

Someday this should be tweaked to use perimeter lists.
*/
function rmap_mark_up_cont(cont_map,loc,bad_terrain){
  var i;var new_loc;if(!map[loc].on_board)return;
  /* off board */
  if(cont_map[loc])return;
  /* already marked */
  if(map[loc].contents==bad_terrain)return;
  /* off continent */
  cont_map[loc]=1;
  /* on continent */
  for(i=0;(i<8?(new_loc=loc+dir_offset[i],1):0);i++)rmap_mark_up_cont(cont_map,new_loc,bad_terrain);
}
/*
Scan a continent recording items of interest on the continent.

This could be done as we mark up the continent.
*/
var $h_vmap_cont_scan_counts=new scan_counts_t();
function vmap_cont_scan(cont_map,vmap){
  var counts=$h_vmap_cont_scan_counts;var i;
  counts=$new_scan_counts();
  for(i=0;i<MAP_SIZE;i++){
    if(cont_map[i]){
      /* cell on continent? */
      counts.size+=1;
      switch(vmap[i].contents){
        case ' ':counts.unexplored+=1;
        break;
        case 'O':counts.user_cities+=1;
        break;
        case 'A':counts.user_objects[ARMY]+=1;
        break;
        case 'F':counts.user_objects[FIGHTER]+=1;
        break;
        case 'P':counts.user_objects[PATROL]+=1;
        break;
        case 'D':counts.user_objects[DESTROYER]+=1;
        break;
        case 'S':counts.user_objects[SUBMARINE]+=1;
        break;
        case 'T':counts.user_objects[TRANSPORT]+=1;
        break;
        case 'C':counts.user_objects[CARRIER]+=1;
        break;
        case 'B':counts.user_objects[BATTLESHIP]+=1;
        break;
        case 'X':counts.comp_cities+=1;
        break;
        case 'a':counts.comp_objects[ARMY]+=1;
        break;
        case 'f':counts.comp_objects[FIGHTER]+=1;
        break;
        case 'p':counts.comp_objects[PATROL]+=1;
        break;
        case 'd':counts.comp_objects[DESTROYER]+=1;
        break;
        case 's':counts.comp_objects[SUBMARINE]+=1;
        break;
        case 't':counts.comp_objects[TRANSPORT]+=1;
        break;
        case 'c':counts.comp_objects[CARRIER]+=1;
        break;
        case 'b':counts.comp_objects[BATTLESHIP]+=1;
        break;
        case '*':counts.unowned_cities+=1;
        break;
        case '+':break;
        case '.':break;
        default:
        /* check for city underneath */
        if(map[i].contents=='*'){
          switch(map[i].cityp.owner){
            case USER:counts.user_cities+=1;
            break;
            case COMP:counts.comp_cities+=1;
            break;
            case UNOWNED:counts.unowned_cities+=1;
            break;
          }
        }
      }
    }
  }
  return counts;
}
/*
Scan a real map as above.  Only the 'size' and 'unowned_cities'
fields are valid.
*/
var $h_rmap_cont_scan_counts=new scan_counts_t();
function rmap_cont_scan(cont_map){
  var counts=$h_rmap_cont_scan_counts;var i;
  counts=$new_scan_counts();
  for(i=0;i<MAP_SIZE;i++){
    if(cont_map[i]){
      /* cell on continent? */
      counts.size+=1;
      if(map[i].contents=='*')counts.unowned_cities+=1;
    }
  }
  return counts;
}
/*
Return TRUE if a location is on the edge of a continent.
*/
function map_cont_edge(cont_map,loc){
  var i,j;
  if(!cont_map[loc])return 0;
  /* not on continent */
  for(i=0;(i<8?(j=loc+dir_offset[i],1):0);i++)if(!cont_map[j])return 1;
  /* edge of continent */
  return 0;
}
/*
Find the nearest objective for a piece.  This routine actually does
some real work.  This code represents my fourth rewrite of the
algorithm.  This algorithm is central to the strategy used by the
computer.

Given a view_map, we create a path_map.  On the path_map, we record
the distance from a location to the nearest objective.  We are
given information about what the interesting objectives are, and
how interesting each objective is.

We use a breadth first search to find the nearest objective.
We maintain something called a "perimeter list".  This list
initially contains a list of squares that we can reach in 'n' moves.
On each pass through our loop, we add all squares that are adjacent
to the perimeter list and which lie outside the perimeter to our
list.  (The loop is only slightly more complicated for armies and
transports.)

When our perimeter list becomes empty, or when the distance to
the current perimeter is at least as large as the weighted distance
to the best objective, we return the location of the best objective
found.

The 'cost' field in a path_map must be INFINITY if the cell lies
outside of the current perimeter.  The cost for cells that lie
on or within the current perimeter doesn't matter, except that
the information must be consistent with the needs of 'vmap_mark_path'.
*/
/* Find an objective over a single type of terrain. */
function* vmap_find_xobj(path_map,vmap,loc,move_info,start,expand){
  var from;var to;var cur_cost;
  from=p1;
  to=p2;
  start_perimeter(path_map,from,loc,start);
  cur_cost=0;
  /* cost to reach current perimeter */
  for(;;){
    to.len=0;
    /* nothing in perim yet */
    expand_perimeter(path_map,vmap,move_info,from,expand,cur_cost,1,1,to,to);
    if(trace_pmap)(yield*print_pzoom("After xobj loop:",path_map,vmap));
    cur_cost+=1;if(to.len==0||best_cost<=cur_cost)return best_loc;
    {
      var x;x=from;from=to;to=x;
    };
  }
}
/* Find an objective for a piece that crosses land and water. */
function* vmap_find_aobj(path_map,vmap,loc,move_info){
  return(yield*vmap_find_xobj(path_map,vmap,loc,move_info,T_LAND,T_AIR));
}
/* Find an objective for a piece that crosses only water. */
function* vmap_find_wobj(path_map,vmap,loc,move_info){
  return(yield*vmap_find_xobj(path_map,vmap,loc,move_info,T_WATER,T_WATER));
}
/* Find an objective for a piece that crosses only land. */
function* vmap_find_lobj(path_map,vmap,loc,move_info){
  return(yield*vmap_find_xobj(path_map,vmap,loc,move_info,T_LAND,T_LAND));
}
/*
Find an objective moving from land to water.
This is mildly complicated.  It costs 2 to move on land
and one to move on water.  To handle this, we expand our current
perimeter by one cell, where land can be expanded to either
land or water, and water is only expanded to water.  Then
we expand any water one more cell.

We have different objectives depending on whether the objective
is being approached from the land or the water.
*/
function* vmap_find_lwobj(path_map,vmap,loc,move_info,beat_cost){
  var cur_land;var cur_water;var new_land;var new_water;var cur_cost;
  cur_land=p1;
  cur_water=p2;
  new_water=p3;
  new_land=p4;
  start_perimeter(path_map,cur_land,loc,T_LAND);
  cur_water.len=0;
  best_cost=beat_cost;
  /* we can do this well */
  cur_cost=0;
  /* cost to reach current perimeter */
  for(;;){
    /* expand current perimeter one cell */
    new_water.len=0;
    new_land.len=0;
    expand_perimeter(path_map,vmap,move_info,cur_water,T_WATER,cur_cost,1,1,new_water,null);
    expand_perimeter(path_map,vmap,move_info,cur_land,T_AIR,cur_cost,1,2,new_water,new_land);
    /* expand new water one cell */
    cur_water.len=0;
    expand_perimeter(path_map,vmap,move_info,new_water,T_WATER,cur_cost+1,1,1,cur_water,null);
    if(trace_pmap)(yield*print_pzoom("After lwobj loop:",path_map,vmap));cur_cost+=2;if(cur_water.len==0&&new_land.len==0||best_cost<=cur_cost){
      return best_loc;
    }
    {
      var x;x=cur_land;cur_land=new_land;new_land=x;
    };
  }
}
/*
Return the cost to reach the adjacent cell of the correct type
with the lowest cost.
*/
function best_adj(pmap,loc,type){
  var i;var new_loc;var best;
  best=INFINITY;
  for(i=0;(i<8?(new_loc=loc+dir_offset[i],1):0);i++)if(pmap[new_loc].terrain==type&&pmap[new_loc].cost<best)best=pmap[new_loc].cost;
  return best;
}
/*
Find an objective moving from water to land.
Here, we expand water to either land or water.
We expand land only to land.

We cheat ever so slightly, but this cheating accurately reflects
the mechanics o moving.  The first time we expand water we can
expand to land or water (army moving off tt or tt moving on water),
but the second time, we only expand water (tt taking its second move).
*/
function* vmap_find_wlobj(path_map,vmap,loc,move_info){
  var cur_land;var cur_water;var new_land;var new_water;var cur_cost;
  cur_land=p1;
  cur_water=p2;
  new_water=p3;
  new_land=p4;
  start_perimeter(path_map,cur_water,loc,T_WATER);
  cur_land.len=0;
  cur_cost=0;
  /* cost to reach current perimeter */
  for(;;){
    /* expand current perimeter one cell */
    new_water.len=0;
    new_land.len=0;
    expand_perimeter(path_map,vmap,move_info,cur_water,T_AIR,cur_cost,1,2,new_water,new_land);
    expand_perimeter(path_map,vmap,move_info,cur_land,T_LAND,cur_cost,1,2,null,new_land);
    /* expand new water one cell to water */
    cur_water.len=0;
    expand_perimeter(path_map,vmap,move_info,new_water,T_WATER,cur_cost+1,1,1,cur_water,null);
    if(trace_pmap)(yield*print_pzoom("After wlobj loop:",path_map,vmap));cur_cost+=2;if(cur_water.len==0&&new_land.len==0||best_cost<=cur_cost){
      return best_loc;
    }
    {
      var x;x=cur_land;cur_land=new_land;new_land=x;
    };
  }
}
/*
Initialize the perimeter searching.

This routine was taking a significant amount of the program time (10%)
doing the initialization of the path map.  We now use an external
constant and 'memcpy'.
*/
var pmap_init=$A(MAP_SIZE,()=>new path_map_t());
var init_done=0;
function start_perimeter(pmap,perim,loc,terrain){
  var i;
  /* zap the path map */
  if(!init_done){
    init_done=1;
    for(i=0;i<MAP_SIZE;i++){
      pmap_init[i].cost=INFINITY;
      /* everything lies outside perim */
      pmap_init[i].terrain=T_UNKNOWN;
    }
  }
  $copypath(pmap,pmap_init);
  /* put first location in perimeter */
  pmap[loc].cost=0;
  pmap[loc].inc_cost=0;
  pmap[loc].terrain=terrain;
  perim.len=1;
  perim.list[0]=loc;
  best_cost=INFINITY;
  /* no best yet */
  best_loc=loc;
  /* if nothing found, result is current loc */
}
/*
Expand the perimeter.

Note that 'waterp' and 'landp' may be the same.

For each cell of the current perimeter, we examine each
cell adjacent to that cell which lies outside of the current
perimeter.  If the adjacent cell is an objective, we update
best_cost and best_loc.  If the adjacent cell is of the correct
type, we turn place the adjacent cell in either the new water perimeter
or the new land perimeter.

We set the cost to reach the current perimeter.
*/
function expand_perimeter(pmap,vmap,move_info,curp,type,cur_cost,inc_wcost,inc_lcost,waterp,landp){
  var i;var j;var new_loc;var obj_cost;var new_type;
  for(i=0;i<curp.len;i++)
  /* for each perimeter cell... */
  for(j=0;(j<8?(new_loc=curp.list[i]+dir_offset[j],1):0);j++)if(map[new_loc].on_board){
    /* for each adjacent cell... */
    var pm=pmap [ new_loc ];
    if(pm.cost==INFINITY){
      new_type=terrain_type(pmap,vmap,move_info,curp.list[i],new_loc);
      if(new_type==T_LAND&&(type&T_LAND))add_cell(pmap,new_loc,landp,new_type,cur_cost,inc_lcost);
      else if(new_type==T_WATER&&(type&T_WATER))add_cell(pmap,new_loc,waterp,new_type,cur_cost,inc_wcost);
      else if(new_type==T_UNKNOWN){
        /* unreachable cell? */
        pm.terrain=new_type;
        pm.cost=cur_cost+$div(INFINITY,2);pm.inc_cost=$div(INFINITY,2);
      }
      if(pmap[new_loc].cost!=INFINITY){
        /* did we expand? */
        obj_cost=objective_cost(vmap,move_info,new_loc,cur_cost);if(obj_cost<best_cost){
          best_cost=obj_cost;best_loc=new_loc;if(new_type==T_UNKNOWN){
            pm.cost=cur_cost+2;pm.inc_cost=2;
          }
        }
      }
    }
  }
}
/* Add a cell to a perimeter list. */
function add_cell(pmap,new_loc,perim,terrain,cur_cost,inc_cost){
  var pm=pmap [ new_loc ];
  pm.terrain=terrain;
  pm.inc_cost=inc_cost;
  pm.cost=cur_cost+inc_cost;
  perim.list[perim.len]=new_loc;
  perim.len+=1;
}
/* Compute the cost to move to an objective. */
function objective_cost(vmap,move_info,loc,base_cost){
  var p;var w;var cityp;
  p=strchr(move_info.objectives,vmap[loc].contents);
  if(!p)return INFINITY;
  w=move_info.weights[p-1];
  if(w>=0)return w+base_cost;
  switch(w){
    case W_TT_BUILD:
    /* handle special case of moving to tt building city */
    cityp=find_city(loc);
    if(!cityp)return base_cost+2;
    /* tt is already here */
    if(cityp.prod!=TRANSPORT)return base_cost+2;
    /* just finished a tt */
    /* compute time to wait for tt to be built */
    w=piece_attr[TRANSPORT].build_time-cityp.work;
    w*=2;
    /* had to cross land to get here */
    if(w<base_cost+2)w=base_cost+2;
    return w;
    default:ASSERT(0);
    /* NOTREACHED */
  }
}
/*
Return the type of terrain at a vmap location.
*/
function terrain_type(pmap,vmap,move_info,from_loc,to_loc){
  if(vmap[to_loc].contents=='+')return T_LAND;
  if(vmap[to_loc].contents=='.')return T_WATER;
  if(vmap[to_loc].contents=='%')return T_UNKNOWN;
  /* magic objective */
  if(vmap[to_loc].contents==' ')return pmap[from_loc].terrain;
  switch(map[to_loc].contents){
    case '.':return T_WATER;
    case '+':return T_LAND;
    case '*':if(map[to_loc].cityp.owner==move_info.city_owner)return T_WATER;
    else return T_UNKNOWN;
    /* cannot cross */
  }
  ASSERT(0);
  /*NOTREACHED*/
}
/*
Prune unexplored territory.  We take a view map and we modify it
so that unexplored territory that is adjacent to a lot of land
or a lot of water is marked as being either that land or water.
So basically, we are making a predicition about what we expect
for land and water.  We iterate this algorithm until either
the next iteration would remove all unexplored territory, or
there is nothing more about which we can make an assumption.

First, we use a pathmap to save the number of adjacent land
and water cells for each unexplored cell.  Cells which have
adjacent explored territory are placed in a perimeter list.
We also count the number of cells that are not unexplored.

We now take this perimeter list and make high-probability
predictions.

Then we round things off by making one pass of medium
probability predictions.

Then we make multiple passes extending our predictions.

We stop if at any point all remaining unexplored cells are
in a perimeter list, or if no predictions were made during
one of the final passes.

Unlike other algorithms, here we deal with "off board" locations.
So be careful.
*/
var $h_vmap_prune_explore_locs_pmap=$A(MAP_SIZE,()=>new path_map_t());
function vmap_prune_explore_locs(vmap){
  var pmap=$h_vmap_prune_explore_locs_pmap;var from,to;var explored;var loc,new_loc;var i;var copied;
  $zeropath(pmap);
  from=p1;
  to=p2;
  from.len=0;
  explored=0;
  /* build initial path map and perimeter list */
  for(loc=0;loc<MAP_SIZE;loc++){
    if(vmap[loc].contents!=' ')explored+=1;
    else{
      /* add unexplored cell to perim */
      for(i=0;(i<8?(new_loc=loc+dir_offset[i],1):0);i++){
        if(new_loc<0||new_loc>=MAP_SIZE);
        /* ignore off map */
        else if(vmap[new_loc].contents==' ');
        /* ignore adjacent unexplored */
        else if(map[new_loc].contents!='.')pmap[loc].cost+=1;
        /* count land */
        else pmap[loc].inc_cost+=1;
        /* count water */
      }
      if(pmap[loc].cost||pmap[loc].inc_cost){
        from.list[from.len]=loc;
        from.len+=1;
      }
    }
  }
  if(print_vmap=='I')print_xzoom(vmap);
  for(;;){
    /* do high probability predictions */
    if(from.len+explored==MAP_SIZE)return;
    to.len=0;
    copied=0;
    for(i=0;i<from.len;i++){
      loc=from.list[i];
      if(pmap[loc].cost>=5)expand_prune(vmap,pmap,loc,T_LAND,to,$ref(()=>explored,($x)=>{explored=$x}));
      else if(pmap[loc].inc_cost>=5)expand_prune(vmap,pmap,loc,T_WATER,to,$ref(()=>explored,($x)=>{explored=$x}));
      else if((loc<MAP_WIDTH||loc>=MAP_SIZE-MAP_WIDTH)&&pmap[loc].cost>=3)expand_prune(vmap,pmap,loc,T_LAND,to,$ref(()=>explored,($x)=>{explored=$x}));
      else if((loc<MAP_WIDTH||loc>=MAP_SIZE-MAP_WIDTH)&&pmap[loc].inc_cost>=3)expand_prune(vmap,pmap,loc,T_WATER,to,$ref(()=>explored,($x)=>{explored=$x}));
      else if((loc==0||loc==MAP_SIZE-1)&&pmap[loc].cost>=2)expand_prune(vmap,pmap,loc,T_LAND,to,$ref(()=>explored,($x)=>{explored=$x}));
      else if((loc==0||loc==MAP_SIZE-1)&&pmap[loc].inc_cost>=2)expand_prune(vmap,pmap,loc,T_WATER,to,$ref(()=>explored,($x)=>{explored=$x}));
      else{
        /* copy perimeter cell */
        to.list[to.len]=loc;
        to.len+=1;
        copied+=1;
      }
    }
    if(copied==from.len)break;
    /* nothing expanded */
    {
      var x;x=from;
      from=to;
      to=x;
    };
  }
  if(print_vmap=='I')print_xzoom(vmap);
  /* one pass for medium probability predictions */
  if(from.len+explored==MAP_SIZE)return;
  to.len=0;
  for(i=0;i<from.len;i++){
    loc=from.list[i];
    if(pmap[loc].cost>pmap[loc].inc_cost)expand_prune(vmap,pmap,loc,T_LAND,to,$ref(()=>explored,($x)=>{explored=$x}));
    else if(pmap[loc].cost<pmap[loc].inc_cost)expand_prune(vmap,pmap,loc,T_WATER,to,$ref(()=>explored,($x)=>{explored=$x}));
    else{
      /* copy perimeter cell */
      to.list[to.len]=loc;
      to.len+=1;
    }
  }
  {
    var x;x=from;
    from=to;
    to=x;
  };
  if(print_vmap=='I')print_xzoom(vmap);
  /* multiple low probability passes */
  for(;;){
    /* return if very little left to explore */
    if(from.len+explored>=MAP_SIZE-MAP_HEIGHT){
      if(print_vmap=='I')print_xzoom(vmap);
      return;
    }
    to.len=0;
    copied=0;
    for(i=0;i<from.len;i++){
      loc=from.list[i];
      if(pmap[loc].cost>=4&&pmap[loc].inc_cost<4)expand_prune(vmap,pmap,loc,T_LAND,to,$ref(()=>explored,($x)=>{explored=$x}));
      else if(pmap[loc].inc_cost>=4&&pmap[loc].cost<4)expand_prune(vmap,pmap,loc,T_WATER,to,$ref(()=>explored,($x)=>{explored=$x}));
      else if((loc<MAP_WIDTH||loc>=MAP_SIZE-MAP_WIDTH)&&pmap[loc].cost>pmap[loc].inc_cost)expand_prune(vmap,pmap,loc,T_LAND,to,$ref(()=>explored,($x)=>{explored=$x}));
      else if((loc<MAP_WIDTH||loc>=MAP_SIZE-MAP_WIDTH)&&pmap[loc].inc_cost>pmap[loc].cost)expand_prune(vmap,pmap,loc,T_WATER,to,$ref(()=>explored,($x)=>{explored=$x}));
      else{
        /* copy perimeter cell */
        to.list[to.len]=loc;
        to.len+=1;
        copied+=1;
      }
    }
    if(copied==from.len)break;
    /* nothing expanded */
    {
      var x;x=from;
      from=to;
      to=x;
    };
  }
  if(print_vmap=='I')print_xzoom(vmap);
}
/*
Expand an unexplored cell.  We increment the land or water count
of each neighbor.  Any neighbor that acquires a non-zero count
is added to the 'to' perimiter list.  The count of explored
territory is incremented.

Careful:  'loc' may be "off board".
*/
function expand_prune(vmap,pmap,loc,type,to,explored){
  var i;var new_loc;explored.v+=1;
  if(type==T_LAND)vmap[loc].contents='+';
  else vmap[loc].contents='.';
  for(i=0;(i<8?(new_loc=loc+dir_offset[i],1):0);i++)if(new_loc>=0&&new_loc<MAP_SIZE&&vmap[new_loc].contents==' '){
    if(!pmap[new_loc].cost&&!pmap[new_loc].inc_cost){
      to.list[to.len]=new_loc;
      to.len+=1;
    }
    if(type==T_LAND)pmap[new_loc].cost+=1;
    else pmap[new_loc].inc_cost+=1;
  }
}
/*
Find the shortest path from the current location to the
destination which passes over valid terrain.  We return
the destination if a path exists.  Otherwise we return the
origin.

This is similar to 'find_objective' except that we know our destination.
*/
var $h_vmap_find_dest_move_info=new move_info_t();
function vmap_find_dest(path_map,vmap,cur_loc,dest_loc,owner,terrain){
  var from;var to;var cur_cost;var start_terrain;var move_info=$h_vmap_find_dest_move_info;var old_contents;
  old_contents=vmap[dest_loc].contents;
  vmap[dest_loc].contents='%';
  /* mark objective */
  move_info.city_owner=owner;
  move_info.objectives="%";
  move_info.weights[0]=1;
  from=p1;
  to=p2;
  if(terrain==T_AIR)start_terrain=T_LAND;
  else start_terrain=terrain;
  start_perimeter(path_map,from,cur_loc,start_terrain);
  cur_cost=0;
  /* cost to reach current perimeter */
  for(;;){
    to.len=0;
    /* nothing in perim yet */
    expand_perimeter(path_map,vmap,move_info,from,terrain,cur_cost,1,1,to,to);
    cur_cost+=1;
    if(to.len==0||best_cost<=cur_cost){
      vmap[dest_loc].contents=old_contents;
      return best_loc;
    }
    {
      var x;x=from;
      from=to;
      to=x;
    };
  }
}
/*
Starting with the destination, we recursively back track toward the source
marking all cells which are on a shortest path between the start and the
destination.  To do this, we know the distance from the destination to
the start.  The destination is on a path.  We then find the cells adjacent
to the destination and nearest to the source and place them on the path.

If we know square P is on the path, then S is on the path if S is
adjacent to P, the cost to reach S is less than the cost to reach P,
and the cost to move from S to P is the difference in cost between
S and P.

Someday, this routine should probably use perimeter lists as well.
*/
function vmap_mark_path(path_map,vmap,dest){
  var n;var new_dest;
  if(path_map[dest].cost==0)return;
  /* reached end of path */
  if(path_map[dest].terrain==T_PATH)return;
  /* already marked */
  path_map[dest].terrain=T_PATH;
  /* this square is on path */
  /* loop to mark adjacent squares on shortest path */
  for(n=0;(n<8?(new_dest=dest+dir_offset[n],1):0);n++)if(path_map[new_dest].cost==path_map[dest].cost-path_map[dest].inc_cost)vmap_mark_path(path_map,vmap,new_dest);
}
/*
Create a marked path map.  We mark those squares adjacent to the
starting location which are on the board.  'find_dir' must be
invoked to decide which squares are actually valid.
*/
function vmap_mark_adjacent(path_map,loc){
  var i;var new_loc;
  for(i=0;(i<8?(new_loc=loc+dir_offset[i],1):0);i++)if(map[new_loc].on_board)path_map[new_loc].terrain=T_PATH;
}
/*
Modify a marked path map.  We mark those squares adjacent to the
starting location which are on the board and which are adjacent
to a location on the existing shortest path.
*/
var $h_vmap_mark_near_path_hit_loc=$Z(8);
function vmap_mark_near_path(path_map,loc){
  var i,j;var new_loc,xloc;var hit_loc=$h_vmap_mark_near_path_hit_loc;
  bzero(hit_loc);
  for(i=0;(i<8?(new_loc=loc+dir_offset[i],1):0);i++)if(map[new_loc].on_board){
    for(j=0;(j<8?(xloc=new_loc+dir_offset[j],1):0);j++)if(map[xloc].on_board)if(xloc!=loc&&path_map[xloc].terrain==T_PATH){
      hit_loc[i]=1;
      break;
    }
  }
  for(i=0;i<8;i++)if(hit_loc[i])path_map[loc+dir_offset[i]].terrain=T_PATH;
}
/*
Look at each neighbor of 'loc'.  Select the first marked cell which
is on a short path to the desired destination, and which holds a valid
terrain.  Note that while this terrain is matched against a 'vmap',
it differs slightly from terrains used above.  This terrain is the
terrain to which we can move immediately, and does not include terrain
for which we would have to wait for another piece to move off of.

We prefer diagonal moves, and we try to have as many squares
as possible containing something in 'adj_char'.

For tie-breaking, we prefer moving to cells that are adjacent to
as many other squares on the path.  This should have a few benefits:

1)  Fighters are less likely to be blocked from reaching a city
because they stay in the center of the path and increase the number
of options for subsequent moves.

2)  Transports will approach a city so that as many armies
as possible can hop off the tt on one turn to take a valid
path toward the city.

3)  User pieces will move more intuitively by staying in the
center of the best path.
*/
var order=[NORTHWEST,NORTHEAST,SOUTHWEST,SOUTHEAST,WEST,EAST,NORTH,SOUTH];
function* vmap_find_dir(path_map,vmap,loc,terrain,adj_char){
  var i,count,bestcount;var bestloc,new_loc;var path_count,bestpath;var p;if(trace_pmap)(yield*print_pzoom("Before vmap_find_dir:",path_map,vmap));bestcount=-INFINITY;
  /* no best yet */
  bestpath=-1;bestloc=loc;for(i=0;
  i<8;
  i++){
    /* for each adjacent square */
    new_loc=loc+dir_offset[order[i]];if(path_map[new_loc].terrain==T_PATH){
      /* which is on path */
      p=strchr(terrain,vmap[new_loc].contents);if(p!=null){
        /* desirable square? */
        count=vmap_count_adjacent(vmap,new_loc,adj_char);path_count=vmap_count_path(path_map,new_loc);
        /* remember best location */
        if(count>bestcount||count==bestcount&&path_count>bestpath){
          bestcount=count;bestpath=path_count;bestloc=new_loc;
        }
      }
    }
  }
  return(bestloc);
}
/*
Count the number of adjacent squares of interest.
Squares are weighted so that the first in the list
is the most interesting.
*/
function vmap_count_adjacent(vmap,loc,adj_char){
  var i,count;var new_loc;var p;var len;
  len=strlen(adj_char);
  count=0;
  for(i=0;(i<8?(new_loc=loc+dir_offset[i],1):0);i++)if(map[new_loc].on_board){
    p=strchr(adj_char,vmap[new_loc].contents);
    if(p)count+=8*(len-(p-1));
  }
  return(count);
}
/*
Count the number of adjacent cells that are on the path.
*/
function vmap_count_path(pmap,loc){
  var i,count;var new_loc;
  count=0;
  for(i=0;(i<8?(new_loc=loc+dir_offset[i],1):0);i++)if(map[new_loc].on_board)if(pmap[new_loc].terrain==T_PATH)count+=1;
  return(count);
}
/*
See if a location is on the shore.  We return true if a surrounding
cell contains water and is on the board.
*/
function rmap_shore(loc){
  var i,j;
  for(i=0;(i<8?(j=loc+dir_offset[i],1):0);i++)if(map[j].on_board)if(map[j].contents=='.')return(1);
  return(0);
}
function vmap_shore(vmap,loc){
  var i,j;
  for(i=0;(i<8?(j=loc+dir_offset[i],1):0);i++)if(map[j].on_board)if(vmap[j].contents!=' '&&vmap[j].contents!='+'&&map[j].contents=='.')return(1);
  return(0);
}
/*
Return true if a location is surrounded by ocean.  Off board locations
which cannot be moved to are treated as ocean.
*/
function vmap_at_sea(vmap,loc){
  var i,j;
  for(i=0;(i<8?(j=loc+dir_offset[i],1):0);i++)if(map[j].on_board)if(vmap[j].contents==' '||vmap[j].contents=='+'||map[j].contents!='.')return(0);
  return(1);
}
function rmap_at_sea(loc){
  var i,j;
  for(i=0;(i<8?(j=loc+dir_offset[i],1):0);i++)if(map[j].on_board){
    if(map[j].contents!='.')return(0);
  }
  return(1);
}
/* ---------- math.c ---------- */
function irand(high){
  if(high<2){
    return(0);
  }
  return(rand()%high);
}
function rndint(minp,maxp){
  var size;
  size=maxp-minp+1;
  return((rand()%size)+minp);
}
/*
Return the distance between two locations.  This is simply
the max of the absolute differnce between the x and y coordinates.
*/
function dist(a,b){
  var ax,ay,bx,by;
  ax=($div((a),MAP_WIDTH));ay=((a)%MAP_WIDTH);bx=($div((b),MAP_WIDTH));by=((b)%MAP_WIDTH);
  return(((((ax-bx)<0?-(ax-bx):(ax-bx)))>(((ay-by)<0?-(ay-by):(ay-by)))?(((ax-bx)<0?-(ax-bx):(ax-bx))):(((ay-by)<0?-(ay-by):(ay-by)))));
}
/*
Find the square root of an integer.  We actually return the floor
of the square root using Newton's method.
*/
function isqrt(n){
  var guess;ASSERT(n>=0);
  /* can't take sqrt of negative number */
  if(n<=1)return(n);
  /* do easy cases and avoid div by zero */
  guess=2;
  /* gotta start somewhere */
  guess=$div((guess+$div(n,guess)),2);guess=$div((guess+$div(n,guess)),2);guess=$div((guess+$div(n,guess)),2);guess=$div((guess+$div(n,guess)),2);guess=$div((guess+$div(n,guess)),2);if(guess*guess>n)guess-=1;
  /* take floor */
  return(guess);
}
/* ---------- object.c ---------- */
/* %W% %G% %U% - (c) Copyright 1987, 1988 Chuck Simmons */
/*
 *    Copyright (C) 1987, 1988 Chuck Simmons
 * 
 * See the file COPYING, distributed with empire, for restriction
 * and warranty information.
 */
/*
object.c -- routines for manipulating objects.
*/
/*
Find the nearest city to a location.  Return the location
of the city and the estimated cost to reach the city.
Distances are computed as straight-line distances.
*/
function find_nearest_city(loc,owner,city_loc){
  var best_dist,best_loc;var new_dist,i;best_dist=INFINITY;
  best_loc=loc;
  for(i=0;i<NUM_CITY;i++)if(city[i].owner==owner){
    new_dist=dist(loc,city[i].loc);
    if(new_dist<best_dist){
      best_dist=new_dist;
      best_loc=city[i].loc;
    }
  }
  city_loc.v=best_loc;
  return best_dist;
}
/*
Given the location of a city, return the index of that city.
*/
function find_city(loc){
  return(map[loc].cityp);
}
/*
Return the number of moves an object gets to make.  This amount
is based on the damage the object has suffered and the number of
moves it normally gets to make.  The object always gets to make
at least one move, assuming it is not dead.  Damaged objects move
at a fraction of their normal speed.  An object which has lost
half of its hits moves at half-speed, for example.
*/
function obj_moves(obj){
  return $div((piece_attr[obj.type].speed*obj.hits+piece_attr[obj.type].max_hits-1)
  /* round up */
  ,piece_attr[obj.type].max_hits);
}
/*
Figure out the capacity for an object.
*/
function obj_capacity(obj){
  return $div((piece_attr[obj.type].capacity*obj.hits+piece_attr[obj.type].max_hits-1)
  /* round up */
  ,piece_attr[obj.type].max_hits);
}
/*
Search for an object of a given type at a location.  We scan the
list of objects at the given location for one of the given type.
*/
function find_obj(type,loc){
  var p;
  for(p=map[loc].objp;p!=null;p=p.loc_link.next)if(p.type==type)return(p);
  return(null);
}
/*
Find a non-full item of the appropriate type at the given location.
*/
function find_nfull(type,loc){
  var p;
  for(p=map[loc].objp;p!=null;p=p.loc_link.next)if(p.type==type){
    if(obj_capacity(p)>p.count)return(p);
  }
  return(null);
}
/*
Look around a location for an unfull transport.  Return the location
of the transport if there is one.
*/
function find_transport(owner,loc){
  var i;var new_loc;var t;
  for(i=0;i<8;i++){
    /* look around */
    new_loc=loc+dir_offset[i];
    t=find_nfull(TRANSPORT,new_loc);
    if(t!=null&&t.owner==owner)return(new_loc);
  }
  return(loc);
  /* no tt found */
}
/*
Search a list of objects at a location for any kind of object.
We prefer transports and carriers to other objects.
*/
function find_obj_at_loc(loc){
  var p,best;best=map[loc].objp;
  if(best==null)return(null);
  /* nothing here */
  for(p=best.loc_link.next;p!=null;p=p.loc_link.next)if(p.type>best.type&&p.type!=SATELLITE)best=p;
  return(best);
}
/*
If an object is on a ship, remove it from that ship.
*/
function disembark(obj){
  if(obj.ship){
    {
      if(obj.cargo_link.next)obj.cargo_link.next.cargo_link.prev=obj.cargo_link.prev;
      if(obj.cargo_link.prev)obj.cargo_link.prev.cargo_link.next=obj.cargo_link.next;
      else obj.ship.cargo=obj.cargo_link.next;
      obj.cargo_link.next=null;
      obj.cargo_link.prev=null;
    };
    obj.ship.count-=1;
    obj.ship=null;
  }
}
/*
Move an object onto a ship.
*/
function embark(ship,obj){
  obj.ship=ship;
  {
    obj.cargo_link.prev=null;
    obj.cargo_link.next=ship.cargo;
    if(ship.cargo)ship.cargo.cargo_link.prev=obj;
    ship.cargo=obj;
  };
  ship.count+=1;
}
/*
Kill an object.  We scan around the piece and free it.  If there is
anything in the object, it is killed as well.
*/
function kill_obj(obj,loc){
  var list;var vmap;vmap=((obj.owner)==USER?user_map:comp_map);
  list=((obj.owner)==USER?user_obj:comp_obj);
  while(obj.cargo!=null)
  /* kill contents */
  kill_one(list,obj.cargo);
  kill_one(list,obj);
  scan(vmap,loc);
  /* scan around new location */
}
/* kill an object without scanning */
function kill_one(list,obj){
  {
    if(obj.piece_link.next)obj.piece_link.next.piece_link.prev=obj.piece_link.prev;
    if(obj.piece_link.prev)obj.piece_link.prev.piece_link.next=obj.piece_link.next;
    else list[obj.type]=obj.piece_link.next;
    obj.piece_link.next=null;
    obj.piece_link.prev=null;
  };
  /* unlink obj from all lists */
  {
    if(obj.loc_link.next)obj.loc_link.next.loc_link.prev=obj.loc_link.prev;
    if(obj.loc_link.prev)obj.loc_link.prev.loc_link.next=obj.loc_link.next;
    else map[obj.loc].objp=obj.loc_link.next;
    obj.loc_link.next=null;
    obj.loc_link.prev=null;
  };
  disembark(obj);
  {
    obj.piece_link.prev=null;
    obj.piece_link.next=free_list;
    if(free_list)free_list.piece_link.prev=obj;
    free_list=obj;
  };
  /* return object to free list */
  obj.hits=0;
  /* let all know this object is dead */
  obj.moved=piece_attr[obj.type].speed;
  /* object has moved */
}
/*
Kill a city.  We kill off all objects in the city and set its type
to unowned.  We scan around the city's location.
*/
function kill_city(cityp){
  var vmap;var p;var next_p;var list;var i;
  /* change ownership of hardware at this location; but not satellites */
  for(p=map[cityp.loc].objp;p;p=next_p){
    next_p=p.loc_link.next;
    if(p.type==ARMY)kill_obj(p,cityp.loc);
    else if(p.type!=SATELLITE){
      if(p.type==TRANSPORT){
        list=((p.owner)==USER?user_obj:comp_obj);
        while(p.cargo!=null)
        /* kill contents */
        kill_one(list,p.cargo);
      }
      list=((p.owner)==USER?user_obj:comp_obj);
      {
        if(p.piece_link.next)p.piece_link.next.piece_link.prev=p.piece_link.prev;
        if(p.piece_link.prev)p.piece_link.prev.piece_link.next=p.piece_link.next;
        else list[p.type]=p.piece_link.next;
        p.piece_link.next=null;
        p.piece_link.prev=null;
      };
      p.owner=(p.owner==USER?COMP:USER);
      list=((p.owner)==USER?user_obj:comp_obj);
      {
        p.piece_link.prev=null;
        p.piece_link.next=list[p.type];
        if(list[p.type])list[p.type].piece_link.prev=p;
        list[p.type]=p;
      };
      p.func=NOFUNC;
    }
  }
  if(cityp.owner!=UNOWNED){
    vmap=((cityp.owner)==USER?user_map:comp_map);
    cityp.owner=UNOWNED;
    cityp.work=0;
    cityp.prod=NOPIECE;
    for(i=0;i<NUM_OBJECTS;i++)cityp.func[i]=NOFUNC;
    scan(vmap,cityp.loc);
  }
}
/*
Produce an item for a city.
*/
var sat_dir=[MOVE_NW,MOVE_SW,MOVE_NE,MOVE_SE];
function produce(cityp){
  var list;var new_;list=((cityp.owner)==USER?user_obj:comp_obj);
  cityp.work-=piece_attr[cityp.prod].build_time;
  ASSERT(free_list);
  /* can we allocate? */
  new_=free_list;
  {
    if(new_.piece_link.next)new_.piece_link.next.piece_link.prev=new_.piece_link.prev;
    if(new_.piece_link.prev)new_.piece_link.prev.piece_link.next=new_.piece_link.next;
    else free_list=new_.piece_link.next;
    new_.piece_link.next=null;
    new_.piece_link.prev=null;
  };
  {
    new_.piece_link.prev=null;
    new_.piece_link.next=list[cityp.prod];
    if(list[cityp.prod])list[cityp.prod].piece_link.prev=new_;
    list[cityp.prod]=new_;
  };
  {
    new_.loc_link.prev=null;
    new_.loc_link.next=map[cityp.loc].objp;
    if(map[cityp.loc].objp)map[cityp.loc].objp.loc_link.prev=new_;
    map[cityp.loc].objp=new_;
  };
  new_.cargo_link.next=null;
  new_.cargo_link.prev=null;
  new_.loc=cityp.loc;
  new_.func=NOFUNC;
  new_.hits=piece_attr[cityp.prod].max_hits;
  new_.owner=cityp.owner;
  new_.type=cityp.prod;
  new_.moved=0;
  new_.cargo=null;
  new_.ship=null;
  new_.count=0;
  new_.range=piece_attr[cityp.prod].range;
  if(new_.type==SATELLITE){
    /* set random move direction */
    new_.func=sat_dir[irand(4)];
  }
}
/*
Move an object to a location.  We mark the object moved, we move
the object to the new square, and we scan around the object.
We also do lots of little maintenance like updating the range
of an object, keeping track of the number of pieces on a boat, 
etc.
*/
function move_obj(obj,new_loc){
  var vmap;var old_loc;var p;
  ASSERT(obj.hits);
  vmap=((obj.owner)==USER?user_map:comp_map);
  old_loc=obj.loc;
  /* save original location */
  obj.moved+=1;
  obj.loc=new_loc;
  obj.range--;
  disembark(obj);
  /* remove object from any ship */
  {
    if(obj.loc_link.next)obj.loc_link.next.loc_link.prev=obj.loc_link.prev;
    if(obj.loc_link.prev)obj.loc_link.prev.loc_link.next=obj.loc_link.next;
    else map[old_loc].objp=obj.loc_link.next;
    obj.loc_link.next=null;
    obj.loc_link.prev=null;
  };
  {
    obj.loc_link.prev=null;
    obj.loc_link.next=map[new_loc].objp;
    if(map[new_loc].objp)map[new_loc].objp.loc_link.prev=obj;
    map[new_loc].objp=obj;
  };
  /* move any objects contained in object */
  for(p=obj.cargo;p!=null;p=p.cargo_link.next){
    p.loc=new_loc;
    {
      if(p.loc_link.next)p.loc_link.next.loc_link.prev=p.loc_link.prev;
      if(p.loc_link.prev)p.loc_link.prev.loc_link.next=p.loc_link.next;
      else map[old_loc].objp=p.loc_link.next;
      p.loc_link.next=null;
      p.loc_link.prev=null;
    };
    {
      p.loc_link.prev=null;
      p.loc_link.next=map[new_loc].objp;
      if(map[new_loc].objp)map[new_loc].objp.loc_link.prev=p;
      map[new_loc].objp=p;
    };
  }
  switch(obj.type){
    /* board new ship */
    case FIGHTER:if(map[obj.loc].cityp==null){
      /* not in a city? */
      p=find_nfull(CARRIER,obj.loc);
      if(p!=null)embark(p,obj);
    }
    break;
    case ARMY:p=find_nfull(TRANSPORT,obj.loc);
    if(p!=null)embark(p,obj);
    break;
  }
  if(obj.type==SATELLITE)scan_sat(vmap,obj.loc);
  scan(vmap,obj.loc);
}
/*
Move a satellite.  It moves according to the preset direction.
Satellites bounce off the edge of the board.

We start off with some preliminary routines.
*/
/* Return next direction for a sattellite to travel. */
function bounce(loc,dir1,dir2,dir3){
  var new_loc;
  new_loc=loc+dir_offset[(-(dir1)+MOVE_N)];
  if(map[new_loc].on_board)return dir1;
  new_loc=loc+dir_offset[(-(dir2)+MOVE_N)];
  if(map[new_loc].on_board)return dir2;
  return dir3;
}
/* Move a satellite one square. */
function move_sat1(obj){
  var dir;var new_loc;
  dir=(-(obj.func)+MOVE_N);
  new_loc=obj.loc+dir_offset[dir];
  if(!map[new_loc].on_board){
    switch(obj.func){
      case MOVE_NE:obj.func=bounce(obj.loc,MOVE_NW,MOVE_SE,MOVE_SW);
      break;
      case MOVE_NW:obj.func=bounce(obj.loc,MOVE_NE,MOVE_SW,MOVE_SE);
      break;
      case MOVE_SE:obj.func=bounce(obj.loc,MOVE_SW,MOVE_NE,MOVE_NW);
      break;
      case MOVE_SW:obj.func=bounce(obj.loc,MOVE_SE,MOVE_NW,MOVE_NE);
      break;
      default:ASSERT(0);
    }
    dir=(-(obj.func)+MOVE_N);
    new_loc=obj.loc+dir_offset[dir];
  }
  move_obj(obj,new_loc);
}
/*
Now move the satellite all of its squares.
Satellite burns iff it's range reaches zero.
*/
function* move_sat(obj){
  obj.moved=0;
  while(obj.moved<obj_moves(obj)){
    move_sat1(obj);
    if(obj.range==0){
      if(obj.owner==USER)(yield*comment("Satellite at %d crashed and burned.",obj.loc,0,0,0,0,0,0,0));ksend("Satellite at %d crashed and burned.",obj.loc,0,0,0,0,0,0,0);kill_obj(obj,obj.loc);
    }
  }
}
/*
Return true if a piece can move to a specified location.
We are passed the object and the location.  The location
must be on the board, and the player's view map must have an appropriate
terrain type for the location.  Boats may move into port, armies may
move onto transports, and fighters may move onto cities or carriers.
*/
function good_loc(obj,loc){
  var vmap;var p;if(!map[loc].on_board)return(0);
  vmap=((obj.owner)==USER?user_map:comp_map);
  if(strchr(piece_attr[obj.type].terrain,vmap[loc].contents)!=null)return(1);
  /* armies can move into unfull transports */
  if(obj.type==ARMY){
    p=find_nfull(TRANSPORT,loc);
    return(p!=null&&p.owner==obj.owner);
  }
  /* ships and fighters can move into cities */
  if(map[loc].cityp&&map[loc].cityp.owner==obj.owner)return(1);
  /* fighters can move onto unfull carriers */
  if(obj.type==FIGHTER){
    p=find_nfull(CARRIER,loc);
    return(p!=null&&p.owner==obj.owner);
  }
  return(0);
}
function describe_obj(obj){
  var func="";var other="";
  if(obj.func>=0)func=sprintf("%d",obj.func);
  else func=sprintf(func_name[(-(obj.func)-1)]);
  other="";
  switch(obj.type){
    /* set other information */
    case FIGHTER:other=sprintf("; range = %d",obj.range);
    break;
    case TRANSPORT:other=sprintf("; armies = %d",obj.count);
    break;
    case CARRIER:other=sprintf("; fighters = %d",obj.count);
    break;
  }
  prompt2("%s at %d:  moves = %d; hits = %d; func = %s%s",piece_attr[obj.type].name,obj.loc,obj_moves(obj)-obj.moved,obj.hits,func,other,0,0);
}
/*
Scan around a location to update a player's view of the world.  For each
surrounding cell, we remember the date the cell was examined, and the
contents of the cell.  Notice how we carefully update the cell to first
reflect land, water, or city, then army or fighter, then boat, and finally
city owner.  This guarantees that the object we want to display will appear
on top.
*/
function scan(vmap,loc){
  var i;var xloc;
  ASSERT(map[loc].on_board);
  /* passed loc must be on board */
  for(i=0;i<8;i++){
    /* for each surrounding cell */
    xloc=loc+dir_offset[i];
    update(vmap,xloc);
  }
  update(vmap,loc);
  /* update current location as well */
}
/*
Scan a portion of the board for a satellite.
*/
function scan_sat(vmap,loc){
  var i;var xloc;ASSERT(map[loc].on_board);
  for(i=0;i<8;i++){
    /* for each surrounding cell */
    xloc=loc+2*dir_offset[i];
    if(xloc>=0&&xloc<MAP_SIZE&&map[xloc].on_board)scan(vmap,xloc);
  }
  scan(vmap,loc);
}
/*
Update a location.  We set the date seen, the land type, object
contents starting with armies, then fighters, then boats, and the
city type.
*/
var city_char=['*','O','X'];
function update(vmap,loc){
  var p;
  vmap[loc].seen=date;
  if(map[loc].cityp)
  /* is there a city here? */
  vmap[loc].contents=city_char[map[loc].cityp.owner];
  else{
    p=find_obj_at_loc(loc);
    if(p==null)
    /* nothing here? */
    vmap[loc].contents=map[loc].contents;
    else if(p.owner==USER)vmap[loc].contents=piece_attr[p.type].sname;
    else vmap[loc].contents=tolower(piece_attr[p.type].sname);
  }
  if(vmap==comp_map)display_locx(COMP,comp_map,loc);
  else if(vmap==user_map)display_locx(USER,user_map,loc);
}
/*
Set the production for a city.  We make sure the city is displayed
on the screen, and we ask the user for the new production.  We keep
asking until we get a valid answer.
*/
function* set_prod(cityp){
  var i;
  scan(user_map,cityp.loc);
  display_loc(USER,user_map,cityp.loc);
  for(;;){
    prompt("What do you want the city at %d to produce? ",cityp.loc,0,0,0,0,0,0,0);
    i=(yield*get_piece_name());if(i==NOPIECE)error("I don't know how to build those.",0,0,0,0,0,0,0,0);else{
      cityp.prod=i;city.work=-($div(piece_attr[i].build_time,5));return;
    }
  }
}
/* Get the name of a type of object. */
function* get_piece_name(){
  var c;var i;c=(yield*get_chx());
  /* get the answer */
  for(i=0;
  i<NUM_OBJECTS;
  i++)if(piece_attr[i].sname==c){
    return i;
  }
  return NOPIECE;
}
/* ---------- term.c ---------- */
/* %W% %G% %U% - (c) Copyright 1987, 1988 Chuck Simmons */
/*
 *    Copyright (C) 1987, 1988 Chuck Simmons
 * 
 * See the file COPYING, distributed with empire, for restriction
 * and warranty information.
 */
/*
term.c -- this file contains various routines used to control the
user communications area of the terminal.  This area consists of
the top 3 lines of the terminal where messages are displayed to the
user and input is acquired from the user.

There are two types of output in this area.  One type is interactive
output.  This consists of a prompt line and an error message line.
The other type of output is informational output.  The user must
be given time to read informational output.

Whenever input is received, the top three lines are cleared and the
screen refreshed as the user has had time to read these lines.  We
also clear the 'need_delay' flag, saying that the user has read the
information on the screen.

When information is to be displayed, if the 'need_delay' flag is set,
we refresh the screen and pause momentarily to give the user a chance
to read the lines.  The new information is then displayed, and the
'need_delay' flag is set.
*/
var need_delay;
var my_stream;
function* pdebug(s,a,b,c,d,e,f,g,h){
  if(!print_debug)return;
  (yield*comment(s,a,b,c,d,e,f,g,h));
}
/*
Here are routines that handle printing to the top few lines of the
screen.  'topini' should be called at initialization, and whenever
we finish printing information to the screen.
*/
function* topini(){
  (yield*info(0,0,0));
}
/*
Write a message to one of the top lines.
*/
function topmsg(linep,buf,a,b,c,d,e,f,g,h){
  if(linep<1||linep>NUMTOPS)linep=1;
  move(linep-1,0);
  if(buf!=null&&strlen(buf)>0)addprintf(buf,a,b,c,d,e,f,g,h);
  clrtoeol();
}
function topmsg1(linep,buf,a,b,c,d,e,f,g,h){
  if(linep<1||linep>NUMTOPS)linep=1;
  move(linep-1,0);
  if(buf!=null&&strlen(buf)>0)addprintf1(buf,a,b,c,d,e,f,g,h);
  clrtoeol();
}
function topmsg2(linep,buf,a,b,c,d,e,f,g,h){
  if(linep<1||linep>NUMTOPS)linep=1;
  move(linep-1,0);
  if(buf!=null&&strlen(buf)>0)addprintf2(buf,a,b,c,d,e,f,g,h);
  clrtoeol();
}
/*
Print a prompt on the first message line.
*/
function prompt(buf,a,b,c,d,e,f,g,h){
  topmsg(1,buf,a,b,c,d,e,f,g,h);
}
function prompt1(buf,a,b,c,d,e,f,g,h){
  topmsg1(1,buf,a,b,c,d,e,f,g,h);
}
function prompt2(buf,a,b,c,d,e,f,g,h){
  topmsg2(1,buf,a,b,c,d,e,f,g,h);
}
/*
Print an error message on the second message line.
*/
function error(buf,a,b,c,d,e,f,g,h){
  topmsg(2,buf,a,b,c,d,e,f,g,h);
}
/*
Print out extra information.
*/
function extra(buf,a,b,c,d,e,f,g,h){
  topmsg(3,buf,a,b,c,d,e,f,g,h);
}
/*
Print out a generic error message.
*/
function huh(){
  error("Type H for Help.",0,0,0,0,0,0,0,0);
}
/*
Display information on the screen.  If the 'need_delay' flag is set,
we force a delay, then print the information.  After we print the
information, we set the need_delay flag.
*/
function* info(a,b,c){
  if(need_delay)(yield*delay());topmsg(1,a,0,0,0,0,0,0,0,0);topmsg(2,b,0,0,0,0,0,0,0,0);topmsg(3,c,0,0,0,0,0,0,0,0);need_delay=(a||b||c);
}
function set_need_delay(){
  need_delay=1;
}
function* comment(buf,a,b,c,d,e,f,g,h){
  if(need_delay)(yield*delay());topmsg(1,0,0,0,0,0,0,0,0,0);topmsg(2,0,0,0,0,0,0,0,0,0);topmsg(3,buf,a,b,c,d,e,f,g,h);need_delay=(buf!=0);
}
function* comment1(buf,a,b,c,d,e,f,g,h){
  if(need_delay)(yield*delay());topmsg1(1,0,0,0,0,0,0,0,0,0);topmsg1(2,0,0,0,0,0,0,0,0,0);topmsg1(3,buf,a,b,c,d,e,f,g,h);need_delay=(buf!=0);
}
/*
Get a character from the user and convert it to uppercase.
*/
function* get_chx(){
  var c;
  c=(yield*get_cq());
  if(islower(c))return(upper(c));else return(c);
}
/*
Input a character from the user with echoing.
*/
function* get_c(){
  var c;
  /* one char and a null */
  echo();
  c=(yield*get_cq());noecho();return(c);
}
/*
Input a character quietly.
*/
function* get_cq(){
  var c;
  crmode();
  refresh();
  c=(yield*getch());(yield*topini());
  /* clear information lines */
  nocrmode();return(c);
}
/*
Input a yes or no response from the user.  We loop until we get
a valid response.  We return TRUE iff the user replies 'y'.
*/
function* getyn(message){
  var c;
  for(;;){
    prompt(message,0,0,0,0,0,0,0,0);
    c=(yield*get_chx());
    if(c=='Y')return(1);if(c=='N')return(0);
    error("Please answer Y or N.",0,0,0,0,0,0,0,0);
  }
}
/*
Input an integer in a range.
*/
function* get_range(message,low,high){
  var result;
  for(;;){
    result=(yield*getint(message));
    if(result>=low&&result<=high)return(result);
    error("Please enter an integer in the range %d..%d.",low,high,0,0,0,0,0,0);
  }
}
/*
Print a screen of help information.
*/
function help(text,nlines){
  var i,r,c;var text_lines;
  text_lines=$div((nlines+1),2);
  /* lines of text */
  clear_screen();
  pos_str(NUMTOPS,1,text[0],0,0,0,0,0,0,0,0);
  /* mode */
  pos_str(NUMTOPS,41,"See empire.doc for more information.",0,0,0,0,0,0,0,0);
  for(i=1;
  i<nlines;
  i++){
    if(i>text_lines)pos_str(i-text_lines+NUMTOPS+1,41,text[i],0,0,0,0,0,0,0,0);else pos_str(i+NUMTOPS+1,1,text[i],0,0,0,0,0,0,0,0);
  }
  pos_str(text_lines+NUMTOPS+2,1,"--Piece---Yours-Enemy-Moves-Hits-Cost",0,0,0,0,0,0,0,0);pos_str(text_lines+NUMTOPS+2,41,"--Piece---Yours-Enemy-Moves-Hits-Cost",0,0,0,0,0,0,0,0);
  for(i=0;
  i<NUM_OBJECTS;
  i++){
    if(i>=$div((NUM_OBJECTS+1),2)){
      r=i-$div((NUM_OBJECTS+1),2);c=41;
    }else{
      r=i;c=1;
    }
    pos_str1(r+text_lines+NUMTOPS+3,c,"%-12s%c     %c%6d%5d%6d",piece_attr[i].nickname,piece_attr[i].sname,tolower(piece_attr[i].sname),piece_attr[i].speed,piece_attr[i].max_hits,piece_attr[i].build_time,0,0);
    //FLAG
  }
  refresh();
}
/* ---------- usermove.c ---------- */
function* user_move(){
  var i,j,sec,sec_start;var obj,next_obj;var prod;
/* First we loop through objects to update the user's view
	of the world and perform any other necessary processing.
	We would like to have the world view up to date before
	asking the user any questions.  This means that we should
	also scan through all cities before possibly asking the
	user what to produce in each city. */
  for(i=0;i<NUM_OBJECTS;i++)for(obj=user_obj[i];obj!=null;obj=obj.piece_link.next){
    obj.moved=0;
    /* nothing moved yet */
    scan(user_map,obj.loc);
    /* refresh user's view of world */
  }
  /* produce new hardware */
  for(i=0;i<NUM_CITY;i++)if(city[i].owner==USER){
    scan(user_map,city[i].loc);
    prod=city[i].prod;
    if(prod==NOPIECE){
      /* need production? */
      (yield*set_prod((city[i])));
      /* ask user what to produce */
    }else if(city[i].work++>=piece_attr[prod].build_time){
      /* kermyt begin */
      ksend1("%s has been completed at city %d.\n",piece_attr[prod].article,city[i].loc,0,0,0,0,0,0);
      /* kermyt end */
      (yield*comment1("%s has been completed at city %d.\n",piece_attr[prod].article,city[i].loc,0,0,0,0,0,0));
      produce(city[i]);
      /* produce should set object.moved to 0 */
    }
  }
  /* move all satellites */
  for(obj=user_obj[SATELLITE];obj!=null;obj=next_obj){
    next_obj=obj.piece_link.next;(yield*move_sat(obj));
  }
  sec_start=cur_sector();
  /* get currently displayed sector */
  if(sec_start==-1)sec_start=0;
  /* loop through sectors, moving every piece in the sector */
  for(i=sec_start;i<sec_start+NUM_SECTORS;i++){
    sec=i%NUM_SECTORS;sector_change();
    /* allow screen to be redrawn */
    for(j=0;j<NUM_OBJECTS;j++)
    /* loop through obj lists */
    for(obj=user_obj[move_order[j]];obj!=null;obj=next_obj){
      /* loop through objs in list */
      next_obj=obj.piece_link.next;
      if(!obj.moved)
      /* object not moved yet? */
      if(((($div(((obj.loc)%MAP_WIDTH),COLS_PER_SECTOR))*SECTOR_ROWS+($div(($div((obj.loc),MAP_WIDTH)),ROWS_PER_SECTOR))))==sec)
      /* object in sector? */
      (yield*piece_move(obj));
      /* yup; move the object */
    }
    if(cur_sector()==sec){
      /* is sector displayed? */
      print_sector(USER,user_map,sec);
      /* make screen up-to-date */
      refresh();
      /* show it to the user */
    }
  }
  if(save_movie)save_movie_screen();
}
/*
Move a piece.  We loop until all the moves of a piece are made.  Within
the loop, we first awaken the piece if it is adjacent to an enemy piece.
Then we attempt to handle any preprogrammed function for the piece.  If
the piece has not moved after this, we ask the user what to do.
*/
function* piece_move(obj){
  var changed_loc;var speed,max_hits;var saved_moves;var need_input;var saved_loc;var cityp;
  /* set func for piece if on city */
  cityp=find_city(obj.loc);
  if(cityp!=null)if(cityp.func[obj.type]!=NOFUNC)obj.func=cityp.func[obj.type];
  changed_loc=0;
  /* not changed yet */
  speed=piece_attr[obj.type].speed;
  max_hits=piece_attr[obj.type].max_hits;
  need_input=0;
  /* don't require user input yet */
  while(obj.moved<obj_moves(obj)){
    saved_moves=obj.moved;
    /* save moves made */
    saved_loc=obj.loc;
    /* remember starting location */
    if(awake(obj)||need_input){
      /* need user input? */
      (yield*ask_user(obj));(yield*topini());
      /* clear info lines */
      display_loc(USER,user_map,obj.loc);
      /* let user see result */
      refresh();need_input=0;
      /* we got it */
    }
    if(obj.moved==saved_moves)
    /* user set function? */
    switch(obj.func){
      /* handle preprogrammed function */
      case NOFUNC:break;case RANDOM:move_random(obj);break;case SENTRY:obj.moved=speed;break;case FILL:move_fill(obj);break;case LAND:(yield*move_land(obj));break;case EXPLORE:(yield*move_explore(obj));break;case ARMYLOAD:move_armyload(obj);break;case ARMYATTACK:(yield*move_armyattack(obj));break;case TTLOAD:move_ttload(obj);break;case REPAIR:(yield*move_repair(obj));break;case WFTRANSPORT:move_transport(obj);break;
      case MOVE_N:case MOVE_NE:case MOVE_E:case MOVE_SE:case MOVE_S:case MOVE_SW:case MOVE_W:case MOVE_NW:move_dir(obj);break;
      default:(yield*move_path(obj));break;
    }
    if(obj.moved==saved_moves)need_input=1;
/* handle fighters specially.  If in a city or carrier, turn
		is over and reset range to max.  Otherwise, if
		range = 0, fighter crashes and burns and turn is over. */
    if(obj.type==FIGHTER&&obj.hits>0){
      if((user_map[obj.loc].contents=='O'||user_map[obj.loc].contents=='C')&&obj.moved>0){
        obj.range=piece_attr[FIGHTER].range;obj.moved=speed;obj.func=NOFUNC;(yield*comment("Landing confirmed.",0,0,0,0,0,0,0,0));
      }else if(obj.range==0){
        (yield*comment("Fighter at %d crashed and burned.",obj.loc,0,0,0,0,0,0,0));kill_obj(obj,obj.loc);
      }
    }
    if(saved_loc!=obj.loc)changed_loc=1;
  }
  /* if a boat is in port, damaged, and never moved, fix some damage */
  if(obj.hits>0
  /* still alive? */
  &&!changed_loc
  /* object never changed location? */
  &&obj.type!=ARMY&&obj.type!=FIGHTER
  /* it is a boat? */
  &&obj.hits<max_hits
  /* it is damaged? */
  &&user_map[obj.loc].contents=='O')
  /* it is in port? */
  obj.hits++;
  /* fix some damage */
}
/*
Move a piece at random.  We create a list of empty squares to which
the piece can move.  If there are none, we do nothing, otherwise we 
move the piece to a random adjacent square.
*/
var $h_move_random_loc_list=$Z(8);
function move_random(obj){
  var loc_list=$h_move_random_loc_list;var i,nloc;var loc;
  nloc=0;
  for(i=0;i<8;i++){
    loc=obj.loc+dir_offset[i];
    if(good_loc(obj,loc)){
      loc_list[nloc]=loc;
      /* remember this location */
      nloc++;
      /* count locations we can move to */
    }
  }
  if(nloc==0)return;
  /* no legal move */
  i=irand(nloc-1);
  /* choose random direction */
  move_obj(obj,loc_list[i]);
  /* move the piece */
}
/*
Have a piece explore.  We look for the nearest unexplored territory
which the piece can reach and have to piece move toward the
territory.
*/
var $h_move_explore_path_map=$A(MAP_SIZE,()=>new path_map_t());
function* move_explore(obj){
  var path_map=$h_move_explore_path_map;var loc;var terrain;
  switch(obj.type){
    case ARMY:loc=(yield*vmap_find_lobj(path_map,user_map,obj.loc,user_army));terrain="+";break;case FIGHTER:loc=(yield*vmap_find_aobj(path_map,user_map,obj.loc,user_fighter));terrain="+.O";break;default:loc=(yield*vmap_find_wobj(path_map,user_map,obj.loc,user_ship));terrain=".O";break;
  }
  if(loc==obj.loc)return;
  /* nothing to explore */
  if(user_map[loc].contents==' '&&path_map[loc].cost==2)vmap_mark_adjacent(path_map,obj.loc);else vmap_mark_path(path_map,user_map,loc);
  loc=(yield*vmap_find_dir(path_map,user_map,obj.loc,terrain," "));if(loc!=obj.loc)move_obj(obj,loc);
}
/*
Move an army onto a transport when it arrives.  We scan around the
army to find a non-full transport.  If one is present, we move the
army to the transport and waken the army.
*/
function move_transport(obj){
  var loc;
  /* look for an adjacent transport */
  loc=find_transport(USER,obj.loc);
  if(loc!=obj.loc){
    move_obj(obj,loc);
    obj.func=NOFUNC;
  }else obj.moved=piece_attr[obj.type].speed;
}
/*
Move an army toward the nearest loading transport.
If there is an adjacent transport, move the army onto
the transport, and awaken the army.
*/
var amap=$A(MAP_SIZE,()=>new view_map_t());
function move_armyload(obj){
  var loc;var p;var i;
  ASSERT(0);
  /* look for an adjacent transport */
  loc=find_transport(USER,obj.loc);
  if(loc!=obj.loc){
    move_obj(obj,loc);
    obj.func=NOFUNC;
  }else{
    /* look for nearest non-full transport */
    memcpy(amap,user_map);
    /* mark loading transports or cities building transports */
    for(p=user_obj[TRANSPORT];p;p=p.piece_link.next)if(p.count<obj_capacity(p))
    /* not full? */
    amap[p.loc].contents='$';
    for(i=0;i<NUM_CITY;i++)if(city[i].owner==USER&&city[i].prod==TRANSPORT)amap[city[i].loc].contents='$';
  }
}
/*
Move an army toward an attackable city or enemy army.
*/
var $h_move_armyattack_path_map=$A(MAP_SIZE,()=>new path_map_t());
function* move_armyattack(obj){
  var path_map=$h_move_armyattack_path_map;var loc;
  ASSERT(obj.type==ARMY);
  loc=(yield*vmap_find_lobj(path_map,user_map,obj.loc,user_army_attack));if(loc==obj.loc)return;
  /* nothing to attack */
  vmap_mark_path(path_map,user_map,loc);
  loc=(yield*vmap_find_dir(path_map,user_map,obj.loc,"+","X*a"));if(loc!=obj.loc)move_obj(obj,loc);
}
function move_ttload(obj){
  ASSERT(0);
  obj=obj;
}
/*
Move a ship toward port.  If the ship is healthy, wake it up.
*/
var $h_move_repair_path_map=$A(MAP_SIZE,()=>new path_map_t());
function* move_repair(obj){
  var path_map=$h_move_repair_path_map;var loc;
  ASSERT(obj.type>FIGHTER);
  if(obj.hits==piece_attr[obj.type].max_hits){
    obj.func=NOFUNC;
    return;
  }
  if(user_map[obj.loc].contents=='O'){
    /* it is in port? */
    obj.moved+=1;
    return;
  }
  loc=(yield*vmap_find_wobj(path_map,user_map,obj.loc,user_ship_repair));if(loc==obj.loc)return;
  /* no reachable city */
  vmap_mark_path(path_map,user_map,loc);
  /* try to be next to ocean to avoid enemy pieces */
  loc=(yield*vmap_find_dir(path_map,user_map,obj.loc,".O","."));if(loc!=obj.loc)move_obj(obj,loc);
}
/*
Here we have a transport or carrier waiting to be filled.  If the
object is not full, we set the move count to its maximum value.
Otherwise we awaken the object.
*/
function move_fill(obj){
  if(obj.count==obj_capacity(obj))
  /* full? */
  obj.func=NOFUNC;
  /* awaken full boat */
  else obj.moved=piece_attr[obj.type].speed;
}
/*
Here we have a piece that wants to land at the nearest carrier or
owned city.  We scan through the lists of cities and carriers looking
for the closest one.  We then move toward that item's location.
The nearest landing field must be within the object's range.
*/
function* move_land(obj){
  var best_dist,best_loc;var new_dist;var p;
  best_dist=find_nearest_city(obj.loc,USER,$ref(()=>best_loc,($x)=>{best_loc=$x}));
  for(p=user_obj[CARRIER];p!=null;p=p.piece_link.next){
    new_dist=dist(obj.loc,p.loc);
    if(new_dist<best_dist){
      best_dist=new_dist;
      best_loc=p.loc;
    }
  }
  if(best_dist==0)obj.moved+=1;
  /* fighter is on a city */
  else if(best_dist<=obj.range)(yield*move_to_dest(obj,best_loc));else obj.func=NOFUNC;
  /* can't reach city or carrier */
}
/*
Move a piece in the specified direction if possible.
If the object is a fighter which has travelled for half its range,
we wake it up.
*/
function move_dir(obj){
  var loc;var dir;
  dir=(-(obj.func)+MOVE_N);
  loc=obj.loc+dir_offset[dir];
  if(good_loc(obj,loc))move_obj(obj,loc);
}
/*
Move a piece toward a specified destination if possible.  For each
direction, we see if moving in that direction would bring us closer
to our destination, and if there is nothing in the way.  If so, we
move in the first direction we find.
*/
function* move_path(obj){
  if(obj.loc==obj.func)obj.func=NOFUNC;
  else(yield*move_to_dest(obj,obj.func));
}
/*
Move a piece toward a specific destination.  We first map out
the paths to the destination, if we can't get there, we return.
Then we mark the paths to the destination.  Then we choose a
move.
*/
var $h_move_to_dest_path_map=$A(MAP_SIZE,()=>new path_map_t());
function* move_to_dest(obj,dest){
  var path_map=$h_move_to_dest_path_map;var fterrain;var mterrain;var new_loc;switch(obj.type){
    case ARMY:fterrain=T_LAND;
    mterrain="+";
    break;
    case FIGHTER:fterrain=T_AIR;
    mterrain="+.O";
    break;
    default:fterrain=T_WATER;
    mterrain=".O";
    break;
  }
  new_loc=vmap_find_dest(path_map,user_map,obj.loc,dest,USER,fterrain);
  if(new_loc==obj.loc)return;
  /* can't get there */
  vmap_mark_path(path_map,user_map,dest);
  new_loc=(yield*vmap_find_dir(path_map,user_map,obj.loc,mterrain," ."));if(new_loc==obj.loc)return;
  /* can't move ahead */
  ASSERT(good_loc(obj,new_loc));move_obj(obj,new_loc);
  /* everything looks good */
}
/*
Ask the user to move her piece.
*/
function* ask_user(obj){
  var c;
  for(;;){
    display_loc(USER,user_map,obj.loc);
    /* display piece to move */
    describe_obj(obj);
    /* describe object to be moved */
    display_score();
    /* show current score */
    display_loc(USER,user_map,obj.loc);
    /* reposition cursor */
    c=(yield*get_chx());
    /* get command from user (no echo) */
    switch(c){
      case 'Q':(yield*user_dir(obj,NORTHWEST));return;case 'W':(yield*user_dir(obj,NORTH));return;case 'E':(yield*user_dir(obj,NORTHEAST));return;case 'D':(yield*user_dir(obj,EAST));return;case 'C':(yield*user_dir(obj,SOUTHEAST));return;case 'X':(yield*user_dir(obj,SOUTH));return;case 'Z':(yield*user_dir(obj,SOUTHWEST));return;case 'A':(yield*user_dir(obj,WEST));return;
      case 'J':(yield*edit(obj.loc));reset_func(obj);return;case 'V':(yield*user_set_city_func(obj));reset_func(obj);return;case ' ':(yield*user_skip(obj));return;case 'F':user_fill(obj);return;case 'I':(yield*user_set_dir(obj));return;case 'R':user_random(obj);return;case 'S':user_sentry(obj);return;case 'L':user_land(obj);return;case 'G':user_explore(obj);return;case 'T':user_transport(obj);return;case 'U':user_repair(obj);return;case 'Y':user_armyattack(obj);return;
      case 'B':(yield*user_build(obj));break;case 'H':(yield*user_help());break;case 'K':user_wake(obj);break;case 'O':(yield*user_cancel_auto());break;case '\x0c':case 'P':user_redraw();break;case '?':describe_obj(obj);break;
      default:beep();
    }
  }
}
/*
Here, if the passed object is on a city, we assign
the city's function to the object.  However, we then awaken the
object if necessary because the user only changed the city
function, and did not tell us what to do with the object.
*/
function reset_func(obj){
  var cityp;cityp=find_city(obj.loc);
  if(cityp!=null)if(cityp.func[obj.type]!=NOFUNC){
    obj.func=cityp.func[obj.type];
    awake(obj);
  }
}
/*
Increment the number of moves a piece has used.  If the piece
is an army and the army is in a city, move the army to
the city.
*/
function* user_skip(obj){
  if(obj.type==ARMY&&user_map[obj.loc].contents=='O')(yield*move_army_to_city(obj,obj.loc));else obj.moved++;
}
/*
Put an object in FILL mode.  The object must be either a transport
or carrier.  If not, we beep at the user.
*/
function user_fill(obj){
  if(obj.type!=TRANSPORT&&obj.type!=CARRIER)beep();
  else obj.func=FILL;
}
/*
Print out help information.
*/
function* user_help(){
  var c;
  help(help_user,user_lines);
  prompt("Press any key to continue: ",0,0,0,0,0,0,0,0);
  c=(yield*get_chx());c=c;
  /* keep lint happy */
}
/*
Set an object's function to move in a certain direction.
*/
function* user_set_dir(obj){
  var c;
  c=(yield*get_chx());switch(c){
    case 'Q':obj.func=MOVE_NW;break;case 'W':obj.func=MOVE_N;break;case 'E':obj.func=MOVE_NE;break;case 'D':obj.func=MOVE_E;break;case 'C':obj.func=MOVE_SE;break;case 'X':obj.func=MOVE_S;break;case 'Z':obj.func=MOVE_SW;break;case 'A':obj.func=MOVE_W;break;default:beep();break;
  }
}
/*
Wake up the current piece.
*/
function user_wake(obj){
  obj.func=NOFUNC;
}
/*
Set the piece's func to random.  
*/
function user_random(obj){
  obj.func=RANDOM;
}
/*
Set a piece's function to sentry.
*/
function user_sentry(obj){
  obj.func=SENTRY;
}
/*
Set a fighter's function to land at the nearest city.
*/
function user_land(obj){
  if(obj.type!=FIGHTER)beep();
  else obj.func=LAND;
}
/*
Set the piece's func to explore.
*/
function user_explore(obj){
  obj.func=EXPLORE;
}
/*
Set an army's function to WFTRANSPORT.
*/
function user_transport(obj){
  if(obj.type!=ARMY)beep();
  else obj.func=WFTRANSPORT;
}
/*
Set an army's function to ARMYATTACK.
*/
function user_armyattack(obj){
  if(obj.type!=ARMY)beep();
  else obj.func=ARMYATTACK;
}
/*
Set a ship's function to REPAIR.
*/
function user_repair(obj){
  if(obj.type==ARMY||obj.type==FIGHTER)beep();
  else obj.func=REPAIR;
}
/*
Set a city's function.
*/
function* user_set_city_func(obj){
  var type;var e;var cityp;
  cityp=find_city(obj.loc);
  if(!cityp||cityp.owner!=USER){
    beep();
    return;
  }
  type=(yield*get_piece_name());if(type==NOPIECE){
    beep();return;
  }
  e=(yield*get_chx());switch(e){
    case 'F':
    /* fill */
    e_city_fill(cityp,type);break;case 'G':
    /* explore */
    e_city_explore(cityp,type);break;case 'I':
    /* directional stasis */
    (yield*e_city_stasis(cityp,type));break;case 'K':
    /* turn off function */
    e_city_wake(cityp,type);break;case 'R':
    /* make piece move randomly */
    e_city_random(cityp,type);break;case 'U':
    /* repair ship */
    e_city_repair(cityp,type);break;case 'Y':
    /* set army func to attack */
    e_city_attack(cityp,type);break;default:
    /* bad command? */
    beep();break;
  }
}
/*
Change a city's production.
*/
function* user_build(obj){
  var cityp;
  if(user_map[obj.loc].contents!='O'){
    /* no user city here? */
    beep();
    return;
  }
  cityp=find_city(obj.loc);
  ASSERT(cityp!=null);
  (yield*set_prod(cityp));
}
/*
Move a piece in the direction specified by the user.
This routine handles attacking objects.
*/
function* user_dir(obj,dir){
  var loc;
  loc=obj.loc+dir_offset[dir];
  if(good_loc(obj,loc)){
    move_obj(obj,loc);
    return;
  }
  if(!map[loc].on_board){
    error("You cannot move to the edge of the world.",0,0,0,0,0,0,0,0);
    (yield*delay());return;
  }
  switch(obj.type){
    case ARMY:(yield*user_dir_army(obj,loc));break;case FIGHTER:(yield*user_dir_fighter(obj,loc));break;default:(yield*user_dir_ship(obj,loc));break;
  }
}
/*
We have an army that wants to attack something or move onto some
unreasonable terrain.  We check for errors, question the user if
necessary, and attack if necessary.
*/
function* user_dir_army(obj,loc){
  var enemy_killed;enemy_killed=0;
  if(user_map[loc].contents=='O')
  /* attacking own city */
  (yield*move_army_to_city(obj,loc));
  else if(user_map[loc].contents=='T')
  /* transport full? */
  (yield*fatal(obj,loc,"Sorry, sir.  There is no more room on the transport.  Do you insist? ","Your army jumped into the briny and drowned."));
  else if(map[loc].contents=='.'){
    /* going for a swim? */
    if(!(yield*getyn(
    /* thanks to Craig Hansen for this next message */
    "Troops can't walk on water, sir.  Do you really want to go to sea? ")))return;
    if(user_map[obj.loc].contents=='T'){
      (yield*comment("Your army jumped into the briny and drowned.",0,0,0,0,0,0,0,0));ksend("Your army jumped into the briny and drowned.\n",0,0,0,0,0,0,0,0);
    }else if(user_map[loc].contents=='.'){
      (yield*comment("Your army marched dutifully into the sea and drowned.",0,0,0,0,0,0,0,0));ksend("Your army marched dutifully into the sea and drowned.\n",0,0,0,0,0,0,0,0);
    }else{
      /* attack something at sea */
      enemy_killed=islower(user_map[loc].contents);(yield*attack(obj,loc));if(obj.hits>0)
      /* ship won? */
      {
        (yield*comment("Your army regretfully drowns after its successful assault.",0,0,0,0,0,0,0,0));ksend("Your army regretfully drowns after it's successful assault.",0,0,0,0,0,0,0,0);
      }
    }
    if(obj.hits>0){
      kill_obj(obj,loc);if(enemy_killed)scan(comp_map,loc);
    }
  }else if(isupper(user_map[loc].contents)&&user_map[loc].contents!='X'){
    /* attacking self */
    if(!(yield*getyn("Sir, those are our men!  Do you really want to attack them? ")))return;
    (yield*attack(obj,loc));
  }
  else(yield*attack(obj,loc));
}
/*
Here we have a fighter wanting to attack something.  There are only
three cases:  attacking a city, attacking ourself, attacking the enemy.
*/
function* user_dir_fighter(obj,loc){
  if(map[loc].contents=='*')(yield*fatal(obj,loc,"That's never worked before, sir.  Do you really want to try? ","Your fighter was shot down."));
  else if(isupper(user_map[loc].contents)){
    if(!(yield*getyn("Sir, those are our men!  Do you really want to attack them? ")))return;
    (yield*attack(obj,loc));
  }
  else(yield*attack(obj,loc));
}
/*
Here we have a ship attacking something, or trying to move on
shore.  Our cases are: moving ashore (and subcases), attacking
a city, attacking self, attacking enemy.
*/
function* user_dir_ship(obj,loc){
  var enemy_killed;
  enemy_killed=0;
  if(map[loc].contents=='*'){
    jnkbuf=sprintf("Your %s broke up on shore.",piece_attr[obj.type].name);
    (yield*fatal(obj,loc,"That's never worked before, sir.  Do you really want to try? ",jnkbuf));
  }
  else if(map[loc].contents=='+'){
    /* moving ashore? */
    if(!(yield*getyn("Ships need sea to float, sir.  Do you really want to go ashore? ")))return;
    if(user_map[loc].contents=='+'){
      (yield*comment1("Your %s broke up on shore.",piece_attr[obj.type].name,0,0,0,0,0,0,0));ksend1("Your %s broke up on shore.",piece_attr[obj.type].name,0,0,0,0,0,0,0);
    }else{
      /* attack something on shore */
      enemy_killed=islower(user_map[loc].contents);(yield*attack(obj,loc));
      if(obj.hits>0)
      /* ship won? */
      {
        (yield*comment1("Your %s breaks up after its successful assault.",piece_attr[obj.type].name,0,0,0,0,0,0,0));ksend1("Your %s breaks up after its successful assault.",piece_attr[obj.type].name,0,0,0,0,0,0,0);
      }
    }
    if(obj.hits>0){
      kill_obj(obj,loc);if(enemy_killed)scan(comp_map,loc);
    }
  }else if(isupper(user_map[loc].contents)){
    /* attacking self */
    if(!(yield*getyn("Sir, those are our men!  Do you really want to attack them? ")))return;
    (yield*attack(obj,loc));
  }
  else(yield*attack(obj,loc));
}
/*
Here a user wants to move an army to a city.  If the city contains
a non-full transport, we make the move.  Otherwise we ask the user
if she really wants to attack the city.
*/
function* move_army_to_city(obj,city_loc){
  var tt;
  tt=find_nfull(TRANSPORT,city_loc);
  if(tt!=null)move_obj(obj,city_loc);
  else(yield*fatal(obj,city_loc,"That's our city, sir!  Do you really want to attack the garrison? ","Your rebel army was liquidated."));
}
/*
Cancel automove mode.
*/
function* user_cancel_auto(){
  if(!automove)(yield*comment("Not in auto mode!",0,0,0,0,0,0,0,0));else{
    automove=0;(yield*comment("Auto mode cancelled.",0,0,0,0,0,0,0,0));
  }
}
/*
Redraw the screen.
*/
function user_redraw(){
  redraw();
}
/*
Awaken an object if it needs to be.  Normally, objects are awakened
when they are next to an enemy object or an unowned city.  Armies
on troop transports are not awakened if they are surrounded by sea.
We return true if the object is now awake.  Objects are never
completely awoken here if their function is a destination.  But we
will return TRUE if we want the user to have control.
*/
function awake(obj){
  var i;var c;var t;
  if(obj.type==ARMY&&vmap_at_sea(user_map,obj.loc)){
    obj.moved=piece_attr[ARMY].range;
    return(0);
  }
  if(obj.func==NOFUNC)return(1);
  /* object is awake */
  if(obj.type==FIGHTER
  /* wake fighters */
  &&obj.func!=LAND
  /* that aren't returning to base */
  &&obj.func<0
  /* and which don't have a path */
  &&obj.range<=find_nearest_city(obj.loc,USER,$ref(()=>t,($x)=>{t=$x}))+2){
    obj.func=NOFUNC;
    /* wake piece */
    return(1);
  }
  for(i=0;i<8;i++){
    /* for each surrounding cell */
    c=user_map[obj.loc+dir_offset[i]].contents;
    if(islower(c)||c=='*'||c=='X'){
      if(obj.func<0)obj.func=NOFUNC;
      /* awaken */
      return(1);
    }
  }
  return(0);
}
/*
Question the user about a fatal move.  If the user responds 'y',
print out the response and kill the object.
*/
function* fatal(obj,loc,message,response){
  if((yield*getyn(message))){
    (yield*comment(response,0,0,0,0,0,0,0,0));kill_obj(obj,loc);
  }
}
/* ---------- util.c ---------- */
/*
Convert a character to uppercase (if it is lowercase)
*/
function upper(c){
  if(islower(c))return toupper(c);
  else return c;
}
/*
Clear the end of a specified line starting at the specified column.
*/
function clreol(linep,colp){
  move(linep,colp);
  clrtoeol();
}
/*
Clear the screen.  We must also kill information maintained about the
display.
*/
function clear_screen(){
  clear();
  refresh();
  kill_display();
}
/*
Wait a little bit to give user a chance to see a message.  We refresh
the screen and pause for a few milliseconds.
*/
function* delay(){
  refresh();
  (yield*napms(delay_time));
  /* pause a bit */
}
/*
Clean up the display.  This routine gets called as we leave the game.
*/
function close_disp(){
  move(LINES-1,0);
  clrtoeol();
  refresh();
  endwin();
}
/*
Position the cursor and output a string.
*/
function pos_str1(row,col,str,a,b,c,d,e,f,g,h){
  move(row,col);
  addprintf1(str,a,b,c,d,e,f,g,h);
}
function pos_str(row,col,str,a,b,c,d,e,f,g,h){
  move(row,col);
  addprintf(str,a,b,c,d,e,f,g,h);
}
function addprintf(str,a,b,c,d,e,f,g,h){
  var junkbuf="";junkbuf=sprintf(str,a,b,c,d,e,f,g,h);
  addstr(junkbuf);
}
function addprintf1(str,a,b,c,d,e,f,g,h){
  var junkbuf="";junkbuf=sprintf(str,a,b,c,d,e,f,g,h);
  addstr(junkbuf);
}
function addprintf2(str,a,b,c,d,e,f,g,h){
  var junkbuf="";junkbuf=sprintf(str,a,b,c,d,e,f,g,h);
  addstr(junkbuf);
}
/*
 * 03a 01Apr88 aml .Hacked movement algorithms for computer.
 * 02b 01Jun87 aml .First round of bug fixes.
 * 02a 01Jan87 aml .Translated to C.
 * 01b 27May85 cal .Fixed round number update bug. Made truename simple.
 * 01a 01Sep83 cal .Taken from a Decus tape
 */
function ver(){
  addstr("EMPIRE, Version 5.00 site Amdahl 1-Apr-1988");
}
/*
Here is a little routine to perform consistency checking on the
database.  I'm finding that my database is becoming inconsistent,
and I've no idea why.  Possibly this will help.

We perform the following functions:

1)  Make sure no list contains loops.

2)  Make sure every object is in either the free list with 0 hits,
or it is in the correct object list and a location list with non-zero hits,
and an appropriate owner.

3)  Make sure every city is on the map.

4)  Make sure every object is in the correct location and that
objects on the map have non-zero hits.

5)  Make sure every object in a cargo list has a ship pointer.

6)  Make sure every object with a ship pointer is in that ship's
cargo list.
*/
var in_free=$Z(LIST_SIZE);
/* TRUE if object in free list */
var in_obj=$Z(LIST_SIZE);
/* TRUE if object in obj list */
var in_loc=$Z(LIST_SIZE);
/* TRUE if object in a loc list */
var in_cargo=$Z(LIST_SIZE);
/* TRUE if object in a cargo list */
function check(){
  var i,j;var p;
  /* nothing in any list yet */
  for(i=0;i<LIST_SIZE;i++){
    in_free[i]=0;
    in_obj[i]=0;
    in_loc[i]=0;
    in_cargo[i]=0;
  }
/* Mark all objects in free list.  Make sure objects in free list
	have zero hits. */
  for(p=free_list;p!=null;p=p.piece_link.next){
    i=p-object;
    ASSERT(!in_free[i]);
    in_free[i]=1;
    ASSERT(p.hits==0);
    if(p.piece_link.prev)ASSERT(p.piece_link.prev.piece_link.next==p);
  }
/* Mark all objects in the map.
	Check that cities are in corect location.
	Check that objects are in correct location,
	have a good owner, and good hits. */
  for(i=0;i<MAP_SIZE;i++){
    if(map[i].cityp)ASSERT(map[i].cityp.loc==i);
    for(p=map[i].objp;p!=null;p=p.loc_link.next){
      ASSERT(p.loc==i);
      ASSERT(p.hits>0);
      ASSERT(p.owner==USER||p.owner==COMP);
      j=p-object;
      ASSERT(!in_loc[j]);
      in_loc[j]=1;
      if(p.loc_link.prev)ASSERT(p.loc_link.prev.loc_link.next==p);
    }
  }
  /* make sure all cities are on map */
  for(i=0;i<NUM_CITY;i++)ASSERT(map[city[i].loc].cityp==(city[i]));
  /* Scan object lists. */
  check_obj(comp_obj,COMP);
  check_obj(user_obj,USER);
  /* Scan cargo lists. */
  check_cargo(user_obj[TRANSPORT],ARMY);
  check_cargo(comp_obj[TRANSPORT],ARMY);
  check_cargo(user_obj[CARRIER],FIGHTER);
  check_cargo(comp_obj[CARRIER],FIGHTER);
  /* Make sure all objects with ship pointers are in cargo. */
  check_obj_cargo(comp_obj);
  check_obj_cargo(user_obj);
  /* Make sure every object is either free or in loc and obj list. */
  for(i=0;i<LIST_SIZE;i++)ASSERT(in_free[i]!=(in_loc[i]&&in_obj[i]));
}
/*
Check object lists.  We look for:

1)  Loops and bad prev pointers.

2)  Dead objects.

3)  Invalid types.

4)  Invalid owners.
*/
function check_obj(list,owner){
  var i,j;var p;for(i=0;i<NUM_OBJECTS;i++)for(p=list[i];p!=null;p=p.piece_link.next){
    ASSERT(p.owner==owner);
    ASSERT(p.type==i);
    ASSERT(p.hits>0);
    j=p-object;
    ASSERT(!in_obj[j]);
    in_obj[j]=1;
    if(p.piece_link.prev)ASSERT(p.piece_link.prev.piece_link.next==p);
  }
}
/*
Check cargo lists.  We assume object lists are valid.
as we will place bits in the 'in_cargo' array that are used by
'check_obj'.

Check for:

1)  Number of items in list is same as cargo count.

2)  Type of cargo is correct.

3)  Location of cargo matches location of ship.

4)  Ship pointer of cargo points to correct ship.

5)  There are no loops in cargo list and prev ptrs are correct.

6)  All cargo is alive.
*/
function check_cargo(list,cargo_type){
  var p,q;var j,count;for(p=list;p!=null;p=p.piece_link.next){
    count=0;
    for(q=p.cargo;q!=null;q=q.cargo_link.next){
      count+=1;
      /* count items in list */
      ASSERT(q.type==cargo_type);
      ASSERT(q.owner==p.owner);
      ASSERT(q.hits>0);
      ASSERT(q.ship==p);
      ASSERT(q.loc==p.loc);
      j=q-object;
      ASSERT(!in_cargo[j]);
      in_cargo[j]=1;
      if(p.cargo_link.prev)ASSERT(p.cargo_link.prev.cargo_link.next==p);
    }
    ASSERT(count==p.count);
  }
}
/*
Scan through object lists making sure every object with a ship
pointer appears in a cargo list.  We assume object and cargo
lists are valid.
*/
function check_obj_cargo(list){
  var p;var i;
  for(i=0;i<NUM_OBJECTS;i++)for(p=list[i];p!=null;p=p.piece_link.next){
    if(p.ship)ASSERT(in_cargo[p-object]);
  }
}
/* ---------- running it on the glass ---------- */
P.command({names:['empire'],noHelpFlag:true,run:function(a,raw,words){
  if(P.piped()){P.typeLine('empire: needs a terminal','err');return}
  var msg=$mainargs((words||[]).slice(1));
  if(msg){P.say([msg]);return}
  P.program(function(S,done){
    var G,over=false,timer=null,waiting=null;
    S0=S;
    LINES=S.rows<24?24:S.rows;COLS=S.cols<80?80:S.cols;
    $scr=$blank();$cur=$blank();$cy=$cx=$cury=$curx=0;$qk=[];$echo=false;
    function quit(){
      if(over)return;
      over=true;
      if(timer)clearTimeout(timer);
      S0=null;
      S.close();
      done();
    }
    function pump(v){
      if(over)return;
      var r;
      for(;;){
        try{r=G.next(v)}
        catch(e){
          if(e===EXIT){quit();return}
          quit();
          throw e;
        }
        if(r.done){quit();return}
        if(r.value.sleep!==undefined){
          timer=setTimeout(function(){timer=null;pump()},r.value.sleep);
          return;
        }
        /* the keyboard; what was typed during a pause is waiting */
        if($qk.length){v=$qk.shift();continue}
        waiting=r.value;
        return;
      }
    }
    function start(){G=empire();pump()}
    setTimeout(start,0);
    return {
      feed:function(k){
        /* it has no handler for the interrupt, so ^C ends it where it stands */
        if(k==='C-c'){quit();return}
        var m=/^C-([a-z])$/.exec(k),c=k==='Enter'?'\n':k==='Backspace'?'\b':k==='Tab'?'\t':k.length===1?k:m?$chr(m[1].charCodeAt(0)-96):null;
        if(c===null)return;
        if(waiting){waiting=null;pump(c)}
        else $qk.push(c);
      },
      draw:function(){$show()},
      resize:function(){$show()}
    };
  });
}});
})(window.Phosphor);
