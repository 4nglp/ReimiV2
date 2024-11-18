import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Library from './pages/library';
import EntryDetails from './components/EntryDetails';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Library />} />
        {/* <Route path="/pages/3asq" element={<Home />} /> */}
        <Route path="/entry/:title" element={<EntryDetails />} />
      </Routes>
    </Router>
  );
}
