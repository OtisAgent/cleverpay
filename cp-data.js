
// ── Auth ─────────────────────────────────────────────────────
var USERS=[
  {u:'HAFADMIN',p:'HAF2026', nm:'HAF Admin',      rl:'haf',       init:'HA'},
  {u:'GEMMA',   p:'CLEVER26',nm:'Gemma',           rl:'cleverpay', init:'GE'},
  {u:'CPAGENT', p:'CLEVER26',nm:'CP Agent',        rl:'cleverpay', init:'CP'}
];
var SESSION=null;

// ── Reference data ───────────────────────────────────────────
var DOC_LABELS={
  lic:'Driving licence',ins:'Vehicle insurance (H&R)',git:'Goods in transit (GIT)',
  rtw:'Right to work',photo:'Vehicle photo',poa:'Proof of address',
  pli:'Public liability insurance',hva:'High-value goods approval',
  dbs:'DBS / background check',coy:'Company / VAT registration'
};

// ── Drivers ──────────────────────────────────────────────────
var DRIVERS=[
  {id:'TJ418793',nm:'Tom Jones',em:'tom.jones@gmail.com',ph:'07911418793',dob:'1993-07-14',
   acType:'plus',plnaTier:'plus',knectLvl:'live',vehType:'lwb',svcTypes:['parcels','pallets'],
   waOK:true,gmOK:true,rag:'G',route:'drive',submitted:'2026-06-10',priority:'normal',
   docLink:'https://drive.google.com/folders/demo1',
   lic:{s:'ok',x:'2029-03-15'},ins:{s:'ok',x:'2026-09-30'},git:{s:'ok',x:'2026-11-20'},
   rtw:{s:'ok',x:null},photo:{s:'ok',x:null},poa:{s:'ok',x:null},
   pli:{s:'ok',x:'2027-01-15'},hva:{s:null,x:null},dbs:{s:null,x:null},coy:{s:null,x:null},
   plna:'active',knect:'eligible',cs:'approved',lr:'2026-06-28',rb:false,
   note:'All docs current. Pallet work approved.',
   jobs:47,miles:1243,gross:3420,fee:0.08,ps:'paid',lp:'2026-06-28',
   msgs:[{dt:'2026-06-12',from:'GEMMA',body:'Hi Tom, your docs have been verified. You\'re all set!'}],
   audit:[
     {dt:'2026-06-10',act:'Account created',by:'GEMMA',prev:null,next:'pending',note:'New driver signup'},
     {dt:'2026-06-28',act:'Status approved',by:'GEMMA',prev:'pending',next:'approved',note:'All docs verified'}
   ]},
  {id:'BF638793',nm:'Brent Ford',em:'brent@haf.co.uk',ph:'07900638793',dob:'1993-04-12',
   acType:'founder',plnaTier:'pro',knectLvl:'relay',vehType:'lwb',svcTypes:['parcels','pallets','high-value','relay'],
   waOK:true,gmOK:true,rag:'G',route:'drive',submitted:'2026-05-01',priority:'normal',
   docLink:'https://drive.google.com/folders/demo2',
   lic:{s:'ok',x:'2030-01-10'},ins:{s:'ok',x:'2026-12-31'},git:{s:'ok',x:'2027-01-15'},
   rtw:{s:'ok',x:null},photo:{s:'ok',x:null},poa:{s:'ok',x:null},
   pli:{s:'ok',x:'2027-03-01'},hva:{s:'ok',x:'2027-01-01'},dbs:{s:'ok',x:'2027-06-01'},coy:{s:null,x:null},
   plna:'active',knect:'eligible',cs:'approved',lr:'2026-06-01',rb:false,
   note:'Founder account — internal test driver.',
   jobs:12,miles:310,gross:1200,fee:0.05,ps:'paid',lp:'2026-06-01',
   msgs:[],
   audit:[{dt:'2026-05-01',act:'Account created',by:'HAFADMIN',prev:null,next:'approved',note:'Founder setup'}]},
  {id:'SM991893',nm:'Steve Mills',em:'steve.mills@gmail.com',ph:'07955991893',dob:'1993-08-19',
   acType:'free',plnaTier:'lite',knectLvl:'view',vehType:'car',svcTypes:['parcels'],
   waOK:true,gmOK:false,rag:'A',route:'direct',submitted:'2026-06-20',priority:'high',
   docLink:null,
   lic:{s:'ok',x:'2027-11-05'},ins:{s:'pending',x:null},git:{s:null,x:null},
   rtw:{s:'ok',x:null},photo:{s:'ok',x:null},poa:{s:'missing',x:null},
   pli:{s:null,x:null},hva:{s:null,x:null},dbs:{s:null,x:null},coy:{s:null,x:null},
   plna:'limited',knect:'limited',cs:'pending',lr:'2026-06-20',rb:false,
   note:'Awaiting insurance cert and proof of address.',
   jobs:0,miles:0,gross:0,fee:0.10,ps:'none',lp:null,
   msgs:[{dt:'2026-06-22',from:'GEMMA',body:'Hi Steve, we still need your insurance certificate and proof of address to proceed. Please resubmit via the portal.'}],
   audit:[{dt:'2026-06-20',act:'Account created',by:'CPAGENT',prev:null,next:'pending',note:'CP Direct signup'}]},
  {id:'JD224192',nm:'Jake Davis',em:'jake.davis@email.com',ph:'07812224192',dob:'1992-08-22',
   acType:'plus',plnaTier:'plus',knectLvl:'live',vehType:'swb',svcTypes:['parcels','high-value'],
   waOK:true,gmOK:true,rag:'A',route:'drive',submitted:'2026-06-15',priority:'high',
   docLink:'https://drive.google.com/folders/demo4',
   lic:{s:'ok',x:'2028-06-01'},ins:{s:'ok',x:'2026-08-15'},git:{s:'ok',x:'2027-02-20'},
   rtw:{s:'ok',x:null},photo:{s:'ok',x:null},poa:{s:null,x:null},
   pli:{s:'ok',x:'2026-08-20'},hva:{s:'missing',x:null},dbs:{s:null,x:null},coy:{s:null,x:null},
   plna:'limited',knect:'limited',cs:'pending',lr:'2026-06-15',rb:false,
   note:'HVA form not yet received. Insurance and PLI expire Aug — renewals flagged.',
   jobs:28,miles:760,gross:2100,fee:0.08,ps:'paid',lp:'2026-06-10',
   msgs:[],
   audit:[{dt:'2026-06-15',act:'Account created',by:'GEMMA',prev:null,next:'pending',note:'New signup — high-value route'}]},
  {id:'KL770493',nm:'Kim Lee',em:'kim.lee@email.com',ph:'07700770493',dob:'1993-04-07',
   acType:'free',plnaTier:'lite',knectLvl:'view',vehType:'car',svcTypes:['parcels'],
   waOK:false,gmOK:false,rag:'R',route:'direct',submitted:'2026-06-01',priority:'urgent',
   docLink:null,
   lic:{s:'expired',x:'2025-12-31'},ins:{s:'missing',x:null},git:{s:null,x:null},
   rtw:{s:'missing',x:null},photo:{s:'ok',x:null},poa:{s:null,x:null},
   pli:{s:null,x:null},hva:{s:null,x:null},dbs:{s:null,x:null},coy:{s:null,x:null},
   plna:'blocked',knect:'not eligible',cs:'blocked',lr:'2026-06-05',rb:true,
   note:'BLOCKED: Expired licence, missing insurance and RTW. WhatsApp not verified.',
   jobs:0,miles:0,gross:0,fee:0.10,ps:'none',lp:null,
   msgs:[{dt:'2026-06-05',from:'GEMMA',body:'Kim, your account has been blocked. You have an expired licence and missing documents. Please contact us urgently.'}],
   audit:[
     {dt:'2026-06-01',act:'Account created',by:'CPAGENT',prev:null,next:'pending',note:'CP Direct signup'},
     {dt:'2026-06-05',act:'Account blocked',by:'GEMMA',prev:'pending',next:'blocked',note:'Expired licence + missing RTW and insurance'}
   ]},
  {id:'PH330994',nm:'Phil Harris',em:'phil.harris@email.com',ph:'07966330994',dob:'1994-03-30',
   acType:'plus',plnaTier:'plus',knectLvl:'live',vehType:'mwb',svcTypes:['pallets','business-freight'],
   waOK:true,gmOK:true,rag:'A',route:'drive',submitted:'2026-06-25',priority:'normal',
   docLink:'https://drive.google.com/folders/demo6',
   lic:{s:'ok',x:'2028-09-12'},ins:{s:'ok',x:'2026-10-05'},git:{s:'ok',x:'2026-10-18'},
   rtw:{s:'ok',x:null},photo:{s:'ok',x:null},poa:{s:null,x:null},
   pli:{s:'pending',x:null},hva:{s:null,x:null},dbs:{s:null,x:null},coy:{s:null,x:null},
   plna:'limited',knect:'limited',cs:'pending',lr:'2026-06-25',rb:false,
   note:'PLI submitted — awaiting verification. Ins + GIT expire Oct.',
   jobs:15,miles:480,gross:1650,fee:0.08,ps:'pending',lp:'2026-06-05',
   msgs:[],
   audit:[{dt:'2026-06-25',act:'Account created',by:'GEMMA',prev:null,next:'pending',note:'New signup — pallet route'}]},
  {id:'RC559295',nm:'Rachel Cole',em:'rachel.cole@email.com',ph:'07888559295',dob:'1995-09-05',
   acType:'pro',plnaTier:'pro',knectLvl:'live',vehType:'lwb',svcTypes:['parcels','pallets','high-value'],
   waOK:true,gmOK:true,rag:'G',route:'drive',submitted:'2026-05-20',priority:'normal',
   docLink:'https://drive.google.com/folders/demo7',
   lic:{s:'ok',x:'2029-08-22'},ins:{s:'ok',x:'2027-02-28'},git:{s:'ok',x:'2027-05-10'},
   rtw:{s:'ok',x:null},photo:{s:'ok',x:null},poa:{s:'ok',x:null},
   pli:{s:'ok',x:'2027-04-01'},hva:{s:'ok',x:'2026-12-01'},dbs:{s:'ok',x:'2027-09-05'},coy:{s:null,x:null},
   plna:'active',knect:'eligible',cs:'approved',lr:'2026-06-15',rb:false,
   note:'Pro driver — all docs current including DBS.',
   jobs:63,miles:1890,gross:4800,fee:0.07,ps:'paid',lp:'2026-07-01',
   msgs:[],
   audit:[
     {dt:'2026-05-20',act:'Account created',by:'HAFADMIN',prev:null,next:'pending',note:'Pro account setup'},
     {dt:'2026-06-15',act:'Status approved',by:'GEMMA',prev:'pending',next:'approved',note:'DBS verified, all docs complete'}
   ]}
];

// ── Document rules engine ────────────────────────────────────
var RULES=[
  {id:'r1',nm:'Standard driver — base docs',
   desc:'Every driver on any account type requires these four documents before any activation.',
   trigger:'All accounts',conditions:['All drivers'],
   docs:['lic','ins','rtw','photo']},
  {id:'r2',nm:'Van driver — goods in transit',
   desc:'GIT insurance is required for any van-class vehicle: SWB, MWB, LWB or Luton. Also required for drivers accessing Relay routes.',
   trigger:'vehType: swb / mwb / lwb / luton  OR  svcTypes includes: relay',conditions:['Van vehicle','Relay service'],
   docs:['git']},
  {id:'r3',nm:'Pallet & business freight — public liability',
   desc:'Public liability insurance is required when carrying pallets or operating on business freight routes.',
   trigger:'svcTypes includes: pallets or business-freight',conditions:['Pallets','Business freight'],
   docs:['pli']},
  {id:'r4',nm:'High-value goods — PLI + HVA approval',
   desc:'Drivers carrying high-value goods must hold PLI (if not already) plus a separate HVA approval form signed by HAF Compliance.',
   trigger:'svcTypes includes: high-value',conditions:['High-value goods service'],
   docs:['pli','hva']},
  {id:'r5',nm:'Pro PLNA tier — DBS check',
   desc:'All drivers on the Pro PLNA tier must have a current DBS / background check on file before achieving Pro status.',
   trigger:'plnaTier: pro',conditions:['Pro PLNA tier'],
   docs:['dbs']},
  {id:'r6',nm:'Partner account — company & VAT docs',
   desc:'Partner account holders operating as a company must provide their company registration number and VAT certificate.',
   trigger:'acType: partner',conditions:['Partner account type'],
   docs:['coy']}
];

function getRequiredDocs(d){
  var req=[];
  req.push({k:'lic',reason:'All drivers'});
  req.push({k:'ins',reason:'All drivers'});
  req.push({k:'rtw',reason:'All drivers'});
  req.push({k:'photo',reason:'All drivers'});
  if(['swb','mwb','lwb','luton'].indexOf(d.vehType)>-1) req.push({k:'git',reason:'Van vehicle type'});
  if(d.svcTypes.indexOf('relay')>-1 && req.every(function(r){return r.k!=='git';})) req.push({k:'git',reason:'Relay service access'});
  if(['pallets','business-freight'].some(function(s){return d.svcTypes.indexOf(s)>-1;})) req.push({k:'pli',reason:'Pallet / business freight'});
  if(d.svcTypes.indexOf('high-value')>-1){
    if(req.every(function(r){return r.k!=='pli';})) req.push({k:'pli',reason:'High-value goods work'});
    req.push({k:'hva',reason:'High-value goods access'});
  }
  if(d.plnaTier==='pro') req.push({k:'dbs',reason:'Pro PLNA tier'});
  if(d.acType==='partner') req.push({k:'coy',reason:'Partner account'});
  return req;
}
function getMissingDocs(d){
  return getRequiredDocs(d).filter(function(r){
    var doc=d[r.k];
    return doc&&(doc.s==='missing'||doc.s==='expired'||doc.s==='pending');
  });
}
function daysUntil(s){
  if(!s) return null;
  var p=s.split('-');
  var dt=new Date(parseInt(p[0]),parseInt(p[1])-1,parseInt(p[2]));
  var now=new Date(2026,6,6);
  return Math.round((dt-now)/(1000*60*60*24));
}
function initials(nm){return (nm||'?').split(' ').map(function(w){return w[0];}).join('').toUpperCase().slice(0,2);}
function chipS(s){
  if(!s||s==='na') return '<span class="chip na">N/A</span>';
  var map={ok:'ok',missing:'missing',expired:'expired',pending:'pending',active:'active',blocked:'blocked',limited:'limited',eligible:'eligible','not eligible':'missing',approved:'ok',none:'na',paid:'ok'};
  var cls=map[s]||'na';
  return '<span class="chip '+cls+'">'+s+'</span>';
}
function ragBadge(r){
  var m={G:'Green — Compliant',A:'Amber — Partial',R:'Red — Blocked'};
  return '<span class="rag '+r+'">'+(m[r]||r)+'</span>';
}
function priorityBadge(p){
  if(p==='urgent') return '<span class="chip missing">Urgent</span>';
  if(p==='high') return '<span class="chip pending">High</span>';
  return '<span class="chip na">Normal</span>';
}
function fmt(s){return s?s.split('-').reverse().join('/'):'—';}
function pct(v){return Math.round(v*100)+'%';}
