
import { useState, useRef, useEffect } from 'react'
import { useChat } from '../contexts/ChatContext'
import { useAuth } from '../contexts/AuthContext'
import { Paperclip, Smile, Send, ArrowLeft, MoreVertical, Image, FileText, Check, CheckCheck, MessageSquare } from 'lucide-react'
import EmojiPicker from 'emoji-picker-react'

const ChatWindow = () => {
  const { currentRoom, messages, sendMessage, sendTyping, typingUsers, markRead } = useChat()
  const { user } = useAuth()
  const [message, setMessage] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [files, setFiles] = useState([])
  const messagesEndRef = useRef(null)
  const typingTimeout = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleTyping = () => {
    clearTimeout(typingTimeout.current)
    if (user) {
      sendTyping(true, user)
    }
    typingTimeout.current = setTimeout(() => {
      if (user) {
        sendTyping(false, user)
      }
    }, 2000)
  }

  const handleSend = (e) => {
    e.preventDefault()
    if (message.trim() || files.length > 0) {
      sendMessage(message, files)
      setMessage('')
      setFiles([])
      clearTimeout(typingTimeout.current)
      if (user) {
        sendTyping(false, user)
      }
    }
  }

  const handleEmojiClick = (emojiData) => {
    setMessage(prev => prev + emojiData.emoji)
    setShowEmojiPicker(false)
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatLastSeen = (lastSeen) => {
    if (!lastSeen) return ''
    const date = new Date(lastSeen)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
  }

  if (!currentRoom) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center max-w-md p-8">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center mx-auto mb-6">
            <MessageSquare size={64} className="text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Welcome to ChatApp!
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-6">
            Select a conversation from the sidebar or start a new chat to begin messaging.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4 text-left">
            <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-2">
              <Smile size={18} />
              How to get started
            </h3>
            <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
              <li>• Click "New Chat" to talk to someone</li>
              <li>• Type a message and hit send</li>
              <li>• Attach files or add emojis</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  const otherParticipants = currentRoom.participants?.filter(p => p.id !== user?.id) || []
  const otherUser = otherParticipants[0]

  return (
    <div className="flex-1 flex flex-col h-full bg-gradient-to-br from-blue-50/50 to-white dark:from-gray-800 dark:to-gray-900">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/90 backdrop-blur-sm shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
              <ArrowLeft size={24} className="text-gray-600 dark:text-gray-300" />
            </button>
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-lg">
                {otherUser?.username?.charAt(0).toUpperCase() || currentRoom.name?.charAt(0) || '?'}
              </div>
              {currentRoom.type === 'one_to_one' && (
                <div className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${
                  otherUser?.online ? 'bg-green-500' : 'bg-gray-400'
                }`} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-lg text-gray-900 dark:text-white">
                {currentRoom.name || otherParticipants.map(p => p.username).join(', ')}
              </h2>
              {currentRoom.type === 'one_to_one' && (
                <p className={`text-sm ${
                  otherUser?.online ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                } flex items-center gap-1`}>
                  {otherUser?.online ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                      Online
                    </>
                  ) : (
                    `Last seen ${formatLastSeen(otherUser?.last_seen)}`
                  )}
                </p>
              )}
            </div>
          </div>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <MoreVertical size={22} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center mx-auto mb-4">
              <Smile size={48} className="text-blue-400" />
            </div>
            <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Say hello!
            </h4>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Start your first message to {currentRoom.name || otherUser?.username}
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const isCurrentUser = msg.sender.id === user?.id
          return (
            <div
              key={msg.id}
              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              onClick={() => {
                if (!isCurrentUser && !msg.is_read && user) {
                  markRead(msg.id, user)
                }
              }}
            >
              <div
                className={`max-w-[75%] sm:max-w-[60%] md:max-w-[50%] lg:max-w-[40%] rounded-2xl px-4 py-3 shadow-sm ${
                  isCurrentUser
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md'
                    : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md border border-gray-100 dark:border-gray-600'
                }`}
              >
                {!isCurrentUser && (
                  <p className="text-xs font-semibold mb-1 opacity-75">
                    {msg.sender.username}
                  </p>
                )}
                {msg.content && (
                  <p className="mb-2 leading-relaxed">{msg.content}</p>
                )}
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="space-y-2 mb-2">
                    {msg.attachments.map((att) => (
                      <a
                        key={att.id}
                        href={`http://localhost:8000${att.file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-white/20 dark:bg-gray-900/30 rounded-lg p-2 flex items-center gap-2 hover:bg-white/30 dark:hover:bg-gray-900/50 transition-all"
                      >
                        {att.file_type?.startsWith('image/') ? (
                          <Image size={20} />
                        ) : (
                          <FileText size={20} />
                        )}
                        <span className="text-sm truncate">{att.file_name}</span>
                      </a>
                    ))}
                  </div>
                )}
                <div className="text-xs flex items-center gap-1 justify-end opacity-75">
                  {formatTime(msg.timestamp)}
                  {isCurrentUser && (
                    <span className="flex items-center">
                      {(() => {
                        // Check if other participants have read the message
                        const otherParticipantsInRoom = currentRoom.participants.filter(p => p.id !== user.id);
                        const hasOtherRead = otherParticipantsInRoom.some(p => 
                          msg.read_by.some(u => u.id === p.id)
                        );
                        return hasOtherRead ? (
                          <CheckCheck size={14} className="text-blue-400" />
                        ) : (
                          <Check size={14} className="text-gray-400" />
                        );
                      })()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {typingUsers.length > 0 && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
              <p className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-2">
                <span className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </span>
                {typingUsers.map(u => u.username).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
              </p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-[0_-1px_3px_rgba(0,0,0,0.05)]">
        {files.length > 0 && (
          <div className="mb-3 flex gap-2 overflow-x-auto pb-2">
            {files.map((file, idx) => (
              <div key={idx} className="relative flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-lg p-2">
                <div className="w-16 h-16 rounded flex items-center justify-center">
                  <FileText size={32} className="text-gray-500" />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 text-center truncate w-16 mt-1">
                  {file.name}
                </p>
                <button
                  onClick={() => setFiles(prev => prev.filter((_, i) => i !== idx))}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-sm"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSend} className="flex items-end gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500 hover:text-yellow-500 transition-colors"
            >
              <Smile size={24} />
            </button>
            {showEmojiPicker && (
              <div className="absolute bottom-full mb-2 left-0 z-50">
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              </div>
            )}
          </div>

          <label className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full cursor-pointer text-gray-500 hover:text-blue-500 transition-colors">
            <Paperclip size={24} />
            <input
              type="file"
              multiple
              className="hidden"
              onChange={(e) => setFiles([...files, ...Array.from(e.target.files)])}
            />
          </label>

          <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <input
              type="text"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value)
                handleTyping()
              }}
              placeholder="Type a message..."
              className="w-full px-5 py-3 bg-transparent text-gray-900 dark:text-white focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={!message.trim() && files.length === 0}
            className={`p-3 rounded-full transition-all shadow-sm ${
              !message.trim() && files.length === 0
                ? 'bg-gray-200 dark:bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
            }`}
          >
            <Send size={22} />
          </button>
        </form>
      </div>
    </div>
  )
}

export default ChatWindow
