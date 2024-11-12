/* blog-article specific JavaScript goes here */
import { getBlogsIndexData } from '../../scripts/utils.js';
import { renderCardList } from '../cards/cards.js';
import { getMetadata, loadCSS } from '../../scripts/aem.js';

//  sets the "author" value from current page's metadata to a variable.
const blogs = await getBlogsIndexData();
// extracting unique author as an array from blogs
const authors = new Map();
blogs.forEach((blog) => {
  blog.author.split(',').forEach((auth) => {
    if (auth) {
      const key = auth.toLowerCase().trim().replaceAll(' ', '-');
      const value = auth.trim();
      authors.set(key, value);
    }
  });
});

export async function getBlogsByAuthor() {
  const authName = getMetadata('author');
  const filteredBlogs = blogs.filter((blog) => blog.author.split(',').map((auth) => auth.toLowerCase().trim().replaceAll(' ', '-')).includes(authName.toLowerCase().trim().replaceAll(' ', '-'))
      && blog.template === 'blog-article');
  if (filteredBlogs.length > 0) {
    return filteredBlogs;
  }
  return [];
}

export default async function decorate(block) {
  await loadCSS(`${window.hlx.codeBasePath}/blocks/cards/cards.css`);
  const authorBlogs = await getBlogsByAuthor();
  const div = document.createElement('div');
  block.append(div);
  div.className = 'cards';
  renderCardList(div, authorBlogs, 100, 'card');
}
