import { PRODUCT_COLORS } from '../../scripts/constants.js';

export default async function decorate(block) {
  const firstColumn = block.querySelector('div');
  firstColumn.classList.add('subnav-links');
  const secondColumn = block.querySelector('div:nth-child(2)');
  if (secondColumn) {
    secondColumn.classList.add('subnav-content');
  }

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
        if (secondColumn && window.location.pathname === href) {
          secondColumn.classList.add(`${PRODUCT_COLORS[lastPart]}`);
        }
      }
    });
  }
}
