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
  const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
  video.srcObject = stream;
  video.play();
  console.log("playng video");
  loadHandposeModel();
});
let data=[]
async function loadHandposeModel() {
  console.log("Loading Handpose model...");
  const model = await handpose.load();
  console.log("Handpose model loaded");
  //rruning hande detectiob every 30 ms
  
  setInterval(async () => {
    const predictions = await model.estimateHands(
      document.querySelector("video")
    );
    if(predictions.length>0){
      console.log(data.length);
      let flattened_predcitons = predictions[0].landmarks.flat();
      //console.log(flattened_predcitons);
      data.push(flattened_predcitons);
      if(data.length>500){
        downloadCSV(data);
        data = [];
      }
    }
  }, 30);

  function downloadCSV(data, filename = "data.csv") {
    // Convert 2D array to CSV format
    const csvContent = data.map(row => row.join(",")).join("\n");

    // Create a Blob with CSV data
    const blob = new Blob([csvContent], { type: "text/csv" });

    // Create a download link
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;

    // Append to document and trigger download
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

  // Example: Predicting from a webcam video
}
