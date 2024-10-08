/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

function isExternal(link) {
  let external = false;
  const href = link.getAttribute('href');
  if (href) {
    const notRelative = !href.startsWith('/') && !href.startsWith('#');
    const isLearningAZ = href.includes('learninga-z.com');
    if ((notRelative && (!isLearningAZ))) {
      external = true;
    }
  }
  return external;
}

/**
 * Converts a JSON array to a CSV string.
 * @param {Array<Object>} jsonArray - The JSON array to convert.
 * @returns {string} The CSV formatted string.
 */
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

function formatDate(date) {
  // convert date from 07.02.2024 to 2024-07-02
  const dateParts = date.split('.');
  return `${dateParts[2].trim()}-${dateParts[0].replace(/\D/g, '').padStart(2, '0')}-${dateParts[1].replace(/\D/g, '').padStart(2, '0')}`;
}

export default {
  /**
       * Apply DOM operations to the provided document and return
       * the root element to be then transformed to Markdown.
       * @param {HTMLDocument} document The document
       * @param {string} url The url of the page imported
       * @param {string} html The raw html (the document is cleaned up during preprocessing)
       * @param {object} params Object containing some parameters given by the import process.
       * @returns {HTMLElement} The root element to be transformed
       */
  transformDOM: ({
    // eslint-disable-next-line no-unused-vars
    document, url, html, params,
  }) => {
    const main = document.body.querySelector('.post-listing');
    const news = [];
    const newsItems = main.querySelectorAll(':scope>li');
    newsItems.forEach((newsItem) => {
      const descriptionSection = newsItem.querySelector('.listing-description__inner');
      const title = descriptionSection.querySelector('h4 a');
      const titleText = title ? title.textContent : '';
      const dateSection = newsItem.querySelector('.listing-date');
      const date = dateSection.textContent;
      const formattedDate = formatDate(date);
      const link = newsItem.querySelector('a');
      // remove <span> tags from the description
      let descriptionText = descriptionSection.querySelector('p').textContent;
      descriptionText = descriptionText.replace(/<span.*?>(.*?)<\/span>/g, '$1');
      descriptionText = descriptionText.replace(/\n/g, '');
      const text = descriptionText.split(' —  ')[1].trim();

      const img = newsItem.querySelector('img');
      if (isExternal(link)) {
        news.push({
          path: link.getAttribute('href'),
          title: titleText,
          date: formattedDate,
          description: text,
          image: img.getAttribute('data-msrc'),
        });
      }
    });
    console.log(jsonToCsv(news));
    return main;
  },

  /**
       * Return a path that describes the document being transformed (file name, nesting...).
       * The path is then used to create the corresponding Word document.
       * @param {HTMLDocument} document The document
       * @param {string} url The url of the page imported
       * @param {string} html The raw html (the document is cleaned up during preprocessing)
       * @param {object} params Object containing some parameters given by the import process.
       * @return {string} The path
       */
  generateDocumentPath: ({
    // eslint-disable-next-line no-unused-vars
    document, url, html, params,
  }) => WebImporter.FileUtils.sanitizePath(new URL(url).pathname.replace(/\.html$/, '').replace(/\/$/, '')),
};
