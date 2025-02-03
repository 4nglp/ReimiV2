import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { LuArrowDownUp } from 'react-icons/lu';
import { getDetails3asq } from '../ext/3asq/index';
import { getDetailsLek } from '../ext/lekmanga/index';
import { Details, Chapter } from '../types';

function EntryDetails(): React.JSX.Element {
  const { title, source } = useParams<{
    title: string;
    source: '3asq' | 'lekmanga';
  }>();
  const location = useLocation();
  const [entryDetails, setEntryDetails] = useState<Details | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reverseOrder, setReverseOrder] = useState<boolean>(false);

  async function fetchAniListData(searchTitle: string) {
    const query = `
      query ($title: String) {
        Media (search: $title, type: MANGA) {
          bannerImage
          chapters
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
      totalChapters: data.data.Media?.chapters || 'Unknown',
    };
  }

  useEffect(() => {
    const fetchDetails = async () => {
      if (!title || !source) {
        setError('Title or source not found');
        setLoading(false);
        return;
      }

      try {
        let details: Details | null = null;
        if (source === '3asq') {
          details = await getDetails3asq(title);
        } else if (source === 'lekmanga') {
          details = await getDetailsLek(title);
        }
        if (details) {
          const aniListData = await fetchAniListData(title);
          setEntryDetails(details);
          setBanner(aniListData.bannerImage);
        } else {
          setError('Failed to fetch manga details');
        }
      } catch (err) {
        setError('Failed to fetch entry details');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [title, source]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setReverseOrder(params.get('reverse') === 'true');
  }, [location.search]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!entryDetails) return <p>No details available</p>;

  const mangaTitle = title || 'default-manga-title';
  const chapters = reverseOrder
    ? [...entryDetails.chapters].reverse()
    : entryDetails.chapters;

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
            <h3
              className="text-lg font-bold mt-1"
              style={{ fontFamily: 'Amiri' }}
            >
              {entryDetails.author || 'لا كاتب متوفر'} |{' '}
              {entryDetails.pubYear || 'سنة النشر غير متوفرة'}
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
            <h3
              className="text-lg text-white-200 font-bold mt-1"
              style={{ fontFamily: 'Amiri' }}
            >
              مجموع الفصول: {entryDetails.chapters.length}
            </h3>
          </div>
          <div className="w-[150px] h-[225px] sm:w-[200px] sm:h-[300px]">
            {entryDetails.posterURL && (
              <img
                src={entryDetails.posterURL}
                alt={`Cover for ${entryDetails.title}`}
                className="w-full h-full object-cover rounded-md"
              />
            )}
          </div>
        </div>
      </div>
      <div className="container mx-auto p-4">
        <div className="mt-2">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            Chapters{' '}
            <Link
              to={{
                pathname: location.pathname,
                search: `?reverse=${!reverseOrder}`,
              }}
            >
              <LuArrowDownUp className="ml-2 text-xl" />
            </Link>
          </h2>
          <div>
            {chapters.length > 0 ? (
              <ul className="grid grid-cols-4 gap-4">
                {chapters.map((chapter: Chapter) => (
                  <li key={chapter.path} className="mb-2">
                    <Link
                      to={`/manga/${encodeURIComponent(mangaTitle)}/chapter/${encodeURIComponent(chapter.path)}`}
                      className="flex items-center justify-between p-2 rounded-md group hover:bg-gray-800 transition w-full"
                    >
                      <span
                        className="w-full text-left"
                        style={{ fontFamily: 'Amiri' }}
                      >
                        {chapter.title}
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

export default EntryDetails;
