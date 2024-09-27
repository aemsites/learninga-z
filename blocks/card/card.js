import { getRelativePath, getGenericIndexData } from '../../scripts/utils.js';
import { createOptimizedPicture } from '../../scripts/aem.js';

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

export default async function decorate(block) {
  const link = block.querySelector('a');
  const path = link ? link.getAttribute('href') : block.textContent.trim();
  const relPath = getRelativePath(path);
  const indexData = await getGenericIndexData();
  const cardInfo = indexData.find((item) => item.path === relPath);
  block.innerHTML = '';
  if (cardInfo) {
    populateCard(block, cardInfo);
  }
}
