
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import { Camera, User, Save } from 'lucide-react'

const Profile = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await api.get('/profiles/me/')
      setProfile(res.data)
    } catch (err) {
      console.error('Failed to fetch profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const handleSaveProfile = async () => {
    try {
      const formData = new FormData()
      if (avatarFile) {
        formData.append('avatar', avatarFile)
      }
      await api.patch('/profiles/me/', formData)
      fetchProfile() // Refresh profile data
    } catch (err) {
      console.error('Failed to save profile:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Your Profile
          </h2>
        </div>

        <div className="relative mx-auto w-32 h-32 mb-6">
          {avatarPreview || (profile?.avatar ? `http://localhost:8000${profile.avatar}` : null) ? (
            <img
              src={avatarPreview || `http://localhost:8000${profile.avatar}?t=${new Date().getTime()}`}
              alt="Profile"
              className="w-full h-full rounded-full object-cover border-4 border-blue-500"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <User size={48} className="text-white" />
            </div>
          )}
          <label className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 cursor-pointer shadow-lg transition-all">
            <Camera size={20} />
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleAvatarChange}
            />
          </label>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Username
          </label>
          <input
            type="text"
            value={user?.username || ''}
            disabled
            className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg border border-gray-200 dark:border-gray-600"
          />
        </div>

        {profile && (
          <>
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </p>
              <p className={`text-sm flex items-center gap-2 ${profile.online ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                <span className={`w-2 h-2 rounded-full ${profile.online ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                {profile.online ? 'Online' : 'Offline'}
              </p>
            </div>

            {profile.last_seen && (
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Last Seen
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(profile.last_seen).toLocaleString()}
                </p>
              </div>
            )}
          </>
        )}

        <button
          onClick={handleSaveProfile}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-md"
        >
          <Save size={20} />
          Save Profile
        </button>
      </div>
    </div>
  )
}

export default Profile
