import LatestUpdates from '../components/despair-manga/LatestUpdates';
import Pins from '../components/despair-manga/Pins';

export default function Home() {
  return (
    <div className="container p-6">
      <h1 className="text-2xl font-bold mb-4 text-white text-right font-cairo pr-[40px]">
        الأعمال المثبتة
      </h1>
      <Pins />
      <h1 className="text-2xl font-bold mb-4 text-white text-right font-cairo pr-[40px]">
        اخر التحديثات
      </h1>
      <LatestUpdates />
    </div>
  );
}
