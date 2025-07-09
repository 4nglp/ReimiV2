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
