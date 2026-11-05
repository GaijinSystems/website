/* PHOSPHOR-9 terminal: machine "bsd-1987", doctor. Translated to JavaScript for this terminal from 4.3BSD's
   games/doctor/doctor.l, "@(#)doctor.l 4.3 (Berkeley) 7/26/83", a Franz Lisp program carrying no notice. Net/2's
   copy of almost the same file, doctor.l 4.5 (Berkeley) 5/13/91, carries this one:

; Copyright (c) 1991 The Regents of the University of California.
; All rights reserved.
;
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. All advertising materials mentioning features or use of this software
 *    must display the following acknowledgement:
 *	This product includes software developed by the University of
 *	California, Berkeley and its contributors.
 * 4. Neither the name of the University nor the names of its contributors
 *    may be used to endorse or promote products derived from this software
 *    without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE REGENTS AND CONTRIBUTORS ``AS IS'' AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED.  IN NO EVENT SHALL THE REGENTS OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS
 * OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
 * OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
 * SUCH DAMAGE.

   Differences: the bill is not mailed, since mail here is the site's own; the words about it still come. If a key's
   rules run out with nothing matched, the Lisp loops for ever: here it says nothing and waits for what you say next.
   ^D is ignored, where the Lisp puts nil in the line. At the end of a pipe it goes on to the keyboard.
 */
(function(P){
'use strict';
var DATA={
"alike":{"priority":10,"rules":["dit"]},
"always":{"priority":1,"rules":[[[0],[null],["can","you","think","of","a","specific","example"],["when"],["what","incident","are","you","thinking","of"],["really,","always"],["what","if","this","never","happened"]]]},
"am":{"priority":0,"translation":"are","rules":[[[0,"are","you",0],[null],["do","you","believe","you","are",4],["would","you","want","to","be",4],["you","wish","i","would","tell","you","you","are",4],["what","would","it","mean","if","you","were",4],"how"],[[0],[null],["why","do","you","say","'am'"],["i","don't","understand","that"]]]},
"are":{"priority":0,"rules":[[[0,"there","are",0,"you",0],[null],["pre",[1,2,3,4],"are"]],[[0,"there","are",1,0],[null],["what","makes","you","think",2,3,4,5],["do","you","usually","consider",4,5],["do","you","wish",2,"were",4,5]],[[0,"there","are",0],[null],"newkey"],[[0,"are","i",0],[null],["why","are","you","interested","in","whether","i","am",4,"or","not"],["would","you","prefer","if","i","weren't",4],["perhaps","i","am",4,"in","your","fantasies"],["do","you","sometimes","think","i","am",4],"how"],[["are",0],[null],"how"],[[0,"are",0],[null],["did","you","think","they","might","not","be",3],["would","you","like","it","if","they","were","not",3],["what","if","they","were","not",3],["possibly","they","are",3]]]},
"ask":{"priority":0,"rules":[[[0,"you","ask",0],[null],"how"],[[0,"you",1,"asking",0],[null],"how"],[[0,"i",0],[null],"you"],[[0],[null],"newkey"]]},
"bag":{"priority":5,"rules":[[[0,["bite","bites"],"the","bag"],[null],["do","you","say",1,2,3,4,"for","some","special","reason"],["what","might",1,"have","to","do","with","your","problem"],["do","you","often","say","'",2,3,4,"'"],["perhaps","you","feel","that","you","bite",3,4]],[[0],["^il"],["why","the","interest","in","bags"],["please","be","more","specific"],["you","aren't","pulling","my","leg","are","you"],"newkey"]]},
"barf":{"priority":0,"rules":["fuck"]},
"because":{"priority":0,"rules":[[[0],[null],["is","that","the","real","reason"],["don't","any","other","reasons","come","to","mind"],["does","that","reason","seem","to","explain","anything","else"],["what","other","reasons","might","there","be"],["you're","not","concealing","anything","from","me,","are","you"]]]},
"believe":{"belief":"t"},
"bet":{"belief":"t"},
"brother":{"family":"t"},
"can":{"priority":0,"rules":[[[0,"can","i",0],[null],["you","believe","i","can",4,"don't","you"],"how",["you","want","me","to","be","able","to",4],["perhaps","you","would","like","to","be","able","to",4,"yourself"]],[[0,"can","you",0],[null],["whether","or","not","you","can",4,"depends","on","you","more","than","on","me"],["do","you","want","to","be","able","to",4],["perhaps","you","don't","want","to",4],"how"],[[0],[null],"how","newkey"]]},
"cant":{"translation":"can't"},
"certainly":{"priority":0,"rules":["yes"]},
"children":{"family":"t"},
"computer":{"priority":50,"rules":[[[0],[null],["do","computers","worry","you"],["why","do","you","mention","computers"],["what","do","you","think","machines","have","to","do","with","your","problem"],["don't","you","think","computers","can","help","people"],["what","about","machines","worries","you"],["what","do","you","think","about","machines"]]]},
"computers":{"priority":50,"rules":["computer"]},
"crap":{"priority":6,"rules":["fuck"]},
"cunt":{"priority":55,"rules":["fuck"]},
"dad":{"translation":"father","family":"t"},
"daddy":{"translation":"father","family":"t"},
"damn":{"priority":0,"rules":["fuck"]},
"deutsch":{"priority":0,"rules":[[[0],[null],["i","am","sorry,","i","speak","only","english"]]]},
"dit":{"rules":[[[0],[null],["in","what","way"],["what","resemblance","do","you","see"],["what","does","that","similarity","suggest","to","you"],["what","other","connections","do","you","see"],["what","do","you","suppose","that","resemblance","means"],["what","is","the","connection,","do","you","suppose"],["could","there","really","be","some","connection"],["how"]]]},
"dont":{"translation":"don't"},
"dream":{"priority":3,"rules":[[[0],[null],["what","does","that","dream","suggest","to","you"],["do","you","dream","often"],["what","persons","appear","in","your","dreams"],["don't","you","believe","that","dream","has","something","to","do","with","your","problem"],["do","you","ever","wish","you","could","flee","from","reality"],"newkey"]]},
"dreamed":{"translation":"dreamt","priority":4,"rules":["dreamt"]},
"dreams":{"translation":"dream","priority":3,"rules":["dream"]},
"dreamt":{"priority":4,"rules":[[[0,"you","dreamt",0],[null],["really",4],["have","you","ever","fantasied",4,"while","you","were","awake"],["have","you","dreamt",4,"before"],"dream","newkey"],[[0],[null],"dream","newkey"]]},
"espanol":{"priority":0,"rules":["deutsch"]},
"everybody":{"priority":2,"rules":["everyone"]},
"everyone":{"priority":2,"rules":[[[0,["everyone","everybody","nobody","noone"],0],[null],["really,",2],["surely","not",2],["can","you","think","of","anyone","in","particular"],["who,","for","example"],["you","are","thinking","of","a","very","special","person"],["who,","may","i","ask"],["someone","special","perhaps"],["you","have","a","particular","person","in","mind,","don't","you"],["who","do","you","think","you're","talking","about"],["i","suspect","you're","exaggerating","a","little"]]]},
"father":{"family":"t"},
"feel":{"belief":"t"},
"francais":{"priority":0,"rules":["deutsch"]},
"fuck":{"priority":55,"rules":[[[0],[null],["are","such","obscenities","frequently","on","your","mind"],["you","are","being","a","bit","childish"],["really","now"],["dear","me"],["i","really","shouldn't","tolerate","such","language"],"newkey"]]},
"hell":{"priority":0,"rules":["fuck"]},
"hello":{"priority":0,"rules":[[[0],[null],["how","do","you","do.","please","state","your","problem"]]]},
"how":{"priority":0,"rules":[[[0],[null],["why","do","you","ask"],["does","that","question","interest","you"],["what","is","it","you","really","want","to","know"],["are","such","questions","much","on","your","mind"],["what","answer","would","please","you","most"],["what","do","you","think"],["what","comes","to","your","mind","when","you","ask","that"],["have","you","asked","such","questions","before"],["have","you","asked","anyone","else"]]]},
"i":{"priority":0,"translation":"you","rules":[[[0,"you",["want","need"],0],[null],["what","would","it","mean","to","you","if","you","got",4],["why","do","you","want",4],["suppose","you","got",4,"soon"],["what","if","you","never","got",4],["what","would","getting",4,"mean","to","you"],["what","does","wanting",4,"have","to","do","with","this","discussion"],["you","really","want",4],["i","suspect","you","really","don't","want",4]],[[0,"you","are",0,["sad","unhappy","depressed","sick"],0],[null],["i","am","sorry","to","hear","you","are",5],["do","you","think","coming","here","will","help","you","not","to","be",5],["i'm","sure","its","not","pleasant","to","be",5],["can","you","explain","what","made","you",5],["please","go","on"]],[[0,"you","are",0,["happy","elated","glad","better"],0],[null],["how","have","i","helped","you","to","be",5],["has","your","treatment","made","you",5],["what","makes","you",5,"just","now"],["can","you","explain","why","you","are","suddenly",5],["are","you","sure"],["what","do","you","mean","by",5]],[[0,"you","was",0],[null],"was"],[[0,"you",[null,"belief"],"you",0],[null],["do","you","really","think","so"],["but","you","are","not","sure","you",5],["do","you","really","doubt","you",5]],[[0,"you",0,[null,"belief"],0,"i",0],[null],"you"],[[0,"you","are",0],[null],["is","it","because","you","are",4,"that","you","came","to","me"],["how","long","have","you","been",4],["do","you","believe","it","normal","to","be",4],["do","you","enjoy","being",4]],[[0,"you",["can't","cannot"],0],[null],["how","do","you","know","you","can't",4],["have","you","tried"],["perhaps","you","could",4,"now"],["do","you","really","want","to","be","able","to",4]],[[0,"you","don't",0],[null],["don't","you","really",4],["why","don't","you",4],["do","you","wish","to","be","able","to",4],["does","that","trouble","you"]],[[0,"you","feel",0],[null],["tell","me","more","about","such","feelings"],["do","you","often","feel",4],["do","you","enjoy","feeling",4],["of","what","does","feeling",4,"remind","you"]],[[0,"you",0,"i",0],[null],["perhaps","in","your","fantasy","we",3,"each","other"],["do","you","wish","to",3,"me"],["you","seem","to","need","to",3,"me"],["do","you",3,"anyone","else"]],[[0],[null],["you","say",1],["can","you","elaborate","on","that"],["do","you","say",1,"for","some","special","reason"],["that's","quite","interesting"]]]},
"i'm":{"priority":0,"translation":"you're","rules":[[[0,"you're",0],[null],["pre",["you","are",3],"i"]]]},
"if":{"priority":3,"rules":[[[0,"if",0,"had",0],[null],["pre",[1,2,3,"might","have",5],"if"]],[[0,"if",0],[null],["do","you","think","its","likely","that",3],["do","you","wish","that",3],["what","do","you","think","about",3],["really","if",3]]]},
"is":{"priority":0,"rules":[[[1,0,"is",1,0],[null],["suppose",1,2,"were","not",4,5],["perhaps",1,2,"really","is",4,5],["tell","me","more","about",1,2]],[[0],[null],"newkey"]]},
"italiano":{"priority":0,"rules":["deutsch"]},
"like":{"priority":10,"rules":[[[0,["am","is","are","was"],0,"like",0],[null],"dit"],[[0],[null],"newkey"]]},
"machine":{"priority":50,"rules":["computer"]},
"machines":{"priority":50,"rules":["computer"]},
"maybe":{"priority":0,"rules":["perhaps"]},
"me":{"translation":"you"},
"mom":{"translation":"mother","family":"t"},
"mommy":{"translation":"mother","family":"t"},
"mother":{"family":"t"},
"my":{"memr":[[[0,"your",1,0],[null],["earlier","you","said","your",3,4],["but","your",3,4],["does","that","have","anything","to","do","with","your","statement","about",3,4]]],"priority":2,"translation":"your","rules":[[[0,"your",0,[null,"family"],0],[null],["tell","me","more","about","your","family"],["who","else","in","your","family",5],["your",4],["what","else","comes","to","mind","when","you","think","of","your",4]],[[0,"your",1,0],[null],["your",3,4],["why","do","you","say","your",3,4],["does","that","suggest","anything","else","which","belongs","to","you"],["is","it","important","to","you","that","your",3,4]],[[0],[null],"newkey"]]},
"myself":{"translation":"yourself"},
"name":{"priority":15,"rules":[[[0],[null],["i","am","not","interested","in","names"],["i've","told","you","before","i","don't","care","about","names","-","please","continue"]]]},
"no":{"priority":0,"rules":[[["no"],[null],"xxyyzz",["pre",["x","no"],"no"]],[[0],[null],["are","you","saying","'no'","just","to","be","negative"],["you","are","being","a","bit","negative"],["why","not"],["why","'no'"],"newkey"]]},
"nobody":{"priority":2,"rules":["everyone"]},
"noone":{"priority":2,"rules":["everyone"]},
"perhaps":{"priority":0,"rules":[[[0],[null],["you","don't","seem","quite","certain"],["why","the","uncertain","tone"],["can't","you","be","more","positive"],["you","aren't","sure"],["don't","you","know"]]]},
"piss":{"priority":55,"rules":["fuck"]},
"problem":{"priority":5,"rules":[[[0,["is","are"],"your",["problem","problems"],0],[null],[1,2,"your",4],["are","you","sure",1,2,"your",4],["perhaps",1,2,"not","your","real",4],["you","think","you","have","problems"],["do","you","often","think","about",1]],[[0,"your",["problem","problems"],["is","are"],0],[null],["your",2,3,4],["are","you","sure","your2",3,4],["perhaps","your","real",2,3,"not",4],["you","think","you","have","problems"]],[[0],[null],["please","continue,","this","may","be","interesting"],["have","you","any","other","problems","you","wish","to","discuss"],["perhaps","you'd","rather","change","the","subject"],["you","seem","a","bit","uneasy"],"newkey"]],"memr":[[[0,"is","your","problem",0],[null],["earlier","you","mentioned",1],["let's","talk","further","about",1],["tell","me","more","about",1],["you","haven't","mentioned",1,"for","a","while"]]]},
"problems":{"priority":5,"rules":["problem"],"memr":[[[0,"are","you","problems"],[null],["earlier","you","mentioned",1],["let's","talk","about",1],["tell","me","more","about",1],["you","haven't","mentioned",1,"for","a","while"]]]},
"remember":{"priority":5,"rules":[[[0,"you","remember",0],[null],["do","you","often","think","of",4],["does","thinking","of",4,"bring","anything","else","to","mind"],["what","else","do","you","remember"],["why","do","you","remember",4,"just","now"],["what","in","the","present","situation","reminds","you","of",4],["what","is","the","connection","between","me","and",4]],[[0,"do","i","remember",0],[null],["did","you","think","i","would","forget",5],["why","do","you","think","i","should","recall",5,"now"],["what","about",5],"what",["you","mentioned",5]],[[0],[null],"newkey"]]},
"same":{"priority":10,"rules":["dit"]},
"shit":{"priority":55,"rules":["fuck"]},
"sister":{"family":"t"},
"sorry":{"priority":0,"rules":[[[0],[null],["please","don't","apologize"],["apologies","are","not","necessary"],["what","feelings","do","you","have","when","you","apologize"],["i've","told","you","that","apologies","are","not","required"],["apologies","are","not","necessary,","please","go","on"]]]},
"suck":{"priority":5,"rules":["fuck"]},
"sucks":{"translation":"suck"},
"svenska":{"priority":0,"rules":["deutsch"]},
"think":{"belief":"t"},
"was":{"priority":2,"rules":[[[0,"was","you",0],[null],["what","if","you","were",4],["do","you","think","you","were",4],["were","you",4],["what","would","it","mean","if","you","were",4],["what","does","'",4,"'","suggest","to","you"],"how"],[[0,"you","was",0],[null],["were","you","really"],["why","do","you","tell","me","you","were",4,"now"],["perhaps","i","already","knew","you","were",4]],[[0,"was","i",0],[null],["would","you","like","to","believe","i","was",4],["what","suggests","that","i","was",4],["what","do","you","think"],["perhaps","i","was",4],["what","if","i","had","been",4]],[[0],[null],"newkey"]]},
"we":{"translation":"you","priority":0,"rules":["i"]},
"were":{"priority":0,"translation":"was","rules":["was"]},
"what":{"priority":0,"rules":[[["what","where"],[null],"how"],[[0,["what","where"],0],[null],["tell","me","about",2,3],[2,3],["do","you","want","me","to","tell","you",2,3],["really"],["i","see"],"newkey"]]},
"where":{"priority":0,"rules":["how"]},
"why":{"priority":0,"rules":[[[0,"why","don't","i",0],[null],["do","you","believe","i","don't",5],["perhaps","i","will",5,"in","good","time"],["should","you",5,"yourself"],["you","want","me","to",5],"how"],[[0,"why","can't","you",0],[null],["do","you","think","you","should","be","able","to",5],["do","you","want","to","be","able","to",5],["do","you","believe","this","will","help","you","to",5],["have","you","any","idea","why","you","can't",5],"how"],[[0],[null],["why","indeed"],["why","'why'"],["why","not"],"how","newkey"]]},
"wife":{"family":"t"},
"wish":{"belief":"t"},
"wont":{"translation":"won't"},
"xxyyzz":{"priority":0,"rules":[[[0],[null],["youre","being","somewhat","short","with","me"],["you","dont","seem","very","talkative","today"],["perhaps","youd","rather","talk","about","something","else"],["are","you","using","monosyllables","for","some","reason"],"newkey"]]},
"yes":{"priority":0,"rules":[[["yes"],[null],"xxyyzz",["pre",["x","yes"],"yes"]],[[0],[null],["you","seem","quite","positive"],["you","are","sure"],["i","see"],["i","understand"],"newkey"]]},
"you":{"priority":0,"translation":"i","rules":[[[0,"i","remind","you","of",0],[null],"dit"],[[0,"i","are",0,"you",0],[null],"newkey"],[[0,"i",0,"are",0],[null],["what","makes","you","think","i","am",5],["does","it","please","you","to","believe","i","am",5],["perhaps","you","would","like","to","be",5],["do","you","sometimes","wish","you","were",5]],[[0,"i",0,"you"],[null],["why","do","you","think","i",3,"you"],["you","like","to","think","i",3,"you","-","don't","you"],["what","makes","you","think","i",3,"you"],["really,","i",3,"you"],["do","you","wish","to","believe","i",3,"you"],["suppose","i","did",3,"you","-","what","would","that","mean"],["does","someone","else","believe","i",3,"you"]],[[0,"i",1,0],[null],["we","were","discussing","you","-","not","me"],["oh,","i",3,4],["is","this","really","relevant","to","your","problem"],["perhaps","i","do",3,4],["are","you","glad","to","know","i",3,4],["do","you",3,4],["what","are","your","feelings","now"]],[[0],[null],"newkey"]]},
"you're":{"priority":0,"translation":"i'm","rules":[[[0,"i'm",0],[null],["pre",["i","are",3],"you"]]]},
"your":{"priority":0,"translation":"my","rules":[[[0,"my",0],[null],["why","are","you","concerned","over","my",3],["what","about","your","own",3],["are","you","worried","about","someone","elses",3],["really,","my",3]]]},
"yourself":{"translation":"myself"},
"zzyyxx":{"rules":[[[0],[null],"newkey"]]}
};
var EXIT={},TERMINALWIDTH=58; /* (setq terminalwidth 72), read in base 8 as liszt -m does: the shipped binary holds 58 */
function isbreak(c){return c===' '||c==='\n'||c==='\t'||c==='\u007f'||ispunct(c)}
function ispunct(c){return c==='.'||c===','||c==='('||c===')'||c==='!'||c==='?'||c===':'||c===';'}
function atom(x){return !Array.isArray(x)}
P.command({names:['doctor'],run:function(){
  var o='',pipe=P.stdin(),inline=null,at=0;
  var PROPS={},k,flipflop=0;
  var SENTENCE=[],KEYSTACK=[],RULES=[],PARSELIST=[],WORD=null,LETTER=null,FLAG=null,TERMINAL=null,LINE=[],lp=0,S=[],D=[];
  /* every run has its own copy of the rules, because the cycling of the answers is kept in them */
  function rule(r){return {d:r[0],ptr:r[1],r:r.slice(2)}}
  for(k in DATA){
    PROPS[k]=Object.assign({},DATA[k]);
    if(PROPS[k].rules)PROPS[k].rules=PROPS[k].rules.map(function(r){return atom(r)?r:rule(r)});
    if(PROPS[k].memr)PROPS[k].memr=PROPS[k].memr.map(function(r){return atom(r)?r:rule(r)});
  }
  PROPS['#lastresort']={rules:[rule([[0],[null],['i','am','not','sure','i','understand','you','fully'],['please','go','on'],['what','does','that','suggest','to','you'],['do','you','feel','strongly','about','discussing','such','things']])]};
  PROPS['#mem']={rules:[rule([[0],[null],'#lastresort'])]};
  function get(a,p){
    if(a===null||!Object.prototype.hasOwnProperty.call(PROPS,a))return null;
    var v=PROPS[a];
    return Object.prototype.hasOwnProperty.call(v,p)?v[p]:null;
  }
  function pr(s){
    o+=s;
    var i=o.lastIndexOf('\n');
    if(i>=0){P.say(o.slice(0,i).split('\n'));o=o.slice(i+1)}
  }
  function* readc(){
    for(;;){
      if(inline===null){
        var l=pipe&&pipe.length?pipe.shift():yield;
        if(l===P.INT)byebye();
        if(l===null)continue;
        inline=l;at=0;
      }
      if(at<inline.length)return inline.charAt(at++);
      inline=null;
      return '\n';
    }
  }
  function* gobble_lines_of_chars(){
    var ch,L=[];
    for(;;){
      ch=yield* readc();
      if(ch==='\n'){
        L.push(ch);
        ch=yield* readc();
        if(ch==='\n'){L.push(ch);return L}
      }
      L.push(ch);
    }
  }
  function nextch(){LETTER=lp<LINE.length?LINE[lp++]:null;return LETTER}
  function readword(){
    var w=[];
    WORD=null;
    for(;;){
      nextch();
      FLAG=LETTER===null||isbreak(LETTER)?true:null;
      if(FLAG){
        if(w.length){WORD=w.join('');if(WORD==='nil')WORD=null;return WORD}
        return null;
      }
      w.push(LETTER);
    }
  }
  function makesentence(){
    FLAG=get(WORD,'translation');
    SENTENCE.unshift(FLAG!==null?FLAG:WORD);
  }
  function setkeystack(){
    FLAG=get(WORD,'priority');
    if(FLAG!==null&&KEYSTACK.length&&FLAG>get(KEYSTACK[0],'priority'))KEYSTACK.unshift(WORD);
    else if(FLAG!==null)KEYSTACK.push(WORD);
  }
  function breakanalyze(){
    if(LETTER==='\n'){FLAG=TERMINAL;TERMINAL=true;return}
    FLAG=LETTER!==null&&ispunct(LETTER)?true:null;
    if(FLAG&&KEYSTACK.length){gobble();return}
    if(FLAG){SENTENCE=[];FLAG=null;return}
    TERMINAL=null;
  }
  function gobble(){
    do{nextch();breakanalyze()}while(!FLAG);
  }
  function* readin(){
    WORD=null;LETTER=null;FLAG=null;TERMINAL=null;
    LINE=yield* gobble_lines_of_chars();lp=0;
    do{
      if(readword()!==null){
        makesentence();
        setkeystack();
      }
      breakanalyze();
    }while(!FLAG);
    SENTENCE.reverse();
  }
  function test1(propl,x){
    for(var i=0;i<propl.length;i++)if(get(x,propl[i])!==null)return true;
    return false;
  }
  function test4(d){
    if(!S.length)return false;
    if(atom(d))return d===S[0];
    if(d[0]!==null)return d.indexOf(S[0])>=0;
    return test1(d.slice(1),S[0]);
  }
  function test2(){
    PARSELIST.unshift([S[0]]);
    S=S.slice(1);
    return true;
  }
  function test3(x,L){
    for(;;){
      if(x===0){PARSELIST.unshift(L.slice().reverse());return true}
      if(!S.length)return false;
      L=[S[0]].concat(L);
      S=S.slice(1);
      x--;
    }
  }
  function test5(){
    var L=[];
    if(D.length<2){
      PARSELIST.unshift(S);
      S=[];
      return true;
    }
    for(;;){
      if(test4(D[1])){
        PARSELIST.unshift(L.slice().reverse());
        return true;
      }
      if(!S.length)return false;
      L=[S[0]].concat(L);
      S=S.slice(1);
      if(!S.length)return false;
    }
  }
  function test(d,s){
    D=d;S=s;
    for(;;){
      if(!D||!D.length){
        if(S.length)return false;
        PARSELIST.reverse();
        return PARSELIST.length>0;
      }
      var c=D[0],ok;
      if(typeof c==='number')ok=c===0?test5():test3(c,[]);
      else ok=test4(c)&&test2();
      if(!ok)return false;
      D=D.slice(1);
    }
  }
  function reco1(x){return x>=1?(PARSELIST[x-1]||[]):(PARSELIST[0]||[])}
  function reconstruct(R){
    var out=[];
    for(var i=0;i<R.length;i++){
      if(typeof R[i]==='number')out=out.concat(reco1(R[i]));
      else out.push(R[i]);
    }
    return out;
  }
  function advance(r){ /* RULES' first rule moves to its next answer, and they go round */
    r.ptr=r.ptr.length<2?r.r:r.ptr.slice(1);
    return r.ptr;
  }
  function memory(){
    PARSELIST=[];
    RULES=get(KEYSTACK[0],'memr');
    if(RULES&&test(RULES[0].d,SENTENCE)){
      var m=PROPS['#mem'].rules[0],a=advance(RULES[0]);
      var t=reconstruct(a[0]);
      m.ptr=m.ptr.concat([t]);
    }
  }
  function sentprint(ans){
    var n=0,i=0;
    for(;;){
      var a=i<ans.length?String(ans[i]):'nil';
      pr(a);
      n+=a.length;
      if(++i<ans.length){
        if(n>TERMINALWIDTH){pr('\n');n=0}
        else pr(' ');
      }
      else break;
    }
    memory();
  }
  function* analyze(){
    var decomp;
    RULES=[];PARSELIST=[];
    flipflop=2-flipflop;
    KEYSTACK=KEYSTACK.concat([flipflop===0?'#mem':'#lastresort']);
    for(;;){
      RULES=KEYSTACK.length?get(KEYSTACK[0],'rules'):null;
      if(!RULES)RULES=[];
      var newkey=false;
      for(;;){
        if(RULES.length&&typeof RULES[0]==='string')RULES=get(RULES[0],'rules')||[];
        if(!RULES.length)return; /* the Lisp would go round for ever */
        var r=RULES[0];
        decomp=r.d;
        PARSELIST=[];
        if(!test(decomp,SENTENCE)){RULES=RULES.slice(1);continue}
        RULES=advance(r);
        var c=RULES[0];
        if(!atom(c)&&c[0]!=='pre'){sentprint(reconstruct(c));return}
        if(!atom(c)){
          SENTENCE=reconstruct(c[1]);
          RULES=c.slice(2);
          continue;
        }
        if(c==='newkey'){
          KEYSTACK=KEYSTACK.slice(1);
          newkey=true;
          break;
        }
      }
      if(!newkey)return;
    }
  }
  function byebye(){
    pr('\n\n');
    pr('your bill will be in the mail');
    pr('\n');
    throw EXIT;
  }
  function* worker(){
    pr('\n');
    pr('speak up! hit 2 returns after typing');
    pr('\n');
    for(;;){
      SENTENCE=[];KEYSTACK=[];
      yield* readin();
      yield* analyze();
      pr('\n');
      pr('\n');
    }
  }
  var G=worker();
  function step(v){
    var r;
    try{r=G.next(v)}
    catch(e){
      if(e!==EXIT)throw e;
      if(o)P.say([o]);
      return;
    }
    if(!r.done){var p=o;o='';P.ask(p,step,true)}
  }
  step();
}});
})(window.Phosphor);
