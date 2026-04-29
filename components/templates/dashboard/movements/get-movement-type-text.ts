type MovementTypeTranslationKey =
  | 'movement_type.income'
  | 'movement_type.expense'

type MovementTypeTranslator = (key: MovementTypeTranslationKey) => string

export function getMovementTypeText(
  movementTypeKey: string,
  translate: MovementTypeTranslator,
) {
  switch (movementTypeKey) {
    case 'income':
      return translate('movement_type.income')
    case 'expense':
      return translate('movement_type.expense')
    default:
      return movementTypeKey
  }
}
