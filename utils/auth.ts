import { cookies } from 'next/headers'
import { Auth } from '@/constants/auth'

/**
 * Utility function to check if the user is authenticated based on the presence of auth cookies.
 */
export async function getAuthSession() {
  const cookieStore = await cookies()
  const hasAccessToken = cookieStore.has(Auth.AccessToken)
  const hasRefreshToken = cookieStore.has(Auth.RefreshToken)

  return {
    isAuthenticated: hasAccessToken || hasRefreshToken,
  }
}
