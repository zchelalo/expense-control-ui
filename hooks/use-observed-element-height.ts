'use client'

import { useEffect, useRef, useState } from 'react'

export function useObservedElementHeight<T extends HTMLElement>() {
  const elementRef = useRef<T>(null)
  const [elementHeight, setElementHeight] = useState<number | null>(null)

  useEffect(() => {
    const element = elementRef.current

    if (!element) {
      return
    }

    const updateElementHeight = () => {
      setElementHeight(element.getBoundingClientRect().height)
    }

    updateElementHeight()

    if (typeof ResizeObserver === 'undefined') {
      return
    }

    const resizeObserver = new ResizeObserver(updateElementHeight)

    resizeObserver.observe(element)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  return {
    elementRef,
    elementHeight,
  }
}
