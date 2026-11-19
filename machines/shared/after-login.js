/* gaijin.systems: the letter, opened each time the page starts. Once the first prompt after the login is up, "mail" is typed at
   it a key at a time, as the login name is, and entered. If the visitor types anything first, or meanwhile, it is left to them,
   and what was typed of "mail" is taken back. Loaded by the V7 machine (machines/machines.js). */
Phosphor.setup(function(){
  var C='mail',term=document.getElementById('term'),out=document.getElementById('out'),kb=document.getElementById('kb'),i=0,line=null,mine=false,theirs=false;
  function send(e){mine=true;kb.dispatchEvent(e);mine=false}
  function touched(e){ /* the visitor's own keys, wherever the page has them: not a bare Shift, Ctrl or Alt, nor a shortcut */
    if(mine||theirs)return;
    if(e.type==='keydown'&&(/^(Shift|Control|Alt|Meta|CapsLock|AltGraph)$/.test(e.key)||e.ctrlKey||e.metaKey))return;
    theirs=true;
    if(i>0&&kb.value.toLowerCase()===C.slice(0,i)){kb.value='';send(new Event('input',{bubbles:true}))} /* not "ma" left in their line */
  }
  document.addEventListener('keydown',touched,true);
  ['input','paste'].forEach(function(t){kb.addEventListener(t,touched,true)});
  function up(){return !theirs&&term.classList.contains('idle')&&out.lastElementChild===line} /* still that first prompt, untouched */
  function key(){
    if(!up()||kb.value.toLowerCase()!==C.slice(0,i))return;
    if(i<C.length){kb.value=C.slice(0,++i);send(new Event('input',{bubbles:true}));setTimeout(key,110);return}
    setTimeout(function(){if(up()&&kb.value.toLowerCase()===C)send(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}))},300);
  }
  (function ready(){if(theirs)return;if(!term.classList.contains('idle')){setTimeout(ready,100);return}line=out.lastElementChild;setTimeout(key,700)})();
});
