'use client'

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
  disabled = false,
  onAccountChange,
  onCategoryChange,
  onMovementTypeChange,
  onDateFromChange,
  onDateToChange,
  onApply,
  onReset,
}: MovementsFiltersProps) {
  return (
    <FlexBox
      variant='div'
      direction='column'
      alignItems='stretch'
      gap={3}
      className={styles.filtersPanel}
    >
      <div className={styles.filters}>
        <MovementSelectField
          id={`${idPrefix}-account`}
          label={createTranslations.accountLabel}
          value={accountId}
          options={accountOptions}
          onChange={onAccountChange}
          placeholder={createTranslations.accountPlaceholder}
          disabled={disabled}
          searchable={accountSearchable}
          className={styles.filterField}
        />
        <MovementSelectField
          id={`${idPrefix}-movement-type`}
          label={createTranslations.movementTypeLabel}
          value={movementTypeId}
          options={movementTypeOptions}
          onChange={onMovementTypeChange}
          placeholder={createTranslations.movementTypePlaceholder}
          disabled={disabled}
          className={styles.filterField}
        />
        <MovementSelectField
          id={`${idPrefix}-category`}
          label={createTranslations.categoryLabel}
          value={categoryId}
          options={categoryOptions}
          onChange={onCategoryChange}
          placeholder={createTranslations.categoryPlaceholder}
          disabled={disabled}
          searchable={categorySearchable}
          className={styles.filterField}
        />
        <MovementDateField
          id={`${idPrefix}-date-from`}
          label={filterTranslations.dateFromLabel}
          value={dateFrom}
          max={dateTo || undefined}
          onChange={onDateFromChange}
          disabled={disabled}
          className={styles.filterField}
        />
        <MovementDateField
          id={`${idPrefix}-date-to`}
          label={filterTranslations.dateToLabel}
          value={dateTo}
          min={dateFrom || undefined}
          onChange={onDateToChange}
          disabled={disabled}
          className={styles.filterField}
        />
      </div>
      <div className={styles.filtersActions}>
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
