// === PROTEÇÃO CONTRA CÓPIA - Woovi Instituto ===
(function() {
    'use strict';

    // 1. Desativar clique direito
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    });

    // 2. Desativar atalhos de teclado perigosos
    document.addEventListener('keydown', function(e) {
        const key = e.key || e.keyCode;
        const ctrl = e.ctrlKey || e.metaKey;
        const shift = e.shiftKey;

        // Ctrl+U (ver fonte), Ctrl+S (salvar), Ctrl+A (selecionar tudo)
        // Ctrl+C (copiar conteúdo de página), Ctrl+P (imprimir)
        // F12, Ctrl+Shift+I (DevTools), Ctrl+Shift+J, Ctrl+Shift+C
        if (
            (ctrl && (e.code === 'KeyU' || e.code === 'KeyS' || e.code === 'KeyP')) ||
            (ctrl && shift && (e.code === 'KeyI' || e.code === 'KeyJ' || e.code === 'KeyC')) ||
            e.key === 'F12'
        ) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    });

    // 3. Bloquear arrastar imagens e elementos
    document.addEventListener('dragstart', function(e) {
        e.preventDefault();
        return false;
    });

    // 4. Bloquear seleção de texto nos elementos principais via CSS dinâmico
    const style = document.createElement('style');
    style.innerHTML = `
        body, p, h1, h2, h3, h4, h5, h6, div, span, section, article, header, footer, main {
            -webkit-user-select: none !important;
            -moz-user-select: none !important;
            -ms-user-select: none !important;
            user-select: none !important;
        }
        img {
            pointer-events: none !important;
            -webkit-user-drag: none !important;
            user-drag: none !important;
        }
    `;
    document.head.appendChild(style);



    // 6. Bloquear Ctrl+A + Enter para salvar página no iOS/mobile
    document.addEventListener('copy', function(e) {
        const selection = window.getSelection();
        if (selection && selection.toString().length > 100) {
            e.clipboardData.setData('text/plain', '');
            e.preventDefault();
        }
    });

})();
