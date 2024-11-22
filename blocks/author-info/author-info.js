/* eslint-disable max-len */
import { getAuthors } from '../../scripts/utils.js';
import { createOptimizedPicture } from '../../scripts/scripts.js';

export default async function decorate(block) {
  const authorObjects = await getAuthors();
  const authors = block.querySelector('p').innerText;
  const authorList = authors.split(',');
  block.innerHTML = '';
  authorList.forEach((authorItem) => {
    const authorData = authorObjects.find((authorObject) => authorObject.author.toLowerCase() === authorItem.toLowerCase().trim());
    if (authorData) {
      if (authorList.length === 1 && authorData.image) {
        block.innerHTML += createOptimizedPicture(authorData.image, authorData.author).outerHTML;
      }
      if (authorList.indexOf(authorItem) === 0) {
        block.innerHTML += 'By ';
      }
      block.innerHTML += `<a href="${authorData.path}">${authorData.author}</a>${authorData.authorTitle?.length ? `, ${authorData.authorTitle}` : ''}`;
      if (authorList.indexOf(authorItem) < authorList.length - 1) {
        block.innerHTML += '; ';
      }
    }
  });

  const children = Array.from(block.childNodes);
  const p = document.createElement('p');
  children.forEach((child) => {
    if (child.tagName !== 'PICTURE') {
      p.appendChild(child);
    }
  });
  block.appendChild(p);
}
