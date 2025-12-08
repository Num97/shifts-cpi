export function ErrorMessage({ text }: { text: string }) {
  return (
    <div className="flex justify-center py-10">
      <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg shadow">
        {text}
      </div>
    </div>
  )
}
