import { IdVO } from '@/modules/movement/domain/id-vo'
import { NameVO } from '@/modules/movement/domain/name-vo'

export class AccountRef {
  private readonly id: IdVO
  private readonly name: NameVO

  constructor(id: string, name: string) {
    this.id = new IdVO(id)
    this.name = new NameVO(name)
  }

  getId(): IdVO {
    return this.id
  }

  getName(): NameVO {
    return this.name
  }
}
