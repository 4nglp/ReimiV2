import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Library from './pages/library';
import EntryDetails from './components/3asq/EntryDetails';
import LekDetails from './components/lekmanga/LekDetails';
import Reader from './components/3asq/Reader';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Library />} />
        <Route path="/entry/:title" element={<EntryDetails />} />
        <Route path="/e/:title" element={<LekDetails />} />
        <Route
          path="/manga/:mangaTitle/chapter/:chapterPath"
          element={<Reader />}
        />
      </Routes>
    </Router>
  );
}
