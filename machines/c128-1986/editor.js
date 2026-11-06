/* PHOSPHOR-9 terminal: machine "c128-1986", the screen editor. One Screen is the 40-column VIC-II text
   screen or the 80-column VDC one: screen codes, a colour for each cell, the cursor, and the links that join
   physical rows into one logical line. put() is the KERNAL's CHROUT (control codes, quote mode, insert mode),
   key() is the keyboard while a line is being typed, line() reads a logical line back the way RETURN does.
   No drawing here: screen.js draws, and node can run this as it is.
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE. */
(function(P){
'use strict';
var C=P.c128=P.c128||{};
/* PETSCII colour codes to colour numbers 0-15 */
var COLOURS={144:0,5:1,28:2,159:3,156:4,30:5,31:6,158:7,129:8,149:9,150:10,151:11,152:12,153:13,154:14,155:15};
function toScreen(p){ /* a printable PETSCII code to a screen code */
  if(p<32)return -1;
  if(p<64)return p;
  if(p<96)return p-64;
  if(p<128)return p-32;
  if(p<160)return -1;
  if(p<192)return p-64;
  if(p===255)return 94;
  return p-128;
}
function fromScreen(s){ /* what RETURN makes of a screen code: reversed ones in the first and third quarter are control codes */
  var r=s&128,c=s&127;
  if(c<32)return r?c:c+64;
  if(c<64)return c;
  if(c<96)return r?c+64:c+128;
  return c+64;
}
function controlSymbol(p){return p<32?p|128:((p-64)&127)|128} /* a control code in quotes shows as this reversed character */
function Screen(cols,rows,maxRows,colour){
  this.cols=cols;this.rows=rows;this.maxRows=maxRows; /* the longest logical line, in rows */
  this.ch=new Uint8Array(cols*rows).fill(32);this.co=new Uint8Array(cols*rows).fill(colour);
  this.link=new Uint8Array(rows); /* 1: this row carries on the row above */
  this.r=0;this.c=0;this.colour=colour;this.rvs=false;this.quote=false;this.ins=0;this.esc=false;
  this.lower=false;this.dirty=true;this.lazy=false;this.pend=false;this.scrolled=0;this.locked=false;this.onEsc=null;this.onBell=null;
  this.tabs=[];for(var i=0;i<cols;i+=8)this.tabs[i]=1;
}
var S=Screen.prototype;
S.at=function(r,c){return r*this.cols+c};
S.touch=function(){this.dirty=true};
S.clear=function(){this.ch.fill(32);this.co.fill(this.colour);this.link.fill(0);this.r=0;this.c=0;this.touch()};
S.start=function(r){while(r>0&&this.link[r])r--;return r}; /* first row of the logical line r is in */
S.end=function(r){while(r+1<this.rows&&this.link[r+1])r++;return r};
S.size=function(r){return this.end(r)-this.start(r)+1};
S.scroll=function(){ /* everything up a row; the C64 takes the whole logical line at the top with it */
  if(!this.lazy)for(var k=this.size(0);k>1;k--)this.scroll1();
  this.scroll1();
};
S.scroll1=function(){
  var n=this.cols;this.scrolled++;
  this.ch.copyWithin(0,n);this.co.copyWithin(0,n);
  this.ch.fill(32,(this.rows-1)*n);this.co.fill(this.colour,(this.rows-1)*n);
  this.link.copyWithin(0,1);this.link[this.rows-1]=0;this.link[0]=0;
  this.r--;this.touch();
};
S.insertRow=function(at){ /* a blank row at at; the bottom row falls off */
  var n=this.cols;
  this.ch.copyWithin((at+1)*n,at*n,(this.rows-1)*n);this.co.copyWithin((at+1)*n,at*n,(this.rows-1)*n);
  this.link.copyWithin(at+1,at,this.rows-1);
  this.ch.fill(32,at*n,(at+1)*n);this.co.fill(this.colour,at*n,(at+1)*n);this.link[at]=0;
  if(at+1<this.rows&&!this.link[at+1]){} /* the row pushed down keeps its own link */
  this.touch();
};
S.deleteRow=function(at){
  var n=this.cols;
  this.ch.copyWithin(at*n,(at+1)*n);this.co.copyWithin(at*n,(at+1)*n);this.link.copyWithin(at,at+1);
  this.ch.fill(32,(this.rows-1)*n);this.co.fill(this.colour,(this.rows-1)*n);this.link[this.rows-1]=0;
  if(at<this.rows&&at===0)this.link[0]=0;
  this.touch();
};
S.down=function(){if(++this.r>=this.rows)this.scroll()};
S.wrap=function(){ /* past the last column: on into the next row of the same line, or a new one joined to it */
  this.c=0;
  if(this.r+1<this.rows&&this.link[this.r+1]){this.r++;return}
  if(this.size(this.r)<this.maxRows){
    if(this.r+1>=this.rows){this.r++;this.scroll();this.link[this.r]=1}
    else{this.insertRow(this.r+1);this.link[this.r+1]=1;this.r++}
    return;
  }
  this.down();
};
S.newline=function(){ /* RETURN: the row after the end of this logical line */
  this.r=this.end(this.r);this.c=0;this.down();
  this.rvs=false;this.quote=false;this.ins=0;
};
S.poke=function(code){var i=this.at(this.r,this.c);this.ch[i]=code;this.co[i]=this.colour;this.touch()};
S.glyph=function(code){ /* a screen code at the cursor, then on. The C128 waits for the next character before
  it goes on to a new row (lazy), the C64 goes at once */
  if(this.pend){this.pend=false;this.wrap()}
  this.poke(this.rvs?code|128:code);
  if(++this.c>=this.cols){if(this.lazy){this.c=this.cols-1;this.pend=true}else this.wrap()}
};
S.left=function(){
  if(this.c>0){this.c--;return true}
  if(this.r>0){this.r--;this.c=this.cols-1;return true}
  return false;
};
S.right=function(){if(++this.c>=this.cols){this.c=0;this.down()}};
S.cells=function(r0,r1){var a=[];for(var r=r0;r<=r1;r++)for(var c=0;c<this.cols;c++)a.push(this.at(r,c));return a};
S.del=function(){ /* DEL: the character left of the cursor goes, and the rest of the line moves up to fill it */
  var s=this.start(this.r);
  if(this.pend)this.pend=false;
  else{
    if(this.r===s&&this.c===0)return;
    this.left();
  }
  var cells=this.cells(s,this.end(this.r)),from=cells.indexOf(this.at(this.r,this.c));
  for(var i=from;i<cells.length-1;i++){this.ch[cells[i]]=this.ch[cells[i+1]];this.co[cells[i]]=this.co[cells[i+1]]}
  this.ch[cells[cells.length-1]]=32;this.touch();
};
S.insert=function(){ /* INST: a space at the cursor, pushing the rest of the line on; one more row if the line has room */
  var e=this.end(this.r),last=this.at(e,this.cols-1);
  if(this.ch[last]!==32){
    if(this.size(this.r)>=this.maxRows)return;
    if(e+1>=this.rows){var was=this.r;this.scroll();e-=was-this.r}
    else this.insertRow(e+1);
    this.link[e+1]=1;
  }
  var cells=this.cells(this.start(this.r),this.end(this.r)),from=cells.indexOf(this.at(this.r,this.c));
  for(var i=cells.length-1;i>from;i--){this.ch[cells[i]]=this.ch[cells[i-1]];this.co[cells[i]]=this.co[cells[i-1]]}
  this.ch[cells[from]]=32;this.co[cells[from]]=this.colour;this.ins++;this.touch();
};
S.home=function(){this.r=0;this.c=0};
S.eraseLine=function(from,to){for(var c=from;c<to;c++){this.ch[this.at(this.r,c)]=32;this.co[this.at(this.r,c)]=this.colour}this.touch()};
S.escape=function(p){ /* the C128's escape sequences that make sense on one screen */
  var k=String.fromCharCode(p&127).toUpperCase(),s=this.start(this.r);
  if(k==='Q'){for(var r=this.r;r<=this.end(this.r);r++){var c0=r===this.r?this.c:0;for(var c=c0;c<this.cols;c++)this.ch[this.at(r,c)]=32}this.touch()}
  else if(k==='P'){for(var r2=s;r2<=this.r;r2++){var c1=r2===this.r?this.c+1:this.cols;for(var d=0;d<c1;d++)this.ch[this.at(r2,d)]=32}this.touch()}
  else if(k==='@'){this.ch.fill(32,this.at(this.r,this.c));for(var r3=this.r+1;r3<this.rows;r3++)this.link[r3]=0;this.touch()}
  else if(k==='J'){this.r=s;this.c=0}
  else if(k==='K'){var e=this.end(this.r),last=this.cols-1;while(last>0&&this.ch[this.at(e,last)]===32)last--;this.r=e;this.c=Math.min(this.cols-1,last+(this.ch[this.at(e,last)]===32?0:1))}
  else if(k==='I'){this.insertRow(this.r);this.c=0}
  else if(k==='D'){var n=this.size(this.r);this.r=s;for(var i=0;i<n;i++)this.deleteRow(s);this.c=0}
  else if(k==='O'){this.quote=false;this.ins=0;this.rvs=false}
  else if(k==='G'&&this.onBell)this.onBell();
  else if(this.onEsc)this.onEsc(k);
};
S.put=function(p){ /* CHROUT */
  p&=255;
  if(this.pend&&p===29&&!this.quote&&!this.ins)return; /* the C128: a cursor right waiting at the end of a row stays there */
  if(this.pend&&(p<32||p>=128&&p<160)&&!this.quote&&!this.ins&&p!==20)this.pend=false;
  if(this.esc){this.esc=false;this.escape(p);return}
  if(p===13||p===141){this.newline();return}
  var ctl=p<32||(p>=128&&p<160);
  if(ctl&&(this.quote||this.ins)&&p!==20){this.glyph(controlSymbol(p));if(this.ins)this.ins--;return}
  if(ctl&&this.ins&&p===20){this.glyph(controlSymbol(p));this.ins--;return}
  if(ctl){this.control(p);return}
  var s=toScreen(p);
  if(s<0)return;
  if(this.ins)this.ins--;
  else if(p===34)this.quote=!this.quote;
  this.glyph(s);
};
S.control=function(p){
  if(COLOURS.hasOwnProperty(p)){this.colour=COLOURS[p];return}
  switch(p){
    case 147:this.clear();break;
    case 19:this.home();break;
    case 17:this.down();break;
    case 145:if(this.r>0)this.r--;break;
    case 29:this.right();break;
    case 157:this.left();break;
    case 18:this.rvs=true;break;
    case 146:this.rvs=false;break;
    case 20:this.del();break;
    case 148:this.insert();break;
    case 14:this.lower=true;this.touch();break;
    case 142:this.lower=false;this.touch();break;
    case 8:if(!this.onEsc)this.locked=true;break; /* the C64 locks the Commodore-shift switch with 8 and 9, the C128 with 11 and 12 */
    case 11:if(this.onEsc)this.locked=true;break;
    case 12:if(this.onEsc)this.locked=false;break;
    case 27:this.esc=!!this.onEsc;break;
    case 7:if(this.onBell)this.onBell();break;
    case 9:if(!this.onEsc){this.locked=false;break}if(this.onEsc){do{this.c++}while(this.c<this.cols-1&&!this.tabs[this.c]);if(this.c>=this.cols)this.c=this.cols-1}break; /* the C128's TAB; the C64 has none */
  }
};
S.line=function(fromCol){ /* RETURN: the logical line the cursor is on, as PETSCII, trailing blanks dropped */
  var s=this.start(this.r),e=this.end(this.r),o='';
  for(var r=s,k=0;r<=e;r++)for(var c=0;c<this.cols;c++,k++){
    if(k<fromCol)continue;
    o+=String.fromCharCode(fromScreen(this.ch[this.at(r,c)]));
  }
  return o.replace(/ +$/,'');
};
S.key=function(p){ /* a key while a line is being typed: like CHROUT, except that the cursor keys always move */
  if(p===13||p===141)return;
  if(this.quote||this.ins){
    if(p===20&&!this.ins){this.del();return}
    this.put(p);return;
  }
  if(p===34){this.quote=true;this.glyph(34);return}
  this.put(p);
};
S.text=function(r){ /* a row as text, for the hidden copy of the screen */
  var o='',set=C.font.sets[this.lower?1:0];
  for(var c=0;c<this.cols;c++)o+=C.font.text(set[this.ch[this.at(r,c)]&127]);
  return o.replace(/\s+$/,'');
};
C.Screen=Screen;C.toScreen=toScreen;C.fromScreen=fromScreen;C.COLOURS=COLOURS;
})(window.Phosphor);
