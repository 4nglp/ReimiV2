import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getAnimes } from '../ext/animerco/index';
import { AnimesDetails } from '../ext/animerco/types';

export default function Animes() {
  const { a } = useParams();
  const [details, setDetails] = useState<AnimesDetails | null>(null);

  useEffect(() => {
    const getDetails = async () => {
      try {
        if (!a) return;
        const data: AnimesDetails = await getAnimes(a);
        setDetails(data);
      } catch (err) {
        console.error(err);
      }
    };
    getDetails();
  }, [a]);

  return (
    <div className="container">
      {details && (
        <>
          <h1>{details.title}</h1>
          <div>
            <img
              src={details.posterURL}
              alt={`${details.title} Poster`}
              style={{ maxWidth: '200px' }}
            />
          </div>
          <div>
            <img
              src={details.bannerURL}
              alt={`${details.title} Banner`}
              style={{ width: '100%', maxHeight: '300px', objectFit: 'cover' }}
            />
          </div>
          <div>
            <strong>Description:</strong>
            <p>{details.description}</p>
          </div>
          <div>
            <strong>Genres:</strong>
            <ul>
              {details.genres.map((genre) => (
                <li key={genre}>{genre}</li>
              ))}
            </ul>
          </div>
          <div>
            <p>
              <strong>Type:</strong> {details.type}
            </p>
            <p>
              <strong>Seasons:</strong>{' '}
              {details.seasons.length ? details.seasons.join(', ') : 'N/A'}
            </p>
            <p>
              <strong>Episodes:</strong> {details.eps}
            </p>
            <p>
              <strong>Seasons number:</strong>
              {details.seasonsNumber}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
