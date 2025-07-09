import { useEffect } from 'react';

function Testing() {
  useEffect(() => {
    const d = async () => {
      try {
        const detailsRes = await fetch(
          `https://api.comick.io/comic/03-omniscient-reader-s-viewpoint`,
        );
        if (!detailsRes.ok)
          throw new Error(`Comic details error: ${detailsRes.status}`);
        const details = await detailsRes.json();
        console.log('API response:', details);
        const hid = details.comic?.hid;
        if (!hid) throw new Error('HID not found in response');
        console.log('HID:', hid);
        const chaptersRes = await fetch(
          `https://api.comick.io/comic/${hid}/chapters?lang=ar%2Cen&page=1`,
        );
        if (!chaptersRes.ok)
          throw new Error(`Chapters fetch error: ${chaptersRes.status}`);

        const chapters = await chaptersRes.json();
        console.log('Chapters:', chapters);
      } catch (err) {
        console.error('Error fetching comic data:', err);
      }
    };
    d();
  }, []);

  return <div>Testing Comic API...</div>;
}

export default Testing;
