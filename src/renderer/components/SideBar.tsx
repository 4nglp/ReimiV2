/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { RiBookShelfLine } from 'react-icons/ri';
import { LuMonitorPlay } from 'react-icons/lu';
import { IoBookOutline } from 'react-icons/io5';
import {
  DownloadOutlined,
  PlusOutlined,
  SettingOutlined,
  CaretDownOutlined,
  CaretLeftOutlined,
} from '@ant-design/icons';

const CustomModal = ({
  isOpen,
  onClose,
  onSave,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  title: string;
  children: React.ReactNode;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/65 flex items-center justify-center z-50">
      <div
        className="bg-[#1f1f1f] rounded-lg shadow-lg max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end items-center border-b border-gray-700 px-6 py-4">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <h3 className="font-cairo text-white text-lg font-medium text-center flex-1">
            {title}
          </h3>
          <div className="w-5"></div>{' '}
          {/* Empty div for spacing in RTL layout */}
        </div>
        <div className="px-6 py-4">{children}</div>
        <div className="flex justify-start gap-4 border-t border-gray-700 px-6 py-4">
          <button
            onClick={onSave}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded font-cairo"
          >
            حفظ
          </button>
          <button
            onClick={onClose}
            className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-2 rounded font-cairo"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};

export default function SideBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isLibraryOpen, setIsLibraryOpen] = useState(true);
  const [isMangaOpen, setIsMangaOpen] = useState(false);
  const [isAnimeOpen, setIsAnimeOpen] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    try {
      const savedCategories = JSON.parse(
        localStorage.getItem('categories') || '',
      );
      setCategories(Array.isArray(savedCategories) ? savedCategories : ['']);
    } catch {
      setCategories([]);
    }
  }, []);
  useEffect(() => {
    const handleKeyDown = (event: { key: string }) => {
      if (event.key === 'Escape') {
        navigate(-1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate]);

  const isActive = (path: any) => {
    return location.pathname === path;
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (newCategoryName.trim()) {
      const updatedCategories = [...categories, newCategoryName.trim()];
      setCategories(updatedCategories);
      localStorage.setItem('categories', JSON.stringify(updatedCategories));
      setNewCategoryName('');
      setIsModalOpen(false);
      window.location.reload();
    }
  };

  return (
    <div className="w-64 h-screen sticky top-0 bg-[#1a1b1e] text-white font-cairo border-r border-gray-800 text-right">
      <h1 className="text-2xl text-white text-center my-4 font-bold font-cairo">
        Reimi
      </h1>
      <div className="px-4">
        <div className="mb-2">
          <div
            className={`flex items-center justify-between p-2 rounded cursor-pointer ${isActive('/') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
            onClick={() => setIsLibraryOpen(!isLibraryOpen)}
            dir="rtl"
          >
            <div className="flex items-center">
              <RiBookShelfLine className="ml-2" />
              <span className="font-cairo font-semibold">المكتبة</span>
              <div className="mr-[110px]">
                {isLibraryOpen ? <CaretDownOutlined /> : <CaretLeftOutlined />}
              </div>
            </div>
          </div>
          {isLibraryOpen && (
            <div className="mr-8 mt-1" dir="rtl">
              <Link to="/">
                <div
                  className={`p-1 rounded text-gray-300 hover:text-white hover:font-semibold mb-1 text-sm ${isActive('/') ? 'font-semibold text-white' : ''}`}
                >
                  جميع السلاسل
                </div>
              </Link>
              {categories.map((category) => (
                <Link key={category} to={`/category/${category}`}>
                  <div
                    className={`p-1 rounded text-gray-300 hover:text-white hover:font-semibold mb-1 text-sm ${isActive(`/category/${category}`) ? ' text-white font-semibold' : ''}`}
                  >
                    {category}
                  </div>
                </Link>
              ))}
              <div
                className="p-1 rounded text-gray-300 hover:text-white hover:font-semibold flex items-center cursor-pointer text-sm"
                onClick={showModal}
              >
                <PlusOutlined className="ml-1" />
                <span>تصنيف جديد...</span>
              </div>
            </div>
          )}
          <div className="mb-2">
            <div
              className="flex items-center justify-between p-2 rounded cursor-pointer hover:bg-gray-700"
              onClick={() => setIsMangaOpen(!isMangaOpen)}
              dir="rtl"
            >
              <div className="flex items-center">
                <IoBookOutline className="ml-2" />
                <span className="mr-1 font-semibold font-cairo">مانجا</span>
                <div className="mr-[120px]">
                  {isMangaOpen ? <CaretDownOutlined /> : <CaretLeftOutlined />}
                </div>
              </div>
            </div>
            {isMangaOpen && (
              <div className="mr-8 mt-1" dir="rtl">
                <Link to="/entries/3asq">
                  <div
                    className={`p-1 rounded text-gray-300 hover:text-white hover:font-semibold mb-1 text-sm ${isActive('/entries/3asq') ? 'text-white font-semibold' : ''}`}
                  >
                    العاشق
                  </div>
                </Link>
                <Link to="/lekmanga">
                  <div
                    className={`p-1 rounded text-gray-300 hover:text-white hover:font-semibold mb-1 text-sm ${isActive('/entries/lekmanga') ? 'text-white font-semibold' : ''}`}
                  >
                    ليك مانجا
                  </div>
                </Link>
              </div>
            )}
          </div>
          <div className="mb-2">
            <div
              className="flex items-center justify-between p-2 rounded cursor-pointer hover:bg-gray-700"
              onClick={() => setIsAnimeOpen(!isAnimeOpen)}
              dir="rtl"
            >
              <div className="flex items-center">
                <LuMonitorPlay className="ml-2" />
                <span className="mr-1 font-semibold font-cairo">أنمي</span>
                <div className="mr-[120px]">
                  {isAnimeOpen ? <CaretDownOutlined /> : <CaretLeftOutlined />}
                </div>
              </div>
            </div>
            {isAnimeOpen && (
              <div className="mr-8 mt-1" dir="rtl">
                <Link to="/animerco">
                  <div
                    className={`p-1 rounded text-gray-300 hover:text-white hover:font-semibold mb-1 text-sm ${isActive('/animerco') ? 'text-white font-semibold' : ''}`}
                  >
                    انميركو
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>
        <div
          className={`flex items-center p-2 rounded cursor-pointer mb-2 ${isActive('/downloads') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
          dir="rtl"
        >
          <DownloadOutlined className="ml-2" />
          <Link
            to="/downloads"
            className="text-white no-underline flex-grow font-cairo font-semibold"
          >
            التحميلات
          </Link>
        </div>
        <div
          className={`flex items-center p-2 rounded cursor-pointer mb-2 ${isActive('/settings') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
          dir="rtl"
        >
          <SettingOutlined className="ml-2" />
          <Link
            to="/settings"
            className="text-white no-underline flex-grow font-cairo font-semibold"
          >
            الإعدادات
          </Link>
        </div>
      </div>
      <CustomModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setNewCategoryName('');
        }}
        onSave={handleSave}
        title="إنشاء تصنيف"
      >
        <p className="mb-4 font-cairo" dir="rtl">
          استخدم التصنيفات لتنظيم مكتبتك.
        </p>
        <p
          className="mb-4 text-sm bg-gray-800 p-3 rounded font-cairo"
          dir="rtl"
        >
          بعد إنشاء تصنيف، يمكنك إضافة محتوى إليه عن طريق النقر بزر الفأرة
          الأيمن على سلسلة في مكتبتك.
        </p>
        <div className="mb-4" dir="rtl">
          <label htmlFor="categoryName" className="block mb-2 font-cairo">
            الاسم
          </label>
          <input
            id="categoryName"
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-3 py-2 focus:outline-none focus:border-blue-500"
            placeholder="أدخل اسم التصنيف"
            dir="rtl"
          />
        </div>
      </CustomModal>

      <div className="absolute bottom-4 w-full text-center text-gray-400 text-md">
        Beta Version
      </div>
    </div>
  );
}
