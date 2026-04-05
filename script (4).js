// ============================================================
//  DEVSHOP_SERVICES — script.js
//  يعتمد على supabase-config.js للربط بقاعدة البيانات
// ============================================================

// ---------- PARTICLES ----------
function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDuration = (8 + Math.random() * 12) + 's';
    p.style.animationDelay = (Math.random() * 10) + 's';
    const size = (1 + Math.random() * 2) + 'px';
    p.style.width = p.style.height = size;
    container.appendChild(p);
  }
}

// ---------- SCROLL REVEAL ----------
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), 80);
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach((el, i) => {
    el.style.transitionDelay = (i % 4) * 80 + 'ms';
    observer.observe(el);
  });
}

// ---------- CARD GLOW ----------
function cardGlow(card, e) {
  const rect = card.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top) / rect.height) * 100;
  card.style.setProperty('--mx', x + '%');
  card.style.setProperty('--my', y + '%');
}

// ---------- TOAST ----------
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.innerHTML = (type === 'success' ? '✓ ' : '⚠ ') + msg;
  t.className = 'toast ' + type + ' show';
  setTimeout(() => t.classList.remove('show'), 3500);
}

// ---------- ORDER ----------
function orderService(name) {
  showToast('تم استلام طلبك لـ ' + name + ' · سيتواصل معك الفريق قريباً');

  // اختياري: حفظ الطلب في Supabase
  if (window.supabaseClient) {
    window.supabaseClient
      .from('orders')
      .insert([{ service: name, created_at: new Date().toISOString() }])
      .then(({ error }) => {
        if (error) console.warn('Supabase insert error:', error.message);
      });
  }

  setTimeout(() => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  }, 1200);
}

// ---------- STARS RATING ----------
let selectedStars = 0;

function setStars(n) {
  selectedStars = n;
  document.querySelectorAll('.star-pick').forEach((s, i) => {
    s.classList.toggle('active', i < n);
  });
}

// ---------- SUBMIT REVIEW ----------
function submitReview() {
  const name    = document.getElementById('reviewName')?.value.trim();
  const service = document.getElementById('reviewService')?.value.trim();
  const text    = document.getElementById('reviewText')?.value.trim();

  if (!name || !text || selectedStars === 0) {
    showToast('يرجى ملء جميع الحقول وتحديد التقييم', 'error');
    return;
  }

  // أضف البطاقة للصفحة مباشرة
  const grid = document.querySelector('.review-grid');
  if (grid) {
    const card = document.createElement('div');
    card.className = 'review-card';
    card.innerHTML = `
      <div class="review-stars">${'★'.repeat(selectedStars)}${'☆'.repeat(5 - selectedStars)}</div>
      <p class="review-text">"${text}"</p>
      <div class="review-author">
        <div class="review-avatar">${name[0].toUpperCase()}</div>
        <div>
          <div class="review-name">${name}</div>
          <div class="review-date">${new Date().toISOString().slice(0, 7)} · ${service || '—'}</div>
        </div>
      </div>
    `;
    grid.appendChild(card);
  }

  // اختياري: حفظ التقييم في Supabase
  if (window.supabaseClient) {
    window.supabaseClient
      .from('reviews')
      .insert([{ name, service, text, stars: selectedStars, created_at: new Date().toISOString() }])
      .then(({ error }) => {
        if (error) console.warn('Supabase review error:', error.message);
      });
  }

  // إعادة تعيين الفورم
  document.getElementById('reviewName').value    = '';
  document.getElementById('reviewService').value = '';
  document.getElementById('reviewText').value    = '';
  setStars(0);

  showToast('شكراً لتقييمك! 🎉');
}

// ---------- NAV ACTIVE STATE ----------
function initNavHighlight() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', () => {
    let cur = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 80) cur = s.id;
    });
    navLinks.forEach(a => {
      const active = a.getAttribute('href') === '#' + cur;
      a.style.color      = active ? 'var(--text)' : '';
      a.style.background = active ? 'rgba(88,101,242,0.1)' : '';
    });
  }, { passive: true });
}

// ---------- SUPABASE AUTH (Discord OAuth) ----------
async function loginWithDiscord() {
  if (!window.supabaseClient) {
    showToast('Supabase غير مفعّل — راجع supabase-config.js', 'error');
    return;
  }
  const { error } = await window.supabaseClient.auth.signInWithOAuth({
    provider: 'discord',
    options: { redirectTo: window.location.origin }
  });
  if (error) showToast('خطأ في تسجيل الدخول: ' + error.message, 'error');
}

async function checkSession() {
  if (!window.supabaseClient) return;

  const { data: { session } } = await window.supabaseClient.auth.getSession();
  if (!session) return;

  const user = session.user;
  const adminIds = window.ADMIN_IDS || [];
  const discordId = user.user_metadata?.provider_id || '';

  // أظهر لوحة الأدمن إذا كان المستخدم في قائمة الأدمن
  if (adminIds.includes(discordId)) {
    const panel = document.getElementById('adminPanel');
    if (panel) panel.style.display = 'block';
  }

  // غيّر زر الدخول
  const btn = document.querySelector('.nav-btn');
  if (btn) {
    btn.textContent = user.user_metadata?.full_name || 'مرحباً';
    btn.onclick = async () => {
      await window.supabaseClient.auth.signOut();
      location.reload();
    };
  }
}

// ---------- BOOT ----------
document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initScrollReveal();
  initNavHighlight();
  checkSession();
});
