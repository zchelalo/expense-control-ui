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
import { CreateCategory } from '@/components/templates/dashboard/movements/create-category'
import { CreateMovementForm } from '@/components/templates/dashboard/movements/create-movement-form'
import { buildCreatedMovementListItem } from '@/components/templates/dashboard/movements/create-movement-list-item'
import styles from '@/components/templates/dashboard/movements/movements.module.css'
import type {
  CreateMovementTranslations,
  MovementListItem,
  MovementTypeOption,
  SelectOption,
} from '@/components/templates/dashboard/movements/types'
import { useAsyncSelectOptions } from '@/hooks/use-async-select-options'
import { searchAccountOptionsAction } from '@/modules/account/adapters/in/search-options-action'
import { searchCategoryOptionsAction } from '@/modules/category/adapters/in/search-options-action'
import {
  type CreateMovementFormState,
  createMovementAction,
} from '@/modules/movement/adapters/in/create-action'
import { findOptionByValue } from '@/utils/select-options'
import { toast } from '@/utils/toast'

type CreateMovementProps = {
  translations: CreateMovementTranslations
  accountId?: string | null
  accounts: SelectOption[]
  initialAccountNextCursor: string | null
  movementTypes: MovementTypeOption[]
  categories: SelectOption[]
  initialCategoryNextCursor: string | null
  onMovementCreated?: (movement: MovementListItem) => void
  onCategoryCreated?: (category: SelectOption) => void
}

function buildInitialFormState(
  accountId: string | null | undefined,
): CreateMovementFormState {
  return {
    errors: null,
    feedback: null,
    createdMovement: null,
    values: {
      accountId: accountId ?? '',
      amount: '',
      description: '',
      movementTypeId: '',
      categoryId: '',
    },
  }
}

export function CreateMovement({
  translations,
  accountId = null,
  accounts,
  initialAccountNextCursor,
  movementTypes,
  categories,
  initialCategoryNextCursor,
  onMovementCreated,
  onCategoryCreated,
}: CreateMovementProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false)
  const [formVersion, setFormVersion] = useState(0)
  const [selectedMovementTypeId, setSelectedMovementTypeId] = useState('')
  const handledFeedbackTimestampRef = useRef<number | null>(null)
  const [state, formAction, pending] = useActionState<
    CreateMovementFormState,
    FormData
  >(createMovementAction, buildInitialFormState(accountId))
  const {
    options: accountOptions,
    selectedValue: selectedAccountId,
    selectedOption: selectedAccountOption,
    isLoadingMore: accountIsLoadingMore,
    hasMore: accountHasMore,
    setSearchText: setAccountSearchText,
    handleChange: handleAccountChange,
    handleLoadMore: handleAccountLoadMore,
    selectValue: selectAccountValue,
    reset: resetAccountSelect,
  } = useAsyncSelectOptions({
    initialOptions: accounts,
    initialNextCursor: initialAccountNextCursor,
    initialValue: accountId,
    isOpen,
    searchOptions: searchAccountOptionsAction,
  })
  const {
    options: categoryOptions,
    selectedValue: selectedCategoryId,
    selectedOption: selectedCategoryOption,
    isLoadingMore: categoryIsLoadingMore,
    hasMore: categoryHasMore,
    setSearchText: setCategorySearchText,
    handleChange: handleCategoryChange,
    handleLoadMore: handleCategoryLoadMore,
    reset: resetCategorySelect,
    upsertOption: upsertCategoryOption,
  } = useAsyncSelectOptions({
    initialOptions: categories,
    initialNextCursor: initialCategoryNextCursor,
    isOpen,
    searchOptions: searchCategoryOptionsAction,
  })
  const accountFieldId = useId()
  const amountId = useId()
  const descriptionId = useId()
  const movementTypeId = useId()
  const categoryId = useId()

  useEffect(() => {
    if (!accountId) return

    selectAccountValue(accountId)
  }, [accountId, selectAccountValue])

  const handleFeedback = useEffectEvent(() => {
    if (!state.feedback) return

    if (state.feedback.type === 'success') {
      const nextSelectedAccountId = accountId ?? selectedAccountId
      const nextSelectedAccountOption =
        findOptionByValue(accountOptions, nextSelectedAccountId) ??
        findOptionByValue(accounts, nextSelectedAccountId) ??
        selectedAccountOption

      if (state.createdMovement) {
        onMovementCreated?.(
          buildCreatedMovementListItem({
            createdMovement: state.createdMovement,
            accountName: nextSelectedAccountOption?.label ?? '',
            categoryName: selectedCategoryOption?.label ?? '',
            movementTypes,
            selectedMovementTypeId,
          }),
        )
      }

      setFormVersion((currentVersion) => currentVersion + 1)
      resetAccountSelect(nextSelectedAccountId)
      setSelectedMovementTypeId('')
      resetCategorySelect('')
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

  const handleClose = () => {
    resetAccountSelect()
    resetCategorySelect()
    setIsCreateCategoryOpen(false)
    setIsOpen(false)
  }

  const handleCreatedCategory = (category: SelectOption) => {
    upsertCategoryOption(category, true)
    setCategorySearchText('')
    onCategoryCreated?.(category)
    setIsCreateCategoryOpen(false)
  }

  const accountSearchable = {
    onSearchTextChange: setAccountSearchText,
    onLoadMore: handleAccountLoadMore,
    searchPlaceholder: translations.searchAccountPlaceholder,
    hasMore: accountHasMore,
    isLoadingMore: accountIsLoadingMore,
  }

  const categorySearchable = {
    onSearchTextChange: setCategorySearchText,
    onLoadMore: handleCategoryLoadMore,
    searchPlaceholder: translations.searchCategoryPlaceholder,
    hasMore: categoryHasMore,
    isLoadingMore: categoryIsLoadingMore,
  }

  return (
    <>
      <Modal isOpen={isOpen}>
        <ModalContent title={translations.newMovement} onClose={handleClose}>
          <CreateMovementForm
            formVersion={formVersion}
            formAction={formAction}
            pending={pending}
            state={state}
            translations={translations}
            accountFieldId={accountFieldId}
            amountId={amountId}
            descriptionId={descriptionId}
            movementTypeId={movementTypeId}
            categoryId={categoryId}
            selectedAccountId={selectedAccountId}
            selectedMovementTypeId={selectedMovementTypeId}
            selectedCategoryId={selectedCategoryId}
            accountOptions={accountOptions}
            movementTypes={movementTypes}
            categoryOptions={categoryOptions}
            onAccountChange={handleAccountChange}
            onMovementTypeChange={setSelectedMovementTypeId}
            onCategoryChange={handleCategoryChange}
            accountSearchable={accountSearchable}
            categorySearchable={categorySearchable}
            categoryAction={
              <CreateCategory
                isOpen={isCreateCategoryOpen}
                onOpen={() => setIsCreateCategoryOpen(true)}
                onClose={() => setIsCreateCategoryOpen(false)}
                disabled={pending}
                onCategoryCreated={handleCreatedCategory}
              />
            }
          />
        </ModalContent>
      </Modal>
      <Button
        type='button'
        className={styles.fabButton}
        onClick={() => setIsOpen(true)}
        aria-label={translations.newMovement}
        title={translations.newMovement}
      >
        <Plus className={styles.fabButtonIcon} />
      </Button>
    </>
  )
}
