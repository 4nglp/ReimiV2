import {
  MemoryRouter as Router,
  Routes,
  Route,
  useNavigate,
} from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import './App.css';
import 'tailwindcss/tailwind.css';

import Library from './pages/Library';
import Watch from './pages/animerco/Watch';
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
import Testing from './pages/Testing';
import Anime4up from './pages/anime4up/Home';
import AnimeDetails from './pages/anime4up/AnimeDetails';
import SearchPageA4U from './pages/anime4up/SearchResults';
import WatchA4U from './pages/anime4up/Watch';
import SearchPageManga from './pages/manga/Search';

function AppRoutes() {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen relative">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="absolute top-4 right-60 z-50 p-2 bg-gray-800 hover:bg-gray-700 rounded-full mt-[10px] mr-[45px]"
        aria-label="Back"
      >
        <FiArrowRight className="text-white text-xl" />
      </button>
      <div className="flex-1 overflow-auto h-full overflow-x-hidden">
        <Routes>
          {/* App */}
          <Route path="/" element={<Library />} />
          <Route path="/category/:categoryName" element={<CategoryView />} />
          <Route path="/downloads" element={<Downloads />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/testing" element={<Testing />} />
          {/* Animerco */}
          <Route path="/animerco" element={<AnimeRco />} />
          <Route path="/animerco/search" element={<SearchPage />} />
          <Route path="/animerco/episodes/:t" element={<Watch />} />
          <Route path="/animerco/movies/:a" element={<Movies />} />
          <Route path="/animerco/animes/:a" element={<Animes />} />
          <Route path="/animerco/seasons/:s" element={<Seasons />} />
          <Route path="/es/:t" element={<Mp4 />} />
          {/* Manga */}
          <Route path="/:s" element={<Home />} />
          <Route path="/:s/manga/:m/" element={<Details />} />
          <Route path="/:s/read/:m/:n" element={<Read />} />
          <Route path="/:s/search/" element={<SearchPageManga />} />
          {/* Anime4up */}
          <Route path="/anime4up" element={<Anime4up />} />
          <Route path="/anime4up/anime/:a" element={<AnimeDetails />} />
          <Route path="/anime4up/search" element={<SearchPageA4U />} />
          <Route path="/anime4up/watch/:t" element={<WatchA4U />} />
        </Routes>
      </div>
      <SideBar />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}
