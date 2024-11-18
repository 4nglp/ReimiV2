import { Entry } from '../../types';

const baseURL = 'https://lekmanga.net/';
const ext = 'lekmanga';
const parser = new DOMParser();
const parseHTML = (html: string) => parser.parseFromString(html, 'text/html');

export default async function getEntries() {
  const res = await fetch(`${baseURL}`);
  const doc = parseHTML(await res.text());
  const entries: Entry[] = [];

  const elements = doc.querySelectorAll('.page-item-detail.manga');

  elements.forEach((e) => {
    const linkEl = e.querySelector('.item-thumb.c-image-hover a');
    const imgEl = e.querySelector('.item-thumb.c-image-hover img');

    if (linkEl && imgEl) {
      const title = linkEl.getAttribute('title') || 'Untitled';
      const path = new URL(linkEl.getAttribute('href') || '', baseURL).pathname; // Ensure path is relative
      const posterURL = imgEl.getAttribute('src') || '';

      if (title && path && posterURL) {
        entries.push({ ext, title, path, posterURL });
      }
    }
  });

  return entries;
}
