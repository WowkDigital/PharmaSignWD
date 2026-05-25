/**
 * WowkDigitalFooter JS Library
 * Created by Antigravity for Wowk Digital
 * 
 * Usage:
 * <script src="wowk-digital-footer.js"></script>
 * <script>
 *   WowkDigitalFooter.init({
 *     siteName: 'Sivis Drive',
 *     container: 'body',
 *     brandUrl: 'https://github.com/WowkDigital'
 *   });
 * </script>
 */

const WowkDigitalFooter = (() => {
    const isDarkBackground = (element) => {
        if (!element) return false;
        
        let el = element;
        let bgColor = 'rgba(0, 0, 0, 0)';
        
        // Traverse up to find a non-transparent background color
        while (el && el !== document.documentElement) {
            const style = window.getComputedStyle(el);
            const bg = style.backgroundColor;
            if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
                bgColor = bg;
                break;
            }
            el = el.parentElement;
        }
        
        if (bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent') {
            const style = window.getComputedStyle(document.body || document.documentElement);
            bgColor = style.backgroundColor;
        }
        
        const rgb = bgColor.match(/\d+/g);
        if (rgb && rgb.length >= 3) {
            const r = parseInt(rgb[0], 10);
            const g = parseInt(rgb[1], 10);
            const b = parseInt(rgb[2], 10);
            const alpha = rgb[3] !== undefined ? parseFloat(rgb[3]) : 1;
            if (alpha > 0.1) {
                // ITU-R BT.709 relative luminance formula
                const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
                return luminance < 140;
            }
        }
        
        // Fallback to text color contrast detection if background is transparent or gradient
        const textColor = window.getComputedStyle(element).color;
        const textRgb = textColor.match(/\d+/g);
        if (textRgb && textRgb.length >= 3) {
            const r = parseInt(textRgb[0], 10);
            const g = parseInt(textRgb[1], 10);
            const b = parseInt(textRgb[2], 10);
            const textLuminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
            return textLuminance > 120; // If text is light, background is likely dark
        }
        
        return false;
    };

    const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600;800&display=swap');

    .wowk-footer {
        --wf-bg: transparent;
        --wf-text: #94a3b8;
        --wf-brand: #f8fafc;
        --wf-brand-hover: #ffffff;
        --wf-accent: #ef4444;
        --wf-border: rgba(255, 255, 255, 0.06);
        
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60px 20px;
        text-align: center;
        font-family: 'Plus Jakarta Sans', sans-serif;
        gap: 12px;
        width: 100%;
        box-sizing: border-box;
        margin-top: 40px;
        border-top: 1px solid var(--wf-border);
    }

    .wowk-footer__made-with {
        font-size: 11px;
        color: var(--wf-text);
        text-transform: uppercase;
        letter-spacing: 0.25em;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
        opacity: 0.8;
    }

    .wowk-footer__heart {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        animation: wf-heartbeat 1.5s ease-in-out infinite;
    }

    .wowk-footer__heart svg {
        width: 14px;
        height: 14px;
        fill: var(--wf-accent);
        filter: drop-shadow(0 0 8px rgba(239, 68, 68, 0.5));
    }

    .wowk-footer__brand {
        display: flex;
        align-items: center;
        gap: 12px;
        text-decoration: none;
        margin: 8px 0;
        color: var(--wf-brand);
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    
    .wowk-footer__brand svg {
        height: 28px;
        width: auto;
        fill: currentColor;
        transition: fill 0.4s ease, filter 0.4s ease;
        filter: drop-shadow(0 0 10px rgba(255,255,255,0.05));
    }

    .wowk-footer__brand-text {
        font-size: 20px;
        font-weight: 800;
        color: currentColor;
        letter-spacing: -0.04em;
        transition: color 0.4s ease;
    }

    .wowk-footer__brand:hover {
        color: var(--wf-brand-hover);
        transform: translateY(-3px) scale(1.02);
    }
    
    .wowk-footer__brand:hover svg {
        filter: drop-shadow(0 0 20px rgba(255,255,255,0.2));
    }

    .wowk-footer__copyright {
        font-size: 12px;
        color: var(--wf-text);
        opacity: 0.5;
        font-weight: 400;
        letter-spacing: 0.02em;
    }

    .wowk-footer__hub-link {
        font-size: 11px;
        color: var(--wf-text);
        text-decoration: none;
        text-transform: uppercase;
        letter-spacing: 0.15em;
        font-weight: 600;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        transition: all 0.3s ease;
        opacity: 0.6;
        padding: 6px 12px;
        border-radius: 20px;
        border: 1px solid var(--wf-border);
        background: rgba(255, 255, 255, 0.02);
        margin: 4px 0;
    }

    .wowk-footer__hub-link:hover {
        opacity: 1;
        color: var(--wf-brand);
        border-color: rgba(255, 255, 255, 0.15);
        background: rgba(255, 255, 255, 0.05);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .wowk-footer__hub-link svg {
        width: 12px;
        height: 12px;
        fill: currentColor;
        transition: transform 0.3s ease;
    }

    .wowk-footer__hub-link:hover svg {
        transform: scale(1.1);
    }

    @keyframes wf-heartbeat {
        0% { transform: scale(1); }
        14% { transform: scale(1.3); }
        28% { transform: scale(1); }
        42% { transform: scale(1.15); }
        70% { transform: scale(1); }
    }

    .wowk-footer--theme-light {
        --wf-text: #64748b;
        --wf-brand: #0f172a;
        --wf-brand-hover: #000000;
        --wf-border: rgba(0, 0, 0, 0.06);
    }
    .wowk-footer--theme-light .wowk-footer__hub-link {
        background: rgba(0, 0, 0, 0.02);
    }
    .wowk-footer--theme-light .wowk-footer__hub-link:hover {
        background: rgba(0, 0, 0, 0.04);
        border-color: rgba(0, 0, 0, 0.1);
    }
    `;

    const injectStyles = () => {
        if (document.getElementById('wowk-digital-footer-styles')) return;
        const styleSheet = document.createElement("style");
        styleSheet.id = 'wowk-digital-footer-styles';
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    };

    const init = (options = {}) => {
        const {
            siteName = 'Sivis Drive',
            container = 'body',
            brandName = 'Wowk Digital',
            brandUrl = 'https://github.com/WowkDigital',
            showHubLink = true,
            hubUrl = 'https://wowkdigital.github.io/WD_HUB/',
            theme = 'auto'
        } = options;

        injectStyles();

        const footerMarkup = `
            <div class="wowk-footer__made-with">
                Made with <span class="wowk-footer__heart">
                    <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                </span> by
            </div>
            <a href="${brandUrl}" target="_blank" class="wowk-footer__brand">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 110">
                    <path d="M0 0 64 110 80 83 96 110 120 69 143 110 159 110 127 55 159 0 143 0 96 83 88 69 127 0 32 0 64 55 80 28 64 28 56 14 104 14 64 83 16 0z"/>
                </svg>
                <span class="wowk-footer__brand-text">${brandName}</span>
            </a>
            ${showHubLink ? `
            <a href="${hubUrl}" target="_blank" class="wowk-footer__hub-link">
                <svg viewBox="0 0 24 24">
                    <path d="M4 13h6c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v8c0 .55.45 1 1 1zm0 8h6c.55 0 1-.45 1-1v-4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1zm10-17v4c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1h-6c-.55 0-1 .45-1 1zm0 14h6c.55 0 1-.45 1-1v-8c0-.55-.45-1-1-1h-6c-.55 0-1 .45-1 1v8c0 .55.45 1 1 1z"/>
                </svg>
                <span>see more WD apps</span>
            </a>
            ` : ''}
            <div class="wowk-footer__copyright">
                &copy; ${new Date().getFullYear()} ${siteName}
            </div>
        `;

        const footer = document.createElement('footer');
        footer.className = 'wowk-footer';
        footer.innerHTML = footerMarkup;

        const target = document.querySelector(container);
        
        let activeTheme = theme;
        if (activeTheme === 'auto') {
            const isDark = isDarkBackground(target || document.body);
            if (!isDark) {
                if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
                    activeTheme = 'light';
                } else {
                    activeTheme = 'dark';
                }
            } else {
                activeTheme = 'dark';
            }
        }

        if (activeTheme === 'light') {
            footer.classList.add('wowk-footer--theme-light');
        }

        if (target) {
            // Check if there is already a wowk-footer to avoid duplicates
            const existing = target.querySelector('.wowk-footer');
            if (existing) existing.remove();
            
            target.appendChild(footer);
        } else {
            // Fallback to end of body
            document.body.appendChild(footer);
        }
    };

    return { init };
})();
