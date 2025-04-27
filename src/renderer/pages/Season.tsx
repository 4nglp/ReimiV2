import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getSeason } from '../ext/animerco/index';
import { SeasonDetails, Ep } from '../ext/animerco/types';

export default function Seasons() {
  const { s } = useParams();
  const [details, setDetails] = useState<SeasonDetails | null>(null);

  useEffect(() => {
    const getDetails = async () => {
      try {
        if (!s) return;
        const data: SeasonDetails = await getSeason(s);
        setDetails(data);
      } catch (err) {
        console.error(err);
      }
    };
    getDetails();
  }, [s]);

  const renderEp = (ep: Ep) => (
    <Link to={`/animerco/episodes/${ep.path}`}>
      <div
        key={ep.title}
        className="flex items-center justify-center gap-4 bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors"
      >
        <div className="shrink-0">
          <img
            src={ep.coverURL}
            alt={ep.title}
            className="w-24 h-32 object-cover rounded-md"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="flex-1 flex flex-col items-center text-center">
          <div className="mb-2">
            <h3 className="text-lg font-semibold">{ep.title}</h3>
          </div>
        </div>
      </div>
    </Link>
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
              <h1>{details.status}</h1>
              <div>
                <h2 className="text-xl font-bold mb-4">قائمة الحلقات</h2>
                <div className="grid grid-cols-1 gap-4">
                  {details.eps.length > 0 ? (
                    details.eps.map(renderEp)
                  ) : (
                    <div className="p-4 bg-gray-800 rounded-lg text-center text-gray-400">
                      لا توجد حلقات متاحة
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
