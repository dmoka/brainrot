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

// Start/Stop — use mousedown for instant response (no waiting for click release)
startBtn.addEventListener('mousedown', (e) => {
  e.preventDefault();
  toggleBreathing();
});
startBtn.addEventListener('touchstart', (e) => {
  e.preventDefault();
  toggleBreathing();
}, { passive: false });

function toggleBreathing() {
  if (isRunning) {
    stopBreathing();
  } else {
    startBreathing();
  }
}

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
  // Clear timers immediately
  clearTimeout(phaseTimer);
  clearInterval(countdownInterval);
  phaseTimer = null;
  countdownInterval = null;

  isRunning = false;
  startBtn.textContent = 'Start';
  startBtn.dataset.state = 'idle';

  // Kill ongoing CSS transitions by removing transition, forcing reflow, then resetting
  circle.style.transition = 'none';
  glow.style.transition = 'none';
  // Force reflow so 'none' takes effect immediately
  circle.offsetHeight;
  // Now set the reset values (instant, no transition)
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

  // Update label
  label.textContent = phase.name;

  // Animate circle based on phase type
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
  // hold: keep current scale

  // Countdown
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

  // Next phase
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

// Initialize
updatePatternInfo();
