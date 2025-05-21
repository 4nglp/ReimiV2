import { Swiper, SwiperSlide } from 'swiper/react';
import { Link } from 'react-router-dom';
import 'swiper/css';
import 'swiper/css/free-mode';
import { FreeMode, Autoplay } from 'swiper/modules';
import { useState, useEffect } from 'react';
import { getPinnedAnimes } from '../../ext/animerco';
import { pinnedAnime } from '../../ext/animerco/types';

export default function PinnedAnimes() {
  const [pinnedAnimes, setPinnedAnimes] = useState<pinnedAnime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchPinnedAnimes = async () => {
      try {
        const data: pinnedAnime[] = await getPinnedAnimes();
        setPinnedAnimes(data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch pinned animes');
      } finally {
        setLoading(false);
      }
    };
    fetchPinnedAnimes();
  }, []);
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
  if (error) return <p>{error}</p>;
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
        {pinnedAnimes.map((anime) => (
          <SwiperSlide key={anime.path}>
            <Link to={`/animerco/seasons/${anime.path}`}>
              <div className="relative w-full h-80 overflow-hidden rounded-lg">
                <img
                  src={anime.posterURL}
                  alt={anime.title}
                  className="opacity-95 w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <h3 className="text-base font-bold text-white truncate text-right">
                    {anime.title}
                  </h3>
                  <p className="text-sm opacity-75 text-white font-cairo text-right text-bold">
                    {anime.season}
                  </p>
                </div>
                <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded font-cairo">
                  {anime.status}
                </div>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
