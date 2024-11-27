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
const pricingApi = async () => {
  const response1 = await fetch('https://www.cloudflare.com/cdn-cgi/trace');
  const text = await response1.text();
  //const ip = text.match(/ip=(.*)/)[1];
  const ip = '2607:fea8:a45f:ce20:64f3:aa3a:bbd2:81f5';
  if (ip) {
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Accept', 'application/json');
    myHeaders.append('Cookie', '__cf_bm=lV3H_Es1WB6GoGSUBrChuXg2Q2fcmRuBgWuvzv3hAik-1732405742-1.0.1.1-SfttXcQNVo3zTTUsZZYFj.gVF04yo755Ratg3hwF76YtxZRRZHhflUjkx43IqHMzZODj9yIU30smKW2dwsgMWQ; BIGipServerlaz_prod_learninga-z=!404C0XFqK2kLejRTPKHt4XOpEQDDQiVAY5CJzkIkxvnfMRf2VqHRXrekTemV8W16cz7u/xevztPKFQ==');

    const raw = JSON.stringify({
      ipAddress: ip,
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
    });

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow',
    };

    fetch('https://api.learninga-z.com/v1/marketing/get-price', requestOptions)
      .then((response) => response.text())
      .then((result) => console.log(result))
      .catch((error) => console.error(error));
  }
};
pricingApi();
