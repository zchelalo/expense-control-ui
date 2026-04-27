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

export type DeleteResponse = {
  data: {
    success: boolean
  }
  request_id: string
}
