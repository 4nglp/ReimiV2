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
export type Episode = {
  ext: string;
  title: string;
  path: string;
  coverURL: string;
  season: string;
  episode: string;
};
export type EpisodeDetails = {
  title: string;
  src: string;
};
export type animeDetails = {
  ext: string;
  title: string;
  studio: string;
  genres: string[];
  rating: string;
  description: string;
  posterURL: string;
  episodes: Episode[];
};
export type Results = {
  title: string;
  path: string;
  posterURL: string;
};
