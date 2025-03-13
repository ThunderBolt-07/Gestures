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

    if (gesture == "tab_left") {
      //shift 1 tab left from current tab
      chrome.tabs.query({ currentWindow: true }, function (tabs) {
        const current_tab = tabs.find((tab) => tab.active === true);
        const current_tab_index = current_tab.index;
        const tab_to_shift = tabs[current_tab_index - 1];
        chrome.tabs.update(tab_to_shift.id, { active: true });
      });
      console.log("Tab shifted left");
    } else if(gesture == "tab_right"){
      //shift 1 tab right from current tab
      chrome.tabs.query({ currentWindow: true }, function (tabs) {
        const current_tab = tabs.find((tab) => tab.active === true);
        const current_tab_index = current_tab.index;
        const tab_to_shift = tabs[current_tab_index + 1];
        chrome.tabs.update(tab_to_shift.id, { active: true });
      });
      console.log("Tab shifted left");
    }else if(gesture == "scroll_down"){
      chrome.tabs.query({ currentWindow: true }, function (tabs) {
        const current_tab = tabs.find((tab) => tab.active === true);
        const current_tab_index = current_tab.index;
        chrome.tabs.sendMessage(tabs[current_tab_index].id,{message:"scroll",direction:"down"},function(response) {});
        console.log("Scrolling down");
      });
      
      
    }
    else{
      console.log("Gesture not recognized");
    }
  }
});
// setTimeout(() => {
//   chrome.runtime.sendMessage({message:"request frame","time":new Date().getTime()});
//   console.log("message sent");
// }, 100);

// //({"randoms":0,"scroll_down":1,"scroll_up":2,"tab_left":3,"tab_right":4})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "models loaded") {
    //console.log("Received from options.js:", request);
    sendMessage();
  }
});

function sendMessage() {
  setInterval(() => {
    chrome.runtime.sendMessage({
      message: "gesture registered",
      time: new Date().getTime(),
    });
    //console.log("Message sent to service worker");
  }, 150);
}

chrome.runtime.onConnect.addListener((port) => {
  console.log("Connected to options.js");

  port.onDisconnect.addListener(() => {
    console.log("Port disconnected, service worker might stop.");
  });

  setTimeout(() => {
    const gesture = "tab_left"; // Example gesture
    port.postMessage({
      message: "gesture registered",
      gesture: gesture,
      time: new Date().getTime(),
    });
    console.log("Message sent to options.js:", gesture);
  }, 1000);
});
