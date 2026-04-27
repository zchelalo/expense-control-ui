type PortError =
  | 'category_store_error'
  | 'category_not_found_error'
  | 'unknown_error'
  | 'too_many_requests_error'
  | 'network_error'

export class CategoryError extends Error {
  public readonly code: PortError

  constructor(code: PortError, message?: string) {
    super(message)
    this.code = code
    Object.setPrototypeOf(this, CategoryError.prototype)
  }
}
