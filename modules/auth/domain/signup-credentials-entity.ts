import { EmailVO } from '@/modules/auth/domain/email-vo'
import { PasswordVO } from '@/modules/auth/domain/password-vo'

export class SignUpCredentialsEntity {
  private readonly email: EmailVO
  private readonly password: PasswordVO
  private readonly confirmPassword: PasswordVO

  constructor(email: string, password: string, confirmPassword: string) {
    this.email = new EmailVO(email)
    this.password = new PasswordVO(password)
    this.confirmPassword = new PasswordVO(confirmPassword)

    if (this.password.getValue() !== this.confirmPassword.getValue()) {
      throw new Error('Password and confirm password do not match')
    }
  }

  getEmail(): string {
    return this.email.getValue()
  }

  getPassword(): string {
    return this.password.getValue()
  }
}
