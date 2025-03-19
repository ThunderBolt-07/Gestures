import * as handpose from "@tensorflow-models/handpose";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl"; // For WebGL acceleration
console.log("TensorFlow.js version");
// Ensure WebGL backend is available

tf.setBackend("webgl").then(() => {
  console.log("WebGL backend loaded");
});

try {
  const video = document.getElementById("video");
  let cameraStream = null;
  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then(async (stream) => {
      cameraStream = stream;
      video.srcObject = stream;
      video.play();
      //chrome.runtime.sendMessage({ message: "check", log: "hi" });

      //await chrome.storage.local.set({ cameraState: true });
      
      //chrome.runtime.sednMessage({message:"set camera state",value:true })
      chrome.runtime.sendMessage({ message: "camera accessed", success: true ,value:true});
    })
    .catch(async (error) => {
      //await chrome.storage.local.set({ cameraState: false });
      chrome.runtime.sendMessage({
        message: "camera accessed",
        success: false,
      });
    });

  chrome.runtime.onMessage.addListener(async (request, sender, response) => {
    if (request.message === "turn off camera") {
      try {
        let tracks = cameraStream.getTracks(); // Get all tracks
        tracks.forEach((track) => track.stop()); // Stop each track
        console.log("Camera is OFF");
        cameraStream = null; // Clear stored stream
        

        chrome.runtime.sendMessage({
          message: "camera disabled",
          success: true,
          cameraState: false,
        });
      } catch (error) {
        chrome.runtime.sendMessage({
          message: "camera disabled",
          success: false,
        });
      }
    }
  });

  // const button = document.getElementById("permission");

  // const canvas = document.getElementById("canvas");
  // const ctx = canvas.getContext("2d");

  // button.addEventListener("click", async () => {
  //   console.log("requesting video");

  //   video.srcObject = stream;
  //   video.play();
  //   console.log("playng video");
  //   // detectandPredictResults();
  // });

  let handpose_model = null;
  let gesture_model = null;

  async function loadModels() {
    console.log("Loading models...");

    [handpose_model, gesture_model] = await Promise.all([
      handpose.load(),
      tf.loadLayersModel("../model/model.json"),
    ]);

    console.log("Models loaded");
    chrome.runtime.sendMessage({ message: "models loaded" });
    //detectandPredictResults()
    //processFrame();
  }
  chrome.runtime.sendMessage({ message: "off_screen", log: "loading models" });
  (async function () {
    await loadModels();
  })();
  let t1 = new Date().getTime();
  let count = 0;
  let prevPredcition = null;

  chrome.runtime.onMessage.addListener(
    async (request, sender, sendResponse) => {
      //console.log("Received from background.js:", new Date().getTime() - t1);
      chrome.runtime.sendMessage({ message: "off_screen", log: "hi" });
      const predictions = await handpose_model.estimateHands(video);
      if (predictions.length > 0 && gesture_model) {
        const hand = predictions[0].landmarks;
        const normalized_landmarks = normalizeHands(hand);
        //console.log("Normalized Landmarks:", normalized_landmarks);
        const tensor = tf.tensor(normalized_landmarks).reshape([1, 42]);
        //tensor.print()
        //console.log("Tensor:", tensor,tensor.shape);
        const gesture_predictions = await gesture_model.predict(tensor).data();
        tensor.dispose();

        const gesture_made = gesture_predictions.indexOf(
          Math.max(...gesture_predictions)
        );
        if (count === 0) {
          prevPredcition = gesture_made;
          count++;
        } else if (prevPredcition != gesture_made) {
          prevPredcition = gesture_made;
          count = 0;
        } else if (prevPredcition == gesture_made) {
          count++;
        }
        if (count == 6) {
          chrome.runtime.sendMessage({
            message: "gesture registered",
            gesture: gesture_made,
          });
          count = 0;
          console.log("message sent");
        }
        t1 = new Date().getTime();
        console.log("gesture made is:", gesture_made);
      }
    }
  );

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === "request frame") {
      //detectandPredictResults();
      console.log("Requesting frame");
      console.log(new Date().getTime() - request.time);
    }
  });

  chrome.runtime.onConnect.addListener((port) => {
    console.log("Connected to service worker");

    port.onMessage.addListener((msg) => {
      console.log("Received from service worker:", msg);
      console.log("Requesting frame");
      console.log(new Date().getTime() - msg.time);
      if (msg.message === "gesture registered") {
        console.log("Gesture Detected:", msg.gesture);
      }
    });

    port.onDisconnect.addListener(() => {
      console.log("Disconnected from service worker");
    });
  });

  function normalizeHands(hand) {
    //console.log(hand);
    let minX = hand[0][0],
      maxX = hand[0][0],
      minY = hand[0][1],
      maxY = hand[0][1];
    for (let i = 0; i < hand.length; i++) {
      minX = Math.min(minX, hand[i][0]);
      maxX = Math.max(maxX, hand[i][0]);
      minY = Math.min(minY, hand[i][1]);
      maxY = Math.max(maxY, hand[i][1]);
    }
    const x_values = hand.map((point) => (point[0] - minX) / (maxX - minX));
    const y_values = hand.map((point) => (point[1] - minY) / (maxY - minY));
    return [...x_values, ...y_values];
  }
} catch (error) {
  chrome.runtime.sendMessage({ message: "check", log: "error" });
}
