import { Link } from 'react-router-dom';

function SearchCardManga({
  p,
  source,
}: {
  p: {
    path: string;
    title: string;
    posterUrl: string;
  };
  source: string;
}) {
  return (
    <Link to={`/${source}/manga/${p.path}`}>
      <div className="relative bg-gray-800 text-white rounded-lg overflow-hidden w-60 shadow-lg">
        <div className="flex">
          <div className="p-4 flex flex-col justify-center flex-1" dir="rtl">
            <h2
              className="text-white font-bold text-base text-center mt-1 line-clamp-3"
              dir="ltr"
            >
              {p.title}
            </h2>
          </div>
          <img
            src={p.posterUrl}
            alt={p.title}
            className="w-24 h-36 object-cover rounded-r-lg flex-shrink-0"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </Link>
  );
}

export default SearchCardManga;
