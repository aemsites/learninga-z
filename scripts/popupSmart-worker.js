// Listen for messages from the main thread
onmessage = function (event) {
  if (event.data === 'loadPopupSmart') {
    fetch('https://cdn.popupsmart.com/accounts/6030/21310/13/main.js')
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
