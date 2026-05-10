import type {
  CreateMovementTranslations,
  MovementFilterTranslations,
} from '@/components/templates/dashboard/movements/types'

type Translate = (key: string) => string

export function buildCreateMovementTranslations(
  translate: Translate,
): CreateMovementTranslations {
  return {
    newMovement: translate('new_movement'),
    accountLabel: translate('form.account_label'),
    accountPlaceholder: translate('form.account_placeholder'),
    amountLabel: translate('form.amount_label'),
    amountPlaceholder: translate('form.amount_placeholder'),
    descriptionLabel: translate('form.description_label'),
    descriptionPlaceholder: translate('form.description_placeholder'),
    movementTypeLabel: translate('form.movement_type_label'),
    movementTypePlaceholder: translate('form.movement_type_placeholder'),
    categoryLabel: translate('form.category_label'),
    categoryPlaceholder: translate('form.category_placeholder'),
    searchAccountPlaceholder: translate('form.search_account_placeholder'),
    searchCategoryPlaceholder: translate('form.search_category_placeholder'),
    createMovement: translate('form.submit_button'),
    creatingMovement: translate('form.submitting'),
  }
}

export function buildMovementFilterTranslations(
  translate: Translate,
): MovementFilterTranslations {
  return {
    title: translate('filters.title'),
    open: translate('filters.open'),
    apply: translate('filters.apply'),
    reset: translate('filters.reset'),
    dateFromLabel: translate('filters.date_from_label'),
    dateToLabel: translate('filters.date_to_label'),
  }
}
