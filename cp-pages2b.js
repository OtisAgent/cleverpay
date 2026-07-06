// ── Reports ──────────────────────────────────────────────────
function renderReports(){
  var totalGross=DRIVERS.reduce(function(s,d){return s+d.gross;},0);
  var totalFee=DRIVERS.reduce(function(s,d){return s+(d.gross*d.fee);},0);
  var totalNet=totalGross-totalFee;
  var rows=DRIVERS.map(function(d){
    var fee=d.gross*d.fee;
    var net=d.gross-fee;
    return '<tr onclick="showDriver(\''+d.id+'\',\'reports\')">'+
      '<td><strong>'+d.nm+'</strong></td>'+
      '<td>'+d.jobs+'</td>'+
      '<td>'+d.miles+'</td>'+
      '<td>£'+d.gross.toLocaleString()+'</td>'+
      '<td>'+pct(d.fee)+'</td>'+
      '<td>£'+fee.toFixed(2)+'</td>'+
      '<td><strong>£'+net.toFixed(2)+'</strong></td>'+
      '<td>'+chipS(d.ps)+'</td>'+
      '</tr>';
  }).join('');
  var totRow='<tr style="font-weight:700;border-top:2px solid var(--line-s)">'+
    '<td>TOTAL</td><td>'+DRIVERS.reduce(function(s,d){return s+d.jobs;},0)+'</td>'+
    '<td>'+DRIVERS.reduce(function(s,d){return s+d.miles;},0)+'</td>'+
    '<td>£'+totalGross.toLocaleString()+'</td><td>—</td>'+
    '<td>£'+totalFee.toFixed(2)+'</td>'+
    '<td>£'+totalNet.toFixed(2)+'</td><td></td></tr>';
  return '<div class="pact"><h1>Payout Reports</h1><div class="pact-r"><button class="btn btn-ghost">Export CSV</button></div></div>'+
    '<div class="kgrid">'+
      '<div class="kpi"><div class="kpi-v">£'+totalGross.toLocaleString()+'</div><div class="kpi-l">Gross earnings</div><div class="kpi-ac o"></div></div>'+
      '<div class="kpi"><div class="kpi-v">£'+totalFee.toFixed(0)+'</div><div class="kpi-l">HAF fees</div><div class="kpi-ac a"></div></div>'+
      '<div class="kpi"><div class="kpi-v">£'+totalNet.toFixed(0)+'</div><div class="kpi-l">Net driver payout</div><div class="kpi-ac g"></div></div>'+
    '</div>'+
    '<div class="twrap"><table class="tbl"><thead><tr><th>Driver</th><th>Jobs</th><th>Miles</th><th>Gross</th><th>Fee %</th><th>HAF Fee</th><th>Net payout</th><th>Status</th></tr></thead><tbody>'+rows+totRow+'</tbody></table></div>';
}

// ── Doc Rules Manager ────────────────────────────────────────
function renderDocRules(){
  var html='<div class="pact"><h1>Dynamic Document Rules</h1><div class="pact-r">'+
    (SESSION.rl==='haf'?'<button class="btn btn-orange">+ Add Rule</button>':'')+
    '</div></div>'+
    '<div class="alert alert-g">Document requirements are calculated dynamically per driver. Each rule adds document requirements based on account type, vehicle type, PLNA tier, or service type — they stack automatically.</div>';
  RULES.forEach(function(r){
    html+='<div class="rcard">'+
      '<div class="rcard-nm">'+r.nm+'</div>'+
      '<div class="rcard-desc">'+r.desc+'</div>'+
      '<div style="font-size:11px;color:var(--muted);margin-bottom:8px"><strong>Trigger:</strong> '+r.trigger+'</div>'+
      '<div class="rcard-docs">'+r.docs.map(function(k){return '<span class="rdoc">'+DOC_LABELS[k]+'</span>';}).join('')+'</div>'+
      '</div>';
  });
  html+='<div class="card" style="margin-top:20px">'+
    '<div class="card-ttl">Driver checklist preview</div>'+
    '<p style="font-size:12.5px;color:var(--muted);margin-bottom:14px">Select a driver to see their exact required document list calculated by these rules.</p>'+
    DRIVERS.map(function(d){
      var req=getRequiredDocs(d);
      return '<div style="margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid var(--line)">'+
        '<div style="font-weight:700;font-size:13px;margin-bottom:6px">'+d.nm+' <span style="font-size:11px;font-weight:400;color:var(--muted)">'+d.id+' · '+d.acType+' · '+d.vehType+'</span></div>'+
        '<div style="display:flex;flex-wrap:wrap;gap:5px">'+req.map(function(r){
          var doc=d[r.k];var s=doc?doc.s:'missing';
          var cls=s==='ok'?'ok':s==='pending'?'pending':'missing';
          return '<span class="chip '+cls+'" title="'+r.reason+'">'+DOC_LABELS[r.k]+'</span>';
        }).join('')+'</div>'+
        '</div>';
    }).join('')+
    '</div>';
  return html;
}

// ── Settings (HAF Admin only) ────────────────────────────────
function renderSettings(){
  if(SESSION.rl!=='haf') return '<div class="alert alert-r">Settings are restricted to HAF Admin accounts.</div>';
  return '<div class="pact"><h1>Settings</h1></div>'+
    '<div class="setsec">'+
      '<div class="setsec-ttl">Portal Access</div>'+
      USERS.map(function(u){
        return '<div class="setrow">'+
          '<div><div class="setrow-lbl">'+u.nm+'</div><div style="font-size:11.5px;color:var(--muted)">'+u.u+' · '+u.rl+'</div></div>'+
          '<span class="chip ok">Active</span>'+
          '</div>';
      }).join('')+
    '</div>'+
    '<div class="setsec">'+
      '<div class="setsec-ttl">Integration Status</div>'+
      '<div class="setrow"><div><div class="setrow-lbl">Google Drive</div><div style="font-size:11.5px;color:var(--muted)">HAF CleverPay shared folder</div></div><span class="chip ok">Connected</span></div>'+
      '<div class="setrow"><div><div class="setrow-lbl">HAF PLNA</div><div style="font-size:11.5px;color:var(--muted)">Driver status sync</div></div><span class="chip limited">Simulated</span></div>'+
      '<div class="setrow"><div><div class="setrow-lbl">HAF KNECT</div><div style="font-size:11.5px;color:var(--muted)">Eligibility feed</div></div><span class="chip limited">Simulated</span></div>'+
      '<div class="setrow"><div><div class="setrow-lbl">Supabase</div><div style="font-size:11.5px;color:var(--muted)">Live database connection</div></div><span class="chip missing">Not connected</span></div>'+
      '<div class="setrow"><div><div class="setrow-lbl">Better Auth</div><div style="font-size:11.5px;color:var(--muted)">Shared SSO across KNECT + PLNA</div></div><span class="chip missing">Not deployed</span></div>'+
    '</div>'+
    '<div class="setsec">'+
      '<div class="setsec-ttl">RAG Logic</div>'+
      '<div class="setrow"><div><div class="setrow-lbl">Green → PLNA Active + KNECT Eligible</div></div><span class="chip ok">Active rule</span></div>'+
      '<div class="setrow"><div><div class="setrow-lbl">Amber → PLNA Limited + KNECT Limited</div></div><span class="chip ok">Active rule</span></div>'+
      '<div class="setrow"><div><div class="setrow-lbl">Red → PLNA Blocked + KNECT Not Eligible</div></div><span class="chip ok">Active rule</span></div>'+
    '</div>';
}

// ── Driver Profile ───────────────────────────────────────────
function renderDriverProfile(id){
  var d=DRIVERS.find(function(x){return x.id===id;});
  if(!d) return '<p>Driver not found.</p>';
  var req=getRequiredDocs(d);
  var allDocKeys=['lic','ins','git','rtw','photo','poa','pli','hva','dbs','coy'];
  var docHtml=req.map(function(r){
    var doc=d[r.k];
    var s=doc?doc.s:'missing';
    var cls=s==='ok'?'ok':s==='pending'?'pending':s==='expired'?'expired':'missing';
    var expTxt=doc&&doc.x?'Exp: '+fmt(doc.x):'No expiry';
    return '<div class="ditem">'+
      '<div class="dinm"><span class="dreq">Required</span>'+DOC_LABELS[r.k]+'</div>'+
      '<div style="margin:4px 0">'+chipS(s)+'</div>'+
      '<div class="dimeta">'+expTxt+'<br><em style="font-size:10px">'+r.reason+'</em></div>'+
      '</div>';
  }).join('');
  var optDocs=allDocKeys.filter(function(k){return req.every(function(r){return r.k!==k;})&&d[k]&&d[k].s;}).map(function(k){
    var doc=d[k];
    return '<div class="ditem">'+
      '<div class="dinm"><span class="dopt">Optional</span>'+DOC_LABELS[k]+'</div>'+
      '<div style="margin:4px 0">'+chipS(doc.s)+'</div>'+
      '<div class="dimeta">'+(doc.x?'Exp: '+fmt(doc.x):'No expiry')+'</div>'+
      '</div>';
  }).join('');
  var auditRows=d.audit.slice().reverse().map(function(a){
    return '<div class="fi">'+
      '<div class="fidot '+(a.next==='approved'?'g':a.next==='blocked'?'r':'a')+'"></div>'+
      '<div><div class="fitxt"><strong>'+a.act+'</strong>'+(a.note?' — '+a.note:'')+'</div>'+
      '<div class="fitm">'+fmt(a.dt)+' · by '+a.by+'</div></div></div>';
  }).join('');
  return '<div class="dph">'+
    '<div class="dpav">'+initials(d.nm)+'</div>'+
    '<div class="dpmeta">'+
      '<h2>'+d.nm+'</h2>'+
      '<p>'+d.id+' · '+d.em+' · '+d.ph+'</p>'+
      '<p>'+d.acType+' account · '+d.vehType.toUpperCase()+' · PLNA '+d.plnaTier+' · KNECT '+d.knectLvl+'</p>'+
      '<div class="dpacts">'+
        ragBadge(d.rag)+
        chipS(d.cs)+
        (d.rb?'<span class="chip blocked">Blocked</span>':'')+
        '<button class="btn btn-clever" onclick="openEdit(\''+d.id+'\')">Edit compliance</button>'+
        (SESSION.rl==='haf'&&d.rb?'<button class="btn btn-ghost" onclick="unblock(\''+d.id+'\')">Unblock</button>':'')+
        (SESSION.rl==='haf'&&!d.rb?'<button class="btn btn-red" onclick="blockDriver(\''+d.id+'\')">Block</button>':'')+
      '</div>'+
    '</div>'+
  '</div>'+
  '<div class="kgrid">'+
    '<div class="kpi"><div class="kpi-v">'+d.jobs+'</div><div class="kpi-l">Jobs completed</div><div class="kpi-ac o"></div></div>'+
    '<div class="kpi"><div class="kpi-v">'+d.miles+'</div><div class="kpi-l">Miles driven</div><div class="kpi-ac o"></div></div>'+
    '<div class="kpi"><div class="kpi-v">£'+d.gross.toLocaleString()+'</div><div class="kpi-l">Gross earnings</div><div class="kpi-ac g"></div></div>'+
    '<div class="kpi"><div class="kpi-v">£'+(d.gross*(1-d.fee)).toFixed(0)+'</div><div class="kpi-l">Net payout</div><div class="kpi-ac g"></div></div>'+
  '</div>'+
  '<div class="slbl">Required documents ('+req.length+' for this driver)</div>'+
  '<div class="docgrid">'+docHtml+'</div>'+
  (optDocs?'<div class="slbl">Additional documents on file</div><div class="docgrid">'+optDocs+'</div>':'')+
  '<div class="slbl">Notes</div>'+
  '<div class="card">'+d.note+'</div>'+
  '<div class="slbl">Audit trail</div>'+
  '<div class="card"><div class="feed">'+auditRows+'</div></div>'+
  (d.msgs.length?'<div class="slbl">Messages</div><div class="card">'+
    d.msgs.map(function(m){return '<div class="mbub out"><div class="mbfrom">'+m.from+'</div><div class="mbbody">'+m.body+'</div><div class="mbtime">'+fmt(m.dt)+'</div></div>';}).join('')+
  '</div>':'');
}
