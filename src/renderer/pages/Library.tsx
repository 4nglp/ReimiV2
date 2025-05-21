/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';

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

interface DeleteConfirmModalState {
  isOpen: boolean;
  itemIndex: number;
}

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
        <div className="flex items-center border-b border-gray-700 px-6 py-4">
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
          <div className="w-5"></div>
        </div>
        <div className="px-6 py-4">{children}</div>
        <div className="flex justify-end gap-4 border-t border-gray-700 px-6 py-4">
          <button
            onClick={onClose}
            className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-2 rounded font-cairo"
          >
            إلغاء
          </button>
          <button
            onClick={onSave}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded font-cairo"
          >
            حفظ
          </button>
        </div>
      </div>
    </div>
  );
};

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
  const [selectedEntryTitle, setSelectedEntryTitle] = useState<string>('');
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [isCategoryDeleteModalOpen, setIsCategoryDeleteModalOpen] =
    useState(false);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const [deleteConfirmModal, setDeleteConfirmModal] =
    useState<DeleteConfirmModalState>({
      isOpen: false,
      itemIndex: -1,
    });

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
      x: e.clientX - 150,
      y: e.clientY,
      itemIndex: index,
    });
  };

  const handleDeleteSeries = () => {
    setDeleteConfirmModal({
      isOpen: true,
      itemIndex: contextMenu.itemIndex,
    });
    setContextMenu((prev) => ({ ...prev, visible: false }));
  };

  const confirmDeleteSeries = () => {
    if (deleteConfirmModal.itemIndex >= 0) {
      const updatedSeries = [...series];
      updatedSeries.splice(deleteConfirmModal.itemIndex, 1);
      setSeries(updatedSeries);
      localStorage.setItem('all series', JSON.stringify(updatedSeries));
      setDeleteConfirmModal({ isOpen: false, itemIndex: -1 });
    }
  };

  const cancelDeleteSeries = () => {
    setDeleteConfirmModal({ isOpen: false, itemIndex: -1 });
  };

  const handleManageCategories = () => {
    if (contextMenu.itemIndex >= 0) {
      const currentItem = series[contextMenu.itemIndex];
      setSelectedCategories(currentItem.categories || []);
      setSelectedEntryTitle(currentItem.title);
      setIsCategoryModalOpen(true);
      setContextMenu((prev) => ({ ...prev, visible: false }));
    }
  };

  const handleCategoryModalCancel = () => {
    setIsCategoryModalOpen(false);
    setSelectedCategories([]);
    setSelectedEntryTitle('');
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(category)) {
        return prev.filter((cat) => cat !== category);
      } else {
        return [...prev, category];
      }
    });
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

  const handleDeleteCategory = (category: string) => {
    setCategoryToDelete(category);
    setIsCategoryDeleteModalOpen(true);
  };

  const confirmDeleteCategory = () => {
    if (categoryToDelete) {
      const updatedCategories = categories.filter(
        (cat) => cat !== categoryToDelete,
      );
      setCategories(updatedCategories);
      localStorage.setItem('categories', JSON.stringify(updatedCategories));
      const updatedSeries = series.map((item) => {
        if (item.categories && item.categories.includes(categoryToDelete)) {
          return {
            ...item,
            categories: item.categories.filter(
              (cat) => cat !== categoryToDelete,
            ),
          };
        }
        window.location.reload();
        return item;
      });

      setSeries(updatedSeries);
      localStorage.setItem('all series', JSON.stringify(updatedSeries));

      if (selectedCategories.includes(categoryToDelete)) {
        setSelectedCategories(
          selectedCategories.filter((cat) => cat !== categoryToDelete),
        );
      }

      setCategoryToDelete(null);
      setIsCategoryDeleteModalOpen(false);
    }
  };

  const cancelDeleteCategory = () => {
    setCategoryToDelete(null);
    setIsCategoryDeleteModalOpen(false);
  };

  const CustomCheckbox = ({
    checked,
    onChange,
    label,
  }: {
    checked: boolean;
    onChange: () => void;
    label: string;
  }) => {
    return (
      <label className="flex items-center cursor-pointer mb-2">
        <div className="relative">
          <input
            type="checkbox"
            className="sr-only"
            checked={checked}
            onChange={onChange}
          />
          <div
            className={`w-5 h-5 mr-2 border rounded ${checked ? 'bg-gray-500 border-gray-500' : 'border-gray-500 bg-gray-800'}`}
          >
            {checked && (
              <svg
                className="w-3 h-3 text-white absolute left-1 top-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            )}
          </div>
        </div>
        <span className="text-white mr-2">{label}</span>
      </label>
    );
  };

  const [confirmDeleteModal, setConfirmDeleteModal] = useState<{
    isOpen: boolean;
    category: string | null;
  }>({
    isOpen: false,
    category: null,
  });

  const openConfirmDeleteModal = (category: string) => {
    setConfirmDeleteModal({
      isOpen: true,
      category,
    });
  };

  const closeConfirmDeleteModal = () => {
    setConfirmDeleteModal({
      isOpen: false,
      category: null,
    });
  };

  const confirmDelete = () => {
    if (confirmDeleteModal.category) {
      handleDeleteCategory(confirmDeleteModal.category);
      closeConfirmDeleteModal();
      window.location.reload();
    }
  };

  const ConfirmDeleteModal = () => {
    if (!confirmDeleteModal.isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/65 flex items-center justify-center z-50">
        <div
          className="bg-[#1f1f1f] rounded-lg shadow-lg max-w-md w-full mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-6 py-4">
            <h3 className="text-lg font-medium text-white mb-4">تأكيد الحذف</h3>
            <p className="text-gray-300 mb-6">
              هل أنت متأكد من حذف تصنيف "{confirmDeleteModal.category}"؟ سيتم
              إزالته من جميع السلاسل.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeConfirmDeleteModal}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded font-cairo"
              >
                إلغاء
              </button>
              <button
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-cairo"
              >
                نعم، احذف
              </button>
            </div>
          </div>
        </div>
      </div>
    );
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

      <CustomModal
        isOpen={isCategoryModalOpen}
        onClose={handleCategoryModalCancel}
        onSave={handleSaveCategories}
        title="إدارة التصنيفات"
      >
        <div className="mb-4">
          <p className="text-white text-lg text-center" dir="ltr">
            {selectedEntryTitle}
          </p>
        </div>
        <p className="mb-4 font-cairo" dir="rtl">
          اختر التصنيفات التي تريد إضافة هذه السلسلة إليها:
        </p>
        <div dir="rtl" className="max-h-64 overflow-y-auto pr-1">
          {categories
            .filter((cat) => cat !== 'جميع السلاسل')
            .map((category) => (
              <div
                key={category}
                className="flex justify-between items-center mb-2"
              >
                <CustomCheckbox
                  checked={selectedCategories.includes(category)}
                  onChange={() => handleCategoryChange(category)}
                  label={category}
                />
                <button
                  onClick={() => handleDeleteCategory(category)}
                  className="text-red-500 hover:text-red-700 p-1"
                  title="حذف التصنيف"
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            ))}
        </div>
      </CustomModal>

      {deleteConfirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/65 flex items-center justify-center z-50">
          <div
            className="bg-[#1f1f1f] rounded-lg shadow-lg max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center border-b border-gray-700 px-6 py-4">
              <button
                onClick={cancelDeleteSeries}
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
                تأكيد الحذف
              </h3>
              <div className="w-5"></div>
            </div>
            <div className="px-6 py-4">
              <p className="text-gray-300 mb-6">
                هل أنت متأكد من حذف هذه السلسلة؟ لا يمكن التراجع عن هذا الإجراء.
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={cancelDeleteSeries}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-2 rounded font-cairo"
                >
                  إلغاء
                </button>
                <button
                  onClick={confirmDeleteSeries}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-2 rounded font-cairo"
                >
                  احذف
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isCategoryDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/65 flex items-center justify-center z-50">
          <div
            className="bg-[#1f1f1f] rounded-lg shadow-lg max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center border-b border-gray-700 px-6 py-4">
              <button
                onClick={cancelDeleteCategory}
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
                تأكيد حذف التصنيف
              </h3>
              <div className="w-5"></div>
            </div>
            <div className="px-6 py-4">
              <p className="text-gray-300 mb-6">
                هل أنت متأكد من حذف تصنيف "{categoryToDelete}"؟ سيتم إزالته من
                جميع السلاسل.
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={cancelDeleteCategory}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-2 rounded font-cairo"
                >
                  إلغاء
                </button>
                <button
                  onClick={confirmDeleteCategory}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-2 rounded font-cairo"
                >
                  احذف
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
