// Listen for messages from the main thread
onmessage = function (event) {
  if (event.data === 'loadGtag') {
    fetch('https://www.googletagmanager.com/gtag/js?id=GT-PHR6L87')
      .then((response) => response.text())
      .then((data) => {
        // Send the data back to the main thread
        postMessage(data);
      })
      .catch((error) => {
        // Send the error back to the main thread
        postMessage({ error: error.message });
      });
  }
};
