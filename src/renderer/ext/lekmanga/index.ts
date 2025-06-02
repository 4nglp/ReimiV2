import { mangaDetails, Chapter } from '../../types';
import { Latest } from '../manga/types';
import pins from './pins.json';

const baseURL = 'https://lekmanga.net/';
const ext = 'lekmanga';
const parser = new DOMParser();
const parseHTML = (html: string) => parser.parseFromString(html, 'text/html');

export async function getEntriesLekManga(page = 1) {
  const res = await fetch(`${baseURL}page/${page}`);
  const doc = parseHTML(await res.text());
  const entries: Latest[] = [];
  const elements = doc.querySelectorAll('.page-item-detail.manga');
  elements.forEach((e) => {
    const title =
      e.querySelector('.item-thumb.c-image-hover a')?.getAttribute('title') ||
      '';
    const path =
      e
        .querySelector('.item-thumb.c-image-hover a')
        ?.getAttribute('href')
        ?.split('/')
        .at(-2) || '';
    const posterUrl =
      e.querySelector('.item-thumb.c-image-hover img')?.getAttribute('src') ||
      '';
    const latestChapter =
      e.querySelector('.list-chapter .chapter-item a')?.textContent?.trim() ||
      '';

    if (title && path && posterUrl && latestChapter) {
      entries.push({ title, path, posterUrl, latestChapter });
    }
  });

  return entries;
}

export async function getDetailsLek(entryTitle: string): Promise<mangaDetails> {
  const formattedTitle = entryTitle.toLowerCase().replace(/\s+/g, '-');
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

  const chapterElements = doc.querySelectorAll('li.wp-manga-chapter a');
  chapterElements.forEach((e) => {
    const chapterTitle = e.textContent?.trim() || '';
    const chapterFullPath = e.getAttribute('href') || '';
    const chapterPath = chapterFullPath.split('/').filter(Boolean).pop();
    if (chapterTitle && chapterPath) {
      chapters.push({ title: chapterTitle, path: chapterPath, pages: [] });
    }
  });

  const details: mangaDetails = {
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

export async function getChapter(m: string, n: string) {
  const res = await fetch(`${baseURL}/manga/${m}/${n}`);
  const doc = parseHTML(await res.text());

  const titleElement = doc.querySelector('h1#chapter-heading');
  const title = titleElement
    ? titleElement.textContent?.trim()
    : 'Untitled Chapter';

  const pages: string[] = [];
  doc.querySelectorAll('.page-break img').forEach((img) => {
    const pageURL = img.getAttribute('src');
    if (pageURL) {
      pages.push(pageURL.trim());
    }
  });

  return {
    title,
    path: n,
    pages,
  };
}

export function getPinnedEntries() {
  return pins.map((pin) => ({
    title: pin.title,
    posterUrl: pin.posterUrl,
    path: pin.path,
  }));
}
