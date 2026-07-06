
// ── Edit modal ───────────────────────────────────────────────
function openEdit(id){
  var d=DRIVERS.find(function(x){return x.id===id;});
  if(!d) return;
  document.getElementById('edit-modal-title').textContent='Edit: '+d.nm;
  var req=getRequiredDocs(d);
  var docFields=req.map(function(r){
    var doc=d[r.k]||{s:'missing',x:null};
    return '<div class="frow">'+
      '<div class="fg"><label>'+DOC_LABELS[r.k]+' — Status</label>'+
        '<select id="ef-'+r.k+'-s">'+
          ['ok','pending','missing','expired'].map(function(o){return '<option value="'+o+'"'+(doc.s===o?' selected':'')+'>'+o+'</option>';}).join('')+
        '</select>'+
      '</div>'+
      '<div class="fg"><label>Expiry date (if applicable)</label>'+
        '<input type="date" id="ef-'+r.k+'-x" value="'+(doc.x||'')+'">'+
      '</div>'+
    '</div>';
  }).join('');
  document.getElementById('edit-modal-body').innerHTML=
    '<input type="hidden" id="ef-id" value="'+id+'">'+
    '<div class="frow">'+
      '<div class="fg"><label>RAG status</label><select id="ef-rag">'+
        ['G','A','R'].map(function(o){return '<option value="'+o+'"'+(d.rag===o?' selected':'')+'>'+{G:'Green',A:'Amber',R:'Red'}[o]+'</option>';}).join('')+
      '</select></div>'+
      '<div class="fg"><label>Compliance status</label><select id="ef-cs">'+
        ['approved','pending','blocked'].map(function(o){return '<option value="'+o+'"'+(d.cs===o?' selected':'')+'>'+o+'</option>';}).join('')+
      '</select></div>'+
    '</div>'+
    '<div class="frow">'+
      '<div class="fg"><label>PLNA status</label><select id="ef-plna">'+
        ['active','limited','blocked'].map(function(o){return '<option value="'+o+'"'+(d.plna===o?' selected':'')+'>'+o+'</option>';}).join('')+
      '</select></div>'+
      '<div class="fg"><label>KNECT status</label><select id="ef-knect">'+
        ['eligible','limited','not eligible'].map(function(o){return '<option value="'+o+'"'+(d.knect===o?' selected':'')+'>'+o+'</option>';}).join('')+
      '</select></div>'+
    '</div>'+
    docFields+
    '<div class="frow full"><div class="fg"><label>Note</label><textarea id="ef-note">'+d.note+'</textarea></div></div>'+
    '<div class="macts">'+
      '<button class="btn btn-ghost" onclick="closeModal(\'edit-modal\')">Cancel</button>'+
      '<button class="btn btn-clever" onclick="saveEdit()">Save changes</button>'+
    '</div>';
  document.getElementById('edit-modal').classList.add('open');
}

function saveEdit(){
  var id=document.getElementById('ef-id').value;
  var d=DRIVERS.find(function(x){return x.id===id;});
  if(!d) return;
  var oldRag=d.rag;
  d.rag=document.getElementById('ef-rag').value;
  d.cs=document.getElementById('ef-cs').value;
  d.plna=document.getElementById('ef-plna').value;
  d.knect=document.getElementById('ef-knect').value;
  d.note=document.getElementById('ef-note').value;
  d.lr='2026-07-06';
  var req=getRequiredDocs(d);
  req.forEach(function(r){
    var s=document.getElementById('ef-'+r.k+'-s');
    var x=document.getElementById('ef-'+r.k+'-x');
    if(s) d[r.k]={s:s.value,x:x?x.value||null:null};
  });
  if(d.rag!==oldRag){
    d.audit.push({dt:'2026-07-06',act:'RAG updated',by:SESSION.nm,prev:oldRag,next:d.rag,note:'Manual compliance update'});
  }
  closeModal('edit-modal');
  if(driverFrom===null) showPage(curPage);
  else showDriver(id,driverFrom);
}

function blockDriver(id){
  var d=DRIVERS.find(function(x){return x.id===id;});
  if(!d) return;
  d.rb=true;d.rag='R';d.plna='blocked';d.knect='not eligible';d.cs='blocked';
  d.audit.push({dt:'2026-07-06',act:'Driver blocked',by:SESSION.nm,prev:'approved',next:'blocked',note:'Manual block by HAF Admin'});
  showDriver(id,driverFrom||curPage);
}
function unblock(id){
  var d=DRIVERS.find(function(x){return x.id===id;});
  if(!d) return;
  d.rb=false;d.rag='A';d.plna='limited';d.knect='limited';d.cs='pending';
  d.audit.push({dt:'2026-07-06',act:'Driver unblocked',by:SESSION.nm,prev:'blocked',next:'pending',note:'Unblocked by HAF Admin — review required'});
  showDriver(id,driverFrom||curPage);
}

function closeModal(id){document.getElementById(id).classList.remove('open');}

// ── Auth ─────────────────────────────────────────────────────
function doLogin(){
  var u=document.getElementById('lu').value.trim().toUpperCase();
  var p=document.getElementById('lp').value;
  var match=USERS.find(function(x){return x.u===u&&x.p===p;});
  if(!match){document.getElementById('lerr').style.display='block';return;}
  SESSION=match;
  document.getElementById('login-screen').style.display='none';
  document.getElementById('app').style.display='block';
  document.getElementById('s-av').textContent=match.init;
  document.getElementById('s-nm').textContent=match.nm;
  document.getElementById('s-rl').textContent=match.rl==='haf'?'HAF Admin':'CleverPay Team';
  if(match.rl==='haf') document.getElementById('nb-settings').style.display='flex';
  updateBadges();
  showPage('dashboard');
}
function doLogout(){
  SESSION=null;msgView=null;
  document.getElementById('app').style.display='none';
  document.getElementById('login-screen').style.display='flex';
  document.getElementById('lu').value='';
  document.getElementById('lp').value='';
  document.getElementById('lerr').style.display='none';
}
function updateBadges(){
  var pending=DRIVERS.filter(function(d){return d.rag==='A'||d.rag==='R'||d.cs==='pending';}).length;
  var missing=DRIVERS.filter(function(d){return getMissingDocs(d).length>0;}).length;
  var qb=document.getElementById('nb-queue-badge');
  var mb=document.getElementById('nb-missing-badge');
  if(qb) qb.textContent=pending;
  if(mb) mb.textContent=missing;
}
function toggleTheme(){document.body.classList.toggle('dark');}
