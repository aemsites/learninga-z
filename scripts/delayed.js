// add delayed functionality here
// Google Tag Manager script embed

async function enableGoogleTagManager() {
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
}
 enableGoogleTagManager();
