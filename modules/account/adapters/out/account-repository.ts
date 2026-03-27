import {
  AccountEntity,
  type PaginatedResult,
} from '@/modules/account/domain/account-entity'
import type { AccountStore } from '@/modules/account/ports/account-store'
import { AccountError } from '@/modules/account/ports/errors'
import type {
  CreateResponse,
  DeleteResponse,
  FindAllResponse,
  FindByIdResponse,
  UpdateNameResponse,
} from '@/modules/account/ports/responses'
import { fetchWithAuth } from '@/utils/api'
import { type ErrorResponse, parseApiError } from '@/utils/parse'

function mapToAccountError(
  status: number,
  error: ErrorResponse | null,
): AccountError {
  if (status === 400) {
    throw new AccountError('account_store_error', error?.message)
  }

  if (status === 404) {
    throw new AccountError('account_not_found_error', error?.message)
  }

  if (status === 429) {
    throw new AccountError('too_many_requests_error', error?.message)
  }

  if (status >= 500) {
    throw new AccountError('account_store_error', error?.message)
  }

  throw new AccountError('unknown_error', error?.message)
}

export class AccountRepository implements AccountStore {
  async create(name: string, balance: number): Promise<AccountEntity> {
    try {
      const response = await fetchWithAuth(`/v1/account`, {
        method: 'POST',
        body: JSON.stringify({
          name,
          balance,
        }),
        cache: 'no-store',
      })

      if (!response.ok) {
        const error = await parseApiError(response)
        mapToAccountError(response.status, error)
      }

      const accountData: CreateResponse = await response.json()
      return new AccountEntity(
        accountData.data.account.id,
        accountData.data.account.name,
        accountData.data.account.balance,
        accountData.data.account.created_at,
        accountData.data.account.updated_at,
      )
    } catch (error) {
      if (error instanceof AccountError) throw error
      if (error instanceof Error && error.message === 'NEXT_REDIRECT')
        throw error
      throw new AccountError('network_error', (error as Error).message)
    }
  }

  async findAll(
    limit: number,
    afterCursor: string | null,
    beforeCursor: string | null,
    search: string | null,
  ): Promise<PaginatedResult> {
    try {
      const queryParams = new URLSearchParams({
        limit: limit.toString(),
      })

      if (afterCursor) queryParams.append('after_cursor', afterCursor)
      if (beforeCursor) queryParams.append('before_cursor', beforeCursor)
      if (search) queryParams.append('search', search)

      const response = await fetchWithAuth(
        `/v1/account?${queryParams.toString()}`,
        {
          cache: 'no-store',
        },
      )

      if (!response.ok) {
        const error = await parseApiError(response)
        mapToAccountError(response.status, error)
      }

      const accountsData: FindAllResponse = await response.json()
      return {
        items: accountsData.data.accounts.map(
          (account) =>
            new AccountEntity(
              account.id,
              account.name,
              account.balance,
              account.created_at,
              account.updated_at,
            ),
        ),
        nextCursor: accountsData.data.next_cursor || null,
        prevCursor: accountsData.data.prev_cursor || null,
      }
    } catch (error) {
      if (error instanceof AccountError) throw error
      if (error instanceof Error && error.message === 'NEXT_REDIRECT')
        throw error
      throw new AccountError('network_error', (error as Error).message)
    }
  }

  async findById(id: string): Promise<AccountEntity> {
    try {
      const response = await fetchWithAuth(`/v1/accounts/${id}`, {
        cache: 'no-store',
      })

      if (!response.ok) {
        const error = await parseApiError(response)
        mapToAccountError(response.status, error)
      }

      const accountData: FindByIdResponse = await response.json()
      return new AccountEntity(
        accountData.data.account.id,
        accountData.data.account.name,
        accountData.data.account.balance,
        accountData.data.account.created_at,
        accountData.data.account.updated_at,
      )
    } catch (error) {
      if (error instanceof AccountError) throw error
      if (error instanceof Error && error.message === 'NEXT_REDIRECT')
        throw error
      throw new AccountError('network_error', (error as Error).message)
    }
  }

  async updateName(id: string, name: string): Promise<AccountEntity> {
    try {
      const response = await fetchWithAuth(`/v1/account/${id}/name`, {
        method: 'PATCH',
        body: JSON.stringify({
          name,
        }),
        cache: 'no-store',
      })

      if (!response.ok) {
        const error = await parseApiError(response)
        mapToAccountError(response.status, error)
      }

      const accountData: UpdateNameResponse = await response.json()
      return new AccountEntity(
        accountData.data.account.id,
        accountData.data.account.name,
        accountData.data.account.balance,
        accountData.data.account.created_at,
        accountData.data.account.updated_at,
      )
    } catch (error) {
      if (error instanceof AccountError) throw error
      if (error instanceof Error && error.message === 'NEXT_REDIRECT')
        throw error
      throw new AccountError('network_error', (error as Error).message)
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const response = await fetchWithAuth(`/v1/account/${id}`, {
        method: 'DELETE',
        cache: 'no-store',
      })

      if (!response.ok) {
        const error = await parseApiError(response)
        mapToAccountError(response.status, error)
      }

      const accountData: DeleteResponse = await response.json()
      if (!accountData.data.success) {
        throw new AccountError(
          'account_delete_error',
          'Failed to delete account',
        )
      }
    } catch (error) {
      if (error instanceof AccountError) throw error
      if (error instanceof Error && error.message === 'NEXT_REDIRECT')
        throw error
      throw new AccountError('network_error', (error as Error).message)
    }
  }
}
