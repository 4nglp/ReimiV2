import { Entry, Details, Chapter } from '../../types';

const baseURL = 'https://lekmanga.net/';
const ext = 'lekmanga';
const parser = new DOMParser();
const parseHTML = (html: string) => parser.parseFromString(html, 'text/html');

export async function getEntriesLekManga() {
  const res = await fetch(`${baseURL}`);
  const doc = parseHTML(await res.text());
  const entries: Entry[] = [];

  const elements = doc.querySelectorAll('.page-item-detail.manga');

  elements.forEach((e) => {
    const linkEl = e.querySelector('.item-thumb.c-image-hover a');
    const imgEl = e.querySelector('.item-thumb.c-image-hover img');

    if (linkEl && imgEl) {
      const title = linkEl.getAttribute('title') || 'Untitled';
      const path = new URL(linkEl.getAttribute('href') || '', baseURL).pathname; // Ensure path is relative
      const posterURL = imgEl.getAttribute('src') || '';

      if (title && path && posterURL) {
        entries.push({ ext, title, path, posterURL });
      }
    }
  });

  return entries;
}

export async function getDetails(entryTitle: string): Promise<Details> {
  const formattedTitle = entryTitle.toLowerCase().replace(/\s+/g, '-'); // Format title (e.g., "Blooming Love" -> "blooming-love")
  const detailsURL = `${baseURL}manga/${formattedTitle}/`;

  const res = await fetch(detailsURL);
  const doc = parseHTML(await res.text());

  const mangaTitle =
    doc.querySelector('.post-title h1')?.textContent?.trim() || '';
  const posterURL =
    doc.querySelector('.tab-summary .summary_image img')?.getAttribute('src') ||
    '';
  const description =
    doc
      .querySelector('.description-summary .summary__content p')
      ?.textContent?.trim() || '';
  const author =
    doc
      .querySelector('.post-content_item .author-content')
      ?.textContent?.trim() || '';
  const artist =
    doc
      .querySelector('.post-content_item .artist-content')
      ?.textContent?.trim() || '';
  const genres =
    doc
      .querySelector('.post-content_item .summary-content .genres-content')
      ?.textContent?.split(',')
      .map((genre) => genre.trim()) || [];
  const pubYear = '-';
  const chapters: Chapter[] = [];
  const chapterElements = doc.querySelectorAll(
    '.main.version-chap .wp-manga-chapter a',
  );
  chapterElements.forEach((e) => {
    const chapterTitle = e.textContent?.trim() || '';
    const chapterFullPath = e.getAttribute('href') || '';
    const chapterPath = new URL(chapterFullPath, baseURL).pathname.replace(
      /^\/+/,
      '',
    );
    if (chapterTitle && chapterPath) {
      chapters.push({ title: chapterTitle, path: chapterPath, pages: [] });
    }
  });

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
  const res = await fetch(baseURL + chapterPath);
  const doc = parseHTML(await res.text());

  const titleElement = doc.querySelector('h1#chapter-heading');
  const title = titleElement
    ? titleElement.textContent?.trim()
    : 'Untitled Chapter';

  const pages: string[] = [];
  doc.querySelectorAll('.page-break img').forEach((img) => {
    const pageURL = img.getAttribute('src');
    if (pageURL) {
      // Clean up the URL by trimming whitespace and newline characters
      pages.push(pageURL.trim());
    }
  });

  return {
    title,
    path: chapterPath,
    pages,
  };
}
