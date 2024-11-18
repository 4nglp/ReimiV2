import { Entry, Details, Chapter } from '../../types'; // Import your types

const baseURL = 'https://3asq.org/';
const ext = '3asq';
const parser = new DOMParser();
const parseHTML = (html: string) => parser.parseFromString(html, 'text/html');

// Fetch the list of entries
export async function getEntries() {
  const res = await fetch(`${baseURL}`);
  const doc = parseHTML(await res.text());
  const entries: Entry[] = [];

  const elements = doc.querySelectorAll('.page-item-detail.manga');

  elements.forEach((e) => {
    const title = e.querySelector('.item-thumb a')?.getAttribute('title') || '';
    const path = e.querySelector('.item-thumb a')?.getAttribute('href') || '';
    const posterURL =
      e.querySelector('.item-thumb img')?.getAttribute('src') || '';

    if (title && path && posterURL) {
      entries.push({ ext, title, path, posterURL });
    }
  });
  return entries;
}

// Fetch the details of a specific entry
export async function getDetails(entryTitle: string): Promise<Details> {
  // Construct the full URL for the entry details page
  const formattedTitle = entryTitle.toLowerCase().replace(/\s+/g, '-'); // Format title (e.g., "Blooming Love" -> "blooming-love")
  const detailsURL = `${baseURL}manga/${formattedTitle}/`;

  const res = await fetch(detailsURL);
  const doc = parseHTML(await res.text());

  // Extract the entry details from the page
  const mangaTitle =
    doc.querySelector('.post-title h1')?.textContent?.trim() || '';
  const posterURL =
    doc.querySelector('.tab-summary .summary_image img')?.getAttribute('src') ||
    '';
  const description =
    doc.querySelector('.manga-excerpt')?.textContent?.trim() || '';
  const author =
    doc
      .querySelector('.post-content_item .author-content a')
      ?.textContent?.trim() || '';
  const artist =
    doc
      .querySelector('.post-content_item .artist-content a')
      ?.textContent?.trim() || '';
  const genres =
    doc
      .querySelector('.post-content_item .genres-content')
      ?.textContent?.split(',')
      .map((genre) => genre.trim()) || [];

  const pubYear =
    doc
      .querySelector('.post-status .post-content_item .summary-content a')
      ?.textContent?.trim() || 'Not specified';
  const chapters: Chapter[] = [];
  const chapterElements = doc.querySelectorAll(
    '.listing-chapters_wrap .wp-manga-chapter a',
  );
  chapterElements.forEach((e) => {
    const chapterTitle = e.textContent?.trim() || '';
    const chapterPath = e.getAttribute('href') || '';
    if (chapterTitle && chapterPath) {
      chapters.push({ title: chapterTitle, path: chapterPath, pages: [] });
    }
  });

  // Return the details
  const details: Details = {
    ext,
    title: mangaTitle,
    description,
    author,
    artist,
    genres,
    pubYear,
    posterURL,
    chapters,
  };

  return details;
}

export async function getChapter(chapterPath: string) {
  const res = await fetch(chapterPath);
  const doc = parseHTML(await res.text());
  const title = doc.querySelector('ol.breadcrumb li.active')?.textContent || '';
  const pages: string[] = [];
  doc.querySelectorAll('.page-break img').forEach((img) => {
    const pageURL = img.getAttribute('src');
    if (pageURL) {
      pages.push(pageURL);
    }
  });
  return {
    title,
    path: chapterPath,
    pages,
  };
}
