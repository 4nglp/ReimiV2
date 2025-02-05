/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable react/jsx-no-constructed-context-values */
import { Link, useNavigate } from 'react-router-dom';
import './Sidebar.css';
import * as FaIcons from 'react-icons/fa';
import * as AiIcons from 'react-icons/ai';
import { useState, useEffect } from 'react';
import { IconContext } from 'react-icons';
import SidebarData from './SidebarData';

export default function SideBar() {
  const [sidebar, setSidebar] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (event: any) => {
      if (event.key === 'Escape') {
        navigate(-1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate]);

  const showSidebar = () => {
    setSidebar(!sidebar);
  };

  return (
    <IconContext.Provider value={{ color: '#fff' }}>
      <div className="sidebar">
        <div className="menu-bars">
          <FaIcons.FaBars onClick={showSidebar} />
        </div>
        <nav className={sidebar ? 'nav-menu active' : 'nav-menu'}>
          <ul className="nav-menu-items" onClick={showSidebar}>
            <li className="navbar-toggle">
              <div className="menu-bars">
                <AiIcons.AiOutlineClose />
              </div>
            </li>
            {SidebarData.map((i) => {
              return (
                <li key={i.title} className={i.className}>
                  <Link to={i.path}>
                    {i.icon}
                    <span>{i.title}</span>
                  </Link>
                </li>
              );
            })}
            <li className="nav-text">
              <Link to="/entries/3asq">
                <span>3asq</span>
              </Link>
            </li>
            <li className="nav-text">
              <Link to="/entries/lekmanga">
                <span>LekManga</span>
              </Link>
              <li className="nav-text">
                <Link to="/entries/anime3rb">
                  <span>Anime3rb</span>
                </Link>
              </li>
            </li>
          </ul>
        </nav>
      </div>
    </IconContext.Provider>
  );
}
