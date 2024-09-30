/* eslint-disable max-len */
import { getVideosIndexData, generatePagination } from '../../scripts/utils.js';
import { populateCard } from '../cards/cards.js';
import { loadCSS } from '../../scripts/aem.js';

export async function renderPage(wrapper, cards, limit = 9) {
  wrapper.innerHTML = '';
  let pageSize = 10;
  if (!cards || cards.length === 0) {
    return;
  }
  const limitPerPage = Number.isNaN(parseInt(limit, 10)) ? 10 : parseInt(limit, 10);
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
  let totalPages;
  let cardsList;
  /* articlesCount is passed when full list of articles are not passed.
     * This is needed for pagination.
     */
  totalPages = Math.ceil(cards.length / pageSize);
  cardsList = cards.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  cardsList.forEach((video) => {
    populateCard(wrapper, video);
  });

  if (totalPages > 1) {
    const paginationContainer = document.createElement('div');
    paginationContainer.classList.add('pagination-container');
    paginationContainer.appendChild(generatePagination(currentPage, totalPages));
    wrapper.append(paginationContainer);
  }
}

export default async function decorate(block) {
  await loadCSS(`${window.hlx.codeBasePath}/blocks/cards/cards.css`);

  const videos = await getVideosIndexData();
  // extracting unique category as an array from videos
  const categories = new Map();
  videos.forEach((video) => {
    video.category.split(',').forEach((cat) => {
      if (cat) {
        const key = cat.toLowerCase().trim().replaceAll(' ', '-');
        const value = cat.trim();
        categories.set(key, value);
      }
    });
  });
  const form = document.createElement('form');
  form.setAttribute('class', 'video-filter-form');
  form.setAttribute('method', 'get');
  form.innerHTML = `
      <div class="select-position">
      <select id="category" name="category" onchange="this.form.submit()">
        <option value="show-all" selected="selected">Show All</option>
        ${[...categories].map(([key, value]) => `<option value="${key}">${value}</option>`).join('')}
      </select>
      </div>
    `;

  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get('category');
  block.append(form);
  let filteredVideos = [];
  if (category && category !== 'show-all') {
    if (form.querySelector(`option[value="${category}"]`)) {
      form.querySelector(`option[value="${category}"]`).selected = true;
    }
    filteredVideos = videos.filter((video) => video.category.toLowerCase().trim().replaceAll(' ', '-').includes(category));
  } else {
    filteredVideos = videos;
  }
  const div = document.createElement('div');
  block.append(div);
  div.className = 'cards';
  renderPage(div, filteredVideos);

  window.addEventListener('hashchange', async () => {
    renderPage(div, filteredVideos);
  });
}
