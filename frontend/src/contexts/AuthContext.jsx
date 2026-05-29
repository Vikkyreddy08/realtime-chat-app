
import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUser = async () => {
    try {
      const response = await api.get('/users/me/')
      setUser(response.data)
    } catch (error) {
      console.error('Failed to fetch user:', error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials) => {
    try {
      const response = await api.post('/token/', credentials)
      localStorage.setItem('access_token', response.data.access)
      localStorage.setItem('refresh_token', response.data.refresh)
      await fetchUser()
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Login failed' }
    }
  }

  const register = async (userData) => {
    try {
      const response = await api.post('/users/', userData)
      return await login({ username: userData.username, password: userData.password })
    } catch (error) {
      return { success: false, error: error.response?.data || 'Registration failed' }
    }
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

