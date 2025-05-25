import SearchBar from '../../components/animerco/Sb';
import PinnedAnimes from '../../components/animerco/PinnedAnimes';
import LatestEpisodes from '../../components/animerco/LatestEpisodes';

export default function AnimeRco() {
  return (
    <div className="container p-6">
      <SearchBar />
      <h1 className="text-2xl font-bold mb-4 text-white text-right font-cairo pr-[40px]">
        الأنميات المثبتة
      </h1>
      <PinnedAnimes />
      <h1 className="text-2xl font-bold mb-4 text-white text-right font-cairo pr-[40px]">
        اخر الحلقات المضافة
      </h1>
      <LatestEpisodes />
    </div>
  );
}
