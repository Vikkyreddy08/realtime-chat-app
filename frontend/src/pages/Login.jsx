
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { Sun, Moon, LogIn } from 'lucide-react'

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const { darkMode, toggleDarkMode } = useTheme()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await login(formData)
    setLoading(false)
    if (result.success) {
      navigate('/')
    } else {
      setError(result.error)
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <button
        onClick={toggleDarkMode}
        className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800"
      >
        {darkMode ? <Sun size={24} className="text-gray-300" /> : <Moon size={24} className="text-gray-700" />}
      </button>

      <div className={`w-full max-w-md p-8 rounded-2xl shadow-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <LogIn size={32} className="text-white" />
          </div>
          <h1 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Welcome Back</h1>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Sign in to continue chatting</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Username
            </label>
            <input
              type="text"
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-gray-100 text-gray-900'
              }`}
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Password
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-gray-100 text-gray-900'
              }`}
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className={`text-center mt-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-500 hover:text-blue-600 font-semibold">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login

