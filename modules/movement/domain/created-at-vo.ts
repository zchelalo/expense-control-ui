export class CreatedAtVO {
  private readonly createdAt: string

  constructor(createdAt: string) {
    this.createdAt = createdAt
  }

  getValue(): string {
    return this.createdAt
  }
}
