export type ParsedSetCookie = {
  name: string
  value: string
  httpOnly: boolean
  secure: boolean
  sameSite?: 'lax' | 'strict' | 'none'
  path?: string
  domain?: string
  expires?: Date
  maxAge?: number
}

export function parseSetCookieHeader(
  setCookieHeader: string,
): ParsedSetCookie | null {
  const parts = setCookieHeader.split(';').map((part) => part.trim())
  const nameValue = parts.shift()

  if (!nameValue) return null

  const separatorIndex = nameValue.indexOf('=')
  if (separatorIndex === -1) return null

  const cookie: ParsedSetCookie = {
    name: nameValue.slice(0, separatorIndex),
    value: nameValue.slice(separatorIndex + 1),
    httpOnly: false,
    secure: false,
  }

  for (const attr of parts) {
    const attrSeparatorIndex = attr.indexOf('=')
    const attrKey =
      attrSeparatorIndex === -1 ? attr : attr.slice(0, attrSeparatorIndex)
    const attrValue =
      attrSeparatorIndex === -1 ? '' : attr.slice(attrSeparatorIndex + 1)

    switch (attrKey.toLowerCase()) {
      case 'httponly':
        cookie.httpOnly = true
        break
      case 'secure':
        cookie.secure = true
        break
      case 'samesite': {
        const sameSite = attrValue.toLowerCase()
        if (
          sameSite === 'lax' ||
          sameSite === 'strict' ||
          sameSite === 'none'
        ) {
          cookie.sameSite = sameSite
        }
        break
      }
      case 'path':
        cookie.path = attrValue
        break
      case 'domain':
        cookie.domain = attrValue
        break
      case 'expires': {
        const expires = new Date(attrValue)
        if (!Number.isNaN(expires.getTime())) {
          cookie.expires = expires
        }
        break
      }
      case 'max-age': {
        const maxAge = Number.parseInt(attrValue, 10)
        if (!Number.isNaN(maxAge)) {
          cookie.maxAge = maxAge
        }
        break
      }
    }
  }

  return cookie
}

export function parseSetCookieHeaders(
  setCookieHeaders: string[],
): ParsedSetCookie[] {
  return setCookieHeaders
    .map((setCookieHeader) => parseSetCookieHeader(setCookieHeader))
    .filter((cookie): cookie is ParsedSetCookie => cookie !== null)
}
