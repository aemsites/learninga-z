import { PRODUCT_COLORS } from '../../scripts/constants.js';

export default async function decorate(block) {
  const firstColumn = block.querySelector('div');
  firstColumn.classList.add('subnav-links');
  const isResearch = block.classList.contains('research');
  if (isResearch) {
    const links = firstColumn.querySelectorAll('a');
    links.forEach((link) => {
      link.className = 'button secondary';
      const href = link.getAttribute('href');
      if (window.location.pathname === href) {
        link.classList.add('active');
      }
      const lastPart = href.split('/').pop();
      if (PRODUCT_COLORS[lastPart]) {
        link.classList.add(`textcolor-${PRODUCT_COLORS[lastPart]}`);
      }
    });
  }
  // if block has a second child div, add class "subnav-content" to it
  const secondColumn = block.querySelector('div:nth-child(2)');
  if (secondColumn) {
    secondColumn.classList.add('subnav-content');
  }
}
