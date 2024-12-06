import { loadScript } from './aem.js';

// eslint-disable-next-line import/no-cycle
import initAccessibilityMode from '../tools/sidekick/plugins/accessibility-mode/accessibility-mode.js';

let isA11yModeActive = false;

loadScript('https://cdn-4.convertexperiments.com/v1/js/10047477-10048673.js', {
  type: 'text/javascript',
  charset: 'utf-8',
});

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

// Function to open the chatbot
function openChatbot() {
  // Trigger a click event on the Intercom launcher frame
  const intercomLauncher = document.querySelector('.intercom-launcher');
  if (intercomLauncher) {
    intercomLauncher.click();
  } else {
    console.error('Intercom launcher not found.');
  }
}

// Function to bind click events on links with href="#chatbot"
function bindChatbotLinks() {
  // Select all links with href="#chatbot"
  const chatbotLinks = document.querySelectorAll('a[href="#chatbot"]');

  // Iterate over each link and bind the click event
  chatbotLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault(); // Prevent the default behavior of the link
      openChatbot(); // Call the function to open the chatbot
    });
  });
}

// Intercom script embed
// test ID is l13iokf2, prod ID is x8m18b9a
async function enableIntercom() {
  // Create an instance of the Web Worker
  const intercomWorker = new Worker(`${window.hlx.codeBasePath}/scripts/intercom-worker.js`);

  // Send a message to the Web Worker to load the Intercom script
  intercomWorker.postMessage('loadIntercom');

  // Optional: Listen for messages from the Web Worker
  intercomWorker.onmessage = function (event) {
    if (event.data.error) {
      console.error('Error in Intercom Web Worker:', event.data.error);
    } else {
      const intercomScript = document.createElement('script');
      intercomScript.type = 'text/javascript';
      // Construct the script content as a single string
      const scriptContent = ` window.intercomSettings = {
        api_base: "https://api-iam.intercom.io",
        app_id: "x8m18b9a",
      }; // We pre-filled your app ID in the widget URL: 'https://widget.intercom.io/widget/x8m18b9a'
      (function(){var w=window;var ic=w.Intercom;if(typeof ic==="function"){ic('reattach_activator');
      ic('update',w.intercomSettings);}else{var d=document;var i=function(){i.c(arguments);};
      i.q=[];i.c=function(args){i.q.push(args);};w.Intercom=i;var l=function(){var s=d.createElement('script');
      s.type='text/javascript';s.async=true;s.innerHTML=${JSON.stringify(event.data)};
      var x=d.getElementsByTagName('script')[0];x.parentNode.insertBefore(s,x);};if(document.readyState==='complete'){l();
      }else if(w.attachEvent){w.attachEvent('onload',l);}else{w.addEventListener('load',l,false);}}})();`;
      intercomScript.innerHTML = scriptContent;
      intercomScript.async = true;
      document.body.appendChild(intercomScript);
      bindChatbotLinks();
    }
  };
}
enableIntercom();

async function enablePopupSmart() {
  // Create an instance of the Web Worker
  const popupWorker = new Worker(`${window.hlx.codeBasePath}/scripts/popupSmart-worker.js`);

  // Send a message to the Web Worker to load the Popupsmart script
  popupWorker.postMessage('loadPopupSmart');

  // Optional: Listen for messages from the Web Worker
  popupWorker.onmessage = function (event) {
    if (event.data.error) {
      console.error('Error in Popupsmart Web Worker:', event.data.error);
    } else {
      const popupSmartScript = document.createElement('script');
      popupSmartScript.type = 'text/javascript';
      popupSmartScript.innerHTML = event.data;
      popupSmartScript.async = true;
      document.head.append(popupSmartScript);
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
    }
  };

  // Optional: Handle errors from the Web Worker
  popupWorker.onerror = function (error) {
    console.error('Error in Web Worker:', error);
  };
}

function enableGoogleTagManager() {
  // Create an instance of the Web Worker
  const gtmWorker = new Worker(`${window.hlx.codeBasePath}/scripts/googletagmanager-worker.js`);

  // Send a message to the Web Worker to load the GTM script
  gtmWorker.postMessage('loadGTM');

  // Optional: Listen for messages from the Web Worker
  gtmWorker.onmessage = function (event) {
    if (event.data.error) {
      console.error('Error in GTM Web Worker:', event.data.error);
    } else {
      // Create a script element and inject the GTM script into the DOM
      const gtmScript = document.createElement('script');
      gtmScript.type = 'text/javascript';
      gtmScript.innerHTML = event.data;
      const l = 'dataLayer';
      window[l] = window[l] || [];
      window[l].push({
        'gtm.start': new Date().getTime(),
        event: 'gtm.js',
      });
      const f = document.getElementsByTagName('script')[0];
      f.parentNode.insertBefore(gtmScript, f);
      const noscriptElement = document.createElement('noscript');
      const iframeElement = document.createElement('iframe');
      iframeElement.src = 'https://www.googletagmanager.com/ns.html?id=GTM-NXTTWP';
      iframeElement.height = '0';
      iframeElement.width = '0';
      iframeElement.style.display = 'none';
      iframeElement.style.visibility = 'hidden';
      noscriptElement.appendChild(iframeElement);

      document.body.insertAdjacentElement('afterbegin', noscriptElement);
      setTimeout(() => {
        enablePopupSmart();
      }, 1000);
    }
  };

  // Optional: Handle errors from the Web Worker
  gtmWorker.onerror = function (error) {
    console.error('Error in Web Worker:', error);
  };
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

const accessibilityMode = async (e) => {
  const pluginButton = e.target.shadowRoot.querySelector('.accessibility-mode > button');

  isA11yModeActive = !isA11yModeActive;

  if (isA11yModeActive) {
    pluginButton.style.backgroundColor = '#fb0f01';
    pluginButton.style.color = '#fff';
  } else {
    pluginButton.removeAttribute('style');
  }

  document.querySelector('body').classList.toggle('accessibility-mode-active');
  await initAccessibilityMode(isA11yModeActive);
};

let sk = document.querySelector('helix-sidekick') || document.querySelector('aem-sidekick');

if (sk) {
  sk.addEventListener('custom:accessibility-mode', accessibilityMode);
} else {
  document.addEventListener('sidekick-ready', () => {
    sk = document.querySelector('helix-sidekick') || document.querySelector('aem-sidekick');
    sk.addEventListener('custom:accessibility-mode', accessibilityMode);
  }, {
    once: true,
  });
}
