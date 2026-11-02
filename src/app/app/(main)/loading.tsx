export default function Loading() {
  return (
    <div className="space-y-3" aria-busy="true" aria-live="polite">
      <div className="h-8 w-1/2 animate-pulse rounded-xl bg-gray-200" />
      <div className="h-28 animate-pulse rounded-2xl bg-gray-200" />
      <div className="h-28 animate-pulse rounded-2xl bg-gray-200" />
    </div>
  );
}
