import { useEffect } from 'react';

function Testing() {
  useEffect(() => {
    const d = async () => {
      const req = await fetch(
        'https://api.comick.fun/chapter/hbF_vkeo?tachiyomi=true',
      );
      const res = await req.json();
      console.log('API response:', res);
    };
    d();
  }, []);

  return <div>Testing Comic API...</div>;
}

export default Testing;
