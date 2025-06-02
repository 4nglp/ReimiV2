import LatestChapters from '../../components/manga/LatestUpdates';

export default function Home() {
  return (
    <div className="container p-6">
      <h1 className="text-2xl font-bold text-white text-right font-cairo pr-[20px]">
        اخر التحديثات
      </h1>
      <LatestChapters />
    </div>
  );
}
