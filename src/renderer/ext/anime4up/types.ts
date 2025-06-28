export type PinnedAnime = {
  ext: string;
  title: string;
  path: string;
  posterURL: string;
  season: string;
  status: string;
};

export type LatestEpisode = {
  ext: string;
  title: string;
  path: string;
  coverURL: string;
  status: string;
  type: string;
  episode: string;
};

export type Episode = {
  title: string;
  path: string;
  coverURL: string;
};

export type AnimeDetails = {
  title: string;
  posterURL: string;
  genres: string[];
  description: string;
  status: string;
  episodes: Episode[];
};

export type SearchResults = {
  title: string;
  path: string;
  posterURL: string;
  type: string;
  status: string;
};

export type EpisodeControls = {
  title: string;
  next: string;
  prev: string;
  back: string;
};
