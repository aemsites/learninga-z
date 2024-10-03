import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * Decorates the link items with necessary classes and attributes
 * @param {Element} footer The footer element to decorate
 */
const decorateLinkItems = (footer) => {
  // Add wrapper class to all ul elements
  footer.querySelectorAll('ul').forEach((ul) => {
    ul.classList.add('nav-items-wrapper');
  });

  // Add CSS classes for li items and a tags
  footer.querySelectorAll('li').forEach((li) => {
    li.classList.add('nav-item');
    li.querySelectorAll('a').forEach((a) => {
      a.classList.add('nav-link');
      a.setAttribute('target', '_blank');
      a.setAttribute('aria-label', `Visit us on ${a.href}`);
      if (!a.querySelector('span.icon')) {
        const lnkTxt = document.createElement('span');
        lnkTxt.classList.add('nav-link-text');
        lnkTxt.innerText = a.innerText;
        a.innerHTML = lnkTxt.outerHTML;
      }
    });
  });
};

/**
 * Loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // Load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  // Decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  const footerWrapper = footer.querySelector('.columns-container');
  if (footerWrapper) {
    const navLinksWrapper = footerWrapper.querySelector('ul');
    navLinksWrapper.classList.add('footer-links');
    if (navLinksWrapper) {
      const navLinks = navLinksWrapper.querySelectorAll('li');
      navLinks.forEach((navLink, index) => {
        // Add separator if it's not the last link
        if (index !== navLinks.length - 1) {
          const li = document.createElement('li');
          li.textContent = '/';
          navLink.after(li);
        }
      });
    }

    const socialLinks = footerWrapper.querySelectorAll('ul')[1];
    if (socialLinks) {
      socialLinks.parentElement.classList.add('social-links-container');
      socialLinks.classList.add('social-links');
    }
  }

  // Call the function to decorate link items
  decorateLinkItems(footer);

  block.append(footer);
}
