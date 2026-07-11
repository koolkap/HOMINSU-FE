import { createContext } from 'react'
import type { UserProfile } from '../types'

export type AuthContextValue = {
  user: UserProfile | null
  signIn: (user: UserProfile) => void
  signOut: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
