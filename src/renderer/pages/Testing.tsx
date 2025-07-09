import { useEffect } from 'react';

function Testing() {
  useEffect(() => {
    const d = async () => {
      const req = await fetch(
        'https://api.comick.io/v1.0/search?q=chainsaw+man&limit=49&page=1',
      );
      const res = await req.json();
      console.log('API response:', res);
    };
    d();
  }, []);

  return <div>Testing Comic API...</div>;
}

export default Testing;
