const lessons=[...window.core,...window.advanced], releases=window.releases;
const app=document.querySelector('#app'), key='py-studio-v1';
let state={done:{},draft:{},quiz:{},last:''};
try{Object.assign(state,JSON.parse(localStorage.getItem(key)||'{}'))}catch{}
function save(){try{localStorage.setItem(key,JSON.stringify(state))}catch{}}
function esc(x){return String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
const unitList=[
 ['יסודות בשפה','אוספים, פונקציות והרגלים מ־C#','{}','#326d59','#ddf1e6',window.core.slice(0,3)],
 ['לכתוב Python','ביטויים, פונקציות ונתונים','[ ]','#526f99','#e6eefb',window.core.slice(3)],
 ['דקורטורים','עטיפת פונקציות ושינוי התנהגות','@','#85569d','#f0e5f5',window.advanced.slice(0,3)],
 ['פיתוח מתקדם','ניהול משאבים וקוד אסינכרוני','~','#a56b24','#fbefd9',window.advanced.slice(3,6)],
 ['מעבדת יישום','בדיקות ואתגר תכנות מסכם','>_','#376d82','#e2f0f6',window.advanced.slice(6)],
 ['חידושי השפה','מה השתנה מ־Python 3.10 ועד 3.15','✦','#96605f','#f8e8e6',null]
];
const code=(label,value)=>'<div class="codecard"><label>'+label+'</label><pre dir="ltr"><code>'+esc(value)+'</code></pre></div>';
const lessonUrl=l=>'#lesson/'+encodeURIComponent(l.id);
const anchor=(url,label,cls='btn')=>'<a class="'+cls+'" href="'+url+'">'+label+'</a>';
const lessonBy=id=>lessons.find(l=>l.id===id);
const completed=()=>lessons.filter(l=>state.done[l.id]).length;
function topics(){return '<div class="grid">'+unitList.map(([title,desc,icon,color,bg,rows],i)=>'<a class="card topic" style="--color:'+color+';--bg:'+bg+'" href="'+(rows?'#path/'+i:'#modern')+'"><div class="between"><span class="icon" dir="ltr">'+esc(icon)+'</span><small>'+(rows?rows.length+' שיעורים':releases.length+' גרסאות')+'</small></div><h3>'+title+'</h3><p>'+desc+'</p></a>').join('')+'</div>'}
function home(){
 const resume=lessonBy(state.last)||lessons[0], featured=lessonBy('adv1')||window.advanced[0];
 return '<section class="hero"><div><span class="eyebrow">סדנת Python למפתחי תוכנה</span><h1>מ־<bdi dir="ltr">C#</bdi> לפייתון.</h1><p>אותה חשיבה הנדסית, שפה חדשה. השווה בין המימושים וכתוב קוד שעובר את הבדיקות.</p>'+anchor(lessonUrl(resume),state.last?'המשך מהשיעור האחרון':'התחל את המסלול','btn primary')+'</div><div class="art" aria-hidden="true"><div class="editorpic"><div class="windowline"><i></i><i></i><i></i><span>workshop.py</span></div><pre><span class="gold">@trace</span>\n<span class="lilac">def</span> <span class="mint">deploy</span>(service):\n    <span class="lilac">return</span> service.start()</pre></div><div class="tile">@</div></div></section><div class="dash"><article class="card feature"><span class="icon">@</span><div><small>שיעור במיקוד</small><h2>איך עובד דקורטור?</h2><p>מה קורה לפונקציה כשהיא מקבלת <bdi>@decorator</bdi>?</p></div>'+anchor(lessonUrl(featured),'פתח שיעור','textlink')+'</article><article class="card"><div class="between"><strong>ההתקדמות שלך</strong><b dir="ltr">'+Math.round(completed()/lessons.length*100)+'%</b></div><div class="progressline"><i style="width:'+completed()/lessons.length*100+'%"></i></div><small>'+completed()+' מתוך '+lessons.length+' תרגילים עברו את הבדיקות</small></article></div><div class="sectionhead"><h2>מסלול הלימוד שלך</h2>'+anchor('#path','כל השיעורים','textlink')+'</div>'+topics()
}
function path(index){
 const idx=index!==undefined&&unitList[index]?.[5]?Number(index):-1;
 const pool=idx<0?lessons:unitList[idx][5];
 return '<div class="subhead"><span class="eyebrow">Python Studio</span><h1>מסלול הלימוד</h1><p>אפשר ללמוד לפי הסדר או לבחור נושא לתרגול ממוקד.</p></div><div class="filters">'+anchor('#path','הכול','btn '+(idx<0?'sel':''))+unitList.slice(0,5).map((v,i)=>anchor('#path/'+i,v[0],'btn '+(idx===i?'sel':''))).join('')+'</div><div class="rows">'+pool.map(l=>'<a class="card row" href="'+lessonUrl(l)+'"><span class="tag">'+String(lessons.indexOf(l)+1).padStart(2,'0')+'</span><strong>'+esc(l.title)+'</strong><small>'+ (state.done[l.id]?'✓ הושלם':'פתח שיעור')+'</small></a>').join('')+'</div>'
}
function lesson(l){
 state.last=l.id;save();const pos=lessons.indexOf(l);
 return '<div class="breadcrumbs">'+anchor('#path','מסלול הלימוד','textlink')+' / '+esc(l.group)+'</div><div class="subhead"><h1>'+esc(l.title)+'</h1><p>'+esc(l.intro)+'</p></div><div class="pair">'+code('C#',l.cs)+code('Python',l.py)+'</div><div class="note">'+esc(l.insight)+'</div><section class="lessonbox"><h2>עכשיו תורך</h2><p>'+esc(l.task)+'</p><label for="editor" class="small">הקוד שלך · Python 3.12</label><textarea id="editor" dir="ltr" spellcheck="false" autocomplete="off" autocapitalize="off">'+esc(state.draft[l.id]??l.starter)+'</textarea><div class="actions"><button class="primary" id="check">בדוק פתרון</button><button id="run">הרץ קוד</button><button id="stop" hidden>עצור</button></div><pre id="output" class="result" aria-live="polite" dir="auto"></pre><details><summary>רמז</summary><p>'+esc(l.hint)+'</p></details><details><summary>הצג פתרון להשוואה</summary>'+code('Python',l.solution)+'</details></section><div class="navigate">'+anchor('#path','חזרה למסלול')+(pos<lessons.length-1?anchor(lessonUrl(lessons[pos+1]),'השיעור הבא'):'')+'</div>'
}
function modern(){
 return '<div class="subhead"><span class="eyebrow">מהדורות Python</span><h1>חידושי השפה</h1><p>דוגמה ושאלת הבנה לכל גרסה. הדוגמאות מציגות את התחביר של הגרסה המצוינת.</p></div>'+releases.map((r,i)=>'<article class="card release"><span class="tag" dir="ltr">Python '+esc(r.version)+'</span><h2>'+esc(r.title)+'</h2><p>'+esc(r.intro)+'</p>'+code('Python '+esc(r.version),r.py)+'<div class="note">'+esc(r.cs)+'</div><h3>'+esc(r.question)+'</h3><div class="quiz">'+r.options.map((o,j)=>'<button data-release="'+i+'" data-choice="'+j+'" aria-pressed="'+(state.quiz[i]===j)+'">'+esc(o)+'</button>').join('')+'</div><p id="feedback'+i+'" role="status">'+feedback(i)+'</p><a class="textlink" target="_blank" rel="noopener" href="'+esc(r.url)+'">תיעוד Python הרשמי</a></article>').join('')
}
function feedback(i){let a=state.quiz[i],r=releases[i];return a===undefined?'':a===r.correct?'✓ נכון. '+esc(r.why):'נסה שוב. חזור לדוגמה ובדוק מה משתנה בזמן הריצה.'}
let worker,timer;
function stop(){worker?.terminate();worker=null;clearTimeout(timer)}
function attach(l){
 const ed=document.querySelector('#editor'),out=document.querySelector('#output'),run=document.querySelector('#run'),check=document.querySelector('#check'),cancel=document.querySelector('#stop');
 function busy(on){run.disabled=check.disabled=on;cancel.hidden=!on}
 function end(msg,cls=''){stop();busy(false);out.className='result '+cls;out.textContent=msg}
 ed.oninput=()=>{state.draft[l.id]=ed.value;save()};
 ed.onkeydown=e=>{if(e.key==='Tab'&&!e.shiftKey){e.preventDefault();ed.setRangeText('    ',ed.selectionStart,ed.selectionEnd,'end');ed.oninput()}};
 function execute(test){
   stop();busy(true);out.className='result';out.textContent='טוען את סביבת Python…';let lines=[],passed=0;
   worker=new Worker('runner.js');timer=setTimeout(()=>end('ההרצה נעצרה לאחר דקה. אפשר לבדוק אם יש לולאה שאינה מסתיימת ולהריץ שוב.','fail'),60000);
   worker.onerror=e=>end('שגיאה בטעינת סביבת ההרצה. רענן ונסה שוב. '+e.message,'fail');
   worker.onmessage=({data:d})=>{
     if('line' in d){if(lines.length<150)lines.push(d.line.slice(0,2000));out.textContent=lines.join('\n')}
     if(d.passed)passed=d.passed;
     if(d.error){end([...lines,test?'בדיקה '+Math.min(passed+1,l.tests.length)+' מתוך '+l.tests.length+' או הרצת הקוד נכשלה.':'ההרצה נכשלה.',d.error].join('\n'),'fail')}
     if(d.ok){if(test){state.done[l.id]=true;save()}end([...lines,test?'✓ כל '+l.tests.length+' הבדיקות עברו. התרגיל הושלם.':'✓ ההרצה הסתיימה.'].join('\n'),'pass')}
   };
   worker.postMessage({code:ed.value,tests:test?l.tests:[]})
 }
 run.onclick=()=>execute(false);check.onclick=()=>execute(true);cancel.onclick=()=>end('ההרצה הופסקה.');
}
function render(){
 stop();const [route,arg]=location.hash.slice(1).split('/'),l=route==='lesson'&&lessonBy(arg);
 document.querySelectorAll('nav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+(l?'path':route||'home')));
 app.innerHTML=l?lesson(l):route==='modern'?modern():route==='path'?path(arg):home();
 if(l)attach(l);
 app.querySelectorAll('[data-release]').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.release);state.quiz[i]=Number(b.dataset.choice);save();document.querySelector('#feedback'+i).innerHTML=feedback(i);b.parentElement.querySelectorAll('button').forEach(v=>v.setAttribute('aria-pressed',String(v===b)))});
 window.scrollTo({top:0,behavior:'instant'})
}
window.addEventListener('hashchange',render);render();
