import { Link } from 'react-router-dom';

function SearchCard({
  s,
}: {
  s: {
    path: string;
    title: string;
    posterURL: string;
    status: string;
    type: string;
  };
}) {
  return (
    <Link to={`/anime4up/anime/${s.path}`}>
      <div className="relative bg-gray-800 text-white rounded-lg overflow-hidden w-60 shadow-lg">
        <div className="flex">
          <div className="p-4 flex flex-col justify-center flex-1" dir="rtl">
            <h2
              className="text-white font-bold text-base text-center mt-1 line-clamp-2"
              dir="ltr"
            >
              {s.title}
            </h2>
            <p className="text-sm text-gray-400 text-center">{s.status}</p>
            <div className="mt-2 bg-gray-700 text-xs px-2 py-1 w-[50px] rounded-md flex justify-center items-center self-center">
              <span className="text-center">{s.type}</span>
            </div>
          </div>
          <img
            src={s.posterURL}
            alt={s.title}
            className="w-24 h-36 object-cover rounded-r-lg flex-shrink-0"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </Link>
  );
}

export default SearchCard;
