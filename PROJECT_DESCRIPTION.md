# Skin Disease Detection System 🩺🤖

The **Skin Disease Detection System** is a sophisticated full-stack AI application designed to assist users in identifying various skin conditions through image analysis and providing comprehensive medical information powered by Large Language Models (LLMs).

## 🚀 Core Objective
The project aims to bridge the gap between initial concern and medical insight by providing a fast, accessible tool for skin lesion classification. It leverages deep learning for image recognition and generative AI for detailed medical context, helping users understand potential risks and necessary precautions.

---

## 🛠 Tech Stack
| Component | Technologies Used |
| :--- | :--- |
| **Backend** | Django, Django REST Framework, PostgreSQL |
| **Frontend** | React 19 (Vite), Tailwind CSS 4, Lucide React |
| **Machine Learning** | TensorFlow, Keras, OpenCV |
| **Generative AI** | Google Gemini API (Gemini 2.5 Flash) |
| **DevOps** | Docker, Docker Compose, Nginx |

---

## ✨ Key Features

### 1. Automated Disease Classification
At the heart of the system is a custom-trained **Convolutional Neural Network (CNN)** built with TensorFlow. When a user uploads an image, the model analyzes it against eight major categories of skin diseases with high precision:
*   Actinic keratosis
*   Basal cell carcinoma
*   Benign keratosis
*   Dermatofibroma
*   Melanocytic nevus
*   Melanoma
*   Squamous cell carcinoma
*   Vascular lesion

### 2. AI-Powered Medical Intelligence
Once a disease is identified, the system integrates with the **Google Gemini API** to generate a dynamic, comprehensive report. This report includes:
*   **Symptoms**: Key indicators to watch for.
*   **Remedies & Cures**: Standard treatments and management approaches.
*   **Prevention**: Strategies to avoid recurrence or worsening.

### 3. Secure User Experience
*   **Authentication**: Secure registration and login system with persistent sessions.
*   **User History**: A dedicated dashboard where users can track their history of uploads and previous diagnosis results.
*   **PDF Exports**: Users can download their AI-generated reports as professionally formatted PDF documents for record-keeping or sharing with healthcare providers.

### 4. Modern & Responsive Design
The frontend is built with **React 19** and **Tailwind CSS**, ensuring a sleek, premium, and fully responsive user interface that works seamlessly on both desktop and mobile devices.

---

## 📂 Architecture Overview
*   **/backend**: Houses the Django application, the ML model (`skin_model.h5`), and the Gemini integration logic.
*   **/frontend**: Contains the React source code, utilizing modern hooks and router-based navigation.
*   **/docker**: Configuration files for containerized deployment, ensuring a consistent environment across development and production.

---

## 🩺 Disclaimer
*This system is intended for informational and educational purposes only. It is not a clinical diagnostic tool and should not replace professional medical consultation.*
