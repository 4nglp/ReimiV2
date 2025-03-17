import { useEffect, useState, useCallback, useRef } from 'react';
import { getEpisodesList } from '../ext/animerco';
import { Episode } from '../types';
import EpisodeCard from '../components/EpisodeCard';
import PinnedAnimes from '../components/PinnedAnimes';

export default function AnimeEpisodes() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const fetchEpisodes = async (page: number) => {
    try {
      if (page === 1) setLoading(true);
      else setIsFetchingMore(true);

      const data: Episode[] = await getEpisodesList(page);

      setEpisodes((prev) => {
        const uniqueEpisodes = [...prev, ...data].filter(
          (v, i, a) => a.findIndex((t) => t.path === v.path) === i,
        );
        return uniqueEpisodes;
      });
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to fetch episodes');
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    fetchEpisodes(1);
  }, []);

  const handleScroll = useCallback(() => {
    if (!contentRef.current || isFetchingMore || loading) return;
    const { scrollTop, clientHeight, scrollHeight } = contentRef.current;
    const threshold = 200;
    if (scrollHeight - scrollTop - clientHeight <= threshold) {
      setCurrentPage((prev) => {
        const nextPage = prev + 1;
        fetchEpisodes(nextPage);
        return nextPage;
      });
    }
  }, [isFetchingMore, loading]);

  useEffect(() => {
    const contentDiv = contentRef.current;
    if (!contentDiv) return;

    contentDiv.addEventListener('scroll', handleScroll);

    // eslint-disable-next-line consistent-return
    return () => {
      contentDiv.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  if (loading && currentPage === 1) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <PinnedAnimes />
      <div
        ref={contentRef}
        className="p-4  max-w-4xl mx-auto h-screen overflow-auto"
      >
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
    </div>
  );
}
