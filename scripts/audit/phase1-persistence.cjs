// Phase 1 persistence + isolation check across a server restart and a fresh login.
// 1. Start a server with snapshot persistence on a scratch file:
//    PORT=3200 DATA_SNAPSHOT_PATH=/tmp/x/snap.json npx tsx server.ts
// 2. BASE=http://localhost:3200 STATE=/tmp/x/state.json node scripts/audit/phase1-persistence.cjs create
// 3. Stop the server, start it again with the same DATA_SNAPSHOT_PATH, then run with 'verify'.
// Student A's data must be FOUND after re-login and restart; student B must never see it.
const fs=require('fs'); const BASE=(process.env.BASE||'http://localhost:3200')+'/api/v1'; const st=process.env.STATE||'phase1-persist-state.json';
const api=async(m,p,t,b)=>{const r=await fetch(BASE+p,{method:m,headers:{'Content-Type':'application/json',...(t?{Authorization:'Bearer '+t}:{})},body:b?JSON.stringify(b):undefined});let j;try{j=await r.json()}catch{j={}}return {s:r.status,j};};
(async()=>{
 const phase=process.argv[2];
 if(phase==='create'){
  const ts=Date.now(); const S={};
  for(const k of ['A','B']){const e=`persist${k}.${ts}@example.test`; const r=await api('POST','/auth/register',null,{email:e,password:'TestPass123',name:'Persist '+k}); S[k]={email:e,token:r.j.data.token};}
  const t=S.A.token; await api('POST','/students/me/onboarding/complete',t,{});
  const n=await api('POST','/notes',t,{title:'Persist note',content:'Deadlock needs four conditions.',tags:['os']}); S.note=n.j.data?.id||n.j.data?.note?.id;
  const d=await api('POST','/flashcards/decks',t,{title:'Persist deck',subject:'OS'}); S.deck=d.j.data?.id;
  const c=await api('POST',`/flashcards/decks/${S.deck}/cards`,t,{front:'Mutual exclusion?',back:'Only one process holds the resource.'}); S.card=c.j.data?.id; S.cardStatus=c.s;
  const rv=await api('POST',`/flashcards/decks/${S.deck}/cards/${S.card}/review`,t,{rating:'GOOD'}); S.reviewStatus=rv.s;
  const p=await api('POST','/study-planner/plans',t,{title:'Persist plan',target_date:new Date(Date.now()+864e6).toISOString().slice(0,10)}); S.plan=p.j.data?.id;
  const tk=await api('POST',`/study-planner/plans/${S.plan}/tasks`,t,{title:'Revise deadlocks',date:new Date().toISOString().slice(0,10),duration_minutes:30}); S.task=tk.j.data?.id||tk.j.data?.task?.id; S.taskStatus=tk.s;
  const db=await api('POST','/doubts',t,{title:'Why is circular wait needed for deadlock?',question_text:'Confused about the four conditions',subject:'OS'}); S.doubt=db.j.data?.id; S.doubtStatus=db.s;
  await api('POST','/languages/es/enroll',t,{purpose:'CAREER'});
  await api('POST','/languages/es/lessons/les_es_1/complete',t,{notes:'persist'});
  const cv=await api('POST','/languages/es/conversations',t,{scenario:'Persist cafe'}); S.conv=cv.j.data?.id;
  const up=await api('POST','/documents',t,{originalName:'persist.txt',mimeType:'text/plain',sizeBytes:30,contentBase64:Buffer.from('Paging uses fixed-size frames.').toString('base64'),title:'Persist doc'}); S.doc=up.j.data?.id||up.j.data?.document?.id; S.docStatus=up.s;
  const ai=await api('POST','/ai/conversations',t,{title:'Persist chat'}); S.aiconv=ai.j.data?.id; S.aiStatus=ai.s;
  fs.writeFileSync(st,JSON.stringify(S,null,1)); const {A,B,...ids}=S; console.log(JSON.stringify(ids));
 } else {
  const S=JSON.parse(fs.readFileSync(st));
  const login=await api('POST','/auth/login',null,{email:S.A.email,password:'TestPass123'}); const t=login.j.data?.token; console.log('re-login',login.s);
  const lb=await api('POST','/auth/login',null,{email:S.B.email,password:'TestPass123'}); const tb=lb.j.data?.token;
  const chk=async(name,path,pred)=>{const a=await api('GET',path,t); const b=await api('GET',path,tb); console.log(name.padEnd(16),'A',a.s,pred(a.j)?'FOUND':'MISSING','| B',b.s,b.s>=400||!pred(b.j)?'not visible':'VISIBLE');};
  const has=(id)=>(j)=>JSON.stringify(j).includes(id);
  await chk('note','/notes',has(S.note)); await chk('deck','/flashcards/decks',has(S.deck));
  await chk('card review',`/flashcards/decks/${S.deck}`,(j)=>JSON.stringify(j).includes(S.card)&&/"repetitions?":\s*[1-9]|"review_count":\s*[1-9]|"state":"REVIEW"|"status":"REVIEW"/.test(JSON.stringify(j)));
  await chk('plan+task','/study-planner/plans',(j)=>JSON.stringify(j).includes(S.plan)&&JSON.stringify(j).includes('Revise deadlocks'));
  await chk('doubt','/doubts',has(S.doubt)); await chk('lang enroll','/languages/enrollments/my',(j)=>JSON.stringify(j).includes('"es"'));
  await chk('lesson done','/languages/es/dashboard',(j)=>/"completed_lessons(_count)?":\s*[1-9]|1\/6|"completed_count":\s*1/.test(JSON.stringify(j)));
  await chk('conversation','/languages/es/conversations',has(S.conv)); await chk('document','/documents',has(S.doc)); await chk('ai conversation','/ai/conversations',has(S.aiconv));
 }
})();
