export function Loading({ text = "Загрузка..." }: { text?: string }) {
  return (
    <div className="flex justify-center py-10">
      <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
        <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-400 border-t-transparent" />
        <span className="text-lg">{text}</span>
      </div>
    </div>
  )
}
