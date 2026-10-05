# 🎬 SaveClip

A simple and fast web application for downloading videos using a URL. SaveClip provides a clean React frontend with a FastAPI backend powered by `yt-dlp` and FFmpeg.

## 🚀 Live Demo

🌐 **Frontend:** https://saveclip-green.vercel.app/

⚙️ **Backend API:** https://saveclip-backend.onrender.com/

📚 **API Documentation:** https://saveclip-backend.onrender.com/docs

---

## ✨ Features

* 🔗 Download videos using a URL
* ⚡ Fast and simple user interface
* 📥 Video information fetching
* 🎥 Video downloading through `yt-dlp`
* 🔄 React-based frontend
* 🚀 FastAPI backend
* 🎞️ FFmpeg support for media processing
* 📱 Responsive interface
* 🌐 Fully deployed and accessible online

---

## 🛠️ Tech Stack

### Frontend

* React
* Vite
* Tailwind CSS
* JavaScript

### Backend

* Python
* FastAPI
* yt-dlp
* FFmpeg
* Uvicorn

### Deployment

* Vercel — Frontend
* Render — Backend

---

## 📁 Project Structure

```text
saveclip/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── Dockerfile
│
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── index.css
    │   └── main.jsx
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## ⚙️ Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/Khalid635/saveclip.git
cd saveclip
```

---

### 2. Backend Setup

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the backend:

```bash
uvicorn main:app --reload
```

Backend will run at:

```text
http://127.0.0.1:8000
```

API documentation:

```text
http://127.0.0.1:8000/docs
```

---

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

---

## 🔌 API Endpoints

| Method | Endpoint        | Description           |
| ------ | --------------- | --------------------- |
| GET    | `/api/info`     | Get video information |
| GET    | `/api/download` | Download video        |
| GET    | `/health`       | Check backend health  |

Full interactive API documentation is available at:

https://saveclip-backend.onrender.com/docs

---

## 🌐 Deployment

SaveClip is deployed using separate frontend and backend services.

```text
                    SaveClip
                       │
             ┌─────────┴─────────┐
             │                   │
        Frontend              Backend
             │                   │
          Vercel              Render
             │                   │
   React + Vite          FastAPI + yt-dlp
                                 │
                              FFmpeg
```

### Frontend

Hosted on **Vercel**:

https://saveclip-green.vercel.app/

### Backend

Hosted on **Render**:

https://saveclip-backend.onrender.com/

---

## 📸 Screenshots

Add screenshots of the SaveClip interface here.

```text
screenshots/
├── home.png
└── download.png
```

---

## 📌 Project Status

🟢 **Live and working**

The frontend and backend are deployed separately and connected through the live API.

---

## 👨‍💻 Author

**Khalid Bin Masud**

CSE Student | Aspiring Software Developer

* GitHub: https://github.com/Khalid635
* LinkedIn: https://www.linkedin.com/in/khalid-bin-masud-817a913b9/
* Portfolio: https://khalidbinmasud-portfolio.netlify.app/

---

## ⭐ Support

If you find this project useful, consider giving the repository a ⭐ on GitHub.
