/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Modal, Input, Button } from 'antd';
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

  const handleCancel = () => {
    setIsModalOpen(false);
    setNewCategoryName('');
  };

  const handleSave = () => {
    if (newCategoryName.trim()) {
      const updatedCategories = [...categories, newCategoryName.trim()];
      setCategories(updatedCategories);
      localStorage.setItem('categories', JSON.stringify(updatedCategories));
      setNewCategoryName('');
      setIsModalOpen(false);
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
                <Link to="/entries/lekmanga">
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
      <div className="absolute bottom-4 w-full text-center text-gray-400 text-md">
        Beta Version
      </div>
      <Modal
        title={<span className="font-cairo">إنشاء تصنيف</span>}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel} className="font-cairo">
            إلغاء
          </Button>,
          <Button
            key="save"
            type="primary"
            onClick={handleSave}
            disabled={!newCategoryName.trim()}
            className="font-cairo"
          >
            حفظ
          </Button>,
        ]}
        className="dark-modal"
        styles={{
          header: {
            background: '#1f1f1f',
            color: 'white',
            borderBottom: '1px solid #303030',
          },
          body: {
            background: '#1f1f1f',
            color: 'white',
          },
          footer: {
            background: '#1f1f1f',
            borderTop: '1px solid #303030',
          },
          mask: {
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
          },
          content: {
            background: '#1f1f1f',
            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.5)',
          },
        }}
      >
        <p className="mb-4 font-cairo" dir="rtl">
          استخدم التصنيفات لتنظيم مكتبتك.
        </p>
        <p
          className="mb-4 text-sm bg-gray-800 p-2 rounded font-cairo"
          dir="rtl"
        >
          بعد إنشاء تصنيف، يمكنك إضافة محتوى إليه عن طريق النقر بزر الفأرة
          الأيمن على سلسلة في مكتبتك.
        </p>
        <div className="mb-4" dir="rtl">
          <label htmlFor="categoryName" className="block mb-2 font-cairo">
            الاسم
          </label>
          <Input
            id="categoryName"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            autoFocus
            className="bg-gray-700 border-gray-600 text-white"
          />
        </div>
      </Modal>

      <style>{`
        .dark-modal .ant-modal-content {
          background-color: #1f1f1f !important;
          color: white !important;
        }
        .dark-modal .ant-modal-header {
          background-color: #1f1f1f !important;
          border-bottom: 1px solid #303030 !important;
        }
        .dark-modal .ant-modal-title {
          color: white !important;
        }
        .dark-modal .ant-modal-footer {
          border-top: 1px solid #303030 !important;
        }
        .dark-modal .ant-btn-default {
          background-color: #141414 !important;
          border-color: #434343 !important;
          color: white !important;
        }
        .dark-modal .ant-input {
          background-color: #141414 !important;
          border-color: #434343 !important;
          color: white !important;
        }
        .dark-modal .ant-modal-close-x {
          color: white !important;
        }
      `}</style>
    </div>
  );
}
