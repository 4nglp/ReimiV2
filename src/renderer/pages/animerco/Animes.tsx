import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAnimes } from '../../ext/animerco/index';
import { AnimesDetails } from '../../ext/animerco/types';

export default function Animes() {
  const { a } = useParams();
  const [details, setDetails] = useState<AnimesDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getDetails = async () => {
      try {
        setLoading(true);
        if (!a) return;
        const data = await getAnimes(a);
        setDetails(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('حدث خطأ أثناء تحميل البيانات');
        setLoading(false);
      }
    };
    getDetails();
  }, [a]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
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
              <table className="w-full text-sm">
                <tbody className="divide-y divide-gray-700">
                  <tr className="hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 py-3 text-gray-400 font-medium">
                      النوع
                    </td>
                    <td className="px-4 py-3 font-medium">{details.type}</td>
                  </tr>
                  <tr className="hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 py-3 text-gray-400 font-medium">
                      عدد الحلقات
                    </td>
                    <td className="px-4 py-3 font-medium">{details.eps}</td>
                  </tr>
                  <tr className="hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 py-3 text-gray-400 font-medium">
                      عدد المواسم
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {details.seasonsNumber}
                    </td>
                  </tr>
                </tbody>
              </table>
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
            <div className="flex flex-wrap gap-2 mb-6">
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
                قائمة المواسم
              </h2>
              {details.seasons.length > 0 ? (
                <div className="bg-gray-800/80 rounded-xl shadow-lg overflow-y-auto max-h-96">
                  <div className="divide-y divide-gray-700/50">
                    {details.seasons.map((season) => (
                      <Link to={`/animerco/seasons/${season.path}`}>
                        <div className="flex items-center gap-4 p-4">
                          <div className="w-20 h-32 md:h-32 shrink-0 relative rounded-lg overflow-hidden">
                            <img
                              src={season.posterURL}
                              alt={season.title}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                <div className="w-0 h-0 border-t-4 border-b-4 border-r-0 border-l-8 border-transparent border-l-white ml-1" />
                              </div>
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-medium">
                                {season.title}
                              </h3>
                              {season.status !== 'غير معروف' && (
                                <span className="px-3 py-1 rounded-full text-sm bg-green-600/30 text-green-400">
                                  {season.status}
                                </span>
                              )}
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
                    لا توجد مواسم متاحة
                  </h3>
                  <p className="text-gray-500">سيتم إضافة المواسم قريباً</p>
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
