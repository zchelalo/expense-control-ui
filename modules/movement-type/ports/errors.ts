type PortError =
  | 'movement_type_store_error'
  | 'unknown_error'
  | 'too_many_requests_error'
  | 'network_error'

export class MovementTypeError extends Error {
  public readonly code: PortError

  constructor(code: PortError, message?: string) {
    super(message)
    this.code = code
    Object.setPrototypeOf(this, MovementTypeError.prototype)
  }
}
