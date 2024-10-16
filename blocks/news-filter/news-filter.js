/* eslint-disable max-len */
import { getNewsIndexData } from '../../scripts/utils.js';
import { loadCSS } from '../../scripts/aem.js';
import { renderCardList } from '../cards/cards.js';

export default async function decorate(block) {
  await loadCSS(`${window.hlx.codeBasePath}/blocks/cards/cards.css`);
  const news = await getNewsIndexData();

  const form = document.createElement('form');
  form.setAttribute('class', 'video-filter-form');
  form.setAttribute('method', 'get');
  form.innerHTML = `
        <div class="select-position">
        <select id="sortorder" name="sortorder" onchange="window.location.hash = 'page=1';this.form.submit();">
            <option value="NewestFirst" selected="selected">Sort By: Newest First</option>
            <option value="OldestFirst">Sort By: Oldest First</option>
            <option value="AlphaAZ">Sort By: A - Z</option>
            <option value="AlphaZA">Sort By: Z - A</option>
        </select>
        </div>
    `;

  const urlParams = new URLSearchParams(window.location.search);
  const sortOrder = urlParams.get('sortorder');
  block.append(form);
  if (sortOrder === 'OldestFirst') {
    news.reverse();
    form.querySelector('option[value="OldestFirst"]').selected = true;
  } else if (sortOrder === 'AlphaAZ') {
    news.sort((a, b) => a.title.localeCompare(b.title));
    form.querySelector('option[value="AlphaAZ"]').selected = true;
  } else if (sortOrder === 'AlphaZA') {
    news.sort((a, b) => b.title.localeCompare(a.title));
    form.querySelector('option[value="AlphaZA"]').selected = true;
  }
  const div = document.createElement('div');
  block.append(div);
  div.className = 'news-cards';
  renderCardList(div, news, 10, 'news');

  window.addEventListener('hashchange', async () => {
    renderCardList(div, news, 10, 'news');
  });
}
