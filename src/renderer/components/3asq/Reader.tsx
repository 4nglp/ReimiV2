import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Chapter } from '../../types'; // Adjust the import path if needed
import { getChapter } from '../../ext/3asq'; // Adjust the import path if needed

function Reader(): React.JSX.Element {
  const { chapterPath } = useParams<{ chapterPath: string }>(); // Extract chapterPath from the URL
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0); // Track the current page
  const [zoomLevel, setZoomLevel] = useState<number>(1); // Track the zoom level
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Preload next and previous images
  const preloadImages = useCallback(
    (pages: string[], currentPageIndex: number) => {
      const preloadPage = (index: number) => {
        if (index >= 0 && index < pages.length) {
          const img = new Image();
          img.src = pages[index]; // Load image in the background
        }
      };
      preloadPage(currentPageIndex + 1); // Preload next page
      preloadPage(currentPageIndex - 1); // Preload previous page
    },
    [],
  );

  // Zoom functionality on scroll
  const handleWheel = useCallback((event: WheelEvent) => {
    event.preventDefault(); // Disable vertical scrolling with the mouse wheel

    // Zoom in (scroll up) or zoom out (scroll down)
    if (event.deltaY < 0) {
      setZoomLevel((prev) => Math.min(prev + 0.05, 3)); // Zoom in slower (max zoom level of 3x)
    } else {
      setZoomLevel((prev) => Math.max(prev - 0.05, 0.5)); // Zoom out slower (min zoom level of 0.5x)
    }
  }, []);

  // Scroll down/up with 'd' or 'right arrow' and 'a' or 'left arrow'
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        navigate(-1); // Go back to the previous page
      } else if (event.key === 'd' || event.key === 'ArrowRight') {
        if (zoomLevel === 1) {
          setCurrentPage((prev) => {
            const nextPage = Math.min(
              prev + 1,
              (chapter?.pages.length ?? 1) - 1,
            );
            window.scrollTo(0, 0); // Scroll to the top when switching pages
            return nextPage;
          });
        } else {
          // Zoomed in, scroll down
          window.scrollBy({
            top: window.innerHeight * 0.2,
            behavior: 'smooth',
          });
        }
      } else if (event.key === 'a' || event.key === 'ArrowLeft') {
        const { scrollTop } = document.documentElement;

        if (scrollTop === 0) {
          // If at the top of the page, switch to the previous page
          setCurrentPage((prev) => Math.max(prev - 1, 0));
          window.scrollTo(0, 0); // Scroll to the top when switching pages
        } else {
          // Zoomed in, scroll up
          window.scrollBy({
            top: -window.innerHeight * 0.2,
            behavior: 'smooth',
          });
        }
      }
    },
    [zoomLevel, chapter, navigate],
  );

  // Automatically move to the next page if scrolled to the bottom
  const handleScroll = useCallback(() => {
    if (chapter) {
      const { scrollHeight, scrollTop, clientHeight } =
        document.documentElement;
      const scrollPosition = scrollTop + clientHeight;

      if (scrollPosition >= scrollHeight) {
        setCurrentPage((prev) => Math.min(prev + 1, chapter.pages.length - 1));
        window.scrollTo(0, 0); // Scroll to the top when moving to the next page
      }
    }
  }, [chapter]);

  useEffect(() => {
    if (window.electron) {
      window.electron.ipcRenderer.invoke('set-full-screen');
    }

    return () => {
      if (window.electron) {
        window.electron.ipcRenderer.invoke('exit-full-screen');
      }
    };
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('wheel', handleWheel, { passive: false }); // Disable default scroll behavior
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleKeyDown, handleScroll, handleWheel]);

  useEffect(() => {
    const fetchChapter = async () => {
      if (!chapterPath) {
        setError('Chapter path not found');
        setLoading(false);
        return;
      }

      try {
        const chapterContent = await getChapter(chapterPath);
        if (
          !chapterContent.title ||
          !chapterContent.pages ||
          chapterContent.pages.length === 0
        ) {
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
        console.error('Error fetching chapter:', err);
        setError('Failed to fetch chapter content');
        setLoading(false);
      }
    };

    fetchChapter();
  }, [chapterPath]);

  useEffect(() => {
    if (chapter) {
      preloadImages(chapter.pages, currentPage);
    }
  }, [currentPage, chapter, preloadImages]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!chapter) {
    return <p>No chapter content available</p>;
  }

  const { pages = [], title = 'Untitled Chapter' } = chapter;

  return (
    <div className="flex justify-center items-center flex-col relative">
      {/* Display chapter pages */}
      {pages.length > 0 && (
        <img
          src={pages[currentPage]} // Use the currentPage directly (no title page)
          alt={`Page ${currentPage + 1} of ${title}`}
          loading="lazy"
          className="chapter-page"
          style={{
            transform: `scale(${zoomLevel})`,
          }}
        />
      )}

      {/* Page Counter */}
      <div
        className="page-counter"
        style={{ position: 'absolute', bottom: 20, left: 20 }}
      >
        <p>{`Page ${currentPage + 1} of ${pages.length}`}</p>
      </div>
    </div>
  );
}

export default Reader;
