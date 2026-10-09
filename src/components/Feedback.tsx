export function Spinner({ label = 'Đang tải...' }: { label?: string }) {
  return (
    <div className="loading" role="status">
      <span className="spinner" />
      {label}
    </div>
  )
}

export function EmptyState({ message }: { message: string }) {
  return <div className="empty-state">{message}</div>
}

export function ErrorBox({ message }: { message: string }) {
  if (!message) return null
  return (
    <div className="error-box" role="alert">
      {message}
    </div>
  )
}
