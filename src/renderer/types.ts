export type Entry = {
  ext: string;
  title: string;
  path: string;
  posterURL: string;
};
export type Chapter = {
  title: string;
  path: string;
  pages: string[];
  nextChapterPath?: string;
  prevChapterPath?: string;
};
export type mangaDetails = {
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
export type pinnedAnime = {
  ext: string;
  title: string;
  path: string;
  posterURL: string;
  season: string;
  status: string;
};
export type Episode = {
  ext: string;
  title: string;
  path: string;
  coverURL: string;
  season: string;
  episode: string;
};
export type EpisodeDetails = {
  type: string;
  post: string;
  nume: string;
  src: string;
};
export type Server = {
  nume: string;
  name: string;
};
export type Results = {
  title: string;
  path: string;
  posterURL: string;
};
