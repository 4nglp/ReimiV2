import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

export default function CategoryView() {
  const { categoryName } = useParams();
  interface SeriesItem {
    title: string;
    path: string;
    posterURL: string;
    categories?: string[];
  }

  const [series, setSeries] = useState<SeriesItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const allSeries = JSON.parse(localStorage.getItem('all series') || '[]');
      if (categoryName) {
        const filteredSeries = allSeries.filter(
          (item: any) =>
            item.categories && item.categories.includes(categoryName),
        );
        setSeries(filteredSeries);
      } else {
        setSeries([]);
      }
    } catch (err) {
      console.error('Error loading series:', err);
      setSeries([]);
    } finally {
      setLoading(false);
    }
  }, [categoryName]);

  if (loading) {
    return (
      <div className="font-cairo text-center py-20">
        <p className="text-gray-400 text-lg">جاري التحميل...</p>
      </div>
    );
  }

  if (series.length === 0) {
    return (
      <div className="font-cairo text-center py-20">
        <p className="text-gray-400 text-lg">
          لا توجد سلاسل في التصنيف {categoryName}.
        </p>
      </div>
    );
  }

  return (
    <div className="font-cairo container mx-auto px-6 py-8" dir="rtl">
      <h2 className="text-2xl font-bold mb-6">تصنيف: {categoryName}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {series.map((item) => (
          <div key={`${item.title}`} className="block h-full">
            <Link
              to={`/animerco/seasons/${item.path}`}
              className="block h-full"
            >
              <div className="bg-gray-800/80 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col h-full transform hover:scale-105">
                <div className="relative pb-[140%] w-full">
                  <img
                    src={item.posterURL}
                    alt={`${item.title} Poster`}
                    className="absolute top-0 left-0 w-full h-full object-cover"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-4 flex-grow">
                  <h3
                    className="text-center text-sm font-medium text-white line-clamp-1"
                    dir="ltr"
                  >
                    {item.title}
                  </h3>
                  {item.categories && item.categories.length > 0 && (
                    <div className="mt-2 flex flex-wrap justify-center gap-1">
                      {item.categories.slice(0, 2).map((category) => (
                        <span
                          key={category}
                          className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded"
                        >
                          {category}
                        </span>
                      ))}
                      {item.categories.length > 2 && (
                        <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded">
                          +{item.categories.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
