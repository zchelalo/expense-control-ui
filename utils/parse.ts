export type ErrorResponse = {
  code: string
  message: string
  details?: unknown
}

export async function parseApiError(
  res: Response,
): Promise<ErrorResponse | null> {
  const contentType = res.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) return null
  try {
    return (await res.json()) as ErrorResponse
  } catch {
    return null
  }
}
