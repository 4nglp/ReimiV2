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
  const nav = useNavigate();

  useEffect(() => {
    document.onfullscreenchange = () => !document.fullscreenElement && nav(-1);
    if (containerRef.current && !document.fullscreenElement) {
      containerRef.current.requestFullscreen();
    }
  }, [nav]);

  return (
    <div
      ref={containerRef}
      className="h-screen w-full overflow-hidden bg-black flex justify-center items-center"
    >
      {children}
    </div>
  );
}

function Reader(): React.JSX.Element {
  const { chapterPath } = useParams<{ chapterPath: string }>();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const preloadImages = useCallback(
    (pages: string[], currentPageIndex: number) => {
      const preloadPage = (index: number) => {
        if (index >= 0 && index < pages.length) {
          const img = new Image();
          img.src = pages[index];
        }
      };
      preloadPage(currentPageIndex + 1);
      preloadPage(currentPageIndex - 1);
    },
    [],
  );

  const handleWheel = useCallback((event: WheelEvent) => {
    event.preventDefault();

    if (event.deltaY < 0) {
      setZoomLevel((prev) => Math.min(prev + 0.1, 3));
    } else {
      setZoomLevel((prev) => Math.max(prev - 0.1, 1));
    }
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        navigate(-1);
      } else if (event.key === 'd' || event.key === 'ArrowRight') {
        setCurrentPage((prev) =>
          Math.min(prev + 1, (chapter?.pages.length ?? 1) - 1),
        );
        window.scrollTo(0, 0);
      } else if (event.key === 'a' || event.key === 'ArrowLeft') {
        setCurrentPage((prev) => Math.max(prev - 1, 0));
        window.scrollTo(0, 0);
      }
    },
    [chapter, navigate],
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
          title: chapterContent.title || 'Untitled Chapter', // Provide a default title
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
    if (chapter) {
      preloadImages(chapter.pages, currentPage);
    }
  }, [chapter, currentPage, preloadImages]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [handleKeyDown, handleWheel]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!chapter) return <p>No chapter content available</p>;

  const { pages, title } = chapter;

  return (
    <Container>
      <div className="flex justify-center items-center flex-col relative">
        {pages.length > 0 && (
          <img
            src={pages[currentPage]}
            alt={`Page ${currentPage + 1} of ${title}`}
            loading="lazy"
            className="max-w-full max-h-screen object-contain"
            style={{
              transform: `scale(${zoomLevel})`,
            }}
          />
        )}
        <div className="absolute bottom-2 bg-black/70 text-white px-3 py-1 rounded">
          <p>{`Page ${currentPage + 1} of ${pages.length}`}</p>
        </div>
      </div>
    </Container>
  );
}

export default Reader;
