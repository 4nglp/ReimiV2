/* eslint-disable no-restricted-syntax */
import { Pinned, Latest, Chapter, Details } from './types';
import { Results } from '../3asq/types';

const baseURL = 'https://despair-manga.com/';
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
  return entries;
}

export async function getDetailsDespair(m: string): Promise<Details> {
  const d = `${baseURL}manga/${m}/`;
  const res = await fetch(d);
  const doc = parseHTML(await res.text());

  const title = doc.querySelector('h1.entry-title')?.textContent?.trim() || '';
  const posterURL =
    doc.querySelector('img.wp-post-image')?.getAttribute('src') || '';
  console.log(posterURL);
  const description =
    doc.querySelector('.entry-content-single p')?.textContent?.trim() || '';
  const genres = Array.from(doc.querySelectorAll('.mgen a')).map(
    (a) => a.textContent?.trim() || '',
  );
  const chapters: Chapter[] = [];
  const chapterElements = doc.querySelectorAll('.eph-num a');
  chapterElements.forEach((e) => {
    const chapterTitle =
      e.querySelector('span.chapternum')?.textContent?.trim() || '';
    const chapterFullPath = e.getAttribute('href') || '';
    const chapterPath = chapterFullPath.split('/').filter(Boolean).pop() || '';

    if (chapterTitle && chapterPath) {
      chapters.push({ title: chapterTitle, path: chapterPath });
    }
  });
  chapters.shift();
  // to remove the first element of the array unwanted data
  const details: Details = {
    title,
    description,
    posterURL,
    chapters,
    genres,
  };
  return details;
}

export async function getChapter(n: string) {
  const res = await fetch(`${baseURL}/${n}`);
  const html = await res.text();
  const doc = parseHTML(html);
  const title = doc.querySelector('h1.entry-title')?.textContent?.trim() || '';
  const scriptTag = html.match(/ts_reader\.run\((\{.*?\})\);/s);
  let pages: string[] = [];
  if (scriptTag) {
    try {
      const jsonString = scriptTag[1];
      const readerData = JSON.parse(jsonString);
      const source = readerData.sources?.[0];
      if (source && Array.isArray(source.images)) {
        pages = source.images.map((img: string) => img.trim());
      }
    } catch (err) {
      console.error('Error parsing ts_reader JSON:', err);
    }
  }
  return {
    title,
    pages,
  };
}

export async function getSearchResults(query: string) {
  const res = await fetch(`${baseURL}?s=${query}`);
  const doc = parseHTML(await res.text());
  const results: Results[] = [];
  doc.querySelectorAll('.bsx').forEach((e) => {
    const title = e.querySelector('a')?.getAttribute('title') || '';
    const posterUrl = e.querySelector('img')?.getAttribute('src') || '';
    const href = e.querySelector('a')?.getAttribute('href') || '';
    const path =
      href
        .split('/')
        .filter((segment) => segment)
        .pop() || '';
    if (title && path && posterUrl) {
      results.push({ title, path, posterUrl });
    }
  });
  return results;
}
