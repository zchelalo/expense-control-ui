type PortError =
  | 'auth_store_error'
  | 'auth_session_error'
  | 'invalid_credentials_error'
  | 'user_already_exists_error'
  | 'network_error'
  | 'unknown_error'
  | 'too_many_requests_error'

export class AuthError extends Error {
  public readonly code: PortError

  constructor(code: PortError, message?: string) {
    super(message)
    this.code = code
    Object.setPrototypeOf(this, AuthError.prototype)
  }
}
