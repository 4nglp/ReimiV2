import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Entry } from '../../types';
import { getEntries3asq } from '../../ext/3asq/index';

function EntryList3asq(): React.JSX.Element {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const data = await getEntries3asq();
        setEntries(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch entries');
        setLoading(false);
      }
    };

    fetchEntries();
  }, []);

  const formatTitleForURL = (title: string) => {
    return title.toLowerCase().replace(/\s+/g, '-');
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold ">3asq</h1>
        {entries.length > 0 ? (
          <div className="grid grid-cols-5 gap-2">
            {entries.map((entry) => (
              <div
                key={entry.title}
                className="relative flex flex-col mb-1 mt-4"
              >
                <Link
                  to={`/entry/${formatTitleForURL(entry.title)}`}
                  className="block"
                >
                  <div className="relative w-48 h-72 bg-gray-200 overflow-hidden flex-shrink-0">
                    {entry.posterURL && (
                      <img
                        src={entry.posterURL}
                        alt={entry.title}
                        className="object-cover w-full h-full"
                      />
                    )}
                    <div className="absolute bottom-0 w-full bg-black bg-opacity-60 text-white text-center py-2">
                      {entry.title}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p>No entries found</p>
        )}
      </div>
    </div>
  );
}

export default EntryList3asq;
