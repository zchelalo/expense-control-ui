import { getMovementTypeText } from '@/components/templates/dashboard/movements/get-movement-type-text'
import type {
  MovementListItem,
  MovementTypeOption,
  SelectOption,
} from '@/components/templates/dashboard/movements/types'
import type { Language } from '@/constants/common'
import type { AccountEntity } from '@/modules/account/domain/account-entity'
import type { CategoryEntity } from '@/modules/category/domain/category-entity'
import type { MovementEntity } from '@/modules/movement/domain/movement-entity'
import type { MovementTypeEntity } from '@/modules/movement-type/domain/movement-type-entity'
import { getCurrencyFromLanguage } from '@/utils/currency'

type Translate = (key: string) => string

export function mapMovementToListItem(
  movement: MovementEntity,
  locale: string,
  translate: Translate,
): MovementListItem {
  return {
    id: movement.getId().getValue(),
    accountId: movement.getAccount().getId().getValue(),
    accountName: movement.getAccount().getName().getValue(),
    description: movement.getDescription().getValue(),
    categoryId: movement.getCategory().getId().getValue(),
    categoryName: movement.getCategory().getName().getValue(),
    createdAt: movement.getCreatedAt().getValue(),
    movementTypeId: movement.getMovementType().getId().getValue(),
    movementTypeKey: movement.getMovementType().getKey().getValue(),
    movementTypeText: getMovementTypeText(
      movement.getMovementType().getKey().getValue(),
      translate,
    ),
    amount: movement
      .getAmount()
      .toCurrency(locale, getCurrencyFromLanguage(locale as Language)),
  }
}

export function mapMovementTypeToOption(
  movementType: MovementTypeEntity,
  translate: Translate,
): MovementTypeOption {
  return {
    value: movementType.getId(),
    label:
      getMovementTypeText(movementType.getKey(), translate) ||
      movementType.getName(),
    key: movementType.getKey(),
  }
}

export function mapCategoryToSelectOption(
  category: CategoryEntity,
): SelectOption {
  return {
    value: category.getId(),
    label: category.getName(),
  }
}

export function mapAccountToSelectOption(account: AccountEntity): SelectOption {
  return {
    value: account.getId().getValue(),
    label: account.getName().getValue(),
  }
}
