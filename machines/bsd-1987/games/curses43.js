/* PHOSPHOR-9 terminal: machine "bsd-1987", the part of 4.3BSD's libcurses that canfield and cribbage use, on a vt100,
   24 by 80 or a little shorter: windows are written, and only wrefresh changes the screen. Ported to JavaScript for this
   terminal; it follows 4.3BSD's libcurses and keeps its notice:

 @(#) Copyright (c) 1980 Regents of the University of California.
 All rights reserved.  The Berkeley software License Agreement
 specifies the terms and conditions for redistribution.
*/
Phosphor.setup(function(P){
'use strict';
P.curses43=function(S){ /* a fresh curses for one run of a game on S; initscr() sets K.stdscr and K.curscr */
    var LINES=S.rows>=21&&S.rows<24?S.rows:24,COLS=80,NOCHANGE=-1,stdscr,curscr; /* as curses would see a shorter terminal */
    function blank(n){var a=[];while(n--)a.push(' ');return a}
    function mkwin(nl,nc,by,bx,orig){
      var w={maxy:nl,maxx:nc,begy:by,begx:bx,cury:0,curx:0,clear:false,leave:false,lines:[],first:[],last:[],j:0,k:0,scrollwin:false,fullwin:false},i;
      if(orig){
        w.lines=orig.lines;w.first=orig.first;w.last=orig.last;
        w.j=by-orig.begy;w.k=bx-orig.begx;
      }
      else for(i=0;i<nl;i++){w.lines.push(blank(nc));w.first.push(NOCHANGE);w.last.push(NOCHANGE)}
      if(bx+nc===COLS){
        if(bx===0&&nl===LINES&&by===0)w.fullwin=true;
        if(by+nl===LINES)w.scrollwin=true;
      }
      return w;
    }
    function touchline(w,y,sx,ex){
      var Y=y+w.j;
      sx+=w.k;ex+=w.k;
      if(w.first[Y]===NOCHANGE){w.first[Y]=sx;w.last[Y]=ex}
      else{
        if(w.first[Y]>sx)w.first[Y]=sx;
        if(w.last[Y]<ex)w.last[Y]=ex;
      }
    }
    function touchwin(w){for(var y=0;y<w.maxy;y++)touchline(w,y,0,w.maxx-1)}
    function wmove(w,y,x){
      if(x<0||y<0||x>=w.maxx||y>=w.maxy)return false;
      w.curx=x;w.cury=y;
      return true;
    }
    function wclrtoeol(w){
      var y=w.cury,L=w.lines[y+w.j];
      for(var x=w.curx;x<w.maxx;x++)L[x+w.k]=' ';
      touchline(w,y,w.curx,w.maxx-1);
    }
    function waddch(w,c){
      var x=w.curx,y=w.cury,nl=false;
      switch(c){
      case '\t':
        for(var nx=x+(8-(x&7));x<nx;x++)if(!waddch(w,' '))return false;
        return true;
      case '\n':
        wclrtoeol(w);
        x=0;nl=true;
        break;
      case '\r':x=0;break;
      case '\b':if(--x<0)x=0;break;
      default:
        if(w.lines[y+w.j][x+w.k]!==c){
          var X=x+w.k,Y=y+w.j;
          if(w.first[Y]===NOCHANGE)w.first[Y]=w.last[Y]=X;
          else if(X<w.first[Y])w.first[Y]=X;
          else if(X>w.last[Y])w.last[Y]=X;
        }
        w.lines[y+w.j][x+w.k]=c;
        x++;
        if(x>=w.maxx){x=0;nl=true}
      }
      if(nl&&++y>=w.maxy)return false;
      w.curx=x;w.cury=y;
      return true;
    }
    function waddstr(w,s){
      for(var i=0;i<s.length;i++)if(!waddch(w,s.charAt(i)))return false;
      return true;
    }
    function mvwaddstr(w,y,x,s){if(wmove(w,y,x))waddstr(w,s)}
    function mvwaddch(w,y,x,c){if(wmove(w,y,x))waddch(w,c)}
    function werase(w){
      for(var y=0;y<w.maxy;y++){
        var L=w.lines[y+w.j],lo=-1,hi=-1;
        for(var x=0;x<w.maxx;x++)if(L[x+w.k]!==' '){hi=x;if(lo<0)lo=x;L[x+w.k]=' '}
        if(lo>=0)touchline(w,y,lo,hi);
      }
      w.curx=w.cury=0;
    }
    function wclear(w){werase(w);w.clear=true}
    var ly=0,lx=0;
    function makech(w,wy){
      var Y=wy+w.j,wx=w.first[Y]-w.k,lch,y=wy+w.begy;
      if(wx>=w.maxx)return true;
      if(wx<0)wx=0;
      lch=w.last[Y]-w.k;
      if(lch<0)return true;
      if(lch>=w.maxx)lch=w.maxx-1;
      var N=w.lines[Y],C=curscr.lines[y],bx=w.begx,k=w.k;
      while(wx<=lch){
        if(N[wx+k]!==C[wx+bx]){
          ly=y;lx=wx+bx;
          while(N[wx+k]!==C[wx+bx]&&wx<=lch){
            var at=wx;
            wx++;
            if(wx>=w.maxx&&wy===w.maxy-1&&w.scrollwin){lx=--wx;return false}
            C[at+bx]=N[at+k];
          }
          if(lx===wx+bx)break;
          lx=wx+bx;
          if(lx>=COLS){lx=0;ly++}
        }
        else while(wx<=lch&&N[wx+k]===C[wx+bx])++wx;
      }
      return true;
    }
    function wrefresh(w){
      ly=curscr.cury;lx=curscr.curx;
      if(w.clear||curscr.clear){
        if(w.fullwin||curscr.clear){
          ly=lx=0;
          curscr.clear=false;
          curscr.cury=curscr.curx=0;
          werase(curscr);
          touchwin(w);
        }
        w.clear=false;
      }
      for(var wy=0;wy<w.maxy;wy++){
        var Y=wy+w.j;
        if(w.first[Y]!==NOCHANGE){
          if(!makech(w,wy))return;
          if(w.first[Y]>=w.k)w.first[Y]=w.maxx+w.k;
          if(w.last[Y]<w.maxx+w.k)w.last[Y]=w.k;
          if(w.last[Y]<w.first[Y])w.first[Y]=NOCHANGE;
        }
      }
      if(w.leave){
        curscr.cury=ly;curscr.curx=lx;
        ly-=w.begy;lx-=w.begx;
        if(ly>=0&&ly<w.maxy&&lx>=0&&lx<w.maxx){w.cury=ly;w.curx=lx}
        else w.cury=w.curx=0;
      }
      else{
        curscr.cury=w.cury+w.begy;
        curscr.curx=w.curx+w.begx;
      }
    }
    function initscr(){
      curscr=mkwin(LINES,COLS,0,0);
      curscr.clear=true;
      stdscr=mkwin(LINES,COLS,0,0);
    }
    /* the glass: what curses has sent. The program fits the type to 80x24 where it stays readable; where the glass
       is still smaller, the view follows the cursor */
    function view(S){
      var rows=S.rows,cols=S.cols,cy=curscr.cury,cx=curscr.curx;
      var top=rows<LINES?Math.max(0,Math.min(LINES-rows,cy-(rows>>1))):0,lft=S.pan(cols<COLS?Math.max(0,Math.min(COLS-cols,cx-(cols>>1))):0,COLS-cols,cx);
      S.draw(curscr.lines.slice(top,top+rows).map(function(L){return L.slice(lft,lft+cols).join('').trimEnd()}),Math.min(cy-top,rows-1),Math.max(0,Math.min(cx-lft,cols-1)));
    }
  var K={LINES:LINES,COLS:COLS,NOCHANGE:NOCHANGE,initscr:function(){initscr();K.stdscr=stdscr;K.curscr=curscr}};
  [blank,mkwin,touchline,touchwin,wmove,wclrtoeol,waddch,waddstr,mvwaddstr,mvwaddch,werase,wclear,makech,wrefresh,view].forEach(function(f){K[f.name]=f});
  return K;
};
});
