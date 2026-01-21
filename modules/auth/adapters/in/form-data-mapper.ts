export function formDataToLogin(formData: FormData) {
  return {
    email: String(formData.get('email') ?? ''),
    password: String(formData.get('password') ?? ''),
  }
}

export function formDataToSignUp(formData: FormData) {
  return {
    email: String(formData.get('email') ?? ''),
    password: String(formData.get('password') ?? ''),
    confirmPassword: String(formData.get('confirmPassword') ?? ''),
  }
}
