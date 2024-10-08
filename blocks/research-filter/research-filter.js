import { populateCard } from '../cards/cards.js';
import { loadCSS } from '../../scripts/aem.js';

const VALID_PRODUCTS = ['writinga-z', 'readinga-z', 'vocabularya-z', 'sciencea-z', 'raz-kids', 'raz-plus', 'raz-plus-ell', 'foundationsa-z'];
const RESEARCH_QUERY_PATH = '/site/resources/research-and-efficacy/query-index.json';
const researchPages = [];
const essa = [];
const caseStudies = [];
const researchBase = [];
const moreStudies = [];
async function getResearchPagesByProduct(productName = '') {
  if (!researchPages.length) {
    const resp = await fetch(RESEARCH_QUERY_PATH)
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        return {};
      });
    researchPages.push(...resp.data);
  }
  if (productName) {
    return researchPages.filter((page) => {
      const { products } = page;
      const productsArray = products.split(',').map((product) => product.replace(' ', '').toLowerCase());
      return productsArray.includes(productName);
    });
  }
  return researchPages;
}

async function groupResearchPagesByType(researchDetailPages) {
  researchDetailPages.forEach((page) => {
    const category = page.category.toLowerCase();
    if (category && category.toLowerCase().startsWith('essa')) {
      const efficacy = category.split(' ')[1]?.trim();
      if (efficacy) {
        page.efficacy = efficacy;
      }
      essa.push(page);
    } else if (category && category.toLowerCase() === 'case studies') {
      caseStudies.push(page);
    } else if (category && category.toLowerCase() === 'research base') {
      researchBase.push(page);
    } else if (category && category.toLowerCase() === 'more studies and publications') {
      moreStudies.push(page);
    }
  });
}

export default async function decorate(block) {
  await loadCSS(`${window.hlx.codeBasePath}/blocks/cards/cards.css`);

  // get the last part of the url as the product name
  const url = window.location.href;
  const urlArray = url.split('/research-and-efficacy');
  let productName = urlArray[urlArray.length - 1];
  // remove the trailing slash from the product name
  productName = productName.replace('/', '');
  productName = productName.trim();
  let researchDetailPages;
  if (productName && VALID_PRODUCTS.includes(productName)) {
    // get the product name from the url
    researchDetailPages = await getResearchPagesByProduct(productName);
  } else if (urlArray.length > 0) {
    researchDetailPages = await getResearchPagesByProduct();
  }

  await groupResearchPagesByType(researchDetailPages);
  // Display ESSA pages first, then Case Studies, then Research Base,
  // then More Studies and Publications
  if (essa.length > 0) {
    const h2 = document.createElement('h2');
    h2.textContent = 'ESSA — Proven Results';
    block.append(h2);
    block.append(document.createElement('hr'));
    const div = document.createElement('div');
    block.append(div);
    div.className = 'cards';
    essa.forEach((page) => {
      populateCard(div, page);
    });
  }

  if (caseStudies.length > 0) {
    const h2 = document.createElement('h2');
    h2.textContent = 'Case Studies';
    block.append(h2);
    block.append(document.createElement('hr'));
    const div = document.createElement('div');
    block.append(div);
    div.className = 'cards';
    caseStudies.forEach((page) => {
      populateCard(div, page);
    });
  }

  if (researchBase.length > 0) {
    const h2 = document.createElement('h2');
    h2.textContent = 'Research Base';
    block.append(h2);
    block.append(document.createElement('hr'));
    const div = document.createElement('div');
    block.append(div);
    div.className = 'cards';
    researchBase.forEach((page) => {
      populateCard(div, page);
    });
  }

  if (moreStudies.length > 0) {
    const h2 = document.createElement('h2');
    h2.textContent = 'More Studies and Publications';
    block.append(h2);
    block.append(document.createElement('hr'));
    const div = document.createElement('div');
    block.append(div);
    div.className = 'cards';
    moreStudies.forEach((page) => {
      populateCard(div, page);
    });
  }
}
