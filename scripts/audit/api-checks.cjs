const BASE=(process.env.BASE||'http://localhost:3000')+'/api/v1';
const out=[];
async function call(method, path, token, body){
  const r=await fetch(BASE+path,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:body?JSON.stringify(body):undefined});
  let j; const t=await r.text(); try{j=JSON.parse(t)}catch{j=t}
  return {s:r.status,j};
}
function rec(id,desc,ok,detail){out.push({id,desc,ok,detail});console.log(`${ok?'PASS':'FAIL'} ${id} ${desc} :: ${detail}`)}
(async()=>{
  const ts=Date.now();
  const A={email:`a.${ts}@example.test`,password:'TestPass123',name:'Student A'};
  const B={email:`b.${ts}@example.test`,password:'TestPass456',name:'Student B'};
  let r=await call('POST','/auth/register',null,A); rec('AUTH-1','register A',r.s===201&&!JSON.stringify(r.j).includes('password_hash'),`${r.s}`); const ta=r.j.data.token;
  r=await call('POST','/auth/register',null,B); const tb=r.j.data.token; rec('AUTH-2','register B',r.s===201,`${r.s}`);
  r=await call('POST','/auth/register',null,A); rec('AUTH-3','duplicate email rejected',r.s===400,`${r.s} ${r.j.error?.message}`);
  r=await call('POST','/auth/register',null,{name:'x',email:'bad',password:'123456'}); rec('AUTH-4','invalid email rejected',r.s===400,`${r.s}`);
  r=await call('POST','/auth/register',null,{name:'x',email:`c.${ts}@example.test`,password:'123'}); rec('AUTH-5','short password rejected',r.s===400,`${r.s}`);
  r=await call('POST','/auth/login',null,{email:A.email,password:'wrong'}); rec('AUTH-6','wrong password rejected',r.s===401||r.s===400,`${r.s}`);
  r=await call('POST','/auth/login',null,{email:A.email,password:A.password}); rec('AUTH-7','login A',r.s===200&&!!r.j.data?.token,`${r.s}`);
  r=await call('GET','/auth/me',ta); rec('AUTH-8','me returns A',r.s===200&&r.j.data?.student?.email===A.email,`${r.s} ${r.j.data?.student?.email}`);
  r=await call('GET','/auth/me',null); rec('AUTH-9','me without token -> 401',r.s===401,`${r.s}`);
  r=await call('GET','/auth/me','garbage.token.here'); rec('AUTH-10','me with bad token -> 401',r.s===401,`${r.s}`);
  r=await call('GET','/notes',null); rec('AUTH-11','protected /notes without token -> 401',r.s===401,`${r.s}`);
  // expired token
  const jwt=require('jsonwebtoken');
  const exp=jwt.sign({userId:'x',email:A.email,role:'STUDENT',name:'A'},'btech-ai-platform-dev-secret-key-32chars-min',{expiresIn:-10});
  r=await call('GET','/auth/me',exp); rec('AUTH-12','expired token -> 401',r.s===401,`${r.s}`);
  // Notes
  r=await call('POST','/notes',ta,{title:'Test Note A',content:'Binary search runs in O(log n).',tags:['dsa']}); rec('NOTE-1','create note',r.s===201||r.s===200,`${r.s} ${JSON.stringify(r.j).slice(0,150)}`); const noteId=r.j.data?.id;
  r=await call('POST','/notes',ta,{title:'',content:''}); rec('NOTE-2','empty note rejected',r.s===400,`${r.s} ${r.j.error?.message||''}`);
  r=await call('GET','/notes',ta); rec('NOTE-3','list notes has note',r.s===200&&JSON.stringify(r.j).includes(noteId),`${r.s} total=${r.j.data?.total}`);
  r=await call('PATCH','/notes/'+noteId,ta,{title:'Test Note A edited'}); rec('NOTE-4','edit note',r.s===200&&r.j.data?.title==='Test Note A edited',`${r.s}`);
  r=await call('GET','/notes/'+noteId,ta); rec('NOTE-4b','title-only edit keeps content & tags',r.j.data?.content==='Binary search runs in O(log n).'&&r.j.data?.tags?.[0]==='dsa',`content=${JSON.stringify(r.j.data?.content)} tags=${JSON.stringify(r.j.data?.tags)}`);
  r=await call('PATCH','/notes/'+noteId,ta,{title:'   '}); rec('NOTE-4c','blank title edit rejected',r.s===400,`${r.s}`);
  r=await call('GET','/notes/search?q=Binary',ta); rec('NOTE-5','search notes',r.s===200&&JSON.stringify(r.j).includes(noteId),`${r.s} ${JSON.stringify(r.j).slice(0,120)}`);
  r=await call('GET','/notes/'+noteId,tb); rec('SEC-1','B cannot read A note',r.s===403||r.s===404,`${r.s}`);
  r=await call('PATCH','/notes/'+noteId,tb,{title:'pwned'}); rec('SEC-2','B cannot edit A note',r.s===403||r.s===404,`${r.s}`);
  r=await call('DELETE','/notes/'+noteId,tb); rec('SEC-3','B cannot delete A note',r.s===403||r.s===404,`${r.s}`);
  r=await call('GET','/notes',tb); rec('SEC-4','B list excludes A note',!JSON.stringify(r.j).includes(noteId),`${r.s}`);
  r=await call('DELETE','/notes/'+noteId,ta); rec('NOTE-6','delete note',r.s===200||r.s===204,`${r.s}`);
  r=await call('GET','/notes/'+noteId,ta); rec('NOTE-7','deleted note 404',r.s===404,`${r.s}`);
  // Flashcards
  r=await call('POST','/flashcards/decks',ta,{title:'Deck A',subject:'DSA'}); rec('FC-1','create deck',r.s<300,`${r.s} ${JSON.stringify(r.j).slice(0,160)}`); const deckId=r.j.data?.id;
  r=await call('POST',`/flashcards/decks/${deckId}/cards`,ta,{front:'What is O(log n)?',back:'Logarithmic time'}); rec('FC-2','add card',r.s<300,`${r.s} ${JSON.stringify(r.j).slice(0,160)}`); const cardId=r.j.data?.id;
  r=await call('POST',`/flashcards/decks/${deckId}/cards/${cardId}/review`,ta,{rating:'GOOD'}); rec('FC-3','review card',r.s<300,`${r.s} ${JSON.stringify(r.j).slice(0,200)}`);
  r=await call('GET',`/flashcards/decks/${deckId}`,tb); rec('SEC-5','B cannot read A deck',r.s===403||r.s===404,`${r.s}`);
  r=await call('DELETE',`/flashcards/decks/${deckId}/cards/${cardId}`,tb); rec('SEC-6','B cannot delete A card',r.s===403||r.s===404,`${r.s}`);
  r=await call('GET',`/flashcards/decks/${deckId}`,ta); rec('FC-4','deck persisted w/ card',r.s===200&&JSON.stringify(r.j).includes(cardId),`${r.s}`);
  r=await call('POST','/flashcards/generate/from-note',ta,{}); rec('FC-5','from-note missing id -> 400',r.s===400,`${r.s} ${r.j.message||''}`);
  // Goals
  r=await call('POST','/goals',ta,{title:'Finish DSA',description:'x',target_date:'2026-12-31',milestones:[{title:'Arrays'}]}); rec('GOAL-1','create goal',r.s<300,`${r.s} ${JSON.stringify(r.j).slice(0,140)}`); const goalId=r.j.data?.id;
  r=await call('GET','/goals/'+goalId,tb); rec('SEC-7','B cannot read A goal',r.s===403||r.s===404,`${r.s}`);
  r=await call('DELETE','/goals/'+goalId,tb); rec('SEC-8','B cannot delete A goal',r.s===403||r.s===404,`${r.s}`);
  // Courses
  r=await call('GET','/courses?limit=200',ta); const courses=r.j.data?.items||[]; rec('CRS-1','catalog loads',r.s===200,`${r.s} total=${r.j.data?.total} unique=${new Set(courses.map(c=>c.id)).size}`);
  const c0=courses[0];
  r=await call('POST',`/courses/${c0.id}/enroll`,ta); rec('CRS-2','enroll',r.s<300,`${r.s}`);
  r=await call('POST',`/courses/${c0.id}/enroll`,ta); rec('CRS-3','duplicate enroll is idempotent/rejected',r.s<300||r.s===400||r.s===409,`${r.s} ${JSON.stringify(r.j).slice(0,120)}`);
  r=await call('GET',`/courses/${c0.id}`,ta); const lesson=r.j.data?.chapters?.[0]?.lessons?.[0]; rec('CRS-4','course detail w/ lessons',!!lesson,`${r.s} chapters=${r.j.data?.chapters?.length}`);
  if(lesson){ r=await call('POST',`/lessons/${lesson.id}/complete`,ta); rec('CRS-5','complete lesson',r.s<300,`${r.s}`);
    r=await call('GET',`/courses/${c0.id}`,ta); rec('CRS-6','progress reflects completion',(r.j.data?.progress_percentage||r.j.data?.enrollment?.progress_percentage||0)>0,`pct=${r.j.data?.progress_percentage} ${JSON.stringify(r.j.data?.enrollment||{}).slice(0,120)}`);
    r=await call('GET',`/courses/${c0.id}`,tb); rec('SEC-9','B does not see A progress',!(r.j.data?.progress_percentage>0),`pct=${r.j.data?.progress_percentage}`);}
  r=await call('DELETE',`/courses/${c0.id}`,tb); rec('SEC-10','B DELETE catalog course does not remove it globally',true,`${r.s} ${JSON.stringify(r.j).slice(0,160)}`);
  r=await call('GET',`/courses/${c0.id}`,ta); rec('SEC-10b','course still available to A after B delete',r.s===200,`${r.s}`);
  r=await call('PATCH',`/courses/${c0.id}`,tb,{title:'Hacked title'}); rec('SEC-11','B cannot rename catalog course',!(r.s<300&&r.j.data?.title==='Hacked title'),`${r.s} ${JSON.stringify(r.j).slice(0,140)}`);
  r=await call('POST',`/courses/${c0.id}/resources`,ta,{title:'A private link',type:'LINK',url:'https://example.test/a'}); const resId=r.j.data?.id; rec('CRS-7','A attaches resource',r.s<300&&!!resId,`${r.s} ${JSON.stringify(r.j).slice(0,120)}`);
  r=await call('GET',`/courses/${c0.id}`,tb); rec('SEC-13','B does not see A resource',!JSON.stringify(r.j).includes(resId),`${r.s}`);
  r=await call('DELETE',`/courses/${c0.id}/resources/${resId}`,tb); rec('SEC-14','B cannot delete A resource',r.s===403||r.s===404,`${r.s}`);
  r=await call('GET',`/courses/${c0.id}`,ta); rec('CRS-8','A still sees own resource',JSON.stringify(r.j).includes(resId),`${r.s}`);
  r=await call('POST',`/courses/${c0.id}/chapters`,tb,{title:'Injected chapter'}); rec('SEC-15','B cannot add chapter to catalog course',r.s===403,`${r.s}`);
  r=await call('POST','/courses',ta,{title:'My Custom Course'}); const cc=r.j.data?.id; rec('CRS-9','create custom course',r.s===201,`${r.s}`);
  r=await call('PATCH',`/courses/${cc}`,ta,{title:'My Custom Course v2'}); rec('CRS-10','owner edits custom course',r.s===200&&r.j.data?.title==='My Custom Course v2',`${r.s}`);
  r=await call('PATCH',`/courses/${cc}`,tb,{title:'x'}); rec('SEC-16','B cannot edit A custom course',r.s===403||r.s===404,`${r.s}`);
  // AI tutor context
  r=await call('GET','/ai/tutor/context-options',ta); rec('AI-1','tutor context-options',r.s===200&&Array.isArray(r.j.data?.courses),`${r.s} courses=${r.j.data?.courses?.length}`);
  r=await call('GET','/ai/conversations/conv_01',ta); rec('SEC-12','A cannot read seeded demo conversation',r.s===403||r.s===404,`${r.s}`);
  // Notifications & profile export
  r=await call('GET','/notifications',ta); rec('NOTIF-1','notifications list',r.s===200,`${r.s}`);
  r=await call('GET','/profile/export',ta); rec('PROF-1','profile export',r.s===200,`${r.s} ${JSON.stringify(r.j).slice(0,140)}`);
  // Learning modules ValidationError
  r=await call('POST','/flashcards/generate/from-document',ta,{}); rec('LM-1','from-document missing id -> 400',r.s===400,`${r.s}`);
  // Logout
  r=await call('POST','/auth/logout',ta); rec('AUTH-13','logout',r.s===200,`${r.s}`);
  require('fs').writeFileSync(process.env.OUT||'api-results.json',JSON.stringify(out,null,2));
})().catch(e=>{console.error(e);process.exit(1)});
