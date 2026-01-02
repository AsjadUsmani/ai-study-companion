/**
 * Renders a pulsing card-style skeleton placeholder for a note.
 *
 * @returns A JSX element containing stacked placeholder bars representing a note's title and content
 */
export default function NoteSkeleton() {
  return (
    <div className="animate-pulse bg-neutral-900/40 border border-white/5 rounded-2xl p-6 space-y-4">
      <div className="h-5 w-1/3 bg-neutral-700 rounded" />
      <div className="h-3 w-1/2 bg-neutral-800 rounded" />
      <div className="space-y-2">
        <div className="h-3 w-full bg-neutral-800 rounded" />
        <div className="h-3 w-5/6 bg-neutral-800 rounded" />
      </div>
    </div>
  )
}