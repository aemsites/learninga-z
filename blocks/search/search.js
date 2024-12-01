/* eslint-disable max-len */
import { getSiteSearchIndexData } from '../../scripts/utils.js';
import { loadCSS } from '../../scripts/aem.js';
import { renderCardList } from '../cards/cards.js';
import { div, form } from '../../scripts/dom-helpers.js';

export default async function decorate(block) {
  await loadCSS(`${window.hlx.codeBasePath}/blocks/cards/cards.css`);
  const siteIndex = await getSiteSearchIndexData();
  const searchParams = new URLSearchParams(window.location.search);
  const searchQuery = searchParams.get('search');
  const filterQuery = searchParams.get('filter');

  function filterSiteIndex(index, search, filter) {
    return index.filter((item) => {
      const searchMatch = Object.values(item).some((value) => value && value.toString().toLowerCase().includes(search.toLowerCase()));
      const filterMatch = !filter || (item.path && item.path.toLowerCase().includes(filter.toLowerCase()));
      return searchMatch && filterMatch;
    });
  }

  let searchResults = filterSiteIndex(siteIndex, searchQuery, filterQuery);

  const $form = form({ class: 'search', method: 'get' });
  $form.innerHTML = `
    <h2>Searching for "${searchQuery}"</h2>
    <div class="right">
      <h3>Filter by:</h3>
      <select id="filter" name="filter">
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

  // set the currently selected filter in the dropdown
  const filterSelect = $form.querySelector('#filter');
  if (filterQuery) filterSelect.value = filterQuery;

  const $search = div({ class: 'search-cards' });
  block.append($form, $search);

  await renderCardList($search, searchResults, 10, 'search');

  // Handle filter change
  filterSelect.addEventListener('change', (event) => {
    // Update the URL with the new filter value
    const newFilter = event.target.value;
    searchParams.set('filter', newFilter);
    window.history.pushState({}, '', `${window.location.pathname}?${searchParams.toString()}`);

    // reapply the filter and search term to fetch new results
    searchResults = filterSiteIndex(siteIndex, searchQuery, newFilter);
    renderCardList($search, searchResults, 10, 'search');
  });

  // listen for hash changes (e.g., when pagination changes)
  window.addEventListener('hashchange', async () => {
    await renderCardList($search, searchResults, 10, 'search');
  });
}
