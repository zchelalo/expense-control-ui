export class EmailVO {
  private readonly email: string

  constructor(email: string) {
    if (!this.looksLikeEmail(email)) {
      throw new Error('Invalid email format')
    }
    this.email = email
  }

  private looksLikeEmail(email: string): boolean {
    const at = email.indexOf('@')
    if (at <= 0 || at !== email.lastIndexOf('@') || at >= email.length - 1) {
      return false
    }

    const dot = email.lastIndexOf('.')
    if (dot <= at + 1 || dot >= email.length - 1) {
      return false
    }

    return true
  }

  getValue(): string {
    return this.email
  }
}
