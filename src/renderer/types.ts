export type Entry = {
  ext: string;
  title: string;
  path: string;
  posterURL: string;
};
export type Chapter = {
  title: string;
  path: string;
};
export type Details = {
  ext: string;
  title: string;
  description: string;
  genres: string[];
  author: string;
  artist: string;
  pubYear: string;
  posterURL: string;
  chapters: Chapter[];
};