'use client'

import { ChevronRight, Trash } from 'lucide-react'
import { animate, motion, useMotionValue } from 'motion/react'
import {
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  useRef,
  useState,
  useTransition,
} from 'react'
import { FlexBox } from '@/components/atoms/flex-box'
import { Text } from '@/components/atoms/text'
import { Card } from '@/components/molecules/card'
import styles from '@/components/templates/dashboard/accounts/accounts.module.css'
import type { AccountListItem } from '@/components/templates/dashboard/accounts/types'
import { Link } from '@/i18n/navigation'

const DELETE_ACTION_WIDTH = 88
const DELETE_OPEN_THRESHOLD = 44
const DELETE_VELOCITY_THRESHOLD = -500
const CLICK_SUPPRESS_DRAG_THRESHOLD = 6

type SwipeableAccountCardProps = {
  item: AccountListItem
  deleteLabel: string
  onDelete: (id: string) => Promise<boolean>
}

export function SwipeableAccountCard({
  item,
  deleteLabel,
  onDelete,
}: SwipeableAccountCardProps) {
  const x = useMotionValue(0)
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const pointerStartRef = useRef<{
    x: number
    y: number
  } | null>(null)
  const suppressClickRef = useRef(false)

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
    _: PointerEvent | globalThis.MouseEvent | TouchEvent,
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

  const handleLinkClick = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false
      event.preventDefault()
      return
    }

    if (!isOpen) return

    suppressClickRef.current = false
    event.preventDefault()
    closeActions()
  }

  const preventNativeDrag = (event: ReactMouseEvent<HTMLElement>) => {
    event.preventDefault()
  }

  const handlePointerDownCapture = (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    pointerStartRef.current = {
      x: event.clientX,
      y: event.clientY,
    }
    suppressClickRef.current = false
  }

  const handlePointerMoveCapture = (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    if (!pointerStartRef.current || suppressClickRef.current) return

    const deltaX = event.clientX - pointerStartRef.current.x
    const deltaY = event.clientY - pointerStartRef.current.y

    if (
      Math.abs(deltaX) >= CLICK_SUPPRESS_DRAG_THRESHOLD &&
      Math.abs(deltaX) > Math.abs(deltaY)
    ) {
      suppressClickRef.current = true
    }
  }

  const handlePointerEndCapture = () => {
    pointerStartRef.current = null
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
        onDragStart={() => {
          suppressClickRef.current = true
        }}
        onDragEnd={handleDragEnd}
        onPointerDownCapture={handlePointerDownCapture}
        onPointerMoveCapture={handlePointerMoveCapture}
        onPointerUpCapture={handlePointerEndCapture}
        onPointerCancelCapture={handlePointerEndCapture}
        className={styles.swipeCardForeground}
      >
        <Link
          href={`/movements?accountId=${item.id}`}
          className={styles.accountLink}
          draggable={false}
          onClick={handleLinkClick}
          onDragStart={preventNativeDrag}
        >
          <Card className={styles.account}>
            <FlexBox
              variant='div'
              alignItems='center'
              justifyContent='spaceBetween'
              gap={8}
              className={styles.accountContent}
            >
              <Text
                variant='span'
                typographySize='normal'
                typographyTextStyle='normal'
                typographyWeight='medium'
              >
                {item.name}
              </Text>
              <Text
                variant='span'
                typographySize='normal'
                typographyTextStyle='normal'
                typographyWeight='medium'
              >
                {item.balanceFormatted}
              </Text>
            </FlexBox>
            <FlexBox variant='div' alignItems='center' justifyContent='center'>
              <ChevronRight size={18} />
            </FlexBox>
          </Card>
        </Link>
      </motion.div>
    </motion.div>
  )
}
