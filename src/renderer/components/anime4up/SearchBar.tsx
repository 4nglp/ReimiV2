import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchOutlined } from '@ant-design/icons';

function SearchBarA4U() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (query.trim() !== '') {
      navigate(`/anime4up/search?q=${query}`);
    }
  };
  return (
    <div className="flex justify-center mb-4 font-cairo">
      <form onSubmit={handleSearch} className="relative w-[600px]">
        <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-white" />
        <input
          type="text"
          placeholder="...ابحث"
          className="bg-[#212225] text-white text-right w-full rounded-md p-2 pl-10 font-cairo border-none focus:outline-none"
          onChange={(e) => setQuery(e.target.value)}
        />
      </form>
    </div>
  );
}

export default SearchBarA4U;
