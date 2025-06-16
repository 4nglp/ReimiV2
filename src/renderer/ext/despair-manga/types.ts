export type Pinned = {
  title: string;
  posterUrl: string;
  path: string;
};

export type Latest = {
  title: string;
  posterUrl: string;
  path: string;
  latestChapter: string;
};

export type Chapter = {
  title: string;
  path: string;
};

export type Details = {
  title: string;
  posterURL: string;
  description: string;
  genres: string[];
  chapters: Chapter[];
};
