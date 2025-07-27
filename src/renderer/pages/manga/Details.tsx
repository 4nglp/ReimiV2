import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import {
  LuArrowDownUp,
  LuSettings,
  LuDownload,
  LuTrash2,
  LuX,
} from 'react-icons/lu';
import { getDetails3asq, getChapter as getChapter3asq } from '../../ext/3asq';
import {
  getDetailsDespair,
  getChapter as getChapterDespair,
} from '../../ext/despair-manga';
import {
  getDetailsComick,
  getChapterContent as getChapterComick,
} from '../../ext/comick';
import { mangaDetails, Chapter } from '../../types';
import SearchBar from '../../components/manga/SearchBar';

interface ComickDetailsResponse {
  comic: {
    title: string;
    desc?: string;
    md_covers?: { b2key: string }[];
    md_comic_md_genres?: { md_genres: { name: string } }[];
    authors?: { name: string }[];
    year?: number;
  };
}

function convertComickToMangaDetails(
  raw: ComickDetailsResponse,
  chapters: any[],
): mangaDetails {
  const { comic } = raw;

  const seenTitles = new Set<string>();
  const uniqueChapters = chapters.filter((c) => {
    const chapterTitle = `Chapter ${c.chap ?? '?'}`;
    if (seenTitles.has(chapterTitle)) return false;
    seenTitles.add(chapterTitle);
    return true;
  });

  return {
    title: comic.title,
    description: comic.desc || 'No description available',
    posterURL: comic.md_covers?.[0]
      ? `https://meo.comick.pictures/${comic.md_covers[0].b2key}`
      : '',
    genres: comic.md_comic_md_genres?.map((g) => g.md_genres.name) || [],
    author: comic.authors?.map((a) => a.name).join(', '),
    pubYear: comic.year?.toString(),
    chapters: uniqueChapters.map((c) => ({
      title: `Chapter ${c.chap ?? '?'}`,
      path: c.hid,
    })) as Chapter[],
  };
}

function Details(): React.JSX.Element {
  const { m, s } = useParams<{ m: string; s: string }>();
  const location = useLocation();
  const [entryDetails, setEntryDetails] = useState<mangaDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reverseOrder, setReverseOrder] = useState<boolean>(false);
  const [added, setAdded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadRange, setDownloadRange] = useState({ from: 1, to: 1 });
  const [downloadOption, setDownloadOption] = useState<
    'all' | 'next' | 'range'
  >('all');
  const [nextChaptersCount, setNextChaptersCount] = useState(5);

  const isComick = s === 'comick';
  const contentDirection = isComick ? 'ltr' : 'rtl';

  useEffect(() => {
    const fetchDetails = async () => {
      if (!m || !s) {
        setError('Missing title or source');
        setLoading(false);
        return;
      }

      try {
        let details: mangaDetails | null = null;

        if (s === 'comick') {
          const res = await getDetailsComick(m);
          if (res) {
            const { details: rawDetails, chapters } = res;
            details = convertComickToMangaDetails(
              rawDetails as ComickDetailsResponse,
              chapters,
            );
          }
        } else if (s === '3asq') {
          details = await getDetails3asq(m);
        } else if (s === 'despair') {
          details = await getDetailsDespair(m);
        } else {
          setError('Unsupported source');
          setLoading(false);
          return;
        }

        if (details) {
          setEntryDetails(details);

          const storageKey = 'all series';
          const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
          const alreadyExists = existing.some(
            (item: any) => item.title === details.title,
          );
          setAdded(alreadyExists);
        } else {
          setError('No details found');
        }
      } catch (err) {
        console.error(err);
        setError('Error fetching details');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [m, s]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setReverseOrder(params.get('reverse') === 'true');
  }, [location.search]);

  const addToLibrary = () => {
    if (!entryDetails) return;
    const storageKey = 'all series';
    try {
      const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const alreadyExists = existing.some(
        (item: any) => item.title === entryDetails.title,
      );
      if (!alreadyExists) {
        const updated = [
          ...existing,
          {
            title: entryDetails.title,
            posterURL: entryDetails.posterURL,
            path: `/${s}/manga/${m}`,
          },
        ];
        localStorage.setItem(storageKey, JSON.stringify(updated));
        setAdded(true);
      }
    } catch (e) {
      console.error('Failed to add to library', e);
    }
  };

  const removeFromLibrary = () => {
    if (!entryDetails) return;
    const storageKey = 'all series';
    try {
      const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const filtered = existing.filter(
        (item: any) => item.title !== entryDetails.title,
      );
      localStorage.setItem(storageKey, JSON.stringify(filtered));
      setAdded(false);
      setShowSettings(false);
    } catch (e) {
      console.error('Failed to remove from library', e);
    }
  };

  const handleBulkDownload = async () => {
    if (!entryDetails) return;

    let chaptersToDownload: Chapter[] = [];
    const chronologicalChapters = reverseOrder
      ? chapters
      : [...chapters].reverse();
    switch (downloadOption) {
      case 'all':
        chaptersToDownload = chronologicalChapters;
        break;
      case 'next':
        chaptersToDownload = chronologicalChapters.slice(0, nextChaptersCount);
        break;
      case 'range':
        const fromIndex = downloadRange.from - 1;
        const toIndex = downloadRange.to;
        chaptersToDownload = chronologicalChapters.slice(fromIndex, toIndex);
        break;
    }
    if (chaptersToDownload.length === 0) {
      console.warn('No chapters selected for download.');
      return;
    }
    setShowDownloadModal(false);
    console.log(
      `Starting bulk download of ${chaptersToDownload.length} chapters...`,
    );
    let totalSuccessful = 0;
    let totalFailed = 0;
    let totalPages = 0;
    for (const chapter of chaptersToDownload) {
      try {
        let chapterData;
        if (s === '3asq') {
          chapterData = await getChapter3asq(m!, chapter.path);
        } else if (s === 'despair') {
          chapterData = await getChapterDespair(chapter.path);
        } else if (s === 'comick') {
          chapterData = await getChapterComick(chapter.path);
        }
        if (chapterData && chapterData.pages?.length) {
          const result = await window.electronAPI.downloadChapter({
            mangaTitle: entryDetails.title,
            chapterTitle: chapterData.title || chapter.title,
            pages: chapterData.pages,
          });
          if (result.success) {
            totalSuccessful++;
            totalPages += result.totalPages;
            console.log(
              `✓ ${chapter.title}: ${result.successCount}/${result.totalPages} pages`,
            );
          } else {
            totalFailed++;
            console.error(`✗ ${chapter.title}: ${result.error}`);
          }
        } else {
          totalFailed++;
          console.warn(`✗ ${chapter.title}: No pages found`);
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (e) {
        totalFailed++;
        console.error(`✗ ${chapter.title}:`, e);
      }
    }
    console.log(
      `Bulk download completed: ${totalSuccessful}/${chaptersToDownload.length} chapters successful (${totalPages} total pages)`,
    );
  };

  if (loading) {
    return (
      <div className="font-cairo" dir="rtl">
        <div className="container mx-auto px-6">
          <div className="mt-6 mb-4" dir="ltr">
            <SearchBar />
          </div>
          <div className="flex flex-row gap-8 mt-6">
            <div className="w-1/4">
              <div className="mb-3">
                <div className="w-full aspect-[2/3] rounded-lg bg-gray-800 animate-pulse" />
              </div>
              <div className="bg-gray-800/80 rounded-lg p-4 mb-3">
                <div className="h-6 w-24 bg-gray-700 rounded animate-pulse mx-auto" />
              </div>
              <div className="bg-gray-800/80 rounded-lg p-4">
                <div className="h-[30px] bg-gray-700 rounded-lg animate-pulse" />
              </div>
            </div>
            <div className="md:w-3/4">
              <div className="flex mb-3 mt-3">
                <div className="container mx-auto">
                  <div className="h-10 w-3/4 bg-gray-800 rounded animate-pulse" />
                </div>
              </div>
              <div className="h-6 w-32 bg-gray-800 rounded animate-pulse mb-3" />
              <div className="bg-gray-800/80 rounded-lg p-6 mb-3">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-700 rounded w-full animate-pulse" />
                  <div className="h-4 bg-gray-700 rounded w-5/6 animate-pulse" />
                  <div className="h-4 bg-gray-700 rounded w-4/6 animate-pulse" />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-8 w-20 bg-gray-800 rounded-full animate-pulse"
                  />
                ))}
              </div>
              <div className="mt-6">
                <div className="h-6 w-32 bg-gray-800 rounded animate-pulse mb-3" />
                <div className="bg-gray-800/80 rounded-xl shadow-lg overflow-y-auto max-h-96">
                  <div className="divide-y divide-gray-700/50">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="h-5 w-3/4 bg-gray-700 rounded animate-pulse mb-2" />
                            <div className="h-6 w-8 bg-gray-700 rounded-full animate-pulse" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto h-screen flex items-center justify-center font-cairo">
        <div className="text-center p-8 bg-gray-800 rounded-xl max-w-lg">
          <h2 className="text-xl font-bold mb-2">حدث خطأ</h2>
          <p className="text-gray-400">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 px-4 py-2 bg-primary rounded-lg text-white hover:bg-primary/80 transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  if (!entryDetails) return <>a</>;

  const seenChapterTitles = new Set<string>();
  const filteredChapters = entryDetails.chapters.filter((chapter) => {
    if (seenChapterTitles.has(chapter.title)) return false;
    seenChapterTitles.add(chapter.title);
    return true;
  });

  const chapters = reverseOrder
    ? [...filteredChapters].reverse()
    : filteredChapters;

  const renderPosterSection = () => (
    <div className="w-1/4">
      <div className="mb-3">
        {entryDetails.posterURL && (
          <img
            src={entryDetails.posterURL}
            alt={`${entryDetails.title} Poster`}
            className="w-full rounded-lg shadow-md"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        )}
      </div>
      <div className="bg-gray-800/80 rounded-lg p-4 mb-3">
        <div className="text-center">
          <div className="flex items-center justify-center">
            <span className="text-white-400 text-md">
              {isComick ? 'Total Chapters: ' : 'مجموع الفصول: '}
              {filteredChapters.length}
            </span>
          </div>
        </div>
      </div>
      <div className="bg-gray-800/80 rounded-lg p-4">
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            type="button"
            onClick={addToLibrary}
            className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-white transition-all h-[30px] ${
              added
                ? 'cursor-not-allowed'
                : 'bg-primary hover:bg-primary/80 hover:scale-105'
            }`}
            disabled={added}
          >
            {added ? (
              <>
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>{isComick ? 'In Library' : 'مضاف للمكتبة'}</span>
              </>
            ) : (
              <>
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span>{isComick ? 'Add to Library' : 'اضف للمكتبة'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const renderDownloadModal = () => {
    if (!showDownloadModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div
          className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4"
          dir={contentDirection}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">
              {isComick ? 'Download Options' : 'خيارات التحميل'}
            </h3>
            <button
              onClick={() => setShowDownloadModal(false)}
              className="text-gray-400 hover:text-white"
            >
              <LuX className="text-xl" />
            </button>
          </div>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="downloadOption"
                value="all"
                checked={downloadOption === 'all'}
                onChange={(e) => setDownloadOption(e.target.value as 'all')}
                className="w-4 h-4"
              />
              <span>
                {isComick ? 'Download All Chapters' : 'تحميل جميع الفصول'} (
                {chapters.length})
              </span>
            </label>
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="downloadOption"
                  value="next"
                  checked={downloadOption === 'next'}
                  onChange={(e) => setDownloadOption(e.target.value as 'next')}
                  className="w-4 h-4"
                />
                <span>{isComick ? 'Download Next' : 'تحميل التالي'}</span>
              </label>
              {downloadOption === 'next' && (
                <div className="mt-2 ml-7">
                  <input
                    type="number"
                    min="1"
                    max={chapters.length}
                    value={nextChaptersCount}
                    onChange={(e) =>
                      setNextChaptersCount(parseInt(e.target.value) || 1)
                    }
                    className="w-20 px-2 py-1 bg-gray-700 rounded border border-gray-600"
                  />
                  <span className="ml-2">{isComick ? 'chapters' : 'فصل'}</span>
                </div>
              )}
            </div>
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="downloadOption"
                  value="range"
                  checked={downloadOption === 'range'}
                  onChange={(e) => setDownloadOption(e.target.value as 'range')}
                  className="w-4 h-4"
                />
                <span>{isComick ? 'Download Range' : 'تحميل نطاق محدد'}</span>
              </label>
              {downloadOption === 'range' && (
                <div className="mt-2 ml-7 flex items-center gap-2">
                  <span>{isComick ? 'From' : 'من'}:</span>
                  <input
                    type="number"
                    min="1"
                    max={chapters.length}
                    value={downloadRange.from}
                    onChange={(e) =>
                      setDownloadRange((prev) => ({
                        ...prev,
                        from: parseInt(e.target.value) || 1,
                      }))
                    }
                    className="w-16 px-2 py-1 bg-gray-700 rounded border border-gray-600"
                  />
                  <span>{isComick ? 'To' : 'إلى'}:</span>
                  <input
                    type="number"
                    min={downloadRange.from}
                    max={chapters.length}
                    value={downloadRange.to}
                    onChange={(e) =>
                      setDownloadRange((prev) => ({
                        ...prev,
                        to: parseInt(e.target.value) || prev.from,
                      }))
                    }
                    className="w-16 px-2 py-1 bg-gray-700 rounded border border-gray-600"
                  />
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleBulkDownload}
              className="flex-1 bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/80 transition-colors"
            >
              {isComick ? 'Start Download' : 'بدء التحميل'}
            </button>
            <button
              onClick={() => setShowDownloadModal(false)}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              {isComick ? 'Cancel' : 'إلغاء'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderDetailsSection = () => (
    <div className="md:w-3/4" dir={contentDirection}>
      <div className="flex mb-3 mt-3 justify-between items-center">
        <h2 className="text-4xl">{entryDetails.title}</h2>
        <div className="relative settings-dropdown">
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <LuSettings className="text-lg" />
            <span>{isComick ? 'Settings' : 'الاعدادات'}</span>
          </button>

          {showSettings && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-10">
              <div className="py-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowDownloadModal(true);
                    setShowSettings(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-2 hover:bg-gray-700 transition-colors"
                >
                  <LuDownload className="text-lg" />
                  <span>{isComick ? 'Bulk Download' : 'تحميل مجمع'}</span>
                </button>

                {added && (
                  <button
                    type="button"
                    onClick={removeFromLibrary}
                    className="flex items-center gap-3 w-full px-4 py-2 hover:bg-gray-700 transition-colors text-red-400"
                  >
                    <LuTrash2 className="text-lg" />
                    <span>
                      {isComick ? 'Remove from Library' : 'حذف من المكتبة'}
                    </span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <h2
        className="text-xl font-bold border-s-4 border-primary rounded-sm ps-3 mb-3"
        style={{
          wordBreak: 'break-word',
          ...(isComick
            ? {
                borderLeftWidth: '4px',
                paddingLeft: '0.75rem',
                borderRightWidth: '0',
                paddingRight: '0',
              }
            : {
                borderRightWidth: '4px',
                paddingRight: '0.75rem',
                borderLeftWidth: '0',
                paddingLeft: '0',
              }),
        }}
      >
        {entryDetails.description ||
          (isComick ? 'No description available' : 'لا وصف متوفر')}
      </h2>
      {entryDetails.author && (
        <p className="text-gray-300 leading-relaxed mt-2">
          <strong>{isComick ? 'Author: ' : 'الكاتب: '}</strong>
          {entryDetails.author}
        </p>
      )}
      {entryDetails.pubYear && (
        <p className="text-gray-300 leading-relaxed mt-2">
          <strong>{isComick ? 'Year: ' : 'سنة النشر: '}</strong>
          {entryDetails.pubYear}
        </p>
      )}
      <div
        className="flex flex-wrap gap-2 mt-4"
        style={{ justifyContent: isComick ? 'flex-start' : 'flex-start' }}
      >
        {entryDetails.genres.map((genre) => (
          <span
            key={genre}
            className="px-4 py-2 bg-gray-700 rounded-full text-sm font-medium hover:bg-gray-600 transition-colors"
          >
            {genre}
          </span>
        ))}
      </div>
      <div className="mt-6">
        <div className="flex items-center mb-3">
          <h2
            className="text-xl font-bold border-s-4 border-primary rounded-sm ps-3 flex-grow"
            style={{
              ...(isComick
                ? {
                    borderLeftWidth: '4px',
                    paddingLeft: '0.75rem',
                    borderRightWidth: '0',
                    paddingRight: '0',
                  }
                : {
                    borderRightWidth: '4px',
                    paddingRight: '0.75rem',
                    borderLeftWidth: '0',
                    paddingLeft: '0',
                  }),
            }}
          >
            {isComick ? 'Chapters List' : 'قائمة الفصول'}
          </h2>
          <Link
            to={{
              pathname: location.pathname,
              search: `?reverse=${!reverseOrder}`,
            }}
            className="p-2"
          >
            <LuArrowDownUp className="text-xl hover:text-primary transition-colors" />
          </Link>
        </div>
        {chapters.length > 0 ? (
          <div className="bg-gray-800/80 rounded-xl shadow-lg overflow-y-auto max-h-96">
            <div className="divide-y divide-gray-700/50">
              {chapters.map((chapter: Chapter) => (
                <div
                  key={chapter.path}
                  className="flex justify-between items-center p-4 hover:bg-gray-700 transition-all"
                >
                  <Link
                    to={`/${s}/read/${m}/${chapter.path}`}
                    className="text-lg"
                  >
                    {chapter.title}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center bg-gray-800/80 rounded-xl">
            <h3 className="text-xl font-medium text-gray-400 mb-2">
              {isComick ? 'No chapters available' : 'لا توجد فصول متاحة'}
            </h3>
            <p className="text-gray-500">
              {isComick
                ? 'Chapters will be added soon'
                : 'سيتم إضافة الفصول قريباً'}
            </p>
          </div>
        )}
      </div>
      <div className="mb-10" />
    </div>
  );

  return (
    <div className="font-cairo" dir={contentDirection}>
      <div className="container mx-auto px-6">
        <div className="mt-6 mb-4" dir="ltr">
          <SearchBar />
        </div>

        <div
          className={`flex gap-8 mt-6 ${!isComick ? 'flex-row-reverse' : ''}`}
          dir="ltr"
          style={{ minHeight: '600px' }}
        >
          {renderPosterSection()}
          {renderDetailsSection()}
        </div>
      </div>
      {renderDownloadModal()}
    </div>
  );
}

export default Details;
