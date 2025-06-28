/* eslint-disable jsx-a11y/media-has-caption */
import React, { useEffect, useState, useRef, ReactNode } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getMp4UploadMp4,
  getSendVidMp,
  getEpisodeControls,
} from '../../ext/anime4up';
import { EpisodeControls } from '../../ext/anime4up/types';

type Server = 'mp4upload' | 'sendvid';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onServerSelect: (server: Server) => void;
  currentServer: Server;
  servers: Server[];
  episodeControls: EpisodeControls | null;
  onNavigate: (path: string) => void;
}

function ContextMenu({
  x,
  y,
  onClose,
  onServerSelect,
  currentServer,
  servers,
  episodeControls,
  onNavigate,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const getServerDisplayName = (server: Server) => {
    return server === 'mp4upload' ? 'MP4Upload' : 'SendVid';
  };

  const handleNavigation = (path: string) => {
    onNavigate(path);
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="fixed bg-black bg-opacity-95 border border-gray-600 rounded-lg shadow-2xl py-3 min-w-52 z-50 backdrop-blur-sm"
      style={{ left: x, top: y }}
    >
      {/* Servers Section */}
      <div className="px-4 py-3 text-sm font-medium text-white border-b border-gray-600 font-cairo text-center">
        قائمة السرفرات
      </div>
      {servers.map((server) => (
        <button
          key={server}
          type="button"
          onClick={() => {
            onServerSelect(server);
            onClose();
          }}
          className={`w-full px-4 py-3 text-sm transition-all duration-200 flex items-center justify-center font-cairo ${
            currentServer === server
              ? 'bg-[#1a1b1e] text-white font-medium'
              : 'text-gray-300 hover:bg-[#1a1b1e] hover:text-white'
          }`}
        >
          <span className="flex items-center gap-2">
            {getServerDisplayName(server)}
            {currentServer === server && <span className="text-xs">✓</span>}
          </span>
        </button>
      ))}

      {/* Navigation Section */}
      {episodeControls &&
        (episodeControls.prev ||
          episodeControls.next ||
          episodeControls.back) && (
          <>
            <div className="border-t border-gray-600 mt-2 pt-2">
              <div className="px-4 py-3 text-sm font-medium text-white border-b border-gray-600 font-cairo text-center">
                التنقل
              </div>

              {episodeControls.prev && (
                <button
                  type="button"
                  onClick={() =>
                    handleNavigation(`/anime4up/watch/${episodeControls.prev}`)
                  }
                  className="w-full px-4 py-3 text-sm text-gray-300 hover:bg-[#1a1b1e] hover:text-white transition-all duration-200 flex items-center justify-center font-cairo"
                >
                  <span className="flex items-center gap-2">
                    <span>←</span>
                    الحلقة السابقة
                  </span>
                </button>
              )}

              {episodeControls.next && (
                <button
                  type="button"
                  onClick={() =>
                    handleNavigation(`/anime4up/watch/${episodeControls.next}`)
                  }
                  className="w-full px-4 py-3 text-sm text-gray-300 hover:bg-[#1a1b1e] hover:text-white transition-all duration-200 flex items-center justify-center font-cairo"
                >
                  <span className="flex items-center gap-2">
                    <span>→</span>
                    الحلقة التالية
                  </span>
                </button>
              )}

              {episodeControls.back && (
                <button
                  type="button"
                  onClick={() =>
                    handleNavigation(`/anime4up/anime/${episodeControls.back}`)
                  }
                  className="w-full px-4 py-3 text-sm text-gray-300 hover:bg-[#1a1b1e] hover:text-white transition-all duration-200 flex items-center justify-center font-cairo"
                >
                  <span className="flex items-center gap-2">
                    <span>↩</span>
                    العودة للتفاصيل
                  </span>
                </button>
              )}
            </div>
          </>
        )}
    </div>
  );
}

function Container({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleFsChange = () => {
      if (!document.fullscreenElement) {
        navigate(-1);
      }
    };

    document.addEventListener('fullscreenchange', handleFsChange);

    const el = containerRef.current;
    if (el && !document.fullscreenElement && el.isConnected) {
      el.requestFullscreen().catch((err) => {
        console.error('Failed to enter fullscreen:', err);
      });
    }

    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
    };
  }, [navigate]);

  return (
    <div
      ref={containerRef}
      className="h-screen w-full bg-black flex flex-col justify-center items-center overflow-hidden"
    >
      {children}
    </div>
  );
}

export default function Mp4(): React.JSX.Element {
  const { t } = useParams();
  const navigate = useNavigate();
  const [fileUrl, setFileUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentServer, setCurrentServer] = useState<Server>('mp4upload');
  const [availableServers] = useState<Server[]>(['mp4upload', 'sendvid']);
  const [episodeControls, setEpisodeControls] =
    useState<EpisodeControls | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const fetchVideoUrl = async (server: Server) => {
    switch (server) {
      case 'mp4upload':
        const embedUrl = await getMp4UploadMp4(t);
        const pageRes = await fetch(embedUrl);
        const html = await pageRes.text();
        const pos = html.indexOf('src:') + 6;
        return html.slice(pos, html.indexOf('"', pos));
      case 'sendvid':
        return await getSendVidMp(t);
      default:
        throw new Error(`Unknown server: ${server}`);
    }
  };

  const loadVideoSource = async (server: Server) => {
    if (!t) {
      setError('Episode ID is missing.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const url = await fetchVideoUrl(server);
      setFileUrl(url);
    } catch (e) {
      console.error(e);
      setError(`Failed to extract video URL from ${server} server.`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadEpisodeControls = async () => {
    if (!t) return;

    try {
      const controls = await getEpisodeControls(t);
      setEpisodeControls(controls);
    } catch (e) {
      console.error('Failed to load episode controls:', e);
    }
  };

  useEffect(() => {
    loadVideoSource(currentServer);
    loadEpisodeControls();
  }, [t, currentServer]);

  const handleServerChange = (server: Server) => {
    if (server !== currentServer) {
      setCurrentServer(server);
    }
  };

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
    });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  if (isLoading) {
    return (
      <Container>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-solid border-white border-t-transparent" />
        </div>
      </Container>
    );
  }

  if (error) {
    console.log(error);
  }

  return (
    <Container>
      {/* Episode Title */}
      {episodeControls?.title && (
        <div className="w-full max-w-6xl px-4 mb-4">
          <h1 className="text-white text-xl font-semibold text-center font-cairo">
            {episodeControls.title}
          </h1>
        </div>
      )}

      {/* Video Player Container */}
      <div
        className="aspect-video w-full max-w-6xl rounded-xl overflow-hidden bg-black relative"
        onContextMenu={handleContextMenu}
      >
        {/* Server Indicator */}
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-black bg-opacity-70 text-white px-3 py-1 rounded-md text-sm font-medium">
            {currentServer === 'mp4upload' ? 'MP4Upload' : 'SendVid'}
          </div>
        </div>

        {error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-red-400 text-center">
              <p className="text-lg mb-2">{error}</p>
              <p className="text-sm opacity-70">
                Right-click to switch servers
              </p>
            </div>
          </div>
        )}

        {!error && fileUrl && (
          <video
            key={`${currentServer}-${fileUrl}`}
            controls
            preload="metadata"
            className="w-full h-full bg-black"
            autoPlay
            src={fileUrl}
            onContextMenu={handleContextMenu}
          />
        )}

        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            onClose={closeContextMenu}
            onServerSelect={handleServerChange}
            currentServer={currentServer}
            servers={availableServers}
            episodeControls={episodeControls}
            onNavigate={handleNavigation}
          />
        )}
      </div>
    </Container>
  );
}
