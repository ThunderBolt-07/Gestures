// const button=document.getElementById("permission")
// button.addEventListener("click", async () => {
//     //console.log("creating doc")
//     chrome.runtime.sendMessage({message:"cos"})
// });

document.addEventListener('DOMContentLoaded', async function() {
  // Your JavaScript code here
  const cameraToggle = document.getElementById("cameraToggle");
  const data=await chrome.storage.local.get("cameraState");

  cameraToggle.checked=data.cameraState
  //console.log("camera sate intially set to ",data.cameraState);
  
});

const cameraToggle = document.getElementById("cameraToggle");
const cameraStatus = document.getElementById("cameraStatus");

cameraToggle.addEventListener("change", async function (event) {
  ////console.log("fired")
  cameraToggle.disabled = true; // Disable toggle while processing
  ////console.log(chrome.storage.local.get(["cameraState"]," is satate"))
  const cameraState=await chrome.storage.local.get("cameraState");
  const isTurningOn = cameraToggle.checked;
  //console.log(cameraState.cameraState," world")


  cameraStatus.textContent = isTurningOn ? "Turning On..." : "Turning Off...";
  if (isTurningOn) {
    console.log("requestinga access from popup")
    chrome.runtime.sendMessage({ message: "cos" });
  } else {
    ////console.log(" hi from dis")
    chrome.runtime.sendMessage({ message: "turn off camera" });
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => {
          registration.unregister().then(() => {
              ////console.log("Service Worker unregistered");
          });
      });
  });
  }

  chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    //////console.log(request.message, request.success," hi");
    if (request.message == "camera disabled") {
      ////console.log("fired",request)
      if (request.success == true) {
        cameraStatus.textContent = "Camera Off";
        await chrome.storage.local.set({ cameraState: false })
        ////console.log("camera sate set to false");
        
      } else {
        //console.log("hello");
        cameraToggle.checked = request.success;
        cameraStatus.textContent = "Error! Try Again.";
      }
      cameraToggle.disabled = false;
      const existingDocs = await chrome.offscreen.hasDocument();
      //console.log(existingDocs," are docs")
      chrome.offscreen
        .closeDocument()
        .then(() => console.log("")
        ).catch((error) => console.error("fialed to clsoe document", error)
        );
    }
    // Re-enable toggle after action
  });

  chrome.runtime.onMessage.addListener(async (request, sender, response) => {
    
    if (request.message == "camera accessed") {
      console.log(request," camera access response");
      //console.log("accessed camera 2")
      if (request.success == true) {
        cameraStatus.textContent = "Camera On"
        await chrome.storage.local.set({ cameraState: true })
        //console.log("camera sate set to false");

      } else {
        //console.log("hello");
        cameraToggle.checked = request.success;
        cameraStatus.textContent = "Error! Try Again.";
        await chrome.storage.local.set({ cameraState: false })
        chrome.offscreen
        .closeDocument()
        .then(() => console.log("")
        ).catch((error) => console.error("fialed to clsoe document", error)
        );
        //console.log("camera sate set to false");
      }
      cameraToggle.disabled = false;
    }
    // Re-enable toggle after action
  });
});

// // Simulate async camera activation
// setTimeout(() => {
//     cameraStatus.textContent = isTurningOn ? "Camera On" : "Camera Off";
//     cameraToggle.disabled = false; // Re-enable toggle after action
// }, 1500); // Simulate 1.5s processing delay

document.getElementById("powerSaveBtn").addEventListener("click", function () {
  this.textContent = this.textContent.includes("Enable")
    ? "Disable Power Saving"
    : "Enable Power Saving";
});
