import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { epd } from '../types';
import { getEpisode } from '../ext/anime3rb';

function Player(): React.JSX.Element {
  const navigate = useNavigate();
  const { t, e } = useParams();
  const [episode, setEpisode] = useState<epd | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFull = !!document.fullscreenElement;
      setIsFullscreen(isFull);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleKeyNavigation = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isFullscreen) {
        navigate(-1);
      }
    },
    [navigate, isFullscreen],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyNavigation);
    return () => {
      window.removeEventListener('keydown', handleKeyNavigation);
    };
  }, [handleKeyNavigation]);

  useEffect(() => {
    const fetchEp = async () => {
      if (t && e) {
        const ep = await getEpisode(t, e);
        if (ep?.src !== episode?.src) {
          setEpisode(ep);
        }
      }
    };
    fetchEp();
  }, [t, e, episode]);

  return (
    <div className="flex flex-col justify-center items-center h-screen w-full">
      <iframe
        src={episode?.src || ''}
        width="1002"
        height="538"
        title="ep w rbi kbir"
        allowFullScreen
      />
      {episode && (
        <div className="mt-4 text-center" dir="rtl">
          <h1 className="text-2xl font-bold">{episode.epTitle}</h1>
        </div>
      )}
    </div>
  );
}

export default Player;
