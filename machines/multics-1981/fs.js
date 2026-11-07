/* PHOSPHOR-9 terminal: machine "multics-1981", the storage system hierarchy. The engine's /a/b is Multics's >a>b.
   A node's names are its primary name and any added names (P.multics.names puts it under each); acl is a list of
   [modes, access name]; with none, the modes follow from where it is (see access in commands.js).
   The directories, the bound segments each command lives in and the names in >sc1 were taken from MR12.8 under the
   DPS8M simulator (where, ls) and kept where the MR8.0 manuals agree; bound_mail_ is a stand-in for the 1980 mail
   commands' segment, which MR12 replaced. The lengths are round numbers of records.
   Copyright (C) 2026 Gaijin Systems. GNU AGPL v3 or later; see LICENSE. */
Phosphor.setup(function(P){
  'use strict';
  var M=P.multics,SD=P.systemDate,SYS={owner:'Initializer',date:SD};
  function d(p,names,o){var n=P.put(p,'d',Object.assign({},SYS,o||{}));M.names(n,names);return n}
  function seg(p,body,o){var n=P.put(p,'f',Object.assign({},SYS,{body:body},o||{}));M.names(n,(o||{}).also);return n}
  function obj(p,recs,also,o){var n=P.put(p,'f',Object.assign({},SYS,{bin:true,recs:recs},o||{}));M.names(n,also);return n}
  var ALL='*.*.*',ADMIN='*.SysAdmin.*',DAEMON='*.SysDaemon.*';

  d('/user_dir_dir',['udd'],{acl:[['sma',ADMIN],['sma',DAEMON],['s',ALL]]});
  d('/system_library_standard',['sss'],{acl:[['sma',ADMIN],['s',ALL]]});
  d('/system_library_1',['sl1'],{acl:[['sma',ADMIN],['s',ALL]]});
  d('/system_library_tools',['tools'],{acl:[['sma',ADMIN],['s',ALL]]});
  d('/system_library_unbundled',['unb'],{acl:[['sma',ADMIN],['s',ALL]]});
  d('/system_library_obsolete',['obs'],{acl:[['sma',ADMIN],['s',ALL]]});
  d('/documentation',['doc'],{acl:[['sma',ADMIN],['s',ALL]]});
  d('/documentation/info_segments',['info'],{acl:[['sma',ADMIN],['s',ALL]]});
  d('/system_control_1',['sc1'],{acl:[['sma',ADMIN],['sma',DAEMON]]});
  d('/daemon_dir_dir',['ddd'],{acl:[['sma',DAEMON],['s',ADMIN]]});
  d('/process_dir_dir',['pdd'],{acl:[['sma',DAEMON],['s',ALL]]});
  d('/library_dir_dir',['ldd'],{acl:[['sma',ADMIN],['s',ALL]]});

  /* the libraries: bound segments, each with the names of the commands inside it */
  var RE=[['re',ALL]];
  [['bound_command_env_',38,['command_processor_','release','rl','start','sr','new_proc','ready','rdy','ready_on','rdn','ready_off','rdf']],
   ['bound_fscom1_',22,['list','ls','delete','dl','delete_dir','dd','rename','rn','add_name','an','delete_name','dn','create_dir','cd','print','pr',
     'print_wdir','pwd','change_wdir','cwd','working_dir','wd','home_dir','hd','status','st']],
   ['bound_fscom2_',17,['copy','cp','move','mv','list_acl','la','set_acl','sa','delete_acl','da']],
   ['bound_exec_com_',6,['exec_com','ec']],
   ['bound_help_',9,['help','list_help','lh']],
   ['bound_info_rtns_',3,['who','print_motd','pmotd']],
   ['bound_mail_',26,['read_mail','rdm','send_mail','sdm','print_mail','prm','mail','have_mail']],
   ['bound_msg_facility_',11,['send_message','sm','accept_messages','am','defer_messages','dm','print_messages','pm']],
   ['bound_full_cp_',19,['string','equal','not','date','time','date_time','user','exists','directory','entry','path','plus']],
   ['bound_pl1_',140,['pl1']],['bound_runoff_',31,['runoff','rf']]]
    .forEach(function(b){obj('/system_library_standard/'+b[0],b[1],b[2],{acl:RE})});
  obj('/system_library_1/bound_qedx_',14,['qedx','qx'],{acl:RE});
  obj('/system_library_unbundled/bound_fort_',96,['fortran','ft'],{acl:RE});
  obj('/system_library_unbundled/bound_emacs_full_',210,['emacs'],{acl:RE});
  obj('/system_library_tools/bound_admin_tools_',41,['new_user','nu','new_proj'],{acl:[['re',ADMIN]]});

  /* >sc1: the answering service's own, the message of the day that print_motd reads, and the help it gives before login */
  seg('/system_control_1/message_of_the_day',function(){return M.motd()},{acl:[['rw',ADMIN],['r',ALL]]});
  seg('/system_control_1/login_help',function(){return M.loginHelp()},{acl:[['rw',ADMIN],['r',ALL]]});
  ['installation_parms','sat','pnt','cdt','ttt','mgt','whotab','answer_table','absentee_user_table','daemon_user_table'].forEach(function(x){obj('/system_control_1/'+x,x==='ttt'?42:x==='cdt'?5:1,null)});
  seg('/system_control_1/admin.ec',['&command_line off','& start_up for the operators at the console','set_proc_required 0','&quit'],{acl:[['rw',ADMIN]]});
  seg('/system_control_1/system_start_up.ec',['&command_line off','& the Initializer runs this when the answering service starts','&quit'],{acl:[['rw',ADMIN]]});

  /* the projects under >udd, each with its people. Guest's home, made by the engine, gets the site's segments */
  d('/user_dir_dir/SysAdmin',null,{acl:[['sma',ADMIN],['s',ALL]]});
  d('/user_dir_dir/SysAdmin/Repair',null,{acl:[['sma','Repair.SysAdmin.*'],['sma',DAEMON]],owner:'Repair'});
  seg('/user_dir_dir/SysAdmin/Repair/salvage_notes',['after a crash: login Repair SysAdmin, then salvage the root first.','the password is in the operators\' book; do not leave it lying about.'],{acl:[['rw','Repair.SysAdmin.*']],owner:'Repair'});
  d('/user_dir_dir/SysAdmin/lib',null,{acl:[['sma',ADMIN],['s',ALL]]});
  /* the careless part: the console's after-crash exec_com, readable by anyone, with Repair's password in it */
  if(P.profile.rootPassword)seg('/user_dir_dir/SysAdmin/lib/crash_recovery.ec',['&command_line off','& run from the console after a crash, while the answering service is down',
    '& (Repair is the only account that works before the SAT is reloaded)','&print Log in as Repair.SysAdmin, password '+P.profile.rootPassword+', and type:',
    '&print     ec >udd>SysAdmin>lib>crash_recovery salvage','&if [equal &1 salvage] &then &goto salvage','&quit','&label salvage','&print Salvaging >udd ...','&quit'],
    {acl:[['rew',ADMIN],['r',ALL]],date:new Date(SD.getTime()+86400000*140)});
  d('/user_dir_dir/SysDaemon',null,{acl:[['sma',DAEMON],['s',ALL]]});
  d('/user_dir_dir/Guest',null,{acl:[['sma',ADMIN],['s',ALL]]});
  ['Physics','Library','Accounting','Chem'].forEach(function(p){d('/user_dir_dir/'+p,null,{acl:[['sma',ADMIN],['s',ALL]]})});
  M.ownerDir();
});
