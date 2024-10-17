/* eslint-disable max-len */
import { getEventsListData } from '../../scripts/utils.js';
import { loadCSS } from '../../scripts/aem.js';
import { renderCardList } from '../cards/cards.js';

export default async function decorate(block) {
  await loadCSS(`${window.hlx.codeBasePath}/blocks/cards/cards.css`);
  const events = await getEventsListData();
  console.log(events);

  const form = document.createElement('form');
  form.setAttribute('class', 'events-filter-form');
  form.setAttribute('method', 'get');
  form.innerHTML = `
        <div class="select-position">
        <select id="sortorder" name="EventSort" onchange="window.location.hash = 'page=1';this.form.submit();">
            <option value="upcoming" selected="selected">Upcoming</option>
            <option value="past">Past</option>
        </select>
        </div>
    `;

  const urlParams = new URLSearchParams(window.location.search);
  const evetsType = urlParams.get('EventSort');
  block.append(form);
  if (evetsType === 'Past') {
    events.reverse();
    form.querySelector('option[value="past"]').selected = true;
  } else {
    form.querySelector('option[value="upcoming"]').selected = true;
  }
  const div = document.createElement('div');
  block.append(div);
  div.className = 'events-cards';
  renderCardList(div, events, 10, 'events');

  window.addEventListener('hashchange', async () => {
    renderCardList(div, events, 10, 'events');
  });
}
