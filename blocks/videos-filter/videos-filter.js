/* eslint-disable max-len */
import { getVideosIndexData } from '../../scripts/utils.js';
import { loadCSS } from '../../scripts/aem.js';
import { renderCardList } from '../cards/cards.js';

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
        <select id="category" name="category" onchange="window.location.hash = 'page=1';this.form.submit();">
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
  renderCardList(div, filteredVideos);

  window.addEventListener('hashchange', async () => {
    renderCardList(div, filteredVideos);
  });
}
