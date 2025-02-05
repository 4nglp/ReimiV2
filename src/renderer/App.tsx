import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import 'tailwindcss/tailwind.css';
import SideBar from './components/SideBar';
import Library from './pages/Library';
import EntryList from './components/EntryList';
import List from './components/List';
import EntryDetails from './components/EntryDetails';
import Reader from './components/Reader';
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
        <Route path="/entries/:source" element={<EntryList />} />
        <Route path="/a" element={<List />} />
        <Route
          path="/manga/title/:title/source/:source"
          element={<EntryDetails key={`${window.location.pathname}`} />}
        />
        <Route path="/manga/:title/source/:source" element={<EntryDetails />} />
        <Route
          path="/manga/:mangaTitle/chapter/:chapterPath/source/:source"
          element={<Reader />}
        />
      </Routes>
    </Router>
  );
}
