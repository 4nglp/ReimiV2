import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getMp4EmbedUrl } from '../ext/animerco';

export default function Mp4(): React.JSX.Element {
  const { t } = useParams();
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
      <div className="flex items-center justify-center h-full bg-gray-900 rounded-xl">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-solid border-white border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-900 rounded-xl p-4">
        <p className="text-red-500 text-lg mb-4">{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
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
