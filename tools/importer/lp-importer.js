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

  const image = document.querySelector('meta[property="og:image"]').content.split('https://www.learninga-z.com').pop();

  const el = document.createElement('img');
  el.src = image;
  meta.image = el;

  meta.date = getPubDate(document);

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
    const main = document.querySelector('.main-content');
    const hero = document.querySelector('.lp-banner');
    const footerWidgets = document.querySelector('.footer-widgets');
    if (hero) {
      // const heroContent = hero.querySelector('.slide-content_left');
      // const h3 = heroContent.querySelector('h3');
      // const p = document.createElement('p');
      // const em = document.createElement('em');
      // em.innerText = h3.textContent;
      // p.appendChild(em);
      // h3.replaceWith(p);
      // //append hero content after hero
      // main.prepend(heroContent);
      main.prepend(hero.cloneNode(true));
    }
    if (footerWidgets) main.appendChild(footerWidgets.cloneNode(true));
    const subHeading = main.querySelector('.sub-heading');
    const breakroomTile = main.querySelector('.breakroom-tile');
    if (subHeading) {
      const strong = document.createElement('strong');
      strong.appendChild(subHeading.cloneNode(true));
      subHeading.replaceWith(strong);
    }

    const related = main.querySelector('.related');
    const generalCallout = related?.querySelectorAll('.general-callout-section');
    const div = document.createElement('div');
    if (generalCallout) {
      generalCallout.forEach((callout) => {
        const p = document.createElement('p');
        const link = callout.querySelector('a');
        const anchor = document.createElement('a');
        if (link) {
          const u = new URL(link.href, url);
          anchor.href = `https://main--learninga-z--aemsites.hlx.page${u.pathname}`;
          anchor.textContent = anchor.href;
        }
        p.appendChild(anchor);
        div.appendChild(p);
      });
      // if div has children, replace generalCallout with a table
      // with name Cards and the children as rows
      if (div.children.length > 0) {
        const cells = [['Cards'], [div.innerHTML]];
        const table = WebImporter.DOMUtils.createTable(cells, document);
        generalCallout.forEach((callout) => {
          related.replaceWith(table);
        });
      }
    }

    const rows = main.querySelectorAll('.row');
    rows.forEach((row) => {
      if (row.children.length > 1 && [...row.children].some((child) => child.className.includes('col-'))) {
        const cells = [
          ['Columns'],
          [...row.children].map((child) => [child]),
        ];
        row.replaceWith(WebImporter.DOMUtils.createTable(cells, document));
      }
    });

    if (breakroomTile) {
      const cells = [
        ['Callout (center)'],
        [breakroomTile.innerHTML],
      ];
      const table = WebImporter.DOMUtils.createTable(cells, document);
      breakroomTile.replaceWith(table);
    }

    main.querySelectorAll('a').forEach(fixUrl);
    main.querySelectorAll('iframe').forEach((frame) => {
      if ((frame.src.includes('youtu') || frame.src.includes('vimeo') || frame.src.includes('go.learninga-z.com'))) {
        const a = document.createElement('a');
        a.href = frame.src;
        a.textContent = frame.src;
        frame.replaceWith(a);
      }
    });

    main.querySelectorAll('form').forEach((form) => {
      if (form.action.includes('go.learninga-z.com')) {
        const a = document.createElement('a');
        a.href = form.action;
        a.textContent = form.action;
        form.replaceWith(a);
      }
    });
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
