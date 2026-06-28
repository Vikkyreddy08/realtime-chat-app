
# Real-Time Chat Application

A full-stack real-time chat application built with React, Django, Django Channels, and PostgreSQL.

## Features

- **Real-time messaging** with WebSockets
- **User authentication** with JWT (Login/Register)
- **One-to-one chat** and **group chat** creation
- **Typing indicators** with animated bouncing dots
- **Read receipts** with blue double checkmarks
- **File attachments** (images, PDFs, documents)
- **Emoji picker** with search
- **Dark/Light mode** toggle
- **Responsive mobile-friendly design**
- **Online/offline status** with animated green dot
- **Last seen timestamps**
- **Unread message count badges**
- **User profiles** with avatar upload
- **In-memory channel layer for easy testing** (no Redis required)

## Tech Stack

### Backend
- **Django** - Web framework
- **Django REST Framework** - RESTful API
- **Django Channels** - WebSocket communication
- **SQLite (testing)/PostgreSQL (production)** - Database
- **In-memory (testing)/Redis (production)** - Channel layer
- **Django REST Framework SimpleJWT** - JWT authentication

### Frontend
- **React** - UI library
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Lucide React** - Beautiful icons
- **Emoji Picker React** - Modern emoji picker

## Project Structure

```
chatting/
├── backend/
│   ├── config/         # Django project settings
│   ├── chat/           # Chat app (models, views, serializers, consumers, etc.)
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env.example
│   └── media/          # Uploaded files (ignored by git)
├── frontend/
│   ├── src/
│   │   ├── components/ # Reusable React components
│   │   ├── pages/      # Page components (Login, Register, Chat, Profile)
│   │   ├── contexts/   # React contexts (Auth, Chat, Theme)
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
- (Optional: PostgreSQL and Redis for production)

### Backend Setup
1. **Navigate to the backend directory**
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment**
   - Windows:
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
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
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

5. **Run database migrations**
   ```bash
   python manage.py migrate
   ```

6. **Create a superuser (optional)**
   ```bash
   python manage.py createsuperuser
   ```

7. **Start the backend server**
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

4. **Start the frontend development server**
   ```bash
   npm run dev
   ```

### Running the App
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/api
- Admin Panel: http://localhost:8000/admin (if you created a superuser)

## API Endpoints

### Authentication
- `POST /api/token/` - Obtain JWT access and refresh tokens
- `POST /api/token/refresh/` - Refresh access token using refresh token

### Users
- `POST /api/users/` - Register a new user
- `GET /api/users/` - List all users (requires auth)
- `GET /api/users/{id}/` - Get user details by ID (requires auth)
- `GET /api/users/me/` - Get current authenticated user (requires auth)

### User Profiles
- `GET /api/profiles/me/` - Get current user's profile (requires auth)
- `PATCH /api/profiles/me/` - Update current user's profile (requires auth)

### Chat Rooms
- `GET /api/rooms/` - List all rooms the user is a participant of (requires auth)
- `POST /api/rooms/` - Create a new chat room (requires auth)
- `GET /api/rooms/{id}/` - Get room details (requires auth)

### Messages
- `GET /api/messages/` - List messages, filter using `?room_id=` (requires auth)
- `POST /api/messages/` - Send a message (supports file attachments) (requires auth)
- `POST /api/messages/{id}/mark_read/` - Mark a message as read (requires auth)

## WebSocket Protocol
Connect to: `ws://localhost:8000/ws/chat/{room_id}/`

### Message Types
1. **New Message**
   ```json
   {
     "type": "message",
     "message": {
       "id": 123,
       "sender": {"id":1,"username":"john"},
       "content":"Hello!",
       "timestamp":"2026-05-30T00:00:00Z"
     }
   }
   ```

2. **Typing Indicator**
   ```json
   {
     "type": "typing",
     "user": {"id":1,"username":"john"},
     "is_typing": true
   }
   ```

3. **Read Receipt**
   ```json
   {
     "type": "read",
     "message_id": 123,
     "user": {"id":1,"username":"john"}
   }
   ```

4. **User Status Update**
   ```json
   {
     "type": "user_status",
     "user_id":1,
     "online": true,
     "last_seen": "2026-05-30T00:00:00Z"
   }
   ```

## Deployment Guide

### Frontend Deployment (Vercel)
1. **Push your code to GitHub/GitLab/Bitbucket**
2. **Go to Vercel Dashboard** and click "New Project"
3. **Connect your repository** and import your project
4. **Set Environment Variables in Vercel**
   - `VITE_API_URL` - Your production backend API URL (e.g., `https://your-chat-backend.onrender.com/api`)
   - `VITE_WS_URL` - Your production WebSocket URL (e.g., `wss://your-chat-backend.onrender.com`)
5. **Deploy**! Vercel will automatically deploy your frontend on every push

### Backend Deployment (Render)
1. **Push your code to GitHub**
2. **Sign in to Render** and click "New Web Service"
3. **Connect your repository** and set:
   - Build command: `pip install -r requirements.txt && python manage.py migrate`
   - Start command: `gunicorn config.asgi:application -k uvicorn.workers.UvicornWorker` (or `daphne config.asgi:application`)
   - Runtime: Python 3.10+
4. **Add Environment Variables**
   - `SECRET_KEY` - Generate a secure secret key!
   - `DEBUG` - `False`
   - `ALLOWED_HOSTS` - Your Render domain (e.g., `your-chat-backend.onrender.com`)
   - `CORS_ALLOWED_ORIGINS` - Your frontend domain (e.g., `https://your-chat-app.vercel.app`)
   - Add PostgreSQL and Redis via Render's Marketplace
5. **Add a .gitignore** (we already have one)
6. **Deploy**!

## Future Improvements
- [ ] Message editing and deletion
- [ ] Voice and video calls
- [ ] Chat search
- [ ] Push notifications
- [ ] Message reactions
- [ ] End-to-end encryption
- [ ] Chat backups/export
- [ ] Custom themes
- [ ] Channel/community features

## License
MIT

