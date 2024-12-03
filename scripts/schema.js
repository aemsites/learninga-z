import { getMetadata } from './aem.js';
// eslint-disable-next-line import/no-cycle
import { setJsonLd } from './scripts.js';

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
      /* if they want to set author URL, work needs to be done to separate the authors array, etc
      url: `https://www.learninga-z.com/site/resources/breakroom-blog/authors/${getMetadata('author')}`,
       */
    };
  }

  setJsonLd(data, 'blogPosting');
}
