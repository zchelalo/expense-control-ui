type MovementQueryParams = {
  limit?: string | null
  afterCursor?: string | null
  beforeCursor?: string | null
  accountId?: string | null
  categoryId?: string | null
  movementTypeId?: string | null
  dateFrom?: string | null
  dateTo?: string | null
  cursorStack?: string | null
}

function normalizeValue(value?: string | null): string | null {
  if (!value) return null

  const trimmedValue = value.trim()
  return trimmedValue.length > 0 ? trimmedValue : null
}

export function buildMovementsSearchParams({
  limit,
  afterCursor,
  beforeCursor,
  accountId,
  categoryId,
  movementTypeId,
  dateFrom,
  dateTo,
  cursorStack,
}: MovementQueryParams): URLSearchParams {
  const params = new URLSearchParams()

  const normalizedLimit = normalizeValue(limit)
  const normalizedAfterCursor = normalizeValue(afterCursor)
  const normalizedBeforeCursor = normalizeValue(beforeCursor)
  const normalizedAccountId = normalizeValue(accountId)
  const normalizedCategoryId = normalizeValue(categoryId)
  const normalizedMovementTypeId = normalizeValue(movementTypeId)
  const normalizedDateFrom = normalizeValue(dateFrom)
  const normalizedDateTo = normalizeValue(dateTo)
  const normalizedCursorStack = normalizeValue(cursorStack)

  if (normalizedLimit) params.set('limit', normalizedLimit)
  if (normalizedAfterCursor) params.set('afterCursor', normalizedAfterCursor)
  if (normalizedBeforeCursor) params.set('beforeCursor', normalizedBeforeCursor)
  if (normalizedAccountId) params.set('accountId', normalizedAccountId)
  if (normalizedCategoryId) params.set('categoryId', normalizedCategoryId)
  if (normalizedMovementTypeId)
    params.set('movementTypeId', normalizedMovementTypeId)
  if (normalizedDateFrom) params.set('dateFrom', normalizedDateFrom)
  if (normalizedDateTo) params.set('dateTo', normalizedDateTo)
  if (normalizedCursorStack) params.set('cursorStack', normalizedCursorStack)

  return params
}

export function parseCursorStack(cursorStack?: string | null): string[] {
  const normalizedCursorStack = normalizeValue(cursorStack)

  if (!normalizedCursorStack) return []

  return normalizedCursorStack
    .split(',')
    .map((cursor) => cursor.trim())
    .filter((cursor) => cursor.length > 0)
}

export function stringifyCursorStack(cursorStack: string[]): string | null {
  if (cursorStack.length === 0) return null

  return cursorStack.join(',')
}
