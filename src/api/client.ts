const BASE: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '/api'

const TOKEN_KEY = 'mxh_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

interface Envelope<T> {
  statusCode: number
  message?: string | string[]
  data: T
}

function extractMessage(body: unknown, status: number): string {
  if (body && typeof body === 'object') {
    const b = body as { message?: unknown; error?: unknown }
    if (Array.isArray(b.message)) return b.message.join('\n')
    if (typeof b.message === 'string' && b.message.trim()) return b.message
    if (typeof b.error === 'string' && b.error.trim()) return b.error
  }
  return `Đã xảy ra lỗi (${status})`
}

export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers)
  if (!headers.has('Content-Type') && options.body !== undefined) {
    headers.set('Content-Type', 'application/json')
  }
  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let res: Response
  try {
    res = await fetch(`${BASE}${path}`, { ...options, headers })
  } catch {
    throw new ApiError('Không thể kết nối đến máy chủ', 0)
  }

  let body: unknown = null
  try {
    body = await res.json()
  } catch {
    body = null
  }

  if (!res.ok) {
    if (res.status === 401) {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'))
    }
    throw new ApiError(extractMessage(body, res.status), res.status)
  }

  const envelope = body as Envelope<T> | null
  return envelope && typeof envelope === 'object' && 'data' in envelope
    ? envelope.data
    : (body as T)
}

export function buildQuery(
  params: Record<string, string | number | undefined>,
): string {
  const sp = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === '') continue
    sp.set(key, String(value))
  }
  const qs = sp.toString()
  return qs ? `?${qs}` : ''
}
