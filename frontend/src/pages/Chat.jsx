
import Sidebar from '../components/Sidebar'
import ChatWindow from '../components/ChatWindow'
import { useTheme } from '../contexts/ThemeContext'
import { Sun, Moon } from 'lucide-react'

const Chat = () => {
  const { darkMode, toggleDarkMode } = useTheme()

  return (
    <div className={`flex h-screen ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <Sidebar />
      <div className="flex-1 relative">
        <button
          onClick={toggleDarkMode}
          className="absolute top-4 right-4 z-10 p-2 bg-white dark:bg-gray-700 rounded-full shadow-lg hover:scale-110 transition-transform"
        >
          {darkMode ? <Sun size={20} className="text-gray-300" /> : <Moon size={20} className="text-gray-700" />}
        </button>
        <ChatWindow />
      </div>
    </div>
  )
}

export default Chat

