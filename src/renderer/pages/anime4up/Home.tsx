import SearchBarA4U from '../../components/anime4up/SearchBar';
import PinnedAnimesA4U from '../../components/anime4up/PinnedAnimes';
import LatestEpisodesA4U from '../../components/anime4up/LatestEps';

export default function Anime4up() {
  return (
    <div className="container p-6">
      <SearchBarA4U />
      <h1 className="text-2xl font-bold mb-4 text-white text-right font-cairo pr-[40px]">
        الأنميات المثبتة
      </h1>
      <PinnedAnimesA4U />
      <h1 className="text-2xl font-bold mb-4 text-white text-right font-cairo pr-[40px]">
        اخر الحلقات المضافة
      </h1>
      <LatestEpisodesA4U />
    </div>
  );
}
