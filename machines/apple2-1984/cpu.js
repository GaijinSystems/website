/* PHOSPHOR-9 terminal: machine "apple2-1984", a 6502 for the monitor's G and BASIC's CALL, and the monitor's
   disassembler. The ROM is not here: calls into it are answered by the machine (apple.js), routine by routine.
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE. */
(function(P){
'use strict';
/* mnemonic and addressing mode for each opcode: imp acc imm zp zpx zpy abs abx aby ind izx izy rel */
var OPS={},M=[
['BRK','imp',0x00],['ORA','izx',0x01],['ORA','zp',0x05],['ASL','zp',0x06],['PHP','imp',0x08],['ORA','imm',0x09],['ASL','acc',0x0A],['ORA','abs',0x0D],['ASL','abs',0x0E],
['BPL','rel',0x10],['ORA','izy',0x11],['ORA','zpx',0x15],['ASL','zpx',0x16],['CLC','imp',0x18],['ORA','aby',0x19],['ORA','abx',0x1D],['ASL','abx',0x1E],
['JSR','abs',0x20],['AND','izx',0x21],['BIT','zp',0x24],['AND','zp',0x25],['ROL','zp',0x26],['PLP','imp',0x28],['AND','imm',0x29],['ROL','acc',0x2A],['BIT','abs',0x2C],['AND','abs',0x2D],['ROL','abs',0x2E],
['BMI','rel',0x30],['AND','izy',0x31],['AND','zpx',0x35],['ROL','zpx',0x36],['SEC','imp',0x38],['AND','aby',0x39],['AND','abx',0x3D],['ROL','abx',0x3E],
['RTI','imp',0x40],['EOR','izx',0x41],['EOR','zp',0x45],['LSR','zp',0x46],['PHA','imp',0x48],['EOR','imm',0x49],['LSR','acc',0x4A],['JMP','abs',0x4C],['EOR','abs',0x4D],['LSR','abs',0x4E],
['BVC','rel',0x50],['EOR','izy',0x51],['EOR','zpx',0x55],['LSR','zpx',0x56],['CLI','imp',0x58],['EOR','aby',0x59],['EOR','abx',0x5D],['LSR','abx',0x5E],
['RTS','imp',0x60],['ADC','izx',0x61],['ADC','zp',0x65],['ROR','zp',0x66],['PLA','imp',0x68],['ADC','imm',0x69],['ROR','acc',0x6A],['JMP','ind',0x6C],['ADC','abs',0x6D],['ROR','abs',0x6E],
['BVS','rel',0x70],['ADC','izy',0x71],['ADC','zpx',0x75],['ROR','zpx',0x76],['SEI','imp',0x78],['ADC','aby',0x79],['ADC','abx',0x7D],['ROR','abx',0x7E],
['STA','izx',0x81],['STY','zp',0x84],['STA','zp',0x85],['STX','zp',0x86],['DEY','imp',0x88],['TXA','imp',0x8A],['STY','abs',0x8C],['STA','abs',0x8D],['STX','abs',0x8E],
['BCC','rel',0x90],['STA','izy',0x91],['STY','zpx',0x94],['STA','zpx',0x95],['STX','zpy',0x96],['TYA','imp',0x98],['STA','aby',0x99],['TXS','imp',0x9A],['STA','abx',0x9D],
['LDY','imm',0xA0],['LDA','izx',0xA1],['LDX','imm',0xA2],['LDY','zp',0xA4],['LDA','zp',0xA5],['LDX','zp',0xA6],['TAY','imp',0xA8],['LDA','imm',0xA9],['TAX','imp',0xAA],['LDY','abs',0xAC],['LDA','abs',0xAD],['LDX','abs',0xAE],
['BCS','rel',0xB0],['LDA','izy',0xB1],['LDY','zpx',0xB4],['LDA','zpx',0xB5],['LDX','zpy',0xB6],['CLV','imp',0xB8],['LDA','aby',0xB9],['TSX','imp',0xBA],['LDY','abx',0xBC],['LDA','abx',0xBD],['LDX','aby',0xBE],
['CPY','imm',0xC0],['CMP','izx',0xC1],['CPY','zp',0xC4],['CMP','zp',0xC5],['DEC','zp',0xC6],['INY','imp',0xC8],['CMP','imm',0xC9],['DEX','imp',0xCA],['CPY','abs',0xCC],['CMP','abs',0xCD],['DEC','abs',0xCE],
['BNE','rel',0xD0],['CMP','izy',0xD1],['CMP','zpx',0xD5],['DEC','zpx',0xD6],['CLD','imp',0xD8],['CMP','aby',0xD9],['CMP','abx',0xDD],['DEC','abx',0xDE],
['CPX','imm',0xE0],['SBC','izx',0xE1],['CPX','zp',0xE4],['SBC','zp',0xE5],['INC','zp',0xE6],['INX','imp',0xE8],['SBC','imm',0xE9],['NOP','imp',0xEA],['CPX','abs',0xEC],['SBC','abs',0xED],['INC','abs',0xEE],
['BEQ','rel',0xF0],['SBC','izy',0xF1],['SBC','zpx',0xF5],['INC','zpx',0xF6],['SED','imp',0xF8],['SBC','aby',0xF9],['SBC','abx',0xFD],['INC','abx',0xFE]];
M.forEach(function(o){OPS[o[2]]=[o[0],o[1]]});
var LEN={imp:1,acc:1,imm:2,zp:2,zpx:2,zpy:2,izx:2,izy:2,rel:2,abs:3,abx:3,aby:3,ind:3};
function h2(n){return ('0'+(n&255).toString(16).toUpperCase()).slice(-2)}
function h4(n){return ('000'+(n&65535).toString(16).toUpperCase()).slice(-4)}

/* one line of the monitor's L: 0300-   A9 C1       LDA   #$C1 */
function disasm(read,a){
  var op=read(a),d=OPS[op],n=d?LEN[d[1]]:1,b=[];
  for(var i=0;i<n;i++)b.push(h2(read(a+i)));
  var s=h4(a)+'-   '+b.join(' ').padEnd(12);
  if(!d)return {text:s+'???',len:1};
  var lo=read(a+1),w=lo|read(a+2)<<8,o='';
  switch(d[1]){
  case 'imm':o='#$'+h2(lo);break;case 'zp':o='$'+h2(lo);break;case 'zpx':o='$'+h2(lo)+',X';break;case 'zpy':o='$'+h2(lo)+',Y';break;
  case 'abs':o='$'+h4(w);break;case 'abx':o='$'+h4(w)+',X';break;case 'aby':o='$'+h4(w)+',Y';break;case 'ind':o='($'+h4(w)+')';break;
  case 'izx':o='($'+h2(lo)+',X)';break;case 'izy':o='($'+h2(lo)+'),Y';break;
  case 'rel':o='$'+h4(a+2+(lo<128?lo:lo-256));break;
  }
  return {text:s+d[0]+'   '+o,len:n};
}

/* the processor: io.read(a), io.write(a,v), io.trap(cpu) for an address in the ROM (true: handled) */
function cpu(io){
  var C={a:0,x:0,y:0,s:0xFF,p:0x30,pc:0},R=io.read,W=io.write;
  function fl(f,on){if(on)C.p|=f;else C.p&=~f}
  function nz(v){fl(2,!(v&255));fl(128,v&128);return v&255}
  function push(v){W(0x100+C.s,v&255);C.s=(C.s-1)&255}
  function pull(){C.s=(C.s+1)&255;return R(0x100+C.s)}
  function rw(a){return R(a)|R((a+1)&65535)<<8}
  function zw(a){return R(a&255)|R((a+1)&255)<<8}
  function adr(m){
    var pc=C.pc,lo=R(pc+1),w=lo|R(pc+2)<<8;
    switch(m){
    case 'imm':return pc+1;case 'zp':return lo;case 'zpx':return (lo+C.x)&255;case 'zpy':return (lo+C.y)&255;
    case 'abs':return w;case 'abx':return (w+C.x)&65535;case 'aby':return (w+C.y)&65535;
    case 'izx':return zw(lo+C.x);case 'izy':return (zw(lo)+C.y)&65535;
    case 'ind':return R(w)|R((w&0xFF00)|((w+1)&255))<<8;
    }
  }
  function adc(v){
    var c=C.p&1,r;
    if(C.p&8){
      var lo=(C.a&15)+(v&15)+c,hi=(C.a>>4)+(v>>4);
      if(lo>9){lo+=6;hi++}
      fl(64,~(C.a^v)&(C.a^(hi<<4))&128);
      if(hi>9)hi+=6;
      fl(1,hi>15);r=((hi<<4)|(lo&15))&255;nz(r);C.a=r;return;
    }
    r=C.a+v+c;fl(1,r>255);fl(64,~(C.a^v)&(C.a^r)&128);C.a=nz(r);
  }
  function sbc(v){
    if(C.p&8){
      var c=C.p&1,lo=(C.a&15)-(v&15)-(1-c),hi=(C.a>>4)-(v>>4);
      if(lo<0){lo-=6;hi--}
      var r0=C.a-v-(1-c);fl(64,(C.a^v)&(C.a^r0)&128);fl(1,r0>=0);
      if(hi<0)hi-=6;
      C.a=nz(((hi<<4)|(lo&15))&255);return;
    }
    adc(v^255);
  }
  function cmp(r,v){fl(1,r>=v);nz(r-v)}
  function br(on){var o=R(C.pc+1);C.pc=(C.pc+2+(on?(o<128?o:o-256):0))&65535}
  function step(){ /* one instruction; returns 'brk' at a BRK */
    if(C.pc>=0x9600&&io.trap(C))return;
    var op=R(C.pc),d=OPS[op];
    if(!d){C.pc=(C.pc+1)&65535;return}
    var m=d[1],n=LEN[m],a,v,pc=C.pc;
    switch(d[0]){
    case 'BRK':return 'brk';
    case 'LDA':C.a=nz(R(adr(m)));break;case 'LDX':C.x=nz(R(adr(m)));break;case 'LDY':C.y=nz(R(adr(m)));break;
    case 'STA':W(adr(m),C.a);break;case 'STX':W(adr(m),C.x);break;case 'STY':W(adr(m),C.y);break;
    case 'TAX':C.x=nz(C.a);break;case 'TAY':C.y=nz(C.a);break;case 'TXA':C.a=nz(C.x);break;case 'TYA':C.a=nz(C.y);break;
    case 'TSX':C.x=nz(C.s);break;case 'TXS':C.s=C.x;break;
    case 'INX':C.x=nz(C.x+1);break;case 'INY':C.y=nz(C.y+1);break;case 'DEX':C.x=nz(C.x-1);break;case 'DEY':C.y=nz(C.y-1);break;
    case 'INC':a=adr(m);W(a,nz(R(a)+1));break;case 'DEC':a=adr(m);W(a,nz(R(a)-1));break;
    case 'ADC':adc(R(adr(m)));break;case 'SBC':sbc(R(adr(m)));break;
    case 'AND':C.a=nz(C.a&R(adr(m)));break;case 'ORA':C.a=nz(C.a|R(adr(m)));break;case 'EOR':C.a=nz(C.a^R(adr(m)));break;
    case 'CMP':cmp(C.a,R(adr(m)));break;case 'CPX':cmp(C.x,R(adr(m)));break;case 'CPY':cmp(C.y,R(adr(m)));break;
    case 'BIT':v=R(adr(m));fl(2,!(v&C.a));fl(128,v&128);fl(64,v&64);break;
    case 'ASL':case 'LSR':case 'ROL':case 'ROR':
      v=m==='acc'?C.a:R(a=adr(m));
      var c=C.p&1;
      if(d[0]==='ASL'){fl(1,v&128);v=v<<1}else if(d[0]==='LSR'){fl(1,v&1);v=v>>1}
      else if(d[0]==='ROL'){fl(1,v&128);v=(v<<1)|c}else{fl(1,v&1);v=(v>>1)|(c<<7)}
      v=nz(v);if(m==='acc')C.a=v;else W(a,v);break;
    case 'PHA':push(C.a);break;case 'PLA':C.a=nz(pull());break;case 'PHP':push(C.p|0x30);break;case 'PLP':C.p=pull()|0x30;break;
    case 'CLC':fl(1,0);break;case 'SEC':fl(1,1);break;case 'CLI':fl(4,0);break;case 'SEI':fl(4,1);break;
    case 'CLV':fl(64,0);break;case 'CLD':fl(8,0);break;case 'SED':fl(8,1);break;case 'NOP':break;
    case 'BPL':br(!(C.p&128));return;case 'BMI':br(C.p&128);return;case 'BVC':br(!(C.p&64));return;case 'BVS':br(C.p&64);return;
    case 'BCC':br(!(C.p&1));return;case 'BCS':br(C.p&1);return;case 'BNE':br(!(C.p&2));return;case 'BEQ':br(C.p&2);return;
    case 'JMP':C.pc=adr(m);return;
    case 'JSR':a=pc+2;push(a>>8);push(a);C.pc=adr(m);return;
    case 'RTS':a=pull();a|=pull()<<8;C.pc=(a+1)&65535;return;
    case 'RTI':C.p=pull()|0x30;a=pull();a|=pull()<<8;C.pc=a;return;
    }
    C.pc=(pc+n)&65535;
  }
  C.step=step;C.push=push;C.pull=pull;
  C.rts=function(){var a=pull();a|=pull()<<8;C.pc=(a+1)&65535};
  return C;
}
P.a2cpu={cpu:cpu,disasm:disasm,h2:h2,h4:h4};
P.setup(function(){});
})(window.Phosphor);
