import { useEffect, useState, useCallback } from 'react';
import { getEpisodesList } from '../ext/animerco';
import { Episode } from '../types';

export default function AnimeEpisodes() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(2);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const fetchEpisodes = useCallback(async (page: number) => {
    console.log(`Fetching episodes for page: ${page}`);
    try {
      if (page === 2) setLoading(true);
      else setIsFetchingMore(true);
      const data: Episode[] = await getEpisodesList(page);
      console.log('Fetched data:', data);
      setEpisodes((prev) => [...prev, ...data]);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to fetch episodes');
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchEpisodes(2);
  }, [fetchEpisodes]);

  const handleScroll = useCallback(() => {
    if (isFetchingMore || loading) return;
    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    console.log('Scroll detected:', {
      scrollTop,
      windowHeight,
      documentHeight,
    });
    if (scrollTop + windowHeight >= documentHeight - 100) {
      console.log('Fetching next page:', currentPage + 1);
      setCurrentPage((prev) => prev + 1);
      fetchEpisodes(currentPage + 1);
    }
  }, [isFetchingMore, loading, currentPage, fetchEpisodes]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  if (loading && currentPage === 1) return <p>Loading...</p>;
  console.log(episodes);
  if (error) return <p>{error}</p>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Latest Episodes</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {episodes.map((episode) => (
          <div key={episode.path} className="bg-gray-800 p-2 rounded-lg">
            <img
              src={episode.coverURL}
              alt={episode.title}
              className="w-full h-auto rounded-md mb-2"
            />
            <h2
              className="text-white font-semibold text-lg line-clamp-2"
              title={episode.title}
            >
              {episode.title}
            </h2>
            <p className="text-gray-400">{episode.season}</p>
            <p className="text-gray-400">{episode.episode}</p>
            <a
              href={`/${episode.path}`}
              className="text-blue-400 hover:underline block mt-2"
            >
              Watch Now
            </a>
          </div>
        ))}
      </div>
      {isFetchingMore && <p className="text-center mt-4">Loading more...</p>}
    </div>
  );
}
