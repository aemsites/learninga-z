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
  const primaryButtons = main.querySelectorAll('.btn.rect-btn');
  primaryButtons.forEach((button) => {
    const p = document.createElement('p');
    const strong = document.createElement('strong');
    strong.appendChild(button.cloneNode(true));
    p.appendChild(strong);
    button.replaceWith(p);
  });

  const secondaryButtons = main.querySelectorAll('.btn:not(.rect-btn)');
  secondaryButtons.forEach((button) => {
    const p = document.createElement('p');
    const em = document.createElement('em');
    em.appendChild(button.cloneNode(true));
    p.appendChild(em);
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
    const title = main.querySelector('h1');
    const image = main.querySelector('.post-content img');
    if (image) {
      const img = document.createElement('img');
      img.src = `https://www.learninga-z.com/${image.getAttribute('data-msrc')}`;
      img.alt = image.alt ? image.alt : title.textContent;
      image.replaceWith(img);
    }
    const subHeading = main.querySelector('.sub-heading');
    if (subHeading) {
      const h2 = document.createElement('h2');
      h2.textContent = subHeading.textContent;
      subHeading.replaceWith(h2);
    }

    const hr = document.createElement('hr');
    main.append(hr);

    const relatedBlogWrapper = main.querySelector('.breakroom-posts-section');
    if (relatedBlogWrapper) {
      const relatedBlogsCells = [
        ['Related Posts'],
        [relatedBlogWrapper.querySelector('ul')],
      ];
      const relatedBlogsTable = WebImporter.DOMUtils.createTable(relatedBlogsCells, document);
      main.append(relatedBlogsTable);
      relatedBlogWrapper.remove();
    }

    const suggestedVideos = main.querySelector('.related-resources-section');
    if (suggestedVideos && suggestedVideos.querySelector('ul.post-listing')) {
      const div = document.createElement('div');
      suggestedVideos.querySelector('ul.post-listing').querySelectorAll('a').forEach((a) => {
        a.textContent = a.href;
        const p1 = document.createElement('p');
        p1.appendChild(a);
        div.appendChild(p1);
      });
      const suggestedVideosCells = [
        ['Cards (Suggested Videos)'],
        [div],
      ];
      const suggestedVideosTable = WebImporter.DOMUtils.createTable(suggestedVideosCells, document);
      main.append(suggestedVideosTable);
      suggestedVideos.remove();
    }

    const generalCallouts = main.querySelectorAll('.general-callout-section');
    const div = document.createElement('div');
    generalCallouts.forEach((generalCallout) => {
      const cardLink = generalCallout.querySelector('a');
      cardLink.textContent = cardLink.href;
      const p2 = document.createElement('p');
      p2.appendChild(cardLink);
      div.appendChild(p2);
      generalCallout.remove();
    });
    if (div.children.length > 0) {
      const calloutCells = [
        ['Cards'],
        [div],
      ];
      const calloutTable = WebImporter.DOMUtils.createTable(calloutCells, document);
      main.append(calloutTable);
    }

    main.querySelectorAll('a').forEach(fixUrl);
    // main.querySelectorAll('h4').forEach(convertHeading);
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
