/* eslint-disable max-len */
/**
 * Converts a JSON array to a CSV string.
 * @param {Array<Object>} jsonArray - The JSON array to convert.
 * @returns {string} The CSV formatted string.
 */
import { eventsJson, imageLinks } from './events.mjs';

const jsonToCsv = (jsonArray) => {
  if (!jsonArray.length) {
    return '';
  }

  // Extract headers
  const headers = Object.keys(jsonArray[0]);
  const csvRows = [];

  // Add headers to CSV
  csvRows.push(headers.join(','));

  // Add rows to CSV
  jsonArray.forEach((obj) => {
    const values = headers.map((header) => {
      const escaped = (`${obj[header]}`).replace(/"/g, '\\"');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  });

  return csvRows.join('\n');
};

export default {
  transform: ({ document, params }) => {
    const main = document.querySelector('.event-listing-section');
    const listOfEvents = [];
    const lis = main.querySelectorAll('li');
    lis.forEach((li) => {
      const img = li.querySelector('img');
      const title = li.querySelector('.listing-title');
      const path = li.querySelector('a');
      const desc = li.querySelector('.listing-description__inner p');
      const dateRange = li.querySelector('.listing-date');
      let path1 = '';
      let img1 = '';
      let title1 = '';
      let desc1 = '';
      let dateRange1 = '';

      if (path) {
        path1 = path.getAttribute('href');
        path.remove();
      }
      if (img) {
        img1 = img.getAttribute('data-msrc');
      }
      if (title) {
        title1 = title.textContent;
      }
      if (desc) {
        desc1 = desc.textContent.replace(/\\n/g, '').replace(/<br>/g, '').trim();
      }
      if (dateRange) {
        dateRange1 = dateRange.textContent.replace(/\\n/g, '').replace(/<br>/g, '').trim();
      }
      listOfEvents.push({
        path: path1,
        image: img1,
        title: title1,
        description: desc1,
        dateRange: dateRange1,
      });
    });

    // from eventsJson, remove objects with path === null or path contains '/site/company/events'
    const filteredEvents = eventsJson.filter((event) => event.path !== null && !event.path.includes('/site/company/events'));
    //console.log(filteredEvents);

    // in imageLinks, make it lowercase, replace () with  - and replace _ with -
    const formattedImageLinks = imageLinks.map((image) => {
      const formattedImage = image.toLowerCase().replace('(', '-').replace(')', '').replace(/_/g, '-');
      return formattedImage;
    });
    console.log('formattedImageLinks : ', formattedImageLinks);

    return [{
      // do not return an element
      // element: main,
      path: new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, ''),
      report: {
        events: listOfEvents,
      },
    }];
  },
};
