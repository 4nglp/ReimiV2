import { Link } from 'react-router-dom';

type EpisodeCardProps = {
  episode: {
    path: string;
    title: string;
    coverURL: string;
    episode: string;
    type: string;
    status: string;
  };
};

export default function EpisodeCard({
  episode,
}: {
  episode: EpisodeCardProps['episode'];
}) {
  return (
    <Link to={`/anime4up/watch/${episode.path}`} aria-label={episode.title}>
      <div className="relative w-52 h-full rounded-lg overflow-hidden bg-gray-900 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer font-cairo">
        <div className="w-full h-full overflow-hidden">
          <img
            src={episode.coverURL}
            alt={episode.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="absolute top-3 right-3">
          <span className="text-white font-bold text-xs bg-black bg-opacity-80 px-2 py-1 rounded backdrop-blur-sm">
            {episode.status}
          </span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4">
          <h2 className="text-white font-bold text-lg leading-tight mb-2">
            {episode.title}
          </h2>
          <div className="flex items-center justify-between">
            <span className="text-white font-bold text-sm">
              {episode.episode}
            </span>
            <span className="text-white font-bold text-xs bg-black px-2 py-1 rounded uppercase">
              {episode.type}
            </span>
          </div>
        </div>
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300" />
      </div>
    </Link>
  );
}
