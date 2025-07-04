import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import 'tailwindcss/tailwind.css';
import Library from './pages/Library';
import EntryList from './components/EntryList';
import EntryDetails from './components/EntryDetails';
import Watch from './pages/animerco/Watch';
import Reader from './components/Reader';
import Search from './components/Search';
import Downloads from './pages/Downloads';
import Settings from './pages/Settings';
import AnimeRco from './pages/animerco/AnimeRco';
import SideBar from './components/SideBar';
import SearchPage from './pages/animerco/AnimeRcoSearchResults';
import Animes from './pages/animerco/Animes';
import Movies from './pages/animerco/Movies';
import Seasons from './pages/animerco/Season';
import Mp4 from './pages/animerco/Mp4';
import CategoryView from './pages/CategoryView';
import Home from './pages/manga/Home';
import Details from './pages/manga/Details';
import Read from './pages/manga/Read';

import Anime4up from './pages/anime4up/Home';
import AnimeDetails from './pages/anime4up/AnimeDetails';
import SearchPageA4U from './pages/anime4up/SearchResults';
import WatchA4U from './pages/anime4up/Watch';
import SearchPageManga from './pages/manga/Search';

export default function App() {
  return (
    <Router>
      <div className="flex h-screen">
        <div className="flex-1 overflow-auto h-full overflow-x-hidden">
          <Routes>
            {/* app */}
            <Route path="/" element={<Library />} />
            <Route path="/category/:categoryName" element={<CategoryView />} />
            <Route path="/downloads" element={<Downloads />} />
            <Route path="/settings" element={<Settings />} />
            {/* animerco */}
            <Route path="/animerco" element={<AnimeRco />} />
            <Route path="/animerco/search" element={<SearchPage />} />
            <Route path="/animerco/episodes/:t" element={<Watch />} />
            <Route path="/animerco/movies/:a" element={<Movies />} />
            <Route path="/animerco/animes/:a" element={<Animes />} />
            <Route path="/animerco/seasons/:s" element={<Seasons />} />
            <Route path="/es/:t" element={<Mp4 />} />
            {/* lekmanga */}
            {/* <Route path="/lekmanga" element={<LekManga />} /> */}
            {/* manga  */}
            <Route path="/:s" element={<Home />} />
            <Route path="/:s/manga/:m/" element={<Details />} />
            <Route path="/:s/read/:m/:n" element={<Read />} />
            <Route path="/:s/search/" element={<SearchPageManga />} />
            {/* anime4up*/}
            <Route path="/anime4up" element={<Anime4up />} />
            <Route path="/anime4up/anime/:a" element={<AnimeDetails />} />
            <Route path="/anime4up/search" element={<SearchPageA4U />} />
            <Route path="/anime4up/watch/:t" element={<WatchA4U />} />
            {/* old routes */}
            <Route path="/entries/:source" element={<EntryList />} />
            <Route
              path="/manga/title/:title/source/:source"
              element={<EntryDetails key={`${window.location.pathname}`} />}
            />
            <Route path="/:source/search" element={<Search />} />
            <Route
              path="/manga/:title/source/:source"
              element={<EntryDetails />}
            />
            <Route
              path="/manga/:mangaTitle/chapter/:chapterPath/source/:source"
              element={<Reader />}
            />
          </Routes>
        </div>
        <SideBar />
      </div>
    </Router>
  );
}
