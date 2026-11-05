/* PHOSPHOR-9 terminal: machine "bsd-1987", cribbage. Ported to JavaScript for this terminal from 4.3BSD's
   games/cribbage (cards.c, crib.c, extern.c, io.c, score.c, support.c, 5.1 (Berkeley) 5/30/85), with the text of
   usr/games/lib/crib.instr, from "According to Hoyle", which belongs to its publisher. The window handling
   below follows 4.3BSD's libcurses, under the same notice. It keeps this notice:

 * Copyright (c) 1980 Regents of the University of California.
 * All rights reserved.  The Berkeley software License Agreement
 * specifies the terms and conditions for redistribution.

   Differences: the instructions go through a small pager of its own instead of "ul | more -f", with no underlining, which also waits at the last page.
   Nothing is logged to /usr/games/lib/criblog. The screen is 24 by 80, cut off if the glass is smaller.
 */
(function(P){
'use strict';
var CRIBINSTR=[
"",
"",
"",
"",
"",
"",
"                            _\bC_\bR_\bI_\bB_\bB_\bA_\bG_\bE",
"",
"",
"",
"                              from",
"",
"                       _\bA_\bc_\bc_\bo_\br_\bd_\bi_\bn_\bg _\bt_\bo _\bH_\bo_\by_\bl_\be",
"",
"",
"",
"        Cribbage is believed to have been invented by Sir John",
"Suckling (1609-1642).  Probably it is an elaboration of an older",
"game, Noddy.  The original game was played with hands of five",
"cards; the modern game gives each player six.  That is virtually",
"the only change from Suckling's directions.",
"",
"",
"_\bP_\bl_\ba_\by_\be_\br_\bs.",
"",
"        Two.  There are variants for three and four players,",
"described later.",
"",
"",
"_\bC_\ba_\br_\bd_\bs.",
"",
"        The pack of 52.  The cards in each suit rank: K (high),",
"Q, J, 10, 9, 8, 7, 6, 5, 4, 3, 2, A.  The _\bc_\bo_\bu_\bn_\bt_\bi_\bn_\bg _\bv_\ba_\bl_\bu_\be_\bs are: K,",
"Q, J, 10, each 10 (wherefore these are called _\bt_\be_\bn_\bt_\bh _\bc_\ba_\br_\bd_\bs); ace,",
"1; each other card, its index value.",
"",
"",
"_\bC_\br_\bi_\bb_\bb_\ba_\bg_\be _\bB_\bo_\ba_\br_\bd",
"",
"        Indispensable to scoring (unless you have a computer!,",
"ed.) is the device known as the _\bc_\br_\bi_\bb_\bb_\ba_\bg_\be _\bb_\bo_\ba_\br_\bd.  This is a rec-",
"tangular panel, long and narrow, in which are four rows of 30",
"holes each.  (See illustration.)  At one end, or in the center,",
"are two or four additional holes, called _\bg_\ba_\bm_\be _\bh_\bo_\bl_\be_\bs.  The board",
"is placed between the two players, and each keeps his own score",
"on the two rows of holes nearest himself.  Each is supplied with",
"two _\bp_\be_\bg_\bs.  Before the first hand, the pegs are placed in the game",
"holes.  On making his first score, the player advances one peg an",
"appropriate number of holes (one per point) away from the _\bg_\ba_\bm_\be",
"_\be_\bn_\bd of the board.  The second score is recorded by placing the",
"second peg an appropriate distance ahead of the first.  For each",
"subsequent score, the rear peg is jumped ahead of the other, the",
"distance between the two pegs always showing the amount of this",
"last score.",
"",
"        The traditional mode of scoring is down (away from the",
"game end) the outer row, and up the inner row.  \"Once around\" is",
"a game of 61 points.  \"Twice around\" is a game of 121 points.",
"",
"",
"",
"",
"",
"",
"",
"",
"",
"",
"",
"",
"",
"",
"_\bP_\br_\be_\bl_\bi_\bm_\bi_\bn_\ba_\br_\bi_\be_\bs.",
"",
"        Cards are drawn; the lower deals first.  If cards of",
"equal rank are drawn, both players draw again.  Dealer has the",
"right to shuffle last.  Nondealer cuts, and must leave at least",
"four cards in each packet.",
"",
"",
"_\bD_\be_\ba_\bl_\bi_\bn_\bg.",
"",
"        Each player receives six cards, dealt one at a time face",
"down, beginning with the nondealer.  The turn to deal alternates.",
"The dealer has an advantage.",
"",
"",
"_\bL_\ba_\by_\bi_\bn_\bg _\bA_\bw_\ba_\by.",
"",
"        After seeing his hand, each player _\bl_\ba_\by_\bs _\ba_\bw_\ba_\by two cards",
"face down.  The four cards laid away, placed in one pile, form",
"the _\bc_\br_\bi_\bb.  The crib counts for the dealer.  Nondealer therefore",
"tries to lay away _\bb_\ba_\bl_\bk_\bi_\bn_\bg _\bc_\ba_\br_\bd_\bs -- cards that are least likely to",
"create a score in the crib.",
"",
"",
"_\bT_\bh_\be _\bS_\bt_\ba_\br_\bt_\be_\br.",
"",
"        After both hands have laid away, nondealer lifts off a",
"packet from the top of the _\bs_\bt_\bo_\bc_\bk (the rest of the pack).  Again,",
"each packet must contain at least four cards.  Dealer turns up",
"the top card of the lower packer, which is then placed on top of",
"the stock when the packets are reunited.  The card thus turned up",
"is called _\b1 _\bt_\bh_\be _\bs_\bt_\ba_\br_\bt_\be_\br.  If it is a jack, dealer immediately",
"pegs 2, called _\b2 _\bf_\bo_\br _\bh_\bi_\bs _\bh_\be_\be_\bl_\bs.",
"",
"",
"_\bT_\bh_\be _\bP_\bl_\ba_\by.",
"",
"        Nondealer begins the play by laying a card from his hand",
"face up on the table, announcing its counting value.  Dealer then",
"shows a card, announcing the total count of the two cards.  Play",
"continues in the same way, by alternate exposure of cards, each",
"player announcing the new total count.  The total may be carried",
"only to 31, no further.  If a player adds a card that brings the",
"total exactly to 31, he pegs 2.  If a player is unable to play",
"another card without exceeding 31, he must say \"Go,\" and his op-",
"ponent pegs 1, but before doing so, opponent must lay down any",
"additional cards he can without exceeding 31.  If such additional",
"cards bring the total to exactly 31, he pegs 2 instead of 1.",
"",
"        Whenever a _\bg_\bo occurs, the opponent of the player who",
"played the last card must lead for a new count starting at zero.",
"Playing the last card of all counts as a go.  (Since nondealer",
"makes the opening lead, dealer is bound to peg at least 1 in",
"play.)",
"",
"",
"                              - 2 -",
"",
"",
"",
"",
"",
"",
"",
"",
"",
"        Besides pegging for 31 and go, the player may also peg",
"for certain combinations made in play, as follows:",
"",
"",
"    _\bF_\bi_\bf_\bt_\be_\be_\bn.",
"",
"            Making the count total 15 pegs 2.",
"",
"",
"    _\bP_\ba_\bi_\br.",
"",
"            Playing a card of same rank as that previously",
"    played pegs 2.  Playing a third card of the same rank",
"    makes _\bp_\ba_\bi_\br _\br_\bo_\by_\ba_\bl and pegs 6.  Playing the fourth card of",
"    the same rank makes _\bd_\bo_\bu_\bb_\bl_\be _\bp_\ba_\bi_\br _\br_\bo_\by_\ba_\bl and pegs 12.",
"",
"            The tenth cards pair strictly by rank, a king",
"    with a king, a queen with a queen, and so on.  (King and",
"    jack do not make a pair, although each has the counting",
"    value 10.)",
"",
"",
"    _\bR_\bu_\bn.",
"",
"            Playing a card which, with the two or more played",
"    immediately previously, makes a sequence of three or more",
"    cards, pegs 1 for each card in the _\br_\bu_\bn.  Runs depend on",
"    rank alone; the suits do not matter.  Nor does the score",
"    for run depend upon playing the cards in strict sequence,",
"    so long as the three or more last cards played can be ar-",
"    ranged in a run.  _\bE_\bx_\ba_\bm_\bp_\bl_\be: 7, 6, 8 played in that order",
"    score 3 for run; 5, 2, 4, 3 played in that order score 4",
"    for run.",
"",
"        Any of the foregoing combinations count, whether the",
"cards are played alternately or one player plays several times in",
"succession in consequence of a go.  But a combination does not",
"score if it is interrupted by a go.",
"",
"",
"_\bS_\bh_\bo_\bw_\bi_\bn_\bg.",
"",
"        After the play, the hands are _\bs_\bh_\bo_\bw_\bn (counted).  Nondealer",
"shows first, then dealer's hand, then crib.  The starter is",
"deemed to belong to each hand, so that each hand includes five",
"cards.  Combinations of scoring value are as follows:",
"",
"",
"    _\bF_\bi_\bf_\bt_\be_\be_\bn.",
"",
"            Each combinations of two or more cards that total",
"    fifteen scores 2.",
"",
"",
"",
"",
"                              - 3 -",
"",
"",
"",
"",
"",
"",
"",
"",
"",
"    _\bP_\ba_\bi_\br.",
"",
"            Each pair of cards of the same rank scores 2.",
"",
"",
"    _\bR_\bu_\bn.",
"",
"            Each combination of three or more cards in se-",
"    quence scores 1 for each card in the run.",
"",
"",
"    _\bF_\bl_\bu_\bs_\bh.",
"",
"            Four cards of the same suit in hand score 4; four",
"    cards in hand or crib of same suit as the starter score",
"    5.  (No count for four-flush in crib.)",
"",
"",
"    _\bH_\bi_\bs _\bN_\bo_\bb_\bs.",
"",
"            Jack of same suit as the starter, in hand or",
"    crib, scores 1.",
"",
"        It is important to note that every separate grouping of",
"cards that makes a fifteen, pair, or run counts separately.",
"Three of a kind, _\bp_\ba_\bi_\br _\br_\bo_\by_\ba_\bl, counts 6 because three sets of pairs",
"can be made; similarly, four of a kind, _\bd_\bo_\bu_\bb_\bl_\be _\bp_\ba_\bi_\br _\br_\bo_\by_\ba_\bl, con-",
"tain six pairs and count 12.",
"",
"        The highest possible hand is J, 5, 5, 5 with the starter",
"the 5 of the same suit as the jack.  There are four fifteens by",
"combining the jack with a five, four more by combinations of",
"three fives (a total of 16 for fifteens); the double pair royal",
"adds 12 for a total of 28; and _\bh_\bi_\bs _\bn_\bo_\bb_\bs adds 1 for a maximum",
"score of 29.  (the score of 2 for _\bh_\bi_\bs _\bh_\be_\be_\bl_\bs does not count in the",
"total of the hand, since it is pegged before the play.)",
"",
"        A _\bd_\bo_\bu_\bb_\bl_\be _\br_\bu_\bn is a run with one card duplicated, as 4-3-",
"3-2.  Exclusive of fifteens, a double run of three cards counts",
"8; of four cards, 10.  A _\bt_\br_\bi_\bp_\bl_\be _\br_\bu_\bn is a run of three with one",
"card triplicated, as K-K-K-Q-J.  Exclusive of fifteens, it counts",
"15.  A _\bq_\bu_\ba_\bd_\br_\bu_\bp_\bl_\be _\br_\bu_\bn is a run of three with two different cards",
"duplicated, as the example 8-8-7-6-6 previously given.  Exclusive",
"of fifteens, it counts 16.",
"",
"        No hand can be constructed that counts 19, 25, 26 or 27.",
"A time-honored way of showing a hand with not a single counting",
"combination is to say \"I have nineteen.\"",
"",
"        The customary oder in showing is to count fifteens first,",
"then runs, then pairs, but there is no compulsion of law.  _\bE_\bx_\ba_\bm_\b-",
"_\bp_\bl_\be: A hand (with starter) of 9-6-5-4-4 will usually be counted",
"\"Fifteen 2, fifteen 4, fifteen 6 and double run makes 14,\" or",
"simply \"Fifteen 6 and 8 is 14.\"",
"",
"",
"                              - 4 -",
"",
"",
"",
"",
"",
"",
"",
"",
"",
"_\bM_\bu_\bg_\bg_\bi_\bn_\bs.",
"",
"        The hands and crib are counted aloud, and if a player",
"claims a greater total than is due him, his opponent may require",
"correction.  In some localities, if a player claims less than is",
"due, his opponent may say \"Muggins\" and himself score the points",
"overlooked.",
"",
"",
"_\bS_\bc_\bo_\br_\bi_\bn_\bg.",
"",
"        The usual _\bg_\ba_\bm_\be is 121, but it may be set at 61 by agree-",
"ment.  Since the player wins who first returns to the game hole",
"by going \"twice around,\" the scores must be pegged strictly in",
"order: his heels, pegging in play, non-dealer's hand, dealer's",
"hand, crib.  Thus, if nondealer goes out on showing his hand, he",
"wins, even though dealer might have gone out with a greater total",
"if allowed to count his hand and crib.",
"",
"        When the game of 121 is played for a stake, a player wins",
"a single game if the loser makes 61 points or more.  If the loser",
"fails to reach 61, he is _\bl_\bu_\br_\bc_\bh_\be_\bd, and the other wins a double",
"game.",
"",
"",
"_\bI_\br_\br_\be_\bg_\bu_\bl_\ba_\br_\bi_\bt_\bi_\be_\bs.",
"",
"        _\bM_\bi_\bs_\bd_\be_\ba_\bl.  There must be a new deal by the same dealer if",
"a card is found faced in the pack, if a card is exposed in deal-",
"ing, or if the pack be found imperfect.",
"",
"        _\bW_\br_\bo_\bn_\bg _\bN_\bu_\bm_\bb_\be_\br _\bo_\bf _\bC_\ba_\br_\bd_\bs.  If one hand (not crib) is found",
"to have the wrong number of cards after laying away for the crib,",
"the other hand and crib being correct, the opponent may either",
"demand a new deal or may peg 2 and rectify the hand.  If the crib",
"is incorrect, both hands being correct, nondealer pegs 2 and the",
"crib is corrected.",
"",
"",
"_\bE_\br_\br_\bo_\br _\bi_\bn _\bP_\be_\bg_\bg_\bi_\bn_\bg.",
"",
"        If a player places a peg short of the amount to which he",
"is entitled, he may not correct his error after he has played the",
"next card or after the cut for the next deal.  If he pegs more",
"than his announced score, the error must be corrected on demand",
"at any time before the cut for the next deal and his opponent",
"pegs 2.",
"",
"",
"_\bS_\bt_\br_\ba_\bt_\be_\bg_\by.",
"",
"        The best balking cards are kings and aces, because they",
"have the least chance of producing sequences.  Tenth cards are",
"generally good, provided that the two cards laid away are not too",
"",
"",
"                              - 5 -",
"",
"",
"",
"",
"",
"",
"",
"",
"",
"_\bn_\be_\ba_\br (likely to make a sequence).  When nothing better offers,",
"give two _\bw_\bi_\bd_\be cards -- at least three apart in rank.",
"",
"        Proverbially the safest lead is a 4.  The next card can-",
"not make a 15.  Lower cards are also safe from this point of",
"view, but are better treasured for go and 31.  The most dangerous",
"leads are 7 and 8, but may be made to trap the opponent when they",
"are backed with other close cards.  Generally speaking, play _\bo_\bn",
"(toward a sequence) when you have close cards and _\bo_\bf_\bf when you do",
"not.  However, the state of the score is a consideration.  If far",
"behind, play on when there is any chance of building a score for",
"yourself; if well ahead, balk your opponent by playing off unless",
"you will surely peg as much as he by playing on.",
"",
"",
"",
"",
"",
"",
"",
"",
"",
"",
"",
"",
"",
"",
"",
"",
"",
"",
"",
"",
"",
"",
"",
"",
"",
"",
"",
"",
"",
"",
"",
"",
"",
"",
"",
"",
"",
"",
"",
"",
"",
"",
"",
"                              - 6 -",
"",
"",
""
];
var CARDS=52,RANKS=13,SUITS=4,CINHAND=4,FULLHAND=6,LGAME=121,SGAME=61,JACK=10,EMPTY=13,
  PLAY_Y=15,PLAY_X=12,TABLE_Y=21,TABLE_X=14,COMP_Y=15,COMP_X=12,Y_SCORE_SZ=9,SCORE_Y=0,SCORE_X=PLAY_X+TABLE_X+COMP_X,CRIB_Y=17,CRIB_X=PLAY_X+TABLE_X,Y_MSG_START=Y_SCORE_SZ+1,
  PEG='*',LINESIZE=128,EXIT={};
var crbescr=[-10000,271827,278883,332319,347769,261129,250653,253203,248259,243435,256275,237435,231051,-10000,-10000,412815,295707,349497,267519,262521,259695,254019,250047,262887,244047,237663,-10000,-10000,-10000,333987,388629,262017,266787,262971,252729,254475,267315,248475,242091,-10000,-10000,-10000,-10000,422097,302787,256437,263751,257883,254271,267111,248271,241887,-10000,-10000,-10000,-10000,-10000,427677,387837,349173,347985,423861,436701,417861,411477,-10000,-10000,-10000,-10000,-10000,-10000,336387,298851,338667,236487,249327,230487,224103,-10000,-10000,-10000,-10000,-10000,-10000,-10000,408483,266691,229803,246195,227355,220971,-10000,-10000,-10000,-10000,-10000,-10000,-10000,-10000,300675,263787,241695,226407,220023,-10000,-10000,-10000,-10000,-10000,-10000,-10000,-10000,-10000,295635,273543,219771,216939,-10000,-10000,-10000,-10000,-10000,-10000,-10000,-10000,-10000,-10000,306519,252747,211431,-10000,-10000,-10000,-10000,-10000,-10000,-10000,-10000,-10000,-10000,-10000,304287,262971,-10000,-10000,-10000,-10000,-10000,-10000,-10000,-10000,-10000,-10000,-10000,-10000,244131,-10000,-10000,-10000,-10000,-10000,-10000,-10000,-10000,-10000,-10000,-10000,-10000,-10000];
var crbnescr=[325272,260772,267828,321264,336714,250074,239598,242148,237204,232380,246348,226380,219996,-10000,342528,401760,284652,338442,256464,251466,248640,242964,238992,252960,232992,226608,-10000,-10000,362280,322932,377574,250962,255732,251916,241674,243420,257388,237420,231036,-10000,-10000,-10000,360768,411042,291732,245382,252696,246828,243216,257184,237216,230832,-10000,-10000,-10000,-10000,528768,416622,376782,338118,336930,412806,426774,406806,400422,-10000,-10000,-10000,-10000,-10000,369864,325332,287796,327612,225432,239400,219432,213048,-10000,-10000,-10000,-10000,-10000,-10000,359160,397428,255636,218748,236268,216300,209916,-10000,-10000,-10000,-10000,-10000,-10000,-10000,331320,289620,252732,231768,215352,208968,-10000,-10000,-10000,-10000,-10000,-10000,-10000,-10000,325152,284580,263616,208716,205884,-10000,-10000,-10000,-10000,-10000,-10000,-10000,-10000,-10000,321240,296592,241692,200376,-10000,-10000,-10000,-10000,-10000,-10000,-10000,-10000,-10000,-10000,348600,294360,253044,-10000,-10000,-10000,-10000,-10000,-10000,-10000,-10000,-10000,-10000,-10000,308664,233076,-10000,-10000,-10000,-10000,-10000,-10000,-10000,-10000,-10000,-10000,-10000,-10000,295896];
var rankname=['ACE','TWO','THREE','FOUR','FIVE','SIX','SEVEN','EIGHT','NINE','TEN','JACK','QUEEN','KING'],
  rankchar=['A','2','3','4','5','6','7','8','9','T','J','Q','K'],
  suitname=['SPADES','HEARTS','DIAMONDS','CLUBS'],suitchar=['S','H','D','C'],
  tv=[8,7,9,6,11,12,13,14,10,5],ichoose2=[0,0,2,6,12];
function VAL(c){return c<9?c+1:10}
function Card(){return {rank:0,suit:0}}
function cp(c){return {rank:c.rank,suit:c.suit}}
function cards(n){var a=[];while(n--)a.push(Card());return a}
function eq(a,b){return a.rank===b.rank&&a.suit===b.suit}
function isone(a,b,n){for(var i=0;i<n;i++)if(eq(a,b[i]))return true;return false}
function remove(a,d,n){
  var j=0,x=cp(a);
  for(var i=0;i<n;i++)if(!eq(x,d[i]))d[j++]=cp(d[i]);
  if(j<n)d[j].suit=d[j].rank=EMPTY;
}
function sorthand(h,n,at){
  at=at||0;
  for(var e=at+n,a=at;a<e-1;a++)for(var c=a+1;c<e;c++)
    if(h[c].rank<h[a].rank||(h[c].rank===h[a].rank&&h[c].suit<h[a].suit)){var t=h[a];h[a]=h[c];h[c]=t}
}
function isdigit(c){return c>='0'&&c<='9'}
function islowerc(c){return c>=97&&c<=122}
function glass(s){
  if(s.indexOf('\b')<0)return s;
  var r=[],c=0;
  for(var i=0;i<s.length;i++){
    var ch=s.charAt(i);
    if(ch==='\b'){if(c>0)c--}
    else if(ch==='\t'){do{if(r[c]===undefined)r[c]=' ';c++}while(c%8)}
    else if(ch>=' ')r[c++]=ch;
  }
  for(i=0;i<r.length;i++)if(r[i]===undefined)r[i]=' ';
  return r.join('');
}
P.command({names:['cribbage'],run:function(a,raw,words){
  var explain=false,iwon=false,quiet=false,rflag=false,argv=words.slice(1),s;
  for(var ai=0;ai<argv.length;ai++){
    if(argv[ai].charAt(0)!=='-'){P.say(['','',"cribbage: usage is 'cribbage [-eqr]'"]);P.status(1);return}
    for(s=1;s<argv[ai].length;s++){
      switch(argv[ai].charAt(s)){
      case 'e':explain=true;break;
      case 'q':quiet=true;break;
      case 'r':rflag=true;break;
      default:P.say(['','',"cribbage: usage is 'cribbage [-eqr]'"]);P.status(2);return;
      }
    }
  }
  P.program(function(S,finish_){
  /* --- 4.3BSD's curses, as this game needs it (curses43.js) --- */
  var K=P.curses43(S),LINES=K.LINES,COLS=K.COLS,NOCHANGE=K.NOCHANGE,stdscr,curscr,blank=K.blank,mkwin=K.mkwin,touchline=K.touchline,touchwin=K.touchwin,wmove=K.wmove,wclrtoeol=K.wclrtoeol,waddch=K.waddch,waddstr=K.waddstr,mvwaddstr=K.mvwaddstr,mvwaddch=K.mvwaddch,werase=K.werase,wclear=K.wclear,makech=K.makech,wrefresh=K.wrefresh,view=K.view;
  function initscr(){K.initscr();stdscr=K.stdscr;curscr=K.curscr}
  var MSG_Y=LINES-(Y_SCORE_SZ+1),MSG_X=COLS-SCORE_X-1;
  var Compwin,Msgwin,Playwin,Tablewin,oscrSave;
  var expl='',cgames=0,cscore=0,gamecount=0,glimit=LGAME,knownum=0,pgames=0,pscore=0;
  var chand=cards(FULLHAND),crib=cards(CINHAND),deck=cards(CARDS),known=cards(CARDS),phand=cards(FULLHAND),turnover=Card();
  var Lastscore=[-1,-1],Msgbuf='',Mpos=0,Newpos=0,Lineno=0,lastline=0,ERASE=8,KILL=21,LB=new Array(LINESIZE).fill(0);
  var Table=cards(14),Tcnt=0,pairpoints=0,runpoints=0,randx=1;
  function rand(){randx=(Math.imul(randx,1103515245)+12345)&0x7fffffff;return randx}
  function srand(x){randx=x}
  function move(y,x){wmove(stdscr,y,x)}
  function refresh(){wrefresh(stdscr)}
  function mvaddstr(y,x,t){mvwaddstr(stdscr,y,x,t)}
  function mvaddch(y,x,c){mvwaddch(stdscr,y,x,c)}
  function bell(){if(P.click)P.click(1,700)}
  function bye(){throw EXIT}
  function makedeck(d){
    var i=Math.floor(Date.now()/1000)|0,j,k=0;
    i=((i&0xff)<<8)|((i>>8)&0xff)|1;
    srand(i);
    for(i=0;i<RANKS;i++)for(j=0;j<SUITS;j++){d[k].suit=j;d[k++].rank=i}
  }
  function shuffle(d){
    for(var j=CARDS;j>0;--j){
      var k=(rand()>>4)%j,c=d[j-1];
      d[j-1]=d[k];
      d[k]=c;
    }
  }
  function fifteens(h,n){
    var sums=[],nsums=[],i,e,sp,np;
    for(i=0;i<15;i++){sums.push(0);nsums.push(0)}
    for(e=0;e<n;e++){
      i=h[e].rank+1;
      if(i>10)i=10;
      np=i;
      nsums[np-1]++;
      sp=0;
      while(i<15){nsums[np++]+=sums[sp++];i++}
      for(i=0;i<15;i++)sums[i]=nsums[i];
    }
    return sums[14];
  }
  function pairuns(h,n){
    var run=true,runlength=1,mult1=1,pair1=-1,mult2=1,pair2=-1,curmult=1,runmult=1,lastmult;
    for(var i=1;i<n;i++){
      lastmult=curmult;
      if(h[i].rank===h[i-1].rank){
        if(pair1<0){pair1=h[i].rank;mult1=curmult=2}
        else if(h[i].rank===pair1)curmult=++mult1;
        else if(pair2<0){pair2=h[i].rank;mult2=curmult=2}
        else curmult=++mult2;
        if(i===n-1&&run)runmult*=curmult;
      }
      else{
        curmult=1;
        if(h[i].rank===h[i-1].rank+1){
          if(run)++runlength;
          else if(runlength<3){run=true;runlength=2;runmult=1}
          runmult*=lastmult;
        }
        else{
          if(run)runmult*=lastmult;
          run=false;
        }
      }
    }
    pairpoints=ichoose2[mult1]+ichoose2[mult2];
    runpoints=runlength>=3?runlength*runmult:0;
    return pairpoints+runpoints;
  }
  function scorehand(hand,starter,n,crb,do_explain,at){
    at=at||0;
    var h=[],i,k,score=0,flag=true;
    expl='';
    k=hand[at].suit;
    for(i=0;i<n;i++){
      flag=flag&&hand[at+i].suit===k;
      if(hand[at+i].rank===JACK)
        if(hand[at+i].suit===starter.suit){
          score++;
          if(do_explain)expl+='His Nobs';
        }
      h[i]=hand[at+i];
    }
    if(flag&&n>=CINHAND){
      if(do_explain&&expl!=='')expl+=', ';
      if(starter.suit===k){
        score+=5;
        if(do_explain)expl+='Five-flush';
      }
      else if(!crb){
        score+=4;
        if(do_explain&&expl!=='')expl+=', Four-flush';
        else expl='Four-flush';
      }
    }
    if(do_explain&&expl!=='')expl+=', ';
    h[n]=starter;
    sorthand(h,n+1);
    i=2*fifteens(h,n+1);
    score+=i;
    if(do_explain){
      if(i>0)expl+=i+' points in fifteens';
      else expl+='No fifteens';
    }
    i=pairuns(h,n+1);
    score+=i;
    if(do_explain){
      if(i>0)expl+=', '+pairpoints+' points in pairs, '+runpoints+' in runs';
      else expl+=', No pairs/runs';
    }
    return score;
  }
  function pegscore(crd,tbl,n,sum){
    var got=[],i,j,scr,k,lo,hi;
    sum+=VAL(crd.rank);
    if(sum>31)return -1;
    scr=sum===31||sum===15?2:0;
    if(!n)return scr;
    j=1;
    while(n-j>=0&&crd.rank===tbl[n-j].rank)++j;
    if(j>1)return scr+ichoose2[j];
    if(n<2)return scr;
    lo=hi=crd.rank;
    for(i=0;i<RANKS;i++)got[i]=false;
    got[crd.rank]=true;
    k=-1;
    for(i=n-1;i>=0;--i){
      if(got[tbl[i].rank])break;
      got[tbl[i].rank]=true;
      if(tbl[i].rank<lo)lo=tbl[i].rank;
      if(tbl[i].rank>hi)hi=tbl[i].rank;
      for(j=lo;j<=hi;j++)if(!got[j])break;
      if(j>hi)k=hi-lo+1;
    }
    return k>=3?scr+k:scr;
  }
  function adjust(cb,tnv){
    var c0=cb[0].rank,c1=cb[1].rank,scr;
    if(c0>c1){var i=c0;c0=c1;c1=i}
    scr=cb[0].suit!==cb[1].suit?crbnescr[RANKS*c0+c1]:crbescr[RANKS*c0+c1];
    return Math.trunc((scr+29400)/58800);
  }
  function anysumto(hand,n,s,t){
    for(var i=0;i<n;i++)if(s+VAL(hand[i].rank)===t)return i;
    return -1;
  }
  function numofval(h,n,v){
    var j=0;
    for(var i=0;i<n;i++)if(VAL(h[i].rank)===v)++j;
    return j;
  }
  function anymove(hand,n,sum){
    if(n<1)return false;
    var j=hand[0].rank;
    for(var i=1;i<n;i++)if(hand[i].rank<j)j=hand[i].rank;
    return sum+VAL(j)<=31;
  }
  function makeknown(h,n){for(var i=0;i<n;i++)known[knownum++]=cp(h[i])}
  function cchose(h,n,s){
    var i,j,l;
    if(n<=1)return 0;
    if(s<4){
      if((j=anysumto(h,n,s,4))>=0)return j;
      if((j=anysumto(h,n,s,3))>=0&&s===0)return j;
    }
    if(s>0&&s<20){
      for(i=1;i<=10;i++)
        if((j=anysumto(h,n,s,21-i))>=0)
          if((l=numofval(h,n,i))>0)
            if(l>1||VAL(h[j].rank)!==i)return j;
    }
    if(s<15){
      for(i=0;i<10;i++)
        if((j=anysumto(h,n,s,tv[i]))>=0)
          if((l=numofval(h,n,15-tv[i]))>0)
            if(l>1||VAL(h[j].rank)!==15-tv[i])return j;
    }
    j=-1;
    for(i=n-1;i>=0;--i){
      l=s+VAL(h[i].rank);
      if(l>31)continue;
      if(l!==5&&l!==10&&l!==21){j=i;break}
    }
    if(j>=0)return j;
    for(i=n-1;i>=0;--i){
      l=s+VAL(h[i].rank);
      if(l>31)continue;
      if(j<0)j=i;
      if(l!==5&&l!==21){j=i;break}
    }
    return j;
  }
  function cdiscard(mycrib){
    var d=cards(CARDS),h=cards(FULLHAND),cb=[Card(),Card()],i,j,k,nc,ns=0,sums=[];
    var undo1=[0,0,0,0,0,1,1,1,1,2,2,2,3,3,4],undo2=[1,2,3,4,5,2,3,4,5,3,4,5,4,5,5];
    makedeck(d);
    nc=CARDS;
    for(i=0;i<knownum;i++)remove(known[i],d,nc--);
    for(i=0;i<15;i++)sums[i]=0;
    for(i=0;i<FULLHAND-1;i++){
      cb[0]=cp(chand[i]);
      for(j=i+1;j<FULLHAND;j++){
        cb[1]=cp(chand[j]);
        for(k=0;k<FULLHAND;k++)h[k]=cp(chand[k]);
        remove(chand[i],h,FULLHAND);
        remove(chand[j],h,FULLHAND-1);
        for(k=0;k<nc;k++){
          sums[ns]+=scorehand(h,d[k],CINHAND,true,false);
          if(mycrib)sums[ns]+=adjust(cb,d[k]);
          else sums[ns]-=adjust(cb,d[k]);
        }
        ++ns;
      }
    }
    j=0;
    for(i=1;i<15;i++)if(sums[i]>sums[j])j=i;
    for(k=0;k<FULLHAND;k++)h[k]=cp(chand[k]);
    remove(h[undo1[j]],chand,FULLHAND);
    remove(h[undo2[j]],chand,FULLHAND-1);
    chand[4]=cp(h[undo1[j]]);
    chand[5]=cp(h[undo2[j]]);
  }
  /* ---- messages ---- */
  function msg(t){addmsg(t);endmsg()}
  function addmsg(t){
    Msgbuf=Msgbuf.slice(0,Newpos)+t;
    Newpos=Msgbuf.length;
  }
  function endmsg(){
    var len,mp=0,omp;
    mvaddch(lastline+Y_MSG_START,SCORE_X,' ');
    var c0=Msgbuf.charCodeAt(0);
    if(islowerc(c0)&&Msgbuf.charAt(1)!==')')Msgbuf=Msgbuf.charAt(0).toUpperCase()+Msgbuf.slice(1);
    len=Msgbuf.length;
    if(Math.trunc(len/MSG_X)+Lineno>=MSG_Y){
      while(Lineno<MSG_Y){
        wmove(Msgwin,Lineno++,0);
        wclrtoeol(Msgwin);
      }
      Lineno=0;
    }
    mvaddch(Lineno+Y_MSG_START,SCORE_X,'*');
    lastline=Lineno;
    do{
      mvwaddstr(Msgwin,Lineno,0,Msgbuf.slice(mp));
      if((len=Msgbuf.length-mp)>MSG_X){
        omp=mp;
        for(mp=mp+MSG_X-1;Msgbuf.charAt(mp)!==' ';mp--);
        while(Msgbuf.charAt(mp)===' ')mp--;
        mp++;
        wmove(Msgwin,Lineno,mp-omp);
        wclrtoeol(Msgwin);
      }
      if(++Lineno>=MSG_Y)Lineno=0;
    }while(len>MSG_X);
    wclrtoeol(Msgwin);
    Mpos=len;
    Newpos=0;
    wrefresh(Msgwin);
    refresh();
    wrefresh(Msgwin);
  }
  function* readchar(){
    for(;;){
      var c=yield;
      if(c===12)continue;
      return c===13?10:c;
    }
  }
  function* do_wait(){
    var pr='--More--';
    if(Mpos+9<MSG_X)wmove(Msgwin,Lineno>0?Lineno-1:MSG_Y-1,Mpos);
    else{
      mvwaddch(Msgwin,Lineno,0,' ');
      wclrtoeol(Msgwin);
      if(++Lineno>=MSG_Y)Lineno=0;
    }
    waddstr(Msgwin,pr);
    wrefresh(Msgwin);
    while((yield* readchar())!==32);
  }
  function unctrl(c){
    c&=0o177;
    if(c<32)return '^'+(c===30?'~':String.fromCharCode(c+64));
    if(c===127)return '^?';
    return String.fromCharCode(c);
  }
  function lbstr(i){var t='';while(i<LB.length&&LB[i])t+=String.fromCharCode(LB[i++]);return t}
  function* getline(){
    var oscr=stdscr,sp=0,c,oy,ox;
    stdscr=Msgwin;
    oy=stdscr.cury;ox=stdscr.curx;
    refresh();
    while((c=yield* readchar())!==10){
      if(c===ERASE){
        if(sp>0){
          sp--;
          for(var i=unctrl(LB[sp]).length;i;i--)waddch(stdscr,'\b');
        }
      }
      else if(c===KILL){
        sp=0;
        wmove(stdscr,oy,ox);
      }
      else if(!(sp===0&&c===32)){
        if(sp>=LINESIZE-1||!(c>=32&&c<127))bell();
        else{
          if(islowerc(c))c-=32;
          LB[sp++]=c;
          waddstr(stdscr,unctrl(c));
          Mpos++;
        }
      }
      wclrtoeol(stdscr);
      refresh();
    }
    LB[sp]=0;
    stdscr=oscr;
    return lbstr(0);
  }
  function* getuchar(){
    var c=yield* readchar();
    if(islowerc(c))c-=32;
    waddch(Msgwin,String.fromCharCode(c));
    return c;
  }
  function* number(lo,hi,prompt){
    var sum,p,i;
    for(;;){
      msg(prompt);
      p=yield* getline();
      if(p===''){
        msg(quiet?'Not a number':"That doesn't look like a number");
        continue;
      }
      sum=0;i=0;
      if(!isdigit(p.charAt(0)))sum=lo-1;
      else while(isdigit(p.charAt(i))){sum=(10*sum+(p.charCodeAt(i)-48))|0;++i}
      var e=p.charAt(i);
      if(e!==' '&&e!=='\t'&&e!=='')sum=lo-1;
      if(sum>=lo&&sum<=hi)return sum;
      if(sum===lo-1)msg("that doesn't look like a number, try again --> ");
      else msg(sum+' is not between '+lo+' and '+hi+' inclusive, try again --> ');
    }
  }
  /* incard: the C cuts the line into words in place, and goes on past the end of the line into whatever an
     older, longer line left in the buffer; a short answer can pick up a word from there */
  function* incard(crd){
    var rnk=EMPTY,sut=EMPTY,retval=false,i,p=0,p1=0;
    yield* getline();
    function cutword(){
      while(p1<LB.length&&LB[p1]!==32&&LB[p1]!==0)++p1;
      if(p1<LB.length)LB[p1]=0;
      p1++;
    }
    cutword();
    gotit:{
      var w=lbstr(p);
      if(w==='')break gotit;
      if(w.length===2){
        rnk=EMPTY;
        for(i=0;i<RANKS;i++)if(w.charAt(0)===rankchar[i]){rnk=i;break}
        if(rnk===EMPTY)break gotit;
        sut=EMPTY;
        for(i=0;i<SUITS;i++)if(w.charAt(1)===suitchar[i]){sut=i;break}
        if(sut!==EMPTY)retval=true;
        break gotit;
      }
      rnk=EMPTY;
      for(i=0;i<RANKS;i++)if(w===rankname[i]||w===rankchar[i]){rnk=i;break}
      if(rnk===EMPTY)break gotit;
      p=p1;
      cutword();
      w=lbstr(p);
      if(w==='')break gotit;
      if(w==='OF'){
        p=p1;
        cutword();
        w=lbstr(p);
        if(w==='')break gotit;
      }
      sut=EMPTY;
      for(i=0;i<SUITS;i++)if(w===suitname[i]||w===suitchar[i]){sut=i;break}
      if(sut!==EMPTY)retval=true;
    }
    crd.rank=rnk;
    crd.suit=sut;
    return retval;
  }
  function* infrom(hand,n,prompt){
    var i,j,crd=Card();
    for(;;){
      msg(prompt);
      if(yield* incard(crd)){
        if(!isone(crd,hand,n))msg("That's not in your hand");
        else{
          for(i=0;i<n;i++)if(hand[i].rank===crd.rank&&hand[i].suit===crd.suit)break;
          return i;
        }
      }
      else if(crd.rank!==EMPTY){
        for(i=0;i<n;i++)if(hand[i].rank===crd.rank)break;
        if(i>=n)msg('No such rank in your hand');
        else{
          for(j=i+1;j<n;j++)if(hand[j].rank===crd.rank)break;
          if(j<n)msg('Ambiguous rank');
          else return i;
        }
      }
      else msg('Sorry, I missed that');
    }
  }
  function msgcard(c){
    if(c.rank===EMPTY||c.suit===EMPTY)return false;
    addmsg(rankname[c.rank]);
    addmsg(' of ');
    addmsg(suitname[c.suit]);
    return true;
  }
  function prcard(win,y,x,c,blnk){
    if(c.rank===EMPTY)return;
    mvwaddstr(win,y+0,x,'+-----+');
    mvwaddstr(win,y+1,x,'|     |');
    mvwaddstr(win,y+2,x,'|     |');
    mvwaddstr(win,y+3,x,'|     |');
    mvwaddstr(win,y+4,x,'+-----+');
    if(!blnk){
      mvwaddch(win,y+1,x+1,rankchar[c.rank]);
      waddch(win,suitchar[c.suit]);
      mvwaddch(win,y+3,x+4,rankchar[c.rank]);
      waddch(win,suitchar[c.suit]);
    }
  }
  function prhand(h,n,win,blnk){
    werase(win);
    for(var i=0;i<n;i++)prcard(win,i*2,i,h[i],blnk);
    wrefresh(win);
  }
  /* ---- scoring on the board ---- */
  function prpeg(score,peg,myturn){
    var y=!myturn?SCORE_Y+2:SCORE_Y+5,x;
    if(score<=0||score>=glimit){
      if(peg==='.')peg=' ';
      if(score===0)x=SCORE_X+2;
      else{x=SCORE_X+2;y++}
    }
    else{
      x=(score-1)%30;
      if(score>90||(score>30&&score<=60)){y++;x=29-x}
      x+=Math.trunc(x/5);
      x+=SCORE_X+3;
    }
    mvaddch(y,x,peg);
    if(wmove(stdscr,SCORE_Y+(myturn?7:1),SCORE_X+10))waddstr(stdscr,String(score).padStart(3));
  }
  function chkscr(myturn,inc){
    var m=myturn?1:0;
    if(inc!==0){
      prpeg(Lastscore[m],'.',myturn);
      Lastscore[m]=myturn?cscore:pscore;
      if(myturn)cscore+=inc;else pscore+=inc;
      prpeg(myturn?cscore:pscore,PEG,myturn);
      refresh();
    }
    return (myturn?cscore:pscore)>=glimit;
  }
  function* plyrhand(hand,s){
    var i,j,win;
    prhand(hand,CINHAND,Playwin,false);
    var prompt='Your '+s+' scores ';
    i=scorehand(hand,turnover,CINHAND,s==='crib',explain);
    if((j=yield* number(0,29,prompt))===19)j=0;
    if(i!==j){
      if(i<j){
        win=chkscr(false,i);
        msg("It's really only "+i+' points; I get 2');
        if(!win)win=chkscr(true,2);
      }
      else{
        win=chkscr(false,j);
        msg('You should have taken '+i+', not '+j+'!');
      }
      if(explain)msg('Explanation: '+expl);
      yield* do_wait();
    }
    else win=chkscr(false,i);
    return win;
  }
  function comphand(h,s){
    var j=scorehand(h,turnover,CINHAND,s==='crib',false);
    prhand(h,CINHAND,Compwin,false);
    msg('My '+s+' scores '+(j===0?19:j));
    return chkscr(true,j);
  }
  /* ---- the game ---- */
  function gamescore(){
    if(pgames||cgames){
      if(wmove(stdscr,SCORE_Y+1,SCORE_X+28))waddstr(stdscr,'Games: '+String(pgames).padStart(3));
      if(wmove(stdscr,SCORE_Y+7,SCORE_X+28))waddstr(stdscr,'Games: '+String(cgames).padStart(3));
    }
    Lastscore[0]=-1;
    Lastscore[1]=-1;
  }
  function makeboard(){
    mvaddstr(SCORE_Y+0,SCORE_X,'+---------------------------------------+');
    mvaddstr(SCORE_Y+1,SCORE_X,'|  Score:   0     YOU                   |');
    mvaddstr(SCORE_Y+2,SCORE_X,'| *.....:.....:.....:.....:.....:.....  |');
    mvaddstr(SCORE_Y+3,SCORE_X,'| *.....:.....:.....:.....:.....:.....  |');
    mvaddstr(SCORE_Y+4,SCORE_X,'|                                       |');
    mvaddstr(SCORE_Y+5,SCORE_X,'| *.....:.....:.....:.....:.....:.....  |');
    mvaddstr(SCORE_Y+6,SCORE_X,'| *.....:.....:.....:.....:.....:.....  |');
    mvaddstr(SCORE_Y+7,SCORE_X,'|  Score:   0      ME                   |');
    mvaddstr(SCORE_Y+8,SCORE_X,'+---------------------------------------+');
    gamescore();
  }
  function deal(mycrib){
    var j=0;
    for(var i=0;i<FULLHAND;i++){
      if(mycrib){phand[i]=cp(deck[j++]);chand[i]=cp(deck[j++])}
      else{chand[i]=cp(deck[j++]);phand[i]=cp(deck[j++])}
    }
    return j;
  }
  function prcrib(mycrib,blnk){
    var cardx=mycrib?CRIB_X:0;
    mvaddstr(CRIB_Y,cardx+1,'CRIB');
    prcard(stdscr,CRIB_Y+1,cardx,turnover,blnk);
    cardx=mycrib?0:CRIB_X;
    for(var y=CRIB_Y;y<=CRIB_Y+5;y++)mvaddstr(y,cardx,'       ');
  }
  function* discard(mycrib){
    var prompt=quiet?'Discard --> ':'Discard a card --> ',crd;
    prcrib(mycrib,true);
    cdiscard(mycrib);
    crd=cp(phand[yield* infrom(phand,FULLHAND,prompt)]);
    remove(crd,phand,FULLHAND);
    prhand(phand,FULLHAND,Playwin,false);
    crib[0]=crd;
    crd=cp(phand[yield* infrom(phand,FULLHAND-1,prompt)]);
    remove(crd,phand,FULLHAND-1);
    prhand(phand,FULLHAND,Playwin,false);
    crib[1]=crd;
    crib[2]=cp(chand[4]);
    crib[3]=cp(chand[5]);
    chand[4].rank=chand[4].suit=chand[5].rank=chand[5].suit=EMPTY;
  }
  function* cut(mycrib,pos){
    var i,win=false;
    if(mycrib){
      if(!rflag){
        msg(quiet?'Cut the deck? ':'How many cards down do you wish to cut the deck? ');
        yield* getline();
      }
      i=(rand()>>4)%(CARDS-pos);
      turnover=cp(deck[i+pos]);
      addmsg(quiet?'You cut ':'You cut the ');
      msgcard(turnover);
      endmsg();
      if(turnover.rank===JACK){
        msg('I get two for his heels');
        win=chkscr(true,2);
      }
    }
    else{
      i=(rand()>>4)%(CARDS-pos)+pos;
      turnover=cp(deck[i]);
      addmsg(quiet?'I cut ':'I cut the ');
      msgcard(turnover);
      endmsg();
      if(turnover.rank===JACK){
        msg('You get two for his heels');
        win=chkscr(false,2);
      }
    }
    makeknown([turnover],1);
    prcrib(mycrib,false);
    return win;
  }
  function prtable(score){
    prhand(Table,Tcnt,Tablewin,false);
    if(wmove(Tablewin,(Tcnt+2)*2,Tcnt+1))waddstr(Tablewin,String(score).padStart(2));
    wrefresh(Tablewin);
  }
  function* peg(mycrib){
    var ch=cards(CINHAND),ph=cards(CINHAND),crd,i,j,k,l,cnum=CINHAND,pnum=CINHAND,sum=0,myturn,mego=false,ugo=false,last=true,played=false;
    for(i=0;i<CINHAND;i++){ch[i]=cp(chand[i]);ph[i]=cp(phand[i])}
    Tcnt=0;
    myturn=!mycrib;
    for(;;){
      last=true;
      prhand(ph,pnum,Playwin,false);
      prhand(ch,cnum,Compwin,true);
      prtable(sum);
      if(myturn){
        if(!anymove(ch,cnum,sum)){
          if(!mego&&cnum){msg('GO');mego=true}
          if(anymove(ph,pnum,sum))myturn=!myturn;
          else{
            msg(quiet?'You get one':'You get one point');
            if(chkscr(false,1))return true;
            sum=0;mego=ugo=false;Tcnt=0;
          }
        }
        else{
          played=true;
          j=-1;k=0;
          for(i=0;i<cnum;i++){
            l=pegscore(ch[i],Table,Tcnt,sum);
            if(l>k){k=l;j=i}
          }
          if(j<0)j=cchose(ch,cnum,sum);
          crd=cp(ch[j]);
          remove(crd,ch,cnum--);
          sum+=VAL(crd.rank);
          Table[Tcnt++]=cp(crd);
          if(k>0){
            addmsg(quiet?'I get '+k+' playing ':'I get '+k+' points playing ');
            msgcard(crd);
            endmsg();
            if(chkscr(true,k))return true;
          }
          myturn=!myturn;
        }
      }
      else{
        if(!anymove(ph,pnum,sum)){
          if(!ugo&&pnum){msg('You have a GO');ugo=true}
          if(anymove(ch,cnum,sum))myturn=!myturn;
          else{
            msg(quiet?'I get one':'I get one point');
            yield* do_wait();
            if(chkscr(true,1))return true;
            sum=0;mego=ugo=false;Tcnt=0;
          }
        }
        else{
          played=false;
          if(pnum===1){
            crd=cp(ph[0]);
            msg('You play your last card');
          }
          else
            for(;;){
              prhand(ph,pnum,Playwin,false);
              crd=cp(ph[yield* infrom(ph,pnum,'Your play: ')]);
              if(sum+VAL(crd.rank)<=31)break;
              msg('Total > 31 -- try again');
            }
          makeknown([crd],1);
          remove(crd,ph,pnum--);
          i=pegscore(crd,Table,Tcnt,sum);
          sum+=VAL(crd.rank);
          Table[Tcnt++]=cp(crd);
          if(i>0){
            msg(quiet?'You got '+i:'You got '+i+' points');
            if(chkscr(false,i))return true;
          }
          myturn=!myturn;
        }
      }
      if(sum>=31){
        if(!myturn)yield* do_wait();
        sum=0;mego=ugo=false;Tcnt=0;
        last=false;
      }
      if(!pnum&&!cnum)break;
    }
    prhand(ph,pnum,Playwin,false);
    prhand(ch,cnum,Compwin,true);
    prtable(sum);
    if(last){
      if(played){
        msg(quiet?'I get one for last':'I get one point for last');
        yield* do_wait();
        if(chkscr(true,1))return true;
      }
      else{
        msg(quiet?'You get one for last':'You get one point for last');
        if(chkscr(false,1))return true;
      }
    }
    return false;
  }
  function* score(mycrib){
    sorthand(crib,CINHAND);
    if(mycrib){
      if(yield* plyrhand(phand,'hand'))return true;
      if(comphand(chand,'hand'))return true;
      yield* do_wait();
      if(comphand(crib,'crib'))return true;
    }
    else{
      if(comphand(chand,'hand'))return true;
      if(yield* plyrhand(phand,'hand'))return true;
      if(yield* plyrhand(crib,'crib'))return true;
    }
    return false;
  }
  function* playhand(mycrib){
    var deckpos;
    werase(Compwin);
    knownum=0;
    deckpos=deal(mycrib);
    sorthand(chand,FULLHAND);
    sorthand(phand,FULLHAND);
    makeknown(chand,FULLHAND);
    prhand(phand,FULLHAND,Playwin,false);
    yield* discard(mycrib);
    if(yield* cut(mycrib,deckpos))return true;
    if(yield* peg(mycrib))return true;
    werase(Tablewin);
    wrefresh(Tablewin);
    if(yield* score(mycrib))return true;
    return false;
  }
  function* game(){
    var i,j,flag,compcrib=false;
    makeboard();
    refresh();
    makedeck(deck);
    shuffle(deck);
    if(gamecount===0){
      flag=true;
      do{
        if(!rflag){
          msg(quiet?'Cut for crib? ':'Cut to see whose crib it is -- low card wins? ');
          yield* getline();
        }
        i=(rand()>>4)%CARDS;
        do{j=(rand()>>4)%CARDS}while(j===i);
        addmsg(quiet?'You cut ':'You cut the ');
        msgcard(deck[i]);
        endmsg();
        addmsg(quiet?'I cut ':'I cut the ');
        msgcard(deck[j]);
        endmsg();
        flag=deck[i].rank===deck[j].rank;
        if(flag){
          msg(quiet?'We tied...':'We tied and have to try again...');
          shuffle(deck);
        }
        else compcrib=deck[i].rank>deck[j].rank;
      }while(flag);
    }
    else{
      werase(Tablewin);
      wrefresh(Tablewin);
      werase(Compwin);
      wrefresh(Compwin);
      msg('Loser ('+(iwon?'you':'me')+') gets first crib');
      compcrib=!iwon;
    }
    pscore=cscore=0;
    flag=true;
    do{
      shuffle(deck);
      flag=!(yield* playhand(compcrib));
      compcrib=!compcrib;
    }while(flag);
    ++gamecount;
    if(cscore<pscore){
      if(glimit-cscore>60){msg('YOU DOUBLE SKUNKED ME!');pgames+=4}
      else if(glimit-cscore>30){msg('YOU SKUNKED ME!');pgames+=2}
      else{msg('YOU WON!');++pgames}
      iwon=false;
    }
    else{
      if(glimit-pscore>60){msg('I DOUBLE SKUNKED YOU!');cgames+=4}
      else if(glimit-pscore>30){msg('I SKUNKED YOU!');cgames+=2}
      else{msg('I WON!');++cgames}
      iwon=true;
    }
    gamescore();
  }
  /* "ul crib.instr | more -f": a page at a time, then the game again */
  function* instructions(){
    var at=0,L=CRIBINSTR.map(glass),rows=S.rows>=2?Math.min(S.rows,LINES)-1:1,cols=Math.min(S.cols,COLS);
    pager=true;
    for(;;){
      var page=L.slice(at,at+rows).map(function(x){return x.slice(0,cols)});
      at+=rows;
      page.push('--More--('+Math.min(100,Math.trunc(100*at/L.length))+'%)');
      pagerdraw=page;
      S.draw(page,page.length-1,page[page.length-1].length);
      var c=yield;
      if(c===113||c===81||at>=L.length)break;
    }
    pager=false;
  }
  function* main(){
    initscr();
    Playwin=mkwin(PLAY_Y,PLAY_X,0,0,stdscr);
    Tablewin=mkwin(TABLE_Y,TABLE_X,0,PLAY_X,stdscr);
    Compwin=mkwin(COMP_Y,COMP_X,0,TABLE_X+PLAY_X,stdscr);
    Msgwin=mkwin(MSG_Y,MSG_X,Y_MSG_START,SCORE_X+1,stdscr);
    Playwin.leave=Tablewin.leave=Compwin.leave=true;
    stdscr.clear=false;
    if(!quiet){
      msg('Do you need instructions for cribbage? ');
      if((yield* getuchar())===89){
        yield* instructions();
        wclear(stdscr);
        refresh();
        msg('For the rules of this program, do "man cribbage"');
      }
    }
    var playing=true;
    do{
      var w=Msgwin,sx=w.curx;
      for(var y=w.cury;y<w.maxy;y++){
        var LL=w.lines[y+w.j],lo=-1,hi=-1;
        for(var x=sx;x<w.maxx;x++)if(LL[x+w.k]!==' '){hi=x;if(lo<0)lo=x;LL[x+w.k]=' '}
        if(lo>=0)touchline(w,y,lo,hi);
        sx=0;
      }
      msg(quiet?'L or S? ':'Long (to 121) or Short (to 61)? ');
      if(glimit===SGAME)glimit=(yield* getuchar())===76?LGAME:SGAME;
      else glimit=(yield* getuchar())===83?SGAME:LGAME;
      yield* game();
      msg('Another game? ');
      playing=(yield* getuchar())===89;
    }while(playing);
  }
  var run=main(),over=false,pager=false,pagerdraw=null;
  function step(v){
    var r;
    try{r=run.next(v)}
    catch(e){
      if(e!==EXIT)throw e;
      r={done:true};
    }
    if(r.done){over=true;S.close();finish_();return}
    if(!pager)view(S);
  }
  var api={
    feed:function(k){
      if(over)return;
      if(k==='C-c'){over=true;S.close();finish_();return}
      var c=k==='Enter'?13:k==='Backspace'?8:k==='Tab'?9:k==='Escape'?27:k.length===1?k.charCodeAt(0):/^C-[a-z]$/.test(k)?k.charCodeAt(2)-96:-1;
      if(c>=0)step(c);
    },
    draw:function(){if(pager&&pagerdraw)S.draw(pagerdraw,pagerdraw.length-1,0);else if(curscr)view(S)}
  };
  step();
  return api;
  },{tty:'cribbage',fit:[80,24]});
}});
})(window.Phosphor);
