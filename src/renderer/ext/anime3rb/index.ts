import { Entry, animeDetails } from '../../types';

const baseURL = 'https://anime3rb.com/';
const ext = 'anime3rb';
const parser = new DOMParser();
const parseHTML = (html: string) => parser.parseFromString(html, 'text/html');

export async function getEntriesAnime3rb(page = 1) {
  const res = await fetch(`${baseURL}titles/list?page=${page}`);
  const doc = parseHTML(await res.text());
  const entries: Entry[] = [];

  const elements = doc.querySelectorAll('.title-card');

  elements.forEach((e) => {
    const title = e.querySelector('h2')?.textContent || '';
    const path =
      e.querySelector('a')?.getAttribute('href')?.split('/').at(-1) || '';
    const posterURL = e.querySelector('img')?.getAttribute('src') || '';
    if (title && path && posterURL) {
      entries.push({ ext, title, path, posterURL });
    }
  });
  return entries;
}
export async function getDetails(q: string): Promise<animeDetails> {
  const t = q;
  const url = `${baseURL}titles/${t}`;
  const res = await fetch(url);
  const doc = parseHTML(await res.text());

  const title =
    doc
      .querySelector('.text-2xl.font-bold.uppercase span[dir="ltr"]')
      ?.textContent?.trim() || '';

  const statusElement = [...doc.querySelectorAll('td')].find((td) =>
    td.textContent?.includes('الحالة:'),
  );
  const status = statusElement
    ? statusElement.nextElementSibling?.textContent?.trim()
    : '';

  const seasonElement = [...doc.querySelectorAll('td')].find((td) =>
    td.textContent?.includes('إصدار:'),
  );
  const season = seasonElement
    ? seasonElement.nextElementSibling?.textContent?.trim()
    : '';

  const studioElement = [...doc.querySelectorAll('td')].find((td) =>
    td.textContent?.includes('الاستديو:'),
  );
  const studio = studioElement
    ? studioElement.nextElementSibling?.querySelector('a')?.textContent?.trim()
    : '';

  const authorElement = [...doc.querySelectorAll('td')].find((td) =>
    td.textContent?.includes('المؤلف:'),
  );
  const author = authorElement
    ? authorElement.nextElementSibling?.querySelector('a')?.textContent?.trim()
    : '';

  const directorElement = [...doc.querySelectorAll('td')].find((td) =>
    td.textContent?.includes('المخرج:'),
  );
  const director = directorElement
    ? directorElement.nextElementSibling
        ?.querySelector('a')
        ?.textContent?.trim()
    : '';

  const genres = [...doc.querySelectorAll('.flex.flex-wrap.gap-2 a')]
    .map((genre) => genre?.textContent?.trim())
    .filter((genre): genre is string => Boolean(genre));

  const rating =
    doc.querySelector('.text-lg.leading-relaxed')?.textContent?.trim() || 'N/A';

  const episodes = [...doc.querySelectorAll('a[href*="/episode/"]')].map(
    (ep) => ({
      title:
        ep.querySelector('.video-metadata span')?.textContent?.trim() ||
        'بدون عنوان',
      path: ep.getAttribute('href') || '',
    }),
  );

  const posterURL =
    doc.querySelector('.container img')?.getAttribute('src') || '';

  const details: animeDetails = {
    ext,
    title,
    genres,
    author: author || '',
    status: status || '',
    season: season || '',
    studio: studio || '',
    director: director || '',
    rating,
    posterURL,
    episodes,
  };

  return details;
}
