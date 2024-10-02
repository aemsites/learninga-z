import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const rows = block.querySelectorAll(':scope > div');
  const row = rows['0'];
  const card = document.createElement('div');
  card.classList.add('callout-inner');
  const columns = row.querySelectorAll(':scope > div');
  if (columns.length < 2) {
    columns[0].classList.add('callout-quote');
  } else {
    columns.forEach((column, colIdx) => {
      if (colIdx === 0) {
        column.classList.add('callout-author-picture');
        card.append(column);
        column.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '150' }])));
      } else {
        column.classList.add('callout-quote');
        card.append(column);
      }
    });
  }
  block.prepend(card);
}
