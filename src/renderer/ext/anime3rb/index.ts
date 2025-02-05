import { Entry } from '../../types';

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
    const path = e.querySelector('a')?.getAttribute('href') || '';
    const posterURL = e.querySelector('img')?.getAttribute('src') || '';
    console.log(title, path, posterURL);
    if (title && path && posterURL) {
      entries.push({ ext, title, path, posterURL });
    }
  });
  return entries;
}

export const a = () => {};
