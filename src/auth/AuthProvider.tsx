import { type ReactNode, useEffect, useState } from 'react'
import { getCurrentUser } from '../lib/api'
import type { UserProfile } from '../types'
import { AuthContext } from './auth-context'

const TOKEN_KEY = 'homeinsu_token'
const USER_KEY = 'homeinsu_user'

function readStoredUser(): UserProfile | null {
  const stored = localStorage.getItem(USER_KEY)
  if (!stored) return null
  try {
    const user = JSON.parse(stored) as UserProfile
    return user?.id && user?.email ? user : null
  } catch {
    return null
  }
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(readStoredUser)

  const signIn = (nextUser: UserProfile) => {
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
    setUser(nextUser)
  }

  const signOut = () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }

  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) {
      localStorage.removeItem(USER_KEY)
      setUser(null)
      return
    }

    let active = true
    getCurrentUser()
      .then((currentUser) => {
        if (!active) return
        localStorage.setItem(USER_KEY, JSON.stringify(currentUser))
        setUser(currentUser)
      })
      .catch(() => {
        if (!active) return
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
        setUser(null)
      })
    return () => { active = false }
  }, [])

  return <AuthContext.Provider value={{ user, signIn, signOut }}>{children}</AuthContext.Provider>
}
