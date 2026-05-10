'use client'

import { Trash, TrendingDown, TrendingUp } from 'lucide-react'
import { animate, motion, useMotionValue } from 'motion/react'
import { useState, useTransition } from 'react'
import { FlexBox } from '@/components/atoms/flex-box'
import { LocalDateTime } from '@/components/atoms/local-date-time'
import { Text } from '@/components/atoms/text'
import { Badge } from '@/components/molecules/badge'
import { Card } from '@/components/molecules/card'
import styles from '@/components/templates/dashboard/movements/movements.module.css'
import type { MovementListItem } from '@/components/templates/dashboard/movements/types'

const DELETE_ACTION_WIDTH = 88
const DELETE_OPEN_THRESHOLD = 44
const DELETE_VELOCITY_THRESHOLD = -500

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

export function SwipeableMovementCard({
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
                {item.accountName}
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
              <Text
                variant='span'
                typographySize='normal'
                typographyTextStyle='normal'
                typographyWeight='medium'
              >
                <LocalDateTime value={item.createdAt} />
              </Text>
            </FlexBox>
          </FlexBox>
        </Card>
      </motion.div>
    </motion.div>
  )
}
