import { IdVO } from '@/modules/movement/domain/id-vo'
import { KeyVO } from '@/modules/movement/domain/key-vo'
import { NameVO } from '@/modules/movement/domain/name-vo'

export class MovementTypeRef {
  private readonly id: IdVO
  private readonly key: KeyVO
  private readonly name: NameVO

  constructor(id: string, key: string, name: string) {
    this.id = new IdVO(id)
    this.key = new KeyVO(key)
    this.name = new NameVO(name)
  }

  getId(): IdVO {
    return this.id
  }

  getKey(): KeyVO {
    return this.key
  }

  getName(): NameVO {
    return this.name
  }
}
