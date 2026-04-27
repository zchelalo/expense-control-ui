function getFormValue(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === 'string' ? value : ''
}

export function formDataToCreateMovement(formData: FormData) {
  return {
    accountId: getFormValue(formData, 'accountId'),
    amount: getFormValue(formData, 'amount'),
    description: getFormValue(formData, 'description'),
    movementTypeId: getFormValue(formData, 'movementTypeId'),
    categoryId: getFormValue(formData, 'categoryId'),
  }
}
