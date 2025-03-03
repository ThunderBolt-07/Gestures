import * as handpose from '@tensorflow-models/handpose';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl'; // For WebGL acceleration

// Ensure WebGL backend is available
tf.setBackend('webgl').then(() => {
    console.log('WebGL backend loaded');
});
async function loadHandposeModel() {
    console.log('Loading Handpose model...');
    const model = await handpose.load();
    console.log('Handpose model loaded');

    // Example: Predicting from a webcam video
    const video = document.querySelector("#videoElement");
    if (video) {
        video.addEventListener('loadeddata', async () => {
            const predictions = await model.estimateHands(video);
            console.log(predictions);
        });
    }
}

document.addEventListener("DOMContentLoaded", loadHandposeModel);
