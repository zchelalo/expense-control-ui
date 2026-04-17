import 'server-only'

export function getApiUrl() {
  const apiUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL

  if (!apiUrl) {
    throw new Error('API_URL or NEXT_PUBLIC_API_URL must be configured')
  }

  return apiUrl
}
