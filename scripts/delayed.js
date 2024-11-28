import { loadScript } from './aem.js';
import { BLOCKED_COUNTRIES } from './constants.js';

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

async function enablePardot() {
  const pardotScript = document.createElement('script');
  pardotScript.type = 'text/javascript';
  pardotScript.innerHTML = ` piAId = '711503';
 piCId = '5272';
 piHostname = '[pi.pardot.com](http://pi.pardot.com/)';
(function() {
 function async_load(){
 var s = document.createElement('script'); s.type = 'text/javascript';
 s.src = ('https:' == document.location.protocol ? 'https://pi/' : 'http://cdn/') + '.[pardot.com/pd.js](http://pardot.com/pd.js)';
 var c = document.getElementsByTagName('script')[0]; c.parentNode.insertBefore(s, c);
 }
 if(window.attachEvent) { window.attachEvent('onload', async_load); }
 else { window.addEventListener('load', async_load, false); }
 })();`;
  pardotScript.async = true;
  document.body.append(pardotScript);
}
enablePardot();

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
/**
 * Fetches pricing information from the Learning A-Z API.
 *
 * @param {string} ip - The IP address to be sent in the request payload.
 * @returns {Promise<void>} - A promise that resolves when the API call is complete.
 *
 * The function constructs a request payload including the IP address and a list of products.
 * If a referral code (refc) is found in the cookies, it is included in the payload.
 * The request is sent to the Learning A-Z pricing API endpoint.
 * On success, the response is logged to the console.
 * On failure, the error is logged to the console.
 */
const pricingApi = async (ip) => {
  // get refc cookie value
  const refc = document.cookie
    .split('; ')
    .find((row) => row.startsWith('refc'))
    .split('=')[1] || '';

  const pricingHeaders = new Headers();
  pricingHeaders.append('Content-Type', 'application/json');
  pricingHeaders.append('Accept', 'application/json');

  const raw = JSON.stringify({
    ipAddress: ip,
    product: [
      {
        productNumber: 'RAZ-INDV',
        ...(refc && { referralCode: refc }),
      },
      {
        productNumber: 'RK-INDV ',
        ...(refc && { referralCode: refc }),
      },
      {
        productNumber: 'RP-INDV',
        ...(refc && { referralCode: refc }),
      },
      {
        productNumber: 'FAZ-INDV',
        ...(refc && { referralCode: refc }),
      },
      {
        productNumber: 'VOCAB-INDV',
        ...(refc && { referralCode: refc }),
      },
      {
        productNumber: 'SAZ-INDV',
        ...(refc && { referralCode: refc }),
      },
      {
        productNumber: 'WAZ-AZ-INDV',
        ...(refc && { referralCode: refc }),
      },
      {
        productNumber: 'RPCC-INDV',
        ...(refc && { referralCode: refc }),
      },
      {
        productNumber: 'RAZ-ELL-INDV',
        ...(refc && { referralCode: refc }),
      },
      {
        productNumber: 'ESP-INDV',
        ...(refc && { referralCode: refc }),
      },
    ],
  });

  const requestOptions = {
    method: 'POST',
    headers: pricingHeaders,
    body: raw,
    redirect: 'follow',
  };

  fetch('https://api.learninga-z.com/v1/marketing/get-price', requestOptions)
    .then((response) => response.text())
    .then((result) => console.log(result))
    .catch((error) => console.error(error));
};

/**
 * Fetches the user's location and IP address from Cloudflare's trace endpoint.
 * If the user's location is in the list of blocked countries, sets the pricing
 * blocked flag to true. Otherwise, sets the pricing blocked flag to false and
 * calls the pricing API with the user's IP address.
 */
const getLocation = async () => {
  const response = await fetch('https://www.cloudflare.com/cdn-cgi/trace');
  const text = await response.text();
  const ip = text.match(/ip=(.*)/)[1];
  const loc = text.match(/loc=(.*)/)[1];
  if (BLOCKED_COUNTRIES.includes(loc)) {
    window.pricing.blocked = true;
  } else {
    window.pricing.blocked = false;
    pricingApi(ip);
  }
};

getLocation();
