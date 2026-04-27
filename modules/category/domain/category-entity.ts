export class CategoryEntity {
  constructor(
    private readonly id: string,
    private readonly name: string,
  ) {}

  getId(): string {
    return this.id
  }

  getName(): string {
    return this.name
  }
}

export interface PaginatedResult {
  items: CategoryEntity[]
  nextCursor: string | null
  prevCursor: string | null
}
