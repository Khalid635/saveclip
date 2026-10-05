# SaveClip

## ব্যাকএন্ড (লোকাল)
cd backend && pip install -r requirements.txt && uvicorn main:app --reload
(ffmpeg ও YouTube-এর জন্য Deno ইনস্টল থাকতে হবে)

## ফ্রন্টএন্ড
cd frontend && cp .env.example .env && npm install && npm run dev

## ফ্রি ডিপ্লয়
- ব্যাকএন্ড: Hugging Face Spaces (Docker, পোর্ট 7860) বা Oracle Cloud Always Free VM
  ENV: ALLOWED_ORIGINS=https://আপনার-সাইট.vercel.app
- Frontend: Vercel/Netlify/Cloudflare Pages, ENV: VITE_API_BASE=<ব্যাকএন্ড URL>
- yt-dlp নিয়মিত আপডেট: pip install -U yt-dlp
