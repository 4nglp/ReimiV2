import { Pinned } from './types';

const baseURL = 'https://despair-manga.com/';
const ext = 'despair-manga';
const parser = new DOMParser();
const parseHTML = (html: string) => parser.parseFromString(html, 'text/html');

export async function getPinnedEntries() {
  const res = await fetch(`${baseURL}`);
  const doc = parseHTML(await res.text());
  const pinned: Pinned[] = [];

  doc.querySelectorAll('.bs .bsx').forEach((e) => {
    const title = e.querySelector('a')?.getAttribute('title') || '';
    const posterUrl = e.querySelector('.limit img')?.getAttribute('src') || '';
    const href = e.querySelector('a')?.getAttribute('href') || '';
    const path =
      href
        .split('/')
        .filter((segment) => segment)
        .pop() || '';
    if (title && path && posterUrl) {
      pinned.push({ title, path, posterUrl });
    }
  });
  return pinned;
}
export const a = 1;
