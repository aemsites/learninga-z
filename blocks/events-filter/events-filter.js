/* eslint-disable max-len */
import { getEventsListData } from '../../scripts/utils.js';
import { loadCSS } from '../../scripts/aem.js';
import { renderCardList } from '../cards/cards.js';

function serialDateToFormattedDate(serial) {
  const epoch = new Date(1900, 0, 1); // January 1, 1900
  const days = serial - 2; // Excel's serial date system starts at 1
  epoch.setDate(epoch.getDate() + days);

  return epoch.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default async function decorate(block) {
  await loadCSS(`${window.hlx.codeBasePath}/blocks/cards/cards.css`);
  const events = await getEventsListData();

  const form = document.createElement('form');
  form.setAttribute('class', 'events-filter-form');
  form.setAttribute('method', 'get');
  form.innerHTML = `
        <div class="select-position">
        <select id="eventssort" name="EventSort" onchange="window.location.hash = 'page=1';this.form.submit();">
            <option value="upcoming" selected="selected">Upcoming</option>
            <option value="past">Past</option>
        </select>
        </div>
    `;

  const urlParams = new URLSearchParams(window.location.search);
  const eventsType = urlParams.get('EventSort');
  block.append(form);

  const pastEvents = [];
  const upcomingEvents = [];
  const today = new Date();
  events.forEach((event) => {
    const endDate = new Date(serialDateToFormattedDate(event.endDate));
    event.startDate = new Date(serialDateToFormattedDate(event.startDate));
    event.endDate = endDate;
    // compare date with today's date ignoring time
    if (endDate.setHours(0, 0, 0, 0) < today.setHours(0, 0, 0, 0)) {
      event.type = 'past';
      pastEvents.push(event);
    } else {
      event.type = 'upcoming';
      upcomingEvents.push(event);
    }
  });

  const div = document.createElement('div');
  block.append(div);
  div.className = 'events-cards';

  if (eventsType === 'past') {
    form.querySelector('option[value="past"]').selected = true;
    renderCardList(div, pastEvents, 10, 'events');
  } else {
    form.querySelector('option[value="upcoming"]').selected = true;
    renderCardList(div, upcomingEvents, 10, 'events');
  }

  window.addEventListener('hashchange', async () => {
    if (eventsType === 'past') {
      renderCardList(div, pastEvents, 10, 'events');
    } else {
      renderCardList(div, upcomingEvents, 10, 'events');
    }
  });
}
