type PortError =
  | 'account_store_error'
  | 'account_not_found_error'
  | 'account_update_error'
  | 'account_delete_error'
  | 'unknown_error'
  | 'too_many_requests_error'
  | 'network_error'

export class AccountError extends Error {
  public readonly code: PortError

  constructor(code: PortError, message?: string) {
    super(message)
    this.code = code
    Object.setPrototypeOf(this, AccountError.prototype)
  }
}
