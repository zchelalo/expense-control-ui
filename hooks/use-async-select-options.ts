'use client'

import { useCallback, useEffect, useEffectEvent, useRef, useState } from 'react'
import {
  findOptionByValue,
  mergeSelectOptions,
  preserveSelectedOption,
  type SelectOptionLike,
} from '@/utils/select-options'

type SearchOptionsResult<TOption extends SelectOptionLike> = {
  options: TOption[]
  nextCursor: string | null
}

type SearchOptionsAction<TOption extends SelectOptionLike> = (
  search: string,
  afterCursor?: string | null,
) => Promise<SearchOptionsResult<TOption>>

type UseAsyncSelectOptionsParams<TOption extends SelectOptionLike> = {
  initialOptions: TOption[]
  initialNextCursor: string | null
  initialValue?: string | null
  isOpen: boolean
  searchOptions: SearchOptionsAction<TOption>
  debounceMs?: number
}

export function useAsyncSelectOptions<TOption extends SelectOptionLike>({
  initialOptions,
  initialNextCursor,
  initialValue = '',
  isOpen,
  searchOptions,
  debounceMs = 250,
}: UseAsyncSelectOptionsParams<TOption>) {
  const initialSelectedOption = findOptionByValue(initialOptions, initialValue)
  const [options, setOptions] = useState(() =>
    preserveSelectedOption(initialOptions, initialSelectedOption),
  )
  const [nextCursor, setNextCursor] = useState(initialNextCursor)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [selectedValue, setSelectedValue] = useState(initialValue ?? '')
  const [selectedOption, setSelectedOption] = useState<TOption | null>(
    initialSelectedOption,
  )
  const requestIdRef = useRef(0)
  const isLoadingMoreRef = useRef(false)
  const selectedValueRef = useRef(initialValue ?? '')

  const getSelectedOption = useEffectEvent(() => selectedOption)

  useEffect(() => {
    selectedValueRef.current = selectedValue
  }, [selectedValue])

  const cancelPendingRequests = useCallback(() => {
    requestIdRef.current += 1
    isLoadingMoreRef.current = false
    setIsLoadingMore(false)
  }, [])

  const resolveOption = useCallback(
    (value: string | null | undefined) =>
      findOptionByValue(options, value) ??
      findOptionByValue(initialOptions, value) ??
      null,
    [initialOptions, options],
  )

  const selectValue = useCallback(
    (value: string | null | undefined) => {
      const nextSelectedValue = value ?? ''
      const nextSelectedOption = resolveOption(nextSelectedValue)

      setSelectedValue(nextSelectedValue)
      setSelectedOption(nextSelectedOption)
      setOptions((currentOptions) =>
        preserveSelectedOption(currentOptions, nextSelectedOption),
      )
    },
    [resolveOption],
  )

  const reset = useCallback(
    (value?: string | null) => {
      const nextSelectedValue = value ?? selectedValueRef.current ?? ''
      const nextSelectedOption = resolveOption(nextSelectedValue)

      cancelPendingRequests()
      setSearchText('')
      setSelectedValue(nextSelectedValue)
      setSelectedOption(nextSelectedOption)
      setOptions(preserveSelectedOption(initialOptions, nextSelectedOption))
      setNextCursor(initialNextCursor)
    },
    [cancelPendingRequests, initialNextCursor, initialOptions, resolveOption],
  )

  useEffect(() => {
    setOptions(preserveSelectedOption(initialOptions, getSelectedOption()))
    setNextCursor(initialNextCursor)
  }, [getSelectedOption, initialNextCursor, initialOptions])

  useEffect(() => {
    if (!isOpen) return

    const normalizedSearchText = searchText.trim()
    if (!normalizedSearchText) {
      cancelPendingRequests()
      setNextCursor(initialNextCursor)
      setOptions(preserveSelectedOption(initialOptions, getSelectedOption()))
      return
    }

    const timeout = setTimeout(() => {
      const requestId = requestIdRef.current + 1
      requestIdRef.current = requestId
      isLoadingMoreRef.current = false
      setIsLoadingMore(false)

      void searchOptions(normalizedSearchText)
        .then((result) => {
          if (requestIdRef.current !== requestId) return

          setOptions(
            preserveSelectedOption(result.options, getSelectedOption()),
          )
          setNextCursor(result.nextCursor)
        })
        .catch(() => undefined)
    }, debounceMs)

    return () => clearTimeout(timeout)
  }, [
    cancelPendingRequests,
    debounceMs,
    getSelectedOption,
    initialNextCursor,
    initialOptions,
    isOpen,
    searchOptions,
    searchText,
  ])

  const handleLoadMore = useCallback(() => {
    if (!nextCursor || isLoadingMoreRef.current) return

    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId
    isLoadingMoreRef.current = true
    setIsLoadingMore(true)

    void searchOptions(searchText.trim(), nextCursor)
      .then((result) => {
        if (requestIdRef.current !== requestId) return

        setOptions((currentOptions) =>
          preserveSelectedOption(
            mergeSelectOptions(currentOptions, result.options),
            getSelectedOption(),
          ),
        )
        setNextCursor(result.nextCursor)
      })
      .catch(() => undefined)
      .finally(() => {
        if (requestIdRef.current !== requestId) return

        isLoadingMoreRef.current = false
        setIsLoadingMore(false)
      })
  }, [getSelectedOption, nextCursor, searchOptions, searchText])

  const upsertOption = useCallback(
    (option: TOption, shouldSelect = false) => {
      setOptions((currentOptions) =>
        preserveSelectedOption(
          mergeSelectOptions([option], currentOptions),
          shouldSelect ? option : getSelectedOption(),
        ),
      )

      if (!shouldSelect) return

      setSelectedValue(option.value)
      setSelectedOption(option)
    },
    [getSelectedOption],
  )

  return {
    options,
    selectedValue,
    selectedOption,
    isLoadingMore,
    hasMore: nextCursor !== null,
    setSearchText,
    handleChange: selectValue,
    handleLoadMore,
    selectValue,
    reset,
    upsertOption,
  }
}
