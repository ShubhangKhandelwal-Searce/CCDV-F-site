/* ================= state ================= */
const ORDER=[];DOMAINS.forEach(d=>d.s.forEach(s=>ORDER.push(s[0])));
const SKMETA={};DOMAINS.forEach(d=>d.s.forEach(s=>SKMETA[s[0]]={d:d.n,dt:d.t,t:s[1],w:s[2]}));
const KEY="ccdvf.v1";
let store={done:{},best:null};
try{const r=localStorage.getItem(KEY);if(r)store=Object.assign(store,JSON.parse(r));}catch(e){}
function save(){try{localStorage.setItem(KEY,JSON.stringify(store));}catch(e){}}

const main=document.getElementById("main");
const rail=document.getElementById("rail");
let route={v:"home"};

/* ================= helpers ================= */
function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
function fig(name){const f=FIG[name];if(!f)return"";
  return '<figure>'+f.s+'<figcaption>'+f.c+'</figcaption></figure>';}
function body(html){return html.replace(/\[\[FIG:([a-z-]+)\]\]/g,(m,n)=>fig(n));}
function shuffle(a){const x=a.slice();for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]];}return x;}
function pct(n,d){return d?Math.round(n/d*100):0;}

/* ================= rail ================= */
function renderRail(){
  let h='<div class="railsec">Curriculum</div>';
  DOMAINS.forEach(d=>{
    const open=(route.v==="lesson"&&SKMETA[route.id].d===d.n)||(route.v==="domain"&&route.n===d.n);
    h+='<div class="dgroup'+(open?" open":"")+'" data-dg="'+d.n+'">'+
       '<button class="dhead" aria-expanded="'+(open?"true":"false")+'" data-dom="'+d.n+'">'+
       '<span class="dn">'+d.n+'</span><span>'+esc(d.t)+'</span><span class="dw">'+d.w.toFixed(1)+'%</span></button><div class="dkids">';
    d.s.forEach(s=>{
      const cur=route.v==="lesson"&&route.id===s[0];
      h+='<button data-les="'+s[0]+'"'+(cur?' aria-current="true"':'')+'>'+
         '<span class="sk">'+s[0]+'</span>'+esc(s[1])+(store.done[s[0]]?' <span class="pill g">done</span>':'')+'</button>';
    });
    h+='</div></div>';
  });
  h+='<div class="railsec">Look up</div>'+
     '<button class="raillink" data-go="ref"'+(route.v==="ref"?' aria-current="true"':'')+'>Quick reference</button>'+
     '<button class="raillink" data-go="traps"'+(route.v==="traps"?' aria-current="true"':'')+'>Trap index</button>'+
     '<button class="raillink" data-go="glossary"'+(route.v==="glossary"?' aria-current="true"':'')+'>Glossary</button>'+
     '<div class="railsec">Practice</div>'+
     '<button class="raillink" data-go="exam"'+(route.v==="exam"?' aria-current="true"':'')+'>Mock exam — 53 items</button>'+
     '<button class="raillink" data-go="home">Blueprint overview</button>';
  rail.innerHTML=h;
}

/* ================= quiz ================= */
function quizHTML(q,idx,mode){
  const keys=["A","B","C","D","E"];
  let h='<div class="quiz" data-q="'+q.i+'">';
  h+='<div class="qmeta">Domain '+q.d+' · '+q.s+(mode==="exam"?" · item "+(idx+1):"")+'</div>';
  h+='<div class="qstem">'+esc(q.q)+'</div>';
  q.o.forEach((o,k)=>{h+='<button class="opt" data-k="'+k+'"><span class="k">'+keys[k]+'</span><span>'+esc(o)+'</span></button>';});
  h+='<div class="rat" hidden></div></div>';
  return h;
}
function wireQuiz(root,mode){
  root.querySelectorAll(".quiz").forEach(box=>{
    const q=Q.find(x=>x.i===box.dataset.q)||box._q;
    const qq=box._q||q;
    box.querySelectorAll(".opt").forEach(btn=>{
      btn.addEventListener("click",()=>{
        const k=+btn.dataset.k;
        if(mode==="exam"){
          box.querySelectorAll(".opt").forEach(b=>b.dataset.s="");
          btn.dataset.s="sel";box._pick=k;updateExamBar();return;
        }
        if(box._answered)return;box._answered=true;
        const ok=k===qq.a;
        box.querySelectorAll(".opt").forEach(b=>{b.disabled=true;
          if(+b.dataset.k===qq.a)b.dataset.s="right";else if(b===btn)b.dataset.s="wrong";});
        const rat=box.querySelector(".rat");
        rat.className="rat "+(ok?"ok":"no");
        rat.innerHTML='<span class="vd">'+(ok?"Correct.":"Not quite.")+'</span>'+esc(qq.r);
        rat.hidden=false;
      });
    });
  });
}

/* ================= views ================= */
function viewHome(){
  const totalQ=Q.length,skills=ORDER.length,done=Object.keys(store.done).length;
  let h='<div class="wide">';
  h+='<div class="crumb"><span class="cw">CCDV-F</span><span>Claude Certified Developer — Foundations</span><span>·</span><span>Exam Guide v1.0, July 2026</span></div>';
  h+='<h1>The exam is a blueprint. Study it in proportion.</h1>';
  h+='<p class="lede">Fifty-three items in 120 minutes, scored 100–1,000 with a cut at 720. The weights below are not decoration: two domains carry half the exam between them, and three carry under nine percent combined. Time spent should look like this chart.</p>';
  h+='<div class="bp">';
  DOMAINS.forEach(d=>{h+='<button class="bprow" data-dom="'+d.n+'">'+
    '<span class="bpn">'+d.n+'</span><span class="bpt">'+esc(d.t)+'</span>'+
    '<span class="bpbar"><i style="width:'+(d.w/33.1*100)+'%"></i></span>'+
    '<span class="bpw">'+d.w.toFixed(1)+'</span></button>';});
  h+='</div>';
  h+='<div class="stats">'+
     '<div class="stat"><div class="v">53</div><div class="l">scored items</div></div>'+
     '<div class="stat"><div class="v">120</div><div class="l">minutes</div></div>'+
     '<div class="stat"><div class="v">720</div><div class="l">cut score, of 1,000</div></div>'+
     '<div class="stat"><div class="v">'+skills+'</div><div class="l">skills covered here</div></div>'+
     '<div class="stat"><div class="v">'+totalQ+'</div><div class="l">practice items</div></div>'+
     '<div class="stat"><div class="v">'+done+'</div><div class="l">lessons marked done</div></div>'+
     '</div>';
  h+='<div class="btnrow"><button class="btn" data-les="1.1">Start at Domain 1</button>'+
     '<button class="btn ghost" data-go="exam">Take the mock exam</button>'+
     '<button class="btn ghost" data-go="traps">Skim the trap index</button></div>';

  h+='<h2>How to use this</h2>'+
  '<p>Every skill in the blueprint has its own page, in blueprint order, with the same shape: what you need to know, a diagram where one helps, the traps that specific skill attracts, and practice items written in the exam\'s style. The trap index collects every trap in one place, which is the best thing to read the night before.</p>'+
  '<p>Two domains deserve most of your time. <strong>Applications and Integration</strong> is a third of the exam on its own, and its heaviest skills are Claude Application Design and Software Engineering Foundations rather than API trivia. <strong>Model Selection and Optimization</strong> is another sixth, and almost all of it is arithmetic you can do in your head once you know six multipliers.</p>';

  h+='<h2>What the exam actually rewards</h2>'+
  '<p>Reading the sample items and the objective list together, five habits keep coming up.</p>'+
  '<ol>'+
  '<li><strong>The cheapest architecture that meets the requirement.</strong> An agent where a workflow would do is wrong, and so is a bigger model where a cached prefix would do.</li>'+
  '<li><strong>Enforcement over instruction.</strong> Anything phrased as "must never" or "regulatory" resolves to code, a permission rule, or a hook — never to a prompt.</li>'+
  '<li><strong>Trust boundaries.</strong> Retrieved content, tool results, and MCP output are data. The model is never an authorisation layer.</li>'+
  '<li><strong>Deterministic signals.</strong> <code>stop_reason</code>, schema validation, exit codes — not natural language, not content-type checks, not iteration counts.</li>'+
  '<li><strong>Measurement before opinion.</strong> Evals decide model choice and prompt changes; benchmarks and intuition do not.</li>'+
  '</ol>';

  h+='<h2>Exam logistics</h2>'+
  '<div class="tw"><table><tbody>'+
  '<tr><th>Credential</th><td>Claude Certified Developer – Foundations</td></tr>'+
  '<tr><th>Exam code</th><td>CCDV-F</td></tr>'+
  '<tr><th>Items</th><td>53, multiple choice and multiple response; each item states how many to select</td></tr>'+
  '<tr><th>Time</th><td>120 minutes</td></tr>'+
  '<tr><th>Scoring</th><td>Scaled 100–1,000, criterion-referenced, cut score 720. Per-domain percentages are reported but do not decide pass or fail</td></tr>'+
  '<tr><th>Fee</th><td>$125 USD per attempt</td></tr>'+
  '<tr><th>Delivery</th><td>Pearson VUE, online proctored or at a test centre</td></tr>'+
  '<tr><th>Validity</th><td>12 months; free non-proctored renewal assessment if you renew on time</td></tr>'+
  '<tr><th>Retakes</th><td>14 days after a first failure, 30 after a second, 90 after a third; four attempts per rolling 12 months</td></tr>'+
  '<tr><th>Audience</th><td>1–5 years of software engineering, 6+ months with Claude or comparable LLM systems, Python and/or TypeScript</td></tr>'+
  '</tbody></table></div>'+
  '<p class="srcs">Logistics reflect Exam Guide v1.0 (July 2026). Verify current details on the Anthropic Partner Academy before booking.</p>';
  h+='</div>';
  main.innerHTML=h;
}

function viewDomain(n){
  const d=DOMAINS.find(x=>x.n===n);
  let h='<div class="wrap">';
  h+='<div class="crumb"><button data-go="home">Blueprint</button><span>/</span><span class="cw">Domain '+d.n+'</span><span>'+d.w.toFixed(1)+'% of the exam</span></div>';
  h+='<h1>'+esc(d.t)+'</h1><p class="lede">'+esc(d.b)+'</p>';
  h+='<div class="bp">';
  d.s.forEach(s=>{h+='<button class="bprow" data-les="'+s[0]+'">'+
    '<span class="bpn">'+s[0]+'</span><span class="bpt">'+esc(s[1])+'</span>'+
    '<span class="bpbar"><i style="width:'+(s[2]/8.6*100)+'%"></i></span>'+
    '<span class="bpw">'+s[2].toFixed(1)+'</span></button>';});
  h+='</div>';
  const qs=Q.filter(q=>q.d===n);
  h+='<p style="margin-top:22px">'+qs.length+' practice items cover this domain. Weights shown are each skill\'s share of the whole exam, not of the domain.</p>';
  h+='<div class="btnrow"><button class="btn" data-les="'+d.s[0][0]+'">Open '+d.s[0][0]+' — '+esc(d.s[0][1])+'</button></div>';
  h+='</div>';
  main.innerHTML=h;
}

function viewLesson(id){
  const l=L[id],m=SKMETA[id];
  if(!l){main.innerHTML='<div class="wrap"><h1>Not found</h1></div>';return;}
  const i=ORDER.indexOf(id),prev=ORDER[i-1],next=ORDER[i+1];
  let h='<div class="wrap">';
  h+='<div class="crumb"><button data-go="home">Blueprint</button><span>/</span>'+
     '<button data-dom="'+m.d+'">Domain '+m.d+'</button><span>/</span>'+
     '<span class="cw">'+id+'</span><span>'+m.w.toFixed(1)+'% of the exam</span></div>';
  h+='<h1>'+esc(l.t)+'</h1>';
  h+='<p class="lede">'+esc(l.lede)+'</p>';
  h+=body(l.body);

  h+='<h2>Exam traps</h2>';
  l.traps.forEach(t=>{h+='<div class="trap"><div class="tq">'+t[0]+'</div><div class="ta">'+t[1]+'</div></div>';});

  const qs=Q.filter(q=>q.s===id);
  if(qs.length){
    h+='<h2>Practice</h2><p>Answer before revealing. The rationale explains why the distractors fail, which is where most of the learning is.</p>';
    qs.forEach((q,k)=>{h+=quizHTML(q,k,"learn");});
  }

  if(l.src&&l.src.length){
    h+='<h2>Primary sources</h2><ul class="srcs">';
    l.src.forEach(s=>{h+='<li><a href="'+s[1]+'" target="_blank" rel="noopener">'+esc(s[0])+'</a></li>';});
    h+='</ul>';
  }

  h+='<div class="btnrow"><button class="btn'+(store.done[id]?" ghost":"")+'" id="markdone">'+
     (store.done[id]?"Marked done — undo":"Mark this skill done")+'</button></div>';

  h+='<div class="pager">';
  h+=prev?'<button data-les="'+prev+'"><span class="pl">Previous · '+prev+'</span>'+esc(SKMETA[prev].t)+'</button>':'<span></span>';
  h+=next?'<button data-les="'+next+'" style="text-align:right"><span class="pl">Next · '+next+'</span>'+esc(SKMETA[next].t)+'</button>':'<span></span>';
  h+='</div></div>';
  main.innerHTML=h;
  wireQuiz(main,"learn");
  const md=document.getElementById("markdone");
  if(md)md.addEventListener("click",()=>{
    if(store.done[id])delete store.done[id];else store.done[id]=1;
    save();renderRail();
    md.textContent=store.done[id]?"Marked done — undo":"Mark this skill done";
    md.className="btn"+(store.done[id]?" ghost":"");
  });
}

function viewRef(){
  let h='<div class="wide"><div class="crumb"><button data-go="home">Blueprint</button><span>/</span><span class="cw">Reference</span></div>';
  h+='<h1>Quick reference</h1><p class="lede">The tables worth holding in working memory on exam day. Everything here is explained in context on the skill pages.</p>';
  REF.forEach(sec=>{
    h+='<h2>'+esc(sec[0])+'</h2><div class="tw"><table><tbody>';
    sec[1].forEach(r=>{h+='<tr><th style="width:34%">'+r[0]+'</th><td>'+r[1]+'</td></tr>';});
    h+='</tbody></table></div>';
  });
  h+='</div>';
  main.innerHTML=h;
}

function viewTraps(){
  let h='<div class="wide"><div class="crumb"><button data-go="home">Blueprint</button><span>/</span><span class="cw">Traps</span></div>';
  h+='<h1>Trap index</h1><p class="lede">Every trap from every skill page, in blueprint order. These are the wrong answers the exam builds distractors from — read them the night before.</p>';
  h+='<input class="search" id="tsearch" placeholder="Filter traps — try cache, stop_reason, hook, subagent" aria-label="Filter traps">';
  h+='<div id="tlist">';
  DOMAINS.forEach(d=>{
    h+='<h2 data-sec>Domain '+d.n+' · '+esc(d.t)+'</h2>';
    d.s.forEach(s=>{
      const l=L[s[0]];if(!l)return;
      h+='<h3 data-sec>'+s[0]+' '+esc(s[1])+'</h3>';
      l.traps.forEach(t=>{h+='<div class="trap" data-t><div class="tq">'+t[0]+'</div><div class="ta">'+t[1]+'</div></div>';});
    });
  });
  h+='</div></div>';
  main.innerHTML=h;
  const inp=document.getElementById("tsearch");
  inp.addEventListener("input",()=>{
    const v=inp.value.toLowerCase();
    main.querySelectorAll("#tlist [data-t]").forEach(el=>{
      el.style.display=!v||el.textContent.toLowerCase().includes(v)?"":"none";});
    main.querySelectorAll("#tlist [data-sec]").forEach(hd=>{
      let n=hd.nextElementSibling,vis=false;
      while(n&&!n.hasAttribute("data-sec")){if(n.hasAttribute("data-t")&&n.style.display!=="none")vis=true;n=n.nextElementSibling;}
      hd.style.display=vis?"":"none";});
  });
}

function viewGlossary(){
  let h='<div class="wide"><div class="crumb"><button data-go="home">Blueprint</button><span>/</span><span class="cw">Glossary</span></div>';
  h+='<h1>Glossary</h1><p class="lede">Terms the exam uses precisely. Where two terms are commonly confused, the definition says which is which.</p>';
  h+='<input class="search" id="gsearch" placeholder="Filter terms" aria-label="Filter glossary">';
  h+='<dl id="glist">';
  GLOSS.slice().sort((a,b)=>a[0].localeCompare(b[0])).forEach(g=>{
    h+='<div class="gl" data-g><dt>'+esc(g[0])+'</dt><dd>'+esc(g[1])+'</dd></div>';});
  h+='</dl></div>';
  main.innerHTML=h;
  const inp=document.getElementById("gsearch");
  inp.addEventListener("input",()=>{const v=inp.value.toLowerCase();
    main.querySelectorAll("[data-g]").forEach(el=>{el.style.display=!v||el.textContent.toLowerCase().includes(v)?"":"none";});});
}

/* ================= exam ================= */
const BLUEPRINT={1:8,2:17,3:2,4:1,5:9,6:6,7:4,8:6};
let exam=null,timer=null;

function buildExam(){
  let items=[];
  Object.keys(BLUEPRINT).forEach(d=>{
    const pool=shuffle(Q.filter(q=>q.d===+d));
    items=items.concat(pool.slice(0,BLUEPRINT[d]));
  });
  items=shuffle(items).map(q=>{
    const pairs=shuffle(q.o.map((o,k)=>[o,k]));
    return {i:q.i,d:q.d,s:q.s,q:q.q,o:pairs.map(p=>p[0]),a:pairs.findIndex(p=>p[1]===q.a),r:q.r};
  });
  return {items,started:Date.now(),left:120*60,submitted:false};
}
function fmt(s){const m=Math.floor(s/60),x=s%60;return m+":"+String(x).padStart(2,"0");}
function updateExamBar(){
  if(!exam||exam.submitted)return;
  const boxes=[...main.querySelectorAll(".quiz")];
  const ans=boxes.filter(b=>b._pick!=null).length;
  const c=document.getElementById("ecount");if(c)c.textContent=ans+" / "+exam.items.length;
  const p=document.getElementById("eprog");if(p)p.style.width=pct(ans,exam.items.length)+"%";
}
function viewExam(){
  if(!exam){
    let h='<div class="wrap"><div class="crumb"><button data-go="home">Blueprint</button><span>/</span><span class="cw">Mock exam</span></div>';
    h+='<h1>Mock exam</h1><p class="lede">Fifty-three items drawn from the practice bank, weighted to the published blueprint, 120 minutes on the clock. Scored on the same 100–1,000 scale with a cut at 720, and reported with per-domain percentages the way the real score report is.</p>';
    h+='<div class="tw"><table><thead><tr><th>Domain</th><th>Weight</th><th>Items</th></tr></thead><tbody>';
    DOMAINS.forEach(d=>{h+='<tr><td>'+d.n+' · '+esc(d.t)+'</td><td>'+d.w.toFixed(1)+'%</td><td>'+BLUEPRINT[d.n]+'</td></tr>';});
    h+='</tbody></table></div>';
    h+='<p>Answer options are shuffled on every attempt, and items are sampled from a larger pool, so a second run is not the same exam. No feedback appears until you submit.</p>';
    if(store.best)h+='<p><span class="pill g">best so far</span> scaled '+store.best.score+' — '+store.best.correct+' of '+store.best.total+' correct ('+store.best.date+')</p>';
    h+='<div class="btnrow"><button class="btn" id="startexam">Start the 53-item exam</button></div></div>';
    main.innerHTML=h;
    document.getElementById("startexam").addEventListener("click",()=>{exam=buildExam();viewExam();});
    return;
  }
  if(exam.submitted){renderResults();return;}
  let h='<div class="wrap">';
  h+='<div class="exambar"><div><span class="lbl">answered</span><span class="eg" id="ecount">0 / '+exam.items.length+'</span></div>'+
     '<div class="prog"><i id="eprog" style="width:0%"></i></div>'+
     '<div><span class="lbl">remaining</span><span class="eg" id="eclock">'+fmt(exam.left)+'</span></div>'+
     '<button class="btn" id="submitexam">Submit</button></div>';
  exam.items.forEach((q,k)=>{h+=quizHTML(q,k,"exam");});
  h+='<div class="btnrow"><button class="btn" id="submitexam2">Submit exam</button></div></div>';
  main.innerHTML=h;
  main.querySelectorAll(".quiz").forEach((b,k)=>{b._q=exam.items[k];});
  wireQuiz(main,"exam");
  const sub=()=>submitExam();
  document.getElementById("submitexam").addEventListener("click",sub);
  document.getElementById("submitexam2").addEventListener("click",sub);
  clearInterval(timer);
  timer=setInterval(()=>{
    if(!exam||exam.submitted){clearInterval(timer);return;}
    exam.left--;const c=document.getElementById("eclock");
    if(c)c.textContent=fmt(Math.max(0,exam.left));
    if(exam.left<=0)submitExam();
  },1000);
}
function submitExam(){
  const boxes=[...main.querySelectorAll(".quiz")];
  exam.picks=boxes.map(b=>b._pick==null?-1:b._pick);
  exam.submitted=true;clearInterval(timer);
  renderResults();
}
function renderResults(){
  const items=exam.items,picks=exam.picks||[];
  let correct=0;const byD={};
  items.forEach((q,k)=>{
    byD[q.d]=byD[q.d]||{n:0,c:0};byD[q.d].n++;
    if(picks[k]===q.a){correct++;byD[q.d].c++;}
  });
  const p=correct/items.length,score=Math.round(100+900*p),passed=score>=720;
  const date=new Date().toISOString().slice(0,10);
  if(!store.best||score>store.best.score){store.best={score,correct,total:items.length,date};save();}

  let h='<div class="wrap"><div class="crumb"><button data-go="home">Blueprint</button><span>/</span><span class="cw">Result</span></div>';
  h+='<div class="scorebox"><div class="bigscore" style="color:var(--'+(passed?"pass":"fail")+')">'+score+'</div>'+
     '<p style="margin-top:8px">'+(passed?"Above the 720 cut score":"Below the 720 cut score")+' — '+correct+' of '+items.length+' correct ('+Math.round(p*100)+'%).</p>'+
     '<p class="srcs" style="margin:0">Scaled linearly from percent correct across the 100–1,000 range, so 720 sits at about 69% correct. The real exam uses a standard-setting study rather than a linear map, so treat this as a directional signal.</p></div>';
  h+='<h2>By domain</h2>';
  DOMAINS.forEach(d=>{const r=byD[d.n];if(!r)return;
    const q=pct(r.c,r.n),col=q>=69?"pass":(q>=50?"warn":"fail");
    h+='<div class="dgrid"><span>'+d.n+' · '+esc(d.t)+'</span>'+
       '<span class="mb"><i style="width:'+q+'%;background:var(--'+col+')"></i></span>'+
       '<span style="font-family:var(--mono);text-align:right">'+q+'%</span></div>';});
  h+='<p style="margin-top:20px">Per-domain percentages do not decide pass or fail on the real exam either — they exist to tell you where to go back. Anything under 69% is worth a re-read before you book.</p>';
  h+='<div class="btnrow"><button class="btn" id="again">Take another exam</button><button class="btn ghost" data-go="traps">Review the trap index</button></div>';
  h+='<h2>Review every item</h2>';
  items.forEach((q,k)=>{
    const pick=picks[k],ok=pick===q.a,keys=["A","B","C","D","E"];
    h+='<div class="quiz"><div class="qmeta">Item '+(k+1)+' · Domain '+q.d+' · '+q.s+' · <button data-les="'+q.s+'" style="background:none;border:0;color:var(--signal);cursor:pointer;font:inherit;padding:0">open the skill</button></div>';
    h+='<div class="qstem">'+esc(q.q)+'</div>';
    q.o.forEach((o,j)=>{
      const st=j===q.a?"right":(j===pick?"wrong":"");
      h+='<button class="opt" disabled'+(st?' data-s="'+st+'"':'')+'><span class="k">'+keys[j]+'</span><span>'+esc(o)+'</span></button>';});
    h+='<div class="rat '+(ok?"ok":"no")+'"><span class="vd">'+(ok?"Correct.":(pick===-1?"Unanswered.":"Not quite."))+'</span>'+esc(q.r)+'</div></div>';
  });
  h+='</div>';
  main.innerHTML=h;
  document.getElementById("again").addEventListener("click",()=>{exam=null;viewExam();});
}

/* ================= router ================= */
function go(r){
  route=r;
  if(r.v!=="exam"){clearInterval(timer);}
  if(r.v==="home")viewHome();
  else if(r.v==="domain")viewDomain(r.n);
  else if(r.v==="lesson")viewLesson(r.id);
  else if(r.v==="ref")viewRef();
  else if(r.v==="traps")viewTraps();
  else if(r.v==="glossary")viewGlossary();
  else if(r.v==="exam")viewExam();
  renderRail();
  document.querySelectorAll("#tnav button").forEach(b=>{
    b.setAttribute("aria-current",(b.dataset.go===r.v)?"true":"false");});
  document.body.classList.remove("railopen");
  window.scrollTo({top:0,behavior:"instant"});
}
document.addEventListener("click",e=>{
  const les=e.target.closest("[data-les]");
  if(les){go({v:"lesson",id:les.dataset.les});return;}
  const dom=e.target.closest("[data-dom]");
  if(dom){
    const n=+dom.dataset.dom;
    if(dom.classList.contains("dhead")){
      const g=dom.closest(".dgroup");g.classList.toggle("open");
      dom.setAttribute("aria-expanded",g.classList.contains("open")?"true":"false");
      return;
    }
    go({v:"domain",n});return;
  }
  const nav=e.target.closest("[data-go]");
  if(nav){const v=nav.dataset.go;go(v==="home"?{v:"home"}:{v});return;}
});
document.getElementById("railtoggle").addEventListener("click",()=>{
  document.body.classList.toggle("railopen");});
const tb=document.getElementById("themebtn");
try{const t=localStorage.getItem(KEY+".theme");if(t)document.documentElement.dataset.theme=t;}catch(e){}
tb.addEventListener("click",()=>{
  const n=document.documentElement.dataset.theme==="dark"?"light":"dark";
  document.documentElement.dataset.theme=n;
  try{localStorage.setItem(KEY+".theme",n);}catch(e){}});

go({v:"home"});

