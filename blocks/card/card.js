import { getRelativePath, getIndexData } from '../../scripts/utils.js';

export function populateCard(container, cardInfo) {
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
        <a href="${cardInfo.path}">
        <picture>
            <source srcset="${cardInfo.image}" media="(min-width: 750px)">
            <img src="${cardInfo.image}" alt="${cardInfo.title}">
        </picture>
        </a>
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
  const indexData = await getIndexData();
  const cardInfo = indexData.find((item) => item.path === relPath);
  block.innerHTML = '';
  if (cardInfo) {
    populateCard(block, cardInfo);
  }
}
