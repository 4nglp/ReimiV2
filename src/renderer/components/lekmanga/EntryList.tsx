import React, { useEffect, useState } from 'react';
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

  const loadMoreEntries = () => {
    setCurrentPage((prev) => prev + 1);
    fetchEntries(currentPage + 1);
  };

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
        <h1 className="text-2xl font-bold ">Lek Manga - ليك مانغا</h1>
        {entries.length > 0 ? (
          <div className="grid grid-cols-5 gap-2 ml-10">
            {entries.map((entry) => (
              <div
                key={entry.title}
                className="relative flex flex-col mb-1 mt-4"
              >
                <Link to={`/e/${entry.path}`} className="block">
                  <div className="relative w-48 h-72 bg-gray-200 overflow-hidden flex-shrink-0">
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
        {/* Load More Button */}
        <div className="flex justify-center mt-4">
          {isFetchingMore ? (
            <p>Loading more...</p>
          ) : (
            <button
              type="button"
              className="w-64 text-gray-900 hover:text-white border border-gray-800 hover:bg-gray-900 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-gray-600 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-800"
              onClick={loadMoreEntries}
            >
              Load more
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default EntryList;
