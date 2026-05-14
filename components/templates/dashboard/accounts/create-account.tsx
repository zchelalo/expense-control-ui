'use client'

import { Plus } from 'lucide-react'
import {
  useActionState,
  useEffect,
  useEffectEvent,
  useId,
  useRef,
  useState,
} from 'react'
import { Button } from '@/components/atoms/button'
import { Modal } from '@/components/atoms/modal'
import { ModalContent } from '@/components/atoms/modal/modal-content'
import styles from '@/components/templates/dashboard/accounts/accounts.module.css'
import { CreateAccountForm } from '@/components/templates/dashboard/accounts/create-account-form'
import type {
  AccountListItem,
  CreateAccountTranslations,
} from '@/components/templates/dashboard/accounts/types'
import {
  type CreateAccountFormState,
  createAccountAction,
} from '@/modules/account/adapters/in/create-action'
import { toast } from '@/utils/toast'

type CreateAccountProps = {
  translations: CreateAccountTranslations
  onAccountCreated?: (account: AccountListItem) => void
}

function buildInitialFormState(): CreateAccountFormState {
  return {
    errors: null,
    feedback: null,
    createdAccount: null,
    values: {
      name: '',
      balance: '',
    },
  }
}

export function CreateAccount({
  translations,
  onAccountCreated,
}: CreateAccountProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [formVersion, setFormVersion] = useState(0)
  const handledFeedbackTimestampRef = useRef<number | null>(null)
  const [state, formAction, pending] = useActionState<
    CreateAccountFormState,
    FormData
  >(createAccountAction, buildInitialFormState())
  const nameId = useId()
  const balanceId = useId()

  const handleFeedback = useEffectEvent(() => {
    if (!state.feedback) return

    if (state.feedback.type === 'success') {
      if (state.createdAccount) {
        onAccountCreated?.({
          id: state.createdAccount.id,
          name: state.createdAccount.name,
          balanceFormatted: state.createdAccount.balanceFormatted,
        })
      }

      setFormVersion((currentVersion) => currentVersion + 1)
      toast.success(state.feedback.message)
      setIsOpen(false)
      return
    }

    toast.error(state.feedback.message)
  })

  useEffect(() => {
    if (!state.feedback) return
    if (handledFeedbackTimestampRef.current === state.feedback.timestamp) return

    handledFeedbackTimestampRef.current = state.feedback.timestamp
    handleFeedback()
  }, [handleFeedback, state.feedback])

  return (
    <>
      <Modal isOpen={isOpen}>
        <ModalContent
          title={translations.newAccount}
          onClose={() => setIsOpen(false)}
        >
          <CreateAccountForm
            formVersion={formVersion}
            formAction={formAction}
            pending={pending}
            state={state}
            translations={translations}
            nameId={nameId}
            balanceId={balanceId}
          />
        </ModalContent>
      </Modal>
      <Button
        type='button'
        className={styles.fabButton}
        onClick={() => setIsOpen(true)}
        aria-label={translations.newAccount}
        title={translations.newAccount}
      >
        <Plus className={styles.fabButtonIcon} />
      </Button>
    </>
  )
}
