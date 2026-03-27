// Breathing patterns (matching Pauso's actual app)
const patterns = {
  simple: {
    name: 'Simple Breathing',
    desc: '4 seconds in, 6 seconds out. The simplest way to activate your parasympathetic nervous system.',
    phases: [
      { name: 'Breathe In', duration: 4000, type: 'inhale' },
      { name: 'Breathe Out', duration: 6000, type: 'exhale' }
    ]
  },
  box: {
    name: 'Box Breathing',
    desc: '4-4-4-4 pattern used by Navy SEALs. Equal intervals regulate the autonomic nervous system.',
    phases: [
      { name: 'Breathe In', duration: 4000, type: 'inhale' },
      { name: 'Hold', duration: 4000, type: 'hold' },
      { name: 'Breathe Out', duration: 4000, type: 'exhale' },
      { name: 'Hold', duration: 4000, type: 'hold' }
    ]
  },
  physiological: {
    name: 'Physiological Sigh',
    desc: 'Stanford-researched double inhale + long exhale. The fastest real-time stress reducer known to science.',
    phases: [
      { name: 'Inhale', duration: 2000, type: 'inhale' },
      { name: 'Inhale Again', duration: 1500, type: 'inhale' },
      { name: 'Long Exhale', duration: 7000, type: 'exhale' }
    ]
  }
};

// State
let currentPattern = 'simple';
let isRunning = false;
let cycleCount = 0;
let currentPhaseIndex = 0;
let phaseTimer = null;
let countdownInterval = null;
let timeRemaining = 0;

// DOM elements
const circle = document.getElementById('breathingCircle');
const glow = document.getElementById('breathingGlow');
const label = document.getElementById('breathingLabel');
const timer = document.getElementById('breathingTimer');
const startBtn = document.getElementById('startBtn');
const cycleCountEl = document.getElementById('cycleCount');
const patternName = document.getElementById('patternName');
const patternDesc = document.getElementById('patternDesc');
const patternBtns = document.querySelectorAll('.pattern-btn');

// Pattern selection
patternBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const pattern = btn.dataset.pattern;
    if (pattern === currentPattern && !isRunning) return;

    currentPattern = pattern;
    patternBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    updatePatternInfo();

    if (isRunning) {
      stopBreathing();
      startBreathing();
    }
  });
});

// Start/Stop
startBtn.addEventListener('click', () => {
  if (isRunning) {
    stopBreathing();
  } else {
    startBreathing();
  }
});

function updatePatternInfo() {
  const p = patterns[currentPattern];
  patternName.textContent = p.name;
  patternDesc.textContent = p.desc;
}

function startBreathing() {
  isRunning = true;
  startBtn.textContent = 'Stop';
  startBtn.dataset.state = 'running';
  currentPhaseIndex = 0;
  runPhase();
}

function stopBreathing() {
  clearTimeout(phaseTimer);
  clearInterval(countdownInterval);
  phaseTimer = null;
  countdownInterval = null;

  isRunning = false;
  startBtn.textContent = 'Start';
  startBtn.dataset.state = 'idle';

  // Kill transitions instantly
  circle.style.transition = 'none';
  glow.style.transition = 'none';
  circle.offsetHeight;
  circle.style.transform = 'scale(1)';
  glow.style.transform = 'scale(1)';
  glow.style.opacity = '0.4';

  label.textContent = 'Press Start';
  timer.textContent = '';
}

function runPhase() {
  if (!isRunning) return;

  const p = patterns[currentPattern];
  const phase = p.phases[currentPhaseIndex];

  label.textContent = phase.name;

  const durationSec = phase.duration / 1000;
  circle.style.transition = `transform ${durationSec}s ease-in-out`;
  glow.style.transition = `transform ${durationSec}s ease-in-out, opacity ${durationSec}s ease-in-out`;

  if (phase.type === 'inhale') {
    const isSecondInhale = currentPattern === 'physiological' && currentPhaseIndex === 1;
    const scale = isSecondInhale ? 1.2 : 1.15;
    circle.style.transform = `scale(${scale})`;
    glow.style.transform = `scale(${scale})`;
    glow.style.opacity = '0.7';
  } else if (phase.type === 'exhale') {
    circle.style.transform = 'scale(1)';
    glow.style.transform = 'scale(1)';
    glow.style.opacity = '0.4';
  }

  timeRemaining = Math.ceil(phase.duration / 1000);
  timer.textContent = timeRemaining;

  clearInterval(countdownInterval);
  countdownInterval = setInterval(() => {
    timeRemaining--;
    if (timeRemaining > 0) {
      timer.textContent = timeRemaining;
    } else {
      timer.textContent = '';
    }
  }, 1000);

  phaseTimer = setTimeout(() => {
    currentPhaseIndex++;
    if (currentPhaseIndex >= p.phases.length) {
      currentPhaseIndex = 0;
      cycleCount++;
      cycleCountEl.textContent = cycleCount;
    }
    runPhase();
  }, phase.duration);
}

updatePatternInfo();
