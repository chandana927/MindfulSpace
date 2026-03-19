// ================================================
//  MINDFULSPACE – MAIN JS
// ================================================


document.addEventListener('DOMContentLoaded', () => {

  // ─── THEME TOGGLE ───
  const themeToggle = document.getElementById('themeToggle');
  function applyTheme(dark) {
    if (dark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    if (themeToggle) themeToggle.textContent = dark ? '☀️' : '🌙';
    localStorage.setItem('msTheme', dark ? 'dark' : 'light');
  }
  // Set correct icon on page load
  if (themeToggle) {
    themeToggle.textContent = localStorage.getItem('msTheme') === 'dark' ? '☀️' : '🌙';
  }
  themeToggle?.addEventListener('click', () => {
    const currentlyDark = document.documentElement.getAttribute('data-theme') === 'dark';
    applyTheme(!currentlyDark);
  });



  // ─── NAVBAR SCROLL ───
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar?.classList.toggle('scrolled', window.scrollY > 40);
  });

  // ─── HAMBURGER MENU ───
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  hamburger?.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks?.classList.toggle('open');
  });
  // close on nav link click
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger?.classList.remove('open');
      navLinks?.classList.remove('open');
    });
  });

  // ─── ACTIVE NAV LINK ───
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    link.classList.toggle('active', href === currentPage);
  });

  // ─── SCROLL ANIMATIONS ───
  const animatedEls = document.querySelectorAll('[data-animate]');
  if (animatedEls.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    animatedEls.forEach(el => observer.observe(el));
  }

  // ─── MOOD EMOJI SELECTOR ───
  document.querySelectorAll('.mood-emoji-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mood-emoji-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });

  // ─── MOOD SLIDER LABEL ───
  const moodSlider = document.getElementById('moodIntensity');
  const moodSliderVal = document.getElementById('moodSliderVal');
  if (moodSlider && moodSliderVal) {
    moodSlider.addEventListener('input', () => {
      moodSliderVal.textContent = moodSlider.value;
    });
  }

  // ─── MOOD FORM SUBMIT ───
  const moodForm = document.getElementById('moodForm');
  if (moodForm) {
    moodForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const selectedMood = document.querySelector('.mood-emoji-btn.selected');
      if (!selectedMood) { showToast('Please select a mood first! 😊', 'warning'); return; }
      saveMoodEntry(selectedMood);
      showToast('Mood logged successfully! 🎉', 'success');
      moodForm.reset();
      document.querySelectorAll('.mood-emoji-btn').forEach(b => b.classList.remove('selected'));
      renderMoodHistory();
    });
  }

  // ─── MOOD STORAGE ───
  function saveMoodEntry(selectedBtn) {
    const entries = JSON.parse(localStorage.getItem('moodEntries') || '[]');
    entries.unshift({
      emoji: selectedBtn.querySelector('.emoji').textContent,
      label: selectedBtn.dataset.label,
      intensity: document.getElementById('moodIntensity')?.value || 5,
      note: document.getElementById('moodNote')?.value || '',
      trigger: document.getElementById('moodTrigger')?.value || '',
      date: new Date().toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }),
      time: new Date().toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' }),
    });
    localStorage.setItem('moodEntries', JSON.stringify(entries.slice(0, 30)));
  }

  function renderMoodHistory() {
    const container = document.getElementById('moodHistoryList');
    if (!container) return;
    const entries = JSON.parse(localStorage.getItem('moodEntries') || '[]');
    if (!entries.length) {
      container.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:24px">No entries yet. Log your first mood! 🌱</p>';
      return;
    }
    container.innerHTML = entries.map(e => `
      <div class="mood-entry">
        <div class="entry-emoji">${e.emoji}</div>
        <div class="entry-info">
          <div class="entry-date">${e.date} · ${e.time}</div>
          <div class="entry-mood">${e.label}</div>
          ${e.note ? `<div class="entry-note">${e.note}</div>` : ''}
        </div>
        <div class="entry-score">${e.intensity}/10</div>
      </div>`).join('');
  }
  renderMoodHistory();

  // ─── JOURNAL WORD COUNT ───
  const journalTA = document.getElementById('journalText');
  const wordCount = document.getElementById('wordCount');
  if (journalTA && wordCount) {
    journalTA.addEventListener('input', () => {
      const words = journalTA.value.trim().split(/\s+/).filter(w => w).length;
      wordCount.textContent = `${words} word${words !== 1 ? 's' : ''}`;
    });
  }

  // ─── JOURNAL PROMPTS ───
  document.querySelectorAll('.prompt-item').forEach(item => {
    item.addEventListener('click', () => {
      const journalTA = document.getElementById('journalText');
      const titleInput = document.getElementById('journalTitle');
      if (journalTA) {
        journalTA.value = item.textContent.trim() + '\n\n';
        journalTA.focus();
        journalTA.dispatchEvent(new Event('input'));
      }
    });
  });

  // ─── JOURNAL SAVE ───
  const journalForm = document.getElementById('journalForm');
  if (journalForm) {
    journalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('journalTitle')?.value || 'Untitled';
      const text  = document.getElementById('journalText')?.value || '';
      if (!text.trim()) { showToast('Write something first! ✍️', 'warning'); return; }
      const entries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
      entries.unshift({
        title, text,
        date: new Date().toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }),
        mood: document.getElementById('journalMood')?.value || '😊'
      });
      localStorage.setItem('journalEntries', JSON.stringify(entries.slice(0, 20)));
      showToast('Journal entry saved! 📓', 'success');
      journalForm.reset();
      if (wordCount) wordCount.textContent = '0 words';
      renderJournalEntries();
    });
  }

  function renderJournalEntries() {
    const container = document.getElementById('journalEntriesList');
    if (!container) return;
    const entries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
    if (!entries.length) {
      container.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:24px">Your journal is empty. Start writing! ✍️</p>';
      return;
    }
    container.innerHTML = entries.map(e => `
      <div class="journal-entry-card">
        <div class="jentry-header">
          <span class="jentry-date">${e.date}</span>
          <span class="jentry-mood-tag">${e.mood}</span>
        </div>
        <div class="jentry-title">${e.title}</div>
        <div class="jentry-preview">${e.text.slice(0, 120)}${e.text.length > 120 ? '...' : ''}</div>
      </div>`).join('');
  }
  renderJournalEntries();

  // ─── BREATHING EXERCISE ───
  let breathInterval = null;
  let breathRunning  = false;
  const techniques = {
    '4-7-8':   { label:'4-7-8 Breathing', inhale:4, hold:7, exhale:8, desc:'Calms the nervous system. Great for anxiety & sleep.' },
    'box':     { label:'Box Breathing',   inhale:4, hold:4, exhale:4, desc:'Enhances focus and reduces stress instantly.' },
    'relaxed': { label:'Relaxed Breathing', inhale:4, hold:0, exhale:6, desc:'Simple deep breathing for quick calm.' },
  };
  let currentTechnique = '4-7-8';

  document.querySelectorAll('.technique-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.technique-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTechnique = btn.dataset.technique;
      stopBreathing();
      updateBreathInfo();
    });
  });

  function updateBreathInfo() {
    const t = techniques[currentTechnique];
    const desc = document.getElementById('techniqueDesc');
    if (desc) desc.textContent = t.desc;
    const patternEl = document.getElementById('breathPattern');
    if (patternEl) {
      const phases = [
        `Inhale ${t.inhale}s`,
        t.hold ? `Hold ${t.hold}s` : null,
        `Exhale ${t.exhale}s`
      ].filter(Boolean);
      patternEl.innerHTML = phases.map(p => `<span class="pattern-block">${p}</span>`).join('');
    }
  }
  updateBreathInfo();

  document.getElementById('startBreath')?.addEventListener('click', () => {
    if (!breathRunning) startBreathing(); else stopBreathing();
  });

  function startBreathing() {
    breathRunning = true;
    const btn = document.getElementById('startBreath');
    if (btn) btn.textContent = '⏹ Stop';
    const t = techniques[currentTechnique];
    const phases = [
      { name:'INHALE', dur: t.inhale, scale: 1.25 },
      ...(t.hold ? [{ name:'HOLD', dur: t.hold, scale: 1.25 }] : []),
      { name:'EXHALE', dur: t.exhale, scale: 1 },
    ];
    let pi = 0;
    function runPhase() {
      if (!breathRunning) return;
      const p = phases[pi];
      setBreathPhase(p.name, p.dur, p.scale);
      pi = (pi + 1) % phases.length;
    }
    runPhase();
    breathInterval = setInterval(runPhase, (t.inhale + (t.hold||0) + t.exhale) / phases.length * 1000 + 200);
  }

  let countdownTimer = null;
  function setBreathPhase(name, dur, scale) {
    const phase = document.getElementById('breathPhase');
    const count = document.getElementById('breathCount');
    const inner = document.querySelector('.breath-circle-inner');
    const mid   = document.querySelector('.breath-circle-mid');
    const outer = document.querySelector('.breath-circle-outer');
    if (phase) phase.textContent = name;
    if (inner) inner.style.transform = `scale(${scale})`;
    if (mid)   mid.style.transform   = `scale(${name === 'INHALE' ? 1.15 : 1})`;
    if (outer) outer.style.transform = `scale(${name === 'INHALE' ? 1.1  : 1})`;
    if (count) {
      let remaining = dur;
      count.textContent = remaining;
      clearInterval(countdownTimer);
      countdownTimer = setInterval(() => {
        remaining--;
        if (count && remaining >= 0) count.textContent = remaining;
      }, 1000);
    }
  }

  function stopBreathing() {
    breathRunning = false;
    clearInterval(breathInterval);
    clearInterval(countdownTimer);
    const btn   = document.getElementById('startBreath');
    const phase = document.getElementById('breathPhase');
    const count = document.getElementById('breathCount');
    if (btn)   btn.textContent = '▶ Start';
    if (phase) phase.textContent = 'READY';
    if (count) count.textContent = '–';
    ['.breath-circle-inner','.breath-circle-mid','.breath-circle-outer'].forEach(sel => {
      const el = document.querySelector(sel);
      if (el) el.style.transform = 'scale(1)';
    });
  }

  // ─── DASHBOARD STATS ───
  function updateDashboardStats() {
    const moodEntries = JSON.parse(localStorage.getItem('moodEntries') || '[]');
    const journalEntries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
    
    const statStreak = document.getElementById('statStreak');
    const statAvgMood = document.getElementById('statAvgMood');
    const statJournal = document.getElementById('statJournal');
    
    if (statStreak) statStreak.textContent = moodEntries.length > 0 ? 'Logged' : '0';
    if (statJournal) statJournal.textContent = journalEntries.length;
    
    if (statAvgMood && moodEntries.length > 0) {
      const avg = moodEntries.reduce((acc, curr) => acc + parseInt(curr.intensity), 0) / moodEntries.length;
      statAvgMood.textContent = avg.toFixed(1);
    }
  }
  updateDashboardStats();

  // ─── TOAST ───
  function showToast(msg, type = 'success') {
    const existing = document.querySelector('.ms-toast');
    existing?.remove();
    const toast = document.createElement('div');
    toast.className = 'ms-toast';
    toast.innerHTML = msg;
    const colors = { success: 'var(--green-500)', warning: 'var(--peach-400)', error: 'var(--rose-500)' };
    Object.assign(toast.style, {
      position: 'fixed', bottom: '28px', right: '28px', zIndex: '9999',
      background: colors[type] || colors.success,
      color: '#fff', padding: '12px 20px', borderRadius: '10px',
      fontWeight: '700', fontSize: '0.9rem', boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
      animation: 'toastIn 0.3s ease', fontFamily: 'Nunito, sans-serif',
    });
    if (!document.getElementById('toastStyle')) {
      const s = document.createElement('style');
      s.id = 'toastStyle';
      s.textContent = `@keyframes toastIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}`;
      document.head.appendChild(s);
    }
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3200);
  }

});
