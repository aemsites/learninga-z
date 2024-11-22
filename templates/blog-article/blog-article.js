import { buildBlock, getMetadata } from '../../scripts/aem.js';

export default async function decorate(main) {
  const picture = main.querySelector('picture');
  const author = getMetadata('author');
  const authorInfo = buildBlock('author-info', [
    [`<p>${author}</p>`],
  ]);
  picture.parentNode.insertBefore(authorInfo, picture);
}
