type AccountQueryParams = {
  limit?: string | null
  afterCursor?: string | null
  beforeCursor?: string | null
  search?: string | null
}

function normalizeValue(value?: string | null): string | null {
  if (!value) return null

  const trimmedValue = value.trim()
  return trimmedValue.length > 0 ? trimmedValue : null
}

export function buildAccountsSearchParams({
  limit,
  afterCursor,
  beforeCursor,
  search,
}: AccountQueryParams): URLSearchParams {
  const params = new URLSearchParams()

  const normalizedLimit = normalizeValue(limit)
  const normalizedAfterCursor = normalizeValue(afterCursor)
  const normalizedBeforeCursor = normalizeValue(beforeCursor)
  const normalizedSearch = normalizeValue(search)

  if (normalizedLimit) params.set('limit', normalizedLimit)
  if (normalizedAfterCursor) params.set('afterCursor', normalizedAfterCursor)
  if (normalizedBeforeCursor) params.set('beforeCursor', normalizedBeforeCursor)
  if (normalizedSearch) params.set('search', normalizedSearch)

  return params
}

export function normalizeAccountSearch(search?: string | null): string {
  return normalizeValue(search) ?? ''
}
