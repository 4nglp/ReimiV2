import { useEffect, useState, useCallback, useRef } from 'react';
import { getLatestEpisodes } from '../../ext/anime4up';
import { LatestEpisode } from '../../ext/anime4up/types';
import EpisodeCard from './EpisodeCard';
import EpisodeCardSkeleton from './EpisodeCardSkeleton';

export default function LatestEpisodesA4U() {
  const [episodes, setEpisodes] = useState<LatestEpisode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const fetchEpisodes = async (page: number) => {
    try {
      if (page === 1) setLoading(true);
      else setIsFetchingMore(true);

      const data: LatestEpisode[] = await getLatestEpisodes(page);

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

  if (loading && currentPage === 1) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 16 }).map((_, i) => (
            <EpisodeCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) return <p>{error}</p>;

  return (
    <div
      ref={contentRef}
      className="p-4 max-w-4xl mx-auto h-screen overflow-auto"
    >
      <div className="grid grid-cols-4 gap-4">
        {episodes.map((episode) => (
          <EpisodeCard key={episode.path} episode={episode} />
        ))}
      </div>
      {isFetchingMore && (
        <p className="text-center mt-4 font-cairo">... تحميل المزيد</p>
      )}
    </div>
  );
}
