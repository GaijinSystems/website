/* PHOSPHOR-9 terminal: machine "v7-1979", the programs that only load when first run: what each one
   needs, and the manual page that has to be there before it is. */
(function(P){
'use strict';
function game(files,name,man){P.later(files,{names:[name],path:'/usr/games',man:man,hidden:true,noHelpFlag:true})}
game('../shared/arithmetic.js','arithmetic',{what:'provide drill in number facts',syn:'arithmetic [ +-x/ ] [ range ]',desc:[
  'types out simple arithmetic problems, and waits for an answer to be typed in. if the answer is correct, it types back "Right!", and a new problem. if the answer is wrong, it replies "What?", and waits for another answer. every twenty problems, it publishes statistics on correctness and the time required to answer.',
  'to quit the program, type an interrupt (delete).',
  'the first optional argument determines the kind of problem to be generated; +, -, x, and / respectively cause addition, subtraction, multiplication, and division problems. default is +-. range is a decimal number; all addends, subtrahends, differences, multiplicands, divisors, and quotients will be less than or equal to the value of range. default range is 10.']});
game('../shared/bcd.js','bcd',{what:'convert to antique media',syn:'bcd [ string ]',desc:['reads the given input and reproduces it in the form of a punched card.']});
game('games/ppt.js','ppt',{what:'convert to antique media',syn:'ppt',desc:['reads the standard input and reproduces it in the form of a paper tape.']});
})(window.Phosphor);
