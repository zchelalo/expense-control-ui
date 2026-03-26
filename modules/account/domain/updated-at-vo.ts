export class UpdatedAtVO {
  private readonly updatedAt: string

  constructor(updatedAt: string) {
    this.updatedAt = updatedAt
  }

  getValue(): string {
    return this.updatedAt
  }
}
