export class DescriptionVO {
  private readonly description: string

  constructor(description: string) {
    this.description = description
  }

  getValue(): string {
    return this.description
  }
}
