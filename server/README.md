# Astrotalk Server

A comprehensive backend API for the Astrotalk platform, providing authentication, user management, messaging, AI chat, and video calling features.

## 🚀 Features

- **Authentication**: JWT-based user registration and login
- **User Management**: Profile management, astrologer discovery, online status
- **Real-time Messaging**: 1:1 chat with Socket.IO
- **AI Chat**: OpenAI-powered astrology chatbot
- **Video/Audio Calls**: WebRTC-based calling system
- **File Upload**: Cloudinary integration for profile images
- **Call Logging**: Complete call history and statistics

## 📁 Project Structure

```
server/
├── config/
│   └── db.js                  # MongoDB connection
├── controllers/               # Core business logic
│   ├── authController.js      # Register, login, JWT
│   ├── userController.js      # Profile info, updates, astrologer list
│   ├── messageController.js   # 1:1 chat, mark read, fetch history
│   ├── aiController.js        # Handle AI chat and saving response
│   └── callController.js      # Save call logs, fetch call history
├── models/                    # Mongoose schema definitions
│   ├── User.js
│   ├── Message.js
│   └── CallLog.js
├── routes/                    # Route-to-controller mapping
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── messageRoutes.js
│   ├── aiRoutes.js
│   └── callRoutes.js
├── middleware/                # Middlewares for auth, error handling
│   ├── authMiddleware.js      # Protect routes using JWT
│   └── errorHandler.js        # Centralized error response
├── sockets/                   # Real-time handlers via Socket.IO
│   └── socketHandlers.js      # Online users, messaging, call signaling
├── utils/                     # Helper utilities
│   ├── openai.js              # AI API calls (OpenAI)
│   └── cloudinary.js          # Profile image upload to Cloudinary
├── index.js                   # Server entry point
└── package.json               # Backend dependencies and scripts
```

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   NODE_ENV=development
   PORT=5000
   CLIENT_URL=http://localhost:5173
   MONGODB_URI=mongodb://localhost:27017/astrotalk
   JWT_SECRET=your-super-secret-jwt-key-here
   OPENAI_API_KEY=your-openai-api-key-here
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

4. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 📡 API Endpoints

### Authentication Routes
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Authenticate user, return JWT
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/logout` - Logout user

### User Routes
- `GET /api/users/:id` - Get a single user's profile by ID
- `PUT /api/users/profile` - Update avatar or about section
- `GET /api/users/astrologers` - Get list of all users with role: astrologer
- `PATCH /api/users/status/:id` - Update online/offline status

### Message Routes
- `GET /api/messages/:userId` - Fetch chat history between current user and another user
- `POST /api/messages/send` - Send a new message
- `PATCH /api/messages/read/:msgId` - Mark a message as read
- `GET /api/messages/unread/count` - Get unread message count
- `GET /api/messages/conversations` - Get recent conversations

### AI Routes
- `POST /api/ai/chat` - Send prompt to AI, get reply, store chat
- `GET /api/ai/history` - Get saved AI chat history by date range
- `GET /api/ai/export` - Export/share chat between date range
- `GET /api/ai/stats` - Get AI chat statistics

### Call Routes
- `POST /api/calls` - Save a new call record
- `GET /api/calls` - Get all past call logs
- `PATCH /api/calls/:callId` - Update call status
- `GET /api/calls/stats` - Get call statistics

## 🔌 Socket.IO Events

### Client to Server
- `user-online` - User comes online; update online status
- `send-message` - Send a message to another user
- `mark-read` - Mark a message as read
- `start-call` - Start a WebRTC signaling for call
- `answer-call` - Answer an incoming call
- `end-call` - End an ongoing call
- `offer` - WebRTC offer
- `answer` - WebRTC answer
- `ice-candidate` - WebRTC ICE candidate
- `typing-start` - Start typing indicator
- `typing-stop` - Stop typing indicator

### Server to Client
- `user-status-changed` - User online/offline status changed
- `receive-message` - Receive incoming message
- `message-sent` - Confirm message sent
- `message-read` - Message was read by receiver
- `incoming-call` - Receive an incoming call offer
- `call-initiated` - Call was initiated successfully
- `call-answered` - Call was answered
- `call-ended` - Call was ended
- `offer` - WebRTC offer from peer
- `answer` - WebRTC answer from peer
- `ice-candidate` - WebRTC ICE candidate from peer
- `typing-start` - User started typing
- `typing-stop` - User stopped typing

## 🗄️ Database Models

### User Model
- Basic info: name, email, password
- Role: user/astrologer
- Profile: avatar, about, specializations, experience, hourly rate
- Status: online/offline, last seen, rating, verification

### Message Model
- Sender and receiver references
- Content and message type (text, image, file, ai)
- Read status and timestamps
- AI chat specific fields

### CallLog Model
- Caller and receiver references
- Call type (audio/video) and status
- Duration, cost, quality metrics
- WebRTC session information

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📊 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment (development/production) | Yes |
| `PORT` | Server port | No (default: 5000) |
| `CLIENT_URL` | Frontend URL for CORS | Yes |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret key for JWT signing | Yes |
| `OPENAI_API_KEY` | OpenAI API key for AI chat | Yes |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Yes |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Yes |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Yes |

## 🚀 Deployment

1. **Set up environment variables** for production
2. **Install dependencies**: `npm install --production`
3. **Start the server**: `npm start`

## 📝 License

This project is part of the Astrotalk assignment.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support, please contact the development team. 