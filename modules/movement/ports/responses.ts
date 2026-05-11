type MovementTypeResponse = {
  id: string
  key: string
  name: string
}

type CategoryResponse = {
  id: string
  name: string
}

type AccountResponse = {
  id: string
  name: string
}

type StatsCategoryResponse = {
  id: string
  name: string
  is_system: boolean
  system_key: string
}

type MovementResponse = {
  id: string
  amount: number
  description: string
  movement_type: MovementTypeResponse
  category: CategoryResponse
  account: AccountResponse
  user_id: string
  created_at: string
  updated_at: string
}

export type CreateResponse = {
  data: {
    movement: MovementResponse
  }
  request_id: string
}

export type FindAllResponse = {
  data: {
    movements: MovementResponse[]
    prev_cursor?: string
    next_cursor?: string
  }
  request_id: string
}

export type StatsOverviewResponse = {
  data: {
    overview: {
      total_movements: number
      income: {
        count: number
        total: number
      }
      expense: {
        count: number
        total: number
      }
      net_total: number
    }
  }
  request_id: string
}

export type StatsByAccountResponse = {
  data: {
    accounts: Array<{
      account: AccountResponse
      movement_count: number
      income_count: number
      expense_count: number
      income_total: number
      expense_total: number
      net_total: number
    }>
  }
  request_id: string
}

export type StatsByCategoryResponse = {
  data: {
    categories: Array<{
      category: StatsCategoryResponse
      movement_count: number
      income_count: number
      expense_count: number
      income_total: number
      expense_total: number
      net_total: number
    }>
  }
  request_id: string
}

export type DeleteResponse = {
  data: {
    success: boolean
  }
  request_id: string
}
