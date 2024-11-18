import EntryList from '../../components/EntryList';

export default function Library() {
  return (
    <div className="test-class">
      <h1 className="text-3xl font-bold text-blue-500 mb-4">Library</h1>
      <h3 className="text-xl text-gray-700">3asq</h3>
      <EntryList />
      <div className="bg-green-200 p-4 mt-4">Test Tailwind Working</div>
    </div>
  );
}
