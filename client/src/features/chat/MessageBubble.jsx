"use client"

import { motion } from "framer-motion"
import { Check, CheckCheck, Star } from "lucide-react"

const MessageBubble = ({
  message = "Hello! This is a sample message.",
  isOwn = false,
  timestamp = "2:30 PM",
  status = "read",
  isStarred = false,
  senderAvatar = "/placeholder.svg?height=32&width=32",
  showAvatar = true,
}) => {
  const messageVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  }

  return (
    <motion.div
      variants={messageVariants}
      initial="hidden"
      animate="visible"
      className={`flex items-end space-x-3 ${isOwn ? "justify-end" : "justify-start"}`}
    >
      {/* Avatar for received messages */}
      {!isOwn && (
        <div className="w-8 h-8 flex-shrink-0">
          {showAvatar && (
            <img
              src={senderAvatar || "/placeholder.svg"}
              alt="Sender"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-white/10"
            />
          )}
        </div>
      )}

      {/* Message Content */}
      <div className={`max-w-xs lg:max-w-md ${isOwn ? "order-2" : "order-1"}`}>
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`relative rounded-2xl px-4 py-3 shadow-lg ${
            isOwn
              ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md"
              : "bg-gradient-to-r from-[#3A3A3A] to-[#2A2A2A] text-white rounded-bl-md border border-white/10"
          }`}
        >
          <p className="text-sm leading-relaxed">{message}</p>

          {/* Star indicator */}
          {isStarred && <Star className="absolute -top-2 -right-2 w-4 h-4 text-yellow-500 fill-current" />}
        </motion.div>

        {/* Timestamp and status */}
        <div className={`flex items-center mt-2 space-x-2 ${isOwn ? "justify-end" : "justify-start"}`}>
          <span className="text-gray-400 text-xs">{timestamp}</span>
          {isOwn && (
            <div className="text-gray-400">
              {status === "sent" && <Check className="w-3 h-3" />}
              {status === "delivered" && <CheckCheck className="w-3 h-3" />}
              {status === "read" && <CheckCheck className="w-3 h-3 text-blue-400" />}
            </div>
          )}
        </div>
      </div>

      {/* Spacer for sent messages */}
      {isOwn && <div className="w-8 h-8 flex-shrink-0" />}
    </motion.div>
  )
}

export default MessageBubble
