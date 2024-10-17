/* eslint-disable max-len */
import { getEventsListData } from '../../scripts/utils.js';
import { loadCSS } from '../../scripts/aem.js';
import { renderCardList } from '../cards/cards.js';

export default async function decorate(block) {
  await loadCSS(`${window.hlx.codeBasePath}/blocks/cards/cards.css`);
  const events = await getEventsListData();

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
  const eventsType = urlParams.get('EventSort');
  block.append(form);

  // events has date range like "Nov 19 - 21, 2027" take the enddate and compare with today's date and put it in upcoming or past arrays
  events.forEach((event) => {
    const date = event.dateRange.split(' - ')[1];
    const month = event.dateRange.split(' ')[0];
    //concatenate the month and date
    const endDate = `${month} ${date}`;
    console.log(endDate);
    const eventDate = new Date(date);
    const today = new Date();
    if (eventDate < today) {
      event.type = 'Past';
    } else {
      event.type = 'Upcoming';
    }
  });

  if (eventsType === 'Past') {
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
