/* eslint-disable max-len */
import { getRelativePath, getGenericIndexData, generatePagination } from '../../scripts/utils.js';
import { createOptimizedPicture } from '../../scripts/aem.js';

const indexData = await getGenericIndexData();
let imgWidth = '750';

/** function to populate card */
export function populateCard(container, cardInfo, type = 'card') {
  const card = document.createElement('div');
  let efficacyBadge = '';
  let videoPlayBtn = '';

  if (cardInfo.efficacy) {
    efficacyBadge = `<span class="efficacy-badge ${cardInfo.efficacy}"><i class="flag"><span class="sr-only">Flag</span></i><p>${cardInfo.efficacy.charAt(0).toUpperCase() + cardInfo.efficacy.slice(1)}</p></span>`;
  }
  if (type === 'video') {
    videoPlayBtn = '<button type="button" aria-label="Play video" class="video-playbtn"></button>';
  }
  card.className = 'card';
  card.innerHTML = `
        <div class="card-thumbnail">
        <a href="${cardInfo.path}">
        ${createOptimizedPicture(cardInfo.image, cardInfo.title, false, [{ width: imgWidth }]).outerHTML}
        ${videoPlayBtn}
        ${efficacyBadge}
        </a>
        </div>
        <div class="card-body">
        <a href="${cardInfo.path}">
            <h3>${cardInfo.title.replace(/ \| Learning A-Z$|- Learning A-Z$/, '')}</h3>
         </a>
            <a href="${cardInfo.path}"><p>${cardInfo.description}</p></a>
               <i class="arrow"><img alt="arrow" src="/icons/solutions-right.svg"></i>
        </div>
    `;
  container.append(card);
}

/** function to render card list when an array of card objects are passed.
 * this also supports pagination
*/
export async function renderCardList(wrapper, cards, limit = 9, type = 'card') {
  let limitPerPage = limit;
  if (limit === undefined) {
    limitPerPage = cards.length;
  } else {
    limitPerPage = Number.isNaN(parseInt(limit, 10)) ? 10 : parseInt(limit, 10);
  }

  wrapper.innerHTML = '';
  let pageSize = 10;
  if (!cards || cards.length === 0) {
    return;
  }
  if (limitPerPage) {
    pageSize = Math.round(limitPerPage - (limitPerPage % 3));
  }
  const list = document.createElement('div');
  list.classList.add('article-teaser-list');
  let currentPage = 1;
  const match = window.location.hash.match(/page=(\d+)/);
  if (match) {
    currentPage = Number.isNaN(parseInt(match[1], 10)) ? currentPage : parseInt(match[1], 10);
  }
  const totalPages = Math.ceil(cards.length / pageSize);
  const cardsList = cards.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  cardsList.forEach((card) => {
    populateCard(wrapper, card, type);
  });

  if (totalPages > 1) {
    const paginationContainer = document.createElement('div');
    paginationContainer.classList.add('pagination-container');
    generatePagination(paginationContainer, currentPage, totalPages);
    wrapper.append(paginationContainer);
  }
}

/** function to get an array of card objects from indexData */
function getCardObject(link) {
  const path = link?.getAttribute('href');
  const relPath = getRelativePath(path);
  return indexData.find((item) => item.path === relPath);
}

export default function decorate(block) {
  const cardLinks = block.querySelectorAll('a');
  const cardsWrapper = document.createElement('div');
  cardsWrapper.className = 'card-wrapper';
  block.innerHTML = '';
  const cardsArray = [];
  Array.from(cardLinks).map((cardLink) => {
    const card = getCardObject(cardLink);
    if (card) {
      cardsArray.push(card);
    }
    return card;
  });
  if (block.classList.contains('suggested-videos')) {
    imgWidth = '200';
    const title = document.createElement('h3');
    title.innerHTML = 'Suggested Videos';
    block.append(title);
  } else {
    imgWidth = '750';
  }
  renderCardList(cardsWrapper, cardsArray, undefined);
  block.append(cardsWrapper);
}
