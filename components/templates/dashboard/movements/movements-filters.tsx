'use client'

import type { ReactNode } from 'react'
import { Button } from '@/components/atoms/button'
import { FlexBox } from '@/components/atoms/flex-box'
import { MovementDateField } from '@/components/templates/dashboard/movements/date-field'
import styles from '@/components/templates/dashboard/movements/movements.module.css'
import { MovementSelectField } from '@/components/templates/dashboard/movements/select-field'
import type {
  CreateMovementTranslations,
  MovementFilterTranslations,
  SearchableSelectProps,
  SelectOption,
} from '@/components/templates/dashboard/movements/types'

type MovementsFiltersProps = {
  idPrefix: string
  createTranslations: CreateMovementTranslations
  filterTranslations: MovementFilterTranslations
  accountId: string
  categoryId: string
  movementTypeId: string
  dateFrom: string
  dateTo: string
  accountOptions: SelectOption[]
  categoryOptions: SelectOption[]
  movementTypeOptions: SelectOption[]
  accountSearchable: SearchableSelectProps
  categorySearchable: SearchableSelectProps
  extraActions?: ReactNode
  disabled?: boolean
  onAccountChange: (value: string) => void
  onCategoryChange: (value: string) => void
  onMovementTypeChange: (value: string) => void
  onDateFromChange: (value: string) => void
  onDateToChange: (value: string) => void
  onApply: () => void
  onReset: () => void
}

export function MovementsFilters({
  idPrefix,
  createTranslations,
  filterTranslations,
  accountId,
  categoryId,
  movementTypeId,
  dateFrom,
  dateTo,
  accountOptions,
  categoryOptions,
  movementTypeOptions,
  accountSearchable,
  categorySearchable,
  extraActions,
  disabled = false,
  onAccountChange,
  onCategoryChange,
  onMovementTypeChange,
  onDateFromChange,
  onDateToChange,
  onApply,
  onReset,
}: MovementsFiltersProps) {
  const selectFields = [
    {
      key: 'account',
      label: createTranslations.accountLabel,
      value: accountId,
      options: accountOptions,
      onChange: onAccountChange,
      placeholder: createTranslations.accountPlaceholder,
      searchable: accountSearchable,
    },
    {
      key: 'movement-type',
      label: createTranslations.movementTypeLabel,
      value: movementTypeId,
      options: movementTypeOptions,
      onChange: onMovementTypeChange,
      placeholder: createTranslations.movementTypePlaceholder,
    },
    {
      key: 'category',
      label: createTranslations.categoryLabel,
      value: categoryId,
      options: categoryOptions,
      onChange: onCategoryChange,
      placeholder: createTranslations.categoryPlaceholder,
      searchable: categorySearchable,
    },
  ]

  const dateFields = [
    {
      key: 'date-from',
      label: filterTranslations.dateFromLabel,
      value: dateFrom,
      min: undefined,
      max: dateTo || undefined,
      onChange: onDateFromChange,
    },
    {
      key: 'date-to',
      label: filterTranslations.dateToLabel,
      value: dateTo,
      min: dateFrom || undefined,
      max: undefined,
      onChange: onDateToChange,
    },
  ]

  return (
    <FlexBox
      variant='div'
      direction='column'
      alignItems='stretch'
      gap={3}
      className={styles.filtersPanel}
    >
      <div className={styles.filters}>
        {selectFields.map((field) => (
          <MovementSelectField
            key={field.key}
            id={`${idPrefix}-${field.key}`}
            label={field.label}
            value={field.value}
            options={field.options}
            onChange={field.onChange}
            placeholder={field.placeholder}
            disabled={disabled}
            searchable={field.searchable}
            className={styles.filterField}
          />
        ))}
        {dateFields.map((field) => (
          <MovementDateField
            key={field.key}
            id={`${idPrefix}-${field.key}`}
            label={field.label}
            value={field.value}
            min={field.min}
            max={field.max}
            onChange={field.onChange}
            disabled={disabled}
            className={styles.filterField}
          />
        ))}
      </div>
      <div className={styles.filtersActions}>
        {extraActions}
        <Button
          type='button'
          variant='primary'
          appearance='outlined'
          className={styles.filtersActionButton}
          onClick={onReset}
          disabled={disabled}
        >
          {filterTranslations.reset}
        </Button>
        <Button
          type='button'
          className={styles.filtersActionButton}
          onClick={onApply}
          disabled={disabled}
        >
          {filterTranslations.apply}
        </Button>
      </div>
    </FlexBox>
  )
}
