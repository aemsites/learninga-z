/* eslint-disable max-len */
import { buildBlock, getMetadata } from '../../scripts/aem.js';
import { div } from '../../scripts/dom-helpers.js';

export default async function decorate(main) {
  const author = getMetadata('author');
  if (!author) return;
  const authorInfo = buildBlock('author-info', [
    [`<p>${author}</p>`],
  ]);

  const h1 = main.querySelector('h1');
  let subHeading = main.querySelector('p>strong');
  if (!subHeading) {
    subHeading = main.querySelector('strong>p');
  }
  let headingSection = div(h1);
  if (subHeading && subHeading.innerText === subHeading.closest('p').innerText) {
    headingSection = div(h1, subHeading);
  }
  main.prepend(div(authorInfo));
  main.prepend(headingSection);
}
