import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAnimes } from '../ext/animerco/index';
import { AnimesDetails } from '../ext/animerco/types';

export default function Animes() {
  const { a } = useParams();
  const navigate = useNavigate();
  const [details, setDetails] = useState<AnimesDetails | null>(null);

  useEffect(() => {
    const getDetails = async () => {
      try {
        if (!a) return;
        const data: AnimesDetails = await getAnimes(a);
        setDetails(data);
      } catch (err) {
        console.error(err);
      }
    };
    getDetails();
  }, [a]);
  return (
    <div className="container mx-auto font-cairo" dir="rtl">
      {details && (
        <div className="space-y-8">
          <div className="relative h-64 overflow-visible bg-black">
            <img
              src={details.bannerURL}
              alt={`${details.title} Banner`}
              className="w-full h-full object-cover rounded-b-xl border-b-2 border-black"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
            <div
              className="absolute bottom-0 right-6 z-40"
              style={{ transform: 'translateY(40%)' }}
            >
              <img
                src={details.posterURL}
                alt={`${details.title} Poster`}
                className="w-52 h-80 object-cover rounded-lg shadow-2xl border-2 border-white/20 mr-3 mb-10"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 pr-56 rounded-b-xl">
              <h1 className="text-3xl font-bold text-white mr-8">
                {details.title}
              </h1>
            </div>
          </div>
          <div className="px-6 space-y-8">
            <div className="grid grid-cols-4 gap-6 items-start">
              <div className="lg:col-span-1  bg-gray-800 rounded-xl shadow-lg overflow-hidden mt-20">
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
              <div className="lg:col-span-3 space-y-6">
                <h2 className="text-xl font-bold border-s-4 border-primary rounded-sm ps-3">
                  التفاصيل
                </h2>
                <div
                  dir="ltr"
                  className="max-h-40 overflow-y-auto space-y-4 px-2 scrollbar-thin"
                >
                  <p
                    dir="rtl"
                    className="text-gray-300 leading-relaxed text-justify text-lg"
                  >
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
              </div>
            </div>
            <div className="space-y-4 mb-2">
              <h2 className="text-xl font-bold border-s-4 border-primary rounded-sm ps-3 mb-4">
                قائمة المواسم
              </h2>
              <div className="bg-gray-800 rounded-xl shadow-lg overflow-y-auto max-h-96">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-gray-700">
                    {details.seasons.length > 0 ? (
                      details.seasons.map((season) => (
                        <tr
                          key={season.path}
                          className="hover:bg-gray-700/30 transition-colors cursor-pointer"
                          onClick={() =>
                            navigate(`/animerco/seasons/${season.path}`)
                          }
                        >
                          <td className="px-4 py-3 w-28">
                            <img
                              src={season.posterURL}
                              alt={season.title}
                              className="w-full h-full object-cover rounded-md"
                              loading="lazy"
                              referrerPolicy="no-referrer"
                            />
                          </td>
                          <td className="px-4 py-3 text-lg">{season.title}</td>
                          <td className="px-4 py-3 text-left">
                            <div className="h-full">
                              <span
                                className={`px-3 py-1 rounded-full text-sm ${
                                  season.status === 'غير معروف'
                                    ? 'hidden'
                                    : 'bg-green-600/30 text-green-400'
                                }`}
                              >
                                {season.status}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-6 text-center text-gray-400"
                        >
                          لا توجد مواسم متاحة
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            {/* eslint-disable-next-line react/self-closing-comp */}
            <div className="mb-10" />
          </div>
        </div>
      )}
    </div>
  );
}
