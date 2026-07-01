/* ============================================================
   BRENO REIS FOTOGRAFIA — main.js
   ============================================================ */

/* NAV — escurece ao rolar e oculta ao descer */
const nav = document.getElementById('nav');
if (nav) {
  const navIsSolid = nav.dataset.solid === 'true';
  if (!navIsSolid) {
    let lastScrollY = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;
      nav.classList.toggle('scrolled', y > 40);

      if (y > 100) {
        const diff = y - lastScrollY;
        if (diff > 5)       nav.classList.add('hidden');
        else if (diff < -5) nav.classList.remove('hidden');
        if (Math.abs(diff) > 5) lastScrollY = y;
      } else {
        nav.classList.remove('hidden');
        lastScrollY = y;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
}

/* NAV — menu mobile */
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('open');
    navLinks.classList.toggle('open');
    if (nav) nav.classList.remove('hidden');
  });
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navToggle.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });
}

/* NAV — marca link ativo pela página atual */
const currentFile = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a').forEach(a => {
  if (a.getAttribute('href') === currentFile) a.classList.add('active');
});

/* REVEAL — Intersection Observer para animações de scroll */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.especialidades, .passos, .pq-grid, .diferenciais, .portfolio-grid-preview').forEach(group => {
  group.querySelectorAll('.reveal, .reveal-img').forEach((el, i) => {
    el.style.transitionDelay = `${i * 0.12}s`;
  });
});

document.querySelectorAll('.reveal, .reveal-img').forEach(el => revealObserver.observe(el));

/* PORTFOLIO — masonry por distribuição de colunas */
const portfolioGrid = document.querySelector('.portfolio-grid');
const allItems = Array.from(document.querySelectorAll('.portfolio-grid-item'));

function buildColumns() {
  if (!portfolioGrid || !allItems.length) return;

  const vw = window.innerWidth;
  const colCount = vw <= 768 ? 2 : vw <= 1024 ? 3 : 5;
  const visible = allItems.filter(el => el.style.display !== 'none');

  allItems.forEach(item => {
    item.style.flex = '';
    const img = item.querySelector('img');
    if (img) { img.style.height = ''; img.style.objectFit = ''; }
  });

  portfolioGrid.innerHTML = '';
  const cols = [];
  const heights = new Array(colCount).fill(0);

  for (let i = 0; i < colCount; i++) {
    const col = document.createElement('div');
    col.className = 'portfolio-col';
    portfolioGrid.appendChild(col);
    cols.push(col);
  }

  visible.forEach(item => {
    const img = item.querySelector('img');
    const w = parseInt(img?.getAttribute('width'), 10) || 1;
    const h = parseInt(img?.getAttribute('height'), 10) || 1;
    const shortest = heights.indexOf(Math.min(...heights));
    cols[shortest].appendChild(item);
    heights[shortest] += h / w;
  });

  cols.forEach(col => {
    const lastItem = col.lastElementChild;
    if (!lastItem) return;
    lastItem.style.flex = '1';
    const img = lastItem.querySelector('img');
    if (img) { img.style.height = '100%'; img.style.objectFit = 'cover'; }
  });
}

if (portfolioGrid) {
  buildColumns();
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(buildColumns, 150);
  }, { passive: true });
}

/* PORTFOLIO — filtro por categoria */
const filterBtns = document.querySelectorAll('.filter-btn');

if (filterBtns.length && allItems.length) {
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.filter;
      allItems.forEach(item => {
        const match = cat === 'all' || item.dataset.cat === cat;
        item.style.display = match ? '' : 'none';
        if (match && !item.classList.contains('visible')) item.classList.add('visible');
      });
      buildColumns();
    });
  });
}

/* PROTEÇÃO DE IMAGENS — bloqueia clique direito (com aviso) e arrastar */
const copyrightToast = document.createElement('div');
copyrightToast.className = 'copyright-toast';
copyrightToast.textContent = '© Todos os direitos reservados';
document.body.appendChild(copyrightToast);

let copyrightToastTimeout;
document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  const px = e.clientX > 0 ? e.clientX + 14 : window.innerWidth / 2 - 90;
  const py = e.clientY > 0 ? e.clientY + 14 : window.innerHeight / 2;
  copyrightToast.style.left = `${Math.min(px, window.innerWidth - 220)}px`;
  copyrightToast.style.top  = `${Math.max(py, 90)}px`;
  copyrightToast.classList.add('show');
  clearTimeout(copyrightToastTimeout);
  copyrightToastTimeout = setTimeout(() => copyrightToast.classList.remove('show'), 1800);
});
document.addEventListener('dragstart', (e) => {
  if (e.target.tagName === 'IMG') e.preventDefault();
});

/* PORTFOLIO — lightbox */
const lightbox        = document.getElementById('lightbox');
const lightboxImg     = document.getElementById('lightboxImg');
const lightboxCounter = document.getElementById('lightboxCounter');
const galleryImgs     = allItems.map(item => item.querySelector('img'));

if (lightbox && galleryImgs.length) {
  let currentIndex = 0;

  const showImage = (i) => {
    currentIndex = (i + galleryImgs.length) % galleryImgs.length;
    lightboxImg.src = galleryImgs[currentIndex].dataset.full || galleryImgs[currentIndex].src;
    lightboxImg.alt = galleryImgs[currentIndex].alt;
    if (lightboxCounter) lightboxCounter.textContent = `${currentIndex + 1} / ${galleryImgs.length}`;
  };

  const openLightbox = (i) => {
    showImage(i);
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  };

  galleryImgs.forEach((img, i) => {
    img.closest('.portfolio-grid-item').addEventListener('click', () => openLightbox(i));
  });

  document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
  document.getElementById('lightboxPrev').addEventListener('click', () => showImage(currentIndex - 1));
  document.getElementById('lightboxNext').addEventListener('click', () => showImage(currentIndex + 1));

  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  showImage(currentIndex - 1);
    if (e.key === 'ArrowRight') showImage(currentIndex + 1);
  });
}

/* CONTACTO — validação do campo telefone (apenas números e +) */
const telInput = document.getElementById('telefone');
if (telInput) {
  telInput.addEventListener('input', () => {
    telInput.value = telInput.value.replace(/[^0-9+]/g, '');
  });
  telInput.addEventListener('keydown', (e) => {
    const allowed = ['Backspace','Delete','Tab','Escape','Enter','ArrowLeft','ArrowRight','Home','End'];
    if (allowed.includes(e.key) || e.key === '+' || /^\d$/.test(e.key)) return;
    e.preventDefault();
  });
}

/* CONTACTO — validação do campo nome (apenas letras) */
const nomeInput = document.getElementById('nome');
if (nomeInput) {
  nomeInput.addEventListener('input', () => {
    nomeInput.value = nomeInput.value.replace(/[^\p{L}\s'-]/gu, '');
  });
  nomeInput.addEventListener('keydown', (e) => {
    const allowed = ['Backspace','Delete','Tab','Escape','Enter','ArrowLeft','ArrowRight','Home','End',' '];
    if (allowed.includes(e.key) || /^[\p{L}'-]$/u.test(e.key)) return;
    e.preventDefault();
  });
}

/* CONTACTO — validação do campo e-mail */
const emailInput = document.getElementById('email');
if (emailInput) {
  const emailError = document.createElement('span');
  emailError.className = 'form-error';
  emailError.textContent = 'Por favor, insira um e-mail válido.';
  emailInput.parentNode.appendChild(emailError);

  const emailSuggestion = document.createElement('span');
  emailSuggestion.className = 'form-suggestion';
  emailInput.parentNode.appendChild(emailSuggestion);

  emailInput.addEventListener('keydown', (e) => {
    if (e.key.length === 1 && /[^\x00-\x7F]/.test(e.key)) e.preventDefault();
  });
  emailInput.addEventListener('input', () => {
    const cleaned = emailInput.value.replace(/[^\x00-\x7F]/g, '');
    if (cleaned !== emailInput.value) emailInput.value = cleaned;
  });

  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

  const COMMON_DOMAINS = [
    'gmail.com','yahoo.com','hotmail.com','outlook.com','icloud.com',
    'live.com','me.com','msn.com','protonmail.com','proton.me',
    'uol.com.br','terra.com.br','hotmail.com.br','yahoo.com.br','bol.com.br'
  ];

  function levenshtein(a, b) {
    const m = a.length, n = b.length;
    const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++)
      for (let j = 1; j <= n; j++)
        dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
    return dp[m][n];
  }

  function suggestEmail(email) {
    const atIdx = email.lastIndexOf('@');
    if (atIdx < 1) return null;
    const domain = email.slice(atIdx + 1).toLowerCase();
    if (COMMON_DOMAINS.includes(domain)) return null;
    let best = null, bestDist = Infinity;
    for (const d of COMMON_DOMAINS) {
      const dist = levenshtein(domain, d);
      if (dist > 0 && dist <= 2 && dist < bestDist) { best = d; bestDist = dist; }
    }
    return best ? email.slice(0, atIdx + 1) + best : null;
  }

  const hideSuggestion = () => { emailSuggestion.classList.remove('show'); emailSuggestion.innerHTML = ''; };

  emailInput.addEventListener('blur', () => {
    const val = emailInput.value;
    hideSuggestion();
    if (val && !isValidEmail(val)) {
      emailInput.classList.add('error');
      emailError.classList.add('show');
    } else {
      emailInput.classList.remove('error');
      emailError.classList.remove('show');
      if (val) {
        const suggestion = suggestEmail(val);
        if (suggestion) {
          emailSuggestion.innerHTML = `Quiseste dizer <button class="suggestion-btn">${suggestion}</button>?`;
          emailSuggestion.classList.add('show');
          emailSuggestion.querySelector('.suggestion-btn').addEventListener('click', () => {
            emailInput.value = suggestion;
            hideSuggestion();
          });
        }
      }
    }
  });

  emailInput.addEventListener('input', () => {
    hideSuggestion();
    if (emailInput.classList.contains('error') && isValidEmail(emailInput.value)) {
      emailInput.classList.remove('error');
      emailError.classList.remove('show');
    }
  });
}

/* CONTACTO — textarea mensagem auto-expand */
const textareaField = document.getElementById('mensagem');
if (textareaField) {
  textareaField.addEventListener('input', () => {
    textareaField.style.height = 'auto';
    textareaField.style.height = textareaField.scrollHeight + 'px';
  });
}

/* FORMSPREE — envio assíncrono */
const form = document.getElementById('contactForm');
if (form) {
  let formSubmitted = false;

  /* Alerta ao tentar sair com campos preenchidos */
  window.addEventListener('beforeunload', (e) => {
    if (formSubmitted) return;
    const fields = form.querySelectorAll('input, textarea, select');
    const hasContent = Array.from(fields).some(f =>
      f.tagName === 'SELECT' ? f.value !== '' : f.value.trim() !== ''
    );
    if (hasContent) {
      e.preventDefault();
      e.returnValue = '';
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = 'Enviando...';
    btn.disabled = true;

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      });
      if (res.ok) {
        formSubmitted = true;
        form.style.display = 'none';
        document.getElementById('formSuccess').classList.add('show');
      } else {
        throw new Error('Erro no envio');
      }
    } catch {
      btn.textContent = 'Erro ao enviar. Tente novamente.';
      btn.disabled = false;
      setTimeout(() => { btn.textContent = originalText; }, 3000);
    }
  });
}

/* HOME — fixed footer + scroll hint fade on scroll */
const homeFooterFixed = document.getElementById('homeFooterFixed');
const scrollHint = document.getElementById('scrollHint');
if (homeFooterFixed) {
  const THRESHOLD = 60;
  window.addEventListener('scroll', () => {
    const hide = window.scrollY > THRESHOLD;
    homeFooterFixed.classList.toggle('hidden', hide);
    if (scrollHint) scrollHint.classList.toggle('hidden', hide);
  }, { passive: true });
}
