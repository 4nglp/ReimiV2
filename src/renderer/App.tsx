import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import 'tailwindcss/tailwind.css';
import Library from './pages/Library';
import EntryList from './components/EntryList';
import EntryDetails from './components/EntryDetails';
import Watch from './pages/Watch';
import Reader from './components/Reader';
import Search from './components/Search';
import AddSeries from './pages/AddSeries';
import Downloads from './pages/Downloads';
import Settings from './pages/Settings';
import AnimeRco from './pages/AnimeRco';
import SideBar from './components/SideBar';
import SearchPage from './pages/AnimeRcoSearchResults';
import Animes from './pages/Animes';
import Movies from './pages/Movies';
import Seasons from './pages/Season';

export default function App() {
  return (
    <Router>
      <div className="flex h-screen">
        <div className="flex-1 overflow-auto p-6 h-full overflow-x-hidden">
          <Routes>
            <Route path="/" element={<Library />} />
            <Route path="/addSeries" element={<AddSeries />} />
            <Route path="/downloads" element={<Downloads />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/animerco" element={<AnimeRco />} />
            <Route path="/entries/:source" element={<EntryList />} />
            <Route
              path="/manga/title/:title/source/:source"
              element={<EntryDetails key={`${window.location.pathname}`} />}
            />
            <Route path="/:source/search" element={<Search />} />
            <Route path="/animerco/search" element={<SearchPage />} />
            <Route
              path="/manga/:title/source/:source"
              element={<EntryDetails />}
            />
            <Route
              path="/manga/:mangaTitle/chapter/:chapterPath/source/:source"
              element={<Reader />}
            />
            <Route path="/animerco/episodes/:t" element={<Watch />} />
            <Route path="/animerco/animes/:a" element={<Animes />} />
            <Route path="/animerco/movies/:a" element={<Movies />} />
            <Route path="/animerco/seasons/:s" element={<Seasons />} />
          </Routes>
        </div>
        <SideBar />
      </div>
    </Router>
  );
}
