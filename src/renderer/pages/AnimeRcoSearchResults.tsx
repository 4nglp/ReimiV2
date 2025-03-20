import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import SearchBar from '../components/animerco/Sb';
import { getResults } from '../ext/animerco';
import { SearchResults } from '../types';

export default function SearchPage() {
  const [resultsRes, setResultsRes] = useState<SearchResults[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get('q');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        let data: SearchResults[] = [];
        if (query) {
          data = await getResults(query);
        } else {
          throw new Error('Query parameter is missing');
        }
        setResultsRes(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch results');
        setLoading(false);
      }
    };
    if (query) {
      fetchResults();
    }
  }, [query]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="font-cairo">
      <SearchBar />
      <h1 className="text-lg text-center mb-4" dir="rtl">
        نتائج البحث ل&quot;{query}&quot;
      </h1>
      {resultsRes && resultsRes.length > 0 ? (
        resultsRes.map((s) => (
          <div key={s.path} className="mb-4 p-4 border rounded-md bg-gray-800">
            <h2 className="text-xl font-bold text-white">{s.title}</h2>
            <p className="text-sm text-gray-400">Rating: {s.rating}</p>
            <p className="text-sm text-gray-400">
              Release Year: {s.releaseYear}
            </p>
            <p className="text-sm text-gray-400">Type: {s.type}</p>
            <img
              src={s.posterURL}
              alt={s.title}
              className="w-32 h-auto mt-2"
              referrerPolicy="no-referrer"
            />
          </div>
        ))
      ) : (
        <h1>No results found</h1>
      )}
    </div>
  );
}
