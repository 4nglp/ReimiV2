import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Entry } from '../../types';
import { getEntries3asq } from '../../ext/3asq/index';

function EntryList3asq(): React.JSX.Element {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isFetchingMore, setIsFetchingMore] = useState<boolean>(false);

  const fetchEntries = async (page: number) => {
    try {
      if (page === 1)
        setLoading(true); // Initial load
      else setIsFetchingMore(true); // Subsequent pages
      const data = await getEntries3asq(page);
      setEntries((prev) => [...prev, ...data]); // Append new entries to existing ones
      setLoading(false);
      setIsFetchingMore(false);
    } catch (err) {
      setError('Failed to fetch entries');
      setLoading(false);
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    fetchEntries(1); // Fetch the first page on load
  }, []);

  const loadMoreEntries = () => {
    setCurrentPage((prev) => prev + 1); // Increment the current page
    fetchEntries(currentPage + 1); // Fetch the next page
  };

  if (loading && currentPage === 1) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">3asq - العاشق</h1>
        {entries.length > 0 ? (
          <div className="grid grid-cols-6 gap-2">
            {entries.map((entry) => (
              <div key={entry.title} className="relative flex flex-col mb-2 ">
                <Link to={`/entry/${entry.path}`} className="block">
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

export default EntryList3asq;
