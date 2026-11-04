const { chromium } = require('playwright');
const BASE=process.env.BASE||'http://localhost:3000';
const routes=process.env.ROUTES.split(',');
(async()=>{
  const reg=await fetch(BASE+'/api/v1/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'Mobile',email:`m.${Date.now()}@example.test`,password:'TestPass123'})}).then(r=>r.json());
  const token=reg.data.token;
  await fetch(BASE+'/api/v1/students/me/onboarding/complete',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:'{}'});
  const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:390,height:844}});
  await ctx.addInitScript(t=>localStorage.setItem('auth_token',t),token);
  const out=[];
  for(const r of routes){const p=await ctx.newPage(); await p.goto(BASE+r,{waitUntil:'networkidle',timeout:30000}).catch(()=>{}); await p.waitForTimeout(800);
    const m=await p.evaluate(()=>({sw:document.documentElement.scrollWidth,iw:window.innerWidth, h1:document.querySelectorAll('h1').length, unlabeled:[...document.querySelectorAll('button')].filter(x=>x.offsetParent&&!x.innerText.trim()&&!x.getAttribute('aria-label')&&!x.getAttribute('title')).length, imgsNoAlt:[...document.querySelectorAll('img')].filter(i=>!i.hasAttribute('alt')).length}));
    out.push({r,...m}); console.log(JSON.stringify({r,...m})); await p.close();}
  require('fs').writeFileSync('mobile.json',JSON.stringify(out,null,2)); await b.close();
})();
