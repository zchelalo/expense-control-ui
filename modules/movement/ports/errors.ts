type PortError =
  | 'movement_store_error'
  | 'movement_not_found_error'
  | 'movement_update_error'
  | 'movement_delete_error'
  | 'unknown_error'
  | 'too_many_requests_error'
  | 'network_error'

export class MovementError extends Error {
  public readonly code: PortError

  constructor(code: PortError, message?: string) {
    super(message)
    this.code = code
    Object.setPrototypeOf(this, MovementError.prototype)
  }
}
