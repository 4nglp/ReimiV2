/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Modal, Checkbox } from 'antd';

interface SeriesItem {
  title: string;
  posterURL: string;
  path: string;
  categories?: string[];
}

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  itemIndex: number;
}

export default function Library() {
  const [series, setSeries] = useState<SeriesItem[]>([]);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    itemIndex: -1,
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storageKey = 'all series';
    try {
      const items = JSON.parse(localStorage.getItem(storageKey) || '[]');
      setSeries(Array.isArray(items) ? items : []);
    } catch {
      setSeries([]);
    }
    try {
      const savedCategories = JSON.parse(
        localStorage.getItem('categories') || '',
      );
      setCategories(Array.isArray(savedCategories) ? savedCategories : []);
    } catch {
      setCategories(['']);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(event.target as Node)
      ) {
        setContextMenu((prev) => ({ ...prev, visible: false }));
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleContextMenu = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      itemIndex: index,
    });
  };

  const handleDeleteSeries = () => {
    if (contextMenu.itemIndex >= 0) {
      const updatedSeries = [...series];
      updatedSeries.splice(contextMenu.itemIndex, 1);
      setSeries(updatedSeries);
      localStorage.setItem('all series', JSON.stringify(updatedSeries));
      setContextMenu((prev) => ({ ...prev, visible: false }));
    }
  };

  const handleManageCategories = () => {
    if (contextMenu.itemIndex >= 0) {
      const currentItem = series[contextMenu.itemIndex];
      setSelectedCategories(currentItem.categories || []);
      setIsCategoryModalOpen(true);
      setContextMenu((prev) => ({ ...prev, visible: false }));
    }
  };

  const handleCategoryModalCancel = () => {
    setIsCategoryModalOpen(false);
    setSelectedCategories([]);
  };

  const handleCategoryChange = (checkedValues: string[]) => {
    setSelectedCategories(checkedValues);
  };

  const handleSaveCategories = () => {
    if (contextMenu.itemIndex >= 0) {
      const updatedSeries = [...series];
      updatedSeries[contextMenu.itemIndex] = {
        ...updatedSeries[contextMenu.itemIndex],
        categories: selectedCategories,
      };

      setSeries(updatedSeries);
      localStorage.setItem('all series', JSON.stringify(updatedSeries));
      setIsCategoryModalOpen(false);
    }
  };

  if (series.length === 0) {
    return (
      <div className="font-cairo text-center py-20">
        <p className="text-gray-400 text-lg">لا توجد سلاسل في المكتبة بعد.</p>
      </div>
    );
  }

  return (
    <div className="font-cairo container mx-auto px-6 py-8" dir="rtl">
      <h2 className="text-2xl font-bold mb-6">المكتبة</h2>
      <div className="grid md:grid-cols-5 lg:grid-cols-6 gap-6">
        {series.map((item, index) => (
          <div
            key={`${item.title}`}
            className="block h-full"
            onContextMenu={(e) => handleContextMenu(e, index)}
          >
            <Link
              to={`/animerco/seasons/${item.path}`}
              className="block h-full"
            >
              <div className="bg-gray-800/80 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col h-full transform hover:scale-105">
                <div className="relative pb-[140%] w-full">
                  <img
                    src={item.posterURL}
                    alt={`${item.title} Poster`}
                    className="absolute top-0 left-0 w-full h-full object-cover"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-4 flex-grow">
                  <h3
                    className="text-center text-sm font-medium text-white line-clamp-1"
                    dir="ltr"
                  >
                    {item.title}
                  </h3>
                  {item.categories && item.categories.length > 0 && (
                    <div className="mt-2 flex flex-wrap justify-center gap-1">
                      {item.categories.slice(0, 2).map((category) => (
                        <span
                          key={category}
                          className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded"
                        >
                          {category}
                        </span>
                      ))}
                      {item.categories.length > 2 && (
                        <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded">
                          +{item.categories.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
      {contextMenu.visible && (
        <div
          ref={contextMenuRef}
          className="fixed bg-gray-900 shadow-lg rounded-md border border-gray-700 z-50"
          style={{
            top: `${contextMenu.y}px`,
            left: `${contextMenu.x}px`,
          }}
        >
          <ul className="py-1">
            <li
              className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-white flex items-center"
              onClick={handleManageCategories}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 ml-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
              إدارة التصنيفات
            </li>
            <li
              className="px-4 py-2 hover:bg-red-600 cursor-pointer text-white flex items-center"
              onClick={handleDeleteSeries}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 ml-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              حذف
            </li>
          </ul>
        </div>
      )}
      <Modal
        title={<span className="font-cairo">إدارة التصنيفات</span>}
        open={isCategoryModalOpen}
        onCancel={handleCategoryModalCancel}
        okText="حفظ"
        cancelText="إلغاء"
        onOk={handleSaveCategories}
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
          اختر التصنيفات التي تريد إضافة هذه السلسلة إليها:
        </p>
        <div dir="rtl" className="max-h-64 overflow-y-auto pr-1">
          <Checkbox.Group
            className="flex flex-col gap-2"
            value={selectedCategories}
            onChange={handleCategoryChange}
          >
            {categories
              .filter((cat) => cat !== 'جميع السلاسل')
              .map((category) => (
                <Checkbox
                  key={category}
                  value={category}
                  className="text-white font-cairo checkmark-white"
                >
                  {category}
                </Checkbox>
              ))}
          </Checkbox.Group>
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
        .dark-modal .ant-modal-close-x {
          color: white !important;
        }
        .ant-checkbox-wrapper {
          color: white !important;
        }
        .ant-checkbox-inner {
          background-color: #1f1f1f !important;
          border-color: #434343 !important;
        }
        .ant-checkbox-checked .ant-checkbox-inner {
          background-color: #1890ff !important;
          border-color: #1890ff !important;
        }
      `}</style>
    </div>
  );
}
