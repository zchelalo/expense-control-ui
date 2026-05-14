type CategoryResponse = {
  id: string
  name: string
}

export type CreateResponse = {
  data: {
    category: CategoryResponse
  }
  request_id: string
}

export type FindAllResponse = {
  data: {
    categories: CategoryResponse[]
    prev_cursor?: string
    next_cursor?: string
  }
  request_id: string
}
