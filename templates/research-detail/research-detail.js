/* template specific JavaScript goes here */
import { getMetadata } from '../../scripts/aem.js';

const PRODUCT_LINKS = {
  'foundationsa-z': 'https://main--learninga-z--aemsites.aem.page/site/products/foundationsa-z/overview',
  'raz-kids': 'https://main--learninga-z--aemsites.aem.page/site/products/raz-kids/overview',
  'raz-plus': 'https://main--learninga-z--aemsites.aem.page/site/products/raz-plus/overview',
  'readinga-z': 'https://main--learninga-z--aemsites.aem.page/site/products/readinga-z/overview',
  'sciencea-z': 'https://main--learninga-z--aemsites.aem.page/site/products/sciencea-z/overview',
  'vocabularya-z': 'https://main--learninga-z--aemsites.aem.page/site/products/vocabularya-z/overview',
  'writinga-z': 'https://main--learninga-z--aemsites.aem.page/site/products/writinga-z/overview',
  'raz-plus-ell': 'https://main--learninga-z--aemsites.aem.page/site/products/ell/overview',
};

export default async function decorate(main) {
  const h1 = main.querySelector('h1');
  const products = getMetadata('products');
  if (products) {
    const productLinks = products.split(',').map((product) => {
      const prodKey = product.trim().toLowerCase().replace(' ', '');
      if (PRODUCT_LINKS[prodKey]) {
        const a = document.createElement('a');
        a.href = PRODUCT_LINKS[prodKey];
        a.textContent = (prodKey === 'raz-plus-ell') ? 'Raz-Plus ELL' : product;
        return a;
      }
      return document.createTextNode(product);
    });
    const p = document.createElement('p');
    p.classList.add('products-applied');
    const strong = document.createElement('strong');
    strong.textContent = 'Research Applies to: ';
    p.appendChild(strong);
    productLinks.forEach((a, index) => {
      p.append(a);
      if (index < productLinks.length - 1) {
        p.append(', ');
      }
    });
    h1.after(p);
  }
}
