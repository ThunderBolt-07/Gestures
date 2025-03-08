import * as handpose from "@tensorflow-models/handpose";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl"; // For WebGL acceleration
console.log("TensorFlow.js version");
// Ensure WebGL backend is available

tf.setBackend("webgl").then(() => {
  console.log("WebGL backend loaded");
});

const video = document.getElementById("video");
const button = document.getElementById("permission");

button.addEventListener("click", async () => {
  console.log("requesting video");
  const stream = await navigator.mediaDevices.getUserMedia({
    video: {},
  });
  video.srcObject = stream;
  video.play();
  console.log("playng video");
 // detectandPredictResults();
});
let handpose_model = null;
let gesture_model = null;

async function loadModels() {
  console.log("Loading models...");

  [handpose_model, gesture_model] = await Promise.all([
    handpose.load(),
    tf.loadLayersModel("../model/model.json"),
  ]);

  console.log("Models loaded");
  detectandPredictResults()
}

loadModels();

// async function detectandPredictResults() {
//   //rruning hande detectiob every 30 ms

//   for (let i = 1; i < 1000000000; i++) {
//     if (i % 100000000 == 0) {
//       i=1;
//       if (handpose_model) {
//         const predictions = await handpose_model.estimateHands(
//           document.querySelector("video")
//         );
//         if (predictions.length > 0 && gesture_model) {
//           const hand = predictions[0].landmarks;
//           const normalized_landmarks=normalizeHands(hand);
//           console.log(normalized_landmarks);
//           console.log("Hand detected");
          
//         }else{
//           console.log("Gesture model not loaded",predictions);
//         }
//       }else{
//         console.log("Handpose model not loaded");
//       } 
//     }
//   }
//   console.log("Loading Handpose model...");
// }

async function detectandPredictResults() {
  
  for(let i=1;i<1000000000;i++){
    if(i%50000000==0){
      i=1;
      if(handpose_model){
        const predictions = await handpose_model.estimateHands(video);
        if(predictions.length>0 && gesture_model){
          const hand = predictions[0].landmarks;
          const normalized_landmarks = normalizeHands(hand);
          console.log("Hand detected:", normalized_landmarks);
        }else{
          console.log("No hand detected or gesture model not loaded");
        }
      }else{
        console.log("Handpose model not loaded");
      }
      await new Promise((resolve) => setTimeout(resolve, 30));
    }
  }
  // const predictions = await handpose_model.estimateHands(video);

  // if (predictions.length > 0 && gesture_model) {
  //   const hand = predictions[0].landmarks;
  //   const normalized_landmarks = normalizeHands(hand);
  //   console.log("Hand detected:", normalized_landmarks);
  // } else {
  //   console.log("No hand detected or gesture model not loaded");
  // }

  // // Request next frame
  // requestAnimationFrame(detectandPredictResults);
}

function normalizeHands(hand){
  let minX=hand[0][0],maxX=hand[0][0],minY=hand[0][1],maxY=hand[0][1]
  for(let i=0;i<hand.length;i++){
    minX=Math.min(minX,hand[i][0]);
    maxX=Math.max(maxX,hand[i][0]);
    minY=Math.min(minY,hand[i][1]);
    maxY=Math.max(maxY,hand[i][1]);
  }
  return hand.map(point=>[(point[0]-minX)/(maxX-minX),(point[1]-minY)/(maxY-minY)]);
}
