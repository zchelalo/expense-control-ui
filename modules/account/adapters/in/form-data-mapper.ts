function getFormValue(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === 'string' ? value : ''
}

export function formDataToCreateAccount(formData: FormData) {
  return {
    name: getFormValue(formData, 'name'),
    balance: getFormValue(formData, 'balance'),
  }
}
