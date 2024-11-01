/* eslint-disable max-len */
import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import { decorateButtons } from '../../scripts/scripts.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 991px)');

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
  const button = nav.querySelector('.nav-hamburger');
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

function toggleHeader() {
  const header = document.querySelector('header');
  const expanded = header.getAttribute('aria-expanded') === 'true';
  if (expanded) {
    document.body.style.overflowY = '';
    header.setAttribute('aria-expanded', 'false');
  } else {
    document.body.style.overflowY = 'hidden';
    header.setAttribute('aria-expanded', 'true');
  }
}

function toggleSecondaryNav(nav) {
  nav.querySelectorAll('.megamenu-container').forEach((secondaryNav) => {
    secondaryNav.classList.remove('active');
  });
}

function loadSecondaryNavFragment(navChildFragmentLink, secondaryNav) {
  const navChildFragmentPath = navChildFragmentLink.getAttribute('href');
  const navChildFragment = document.createElement('div');
  navChildFragment.className = 'megamenu';
  loadFragment(navChildFragmentPath).then((fragment) => {
    while (fragment.firstElementChild) navChildFragment.append(fragment.firstElementChild);
    secondaryNav.replaceChildren(navChildFragment);
  });
}

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

  // Nav tools
  const navTools = nav.querySelector('.nav-tools');
  const loginLink = navTools.querySelector('a[title*="Login"]');

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';

  const header = document.querySelector('header');

  const navAnnouncement = nav.querySelector('.nav-announcement');
  if (navAnnouncement && navAnnouncement.querySelector('a')) {
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

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = '<div class="navicon-line"></div><div class="navicon-line"></div><div class="navicon-line"></div>';
  hamburger.addEventListener('click', () => toggleHeader());
  nav.append(hamburger);
  nav.setAttribute('aria-expanded', 'false');

  let mainMenuSection;
  let headerTopLeft;
  // mobile nav header
  if (!isDesktop.matches) {
    header.classList.add('header-mobile');
    const mobileNavHeader = document.createElement('div');
    mobileNavHeader.className = 'nav-mobile-header';
    const topMenuSection = document.createElement('div');
    topMenuSection.className = 'top-menu-section';
    const closeButton = document.createElement('button');
    closeButton.className = 'close-button';
    closeButton.innerHTML = '<span class="icon icon-close"><img src ="/icons/close.svg"/></span>';
    mainMenuSection = document.createElement('div');
    mainMenuSection.className = 'main-menu-section';
    const h2 = document.createElement('h2');
    mainMenuSection.append(h2);
    headerTopLeft = document.createElement('div');
    headerTopLeft.className = 'header-top-left';
    const backButton = document.createElement('h2');
    backButton.className = 'back-button';
    backButton.textContent = 'Main Menu';
    backButton.addEventListener('click', () => {
      toggleMenu(nav, nav.querySelector('.nav-sections'));
      toggleSecondaryNav(nav);
      mainMenuSection.querySelector('h2').textContent = '';
    });
    if (loginLink) {
      const loginLinkClone = loginLink.cloneNode(true);
      loginLinkClone.classList.add('login-link');
      headerTopLeft.append(loginLinkClone);
    }
    headerTopLeft.append(backButton);
    topMenuSection.append(headerTopLeft);
    topMenuSection.append(closeButton);
    mobileNavHeader.append(topMenuSection);
    mobileNavHeader.append(mainMenuSection);
    nav.prepend(mobileNavHeader);
    closeButton.addEventListener('click', () => {
      toggleHeader();
      toggleMenu(nav, nav.querySelector('.nav-sections'));
      toggleSecondaryNav(nav);
      mainMenuSection.querySelector('h2').textContent = '';
    });
  }

  // nav sections and secondary nav
  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    const navItemsWrapper = navSections.querySelector(':scope .default-content-wrapper > ul');
    navItemsWrapper.className = 'primary-nav-items';
    navItemsWrapper.querySelectorAll(':scope > li').forEach((navSection) => {
      navSection.classList.add('nav-item');
      const navSectionLink = navSection.querySelector('a');
      // check if navSectionLink is part of current page url
      if (navSectionLink && window.location.href.includes(navSectionLink.href)) {
        navSection.classList.add('active');
      }
      const secondaryNav = document.createElement('div');
      secondaryNav.className = 'megamenu-container';
      const navChildFragmentLink = navSection.querySelectorAll('a[href*="/fragment"]');
      // load secondary nav fragment. if 2 links, load the first one for desktop and the second one for mobile
      if (navChildFragmentLink.length > 1) {
        if (isDesktop.matches) {
          loadSecondaryNavFragment(navChildFragmentLink[0], secondaryNav);
        } else {
          loadSecondaryNavFragment(navChildFragmentLink[1], secondaryNav);
        }
        navChildFragmentLink[0].closest('ul').remove();
      } else if (navChildFragmentLink.length) {
        loadSecondaryNavFragment(navChildFragmentLink[0], secondaryNav);
        navChildFragmentLink[0].closest('ul').remove();
      }
      if (isDesktop.matches) {
        navSection.append(secondaryNav);
      } else {
        navItemsWrapper.append(secondaryNav);
      }
      if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
      navSection.addEventListener('mouseenter', () => {
        if (isDesktop.matches) {
          toggleAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', 'true');
          secondaryNav.classList.add('active');
        }
      });

      navSection.addEventListener('mouseleave', () => {
        if (isDesktop.matches) {
          toggleAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', 'false');
          secondaryNav.classList.remove('active');
        }
      });

      navSection.addEventListener('click', (e) => {
        if (!isDesktop.matches) {
          e.preventDefault();
          const expanded = navSection.getAttribute('aria-expanded') === 'true';
          navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
          nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
          secondaryNav.classList.add('active');
          mainMenuSection.querySelector('h2').textContent = navSection.querySelector('a').textContent;
        }
      });
    });
  }

  // prevent mobile nav behavior on window resize
  // toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));
  navWrapper.append(nav);
  decorateButtons(nav);
  block.append(navWrapper);
}
