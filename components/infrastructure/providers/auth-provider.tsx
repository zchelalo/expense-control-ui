'use client'

import { createContext, useContext, useState } from 'react'

type AuthContextType = {
  isAuthenticated: boolean
  // user: User | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

type AuthProviderProps = {
  readonly children: React.ReactNode
  readonly initialIsAuthenticated: boolean
}

export function AuthProvider({
  children,
  initialIsAuthenticated,
}: AuthProviderProps) {
  // Initialize the authentication state based on the server-rendered value
  const [isAuthenticated] = useState(initialIsAuthenticated)

  return (
    <AuthContext.Provider value={{ isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Custom hook to access authentication state. Must be used within an AuthProvider.
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
