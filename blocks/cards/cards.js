/* eslint-disable max-len */
import { getRelativePath, getGenericIndexData } from '../../scripts/utils.js';
import { createOptimizedPicture } from '../../scripts/aem.js';

const indexData = await getGenericIndexData();

export function populateCard(container, cardInfo) {
  const card = document.createElement('div');
  let efficacyBadge = '';
  if (cardInfo.efficacy) {
    efficacyBadge = `<span class="efficacy-badge ${cardInfo.efficacy}"><i class="flag"><span class="sr-only">Flag</span></i><p>${cardInfo.efficacy.charAt(0).toUpperCase() + cardInfo.efficacy.slice(1)}</p></span>`;
  }
  card.className = 'card';
  card.innerHTML = `
        <div class="card-thumbnail">
        <a href="${cardInfo.path}">
        ${createOptimizedPicture(cardInfo.image, cardInfo.title, false, [{ width: '750' }]).outerHTML}
        <button type="button" aria-label="Play video" class="video-playbtn"></button>
        ${efficacyBadge}
        </a>
        </div>
        <div class="card-body">
        <a href="${cardInfo.path}">
            <h3>${cardInfo.title}</h3>
         </a>
            <a href="${cardInfo.path}"><p>${cardInfo.description}</p></a>
       
        </div>
    `;
  container.append(card);
}

function renderCard(wrapper, link) {
  const path = link ? link.getAttribute('href') : wrapper.textContent.trim();
  const relPath = getRelativePath(path);
  const cardInfo = indexData.find((item) => item.path === relPath);
  if (cardInfo) {
    const card = document.createElement('div');
    populateCard(card, cardInfo);
    wrapper.append(card);
  }
}

export default function decorate(block) {
  const title = block.querySelector('h3');
  const cardLinks = block.querySelectorAll('a');
  const cardsWrapper = document.createElement('div');
  cardsWrapper.className = 'card-wrapper';
  block.innerHTML = '';
  Array.from(cardLinks).map(async (cardLink) => renderCard(cardsWrapper, cardLink));
  if (title) {
    block.append(title);
  }
  block.append(cardsWrapper);
}
