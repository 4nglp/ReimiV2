/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/media-has-caption */
import React, {
  useEffect,
  useRef,
  useState,
  ReactNode,
  useLayoutEffect,
} from 'react';
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
  speed: number;
  onSpeed: (s: number) => void;
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
  speed,
  onSpeed,
}: CtxProps) {
  const r = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: -1000, y: -1000 });

  useLayoutEffect(() => {
    if (r.current) {
      const rect = r.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let adjustedX = x;
      let adjustedY = y;

      if (x + rect.width > viewportWidth) {
        adjustedX = x - rect.width;
      }

      if (y + rect.height > viewportHeight) {
        adjustedY = y - rect.height;
      }

      if (adjustedX < 0) {
        adjustedX = 10;
      }

      if (adjustedY < 0) {
        adjustedY = 10;
      }

      setPosition({ x: adjustedX, y: adjustedY });
    }
  }, [x, y]);

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

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.stopPropagation();
    };

    const menu = r.current;
    if (menu) {
      menu.addEventListener('wheel', handleWheel);
    }

    return () => {
      if (menu) {
        menu.removeEventListener('wheel', handleWheel);
      }
    };
  }, []);

  const label = (s: Server) =>
    s === 'mp4upload'
      ? 'MP4Upload'
      : s === 'mp4upload-fhd'
        ? 'MP4Upload FHD'
        : 'SendVid';

  return (
    <div
      ref={r}
      style={{ left: position.x, top: position.y }}
      className="fixed z-50 min-w-[30vh] max-h-[50vh] bg-black/50 backdrop-blur-sm border border-white/20 rounded-xl shadow-xl py-3 font-cairo overflow-y-auto"
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
              className="w-full px-4 py-3 text-sm text-gray-300 hover:bg-white/10 hover:text-white flex justify-between items-center"
              dir="rtl"
            >
              <span>الحلقة السابقة</span>
              <span className="bg-white/20 px-2 py-1 rounded text-xs font-mono">
                V
              </span>
            </button>
          )}
          {ep.next && (
            <button
              onClick={() => nav(`/anime4up/watch/${ep.next}`)}
              className="w-full px-4 py-3 text-sm text-gray-300 hover:bg-white/10 hover:text-white flex justify-between items-center"
              dir="rtl"
            >
              <span>الحلقة التالية</span>
              <span className="bg-white/20 px-2 py-1 rounded text-xs font-mono">
                N
              </span>
            </button>
          )}
          {ep.back && (
            <button
              onClick={() => nav(`/anime4up/anime/${ep.back}`)}
              className="w-full px-4 py-3 text-sm text-gray-300 hover:bg-white/10 hover:text-white flex justify-between items-center"
              dir="rtl"
            >
              <span>العودة للتفاصيل</span>
              <span className="bg-white/20 px-2 py-1 rounded text-xs font-mono">
                B
              </span>
            </button>
          )}
        </div>
      )}

      <div className="border-t border-white/20 mt-2 pt-2">
        <div className="px-4 py-3 text-sm font-medium text-white border-b border-white/20 text-center">
          سرعة التشغيل
        </div>
        <div className="px-4 py-3">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <span className="text-base text-gray-300">0.5x</span>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.5"
              value={speed}
              onChange={(e) => onSpeed(parseFloat(e.target.value))}
              className="flex-1 h-2 rounded-lg appearance-none cursor-pointer slider accent-white"
              style={{
                background: `linear-gradient(to right,
      white 0%,
      white ${((speed - 0.5) / 1.5) * 100}%,
      rgba(255,255,255,0.3) ${((speed - 0.5) / 1.5) * 100}%,
      rgba(255,255,255,0.3) 100%)`,
              }}
            />

            <span className="text-base text-gray-300">2x</span>
          </div>
          <div className="text-center text-white text-base font-medium">
            {speed}x
          </div>
        </div>
      </div>

      <div className="border-t border-white/20 mt-2 pt-2" dir="rtl">
        <div className="px-4 py-3 text-sm font-medium text-white border-b border-white/20 text-center">
          اختصارات لوحة المفاتيح
        </div>
        <div className="px-4 py-2 text-xs text-gray-300 space-y-1">
          <div className="flex justify-between">
            <span>تشغيل/إيقاف</span>
            <span className="bg-white/20 px-2 py-1 rounded font-mono">
              SPACE
            </span>
          </div>
          <div className="flex justify-between">
            <span>تقديم 5 ثواني</span>
            <span className="bg-white/20 px-2 py-1 rounded font-mono">
              D / →
            </span>
          </div>
          <div className="flex justify-between">
            <span>تراجع 5 ثواني</span>
            <span className="bg-white/20 px-2 py-1 rounded font-mono">
              A / ←
            </span>
          </div>
          <div className="flex justify-between">
            <span>رفع الصوت</span>
            <span className="bg-white/20 px-2 py-1 rounded font-mono">
              W / ↑
            </span>
          </div>
          <div className="flex justify-between">
            <span>خفض الصوت</span>
            <span className="bg-white/20 px-2 py-1 rounded font-mono">
              S / ↓
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

const fmt = (s: number) =>
  new Date(s * 1000).toISOString().substring(s >= 3600 ? 11 : 14, 19);

function PlayPauseIcon({ isPlaying }: { isPlaying: boolean }) {
  return (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      {isPlaying ? (
        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
      ) : (
        <path d="M8 5v14l11-7z" />
      )}
    </svg>
  );
}

function SkipIcon({ direction }: { direction: 'forward' | 'backward' }) {
  return (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      {direction === 'forward' ? (
        <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z" />
      ) : (
        <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z" />
      )}
    </svg>
  );
}

interface ProgressBarProps {
  time: number;
  duration: number;
  onSeek: (time: number) => void;
}

function ProgressBar({ time, duration, onSeek }: ProgressBarProps) {
  const progressRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewTime, setPreviewTime] = useState<number | null>(null);
  const [previewPosition, setPreviewPosition] = useState<number>(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleSeek(e);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!progressRef.current) return;

    const rect = progressRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const timeAtPosition = percentage * duration;

    setPreviewTime(timeAtPosition);
    setPreviewPosition(x);

    if (isDragging) {
      onSeek(timeAtPosition);
    }
  };

  const handleMouseLeave = () => {
    setPreviewTime(null);
    if (isDragging) {
      setIsDragging(false);
    }
  };

  const handleSeek = (e: React.MouseEvent) => {
    if (!progressRef.current) return;

    const rect = progressRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const newTime = percentage * duration;

    onSeek(newTime);
  };

  useEffect(() => {
    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging && progressRef.current) {
        const rect = progressRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        const newTime = percentage * duration;
        onSeek(newTime);
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, duration, onSeek]);

  const progressPercentage = duration > 0 ? (time / duration) * 100 : 0;

  return (
    <div className="relative">
      {previewTime !== null && (
        <div
          className="absolute bottom-6 bg-black/80 text-white px-2 py-1 rounded text-lg pointer-events-none z-10 transform -translate-x-1/2 font-cairo"
          style={{ left: previewPosition }}
        >
          {fmt(previewTime)}
        </div>
      )}
      <div
        ref={progressRef}
        className="w-full h-2 bg-white/30 rounded-full cursor-pointer relative overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className="h-full bg-white rounded-full transition-all duration-200 ease-out"
          style={{
            width: `${progressPercentage}%`,
            transitionProperty: isDragging ? 'none' : 'width',
          }}
        />
        <div
          className="absolute top-1/2 w-4 h-4 bg-white rounded-full shadow-lg transform -translate-y-1/2 -translate-x-1/2 transition-all duration-200 ease-out opacity-0 hover:opacity-100 pointer-events-none"
          style={{
            left: `${progressPercentage}%`,
            opacity: isDragging ? 1 : undefined,
          }}
        />
      </div>
    </div>
  );
}

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
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

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

  const setPlaybackSpeed = (newSpeed: number) => {
    setSpeed(newSpeed);
    if (vid.current) {
      vid.current.playbackRate = newSpeed;
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

  const adjustVolume = (delta: number) => {
    if (!vid.current) return;
    const next = Math.max(0, Math.min(1, vid.current.volume + delta));
    vid.current.volume = next;
    volOverlay(next);
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

  const seek = (newTime: number) => {
    if (!vid.current) return;
    vid.current.currentTime = newTime;
    setTime(newTime);
  };

  useEffect(() => {
    load(cur);
    loadEp();
  }, [t, cur]);

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      // Prevent default for all our custom keys
      if (
        [
          'Space',
          'ArrowRight',
          'ArrowLeft',
          'ArrowUp',
          'ArrowDown',
          'KeyW',
          'KeyS',
          'KeyA',
          'KeyD',
          'KeyN',
          'KeyV',
          'KeyB',
        ].includes(e.code)
      ) {
        e.preventDefault();
      }

      // Play/Pause
      if (e.code === 'Space') {
        togglePlay();
      }

      // Seek controls
      if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        jump(5);
      }
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        jump(-5);
      }

      // Volume controls
      if (e.code === 'ArrowUp' || e.code === 'KeyW') {
        adjustVolume(0.1);
      }
      if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        adjustVolume(-0.1);
      }

      // Navigation controls
      if (e.code === 'KeyN' && ep?.next) {
        navigate(`/anime4up/watch/${ep.next}`);
      }
      if (e.code === 'KeyV' && ep?.prev) {
        navigate(`/anime4up/watch/${ep.prev}`);
      }
      if (e.code === 'KeyB' && ep?.back) {
        navigate(`/anime4up/anime/${ep.back}`);
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
  }, [dur, ep, navigate]);

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
              e.currentTarget.playbackRate = speed;
            }}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        )}

        {showCtrl && dur > 0 && (
          <div className="absolute bottom-0 left-4 right-4 z-20">
            <div className="bg-black/50 backdrop-blur-sm rounded-t-lg p-3">
              <div className="mb-3">
                <ProgressBar time={time} duration={dur} onSeek={seek} />
              </div>
              <div className="flex justify-between items-center text-white">
                <span className="text-lg">{fmt(time)}</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => jump(-5)}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                    title="Skip back 5 seconds"
                  >
                    <SkipIcon direction="backward" />
                  </button>
                  <button
                    onClick={togglePlay}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    <PlayPauseIcon isPlaying={isPlaying} />
                  </button>
                  <button
                    onClick={() => jump(5)}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                    title="Skip forward 5 seconds"
                  >
                    <SkipIcon direction="forward" />
                  </button>
                </div>
                <span className="text-lg">{fmt(dur)}</span>
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
            speed={speed}
            onSpeed={setPlaybackSpeed}
          />
        )}
      </div>
    </Container>
  );
}
