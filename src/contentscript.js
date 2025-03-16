console.log("✅ Content script running");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("📩 Message received at content script:", request);

  const speeds = [4.35, 11.00, 0.00, 13.46, 0.00, 24.64, 17.33, 0.00, 25.40, 0.00, 20.62, 0.00, 18.52, 30.56, 0.00];

  if (request.message === "scroll") {
    console.log("⬇️ Scrolling...");

    let times_run = 0;
    let S0 = 60; // Max speed
    let k = 5; // Controls acceleration
    let x_m = 10; // Midpoint of smooth transition

    let interval = setInterval(function () {
      times_run++;

      //let speed = S0 / (1 + Math.exp(-k * (times_run - x_m))); // Sigmoid function
      let speed=speeds[(times_run-1)%speeds.length]
      window.scrollBy(0, speed * request.direction);
      console.log("scrolled at", speed);

      if (times_run >= 30) {
        clearInterval(interval);
      }
    }, 20);
    //window.scrollBy(0, 400*request.direction,{behaviour:"smooth"});
  }

  // ✅ Send a response back to prevent the error
  sendResponse({ status: "✅ Scroll action performed" });

  return true; // ✅ Keeps the message port open for async response
});
