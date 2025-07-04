import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import SearchBar from '../../components/manga/SearchBar';
import SearchCardManga from '../../components/manga/SearchCard';
import { getResults } from '../../ext/3asq';
import { Results } from '../../ext/3asq/types';

export default function SearchPageManga() {
  const [resultsRes, setResultsRes] = useState<Results[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get('q');
  const { s } = useParams();
  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        let data: Results[] = [];
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-solid border-white border-t-transparent" />
      </div>
    );
  }
  if (error) return <p>{error}</p>;

  return (
    <div className="font-cairo p-6">
      <SearchBar />
      <h1 className="text-lg text-center mb-4" dir="rtl">
        نتائج البحث ل&quot;{query}&quot;
      </h1>
      {resultsRes && resultsRes.length > 0 ? (
        <div className="flex flex-wrap flex-row-reverse justify-center gap-5">
          {resultsRes.map((p) => (
            <SearchCardManga key={p.path} p={p} source={s ?? ''} />
          ))}
        </div>
      ) : (
        <h1 className="text-center">لا نتائج متوفرة</h1>
      )}
    </div>
  );
}
