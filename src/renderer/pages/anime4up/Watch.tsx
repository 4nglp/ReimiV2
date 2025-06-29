/* eslint-disable jsx-a11y/media-has-caption */
import React, { useEffect, useRef, useState, ReactNode } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getMp4UploadMp4,
  getSendVidMp,
  getEpisodeControls,
} from '../../ext/anime4up';
import { EpisodeControls } from '../../ext/anime4up/types';

type Server = 'mp4upload' | 'sendvid';

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
      className="h-screen w-full bg-black flex justify-center items-center overflow-hidden"
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
  const label = (s: Server) => (s === 'mp4upload' ? 'MP4Upload' : 'SendVid');
  return (
    <div
      ref={r}
      style={{ left: x, top: y }}
      className="fixed z-50 min-w-52 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-xl py-3"
    >
      <div className="px-4 py-3 text-sm font-medium text-white border-b border-white/20 text-center font-cairo">
        قائمة السرفرات
      </div>
      {servers.map((s) => (
        <button
          key={s}
          onClick={() => {
            onServer(s);
            onClose();
          }}
          className={`w-full px-4 py-3 text-sm flex items-center justify-center font-cairo transition ${
            cur === s
              ? 'bg-white/10 text-white font-medium'
              : 'text-gray-300 hover:bg-white/10 hover:text-white'
          }`}
        >
          {label(s)} {cur === s && <span className="text-xs ml-1"></span>}
        </button>
      ))}
      {ep && (ep.prev || ep.next || ep.back) && (
        <div className="border-t border-white/20 mt-2 pt-2 font-cairo">
          <div className="px-4 py-3 text-sm font-medium text-white border-b border-white/20 text-center font-cairo">
            التنقل
          </div>
          {ep.prev && (
            <button
              onClick={() => nav(`/anime4up/watch/${ep.prev}`)}
              className="w-full px-4 py-3 text-sm text-gray-300 hover:bg-white/10 hover:text-white flex justify-center fonte-cairo"
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

export default function Mp4(): React.JSX.Element {
  const { t } = useParams();
  const navigate = useNavigate();
  const [fileUrl, setFileUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [cur, setCur] = useState<Server>('mp4upload');
  const servers: Server[] = ['mp4upload', 'sendvid'];
  const [ep, setEp] = useState<EpisodeControls | null>(null);
  const [ctx, setCtx] = useState<{ x: number; y: number } | null>(null);
  const [showTitle, setShowTitle] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  const fetchUrl = async (s: Server) => {
    if (s === 'mp4upload') {
      const embed = await getMp4UploadMp4(t);
      const html = await (await fetch(embed)).text();
      const pos = html.indexOf('src:') + 6;
      return html.slice(pos, html.indexOf('"', pos));
    }
    return await getSendVidMp(t);
  };

  const load = async (s: Server) => {
    if (!t) {
      setError('Episode ID missing');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      setFileUrl(await fetchUrl(s));
    } catch {
      setError(`Failed to load from ${s}`);
    } finally {
      setLoading(false);
    }
  };

  const loadEp = async () => {
    if (!t) return;
    try {
      setEp(await getEpisodeControls(t));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    load(cur);
    loadEp();
  }, [t, cur]);

  const mouseMove = (e: React.MouseEvent) => {
    if (!box.current) return;
    const r = box.current.getBoundingClientRect();
    const y = e.clientY - r.top;
    const h = r.height;
    setShowTitle(y <= h * 0.1);
    setShowControls(y >= h * 0.85);
  };

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
        className="aspect-video w-full rounded-xl overflow-hidden bg-black relative"
        onContextMenu={(e) => {
          e.preventDefault();
          setCtx({ x: e.clientX, y: e.clientY });
        }}
        onMouseMove={mouseMove}
        onMouseLeave={() => {
          setShowTitle(false);
          setShowControls(false);
        }}
      >
        {showTitle && ep?.title && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none transition-opacity duration-200 opacity-100">
            <span className="bg-black/70 text-white px-4 py-1 rounded-md text-lg font-semibold font-cairo whitespace-nowrap max-w-[90vw] overflow-hidden text-ellipsis">
              {ep.title}
            </span>
          </div>
        )}
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-red-400">
            <p>{error}</p>
            <p className="text-sm opacity-70 mt-2">
              Right‑click للتحويل للسرفر الآخر
            </p>
          </div>
        ) : (
          <video
            key={`${cur}-${fileUrl}`}
            src={fileUrl}
            className="w-full h-full bg-black"
            autoPlay
            preload="metadata"
            controls={showControls}
            onContextMenu={(e) => {
              e.preventDefault();
              setCtx({ x: e.clientX, y: e.clientY });
            }}
          />
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
