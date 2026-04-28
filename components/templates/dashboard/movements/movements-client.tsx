'use client'

import { useEffect, useState } from 'react'
import { FlexBox } from '@/components/atoms/flex-box'
import { CreateMovement } from '@/components/templates/dashboard/movements/create-movement'
import styles from '@/components/templates/dashboard/movements/movements.module.css'
import { SwipeableMovementsList } from '@/components/templates/dashboard/movements/swipeable-movements-list'
import type {
  MovementListItem,
  MovementTypeOption,
  SelectOption,
} from '@/components/templates/dashboard/movements/types'

type CreateMovementTranslations = {
  newMovement: string
  accountLabel: string
  accountPlaceholder: string
  amountLabel: string
  amountPlaceholder: string
  descriptionLabel: string
  descriptionPlaceholder: string
  movementTypeLabel: string
  movementTypePlaceholder: string
  categoryLabel: string
  categoryPlaceholder: string
  searchAccountPlaceholder: string
  searchCategoryPlaceholder: string
  createMovement: string
  creatingMovement: string
}

type CurrentFilters = {
  accountId?: string | null
  categoryId?: string | null
  movementTypeId?: string | null
  afterCursor?: string | null
  beforeCursor?: string | null
}

type MovementsClientProps = {
  initialItems: MovementListItem[]
  emptyText: string
  deleteLabel: string
  createTranslations: CreateMovementTranslations
  accountId?: string | null
  accounts: SelectOption[]
  initialAccountNextCursor: string | null
  movementTypes: MovementTypeOption[]
  categories: SelectOption[]
  initialCategoryNextCursor: string | null
  limit: number
  currentFilters: CurrentFilters
}

function movementMatchesCurrentFilters(
  movement: MovementListItem,
  filters: CurrentFilters,
) {
  const matchesAccount =
    !filters.accountId || movement.accountId === filters.accountId
  const matchesCategory =
    !filters.categoryId || movement.categoryId === filters.categoryId
  const matchesMovementType =
    !filters.movementTypeId ||
    movement.movementTypeId === filters.movementTypeId

  return matchesAccount && matchesCategory && matchesMovementType
}

export function MovementsClient({
  initialItems,
  emptyText,
  deleteLabel,
  createTranslations,
  accountId = null,
  accounts,
  initialAccountNextCursor,
  movementTypes,
  categories,
  initialCategoryNextCursor,
  limit,
  currentFilters,
}: MovementsClientProps) {
  const [movements, setMovements] = useState(initialItems)

  useEffect(() => {
    setMovements(initialItems)
  }, [initialItems])

  const handleMovementCreated = (movement: MovementListItem) => {
    const isFirstPage =
      !currentFilters.afterCursor && !currentFilters.beforeCursor

    if (!isFirstPage) return
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

  return (
    <FlexBox
      variant='div'
      direction='column'
      alignItems='start'
      justifyContent='center'
      gap={3}
      className={styles.body}
    >
      <FlexBox
        variant='div'
        direction='row'
        justifyContent='center'
        alignItems='start'
        gap={2}
      >
        <CreateMovement
          translations={createTranslations}
          accountId={accountId}
          accounts={accounts}
          initialAccountNextCursor={initialAccountNextCursor}
          movementTypes={movementTypes}
          categories={categories}
          initialCategoryNextCursor={initialCategoryNextCursor}
          onMovementCreated={handleMovementCreated}
        />
      </FlexBox>
      <SwipeableMovementsList
        items={movements}
        emptyText={emptyText}
        deleteLabel={deleteLabel}
        onDeleteSuccess={handleMovementDeleted}
      />
    </FlexBox>
  )
}
