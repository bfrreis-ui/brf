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

/* PORTFOLIO — filtro por categoria */
const filterBtns     = document.querySelectorAll('.filter-btn');
const portfolioItems = document.querySelectorAll('.portfolio-grid-item');

if (filterBtns.length && portfolioItems.length) {
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.filter;
      portfolioItems.forEach(item => {
        const match = cat === 'all' || item.dataset.cat === cat;
        item.style.display = match ? '' : 'none';
        if (match && !item.classList.contains('visible')) item.classList.add('visible');
      });
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
  copyrightToast.style.left = `${e.clientX + 14}px`;
  copyrightToast.style.top  = `${e.clientY + 14}px`;
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
const galleryImgs     = Array.from(document.querySelectorAll('.portfolio-grid-item img'));

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

/* CONTACTO — validação do campo e-mail */
const emailInput = document.getElementById('email');
if (emailInput) {
  const emailError = document.createElement('span');
  emailError.className = 'form-error';
  emailError.textContent = 'Por favor, insira um e-mail válido.';
  emailInput.parentNode.appendChild(emailError);

  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

  emailInput.addEventListener('blur', () => {
    if (emailInput.value && !isValidEmail(emailInput.value)) {
      emailInput.classList.add('error');
      emailError.classList.add('show');
    } else {
      emailInput.classList.remove('error');
      emailError.classList.remove('show');
    }
  });

  emailInput.addEventListener('input', () => {
    if (emailInput.classList.contains('error') && isValidEmail(emailInput.value)) {
      emailInput.classList.remove('error');
      emailError.classList.remove('show');
    }
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
