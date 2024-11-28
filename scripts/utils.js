/* eslint-disable max-len */
import ffetch from './ffetch.js';
import { BLOCKED_COUNTRIES } from './constants.js';

const INDEX = '/query-index.json';
const VIDEO_INDEX = '/site/resources/videos/query-index.json';
const NEWS_INDEX = '/site/company/news/query-index.json?sheet=news-sorted';
const EXTERNAL_NEWS_INDEX = '/site/company/news/query-index.json?sheet=external_news';
const EVENTS_LIST = '/site/company/events/events-list.json';
const DOWNLOAD_LIBRARY_INDEX = '/site/resources/download-library/query-index.json';
const AWARDS_LIST = '/site/company/awards-n-accolades/awards.json';
const REVIEWS_N_TESTIMONIALS = '/site/company/reviews-and-testimonials/testimonials.json';
const BLOGS_INDEX = '/site/resources/breakroom-blog/query-index.json';
const AUTHORS = '/site/resources/breakroom-blog/authors/query-index.json';

/**
 * Returns the relative path from a given path.
 * If the path is a URL, it extracts the pathname.
 * @param {string} path - The path to get the relative path from.
 * @returns {string} - The relative path.
 */
export function getRelativePath(path) {
  let relPath = path;
  try {
    const url = new URL(path);
    relPath = url.pathname;
  } catch (error) {
    // do nothing
  }
  return relPath;
}

/**
 * Retrieves data from an index.
 * @param {string} [index=INDEX] - The index to retrieve data from.
 * @returns {Promise<Array>} - A promise that resolves to an array of retrieved data.
 */
async function getIndexData(index = INDEX) {
  const retrievedData = [];
  const limit = 500;

  // Helper function to append query parameters correctly
  const appendQuery = (url, param) => (url.includes('?') ? `${url}&${param}` : `${url}?${param}`);

  const first = await fetch(appendQuery(index, `limit=${limit}`))
    .then((resp) => {
      if (resp.ok) {
        return resp.json();
      }
      return {};
    });

  const { total } = first;
  if (total) {
    retrievedData.push(...first.data);
    const promises = [];
    const buckets = Math.ceil(total / limit);
    for (let i = 1; i < buckets; i += 1) {
      promises.push(new Promise((resolve) => {
        const offset = i * limit;
        fetch(appendQuery(index, `offset=${offset}&limit=${limit}`))
          .then((resp) => {
            if (resp.ok) {
              return resp.json();
            }
            return {};
          })
          .then((json) => {
            const { data } = json;
            if (data) {
              resolve(data);
            }
            resolve([]);
          });
      }));
    }

    await Promise.all(promises).then((values) => {
      values.forEach((list) => {
        retrievedData.push(...list);
      });
    });
  }
  return retrievedData;
}

const authors = [];
/**
 * Retrieves the authors from the index.
 * @returns {Promise<Array>} A promise that resolves to an array of authors.
 */
export async function getAuthors() {
  if (!authors.length) {
    authors.push(...await getIndexData(AUTHORS));
  }
  // Protected against callers modifying the objects
  return structuredClone(authors);
}

const reviewsData = [];
/**
 * Retrieves the reviews and testimonials from spreadsheet.
 * @returns {Promise<Array>} A promise that resolves to an array of videos index data.
 */
export async function getReviews() {
  if (!reviewsData.length) {
    reviewsData.push(...await getIndexData(REVIEWS_N_TESTIMONIALS));
  }
  // Protected against callers modifying the objects
  return structuredClone(reviewsData);
}

const awardsListData = [];
/**
 * Retrieves the awards list data.
 * @returns {Promise<Array>} A promise that resolves to an array of events list data.
 */
export async function getAwardsListData() {
  if (!awardsListData.length) {
    awardsListData.push(...await getIndexData(AWARDS_LIST));
  }
  // Protected against callers modifying the objects
  return structuredClone(awardsListData);
}

const eventsListData = [];
/**
 * Retrieves the events list data.
 * @returns {Promise<Array>} A promise that resolves to an array of events list data.
 */
export async function getEventsListData() {
  if (!eventsListData.length) {
    eventsListData.push(...await getIndexData(EVENTS_LIST));
  }
  // Protected against callers modifying the objects
  return structuredClone(eventsListData);
}

const siteSearchIndex = [];
/**
 * Retrieves the videos index data.
 * @returns {Promise<Array>} A promise that resolves to an array of videos index data.
 */
// TODO: Add https://main--learninga-z--aemsites.hlx.page/site/company/news/query-index.json?sheet=external_news
export async function getSiteSearchIndexData() {
  if (!siteSearchIndex.length) {
    siteSearchIndex.push(...await getIndexData(INDEX));
    siteSearchIndex.push(...await getIndexData(EXTERNAL_NEWS_INDEX));
  }
  // Protected against callers modifying the objects
  return structuredClone(siteSearchIndex);
}

const newsIndexData = [];
/**
 * Retrieves the videos index data.
 * @returns {Promise<Array>} A promise that resolves to an array of videos index data.
 */
export async function getNewsIndexData() {
  if (!newsIndexData.length) {
    newsIndexData.push(...await getIndexData(NEWS_INDEX));
  }
  // Protected against callers modifying the objects
  return structuredClone(newsIndexData);
}

const downloadsIndexData = [];
export async function getDownloadsIndexData(path = DOWNLOAD_LIBRARY_INDEX) {
  if (!downloadsIndexData.length) {
    downloadsIndexData.push(...await getIndexData(path));
  }
  // Protected against callers modifying the objects
  return structuredClone(downloadsIndexData);
}

const videosIndexData = [];
/**
 * Retrieves the videos index data.
 * @returns {Promise<Array>} A promise that resolves to an array of videos index data.
 */
export async function getVideosIndexData() {
  if (!videosIndexData.length) {
    videosIndexData.push(...await getIndexData(VIDEO_INDEX));
  }
  // Protected against callers modifying the objects
  return structuredClone(videosIndexData);
}

/**
 * Retrieves the blogs index data.
 * * @returns {Promise<Array>} A promise that resolves to an array of blogs index data.
 */
const blogsIndexData = [];
export async function getBlogsIndexData() {
  if (!blogsIndexData.length) {
    blogsIndexData.push(...await getIndexData(BLOGS_INDEX));
  }
  // Protected against callers modifying the objects
  return structuredClone(blogsIndexData);
}

let indexData = null;
/**
 * Retrieves index data from the query-index file.
 * @returns {Promise<Array>} A promise that resolves to an array of index data.
 */
export const getGenericIndexData = (() => async () => {
  if (!indexData) {
    indexData = await getIndexData();
  }
  // Protected against callers modifying the objects
  return structuredClone(indexData);
})();

/**
 * Returns the index data for a specific path.
 * @param name
 * @returns {string}
 */
// export async function getIndexDataByPath(name) {
function titleToName(name) {
  return name.toLowerCase().replace(' ', '-');
}

const taxonomyEndpoint = '/tools/taxonomy.json';
let taxonomyPromise;
function fetchTaxonomy() {
  if (!taxonomyPromise) {
    taxonomyPromise = new Promise((resolve, reject) => {
      (async () => {
        try {
          const taxonomyJson = await ffetch(taxonomyEndpoint).all();
          const taxonomy = {};
          let curType;
          let l1;
          let l2;
          let l3;
          taxonomyJson.forEach((row) => {
            if (row.Type) {
              curType = row.Type;
              taxonomy[curType] = {
                title: curType,
                name: titleToName(curType),
                path: titleToName(curType),
                hide: row.hide,
              };
            }

            if (row['Level 1']) {
              l1 = row['Level 1'];
              taxonomy[curType][l1] = {
                title: l1,
                name: titleToName(l1),
                path: `${titleToName(curType)}/${titleToName(l1)}`,
                hide: row.hide,
              };
            }
            if (row['Level 2']) {
              l2 = row['Level 2'];
              taxonomy[curType][l1][l2] = {
                title: l2,
                name: titleToName(l2),
                path: `${titleToName(curType)}/${titleToName(l1)}/${titleToName(l2)}`,
                hide: row.hide,
              };
            }

            if (row['Level 3']) {
              l3 = row['Level 3'];
              taxonomy[curType][l1][l2][l3] = {
                title: l3,
                name: titleToName(l3),
                path: `${titleToName(curType)}/${titleToName(l1)}/${titleToName(l2)}/${titleToName(l3)}`,
                hide: row.hide,
              };
            }
          });
          resolve(taxonomy);
        } catch (e) {
          reject(e);
        }
      })();
    });
  }

  return taxonomyPromise;
}

const getDeepNestedObject = (obj, filter) => Object.entries(obj)
  .reduce((acc, [key, value]) => {
    let result = [];
    if (key === filter) {
      result = acc.concat(value);
    } else if (typeof value === 'object') {
      result = acc.concat(getDeepNestedObject(value, filter));
    } else {
      result = acc;
    }
    return result;
  }, []);

/**
 * Get the taxonomy of a hierarchical json object
 * @returns {Promise} the taxonomy
 */
export function getTaxonomy() {
  return fetchTaxonomy();
}

/**
 * Returns a taxonomy category as an array of objects
 * @param {*} category
 */
export const getTaxonomyCategory = async (category) => {
  const taxonomy = await getTaxonomy();
  return getDeepNestedObject(taxonomy, category)[0];
};

// Function to create ellipsis
function createEllipsis() {
  const listItem = document.createElement('li');
  const a = document.createElement('a');
  const span = document.createElement('span');
  a.className = 'gap';
  span.textContent = '...';
  a.appendChild(span);
  listItem.appendChild(a);
  return listItem;
}

export function scrollTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Function to create a page link
function createPageLink(pageNumber, text, className) {
  const link = document.createElement('a');
  const currentPagePath = window.location.pathname;
  const currentPageQuery = window.location.search;
  if (className !== 'active') {
    link.href = `${currentPagePath}${currentPageQuery}#page=${pageNumber}`;
  }
  link.onclick = scrollTop;
  link.textContent = text;

  if (className) {
    link.classList.add(className);
  }

  return link;
}

export function generatePagination(paginationContainer, currentPage, totalPages) {
  const displayPages = 5;
  const paginationList = document.createElement('ul');
  paginationList.className = 'pagination';

  // Previous page link
  const prevDiv = document.createElement('div');
  prevDiv.className = 'prev';
  if (currentPage === 1) {
    prevDiv.appendChild(createPageLink(currentPage - 1, '< PREVIOUS', 'active'));
  } else {
    prevDiv.appendChild(createPageLink(currentPage - 1, '< PREVIOUS'));
  }
  paginationContainer.appendChild(prevDiv);

  // Page links
  const startPage = Math.max(1, currentPage - Math.floor(displayPages / 2));
  const endPage = Math.min(totalPages, startPage + displayPages - 1);

  if (startPage > 1) {
    const li = document.createElement('li');
    li.appendChild(createPageLink(1, '1'));
    paginationList.appendChild(li);
    if (startPage > 2) {
      paginationList.appendChild(createEllipsis());
    }
  }

  for (let i = startPage; i <= endPage; i += 1) {
    const li = document.createElement('li');
    if (i === currentPage) {
      li.appendChild(createPageLink(i, i, 'active'));
    } else {
      li.appendChild(createPageLink(i, i));
    }
    paginationList.appendChild(li);
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      paginationList.appendChild(createEllipsis());
    }
    const li = document.createElement('li');
    li.appendChild(createPageLink(totalPages, totalPages));
    paginationList.appendChild(li);
  }

  paginationContainer.appendChild(paginationList);

  // Next page link
  const nextDiv = document.createElement('div');
  nextDiv.className = 'next';
  if (currentPage < totalPages) {
    nextDiv.appendChild(createPageLink(currentPage + 1, 'NEXT >'));
  } else {
    nextDiv.appendChild(createPageLink(currentPage + 1, 'NEXT >', 'active'));
  }
  paginationContainer.appendChild(nextDiv);
}

export function getDateRange(startDate, endDate) {
  if (startDate.getFullYear() === endDate.getFullYear()) {
    if (startDate.getMonth() === endDate.getMonth()) {
      return `${startDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })} - ${endDate.getDate()}, ${endDate.toLocaleDateString('en-US', {
        year: 'numeric',
      })}`;
    }
    return `${startDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })} - ${endDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })}, ${endDate.toLocaleDateString('en-US', {
      year: 'numeric',
    })}`;
  }
  return `${startDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })}, ${startDate.toLocaleDateString('en-US', {
    year: 'numeric',
  })} - ${endDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })}, ${endDate.toLocaleDateString('en-US', {
    year: 'numeric',
  })}`;
}

/**
 * Extracts pricing information from the pricing cookie and assigns it to the global
 * window.pricing object.
 * The function looks for specific product numbers and assigns their prices,
 * discount prices, and order URLs
 * to corresponding properties in the window.pricing object.
 *
 * @function
 * @name extractPrices
 */
export function extractPrices() {
  const pricingCookie = document.cookie.split('; ').find((row) => row.startsWith('pricing'));
  if (!pricingCookie) return;

  const pricing = JSON.parse(pricingCookie.substring(pricingCookie.indexOf('=') + 1));
  if (!pricing || !pricing.productPrice) return;

  // if prices have only 0s after the decimal point, remove them
  const formatPrice = (price) => {
    const numPrice = Number(price);
    return (numPrice % 1 === 0 ? numPrice.toFixed(0) : numPrice.toFixed(2));
  };

  const findProduct = (productNumber) => pricing.productPrice.find((product) => product.productNumber === productNumber);

  const razProduct = findProduct('RAZ-INDV');
  if (razProduct) {
    window.pricing.razOriginalPrice = formatPrice(razProduct.price);
    window.pricing.razDiscountPrice = formatPrice(razProduct.discountPrice);
    window.pricing.razOrderUrl = razProduct.orderUrl;
  }

  const rkProduct = findProduct('RK-INDV');
  if (rkProduct) {
    window.pricing.rkOriginalPrice = formatPrice(rkProduct.price);
    window.pricing.rkDiscountPrice = formatPrice(rkProduct.discountPrice);
    window.pricing.rkOrderUrl = rkProduct.orderUrl;
  }

  const rpProduct = findProduct('RP-INDV');
  if (rpProduct) {
    window.pricing.rpOriginalPrice = formatPrice(rpProduct.price);
    window.pricing.rpDiscountPrice = formatPrice(rpProduct.discountPrice);
    window.pricing.rpOrderUrl = rpProduct.orderUrl;
  }

  const fazProduct = findProduct('FAZ-INDV');
  if (fazProduct) {
    window.pricing.fazOriginalPrice = formatPrice(fazProduct.price);
    window.pricing.fazDiscountPrice = formatPrice(fazProduct.discountPrice);
    window.pricing.fazOrderUrl = fazProduct.orderUrl;
  }

  const vocabProduct = findProduct('VOCAB-INDV');
  if (vocabProduct) {
    window.pricing.vocabOriginalPrice = formatPrice(vocabProduct.price);
    window.pricing.vocabDiscountPrice = formatPrice(vocabProduct.discountPrice);
    window.pricing.vocabOrderUrl = vocabProduct.orderUrl;
  }

  const sazProduct = findProduct('SAZ-INDV');
  if (sazProduct) {
    window.pricing.sazOriginalPrice = formatPrice(sazProduct.price);
    window.pricing.sazDiscountPrice = formatPrice(sazProduct.discountPrice);
    window.pricing.sazOrderUrl = sazProduct.orderUrl;
  }

  const wazProduct = findProduct('WAZ-AZ-INDV');
  if (wazProduct) {
    window.pricing.wazOriginalPrice = formatPrice(wazProduct.price);
    window.pricing.wazDiscountPrice = formatPrice(wazProduct.discountPrice);
    window.pricing.wazOrderUrl = wazProduct.orderUrl;
  }

  const rpccProduct = findProduct('RPCC-INDV');
  if (rpccProduct) {
    window.pricing.rpccOriginalPrice = formatPrice(rpccProduct.price);
    window.pricing.rpccDiscountPrice = formatPrice(rpccProduct.discountPrice);
    window.pricing.rpccOrderUrl = rpccProduct.orderUrl;
  }

  const razEllProduct = findProduct('RAZ-ELL-INDV');
  if (razEllProduct) {
    window.pricing.razEllOriginalPrice = formatPrice(razEllProduct.price);
    window.pricing.razEllDiscountPrice = formatPrice(razEllProduct.discountPrice);
    window.pricing.razEllOrderUrl = razEllProduct.orderUrl;
  }

  const espProduct = findProduct('ESP-INDV');
  if (espProduct) {
    window.pricing.espOriginalPrice = formatPrice(espProduct.price);
    window.pricing.espDiscountPrice = formatPrice(espProduct.discountPrice);
    window.pricing.espOrderUrl = espProduct.orderUrl;
  }
}

// eslint-disable-next-line no-unused-vars
/**
 * Fetches pricing information from the Learning A-Z API.
 *
 * @param {string} ip - The IP address to be sent in the request payload.
 * @returns {Promise<void>} - A promise that resolves when the API call is complete.
 *
 * The function constructs a request payload including the IP address and a list of products.
 * If a referral code (refc) is found in the cookies, it is included in the payload.
 * The request is sent to the Learning A-Z pricing API endpoint.
 * On success, the response is logged to the console.
 * On failure, the error is logged to the console.
 */
const makePricingApiCall = async (ip) => {
  // get refc cookie value
  const refcCookie = document.cookie.split('; ').find((row) => row.startsWith('refc'));
  const refc = refcCookie ? refcCookie.split('=')[1] : '';

  const pricingHeaders = new Headers();
  pricingHeaders.append('Content-Type', 'application/json');
  pricingHeaders.append('Accept', 'application/json');

  const raw = JSON.stringify({
    ipAddress: ip,
    product: [
      {
        productNumber: 'RAZ-INDV',
        ...(refc && { referralCode: refc }),
      },
      {
        productNumber: 'RK-INDV',
        ...(refc && { referralCode: refc }),
      },
      {
        productNumber: 'RP-INDV',
        ...(refc && { referralCode: refc }),
      },
      {
        productNumber: 'FAZ-INDV',
        ...(refc && { referralCode: refc }),
      },
      {
        productNumber: 'VOCAB-INDV',
        ...(refc && { referralCode: refc }),
      },
      {
        productNumber: 'SAZ-INDV',
        ...(refc && { referralCode: refc }),
      },
      {
        productNumber: 'WAZ-AZ-INDV',
        ...(refc && { referralCode: refc }),
      },
      {
        productNumber: 'RPCC-INDV',
        ...(refc && { referralCode: refc }),
      },
      {
        productNumber: 'RAZ-ELL-INDV',
        ...(refc && { referralCode: refc }),
      },
      {
        productNumber: 'ESP-INDV',
        ...(refc && { referralCode: refc }),
      },
    ],
  });

  const requestOptions = {
    method: 'POST',
    headers: pricingHeaders,
    body: raw,
    redirect: 'follow',
  };

  fetch('https://api.learninga-z.com/v1/marketing/get-price', requestOptions)
    .then((response) => response.json())
    .then((result) => {
      if (result) {
        const expiryDate = new Date();
        expiryDate.setTime(expiryDate.getTime() + (48 * 60 * 60 * 1000)); // 48 hours from now
        document.cookie = `pricing=${JSON.stringify(result)};expires=${expiryDate.toUTCString()};path=/`;
        extractPrices();
      }
    })
    .catch((error) => console.error(error));
};

/**
 * Fetches the user's location and IP address from Cloudflare's trace endpoint.
 * If the user's location is in the list of blocked countries, sets the pricing
 * blocked flag to true. Otherwise, sets the pricing blocked flag to false and
 * calls the pricing API with the user's IP address.
 */
export const pricingApi = async (forceSetPrice = false) => {
  const response = await fetch('https://www.cloudflare.com/cdn-cgi/trace');
  const text = await response.text();
  const ip = text.match(/ip=(.*)/)[1];
  const loc = text.match(/loc=(.*)/)[1];
  window.pricing = window.pricing || {};
  if (BLOCKED_COUNTRIES.includes(loc)) {
    window.pricing.blocked = true;
  } else {
    window.pricing.blocked = false;
    if (!document.cookie.includes('pricing') || forceSetPrice) {
      await makePricingApiCall(ip);
      extractPrices();
    } else {
      extractPrices();
    }
  }
};
