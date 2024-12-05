// Listen for messages from the main thread
onmessage = function (event) {
  if (event.data === 'loadGTM') {
    const scriptPath = 'https://www.googletagmanager.com/gtm.js?id=GTM-NXTTWP';
    fetch(scriptPath)
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
