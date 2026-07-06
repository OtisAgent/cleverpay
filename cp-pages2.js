
// ── PLNA Sync ──────────────────────────────────────────────────────
function renderPLNASync(){
  var rows=DRIVERS.map(function(d){
    var plnaColor=d.plna==='active'?'g':d.plna==='limited'?'a':'r';
    var waStatus=d.waOK?'<span class="chip ok">Verified</span>':'<span class="chip missing">Not verified</span>';
    var gmStatus=d.gmOK?'<span class="chip ok">Confirmed</span>':'<span class="chip missing">Pending</span>';
    return '<tr onclick="showDriver(\''+d.id+'\',\'plnasync\')">'+
      '<td><strong>'+d.nm+'</strong></td>'+
      '<td>'+chipS(d.plna)+'</td>'+
      '<td>'+d.plnaTier+'</td>'+
      '<td>'+waStatus+'</td>'+
      '<td>'+gmStatus+'</td>'+
      '<td>'+chipS(d.cs)+'</td>'+
      '</tr>';
  }).join('');
  return '<div class="pact"><h1>PLNA Sync</h1></div>'+
    '<div class="alert alert-a">PLNA status reflects CleverPay compliance decisions. Green → Active; Amber → Limited access; Red → Blocked. WhatsApp and Gmail must both be confirmed before full PLNA activation.</div>'+
    '<div class="twrap"><table class="tbl"><thead><tr><th>Driver</th><th>PLNA Status</th><th>Tier</th><th>WhatsApp</th><th>Gmail</th><th>CP Status</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
}

// ── KNECT Eligibility ──────────────────────────────────────────────
function renderKNECT(){
  var rows=DRIVERS.map(function(d){
    var miss=getMissingDocs(d).length;
    var knReason=d.knect==='eligible'?'CleverPay approved + PLNA active':
                 d.knect==='limited'?'Pending compliance docs':
                 'Blocked — compliance failed';
    return '<tr onclick="showDriver(\''+d.id+'\',\'knect\')">'+
      '<td><strong>'+d.nm+'</strong></td>'+
      '<td>'+ragBadge(d.rag)+'</td>'+
      '<td>'+chipS(d.knect)+'</td>'+
      '<td>'+d.knectLvl+'</td>'+
      '<td>'+miss+' outstanding</td>'+
      '<td style="font-size:11.5px;color:var(--muted)">'+knReason+'</td>'+
      '</tr>';
  }).join('');
  return '<div class="pact"><h1>KNECT Eligibility</h1></div>'+
    '<div class="alert alert-g">KNECT never decides compliance — it only receives eligibility status after CleverPay and PLNA have both confirmed a driver.</div>'+
    '<div class="twrap"><table class="tbl"><thead><tr><th>Driver</th><th>RAG</th><th>KNECT Status</th><th>Level</th><th>Docs outstanding</th><th>Eligibility reason</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
}

// ── Messages ─────────────────────────────────────────────────────
var msgView=null;
function renderMessages(){
  if(msgView) return renderMessageThread(msgView);
  var withMsgs=DRIVERS.filter(function(d){return d.msgs&&d.msgs.length>0;});
  if(!withMsgs.length) return '<div class="alert alert-g">No messages yet.</div>';
  var list=withMsgs.map(function(d){
    var last=d.msgs[d.msgs.length-1];
    return '<div class="mitem" onclick="msgView=\''+d.id+'\';showPage(\'messages\')">'+
      '<div class="mdrv">'+d.nm+'</div>'+
      '<div class="mprev">'+last.body+'</div>'+
      '<div class="mtime">'+fmt(last.dt)+' · '+last.from+'</div>'+
      '</div>';
  }).join('');
  return '<div class="pact"><h1>Messages</h1></div><div class="mlist">'+list+'</div>';
}
function renderMessageThread(id){
  var d=DRIVERS.find(function(x){return x.id===id;});
  if(!d) return '';
  var thread=d.msgs.map(function(m){
    var isOut=m.from!=='driver';
    return '<div class="mbub'+(isOut?' out':'')+'">'+
      '<div class="mbfrom">'+(isOut?m.from:'Driver')+'</div>'+
      '<div class="mbbody">'+m.body+'</div>'+
      '<div class="mbtime">'+fmt(m.dt)+'</div>'+
      '</div>';
  }).join('');
  return '<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">'+
    '<button class="btn btn-ghost" onclick="msgView=null;showPage(\'messages\')">← Back</button>'+
    '<h1 style="font-size:18px">'+d.nm+'</h1></div>'+
    '<div class="mthread">'+thread+'</div>'+
    '<div class="mcompose">'+
      '<textarea placeholder="Write a message to '+d.nm+'…" id="msg-input"></textarea>'+
      '<button class="btn btn-clever" onclick="sendMsg(\''+d.id+'\')" style="align-self:flex-end">Send</button>'+
    '</div>';
}
function sendMsg(id){
  var d=DRIVERS.find(function(x){return x.id===id;});
  var inp=document.getElementById('msg-input');
  if(!inp||!inp.value.trim()) return;
  d.msgs.push({dt:'2026-07-06',from:SESSION.nm,body:inp.value.trim()});
  showPage('messages');
  msgView=id;
  showPage('messages');
}

// ── Audit Trail ──────────────────────────────────────────────────
function renderAudit(){
  var all=[];
  DRIVERS.forEach(function(d){d.audit.forEach(function(a){all.push({d:d,a:a});});});
  all.sort(function(a,b){return b.a.dt.localeCompare(a.a.dt);});
  var rows=all.map(function(e){
    return '<tr>'+
      '<td>'+fmt(e.a.dt)+'</td>'+
      '<td><strong>'+e.d.nm+'</strong></td>'+
      '<td>'+e.a.act+'</td>'+
      '<td>'+e.a.by+'</td>'+
      '<td>'+(e.a.prev?chipS(e.a.prev):'—')+'</td>'+
      '<td>'+(e.a.next?chipS(e.a.next):'—')+'</td>'+
      '<td style="font-size:11.5px;color:var(--muted)">'+(e.a.note||'')+'</td>'+
      '</tr>';
  }).join('');
  return '<div class="pact"><h1>Audit Trail</h1><div class="pact-r"><span style="font-size:13px;color:var(--muted)">'+all.length+' entries</span></div></div>'+
    '<div class="twrap"><table class="tbl"><thead><tr><th>Date</th><th>Driver</th><th>Action</th><th>By</th><th>Previous</th><th>New status</th><th>Note</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
}

