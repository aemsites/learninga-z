/* eslint-disable max-len */
import {
  buildBlock,
  loadHeader,
  loadFooter,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
  sampleRUM,
  getMetadata,
  toClassName,
  decorateBlock,
  loadScript,
  toCamelCase,
} from './aem.js';

import { pricingApi } from './utils.js';

/**
 * Returns the true origin of the current page in the browser.
 * If the page is running in an iframe with srcdoc, the ancestor origin is returned.
 * @returns {String} The true origin
 */
export function getOrigin() {
  const { location } = window;
  return location.href === 'about:srcdoc' ? window.parent.location.origin : location.origin;
}

/**
 * Returns the true of the current page in the browser.
 * If the page is running in an iframe with srcdoc,
 * the ancestor origin + the path query param is returned.
 * @returns {String} The href of the current page or the href of the block running in the library
 */
export function getHref() {
  if (window.location.href !== 'about:srcdoc') return window.location.href;

  const { location: parentLocation } = window.parent;
  const urlParams = new URLSearchParams(parentLocation.search);
  return `${parentLocation.origin}${urlParams.get('path')}`;
}

/** moved from aem.js per https://github.com/adobe/franklin-sidekick-library#considerations-when-building-blocks-for-the-library
 * Returns a picture element with webp and fallbacks
 * @param {string} src The image URL
 * @param {string} [alt=''] - The alt text for the image.
 * @param {boolean} [eager=false] - If true, the image will be loaded eagerly.
 * @param {Array} breakpoints breakpoints and corresponding params (e.g. width)
 */
export function createOptimizedPicture(src, alt = '', eager = false, breakpoints = [{
  media: '(min-width: 600px)',
  width: '2000',
}, { width: '750' }]) {
  const url = new URL(src, getHref());
  const picture = document.createElement('picture');
  const { pathname } = url;
  const ext = pathname.substring(pathname.lastIndexOf('.') + 1);

  // webp
  breakpoints.forEach((br) => {
    const source = document.createElement('source');
    if (br.media) source.setAttribute('media', br.media);
    source.setAttribute('type', 'image/webp');
    source.setAttribute('srcset', `${pathname}?width=${br.width}&format=webply&optimize=medium`);
    picture.appendChild(source);
  });

  // fallback
  breakpoints.forEach((br, i) => {
    if (i < breakpoints.length - 1) {
      const source = document.createElement('source');
      if (br.media) source.setAttribute('media', br.media);
      source.setAttribute('srcset', `${pathname}?width=${br.width}&format=${ext}&optimize=medium`);
      picture.appendChild(source);
    } else {
      const img = document.createElement('img');
      img.setAttribute('loading', eager ? 'eager' : 'lazy');
      img.setAttribute('alt', alt);
      picture.appendChild(img);
      img.setAttribute('src', `${pathname}?width=${br.width}&format=${ext}&optimize=medium`);
    }
  });

  return picture;
}

/**
 * Determines if the current audience is mobile or desktop.
 * @type {{desktop: (function(): boolean), mobile: (function(): boolean)}}
 * Required per https://github.com/adobe/aem-experimentation
 */
const AUDIENCES = {
  mobile: () => window.innerWidth < 600,
  desktop: () => window.innerWidth >= 600,
  // define your custom audiences here as needed
};

/**
 * Gets all the metadata elements that are in the given scope.
 * @param {String} scope The scope/prefix for the metadata
 * @returns an array of HTMLElement nodes that match the given scope
 */
export function getAllMetadata(scope) {
  return [...document.head.querySelectorAll(`meta[property^="${scope}:"],meta[name^="${scope}-"]`)]
    .reduce((res, meta) => {
      const id = toClassName(meta.name
        ? meta.name.substring(scope.length + 1)
        : meta.getAttribute('property').split(':')[1]);
      res[id] = meta.getAttribute('content');
      return res;
    }, {});
}

// Define an execution context
const pluginContext = {
  getAllMetadata,
  getMetadata,
  loadCSS,
  loadScript,
  sampleRUM,
  toCamelCase,
  toClassName,
};

function buildPageDivider(main) {
  const allPageDivider = main.querySelectorAll('code');

  allPageDivider.forEach((el) => {
    const alt = el.innerText.trim();
    const lower = alt.toLowerCase();
    if (lower.startsWith('divider')) {
      if (lower === 'divider' || lower.includes('element')) {
        el.innerText = '';
        el.classList.add('divider');
      }
    }
  });
}

/**
 * Builds hero block and prepends to main in a new section.
 * @param {Element} main The container element
 */
function buildHeroBlock(main) {
  const h1 = main.querySelector('h1');
  const picture = main.querySelector('picture');
  const heroSubText = main.querySelector('p>em');
  const heroContent = document.createElement('div');
  heroContent.className = 'hero-content';
  // eslint-disable-next-line no-bitwise
  if (h1 && picture && (h1.compareDocumentPosition(picture) & Node.DOCUMENT_POSITION_PRECEDING) && h1.parentElement === picture.closest('div')) {
    const section = document.createElement('div');
    // prevent hero block from being built with text if it is a picture only
    if (h1.querySelector('u')) {
      section.replaceChildren(buildBlock('hero', { elems: [picture] }));
      h1.innerHTML = h1.querySelector('u').innerHTML;
      section.querySelector('.hero').classList.add('hero-picture-only');
    } else {
      heroContent.append(h1.cloneNode(true));
      if (heroSubText && h1.nextElementSibling === heroSubText.parentElement) {
        const h2 = document.createElement('h2');
        h2.append(heroSubText.textContent);
        heroSubText.remove();
        heroContent.append(h2);
        section.append(buildBlock('hero', { elems: [picture, heroContent] }));
      } else {
        section.append(buildBlock('hero', { elems: [picture, heroContent] }));
      }
      h1.remove();
    }
    main.prepend(section);
  }
}

/**
 * Determine if we are serving content for a specific keyword
 * @param {string} keyword - The keyword to check in the URL path
 * @returns {boolean} True if we are loading content for the specified keyword
 */
// Might need this for the breadcrumbs and other things
export function locationCheck(keyword) {
  return window.location.pathname.includes(keyword);
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * check if link text is same as the href
 * @param {Element} link the link element
 * @returns {boolean} true or false
 */
export function linkTextIncludesHref(link) {
  const href = link.getAttribute('href');
  const textcontent = link.textContent;
  return textcontent.includes(href);
}

export const PRODUCTION_DOMAINS = ['learninga-z.com'];

const domainCheckCache = {};

/**
 * Checks a url to determine if it is a known domain.
 * @param {string | URL} url the url to check
 * @returns {Object} an object with properties indicating the urls domain types.
 */
export function checkDomain(url) {
  const urlToCheck = typeof url === 'string' ? new URL(url) : url;

  let result = domainCheckCache[urlToCheck.hostname];
  if (!result) {
    const isProd = PRODUCTION_DOMAINS.some((host) => urlToCheck.hostname.includes(host));
    const isHlx = ['hlx.page', 'hlx.live', 'aem.page', 'aem.live'].some((host) => urlToCheck.hostname.includes(host));
    const isLocal = urlToCheck.hostname.includes('localhost');
    const isPreview = isLocal || urlToCheck.hostname.includes('hlx.page') || urlToCheck.hostname.includes('aem.page');
    const isKnown = isProd || isHlx || isLocal;
    const isExternal = !isKnown;
    result = {
      isProd,
      isHlx,
      isLocal,
      isKnown,
      isExternal,
      isPreview,
    };

    domainCheckCache[urlToCheck.hostname] = result;
  }

  return result;
}

/**
   * Builds fragment blocks from links to fragments
   * @param {Element} main The container element
   */
export function buildFragmentBlocks(main) {
  main.querySelectorAll('a[href]').forEach((a) => {
    const url = new URL(a.href);
    const domainCheck = checkDomain(url);
    // don't autoblock the header navigation currently in fragments
    if (domainCheck.isKnown && linkTextIncludesHref(a) && (url.pathname.includes('/fragments/') && !url.pathname.includes('header/'))) {
      const block = buildBlock('fragment', url.pathname);
      a.replaceWith(block);
      decorateBlock(block);
    }
  });
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 * @param {Function} templateModule The template module
 */
function buildAutoBlocks(main, templateModule = undefined) {
  try {
    const templateName = toClassName(getMetadata('template'));
    if (templateName !== 'wide') {
      buildHeroBlock(main);
    }
    buildPageDivider(main);
    buildFragmentBlocks(main);
    if (templateModule && templateModule.default) {
      templateModule.default(main);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Extracts color information from the given anchor element's text content.
 * @param {HTMLElement} anchor - The anchor element from which to extract color information.
 * @returns {Object|null} - An object containing the extracted background color
 * and text color, or null if no color information is found.
 */

export function extractButtonColor(anchor) {
  const text = anchor.textContent;
  let colorOne = 'theme';
  let colorTwo = 'theme';
  const regex = /{([^|}]+)(?:\|([^}]+))?}/;
  const matches = text.match(regex);
  if (matches) {
    colorOne = matches[1] ? matches[1] : colorOne;
    colorTwo = matches[2] ? matches[2] : colorTwo;
    anchor.textContent = text.replace(regex, '');
    anchor.title = anchor.textContent;
    return { colorOne, colorTwo };
  }
  return { colorOne, colorTwo };
}

/**
 * Extracts color information from the h1-h4, p text content.
 * @param {HTMLElement} textNodes - The elements from which to extract color information.
 * @returns {Object|null} - An object containing the extracted color
 * or null if no color information is found.
 */
export function extractElementsColor() {
  const textNodes = Array.from(document.querySelectorAll('h1, h2, h3, h4, p'));
  textNodes.forEach((node) => {
    const up = node.parentElement;
    const isParagraph = node.tagName === 'P';
    const text = node.textContent;
    // we want to match the whole text content if it's a paragraph
    const regex = isParagraph ? /^{([^|}]+)?}$/ : /{([^|}]+)?}/;
    const matches = text.match(regex);

    if (matches) {
      const colorOne = matches[1] || '';
      if (isParagraph) {
        up.classList.add(`bg-${colorOne}`);
        node.remove();
      } else {
        node.textContent = text.replace(regex, ''); // remove the text content that was used to extract the color
        node.classList.add(colorOne);
      }
    }
  });
}

export function createTag(tag, attributes, html = undefined) {
  const element = document.createElement(tag);
  if (html) {
    if (html instanceof HTMLElement || html instanceof SVGElement) {
      element.append(html);
    } else {
      element.insertAdjacentHTML('beforeend', html);
    }
  }
  if (attributes) {
    Object.entries(attributes)
      .forEach(([key, val]) => {
        element.setAttribute(key, val);
      });
  }
  return element;
}

/**
 * Replaces links to SVG images
 * This function searches for all <a> elements that link to SVG images.
 * It then converts them to an <img> element
 * @param {Document} doc - doc object
 */
function svgImageLinks(doc) {
  const links = doc.querySelectorAll('a[href*="/images/svgs/"][href$=".svg"]');
  links.forEach((link) => {
    const href = link.getAttribute('href');
    const img = document.createElement('img');
    img.src = href;
    img.alt = link.textContent || '';
    link.replaceWith(img);
  });
}

/**
 * Sets an optimized background image for a given section element.
 * This function takes into account the device's viewport width and device pixel ratio
 * to choose the most appropriate image from the provided breakpoints.
 *
 * @param {HTMLElement} section - The section element to which the background image will be applied.
 * @param {string} bgImage - The base URL of the background image.
 * @param {Array<{width: string, media?: string}>} [breakpoints=[
 *  { width: '450' },
 *   { media: '(min-width: 450px)', width: '750' },
 *   { media: '(min-width: 768px)', width: '1024' },
 *   { media: '(min-width: 1024px)', width: '1600' },
 *   { media: '(min-width: 1600px)', width: '2000' },
 * ]] - An array of breakpoint objects. Each object contains a `width` which is the width of the
 * image to request, and an optional `media` which is a media query string indicating when this
 * breakpoint should be used.
 */

const resizeListeners = new WeakMap();
function getBackgroundImage(section) {
  // look for "background" values in the section metadata
  const bgImages = section.dataset.background.split(',');
  if (bgImages.length === 1) {
    return bgImages[0].trim();
  } // if there are 2 images, first is for desktop and second is for mobile
  return (window.innerWidth > 1024 && bgImages.length === 2)
    ? bgImages[0].trim() : bgImages[1].trim();
}

function createOptimizedBackgroundImage(section, breakpoints = [
  { width: '450' },
  { media: '(min-width: 450px)', width: '768' },
  { media: '(min-width: 768px)', width: '1024' },
  { media: '(min-width: 1024px)', width: '1600' },
  { media: '(min-width: 1600px)', width: '2000' },
]) {
  const updateBackground = () => {
    const bgImage = getBackgroundImage(section);
    const url = new URL(bgImage, window.location.href);
    const pathname = encodeURI(url.pathname);

    let bgContainer = section.querySelector('.bg-image-container');
    if (!bgContainer) {
      bgContainer = createTag('div', { class: 'bg-image-container' });
      const sectionInner = section.querySelector('div.section.inner');
      // we have to clone so we can put the bg-image-container in there
      if (sectionInner) {
        const clone = sectionInner.cloneNode(true);
        sectionInner.innerHTML = '';
        sectionInner.className = 'section inner';
        clone.classList.remove('inner');
        sectionInner.appendChild(bgContainer);
        bgContainer.appendChild(clone);
      } else {
        bgContainer.appendChild(section.firstChild);
        section.appendChild(bgContainer);
      }
    }

    const matchedBreakpoints = breakpoints.filter(
      (br) => !br.media || window.matchMedia(br.media).matches,
    );
    // If there are any matching breakpoints, pick the one with the highest resolution
    const matchedBreakpoint = matchedBreakpoints.reduce(
      (acc, curr) => (parseInt(curr.width, 10) > parseInt(acc.width, 10) ? curr : acc),
      breakpoints[0],
    );

    const adjustedWidth = matchedBreakpoint.width * window.devicePixelRatio;
    bgContainer.style.backgroundImage = `url(${pathname}?width=${adjustedWidth}&format=webply&optimize=highest)`;
  };

  if (resizeListeners.has(section)) {
    window.removeEventListener('resize', resizeListeners.get(section));
  }

  resizeListeners.set(section, updateBackground);
  window.addEventListener('resize', updateBackground);
  updateBackground();
}

/**
 * Finds all sections in the main element of the document
 * that require adding a background image
 * @param {Element} main
 */

function decorateStyledSections(main) {
  Array.from(main.querySelectorAll('.section-outer[data-background]')).forEach((section) => {
    createOptimizedBackgroundImage(section);
  });
}

/**
 * Decorates paragraphs containing a single link as buttons.
 * @param {Element} element container element
 */
export function decorateButtons(element) {
  element.querySelectorAll('a').forEach((a) => {
    a.title = a.title || a.textContent;
    if (a.href !== a.textContent) {
      const up = a.parentElement;
      const twoup = a.parentElement.parentElement;
      if (!a.querySelector('img')) {
        /* Commenting out below code to prevent any links from being converted to buttons */
        // if (up.childNodes.length === 1 && (up.tagName === 'P' || up.tagName === 'DIV')) {
        //   a.classList.add('button'); // default
        //   up.classList.add('button-container');
        // }
        if (
          up.childNodes.length === 1
          && up.tagName === 'STRONG'
          && twoup.childNodes.length === 1
          && (twoup.tagName === 'P' || twoup.tagName === 'LI' || twoup.tagName === 'DIV')
        ) {
          const colors = extractButtonColor(a);
          if (colors) {
            a.classList.add(`bgcolor-${colors.colorOne}`);
            a.classList.add(`textcolor-${colors.colorTwo}`);
          }
          a.classList.add('button', 'primary');
          twoup.classList.add('button-container');
        }
        if (
          up.childNodes.length === 1
          && up.tagName === 'EM'
          && twoup.childNodes.length === 1
          && (twoup.tagName === 'P' || twoup.tagName === 'LI' || twoup.tagName === 'DIV')
        ) {
          const colors = extractButtonColor(a);
          if (colors) {
            a.classList.add(`textcolor-${colors.colorOne}`);
          }

          a.classList.add('button', 'secondary');
          twoup.classList.add('button-container');
          twoup.append(a);
          up.remove();
        }
        // Button subtext
        if (
          twoup
          && twoup.nextElementSibling
          && twoup.nextElementSibling.tagName === 'P'
          && twoup.nextElementSibling.querySelector('sup')
          && twoup.nextElementSibling.textContent === twoup.nextElementSibling.querySelector('sup').textContent
        ) {
          const subText = twoup.nextElementSibling;
          twoup.classList.add('has-subtext');
          twoup.append(subText);
          subText.classList.add('button-subtext');
        }
      }
    }
  });
}

/**
 * When there are multiple buttons in a row, display them next to each other.
 */

export function groupMultipleButtons(main) {
  const buttons = main.querySelectorAll('p.button-container');
  buttons.forEach((button) => {
    if (button.nextElementSibling && button.nextElementSibling.classList.contains('button-container')) {
      const siblingButton = button.nextElementSibling;
      if (siblingButton && !button.parentElement.classList.contains('buttons-container')) {
        const buttonContainer = createTag('div', { class: 'buttons-container' });
        button.parentElement.insertBefore(buttonContainer, button);
        buttonContainer.append(button, siblingButton);
      }
    }
  });
}

/**
 * Decorates linked images by replacing the link element with the corresponding image element.
 * @param {HTMLElement} main - The main element containing the linked images.
 */
function decorateLinkedImages(main) {
  const pictures = main.querySelectorAll('picture');
  pictures.forEach((picture) => {
    const next = picture.nextElementSibling;
    if (next && next.tagName === 'A') {
      const a = next;
      a.replaceChildren(picture);
    } else if (next && next.tagName === 'BR' && next.nextElementSibling && next.nextElementSibling.tagName === 'A') {
      const a = next.nextElementSibling;
      a.replaceChildren(picture);
      next.remove();
    }
  });
}

/**
 * Centers the headlines by adding the 'center' class to their parent elements.
 */
export function centerHeadlines() {
  const headlines = document.querySelectorAll('h1 > strong, h2 > strong, h3 > strong, h4 > strong');
  headlines.forEach((headline) => {
    headline.parentElement.classList.add('center');
  });
}

// All .pdf and external links to open in a new tab
export function decorateExternalLinks(main) {
  main.querySelectorAll('a').forEach((a) => {
    const href = a.getAttribute('href');
    if (href) {
      const extension = href.split('.').pop().trim();
      const isExternal = !href.startsWith('/') && !href.startsWith('#');
      const isPDF = extension === 'pdf';
      const isLearningAZ = href.includes('learninga-z.com');
      if ((isExternal && (!isLearningAZ || isPDF)) || isPDF) {
        a.setAttribute('target', '_blank');
      }
    }
  });
}

/**
 * Builds video blocks when encounter video links.
 * @param {Element} main The container element
 */
export function buildEmbedBlocks(main) {
  main.querySelectorAll('a[href]').forEach((a) => {
    if ((a.href.includes('youtu') || a.href.includes('vimeo') || a.href.includes('go.learninga-z.com')) && linkTextIncludesHref(a)) {
      const embedBlock = buildBlock('embed', a.cloneNode(true));
      a.replaceWith(embedBlock);
      decorateBlock(embedBlock);
    }
  });
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 * @param {Function} templateModule The template module
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main, templateModule) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main, templateModule);
  decorateSections(main);
  decorateBlocks(main);
  decorateLinkedImages(main);
  decorateExternalLinks(main);
  decorateStyledSections(main);
  buildEmbedBlocks(main);
  centerHeadlines(main);
  extractElementsColor();
}

/**
 * Loads the template module.
 * @param {string} templateName The template name
 * Need to add the template name to the validTemplates array.
 */
const validTemplates = [
  'wide',
  'blog-article',
  'blog-author',
  'two-column',
  'research-detail',
  'news-post',
  'product',
  'errorpage',
  'landing',
  'common-core',
];
async function loadTemplate() {
  const templateName = toClassName(getMetadata('template'));
  if (templateName && validTemplates.includes(templateName)) {
    try {
      const cssLoaded = loadCSS(`${window.hlx.codeBasePath}/templates/${templateName}/${templateName}.css`);
      const mod = await import(
        `${window.hlx.codeBasePath}/templates/${templateName}/${templateName}.js`
      );
      await cssLoaded;
      return mod;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(`failed to load template ${templateName}`, error);
    }
  }
  return undefined;
}

/* Card related stuff */

/**
 * Gets details about blog pages that are indexed
 * @param {Array} pathNames list of pathNames
 */

export async function lookupBlogs(pathNames) {
  if (!window.blogIndex) {
    const resp = await fetch(`${window.hlx.codeBasePath}/site/resources/breakroom-blog/query-index.json`);
    const json = await resp.json();
    const lookup = {};
    json.data.forEach((row) => {
      lookup[row.path] = row;
      if (row.image || row.image.startsWith('/default-meta-image.png')) row.image = `/${window.hlx.codeBasePath}${row.image}`;
    });
    window.blogIndex = {
      data: json.data,
      lookup,
    };
  }
  const result = pathNames.map((path) => window.blogIndex.lookup[path]).filter((e) => e);
  return (result);
}

/* BREADCRUMBS START */

const getPageTitle = async (url) => {
  const resp = await fetch(url); // invalid URL will return 404 in console
  if (resp.ok) {
    const html = document.createElement('div');
    html.innerHTML = await resp.text();
    return html.querySelector('title').innerText;
  }
  return null;
};

const getAllPathsExceptCurrent = async (paths) => {
  const result = [];
  // remove first and last slash characters
  const pathsList = paths.replace(/^\/|\/$/g, '').split('/');
  for (let i = 0; i < pathsList.length - 1; i += 1) {
    const pathPart = pathsList[i];
    const prevPath = result[i - 1] ? result[i - 1].path : '';
    const path = `${prevPath}/${pathPart}`;
    const url = `${window.location.origin}${path}`;
    /* eslint-disable-next-line no-await-in-loop */
    const name = await getPageTitle(url);
    result.push({ path, name, url });
  }
  return result.filter(Boolean).slice(1); // remove first element ('site') from the array
};

const createLink = (path) => {
  if (!path.name) return { outerHTML: '' };
  const pathLink = document.createElement('a');
  pathLink.href = path.url;
  pathLink.innerText = path.name;
  return pathLink;
};

async function buildBreadcrumbs() {
  const outerSection = document.createElement('div');
  const breadcrumbsMetadata = getMetadata('breadcrumbs').toLowerCase();
  if (breadcrumbsMetadata !== 'off' && breadcrumbsMetadata !== 'false') {
    // Even if breadcrumbs are disabled, we need an empty div to keep the layout consistent
    outerSection.className = 'breadcrumbs-outer';
    const container = document.createElement('div');
    container.className = 'section breadcrumbs-container';
    const breadcrumb = document.createElement('nav');
    breadcrumb.className = 'breadcrumbs';
    breadcrumb.setAttribute('aria-label', 'Breadcrumb');
    breadcrumb.innerHTML = '';
    const HomeLink = createLink({ path: '', name: 'Home', url: window.location.origin });
    const breadcrumbLinks = [HomeLink.outerHTML];
    const path = window.location.pathname;
    const paths = await getAllPathsExceptCurrent(path);
    paths.forEach((pathPart) => {
      const link = createLink(pathPart);
      if (link.outerHTML !== '') {
        breadcrumbLinks.push(link.outerHTML);
      }
    });
    breadcrumb.innerHTML = breadcrumbLinks.join('<span class="breadcrumb-separator"> / </span>');
    outerSection.appendChild(container);
    container.appendChild(breadcrumb);
  }
  return outerSection;
}
/* END BREADCRUMBS */

// Setting the referral code eagerly
function setReferralCode() {
  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.search);
  let referralCode = params.get('referralCode');
  if (!referralCode && window.location.pathname.startsWith('/invite/')) {
    [, referralCode] = window.location.pathname.split('/invite/');
  }
  if (referralCode) {
    const existingRefc = document.cookie.split('; ').find((row) => row.startsWith('refc='));
    const existingRefcValue = existingRefc ? existingRefc.split('=')[1] : null;
    if (existingRefcValue !== referralCode) {
      document.cookie = `refc=${referralCode};max-age=${60 * 60 * 48};path=/`;
      pricingApi(true);
    }
  }
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  setReferralCode();
  document.documentElement.lang = 'en';
  // Add below snippet early in the eager phase
  if (getMetadata('experiment')
      || Object.keys(getAllMetadata('campaign')).length
      || Object.keys(getAllMetadata('audience')).length) {
    // eslint-disable-next-line import/no-relative-packages
    const { loadEager: runEager } = await import('../plugins/experimentation/src/index.js');
    await runEager(document, { audiences: AUDIENCES }, pluginContext);
  }
  decorateTemplateAndTheme();
  const templateModule = await loadTemplate();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main, templateModule);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
    main.prepend(await buildBreadcrumbs());
  }

  sampleRUM.enhance();

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
  // load convert script that they want in the head
  loadScript('https://cdn-4.convertexperiments.com/v1/js/10047477-10048673.js', {
    type: 'text/javascript',
    charset: 'utf-8',
  });
}

/**
 * Asynchronously loads and updates prices on the given main element.
 *
 * This function calls the `pricingApi` to fetch pricing information. If the
 * `window.pricing.blocked` is true, it hides all elements with the class 'price'.
 * Otherwise, it updates the inner HTML and href attributes of certain elements
 * (h1, h2, h3, h4, p, a) within the main element by replacing placeholders
 * (e.g., #{price}) with actual pricing data from `window.pricing`.
 *
 * @param {HTMLElement} main - The main element within which prices are to be updated.
 * @returns {Promise<void>} A promise that resolves when the pricing information has been loaded and applied.
 */
async function loadPrices(main) {
  // if window.pricing.blocked = true, hide all elements with class 'price'
  if (window.pricing && window.pricing.blocked) {
    const prices = main.querySelectorAll('.price');
    prices.forEach((price) => {
      price.style.display = 'none';
    });
  } else {
    const textNodes = Array.from(main.querySelectorAll('h1, h2, h3, h4, p, a'));
    textNodes.forEach((node) => {
      if (node) {
        const text = node.innerHTML;
        const href = node.getAttribute('href');
        const regex = /#\[(.*?)\]/g;
        if (text && text.match(regex)) {
          const replacedText = text.replace(regex, (match, group) => `$${(window.pricing && window.pricing[group]) || match}`);
          node.innerHTML = replacedText;
        }

        const hrefRegex = /#%5B(.*?)%5D/g;
        if (href && href.match(hrefRegex)) {
          const replacedHref = href.replace(hrefRegex, (match, group) => (window.pricing && window.pricing[group]) || group);
          node.setAttribute('href', replacedHref);
        }
      }
    });
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  await pricingApi();
  svgImageLinks(doc);

  const main = doc.querySelector('main');
  await loadSections(main);
  // const breadcrumb = await breadcrumbs(doc);
  // main.prepend(breadcrumb);
  const templateName = getMetadata('template');
  if (templateName) {
    await loadTemplate(doc, templateName);
  }
  await loadPrices(main);
  groupMultipleButtons(main);
  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();
  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));
  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
  // used for the authoring overlay
  if ((getMetadata('experiment')
      || Object.keys(getAllMetadata('campaign')).length
      || Object.keys(getAllMetadata('audience')).length)) {
    // eslint-disable-next-line import/no-relative-packages
    const { loadLazy: runLazy } = await import('../plugins/experimentation/src/index.js');
    await runLazy(document, { audiences: AUDIENCES }, pluginContext);
  }
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

/**
 * Redirect tag page with url parameter to
 * tag page in url path.
 */
export function redirectTagPage() {
  const windowHref = window.location.href;
  const url = new URL(windowHref);
  const basePath = url.pathname;
  const params = new URLSearchParams(url.search);
  const productMapping = {
    8614: 'raz-kids',
    8602: 'raz-plus',
    8253: 'foundationsa-z',
    8619: 'vocabularya-z',
    8624: 'sciencea-z',
    8629: 'writinga-z',
    8607: 'raz-plus-ell',
    // 8634: 'readinga-z',
    // that one doesn't exist yet
  };

  const productId = params.get('product');
  if (productId && productMapping[productId]) {
    const newPath = `${basePath}/${productMapping[productId]}`;
    params.delete('product');
    // If there are no remaining query parameters, construct the new URL without the question mark.
    const newLoc = params.toString() ? `${newPath}?${params.toString()}` : newPath;
    window.location.replace(newLoc);
  }
}

/**
 * Redirect video page with url parameter to
 * video page in url path.
 */
export function redirectVideoPage() {
  const windowHref = window.location.href;
  const url = new URL(windowHref);
  const basePath = url.pathname;
  const params = new URLSearchParams(url.search);
  const videoMapping = {
    5204: 'learning-a-z',
    7867: 'foundations-a-z',
    5454: 'raz-plus',
    7300: 'raz-plus-connected-classroom',
    5097: 'reading-a-z',
    5103: 'raz-kids',
    5104: 'science-a-z',
    5098: 'writing-a-z',
    5099: 'vocabulary-a-z',
    6275: 'raz-plus-ell',
    5384: 'funding',
    5491: 'testimonials',
    5592: 'professional-learning',
    5100: 'learning-a-z',
  };

  const videoId = params.get('SortByProduct');
  if (videoId && videoMapping[videoId]) {
    const newPath = `${basePath}?category=${videoMapping[videoId]}`;
    params.delete('SortByProduct');
    // Add additional query parameters, construct the new URL
    const newLoc = params.toString() ? `${newPath}&${params.toString()}` : newPath;
    // Set the new window location
    window.location.replace(newLoc);
  }
}

async function loadPage() {
  redirectTagPage();
  redirectVideoPage();
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
