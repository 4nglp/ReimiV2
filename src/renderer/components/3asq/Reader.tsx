import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Chapter } from '../../types';
import { getChapter } from '../../ext/3asq';

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

function Reader(): React.JSX.Element {
  const { chapterPath } = useParams<{ chapterPath: string }>();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0); // Start with the title page
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [scrollOffset, setScrollOffset] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const contentRef = useRef<HTMLDivElement>(null);

  const handleZoom = useCallback(
    (event: WheelEvent) => {
      if (currentPage === 0) return; // No zoom on title page
      event.preventDefault();
      const contentHeight = contentRef.current?.scrollHeight || 0;
      const viewportHeight = window.innerHeight;

      // Zooming in
      let newZoom = zoomLevel + (event.deltaY < 0 ? 0.1 : -0.1);
      newZoom = Math.max(1, Math.min(newZoom, 3));

      if (newZoom <= 1) {
        setScrollOffset(0); // Reset to top when fully zoomed out
      }

      setZoomLevel(newZoom);

      if (contentHeight * newZoom < viewportHeight) {
        setScrollOffset(0); // Keep the top of the page visible
      }

      // Scroll when zoomed in (deltaY > 0)
      if (event.deltaY > 0 && newZoom > 1) {
        setScrollOffset(
          (prev) => Math.max(prev - viewportHeight * 0.1, 0), // Smooth scroll to top
        );
      }
    },
    [zoomLevel, currentPage],
  );

  const handleKeyNavigation = useCallback(
    (event: KeyboardEvent) => {
      if (!chapter || !contentRef.current) return;

      const contentHeight = contentRef.current.scrollHeight * zoomLevel;
      const viewportHeight = window.innerHeight;

      if (
        event.key === 'd' ||
        event.key === 'ArrowRight' ||
        event.key === 'D' ||
        event.key === 'ي'
      ) {
        // Navigate right on title page or regular pages
        if (currentPage < chapter.pages.length) {
          setScrollOffset(0);
          setZoomLevel(zoomLevel); // Keep the same zoom level when navigating
          setCurrentPage((prev) => Math.min(prev + 1, chapter.pages.length)); // Ensure we don't go past the last content page
        }
      } else if (
        event.key === 'a' ||
        event.key === 'ArrowLeft' ||
        event.key === 'A' ||
        event.key === 'ش'
      ) {
        // Navigate left on title page or regular pages
        if (currentPage > 0) {
          setScrollOffset(0);
          setZoomLevel(zoomLevel); // Keep the same zoom level when navigating
          setCurrentPage((prev) => Math.max(prev - 1, 0)); // Ensure we don't go before the title page
        }
      } else if (event.key === 's' || event.key === 'S' || event.key === 'س') {
        // Scroll down or go to next page
        if (scrollOffset + viewportHeight < contentHeight) {
          setScrollOffset((prev) =>
            Math.min(
              prev + viewportHeight * 0.1,
              contentHeight - viewportHeight,
            ),
          );
        } else if (currentPage < chapter.pages.length) {
          setScrollOffset(0);
          setCurrentPage((prev) => Math.min(prev + 1, chapter.pages.length));
        }
      } else if (event.key === 'w' || event.key === 'W' || event.key === 'ص') {
        // Scroll up or go to previous page
        if (scrollOffset > 0) {
          setScrollOffset((prev) => Math.max(prev - viewportHeight * 0.1, 0));
        } else if (currentPage > 0) {
          setScrollOffset(0);
          setCurrentPage((prev) => prev - 1);
        }
      }
    },
    [chapter, currentPage, scrollOffset, zoomLevel],
  );

  useEffect(() => {
    const fetchChapter = async () => {
      if (!chapterPath) {
        setError('Chapter path not found');
        setLoading(false);
        return;
      }

      try {
        const chapterContent = await getChapter(chapterPath);
        if (!chapterContent.pages || chapterContent.pages.length === 0) {
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
        setError('Failed to fetch chapter content');
        setLoading(false);
      }
    };

    fetchChapter();
  }, [chapterPath]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyNavigation);
    window.addEventListener('wheel', handleZoom, { passive: false });

    return () => {
      window.removeEventListener('keydown', handleKeyNavigation);
      window.removeEventListener('wheel', handleZoom);
    };
  }, [handleKeyNavigation, handleZoom]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!chapter) return <p>No chapter content available</p>;

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
        {currentPage === 0 && (
          <div className="flex justify-center items-center text-white text-4xl">
            <h1>{title}</h1>
          </div>
        )}
        {pages.map((page, index) => {
          const adjustedIndex = index + 1; // Skip the title page, so start at 1 for content pages
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
        <div className="fixed bottom-2 left-2 bg-black/70 text-white px-3 py-1 rounded">
          <p>{`${currentPage} / ${pages.length}`}</p> {/* Fixed page number */}
        </div>
      )}
    </Container>
  );
}

export default Reader;
