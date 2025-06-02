import { Entry, Chapter, mangaDetails } from '../../types';
import { Pinned, Latest } from './types';

const baseURL = 'https://3asq.org/';
const ext = '3asq';
const parser = new DOMParser();
const parseHTML = (html: string) => parser.parseFromString(html, 'text/html');

export async function getEntries3asq(page = 1) {
  const res = await fetch(`${baseURL}page/${page}`);
  const doc = parseHTML(await res.text());
  const entries: Latest[] = [];

  const elements = doc.querySelectorAll('.page-item-detail.manga');
  elements.forEach((e) => {
    const title = e.querySelector('.item-thumb a')?.getAttribute('title') || '';
    const path =
      e
        .querySelector('.item-thumb a')
        ?.getAttribute('href')
        ?.split('/')
        .at(-2) || '';
    const posterURLs =
      e.querySelector('.item-thumb img')?.getAttribute('srcset') || '';
    const posterUrl = posterURLs.split(', ').at(-1)?.split(' ').at(0);
    const latestChapter =
      e.querySelector('.list-chapter .chapter-item a')?.textContent?.trim() ||
      '';
    if (title && path && posterUrl && latestChapter) {
      entries.push({ title, path, posterUrl, latestChapter });
    }
  });
  return entries;
}

export async function getDetails3asq(
  entryTitle: string,
): Promise<mangaDetails> {
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
  const a = `${baseURL}manga/${formattedTitle}/ajax/chapters/?t=1`;
  console.log(a);
  console.log('a');

  const chaptersRes = await fetch(
    `${baseURL}manga/${formattedTitle}/ajax/chapters/?t=1`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        Accept: '*/*',
        Origin: baseURL.replace(/\/$/, ''),
        Referer: `${baseURL}manga/${formattedTitle}/`,
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
        'X-Requested-With': 'XMLHttpRequest',
      },
    },
  );

  const chaptersHTML = await chaptersRes.text();
  const chapterDoc = parseHTML(chaptersHTML);
  const chapterElements = chapterDoc.querySelectorAll('.wp-manga-chapter a');

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

export async function getChapter(chapterPath: string, mangaTitle: string) {
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
      pages.push(pageURL.trim());
    }
  });

  const extractChapterNumber = (path: string) => {
    const match = path.match(/(\d+)$/);
    return match ? parseInt(match[0], 10) : null;
  };

  const currentChapterNumber = extractChapterNumber(chapterPath);

  let nextChapterPath: string | null = null;
  let prevChapterPath: string | null = null;

  if (currentChapterNumber) {
    const nextChapterNumber = currentChapterNumber + 1;
    const prevChapterNumber = currentChapterNumber - 1;

    nextChapterPath = `/manga/${mangaTitle}/chapter/${nextChapterNumber}`;
    prevChapterPath = `/manga/${mangaTitle}/chapter/${prevChapterNumber}`;
  }

  return {
    title,
    path: chapterPath,
    pages,
    nextChapterPath,
    prevChapterPath,
  };
}

export async function getResults(q: string, page = 1) {
  const res = await fetch(`${baseURL}page/${page}?s=${q}&post_type=wp-manga`);
  const doc = parseHTML(await res.text());
  const entries: Entry[] = [];

  const elements = doc.querySelectorAll('.row .c-tabs-item__content');

  elements.forEach((e) => {
    const title =
      e.querySelector('.tab-thumb .c-image-hover a')?.getAttribute('title') ||
      '';
    const path =
      e
        .querySelector('.tab-thumb .c-image-hover a')
        ?.getAttribute('href')
        ?.split('/')
        .at(-2) || '';
    const posterURLs =
      e
        .querySelector('.tab-thumb .c-image-hover  img')
        ?.getAttribute('srcset') || '';
    const posterURL = posterURLs.split(', ').at(-1)?.split(' ').at(0);

    if (title && path && posterURL) {
      entries.push({ ext, title, path, posterURL });
    }
  });
  return entries;
}

export async function getPinnedEntries() {
  const res = await fetch(`${baseURL}`);
  const doc = parseHTML(await res.text());
  const pinned: Pinned[] = [];

  doc.querySelectorAll('.slider__item .item__wrap').forEach((itemWrap) => {
    const title =
      itemWrap.querySelector('.post-title a')?.textContent?.trim() || '';
    const href =
      itemWrap.querySelector('.post-title a')?.getAttribute('href') || '';
    const path = href.split('/').filter(Boolean).pop() || '';
    const imgEl = itemWrap.querySelector('.slider__thumb_item img');
    let posterUrl = imgEl?.getAttribute('src') || '';
    const srcset = imgEl?.getAttribute('srcset') || '';

    if (srcset) {
      const sources = srcset
        .split(',')
        .map((s) => s.trim().split(' '))
        .filter((pair) => pair.length === 2)
        .map(([url, size]) => ({
          url,
          width: parseInt(size.replace('w', ''), 10),
        }))
        .sort((a, b) => b.width - a.width);

      if (sources.length > 0) {
        posterUrl = sources[0].url;
      }
    }
    if (title && path && posterUrl) {
      pinned.push({ title, path, posterUrl });
    }
  });

  return pinned;
}
