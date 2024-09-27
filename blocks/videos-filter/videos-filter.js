/* eslint-disable max-len */
import { getVideosIndexData } from '../../scripts/utils.js';

export default async function decorate(block) {
  const videos = await getVideosIndexData();
  console.log(videos);
  const form = document.createElement('form');
  form.setAttribute('class', 'video-filter-form');
  form.setAttribute('method', 'get');
  form.innerHTML = `
      <div class="select-position">
      <select id="category" name="category" onchange="this.form.submit()">
        <option value="ShowAll" selected="selected">Show All</option>
        <option value="learninga-z">Learning A-Z</option>
        <option value="foundationsa-z">Foundations A-Z</option>
        <option value="razplus">Raz-Plus</option>
        <option value="razplus-connected-classroom">Raz-Plus Connected Classroom</option>
        <option value="readinga-z">Reading A-Z</option>
        <option value="raz-kids">Raz-Kids</option>
        <option value="sciencea-z">Science A-Z</option>
        <option value="writinga-z">Writing A-Z</option>
        <option value="vocabularya-z">Vocabulary A-Z</option>
        <option value="razplus-ell">Raz-Plus ELL</option>
        <option value="funding">Funding</option>
        <option value="testimonials">Testimonials</option>
        <option value="professional-learning">Professional Learning</option>
      </select>
      </div>
    `;

  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get('category');
  if (category) {
    form.querySelector(`option[value="${category}"]`).selected = true;
    const filteredVideos = videos.filter((video) => video.category.toLowerCase().includes(category));
    console.log('filteredVideos', filteredVideos);
  }

  block.append(form);
}
