/* eslint-disable max-len */
import { getSiteIndexData } from '../../scripts/utils.js';
import { loadCSS } from '../../scripts/aem.js';
import { renderCardList } from '../cards/cards.js';
import { div, form } from '../../scripts/dom-helpers.js';

export default async function decorate(block) {
  await loadCSS(`${window.hlx.codeBasePath}/blocks/cards/cards.css`);
  const siteIndex = await getSiteIndexData();

  // Create a URL object
  const searchParams = new URLSearchParams(window.location.search);
  const searchTerm = searchParams.get('search');
  const filter = searchParams.get('filter');
  console.log(filter);

  function filterSiteIndex(index, keyword) {
    return index.filter((item) => Object.values(item).some((value) => value && value.toString().toLowerCase().includes(keyword.toLowerCase()),));
  }

  const filteredResults = filterSiteIndex(siteIndex, searchTerm);

  const $form = form({ class: 'search', method: 'get' });
  $form.innerHTML = `
    <h2>Searching for "${searchTerm}"</h2>
    <div class="right">
      <h3>Filter by:</h3>
      <select id="filter" name="filter" onchange="window.location.hash = 'page=1';this.form.submit();">
          <option value="">Show All Content</option>
          <option value="general">General</option>
          <option value="news">Company News</option>
          <option value="products">Products</option>
          <option value="videos">Videos</option>
          <option value="breakroom">Breakroom Post</option>
          <option value="funding-and-grants">Funding and Grants</option>
          <option value="download-library">Download Library</option>
          <option value="professional-development">Professional Development</option>
          <option value="research">Research</option>            
      </select>
    </div>
  `;

  const $search = div({ class: 'search-cards' });
  block.append($form, $search);

  renderCardList($search, filteredResults, 10, 'news');

  window.addEventListener('hashchange', async () => {
    renderCardList($search, filteredResults, 10, 'news');
  });
}
