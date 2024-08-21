import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const container = document.createElement('div');
  container.classList.add('flip-card');
  const rows = block.querySelectorAll(':scope > div');
  const row = rows['0'];
  const plus = document.createElement('img');
  plus.classList.add('plus-icon');
  const card = document.createElement('div');
  card.classList.add('flip-card-inner');
  row.querySelectorAll(':scope > div').forEach((column, colIdx) => {
    if (colIdx === 0) {
      column.classList.add('flip-card-front');
      card.append(column);
      column.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
    } else {
      column.classList.add('flip-card-back');
      card.append(column);
    }
  });

  container.append(plus);
  container.append(card);
  block.prepend(container);
}
