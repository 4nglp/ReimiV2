import SearchBar from '../components/animerco/Sb';
import PinnedAnimes from '../components/animerco/PinnedAnimes';
import LatestEpisodes from '../components/animerco/LatestEpisodes';

export default function AnimeRco() {
  return (
    <div className="container">
      <SearchBar />
      <PinnedAnimes />
      <LatestEpisodes />
    </div>
  );
}
