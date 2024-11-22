import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Entry } from '../../types';
import { getEntriesLekManga } from '../../ext/lekmanga/index';

function EntryList(): React.JSX.Element {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const data = await getEntriesLekManga();
        setEntries(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching entries:', err);
        setError('Failed to fetch entries');
        setLoading(false);
      }
    };

    fetchEntries();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h2>Entries</h2>
      {entries.length > 0 ? (
        <ul>
          {entries.map((entry) => (
            <li key={entry.path}>
              {' '}
              {/* Use the unique `path` for the key */}
              <h3>{entry.title}</h3>
              <Link to={`/e/${entry.title}`}>
                <img src={entry.posterURL} alt={entry.title} width={200} />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>No entries found</p>
      )}
    </div>
  );
}

export default EntryList;
