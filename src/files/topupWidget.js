// topUpWidget.js
const designTokens = {
  colors: {
      background: '#f5f5f7',
      surface: '#ffffff',
      primary: '#0071e3',
      primaryHover: '#0077ed',
      text: '#1d1d1f',
      textSecondary: '#86868b',
      border: '#d2d2d7',
      success: '#34c759',
      error: '#ff3b30',
      warning: '#ff9500'
  },
  shadows: {
      widget: '0 12px 48px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.04)',
      button: '0 1px 3px rgba(0, 0, 0, 0.08)',
      buttonHover: '0 2px 6px rgba(0, 0, 0, 0.12)'
  },
  radii: {
      small: '6px',
      medium: '12px',
      large: '18px'
  },
  spacing: {
      small: '8px',
      medium: '16px',
      large: '24px'
  }
};

let widgetVisible = false;
let iframeLoaded = false;
let isTopUpWidgetOpen = false;

function openTopUpWidget() {
    return new Promise((resolve) => {
        const container = document.getElementById('topup-widget');
        if (!container) return resolve();
        if (isTopUpWidgetOpen) return resolve();
        container.classList.remove('exiting');
        container.style.display = 'block';
        void container.offsetWidth;
        container.classList.add('entering');
        isTopUpWidgetOpen = true;
        // Do NOT reload the iframe here; just show the widget
        container.removeEventListener('animationend', resolve);
        container.addEventListener('animationend', resolve, { once: true });
    });
}

function closeTopUpWidget() {
    return new Promise((resolve) => {
        const container = document.getElementById('topup-widget');
        if (!container) return resolve();
        if (!isTopUpWidgetOpen) return resolve();
        container.classList.remove('entering');
        container.classList.add('exiting');
        const onAnimationEnd = () => {
            container.style.display = 'none';
            container.classList.remove('exiting');
            isTopUpWidgetOpen = false;
            container.removeEventListener('animationend', onAnimationEnd);
            resolve();
        };
        container.addEventListener('animationend', onAnimationEnd, { once: true });
    });
}

function createTopUpWidget() {
  if (document.getElementById('topup-widget')) {
      // Do NOT re-create or reload the widget; just open it
      openTopUpWidget();
      return;
  }

  // Add Inter font if not already loaded
  if (!document.querySelector('#inter-font')) {
    const fontLink = document.createElement('link');
    fontLink.id = 'inter-font';
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap';
    document.head.appendChild(fontLink);
  }

  // Create widget styles
  const style = document.createElement('style');
  style.textContent = `
      @keyframes slideUp {
          from { opacity: 0; transform: translate(-50%, 20px); }
          to { opacity: 1; transform: translate(-50%, -50%); }
      }
@keyframes butterIn {
  0% {
    opacity: 0;
    transform: translate(-50%, 10px);
    filter: blur(0.4px);
  }
  100% {
    opacity: 1;
    transform: translate(-50%, -50%);
    filter: blur(0);
  }
}
@keyframes butterOut {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%);
    filter: blur(0);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, 8px);
    filter: blur(0.4px);
  }
}
      #topup-widget {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    display: none;
    position: fixed;
    top: 50%;
    left: 50%;
          transform: translate(-50%, -50%);
          width: 440px;
          height: 700px;
    z-index: 9999;
          background: ${designTokens.colors.surface};
          color: ${designTokens.colors.text};
          border-radius: ${designTokens.radii.large};
    padding: 0;
          box-shadow: ${designTokens.shadows.widget};
    overflow: hidden;
          animation: slideUp 0.4s cubic-bezier(0.2, 0, 0.1, 1) forwards;
          will-change: transform, opacity;
          border: 1px solid ${designTokens.colors.border};
      }
      #topup-widget.entering {
        animation: butterIn 320ms cubic-bezier(0.1, 0.8, 0.2, 1.05) forwards;
      }
      #topup-widget.exiting {
        animation: butterOut 260ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
      }
      #topup-header {
          position: relative;
          z-index: 2;
          padding: ${designTokens.spacing.medium} ${designTokens.spacing.large};
          border-bottom: 1px solid ${designTokens.colors.border};
  display: flex;
          justify-content: space-between;
          align-items: center;
          background: ${designTokens.colors.surface};
      }
      #topup-header h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
          color: ${designTokens.colors.text};
}
      #topup-header p {
          margin: 4px 0 0;
  font-size: 13px;
          color: ${designTokens.colors.textSecondary};
      }
      #topup-close {
    background: none;
    border: none;
          width: 28px;
          height: 28px;
          border-radius: ${designTokens.radii.small};
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
          color: ${designTokens.colors.textSecondary};
    transition: all 0.15s ease;
  }
      #topup-close:hover {
    background: rgba(0, 0, 0, 0.05);
          color: ${designTokens.colors.text};
      }
      #topup-iframe-container {
          width: 100%;
          height: calc(100% - 60px);
          position: relative;
    overflow: hidden;
  }
      #topup-iframe {
    width: 100%;
          height: 100%;
    border: none;
          background: ${designTokens.colors.background};
          display: block;
          overflow: hidden;
      }
      #topup-loading {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
          background: ${designTokens.colors.background};
          transition: opacity 0.3s ease;
          z-index: 1;
      }
      .loading-spinner {
          display: inline-block;
          width: 24px;
          height: 24px;
          border: 3px solid rgba(0,0,0,0.1);
          border-radius: 50%;
          border-top-color: #0071e3;
          animation: spin 1s ease-in-out infinite;
      }
      @keyframes spin {
          to { transform: rotate(360deg); }
}
`;
  document.head.appendChild(style);

  // Create widget container
  const container = document.createElement('div');
  container.id = 'topup-widget';
  container.innerHTML = `
      <div id="topup-header">
          <div>
              <h2>ToUp Your Card</h2>
              <p>Bridge your assets to Linea network and fund your Metamask Card</p>
    </div>
          <button id="topup-close" aria-label="Close widget">✕</button>
      </div>
      <div id="topup-iframe-container">
          <div id="topup-loading">
              <div class="loading-spinner"></div>
          </div>
          <iframe id="topup-iframe" 
              src="https://playground.li.fi/?fromChain=1&iframe=true&toChain=59144&toToken=0x176211869cA2b568f2A7D4EE941E073a821EE1ff&appearance=light&theme=light"
              title="TopUp Widget" 
              allow="accelerometer; autoplay; camera; gyroscope; payment"
              style="width:100%;height:100%;border:none;overflow:hidden;"
              onload="document.getElementById('topup-loading').style.opacity = '0'; setTimeout(() => document.getElementById('topup-loading').style.display = 'none', 300);"></iframe>
    </div>
`;
  document.body.appendChild(container);

  // Setup close button
  document.getElementById('topup-close').addEventListener('click', closeTopUpWidget);

  // Track iframe load
  document.getElementById('topup-iframe').addEventListener('load', () => {
      iframeLoaded = true;
  });
}

// Initialize the widget when the trigger is clicked
document.addEventListener('DOMContentLoaded', () => {
  const trigger = document.getElementById('topup-trigger');
  if (trigger) {
      trigger.addEventListener('click', (e) => {
          e.preventDefault();
          if (!document.getElementById('topup-widget')) {
              createTopUpWidget();
          }
          toggleTopUpWidget();
      });
  }
});

export { createTopUpWidget, openTopUpWidget, closeTopUpWidget, isTopUpWidgetOpen };