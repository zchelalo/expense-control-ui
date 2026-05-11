'use client'

import { useEffect, useState, useTransition } from 'react'
import {
  buildMovementFilterFormValues,
  type MovementFilterFormValues,
  normalizeMovementFilterValue,
  withPlaceholderOption,
} from '@/components/templates/dashboard/movements/movements-client.utils'
import type {
  CreateMovementTranslations,
  MovementFilters,
  MovementTypeOption,
  SearchableSelectProps,
  SelectOption,
} from '@/components/templates/dashboard/movements/types'
import { useAsyncSelectOptions } from '@/hooks/use-async-select-options'
import { usePathname, useRouter } from '@/i18n/navigation'
import { searchAccountOptionsAction } from '@/modules/account/adapters/in/search-options-action'
import { searchCategoryOptionsAction } from '@/modules/category/adapters/in/search-options-action'
import { buildMovementsSearchParams } from '@/modules/movement/adapters/in/query-params'

type UseMovementsFiltersParams = {
  accounts: SelectOption[]
  initialAccountNextCursor: string | null
  movementTypes: MovementTypeOption[]
  categories: SelectOption[]
  initialCategoryNextCursor: string | null
  limit: number
  createTranslations: CreateMovementTranslations
  currentFilters: MovementFilters
}

type UseMovementsFiltersResult = {
  isFiltering: boolean
  filterValues: MovementFilterFormValues
  accountOptions: SelectOption[]
  categoryOptions: SelectOption[]
  movementTypeOptions: SelectOption[]
  accountSearchable: SearchableSelectProps
  categorySearchable: SearchableSelectProps
  onAccountChange: (value: string) => void
  onCategoryChange: (value: string) => void
  onMovementTypeChange: (value: string) => void
  onDateFromChange: (value: string) => void
  onDateToChange: (value: string) => void
  applyFilters: () => void
  resetFilters: () => void
}

function buildSearchableProps({
  setSearchText,
  handleLoadMore,
  placeholder,
  hasMore,
  isLoadingMore,
}: {
  setSearchText: (value: string) => void
  handleLoadMore: () => void
  placeholder: string
  hasMore: boolean
  isLoadingMore: boolean
}): SearchableSelectProps {
  return {
    onSearchTextChange: setSearchText,
    onLoadMore: handleLoadMore,
    searchPlaceholder: placeholder,
    hasMore,
    isLoadingMore,
  }
}

export function useMovementsFilters({
  accounts,
  initialAccountNextCursor,
  movementTypes,
  categories,
  initialCategoryNextCursor,
  limit,
  createTranslations,
  currentFilters,
}: UseMovementsFiltersParams): UseMovementsFiltersResult {
  const router = useRouter()
  const pathname = usePathname()
  const [isFiltering, startFilteringTransition] = useTransition()
  const [movementTypeId, setMovementTypeId] = useState(
    normalizeMovementFilterValue(currentFilters.movementTypeId),
  )
  const [dateFrom, setDateFrom] = useState(
    normalizeMovementFilterValue(currentFilters.dateFrom),
  )
  const [dateTo, setDateTo] = useState(
    normalizeMovementFilterValue(currentFilters.dateTo),
  )

  const {
    options: accountFilterOptions,
    selectedValue: accountId,
    isLoadingMore: accountIsLoadingMore,
    hasMore: accountHasMore,
    setSearchText: setAccountSearchText,
    handleChange: onAccountChange,
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
    selectedValue: categoryId,
    isLoadingMore: categoryIsLoadingMore,
    hasMore: categoryHasMore,
    setSearchText: setCategorySearchText,
    handleChange: onCategoryChange,
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
    resetAccountFilter(currentFilters.accountId)
  }, [currentFilters.accountId, resetAccountFilter])

  useEffect(() => {
    resetCategoryFilter(currentFilters.categoryId)
  }, [currentFilters.categoryId, resetCategoryFilter])

  useEffect(() => {
    setMovementTypeId(
      normalizeMovementFilterValue(currentFilters.movementTypeId),
    )
  }, [currentFilters.movementTypeId])

  useEffect(() => {
    setDateFrom(normalizeMovementFilterValue(currentFilters.dateFrom))
  }, [currentFilters.dateFrom])

  useEffect(() => {
    setDateTo(normalizeMovementFilterValue(currentFilters.dateTo))
  }, [currentFilters.dateTo])

  const buildFiltersHref = ({
    accountId,
    categoryId,
    movementTypeId,
    dateFrom,
    dateTo,
  }: MovementFilterFormValues) => {
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

  const navigateToFilters = (nextFilters: MovementFilterFormValues) => {
    const href = buildFiltersHref(nextFilters)

    startFilteringTransition(() => {
      router.push(href)
    })
  }

  const applyFilters = () => {
    navigateToFilters({
      accountId,
      categoryId,
      movementTypeId,
      dateFrom,
      dateTo,
    })
  }

  const resetFilters = () => {
    const nextFilters = buildMovementFilterFormValues({})

    resetAccountFilter(nextFilters.accountId)
    resetCategoryFilter(nextFilters.categoryId)
    setMovementTypeId(nextFilters.movementTypeId)
    setDateFrom(nextFilters.dateFrom)
    setDateTo(nextFilters.dateTo)
    navigateToFilters(nextFilters)
  }

  const handleDateFromChange = (nextDateFrom: string) => {
    setDateFrom(nextDateFrom)

    if (dateTo && nextDateFrom && dateTo < nextDateFrom) {
      setDateTo('')
    }
  }

  const handleDateToChange = (nextDateTo: string) => {
    setDateTo(nextDateTo)
  }

  return {
    isFiltering,
    filterValues: {
      accountId,
      categoryId,
      movementTypeId,
      dateFrom,
      dateTo,
    },
    accountOptions: withPlaceholderOption(
      createTranslations.accountPlaceholder,
      accountFilterOptions,
    ),
    categoryOptions: withPlaceholderOption(
      createTranslations.categoryPlaceholder,
      categoryFilterOptions,
    ),
    movementTypeOptions: withPlaceholderOption(
      createTranslations.movementTypePlaceholder,
      movementTypes,
    ),
    accountSearchable: buildSearchableProps({
      setSearchText: setAccountSearchText,
      handleLoadMore: handleAccountLoadMore,
      placeholder: createTranslations.searchAccountPlaceholder,
      hasMore: accountHasMore,
      isLoadingMore: accountIsLoadingMore,
    }),
    categorySearchable: buildSearchableProps({
      setSearchText: setCategorySearchText,
      handleLoadMore: handleCategoryLoadMore,
      placeholder: createTranslations.searchCategoryPlaceholder,
      hasMore: categoryHasMore,
      isLoadingMore: categoryIsLoadingMore,
    }),
    onAccountChange,
    onCategoryChange,
    onMovementTypeChange: setMovementTypeId,
    onDateFromChange: handleDateFromChange,
    onDateToChange: handleDateToChange,
    applyFilters,
    resetFilters,
  }
}
