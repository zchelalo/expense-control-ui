import type {
  MovementListItem,
  MovementTypeOption,
} from '@/components/templates/dashboard/movements/types'
import type { CreateMovementFormState } from '@/modules/movement/adapters/in/create-action'

type CreatedMovement = NonNullable<CreateMovementFormState['createdMovement']>

type BuildCreatedMovementListItemParams = {
  createdMovement: CreatedMovement
  accountName: string
  categoryName: string
  movementTypes: MovementTypeOption[]
  selectedMovementTypeId: string
}

export function buildCreatedMovementListItem({
  createdMovement,
  accountName,
  categoryName,
  movementTypes,
  selectedMovementTypeId,
}: BuildCreatedMovementListItemParams): MovementListItem {
  const selectedMovementType =
    movementTypes.find(
      (movementType) => movementType.value === createdMovement.movementTypeId,
    ) ??
    movementTypes.find(
      (movementType) => movementType.value === selectedMovementTypeId,
    ) ??
    null

  return {
    id: createdMovement.id,
    accountId: createdMovement.accountId,
    accountName,
    description: createdMovement.description,
    categoryId: createdMovement.categoryId,
    categoryName,
    createdAt: createdMovement.createdAt,
    movementTypeId: createdMovement.movementTypeId,
    movementTypeKey: selectedMovementType?.key ?? '',
    movementTypeText: selectedMovementType?.label ?? '',
    amount: createdMovement.amountFormatted,
  }
}
