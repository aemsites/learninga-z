/* eslint-disable import/prefer-default-export */
import {
  getRelativePath,
} from '../../scripts/utils.js';
import { createOptimizedPicture } from '../../scripts/aem.js';

export async function getCircleCardsArray(block, indexData, isDescription) {
  const cards = [];
  [...block.children].forEach((row) => {
    let card;
    let img;
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      const a = col.querySelector('a');
      if (pic) {
        img = pic.querySelector('img')?.getAttribute('src');
      }
      if (a) {
        const path = a.getAttribute('href');
        const relPath = getRelativePath(path);
        card = indexData.find((item) => item.path === relPath);
      }
    });
    card.image = img;
    card.isDescription = isDescription;
    cards.push(card);
  });
  return cards;
}

export function populateCircleImageCard(wrapper, cardInfo) {
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
          <div class="card-thumbnail">
          <a href="${cardInfo.path}">
                  ${createOptimizedPicture(cardInfo.image, cardInfo.title, false, [{ width: 250 }]).outerHTML}
          </a>
                  </div>
          <div class="card-body">
                <a href="${cardInfo.path}">
                    <h3>${cardInfo.title}</h3>
                </a>
                ${cardInfo.isDescription ? ` <a href="${cardInfo.path}"><p>${cardInfo.description}</p></a>` : ''}
          </div>
      `;
  wrapper.append(card);
}
