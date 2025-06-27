import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import SearchBarA4U from '../../components/anime4up/SearchBar';
import SearchCard from '../../components/anime4up/SearchCard';
import { getResults } from '../../ext/anime4up';
import { SearchResults } from '../../ext/anime4up/types';

export default function SearchPageA4U() {
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
    <div className="font-cairo p-6">
      <SearchBarA4U />
      <h1 className="text-lg text-center mb-4" dir="rtl">
        نتائج البحث ل&quot;{query}&quot;
      </h1>
      {resultsRes && resultsRes.length > 0 ? (
        <div className="flex flex-wrap flex-row-reverse justify-center gap-5">
          {resultsRes.map((s) => (
            <div key={s.path} className="w-[calc(25%-12px)]">
              <SearchCard key={s.path} s={s} />
            </div>
          ))}
        </div>
      ) : (
        <h1 className="text-center">لا نتائج متوفرة</h1>
      )}
    </div>
  );
}
