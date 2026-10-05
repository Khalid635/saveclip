import copy, ipaddress, os, re, socket, subprocess, threading, time
from collections import defaultdict, deque
from urllib.parse import quote, urlparse
import yt_dlp
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse

ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")   # অনলাইনে নিজের ডোমেইন দিন
MAX_SECONDS = int(os.getenv("MAX_SECONDS", 3 * 3600))    # এর চেয়ে লম্বা ভিডিও বাদ
RATE, WINDOW = int(os.getenv("RATE", 30)), 60            # প্রতি IP প্রতি মিনিটে
SLOTS = threading.BoundedSemaphore(int(os.getenv("MAX_STREAMS", 3)))  # একসাথে সর্বোচ্চ ডাউনলোড
TTL = 600

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=ORIGINS, allow_methods=["GET"],
                   allow_headers=["*"], expose_headers=["Content-Disposition"])

BASE = {"quiet": True, "no_warnings": True, "noplaylist": True, "socket_timeout": 15}
if os.path.exists("cookies.txt"):
    BASE["cookiefile"] = "cookies.txt"

hits, cache, lock = defaultdict(deque), {}, threading.Lock()


@app.middleware("http")
async def rate_limit(request: Request, call_next):
    if request.url.path.startswith("/api"):
        ip = (request.headers.get("x-forwarded-for") or request.client.host).split(",")[0].strip()
        q, now = hits[ip], time.time()
        while q and q[0] < now - WINDOW:
            q.popleft()
        if len(q) >= RATE:
            return JSONResponse({"detail": "অনেক বেশি রিকোয়েস্ট। কিছুক্ষণ পর আবার চেষ্টা করুন।"}, 429)
        q.append(now)
    return await call_next(request)


def check_url(url):
    """SSRF সুরক্ষা: শুধু পাবলিক http/https লিংক।"""
    u = urlparse(url)
    if u.scheme not in ("http", "https") or not u.hostname:
        raise HTTPException(400, "সঠিক লিংক দিন")
    try:
        for r in socket.getaddrinfo(u.hostname, None):
            ip = ipaddress.ip_address(r[4][0])
            if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved:
                raise HTTPException(400, "এই লিংক অনুমোদিত নয়")
    except socket.gaierror:
        raise HTTPException(400, "লিংকটি খুঁজে পাওয়া যায়নি")


def get_raw(url):
    """প্রতিবার yt-dlp না চালিয়ে ১০ মিনিট ক্যাশ।"""
    check_url(url)
    now = time.time()
    with lock:
        for k in [k for k, v in cache.items() if v[0] < now]:
            del cache[k]
        if url in cache:
            return cache[url][1]
    try:
        with yt_dlp.YoutubeDL(BASE) as y:
            d = y.extract_info(url, download=False)
    except Exception:
        raise HTTPException(400, "ভিডিও পাওয়া যায়নি, প্রাইভেট, অথবা প্ল্যাটফর্ম ব্লক করেছে")
    if (d.get("duration") or 0) > MAX_SECONDS:
        raise HTTPException(400, "ভিডিওটি অনেক লম্বা")
    with lock:
        cache[url] = (now + TTL, d)
    return d


@app.get("/api/info")
def info(url: str):
    d = get_raw(url)
    best = {}
    for f in d.get("formats", []):
        h = f.get("height")
        if h and f.get("vcodec") != "none":
            best[h] = max(best.get(h, 0), f.get("filesize") or f.get("filesize_approx") or 0)
    opts = [{"label": f"{h}p", "mode": "video", "height": h, "size": best[h]}
            for h in sorted(best, reverse=True)[:6]]
    if not opts:
        opts = [{"label": "Best quality", "mode": "video", "height": None, "size": 0}]
    opts.append({"label": "MP3 · 192 kbps", "mode": "audio", "height": None, "size": 0})
    return {"title": d.get("title"), "thumbnail": d.get("thumbnail"),
            "duration": int(d.get("duration") or 0), "uploader": d.get("uploader"),
            "platform": d.get("extractor_key"), "options": opts}


@app.get("/api/download")
def download(url: str, mode: str = "video", height: int | None = None):
    raw = get_raw(url)
    if mode == "audio":
        fmt = "bestaudio/best"
    else:
        h = f"[height<={height}]" if height else ""
        fmt = f"bestvideo{h}[ext=mp4]+bestaudio[ext=m4a]/bestvideo{h}+bestaudio/best{h}"
    try:  # ক্যাশ করা তথ্য থেকে ফরম্যাট বাছাই, নতুন করে বিশ্লেষণ নেই
        with yt_dlp.YoutubeDL(dict(BASE, format=fmt)) as y:
            d = y.process_ie_result(copy.deepcopy(raw), download=False)
    except Exception:
        raise HTTPException(400, "এই কোয়ালিটি পাওয়া যায়নি")
    if not SLOTS.acquire(blocking=False):
        raise HTTPException(429, "সার্ভার এখন ব্যস্ত। কয়েক সেকেন্ড পর আবার চেষ্টা করুন।")
    try:
        cmd = ["ffmpeg", "-loglevel", "error"]
        for f in (d.get("requested_formats") or [d]):
            hdr = "".join(f"{k}: {v}\r\n" for k, v in (f.get("http_headers") or {}).items())
            cmd += ["-headers", hdr, "-i", f["url"]]
        if mode == "audio":
            cmd += ["-vn", "-c:a", "libmp3lame", "-b:a", "192k", "-f", "mp3", "pipe:1"]
            ext, mt = "mp3", "audio/mpeg"
        else:
            cmd += ["-c", "copy", "-movflags", "frag_keyframe+empty_moov+default_base_moof", "-f", "mp4", "pipe:1"]
            ext, mt = "mp4", "video/mp4"
        p = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
    except Exception:
        SLOTS.release()
        raise HTTPException(500, "ডাউনলোড শুরু করা যায়নি")

    def gen():
        try:
            while chunk := p.stdout.read(65536):
                yield chunk
        finally:
            p.kill(); p.wait(); SLOTS.release()

    name = re.sub(r'[\\/:*?"<>|]', "", d.get("title") or "")[:80].strip() or "video"
    return StreamingResponse(gen(), media_type=mt, headers={
        "Content-Disposition": f"attachment; filename*=UTF-8''{quote(name)}.{ext}"})


@app.get("/health")
def health():
    return {"ok": True}
