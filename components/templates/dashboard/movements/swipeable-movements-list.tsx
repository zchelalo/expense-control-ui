'use client'

import { Trash, TrendingDown, TrendingUp } from 'lucide-react'
import { AnimatePresence, animate, motion, useMotionValue } from 'motion/react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { FlexBox } from '@/components/atoms/flex-box'
import { LocalDateTime } from '@/components/atoms/local-date-time'
import { Text } from '@/components/atoms/text'
import { Badge } from '@/components/molecules/badge'
import { Card } from '@/components/molecules/card'
import styles from '@/components/templates/dashboard/movements/movements.module.css'
import { deleteMovementAction } from '@/modules/movement/adapters/in/delete-action'
import { toast } from '@/utils/toast'

const DELETE_ACTION_WIDTH = 88
const DELETE_OPEN_THRESHOLD = 44
const DELETE_VELOCITY_THRESHOLD = -500

type MovementListItem = {
  id: string
  description: string
  categoryName: string
  createdAt: string
  movementTypeKey: string
  movementTypeText: string
  amount: string
}

type SwipeableMovementsListProps = {
  items: MovementListItem[]
  emptyText: string
  deleteLabel: string
}

type SwipeableMovementCardProps = {
  item: MovementListItem
  deleteLabel: string
  onDelete: (id: string) => Promise<boolean>
}

function getMovementTypeColor(movementTypeKey: string) {
  switch (movementTypeKey) {
    case 'income':
      return 'success'
    case 'expense':
      return 'error'
    default:
      return 'default'
  }
}

function getMovementTypeIcon(movementTypeKey: string) {
  switch (movementTypeKey) {
    case 'income':
      return <TrendingUp size={16} />
    case 'expense':
      return <TrendingDown size={16} />
    default:
      return null
  }
}

function SwipeableMovementCard({
  item,
  deleteLabel,
  onDelete,
}: SwipeableMovementCardProps) {
  const x = useMotionValue(0)
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const animateTo = (target: number) => {
    animate(x, target, {
      type: 'spring',
      stiffness: 420,
      damping: 38,
    })
  }

  const closeActions = () => {
    setIsOpen(false)
    animateTo(0)
  }

  const openActions = () => {
    setIsOpen(true)
    animateTo(-DELETE_ACTION_WIDTH)
  }

  const handleDragEnd = (
    _: PointerEvent | MouseEvent | TouchEvent,
    info: {
      offset: {
        x: number
      }
      velocity: {
        x: number
      }
    },
  ) => {
    const shouldOpen =
      info.offset.x <= -DELETE_OPEN_THRESHOLD ||
      info.velocity.x <= DELETE_VELOCITY_THRESHOLD

    if (shouldOpen) {
      openActions()
      return
    }

    closeActions()
  }

  const handleDelete = () => {
    startTransition(async () => {
      const deleted = await onDelete(item.id)

      if (!deleted) {
        openActions()
      }
    })
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12, height: 0 }}
      transition={{ duration: 0.2 }}
      className={styles.swipeCard}
    >
      <div className={styles.swipeCardAction} aria-hidden={isPending}>
        <button
          type='button'
          className={styles.swipeCardDeleteButton}
          onClick={handleDelete}
          disabled={isPending}
          aria-label={deleteLabel}
        >
          <Trash size={18} />
          <span>{deleteLabel}</span>
        </button>
      </div>

      <motion.div
        drag='x'
        dragDirectionLock
        dragConstraints={{ left: -DELETE_ACTION_WIDTH, right: 0 }}
        dragElastic={0.08}
        dragMomentum={false}
        style={{ x, touchAction: 'pan-y' }}
        whileDrag={{ cursor: 'grabbing' }}
        onDragEnd={handleDragEnd}
        className={styles.swipeCardForeground}
      >
        <Card className={styles.movementCard}>
          <FlexBox
            variant='div'
            alignItems='center'
            justifyContent='spaceBetween'
            gap={8}
            className={styles.accountContent}
            onClick={isOpen ? closeActions : undefined}
          >
            <FlexBox
              variant='div'
              direction='column'
              alignItems='start'
              justifyContent='center'
              gap={2}
            >
              <Text
                variant='span'
                typographySize='normal'
                typographyTextStyle='normal'
                typographyWeight='medium'
              >
                {item.description}
              </Text>
              <Text
                variant='span'
                typographySize='normal'
                typographyTextStyle='normal'
                typographyWeight='medium'
              >
                {item.categoryName}
              </Text>
              <Text
                variant='span'
                typographySize='normal'
                typographyTextStyle='normal'
                typographyWeight='medium'
              >
                <LocalDateTime value={item.createdAt} />
              </Text>
            </FlexBox>
            <FlexBox
              variant='div'
              direction='column'
              alignItems='end'
              justifyContent='start'
              gap={2}
              className={styles.amountContainer}
            >
              <Badge
                variant={getMovementTypeColor(item.movementTypeKey)}
                icon={getMovementTypeIcon(item.movementTypeKey)}
              >
                <Text
                  variant='span'
                  typographySize='small'
                  typographyTextStyle='normal'
                  typographyWeight='light'
                >
                  {item.movementTypeText}
                </Text>
              </Badge>
              <Text
                variant='span'
                typographySize='normal'
                typographyTextStyle='normal'
                typographyWeight='medium'
              >
                {item.amount}
              </Text>
            </FlexBox>
          </FlexBox>
        </Card>
      </motion.div>
    </motion.div>
  )
}

export function SwipeableMovementsList({
  items,
  emptyText,
  deleteLabel,
}: SwipeableMovementsListProps) {
  const router = useRouter()
  const [movements, setMovements] = useState(items)

  const handleDelete = async (id: string) => {
    const result = await deleteMovementAction(id)

    if (!result.success) {
      toast.error(result.message)
      return false
    }

    setMovements((currentMovements) =>
      currentMovements.filter((movement) => movement.id !== id),
    )
    toast.success(result.message)
    router.refresh()

    return true
  }

  if (movements.length === 0) {
    return (
      <Card className={styles.noMovementsCard}>
        <Text>{emptyText}</Text>
      </Card>
    )
  }

  return (
    <AnimatePresence initial={false}>
      {movements.map((movement) => (
        <SwipeableMovementCard
          key={movement.id}
          item={movement}
          deleteLabel={deleteLabel}
          onDelete={handleDelete}
        />
      ))}
    </AnimatePresence>
  )
}
