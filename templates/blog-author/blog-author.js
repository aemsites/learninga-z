import { createTag } from '../../scripts/scripts.js';
import { getMetadata } from '../../scripts/aem.js';
import { populateCard } from '../../blocks/card/card.js';
import ffetch from '../../scripts/ffetch.js';
import { getTaxonomyCategory } from '../../scripts/utils.js';
/**
 * Build auto block of most recent articles by author name
 * but don't show any cards until you scroll to them
 *  * @param {*} relatedContent Feature content as Json object
 *  * @returns Related content element
 */
function buildRelatedArticleElement(relatedContent) {
  const card = populateCard(relatedContent);
  if (card) {
    return populateCard(relatedContent).querySelector('a');
  }
  return null;
}

let authorActiveFilters = []; // the authors will be comma separated

export default async function decorate(block) {
  const observer = new IntersectionObserver(async (entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      observer.disconnect();
      const existingRelatedArticlesLinks = block.querySelector('a');

      if (!existingRelatedArticlesLinks) {
        /*  get this pages' topics, remove empty strings or duplicates, get 1st topic */
        const metaAuthor = getMetadata('author');
        const metaAuthors = metaAuthor.split(','); // in case there are multiple authors
        const filteredTopics = metaAuthors.filter((el) => el !== '');
        [authorActiveFilters] = [...new Set(filteredTopics)];
        const validTopic = await getTaxonomyCategory('Topics');
        if (!metaAuthor || !validTopic[authorActiveFilters] || authorActiveFilters.length === 0) {
          if (!window.location.host === 'www.learninga-z.com' || !window.location.host.endsWith('.live')) {
            // provide a hint to the author why cards might not be showing
            // eslint-disable-next-line no-console
            console.log('No related articles? author metadata for current page is either empty or not valid');
          }
          return;
        }
      }

      const up = block.parentElement;
      const articlesContainer = document.createElement('div');
      articlesContainer.classList.add('section', 'related-articles');
      articlesContainer.innerHTML = '<h2 id="related-articles">Related Articles</h2>';
      up.append(articlesContainer);

      /* get all articles, then get articles with the same topic as current page */
      const allArticlesContentTask = await ffetch('/site/resources/breakroom-blog/query-index.json')
        .all();
      const filteredArticles = allArticlesContentTask.filter(
        (article) => article.author.includes(authorActiveFilters), // author is the key in the json
      );

      /* auto-build related article element, based on publication date */
      if (!existingRelatedArticlesLinks) { // if there are no existing related articles
        block.textContent = '';
        let counter = 0;
        let secondCard = 0;
        // below checks if this page's title is the same as the title of the fetched articles
        // this is always false for author pages
        const titleContent = getMetadata('og:title');
        if (filteredArticles.length) {
          // these become article-cards
          filteredArticles.forEach((row) => {
            if (row.title !== titleContent) {
              const card = populateCard(row); // populateCard is a function from card.js
              if (counter === 0) {
                block.append(card);
                counter += 1;
              } else if (secondCard < 2) {
                block.append(card);
                secondCard += 1;
              }
            }
          });
        }
      }
      /* Build related article element, based on related content */
      const linkedArticles = block.querySelectorAll('a');
      if (!linkedArticles || linkedArticles.length === 0) return;
      const searchElements = {};
      const featuredElementsLength = linkedArticles.length;
      linkedArticles.forEach((article, i) => {
        const articlePath = getFeaturePath(article.href); // we don't need this function
        searchElements[articlePath] = {
          rank: i,
          readtime: `${i}min`, // TODO: Use metadata once available
        };
      });

      block.innerHTML = '';

      const allArticlesContent = await allArticlesContentTask;
      const relatedArticlesContent = searchFeatureContents(
        allArticlesContent,
        searchElements,
        featuredElementsLength,
      );

      if (!relatedArticlesContent || relatedArticlesContent.length === 0) {
        // in case the related content links were not found, hide related content container section
        const section = block.closest('.section');
        section.classList.add('hidden');
        return;
      }

      const relatedCards = [];
      for (let i = 0; i < featuredElementsLength; i += 1) {
        const card = buildRelatedArticleElement(relatedArticlesContent[i]);
        if (card) {
          relatedCards.push(card);
        }
      }

      const relatedArticleFeatures = createTag('div', { class: 'related-features' });
      if (relatedCards.length > 0) {
        relatedArticleFeatures.append(...relatedCards);
      } else {
        const section = block.closest('.section');
        section.classList.add('hidden');
      }
      articlesContainer.append(relatedArticleFeatures);
      block.append(articlesContainer);
    }
  }, { threshold: 0 });
  observer.observe(block.parentElement);
}
