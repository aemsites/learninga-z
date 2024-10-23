// eslint-disable-next-line import/no-unresolved
import { toClassName } from '../../scripts/aem.js';

export default async function decorate(block) {
  if (block.classList.contains('columns')) {
    // build tablist
    const tablist = document.createElement('div');
    tablist.className = 'tabs-list';
    tablist.setAttribute('role', 'tablist');

    // decorate tabs and tabpanels
    const tabs = [...block.children].map((child) => child.firstElementChild);
    tabs.forEach((tab, i) => {
      const id = tab.textContent ? toClassName(tab.textContent) : (i + 1);

      // decorate tabpanel
      const tabpanel = block.children[i];
      tabpanel.className = 'tabs-panel';
      tabpanel.id = `tabpanel-${id}`;
      tabpanel.setAttribute('aria-hidden', !!i);
      tabpanel.setAttribute('aria-labelledby', `tab-${id}`);
      tabpanel.setAttribute('role', 'tabpanel');
      const tags = tabpanel.querySelector('code');
      if (tags) {
        const div = document.createElement('div');
        div.className = 'left-content';
        const tagsParent = tags.parentElement;
        let nextSibling = tagsParent.nextElementSibling;
        while (nextSibling) {
          const sibling = nextSibling;
          nextSibling = sibling.nextElementSibling;
          div.append(sibling);
        }
        tagsParent.after(div);
        const tagList = document.createElement('ul');
        tagList.className = 'tags-list';
        tags.textContent.split(',').forEach((tag) => {
          const tagItem = document.createElement('li');
          const p = document.createElement('p');
          p.textContent = tag;
          tagItem.append(p);
          tagList.append(tagItem);
        });
        tags.replaceWith(tagList);
      } else {
        const leftDiv = tabpanel.querySelector('div');
        leftDiv.className = 'left-content';
      }

      // if second div under tabpanel has children, add class right-content
      const rightDiv = tabpanel.querySelector('div + div + div');
      if (rightDiv && rightDiv.children.length > 0) {
        rightDiv.className = 'right-content';
        const leftContent = tabpanel.querySelector('.left-content');
        leftContent.classList.add('has-border');
      }

      const headingSection = tabpanel.querySelector('h2');
      if (headingSection && headingSection.children.length > 0) {
        const div = document.createElement('div');
        div.className = 'top-content';
        Array.from(headingSection.children).forEach((child) => {
          div.append(child);
        });
        headingSection.replaceWith(div);
      }

      // build tab button
      const button = document.createElement('button');
      button.className = 'tabs-tab';
      button.id = `tab-${id}`;
      button.innerHTML = tab.innerHTML;
      button.setAttribute('aria-controls', `tabpanel-${id}`);
      button.setAttribute('aria-selected', !i);
      button.setAttribute('role', 'tab');
      button.setAttribute('type', 'button');
      button.addEventListener('mouseover', () => {
        block.querySelectorAll('[role=tabpanel]').forEach((panel) => {
          panel.setAttribute('aria-hidden', true);
        });
        tablist.querySelectorAll('button').forEach((btn) => {
          btn.setAttribute('aria-selected', false);
        });
        tabpanel.setAttribute('aria-hidden', false);
        button.setAttribute('aria-selected', true);
      });
      const buttonIcon = document.createElement('span');
      buttonIcon.className = 'btn-icon';
      button.append(buttonIcon);
      tablist.append(button);
      tab.remove();
    });

    block.prepend(tablist);
  } else if (block.classList.contains('square')) {
    const rows = block.querySelectorAll(':scope > div');

    const container = document.createElement('div');
    container.className = 'tabs-square-container';

    const tabsSquare = document.createElement('div');
    tabsSquare.className = 'tabs-square';

    const tabsContentContainer = document.createElement('div');
    tabsContentContainer.className = 'tab-square-content-container';

    rows.forEach((row, rowIdx) => {
      const squareTab = document.createElement('div');
      const squareContent = document.createElement('div');
      row.querySelectorAll(':scope > div').forEach((column, colIdx) => {
        if (colIdx === 0) {
          squareTab.classList.add('tab-square');
          squareTab.id = `tab-square-${rowIdx}`;
          squareTab.setAttribute('data-tab', `tab-square-content-${rowIdx}`);
          if (rowIdx === 0) {
            squareTab.classList.add('active');
          }
          squareTab.append(column);
          tabsSquare.append(squareTab);
        } else if (colIdx === 1) {
          squareContent.classList.add('tab-square-content');
          squareContent.id = `tab-square-content-${rowIdx}`;
          if (rowIdx === 0) {
            squareContent.classList.add('active');
          }
          squareContent.append(column);
          tabsContentContainer.append(squareContent);
        }
      });
      row.remove();
    });

    container.append(tabsSquare);
    container.append(tabsContentContainer);

    block.prepend(container);

    // Get all tab elements
    const tabs = document.querySelectorAll('.tab-square');
    const contents = document.querySelectorAll('.tab-square-content');

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        // Remove active class from all tabs and contents
        tabs.forEach((t) => t.classList.remove('active'));
        contents.forEach((c) => c.classList.remove('active'));

        // Add active class to clicked tab and its corresponding content
        tab.classList.add('active');
        document.getElementById(tab.dataset.tab).classList.add('active');
      });
    });
  }
}
