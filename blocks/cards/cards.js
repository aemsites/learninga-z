/* eslint-disable max-len */
import { getCircleCardsArray, populateCircleImageCard } from './cards-circle-image.js';
import {
  getRelativePath, getGenericIndexData, generatePagination, getDateRange,
} from '../../scripts/utils.js';
import { loadCSS } from '../../scripts/aem.js';
import { createOptimizedPicture, decorateExternalLinks } from '../../scripts/scripts.js';

const indexData = await getGenericIndexData();
let imgWidth = '750';

/**
 * Populates a news card with the provided card information and appends it to the specified container.
 */
function populateSearchCard(container, cardInfo) {
  const card = document.createElement('div');
  card.className = 'card';

  const dateParts = cardInfo.date.split('-');
  const year = parseInt(dateParts[0], 10);
  const month = parseInt(dateParts[1], 10) - 1;
  const day = parseInt(dateParts[2], 10);
  const date = new Date(year, month, day);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  let dateText;
  // check if news and date is valid
  if (cardInfo.path.includes('/news/') && !Number.isNaN(date.getTime())) {
    dateText = `${date.toLocaleDateString('en-US', options)} - `;
  } else {
    dateText = '';
  }

  card.innerHTML = `
        <div class="card-left">
          <div class="card-thumbnail">
            ${createOptimizedPicture(cardInfo.image, cardInfo.title, false, [{ width: 200 }]).outerHTML}
          </div>
          <div class="card-body">
            <a href="${cardInfo.path}">
                <h2>${cardInfo.title.replace(/ \| Learning A-Z$|- Learning A-Z$/, '')}</h2>
            </a>
            <p><span>${dateText}</span>${cardInfo.description}</p>
          </div>
        </div>
    `;
  container.append(card);
}

/** function to populate general card */
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
        <a href="${cardInfo.path}">
        <div class="card-thumbnail">
        
        ${createOptimizedPicture(cardInfo.image, cardInfo.title, false, [{ width: imgWidth }]).outerHTML}
        ${videoPlayBtn}
        ${efficacyBadge}
        
        </div>
        <div class="card-body">

            <h3>${cardInfo.title.replace(/ \| Learning A-Z$|- Learning A-Z$/, '')}</h3>
        
            <p>${cardInfo.description}</p>
               <i class="arrow"><img alt="arrow" src="/icons/solutions-right.svg"></i>
        </div></a>
    `;
  container.append(card);
}

/**
 * Populates a news card with the provided card information and appends it to the specified container.
 */
function populateNewsCard(container, cardInfo) {
  const card = document.createElement('div');
  card.className = 'card';
  const dateParts = cardInfo.date.split('-');
  const year = parseInt(dateParts[0], 10);
  const month = parseInt(dateParts[1], 10) - 1;
  const day = parseInt(dateParts[2], 10);
  const date = new Date(year, month, day);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const bodyDate = date.toLocaleDateString('en-US', options);

  const options2 = { year: 'numeric', month: '2-digit', day: '2-digit' };
  const newsDate = date.toLocaleDateString('en-US', options2).replace(/\//g, '.');

  card.innerHTML = `
        <div class="card-left">
          <div class="card-thumbnail">
            ${createOptimizedPicture(cardInfo.image, cardInfo.title, false, [{ width: 200 }]).outerHTML}
          </div>
          <div class="card-body">
            <a href="${cardInfo.path}">
                <h3>${cardInfo.title}</h3>
            </a>
            <p><span>${bodyDate}</span>${cardInfo.description}</p>
          </div>
        </div>
        <div class="card-right">
          <div class="news-date">
              <span>${newsDate}</span>
          </div>
        </div>
    `;
  container.append(card);
}

/**
 * Populates an events card with the provided card information and appends it to the specified container.
 */
function populateEventsCard(container, cardInfo) {
  cardInfo.dateRange = getDateRange(cardInfo.startDate, cardInfo.endDate);
  const card = document.createElement('div');
  card.className = 'card';
  const link = document.createElement('a');
  link.href = cardInfo.path;
  link.innerText = 'Learn More';

  card.innerHTML = `
        <div class="card-left">
          <div class="card-thumbnail">
            ${createOptimizedPicture(cardInfo.image, cardInfo.title, false, [{ width: 200 }]).outerHTML}
          </div>
          <div class="card-body">
            <h3>${cardInfo.title}</h3>
            <p>${cardInfo.description}</p>
            ${(cardInfo.type === 'upcoming' && cardInfo.path) ? link.outerHTML : ''}
          </div>
        </div>
        <div class="card-right">
        <div class="events-type">
              <span>${cardInfo.type}</span>
          </div>
          <div class="events-date">
              <span>${cardInfo.dateRange}</span>
          </div>
        </div>
    `;
  container.append(card);
}

/**
 * Populates a download card in the specified container with the given card information.
 */
function populateDownloadCard(container, cardInfo) {
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
        <div class="card-thumbnail">
                ${createOptimizedPicture(cardInfo.image, cardInfo.title, false, [{ width: imgWidth }]).outerHTML}
        </div>
        <div class="card-body">
                <h3>${cardInfo.title}</h3>
            <a href="${cardInfo.path}"><p>Read More</p></a>
        </div>
    `;
  container.append(card);
}

/**
 * Populates a award card in the specified container with the given card information (used in /site/company/awards-and-accolades page).
 */
function populateAwardsCard(container, cardInfo) {
  const card = document.createElement('div');
  card.className = 'card';
  const description = cardInfo.description?.split('|').map((item) => {
    const parts = item.split(':');
    if (parts.length > 1) {
      return `${parts[0]}: <strong>${parts[1]}</strong>`;
    }
    return item;
  }).join('<br>');
  card.innerHTML = `
        <div class="card-thumbnail">
                ${createOptimizedPicture(cardInfo.image, cardInfo.title, false, [{ width: imgWidth }]).outerHTML}
        </div>
        <div class="card-body">
                ${cardInfo.path ? `<a href="${cardInfo.path}"><h3>${cardInfo.title}</h3></a>` : `<h3>${cardInfo.title}</h3>`}
                <p>${description}</p>
        </div>
    `;
  container.append(card);
}

function populateReviewsCard(container, cardInfo) {
  const card = document.createElement('div');
  card.className = 'card';
  card.setAttribute('itemscope', '');
  card.setAttribute('itemtype', 'https://schema.org/Review');
  const productSchema = document.createElement('div');
  productSchema.style.display = 'none';
  productSchema.setAttribute('itemscope', '');
  productSchema.setAttribute('itemtype', 'https://schema.org/Product');
  // TODO: add properly escaped product URLs instead of /products
  productSchema.innerHTML = `
        <span itemprop="name">${cardInfo.Product}</span>
        <span itemprop="url">https://www.learninga-z.com/site/products</span>
    `;
  card.innerHTML = `
        <div class="testimonial-statement" itemprop="reviewBody">
            <p>${cardInfo.Testimonial}</p>
        </div>
        <div class="testimonial-customer" itemprop="author">
               --<b>${cardInfo.Name}</b>; ${cardInfo.Title}; ${cardInfo.State}
        </div>
    `;
  card.append(productSchema);
  container.append(card);
}

/** function to render card list when an array of card objects are passed.
 * this also supports pagination
*/
export async function renderCardList(wrapper, cards, limit = 9, type = 'card') {
  let limitPerPage = limit;
  if (limit === 0) {
    limitPerPage = cards.length;
  } else {
    limitPerPage = Number.isNaN(parseInt(limit, 10)) ? 10 : parseInt(limit, 10);
  }

  wrapper.innerHTML = '';
  if (!cards || cards.length === 0) {
    return;
  }
  const list = document.createElement('div');
  list.classList.add('cards-list');
  let currentPage = 1;
  const match = window.location.hash.match(/page=(\d+)/);
  if (match) {
    currentPage = Number.isNaN(parseInt(match[1], 10)) ? currentPage : parseInt(match[1], 10);
  }
  const totalPages = Math.ceil(cards.length / limitPerPage);
  const cardsList = cards.slice((currentPage - 1) * limitPerPage, currentPage * limitPerPage);

  cardsList.forEach((card) => {
    if (type === 'search') {
      populateSearchCard(wrapper, card);
    } else if (type === 'events') {
      populateEventsCard(wrapper, card);
    } else if (type === 'news') {
      populateNewsCard(wrapper, card);
    } else if (type === 'downloads') {
      populateDownloadCard(wrapper, card);
    } else if (type === 'awards') {
      populateAwardsCard(wrapper, card);
    } else if (type === 'circleImage') {
      populateCircleImageCard(wrapper, card);
    } else if (type === 'reviews') {
      populateReviewsCard(wrapper, card);
    } else {
      populateCard(wrapper, card, type);
    }
  });
  decorateExternalLinks(wrapper);

  if (totalPages > 1 && limit !== 0) {
    const paginationContainer = document.createElement('div');
    paginationContainer.classList.add('pagination-container');
    generatePagination(paginationContainer, currentPage, totalPages);
    wrapper.append(paginationContainer);
  }
}

/** function to get an array of card objects from indexData */
export function getCardObject(link) {
  const path = link?.getAttribute('href');
  const relPath = getRelativePath(path);
  return indexData.find((item) => item.path === relPath);
}

export default async function decorate(block) {
  let isDescription = true;
  const cardsWrapper = document.createElement('div');
  cardsWrapper.className = 'card-wrapper';
  let cardsArray = [];
  if (block.classList.contains('no-description')) isDescription = false;
  // check if the block is a circle image card block
  if (block.classList.contains('circle-image')) {
    await loadCSS(`${window.hlx.codeBasePath}/blocks/cards/cards-cirlce-image.css`);
    cardsArray = await getCircleCardsArray(block, indexData, isDescription);
    renderCardList(cardsWrapper, cardsArray, 0, 'circleImage');
  } else {
    const cardLinks = block.querySelectorAll('a');
    Array.from(cardLinks).map((cardLink) => {
      const card = getCardObject(cardLink);
      if (card) {
        card.isDescription = isDescription;
        cardsArray.push(card);
      }
      return card;
    });
    renderCardList(cardsWrapper, cardsArray, 0);
  }
  block.innerHTML = '';
  if (block.classList.contains('suggested-videos')) {
    await loadCSS(`${window.hlx.codeBasePath}/blocks/cards/cards-suggested-videos.css`);
    imgWidth = '200';
    const title = document.createElement('h3');
    title.innerHTML = 'Suggested Videos';
    block.append(title);
  } else {
    imgWidth = '750';
  }
  block.append(cardsWrapper);
}
