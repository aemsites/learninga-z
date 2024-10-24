/* eslint-disable max-len */
import { loadCSS } from '../../scripts/aem.js';
import { getDownloadsIndexData } from '../../scripts/utils.js';
import { renderCardList } from '../cards/cards.js';
import { PRODUCT_NAMES } from '../../scripts/constants.js';

const downloadPages = await getDownloadsIndexData();

function groupItemsByType(block) {
  const types = [];
  downloadPages.forEach((page) => {
    const type = page.category;
    if (type) {
      types.push(type);
    }
  });
  const uniqueTypes = [...new Set(types)].sort();
  uniqueTypes.forEach((type) => {
    const typePages = downloadPages.filter((page) => page.category === type);
    const div = document.createElement('div');
    div.className = 'download-cards';
    const h2 = document.createElement('h2');
    block.append(h2);
    h2.innerText = type;
    block.append(h2);
    block.append(div);
    renderCardList(div, typePages, 0, 'downloads');
  });
}

function groupItemsByProduct(block) {
  const productsArray = [];
  downloadPages.forEach((page) => {
    const { products } = page;
    if (products) {
      // if products is an array, add each product to the productsArray
      if (products.indexOf(',') > -1) {
        const prodArray = products.split(',');
        prodArray.forEach((product) => {
          productsArray.push(product.trim());
        });
      } else {
        // if products is a string, add the product to the productsArray
        productsArray.push(products.trim());
      }
    }
  });
  const uniqueProducts = [...new Set(productsArray)];
  // sort the products based on the order in PRODUCT_NAMES
  uniqueProducts.sort((a, b) => PRODUCT_NAMES.indexOf(a) - PRODUCT_NAMES.indexOf(b));
  uniqueProducts.forEach((product) => {
    const productPages = downloadPages.filter((page) => (page.products.toLowerCase().indexOf(product.toLowerCase()) > -1));
    const div = document.createElement('div');
    div.className = 'download-cards';
    const h2 = document.createElement('h2');
    block.append(h2);
    h2.innerText = product;
    block.append(h2);
    block.append(div);
    renderCardList(div, productPages, 0, 'downloads');
  });
}

export default async function decorate(block) {
  await loadCSS(`${window.hlx.codeBasePath}/blocks/cards/cards.css`);

  // get the last part of the url as the product name
  const url = window.location.href;
  // get the last part of url as the product name
  const pageFilterType = url.split('/').pop().split('-').slice(-2)
    ?.join('-');

  if (pageFilterType === 'by-product') {
    groupItemsByProduct(block);
  } else if (pageFilterType === 'by-type') {
    groupItemsByType(block);
  }
}
