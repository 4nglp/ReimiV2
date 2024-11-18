import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Chapter } from '../../types'; // Adjust the import path if needed
import { getChapter } from '../../ext/lekmanga/index'; // Adjust the import path if needed

function Reader(): React.JSX.Element {
  const { chapterPath } = useParams<{ chapterPath: string }>(); // Extract chapterPath from the URL
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChapter = async () => {
      if (!chapterPath) {
        setError('Chapter path not found');
        setLoading(false);
        return;
      }

      try {
        const chapterContent = await getChapter(chapterPath);
        if (!chapterContent.title || chapterContent.pages.length === 0) {
          setError('No chapter content available');
          setLoading(false);
          return;
        }
        setChapter({
          title: chapterContent.title || 'Untitled Chapter', // Default title if undefined
          path: chapterContent.path,
          pages: chapterContent.pages,
        });
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch chapter content');
        setLoading(false);
      }
    };

    fetchChapter();
  }, [chapterPath]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!chapter) {
    return <p>No chapter content available</p>;
  }

  return (
    <div>
      <h2>{chapter.title}</h2>
      {chapter.pages.length > 0 ? (
        <div className="chapter-pages">
          {chapter.pages.map((page, index) => (
            <img
              key={page}
              src={page}
              alt={`Page ${index + 1}`}
              loading="lazy" // Lazy load images for performance
            />
          ))}
        </div>
      ) : (
        <p>No pages available</p>
      )}
    </div>
  );
}

export default Reader;
