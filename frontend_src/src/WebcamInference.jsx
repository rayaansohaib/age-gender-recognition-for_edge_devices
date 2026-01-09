import React, { useRef, useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import { database, ref, push } from "./firebaseConfig";

const WebcamInference = ({ model }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [predictionTime, setPredictionTime] = useState(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isIOSDevice = /iPhone|iPad|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);
  }, []);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      videoRef.current.setAttribute("playsinline", true); // required for iOS
      videoRef.current.play();
    } catch (err) {
      console.error("Webcam error:", err);
      alert("Webcam access denied or not available.");
    }
  };

  const captureAndPredict = async () => {
    setLoading(true);
    tf.engine().startScope();

    const ctx = canvasRef.current.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, 224, 224);

    const image = tf.browser.fromPixels(canvasRef.current);
    const resizedImage = tf.image
      .resizeBilinear(image, [224, 224])
      .toFloat()
      .expandDims(0);
    const normalizedImage = resizedImage.div(255.0);

    try {
      const predictStart = performance.now();

      const [rawPredictedAge, rawPredictedGender] = tf.tidy(() => {
        const output = model.predict(normalizedImage);
        const ageVal = output[0].dataSync()[0];
        const genderVal = output[1].dataSync()[0];
        return [ageVal, genderVal];
      });

      const predictEnd = performance.now();
      const timeTaken = (predictEnd - predictStart).toFixed(2);
      setPredictionTime(timeTaken);
      console.log(`Prediction time: ${timeTaken} ms`);

      const predictedGender = rawPredictedGender > 0.5 ? "Female" : "Male";
      const denormalizedAge = rawPredictedAge;

      setPrediction({
        age: Math.round(denormalizedAge),
        gender: predictedGender,
      });

      // sending metrics to firebase
      push(ref(database, "metrics"), {
        timestamp: new Date().toISOString(),
        device: navigator.userAgent,
        age: Math.round(denormalizedAge),
        gender: predictedGender,
        predictionTime: timeTaken,
      });
    } catch (err) {
      console.error("Error in prediction:", err);
    } finally {
      tf.engine().endScope();
      image.dispose();
      resizedImage.dispose();
      normalizedImage.dispose();
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center", maxWidth: "90vw" }}>
      {isIOS && (
        <div
          style={{
            backgroundColor: "#2a2a2a",
            color: "#ffaaaa",
            padding: "0.75rem",
            borderRadius: "8px",
            marginBottom: "1rem",
          }}
        >
          <strong>Note:</strong> iPhones may take longer to load the model and
          access the camera. For the best experience, use an Android device or
          desktop browser.
        </div>
      )}

      <video
        ref={videoRef}
        width="300"
        height="224"
        style={{
          border: "1px solid #888",
          borderRadius: "8px",
          marginBottom: "1rem",
        }}
        playsInline
      />
      <br />
      <button onClick={startWebcam} style={buttonStyle}>
        Start Webcam
      </button>
      <button
        onClick={captureAndPredict}
        disabled={loading}
        style={{
          ...buttonStyle,
          marginLeft: "1rem",
          backgroundColor: loading ? "#333" : "#00BFFF",
        }}
      >
        {loading ? "Predicting..." : "Capture & Predict"}
      </button>
      <canvas
        ref={canvasRef}
        width={224}
        height={224}
        style={{ display: "none" }}
      />
      {prediction && (
        <div
          style={{
            marginTop: "1.5rem",
            padding: "1rem",
            backgroundColor: "#1e1e1e",
            borderRadius: "10px",
            width: "fit-content",
            marginInline: "auto",
            transition: "all 0.3s ease",
          }}
        >
          <p style={{ color: "#ffffff", fontSize: "1.2rem" }}>
            <strong>Predicted Age:</strong> {prediction.age}
          </p>
          <p
            style={{
              color: prediction.gender === "Female" ? "#FF69B4" : "#00BFFF",
              fontSize: "1.2rem",
            }}
          >
            <strong>Predicted Gender:</strong> {prediction.gender}
          </p>
          {predictionTime && (
            <p
              style={{ color: "#888", fontSize: "0.9rem", marginTop: "0.5rem" }}
            >
              Last prediction time: {predictionTime} ms
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// reusable button style
const buttonStyle = {
  padding: "0.6rem 1.2rem",
  fontSize: "1rem",
  border: "none",
  borderRadius: "6px",
  backgroundColor: "#FF69B4",
  color: "white",
  cursor: "pointer",
  transition: "background-color 0.2s ease",
};

export default WebcamInference;
