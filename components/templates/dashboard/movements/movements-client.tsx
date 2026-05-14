'use client'

import { SlidersHorizontal } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/atoms/button'
import { FlexBox } from '@/components/atoms/flex-box'
import { Modal } from '@/components/atoms/modal'
import { ModalContent } from '@/components/atoms/modal/modal-content'
import { CreateMovement } from '@/components/templates/dashboard/movements/create-movement'
import { MovementStats } from '@/components/templates/dashboard/movements/movement-stats'
import styles from '@/components/templates/dashboard/movements/movements.module.css'
import {
  isFirstMovementsPage,
  movementMatchesCurrentFilters,
} from '@/components/templates/dashboard/movements/movements-client.utils'
import { MovementsFilters } from '@/components/templates/dashboard/movements/movements-filters'
import { StatsToggleButton } from '@/components/templates/dashboard/movements/stats-toggle-button'
import { SwipeableMovementsList } from '@/components/templates/dashboard/movements/swipeable-movements-list'
import type {
  CreateMovementTranslations,
  MovementFilters,
  MovementFilterTranslations,
  MovementListItem,
  MovementStatsTranslations,
  MovementTypeOption,
  SelectOption,
} from '@/components/templates/dashboard/movements/types'
import { useMovementsFilters } from '@/components/templates/dashboard/movements/use-movements-filters'
import type { MovementStats as MovementStatsData } from '@/modules/movement/ports/movement-store'
import { mergeSelectOptions } from '@/utils/select-options'

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
  locale: string
  stats: MovementStatsData | null
  statsTranslations: MovementStatsTranslations
  currentFilters: MovementFilters
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
  locale,
  stats,
  statsTranslations,
  currentFilters,
}: MovementsClientProps) {
  const [movements, setMovements] = useState(initialItems)
  const [availableCategories, setAvailableCategories] = useState(categories)
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false)
  const [isStatsVisible, setIsStatsVisible] = useState(false)
  const {
    isFiltering,
    filterValues,
    accountOptions,
    categoryOptions,
    movementTypeOptions,
    accountSearchable,
    categorySearchable,
    onAccountChange,
    onCategoryChange,
    onMovementTypeChange,
    onDateFromChange,
    onDateToChange,
    applyFilters,
    resetFilters,
  } = useMovementsFilters({
    accounts,
    initialAccountNextCursor,
    movementTypes,
    categories: availableCategories,
    initialCategoryNextCursor,
    limit,
    createTranslations,
    currentFilters,
  })

  useEffect(() => {
    setMovements(initialItems)
  }, [initialItems])

  useEffect(() => {
    setAvailableCategories(categories)
  }, [categories])

  const handleMovementCreated = (movement: MovementListItem) => {
    if (!isFirstMovementsPage(currentFilters)) return
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

  const handleCategoryCreated = (category: SelectOption) => {
    setAvailableCategories((currentCategories) =>
      mergeSelectOptions([category], currentCategories),
    )
  }

  const sharedFiltersProps = {
    createTranslations,
    filterTranslations,
    accountId: filterValues.accountId,
    categoryId: filterValues.categoryId,
    movementTypeId: filterValues.movementTypeId,
    dateFrom: filterValues.dateFrom,
    dateTo: filterValues.dateTo,
    accountOptions,
    categoryOptions,
    movementTypeOptions,
    accountSearchable,
    categorySearchable,
    disabled: isFiltering,
    onAccountChange,
    onCategoryChange,
    onMovementTypeChange,
    onDateFromChange,
    onDateToChange,
  }

  const statsToggleButton = stats ? (
    <StatsToggleButton
      className={styles.mobileStatsButton}
      isVisible={isStatsVisible}
      showLabel={statsTranslations.show}
      hideLabel={statsTranslations.hide}
      onToggle={() => setIsStatsVisible((currentValue) => !currentValue)}
    />
  ) : null

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
        categories={availableCategories}
        initialCategoryNextCursor={initialCategoryNextCursor}
        onMovementCreated={handleMovementCreated}
        onCategoryCreated={handleCategoryCreated}
      />
      <div className={styles.desktopFilters}>
        <MovementsFilters
          idPrefix='desktop'
          extraActions={
            statsToggleButton ? (
              <div className={styles.desktopStatsToggle}>
                {statsToggleButton}
              </div>
            ) : null
          }
          onApply={applyFilters}
          onReset={resetFilters}
          {...sharedFiltersProps}
        />
      </div>
      <div className={styles.mobileControlsBar}>
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
        {statsToggleButton}
      </div>
      <div
        className={`${styles.dashboardContent} ${
          !stats ? styles.dashboardContentSingle : ''
        }`}
      >
        {stats ? (
          <div className={styles.statsColumn}>
            <div
              className={`${styles.statsPanelContainer} ${
                isStatsVisible ? styles.statsPanelContainerOpen : ''
              }`}
            >
              <MovementStats
                stats={stats}
                locale={locale}
                translations={statsTranslations}
              />
            </div>
          </div>
        ) : null}
        <aside className={styles.movementsColumn}>
          <SwipeableMovementsList
            items={movements}
            emptyText={emptyText}
            deleteLabel={deleteLabel}
            onDeleteSuccess={handleMovementDeleted}
          />
        </aside>
      </div>
      <Modal isOpen={isFiltersModalOpen}>
        <ModalContent
          title={filterTranslations.title}
          onClose={() => setIsFiltersModalOpen(false)}
        >
          <MovementsFilters
            idPrefix='mobile'
            onApply={() => {
              setIsFiltersModalOpen(false)
              applyFilters()
            }}
            onReset={() => {
              setIsFiltersModalOpen(false)
              resetFilters()
            }}
            {...sharedFiltersProps}
          />
        </ModalContent>
      </Modal>
    </FlexBox>
  )
}
