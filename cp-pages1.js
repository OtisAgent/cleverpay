
// ── Page renderers ───────────────────────────────────────────
var PAGE_TITLES={
  dashboard:'DASHBOARD',queue:'REVIEW QUEUE',gdrive:'GOOGLE DRIVE INBOX',cpdirect:'CP DIRECT INBOX',
  crm:'DRIVER CRM',missing:'MISSING DOCS',expiry:'EXPIRY &amp; RENEWALS',rag:'RAG BOARD',
  plnasync:'PLNA SYNC',knect:'KNECT ELIGIBILITY',messages:'MESSAGES',audit:'AUDIT TRAIL',
  reports:'REPORTS',docrules:'DOC RULES MANAGER',settings:'SETTINGS'
};
var curPage='dashboard';
var driverFrom=null;

function showPage(id){
  curPage=id;driverFrom=null;
  document.querySelectorAll('.nb').forEach(function(b){b.classList.remove('active');});
  var nb=document.getElementById('nb-'+id);
  if(nb) nb.classList.add('active');
  document.getElementById('tb-ttl').innerHTML='CLEVERPAY &nbsp;·&nbsp; <b>'+PAGE_TITLES[id]+'</b>';
  document.getElementById('tb-act').innerHTML='';
  var c=document.getElementById('canvas');
  var fns={dashboard:renderDashboard,queue:renderQueue,gdrive:renderGDrive,cpdirect:renderCPDirect,
            crm:renderCRM,missing:renderMissing,expiry:renderExpiry,rag:renderRAG,
            plnasync:renderPLNASync,knect:renderKNECT,messages:renderMessages,audit:renderAudit,
            reports:renderReports,docrules:renderDocRules,settings:renderSettings};
  c.innerHTML=fns[id]?fns[id]():'<p>Coming soon.</p>';
}

function showDriver(id,from){
  driverFrom=from||curPage;
  document.getElementById('tb-ttl').innerHTML='CLEVERPAY &nbsp;·&nbsp; <b>DRIVER PROFILE</b>';
  document.getElementById('tb-act').innerHTML='<button class="btn btn-ghost" onclick="showPage(\''+driverFrom+'\')">← Back</button>';
  document.getElementById('canvas').innerHTML=renderDriverProfile(id);
}

// ── Dashboard ────────────────────────────────────────────────
function renderDashboard(){
  var total=DRIVERS.length;
  var greens=DRIVERS.filter(function(d){return d.rag==='G';}).length;
  var ambers=DRIVERS.filter(function(d){return d.rag==='A';}).length;
  var reds=DRIVERS.filter(function(d){return d.rag==='R';}).length;
  var missCount=DRIVERS.filter(function(d){return getMissingDocs(d).length>0;}).length;
  var expCount=DRIVERS.filter(function(d){
    var keys=['lic','ins','git','pli','hva','dbs'];
    return keys.some(function(k){var doc=d[k];return doc&&doc.x&&daysUntil(doc.x)<=60&&daysUntil(doc.x)>=0;});
  }).length;
  var allAudit=[];
  DRIVERS.forEach(function(d){d.audit.forEach(function(a){allAudit.push({driver:d.nm,driverId:d.id,a:a});});});
  allAudit.sort(function(a,b){return b.a.dt.localeCompare(a.a.dt);});
  var feed=allAudit.slice(0,8).map(function(e){
    var dotCls=e.a.next==='approved'?'g':e.a.next==='blocked'?'r':'a';
    return '<div class="fi"><div class="fidot '+dotCls+'"></div><div><div class="fitxt"><strong>'+e.driver+'</strong> — '+e.a.act+'</div><div class="fitm">'+fmt(e.a.dt)+' · by '+e.a.by+(e.a.note?' · '+e.a.note:'')+'</div></div></div>';
  }).join('');
  return '<div class="kgrid">'+
    '<div class="kpi"><div class="kpi-v">'+total+'</div><div class="kpi-l">Total Drivers</div><div class="kpi-ac o"></div></div>'+
    '<div class="kpi"><div class="kpi-v" style="color:var(--green)">'+greens+'</div><div class="kpi-l">Green — Active</div><div class="kpi-ac g"></div></div>'+
    '<div class="kpi"><div class="kpi-v" style="color:var(--amber)">'+ambers+'</div><div class="kpi-l">Amber — Partial</div><div class="kpi-ac a"></div></div>'+
    '<div class="kpi"><div class="kpi-v" style="color:var(--red)">'+reds+'</div><div class="kpi-l">Red — Blocked</div><div class="kpi-ac r"></div></div>'+
    '<div class="kpi"><div class="kpi-v">'+missCount+'</div><div class="kpi-l">Missing Docs</div><div class="kpi-ac r"></div></div>'+
    '<div class="kpi"><div class="kpi-v">'+expCount+'</div><div class="kpi-l">Expiring < 60d</div><div class="kpi-ac a"></div></div>'+
    '</div>'+
    '<div class="card"><div class="card-ttl">Recent Activity</div><div class="feed">'+feed+'</div></div>';
}

// ── Review Queue ─────────────────────────────────────────────
function renderQueue(){
  var pending=DRIVERS.filter(function(d){return d.rag==='A'||d.rag==='R'||d.cs==='pending';});
  var rows=pending.map(function(d){
    var miss=getMissingDocs(d).length;
    return '<tr onclick="showDriver(\''+d.id+'\',\'queue\')">'+
      '<td><strong>'+d.nm+'</strong><br><span style="font-size:10.5px;color:var(--muted)">'+d.id+'</span></td>'+
      '<td>'+ragBadge(d.rag)+'</td>'+
      '<td>'+priorityBadge(d.priority)+'</td>'+
      '<td>'+miss+' missing</td>'+
      '<td>'+fmt(d.submitted)+'</td>'+
      '<td>'+chipS(d.cs)+'</td>'+
      '<td><button class="btn btn-clever" onclick="event.stopPropagation();openEdit(\''+d.id+'\')">Review</button></td>'+
      '</tr>';
  }).join('');
  return '<div class="pact"><h1>Review Queue</h1><div class="pact-r"><span style="font-size:13px;color:var(--muted)">'+pending.length+' drivers awaiting review</span></div></div>'+
    '<div class="twrap"><table class="tbl"><thead><tr><th>Driver</th><th>RAG</th><th>Priority</th><th>Docs</th><th>Submitted</th><th>Status</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>';
}

// ── GDrive Inbox ─────────────────────────────────────────────
function renderGDrive(){
  var items=[
    {nm:'Tom Jones — Insurance renewal 2026',sub:'Uploaded by driver · 2026-06-28',col:'rgba(5,150,105,.12)',ci:'var(--clever-ink)'},
    {nm:'Jake Davis — PLI certificate',sub:'Uploaded by driver · 2026-06-20',col:'rgba(5,150,105,.12)',ci:'var(--clever-ink)'},
    {nm:'Phil Harris — GIT insurance doc',sub:'Uploaded by driver · 2026-06-26',col:'rgba(185,133,48,.12)',ci:'var(--amber)'},
    {nm:'Brent Ford — DBS check renewal',sub:'Uploaded by admin · 2026-06-02',col:'rgba(5,150,105,.12)',ci:'var(--clever-ink)'},
    {nm:'Rachel Cole — HVA form signed',sub:'Uploaded by driver · 2026-06-14',col:'rgba(5,150,105,.12)',ci:'var(--clever-ink)'}
  ];
  var html='<div class="pact"><h1>Google Drive Inbox</h1><div class="pact-r"><button class="btn btn-clever">Open Drive folder</button></div></div>'+
    '<div class="alert alert-g">Connected to HAF CleverPay Drive folder. Documents below are awaiting assignment to driver records.</div>';
  items.forEach(function(it){
    html+='<div class="initem">'+
      '<div class="inico" style="background:'+it.col+';color:'+it.ci+'">'+
        '<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>'+
      '</div>'+
      '<div class="ininfo"><div class="innm">'+it.nm+'</div><div class="insub">'+it.sub+'</div></div>'+
      '<button class="btn btn-ghost" style="flex:none">Assign →</button></div>';
  });
  return html;
}

// ── CP Direct Inbox ──────────────────────────────────────────
function renderCPDirect(){
  var items=[
    {nm:'Steve Mills — Vehicle insurance certificate',sub:'Submitted via portal · 2026-06-21',status:'pending'},
    {nm:'Steve Mills — Proof of address (bank statement)',sub:'Submitted via portal · 2026-06-21',status:'pending'},
    {nm:'Kim Lee — New driving licence photo',sub:'Submitted via portal · 2026-06-06',status:'rejected'},
    {nm:'Jake Davis — HVA approval request',sub:'Submitted via portal · 2026-06-18',status:'pending'},
    {nm:'Phil Harris — PLI certificate',sub:'Submitted via portal · 2026-06-25',status:'under review'}
  ];
  var html='<div class="pact"><h1>CleverPay Direct Inbox</h1><div class="pact-r"><span style="font-size:13px;color:var(--muted)">'+items.length+' submissions</span></div></div>'+
    '<div class="alert alert-a">CleverPay Direct submissions arrive here. Approve, reject or request resubmission for each document before it is applied to a driver record.</div>';
  items.forEach(function(it){
    var sc=it.status==='pending'?'pending':it.status==='rejected'?'missing':'limited';
    html+='<div class="initem">'+
      '<div class="inico" style="background:rgba(185,133,48,.12);color:var(--amber)">'+
        '<svg viewBox="0 0 24 24"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/></svg>'+
      '</div>'+
      '<div class="ininfo"><div class="innm">'+it.nm+'</div><div class="insub">'+it.sub+'</div></div>'+
      '<span class="chip '+sc+'" style="flex:none;margin-right:8px">'+it.status+'</span>'+
      '<button class="btn btn-clever" style="flex:none">Review</button></div>';
  });
  return html;
}

// ── Driver CRM ───────────────────────────────────────────────
function renderCRM(){
  var rows=DRIVERS.map(function(d){
    var req=getRequiredDocs(d);
    var okCount=req.filter(function(r){var doc=d[r.k];return doc&&doc.s==='ok';}).length;
    var pct_=Math.round(okCount/req.length*100);
    return '<tr onclick="showDriver(\''+d.id+'\',\'crm\')">'+
      '<td><strong>'+d.nm+'</strong><br><span style="font-size:10.5px;color:var(--muted)">'+d.id+'</span></td>'+
      '<td>'+ragBadge(d.rag)+'</td>'+
      '<td><span class="chip '+(d.acType)+'" style="text-transform:capitalize">'+d.acType+'</span></td>'+
      '<td>'+d.vehType.toUpperCase()+'</td>'+
      '<td>'+pct_+'% ('+okCount+'/'+req.length+')</td>'+
      '<td>'+chipS(d.plna)+'</td>'+
      '<td>'+chipS(d.knect)+'</td>'+
      '<td>'+fmt(d.lr)+'</td>'+
      '<td><button class="btn btn-clever" onclick="event.stopPropagation();openEdit(\''+d.id+'\')">Edit</button></td>'+
      '</tr>';
  }).join('');
  return '<div class="pact"><h1>Driver CRM</h1><div class="pact-r">'+
    (SESSION.rl==='haf'?'<button class="btn btn-orange" onclick="showPage(\'add\')">+ Add Driver</button>':'')+
    '</div></div>'+
    '<div class="sbar"><input type="text" placeholder="Search drivers…" oninput="crmSearch(this.value)"></div>'+
    '<div class="twrap"><table class="tbl" id="crm-tbl"><thead><tr><th>Driver</th><th>RAG</th><th>Account</th><th>Vehicle</th><th>Doc %</th><th>PLNA</th><th>KNECT</th><th>Last reviewed</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>';
}
function crmSearch(q){
  var rows=document.querySelectorAll('#crm-tbl tbody tr');
  rows.forEach(function(r){
    r.style.display=r.innerText.toLowerCase().indexOf(q.toLowerCase())>-1?'':'none';
  });
}

// ── Missing Docs ─────────────────────────────────────────────
function renderMissing(){
  var withMissing=DRIVERS.filter(function(d){return getMissingDocs(d).length>0;});
  if(!withMissing.length) return '<div class="alert alert-g">No drivers have missing required documents.</div>';
  var rows=withMissing.map(function(d){
    var miss=getMissingDocs(d);
    var docList=miss.map(function(m){return '<span class="chip missing" style="margin:2px">'+DOC_LABELS[m.k]+'</span>';}).join('');
    return '<tr onclick="showDriver(\''+d.id+'\',\'missing\')">'+
      '<td><strong>'+d.nm+'</strong><br><span style="font-size:10.5px;color:var(--muted)">'+d.id+'</span></td>'+
      '<td>'+ragBadge(d.rag)+'</td>'+
      '<td>'+miss.length+'</td>'+
      '<td>'+docList+'</td>'+
      '<td><button class="btn btn-clever" onclick="event.stopPropagation();openEdit(\''+d.id+'\')">Resolve</button></td>'+
      '</tr>';
  }).join('');
  return '<div class="pact"><h1>Missing Documents</h1><div class="pact-r"><span style="font-size:13px;color:var(--muted)">'+withMissing.length+' drivers</span></div></div>'+
    '<div class="twrap"><table class="tbl"><thead><tr><th>Driver</th><th>RAG</th><th>Missing count</th><th>Missing documents</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>';
}

// ── Expiry and Renewals ───────────────────────────────────────
function renderExpiry(){
  var expiries=[];
  var docKeys=['lic','ins','git','pli','hva','dbs'];
  DRIVERS.forEach(function(d){
    docKeys.forEach(function(k){
      var doc=d[k];
      if(doc&&doc.x){
        var days=daysUntil(doc.x);
        if(days!==null&&days<=90) expiries.push({driver:d,k:k,days:days,x:doc.x});
      }
    });
  });
  expiries.sort(function(a,b){return a.days-b.days;});
  if(!expiries.length) return '<div class="alert alert-g">No documents expiring within 90 days.</div>';
  var rows=expiries.map(function(e){
    var urg=e.days<=14?'missing':e.days<=30?'pending':'limited';
    var daysLbl=e.days<0?'<span class="chip missing">Expired '+Math.abs(e.days)+'d ago</span>':
                e.days===0?'<span class="chip missing">Expires today</span>':
                '<span class="chip '+urg+'">'+e.days+' days</span>';
    return '<tr onclick="showDriver(\''+e.driver.id+'\',\'expiry\')">'+
      '<td><strong>'+e.driver.nm+'</strong></td>'+
      '<td>'+DOC_LABELS[e.k]+'</td>'+
      '<td>'+fmt(e.x)+'</td>'+
      '<td>'+daysLbl+'</td>'+
      '<td><button class="btn btn-ghost" onclick="event.stopPropagation();openEdit(\''+e.driver.id+'\')">Update</button></td>'+
      '</tr>';
  }).join('');
  return '<div class="pact"><h1>Expiry &amp; Renewals</h1><div class="pact-r"><span style="font-size:13px;color:var(--muted)">'+expiries.length+' expiring within 90 days</span></div></div>'+
    '<div class="twrap"><table class="tbl"><thead><tr><th>Driver</th><th>Document</th><th>Expiry date</th><th>Time left</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>';
}

// ── RAG Board ────────────────────────────────────────────────
function renderRAG(){
  function col(r){
    return DRIVERS.filter(function(d){return d.rag===r;}).map(function(d){
      var miss=getMissingDocs(d).length;
      return '<div class="rgcard" onclick="showDriver(\''+d.id+'\',\'rag\')">'+
        '<div class="rgnm">'+d.nm+'</div>'+
        '<div class="rgsub">'+d.id+' · '+d.acType+' · '+(miss?miss+' doc'+(miss>1?'s':'')+' missing':'All docs OK')+'</div>'+
        '</div>';
    }).join('');
  }
  return '<div class="pact"><h1>RAG Board</h1></div>'+
    '<div class="rgboard">'+
    '<div class="rgcol"><div class="rghead"><div class="dot" style="background:var(--green)"></div>GREEN — Compliant</div>'+col('G')+'</div>'+
    '<div class="rgcol"><div class="rghead"><div class="dot" style="background:var(--amber)"></div>AMBER — Partial</div>'+col('A')+'</div>'+
    '<div class="rgcol"><div class="rghead"><div class="dot" style="background:var(--red)"></div>RED — Blocked</div>'+col('R')+'</div>'+
    '</div>';
}
