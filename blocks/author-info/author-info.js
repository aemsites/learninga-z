/* eslint-disable max-len */
import { getAuthors } from '../../scripts/utils.js';

export default async function decorate(block) {
  const authorObjects = await getAuthors();
  const authors = block.querySelector(':scope > p');
  const authorList = authors[0].textContent.split(',');
  block.innerHTML = '<p>By ';
  authorList.forEach((authorItem) => {
    const authorData = authorObjects.find((authorObject) => authorObject.author.toLowerCase() === authorItem.toLowerCase().trim());
    if (authorData) {
      block.innerHTML += `<a href="${authorData.path}">${authorData.author}</a> ${authorData['author-title']}`;
      if (authorList.indexOf(authorItem) < authorList.length - 1) {
        block.innerHTML += '; ';
      }
    }
  });
}
