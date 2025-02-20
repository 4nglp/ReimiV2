import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';

interface SearchBarProps {
  source: string;
}

function SearchBar({ source }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (query.trim() !== '') {
      navigate(`/${source}/search?q=${query}`);
    }
  };

  return (
    <div className="flex items-center w-2/5">
      <form
        onSubmit={handleSearch}
        className="relative flex items-center w-full"
      >
        <input
          type="text"
          placeholder={`Search in ${source}...`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full h-12 bg-gray-800 text-white pl-4 pr-12 rounded-md focus:outline-none focus:ring-2 focus:ring-white-600"
        />
        <FaSearch className="absolute right-3 text-gray-500" />
      </form>
    </div>
  );
}

export default SearchBar;
