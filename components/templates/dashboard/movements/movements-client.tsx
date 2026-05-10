'use client'

import { useEffect, useId, useState, useTransition } from 'react'
import { FlexBox } from '@/components/atoms/flex-box'
import { CreateMovement } from '@/components/templates/dashboard/movements/create-movement'
import styles from '@/components/templates/dashboard/movements/movements.module.css'
import { MovementSelectField } from '@/components/templates/dashboard/movements/select-field'
import { SwipeableMovementsList } from '@/components/templates/dashboard/movements/swipeable-movements-list'
import type {
  CreateMovementTranslations,
  MovementFilters,
  MovementListItem,
  MovementTypeOption,
  SelectOption,
} from '@/components/templates/dashboard/movements/types'
import { useAsyncSelectOptions } from '@/hooks/use-async-select-options'
import { usePathname, useRouter } from '@/i18n/navigation'
import { searchAccountOptionsAction } from '@/modules/account/adapters/in/search-options-action'
import { searchCategoryOptionsAction } from '@/modules/category/adapters/in/search-options-action'
import { buildMovementsSearchParams } from '@/modules/movement/adapters/in/query-params'

type MovementsClientProps = {
  initialItems: MovementListItem[]
  emptyText: string
  deleteLabel: string
  createTranslations: CreateMovementTranslations
  accountId?: string | null
  accounts: SelectOption[]
  initialAccountNextCursor: string | null
  movementTypes: MovementTypeOption[]
  categories: SelectOption[]
  initialCategoryNextCursor: string | null
  limit: number
  currentFilters: MovementFilters
}

function movementMatchesCurrentFilters(
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

  return matchesAccount && matchesCategory && matchesMovementType
}

function withPlaceholderOption<TOption extends SelectOption>(
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

export function MovementsClient({
  initialItems,
  emptyText,
  deleteLabel,
  createTranslations,
  accountId = null,
  accounts,
  initialAccountNextCursor,
  movementTypes,
  categories,
  initialCategoryNextCursor,
  limit,
  currentFilters,
}: MovementsClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isFiltering, startFilteringTransition] = useTransition()
  const [movements, setMovements] = useState(initialItems)
  const movementTypeFilterId = useId()
  const accountFilterId = useId()
  const categoryFilterId = useId()
  const [selectedMovementTypeId, setSelectedMovementTypeId] = useState(
    currentFilters.movementTypeId ?? '',
  )
  const {
    options: accountFilterOptions,
    selectedValue: selectedAccountId,
    isLoadingMore: accountIsLoadingMore,
    hasMore: accountHasMore,
    setSearchText: setAccountSearchText,
    handleChange: selectAccountValue,
    handleLoadMore: handleAccountLoadMore,
    reset: resetAccountFilter,
  } = useAsyncSelectOptions({
    initialOptions: accounts,
    initialNextCursor: initialAccountNextCursor,
    initialValue: currentFilters.accountId,
    isOpen: true,
    searchOptions: searchAccountOptionsAction,
  })
  const {
    options: categoryFilterOptions,
    selectedValue: selectedCategoryId,
    isLoadingMore: categoryIsLoadingMore,
    hasMore: categoryHasMore,
    setSearchText: setCategorySearchText,
    handleChange: selectCategoryValue,
    handleLoadMore: handleCategoryLoadMore,
    reset: resetCategoryFilter,
  } = useAsyncSelectOptions({
    initialOptions: categories,
    initialNextCursor: initialCategoryNextCursor,
    initialValue: currentFilters.categoryId,
    isOpen: true,
    searchOptions: searchCategoryOptionsAction,
  })

  useEffect(() => {
    setMovements(initialItems)
  }, [initialItems])

  useEffect(() => {
    resetAccountFilter(currentFilters.accountId)
  }, [currentFilters.accountId, resetAccountFilter])

  useEffect(() => {
    resetCategoryFilter(currentFilters.categoryId)
  }, [currentFilters.categoryId, resetCategoryFilter])

  useEffect(() => {
    setSelectedMovementTypeId(currentFilters.movementTypeId ?? '')
  }, [currentFilters.movementTypeId])

  const navigateToFilters = ({
    accountId,
    categoryId,
    movementTypeId,
  }: {
    accountId: string
    categoryId: string
    movementTypeId: string
  }) => {
    const searchParams = buildMovementsSearchParams({
      limit: String(limit),
      accountId,
      categoryId,
      movementTypeId,
    })
    const href =
      searchParams.size > 0 ? `${pathname}?${searchParams}` : pathname

    startFilteringTransition(() => {
      router.push(href)
    })
  }

  const handleAccountFilterChange = (nextAccountId: string) => {
    selectAccountValue(nextAccountId)
    navigateToFilters({
      accountId: nextAccountId,
      categoryId: selectedCategoryId,
      movementTypeId: selectedMovementTypeId,
    })
  }

  const handleCategoryFilterChange = (nextCategoryId: string) => {
    selectCategoryValue(nextCategoryId)
    navigateToFilters({
      accountId: selectedAccountId,
      categoryId: nextCategoryId,
      movementTypeId: selectedMovementTypeId,
    })
  }

  const handleMovementTypeFilterChange = (nextMovementTypeId: string) => {
    setSelectedMovementTypeId(nextMovementTypeId)
    navigateToFilters({
      accountId: selectedAccountId,
      categoryId: selectedCategoryId,
      movementTypeId: nextMovementTypeId,
    })
  }

  const handleMovementCreated = (movement: MovementListItem) => {
    const isFirstPage =
      !currentFilters.afterCursor && !currentFilters.beforeCursor

    if (!isFirstPage) return
    if (!movementMatchesCurrentFilters(movement, currentFilters)) return

    setMovements((currentMovements) =>
      [
        movement,
        ...currentMovements.filter((item) => item.id !== movement.id),
      ].slice(0, limit),
    )
  }

  const handleMovementDeleted = (id: string) => {
    setMovements((currentMovements) =>
      currentMovements.filter((movement) => movement.id !== id),
    )
  }

  return (
    <FlexBox
      variant='div'
      direction='column'
      alignItems='start'
      justifyContent='center'
      gap={3}
      className={styles.body}
    >
      <CreateMovement
        translations={createTranslations}
        accountId={accountId}
        accounts={accounts}
        initialAccountNextCursor={initialAccountNextCursor}
        movementTypes={movementTypes}
        categories={categories}
        initialCategoryNextCursor={initialCategoryNextCursor}
        onMovementCreated={handleMovementCreated}
      />
      <div className={styles.filters}>
        <MovementSelectField
          id={accountFilterId}
          value={selectedAccountId}
          options={withPlaceholderOption(
            createTranslations.accountPlaceholder,
            accountFilterOptions,
          )}
          onChange={handleAccountFilterChange}
          placeholder={createTranslations.accountPlaceholder}
          disabled={isFiltering}
          searchable={{
            onSearchTextChange: setAccountSearchText,
            onLoadMore: handleAccountLoadMore,
            searchPlaceholder: createTranslations.searchAccountPlaceholder,
            hasMore: accountHasMore,
            isLoadingMore: accountIsLoadingMore,
          }}
          className={styles.filterField}
        />
        <MovementSelectField
          id={movementTypeFilterId}
          value={selectedMovementTypeId}
          options={withPlaceholderOption(
            createTranslations.movementTypePlaceholder,
            movementTypes,
          )}
          onChange={handleMovementTypeFilterChange}
          placeholder={createTranslations.movementTypePlaceholder}
          disabled={isFiltering}
          className={styles.filterField}
        />
        <MovementSelectField
          id={categoryFilterId}
          value={selectedCategoryId}
          options={withPlaceholderOption(
            createTranslations.categoryPlaceholder,
            categoryFilterOptions,
          )}
          onChange={handleCategoryFilterChange}
          placeholder={createTranslations.categoryPlaceholder}
          disabled={isFiltering}
          searchable={{
            onSearchTextChange: setCategorySearchText,
            onLoadMore: handleCategoryLoadMore,
            searchPlaceholder: createTranslations.searchCategoryPlaceholder,
            hasMore: categoryHasMore,
            isLoadingMore: categoryIsLoadingMore,
          }}
          className={styles.filterField}
        />
      </div>
      <SwipeableMovementsList
        items={movements}
        emptyText={emptyText}
        deleteLabel={deleteLabel}
        onDeleteSuccess={handleMovementDeleted}
      />
    </FlexBox>
  )
}
