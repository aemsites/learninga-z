import { buildOfferSchema, buildProductSchema } from '../../scripts/schema.js';

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
buildOfferSchema();
