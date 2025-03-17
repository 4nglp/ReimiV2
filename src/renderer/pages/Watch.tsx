import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getEpisode } from '../ext/animerco/index';

function Player(): React.JSX.Element {
  const navigate = useNavigate();
  const { t } = useParams();
  const [src, setSrc] = useState<string>('');

  const handleKeyNavigation = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        navigate(-1);
      }
    },
    [navigate],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyNavigation);
    return () => {
      window.removeEventListener('keydown', handleKeyNavigation);
    };
  }, [handleKeyNavigation]);

  useEffect(() => {
    const fetchEpisode = async () => {
      if (t) {
        const source = await getEpisode(t);
        if (source) {
          setSrc(source.src);
        }
      }
    };
    fetchEpisode();
  }, [t, src]);

  return (
    <div className="flex flex-col justify-center items-center h-screen w-full">
      <iframe
        src={src || ''}
        width="800"
        height="450"
        title={`${t}`}
        allowFullScreen
        sandbox="allow-scripts allow-same-origin allow-top-navigation-by-user-activation"
      />
    </div>
  );
}

export default Player;
