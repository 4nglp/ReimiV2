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

export async function getEpisode(t: string) {
  const res = await fetch(`${baseURL}episodes/${t}`);
  const doc = parseHTML(await res.text());
  const type =
    doc.querySelector('ul.server-list li a')?.getAttribute('data-type') || '';
  const post =
    doc.querySelector('ul.server-list li a')?.getAttribute('data-post') || '';
  const nume =
    doc.querySelector('ul.server-list li a')?.getAttribute('data-nume') || '';
  const req = await fetch('https://web.animerco.org/wp-admin/admin-ajax.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      Origin: 'https://web.animerco.org',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
      Accept: '*/*',
      'Accept-Encoding': 'gzip, deflate, br, zstd',
      'Accept-Language': 'en-US,en;q=0.7',
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: new URLSearchParams({
      action: 'player_ajax',
      post: `${post}`,
      nume: `${nume}`,
      type: `${type}`,
    }),
  });
  const src = await req.json();
  const details: EpisodeDetails = {
    type,
    post,
    nume,
    src: src.embed_url,
  };
  return details;
}
