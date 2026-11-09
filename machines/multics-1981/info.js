/* PHOSPHOR-9 terminal: machine "multics-1981", the info segments in >doc>info that help prints, a block at a time.
   Each is the date it was last changed, the names, then paragraphs with a title before the first colon.
   They are written for this terminal, in the shape of the MR8.0 info segments (AG92-03A, CH24-00).
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE. */
Phosphor.setup(function(P){
  'use strict';
  var M=P.multics,DIR='/documentation/info_segments',WHEN=new Date(P.systemDate.getTime()-86400000*30);
  function info(names,date,L){
    var head=date+'  '+names.join(', ');
    var n=P.put(DIR+'/'+names[0]+'.info','f',{owner:'Initializer',date:WHEN,body:typeof L==='function'?function(){return [head].concat(L())}:[head].concat(L),acl:[['r','*.*.*']]});
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
    '-brief, -bf','   prints only the names column and the columns asked for.  With -total, prints the totals on a single line.','-no_header, -nhe','   omits all heading lines, and the blank lines.','-name, -nm','   prints the names column, giving the primary name and any additional names of each entry.',
    '-mode, -md','   prints the access-mode column.','-length, -ln','   prints the length column.','-date_time_modified, -dtm','   prints the date and time each entry was last modified, before the other columns.',
    '','   The default columns are the access mode, the length and the names.  When -brief, -mode, -length or -name is given, only the names column and those asked for are printed.',
    '','Notes:  The modes of a segment are r (read), e (execute) and w (write); of a directory, s (status), m (modify) and a (append).  Entries are listed most recently modified first.']);
  info(['print','pr'],'01/27/76',['','Syntax:  pr path {begin_line} {end_line}','','Function:  prints an ASCII segment.','',
    'Arguments:','path','   is the pathname of the segment.','begin_line','   is the number of the first line to be printed.  The default is 1.','end_line','   is the number of the last line to be printed.  The default is the end of the segment.',
    '','Notes:  A heading with the entryname and the date is printed first, unless begin_line or end_line is given.']);
  info(['print_wdir','pwd'],'01/27/76',['','Syntax:  pwd','','Function:  prints the pathname of the working directory.']);
  info(['change_wdir','cwd'],'01/27/76',['','Syntax:  cwd {path}','','Function:  changes the working directory.','','Arguments:','path','   is the new working directory.  If it is omitted, the home directory is used.  A leading < goes up one directory for each <.']);
  info(['create_dir','cd'],'02/11/77',['','Syntax:  cd paths','','Function:  creates directories.  You must have append access on the directory that will contain each one.','','Arguments:','paths','   are the pathnames of the directories to be created.']);
  info(['delete','dl'],'02/11/77',['','Syntax:  dl paths {-control_args}','','Function:  deletes segments.  The star convention is allowed.','','Arguments:','paths','   are the pathnames of segments.  The star convention is allowed.','','Control arguments:','-brief, -bf','   inhibits the printing of an error message if a segment to be deleted is not found.',
    '-force','   deletes the segments whether or not their safety switch is on, without asking.  No segment here has it on.','-long, -lg','   prints a message of the form "Deleted file <entryname>" for each segment deleted.','','Notes:  Use delete_dir (dd) for a directory.']);
  info(['delete_dir','dd'],'02/11/77',['','Syntax:  dd paths {-force}','','Function:  deletes directories and everything in them, after asking.','','Arguments:','paths','   are the pathnames of directories.  The star convention is allowed.','','Control arguments:','-force','   does not ask.']);
  info(['rename','rn'],'01/27/76',['','Syntax:  rn path1 name1 {... pathN nameN}','','Function:  replaces a name of an entry.  The equal convention is allowed: rn foo.pl1 =.old renames it foo.old.','','Arguments:','pathN','   is the pathname of an entry.','nameN','   is the new name that replaces the name pathN was given by.  The equal convention is allowed.']);
  info(['copy','cp'],'09/06/77',['','Syntax:  cp path1 {equal_name1 ... pathN {equal_nameN}}','','Function:  copies segments.  If the second name is omitted, the copy goes in the working directory under the same name (==).',
    '','Arguments:','pathN','   is the pathname of a segment to be copied.','equal_nameN','   is the pathname of the copy.  The equal convention is allowed.  It may be omitted only after the last pathN.']);
  info(['move','mv'],'09/06/77',['','Syntax:  mv path1 {equal_name1 ... pathN {equal_nameN}}','','Function:  moves a segment to another directory, or to another name.',
    '','Arguments:','pathN','   is the pathname of a segment to be moved.','equal_nameN','   is its new pathname.  The equal convention is allowed.  If it is omitted (after the last pathN only), the segment moves to the working directory under the same name.']);
  info(['add_name','an'],'01/27/76',['','Syntax:  an path names','','Function:  adds alternate names to an entry.  Every name leads to the same entry.','','Arguments:','path','   is the pathname of the entry.','names','   are the names to be added.  The equal convention is allowed.']);
  info(['delete_name','dn'],'01/27/76',['','Syntax:  dn paths','','Function:  deletes names from entries.  The last name of an entry cannot be deleted; delete the entry instead.','','Arguments:','paths','   are the names to be deleted, each as the pathname of its entry.']);
  info(['status','st'],'03/19/79',['','Syntax:  st {path}','','Function:  prints the names, type, dates, length and your access to an entry.','','Arguments:','path','   is the pathname of the entry.  The default is the working directory.']);
  info(['list_acl','la'],'05/30/78',['','Syntax:  la {path} {User_ids}','','Function:  lists the access control list of an entry: the modes each Person_id.Project_id.tag has.  The default is the working directory.',
    '','Arguments:','path','   is the pathname of a segment or directory.  The default is the working directory.','User_ids','   are access control names, Person_id.Project_id.tag; only their entries are listed.  Missing components are taken as *.']);
  info(['set_acl','sa'],'05/30/78',['','Syntax:  sa path mode1 {User_id1 ... modeN User_idN}','','Function:  adds or changes ACL entries.  Modes for a segment are combinations of r, e and w; for a directory, of s, m and a; "null" or "n" gives no access.',
    '','Arguments:','path','   is the pathname of a segment or directory.','modeN','   is the mode to be given.','User_idN','   is an access control name, Person_id.Project_id.tag.  The default is your own Person_id.Project_id.*.',
    '','Examples:','   sa notes r *.*.*','gives everyone read access to notes.']);
  info(['delete_acl','da'],'05/30/78',['','Syntax:  da {path} {User_ids}','','Function:  removes entries from an access control list.','','Arguments:','path','   is the pathname of a segment or directory.  If it is omitted, the working directory is assumed.',
    'User_ids','   are the access control names whose entries are deleted.  The default is your own Person_id.Project_id.*.']);
  info(['who'],'08/14/79',['','Syntax:  who {User_ids} {-control_args}','','Function:  lists the users who are logged in, after a heading with the system load.','','Arguments:','User_ids','   Person_id, .Project_id or Person_id.Project_id: lists only those users, without the heading.','','Control arguments:','-long, -lg','   prints the time of login, the terminal and the load of each user.','-brief, -bf','   omits the heading.','-name, -nm','   sorts the output by the name (Person_id) of each user.','-project, -pj','   sorts the output by the Project_id of each user, and by Person_id within a project.','','Notes:  Without -name or -project the users are listed in the order in which they logged in.']);
  info(['qedx','qx'],'11/02/79',['','Syntax:  qx {macro_path}','','Function:  edits text in a buffer.  There is no prompt.  Requests are one letter, after zero, one or two addresses.',
    '','Arguments:','macro_path','   is a segment, macro_path.qedx, whose requests are executed before any are read from the terminal.',
    '','Requests:','a   append lines after the addressed line (input mode)','i   insert lines before it','c   change the addressed lines','\\f  ends input mode','d   delete','p   print','=   print the line number','s/old/new/  substitute, on every match in the line','g/re/p  global: p, d, = or s on each line that matches (v: that does not)','r path   read a segment into the buffer','w {path}  write the buffer to a segment','e command_line   execute a command','x   show the buffer','q   quit (what is not written is lost)',
    '','Addresses:  a number, $ (the last line), . (the current line), /regular expression/, and +n or -n from them; two addresses separated by a comma give a range, as 1,$p.',
    '','Notes:  In a regular expression, . matches any character, * repeats the one before it, ^ and $ are the ends of the line, and \\c takes the next character as it is.']);
  info(['exec_com','ec'],'06/21/79',['','Syntax:  ec path {args}','','Function:  executes the command lines in the segment path.ec.  &1 to &9 are replaced by the arguments, &n by how many there are.',
    '','Arguments:','path','   is the pathname of the exec_com segment; the ec suffix is assumed.','args','   are the arguments, &1 to &9 in it.',
    '','Statements:','&command_line off   stops the command lines from being printed','&print TEXT          prints TEXT','&if [active_function] &then LINE &else LINE','&label NAME and &goto NAME','&quit                ends the exec_com',
    '','Notes:  start_up.ec in your home directory is executed when you log in, with the arguments login (or new_proc) and interactive.']);
  info(['read_mail','rdm'],'03/04/80',['','Syntax:  rdm {-control_args}','','Function:  reads the mail in your mailbox.  It prints how many messages there are, then asks for requests.',
    '','Requests:','list, ls       summarizes the messages','print, pr {N}  prints message N (the current one)','next, n        prints the next message','previous       prints the previous message','delete, dl {N} deletes a message','retrieve, rt {N} undeletes a message','execute, e LINE  executes LINE as a command line (.. LINE as well)','.              identifies read_mail','quit, q        returns to command level','?              lists the requests',
    '','Control arguments:','-brief, -bf','   shortens informative messages printed by read_mail.','-list, -ls','   prints a summary of the messages before entering the request loop.','-print, -pr','   prints the messages before entering the request loop.',
    '-request STR, -rq STR','   executes STR as a request line before entering the request loop.','-quit','   exits after performing any operations specified by control arguments.']);
  info(['print_mail','prm'],'03/04/80',['','Syntax:  prm','','Function:  prints your mail, a message at a time, and asks whether to delete each one.  Answer yes, no, reprint, quit or abort.']);
  info(['send_mail','sdm'],'03/04/80',['','Syntax:  sdm addresses {-control_args}','','Function:  sends mail.  It asks for a subject, then the message: end it with a line holding only a period.',
    '','Arguments:','addresses','   are the recipients, each Person_id.Project_id, or a Person_id on your own project.',
    '','Control arguments:','-subject STR, -sj STR','   places STR in the Subject field of the header.  If it is not given, you are asked for a subject.','-brief, -bf','   suppresses the message "Mail delivered to ADDRESS."']);
  info(['mail','ml'],'03/04/80',['','Syntax:  ml {addresses} {-control_args}','','Function:  with no addresses, prints your mail as print_mail does; with addresses, sends mail as send_mail does.',
    '','Arguments:','addresses','   are the recipients, each Person_id.Project_id.',
    '','Control arguments:','-subject STR, -sj STR','   places STR in the Subject field of the header.','-brief, -bf','   with addresses, suppresses the message "Mail delivered to ADDRESS."  Without, prints only how many messages there are, and nothing if there are none.']);
  info(['send_message','sm'],'10/23/78',['','Syntax:  sm Person_id.Project_id {message}','','Function:  sends a message to a user who is logged in.  Without the message, it enters input mode: each line goes as it is typed, and a line holding only a period ends it.','','Arguments:','Person_id.Project_id','   is the user the message goes to.','message','   is the text of the message.']);
  info(['accept_messages','am'],'10/23/78',['','Syntax:  am {-control_args}','','Function:  lets messages from send_message be printed at your terminal as they come.','','Control arguments:','-print, -pr','   prints all messages that were received since the last time you were accepting messages.']);
  info(['defer_messages','dm'],'10/23/78',['','Syntax:  dm','','Function:  prevents messages sent by send_message from printing on your terminal.  They are saved in your mailbox instead; print_messages prints them.']);
  info(['print_messages','pm'],'10/23/78',['','Syntax:  pm','','Function:  prints any messages that were received, and saved in your mailbox, while you were not accepting messages.']);
  info(['logout'],'01/27/76',['','Syntax:  logout {-brief} {-hold}','','Function:  ends your session and prints the CPU time and cost of it.','','Control arguments:','-brief, -bf','   prints nothing.','-hold, -hd','   keeps the terminal connected, for another login.']);
  info(['release','rl'],'01/27/76',['','Syntax:  rl {-control_arg}','','Function:  discards the computation interrupted by QUIT and goes back one command level.','','Control arguments:','-all, -a','   releases every computation interrupted by QUIT, back to command level 1.']);
  info(['start','sr'],'01/27/76',['','Syntax:  sr','','Function:  goes back to the computation interrupted by QUIT.']);
  info(['list_help','lh'],'08/07/78',['','Syntax:  lh topics {-control_args}','','Function:  lists the info segments whose names contain a topic.','','Arguments:','topics','   are topics to be searched for.',
    '','Control arguments:','-all, -a','   displays the names of all info segments.']);
  info(['help'],'08/07/78',['','Syntax:  help {info_name} {-control_args}','','Function:  prints an info segment, a block at a time, asking "More help?" before each further block.  Answer yes, skip, rest, no or quit.',
    '','Arguments:','info_name','   is the name of the info segment; the info suffix is assumed.  The default is help_system.',
    '','Control arguments:','-all, -a','   prints the entire info without asking questions.','-brief, -bf','   prints a brief summary: the Syntax section, without asking questions.']);
  info(['print_motd','pmotd'],'02/06/80',['','Syntax:  pmotd','','Function:  prints the message of the day, if you have not seen it since you logged in.  It is intended to be used in a start_up.ec segment.']);
  info(['where','wh'],'02/06/80',['','Syntax:  wh names','','Function:  uses the standard search rules to search for a command, and prints the pathname of the segment it is in.','','Arguments:','names','   are command names.  The star convention is not allowed.']);
  info(['working_dir','wd'],'01/27/76',['','Syntax as a command:  wd','','Syntax as an active function:  [wd]','','Function:  returns the pathname of the working directory.']);
  info(['home_dir','hd'],'01/27/76',['','Syntax as a command:  hd','','Syntax as an active function:  [hd]','','Function:  returns the pathname of your home directory (>user_dir_dir>Project_id>Person_id).']);
  info(['process_dir','pd'],'01/27/76',['','Syntax as a command:  pd','','Syntax as an active function:  [pd]','','Function:  returns the pathname of the process directory of your process.']);
  info(['user'],'03/19/79',['','Syntax as a command:  user key','','Syntax as an active function:  [user key]','','Function:  returns one of your process\'s parameters.',
    '','Keys:','name','   your Person_id.','project','   your Project_id.','login_date, login_time','   the date and time you logged in.','term_type, term_id','   the type and identifier of your terminal.',
    'process_type','   interactive or absentee.','anonymous, absentee, brief_bit','   true or false.','preemption_time','   the time until which you are protected from preemption.']);
  info(['program_interrupt','pi'],'01/27/76',['','Syntax:  pi','','Function:  reenters an interactive program, such as qedx, at a known place after it was interrupted by QUIT.']);
  info(['ready','rdy'],'01/27/76',['','Syntax:  rdy','','Function:  types out an up-to-date ready message: the time of day, the CPU time and page faults used since the last one, and the command level if it is not 1.']);
  info(['ready_off','rdf'],'01/27/76',['','Syntax:  rdf','','Function:  turns off the ready message typed after each command line, until a ready_on command is given.']);
  info(['ready_on','rdn'],'01/27/76',['','Syntax:  rdn','','Function:  causes a ready message to be typed after each command line has been processed.']);
  info(['new_proc'],'01/27/76',['','Syntax:  new_proc','','Function:  destroys your process and creates a new one, as at login: the working directory goes back to the home directory and start_up.ec is executed with the argument new_proc.']);
  info(['login','l'],'01/27/76',['','Syntax:  login Person_id {Project_id} {-control_args}','','Function:  typed before you are logged in, it asks for your password and starts a session.',
    '','Arguments:','Person_id','   is your registered personal identifier.  Person_id.Project_id may be given as one argument.','Project_id','   is your project.  The default is the first project you are registered on.',
    '','Control arguments:','-brief, -bf','   suppresses messages associated with a successful login, and the message of the day.','-change_password, -cpw','   changes your password; you are asked for the new one twice.',
    '-no_start_up, -ns','   does not execute your start_up.ec segment.','-project Project_id, -pj Project_id','   logs in on the project Project_id.']);
  info(['have_mail'],'02/06/80',['','Syntax as a command:  have_mail','','Syntax as an active function:  [have_mail]','','Function:  prints "You have mail." if there is mail in your mailbox, otherwise "No mail."; as an active function, returns true or false.']);
  info(['date','time','date_time','day_name','month_name','year'],'01/27/76',['','Syntax as a command:  date','','Syntax as an active function:  [date]','','Function:  prints or returns the date, MM/DD/YY.  time gives HH:MM, and date_time both.  day_name gives the day of the week, month_name the month, and year the year.']);
  info(['string'],'01/27/76',['','Syntax as a command:  string {strings}','','Function:  prints its arguments, separated by spaces.  string [wd] prints the working directory, and [hd] the home directory.']);
  info(['pathname.gi'],'01/27/76',['','Pathnames:  An absolute pathname starts with >, the root, and names each directory down to the entry, separated by >: >udd>Guest>Guest>notes.  A relative pathname starts from the working directory; each leading < goes up one directory.',
    '','Short names:  >udd is >user_dir_dir, >sss is >system_library_standard, and >doc>info holds these info segments.']);
  info(['star_convention.gi'],'01/27/76',['','Star names:  In a star name, * matches any characters within one component of a name (the parts between periods), ** matches any number of components, and ? matches one character.  ls *.ec lists every exec_com.']);
  info(['equal_convention.gi'],'01/27/76',['','Equal names:  In the second name given to rename, copy or move, = stands for the matching component of the first name, and == for the whole name.']);
  info(['multics'],'09/15/78',['','Multics:  the Multiplexed Information and Computing Service.  Project MAC at MIT, Bell Telephone Laboratories and General Electric began it in 1965.  Bell Labs left in 1969; Honeywell, which bought General Electric\'s computer business in 1970, sells it now.',
    '','Features:  a single-level store, where a segment is both memory and file; dynamic linking; rings of protection; an access control list on every entry; and a supervisor written almost entirely in PL/I.',
    '','Notes:  The people Bell Labs took home wrote a smaller system on a PDP-7, and named it after this one, more or less.']);
  Object.keys(TERMS).forEach(function(k){
    if(!P.has(P.cmds,k))return;
    info([k],'06/02/80',['','Syntax:  '+k+(k==='sound'?' on|off':k==='effects'?' {auto|full|lite}':k==='connect'?' {machine}':''),'','Function:  '+TERMS[k]+'.','','Notes:  The terminal answers this, not Multics.']);
  });
});
