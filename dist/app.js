const PROGRAM = [
  { title: 'Temelj i kontrola', focus: 'Hvat, lopatice i čvrst položaj tijela', workouts: [
    ['Aktivni vis', '4 × 15–25 sekundi'], ['Veslanje pod nagibom', '4 × 6–10 ponavljanja'], ['Kontrolirano spuštanje', '4 × 3 ponavljanja'] ] },
  { title: 'Snaga povlačenja', focus: 'Mirna ramena i puni raspon pokreta', workouts: [
    ['Scapular pull up', '4 × 6 ponavljanja'], ['Asistirani zgib', '5 × 4–6 ponavljanja'], ['Hollow hold', '4 × 20 sekundi'] ] },
  { title: 'Pametan volumen', focus: 'Dovoljno rada bez gubitka tehnike', workouts: [
    ['Asistirani zgib', '6 × 3–5 ponavljanja'], ['Veslanje', '4 × 8–12 ponavljanja'], ['Ekscentrični zgib', '3 × 3 ponavljanja'] ] },
  { title: 'Slaba točka', focus: 'Osobna korekcija dijela pokreta koji koči napredak', workouts: [
    ['Tehnički drill', '5 × kvalitetan pokušaj'], ['Izometrija', '4 × 10–20 sekundi'], ['Lagani volumen', '3 × 8 ponavljanja'] ] },
  { title: 'Priprema pokušaja', focus: 'Više specifičnosti i manje nepotrebnog umora', workouts: [
    ['Puni pokušaj', '4 × 1 kvalitetan pokušaj'], ['Lagani asistirani zgib', '4 × 4 ponavljanja'], ['Mobilnost ramena', '8 minuta'] ] },
  { title: 'Završni test', focus: 'Svjež pokušaj i usporedba s početnom snimkom', workouts: [
    ['Aktivacija', '10 minuta'], ['Završni pokušaj', '3 pokušaja s punim odmorom'], ['Plan za nastavak', 'Zapiši sljedeći cilj'] ] },
];

const DEFAULT = {
  role: 'member', selectedWeek: 1,
  completed: {},
  measurements: [{ week: 0, pullups: 0, hang: 18, note: 'Početno mjerenje' }],
  feedback: [{ id: 1, exercise: 'Aktivni vis', question: 'Položaj lopatica u početku pokreta', status: 'Filip odgovara u nedjelju', date: '17. 10.' }],
  applications: [
    { name: 'Marta K.', age: 27, pullups: 0, pain: 'ne', status: 'Razgovor' },
    { name: 'Ivan P.', age: 22, pullups: 1, pain: 'ne', status: 'Kvalificiran' },
    { name: 'Luka S.', age: 19, pullups: 0, pain: 'da', status: 'Provjera' }
  ]
};

const CLIENTS = [
  { name: 'Marta K.', city: 'Pula', week: 1, completion: 67, pullups: 0, status: 'Čeka feedback' },
  { name: 'Ivan P.', city: 'Rijeka', week: 1, completion: 100, pullups: 1, status: 'U ritmu' },
  { name: 'Ana M.', city: 'Zagreb', week: 1, completion: 33, pullups: 0, status: 'Provjeri' },
  { name: 'Niko R.', city: 'Pula', week: 1, completion: 67, pullups: 2, status: 'U ritmu' },
  { name: 'Sara B.', city: 'Rovinj', week: 1, completion: 100, pullups: 0, status: 'Nova snimka' },
];

let state = loadState();
let noticeTimer;

function loadState() {
  try { return { ...DEFAULT, ...JSON.parse(localStorage.getItem('filip-klub-state') || '{}') }; }
  catch { return structuredClone(DEFAULT); }
}
function saveState() { localStorage.setItem('filip-klub-state', JSON.stringify(state)); }
function showNotice(message) {
  const node = document.querySelector('#notice');
  node.textContent = message; node.classList.add('show');
  clearTimeout(noticeTimer); noticeTimer = setTimeout(() => node.classList.remove('show'), 2400);
}

function setView(id) {
  document.querySelectorAll('.view').forEach(v => v.classList.toggle('active', v.id === id));
  document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.view === id));
  const btn = document.querySelector(`.nav-item[data-view="${id}"]`);
  document.querySelector('#pageTitle').textContent = btn ? btn.textContent.replace(/^\d+/, '').trim() : 'Klub';
  document.querySelector('.sidebar').classList.remove('open');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setRole(role) {
  state.role = role; saveState();
  document.querySelectorAll('[data-role]').forEach(b => b.classList.toggle('active', b.dataset.role === role));
  document.querySelectorAll('.coach-only').forEach(n => n.classList.toggle('hidden', role !== 'coach'));
  document.querySelector('.avatar').textContent = role === 'coach' ? 'F' : 'FM';
  if (role === 'member' && ['clients','applications'].includes(document.querySelector('.view.active')?.id)) setView('dashboard');
  showNotice(role === 'coach' ? 'Otvoren je Filipov prikaz' : 'Otvoren je prikaz polaznika');
}

function completedCount() { return Object.values(state.completed).filter(Boolean).length; }
function setupCanvas(canvas) {
  if (!canvas) return null;
  const rect = canvas.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, Math.round(rect.width * ratio));
  canvas.height = Math.max(1, Math.round(rect.height * ratio));
  const ctx = canvas.getContext('2d');
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  return { ctx, width: rect.width, height: rect.height };
}
function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);
}
function drawActivityChart() {
  const data = setupCanvas(document.querySelector('#activityChart'));
  if (!data) return;
  const { ctx, width, height } = data;
  const values = [32, 21, 28, 20, 30, 22, 26];
  ctx.clearRect(0, 0, width, height);
  ctx.strokeStyle = '#ecd562'; ctx.lineWidth = 2;
  ctx.beginPath();
  values.forEach((v, i) => {
    const x = 12 + i * ((width - 24) / (values.length - 1));
    const y = height - 18 - v * 1.65;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.stroke();
  values.forEach((v, i) => {
    const x = 12 + i * ((width - 24) / (values.length - 1));
    const y = height - 18 - v * 1.65;
    ctx.beginPath(); ctx.arc(x, y, i === 4 ? 5 : 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#1f1f1f'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = '#fff'; ctx.stroke();
  });
}
function drawBubbleChart(done) {
  const data = setupCanvas(document.querySelector('#bubbleChart'));
  if (!data) return;
  const { ctx, width, height } = data;
  ctx.clearRect(0, 0, width, height);
  const r = Math.min(24, (width - 30) / 12);
  const gap = r * 2 + 5;
  const cols = Math.max(6, Math.floor((width - 12) / gap));
  for (let i = 0; i < 18; i++) {
    const row = Math.floor(i / cols), col = i % cols;
    const x = r + 4 + col * gap + (row % 2 ? r * .55 : 0);
    const y = r + 5 + row * gap;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    if (i < done) { ctx.fillStyle = '#ffd33f'; ctx.fill(); }
    else { ctx.strokeStyle = '#c6a92e'; ctx.lineWidth = 1; ctx.stroke(); }
  }
}
function drawStrengthChart(percent) {
  const data = setupCanvas(document.querySelector('#strengthChart'));
  if (!data) return;
  const { ctx, width, height } = data;
  const cx = width / 2, cy = height / 2, radius = Math.min(width, height) * .36;
  const segments = [Math.max(5, percent), 28, Math.max(5, 72 - percent)];
  const colors = ['#ff5850', '#1f1f1f', '#ffd33f'];
  const total = segments.reduce((a,b) => a+b, 0);
  let angle = -Math.PI / 2;
  ctx.clearRect(0, 0, width, height); ctx.lineWidth = Math.min(width, height) * .13; ctx.lineCap = 'round';
  segments.forEach((segment, i) => {
    const sweep = (Math.PI * 2) * (segment / total) - .10;
    ctx.beginPath(); ctx.arc(cx, cy, radius, angle, angle + sweep); ctx.strokeStyle = colors[i]; ctx.stroke(); angle += sweep + .10;
  });
}
function renderDashboard() {
  const done = completedCount();
  const percent = Math.round(done / 18 * 100);
  const latest = state.measurements.slice().sort((a,b) => a.week-b.week).at(-1) || { pullups: 0 };
  document.querySelector('#progressPercent').textContent = `${percent}%`;
  document.querySelector('#metricWorkouts').textContent = `${done}/18`;
  document.querySelector('#metricConsistency').textContent = `${percent}%`;
  document.querySelector('#metricPullups').textContent = latest.pullups;
  document.querySelector('#heroWeek').textContent = state.selectedWeek;
  document.querySelector('#chartWorkoutCount').textContent = Math.min(3, Object.entries(state.completed).filter(([k,v]) => k.startsWith(`${state.selectedWeek}-`) && v).length);
  document.querySelector('#minutesDone').textContent = done * 30;
  document.querySelector('#volumeFill').style.width = `${Math.min(100, done * 30 / 180 * 100)}%`;
  const challengeDone = Math.min(3, Object.entries(state.completed).filter(([k,v]) => k.startsWith(`${state.selectedWeek}-`) && v).length);
  document.querySelector('.challenge-progress strong').textContent = challengeDone;
  const container = document.querySelector('#weeklyChecklist');
  container.innerHTML = PROGRAM[state.selectedWeek - 1].workouts.map((w, i) => {
    const key = `${state.selectedWeek}-${i}`; const checked = !!state.completed[key];
    return `<label class="check-row ${checked ? 'done' : ''}"><input type="checkbox" data-check="${key}" ${checked ? 'checked' : ''}><span><strong>${w[0]}</strong><small>${w[1]}</small></span><small>Trening ${i+1}</small></label>`;
  }).join('');
  container.querySelectorAll('[data-check]').forEach(input => input.addEventListener('change', e => {
    state.completed[e.target.dataset.check] = e.target.checked; saveState(); renderAll();
    showNotice(e.target.checked ? 'Trening je zabilježen' : 'Oznaka treninga je uklonjena');
  }));
  requestAnimationFrame(() => { drawActivityChart(); drawBubbleChart(done); drawStrengthChart(percent); });
}

function renderProgram() {
  const tabs = document.querySelector('#weekTabs');
  tabs.innerHTML = PROGRAM.map((w, i) => `<button class="week-tab ${state.selectedWeek === i+1 ? 'active' : ''}" data-week="${i+1}" role="tab"><span>Tjedan</span><strong>${i+1}</strong></button>`).join('');
  tabs.querySelectorAll('[data-week]').forEach(b => b.addEventListener('click', () => { state.selectedWeek = Number(b.dataset.week); saveState(); renderProgram(); renderDashboard(); }));
  const week = PROGRAM[state.selectedWeek - 1];
  document.querySelector('#weekContent').innerHTML = `<article class="week-card"><div class="week-summary"><div><p class="eyebrow">FOKUS TJEDNA</p><h3>${week.title}</h3><p>${week.focus}</p></div><div class="week-number">0${state.selectedWeek}</div></div><div class="workouts">${week.workouts.map((w,i) => {
    const key = `${state.selectedWeek}-${i}`; const done = !!state.completed[key];
    return `<div class="workout"><span class="workout-index">0${i+1}</span><div><h4>${w[0]}</h4><p>${w[1]}</p></div><button class="complete-button ${done ? 'done' : ''}" data-complete="${key}">${done ? 'Završeno ✓' : 'Označi završeno'}</button></div>`;
  }).join('')}</div></article>`;
  document.querySelectorAll('[data-complete]').forEach(b => b.addEventListener('click', () => { state.completed[b.dataset.complete] = !state.completed[b.dataset.complete]; saveState(); renderAll(); showNotice('Program je ažuriran'); }));
}

function renderProgress() {
  const byWeek = Object.fromEntries(state.measurements.map(m => [m.week, m.pullups]));
  const max = Math.max(1, ...Object.values(byWeek));
  document.querySelector('#barChart').innerHTML = Array.from({length:7}, (_, i) => {
    const value = byWeek[i] ?? 0; const height = value ? Math.max(10, value / max * 88) : 2;
    return `<div class="bar-column"><div class="bar" style="height:${height}%"><strong>${value}</strong></div><span>${i === 0 ? 'Start' : `T${i}`}</span></div>`;
  }).join('');
  document.querySelector('#measureWeek').innerHTML = Array.from({length:7}, (_,i) => `<option value="${i}">${i === 0 ? 'Početno' : `Tjedan ${i}`}</option>`).join('');
  document.querySelector('#measureWeek').value = Math.min(6, state.selectedWeek);
}

function renderFeedback() {
  const list = document.querySelector('#feedbackList');
  if (!state.feedback.length) { list.innerHTML = '<p class="empty">Još nema poslanih snimki.</p>'; return; }
  list.innerHTML = state.feedback.slice().reverse().map(f => `<div class="feed-item"><div class="feed-item-head"><strong>${f.exercise}</strong><span class="tag">${f.status}</span></div><p>${f.question || 'Bez dodatnog pitanja'}</p><small>${f.date}</small></div>`).join('');
}

function renderCoach() {
  const avg = Math.round(CLIENTS.reduce((s,c) => s+c.completion,0)/CLIENTS.length);
  document.querySelector('#coachMetrics').innerHTML = [
    ['Aktivni polaznici', CLIENTS.length, 'osnivačka grupa'], ['Prosječna redovitost', `${avg}%`, 'ovaj tjedan'], ['Snimke za pregled', 2, 'čeka Filipov odgovor'], ['Razgovori', state.applications.length, 'nove prijave']
  ].map((m,i) => `<article class="metric-card ${i===2?'accent':''}"><span>${m[0]}</span><strong>${m[1]}</strong><small>${m[2]}</small></article>`).join('');
  document.querySelector('#clientsTable').innerHTML = `<div class="data-row header"><span>Polaznik</span><span>Tjedan</span><span>Treninzi</span><span>Zgibovi</span><span>Status</span></div>${CLIENTS.map(c => `<div class="data-row"><span><strong>${c.name}</strong><small>${c.city}</small></span><span>${c.week}/6</span><span><strong>${c.completion}%</strong><div class="progress-mini"><i style="width:${c.completion}%"></i></div></span><span>${c.pullups}</span><span class="tag">${c.status}</span></div>`).join('')}`;
}

function renderApplications() {
  const list = document.querySelector('#applicationsList');
  list.innerHTML = state.applications.length ? state.applications.map((a,i) => `<div class="application-row"><div><strong>${a.name}</strong><small>${a.age} godina</small></div><span>${a.pullups} zgibova</span><span class="tag ${a.pain==='da'?'warn':''}">${a.pain==='da'?'Bol ili ozljeda':'Bez boli'}</span><span>${a.status}</span><button class="secondary" data-accept="${i}">Prihvati</button></div>`).join('') : '<p class="empty">Nema novih prijava.</p>';
  list.querySelectorAll('[data-accept]').forEach(b => b.addEventListener('click', () => { state.applications[b.dataset.accept].status = 'Prihvaćen'; saveState(); renderApplications(); showNotice('Kandidat je označen kao prihvaćen'); }));
}

function renderAll() { renderDashboard(); renderProgram(); renderProgress(); renderFeedback(); renderCoach(); renderApplications(); }

document.querySelectorAll('.nav-item').forEach(b => b.addEventListener('click', () => setView(b.dataset.view)));
document.querySelectorAll('[data-jump]').forEach(b => b.addEventListener('click', () => setView(b.dataset.jump)));
document.querySelectorAll('[data-role]').forEach(b => b.addEventListener('click', () => setRole(b.dataset.role)));
document.querySelector('#menuButton').addEventListener('click', () => document.querySelector('.sidebar').classList.toggle('open'));
document.querySelector('#measurementForm').addEventListener('submit', e => {
  e.preventDefault(); const week = Number(document.querySelector('#measureWeek').value);
  const entry = { week, pullups: Number(document.querySelector('#measurePullups').value), hang: Number(document.querySelector('#measureHang').value), note: document.querySelector('#measureNote').value };
  state.measurements = state.measurements.filter(m => m.week !== week).concat(entry); saveState(); renderAll(); showNotice('Mjerenje je spremljeno');
});
document.querySelector('#feedbackForm').addEventListener('submit', e => {
  e.preventDefault(); state.feedback.push({ id: Date.now(), exercise: document.querySelector('#feedbackExercise').value, url: document.querySelector('#feedbackUrl').value, question: document.querySelector('#feedbackQuestion').value, status: 'Čeka Filipov odgovor', date: new Date().toLocaleDateString('hr-HR') });
  saveState(); e.target.reset(); renderFeedback(); showNotice('Snimka je poslana Filipu');
});
const appDialog = document.querySelector('#applicationDialog');
['#offerApply','#openApplication'].forEach(id => document.querySelector(id).addEventListener('click', () => appDialog.showModal()));
document.querySelector('#applicationForm').addEventListener('submit', e => {
  if (e.submitter?.value === 'cancel') return;
  e.preventDefault(); state.applications.push({ name: document.querySelector('#appName').value, age: Number(document.querySelector('#appAge').value), pullups: Number(document.querySelector('#appPullups').value), pain: document.querySelector('#appPain').value, status: 'Nova prijava', tried: document.querySelector('#appTried').value });
  saveState(); e.target.reset(); appDialog.close(); renderApplications(); showNotice('Prijava je zaprimljena');
});
document.querySelector('#addMeasurementButton').addEventListener('click', () => document.querySelector('#measurePullups').focus());

setRole(state.role);
renderAll();
window.addEventListener('resize', () => requestAnimationFrame(() => { drawActivityChart(); drawBubbleChart(completedCount()); drawStrengthChart(Math.round(completedCount() / 18 * 100)); }));
