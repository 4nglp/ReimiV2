import { useEffect, useState, useCallback, useRef } from 'react';
import { getLatestEpisodes } from '../../ext/animerco';
import { Episode } from '../../ext/animerco/types';
import EpisodeCard from './EpisodeCard';

export default function LatestEpisodes() {
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

      const data: Episode[] = await getLatestEpisodes(page);

      setEpisodes((prev) => {
        const uniqueEpisodes = [...prev, ...data].filter(
          (v, i, a) => a.findIndex((t) => t.path === v.path) === i,
        );
        return uniqueEpisodes;
      });
    } catch (err) {
      // console.error('Fetch error:', err);
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
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-gray-800 w-149 h-30 flex items-center rounded-lg p-3 mr-2 mb-2 space-x-3"
            >
              <div className="flex-1">
                <div className="h-5 w-3/4 bg-gray-700 rounded animate-pulse mb-2" />
                <div className="flex justify-end items-center space-x-2">
                  <div className="h-6 w-16 bg-gray-700 rounded animate-pulse" />
                  <div className="h-6 w-16 bg-gray-700 rounded animate-pulse" />
                </div>
              </div>
              <div className="w-30 h-20 rounded-sm overflow-hidden">
                <div className="w-full h-full bg-gray-700 animate-pulse" />
              </div>
            </div>
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
      <div className="grid grid-cols-2 gap-4">
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
