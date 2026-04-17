'use server'

import { getLocale } from 'next-intl/server'
import { redirect } from '@/i18n/navigation'
import { AuthRepository } from '@/modules/auth/adapters/out/auth-repository'
import { LogoutUseCase } from '@/modules/auth/application/use-cases/logout'
import { logger } from '@/utils/logger'

/**
 * Server Action to handle the logout process.
 * It invalidates the session on the backend and clears local cookies.
 */
export async function logoutAction(): Promise<void> {
  const locale = await getLocale()

  const authRepository = new AuthRepository()
  const logoutUseCase = new LogoutUseCase(authRepository)

  try {
    // Inform the backend to invalidate the session
    await logoutUseCase.execute()
  } catch (error) {
    // We log the error but proceed to clear local state anyway, so the user is not "stuck" in a logged-in state if the backend is down
    logger.error('Logout: Backend invalidation failed', error)
  }
  redirect({
    href: '/login',
    locale,
  })
}
