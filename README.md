# REAL-TIME AGE & GENDER PREDICTION - SETUP & DEPLOYMENT MANUAL

This document provides step-by-step instructions for training, converting,
and deploying a real-time age and gender prediction model using PyTorch,
TensorFlow.js, and React.

---

1. SYSTEM REQUIREMENTS

---

Required versions:

- Python 3.8 or higher
- Node.js 18 or higher
- pip 21+
- npm 8+
- CUDA-compatible GPU (recommended for training)
- Google Colab (optional, cloud-based training)

---

2. PYTHON DEPENDENCIES FOR TRAINING

---

Use a virtual environment:

> python -m venv env  
> source env/bin/activate (Linux/macOS)  
> env\Scripts\activate (Windows)

Then install the required packages:

> pip install torch torchvision==0.16.0 torchaudio --index-url https://download.pytorch.org/whl/cu118  
> pip install tensorflow==2.19.1  
> pip install tensorflowjs==4.8.0  
> pip install onnx==1.15.0 onnx-tf==1.10.0  
> pip install jax==0.4.25 jaxlib==0.4.25  
> pip install scikit-learn matplotlib seaborn  
> pip install pickle5

---

3. TRAINING THE MODEL

---

Step 1: Chunk the UTKFace dataset into `.pkl` files.  
Each chunk should include:

- 'images': shape (N, 3, 224, 224)
- 'ages': normalized to [0, 1]
- 'genders': binary labels
- 'ethnicities': optional

Step 2: Load each chunk and train using ResNet-152 (PyTorch).

- Use pretrained ResNet-152 backbone
- Add two heads:
  • Age: Linear → ReLU → Dropout → Linear (regression)
  • Gender: Linear + Sigmoid (binary classification)

Training parameters:

- Optimizer: Adam (lr = 2.5e-5, weight decay = 1e-7)
- Loss: MSE for age, Binary Cross-Entropy for gender
- Epochs: 15 per chunk
- Batch Size: 32
- Evaluation: F1 score, confusion matrix, loss curve, scatter plot

Save the model:

> torch.save(model.state_dict(), "resnet152_age_gender.pt")

---

4. MODEL CONVERSION (PyTorch → TensorFlow.js)

---

A. Convert to ONNX:
Use dummy input of shape (1, 3, 224, 224)

> python export_to_onnx.py

B. Convert ONNX → TensorFlow SavedModel:

> onnx-tf convert -i model.onnx -o saved_model/

C. Convert SavedModel → TensorFlow.js format:

> tensorflowjs_converter --input_format=tf_saved_model saved_model/ tfjs_model/

This will generate:

- model.json
- group1-shard\*.bin

Move the entire 'tfjs_model/' folder into the React app’s 'public/' directory.

---

5. FRONTEND SETUP (React + TensorFlow.js)

---

A. Create a new React app:

> npx create-react-app age-gender-predictor  
> cd age-gender-predictor

B. Install required packages:

> npm install @tensorflow/tfjs react-webcam

C. Copy `tfjs_model/` folder to `public/` in the React app.

D. In `src/App.js`, load and run the model:

    import * as tf from '@tensorflow/tfjs';

    const loadModel = async () => {
      const model = await tf.loadGraphModel('/tfjs_model/model.json');
      console.log("Model loaded");
    };

E. Use react-webcam to capture webcam input, resize to 224x224,
normalize pixel values to [0, 1], and pass tensor into the model.

---

6. DEPLOYMENT (Recommended: Firebase Hosting)

---

Install Firebase CLI:

> npm install -g firebase-tools

Login to Firebase:

> firebase login

Initialize project:

> firebase init  
> (select 'Hosting', choose build directory as 'build')

Build the React app:

> npm run build

Deploy to Firebase:

> firebase deploy

Live model testing after
