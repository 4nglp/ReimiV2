// components/EpisodeCardSkeleton.tsx
export default function EpisodeCardSkeleton() {
  return (
    <div
      className="
        relative w-52 h-72
        rounded-lg overflow-hidden
        bg-gray-800 shadow-lg animate-pulse
      "
    >
      <div className="absolute inset-0 bg-gray-700" />
      <div className="absolute top-3 right-3 h-4 w-14 bg-gray-600 rounded" />
      <div className="absolute bottom-14 left-3 h-4 w-20 bg-gray-600 rounded" />
      <div className="absolute bottom-3 left-3 h-4 w-12 bg-gray-600 rounded" />
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-800 to-transparent" />
    </div>
  );
}
