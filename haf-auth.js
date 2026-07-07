/* HAF Universal Auth — single source of truth for all HAF portals
   Individual username: [initials][last4phone][last2birthyear]
   Business username:   [abbrev][last4phone]
*/
(function(w){
  w.HAF_AUTH={
    users:{
      /* ── Individual drivers ─────────────────── */
      'JW012393':{pass:'Driver1!',role:'Driver',name:'James Williams',type:'Standard Driver',ref:'CP-104823',phone:'07700900123',pc4:'1ab',portals:['cleverpay','knect','plna']},
      'PP045696':{pass:'Driver1!',role:'Driver',name:'Priya Patel',type:'PLNA Driver',ref:'CP-209477',phone:'07700900456',pc4:'1e4p',portals:['cleverpay','plna']},
      'MT078990':{pass:'Driver1!',role:'Driver',name:'Marcus Thompson',type:'KNECT Driver',ref:'CP-318561',phone:'07700900789',pc4:'1m1a',portals:['cleverpay','knect']},
      /* ── Admin ──────────────────────────────── */
      'BF638793':{pass:'Harps0641!',role:'Admin',name:'Harpreet S.',portals:['knect','plna','cleverpay']},
      /* ── Business accounts ───────────────────── */
      'APEX0001':{pass:'biz123',role:'Business',name:'Apex Retail Ltd',portals:['knect']},
      'TFF5678':{pass:'freight123',role:'FreightForwarder',name:'Translink FFW',portals:['knect']}
    },
    validate:function(u,p){
      var r=this.users[(u||'').trim().toUpperCase()];
      return(r&&r.pass===p)?r:null;
    },
    /* Generate individual username from name, phone, birth year */
    gen:function(first,last,phone,yr){
      return((first[0]||'')+(last[0]||'')).toUpperCase()+(phone||'').replace(/\D/g,'').slice(-4)+String(yr||'').slice(-2);
    },
    /* Generate business username from company name, phone */
    genBiz:function(name,phone){
      return(name||'').replace(/[^a-zA-Z]/g,'').toUpperCase().slice(0,4)+(phone||'').replace(/\D/g,'').slice(-4);
    }
  };
})(window);
