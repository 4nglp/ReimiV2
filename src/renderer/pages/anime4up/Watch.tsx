import React, { useEffect, useState, useRef, ReactNode } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMp4UploadMp4, getSendVidMp } from '../../ext/anime4up';

type Server = 'mp4upload' | 'sendvid';

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
      className="h-screen w-full bg-black flex justify-center items-center overflow-hidden"
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
      const url = await fetchVideoUrl(server, t);
      setFileUrl(url);
    } catch (e) {
      console.error(e);
      setError(`Failed to extract video URL from ${server} server.`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVideoSource(currentServer);
  }, [t, currentServer]);

  const handleServerChange = (server: Server) => {
    if (server !== currentServer) {
      setCurrentServer(server);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-solid border-white border-t-transparent" />
      </div>
    );
  }

  if (error) {
    console.log(error);
  }

  return (
    <Container>
      <div className="aspect-video w-full rounded-xl overflow-hidden bg-black relative">
        {/* Server Selection Buttons */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          {availableServers.map((server) => (
            <button
              key={server}
              onClick={() => handleServerChange(server)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                currentServer === server
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {server === 'mp4upload' ? 'MP4Upload' : 'SendVid'}
            </button>
          ))}
        </div>

        {error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-red-500 text-center">
              <p>{error}</p>
              <p className="text-sm mt-2">Try switching to another server</p>
            </div>
          </div>
        )}

        {!error && fileUrl && (
          <video
            key={`${currentServer}-${fileUrl}`} // Force re-render when source changes
            controls
            preload="metadata"
            className="w-full h-full bg-black"
            autoPlay
            src={fileUrl}
          />
        )}
      </div>
    </Container>
  );
}
