import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Server } from '../types';
import { getEpisode, getServers } from '../ext/animerco/index';

function Player(): React.JSX.Element {
  const navigate = useNavigate();
  const { t } = useParams();
  const [src, setSrc] = useState<string>('');
  const [servers, setServers] = useState<Server[]>([]);
  const [selectedNume, setSelectedNume] = useState<string>('1');

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
        const source = await getEpisode(t, selectedNume);
        if (source) {
          setSrc(source.src);
        }
      }
    };
    fetchEpisode();
  }, [t, selectedNume]);

  useEffect(() => {
    const fetchServers = async () => {
      if (t) {
        const s = await getServers(t);
        if (s) {
          setServers(s);
        }
      }
    };
    fetchServers();
  }, [t]);

  const handleServerClick = (nume: string) => {
    setSelectedNume(nume);
  };

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
      <div className="mt-4 flex gap-2">
        {servers.map((server) => (
          <button
            type="button"
            key={server.nume}
            onClick={() => handleServerClick(server.nume)}
            className={`px-4 py-2 rounded-md transition ${
              selectedNume === server.nume
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-white hover:bg-gray-700'
            }`}
          >
            {server.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Player;
