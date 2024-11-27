/* eslint-disable max-len */
import { getBlogsIndexData } from '../../scripts/utils.js';
import { loadCSS } from '../../scripts/aem.js';
import { renderCardList } from '../cards/cards.js';

export default async function decorate(block) {
  await loadCSS(`${window.hlx.codeBasePath}/blocks/cards/cards.css`);

  const blogs = await getBlogsIndexData();
  // extracting unique category and author as an array from blogs
  const categories = new Map();
  const authors = new Map();
  blogs.forEach((blog) => {
    blog.category.split(',').forEach((cat) => {
      if (cat) {
        const key = cat.toLowerCase().trim().replaceAll(' ', '-');
        const value = cat.trim();
        categories.set(key, value);
      }
    });
    blog.author.split(',').forEach((auth) => {
      if (auth) {
        const key = auth.toLowerCase().trim().replaceAll(' ', '-');
        const value = auth.trim();
        authors.set(key, value);
      }
    });
  });
  // sort categories alphabetically
  categories[Symbol.iterator] = function* iterateCategories() {
    yield* [...this.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  };
  // sort authors alphabetically
  authors[Symbol.iterator] = function* iterateAuthors() {
    yield* [...this.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  };
  const form = document.createElement('form');
  form.setAttribute('class', 'blogs-filter-form');
  form.setAttribute('method', 'get');
  form.innerHTML = `
        <div class="select-position">
        <select id="sort" name="sort" onchange="window.location.hash = 'page=1';this.form.submit();">
            <option value="NewestFirst" selected="selected">Sort BY: Newest First</option>
            <option value="OldestFirst">Sort BY: Oldest First</option>
            <option value="AlphaAZ">Sort BY: A - Z</option>
            <option value="AlphaZA">Sort BY: Z - A</option>
        </select>
        <select id="category" name="category" onchange="window.location.hash = 'page=1';this.form.submit();">
            <option value="show-all" selected="selected">All Categories</option>
            ${[...categories].map(([key, value]) => `<option value="${key}">${value}</option>`).join('')}
        </select>
        <select id="author" name="author" onchange="window.location.hash = 'page=1';this.form.submit();">
            <option value="show-all" selected="selected">All Authors</option>
            ${[...authors].map(([key, value]) => `<option value="${key}">${value}</option>`).join('')}
        </select>
        </div>
    `;

  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get('category');
  block.append(form);

  let filteredBlogs = blogs;
  // sort blogs based on sort
  const sort = urlParams.get('sort');
  if (sort === 'OldestFirst') {
    filteredBlogs.sort((a, b) => new Date(a.date) - new Date(b.date));
  } else if (sort === 'AlphaAZ') {
    filteredBlogs.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sort === 'AlphaZA') {
    filteredBlogs.sort((a, b) => b.title.localeCompare(a.title));
  }
  if (form.querySelector(`option[value="${sort}"]`)) {
    form.querySelector(`option[value="${sort}"]`).selected = true;
  }

  // filter blogs based on category
  if (category && category !== 'show-all') {
    if (form.querySelector(`option[value="${category}"]`)) {
      form.querySelector(`option[value="${category}"]`).selected = true;
    }
    filteredBlogs = blogs.filter((blog) => blog.category.toLowerCase().trim().replaceAll(' ', '-').includes(category));
  }

  // filter blogs based on author
  const author = urlParams.get('author');
  if (author && author !== 'show-all') {
    if (form.querySelector(`option[value="${author}"]`)) {
      form.querySelector(`option[value="${author}"]`).selected = true;
    }
    filteredBlogs = filteredBlogs.filter((blog) => blog.author.toLowerCase().trim().replaceAll(' ', '-').includes(author));
  }

  const div = document.createElement('div');
  block.append(div);
  div.className = 'cards';
  renderCardList(div, filteredBlogs, 12);

  window.addEventListener('hashchange', async () => {
    renderCardList(div, filteredBlogs, 12);
  });
}
