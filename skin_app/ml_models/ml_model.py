import os
import numpy as np
import tensorflow as tf
from PIL import Image
import cv2
from django.conf import settings

# === Absolute path to your model using BASE_DIR ===
MODEL_PATH = os.path.join(settings.BASE_DIR, 'skin_app', 'ml_models', 'skin_model.h5')
model = tf.keras.models.load_model(MODEL_PATH)

# === Disease Labels ===
LABELS = {
    0: 'Actinic keratosis',
    1: 'Basal cell carcinoma',
    2: 'Benign keratosis',
    3: 'Dermatofibroma',
    4: 'Melanocytic nevus',
    5: 'Melanoma',
    6: 'Squamous cell carcinoma',
    7: 'Vascular lesion'
}

def predict_disease(image_path):
    try:
        input_shape = model.input_shape[1:4]  # e.g., (256, 256, 3)

        # Load and preprocess image
        img = Image.open(image_path)
        img = np.array(img)

        # Resize
        img = cv2.resize(img, (input_shape[0], input_shape[1]))

        # Handle channels
        if img.ndim == 2:
            img = cv2.cvtColor(img, cv2.COLOR_GRAY2RGB)
        elif img.shape[2] != 3:
            img = img[:, :, :3]

        # Normalize
        img = img / 255.0
        img = img.reshape(1, *input_shape)

        # Predict
        prediction = model.predict(img)
        predicted_index = np.argmax(prediction, axis=1)[0]

        return LABELS.get(predicted_index, 'Unknown')
    except Exception as e:
        print(f"Prediction error: {e}")
        return 'Prediction Error'
