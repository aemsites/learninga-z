/*
 * Embed Block
 * Show videos and social posts directly on your page
 * https://www.hlx.live/developer/block-collection/embed
 */

import { loadCSS, loadScript } from '../../scripts/aem.js';

const getDefaultEmbed = (url) => `<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
      <iframe src="${url.href}" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" allowfullscreen=""
        scrolling="no" allow="encrypted-media" title="Content from ${url.hostname}" loading="lazy">
      </iframe>
    </div>`;

// new youtube embed with lite-youtube
const embedYoutubeFacade = async (url) => {
  await loadCSS('/blocks/embed/lite-yt-embed/lite-yt-embed.css');
  await loadScript('/blocks/embed/lite-yt-embed/lite-yt-embed.js');

  const usp = new URLSearchParams(url.search);
  let videoId = usp.get('v');
  if (url.origin.includes('youtu.be')) {
    videoId = url.pathname.substring(1);
  } else {
    videoId = url.pathname.split('/').pop();
  }
  const wrapper = document.createElement('div');
  wrapper.setAttribute('itemscope', '');
  wrapper.setAttribute('itemtype', 'https://schema.org/VideoObject');
  const litePlayer = document.createElement('lite-youtube');
  litePlayer.setAttribute('videoid', videoId);
  wrapper.append(litePlayer);

  try {
    const response = await fetch(`https://www.youtube.com/oembed?url=http://www.youtube.com/watch?v=${videoId}`);
    const json = await response.json();
    wrapper.innerHTML = `
      <meta itemprop="name" content="${json.title}"/>
      <link itemprop="embedUrl" href="https://www.youtube.com/embed/${videoId}"/>
      <link itemprop="thumbnailUrl" href="${json.thumbnail_url}"/>
      
      ${wrapper.innerHTML}
    `;
  } catch (err) {
    // Nothing to do, metadata just won't be added to the video
  }
  return wrapper.outerHTML;
};

const embedVimeo = (url) => {
  let videoSrc;
  if (url.href.startsWith('https://player.vimeo.com')) {
    videoSrc = url.href;
  } else {
    const [, video] = url.pathname.split('/'); // Extract video id from URL
    videoSrc = `https://player.vimeo.com/video/${video}`;
  }

  const embedHTML = `<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
        <iframe src="${videoSrc}" 
        style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute; border-radius: 15px;" 
        frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen  
        title="Content from Vimeo" loading="lazy"></iframe>
      </div>`;
  return embedHTML;
};

const EMBEDS_CONFIG = {
  vimeo: embedVimeo,
  youtube: embedYoutubeFacade,
};

function getPlatform(url) {
  const [service] = url.hostname.split('.').slice(-2, -1);
  if (service === 'youtu') {
    return 'youtube';
  }
  return service;
}

const loadEmbed = async (block, service, url) => {
  block.classList.toggle('skeleton', true);

  const embed = EMBEDS_CONFIG[service];
  if (!embed) {
    block.classList.toggle('generic', true);
    block.innerHTML = getDefaultEmbed(url);
    return;
  }

  try {
    block.classList.toggle(service, true);
    try {
      block.innerHTML = await embed(url);
    } catch (err) {
      block.style.display = 'none';
    } finally {
      block.classList.toggle('skeleton', false);
    }
  } catch (err) {
    block.style.maxHeight = '0px';
  }
};

/**
 * @param {HTMLDivElement} block
 */
export default async function decorate(block) {
  const url = new URL(block.querySelector('a').href.replace(/%5C%5C_/, '_'));

  block.textContent = '';
  const service = getPlatform(url);
  // Both Youtube and TikTok use an optimized lib that already leverages the intersection observer
  if (service !== 'youtube') {
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) {
        return;
      }

      loadEmbed(block, service, url);
      observer.unobserve(block);
    });
    observer.observe(block);
    return Promise.resolve();
  }
  return loadEmbed(block, service, url);
}
