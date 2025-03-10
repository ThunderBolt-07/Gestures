chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "gesture registered") {
    console.log("Gesture registered:", request.gesture);
  }
})