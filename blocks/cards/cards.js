// These are the OOTB manual cards
import { buildBlock, decorateBlock, loadBlock } from '../../scripts/aem.js';

export default function decorate(block) {
  const title = block.querySelector('h4');
  const cardLinks = block.querySelectorAll('a');
  const cardsWrapper = document.createElement('div');
  cardsWrapper.className = 'cards-wrapper';
  cardLinks.forEach((cardLink) => {
    const card = buildBlock('card', [[cardLink]]);
    cardsWrapper.append(card);
    decorateBlock(card);
    loadBlock(card);
  });
  if (title) {
    block.replaceChildren(title);
  }
  block.append(cardsWrapper);
}
