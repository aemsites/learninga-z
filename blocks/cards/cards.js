// These are the OOTB manual cards
import { buildBlock } from '../../scripts/aem.js';

export default function decorate(block) {
  const cardLinks = block.querySelectorAll('a');
  const cardsWrapper = document.createElement('div');
  cardsWrapper.className = 'cards-wrapper';
  cardLinks.forEach((cardLink) => {
    cardsWrapper.append(buildBlock('card', cardLink));
    cardLink.remove();
  });
}
