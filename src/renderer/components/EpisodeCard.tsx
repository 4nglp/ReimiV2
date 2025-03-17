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
    <Link to={`/animerco/episodes/${episode.path}`} key={episode.path}>
      <div className="bg-gray-800 w-72 h-20 flex items-center rounded-lg p-3 space-x-3">
        <div className="flex-1">
          <h2 className="text-white font-bold text-sm text-right mt-1 line-clamp-1">
            {episode.title}
          </h2>
          <div className="flex justify-end items-center space-x-2">
            <span className="text-yellow-400 font-cairo font-bold text-s mt-2 inline-block">
              {episode.season}
            </span>
            <span className="bg-gray-700 text-white font-cairo font-bold text-xs px-3 py-1 rounded-md mt-3 inline-block">
              {episode.episode}
            </span>
          </div>
        </div>
        <div className="w-20 h-14 rounded-sm overflow-hidden">
          <img
            src={episode.coverURL}
            alt={episode.title}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </Link>
  );
}

export default EpisodeCard;
