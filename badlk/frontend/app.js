// frontend/app.js — BADLK v2
'use strict';

const API_BASE = window.location.origin + '/api';

// ══ Auth helpers ═══════════════════════════════════════════════════
function getToken()   { return localStorage.getItem('badlk_token'); }
function setToken(t)  { t ? localStorage.setItem('badlk_token', t) : localStorage.removeItem('badlk_token'); }
function getUser()    { try { return JSON.parse(localStorage.getItem('badlk_user') || 'null'); } catch { return null; } }
function setUser(u)   { u ? localStorage.setItem('badlk_user', JSON.stringify(u)) : localStorage.removeItem('badlk_user'); }
function authHeaders(){ const t = getToken(); return t ? { Authorization: 'Bearer ' + t } : {}; }

async function api(path, opts = {}) {
  opts.headers = Object.assign({ 'Content-Type': 'application/json' }, opts.headers || {});
  try {
    const res = await fetch(API_BASE + path, opts);
    if (res.status === 401) { setToken(null); setUser(null); updateAuthUI(); }
    return res.json();
  } catch (e) {
    return { error: 'Erreur réseau' };
  }
}

// ══ Toast ═══════════════════════════════════════════════════════════
let toastTimer;
function toast(msg, type = 'info') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `toast toast-${type}`;
  el.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add('hidden'), 3200);
}

// ══ Auth UI ══════════════════════════════════════════════════════════
function updateAuthUI() {
  const user = getUser();
  const pill = document.getElementById('user-pill');
  const btnLogin = document.getElementById('btn-show-login');
  const btnReg   = document.getElementById('btn-show-register');
  const nameEl   = document.getElementById('user-name-display');
  if (user) {
    pill.classList.remove('hidden');
    btnLogin.classList.add('hidden');
    btnReg.classList.add('hidden');
    nameEl.textContent = user.name || user.email;
  } else {
    pill.classList.add('hidden');
    btnLogin.classList.remove('hidden');
    btnReg.classList.remove('hidden');
  }
}

// ══ Auth modal ═══════════════════════════════════════════════════════
function openAuthModal(pane) {
  document.getElementById('auth-modal').classList.remove('hidden');
  document.getElementById('login-pane').classList.add('hidden');
  document.getElementById('register-pane').classList.add('hidden');
  document.getElementById(pane + '-pane').classList.remove('hidden');
}
function closeAuthModal() { document.getElementById('auth-modal').classList.add('hidden'); }
function showLogin()    { openAuthModal('login'); }
function showRegister() { openAuthModal('register'); }

document.getElementById('btn-show-login').addEventListener('click', showLogin);
document.getElementById('btn-show-register').addEventListener('click', showRegister);
document.getElementById('btn-logout').addEventListener('click', () => {
  setToken(null); setUser(null); updateAuthUI();
  toast('Déconnecté', 'info');
});
document.getElementById('auth-modal').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeAuthModal();
});

// Register
document.getElementById('btn-register').addEventListener('click', async () => {
  const btn = document.getElementById('btn-register');
  btn.disabled = true; btn.textContent = 'Inscription…';
  const name     = document.getElementById('reg-name').value.trim();
  const email    = document.getElementById('reg-email').value.trim();
  const phone    = document.getElementById('reg-phone').value.trim();
  const password = document.getElementById('reg-password').value;
  if (!email || !password) { toast('Email et mot de passe requis', 'error'); btn.disabled = false; btn.textContent = 'Créer mon compte'; return; }
  const res = await api('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, phone, password }) });
  if (res.token) {
    setToken(res.token); setUser(res.user); updateAuthUI();
    closeAuthModal(); toast('Bienvenue, ' + (res.user.name || email) + ' !', 'success');
  } else {
    toast(res.error || 'Erreur inscription', 'error');
  }
  btn.disabled = false; btn.textContent = 'Créer mon compte';
});

// Login
document.getElementById('btn-login').addEventListener('click', async () => {
  const btn = document.getElementById('btn-login');
  btn.disabled = true; btn.textContent = 'Connexion…';
  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const res = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  if (res.token) {
    setToken(res.token); setUser(res.user); updateAuthUI();
    closeAuthModal(); toast('Connecté en tant que ' + (res.user.name || email), 'success');
  } else {
    toast(res.error || 'Identifiants invalides', 'error');
  }
  btn.disabled = false; btn.textContent = 'Se connecter';
});

// ══ Ads ════════════════════════════════════════════════════════════
const CATEGORY_EMOJI = {
  'Mode': '👗', 'Immobilier': '🏠', 'Véhicules': '🚗',
  'Alimentation': '🥘', 'Services': '💼', 'Électronique': '📱',
  'Autres': '📦'
};

async function loadAds() {
  const q   = encodeURIComponent(document.getElementById('search-input').value || '');
  const cat = encodeURIComponent(document.getElementById('filter-category').value || '');
  const el  = document.getElementById('ads-list');
  el.innerHTML = '<div class="state-loading">Chargement…</div>';
  const ads = await api(`/ads?q=${q}&category=${cat}`);
  renderAds(Array.isArray(ads) ? ads : []);
}

function renderAds(ads) {
  const el = document.getElementById('ads-list');
  el.innerHTML = '';
  if (!ads.length) {
    el.innerHTML = `<div class="state-empty"><span>🔍</span><p>Aucune annonce trouvée.</p></div>`;
    return;
  }
  ads.forEach(ad => {
    const article = document.createElement('article');
    article.className = 'ad-card';
    const img    = ad.photos ? ad.photos.split(',')[0].trim() : '';
    const emoji  = CATEGORY_EMOJI[ad.category] || '📦';
    const price  = Number(ad.price).toLocaleString('fr-CM') + ' XAF';

    article.innerHTML = `
      ${img
        ? `<div class="ad-img" style="background-image:url(${img})">
             <span class="ad-badge">${ad.category}</span>
           </div>`
        : `<div class="ad-img-placeholder">${emoji}</div>`
      }
      <div class="ad-body">
        <h3 class="ad-title">${escHtml(ad.title)}</h3>
        <p class="ad-desc">${escHtml(ad.description || '')}</p>
        <div class="ad-meta">
          <span>${escHtml(ad.category)}</span>
          ${ad.location ? `<span>${escHtml(ad.location)}</span>` : ''}
          <span>${timeAgo(ad.created_at)}</span>
        </div>
        <div class="ad-price">${price}</div>
        <div class="ad-actions">
          <button class="btn-contact">📞 Contacter</button>
          <button class="btn-pay-cta">💳 Payer</button>
          <button class="btn-report-sm" title="Signaler">⚠</button>
        </div>
      </div>`;

    article.querySelector('.btn-contact').addEventListener('click', () => {
      toast('Messagerie en cours d\'intégration', 'info');
    });
    article.querySelector('.btn-pay-cta').addEventListener('click', () => openPayModal(ad));
    article.querySelector('.btn-report-sm').addEventListener('click', async () => {
      if (!confirm('Signaler cette annonce pour contenu inapproprié ?')) return;
      await fetch(`${API_BASE}/ads/${ad.id}/report`, { method: 'POST' });
      toast('Annonce signalée, merci !', 'info');
    });
    el.appendChild(article);
  });
}

function escHtml(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 3600)   return Math.floor(diff/60) + ' min';
  if (diff < 86400)  return Math.floor(diff/3600) + 'h';
  if (diff < 604800) return Math.floor(diff/86400) + 'j';
  return new Date(dateStr).toLocaleDateString('fr-CM');
}

// ══ Post form ══════════════════════════════════════════════════════
function showHome() {
  document.getElementById('post-section').classList.add('hidden');
}
function cancelPost() { showHome(); }

document.getElementById('btn-new-ad').addEventListener('click', () => {
  if (!getToken()) { toast('Connectez-vous pour déposer une annonce', 'error'); showLogin(); return; }
  document.getElementById('post-section').classList.toggle('hidden');
  document.getElementById('post-section').scrollIntoView({ behavior: 'smooth' });
});

document.getElementById('btn-publish').addEventListener('click', async () => {
  const btn = document.getElementById('btn-publish');
  const title       = document.getElementById('ad-title').value.trim();
  const category    = document.getElementById('ad-category').value;
  const description = document.getElementById('ad-desc').value.trim();
  const price       = Number(document.getElementById('ad-price').value);
  const location    = document.getElementById('ad-location').value.trim();
  const photos      = document.getElementById('ad-photos').value.split(',').map(s => s.trim()).filter(Boolean);

  if (!title || !description) { toast('Titre et description requis', 'error'); return; }
  if (!price || price <= 0)   { toast('Prix invalide', 'error'); return; }

  btn.disabled = true; btn.textContent = 'Publication…';
  const res = await api('/ads', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ title, category, description, price, location, photos })
  });
  if (res.id) {
    toast('Annonce publiée !', 'success');
    document.getElementById('ad-title').value = '';
    document.getElementById('ad-desc').value  = '';
    document.getElementById('ad-price').value = '';
    document.getElementById('ad-location').value = '';
    document.getElementById('ad-photos').value = '';
    document.getElementById('post-section').classList.add('hidden');
    loadAds();
  } else {
    toast(res.error || 'Erreur lors de la publication', 'error');
  }
  btn.disabled = false; btn.textContent = "Publier l'annonce";
});

// ══ Search ═════════════════════════════════════════════════════════
let searchDebounce;
function onSearch() {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(loadAds, 350);
}
document.getElementById('search-input').addEventListener('input', onSearch);
document.getElementById('filter-category').addEventListener('change', loadAds);

// Hero search
document.getElementById('search-hero').addEventListener('input', e => {
  document.getElementById('search-input').value = e.target.value;
  onSearch();
});

function focusSearch() {
  const val = document.getElementById('search-hero').value;
  document.getElementById('search-input').value = val;
  document.getElementById('search-bar').scrollIntoView({ behavior: 'smooth' });
  setTimeout(() => document.getElementById('search-input').focus(), 400);
  loadAds();
}
function filterCat(cat) {
  document.getElementById('filter-category').value = cat;
  document.getElementById('search-bar').scrollIntoView({ behavior: 'smooth' });
  loadAds();
}

// ══ Payment modal ══════════════════════════════════════════════════
let currentAd = null;

function openPayModal(ad) {
  if (!getToken()) { toast('Connectez-vous pour payer', 'error'); showLogin(); return; }
  currentAd = ad;
  document.getElementById('pay-ad-title').textContent = ad.title;
  document.getElementById('pay-ad-price').textContent = Number(ad.price).toLocaleString('fr-CM') + ' XAF';
  document.getElementById('pay-phone').value = '';
  document.getElementById('pay-modal').classList.remove('hidden');
}
function closePayModal() { document.getElementById('pay-modal').classList.add('hidden'); currentAd = null; }

document.getElementById('pay-modal').addEventListener('click', e => {
  if (e.target === e.currentTarget) closePayModal();
});

async function initiatePayment(provider) {
  if (!currentAd) return;
  const phone = document.getElementById('pay-phone').value.trim();
  if (!phone || phone.length < 8) { toast('Numéro de téléphone invalide', 'error'); return; }

  const btn = document.getElementById('btn-pay-' + provider);
  btn.disabled = true;
  const prevText = btn.innerHTML;
  btn.textContent = 'En cours…';

  const res = await api(`/payments/${provider}`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ adId: currentAd.id, phone })
  });

  btn.disabled = false; btn.innerHTML = prevText;

  if (res.ok) {
    closePayModal();
    toast(`✅ Paiement ${provider.toUpperCase()} initié — vérifiez votre téléphone`, 'success');
  } else {
    toast(res.error || 'Erreur paiement', 'error');
  }
}

document.getElementById('btn-pay-mtn').addEventListener('click', () => initiatePayment('mtn'));
document.getElementById('btn-pay-orange').addEventListener('click', () => initiatePayment('orange'));

// ══ Init ═══════════════════════════════════════════════════════════
updateAuthUI();
loadAds();
