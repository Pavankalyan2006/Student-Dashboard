// Phase 2: code-execution sandbox probe. Needs a running server: BASE=http://localhost:PORT node scripts/audit/phase2-code-sandbox.cjs
// Each case prints HTTP status, execution status, isolation level and a tail of stdout/stderr.
const BASE=(process.env.BASE||'http://localhost:3300')+'/api/v1'; const ROOT=process.env.APP_ROOT||process.cwd();
const api=async(m,p,t,b)=>{const r=await fetch(BASE+p,{method:m,headers:{'Content-Type':'application/json',...(t?{Authorization:'Bearer '+t}:{})},body:b?JSON.stringify(b):undefined});let j;try{j=await r.json()}catch{j={}}return {s:r.status,j};};
(async()=>{
 const e=`p2sbx.${Date.now()}@example.test`; const t=(await api('POST','/auth/register',null,{email:e,password:'TestPass123',name:'Sandbox probe'})).j.data.token;
 const run=async(language,source_code,stdin='')=>{const t0=Date.now();const r=await api('POST','/coding/run',t,{language,source_code,stdin});const d=r.j.data||{};return `${r.s} ${d.status} iso=${d.isolation} wall=${Date.now()-t0}ms out=${JSON.stringify((d.stdout||'').slice(0,40))} err=${JSON.stringify((d.stderr||'').slice(-90))}`;};
 const port=new URL(BASE).port||'80';
 const cases={
  hello_python:['python','print("Hello")'], arithmetic:['python','print(7*6, 10//3, 2**10)'], conditional:['python','x=int(input())\nprint("even" if x%2==0 else "odd")','7'],
  loop_function:['python','def f(n):\n  return sum(range(n+1))\nfor i in range(3): print(f(i))'], arrays_strings:['python','a=[3,1,2];a.sort();print(a,"abc"[::-1])'],
  user_input:['python','a,b=map(int,input().split());print(a+b)','3 4'], syntax_error:['python','print("x"'], runtime_error:['python','print(1/0)'],
  infinite_loop:['python','while True: pass'], sleeping:['python','import time;time.sleep(30)'], excessive_output:['python','while True: print("x"*1000)'],
  env_secrets:['python','import os;print(sorted(os.environ.keys()))'], app_dir:['python',`import os;print(os.listdir(${JSON.stringify(ROOT)}))`], tmp_dir:['python','import os;print(os.listdir("/tmp"))'],
  etc_shadow:['python','print(open("/etc/shadow").read()[:5])'], network:['python',`import urllib.request;print(urllib.request.urlopen("http://127.0.0.1:${port}/api/v1/health",timeout=2).read()[:20])`],
  memory_1gb:['python','x=bytearray(1024*1024*1024);print(len(x))'], fork_bomb:['python','import os\nfor i in range(12):\n  try: os.fork()\n  except OSError: pass\nprint(1)'],
  host_kill:['python','import os,signal\ntry:\n  os.kill(1, signal.SIGTERM); print("sent to pid1 (own namespace)")\nexcept Exception as e: print(e)'],
  js_hello:['javascript','console.log("hi")'], js_heap:['javascript','const a=[];while(true)a.push(new Array(1e6).fill(1))'],
  c_hello:['c','#include <stdio.h>\nint main(){printf("hi\\n");return 0;}'], c_include_host:['c',`#include ${JSON.stringify(ROOT+'/package.json')}\nint main(){}`], c_compile_error:['c','int main(){ return x; }'], c_segfault:['c','int main(){int*p=0;return *p;}'],
  cpp_hello:['cpp','#include <iostream>\nint main(){std::cout<<"hi";}'], java_hello:['java','public class Main{public static void main(String[] a){System.out.println("hi");}}'],
 };
 for(const [k,v] of Object.entries(cases)) console.log(k.padEnd(16), await run(...v));
 const l=await api('GET','/coding/languages'); console.log('languages', l.j.data.map(x=>`${x.id}:${x.available}`).join(' '));
 const un=await api('POST','/coding/run',null,{language:'python',source_code:'print(1)'}); console.log('unauthenticated', un.s);
})();
