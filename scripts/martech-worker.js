import { loadScript } from './aem.js';

// load css https://cdn.popupsmart.com/accounts/6030/21310/13/main.css for popupsmart
async function enablePopupSmart() {
  setTimeout(async () => {
    await loadScript('https://cdn.popupsmart.com/accounts/6030/21310/13/main.js', {
      type: 'text/javascript',
      async: true,
      defer: true,
    });
    const popupSmartContainer = document.querySelector('#popupsmart-container-21310');
    if (popupSmartContainer) {
      let shadowRoot;
      if (popupSmartContainer.shadowRoot) {
        shadowRoot = popupSmartContainer.shadowRoot;
      } else {
        shadowRoot = popupSmartContainer.attachShadow({ mode: 'open' });
      }
      const popupSmartCss = document.createElement('link');
      popupSmartCss.rel = 'stylesheet';
      popupSmartCss.href = 'https://cdn.popupsmart.com/accounts/6030/21310/13/main.css';
      shadowRoot.appendChild(popupSmartCss);
    }
  }, 1000);
}

// Function to load the GTM script
function loadGTM() {
  const gtmScript = document.createElement('script');
  gtmScript.type = 'text/javascript';
  gtmScript.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','GTM-NXTTWP');`;
  gtmScript.async = true;

  const noscriptElement = document.createElement('noscript');
  const iframeElement = document.createElement('iframe');
  iframeElement.src = 'https://www.googletagmanager.com/ns.html?id=GTM-NXTTWP';
  iframeElement.height = '0';
  iframeElement.width = '0';
  iframeElement.style.display = 'none';
  iframeElement.style.visibility = 'hidden';
  noscriptElement.appendChild(iframeElement);

  document.head.appendChild(gtmScript);
  document.body.insertAdjacentElement('afterbegin', noscriptElement);
  enablePopupSmart();
}

// Listen for messages from the main thread
onmessage = function (event) {
  if (event.data === 'loadGTM') {
    loadGTM();
  }
};
