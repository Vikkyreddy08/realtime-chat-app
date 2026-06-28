
import { createContext, useContext, useState, useEffect, useRef } from 'react'
import api from '../services/api'
import ws from '../services/websocket'
import { useAuth } from './AuthContext'

const ChatContext = createContext()

export const ChatProvider = ({ children }) => {
  const { user } = useAuth()
  const [rooms, setRooms] = useState([])
  const [currentRoom, setCurrentRoom] = useState(null)
  const [messages, setMessages] = useState([])
  const [users, setUsers] = useState([])
  const [typingUsers, setTypingUsers] = useState([])
  const currentRoomRef = useRef(currentRoom)

  useEffect(() => {
    currentRoomRef.current = currentRoom
  }, [currentRoom])

  useEffect(() => {
    if (user) {
      fetchRooms()
      fetchUsers()
    }
  }, [user])

  // Also fetch users when a new current room is selected
  useEffect(() => {
    if (user && currentRoom) {
      fetchUsers()
    }
  }, [user, currentRoom])

  useEffect(() => {
    if (currentRoom) {
      fetchMessages(currentRoom.id)
      ws.connect(currentRoom.id)
      
      ws.on('message', (data) => {
        if (currentRoomRef.current?.id === data.message.room.id) {
          setMessages(prev => {
            const exists = prev.some(m => m.id === data.message.id)
            if (exists) return prev
            return [...prev, data.message]
          })
        }
      })

      ws.on('typing', (data) => {
        if (user && data.user.id === user.id) return // Don't show current user typing
        setTypingUsers(prev => {
          if (data.is_typing) {
            const exists = prev.some(u => u.id === data.user.id)
            if (exists) return prev
            return [...prev, data.user]
          } else {
            return prev.filter(u => u.id !== data.user.id)
          }
        })
      })

      ws.on('read', (data) => {
        setMessages(prev => prev.map(m => {
          if (m.id === data.message_id) {
            // Make sure user isn't already in read_by
            const alreadyRead = m.read_by.some(u => u.id === data.user.id)
            return {
              ...m,
              read_by: alreadyRead ? m.read_by : [...(m.read_by || []), data.user],
              is_read: m.is_read || (user && data.user.id === user.id)
            }
          }
          return m
        }))
      })

      ws.on('user_status', (data) => {
        console.log('Received user status update:', data)
        setUsers(prev => prev.map(u => u.id === data.user_id ? { ...u, online: data.online, last_seen: data.last_seen || u.last_seen } : u))
        if (currentRoom && currentRoom.participants) {
          setCurrentRoom(prev => ({
            ...prev,
            participants: prev.participants.map(p => 
              p.id === data.user_id ? { ...p, online: data.online, last_seen: data.last_seen || p.last_seen } : p
            )
          }))
        }
      })
    }
    
    return () => {
      ws.disconnect()
    }
  }, [currentRoom])

  // Mark all unread messages in the current room as read when messages are loaded
  useEffect(() => {
    if (currentRoom && messages.length > 0 && user) {
      messages.forEach(msg => {
        if (msg.sender.id !== user.id && !msg.is_read) {
          markRead(msg.id, user)
        }
      })
    }
  }, [currentRoom, messages, user])

  const fetchRooms = async () => {
    try {
      const res = await api.get('/rooms/')
      // Remove duplicates by ID
      const uniqueRooms = []
      const seenIds = new Set()
      for (const room of res.data) {
        if (!seenIds.has(room.id)) {
          seenIds.add(room.id)
          uniqueRooms.push(room)
        }
      }
      setRooms(uniqueRooms)
    } catch (err) {
      console.error('Failed to fetch rooms:', err)
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users/')
      console.log('Fetched users:', res.data)
      setUsers(res.data)
    } catch (err) {
      console.error('Failed to fetch users:', err)
    }
  }

  const fetchMessages = async (roomId) => {
    try {
      const res = await api.get(`/messages/?room_id=${roomId}`)
      setMessages(res.data)
      
      // Mark all unread messages as read immediately
      if (user) {
        const unreadMessages = res.data.filter(msg => 
          msg.sender.id !== user.id && !msg.read_by.some(u => u.id === user.id)
        )
        unreadMessages.forEach(msg => markRead(msg.id, user))
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err)
    }
  }

  const sendMessage = async (content, files = []) => {
    const formData = new FormData()
    formData.append('room', currentRoom.id)
    formData.append('content', content)
    files.forEach(file => formData.append('files', file))
    const res = await api.post('/messages/', formData)
    setMessages(prev => {
      const exists = prev.some(m => m.id === res.data.id)
      if (exists) return prev
      return [...prev, res.data]
    })
  }

  const sendTyping = (isTyping, user) => {
    ws.send({
      type: 'typing',
      user: user,
      is_typing: isTyping
    })
  }

  const markRead = (messageId, user) => {
    api.post(`/messages/${messageId}/mark_read/`)
    ws.send({
      type: 'read',
      message_id: messageId,
      user: user
    })
  }

  const createRoom = async (participants, type = 'one_to_one', name = null) => {
    const res = await api.post('/rooms/', { participants, type, name })
    setRooms(prev => {
      const exists = prev.some(r => r.id === res.data.id)
      if (exists) return prev
      return [...prev, res.data]
    })
    return res.data
  }

  return (
    <ChatContext.Provider
      value={{
        rooms,
        currentRoom,
        setCurrentRoom,
        messages,
        users,
        typingUsers,
        sendMessage,
        sendTyping,
        markRead,
        createRoom,
        fetchRooms
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export const useChat = () => useContext(ChatContext)

