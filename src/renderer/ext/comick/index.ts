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
    /* 1. comic details */
    const detailsRes = await fetch(
      `https://api.comick.io/comic/${encodeURIComponent(slug)}`,
    );
    if (!detailsRes.ok)
      throw new Error(`Comic details HTTP ${detailsRes.status}`);

    const details = await detailsRes.json();
    const hid = details.comic?.hid;
    if (!hid) throw new Error('HID not found in response');

    /* 2. first (or only) batch of chapters */
    const limit = 500; // Comick’s hard max
    const chaptersRes = await fetch(
      `https://api.comick.io/comic/${hid}/chapters?lang=ar,en&limit=${limit}&page=1`,
    );
    if (!chaptersRes.ok) throw new Error(`Chapters HTTP ${chaptersRes.status}`);

    const chapterPayload = await chaptersRes.json();
    let chapters = chapterPayload.chapters ?? [];

    /* 3. fetch remaining pages if total > limit */
    const { total } = chapterPayload;
    let page = 2;
    while (chapters.length < total) {
      const res = await fetch(
        `https://api.comick.io/comic/${hid}/chapters?lang=ar,en&limit=${limit}&page=${page}`,
      );
      if (!res.ok) throw new Error(`Chapters page ${page} HTTP ${res.status}`);
      const extra = await res.json();
      chapters = chapters.concat(extra.chapters ?? []);
      page++;
    }

    return { details, chapters }; // ← real data, not a boolean
  } catch (err) {
    console.error('getDetailsComick error:', err);
    throw err; // bubble up for caller to handle
  }
};
