export class PasswordVO {
  private readonly password: string

  constructor(password: string) {
    if (!this.looksLikePassword(password)) {
      throw new Error('Invalid password format')
    }
    this.password = password
  }

  private looksLikePassword(password: string): boolean {
    return password.length >= 8
  }

  getValue(): string {
    return this.password
  }
}
