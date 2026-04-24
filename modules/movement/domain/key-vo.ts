export class KeyVO {
  private readonly key: string

  constructor(key: string) {
    this.key = key
  }

  getValue(): string {
    return this.key
  }
}
