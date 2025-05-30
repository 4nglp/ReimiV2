/* eslint-disable no-restricted-syntax */
import { Pinned, Latest } from './types';

const baseURL = 'https://despair-manga.com/';
const ext = 'despair-manga';
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

export async function getLatestUpdates() {
  const res = await fetch(`${baseURL}`);
  const doc = parseHTML(await res.text());
  const latest: Latest[] = [];

  doc.querySelectorAll('.bsx').forEach((e) => {
    const title = e.querySelector('a')?.getAttribute('title') || '';
    const posterUrl = e.querySelector('.limit img')?.getAttribute('src') || '';
    const href = e.querySelector('a')?.getAttribute('href') || '';
    const path =
      href
        .split('/')
        .filter((segment) => segment)
        .pop() || '';
    const chapterSelectors = [
      '.bigor ul.chfiv a span.fivchap',
      '.bigor .chfiv span.fivchap',
      '.chfiv span.fivchap',
      'span.fivchap',
      '.fivchap',
    ];

    let latestChapter = '';
    for (const selector of chapterSelectors) {
      const element = e.querySelector(selector);
      if (element) {
        latestChapter = element.textContent || '';
        break;
      }
    }
    if (title && path && posterUrl && latestChapter) {
      latest.push({ title, path, posterUrl, latestChapter });
    }
  });

  return latest;
}
