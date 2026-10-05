<div align="center">

# ⬇ SaveClip

**A fast, modern video downloader web app.**
Paste a link, pick a quality, and the download starts right away.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

</div>

---

## Overview

SaveClip is a full-stack web application built on top of [yt-dlp](https://github.com/yt-dlp/yt-dlp) and [FFmpeg](https://ffmpeg.org/). The React frontend sends a link to a FastAPI backend, which fetches video details and **streams** the chosen format straight to the browser. Nothing is stored on the server, so downloads start immediately even for large files.

It is designed to run on a free hosting stack: a static frontend on Netlify, Vercel or Cloudflare Pages, and a small backend on any free VM or container host.

## Features

- **Instant streaming:** FFmpeg merges video and audio on the fly and pipes the result to the browser. No temporary files on disk.
- **Multiple qualities:** Choose from the available resolutions, or download audio only as MP3.
- **Many platforms:** Works with sites supported by yt-dlp, including YouTube, Facebook, Instagram, TikTok, Pinterest and X (public videos).
- **Keyboard first:** Search, switch tabs and download without touching the mouse.
- **Night and light mode:** Follows the system theme on first visit and remembers your choice.
- **Responsive design:** Glassmorphism UI that works on phones, tablets and desktops.
- **Private by design:** No accounts, no tracking. Recent links are stored only in your own browser.
- **Built-in protection:** Response caching, per-IP rate limiting, a concurrent download cap and SSRF protection.

## Keyboard shortcuts

| Key | Action |
| --- | --- |
| `/` or `Ctrl` + `K` | Focus the link box |
| `Enter` | Search |
| `↓` / `↑` | Move between quality options |
| `Enter` (on an option) | Download |
| `V` / `A` | Video / Audio tab |
| `T` | Toggle theme |
| `Esc` | Clear or close |
| `?` | Show all shortcuts |

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite, Tailwind CSS v4 |
| Backend | Python, FastAPI, Uvicorn |
| Media | yt-dlp, FFmpeg |
| Container | Docker (optional) |

## Project structure

```
saveclip/
├── backend/
│   ├── main.py            # FastAPI app: /api/info, /api/download, /health
│   ├── requirements.txt
│   └── Dockerfile
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx        # UI, theme and keyboard shortcuts
        ├── index.css      # Design tokens and theme variables
        └── main.jsx
```

## Getting started

### Prerequisites

- [Python](https://www.python.org/downloads/) 3.10 or newer
- [FFmpeg](https://ffmpeg.org/download.html) available on your `PATH`
- [Node.js](https://nodejs.org/) 20 or newer
- [Deno](https://deno.com/) (recommended, required by yt-dlp for some YouTube videos)

### 1. Run the backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The API is now available at `http://localhost:8000`.

### 2. Run the frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open the address shown in the terminal (usually `http://localhost:5173`).

## Configuration

### Frontend (`frontend/.env`)

| Variable | Description | Default |
| --- | --- | --- |
| `VITE_API_BASE` | Public URL of the backend | `http://localhost:8000` |

### Backend (environment variables)

| Variable | Description | Default |
| --- | --- | --- |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed frontend origins | `*` |
| `MAX_SECONDS` | Maximum video length in seconds | `10800` |
| `RATE` | Requests per IP per minute | `30` |
| `MAX_STREAMS` | Maximum simultaneous downloads | `3` |

For videos that need a login (for example some Instagram or age-restricted content), place a `cookies.txt` file in the `backend` folder. The backend picks it up automatically.

## API

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/info?url=<video-url>` | Returns title, thumbnail, duration, uploader and available qualities |
| `GET` | `/api/download?url=<video-url>&mode=video\|audio&height=<px>` | Streams the selected format as MP4 or MP3 |
| `GET` | `/health` | Health check |

## Deployment

### Frontend: Netlify (or Vercel, Cloudflare Pages)

| Setting | Value |
| --- | --- |
| Base directory | `frontend` |
| Build command | `npm run build` |
| Publish directory | `frontend/dist` |
| Environment variable | `VITE_API_BASE=https://your-backend-url` |

### Backend: Docker

```bash
cd backend
docker build -t saveclip .
docker run -d --restart always -p 7860:7860 \
  -e ALLOWED_ORIGINS=https://your-site.netlify.app \
  saveclip
```

Serve the backend over **HTTPS** (for example with Caddy or a Cloudflare Tunnel). Browsers block an HTTPS site from calling a plain HTTP API.

### Keep it working

Video platforms change often. Update yt-dlp regularly, otherwise downloads will stop working:

```bash
pip install -U yt-dlp
```

## Limitations

- Private videos, login-only content and DRM-protected streams are not supported.
- Some platforms block requests from cloud and data-center IP addresses. A `cookies.txt` file or a different host can help.
- Free hosting has bandwidth and compute limits, so heavy traffic will need a larger plan.

## Disclaimer

This project is for **educational and personal use**. Downloading content may violate the terms of service of the source platform or copyright law in your country. Only download videos that you own or have permission to use. The authors are not affiliated with any video platform and are not responsible for how this software is used.

## Contributing

Contributions are welcome.

1. Fork the repository
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push the branch: `git push origin feature/your-feature`
5. Open a pull request

## License

Released under the [MIT License](LICENSE).

## Author

**Khalid Bin Masud**

---

<div align="center">

Built with [yt-dlp](https://github.com/yt-dlp/yt-dlp), [FFmpeg](https://ffmpeg.org/), [FastAPI](https://fastapi.tiangolo.com/) and [React](https://react.dev/).

</div>
