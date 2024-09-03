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
} from './aem.js';

/**
 * Builds hero block and prepends to main in a new section.
 * @param {Element} main The container element
 */
function buildHeroBlock(main) {
  const h1 = main.querySelector('h1');
  const picture = main.querySelector('picture');
  // eslint-disable-next-line no-bitwise
  if (h1 && picture && (h1.compareDocumentPosition(picture) & Node.DOCUMENT_POSITION_PRECEDING)) {
    const section = document.createElement('div');
    section.append(buildBlock('hero', { elems: [picture, h1] }));
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
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 * @param {Function} templateModule The template module
 */
function buildAutoBlocks(main, templateModule = undefined) {
  try {
    buildHeroBlock(main);
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
export function extractColor(anchor) {
  const text = anchor.textContent;
  let colorOne = 'red';
  let colorTwo = 'white';
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
        if (up.childNodes.length === 1 && (up.tagName === 'P' || up.tagName === 'DIV')) {
          a.classList.add('button'); // default
          up.classList.add('button-container');
        }
        if (
          up.childNodes.length === 1
          && up.tagName === 'STRONG'
          && twoup.childNodes.length === 1
          && (twoup.tagName === 'P' || twoup.tagName === 'LI')
        ) {
          const colors = extractColor(a);
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
          && (twoup.tagName === 'P' || twoup.tagName === 'LI')
        ) {
          const colors = extractColor(a);
          if (colors) {
            a.classList.add(`textcolor-${colors.colorOne}`);
          }
          a.classList.add('button', 'secondary');
          twoup.classList.add('button-container');
        }
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
}

/**
 * Loads the template module.
 * @param {string} templateName The template name
 * Need to add the template name to the validTemplates array.
 */
const validTemplates = [
  'home',
  'blog-article',
  'blog-author',
  'video-detail',
  'research-detail',
  'product',
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

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();

  /* // TODO: Might need this for hiding breadcrumbs in campaign pgs
  if (getMetadata('breadcrumbs').toLowerCase() === 'true') {
    document.body.dataset.breadcrumbs = true;
  }
 */

  const templateModule = await loadTemplate();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main, templateModule);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
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
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadSections(main);
  // const breadcrumb = await breadcrumbs(doc);
  // main.prepend(breadcrumb);

  const templateName = getMetadata('template');
  if (templateName) {
    await loadTemplate(doc, templateName);
  }

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();
  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));
  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
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

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
