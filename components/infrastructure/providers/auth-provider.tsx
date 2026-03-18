'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type AuthContextType = {
  isAuthenticated: boolean
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
  // Sincronized state to ensure client-side updates when authentication status changes
  const [isAuthenticated, setIsAuthenticated] = useState(initialIsAuthenticated)

  useEffect(() => {
    setIsAuthenticated(initialIsAuthenticated)
  }, [initialIsAuthenticated])

  return (
    <AuthContext.Provider value={{ isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Custom hook to access authentication status. Must be used within an AuthProvider.
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
