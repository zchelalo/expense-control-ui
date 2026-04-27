'use server'

import { CategoryRepository } from '@/modules/category/adapters/out/category-repository'
import { FindAllUseCase } from '@/modules/category/application/use-cases/find-all'

type SelectOption = {
  label: string
  value: string
}

const categoryRepository = new CategoryRepository()
const findAllUseCase = new FindAllUseCase(categoryRepository)
const SEARCH_LIMIT = 10

function normalizeSearch(search: string): string {
  return search.trim()
}

export async function searchCategoryOptionsAction(
  search: string,
): Promise<SelectOption[]> {
  const normalizedSearch = normalizeSearch(search)
  const categories = await findAllUseCase.execute(
    SEARCH_LIMIT,
    null,
    null,
    normalizedSearch || null,
  )

  const filteredCategories = normalizedSearch
    ? categories.items.filter((category) =>
        category
          .getName()
          .toLocaleLowerCase()
          .includes(normalizedSearch.toLocaleLowerCase()),
      )
    : categories.items

  return filteredCategories.map((category) => ({
    value: category.getId(),
    label: category.getName(),
  }))
}
