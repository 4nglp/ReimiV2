import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Entry } from '../../types';
import { getEntriesLekManga } from '../../ext/lekmanga/index';

function EntryList(): React.JSX.Element {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isFetchingMore, setIsFetchingMore] = useState<boolean>(false);

  const fetchEntries = async (page: number) => {
    try {
      if (page === 1) setLoading(true);
      else setIsFetchingMore(true);

      const data = await getEntriesLekManga(page); // Updated to accept `page` parameter
      setEntries((prev) => [...prev, ...data]);

      setLoading(false);
      setIsFetchingMore(false);
    } catch (err) {
      console.error('Error fetching entries:', err);
      setError('Failed to fetch entries');
      setLoading(false);
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    fetchEntries(1); // Fetch the first page on mount
  }, []);

  const handleScroll = useCallback(() => {
    if (isFetchingMore || loading) return;

    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    if (scrollTop + windowHeight >= documentHeight - 100) {
      setCurrentPage((prev) => prev + 1);
      fetchEntries(currentPage + 1);
    }
  }, [isFetchingMore, loading, currentPage]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  if (loading && currentPage === 1) {
    return <p>Loading...</p>;
  }

  if (error) {
    return (
      <div>
        <p>{error}</p>
        <button
          type="button"
          onClick={() => fetchEntries(1)}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Lek Manga - ليك مانغا</h1>
        {entries.length > 0 ? (
          <div className="grid grid-cols-6 gap-2 ">
            {entries.map((entry) => (
              <div key={entry.title} className="relative flex flex-col mb-2">
                <Link to={`/e/${entry.path}`} className="block">
                  <div className="relative w-48 h-72 bg-gray-200 overflow-hidden flex-shrink-0 transition-transform transform hover:scale-105">
                    {entry.posterURL && (
                      <img
                        src={entry.posterURL}
                        alt={entry.title}
                        className="object-cover w-full h-full"
                      />
                    )}
                    <div className="absolute bottom-0 w-full bg-black bg-opacity-60 text-white text-center py-2">
                      {entry.title}
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
      </div>
    </div>
  );
}

export default EntryList;
