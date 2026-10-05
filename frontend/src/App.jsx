import { useEffect, useRef, useState } from "react";

const API = import.meta.env.VITE_API_BASE || "https://saveclip-backend.onrender.com";
const PLAT = [["youtube|youtu\\.be", "YouTube", "#ef4444"], ["facebook|fb\\.watch", "Facebook", "#2563eb"], ["instagram", "Instagram", "#ec4899"], ["tiktok", "TikTok", "#22d3ee"], ["pinterest|pin\\.it", "Pinterest", "#dc2626"], ["twitter|x\\.com", "X", "#94a3b8"]];
const SHORTCUTS = [["/", "Focus the link box"], ["Ctrl K", "Focus the link box"], ["Enter", "Search"], ["Esc", "Clear / close"], ["↓ ↑", "Move between qualities"], ["Enter", "Download selected"], ["V", "Video tab"], ["A", "Audio tab"], ["T", "Toggle theme"], ["?", "Show shortcuts"]];
const dur = s => (s ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}` : "");
const mb = b => (b ? `~${(b / 1048576).toFixed(b > 1.07e8 ? 0 : 1)} MB` : "");
const loadHist = () => { try { return JSON.parse(localStorage.getItem("h") || "[]"); } catch { return []; } };
const Kbd = ({ children }) => <kbd className="kbd">{children}</kbd>;

export default function App() {
  const [url, setUrl] = useState("");
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [tab, setTab] = useState("video");
  const [hist, setHist] = useState(loadHist);
  const [toast, setToast] = useState("");
  const [help, setHelp] = useState(false);
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || "dark");
  const input = useRef(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem("theme", theme); } catch { }
  }, [theme]);

  const plat = PLAT.find(([r]) => new RegExp(r, "i").test(url));
  const say = t => { setToast(t); setTimeout(() => setToast(""), 2200); };
  const flip = () => setTheme(t => (t === "dark" ? "light" : "dark"));
  const clear = () => { setUrl(""); setData(null); setErr(""); };

  async function search(u = url) {
    u = u.trim(); setUrl(u); setErr("");
    if (!/^https?:\/\//i.test(u)) return setErr("Paste a valid link that starts with http or https.");
    setBusy(true); setData(null);
    try {
      const r = await fetch(`${API}/api/info?url=${encodeURIComponent(u)}`);
      const d = await r.json();
      if (!r.ok) throw new Error(d.detail || "Video not found.");
      setData({ ...d, src: u }); setTab("video");
      const h = [{ u, t: d.title }, ...loadHist().filter(x => x.u !== u)].slice(0, 5);
      try { localStorage.setItem("h", JSON.stringify(h)); } catch { }
      setHist(h);
    } catch (e) {
      setErr(e.message === "Failed to fetch" ? "Can't reach the server. Check that the backend is running." : e.message);
    }
    setBusy(false);
  }

  const paste = async () => {
    try { const t = await navigator.clipboard.readText(); setUrl(t); search(t); }
    catch { say("Clipboard blocked. Press Ctrl+V instead."); input.current?.focus(); }
  };

  useEffect(() => {
    const onKey = e => {
      const typing = /INPUT|TEXTAREA/.test(e.target.tagName);
      const mod = e.ctrlKey || e.metaKey;
      const rows = [...document.querySelectorAll("[data-row]")];
      const at = rows.indexOf(document.activeElement);
      if ((e.key === "/" && !typing) || (mod && e.key.toLowerCase() === "k")) {
        e.preventDefault(); input.current?.focus(); input.current?.select(); return;
      }
      if (e.key === "Escape") {
        if (help) setHelp(false);
        else if (url || data) { clear(); input.current?.focus(); }
        else document.activeElement?.blur();
        return;
      }
      if (e.key === "ArrowDown" && (typing ? data : true) && rows.length) {
        e.preventDefault(); rows[Math.min(at + 1, rows.length - 1)].focus(); return;
      }
      if (e.key === "ArrowUp" && at >= 0) {
        e.preventDefault(); at === 0 ? input.current?.focus() : rows[at - 1].focus(); return;
      }
      if (typing || mod || e.altKey) return;
      const k = e.key.toLowerCase();
      if (e.key === "?") setHelp(h => !h);
      else if (k === "t") flip();
      else if (data && k === "v") setTab("video");
      else if (data && k === "a") setTab("audio");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [help, url, data]);

  const rows = data?.options.filter(o => o.mode === tab) || [];

  return (
    <>
      <div className="orb w-[460px] h-[460px] -top-32 -left-24" style={{ background: "var(--a)" }} />
      <div className="orb w-[400px] h-[400px] top-16 -right-28" style={{ background: "var(--b)", animationDelay: "-5s" }} />
      <div className="orb w-[320px] h-[320px] bottom-[-120px] left-[38%]" style={{ background: "var(--c)", animationDelay: "-9s" }} />

      <div className="max-w-[1000px] mx-auto px-5">
        <nav className="flex justify-between items-center py-5">
          <div className="font-extrabold text-xl flex items-center gap-2.5 tracking-tight">
            <span className="gbtn w-9 h-9 rounded-xl grid place-items-center shadow-lg">⬇</span>Save<span className="grad">Clip</span>
          </div>
          <div className="flex gap-2">
            <button className="glass px-3 py-2 rounded-xl text-sm flex items-center gap-2" onClick={() => setHelp(true)} aria-label="Keyboard shortcuts"><Kbd>?</Kbd><span className="hidden sm:inline mt">Shortcuts</span></button>
            <button className="glass px-3.5 py-2 rounded-xl text-sm font-medium" onClick={flip} aria-label="Toggle theme" title="Toggle theme (T)">
              {theme === "dark" ? "☀ Light" : "☾ Night"}
            </button>
          </div>
        </nav>

        <header className="text-center pt-12 pb-8">
          <span className="glass inline-block text-xs px-3.5 py-1.5 rounded-full mt mb-6">Free · No sign-up · Instant streaming</span>
          <h1 className="text-[clamp(2.4rem,7vw,4.6rem)] font-extrabold tracking-[-0.04em] leading-[1.04]">
            Download any video,<br /><span className="grad">in seconds.</span>
          </h1>
          <p className="max-w-[540px] mx-auto mt-5 mb-9 leading-relaxed mt">
            Paste a link from YouTube, Facebook, Instagram, TikTok, Pinterest or X. Pick a quality and your download starts right away.
          </p>

          <div className="glass max-w-[740px] mx-auto flex flex-wrap items-center gap-2 p-2 rounded-[22px] focus-within:border-[var(--a)] transition-colors" style={{ boxShadow: "var(--sh)" }}>
            <input ref={input} value={url} onChange={e => setUrl(e.target.value)} spellCheck="false" autoComplete="off"
              onKeyDown={e => e.key === "Enter" && (e.preventDefault(), search())}
              onPaste={e => { const t = e.clipboardData.getData("text").trim(); if (/^https?:\/\//i.test(t)) { e.preventDefault(); setUrl(t); search(t); } }}
              placeholder="Paste a video link…" aria-label="Video link"
              className="flex-1 basis-full sm:basis-0 min-w-0 bg-transparent px-3.5 py-3 placeholder:text-[var(--mt)]" />
            {plat && <span className="text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5" style={{ background: "var(--s2)" }}><i className="w-2 h-2 rounded-full" style={{ background: plat[2] }} />{plat[1]}</span>}
            {!url && <span className="hidden sm:block mr-1"><Kbd>/</Kbd></span>}
            <button className="glass px-4 py-3 rounded-xl text-sm font-medium" onClick={paste}>Paste</button>
            <button className="gbtn font-bold px-7 py-3.5 rounded-2xl flex-1 sm:flex-none disabled:opacity-60 hover:brightness-110 transition" disabled={busy} onClick={() => search()}>
              {busy ? "Searching…" : "Search"}
            </button>
          </div>
          <p role="alert" className="mt-4 min-h-[22px] text-sm text-rose-500">{err}</p>

          {busy && (
            <div className="glass max-w-[740px] mx-auto rounded-3xl p-[18px] flex gap-4">
              <div className="sk w-60 aspect-video rounded-2xl" />
              <div className="flex-1 grid gap-2.5 content-start"><div className="sk h-[18px] rounded-lg" /><div className="sk h-[18px] w-3/5 rounded-lg" /></div>
            </div>
          )}

          {data && (
            <div className="glass max-w-[740px] mx-auto text-left rounded-3xl overflow-hidden" style={{ boxShadow: "var(--sh)" }}>
              <div className="flex flex-col sm:flex-row gap-4 p-[18px]">
                <div className="relative sm:w-60 shrink-0 aspect-video rounded-2xl overflow-hidden" style={{ background: "var(--s2)" }}>
                  {data.thumbnail && <img src={data.thumbnail} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />}
                  {data.duration > 0 && <span className="absolute right-2 bottom-2 bg-black/75 text-white text-xs px-2 py-0.5 rounded-lg">{dur(data.duration)}</span>}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold leading-snug line-clamp-3">{data.title}</h3>
                  <p className="text-sm mt-2 mt">{[data.platform, data.uploader].filter(Boolean).join(" · ")}</p>
                </div>
              </div>
              <div className="flex gap-1.5 px-[18px]" role="tablist">
                {[["video", "Video", "V"], ["audio", "Audio", "A"]].map(([k, l, s]) => (
                  <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className="px-4 py-2 rounded-[10px] font-semibold flex items-center gap-2"
                    style={{ background: tab === k ? "var(--s2)" : "none", color: tab === k ? "var(--tx)" : "var(--mt)" }}>{l}<Kbd>{s}</Kbd></button>
                ))}
              </div>
              <div className="grid gap-2 px-[18px] pt-3 pb-[18px]">
                {rows.map(o => (
                  <a key={o.label} data-row onClick={() => say("Download started ⚡")}
                    href={`${API}/api/download?url=${encodeURIComponent(data.src)}&mode=${o.mode}&height=${o.height || ""}`}
                    className="flex justify-between items-center px-4 py-3 rounded-[14px] transition hover:translate-x-0.5 focus-visible:translate-x-0.5" style={{ background: "var(--s2)" }}>
                    <b className="font-semibold">{o.label}{o.mode === "video" && " · MP4"}</b>
                    <span className="text-sm mt">{mb(o.size)}</span>
                    <span className="gbtn px-3.5 py-1.5 rounded-[10px] text-sm font-semibold">Download</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {hist.length > 0 && (
            <div className="max-w-[740px] mx-auto mt-8 text-left">
              <h5 className="text-sm font-semibold mb-2 mt">Recent</h5>
              {hist.map(x => (
                <button key={x.u} onClick={() => search(x.u)} className="glass block w-full text-left truncate text-sm px-3.5 py-2.5 rounded-xl mb-1.5 mt hover:text-[var(--tx)] transition-colors">{x.t}</button>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2.5 justify-center mt-8">
            {PLAT.map(([, n, c]) => <span key={n} className="glass text-sm font-medium px-3.5 py-2 rounded-xl flex items-center gap-2"><i className="w-2 h-2 rounded-full" style={{ background: c }} />{n}</span>)}
          </div>
        </header>

        <section className="py-14">
          <h2 className="text-3xl font-extrabold text-center tracking-tight mb-9">Built to be fast</h2>
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
            {[["⚡", "Instant streaming", "Downloads begin immediately. No waiting for the server to process the whole file."],
            ["🎞️", "Every quality", "Pick any available resolution, or grab audio only as MP3."],
            ["⌨️", "Keyboard first", "Search, switch tabs and download without touching the mouse. Press ? to see all shortcuts."],
            ["🔒", "Private by design", "No accounts and no tracking. Recent links stay in your own browser."]].map(([i, t, d]) => (
              <div key={t} className="glass p-6 rounded-[20px] transition hover:-translate-y-1 hover:border-[var(--a)]"><span className="text-2xl">{i}</span>
                <h4 className="font-semibold mt-3 mb-1.5">{t}</h4><p className="text-sm leading-relaxed mt">{d}</p></div>
            ))}
          </div>
        </section>

        <section className="pb-14 max-w-[740px] mx-auto">
          <h2 className="text-3xl font-extrabold text-center tracking-tight mb-9">FAQ</h2>
          {[["Which videos can I download?", "Public videos from supported platforms. Private, login-only or DRM-protected videos may not work."],
          ["Is it legal?", "Only download content you own or have permission to use. Respecting copyright and platform terms is your responsibility."],
          ["Why is my video unavailable?", "It may be private, or the platform may have blocked the request. Try again later or with another link."]].map(([q, a]) => (
            <details key={q} className="glass rounded-2xl px-5 py-4 mb-2.5"><summary className="font-semibold cursor-pointer">{q}</summary>
              <p className="mt-2.5 text-sm leading-relaxed mt">{a}</p></details>
          ))}
        </section>

        <footer className="text-center text-xs leading-relaxed max-w-[740px] mx-auto pb-10 mt">
          © 2026 SaveClip. Not affiliated with any video platform. Use only with content you have the right to download. Press <Kbd>?</Kbd> for shortcuts.
        </footer>
      </div>

      {help && (
        <div className="fixed inset-0 z-20 grid place-items-center p-5 bg-black/50 backdrop-blur-sm" onClick={() => setHelp(false)}>
          <div role="dialog" aria-modal="true" aria-label="Keyboard shortcuts" className="glass w-full max-w-[420px] rounded-3xl p-6" style={{ background: "var(--bg)" }} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-lg">Keyboard shortcuts</h3><button className="mt text-sm" onClick={() => setHelp(false)}>Close <Kbd>Esc</Kbd></button></div>
            <ul className="grid gap-2.5">
              {SHORTCUTS.map(([k, d], i) => <li key={i} className="flex justify-between items-center text-sm"><span className="mt">{d}</span><span className="flex gap-1">{k.split(" ").map(x => <Kbd key={x}>{x}</Kbd>)}</span></li>)}
            </ul>
          </div>
        </div>
      )}

      <div role="status" className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-2xl font-semibold transition-all duration-300 z-30 ${toast ? "translate-y-0 opacity-100" : "translate-y-24 opacity-0"}`} style={{ background: "var(--tx)", color: "var(--bg)" }}>{toast}</div>
    </>
  );
}
