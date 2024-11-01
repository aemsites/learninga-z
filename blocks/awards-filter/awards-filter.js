/* eslint-disable max-len */
import { getAwardsListData } from '../../scripts/utils.js';
import { loadCSS } from '../../scripts/aem.js';
import { renderCardList } from '../cards/cards.js';

export default async function decorate(block) {
  await loadCSS(`${window.hlx.codeBasePath}/blocks/cards/cards.css`);
  const awards = await getAwardsListData();

  const div = document.createElement('div');
  block.append(div);
  div.className = 'awards-cards';

  renderCardList(div, awards, 10, 'awards');

  window.addEventListener('hashchange', async () => {
    renderCardList(div, awards, 10, 'awards');
  });
}
