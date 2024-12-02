import { createOptimizedPicture } from '../../scripts/scripts.js';

export default function decorate(block) {
  const rows = block.querySelectorAll(':scope > div');
  block.innerHTML = '';
  rows.forEach((row) => {
    const container = document.createElement('div');
    container.classList.add('flip-card');
    const plus = document.createElement('img');
    plus.classList.add('plus-icon');
    const card = document.createElement('div');
    plus.alt = 'Plus icon';
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
      container.append(plus);
      container.append(card);
    });
    block.append(container);
  });
}
