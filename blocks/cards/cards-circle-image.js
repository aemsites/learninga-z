/* eslint-disable import/prefer-default-export */
import {
  getRelativePath,
} from '../../scripts/utils.js';
import { decorateIcons } from '../../scripts/aem.js';
import { createOptimizedPicture } from '../../scripts/scripts.js';

export async function getCircleCardsArray(block, indexData, isDescription) {
  decorateIcons(block);
  const cards = [];
  [...block.children].forEach((row) => {
    let card;
    let img = '';
    let isIcon = false;
    [...row.children].forEach((col) => {
      const pic = col.querySelector('img');
      const a = col.querySelector('a');
      if (pic) {
        img = pic.getAttribute('src');
        if (pic.parentElement.classList.contains('icon')) {
          isIcon = true;
        }
      }
      if (a) {
        if (col.querySelector('h3')) {
          const link = a.getAttribute('href');
          const heading = col.querySelector('p>strong') || col.querySelector('strong>p');
          const headingText = heading ? heading.innerText : '';
          if (heading && heading.parentElement) {
            heading.parentElement.remove();
          }
          const description = col.querySelector('p');
          card = {
            title: col.querySelector('h3').innerText,
            description: description ? description.innerText : '',
            image: img,
            isDescription,
            isIcon,
            path: getRelativePath(link),
            heading: headingText,
          };
          cards.push(card);
        } else {
          const path = a.getAttribute('href');
          const relPath = getRelativePath(path);
          card = indexData.find((item) => item.path === relPath);
          if (card) {
            card.image = img;
            card.isDescription = isDescription;
            card.isIcon = isIcon;
            cards.push(card);
          }
        }
      }
    });
  });
  return cards;
}

export function populateCircleImageCard(wrapper, cardInfo) {
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
          <div class="card-thumbnail${cardInfo.isIcon ? ' icon' : ''}">
                    <a href="${cardInfo.path}">
                            ${createOptimizedPicture(cardInfo.image, cardInfo.title, false, [{ width: 250 }]).outerHTML}
                    </a>
         </div>
          <div class="card-body">
                ${cardInfo.heading ? `<p class='card-heading'><strong>${cardInfo.heading}</strong></p>` : ''}
                <a href="${cardInfo.path}">
                    <h3>${cardInfo.title.replace(/ \| Learning A-Z$|- Learning A-Z$/, '')}</h3>
                </a>
                ${cardInfo.isDescription ? ` <a href="${cardInfo.path}"><p>${cardInfo.description}</p></a>` : ''}
          </div>
      `;
  wrapper.append(card);
}
