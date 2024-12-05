// Listen for messages from the main thread
onmessage = function (event) {
  if (event.data === 'loadIntercom') {
    fetch('https://widget.intercom.io/widget/x8m18b9a')
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
