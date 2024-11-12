import { buildBlock } from '../../scripts/aem.js';

export default function buildAuthorPage(main) {
  if (main) {
    const authorCards = document.createElement('div');
    authorCards.classList.add('author-cards');
    const h2 = document.createElement('h2');
    h2.innerText = 'Related Articles';
    authorCards.append(h2);
    authorCards.append(buildBlock('author-filter', ''));
    main.append(authorCards);
  }
}
