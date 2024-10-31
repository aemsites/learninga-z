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
  const subNavFrag = await loadFragment('/fragments/common-core-subnav');
  const $section = section();
  $section.append(...doc.querySelectorAll('div'));

  // only key-topics has a leftnav
  let $aside;
  if (document.body.classList.contains('key-topics')) {
    const leftNavFrag = await loadFragment('/fragments/common-core-leftnav');
    $aside = aside(leftNavFrag ? leftNavFrag.querySelector('.default-content-wrapper') : '');
  }

  const $page = div({ class: 'section-outer' },
    div({ class: 'section' },
      h1('Common Core'),
    ),
    div({ class: 'subnav' }, subNavFrag ? subNavFrag.querySelector('.subnav-wrapper') : ''),
    div({ class: 'section' },
      div({ class: 'wrapper' },
        $aside,
        $section,
      ),
    ),
  );

  doc.append($page);
  highlightActiveLink();
}
