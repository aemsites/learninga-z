/*
 * Accordion Block
 * Recreate an accordion
 * https://www.hlx.live/developer/block-collection/accordion
 */

function addLdJsonFAQ(parent, json) {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.innerHTML = JSON.stringify(json);
  parent.append(script);
}

function addFaqJson(block) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [...block.querySelectorAll('details')].map((faqItem) => {
      const info = {
        '@type': 'Question',
        name: faqItem.querySelector('summary').textContent.trim(),
        acceptedAnswer: {
          '@type': 'Answer',
          text: faqItem.querySelector('.accordion-item-body').textContent.trim(),
        },
      };
      return info;
    }),
  };
  addLdJsonFAQ(document.querySelector('head'), data);
}

export default function decorate(block) {
  [...block.children].forEach((row) => {
    // decorate accordion item label
    const label = row.children[0];
    const summary = document.createElement('summary');
    summary.className = 'accordion-item-label';
    summary.append(...label.childNodes);
    // decorate accordion item body
    const body = row.children[1];
    body.className = 'accordion-item-body';
    // if body has a hr, wrap all the content after the hr in a div with class sub-content
    const hr = body.querySelector('hr');
    if (hr) {
      const subContent = document.createElement('div');
      subContent.className = 'sub-content';
      let nextSibling = hr.nextElementSibling;
      while (nextSibling) {
        const sibling = nextSibling;
        nextSibling = sibling.nextElementSibling;
        subContent.append(sibling);
      }
      hr.after(subContent);
      hr.remove();
    }
    // decorate accordion item
    const details = document.createElement('details');
    details.className = 'accordion-item';
    details.append(summary, body);
    row.replaceWith(details);
  });

  if (block.classList.contains('faq')) {
    addFaqJson(block);
  }
  const details = document.querySelectorAll('.accordion details');
  details.forEach((d, index) => {
    d.onclick = () => {
      details.forEach((c, i) => {
        if (index !== i) {
          c.removeAttribute('open');
        }
      });
    };
  });
}
