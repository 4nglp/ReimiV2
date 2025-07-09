import { Entry, Chapter, mangaDetails } from '../../types';
import { Pinned, Latest, Results } from './types';

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
    const chapterPath = chapterFullPath.split('/').filter(Boolean).pop() || '';

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
  const fullChapterPath = `${m}/${n}`;
  const res = await fetch(`${baseURL}/manga/${fullChapterPath}`);
  const doc = parseHTML(await res.text());

  const title = doc.querySelector('li.active')?.textContent?.trim() || '';
  const pages: string[] = [];
  doc.querySelectorAll('.page-break img').forEach((img) => {
    const pageURL = img.getAttribute('src');
    if (pageURL) {
      pages.push(pageURL.trim());
    }
  });

  const extractChapterNumber = (path: string) => {
    const match = path.match(/(\d+)(?!.*\d)/);
    return match ? parseInt(match[0], 10) : null;
  };

  const currentChapterNumber = extractChapterNumber(n);

  let nextChapterPath: string | null = null;
  let prevChapterPath: string | null = null;

  if (currentChapterNumber !== null) {
    const nextChapterNumber = currentChapterNumber + 1;
    const prevChapterNumber = currentChapterNumber - 1;

    nextChapterPath = `/manga/${m}/${n.replace(/\d+(?!.*\d)/, nextChapterNumber.toString())}`;
    prevChapterPath =
      prevChapterNumber > 0
        ? `/manga/${m}/${n.replace(/\d+(?!.*\d)/, prevChapterNumber.toString())}`
        : null;
  }

  return {
    title,
    path: fullChapterPath,
    pages,
    nextChapterPath,
    prevChapterPath,
  };
}
export async function getResults(query: string) {
  try {
    const url = `${baseURL}/?s=${query}&post_type=wp-manga`;
    const res = await fetch(url);
    const htmlText = await res.text();
    const doc = parseHTML(htmlText);
    console.log('=== DEBUGGING SEARCH RESULTS ===');
    const mainContent =
      doc.querySelector('.main-content') ||
      doc.querySelector('.site-content') ||
      doc.querySelector('.content');
    let mangaItems = doc.querySelectorAll('.row.c-tabs-item__content');
    if (mangaItems.length === 0) {
      mangaItems = doc.querySelectorAll('.tab-thumb');
      if (mangaItems.length === 0) {
        mangaItems = doc.querySelectorAll('.post-title');
      }
    }
    console.log(`Found ${mangaItems.length} manga items`);
    const results: Results[] = [];
    if (mangaItems.length > 0) {
      mangaItems.forEach((item, index) => {
        try {
          let titleElement =
            item.querySelector('.post-title h3 a') ||
            item.querySelector('.post-title a') ||
            item.querySelector('h3 a');
          let imageElement =
            item.querySelector('.tab-thumb img') || item.querySelector('img');
          if (!titleElement || !imageElement) {
            const parentRow = item.closest('.row') || item.parentElement;
            if (parentRow) {
              titleElement =
                titleElement ||
                parentRow.querySelector('.post-title h3 a') ||
                parentRow.querySelector('.post-title a') ||
                parentRow.querySelector('h3 a');
              imageElement =
                imageElement ||
                parentRow.querySelector('.tab-thumb img') ||
                parentRow.querySelector('img');
            }
          }
          if (titleElement && imageElement) {
            const title = titleElement.textContent?.trim() || '';
            const href = titleElement.getAttribute('href') || '';
            const imageUrl = imageElement.getAttribute('src') || '';
            const pathMatch = href.match(/\/manga\/([^\/]+)\/?$/);
            const path = pathMatch ? pathMatch[1] : '';

            if (title && path && imageUrl) {
              results.push({
                title,
                path,
                posterUrl: imageUrl,
              });

              console.log(`Result ${index}:`, {
                title,
                path,
                posterUrl: imageUrl,
              });
            }
          }
        } catch (err) {
          console.error(`Error processing item ${index}:`, err);
        }
      });
    }
    if (results.length === 0) {
      console.log('No results found with main method, trying alternative...');
      const mangaLinks = doc.querySelectorAll('a[href*="/manga/"]');
      console.log(`Found ${mangaLinks.length} manga links`);
      const seenPaths = new Set<string>();
      mangaLinks.forEach((link, index) => {
        try {
          const href = link.getAttribute('href') || '';
          const title =
            link.getAttribute('title') || link.textContent?.trim() || '';
          const pathMatch = href.match(/\/manga\/([^\/]+)\/?$/);
          const path = pathMatch ? pathMatch[1] : '';
          if (path && title && !seenPaths.has(path)) {
            seenPaths.add(path);
            let imageUrl = '';
            const container =
              link.closest('.row') ||
              link.closest('.tab-thumb') ||
              link.closest('.post');
            if (container) {
              const img = container.querySelector('img');
              if (img) {
                imageUrl = img.getAttribute('src') || '';
              }
            }
            if (!imageUrl) {
              const { parentElement } = link;
              if (parentElement) {
                const nearbyImg =
                  parentElement.querySelector('img') ||
                  parentElement.previousElementSibling?.querySelector('img') ||
                  parentElement.nextElementSibling?.querySelector('img');
                if (nearbyImg) {
                  imageUrl = nearbyImg.getAttribute('src') || '';
                }
              }
            }

            if (imageUrl) {
              results.push({
                title,
                path,
                posterUrl: imageUrl,
              });

              console.log(`Alternative result ${index}:`, {
                title,
                path,
                posterUrl: imageUrl,
              });
            }
          }
        } catch (err) {
          console.error(`Error processing link ${index}:`, err);
        }
      });
    }

    console.log(`Total results found: ${results.length}`);
    console.log('Results:', results);

    return results;
  } catch (error) {
    console.error('Error in getResults:', error);
    throw error;
  }
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
