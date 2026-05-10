'use client'

import { SlidersHorizontal } from 'lucide-react'
import { useEffect, useState, useTransition } from 'react'
import { Button } from '@/components/atoms/button'
import { FlexBox } from '@/components/atoms/flex-box'
import { Modal } from '@/components/atoms/modal'
import { ModalContent } from '@/components/atoms/modal/modal-content'
import { CreateMovement } from '@/components/templates/dashboard/movements/create-movement'
import styles from '@/components/templates/dashboard/movements/movements.module.css'
import { MovementsFilters } from '@/components/templates/dashboard/movements/movements-filters'
import { SwipeableMovementsList } from '@/components/templates/dashboard/movements/swipeable-movements-list'
import type {
  CreateMovementTranslations,
  MovementFilters,
  MovementFilterTranslations,
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
  filterTranslations: MovementFilterTranslations
  accountId?: string | null
  accounts: SelectOption[]
  initialAccountNextCursor: string | null
  movementTypes: MovementTypeOption[]
  categories: SelectOption[]
  initialCategoryNextCursor: string | null
  limit: number
  currentFilters: MovementFilters
}

function toLocalDateValue(value: string): string | null {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return null

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
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
  filterTranslations,
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
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false)
  const [selectedMovementTypeId, setSelectedMovementTypeId] = useState(
    currentFilters.movementTypeId ?? '',
  )
  const [selectedDateFrom, setSelectedDateFrom] = useState(
    currentFilters.dateFrom ?? '',
  )
  const [selectedDateTo, setSelectedDateTo] = useState(
    currentFilters.dateTo ?? '',
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

  useEffect(() => {
    setSelectedDateFrom(currentFilters.dateFrom ?? '')
  }, [currentFilters.dateFrom])

  useEffect(() => {
    setSelectedDateTo(currentFilters.dateTo ?? '')
  }, [currentFilters.dateTo])

  const buildFiltersHref = ({
    accountId,
    categoryId,
    movementTypeId,
    dateFrom,
    dateTo,
  }: {
    accountId: string
    categoryId: string
    movementTypeId: string
    dateFrom: string
    dateTo: string
  }) => {
    const searchParams = buildMovementsSearchParams({
      limit: String(limit),
      accountId,
      categoryId,
      movementTypeId,
      dateFrom,
      dateTo,
    })

    return searchParams.size > 0 ? `${pathname}?${searchParams}` : pathname
  }

  const applyFilters = () => {
    const href = buildFiltersHref({
      accountId: selectedAccountId,
      categoryId: selectedCategoryId,
      movementTypeId: selectedMovementTypeId,
      dateFrom: selectedDateFrom,
      dateTo: selectedDateTo,
    })

    startFilteringTransition(() => {
      router.push(href)
    })
  }

  const resetFilters = () => {
    resetAccountFilter('')
    resetCategoryFilter('')
    setSelectedMovementTypeId('')
    setSelectedDateFrom('')
    setSelectedDateTo('')

    const href = buildFiltersHref({
      accountId: '',
      categoryId: '',
      movementTypeId: '',
      dateFrom: '',
      dateTo: '',
    })

    startFilteringTransition(() => {
      router.push(href)
    })
  }

  const handleDateFromChange = (nextDateFrom: string) => {
    setSelectedDateFrom(nextDateFrom)

    if (selectedDateTo && nextDateFrom && selectedDateTo < nextDateFrom) {
      setSelectedDateTo('')
    }
  }

  const handleDateToChange = (nextDateTo: string) => {
    setSelectedDateTo(nextDateTo)
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

  const accountSearchable = {
    onSearchTextChange: setAccountSearchText,
    onLoadMore: handleAccountLoadMore,
    searchPlaceholder: createTranslations.searchAccountPlaceholder,
    hasMore: accountHasMore,
    isLoadingMore: accountIsLoadingMore,
  }

  const categorySearchable = {
    onSearchTextChange: setCategorySearchText,
    onLoadMore: handleCategoryLoadMore,
    searchPlaceholder: createTranslations.searchCategoryPlaceholder,
    hasMore: categoryHasMore,
    isLoadingMore: categoryIsLoadingMore,
  }

  const accountOptions = withPlaceholderOption(
    createTranslations.accountPlaceholder,
    accountFilterOptions,
  )
  const movementTypeOptions = withPlaceholderOption(
    createTranslations.movementTypePlaceholder,
    movementTypes,
  )
  const categoryOptions = withPlaceholderOption(
    createTranslations.categoryPlaceholder,
    categoryFilterOptions,
  )

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
      <div className={styles.desktopFilters}>
        <MovementsFilters
          idPrefix='desktop'
          createTranslations={createTranslations}
          filterTranslations={filterTranslations}
          accountId={selectedAccountId}
          categoryId={selectedCategoryId}
          movementTypeId={selectedMovementTypeId}
          dateFrom={selectedDateFrom}
          dateTo={selectedDateTo}
          accountOptions={accountOptions}
          categoryOptions={categoryOptions}
          movementTypeOptions={movementTypeOptions}
          accountSearchable={accountSearchable}
          categorySearchable={categorySearchable}
          disabled={isFiltering}
          onAccountChange={selectAccountValue}
          onCategoryChange={selectCategoryValue}
          onMovementTypeChange={setSelectedMovementTypeId}
          onDateFromChange={handleDateFromChange}
          onDateToChange={handleDateToChange}
          onApply={applyFilters}
          onReset={resetFilters}
        />
      </div>
      <div className={styles.mobileFiltersBar}>
        <Button
          type='button'
          appearance='outlined'
          className={styles.mobileFiltersButton}
          onClick={() => setIsFiltersModalOpen(true)}
          disabled={isFiltering}
        >
          <SlidersHorizontal size={16} />
          {filterTranslations.open}
        </Button>
      </div>
      <Modal isOpen={isFiltersModalOpen}>
        <ModalContent
          title={filterTranslations.title}
          onClose={() => setIsFiltersModalOpen(false)}
        >
          <MovementsFilters
            idPrefix='mobile'
            createTranslations={createTranslations}
            filterTranslations={filterTranslations}
            accountId={selectedAccountId}
            categoryId={selectedCategoryId}
            movementTypeId={selectedMovementTypeId}
            dateFrom={selectedDateFrom}
            dateTo={selectedDateTo}
            accountOptions={accountOptions}
            categoryOptions={categoryOptions}
            movementTypeOptions={movementTypeOptions}
            accountSearchable={accountSearchable}
            categorySearchable={categorySearchable}
            disabled={isFiltering}
            onAccountChange={selectAccountValue}
            onCategoryChange={selectCategoryValue}
            onMovementTypeChange={setSelectedMovementTypeId}
            onDateFromChange={handleDateFromChange}
            onDateToChange={handleDateToChange}
            onApply={() => {
              setIsFiltersModalOpen(false)
              applyFilters()
            }}
            onReset={() => {
              setIsFiltersModalOpen(false)
              resetFilters()
            }}
          />
        </ModalContent>
      </Modal>
      <SwipeableMovementsList
        items={movements}
        emptyText={emptyText}
        deleteLabel={deleteLabel}
        onDeleteSuccess={handleMovementDeleted}
      />
    </FlexBox>
  )
}
