// ============================================
// SHOPFYR — DASHBOARD JS
// ============================================

// ---- Section navigation ----
function showSection(name, linkEl) {
  // Hide all sections
  document.querySelectorAll('[id^="section-"]').forEach(el => el.style.display = 'none');
  // Show target
  const target = document.getElementById('section-' + name);
  if (target) target.style.display = 'block';

  // Update sidebar active state
  document.querySelectorAll('.sidebar-link').forEach(el => el.classList.remove('active'));
  if (linkEl) linkEl.classList.add('active');

  // Update page title
  const titles = {
    overview: 'Visão Geral',
    products: 'Importar Produtos',
    reviews: 'Importar Reviews',
    themes: 'Biblioteca de Temas',
    analytics: '💰 Analytics de Lucro',
    stores: 'Minhas Lojas',
    billing: 'Plano & Cobrança'
  };
  const titleEl = document.getElementById('pageTitle');
  if (titleEl && titles[name]) titleEl.textContent = titles[name];

  return false;
}

// ---- Analytics period switcher ----
function setPeriod(btn, period) {
  // Update active tab in the analytics section
  btn.closest('.import-tabs').querySelectorAll('.import-tab').forEach(el => el.classList.remove('active'));
  btn.classList.add('active');

  // Simulate different data per period (raw numbers now)
  const data = {
    '7d':     { revenue: 3280, cogs: 1210, adspend: 580, other: 200, profit: 1290 },
    '30d':    { revenue: 14820, cogs: 5480, adspend: 2640, other: 890, profit: 5810 },
    'mtd':    { revenue: 11400, cogs: 4220, adspend: 2100, other: 680, profit: 4400 },
    'custom': { revenue: 0, cogs: 0, adspend: 0, other: 0, profit: 0 },
  };
  
  const d = data[period] || data['30d'];
  
  const setMoney = (id, val) => { 
    const el = document.getElementById(id); 
    if (el) el.textContent = i18n.formatMoney(val); 
  };

  setMoney('kpi-revenue', d.revenue);
  setMoney('kpi-cogs', d.cogs);
  setMoney('kpi-adspend', d.adspend);
  setMoney('kpi-other', d.other);
  setMoney('kpi-profit', d.profit);

  // Update all elements with class 'money-val'
  document.querySelectorAll('.money-val').forEach(el => {
    const rawVal = parseFloat(el.getAttribute('data-val'));
    if (!isNaN(rawVal)) {
      const prefix = el.textContent.startsWith('+') ? '+ ' : (el.textContent.startsWith('-') ? '- ' : '');
      el.textContent = prefix + i18n.formatMoney(rawVal);
    }
  });

  if (period === 'custom') {
    showToast('📅', i18n.t('toast_custom_period'), i18n.t('toast_select_dates'));
  }
}

// Listen for locale changes to refresh the UI
document.addEventListener('shopfyr_locale_changed', () => {
    // Refresh the currently active period to update currencies
    const activeTab = document.querySelector('#section-analytics .import-tab.active');
    if (activeTab) {
        // Find which period it is
        const onclickAttr = activeTab.getAttribute('onclick');
        if (onclickAttr) {
            const match = onclickAttr.match(/'([^']+)'/);
            if (match) setPeriod(activeTab, match[1]);
        }
    }
});

// ---- Tab switching ----
function switchTab(btn, tabId) {
  // Hide all tabs
  document.querySelectorAll('[id^="tab-"]').forEach(el => el.style.display = 'none');
  // Show target tab
  const tab = document.getElementById(tabId);
  if (tab) tab.style.display = 'block';

  // Update active tab button
  document.querySelectorAll('.import-tab').forEach(el => el.classList.remove('active'));
  btn.classList.add('active');
}

// ---- Modal control ----
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('open');
}

function closeModal(id, event) {
  if (event && event.target !== document.getElementById(id)) return;
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('open');
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(el => el.classList.remove('open'));
  }
});

// ---- Toast notification ----
function showToast(icon, title, message, duration = 4000) {
  const toast = document.getElementById('toast');
  const toastIcon = document.getElementById('toastIcon');
  const toastTitle = document.getElementById('toastTitle');
  const toastMsg = document.getElementById('toastMsg');

  toastIcon.textContent = icon;
  toastTitle.textContent = title;
  toastMsg.textContent = message;
  toast.style.display = 'flex';
  toast.style.animation = 'none';
  void toast.offsetWidth; // reflow
  toast.style.animation = 'notifSlide 0.4s ease';

  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => { toast.style.display = 'none'; }, duration);
}

// ---- Simulate product import ----
function simulateImport() {
  const urlInput = document.getElementById('productUrl');
  const url = urlInput ? urlInput.value.trim() : '';

  if (!url) {
    showToast('⚠️', 'URL necessária', 'Cole o link do produto antes de importar.');
    return;
  }

  const btn = event.currentTarget;
  const originalText = btn.innerHTML;
  btn.innerHTML = '⟳ Analisando...';
  btn.disabled = true;

  setTimeout(() => {
    btn.innerHTML = originalText;
    btn.disabled = false;

    // Detect platform from URL
    let platform = 'Loja';
    if (url.includes('aliexpress')) platform = 'AliExpress';
    else if (url.includes('shopee')) platform = 'Shopee';
    else if (url.includes('shein')) platform = 'Shein';
    else if (url.includes('amazon')) platform = 'Amazon';
    else if (url.includes('mercadolivre') || url.includes('mercadolibre')) platform = 'Mercado Livre';

    document.getElementById('importedTitle').textContent =
      platform === 'AliExpress' ? 'Tênis Running Pro Ultra Boost 2024' :
      platform === 'Shopee' ? 'Vestido Midi Floral Premium' :
      platform === 'Shein' ? 'Conjunto Feminino Casual Elegante' :
      'Produto Importado com Sucesso';

    document.getElementById('importResult').style.display = 'block';
    document.getElementById('importResult').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 1800);
}

function confirmImport(type = 'published') {
  document.getElementById('importResult').style.display = 'none';
  document.getElementById('productUrl').value = '';

  if (type === 'draft') {
    showToast('📦', 'Salvo como rascunho!', 'O produto foi salvo. Publique quando estiver pronto.');
  } else {
    showToast('✅', 'Produto publicado!', 'O produto foi importado e publicado na sua loja Shopify.');
  }
}

// ---- Simulate review import ----
function simulateReviewImport() {
  const urlInput = document.getElementById('reviewUrl');
  const url = urlInput ? urlInput.value.trim() : '';
  const rangeVal = document.getElementById('rangeVal');
  const qty = rangeVal ? rangeVal.textContent : '200';

  if (!url) {
    showToast('⚠️', 'URL necessária', 'Cole o link do produto de onde importar reviews.');
    return;
  }

  const btn = event.currentTarget;
  btn.innerHTML = '⟳ Importando...';
  btn.disabled = true;

  let progress = 0;
  const bar = document.querySelector('.progress-bar');
  if (bar) bar.style.width = '0%';

  const interval = setInterval(() => {
    progress += Math.random() * 18;
    if (progress > 100) progress = 100;
    if (bar) bar.style.width = progress + '%';
    if (progress === 100) {
      clearInterval(interval);
      btn.innerHTML = '⭐ Importar Reviews';
      btn.disabled = false;
      showToast('⭐', `${qty} reviews importados!`, `Publicados com sucesso via Judge.me em 23 segundos.`);
    }
  }, 200);
}

// ---- Install theme ----
function installTheme(name) {
  showToast('🎨', `Instalando ${name}...`, 'O tema está sendo instalado na sua loja Shopify.');

  setTimeout(() => {
    showToast('✅', `${name} instalado!`, 'O tema foi publicado com sucesso na sua loja.');
  }, 3000);
}

// ---- Connect store ----
function connectStore() {
  const storeInput = document.getElementById('storeUrl');
  const store = storeInput ? storeInput.value.trim() : '';

  if (!store) {
    showToast('⚠️', 'URL necessária', 'Digite a URL da sua loja Shopify.');
    return;
  }

  closeModal('storeModal');
  showToast('🔗', 'Direcionando para Shopify OAuth...', `Conectando ${store}.myshopify.com`);

  setTimeout(() => {
    showToast('✅', 'Loja conectada!', `${store}.myshopify.com foi conectada com sucesso.`);
  }, 3000);
}

// ---- Mobile sidebar toggle ----
document.addEventListener('DOMContentLoaded', () => {
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');

  if (sidebarToggle) {
    sidebarToggle.style.display = 'flex';
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
    });
  }

  // Close sidebar when clicking outside on mobile
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 900 &&
        sidebar &&
        !sidebar.contains(e.target) &&
        sidebarToggle &&
        !sidebarToggle.contains(e.target)) {
      sidebar.classList.remove('mobile-open');
    }
  });

  // Handle tab visibility on init
  document.querySelectorAll('[id^="tab-"]').forEach((el, i) => {
    el.style.display = i === 0 ? 'block' : 'none';
  });

  // Stat counter animation
  const statValues = document.querySelectorAll('.stat-value');
  const counters = {};

  const countUp = (el, target, suffix = '') => {
    let current = 0;
    const increment = target / 40;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        el.textContent = target.toLocaleString('pt-BR') + suffix;
        clearInterval(timer);
      } else {
        el.textContent = Math.floor(current).toLocaleString('pt-BR') + suffix;
      }
    }, 30);
  };

  const countObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !counters[entry.target]) {
        counters[entry.target] = true;
        const val = entry.target.textContent.replace(/[^\d]/g, '');
        if (val && parseInt(val) > 0) {
          countUp(entry.target, parseInt(val));
        }
        countObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  statValues.forEach(el => countObs.observe(el));

  // Range input label update
  const rangeInput = document.querySelector('.config-range');
  if (rangeInput) {
    rangeInput.addEventListener('input', function() {
      const lbl = document.getElementById('rangeVal');
      if (lbl) lbl.textContent = this.value;
    });
  }

  // Platform chip toggle
  document.querySelectorAll('.platform-chip').forEach(chip => {
    chip.addEventListener('click', function() {
      this.classList.toggle('active');
    });
  });
});
