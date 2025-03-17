import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function Sb() {
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
    <div className="w-[300px] h-screen sticky top-0 bg-[#1a1b1e] text-right font-cairo ml-auto">
      <h1 className="text-2xl text-white">ريمي</h1>
      <ul className="text-white">
        <Link to="/library">
          <li>المكتبة</li>
        </Link>
        <Link to="/downloads">
          <li>التحميلات</li>
        </Link>
      </ul>
      <h2 className="text-white">مانجا</h2>
      <ul className="text-white">
        <Link to="/entries/3asq">
          <li>العاشق</li>
        </Link>
        <Link to="/entries/lekmanga">
          <li>مانجا ليك</li>
        </Link>
      </ul>
      <h2 className="text-white">انمي</h2>
      <ul className="text-white">
        <Link to="/animerco">
          <li>انميركو</li>
        </Link>
      </ul>
    </div>
  );
}
