"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from "lucide-react"
import { cn } from "@/lib/utils"
import { chatAPI } from "@/lib/api"
import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query"

interface Message {
  _id: string
  text: string
  user: {
    _id: string
    fullName: string
    role: string
    avatar?: string
  }
  date: string
  read: boolean
}

interface Chat {
  _id: string
  user?: {
    _id: string
    fullName: string
    avatar?: string
  }
  seller?: {
    _id: string
    fullName: string
    avatar?: string
  }
  messages: Message[]
}

interface ChatWindowProps {
  chat: Chat | null
  currentUserId: string
  currentUserRole: string
  onNewMessage?: (message: Message) => void
}

export function ChatWindow({ chat, currentUserId, currentUserRole, onNewMessage }: ChatWindowProps) {
  const [message, setMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()

  const sendMessageMutation = useMutation({
    mutationFn: ({ chatId, message }: { chatId: string; message: string }) => chatAPI.sendMessage(chatId, message),
    onSuccess: (response) => {
      setMessage("")
      queryClient.invalidateQueries({ queryKey: ["chats"] })
      queryClient.invalidateQueries({ queryKey: ["chat", chat?._id] })
      toast.success("Message sent successfully")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to send message")
    },
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chat?.messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || !chat) return

    sendMessageMutation.mutate({
      chatId: chat._id,
      message: message.trim(),
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Select a conversation to start messaging</p>
        </div>
      </div>
    )
  }

  const otherUser = currentUserRole === "seller" ? chat.user : chat.seller

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Chat Header */}
      <div className="p-4 border-b bg-white">
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={otherUser?.avatar || "/placeholder.svg?height=40&width=40"} />
            <AvatarFallback>
              {otherUser?.fullName
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium text-gray-900">{otherUser?.fullName || "Unknown User"}</h3>
            <p className="text-sm text-gray-500">Green Valley Farm, Sacramento, CA 95814</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chat.messages.map((msg) => {
          const isCurrentUser = msg.user._id === currentUserId

          return (
            <div
              key={msg._id}
              className={cn("flex items-start space-x-3", isCurrentUser && "flex-row-reverse space-x-reverse")}
            >
              <Avatar className="w-8 h-8">
                <AvatarImage src={msg.user.avatar || "/placeholder.svg?height=32&width=32"} />
                <AvatarFallback>
                  {msg.user.fullName
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className={cn("flex flex-col", isCurrentUser && "items-end")}>
                <div
                  className={cn(
                    "max-w-xs lg:max-w-md px-4 py-2 rounded-lg",
                    isCurrentUser ? "bg-green-600 text-white" : "bg-gray-100 text-gray-900",
                  )}
                >
                  <p className="text-sm">{msg.text}</p>
                </div>
                <span className="text-xs text-gray-500 mt-1">{formatTime(msg.date)}</span>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t bg-white">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <div className="flex-1">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message"
              disabled={sendMessageMutation.isPending}
              className="w-full"
            />
          </div>
          <Button
            type="submit"
            disabled={!message.trim() || sendMessageMutation.isPending}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
