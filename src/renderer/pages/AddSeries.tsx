import { useEffect, useState } from 'react';

function AddSeries() {
  const [ep, setEp] = useState<string | null>(null);
  const [res, setRes] = useState<{ embed_url: string } | null>(null);

  const test = async () => {
    try {
      const req = await fetch(
        'https://web.animerco.org/wp-admin/admin-ajax.php',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            Origin: 'https://web.animerco.org',
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
            Accept: '*/*',
            'Accept-Encoding': 'gzip, deflate, br, zstd',
            'Accept-Language': 'en-US,en;q=0.7',
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
            'X-Requested-With': 'XMLHttpRequest',
          },
          body: new URLSearchParams({
            action: 'player_ajax',
            post: '169333',
            nume: '10',
            type: 'tv',
          }),
        },
      );

      const data = await req.json();
      console.log(data);
      setRes(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    test();
  }, []);

  useEffect(() => {
    if (res && res.embed_url) {
      setEp(res.embed_url);
    }
  }, [res]);

  return (
    <div>
      <h1>pls work</h1>
      {ep && (
        <iframe
          src={ep}
          allowFullScreen
          title="Embedded Video"
          className="w-[1000px] h-[550px]"
        />
      )}
    </div>
  );
}

export default AddSeries;
