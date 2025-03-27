import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import EpisodesListComp from '../components/animerco/EpisodesList';
import { EpisodesList, Server } from '../ext/animerco/types';
import { getEpisode, getServers, getEpisodesList } from '../ext/animerco/index';

function Player(): React.JSX.Element {
  const navigate = useNavigate();
  const { t } = useParams();
  const [src, setSrc] = useState<string>('');
  const [servers, setServers] = useState<Server[]>([]);
  const [episodes, setEpisodes] = useState<EpisodesList[]>([]);
  const [selectedNume, setSelectedNume] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const handleKeyNavigation = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') navigate(-1);
    },
    [navigate],
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!t) return;

        const [sourceData, serversData, episodesData] = await Promise.all([
          getEpisode(t, selectedNume || '1'),
          getServers(t),
          getEpisodesList(t),
        ]);

        if (serversData?.length) {
          setServers(serversData);
          setSelectedNume((prev) => prev || serversData[0].nume);
        }

        if (sourceData) setSrc(sourceData.src);
        if (episodesData) setEpisodes(episodesData);
      } catch (err) {
        setError('Failed to load content. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    window.addEventListener('keydown', handleKeyNavigation);
    fetchData();

    return () => {
      window.removeEventListener('keydown', handleKeyNavigation);
    };
  }, [t, handleKeyNavigation, selectedNume]);

  const handleServerClick = async (nume: string) => {
    try {
      if (!t) return;

      setIsLoading(true);
      const source = await getEpisode(t, nume);
      if (source) {
        setSrc(source.src);
        setSelectedNume(nume);
      }
    } catch (err) {
      setError('Failed to switch server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900">
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        {/* eslint-disable-next-line react/self-closing-comp */}
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white" />
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row items-start gap-6 w-full min-h-screen p-4 font-cairo">
      <div className="w-full md:w-2/3 lg:w-3/4 space-y-4">
        <div className="aspect-video w-full rounded-lg overflow-hidden">
          <iframe
            src={src}
            className="w-full h-full"
            title={`${t} Player`}
            allowFullScreen
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-2 w-full">
          {servers.map((server) => (
            <button
              key={server.nume}
              type="button"
              onClick={() => handleServerClick(server.nume)}
              className={`px-4 py-2 rounded-md transition-colors w-full ${
                selectedNume === server.nume
                  ? 'bg-gray-700 cursor-default'
                  : 'bg-[#141517] hover:bg-[#1a1b1e]'
              }`}
            >
              <span className="truncate block">{server.name}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="w-1/4 rounded-lg p-4 h-[calc(100vh-160px)] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4 text-right">قائمة الحلقات</h3>
        <div className="space-y-2">
          {episodes.map((e) => (
            <EpisodesListComp key={e.path} e={e} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Player;
