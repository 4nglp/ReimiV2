import { PinnedAnime, LatestEpisode, AnimesDetails } from './types';

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
  return pinnedAnimes;
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

export async function getAnimeDetails(s: string) {
  const res = await fetch(`${baseURL}/anime/${s}`);
  const doc = parseHTML(await res.text());

  const p = doc.querySelector('.anime-info-container');
  const title = p?.querySelector('.media-title h1')?.textContent || '';
  const posterURL =
    doc.querySelector('.anime-thumbnail img')?.getAttribute('src')?.trim() ||
    '';
  const genres = Array.from(doc.querySelectorAll('.genres a')).map(
    (element) => element.textContent?.trim() || '',
  );

  const description =
    doc.querySelector('.content p')?.textContent?.trim() || '';
  const status =
    doc.querySelector('a.btn.large.fluid')?.textContent?.trim() || 'Unknown';
  const episodesList = Array.from(doc.querySelectorAll('.episodes-lists li'));
  const eps: Ep[] = episodesList.map((epEl) => {
    const posterAnchor = epEl.querySelector<HTMLAnchorElement>('a.image');

    return {
      title: posterAnchor?.getAttribute('title')?.trim() || '',
      coverURL: posterAnchor?.getAttribute('data-src')?.trim() || '',
      path:
        (posterAnchor?.getAttribute('href') || '')
          .split('/')
          .filter((segment) => segment)
          .pop() || '',
    };
  });

  const animeDetails: AnimesDetails = {
    title,
    posterURL,
    genres,
    status,
    description,
  };

  return animeDetails;
}
