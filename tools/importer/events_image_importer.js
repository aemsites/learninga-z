/* eslint-disable max-len */
export default {
  transform: ({
    // eslint-disable-next-line no-unused-vars
    document,
    url,
    params,
  }) => {
    const main = document.querySelector('.event-listing-section');
    const results = [];

    // main page import - "element" is provided, i.e. a docx will be created
    results.push({
      element: main,
      path: new URL(url).pathname
    });

    // find pdf links
    main.querySelectorAll('img').forEach((image) => {
      const src = image.getAttribute('data-msrc');
      if (src) {
        const u = new URL(src, url);
        const newPath = u.pathname;
        // no "element", the "from" property is provided instead - importer will download the "from" resource as "path"
        results.push({
          path: newPath,
          from: u.toString(),
        });

       // update the link to new path on the target host
        // this is required to be able to follow the links in Word
        // you will need to replace "main--repo--owner" by your project setup
        const newHref = new URL(newPath, 'https://main--learninga-z--aemsites.hlx.page').toString();
        image.setAttribute('src', newPath);
      }
    });
    return results;
  },
};