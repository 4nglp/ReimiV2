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
export type EpisodeDetails = {
  type: string;
  post: string;
  nume: string;
  src: string;
};
export type WatchDetails = {
  epTitle: string;
  prevEp: string;
  nextEp: string;
  seasons: string;
};
export type EpisodesList = {
  title: string;
  path: string;
};
export type Server = {
  nume: string;
  name: string;
};
export type SearchResults = {
  title: string;
  path: string;
  posterURL: string;
  releaseYear: string;
  type: string;
  rating: string;
};
export type EpisodeControls = {
  epTitle: string;
  previousEp: string;
  backToDetails: string;
  nextEp: string;
};

export type Movie = {
  title: string;
  posterURL: string;
  description: string;
  genres: string[];
};
export type M = {
  type: string;
  post: string;
  nume: string;
  src: string;
};
export type Ep = {
  title: string;
  coverURL: string;
  path: string;
};
export type SeasonDetails = {
  title: string;
  posterURL: string;
  bannerURL: string;
  genres: string[];
  description: string;
  status: string;
  eps: Ep[];
};
