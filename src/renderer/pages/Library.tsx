/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';

interface SeriesItem {
  title: string;
  posterURL: string;
  path: string;
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
  const contextMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storageKey = 'all series';
    try {
      const items = JSON.parse(localStorage.getItem(storageKey) || '[]');
      setSeries(Array.isArray(items) ? items : []);
    } catch {
      setSeries([]);
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

  if (series.length === 0) {
    return (
      <div className="font-cairo text-center py-20">
        <p className="text-gray-400 text-lg">لا توجد سلاسل في المكتبة بعد.</p>
      </div>
    );
  }

  return (
    <div className="font-cairo container mx-auto px-6 py-8" dir="rtl">
      <h2 className="text-2xl font-bold mb-6">مكتبتي</h2>
      <div className="grid  md:grid-cols-4 lg:grid-cols-5 gap-6">
        {series.map((item, index) => (
          <div
            key={item.title}
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
            transform: 'translate(-50%, -50%)',
          }}
        >
          <ul className="py-1">
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
    </div>
  );
}
