import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Details } from '../types'; // Adjust the import path if needed
import { getDetails } from '../ext/3asq/index'; // Adjust the import path if needed

function EntryDetails(): React.JSX.Element {
  const { title } = useParams<{ title: string }>(); // Extract the title from the URL
  const [entryDetails, setEntryDetails] = useState<Details | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!title) {
        setError('Title not found');
        setLoading(false);
        return;
      }

      try {
        const details = await getDetails(title); // Fetch entry details using the title
        setEntryDetails(details);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch entry details');
        setLoading(false);
      }
    };

    fetchDetails();
  }, [title]); // Re-run when the title changes

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!entryDetails) {
    return <p>No details available</p>;
  }

  return (
    <div>
      <h2>{entryDetails.title}</h2>
      {entryDetails.posterURL && (
        <img
          src={entryDetails.posterURL}
          alt={entryDetails.title}
          width={200}
        />
      )}
      <p>{entryDetails.description || 'No description available'}</p>
      <p>Author: {entryDetails.author || 'Not available'}</p>
      <p>Artist: {entryDetails.artist || 'Not available'}</p>
      {entryDetails.genres.length > 0 && (
        <p>Genres: {entryDetails.genres.join(', ')}</p>
      )}
      <p>Year of Release: {entryDetails.pubYear || 'Not specified'}</p>
      <h3>Chapters</h3>
      {entryDetails.chapters.length > 0 ? (
        <ul>
          {entryDetails.chapters.map((chapter) => (
            <li key={chapter.path}>
              <a href={chapter.path} target="_blank" rel="noopener noreferrer">
                {chapter.title}
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p>No chapters available</p>
      )}
    </div>
  );
}

export default EntryDetails;