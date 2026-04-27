export class MovementTypeEntity {
  constructor(
    private readonly id: string,
    private readonly key: string,
    private readonly name: string,
    private readonly description: string | null = null,
  ) {}

  getId(): string {
    return this.id
  }

  getKey(): string {
    return this.key
  }

  getName(): string {
    return this.name
  }

  getDescription(): string | null {
    return this.description
  }
}
