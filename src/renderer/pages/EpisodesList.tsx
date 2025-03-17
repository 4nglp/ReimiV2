import { useEffect, useState, useCallback } from 'react';
import { getEpisodesList } from '../ext/animerco';
import { Episode } from '../types';
import EpisodeCard from '../components/EpisodeCard';

export default function AnimeEpisodes() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const fetchEpisodes = useCallback(async (page: number) => {
    try {
      if (page === 1) setLoading(true);
      else setIsFetchingMore(true);
      const data: Episode[] = await getEpisodesList(page);
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
    fetchEpisodes(1);
  }, [fetchEpisodes]);

  const handleScroll = useCallback(() => {
    if (isFetchingMore || loading) return;
    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    if (scrollTop + windowHeight >= documentHeight - 100) {
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
  if (error) return <p>{error}</p>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold font-cairo mb-4" dir="rtl">
        اخر الحلقات المضافة
      </h1>
      <div className="grid grid-cols-3 gap-4">
        {episodes.map((episode) => (
          <EpisodeCard key={episode.path} episode={episode} />
        ))}
      </div>
      {isFetchingMore && <p className="text-center mt-4">Loading more...</p>}
    </div>
  );
}
