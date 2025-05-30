import { useState, useEffect } from 'react';
import { getLatestUpdates } from '../../ext/despair-manga';
import { Latest } from '../../ext/despair-manga/types';

export default function LatestUpdates() {
  const [updates, setUpdates] = useState<Latest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUpdates = async () => {
    try {
      const data: Latest[] = await getLatestUpdates();
      setUpdates(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpdates();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <h1 className="text-white text-xl">Loading...</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 font-cairo">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {updates.map((item) => (
            <div key={item.path} className="cursor-pointer">
              <div className="relative">
                <img
                  src={item.posterUrl}
                  alt={item.title}
                  className="w-full h-80 object-cover rounded-lg"
                />
                <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                  {item.latestChapter}
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                  <h3 className="text-white text-sm font-medium text-center">
                    {item.title}
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>

        {updates.length === 0 && (
          <div className="text-center text-gray-400 mt-12">
            <p className="text-xl mb-2">📚</p>
            <p>No updates available</p>
          </div>
        )}
      </div>
    </div>
  );
}
