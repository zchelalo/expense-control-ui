import type { Ref, RefObject } from 'react'

export function mergeRefs<T>(...refs: (Ref<T> | undefined)[]) {
  return (node: T) => {
    for (const ref of refs) {
      if (!ref) continue
      if (typeof ref === 'function') ref(node)
      else (ref as RefObject<T | null>).current = node
    }
  }
}
