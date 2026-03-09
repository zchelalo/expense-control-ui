import { EmailVO } from '@/modules/auth/domain/email-vo'
import { PasswordVO } from '@/modules/auth/domain/password-vo'

export class LoginCredentialsEntity {
  private readonly email: EmailVO
  private readonly password: PasswordVO

  constructor(email: string, password: string) {
    this.email = new EmailVO(email)
    this.password = new PasswordVO(password)
  }

  getEmail(): string {
    return this.email.getValue()
  }

  getPassword(): string {
    return this.password.getValue()
  }
}
