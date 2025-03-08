import { Episode, EpisodeDetails } from '../../types';

const baseURL = 'https://web.animerco.org/';
const ext = 'animerco';
const parser = new DOMParser();
const parseHTML = (html: string) => parser.parseFromString(html, 'text/html');

export async function getEpisodesList(page = 1) {
  const res = await fetch(`${baseURL}episodes/page/${page}`);
  const doc = parseHTML(await res.text());
  const episodes: Episode[] = [];

  doc.querySelectorAll('.episode-card').forEach((e) => {
    const title = e.querySelector('.info h3')?.textContent?.trim() || '';
    const href = e.querySelector('a')?.getAttribute('href') || '';
    const path =
      href
        .split('/')
        .filter((segment) => segment)
        .pop() || '';
    const coverURL = e.querySelector('a')?.getAttribute('data-src') || '';
    const season = e.querySelector('.info h4')?.textContent?.trim() || '';
    const episode = e.querySelector('.episode span')?.textContent?.trim() || '';

    if (title && path && coverURL) {
      episodes.push({ ext, title, path, coverURL, season, episode });
    }
  });

  return episodes;
}

export async function getEpisodePage(t: string) {
  const res = await fetch(`${baseURL}episodes/${t}`);
  const doc = parseHTML(await res.text());
}
