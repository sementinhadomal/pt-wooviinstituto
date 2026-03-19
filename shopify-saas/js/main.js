// ============================================
// SHOPFYR — MAIN JS
// ============================================

document.addEventListener('DOMContentLoaded', () => {

  // ---- Navbar scroll effect ----
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  });

  // ---- FAQ accordion ----
  window.toggleFaq = (btn) => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(el => el.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  };

  // ---- Notification pop rotation ----
  const notifications = [{ name: 'Ricardo K.', action: 'acabou de assinar o Pro', location: 'São Paulo, SP', time: 'agora' },
    { name: 'Fernanda L.', action: 'importou 200 reviews', location: 'Rio de Janeiro, RJ', time: '1 min' },
    { name: 'Carlos M.', action: 'instalou o tema Luxe Pro', location: 'Belo Horizonte, MG', time: '2 min' },
    { name: 'Ana P.', action: 'importou 45 produtos', location: 'Curitiba, PR', time: '3 min' },
    { name: 'Diego S.', action: 'acabou de assinar o Agency', location: 'Fortaleza, CE', time: '5 min' },
  ];

  let notifIndex = 0;
  const notifPop = document.getElementById('notifPop');

  const showNotif = () => {
    const n = notifications[notifIndex % notifications.length];
    notifIndex++;
    if (!notifPop) return;
    notifPop.style.animation = 'none';
    notifPop.querySelector('strong').textContent = `${n.name} ${n.action}`;
    notifPop.querySelector('.notif-time').textContent = `há ${n.time} · ${n.location}`;
    notifPop.style.animation = 'notifSlide 0.5s ease both';
  };

  setTimeout(() => {
    showNotif();
    setInterval(showNotif, 5000);
  }, 3000);

  // ---- Close notification on click ----
  if (notifPop) {
    notifPop.addEventListener('click', () => {
      notifPop.style.display = 'none';
    });
  }

  // ---- Smooth scroll for nav links ----
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ---- Scroll reveal animation ----
  const revealElements = document.querySelectorAll(
    '.feature-card, .step-item, .pricing-card, .testimonial-card, .theme-card, .faq-item, .platform-card'
  );

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  revealElements.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = `opacity 0.6s ease ${i * 0.05}s, transform 0.6s ease ${i * 0.05}s`;
    observer.observe(el);
  });

  // ---- Animated counter for hero stats ----
  const counters = document.querySelectorAll('.hero-stat-value');
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('counted');
        countObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => countObserver.observe(c));

  // ---- Mobile nav toggle ----
  const mobileToggle = document.getElementById('mobileToggle');
  const navLinks = document.querySelector('.nav-links');
  const navCta = document.querySelector('.nav-cta');

  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = navbar.classList.toggle('mobile-open');
      mobileToggle.textContent = isOpen ? '✕' : '☰';
    });
  }

  // ---- Typing animation for import URL field ----
  const typingTexts = ['https://aliexpress.com/item/tênis-running-pro...',
    'https://shopee.com.br/produto/vestido-floral...',
    'https://shein.com/br/product/bolsa-premium...',
    'https://amazon.com.br/smartwatch-ultra-49mm...',
  ];

  let typingIdx = 0;
  let charIdx = 0;
  let isDeleting = false;

  const typingEl = document.querySelector('.hero-card-main [style*="Cole"]');
  if (typingEl) {
    const originalText = typingEl.textContent;
    typingEl.textContent = '';

    const type = () => {
      const current = typingTexts[typingIdx % typingTexts.length];
      if (!isDeleting) {
        typingEl.textContent = '🔗 ' + current.slice(0, charIdx++);
        if (charIdx > current.length) { isDeleting = true; setTimeout(type, 1800); return; }
      } else {
        typingEl.textContent = '🔗 ' + current.slice(0, charIdx--);
        if (charIdx < 0) { isDeleting = false; typingIdx++; charIdx = 0; }
      }
      setTimeout(type, isDeleting ? 25 : 55);
    };
    setTimeout(type, 1000);
  }

  // ---- Product item staggered animation ----
  document.querySelectorAll('.product-item').forEach((item, i) => {
    item.style.animationDelay = `${i * 0.15 + 0.2}s`;
  });

  // ---- Add pulse border style dynamically ----
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pulse-border {
      0%, 100% { border-color: rgba(124,58,237,0.4); }
      50% { border-color: rgba(124,58,237,0.9); box-shadow: 0 0 15px rgba(124,58,237,0.3); }
    }
    .navbar.mobile-open .nav-links {
      display: flex;
      flex-direction: column;
      position: fixed;
      top: 70px; left: 0; right: 0;
      background: rgba(8,9,13,0.95);
      backdrop-filter: blur(20px);
      padding: 20px 24px;
      border-bottom: 1px solid var(--border);
      z-index: 999;
    }
    .navbar.mobile-open .nav-cta {
      display: flex;
      flex-direction: column;
      position: fixed;
      top: 210px; left: 0; right: 0;
      background: rgba(8,9,13,0.95);
      padding: 16px 24px 24px;
      border-bottom: 1px solid var(--border);
      z-index: 999;
    }
  `;
  document.head.appendChild(style);

});
