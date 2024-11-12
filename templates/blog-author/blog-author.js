import { buildBlock } from '../../scripts/aem.js';

export default function buildAuthorPage(main) {
  if (main) {
    const authorCards = document.createElement('div');
    authorCards.classList.add('author-cards');
    authorCards.append(buildBlock('author-filter', ''));
    main.append(authorCards);
  }
}
