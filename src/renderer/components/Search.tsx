import { useState, useCallback, useEffect } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import SearchBar from './SearchBar';
import { getResults } from '../ext/anime3rb';
import { Entry } from '../types';

export default function Search() {
  const { source } = useParams<{ source: 'lekmanga' | '3asq' | 'anime3rb' }>();
  const location = useLocation();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isFetchingMore, setIsFetchingMore] = useState<boolean>(false);

  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get('q');

  const fetchEntries = useCallback(
    async (page: number) => {
      try {
        if (page === 1) setLoading(true);
        else setIsFetchingMore(true);
        let data: Entry[] = [];
        if (source === 'anime3rb' && query) {
          data = await getResults(query, page);
        } else {
          throw new Error('Query parameter is missing');
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
    [source, query],
  );

  useEffect(() => {
    if (source && query) {
      setEntries([]);
      fetchEntries(1);
    }
  }, [source, query, fetchEntries]);

  const handleScroll = useCallback(() => {
    if (isFetchingMore || loading) return;
    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    if (scrollTop + windowHeight >= documentHeight - 100) {
      setCurrentPage((prev) => prev + 1);
      fetchEntries(currentPage + 1);
    }
  }, [isFetchingMore, loading, currentPage, fetchEntries]);

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
          Retrzy
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">
          <SearchBar source={source ?? ''} />
          {(() => {
            switch (source) {
              case '3asq':
                return '3asq - العاشق';
              case 'anime3rb':
                return 'Anime3rb';
              case 'lekmanga':
                return 'LekManga';
              default:
                return 'lmao';
            }
          })()}
        </h1>
        <div className="flex items-center justify-end text-right">
          <span className="text-4xl font-amiri mr-2 mb-4">
            &quot;{query}&quot;
          </span>
          <h1
            className="text-4xl font-amiri mb-4"
            style={{ fontFamily: 'Amiri' }}
          >
            نتائج البحث ل
          </h1>
        </div>

        {entries.length > 0 ? (
          <div className="grid grid-cols-6 gap-2">
            {entries.map((entry) => (
              <div key={entry.title} className="relative flex flex-col mb-2">
                {source === 'anime3rb' ? (
                  <Link to={`/anime/title/${entry.path}`} className="block">
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
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex justify-center mt-4 text-4xl">
            <p style={{ fontFamily: 'Amiri' }}>لا نتائج متوفرة</p>
          </div>
        )}
        {isFetchingMore && (
          <div className="flex justify-center mt-4 text-2xl">
            <p dir="rtl" style={{ fontFamily: 'Amiri' }}>
              تحميل المزيد...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
