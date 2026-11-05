// Phase 2 Batch 1 journeys (Coding, DSA, SQL) with persistence across a restart.
// 1. PORT=3300 DATA_SNAPSHOT_PATH=/tmp/x/snap.json npx tsx server.ts
// 2. BASE=http://localhost:3300 STATE=/tmp/x/b1.json node scripts/audit/phase2-batch1.cjs create
// 3. Restart the server with the same DATA_SNAPSHOT_PATH, then run with 'verify'.
const fs=require('fs'); const BASE=(process.env.BASE||'http://localhost:3300')+'/api/v1'; const st=process.env.STATE||'phase2-b1-state.json';
const api=async(m,p,t,b)=>{const r=await fetch(BASE+p,{method:m,headers:{'Content-Type':'application/json',...(t?{Authorization:'Bearer '+t}:{})},body:b?JSON.stringify(b):undefined});let j;try{j=await r.json()}catch{j={}}return {s:r.status,j};};
const log=(k,ok,info='')=>console.log(`${ok?'PASS':'FAIL'}  ${k.padEnd(40)} ${info}`);
(async()=>{
 const phase=process.argv[2];
 if(phase==='create'){
  const ts=Date.now(); const S={};
  for(const k of ['A','B']){const e=`p2b1${k}.${ts}@example.test`; const r=await api('POST','/auth/register',null,{email:e,password:'TestPass123',name:'Batch1 '+k}); S[k]={email:e,token:r.j.data.token}; await api('POST','/students/me/onboarding/complete',r.j.data.token,{});}
  const t=S.A.token;
  // Journey 1: Coding
  const run=await api('POST','/coding/run',t,{language:'python',source_code:'n=int(input())\nprint(n*n)',stdin:'12'}); log('J1 run program',run.j.data?.stdout==='144\n',`${run.j.data?.status} ${JSON.stringify(run.j.data?.stdout)}`);
  const sv=await api('POST','/coding/saved',t,{title:'Square a number',language:'python',source_code:'n=int(input())\nprint(n*n)'}); S.saved=sv.j.data?.id; log('J1 save program',sv.s===201||sv.s===200,`status ${sv.s} id ${S.saved}`);
  const ex=await api('GET','/coding/executions',t); log('J1 execution history recorded',(ex.j.data||[]).some(e=>e.stdout==='144\n'));
  // Journey 2: DSA
  const prob=(await api('GET','/dsa/problems/dsa_top150_001',t)).j.data; log('DSA hidden tests not exposed',!('hidden_test_cases' in prob)&&prob.hidden_test_case_count>0,`hidden count ${prob.hidden_test_case_count}`);
  const wrong=await api('POST','/dsa/problems/dsa_top150_001/submit',t,{language:'python',source_code:'print("0 1")'}); log('J2 wrong solution rejected',wrong.j.data?.status==='WRONG_ANSWER',`${wrong.j.data?.status} ${wrong.j.data?.passed_tests}/${wrong.j.data?.total_tests}`);
  const sol='import sys\nd=sys.stdin.read().split("\\n")\nnums=list(map(int,d[0].split()))\nt=int(d[1])\nseen={}\nfor i,x in enumerate(nums):\n  if t-x in seen:\n    print(seen[t-x],i);break\n  seen[x]=i';
  const sub=await api('POST','/dsa/problems/dsa_top150_001/submit',t,{language:'python',source_code:sol}); log('J2 correct solution accepted',sub.j.data?.status==='ACCEPTED',`${sub.j.data?.status} ${sub.j.data?.passed_tests}/${sub.j.data?.total_tests}`);
  const leak=JSON.stringify(sub.j.data?.test_results||[]); log('J2 hidden test I/O not in submit response',!(sub.j.data?.test_results||[]).some(r=>r.is_hidden&&(r.input||r.expected_output)),'');
  const pr=await api('GET','/dsa/progress',t); log('J2 progress shows solved',(pr.j.data?.problems_solved||[]).includes('dsa_top150_001'));
  // Journey 3: SQL
  const ct=await api('POST','/sql-lab/schemas/university_db/tables',t,{name:'labs_p2',columns:[{name:'lab_id',type:'INTEGER',is_primary_key:true,is_auto_increment:true},{name:'title',type:'VARCHAR',length_precision:'80',is_nullable:false}],sample_rows:[]}); log('J3 create table',ct.s===201,`${ct.s} ${ct.j.message||''}`);
  const ins=await api('POST','/sql-lab/execute',t,{db_name:'university_db',query:"INSERT INTO labs_p2 (title) VALUES ('DBMS Lab'),('OS Lab'); SELECT * FROM labs_p2 ORDER BY lab_id"}); log('J3 insert + select',ins.j.data?.success&&ins.j.data.rows.length===2,JSON.stringify(ins.j.data?.rows||ins.j.data?.error));
  const sq=await api('POST','/sql-lab/saved-queries',t,{name:'All labs',query:'SELECT * FROM labs_p2',schema_name:'university_db'}); S.savedQuery=sq.j.data?.id; log('J3 save query',sq.s===201);
  const crossB=await api('POST','/sql-lab/execute',S.B.token,{db_name:'university_db',query:'SELECT * FROM labs_p2'}); log('SQL student B cannot see A table',crossB.j.data?.success===false,crossB.j.data?.error);
  fs.writeFileSync(st,JSON.stringify(S,null,1));
 } else {
  const S=JSON.parse(fs.readFileSync(st));
  const t=(await api('POST','/auth/login',null,{email:S.A.email,password:'TestPass123'})).j.data?.token; const tb=(await api('POST','/auth/login',null,{email:S.B.email,password:'TestPass123'})).j.data?.token;
  const sv=await api('GET','/coding/saved',t); log('J1 saved program after restart',JSON.stringify(sv.j).includes(S.saved));
  const svB=await api('GET',`/coding/saved/${S.saved}`,tb); log('J1 student B cannot open A program',svB.s>=400,`status ${svB.s}`);
  const pr=await api('GET','/dsa/progress',t); log('J2 solved status after restart',(pr.j.data?.problems_solved||[]).includes('dsa_top150_001'));
  const prB=await api('GET','/dsa/progress',tb); log('J2 student B progress separate',!(prB.j.data?.problems_solved||[]).includes('dsa_top150_001'));
  const q=await api('POST','/sql-lab/execute',t,{db_name:'university_db',query:'SELECT title FROM labs_p2 ORDER BY lab_id'}); log('J3 table rows after restart',q.j.data?.rows?.length===2,JSON.stringify(q.j.data?.rows||q.j.data?.error));
  const sq=await api('GET','/sql-lab/saved-queries',t); log('J3 saved query after restart',JSON.stringify(sq.j).includes(S.savedQuery));
  const sqB=await api('GET','/sql-lab/saved-queries',tb); log('J3 student B cannot see saved query',!JSON.stringify(sqB.j).includes(S.savedQuery));
  const h=await api('GET','/sql-lab/history',t); log('J3 query history after restart',(h.j.data||[]).length>0,`${(h.j.data||[]).length} entries`);
 }
})();
