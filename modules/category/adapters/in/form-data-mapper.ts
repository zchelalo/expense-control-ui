function getFormValue(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === 'string' ? value : ''
}

export function formDataToCreateCategory(formData: FormData) {
  return {
    name: getFormValue(formData, 'name'),
  }
}
