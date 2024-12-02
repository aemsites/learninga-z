import { fetchPlaceholders } from '../../scripts/aem.js';
import { createOptimizedPicture } from '../../scripts/scripts.js';
import {
  getRelativePath, getGenericIndexData,
} from '../../scripts/utils.js';

function updateActiveSlide(slide) {
  const block = slide.closest('.carousel');
  const slideIndex = parseInt(slide.dataset.slideIndex, 10);
  block.dataset.activeSlide = slideIndex;

  const slides = block.querySelectorAll('.carousel-slide');

  slides.forEach((aSlide, idx) => {
    aSlide.setAttribute('aria-hidden', idx !== slideIndex);
    aSlide.querySelectorAll('a').forEach((link) => {
      if (idx !== slideIndex) {
        link.setAttribute('tabindex', '-1');
      } else {
        link.removeAttribute('tabindex');
      }
    });
  });

  const indicators = block.querySelectorAll('.carousel-slide-indicator');
  indicators.forEach((indicator, idx) => {
    if (idx !== slideIndex) {
      indicator.querySelector('button').removeAttribute('disabled');
    } else {
      indicator.querySelector('button').setAttribute('disabled', 'true');
    }
  });
}

function showSlide(block, slideIndex = 0) {
  const slides = block.querySelectorAll('.carousel-slide');
  let realSlideIndex = slideIndex < 0 ? slides.length - 1 : slideIndex;
  if (slideIndex >= slides.length) realSlideIndex = 0;
  const activeSlide = slides[realSlideIndex];

  activeSlide.querySelectorAll('a').forEach((link) => link.removeAttribute('tabindex'));
  block.querySelector('.carousel-slides').scrollTo({
    top: 0,
    left: activeSlide.offsetLeft,
    behavior: 'smooth',
  });
}

function bindEvents(block) {
  const slideIndicators = block.querySelector('.carousel-slide-indicators');
  if (!slideIndicators) return;

  slideIndicators.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', (e) => {
      const slideIndicator = e.currentTarget.parentElement;
      showSlide(block, parseInt(slideIndicator.dataset.targetSlide, 10));
    });
  });

  block.querySelector('.slide-prev').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) - 1);
  });
  block.querySelector('.slide-next').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) + 1);
  });

  const slideObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) updateActiveSlide(entry.target);
    });
  }, { threshold: 0.5 });
  block.querySelectorAll('.carousel-slide').forEach((slide) => {
    slideObserver.observe(slide);
  });
}

function createSlide(row, slideIndex, carouselId) {
  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.setAttribute('id', `carousel-${carouselId}-slide-${slideIndex}`);
  slide.classList.add('carousel-slide');

  row.querySelectorAll(':scope > div').forEach((column, colIdx) => {
    column.classList.add(`carousel-slide-${colIdx === 0 ? 'image' : 'content'}`);
    slide.append(column);
  });

  const labeledBy = slide.querySelector('h1, h2, h3, h4, h5, h6');
  if (labeledBy) {
    slide.setAttribute('aria-labelledby', labeledBy.getAttribute('id'));
  }

  return slide;
}

function buildSlides(rows, slideIndicators, carouselId, placeholders, slidesWrapper) {
  rows.forEach((row, idx) => {
    const slide = createSlide(row, idx, carouselId);
    slidesWrapper.append(slide);

    if (slideIndicators) {
      const indicator = document.createElement('li');
      indicator.classList.add('carousel-slide-indicator');
      indicator.dataset.targetSlide = idx;
      indicator.innerHTML = `<button type="button" aria-label="${placeholders.showSlide || 'Show Slide'} ${idx + 1} ${placeholders.of || 'of'} ${rows.length}"></button>`;
      slideIndicators.append(indicator);
    }
    row.remove();
  });
}

function getCardObject(link, indexData) {
  const path = link?.getAttribute('href');
  const relPath = getRelativePath(path);
  return indexData.find((item) => item.path === relPath);
}

let carouselId = 0;
export default async function decorate(block) {
  carouselId += 1;
  block.setAttribute('id', `carousel-${carouselId}`);
  const linkedCarousel = block.classList.contains('card-links') || block.classList.contains('links');
  const rows = block.querySelectorAll(':scope > div');
  let isSingleSlide = false;
  if (linkedCarousel) {
    const cardLinks = block.querySelectorAll('a');
    if (cardLinks.length < 2) {
      isSingleSlide = true;
    }
  } else if (rows.length < 2) {
    isSingleSlide = true;
  }

  const placeholders = await fetchPlaceholders();

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', placeholders.carousel || 'Carousel');

  const container = document.createElement('div');
  container.classList.add('carousel-slides-container');

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('carousel-slides');
  block.prepend(slidesWrapper);

  let slideIndicators;
  if (!isSingleSlide) {
    const slideIndicatorsNav = document.createElement('nav');
    slideIndicatorsNav.setAttribute('aria-label', placeholders.carouselSlideControls || 'Carousel Slide Controls');
    slideIndicators = document.createElement('ol');
    slideIndicators.classList.add('carousel-slide-indicators');
    slideIndicatorsNav.append(slideIndicators);
    block.append(slideIndicatorsNav);

    const slideNavButtons = document.createElement('div');
    slideNavButtons.classList.add('carousel-navigation-buttons');
    slideNavButtons.innerHTML = `
      <button type="button" class= "slide-prev" aria-label="${placeholders.previousSlide || 'Previous Slide'}"></button>
      <button type="button" class="slide-next" aria-label="${placeholders.nextSlide || 'Next Slide'}"></button>
    `;

    block.append(slideNavButtons);
  }

  if (block.classList.contains('links') || block.classList.contains('card-links')) {
    const rows1 = [];
    const cardLinks = block.querySelectorAll('a');
    const indexData = await getGenericIndexData();
    Array.from(cardLinks).forEach((cardLink) => {
      const row = document.createElement('div');
      const card = getCardObject(cardLink, indexData);
      if (card) {
        const col1 = document.createElement('div');
        const col2 = document.createElement('div');
        col2.innerHTML = '';
        if (card.image) {
          col1.innerHTML = createOptimizedPicture(card.image, card.title, false).outerHTML;
        }
        if (card.title && block.classList.contains('featured')) {
          col2.innerHTML += `<p> <strong>FEATURED</strong></p>
               <a href="${card.path}"><h1>${card.title.replace(/ \| Learning A-Z$|- Learning A-Z$/, '')}</h1></a>`;
        } else if (card.title) {
          col2.innerHTML += `<a href="${card.path}"><h3>${card.title.replace(/ \| Learning A-Z$|- Learning A-Z$/, '')}</h3></a>`;
        }
        if (card.description) {
          col2.innerHTML += `<p>${card.description}</p><p><em><a href="${card.path}" title="More about ${card.title}">Learn More</a></em></p>`;
        }
        if (block.classList.contains('card-links')) {
          col2.innerHTML += `<a href="${card.path}" title="More about ${card.title}"><i class="arrow"><img alt="arrow icon" src="/icons/solutions-right.svg"></i></a>`;
        }

        if (col1.innerHTML || col2.innerHTML) {
          row.append(col1);
          row.append(col2);
          rows1.push(row);
        }
      }
    });

    buildSlides(rows1, slideIndicators, carouselId, placeholders, slidesWrapper);
    block.querySelector(':scope > div').remove();
  } else {
    buildSlides(rows, slideIndicators, carouselId, placeholders, slidesWrapper);
  }

  container.append(slidesWrapper);
  block.prepend(container);

  if (!isSingleSlide) {
    bindEvents(block);
  }
}
