import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import SearchBar from '../../components/manga/SearchBar';
import SearchCardManga from '../../components/manga/SearchCard';
import { getResults } from '../../ext/3asq';
import { getSearchResults } from '../../ext/despair-manga';
import { Results } from '../../ext/3asq/types';

export default function SearchPageManga() {
  const [resultsRes, setResultsRes] = useState<Results[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get('q');
  const { s } = useParams();
  useEffect(() => {
    const fetchResults = async () => {
      try {
        if (!query) throw new Error('Query parameter is missing');
        if (!s) throw new Error('Source parameter is missing');
        setLoading(true);
        let data: Results[] = [];
        if (s === '3asq') {
          data = await getResults(query);
        } else if (s === 'despair') {
          data = await getSearchResults(query);
        } else {
          throw new Error(`Unsupported source: ${s}`);
        }
        setResultsRes(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch results');
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [query, s]);

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
      {resultsRes.length ? (
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
