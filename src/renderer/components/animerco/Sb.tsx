import { SearchOutlined } from '@ant-design/icons';

function SearchBar() {
  return (
    <div className="flex justify-center mb-4 font-cairo">
      <div className="relative w-[600px]">
        <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-white" />
        <input
          type="text"
          placeholder="...ابحث"
          className="bg-[#212225] text-white text-center w-full rounded-md p-2 pl-10 font-cairo border-none focus:outline-none"
        />
      </div>
    </div>
  );
}

export default SearchBar;
