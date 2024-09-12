import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
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

  block.append(footer);
}
