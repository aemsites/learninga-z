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

import { videos, videoThumbnails } from './videos-data.mjs';

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
  const primaryButtons = main.querySelectorAll('.rect-btn');
  primaryButtons.forEach((button) => {
    const p = document.createElement('p');
    const strong = document.createElement('strong');
    strong.appendChild(button.cloneNode(true));
    p.appendChild(strong);
    button.replaceWith(p);
  });

  const secondaryButtons = main.querySelectorAll('.btn');
  secondaryButtons.forEach((button) => {
    const p = document.createElement('p');
    const em = document.createElement('em');
    em.appendChild(button.cloneNode(true));
    p.appendChild(em);
    button.replaceWith(p);
  });
};

const getCategory = (url) => {
  url = url.split('https://www.learninga-z.com/').pop();
  // filter videos array to get object with 'Videosundercategory' property contains url then, return 'Videocategories' property if it exists else empty string.
  const videoArray = videos.filter((video) => video.Videosundercategory.includes(url));
  return videoArray.length > 0 ? videoArray[0].Videocategories : '';
};

const getVideoThumbnail = (url) => {
  url = url.split('https://www.learninga-z.com/').pop();
  // filter videoThumbnails array to get object with 'href' property contains url then, return 'src' property if it exists else undefined.
  const videoThumbnail = videoThumbnails.filter((video) => video.href.includes(url));
  return videoThumbnail.length > 0 ? videoThumbnail[0].src : undefined;
};

const createMetadataBlock = (main, document, url) => {
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

  meta.category = getCategory(url);

  const image = getVideoThumbnail(url) ? getVideoThumbnail(url) : document.querySelector('meta[property="og:image"]').content;

  const el = document.createElement('img');
  el.src = image;
  meta.image = el;

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
    console.log(url, '  ', params.originalURL);
    const main = document.body.querySelector('.main-content');
    const p = main.querySelector('p');
    const videoFrame = main.querySelector('#laz-video-frame');
    if (p && p.nextElementSibling && p.nextElementSibling.id === 'laz-video-frame') {
      const h2 = document.createElement('h2');
      h2.textContent = p.textContent;
      p.replaceWith(h2);
    }

    if (videoFrame) {
      const videoLink = document.createElement('a');
      const videoIframe = videoFrame.querySelector('iframe');
      if (videoIframe) {
        videoLink.href = videoIframe.getAttribute('src');
        videoLink.textContent = videoIframe.getAttribute('src');
      }
      videoFrame.replaceWith(videoLink);
    }

    if (main.querySelector('.tab-pane#transcript') && main.querySelector('.tab-pane#overview')) {
      const cells = [
        ['Tabs'],
        ['Overview', main.querySelector('.tab-pane#overview') ? main.querySelector('.tab-pane#overview').innerHTML : ''],
        ['Transcript', main.querySelector('.tab-pane#transcript') ? main.querySelector('.tab-pane#transcript').innerHTML : ''],
      ];
      const table = WebImporter.DOMUtils.createTable(cells, document);
      main.append(table);
      main.querySelector('.post-content').remove();
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
      const title = document.createElement('h3');
      const div = document.createElement('div');
      title.textContent = suggestedVideos.querySelector('h4').textContent;
      div.appendChild(title);
      suggestedVideos.querySelector('ul.post-listing').querySelectorAll('a').forEach((a) => {
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

    const generalCallout = main.querySelector('.general-callout-section');
    if (generalCallout) {
      const cardLink = generalCallout.querySelector('a');
      cardLink.textContent = cardLink.href;
      const calloutCells = [
        ['Card'],
        [cardLink],
      ];
      const calloutTable = WebImporter.DOMUtils.createTable(calloutCells, document);
      main.append(calloutTable);
      generalCallout.remove();
    }

    main.querySelectorAll('a').forEach(fixUrl);
    main.querySelectorAll('h4').forEach(convertHeading);
    transformButtons(main);
    createMetadataBlock(main, document, params.originalURL);
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
