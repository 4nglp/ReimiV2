import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TbFileSearch } from 'react-icons/tb';
import EpisodesListComp from '../components/animerco/EpisodesList';
import { EpisodesList, Server, EpisodeControls } from '../ext/animerco/types';
import {
  getEpisode,
  getServers,
  getEpisodesList,
  getEpisodeControls,
} from '../ext/animerco/index';

function Watch(): React.JSX.Element {
  const navigate = useNavigate();
  const { t } = useParams();
  const [src, setSrc] = useState<string>('');
  const [servers, setServers] = useState<Server[]>([]);
  const [episodes, setEpisodes] = useState<EpisodesList[]>([]);
  const [selectedNume, setSelectedNume] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [episodeControls, setEpisodeControls] = useState<EpisodeControls>({
    epTitle: '',
    previousEp: '',
    backToDetails: '',
    nextEp: '',
  });

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

        const [sourceData, serversData, episodesData, episodeControlsData] =
          await Promise.all([
            getEpisode(t, selectedNume || '1'),
            getServers(t),
            getEpisodesList(t),
            getEpisodeControls(t),
          ]);

        if (serversData?.length) {
          setServers(serversData);
          setSelectedNume((prev) => prev || serversData[0].nume);
        }

        if (sourceData) setSrc(sourceData.src);
        if (episodesData) setEpisodes(episodesData);
        if (episodeControlsData) setEpisodeControls(episodeControlsData);
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

  const filteredEpisodes = episodes.filter((e) => {
    const episodeNumber = e.path.split('-').pop() || '';
    return (
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      episodeNumber.includes(searchQuery)
    );
  });

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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white" />
      </div>
    );
  }

  return (
    <div className="container font-cairo flex flex-col gap-4">
      <div className="flex flex-col items-center gap-4">
        <h1
          dir="rtl"
          className="text-xl text-white font-bold text-center line-clamp-1 max-w-4xl"
        >
          {episodeControls.epTitle}{' '}
        </h1>
        <div className="flex gap-3" dir="rtl">
          {episodeControls.previousEp && (
            <button
              type="button"
              onClick={() =>
                navigate(`/animerco/episodes/${episodeControls.previousEp}`)
              }
              className="bg-[#1a1b1e] text-white px-6 py-2 rounded hover:bg-[#2a2b2e]"
            >
              الحلقة السابقة
            </button>
          )}
          {episodeControls.backToDetails && (
            <button
              type="button"
              onClick={() => console.log('details')}
              className="bg-[#1a1b1e] text-white px-6 py-2 rounded hover:bg-[#2a2b2e]"
            >
              التفاصيل
            </button>
          )}
          {episodeControls.nextEp && (
            <button
              type="button"
              onClick={() =>
                navigate(`/animerco/episodes/${episodeControls.nextEp}`)
              }
              className="bg-[#1a1b1e] text-white px-6 py-2 rounded hover:bg-[#2a2b2e]"
            >
              الحلقة التالية
            </button>
          )}
        </div>
      </div>
      <div className="flex w-full gap-6 bg-[#0a0a0a] rounded-lg p-4">
        <div className="w-3/4 flex flex-col gap-4">
          <div className="aspect-video w-full rounded-xl overflow-hidden">
            <iframe
              src={src}
              className="w-full h-full"
              title={`${t} Player`}
              allowFullScreen
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
          <div className="grid grid-cols-6 gap-2">
            {servers.map((server) => (
              <button
                key={server.nume}
                type="button"
                onClick={() => handleServerClick(server.nume)}
                className={`p-2 rounded transition-all text-sm ${
                  selectedNume === server.nume
                    ? 'bg-[#1a1b1e] cursor-default'
                    : 'bg-[#0a0a0a] hover:bg-[#1a1b1e]'
                }`}
              >
                <span className="truncate block">{server.name}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="w-1/4 flex flex-col h-[515px]">
          <div className="bg-[#141517] p-3 rounded-t-xl">
            <div className="relative">
              <input
                type="text"
                placeholder="البحث عن حلقة..."
                value={searchQuery}
                dir="rtl"
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-1.5 pr-8 rounded bg-[#1a1b1e] text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray text-sm"
              />
              <TbFileSearch className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-md" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto bg-[#141517] rounded-b-xl">
            <div className="p-1 space-y-1">
              {filteredEpisodes.map((e) => (
                <EpisodesListComp key={e.path} e={e} />
              ))}
              {filteredEpisodes.length === 0 && (
                <p className="text-gray-400 text-center py-4 text-sm">
                  لا توجد نتائج
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Watch;
