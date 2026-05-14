'use client'

import { Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
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
import { CreateCategoryForm } from '@/components/templates/dashboard/movements/create-category-form'
import styles from '@/components/templates/dashboard/movements/movements.module.css'
import type { SelectOption } from '@/components/templates/dashboard/movements/types'
import { Namespace } from '@/constants/common'
import {
  type CreateCategoryFormState,
  createCategoryAction,
} from '@/modules/category/adapters/in/create-action'
import { toast } from '@/utils/toast'

type CreateCategoryProps = {
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
  disabled?: boolean
  onCategoryCreated?: (category: SelectOption) => void
}

function buildInitialFormState(): CreateCategoryFormState {
  return {
    errors: null,
    feedback: null,
    createdCategory: null,
    values: {
      name: '',
    },
  }
}

export function CreateCategory({
  isOpen,
  onOpen,
  onClose,
  disabled = false,
  onCategoryCreated,
}: CreateCategoryProps) {
  const t = useTranslations(Namespace.Category)
  const [formVersion, setFormVersion] = useState(0)
  const handledFeedbackTimestampRef = useRef<number | null>(null)
  const [state, formAction, pending] = useActionState<
    CreateCategoryFormState,
    FormData
  >(createCategoryAction, buildInitialFormState())
  const nameId = useId()

  const translations = {
    newCategory: t('new_category'),
    nameLabel: t('form.name_label'),
    namePlaceholder: t('form.name_placeholder'),
    createCategory: t('form.submit_button'),
    creatingCategory: t('form.submitting'),
  }

  const handleFeedback = useEffectEvent(() => {
    if (!state.feedback) return

    if (state.feedback.type === 'success') {
      if (state.createdCategory) {
        onCategoryCreated?.({
          value: state.createdCategory.id,
          label: state.createdCategory.name,
        })
      }

      setFormVersion((currentVersion) => currentVersion + 1)
      toast.success(state.feedback.message)
      onClose()
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
      <Button
        type='button'
        variant='primary'
        className={styles.selectFieldActionButton}
        onClick={onOpen}
        disabled={disabled}
        aria-label={translations.newCategory}
        title={translations.newCategory}
      >
        <Plus size={16} />
      </Button>
      <Modal isOpen={isOpen}>
        <ModalContent title={translations.newCategory} onClose={onClose}>
          <CreateCategoryForm
            formVersion={formVersion}
            formAction={formAction}
            pending={pending}
            state={state}
            translations={translations}
            nameId={nameId}
          />
        </ModalContent>
      </Modal>
    </>
  )
}
