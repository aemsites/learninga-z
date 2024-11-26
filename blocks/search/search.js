/* eslint-disable max-len */
import { getSiteIndexData } from '../../scripts/utils.js';
import { loadCSS } from '../../scripts/aem.js';
import { renderCardList } from '../cards/cards.js';
import { h1 } from '../../scripts/dom-helpers.js';

export default async function decorate(block) {
  await loadCSS(`${window.hlx.codeBasePath}/blocks/cards/cards.css`);
  const siteIndex = await getSiteIndexData();

  // Create a URL object
  const searchParams = new URLSearchParams(window.location.search);
  const searchTerm = searchParams.get('search');

  function filterSiteIndex(index, keyword) {
    return index.filter((item) => Object.values(item).some((value) => value && value.toString().toLowerCase().includes(keyword.toLowerCase()),));
  }

  const filteredResults = filterSiteIndex(siteIndex, searchTerm);

  const $h1 = h1(`Searching for "${searchTerm}"`);
  block.append($h1);

  const form = document.createElement('form');
  form.setAttribute('class', 'news-filter-form');
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
    filteredResults.reverse();
    form.querySelector('option[value="OldestFirst"]').selected = true;
  } else if (sortOrder === 'AlphaAZ') {
    filteredResults.sort((a, b) => a.title.localeCompare(b.title));
    form.querySelector('option[value="AlphaAZ"]').selected = true;
  } else if (sortOrder === 'AlphaZA') {
    filteredResults.sort((a, b) => b.title.localeCompare(a.title));
    form.querySelector('option[value="AlphaZA"]').selected = true;
  }
  const div = document.createElement('div');
  block.append(div);
  div.className = 'news-cards';
  renderCardList(div, filteredResults, 10, 'news');

  window.addEventListener('hashchange', async () => {
    renderCardList(div, filteredResults, 10, 'news');
  });
}
