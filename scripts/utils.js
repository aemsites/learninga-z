const INDEX = '/query-index.json';

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

const indexData = [];
/**
 * Retrieves index data from the query-index file.
 * @returns {Promise<Array>} A promise that resolves to an array of index data.
 */
export async function getIndexData() {
  if (!indexData.length) {
    const limit = 500;
    const first = await fetch(`${INDEX}?limit=${limit}`)
      .then((resp) => {
        if (resp.ok) {
          return resp.json();
        }
        return {};
      });

    const { total } = first;
    if (total) {
      indexData.push(...first.data);
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
          indexData.push(...list);
        });
      });
    }
  }

  // Protected against callers modifying the objects
  return structuredClone(indexData);
}
