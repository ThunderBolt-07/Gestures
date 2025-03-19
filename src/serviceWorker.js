console.log("worker running");

chrome.storage.local
  .set({ cameraState: false })
  .then(() => {
    console.log(" Value is set successfully.");
    chrome.runtime.sendMessage({ message: "check", log: "hi2" });
  })
  .catch((err) => {
    console.error(" Error setting value:", err);
    chrome.runtime.sendMessage({ message: "error", log: err.message });
  });
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "gesture registered") {
    console.log("Gesture registered:", request.gesture);
    const gesture_map = {
      0: "randoms",
      1: "scroll_down",
      2: "scroll_up",
      3: "tab_left",
      4: "tab_right",
    };
    const gesture = gesture_map[request.gesture];
    if (gesture != "randoms") {
      chrome.tabs.query({ currentWindow: true }, function (tabs) {
        const current_tab = tabs.find((tab) => tab.active === true);
        const current_tab_index = current_tab.index;
        if (gesture == "tab_left") {
          const tab_to_shift = tabs[current_tab_index - 1];
          chrome.tabs.update(tab_to_shift.id, { active: true });
          console.log("Tab shifted left");
        } else if (gesture == "tab_right") {
          const tab_to_shift = tabs[current_tab_index + 1];
          chrome.tabs.update(tab_to_shift.id, { active: true });
          console.log("Tab shifted right");
        } else if (gesture == "scroll_down") {
          chrome.tabs.sendMessage(
            tabs[current_tab_index].id,
            { message: "scroll", direction: 1 },
            function (response) {}
          );
          console.log("Scrolled down");
        } else if (gesture == "scroll_up") {
          chrome.tabs.sendMessage(
            tabs[current_tab_index].id,
            { message: "scroll", direction: -1 },
            function (response) {}
          );
          console.log("Scrolled up");
        }
      });
    }
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "models loaded") {
    //console.log("Received from options.js:", request);
    sendMessage();
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message == "check") {
    console.log(request.log);
  }
});

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.message === "cos") {
    //console.log("Received from options.js:", request);
    console.log("loading permisiion from");
    try {
      const existingDocs = await chrome.offscreen.hasDocument();
      console.log(existingDocs);
      if (!existingDocs) {
        await chrome.offscreen.createDocument({
          url: "src/o.html",
          reasons: ["USER_MEDIA"],
          justification: "Camera access for ML model",
        });
      } else {
        console.log("Offscreen document already exists.");
      }
    } catch (error) {
      console.error(
        "Error creating offscreen document:",
        error,
        chrome.runtime.lastError
      );
    }
  }
});
let interval = undefined;
function sendMessage() {
  interval = setInterval(() => {
    chrome.runtime.sendMessage({
      message: "gesture registered",
      time: new Date().getTime(),
    });
    console.log("detection command sent");
  }, 150);
}

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  //console.log(request.message, request.success," hi");
  if (request.message == "camera disabled") {
    //console.log("fired", request);
    if (request.success == true) {

      clearInterval(interval);
      console.log("interval cleared")

    }
  }
});

// chrome.runtime.onConnect.addListener((port) => {
//   console.log("Connected to options.js");

//   port.onDisconnect.addListener(() => {
//     console.log("Port disconnected, service worker might stop.");
//   });

// //   let timeout = setTimeout(() => {
// //     const gesture = "tab_left"; // Example gesture
// //     port.postMessage({
// //       message: "gesture registered",
// //       gesture: gesture,
// //       time: new Date().getTime(),
// //     });
// //     console.log("Message sent to options.js:", gesture);
// // }, 800);

// // To cancel the timeout before it executes
// });
