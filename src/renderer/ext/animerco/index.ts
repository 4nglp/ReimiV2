import {
  pinnedAnime,
  Episode,
  EpisodeDetails,
  Server,
  SearchResults,
  EpisodesList,
  EpisodeControls,
  AnimesDetails,
  Season,
  Movie,
} from './types';

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
    if (title && path && posterURL) {
      pinnedAnimes.push({ ext, title, path, posterURL, season, status });
    }
  });
  return pinnedAnimes;
}

export async function getLatestEpisodes(page = 1) {
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

export async function getEpisodesList(t: string) {
  const res = await fetch(`${baseURL}episodes/${t}`);
  const doc = parseHTML(await res.text());

  const episodesList: EpisodesList[] = Array.from(
    doc.querySelectorAll('ul.episodes-list li a'),
  ).map((el) => {
    const title = el.querySelector('span')?.textContent?.trim() || '';
    const href = el.getAttribute('href') || '';
    const path =
      href
        .split('/')
        .filter((segment) => segment)
        .pop() || '';

    return { title, path };
  });

  return episodesList;
}

export async function getEpisodeControls(t: string): Promise<EpisodeControls> {
  const res = await fetch(`${baseURL}episodes/${t}`);
  const html = await res.text();
  const doc = parseHTML(html);
  const controls = doc.querySelectorAll('.page-controls a');
  const e = doc.querySelector('.page-head .container');
  const epTitle = e?.querySelector('h1')?.textContent || '';
  let nextEp = '';
  let backToDetails = '';
  let previousEp = '';
  controls.forEach((a) => {
    const href = a.getAttribute('href') ?? '';
    const spanText = a.querySelector('span')?.textContent?.trim();
    if (spanText === 'التالية') {
      nextEp =
        href
          .split('/')
          .filter((segment) => segment)
          .pop() || '';
    } else if (spanText === 'المواسم') {
      backToDetails =
        href
          .split('/')
          .filter((segment) => segment)
          .pop() || '';
    } else if (spanText === 'السابقة') {
      previousEp =
        href
          .split('/')
          .filter((segment) => segment)
          .pop() || '';
    }
  });
  const episodeControls: EpisodeControls = {
    epTitle,
    previousEp,
    backToDetails,
    nextEp,
  };
  return episodeControls;
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
  const servers: Server[] = serverNume.map((nume, index) => ({
    nume,
    name: serverName[index],
  }));
  return servers;
}

export async function getResults(s: string) {
  const res = await fetch(`${baseURL}?s=${s}`);
  const doc = parseHTML(await res.text());
  const results: SearchResults[] = [];
  const elements = doc.querySelectorAll('.search-card');
  elements.forEach((e) => {
    const title = e.querySelector('a.image')?.getAttribute('title') || '';
    const posterURL =
      e.querySelector('a.image')?.getAttribute('data-src') || '';
    const href = e.querySelector('.info a')?.getAttribute('href') || '';
    const path =
      href
        .split('/')
        .filter((segment) => segment)
        .pop() || '';
    const releaseYear =
      e.querySelector('.info .search-statics span.anime-aired')?.textContent ||
      '';
    const type =
      e.querySelector('.info .search-statics span.anime-type')?.textContent ||
      '';
    const rating = e.querySelector('.info a.badge')?.textContent || '';
    if (title && path && posterURL) {
      results.push({ title, path, posterURL, releaseYear, type, rating });
    }
  });
  return results;
}

export async function getAnimes(a: string) {
  const res = await fetch(`${baseURL}/animes/${a}`);
  const doc = parseHTML(await res.text());

  const p = doc.querySelector('.anime-card');
  const title = p?.querySelector('.image')?.getAttribute('title')?.trim() || '';
  const posterURL =
    p?.querySelector('.image')?.getAttribute('data-src')?.trim() || '';
  const bannerURL =
    doc.querySelector('.banner')?.getAttribute('data-src')?.trim() || '';

  const genres = Array.from(doc.querySelectorAll('.genres a')).map(
    (element) => element.textContent?.trim() || '',
  );

  const description =
    doc.querySelector('.content p')?.textContent?.trim() || '';

  let type = '';
  let seasonsNumber = '';
  let eps = '';
  const mediaInfoItems = Array.from(doc.querySelectorAll('.media-info li'));

  mediaInfoItems.forEach((item) => {
    const span = item.querySelector('span');
    if (!span) return;
    const value = span.textContent?.trim() || '';
    const labelText = item.textContent?.replace(value, '').trim() || '';

    if (labelText.includes('النوع')) {
      type = value;
    } else if (labelText.includes('المواسم')) {
      seasonsNumber = value;
    } else if (labelText.includes('الحلقات')) {
      eps = value;
    }
  });

  const seasonsList = Array.from(doc.querySelectorAll('.episodes-lists li'));
  const seasons: Season[] = seasonsList.map((seasonEl) => {
    const posterAnchor = seasonEl.querySelector<HTMLAnchorElement>('a.poster');

    return {
      title: posterAnchor?.getAttribute('title')?.trim() || '',
      posterURL: posterAnchor?.getAttribute('data-src')?.trim() || '',
      path: posterAnchor?.getAttribute('href')?.trim() || '',
      status:
        seasonEl.querySelector('.badge')?.textContent?.trim() || 'غير معروف',
    };
  });

  const animeDetails: AnimesDetails = {
    title,
    posterURL,
    bannerURL,
    genres,
    description,
    type,
    eps,
    seasonsNumber,
    seasons,
  };

  return animeDetails;
}
export async function getMovie(a: string) {
  const res = await fetch(`${baseURL}/movies/${a}`);
  const doc = parseHTML(await res.text());
  const p = doc.querySelector('.anime-card');
  const title = p?.querySelector('.image')?.getAttribute('title') || '';

  const movie: Movie = {
    title,
  };

  return movie;
}
