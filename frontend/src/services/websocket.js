
class WebSocketService {
  constructor() {
    this.ws = null
    this.roomId = null
    this.listeners = {}
  }

  connect(roomId) {
    // Disconnect first if already connected
    if (this.ws) {
      this.disconnect()
    }

    const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000'
    this.roomId = roomId
    this.ws = new WebSocket(`${WS_URL}/ws/chat/${roomId}/`)
    
    this.ws.onopen = () => {
      console.log('WebSocket connected')
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
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
      this.listeners = {}
    }
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    }
  }

  on(event, callback) {
    this.listeners[event] = callback
  }
}

export default new WebSocketService()

