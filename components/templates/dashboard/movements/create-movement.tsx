'use client'

import { Plus } from 'lucide-react'
import { useActionState, useEffect, useId, useRef, useState } from 'react'
import { Button } from '@/components/atoms/button'
import { FlexBox } from '@/components/atoms/flex-box'
import { InputText } from '@/components/atoms/input-text'
import { Label } from '@/components/atoms/label'
import { Modal } from '@/components/atoms/modal'
import { ModalContent } from '@/components/atoms/modal/modal-content'
import { Text } from '@/components/atoms/text'
import { List } from '@/components/molecules/list'
import { Select } from '@/components/molecules/select'
import styles from '@/components/templates/dashboard/movements/movements.module.css'
import type {
  MovementListItem,
  MovementTypeOption,
  SelectOption,
} from '@/components/templates/dashboard/movements/types'
import { searchAccountOptionsAction } from '@/modules/account/adapters/in/search-options-action'
import { searchCategoryOptionsAction } from '@/modules/category/adapters/in/search-options-action'
import {
  type CreateMovementFormState,
  createMovementAction,
} from '@/modules/movement/adapters/in/create-action'
import { toast } from '@/utils/toast'

function findOptionByValue(
  options: SelectOption[],
  value: string | null | undefined,
): SelectOption | null {
  if (!value) return null

  return options.find((option) => option.value === value) ?? null
}

function preserveSelectedOption(
  options: SelectOption[],
  selectedOption: SelectOption | null,
): SelectOption[] {
  if (!selectedOption) return options
  if (options.some((option) => option.value === selectedOption.value)) {
    return options
  }

  return [selectedOption, ...options]
}

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
  movementTypes: MovementTypeOption[]
  categories: SelectOption[]
  onMovementCreated?: (movement: MovementListItem) => void
}

export function CreateMovement({
  translations,
  accountId = null,
  accounts,
  movementTypes,
  categories,
  onMovementCreated,
}: CreateMovementProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [formVersion, setFormVersion] = useState(0)
  const [accountOptions, setAccountOptions] = useState(accounts)
  const [categoryOptions, setCategoryOptions] = useState(categories)
  const [accountSearchText, setAccountSearchText] = useState('')
  const [categorySearchText, setCategorySearchText] = useState('')
  const [selectedAccountId, setSelectedAccountId] = useState(accountId ?? '')
  const [selectedAccountOption, setSelectedAccountOption] =
    useState<SelectOption | null>(findOptionByValue(accounts, accountId))
  const [selectedMovementTypeId, setSelectedMovementTypeId] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [selectedCategoryOption, setSelectedCategoryOption] =
    useState<SelectOption | null>(null)
  const accountSearchRequestRef = useRef(0)
  const categorySearchRequestRef = useRef(0)
  const handledFeedbackTimestampRef = useRef<number | null>(null)
  const selectedAccountIdRef = useRef(selectedAccountId)
  const selectedAccountOptionRef = useRef(selectedAccountOption)
  const selectedMovementTypeIdRef = useRef(selectedMovementTypeId)
  const selectedCategoryOptionRef = useRef(selectedCategoryOption)
  const accountOptionsRef = useRef(accountOptions)
  const [state, formAction, pending] = useActionState<
    CreateMovementFormState,
    FormData
  >(createMovementAction, {
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
  })
  const accountFieldId = useId()
  const amountId = useId()
  const descriptionId = useId()
  const movementTypeId = useId()
  const categoryId = useId()

  useEffect(() => {
    setAccountOptions(preserveSelectedOption(accounts, selectedAccountOption))
  }, [accounts, selectedAccountOption])

  useEffect(() => {
    setCategoryOptions(
      preserveSelectedOption(categories, selectedCategoryOption),
    )
  }, [categories, selectedCategoryOption])

  useEffect(() => {
    if (!accountId) return

    setSelectedAccountId(accountId)
    setSelectedAccountOption(findOptionByValue(accounts, accountId))
  }, [accountId, accounts])

  useEffect(() => {
    selectedAccountIdRef.current = selectedAccountId
  }, [selectedAccountId])

  useEffect(() => {
    selectedAccountOptionRef.current = selectedAccountOption
  }, [selectedAccountOption])

  useEffect(() => {
    selectedMovementTypeIdRef.current = selectedMovementTypeId
  }, [selectedMovementTypeId])

  useEffect(() => {
    selectedCategoryOptionRef.current = selectedCategoryOption
  }, [selectedCategoryOption])

  useEffect(() => {
    accountOptionsRef.current = accountOptions
  }, [accountOptions])

  useEffect(() => {
    if (!state.feedback) return
    if (handledFeedbackTimestampRef.current === state.feedback.timestamp) return

    handledFeedbackTimestampRef.current = state.feedback.timestamp

    if (state.feedback.type === 'success') {
      const nextSelectedAccountId = accountId ?? selectedAccountIdRef.current
      const nextSelectedAccountOption =
        findOptionByValue(accountOptionsRef.current, nextSelectedAccountId) ??
        findOptionByValue(accounts, nextSelectedAccountId) ??
        selectedAccountOptionRef.current

      if (state.createdMovement) {
        const nextSelectedMovementType =
          movementTypes.find(
            (movementType) =>
              movementType.value === state.createdMovement?.movementTypeId,
          ) ??
          movementTypes.find(
            (movementType) =>
              movementType.value === selectedMovementTypeIdRef.current,
          ) ??
          null

        onMovementCreated?.({
          id: state.createdMovement.id,
          accountId: state.createdMovement.accountId,
          accountName: nextSelectedAccountOption?.label ?? '',
          description: state.createdMovement.description,
          categoryId: state.createdMovement.categoryId,
          categoryName: selectedCategoryOptionRef.current?.label ?? '',
          createdAt: state.createdMovement.createdAt,
          movementTypeId: state.createdMovement.movementTypeId,
          movementTypeKey: nextSelectedMovementType?.key ?? '',
          movementTypeText: nextSelectedMovementType?.label ?? '',
          amount: state.createdMovement.amountFormatted,
        })
      }

      setFormVersion((currentVersion) => currentVersion + 1)
      setSelectedAccountId(nextSelectedAccountId)
      setSelectedAccountOption(nextSelectedAccountOption)
      setSelectedMovementTypeId('')
      setSelectedCategoryId('')
      setSelectedCategoryOption(null)
      setAccountSearchText('')
      setCategorySearchText('')
      setAccountOptions(
        preserveSelectedOption(accounts, nextSelectedAccountOption),
      )
      setCategoryOptions(categories)
      toast.success(state.feedback.message)
      setIsOpen(false)
      return
    }

    toast.error(state.feedback.message)
  }, [
    accountId,
    accounts,
    categories,
    movementTypes,
    onMovementCreated,
    state.createdMovement,
    state.feedback,
  ])

  useEffect(() => {
    if (!isOpen) return

    const normalizedSearchText = accountSearchText.trim()
    if (!normalizedSearchText) {
      setAccountOptions(preserveSelectedOption(accounts, selectedAccountOption))
      return
    }

    const timeout = setTimeout(() => {
      const requestId = accountSearchRequestRef.current + 1
      accountSearchRequestRef.current = requestId

      void searchAccountOptionsAction(normalizedSearchText)
        .then((nextAccountOptions) => {
          if (accountSearchRequestRef.current !== requestId) return

          setAccountOptions(
            preserveSelectedOption(nextAccountOptions, selectedAccountOption),
          )
        })
        .catch(() => undefined)
    }, 250)

    return () => clearTimeout(timeout)
  }, [accountSearchText, accounts, isOpen, selectedAccountOption])

  useEffect(() => {
    if (!isOpen) return

    const normalizedSearchText = categorySearchText.trim()
    if (!normalizedSearchText) {
      setCategoryOptions(
        preserveSelectedOption(categories, selectedCategoryOption),
      )
      return
    }

    const timeout = setTimeout(() => {
      const requestId = categorySearchRequestRef.current + 1
      categorySearchRequestRef.current = requestId

      void searchCategoryOptionsAction(normalizedSearchText)
        .then((nextCategoryOptions) => {
          if (categorySearchRequestRef.current !== requestId) return

          setCategoryOptions(
            preserveSelectedOption(nextCategoryOptions, selectedCategoryOption),
          )
        })
        .catch(() => undefined)
    }, 250)

    return () => clearTimeout(timeout)
  }, [categories, categorySearchText, isOpen, selectedCategoryOption])

  const handleClose = () => {
    setAccountSearchText('')
    setCategorySearchText('')
    setAccountOptions(preserveSelectedOption(accounts, selectedAccountOption))
    setCategoryOptions(
      preserveSelectedOption(categories, selectedCategoryOption),
    )
    setIsOpen(false)
  }

  const handleAccountChange = (value: string) => {
    const nextSelectedAccountOption =
      findOptionByValue(accountOptions, value) ??
      findOptionByValue(accounts, value)

    setSelectedAccountId(value)
    setSelectedAccountOption(nextSelectedAccountOption)
  }

  const handleCategoryChange = (value: string) => {
    const nextSelectedCategoryOption =
      findOptionByValue(categoryOptions, value) ??
      findOptionByValue(categories, value)

    setSelectedCategoryId(value)
    setSelectedCategoryOption(nextSelectedCategoryOption)
  }

  return (
    <>
      <Modal isOpen={isOpen}>
        <ModalContent title={translations.newMovement} onClose={handleClose}>
          <form key={formVersion} className={styles.form} action={formAction}>
            <FlexBox
              variant='div'
              direction='column'
              alignItems='stretch'
              gap={2}
              className={styles.formGroup}
            >
              <Label htmlFor={accountFieldId}>
                {translations.accountLabel}
              </Label>
              <input type='hidden' name='accountId' value={selectedAccountId} />
              <Select
                id={accountFieldId}
                options={accountOptions}
                value={selectedAccountId}
                onChange={handleAccountChange}
                onSearchTextChange={setAccountSearchText}
                placeholder={translations.accountPlaceholder}
                searchInput
                searchPlaceholder={translations.searchAccountPlaceholder}
                triggerClassName={
                  state.errors?.accountId ? styles.selectError : undefined
                }
                disabled={pending}
              />
              {state.errors?.accountId && state.errors.accountId.length > 0 && (
                <List
                  listStyle='disc'
                  messages={state.errors.accountId}
                  className={styles.listError}
                  isErrorList
                />
              )}
            </FlexBox>
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
              {state.errors?.amount && state.errors.amount.length > 0 && (
                <List
                  listStyle='disc'
                  messages={state.errors.amount}
                  className={styles.listError}
                  isErrorList
                />
              )}
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
              {state.errors?.description &&
                state.errors.description.length > 0 && (
                  <List
                    listStyle='disc'
                    messages={state.errors.description}
                    className={styles.listError}
                    isErrorList
                  />
                )}
            </FlexBox>
            <FlexBox
              variant='div'
              direction='column'
              alignItems='stretch'
              gap={2}
              className={styles.formGroup}
            >
              <Label htmlFor={movementTypeId}>
                {translations.movementTypeLabel}
              </Label>
              <input
                type='hidden'
                name='movementTypeId'
                value={selectedMovementTypeId}
              />
              <Select
                id={movementTypeId}
                options={movementTypes}
                value={selectedMovementTypeId}
                onChange={setSelectedMovementTypeId}
                placeholder={translations.movementTypePlaceholder}
                triggerClassName={
                  state.errors?.movementTypeId ? styles.selectError : undefined
                }
                disabled={pending}
              />
              {state.errors?.movementTypeId &&
                state.errors.movementTypeId.length > 0 && (
                  <List
                    listStyle='disc'
                    messages={state.errors.movementTypeId}
                    className={styles.listError}
                    isErrorList
                  />
                )}
            </FlexBox>
            <FlexBox
              variant='div'
              direction='column'
              alignItems='stretch'
              gap={2}
              className={styles.formGroup}
            >
              <Label htmlFor={categoryId}>{translations.categoryLabel}</Label>
              <input
                type='hidden'
                name='categoryId'
                value={selectedCategoryId}
              />
              <Select
                id={categoryId}
                options={categoryOptions}
                value={selectedCategoryId}
                onChange={handleCategoryChange}
                onSearchTextChange={setCategorySearchText}
                placeholder={translations.categoryPlaceholder}
                searchInput
                searchPlaceholder={translations.searchCategoryPlaceholder}
                triggerClassName={
                  state.errors?.categoryId ? styles.selectError : undefined
                }
                disabled={pending}
              />
              {state.errors?.categoryId &&
                state.errors.categoryId.length > 0 && (
                  <List
                    listStyle='disc'
                    messages={state.errors.categoryId}
                    className={styles.listError}
                    isErrorList
                  />
                )}
            </FlexBox>
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
