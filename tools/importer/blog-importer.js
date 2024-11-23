/* eslint-disable max-len */
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

import { blogs, blogVideos, blogAuthors } from './blogs-data.mjs';

let wideTemplate = false;

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
  const secondaryButtons = main.querySelectorAll('.btn:not(.rect-btn)');
  secondaryButtons.forEach((button) => {
    const p = document.createElement('p');
    const em = document.createElement('em');
    const btnClasses = button.className.split(' ').filter((c) => c.startsWith('btn-'));
    if (btnClasses.length > 0) {
      const text = button.textContent;
      const btnClass = btnClasses[0];
      const btnText = btnClass.trim().replace('btn-', '');
      if (btnText && btnText !== 'white-border') {
        if (btnText === 'navy-blue') {
          button.textContent = `${text} {navy}`;
        } else if (btnText === 'orange-red') {
          button.textContent = `${text} {orange}`;
        } else {
          button.textContent = `${text} {${btnText}}`;
        }
        button.textContent = `${text} {${btnText === 'navy-blue' ? 'navy' : btnText}}`;
      } else {
        button.textContent = text;
      }
    }
    em.appendChild(button.cloneNode(true));
    p.appendChild(em);
    button.replaceWith(p);
  });

  const primaryButtons = main.querySelectorAll('.rect-btn');
  primaryButtons.forEach((button) => {
    if (button.className.includes('btn-white-border')) { // this is a secondary button
      const p = document.createElement('p');
      const em = document.createElement('em');
      const btnClasses = button.className.split(' ').filter((c) => c.startsWith('btn-'));
      if (btnClasses.length > 0) {
        const text = button.textContent;
        const btnClass = btnClasses[0];
        const btnText = btnClass.trim().replace('btn-', '');
        if (btnText && btnText !== 'white-border') {
          button.textContent = `${text} {${btnText === 'navy-blue' ? 'navy' : btnText}}`;
        } else {
          button.textContent = text;
        }
      }
      em.appendChild(button.cloneNode(true));
      p.appendChild(em);
      button.replaceWith(p);
    } else {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      // if button has a class starting with btn- ,  add remaining part of class to the button text wrapped in {{}}
      const btnClasses = button.className.split(' ').filter((c) => c.startsWith('btn-'));
      if (btnClasses.length > 0) {
        const text = button.textContent;
        const btnClass = btnClasses[0];
        const btnText = btnClass.trim().replace('btn-', '');
        button.textContent = `${text} {${btnText === 'navy-blue' ? 'navy' : btnText}}`;
      }
      strong.appendChild(button.cloneNode(true));
      p.appendChild(strong);
      button.replaceWith(p);
    }
  });
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

  const image = document.querySelector('meta[property="og:image"]').content.split('https://www.learninga-z.com').pop();

  const el = document.createElement('img');
  el.src = image;
  meta.image = el;

  // if (wideTemplate) {
  //   meta.template = 'wide';
  // }

  meta.date = getPubDate(document);

  // tags are name="keywords"
  meta.tags = document.querySelector('meta[name="keywords"]')?.content || '';

  // author
  const authorSection = main.querySelector('.flex-row');
  if (authorSection) {
    const authorLinks = authorSection.querySelectorAll('a');
    authorLinks.forEach((link) => {
      // meta.author is comma separated list of authors
      const authorName = link.textContent.replace(/,\s*$/, '');
      let newAuthorName = authorName;
      // check in blogAuthors array if authorName is present as oldname, if yes, replace authorName with newName if present
      const author = blogAuthors.find((a) => a.oldname === authorName);
      if (author) {
        newAuthorName = author.newname ? author.newname : authorName;
      }
      if (meta.author) {
        meta.author += `, ${newAuthorName}`;
      } else {
        meta.author = newAuthorName;
      }
    });
    authorSection.remove();
  }

  // category
  const category1 = blogs.find((blog) => url.includes(blog.path.replace('https://www.learninga-z.com/', '')))?.category1 || '';
  const category2 = blogs.find((blog) => url.includes(blog.path.replace('https://www.learninga-z.com/', '')))?.category2 || '';
  const category3 = blogs.find((blog) => url.includes(blog.path.replace('https://www.learninga-z.com/', '')))?.category3 || '';
  const category4 = blogs.find((blog) => url.includes(blog.path.replace('https://www.learninga-z.com/', '')))?.category4 || '';
  const category5 = blogs.find((blog) => url.includes(blog.path.replace('https://www.learninga-z.com/', '')))?.category5 || '';
  const category = [category1, category2, category3, category4, category5].filter(Boolean).join(', ');
  meta.category = category;

  // products
  meta.products = '';

  // theme
  if (wideTemplate) {
    meta.theme = 'laz-blue, col-1';
  }

  // helper to create the metadata block
  const block = WebImporter.Blocks.getMetadataBlock(document, meta);

  // append the block to the main element
  main.append(block);

  // returning the meta object might be usefull to other rules
  return meta;
};

// create a section metadata table: By default, adds a gray background and short style
function createSectionMetadata(document, style = 'inner, short', theme) {
  const cells = [
    ['Section Metadata'],
    ['Style', style],
  ];
  if (theme) {
    cells.push(['Theme', theme]);
  }
  return WebImporter.DOMUtils.createTable(cells, document);
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
    const main = document.querySelector('.main-content');

    const footerWidgets = document.querySelector('.footer-widgets');
    if (footerWidgets) main.appendChild(footerWidgets.cloneNode(true));

    // Tables
    // Note: Handling tables before creating any block tables.
    const tables = main.querySelectorAll('table');
    tables.forEach((table) => {
      // Create a new row
      const newRow = table.createTHead().insertRow(0); // Insert at the top (index 0)

      // Create a new cell
      const newCell = newRow.insertCell(0); // Insert the cell in the new row

      // Set the cell content
      newCell.textContent = 'Table';

      // Optionally, you can set the cell to span all columns
      newCell.colSpan = table.rows[1] ? table.rows[1].cells.length : 1;

      // Optionally, you can style the new cell
      newCell.style.fontWeight = 'bold';
    });

    // Dividers
    const dividers = main.querySelectorAll('hr');
    dividers.forEach((hr) => {
      const p = document.createElement('p');
      const code = document.createElement('code');
      code.textContent = 'Divider';
      p.appendChild(code);
      hr.replaceWith(p);
    });

    // if first row has col-12, replace row with a div with content of col-12
    const firstRow = main.querySelector('.row');
    if (firstRow && (firstRow.children[0].className.includes('col-12') || firstRow.children[0].className.includes('col-sm-12') || firstRow.children[0].className.includes('col-md-12') || firstRow.children[0].className.includes('col-lg-12'))) {
      console.log('1Column', url);
      wideTemplate = true;
      const div = document.createElement('div');
      div.innerHTML = firstRow.children[0].innerHTML;
      firstRow.replaceWith(div);
      wideTemplate = true;
    }

    // if first row has more than 1 col, replace each col with a div with content of col and add a hr before last col
    if (firstRow && firstRow.children.length > 1) {
      const div = document.createElement('div');
      Array.from(firstRow.children).forEach((col, index) => {
        const newDiv = document.createElement('div');
        newDiv.innerHTML = col.innerHTML;
        div.appendChild(newDiv);
        if (index < firstRow.children.length - 1) {
          div.appendChild(document.createElement('hr'));
        }
      });
      firstRow.replaceWith(div);
    }

    // Suggested Videos
    const suggestedVideos = main.querySelector('.related-resources-section');
    if (suggestedVideos && suggestedVideos.querySelector('ul.post-listing')) {
      const suggestedVideosCells = [
        ['Cards (Suggested Videos)'],
        [suggestedVideos.querySelector('ul.post-listing')],
      ];
      suggestedVideos.replaceWith(WebImporter.DOMUtils.createTable(suggestedVideosCells, document));
    }

    // Handling Videos
    const videos = main.querySelectorAll('video');
    videos.forEach((video) => {
      // for each video, check current url in blogVideos array and replace video with a link to the video matching video{index} from blogVideos array
      const videoIndex = Array.from(videos).indexOf(video) + 1;
      const videoUrl = blogVideos.find((v) => url.includes(v.link.replace('https://www.learninga-z.com/', '')));
      if (videoUrl) {
        const a = document.createElement('a');
        a.href = videoUrl[`video${videoIndex}`];
        a.textContent = a.href;
        video.closest('#laz-video-frame').replaceWith(a);
      }
    });

    // if .post-content ends with an ol, add an hr before the ol and add a section metadata table after the ol
    const postContent = main.querySelector('.post-content');
    if (postContent) {
      const ol = postContent.querySelector('ol:last-child');
      if (ol && ol === postContent.lastElementChild) {
        const hr = document.createElement('hr');
        if (ol.previousElementSibling?.tagName !== 'HR') {
          postContent.insertBefore(hr, ol);
        }
        postContent.appendChild(createSectionMetadata(document, 'footnote, short'));
      } else if (postContent.lastElementChild.style.fontSize === '10pt') { // do the same if post-content ends with a p with style font-size: 10pt;
        const hr = document.createElement('hr');
        if (postContent.lastElementChild.previousElementSibling.tagName !== 'HR') {
          postContent.insertBefore(hr, postContent.lastElementChild);
        }
        postContent.appendChild(createSectionMetadata(document, 'footnote, short'));
      } else if (postContent.lastElementChild.textContent.toLowerCase().includes('footnote:')) { // if postContent.lastElementChild.tagName === 'P' and the text content contains string "Footnote:" ignoring case
        postContent.appendChild(createSectionMetadata(document, 'footnote, short'));
      }
    }

    const subHeading = main.querySelector('.sub-heading');

    // Metadata Block
    createMetadataBlock(main, document, url);

    // Remove br tags from ULs and OLs
    const uls = main.querySelectorAll('ul');
    uls.forEach((ul) => {
      ul.querySelectorAll('br').forEach((br) => br.remove());
    });

    const ols = main.querySelectorAll('ol');
    ols.forEach((ol) => {
      ol.querySelectorAll('br').forEach((br) => br.remove());
    });

    // Callouts
    const calloutSection = main.querySelector('.author-trial-callout');
    if (calloutSection) {
      const cells = [
        ['Callout (center)'],
        [calloutSection.innerHTML],
      ];
      calloutSection.replaceWith(WebImporter.DOMUtils.createTable(cells, document));
    }

    // const breakroomTiles = main.querySelectorAll('.breakroom-tile');
    // breakroomTiles.forEach((breakroomTile) => {
    //   const cells = [
    //     ['Callout (center)'],
    //     [breakroomTile.innerHTML],
    //   ];
    //   const calloutTable = WebImporter.DOMUtils.createTable(cells, document);
    //   breakroomTile.replaceWith(calloutTable);
    // });

    const breakroomTiles = main.querySelectorAll('.breakroom-tile');
    breakroomTiles.forEach((breakroomTile) => {
      // if breakroom tile has an anchor with url containing "/site/breakroom/authors/", add Callout Table
      const authorLink = breakroomTile.querySelector('a[href*="/site/breakroom/authors/"]');
      const image = breakroomTile.querySelector('img');
      const rows = breakroomTile.querySelector('.row');
      const cols = breakroomTile.querySelectorAll('[class*="col-"]');
      // if this is an author callout or a callout with out any columns, add a Callout block else
      // add a section metadata table before and after the breakroom tile as we can not support columns in a callout
      if (authorLink && image) {
        const cells = [
          ['Callout'],
          [image, authorLink.parentElement.innerHTML],
        ];
        const calloutTable = WebImporter.DOMUtils.createTable(cells, document);
        breakroomTile.replaceWith(calloutTable);
      } else if (!rows || (cols && cols.length === 1)) {
        const cells = [
          ['Callout (center)'],
          [breakroomTile.innerHTML],
        ];
        const calloutTable = WebImporter.DOMUtils.createTable(cells, document);
        breakroomTile.replaceWith(calloutTable);
      } else {
      // insert an hr and section metadata table before each breakroom tile
        const hr = document.createElement('hr');
        if (breakroomTile.previousElementSibling?.tagName !== 'HR') {
          breakroomTile.before(hr);
        }
        breakroomTile.before(createSectionMetadata(document, 'short, center', 'gray'));
        // if breakroom tile is not the last element in the post-content, add an hr after the breakroom tile
        if (breakroomTile !== postContent.lastElementChild) {
          const hrAfter = document.createElement('hr');
          if (breakroomTile.nextElementSibling?.tagName !== 'HR') {
            breakroomTile.after(hrAfter);
          }
        }
      }
    });

    // if subHeading exists, replace with strong tag
    if (subHeading) {
      const strong = document.createElement('strong');
      strong.appendChild(subHeading.cloneNode(true));
      subHeading.replaceWith(strong);
    }

    // Handling headings: if h2 is not present, convert h3 to h2 and h4 to h3
    const h2 = main.querySelector('h2');
    if (!h2) {
      const h3 = main.querySelectorAll('h3');
      h3.forEach((h) => {
        const newh2 = document.createElement('h2');
        newh2.innerHTML = h.innerHTML;
        h.replaceWith(newh2);
      });
    }
    const h4 = main.querySelectorAll('h4');
    h4.forEach((h) => {
      const h3 = document.createElement('h3');
      h3.innerHTML = h.innerHTML;
      h.replaceWith(h3);
    });

    // blockquotes
    const blockquotes = main.querySelectorAll('p.blockquote-alt, blockquote, .blockquote-sky-blue');
    blockquotes.forEach((blockquote) => {
      // if blockquote has <strong> tag, replace with <p></p>
      const strong = blockquote.querySelector('strong');
      if (strong) {
        const p = document.createElement('p');
        p.innerHTML = strong.innerHTML;
        strong.replaceWith(p);
      }
      const cells = [
        ['Callout (blue)'],
        [blockquote.innerHTML],
      ];
      blockquote.replaceWith(WebImporter.DOMUtils.createTable(cells, document));
    });

    // quick tips
    const quickTips = main.querySelectorAll('.quick-tip');
    quickTips.forEach((tip) => {
      const cells = [
        ['Quick Tip'],
        [tip.innerHTML],
      ];
      tip.replaceWith(WebImporter.DOMUtils.createTable(cells, document));
    });

    // Related Breakroom Posts
    const relatedPosts = main.querySelector('.breakroom-posts-section');
    if (relatedPosts) {
      const pathList = relatedPosts.querySelector('ul');
      const cells = [
        ['Related posts'],
        [pathList],
      ];
      relatedPosts.replaceWith(WebImporter.DOMUtils.createTable(cells, document));
    }

    // General Callouts
    const generalCallout = main.querySelectorAll('.general-callout-section');
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
          callout.replaceWith(table);
        });
      }
    }

    // Columns
    const rows = main.querySelectorAll('.row');
    rows.forEach((row) => {
      if (row.parentElement.tagName !== 'TD' && row.parentElement.tagName !== 'TH' && row.parentElement.tagName !== 'TR' && !row.closest('table') && !row.querySelector('table')) {
        let columns = 'Columns';
        if (row.parentElement.className.includes('resources-tile') || row.querySelector('.resources-tile')) {
          columns = 'Columns (gray)';
        }
        if (row.children.length > 0 && [...row.children].some((child) => child.className.includes('col-'))) {
          if (row.children[0].className.includes('col-sm-3')) {
            if (columns.includes('(')) {
              columns = columns.replace(')', ', width 25)');
            } else {
              columns = 'Columns (width 25)';
            }
          }
          const cells = [
            [columns],
            [...row.children].map((child) => [child]),
          ];
          row.replaceWith(WebImporter.DOMUtils.createTable(cells, document));
        }
      }
    });

    // whenever a text-align:center; is found, add a hr before it and a section metadata table after it with style center and hr after it
    const centerAlign = main.querySelectorAll('[style*="center"]');
    centerAlign.forEach((center) => {
      if (!center.closest('table') && !center.closest('.breakroom-tile') && !(center.previousElementSibling?.tagName === 'HR' || center.previousElementSibling?.tagName === 'TABLE' || center.nextElementSibling?.tagName === 'HR')) {
        const hr = document.createElement('hr');
        if (center.previousElementSibling?.tagName !== 'HR') {
          center.before(hr);
        }
        if (center.closest('.resources-tile')) {
          center.before(createSectionMetadata(document, 'short, center', 'gray'));
        } else {
          center.before(createSectionMetadata(document, 'short, center'));
        }
        if (center.nextElementSibling?.tagName !== 'HR') {
          center.after(hr.cloneNode(true));
        }
      }
    });

    // Fix URLs
    main.querySelectorAll('a').forEach(fixUrl);

    // Replace iframes with links
    main.querySelectorAll('iframe').forEach((frame) => {
      if ((frame.src.includes('youtu') || frame.src.includes('vimeo') || frame.src.includes('go.learninga-z.com'))) {
        const a = document.createElement('a');
        a.href = frame.src;
        a.textContent = frame.src;
        frame.replaceWith(a);
      }
    });

    // Replace forms with links
    main.querySelectorAll('form').forEach((form) => {
      if (form.action.includes('go.learninga-z.com')) {
        const a = document.createElement('a');
        a.href = form.action;
        a.textContent = form.action;
        form.replaceWith(a);
      }
    });

    // Replace images trimming query params
    main.querySelectorAll('img').forEach((img) => {
      const src = img.src.split('?')[0];
      img.src = src;
    });

    // transform buttons
    transformButtons(main);

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
