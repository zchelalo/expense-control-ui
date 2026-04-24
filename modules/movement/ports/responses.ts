type MovementTypeResponse = {
  id: string
  key: string
  name: string
}

type CategoryResponse = {
  id: string
  name: string
}

type MovementResponse = {
  id: string
  amount: number
  description: string
  movement_type: MovementTypeResponse
  category: CategoryResponse
  account_id: string
  user_id: string
  created_at: string
  updated_at: string
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
