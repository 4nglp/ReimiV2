import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getMovie } from '../ext/animerco/index';
import { Movie } from '../ext/animerco/types';

export default function Movies() {
  const { a } = useParams();
  const [details, setDetails] = useState<Movie | null>(null);

  useEffect(() => {
    const getDetails = async () => {
      try {
        if (!a) return;
        const data: Movie = await getMovie(a);
        setDetails(data);
      } catch (err) {
        console.error(err);
      }
    };
    getDetails();
  }, [a]);

  return <h1>{details ? details.title : 'Loading...'}</h1>;
}
