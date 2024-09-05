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

const fixUrl = (a) => {
  let href = a.getAttribute('href');
  const text = a.textContent;

  if (href.startsWith('/site/') || href.startsWith('/user_area/')) {
    href = `https://main--learninga-z--aemsites.hlx.page${href}`;
  }
  if (a.href === text) {
    a.textContent = href;
  }
  a.href = href;
  return a;
};

const convertHeading = (h4) => {
  const h2 = document.createElement('h2');
  h2.textContent = h4.textContent;
  h4.replaceWith(h2);
};

const addSectionBreaks = (main) => {
  const row = main.querySelector('.row');
  if (!row) {
    return;
  }
  // Add a section break after each child of the row
  // eslint-disable-next-line max-len
  const directChildren = Array.from(row.childNodes).filter((child) => child.nodeType === Node.ELEMENT_NODE);
  directChildren.slice(0, -1).forEach((child) => {
    const hr = document.createElement('hr');
    child.after(hr);
  });
};

const getProducts = (main) => {
  let products;
  const strongElements = main.querySelectorAll('strong');
  const researchAppliesTo = Array.from(strongElements).find((el) => el.textContent.includes('Research Applies to:'));
  if (researchAppliesTo) {
    const appliesTo = researchAppliesTo.parentElement.textContent.replace('Research Applies to:', '').trim();
    products = appliesTo;
    researchAppliesTo.parentElement.remove();
  }
  return products;
};

const getPubDate = (document) => {
  let pubDate;
  const metaElements = document.querySelectorAll('meta');
  const pubDateElement = Array.from(metaElements).find((el) => el.getAttribute('name') === 'pubdate');
  if (pubDateElement) {
    pubDate = pubDateElement.getAttribute('content');
    if (pubDate) {
      pubDate = pubDate.split(' ')[0];
      const dateParts = pubDate.split('/');
      pubDate = `${dateParts[2]}-${dateParts[0].padStart(2, '0')}-${dateParts[1].padStart(2, '0')}`;
    }
  }
  return pubDate;
};

const transformButtons = (main) => {
  const buttons = main.querySelectorAll('.rect-btn');
  buttons.forEach((button) => {
    //const color = Array.from(button.classList).find((className) => className.includes('btn-'))?.split('btn-')[1] || 'red';
   // button.textContent = `${button.textContent} {${color}}`;
    const strong = document.createElement('strong');
    strong.appendChild(button.cloneNode(true));
    button.replaceWith(strong);
  });
};

const createMetadataBlock = (main, document) => {
  const meta = {};

  // find the <title> element
  const title = document.querySelector('title');
  if (title) {
    meta.title = title.innerHTML.replace(/[\n\t]/gm, '');
  }

  // find the <meta property="og:description"> element
  const desc = document.querySelector('[property="og:description"]');
  if (desc) {
    meta.description = desc.content;
  }

  meta.products = getProducts(main);

  meta.date = getPubDate(document);

  meta.category = '';

  meta.tags = [];

  // helper to create the metadata block
  const block = WebImporter.Blocks.getMetadataBlock(document, meta);

  // append the block to the main element
  main.append(block);

  // returning the meta object might be usefull to other rules
  return meta;
};

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
    const main = document.body.querySelector('.main-content');
    main.querySelectorAll('a').forEach(fixUrl);
    main.querySelectorAll('h4').forEach(convertHeading);
    addSectionBreaks(main);
    transformButtons(main);
    createMetadataBlock(main, document);
    WebImporter.DOMUtils.remove(main, [
      'noscript',
    ]);
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
