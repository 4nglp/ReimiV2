import React, { useEffect, useState, useRef, ReactNode } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMp4EmbedUrl, getEpisodeControls } from '../ext/animerco';
import { EpisodeControls } from '../ext/animerco/types';

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
  const [episodeControls, setEpisodeControls] = useState<EpisodeControls>({
    epTitle: '',
    previousEp: '',
    backToDetails: '',
    nextEp: '',
  });

  useEffect(() => {
    const fetchSource = async () => {
      if (!t) {
        setError('Episode ID is missing.');
        setIsLoading(false);
        return;
      }
      try {
        const { src: embedUrl } = await getMp4EmbedUrl(t);
        const epc = await getEpisodeControls(t);
        const pageRes = await fetch(embedUrl);
        const html = await pageRes.text();
        const pos = html.indexOf('src:') + 6;
        const url = html.slice(pos, html.indexOf('"', pos));
        setEpisodeControls(epc);
        setFileUrl(url);
      } catch (e) {
        console.error(e);
        setError('Failed to extract video URL.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSource();
  }, [t]);

  const { nextEp, previousEp, backToDetails } = episodeControls;
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      switch (key) {
        case 'n':
          if (nextEp) navigate(`/es/${nextEp}`);
          break;
        case 'p':
          if (previousEp) navigate(`/es/${previousEp}`);
          break;
        case 'd':
          if (backToDetails) navigate(`/animerco/animes/${backToDetails}`);
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate, nextEp, previousEp, backToDetails]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        {/* eslint-disable-next-line react/self-closing-comp */}
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-solid border-white border-t-transparent" />
      </div>
    );
  }
  if (error) {
    navigate(`/animerco/episodes/${t}`);
  }

  return (
    <Container>
      <div className="aspect-video w-full rounded-xl overflow-hidden bg-black">
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          controls
          preload="metadata"
          className="w-full h-full bg-black"
          autoPlay
          src={fileUrl}
        />
      </div>
    </Container>
  );
}
