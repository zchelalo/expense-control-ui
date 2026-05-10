export type MovementListItem = {
  id: string
  accountId: string
  accountName: string
  description: string
  categoryId: string
  categoryName: string
  createdAt: string
  movementTypeId: string
  movementTypeKey: string
  movementTypeText: string
  amount: string
}

export type SelectOption = {
  value: string
  label: string
}

export type MovementTypeOption = SelectOption & {
  key: string
}

export type SearchableSelectProps = {
  onSearchTextChange: (value: string) => void
  onLoadMore: () => void
  searchPlaceholder: string
  hasMore: boolean
  isLoadingMore: boolean
}

export type CreateMovementTranslations = {
  newMovement: string
  accountLabel: string
  accountPlaceholder: string
  amountLabel: string
  amountPlaceholder: string
  descriptionLabel: string
  descriptionPlaceholder: string
  movementTypeLabel: string
  movementTypePlaceholder: string
  categoryLabel: string
  categoryPlaceholder: string
  searchAccountPlaceholder: string
  searchCategoryPlaceholder: string
  createMovement: string
  creatingMovement: string
}

export type MovementFilterTranslations = {
  title: string
  open: string
  apply: string
  reset: string
  dateFromLabel: string
  dateToLabel: string
}

export type MovementFilters = {
  accountId?: string | null
  categoryId?: string | null
  movementTypeId?: string | null
  dateFrom?: string | null
  dateTo?: string | null
  afterCursor?: string | null
  beforeCursor?: string | null
}
