"use client"

import { useState, useRef, useEffect } from "react"
import { motion, easeOut, AnimatePresence } from "framer-motion"
import {
  MoveRight,
  Search,
  MoreVertical,
  Smile,
  Paperclip,
  Send,
  Phone,
  Video,
  Info,
  ArrowLeft,
  Check,
  CheckCheck,
  Plus,
  Settings,
  Pin,
  Star,
  ImageIcon,
  Mic,
  X,
} from "lucide-react"

export default function ChatPage() {
  const [selectedConversation, setSelectedConversation] = useState("1")
  const [message, setMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const messagesEndRef = useRef(null)

  // Mock data - replace with backend integration
  const currentUser = {
    id: "current",
    name: "You",
    avatar: "/placeholder.svg?height=40&width=40",
    isOnline: true,
    status: "Available",
  }

  const conversations = [
    {
      id: "1",
      participants: [
        {
          id: "1",
          name: "Sarah Wilson",
          avatar: "/placeholder.svg?height=40&width=40",
          isOnline: true,
          status: "In a meeting",
        },
        currentUser,
      ],
      lastMessage: {
        id: "last1",
        senderId: "1",
        content: "Hey! How's the new project coming along? I'd love to hear about your progress.",
        timestamp: "2:30 PM",
        status: "read",
        type: "text",
      },
      unreadCount: 3,
      isPinned: true,
    },
    {
      id: "2",
      participants: [
        {
          id: "2",
          name: "Mike Johnson",
          avatar: "/placeholder.svg?height=40&width=40",
          isOnline: false,
          lastSeen: "5 min ago",
          status: "Away",
        },
        currentUser,
      ],
      lastMessage: {
        id: "last2",
        senderId: "current",
        content: "Thanks for the detailed feedback on the design mockups!",
        timestamp: "1:45 PM",
        status: "delivered",
        type: "text",
      },
      unreadCount: 0,
    },
    {
      id: "3",
      participants: [
        {
          id: "3",
          name: "Emma Davis",
          avatar: "/placeholder.svg?height=40&width=40",
          isOnline: true,
          status: "Designing",
        },
        currentUser,
      ],
      lastMessage: {
        id: "last3",
        senderId: "3",
        content: "The new UI components look fantastic! 🎨",
        timestamp: "12:20 PM",
        status: "read",
        type: "text",
      },
      unreadCount: 0,
      isPinned: true,
    },
    {
      id: "4",
      participants: [
        {
          id: "4",
          name: "Alex Chen",
          avatar: "/placeholder.svg?height=40&width=40",
          isOnline: false,
          lastSeen: "2 hours ago",
          status: "Coding",
        },
        currentUser,
      ],
      lastMessage: {
        id: "last4",
        senderId: "4",
        content: "Code review completed. Everything looks good to merge!",
        timestamp: "11:30 AM",
        status: "read",
        type: "text",
      },
      unreadCount: 0,
    },
  ]

  const messages = [
    {
      id: "1",
      senderId: "1",
      content: "Hey! How's the new project coming along? I'd love to hear about your progress.",
      timestamp: "2:25 PM",
      status: "read",
      type: "text",
    },
    {
      id: "2",
      senderId: "current",
      content:
        "It's going really well! We've made significant progress on the user interface and the backend architecture is solid. The team is excited about the direction we're heading.",
      timestamp: "2:26 PM",
      status: "read",
      type: "text",
    },
    {
      id: "3",
      senderId: "1",
      content:
        "That's fantastic to hear! The attention to detail in your work always impresses me. Can't wait to see the final result 🚀",
      timestamp: "2:28 PM",
      status: "read",
      type: "text",
      isStarred: true,
    },
    {
      id: "4",
      senderId: "current",
      content:
        "Thank you! I'll make sure to keep you updated as we reach each milestone. Your feedback has been invaluable.",
      timestamp: "2:30 PM",
      status: "delivered",
      type: "text",
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.05,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: easeOut },
    },
  }

  const messageVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.4, ease: easeOut },
    },
  }

  const sidebarVariants = {
    expanded: { width: 320 },
    collapsed: { width: 80 },
  }

  // Backend integration functions
  const handleSendMessage = async () => {
    if (!message.trim()) return
    console.log("Sending message:", message)
    setMessage("")
  }

  const handleFileUpload = async (file) => {
    console.log("Uploading file:", file)
  }

  const handleTyping = () => {
    setIsTyping(true)
    setTimeout(() => setIsTyping(false), 1000)
  }

  const handleVoiceRecord = () => {
    setIsRecording(!isRecording)
    // TODO: Integrate voice recording
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const selectedConv = conversations.find((c) => c.id === selectedConversation)
  const otherParticipant = selectedConv?.participants.find((p) => p.id !== currentUser.id)

  return (
    <div className="w-full h-screen bg-gradient-to-br from-black via-gray-900 to-black flex overflow-hidden">
      {/* Enhanced Sidebar */}
      <motion.div
        variants={sidebarVariants}
        animate={sidebarCollapsed ? "collapsed" : "expanded"}
        transition={{ duration: 0.3, ease: easeOut }}
        className="bg-gradient-to-b from-[#2A2A2A] to-[#1A1A1A] border-r border-white/5 flex flex-col backdrop-blur-xl"
      >
        {/* Enhanced Header */}
        <motion.div variants={itemVariants} className="p-6 border-b border-white/5">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img
                  src={currentUser.avatar || "/placeholder.svg"}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/20"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#2A2A2A]" />
              </div>
              {!sidebarCollapsed && (
                <div>
                  <h2 className="text-white font-semibold text-sm">Messages</h2>
                  <p className="text-gray-400 text-xs">{currentUser.status}</p>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-1">
              <motion.button
                whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.1)" }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-full text-gray-400 hover:text-white transition-colors"
              >
                <Plus className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.1)" }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 rounded-full text-gray-400 hover:text-white transition-colors"
              >
                <Settings className="w-4 h-4" />
              </motion.button>
            </div>
          </div>

          {!sidebarCollapsed && (
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full bg-black/30 border border-white/20 rounded-2xl pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 focus:bg-black/50 transition-all backdrop-blur-sm"
              />
            </div>
          )}
        </motion.div>

        {/* Enhanced Conversations List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {conversations.map((conversation, index) => {
            const otherUser = conversation.participants.find((p) => p.id !== currentUser.id)
            const isSelected = selectedConversation === conversation.id
            return (
              <motion.div
                key={conversation.id}
                variants={itemVariants}
                custom={index}
                onClick={() => setSelectedConversation(conversation.id)}
                whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                className={`relative p-4 cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-r-2 border-blue-500"
                    : "hover:bg-white/5"
                } ${conversation.isPinned ? "border-l-2 border-yellow-500/50" : ""}`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative flex-shrink-0">
                    <img
                      src={otherUser?.avatar || "/placeholder.svg"}
                      alt={otherUser?.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-white/10"
                    />
                    <div
                      className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#2A2A2A] ${
                        otherUser?.isOnline ? "bg-green-500" : "bg-gray-500"
                      }`}
                    />
                  </div>

                  {!sidebarCollapsed && (
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-white font-medium truncate text-sm">{otherUser?.name}</h3>
                          {conversation.isPinned && <Pin className="w-3 h-3 text-yellow-500" />}
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-gray-400 text-xs">{conversation.lastMessage?.timestamp}</span>
                          {conversation.unreadCount > 0 && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs rounded-full px-2 py-1 min-w-[18px] text-center font-medium shadow-lg"
                            >
                              {conversation.unreadCount}
                            </motion.span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-gray-400 text-xs truncate pr-2 leading-relaxed">
                          {conversation.lastMessage?.content}
                        </p>
                        <div className="flex items-center space-x-1">
                          {conversation.lastMessage?.isStarred && <Star className="w-3 h-3 text-yellow-500" />}
                          {conversation.lastMessage?.senderId === currentUser.id && (
                            <div className="text-gray-400">
                              {conversation.lastMessage?.status === "sent" && <Check className="w-3 h-3" />}
                              {conversation.lastMessage?.status === "delivered" && <CheckCheck className="w-3 h-3" />}
                              {conversation.lastMessage?.status === "read" && (
                                <CheckCheck className="w-3 h-3 text-blue-400" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-500 text-xs mt-1">{otherUser?.status}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Enhanced Main Chat Area */}
      <div className="flex-1 flex flex-col bg-gradient-to-b from-gray-900/50 to-black/50 backdrop-blur-sm">
        {selectedConversation ? (
          <>
            {/* Enhanced Chat Header */}
            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-r from-[#2A2A2A]/80 to-[#1A1A1A]/80 backdrop-blur-xl border-b border-white/5 p-6 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button className="lg:hidden text-white p-2 hover:bg-white/10 rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="relative">
                    <img
                      src={otherParticipant?.avatar || "/placeholder.svg"}
                      alt={otherParticipant?.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-white/20"
                    />
                    <div
                      className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#2A2A2A] ${
                        otherParticipant?.isOnline ? "bg-green-500" : "bg-gray-500"
                      }`}
                    />
                  </div>
                  <div>
                    <h2 className="text-white font-semibold text-lg">{otherParticipant?.name}</h2>
                    <p className="text-gray-400 text-sm flex items-center space-x-2">
                      <span>{otherParticipant?.isOnline ? "Online" : `Last seen ${otherParticipant?.lastSeen}`}</span>
                      {otherParticipant?.status && (
                        <>
                          <span>•</span>
                          <span>{otherParticipant.status}</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {[
                    { icon: Phone, label: "Voice call" },
                    { icon: Video, label: "Video call" },
                    { icon: Info, label: "Info" },
                    { icon: MoreVertical, label: "More" },
                  ].map(({ icon: Icon, label }, index) => (
                    <motion.button
                      key={label}
                      whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.1)" }}
                      whileTap={{ scale: 0.9 }}
                      className="p-3 text-gray-400 hover:text-white transition-colors rounded-full"
                      title={label}
                    >
                      <Icon className="w-5 h-5" />
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Enhanced Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              <AnimatePresence>
                {messages.map((msg, index) => {
                  const isOwn = msg.senderId === currentUser.id
                  const showAvatar = index === 0 || messages[index - 1].senderId !== msg.senderId
                  return (
                    <motion.div
                      key={msg.id}
                      variants={messageVariants}
                      initial="hidden"
                      animate="visible"
                      className={`flex items-end space-x-3 ${isOwn ? "justify-end" : "justify-start"}`}
                    >
                      {!isOwn && (
                        <div className="w-8 h-8 flex-shrink-0">
                          {showAvatar && (
                            <img
                              src={otherParticipant?.avatar || "/placeholder.svg"}
                              alt={otherParticipant?.name}
                              className="w-8 h-8 rounded-full object-cover ring-2 ring-white/10"
                            />
                          )}
                        </div>
                      )}
                      <div className={`max-w-xs lg:max-w-md ${isOwn ? "order-2" : "order-1"}`}>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className={`relative rounded-2xl px-4 py-3 shadow-lg ${
                            isOwn
                              ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md"
                              : "bg-gradient-to-r from-[#3A3A3A] to-[#2A2A2A] text-white rounded-bl-md border border-white/10"
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{msg.content}</p>
                          {msg.isStarred && (
                            <Star className="absolute -top-2 -right-2 w-4 h-4 text-yellow-500 fill-current" />
                          )}
                        </motion.div>
                        <div className={`flex items-center mt-2 space-x-2 ${isOwn ? "justify-end" : "justify-start"}`}>
                          <span className="text-gray-400 text-xs">{msg.timestamp}</span>
                          {isOwn && (
                            <div className="text-gray-400">
                              {msg.status === "sent" && <Check className="w-3 h-3" />}
                              {msg.status === "delivered" && <CheckCheck className="w-3 h-3" />}
                              {msg.status === "read" && <CheckCheck className="w-3 h-3 text-blue-400" />}
                            </div>
                          )}
                        </div>
                      </div>
                      {isOwn && <div className="w-8 h-8 flex-shrink-0" />}
                    </motion.div>
                  )
                })}
              </AnimatePresence>

              {/* Enhanced Typing Indicator */}
              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.8 }}
                    className="flex items-end space-x-3"
                  >
                    <img
                      src={otherParticipant?.avatar || "/placeholder.svg"}
                      alt={otherParticipant?.name}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-white/10"
                    />
                    <div className="bg-gradient-to-r from-[#3A3A3A] to-[#2A2A2A] rounded-2xl rounded-bl-md px-4 py-3 border border-white/10">
                      <div className="flex space-x-1">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-2 h-2 bg-gray-400 rounded-full"
                            animate={{ y: [0, -8, 0] }}
                            transition={{
                              duration: 1.4,
                              repeat: Number.POSITIVE_INFINITY,
                              delay: i * 0.2,
                              ease: "easeInOut",
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Enhanced Message Input */}
            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-r from-[#2A2A2A]/80 to-[#1A1A1A]/80 backdrop-blur-xl border-t border-white/5 p-6"
            >
              <div className="flex items-end space-x-4">
                <div className="flex space-x-2">
                  {[
                    { icon: Paperclip, action: () => document.getElementById("file-upload")?.click() },
                    { icon: ImageIcon, action: () => document.getElementById("image-upload")?.click() },
                  ].map(({ icon: Icon, action }, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.1)" }}
                      whileTap={{ scale: 0.9 }}
                      onClick={action}
                      className="p-3 text-gray-400 hover:text-white transition-colors rounded-full"
                    >
                      <Icon className="w-5 h-5" />
                    </motion.button>
                  ))}
                </div>

                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                />
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                />

                <div className="flex-1 relative">
                  <textarea
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value)
                      handleTyping()
                    }}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    placeholder="Type your message..."
                    rows={1}
                    className="w-full bg-black/30 border border-white/20 rounded-2xl px-6 py-4 pr-16 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 focus:bg-black/50 transition-all resize-none backdrop-blur-sm"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <Smile className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleVoiceRecord}
                    disabled={!message.trim()}
                    className={`p-3 rounded-full transition-all ${
                      isRecording
                        ? "bg-red-500 text-white"
                        : "bg-white/10 text-gray-400 hover:text-white hover:bg-white/20"
                    }`}
                  >
                    <Mic className="w-5 h-5" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed rounded-full p-3 transition-all shadow-lg"
                  >
                    <Send className="w-5 h-5 text-white" />
                  </motion.button>
                </div>
              </div>

              {/* Enhanced Emoji Picker */}
              <AnimatePresence>
                {showEmojiPicker && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.9 }}
                    className="absolute bottom-24 right-6 bg-gradient-to-br from-[#2A2A2A] to-[#1A1A1A] border border-white/20 rounded-2xl p-6 shadow-2xl backdrop-blur-xl"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-medium">Emoji Picker</h3>
                      <button
                        onClick={() => setShowEmojiPicker(false)}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-gray-400 text-sm">Integration point for emoji library</p>
                    <p className="text-gray-500 text-xs mt-1">Connect your preferred emoji picker here</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex-1 flex items-center justify-center"
          >
            <div className="text-center">
              <motion.div
                variants={itemVariants}
                className="w-32 h-32 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mb-6 mx-auto backdrop-blur-sm border border-white/10"
              >
                <MoveRight className="w-12 h-12 text-gray-400" />
              </motion.div>
              <motion.h2 variants={itemVariants} className="text-white text-2xl font-light mb-3">
                Select a conversation
              </motion.h2>
              <motion.p variants={itemVariants} className="text-gray-400 max-w-md">
                Choose a conversation from the sidebar to start messaging, or create a new conversation to connect with
                your team.
              </motion.p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
