import { Link } from 'react-router-dom';

function EpisodeCard({
  episode,
}: {
  episode: {
    path: string;
    title: string;
    coverURL: string;
    season: string;
    episode: string;
  };
}) {
  return (
    <Link to={`/es/${episode.path}`} key={episode.path}>
      <div className="bg-gray-800 w-149 h-30 flex items-center rounded-lg p-3 mr-2 mb-2 space-x-3">
        <div className="flex-1">
          <h2 className="text-white font-bold text-base text-right mt-1 line-clamp-1">
            {episode.title}
          </h2>
          <div className="flex justify-end items-center space-x-2">
            <span className="text-yellow opacity-75 font-cairo font-bold text-s mt-3 inline-block">
              {episode.season}
            </span>
            <span className="bg-gray-700 text-white font-cairo font-bold text-s px-3 py-1 rounded-md mt-3 inline-block">
              {episode.episode}
            </span>
          </div>
        </div>
        <div className="w-30 h-20 rounded-sm overflow-hidden">
          <img
            src={episode.coverURL}
            alt={episode.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </Link>
  );
}

export default EpisodeCard;
