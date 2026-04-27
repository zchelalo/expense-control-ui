export type MovementListItem = {
  id: string
  accountId: string
  accountName: string
  description: string
  categoryId: string
  categoryName: string
  createdAt: string
  movementTypeId: string
  movementTypeKey: string
  movementTypeText: string
  amount: string
}

export type SelectOption = {
  value: string
  label: string
}

export type MovementTypeOption = SelectOption & {
  key: string
}
