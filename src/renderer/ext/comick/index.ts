/* eslint-disable no-await-in-loop */
export const getPinned = async () => {
  const req = await fetch('https://api.comick.io/top');
  if (!req.ok) throw new Error(`HTTP error! status: ${req.status}`);
  const res = await req.json();
  console.log('API response:', res);
  return res;
};

export const getLatestUpdates = async (page = 1) => {
  const req = await fetch(
    `https://api.comick.io/chapter?lang=ar&lang=en&page=${page}&device-memory=8&order=new`,
  );
  if (!req.ok) throw new Error(`HTTP error! status: ${req.status}`);
  const res = await req.json();
  console.log('API response:', res);
  return res;
};

export const getDetailsComick = async (slug: string) => {
  try {
    const detailsRes = await fetch(
      `https://api.comick.io/comic/${encodeURIComponent(slug)}`,
    );
    if (!detailsRes.ok)
      throw new Error(`Comic details HTTP ${detailsRes.status}`);
    const details = await detailsRes.json();
    const hid = details.comic?.hid;
    if (!hid) throw new Error('HID not found in response');
    const limit = 500;
    const chaptersRes = await fetch(
      `https://api.comick.io/comic/${hid}/chapters?lang=ar,en&limit=${limit}&page=1`,
    );
    if (!chaptersRes.ok) throw new Error(`Chapters HTTP ${chaptersRes.status}`);
    const chapterPayload = await chaptersRes.json();
    let chapters = chapterPayload.chapters ?? [];
    const { total } = chapterPayload;
    let page = 2;
    while (chapters.length < total) {
      const res = await fetch(
        `https://api.comick.io/comic/${hid}/chapters?lang=ar,en&limit=${limit}&page=${page}`,
      );
      if (!res.ok) throw new Error(`Chapters page ${page} HTTP ${res.status}`);
      const extra = await res.json();
      chapters = chapters.concat(extra.chapters ?? []);
      // eslint-disable-next-line no-plusplus
      page++;
    }

    return { details, chapters };
  } catch (err) {
    console.error('getDetailsComick error:', err);
    throw err;
  }
};
