import {
  PinnedAnime,
  LatestEpisode,
  AnimeDetails,
  Episode,
  SearchResults,
} from './types';

const baseURL = 'https://anime4up.rest/';
const ext = 'anime4up';
const parser = new DOMParser();
const parseHTML = (html: string) => parser.parseFromString(html, 'text/html');

export async function getPinnedAnimes() {
  const res = await fetch(`${baseURL}`);
  const doc = parseHTML(await res.text());
  const pinnedAnimes: PinnedAnime[] = [];

  doc.querySelectorAll('.anime-card-container').forEach((e) => {
    const title =
      e.querySelector('.anime-card-title h3 a')?.textContent?.trim() || '';
    const posterURL =
      e.querySelector('img.img-responsive')?.getAttribute('data-image') || '';
    const season = e.querySelector('.info a h4')?.textContent?.trim() || '';
    const status =
      e.querySelector('.anime-card-status a')?.textContent?.trim() || '';
    const href =
      e.querySelector('.anime-card-title h3 a')?.getAttribute('href') || '';
    const path =
      href
        .split('/')
        .filter((segment) => segment)
        .pop() || '';
    if (title && path && posterURL) {
      pinnedAnimes.push({ ext, title, path, posterURL, season, status });
    }
  });
  return pinnedAnimes.slice(0, 6);
}

export async function getLatestEpisodes(page = 1) {
  const res = await fetch(`${baseURL}episode/page/${page}`);
  const doc = parseHTML(await res.text());
  const episodes: LatestEpisode[] = [];

  doc.querySelectorAll('.anime-card-container').forEach((e) => {
    const title =
      e.querySelector('.anime-card-title h3 a')?.textContent?.trim() || '';
    const type =
      e.querySelector('.anime-card-type a')?.textContent?.trim() || '';
    const status =
      e.querySelector('.anime-card-status a')?.textContent?.trim() || '';
    const href =
      e.querySelector('.anime-card-title h3 a')?.getAttribute('href') || '';
    const path =
      href
        .split('/')
        .filter((segment) => segment)
        .pop() || '';
    const coverURL =
      e.querySelector('img.img-responsive')?.getAttribute('src') || '';
    const episode =
      e.querySelector('.episodes-card-title h3 a')?.textContent?.trim() || '';

    if (title && path && coverURL) {
      episodes.push({ ext, title, path, coverURL, status, type, episode });
    }
  });

  return episodes;
}

export async function getAnimeDetails(a: string) {
  const res = await fetch(`${baseURL}/anime/${a}`);
  const doc = parseHTML(await res.text());

  const p = doc.querySelector('.anime-info-container');
  const title =
    p?.querySelector('h1.anime-details-title')?.textContent?.trim() || '';

  const posterURL =
    doc.querySelector('.anime-thumbnail img')?.getAttribute('src')?.trim() ||
    '';

  const genres = Array.from(doc.querySelectorAll('ul.anime-genres li a')).map(
    (element) => element.textContent?.trim() || '',
  );

  const description =
    doc.querySelector('p.anime-story')?.textContent?.trim() || '';

  const statusLabel = Array.from(doc.querySelectorAll('.anime-info')).find(
    (div) => div.textContent?.includes('حالة الأنمي'),
  );

  const status =
    statusLabel?.querySelector('a')?.textContent?.trim() || 'Unknown';

  const episodesWrapper = doc.querySelector('.episodes-list-content');
  const episodesList = Array.from(
    episodesWrapper?.querySelectorAll('.episodes-card') || [],
  );
  const episodes: Episode[] = episodesList.map((epEl) => {
    const link =
      epEl.querySelector<HTMLAnchorElement>('h3 a') ||
      epEl.querySelector<HTMLAnchorElement>('a.overlay');
    const img = epEl.querySelector<HTMLImageElement>('img.img-responsive');
    return {
      title: link?.textContent?.trim() || '',
      coverURL:
        img?.getAttribute('data-src')?.trim() ||
        img?.getAttribute('src')?.trim() ||
        '',
      path:
        (link?.getAttribute('href') || '').split('/').filter(Boolean).pop() ||
        '',
    };
  });
  const animeDetails: AnimeDetails = {
    title,
    posterURL,
    genres,
    status,
    episodes,
    description,
  };

  return animeDetails;
}

export async function getResults(s: string) {
  const res = await fetch(`${baseURL}?search_param=animes&s=${s}`);
  const doc = parseHTML(await res.text());
  const results: SearchResults[] = [];
  const elements = doc.querySelectorAll('.anime-card-container');
  elements.forEach((e) => {
    const title = e.querySelector('.anime-card-title h3 a')?.textContent || '';
    const posterURL =
      e.querySelector('img.img-responsive')?.getAttribute('src') || '';
    const href =
      e.querySelector('.anime-card-title h3 a')?.getAttribute('href') || '';
    const path =
      href
        .split('/')
        .filter((segment) => segment)
        .pop() || '';
    const type = e.querySelector('.anime-card-type a')?.textContent || '';
    const status = e.querySelector('.anime-card-status a')?.textContent || '';
    if (title && path && posterURL) {
      results.push({ title, path, posterURL, status, type });
    }
  });
  console.log(results);
  return results;
}
