import { getAuthSessionState } from '@/utils/session/server'

/**
 * Utility function to check if the user is authenticated based on the presence of auth cookies.
 */
export async function getAuthSession() {
  return getAuthSessionState()
}
