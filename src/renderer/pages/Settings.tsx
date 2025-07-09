import { useEffect, useState } from 'react';

export default function Settings({ url }) {
  const [pages, setPages] = useState([]);
  const [loading, setLoad] = useState(false);
  const [error, setErr] = useState(null);

  useEffect(() => {
    if (!url) return;

    const chapterHash = (() => {
      try {
        const { pathname } = new URL(url);
        const parts = pathname.split('/').filter(Boolean);
        const last = parts[parts.length - 1]; // like: 9sboOh8t-chapter-10-en
        return last.split('-')[0]; // extract 9sboOh8t
      } catch {
        return null;
      }
    })();

    if (!chapterHash) {
      setErr('Invalid Comick chapter URL');
      return;
    }

    (async () => {
      setLoad(true);
      setErr(null);
      try {
        const res = await fetch(
          `https://api.comick.fun/chapter/${chapterHash}?tachiyomi=true`,
        );
        if (!res.ok) throw new Error(`API ${res.status}`);
        const data = await res.json();
        console.log('📦 Full API Response:', data);

        // Try every known pattern for images
        const pages =
          data?.images?.map((i) => i.url) ||
          data?.md_images?.map((i) => i.url) ||
          data?.chapter?.images?.map((i) => i.url) ||
          [];

        if (pages.length === 0) throw new Error('No pages in response');

        setPages(pages);
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoad(false);
      }
    })();
  }, [url]);

  if (loading) return <p>Loading…</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
        padding: 32,
      }}
    >
      {pages.map((src, i) => (
        <img
          key={i}
          src={src}
          alt={`Page ${i + 1}`}
          style={{ width: '100%', maxWidth: 800 }}
          loading="lazy"
        />
      ))}
    </div>
  );
}
