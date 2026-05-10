export type SelectOptionLike = {
  value: string
}

export function findOptionByValue<TOption extends SelectOptionLike>(
  options: TOption[],
  value: string | null | undefined,
): TOption | null {
  if (!value) return null

  return options.find((option) => option.value === value) ?? null
}

export function preserveSelectedOption<TOption extends SelectOptionLike>(
  options: TOption[],
  selectedOption: TOption | null,
): TOption[] {
  if (!selectedOption) return options
  if (options.some((option) => option.value === selectedOption.value)) {
    return options
  }

  return [selectedOption, ...options]
}

export function mergeSelectOptions<TOption extends SelectOptionLike>(
  currentOptions: TOption[],
  nextOptions: TOption[],
): TOption[] {
  const mergedOptions = [...currentOptions, ...nextOptions]
  const seenValues = new Set<string>()

  return mergedOptions.filter((option) => {
    if (seenValues.has(option.value)) return false

    seenValues.add(option.value)
    return true
  })
}
