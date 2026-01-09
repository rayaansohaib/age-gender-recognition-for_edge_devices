import React, { useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import WebcamInference from "./WebcamInference";
import { Oval } from "react-loader-spinner";
import { database, ref, push } from "./firebaseConfig";

const App = () => {
  const [modelLoaded, setModelLoaded] = useState(false);
  const [model, setModel] = useState(null);

  const modelPath = "/tfjs_model/model.json";

  const loadModel = async () => {
    try {
      const loadStart = performance.now();
      const loadedModel = await tf.loadGraphModel(modelPath);
      const loadEnd = performance.now();
      const loadTime = (loadEnd - loadStart).toFixed(2);
      console.log(`Model load time: ${loadTime} ms`);
      setModel(loadedModel);
      setModelLoaded(true);

      // 🔥 Log model load time to Firebase
      push(ref(database, "modelLoadTimes"), {
        timestamp: new Date().toISOString(),
        device: navigator.userAgent,
        modelLoadTime: loadTime,
      });
    } catch (error) {
      console.error("Error loading model:", error);
    }
  };

  useEffect(() => {
    loadModel();
  }, []);

  return (
    <div
      style={{
        backgroundColor: "#121212",
        color: "#f0f0f0",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        padding: "2rem",
      }}
    >
      <h1
        style={{
          fontSize: "2.8rem",
          color: "#FF69B4",
          textShadow: "0 0 10px #ff69b4aa",
        }}
      >
        GenLens
      </h1>
      <h3 style={{ color: "#aaa", marginBottom: "2rem", textAlign: "center" }}>
        Age & Gender Prediction using TensorFlow.js
        <br />
        Optimized for Android & Desktop Devices
      </h3>
      {modelLoaded ? (
        <WebcamInference model={model} />
      ) : (
        <div style={{ textAlign: "center" }}>
          <Oval color="#FF69B4" height={60} width={60} />
          <p style={{ marginTop: "1rem", color: "#888" }}>
            Loading model, please wait...
          </p>
        </div>
      )}
    </div>
  );
};

export default App;
