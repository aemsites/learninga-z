/* eslint-disable max-len */
import { buildBlock, getMetadata } from '../../scripts/aem.js';
import { div } from '../../scripts/dom-helpers.js';

function setJsonLd(data, name) {
  const existingScript = document.head.querySelector(`script[data-name="${name}"]`);
  if (existingScript) {
    existingScript.innerHTML = JSON.stringify(data);
    return;
  }

  const script = document.createElement('script');
  script.type = 'application/ld+json';

  script.innerHTML = JSON.stringify(data);
  script.dataset.name = name;
  document.body.appendChild(script);
}

// eslint-disable-next-line import/prefer-default-export
export function buildArticleSchema() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `https://www.learninga-z.com${window.location.pathname}`,
    headline: document.querySelector('h1') ? document.querySelector('h1').textContent : getMetadata('og:title'),
    image: getMetadata('og:image'),
    datePublished: getMetadata('date') ? new Date(getMetadata('date')) : new Date(getMetadata('date')),
    publisher: {
      '@type': 'Organization',
      name: 'Learning A-Z',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.learninga-z.com/laz_clg_logo-rgb.png',
      },
    },
    description: getMetadata('description'),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://www.learninga-z.com${window.location.pathname}`,
    },
  };
  if (getMetadata('date')) data.datePublished = getMetadata('date');
  if (getMetadata('author')) {
    data.author = {
      '@type': 'Person',
      name: getMetadata('author'),
      /* if they want to set author URL, work needs to be done to separate the authors array, etc.
      url: `https://www.learninga-z.com/site/resources/breakroom-blog/authors/${getMetadata('author')}`,
       */
    };
  } else {
    data.author = {
      '@type': 'Organization',
      name: 'Learning A-Z',
    };
  }
  setJsonLd(data, 'blogPosting');
}

export default async function decorate(main) {
  buildArticleSchema();
  const author = getMetadata('author');
  if (!author) return;
  const authorInfo = buildBlock('author-info', [
    [`<p>${author}</p>`],
  ]);

  const h1 = main.querySelector('h1');
  let subHeading = main.querySelector('p>strong');
  if (!subHeading) {
    subHeading = main.querySelector('strong>p');
  }
  let headingSection;
  if (subHeading && (subHeading.innerText === subHeading.parentElement.innerText) && h1.nextElementSibling === subHeading.parentElement) {
    headingSection = div(h1, subHeading);
  } else {
    headingSection = div(h1);
  }
  headingSection.classList.add('blog-heading');
  main.prepend(div(authorInfo));
  main.prepend(headingSection);
}
