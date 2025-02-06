import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getDetails } from '../ext/anime3rb';
import { animeDetails, Episode } from '../types';

function Details(): React.JSX.Element {
  const { t } = useParams() as { t?: string };
  const [entryDetails, setEntryDetails] = useState<animeDetails | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [poster, setPoster] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchAniListData(searchTitle: string) {
    const query = `
      query ($title: String) {
        Media (search: $title, type: ANIME) {
          bannerImage
          coverImage {
            large
          }
        }
      }
    `;
    const variables = { title: searchTitle };
    const url = 'https://graphql.anilist.co';
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    };
    const res = await fetch(url, options);
    const data = await res.json();
    return {
      bannerImage: data.data.Media?.bannerImage || null,
      posterImage: data.data.Media?.coverImage?.large || null,
    };
  }

  useEffect(() => {
    const fetchDetails = async () => {
      if (!t) {
        setError('Title or source not found');
        setLoading(false);
        return;
      }

      try {
        const details = await getDetails(t);
        const aniListData = await fetchAniListData(t);

        setEntryDetails(details);
        setBanner(aniListData.bannerImage);
        setPoster(aniListData.posterImage || details.posterURL); // Use AniList poster if available
      } catch (err) {
        setError('Failed to fetch entry details');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [t]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!entryDetails) return <p>No details available</p>;

  return (
    <>
      <div className="relative w-full h-[400px] bg-cover bg-center">
        {banner && (
          <img
            src={banner}
            alt="Banner"
            className="w-full h-[400px] object-cover opacity-85"
          />
        )}
        <div className="absolute inset-0 flex items-center justify-between p-6 bg-gradient-to-t from-black to-transparent">
          <div className="flex-1 ml-4 text-white text-right pr-5">
            <h1 className="text-5xl font-bold">{entryDetails.title}</h1>
            <p
              className="text-lg mt-2"
              style={{ fontFamily: 'Amiri' }}
              dir="rtl"
            >
              {entryDetails.description || 'لا وصف متوفر'}
            </p>
            <h3 className="text-lg font-bold mt-1">
              {entryDetails.studio || 'لا استوديو متوفر '} ~{' '}
              {entryDetails.rating || 'لا تقييم متوفر'}
            </h3>
            <div className="flex justify-end flex-wrap gap-2 pt-2">
              {entryDetails.genres.map((genre) => (
                <div
                  key={genre}
                  className="bg-black bg-opacity-50 text-lg rounded-lg px-3"
                  style={{ fontFamily: 'Amiri' }}
                >
                  {genre}
                </div>
              ))}
            </div>
          </div>
          <div className="w-[200px] h-[300px]">
            {poster && (
              <img
                src={poster}
                alt={`Cover for ${entryDetails.title}`}
                className="w-full h-full object-cover rounded-md"
              />
            )}
          </div>
        </div>
      </div>
      <div className="container mx-auto p4">
        <div className="mt-2">
          <h2
            className="text-2xl font-bold mb-4 flex items-center justify-end"
            style={{ fontFamily: 'Amiri' }}
          >
            الحلقات
          </h2>
          <div dir="rtl">
            {entryDetails.episodes.length > 0 ? (
              <ul className="grid grid-cols-4 gap-4">
                {entryDetails.episodes.map((episode: Episode) => (
                  <li key={episode.path} className="mb-2">
                    <Link
                      to={`/anime/${entryDetails.title}/episode/${encodeURIComponent(episode.path)}/`}
                      className="flex items-center justify-between p-2 rounded-md group hover:bg-gray-800 transition w-full"
                    >
                      <span
                        className="w-full text-xl text-right"
                        style={{ fontFamily: 'Amiri' }}
                      >
                        {episode.title}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p dir="rtl">لا فصول متوفرة لهذا العمل.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Details;
