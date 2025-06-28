import { useState, useEffect } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import SearchBar from '../../components/animerco/Sb';
import { getResults } from '../../ext/3asq';
import { SearchResults } from '../../ext/animerco/types';

export default function SearchPage() {
  const [resultsRes, setResultsRes] = useState<SearchResults[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const { s } = useParams();
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
          {resultsRes.map((e) => (
            <Link to={`/${s}/manga/${e.path}`}>
              <div key={e.path} className="w-[calc(25%-12px)]">
                <img src={e.porURL} alt={e.title} />
                <h1>{e.title}</h1>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <h1 className="text-center">لا نتائج متوفرة</h1>
      )}
    </div>
  );
}
