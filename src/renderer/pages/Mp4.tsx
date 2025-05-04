import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMp4EmbedUrl } from '../ext/animerco';

export default function Mp4(): React.JSX.Element {
  const { t } = useParams();
  const navigate = useNavigate();
  const [fileUrl, setFileUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSource = async () => {
      if (!t) {
        setError('Episode ID is missing.');
        setIsLoading(false);
        return;
      }
      try {
        const { src: embedUrl } = await getMp4EmbedUrl(t);
        const pageRes = await fetch(embedUrl);
        const html = await pageRes.text();
        const pos = html.indexOf('src:') + 6;
        const url = html.slice(pos, html.indexOf('"', pos));
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
    <div className="aspect-video w-full rounded-xl overflow-hidden bg-black">
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        controls
        preload="metadata"
        className="w-full h-full bg-black"
        src={fileUrl}
      >
        <track kind="captions" srcLang="en" label="English captions" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
