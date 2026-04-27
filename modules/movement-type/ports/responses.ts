type MovementTypeResponse = {
  id: string
  key: string
  name: string
  description?: string
}

export type FindAllResponse = {
  data: {
    movement_types: MovementTypeResponse[]
  }
  request_id: string
}
