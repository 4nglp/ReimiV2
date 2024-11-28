import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Results } from '../types';

function SearchResultsLekManga() {
  const [results, setResults] = useState<Results[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchQueryParam = queryParams.get('s') || '';

  const fetchSearchResults = async (query: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://lekmanga.net/?s=${query}&post_type=wp-manga`,
      );
      const text = await response.text(); // Get the HTML content

      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');

      const r = Array.from(doc.querySelectorAll('.c-tabs-item__content')).map(
        (item: any) => {
          const title = item.querySelector('a')?.getAttribute('title');
          const path = item
            .querySelector('a')
            ?.getAttribute('href')
            ?.split('/')
            .at(-2);
          const posterURL = item.querySelector('img')?.getAttribute('src');

          return { title, posterURL, path };
        },
      );

      setResults(r);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching search results:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchQueryParam) {
      fetchSearchResults(searchQueryParam);
    }
  }, [searchQueryParam]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchSubmit = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && searchQuery) {
      window.location.href = `/search-results-lekmanga?s=${searchQuery}`;
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#141517',
        padding: '20px',
        minHeight: '100vh',
      }}
    >
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold text-white mb-4">
          Search Results - 3asq
        </h1>
        <div className="mb-6 flex justify-between items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleSearchSubmit}
            placeholder="Search again..."
            className="block w-72 p-2 rounded-lg text-black bg-white shadow-md mb-4"
          />
        </div>

        {loading && <p className="text-center text-white">Loading...</p>}

        {!loading && results.length > 0 && (
          <div className="grid grid-cols-5 gap-2 ml-10">
            {results.map((r) => (
              <div key={r.title} className="relative flex flex-col mb-1 mt-4">
                <Link to={`/e/${r.path}`} className="block">
                  <div className="relative w-48 h-72 bg-gray-200 overflow-hidden flex-shrink-0">
                    {r.posterURL && (
                      <img
                        src={r.posterURL}
                        alt={r.title}
                        className="object-cover w-full h-full"
                      />
                    )}
                    <div className="absolute bottom-0 w-full bg-black bg-opacity-60 text-white text-center py-2">
                      {r.title}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}

        {!loading && results.length === 0 && (
          <p className="text-center text-white">No entries found</p>
        )}
      </div>
    </div>
  );
}

export default SearchResultsLekManga;
