import { loadScript } from './aem.js';

// metarouter analytics script embed

async function enableMetaRouter() {
  const metaRouterScript = document.createElement('script');
  metaRouterScript.type = 'text/javascript';
  metaRouterScript.innerHTML = `!function () { var analytics = window.analytics = window.analytics || [];
  if (!analytics.initialize) if (analytics.invoked) window.console && console.error && console.error("MetaRouter snippet included twice.");
  else { analytics.invoked = !0; analytics.methods = ["trackSubmit", "trackClick", "trackLink", "trackForm", "pageview", "identify", "reset", "group", "track", "ready", "alias", "page", "once", "off", "on"];
  analytics.factory = function (t) { return function () { var e = Array.prototype.slice.call(arguments);
  e.unshift(t);
  analytics.push(e);
  return analytics } };
  for (var t = 0; t < analytics.methods.length;
  t++) { var e = analytics.methods[t];
  analytics[e] = analytics.factory(e) } analytics.load = function (t) { var e = document.createElement("script");
  e.type = "text/javascript";
  e.async = !0; e.src = ("https:" === document.location.protocol ? "https://" : "http://") + "cdn.metarouter.io/a/v1/" + t + ".js";
  var n = document.getElementsByTagName("script")[0];
  n.parentNode.insertBefore(e, n) };
  analytics.SNIPPET_VERSION = "3.1.0";
  analytics.load("PLCAwWW6xWR8AsqWFYyp5");
  analytics.page() } }();`;
  metaRouterScript.async = true;
  document.head.appendChild(metaRouterScript);
}
enableMetaRouter();

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

/**
 * Writes a script element with the LD JSON struct to the page
 * @param {HTMLElement} parent
 * @param {Object} json
 */
function addLdJsonScript(parent, json) {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.innerHTML = json;
  parent.append(script);
}

/**
 *
 * @type {Element}
 */
const jsonLdMeta = document.querySelector('meta[name="json-ld"]');
if (jsonLdMeta) {
  addLdJsonScript(document.querySelector('head'), jsonLdMeta.content);
  document.querySelector('meta[name="json-ld"]').remove();
}

loadScript('https://widget.intercom.io/widget/x8m18b9a', {
  type: 'text/javascript',
  charset: 'utf-8',
  async: true,
});

// eslint-disable-next-line no-unused-vars
const pricingApi = async () => {
  const response = await fetch('https://api.learninga-z.com/v1/marketing/get-ip-address');
  const data = await response.json();
  if (data.ip) {
    const pricingJson = await fetch('https://api.learninga-z.com/v1/marketing/get-price', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ipAddress: '',
        product: [
          {
            productNumber: 'WAZ-AZ-INDV',
          },
          {
            productNumber: 'RP-INDV',
            coupon: '10PERCENTOFF',
          },
          {
            productNumber: 'FAZ-INDV',
            referralCode: 'ROXDNXMAHQ',
          },
        ],
      }),
    });
    const pricingData = await pricingJson.json();
    console.log('pricingData : ', pricingData);
  }
};
pricingApi();
