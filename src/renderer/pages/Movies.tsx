import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getMovie, getM, getMovieServers } from '../ext/animerco/index';
import { Movie, Server } from '../ext/animerco/types';

export default function Movies() {
  const { a } = useParams();
  const [details, setDetails] = useState<Movie | null>(null);
  const [src, setSrc] = useState<string>('');
  const [servers, setServers] = useState<Server[]>([]);
  const [selectedNume, setSelectedNume] = useState<string>('1');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const getDetails = async () => {
      try {
        if (!a) return;
        setIsLoading(true);
        const [movieData, serversData, serverData] = await Promise.all([
          getMovie(a),
          getMovieServers(a),
          getM(a, selectedNume),
        ]);

        if (serversData?.length) {
          setServers(serversData);
          setSelectedNume((prev) => prev || serversData[0].nume);
        }
        if (movieData) {
          setDetails(movieData);
          if (serverData?.src) {
            setSrc(serverData.src);
          }
          const storageKey = 'all series';
          const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
          const alreadyExists = existing.some(
            (item: any) => item.title === movieData.title,
          );
          setAdded(alreadyExists);
        }
      } catch (err) {
        setError('Failed to load content. Please try again.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    getDetails();
  }, [a, selectedNume]);

  const handleServerClick = async (nume: string) => {
    try {
      if (!a) return;
      setIsLoading(true);
      const serverData = await getM(a, nume);
      if (serverData?.src) {
        setSrc(serverData.src);
        setSelectedNume(nume);
      }
    } catch (err) {
      setError('Failed to switch server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const addToLibrary = () => {
    if (!details) return;
    const storageKey = 'all series';
    try {
      const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const alreadyExists = existing.some(
        (item: any) => item.title === details.title,
      );
      if (!alreadyExists) {
        const updated = [
          ...existing,
          {
            title: details.title,
            posterURL: details.posterURL,
            path: `/animerco/movies/${a}`,
          },
        ];
        localStorage.setItem(storageKey, JSON.stringify(updated));
        setAdded(true);
      }
    } catch (e) {
      console.error('Failed to add to library', e);
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
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-solid border-white border-t-transparent" />
      </div>
    );
  }

  if (!details) return null;

  return (
    <div className="font-cairo" dir="rtl">
      <div className="container mx-auto px-6">
        <div className="flex flex-row gap-8 mt-6">
          <div className="w-1/4">
            <div className="mb-3">
              <img
                src={details.posterURL}
                alt={`${details.title} Poster`}
                className="w-full rounded-lg shadow-md"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="bg-gray-800/80 rounded-lg p-4">
              <div className="flex flex-wrap gap-2 justify-center">
                <button
                  type="button"
                  onClick={addToLibrary}
                  className={`flex items-center justify-center gap-2 w-full py-3 rounded-lg text-white transition-all h-[30px] ${
                    added
                      ? 'cursor-not-allowed'
                      : 'bg-primary hover:bg-primary/80 hover:scale-105'
                  }`}
                  disabled={added}
                >
                  {added ? (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>مضاف للمكتبة</span>
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      <span>اضف للمكتبة</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          <div className="md:w-3/4">
            <div className="flex mb-3 mt-3">
              <div className="container mx-auto">
                <h2 className="text-4xl">{details.title}</h2>
              </div>
            </div>
            <h2 className="text-xl font-bold border-s-4 border-primary rounded-sm ps-3 mb-3">
              التفاصيل
            </h2>
            <div className="bg-gray-800/80 rounded-lg p-6 mb-3">
              <p className="text-gray-300 leading-relaxed text-justify">
                {details.description}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {details.genres.map((genre) => (
                <span
                  key={genre}
                  className="px-4 py-2 bg-gray-700 rounded-full text-sm font-medium hover:bg-gray-600 transition-colors"
                >
                  {genre}
                </span>
              ))}
            </div>
            <div className="mt-6">
              <h2 className="text-xl font-bold border-s-4 border-primary rounded-sm ps-3 mb-3">
                المشاهدة
              </h2>
              <div className="flex w-full gap-6 bg-[#0a0a0a] rounded-lg p-4">
                <div className="w-full flex flex-col gap-4">
                  <div className="aspect-video w-full rounded-xl overflow-hidden">
                    <iframe
                      src={src}
                      className="w-full h-full"
                      title={`${a} Player`}
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
              </div>
            </div>
            <div className="mb-10" />
          </div>
        </div>
      </div>
    </div>
  );
}
