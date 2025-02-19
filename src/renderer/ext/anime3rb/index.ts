import { Entry, animeDetails, epd } from '../../types';

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

  const studioElement = [...doc.querySelectorAll('td')].find((td) =>
    td.textContent?.includes('الاستديو:'),
  );
  const studio = studioElement
    ? studioElement.nextElementSibling?.querySelector('a')?.textContent?.trim()
    : '';

  const genres = [...doc.querySelectorAll('.flex.flex-wrap.gap-2 a')]
    .map((genre) => genre?.textContent?.trim())
    .filter((genre): genre is string => Boolean(genre))
    .slice(0, -2);

  const rating =
    doc.querySelector('.text-lg.leading-relaxed')?.textContent?.trim() || 'N/A';

  const ps = doc.querySelectorAll('.py-4 p');
  const description =
    Array.from(ps)
      .map((p) => p.textContent?.trim() || '')
      .filter((text) => text.length > 0)
      .join(' ') || '';

  const episodes = [...doc.querySelectorAll('a[href*="/episode/"]')].map(
    (ep) => ({
      title:
        ep.querySelector('.video-metadata span')?.textContent?.trim() ||
        'بدون عنوان',
      path: ep.getAttribute('href')?.split('/').at(-1) || '',
    }),
  );

  const posterURL =
    doc.querySelector('.container img')?.getAttribute('src') || '';

  const details: animeDetails = {
    ext,
    title,
    genres,
    studio: studio || '',
    description,
    rating,
    posterURL,
    episodes,
  };

  return details;
}

export async function getEpisode(t: string, e: string): Promise<epd> {
  const url = `${baseURL}episode/${t}/${e}`;
  const res = await fetch(url);
  const doc = parseHTML(await res.text());
  const buttonElement = doc.querySelector('button[data-source]');
  const src = buttonElement ? buttonElement.getAttribute('data-source') : null;
  return {
    src: src || '',
  };
}
