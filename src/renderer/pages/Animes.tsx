import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MdPlaylistPlay } from 'react-icons/md';
import { getAnimes } from '../ext/animerco/index';
import { AnimesDetails, Season } from '../ext/animerco/types';

export default function Animes() {
  const { a } = useParams();
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

  const renderSeason = (season: Season) => (
    <div
      key={season.path}
      className="flex items-center justify-center gap-4 bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors"
    >
      <div className="shrink-0">
        <img
          src={season.posterURL}
          alt={season.title}
          className="w-24 h-32 object-cover rounded-md"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="flex-1 flex flex-col items-center text-center">
        <div className="mb-2">
          <h3 className="text-lg font-semibold">{season.title}</h3>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`px-2 py-1 text-sm rounded ${
              season.status === 'مكتمل' ? 'bg-green-600' : 'bg-red-600'
            }`}
          >
            {season.status}
          </span>
        </div>
      </div>
      <a
        href={season.path}
        className="text-white hover:text-blue-300 transition-colors shrink-0"
      >
        <MdPlaylistPlay className="text-4xl" />
      </a>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 font" dir="rtl">
      {details && (
        <div className="space-y-8">
          <div className="relative h-64 rounded-lg overflow-hidden">
            <img
              src={details.bannerURL}
              alt={`${details.title} Banner`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
              <h1 className="text-3xl font-bold text-white">{details.title}</h1>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-8 font-cairo">
            <div className="lg:col-span-1 order-2">
              <img
                src={details.posterURL}
                alt={`${details.title} Poster`}
                className="w-full rounded-lg shadow-lg"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              <div className="mt-4 space-y-2 bg-gray-800 p-4 rounded-lg">
                <p>
                  <strong className="block text-gray-400">النوع:</strong>
                  {details.type}
                </p>
                <p>
                  <strong className="block text-gray-400">عدد الحلقات:</strong>
                  {details.eps}
                </p>
                <p>
                  <strong className="block text-gray-400">عدد المواسم:</strong>
                  {details.seasonsNumber}
                </p>
              </div>
            </div>
            <div className="lg:col-span-3 space-y-6">
              <div className="flex flex-wrap gap-2">
                {details.genres.map((genre) => (
                  <span
                    key={genre}
                    className="px-3 py-1 bg-gray-700 rounded-full text-sm"
                  >
                    {genre}
                  </span>
                ))}
              </div>
              <div>
                <h2 className="text-xl font-bold mb-3">القصة</h2>
                <p className="text-gray-300 leading-relaxed" dir="rtl">
                  {details.description}
                </p>
              </div>
              <div>
                <h2 className="text-xl font-bold mb-4">قائمة المواسم</h2>
                <div className="grid grid-cols-1 gap-4">
                  {details.seasons.length > 0 ? (
                    details.seasons.map(renderSeason)
                  ) : (
                    <div className="p-4 bg-gray-800 rounded-lg text-center text-gray-400">
                      لا توجد مواسم متاحة
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
