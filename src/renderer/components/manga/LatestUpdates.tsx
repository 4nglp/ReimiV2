import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getEntriesLekManga } from '../../ext/lekmanga';
import { getLatestUpdates as getLatestUpdatesDespair } from '../../ext/despair-manga';
import { getLatestUpdates as getLatestUpdatesComick } from '../../ext/comick';
import { getEntries3asq } from '../../ext/3asq';
import { Latest } from '../../ext/despair-manga/types';

function LatestChapters(): React.JSX.Element {
  const [entries, setEntries] = useState<Latest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isFetchingMore, setIsFetchingMore] = useState<boolean>(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const { s } = useParams();

  const fetchEntries = useCallback(
    async (page: number) => {
      try {
        if (page === 1) {
          setLoading(true);
          setEntries([]);
        } else {
          setIsFetchingMore(true);
        }

        let data: Latest[] = [];

        if (s === 'lekmanga') {
          data = await getEntriesLekManga(page);
        } else if (s === '3asq') {
          data = await getEntries3asq(page);
        } else if (s === 'despair') {
          data = await getLatestUpdatesDespair(page);
        } else if (s === 'comick') {
          const res = await getLatestUpdatesComick(page);
          data = res.map((item: any) => ({
            path: item.md_comics.slug,
            title: item.md_comics.title,
            posterUrl: item.md_comics.md_covers?.[0]?.b2key
              ? `https://meo.comick.pictures/${item.md_comics.md_covers[0].b2key}`
              : '',
            latestChapter: item.chap ? `${item.chap}` : 'N/A',
          }));
        } else {
          throw new Error('Unknown source');
        }

        setEntries((prev) => [...prev, ...data]);
      } catch (err) {
        console.error('Error fetching entries:', err);
        setError('Failed to fetch entries');
      } finally {
        setLoading(false);
        setIsFetchingMore(false);
      }
    },
    [s],
  );

  useEffect(() => {
    if (!s) return;
    setCurrentPage(1);
    fetchEntries(1);
  }, [fetchEntries, s]);

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(
      (observerEntries) => {
        const first = observerEntries[0];
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
    if (currentPage === 1 || !s) return;
    fetchEntries(currentPage);
  }, [currentPage, fetchEntries, s]);

  if (error) {
    return (
      <div className="min-h-screen py-8 px-4 font-cairo">
        <div className="max-w-md mx-auto">
          <div className="bg-slate-800 rounded-lg p-6 text-center border border-slate-700">
            <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Oops! Something went wrong
            </h3>
            <p className="text-slate-400 mb-4">{error}</p>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setCurrentPage(1);
                fetchEntries(1);
              }}
              className="w-full bg-white text-slate-900 font-semibold py-2 px-4 rounded-lg transition-all duration-200 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-white"
            >
              <svg
                className="w-4 h-4 inline mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const skeletonCount = 24;

  if (loading && currentPage === 1) {
    return (
      <div className="min-h-screen p-4 font-cairo">
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <div
              key={i}
              className="relative w-full aspect-[3/4] rounded-lg overflow-hidden"
            >
              <div className="absolute inset-0 bg-slate-700 animate-pulse" />
              <div className="absolute top-2 right-2 h-5 w-12 rounded bg-slate-600 animate-pulse" />
              <div className="absolute bottom-0 inset-x-0 h-8 bg-slate-800/80 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (loading && currentPage === 1) {
    return (
      <div className="min-h-screen py-8 px-4 font-cairo">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg bg-slate-700 animate-pulse aspect-[3/4]"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 font-cairo">
      {entries.length > 0 ? (
        <div className="grid grid-cols-4 gap-4">
          {entries.map((item, index) => (
            <Link
              key={`${item.path}-${index}`}
              to={`/${s}/manga/${item.path}`}
              className="group cursor-pointer"
            >
              <div className="relative w-full h-full rounded-lg overflow-hidden bg-gray-900 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer">
                <div className="w-full h-full overflow-hidden">
                  <img
                    src={item.posterUrl}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src =
                        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDMwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjMjEyNzM3Ii8+CjxwYXRoIGQ9Ik0xNTAgMjAwQzE2NC4yNTkgMjAwIDE3NSAyMTAuNzQxIDE3NSAyMjVTMTY0LjI1OSAyNTAgMTUwIDI1MFMxMjUgMjM5LjI1OSAxMjUgMjI1UzEzNS43NDEgMjAwIDE1MCAyMDBaIiBmaWxsPSIjNEU1ODY1Ii8+Cjwvc3ZnPg==';
                    }}
                  />
                </div>
                <div className="absolute top-3 right-3">
                  <span className="text-white font-bold text-sm bg-black bg-opacity-80 px-2 py-1 rounded backdrop-blur-sm">
                    {item.latestChapter}
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4">
                  <h2 className="text-white font-bold text-lg text-center leading-tight mb-2">
                    {item.title}
                  </h2>
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2" dir="rtl">
            لا فصول متوفرة
          </h3>
        </div>
      )}
      {isFetchingMore && (
        <div className="flex justify-center items-center mt-8 py-6">
          <div className="relative">
            <div className="w-8 h-8 border-2 border-slate-700 rounded-full animate-spin"></div>
            <div className="absolute top-0 left-0 w-8 h-8 border-2 border-white rounded-full animate-spin border-t-transparent"></div>
          </div>
          <p className="ml-3 text-slate-400 font-medium" dir="rtl">
            يتم تحميل االمزيد من الفصول...
          </p>
        </div>
      )}
      <div ref={loadMoreRef} className="h-4" />
    </div>
  );
}

export default LatestChapters;
