import type { SelectOption } from '@/components/templates/dashboard/movements/types'

export function findOptionByValue(
  options: SelectOption[],
  value: string | null | undefined,
): SelectOption | null {
  if (!value) return null

  return options.find((option) => option.value === value) ?? null
}

export function preserveSelectedOption(
  options: SelectOption[],
  selectedOption: SelectOption | null,
): SelectOption[] {
  if (!selectedOption) return options
  if (options.some((option) => option.value === selectedOption.value)) {
    return options
  }

  return [selectedOption, ...options]
}

export function mergeSelectOptions(
  currentOptions: SelectOption[],
  nextOptions: SelectOption[],
): SelectOption[] {
  const mergedOptions = [...currentOptions, ...nextOptions]
  const seenValues = new Set<string>()

  return mergedOptions.filter((option) => {
    if (seenValues.has(option.value)) return false

    seenValues.add(option.value)
    return true
  })
}
