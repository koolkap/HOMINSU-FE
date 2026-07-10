import { useEffect, useState } from 'react'
import { getDisplayData } from '../lib/api'

export function useDisplayData<T>(path: string, fallback: T) {
  const [data, setData] = useState(fallback)
  const [loading, setLoading] = useState(true)
  const [isMock, setIsMock] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    getDisplayData(path, fallback).then((result) => {
      if (!active) return
      setData(result.data)
      setIsMock(result.isMock)
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [path, fallback])

  return { data, loading, isMock }
}
