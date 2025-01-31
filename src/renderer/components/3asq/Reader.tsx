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
  const [nextChapterPath, setNextChapterPath] = useState<string | null>(null);
  const [prevChapterPath, setPrevChapterPath] = useState<string | null>(null);

  const contentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleZoom = useCallback(
    (event: WheelEvent) => {
      if (currentPage === 0) return; // No zoom on title page
      event.preventDefault();
      const contentHeight = contentRef.current?.scrollHeight || 0;
      const viewportHeight = window.innerHeight;

      // Zooming in
      let newZoom = zoomLevel + (event.deltaY < 0 ? 0.1 : -0.1);
      newZoom = Math.max(1, Math.min(newZoom, 3));

      console.log(
        `Zoom level before: ${zoomLevel}, Zoom level after: ${newZoom}`,
      );

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

      console.log(
        `Handling key: ${event.key}, Current Page: ${currentPage}, Scroll Offset: ${scrollOffset}`,
      );

      if (
        event.key === 'd' ||
        event.key === 'ArrowRight' ||
        event.key === 'D' ||
        event.key === 'ي'
      ) {
        // Navigate right on title page or regular pages
        if (currentPage < chapter.pages.length - 1) {
          setScrollOffset(0);
          setZoomLevel(zoomLevel); // Keep the same zoom level when navigating
          setCurrentPage((prev) =>
            Math.min(prev + 1, chapter.pages.length - 1),
          ); // Ensure we don't go past the last content page
          console.log(`Moving to next page: ${currentPage + 1}`);
        } else if (nextChapterPath) {
          // Go to the next chapter if we're on the last page
          console.log(`Moving to next chapter: ${nextChapterPath}`);
          navigate(nextChapterPath);
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
          console.log(`Moving to previous page: ${currentPage - 1}`);
        } else if (prevChapterPath) {
          // Go to the previous chapter if we're on the first page
          console.log(`Moving to previous chapter: ${prevChapterPath}`);
          navigate(prevChapterPath);
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
        } else if (currentPage < chapter.pages.length - 1) {
          setScrollOffset(0);
          setCurrentPage((prev) =>
            Math.min(prev + 1, chapter.pages.length - 1),
          );
          console.log(`Moving to next page: ${currentPage + 1}`);
        } else if (nextChapterPath) {
          // Go to next chapter when we're on the last page
          console.log(`Moving to next chapter: ${nextChapterPath}`);
          navigate(nextChapterPath);
        }
      } else if (event.key === 'w' || event.key === 'W' || event.key === 'ص') {
        // Scroll up or go to previous page
        if (scrollOffset > 0) {
          setScrollOffset((prev) => Math.max(prev - viewportHeight * 0.1, 0));
          console.log(`Scrolling up: ${scrollOffset}`);
        } else if (currentPage > 0) {
          setScrollOffset(0);
          setCurrentPage((prev) => prev - 1);
          console.log(`Moving to previous page: ${currentPage - 1}`);
        } else if (prevChapterPath) {
          // Go to previous chapter when we're on the first page
          console.log(`Moving to previous chapter: ${prevChapterPath}`);
          navigate(prevChapterPath);
        }
      }
    },
    [
      chapter,
      currentPage,
      scrollOffset,
      zoomLevel,
      prevChapterPath,
      nextChapterPath,
      navigate,
    ],
  );

  useEffect(() => {
    const fetchChapter = async () => {
      console.log(`Fetching chapter for path: ${chapterPath}`);
      if (!chapterPath) {
        setError('Chapter path not found');
        setLoading(false);
        return;
      }

      try {
        const chapterContent = await getChapter(chapterPath, 'mangaTitle'); // Pass mangaTitle to the function
        if (!chapterContent.pages || chapterContent.pages.length === 0) {
          setError('No chapter content available');
          setLoading(false);
          return;
        }
        console.log('Chapter fetched successfully:', chapterContent);
        setChapter({
          title: chapterContent.title || 'Untitled Chapter',
          path: chapterContent.path,
          pages: chapterContent.pages,
        });

        setNextChapterPath(chapterContent.nextChapterPath);
        setPrevChapterPath(chapterContent.prevChapterPath);

        setLoading(false);
      } catch (err) {
        setError('Failed to fetch chapter content');
        setLoading(false);
        console.error('Error fetching chapter:', err);
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
          <p>{`${currentPage + 1} / ${pages.length}`}</p>{' '}
          {/* Fixed page number */}
        </div>
      )}
    </Container>
  );
}

export default Reader;
