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
    const main = document.querySelector('ul.post-listing');
    const listOfAwards = [];
    const lis = main.querySelectorAll('li');
    lis.forEach((li) => {
      const img = li.querySelector('img');
      const title = li.querySelector('.award-listing-title');
      const desc = li.querySelector('.listing-description__inner p');
      let path1 = '';
      let img1 = '';
      let title1 = '';
      let desc1 = '';
      if (img) {
        img1 = img.getAttribute('data-msrc');
      }
      if (title) {
        const a = title.querySelector('a');
        if (a) {
          path1 = a.getAttribute('href');
          title1 = a.textContent.trim().replace(/\\n/g, '').replace(/<br>/g, '').trim();
        } else {
          title1 = title.textContent.trim().replace(/\\n/g, '').replace(/<br>/g, '').trim();
        }
      }
      if (desc) {
        const descText = desc.textContent.trim();
        const descArray = descText.split('\n');
        desc1 = descArray.map((d) => d.trim()).join('|');
      }
      listOfAwards.push({
        path: path1,
        title: title1,
        description: desc1,
        image: img1,
        date: Date.now(),
      });
    });

    // from eventsJson, remove objects with path === null or path contains '/site/company/events'
    // const filteredEvents = eventsJson.filter((event) => event.startDate !== '' && event.endDate !== '');
    // console.log(filteredEvents);

    // // in imageLinks, make it lowercase, replace () with  - and replace _ with -
    // const formattedImageLinks = imageLinks.map((image) => {
    //   const formattedImage = image.toLowerCase().replace('(', '-').replace(')', '').replace(/_/g, '-');
    //   return formattedImage;
    // });
    // console.log('formattedImageLinks : ', formattedImageLinks);

    return [{
      // do not return an element
      // element: main,
      path: new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, ''),
      report: {
        events: listOfAwards,
      },
    }];
  },
};
