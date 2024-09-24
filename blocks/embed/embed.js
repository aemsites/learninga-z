import { loadCSS } from '../../scripts/aem.js';

const loadScript = (url, callback, type) => {
  const head = document.querySelector('head');
  const script = document.createElement('script');
  script.src = url;
  if (type) {
    script.setAttribute('type', type);
  }
  script.onload = callback;
  head.append(script);
  return script;
};

const getDefaultEmbed = (url) => `<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
      <iframe src="${url.href}" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute; border-radius: 15px;" allowfullscreen=""
        scrolling="no" allow="encrypted-media" title="Content from ${url.hostname}" loading="lazy">
      </iframe>
    </div>`;
/*
// original youtube embed
const embedYoutube = (url, autoplay) => {
  const usp = new URLSearchParams(url.search);
  const suffix = autoplay ? '&muted=1&autoplay=1' : '';
  let vid = usp.get('v') ? encodeURIComponent(usp.get('v')) : '';
  const embed = url.pathname;
  if (url.origin.includes('youtu.be')) {
    [, vid] = url.pathname.split('/');
  }
  const embedHTML = `<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
        <iframe src="https://www.youtube.com${vid ? `/embed/${vid}?rel=0&v=${vid}${suffix}` : embed}" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;"
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope; picture-in-picture" allowfullscreen="" scrolling="no" title="Content from Youtube" loading="lazy"></iframe>
      </div>`;
  return embedHTML;
};
 */

// new youtube embed with lite-youtube
const embedYoutube = (url, isLite) => {
  const usp = new URLSearchParams(url.search);
  let suffix = '';
  let vid = usp.get('v');
  const autoplayParam = usp.get('autoplay');
  const mutedParam = usp.get('muted');

  if (autoplayParam && mutedParam) {
    suffix += `&autoplay=${autoplayParam}&muted=${mutedParam}`;
  } else if (autoplayParam) {
    suffix += `&autoplay=${autoplayParam}&muted=1`;
  } else if (mutedParam) {
    suffix += `&muted=${mutedParam}`;
  }

  const embed = url.pathname;
  if (url.origin.includes('youtu.be')) {
    [, vid] = url.pathname.split('/');
  }

  let embedHTML;

  if (isLite) {
    const embedSplit = embed.split('/');
    embedHTML = `
      <lite-youtube videoid=${vid || embedSplit[embedSplit.length - 1]}>
        <a href="https://www.youtube.com${vid ? `/embed/${vid}?rel=0&v=${vid}${suffix}` : embed}" class="lty-playbtn" title="Play Video">
      </a>
      </lite-youtube>`;
    loadCSS(`${window.hlx.codeBasePath}/blocks/embed/lite-yt-embed.css`, { defer: true });
    loadScript(`${window.hlx.codeBasePath}/blocks/embed/lite-yt-embed.js`, { defer: true });
  } else {
    embedHTML = `<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
        <iframe src="https://www.youtube.com${vid ? `/embed/${vid}?rel=0&v=${vid}${suffix}` : embed}" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute; border-radius: 15px;" 
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope; picture-in-picture" scrolling="no" title="Content from Youtube" loading="lazy"></iframe>
      </div>`;
  }

  return embedHTML;
};

const embedVimeo = (url, autoplay) => {
  const [, video] = url.pathname.split('/');
  const suffix = autoplay ? '?muted=1&autoplay=1' : '';
  const embedHTML = `<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
        <iframe src="https://player.vimeo.com/video/${video}${suffix}" 
        style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" 
        frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen  
        title="Content from Vimeo" loading="lazy"></iframe>
      </div>`;
  return embedHTML;
};

const loadEmbed = (block, link) => {
  if (block.classList.contains('embed-is-loaded')) {
    return;
  }

  const EMBEDS_CONFIG = [
    {
      match: ['youtube', 'youtu.be'],
      embed: embedYoutube,
    },
    {
      match: ['vimeo'],
      embed: embedVimeo,
    },
  ];

  const config = EMBEDS_CONFIG.find((e) => e.match.some((match) => link.includes(match)));
  const url = new URL(link);
  const isLite = block.classList.contains('lite');

  if (config) {
    block.innerHTML = config.embed(url, isLite);
    block.classList = `block embed embed-${config.match[0]}`;
  } else {
    block.innerHTML = getDefaultEmbed(url);
    block.classList = 'block embed';
  }
  block.classList.add('embed-is-loaded');
};

export default function decorate(block) {
//  const placeholder = block.querySelector('picture');
  const link = block.querySelector('a').href;
  block.textContent = '';

  /*
  if (placeholder) {
    const wrapper = document.createElement('div');
    wrapper.className = 'embed-placeholder';
    wrapper.innerHTML = '<div class="embed-placeholder-play"><button type="button" title="Play"></button></div>';
    wrapper.prepend(placeholder);
    wrapper.addEventListener('click', () => {
      loadEmbed(block, link, true);
    });
    block.append(wrapper);
  } else {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        observer.disconnect();
        loadEmbed(block, link);
      }
    });
    observer.observe(block);
  }

   */

  if (block.closest('body')) {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        observer.disconnect();
        loadEmbed(block, link);
      }
    });
    observer.observe(block);
  } else {
    loadEmbed(block, link);
  }
}
