export type CreateResponse = {
  data: {
    account: {
      id: string
      name: string
      balance: number
      created_at: string
      updated_at: string
    }
  }
  request_id: string
}

export type FindAllResponse = {
  data: {
    accounts: {
      id: string
      name: string
      balance: number
      created_at: string
      updated_at: string
    }[]
    prev_cursor?: string
    next_cursor?: string
  }
  request_id: string
}

export type FindByIdResponse = {
  data: {
    account: {
      id: string
      name: string
      balance: number
      created_at: string
      updated_at: string
    }
  }
  request_id: string
}

export type UpdateNameResponse = {
  data: {
    account: {
      id: string
      name: string
      balance: number
      created_at: string
      updated_at: string
    }
  }
  request_id: string
}

export type DeleteResponse = {
  data: {
    success: boolean
  }
  request_id: string
}
