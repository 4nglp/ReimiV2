import { Link, useLocation } from 'react-router-dom';

function EpisodesListComp({ e }: { e: { path: string; title: string } }) {
  const location = useLocation();
  const active = location.pathname.endsWith(`/animerco/episodes/${e.path}`);

  return (
    <Link
      to={`/animerco/episodes/${e.path}`}
      className={`flex items-center p-3 rounded-lg transition-colors text-right ${
        active ? 'bg-[#1a1b1e] text-white' : 'bg-[#141517] hover:bg-[#1a1b1e]'
      }`}
    >
      <span className="flex-1 truncate">{e.title}</span>
    </Link>
  );
}

export default EpisodesListComp;
