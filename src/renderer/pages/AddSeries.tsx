import React, { useState } from 'react';
import EntryList3asq from '../components/3asq/EntryList3asq';
import EntryList from '../components/lekmanga/EntryList';

function AddSeries() {
  const [selectedExtension, setSelectedExtension] = useState<string>('3asq');
  // Function to handle extension change
  const handleExtensionChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setSelectedExtension(event.target.value);
  };

  return (
    <div>
      <h1>Add Series</h1>
      <select onChange={handleExtensionChange} value={selectedExtension}>
        <option value="3asq">3asq</option>
        <option value="lekmanga">Lekmanga</option>
      </select>
      {selectedExtension === '3asq' ? <EntryList3asq /> : <EntryList />}
    </div>
  );
}

export default AddSeries;
