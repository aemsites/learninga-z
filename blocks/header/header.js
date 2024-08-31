import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import { decorateButtons, extractColor } from '../../scripts/scripts.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections, false);
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections, false);
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  const navDrops = navSections.querySelectorAll('.nav-drop');
  if (isDesktop.matches) {
    navDrops.forEach((drop) => {
      if (!drop.hasAttribute('tabindex')) {
        drop.setAttribute('tabindex', 0);
        drop.addEventListener('focus', focusNavSection);
      }
    });
  } else {
    navDrops.forEach((drop) => {
      drop.removeAttribute('tabindex');
      drop.removeEventListener('focus', focusNavSection);
    });
  }

  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
    // collapse menu on focus lost
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

function applyColors(secondaryNav) {
  secondaryNav.querySelectorAll('a').forEach((anchor) => {
    const { colorOne } = extractColor(anchor);
    anchor.parentElement.classList.add(colorOne);
  });
}

function loadSecondaryNavFragment(navChildFragmentLink, secondaryNav) {
  const navChildFragmentPath = navChildFragmentLink.getAttribute('href');
  const navChildFragment = document.createElement('div');
  navChildFragment.className = 'megamenu';
  loadFragment(navChildFragmentPath).then((fragment) => {
    while (fragment.firstElementChild) navChildFragment.append(fragment.firstElementChild);
    secondaryNav.replaceChildren(navChildFragment);
    applyColors(secondaryNav);
  });
}

/* BREADCRUMBS START */

// Last part of the breadcrumb is page title
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
  // removing first path part is making the rest not show
  // pathsList.shift();
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
  return result;
};

const createLink = (path) => {
  const pathLink = document.createElement('a');
  pathLink.href = path.url;
  pathLink.innerText = path.name;
  return pathLink;
};

async function buildBreadcrumbs() {
  const breadcrumb = document.createElement('nav');
  breadcrumb.className = 'breadcrumbs';
  breadcrumb.setAttribute('aria-label', 'Breadcrumb');
  breadcrumb.innerHTML = '';
  const HomeLink = createLink({ path: '', name: 'Home', url: window.location.origin });
  const breadcrumbLinks = [HomeLink.outerHTML];
  const path = window.location.pathname;
  const paths = await getAllPathsExceptCurrent(path);

  paths.forEach((pathPart) => breadcrumbLinks.push(createLink(pathPart).outerHTML));
  const currentPath = document.createElement('span');
  currentPath.innerText = document.querySelector('title').innerText;
  breadcrumbLinks.push(currentPath.outerHTML);

  breadcrumb.innerHTML = breadcrumbLinks.join('<span class="breadcrumb-separator"> / </span>');
  return breadcrumb;
}
/* END BREADCRUMBS */

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/fragments/header/home';
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['announcement', 'brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';

  const navAnnouncement = nav.querySelector('.nav-announcement');
  if (navAnnouncement) {
    if (navAnnouncement.querySelector('a')) {
      const announcementLink = navAnnouncement.querySelector('a');
      announcementLink.className = '';
      const announcementWrapper = document.createElement('div');
      announcementWrapper.className = 'nav-announcement';
      announcementWrapper.append(announcementLink);
      navWrapper.append(announcementWrapper);
      navAnnouncement.remove();
    }

    const navBrand = nav.querySelector('.nav-brand');
    const brandLink = navBrand.querySelector('.button');
    if (brandLink) {
      brandLink.className = '';
      brandLink.closest('.button-container').className = '';
    }

    const navSections = nav.querySelector('.nav-sections');
    if (navSections) {
      navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
        const secondaryNav = document.createElement('div');
        secondaryNav.className = 'megamenu-container';
        const navChildFragmentLink = navSection.querySelector('a[href*="/fragment"]');
        if (navChildFragmentLink) {
          loadSecondaryNavFragment(navChildFragmentLink, secondaryNav);
          navChildFragmentLink.closest('ul').remove();
        }
        navSection.append(secondaryNav);
        if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
        navSection.addEventListener('mouseenter', () => {
          if (isDesktop.matches) {
            toggleAllNavSections(navSections);
            navSection.setAttribute('aria-expanded', 'true');
          }
        });

        navSection.addEventListener('mouseleave', () => {
          if (isDesktop.matches) {
            toggleAllNavSections(navSections);
            navSection.setAttribute('aria-expanded', 'false');
          }
        });
      });
    }

    // hamburger for mobile
    const hamburger = document.createElement('div');
    hamburger.classList.add('nav-hamburger');
    hamburger.innerHTML = '<div class="navicon-line"></div><div class="navicon-line"></div><div class="navicon-line"></div>';
    hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
    nav.append(hamburger);
    nav.setAttribute('aria-expanded', 'false');
    // prevent mobile nav behavior on window resize
    // toggleMenu(nav, navSections, isDesktop.matches);
    isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));
    navWrapper.append(nav);
    decorateButtons(nav);
    block.append(navWrapper);
    navWrapper.append(await buildBreadcrumbs());
  }
}
