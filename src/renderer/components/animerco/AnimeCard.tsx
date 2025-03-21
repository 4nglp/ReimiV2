function AnimeCard({
  s,
}: {
  s: {
    path: string;
    title: string;
    posterURL: string;
    releaseYear: string;
    type: string;
    rating: string;
  };
}) {
  return (
    <div className="relative bg-gray-800 text-white rounded-lg overflow-hidden w-60 shadow-lg">
      <div className="flex">
        <div className="p-4 flex flex-col justify-center flex-1">
          <h2 className="text-white font-bold text-base text-right mt-1 line-clamp-1">
            {s.title}
          </h2>
          <p className="text-sm text-gray-400 text-right">
            {s.releaseYear} • {s.type}
          </p>
          <div className="mt-2 bg-gray-700 text-xs px-2 py-1 w-[50px] rounded-md flex justify-center items-center self-end">
            <h1 className="text-center">{s.rating} ★</h1>
          </div>
        </div>
        <img
          src={s.posterURL}
          alt={s.title}
          className="w-24 h-36 object-cover rounded-r-lg flex-shrink-0"
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
}

export default AnimeCard;
