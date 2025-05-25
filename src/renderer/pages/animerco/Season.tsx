/* eslint-disable react/self-closing-comp */
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getSeason } from '../../ext/animerco/index';
import { SeasonDetails } from '../../ext/animerco/types';

export default function Seasons() {
  const { s } = useParams();
  const [details, setDetails] = useState<SeasonDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const getDetails = async () => {
      try {
        setLoading(true);
        if (!s) return;
        const data = await getSeason(s);
        setDetails(data);
        const storageKey = 'all series';
        const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
        const alreadyExists = existing.some(
          (item: any) => item.title === data.title,
        );
        setAdded(alreadyExists);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('حدث خطأ أثناء تحميل البيانات');
        setLoading(false);
      }
    };
    getDetails();
  }, [s]);

  const addToLibrary = () => {
    if (!details) return;
    const storageKey = 'all series';
    try {
      const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const alreadyExists = existing.some(
        (item: any) => item.title === details.title,
      );
      if (!alreadyExists) {
        const updated = [
          ...existing,
          {
            title: details.title,
            posterURL: details.posterURL,
            path: `/animerco/seasons/${s}`,
          },
        ];
        localStorage.setItem(storageKey, JSON.stringify(updated));
        setAdded(true);
      }
    } catch (e) {
      console.error('Failed to add to library', e);
    }
  };

  if (loading) {
    return (
      <div className="font-cairo" dir="rtl">
        <div className="container mx-auto px-6">
          <div className="flex flex-row gap-8 mt-6">
            <div className="w-1/4">
              <div className="mb-3">
                <div className="w-full aspect-[2/3] rounded-lg bg-gray-800 animate-pulse" />
              </div>
              <div className="bg-gray-800/80 rounded-lg p-4 mb-3">
                <div className="h-6 w-24 bg-gray-700 rounded animate-pulse mx-auto" />
              </div>
              <div className="bg-gray-800/80 rounded-lg p-4">
                <div className="h-[30px] bg-gray-700 rounded-lg animate-pulse" />
              </div>
            </div>
            <div className="md:w-3/4">
              <div className="flex mb-3 mt-3">
                <div className="container mx-auto">
                  <div className="h-10 w-3/4 bg-gray-800 rounded animate-pulse" />
                </div>
              </div>
              <div className="h-6 w-32 bg-gray-800 rounded animate-pulse mb-3" />
              <div className="bg-gray-800/80 rounded-lg p-6 mb-3">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-700 rounded w-full animate-pulse" />
                  <div className="h-4 bg-gray-700 rounded w-5/6 animate-pulse" />
                  <div className="h-4 bg-gray-700 rounded w-4/6 animate-pulse" />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-8 w-20 bg-gray-800 rounded-full animate-pulse"
                  />
                ))}
              </div>
              <div className="mt-6">
                <div className="h-6 w-32 bg-gray-800 rounded animate-pulse mb-3" />
                <div className="bg-gray-800/80 rounded-xl shadow-lg overflow-y-auto max-h-96">
                  <div className="divide-y divide-gray-700/50">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-16 md:w-32 md:h-20 shrink-0 rounded-lg bg-gray-700 animate-pulse" />
                          <div className="flex-1">
                            <div className="h-5 w-3/4 bg-gray-700 rounded animate-pulse mb-2" />
                            <div className="h-6 w-8 bg-gray-700 rounded-full animate-pulse" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto h-screen flex items-center justify-center font-cairo">
        <div className="text-center p-8 bg-gray-800 rounded-xl max-w-lg">
          <h2 className="text-xl font-bold mb-2">حدث خطأ</h2>
          <p className="text-gray-400">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 px-4 py-2 bg-primary rounded-lg text-white hover:bg-primary/80 transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  if (!details) return null;

  return (
    <div className="font-cairo" dir="rtl">
      <div className="container mx-auto px-6">
        <div className="flex flex-row gap-8 mt-6">
          <div className="w-1/4">
            <div className="mb-3">
              <img
                src={details.posterURL}
                alt={`${details.title} Poster`}
                className="w-full rounded-lg shadow-md"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="bg-gray-800/80 rounded-lg p-4 mb-3">
              <div className="text-center">
                {details.status.includes('يعرض') && (
                  <div className="flex items-center justify-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-2"></span>
                    <span className="text-green-400 text-md">يعرض الآن</span>
                  </div>
                )}
                {details.status.includes('مكتمل') && (
                  <div className="flex items-center justify-center">
                    <span className="text-white-400 text-md">مكتمل</span>
                  </div>
                )}
                {details.status.includes('Unknown') && (
                  <div className="flex items-center justify-center">
                    <span className="text-yellow-400 text-md">غير متوفر</span>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-gray-800/80 rounded-lg p-4">
              <div className="flex flex-wrap gap-2 justify-center">
                <button
                  type="button"
                  onClick={addToLibrary}
                  className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-white transition-all h-[30px] ${
                    added
                      ? 'cursor-not-allowed'
                      : 'bg-primary hover:bg-primary/80 hover:scale-105'
                  }`}
                  disabled={added}
                >
                  {added ? (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>مضاف للمكتبة</span>
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      <span>اضف للمكتبة</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          <div className="md:w-3/4">
            <div className="flex mb-3 mt-3">
              <div className="container mx-auto">
                <h2 className="text-4xl">{details.title}</h2>
              </div>
            </div>
            <h2 className="text-xl font-bold border-s-4 border-primary rounded-sm ps-3 mb-3">
              التفاصيل
            </h2>
            <div className="bg-gray-800/80 rounded-lg p-6 mb-3">
              <p className="text-gray-300 leading-relaxed text-justify">
                {details.description}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {details.genres.map((genre) => (
                <span
                  key={genre}
                  className="px-4 py-2 bg-gray-700 rounded-full text-sm font-medium hover:bg-gray-600 transition-colors"
                >
                  {genre}
                </span>
              ))}
            </div>
            <div className="mt-6">
              <h2 className="text-xl font-bold border-s-4 border-primary rounded-sm ps-3 mb-3">
                قائمة الحلقات
              </h2>
              {details.eps.length > 0 ? (
                <div className="bg-gray-800/80 rounded-xl shadow-lg overflow-y-auto max-h-96">
                  <div className="divide-y divide-gray-700/50">
                    {details.eps.map((ep, index) => (
                      <Link
                        to={`/es/${ep.path}`}
                        key={ep.title}
                        className="block hover:bg-gray-700 transition-all duration-200"
                      >
                        <div className="flex items-center gap-4 p-4">
                          <div className="w-20 h-16 md:w-32 md:h-20 shrink-0 relative rounded-lg overflow-hidden">
                            <img
                              src={ep.coverURL}
                              alt={ep.title}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                <div className="w-0 h-0 border-t-4 border-b-4 border-r-0 border-l-8 border-transparent border-l-white ml-1"></div>
                              </div>
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-medium">
                                {ep.title}
                              </h3>
                              <span className="w-8 h-8 flex items-center justify-center bg-gray-700 rounded-full text-xs font-bold">
                                {index + 1}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-gray-800/80 rounded-xl">
                  <h3 className="text-xl font-medium text-gray-400 mb-2">
                    لا توجد حلقات متاحة
                  </h3>
                  <p className="text-gray-500">سيتم إضافة الحلقات قريباً</p>
                </div>
              )}
            </div>
            <div className="mb-10" />
          </div>
        </div>
      </div>
    </div>
  );
}
