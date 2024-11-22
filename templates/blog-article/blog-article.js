import { buildBlock, getMetadata } from '../aem.js';

export default async function decorate(main) {
  const picture = main.querySelector('picture');
  const author = getMetadata('author');
}
