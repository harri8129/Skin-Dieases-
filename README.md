# Skin Disease Detection System 🩺🤖

This project is split into two parts:

- *Backend* (backend/) → Django + LLM integration + PostgreSQL  
- *Frontend* (frontend/) → React/Vue/Next (depending on your stack)  

---

## 🚀 Getting Started

### 1. Clone the repo
```bash
git clone <your-repo-url>
cd <repo-name>
```

### 🛠 Backend Setup (backend/)

The backend is built with Django and integrates with an LLM for skin disease detection.

Navigate to backend
```bash
cd backend
```

Create virtual environment (recommended)

```bash
python3 -m venv venv
source venv/bin/activate   # Linux / macOS
venv\Scripts\activate      # Windows
```
Install dependencies
```bash
pip install -r requirements.txt
```
Configure environment variables
- Copy .env.example → .env
- Update values as needed (DB settings, API keys, etc.)

Set up database (PostgreSQL)
Make sure PostgreSQL is running, then:
```bash
python manage.py migrate
```
#### Run the backend
```bash
 python manage.py runserver
```

### 🎨 Frontend Setup (frontend/)

The frontend is built with Node.js.

Navigate to frontend
```bash
cd frontend
```
Install dependencies
```bash
npm install
```
Run the dev server
```bash
npm run dev
```
