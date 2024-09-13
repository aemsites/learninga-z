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
    const p = document.createElement('p');
    const strong = document.createElement('strong');
    strong.appendChild(button.cloneNode(true));
    p.appendChild(strong);
    button.replaceWith(p);
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

  meta.date = getPubDate(document);

  // helper to create the metadata block
  const block = WebImporter.Blocks.getMetadataBlock(document, meta);

  // append the block to the main element
  main.append(block);

  // returning the meta object might be usefull to other rules
  return meta;
};

const createColumnBlock = (authorContainer) => {
  const img = authorContainer.querySelector('img');
  const imgEl = document.createElement('img');
  if (!img) {
    imgEl.src = 'http://localhost:3000/icons/author-placeholder.png';
    imgEl.alt = 'author placeholder';
  } else {
    const dataMsrc = img.getAttribute('data-msrc');
    imgEl.src = dataMsrc;
    imgEl.alt = img.alt;
    img.remove();
  }

  const firstChild = authorContainer.children[0];

  // get second child div of authorContainer
  const secondChild = authorContainer.children[1];
  const authorDescription = (secondChild ? secondChild.querySelector('p') : undefined) ? secondChild.querySelector('p') : ' ';

  const cells = [
    ['Columns'],
    [imgEl, firstChild, authorDescription],
  ];
  const table = WebImporter.DOMUtils.createTable(cells, document);
  return table;
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
    const main = document.querySelector('.main-content');
    // get sibling of .main-content with class .row
    const authorContainer = main.previousElementSibling;
    if (!authorContainer.classList.contains('row')) return undefined;

    console.log('authorContainer', authorContainer);
    const authorTitle = authorContainer.querySelector('h1');
    authorContainer.querySelector('h1').remove();
    authorContainer.querySelectorAll('a').forEach(fixUrl);
    transformButtons(authorContainer);
    const columnsTable = createColumnBlock(authorContainer);
    authorContainer.replaceChildren(authorTitle);
    authorContainer.appendChild(columnsTable);
    createMetadataBlock(authorContainer, document);
    WebImporter.DOMUtils.remove(authorContainer, [
      'noscript',
    ]);
    return authorContainer;
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
