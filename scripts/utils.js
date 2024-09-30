import ffetch from './ffetch.js';

const INDEX = '/query-index.json';
const VIDEO_INDEX = '/site/resources/videos/query-index.json';

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
  const first = await fetch(`${index}?limit=${limit}`)
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
        fetch(`${INDEX}?offset=${offset}&limit=${limit}`)
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

const taxonomyEndpoint = '/taxonomy.json';
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
  const listItem = document.createElement('li');
  const link = document.createElement('a');
  const currentPagePath = window.location.pathname;
  const currentPageQuery = window.location.search;
  link.href = `${currentPagePath}${currentPageQuery}#page=${pageNumber}`;
  link.onclick = scrollTop;
  link.textContent = text;

  if (className) {
    link.classList.add(className);
  }

  listItem.appendChild(link);
  return listItem;
}

export function generatePagination(currentPage, totalPages) {
  const displayPages = 5;
  const paginationList = document.createElement('ol');
  paginationList.className = 'pagination';

  // Previous page link
  if (currentPage > 1) {
    paginationList.appendChild(createPageLink(currentPage - 1, '«', 'prev'));
  }

  // Page links
  const startPage = Math.max(1, currentPage - Math.floor(displayPages / 2));
  const endPage = Math.min(totalPages, startPage + displayPages - 1);

  if (startPage > 1) {
    paginationList.appendChild(createPageLink(1, '1'));
    if (startPage > 2) {
      paginationList.appendChild(createEllipsis());
    }
  }

  for (let i = startPage; i <= endPage; i += 1) {
    if (i === currentPage) {
      paginationList.appendChild(createPageLink(i, i, 'active'));
    } else {
      paginationList.appendChild(createPageLink(i, i));
    }
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      paginationList.appendChild(createEllipsis());
    }
    paginationList.appendChild(createPageLink(totalPages, totalPages));
  }

  // Next page link
  if (currentPage < totalPages) {
    paginationList.appendChild(createPageLink(currentPage + 1, '»', 'next'));
  }
  return paginationList;
}
