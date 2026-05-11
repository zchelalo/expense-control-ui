'use client'

import { AnimatePresence } from 'motion/react'
import { useRouter } from 'next/navigation'
import { Text } from '@/components/atoms/text'
import { Card } from '@/components/molecules/card'
import styles from '@/components/templates/dashboard/movements/movements.module.css'
import { SwipeableMovementCard } from '@/components/templates/dashboard/movements/swipeable-movement-card'
import type { MovementListItem } from '@/components/templates/dashboard/movements/types'
import { deleteMovementAction } from '@/modules/movement/adapters/in/delete-action'
import { toast } from '@/utils/toast'

type SwipeableMovementsListProps = {
  items: MovementListItem[]
  emptyText: string
  deleteLabel: string
  onDeleteSuccess?: (id: string) => void
}

export function SwipeableMovementsList({
  items,
  emptyText,
  deleteLabel,
  onDeleteSuccess,
}: SwipeableMovementsListProps) {
  const router = useRouter()

  const handleDelete = async (id: string) => {
    const result = await deleteMovementAction(id)

    if (!result.success) {
      toast.error(result.message)
      return false
    }

    onDeleteSuccess?.(id)
    toast.success(result.message)
    router.refresh()

    return true
  }

  if (items.length === 0) {
    return (
      <Card className={styles.noMovementsCard}>
        <Text>{emptyText}</Text>
      </Card>
    )
  }

  return (
    <div className={styles.movementsList}>
      <AnimatePresence initial={false}>
        {items.map((movement) => (
          <SwipeableMovementCard
            key={movement.id}
            item={movement}
            deleteLabel={deleteLabel}
            onDelete={handleDelete}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
