import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EntryList3asq from '../components/3asq/EntryList3asq';
import EntryList from '../components/lekmanga/EntryList';

function AddSeries() {
  const [selectedExtension, setSelectedExtension] = useState<string>('3asq');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleExtensionChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setSelectedExtension(event.target.value);
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (searchQuery) {
      navigate(`/search-${selectedExtension}?s=${searchQuery}`);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearchSubmit(event as React.FormEvent);
    }
  };

  return (
    <div>
      <form className="max-w-sm mx-auto" onSubmit={handleSearchSubmit}>
        <h1 className="font-bold text-white">Add Series</h1>

        {/* Search Input */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search series..."
          className="w-full text-black p-2 border border-gray-300 rounded-lg mb-4"
          onKeyDown={handleKeyDown} // Listen for Enter key
        />

        {/* Extension Selection */}
        <select
          className="bg-[#141517] border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          onChange={handleExtensionChange}
          value={selectedExtension}
        >
          <option value="3asq">3asq</option>
          <option value="lekmanga">Lekmanga</option>
        </select>
      </form>

      {/* Entries List Display */}
      {selectedExtension === '3asq' ? <EntryList3asq /> : <EntryList />}
    </div>
  );
}

export default AddSeries;
