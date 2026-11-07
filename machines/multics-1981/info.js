/* PHOSPHOR-9 terminal: machine "multics-1981", the info segments in >doc>info that help prints, a block at a time.
   Each is the date it was last changed, the names, then paragraphs with a title before the first colon.
   They are written for this terminal, in the shape of the MR8.0 info segments (AG92-03A, CH24-00).
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE. */
Phosphor.setup(function(P){
  'use strict';
  var M=P.multics,DIR='/documentation/info_segments',WHEN=new Date(P.systemDate.getTime()-86400000*30);
  function info(names,date,L){
    var n=P.put(DIR+'/'+names[0]+'.info','f',{owner:'Initializer',date:WHEN,body:typeof L==='function'?L:[date+'  '+names.join(', ')].concat(L),acl:[['r','*.*.*']]});
    if(typeof L==='function')n.body=function(){return [date+'  '+names.join(', ')].concat(L())};
    M.names(n,names.slice(1).map(function(x){return x+'.info'}));
  }
  var TERMS={about:'what this terminal\'s owner has to say',source:'where the terminal\'s own program can be had',sound:'the keys\' clicks: sound on, or sound off',
    fill:'the screen as big as the window allows, and back again',effects:'how hard the tube works: effects auto, full or lite',connect:'another machine on the line: connect, then its name'};
  info(['help_system'],'06/02/80',function(){
    var own=P.help().filter(function(h){return !P.has(M.CMD,h[0])&&!P.has(TERMS,h[0])});
    return ['','Function:  help prints an info segment, a block at a time.  Type','     help NAME','for the info segment on the command NAME, and answer "yes" to "More help?" for each further block, or "no" to stop.',
      '','Commands:  the commands of this system include list (ls), print (pr), print_wdir (pwd), change_wdir (cwd), create_dir (cd), delete (dl), delete_dir (dd), rename (rn), copy (cp), move (mv), add_name (an), status (st), list_acl (la), set_acl (sa), qedx (qx), exec_com (ec), who, read_mail (rdm), print_mail (prm), send_mail (sdm), send_message (sm), list_help (lh) and logout.',
      '','The terminal\'s, not Multics\'s:  these words are answered by the terminal itself, whatever system it is connected to.']
      .concat(Object.keys(TERMS).filter(function(k){return P.has(P.cmds,k)&&!(k==='connect'&&P.allowed.length<2)}).map(function(k){return '     '+k.padEnd(10)+TERMS[k]}))
      .concat(own.map(function(h){return '     '+h[0].padEnd(10)+h[1].toLowerCase()}))
      .concat(['','Notes:  list_help TOPIC lists the info segments whose names contain TOPIC.  Pathnames use > between directories: your home directory is >udd>Project_id>Person_id.']);
  });
  info(['list','ls'],'04/14/80',['','Syntax:  ls {paths} {-control_args}','','Function:  prints information about the entries in a directory: their access modes, lengths in records, and names.',
    '','Arguments:','paths','   are the entries to be listed.  The star convention is allowed.  The default is every segment in the working directory.',
    '','Control arguments:','-all, -a','   lists segments and directories.','-directory, -dr','   lists directories only.','-segment, -sg','   lists segments only.','-pathname PATH, -pn PATH','   lists the directory PATH instead of the working directory.','-total, -tt','   prints only the totals.','-primary, -pri','   prints only the primary name of each entry.','-reverse, -rv','   reverses the order.',
    '','Notes:  The modes of a segment are r (read), e (execute) and w (write); of a directory, s (status), m (modify) and a (append).  Entries are listed most recently modified first.']);
  info(['print','pr'],'01/27/76',['','Syntax:  pr path {begin_line} {end_line}','','Function:  prints an ASCII segment.','',
    'Arguments:','path','   is the pathname of the segment.','begin_line','   is the number of the first line to be printed.  The default is 1.','end_line','   is the number of the last line to be printed.  The default is the end of the segment.',
    '','Notes:  A heading with the entryname and the date is printed first, unless begin_line or end_line is given.']);
  info(['print_wdir','pwd'],'01/27/76',['','Syntax:  pwd','','Function:  prints the pathname of the working directory.']);
  info(['change_wdir','cwd'],'01/27/76',['','Syntax:  cwd {path}','','Function:  changes the working directory.','','Arguments:','path','   is the new working directory.  If it is omitted, the home directory is used.  A leading < goes up one directory for each <.']);
  info(['create_dir','cd'],'02/11/77',['','Syntax:  cd paths','','Function:  creates directories.  You must have append access on the directory that will contain each one.']);
  info(['delete','dl'],'02/11/77',['','Syntax:  dl paths {-control_args}','','Function:  deletes segments.  The star convention is allowed.','','Control arguments:','-long, -lg','   prints a line for each segment deleted.','','Notes:  Use delete_dir (dd) for a directory.']);
  info(['delete_dir','dd'],'02/11/77',['','Syntax:  dd paths {-force}','','Function:  deletes directories and everything in them, after asking.','','Control arguments:','-force','   does not ask.']);
  info(['rename','rn'],'01/27/76',['','Syntax:  rn path1 name1 {... pathN nameN}','','Function:  replaces a name of an entry.  The equal convention is allowed: rn foo.pl1 =.old renames it foo.old.']);
  info(['copy','cp'],'09/06/77',['','Syntax:  cp path1 {path2 ... pathN {pathN+1}}','','Function:  copies segments.  If the second name is omitted, the copy goes in the working directory under the same name (==).']);
  info(['move','mv'],'09/06/77',['','Syntax:  mv path1 {path2}','','Function:  moves a segment to another directory, or to another name.']);
  info(['add_name','an'],'01/27/76',['','Syntax:  an path names','','Function:  adds alternate names to an entry.  Every name leads to the same entry.']);
  info(['delete_name','dn'],'01/27/76',['','Syntax:  dn paths','','Function:  deletes names from entries.  The last name of an entry cannot be deleted; delete the entry instead.']);
  info(['status','st'],'03/19/79',['','Syntax:  st {path}','','Function:  prints the names, type, dates, length and your access to an entry.']);
  info(['list_acl','la'],'05/30/78',['','Syntax:  la {path} {User_ids}','','Function:  lists the access control list of an entry: the modes each Person_id.Project_id.tag has.  The default is the working directory.']);
  info(['set_acl','sa'],'05/30/78',['','Syntax:  sa path mode1 {User_id1 ... modeN User_idN}','','Function:  adds or changes ACL entries.  Modes for a segment are combinations of r, e and w; for a directory, of s, m and a; "null" or "n" gives no access.',
    '','Examples:','   sa notes r *.*.*','gives everyone read access to notes.']);
  info(['delete_acl','da'],'05/30/78',['','Syntax:  da {path} {User_ids}','','Function:  removes entries from an access control list.']);
  info(['who'],'08/14/79',['','Syntax:  who {User_ids} {-control_args}','','Function:  lists the users who are logged in, after a heading with the system load.','','Control arguments:','-long, -lg','   prints the time of login, the terminal and the load of each user.','-brief, -bf','   omits the heading.']);
  info(['qedx','qx'],'11/02/79',['','Syntax:  qx {macro_path} {args}','','Function:  edits text in a buffer.  There is no prompt.  Requests are one letter, after zero, one or two addresses.',
    '','Requests:','a   append lines after the addressed line (input mode)','i   insert lines before it','c   change the addressed lines','\\f  ends input mode','d   delete','p   print','=   print the line number','s/old/new/  substitute, on every match in the line','g/re/p  global: p, d, = or s on each line that matches (v: that does not)','r path   read a segment into the buffer','w {path}  write the buffer to a segment','e command_line   execute a command','x   show the buffer','q   quit (what is not written is lost)',
    '','Addresses:  a number, $ (the last line), . (the current line), /regular expression/, and +n or -n from them; two addresses separated by a comma give a range, as 1,$p.',
    '','Notes:  In a regular expression, . matches any character, * repeats the one before it, ^ and $ are the ends of the line, and \\c takes the next character as it is.']);
  info(['exec_com','ec'],'06/21/79',['','Syntax:  ec path {args}','','Function:  executes the command lines in the segment path.ec.  &1 to &9 are replaced by the arguments, &n by how many there are.',
    '','Statements:','&command_line off   stops the command lines from being printed','&print TEXT          prints TEXT','&if [active_function] &then LINE &else LINE','&label NAME and &goto NAME','&quit                ends the exec_com',
    '','Notes:  start_up.ec in your home directory is executed when you log in, with the arguments login (or new_proc) and interactive.']);
  info(['read_mail','rdm'],'03/04/80',['','Syntax:  rdm {-control_args}','','Function:  reads the mail in your mailbox.  It prints how many messages there are, then asks for requests.',
    '','Requests:','list, ls       summarizes the messages','print, pr {N}  prints message N (the current one)','next, n        prints the next message','delete, dl {N} deletes a message','quit, q        returns to command level','?              lists the requests',
    '','Control arguments:','-list, -ls','   lists the messages first.','-request STR, -rq STR','   executes STR as a request line first.']);
  info(['print_mail','prm'],'03/04/80',['','Syntax:  prm','','Function:  prints your mail, a message at a time, and asks whether to delete each one.  Answer yes, no, reprint, quit or abort.']);
  info(['send_mail','sdm'],'03/04/80',['','Syntax:  sdm addresses {-subject STR}','','Function:  sends mail.  It asks for a subject, then the message: end it with a line holding only a period.  An address is Person_id.Project_id.']);
  info(['send_message','sm'],'10/23/78',['','Syntax:  sm Person_id.Project_id {message}','','Function:  sends a message to a user who is logged in.  Without the message, it enters input mode: each line goes as it is typed, and a line holding only a period ends it.']);
  info(['accept_messages','am'],'10/23/78',['','Syntax:  am {-print}','','Function:  lets messages from send_message be printed at your terminal as they come.  -print prints those that came while you were away.']);
  info(['logout'],'01/27/76',['','Syntax:  logout {-brief} {-hold}','','Function:  ends your session and prints the CPU time and cost of it.','','Control arguments:','-brief, -bf','   prints nothing.','-hold, -hd','   keeps the terminal connected, for another login.']);
  info(['release','rl'],'01/27/76',['','Syntax:  rl {-all}','','Function:  discards the computation interrupted by QUIT and goes back one command level, or to level 1 with -all.']);
  info(['start','sr'],'01/27/76',['','Syntax:  sr','','Function:  goes back to the computation interrupted by QUIT.']);
  info(['list_help','lh'],'08/07/78',['','Syntax:  lh topics {-all}','','Function:  lists the info segments whose names contain a topic.']);
  info(['have_mail'],'02/06/80',['','Syntax as a command:  have_mail','','Syntax as an active function:  [have_mail]','','Function:  prints "You have mail." if there is mail in your mailbox, otherwise "No mail."; as an active function, returns true or false.']);
  info(['date','time','date_time'],'01/27/76',['','Syntax as a command:  date','','Syntax as an active function:  [date]','','Function:  prints or returns the date, MM/DD/YY.  time gives HH:MM, and date_time both.']);
  info(['string'],'01/27/76',['','Syntax as a command:  string {strings}','','Function:  prints its arguments, separated by spaces.  string [wd] prints the working directory, and [hd] the home directory.']);
  info(['pathname.gi'],'01/27/76',['','Pathnames:  An absolute pathname starts with >, the root, and names each directory down to the entry, separated by >: >udd>Guest>Guest>notes.  A relative pathname starts from the working directory; each leading < goes up one directory.',
    '','Short names:  >udd is >user_dir_dir, >sss is >system_library_standard, and >doc>info holds these info segments.']);
  info(['star_convention.gi'],'01/27/76',['','Star names:  In a star name, * matches any characters within one component of a name (the parts between periods), ** matches any number of components, and ? matches one character.  ls *.ec lists every exec_com.']);
  info(['equal_convention.gi'],'01/27/76',['','Equal names:  In the second name given to rename, copy or move, = stands for the matching component of the first name, and == for the whole name.']);
  Object.keys(TERMS).forEach(function(k){
    if(!P.has(P.cmds,k))return;
    info([k],'06/02/80',['','Syntax:  '+k+(k==='sound'?' on|off':k==='effects'?' {auto|full|lite}':k==='connect'?' {machine}':''),'','Function:  '+TERMS[k]+'.','','Notes:  The terminal answers this, not Multics.']);
  });
});
