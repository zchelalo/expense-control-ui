'use client'

import { useEffect, useId, useState, useTransition } from 'react'
import { FlexBox } from '@/components/atoms/flex-box'
import { Label } from '@/components/atoms/label'
import { Select } from '@/components/molecules/select'
import { CreateMovement } from '@/components/templates/dashboard/movements/create-movement'
import styles from '@/components/templates/dashboard/movements/movements.module.css'
import { SwipeableMovementsList } from '@/components/templates/dashboard/movements/swipeable-movements-list'
import type {
  MovementListItem,
  MovementTypeOption,
  SelectOption,
} from '@/components/templates/dashboard/movements/types'
import { useAsyncSelectOptions } from '@/hooks/use-async-select-options'
import { usePathname, useRouter } from '@/i18n/navigation'
import { searchAccountOptionsAction } from '@/modules/account/adapters/in/search-options-action'
import { searchCategoryOptionsAction } from '@/modules/category/adapters/in/search-options-action'
import { buildMovementsSearchParams } from '@/modules/movement/adapters/in/query-params'

type CreateMovementTranslations = {
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

type CurrentFilters = {
  accountId?: string | null
  categoryId?: string | null
  movementTypeId?: string | null
  afterCursor?: string | null
  beforeCursor?: string | null
}

type MovementFilterFieldProps = {
  id: string
  label?: string
  value: string
  options: SelectOption[]
  placeholder: string
  disabled?: boolean
  onChange: (value: string) => void
  searchable?: {
    onSearchTextChange: (value: string) => void
    onLoadMore: () => void
    searchPlaceholder: string
    hasMore: boolean
    isLoadingMore: boolean
  }
}

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
  currentFilters: CurrentFilters
}

function MovementFilterField({
  id,
  label,
  value,
  options,
  placeholder,
  disabled = false,
  onChange,
  searchable,
}: MovementFilterFieldProps) {
  return (
    <FlexBox
      variant='div'
      direction='column'
      alignItems='stretch'
      gap={2}
      className={styles.filterField}
    >
      {label && <Label htmlFor={id}>{label}</Label>}
      <Select
        id={id}
        options={options}
        value={value}
        onChange={onChange}
        onSearchTextChange={searchable?.onSearchTextChange}
        onLoadMore={searchable?.onLoadMore}
        placeholder={placeholder}
        searchInput={!!searchable}
        searchPlaceholder={searchable?.searchPlaceholder}
        hasMore={searchable?.hasMore ?? false}
        isLoadingMore={searchable?.isLoadingMore ?? false}
        disabled={disabled}
      />
    </FlexBox>
  )
}

function movementMatchesCurrentFilters(
  movement: MovementListItem,
  filters: CurrentFilters,
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
        <MovementFilterField
          id={accountFilterId}
          value={selectedAccountId}
          options={[
            {
              value: '',
              label: createTranslations.accountPlaceholder,
            },
            ...accountFilterOptions,
          ]}
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
        />
        <MovementFilterField
          id={movementTypeFilterId}
          value={selectedMovementTypeId}
          options={[
            {
              value: '',
              label: createTranslations.movementTypePlaceholder,
            },
            ...movementTypes,
          ]}
          onChange={handleMovementTypeFilterChange}
          placeholder={createTranslations.movementTypePlaceholder}
          disabled={isFiltering}
        />
        <MovementFilterField
          id={categoryFilterId}
          value={selectedCategoryId}
          options={[
            {
              value: '',
              label: createTranslations.categoryPlaceholder,
            },
            ...categoryFilterOptions,
          ]}
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
