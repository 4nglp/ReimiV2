import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import SearchBar from './SearchBar';
import { Entry } from '../types';
import { getEntries3asq } from '../ext/3asq/index';
import { getEntriesLekManga } from '../ext/lekmanga/index';

function EntryList(): React.JSX.Element {
  const { source } = useParams<{ source: 'lekmanga' | '3asq' }>();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isFetchingMore, setIsFetchingMore] = useState<boolean>(false);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const fetchEntries = useCallback(
    async (page: number) => {
      try {
        if (page === 1) setLoading(true);
        else setIsFetchingMore(true);
        let data: Entry[] = [];
        if (source === '3asq') {
          data = await getEntries3asq(page);
        } else if (source === 'lekmanga') {
          data = await getEntriesLekManga(page);
        } else {
          console.log('ora');
        }
        setEntries((prev) => [...prev, ...data]);
        setLoading(false);
        setIsFetchingMore(false);
      } catch (err) {
        setError('Failed to fetch entries');
        setLoading(false);
        setIsFetchingMore(false);
      }
    },
    [source],
  );

  useEffect(() => {
    if (source) {
      setEntries([]);
      fetchEntries(1);
    }
  }, [source, fetchEntries]);

  const handleScroll = useCallback(() => {
    if (isFetchingMore || loading || !contentRef.current) return;

    const { scrollTop, clientHeight, scrollHeight } = contentRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      setCurrentPage((prev) => {
        const nextPage = prev + 1;
        fetchEntries(nextPage);
        return nextPage;
      });
    }
  }, [isFetchingMore, loading, fetchEntries]);

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
    <div
      ref={contentRef}
      className="flex-1 overflow-auto p-6 h-full max-w-full overflow-x-hidden"
    >
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">
          <SearchBar source={source ?? ''} />
          {(() => {
            switch (source) {
              case '3asq':
                return '3asq - العاشق';
              case 'lekmanga':
                return 'LekManga';
              default:
                return 'lmao';
            }
          })()}
        </h1>
        {entries.length > 0 ? (
          <div className="grid grid-cols-6 gap-2">
            {entries.map((entry) => (
              <div key={entry.title} className="relative flex flex-col mb-2">
                {source ? (
                  <Link
                    to={`/manga/${entry.path}/source/${source}`}
                    className="block"
                  >
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
                ) : (
                  <h1>damn</h1>
                )}
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
