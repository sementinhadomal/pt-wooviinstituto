const i18n = {
  currentLang: localStorage.getItem('shopfyr_lang') || 'pt',
  currentCurrency: localStorage.getItem('shopfyr_currency') || 'BRL',
  
  translations: {
    pt: {
      // Landing Page Sections
      sec_features: "Recursos",
      sec_how: "Como Funciona",
      sec_faq: "FAQ",
      sec_marquee: "Importa de e publica nos maiores players do mercado",
      
      // Feature Titles
      feat_prod_title: "Importador de Produtos",
      feat_rev_title: "Importador de Reviews",
      feat_theme_title: "Biblioteca de Temas",
      
      // Pricing
      plan_starter: "Starter",
      plan_pro: "Pro",
      plan_agency: "Agency",
      plan_trial: "7 dias grátis em todos os planos",
      
      // Dashboard Extras
      dash_quick_start: "Início Rápido",
      dash_recent_activity: "Atividade Reciente",
      dash_connect_store: "Conectar Loja",
      dash_new_import: "Nova Importação",
      
      // Toasts
      toast_custom_period: "Período personalizado",
      toast_select_dates: "Selecione o intervalo de datas desejado.",
      
      currency_symbol: "€"
    },
    en: {
      // Landing Page Areas
      hero_title: "Scaling your Shopify sales has never been easier",
      hero_subtitle: "Import products, reviews, and install premium themes in seconds. The complete ecosystem for your global dropshipping.",
      cta_start: "Get Started For Free",
      nav_features: "Features",
      nav_themes: "Themes",
      nav_pricing: "Pricing",
      nav_login: "Login",
      
      // Landing Page Sections
      sec_features: "Features",
      sec_how: "How it Works",
      sec_faq: "FAQ",
      sec_marquee: "Import from and publish to the market's biggest players",

      // Feature Titles
      feat_prod_title: "Product Importer",
      feat_rev_title: "Reviews Importer",
      feat_theme_title: "Theme Library",

      // Pricing
      plan_starter: "Starter",
      plan_pro: "Pro",
      plan_agency: "Agency",
      plan_trial: "7-day free trial on all plans",

      // Dashboard General
      dash_overview: "Visão Geral",
      dash_import_products: "Importar Produtos",
      dash_import_reviews: "Importar Reviews",
      dash_themes: "Biblioteca de Temas",
      dash_analytics: "Analytics de Lucro",
      dash_stores: "Minhas Lojas",
      dash_billing: "Plano & Cobrança",
      
      // Analytics
      ana_title: "Analytics de Lucro",
      ana_revenue: "Receita Bruta",
      ana_cogs: "Custo Produtos (COGS)",
      ana_adspend: "Ad Spend",
      ana_other: "Outros Custos",
      ana_profit: "Lucro Líquido",
      ana_margin: "Margem",
      ana_euro_time: "Tempo Euro",
      ana_desc: "Receita, custos e lucro líquido calculados automaticamente",
      ana_pl_breakdown: "Demonstrativo P&L",
      ana_traffic_channels: "Canais de Tráfego",
      ana_top_products: "Produtos por Lucro",
      ana_invoice_gen: "Gerador de Notas / Invoices",
      
      // Buttons & Tabs
      btn_import: "Importar",
      btn_connect: "Conectar",
      btn_generate: "Gerar",
      tab_7d: "7 dias",
      tab_30d: "30 dias",
      tab_mtd: "Mês atual",
      
      currency_symbol: "€"
    },
    en: {
      // Landing Page
      hero_title: "Scaling your Shopify sales has never been easier",
      hero_subtitle: "Import products, reviews, and install premium themes in seconds. The complete ecosystem for your global dropshipping.",
      cta_start: "Get Started For Free",
      nav_features: "Features",
      nav_themes: "Themes",
      nav_pricing: "Pricing",
      nav_login: "Login",
      
      // Dashboard General
      dash_main: "Main",
      dash_management: "Management",
      dash_account: "Account",
      dash_overview: "Overview",
      dash_import_products: "Import Products",
      dash_import_reviews: "Import Reviews",
      dash_themes: "Theme Library",
      dash_analytics: "Profit Analytics",
      dash_stores: "My Stores",
      dash_billing: "Billing & Plans",
      dash_settings: "Settings",
      dash_support: "Support",
      dash_plan_pro: "⚡ Pro Plan",
      dash_plan_renewal: "Renews on 21/04/2025",
      dash_imports_used: "340 / 1000 imports",
      dash_user_name: "Julia Santos",
      dash_user_plan: "Pro Plan ⚡",
      
      // Analytics
      ana_title: "Profit Analytics",
      ana_revenue: "Gross Revenue",
      ana_cogs: "COGS (Product Cost)",
      ana_adspend: "Ad Spend",
      ana_other: "Other Costs",
      ana_profit: "Net Profit",
      ana_margin: "Margin",
      ana_euro_time: "Euro Time",
      ana_desc: "Revenue, costs, and net profit calculated automatically",
      ana_pl_breakdown: "P&L Breakdown",
      ana_traffic_channels: "Traffic Channels",
      ana_top_products: "Top Products by Profit",
      ana_invoice_gen: "Invoice Generator",

      // Buttons & Tabs
      btn_import: "Import",
      btn_connect: "Connect",
      btn_generate: "Generate",
      tab_7d: "7 days",
      tab_30d: "30 days",
      tab_mtd: "Current month",
      
      currency_symbol: "$"
    },
    es: {
      // Landing Page
      hero_title: "Escalar tus ventas en Shopify nunca fue tan fácil",
      hero_subtitle: "Importa productos, reseñas e instala temas premium en segundos. El ecosistema completo para tu dropshipping global.",
      cta_start: "Empezar Gratis Ahora",
      nav_features: "Funcionalidades",
      nav_themes: "Temas",
      nav_pricing: "Precios",
      nav_login: "Entrar",
      
      // Dashboard General
      dash_main: "Principal",
      dash_management: "Gestión",
      dash_account: "Cuenta",
      dash_overview: "Visión General",
      dash_import_products: "Importar Productos",
      dash_import_reviews: "Importar Reseñas",
      dash_themes: "Biblioteca de Temas",
      dash_analytics: "Análisis de Lucro",
      dash_stores: "Mis Tiendas",
      dash_billing: "Plan y Facturación",
      dash_settings: "Ajustes",
      dash_support: "Soporte",
      dash_plan_pro: "⚡ Plan Pro",
      dash_plan_renewal: "Renueva el 21/04/2025",
      dash_imports_used: "340 / 1000 importaciones",
      dash_user_name: "Julia Santos",
      dash_user_plan: "Plan Pro ⚡",
      
      // Analytics
      ana_title: "Análisis de Lucro",
      ana_revenue: "Ingresos Brutos",
      ana_cogs: "Costo de Productos (COGS)",
      ana_adspend: "Gasto en Pub.",
      ana_other: "Otros Costos",
      ana_profit: "Utilidad Neta",
      ana_margin: "Margen",
      ana_euro_time: "Tiempo Euro",
      ana_desc: "Ingresos, costos y utilidad neta calculados automáticamente",
      ana_pl_breakdown: "Desglose P&L",
      ana_traffic_channels: "Canales de Tráfico",
      ana_top_products: "Productos por Lucro",
      ana_invoice_gen: "Generador de Facturas",

      // Buttons & Tabs
      btn_import: "Importar",
      btn_connect: "Conectar",
      btn_generate: "Generar",
      tab_7d: "7 días",
      tab_30d: "30 días",
      tab_mtd: "Mes actual",
      
      currency_symbol: "$",
      
      // Dashboard Specific
      dash_quick_start: "Inicio Rápido",
      dash_recent_activity: "Actividad Reciente",
      dash_connect_store: "Conectar Tienda",
      dash_new_import: "Nueva Importación"
    }
  },

  currencies: {
    BRL: { symbol: '€', rate: 1 },
    USD: { symbol: '$', rate: 0.18 },
    EUR: { symbol: '€', rate: 0.16 },
    MXN: { symbol: '$', rate: 3.25 }
  },

  t(key) {
    const lang = this.translations[this.currentLang] || this.translations['pt'];
    return lang[key] || key;
  },

  setLang(lang) {
    this.currentLang = lang;
    localStorage.setItem('shopfyr_lang', lang);
    this.updateUI();
    location.reload(); // Reload to ensure all scripts pick up the change
  },

  setCurrency(curr) {
    this.currentCurrency = curr;
    localStorage.setItem('shopfyr_currency', curr);
    this.updateUI();
  },

  formatMoney(amount) {
    const curr = this.currencies[this.currentCurrency];
    const converted = amount * curr.rate;
    return `${curr.symbol} ${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  },

  updateUI() {
    // Basic translation logic
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.textContent = this.t(key);
    });

    // Update selectors to match state
    document.querySelectorAll('.lang-select').forEach(sel => {
      sel.value = this.currentLang;
    });
    document.querySelectorAll('.currency-select').forEach(sel => {
      sel.value = this.currentCurrency;
    });
    
    // Dispatch custom event
    const event = new CustomEvent('shopfyr_locale_changed', { 
      detail: { lang: this.currentLang, currency: this.currentCurrency } 
    });
    document.dispatchEvent(event);
  }
};

document.addEventListener('DOMContentLoaded', () => i18n.updateUI());
