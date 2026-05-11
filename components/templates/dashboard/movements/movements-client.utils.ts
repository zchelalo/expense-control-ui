import type {
  MovementFilters,
  MovementListItem,
  SelectOption,
} from '@/components/templates/dashboard/movements/types'

export type MovementFilterFormValues = {
  accountId: string
  categoryId: string
  movementTypeId: string
  dateFrom: string
  dateTo: string
}

export function normalizeMovementFilterValue(value?: string | null) {
  return value ?? ''
}

export function buildMovementFilterFormValues(
  filters: MovementFilters,
): MovementFilterFormValues {
  return {
    accountId: normalizeMovementFilterValue(filters.accountId),
    categoryId: normalizeMovementFilterValue(filters.categoryId),
    movementTypeId: normalizeMovementFilterValue(filters.movementTypeId),
    dateFrom: normalizeMovementFilterValue(filters.dateFrom),
    dateTo: normalizeMovementFilterValue(filters.dateTo),
  }
}

export function withPlaceholderOption<TOption extends SelectOption>(
  placeholder: string,
  options: TOption[],
): SelectOption[] {
  return [
    {
      value: '',
      label: placeholder,
    },
    ...options,
  ]
}

export function isFirstMovementsPage(filters: MovementFilters) {
  return !filters.afterCursor && !filters.beforeCursor
}

function toLocalDateValue(value: string): string | null {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return null

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function movementMatchesCurrentFilters(
  movement: MovementListItem,
  filters: MovementFilters,
) {
  const matchesAccount =
    !filters.accountId || movement.accountId === filters.accountId
  const matchesCategory =
    !filters.categoryId || movement.categoryId === filters.categoryId
  const matchesMovementType =
    !filters.movementTypeId ||
    movement.movementTypeId === filters.movementTypeId
  const movementDate = toLocalDateValue(movement.createdAt)
  const matchesDateFrom =
    !filters.dateFrom ||
    (movementDate !== null && movementDate >= filters.dateFrom)
  const matchesDateTo =
    !filters.dateTo || (movementDate !== null && movementDate <= filters.dateTo)

  return (
    matchesAccount &&
    matchesCategory &&
    matchesMovementType &&
    matchesDateFrom &&
    matchesDateTo
  )
}
