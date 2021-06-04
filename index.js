import { drawHand, drawOctave } from "./utilities.js";

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const canvasVideo = document.getElementById('canvasVideo');
const piano = document.getElementById('piano');
const ctx = canvas.getContext('2d');
const ctxVideo = canvasVideo.getContext('2d');
let canvasWidth;
let canvasHeight;

const howManyOctaves = 4;

function startVideo() {
  navigator.getUserMedia(
    { 
      audio: true,
      video: {
        width: { min: 780, ideal: 780, max: 1024 },
        height: { min: 438, ideal: 438, max: 576 }
      }
    },
    stream => video.srcObject = stream,
    err => console.error(err)
  );
  const playPromise = document.querySelector('video').play();
  if (playPromise) {
    playPromise.then(response => {
      const videoRatio = video.offsetWidth / video.offsetHeight;
      canvas.width = canvasVideo.width = 780;
      canvas.height = canvasVideo.height = canvas.width / videoRatio;
      canvasWidth = canvas.width;
      canvasHeight = canvas.height;
      detect();
      piano.style.width = `${ canvasWidth }px`;
      piano.style.height = `${ canvasHeight }px`;

      const originX = piano.getBoundingClientRect().x;
      const originY = piano.getBoundingClientRect().y;

      for (let i=0; i<howManyOctaves; i++) {
        drawOctave(i, originX, originY);
      }

    })
    .catch(error => { console.error(error) });
  }
}

startVideo();

function onResults(results) {
  drawHand(results, ctx, ctxVideo, canvasWidth, canvasHeight);
}

const holistic = new Holistic({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic@0.1/${file}`;
}});
holistic.setOptions({
  selfieMode: true,
  upperBodyOnly: true,
  smoothLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});
holistic.onResults(onResults);

const detect = async () => {
  await holistic.send({ image: video });
  requestAnimationFrame(detect);
};