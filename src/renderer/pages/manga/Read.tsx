import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Chapter } from '../../ext/lekmanga/types';
import { getChapter as getChapter3asq } from '../../ext/3asq';
import { getChapter as getChapterDespair } from '../../ext/despair-manga';
import { getChapterContent } from '../../ext/comick';

import { ElectronHandler } from '../../../main/preload';
declare global {
  interface Window {
    electron: ElectronHandler;
  }
}

function Container({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.onfullscreenchange = () => {
      if (!document.fullscreenElement) {
        navigate(-1);
      }
    };
    if (containerRef.current && !document.fullscreenElement) {
      containerRef.current.requestFullscreen();
    }
  }, [navigate]);

  return (
    <div
      ref={containerRef}
      className="h-screen w-full bg-black flex justify-center items-center overflow-hidden"
    >
      {children}
    </div>
  );
}

interface LocationStateData {
  mangaTitle: string;
  mangaPosterURL?: string;
}

function Read(): React.JSX.Element {
  const { s, m, n } = useParams();
  const location = useLocation();
  const { data } = (location.state || {}) as { data?: LocationStateData };
  const { chapterTitle } = (location.state || {}) as {
    chapterTitle?: LocationStateData;
  };

  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [scrollOffset, setScrollOffset] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const contentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleZoom = useCallback(
    (event: WheelEvent) => {
      if (currentPage === 0) return;
      event.preventDefault();
      const contentHeight = contentRef.current?.scrollHeight || 0;
      const viewportHeight = window.innerHeight;

      let newZoom = zoomLevel + (event.deltaY < 0 ? 0.1 : -0.1);
      newZoom = Math.max(1, Math.min(newZoom, 3));

      if (newZoom <= 1) setScrollOffset(0);

      setZoomLevel(newZoom);

      if (contentHeight * newZoom < viewportHeight) {
        setScrollOffset(0);
      }
      if (event.deltaY > 0 && newZoom > 1) {
        setScrollOffset((prev) => Math.max(prev - viewportHeight * 0.1, 0));
      }
    },
    [zoomLevel, currentPage],
  );

  const handleKeyNavigation = useCallback(
    (event: KeyboardEvent) => {
      if (!chapter || !contentRef.current) return;

      const contentHeight = contentRef.current.scrollHeight * zoomLevel;
      const viewportHeight = window.innerHeight;
      if (event.key === 'Escape') {
        navigate(-1);
      }
      if (
        event.key === 'd' ||
        event.key === 'ArrowRight' ||
        event.key === 'D' ||
        event.key === 'ي'
      ) {
        if (currentPage < chapter.pages.length - 1) {
          setScrollOffset(0);
          setZoomLevel(zoomLevel);
          setCurrentPage((prev) => prev + 1);
        }
      } else if (
        event.key === 'a' ||
        event.key === 'ArrowLeft' ||
        event.key === 'A' ||
        event.key === 'ش'
      ) {
        if (currentPage > 0) {
          setScrollOffset(0);
          setZoomLevel(zoomLevel);
          setCurrentPage((prev) => prev - 1);
        }
      } else if (event.key === 's' || event.key === 'S' || event.key === 'س') {
        if (scrollOffset + viewportHeight < contentHeight) {
          setScrollOffset((prev) =>
            Math.min(
              prev + viewportHeight * 0.1,
              contentHeight - viewportHeight,
            ),
          );
        } else if (currentPage < chapter.pages.length - 1) {
          setScrollOffset(0);
          setCurrentPage((prev) => prev + 1);
        }
      } else if (event.key === 'w' || event.key === 'W' || event.key === 'ص') {
        if (scrollOffset > 0) {
          setScrollOffset((prev) => Math.max(prev - viewportHeight * 0.1, 0));
        } else if (currentPage > 0) {
          setScrollOffset(0);
          setCurrentPage((prev) => prev - 1);
        }
      }
    },
    [chapter, currentPage, scrollOffset, zoomLevel, navigate],
  );

  useEffect(() => {
    const fetchChapter = async () => {
      if (!m || !n || !s) {
        setError('Missing route parameters');
        setLoading(false);
        return;
      }

      try {
        let chapterContent: Chapter | null = null;

        if (s === 'comick') {
          chapterContent = await getChapterContent(n);
        } else if (s === '3asq') {
          chapterContent = await getChapter3asq(m, n);
        } else if (s === 'despair') {
          chapterContent = await getChapterDespair(n);
        } else {
          throw new Error('Unsupported source');
        }

        if (!chapterContent || !chapterContent.pages?.length) {
          setError('No chapter content available');
          setLoading(false);
          return;
        }

        setChapter({
          title: chapterContent.title || 'Untitled Chapter',
          path: chapterContent.path,
          pages: chapterContent.pages,
        });
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch chapter:', err);
        setError('Failed to fetch chapter content');
        setLoading(false);
      }
    };

    fetchChapter();
  }, [m, n, s]);

  useEffect(() => {
    const { discord } = window.electron;

    if (!discord) {
      console.warn('Electron API for Discord activity not available.');
      return;
    }

    if (chapter && data && chapterTitle) {
      const mangaTitleForRPC = data.mangaTitle || 'Untitled Manga';
      const chapterTitleForRPC = chapterTitle || 'Untitled Chapter';
      const mangaPosterURLForRPC = data.mangaPosterURL;

      discord.setReading({
        title: mangaTitleForRPC,
        chapter: chapterTitleForRPC,
        posterURL: mangaPosterURLForRPC,
      });
      console.log(
        `[Reader] Discord activity updated: Reading ${mangaTitleForRPC}, Chapter ${chapterTitleForRPC}`,
      );
    } else if (!chapter && data) {
      discord.setReading({
        title: data.mangaTitle || 'Loading Manga',
        chapter: 'Loading Chapter...',
        posterURL: data.mangaPosterURL,
      });
      console.log(
        `[Reader] Discord activity: Loading chapter for ${data.mangaTitle}`,
      );
    }
    return () => {
      if (discord) {
        discord.clear();
        console.log('[Reader] Discord activity cleared on component unmount.');
      }
    };
  }, [chapter, data]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyNavigation);
    window.addEventListener('wheel', handleZoom, { passive: false });

    return () => {
      window.removeEventListener('keydown', handleKeyNavigation);
      window.removeEventListener('wheel', handleZoom);
    };
  }, [handleKeyNavigation, handleZoom]);

  if (loading) return <p>Loading...</p>;
  if (error)
    return (
      <div className="flex items-center justify-center h-64">
        <p className="font-cairo text-center text-2xl max-w-xl">
          Wait a lil more and the chapter will be released on Comick, therefore
          it will be available.
        </p>
      </div>
    );
  if (!chapter)
    return (
      <div className="flex items-center justify-center h-64">
        <p className="font-cairo text-center text-2xl max-w-xl">
          Wait a lil more and the chapter will be released on Comick, therefore
          it will be available. Yes.
        </p>
      </div>
    );

  const { pages, title } = chapter;

  return (
    <Container>
      <div
        ref={contentRef}
        className="flex justify-center items-center flex-col relative"
        style={{
          transform: `translateY(-${scrollOffset}px) scale(${zoomLevel})`,
          transformOrigin: 'top center',
          transition: 'transform 0.1s ease-out',
        }}
      >
        {currentPage === 0 && <h1 className="text-2xl font-cairo">{title}</h1>}
        {pages.map((page, index) => {
          const adjustedIndex = index + 1;
          return (
            <img
              key={page}
              src={page}
              alt={`Page ${adjustedIndex} of ${title}`}
              className={`max-w-full max-h-screen object-contain ${
                adjustedIndex === currentPage ? 'block' : 'hidden'
              }`}
            />
          );
        })}
      </div>
      {currentPage > 0 && (
        <div className="fixed bottom-2 left-2 bg-black/70 text-white px-3 py-1 rounded font-cairo">
          <p>{`${currentPage} / ${pages.length}`}</p>
        </div>
      )}
    </Container>
  );
}

export default Read;
