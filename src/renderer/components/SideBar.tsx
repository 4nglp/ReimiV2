import { Link, useNavigate } from 'react-router-dom';
import { Divider } from 'antd';
import { useEffect } from 'react';

export default function SideBar() {
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
  return (
    <div className="w-[250px] h-screen sticky top-0 bg-[#1a1b1e] text-right font-cairo ml-auto">
      <h1 className="text-2xl text-white text-center my-3">Reimi v0.0.1</h1>
      <ul>
        <Divider
          orientation="right"
          style={{ borderColor: 'white', color: 'white', fontSize: '20px' }}
          className="font-cairo"
          plain
        >
          <Link
            to="/"
            className="no-underline text-gray-200 hover:text-white hover:text-2xl focus:outline-white"
          >
            <li>المكتبة</li>
          </Link>
        </Divider>
        <Divider
          orientation="right"
          style={{
            borderColor: 'white',
            color: 'white',
            fontSize: '20px',
          }}
          className="font-cairo hover:text-gray-300"
          plain
        >
          <Link
            to="/downloads"
            className="no-underline text-gray-200 hover:text-white hover:text-2xl focus:outline-white"
          >
            <li>التحميلات</li>
          </Link>
        </Divider>

        <Divider
          orientation="right"
          style={{ borderColor: 'white', color: 'white', fontSize: '20px' }}
          className="font-cairo"
          plain
        >
          <span className=" text-gray-200 hover:text-white hover:text-2xl focus:outline-white">
            مانجا
          </span>
        </Divider>
      </ul>
      <ul className="text-white text-right mr-7">
        <Link to="/entries/3asq">
          <li className=" text-gray-200 hover:text-white hover:text-lg focus:outline-white">
            العاشق
          </li>
        </Link>
        <Link to="/entries/lekmanga">
          <li className=" text-gray-200 hover:text-white hover:text-lg focus:outline-white">
            ليك مانجا
          </li>
        </Link>
      </ul>
      <Divider
        orientation="right"
        style={{ borderColor: 'white', color: 'white', fontSize: '20px' }}
        className="font-cairo"
        plain
      >
        <span className=" text-gray-200 hover:text-white hover:text-2xl focus:outline-white">
          أنمي
        </span>
      </Divider>
      <ul className="text-white mr-7">
        <Link to="/animerco">
          <li className=" text-gray-200 hover:text-white hover:text-lg focus:outline-white">
            انميركو
          </li>
        </Link>
      </ul>
    </div>
  );
}
