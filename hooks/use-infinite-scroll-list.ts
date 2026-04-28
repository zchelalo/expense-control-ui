'use client'

import { type UIEvent, useCallback, useEffect, useRef } from 'react'

type UseInfiniteScrollListParams = {
  isEnabled: boolean
  hasMore: boolean
  isLoadingMore: boolean
  itemCount: number
  onLoadMore?: () => void
  threshold?: number
}

export function useInfiniteScrollList<T extends HTMLElement>({
  isEnabled,
  hasMore,
  isLoadingMore,
  itemCount,
  onLoadMore,
  threshold = 24,
}: UseInfiniteScrollListParams) {
  const listRef = useRef<T>(null)

  const handleScroll = useCallback(
    (event: UIEvent<T>) => {
      if (!onLoadMore || !hasMore || isLoadingMore) return

      const list = event.currentTarget
      const remainingScrollSpace =
        list.scrollHeight - list.scrollTop - list.clientHeight

      if (remainingScrollSpace <= threshold) {
        onLoadMore()
      }
    },
    [hasMore, isLoadingMore, onLoadMore, threshold],
  )

  useEffect(() => {
    if (!isEnabled || !listRef.current || !onLoadMore || !hasMore) {
      return
    }

    if (isLoadingMore) {
      return
    }

    const list = listRef.current

    if (itemCount === 0 || list.scrollHeight <= list.clientHeight + threshold) {
      onLoadMore()
    }
  }, [hasMore, isEnabled, isLoadingMore, itemCount, onLoadMore, threshold])

  return {
    listRef,
    handleScroll,
  }
}
