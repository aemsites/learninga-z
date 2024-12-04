// eslint-disable-next-line import/prefer-default-export
import { getMetadata } from '../../scripts/aem.js';

// eslint-disable-next-line import/prefer-default-export
function buildProductSchema() {
  const srOnly = document.createElement('div');
  srOnly.classList.add('sr-only');
  srOnly.style.display = 'none';
  srOnly.setAttribute('itemscope', '');
  srOnly.setAttribute('itemtype', 'https://schema.org/Product');
  srOnly.innerHTML = `
    <span itemprop="brand" content="Learning A-Z"></span>
    <span itemprop="url" content="ORDER NOW"></span>
    <span itemprop="description" content="${getMetadata('description')}"></span>
    <span itemprop="logo" content="https://www.learninga-z.com/laz_clg_logo-rgb.png"></span>
    <span itemprop="Image" content="${getMetadata('og:image')}"></span>
    <span itemprop="name" content="${getMetadata('product')}"></span>
    <span itemprop="sku" content="${getMetadata('product')}"></span>
  `;
  const offers = document.createElement('div');
  offers.setAttribute('itemscope', '');
  offers.setAttribute('itemtype', 'https://schema.org/Offer');
  offers.innerHTML = `
    <meta itemprop="priceCurrency" content=""></meta>
    <span itemprop="price" content=""></span>
    <span itemprop="availability" content="https://schema.org/InStock"></span>
    <a itemprop="url" href="" class="rect-btn">ORDER NOW</a>
  `;
  srOnly.append(offers);
  document.body.append(srOnly);
}

export default function lcpImage() {
  const bgSection = document.querySelector('.bg-image-container');
  if (bgSection) {
    const bgImageStyle = bgSection.style.backgroundImage;
    const urlMatch = bgImageStyle.match(/url\("(.+?)"\)/);
    if (urlMatch && urlMatch[1]) {
      const bgImageUrl = urlMatch[1];
      const bgImage = new Image();
      bgImage.src = bgImageUrl;
      bgImage.loading = 'eager';
      bgImage.fetchPriority = 'high';
    }
  }
}
lcpImage();
buildProductSchema();
