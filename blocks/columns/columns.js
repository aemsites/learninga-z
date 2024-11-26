export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      if (col.children.length > 0) {
        col.classList.add('col-has-content');
      }
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }
      if (block.classList.contains('tile') && col.querySelector('a')) {
        const link = document.createElement('a');
        link.href = col.querySelector('a').href;
        const text = col.querySelector('a').textContent;
        col.querySelector('a').replaceWith(text);
        const children = [...col.children];
        children.forEach((child) => {
          link.append(child);
        });
        col.appendChild(link);
      }
    });
  });
}
