/* eslint-disable react/self-closing-comp */
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getSeason } from '../ext/animerco/index';
import { SeasonDetails } from '../ext/animerco/types';

export default function Seasons() {
  const { s } = useParams();
  const [details, setDetails] = useState<SeasonDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getDetails = async () => {
      try {
        setLoading(true);
        if (!s) return;
        const data = await getSeason(s);
        setDetails(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('حدث خطأ أثناء تحميل البيانات');
        setLoading(false);
      }
    };
    getDetails();
  }, [s]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        {/* eslint-disable-next-line react/self-closing-comp */}
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-solid border-white border-t-transparent" />
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
                <button type="button" className="h-[25px]">
                  اضف للمكتبة
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
