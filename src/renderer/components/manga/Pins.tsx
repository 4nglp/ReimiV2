import { Swiper, SwiperSlide } from 'swiper/react';
import { Link, useParams } from 'react-router-dom';
import 'swiper/css';
import 'swiper/css/free-mode';
import { FreeMode, Autoplay } from 'swiper/modules';
import { useState, useEffect } from 'react';

import { getPinnedEntries as get3asqPinned } from '../../ext/3asq';
import { getPinnedEntries as getLekMangaPinned } from '../../ext/lekmanga';
import { getPinnedEntries as getDespairPinned } from '../../ext/despair-manga';
import { Pinned } from '../../ext/despair-manga/types';

export default function Pins() {
  const { s } = useParams();
  const [pins, setPins] = useState<Pinned[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPins = async () => {
      try {
        let data: Pinned[] = [];
        switch (s) {
          case '3asq':
            data = await get3asqPinned();
            break;
          case 'lekmanga':
            data = await getLekMangaPinned();
            break;
          case 'despair':
            data = await getDespairPinned();
            break;
          default:
            throw new Error('Unknown source');
        }

        setPins(data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch pinned animes');
      } finally {
        setLoading(false);
      }
    };

    fetchPins();
  }, [s]);

  if (loading) {
    return (
      <div className="w-[90%] pb-4 ml-12">
        <div className="flex gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-1/4">
              <div className="relative w-full h-80 overflow-hidden rounded-lg bg-gray-800 animate-pulse">
                <div className="absolute inset-0 flex flex-col justify-end p-4">
                  <div className="h-6 w-3/4 bg-gray-700 rounded animate-pulse mb-2" />
                  <div className="h-4 w-1/2 bg-gray-700 rounded animate-pulse" />
                </div>
                <div className="absolute top-2 left-2 h-6 w-16 bg-gray-700 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) return <p className="text-red-500 text-center">{error}</p>;

  return (
    <div className="w-[90%] pb-4 ml-12">
      <Swiper
        modules={[FreeMode, Autoplay]}
        slidesPerView={4}
        spaceBetween={15}
        loop
        autoplay={{ delay: 3000 }}
        className="w-full"
      >
        {pins.map((pin) => (
          <SwiperSlide key={pin.path}>
            <Link to={`/${s}/manga/${pin.path}`}>
              <div className="relative w-full h-80 overflow-hidden rounded-lg">
                <img
                  src={pin.posterUrl}
                  alt={pin.title}
                  className="opacity-95 w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <h3
                    className="text-base font-bold text-white text-center"
                    dir="ltr"
                  >
                    {pin.title}
                  </h3>
                </div>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
