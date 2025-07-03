/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/media-has-caption */
import React, { useEffect, useRef, useState, ReactNode } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getMp4UploadMp4,
  getMp4UploadMp4FHD,
  getSendVidMp,
  getEpisodeControls,
} from '../../ext/anime4up';
import { EpisodeControls } from '../../ext/anime4up/types';

type Server = 'mp4upload-fhd' | 'mp4upload' | 'sendvid';

function Container({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  useEffect(() => {
    const fs = () => !document.fullscreenElement && navigate(-1);
    document.addEventListener('fullscreenchange', fs);
    if (ref.current && !document.fullscreenElement) {
      ref.current.requestFullscreen().catch(console.error);
    }
    return () => document.removeEventListener('fullscreenchange', fs);
  }, [navigate]);
  return (
    <div
      ref={ref}
      className="h-screen w-full bg-black flex justify-center items-center overflow-hidden font-cairo"
    >
      {children}
    </div>
  );
}

interface CtxProps {
  x: number;
  y: number;
  onClose: () => void;
  onServer: (s: Server) => void;
  cur: Server;
  servers: Server[];
  ep: EpisodeControls | null;
  nav: (p: string) => void;
}

function ContextMenu({
  x,
  y,
  onClose,
  onServer,
  cur,
  servers,
  ep,
  nav,
}: CtxProps) {
  const r = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const c = (e: MouseEvent) =>
      r.current && !r.current.contains(e.target as Node) && onClose();
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('mousedown', c);
    document.addEventListener('keydown', k);
    return () => {
      document.removeEventListener('mousedown', c);
      document.removeEventListener('keydown', k);
    };
  }, [onClose]);
  const label = (s: Server) =>
    s === 'mp4upload'
      ? 'MP4Upload'
      : s === 'mp4upload-fhd'
        ? 'MP4Upload FHD'
        : 'SendVid';

  return (
    <div
      ref={r}
      style={{ left: x, top: y }}
      className="fixed z-50 min-w-52 bg-black/50 backdrop-blur-sm border border-white/20 rounded-xl shadow-xl py-3 font-cairo"
    >
      <div className="px-4 py-3 text-sm font-medium text-white border-b border-white/20 text-center">
        قائمة السرفرات
      </div>
      {servers.map((s) => (
        <button
          key={s}
          onClick={() => {
            onServer(s);
            onClose();
          }}
          className={`w-full px-4 py-3 text-sm flex items-center justify-center transition ${
            cur === s
              ? 'bg-white/10 text-white font-medium'
              : 'text-gray-300 hover:bg-white/10 hover:text-white'
          }`}
        >
          {label(s)}
        </button>
      ))}
      {ep && (ep.prev || ep.next || ep.back) && (
        <div className="border-t border-white/20 mt-2 pt-2">
          <div className="px-4 py-3 text-sm font-medium text-white border-b border-white/20 text-center">
            التنقل
          </div>
          {ep.prev && (
            <button
              onClick={() => nav(`/anime4up/watch/${ep.prev}`)}
              className="w-full px-4 py-3 text-sm text-gray-300 hover:bg-white/10 hover:text-white flex justify-center"
            >
              ← الحلقة السابقة
            </button>
          )}
          {ep.next && (
            <button
              onClick={() => nav(`/anime4up/watch/${ep.next}`)}
              className="w-full px-4 py-3 text-sm text-gray-300 hover:bg-white/10 hover:text-white flex justify-center"
            >
              → الحلقة التالية
            </button>
          )}
          {ep.back && (
            <button
              onClick={() => nav(`/anime4up/anime/${ep.back}`)}
              className="w-full px-4 py-3 text-sm text-gray-300 hover:bg-white/10 hover:text-white flex justify-center"
            >
              ↩ العودة للتفاصيل
            </button>
          )}
        </div>
      )}
    </div>
  );
}

const fmt = (s: number) =>
  new Date(s * 1000).toISOString().substring(s >= 3600 ? 11 : 14, 19);

export default function Mp4(): JSX.Element {
  const { t } = useParams();
  const navigate = useNavigate();
  const servers: Server[] = ['mp4upload-fhd', 'mp4upload', 'sendvid'];
  const [url, setUrl] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);
  const [cur, setCur] = useState<Server>('mp4upload-fhd');
  const [ep, setEp] = useState<EpisodeControls | null>(null);
  const [ctx, setCtx] = useState<{ x: number; y: number } | null>(null);
  const [showTitle, setShowTitle] = useState(false);
  const [showCtrl, setShowCtrl] = useState(false);
  const [time, setTime] = useState(0);
  const [dur, setDur] = useState(0);
  const [vol, setVol] = useState(1);
  const [showVol, setShowVol] = useState(false);
  const [skipMsg, setSkipMsg] = useState<string | null>(null);
  const [hideCur, setHideCur] = useState(false);

  const box = useRef<HTMLDivElement>(null);
  const vid = useRef<HTMLVideoElement>(null);
  const volTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const curTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getUrl = async (s: Server) => {
    if (!t) throw new Error('Episode ID missing');
    if (s === 'mp4upload') {
      const embed = await getMp4UploadMp4(t);
      const html = await (await fetch(embed)).text();
      const pos = html.indexOf('src:') + 6;
      return html.slice(pos, html.indexOf('"', pos));
    }
    if (s === 'mp4upload-fhd') {
      const embed = await getMp4UploadMp4FHD(t);
      const html = await (await fetch(embed)).text();
      const pos = html.indexOf('src:') + 6;
      return html.slice(pos, html.indexOf('"', pos));
    }
    return await getSendVidMp(t);
  };

  const load = async (s: Server) => {
    if (!t) {
      setErr('Episode ID missing');
      setLoading(false);
      return;
    }
    setLoading(true);
    setErr('');
    try {
      setUrl(await getUrl(s));
    } catch {
      setErr(`Failed to load from ${s}`);
    } finally {
      setLoading(false);
    }
  };

  const loadEp = async () => {
    if (!t) return;
    try {
      setEp(await getEpisodeControls(t));
    } catch {}
  };

  const volOverlay = (next: number) => {
    setVol(next);
    setShowVol(true);
    if (volTimer.current) clearTimeout(volTimer.current);
    volTimer.current = setTimeout(() => setShowVol(false), 1500);
  };

  const wheel = (e: WheelEvent) => {
    e.preventDefault();
    setVol((prev) => {
      const next = Math.max(0, Math.min(1, prev - Math.sign(e.deltaY) * 0.05));
      if (vid.current) vid.current.volume = next;
      volOverlay(next);
      return next;
    });
  };

  const togglePlay = () => {
    if (!vid.current) return;
    if (vid.current.paused) {
      vid.current.play();
    } else {
      vid.current.pause();
    }
  };

  const jump = (sec: number) => {
    if (!vid.current) return;
    const next = Math.max(0, Math.min(dur, vid.current.currentTime + sec));
    vid.current.currentTime = next;
    setTime(next);
    setSkipMsg(`${sec > 0 ? '+' : ''}${sec}s`);
    if (skipTimer.current) clearTimeout(skipTimer.current);
    skipTimer.current = setTimeout(() => setSkipMsg(null), 600);
  };

  const mouseMove = (e: React.MouseEvent) => {
    if (!box.current) return;
    const r = box.current.getBoundingClientRect();
    const y = e.clientY - r.top;
    const h = r.height;
    setShowTitle(y <= h * 0.1);
    setShowCtrl(y >= h * 0.85);
    setHideCur(false);
    if (curTimer.current) clearTimeout(curTimer.current);
    curTimer.current = setTimeout(() => setHideCur(true), 1000);
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!vid.current) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - r.left;
    const pos = (x / r.width) * dur;
    vid.current.currentTime = pos;
    setTime(pos);
  };

  useEffect(() => {
    load(cur);
    loadEp();
  }, [t, cur]);

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      }
      if (e.code === 'ArrowRight') {
        e.preventDefault();
        jump(5);
      }
      if (e.code === 'ArrowLeft') {
        e.preventDefault();
        jump(-5);
      }
    };
    document.addEventListener('keydown', key);
    document.addEventListener('wheel', wheel, { passive: false });
    return () => {
      document.removeEventListener('keydown', key);
      document.removeEventListener('wheel', wheel);
      if (volTimer.current) clearTimeout(volTimer.current);
      if (curTimer.current) clearTimeout(curTimer.current);
      if (skipTimer.current) clearTimeout(skipTimer.current);
    };
  }, [dur]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="animate-spin h-10 w-10 rounded-full border-4 border-white border-t-transparent" />
      </div>
    );
  }

  return (
    <Container>
      <div
        ref={box}
        className={`aspect-video w-full rounded-xl overflow-hidden bg-black relative ${
          hideCur ? 'cursor-none' : ''
        }`}
        onMouseMove={mouseMove}
        onMouseLeave={() => {
          setShowTitle(false);
          setShowCtrl(false);
          setHideCur(false);
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          setCtx({ x: e.clientX, y: e.clientY });
        }}
        onClick={(e) => {
          if (e.target === vid.current) togglePlay();
        }}
      >
        {showTitle && ep?.title && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
            <span
              className="bg-black/50 backdrop-blur-sm text-white px-4 py-1 rounded-xl text-lg font-semibold whitespace-nowrap max-w-[90vw] overflow-hidden text-ellipsis font-cairo shadow-xl border border-white/20"
              dir="rtl"
            >
              {ep.title}
            </span>
          </div>
        )}

        {showVol && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
            <span className="bg-black/60 text-white text-4xl px-8 py-4 rounded-lg font-bold">
              {Math.round(vol * 100)}%
            </span>
          </div>
        )}

        {skipMsg && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
            <span className="bg-black/60 text-white text-4xl px-8 py-4 rounded-lg font-bold">
              {skipMsg}
            </span>
          </div>
        )}

        {err ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-red-400">
            <p>{err}</p>
            <p className="text-sm opacity-70 mt-2">
              Right‑click للتحويل للسرفر الآخر
            </p>
          </div>
        ) : (
          <video
            ref={vid}
            key={`${cur}-${url}`}
            src={url}
            className="w-full h-full bg-black"
            autoPlay
            preload="metadata"
            controls={false}
            onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
            onDurationChange={(e) => setDur(e.currentTarget.duration)}
            onLoadedMetadata={(e) => {
              setDur(e.currentTarget.duration);
              setVol(e.currentTarget.volume);
            }}
          />
        )}

        {showCtrl && dur > 0 && (
          <div className="absolute bottom-0 left-4 right-4 z-20">
            <div className="bg-black/50 backdrop-blur-sm rounded-t-lg p-3">
              <div
                className="w-full h-2 bg-white/30 rounded-full cursor-pointer mb-2"
                onClick={seek}
              >
                <div
                  className="h-full bg-white rounded-full"
                  style={{ width: `${(time / dur) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-white text-xl">
                <span>{fmt(time)}</span>
                <span>{fmt(dur)}</span>
              </div>
            </div>
          </div>
        )}

        {ctx && (
          <ContextMenu
            x={ctx.x}
            y={ctx.y}
            onClose={() => setCtx(null)}
            onServer={(s) => s !== cur && setCur(s)}
            cur={cur}
            servers={servers}
            ep={ep}
            nav={navigate}
          />
        )}
      </div>
    </Container>
  );
}
