import * as faceapi from "face-api.js";

const MODEL_URL = "/models";
let loaded = false;

export async function loadModels() {
  if (loaded) return;
  await Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
  ]);
  loaded = true;
}

export const detectAllFaces = (input) =>
  faceapi
    .detectAllFaces(
      input,
      new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }),
    )
    .withFaceLandmarks()
    .withFaceDescriptors();

export const detectSingleFace = (input) =>
  faceapi
    .detectSingleFace(
      input,
      new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }),
    )
    .withFaceLandmarks()
    .withFaceDescriptor();

export { faceapi };
