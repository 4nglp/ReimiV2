/* eslint-disable no-restricted-syntax */
import { Pinned, Latest } from './types';

const baseURL = 'https://despair-manga.com/';
const ext = 'despair';
const parser = new DOMParser();
const parseHTML = (html: string) => parser.parseFromString(html, 'text/html');

export async function getPinnedEntries() {
  const res = await fetch(`${baseURL}`);
  const doc = parseHTML(await res.text());
  const pinned: Pinned[] = [];

  doc.querySelectorAll('.popconslide .bs .bsx').forEach((e) => {
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

export async function getLatestUpdates(page = 1) {
  const res = await fetch(`${baseURL}all-manga/page/${page}`);
  const doc = parseHTML(await res.text());
  const entries: Latest[] = [];

  doc.querySelectorAll('.bsx').forEach((e) => {
    const title = e.querySelector('a')?.getAttribute('title') || '';
    const posterUrl = e.querySelector('img')?.getAttribute('src') || '';
    const href = e.querySelector('a')?.getAttribute('href') || '';
    const path =
      href
        .split('/')
        .filter((segment) => segment)
        .pop() || '';
    const latestChapter =
      e.querySelector('.epxs')?.textContent?.split(' ').pop() || '';
    if (title && path && posterUrl && latestChapter) {
      entries.push({ title, path, posterUrl, latestChapter });
    }
  });
  console.log(entries);

  return entries;
}
