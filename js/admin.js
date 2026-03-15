/* =============================================
   LINA — Admin Script (Mobile-first)
   admin.js
   ============================================= */

'use strict';

const LS_KEY = 'lina_stories_data';
let siteData = null;
let editingStory   = null;
let editingGallery = null;

/* ─── Init ──────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  checkSession();
  initSwipeModals();
});

/* ─── Data ──────────────────────────────────── */
async function loadData() {
  const saved = localStorage.getItem(LS_KEY);
  if (saved) { try { siteData = JSON.parse(saved); return; } catch(_){} }
  try {
    const r = await fetch('data/stories.json');
    siteData = await r.json();
    save();
  } catch(_) {
    siteData = defaultData();
    save();
  }
}

function save() { localStorage.setItem(LS_KEY, JSON.stringify(siteData)); }

function defaultData() {
  return {
    title:'Untuk Lina', subtitle:'Sebuah penyesalan yang terlambat',
    coverMessage:'Kamu tidak perlu membaca ini jika kamu tidak mau...',
    closingMessage:'Maafkan aku, Lina.',
    telegramBotToken:'8118603438:AAE4CCUE_VMVSSIWxWu5heAW5JwkS72wSRM',
    telegramChatId:'8118603438', popupPhoto:'', noteText:'',
    stories:[], gallery:[]
  };
}

/* ─── Session ───────────────────────────────── */
function checkSession() {
  const user = sessionStorage.getItem('lina_admin');
  if (user) showDash(user);
  else showLogin();
}

function showLogin() {
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('dashboard').style.display = 'none';
}

function showDash(user) {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('dashboard').style.display = 'flex';
  renderDash();
}

/* ─── Login / Logout ────────────────────────── */
window.doLogin = function() {
  const user = document.getElementById('login-user').value.trim();
  const err  = document.getElementById('login-err');
  if (!user) { err.textContent = 'Masukkan username terlebih dahulu.'; err.style.display = 'block'; return; }
  err.style.display = 'none';
  sessionStorage.setItem('lina_admin', user);
  showDash(user);
};

window.doLogout = function() {
  sessionStorage.removeItem('lina_admin');
  showLogin();
};

/* ─── Render Dashboard ──────────────────────── */
function renderDash() {
  renderStats();
  renderStoryList();
  renderGalleryAdmin();
  renderSettingsForm();
  updateNotePreview();
}

function renderStats() {
  q('#st-stories').textContent = siteData?.stories?.length || 0;
  q('#st-gallery').textContent = siteData?.gallery?.length || 0;
  q('#st-audio').textContent   = siteData?.stories?.filter(s=>s.audio).length || 0;
  q('#st-imgs').textContent    = (siteData?.stories?.filter(s=>s.image).length||0) + (siteData?.gallery?.length||0);
}

/* ─── Panels / Tabs ─────────────────────────── */
window.switchPanel = function(btn) {
  document.querySelectorAll('.dash-tab').forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected','false'); });
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active'); btn.setAttribute('aria-selected','true');
  q('#' + btn.dataset.panel)?.classList.add('active');
};

/* ─── Story List ────────────────────────────── */
function renderStoryList() {
  const wrap = q('#story-list');
  if (!wrap) return;

  if (!siteData?.stories?.length) {
    wrap.innerHTML = `<div class="empty-state">
      <svg viewBox="0 0 24 24"><use href="#ic-book"/></svg>
      <p>Belum ada cerita. Tambahkan yang pertama.</p>
    </div>`;
    return;
  }

  wrap.innerHTML = siteData.stories.map((s, i) => `
    <div class="story-li">
      <div class="story-li-num">${pad(i+1)}</div>
      <div class="story-li-body">
        <div class="story-li-title">${esc(s.title)}</div>
        <div class="story-li-preview">${esc(s.text)}</div>
        <div class="story-li-meta">
          ${s.date ? `<span class="badge"><svg viewBox="0 0 24 24"><use href="#ic-cal"/></svg>${esc(s.date)}</span>`:''}
          ${s.audio ? `<span class="badge badge-audio"><svg viewBox="0 0 24 24"><use href="#ic-music"/></svg>Audio</span>`:''}
          ${s.image ? `<span class="badge badge-img"><svg viewBox="0 0 24 24"><use href="#ic-image"/></svg>Gambar</span>`:''}
        </div>
      </div>
      <div class="story-li-actions">
        <button class="btn btn-ghost btn-sm" onclick="openEditStory(${s.id})" aria-label="Edit cerita">
          <svg viewBox="0 0 24 24"><use href="#ic-edit"/></svg>
        </button>
        <button class="btn btn-danger btn-sm" onclick="deleteStory(${s.id})" aria-label="Hapus cerita">
          <svg viewBox="0 0 24 24"><use href="#ic-delete"/></svg>
        </button>
      </div>
    </div>
  `).join('');
}

/* ─── Story CRUD ────────────────────────────── */
window.openAddStory = function() {
  editingStory = null;
  q('#story-modal-title').textContent = 'Tambah Cerita Baru';
  q('#story-form').reset();
  clearPreviews(['sf-audio-prev','sf-img-prev']);
  clearFileData(['sf-audio-file','sf-img-file']);
  openModal('story-modal');
};

window.openEditStory = function(id) {
  const s = siteData.stories.find(s => s.id === id);
  if (!s) return;
  editingStory = id;
  q('#story-modal-title').textContent = 'Edit Cerita';
  q('#sf-title').value      = s.title  || '';
  q('#sf-date').value       = s.date   || '';
  q('#sf-text').value       = s.text   || '';
  q('#sf-audio-path').value = s.audio  || '';
  q('#sf-img-path').value   = s.image  || '';
  q('#sf-audio-prev').textContent = s.audio ? `Aktif: ${s.audio.substring(0,40)}...` : '';
  q('#sf-img-prev').textContent   = s.image ? `Aktif: ${s.image.substring(0,40)}...` : '';
  clearFileData(['sf-audio-file','sf-img-file']);
  openModal('story-modal');
};

window.saveStory = function() {
  const title = q('#sf-title').value.trim();
  const text  = q('#sf-text').value.trim();
  if (!title || !text) { adminToast('Judul dan teks wajib diisi.','error'); return; }

  let audio = q('#sf-audio-path').value.trim();
  let image = q('#sf-img-path').value.trim();

  const aEl = q('#sf-audio-file');
  const iEl = q('#sf-img-file');
  if (aEl?.dataset.b64) audio = `data:audio/mpeg;base64,${aEl.dataset.b64}`;
  if (iEl?.dataset.b64) image = `data:image/jpeg;base64,${iEl.dataset.b64}`;

  const date = q('#sf-date').value.trim();

  if (editingStory) {
    const idx = siteData.stories.findIndex(s => s.id === editingStory);
    if (idx !== -1) siteData.stories[idx] = { ...siteData.stories[idx], title, date, text, audio, image };
    adminToast('Cerita berhasil diperbarui!','success');
  } else {
    const newId = Math.max(0, ...siteData.stories.map(s=>s.id)) + 1;
    siteData.stories.push({ id:newId, title, date, text, audio, image });
    adminToast('Cerita baru ditambahkan!','success');
  }

  save(); closeModal('story-modal'); renderStoryList(); renderStats();
};

window.deleteStory = function(id) {
  if (!confirm('Hapus cerita ini?')) return;
  siteData.stories = siteData.stories.filter(s => s.id !== id);
  save(); renderStoryList(); renderStats();
  adminToast('Cerita dihapus.','success');
};

/* ─── Gallery CRUD ──────────────────────────── */
function renderGalleryAdmin() {
  const grid = q('#gal-admin-grid');
  if (!grid) return;

  if (!siteData?.gallery?.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <svg viewBox="0 0 24 24"><use href="#ic-image"/></svg>
      <p>Belum ada foto di galeri.</p>
    </div>`;
    return;
  }

  grid.innerHTML = siteData.gallery.map(item => `
    <div class="gal-admin-item">
      ${item.src
        ? `<img class="gal-admin-img" src="${item.src}" alt="${esc(item.caption||'')}" loading="lazy"
               onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
        : ''}
      <div class="gal-admin-ph" ${item.src?'style="display:none"':''}><svg viewBox="0 0 24 24"><use href="#ic-rose"/></svg></div>
      <div class="gal-admin-foot">
        <span class="gal-admin-cap">${esc(item.caption||'Tanpa keterangan')}</span>
        <div class="gal-actions">
          <button class="btn btn-ghost btn-sm btn-icon" onclick="openEditGallery(${item.id})" aria-label="Edit">
            <svg viewBox="0 0 24 24"><use href="#ic-edit"/></svg>
          </button>
          <button class="btn btn-danger btn-sm btn-icon" onclick="deleteGallery(${item.id})" aria-label="Hapus">
            <svg viewBox="0 0 24 24"><use href="#ic-delete"/></svg>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

window.openAddGallery = function() {
  editingGallery = null;
  q('#gallery-modal-title').textContent = 'Tambah Foto';
  q('#gallery-form').reset();
  clearPreviews(['gf-img-prev']);
  clearFileData(['gf-img-file']);
  openModal('gallery-modal');
};

window.openEditGallery = function(id) {
  const item = siteData.gallery.find(g => g.id === id);
  if (!item) return;
  editingGallery = id;
  q('#gallery-modal-title').textContent = 'Edit Foto';
  q('#gf-caption').value  = item.caption || '';
  q('#gf-src-path').value = item.src     || '';
  q('#gf-img-prev').textContent = item.src ? `Aktif: ${item.src.substring(0,40)}...` : '';
  clearFileData(['gf-img-file']);
  openModal('gallery-modal');
};

window.saveGallery = function() {
  let src = q('#gf-src-path').value.trim();
  const fileEl = q('#gf-img-file');
  if (fileEl?.dataset.b64) src = `data:image/jpeg;base64,${fileEl.dataset.b64}`;

  if (!src) { adminToast('Pilih foto terlebih dahulu.','error'); return; }

  const caption = q('#gf-caption').value.trim();

  if (editingGallery) {
    const idx = siteData.gallery.findIndex(g => g.id === editingGallery);
    if (idx !== -1) siteData.gallery[idx] = { ...siteData.gallery[idx], src, caption };
    adminToast('Foto diperbarui!','success');
  } else {
    const newId = Math.max(0, ...siteData.gallery.map(g=>g.id)) + 1;
    siteData.gallery.push({ id:newId, src, caption });
    adminToast('Foto ditambahkan!','success');
  }

  save(); closeModal('gallery-modal'); renderGalleryAdmin(); renderStats();
};

window.deleteGallery = function(id) {
  if (!confirm('Hapus foto ini?')) return;
  siteData.gallery = siteData.gallery.filter(g => g.id !== id);
  save(); renderGalleryAdmin(); renderStats();
  adminToast('Foto dihapus.','success');
};

/* ─── Note ──────────────────────────────────── */
window.updateNotePreview = function() {
  const ta = q('#note-ta');
  const pv = q('#note-preview');
  if (ta && pv) pv.textContent = ta.value;
};

window.saveNote = function() {
  const val = q('#note-ta')?.value || '';
  siteData.noteText = val;
  save();
  adminToast('Catatan disimpan!','success');
};

/* ─── Settings ──────────────────────────────── */
function renderSettingsForm() {
  if (!siteData) return;
  const map = {
    's-title': siteData.title,
    's-sub':   siteData.subtitle,
    's-cover': siteData.coverMessage,
    's-closing':    siteData.closingMessage,
    's-tg-token':   siteData.telegramBotToken,
    's-tg-chat':    siteData.telegramChatId,
    's-popup-photo':siteData.popupPhoto,
  };
  Object.entries(map).forEach(([id, val]) => {
    const el = q('#'+id);
    if (el && val) el.value = val;
  });
}

window.saveSettings = function() {
  const photoFile = q('#popup-photo-file');
  let popupSrc = q('#s-popup-photo')?.value.trim() || '';
  if (photoFile?.dataset.b64) popupSrc = `data:image/jpeg;base64,${photoFile.dataset.b64}`;

  siteData.title            = q('#s-title')?.value.trim()   || siteData.title;
  siteData.subtitle         = q('#s-sub')?.value.trim()     || siteData.subtitle;
  siteData.coverMessage     = q('#s-cover')?.value.trim()   || siteData.coverMessage;
  siteData.closingMessage   = q('#s-closing')?.value.trim() || siteData.closingMessage;
  siteData.telegramBotToken = q('#s-tg-token')?.value.trim()|| siteData.telegramBotToken;
  siteData.telegramChatId   = q('#s-tg-chat')?.value.trim() || siteData.telegramChatId;
  if (popupSrc) siteData.popupPhoto = popupSrc;

  save();
  adminToast('Pengaturan disimpan!','success');
};

window.exportData = function() {
  const blob = new Blob([JSON.stringify(siteData, null, 2)], { type:'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = 'lina-backup.json'; a.click();
  URL.revokeObjectURL(url);
  adminToast('Data berhasil diekspor!','success');
};

window.resetData = function() {
  if (!confirm('Reset semua data? Semua perubahan akan hilang!')) return;
  localStorage.removeItem(LS_KEY);
  location.reload();
};

/* ─── Telegram test ─────────────────────────── */
window.testTelegram = async function() {
  const token  = q('#s-tg-token')?.value.trim();
  const chatId = q('#s-tg-chat')?.value.trim();
  if (!token || !chatId) { adminToast('Isi token dan chat ID dulu.','error'); return; }
  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ chat_id: chatId, text:'Test dari dashboard Lina berhasil!' })
    });
    const d = await r.json();
    if (d.ok) adminToast('Pesan test terkirim ke Telegram!','success');
    else adminToast('Gagal: ' + d.description,'error');
  } catch(e) {
    adminToast('Error: ' + e.message,'error');
  }
};

/* ─── File Handling ─────────────────────────── */
window.handleFile = function(inputId, previewId, type) {
  const input = q('#'+inputId);
  if (!input?.files?.[0]) return;
  const file = input.files[0];
  const reader = new FileReader();

  reader.onload = (e) => {
    const b64 = e.target.result.split(',')[1];
    input.dataset.b64 = b64;

    const prev = q('#'+previewId);
    if (!prev) return;
    if (type === 'image') {
      prev.innerHTML = `<img src="${e.target.result}" style="max-height:100px;max-width:100%;margin-top:.5rem;border:1px solid var(--border);">`;
    } else {
      prev.textContent = `${file.name} (${(file.size/1024).toFixed(1)} KB)`;
    }
  };
  reader.readAsDataURL(file);
};

/* ─── Modal ─────────────────────────────────── */
function openModal(id) {
  q('#'+id)?.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeModal(id) {
  q('#'+id)?.classList.remove('active');
  document.body.style.overflow = '';
}
window.openModal  = openModal;
window.closeModal = closeModal;

// Close on overlay tap
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('active');
    document.body.style.overflow = '';
  }
});

// Swipe-down to close bottom sheet modals
function initSwipeModals() {
  document.querySelectorAll('.modal-sheet').forEach(sheet => {
    let startY = 0;
    sheet.addEventListener('touchstart', e => {
      startY = e.touches[0].clientY;
    }, { passive:true });
    sheet.addEventListener('touchend', e => {
      const dy = e.changedTouches[0].clientY - startY;
      if (dy > 80) {
        const overlay = sheet.closest('.modal-overlay');
        if (overlay) { overlay.classList.remove('active'); document.body.style.overflow = ''; }
      }
    }, { passive:true });
  });
}

/* ─── Toast ─────────────────────────────────── */
function adminToast(msg, type='info') {
  const el = q('#admin-toast');
  if (!el) return;
  el.textContent = msg;
  el.className   = `admin-toast ${type} show`;
  setTimeout(() => el.classList.remove('show'), 2800);
}

/* ─── Utils ─────────────────────────────────── */
function q(sel) { return document.querySelector(sel); }
function esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function pad(n) { return String(n).padStart(2,'0'); }
function clearPreviews(ids) { ids.forEach(id => { const el=q('#'+id); if(el){el.innerHTML='';el.textContent='';} }); }
function clearFileData(ids) { ids.forEach(id => { const el=q('#'+id); if(el){el.dataset.b64='';} }); }
