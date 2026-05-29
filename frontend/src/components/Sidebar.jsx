
import { useState } from 'react'
import { useChat } from '../contexts/ChatContext'
import { useAuth } from '../contexts/AuthContext'
import { Search, Plus, MessageSquare, Users, LogOut } from 'lucide-react'

const Sidebar = () => {
  const { rooms, currentRoom, setCurrentRoom, users, createRoom, fetchRooms } = useChat()
  const { user, logout } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [showUsers, setShowUsers] = useState(false)

  const otherParticipants = (room) => {
    return room.participants?.filter(p => p.id !== user?.id) || []
  }

  const getRoomName = (room) => {
    if (room.name) return room.name
    const others = otherParticipants(room)
    return others.map(p => p.username).join(', ') || 'New Chat'
  }

  const getLastMessage = (room) => {
    if (!room.last_message) return 'No messages yet'
    if (room.last_message.content) return room.last_message.content
    if (room.last_message.attachments?.length) return '📎 Attached a file'
    return 'New message'
  }

  const handleNewChat = async (otherUser) => {
    try {
      const room = await createRoom([otherUser.id])
      setCurrentRoom(room)
      setShowUsers(false)
    } catch (err) {
      console.error('Failed to create chat:', err)
    }
  }

  const filteredUsers = users.filter(u => u.id !== user?.id && u.username.toLowerCase().includes(searchQuery.toLowerCase()))
  const filteredRooms = rooms.filter(r => getRoomName(r).toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="w-full md:w-80 bg-gradient-to-b from-white dark:from-gray-800 to-gray-50 dark:to-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            ChatApp
          </h2>
          <button
            onClick={logout}
            className="p-2 text-gray-500 hover:text-red-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 dark:text-white truncate">
              {user?.username}
            </p>
            <p className="text-xs text-green-500 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              Online
            </p>
          </div>
        </div>

        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search chats or people..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setShowUsers(!showUsers)}
            className={`flex-1 py-2 rounded-lg font-semibold text-sm transition-all ${
              showUsers
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
            }`}
          >
            <Users size={16} className="inline mr-1" />
            New Chat
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2">
        {showUsers ? (
          <div>
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2 mb-2">
              People to chat with
            </h3>
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Users size={48} className="mx-auto mb-3 opacity-50" />
                <p>No people found</p>
              </div>
            ) : (
              filteredUsers.map(u => (
                <div
                  key={u.id}
                  onClick={() => handleNewChat(u)}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-all mb-1"
                >
                  <div className="relative">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-white text-sm font-semibold">
                      {u.username.charAt(0).toUpperCase()}
                    </div>
                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${
                      u.online ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">
                      {u.username}
                    </p>
                    <p className={`text-xs ${
                      u.online ? 'text-green-500' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {u.online ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div>
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2 mb-2 flex items-center gap-1">
              <MessageSquare size={14} />
              Your Chats
            </h3>
            {filteredRooms.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <MessageSquare size={56} className="mx-auto mb-3 opacity-30" />
                <h4 className="font-semibold mb-1">No chats yet</h4>
                <p className="text-sm">Click "New Chat" to start talking to someone!</p>
              </div>
            ) : (
              filteredRooms.map(room => (
                <div
                  key={room.id}
                  onClick={() => setCurrentRoom(room)}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all mb-1 ${
                    currentRoom?.id === room.id
                      ? 'bg-blue-50 dark:bg-blue-900/30 ring-1 ring-blue-200 dark:ring-blue-800'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="relative">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                      {getRoomName(room).charAt(0).toUpperCase()}
                    </div>
                    {room.type === 'one_to_one' && (
                      <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${
                        otherParticipants(room)[0]?.online ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                    )}
                    {room.unread_count > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                        {room.unread_count}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold truncate ${
                      room.unread_count > 0 ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'
                    }`}>
                      {getRoomName(room)}
                    </p>
                    <p className={`text-xs truncate ${
                      room.unread_count > 0 ? 'text-gray-700 dark:text-gray-200 font-medium' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {getLastMessage(room)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Sidebar
