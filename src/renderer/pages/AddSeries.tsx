import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Use Link for navigation
import { Entry } from '../types'; // Assuming Entry type is defined
import { getEntries3asq } from '../ext/3asq'; // Import entry fetching for 3asq
import { getEntriesLekManga } from '../ext/lekmanga';

function AddSeries() {
  const [selectedExtension, setSelectedExtension] = useState<string>('3asq');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Function to handle extension change
  const handleExtensionChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setSelectedExtension(event.target.value);
  };

  // Fetch entries when extension changes
  useEffect(() => {
    const fetchEntries = async () => {
      setLoading(true);
      setError(null);

      try {
        let data: Entry[] = [];
        if (selectedExtension === '3asq') {
          data = await getEntries3asq();
        } else if (selectedExtension === 'lekmanga') {
          data = await getEntriesLekManga();
        }

        setEntries(data);
      } catch (err) {
        setError('Failed to fetch entries');
      } finally {
        setLoading(false);
      }
    };

    fetchEntries(); // Fetch entries when the component is mounted or extension is changed
  }, [selectedExtension]);

  return (
    <div>
      <h1>Add Series</h1>

      {/* Extension selection dropdown */}
      <select onChange={handleExtensionChange} value={selectedExtension}>
        <option value="3asq">3asq</option>
        <option value="lekmanga">Lekmanga</option>
      </select>

      {/* Loading, error, and entries display */}
      {loading && <p>Loading entries...</p>}
      {error && <p>{error}</p>}

      {/* Render entries list */}
      {entries.length > 0 ? (
        <ul>
          {entries.map((entry) => (
            <li key={entry.title}>
              {/* Dynamically generate the path based on the selected extension */}
              <Link
                to={
                  selectedExtension === '3asq'
                    ? `/entry/${entry.title}`
                    : `/e/${entry.title}`
                }
              >
                <h3>{entry.title}</h3>
                <img src={entry.posterURL} alt={entry.title} width={200} />
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export default AddSeries;
