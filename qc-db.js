/* QuickCart database/session compatibility layer.
   Tenant data is isolated at /users/{username}; the platform admin retains root paths. */
(function (w) {
  'use strict';
  var MAIN = 'https://sneakerai-c96f0-default-rtdb.firebaseio.com';
  function read(key, fallback) { try { var v=localStorage.getItem(key); return v==null?fallback:v; } catch(e){return fallback;} }
  function clean(v){ return String(v||'').trim().replace(/\/+$/,''); }
  function username(){ return String(read('qc_logged_user','')||'').trim().toLowerCase(); }
  function session(){ try{return JSON.parse(read('qc_session','null')||'null')||{};}catch(e){return{};} }
  function isStaff(){ return read('qc_is_staff','0')==='1'; }
  function owner(){
    var s=session();
    return String(s.ownerUsername||s.owner||s.companyUsername||read('qc_staff_owner','')||(!isStaff()?username():'')).trim().toLowerCase();
  }
  function baseFor(user){
    user=String(user||'').trim().toLowerCase();
    if(!user || user==='admin') return MAIN;
    var s=session(), own=(s.username||s.ownerUsername||'').toLowerCase();
    var dbUrl=(own===user && s.dbUrl)?clean(s.dbUrl):'';
    if(!dbUrl){
      try {
        var cached=JSON.parse(read('qc_user_record','null')||'null');
        if(cached && String(cached.username||'').toLowerCase()===user && cached.dbUrl) dbUrl=clean(cached.dbUrl);
      }catch(e){}
    }
    return dbUrl || (MAIN+'/users/'+encodeURIComponent(user));
  }
  function base(){
    var u=owner()||username();
    return (!u||u==='admin')?MAIN:baseFor(u);
  }
  function setSession(rec){
    rec=rec||{};
    try{localStorage.setItem('qc_session',JSON.stringify(rec));}catch(e){}
    if(rec.username) localStorage.setItem('qc_logged_user',rec.username);
    if(rec.plan) localStorage.setItem('qc_sub_plan',rec.plan);
    if(rec.email) localStorage.setItem('qc_sub_email',rec.email);
    if(rec.dbUrl) localStorage.setItem('qc_db_url',rec.dbUrl);
  }
  function clearSession(){
    ['qc_session','qc_user_record','qc_is_staff','qc_staff_owner','qc_staff_role','qc_db_url'].forEach(function(k){try{localStorage.removeItem(k);}catch(e){}});
  }
  async function json(url,opts){
    var r=await fetch(url,opts||{});
    if(!r.ok) throw new Error('Database request failed ('+r.status+')');
    return r.json();
  }
  async function staffLogin(company,user,pass){
    try{
      var companyKey=String(company||'').trim().toLowerCase();
      var all=await json(MAIN+'/users.json');
      var entries=Object.keys(all||{}).map(function(k){return {key:k,rec:all[k]};});
      var ownerEntry=entries.find(function(x){var r=x.rec||{};return !r.isStaff&&(String(r.email||'').toLowerCase()===companyKey||String(r.username||'').toLowerCase()===companyKey);});
      if(!ownerEntry) return {ok:false,msg:'Company account not found.'};
      var ownerName=String(ownerEntry.rec.username||'').toLowerCase();
      var staffEntry=entries.find(function(x){var r=x.rec||{};return r.isStaff&&String(r.owner||'').toLowerCase()===ownerName&&String(r.username||'').toLowerCase()===String(user||'').trim().toLowerCase();});
      var rec=staffEntry&&staffEntry.rec;
      if(!rec || rec.status==='inactive' || rec.password!==btoa(String(pass||''))) return {ok:false,msg:'Invalid staff login details.'};
      return {ok:true,rec:rec,owner:ownerEntry.rec,ownerUsername:ownerName};
    }catch(e){return {ok:false,msg:'Could not verify staff login. Check your connection.'};}
  }
  function finishStaffLogin(res){
    if(!res||!res.ok)return;
    localStorage.setItem('qc_is_staff','1');
    localStorage.setItem('qc_staff_owner',res.ownerUsername||'');
    localStorage.setItem('qc_logged_user',res.ownerUsername||'');
    localStorage.setItem('qc_staff_role',res.rec.role||'staff');
    setSession(Object.assign({},res.rec,{username:res.ownerUsername,ownerUsername:res.ownerUsername,dbUrl:res.owner&&res.owner.dbUrl||res.rec.dbUrl||'',isStaff:true,role:res.rec.role||'staff'}));
  }
  async function provision(url,user){
    url=clean(url);
    if(!/^https:\/\/[a-z0-9.-]+(?:\.firebasedatabase\.app|\.firebaseio\.com)$/i.test(url)) return {ok:false,msg:'Enter a valid Firebase Realtime Database URL.'};
    try{
      var r=await fetch(url+'/.json',{method:'GET'});
      if(!r.ok)return {ok:false,msg:'Database is not reachable or rules deny access.'};
      return {ok:true,url:url,msg:'Database connection verified.'};
    }catch(e){return {ok:false,msg:'Could not reach this database.'};}
  }
  w.QCDB={MAIN:MAIN,base:base,baseFor:baseFor,owner:owner,isStaff:isStaff,
    setSession:setSession,clearSession:clearSession,clean:clean,
    staffLogin:staffLogin,finishStaffLogin:finishStaffLogin,provision:provision,
    can:function(module){
      if(!isStaff())return true;
      var s=session(),mods=Array.isArray(s.modules)?s.modules:[];
      return mods.indexOf(module)>-1;
    }};
})(window);
