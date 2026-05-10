import {
  buildMovementsSearchParams,
  stringifyCursorStack,
} from '@/modules/movement/adapters/in/query-params'

type BuildMovementsPaginationLinksParams = {
  limit: string
  currentCursorStack: string[]
  nextCursor: string | null
  accountId?: string | null
  categoryId?: string | null
  movementTypeId?: string | null
}

export function buildMovementsPaginationLinks({
  limit,
  currentCursorStack,
  nextCursor,
  accountId,
  categoryId,
  movementTypeId,
}: BuildMovementsPaginationLinksParams) {
  const previousCursorStack = currentCursorStack.slice(0, -1)
  const previousAfterCursor =
    previousCursorStack.length > 0
      ? previousCursorStack[previousCursorStack.length - 1]
      : null

  const previousHref =
    currentCursorStack.length > 0
      ? `/movements?${buildMovementsSearchParams({
          limit,
          afterCursor: previousAfterCursor,
          accountId,
          categoryId,
          movementTypeId,
          cursorStack: stringifyCursorStack(previousCursorStack),
        }).toString()}`
      : null

  const nextCursorStack = nextCursor ? [...currentCursorStack, nextCursor] : []

  const nextHref = nextCursor
    ? `/movements?${buildMovementsSearchParams({
        limit,
        afterCursor: nextCursor,
        accountId,
        categoryId,
        movementTypeId,
        cursorStack: stringifyCursorStack(nextCursorStack),
      }).toString()}`
    : null

  return { previousHref, nextHref }
}
