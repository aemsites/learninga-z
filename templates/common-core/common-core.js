/* eslint-disable no-use-before-define, object-curly-newline, function-paren-newline */
import { loadFragment } from '../../blocks/fragment/fragment.js';
import { div, aside, section, h1 } from '../../scripts/dom-helpers.js';

function highlightActiveLink() {
  const links = document.querySelectorAll('aside a');
  links.forEach((link) => {
    if (link.href === window.location.href) {
      link.classList.add('active');
    }
  });
}

export default async function decorate(doc) {
  const leftNavFrag = await loadFragment('/fragments/common-core-leftnav');
  const subNavFrag = await loadFragment('/fragments/common-core-subnav');
  const $section = section();
  $section.append(...doc.querySelectorAll('div'));

  const $page = div({ class: 'section-outer' },
    div({ class: 'section' },
      h1('Common Core'),
      div({ class: 'subnav' }, subNavFrag ? subNavFrag.querySelector('.subnav-wrapper') : ''),
      div({ class: 'wrapper' },
        aside(leftNavFrag ? leftNavFrag.querySelector('.default-content-wrapper') : ''),
        $section,
      ),
    ),
  );

  doc.append($page);
  highlightActiveLink();
}
