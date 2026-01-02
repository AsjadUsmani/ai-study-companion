/**
 * Renders a fixed bottom-right toast that displays the provided message.
 *
 * @returns A JSX element that renders a styled toast containing the given message.
 */
export default function Toast({ message }: {message: string}) {
  return (
    <div className="z-10 fixed bottom-6 right-6 bg-black text-white px-4 py-2 rounded-xl shadow-lg">
      {message}
    </div>
  )
}