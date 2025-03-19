import { pinnedAnime, Episode, EpisodeDetails, Server } from '../../types';

const baseURL = 'https://web.animerco.org/';
const ext = 'animerco';
const parser = new DOMParser();
const parseHTML = (html: string) => parser.parseFromString(html, 'text/html');

export async function getPinnedAnimes() {
  const res = await fetch(`${baseURL}`);
  const doc = parseHTML(await res.text());
  const pinnedAnimes: pinnedAnime[] = [];

  doc.querySelectorAll('.media-carousel .anime-card').forEach((e) => {
    const title = e.querySelector('.info a h3')?.textContent?.trim() || '';
    const posterURL =
      e.querySelector('a.lazyactive')?.getAttribute('data-src') || '';
    const season = e.querySelector('.info a h4')?.textContent?.trim() || '';
    const status =
      e.querySelector('.anime-status a')?.textContent?.trim() || '';
    const href = e.querySelector('a')?.getAttribute('href') || '';
    const path =
      href
        .split('/')
        .filter((segment) => segment)
        .pop() || '';
    console.log(posterURL);
    console.log(path);

    if (title && path && posterURL) {
      pinnedAnimes.push({ ext, title, path, posterURL, season, status });
    }
  });
  return pinnedAnimes;
}

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
export async function getEpisode(t: string, nume: string) {
  const res = await fetch(`${baseURL}episodes/${t}`);
  const doc = parseHTML(await res.text());
  const selectedServer = doc.querySelector(
    `ul.server-list li a[data-nume="${nume}"]`,
  );
  const type = selectedServer?.getAttribute('data-type') || '';
  const post = selectedServer?.getAttribute('data-post') || '';

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
      post,
      nume,
      type,
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

export async function getServers(t: string) {
  const res = await fetch(`${baseURL}episodes/${t}`);
  const doc = parseHTML(await res.text());
  const serverNume = Array.from(doc.querySelectorAll('ul.server-list li a'))
    .map((el) => el.getAttribute('data-nume') || '')
    .filter((nume) => nume);
  const serverName = Array.from(
    doc.querySelectorAll('ul.server-list li span.server'),
  )
    .map((el) => el.textContent?.trim() || '')
    .filter((name) => name);
  console.log(serverNume, serverName);
  const servers: Server[] = serverNume.map((nume, index) => ({
    nume,
    name: serverName[index],
  }));
  return servers;
}
