/* eslint-disable max-len */
import { getReviews } from '../../scripts/utils.js';
import { loadCSS } from '../../scripts/aem.js';
import { renderCardList } from '../cards/cards.js';
import { STATES } from '../../scripts/constants.js';

export default async function decorate(block) {
  await loadCSS(`${window.hlx.codeBasePath}/blocks/cards/cards.css`);
  const reviews = await getReviews();
  // in reviews, replace state with full state name from STATES
  reviews.forEach((review) => {
    review.State = STATES[review.State] ? STATES[review.State] : review.State;
  });

  // from reviews, get all unique products
  const products = [...new Set(reviews.flatMap((review) => review.Product.split(',')))].sort();
  const countries = [...new Set(reviews.map((review) => review.Country))].sort();

  const form = document.createElement('form');
  form.setAttribute('class', 'news-filter-form');
  form.setAttribute('method', 'get');
  form.innerHTML = `
        <div class="form-container">
        <select id="sortByProducts" name="sortByProducts" onchange="window.location.hash = 'page=1';this.form.submit();">
            <option value="showAllProducts" selected="selected">Show all products</option>
            ${products.map((product) => `<option value="${product}">${product}</option>`).join('')}
        </select>
        <select id="sortByLocation" name="sortByLocation" onchange="window.location.hash = 'page=1';this.form.submit();">
            <option value="showAllCountries" selected="selected">Show all countries</option>
            ${countries.map((country) => `<option value="${country}">${country}</option>`).join('')}
        </select>
        </div>
    `;

  const urlParams = new URLSearchParams(window.location.search);
  const sortByLocation = urlParams.get('sortByLocation');
  const sortByProducts = urlParams.get('sortByProducts');
  const sortByStates = urlParams.get('sortByStates');
  let filteredReviews = reviews;
  if (sortByLocation && sortByLocation !== 'showAllCountries') {
    filteredReviews = filteredReviews.filter((review) => review.Country === sortByLocation);
    form.querySelector(`option[value="${sortByLocation}"]`).setAttribute('selected', 'selected');
    form.querySelector('option[value="showAllCountries"]').removeAttribute('selected');
    const formContainer = form.querySelector('.form-container');
    // add a states dropdown
    const states = [...new Set(filteredReviews.map((review) => review.State))].sort();
    formContainer.innerHTML += `
        <select id="sortByStates" name="sortByStates" onchange="window.location.hash = 'page=1';this.form.submit();">
            <option value="showAllStates" selected="selected">Show all states</option>
            ${states.map((state) => `<option value="${state}">${state}</option>`).join('')}
        </select>
    `;
  }
  if (sortByProducts && sortByProducts !== 'showAllProducts') {
    filteredReviews = filteredReviews.filter((review) => review.Product.includes(sortByProducts));
    form.querySelector(`option[value="${sortByProducts}"]`).setAttribute('selected', 'selected');
    form.querySelector('option[value="showAllProducts"]').removeAttribute('selected');
  }
  if (sortByStates && sortByStates !== 'showAllStates') {
    filteredReviews = filteredReviews.filter((review) => review.State === sortByStates);
    form.querySelector(`option[value="${sortByStates}"]`).setAttribute('selected', 'selected');
    form.querySelector('option[value="showAllStates"]').removeAttribute('selected');
  }

  block.append(form);
  const div = document.createElement('div');
  block.append(div);
  div.className = 'reviews-cards';
  renderCardList(div, filteredReviews, 10, 'reviews');

  window.addEventListener('hashchange', async () => {
    renderCardList(div, filteredReviews, 10, 'reviews');
  });
}
