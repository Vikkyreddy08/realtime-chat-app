
# Real-Time Chat Application

A full-stack real-time chat application built with React, Django, Django Channels, and PostgreSQL.

## Features

- **Real-time messaging** with WebSockets
- **User authentication** with JWT
- **One-to-one chat** and **group chat**
- **Typing indicators**
- **Read receipts**
- **File attachments** (images, PDFs, docs)
- **Emoji picker**
- **Dark/Light mode**
- **Responsive design** (mobile-friendly)
- **Online/offline status**

## Tech Stack

### Backend
- **Django** - Web framework
- **Django REST Framework** - API
- **Django Channels** - WebSockets
- **PostgreSQL** - Database
- **Redis** - Channel layer
- **SimpleJWT** - Authentication

### Frontend
- **React** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **Axios** - HTTP client
- **Lucide React** - Icons
- **Emoji Picker React** - Emojis

## Project Structure

```
chatting/
├── backend/
│   ├── config/         # Django project settings
│   ├── chat/           # Chat app (models, views, consumers, etc.)
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── pages/      # Page components
│   │   ├── contexts/   # React contexts
│   │   ├── services/   # API and WebSocket services
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── .env.example
│   └── vite.config.js
└── README.md
```

## Setup Instructions

### Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL
- Redis

### Backend Setup

1. **Navigate to the backend directory**
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment**
   - Windows:
     ```bash
     python -m venv venv
     venv\Scripts\activate
     ```
   - Linux/macOS:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   Copy `.env.example` to `.env` and fill in your details:
   ```bash
   cp .env.example .env
   ```
   Edit `.env`:
   ```
   SECRET_KEY=your-secret-key-here
   DEBUG=True
   ALLOWED_HOSTS=localhost,127.0.0.1
   DATABASE_NAME=chat_app_db
   DATABASE_USER=your-postgres-user
   DATABASE_PASSWORD=your-postgres-password
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   REDIS_URL=redis://localhost:6379/0
   CORS_ALLOWED_ORIGINS=http://localhost:5173
   ```

5. **Create PostgreSQL database**
   ```sql
   CREATE DATABASE chat_app_db;
   ```

6. **Run migrations**
   ```bash
   python manage.py migrate
   ```

7. **Create a superuser (optional)**
   ```bash
   python manage.py createsuperuser
   ```

8. **Start the backend server**
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. **Navigate to the frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

The app should now be running at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/api

## API Endpoints

### Authentication
- `POST /api/token/` - Obtain JWT tokens
- `POST /api/token/refresh/` - Refresh access token

### Users
- `POST /api/users/` - Register a new user
- `GET /api/users/` - List all users (requires auth)
- `GET /api/users/{id}/` - Get user details (requires auth)

### Chat Rooms
- `GET /api/rooms/` - List user's chat rooms (requires auth)
- `POST /api/rooms/` - Create a new chat room (requires auth)
- `GET /api/rooms/{id}/` - Get room details (requires auth)

### Messages
- `GET /api/messages/` - List messages (requires auth, filter with `?room_id=`)
- `POST /api/messages/` - Send a message (requires auth)
- `POST /api/messages/{id}/mark_read/` - Mark message as read (requires auth)

## WebSocket Protocol

Connect to: `ws://localhost:8000/ws/chat/{room_id}/`

### Message Types
1. **New Message**
   ```json
   {
     "type": "message",
     "sender_id": 1,
     "content": "Hello!",
     "message_id": 123
   }
   ```

2. **Typing**
   ```json
   {
     "type": "typing",
     "user": {"id": 1, "username": "john"},
     "is_typing": true
   }
   ```

3. **Read Receipt**
   ```json
   {
     "type": "read",
     "message_id": 123,
     "user": {"id": 1, "username": "john"}
   }
   ```

## Deployment

### Frontend (Vercel)
1. Push your code to GitHub
2. Connect your repo to Vercel
3. Set environment variables: `VITE_API_URL`, `VITE_WS_URL`
4. Deploy!

### Backend (Render)
1. Push your code to GitHub
2. Create a new Web Service on Render
3. Set environment variables
4. Connect to PostgreSQL and Redis on Render
5. Deploy!

## Future Improvements

- [ ] Message editing and deletion
- [ ] Voice and video calls
- [ ] Message search
- [ ] User profiles with avatars
- [ ] Push notifications
- [ ] Message reactions
- [ ] End-to-end encryption
- [ ] Chat backups
- [ ] Channel/community features
- [ ] Custom themes

## License

MIT

