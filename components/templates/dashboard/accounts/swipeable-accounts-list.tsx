'use client'

import { AnimatePresence } from 'motion/react'
import { useRouter } from 'next/navigation'
import { Box } from '@/components/atoms/box'
import { Text } from '@/components/atoms/text'
import styles from '@/components/templates/dashboard/accounts/accounts.module.css'
import { SwipeableAccountCard } from '@/components/templates/dashboard/accounts/swipeable-account-card'
import type { AccountListItem } from '@/components/templates/dashboard/accounts/types'
import { deleteAccountAction } from '@/modules/account/adapters/in/delete-action'
import { toast } from '@/utils/toast'

type SwipeableAccountsListProps = {
  items: AccountListItem[]
  emptyText: string
  deleteLabel: string
  onDeleteSuccess?: (id: string) => void
}

export function SwipeableAccountsList({
  items,
  emptyText,
  deleteLabel,
  onDeleteSuccess,
}: SwipeableAccountsListProps) {
  const router = useRouter()

  const handleDelete = async (id: string) => {
    const result = await deleteAccountAction(id)

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
    return <Text variant='p'>{emptyText}</Text>
  }

  return (
    <Box variant='div' className={styles.accounts}>
      <AnimatePresence initial={false}>
        {items.map((account) => (
          <SwipeableAccountCard
            key={account.id}
            item={account}
            deleteLabel={deleteLabel}
            onDelete={handleDelete}
          />
        ))}
      </AnimatePresence>
    </Box>
  )
}
