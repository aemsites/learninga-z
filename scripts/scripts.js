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
  const heroSubText = main.querySelector('p>em');
  const heroContent = document.createElement('div');
  heroContent.className = 'hero-content';
  // eslint-disable-next-line no-bitwise
  if (h1 && picture && (h1.compareDocumentPosition(picture) & Node.DOCUMENT_POSITION_PRECEDING)) {
    const section = document.createElement('div');
    heroContent.append(h1);
    if (h1.compareDocumentPosition(heroSubText) && Node.DOCUMENT_POSITION_FOLLOWING) {
      const h2 = document.createElement('h2');
      h2.append(heroSubText.textContent);
      heroSubText.remove();
      heroContent.append(h2);
      section.append(buildBlock('hero', { elems: [picture, heroContent] }));
    } else {
      section.append(buildBlock('hero', { elems: [picture, heroContent] }));
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
    }
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
  'errorpage',
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
  const resp = await fetch(url);
  if (resp.ok) {
    const html = document.createElement('div');
    html.innerHTML = await resp.text();
    return html.querySelector('title').innerText;
  }
  return '';
};

// Get all paths except the current one
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
    if (name) {
      result.push({ path, name, url });
    }
  }
  result.shift();
  return result;
};

const createLink = (path) => {
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
    paths.forEach((pathPart) => breadcrumbLinks.push(createLink(pathPart).outerHTML));
    breadcrumb.innerHTML = breadcrumbLinks.join('<span class="breadcrumb-separator"> / </span>');
    outerSection.appendChild(container);
    container.appendChild(breadcrumb);
  }
  return outerSection;
}
/* END BREADCRUMBS */

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
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
  groupMultipleButtons(main);
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

async function loadPage() {
  redirectTagPage();
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
