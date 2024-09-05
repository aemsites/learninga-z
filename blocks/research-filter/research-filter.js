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
      const productsArray = products.split(',').map((product) => product.trim().toLowerCase());
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
  // get the last part of the url as the product name
  const url = window.location.href;
  const urlArray = url.split('/research-and-efficacy');
  let productName = urlArray[urlArray.length - 1];
  // remove the trailing slash from the product name
  productName = productName.replace('/', '');
  let researchDetailPages;
  if (productName && VALID_PRODUCTS.includes(productName)) {
    // get the product name from the url
    researchDetailPages = await getResearchPagesByProduct(productName);
  } else if (urlArray.length > 0) {
    researchDetailPages = await getResearchPagesByProduct();
  }

  await groupResearchPagesByType(researchDetailPages);
  if (essa.length > 0) {
    const h2 = document.createElement('h2');
    h2.textContent = 'ESSA — Proven Results';
    block.append(h2);
    const ul = document.createElement('ul');
    block.append(ul);
    essa.forEach((page) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = page.path;
      a.textContent = page.title;
      li.append(a);
      ul.append(li);
    });
  }

  if (caseStudies.length > 0) {
    const h2 = document.createElement('h2');
    h2.textContent = 'Case Studies';
    block.append(h2);
    const ul = document.createElement('ul');
    block.append(ul);
    caseStudies.forEach((page) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = page.path;
      a.textContent = page.title;
      li.append(a);
      ul.append(li);
    });
  }

  if (researchBase.length > 0) {
    const h2 = document.createElement('h2');
    h2.textContent = 'Research Base';
    block.append(h2);
    const ul = document.createElement('ul');
    block.append(ul);
    researchBase.forEach((page) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = page.path;
      a.textContent = page.title;
      li.append(a);
      ul.append(li);
    });
  }

  if (moreStudies.length > 0) {
    const h2 = document.createElement('h2');
    h2.textContent = 'More Studies and Publications';
    block.append(h2);
    const ul = document.createElement('ul');
    block.append(ul);
    moreStudies.forEach((page) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = page.path;
      a.textContent = page.title;
      li.append(a);
      ul.append(li);
    });
  }
}
