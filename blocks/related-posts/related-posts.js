import { createTag, lookupBlogs } from '../../scripts/scripts.js';

export async function createPageLinks(row, style) {
  const linkPost = document.createElement('div');
  if (style) linkPost.classList.add(style);
  const title = createTag('div', { class: 'title' });
  title.innerHTML = `<a href="${row.path}"><h3>${row.title.replace(/ \| Learning A-Z$|- Learning A-Z$/, '')}</h3></a>`;

  linkPost.append(title);
  return linkPost;
}

export default async function decorate(block) {
  const pathNames = [...block.querySelectorAll('a')].map((a) => new URL(a.href).pathname);
  block.textContent = '';
  // Make a call to the blog index and get the json for just the pathNames the author has put in
  const pageList = await lookupBlogs(pathNames);
  const titlesList = createTag('div', { class: 'titles-list' });

  block.append(titlesList);
  if (pageList.length) {
    pageList.forEach(async (row) => {
      block.append(await createPageLinks(row, 'posts-list'));
    });
    block.innerHTML = '<h2 class="related-title">Related Breakroom Posts</h2>';
  } else {
    block.remove();
  }
}
