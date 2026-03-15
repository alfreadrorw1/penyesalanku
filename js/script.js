/* =============================================
   LINA — Mobile Script (Android + iPhone)
   script.js
   ============================================= */

'use strict';

// ── Config ──────────────────────────────────
const LS_KEY             = 'lina_stories_data';
const TELEGRAM_BOT_TOKEN = '8118603438:AAE4CCUE_VMVSSIWxWu5heAW5JwkS72wSRM';
const TELEGRAM_CHAT_ID   = '5789407694';

// ── State ────────────────────────────────────
let siteData        = null;
let audioStates     = {};   // id → { el, playing }
let bgMusic         = null;
let bgMusicPlaying  = false;
let popupShown      = false;

// ── Touch state (swipe to close lightbox) ────
let touchStartX = 0, touchStartY = 0;

/* ═══════════════════════════════════════════
   INIT
   ═══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  initLoveBubbles();
  initParticles();
  initOpeningScreen();
  renderHero();
  renderStories();
  renderGallery();
  renderClosing();
  initBgMusic();
  initScrollReveal();
  initBottomNav();
  initTopNav();
  initLightbox();
  preventZoom();

  // Popup after slight delay so user can see the page first
  setTimeout(showPopup, 5000);
});

/* ═══════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════ */
async function loadData() {
  const saved = localStorage.getItem(LS_KEY);
  if (saved) {
    try { siteData = JSON.parse(saved); return; } catch (_) {}
  }
  try {
    const r = await fetch('data/stories.json');
    siteData = await r.json();
  } catch (_) {
    siteData = defaultData();
  }
}

function defaultData() {
  return {
    title: 'Lina', subtitle: 'Sebuah penyesalan yang terlambat',
    coverMessage: 'Kamu tidak perlu membaca ini jika kamu tidak mau...',
    closingMessage: 'Maafkan aku, Lina.',
    telegramBotToken: TELEGRAM_BOT_TOKEN, telegramChatId: TELEGRAM_CHAT_ID,
    popupPhoto: '', stories: [], gallery: []
  };
}

/* ═══════════════════════════════════════════
   PREVENT DOUBLE-TAP ZOOM (iOS / Android)
   ═══════════════════════════════════════════ */
function preventZoom() {
  let lastTap = 0;
  document.addEventListener('touchend', e => {
    const now = Date.now();
    if (now - lastTap < 300) e.preventDefault();
    lastTap = now;
  }, { passive: false });
}

/* ═══════════════════════════════════════════
   LOVE BUBBLES  — SVG hearts, no emoji
   ═══════════════════════════════════════════ */
function initLoveBubbles() {
  const container = document.getElementById('love-bubbles');
  if (!container) return;

  // Different heart SVG shapes for variety
  const shapes = [
    // filled heart
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/></svg>`,
    // outline heart
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 4.435c-1.989-5.399-12-4.597-12 3.568 0 4.068 3.06 9.481 12 14.997 8.94-5.516 12-10.929 12-14.997 0-8.118-10-8.999-12-3.568z"/></svg>`,
    // rose shape
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C9 2 7 4 7 7c0 2.5 1.5 4.5 3.5 5.5L9 22h6l-1.5-9.5C15.5 11.5 17 9.5 17 7c0-3-2-5-5-5z"/></svg>`,
  ];

  const colors = [
    'rgba(201,72,91,0.85)',
    'rgba(232,122,143,0.75)',
    'rgba(201,72,91,0.55)',
    'rgba(255,150,170,0.65)',
  ];

  function spawn() {
    const el  = document.createElement('div');
    el.className = 'bubble';
    el.setAttribute('aria-hidden', 'true');

    const size  = Math.random() * 18 + 10;  // 10–28 px
    const color = colors[Math.floor(Math.random() * colors.length)];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    const dur   = Math.random() * 7 + 6;    // 6–13 s
    const delay = Math.random() * 2;

    el.innerHTML = shape;
    el.style.cssText = `
      left: ${Math.random() * 100}vw;
      width: ${size}px; height: ${size}px;
      color: ${color};
      animation-duration: ${dur}s;
      animation-delay: ${delay}s;
    `;
    // SVG inside inherits color via fill:currentColor
    el.querySelector('svg').style.cssText = `
      width:100%; height:100%; fill:${color};
      filter: drop-shadow(0 0 4px ${color});
    `;

    container.appendChild(el);
    setTimeout(() => el.remove(), (dur + delay + 1) * 1000);
  }

  spawn();
  setInterval(spawn, 700);
}

/* ═══════════════════════════════════════════
   PARTICLES
   ═══════════════════════════════════════════ */
function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let pts = [];

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  // Fewer particles on mobile for perf
  const count = window.innerWidth < 500 ? 30 : 50;
  for (let i = 0; i < count; i++) {
    pts.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.2 + 0.3,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      phase: Math.random() * Math.PI * 2,
    });
  }

  let raf;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pts.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.phase += 0.006;
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      const a = (Math.sin(p.phase) + 1) / 2 * 0.5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(201,72,91,${a})`;
      ctx.fill();
    });
    raf = requestAnimationFrame(draw);
  }
  draw();

  // Pause when tab hidden (battery / CPU saving)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else draw();
  });
}

/* ═══════════════════════════════════════════
   OPENING SCREEN
   ═══════════════════════════════════════════ */
function initOpeningScreen() {
  const screen = document.getElementById('opening-screen');
  const btn    = document.getElementById('btn-enter');
  if (!screen || !btn) return;

  btn.addEventListener('click', () => {
    screen.classList.add('hidden');
    // Try to autoplay bg music on user gesture
    if (bgMusic) {
      bgMusic.play()
        .then(() => { bgMusicPlaying = true; updateMusicIcon(); })
        .catch(() => {});
    }
  }, { passive: true });
}

/* ═══════════════════════════════════════════
   RENDER HERO
   ═══════════════════════════════════════════ */
function renderHero() {
  if (!siteData) return;
  const subEl = document.getElementById('hero-sub');
  if (subEl && siteData.subtitle) subEl.textContent = siteData.subtitle;
}

/* ═══════════════════════════════════════════
   RENDER STORIES
   ═══════════════════════════════════════════ */
function renderStories() {
  const wrap = document.getElementById('stories-container');
  if (!wrap || !siteData?.stories) return;
  wrap.innerHTML = '';

  siteData.stories.forEach((story, idx) => {
    const card = document.createElement('article');
    card.className  = 'story-card';
    card.dataset.idx = idx;

    // Split text into lines for staggered reveal
    const sentences = story.text.match(/[^.!?]+[.!?]*/g) || [story.text];
    const linesHtml = sentences.map((s, i) =>
      `<span class="story-line" style="transition-delay:${i * 0.14}s">${s.trim()}</span> `
    ).join('');

    // Image or placeholder
    let imgHtml = '';
    if (story.image) {
      imgHtml = `
        <img class="story-img" src="${story.image}" alt="${esc(story.title)}" loading="lazy"
             onerror="this.replaceWith(makePlaceholderImg())">`;
    } else {
      imgHtml = `
        <div class="story-img-placeholder" aria-hidden="true">
          <svg viewBox="0 0 24 24"><use href="#ic-rose"/></svg>
          <p>Kenangan ini tersimpan di hati</p>
        </div>`;
    }

    // Audio player
    let audioHtml = '';
    if (story.audio) {
      audioHtml = `
        <div class="audio-player" role="group" aria-label="Pemain audio">
          <button class="audio-play-btn" id="abtn-${story.id}"
                  onclick="toggleAudio(${story.id})"
                  aria-label="Putar / Jeda audio cerita ${idx + 1}">
            <svg viewBox="0 0 24 24"><use href="#ic-play" id="aicon-use-${story.id}"/></svg>
          </button>
          <div class="audio-meta">
            <span class="audio-label">Dengarkan</span>
            <div class="audio-bar-wrap" id="abar-${story.id}"
                 role="slider" aria-label="Posisi audio"
                 aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
              <div class="audio-bar-fill" id="afill-${story.id}"></div>
            </div>
            <span class="audio-time" id="atime-${story.id}" aria-live="off">0:00 / 0:00</span>
          </div>
          <audio id="audio-${story.id}" src="${story.audio}" preload="none"></audio>
        </div>`;
    }

    card.innerHTML = `
      <div class="story-num" aria-hidden="true">${String(idx + 1).padStart(2, '0')}</div>
      ${story.date ? `<div class="story-date-tag">
        <svg viewBox="0 0 24 24" aria-hidden="true"><use href="#ic-cal"/></svg>
        ${esc(story.date)}
      </div>` : ''}
      <h3 class="story-title">${esc(story.title)}</h3>
      ${imgHtml}
      <div class="story-text" aria-label="${esc(story.title)}">${linesHtml}</div>
      ${audioHtml}
    `;

    wrap.appendChild(card);

    if (story.audio) setupAudio(story.id);
  });
}

// Helper: create placeholder img element
window.makePlaceholderImg = function () {
  const div = document.createElement('div');
  div.className = 'story-img-placeholder';
  div.setAttribute('aria-hidden', 'true');
  div.innerHTML = `<svg viewBox="0 0 24 24"><use href="#ic-rose"/></svg><p>Foto tidak tersedia</p>`;
  return div;
};

/* ═══════════════════════════════════════════
   AUDIO ENGINE
   ═══════════════════════════════════════════ */
function setupAudio(id) {
  const audio = document.getElementById(`audio-${id}`);
  if (!audio) return;
  audioStates[id] = { el: audio, playing: false };

  audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    const pct  = (audio.currentTime / audio.duration) * 100;
    const fill = document.getElementById(`afill-${id}`);
    const time = document.getElementById(`atime-${id}`);
    const bar  = document.getElementById(`abar-${id}`);
    if (fill) fill.style.width = pct + '%';
    if (time) time.textContent = `${fmt(audio.currentTime)} / ${fmt(audio.duration)}`;
    if (bar)  bar.setAttribute('aria-valuenow', Math.round(pct));
  });

  audio.addEventListener('ended', () => {
    audioStates[id].playing = false;
    setAudioIcon(id, false);
  });

  // Touch scrub on progress bar
  const bar = document.getElementById(`abar-${id}`);
  if (bar) {
    bar.addEventListener('touchstart', e => {
      scrubAudio(e.touches[0], id, bar);
    }, { passive: true });
    bar.addEventListener('touchmove', e => {
      scrubAudio(e.touches[0], id, bar);
    }, { passive: true });
    bar.addEventListener('click', e => {
      scrubAudio(e, id, bar);
    });
  }
}

function scrubAudio(touch, id, bar) {
  const audio = document.getElementById(`audio-${id}`);
  if (!audio || !audio.duration) return;
  const rect = bar.getBoundingClientRect();
  const pct  = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width));
  audio.currentTime = pct * audio.duration;
}

window.toggleAudio = function (id) {
  const st = audioStates[id];
  if (!st) return;

  // Pause all others
  Object.entries(audioStates).forEach(([k, s]) => {
    if (parseInt(k) !== id && s.playing) {
      s.el.pause(); s.playing = false; setAudioIcon(parseInt(k), false);
    }
  });

  if (st.playing) {
    st.el.pause(); st.playing = false; setAudioIcon(id, false);
  } else {
    st.el.play().catch(() => {});
    st.playing = true; setAudioIcon(id, true);
  }
};

function setAudioIcon(id, playing) {
  const use = document.getElementById(`aicon-use-${id}`);
  if (use) use.setAttribute('href', playing ? '#ic-pause' : '#ic-play');
  const btn = document.getElementById(`abtn-${id}`);
  if (btn) btn.setAttribute('aria-label', playing ? 'Jeda audio' : 'Putar audio');
}

function fmt(s) {
  const m = Math.floor(s / 60), sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, '0')}`;
}

// Auto-play story audio when card enters viewport
function autoPlayCard(card) {
  const idx   = parseInt(card.dataset.idx);
  const story = siteData?.stories?.[idx];
  if (!story?.audio || !story?.id) return;
  const id = story.id;
  if (!audioStates[id] || audioStates[id].playing) return;
  const anyPlaying = Object.values(audioStates).some(s => s.playing);
  if (anyPlaying) return;
  const audio = audioStates[id].el;
  audio.play().catch(() => {});
  audioStates[id].playing = true;
  setAudioIcon(id, true);
}

/* ═══════════════════════════════════════════
   RENDER GALLERY
   ═══════════════════════════════════════════ */
function renderGallery() {
  const grid = document.getElementById('gallery-container');
  if (!grid || !siteData?.gallery) return;
  grid.innerHTML = '';

  siteData.gallery.forEach((item, idx) => {
    const div = document.createElement('div');
    div.className = 'gallery-item';
    div.style.transitionDelay = `${idx * 0.08}s`;

    if (item.src) {
      div.innerHTML = `
        <img src="${item.src}" alt="${esc(item.caption || 'Kenangan')}" loading="lazy"
             onerror="this.parentElement.innerHTML='<div class=gallery-placeholder aria-hidden=true><svg viewBox=\\'0 0 24 24\\'><use href=\\'#ic-rose\\'/></svg><p>${esc(item.caption || 'Foto')}</p></div>'">
        <div class="gallery-overlay" aria-hidden="true">
          <p class="gallery-cap">${esc(item.caption || '')}</p>
        </div>`;
    } else {
      div.innerHTML = `
        <div class="gallery-placeholder" aria-hidden="true">
          <svg viewBox="0 0 24 24"><use href="#ic-rose"/></svg>
          <p>${esc(item.caption || 'Kenangan')}</p>
        </div>`;
    }

    // Touch + click to open lightbox
    div.addEventListener('click', () => openLightbox(item.src, item.caption), { passive: true });
    grid.appendChild(div);
  });
}

/* ═══════════════════════════════════════════
   RENDER CLOSING
   ═══════════════════════════════════════════ */
function renderClosing() {
  const el = document.getElementById('closing-message');
  if (el && siteData?.closingMessage) el.textContent = siteData.closingMessage;
}

/* ═══════════════════════════════════════════
   LIGHTBOX — full screen, swipe to close
   ═══════════════════════════════════════════ */
function initLightbox() {
  const lb    = document.getElementById('lightbox');
  const close = document.getElementById('lightbox-close');
  if (!lb) return;

  close?.addEventListener('click', closeLightbox);

  // Swipe down to close
  lb.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  lb.addEventListener('touchend', e => {
    const dy = e.changedTouches[0].clientY - touchStartY;
    const dx = Math.abs(e.changedTouches[0].clientX - touchStartX);
    if (dy > 60 && dx < 80) closeLightbox();
  }, { passive: true });

  // Tap background to close
  lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });

  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
}

window.openLightbox = function (src, caption) {
  if (!src) return;
  const lb  = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');
  const cap = document.getElementById('lightbox-cap');
  if (img) { img.src = src; img.alt = caption || ''; }
  if (cap) cap.textContent = caption || '';
  lb?.classList.add('active');
  document.body.style.overflow = 'hidden';
};

function closeLightbox() {
  document.getElementById('lightbox')?.classList.remove('active');
  document.body.style.overflow = '';
}

/* ═══════════════════════════════════════════
   BG MUSIC
   ═══════════════════════════════════════════ */
function initBgMusic() {
  bgMusic = document.getElementById('bg-music');
  const btn = document.getElementById('music-btn');
  if (!bgMusic || !btn) return;

  bgMusic.volume = 0.22;
  bgMusic.loop   = true;

  btn.addEventListener('click', () => {
    if (bgMusicPlaying) {
      bgMusic.pause();
      bgMusicPlaying = false;
    } else {
      bgMusic.play().catch(() => {});
      bgMusicPlaying = true;
    }
    updateMusicIcon();
  }, { passive: true });
}

function updateMusicIcon() {
  const btn  = document.getElementById('music-btn');
  const icon = document.getElementById('music-icon');
  if (!btn || !icon) return;

  if (bgMusicPlaying) {
    icon.innerHTML = '<use href="#ic-music"/>';
    btn.classList.add('playing');
    btn.setAttribute('aria-label', 'Matikan musik');
  } else {
    icon.innerHTML = '<use href="#ic-music-off"/>';
    btn.classList.remove('playing');
    btn.setAttribute('aria-label', 'Putar musik latar');
  }
}

/* ═══════════════════════════════════════════
   SCROLL REVEAL + BOTTOM NAV ACTIVE STATE
   ═══════════════════════════════════════════ */
function initScrollReveal() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add('visible');

      // Stagger story text lines
      if (el.classList.contains('story-card')) {
        el.querySelectorAll('.story-line').forEach((line, i) => {
          setTimeout(() => line.classList.add('in'), i * 140 + 250);
        });
        autoPlayCard(el);
      }

      io.unobserve(el);
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -5% 0px' });

  document.querySelectorAll('.story-card, .gallery-item, .reveal').forEach(el => io.observe(el));
}

/* ═══════════════════════════════════════════
   BOTTOM NAV — highlight active section
   ═══════════════════════════════════════════ */
function initBottomNav() {
  const sections = ['hero', 'stories', 'gallery', 'note'];
  const items    = document.querySelectorAll('.bottom-nav-item[data-section]');

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      items.forEach(item => {
        item.classList.toggle('active', item.dataset.section === id);
      });
    });
  }, { threshold: 0.4 });

  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) io.observe(el);
  });

  // Smooth scroll on tap
  items.forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      const target = document.getElementById(item.dataset.section);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, { passive: false });
  });
}

/* ═══════════════════════════════════════════
   TOP NAV scroll shadow
   ═══════════════════════════════════════════ */
function initTopNav() {
  const nav = document.getElementById('top-nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}

/* ═══════════════════════════════════════════
   POPUP — bottom sheet with Telegram callback
   ═══════════════════════════════════════════ */
function showPopup() {
  if (popupShown) return;
  popupShown = true;

  const overlay = document.getElementById('popup-overlay');
  if (!overlay) return;

  // Set popup photo if provided
  const photoEl  = document.getElementById('popup-photo');
  const phEl     = document.getElementById('popup-photo-ph');
  const photoSrc = siteData?.popupPhoto || '';
  if (photoSrc && photoEl) {
    photoEl.src = photoSrc;
    photoEl.style.display = 'block';
    if (phEl) phEl.style.display = 'none';
    photoEl.onerror = () => {
      photoEl.style.display = 'none';
      if (phEl) phEl.style.display = 'flex';
    };
  }

  overlay.classList.add('active');

  // Swipe down to dismiss
  const sheet = document.getElementById('popup-sheet');
  if (sheet) {
    let startY = 0;
    sheet.addEventListener('touchstart', e => { startY = e.touches[0].clientY; }, { passive: true });
    sheet.addEventListener('touchend', e => {
      if (e.changedTouches[0].clientY - startY > 70) closePopup();
    }, { passive: true });
  }
}

window.handlePopupResponse = async function (liked) {
  const btns  = document.getElementById('popup-buttons');
  const thanks = document.getElementById('popup-thanks');
  const icon   = document.getElementById('popup-thanks-icon');
  const msg    = document.getElementById('popup-thanks-msg');

  if (btns) btns.style.display = 'none';
  if (thanks) thanks.classList.add('show');

  if (liked) {
    if (icon) icon.innerHTML = '<svg viewBox="0 0 24 24"><use href="#ic-heart"/></svg>';
    if (msg)  msg.textContent = 'Terima kasih, Lina... Itu berarti segalanya untukku.';
  } else {
    if (icon) icon.innerHTML = '<svg viewBox="0 0 24 24"><use href="#ic-heart-break"/></svg>';
    if (msg)  msg.textContent = 'Aku mengerti... dan aku tetap minta maaf.';
  }

  await sendTelegram(liked);
  setTimeout(closePopup, 3200);
};

window.closePopup = function () {
  document.getElementById('popup-overlay')?.classList.remove('active');
};

async function sendTelegram(liked) {
  const token  = siteData?.telegramBotToken || TELEGRAM_BOT_TOKEN;
  const chatId = siteData?.telegramChatId   || TELEGRAM_CHAT_ID;
  const text   = liked
    ? 'Lina menyukai halaman ini — dia menekan tombol Suka'
    : 'Lina tidak menyukai halaman ini — dia menekan tombol Tidak';

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
  } catch (_) {}
}

/* ═══════════════════════════════════════════
   TOAST
   ═══════════════════════════════════════════ */
function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
}

/* ═══════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════ */
function esc(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// Expose for inline usage
window.closeLightbox = closeLightbox;
window.showToast     = showToast;
