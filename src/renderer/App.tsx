import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import 'tailwindcss/tailwind.css';
import SideBar from './components/SideBar';
import Library from './pages/Library';
import EntryList from './components/EntryList';
import EntryDetails from './components/EntryDetails';
import Details from './components/Details';
import Reader from './components/Reader';
import Search from './components/Search';
import Player from './components/Player';
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
        <Route
          path="/manga/title/:title/source/:source"
          element={<EntryDetails key={`${window.location.pathname}`} />}
        />
        <Route path="/:source/search" element={<Search />} />
        <Route path="/anime/title/:t" element={<Details />} />
        <Route path="/manga/:title/source/:source" element={<EntryDetails />} />
        <Route
          path="/manga/:mangaTitle/chapter/:chapterPath/source/:source"
          element={<Reader />}
        />
        <Route path="/anime/title/:t/episode/:e" element={<Player />} />
      </Routes>
    </Router>
  );
}
