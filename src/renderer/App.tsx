import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import SideBar from './components/SideBar';
import Library from './pages/Library';
import EntryDetails from './components/3asq/EntryDetails';
import LekDetails from './components/lekmanga/LekDetails';
import Reader from './components/3asq/Reader';
import LekReader from './components/lekmanga/LekReader';
import AddSeries from './pages/AddSeries';
import Downloads from './pages/Downloads';
import Settings from './pages/Settings';

export default function App() {
  return (
    <Router>
      <SideBar />
      <Routes>
        <Route path="/" element={<Library />} />
        <Route path="/addSeries" element={<AddSeries />} />
        <Route path="/downloads" element={<Downloads />} />
        <Route path="/settings" element={<Settings />} />

        <Route path="/entry/:title" element={<EntryDetails />} />
        <Route path="/e/:title" element={<LekDetails />} />
        <Route
          path="/manga/:mangaTitle/chapter/:chapterPath"
          element={<Reader />}
        />
        <Route path="/m/:mangaTitle/ch/:chapterPath" element={<LekReader />} />
      </Routes>
    </Router>
  );
}
