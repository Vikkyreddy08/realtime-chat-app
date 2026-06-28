
class WebSocketService {
  constructor() {
    this.ws = null
    this.roomId = null
    this.listeners = {}
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 2000 // 2 seconds
    this.reconnectTimeout = null
  }

  connect(roomId) {
    // Clear any existing reconnect timeout
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }

    // Disconnect first if already connected
    if (this.ws) {
      this.disconnect()
    }

    const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000'
    this.roomId = roomId
    this.ws = new WebSocket(`${WS_URL}/ws/chat/${roomId}/`)
    
    this.ws.onopen = () => {
      console.log('WebSocket connected')
      this.reconnectAttempts = 0
    }

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (this.listeners[data.type]) {
        this.listeners[data.type](data)
      }
    }

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    this.ws.onclose = () => {
      console.log('WebSocket disconnected')
      this._scheduleReconnect()
    }
  }

  _scheduleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      console.log(`Scheduling reconnect attempt ${this.reconnectAttempts + 1}...`)
      this.reconnectTimeout = setTimeout(() => {
        this.reconnectAttempts += 1
        this.connect(this.roomId)
      }, this.reconnectDelay * (this.reconnectAttempts + 1)) // Exponential backoff
    } else {
      console.error('Max reconnect attempts reached')
    }
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }
    if (this.ws) {
      this.ws.close()
      this.ws = null
      this.listeners = {}
    }
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    } else {
      console.warn('WebSocket not connected, message not sent')
    }
  }

  on(event, callback) {
    this.listeners[event] = callback
  }
}

export default new WebSocketService()

