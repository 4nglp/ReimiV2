import LatestChapters from '../../components/manga/LatestUpdates';
import Pins from '../../components/manga/Pins';
import SearchBar from '../../components/manga/SearchBar';

export default function Home() {
  return (
    <div className="container p-6">
      <SearchBar />
      <h1 className="text-2xl font-bold text-white text-right font-cairo pr-[20px] mb-[15px]">
        الأعمال المثبتة
      </h1>
      <Pins />
      <h1 className="text-2xl font-bold text-white text-right font-cairo pr-[20px] mb-[15px]">
        آخر التحديثات
      </h1>
      <LatestChapters />
    </div>
  );
}
