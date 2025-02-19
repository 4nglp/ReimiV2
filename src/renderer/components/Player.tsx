import React, { useRef, useEffect, useState, ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { epd } from '../types';
import { getEpisode } from '../ext/anime3rb';

function Container({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.onfullscreenchange = () => {
      if (!document.fullscreenElement) {
        navigate(-1);
      }
    };
    if (containerRef.current && !document.fullscreenElement) {
      containerRef.current.requestFullscreen();
    }
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

function Player(): React.JSX.Element {
  const { t, e } = useParams();
  const [episode, setEpisode] = useState<epd | null>(null);

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
  const contentRef = useRef<HTMLDivElement>(null);
  return (
    <Container>
      <div
        ref={contentRef}
        className="flex justify-center items-center flex-col relative"
      >
        <iframe
          src={episode?.src || ''}
          width="800"
          height="450"
          title="ep w rbi kbir"
          allowFullScreen
        />
      </div>
    </Container>
  );
}
export default Player;
