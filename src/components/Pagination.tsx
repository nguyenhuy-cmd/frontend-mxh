interface PaginationProps {
  current: number
  pages: number
  onChange: (page: number) => void
}

export function Pagination({ current, pages, onChange }: PaginationProps) {
  if (pages <= 1) return null

  const items: number[] = []
  const start = Math.max(1, current - 2)
  const end = Math.min(pages, current + 2)
  for (let i = start; i <= end; i++) items.push(i)

  return (
    <div className="pagination">
      <button
        type="button"
        className="btn btn-ghost"
        disabled={current <= 1}
        onClick={() => onChange(current - 1)}
      >
        ← Trước
      </button>
      {items.map((page) => (
        <button
          key={page}
          type="button"
          className={`btn btn-page${page === current ? ' active' : ''}`}
          onClick={() => onChange(page)}
        >
          {page}
        </button>
      ))}
      <button
        type="button"
        className="btn btn-ghost"
        disabled={current >= pages}
        onClick={() => onChange(current + 1)}
      >
        Sau →
      </button>
    </div>
  )
}
