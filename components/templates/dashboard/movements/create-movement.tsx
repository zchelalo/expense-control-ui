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
import { FlexBox } from '@/components/atoms/flex-box'
import { InputText } from '@/components/atoms/input-text'
import { Label } from '@/components/atoms/label'
import { Modal } from '@/components/atoms/modal'
import { ModalContent } from '@/components/atoms/modal/modal-content'
import { Text } from '@/components/atoms/text'
import { CreateMovementSelectField } from '@/components/templates/dashboard/movements/create-movement-select-field'
import { FormFieldErrors } from '@/components/templates/dashboard/movements/form-field-errors'
import styles from '@/components/templates/dashboard/movements/movements.module.css'
import { findOptionByValue } from '@/components/templates/dashboard/movements/select-option-utils'
import type {
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
import { toast } from '@/utils/toast'

type CreateMovementProps = {
  translations: {
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
  accountId?: string | null
  accounts: SelectOption[]
  initialAccountNextCursor: string | null
  movementTypes: MovementTypeOption[]
  categories: SelectOption[]
  initialCategoryNextCursor: string | null
  onMovementCreated?: (movement: MovementListItem) => void
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
}: CreateMovementProps) {
  const [isOpen, setIsOpen] = useState(false)
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
        const createdMovement = state.createdMovement
        const nextSelectedMovementType =
          movementTypes.find(
            (movementType) =>
              movementType.value === createdMovement.movementTypeId,
          ) ??
          movementTypes.find(
            (movementType) => movementType.value === selectedMovementTypeId,
          ) ??
          null

        onMovementCreated?.({
          id: createdMovement.id,
          accountId: createdMovement.accountId,
          accountName: nextSelectedAccountOption?.label ?? '',
          description: createdMovement.description,
          categoryId: createdMovement.categoryId,
          categoryName: selectedCategoryOption?.label ?? '',
          createdAt: createdMovement.createdAt,
          movementTypeId: createdMovement.movementTypeId,
          movementTypeKey: nextSelectedMovementType?.key ?? '',
          movementTypeText: nextSelectedMovementType?.label ?? '',
          amount: createdMovement.amountFormatted,
        })
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
    setIsOpen(false)
  }

  return (
    <>
      <Modal isOpen={isOpen}>
        <ModalContent title={translations.newMovement} onClose={handleClose}>
          <form key={formVersion} className={styles.form} action={formAction}>
            <CreateMovementSelectField
              id={accountFieldId}
              label={translations.accountLabel}
              name='accountId'
              value={selectedAccountId}
              options={accountOptions}
              onChange={handleAccountChange}
              placeholder={translations.accountPlaceholder}
              errorMessages={state.errors?.accountId}
              disabled={pending}
              searchable={{
                onSearchTextChange: setAccountSearchText,
                onLoadMore: handleAccountLoadMore,
                searchPlaceholder: translations.searchAccountPlaceholder,
                hasMore: accountHasMore,
                isLoadingMore: accountIsLoadingMore,
              }}
            />
            <FlexBox
              variant='div'
              direction='column'
              alignItems='stretch'
              gap={2}
              className={styles.formGroup}
            >
              <Label htmlFor={amountId}>{translations.amountLabel}</Label>
              <InputText
                id={amountId}
                name='amount'
                type='number'
                min='0'
                step='0.01'
                inputMode='decimal'
                placeholder={translations.amountPlaceholder}
                error={!!state.errors?.amount}
                disabled={pending}
                defaultValue={state.values.amount}
              />
              <FormFieldErrors messages={state.errors?.amount} />
            </FlexBox>
            <FlexBox
              variant='div'
              direction='column'
              alignItems='stretch'
              gap={2}
              className={styles.formGroup}
            >
              <Label htmlFor={descriptionId}>
                {translations.descriptionLabel}
              </Label>
              <InputText
                id={descriptionId}
                name='description'
                placeholder={translations.descriptionPlaceholder}
                error={!!state.errors?.description}
                disabled={pending}
                defaultValue={state.values.description}
              />
              <FormFieldErrors messages={state.errors?.description} />
            </FlexBox>
            <CreateMovementSelectField
              id={movementTypeId}
              label={translations.movementTypeLabel}
              name='movementTypeId'
              value={selectedMovementTypeId}
              options={movementTypes}
              onChange={setSelectedMovementTypeId}
              placeholder={translations.movementTypePlaceholder}
              errorMessages={state.errors?.movementTypeId}
              disabled={pending}
            />
            <CreateMovementSelectField
              id={categoryId}
              label={translations.categoryLabel}
              name='categoryId'
              value={selectedCategoryId}
              options={categoryOptions}
              onChange={handleCategoryChange}
              placeholder={translations.categoryPlaceholder}
              errorMessages={state.errors?.categoryId}
              disabled={pending}
              searchable={{
                onSearchTextChange: setCategorySearchText,
                onLoadMore: handleCategoryLoadMore,
                searchPlaceholder: translations.searchCategoryPlaceholder,
                hasMore: categoryHasMore,
                isLoadingMore: categoryIsLoadingMore,
              }}
            />
            <Button
              type='submit'
              className={styles.submitButton}
              disabled={pending}
            >
              {pending
                ? translations.creatingMovement
                : translations.createMovement}
            </Button>
          </form>
        </ModalContent>
      </Modal>
      <Button type='button' onClick={() => setIsOpen(true)}>
        <FlexBox variant='div' direction='row' alignItems='center' gap={2}>
          <Text typographySize='small' typographyWeight='medium'>
            {translations.newMovement}
          </Text>
          <Plus size={16} />
        </FlexBox>
      </Button>
    </>
  )
}
