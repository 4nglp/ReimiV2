import { PinnedAnime, LatestEpisode } from './types';

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
      episodes.push({ ext, title, path, coverURL, status, episode });
    }
  });

  return episodes;
}
