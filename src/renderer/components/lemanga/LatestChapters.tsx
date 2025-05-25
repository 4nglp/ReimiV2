import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Entry } from '../../ext/lekmanga/types';
import { getEntriesLekManga } from '../../ext/lekmanga';

function LatestChapters(): React.JSX.Element {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isFetchingMore, setIsFetchingMore] = useState<boolean>(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const fetchEntries = useCallback(async (page: number) => {
    try {
      if (page === 1) {
        setLoading(true);
        setEntries([]);
      } else {
        setIsFetchingMore(true);
      }

      const data: Entry[] = await getEntriesLekManga(page);
      setEntries((prev) => [...prev, ...data]);
    } catch (err) {
      setError('Failed to fetch entries');
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries(1);
  }, [fetchEntries]);

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && !loading && !isFetchingMore) {
          setCurrentPage((prev) => prev + 1);
        }
      },
      { rootMargin: '200px' },
    );
    if (loadMoreRef.current) observerRef.current.observe(loadMoreRef.current);
    return () => observerRef.current?.disconnect();
  }, [loading, isFetchingMore]);

  useEffect(() => {
    if (currentPage === 1) return;
    fetchEntries(currentPage);
  }, [currentPage, fetchEntries]);

  if (loading && currentPage === 1) {
    return <p>Loading...</p>;
  }

  if (error) {
    return (
      <div>
        <p>{error}</p>
        <button
          type="button"
          onClick={() => {
            setCurrentPage(1);
            fetchEntries(1);
          }}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-y-auto p-6 font-cairo">
      <div className="container mx-auto p-4">
        {entries.length > 0 ? (
          <div className="grid grid-cols-4 gap-2">
            {entries.map((entry) => (
              <div key={entry.title} className="relative flex flex-col mb-2">
                <Link to={`/lekmanga/manga/${entry.path}`} className="block">
                  <div className="relative w-48 h-72 mx-2 mb-2 bg-gray-200 overflow-hidden flex-shrink-0 transition-transform transform hover:scale-105">
                    {entry.posterURL && (
                      <img
                        src={entry.posterURL}
                        alt={entry.title}
                        className="object-cover w-full h-full"
                      />
                    )}
                    <div className="absolute inset-0 flex flex-col justify-end items-center p-4 bg-gradient-to-t from-black/80 to-transparent">
                      <div className="absolute bottom-0 w-full text-white text-center py-2 bg-black bg-opacity-60 hover:bg-opacity-80">
                        {entry.title}
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p>No entries found</p>
        )}

        {isFetchingMore && (
          <div className="flex justify-center mt-4">
            <p>Loading more...</p>
          </div>
        )}
        <div ref={loadMoreRef} className="h-1"></div>
      </div>
    </div>
  );
}

export default LatestChapters;
