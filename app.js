const CIRCUMFERENCE = 2 * Math.PI * 84;

let total = 25 * 60;
let resource = total;
let state = 'IDLE';
let intervalId = null;
let isDragging = false;
let lastAngle = null;

const ringArc = document.getElementById('ring-arc');
const thumb = document.getElementById('thumb');
const dragRing = document.getElementById('drag-ring');
const dragRingVis = document.getElementById('drag-ring-vis');
const dialSvg = document.getElementById('dial-svg');
const badge = document.getElementById('badge');
const badgeText = document.getElementById('badge-text');
const timeDisplay = document.getElementById('time-display');
const stateSub = document.getElementById('state-sub');
const btnReset = document.getElementById('btn-reset');
const btnIcon = document.getElementById('btn-icon');
const btnLabel = document.getElementById('btn-label');
const hintText = document.getElementById('hint-text');

ringArc.style.strokeDasharray = CIRCUMFERENCE;

function fmt(s) {
  s = Math.max(0, Math.min(total, s));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

function getAngle(e) {
  const rect = dialSvg.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  const angle = Math.atan2(clientY - cy, clientX - cx) * 180 / Math.PI;
  return (angle + 90 + 360) % 360;
}

function updateThumb(ratio) {
  const angle = ratio * 360 - 90;
  const rad = angle * Math.PI / 180;
  thumb.setAttribute('cx', (100 + 84 * Math.cos(rad)).toFixed(2));
  thumb.setAttribute('cy', (100 + 84 * Math.sin(rad)).toFixed(2));
}

function getAccent() {
  return state === 'COMPLETE' ? '#1D9E75' : '#7F77DD';
}

function updateUI(instant = false) {
  const ratio = 1 - resource / total;
  const progress = Math.round(ratio * 100);
  const accent = getAccent();

  ringArc.style.transition = instant ? 'none' : 'stroke-dashoffset 0.4s linear, stroke 0.3s';
  ringArc.style.strokeDashoffset = CIRCUMFERENCE * (1 - ratio);
  ringArc.style.stroke = accent;
  updateThumb(ratio);
  thumb.setAttribute('fill', accent);
  dragRingVis.setAttribute('stroke', accent);

  timeDisplay.textContent = fmt(resource);
  document.getElementById('p-trigger').textContent = state === 'IDLE' ? '0' : '1';
  document.getElementById('p-resource').textContent = resource + 's';
  document.getElementById('p-progress').textContent = progress + '%';

  if (state === 'IDLE') {
    badge.className = 'badge';
    badgeText.textContent = 'IDLE';
    stateSub.textContent = resource < total ? '일시정지' : '대기 중';
    btnIcon.className = 'ti ti-player-play';
    btnLabel.textContent = resource < total ? '재개' : '시작';
    btnReset.disabled = resource === total;
    dragRing.style.cursor = 'grab';
    thumb.style.cursor = 'grab';
    hintText.textContent = '링을 드래그해서 시간 조절';
  } else if (state === 'RUNNING') {
    badge.className = 'badge running';
    badgeText.textContent = 'RUNNING';
    stateSub.textContent = isDragging ? '조절 중' : '집중 중';
    btnIcon.className = 'ti ti-player-pause';
    btnLabel.textContent = '일시정지';
    btnReset.disabled = false;
    dragRing.style.cursor = 'grab';
    thumb.style.cursor = 'grab';
    hintText.textContent = '타이머 작동 중에도 조절 가능';
  } else {
    badge.className = 'badge complete';
    badgeText.textContent = 'COMPLETE';
    stateSub.textContent = '완료!';
    btnIcon.className = 'ti ti-refresh';
    btnLabel.textContent = '다시 시작';
    btnReset.disabled = false;
    dragRing.style.cursor = 'grab';
    thumb.style.cursor = 'grab';
    hintText.textContent = '링을 드래그해서 시간 조절';
  }
}

// ── 다이얼 드래그 ──
function onDragStart(e) {
  e.preventDefault();
  isDragging = true;
  lastAngle = getAngle(e);
  dragRingVis.style.opacity = '0.08';
  dragRing.style.cursor = 'grabbing';
  thumb.style.cursor = 'grabbing';
}

function onDragMove(e) {
  if (!isDragging) return;
  e.preventDefault();
  const angle = getAngle(e);
  let delta = angle - lastAngle;
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;
  lastAngle = angle;

  const secondsPerDegree = total / 360;
  const change = Math.round(delta * secondsPerDegree);
  const prev = resource;
  resource = Math.max(0, Math.min(total, resource - change));

  if (state === 'COMPLETE' && resource > 0) {
    state = 'RUNNING';
    intervalId = setInterval(tick, 1000);
  }

  if (resource !== prev) {
    btnReset.disabled = false;
    updateUI(true);
  }
}

function onDragEnd() {
  isDragging = false;
  dragRingVis.style.opacity = '0';
  dragRing.style.cursor = 'grab';
  thumb.style.cursor = 'grab';
  if (state === 'RUNNING') stateSub.textContent = '집중 중';
}

dragRing.addEventListener('mousedown', onDragStart);
thumb.addEventListener('mousedown', onDragStart);
window.addEventListener('mousemove', onDragMove);
window.addEventListener('mouseup', onDragEnd);
dragRing.addEventListener('touchstart', onDragStart, { passive: false });
thumb.addEventListener('touchstart', onDragStart, { passive: false });
window.addEventListener('touchmove', onDragMove, { passive: false });
window.addEventListener('touchend', onDragEnd);

// ── 타이머 ──
function tick() {
  if (isDragging) return;
  if (resource <= 0) {
    clearInterval(intervalId);
    intervalId = null;
    resource = 0;
    state = 'COMPLETE';
    updateUI(false);
    return;
  }
  resource -= 1;
  updateUI(false);
}

function handleTrigger() {
  if (state === 'IDLE') {
    state = 'RUNNING';
    intervalId = setInterval(tick, 1000);
  } else if (state === 'RUNNING') {
    clearInterval(intervalId);
    intervalId = null;
    state = 'IDLE';
  } else if (state === 'COMPLETE') {
    handleReset();
    return;
  }
  updateUI(false);
}

function handleReset() {
  clearInterval(intervalId);
  intervalId = null;
  isDragging = false;
  state = 'IDLE';
  resource = total;
  updateUI(false);
}

function setMode(el, mins) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  if (state !== 'RUNNING') {
    total = mins * 60;
    resource = total;
    handleReset();
  }
}

updateUI(true);
